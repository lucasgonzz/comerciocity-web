<template>
  <!-- Los precios: los mismos cuatro planes y las mismas cifras que la página anterior (datos.js, decisiones de Lucas
       del 3/11/2026). En el teléfono, carrusel horizontal con puntos; desde 768 px, grilla. La cifra grande es la del
       descuento de los primeros 3 meses (como hoy), y se dice así al lado del monto. -->
  <section class="lnd-seccion lnd-seccion--alt" data-seccion="precio">
    <div class="lnd-contenedor">
      <p class="lnd-eyebrow">Lo que cuesta</p>
      <h2 class="lnd-h2">Pagás según cuánto vendés</h2>
      <span class="lnd-badge">{{ promo.descuento }}</span>

      <ul ref="carril" class="lnd-planes" aria-label="Planes" @scroll.passive="al_desplazar">
        <li
          v-for="plan in planes"
          :key="plan.clave"
          class="lnd-plan"
          :class="{ 'lnd-plan--destacado': plan.destacado }"
        >
          <p class="lnd-plan__nombre">{{ plan.nombre }}</p>
          <p class="lnd-plan__ops">{{ plan.limite }}</p>
          <p class="lnd-plan__monto">{{ formatear(plan.promocional) }}<span> /mes</span></p>
          <p class="lnd-plan__promo">{{ promo.junto_al_precio }}</p>
          <ul>
            <li>{{ plan.usuarios }} {{ plan.usuarios === 1 ? 'usuario incluido' : 'usuarios incluidos' }}</li>
            <li>Sistema completo, sin módulos aparte</li>
            <li>Operación extra, {{ formatear(plan.excedente) }}</li>
          </ul>
        </li>
      </ul>
      <div class="lnd-puntos">
        <button
          v-for="(plan, i) in planes"
          :key="plan.clave"
          type="button"
          :aria-label="'Ver el plan ' + plan.nombre"
          :aria-current="i === actual ? 'true' : 'false'"
          @click="ir_a(i)"
        ></button>
      </div>

      <p class="lnd-incluye">
        <b>Precios finales, no se suma IVA.</b> Operaciones = ventas, compras y gastos. Usuario adicional,
        {{ formatear(usuario_extra) }} por mes. La tienda online y los agentes de IA se suman a cualquier plan.
        Incluye la implementación y la migración de tus datos sin costo, y soporte por WhatsApp. ¿Más de 3.000
        operaciones por mes? Te armamos un plan a medida.
      </p>

      <div class="lnd-precios__accion">
        <botones-prueba
          desde="precio"
          texto_whatsapp="¿Dudas con el plan? Escribinos"
          :cta_url="cta_url"
          :emitir_evento="emitir_evento"
        />
      </div>
    </div>
  </section>
</template>

<script>
import BotonesPrueba from './BotonesPrueba.vue'
import { PLANES, PROMO, USUARIO_EXTRA, formatear_pesos } from './datos'

export default {
  name: 'Precios',

  components: { BotonesPrueba },

  props: {
    /** El WhatsApp: el bloque de precio de la página anterior también lo ofrecía (`CtaWhatsApp` con `precio`). */
    cta_url: { type: String, required: true },
    emitir_evento: { type: Function, default: function () {} },
  },

  data() {
    return {
      planes: PLANES,
      promo: PROMO,
      usuario_extra: USUARIO_EXTRA,
      /** Índice del plan que se ve en el carrusel del teléfono. */
      actual: 0,
    }
  },

  methods: {
    formatear: formatear_pesos,

    /** Marca el punto del plan más a la vista. */
    al_desplazar() {
      const carril = this.$refs.carril
      if (!carril || !carril.children.length) {
        return
      }
      const paso = carril.children[0].getBoundingClientRect().width + 12
      this.actual = Math.max(0, Math.min(this.planes.length - 1, Math.round(carril.scrollLeft / paso)))
    },

    /** @param {number} i */
    ir_a(i) {
      const carril = this.$refs.carril
      const tarjeta = carril && carril.children[i]
      if (tarjeta) {
        carril.scrollTo({ left: tarjeta.offsetLeft - carril.children[0].offsetLeft, behavior: 'smooth' })
      }
    },
  },
}
</script>
