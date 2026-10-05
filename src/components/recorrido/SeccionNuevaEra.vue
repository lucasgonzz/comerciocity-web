<template>
  <section ref="seccion" class="demo-nueva-era demo-seccion-flujo">
    <div ref="grupo_era" class="demo-nueva-era__grupo" :style="estilo_grupo('era')">
      <h2 class="demo-titulo-seccion demo-paso">Bienvenido a la nueva era.</h2>
      <p class="demo-nueva-era__parrafo demo-paso">
        Esto no es un sistema de gestión, es
        <strong class="demo-nueva-era__remate-inline">la mejor plataforma de Argentina</strong>
        para automatizar tus operaciones diarias.
      </p>
    </div>

    <div
      ref="grupo_implementacion"
      class="demo-nueva-era__grupo demo-nueva-era__grupo--ancho"
      :style="estilo_grupo('implementacion')"
    >
      <p class="demo-nueva-era__parrafo demo-paso">
        Pasar de un sistema a otro
        <strong class="demo-nueva-era__enfasis">no es fácil</strong>,
        <em
          class="demo-nueva-era__tipeo"
          :class="{ 'demo-nueva-era__tipeo--cursor': tipeo_cursor_visible }"
        >{{ tipeo_texto }}</em>:
        todos nuestros clientes venían de un sistema que ya no les permitía crecer.
      </p>
      <p class="demo-nueva-era__resaltado demo-paso">
        Por eso un pilar de nuestro servicio es la implementación personalizada.
      </p>

      <!-- Las cuatro tarjetas de la implementación. Cada una con su color (4/10/2026, pedido
           de Lucas: "dales un poco más de color"): azul y violeta son los dos colores de marca,
           la de las imágenes lleva el naranja -- el acento ÚNICO de la marca, una sola vez en
           toda la grilla -- y la de los desarrollos a medida el degradé de los dos. -->
      <ul class="demo-nueva-era__pilares">
        <li
          v-for="pilar in pilares"
          :key="pilar.icono"
          class="demo-nueva-era__pilar demo-paso"
          :class="'demo-nueva-era__pilar--' + pilar.color"
        >
          <span class="demo-nueva-era__pilar-disco" aria-hidden="true">
            <i class="bi" :class="pilar.icono"></i>
          </span>
          <span class="demo-nueva-era__pilar-cuerpo">
            <span class="demo-nueva-era__pilar-titulo">{{ pilar.titulo }}</span>
            <span class="demo-nueva-era__pilar-texto">{{ pilar.texto }}</span>
          </span>
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
import entrada_por_scroll from './entrada-por-scroll'

/**
 * Los cuatro pilares de la implementación personalizada. El texto de los tres primeros es
 * de Lucas (10/9/2026); el cuarto lo pidió el 4/10/2026: las imágenes de los catálogos y
 * las páginas web de los proveedores, cargadas antes de que el negocio arranque.
 */
const PILARES = [
  {
    color: 'azul',
    icono: 'bi-database-check',
    titulo: 'Migramos tu información',
    texto: 'Pasamos toda tu información y te entregamos el sistema listo para vender.',
  },
  {
    color: 'violeta',
    icono: 'bi-receipt',
    titulo: 'Configuramos ARCA',
    texto: 'Dejamos tus puntos de venta de ARCA conectados para que factures solo lo que querés.',
  },
  {
    color: 'naranja',
    icono: 'bi-images',
    titulo: 'Cargamos las imágenes de tus proveedores',
    texto:
      'Nos encargamos de traer todas las imágenes de los catálogos y las páginas web de tus ' +
      'proveedores, para que tengas cada producto con su foto desde el primer día.',
  },
  {
    color: 'marca',
    icono: 'bi-sliders',
    titulo: 'Desarrollos a tu medida',
    texto: 'Si tu negocio lo requiere, hacemos desarrollos a tu medida.',
  },
]

/** Texto que se revela con efecto de máquina de escribir dentro del segundo párrafo. */
const TEXTO_TIPEADO = 'y lo sabemos'
/** Espera desde que la sección entra en el viewport hasta que arranca el tipeo, en ms. */
const TIPEO_ESPERA_MS = 4000
/** Cuánto tarda en aparecer cada letra, en ms. */
const TIPEO_VELOCIDAD_MS = 55

