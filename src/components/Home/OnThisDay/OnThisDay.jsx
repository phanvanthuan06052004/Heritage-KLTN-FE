import { useMemo } from "react";
import { CalendarDays, Clock, Feather, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import MotionReveal from "~/components/common/MotionReveal";
import { useLanguage } from "~/hooks/useLanguage";
import { historicalEvents } from "./onThisDayData";

const eventTranslationsEN = {
  "1-1": {
    title: "Lê Lợi becomes Emperor",
    description:
      "Lê Lợi officially ascended the throne, founding the Later Lê dynasty after ten years of victorious resistance against Ming forces.",
  },
  "1-28": {
    title: "Victory of Ngọc Hồi - Đống Đa",
    description:
      "Emperor Quang Trung defeated Qing forces and liberated the imperial capital of Thăng Long.",
  },
  "2-3": {
    title: "Founding of the Communist Party of Vietnam",
    description:
      "The Communist Party of Vietnam was founded in Hong Kong under the leadership of Nguyễn Ái Quốc.",
  },
  "2-15": {
    title: "Opening of the Ho Chi Minh Trail at sea",
    description:
      "The maritime Ho Chi Minh route was opened to support the southern battlefield.",
  },
  "3-8": {
    title: "First battle involving U.S. troops in Vietnam",
    description:
      "U.S. Marines landed in Đà Nẵng, marking the start of direct American combat involvement in Vietnam.",
  },
  "3-20": {
    title: "Battle of Như Nguyệt",
    description:
      "Lý Thường Kiệt defeated Song forces on the Như Nguyệt River, one of Vietnam’s great historical victories.",
  },
  "4-5": {
    title: "Third Bạch Đằng victory",
    description:
      "Trần Hưng Đạo commanded the naval battle that destroyed Yuan forces on the Bạch Đằng River.",
  },
  "4-30": {
    title: "Liberation of the South and national reunification",
    description:
      "Liberation forces entered Independence Palace, ending the Vietnam War and reunifying the country.",
  },
  "5-7": {
    title: "Victory at Điện Biên Phủ",
    description:
      "Vietnamese forces defeated the French at Điện Biên Phủ, ending nine years of resistance against France.",
  },
  "5-19": {
    title: "Birth of President Hồ Chí Minh",
    description:
      "Hồ Chí Minh, the great leader of the Vietnamese people, was born in Sen Village, Nam Đàn, Nghệ An.",
  },
  "6-16": {
    title: "Founding of the Vietnamese Nationalist Party",
    description:
      "The Vietnamese Nationalist Party was founded under the leadership of Nguyễn Thái Học.",
  },
  "6-28": {
    title: "Outbreak of the Cần Vương movement",
    description:
      "Tôn Thất Thuyết supported Emperor Hàm Nghi and launched the Cần Vương movement against French rule.",
  },
  "7-17": {
    title: "Hồ Chí Minh’s appeal against the U.S. war",
    description:
      "President Hồ Chí Minh issued a national call for resistance against the U.S. war.",
  },
  "7-25": {
    title: "Gulf of Tonkin incident",
    description:
      "Events in the Gulf of Tonkin led the United States to expand the war into North Vietnam.",
  },
  "8-19": {
    title: "Success of the August Revolution",
    description:
      "The people of Hà Nội seized power, opening nationwide victory for the August Revolution.",
  },
  "8-28": {
    title: "Nguyễn Tất Thành leaves to seek a path for national liberation",
    description:
      "Nguyễn Tất Thành, later Hồ Chí Minh, left Sài Gòn aboard the Amiral Latouche Tréville.",
  },
  "9-2": {
    title: "Hồ Chí Minh reads the Declaration of Independence",
    description:
      "At Ba Đình Square, Hồ Chí Minh proclaimed the birth of the Democratic Republic of Vietnam.",
  },
  "9-16": {
    title: "Laos National Day connection",
    description:
      "Vietnam and Laos established close diplomatic ties through their shared struggle for independence.",
  },
  "10-10": {
    title: "Liberation of Hanoi",
    description:
      "The People’s Army of Vietnam took over Hanoi after nine years of resistance against French colonial rule.",
  },
  "10-15": {
    title: "Opening of the Ho Chi Minh Trail",
    description:
      "The strategic North-South supply route officially opened through the Trường Sơn range.",
  },
  "11-1": {
    title: "Coup against Ngô Đình Diệm",
    description:
      "The Ngô Đình Diệm government was overthrown, opening a turbulent political period in South Vietnam.",
  },
  "11-20": {
    title: "First Battle of Hanoi",
    description:
      "The people and defenders of Hanoi resisted French invasion; Nguyễn Tri Phương died heroically.",
  },
  "12-19": {
    title: "Nationwide resistance against France",
    description:
      "President Hồ Chí Minh issued the national call for resistance, beginning the nine-year war against France.",
  },
  "12-25": {
    title: "Beginning of the Tết Offensive campaign",
    description:
      "The General Offensive and Uprising of Tết Mậu Thân began across South Vietnam.",
  },
};

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
  const { t } = useTranslation();
  const { language } = useLanguage();
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  const match = useMemo(() => {
    const exact = historicalEvents.find(
      (event) => event.month === currentMonth && event.day === currentDay,
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
  const translation = eventTranslationsEN[`${event.month}-${event.day}`];
  const eventTitle = language === "en" && translation ? translation.title : event.title;
  const eventDescription =
    language === "en" && translation ? translation.description : event.description;

  return (
    <section className="lcn-container-x py-8 sm:py-12">
      <MotionReveal>
        <div className="museum-paper group relative overflow-hidden rounded-[2rem] p-6 shadow-museum-gold sm:p-8">
          <div className="museum-pattern absolute inset-0 opacity-[0.10]" />
          <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-museum-gold/25 blur-2xl transition group-hover:scale-125" />
          <div className="relative grid gap-7 lg:grid-cols-[220px_1fr_auto] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-museum-black px-4 py-2 text-xs font-semibold uppercase text-museum-gold-light">
                <CalendarDays className="h-4 w-4" />
                {t("home.onThisDay.label")}
              </span>
              <div className="mt-6 flex items-end gap-3">
                <span className="font-display text-7xl font-semibold leading-none text-museum-seal">
                  {String(event.day).padStart(2, "0")}
                </span>
                <span className="pb-2 text-sm font-semibold uppercase text-museum-terracotta">
                  {t(`home.onThisDay.months.${event.month - 1}`)}
                </span>
              </div>
            </div>

            <div>
              <div className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-museum-jade">
                {match.type === "exact" ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {t("home.onThisDay.exact")}
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4" />
                    {t("home.onThisDay.upcoming")}
                  </>
                )}
              </div>
              <h3 className="font-display text-3xl font-semibold leading-tight text-museum-espresso sm:text-4xl">
                {eventTitle}
              </h3>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-museum-espresso/75 sm:text-base">
                {eventDescription}
              </p>
              {match.type === "upcoming" && match.daysUntil > 0 && (
                <p className="mt-5 text-xs font-semibold uppercase text-museum-terracotta">
                  {t("home.onThisDay.daysUntil", { count: match.daysUntil })}
                </p>
              )}
            </div>

            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-museum-gold/40 bg-museum-seal text-museum-ivory shadow-lg lg:h-28 lg:w-28">
              <div className="text-center">
                <Feather className="mx-auto h-5 w-5" />
                <div className="mt-1 font-display text-2xl font-semibold">
                  {event.year}
                </div>
              </div>
            </div>
          </div>
        </div>
      </MotionReveal>
    </section>
  );
};

export default OnThisDay;
