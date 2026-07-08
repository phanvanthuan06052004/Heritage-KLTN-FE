import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './MapExplorer.css';
import RoutePlayback from './RoutePlayback';
import ExploreOnboarding from './ExploreOnboarding';
import {
  API, DEFAULT_START, FEATURED_PER_PROVINCE, PROV_COORDS, CAT_STYLE, CAT_LABELS,
  formatPrice, scorePercent, siteRank, stars, categoryLabel, reviewUrl,
  formatDescriptionBlocks, normalizeText, hasNormalized, markerElement,
  parseOpeningHours, toPlannerSite, optionalNumber, formatApiError,
  detailedAddress, useProvinceCenter, decodePolyline, buildRecommendPayload,
} from './mapUtils';

function App() {
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
  const [planner, setPlanner] = useState({ days: 3, people: 2, mode: 'driving', tripDate: new Date().toISOString().slice(0, 10), windowStart: '08:00', windowEnd: '18:00', startText: '', endText: '', maxDistanceKm: '', maxDurationMin: '', avoidHighways: false, avoidTolls: false });
  const [startPoint, setStartPoint] = useState(DEFAULT_START);
  const [endPoint, setEndPoint] = useState(null);
  const [route, setRoute] = useState(null);
  const [status, setStatus] = useState({ type: 'info', text: 'Mở ấn triện “Tạo lịch trình” để bắt đầu hành trình qua các di sản Việt Nam.' });
  const [loading, setLoading] = useState(false);
  const [sitesLoading, setSitesLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [minimizedPlanner, setMinimizedPlanner] = useState(false);

  const provinces = useMemo(() => [...new Set(sites.map(s => s.province).filter(Boolean))].sort(), [sites]);
  const categories = useMemo(() => [...new Set(sites.flatMap(site => site.categories?.length ? site.categories : ['default']))].sort((a, b) => (CAT_LABELS[a] || a).localeCompare(CAT_LABELS[b] || b, 'vi')), [sites]);
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
    const provinceMatches = provinces.filter(province => province.toLowerCase().includes(text)).slice(0, 3).map(province => ({ type: 'province', id: province, label: province, sub: 'Tỉnh/thành phố' }));
    return [...siteMatches, ...provinceMatches].slice(0, 8);
  }, [provinces, query, sites]);
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

  useEffect(() => { setSitesLoading(true); fetch(`${API}/heritage-sites`).then(r => r.json()).then(d => setSites(Array.isArray(d) ? d : [])).catch(e => setStatus({ type: 'error', text: `Không tải được dữ liệu: ${e.message}` })).finally(() => setSitesLoading(false)); }, []);
  useEffect(() => {
    setStartPoint(DEFAULT_START);
    setPlanner(value => ({ ...value, startText: DEFAULT_START.label, endText: '' }));
  }, []);
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
    setSelectedProvinces(current => {
      const next = new Set(current);
      if (next.has(province)) next.delete(province); else next.add(province);
      if (!current.size && PROV_COORDS[province]) {
        const [lat, lng] = PROV_COORDS[province];
        const point = { lat, lng, label: province };
        setStartPoint(point); setEndPoint(point);
        setPlanner(value => ({ ...value, startText: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, endText: `${lat.toFixed(4)}, ${lng.toFixed(4)}` }));
      }
      return next;
    });
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
    setSelectedProvinces(new Set([site.province]));
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
      setStatus({ type: 'error', text: 'Trình duyệt của bạn không hỗ trợ định vị.' });
      return;
    }
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
          setStatus({ type: 'info', text: `Vị trí xuất phát: ${point.label}` });
        } else {
          setEndPoint(point);
          setPlanner(p => ({ ...p, endText: point.label }));
          setStatus({ type: 'info', text: `Vị trí kết thúc: ${point.label}` });
        }
        setActionLoading(null);
      },
      (err) => {
        setActionLoading(null);
        setStatus({ type: 'error', text: 'Không thể lấy vị trí. Hãy chắc chắn bạn đã cấp quyền.' });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }
  function pickLocation(kind) {
    startPickingMap(kind);
  }
  function startPickingMap(kind) {
    setPickingMapFor(kind);
    setPlannerOpen(false);
    setStatus({ type: 'info', text: 'Vui lòng click vào một điểm trên bản đồ.' });
  }
  async function updatePoint(kind, textOverride = null) {
    const text = textOverride ?? (kind === 'start' ? planner.startText : planner.endText);
    setActionLoading(`point-${kind}`);
    try {
      const point = await geocode(text);
      if (!point) { setStatus({ type: 'error', text: `Không tìm thấy ${kind === 'start' ? 'điểm xuất phát' : 'điểm kết thúc'}.` }); return; }
      if (kind === 'start') {
        setStartPoint(point);
        setPlanner(p => ({ ...p, startText: point.label }));
      } else {
        setEndPoint(point);
        setPlanner(p => ({ ...p, endText: point.label }));
      }
      setStatus({ type: 'info', text: `${kind === 'start' ? 'Xuất phát' : 'Kết thúc'}: ${point.label}` });
    } finally {
      setActionLoading(null);
    }
  }
  function selectPoint(kind, point) {
    if (kind === 'start') {
      setStartPoint(point);
      setPlanner(value => ({ ...value, startText: point.label }));
      setStatus({ type: 'info', text: `Điểm xuất phát: ${point.label}` });
      return;
    }
    setEndPoint(point);
    setPlanner(value => ({ ...value, endText: point.label }));
    setStatus({ type: 'info', text: `Điểm kết thúc: ${point.label}` });
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
        warnings: [],
        days: (data.days || []).map((d, i) => ({
          day: d.day,
          coordinates: data.route_geometries?.[i] || [],
          stops: (d.items || []).map(item => ({
            site_id: item.ref_id,
            name: item.name,
            arrival_time: (item.time || '').split('-')[0] || '',
            travel_from_prev_km: (item.distance_from_previous_m || 0) / 1000,
            travel_from_prev_min: item.travel_from_previous_minutes || 0,
            reason: item.reason || 'Phù hợp với sở thích và vùng di sản đã chọn.'
          }))
        }))
      };
      setRoute(mappedRoute); drawRoute(mappedRoute); setPlannerOpen(false);
      setStatus({ type: 'success', text: 'AI đã thiết kế lịch trình thành công.' });
    } catch (error) { setStatus({ type: 'error', text: error.message || 'Không thể tạo gợi ý.' }); }
    finally { setLoading(false); setActionLoading(null); }
  }

  async function planRoute() {
    if (!selectedProvinces.size) { setStatus({ type: 'error', text: 'Chọn ít nhất một tỉnh trước khi tạo lịch trình.' }); setStep(1); return; }
    if (planner.mode === 'transit') { setStatus({ type: 'error', text: 'Phương tiện công cộng cần GTFS/OpenTripPlanner. Hiện hỗ trợ ô tô, xe máy, đi bộ qua OSRM.' }); setStep(3); return; }

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
    <SearchBox query={query} setQuery={setQuery} suggestions={searchSuggestions} choose={chooseSuggestion} />
    <div className="top-left-stack">
      <button className="create-trip-btn" onClick={() => { setMinimizedPlanner(false); setPlannerOpen(true); }} disabled={sitesLoading || loading}><span>{sitesLoading ? <Spinner /> : '印'}</span>{sitesLoading ? 'Đang mở bản đồ' : 'Tạo lịch trình'}</button>
      <StatusBanner status={status} />
    </div>
    {selectedProvinces.size > 0 && <button className="reset-map-btn" onClick={resetMapFocus}>Tắt zoom</button>}
    <CategoryFilters categories={categories} selected={selectedCategories} toggle={toggleCategory} clear={() => setSelectedCategories(new Set())} loading={sitesLoading} />
    {(sitesLoading || loading || actionLoading?.startsWith('map-')) && <MapLoadingOverlay text={sitesLoading ? 'Đang tải bản đồ di sản...' : actionLoading?.startsWith('map-') ? 'Đang định danh tọa độ...' : 'Đang dựng lộ trình...'} />}

    {!plannerOpen && !pickingMapFor && !route && selectedSites.length === 0 && (
      <button className="floating-return-btn" onClick={() => setPlannerOpen(true)}>
        Quay lại lịch trình
      </button>
    )}

    {selectedSites.length > 0 && !plannerOpen && (
      <div className="selected-sites-bar"><span>Đã chọn {selectedSites.length} điểm</span><button onClick={() => { setMinimizedPlanner(false); setPlannerOpen(true); }}>Tiếp tục lịch trình →</button></div>
    )}

    <PlannerDialogV3 open={plannerOpen} setOpen={setPlannerOpen} step={step} setStep={setStep} sites={sites} provinces={provinces} selectedProvinces={selectedProvinces} toggleProvince={toggleProvince} selectedSites={selectedSites} toggleSelected={toggleSelected} setActiveSite={setActiveSite} planner={planner} setPlanner={setPlanner} selectPoint={selectPoint} useCenter={() => useProvinceCenter(selectedProvinces, setStartPoint, setEndPoint, setPlanner)} makeRoundTrip={() => { setEndPoint(startPoint); setPlanner(v => ({ ...v, endText: v.startText || `${startPoint.lat}, ${startPoint.lng}` })); }} loading={loading} actionLoading={actionLoading} sitesLoading={sitesLoading} planRoute={planRoute} pickLocation={pickLocation} getBrowserLocation={getBrowserLocation} startPickingMap={startPickingMap} minimizedPlanner={minimizedPlanner} setMinimizedPlanner={setMinimizedPlanner} />
    {route && <RouteSummary route={route} openPlanner={() => setPlannerOpen(true)} focus={id => { const site = sites.find(item => item.id === id); if (site) focusSite(site); }} />}
    {route && <RoutePlayback route={route} map={mapRef.current} sites={sites} />}
    {popupSite && popupPos && <MiniSitePopup site={popupSite} pos={popupPos} popupRef={popupRef} selected={selectedIds.has(popupSite.id)} toggle={() => toggleSelected(popupSite.id)} detail={() => setDetailSite(popupSite)} close={closeSitePopup} keepHover={() => { popupHoverRef.current = true; clearTimeout(hoverClearTimerRef.current); clearTimeout(hoverIntentTimerRef.current); }} endHover={() => { popupHoverRef.current = false; setHoverSite(null); }} />}
    <SiteDetailDialog site={detailSite} selected={detailSite ? selectedIds.has(detailSite.id) : false} toggle={() => detailSite && toggleSelected(detailSite.id)} close={() => setDetailSite(null)} />
    <ExploreOnboarding />
  </div>;
}

