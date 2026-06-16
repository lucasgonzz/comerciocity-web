<script setup>
const content = {
  title: '¿Por qué ComercioCity y no otro sistema?',
  rows: [
    {
      feature: 'Implementación',
      others: 'Te dan usuario y contraseña, te dejan solo',
      us: 'Nuestro equipo hace todo el proceso',
    },
    {
      feature: 'Límites',
      others: 'Pagan más cuando crecen',
      us: 'Sin límites de artículos ni usuarios extra obligatorios',
    },
    {
      feature: 'Ecommerce',
      others: 'Sin integración real o con costo extra',
      us: 'Ecommerce + Mercado Libre + Tienda Nube en tiempo real',
    },
    {
      feature: 'Multimoneda',
      others: 'Parcial o inexistente',
      us: 'Pesos y dólares en toda la operación',
    },
    {
      feature: 'Módulo de producción',
      others: 'No disponible',
      us: 'Gestión completa de fabricación propia',
    },
    {
      feature: 'Soporte',
      others: 'Bot o ticket',
      us: 'Persona real, lunes a sábados',
    },
  ],
}
</script>

<template>
  <section class="comparison-section py-5 py-lg-6">
    <div class="container">
      <h2 class="text-center display-6 fw-bold mb-5">{{ content.title }}</h2>

      <div class="table-responsive">
        <table class="comparison-table w-100">
          <thead>
            <tr>
              <th class="col-feature">Característica</th>
              <th class="col-others text-center">Otros sistemas</th>
              <th class="col-us text-center">
                <span class="d-flex align-items-center justify-content-center gap-2">
                  <i class="bi bi-check-circle-fill"></i> ComercioCity
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in content.rows" :key="index">
              <td class="fw-semibold">{{ row.feature }}</td>
              <td class="text-center text-secondary">
                <i class="bi bi-x-circle text-danger me-1"></i>{{ row.others }}
              </td>
              <td class="col-us-body text-center">
                <i class="bi bi-check-circle-fill text-success me-1"></i>{{ row.us }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<style scoped>
.comparison-section {
  background-color: #f8fafc;
}

.comparison-table {
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.comparison-table thead tr {
  background-color: #1e293b;
  color: #fff;
}

.comparison-table thead th {
  padding: 1rem 1.25rem;
  font-weight: 600;
  border: none;
  font-size: 0.95rem;
}

.comparison-table thead .col-us {
  background-color: var(--cc-primary);
  color: #fff;
}

.comparison-table tbody tr {
  border-bottom: 1px solid #f1f5f9;
}

.comparison-table tbody tr:last-child td {
  border-bottom: none;
}

.comparison-table tbody tr:hover {
  background-color: #fafbfc;
}

.comparison-table tbody td {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.comparison-table tbody .col-us-body {
  background-color: #f0f7ff;
  color: #1e40af;
  font-weight: 500;
}

.col-feature {
  width: 22%;
}

.col-others {
  width: 39%;
}

.col-us {
  width: 39%;
}
</style>
