<script setup>
import { clientLogos } from '../../data/clients.js'

const content = {
  label: 'Negocios que ya operan con ComercioCity',
}
</script>

<template>
  <section class="clients-strip py-5">
    <div class="container">
      <p class="text-center text-muted fw-semibold small text-uppercase mb-4" style="letter-spacing: 0.08em">
        {{ content.label }}
      </p>
      <div class="d-flex flex-wrap justify-content-center align-items-center gap-4 gap-lg-5">
        <div v-for="logo in clientLogos" :key="logo.id" class="logo-wrapper">
          <img :src="logo.src" :alt="logo.name" class="client-logo" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.clients-strip {
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
  border-bottom: 1px solid #e9ecef;
}

.logo-wrapper {
  width: 160px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #dee2e6;
  border-radius: 12px;
  overflow: hidden;
}

.client-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 12px;
  box-sizing: border-box;
  filter: grayscale(100%);
  opacity: 0.55;
  transition: opacity 0.25s;
}

.client-logo:hover {
  opacity: 0.85;
}
</style>