/**
 * "Bienvenido a la nueva era" + los cuatro pilares de la implementación personalizada.
 *
 * Sección de texto, en el flujo normal: no se pinnea. La entrada de cada renglón es función
 * pura del progreso del grupo (mixin entrada-por-scroll), así que la reversa al subir sale
 * gratis. El tipeo de "y lo sabemos" es la excepción deliberada: un evento que pasa UNA
 * vez, con un IntersectionObserver de una sola vía que se desconecta solo.
 */
export default {
  name: 'SeccionNuevaEra',

  mixins: [entrada_por_scroll],

  data() {
    return {
      tipeo_texto: '',
      tipeo_observador: null,
      tipeo_espera_timeout: null,
      tipeo_intervalo: null,
    }
  },

  computed: {
    /** @returns {Array} */
    pilares() {
      return PILARES
    },

    /**
     * true mientras conviene mostrar el cursor parpadeante: antes de que arranque el tipeo y
     * mientras está en curso. Sin esto queda un hueco entre la coma y los dos puntos.
     *
     * @returns {boolean}
     */
    tipeo_cursor_visible() {
      return this.tipeo_texto !== TEXTO_TIPEADO
    },
  },

  mounted() {
    this.iniciar_tipeo()
  },

  beforeUnmount() {
    if (this.tipeo_observador) {
      this.tipeo_observador.disconnect()
      this.tipeo_observador = null
    }
    if (this.tipeo_espera_timeout !== null) {
      window.clearTimeout(this.tipeo_espera_timeout)
      this.tipeo_espera_timeout = null
    }
    if (this.tipeo_intervalo !== null) {
      window.clearInterval(this.tipeo_intervalo)
      this.tipeo_intervalo = null
    }
  },

  methods: {
    /** Los grupos cuya entrada sigue al scroll (contrato del mixin). */
    grupos() {
      return {
        era: this.$refs.grupo_era,
        implementacion: this.$refs.grupo_implementacion,
      }
    },

    /** @returns {void} */
    iniciar_tipeo() {
      if (this.movimiento_reducido || typeof IntersectionObserver !== 'function') {
        this.tipeo_texto = TEXTO_TIPEADO
        return
      }

      const self = this

      this.tipeo_observador = new IntersectionObserver(function (entradas) {
        if (!entradas[entradas.length - 1].isIntersecting) {
          return
        }
        self.tipeo_espera_timeout = window.setTimeout(function () {
          self.tipeo_espera_timeout = null
          self.tipear()
        }, TIPEO_ESPERA_MS)
        self.tipeo_observador.disconnect()
      })

      this.tipeo_observador.observe(this.$refs.seccion)
    },

    /** @returns {void} */
    tipear() {
      const self = this
      let i = 0

      this.tipeo_intervalo = window.setInterval(function () {
        i++
        self.tipeo_texto = TEXTO_TIPEADO.slice(0, i)
        if (i >= TEXTO_TIPEADO.length) {
          window.clearInterval(self.tipeo_intervalo)
          self.tipeo_intervalo = null
        }
      }, TIPEO_VELOCIDAD_MS)
    },
  },
}
</script>

<style scoped>
.demo-nueva-era__grupo {
  --p: 1;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
}

.demo-nueva-era__grupo + .demo-nueva-era__grupo {
  margin-top: clamp(56px, 9vh, 112px);
  margin-top: clamp(56px, 9dvh, 112px);
}

.demo-nueva-era__grupo--ancho {
  max-width: 1040px;
}

.demo-nueva-era__parrafo {
  margin: clamp(16px, 2.4vw, 26px) 0 0;
  font-size: clamp(1.05rem, 1.6vw, 1.25rem);
  line-height: 1.6;
  color: var(--demo-color-texto-suave);
}

.demo-nueva-era__grupo--ancho .demo-nueva-era__parrafo {
  margin-top: 0;
}

/* Jerarquía tenue y deliberada: cuerpo en suave, remate en el color fuerte. */
.demo-nueva-era__remate-inline {
  font-weight: 600;
  color: var(--demo-color-texto);
}

