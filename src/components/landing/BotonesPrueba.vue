<template>
  <!-- El par de botones de la landing: probar 7 días (lleva a /prueba) y escribir por WhatsApp.

       Son los MISMOS dos caminos y los MISMOS dos eventos que tenía BotonesDemo.vue en la página anterior:
         - «Probalo 7 días gratis» es un <router-link> (un <a href="/prueba"> de verdad: teclado, pestaña nueva,
           gesto largo) y emite `prueba_cta_tocado` → el píxel lo traduce a `CtaPrueba` con la sección.
         - El de WhatsApp es el enlace con la referencia [CC:…] que arma Home.vue y emite `cta_demo_tocado` →
           `Contact` + `CtaWhatsApp` con la sección. -->
  <div class="lnd-botones">
    <router-link to="/prueba" class="lnd-btn lnd-btn--pri" @click="on_prueba">
      {{ texto_prueba }}
    </router-link>
    <a
      class="lnd-btn lnd-btn--sec"
      :href="cta_url"
      target="_blank"
      rel="noopener noreferrer"
      @click="on_whatsapp"
    >
      <icono-whatsapp color="#16a34a" />
      <span>{{ texto_whatsapp }}</span>
    </a>
  </div>
</template>

<script>
import IconoWhatsapp from './IconoWhatsapp.vue'

export default {
  name: 'BotonesPrueba',

  components: { IconoWhatsapp },

  props: {
    /** URL de WhatsApp con el texto precargado y la referencia de la visita. */
    cta_url: { type: String, required: true },
    /** Sección desde la que se toca: viaja en los dos eventos. */
    desde: { type: String, required: true },
    texto_prueba: { type: String, default: 'Probalo 7 días gratis' },
    texto_whatsapp: { type: String, default: 'Hablar por WhatsApp' },
    /** Bus de eventos de Home.vue. */
    emitir_evento: { type: Function, default: function () {} },
  },

  methods: {
    /** @returns {void} */
    on_prueba() {
      this.emitir_evento('prueba_cta_tocado', { desde: this.desde })
    },

    /** @returns {void} */
    on_whatsapp() {
      this.emitir_evento('cta_demo_tocado', { desde: this.desde })
    },
  },
}
</script>
