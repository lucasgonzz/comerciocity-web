<template>
  <!-- El logo de WhatsApp en SVG propio: no depende de la hoja de íconos externa, que carga después. -->
  <svg viewBox="0 0 24 24" :fill="color" aria-hidden="true" focusable="false">
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-3.2-.7-2.7-1.1-4.4-3.8-4.5-4-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.4.5-.4.4c-.1.1-.3.3-.1.6.1.3.6 1 1.3 1.6.9.8 1.7 1.1 1.9 1.2.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.1.1.7-.1 1.3z" />
  </svg>
</template>

<script>
export default {
  name: 'IconoWhatsapp',

  props: {
    /** Color de relleno: blanco sobre el verde de WhatsApp, verde sobre fondo claro. */
    color: {
      type: String,
      default: '#fff',
    },
  },
}
</script>
