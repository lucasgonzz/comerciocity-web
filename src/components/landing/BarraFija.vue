<template>
  <!-- La barra de abajo que sigue al visitante (Fudo y Dux tienen una; la página anterior no tenía nada fijo y entre
       la pantalla 1 y la 8 no había cómo actuar: informe del 13/11/2026, §3.6). Se esconde mientras los botones del
       hero están a la vista (los decide Landing.vue) para no mostrar los mismos dos botones dos veces. El pie de la
       página reserva su alto (`--lnd-alto-barra`) para que no tape el final. -->
  <div class="lnd-fija" :class="{ 'lnd-fija--oculta': !visible }" :aria-hidden="visible ? 'false' : 'true'">
    <div class="lnd-fija__dentro">
      <router-link
        to="/prueba"
        class="lnd-btn lnd-btn--pri"
        :tabindex="visible ? 0 : -1"
        @click="emitir_evento('prueba_cta_tocado', { desde: 'barra_fija' })"
      >
        Probalo 7 días gratis
      </router-link>
      <a
        class="lnd-fija__wa"
        :href="cta_url"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Hablar por WhatsApp"
        :tabindex="visible ? 0 : -1"
        @click="emitir_evento('cta_demo_tocado', { desde: 'barra_fija' })"
      >
        <icono-whatsapp />
      </a>
    </div>
  </div>
</template>

<script>
import IconoWhatsapp from './IconoWhatsapp.vue'

export default {
  name: 'BarraFija',

  components: { IconoWhatsapp },

  props: {
    cta_url: { type: String, required: true },
    visible: { type: Boolean, default: false },
    emitir_evento: { type: Function, default: function () {} },
  },
}
</script>
