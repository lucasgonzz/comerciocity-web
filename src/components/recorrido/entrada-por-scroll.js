/**
 * Mixin: entrada por progreso de scroll para una sección EN FLUJO (sin pin).
 *
 * Es la misma mecánica que SeccionNuevaEra.vue y SeccionResenas.vue traen escrita adentro,
 * sacada a un módulo para las secciones nuevas de la web (4/10/2026): cada grupo de la
 * sección tiene un progreso [0,1] que vale 0 mientras su borde superior está por debajo del
 * 85 % del viewport y 1 medio viewport más arriba; ese progreso se escribe como `--p` en el
 * grupo y cada renglón con la clase `demo-paso` entra según `--p` menos su propia demora
 * `--d` (escalonado), con la cuenta hecha en CSS. La reversa al subir sale gratis porque
 * todo es función pura del progreso: nada de IntersectionObserver de una sola vía.
 *
 * El progreso crudo del rect se persigue con amortiguación exponencial en un bucle de rAF
 * que corta solo cuando llega: una rueda de mouse en Windows entrega escalones de ~100 px y
 * sin amortiguar la entrada aparece a saltos.
 *
 * CÓMO SE USA. El componente declara `grupos()` devolviendo un mapa { clave: Element } (en
 * general desde `$refs`) y escribe `:style="estilo_grupo('clave')"` en cada grupo. Los
 * renglones llevan `class="demo-paso"`. Bajo prefers-reduced-motion todo queda visible y
 * quieto: no hay bucle ni listeners.
 */

/** Dónde arranca la aparición de un grupo, en fracción del alto del viewport. */
const ARRANQUE = 0.85
/** Cuánto scroll (en fracción de viewport) tarda un grupo en terminar de entrar. */
const RECORRIDO = 0.45
/** Cuánto se abre el abanico del escalonado dentro de un grupo. */
const ABANICO = 0.5

/**
 * @param {number} valor
 * @returns {number}
 */
function acotar(valor) {
  return valor < 0 ? 0 : valor > 1 ? 1 : valor
}

