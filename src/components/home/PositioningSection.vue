<script setup>
const content = {
  title: 'No es un sistema de facturación. Es otra cosa.',
  comparison: [
    {
      label: 'Lo que usás hoy',
      description: 'Excel, WhatsApp y papeles. Todo por separado, todo manual.',
      highlighted: false,
    },
    {
      label: 'Lo que te prometieron',
      description: "Un sistema que 'hace todo' y terminó siendo otra pantalla más.",
      highlighted: false,
    },
    {
      label: 'ComercioCity',
      description:
        'Una plataforma que opera con vos. Stock, ventas, ecommerce y facturación conectados.',
      highlighted: true,
    },
  ],
  footnote:
    'Colppy, Xubio y Contabilium facturan. ComercioCity opera. La diferencia la notás el primer día.',
}
</script>

<template>
  <section class="positioning-section py-5 py-lg-6">
    <div class="container">
      <h2 class="text-center display-6 fw-bold mb-5">{{ content.title }}</h2>

      <div class="row g-4 mb-4">
        <div v-for="(item, index) in content.comparison" :key="index" class="col-lg-4">
          <div
            class="comparison-card h-100 p-4 rounded-4"
            :class="item.highlighted ? 'comparison-card--highlighted' : 'comparison-card--default'"
          >
            <p
              class="small fw-semibold text-uppercase mb-3"
              :class="item.highlighted ? 'text-white opacity-75' : 'text-muted'"
              style="letter-spacing: 0.07em"
            >
              {{ item.label }}
            </p>
            <p
              class="fs-5 mb-0"
              :class="item.highlighted ? 'text-white fw-semibold' : 'text-secondary'"
            >
              {{ item.description }}
            </p>
            <div v-if="item.highlighted" class="mt-4">
              <i class="bi bi-check-circle-fill fs-3 text-warning"></i>
            </div>
          </div>
        </div>
      </div>

      <p class="text-center text-muted fst-italic mt-2">{{ content.footnote }}</p>
    </div>
  </section>
</template>

<style scoped>
.positioning-section {
  background-color: #fff;
}

.comparison-card--default {
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
}

.comparison-card--highlighted {
  background-color: var(--cc-primary);
  border: none;
  box-shadow: 0 12px 40px rgba(var(--cc-primary-rgb), 0.28);
}
</style>
