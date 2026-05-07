import { Heart, HeartOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { selectCurrentUser } from "~/store/slices/authSlice";
import { useGetFavoritesByUserIdQuery } from "~/store/apis/favoritesSlice";
import HeritageCard from "~/components/Heritage/HeritageCard";
import { Button } from "~/components/common/ui/Button";
import HeritageSkeleton from "~/components/Heritage/HeritageSkeleton";
import { usePagination } from "~/hooks/usePagination";
import { Pagination } from "~/components/common/Pagination";
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
    <div className="pt-navbar-mobile sm:pt-navbar">
      <div className="lcn-container min-h-screen">
        {/* Header */}
        <div className="text-center animate-fade-up mb-8">
          <div className="w-16 h-16 rounded-full bg-heritage-light flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-heritage" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-heritage-dark mb-3">
            {t("favorites.title")}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            {t("favorites.subtitle")}
          </p>
        </div>

        {/* Error state */}
        {favoritesError && (
          <div className="text-center py-8 px-4 bg-destructive/5 rounded-lg border border-destructive/10 mb-6">
            <p className="font-medium text-destructive">
              {t("favorites.errorLoading")}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {favoritesError.status === 404
                ? t("favorites.errorNoFavorites")
                : favoritesError.data?.message || t("favorites.errorTryAgain")}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              className="mt-3"
            >
              Try again
            </Button>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <HeritageSkeleton count={itemsPerPage} />
        ) : hasFavorites ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteItems.map((item) => (
                <HeritageCard
                  key={item._id}
                  item={item}
                  isFavorited={true}
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
              />
            )}
          </>
        ) : (
          <div className="text-center py-16 flex flex-col items-center gap-4">
            <div className="p-5 rounded-full bg-muted">
              <HeartOff className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-medium text-foreground">
                {t("favorites.empty")}
              </h2>
              <p className="text-muted-foreground max-w-md text-sm">
                {t("favorites.emptyDescription")}
              </p>
            </div>
            <Button onClick={() => navigate("/heritages")} className="mt-2">
              <Heart className="w-4 h-4 mr-2" />
              {t("favorites.exploreHeritages")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
