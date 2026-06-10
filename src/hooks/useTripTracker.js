import { useCallback, useEffect, useRef, useState } from "react";

// Haversine (mét)
function haversineM(a, b) {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

const MAX_ACCURACY_M = 50; // bỏ điểm GPS quá nhiễu
const MIN_STEP_M = 4; // bỏ rung khi đứng yên
const MAX_SPEED_MS = 35; // ~126 km/h: loại điểm nhảy bất thường

/**
 * Ghi hành trình GPS ở chế độ foreground.
 * Trả về tuyến đường, quãng đường, thời lượng + điều khiển start/pause/resume/stop.
 */
export default function useTripTracker() {
  const [status, setStatus] = useState("idle"); // 'idle' | 'tracking' | 'paused'
  const [points, setPoints] = useState([]); // [{lat,lng,t}]
  const [distanceM, setDistanceM] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [coords, setCoords] = useState(null); // điểm hiện tại {lat,lng}
  const [error, setError] = useState(null);

  const watchIdRef = useRef(null);
  const wakeLockRef = useRef(null);
  const tickRef = useRef(null);
  const lastPtRef = useRef(null);
  const activeMsRef = useRef(0);
  const lastTickRef = useRef(null);
  const startedAtRef = useRef(null);

  const requestWakeLock = useCallback(async () => {
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
      }
    } catch {
      /* không chặn nếu trình duyệt không hỗ trợ */
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    try {
      wakeLockRef.current?.release?.();
    } catch {
      /* ignore */
    }
    wakeLockRef.current = null;
  }, []);

  const onPosition = useCallback((pos) => {
    const { latitude, longitude, accuracy } = pos.coords;
    const now = pos.timestamp || Date.now();
    const p = { lat: latitude, lng: longitude, t: now };
    setCoords({ lat: latitude, lng: longitude, accuracy });

    if (accuracy != null && accuracy > MAX_ACCURACY_M) return; // nhiễu

    const last = lastPtRef.current;
    if (last) {
      const d = haversineM(last, p);
      const dt = Math.max((now - last.t) / 1000, 0.1);
      const speed = d / dt;
      if (d < MIN_STEP_M) return; // đứng yên / rung
      if (speed > MAX_SPEED_MS) return; // điểm nhảy bất thường
      setDistanceM((prev) => prev + d);
    }
    lastPtRef.current = p;
    setPoints((prev) => [...prev, p]);
  }, []);

  const startWatch = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setError("Trình duyệt không hỗ trợ định vị.");
      return;
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      onPosition,
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 },
    );
  }, [onPosition]);

  const stopWatch = useCallback(() => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Đồng hồ thời lượng (chỉ chạy khi đang tracking, trừ thời gian tạm dừng)
  useEffect(() => {
    if (status === "tracking") {
      lastTickRef.current = Date.now();
      tickRef.current = setInterval(() => {
        const now = Date.now();
        activeMsRef.current += now - lastTickRef.current;
        lastTickRef.current = now;
        setDurationSec(Math.floor(activeMsRef.current / 1000));
      }, 1000);
    }
    return () => clearInterval(tickRef.current);
  }, [status]);

  // Giữ Wake Lock lại khi quay lại tab
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible" && status === "tracking") {
        requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [status, requestWakeLock]);

  const start = useCallback(() => {
    setPoints([]);
    setDistanceM(0);
    setDurationSec(0);
    setError(null);
    lastPtRef.current = null;
    activeMsRef.current = 0;
    startedAtRef.current = new Date();
    startWatch();
    requestWakeLock();
    setStatus("tracking");
  }, [startWatch, requestWakeLock]);

  const pause = useCallback(() => {
    stopWatch();
    setStatus("paused");
  }, [stopWatch]);

  const resume = useCallback(() => {
    startWatch();
    requestWakeLock();
    setStatus("tracking");
  }, [startWatch, requestWakeLock]);

  const stop = useCallback(() => {
    stopWatch();
    releaseWakeLock();
    setStatus("idle");
    return {
      points,
      distanceM: Math.round(distanceM),
      durationSec,
      startedAt: startedAtRef.current?.toISOString() ?? null,
      endedAt: new Date().toISOString(),
    };
  }, [stopWatch, releaseWakeLock, points, distanceM, durationSec]);

  // Dọn dẹp khi unmount
  useEffect(() => {
    return () => {
      stopWatch();
      releaseWakeLock();
      clearInterval(tickRef.current);
    };
  }, [stopWatch, releaseWakeLock]);

  return {
    status,
    points,
    distanceM: Math.round(distanceM),
    durationSec,
    coords,
    error,
    start,
    pause,
    resume,
    stop,
    isTracking: status === "tracking",
    isPaused: status === "paused",
    isIdle: status === "idle",
  };
}
