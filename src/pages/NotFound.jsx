import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Compass, MapPinned } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User accessed non-existent path:", location.pathname);
  }, [location.pathname]);

  return (
    <section className="museum-shell relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-navbar-mobile sm:pt-navbar">
      {/* Vầng sáng vàng + la bàn mờ trang trí */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-museum-gold/35 to-transparent" />
      <Compass
        className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 animate-museum-float text-museum-gold/[0.04]"
        strokeWidth={0.6}
      />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-museum-gold/10 blur-[120px]" />

      <div className="relative z-10 flex max-w-xl animate-fade-in flex-col items-center text-center">
        {/* 404 + huy hiệu la bàn */}
        <div className="relative mb-2">
          <h1 className="select-none bg-gradient-to-b from-museum-gold-light via-museum-gold to-museum-terracotta bg-clip-text font-display text-[8rem] font-extrabold leading-none text-transparent drop-shadow-[0_8px_32px_rgba(216,162,74,0.25)] sm:text-[11rem]">
            404
          </h1>
          <div className="absolute -right-2 -top-3 flex h-16 w-16 animate-museum-glow items-center justify-center rounded-full border border-museum-gold/40 bg-museum-black/70 shadow-museum-gold backdrop-blur sm:-right-6 sm:h-20 sm:w-20">
            <Compass className="h-8 w-8 text-museum-gold-light sm:h-10 sm:w-10" />
          </div>
        </div>

        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-museum-gold/25 bg-museum-gold/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-museum-gold-light">
          <MapPinned className="h-3.5 w-3.5" /> Lạc lối trong dòng lịch sử
        </span>

        <h2 className="font-display text-3xl font-bold text-museum-ivory sm:text-4xl">
          Không tìm thấy trang
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-museum-parchment/80 sm:text-base">
          Trang anh/chị tìm không tồn tại hoặc đã được dời đi. Hãy quay lại và
          tiếp tục hành trình khám phá di sản Việt Nam.
        </p>

        {/* Hành động */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="group flex items-center gap-2 rounded-full bg-museum-gold px-6 py-3 text-sm font-semibold text-museum-black shadow-museum-gold transition-colors hover:bg-museum-gold-light"
          >
            <Home className="h-4 w-4" /> Về trang chủ
          </Link>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-full border border-museum-gold/35 bg-museum-black/50 px-6 py-3 text-sm font-medium text-museum-gold-light transition-colors hover:bg-museum-gold/12"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </button>
          <Link
            to="/historical-map"
            className="flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-museum-muted transition-colors hover:text-museum-gold-light"
          >
            <Compass className="h-4 w-4" /> Bản đồ Lịch sử
          </Link>
        </div>

        <p className="mt-8 font-mono text-[11px] text-museum-muted/70">
          {location.pathname}
        </p>
      </div>
    </section>
  );
};

export default NotFound;
