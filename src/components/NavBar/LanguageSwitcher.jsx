import { useState, useEffect, useRef } from "react";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/utils";

const LANGS = [
  { code: "vi", label: "Tiếng Việt", icon: "https://flagcdn.com/vn.svg" },
  { code: "en", label: "English", icon: "https://flagcdn.com/us.svg" },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState(i18n.language || "vi");
  const dropdownRef = useRef(null);

  const changeLang = (code) => {
    setLang(code);
    localStorage.setItem("lang", code);
    i18n.changeLanguage(code);
    setOpen(false);
    window.dispatchEvent(
      new CustomEvent("languageChanged", { detail: { language: code } }),
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200",
          "bg-background border-input hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        )}
        aria-label="Change language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe className="w-4 h-4" />
        <img
          src={LANGS.find((l) => l.code === lang)?.icon}
          width={20}
          height={20}
          className="rounded-sm"
          alt={lang === "vi" ? "Vietnamese" : "English"}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-44 bg-card border border-border shadow-lg rounded-xl p-1.5 z-50 animate-slide-down"
          role="listbox"
          aria-label="Select language"
        >
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => changeLang(l.code)}
              role="option"
              aria-selected={lang === l.code}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                lang === l.code
                  ? "bg-heritage-light text-heritage-dark font-medium"
                  : "text-foreground",
              )}
            >
              <img
                src={l.icon}
                width={22}
                height={22}
                className="rounded-sm shrink-0"
                alt=""
              />
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
