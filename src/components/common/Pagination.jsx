import { memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "~/lib/utils";

export const Pagination = memo(({
  currentPage,
  totalPages,
  paginationButtons,
  handlePageChange,
  isLoading,
  variant = "default",
}) => {
  if (totalPages <= 1) return null;

  const isMuseum = variant === "museum";

  return (
    <nav className="mt-8 flex justify-center gap-1.5" aria-label="Pagination">
      {/* Previous Button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className={cn(
          "inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md border transition-colors",
          isMuseum
            ? "border-museum-gold/25 bg-museum-ivory/8 text-museum-ivory hover:border-museum-gold/50 hover:bg-museum-gold/15 hover:text-museum-gold-light"
            : "border-input bg-background hover:bg-accent hover:text-accent-foreground",
          "disabled:opacity-50 disabled:pointer-events-none",
          isMuseum
            ? "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-museum-gold-light"
            : "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        )}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} aria-hidden="true" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Page Buttons */}
      <div className="flex gap-1.5">
        {paginationButtons.map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className={cn(
                "inline-flex items-center justify-center w-10 h-10 text-sm select-none",
                isMuseum ? "text-museum-muted" : "text-muted-foreground",
              )}
              aria-hidden="true"
            >
              ...
            </span>
          ) : (
            <button
              key={`page-${page}`}
              onClick={() => handlePageChange(page)}
              disabled={isLoading}
              className={cn(
                "inline-flex items-center justify-center w-10 h-10 text-sm font-medium rounded-md border transition-colors",
                isMuseum
                  ? currentPage === page
                    ? "border-museum-gold bg-museum-gold text-museum-black shadow-museum-gold hover:bg-museum-gold-light"
                    : "border-museum-gold/25 bg-museum-ivory/8 text-museum-ivory hover:border-museum-gold/50 hover:bg-museum-gold/15 hover:text-museum-gold-light"
                  : currentPage === page
                    ? "bg-heritage text-white border-heritage hover:bg-heritage-dark"
                    : "border-input bg-background hover:bg-accent hover:text-accent-foreground",
                isMuseum
                  ? "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-museum-gold-light"
                  : "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                "disabled:opacity-50 disabled:pointer-events-none",
              )}
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </button>
          ),
        )}
      </div>

      {/* Next Button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className={cn(
          "inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md border transition-colors",
          isMuseum
            ? "border-museum-gold/25 bg-museum-ivory/8 text-museum-ivory hover:border-museum-gold/50 hover:bg-museum-gold/15 hover:text-museum-gold-light"
            : "border-input bg-background hover:bg-accent hover:text-accent-foreground",
          "disabled:opacity-50 disabled:pointer-events-none",
          isMuseum
            ? "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-museum-gold-light"
            : "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        )}
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </nav>
  );
});
