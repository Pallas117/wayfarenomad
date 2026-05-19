import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

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

createRoot(document.getElementById("root")!).render(<App />);
