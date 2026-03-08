// Push notification handler for Wayfare
// This runs alongside the vite-plugin-pwa service worker

self.addEventListener("push", (event) => {
  const fallback = { title: "New Message", body: "You have a new encrypted message", icon: "/pwa-192.png" };
  let data = fallback;
  
  try {
    if (event.data) {
      data = { ...fallback, ...event.data.json() };
    }
  } catch {
    // use fallback
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || "/pwa-192.png",
      badge: "/pwa-192.png",
      tag: data.tag || "nomad-message",
      data: { url: data.url || "/messages" },
      vibrate: [100, 50, 100],
      actions: [
        { action: "open", title: "Open" },
        { action: "dismiss", title: "Dismiss" },
      ],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "/messages";
  
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
