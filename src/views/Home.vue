<template>
  <!-- El scroller de la página: html/body/#app son height:100% + overflow:hidden (ver
       style.css), así que el scroll real vive acá y no en el documento. Es la misma
       estructura que el admin (<main class="app-main-scroll">) y es lo que hace funcionar,
       sin cambios, a los componentes portados de la página de experiencia: el position:
       sticky de los pines ancla contra este contenedor, cada sección encuentra su ancestro
       con scroll subiendo por el DOM, y el avance guiado escucha la rueda, el dedo y el
       teclado sobre este elemento (con `window` no se crea). -->
  <main ref="scroller" class="sitio-scroller demo-scroll-guiado">
    <div class="demo-experiencia-page">
      <!-- Se monta recién cuando el controlador de avance existe (ver mounted): las
           secciones preguntan "¿queda alguna más abajo?" al montarse y una respuesta dada sin
           controlador quedaría cacheada en false -- el chevron no aparecería en la primera
           sección hasta que el visitante se fuera y volviera. -->
      <recorrido v-if="listo" :cta_url="CTA_URL" :emitir_evento="emitir_evento" />
    </div>
  </main>
</template>

<script>
import Recorrido from '@/components/recorrido/Recorrido.vue'
import crear_avance_guiado from '@/components/recorrido/avance-guiado'
import '@/assets/scss/experiencia.scss'

/**
 * El CTA de toda la página: agendar la demo, por WhatsApp, al número del canal de leads
 * (+54 3444 544199, el mismo que usaba esta web). El texto prearmado es el que el agente de
 * leads reconoce como un "sí" a la demo (misma frase que el CTA de la página de experiencia
 * del admin: `demo_cta_whatsapp_texto`). Si se cambia acá, cambiarlo también allá, o el
 * agente deja de reconocerlo.
 */
const CTA_URL =
  'https://wa.me/543444544199?text=' +
  encodeURIComponent('Hola Martín, quiero hacer la demo de ComercioCity')

export default {
  name: 'Home',

  components: {
    Recorrido,
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
      listo: false,
      avance: null,
    }
  },

  mounted() {
    const scroller = this.$refs.scroller
    if (scroller) {
      this.avance = crear_avance_guiado(scroller)
    }
    this.listo = true
  },

  beforeUnmount() {
    if (this.avance) {
      this.avance.destruir()
      this.avance = null
    }
  },

  methods: {
    /**
     * Tracking centralizado de la página. Hoy queda en consola (no hay backend detrás de la
     * web pública); si algún día se conecta una analítica, se conecta acá y en ningún otro
     * lado.
     *
     * @param {string} nombre
     * @param {object} payload
     * @returns {void}
     */
    emitir_evento(nombre, payload) {
      if (typeof console !== 'undefined' && console.debug) {
        console.debug('[comerciocity] ' + nombre, payload || {})
      }
    },
  },
}
</script>
