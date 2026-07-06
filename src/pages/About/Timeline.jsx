import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { timelineItems } from "./data/timelineData";

const MotionArticle = motion.article;

const Timeline = () => {
  const { t } = useTranslation();

  const translatedItems = [
    { ...timelineItems[0], year: t("about.timeline.item1.year"), title: t("about.timeline.item1.title"), description: t("about.timeline.item1.description") },
    { ...timelineItems[1], year: t("about.timeline.item2.year"), title: t("about.timeline.item2.title"), description: t("about.timeline.item2.description") },
    { ...timelineItems[2], year: t("about.timeline.item3.year"), title: t("about.timeline.item3.title"), description: t("about.timeline.item3.description") },
    { ...timelineItems[3], year: t("about.timeline.item4.year"), title: t("about.timeline.item4.title"), description: t("about.timeline.item4.description") },
  ];

  return (
    <div className="relative">
      <div className="absolute left-5 top-0 hidden h-full w-px bg-gradient-to-b from-museum-gold/0 via-museum-gold/45 to-museum-gold/0 md:left-1/2 md:block" />
      <div className="space-y-10">
        {translatedItems.map((item, index) => (
          <MotionArticle
            key={item.year}
            className={`relative grid gap-6 md:grid-cols-2 md:gap-12 ${
              index % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
            }`}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.22 }}
            transition={{ duration: 0.62, delay: index * 0.06 }}
          >
            <div className="museum-card rounded-[2rem] p-6 md:p-8">
              <span className="text-sm font-semibold uppercase text-museum-gold-light">
                {item.year}
              </span>
              <h3 className="mt-3 font-display text-3xl font-semibold text-museum-ivory">
                {item.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-museum-muted">
                {item.description}
              </p>
            </div>
            <div className="relative overflow-hidden rounded-[2rem] border border-museum-gold/20 shadow-museum-card">
              <img
                src={item.img || "https://placehold.co/600x400"}
                alt={item.title}
                className="aspect-video h-full w-full object-cover brightness-90 transition duration-700 hover:scale-[1.04]"
                width="600"
                height="338"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-museum-black/45 to-transparent" />
            </div>
            <div className="absolute left-1/2 top-8 hidden h-5 w-5 -translate-x-1/2 rounded-full border-4 border-museum-black bg-museum-gold shadow-museum-gold md:block" />
          </MotionArticle>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
