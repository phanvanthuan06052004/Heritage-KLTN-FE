import { Link } from "react-router-dom";
import { Route, Plus, Clock, Flame, Landmark } from "lucide-react";
import { useGetUserTripsQuery } from "~/store/apis/tripApi";
import TripCard from "./TripCard";
import { fmtDur } from "./tripFormat";

/** Mục "Hành trình của tôi" trong Hộ chiếu. */
export default function MyTrips({ userId }) {
  const { data: trips = [], isLoading } = useGetUserTripsQuery(userId, { skip: !userId });

  const totals = trips.reduce(
    (a, t) => ({
      km: a.km + (t.distanceM || 0) / 1000,
      sec: a.sec + (t.durationSec || 0),
      kcal: a.kcal + (t.kcal || 0),
      heritage: a.heritage + (t.heritageCount || 0),
    }),
    { km: 0, sec: 0, kcal: 0, heritage: 0 },
  );

  return (
    <div className="mt-10">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-museum-gold-light">
          <Route className="h-5 w-5" /> Hành trình của tôi
          {trips.length > 0 && <span className="text-sm text-museum-muted">({trips.length})</span>}
        </h2>
        <div className="flex items-center gap-2">
          <Link
            to="/journeys"
            className="hidden items-center gap-1.5 rounded-full border border-museum-gold/30 px-4 py-2 text-sm text-museum-gold-light transition-colors hover:bg-museum-gold/12 sm:flex"
          >
            <Route className="h-4 w-4" /> Cộng đồng
          </Link>
          <Link
            to="/passport/track"
            className="flex items-center gap-1.5 rounded-full bg-museum-gold px-4 py-2 text-sm font-semibold text-museum-black transition-colors hover:bg-museum-gold-light"
          >
            <Plus className="h-4 w-4" /> Ghi hành trình
          </Link>
        </div>
      </div>

      {/* Thống kê tổng */}
      {trips.length > 0 && (
        <div className="mb-4 grid grid-cols-4 gap-2.5">
          {[
            { Icon: Route, label: "Tổng quãng đường", value: `${totals.km.toFixed(1)} km` },
            { Icon: Clock, label: "Tổng thời gian", value: fmtDur(totals.sec) },
            { Icon: Flame, label: "Tổng kcal", value: Math.round(totals.kcal) },
            { Icon: Landmark, label: "Di sản đã qua", value: totals.heritage },
          ].map(({ Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center rounded-xl border border-museum-gold/15 bg-museum-black/45 px-2 py-3">
              <Icon className="mb-1 h-4 w-4 text-museum-gold-light" />
              <span className="font-display text-lg font-bold text-museum-ivory tabular-nums">{value}</span>
              <span className="text-center text-[10px] uppercase tracking-wide text-museum-muted">{label}</span>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-museum-muted">Đang tải…</p>
      ) : trips.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-museum-gold/25 bg-museum-black/35 p-8 text-center">
          <Route className="h-7 w-7 text-museum-gold-light/70" />
          <p className="text-sm text-museum-parchment">
            Chưa có hành trình nào. Bật <span className="text-museum-gold-light">Ghi hành trình</span> khi đi khám phá di sản để lưu lại lộ trình, ảnh và chỉ số.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((t) => (
            <TripCard key={t.id} trip={t} showAuthor={false} />
          ))}
        </div>
      )}
    </div>
  );
}
