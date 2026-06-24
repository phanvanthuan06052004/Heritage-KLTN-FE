import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation, Trans } from "react-i18next";
import { toast } from "react-toastify";
import {
  Play, Pause, Square, Camera, MapPin, Route, Clock, Flame, X, Loader2, Globe, Lock,
  Image as ImageIcon, Repeat, Landmark,
} from "lucide-react";
import { selectCurrentUser } from "~/store/slices/authSlice";
import { BASE_URL } from "~/constants/fe.constant";
import { useCreateTripMutation, useGetTripQuery } from "~/store/apis/tripApi";
import useTripTracker from "~/hooks/useTripTracker";
import RouteMap from "./RouteMap";

// khoảng cách (m) để coi là "đã đi qua" một điểm của tuyến mẫu
const FOLLOW_HIT_M = 60;
function havM(a, b) {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

const fmtDur = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
};
const fmtKm = (m) => (m / 1000).toFixed(2);
const fmtPace = (m, s) => {
  if (!m || m < 30) return "--";
  const minPerKm = s / 60 / (m / 1000);
  const mm = Math.floor(minPerKm);
  const ss = Math.round((minPerKm - mm) * 60);
  return `${mm}'${String(ss).padStart(2, "0")}"/km`;
};

async function downscale(file, maxSize = 1280, q = 0.82) {
  const dataUrl = await new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = dataUrl;
  });
  const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * scale);
  c.height = Math.round(img.height * scale);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  return new Promise((res) => c.toBlob(res, "image/jpeg", q));
}
async function uploadPhoto(file) {
  const blob = await downscale(file).catch(() => file);
  const fd = new FormData();
  fd.append("image", blob, "trip.jpg");
  const res = await fetch(`${BASE_URL}/media/upload`, { method: "POST", body: fd });
  if (!res.ok) throw new Error("upload_failed");
  const json = await res.json();
  return json.imageUrl || json?.data?.imageUrl || null;
}

