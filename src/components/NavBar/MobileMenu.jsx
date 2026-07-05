import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, UserPlus, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { cn } from "~/lib/utils";
import { Button } from "~/components/common/ui/Button";
import { logOut, selectCurrentUser } from "~/store/slices/authSlice";
import SearchBar from "./SearchBar";

const MobileMenu = ({ isOpen, navLinks, userMenuLinks, onClose }) => {
  const location = useLocation();
  const userInfo = useSelector(selectCurrentUser);
  const isAuthenticated = !!userInfo;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleLogout = () => {
    try {
      dispatch(logOut());
      toast.success(t("auth.logoutSuccess"));
      navigate("/");
      onClose();
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error(t("common.error"));
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 overflow-y-auto bg-gradient-to-b from-museum-black/98 to-museum-charcoal/98 text-museum-ivory backdrop-blur-2xl lg:hidden pt-navbar-mobile animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation menu"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 rounded-full border border-museum-gold/20 bg-museum-ivory/8 p-2 text-museum-muted hover:text-museum-gold-light"
        aria-label="Close menu"
      >
        <X className="w-6 h-6" />
      </button>

      <nav className="container px-4 py-8 flex flex-col space-y-7">
        <div className="rounded-3xl border border-museum-gold/15 bg-museum-ivory/5 p-4">
          <p className="mb-3 text-xs font-semibold uppercase text-museum-gold-light">
            Tìm kiếm nhanh
          </p>
          <SearchBar />
        </div>

        {/* Navigation links */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-museum-muted uppercase tracking-wider px-3 mb-2">
            Navigation
          </p>
          {navLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 p-3 rounded-2xl transition-colors text-sm",
                location.pathname === item.to
                  ? "bg-museum-gold/15 text-museum-gold-light font-medium"
                  : "text-museum-ivory hover:bg-museum-ivory/8 hover:text-museum-gold-light",
              )}
            >
              {item.icon()}
              <span>{t(item.nameKey)}</span>
            </Link>
          ))}
        </div>

        {/* Auth section */}
        <div className="border-t border-museum-gold/15 pt-6">
          {isAuthenticated ? (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-museum-muted uppercase tracking-wider px-3 mb-2">
                Account
              </p>
              {userMenuLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-2xl transition-colors text-sm",
                    location.pathname === item.to
                      ? "bg-museum-gold/15 text-museum-gold-light font-medium"
                      : "text-museum-ivory hover:bg-museum-ivory/8",
                  )}
                >
                  {item.icon()}
                  <span>{t(item.nameKey)}</span>
                </Link>
              ))}
              <div className="pt-4">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleLogout}
                >
                  {t("nav.logout")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-3">
              <p className="text-xs font-semibold text-museum-muted uppercase tracking-wider px-3 mb-1">
                Account
              </p>
              <Link to="/login" onClick={onClose}>
                <Button variant="outline" className="w-full justify-start rounded-full border-museum-gold/25 bg-transparent text-museum-ivory hover:bg-museum-ivory/10">
                  <LogIn className="h-5 w-5 mr-3" />
                  <span>{t("nav.login")}</span>
                </Button>
              </Link>
              <Link to="/register" onClick={onClose}>
                <Button className="w-full justify-start rounded-full bg-museum-gold text-museum-black hover:bg-museum-gold-light">
                  <UserPlus className="h-5 w-5 mr-3" />
                  <span>{t("nav.register")}</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default MobileMenu;
