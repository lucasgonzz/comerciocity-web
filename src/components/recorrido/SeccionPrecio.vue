<template>
  <!-- El bloque de precio. Desde el 26/10/2026 se publica siempre: Lucas lo pidió ese día
       (era la decisión D2 del plan del 13/10/2026, que estaba detrás de `VITE_MOSTRAR_PRECIO`).

       Qué dice y de dónde sale (manual_sistema/general/precios-y-contratacion.md y
       agentes/lead/recursos/precios.md del repo de conocimiento, vigentes desde el 26/10/2026):
       - "Desde $80.000 por mes" es el abono de GESTIÓN SOLA pagado por año: $960.000 por
         adelantado (20 % menos que $100.000 × 12). Lucas pidió exactamente eso: "el precio más
         barato que tengamos, el que ya tiene el descuento por pago anual, solo gestión".
         🔴 Por eso la cifra va SIEMPRE con su aclaración al lado (abono anual, y el mes a mes
         de $100.000): la regla de precios dice que nunca se confunde un equivalente mensual
         con un cobro mensual.
       - Lo que incluye es la lista que dictó Lucas. E-commerce y Agentes NO están en el abono
         de Gestión sola, así que esos dos renglones llevan su etiqueta ("si lo sumás"): sin
         ella la página prometería en público algo que el precio de arriba no incluye.
       - La licencia inicial va SIN número (se cotiza después de la demo), y el usuario extra
         con el suyo. -->
  <section ref="seccion" class="demo-precio demo-seccion-flujo">
    <div ref="grupo" class="demo-precio__grupo" :style="estilo_grupo('grupo')">
      <h2 class="demo-titulo-seccion demo-paso">Lo que cuesta.</h2>
      <p class="demo-bajada-seccion demo-precio__bajada demo-paso">
        Sin letra chica y sin planes que suben cuando te va bien.
      </p>

      <div class="demo-precio__tarjeta demo-paso">
        <div class="demo-precio__cabeza">
          <span class="demo-precio__rotulo">Mensualidad</span>
          <p class="demo-precio__cifra">
            <span class="demo-precio__desde">Desde</span>
            <strong>$80.000</strong>
            <span class="demo-precio__periodo">por mes</span>
          </p>
          <p class="demo-precio__aclaracion">
            Sistema de gestión con el abono anual: $960.000 por adelantado. Mes a mes, $100.000.
          </p>
        </div>

        <div class="demo-precio__cuerpo">
          <p class="demo-precio__incluye">Tu mensualidad incluye:</p>
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
        E-commerce y Agentes se suman a tu plan. La licencia inicial depende de los sistemas que
        elijas y te la cotizamos después de la demo. Cada usuario adicional, $15.000 por mes.
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

  computed: {
    /** @returns {Array} */
    incluye() {
      return INCLUYE
    },
  },

  methods: {
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
  max-width: 920px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.demo-precio__bajada {
  max-width: 540px;
}

/* Una sola tarjeta, partida en dos: la cifra a la izquierda (arriba en el teléfono) y lo
   que incluye a la derecha. El borde y la sombra azules son los de la marca: es el número
   que tiene que ganar la mirada. */
.demo-precio__tarjeta {
  width: 100%;
  margin-top: clamp(28px, 4.5vw, 48px);
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid rgba(11, 132, 248, 0.35);
  background: var(--demo-color-superficie);
  box-shadow: 0 24px 50px -30px rgba(11, 132, 248, 0.6);
  text-align: left;
}

.demo-precio__cabeza {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  padding: clamp(24px, 3.2vw, 36px);
  background:
    radial-gradient(120% 90% at 0% 0%, rgba(11, 132, 248, 0.32), transparent 60%),
    radial-gradient(100% 80% at 100% 100%, rgba(58, 49, 252, 0.22), transparent 60%),
    #f2f6ff;
}

.demo-precio__cuerpo {
  padding: clamp(22px, 3vw, 34px);
}

.demo-precio__rotulo {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--demo-color-texto-suave);
}

.demo-precio__cifra {
  margin: 0;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
  line-height: 1.05;
  color: var(--demo-color-texto);
}

.demo-precio__cifra strong {
  font-size: clamp(2.6rem, 6vw, 3.6rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #1c2333;
}

.demo-precio__desde,
.demo-precio__periodo {
  font-size: clamp(1rem, 1.5vw, 1.1rem);
  font-weight: 500;
  color: var(--demo-color-texto-suave);
}

.demo-precio__aclaracion {
  margin: 0;
  max-width: 34ch;
  font-size: clamp(0.9rem, 1.25vw, 0.98rem);
  line-height: 1.5;
  color: #3f4a63;
}

.demo-precio__incluye {
  margin: 0 0 14px;
  font-size: clamp(1rem, 1.4vw, 1.08rem);
  font-weight: 700;
  color: var(--demo-color-texto);
}

.demo-precio__lista {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 11px;
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
  max-width: 600px;
  font-size: clamp(0.88rem, 1.2vw, 0.95rem);
  line-height: 1.55;
  color: var(--demo-color-texto-suave);
}

@media (min-width: 768px) {
  .demo-precio__tarjeta {
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  }
}
</style>
