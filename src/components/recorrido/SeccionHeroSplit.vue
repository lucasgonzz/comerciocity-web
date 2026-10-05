<template>
  <!-- La pantalla partida de la web anterior de comerciocity.com (HeroSection.vue, hasta el
       4/10/2026): a la izquierda "Profesionalizá tu negocio. Sin vueltas." sobre azul
       noche, a la derecha el carrusel de tres pantallas del sistema. Lucas pidió traerla tal
       cual a esta página, después de "Bienvenido a la nueva era". -->
  <section ref="seccion" class="demo-hero-split demo-seccion-flujo">
    <div class="demo-hero-split__izquierda">
      <div ref="grupo" class="demo-hero-split__texto" :style="estilo_grupo('texto')">
        <span class="demo-hero-split__insignia demo-paso">Plataforma de operación comercial</span>
        <h2 class="demo-hero-split__titulo demo-paso">Profesionalizá tu negocio. Sin vueltas.</h2>
        <p class="demo-hero-split__bajada demo-paso">
          Stock, ventas, ecommerce y facturación, todo conectado en tiempo real. Para
          distribuidoras y comercios argentinos.
        </p>
        <a
          class="demo-boton-marca demo-paso"
          :href="cta_url"
          target="_blank"
          rel="noopener noreferrer"
          @click="emitir_evento('cta_demo_tocado', { desde: 'hero_split' })"
        >
          <i class="bi bi-whatsapp" aria-hidden="true"></i>
          <span>Agendá tu demo</span>
        </a>
      </div>
    </div>

    <div class="demo-hero-split__derecha">
      <div class="demo-hero-split__carrusel" aria-roledescription="carrusel" aria-label="Pantallas del sistema">
        <img
          v-for="(imagen, i) in imagenes"
          :key="imagen.src"
          :src="imagen.src"
          :alt="imagen.alt"
          class="demo-hero-split__imagen"
          :class="{ 'demo-hero-split__imagen--activa': activa === i }"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div class="demo-hero-split__indicadores" role="tablist" aria-label="Elegir pantalla">
        <button
          v-for="(imagen, i) in imagenes"
          :key="'i' + i"
          type="button"
          class="demo-hero-split__indicador"
          :class="{ 'demo-hero-split__indicador--activo': activa === i }"
          role="tab"
          :aria-selected="activa === i ? 'true' : 'false'"
          :aria-label="imagen.alt"
          @click="ir_a(i)"
        ></button>
      </div>
    </div>
  </section>
</template>

<script>
import entrada_por_scroll from './entrada-por-scroll'
import NOTEBOOK_SISTEMA from '../../assets/hero/notebook-sistema.webp'
import NOTEBOOK_ECOMMERCE from '../../assets/hero/notebook-ecommerce.webp'
import TELEFONO from '../../assets/hero/telefono.webp'

/** Cada cuánto cambia la imagen, en ms. */
const INTERVALO_MS = 4500

const IMAGENES = [
  { src: NOTEBOOK_SISTEMA, alt: 'El sistema de gestión en una notebook' },
  { src: NOTEBOOK_ECOMMERCE, alt: 'La tienda online en una notebook' },
  { src: TELEFONO, alt: 'El sistema en el teléfono' },
]

export default {
  name: 'SeccionHeroSplit',

  mixins: [entrada_por_scroll],

  props: {
    cta_url: {
      type: String,
      required: true,
    },
    emitir_evento: {
      type: Function,
      default: function () {},
    },
  },

  data() {
    return {
      activa: 0,
      timer: null,
      observador_carrusel: null,
      carrusel_a_la_vista: false,
    }
  },

  computed: {
    /** @returns {Array} */
    imagenes() {
      return IMAGENES
    },
  },

  mounted() {
    /* El carrusel gira solo mientras la sección está a la vista: fuera de pantalla un
       setInterval cambiando imágenes que nadie ve es trabajo tirado. */
    if (typeof IntersectionObserver === 'function') {
      const self = this
      this.observador_carrusel = new IntersectionObserver(
        function (entradas) {
          self.carrusel_a_la_vista = entradas[entradas.length - 1].isIntersecting
          if (self.carrusel_a_la_vista) {
            self.arrancar()
          } else {
            self.frenar()
          }
        },
        { threshold: 0.3 },
      )
      this.observador_carrusel.observe(this.$refs.seccion)
    } else {
      this.arrancar()
    }
  },

  beforeUnmount() {
    this.frenar()
    if (this.observador_carrusel) {
      this.observador_carrusel.disconnect()
      this.observador_carrusel = null
    }
  },

  methods: {
    /** Los grupos cuya entrada sigue al scroll (contrato del mixin). */
    grupos() {
      return { texto: this.$refs.grupo }
    },

    /** @returns {void} */
    arrancar() {
      this.frenar()
      if (this.movimiento_reducido || IMAGENES.length < 2) {
        return
      }
      const self = this
      this.timer = window.setInterval(function () {
        self.activa = (self.activa + 1) % IMAGENES.length
      }, INTERVALO_MS)
    },

    /** @returns {void} */
    frenar() {
      if (this.timer !== null) {
        window.clearInterval(this.timer)
        this.timer = null
      }
    },

    /**
     * @param {number} i
     * @returns {void}
     */
    ir_a(i) {
      this.activa = i
      if (this.carrusel_a_la_vista) {
        this.arrancar()
      }
    },
  },
}
</script>

