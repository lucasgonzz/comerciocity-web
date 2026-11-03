<template>
  <!-- El scroller de la página: html/body/#app son height:100% + overflow:hidden (ver
       style.css), así que el scroll real vive acá y no en el documento. Es la misma
       estructura que el admin (<main class="app-main-scroll">) y es lo que hace funcionar,
       sin cambios, a los componentes portados de la página de experiencia: el position:
       sticky de los pines ancla contra este contenedor, cada sección encuentra su ancestro
       con scroll subiendo por el DOM, y el avance guiado escucha la rueda, el dedo y el
       teclado sobre este elemento (con `window` no se crea). -->
  <!-- `demo-scroll-guiado` (el scroll-snap obligatorio) solo con SCROLL_GUIADO prendido: desde
       el 26/10/2026 la página scrollea normal (ver config.js). -->
  <main ref="scroller" class="sitio-scroller" :class="{ 'demo-scroll-guiado': SCROLL_GUIADO }">
    <div class="demo-experiencia-page">
      <!-- Se monta recién cuando el controlador de avance existe (ver mounted): las
           secciones preguntan "¿queda alguna más abajo?" al montarse y una respuesta dada sin
           controlador quedaría cacheada en false -- el chevron no aparecería en la primera
           sección hasta que el visitante se fuera y volviera. -->
      <recorrido
        v-if="listo"
        :cta_url="CTA_URL"
        :emitir_evento="emitir_evento"
      />
    </div>
  </main>

  <!-- La agenda de la demo por turno. Desde el 3/11/2026 (programa «Prueba gratuita de 7 días»)
       ningún botón de la página la abre: los CTA llevan a /prueba. Se abre sola en la ruta
       /demo (meta.agenda), para quien tenga ese link, y al cerrarla se vuelve a /. Vive afuera
       del scroller (se teletransporta al <body>) para que sus gestos no muevan la página. -->
  <agenda-demo-modal
    :abierto="agenda_abierta"
    :seccion="agenda_seccion"
    :cta_url="CTA_URL"
    :emitir_evento="emitir_evento"
    @cerrar="cerrar_agenda"
  />
</template>

<script>
import Recorrido from '@/components/recorrido/Recorrido.vue'
import AgendaDemoModal from '@/components/recorrido/AgendaDemoModal.vue'
import crear_avance_guiado from '@/components/recorrido/avance-guiado'
import { registrar_evento } from '@/analitica/meta-pixel'
import { armar_url_whatsapp, obtener_atribucion, solicitar_referencia } from '@/analitica/atribucion-whatsapp'
import { WHATSAPP_REFERENCIAS_URL, SCROLL_GUIADO } from '@/config'
import '@/assets/scss/experiencia.scss'

/**
 * La SEGUNDA opción de cada CTA: la principal es «Empezá tu prueba gratis», que lleva a
 * /prueba (programa «Prueba gratuita de 7 días», 3/11/2026; del 22/10 al 3/11 era «Elegí día y
 * hora de tu demo», que abría la agenda de AgendaDemoModal.vue, hoy en /demo). Este enlace
 * queda como «¿Tenés dudas? Escribinos por WhatsApp», con el mismo número, la misma frase y la
 * misma referencia [CC:…].
 *
 * El CTA de WhatsApp: agendar la demo, por WhatsApp, al número del canal de leads
 * (+54 3444 544199, el mismo que usaba esta web). El texto no saluda a nadie por su nombre
 * (pedido de Lucas, 13/10/2026): «Hola, quiero hacer la demo de ComercioCity».
 *
 * 🔴 La frase es PROPIA DE LA LANDING y distinta de la de la página de experiencia del admin
 * y de la de los anuncios, a propósito (plan del 13/10/2026, decisión 2.1): el primer mensaje
 * del lead dice de dónde vino, y de eso sale `leads.origen` en el admin (M6c). El agente de
 * leads la tiene que reconocer como un "sí" a la demo: cuando se cambie acá, el setting del
 * admin pasa a ser una LISTA (`demo_cta_whatsapp_textos`) que incluye esta frase y la vieja.
 * Si se toca este texto sin tocar aquello, el agente deja de entender el primer mensaje.
 */
const CTA_URL = armar_url_whatsapp()

