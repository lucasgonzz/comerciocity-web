<template>
  <!-- El bloque de precio. Desde el 26/10/2026 se publica siempre: Lucas lo pidió ese día
       (era la decisión D2 del plan del 13/10/2026, que estaba detrás de `VITE_MOSTRAR_PRECIO`).

       TRES PLANES POR CANTIDAD DE VENTAS (Lucas, 26/10/2026, segunda vuelta): "el resto de la
       competencia divide los planes según la cantidad de operaciones; armá 3 planes, un 5 %
       más baratos que el más barato de nuestros competidores, con nombres parecidos a los de
       ellos". De dónde sale cada número está en PLANES, en el script.

       Lo que se mantiene de la versión anterior (la tarjeta le gustó a Lucas): la cabeza con el
       degradé azul y la cifra grande, y el cuerpo con lo que incluye la mensualidad. Ahora la
       cabeza son tres, una por plan, y el cuerpo es común a los tres.

       E-commerce y Agentes NO están en estos planes (son de gestión), así que esos dos
       renglones de lo que incluye llevan su etiqueta ("si lo sumás"): sin ella la página
       prometería en público algo que el precio de arriba no incluye.

       🔴 La regla de precios del manual: un equivalente mensual NUNCA va solo. Con "Pago anual"
       elegido, cada cifra lleva al lado el total que se paga por adelantado; con "Mes a mes",
       no hay equivalente que aclarar. -->
  <section ref="seccion" class="demo-precio demo-seccion-flujo">
    <div ref="grupo" class="demo-precio__grupo" :style="estilo_grupo('grupo')">
      <h2 class="demo-titulo-seccion demo-paso">Lo que cuesta.</h2>
      <p class="demo-bajada-seccion demo-precio__bajada demo-paso">
        Elegís el plan según cuántas ventas hacés por mes. Todos traen el sistema completo, sin
        módulos que se cobran aparte.
      </p>

      <!-- Pago anual / mes a mes. Arranca en anual: es el precio más bajo, el que Lucas pidió
           mostrar primero. -->
      <div class="demo-precio__modo demo-paso" role="group" aria-label="Forma de pago">
        <button
          type="button"
          class="demo-precio__modo-opcion"
          :class="{ 'demo-precio__modo-opcion--activa': anual }"
          :aria-pressed="anual ? 'true' : 'false'"
          @click="elegir_modo(true)"
        >
          Pago anual <span class="demo-precio__modo-ahorro">20 % off</span>
        </button>
        <button
          type="button"
          class="demo-precio__modo-opcion"
          :class="{ 'demo-precio__modo-opcion--activa': !anual }"
          :aria-pressed="!anual ? 'true' : 'false'"
          @click="elegir_modo(false)"
        >
          Mes a mes
        </button>
      </div>

      <div class="demo-precio__tarjeta demo-paso">
        <ul class="demo-precio__planes">
          <li
            v-for="plan in planes"
            :key="plan.clave"
            class="demo-precio__cabeza"
            :class="{ 'demo-precio__cabeza--destacada': plan.destacado }"
          >
            <span class="demo-precio__rotulo">Plan {{ plan.nombre }}</span>
            <p class="demo-precio__limite">
              <i class="bi bi-receipt" aria-hidden="true"></i>
              {{ plan.limite }}
            </p>
            <p class="demo-precio__cifra">
              <strong>{{ formatear(anual ? plan.anual_por_mes : plan.mensual) }}</strong>
              <span class="demo-precio__periodo">por mes</span>
            </p>
            <p class="demo-precio__aclaracion">
              <template v-if="anual">
                Con el abono anual: {{ formatear(plan.anual_por_mes * 12) }} por adelantado.
                Mes a mes, {{ formatear(plan.mensual) }}.
              </template>
              <template v-else>
                Pagando el año por adelantado, {{ formatear(plan.anual_por_mes) }} por mes.
              </template>
            </p>
            <p class="demo-precio__para">{{ plan.para }}</p>
          </li>
        </ul>

        <div class="demo-precio__cuerpo">
          <p class="demo-precio__incluye">Todos los planes incluyen:</p>
          <ul class="demo-precio__lista">
            <li v-for="item in incluye" :key="item.texto">
              <i class="bi" :class="item.icono" aria-hidden="true"></i>
              <span>
                {{ item.texto }}
                <span v-if="item.etiqueta" class="demo-precio__etiqueta">{{ item.etiqueta }}</span>
              </span>
            </li>
          </ul>
        </div>
      </div>

      <p class="demo-precio__nota demo-paso">
        ¿Hacés más de 5.000 ventas por mes? Te armamos un plan a medida. E-commerce y Agentes se
        suman a cualquier plan. La licencia inicial depende de los sistemas que elijas y te la
        cotizamos después de la demo. Cada usuario adicional, $15.000 por mes.
      </p>

      <botones-demo
        class="demo-paso"
        desde="precio"
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
 * Los tres planes (26/10/2026). Cómo se armaron:
 *
 * - LA COMPETENCIA. Relevamiento del 5/10/2026 (informes/20261005-estrategia-de-marketing-y-
 *   embudo/competencia-precios.md del repo de conocimiento), con los precios de Dux, Xubio,
 *   Contabilium, Colppy y Alegra vueltos a leer en sus páginas el 26/10/2026: no cambiaron.
 *   Todos parten sus planes por comprobantes de venta por mes, y los cortes más comunes son
 *   los de Dux (250 / 1.500 / 5.000 / ilimitados) y Contabilium (1.500 / 5.000 / 10.000).
 * - LOS CORTES. Tres escalones: hasta 300 ventas (la franja de 250-300 de Dux, Xubio, Colppy
 *   y Alegra Pyme), hasta 1.500 (Dux Estándar, Contabilium Standard) y hasta 5.000 (Dux Pro,
 *   Contabilium Pro). Más de 5.000, a medida.
 * - EL PRECIO. 5 % menos que el competidor más barato que cubre esa franja, mes a mes y sin
 *   IVA (los de ellos son + IVA). En las tres es Dux: Inicial $36.000 (× 0,95 = $34.200),
 *   Estándar $75.300 (= $71.535 → $71.500) y Pro $111.200 (= $105.640 → $105.600). Se
 *   redondea siempre para abajo, para que la diferencia nunca quede por debajo del 5 %.
 *   (Alegra Emprendedor, $27.999, es más barato que el Inicial, pero cubre 100 facturas y
 *   2 usuarios: no es la misma franja.)
 * - EL ANUAL. 20 % menos sobre doce mensualidades, como el abono anual de la política de
 *   precios del 26/10/2026 (manual_sistema/general/precios-y-contratacion.md).
 * - LOS NOMBRES. Inicial, Estándar y Pro: los de Dux para las mismas franjas, y los que más
 *   se repiten en el resto (Xubio Estándar, Contabilium Pro, Alegra Pro).
 */
