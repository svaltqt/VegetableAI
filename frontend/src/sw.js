import { precacheAndRoute } from 'workbox-precaching';

// Precarga de los assets generados por Vite
precacheAndRoute(self.__WB_MANIFEST || []);

// Escuchar notificaciones Push
self.addEventListener('push', function (event) {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const title = data.title || 'Nueva notificación';
    const options = {
      body: data.body || 'Tienes un nuevo mensaje.',
      icon: '/icons/icon.svg',
      badge: '/icons/icon.svg',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
      }
    };
    
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (error) {
    console.error('Error procesando push notification:', error);
  }
});

// Acción al hacer clic en la notificación
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  
  const urlToOpen = event.notification.data.url;
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Si la app ya está abierta, enfocamos esa pestaña
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no, abrimos una nueva ventana
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
