import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { X, MapPin, Camera, Loader2, ShieldCheck, Globe, Lock, FlaskConical } from "lucide-react";
import { BASE_URL } from "~/constants/fe.constant";
import { TypeIcon } from "~/pages/HistoricalMap/typeIcons";

/**
 * CheckInModal (Phase 1) — điểm danh GPS có bằng chứng.
 * Luồng: xin vị trí (GPS) -> (tuỳ chọn) chụp/chọn ảnh -> chọn riêng tư/công khai -> gửi.
 * GPS là cổng xác thực (BE so khoảng cách tới toạ độ di tích). Có chế độ demo để test.
 */

// Thu nhỏ ảnh trước khi upload (giữ < 1MB, nhanh hơn).
async function downscaleImage(file, maxSize = 1280, quality = 0.82) {
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
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", quality));
  return blob;
}

export default function CheckInModal({ location, userId, onClose, onDone }) {
  const [coords, setCoords] = useState(null); // {lat,lng,accuracy}
  const [locating, setLocating] = useState(false);
  const [demo, setDemo] = useState(false);
  const [visibility, setVisibility] = useState("public");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ định vị.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
        });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        toast.error(`Không lấy được vị trí: ${err.message}. Có thể dùng chế độ demo.`);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const onPickPhoto = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const uploadPhoto = async () => {
    if (!photoFile) return null;
    const blob = await downscaleImage(photoFile).catch(() => photoFile);
    const fd = new FormData();
    fd.append("image", blob, "checkin.jpg");
    const res = await fetch(`${BASE_URL}/media/upload`, { method: "POST", body: fd });
    if (!res.ok) throw new Error("upload_failed");
    const json = await res.json();
    return json.imageUrl || json?.data?.imageUrl || null;
  };

  const canSubmit = (demo || coords) && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      let photoUrl = null;
      if (photoFile) {
        try {
          photoUrl = await uploadPhoto();
        } catch {
          toast.warn("Tải ảnh thất bại, vẫn điểm danh nhưng không kèm ảnh.");
        }
      }
      const body = {
        userId,
        heritageId: location.id,
        heritageTitle: location.name,
        visibility,
        ...(demo ? { demo: true } : { lat: coords.lat, lng: coords.lng, accuracy: coords.accuracy }),
        ...(photoUrl ? { photoUrl } : {}),
      };
      const res = await fetch(`${BASE_URL}/gamification/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json())?.data;
      if (data?.rejected) {
        toast.error(data.message || "Bạn đang ở quá xa di tích.");
        setSubmitting(false);
        return;
      }
      if (data?.alreadyToday) {
        toast.info("Hôm nay bạn đã điểm danh di tích này rồi.");
      } else if (data?.leveledUp) {
        toast.success(`🎖️ Thăng cấp! Đạt "${data.title}" (cấp ${data.level}) · +${data.xpAwarded} XP`);
      } else {
        toast.success(`✅ Đã xác thực check-in tại ${location.name}! +${data?.xpAwarded ?? 0} XP`);
      }
      onDone?.(data);
      onClose?.();
    } catch {
      toast.error("Điểm danh thất bại, thử lại sau.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-museum-gold/25 bg-museum-black shadow-museum-card sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-museum-gold/15 bg-gradient-to-b from-museum-gold/12 to-transparent p-4">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-museum-gold-light"
            style={{ background: "rgba(216,162,74,0.14)", border: "1px solid rgba(216,162,74,0.35)" }}
          >
            <TypeIcon type={location.type} className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-lg font-bold text-museum-ivory">{location.name}</h3>
            <p className="flex items-center gap-1 text-[11px] text-museum-muted">
              <MapPin className="h-3 w-3" /> {location.province || "Điểm danh tại hiện trường"}
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-museum-muted hover:bg-museum-gold/10 hover:text-museum-parchment" aria-label="Đóng">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-4">
          {/* GPS */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-museum-gold-light">
              1 · Xác thực vị trí (GPS)
            </p>
            {coords ? (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
                Đã lấy vị trí (±{coords.accuracy}m)
              </div>
            ) : (
              <button
                type="button"
                onClick={requestLocation}
                disabled={locating || demo}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-museum-gold/30 bg-museum-gold/10 px-4 py-2.5 text-sm font-medium text-museum-gold-light hover:bg-museum-gold/20 disabled:opacity-50"
              >
                {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                {locating ? "Đang định vị..." : "Lấy vị trí hiện tại"}
              </button>
            )}
            <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-museum-muted">
              <input type="checkbox" checked={demo} onChange={(e) => setDemo(e.target.checked)} className="accent-museum-gold" />
              <FlaskConical className="h-3.5 w-3.5" /> Chế độ demo (giả lập đang ở di tích — để thử nghiệm)
            </label>
          </div>

          {/* Ảnh */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-museum-gold-light">
              2 · Ảnh kỷ niệm (tuỳ chọn)
            </p>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onPickPhoto} className="hidden" />
            {photoPreview ? (
              <div className="relative">
                <img src={photoPreview} alt="preview" className="h-40 w-full rounded-xl object-cover" />
                <button
                  onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-museum-gold/30 px-4 py-3 text-sm text-museum-muted hover:border-museum-gold/50 hover:text-museum-parchment"
              >
                <Camera className="h-4 w-4" /> Chụp / chọn ảnh
              </button>
            )}
          </div>

          {/* Quyền riêng tư */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-museum-gold-light">
              3 · Chia sẻ
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVisibility("public")}
                className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm ${
                  visibility === "public"
                    ? "border-museum-gold/60 bg-museum-gold/15 text-museum-gold-light"
                    : "border-museum-gold/20 text-museum-muted hover:border-museum-gold/40"
                }`}
              >
                <Globe className="h-4 w-4" /> Công khai
              </button>
              <button
                type="button"
                onClick={() => setVisibility("private")}
                className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm ${
                  visibility === "private"
                    ? "border-museum-gold/60 bg-museum-gold/15 text-museum-gold-light"
                    : "border-museum-gold/20 text-museum-muted hover:border-museum-gold/40"
                }`}
              >
                <Lock className="h-4 w-4" /> Riêng tư
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="border-t border-museum-gold/15 p-4">
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-museum-gold px-4 py-3 text-sm font-semibold text-museum-black transition-colors hover:bg-museum-gold-light disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {submitting ? "Đang xác thực..." : "Xác nhận điểm danh"}
          </button>
          {!demo && !coords && (
            <p className="mt-2 text-center text-[11px] text-museum-muted">
              Cần lấy vị trí GPS (hoặc bật demo) để xác thực bạn đã đến di tích.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