function LocationSearchInput({ label, value, onChange, onSelect, placeholder, disabled, loading, showSub = true }) {
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
        const subMap = { administrative: 'Khu vực', city: 'Thành phố', town: 'Thị trấn', village: 'Làng', hamlet: 'Thôn', road: 'Đường', suburb: 'Quận', county: 'Huyện', state: 'Tỉnh', pedestrian: 'Đường bộ', footway: 'Lối đi' };
        setSuggestions(Array.isArray(data) ? data.map(item => ({ lat: Number(item.lat), lng: Number(item.lon), label: detailedAddress(item) || item.display_name || text, sub: subMap[item.type] || subMap[item.class] || '' })).filter(item => Number.isFinite(item.lat) && Number.isFinite(item.lng)) : []);
        setOpen(true);
      } catch {
        if (alive) setSuggestions([]);
      } finally {
        if (alive) setSearching(false);
      }
    }, 350);
    return () => { alive = false; clearTimeout(timer); };
  }, [disabled, value]);

  const handleSelect = useCallback((item) => {
    setSuggestions([]);
    setOpen(false);
    clearTimeout(blurTimerRef.current);
    onSelect(item);
  }, [onSelect]);

  return <label className="location-search-field"><div className="location-search-label">{label}</div><div className="location-search-box"><input value={value} onFocus={() => { clearTimeout(blurTimerRef.current); if (suggestions.length) setOpen(true); }} onBlur={closeSuggestions} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} />{(loading || searching) && <Spinner />}</div>{open && suggestions.length > 0 && <div className="location-suggestions">{suggestions.map((item, index) => <button key={`${item.lat}-${item.lng}-${index}`} type="button" onMouseDown={e => { e.preventDefault(); handleSelect(item); }}><span>⌖</span><div><strong>{item.label}</strong>{showSub && item.sub ? <small>{item.sub}</small> : null}</div></button>)}</div>}</label>;
}

