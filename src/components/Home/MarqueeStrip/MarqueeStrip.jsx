import { useLanguage } from "~/hooks/useLanguage";

const figures = [
  { name: "Hai Bà Trưng", year: "40 SCN", yearEn: "40 CE" },
  { name: "Lý Thường Kiệt", year: "1076" },
  { name: "Nguyễn Huệ", year: "1789" },
  { name: "Trần Hưng Đạo", year: "1288" },
  { name: "Lê Lợi", year: "1427" },
  { name: "Võ Nguyên Giáp", year: "1954" },
  { name: "Hồ Chí Minh", year: "1945" },
  { name: "Nguyễn Du", year: "1820" },
  { name: "Phan Đình Phùng", year: "1895" },
  { name: "Trưng Vương", year: "43 SCN", yearEn: "43 CE" },
  { name: "Bà Triệu", year: "248" },
  { name: "Đinh Tiên Hoàng", year: "968" },
  { name: "Lý Công Uẩn", year: "1010" },
  { name: "Quang Trung", year: "1788" },
  { name: "Ngô Quyền", year: "938" },
  { name: "Mạc Đĩnh Chi", year: "1304" },
  { name: "Nguyễn Trãi", year: "1442" },
  { name: "Phạm Ngũ Lão", year: "1320" },
];

const MarqueeStrip = () => {
  const { language } = useLanguage();
  const doubledItems = [...figures, ...figures];

  return (
    <div className="relative w-full overflow-hidden border-y border-museum-gold/15 bg-museum-black/55 py-4">
      {/* Edge fade overlays */}
      <div className="absolute inset-y-0 left-0 w-16 sm:w-24 z-10 bg-gradient-to-r from-museum-black to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 sm:w-24 z-10 bg-gradient-to-l from-museum-black to-transparent pointer-events-none" />

      {/* Decorative top accent line */}
      <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-museum-gold/35 to-transparent" />
      <div className="absolute bottom-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-museum-gold/35 to-transparent" />

      <div className="marquee-container w-full overflow-hidden">
        <div className="marquee-track inline-flex items-center will-change-transform">
          {doubledItems.map((fig, idx) => (
            <span
              key={`${fig.name}-${idx}`}
              className="inline-flex items-center gap-2.5 mx-5 sm:mx-8 text-museum-muted select-none"
              style={{
                fontSize: "0.78rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              <span className="font-semibold text-museum-ivory/80 transition-colors duration-300 hover:text-museum-gold-light">
                {fig.name}
              </span>
              <span className="w-1 h-1 rounded-full bg-museum-gold/50" />
              <span className="font-mono text-[0.65rem] text-museum-gold/70 tracking-wider">
                {language === "en" && fig.yearEn ? fig.yearEn : fig.year}
              </span>
            </span>
          ))}
        </div>
      </div>

      <style>{`
        .marquee-container {
          mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 1%,
            black 99%,
            transparent 100%
          );
          -webkit-mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 1%,
            black 99%,
            transparent 100%
          );
        }

        .marquee-track {
          animation: marquee 80s linear infinite;
        }

        .marquee-container:hover .marquee-track {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default MarqueeStrip;
