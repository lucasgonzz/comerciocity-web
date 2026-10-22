<template>
  <!-- "No te dejamos solo." -- la implementación, etapa por etapa.
       Hasta el 13/10/2026 eran cuatro pasos inventados para la web (Demo, Migración,
       Configuración, Operación). Ahora son LAS OCHO ETAPAS REALES, las mismas que el admin
       registra y las mismas con las que se le habla al cliente mientras se implementa
       (`prompts_agentes/implementacion_protocolo.md` y la skill `implementar-cliente` del
       repo de conocimiento): lo que promete la web es exactamente lo que después pasa. -->
  <section ref="seccion" class="demo-implementacion demo-seccion-flujo">
    <div ref="grupo" class="demo-implementacion__grupo" :style="estilo_grupo('grupo')">
      <h2 class="demo-titulo-seccion demo-paso">No te dejamos solo.</h2>
      <p class="demo-bajada-seccion demo-implementacion__bajada demo-paso">
        Nosotros hacemos toda la implementación, de punta a punta. Son ocho etapas y las ves
        avanzar una por una.
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

      <!-- El argumento que no se estaba usando (informe del 5/10/2026, §9): los sistemas
           contables suben de plan por cantidad de comprobantes, y una ferretería con 200
           clientes por día termina en el plan más caro. Acá no. -->
      <p class="demo-implementacion__destacado demo-paso">
        Y no cobramos más por vender más: vendé todo lo que quieras, la mensualidad no cambia.
      </p>

      <p class="demo-implementacion__lema demo-paso">
        No instalamos software. Profesionalizamos negocios.
      </p>

      <botones-demo
        class="demo-paso"
        desde="implementacion"
        :cta_url="cta_url"
        :emitir_evento="emitir_evento"
        :abrir_agenda="abrir_agenda"
      />
    </div>
  </section>
</template>

<script>
import BotonesDemo from './BotonesDemo.vue'
import entrada_por_scroll from './entrada-por-scroll'

/**
 * Las ocho etapas de la implementación, con los nombres que ve el cliente. Son las mismas
 * que el admin usa como etapas de la implementación y las mismas que nombra el agente de
 * WhatsApp: si acá cambia una, cambia allá (repo de conocimiento,
 * `prompts_agentes/implementacion_protocolo.md` y `SK/implementar-cliente/SKILL.md`).
 *
 * 🔴 Sin plazos. El posicionamiento no promete una cantidad de días y la web tampoco: el
 * plazo lo dice el closer en la llamada, según el negocio.
 */
const PASOS = [
  {
    numero: '1',
    nombre: 'Tu negocio, en un formulario',
    texto: 'Cinco minutos desde el celular: cómo vendés, qué facturás, cómo manejás el stock.',
  },
  {
    numero: '2',
    nombre: 'Instalación',
    texto: 'Te instalamos el sistema ya configurado con esas respuestas.',
  },
  {
    numero: '3',
    nombre: 'Tus archivos',
    texto: 'Nos pasás tus Excel de artículos, clientes y proveedores, como los tengas.',
  },
  {
    numero: '4',
    nombre: 'Migración',
    texto:
      'Cargamos todo: productos, clientes y proveedores con sus saldos, las fotos de los ' +
      'catálogos y las categorías. Entrás apenas está la primera tanda.',
  },
  {
    numero: '5',
    nombre: 'Entrega',
    texto: 'Tus accesos, y dos cosas que elegís vos: las fotos dudosas y el árbol de categorías.',
  },
  {
    numero: '6',
    nombre: 'Capacitación',
    texto: 'Centro de recursos con videos cortos, módulo por módulo, para vos y tus empleados.',
  },
  {
    numero: '7',
    nombre: 'ARCA',
    texto: 'Vos das el permiso desde tu cuenta; nosotros dejamos la facturación instalada y probada.',
  },
  {
    numero: '8',
    nombre: 'Videollamada de cierre',
    texto: 'Repasamos todo con vos y quedás en soporte, de lunes a sábado.',
  },
]

export default {
  name: 'SeccionImplementacion',

  components: {
    BotonesDemo,
  },

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
    /** Abre la agenda de la demo: abrir_agenda(seccion, evento). Lo da Home.vue. */
    abrir_agenda: {
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

.demo-implementacion__destacado {
  margin: clamp(26px, 3.6vw, 40px) 0 0;
  max-width: 620px;
  font-size: clamp(1rem, 1.5vw, 1.12rem);
  font-weight: 600;
  line-height: 1.45;
  color: var(--demo-color-texto);
  text-wrap: balance;
}

.demo-implementacion__lema {
  margin: clamp(14px, 2vw, 20px) 0 clamp(18px, 2.4vw, 26px);
  font-size: clamp(1.1rem, 1.7vw, 1.3rem);
  font-weight: 600;
  font-style: italic;
  color: var(--demo-color-azul);
}

/* Tablet y escritorio: dos columnas de cuatro. Ocho en una fila no entran -- cada etapa
   tiene nombre y explicación, y a 1366 px una columna de 1/8 deja el texto en ocho
   renglones. Con dos columnas se abandona la línea que unía los números: en una grilla de
   dos columnas y cuatro filas no significa nada. La guía vertical de la izquierda (la de
   teléfono) se conserva y es lo que lee como "una etapa atrás de la otra". */
@media (min-width: 768px) {
  .demo-implementacion__pasos {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    /* Columna por columna (1-4 a la izquierda, 5-8 a la derecha) y no renglón por renglón:
       así cada columna es una tira continua y la guía vertical que las une significa algo. */
    grid-template-rows: repeat(4, auto);
    grid-auto-flow: column;
    column-gap: clamp(24px, 4vw, 48px);
  }

  /* La guía vertical no cruza de columna: se corta en el último de cada una (4 y 8). */
  .demo-implementacion__paso:nth-child(4)::after,
  .demo-implementacion__paso:nth-child(8)::after {
    display: none;
  }

  .demo-implementacion__paso:nth-child(4),
  .demo-implementacion__paso:nth-child(8) {
    padding-bottom: 0;
  }
}

</style>
