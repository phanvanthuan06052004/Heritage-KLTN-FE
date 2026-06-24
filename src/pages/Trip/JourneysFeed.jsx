import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Route, Compass } from "lucide-react";
import MuseumSectionHeader from "~/components/common/MuseumSectionHeader";
import { useGetCommunityTripsQuery } from "~/store/apis/tripApi";
import TripCard from "./TripCard";

/** Trang feed cộng đồng: các hành trình công khai người khác chia sẻ. */
export default function JourneysFeed() {
  const { t } = useTranslation();
  const { data: trips = [], isLoading } = useGetCommunityTripsQuery(40);

  return (
    <section className="museum-shell min-h-screen pt-navbar-mobile sm:pt-navbar">
      <div className="lcn-container">
        <MuseumSectionHeader
          eyebrow="Community Journeys"
          title={t("trip.communityTitle")}
          description={t("trip.communityDesc")}
          align="center"
        />

        <div className="mb-6 flex justify-center">
          <Link
            to="/passport/track"
            className="flex items-center gap-2 rounded-full bg-museum-gold px-6 py-3 font-semibold text-museum-black transition-colors hover:bg-museum-gold-light"
          >
            <Route className="h-5 w-5" /> {t("trip.recordYourJourney")}
          </Link>
        </div>

        {isLoading ? (
          <p className="text-center text-sm text-museum-muted">{t("trip.loading")}</p>
        ) : trips.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-museum-gold/25 bg-museum-black/35 p-10 text-center">
            <Compass className="h-8 w-8 text-museum-gold-light/70" />
            <p className="text-sm text-museum-parchment">{t("trip.emptyCommunity")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {trips.map((tt) => (
              <TripCard key={tt.id} trip={tt} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
