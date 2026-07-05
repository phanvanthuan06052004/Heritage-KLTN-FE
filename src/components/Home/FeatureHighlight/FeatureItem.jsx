import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/utils";

const MotionArticle = motion.article;

const FeatureItem = ({ item, showButton = true, className }) => {
  const { t } = useTranslation();
  const Icon = item.icon;

  return (
    <MotionArticle
      whileHover={{ y: -8 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      initial={{ opacity: 0, y: 34, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.28, margin: "0px 0px -8% 0px" }}
      className={cn(
        "group relative flex h-full min-h-[330px] flex-col overflow-hidden rounded-[2rem] border border-museum-gold/15 bg-museum-ivory/7 p-6 shadow-museum-card backdrop-blur",
        className,
      )}
    >
      <div className="museum-pattern absolute inset-0 opacity-[0.06]" />
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-museum-gold/14 blur-3xl transition group-hover:scale-125" />
      <div className="relative">
        <div className="mb-7 flex h-20 w-20 items-center justify-center rounded-3xl border border-museum-gold/25 bg-museum-black shadow-museum-gold">
          <Icon className="h-9 w-9 text-museum-gold-light" />
        </div>
        <h3 className="font-display text-3xl font-semibold leading-tight text-museum-ivory">
          {item.title}
        </h3>
        <p className="mt-4 flex-grow text-sm leading-7 text-museum-muted">
          {item.description}
        </p>
      </div>
      {showButton && (
        <Link
          to={item.to}
          className="relative mt-auto inline-flex items-center gap-2 pt-8 text-sm font-semibold text-museum-gold-light transition hover:text-museum-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-museum-gold-light"
          aria-label={`${t("home.features.cardCta")} ${item.title}`}
        >
          {t("home.features.cardCta")}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </Link>
      )}
    </MotionArticle>
  );
};

export default FeatureItem;