const PLANES = [
  {
    clave: 'inicial',
    nombre: 'Inicial',
    limite: 'Hasta 300 ventas por mes',
    mensual: 34200,
    anual_por_mes: 27360,
    para: 'Para el comercio que arranca o atiende con un solo mostrador.',
  },
  {
    clave: 'estandar',
    nombre: 'Estándar',
    limite: 'Hasta 1.500 ventas por mes',
    mensual: 71500,
    anual_por_mes: 57200,
    para: 'Para el negocio con movimiento todos los días y varios vendedores.',
    destacado: true,
  },
  {
    clave: 'pro',
    nombre: 'Pro',
    limite: 'Hasta 5.000 ventas por mes',
    mensual: 105600,
    anual_por_mes: 84480,
    para: 'Para el que vende mucho: distribuidoras, mayoristas, varias sucursales.',
  },
]

/** El punto de miles de Argentina: 27.360. */
const FORMATO_PESOS = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 })

/** Lo que incluye la mensualidad, con las palabras de Lucas (26/10/2026). */
const INCLUYE = [
  { icono: 'bi-laptop', texto: 'Acceso al sistema desde cualquier dispositivo.' },
  { icono: 'bi-bag-check', texto: 'El e-commerce de tu negocio funcionando 24/7.', etiqueta: 'si sumás E-commerce' },
  { icono: 'bi-stars', texto: 'El sistema de agentes, con los tokens para usarlo.', etiqueta: 'si sumás Agentes' },
  { icono: 'bi-whatsapp', texto: 'Soporte por WhatsApp de por vida.' },
  { icono: 'bi-sliders', texto: 'Desarrollo de funcionalidades a medida.' },
  { icono: 'bi-arrow-repeat', texto: 'Actualizaciones constantes de la plataforma.' },
]

