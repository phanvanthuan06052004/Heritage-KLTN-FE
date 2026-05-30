import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { logOut, selectCurrentUser } from "~/store/slices/authSlice";
import { Button } from "~/components/common/ui/Button";
import {
  Menu,
  LogOut,
  Users,
  BookOpen,
  Brain,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Home,
  Shield,
  Database,
  Moon,
  Sun,
} from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "~/lib/utils";
import { useAdminTheme } from "~/hooks/useAdminTheme";

const AI_MANAGEMENT_URL = "http://0.0.0.0:3119/";

const AdminLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userInfo = useSelector(selectCurrentUser);
  const isAuthenticated = !!userInfo;
  const location = useLocation();
  const { isDark, toggleTheme } = useAdminTheme();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const handleLogout = () => {
    try {
      dispatch(logOut());
      toast.success("Logged out successfully!");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again!");
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navItems = [
    { name: "User Management", path: "/admin/users", icon: Users },
    { name: "Heritage Management", path: "/admin/heritages", icon: Shield },
    { name: "Knowledge Test", path: "/admin/knowledge-tests", icon: BookOpen },
    { name: "Knowledge Base", path: "/admin/knowledge-base", icon: Database },
    { name: "AI Management", href: AI_MANAGEMENT_URL, icon: Brain, external: true },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  const isActiveRoute = (path) =>
    path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(path);

  const sectionTitle = (() => {
    const match = navItems.find(
      (it) => it.path && (location.pathname === it.path || location.pathname.startsWith(it.path + "/")),
    );
    return match?.name || "Dashboard";
  })();

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-border bg-card transition-[width] duration-300 ease-in-out",
          isSidebarOpen ? "w-64" : "w-16",
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between h-16 px-3 border-b border-border shrink-0">
          {isSidebarOpen ? (
            <Link to="/admin" className="flex items-center gap-2.5 group">
              <img
                src="/images/logo-mark.png"
                alt="Heritage"
                className="h-11 w-9 object-contain transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold tracking-[0.14em] text-foreground">
                  HERITAGE
                </span>
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Admin Console
                </span>
              </div>
            </Link>
          ) : (
            <Link
              to="/admin"
              className="grid place-items-center w-10 h-10"
            >
              <img src="/images/logo-mark.png" alt="Heritage" className="h-10 w-9 object-contain" />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="shrink-0 h-8 w-8"
          >
            {isSidebarOpen ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-custom">
          {isSidebarOpen && (
            <p className="px-2 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Workspace
            </p>
          )}

          <Link
            to="/"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              "text-muted-foreground hover:bg-accent/15 hover:text-foreground",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              !isSidebarOpen && "justify-center px-3",
            )}
            title={!isSidebarOpen ? "Go to client site" : undefined}
          >
            <Home className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span>Client Site</span>}
          </Link>

          {isSidebarOpen && (
            <p className="px-2 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Manage
            </p>
          )}

          {navItems.map((item) => {
            const active = item.path && isActiveRoute(item.path);
            const base = cn(
              "group flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              !isSidebarOpen && "justify-center px-3",
            );
            const inactive = "text-muted-foreground hover:bg-accent/15 hover:text-foreground";
            const activeCls =
              "bg-heritage/15 text-heritage-dark dark:text-heritage-dark border border-heritage/30 shadow-sm";
            const externalCls =
              "border border-heritage/25 bg-heritage/5 text-heritage hover:bg-heritage/10";

            if (item.external) {
              return (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(base, externalCls)}
                  title={!isSidebarOpen ? item.name : undefined}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {isSidebarOpen && (
                    <>
                      <span className="flex-1 text-left">{item.name}</span>
                      <ExternalLink className="w-4 h-4 shrink-0 opacity-70" />
                    </>
                  )}
                </a>
              );
            }

            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={cn(base, active ? activeCls : inactive)}
                title={!isSidebarOpen ? item.name : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {isSidebarOpen && <span className="flex-1 text-left">{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* User card / Logout */}
        <div className="p-3 border-t border-border shrink-0 space-y-2">
          {isSidebarOpen ? (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/40">
              {userInfo?.avatar ? (
                <img
                  src={userInfo.avatar}
                  alt={userInfo.displayname}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-border"
                />
              ) : (
                <span className="w-9 h-9 rounded-full bg-heritage text-white flex items-center justify-center text-sm font-semibold ring-2 ring-border">
                  {userInfo?.displayname?.slice(0, 2).toUpperCase() || "AD"}
                </span>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {userInfo?.displayname || "Admin"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {userInfo?.email || userInfo?.account?.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              className="w-full p-2.5 text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
              size="icon"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-card/80 backdrop-blur border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="lg:hidden"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Admin
              </span>
              <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">
                {sectionTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              title={isDark ? "Light mode" : "Dark mode"}
              className="relative"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </Button>
            <Link to="/">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Client</span>
              </Button>
            </Link>
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border ml-1">
              <span className="text-sm text-muted-foreground">
                {userInfo?.displayname || "Admin"}
              </span>
              {userInfo?.avatar ? (
                <img
                  src={userInfo.avatar}
                  alt={userInfo.displayname}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-border"
                />
              ) : (
                <span className="w-9 h-9 rounded-full bg-heritage text-white flex items-center justify-center text-sm font-medium ring-2 ring-border">
                  {userInfo?.displayname?.slice(0, 2).toUpperCase() || "AD"}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
