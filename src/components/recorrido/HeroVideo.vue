<template>
  <!-- La apertura de la web: el video hero de 12 segundos (marca/video-hero del repo de
       conocimiento), a pantalla completa, mudo y sin bucle. Cuando termina queda FRENADO en
       su último cuadro -- la lista completa de lo que hace la plataforma, con "Conectalo a tu
       IA" entre las flechas --, que es el pedido de Lucas del 4/10/2026.

       Hay dos renders del mismo video: 16:9 para pantallas apaisadas y 9:16 para teléfonos y
       tablets en vertical. Se elige por la orientación del viewport, no por el ancho: un
       tablet vertical recorta demasiado del 16:9 y un teléfono apaisado del 9:16.

       Es una sección de UNA pantalla, en flujo, y un gesto de scroll la deja atrás (mismo
       criterio que la animación del procesador en la página de experiencia): lleva su propio
       marcador de enganche para ser destino del avance guiado. -->
  <section
    ref="seccion"
    class="demo-hero-video"
    :class="{ 'demo-hero-video--terminado': terminado }"
    data-seccion-id="hero.video"
  >
    <div class="demo-fondo-seccion__snap demo-hero-video__ancla" aria-hidden="true"></div>

    <!-- `muted` como ATRIBUTO y como propiedad (ver reproducir()): la política de autoplay
         de iOS y Chrome exige que el video esté mudo en el momento de arrancar, y
         `playsinline` evita que iPhone lo abra a pantalla completa. Sin `loop`: el último
         cuadro se queda. `preload="auto"` porque es lo primero que se ve y pesa 2,5 MB. -->
    <video
      ref="video"
      class="demo-hero-video__video"
      :poster="poster"
      :aria-label="ETIQUETA_ACCESIBLE"
      muted
      playsinline
      autoplay
      preload="auto"
      disablepictureinpicture
      @ended="on_ended"
      @playing="on_playing"
      @error="on_error"
    ></video>

    <!-- Si el navegador no puede reproducir el video (o falló la red), se muestra el cuadro
         final como imagen: la página sigue diciendo lo mismo, sin un rectángulo negro. -->
    <img
      v-if="fallo"
      class="demo-hero-video__cuadro"
      :src="cuadro_final"
      alt=""
      decoding="async"
    />

    <!-- Barra superior: la marca y el único CTA de la página, que es agendar la demo. -->
    <header class="demo-hero-video__barra">
      <a href="/" class="demo-hero-video__marca" aria-label="ComercioCity, inicio">
        <img :src="logotipo" alt="ComercioCity" class="demo-hero-video__logotipo" />
      </a>
      <a
        class="demo-hero-video__cta"
        :href="cta_url"
        target="_blank"
        rel="noopener noreferrer"
        @click="emitir_evento('cta_demo_tocado', { desde: 'hero' })"
      >
        <i class="bi bi-whatsapp" aria-hidden="true"></i>
        <span>Agendá tu demo</span>
      </a>
    </header>

    <!-- Autoplay bloqueado (ahorro de batería, datos reducidos): un play grande sobre el
         póster. Es un botón de verdad para que se pueda tocar y tabular. -->
    <button
      v-if="bloqueado"
      type="button"
      class="demo-hero-video__play"
      aria-label="Reproducir el video"
      @click="reproducir"
    >
      <i class="bi bi-play-fill" aria-hidden="true"></i>
    </button>

    <!-- Al terminar, un botón discreto para verlo de nuevo. Abajo a la derecha para no
         pisar la lista del cuadro final. -->
    <button
      v-if="terminado && !fallo"
      type="button"
      class="demo-hero-video__replay"
      aria-label="Ver el video de nuevo"
      title="Ver de nuevo"
      @click="repetir"
    >
      <i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
    </button>

    <!-- El mismo chevron que FondoSeccionSticky dibuja en las secciones pinneadas. Esta
         sección no pasa por ese componente, así que lo trae ella; entra por el MISMO avance
         guiado (cerrojo y cola incluidos). -->
    <button
      v-if="avance_guiado && queda_siguiente"
      type="button"
      class="demo-hero-video__avance"
      aria-label="Ir a la siguiente sección"
      @click="avanzar"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
        <path
          d="M6 9.5 12 15.5 18 9.5"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </section>
