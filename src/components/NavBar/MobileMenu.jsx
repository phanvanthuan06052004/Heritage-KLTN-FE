import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, UserPlus, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { cn } from "~/lib/utils";
import { Button } from "~/components/common/ui/Button";
import { logOut, selectCurrentUser } from "~/store/slices/authSlice";

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
      className="fixed inset-0 z-40 bg-background/98 backdrop-blur-sm sm:hidden pt-navbar-mobile animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation menu"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground"
        aria-label="Close menu"
      >
        <X className="w-6 h-6" />
      </button>

      <nav className="container px-4 py-8 flex flex-col space-y-6">
        {/* Navigation links */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Navigation
          </p>
          {navLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-colors text-sm",
                location.pathname === item.to
                  ? "bg-heritage-light text-heritage-dark font-medium"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {item.icon()}
              <span>{t(item.nameKey)}</span>
            </Link>
          ))}
        </div>

        {/* Auth section */}
        <div className="border-t border-border pt-6">
          {isAuthenticated ? (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                Account
              </p>
              {userMenuLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-colors text-sm",
                    location.pathname === item.to
                      ? "bg-heritage-light text-heritage-dark font-medium"
                      : "text-foreground hover:bg-accent",
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
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1">
                Account
              </p>
              <Link to="/login" onClick={onClose}>
                <Button variant="outline" className="w-full justify-start">
                  <LogIn className="h-5 w-5 mr-3" />
                  <span>{t("nav.login")}</span>
                </Button>
              </Link>
              <Link to="/register" onClick={onClose}>
                <Button className="w-full justify-start">
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
