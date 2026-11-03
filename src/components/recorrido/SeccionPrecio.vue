<template>
  <!-- El bloque de precio. Desde el 26/10/2026 se publica siempre: Lucas lo pidió ese día
       (era la decisión D2 del plan del 13/10/2026, que estaba detrás de `VITE_MOSTRAR_PRECIO`).

       CUATRO PLANES POR OPERACIONES (Lucas, 3/11/2026, programa «Prueba gratuita de 7 días»):
       los planes copian los cortes de Contagram, que es el único competidor que cuenta
       ventas + compras + gastos, un 5 % más baratos y mostrados YA CON EL 50 % de descuento de
       los primeros tres meses. De dónde sale cada número está en PLANES, en el script.

       Lo que dice la sección, y por qué (decisiones de Lucas del 3/11/2026):
         - Arriba de todo, «El sistema de gestión y la implementación son gratis»: Gestión dejó
           de tener licencia (pago único). Tienda y Agentes la conservan, pero acá no se dice
           cuánto: solo que «se suman a cualquier plan».
         - La cifra grande es la PROMOCIONAL (la mitad del abono), con la leyenda «50 % de
           descuento durante los primeros 3 meses». No se muestra cuánto queda después: Lucas
           lo pidió así, y la cifra plena está en el manual de precios y en el contrato.
         - «Precios finales. No se suma IVA.» y «Operaciones = ventas, compras y gastos.»: los
           competidores publican + IVA; acá el número que se ve es el que se paga.
         - Sin selector anual / mes a mes (se retiró el 3/11/2026 junto con el «20 % off»):
           un solo precio por plan.

       Lo que se mantiene de la versión anterior (la tarjeta le gustó a Lucas): la cabeza con
       el degradé azul y la cifra grande, una por plan, y el cuerpo común con lo que incluye.
       Tienda y Agentes NO están en estos planes, así que esos dos renglones de lo que incluye
       llevan su etiqueta ("si lo sumás"): sin ella la página prometería en público algo que
       el precio de arriba no incluye. -->
  <section ref="seccion" class="demo-precio demo-seccion-flujo">
    <div ref="grupo" class="demo-precio__grupo" :style="estilo_grupo('grupo')">
      <p class="demo-precio__gratis demo-paso">
        <i class="bi bi-gift" aria-hidden="true"></i>
        <span>El sistema de gestión y la implementación son gratis.</span>
      </p>
      <h2 class="demo-titulo-seccion demo-paso">Lo que cuesta.</h2>
      <p class="demo-bajada-seccion demo-precio__bajada demo-paso">
        Pagás solo el abono mensual, según cuántas operaciones hace tu negocio por mes. Todos los
        planes traen el sistema completo, sin módulos que se cobran aparte.
      </p>

      <p class="demo-precio__promo demo-paso">
        <i class="bi bi-stars" aria-hidden="true"></i>
        <span>50 % de descuento durante los primeros 3 meses</span>
      </p>

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
              <strong>{{ formatear(plan.promocional) }}</strong>
              <span class="demo-precio__periodo">por mes</span>
            </p>
            <ul class="demo-precio__detalle">
              <li>{{ plan.usuarios }} {{ plan.usuarios === 1 ? 'usuario incluido' : 'usuarios incluidos' }}</li>
              <li>Operación extra, {{ formatear(plan.excedente) }}</li>
            </ul>
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
        <strong>Precios finales. No se suma IVA.</strong> Operaciones = ventas, compras y gastos.
        Cada usuario adicional, {{ formatear(USUARIO_EXTRA) }} por mes. Tienda online y Agentes de
        IA se suman a cualquier plan. ¿Hacés más de 3.000 operaciones por mes? Te armamos un plan
        a medida.
      </p>

      <botones-demo
        class="demo-paso"
        desde="precio"
        :cta_url="cta_url"
        :emitir_evento="emitir_evento"
      />
    </div>
  </section>
</template>

<script>
import BotonesDemo from './BotonesDemo.vue'
import entrada_por_scroll from './entrada-por-scroll'

