import i18n from "~/i18n/config";

export const fmtDur = (s = 0) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}h${pad(m)}` : `${m}:${pad(sec)}`;
};

export const fmtKm = (m = 0) => (m / 1000).toFixed(2);

export const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString(i18n.language === "en" ? "en-GB" : "vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

export const timeAgo = (d) => {
  if (!d) return "";
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60) return i18n.t("trip.timeJustNow");
  if (diff < 3600) return i18n.t("trip.timeMinutesAgo", { count: Math.floor(diff / 60) });
  if (diff < 86400) return i18n.t("trip.timeHoursAgo", { count: Math.floor(diff / 3600) });
  if (diff < 604800) return i18n.t("trip.timeDaysAgo", { count: Math.floor(diff / 86400) });
  return fmtDate(d);
};
