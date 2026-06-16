<script setup>
const content = {
  title: 'Todo lo que necesita tu negocio, en un solo lugar',
  subtitle:
    'Cada funcionalidad está pensada para cómo trabajan las distribuidoras y comercios argentinos.',
  features: [
    {
      icon: 'bi-images',
      title: 'Catálogo Inteligente',
      description: 'Hacés clic en un artículo y las imágenes aparecen solas. Sin cargar nada a mano.',
      // media: '/videos/catalogo.gif',
    },
    {
      icon: 'bi-shop',
      title: 'Ecommerce en tiempo real',
      description: 'Cambiás un precio y se actualiza solo en tu tienda, Mercado Libre y Tienda Nube.',
      // media: '/videos/ecommerce.gif',
    },
    {
      icon: 'bi-building',
      title: 'Multi-depósito',
      description: 'Cada sucursal con su propio stock. Todo visible desde un solo lugar, en tiempo real.',
      media: null,
    },
    {
      icon: 'bi-currency-exchange',
      title: 'Multimoneda real',
      description: 'Comprás en pesos y dólares, vendés en pesos y dolares. El sistema lo entiende solo.',
      media: null,
    },
    {
      icon: 'bi-file-earmark-excel',
      title: 'Importación desde Excel',
      description: 'Subís tu catálogo o lista de precios y el sistema lo procesa en segundos.',
      media: null,
    },
    {
      icon: 'bi-gear',
      title: 'Módulo de producción',
      description: 'Fabricás productos propios. El sistema descuenta insumos etapa por etapa.',
      media: null,
    },
    {
      icon: 'bi-people',
      title: 'Cuentas corrientes',
      description: 'Clientes y proveedores con saldo en tiempo real, conectado al ecommerce.',
      media: null,
    },
    {
      icon: 'bi-receipt',
      title: 'Facturación ARCA',
      description: 'Vos elegís qué autorizás. El sistema registra todo, facturás lo que querés.',
      media: null,
    },
  ],
}
</script>

<template>
  <section id="funciones" class="features-section py-5 py-lg-6">
    <div class="container">
      <div class="text-center mb-5">
        <h2 class="display-6 fw-bold mb-3">{{ content.title }}</h2>
        <p class="lead text-secondary mx-auto" style="max-width: 620px">{{ content.subtitle }}</p>
      </div>

      <div class="row g-4">
        <div
          v-for="(feature, index) in content.features"
          :key="index"
          class="col-12 col-sm-6 col-xl-3"
        >
          <div class="feature-card h-100 p-4 rounded-4">
            <div class="feature-icon mb-3">
              <i :class="`bi ${feature.icon}`"></i>
            </div>
            <h3 class="h6 fw-bold mb-2">{{ feature.title }}</h3>
            <p class="text-secondary small mb-0">{{ feature.description }}</p>
            <div v-if="feature.media" class="feature-media mt-3 rounded-3 overflow-hidden">
              <img :src="feature.media" :alt="feature.title" class="w-100" loading="lazy" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.features-section {
  background-color: #f8fafc;
}

.feature-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.feature-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.09);
  transform: translateY(-2px);
}

.feature-icon {
  width: 48px;
  height: 48px;
  background-color: var(--cc-primary-light);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-icon i {
  font-size: 1.4rem;
  color: var(--cc-primary);
}

.feature-media img {
  object-fit: cover;
}
</style>
