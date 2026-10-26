self.addEventListener('push', function (event) {
  if (!event.data) return;
  try {
    const payload = event.data.json();
    const options = {
      body: payload.body || 'New notification received.',
      icon: payload.icon || '/pwa-192x192.png',
      badge: '/badge-96.png',
      tag: payload.tag || undefined,
      renotify: Boolean(payload.tag),
      data: { url: payload.url || '/' }
    };
    event.waitUntil(self.registration.showNotification(payload.title || 'Konnect', options));
  } catch (err) {
    console.error('Error handling push event:', err);
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || '/', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (let i = 0; i < list.length; i++) {
        const client = list[i];
        if ('focus' in client) {
          return client.focus().then(function (focused) {
            if (focused && 'navigate' in focused) return focused.navigate(target);
            return focused;
          });
        }
      }
      if (clients.openWindow) return clients.openWindow(target);
    })
  );
});
