<template>
  <!-- El recorrido de la web pública. Nació como ScrollDolor.vue de la página de experiencia
       del admin (4/10/2026) y el 26/10/2026 Lucas lo reordenó así:

         1. El video hero.
         2. "Bienvenido a la nueva era": la migración y los tres sistemas (gestión, e-commerce
            y agentes), cada uno en su tarjeta y con su color.
         3. La inteligencia artificial como pilar, y la capacitación por videollamada.
         4. Los agentes de IA: carrusel de tres escenas animadas (asistente, agente de ventas,
            MCP), de 7 a 15 s cada una.
         5. Los clientes: "No sos el primero en dar este paso", las categorías, la pared de
            logos y las tiendas. Con el fondo vivo de la apertura que se sacó.
         6. Las reseñas de Google.
         7. Los testimonios en video, por negocio.
         8. El precio.
         9. El desarrollo a medida.
        10. El CTA: elegir día y hora de la demo (WhatsApp como segunda opción).

       Salieron ese día, por pedido explícito: la apertura "Tu negocio funciona porque vos te
       acordás. / Y eso tiene un límite.", "No es un sistema de facturación. Es otra cosa."
       (SeccionPosicionamiento) y "No te dejamos solo" (SeccionImplementacion). Antes habían
       salido la portada "Nada de esto es sobre el sistema", el cubo y la tarjeta de los hitos.
       Todo está en el historial de git.

       Y el scroll pasó a ser NORMAL (SCROLL_GUIADO en config.js): sin snap, sin "un gesto,
       una sección" y sin pines que retienen la pantalla. El código del scroll guiado sigue
       entero; prender la constante lo devuelve.

       Siempre en tema claro: el video del hero es claro y la página sigue su luz. La clase
       `demo-scroll-dolor` se conserva porque es el scope de las variables de color del tema
       en experiencia.scss y de los selectores de los componentes portados. -->
  <section ref="raiz" class="demo-scroll-dolor" :class="{ 'demo-scroll-dolor--claro': tema === 'claro' }">
    <hero-video :cta_url="cta_url" :emitir_evento="emitir_evento" :abrir_agenda="abrir_agenda" />

    <seccion-nueva-era />

    <seccion-ia-nativa />

    <seccion-agentes-ia :cta_url="cta_url" :emitir_evento="emitir_evento" :abrir_agenda="abrir_agenda" />

    <!-- Suelta en el scroll, NO dentro de un fondo-seccion-sticky: trae su propio pin (que con
         el scroll normal no se usa: la sección va en el flujo). -->
    <seccion-clientes />

    <seccion-resenas />

    <seccion-testimonios :emitir_evento="emitir_evento" />

    <seccion-precio :cta_url="cta_url" :emitir_evento="emitir_evento" :abrir_agenda="abrir_agenda" />

    <seccion-desarrollo-medida />

    <!-- El cierre: el CTA. Con el scroll guiado va dentro del fondo sticky que usaba el puente
         al formulario (`boton_avance` apagado: es la última sección). Con el scroll normal va
         en el flujo con el mismo fondo y el CTA ya entrado: adentro del pin, el CTA solo
         aparece cuando el borde de la sección llega al tope, y bajando a mano se veía una
         pantalla vacía. -->
    <fondo-seccion-sticky v-if="scroll_guiado" variante="puente" :boton_avance="false" v-slot="{ progreso }">
      <cta-demo
        :cta_url="cta_url"
        :progreso="progreso"
        :emitir_evento="emitir_evento"
        :abrir_agenda="abrir_agenda"
      />
    </fondo-seccion-sticky>
    <section v-else class="demo-scroll-dolor__cierre demo-fondo-seccion--puente">
      <div class="demo-fondo-seccion__fondo demo-scroll-dolor__cierre-fondo" aria-hidden="true"></div>
      <cta-demo
        class="demo-scroll-dolor__cierre-cta"
        :cta_url="cta_url"
        :progreso="1"
        :emitir_evento="emitir_evento"
        :abrir_agenda="abrir_agenda"
      />
    </section>
  </section>
</template>

<script>
import FondoSeccionSticky from './FondoSeccionSticky.vue'
import HeroVideo from './HeroVideo.vue'
import SeccionClientes from './SeccionClientes.vue'
import SeccionNuevaEra from './SeccionNuevaEra.vue'
import SeccionIaNativa from './SeccionIaNativa.vue'
import SeccionAgentesIa from './SeccionAgentesIa.vue'
import SeccionPrecio from './SeccionPrecio.vue'
import SeccionDesarrolloMedida from './SeccionDesarrolloMedida.vue'
import SeccionResenas from './SeccionResenas.vue'
import SeccionTestimonios from './SeccionTestimonios.vue'
import CtaDemo from './CtaDemo.vue'
import { SCROLL_GUIADO } from '@/config'

