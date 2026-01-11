// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import FullPageSpinner from "./components/FullPageSpinner.jsx"; // ✅ Spinner UI
import useAuthReady from "./context/useAuthReady"; // ✅ Hook to wait for auth
import "./i18n/i18n";

// ✅ Wrapper component to wait for AuthContext to initialize
const Root = () => {
  const isReady = useAuthReady();
  if (!isReady)
    return <FullPageSpinner message="🔐 Checking authentication..." />;
  return <App />;
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
