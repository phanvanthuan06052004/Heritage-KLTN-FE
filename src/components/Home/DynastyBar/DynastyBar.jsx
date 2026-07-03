import { useState } from "react";
import { motion } from "motion/react";
import { Crown, Waves } from "lucide-react";
import { useTranslation } from "react-i18next";
import MotionReveal from "~/components/common/MotionReveal";
import MuseumSectionHeader from "~/components/common/MuseumSectionHeader";
import { dynasties } from "./dynastyData";

const MotionButton = motion.button;

const themeMap = [
  "Khai nguyên văn minh Văn Lang",
  "Thành Cổ Loa và nỏ thần",
  "Thử thách giữ cõi",
  "Khí phách độc lập",
  "Mạch ngầm khởi nghĩa",
  "Vạn Xuân tự chủ",
  "Tiền đề Bạch Đằng",
  "Mở nền độc lập",
  "Đại Cồ Việt",
  "Củng cố quốc gia",
  "Thăng Long rực rỡ",
  "Hào khí Đông A",
  "Cải cách và biến động",
  "Lam Sơn tụ nghĩa",
  "Đỉnh cao Nho học",
  "Tây Sơn thần tốc",
  "Kinh đô Huế",
];

function formatYear(year, bcLabel) {
  return year < 0 ? `${Math.abs(year)} ${bcLabel}` : year;
}

const DynastyBar = () => {
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState(dynasties[10]?.id);
  const activeDynasty = dynasties.find((dynasty) => dynasty.id === activeId);

  return (
    <section className="relative py-16 sm:py-20">
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-museum-gold/25 to-transparent" />
      <div className="lcn-container-x relative">
        <MotionReveal>
          <MuseumSectionHeader
            eyebrow={t("home.dynasty.eyebrow")}
            title={t("home.dynasty.title")}
            description={t("home.dynasty.description")}
          />
        </MotionReveal>

        <div className="grid gap-7 lg:grid-cols-[1fr_320px]">
          <div className="museum-scrollbar overflow-x-auto pb-5 relative">
            <div className="sticky left-0 z-10 w-6 h-full bg-gradient-to-r from-museum-black/60 to-transparent pointer-events-none absolute top-0 rounded-l-3xl" />
            <div className="sticky right-0 z-10 w-6 h-full bg-gradient-to-r from-transparent to-museum-black/60 pointer-events-none absolute top-0 rounded-r-3xl" />
            <div className="relative flex min-w-max gap-4 pr-4 pl-3">
              <div className="absolute left-4 right-4 top-[4.4rem] h-1 rounded-full bg-gradient-to-r from-museum-jade/35 via-museum-gold/50 to-museum-terracotta/40" />
              {dynasties.map((dynasty, index) => {
                const isActive = activeId === dynasty.id;
                return (
                  <MotionButton
                    type="button"
                    key={dynasty.id}
                    onMouseEnter={() => setActiveId(dynasty.id)}
                    onFocus={() => setActiveId(dynasty.id)}
                    onClick={() => setActiveId(dynasty.id)}
                    className={`relative z-10 w-[180px] sm:w-[210px] rounded-3xl border p-4 text-left transition ${
                      isActive
                        ? "border-museum-gold/70 bg-museum-gold/14 shadow-museum-gold"
                        : "border-museum-gold/15 bg-museum-ivory/6 hover:border-museum-gold/45 hover:bg-museum-ivory/10"
                    }`}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.22, margin: "0px 0px -8% 0px" }}
                    transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1], delay: Math.min(index * 0.025, 0.28) }}
                  >
                    <span className="mb-5 flex h-10 w-10 items-center justify-center rounded-full border border-museum-gold/30 bg-museum-black text-museum-gold-light">
                      <Crown className="h-5 w-5" />
                    </span>
                    <span className="block text-xs uppercase text-museum-muted">
                      {formatYear(dynasty.startYear, t("home.dynasty.bc"))} - {formatYear(dynasty.endYear, t("home.dynasty.bc"))}
                    </span>
                    <span className="mt-2 block font-display text-2xl font-semibold text-museum-ivory">
                      {dynasty.name}
                    </span>
                    <span className="mt-3 block text-sm leading-6 text-museum-muted">
                      {t(`home.dynasty.themes.${index}`, {
                        defaultValue: themeMap[index] || t("home.dynasty.defaultTheme"),
                      })}
                    </span>
                  </MotionButton>
                );
              })}
            </div>
          </div>

          {activeDynasty && (
            <MotionReveal className="museum-card rounded-3xl p-6">
              <div className="mb-4 flex items-center gap-3 text-museum-gold-light">
                <Waves className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase">
                  {t("home.dynasty.viewing")}
                </span>
              </div>
              <h3 className="font-display text-3xl font-semibold text-museum-ivory">
                {activeDynasty.name}
              </h3>
              <p className="mt-2 text-sm uppercase text-museum-gold/80">
                {formatYear(activeDynasty.startYear, t("home.dynasty.bc"))} - {formatYear(activeDynasty.endYear, t("home.dynasty.bc"))}
              </p>
              <p className="mt-4 text-sm leading-7 text-museum-muted">
                {t("home.dynasty.durationPrefix")} {activeDynasty.duration} {t("home.dynasty.years")}. {t("home.dynasty.rulersPrefix")}:
                {" "}
                <span className="text-museum-parchment">
                  {activeDynasty.keyRulers}
                </span>
              </p>
            </MotionReveal>
          )}
        </div>
      </div>
    </section>
  );
};

export default DynastyBar;
