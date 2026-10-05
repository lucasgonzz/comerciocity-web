<template>
  <!-- "No es un sistema de facturación. Es otra cosa." -- la sección de posicionamiento de la
       web anterior (PositioningSection.vue), con sus tres tarjetas y su nota al pie, en el
       lenguaje visual de esta página. -->
  <section ref="seccion" class="demo-posicionamiento demo-seccion-flujo">
    <div ref="grupo" class="demo-posicionamiento__grupo" :style="estilo_grupo('grupo')">
      <h2 class="demo-titulo-seccion demo-posicionamiento__titulo demo-paso">
        No es un sistema de facturación. Es otra cosa.
      </h2>

      <ul class="demo-posicionamiento__tarjetas">
        <li
          v-for="tarjeta in tarjetas"
          :key="tarjeta.rotulo"
          class="demo-posicionamiento__tarjeta demo-paso"
          :class="{ 'demo-posicionamiento__tarjeta--nosotros': tarjeta.nosotros }"
        >
          <span class="demo-posicionamiento__rotulo">{{ tarjeta.rotulo }}</span>
          <p class="demo-posicionamiento__texto">{{ tarjeta.texto }}</p>
          <i
            v-if="tarjeta.nosotros"
            class="bi bi-check-circle-fill demo-posicionamiento__tilde"
            aria-hidden="true"
          ></i>
        </li>
      </ul>

      <p class="demo-posicionamiento__pie demo-paso">
        Colppy, Xubio y Contabilium facturan. ComercioCity opera. La diferencia la notás el
        primer día.
      </p>
    </div>
  </section>
</template>

<script>
import entrada_por_scroll from './entrada-por-scroll'

/** El copy de la web anterior, palabra por palabra. */
const TARJETAS = [
  {
    rotulo: 'Lo que usás hoy',
    texto: 'Excel, WhatsApp y papeles. Todo por separado, todo manual.',
    nosotros: false,
  },
  {
    rotulo: 'Lo que te prometieron',
    texto: 'Un sistema que "hace todo" y terminó siendo otra pantalla más.',
    nosotros: false,
  },
  {
    rotulo: 'ComercioCity',
    texto:
      'Una plataforma que opera con vos. Stock, ventas, ecommerce, facturación y agentes de IA ' +
      'conectados sobre la misma información.',
    nosotros: true,
  },
]

export default {
  name: 'SeccionPosicionamiento',

  mixins: [entrada_por_scroll],

  computed: {
    /** @returns {Array} */
    tarjetas() {
      return TARJETAS
    },
  },

  methods: {
    grupos() {
      return { grupo: this.$refs.grupo }
    },
  },
}
</script>

<style scoped>
.demo-posicionamiento__grupo {
  --p: 1;
  width: 100%;
  max-width: 1040px;
  margin: 0 auto;
  text-align: center;
}

.demo-posicionamiento__titulo {
  margin: 0 auto;
  max-width: 760px;
}

.demo-posicionamiento__tarjetas {
  list-style: none;
  margin: clamp(32px, 5vw, 56px) 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(12px, 1.6vw, 20px);
  text-align: left;
}

.demo-posicionamiento__tarjeta {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: clamp(20px, 2.4vw, 30px);
  border: 1px solid var(--demo-color-borde-superficie);
  border-radius: 18px;
  background: var(--demo-color-superficie);
}

.demo-posicionamiento__rotulo {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--demo-color-texto-suave);
}

.demo-posicionamiento__texto {
  margin: 0;
  font-size: clamp(1.05rem, 1.5vw, 1.2rem);
  line-height: 1.5;
  color: var(--demo-color-texto);
}

/* La nuestra: el degradé de marca entero, con el texto en blanco y el tilde naranja como
   único acento de la sección. */
.demo-posicionamiento__tarjeta--nosotros {
  border-color: transparent;
  background: var(--demo-gradient-marca);
  box-shadow: 0 18px 44px -18px rgba(11, 132, 248, 0.55);
}

.demo-posicionamiento__tarjeta--nosotros .demo-posicionamiento__rotulo {
  color: rgba(255, 255, 255, 0.8);
}

.demo-posicionamiento__tarjeta--nosotros .demo-posicionamiento__texto {
  color: #fff;
  font-weight: 600;
}

.demo-posicionamiento__tilde {
  margin-top: auto;
  padding-top: 10px;
  font-size: 1.7rem;
  line-height: 1;
  color: var(--demo-color-naranja);
}

.demo-posicionamiento__pie {
  margin: clamp(22px, 3vw, 32px) auto 0;
  max-width: 640px;
  font-size: clamp(0.95rem, 1.3vw, 1.05rem);
  font-style: italic;
  line-height: 1.5;
  color: var(--demo-color-texto-suave);
}

@media (min-width: 768px) {
  .demo-posicionamiento__tarjetas {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
