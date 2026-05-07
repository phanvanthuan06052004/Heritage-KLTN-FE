import { cn } from "~/lib/utils";

const LoadingScreen = ({ fullScreen = true, message = "Đang tải..." }) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-background",
        fullScreen
          ? "fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          : "w-full py-20",
      )}
      role="status"
      aria-label="Loading"
    >
      <div className="text-center space-y-4">
        {/* Spinner */}
        <div className="relative mx-auto w-16 h-16">
          <div className="w-16 h-16 border-4 border-heritage-light/20 rounded-full" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-heritage border-t-transparent rounded-full animate-spin" />
        </div>

        {/* Message */}
        <p className="text-heritage-dark font-medium animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