export default {
  data() {
    return {
      /** Progreso renderizado por grupo. */
      p_grupos: {},
      /** Progreso crudo por grupo, al que persigue el de arriba. */
      objetivo_grupos: {},
      raf_entrada: null,
      ultimo_ts_entrada: 0,
      scroll_target_entrada: null,
      observador_entrada: null,
      a_la_vista_entrada: false,
      movimiento_reducido:
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    }
  },

  mounted() {
    const grupos = this.grupos ? this.grupos() : {}
    const claves = Object.keys(grupos)

    claves.forEach((clave) => this.escalonar(grupos[clave]))

    if (this.movimiento_reducido || !claves.length) {
      return
    }

    const p = {}
    const o = {}
    claves.forEach((clave) => {
      p[clave] = 0
      o[clave] = 0
    })
    this.p_grupos = p
    this.objetivo_grupos = o

    this.scroll_target_entrada = this.encontrar_ancestro_scroll()
    this.scroll_target_entrada.addEventListener('scroll', this.on_scroll_entrada, { passive: true })
    window.addEventListener('resize', this.on_scroll_entrada, { passive: true })
    document.addEventListener('visibilitychange', this.on_visibilidad_entrada)

    const raiz = this.$refs.seccion || this.$el
    if (typeof IntersectionObserver === 'function' && raiz) {
      this.observador_entrada = new IntersectionObserver(this.on_interseccion_entrada, {
        rootMargin: '15% 0px',
      })
      this.observador_entrada.observe(raiz)
    } else {
      this.a_la_vista_entrada = true
    }

    /* Primer valor sin animar: recargar con el scroll a mitad de página deja el texto
       puesto, no barriendo desde 0. */
    this.calcular_objetivo_entrada()
    this.p_grupos = Object.assign({}, this.objetivo_grupos)
  },

  beforeUnmount() {
    this.cancelar_bucle_entrada()

    if (this.observador_entrada) {
      this.observador_entrada.disconnect()
      this.observador_entrada = null
    }
    if (this.scroll_target_entrada) {
      this.scroll_target_entrada.removeEventListener('scroll', this.on_scroll_entrada)
      this.scroll_target_entrada = null
    }
    window.removeEventListener('resize', this.on_scroll_entrada)
    document.removeEventListener('visibilitychange', this.on_visibilidad_entrada)
  },

  methods: {
    /**
     * @param {string} clave
     * @returns {Object|null}
     */
    estilo_grupo(clave) {
      if (this.movimiento_reducido) {
        return null
      }
      const p = this.p_grupos[clave]
      return { '--p': (typeof p === 'number' ? p : 0).toFixed(4) }
    },

    /**
     * Escribe la demora del escalonado en cada renglón del grupo, una sola vez y directo al
     * DOM: con `:style` entraría al diff de Vue en cada frame del scroll.
     *
     * @param {Element} grupo
     * @returns {void}
     */
    escalonar(grupo) {
      if (!grupo || !grupo.querySelectorAll) {
        return
      }
      const pasos = grupo.querySelectorAll('.demo-paso')
      for (let i = 0; i < pasos.length; i++) {
        const demora = pasos.length > 1 ? (i / (pasos.length - 1)) * ABANICO : 0
        pasos[i].style.setProperty('--d', demora.toFixed(4))
      }
    },

    /**
     * Sube por los ancestros hasta el que realmente scrollea. En esta web es el
     * <main class="sitio-scroller">; si no hay ninguno, cae a `window`.
     *
     * @returns {Window|Element}
     */
    encontrar_ancestro_scroll() {
      const raiz = this.$refs.seccion || this.$el
      let nodo = raiz ? raiz.parentElement : null
      while (nodo && nodo !== document.body) {
        const overflow_y = window.getComputedStyle(nodo).overflowY
        if (overflow_y === 'auto' || overflow_y === 'scroll') {
          return nodo
        }
        nodo = nodo.parentElement
      }
      return window
    },

    on_scroll_entrada() {
      this.arrancar_bucle_entrada()
    },

    /**
     * @param {IntersectionObserverEntry[]} entradas
     */
    on_interseccion_entrada(entradas) {
      this.a_la_vista_entrada = entradas[entradas.length - 1].isIntersecting
      if (this.a_la_vista_entrada && !document.hidden) {
        this.arrancar_bucle_entrada()
      } else {
        this.cancelar_bucle_entrada()
      }
    },

    on_visibilidad_entrada() {
      if (document.hidden) {
        this.cancelar_bucle_entrada()
      } else if (this.a_la_vista_entrada) {
        this.arrancar_bucle_entrada()
      }
    },

    arrancar_bucle_entrada() {
      if (this.raf_entrada !== null || !this.a_la_vista_entrada || document.hidden) {
        return
      }
      this.ultimo_ts_entrada = 0
      this.raf_entrada = window.requestAnimationFrame(this.animar_entrada)
    },

    cancelar_bucle_entrada() {
      if (this.raf_entrada !== null) {
        window.cancelAnimationFrame(this.raf_entrada)
        this.raf_entrada = null
      }
    },

    /**
     * Un frame: recalcula los objetivos, los persigue y corta cuando todos llegaron.
     *
     * @param {number} ts
     */
    animar_entrada(ts) {
      this.raf_entrada = null

      /* Topeado en 100 ms: una pestaña que vuelve del fondo entrega un salto enorme. */
      const delta_ms = this.ultimo_ts_entrada ? Math.min(100, ts - this.ultimo_ts_entrada) : 16.67
      this.ultimo_ts_entrada = ts

      this.calcular_objetivo_entrada()

      /* 0.14 por frame a 60 fps, escalado por el delta real (un monitor de 120 Hz no corre
         la entrada al doble). */
      const factor = 1 - Math.pow(1 - 0.14, delta_ms / 16.67)
      const nuevo = {}
      let llegaron = true

      Object.keys(this.objetivo_grupos).forEach((clave) => {
        const objetivo = this.objetivo_grupos[clave]
        const actual = this.p_grupos[clave] || 0
        const dif = objetivo - actual
        if (Math.abs(dif) < 0.0005) {
          nuevo[clave] = objetivo
        } else {
          nuevo[clave] = actual + dif * factor
          llegaron = false
        }
      })

      this.p_grupos = nuevo

      if (!llegaron) {
        this.raf_entrada = window.requestAnimationFrame(this.animar_entrada)
      }
    },

    calcular_objetivo_entrada() {
      const grupos = this.grupos ? this.grupos() : {}
      const vh = window.innerHeight
      const recorrido = vh * RECORRIDO
      const objetivo = {}

      Object.keys(grupos).forEach((clave) => {
        const grupo = grupos[clave]
        objetivo[clave] = grupo
          ? acotar((vh * ARRANQUE - grupo.getBoundingClientRect().top) / recorrido)
          : 0
      })

      this.objetivo_grupos = objetivo
    },
  },
}
