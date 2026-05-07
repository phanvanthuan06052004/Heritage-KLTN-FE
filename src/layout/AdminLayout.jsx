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
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
  Shield,
} from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "~/lib/utils";

const AdminLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userInfo = useSelector(selectCurrentUser);
  const isAuthenticated = !!userInfo;
  const location = useLocation();

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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navItems = [
    {
      name: "User Management",
      path: "/admin/users",
      icon: Users,
    },
    {
      name: "Heritage Management",
      path: "/admin/heritages",
      icon: Shield,
    },
    {
      name: "Knowledge Test",
      path: "/admin/knowledge-tests",
      icon: BookOpen,
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: Settings,
    },
  ];

  const isActiveRoute = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-border bg-card transition-all duration-300",
          isSidebarOpen ? "w-64" : "w-16",
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border shrink-0">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-heritage" />
              <h2 className="text-lg font-semibold text-foreground">
                Admin Panel
              </h2>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="shrink-0"
          >
            {isSidebarOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              isActiveRoute("/")
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground",
              !isSidebarOpen && "justify-center",
            )}
          >
            <Home className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span>Home</span>}
          </Link>

          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                isActiveRoute(item.path)
                  ? "bg-heritage-light text-heritage-dark"
                  : "text-muted-foreground",
                !isSidebarOpen && "justify-center px-3",
              )}
              title={!isSidebarOpen ? item.name : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {isSidebarOpen && <span>{item.name}</span>}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div
          className={cn(
            "p-3 border-t border-border shrink-0",
            !isSidebarOpen && "flex justify-center",
          )}
        >
          <Button
            variant="ghost"
            className={cn(
              "text-destructive hover:text-destructive-foreground hover:bg-destructive/10",
              !isSidebarOpen ? "p-2.5" : "w-full justify-start",
            )}
            onClick={handleLogout}
            title={!isSidebarOpen ? "Logout" : undefined}
            size={isSidebarOpen ? "default" : "icon"}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="lg:hidden"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">
              System Administration
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">
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
                  {userInfo?.displayname?.slice(0, 2).toUpperCase() || "UN"}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
