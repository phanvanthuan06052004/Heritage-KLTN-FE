import { Route, Routes, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "~/store/slices/authSlice";
import MainLayout from "~/layout/MainLayout";
import { LoadingScreen } from "~/components/common/LoadingScreen";
import { ErrorBoundary } from "~/components/ErrorBoundary";
import publicRoutes from "./publicRoutes";
import privateRoutes from "./privateRoutes";

// Lazy load public pages
const Home = lazy(() => import("~/pages/Home"));
const About = lazy(() => import("~/pages/About/About"));
const ChatHeritagePage = lazy(
  () => import("~/pages/ChatHeritagePage/ChatHeritagePage"),
);
const EmailVerification = lazy(() => import("~/pages/EmailVerification"));
const Favorites = lazy(() => import("~/pages/Favorites"));
const MapExplorer = lazy(
  () => import("~/pages/GoogleMapHeritage/MapExplorer"),
);
const HeritageDetail = lazy(
  () => import("~/pages/HeritageDetail/HeritageDetail"),
);
const HistoricalMap = lazy(
  () => import("~/pages/HistoricalMap/HistoricalMap"),
);
const HeritagePassport = lazy(
  () => import("~/pages/HeritagePassport/HeritagePassport"),
);
const TripRecorder = lazy(() => import("~/pages/Trip/TripRecorder"));
const TripDetail = lazy(() => import("~/pages/Trip/TripDetail"));
const JourneysFeed = lazy(() => import("~/pages/Trip/JourneysFeed"));
const Heritages = lazy(() => import("~/pages/Heritages"));
const Login = lazy(() => import("~/pages/Login"));
const Profile = lazy(() => import("~/pages/Profile"));
const Register = lazy(() => import("~/pages/Register"));
const NotFound = lazy(() => import("~/pages/NotFound"));
const ForgotPassword = lazy(() => import("~/pages/ForgotPassword"));
const GoogleCallbackPage = lazy(
  () => import("~/pages/GoogleCallback/GoogleCallbackPage"),
);
const McpPolicy = lazy(() => import("~/pages/Privacy/McpPolicy"));

// Map route paths to lazy-loaded components
const routeComponents = {
  "/": <Home />,
  "/about": <About />,
  "/heritages": <Heritages />,
  "/heritage/:nameSlug": <HeritageDetail />,
  "/login": <Login />,
  "/register": <Register />,
  "/authen-confirm": <EmailVerification />,
  "/chat/heritage/:nameSlug": <ChatHeritagePage />,
  "/profile": <Profile />,
  "/favorites": <Favorites />,
  "/explore": <MapExplorer />,
  "/historical-map": <HistoricalMap />,
  "/passport": <HeritagePassport />,
  "/passport/track": <TripRecorder />,
  "/trips/:id": <TripDetail />,
  "/journeys": <JourneysFeed />,
  "/forgot-password": <ForgotPassword />,
  "/privacy/mcp-policy": <McpPolicy />,
};

/**
 * Route guard for restricted pages (login, register, etc.)
 * Redirects authenticated users away from auth pages
 */
const PublicRoutes = ({ children, restricted }) => {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";

  if (isAuthenticated && restricted) {
    return <Navigate to={isAdmin ? "/admin" : "/"} replace />;
  }
  return children;
};

/**
 * Route guard for user-only pages (profile, favorites)
 */
const UserPrivateRoutes = ({ children }) => {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = !!user;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

/**
 * Route guard for admin-only pages
 */
const PrivateRoutes = ({ children }) => {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
};

/**
 * Suspense wrapper for lazy-loaded components
 */
const SuspenseWrapper = ({ children }) => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
  </ErrorBoundary>
);

const AppRoutes = () => {
  return (
    <>
      {/* <ScrollToTop /> */}
      <Routes>
        {/* Public Routes with MainLayout */}
        <Route path="/" element={<MainLayout />}>
          {publicRoutes.map(({ path, restricted }) => (
            <Route
              key={path}
              path={path}
              element={
                <SuspenseWrapper>
                  {path === "/profile" ||
                  path === "/favorites" ||
                  path === "/passport/track" ||
                  path === "/chat/heritage/:nameSlug" ? (
                    <UserPrivateRoutes>
                      {routeComponents[path] || <NotFound />}
                    </UserPrivateRoutes>
                  ) : (
                    <PublicRoutes restricted={restricted}>
                      {routeComponents[path] || <NotFound />}
                    </PublicRoutes>
                  )}
                </SuspenseWrapper>
              }
            />
          ))}
          {/* Catch-all 404 */}
          <Route
            path="*"
            element={
              <SuspenseWrapper>
                <NotFound />
              </SuspenseWrapper>
            }
          />
        </Route>

        {/* Google OAuth callback — outside MainLayout (no navbar/footer) */}
        <Route
          path="/auth/google/callback"
          element={
            <SuspenseWrapper>
              <GoogleCallbackPage />
            </SuspenseWrapper>
          }
        />

        {/* Private Admin Routes */}
        {privateRoutes.map(({ path, element, children }) => (
          <Route
            key={path}
            path={path}
            element={
              <PrivateRoutes>
                <SuspenseWrapper>{element}</SuspenseWrapper>
              </PrivateRoutes>
            }
          >
            {children &&
              children.map((child) => (
                <Route
                  key={child.path}
                  path={child.path}
                  element={<SuspenseWrapper>{child.element}</SuspenseWrapper>}
                />
              ))}
          </Route>
        ))}
      </Routes>
    </>
  );
};

export default AppRoutes;
