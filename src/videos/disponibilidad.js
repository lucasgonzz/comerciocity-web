/** Una URL propuesta no es un video publicado. Fallar cerrado hasta verificar el objeto. */
export function video_publicado(video) {
  if (!video || video.published !== true || video.verified !== true) return false
  try {
    const url = new URL(video.url)
    return url.protocol === 'https:' && url.hostname === 'videos.comerciocity.store'
      && !url.username && !url.password && !url.search && !url.hash
      && url.pathname.endsWith('.mp4')
      && /^[a-f0-9]{64}$/.test(video.sha256)
      && url.pathname.includes(video.sha256.slice(0, 16))
  } catch {
    return false
  }
}

/** La vista de ensayo solo puede usar archivos locales, en dev y con medición apagada. */
export function seleccionar_video(video, entorno = {}) {
  if (entorno.DEV === true && entorno.VITE_PRUEBA_MOCK === '1'
    && entorno.VITE_VIDEOS_LANDING_PREVIEW === '1') {
    return { ...video, url: '/__videos-preview/' + encodeURIComponent(video.filename) }
  }
  return video_publicado(video) ? video : null
}
