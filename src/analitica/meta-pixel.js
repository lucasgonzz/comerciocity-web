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
 * la sección son los parámetros de campaña que trajo la URL (`fbclid` y los `utm_*`), que son
 * de la campaña y no del visitante. El matching avanzado (`fbq('init', id, {em, ph})`) queda
 * deliberadamente sin usar.
 *
 * Apagado por defecto: sin `VITE_META_PIXEL_ID` no se inyecta el script, no se define `fbq`,
 * no se piden cookies y `registrar_evento` no hace nada.
 */

import { META_PIXEL_ID } from '../config'

/** Clave del sessionStorage donde sobreviven los parámetros de campaña de la primera vista. */
const CLAVE_ATRIBUCION = 'cc_atribucion'

/**
 * Lo que se conserva de la query string. `fbclid` lo pone Meta al salir del anuncio; los
 * `utm_*` los pone el anuncio (M6b los arma con `utm_source=meta&utm_campaign=...`). Nada de
 * esto identifica a nadie.
 */
const PARAMETROS = ['fbclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']

/** Los parámetros de campaña de esta visita, resueltos una sola vez. */
let atribucion = {}

/** true cuando el píxel está cargado y aceptando eventos. */
let activo = false

/**
 * sessionStorage puede tirar excepción (ventana privada, datos del sitio bloqueados) o
 * devolver basura. Nunca puede romper la página: estas dos funciones se tragan todo.
 *
 * @param {string} clave
 * @returns {object}
 */
function leer_guardado(clave) {
  try {
    const crudo = window.sessionStorage.getItem(clave)
    if (!crudo) {
      return {}
    }
    const valor = JSON.parse(crudo)
    return valor && typeof valor === 'object' ? valor : {}
  } catch (e) {
    return {}
  }
}

/**
 * @param {string} clave
 * @param {object} valor
 * @returns {void}
 */
function guardar(clave, valor) {
  try {
    window.sessionStorage.setItem(clave, JSON.stringify(valor))
  } catch (e) {
    /* Sin almacenamiento la atribución vive solo en memoria, que para una visita alcanza. */
  }
}

/**
 * Resuelve los parámetros de campaña de la visita.
 *
 * El visitante llega con `?fbclid=...&utm_campaign=...`, navega, y en el camino la query
 * string se pierde (o la saca una vuelta por el historial). Por eso se guardan en
 * sessionStorage la PRIMERA vez y después se leen de ahí: la pestaña entera queda atribuida
 * al anuncio que la abrió. Session y no local a propósito -- una visita de la semana que
 * viene es una visita nueva, no la misma campaña.
 *
 * Lo que trae la URL pisa a lo guardado: si el visitante vuelve a entrar por otro anuncio en
 * la misma pestaña, vale el último.
 *
 * @returns {object}
 */
function resolver_atribucion() {
  const guardado = leer_guardado(CLAVE_ATRIBUCION)
  const resultado = {}
  let hay_nuevos = false

  let busqueda = null
  try {
    busqueda = new URLSearchParams(window.location.search)
  } catch (e) {
    busqueda = null
  }

  PARAMETROS.forEach(function (nombre) {
    const de_la_url = busqueda ? busqueda.get(nombre) : null
    if (de_la_url) {
      /* Tope de largo: un parámetro de 4 KB es un intento de inyección, no una campaña. */
      resultado[nombre] = String(de_la_url).slice(0, 255)
      hay_nuevos = true
      return
    }
    if (guardado[nombre]) {
      resultado[nombre] = String(guardado[nombre]).slice(0, 255)
    }
  })

  if (hay_nuevos) {
    guardar(CLAVE_ATRIBUCION, resultado)
  }

  return resultado
}

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
  atribucion = resolver_atribucion()

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
