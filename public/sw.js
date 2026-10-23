self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  let payload = { title: 'OnlyUs 💗', body: 'Tienes un mensajito de tu persona favorita.', url: '/deseos' }
  try { if (event.data) payload = { ...payload, ...event.data.json() } } catch { if (event.data) payload.body = event.data.text() }
  event.waitUntil(self.registration.showNotification(payload.title || 'OnlyUs 💗', {
    body: payload.body || 'Tienes un mensajito de tu persona favorita.',
    icon: '/onlyus-icon.svg',
    badge: '/onlyus-icon.svg',
    tag: payload.tag || 'onlyus-love',
    data: { url: payload.url || '/deseos' },
    vibrate: [120, 70, 120],
  }))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = new URL(event.notification.data?.url || '/deseos', self.location.origin).href
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    const existing = clients.find((client) => client.url.startsWith(self.location.origin))
    if (existing) { existing.navigate(target); return existing.focus() }
    return self.clients.openWindow(target)
  }))
})
