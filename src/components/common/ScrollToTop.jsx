import { useScrollToTop } from "~/hooks/useScrollToTop";
import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "~/lib/utils";

function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300);
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-6 right-6 z-40 p-3 rounded-full shadow-lg transition-all duration-300",
        "bg-heritage text-white hover:bg-heritage-dark",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none",
      )}
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}

function ScrollToTop() {
  useScrollToTop();
  return (
    <>
      <ScrollToTopButton />
    </>
  );
}

export default ScrollToTop;
