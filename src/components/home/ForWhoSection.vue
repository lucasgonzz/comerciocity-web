<script setup>
const content = {
  title: 'Hecho para negocios como el tuyo',
  subtitle: 'Si vendés productos y tenés entre 2 y 20 empleados, ComercioCity es para vos.',
  segments: [
    { icon: 'bi-boxes', label: 'Distribuidoras' },
    { icon: 'bi-tools', label: 'Ferreterías' },
    { icon: 'bi-droplet', label: 'Sanitarios y bulonerías' },
    { icon: 'bi-shop', label: 'Almacenes y supermercados' },
    { icon: 'bi-box-seam', label: 'Mayoristas y minoristas' },
    { icon: 'bi-hammer', label: 'Negocios con producción propia' },
  ],
}
</script>

<template>
  <section class="for-who-section py-5 py-lg-6">
    <div class="container">
      <div class="text-center mb-5">
        <h2 class="display-6 fw-bold mb-3">{{ content.title }}</h2>
        <p class="lead text-secondary">{{ content.subtitle }}</p>
      </div>

      <div class="row g-4">
        <div
          v-for="(segment, index) in content.segments"
          :key="index"
          class="col-6 col-md-4"
        >
          <div class="segment-card text-center p-4 rounded-4 h-100">
            <i :class="`bi ${segment.icon} segment-icon d-block mb-3`"></i>
            <span class="fw-semibold">{{ segment.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.for-who-section {
  background-color: #f0f7ff;
}

.segment-card {
  background-color: #fff;
  border: 1px solid #dbeafe;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.segment-card:hover {
  box-shadow: 0 6px 20px rgba(var(--cc-primary-rgb), 0.14);
  transform: translateY(-2px);
}

.segment-icon {
  font-size: 2.2rem;
  color: var(--cc-primary);
}
</style>
