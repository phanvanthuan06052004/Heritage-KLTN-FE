import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/utils";

const NavLinks = ({ navLinks }) => {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <nav
      className="hidden lg:flex shrink-0 items-center gap-0.5"
      aria-label="Main navigation"
    >
      {navLinks.map((link) => {
        const isActive = location.pathname === link.to;
        return (
          <Link
            key={link.to}
            to={link.to}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={cn(
              "group relative flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2 text-[0.9rem] font-medium leading-none transition-all duration-300 xl:gap-2 xl:px-3.5",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-museum-gold-light",
              isActive
                ? "bg-museum-gold/18 text-museum-gold-light shadow-[inset_0_0_0_1px_rgba(216,162,74,0.26)]"
                : "text-museum-ivory/85 hover:bg-museum-ivory/10 hover:text-museum-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-museum-gold-light",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="hidden xl:inline-flex">{link.icon()}</span>
            {t(link.nameKey)}
          </Link>
        );
      })}
    </nav>
  );
};

export default NavLinks;
