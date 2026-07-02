import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Heart, Settings, LogOut } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { selectCurrentUser } from "~/store/slices/authSlice";

import { Button } from "~/components/common/ui/Button";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "~/components/common/ui/Avatar";
import { logOut } from "~/store/slices/authSlice";
import { cn } from "~/lib/utils";

const UserMenu = ({ userMenuLinks }) => {
  const { t } = useTranslation();
  const currentUser = useSelector(selectCurrentUser);
  const isAdmin = currentUser?.role === "admin";

  const [isOpen, setIsOpen] = useState(false);
  const dropDownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    try {
      dispatch(logOut());
      toast.success(t("auth.logoutSuccess"));
      navigate("/");
      setIsOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error(t("common.error"));
    }
  }, [dispatch, navigate, t]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (dropDownRef.current && !dropDownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  return (
    <div className="flex items-center gap-1">
      {/* Favorites */}
      <Link to="/favorites">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full border border-museum-gold/20 bg-museum-ivory/8 text-museum-ivory hover:bg-museum-gold/10 hover:text-museum-gold-light focus-visible:outline-museum-gold-light"
          aria-label="Favorites"
        >
          <Heart size={18} />
        </Button>
      </Link>

      {/* User dropdown */}
      <div className="relative" ref={dropDownRef}>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="ghost"
          size="icon"
          className="hover:bg-transparent rounded-full"
          aria-label="User menu"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <Avatar className="w-8 h-8">
            {currentUser?.avatar ? (
              <AvatarImage
                src={currentUser.avatar}
                alt={currentUser.displayname}
              />
            ) : null}
            <AvatarFallback className="bg-heritage text-white text-xs">
              {currentUser?.displayname?.slice(0, 2).toUpperCase() || "UN"}
            </AvatarFallback>
          </Avatar>
        </Button>

        {isOpen && (
          <div
            className={cn(
              "absolute right-0 mt-2 w-56 border border-border rounded-xl shadow-lg bg-card z-50",
              "animate-scale-in",
            )}
            role="menu"
          >
            {/* User info header */}
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-medium truncate text-foreground">
                {currentUser?.displayname}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {currentUser?.account?.email}
              </p>
              {isAdmin && (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-heritage-light text-heritage-dark font-medium">
                  {t("nav.admin")}
                </span>
              )}
            </div>

            {/* Menu items */}
            <div className="p-1.5">
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  role="menuitem"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-heritage hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Settings size={18} />
                  <span>{t("nav.admin")}</span>
                </Link>
              )}
              {userMenuLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  role="menuitem"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {item.icon()}
                  <span>{t(item.nameKey)}</span>
                </Link>
              ))}
            </div>

            {/* Logout */}
            <div className="border-t border-border p-1.5">
              <button
                onClick={handleLogout}
                role="menuitem"
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut size={18} />
                <span>{t("nav.logout")}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMenu;
