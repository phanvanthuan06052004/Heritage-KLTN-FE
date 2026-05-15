import { AlertTriangle, Archive, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/common/ui/Button";
import { cn } from "~/lib/utils";

export const MuseumSkeletonGrid = ({ count = 6, className }) => (
  <div
    className={cn("grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}
    role="status"
    aria-label="Loading museum cards"
  >
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="overflow-hidden rounded-2xl border border-museum-gold/15 bg-museum-ivory/5"
      >
        <div className="h-52 animate-pulse bg-museum-ivory/10" />
        <div className="space-y-3 p-5">
          <div className="h-4 w-28 animate-pulse rounded-full bg-museum-gold/20" />
          <div className="h-6 w-3/4 animate-pulse rounded bg-museum-ivory/15" />
          <div className="h-4 w-full animate-pulse rounded bg-museum-ivory/10" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-museum-ivory/10" />
        </div>
      </div>
    ))}
  </div>
);

export const MuseumEmptyState = ({ title, description }) => (
  <div className="rounded-3xl border border-museum-gold/20 bg-museum-ivory/5 p-8 text-center text-museum-ivory">
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-museum-gold/10 text-museum-gold-light">
      <Archive className="h-7 w-7" />
    </div>
    <h3 className="font-display text-2xl font-semibold">{title}</h3>
    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-museum-muted">
      {description}
    </p>
  </div>
);

export const MuseumErrorState = ({ title, description, onRetry }) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-3xl border border-museum-seal/35 bg-museum-seal/10 p-8 text-center text-museum-ivory">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-museum-seal/25 text-museum-gold-light">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h3 className="font-display text-2xl font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-museum-muted">
        {description}
      </p>
      {onRetry && (
        <Button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-full bg-museum-gold text-museum-black hover:bg-museum-gold-light"
        >
          <RefreshCw className="h-4 w-4" />
          {t("common.tryAgain")}
        </Button>
      )}
    </div>
  );
};
