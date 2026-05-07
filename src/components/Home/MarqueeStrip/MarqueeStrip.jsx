const figures = [
  { name: "Hai Bà Trưng", year: "40 SCN" },
  { name: "Lý Thường Kiệt", year: "1076" },
  { name: "Nguyễn Huệ", year: "1789" },
  { name: "Trần Hưng Đạo", year: "1288" },
  { name: "Lê Lợi", year: "1427" },
  { name: "Võ Nguyên Giáp", year: "1954" },
  { name: "Hồ Chí Minh", year: "1945" },
  { name: "Nguyễn Du", year: "1820" },
  { name: "Phan Đình Phùng", year: "1895" },
  { name: "Trưng Vương", year: "43 SCN" },
  { name: "Bà Triệu", year: "248" },
  { name: "Đinh Tiên Hoàng", year: "968" },
  { name: "Lý Công Uẩn", year: "1010" },
  { name: "Quang Trung", year: "1788" },
  { name: "Ngô Quyền", year: "938" },
  { name: "Mạc Đĩnh Chi", year: "1306" },
  { name: "Nguyễn Trãi", year: "1442" },
  { name: "Phạm Ngũ Lão", year: "1320" },
];

const MarqueeStrip = () => {
  const doubledItems = [...figures, ...figures];

  return (
    <div className="relative w-full border-y border-border/40 bg-gradient-to-r from-card/80 via-card to-card/80 py-3 overflow-hidden">
      {/* Edge fade overlays */}
      <div className="absolute inset-y-0 left-0 w-16 sm:w-24 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 sm:w-24 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />

      {/* Decorative top accent line */}
      <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      <div className="absolute bottom-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      <div className="marquee-container w-full overflow-hidden">
        <div className="marquee-track inline-flex items-center will-change-transform">
          {doubledItems.map((fig, idx) => (
            <span
              key={`${fig.name}-${idx}`}
              className="inline-flex items-center gap-2.5 mx-5 sm:mx-8 text-text3/80 select-none"
              style={{
                fontSize: "0.78rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              <span className="font-semibold text-text3/90 transition-colors duration-300 hover:text-gold">
                {fig.name}
              </span>
              <span className="w-1 h-1 rounded-full bg-gold/30" />
              <span className="font-mono text-[0.65rem] text-text3/50 tracking-wider">
                {fig.year}
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