/**
 * Los cuatro planes (3/11/2026). Cómo se armaron:
 *
 * - LA REFERENCIA. Contagram (contagram.com, leído el 3/11/2026): es el único competidor que
 *   corta sus planes por OPERACIONES (ventas + compras + gastos) y no por comprobantes de
 *   venta, y es lo que Lucas pidió copiar. Sus planes, sin IVA: Inicial $58.900 (0 a 100
 *   operaciones, 1 usuario, excedente $800), Intermedio $89.900 (101 a 250, 2 usuarios,
 *   $600), Plus $209.900 (251 a 500, 2 usuarios, $200), Empresa $276.900 (501 a 3.000,
 *   3 usuarios, $80); usuario adicional $32.000. Dux y Contabilium se miraron el mismo día
 *   para ubicarse (`00-precios-contagram-y-guion.md` §2b del programa): cortan por
 *   comprobantes de venta y no son la referencia.
 * - EL PRECIO. 5 % menos que el número que publica Contagram (su neto, sin IVA), y ese es el
 *   precio FINAL nuestro: no se le suma IVA (esquema A, elegido por Lucas el 3/11/2026).
 *   Inicial $58.900 × 0,95 = $55.955 → $55.900; Intermedio $85.405 → $85.400; Plus $199.405 →
 *   $199.400; Empresa $263.055 → $263.000. Se redondea siempre para abajo, a la centena, para
 *   que la diferencia nunca quede por debajo del 5 % (como se hizo el 26/10 con Dux).
 *   Excedentes: $760 / $570 / $190 / $76. Usuario extra: $32.000 × 0,95 = $30.400.
 * - LO QUE SE VE. La mitad: $27.950 / $42.700 / $99.700 / $131.500, porque los primeros tres
 *   meses tienen el 50 % de descuento y Lucas pidió mostrar ya ese número, sin decir cuánto
 *   queda después (`mensual` queda acá como referencia y es lo que dice el manual de precios).
 * - LOS NOMBRES Y LOS CORTES. Los de Contagram: Inicial, Intermedio, Plus y Empresa; 0-100,
 *   101-250, 251-500 y 501-3.000. Más de 3.000, a medida.
 * - USUARIOS. 1 / 2 / 2 / 3 incluidos, como Contagram.
 */
const PLANES = [
  {
    clave: 'inicial',
    nombre: 'Inicial',
    limite: 'Hasta 100 operaciones por mes',
    mensual: 55900,
    promocional: 27950,
    usuarios: 1,
    excedente: 760,
    para: 'Para el comercio que arranca o atiende con un solo mostrador.',
  },
  {
    clave: 'intermedio',
    nombre: 'Intermedio',
    limite: 'De 101 a 250 operaciones por mes',
    mensual: 85400,
    promocional: 42700,
    usuarios: 2,
    excedente: 570,
    para: 'Para el negocio con movimiento todos los días y un vendedor más.',
    destacado: true,
  },
  {
    clave: 'plus',
    nombre: 'Plus',
    limite: 'De 251 a 500 operaciones por mes',
    mensual: 199400,
    promocional: 99700,
    usuarios: 2,
    excedente: 190,
    para: 'Para el que vende mucho: varios vendedores, compras todas las semanas.',
  },
  {
    clave: 'empresa',
    nombre: 'Empresa',
    limite: 'De 501 a 3.000 operaciones por mes',
    mensual: 263000,
    promocional: 131500,
    usuarios: 3,
    excedente: 76,
    para: 'Para distribuidoras, mayoristas y negocios con varias sucursales.',
  },
]

/** Cada usuario adicional, por mes, en cualquier plan (Contagram $32.000 × 0,95 → $30.400). */
const USUARIO_EXTRA = 30400

/** El punto de miles de Argentina: 27.950. */
const FORMATO_PESOS = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 })

