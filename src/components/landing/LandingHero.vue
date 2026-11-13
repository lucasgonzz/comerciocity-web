<template>
  <!-- Pantalla 1: qué es, para quién, las tres partes, los dos botones, sin tarjeta y cuánto sale. Es lo que la
       competencia contesta en la primera pantalla del celular y la página anterior no (informe del 13/11/2026, §2.3
       y §3). Frase aprobada por Lucas: la 1. -->
  <section class="lnd-hero" data-seccion="hero">
    <div class="lnd-hero__grilla">
      <div class="lnd-hero__texto">
        <p class="lnd-eyebrow">Sistema de gestión para ferreterías, corralones y distribuidoras</p>
        <h1>Tu mostrador, tu tienda online y tu WhatsApp, en un solo sistema.</h1>
        <ul class="lnd-chips" aria-label="Las tres partes del sistema">
          <li v-for="parte in partes" :key="parte.clave" class="lnd-chip">
            <i :class="'lnd-punto--' + parte.color" aria-hidden="true"></i>{{ parte.etiqueta }}
          </li>
        </ul>
        <p class="lnd-sub">
          Facturás y controlás el stock. La tienda online se actualiza sola. Y un agente de IA atiende a tus clientes y
          te carga el trabajo.
        </p>
        <!-- Se observa desde Landing.vue: mientras estos botones están a la vista, la barra fija de abajo no se
             muestra (serían los mismos dos botones dos veces en la misma pantalla). -->
        <div ref="acciones" class="lnd-hero__acciones">
          <botones-prueba desde="hero" :cta_url="cta_url" :emitir_evento="emitir_evento" />
        </div>
        <ul class="lnd-checks">
          <li>Sin tarjeta</li>
          <li>Te cargamos tus productos</li>
          <li>Implementación gratis</li>
        </ul>
        <p class="lnd-precio-linea">
          Desde <b>{{ precio_desde }} por mes</b> {{ promo }}
        </p>
      </div>

      <!-- Lucas en color (el «ahora» de sus reels) y la conversación real en la que el asistente carga la factura
           de un proveedor. Lazy: en el teléfono queda debajo de la primera pantalla. -->
      <div class="lnd-hero__foto">
        <img
          :src="foto_lucas"
          alt="Lucas, fundador de ComercioCity"
          width="720"
          height="614"
          loading="lazy"
          decoding="async"
        />
        <div class="lnd-hero__burbuja">
          <img
            :src="chat_factura"
            alt="Chat con el asistente: le pasa la foto de la factura de un proveedor y el asistente crea la compra para revisar."
            width="480"
            height="654"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import BotonesPrueba from './BotonesPrueba.vue'
import { PARTES, PLANES, PROMO, formatear_pesos } from './datos'
import foto_lucas from '../../assets/landing/ahora-lucas.webp'
import chat_factura from '../../assets/landing/chat-factura.webp'

export default {
  name: 'LandingHero',

  components: { BotonesPrueba },

  props: {
    cta_url: { type: String, required: true },
    emitir_evento: { type: Function, default: function () {} },
  },

  data() {
    return {
      partes: PARTES,
      foto_lucas,
      chat_factura,
      promo: PROMO.junto_al_precio,
    }
  },

  computed: {
    /**
     * El plan más barato, con la cifra que muestra la sección de precios (la promocional: ver datos.js).
     *
     * @returns {string} "$27.950"
     */
    precio_desde() {
      let minimo = null
      PLANES.forEach(function (plan) {
        if (minimo === null || plan.promocional < minimo) {
          minimo = plan.promocional
        }
      })
      return formatear_pesos(minimo)
    },
  },
}
</script>