<style scoped>
/* Full-bleed: esta sección no respeta el padding de .demo-seccion-flujo porque sus dos
   mitades pintan hasta el borde. */
.demo-hero-split {
  flex-direction: row;
  align-items: stretch;
  padding: 0;
  overflow: hidden;
}

.demo-hero-split__izquierda {
  flex: 0 0 50%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(40px, 7vh, 80px) clamp(24px, 4vw, 56px);
  /* El azul noche de la web anterior, con las dos manchas de marca de la apertura muy
     bajas: es una pantalla oscura dentro de una página clara, y el contraste es parte del
     momento. */
  background:
    radial-gradient(110% 80% at 15% 10%, rgba(11, 132, 248, 0.28), transparent 60%),
    radial-gradient(90% 70% at 90% 95%, rgba(58, 49, 252, 0.26), transparent 55%),
    #0a1f2e;
  color: #fff;
}

.demo-hero-split__texto {
  --p: 1;
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.demo-hero-split__insignia {
  display: inline-block;
  padding: 0.35rem 0.95rem;
  border: 1px solid rgba(125, 211, 252, 0.35);
  border-radius: 999px;
  background: rgba(11, 132, 248, 0.16);
  color: #9fd5fb;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  margin-bottom: 1.25rem;
}

.demo-hero-split__titulo {
  margin: 0 0 1.1rem;
  font-size: clamp(1.9rem, 3.2vw, 2.9rem);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -0.025em;
  color: #fff;
}

.demo-hero-split__bajada {
  margin: 0 0 1.9rem;
  max-width: 440px;
  font-size: clamp(1rem, 1.3vw, 1.1rem);
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.72);
}

.demo-hero-split__derecha {
  flex: 0 0 50%;
  min-width: 0;
  position: relative;
  overflow: hidden;
  background: #e0f2fe;
}

.demo-hero-split__carrusel {
  position: absolute;
  inset: 0;
}

.demo-hero-split__imagen {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.65s ease;
  pointer-events: none;
}

.demo-hero-split__imagen--activa {
  opacity: 1;
}

.demo-hero-split__indicadores {
  position: absolute;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  z-index: 2;
}

/* Los indicadores miden 8 px pero el área de toque son 24: el pulgar no tiene que apuntar. */
.demo-hero-split__indicador {
  position: relative;
  width: 24px;
  height: 24px;
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
}

.demo-hero-split__indicador::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.25);
  transform: translate(-50%, -50%);
  transition: background-color 0.25s, transform 0.25s;
}

.demo-hero-split__indicador--activo::before {
  background: var(--demo-color-azul);
  transform: translate(-50%, -50%) scale(1.4);
}

.demo-hero-split__indicador:focus-visible {
  outline: none;
}

.demo-hero-split__indicador:focus-visible::before {
  box-shadow: 0 0 0 3px rgba(11, 132, 248, 0.35);
}

/* Teléfono y tablet vertical: apilado, texto primero y el carrusel cuadrado debajo. La
   sección pasa a medir más que una pantalla y el avance guiado la deja recorrer con el
   scroll nativo (ver hay_contenido_sin_ver en avance-guiado.js). */
@media (max-width: 991.98px) {
  .demo-hero-split {
    flex-direction: column;
    min-height: 0;
  }

  .demo-hero-split__izquierda {
    flex: none;
    width: 100%;
    min-height: 100svh;
    padding: clamp(48px, 10vh, 96px) clamp(20px, 5vw, 40px);
  }

  .demo-hero-split__derecha {
    flex: none;
    width: 100%;
    aspect-ratio: 1 / 1;
    max-height: 80vh;
  }

  .demo-boton-marca {
    width: 100%;
    max-width: 360px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .demo-hero-split__imagen {
    transition: none;
  }
}
</style>
