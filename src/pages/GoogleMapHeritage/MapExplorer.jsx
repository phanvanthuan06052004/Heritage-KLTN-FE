import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'react-toastify';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './MapExplorer.css';
import RoutePlayback from './RoutePlayback';
import ExploreOnboarding from './ExploreOnboarding';
import {
  API, FEATURED_PER_PROVINCE, PROV_COORDS, CAT_STYLE, CAT_LABELS,
  formatPrice, scorePercent, siteRank, stars, reviewUrl,
  formatDescriptionBlocks, normalizeText, hasNormalized, markerElement,
  parseOpeningHours, toPlannerSite, optionalNumber, formatApiError,
  detailedAddress, useProvinceCenter, decodePolyline, buildRecommendPayload,
} from './mapUtils';

function App() {
  const { t } = useTranslation();
  const catLabel = useCallback((c) => t(`explore.categories.${c}`, { defaultValue: CAT_LABELS[c] || c }), [t]);
  const mapRef = useRef(null);
  const mapNodeRef = useRef(null);
  const markersRef = useRef([]);
  const routeMarkersRef = useRef([]);
  const routeLayerIdsRef = useRef([]);
  const skipFitRef = useRef(false);
  const hoverClearTimerRef = useRef(null);
  const hoverIntentTimerRef = useRef(null);
  const popupRef = useRef(null);
  const popupHoverRef = useRef(false);
  const [sites, setSites] = useState([]);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [selectedProvinces, setSelectedProvinces] = useState(() => new Set());
  const [selectedCategories, setSelectedCategories] = useState(() => new Set());
  const [activeSite, setActiveSite] = useState(null);
  const [hoverSite, setHoverSite] = useState(null);
  const [detailSite, setDetailSite] = useState(null);
  const [popupPos, setPopupPos] = useState(null);
  const [query, setQuery] = useState('');
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [pickingMapFor, setPickingMapFor] = useState(null);
  const [step, setStep] = useState(1);
  const [planner, setPlanner] = useState({ days: 3, people: 2, tripDate: new Date().toISOString().slice(0, 10), windowStart: '08:00', windowEnd: '18:00', startText: '', endText: '' });
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [route, setRoute] = useState(null);
  const [status, setStatus] = useState({ type: 'info', key: 'explore.ui.initialStatus' });
  const [loading, setLoading] = useState(false);
  const [sitesLoading, setSitesLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [minimizedPlanner, setMinimizedPlanner] = useState(false);

  const provinces = useMemo(() => [...new Set(sites.map(s => s.province).filter(Boolean))].sort(), [sites]);
  const categories = useMemo(() => [...new Set(sites.flatMap(site => site.categories?.length ? site.categories : ['default']))].sort((a, b) => catLabel(a).localeCompare(catLabel(b))), [sites, catLabel]);
  const featuredSites = useMemo(() => {
    const byProvince = new Map();
    sites.forEach(site => {
      if (!site.province) return;
      const list = byProvince.get(site.province) || [];
      list.push(site);
      byProvince.set(site.province, list);
    });
    return [...byProvince.values()].flatMap(list => list
      .sort((a, b) => siteRank(b) - siteRank(a))
      .slice(0, FEATURED_PER_PROVINCE));
  }, [sites]);
  const searchSuggestions = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return [];
    const siteMatches = sites.filter(site => site.name.toLowerCase().includes(text) || site.province.toLowerCase().includes(text)).slice(0, 6).map(site => ({ type: 'site', id: site.id, label: site.name, sub: site.province, site }));
    const provinceMatches = provinces.filter(province => province.toLowerCase().includes(text)).slice(0, 3).map(province => ({ type: 'province', id: province, label: province, sub: t('explore.ui.provinceSub') }));
    return [...siteMatches, ...provinceMatches].slice(0, 8);
  }, [provinces, query, sites, t]);
  const filteredSites = useMemo(() => {
    const source = selectedProvinces.size ? sites : featuredSites;
    return source.filter(site => {
      const siteCategories = site.categories?.length ? site.categories : ['default'];
      return (selectedProvinces.size === 0 || hasNormalized(selectedProvinces, site.province)) &&
        (selectedCategories.size === 0 || siteCategories.some(cat => selectedCategories.has(cat)));
    });
  }, [featuredSites, selectedCategories, selectedProvinces, sites]);
  const selectedSites = useMemo(() => [...selectedIds].map(id => sites.find(site => site.id === id)).filter(Boolean), [selectedIds, sites]);
  const popupSite = hoverSite || activeSite;

  useEffect(() => { setSitesLoading(true); fetch(`${API}/heritage-sites`).then(r => r.json()).then(d => setSites(Array.isArray(d) ? d : [])).catch(e => setStatus({ type: 'error', key: 'explore.ui.loadError', params: { message: e.message } })).finally(() => setSitesLoading(false)); }, []);
  useEffect(() => { skipFitRef.current = true; }, [query]);
  useEffect(() => {
    if (mapRef.current || !mapNodeRef.current) return;
    mapRef.current = new maplibregl.Map({ container: mapNodeRef.current, style: { version: 8, sources: { osm: { type: 'raster', tiles: ['https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'], tileSize: 256, attribution: '© CARTO | © OSM' } }, layers: [{ id: 'osm', type: 'raster', source: 'osm' }] }, center: [105.8542, 21.0285], zoom: 6 });
    mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-right');
  }, []);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    // Always remove old markers first
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    // When route is active, only show route markers (drawn in drawRoute)
    if (route) return;
    const bounds = new maplibregl.LngLatBounds();
    filteredSites.forEach(site => {
      if (!Number.isFinite(site.lat) || !Number.isFinite(site.lng)) return;
      const marker = new maplibregl.Marker({ element: markerElement(site, selectedIds.has(site.id)) }).setLngLat([site.lng, site.lat]).addTo(map);
      bindMarker(marker, site, () => focusSite(site));
      markersRef.current.push(marker);
      bounds.extend([site.lng, site.lat]);
    });
    if (!bounds.isEmpty() && !skipFitRef.current) map.fitBounds(bounds, { padding: 80, maxZoom: 12 });
    skipFitRef.current = false;
  }, [filteredSites, selectedIds, route]);

  useEffect(() => {
    clearRouteOverlay();
    setRoute(null);
  }, [selectedCategories, selectedProvinces]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (pickingMapFor) {
      map.getCanvas().style.cursor = 'crosshair';
    } else {
      map.getCanvas().style.cursor = '';
    }

    function onMapClick(e) {
      const lat = e.lngLat.lat;
      const lng = e.lngLat.lng;

      if (pickingMapFor) {
        const currentPick = pickingMapFor;
        setActionLoading(`map-${currentPick}`);
        reverseGeocode(lat, lng).then(label => {
          const point = { lat, lng, label };
          if (currentPick === 'start') {
            setStartPoint(point);
            setPlanner(p => ({ ...p, startText: label }));
          } else {
            setEndPoint(point);
            setPlanner(p => ({ ...p, endText: label }));
          }
          setPickingMapFor(null);
          setPlannerOpen(true);
        }).finally(() => setActionLoading(null));
      } else {
        const url = new URL(window.location);
        url.searchParams.set('lat', lat.toFixed(5));
        url.searchParams.set('lng', lng.toFixed(5));
        window.history.replaceState({}, '', url);
      }
    }
    map.on('click', onMapClick);
    return () => { map.off('click', onMapClick); map.getCanvas().style.cursor = ''; };
  }, [pickingMapFor]);

  function toggleProvince(province) {
    const isFirstAdd = !selectedProvinces.size && !selectedProvinces.has(province);
    setSelectedProvinces(current => {
      const next = new Set(current);
      if (next.has(province)) {
        next.delete(province);
        setSelectedIds(ids => {
          const nextIds = new Set(ids);
          [...ids].forEach(id => {
            const site = sites.find(s => s.id === id);
            if (site && hasNormalized(new Set([province]), site.province)) nextIds.delete(id);
          });
          return nextIds;
        });
      } else {
        next.add(province);
      }
      return next;
    });
    if (isFirstAdd) {
      geocode(province).then(point => {
        if (point) {
          setStartPoint(point);
          setEndPoint(point);
          setPlanner(value => ({ ...value, startText: point.label, endText: point.label }));
        }
      });
    }
  }
  function toggleSelected(id) { setSelectedIds(current => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next; }); }
  function toggleCategory(category) { setSelectedCategories(current => { const next = new Set(current); next.has(category) ? next.delete(category) : next.add(category); return next; }); }
  function bindMarker(marker, site, click) {
    const element = marker.getElement();
    element.addEventListener('click', click);
    element.addEventListener('mouseenter', () => {
      clearTimeout(hoverClearTimerRef.current);
      clearTimeout(hoverIntentTimerRef.current);
      if (popupHoverRef.current) return;
      hoverIntentTimerRef.current = setTimeout(() => setHoverSite(site), 140);
    });
    element.addEventListener('mouseleave', () => {
      clearTimeout(hoverIntentTimerRef.current);
      clearTimeout(hoverClearTimerRef.current);
      hoverClearTimerRef.current = setTimeout(() => {
        if (!popupHoverRef.current) setHoverSite(current => current?.id === site.id ? null : current);
      }, 260);
    });
  }
  function focusSite(site) {
    skipFitRef.current = true;
    if (!route) setSelectedProvinces(new Set([site.province]));
    setActiveSite(site);
    const map = mapRef.current;
    if (map && Number.isFinite(site.lng) && Number.isFinite(site.lat)) {
      const point = map.project([site.lng, site.lat]);
      setPopupPos({ x: point.x, y: point.y });
      map.easeTo({ center: [site.lng, site.lat], zoom: Math.max(map.getZoom(), 9.5), duration: 650, essential: true });
    }
  }
  function closeSitePopup() {
    setActiveSite(null);
    setHoverSite(null);
    setPopupPos(null);
  }
  function resetMapFocus() {
    skipFitRef.current = true;
    setSelectedProvinces(new Set());
    setActiveSite(null);
    setHoverSite(null);
    setPopupPos(null);
    mapRef.current?.easeTo({ center: [106.2, 16.2], zoom: 5.4, duration: 650, essential: true });
  }
  function chooseSuggestion(item) {
    if (item.type === 'site') {
      setQuery(item.label);
      focusSite(item.site);
      return;
    }
    setQuery(item.label);
    setSelectedProvinces(new Set([item.label]));
    setActiveSite(null);
    setPopupPos(null);
    const coords = PROV_COORDS[item.label];
    if (coords && mapRef.current) mapRef.current.easeTo({ center: [coords[1], coords[0]], zoom: 8, duration: 650, essential: true });
  }
  async function geocode(text) {
    const raw = text.trim();
    const pair = raw.match(/^(-?\d+\.?\d*)[,;]\s*(-?\d+\.?\d*)$/);
    if (pair) return { lat: Number(pair[1]), lng: Number(pair[2]), label: raw };
    if (!raw) return null;
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(`${raw} Vietnam`)}&format=json&limit=1&countrycodes=vn`);
    const data = await response.json();
    return data?.length ? { lat: Number(data[0].lat), lng: Number(data[0].lon), label: data[0].display_name } : null;
  }
  async function reverseGeocode(lat, lng) {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&accept-language=vi&zoom=18&addressdetails=1&namedetails=1`);
      const data = await response.json();
      return detailedAddress(data) || data?.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  }
  function getBrowserLocation(kind) {
    if (!navigator.geolocation) {
      toast.error(t('explore.status.geoUnsupported'));
      setStatus({ type: 'error', key: 'explore.status.geoUnsupported' });
      return;
    }
    const request = () => {
      setActionLoading(`geo-${kind}`);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const baseLabel = await reverseGeocode(latitude, longitude);
          const label = `${baseLabel} (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`;
          const point = { lat: latitude, lng: longitude, label };
          if (kind === 'start') {
            setStartPoint(point);
            setPlanner(p => ({ ...p, startText: point.label }));
            setStatus({ type: 'info', key: 'explore.status.startPosition', params: { label: point.label } });
          } else {
            setEndPoint(point);
            setPlanner(p => ({ ...p, endText: point.label }));
            setStatus({ type: 'info', key: 'explore.status.endPosition', params: { label: point.label } });
          }
          setActionLoading(null);
        },
        (err) => {
          setActionLoading(null);
          let key = 'explore.status.geoFailed';
          if (err.code === err.PERMISSION_DENIED) {
            key = 'explore.status.geoDenied';
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            key = 'explore.status.geoUnavailable';
          } else if (err.code === err.TIMEOUT) {
            key = 'explore.status.geoTimeout';
          }
          toast.error(t(key));
          setStatus({ type: 'error', key });
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    };
    if (navigator.permissions?.query) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        if (result.state === 'denied') {
          toast.error(t('explore.status.geoBlocked'));
          setStatus({ type: 'error', key: 'explore.status.geoBlocked' });
          return;
        }
        request();
      }).catch(request);
    } else {
      request();
    }
  }
  function pickLocation(kind) {
    startPickingMap(kind);
  }
  function startPickingMap(kind) {
    setPickingMapFor(kind);
    setPlannerOpen(false);
    setStatus({ type: 'info', key: 'explore.status.clickOnMap' });
  }
  async function updatePoint(kind, textOverride = null) {
    const text = textOverride ?? (kind === 'start' ? planner.startText : planner.endText);
    setActionLoading(`point-${kind}`);
    try {
      const point = await geocode(text);
      if (!point) { setStatus({ type: 'error', key: kind === 'start' ? 'explore.status.startNotFound' : 'explore.status.endNotFound' }); return; }
      if (kind === 'start') {
        setStartPoint(point);
        setPlanner(p => ({ ...p, startText: point.label }));
      } else {
        setEndPoint(point);
        setPlanner(p => ({ ...p, endText: point.label }));
      }
      setStatus({ type: 'info', key: kind === 'start' ? 'explore.status.startShort' : 'explore.status.endShort', params: { label: point.label } });
    } finally {
      setActionLoading(null);
    }
  }
  function selectPoint(kind, point) {
    if (kind === 'start') {
      setStartPoint(point);
      setPlanner(value => ({ ...value, startText: point.label }));
      setStatus({ type: 'info', key: 'explore.status.startPoint', params: { label: point.label } });
      return;
    }
    setEndPoint(point);
    setPlanner(value => ({ ...value, endText: point.label }));
    setStatus({ type: 'info', key: 'explore.status.endPoint', params: { label: point.label } });
  }
  async function recommendRoute() {
    setLoading(true); setActionLoading('route'); setRoute(null);
    const body = buildRecommendPayload(planner, {
      selectedProvinces: [...selectedProvinces],
      selectedSites,
      startPoint,
      endPoint,
    });
    try {
      const response = await fetch(`${API}/trips/recommend`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(formatApiError(data));
      const mappedRoute = {
        status: 'feasible',
        total_distance_km: data.total_distance_km,
        total_duration_min: (data.days || []).reduce((acc, day) => {
          return acc + (day.items || []).reduce((a, item) => {
            let visit = 60;
            if (item.time && item.time.includes('-')) {
              const parts = item.time.split('-');
              const [h1, m1] = parts[0].split(':').map(Number);
              const [h2, m2] = parts[1].split(':').map(Number);
              if (!isNaN(h1) && !isNaN(h2)) {
                visit = (h2 * 60 + (m2 || 0)) - (h1 * 60 + (m1 || 0));
                if (visit < 0) visit += 24 * 60;
              }
            }
            return a + (item.travel_from_previous_minutes || 0) + visit;
          }, 0);
        }, 0),
        summary: data.summary,
        warnings: data.warnings || [],
        days: (data.days || []).map((d, i) => ({
          day: d.day,
          coordinates: data.route_geometries?.[i] || [],
          stops: (d.items || []).map(item => ({
            site_id: item.ref_id,
            name: item.name,
            arrival_time: (item.time || '').split('-')[0] || '',
            travel_from_prev_km: (item.distance_from_previous_m || 0) / 1000,
            travel_from_prev_min: item.travel_from_previous_minutes || 0,
            reason: item.reason || t('explore.route.defaultReason')
          }))
        }))
      };
      setRoute(mappedRoute); drawRoute(mappedRoute); setPlannerOpen(false);
      setStatus({ type: 'success', key: 'explore.status.routeSuccess' });
    } catch (error) { setStatus({ type: 'error', text: error.message || t('explore.status.routeFailed') }); }
    finally { setLoading(false); setActionLoading(null); }
  }

  async function planRoute() {
    if (!selectedProvinces.size) { setStatus({ type: 'error', key: 'explore.status.selectProvinceFirst' }); setStep(1); return; }
    

    // Always use AI recommendation first for rich results
    await recommendRoute();
  }
  function drawRoute(data) {
    const map = mapRef.current; if (!map) return;
    clearRouteOverlay();
    const bounds = new maplibregl.LngLatBounds();
    data.days?.forEach((day, index) => {
      const coords = day.coordinates?.length ? day.coordinates : (day.polyline ? decodePolyline(day.polyline) : []);
      if (coords.length > 1) { const id = `route-${index}`; map.addSource(id, { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: coords } } }); map.addLayer({ id, type: 'line', source: id, layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': ['#6f1714', '#b88935', '#6f3f20'][index % 3], 'line-width': 5, 'line-opacity': .86 } }); routeLayerIdsRef.current.push(id); coords.forEach(c => bounds.extend(c)); }
      day.stops?.forEach(stop => { const site = sites.find(item => item.id === stop.site_id); if (!site) return; const marker = new maplibregl.Marker({ element: markerElement(site, true) }).setLngLat([site.lng, site.lat]).addTo(map); bindMarker(marker, site, () => setActiveSite(site)); routeMarkersRef.current.push(marker); bounds.extend([site.lng, site.lat]); });
    });
    if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 100, maxZoom: 13 });
  }
  function clearRouteOverlay() {
    const map = mapRef.current;
    if (map) routeLayerIdsRef.current.forEach(id => { if (map.getLayer(id)) map.removeLayer(id); if (map.getSource(id)) map.removeSource(id); });
    routeLayerIdsRef.current = [];
    routeMarkersRef.current.forEach(marker => marker.remove());
    routeMarkersRef.current = [];
  }
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !popupSite) { setPopupPos(null); return; }

    function updatePopupPos() {
      if (!mapRef.current || !popupSite) return;
      const point = map.project([popupSite.lng, popupSite.lat]);
      setPopupPos({ x: point.x, y: point.y });
    }

    updatePopupPos();

    map.on('move', updatePopupPos);
    map.on('zoom', updatePopupPos);
    map.on('moveend', updatePopupPos);
    map.on('zoomend', updatePopupPos);
    map.on('rotate', updatePopupPos);
    return () => {
      map.off('move', updatePopupPos);
      map.off('zoom', updatePopupPos);
      map.off('moveend', updatePopupPos);
      map.off('zoomend', updatePopupPos);
      map.off('rotate', updatePopupPos);
    };
  }, [popupSite]);

  return <div className="heritage-map-page map-first-shell">
    <main className="map-wrap"><div ref={mapNodeRef} className="map" /></main>
    <SearchBox query={query} setQuery={setQuery} suggestions={searchSuggestions} choose={chooseSuggestion} placeholder={t('explore.ui.mapSearchPlaceholder')} />
    <div className="top-left-stack">
      <button className="create-trip-btn" onClick={() => { setMinimizedPlanner(false); setPlannerOpen(true); }} disabled={sitesLoading || loading}><span>{sitesLoading ? <Spinner /> : '印'}</span>{sitesLoading ? t('explore.ui.openingMap') : t('explore.ui.createTrip')}</button>
      <StatusBanner status={status} t={t} />
    </div>
    {selectedProvinces.size > 0 && <button className="reset-map-btn" onClick={resetMapFocus}>{t('explore.ui.resetZoom')}</button>}
    <CategoryFilters categories={categories} selected={selectedCategories} toggle={toggleCategory} clear={() => setSelectedCategories(new Set())} loading={sitesLoading} t={t} catLabel={catLabel} />
    {(sitesLoading || loading || actionLoading?.startsWith('map-')) && <MapLoadingOverlay text={sitesLoading ? t('explore.ui.loadingMapData') : actionLoading?.startsWith('map-') ? t('explore.ui.identifyingCoords') : t('explore.ui.buildingRoute')} subtitle={t('explore.ui.preparingMaterials')} />}

    {!plannerOpen && !pickingMapFor && !route && selectedSites.length === 0 && (
      <button className="floating-return-btn" onClick={() => setPlannerOpen(true)}>
        {t('explore.ui.backToItinerary')}
      </button>
    )}

    {selectedSites.length > 0 && !plannerOpen && (
      <div className="selected-sites-bar"><span>{t('explore.ui.selectedPoints', { count: selectedSites.length })}</span><button onClick={() => { setMinimizedPlanner(false); setPlannerOpen(true); }}>{t('explore.ui.continueItinerary')}</button></div>
    )}

    <PlannerDialogV3 open={plannerOpen} setOpen={setPlannerOpen} step={step} setStep={setStep} sites={sites} provinces={provinces} selectedProvinces={selectedProvinces} toggleProvince={toggleProvince} selectedSites={selectedSites} toggleSelected={toggleSelected} setActiveSite={setActiveSite} planner={planner} setPlanner={setPlanner} selectPoint={selectPoint} useCenter={() => useProvinceCenter(selectedProvinces, setStartPoint, setEndPoint, setPlanner)} makeRoundTrip={() => { if (!startPoint) { setStatus({ type: 'error', key: 'explore.status.selectStartFirst' }); return; } setEndPoint(startPoint); setPlanner(v => ({ ...v, endText: v.startText || `${startPoint.lat}, ${startPoint.lng}` })); }} loading={loading} actionLoading={actionLoading} sitesLoading={sitesLoading} planRoute={planRoute} pickLocation={pickLocation} getBrowserLocation={getBrowserLocation} startPickingMap={startPickingMap} minimizedPlanner={minimizedPlanner} setMinimizedPlanner={setMinimizedPlanner} geocodeStart={() => updatePoint('start')} geocodeEnd={() => updatePoint('end')} startPoint={startPoint} endPoint={endPoint} />
    {route && <RouteSummary route={route} openPlanner={() => setPlannerOpen(true)} focus={id => { const site = sites.find(item => item.id === id); if (site) focusSite(site); }} t={t} />}
    {route && <RoutePlayback route={route} map={mapRef.current} sites={sites} />}
    {popupSite && popupPos && <MiniSitePopup site={popupSite} pos={popupPos} popupRef={popupRef} selected={selectedIds.has(popupSite.id)} toggle={() => toggleSelected(popupSite.id)} detail={() => setDetailSite(popupSite)} close={closeSitePopup} t={t} catLabel={catLabel} keepHover={() => { popupHoverRef.current = true; clearTimeout(hoverClearTimerRef.current); clearTimeout(hoverIntentTimerRef.current); }} endHover={() => { popupHoverRef.current = false; setHoverSite(null); }} />}
    <SiteDetailDialog site={detailSite} selected={detailSite ? selectedIds.has(detailSite.id) : false} toggle={() => detailSite && toggleSelected(detailSite.id)} close={() => setDetailSite(null)} t={t} catLabel={catLabel} />
    <ExploreOnboarding />
  </div>;
}

