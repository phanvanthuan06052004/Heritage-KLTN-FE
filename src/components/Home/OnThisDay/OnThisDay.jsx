import { useMemo } from "react";
import { CalendarDays, Sparkles, Clock, ArrowRight } from "lucide-react";
import { historicalEvents } from "./onThisDayData";

const monthNamesVI = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

function formatDate(month, day) {
  return `${monthNamesVI[month - 1]}, ngày ${day}`;
}

function getDaysUntilNext(month, day, targetMonth, targetDay) {
  const now = new Date(2026, month - 1, day);
  const target = new Date(2026, targetMonth - 1, targetDay);
  if (target >= now) {
    return Math.round((target - now) / (1000 * 60 * 60 * 24));
  }
  const nextYear = new Date(2027, targetMonth - 1, targetDay);
  return Math.round((nextYear - now) / (1000 * 60 * 60 * 24));
}

const OnThisDay = () => {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  const match = useMemo(() => {
    const exact = historicalEvents.find(
      (e) => e.month === currentMonth && e.day === currentDay,
    );
    if (exact) return { type: "exact", event: exact };

    let closest = null;
    let closestDays = Infinity;
    for (const event of historicalEvents) {
      const days = getDaysUntilNext(
        currentMonth,
        currentDay,
        event.month,
        event.day,
      );
      if (days < closestDays) {
        closestDays = days;
        closest = event;
      }
    }
    return { type: "upcoming", event: closest, daysUntil: closestDays };
  }, [currentMonth, currentDay]);

  if (!match?.event) return null;

  const { event } = match;

  return (
    <div className="lcn-container-x">
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-amber-50/40 dark:to-amber-950/10 shadow-md hover:shadow-xl transition-all duration-500">
        {/* Gold left border accent */}
        <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-gold via-amber-400 to-gold/60" />

        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(ellipse_at_top_right,_hsl(43,74%,49%)_0%,_transparent_70%)]" />

        {/* Top decorative shimmer line */}
        <div className="absolute top-0 left-[5%] right-[5%] h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <div className="relative px-5 sm:px-7 pt-5 pb-6 sm:pt-6 sm:pb-7">
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.6rem] font-bold tracking-[0.15em] uppercase bg-gold/10 text-gold border border-gold/20">
                <CalendarDays size={11} />
                Hôm nay trong lịch sử
              </span>
              {match.type === "exact" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.5rem] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Sparkles size={9} />
                  Đang diễn ra
                </span>
              )}
            </div>

            {/* Year orb */}
            <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-gold/20 to-amber-500/20 flex items-center justify-center border border-gold/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <span className="text-sm sm:text-base font-bold text-gold font-mono">
                {event.year}
              </span>
            </div>
          </div>

          {/* Main content */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
            {/* Date column */}
            <div className="flex-shrink-0 flex sm:flex-col items-center sm:items-start gap-2 sm:gap-0 sm:min-w-[90px]">
              <div className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-gold/70">
                {monthNamesVI[event.month - 1]}
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground leading-none font-mono">
                {String(event.day).padStart(2, "0")}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug mb-2 group-hover:text-gold/90 transition-colors duration-300">
                {event.title}
              </h3>
              <p className="text-sm text-text3/80 leading-relaxed">
                {event.description}
              </p>
            </div>
          </div>

          {/* Footer with upcoming badge */}
          {match.type === "upcoming" && match.daysUntil > 0 && (
            <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-2">
              <Clock size={12} className="text-text3/50" />
              <span className="text-[0.6rem] text-text3/50 uppercase tracking-wider font-medium">
                Sự kiện sắp tới — còn {match.daysUntil} ngày
              </span>
              <ArrowRight size={10} className="text-text3/30" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnThisDay;
