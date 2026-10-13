<template>
  <!-- El recorrido de la web pública. Es ScrollDolor.vue de la página de experiencia del
       admin, con el orden que Lucas pidió el 4/10/2026 para unificar las dos páginas:

         1. El video hero (reemplaza a la animación del procesador).
         2. "Tu negocio funciona porque vos te acordás. / Y eso tiene un límite."
         3. Los clientes: el número, la pared de logos y las tiendas.
         4. "Bienvenido a la nueva era" con las cuatro tarjetas de la implementación.
         5. Los agentes de IA: carrusel de tres escenas animadas (asistente, agente de ventas,
            MCP). Reemplazó el 7/10/2026 al hero partido de la web vieja ("Profesionalizá tu
            negocio"), con su misma forma de pantalla partida.
         6. "No es un sistema de facturación. Es otra cosa."
         7. "No te dejamos solo."
         8. Las reseñas de Google.
         9. Los testimonios en video, por negocio.
        10. El CTA: agendar la demo.

       Salieron, por pedido explícito: la portada "Nada de esto es sobre el sistema", el cubo
       y la tarjeta de los hitos ("De operar tu negocio a dirigirlo").

       Siempre en tema claro: el video del hero es claro y la página sigue su luz. La clase
       `demo-scroll-dolor` se conserva porque es el scope de las variables de color del tema
       en experiencia.scss y de los selectores de los componentes portados. -->
  <section ref="raiz" class="demo-scroll-dolor" :class="{ 'demo-scroll-dolor--claro': tema === 'claro' }">
    <hero-video :cta_url="cta_url" :emitir_evento="emitir_evento" />

    <fondo-seccion-sticky variante="apertura" :contenido_full_bleed="true" v-slot="{ progreso }">
      <!-- `--espera` retiene la entrada hasta que la apertura SE VE: sin eso los ~2,4 s de
           animación corren mientras el lead todavía mira el video, y al llegar el titular ya
           está en su estado final. Sigue siendo el TIEMPO el que decide cuándo TERMINA (el
           animationend del subtítulo); lo único que cambia es cuándo EMPIEZA. -->
      <header
        class="demo-scroll-dolor__apertura"
        :class="{
          'demo-scroll-dolor__apertura--espera': !apertura_vista,
          'demo-scroll-dolor__apertura--carga': apertura_vista && !apertura_entrada_terminada,
        }"
      >
        <h1 class="demo-scroll-dolor__apertura-titulo" :style="estilo_apertura(progreso, 0)">
          {{ contenido.apertura.titulo }}
        </h1>
        <p class="demo-scroll-dolor__apertura-subtitulo" :style="estilo_apertura(progreso, 1)">
          {{ contenido.apertura.subtitulo }}
        </p>
        <!-- "Qué es", con la palabra que el ferretero busca, y la diferencia en una línea
             (informe del 5/10/2026, §9.2 y §9.3). Es el primer texto de la página que contesta
             "¿qué me están vendiendo?", y es la bandera que ningún competidor de alta
             inmediata puede decir. El `animationend` cuelga de ACÁ y no del subtítulo: es el
             último renglón en entrar, y la clase --carga tiene que irse recién cuando terminó
             todo (si se va antes, el que todavía está animando pega un salto). -->
        <p
          ref="apertura_cierre"
          class="demo-scroll-dolor__apertura-cierre"
          :style="estilo_apertura(progreso, 2)"
          @animationend="on_entrada_apertura_terminada"
        >
          Sistema de gestión, tienda online y asistente por WhatsApp.
          <strong>Te lo entregamos andando.</strong>
        </p>
      </header>
    </fondo-seccion-sticky>

    <!-- Suelta en el scroll, NO dentro de un fondo-seccion-sticky: trae su propio pin. Dos
         sticky anidados se despegan en momentos distintos. -->
    <seccion-clientes />

    <seccion-nueva-era />

    <seccion-agentes-ia :cta_url="cta_url" :emitir_evento="emitir_evento" />

    <seccion-posicionamiento />

    <seccion-implementacion :cta_url="cta_url" :emitir_evento="emitir_evento" />

    <!-- El precio, detrás del interruptor `VITE_MOSTRAR_PRECIO` (decisión D2 del plan del
         13/10/2026, que toma Lucas). Apagado por defecto: el bloque existe, está verificado y
         no se renderiza. Va acá, después de la implementación y antes de las reseñas: el
         precio se lee distinto cuando ya se sabe qué incluye y antes de la prueba social. -->
    <seccion-precio
      v-if="mostrar_precio"
      :cta_url="cta_url"
      :emitir_evento="emitir_evento"
    />

    <seccion-resenas />

    <seccion-testimonios :emitir_evento="emitir_evento" />

    <!-- El cierre: el CTA, dentro del mismo fondo sticky que usaba el puente al formulario.
         `boton_avance` apagado: es la última sección y el chevron no tendría a dónde ir. -->
    <fondo-seccion-sticky variante="puente" :boton_avance="false" v-slot="{ progreso }">
      <cta-demo :cta_url="cta_url" :progreso="progreso" :emitir_evento="emitir_evento" />
    </fondo-seccion-sticky>
  </section>
