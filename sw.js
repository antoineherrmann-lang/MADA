/* ============================================================
   MADA — Service worker
   ------------------------------------------------------------
   ATTENTION : ce service worker ne met VOLONTAIREMENT rien en
   cache, et ne déclare aucun gestionnaire 'fetch'.

   MADA vérifie ses mises à jour en relisant index.html en ligne
   pour comparer le numéro de version. Un service worker qui
   mettrait le HTML en cache figerait l'app sur une version
   périmée, sans moyen simple de s'en sortir.

   Son unique rôle : recevoir les notifications quand l'app est
   fermée, et ouvrir l'app au clic.
   ============================================================ */

// On prend le contrôle immédiatement plutôt que d'attendre la
// fermeture de tous les onglets : sinon une ancienne version du
// service worker resterait active après une mise à jour.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = { title: 'MADA', body: 'C’est l’heure du malgache.', tag: 'mada-rappel' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (e) {
    // Charge utile non JSON : on la prend telle quelle
    try { data.body = event.data.text(); } catch (e2) {}
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './icon-192.jpg',
      badge: './icon-192.jpg',
      tag: data.tag,
      data: { url: data.url || './index.html' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || './index.html';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) if ('focus' in c) return c.focus();
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});
