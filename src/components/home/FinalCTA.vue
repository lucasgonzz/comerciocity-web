<script setup>
const content = {
  title: '¿Listo para profesionalizar tu negocio?',
  subtitle:
    'Pedí tu demo. Es una videollamada de 1 hora donde ves el sistema funcionando con datos reales.',
  cta: {
    text: 'Quiero mi demo',
    url: 'https://wa.me/+543444622139',
  },
  note: 'Respuesta en menos de 24 horas · Sin compromisos',
}
</script>

<template>
  <section class="final-cta py-5 py-lg-6">
    <div class="container text-center">
      <h2 class="display-5 fw-bold text-white mb-4">{{ content.title }}</h2>
      <p class="lead text-white mb-5 mx-auto opacity-85" style="max-width: 560px">
        {{ content.subtitle }}
      </p>
      <a
        :href="content.cta.url"
        target="_blank"
        rel="noopener noreferrer"
        class="btn btn-light btn-lg px-5 py-3 fw-bold mb-3"
      >
        <i class="bi bi-whatsapp me-2 text-success"></i>{{ content.cta.text }}
      </a>
      <p class="text-white small mt-3 opacity-65">{{ content.note }}</p>
    </div>
  </section>
</template>

<style scoped>
.final-cta {
  background: linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #1d4ed8 100%);
  min-height: 420px;
  display: flex;
  align-items: center;
}

.opacity-85 {
  opacity: 0.85;
}

.opacity-65 {
  opacity: 0.65;
}

.btn-light {
  color: var(--cc-primary);
}

.btn-light:hover {
  color: var(--cc-primary-dark);
}
</style>
