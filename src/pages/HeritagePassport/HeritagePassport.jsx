import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Compass } from "lucide-react";
import MuseumSectionHeader from "~/components/common/MuseumSectionHeader";
import PassportCollection, { useUserId } from "./PassportCollection";
import CommunityFeed from "./CommunityFeed";
import MyTrips from "~/pages/Trip/MyTrips";

/**
 * Trang Hộ chiếu Di sản (/passport) — bộ sưu tập của user.
 * Việc điểm danh đã chuyển vào từng trang di tích (Heritage Detail).
 */
export default function HeritagePassport() {
  const { t } = useTranslation();
  const userId = useUserId();

  return (
    <section className="museum-shell min-h-screen pt-navbar-mobile sm:pt-navbar">
      <div className="lcn-container">
        <MuseumSectionHeader
          eyebrow="Heritage Passport"
          title={t("passport.title")}
          description={t("passport.description")}
          align="center"
        />

        <PassportCollection userId={userId} />

        <MyTrips userId={userId} />

        <div className="mt-10">
          <CommunityFeed title={t("passport.communityTitle")} showHeritage limit={16} />
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-museum-gold/25 bg-museum-black/35 p-6 text-center">
          <Compass className="h-6 w-6 text-museum-gold-light" />
          <p className="text-sm text-museum-parchment">
            {t("passport.addStampHintBefore")} <span className="text-museum-gold-light">{t("passport.addStampHintHeritagePage")}</span>
            <span className="text-museum-gold-light"> {t("passport.addStampHintCheckIn")}</span> {t("passport.addStampHintAfter")}
          </p>
          <Link
            to="/heritages"
            className="rounded-full border border-museum-gold/40 bg-museum-gold/12 px-5 py-2 text-sm font-medium text-museum-gold-light transition-colors hover:bg-museum-gold/20"
          >
            {t("passport.exploreHeritage")}
          </Link>
        </div>
      </div>
    </section>
  );
}