export default function TripRecorder() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const tracker = useTripTracker();
  const [createTrip, { isLoading: saving }] = useCreateTripMutation();

  // ── Follow mode: trải nghiệm lại hành trình của người khác ──
  const [searchParams] = useSearchParams();
  const followId = searchParams.get("follow");
  const { data: originalTrip } = useGetTripQuery(followId, { skip: !followId });
  const ghostPoints = originalTrip?.points || [];
  const ghostHeritages = originalTrip?.heritages || [];
  const visitedRef = useRef(new Set());
  const [followProgress, setFollowProgress] = useState(0); // % tuyến mẫu đã đi qua
  const [offTrackM, setOffTrackM] = useState(null); // khoảng cách lệch tuyến

  // Cập nhật tiến độ bám tuyến mỗi khi có điểm GPS mới
  useEffect(() => {
    if (!followId || ghostPoints.length === 0) return;
    const cur = tracker.coords;
    if (!cur) return;
    let minD = Infinity;
    ghostPoints.forEach((g, i) => {
      const d = havM(cur, g);
      if (d < minD) minD = d;
      if (d <= FOLLOW_HIT_M) visitedRef.current.add(i);
    });
    setOffTrackM(Math.round(minD));
    setFollowProgress(Math.round((visitedRef.current.size / ghostPoints.length) * 100));
  }, [tracker.coords, followId, ghostPoints]);

  const [moments, setMoments] = useState([]);
  const [momentForm, setMomentForm] = useState(null); // {note, file, preview, uploading}
  const [summary, setSummary] = useState(null); // {points,distanceM,durationSec,...}
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [weight, setWeight] = useState(() => localStorage.getItem("heritage_weight_kg") || "");
  const fileRef = useRef(null);

  const openMoment = () => {
    if (!tracker.coords) return toast.error(t("trip.noGps"));
    setMomentForm({ note: "", file: null, preview: null, uploading: false });
  };

  const pickPhoto = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setMomentForm((m) => ({ ...m, file: f, preview: URL.createObjectURL(f) }));
  };

  const addMoment = async () => {
    let photoUrl = null;
    if (momentForm.file) {
      setMomentForm((m) => ({ ...m, uploading: true }));
      try {
        photoUrl = await uploadPhoto(momentForm.file);
      } catch {
        toast.error(t("trip.photoUploadFailed"));
        setMomentForm((m) => ({ ...m, uploading: false }));
        return;
      }
    }
    setMoments((prev) => [
      ...prev,
      { lat: tracker.coords.lat, lng: tracker.coords.lng, photoUrl, note: momentForm.note?.trim() || null },
    ]);
    setMomentForm(null);
    toast.success(t("trip.momentAdded"));
  };

  const handleStop = () => {
    const s = tracker.stop();
    if (s.points.length < 2) {
      toast.info(t("trip.tooShort"));
      return;
    }
    setSummary(s);
    setTitle("");
  };

  const handleSave = async () => {
    if (!user) return toast.error(t("trip.pleaseLogin"));
    const w = Number(weight);
    if (w > 0) localStorage.setItem("heritage_weight_kg", String(w));
    try {
      const { trip, progress, followBonus } = await createTrip({
        userId: user._id || user.id,
        displayName: user.displayname || null,
        avatarUrl: user.avatar || null,
        title: title.trim() || undefined,
        startedAt: summary.startedAt,
        endedAt: summary.endedAt,
        durationSec: summary.durationSec,
        distanceM: summary.distanceM,
        weightKg: w > 0 ? w : undefined,
        points: summary.points,
        coverPhoto: moments.find((m) => m.photoUrl)?.photoUrl || null,
        visibility,
        moments,
        followedTripId: followId || undefined,
      }).unwrap();
      toast.success(
        t("trip.saved", { xp: trip.xpAwarded }) +
          (followBonus ? t("trip.followBonus", { bonus: followBonus }) : "") +
          (progress?.leveledUp ? t("trip.leveledUp") : ""),
      );
      navigate(`/trips/${trip.id}`);
    } catch (e) {
      toast.error(e?.data?.message || t("trip.saveFailed"));
    }
  };

  const stat = (Icon, label, value) => (
    <div className="flex flex-col items-center">
      <span className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-museum-muted">
        <Icon className="h-3.5 w-3.5" /> {label}
      </span>
      <span className="font-display text-2xl font-bold text-museum-ivory tabular-nums">{value}</span>
    </div>
  );

  return (
    <section className="museum-shell min-h-screen pt-navbar-mobile sm:pt-navbar">
      <div className="lcn-container-x py-6">
        <div className="mb-4 flex items-center gap-2">
          <Route className="h-6 w-6 text-museum-gold-light" />
          <h1 className="font-display text-2xl font-bold text-museum-ivory">
            {followId ? t("trip.reliveTitle") : t("trip.recordTitle")}
          </h1>
        </div>

        {/* Banner follow mode */}
        {followId && originalTrip && (
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-museum-gold/25 bg-museum-gold/8 p-3.5">
            <Repeat className="h-5 w-5 shrink-0 text-museum-gold-light" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-museum-parchment">
                <Trans
                  i18nKey="trip.followingRoute"
                  values={{
                    name: originalTrip.displayName || t("trip.user"),
                    km: (originalTrip.distanceM / 1000).toFixed(2),
                  }}
                  components={{
                    routeLink: (
                      <Link
                        to={`/trips/${followId}`}
                        className="font-semibold text-museum-gold-light underline-offset-2 hover:underline"
                      >
                        {originalTrip.title}
                      </Link>
                    ),
                    author: <span className="text-museum-ivory" />,
                  }}
                />
              </p>
              {ghostHeritages.length > 0 && (
                <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-museum-muted">
                  <Landmark className="h-3.5 w-3.5 text-museum-gold-light/80" />
                  {t("trip.checkpoint")}: {ghostHeritages.map((h) => h.name).join(" · ")}
                </p>
              )}
            </div>
            {!tracker.isIdle && (
              <div className="flex shrink-0 flex-col items-end">
                <span className="font-display text-xl font-bold text-museum-gold-light tabular-nums">{followProgress}%</span>
                <span className="text-[10px] uppercase tracking-wide text-museum-muted">
                  {t("trip.onTrack")}
                  {offTrackM != null
                    ? ` · ${t("trip.offBy", {
                        dist: offTrackM >= 1000 ? (offTrackM / 1000).toFixed(1) + " km" : offTrackM + " m",
                      })}`
                    : ""}
                </span>
              </div>
            )}
          </div>
        )}

        {tracker.error && (
          <div className="mb-3 rounded-xl bg-museum-seal/15 p-3 text-sm text-museum-seal">{tracker.error}</div>
        )}

        {/* Bản đồ live */}
        <div className="museum-card relative h-[58vh] min-h-[440px] overflow-hidden rounded-[2rem] bg-museum-black/55 p-2.5 shadow-museum-card">
          <RouteMap
            points={tracker.points}
            current={tracker.coords}
            moments={moments}
            ghostPoints={ghostPoints}
            heritages={ghostHeritages}
            mode="live"
            className="h-full w-full overflow-hidden rounded-[1.6rem]"
          />
          {/* Stats overlay */}
          <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex justify-around rounded-2xl border border-museum-gold/25 bg-museum-black/80 px-4 py-3 backdrop-blur">
            {stat(Route, t("trip.distance"), `${fmtKm(tracker.distanceM)} km`)}
            {stat(Clock, t("trip.duration"), fmtDur(tracker.durationSec))}
            {stat(MapPin, t("trip.pace"), fmtPace(tracker.distanceM, tracker.durationSec))}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-4 flex items-center justify-center gap-3">
          {tracker.isIdle && (
            <button onClick={tracker.start} className="flex items-center gap-2 rounded-full bg-museum-gold px-7 py-3 font-semibold text-museum-black transition-colors hover:bg-museum-gold-light">
              <Play className="h-5 w-5" /> {t("trip.start")}
            </button>
          )}
          {tracker.isTracking && (
            <>
              <button onClick={openMoment} className="flex items-center gap-2 rounded-full border border-museum-gold/40 bg-museum-gold/12 px-5 py-3 font-medium text-museum-gold-light hover:bg-museum-gold/20">
                <Camera className="h-5 w-5" /> {t("trip.moment")}
              </button>
              <button onClick={tracker.pause} className="flex items-center gap-2 rounded-full border border-museum-gold/30 bg-museum-black/60 px-5 py-3 font-medium text-museum-parchment hover:bg-museum-black/80">
                <Pause className="h-5 w-5" /> {t("trip.pause")}
              </button>
              <button onClick={handleStop} className="flex items-center gap-2 rounded-full bg-museum-seal px-5 py-3 font-semibold text-white hover:bg-museum-seal/85">
                <Square className="h-5 w-5" /> {t("trip.finish")}
              </button>
            </>
          )}
          {tracker.isPaused && (
            <>
              <button onClick={tracker.resume} className="flex items-center gap-2 rounded-full bg-museum-gold px-6 py-3 font-semibold text-museum-black hover:bg-museum-gold-light">
                <Play className="h-5 w-5" /> {t("trip.resume")}
              </button>
              <button onClick={handleStop} className="flex items-center gap-2 rounded-full bg-museum-seal px-5 py-3 font-semibold text-white hover:bg-museum-seal/85">
                <Square className="h-5 w-5" /> {t("trip.finish")}
              </button>
            </>
          )}
        </div>

        {moments.length > 0 && (
          <p className="mt-3 text-center text-xs text-museum-muted">
            <ImageIcon className="mr-1 inline h-3.5 w-3.5" />
            {t("trip.momentsRecorded", { count: moments.length })}
          </p>
        )}
      </div>

      {/* Form khoảnh khắc */}
      {momentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMomentForm(null)} aria-label={t("trip.close")} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-museum-gold/20 bg-museum-black p-5 shadow-museum-card">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-museum-ivory">{t("trip.momentsAlongWay")}</h3>
              <button onClick={() => setMomentForm(null)} className="text-museum-muted hover:text-museum-parchment"><X className="h-5 w-5" /></button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickPhoto} />
            <button onClick={() => fileRef.current?.click()} className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-museum-gold/30 bg-museum-black/50 py-6 text-sm text-museum-gold-light hover:bg-museum-gold/8">
              {momentForm.preview ? <img src={momentForm.preview} alt="" className="max-h-40 rounded-lg object-cover" /> : <><Camera className="h-5 w-5" /> {t("trip.addPhotoOptional")}</>}
            </button>
            <textarea
              value={momentForm.note}
              onChange={(e) => setMomentForm((m) => ({ ...m, note: e.target.value }))}
              placeholder={t("trip.feelingPlaceholder")}
              className="mb-3 w-full resize-none rounded-xl border border-museum-gold/20 bg-museum-ivory px-3 py-2 text-sm text-museum-black placeholder:text-museum-muted focus:outline-none"
              rows={3}
            />
            <button onClick={addMoment} disabled={momentForm.uploading} className="flex w-full items-center justify-center gap-2 rounded-full bg-museum-gold py-2.5 font-semibold text-museum-black hover:bg-museum-gold-light disabled:opacity-60">
              {momentForm.uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />} {t("trip.saveMoment")}
            </button>
          </div>
        </div>
      )}

      {/* Tổng kết & lưu */}
      {summary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setSummary(null)} aria-label={t("trip.close")} />
          <div className="relative z-10 flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-museum-gold/20 bg-museum-black shadow-museum-card">
            <div className="flex items-center justify-between border-b border-museum-gold/15 p-4">
              <h3 className="font-display text-lg font-semibold text-museum-ivory">{t("trip.summaryTitle")}</h3>
              <button onClick={() => setSummary(null)} className="text-museum-muted hover:text-museum-parchment"><X className="h-5 w-5" /></button>
            </div>
            <div className="overflow-y-auto p-4">
              <div className="h-44 overflow-hidden rounded-xl">
                <RouteMap points={summary.points} moments={moments} mode="view" className="h-full w-full" />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl border border-museum-gold/15 bg-museum-black/50 p-3">
                {stat(Route, t("trip.distance"), `${fmtKm(summary.distanceM)} km`)}
                {stat(Clock, t("trip.duration"), fmtDur(summary.durationSec))}
                {stat(Flame, t("trip.kcal"), weight ? Math.round((3.5 * Number(weight) * summary.durationSec) / 3600) : "--")}
              </div>

              <label className="mt-4 block text-xs font-medium text-museum-muted">{t("trip.tripName")}</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("trip.tripNamePlaceholder")} className="mt-1 w-full rounded-xl border border-museum-gold/20 bg-museum-ivory px-3 py-2 text-sm text-museum-black placeholder:text-museum-muted focus:outline-none" />

              <label className="mt-3 block text-xs font-medium text-museum-muted">{t("trip.weightLabel")}</label>
              <input value={weight} onChange={(e) => setWeight(e.target.value)} type="number" placeholder={t("trip.weightPlaceholder")} className="mt-1 w-32 rounded-xl border border-museum-gold/20 bg-museum-ivory px-3 py-2 text-sm text-museum-black placeholder:text-museum-muted focus:outline-none" />

              <div className="mt-4 flex gap-2">
                <button onClick={() => setVisibility("public")} className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm ${visibility === "public" ? "border-museum-gold/50 bg-museum-gold/15 text-museum-gold-light" : "border-museum-gold/15 text-museum-muted"}`}>
                  <Globe className="h-4 w-4" /> {t("trip.public")}
                </button>
                <button onClick={() => setVisibility("private")} className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm ${visibility === "private" ? "border-museum-gold/50 bg-museum-gold/15 text-museum-gold-light" : "border-museum-gold/15 text-museum-muted"}`}>
                  <Lock className="h-4 w-4" /> {t("trip.private")}
                </button>
              </div>
            </div>
            <div className="border-t border-museum-gold/15 p-4">
              <button onClick={handleSave} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-full bg-museum-gold py-3 font-semibold text-museum-black hover:bg-museum-gold-light disabled:opacity-60">
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Route className="h-5 w-5" />} {t("trip.saveToPassport")}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