export default {
  name: 'SeccionPrecio',

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

  data() {
    return {
      /** true: precios con el abono anual; false: mes a mes. */
      anual: true,
    }
  },

  computed: {
    /** @returns {Array} */
    incluye() {
      return INCLUYE
    },

    /** @returns {Array} */
    planes() {
      return PLANES
    },
  },

  methods: {
    /**
     * @param {number} monto
     * @returns {string} "$27.360"
     */
    formatear(monto) {
      return '$' + FORMATO_PESOS.format(monto)
    },

    /**
     * Cambia entre anual y mes a mes, y lo deja medido (sirve para saber cuál miran).
     *
     * @param {boolean} anual
     * @returns {void}
     */
    elegir_modo(anual) {
      if (this.anual === anual) {
        return
      }
      this.anual = anual
      this.emitir_evento('precio_modo_elegido', { modo: anual ? 'anual' : 'mensual' })
    },

    /** Los grupos cuya entrada sigue al scroll (contrato del mixin). */
    grupos() {
      return { grupo: this.$refs.grupo }
    },
  },
}
</script>

<style scoped>
.demo-precio__grupo {
  --p: 1;
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.demo-precio__bajada {
  max-width: 580px;
}

/* El interruptor anual / mes a mes: una píldora con dos opciones. */
.demo-precio__modo {
  margin-top: clamp(24px, 3.5vw, 36px);
  display: inline-flex;
  padding: 4px;
  border-radius: 999px;
  border: 1px solid rgba(11, 132, 248, 0.25);
  background: var(--demo-color-superficie);
  box-shadow: 0 8px 20px -14px rgba(11, 132, 248, 0.5);
}

.demo-precio__modo-opcion {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  font: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--demo-color-texto-suave);
  cursor: pointer;
  transition: background 160ms ease, color 160ms ease;
}

.demo-precio__modo-opcion--activa {
  background: linear-gradient(135deg, #0b84f8, #3a31fc);
  color: #fff;
}

.demo-precio__modo-opcion:focus-visible {
  outline: 2px solid var(--demo-color-azul);
  outline-offset: 2px;
}

.demo-precio__modo-ahorro {
  padding: 1px 8px;
  border-radius: 999px;
  background: rgba(22, 163, 74, 0.14);
  font-size: 0.75rem;
  font-weight: 700;
  color: #15803d;
}

.demo-precio__modo-opcion--activa .demo-precio__modo-ahorro {
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
}

/* Una sola tarjeta, como la de antes: arriba las cabezas de los tres planes (el degradé
   azul y la cifra grande) y abajo, común a los tres, lo que incluye. El borde y la sombra
   azules son los de la marca. */
.demo-precio__tarjeta {
  width: 100%;
  margin-top: clamp(22px, 3vw, 32px);
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid rgba(11, 132, 248, 0.35);
  background: var(--demo-color-superficie);
  box-shadow: 0 24px 50px -30px rgba(11, 132, 248, 0.6);
  text-align: left;
}

.demo-precio__planes {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
}

.demo-precio__cabeza {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: clamp(24px, 3vw, 34px);
  background:
    radial-gradient(120% 90% at 0% 0%, rgba(11, 132, 248, 0.22), transparent 60%),
    radial-gradient(100% 80% at 100% 100%, rgba(58, 49, 252, 0.14), transparent 60%),
    #f2f6ff;
}

.demo-precio__cabeza + .demo-precio__cabeza {
  border-top: 1px solid rgba(11, 132, 248, 0.18);
}

/* El del medio, con el degradé de la tarjeta anterior (el más cargado): es el que tiene
   que ganar la mirada. */
.demo-precio__cabeza--destacada {
  background:
    radial-gradient(120% 90% at 0% 0%, rgba(11, 132, 248, 0.32), transparent 60%),
    radial-gradient(100% 80% at 100% 100%, rgba(58, 49, 252, 0.22), transparent 60%),
    #eaf1ff;
}

.demo-precio__cuerpo {
  padding: clamp(22px, 3vw, 34px);
  border-top: 1px solid rgba(11, 132, 248, 0.18);
}

.demo-precio__rotulo {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--demo-color-azul);
}