</template>

<script>
import FondoSeccionSticky from './FondoSeccionSticky.vue'
import HeroVideo from './HeroVideo.vue'
import SeccionClientes from './SeccionClientes.vue'
import SeccionNuevaEra from './SeccionNuevaEra.vue'
import SeccionAgentesIa from './SeccionAgentesIa.vue'
import SeccionPosicionamiento from './SeccionPosicionamiento.vue'
import SeccionImplementacion from './SeccionImplementacion.vue'
import SeccionPrecio from './SeccionPrecio.vue'
import SeccionResenas from './SeccionResenas.vue'
import SeccionTestimonios from './SeccionTestimonios.vue'
import CtaDemo from './CtaDemo.vue'
import { MOSTRAR_PRECIO } from '@/config'

/**
 * Copy de la apertura, transcripto de contexto/demo_pagina.md §1 (versión dueño) del repo
 * claude-comerciocity. No parafrasear acá: cualquier cambio de texto se hace allá.
 */
const CONTENIDO = {
  apertura: {
    titulo: 'Tu negocio funciona porque vos te acordás.',
    subtitulo: 'Y eso tiene un límite.',
  },
}

/* Tramos de la coreografía de la apertura, en unidades de progreso [0,1] de su sección:
   la apertura no tiene entrada por scroll (entra con su animación de carga) y sale entre
   SALIDA_INICIO y 1. Mismos números que la página de experiencia. */
const SALIDA_INICIO = 0.72
const DESFASE_PIEZA = 0.075
const SALIDA_Y = -48
/* La salida no llega a 0: un bloque que se va del todo deja un hueco en medio del recorrido. */
const SALIDA_OPACIDAD = 0.35

/**
 * La curva de toda la página: 1 - (1-t)³. Dos curvas distintas en la misma página se notan.
 *
 * @param {number} t
 * @returns {number}
 */
function ease_out(t) {
  return 1 - Math.pow(1 - t, 3)
}

