import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const OSM_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

/**
 * Chọn toạ độ bằng cách click lên bản đồ. value = {lat,lng} | null.
 * onPick(lat, lng) được gọi khi click.
 */
export default function MapPicker({ value, onPick }) {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (mapRef.current || !ref.current) return;
    const map = new maplibregl.Map({
      container: ref.current,
      style: OSM_STYLE,
      center: value?.lng != null ? [value.lng, value.lat] : [106.0, 16.0],
      zoom: value?.lng != null ? 8 : 4.6,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.on("click", (e) => {
      const { lat, lng } = e.lngLat;
      onPick(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Đồng bộ marker theo value
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (value?.lat == null || value?.lng == null) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }
    if (!markerRef.current) {
      markerRef.current = new maplibregl.Marker({ color: "#D8A24A" });
    }
    markerRef.current.setLngLat([value.lng, value.lat]).addTo(map);
  }, [value?.lat, value?.lng]);

  return (
    <div className="space-y-1">
      <div ref={ref} className="h-56 w-full overflow-hidden rounded-lg border border-border" />
      <p className="text-xs text-muted-foreground">
        Click lên bản đồ để chọn toạ độ.{" "}
        {value?.lat != null ? `Đang chọn: ${value.lat}, ${value.lng}` : "Chưa chọn."}
      </p>
    </div>
  );
}
