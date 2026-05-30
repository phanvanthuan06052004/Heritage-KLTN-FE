import { useMemo } from "react";
import { CalendarDays, Clock, Feather, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import MotionReveal from "~/components/common/MotionReveal";
import { useLanguage } from "~/hooks/useLanguage";
import { historicalEvents } from "./onThisDayData";

const eventTranslationsEN = {
  "1-31": {
    title: "Tết Offensive",
    description:
      "The Tết Offensive spread across South Vietnam, becoming a major turning point in the Vietnam War.",
  },
  "2-3": {
    title: "Founding of the Communist Party of Vietnam",
    description:
      "The Communist Party of Vietnam was founded in Hong Kong under the leadership of Nguyễn Ái Quốc.",
  },
  "3-8": {
    title: "U.S. Marines land in Đà Nẵng",
    description:
      "The first U.S. ground combat units landed in Đà Nẵng, expanding direct American military involvement in Vietnam.",
  },
  "4-9": {
    title: "Victory at Bạch Đằng",
    description:
      "Đại Việt forces under Trần Hưng Đạo defeated the Yuan fleet on the Bạch Đằng River.",
  },
  "4-30": {
    title: "Liberation of the South and national reunification",
    description:
      "Liberation forces entered Independence Palace, ending the Vietnam War and reunifying the country.",
  },
  "5-7": {
    title: "Victory at Điện Biên Phủ",
    description:
      "Vietnamese forces won a decisive victory at Điện Biên Phủ, ending the war against French colonial rule.",
  },
  "5-19": {
    title: "Birth of President Hồ Chí Minh",
    description:
      "Nguyễn Sinh Cung, later President Hồ Chí Minh, was born in Sen Village, Nam Đàn, Nghệ An.",
  },
  "6-5": {
    title: "Nguyễn Tất Thành leaves to seek national salvation",
    description:
      "Nguyễn Tất Thành left Nhà Rồng Wharf aboard the Amiral Latouche Tréville to begin his journey abroad.",
  },
  "6-21": {
    title: "First issue of Thanh Niên newspaper",
    description:
      "Thanh Niên, the newspaper of the Vietnamese Revolutionary Youth League founded by Nguyễn Ái Quốc, published its first issue in Guangzhou.",
  },
  "7-13": {
    title: "Emperor Hàm Nghi issues the Cần Vương edict",
    description:
      "At Tân Sở, Emperor Hàm Nghi issued the Cần Vương edict calling on the people to resist French colonial rule.",
  },
  "7-17": {
    title: "Hồ Chí Minh’s appeal against the U.S. war",
    description:
      "President Hồ Chí Minh issued a national call for resistance against the U.S. war.",
  },
  "8-2": {
    title: "Gulf of Tonkin incident",
    description:
      "The USS Maddox reported an attack in the Gulf of Tonkin, an event that led the United States to expand the war in Vietnam.",
  },
  "8-19": {
    title: "Success of the August Revolution in Hanoi",
    description:
      "The people of Hà Nội seized power, helping open the nationwide victory of the August Revolution.",
  },
  "9-2": {
    title: "Hồ Chí Minh reads the Declaration of Independence",
    description:
      "At Ba Đình Square, Hồ Chí Minh proclaimed the birth of the Democratic Republic of Vietnam.",
  },
  "10-10": {
    title: "Liberation of Hanoi",
    description:
      "The People’s Army of Vietnam took over Hanoi after the Geneva Accords, marking the capital's liberation day.",
  },
  "11-1": {
    title: "Coup against Ngô Đình Diệm",
    description:
      "The coup in Saigon overthrew the Ngô Đình Diệm government, opening a turbulent political period in South Vietnam.",
  },
  "11-20": {
    title: "First Battle of Hanoi",
    description:
      "French forces attacked Hanoi; Governor Nguyễn Tri Phương was seriously wounded and later died.",
  },
  "12-19": {
    title: "Nationwide resistance against France",
    description:
      "President Hồ Chí Minh issued the national call for resistance, beginning the war against French colonial rule.",
  },
  "12-25": {
    title: "Founding of the Vietnamese Nationalist Party",
    description:
      "The Vietnamese Nationalist Party was founded in Hanoi under the early leadership of Nguyễn Thái Học.",
  },
};

function getDaysUntilNext(year, month, day, targetMonth, targetDay) {
  const now = new Date(year, month - 1, day);
  const target = new Date(year, targetMonth - 1, targetDay);
  if (target >= now) {
    return Math.round((target - now) / (1000 * 60 * 60 * 24));
  }
  const nextYear = new Date(year + 1, targetMonth - 1, targetDay);
  return Math.round((nextYear - now) / (1000 * 60 * 60 * 24));
}

const OnThisDay = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const today = new Date();
  const currentYear = today.getFullYear();
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
        currentYear,
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
  }, [currentYear, currentMonth, currentDay]);

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
