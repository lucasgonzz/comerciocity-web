<template>
  <!-- Cómo arrancás: los tres pasos de la prueba, con las palabras del guion de bienvenida (datos.js → PASOS). -->
  <section class="lnd-seccion" data-seccion="como_arrancas">
    <div class="lnd-contenedor">
      <p class="lnd-eyebrow">Cómo arrancás</p>
      <h2 class="lnd-h2">En 7 días lo probás con tu negocio</h2>
      <ol class="lnd-pasos">
        <li v-for="(paso, i) in pasos" :key="paso.titulo" class="lnd-paso">
          <span class="lnd-paso__n" aria-hidden="true">{{ i + 1 }}</span>
          <div>
            <h3>{{ paso.titulo }}</h3>
            <p>{{ paso.texto }}</p>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>

<script>
import { PASOS } from './datos'

export default {
  name: 'ComoArrancas',

  data() {
    return { pasos: PASOS }
  },
}
</script>