/** Lo que incluye la mensualidad, con las palabras de Lucas (26/10/2026 y 3/11/2026). */
const INCLUYE = [
  { icono: 'bi-laptop', texto: 'Acceso al sistema desde cualquier dispositivo.' },
  { icono: 'bi-people', texto: 'Implementación y migración de tus datos, sin costo.' },
  { icono: 'bi-bag-check', texto: 'La tienda online de tu negocio funcionando 24/7.', etiqueta: 'si sumás Tienda' },
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
  },

  data() {
    return {
      USUARIO_EXTRA,
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
     * @returns {string} "$27.950"
     */
    formatear(monto) {
      return '$' + FORMATO_PESOS.format(monto)
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
  max-width: 1180px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* «El sistema de gestión y la implementación son gratis»: arriba de todo, como una píldora
   de marca. Es lo primero que tiene que leerse del bloque. */
.demo-precio__gratis {
  margin: 0 0 clamp(14px, 2vw, 22px);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  border-radius: 999px;
  background: var(--demo-gradient-marca);
  color: #fff;
  font-size: clamp(0.95rem, 1.4vw, 1.08rem);
  font-weight: 700;
  line-height: 1.3;
  box-shadow: 0 10px 28px rgba(11, 132, 248, 0.22);
}

.demo-precio__gratis .bi {
  font-size: 1.2em;
}

.demo-precio__bajada {
  max-width: 600px;
}

/* El 50 % de los primeros tres meses: una píldora verde, al lado de los precios. */
.demo-precio__promo {
  margin: clamp(22px, 3vw, 32px) 0 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(22, 163, 74, 0.14);
  color: #15803d;
  font-size: clamp(0.92rem, 1.3vw, 1rem);
  font-weight: 700;
  line-height: 1.3;
}

/* Una sola tarjeta, como la de antes: arriba las cabezas de los cuatro planes (el degradé
   azul y la cifra grande) y abajo, común a los cuatro, lo que incluye. El borde y la sombra
   azules son los de la marca. */
.demo-precio__tarjeta {
  width: 100%;
  margin-top: clamp(16px, 2.4vw, 24px);
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
  padding: clamp(22px, 2.6vw, 30px);
  background:
    radial-gradient(120% 90% at 0% 0%, rgba(11, 132, 248, 0.22), transparent 60%),
    radial-gradient(100% 80% at 100% 100%, rgba(58, 49, 252, 0.14), transparent 60%),
    #f2f6ff;
}

.demo-precio__cabeza + .demo-precio__cabeza {
  border-top: 1px solid rgba(11, 132, 248, 0.18);
}

/* El Intermedio, con el degradé de la tarjeta anterior (el más cargado): es el que tiene
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
  align-items: flex-start;
  gap: 8px;
  font-size: clamp(0.98rem, 1.3vw, 1.04rem);
  font-weight: 700;
  line-height: 1.3;
  color: var(--demo-color-texto);
}

.demo-precio__limite .bi {
  flex: 0 0 auto;
  margin-top: 2px;
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
  font-size: clamp(2.2rem, 3.6vw, 2.7rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #1c2333;
  font-variant-numeric: tabular-nums;
}

.demo-precio__periodo {
  font-size: clamp(0.98rem, 1.4vw, 1.05rem);
  font-weight: 500;
  color: var(--demo-color-texto-suave);
}

/* Los dos datos del plan: usuarios incluidos y operación extra. */
.demo-precio__detalle {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: clamp(0.88rem, 1.2vw, 0.94rem);
  line-height: 1.4;
  color: var(--demo-color-texto);
}

.demo-precio__detalle li::before {
  content: '·';
  margin-right: 6px;
  color: var(--demo-color-azul);
  font-weight: 700;
}

.demo-precio__para {
  margin: auto 0 0;
  padding-top: 12px;
  border-top: 1px dashed rgba(11, 132, 248, 0.25);
  font-size: clamp(0.88rem, 1.2vw, 0.94rem);
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

/* "si sumás Tienda": un dato, no un adorno. Chica, en el renglón, sin competir. */
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
  max-width: 680px;
  font-size: clamp(0.88rem, 1.2vw, 0.95rem);
  line-height: 1.55;
  color: var(--demo-color-texto-suave);
}

.demo-precio__nota strong {
  color: var(--demo-color-texto);
}

/* Tablet: los planes de a dos, y lo que incluye en dos columnas. */
@media (min-width: 640px) {
  .demo-precio__planes {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .demo-precio__cabeza + .demo-precio__cabeza {
    border-top: 0;
  }

  .demo-precio__cabeza:nth-child(even) {
    border-left: 1px solid rgba(11, 132, 248, 0.18);
  }

  .demo-precio__cabeza:nth-child(n + 3) {
    border-top: 1px solid rgba(11, 132, 248, 0.18);
  }

  .demo-precio__lista {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* Escritorio: los cuatro planes en una fila, separados por una línea vertical. */
@media (min-width: 1100px) {
  .demo-precio__planes {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    /* Los cinco renglones de cada plan (rótulo, límite, cifra, detalle, para quién) en las
       mismas filas en los cuatro: con subgrid la línea punteada y el texto de abajo quedan a
       la misma altura aunque un renglón ocupe más en un plan. Un navegador sin subgrid cae en
       un grid común: cada plan con sus filas. */
    grid-template-rows: repeat(5, auto);
  }

  .demo-precio__cabeza {
    display: grid;
    grid-template-rows: subgrid;
    grid-row: span 5;
    row-gap: 10px;
  }

  .demo-precio__cabeza:nth-child(n + 3) {
    border-top: 0;
  }

  .demo-precio__cabeza + .demo-precio__cabeza {
    border-left: 1px solid rgba(11, 132, 248, 0.18);
  }

  .demo-precio__para {
    margin: 0;
  }

  .demo-precio__lista {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
