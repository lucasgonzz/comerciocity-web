<template>
  <!-- El cierre y el pie. `data-seccion="cta"` conserva el id de la página anterior: el `ViewContent` de «llegó al
       final» sigue llamándose igual en Events Manager. El enlace del teléfono del pie también mide (`desde: 'pie'`),
       como antes. -->
  <section class="lnd-seccion lnd-cierre" data-seccion="cta">
    <div class="lnd-contenedor">
      <h2 class="lnd-h2">Probalo 7 días con tu negocio</h2>
      <p class="lnd-sub">Si no te sirve, no pagás nada.</p>
      <div class="lnd-cierre__acciones">
        <botones-prueba
          desde="cierre"
          texto_whatsapp="Tengo una duda"
          :cta_url="cta_url"
          :emitir_evento="emitir_evento"
        />
      </div>
    </div>
  </section>
  <footer class="lnd-pie">
    <span>© {{ anio }} ComercioCity</span>
    <a href="https://www.instagram.com/comerciocity_com/" target="_blank" rel="noopener noreferrer">@comerciocity_com</a>
    <a :href="cta_url" target="_blank" rel="noopener noreferrer" @click="emitir_evento('cta_demo_tocado', { desde: 'pie' })">
      WhatsApp +54 3444 544199
    </a>
  </footer>
</template>

<script>
import BotonesPrueba from './BotonesPrueba.vue'

export default {
  name: 'Cierre',

  components: { BotonesPrueba },

  props: {
    cta_url: { type: String, required: true },
    emitir_evento: { type: Function, default: function () {} },
  },

  data() {
    return { anio: new Date().getFullYear() }
  },
}
</script>
