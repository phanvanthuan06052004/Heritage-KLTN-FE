import { Link } from "react-router-dom";
import { Route, Compass } from "lucide-react";
import MuseumSectionHeader from "~/components/common/MuseumSectionHeader";
import { useGetCommunityTripsQuery } from "~/store/apis/tripApi";
import TripCard from "./TripCard";

/** Trang feed cộng đồng: các hành trình công khai người khác chia sẻ. */
export default function JourneysFeed() {
  const { data: trips = [], isLoading } = useGetCommunityTripsQuery(40);

  return (
    <section className="museum-shell min-h-screen pt-navbar-mobile sm:pt-navbar">
      <div className="lcn-container">
        <MuseumSectionHeader
          eyebrow="Community Journeys"
          title="Hành trình cộng đồng"
          description="Khám phá những hành trình di sản do cộng đồng chia sẻ — xem lộ trình, khoảnh khắc và cảm hứng cho chuyến đi tiếp theo của bạn."
          align="center"
        />

        <div className="mb-6 flex justify-center">
          <Link
            to="/passport/track"
            className="flex items-center gap-2 rounded-full bg-museum-gold px-6 py-3 font-semibold text-museum-black transition-colors hover:bg-museum-gold-light"
          >
            <Route className="h-5 w-5" /> Ghi hành trình của bạn
          </Link>
        </div>

        {isLoading ? (
          <p className="text-center text-sm text-museum-muted">Đang tải…</p>
        ) : trips.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-museum-gold/25 bg-museum-black/35 p-10 text-center">
            <Compass className="h-8 w-8 text-museum-gold-light/70" />
            <p className="text-sm text-museum-parchment">Chưa có hành trình công khai nào. Hãy là người đầu tiên chia sẻ!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {trips.map((t) => (
              <TripCard key={t.id} trip={t} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