export default {
  name: 'Recorrido',

  components: {
    FondoSeccionSticky,
    HeroVideo,
    SeccionClientes,
    SeccionNuevaEra,
    SeccionAgentesIa,
    SeccionPosicionamiento,
    SeccionImplementacion,
    SeccionPrecio,
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
  },

  data() {
    return {
      /** true si el sistema operativo pide reduced-motion. Resuelto antes del primer render. */
      reduced_motion: !!(
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ),
      /**
       * false hasta que la entrada de carga de la apertura TERMINÓ de correr. Lo decide el
       * TIEMPO (animationend), nunca el scroll: una condición de scroll acá dejaba la
       * entrada a merced del primer píxel de scroll y el titular "simplemente aparecía".
       */
      apertura_entrada_terminada: false,
      /** false hasta que la apertura entró al viewport por primera vez. */
      apertura_vista: false,
      observador_secciones: null,
      observador_apertura: null,
    }
  },

  computed: {
    /** @returns {object} */
    contenido() {
      return CONTENIDO
    },

    /**
     * Interruptor del bloque de precio. Se resuelve en tiempo de build (Vite reemplaza la
     * variable por su valor), así que no cambia en vivo: para prenderlo hay que buildear de
     * nuevo con `VITE_MOSTRAR_PRECIO=1`.
     *
     * @returns {boolean}
     */
    mostrar_precio() {
      return MOSTRAR_PRECIO
    },
  },

  mounted() {
    this.observar_secciones()
  },

  beforeUnmount() {
    if (this.observador_secciones) {
      this.observador_secciones.disconnect()
      this.observador_secciones = null
    }
    if (this.observador_apertura) {
      this.observador_apertura.disconnect()
      this.observador_apertura = null
    }
  },

  methods: {
    /**
     * Reporta qué secciones vio el visitante (una vez por sección) y dispara la entrada de
     * la apertura cuando entra en pantalla. Los componentes no se enteran: se observan sus
     * nodos raíz desde afuera.
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
        ['.demo-clientes', 'clientes'],
        ['.demo-nueva-era', 'nueva_era'],
        ['.demo-agentes', 'agentes_ia'],
        ['.demo-posicionamiento', 'posicionamiento'],
        ['.demo-implementacion', 'implementacion'],
        /* Solo existe si el bloque de precio está prendido; `querySelector` devuelve null y
           el forEach de abajo lo saltea. */
        ['.demo-precio', 'precio'],
        ['.demo-resenas', 'resenas'],
        ['.demo-testimonios', 'testimonios'],
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
      const apertura = raiz && raiz.querySelector('.demo-scroll-dolor__apertura')
      if (apertura) {
        self.observador_apertura = new IntersectionObserver(
          function (entradas) {
            if (!entradas[entradas.length - 1].isIntersecting) {
              return
            }
            self.observador_apertura.disconnect()
            self.observador_apertura = null
            self.apertura_vista = true
            self.red_de_seguridad_apertura()
          },
          { threshold: 0.15 },
        )
        self.observador_apertura.observe(apertura)
      }

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
     * secciones altas. `.demo-clientes` mide 380vh (la pared de logos con su pin): su razón
     * de intersección no puede pasar de 0,26 por más que ocupe la pantalla entera, así que
     * nunca llegaba al umbral y NUNCA emitió su evento -- medido en 1366x768. Con el píxel
     * conectado eso sería un `ViewContent` menos, en silencio y para siempre.
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
     * Si la entrada de la apertura no llegó a existir como animación (reduced-motion), la da
     * por terminada a mano; si no, la apertura quedaría clavada en su estado de carga.
     *
     * @returns {void}
     */
    red_de_seguridad_apertura() {
      const self = this
      this.$nextTick(function () {
        const cierre = self.$refs.apertura_cierre
        if (!cierre || !cierre.getAnimations || cierre.getAnimations().length === 0) {
          self.apertura_entrada_terminada = true
        }
      })
    },

    /**
     * @param {number} p
     * @param {number} inicio
     * @param {number} fin
     * @returns {number}
     */
    normalizar(p, inicio, fin) {
      if (p <= inicio) {
        return 0
      }
      if (p >= fin) {
        return 1
      }
      return (p - inicio) / (fin - inicio)
    },

    /**
     * Estilo de la apertura: sin tramo de entrada (la hace la animación de carga), con la
     * salida que al subir se recorre al revés y hace que el titular "vuelva a entrar".
     *
     * @param {number} p
     * @param {number} orden 0 titular, 1 subtítulo, 2 la línea de "qué es".
     * @returns {object}
     */
    estilo_apertura(p, orden) {
      if (this.reduced_motion) {
        return {}
      }

      const desfase = (orden || 0) * DESFASE_PIEZA
      const salida = ease_out(this.normalizar(p, SALIDA_INICIO + desfase, 1))

      return {
        opacity: String(1 - salida * (1 - SALIDA_OPACIDAD)),
        transform: 'translateY(' + salida * SALIDA_Y + 'px)',
      }
    },

    /** @returns {void} */
    on_entrada_apertura_terminada() {
      this.apertura_entrada_terminada = true
    },
  },
}
</script>

