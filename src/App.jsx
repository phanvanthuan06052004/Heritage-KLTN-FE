import React, { Suspense, lazy } from "react";
import AppRoutes from "./routes";
import ToastProvider from "./components/ToastProvider/ToastProvider";
import { useFavoriteInitializer } from "./hooks/useFavoriteInitializer";
import { LoadingScreen } from "./components/common/LoadingScreen";
import { ErrorBoundary } from "./components/ErrorBoundary";

const GlobalChatbot = lazy(() => import("./components/GlobalChatbot/GlobalChatbot"));

const App = () => {
  useFavoriteInitializer();

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <AppRoutes />
        <ToastProvider />
        <Suspense fallback={null}>
          <GlobalChatbot />
        </Suspense>
      </Suspense>
    </ErrorBoundary>
  );
};

export { App };
