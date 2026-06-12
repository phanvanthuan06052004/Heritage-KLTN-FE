import { cn } from "~/lib/utils";

const LoadingScreen = ({ fullScreen = true, message = "Đang tải..." }) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        fullScreen
          ? "fixed inset-0 z-50 bg-museum-black/85 backdrop-blur-sm"
          : "w-full min-h-[60vh] bg-transparent",
      )}
      role="status"
      aria-label="Đang tải"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Spinner vàng kép + chấm tâm */}
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-[3px] border-museum-gold/15" />
          <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-museum-gold border-r-museum-gold/60" />
          <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 animate-museum-glow rounded-full bg-museum-gold-light" />
        </div>

        <p className="animate-pulse font-display text-sm tracking-wide text-museum-parchment/80">
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
