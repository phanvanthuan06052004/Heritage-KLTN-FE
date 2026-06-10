import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Route, Clock, Flame, MapPin, Globe, Lock, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { selectCurrentUser } from "~/store/slices/authSlice";
import {
  useGetTripQuery, useSetTripVisibilityMutation, useDeleteTripMutation,
} from "~/store/apis/tripApi";
import { fmtDur, fmtKm, fmtDate } from "./tripFormat";
import RouteMap from "./RouteMap";

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const { data: trip, isLoading, isError } = useGetTripQuery(id);
  const [setVisibility] = useSetTripVisibilityMutation();
  const [deleteTrip, { isLoading: deleting }] = useDeleteTripMutation();

  const uid = user?._id || user?.id;
  const isOwner = trip && uid && trip.userId === uid;

  if (isLoading)
    return (
      <section className="museum-shell flex min-h-screen items-center justify-center pt-navbar">
        <Loader2 className="h-7 w-7 animate-spin text-museum-gold-light" />
      </section>
    );
  if (isError || !trip)
    return (
      <section className="museum-shell flex min-h-screen items-center justify-center pt-navbar text-museum-muted">
        Không tìm thấy hành trình.
      </section>
    );

  const toggleVis = async () => {
    try {
      await setVisibility({ id, userId: uid, visibility: trip.visibility === "public" ? "private" : "public" }).unwrap();
      toast.success("Đã cập nhật quyền riêng tư");
    } catch (e) {
      toast.error(e?.data?.message || "Lỗi");
    }
  };
  const onDelete = async () => {
    if (!window.confirm("Xoá hành trình này?")) return;
    try {
      await deleteTrip({ id, userId: uid }).unwrap();
      toast.success("Đã xoá hành trình");
      navigate("/passport");
    } catch (e) {
      toast.error(e?.data?.message || "Lỗi");
    }
  };

  const stat = (Icon, label, value) => (
    <div className="flex flex-col items-center rounded-xl border border-museum-gold/15 bg-museum-black/50 px-3 py-3">
      <Icon className="mb-1 h-4 w-4 text-museum-gold-light" />
      <span className="font-display text-xl font-bold text-museum-ivory tabular-nums">{value}</span>
      <span className="text-[10px] uppercase tracking-wide text-museum-muted">{label}</span>
    </div>
  );

  return (
    <section className="museum-shell min-h-screen pt-navbar-mobile sm:pt-navbar">
      <div className="lcn-container-x py-6">
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1.5 text-sm text-museum-muted hover:text-museum-gold-light">
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </button>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold text-museum-ivory sm:text-3xl">{trip.title || "Hành trình khám phá"}</h1>
            <div className="mt-1.5 flex items-center gap-2 text-sm text-museum-muted">
              {trip.avatarUrl ? <img src={trip.avatarUrl} alt="" className="h-6 w-6 rounded-full object-cover ring-1 ring-museum-gold/30" /> : null}
              <span>{trip.displayName || "Người dùng"}</span>
              <span>· {fmtDate(trip.createdAt)}</span>
            </div>
          </div>
          {isOwner && (
            <div className="flex shrink-0 gap-2">
              <button onClick={toggleVis} className="flex items-center gap-1 rounded-full border border-museum-gold/30 bg-museum-black/55 px-3 py-1.5 text-xs text-museum-gold-light hover:bg-museum-gold/12">
                {trip.visibility === "public" ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                {trip.visibility === "public" ? "Công khai" : "Riêng tư"}
              </button>
              <button onClick={onDelete} disabled={deleting} className="flex items-center gap-1 rounded-full border border-museum-seal/40 bg-museum-seal/10 px-3 py-1.5 text-xs text-museum-seal hover:bg-museum-seal/20">
                {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />} Xoá
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2.5">
          {stat(Route, "Quãng đường", `${fmtKm(trip.distanceM)} km`)}
          {stat(Clock, "Thời gian", fmtDur(trip.durationSec))}
          {stat(Flame, "Kcal", trip.kcal ?? "--")}
          {stat(MapPin, "Di tích", trip.heritageCount || 0)}
        </div>

        <div className="museum-card mt-5 h-[52vh] min-h-[400px] overflow-hidden rounded-[2rem] bg-museum-black/55 p-2.5 shadow-museum-card">
          <RouteMap points={trip.points || []} moments={trip.moments || []} mode="view" className="h-full w-full overflow-hidden rounded-[1.6rem]" />
        </div>

        {trip.moments?.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 font-display text-lg font-semibold text-museum-gold-light">Khoảnh khắc dọc đường</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {trip.moments.map((m) => (
                <div key={m.id} className="overflow-hidden rounded-xl border border-museum-gold/15 bg-museum-black/45">
                  {m.photoUrl && <img src={m.photoUrl} alt="" className="h-36 w-full object-cover" />}
                  {m.note && <p className="p-3 text-sm text-museum-parchment">{m.note}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
