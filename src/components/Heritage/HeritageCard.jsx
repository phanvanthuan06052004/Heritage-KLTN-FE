import { ArrowRight, Heart, ImageOff, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState, memo, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { cn } from "~/lib/utils";
import { Button } from "~/components/common/ui/Button";
import {
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation,
} from "~/store/apis/favoritesSlice";
import { setFavoriteStatus } from "~/store/slices/favoriteSlice";

const CONFIG = {
  placeholderImage: "/images/placeholder.webp",
  fallbackImage: "/images/placeholder.webp",
};

const HeritageCard = memo(({
  item,
  isFavorited: propIsFavorited = false,
  isAuthenticated = false,
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

  const imgSrcRef = useRef(images[0] || CONFIG.placeholderImage);
  const [imgError, setImgError] = useState(false);

  const [addToFavorites, { isLoading: isAdding }] = useAddToFavoritesMutation();
  const [removeFromFavorites, { isLoading: isRemoving }] =
    useRemoveFromFavoritesMutation();

  const handleFavoriteClick = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to perform this action");
      return;
    }

    const newFavoritedState = !propIsFavorited;
    dispatch(
      setFavoriteStatus({
        heritageId: _id,
        isFavorited: newFavoritedState,
      }),
    );

    try {
      if (newFavoritedState) {
        await addToFavorites({
          heritageId: _id,
        }).unwrap();
        toast.success("Added to favorites");
      } else {
        await removeFromFavorites({
          heritageId: _id,
        }).unwrap();
        toast.success("Removed from favorites");
      }

      if (onFavoriteChange) {
        onFavoriteChange(newFavoritedState);
      }
    } catch {
      dispatch(
        setFavoriteStatus({
          heritageId: _id,
          isFavorited: !newFavoritedState,
        }),
      );
      toast.error("An error occurred. Please try again later.");
    }
  }, [_id, isAuthenticated, propIsFavorited, dispatch, addToFavorites, removeFromFavorites, onFavoriteChange]);

  const handleImageError = () => {
    setImgError(true);
    imgSrcRef.current = CONFIG.fallbackImage;
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
          className="museum-card flex h-full flex-col overflow-hidden rounded-[2rem] bg-museum-ivory/7 shadow-none transition-colors duration-200 hover:border-museum-gold/45"
        >
          <div className="relative overflow-hidden">
            {imgError ? (
              <div className="aspect-[4/3] w-full bg-museum-ivory/10 flex items-center justify-center">
                <ImageOff className="h-10 w-10 text-museum-muted" />
              </div>
            ) : (
              <img
                src={imgSrcRef.current}
                alt={name}
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
                decoding="async"
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
                  <span className="rounded-full bg-museum-black/80 px-3 py-1 text-xs font-semibold text-museum-gold-light">
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
                className="absolute right-4 top-4 rounded-full bg-museum-black/80 text-museum-ivory hover:bg-museum-gold hover:text-museum-black"
                aria-label={
                  propIsFavorited ? "Remove from favorites" : "Add to favorites"
                }
                aria-live="polite"
              >
                <Heart
                  size={20}
                  className={cn(
                    "transition-all",
                    propIsFavorited && "fill-museum-seal text-museum-seal scale-110",
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
                  src={imgSrcRef.current}
                  alt={name}
                  className="aspect-[3/2] w-full object-cover"
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
                  propIsFavorited ? "Remove from favorites" : "Add to favorites"
                }
                aria-live="polite"
              >
                <Heart
                  size={20}
                  className={cn(
                    "transition-all",
                    propIsFavorited
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
});

HeritageCard.displayName = "HeritageCard";

export default HeritageCard;
