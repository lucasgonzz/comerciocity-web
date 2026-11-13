<template>
  <!-- La landing de comerciocity.com desde el 13/11/2026 (misión `landing-nueva`): la propuesta A del informe
       `20261113-landing-redes-y-campana` («qué es, cuánto sale, probalo») con el bloque antes/ahora de la B, la frase
       1 y el estilo «contraste», tal como los aprobó Lucas sobre la maqueta. El orden:

          1. Barra de la promo + encabezado + hero (qué es, para quién, las tres partes, botones, precio).
          2. Logos, la ficha de Google y el video corto del sistema funcionando.
          3. Un sistema, tres partes.
          4. Antes y ahora (cuatro casos).
          5. Robotito.
          6. Testimonios (tres + ver más).
          7. Precios.
          8. Cómo arrancás.
          9. Preguntas frecuentes.
         10. Cierre y pie.
         Y la barra fija de abajo desde que los botones del hero salen de la pantalla.

       Reemplaza al recorrido anterior (`recorrido/Recorrido.vue`), que sigue en el repo sin montar: volver a la página
       anterior es cambiar el componente en `views/Home.vue`.

       La medición es la misma: cada sección vista manda `scroll_bloque_visible` con su id (el píxel lo traduce a
       `ViewContent`), con el mismo criterio de «vista» que tenía Recorrido.vue; los botones emiten
       `prueba_cta_tocado` y `cta_demo_tocado`. -->
  <div ref="raiz" class="lnd">
    <p class="lnd-promo">
      <span class="lnd-promo__corto"><b>{{ promo.descuento_corto }}</b> · {{ promo.prueba }}</span>
      <span class="lnd-promo__largo"><b>{{ promo.descuento }}</b> · Probalo {{ promo.prueba }}, sin tarjeta</span>
    </p>
    <header class="lnd-encabezado">
      <div class="lnd-encabezado__dentro">
        <a href="/" aria-label="ComercioCity, inicio">
          <img :src="logotipo" alt="ComercioCity" width="320" height="74" />
        </a>
        <a
          class="lnd-encabezado__wa"
          :href="cta_url"
          target="_blank"
          rel="noopener noreferrer"
          @click="emitir_evento('cta_demo_tocado', { desde: 'encabezado' })"
        >
          <icono-whatsapp color="#4ade80" />
          <span>¿Dudas? Escribinos</span>
        </a>
      </div>
    </header>

    <landing-hero :cta_url="cta_url" :emitir_evento="emitir_evento" />
    <prueba-social :emitir_evento="emitir_evento" />
    <tres-partes />
    <antes-ahora />
    <seccion-robotito />
    <testimonios :emitir_evento="emitir_evento" />
    <precios :cta_url="cta_url" :emitir_evento="emitir_evento" />
    <como-arrancas />
    <preguntas :emitir_evento="emitir_evento" />
    <cierre :cta_url="cta_url" :emitir_evento="emitir_evento" />

    <barra-fija :cta_url="cta_url" :visible="barra_visible" :emitir_evento="emitir_evento" />
  </div>
</template>

<script>
import './landing.css'
import IconoWhatsapp from './IconoWhatsapp.vue'
import LandingHero from './LandingHero.vue'
import PruebaSocial from './PruebaSocial.vue'
import TresPartes from './TresPartes.vue'
import AntesAhora from './AntesAhora.vue'
import SeccionRobotito from './SeccionRobotito.vue'
import Testimonios from './Testimonios.vue'
import Precios from './Precios.vue'
import ComoArrancas from './ComoArrancas.vue'
import Preguntas from './Preguntas.vue'
import Cierre from './Cierre.vue'
import BarraFija from './BarraFija.vue'
import { PROMO } from './datos'
import logotipo from '../../assets/landing/logotipo-claro.webp'

/** Escalones del observador de secciones (ver `seccion_vista`): los mismos que Recorrido.vue. */
const UMBRALES = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.75, 1]

export default {
  name: 'Landing',

  components: {
    IconoWhatsapp,
    LandingHero,
    PruebaSocial,
    TresPartes,
    AntesAhora,
    SeccionRobotito,
    Testimonios,
    Precios,
    ComoArrancas,
    Preguntas,
    Cierre,
    BarraFija,
  },

  props: {
    /** URL del WhatsApp (texto precargado + referencia de la visita), armada por Home.vue. */
    cta_url: { type: String, required: true },
    /** Bus de eventos de Home.vue: emitir_evento(nombre, payload). */
    emitir_evento: { type: Function, default: function () {} },
  },

  data() {
    return {
      promo: PROMO,
      logotipo,
      /** La barra fija se muestra cuando los botones del hero ya no están a la vista. */
      barra_visible: false,
      observador_secciones: null,
      observador_hero: null,
    }
  },

  mounted() {
    this.observar_secciones()
    this.observar_botones_del_hero()
  },

  beforeUnmount() {
    if (this.observador_secciones) {
      this.observador_secciones.disconnect()
      this.observador_secciones = null
    }
    if (this.observador_hero) {
      this.observador_hero.disconnect()
      this.observador_hero = null
    }
  },

  methods: {
    /**
     * Reporta qué secciones vio el visitante, una vez por sección (`scroll_bloque_visible` → `ViewContent`). Las
     * secciones se marcan con `data-seccion="<id>"` en su raíz.
     *
     * @returns {void}
     */
    observar_secciones() {
      if (typeof IntersectionObserver === 'undefined') {
        return
      }
      const self = this
      self.observador_secciones = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
          if (!entrada.isIntersecting || !self.seccion_vista(entrada)) {
            return
          }
          self.observador_secciones.unobserve(entrada.target)
          self.emitir_evento('scroll_bloque_visible', { bloque_id: entrada.target.getAttribute('data-seccion') })
        })
      }, { threshold: UMBRALES })

      const raiz = self.$refs.raiz
      if (!raiz) {
        return
      }
      raiz.querySelectorAll('[data-seccion]').forEach(function (nodo) {
        self.observador_secciones.observe(nodo)
      })
    },

    /**
     * ¿El visitante VIO esta sección? La mitad de la sección, o la mitad de la pantalla tapada por ella: lo que
     * ocurra con la más chica de las dos. Es el criterio de Recorrido.vue (desde el 13/10/2026): un
     * `threshold: 0.5` a secas nunca dispara en una sección más alta que dos pantallas.
     *
     * @param {IntersectionObserverEntry} entrada
     * @returns {boolean}
     */
    seccion_vista(entrada) {
      const alto_seccion = entrada.boundingClientRect.height
      if (!alto_seccion) {
        return false
      }
      const referencia = Math.min(window.innerHeight || alto_seccion, alto_seccion)
      return entrada.intersectionRect.height / referencia >= 0.5
    },

    /**
     * La barra fija aparece cuando los botones del hero salieron de la pantalla (para arriba). Sin
     * IntersectionObserver se muestra siempre.
     *
     * @returns {void}
     */
    observar_botones_del_hero() {
      const raiz = this.$refs.raiz
      const botones = raiz && raiz.querySelector('.lnd-hero__acciones')
      if (!botones || typeof IntersectionObserver === 'undefined') {
        this.barra_visible = true
        return
      }
      const self = this
      self.observador_hero = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
          /* Solo cuando los botones quedaron ARRIBA: en una pantalla baja (un teléfono acostado) los
             botones pueden arrancar debajo del borde y la barra no tiene que aparecer de entrada. */
          self.barra_visible = !entrada.isIntersecting && entrada.boundingClientRect.top < 0
        })
      })
      self.observador_hero.observe(botones)
    },
  },
}
</script>