</template>

<script>
import LOGOTIPO from '../../assets/marca/logotipo-comerciocity-oscuro.png'
import POSTER_16X9 from '../../assets/hero/poster-16x9.webp'
import POSTER_9X16 from '../../assets/hero/poster-9x16.webp'
import FINAL_16X9 from '../../assets/hero/final-16x9.webp'
import FINAL_9X16 from '../../assets/hero/final-9x16.webp'

/**
 * Los dos renders del video, en el bucket público de R2 (ver marca/video-hero/prompt-hero.md
 * en el repo de conocimiento: 12,4 s, 60 cps, H.264, sin pista de audio). El sufijo `-v1`
 * es la versión: Cloudflare cachea en el borde por nombre de archivo, así que una versión
 * nueva del video se sube con OTRO nombre y se cambia acá, nunca pisando el mismo.
 */
const VIDEOS = {
  '16x9': 'https://videos.comerciocity.store/hero-comerciocity-16x9-v1.mp4',
  '9x16': 'https://videos.comerciocity.store/hero-comerciocity-9x16-v1.mp4',
}

const POSTERS = { '16x9': POSTER_16X9, '9x16': POSTER_9X16 }
const FINALES = { '16x9': FINAL_16X9, '9x16': FINAL_9X16 }

/** El texto que un lector de pantalla recibe en lugar del video. Es lo que el video dice. */
const ETIQUETA_ACCESIBLE =
  'Sacá tu negocio de tu cabeza. ComercioCity: una sola plataforma con gestión, e-commerce ' +
  'y agentes. Stock al instante, precios actualizados, cuentas claras, pedidos online, ' +
  'facturas en un clic, fotos con IA, tu agente en WhatsApp, conectalo a tu IA. Todo bajo tu mirada.'

/**
 * Qué render corresponde a este viewport. Vertical (más alto que ancho) usa el 9:16; todo
 * lo demás, el 16:9. Se decide con una media query y no con el user agent: un teléfono
 * apaisado es apaisado.
 *
 * @returns {string} '16x9' | '9x16'
 */
function formato_para_viewport() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return '16x9'
  }
  return window.matchMedia('(orientation: portrait)').matches ? '9x16' : '16x9'
}

