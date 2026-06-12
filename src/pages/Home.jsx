import { lazy, Suspense } from "react";
import LoadingScreen from "~/components/common/LoadingScreen";

const FeatureHighlight = lazy(
  () => import("~/components/Home/FeatureHighlight/FeatureHighlight"),
);
const HeroCarousel = lazy(
  () => import("~/components/Home/HeroCarousel/HeroCarousel"),
);
const HowItWork = lazy(() => import("~/components/Home/HowItWork/HowItWork"));
const PopularHeritage = lazy(
  () => import("~/components/Home/PopularHeritage/PopularHeritage"),
);
const MarqueeStrip = lazy(
  () => import("~/components/Home/MarqueeStrip/MarqueeStrip"),
);
const DynastyBar = lazy(
  () => import("~/components/Home/DynastyBar/DynastyBar"),
);
const OnThisDay = lazy(() => import("~/components/Home/OnThisDay/OnThisDay"));

const Home = () => {
  return (
    <div className="museum-shell overflow-hidden">
      <Suspense
        fallback={
          <LoadingScreen fullScreen={false} message="Đang tải trang chủ…" />
        }
      >
        <HeroCarousel />
      </Suspense>

      <Suspense fallback={null}>
        <MarqueeStrip />
      </Suspense>

      <Suspense fallback={null}>
        <DynastyBar />
      </Suspense>

      <Suspense fallback={null}>
        <OnThisDay />
      </Suspense>

      <div className="lcn-container space-y-20 py-16 sm:space-y-24 sm:py-20">
        <Suspense
          fallback={
            <LoadingScreen fullScreen={false} message="Đang tải nội dung…" />
          }
        >
          <FeatureHighlight />
          <PopularHeritage />
          <HowItWork />
        </Suspense>
      </div>
    </div>
  );
};

export default Home;