.demo-precio__limite {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: clamp(1rem, 1.4vw, 1.08rem);
  font-weight: 700;
  color: var(--demo-color-texto);
}

.demo-precio__limite .bi {
  color: var(--demo-color-azul);
}

.demo-precio__cifra {
  margin: 4px 0 0;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
  line-height: 1.05;
  color: var(--demo-color-texto);
}

.demo-precio__cifra strong {
  font-size: clamp(2.3rem, 4.4vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #1c2333;
  font-variant-numeric: tabular-nums;
}

.demo-precio__periodo {
  font-size: clamp(1rem, 1.5vw, 1.1rem);
  font-weight: 500;
  color: var(--demo-color-texto-suave);
}

/* Alto mínimo de dos renglones: al pasar de anual (dos frases) a mes a mes (una) las
   tarjetas no saltan. */
.demo-precio__aclaracion {
  margin: 0;
  min-height: 3em;
  font-size: clamp(0.88rem, 1.2vw, 0.95rem);
  line-height: 1.5;
  color: #3f4a63;
}

.demo-precio__para {
  margin: auto 0 0;
  padding-top: 12px;
  border-top: 1px dashed rgba(11, 132, 248, 0.25);
  font-size: clamp(0.9rem, 1.2vw, 0.96rem);
  line-height: 1.5;
  color: var(--demo-color-texto-suave);
}

.demo-precio__incluye {
  margin: 0 0 16px;
  font-size: clamp(1rem, 1.4vw, 1.08rem);
  font-weight: 700;
  color: var(--demo-color-texto);
}

.demo-precio__lista {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px 32px;
}

.demo-precio__lista li {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  font-size: clamp(0.96rem, 1.3vw, 1.03rem);
  line-height: 1.45;
  color: var(--demo-color-texto);
}

.demo-precio__lista .bi {
  flex: 0 0 auto;
  margin-top: 1px;
  color: var(--demo-color-azul);
  font-size: 1.1rem;
}

/* "si sumás E-commerce": un dato, no un adorno. Chica, en el renglón, sin competir. */
.demo-precio__etiqueta {
  display: inline-block;
  margin-left: 4px;
  padding: 1px 8px;
  border-radius: 999px;
  background: rgba(86, 96, 120, 0.1);
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--demo-color-texto-suave);
  white-space: nowrap;
}

.demo-precio__nota {
  margin: clamp(20px, 3vw, 28px) 0 clamp(18px, 2.4vw, 26px);
  max-width: 640px;
  font-size: clamp(0.88rem, 1.2vw, 0.95rem);
  line-height: 1.55;
  color: var(--demo-color-texto-suave);
}

/* Tablet: lo que incluye en dos columnas. */
@media (min-width: 640px) {
  .demo-precio__lista {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* Escritorio: los tres planes en una fila, separados por una línea vertical. */
@media (min-width: 900px) {
  .demo-precio__planes {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .demo-precio__cabeza + .demo-precio__cabeza {
    border-top: 0;
    border-left: 1px solid rgba(11, 132, 248, 0.18);
  }

  /* Los cinco renglones de cada plan (rótulo, límite, cifra, aclaración, para quién) en las
     mismas filas en los tres: con subgrid la línea punteada y el texto de abajo quedan a la
     misma altura aunque una aclaración ocupe un renglón más. Un navegador sin subgrid cae
     en un grid común: cada plan con sus filas, que es como se veía antes. */
  .demo-precio__planes {
    grid-template-rows: repeat(5, auto);
  }

  .demo-precio__cabeza {
    display: grid;
    grid-template-rows: subgrid;
    grid-row: span 5;
    row-gap: 10px;
  }

  .demo-precio__para {
    margin: 0;
  }

  .demo-precio__lista {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (prefers-reduced-motion: reduce) {
  .demo-precio__modo-opcion {
    transition: none;
  }
}
</style>
