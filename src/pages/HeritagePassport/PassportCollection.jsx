import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Flame, Award, ShieldCheck, Stamp, Trophy, Globe, Lock } from "lucide-react";
import { selectCurrentUser } from "~/store/slices/authSlice";
import { useGetProgressQuery, useGetPassportQuery } from "~/store/apis/gamificationApi";

/** userId: ưu tiên user đăng nhập; khách thì tạo guest id (lưu localStorage) để demo. */
export function useUserId() {
  const user = useSelector(selectCurrentUser);
  return useMemo(() => {
    const real = user?._id || user?.id;
    if (real) return real;
    let g = localStorage.getItem("heritage_guest_id");
    if (!g) {
      g = "guest-" + Math.random().toString(36).slice(2, 10);
      localStorage.setItem("heritage_guest_id", g);
    }
    return g;
  }, [user]);
}

/**
 * PassportCollection — thẻ tiến trình (XP/level/streak) + lưới tem đã sưu tầm.
 * Dùng chung cho trang /passport và tab "Hộ chiếu di sản" trong Profile.
 */
export default function PassportCollection({ userId }) {
  const { t } = useTranslation();
  const { data: progress, isLoading: progressLoading } = useGetProgressQuery(userId, { skip: !userId });
  const { data: stamps = [], isLoading: stampsLoading } = useGetPassportQuery(userId, { skip: !userId });

  const loading = progressLoading || stampsLoading;

  if (loading) return (
    <div>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="museum-card rounded-2xl border border-museum-gold/20 bg-museum-black/55 p-5 animate-pulse">
            <div className="h-5 w-24 rounded bg-museum-gold/15" />
            <div className="mt-3 h-6 w-16 rounded bg-museum-gold/10" />
            <div className="mt-3 h-2 w-full rounded-full bg-museum-gold/10" />
          </div>
        ))}
      </div>
      <div className="mb-3 h-4 w-40 rounded bg-museum-gold/10 animate-pulse" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-2xl border border-museum-gold/20 bg-museum-black/40 p-3 animate-pulse">
            <div className="mb-2 h-24 rounded-xl bg-museum-gold/10" />
            <div className="h-4 w-3/4 rounded bg-museum-gold/10" />
            <div className="mt-1 h-3 w-1/2 rounded bg-museum-gold/10" />
          </div>
        ))}
      </div>
    </div>
  );

  const xpInto = progress?.xpIntoLevel ?? 0;
  const xpNeed = progress?.xpForNextLevel ?? 100;
  const pct = Math.min(100, Math.round((xpInto / Math.max(1, xpNeed)) * 100));

  return (
    <div>
      {/* Thẻ tiến trình */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="museum-card rounded-2xl border border-museum-gold/20 bg-museum-black/55 p-5">
          <div className="flex items-center gap-2 text-museum-gold-light">
            <Award className="h-5 w-5" />
            <span className="text-sm font-semibold">{t("passport.level", { level: progress?.level ?? 1 })}</span>
          </div>
          <p className="mt-1 font-display text-2xl font-bold text-museum-ivory">
            {progress?.title ?? t("passport.rookie")}
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-museum-gold/15">
            <div
              className="h-full rounded-full bg-gradient-to-r from-museum-gold/70 to-museum-gold-light transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1.5 font-mono text-[11px] text-museum-muted">
            {xpInto}/{xpNeed} XP → {progress?.nextLevelTitle ?? ""}
          </p>
        </div>

        <div className="museum-card flex flex-col justify-center rounded-2xl border border-museum-gold/20 bg-museum-black/55 p-5">
          <div className="flex items-center gap-2 text-orange-400">
            <Flame className="h-5 w-5" />
            <span className="text-sm font-semibold">{t("passport.streakTitle")}</span>
          </div>
          <p className="mt-1 font-display text-3xl font-bold text-museum-ivory">
            {progress?.streakCount ?? 0}
            <span className="ml-1 text-base font-normal text-museum-muted">{t("passport.days")}</span>
          </p>
          <p className="mt-1 font-mono text-[11px] text-museum-muted">
            {t("passport.longestStreak", { count: progress?.longestStreak ?? 0 })}
          </p>
        </div>

        <div className="museum-card flex flex-col justify-center rounded-2xl border border-museum-gold/20 bg-museum-black/55 p-5">
          <div className="flex items-center gap-2 text-museum-gold-light">
            <Trophy className="h-5 w-5" />
            <span className="text-sm font-semibold">{t("passport.overview")}</span>
          </div>
          <p className="mt-1 font-display text-3xl font-bold text-museum-ivory">
            {progress?.xp ?? 0} <span className="text-base font-normal text-museum-muted">XP</span>
          </p>
          <p className="mt-1 font-mono text-[11px] text-museum-muted">
            {t("passport.heritageCount", { count: progress?.distinctHeritages ?? 0 })} · {t("passport.checkInCount", { count: progress?.totalCheckIns ?? 0 })}
          </p>
        </div>
      </div>

      {/* Bộ sưu tập tem */}
      <div className="mb-3 flex items-center gap-2 text-museum-gold-light">
        <Stamp className="h-4 w-4" />
        <span className="text-[11px] font-semibold uppercase tracking-wider">
          {t("passport.collectedStamps", { count: stamps.length })}
        </span>
        <span className="ml-auto h-px flex-1 bg-gradient-to-r from-museum-gold/30 to-transparent" />
      </div>

      {stamps.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-museum-gold/20 bg-museum-black/40 p-6 text-center text-sm text-museum-muted">
          {t("passport.emptyStampsBefore")} <span className="text-museum-gold-light">{t("passport.emptyStampsCheckIn")}</span> {t("passport.emptyStampsAfter")}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {stamps.map((s) => (
            <div
              key={s.heritageId}
              className={`group relative overflow-hidden rounded-2xl border p-3 ${
                s.verified
                  ? "border-museum-gold/45 bg-gradient-to-br from-museum-gold/16 to-museum-black/40 shadow-[0_0_0_1px_rgba(216,162,74,0.15)]"
                  : "border-museum-gold/20 bg-museum-black/40"
              }`}
            >
              <div className="relative mb-2 h-24 overflow-hidden rounded-xl bg-museum-black/50">
                {s.photoUrl ? (
                  <img src={s.photoUrl} alt={s.heritageTitle} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-museum-gold/50">
                    <Stamp className="h-8 w-8" />
                  </div>
                )}
                {s.verified && (
                  <span className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-full bg-museum-gold px-1.5 py-0.5 text-[9px] font-bold text-museum-black shadow">
                    <ShieldCheck className="h-3 w-3" /> {t("passport.visited")}
                  </span>
                )}
                <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[9px] text-museum-parchment">
                  {s.visibility === "public" ? <Globe className="h-2.5 w-2.5" /> : <Lock className="h-2.5 w-2.5" />}
                  {s.visibility === "public" ? t("passport.public") : t("passport.private")}
                </span>
              </div>
              <p className="truncate text-sm font-semibold text-museum-ivory">{s.heritageTitle || s.heritageId}</p>
              <p className="mt-0.5 font-mono text-[10px] text-museum-muted">
                {t("passport.visitCount", { count: s.visits })} · {new Date(s.firstVisit).toLocaleDateString("vi-VN")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