.demo-nueva-era__enfasis {
  font-weight: 700;
}

.demo-nueva-era__tipeo {
  font-style: italic;
}

.demo-nueva-era__tipeo--cursor::after {
  content: '';
  display: inline-block;
  width: 2px;
  height: 1em;
  margin-left: 1px;
  vertical-align: text-bottom;
  background: currentColor;
  animation: demo-nueva-era-cursor 0.9s step-end infinite;
}

@keyframes demo-nueva-era-cursor {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

.demo-nueva-era__resaltado {
  margin: clamp(14px, 2vw, 20px) 0 0;
  font-size: clamp(1.2rem, 1.9vw, 1.5rem);
  font-weight: 600;
  line-height: 1.35;
  color: var(--demo-color-texto);
}

.demo-nueva-era__pilares {
  list-style: none;
  margin: clamp(28px, 4vw, 44px) 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(12px, 1.6vw, 18px);
}

/* La tarjeta: blanca con un lavado de SU color en la esquina del ícono y un borde apenas
   teñido. El color entra por tres variables que cada modificador define; la tarjeta no sabe
   cuál le tocó. */
.demo-nueva-era__pilar {
  --tinte: 11, 132, 248;
  --disco: var(--demo-color-azul);
  --sombra: rgba(11, 132, 248, 0.3);
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: clamp(16px, 2vw, 22px);
  border: 1px solid rgba(var(--tinte), 0.22);
  border-radius: 16px;
  background:
    radial-gradient(120% 80% at 0% 0%, rgba(var(--tinte), 0.14), transparent 55%),
    var(--demo-color-superficie);
  box-shadow: 0 10px 30px -18px rgba(var(--tinte), 0.45);
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.demo-nueva-era__pilar:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 36px -18px rgba(var(--tinte), 0.6);
}

.demo-nueva-era__pilar--azul {
  --tinte: 11, 132, 248;
  --disco: #0b84f8;
  --sombra: rgba(11, 132, 248, 0.32);
}

.demo-nueva-era__pilar--violeta {
  --tinte: 58, 49, 252;
  --disco: #3a31fc;
  --sombra: rgba(58, 49, 252, 0.32);
}

/* El naranja de marca: una sola tarjeta de las cuatro. No repetirlo. */
.demo-nueva-era__pilar--naranja {
  --tinte: 250, 126, 6;
  --disco: #fa7e06;
  --sombra: rgba(250, 126, 6, 0.32);
}

.demo-nueva-era__pilar--marca {
  --tinte: 34, 90, 250;
  --disco: var(--demo-gradient-marca);
  --sombra: rgba(34, 90, 250, 0.32);
}

.demo-nueva-era__pilar-disco {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 13px;
  background: var(--disco);
  color: #fff;
  font-size: 1.25rem;
  box-shadow: 0 8px 18px -6px var(--sombra);
}

.demo-nueva-era__pilar-cuerpo {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.demo-nueva-era__pilar-titulo {
  font-size: clamp(1.02rem, 1.4vw, 1.12rem);
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.01em;
  color: var(--demo-color-texto);
}

.demo-nueva-era__pilar-texto {
  font-size: clamp(0.95rem, 1.3vw, 1.02rem);
  line-height: 1.5;
  color: var(--demo-color-texto-suave);
}

@media (max-width: 767.98px) {
  .demo-nueva-era__grupo + .demo-nueva-era__grupo {
    margin-top: clamp(40px, 7vh, 80px);
    margin-top: clamp(40px, 7dvh, 80px);
  }

  .demo-nueva-era__pilares {
    margin-top: clamp(20px, 3vw, 32px);
  }
}

/* Tablet y para arriba: dos por fila. Cuatro en una fila quedan angostas y el texto de la
   tercera (el más largo) se vuelve una columna. */
@media (min-width: 768px) {
  .demo-nueva-era__pilares {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .demo-nueva-era__pilar {
    gap: 16px;
    padding: clamp(18px, 2.2vw, 26px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .demo-nueva-era__tipeo--cursor::after {
    animation: none;
    opacity: 0;
  }

  .demo-nueva-era__pilar {
    transition: none;
  }
}
</style>