export default {
  name: 'HeroVideo',

  props: {
    /** URL del CTA (WhatsApp con el texto prearmado). La arma Recorrido.vue. */
    cta_url: {
      type: String,
      required: true,
    },
    /** Tracking centralizado: emitir_evento(nombre, payload). */
    emitir_evento: {
      type: Function,
      default: function () {},
    },
  },

  inject: {
    avance_guiado: {
      default: null,
    },
  },

  data() {
    return {
      ETIQUETA_ACCESIBLE,
      logotipo: LOGOTIPO,
      formato: formato_para_viewport(),
      /** true desde que el video terminó (y hasta que se repite). */
      terminado: false,
      /** true si play() fue rechazado: se muestra el botón de reproducir. */
      bloqueado: false,
      /** true si el video no se pudo cargar: se muestra el cuadro final como imagen. */
      fallo: false,
      /** true si hay una sección más abajo (para mostrar el chevron). */
      queda_siguiente: false,
      media_orientacion: null,
      observador: null,
      /** true mientras la sección toca el viewport: fuera de la vista el video se pausa. */
      a_la_vista: true,
    }
  },

  computed: {
    /** @returns {string} */
    poster() {
      return POSTERS[this.formato]
    },

    /** @returns {string} */
    cuadro_final() {
      return FINALES[this.formato]
    },
  },

  mounted() {
    this.cargar_formato(this.formato)

    if (typeof window.matchMedia === 'function') {
      this.media_orientacion = window.matchMedia('(orientation: portrait)')
      if (typeof this.media_orientacion.addEventListener === 'function') {
        this.media_orientacion.addEventListener('change', this.on_orientacion)
      }
    }

    /* Pausar fuera de la vista: un video de 60 cps corriendo detrás de otra sección es
       batería gastada en nada. Al volver, si no había terminado, sigue. */
    if (typeof IntersectionObserver === 'function') {
      this.observador = new IntersectionObserver(this.on_interseccion, { threshold: 0.2 })
      this.observador.observe(this.$refs.seccion)
    }

    /* El chevron: el controlador existe desde antes de que esta sección se monte
       (Home.vue lo crea antes de renderizar el recorrido), pero las secciones de abajo
       todavía no están en el DOM en este instante. Se pregunta en el tick siguiente. */
    const self = this
    this.$nextTick(function () {
      self.revisar_siguiente()
    })
  },

  beforeUnmount() {
    if (this.media_orientacion && typeof this.media_orientacion.removeEventListener === 'function') {
      this.media_orientacion.removeEventListener('change', this.on_orientacion)
    }
    if (this.observador) {
      this.observador.disconnect()
      this.observador = null
    }
    const video = this.$refs.video
    if (video) {
      video.pause()
      video.removeAttribute('src')
      video.load()
    }
  },

  methods: {
    /**
     * Pone el render del formato pedido y lo arranca desde el principio.
     *
     * @param {string} formato '16x9' | '9x16'
     * @returns {void}
     */
    cargar_formato(formato) {
      const video = this.$refs.video
      if (!video) {
        return
      }
      this.formato = formato
      this.terminado = false
      this.fallo = false
      video.src = VIDEOS[formato]
      video.load()
      this.reproducir()
    },

    /**
     * Arranca el video. `muted` también por propiedad: con el atributo alcanza en el HTML
     * inicial, pero después de un `load()` conviene reafirmarlo antes de pedir play().
     *
     * @returns {void}
     */
    reproducir() {
      const video = this.$refs.video
      if (!video) {
        return
      }
      video.muted = true
      const self = this
      const promesa = video.play()
      if (promesa && typeof promesa.catch === 'function') {
        promesa
          .then(function () {
            self.bloqueado = false
          })
          .catch(function () {
            /* Autoplay rechazado: el póster queda a la vista y se ofrece el play. */
            self.bloqueado = true
          })
      }
    },

    /** @returns {void} */
    repetir() {
      const video = this.$refs.video
      if (!video) {
        return
      }
      this.terminado = false
      video.currentTime = 0
      this.reproducir()
    },

    /** @returns {void} */
    on_playing() {
      this.bloqueado = false
    },

    /** @returns {void} */
    on_ended() {
      /* Sin `loop` el navegador ya deja el último cuadro. Se marca el estado para mostrar
         el botón de repetir y nada más: ningún overlay encima de la lista. */
      this.terminado = true
      this.emitir_evento('hero_video_terminado', { formato: this.formato })
    },

    /** @returns {void} */
    on_error() {
      /* Un error de carga antes de tener cuadros: se muestra el cuadro final fijo. Si el
         video ya venía andando (error de red a mitad), se deja lo que haya. */
      const video = this.$refs.video
      if (!video || video.readyState < 2) {
        this.fallo = true
        this.bloqueado = false
      }
    },

    /** @returns {void} */
    on_orientacion() {
      const nuevo = formato_para_viewport()
      if (nuevo !== this.formato) {
        this.cargar_formato(nuevo)
      }
    },

    /**
     * @param {IntersectionObserverEntry[]} entradas
     * @returns {void}
     */
    on_interseccion(entradas) {
      this.a_la_vista = entradas[entradas.length - 1].isIntersecting
      const video = this.$refs.video
      if (!video) {
        return
      }
      if (!this.a_la_vista) {
        if (!video.paused && !video.ended) {
          video.pause()
        }
        return
      }
      if (video.paused && !video.ended && !this.bloqueado && !this.fallo) {
        this.reproducir()
      }
      this.revisar_siguiente()
    },

    /** @returns {void} */
    revisar_siguiente() {
      this.queda_siguiente = !!(this.avance_guiado && this.avance_guiado.hay_siguiente())
    },

    /** @returns {void} */
    avanzar() {
      if (this.avance_guiado) {
        this.avance_guiado.avanzar(1)
      }
    },
  },
}
</script>

