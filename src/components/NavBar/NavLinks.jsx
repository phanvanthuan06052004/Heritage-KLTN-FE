import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/utils";

const NavLinks = ({ navLinks }) => {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <nav
      className="hidden sm:flex items-center gap-1"
      aria-label="Main navigation"
    >
      {navLinks.map((link) => {
        const isActive = location.pathname === link.to;
        return (
          <Link
            key={link.to}
            to={link.to}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              isActive
                ? "text-heritage bg-heritage-light/50"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
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