function PlannerDialogV3(props) {
  const {
    open, setOpen, step, setStep, provinces, selectedProvinces, toggleProvince,
    selectedSites, toggleSelected, setActiveSite, planner, setPlanner, selectPoint,
    useCenter, makeRoundTrip, loading, actionLoading, sitesLoading, planRoute,
    getBrowserLocation, startPickingMap, minimizedPlanner, setMinimizedPlanner
  } = props;

  const busy = loading || Boolean(actionLoading);
  const interests = [
    'Đền chùa & Tâm linh', 'Lịch sử & Khảo cổ', 'Kiến trúc & Nghệ thuật',
    'Cảnh quan thiên nhiên', 'Trải nghiệm văn hóa địa phương',
    'Thích hợp cho trẻ em', 'Thích hợp người lớn tuổi'
  ];

  const toggleInterest = interest => setPlanner(value => {
    const current = value.selectedInterests || [];
    return { ...value, selectedInterests: current.includes(interest) ? current.filter(item => item !== interest) : [...current, interest] };
  });

  return (
    <Dialog.Root open={open} onOpenChange={value => !busy && setOpen(value)}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="planner-modal">
          <div className="modal-hero">
            <Dialog.Title>Chiếu chỉ hành trình di sản</Dialog.Title>
            <Dialog.Description>Chọn vùng đất, trả lời vài câu hỏi, rồi hệ thống lập tuyến và giải thích lý do chọn điểm.</Dialog.Description>
            <Dialog.Close className="modal-close" disabled={busy}>×</Dialog.Close>
          </div>
          {busy && (
            <div className="modal-loading-overlay">
              <div className="modal-loading-content">
                <Spinner />
                <strong>{actionLoading === 'route' ? 'Đang chiếu lập lộ trình...' : 'Đang xử lý...'}</strong>
                <small>Vui lòng chờ trong giây lát</small>
              </div>
            </div>
          )}

          <div className="wizard-tabs five-tabs">
            {['Vùng đất', 'Di sản ưu tiên', 'Sở thích', 'Khởi hành', 'Lộ trình'].map((label, i) => (
              <button key={label} className={step === i + 1 ? 'active' : ''} onClick={() => setStep(i + 1)} disabled={busy}>
                <span>{i + 1}</span>{label}
              </button>
            ))}
          </div>

          <div className="wizard-body">
            <div className="wizard-scroll">
              {step === 1 && (
                <>
                  <h3>Chọn vùng đất</h3>
                  <p>Chọn tỉnh để lọc bản đồ. Hệ thống sẽ giới hạn lộ trình trong các tỉnh này.</p>
                  {sitesLoading ? <SkeletonRows count={5} /> : (
                    <div className="province-grid modal-grid">
                      {provinces.slice(0, 60).map(province => (
                        <button key={province} className={selectedProvinces.has(province) ? 'active' : ''} onClick={() => toggleProvince(province)} disabled={busy}>{province}</button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {step === 2 && (
                <>
                  <h3>Di sản ưu tiên (Bắt buộc)</h3>
                  <p>Đây là các di sản bạn <strong>chắc chắn</strong> muốn đi qua. Hãy đóng hộp thoại này, bấm vào marker trên bản đồ để xem và "Đưa vào lịch trình".</p>
                  <SelectedSites sites={selectedSites} remove={toggleSelected} focus={setActiveSite} disabled={busy} />
                  <label style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', color: selectedProvinces.size ? 'rgb(var(--museum-gold))' : 'rgb(var(--museum-muted))' }}>
                    <input type="checkbox" checked={minimizedPlanner} onChange={e => { setMinimizedPlanner(e.target.checked); if (e.target.checked) setOpen(false); else setOpen(true); }} disabled={busy || !selectedProvinces.size} style={{ accentColor: 'rgb(var(--museum-gold))' }} />
                    Thu nhỏ để chọn điểm trực tiếp trên bản đồ
                  </label>
                </>
              )}

              {step === 3 && (
                <>
                  <h3>AI hiểu bạn hơn</h3>
                  <p>Trả lời nhanh để hệ thống chọn điểm di sản hợp người đi, nhịp độ, thời tiết và chất lượng không khí.</p>
                  <div className="question-grid">
                    <label>Mục tiêu chuyến đi
                      <select value={planner.tripGoal || ''} onChange={e => setPlanner(v => ({ ...v, tripGoal: e.target.value }))} disabled={busy}>
                        <option value="">Chọn mục tiêu</option>
                        <option value="Tìm hiểu lịch sử chiều sâu">Tìm hiểu lịch sử chiều sâu</option>
                        <option value="Check-in di sản nổi bật">Check-in di sản nổi bật</option>
                        <option value="Hành hương và tâm linh">Hành hương và tâm linh</option>
                        <option value="Gia đình nhẹ nhàng">Gia đình nhẹ nhàng</option>
                      </select>
                    </label>
                    <label>Đi cùng ai?
                      <select value={planner.travelGroup || ''} onChange={e => setPlanner(v => ({ ...v, travelGroup: e.target.value }))} disabled={busy}>
                        <option value="">Chọn nhóm đi</option>
                        <option value="Có trẻ em">Có trẻ em</option>
                        <option value="Có người lớn tuổi">Có người lớn tuổi</option>
                        <option value="Nhóm bạn trẻ">Nhóm bạn trẻ</option>
                        <option value="Đi một mình">Đi một mình</option>
                      </select>
                    </label>
                    <label>Nhịp độ mong muốn
                      <select value={planner.pace || 'moderate'} onChange={e => setPlanner(v => ({ ...v, pace: e.target.value }))} disabled={busy}>
                        <option value="relaxed">Thong thả</option>
                        <option value="moderate">Vừa phải</option>
                        <option value="packed">Đi nhiều điểm</option>
                      </select>
                    </label>
                    <label>Ưu tiên môi trường
                      <select value={planner.environmentPreference || ''} onChange={e => setPlanner(v => ({ ...v, environmentPreference: e.target.value }))} disabled={busy}>
                        <option value="">Không ưu tiên đặc biệt</option>
                        <option value="Ưu tiên điểm trong nhà nếu mưa hoặc chất lượng không khí kém">Ưu tiên trong nhà khi AQI kém</option>
                        <option value="Ưu tiên ngoài trời khi thời tiết đẹp">Ưu tiên ngoài trời khi đẹp trời</option>
                        <option value="Hạn chế di chuyển xa">Hạn chế di chuyển xa</option>
                      </select>
                    </label>
                  </div>
                  <div className="interest-box">
                    <label>Sở thích chính</label>
                    <div>
                      {interests.map(interest => {
                        const isSelected = (planner.selectedInterests || []).includes(interest);
                        return <button key={interest} type="button" className={`ghost ${isSelected ? 'active' : ''}`} onClick={() => toggleInterest(interest)} disabled={busy}>{interest}</button>;
                      })}
                    </div>
                  </div>
                </>
              )}

              {step === 4 && (
                <section className="departure-step">
                  <div className="departure-header">
                    <h3>Khởi hành</h3>
                    <p>Gõ địa chỉ, chọn gợi ý, hoặc dùng tính năng vị trí.</p>
                  </div>

                  {selectedSites.length > 0 && (
                    <div className="selected-sites-notice">
                      ✓ Đã chọn {selectedSites.length} điểm — hệ thống sẽ lập tuyến theo các điểm này.
                    </div>
                  )}

                  <div className="departure-grid">
                    <div className="location-card">
                      <LocationSearchInput
                        label="Điểm xuất phát"
                        showSub={false}
                        value={planner.startText}
                        disabled={busy}
                        loading={actionLoading === 'geo-start'}
                        placeholder="Tìm địa chỉ hoặc tên địa danh..."
                        onChange={value => setPlanner(v => ({ ...v, startText: value }))}
                        onSelect={point => selectPoint('start', point)}
                      />

                      <div className="location-actions">
                        <button
                          className="ghost action-btn"
                          onClick={() => getBrowserLocation('start')}
                          disabled={busy}
                        >
                          {actionLoading === 'browser-location' ? <Spinner /> : '🧭'}
                          <span>Vị trí hiện tại</span>
                        </button>

                        <button
                          className="ghost action-btn"
                          onClick={() => startPickingMap('start')}
                          disabled={busy}
                        >
                          📍 <span>Chọn bản đồ</span>
                        </button>
                      </div>
                    </div>

                    <div className="location-card">
                      <LocationSearchInput
                        label="Điểm kết thúc"
                        showSub={false}
                        value={planner.endText}
                        disabled={busy}
                        loading={actionLoading === 'geo-end'}
                        placeholder="Để trống nếu quay về điểm xuất phát"
                        onChange={value => setPlanner(v => ({ ...v, endText: value }))}
                        onSelect={point => selectPoint('end', point)}
                      />

                      <div className="location-actions">
                        <button
                          className="ghost action-btn"
                          onClick={() => getBrowserLocation('end')}
                          disabled={busy}
                        >
                          {actionLoading === 'browser-location' ? <Spinner /> : '🧭'}
                          <span>Vị trí hiện tại</span>
                        </button>

                        <button
                          className="ghost action-btn"
                          onClick={() => startPickingMap('end')}
                          disabled={busy}
                        >
                          📍 <span>Chọn bản đồ</span>
                        </button>

                        <button
                          className="ghost action-btn round-trip-btn"
                          onClick={makeRoundTrip}
                          disabled={busy}
                        >
                          ↩ <span>Khứ hồi</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {step === 5 && (
                <>
                  <h3>Lộ trình</h3>
                  <div className="form-grid compact step-4-grid">
                    <label>Số ngày
                      <input type="number" min="1" value={planner.days} onChange={e => setPlanner(v => ({ ...v, days: e.target.value }))} disabled={busy} />
                    </label>
                    <label>Số người
                      <input type="number" min="1" value={planner.people} onChange={e => setPlanner(v => ({ ...v, people: e.target.value }))} disabled={busy} />
                    </label>
                    <label>Phương tiện
                      <select value={planner.mode} onChange={e => setPlanner(v => ({ ...v, mode: e.target.value }))} disabled={busy}>
                        <option value="driving">🚗 Ô tô</option>
                        <option value="motorbike">🏍 Xe máy</option>
                        <option value="walking">🚶 Đi bộ</option>
                        <option value="transit">🚌 Công cộng</option>
                      </select>
                    </label>
                    <label>Ngày đi
                      <input type="date" value={planner.tripDate} onChange={e => setPlanner(v => ({ ...v, tripDate: e.target.value }))} disabled={busy} />
                    </label>
                    <div className="time-group">
                      <label>Giờ bắt đầu
                        <input type="time" value={planner.windowStart} onChange={e => setPlanner(v => ({ ...v, windowStart: e.target.value }))} disabled={busy} />
                      </label>
                      <label>Giờ kết thúc
                        <input type="time" value={planner.windowEnd} onChange={e => setPlanner(v => ({ ...v, windowEnd: e.target.value }))} disabled={busy} />
                      </label>
                    </div>
                    <div className="limit-group">
                      <label>Km tối đa
                        <input value={planner.maxDistanceKm} onChange={e => setPlanner(v => ({ ...v, maxDistanceKm: e.target.value }))} disabled={busy} placeholder="Tùy chọn" />
                      </label>
                      <label>Phút tối đa
                        <input value={planner.maxDurationMin} onChange={e => setPlanner(v => ({ ...v, maxDurationMin: e.target.value }))} disabled={busy} placeholder="Tùy chọn" />
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="modal-actions">
              {step === 1 && <button className="primary" onClick={() => setStep(2)} disabled={busy || sitesLoading}>Tiếp tục</button>}
              {step === 2 && <><button className="ghost" onClick={() => setStep(1)} disabled={busy}>Quay lại</button><button className="primary" onClick={() => setStep(3)} disabled={busy}>Tiếp tục</button></>}
              {step === 3 && <><button className="ghost" onClick={() => setStep(2)} disabled={busy}>Quay lại</button><button className="primary" onClick={() => setStep(4)} disabled={busy}>Tiếp tục</button></>}
              {step === 4 && <><button className="ghost" onClick={useCenter} disabled={busy || !selectedProvinces.size}>Về trung tâm vùng đất</button><button className="ghost" onClick={() => setStep(3)} disabled={busy}>Quay lại</button><button className="primary" onClick={() => setStep(5)} disabled={busy}>Tiếp tục</button></>}
              {step === 5 && <><button className="ghost" onClick={() => setStep(4)} disabled={busy}>Quay lại</button><button className="primary" onClick={planRoute} disabled={busy || sitesLoading}>{loading ? <><Spinner /> Đang tạo lộ trình</> : 'Ban chiếu lập tuyến'}</button></>}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Spinner() { return <i className="loading-spinner" aria-hidden="true" />; }
function InlineLoading({ text }) { return <div className="inline-loading"><Spinner /><span>{text}</span></div>; }
function MapLoadingOverlay({ text }) { return <div className="map-loading-overlay"><div><Spinner /><strong>{text}</strong><small>Đang chuẩn bị tư liệu hành trình</small></div></div>; }
function SkeletonRows({ count = 4 }) { return <div className="skeleton-list">{Array.from({ length: count }).map((_, index) => <span key={index} />)}</div>; }
function StatusBanner({ status }) { return <div className={`status ${status.type}`}>{status.text}</div>; }
function SearchBox({ query, setQuery, suggestions, choose }) { return <div className="map-search-center"><div className="map-search-card"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm kiếm trên bản đồ" />{query && <button onClick={() => setQuery('')}>×</button>}</div>{suggestions.length > 0 && <div className="search-suggestions">{suggestions.map(item => <button key={`${item.type}-${item.id}`} onClick={() => choose(item)}><span>{item.type === 'site' ? '⌖' : '◉'}</span><div><strong>{item.label}</strong><small>{item.sub}</small></div></button>)}</div>}</div>; }
function CategoryFilters({ categories, selected, toggle, clear, loading }) { return <aside className="category-filter"><div><strong>Loại địa điểm</strong>{selected.size > 0 && <button onClick={clear} disabled={loading}>Tất cả</button>}</div>{loading ? <SkeletonRows count={6} /> : categories.map(category => { const [color, icon] = CAT_STYLE[category] || CAT_STYLE.default; return <button key={category} className={selected.has(category) ? 'active' : ''} style={{ '--cat-color': color }} onClick={() => toggle(category)}><span>{icon}</span>{categoryLabel(category)}</button>; })}</aside>; }
function SelectedSites({ sites, remove, focus, disabled }) { return <div className="selected-box">{sites.length ? sites.map(site => <button key={site.id} onClick={() => focus(site)} disabled={disabled}>{site.name}<span onClick={e => { e.stopPropagation(); if (!disabled) remove(site.id); }}>×</span></button>) : <p>Chưa chọn điểm bắt buộc nào.</p>}</div>; }
function RouteSummary({ route, openPlanner, focus }) {
  const formatTime = (min) => {
    const m = Math.round(min);
    if (m < 60) return `${m} phút`;
    const h = Math.floor(m / 60);
    const m2 = m % 60;
    return m2 > 0 ? `${h}h ${m2}p` : `${h}h`;
  };
  const notes = formatRouteWarnings(route.warnings || []);
  const totalStops = (route.days || []).reduce((acc, d) => acc + (d.stops?.length || 0), 0);
  const dayColors = ['#9f1d19', '#b88935', '#6f3f20', '#3f7a4c', '#6f1714'];

  return <aside className="route-summary">
    <div className="rs-header">
      <div className="rs-status-badge">
        <span className="rs-status-dot" style={{ background: route.status === 'feasible' ? '#3f7a4c' : '#d7a84f' }} />
        {route.status === 'feasible' ? 'Lộ trình khả thi' : 'Cần chỉnh lộ trình'}
      </div>
      <div className="rs-stats">
        <div className="rs-stat"><strong>📏</strong><span>{Number(route.total_distance_km).toFixed(1)} km</span></div>
        <div className="rs-stat"><strong>⏱</strong><span>{formatTime(route.total_duration_min)}</span></div>
        <div className="rs-stat"><strong>📍</strong><span>{totalStops} di sản</span></div>
      </div>
    </div>

    {route.summary && <p className="ai-summary">📝 {route.summary}</p>}

    {notes.length > 0 && <div className="route-notes"><strong>Ghi chú hành trình</strong>{notes.map(note => <p key={note}>{note}</p>)}</div>}

    <div className="route-days">
      {route.days?.map((day, idx) => <div className="day" key={day.day} style={{ borderLeftColor: dayColors[idx % dayColors.length] }}>
        <h3><span className="day-number" style={{ background: dayColors[idx % dayColors.length] }}>{day.day}</span>Ngày {day.day}</h3>
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
          <p>Ngày tự do — Khám phá ẩm thực địa phương, dạo chợ, chụp ảnh</p>
        </div>}
      </div>)}
    </div>

    <div className="rs-actions">
      <button className="rs-btn-ghost" onClick={openPlanner}>← Chỉnh sửa lịch trình</button>
    </div>
  </aside>;
}

function formatRouteWarnings(warnings) {
  const mapped = warnings.map(warning => {
    const text = String(warning || '').toLowerCase();
    if (text.includes('sklearn') || text.includes('kmeans') || text.includes('latitude split')) {
      return 'Các điểm ghé thăm được chia theo trục Bắc - Nam để cân bằng từng ngày.';
    }
    if (text.includes('osrm') || text.includes('route request') || text.includes('table request')) {
      return 'Một đoạn đường đang dùng ước lượng tạm thời vì dữ liệu tuyến chưa sẵn sàng.';
    }
    if (text.includes('avoid_highways') || text.includes('avoid_tolls')) {
      return 'Tùy chọn tránh cao tốc hoặc trạm thu phí hiện chỉ dùng như gợi ý tham khảo.';
    }
    if (text.includes('motorbike') || text.includes('walking')) {
      return 'Thời gian di chuyển được quy đổi theo dữ liệu đường ô tô, cần đối chiếu khi đi xe máy hoặc đi bộ.';
    }
    if (text.includes('transit')) {
      return 'Phương tiện công cộng cần thêm dữ liệu chuyên biệt, hiện chưa thể lập tuyến chính xác.';
    }
    return warning;
  }).filter(Boolean);
  return [...new Set(mapped)];
}
function MiniSitePopup({ site, pos, popupRef, selected, toggle, detail, close, keepHover, endHover }) { const cats = site.categories || []; return <div ref={popupRef} className="mini-site-popup" style={{ left: pos.x, top: pos.y }} onMouseEnter={keepHover} onMouseLeave={endHover}><button className="mini-close" onClick={close}>×</button><div className="site-kicker">Điểm di sản</div><h2>{site.name}</h2><p className="province">📍 {site.province}</p><div className="badges">{cats.slice(0, 3).map(cat => <span key={cat}>{categoryLabel(cat)}</span>)}</div><p>{site.description || site.long_description || 'Đang cập nhật thông tin.'}</p><dl><dt>Giờ mở cửa</dt><dd>{site.opening_hours || '08:00-17:00'}</dd><dt>Thời lượng</dt><dd>{site.estimated_visit_minutes || 60} phút</dd><dt>Giá vé</dt><dd>{formatPrice(site.ticket_price)}</dd></dl><div className="site-actions"><button className="primary" onClick={toggle}>{selected ? 'Bỏ chọn' : 'Chọn điểm này'}</button><button className="ghost" onClick={detail}>Xem chi tiết</button></div></div>; }
function SiteDetailDialog({ site, selected, toggle, close }) {
  const [images, setImages] = useState([]); const [reviews, setReviews] = useState([]); const [enriched, setEnriched] = useState(null); const [slide, setSlide] = useState(0); const [detailLoading, setDetailLoading] = useState(false); const open = Boolean(site);
  useEffect(() => { if (!site) return; let alive = true; setImages([]); setReviews([]); setEnriched(null); setSlide(0); setDetailLoading(true); Promise.allSettled([fetch(`${API}/heritage-sites/${site.id}/images`).then(r => r.json()), fetch(`${API}/heritage-sites/${site.id}/reviews`).then(r => r.json()), fetch(`${API}/heritage-sites/${site.id}/enrich`).then(r => r.json())]).then(([img, rev, enr]) => { if (!alive) return; if (img.status === 'fulfilled') setImages(img.value.images || []); if (rev.status === 'fulfilled' && Array.isArray(rev.value)) setReviews(rev.value); if (enr.status === 'fulfilled') setEnriched(enr.value); }).finally(() => { if (alive) setDetailLoading(false); }); return () => { alive = false; }; }, [site]);
  if (!site) return null;
  const description = enriched?.long_description || site.long_description || site.description || 'Đang cập nhật thông tin.'; const tips = enriched?.visit_tips || site.visit_tips;
  if (detailLoading) return <Dialog.Root open={open} onOpenChange={value => !value && close()}><Dialog.Portal><Dialog.Overlay className="dialog-overlay" /><Dialog.Content className="detail-modal"><Dialog.Close className="modal-close">&times;</Dialog.Close><InlineLoading text="Đang mở hồ sơ di sản..." /><div className="detail-layout"><div className="detail-left"><div className="detail-carousel"><div className="detail-placeholder"><span><Spinner /></span><strong>{site.name}</strong><small>Đang tải ảnh và tư liệu...</small></div></div></div><div className="detail-right"><div className="detail-header"><div className="site-kicker">Hồ sơ di sản</div><Dialog.Title>{site.name}</Dialog.Title><Dialog.Description>📍 {site.province}</Dialog.Description><div className="badges">{(site.categories || []).map(cat => <span key={cat}>{categoryLabel(cat)}</span>)}</div></div><div className="detail-body"><h3>Giới thiệu</h3><SkeletonRows count={4} /></div></div></div></Dialog.Content></Dialog.Portal></Dialog.Root>;
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
                          aria-label="Ảnh trước"
                        >
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M11 3L5 9L11 15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button
                          className="carousel-nav next"
                          onClick={() => setSlide((slide + 1) % images.length)}
                          aria-label="Ảnh tiếp"
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
                              aria-label={`Ảnh ${i + 1}`}
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
                    <small>Chưa có ảnh</small>
                  </div>
                )}
              </div>
              <dl className="detail-quick-info">
                <div><dt>🕰 Giờ mở cửa</dt><dd>{site.opening_hours || '08:00-17:00'}</dd></div>
                <div><dt>⏳ Thời lượng</dt><dd>{site.estimated_visit_minutes || 60} phút</dd></div>
                <div><dt>🎫 Giá vé</dt><dd>{formatPrice(site.ticket_price)}</dd></div>
                <div><dt>★ Phổ biến</dt><dd>{scorePercent(site.popularity_score)}</dd></div>
                <div><dt>✦ Lịch sử</dt><dd>{scorePercent(site.historical_importance_score)}</dd></div>
              </dl>
              <div className="site-actions">
                <button className="primary" onClick={toggle}>
                  {selected ? 'Bỏ chọn khỏi hành trình' : 'Chọn vào hành trình'}
                </button>
                <a
                  className="ghost link-btn"
                  href={`https://www.google.com/maps?q=${site.lat},${site.lng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Mở bản đồ
                </a>
              </div>
            </div>
            {/* RIGHT: Header + Description + Reviews */}
            <div className="detail-right">
              <div className="detail-header">
                <div className="site-kicker">Hồ sơ di sản</div>
                <Dialog.Title>{site.name}</Dialog.Title>
                <Dialog.Description>📍 {site.province}</Dialog.Description>
                <div className="badges">
                  {(site.categories || []).slice(0, 4).map((cat) => (
                    <span key={cat}>{categoryLabel(cat)}</span>
                  ))}
                </div>
              </div>
              <div className="detail-body">
                <h3>Giới thiệu</h3>
                <DescriptionText text={description} />
                {tips && (
                  <div className="tips">
                    <strong>Lưu ý tham quan</strong>
                    <p>{tips}</p>
                  </div>
                )}
                <section className="reviews">
                  <h3>Đánh giá nổi bật</h3>
                  {reviews.length ? (
                    reviews.slice(0, 4).map((review, i) => (
                      <article key={`${review.author}-${i}`}>
                        <div>
                          <strong>{review.author || 'Khách tham quan'}</strong>
                          <span>{stars(review.rating)}</span>
                        </div>
                        <p>{review.text}</p>
                        <a href={reviewUrl(review, site)} target="_blank" rel="noreferrer">
                          {review.source || 'Tìm đánh giá'} ↗
                        </a>
                      </article>
                    ))
                  ) : (
                    <p>Chưa có đánh giá. Hệ thống sẽ bổ sung khi có dữ liệu.</p>
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

