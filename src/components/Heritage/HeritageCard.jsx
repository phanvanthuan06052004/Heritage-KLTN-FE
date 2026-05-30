import { ArrowRight, Heart, ImageOff, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { cn } from "~/lib/utils";
import { Button } from "~/components/common/ui/Button";
import { selectCurrentUser } from "~/store/slices/authSlice";
import {
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation,
} from "~/store/apis/favoritesSlice";
import {
  selectIsFavorited,
  setFavoriteStatus,
  selectIsFavoriteInitialized,
} from "~/store/slices/favoriteSlice";

const CONFIG = {
  placeholderImage: "/images/placeholder.webp",
  fallbackImage: "/images/placeholder.webp",
};

const HeritageCard = ({
  item,
  isFavorited: propIsFavorited,
  onFavoriteChange,
  variant = "default",
}) => {
  const { t } = useTranslation();
  const {
    _id,
    name = "",
    location = "",
    description = "",
    images = [],
    nameSlug = "",
    dynasty,
    province,
  } = item || {};

  const dispatch = useDispatch();
  const userInfo = useSelector(selectCurrentUser);
  const isAuthenticated = !!userInfo;

  const isFavoritedFromStore = useSelector(selectIsFavorited(_id));
  const isFavoriteInitialized = useSelector(selectIsFavoriteInitialized);

  const [isFavorited, setIsFavorited] = useState(propIsFavorited || false);
  const [imgSrc, setImgSrc] = useState(images[0] || CONFIG.placeholderImage);
  const [imgError, setImgError] = useState(false);

  const [addToFavorites, { isLoading: isAdding }] = useAddToFavoritesMutation();
  const [removeFromFavorites, { isLoading: isRemoving }] =
    useRemoveFromFavoritesMutation();

  useEffect(() => {
    if (propIsFavorited !== undefined) {
      setIsFavorited(propIsFavorited);
    } else if (isFavoriteInitialized) {
      setIsFavorited(isFavoritedFromStore);
    }
  }, [propIsFavorited, isFavoritedFromStore, isFavoriteInitialized]);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to perform this action");
      return;
    }

    try {
      const newFavoritedState = !isFavorited;
      setIsFavorited(newFavoritedState);
      dispatch(
        setFavoriteStatus({
          heritageId: _id,
          isFavorited: newFavoritedState,
        }),
      );

      if (newFavoritedState) {
        await addToFavorites({
          userId: userInfo._id,
          heritageId: _id,
        }).unwrap();
        toast.success("Added to favorites");
      } else {
        await removeFromFavorites({
          userId: userInfo._id,
          heritageId: _id,
        }).unwrap();
        toast.success("Removed from favorites");
      }

      if (onFavoriteChange) {
        onFavoriteChange(newFavoritedState);
      }
    } catch (error) {
      // Rollback
      setIsFavorited(!isFavorited);
      dispatch(
        setFavoriteStatus({
          heritageId: _id,
          isFavorited: !isFavorited,
        }),
      );
      console.log(error);
      toast.error("An error occurred. Please try again later.");
    }
  };

  const handleImageError = () => {
    setImgError(true);
    setImgSrc(CONFIG.fallbackImage);
  };

  if (!item) return null;

  const isLoading = isAdding || isRemoving;

  if (variant === "museum") {
    return (
      <Link
        to={`/heritage/${nameSlug}`}
        className="group block h-full rounded-[2rem] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-museum-gold-light"
        aria-label={`View details: ${name}`}
      >
        <article
          className="museum-card flex h-full flex-col overflow-hidden rounded-[2rem] bg-museum-ivory/7 transition duration-300 hover:-translate-y-1 hover:border-museum-gold/45 hover:shadow-museum-gold"
        >
          <div className="relative overflow-hidden">
            {imgError ? (
              <div className="aspect-[4/3] w-full bg-museum-ivory/10 flex items-center justify-center">
                <ImageOff className="h-10 w-10 text-museum-muted" />
              </div>
            ) : (
              <img
                src={imgSrc}
                alt={name}
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
                width="600"
                height="450"
                onError={handleImageError}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-museum-black via-museum-black/18 to-transparent" />
            {(dynasty || province) && (
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                {dynasty && (
                  <span className="rounded-full bg-museum-seal px-3 py-1 text-xs font-semibold text-museum-ivory">
                    {dynasty}
                  </span>
                )}
                {province && (
                  <span className="rounded-full bg-museum-black/70 px-3 py-1 text-xs font-semibold text-museum-gold-light backdrop-blur">
                    {province}
                  </span>
                )}
              </div>
            )}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFavoriteClick}
                disabled={isLoading}
                className="absolute right-4 top-4 rounded-full bg-museum-black/70 text-museum-ivory backdrop-blur hover:bg-museum-gold hover:text-museum-black"
                aria-label={
                  isFavorited ? "Remove from favorites" : "Add to favorites"
                }
                aria-live="polite"
              >
                <Heart
                  size={20}
                  className={cn(
                    "transition-all",
                    isFavorited && "fill-museum-seal text-museum-seal scale-110",
                    isLoading && "opacity-50",
                  )}
                />
              </Button>
            )}
          </div>
          <div className="flex flex-1 flex-col p-5">
            <h3 className="font-display text-2xl font-semibold leading-tight text-museum-ivory transition group-hover:text-museum-gold-light">
              {name}
            </h3>
            {location && (
              <p className="mt-3 flex items-center gap-2 text-sm text-museum-muted">
                <MapPin className="h-4 w-4 shrink-0 text-museum-gold-light" />
                <span className="truncate">{location}</span>
              </p>
            )}
            {description && (
              <p className="mt-4 line-clamp-3 text-sm leading-7 text-museum-muted">
                {description}
              </p>
            )}
            <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-museum-gold-light">
              {t("home.popular.cardCta")}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link
      to={`/heritage/${nameSlug}`}
      className="block group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-lg"
      aria-label={`View details: ${name}`}
    >
      <div className="flex flex-col h-full overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:border-heritage/20">
        {/* Image section */}
        <div className="relative overflow-hidden">
          {imgError ? (
            <div className="aspect-[3/2] w-full bg-muted flex items-center justify-center">
              <ImageOff className="w-10 h-10 text-muted-foreground/50" />
            </div>
          ) : (
            <img
              src={imgSrc}
              alt={name}
              className="aspect-[3/2] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              width="600"
              height="400"
              onError={handleImageError}
            />
          )}

          {/* Favorite button */}
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavoriteClick}
              disabled={isLoading}
              className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm hover:bg-white/90"
              aria-label={
                isFavorited ? "Remove from favorites" : "Add to favorites"
              }
              aria-live="polite"
            >
              <Heart
                size={20}
                className={cn(
                  "transition-all",
                  isFavorited
                    ? "fill-heritage text-heritage scale-110"
                    : "text-muted-foreground",
                  isLoading && "opacity-50",
                )}
              />
            </Button>
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        </div>

        {/* Content section */}
        <div className="flex flex-col flex-grow p-4">
          <h3 className="mb-1.5 text-lg font-semibold line-clamp-1 group-hover:text-heritage transition-colors">
            {name}
          </h3>
          {location && (
            <p className="mb-2 text-sm text-muted-foreground flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{location}</span>
            </p>
          )}
          {description && (
            <p className="text-sm text-foreground/70 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default HeritageCard;
