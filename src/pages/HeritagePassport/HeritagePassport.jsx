import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Flame, Award, MapPin, ShieldCheck, Stamp, Trophy, Globe, Lock } from "lucide-react";
import MuseumSectionHeader from "~/components/common/MuseumSectionHeader";
import { selectCurrentUser } from "~/store/slices/authSlice";
import { useGetProgressQuery, useGetPassportQuery } from "~/store/apis/gamificationApi";
import { useGetMapLocationsQuery } from "~/store/apis/graphApi";
import { FALLBACK_MAP_LOCATIONS } from "~/pages/HistoricalMap/graphFallback";
import { getTypeMeta } from "~/pages/HistoricalMap/mockData";
import { TypeIcon } from "~/pages/HistoricalMap/typeIcons";
import CheckInModal from "./CheckInModal";

// userId: ưu tiên user đăng nhập; nếu khách thì tạo id khách lưu localStorage để demo.
function useUserId() {
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

export default function HeritagePassport() {
  const userId = useUserId();
  const { data: progress, refetch: refetchProgress } = useGetProgressQuery(userId);
  const { data: stamps = [], refetch: refetchPassport } = useGetPassportQuery(userId);
  const { data: locData } = useGetMapLocationsQuery({});
  const [checkInLoc, setCheckInLoc] = useState(null); // di tích đang mở modal điểm danh

  const locations = locData?.items?.length ? locData.items : FALLBACK_MAP_LOCATIONS;
  const checkedIds = new Set(stamps.map((s) => s.heritageId));
  const todayStr = new Date().toISOString().slice(0, 10);
  const checkedTodayIds = new Set(
    stamps
      .filter((s) => s.lastVisit && new Date(s.lastVisit).toISOString().slice(0, 10) === todayStr)
      .map((s) => s.heritageId),
  );

  const xpInto = progress?.xpIntoLevel ?? 0;
  const xpNeed = progress?.xpForNextLevel ?? 100;
  const pct = Math.min(100, Math.round((xpInto / Math.max(1, xpNeed)) * 100));

  const onCheckInDone = () => {
    refetchProgress();
    refetchPassport();
  };

  return (
    <section className="museum-shell min-h-screen pt-navbar-mobile sm:pt-navbar">
      <div className="lcn-container">
        <MuseumSectionHeader
          eyebrow="Heritage Passport"
          title="Hộ chiếu Di sản"
          description="Điểm danh tại các di tích, tích luỹ XP, giữ chuỗi ngày khám phá và sưu tầm những con tem di sản Việt Nam."
          align="center"
        />

        {/* Thẻ tiến trình */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="museum-card rounded-2xl border border-museum-gold/20 bg-museum-black/55 p-5">
            <div className="flex items-center gap-2 text-museum-gold-light">
              <Award className="h-5 w-5" />
              <span className="text-sm font-semibold">Cấp {progress?.level ?? 1}</span>
            </div>
            <p className="mt-1 font-display text-2xl font-bold text-museum-ivory">
              {progress?.title ?? "Tân binh"}
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
              <span className="text-sm font-semibold">Chuỗi ngày khám phá</span>
            </div>
            <p className="mt-1 font-display text-3xl font-bold text-museum-ivory">
              {progress?.streakCount ?? 0}
              <span className="ml-1 text-base font-normal text-museum-muted">ngày</span>
            </p>
            <p className="mt-1 font-mono text-[11px] text-museum-muted">
              Dài nhất: {progress?.longestStreak ?? 0} ngày
            </p>
          </div>

          <div className="museum-card flex flex-col justify-center rounded-2xl border border-museum-gold/20 bg-museum-black/55 p-5">
            <div className="flex items-center gap-2 text-museum-gold-light">
              <Trophy className="h-5 w-5" />
              <span className="text-sm font-semibold">Tổng quan</span>
            </div>
            <p className="mt-1 font-display text-3xl font-bold text-museum-ivory">
              {progress?.xp ?? 0} <span className="text-base font-normal text-museum-muted">XP</span>
            </p>
            <p className="mt-1 font-mono text-[11px] text-museum-muted">
              {progress?.distinctHeritages ?? 0} di tích · {progress?.totalCheckIns ?? 0} lượt điểm danh
            </p>
          </div>
        </div>

        {/* Bộ sưu tập tem (B2) */}
        <div className="mb-3 flex items-center gap-2 text-museum-gold-light">
          <Stamp className="h-4 w-4" />
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Con tem đã sưu tầm ({stamps.length})
          </span>
          <span className="ml-auto h-px flex-1 bg-gradient-to-r from-museum-gold/30 to-transparent" />
        </div>

        {stamps.length === 0 ? (
          <p className="mb-8 rounded-2xl border border-dashed border-museum-gold/20 bg-museum-black/40 p-6 text-center text-sm text-museum-muted">
            Chưa có con tem nào. Hãy điểm danh tại một di tích bên dưới để bắt đầu hành trình!
          </p>
        ) : (
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {stamps.map((s) => (
              <div
                key={s.heritageId}
                className={`group relative overflow-hidden rounded-2xl border p-3 ${
                  s.verified
                    ? "border-museum-gold/45 bg-gradient-to-br from-museum-gold/16 to-museum-black/40 shadow-[0_0_0_1px_rgba(216,162,74,0.15)]"
                    : "border-museum-gold/20 bg-museum-black/40"
                }`}
              >
                {/* Ảnh bằng chứng hoặc nền huy hiệu */}
                <div className="relative mb-2 h-24 overflow-hidden rounded-xl bg-museum-black/50">
                  {s.photoUrl ? (
                    <img src={s.photoUrl} alt={s.heritageTitle} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-museum-gold/50">
                      <Stamp className="h-8 w-8" />
                    </div>
                  )}
                  {/* badge verified */}
                  {s.verified && (
                    <span className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-full bg-museum-gold px-1.5 py-0.5 text-[9px] font-bold text-museum-black shadow">
                      <ShieldCheck className="h-3 w-3" /> Đã đến
                    </span>
                  )}
                  {/* badge riêng tư/công khai */}
                  <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[9px] text-museum-parchment">
                    {s.visibility === "public" ? <Globe className="h-2.5 w-2.5" /> : <Lock className="h-2.5 w-2.5" />}
                    {s.visibility === "public" ? "Công khai" : "Riêng tư"}
                  </span>
                </div>
                <p className="truncate text-sm font-semibold text-museum-ivory">{s.heritageTitle || s.heritageId}</p>
                <p className="mt-0.5 font-mono text-[10px] text-museum-muted">
                  {s.visits} lượt · {new Date(s.firstVisit).toLocaleDateString("vi-VN")}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Điểm danh (B1) */}
        <div className="mb-3 flex items-center gap-2 text-museum-gold-light">
          <MapPin className="h-4 w-4" />
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Điểm danh di tích
          </span>
          <span className="ml-auto h-px flex-1 bg-gradient-to-r from-museum-gold/30 to-transparent" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((loc) => {
            const meta = getTypeMeta(loc.type);
            const done = checkedIds.has(loc.id);
            const todayDone = checkedTodayIds.has(loc.id);
            return (
              <div
                key={loc.id}
                className="flex items-center gap-3 rounded-2xl border border-museum-gold/15 bg-museum-black/50 p-3.5"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ background: `${meta.color}22`, border: `1px solid ${meta.color}55`, color: meta.color }}
                >
                  <TypeIcon type={loc.type} className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-museum-ivory">{loc.name}</p>
                  <p className="truncate text-[11px] text-museum-muted">{loc.province || meta.label}</p>
                </div>
                <button
                  type="button"
                  disabled={todayDone}
                  onClick={() => setCheckInLoc(loc)}
                  title={todayDone ? "Đã điểm danh hôm nay — quay lại ngày mai" : "Điểm danh GPS tại di tích"}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    todayDone
                      ? "border-museum-gold/30 bg-museum-gold/15 text-museum-gold-light/80"
                      : "border-museum-gold/25 text-museum-parchment hover:border-museum-gold/50 hover:bg-museum-gold/10"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {todayDone ? "✓ Hôm nay" : done ? "Check-in lại" : "Check-in"}
                </button>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-[11px] text-museum-muted">
          XP chỉ được cấp khi bạn <span className="text-museum-gold-light">đến tận nơi</span> và xác thực GPS (di tích lần đầu +50, các lần sau +10).
          Ảnh là kỷ niệm để chia sẻ — không bắt buộc.
        </p>
      </div>

      {checkInLoc && (
        <CheckInModal
          location={checkInLoc}
          userId={userId}
          onClose={() => setCheckInLoc(null)}
          onDone={onCheckInDone}
        />
      )}
    </section>
  );
}
