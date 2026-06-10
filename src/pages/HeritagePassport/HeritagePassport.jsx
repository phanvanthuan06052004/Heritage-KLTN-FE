import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import MuseumSectionHeader from "~/components/common/MuseumSectionHeader";
import PassportCollection, { useUserId } from "./PassportCollection";
import CommunityFeed from "./CommunityFeed";

/**
 * Trang Hộ chiếu Di sản (/passport) — bộ sưu tập của user.
 * Việc điểm danh đã chuyển vào từng trang di tích (Heritage Detail).
 */
export default function HeritagePassport() {
  const userId = useUserId();

  return (
    <section className="museum-shell min-h-screen pt-navbar-mobile sm:pt-navbar">
      <div className="lcn-container">
        <MuseumSectionHeader
          eyebrow="Heritage Passport"
          title="Hộ chiếu Di sản"
          description="Tích luỹ XP, giữ chuỗi ngày khám phá và sưu tầm những con tem di sản bạn đã ghé thăm."
          align="center"
        />

        <PassportCollection userId={userId} />

        <div className="mt-10">
          <CommunityFeed title="Cộng đồng khám phá" showHeritage limit={16} />
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-museum-gold/25 bg-museum-black/35 p-6 text-center">
          <Compass className="h-6 w-6 text-museum-gold-light" />
          <p className="text-sm text-museum-parchment">
            Muốn thêm con tem mới? Hãy mở một <span className="text-museum-gold-light">trang di tích</span> và
            <span className="text-museum-gold-light"> điểm danh tại đó</span> khi bạn đến tận nơi.
          </p>
          <Link
            to="/heritages"
            className="rounded-full border border-museum-gold/40 bg-museum-gold/12 px-5 py-2 text-sm font-medium text-museum-gold-light transition-colors hover:bg-museum-gold/20"
          >
            Khám phá di tích
          </Link>
        </div>
      </div>
    </section>
  );
}
