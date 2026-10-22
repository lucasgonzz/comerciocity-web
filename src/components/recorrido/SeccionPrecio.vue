<template>
  <!-- El bloque de precio. 🔴 NO SE RENDERIZA salvo que `VITE_MOSTRAR_PRECIO` diga que sí
       (ver src/config.js): quién lo decide es Lucas, es la decisión D2 del plan del
       13/10/2026, y hasta que la tome la página sale igual que siempre.

       Qué dice y por qué, del informe del 5/10/2026 §6:
       - La mensualidad VA con número: es el mejor número que tenemos (el más bajo del
         relevamiento), no sube con las ventas, el agente ya la dice al primer pedido de
         precio y el que no puede pagarla no escribe.
       - La puesta en marcha va SIN número: hoy no es uno solo (el recurso del agente dice
         1.000 y 1.500; en la llamada del 23/9 se cotizó 2.500 y 1.800). Se nombra, se
         explica qué incluye, y se cotiza después de la demo.
       - Lo que NO se publica: "sin límite de usuarios". El usuario adicional se cobra. -->
  <section ref="seccion" class="demo-precio demo-seccion-flujo">
    <div ref="grupo" class="demo-precio__grupo" :style="estilo_grupo('grupo')">
      <h2 class="demo-titulo-seccion demo-paso">Lo que cuesta.</h2>
      <p class="demo-bajada-seccion demo-precio__bajada demo-paso">
        Sin letra chica y sin planes que suben cuando te va bien.
      </p>

      <ul class="demo-precio__tarjetas">
        <li class="demo-precio__tarjeta demo-precio__tarjeta--mensual demo-paso">
          <span class="demo-precio__rotulo">Mensualidad</span>
          <p class="demo-precio__cifra">
            <span class="demo-precio__desde">Desde</span>
            <strong>$20.000</strong>
            <span class="demo-precio__periodo">por mes</span>
          </p>
          <p class="demo-precio__texto">
            Sin límite de ventas ni de comprobantes. Vendas lo que vendas, la mensualidad es
            la misma. Incluye el sistema, la tienda online, el asistente por WhatsApp y el
            soporte de lunes a sábado.
          </p>
        </li>

        <li class="demo-precio__tarjeta demo-paso">
          <span class="demo-precio__rotulo">Puesta en marcha</span>
          <p class="demo-precio__cifra demo-precio__cifra--sin-numero">
            <strong>Pago único</strong>
          </p>
          <p class="demo-precio__texto">
            Migramos tus productos, tus clientes y proveedores con sus saldos, las imágenes de
            tu catálogo, ARCA y la capacitación. Te la cotizamos después de la demo, según tu
            negocio.
          </p>
        </li>
      </ul>

      <p class="demo-precio__nota demo-paso">
        Cada usuario adicional se cobra aparte. Te lo decimos antes, no después.
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

.demo-precio__tarjetas {
  list-style: none;
  margin: clamp(32px, 5vw, 56px) 0 0;
  padding: 0;
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(16px, 2.4vw, 24px);
  text-align: left;
}

.demo-precio__tarjeta {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: clamp(22px, 3vw, 30px);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow: 0 18px 40px -28px rgba(17, 24, 39, 0.4);
}

/* La mensualidad es la que tiene que ganar la mirada: es nuestro mejor número. */
.demo-precio__tarjeta--mensual {
  border-color: rgba(11, 132, 248, 0.35);
  box-shadow: 0 20px 44px -26px rgba(11, 132, 248, 0.5);
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
  line-height: 1.1;
  color: var(--demo-color-texto);
}

.demo-precio__cifra strong {
  font-size: clamp(2rem, 4.4vw, 2.75rem);
  font-weight: 800;
  letter-spacing: -0.02em;
}

/* "Pago único" no es una cifra: entra un escalón más chico para que no compita con $20.000. */
.demo-precio__cifra--sin-numero strong {
  font-size: clamp(1.4rem, 2.8vw, 1.85rem);
}

.demo-precio__desde,
.demo-precio__periodo {
  font-size: clamp(0.95rem, 1.4vw, 1.05rem);
  font-weight: 500;
  color: var(--demo-color-texto-suave);
}

.demo-precio__texto {
  margin: 0;
  font-size: clamp(0.95rem, 1.3vw, 1.02rem);
  line-height: 1.55;
  color: var(--demo-color-texto-suave);
}

.demo-precio__nota {
  margin: clamp(22px, 3vw, 32px) 0 clamp(18px, 2.4vw, 26px);
  max-width: 560px;
  font-size: clamp(0.88rem, 1.2vw, 0.95rem);
  color: var(--demo-color-texto-suave);
}

@media (min-width: 768px) {
  .demo-precio__tarjetas {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* Teléfono: la sección entra en una pantalla de 844 px de alto. Sin este apriete medía 924
   y el botón quedaba 5 px abajo del pliegue -- lo peor de los dos mundos, porque se lee como
   un botón cortado y no como "hay más abajo". Medido en 390x844. */
@media (max-width: 767.98px) {
  .demo-precio {
    padding-top: clamp(48px, 8dvh, 90px);
    padding-bottom: clamp(48px, 8dvh, 90px);
  }

  .demo-precio__tarjetas {
    margin-top: 20px;
    gap: 12px;
  }

  .demo-precio__tarjeta {
    padding: 18px;
  }

  .demo-precio__nota {
    margin: 14px 0 12px;
  }
}
</style>
