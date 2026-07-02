import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

import MotionReveal from "~/components/common/MotionReveal";
import MuseumSectionHeader from "~/components/common/MuseumSectionHeader";
import { howItWorksSteps } from "./howItWorksSteps";

const MotionArticle = motion.article;

const HowItWork = () => {
  const { t } = useTranslation();

  const translatedSteps = howItWorksSteps.map((item) => ({
    ...item,
    title: t(`home.howItWorks.step${item._id}.title`),
    description: t(`home.howItWorks.step${item._id}.description`),
  }));

  return (
    <section className="relative">
      <MotionReveal>
        <MuseumSectionHeader
          eyebrow={t("home.howItWorks.eyebrow")}
          title={t("home.howItWorks.title")}
          description={t("home.howItWorks.sectionDescription")}
          align="center"
        />
      </MotionReveal>

      <div className="relative grid gap-5 md:grid-cols-4">
        <div className="absolute left-[12%] right-[12%] top-12 hidden h-px bg-gradient-to-r from-museum-jade/20 via-museum-gold/60 to-museum-terracotta/25 md:block" />
        {translatedSteps.map((item, index) => {
          const Icon = item.icon;
          return (
            <MotionArticle
              key={item._id}
              className="museum-card relative rounded-[2rem] p-6 text-center"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3, margin: "0px 0px -8% 0px" }}
              transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1], delay: index * 0.08 }}
            >
              <div className="relative mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-museum-gold/30 bg-museum-black text-museum-gold-light shadow-museum-gold">
                <Icon className="h-6 w-6" />
                <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-museum-seal text-xs font-bold text-museum-ivory">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="font-display text-2xl font-semibold text-museum-ivory">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-museum-muted">
                {item.description}
              </p>
            </MotionArticle>
          );
        })}
      </div>
    </section>
  );
};

export default HowItWork;
