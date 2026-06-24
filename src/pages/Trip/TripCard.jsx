import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Route, Clock, Flame, MapPin, Globe, Lock, Landmark } from "lucide-react";
import { fmtDur, fmtKm, timeAgo } from "./tripFormat";

/** Thẻ tóm tắt một hành trình. */
export default function TripCard({ trip, showAuthor = true }) {
  const { t } = useTranslation();
  const km = fmtKm(trip.distanceM);
  const heritages = trip.heritages || [];
  const heritageLine =
    heritages.length > 2
      ? `${heritages[0].name} · ${heritages[1].name} +${heritages.length - 2}`
      : heritages.map((h) => h.name).join(" · ");
  return (
    <Link
      to={`/trips/${trip.id}`}
      className="group block overflow-hidden rounded-2xl border border-museum-gold/15 bg-museum-black/45 transition-all hover:border-museum-gold/40 hover:shadow-museum-card"
    >
      <div className="relative h-36 overflow-hidden bg-museum-black/60">
        {trip.coverPhoto ? (
          <img src={trip.coverPhoto} alt={trip.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-museum-gold/15 to-transparent">
            <Route className="h-10 w-10 text-museum-gold-light/50" />
          </div>
        )}
        <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-museum-black/70 px-2 py-0.5 text-[10px] font-medium text-museum-gold-light backdrop-blur">
          {trip.visibility === "public" ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
          {trip.visibility === "public" ? t("trip.public") : t("trip.private")}
        </span>
      </div>
      <div className="p-3.5">
        <h3 className="truncate font-display text-base font-semibold text-museum-ivory">{trip.title || t("trip.defaultTitle")}</h3>
        {showAuthor && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-museum-muted">
            {trip.avatarUrl ? (
              <img src={trip.avatarUrl} alt="" className="h-4 w-4 rounded-full object-cover" />
            ) : null}
            <span className="truncate">{trip.displayName || t("trip.user")}</span>
            <span>· {timeAgo(trip.createdAt)}</span>
          </div>
        )}
        {heritageLine && (
          <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-museum-gold-light/85">
            <Landmark className="h-3 w-3 shrink-0" /> {heritageLine}
          </p>
        )}
        <div className="mt-2.5 flex items-center gap-3 text-xs text-museum-parchment">
          <span className="flex items-center gap-1"><Route className="h-3.5 w-3.5 text-museum-gold-light" /> {km} km</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-museum-gold-light" /> {fmtDur(trip.durationSec)}</span>
          {trip.kcal ? <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-museum-gold-light" /> {trip.kcal}</span> : null}
          {trip.heritageCount ? <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-museum-gold-light" /> {trip.heritageCount}</span> : null}
        </div>
      </div>
    </Link>
  );
}
