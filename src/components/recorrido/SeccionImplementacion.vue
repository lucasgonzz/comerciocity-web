<template>
  <!-- "No te dejamos solo." -- los cuatro pasos de la implementación, de la web anterior
       (ImplementationSection.vue), en el lenguaje visual de esta página. -->
  <section ref="seccion" class="demo-implementacion demo-seccion-flujo">
    <div ref="grupo" class="demo-implementacion__grupo" :style="estilo_grupo('grupo')">
      <h2 class="demo-titulo-seccion demo-paso">No te dejamos solo.</h2>
      <p class="demo-bajada-seccion demo-implementacion__bajada demo-paso">
        Nosotros hacemos toda la implementación. Vos empezás a operar desde el día uno.
      </p>

      <ol class="demo-implementacion__pasos">
        <li
          v-for="paso in pasos"
          :key="paso.numero"
          class="demo-implementacion__paso demo-paso"
        >
          <span class="demo-implementacion__numero" aria-hidden="true">{{ paso.numero }}</span>
          <span class="demo-implementacion__cuerpo">
            <span class="demo-implementacion__nombre">{{ paso.nombre }}</span>
            <span class="demo-implementacion__texto">{{ paso.texto }}</span>
          </span>
        </li>
      </ol>

      <p class="demo-implementacion__lema demo-paso">
        No instalamos software. Profesionalizamos negocios.
      </p>

      <a
        class="demo-boton-marca demo-paso"
        :href="cta_url"
        target="_blank"
        rel="noopener noreferrer"
        @click="emitir_evento('cta_demo_tocado', { desde: 'implementacion' })"
      >
        <i class="bi bi-whatsapp" aria-hidden="true"></i>
        <span>Agendá tu demo</span>
      </a>
    </div>
  </section>
</template>

<script>
import entrada_por_scroll from './entrada-por-scroll'

/** Los cuatro pasos, copy de la web anterior. */
const PASOS = [
  { numero: '1', nombre: 'Demo', texto: 'Ves la plataforma funcionando con datos reales. Sin compromisos.' },
  { numero: '2', nombre: 'Migración', texto: 'Pasamos toda tu información al sistema desde Excel u otro sistema.' },
  { numero: '3', nombre: 'Configuración', texto: 'Dejamos todo listo para tu negocio: artículos, precios, depósitos, ARCA.' },
  { numero: '4', nombre: 'Operación', texto: 'Empezás a trabajar. Soporte real de lunes a sábado si lo necesitás.' },
]

export default {
  name: 'SeccionImplementacion',

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

  computed: {
    /** @returns {Array} */
    pasos() {
      return PASOS
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
.demo-implementacion__grupo {
  --p: 1;
  width: 100%;
  max-width: 1040px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.demo-implementacion__bajada {
  max-width: 560px;
}

/* En teléfono, una línea de tiempo vertical: el número a la izquierda, unido al siguiente
   por un trazo. */
.demo-implementacion__pasos {
  list-style: none;
  margin: clamp(32px, 5vw, 56px) 0 0;
  padding: 0;
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0;
  text-align: left;
}

.demo-implementacion__paso {
  position: relative;
  display: flex;
  gap: 16px;
  padding-bottom: 26px;
}

.demo-implementacion__paso:last-child {
  padding-bottom: 0;
}

/* El trazo entre pasos (vertical en teléfono). */
.demo-implementacion__paso:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 23px;
  top: 48px;
  bottom: 6px;
  width: 2px;
  background: rgba(11, 132, 248, 0.22);
}

.demo-implementacion__numero {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--demo-gradient-marca);
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 8px 20px -8px rgba(11, 132, 248, 0.6);
}

.demo-implementacion__cuerpo {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 10px;
  min-width: 0;
}

.demo-implementacion__nombre {
  font-size: clamp(1.05rem, 1.4vw, 1.15rem);
  font-weight: 700;
  color: var(--demo-color-texto);
}

.demo-implementacion__texto {
  font-size: clamp(0.95rem, 1.3vw, 1.02rem);
  line-height: 1.5;
  color: var(--demo-color-texto-suave);
}

.demo-implementacion__lema {
  margin: clamp(28px, 4vw, 44px) 0 clamp(18px, 2.4vw, 26px);
  font-size: clamp(1.1rem, 1.7vw, 1.3rem);
  font-weight: 600;
  font-style: italic;
  color: var(--demo-color-azul);
}

/* Tablet y escritorio: los cuatro en fila, unidos por una línea horizontal detrás de los
   números. */
@media (min-width: 768px) {
  .demo-implementacion__pasos {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: clamp(12px, 2vw, 24px);
    position: relative;
  }

  .demo-implementacion__pasos::before {
    content: '';
    position: absolute;
    top: 24px;
    left: 12.5%;
    right: 12.5%;
    height: 2px;
    background: rgba(11, 132, 248, 0.22);
  }

  .demo-implementacion__paso {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding-bottom: 0;
    gap: 14px;
  }

  .demo-implementacion__paso:not(:last-child)::after {
    display: none;
  }

  .demo-implementacion__numero {
    position: relative;
    z-index: 1;
  }

  .demo-implementacion__cuerpo {
    padding-top: 0;
    align-items: center;
  }
}

@media (max-width: 767.98px) {
  .demo-boton-marca {
    width: 100%;
    max-width: 360px;
  }
}
</style>
