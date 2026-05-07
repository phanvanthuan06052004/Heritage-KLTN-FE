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

const Home = () => {
  return (
    <>
      <Suspense
        fallback={
          <LoadingScreen fullScreen={false} message="Loading hero..." />
        }
      >
        <HeroCarousel />
      </Suspense>
      <div className="lcn-container">
        <Suspense
          fallback={
            <LoadingScreen fullScreen={false} message="Loading features..." />
          }
        >
          <FeatureHighlight />
          <PopularHeritage />
          <HowItWork />
        </Suspense>
      </div>
    </>
  );
};

export default Home;