function LocationSearchInput({ label, value, onChange, onSelect, placeholder, disabled, loading, showSub = true, onBlurGeocode }) {
  const { t } = useTranslation();
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const blurTimerRef = useRef(null);

  const closeSuggestions = useCallback(() => {
    blurTimerRef.current = setTimeout(() => setOpen(false), 200);
  }, []);

  useEffect(() => {
    const text = value.trim();
    if (text.length < 2 || disabled) {
      setSuggestions([]);
      setSearching(false);
      return;
    }
    let alive = true;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(`${text} Vietnam`)}&format=jsonv2&addressdetails=1&namedetails=1&limit=6&countrycodes=vn`;
        const response = await fetch(url);
        const data = await response.json();
        if (!alive) return;
        const subMap = { administrative: t('explore.locationTypes.administrative'), city: t('explore.locationTypes.city'), town: t('explore.locationTypes.town'), village: t('explore.locationTypes.village'), hamlet: t('explore.locationTypes.hamlet'), road: t('explore.locationTypes.road'), suburb: t('explore.locationTypes.suburb'), county: t('explore.locationTypes.county'), state: t('explore.locationTypes.state'), pedestrian: t('explore.locationTypes.pedestrian'), footway: t('explore.locationTypes.footway') };
        setSuggestions(Array.isArray(data) ? data.map(item => ({ lat: Number(item.lat), lng: Number(item.lon), label: detailedAddress(item) || item.display_name || text, sub: subMap[item.type] || subMap[item.class] || '' })).filter(item => Number.isFinite(item.lat) && Number.isFinite(item.lng)) : []);
        setOpen(true);
      } catch {
        if (alive) setSuggestions([]);
      } finally {
        if (alive) setSearching(false);
      }
    }, 350);
    return () => { alive = false; clearTimeout(timer); };
  }, [disabled, value, t]);

  const handleSelect = useCallback((item) => {
    setSuggestions([]);
    setOpen(false);
    clearTimeout(blurTimerRef.current);
    onSelect(item);
  }, [onSelect]);

  return <label className="location-search-field"><div className="location-search-label">{label}</div><div className="location-search-box"><input value={value} onFocus={() => { clearTimeout(blurTimerRef.current); if (suggestions.length) setOpen(true); }} onBlur={() => { closeSuggestions(); if (onBlurGeocode && suggestions.length === 0) onBlurGeocode(value); }} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} />{(loading || searching) && <Spinner />}</div>{open && suggestions.length > 0 && <div className="location-suggestions">{suggestions.map((item, index) => <button key={`${item.lat}-${item.lng}-${index}`} type="button" onMouseDown={e => { e.preventDefault(); handleSelect(item); }}><span>⌖</span><div><strong>{item.label}</strong>{showSub && item.sub ? <small>{item.sub}</small> : null}</div></button>)}</div>}</label>;
}

function PlannerDialogV3(props) {
  const { t } = useTranslation();
  const {
    open, setOpen, step, setStep, provinces, selectedProvinces, toggleProvince,
    selectedSites, toggleSelected, setActiveSite, planner, setPlanner, selectPoint,
    useCenter, makeRoundTrip, loading, actionLoading, sitesLoading, planRoute,
    getBrowserLocation, startPickingMap, minimizedPlanner, setMinimizedPlanner,
    geocodeStart, geocodeEnd, startPoint
  } = props;

  const busy = loading || Boolean(actionLoading);
  const interests = [
    { value: 'Đền chùa & Tâm linh', key: 'spiritual' },
    { value: 'Lịch sử & Khảo cổ', key: 'history' },
    { value: 'Kiến trúc & Nghệ thuật', key: 'architecture' },
    { value: 'Cảnh quan thiên nhiên', key: 'nature' },
    { value: 'Trải nghiệm văn hóa địa phương', key: 'local' },
    { value: 'Thích hợp cho trẻ em', key: 'children' },
    { value: 'Thích hợp người lớn tuổi', key: 'elderly' },
  ];
  const tripGoals = [
    { value: 'Tìm hiểu lịch sử chiều sâu', key: 'history' },
    { value: 'Check-in di sản nổi bật', key: 'checkin' },
    { value: 'Hành hương và tâm linh', key: 'spiritual' },
    { value: 'Gia đình nhẹ nhàng', key: 'family' },
  ];
  const travelGroups = [
    { value: 'Có trẻ em', key: 'children' },
    { value: 'Có người lớn tuổi', key: 'elderly' },
    { value: 'Nhóm bạn trẻ', key: 'youth' },
    { value: 'Đi một mình', key: 'solo' },
  ];
  const paces = [
    { value: 'relaxed', key: 'relaxed' },
    { value: 'moderate', key: 'moderate' },
    { value: 'packed', key: 'packed' },
  ];
  const envPrefs = [
    { value: 'Ưu tiên điểm trong nhà nếu mưa hoặc chất lượng không khí kém', key: 'indoor' },
    { value: 'Ưu tiên ngoài trời khi thời tiết đẹp', key: 'outdoor' },
    { value: 'Hạn chế di chuyển xa', key: 'limit' },
  ];

  const toggleInterest = interest => setPlanner(value => {
    const current = value.selectedInterests || [];
    return { ...value, selectedInterests: current.includes(interest) ? current.filter(item => item !== interest) : [...current, interest] };
  });

  // --- Per-tab validation state ---
  // validationErrors format: [stepNumber, ['province', ...]] or null when clean.
  const [validationErrors, setValidationErrors] = useState(null);
  const [shake, setShake] = useState(false);

  const validationMessages = {
    province: 'explore.planner.validation.missingProvince',
    site: 'explore.planner.validation.missingSite',
    goal: 'explore.planner.validation.missingGoal',
    group: 'explore.planner.validation.missingGroup',
    interest: 'explore.planner.validation.missingInterest',
    startPoint: 'explore.planner.validation.missingStartPoint',
    days: 'explore.planner.validation.invalidDays',
    people: 'explore.planner.validation.invalidPeople',
    
  };

  function validateStep(targetStep, context) {
    const { selectedProvinces, selectedSites, planner, startPoint } = context;
    const missingKeys = [];
    switch (targetStep) {
      case 1:
        if (!(selectedProvinces && selectedProvinces.size >= 1)) missingKeys.push('province');
        break;
      case 2:
        if (!(Array.isArray(selectedSites) && selectedSites.length >= 1)) missingKeys.push('site');
        break;
      case 3:
        if (!planner.tripGoal) missingKeys.push('goal');
        if (!planner.travelGroup) missingKeys.push('group');
        if (!((planner.selectedInterests || []).length >= 1)) missingKeys.push('interest');
        break;
      case 4:
        if (!(startPoint && Number.isFinite(startPoint.lat) && Number.isFinite(startPoint.lng))) missingKeys.push('startPoint');
        break;
      case 5:
        if (!(Number(planner.days) >= 1)) missingKeys.push('days');
        if (!(Number(planner.people) >= 1)) missingKeys.push('people');
        
        break;
      default:
        break;
    }
    return { ok: missingKeys.length === 0, missingKeys };
  }

  const currentContext = { selectedProvinces, selectedSites, planner, startPoint };

  function triggerShake() {
    setShake(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setShake(true)));
  }

  function warnMissing(keys) {
    const fields = keys.map(key => t(validationMessages[key])).join(', ');
    toast.warn(t('explore.planner.validation.incomplete', { fields }));
  }

  function handleContinue() {
    const { ok, missingKeys } = validateStep(step, currentContext);
    if (!ok) {
      setValidationErrors([step, missingKeys]);
      triggerShake();
      warnMissing(missingKeys);
      return;
    }
    setValidationErrors(null);
    setStep(step + 1);
  }

  // Final submit: gate the route build on the last tab's rules before delegating
  // to the untouched planRoute() routing logic.
  function handleSubmit() {
    const { ok, missingKeys } = validateStep(5, currentContext);
    if (!ok) {
      setValidationErrors([5, missingKeys]);
      triggerShake();
      warnMissing(missingKeys);
      return;
    }
    setValidationErrors(null);
    planRoute();
  }

  function handleTabClick(targetStep) {
    if (busy) return;
    // Backward navigation (or staying put) is always allowed.
    if (targetStep <= step) { setStep(targetStep); return; }
    // Forward jump: validate current step and every intermediate step in order.
    for (let s = step; s < targetStep; s++) {
      const { ok, missingKeys } = validateStep(s, currentContext);
      if (!ok) {
        setStep(s);
        setValidationErrors([s, missingKeys]);
        triggerShake();
        warnMissing(missingKeys);
        return;
      }
    }
    setValidationErrors(null);
    setStep(targetStep);
  }

  // Re-validate the active step as the user edits fields so errors clear live.
  useEffect(() => {
    if (validationErrors && validationErrors[0] === step) {
      const { ok, missingKeys } = validateStep(step, { selectedProvinces, selectedSites, planner, startPoint });
      if (ok) setValidationErrors(null);
      else setValidationErrors([step, missingKeys]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProvinces, selectedSites, planner, startPoint, step]);

  const hasErr = key => Boolean(validationErrors && validationErrors[0] === step && validationErrors[1].includes(key));

  return (
    <Dialog.Root open={open} onOpenChange={value => !busy && setOpen(value)}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="planner-modal">
          <div className="modal-hero">
            <Dialog.Title>{t('explore.planner.title')}</Dialog.Title>
            <Dialog.Description>{t('explore.planner.description')}</Dialog.Description>
            <Dialog.Close className="modal-close" disabled={busy}>×</Dialog.Close>
          </div>
          {busy && (
            <div className="modal-loading-overlay">
              <div className="modal-loading-content">
                <Spinner />
                <strong>{actionLoading === 'route' ? t('explore.planner.processingRoute') : t('explore.planner.processing')}</strong>
                <small>{t('explore.planner.pleaseWait')}</small>
              </div>
            </div>
          )}

          {validationErrors && validationErrors[0] === step && validationErrors[1].length > 0 && (
            <div className="validation-warning" role="alert">
              {t('explore.planner.validation.incomplete', { fields: validationErrors[1].map(key => t(validationMessages[key])).join(', ') })}
            </div>
          )}

          <div className={`wizard-tabs five-tabs${shake ? ' validation-shake' : ''}`} onAnimationEnd={() => setShake(false)}>
            {[t('explore.planner.tabLand'), t('explore.planner.tabHeritage'), t('explore.planner.tabInterest'), t('explore.planner.tabDeparture'), t('explore.planner.tabRoute')].map((label, i) => {
              const tabStep = i + 1;
              const tabHasError = Boolean(validationErrors && validationErrors[0] === tabStep && validationErrors[1].length > 0);
              const className = [step === tabStep ? 'active' : '', tabHasError ? 'tab-error' : ''].filter(Boolean).join(' ');
              return (
                <button key={label} className={className} onClick={() => handleTabClick(tabStep)} disabled={busy}>
                  <span>{tabStep}</span>{label}
                </button>
              );
            })}
          </div>

          <div className="wizard-body">
            <div className="wizard-scroll">
              {step === 1 && (
                <>
                  <h3>{t('explore.planner.selectLand')}</h3>
                  <p>{t('explore.planner.selectLandDesc')}</p>
                  {sitesLoading ? <SkeletonRows count={5} /> : (
                    <div className="province-grid modal-grid">
                      {provinces.slice(0, 60).map(province => (
                        <button key={province} className={selectedProvinces.has(province) ? 'active' : ''} onClick={() => toggleProvince(province)} disabled={busy}>{province}</button>
                      ))}
                    </div>
                  )}
                  {hasErr('province') && <div className="field-error">{t('explore.planner.validation.missingProvince')}</div>}
                </>
              )}

              {step === 2 && (
                <>
                  <h3>{t('explore.planner.priorityHeritage')}</h3>
                  <p>{t('explore.planner.priorityHeritageDesc')}</p>
                  <SelectedSites sites={selectedSites} remove={toggleSelected} focus={setActiveSite} disabled={busy} t={t} />
                  {hasErr('site') && <div className="field-error">{t('explore.planner.validation.missingSite')}</div>}
                  <label style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', color: selectedProvinces.size ? 'rgb(var(--museum-gold))' : 'rgb(var(--museum-muted))' }}>
                    <input type="checkbox" checked={minimizedPlanner} onChange={e => { setMinimizedPlanner(e.target.checked); if (e.target.checked) setOpen(false); else setOpen(true); }} disabled={busy || !selectedProvinces.size} style={{ accentColor: 'rgb(var(--museum-gold))' }} />
                    {t('explore.planner.minimizeToPick')}
                  </label>
                </>
              )}

              {step === 3 && (
                <>
                  <h3>{t('explore.planner.aiUnderstands')}</h3>
                  <p>{t('explore.planner.aiUnderstandsDesc')}</p>
                  <div className="question-grid">
                    <label>{t('explore.planner.tripGoalLabel')}
                      <select value={planner.tripGoal || ''} onChange={e => setPlanner(v => ({ ...v, tripGoal: e.target.value }))} disabled={busy}>
                        <option value="">{t('explore.planner.tripGoalPlaceholder')}</option>
                        {tripGoals.map(o => <option key={o.key} value={o.value}>{t(`explore.planner.goals.${o.key}`)}</option>)}
                      </select>
                      {hasErr('goal') && <span className="field-error">{t('explore.planner.validation.missingGoal')}</span>}
                    </label>
                    <label>{t('explore.planner.travelGroupLabel')}
                      <select value={planner.travelGroup || ''} onChange={e => setPlanner(v => ({ ...v, travelGroup: e.target.value }))} disabled={busy}>
                        <option value="">{t('explore.planner.travelGroupPlaceholder')}</option>
                        {travelGroups.map(o => <option key={o.key} value={o.value}>{t(`explore.planner.groups.${o.key}`)}</option>)}
                      </select>
                      {hasErr('group') && <span className="field-error">{t('explore.planner.validation.missingGroup')}</span>}
                    </label>
                    <label>{t('explore.planner.paceLabel')}
                      <select value={planner.pace || 'moderate'} onChange={e => setPlanner(v => ({ ...v, pace: e.target.value }))} disabled={busy}>
                        {paces.map(o => <option key={o.key} value={o.value}>{t(`explore.planner.paces.${o.key}`)}</option>)}
                      </select>
                    </label>
                    <label>{t('explore.planner.envLabel')}
                      <select value={planner.environmentPreference || ''} onChange={e => setPlanner(v => ({ ...v, environmentPreference: e.target.value }))} disabled={busy}>
                        <option value="">{t('explore.planner.envPlaceholder')}</option>
                        {envPrefs.map(o => <option key={o.key} value={o.value}>{t(`explore.planner.envs.${o.key}`)}</option>)}
                      </select>
                    </label>
                  </div>
                  <div className="interest-box">
                    <label>{t('explore.planner.mainInterests')}</label>
                    <div>
                      {interests.map(interest => {
                        const isSelected = (planner.selectedInterests || []).includes(interest.value);
                        return <button key={interest.key} type="button" className={`ghost ${isSelected ? 'active' : ''}`} onClick={() => toggleInterest(interest.value)} disabled={busy}>{t(`explore.planner.interests.${interest.key}`)}</button>;
                      })}
                    </div>
                    {hasErr('interest') && <div className="field-error">{t('explore.planner.validation.missingInterest')}</div>}
                  </div>
                </>
              )}

              {step === 4 && (
                <section className="departure-step">
                  <div className="departure-header">
                    <h3>{t('explore.planner.departure')}</h3>
                    <p>{t('explore.planner.departureDesc')}</p>
                  </div>

                  {selectedSites.length > 0 && (
                    <div className="selected-sites-notice">
                      {t('explore.planner.selectedNotice', { count: selectedSites.length })}
                    </div>
                  )}

                  <div className="departure-grid">
                    <div className="location-card">
                      <LocationSearchInput
                        label={t('explore.planner.startPointLabel')}
                        showSub={false}
                        value={planner.startText}
                        disabled={busy}
                        loading={actionLoading === 'geo-start'}
                        placeholder={t('explore.planner.startPointPlaceholder')}
                        onChange={value => setPlanner(v => ({ ...v, startText: value }))}
                        onSelect={point => selectPoint('start', point)}
                        onBlurGeocode={geocodeStart}
                      />

                      <div className="location-actions">
                        <button
                          className="ghost action-btn"
                          onClick={() => getBrowserLocation('start')}
                          disabled={busy}
                        >
                          {actionLoading === 'geo-start' ? <Spinner /> : '🧭'}
                          <span>{t('explore.planner.currentLocation')}</span>
                        </button>

                        <button
                          className="ghost action-btn"
                          onClick={() => startPickingMap('start')}
                          disabled={busy}
                        >
                          📍 <span>{t('explore.planner.pickOnMap')}</span>
                        </button>
                      </div>
                      {hasErr('startPoint') && <div className="field-error">{t('explore.planner.validation.missingStartPoint')}</div>}
                    </div>

                    <div className="location-card">
                      <LocationSearchInput
                        label={t('explore.planner.endPointLabel')}
                        showSub={false}
                        value={planner.endText}
                        disabled={busy}
                        loading={actionLoading === 'geo-end'}
                        placeholder={t('explore.planner.endPointPlaceholder')}
                        onChange={value => setPlanner(v => ({ ...v, endText: value }))}
                        onSelect={point => selectPoint('end', point)}
                        onBlurGeocode={geocodeEnd}
                      />

                      <div className="location-actions">
                        <button
                          className="ghost action-btn"
                          onClick={() => getBrowserLocation('end')}
                          disabled={busy}
                        >
                          {actionLoading === 'geo-end' ? <Spinner /> : '🧭'}
                          <span>{t('explore.planner.currentLocation')}</span>
                        </button>

                        <button
                          className="ghost action-btn"
                          onClick={() => startPickingMap('end')}
                          disabled={busy}
                        >
                          📍 <span>{t('explore.planner.pickOnMap')}</span>
                        </button>

                        <button
                          className="ghost action-btn round-trip-btn"
                          onClick={makeRoundTrip}
                          disabled={busy}
                        >
                          ↩ <span>{t('explore.planner.roundTrip')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {step === 5 && (
                <>
                  <h3>{t('explore.planner.routeTitle')}</h3>
                  <div className="form-grid compact step-4-grid">
                    <label>{t('explore.planner.days')}
                      <input type="number" min="1" value={planner.days} onChange={e => setPlanner(v => ({ ...v, days: e.target.value }))} disabled={busy} />
                      {hasErr('days') && <span className="field-error">{t('explore.planner.validation.invalidDays')}</span>}
                    </label>
                    <label>{t('explore.planner.people')}
                      <input type="number" min="1" value={planner.people} onChange={e => setPlanner(v => ({ ...v, people: e.target.value }))} disabled={busy} />
                      {hasErr('people') && <span className="field-error">{t('explore.planner.validation.invalidPeople')}</span>}
                    </label>
                    <label>{t('explore.planner.tripDate')}
                      <input type="date" value={planner.tripDate} onChange={e => setPlanner(v => ({ ...v, tripDate: e.target.value }))} disabled={busy} />
                    </label>
                    <div className="time-group">
                      <label>{t('explore.planner.startTime')}
                        <input type="time" value={planner.windowStart} onChange={e => setPlanner(v => ({ ...v, windowStart: e.target.value }))} disabled={busy} />
                      </label>
                      <label>{t('explore.planner.endTime')}
                        <input type="time" value={planner.windowEnd} onChange={e => setPlanner(v => ({ ...v, windowEnd: e.target.value }))} disabled={busy} />
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="modal-actions">
              {step === 1 && <button className="primary" onClick={handleContinue} disabled={busy || sitesLoading}>{t('explore.planner.continue')}</button>}
              {step === 2 && <><button className="ghost" onClick={() => setStep(1)} disabled={busy}>{t('explore.planner.back')}</button><button className="primary" onClick={handleContinue} disabled={busy}>{t('explore.planner.continue')}</button></>}
              {step === 3 && <><button className="ghost" onClick={() => setStep(2)} disabled={busy}>{t('explore.planner.back')}</button><button className="primary" onClick={handleContinue} disabled={busy}>{t('explore.planner.continue')}</button></>}
              {step === 4 && <><button className="ghost" onClick={useCenter} disabled={busy || !selectedProvinces.size}>{t('explore.planner.backToCenter')}</button><button className="ghost" onClick={() => setStep(3)} disabled={busy}>{t('explore.planner.back')}</button><button className="primary" onClick={handleContinue} disabled={busy}>{t('explore.planner.continue')}</button></>}
              {step === 5 && <><button className="ghost" onClick={() => setStep(4)} disabled={busy}>{t('explore.planner.back')}</button><button className="primary" onClick={handleSubmit} disabled={busy || sitesLoading}>{loading ? <><Spinner /> {t('explore.planner.creatingRoute')}</> : t('explore.planner.createRoute')}</button></>}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Spinner() { return <i className="loading-spinner" aria-hidden="true" />; }
function InlineLoading({ text }) { return <div className="inline-loading"><Spinner /><span>{text}</span></div>; }
function MapLoadingOverlay({ text, subtitle }) { return <div className="map-loading-overlay"><div><Spinner /><strong>{text}</strong><small>{subtitle}</small></div></div>; }
function SkeletonRows({ count = 4 }) { return <div className="skeleton-list">{Array.from({ length: count }).map((_, index) => <span key={index} />)}</div>; }
function StatusBanner({ status, t }) { return <div className={`status ${status.type}`}>{status.key ? t(status.key, status.params) : status.text}</div>; }
function SearchBox({ query, setQuery, suggestions, choose, placeholder }) { return <div className="map-search-center"><div className="map-search-card"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder={placeholder} />{query && <button onClick={() => setQuery('')}>×</button>}</div>{suggestions.length > 0 && <div className="search-suggestions">{suggestions.map(item => <button key={`${item.type}-${item.id}`} onClick={() => choose(item)}><span>{item.type === 'site' ? '⌖' : '◉'}</span><div><strong>{item.label}</strong><small>{item.sub}</small></div></button>)}</div>}</div>; }
function CategoryFilters({ categories, selected, toggle, clear, loading, t, catLabel }) { return <aside className="category-filter"><div><strong>{t('explore.ui.categoryType')}</strong>{selected.size > 0 && <button onClick={clear} disabled={loading}>{t('explore.ui.allCategories')}</button>}</div>{loading ? <SkeletonRows count={6} /> : categories.map(category => { const [color, icon] = CAT_STYLE[category] || CAT_STYLE.default; return <button key={category} className={selected.has(category) ? 'active' : ''} style={{ '--cat-color': color }} onClick={() => toggle(category)}><span>{icon}</span>{catLabel(category)}</button>; })}</aside>; }
function SelectedSites({ sites, remove, focus, disabled, t }) { return <div className="selected-box">{sites.length ? sites.map(site => <button key={site.id} onClick={() => focus(site)} disabled={disabled}>{site.name}<span onClick={e => { e.stopPropagation(); if (!disabled) remove(site.id); }}>×</span></button>) : <p>{t('explore.planner.noRequiredPoints')}</p>}</div>; }
function RouteSummary({ route, openPlanner, focus, t }) {
  const formatTime = (min) => {
    const m = Math.round(min);
    if (m < 60) return `${m} ${t('explore.route.minutes')}`;
    const h = Math.floor(m / 60);
    const m2 = m % 60;
    return m2 > 0 ? `${h}h ${m2}p` : `${h}h`;
  };
  const notes = formatRouteWarnings(route.warnings || [], t);
  const totalStops = (route.days || []).reduce((acc, d) => acc + (d.stops?.length || 0), 0);
  const dayColors = ['#9f1d19', '#b88935', '#6f3f20', '#3f7a4c', '#6f1714'];

  return <aside className="route-summary">
    <div className="rs-header">
      <div className="rs-status-badge">
        <span className="rs-status-dot" style={{ background: route.status === 'feasible' ? '#3f7a4c' : '#d7a84f' }} />
        {route.status === 'feasible' ? t('explore.route.feasible') : t('explore.route.needAdjust')}
      </div>
      <div className="rs-stats">
        <div className="rs-stat"><strong>📏</strong><span>{Number(route.total_distance_km).toFixed(1)} km</span></div>
        <div className="rs-stat"><strong>⏱</strong><span>{formatTime(route.total_duration_min)}</span></div>
        <div className="rs-stat"><strong>📍</strong><span>{t('explore.route.heritageCount', { count: totalStops })}</span></div>
      </div>
    </div>

    {route.summary && <p className="ai-summary">📝 {route.summary}</p>}

    {notes.length > 0 && <div className="route-notes"><strong>{t('explore.route.routeNotes')}</strong>{notes.map(note => <p key={note}>{note}</p>)}</div>}

    <div className="route-days">
      {route.days?.map((day, idx) => <div className="day" key={day.day} style={{ borderLeftColor: dayColors[idx % dayColors.length] }}>
        <h3><span className="day-number" style={{ background: dayColors[idx % dayColors.length] }}>{day.day}</span>{t('explore.route.day', { day: day.day })}</h3>
        {day.stops?.length > 0 ? day.stops.map(stop => <button key={`${day.day}-${stop.site_id}`} onClick={() => focus(stop.site_id)}>
          <time>{stop.arrival_time}</time>
          <div className="stop-info">
            <span className="stop-name">{stop.name}</span>
            <span className="stop-meta">
              {Number(stop.travel_from_prev_km) > 0 ? <><b>↗</b> {Number(stop.travel_from_prev_km).toFixed(1)}km</> : ''}
              {Number(stop.travel_from_prev_min) > 0 ? <> · ⏱ {formatTime(stop.travel_from_prev_min)}</> : ''}
            </span>
            {stop.reason && <em className="stop-reason">💡 {stop.reason}</em>}
          </div>
        </button>) : <div className="day-empty">
          <span>🍜</span>
          <p>{t('explore.route.freeDay')}</p>
        </div>}
      </div>)}
    </div>

    <div className="rs-actions">
      <button className="rs-btn-ghost" onClick={openPlanner}>← {t('explore.route.editItinerary')}</button>
    </div>
  </aside>;
}

function formatRouteWarnings(warnings, t) {
  const mapped = warnings.map(warning => {
    const text = String(warning || '').toLowerCase();
    if (text.includes('sklearn') || text.includes('kmeans') || text.includes('latitude split')) {
      return t('explore.warnings.split');
    }
    if (text.includes('osrm') || text.includes('route request') || text.includes('table request')) {
      return t('explore.warnings.osrm');
    }
    if (text.includes('island') || text.includes('đảo') || text.includes('water')) {
      return t('explore.warnings.islandRoute');
    }
    return warning;
  }).filter(Boolean);
  return [...new Set(mapped)];
}
function MiniSitePopup({ site, pos, popupRef, selected, toggle, detail, close, keepHover, endHover, t, catLabel }) { const cats = site.categories || []; return <div ref={popupRef} className="mini-site-popup" style={{ left: pos.x, top: pos.y }} onMouseEnter={keepHover} onMouseLeave={endHover}><button className="mini-close" onClick={close}>×</button><div className="site-kicker">{t('explore.detail.heritagePoint')}</div><h2>{site.name}</h2><p className="province">📍 {site.province}</p><div className="badges">{cats.slice(0, 3).map(cat => <span key={cat}>{catLabel(cat)}</span>)}</div><p>{site.description || site.long_description || t('explore.detail.updatingInfo')}</p><dl><dt>{t('explore.detail.openingHours')}</dt><dd>{site.opening_hours || '08:00-17:00'}</dd><dt>{t('explore.detail.duration')}</dt><dd>{t('explore.detail.minutes', { count: site.estimated_visit_minutes || 60 })}</dd><dt>{t('explore.detail.ticketPrice')}</dt><dd>{site.ticket_price ? formatPrice(site.ticket_price) : t('explore.detail.free')}</dd></dl><div className="site-actions"><button className="primary" onClick={toggle}>{selected ? t('explore.detail.deselect') : t('explore.detail.selectThisPoint')}</button><button className="ghost" onClick={detail}>{t('explore.detail.viewDetail')}</button></div></div>; }
function SiteDetailDialog({ site, selected, toggle, close, t, catLabel }) {
  const [images, setImages] = useState([]); const [reviews, setReviews] = useState([]); const [enriched, setEnriched] = useState(null); const [slide, setSlide] = useState(0); const [detailLoading, setDetailLoading] = useState(false); const open = Boolean(site);
  useEffect(() => { if (!site) return; let alive = true; setImages([]); setReviews([]); setEnriched(null); setSlide(0); setDetailLoading(true); Promise.allSettled([fetch(`${API}/heritage-sites/${site.id}/images`).then(r => r.json()), fetch(`${API}/heritage-sites/${site.id}/reviews`).then(r => r.json()), fetch(`${API}/heritage-sites/${site.id}/enrich`).then(r => r.json())]).then(([img, rev, enr]) => { if (!alive) return; if (img.status === 'fulfilled') setImages(img.value.images || []); if (rev.status === 'fulfilled' && Array.isArray(rev.value)) setReviews(rev.value); if (enr.status === 'fulfilled') setEnriched(enr.value); }).finally(() => { if (alive) setDetailLoading(false); }); return () => { alive = false; }; }, [site]);
  if (!site) return null;
  const description = enriched?.long_description || site.long_description || site.description || t('explore.detail.updatingInfo'); const tips = enriched?.visit_tips || site.visit_tips;
  if (detailLoading) return <Dialog.Root open={open} onOpenChange={value => !value && close()}><Dialog.Portal><Dialog.Overlay className="dialog-overlay" /><Dialog.Content className="detail-modal"><Dialog.Close className="modal-close">&times;</Dialog.Close><InlineLoading text={t('explore.detail.openingProfile')} /><div className="detail-layout"><div className="detail-left"><div className="detail-carousel"><div className="detail-placeholder"><span><Spinner /></span><strong>{site.name}</strong><small>{t('explore.detail.loadingImages')}</small></div></div></div><div className="detail-right"><div className="detail-header"><div className="site-kicker">{t('explore.detail.heritageProfile')}</div><Dialog.Title>{site.name}</Dialog.Title><Dialog.Description>📍 {site.province}</Dialog.Description><div className="badges">{(site.categories || []).map(cat => <span key={cat}>{catLabel(cat)}</span>)}</div></div><div className="detail-body"><h3>{t('explore.detail.introduction')}</h3><SkeletonRows count={4} /></div></div></div></Dialog.Content></Dialog.Portal></Dialog.Root>;
  return (
    <Dialog.Root open={open} onOpenChange={(value) => !value && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="detail-modal">
          <Dialog.Close className="modal-close">&times;</Dialog.Close>
          <div className="detail-layout">
            {/* LEFT: Carousel + Quick Info + Actions */}
            <div className="detail-left">
              <div className="detail-carousel">
                {images.length > 0 ? (
                  <>
                    <div
                      className="carousel-track"
                      style={{ transform: `translateX(-${slide * 100}%)` }}
                    >
                      {images.map((img, i) => (
                        <img
                          key={i}
                          src={img.thumb_url || img.url}
                          alt={img.title || site.name}
                          loading="lazy"
                        />
                      ))}
                    </div>
                    <div className="carousel-gradient" />
                    {images.length > 1 && (
                      <>
                        <button
                          className="carousel-nav prev"
                          onClick={() => setSlide((slide - 1 + images.length) % images.length)}
                          aria-label={t('explore.detail.prevImage')}
                        >
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M11 3L5 9L11 15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button
                          className="carousel-nav next"
                          onClick={() => setSlide((slide + 1) % images.length)}
                          aria-label={t('explore.detail.nextImage')}
                        >
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M7 3L13 9L7 15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <div className="carousel-counter">
                          {slide + 1} / {images.length}
                        </div>
                        <div className="carousel-dots">
                          {images.map((_, i) => (
                            <button
                              key={i}
                              className={i === slide ? 'active' : ''}
                              onClick={() => setSlide(i)}
                              aria-label={t('explore.detail.imageN', { n: i + 1 })}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="detail-placeholder">
                    <span>{(CAT_STYLE[(site.categories || [])[0]] || CAT_STYLE.default)[1]}</span>
                    <strong>{site.name}</strong>
                    <small>{t('explore.detail.noImage')}</small>
                  </div>
                )}
              </div>
              <dl className="detail-quick-info">
                <div><dt>🕰 {t('explore.detail.openingHours')}</dt><dd>{site.opening_hours || '08:00-17:00'}</dd></div>
                <div><dt>⏳ {t('explore.detail.duration')}</dt><dd>{t('explore.detail.minutes', { count: site.estimated_visit_minutes || 60 })}</dd></div>
                <div><dt>🎫 {t('explore.detail.ticketPrice')}</dt><dd>{site.ticket_price ? formatPrice(site.ticket_price) : t('explore.detail.free')}</dd></div>
                <div><dt>★ {t('explore.detail.popular')}</dt><dd>{scorePercent(site.popularity_score)}</dd></div>
                <div><dt>✦ {t('explore.detail.historyScore')}</dt><dd>{scorePercent(site.historical_importance_score)}</dd></div>
              </dl>
              <div className="site-actions">
                <button className="primary" onClick={toggle}>
                  {selected ? t('explore.detail.deselectFromTrip') : t('explore.detail.selectToTrip')}
                </button>
                <a
                  className="ghost link-btn"
                  href={`https://www.google.com/maps?q=${site.lat},${site.lng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('explore.detail.openMap')}
                </a>
              </div>
            </div>
            {/* RIGHT: Header + Description + Reviews */}
            <div className="detail-right">
              <div className="detail-header">
                <div className="site-kicker">{t('explore.detail.heritageProfile')}</div>
                <Dialog.Title>{site.name}</Dialog.Title>
                <Dialog.Description>📍 {site.province}</Dialog.Description>
                <div className="badges">
                  {(site.categories || []).slice(0, 4).map((cat) => (
                    <span key={cat}>{catLabel(cat)}</span>
                  ))}
                </div>
              </div>
              <div className="detail-body">
                <h3>{t('explore.detail.introduction')}</h3>
                <DescriptionText text={description} />
                {tips && (
                  <div className="tips">
                    <strong>{t('explore.detail.visitNote')}</strong>
                    <p>{tips}</p>
                  </div>
                )}
                <section className="reviews">
                  <h3>{t('explore.detail.topReviews')}</h3>
                  {reviews.length ? (
                    reviews.slice(0, 4).map((review, i) => (
                      <article key={`${review.author}-${i}`}>
                        <div>
                          <strong>{review.author || t('explore.detail.visitor')}</strong>
                          <span>{stars(review.rating)}</span>
                        </div>
                        <p>{review.text}</p>
                        <a href={reviewUrl(review, site)} target="_blank" rel="noreferrer">
                          {review.source || t('explore.detail.findReview')} ↗
                        </a>
                      </article>
                    ))
                  ) : (
                    <p>{t('explore.detail.noReviews')}</p>
                  )}
                </section>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DescriptionText({ text }) {
  const blocks = formatDescriptionBlocks(text);
  return <div className="description-text">{blocks.map((block, index) => block.type === 'heading' ? <h4 key={index}>{block.text}</h4> : <p key={index}>{block.text}</p>)}</div>;
}

export default App;

