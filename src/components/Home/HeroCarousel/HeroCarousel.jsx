import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { BookOpen, Map, ShieldCheck, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

const MotionDiv = motion.div;

const HeroCarousel = () => {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  const stats = [
    { value: "4.000+", label: t("home.hero.stats.years") },
    { value: "17", label: t("home.hero.stats.dynasties") },
    { value: "3D", label: t("home.hero.stats.interactive") },
  ];
  const motionProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 28 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
      };

  return (
    <section
      className="relative min-h-[760px] overflow-hidden pt-navbar-mobile text-museum-ivory sm:pt-navbar lg:min-h-[820px]"
      aria-label="Heritage Reborn hero"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1920&auto=format&fit=crop)",
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,10,7,0.96)_0%,rgba(11,10,7,0.78)_46%,rgba(11,10,7,0.42)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_34%,rgba(216,162,74,0.28),transparent_28rem),radial-gradient(circle_at_16%_72%,rgba(47,107,85,0.22),transparent_22rem)]" />
      <div className="museum-pattern absolute inset-0 opacity-[0.10]" />

      <div className="lcn-container-x relative grid min-h-[calc(760px-theme(spacing.navbar-mobile))] items-center gap-10 py-16 sm:min-h-[calc(820px-theme(spacing.navbar))] lg:grid-cols-[1.08fr_0.92fr]">
        <MotionDiv className="max-w-4xl" {...motionProps}>
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-museum-gold/30 bg-museum-gold/10 px-4 py-2 text-xs font-semibold uppercase text-museum-gold-light backdrop-blur">
            <Sparkles className="h-4 w-4" />
            {t("home.hero.eyebrow")}
          </span>
          <h1 className="text-balance font-display text-5xl font-semibold leading-[0.98] text-museum-gradient sm:text-6xl lg:text-7xl xl:text-8xl">
            {t("home.hero.title")}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-museum-parchment/86 sm:text-lg">
            {t("home.hero.subtitle")}
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/heritages"
              className="inline-flex h-13 items-center justify-center gap-3 rounded-full bg-museum-gold px-7 py-4 text-sm font-semibold text-museum-black shadow-museum-gold transition hover:-translate-y-0.5 hover:bg-museum-gold-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-museum-gold-light"
            >
              <BookOpen className="h-5 w-5" />
              {t("home.hero.primaryCta")}
            </Link>
            <Link
              to="/explore"
              className="inline-flex h-13 items-center justify-center gap-3 rounded-full border border-museum-gold/35 bg-museum-ivory/8 px-7 py-4 text-sm font-semibold text-museum-ivory backdrop-blur transition hover:-translate-y-0.5 hover:bg-museum-ivory/14 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-museum-gold-light"
            >
              <Map className="h-5 w-5" />
              {t("home.hero.mapCta")}
            </Link>
          </div>

          <div className="mt-12 grid max-w-2xl grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-museum-gold/15 bg-museum-ivory/7 p-4 backdrop-blur"
              >
                <div className="font-display text-2xl font-semibold text-museum-gold-light">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs uppercase text-museum-muted">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </MotionDiv>

        <MotionDiv
          className="relative mx-auto hidden w-full max-w-[520px] lg:block"
          initial={prefersReducedMotion ? false : { opacity: 0, x: 44, rotate: 2 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-museum-gold/18 blur-3xl animate-museum-glow" />
          <div className="relative animate-museum-float rounded-[2rem] border border-museum-gold/25 bg-museum-black/52 p-6 shadow-museum-card backdrop-blur-xl">
            <div className="museum-paper relative overflow-hidden rounded-[1.5rem] p-7 shadow-museum-gold">
              <div className="museum-pattern absolute inset-0 opacity-[0.12]" />
              <div className="relative">
                <div className="mb-5 flex items-center justify-between">
                  <span className="rounded-full bg-museum-seal px-3 py-1 text-xs font-semibold uppercase text-museum-ivory">
                    {t("home.hero.artifact.archive")}
                  </span>
                  <ShieldCheck className="h-6 w-6 text-museum-jade" />
                </div>
                <div className="relative overflow-hidden rounded-[1.35rem] border border-museum-gold/35 bg-museum-black/10 p-2 shadow-[0_24px_60px_rgba(27,19,12,0.18)]">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[1rem]">
                    <img
                      src="/images/hero-artifact-temple.jpg"
                      alt="Van Mieu Quoc Tu Giam"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,10,7,0.02)_0%,rgba(11,10,7,0.18)_58%,rgba(11,10,7,0.62)_100%)]" />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-museum-ivory">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-museum-gold-light">
                        {t("home.hero.artifact.featuredLabel")}
                      </p>
                      <h2 className="mt-1 font-display text-2xl font-semibold leading-none">
                        {t("home.hero.artifact.siteName")}
                      </h2>
                      <p className="mt-1 text-xs text-museum-parchment/82">
                        {t("home.hero.artifact.siteLocation")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-7 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-museum-black/8 p-4">
                    <div className="text-xs uppercase text-museum-terracotta">
                      {t("home.hero.artifact.dynastyLabel")}
                    </div>
                    <div className="mt-1 font-display text-xl font-semibold">
                      {t("home.hero.artifact.dynastyValue")}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-museum-black/8 p-4">
                    <div className="text-xs uppercase text-museum-terracotta">
                      {t("home.hero.artifact.milestoneLabel")}
                    </div>
                    <div className="mt-1 font-display text-xl font-semibold">
                      1070
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MotionDiv>
      </div>
    </section>
  );
};

export default HeroCarousel;
