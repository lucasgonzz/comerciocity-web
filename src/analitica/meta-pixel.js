/**
 * El píxel de Meta de la web pública.
 *
 * Es el ÚNICO punto donde esta web habla con Facebook. Nadie más importa `fbq`: las
 * secciones siguen emitiendo sus eventos propios por el bus `emitir_evento` de Home.vue y
 * acá se traducen a eventos de Meta. Si mañana se cambia de herramienta, se cambia este
 * archivo y ninguno más.
 *
 * Qué manda, y nada más que esto:
 *
 *   | Evento de la web                     | Evento de Meta                              |
 *   |--------------------------------------|---------------------------------------------|
 *   | (carga de la página)                 | `PageView`                                  |
 *   | `scroll_bloque_visible` (50 % visto)  | `ViewContent` con `content_name` = sección  |
 *   | `cta_demo_tocado` (cualquier CTA)     | `Contact` + `CtaWhatsApp` (propio), con la sección |
 *
 * `Contact` es el evento de conversión por el que optimiza la campaña (M6b del plan del
 * 13/10/2026); `CtaWhatsApp` es un evento propio que agrega la sección desde la que se tocó,
 * para poder comparar qué parte de la página convierte sin ensuciar el estándar.
 *
 * 🔴 SIN DATOS PERSONALES. Acá no entra teléfono, mail, nombre ni nada que identifique a una
 * persona: la landing es anónima y no hay formulario. Lo único que viaja además del nombre de
 * la sección son los parámetros de campaña declarados en la URL de llegada (IDs/nombres,
 * `fbclid` y los `utm_*`). El matching avanzado (`fbq('init', id, {em, ph})`) queda
 * deliberadamente sin usar.
 *
 * Apagado por defecto: sin `VITE_META_PIXEL_ID` no se inyecta el script, no se define `fbq`,
 * no se piden cookies y `registrar_evento` no hace nada.
 */

import { META_PIXEL_ID } from '../config'
import { obtener_atribucion } from './atribucion-whatsapp'

/** Snapshot único de esta visita, compartido con la referencia del WhatsApp. */
let atribucion = {}
let activo = false

/**
 * El snippet oficial de Meta, con el `<script>` inyectado desde acá en vez de escrito en el
 * index.html. Es la misma secuencia que publica Events Manager: la cola `fbq` existe desde el
 * primer renglón, así que los eventos disparados antes de que `fbevents.js` termine de bajar
 * no se pierden.
 *
 * @returns {void}
 */
function cargar_fbevents() {
  /* eslint-disable */
  if (window.fbq) {
    return
  }
  const n = (window.fbq = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
  })
  if (!window._fbq) {
    window._fbq = n
  }
  n.push = n
  n.loaded = true
  n.version = '2.0'
  n.queue = []

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://connect.facebook.net/en_US/fbevents.js'
  const primero = document.getElementsByTagName('script')[0]
  if (primero && primero.parentNode) {
    primero.parentNode.insertBefore(script, primero)
  } else {
    document.head.appendChild(script)
  }
  /* eslint-enable */
}

/**
 * Arranca el píxel y manda el `PageView`. Si no hay id configurado no hace absolutamente
 * nada: ni script, ni cookie, ni pedido a Facebook.
 *
 * @returns {boolean} true si el píxel quedó activo.
 */
export function iniciar_pixel() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false
  }

  /* La atribución se resuelve SIEMPRE, haya píxel o no: así los parámetros de la campaña ya
     están guardados si Lucas prende el píxel en otra pestaña, y el `console.debug` de
     desarrollo los muestra igual. */
  atribucion = obtener_atribucion()

  if (!META_PIXEL_ID) {
    return false
  }

  cargar_fbevents()
  window.fbq('init', META_PIXEL_ID)
  activo = true
  window.fbq('track', 'PageView', Object.assign({}, atribucion))
  return true
}

/**
 * Traduce un evento del bus de la web a Meta. Los nombres que no están en la tabla de arriba
 * (`agentes_diapositiva`, `hero_video_terminado`, `testimonio_*`) se ignoran a propósito: son
 * telemetría de la página, no conversiones, y mandarlos ensucia el Events Manager.
 *
 * @param {string} nombre Evento de la web.
 * @param {object} payload Datos del evento (sin datos personales).
 * @returns {void}
 */
export function registrar_evento(nombre, payload) {
  if (!activo || !window.fbq) {
    return
  }

  const datos = payload || {}

  if (nombre === 'scroll_bloque_visible') {
    window.fbq(
      'track',
      'ViewContent',
      Object.assign(
        {
          content_name: datos.bloque_id || 'desconocido',
          content_type: 'seccion',
        },
        atribucion,
      ),
    )
    return
  }

  if (nombre === 'cta_demo_tocado') {
    const seccion = datos.desde || 'desconocido'
    /* Los dos, y en este orden: `Contact` es el estándar por el que optimiza la campaña y
       `CtaWhatsApp` el propio que guarda DESDE DÓNDE se tocó. */
    window.fbq('track', 'Contact', Object.assign({ content_name: seccion }, atribucion))
    window.fbq('trackCustom', 'CtaWhatsApp', Object.assign({ seccion: seccion }, atribucion))
  }
}

/**
 * Para el informe y para probar a mano desde la consola. No lo usa la página.
 *
 * @returns {object}
 */
export function estado_pixel() {
  return {
    activo: activo,
    id: META_PIXEL_ID || null,
    atribucion: Object.assign({}, atribucion),
  }
}
