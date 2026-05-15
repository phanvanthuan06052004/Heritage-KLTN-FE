import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/utils";

const NavLinks = ({ navLinks }) => {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <nav
      className="hidden lg:flex items-center gap-1"
      aria-label="Main navigation"
    >
      {navLinks.map((link) => {
        const isActive = location.pathname === link.to;
        return (
          <Link
            key={link.to}
            to={link.to}
            className={cn(
              "group relative flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-300",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-museum-gold-light",
              isActive
                ? "bg-museum-gold/15 text-museum-gold-light shadow-[inset_0_0_0_1px_rgba(216,162,74,0.26)]"
                : "text-museum-muted hover:bg-museum-ivory/8 hover:text-museum-ivory",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {link.icon()}
            {t(link.nameKey)}
          </Link>
        );
      })}
    </nav>
  );
};

export default NavLinks;
