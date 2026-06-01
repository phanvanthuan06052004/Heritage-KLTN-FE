import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLazyGetHeritagesQuery } from "~/store/apis/heritageApi";
import HeritageList from "~/components/Heritage/HeritageList";
import { Pagination } from "~/components/common/Pagination";
import MuseumSectionHeader from "~/components/common/MuseumSectionHeader";
import {
  MuseumEmptyState,
  MuseumErrorState,
  MuseumSkeletonGrid,
} from "~/components/common/MuseumStates";
import { setHeritagesPage } from "~/store/slices/paginationSlice";
import {
  selectHeritagesCurrentPage,
  selectHeritagesItemsPerPage,
  selectHeritagesSearchQuery,
} from "~/store/selectors/paginationSelectors";
import { useLanguage, useLanguageChange } from "~/hooks/useLanguage";

const DEFAULT_TOTAL_PAGES = 1;

const getListPayload = (response) => {
  if (!response) return {};
  return response?.data?.items ? response.data : response;
};

const scrollToPageTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

const Heritages = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const shouldScrollTopRef = useRef(false);
  const currentPage = useSelector(selectHeritagesCurrentPage);
  const itemsPerPage = useSelector(selectHeritagesItemsPerPage);
  const searchQuery = useSelector(selectHeritagesSearchQuery);

  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit: itemsPerPage,
      name: searchQuery || undefined,
      sort: "title",
      order: "asc",
      language,
    }),
    [currentPage, itemsPerPage, searchQuery, language],
  );

  const [trigger, { data: response, isLoading, isFetching, error }] =
    useLazyGetHeritagesQuery();

  const { heritages, totalPages } = useMemo(() => {
    const payload = getListPayload(response);
    const heritages = payload?.heritages || payload?.items || [];
    const totalItems = payload?.total ?? payload?.pagination?.total ?? heritages.length;
    const totalPages =
      payload?.pagination?.totalPages ??
      Math.max(DEFAULT_TOTAL_PAGES, Math.ceil(totalItems / itemsPerPage));

    return { heritages, totalItems, totalPages };
  }, [response, itemsPerPage]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      dispatch(setHeritagesPage(totalPages));
    }
  }, [currentPage, dispatch, totalPages]);

  const isInitialLoading = isLoading && !response;

  const renderSearchIndicator = () => {
    if (!searchQuery) return null;

    return (
      <div className="mx-auto -mt-4 mb-8 inline-flex max-w-full items-center gap-2 rounded-full border border-museum-gold/25 bg-museum-gold/10 px-4 py-2 text-sm text-museum-gold-light">
        <Search className="h-4 w-4 shrink-0" />
        <span className="truncate">
          Kết quả cho: <strong>"{searchQuery}"</strong>
        </span>
      </div>
    );
  };

  const renderErrorState = () => (
    <MuseumErrorState
      title="Không tải được danh sách di sản"
      description={error?.data?.message || "Vui lòng thử lại sau."}
      onRetry={() => trigger(queryParams)}
    />
  );

  useEffect(() => {
    trigger(queryParams);
  }, [queryParams, trigger]);

  useLanguageChange(() => {
    trigger(queryParams);
  });

  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        shouldScrollTopRef.current = true;
        dispatch(setHeritagesPage(page));
      }
    },
    [currentPage, dispatch, totalPages],
  );

  useEffect(() => {
    if (!shouldScrollTopRef.current) return;

    shouldScrollTopRef.current = false;
    requestAnimationFrame(scrollToPageTop);
  }, [currentPage]);

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

  const renderContent = () => {
    if (isInitialLoading || isFetching) {
      return (
        <MuseumSkeletonGrid
          count={itemsPerPage}
          className="gap-5 lg:grid-cols-3 xl:grid-cols-5"
        />
      );
    }

    if (error) {
      return renderErrorState();
    }

    if (!heritages.length) {
      return (
        <MuseumEmptyState
          title="Không tìm thấy di sản"
          description="Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc."
        />
      );
    }

    return (
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
    );
  };

  return (
    <section className="museum-shell min-h-screen overflow-hidden pt-navbar-mobile sm:pt-navbar">
      <div className="relative mx-auto min-h-screen max-w-[1600px] space-y-8 px-3 py-8 sm:space-y-10 sm:px-4 sm:py-10 lg:px-5 2xl:px-6">
        <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-museum-gold/35 to-transparent" />

        {/* Header */}
        <div className="animate-fade-up">
          <MuseumSectionHeader
            eyebrow={t("home.popular.eyebrow")}
            title={t("home.title")}
            description={t("home.subtitle")}
            align="center"
            className="mb-6 max-w-5xl sm:mb-8"
          />

          {/* Search indicator */}
          {renderSearchIndicator()}
        </div>

        {/* Content */}
        <div>{renderContent()}</div>
      </div>
    </section>
  );
};

export default Heritages;
