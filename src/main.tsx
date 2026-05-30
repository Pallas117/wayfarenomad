import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Global runtime logging — surfaces the failing module / import path
// in console even when React swallows the original stack.
window.addEventListener("error", (event) => {
  // eslint-disable-next-line no-console
  console.error("[window.error]", {
    message: event.message,
    source: event.filename,
    line: event.lineno,
    col: event.colno,
    stack: event.error?.stack,
  });
});

window.addEventListener("unhandledrejection", (event) => {
  // eslint-disable-next-line no-console
  console.error("[unhandledrejection]", {
    reason: event.reason,
    stack: (event.reason as { stack?: string } | undefined)?.stack,
  });
});

// Recover from stale chunk references after a new deploy.
// Vite emits this when a dynamic import / preloaded CSS hash no longer exists.
window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  if (!sessionStorage.getItem("vite-preload-reloaded")) {
    sessionStorage.setItem("vite-preload-reloaded", "1");
    window.location.reload();
  }
});

// Register push notification service worker alongside PWA SW
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw-push.js").catch(() => {
    // Push SW registration failed silently — PWA SW still works
  });
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
