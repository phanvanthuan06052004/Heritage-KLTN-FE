import { ArrowRight, Landmark } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import HeritageList from "~/components/Heritage/HeritageList";
import MotionReveal from "~/components/common/MotionReveal";
import MuseumSectionHeader from "~/components/common/MuseumSectionHeader";
import {
  MuseumEmptyState,
  MuseumErrorState,
  MuseumSkeletonGrid,
} from "~/components/common/MuseumStates";
import { useGetHeritagesQuery } from "~/store/apis/heritageApi";
import { useLanguage, useLanguageChange } from "~/hooks/useLanguage";
import { mockPopularHeritages } from "./mockPopularHeritages";

const PopularHeritage = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [randomHeritages, setRandomHeritages] = useState([]);

  const { data: response, isLoading, error, refetch } = useGetHeritagesQuery({
    page: 1,
    limit: 10,
    language,
  });

  useLanguageChange(() => {
    refetch();
  });

  useEffect(() => {
    if (response?.heritages) {
      const shuffledHeritages = [...response.heritages].sort(
        () => Math.random() - 0.5,
      );
      setRandomHeritages(shuffledHeritages.slice(0, 6));
    }
  }, [response]);

  const displayHeritages = useMemo(
    () => (randomHeritages.length ? randomHeritages : mockPopularHeritages),
    [randomHeritages],
  );

  const localizedMockHeritages = useMemo(
    () =>
      mockPopularHeritages.map((item) => ({
        ...item,
        name: t(`home.mockPopular.${item._id}.name`, { defaultValue: item.name }),
        description: t(`home.mockPopular.${item._id}.description`, {
          defaultValue: item.description,
        }),
        dynasty: t(`home.mockPopular.${item._id}.dynasty`, {
          defaultValue: item.dynasty,
        }),
        province: t(`home.mockPopular.${item._id}.province`, {
          defaultValue: item.province,
        }),
        location: t(`home.mockPopular.${item._id}.location`, {
          defaultValue: item.location,
        }),
      })),
    [t],
  );

  return (
    <section>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <MotionReveal>
          <MuseumSectionHeader
            eyebrow={t("home.popular.eyebrow")}
            title={t("home.popularHeritage")}
            description={t("home.popular.description")}
            className="mb-0"
          />
        </MotionReveal>
        <Link
          to="/heritages"
          className="inline-flex items-center gap-2 text-sm font-semibold text-museum-gold-light transition hover:text-museum-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-museum-gold-light"
        >
          {t("home.viewAll")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-10">
        {isLoading ? (
          <MuseumSkeletonGrid count={6} />
        ) : error ? (
          <div className="space-y-8">
            <MuseumErrorState
              title={t("home.popular.errorTitle")}
              description={t("home.popular.errorDescription")}
              onRetry={refetch}
            />
            <HeritageList
              heritages={localizedMockHeritages}
              cardVariant="museum"
            />
          </div>
        ) : randomHeritages.length ? (
          <HeritageList heritages={displayHeritages} cardVariant="museum" />
        ) : (
          <div className="space-y-8">
            <MuseumEmptyState
              title={t("home.popular.emptyTitle")}
              description={t("home.popular.emptyDescription")}
              icon={Landmark}
            />
            <HeritageList
              heritages={localizedMockHeritages}
              cardVariant="museum"
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularHeritage;
