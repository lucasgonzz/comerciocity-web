/** La referencia une una visita con su mensaje; los parámetros son declarados por la URL. */
export const CLAVE_ATRIBUCION = 'cc_atribucion_v2'
export const TTL_ATRIBUCION = 7 * 24 * 60 * 60 * 1000
export const TEXTO_CTA = 'Hola, quiero hacer la demo de ComercioCity'
const IDS = ['campaign_id', 'adset_id', 'ad_id']
const TEXTOS = ['campaign_name', 'adset_name', 'ad_name', 'utm_source', 'utm_medium',
  'utm_campaign', 'utm_content', 'utm_term', 'fbclid']
const CAMPOS = IDS.concat(TEXTOS)
let atribucion_visita

function limpiar(datos) {
  const resultado = {}
  CAMPOS.forEach(function (campo) {
    const valor = datos[campo]
    if (typeof valor !== 'string' || !valor || valor.length > 255 || /[{}\x00-\x1f]/.test(valor)) return
    if (IDS.includes(campo) && !/^\d{1,30}$/.test(valor)) return
    resultado[campo] = valor
  })
  return resultado
}

/** Un parámetro de campaña nuevo reemplaza TODO el snapshot, aunque llegue vacío/inválido. */
export function resolver_atribucion({ search = '', storage, ahora = Date.now() } = {}) {
  const query = new URLSearchParams(search)
  const hay_llegada = CAMPOS.some(function (campo) { return query.has(campo) })
  let snapshot
  if (!hay_llegada) {
    try {
      const previo = JSON.parse(storage.getItem(CLAVE_ATRIBUCION))
      if (previo && previo.version === 2 && Number.isFinite(previo.created_at) &&
        previo.created_at <= ahora && ahora - previo.created_at < TTL_ATRIBUCION &&
        previo.datos && typeof previo.datos === 'object' && !Array.isArray(previo.datos)) {
        return limpiar(previo.datos)
      }
    } catch (_) { /* El almacenamiento bloqueado o corrupto no impide abrir WhatsApp. */ }
  }
  snapshot = { version: 2, created_at: ahora, datos: limpiar(Object.fromEntries(query)) }
  try { storage.setItem(CLAVE_ATRIBUCION, JSON.stringify(snapshot)) } catch (_) { /* Sigue en memoria. */ }
  return snapshot.datos
}

/** La misma llegada alimenta al píxel y a la referencia, sin recalcularla durante la navegación. */
export function obtener_atribucion() {
  if (!atribucion_visita) {
    let storage
    try { storage = window.sessionStorage } catch (_) { /* Puede estar bloqueado. */ }
    atribucion_visita = resolver_atribucion({ search: window.location.search, storage })
  }
  return Object.assign({}, atribucion_visita)
}

export function armar_url_whatsapp(reference) {
  const marcador = /^[a-f0-9]{32}$/.test(reference || '') ? ' [CC:' + reference + ']' : ''
  return 'https://wa.me/543444544199?text=' + encodeURIComponent(TEXTO_CTA + marcador)
}

/** Sólo devuelve referencias persistidas y vigentes. Nunca espera en el gesto del visitante. */
export async function solicitar_referencia({ endpoint, datos, fetcher = globalThis.fetch,
  timeout = 2500, ahora = Date.now } = {}) {
  if (!endpoint || typeof fetcher !== 'function') return null
  const controlador = typeof AbortController === 'function' ? new AbortController() : null
  let temporizador
  try {
    const limite = new Promise(function (resolve) {
      temporizador = setTimeout(function () {
        if (controlador) controlador.abort()
        resolve(null)
      }, timeout)
    })
    const pedido = Promise.resolve().then(function () {
      return fetcher(endpoint, {
        method: 'POST', mode: 'cors', credentials: 'omit', referrerPolicy: 'no-referrer',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(limpiar(datos || {})), signal: controlador ? controlador.signal : undefined,
      })
    }).then(async function (respuesta) {
      if (respuesta.status !== 201) return null
      const cuerpo = await respuesta.json()
      if (!cuerpo || !/^[a-f0-9]{32}$/.test(cuerpo.reference || '') || typeof cuerpo.expires_at !== 'string') return null
      const vence = Date.parse(cuerpo.expires_at)
      const fecha = ahora()
      if (!Number.isFinite(vence) || vence <= fecha || vence > fecha + TTL_ATRIBUCION + 60000) return null
      return cuerpo.reference
    })
    return await Promise.race([pedido, limite])
  } catch (_) {
    return null
  } finally {
    clearTimeout(temporizador)
  }
}
