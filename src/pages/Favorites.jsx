import { Heart, HeartOff, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { selectCurrentUser } from "~/store/slices/authSlice";
import { useGetFavoritesByUserIdQuery } from "~/store/apis/favoritesSlice";
import HeritageCard from "~/components/Heritage/HeritageCard";
import { Button } from "~/components/common/ui/Button";
import { usePagination } from "~/hooks/usePagination";
import { Pagination } from "~/components/common/Pagination";
import MuseumSectionHeader from "~/components/common/MuseumSectionHeader";
import { MuseumSkeletonGrid } from "~/components/common/MuseumStates";
import { setFavoritesPage } from "~/store/slices/paginationSlice";
import {
  selectFavoritesCurrentPage,
  selectFavoritesItemsPerPage,
} from "~/store/selectors/paginationSelectors";
import { useLanguage, useLanguageChange } from "~/hooks/useLanguage";

const Favorites = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = !!user;
  const dispatch = useDispatch();

  const currentPage = useSelector(selectFavoritesCurrentPage);
  const itemsPerPage = useSelector(selectFavoritesItemsPerPage);

  const {
    data: favoritesData,
    isLoading: isFavoritesLoading,
    error: favoritesError,
    isFetching: isFavoritesFetching,
    refetch,
  } = useGetFavoritesByUserIdQuery(
    {
      userId: user?._id,
      page: currentPage,
      limit: itemsPerPage,
      language,
    },
    {
      skip: !isAuthenticated,
    },
  );

  const favoriteItems = favoritesData?.items || [];
  const totalPages = favoritesData?.pagination?.totalPages || 1;

  const { handlePageChange, paginationButtons } = usePagination(
    totalPages,
    currentPage,
    setFavoritesPage,
  );

  useEffect(() => {
    if (totalPages > 0) {
      if (currentPage > totalPages) {
        dispatch(setFavoritesPage(totalPages));
      } else if (favoriteItems.length === 0 && currentPage > 1) {
        dispatch(setFavoritesPage(1));
      }
    }
  }, [totalPages, currentPage, favoriteItems.length, dispatch]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useLanguageChange(() => {
    refetch();
  });

  if (!isAuthenticated) return null;

  const isLoading = isFavoritesLoading || isFavoritesFetching;
  const hasFavorites = favoriteItems.length > 0;

  return (
    <section className="museum-shell min-h-screen overflow-hidden pt-navbar-mobile sm:pt-navbar">
      <div className="lcn-container relative min-h-screen">
        <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-museum-gold/35 to-transparent" />

        {/* Header */}
        <div className="animate-fade-up">
          <MuseumSectionHeader
            eyebrow={t("nav.favorites")}
            title={t("favorites.title")}
            description={t("favorites.subtitle")}
            align="center"
          />
        </div>

        {/* Error state */}
        {favoritesError && (
          <div className="mb-6 rounded-3xl border border-museum-seal/35 bg-museum-seal/10 px-6 py-8 text-center text-museum-ivory">
            <p className="font-medium text-museum-gold-light">
              {t("favorites.errorLoading")}
            </p>
            <p className="mt-1 text-sm text-museum-muted">
              {favoritesError.status === 404
                ? t("favorites.errorNoFavorites")
                : favoritesError.data?.message || t("favorites.errorTryAgain")}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              className="mt-4 rounded-full border-museum-gold/35 bg-museum-ivory/8 text-museum-ivory hover:bg-museum-gold hover:text-museum-black"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <MuseumSkeletonGrid count={itemsPerPage} />
        ) : hasFavorites ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteItems.map((item) => (
                <HeritageCard
                  key={item._id}
                  item={item}
                  isFavorited={true}
                  variant="museum"
                  onFavoriteChange={(newState) => {
                    if (!newState && favoriteItems.length <= 1) {
                      if (currentPage > 1 && currentPage === totalPages) {
                        dispatch(setFavoritesPage(currentPage - 1));
                      } else {
                        setTimeout(() => refetch(), 300);
                      }
                    }
                  }}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                paginationButtons={paginationButtons}
                handlePageChange={handlePageChange}
                isLoading={isLoading}
                variant="museum"
              />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-museum-gold/20 bg-museum-ivory/5 px-6 py-16 text-center text-museum-ivory">
            <div className="rounded-2xl bg-museum-gold/10 p-5 text-museum-gold-light">
              <HeartOff className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-semibold text-museum-ivory">
                {t("favorites.empty")}
              </h2>
              <p className="max-w-md text-sm leading-6 text-museum-muted">
                {t("favorites.emptyDescription")}
              </p>
            </div>
            <Button
              onClick={() => navigate("/heritages")}
              className="mt-2 rounded-full bg-museum-gold text-museum-black hover:bg-museum-gold-light"
            >
              <Heart className="w-4 h-4 mr-2" />
              {t("favorites.exploreHeritages")}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Favorites;
