import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  Route, Clock, Flame, MapPin, Globe, Lock, Trash2, ArrowLeft, Loader2,
  Repeat, Share2, Landmark, ShieldCheck, Stamp, ChevronRight,
} from "lucide-react";
import { selectCurrentUser } from "~/store/slices/authSlice";
import {
  useGetTripQuery, useSetTripVisibilityMutation, useDeleteTripMutation,
} from "~/store/apis/tripApi";
import { fmtDur, fmtKm, fmtDate } from "./tripFormat";
import RouteMap from "./RouteMap";

export default function TripDetail() {
  const { t } = useTranslation();
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
        {t("trip.notFound")}
      </section>
    );

  const heritages = trip.heritages || [];

  const toggleVis = async () => {
    try {
      await setVisibility({ id, userId: uid, visibility: trip.visibility === "public" ? "private" : "public" }).unwrap();
      toast.success(t("trip.visibilityUpdated"));
    } catch (e) {
      toast.error(e?.data?.message || t("trip.error"));
    }
  };
  const onDelete = async () => {
    if (!window.confirm(t("trip.confirmDelete"))) return;
    try {
      await deleteTrip({ id, userId: uid }).unwrap();
      toast.success(t("trip.deleted"));
      navigate("/passport");
    } catch (e) {
      toast.error(e?.data?.message || t("trip.error"));
    }
  };
  const onShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t("trip.linkCopied"));
    } catch {
      toast.error(t("trip.linkCopyFailed"));
    }
  };
  const onFollow = () => {
    if (!user) {
      toast.info(t("trip.loginToRelive"));
      navigate("/login");
      return;
    }
    navigate(`/passport/track?follow=${id}`);
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
          <ArrowLeft className="h-4 w-4" /> {t("trip.back")}
        </button>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold text-museum-ivory sm:text-3xl">{trip.title || t("trip.defaultTitle")}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-museum-muted">
              {trip.avatarUrl ? <img src={trip.avatarUrl} alt="" className="h-6 w-6 rounded-full object-cover ring-1 ring-museum-gold/30" /> : null}
              <span>{trip.displayName || t("trip.user")}</span>
              <span>· {fmtDate(trip.createdAt)}</span>
              {trip.followCount > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-museum-gold/12 px-2.5 py-0.5 text-xs font-medium text-museum-gold-light">
                  <Repeat className="h-3 w-3" /> {t("trip.peopleRelived", { count: trip.followCount })}
                </span>
              )}
              {trip.followedTripId && (
                <Link to={`/trips/${trip.followedTripId}`} className="flex items-center gap-1 rounded-full border border-museum-gold/25 px-2.5 py-0.5 text-xs text-museum-gold-light hover:bg-museum-gold/10">
                  <Repeat className="h-3 w-3" /> {t("trip.relivedFromOriginal")}
                </Link>
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {trip.visibility === "public" && !isOwner && (
              <button onClick={onFollow} className="flex items-center gap-1.5 rounded-full bg-museum-gold px-4 py-2 text-sm font-semibold text-museum-black hover:bg-museum-gold-light">
                <Repeat className="h-4 w-4" /> {t("trip.relive")}
              </button>
            )}
            {isOwner && (
              <button onClick={onFollow} className="flex items-center gap-1.5 rounded-full border border-museum-gold/35 bg-museum-gold/12 px-4 py-2 text-sm font-medium text-museum-gold-light hover:bg-museum-gold/20">
                <Repeat className="h-4 w-4" /> {t("trip.walkAgain")}
              </button>
            )}
            <button onClick={onShare} className="flex items-center gap-1 rounded-full border border-museum-gold/30 bg-museum-black/55 px-3 py-2 text-xs text-museum-gold-light hover:bg-museum-gold/12">
              <Share2 className="h-3.5 w-3.5" /> {t("trip.share")}
            </button>
            {isOwner && (
              <>
                <button onClick={toggleVis} className="flex items-center gap-1 rounded-full border border-museum-gold/30 bg-museum-black/55 px-3 py-2 text-xs text-museum-gold-light hover:bg-museum-gold/12">
                  {trip.visibility === "public" ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                  {trip.visibility === "public" ? t("trip.public") : t("trip.private")}
                </button>
                <button onClick={onDelete} disabled={deleting} className="flex items-center gap-1 rounded-full border border-museum-seal/40 bg-museum-seal/10 px-3 py-2 text-xs text-museum-seal hover:bg-museum-seal/20">
                  {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />} {t("trip.delete")}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2.5">
          {stat(Route, t("trip.distance"), `${fmtKm(trip.distanceM)} km`)}
          {stat(Clock, t("trip.duration"), fmtDur(trip.durationSec))}
          {stat(Flame, t("trip.kcal"), trip.kcal ?? "--")}
          {stat(MapPin, t("trip.sites"), trip.heritageCount || 0)}
        </div>

        <div className="museum-card mt-5 h-[52vh] min-h-[400px] overflow-hidden rounded-[2rem] bg-museum-black/55 p-2.5 shadow-museum-card">
          <RouteMap
            points={trip.points || []}
            moments={trip.moments || []}
            heritages={heritages}
            mode="view"
            className="h-full w-full overflow-hidden rounded-[1.6rem]"
          />
        </div>

        {/* Di sản trên hành trình */}
        {heritages.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-museum-gold-light">
              <Landmark className="h-5 w-5" /> {t("trip.heritageOnTrip")} ({heritages.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {heritages.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() =>
                    h.slug ? navigate(`/heritage/${h.slug}`) : navigate("/historical-map")
                  }
                  title={h.slug ? t("trip.viewHeritageSite") : t("trip.viewOnHistoricalMap")}
                  className="group flex items-center gap-1.5 rounded-full border border-museum-gold/30 bg-museum-gold/10 px-4 py-2 text-sm text-museum-gold-light transition-colors hover:bg-museum-gold/25"
                >
                  <Landmark className="h-4 w-4" /> {h.name}
                  <ChevronRight className="h-3.5 w-3.5 opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Con tem đã điểm danh trên hành trình */}
        {trip.checkIns?.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-museum-gold-light">
              <Stamp className="h-5 w-5" /> {t("trip.stampsOnTrip")} ({trip.checkIns.length})
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {trip.checkIns.map((c) => (
                <div key={c.id} className="overflow-hidden rounded-xl border border-museum-gold/15 bg-museum-black/45">
                  {c.photoUrl && <img src={c.photoUrl} alt="" className="h-24 w-full object-cover" />}
                  <div className="p-2.5">
                    <p className="truncate text-sm font-medium text-museum-ivory">{c.heritageTitle || t("trip.site")}</p>
                    {c.verified && (
                      <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-museum-gold-light">
                        <ShieldCheck className="h-3 w-3" /> {t("trip.visitedInPerson")}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {trip.moments?.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 font-display text-lg font-semibold text-museum-gold-light">{t("trip.momentsAlongWay")}</h2>
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
