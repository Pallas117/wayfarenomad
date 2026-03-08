import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register push notification service worker alongside PWA SW
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw-push.js").catch(() => {
    // Push SW registration failed silently — PWA SW still works
  });
}

createRoot(document.getElementById("root")!).render(<App />);
