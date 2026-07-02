const HeritageSkeletonCard = () => {
  return (
    <div className="flex flex-col h-full overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      {/* Image skeleton */}
      <div className="relative overflow-hidden">
        <div className="aspect-[3/2] w-full bg-muted animate-pulse" />
      </div>

      {/* Content skeleton */}
      <div className="flex flex-col flex-grow p-4 space-y-2">
        <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
        <div className="h-4 w-full bg-muted rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
};

export default HeritageSkeletonCard;
