import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  heritageSlice,
  useLazyGetHeritagesQuery,
} from "~/store/apis/heritageApi";
import HeritageList from "~/components/Heritage/HeritageList";
import { Pagination } from "~/components/common/Pagination";
import MuseumSectionHeader from "~/components/common/MuseumSectionHeader";
import {
  MuseumEmptyState,
  MuseumErrorState,
  MuseumSkeletonGrid,
} from "~/components/common/MuseumStates";
import { setHeritagesPage, setHeritagesSearchQuery } from "~/store/slices/paginationSlice";
import {
  selectHeritagesCurrentPage,
  selectHeritagesItemsPerPage,
  selectHeritagesSearchQuery,
} from "~/store/selectors/paginationSelectors";
import { useLanguage, useLanguageChange } from "~/hooks/useLanguage";

const Heritages = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const currentPage = useSelector(selectHeritagesCurrentPage);
  const itemsPerPage = useSelector(selectHeritagesItemsPerPage);
  const searchQuery = useSelector(selectHeritagesSearchQuery);

  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit: itemsPerPage,
      name: searchQuery || undefined,
      language,
    }),
    [currentPage, itemsPerPage, searchQuery, language],
  );

  const [trigger, { data: response, isLoading, isFetching, error }] =
    useLazyGetHeritagesQuery();

  const { heritages, totalPages } = useMemo(() => {
    const heritages = response?.heritages || [];
    const pagination = response?.pagination || {};
    const totalPages = pagination.totalPages ?? 1;
    return { heritages, totalPages };
  }, [response]);

  useEffect(() => {
    trigger(queryParams);
  }, [queryParams, trigger]);

  useEffect(() => {
    return () => {
      dispatch(setHeritagesSearchQuery(''));
    };
  }, [dispatch]);

  useLanguageChange(() => {
    trigger(queryParams);
  });

  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        dispatch(setHeritagesPage(page));
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [dispatch, totalPages],
  );

  // Generate pagination buttons
  const paginationButtons = useMemo(() => {
    if (totalPages <= 1) return [];

    const pages = [];
    const maxPagesToShow = 5;
    const half = Math.floor(maxPagesToShow / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxPagesToShow - 1);

    if (end - start + 1 < maxPagesToShow) {
      start = Math.max(1, end - maxPagesToShow + 1);
    }

    if (start > 1) pages.push(1);
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");
    if (end < totalPages) pages.push(totalPages);

    return pages;
  }, [currentPage, totalPages]);

  // Prefetch next page
  const prefetchNextPage = useCallback(() => {
    if (
      currentPage < totalPages &&
      (!searchQuery || heritages.length > 0) &&
      !error
    ) {
      const nextPageParams = {
        page: currentPage + 1,
        limit: itemsPerPage,
        name: searchQuery || undefined,
        language,
      };
      dispatch(
        heritageSlice.util.prefetch("getHeritages", nextPageParams, {
          force: false,
        }),
      );
    }
  }, [
    currentPage,
    totalPages,
    itemsPerPage,
    searchQuery,
    heritages.length,
    error,
    dispatch,
    language,
  ]);

  useEffect(() => {
    if (!isLoading && !isFetching) {
      prefetchNextPage();
    }
  }, [prefetchNextPage, isLoading, isFetching]);

  // Error state
  const renderErrorState = () => (
    <MuseumErrorState
      title="Failed to load heritage sites"
      description={error?.data?.message || "Please try again later"}
      onRetry={() => trigger(queryParams)}
    />
  );

  return (
    <section className="museum-shell min-h-screen overflow-hidden pt-navbar-mobile sm:pt-navbar">
      <div className="lcn-container relative min-h-screen">
        <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-museum-gold/35 to-transparent" />

        {/* Header */}
        <div className="animate-fade-up">
          <MuseumSectionHeader
            eyebrow={t("home.popular.eyebrow")}
            title={t("home.title")}
            description={t("home.subtitle")}
            align="center"
          />

          {/* Search indicator */}
          {searchQuery && (
            <div className="mx-auto -mt-4 mb-8 inline-flex items-center gap-2 rounded-full border border-museum-gold/25 bg-museum-gold/10 px-4 py-2 text-sm text-museum-gold-light">
              <Search className="w-4 h-4" />
              <span>
                Results for: <strong>"{searchQuery}"</strong>
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div>
          {isLoading ? (
            <MuseumSkeletonGrid count={itemsPerPage} />
          ) : error ? (
            renderErrorState()
          ) : !heritages.length ? (
            <MuseumEmptyState
              title="No heritage sites found"
              description="Try adjusting your search or filters."
            />
          ) : (
            <>
              <HeritageList heritages={heritages} cardVariant="museum" />
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  paginationButtons={paginationButtons}
                  handlePageChange={handlePageChange}
                  isLoading={isFetching}
                  variant="museum"
                />
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Heritages;