<style scoped>
/* Sin gap entre secciones: cada una trae su propio fondo dentro de su pin, y cualquier
   aire acá quedaría sin fondo detrás. */
.demo-scroll-dolor {
  max-width: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.demo-scroll-dolor__apertura {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: clamp(24px, 4vh, 48px);
}

.demo-scroll-dolor__apertura-titulo {
  font-size: clamp(2rem, 5vw, 3.25rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.02em;
  max-width: 780px;
  margin: 0;
  padding: 0 20px;
  will-change: opacity, transform;
}

.demo-scroll-dolor__apertura-subtitulo {
  font-size: clamp(1.1rem, 2.4vw, 1.4rem);
  color: var(--demo-color-texto-suave);
  margin: 0;
  max-width: 620px;
  padding: 0 20px;
  will-change: opacity, transform;
}

/* "Sistema de gestión, tienda online y asistente por WhatsApp. Te lo entregamos andando."
   Un escalón por debajo del subtítulo en tamaño: el titular sigue mandando, esta línea
   informa. El <strong> es la bandera del posicionamiento y va con el azul de marca. */
.demo-scroll-dolor__apertura-cierre {
  font-size: clamp(1rem, 2vw, 1.2rem);
  color: var(--demo-color-texto-suave);
  margin: 0;
  max-width: 660px;
  padding: 0 20px;
  line-height: 1.45;
  text-wrap: balance;
  will-change: opacity, transform;
}

.demo-scroll-dolor__apertura-cierre strong {
  color: var(--demo-color-texto);
  font-weight: 700;
}

/* La animación de carga de la apertura: zoom del titular (2 s) y rebote del subtítulo
   (0,9 s, a 1,5 s del arranque). El subtítulo es el último en terminar, y de su
   animationend cuelga el retiro de la clase --carga. */
.demo-scroll-dolor__apertura--carga .demo-scroll-dolor__apertura-titulo {
  animation: demo-apertura-zoom 2s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.demo-scroll-dolor__apertura--carga .demo-scroll-dolor__apertura-subtitulo {
  animation: demo-apertura-bounce 0.9s cubic-bezier(0.16, 1, 0.3, 1) 1.5s both;
}

/* Medio segundo después del subtítulo, y es la última: de su animationend cuelga el retiro
   de la clase --carga. */
.demo-scroll-dolor__apertura--carga .demo-scroll-dolor__apertura-cierre {
  animation: demo-apertura-bounce 0.9s cubic-bezier(0.16, 1, 0.3, 1) 2s both;
}

/* Retenida hasta que se ve. El !important no es prolijidad: los tres elementos llevan un
   estilo inline por progreso, y un inline le gana a cualquier selector. */
.demo-scroll-dolor__apertura--espera .demo-scroll-dolor__apertura-titulo,
.demo-scroll-dolor__apertura--espera .demo-scroll-dolor__apertura-subtitulo,
.demo-scroll-dolor__apertura--espera .demo-scroll-dolor__apertura-cierre {
  opacity: 0 !important;
}

@media (max-width: 767.98px) {
  .demo-scroll-dolor__apertura {
    gap: clamp(30px, 5vh, 52px);
  }

  .demo-scroll-dolor__apertura-titulo {
    font-size: clamp(2.15rem, 9.8vw, 2.55rem);
  }

  .demo-scroll-dolor__apertura-subtitulo {
    font-size: clamp(1.2rem, 5vw, 1.4rem);
  }

  .demo-scroll-dolor__apertura-cierre {
    font-size: clamp(1rem, 4.2vw, 1.15rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .demo-scroll-dolor__apertura-titulo,
  .demo-scroll-dolor__apertura-subtitulo,
  .demo-scroll-dolor__apertura-cierre {
    animation: none;
    opacity: 1;
    transform: none;
    filter: none;
  }
}
</style>