<style scoped>
.demo-hero-video {
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100svh;
  /* `clip` y NO `hidden`, y no es cosmético: overflow: hidden convierte a esta sección en
     un scroll container, y entonces el marcador de enganche de abajo (.demo-hero-video__ancla)
     pasa a pertenecer a ESTE contenedor y no al scroller de la página -- el hero deja de tener
     punto de snap y Chrome, al cargar, se va solo hasta el primer punto que encuentra, que es
     la apertura (medido el 4/10/2026: scrollTop 0 -> 1002 en el primer segundo, sin que nadie
     scrolleara). `clip` recorta igual sin crear scroll container. */
  overflow: clip;
  /* El fondo del propio video (el degradé claro del render), para que mientras carga no
     haya un corte entre la sección y el póster. */
  background: #f3f5fb;
}

/* El marcador de enganche del avance guiado, mismo estilo que el de FondoSeccionSticky
   (que es scoped y no alcanza acá). */
.demo-hero-video__ancla {
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 1px;
  pointer-events: none;
  scroll-snap-align: start;
}

.demo-hero-video__video,
.demo-hero-video__cuadro {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

/* La barra: marca a la izquierda, CTA a la derecha. Sin fondo propio: el video es claro y
   la lectura ya está garantizada (wordmark oscuro, botón de marca). */
.demo-hero-video__barra {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: clamp(14px, 2.2vh, 24px) clamp(16px, 3vw, 36px);
}

.demo-hero-video__marca {
  display: inline-flex;
  align-items: center;
  line-height: 0;
}

.demo-hero-video__logotipo {
  height: clamp(26px, 3.2vh, 34px);
  width: auto;
}

/* El CTA chico de la barra: píldora con el degradé de marca. */
.demo-hero-video__cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 10px 18px;
  border-radius: 999px;
  background: var(--demo-gradient-marca);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  box-shadow: 0 8px 22px rgba(11, 132, 248, 0.22);
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.demo-hero-video__cta:hover {
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(11, 132, 248, 0.3);
}

.demo-hero-video__cta:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px #fff, 0 0 0 6px var(--demo-color-azul);
}

.demo-hero-video__cta .bi {
  font-size: 1.15em;
}

/* Play grande cuando el autoplay fue rechazado. */
.demo-hero-video__play {
  position: absolute;
  z-index: 2;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 84px;
  height: 84px;
  border: 0;
  border-radius: 50%;
  background: var(--demo-gradient-marca);
  color: #fff;
  font-size: 2.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 6px;
  cursor: pointer;
  box-shadow: 0 16px 40px rgba(11, 132, 248, 0.3);
}

/* Repetir: chico, abajo a la derecha, en el tono suave. No compite con la lista. */
.demo-hero-video__replay {
  position: absolute;
  z-index: 2;
  right: clamp(16px, 3vw, 36px);
  bottom: clamp(20px, 4vh, 40px);
  width: 40px;
  height: 40px;
  border: 1px solid rgba(86, 96, 120, 0.28);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.55);
  color: #566078;
  font-size: 1.05rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.demo-hero-video__replay:hover,
.demo-hero-video__replay:focus-visible {
  outline: none;
  color: #1c2333;
  border-color: rgba(86, 96, 120, 0.55);
}

/* El chevron de avance: calcado del de FondoSeccionSticky. */
.demo-hero-video__avance {
  position: absolute;
  z-index: 2;
  left: 50%;
  bottom: clamp(20px, 4vh, 40px);
  transform: translateX(-50%);
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid rgba(86, 96, 120, 0.28);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.42);
  color: #566078;
  cursor: pointer;
  animation: demo-latido-avance 2s ease-in-out infinite;
  transition: opacity 0.2s ease, border-color 0.2s ease;
}

.demo-hero-video__avance:hover {
  animation: none;
  opacity: 1;
  border-color: rgba(86, 96, 120, 0.55);
}

.demo-hero-video__avance:focus-visible {
  animation: none;
  opacity: 1;
  outline: none;
  box-shadow: 0 0 0 3px rgba(11, 132, 248, 0.35);
}

@media (max-width: 767.98px) {
  .demo-hero-video__cta span {
    font-size: 0.9rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .demo-hero-video__avance {
    animation: none;
    opacity: 1;
  }
}
</style>
