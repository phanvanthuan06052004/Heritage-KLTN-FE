import { useEffect, useState } from "react";

const ReadingProgressBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const raw = (scrollTop / docHeight) * 100;
        setProgress(Math.min(raw, 100));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] h-[3px] pointer-events-none">
      <div className="absolute inset-0 bg-foreground/5" />
      <div
        className="absolute top-0 left-0 h-full w-full origin-left rounded-r-full"
        style={{
          transform: `scaleX(${progress / 100})`,
          background:
            "linear-gradient(90deg, hsl(43, 74%, 49%), hsl(35, 85%, 60%))",
          boxShadow:
            progress > 0
              ? "0 0 6px hsl(43, 74%, 49% / 0.5), 0 0 12px hsl(43, 74%, 49% / 0.25)"
              : "none",
          transition: "transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
      />
    </div>
  );
};

export default ReadingProgressBar;