/* Retiro del worker de la web anterior. No registra rutas ni intercepta pedidos. */
const alcanceRaiz = new URL('/', self.location.origin).href

self.addEventListener('install', (evento) => {
  if (self.registration.scope === alcanceRaiz) {
    evento.waitUntil(self.skipWaiting())
  }
})

self.addEventListener('activate', (evento) => {
  if (self.registration.scope !== alcanceRaiz) return

  evento.waitUntil((async () => {
    // Workbox incluye el scope en sus nombres. Un prefijo solo borraría cachés ajenas.
    const nombres = await caches.keys()
    await Promise.all(nombres
      .filter((nombre) => nombre.startsWith('workbox-') && nombre.endsWith(alcanceRaiz))
      .map((nombre) => caches.delete(nombre)))

    // Reemplaza al controlador viejo antes de navegar; sin fetch, todo vuelve a la red.
    await self.clients.claim()
    await self.registration.unregister()
    const ventanas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    await Promise.allSettled(ventanas.map((ventana) => {
      const anterior = new URL(ventana.url)
      if (anterior.origin !== self.location.origin || ! ['/', '/inicio', '/inicio/'].includes(anterior.pathname)) return
      const destino = new URL('/', anterior.origin)
      destino.search = anterior.search
      destino.hash = anterior.hash
      return ventana.navigate(destino.href)
    }))
  })())
})
