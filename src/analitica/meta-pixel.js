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
 *   | `prueba_cta_tocado` (botón principal) | `CtaPrueba` (propio), con la sección        |
 *   | `prueba_alta` (201 del alta)          | `Lead` con `eventID` confirmado por el admin |
 *   | `agenda_abierta` (abre el selector)   | `CtaAgenda` (propio), con la sección        |
 *   | `demo_reservada` (201 de la reserva)  | `Lead` / `Schedule` con el `eventID` del admin |
 *
 * `Contact` es el evento de conversión por el que optimizaba la campaña (M6b del plan del
 * 13/10/2026); `CtaWhatsApp` es un evento propio que agrega la sección desde la que se tocó,
 * para poder comparar qué parte de la página convierte sin ensuciar el estándar.
 *
 * Desde el 3/11/2026 (programa «Prueba gratuita de 7 días») el botón principal de cada CTA es
 * «Empezá tu prueba gratis», que lleva a `/prueba`: `CtaPrueba` (propio) mide desde qué sección
 * se tocó, y la conversión que optimiza la campaña pasa a ser **`StartTrial`** (evento estándar
 * de Meta). El alta (201) solo dispara `Lead`, con el `eventID` que confirma el admin para
 * deduplicar con la API de Conversiones. `StartTrial` lo registra el admin por CAPI recién
 * con el primer ingreso real al sistema. Ni crear la cuenta ni terminar el armado lo prueban.
 *
 * `CtaAgenda` es el gemelo de `CtaWhatsApp` para el botón «Elegí día y hora de tu demo» (abre
 * el modal de la agenda, que desde el 3/11/2026 vive en `/demo`, fuera del flujo principal).
 * `Lead`/`Schedule` salen SOLO con los `event_id` que devuelve el admin al reservar: el admin
 * manda los mismos eventos por la API de Conversiones con ese mismo id, y Meta los deduplica
 * (decisiones D8/D12 de la misión `demo-autogestionada-landing`). Sin `event_id` no se manda
 * nada: un `Lead` sin id contaría doble.
 *
 * 🔴 SIN DATOS PERSONALES. Acá no entra teléfono, mail, nombre ni nada que identifique a una
 * persona. El formulario de la agenda y el del alta de la prueba piden nombre, WhatsApp, correo
 * (y el alta, el negocio y una contraseña), pero esos datos van SOLO al admin (que los manda a
 * Meta por su lado, hasheados, por la API de Conversiones): acá nunca pasan. Lo único que viaja además del nombre de la sección y los `event_id` son
 * los parámetros de campaña declarados en la URL de llegada (IDs/nombres, `fbclid` y los
 * `utm_*`). El matching avanzado (`fbq('init', id, {em, ph})`) queda deliberadamente sin
 * usar, y el AUTOMÁTICO también: `autoConfig` va apagado antes del `init`. Con él prendido
 * (Events Manager lo trae prendido en muchos conjuntos de datos), `fbevents.js` lee los
 * campos de correo, teléfono y nombre de la página y los adjunta hasheados a los eventos
 * que siguen -- justo `Lead` y `Schedule`, que salen con el formulario todavía en el DOM.
 * Apagarlo también apaga los eventos automáticos de clic, que esta web no usa.
 *
 * Apagado por defecto: sin `VITE_META_PIXEL_ID` no se inyecta el script, no se define `fbq`,
 * no se piden cookies y `registrar_evento` no hace nada.
 *
 * 🔴 Y apagado en las visitas de ENSAYO (misión `ensayos-sin-eventos-meta`, 13/11/2026): con
 * `?cc_ensayo=1`, después de un alta que el admin contestó con `ensayo: true`, o en un navegador
 * automatizado, no se carga `fbevents.js` ni sale ningún evento. Ver `analitica/ensayo.js`.
 */

import { META_PIXEL_ID } from '../config'
import { obtener_atribucion } from './atribucion-whatsapp'
import { es_visita_de_ensayo, marcar_ensayo } from './ensayo'

/** Snapshot único de esta visita, compartido con la referencia del WhatsApp. */
let atribucion = {}
let activo = false
/** Visita de ensayo (ver `analitica/ensayo.js`): el píxel no se carga y no sale ningún evento. */
let ensayo = false

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

  /* Un ensayo no carga el píxel: ni `PageView`, ni cookie `_fbp`, ni pedido a Facebook. */
  ensayo = es_visita_de_ensayo()
  if (ensayo) {
    if (typeof console !== 'undefined' && console.debug) {
      console.debug('[comerciocity] píxel apagado: visita de ensayo')
    }
    return false
  }

  cargar_fbevents()
  /* ANTES del init: sin esto el píxel puede levantar nombre, teléfono y correo del
     formulario de la agenda (ver el encabezado). */
  window.fbq('set', 'autoConfig', false, META_PIXEL_ID)
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
  if (ensayo || !activo || !window.fbq) {
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
    return
  }

  if (nombre === 'agenda_abierta') {
    window.fbq('trackCustom', 'CtaAgenda', Object.assign({ seccion: datos.seccion || 'desconocido' }, atribucion))
    return
  }

  if (nombre === 'prueba_cta_tocado') {
    window.fbq('trackCustom', 'CtaPrueba', Object.assign({ seccion: datos.desde || 'desconocido' }, atribucion))
    return
  }

  if (nombre === 'prueba_alta') {
    /* Defensa también en la salida: un admin anterior puede incluir StartTrial en el 201. */
    ;(Array.isArray(datos.meta_eventos) ? datos.meta_eventos : []).forEach(function (evento) {
      if (!evento || evento.nombre !== 'Lead' || typeof evento.event_id !== 'string' ||
          !/^[A-Za-z0-9_\-.:]{1,120}$/.test(evento.event_id)) {
        return
      }
      window.fbq('track', evento.nombre, Object.assign({ content_name: 'prueba' }, atribucion), {
        eventID: evento.event_id,
      })
    })
    return
  }

  if (nombre === 'demo_reservada') {
    /* La lista ya viene filtrada por agenda-demo.js (solo Lead/Schedule con id válido). */
    ;(Array.isArray(datos.meta_eventos) ? datos.meta_eventos : []).forEach(function (evento) {
      if (!evento || !evento.nombre || !evento.event_id) {
        return
      }
      window.fbq('track', evento.nombre, Object.assign({ content_name: 'demo' }, atribucion), {
        eventID: evento.event_id,
      })
    })
  }
}

/**
 * El alta de la prueba resultó un ensayo (el admin contestó `ensayo: true`): desde acá no sale
 * ningún evento más en esta visita, y el navegador queda marcado (ver `analitica/ensayo.js`) para
 * que las próximas visitas ni carguen el píxel. Se llama ANTES de emitir `prueba_alta`.
 *
 * @returns {void}
 */
export function marcar_sesion_de_ensayo() {
  ensayo = true
  activo = false
  /* `fbevents.js` ya cargado manda solo un `PageView` en cada cambio de historial de la SPA (el
     `$router.replace` del alta, por ejemplo). Esta es la bandera que ofrece Meta para apagarlo; se toca
     solo en un ensayo: el tráfico real sigue con el comportamiento de siempre. */
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq.disablePushState = true
  }
  marcar_ensayo()
}

/**
 * Para el informe y para probar a mano desde la consola. No lo usa la página.
 *
 * @returns {object}
 */
export function estado_pixel() {
  return {
    activo: activo,
    ensayo: ensayo,
    id: META_PIXEL_ID || null,
    atribucion: Object.assign({}, atribucion),
  }
}
