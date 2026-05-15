import { BookOpenCheck, Gem, Handshake, Lightbulb, Sprout, Telescope } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { coreValues } from "./data/coreValuesData";

const MotionArticle = motion.article;
const icons = [Telescope, Sprout, Lightbulb, Handshake, Gem, BookOpenCheck];

const CoreValues = () => {
  const { t } = useTranslation();

  const translatedValues = [
    { ...coreValues[0], title: t("about.coreValuesItems.accuracy.title"), description: t("about.coreValuesItems.accuracy.description") },
    { ...coreValues[1], title: t("about.coreValuesItems.preservation.title"), description: t("about.coreValuesItems.preservation.description") },
    { ...coreValues[2], title: t("about.coreValuesItems.innovation.title"), description: t("about.coreValuesItems.innovation.description") },
    { ...coreValues[3], title: t("about.coreValuesItems.collaboration.title"), description: t("about.coreValuesItems.collaboration.description") },
    { ...coreValues[4], title: t("about.coreValuesItems.accessibility.title"), description: t("about.coreValuesItems.accessibility.description") },
    { ...coreValues[5], title: t("about.coreValuesItems.education.title"), description: t("about.coreValuesItems.education.description") },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {translatedValues.map((value, index) => {
        const Icon = icons[index] || Gem;
        return (
          <MotionArticle
            key={value.title}
            className="museum-paper group relative overflow-hidden rounded-[2rem] p-7"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, delay: index * 0.05 }}
          >
            <div className="museum-pattern absolute inset-0 opacity-[0.08]" />
            <div className="relative mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-museum-black text-museum-gold-light shadow-lg transition group-hover:rotate-3">
              <Icon className="h-7 w-7" />
            </div>
            <h3 className="relative font-display text-2xl font-semibold text-museum-espresso">
              {value.title}
            </h3>
            <p className="relative mt-3 text-sm leading-7 text-museum-espresso/74">
              {value.description}
            </p>
          </MotionArticle>
        );
      })}
    </div>
  );
};

export default CoreValues;
