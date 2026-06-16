<script setup>
import { ecommerceClients } from '../../data/clients.js'

const content = {
  title: 'Tiendas online de nuestros clientes',
  subtitle:
    'Negocios que ya venden con ComercioCity. Visitá sus tiendas y conocé cómo operan en la práctica.',
}
</script>

<template>
  <section id="tiendas" class="client-stores-section py-5 py-lg-6">
    <div class="container">
      <div class="text-center mb-5">
        <h2 class="display-6 fw-bold mb-3">{{ content.title }}</h2>
        <p class="lead text-secondary mb-0">{{ content.subtitle }}</p>
      </div>

      <div class="row g-4">
        <div
          v-for="store in ecommerceClients"
          :key="store.id"
          class="col-sm-6 col-lg-4 col-xl-3"
        >
          <component
            :is="store.storeUrl ? 'a' : 'div'"
            :href="store.storeUrl || undefined"
            :target="store.storeUrl ? '_blank' : undefined"
            :rel="store.storeUrl ? 'noopener noreferrer' : undefined"
            class="store-card h-100"
            :class="{ 'store-card--linked': store.storeUrl }"
            :aria-label="store.storeUrl ? `Visitar tienda de ${store.name}` : undefined"
          >
            <div class="store-card__logo">
              <img :src="store.logo" :alt="store.name" />
            </div>
            <div class="store-card__body">
              <h3 class="store-card__name h6 fw-bold mb-1">{{ store.name }}</h3>
              <p v-if="store.category" class="store-card__category text-muted small mb-3">
                {{ store.category }}
              </p>
              <span v-if="store.storeUrl" class="store-card__cta">
                Visitar tienda
                <i class="bi bi-box-arrow-up-right ms-1" aria-hidden="true"></i>
              </span>
            </div>
          </component>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.client-stores-section {
  background-color: #F0F5FA;
}

.store-card {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  color: inherit;
  text-decoration: none;
  transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
}

.store-card--linked {
  cursor: pointer;
}

.store-card--linked:hover {
  border-color: #bfdbfe;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.09), 0 8px 28px rgba(var(--cc-primary-rgb), 0.12);
  transform: translateY(-3px);
}

.store-card--linked:hover .store-card__cta {
  color: var(--cc-primary-dark);
}

.store-card__logo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  padding: 1.25rem;
  background-color: #fff;
  border-bottom: 1px solid #e2e8f0;
}

.store-card__logo img {
  max-width: 100%;
  max-height: 80px;
  object-fit: contain;
}

.store-card__body {
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.store-card__cta {
  margin-top: auto;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--cc-primary);
  transition: color 0.2s ease;
}
</style>
