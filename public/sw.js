// public/sw.js
/* global self */
// Basic service worker to show push notifications.
// Register from client with navigator.serviceWorker.register('/sw.js')

self.addEventListener('push', (event) => {
  try {
    const data = event.data ? event.data.json() : {};
    const title = data.title || "HayvanDostum";
    const body = data.body || "Yeni bir bildirim var.";
    const icon = "/logo.svg";

    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon,
        badge: icon,
        data: data,
      })
    );
  } catch (e) {
    // Fallback if payload is not JSON
    event.waitUntil(
      self.registration.showNotification("HayvanDostum", {
        body: "Bildirim",
        icon: "/logo.svg",
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || "/dashboard";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});