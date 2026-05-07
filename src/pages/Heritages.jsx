import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useMemo } from "react";
import { Search, RefreshCw, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  heritageSlice,
  useLazyGetHeritagesQuery,
} from "~/store/apis/heritageApi";
import HeritageList from "~/components/Heritage/HeritageList";
import HeritageSkeleton from "~/components/Heritage/HeritageSkeleton";
import { Pagination } from "~/components/common/Pagination";
import { setHeritagesPage } from "~/store/slices/paginationSlice";
import {
  selectHeritagesCurrentPage,
  selectHeritagesItemsPerPage,
  selectHeritagesSearchQuery,
} from "~/store/selectors/paginationSelectors";
import { useLanguage, useLanguageChange } from "~/hooks/useLanguage";
import { Button } from "~/components/common/ui/Button";
import { cn } from "~/lib/utils";

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
    <div className="col-span-full text-center py-16 flex flex-col items-center gap-4">
      <div className="p-4 rounded-full bg-destructive/10">
        <AlertTriangle className="w-10 h-10 text-destructive" />
      </div>
      <div>
        <p className="text-lg font-medium text-foreground">
          Failed to load heritage sites
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {error?.data?.message || "Please try again later"}
        </p>
      </div>
      <Button
        onClick={() => trigger(queryParams)}
        variant="outline"
        className="mt-2"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Try again
      </Button>
    </div>
  );

  return (
    <section className="pt-navbar-mobile sm:pt-navbar">
      <div className="lcn-container min-h-screen">
        {/* Header */}
        <div className="text-center animate-fade-up mb-8">
          <h1 className="text-3xl sm:text-4xl font-semibold text-heritage-dark mb-3">
            {t("home.title")}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            {t("home.subtitle")}
          </p>

          {/* Search indicator */}
          {searchQuery && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-heritage-light/50 rounded-full text-sm text-heritage-dark">
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
            <HeritageSkeleton count={itemsPerPage} />
          ) : error ? (
            renderErrorState()
          ) : (
            <>
              <HeritageList heritages={heritages} />
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  paginationButtons={paginationButtons}
                  handlePageChange={handlePageChange}
                  isLoading={isFetching}
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
