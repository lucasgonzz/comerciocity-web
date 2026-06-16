<script setup>
const content = {
  title: 'No te dejamos solo.',
  subtitle: 'Nosotros hacemos toda la implementación. Vos empezás a operar desde el día uno.',
  steps: [
    {
      number: '1',
      title: 'Demo',
      description: 'Ves la plataforma funcionando con datos reales. Sin compromisos.',
    },
    {
      number: '2',
      title: 'Migración',
      description: 'Pasamos toda tu información al sistema desde Excel u otro sistema.',
    },
    {
      number: '3',
      title: 'Configuración',
      description: 'Dejamos todo listo para tu negocio: artículos, precios, depósitos.',
    },
    {
      number: '4',
      title: 'Operación',
      description: 'Empezás a trabajar. Soporte real de lunes a sábado si lo necesitás.',
    },
  ],
  cta: {
    text: 'Quiero implementar ComercioCity',
    url: 'https://wa.me/+543444622139',
  },
  tagline: 'No instalamos software. Profesionalizamos negocios.',
}
</script>

<template>
  <section class="implementation-section py-5 py-lg-6">
    <div class="container">
      <div class="text-center mb-5">
        <h2 class="display-6 fw-bold mb-3">{{ content.title }}</h2>
        <p class="lead text-secondary">{{ content.subtitle }}</p>
      </div>

      <!-- Timeline desktop -->
      <div class="d-none d-md-block mb-5">
        <div class="timeline-wrapper position-relative">
          <div class="timeline-line"></div>
          <div class="row g-0">
            <div
              v-for="(step, index) in content.steps"
              :key="step.number"
              class="col text-center px-3"
            >
              <div class="step-number mx-auto mb-4">{{ step.number }}</div>
              <h3 class="h5 fw-bold mb-2">{{ step.title }}</h3>
              <p class="text-secondary small mb-0">{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline mobile (vertical) -->
      <div class="d-md-none mb-5">
        <div
          v-for="(step, index) in content.steps"
          :key="step.number"
          class="d-flex gap-4 mb-4"
        >
          <div class="flex-shrink-0 d-flex flex-column align-items-center">
            <div class="step-number">{{ step.number }}</div>
            <div v-if="index < content.steps.length - 1" class="step-vline"></div>
          </div>
          <div class="pb-2">
            <h3 class="h6 fw-bold mb-1">{{ step.title }}</h3>
            <p class="text-secondary small mb-0">{{ step.description }}</p>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="text-center">
        <p class="fw-semibold fst-italic mb-4" style="color: var(--cc-primary)">
          {{ content.tagline }}
        </p>
        <a
          :href="content.cta.url"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-success btn-lg px-4 py-3 fw-semibold"
        >
          <i class="bi bi-whatsapp me-2"></i>{{ content.cta.text }}
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.implementation-section {
  background-color: #fff;
}

.step-number {
  width: 56px;
  height: 56px;
  background-color: var(--cc-primary);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.95rem;
  position: relative;
  z-index: 1;
}

/* Línea horizontal (desktop) */
.timeline-wrapper {
  position: relative;
}

.timeline-line {
  position: absolute;
  top: 28px; /* mitad del círculo de 56px */
  left: 12.5%;
  right: 12.5%;
  height: 2px;
  background-color: var(--cc-primary-light);
  z-index: 0;
}

/* Línea vertical (mobile) */
.step-vline {
  width: 2px;
  flex: 1;
  min-height: 32px;
  background-color: var(--cc-primary-light);
  margin-top: 4px;
}
</style>