export default {
  name: 'Recorrido',

  components: {
    FondoSeccionSticky,
    HeroVideo,
    SeccionClientes,
    SeccionNuevaEra,
    SeccionIaNativa,
    SeccionAgentesIa,
    SeccionPrecio,
    SeccionDesarrolloMedida,
    SeccionResenas,
    SeccionTestimonios,
    CtaDemo,
  },

  props: {
    /** Tema visual del recorrido. La web pública usa 'claro'. */
    tema: {
      type: String,
      default: 'claro',
    },
    /** URL del CTA (WhatsApp con el texto prearmado). */
    cta_url: {
      type: String,
      required: true,
    },
    /**
     * Método centralizado de tracking, inyectado por el contenedor.
     * Firma: emitir_evento(nombre: string, payload: object) -> void.
     */
    emitir_evento: {
      type: Function,
      default: function () {},
    },
    /**
     * Abre la agenda de la demo (el botón principal de cada CTA). Inyectado por Home.vue.
     * Firma: abrir_agenda(seccion: string, evento?: Event) -> void.
     */
    abrir_agenda: {
      type: Function,
      default: function () {},
    },
  },

  data() {
    return {
      scroll_guiado: SCROLL_GUIADO,
      observador_secciones: null,
    }
  },

  mounted() {
    this.observar_secciones()
  },

  beforeUnmount() {
    if (this.observador_secciones) {
      this.observador_secciones.disconnect()
      this.observador_secciones = null
    }
  },

  methods: {
    /**
     * Reporta qué secciones vio el visitante (una vez por sección). Los componentes no se
     * enteran: se observan sus nodos raíz desde afuera.
     *
     * @returns {void}
     */
    observar_secciones() {
      if (typeof IntersectionObserver === 'undefined') {
        return
      }

      const self = this
      const secciones = [
        ['.demo-hero-video', 'hero.video'],
        ['.demo-nueva-era', 'nueva_era'],
        ['.demo-ia', 'ia'],
        ['.demo-agentes', 'agentes_ia'],
        ['.demo-clientes', 'clientes'],
        ['.demo-resenas', 'resenas'],
        ['.demo-testimonios', 'testimonios'],
        ['.demo-precio', 'precio'],
        ['.demo-medida', 'desarrollo_medida'],
        ['.demo-cta', 'cta'],
      ]

      self.observador_secciones = new IntersectionObserver(
        function (entradas) {
          entradas.forEach(function (entrada) {
            if (!entrada.isIntersecting || !self.seccion_vista(entrada)) {
              return
            }
            const id = entrada.target.getAttribute('data-seccion-id')
            self.observador_secciones.unobserve(entrada.target)
            self.emitir_evento('scroll_bloque_visible', { bloque_id: id })
          })
        },
        /* Muchos escalones y no uno solo: el criterio real lo decide `seccion_vista()` con
           la geometría de cada entrada, y estos umbrales son nada más los momentos en que el
           navegador se digna a avisar. Hace falta que haya alguno por debajo de 0,5 o las
           secciones altas no despiertan nunca al observador. */
        { threshold: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.75, 1] },
      )

      const raiz = self.$refs.raiz
      secciones.forEach(function (par) {
        const nodo = raiz && raiz.querySelector(par[0])
        if (!nodo) {
          return
        }
        nodo.setAttribute('data-seccion-id', par[1])
        self.observador_secciones.observe(nodo)
      })
    },

    /**
     * ¿El visitante VIO esta sección? La mitad de la sección, o la mitad de la pantalla
     * tapada por ella: lo que ocurra con la más chica de las dos.
     *
     * 🔴 El `threshold: 0.5` a secas, que es lo que había hasta el 13/10/2026, miente en las
     * secciones altas: la de clientes mide varias pantallas y su razón de intersección no
     * llega nunca a 0,5 aunque ocupe la pantalla entera -- con el píxel conectado sería un
     * `ViewContent` menos, en silencio y para siempre.
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
  },
}
</script>

<style scoped>
/* Sin gap entre secciones: cada una trae su propio fondo, y cualquier aire acá quedaría sin
   fondo detrás. */
.demo-scroll-dolor {
  max-width: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* El cierre con scroll normal: una pantalla, el fondo "puente" de experiencia.scss detrás y
   el CTA centrado encima. */
.demo-scroll-dolor__cierre {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  min-height: 100svh;
  padding: clamp(56px, 10vh, 110px) clamp(16px, 4vw, 48px) clamp(24px, 4vh, 40px);
  overflow: hidden;
}

.demo-scroll-dolor__cierre-fondo {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.demo-scroll-dolor__cierre-cta {
  position: relative;
  width: 100%;
  max-width: 1080px;
}
</style>