export default {
  name: 'Home',

  components: {
    Recorrido,
    AgendaDemoModal,
  },

  /**
   * El avance guiado, para los descendientes que lo necesitan (el chevron de "siguiente
   * sección" de cada FondoSeccionSticky y del hero). Se provee un envoltorio y no el
   * controlador directo: así el botón depende de dos métodos con nombre, y entra por el
   * MISMO avance que un gesto, con su cerrojo y su cola.
   *
   * @returns {object}
   */
  provide() {
    const self = this
    return {
      avance_guiado: {
        avanzar(direccion) {
          if (self.avance) {
            self.avance.avanzar(direccion)
          }
        },
        hay_siguiente() {
          return !!(self.avance && self.avance.hay_siguiente())
        },
      },
    }
  },

  data() {
    return {
      CTA_URL,
      SCROLL_GUIADO,
      listo: false,
      avance: null,
      cta_montado: false,
      agenda_abierta: false,
      /** Sección desde la que se abrió la agenda (viaja en los eventos). */
      agenda_seccion: '',
      /** El botón que la abrió: el foco vuelve ahí al cerrar. */
      agenda_origen: null,
    }
  },

  mounted() {
    this.cta_montado = true
    solicitar_referencia({ endpoint: WHATSAPP_REFERENCIAS_URL, datos: obtener_atribucion() })
      .then((reference) => {
        if (reference && this.cta_montado) this.CTA_URL = armar_url_whatsapp(reference)
      })
    /* Sin avance guiado, la rueda, el dedo y el teclado le llegan derechos al navegador, y
       los chevrons de "siguiente sección" no se dibujan (`hay_siguiente()` da false). */
    const scroller = this.$refs.scroller
    if (scroller && SCROLL_GUIADO) {
      this.avance = crear_avance_guiado(scroller)
    }
    this.listo = true
    this.sincronizar_agenda_con_ruta()
  },

  watch: {
    /* La misma Home sirve a `/` y a `/demo`: al pasar de una a otra sin recargar, el modal
       sigue a la ruta. */
    '$route.meta.agenda'() {
      this.sincronizar_agenda_con_ruta()
    },
  },

  beforeUnmount() {
    this.liberar_fondo()
    this.cta_montado = false
    if (this.avance) {
      this.avance.destruir()
      this.avance = null
    }
  },

  methods: {
    /**
     * Tracking centralizado de la página: UN solo punto para toda la web, y es acá.
     *
     * Las secciones no saben que existe Meta -- emiten su evento con su nombre propio
     * (`scroll_bloque_visible`, `cta_demo_tocado`, ...) y de la traducción se encarga
     * `analitica/meta-pixel.js`. La consola sigue recibiendo todo, que es lo que permite
     * verificar la página sin píxel configurado.
     *
     * @param {string} nombre
     * @param {object} payload
     * @returns {void}
     */
    emitir_evento(nombre, payload) {
      if (typeof console !== 'undefined' && console.debug) {
        console.debug('[comerciocity] ' + nombre, payload || {})
      }
      registrar_evento(nombre, payload)
    },

    /**
     * Abre o cierra la agenda según la ruta: en /demo abierta, en cualquier otra cerrada.
     *
     * @returns {void}
     */
    sincronizar_agenda_con_ruta() {
      const en_demo = !!(this.$route && this.$route.meta && this.$route.meta.agenda)
      if (en_demo && !this.agenda_abierta) {
        this.abrir_agenda('ruta_demo')
      } else if (!en_demo && this.agenda_abierta) {
        this.agenda_abierta = false
        this.liberar_fondo()
        this.agenda_origen = null
      }
    },

    /**
     * Abre la agenda. Desde el 3/11/2026 la abre solo la ruta /demo (antes, los botones
     * «Elegí día y hora de tu demo» de cada sección).
     *
     * El botón se toma del evento y no de `document.activeElement`: Safari no enfoca un
     * <button> al hacerle clic, y el foco tiene que volver a él al cerrar.
     *
     * @param {string} seccion hero, agentes_ia, precio, cierre, ruta_demo.
     * @param {Event} [evento] El clic.
     * @returns {void}
     */
    abrir_agenda(seccion, evento) {
      if (this.agenda_abierta) {
        return
      }
      this.agenda_origen = (evento && evento.currentTarget) || document.activeElement || null
      this.agenda_seccion = seccion || 'desconocido'
      this.agenda_abierta = true
      this.bloquear_fondo()
      this.emitir_evento('agenda_abierta', { seccion: this.agenda_seccion })
    },

    /** @returns {void} */
    cerrar_agenda() {
      this.agenda_abierta = false
      this.liberar_fondo()
      const origen = this.agenda_origen
      this.agenda_origen = null
      this.$nextTick(function () {
        if (origen && typeof origen.focus === 'function' && document.contains(origen)) {
          origen.focus({ preventScroll: true })
        }
      })
      /* Cerrarla desde /demo es volver a la página (sin dejar /demo en el historial: el
         botón «atrás» del navegador la volvería a abrir). */
      if (this.$route && this.$route.meta && this.$route.meta.agenda) {
        this.$router.replace({ path: '/', query: this.$route.query })
      }
    },

    /**
     * Con la agenda abierta, la página de atrás no recibe foco, clics ni teclado: el scroller
     * queda `inert` (lo que además lo saca del árbol de accesibilidad, como pide un diálogo
     * modal). El scroll no hace falta bloquearlo: el velo del modal cubre la pantalla y está
     * afuera del scroller, así que ni la rueda ni el dedo le llegan.
     *
     * 🔴 No tocar el `overflow` del scroller: las secciones encuentran su contenedor con
     * `encontrar_ancestro_scroll()`, que solo acepta `auto|scroll`, y una que se montara con
     * el overflow en `hidden` se ataría a `window`. Además es un scroll-snap obligatorio.
     *
     * @returns {void}
     */
    bloquear_fondo() {
      const scroller = this.$refs.scroller
      if (scroller) {
        scroller.setAttribute('inert', '')
      }
    },

    /** @returns {void} */
    liberar_fondo() {
      const scroller = this.$refs.scroller
      if (scroller) {
        scroller.removeAttribute('inert')
      }
    },
  },
}
</script>
