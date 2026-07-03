import React, { Suspense } from "react";
import AppRoutes from "./routes";
import ToastProvider from "./components/ToastProvider/ToastProvider";
import { useFavoriteInitializer } from "./hooks/useFavoriteInitializer";
import { LoadingScreen } from "./components/common/LoadingScreen";
import GlobalChatbot from "./components/GlobalChatbot/GlobalChatbot";
import { ErrorBoundary } from "./components/ErrorBoundary";

const App = () => {
  useFavoriteInitializer();

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <AppRoutes />
        <ToastProvider />
        <GlobalChatbot />
      </Suspense>
    </ErrorBoundary>
  );
};

export { App };
