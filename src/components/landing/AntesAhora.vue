<template>
  <!-- El bloque de la propuesta B («Lo que cambia en tu día»): cuatro casos con los cuadros reales de los reels de
       Lucas, el «antes» en blanco y negro y el «ahora» con la conversación con el asistente. Continúa la historia
       de los anuncios. -->
  <section class="lnd-seccion" data-seccion="antes_ahora">
    <div class="lnd-contenedor">
      <p class="lnd-eyebrow">Lo que cambia en tu día</p>
      <h2 class="lnd-h2">Antes y ahora</h2>

      <ul class="lnd-aa">
        <li v-for="caso in casos" :key="caso.clave" class="lnd-aa__item">
          <div class="lnd-aa__imgs">
            <figure class="lnd-aa__antes">
              <img :src="caso.img_antes" alt="" width="480" height="409" loading="lazy" decoding="async" />
              <figcaption>ANTES</figcaption>
            </figure>
            <figure class="lnd-aa__ahora">
              <img :src="caso.img_ahora" :alt="caso.alt_ahora" width="480" height="654" loading="lazy" decoding="async" />
              <figcaption>AHORA</figcaption>
            </figure>
          </div>
          <div class="lnd-aa__txt">
            <h3>{{ caso.titulo }}</h3>
            <p><b>Antes:</b> {{ caso.antes }} <b>Ahora:</b> {{ caso.ahora }}</p>
            <span class="lnd-etiqueta">{{ caso.parte }}</span>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
import { ANTES_AHORA } from './datos'

/**
 * Las imágenes, por literal: Vite necesita ver el patrón para emitir los assets en el build (con una ruta armada
 * por concatenación, en producción quedan rotas aunque en desarrollo se vean).
 *
 * @param {string} nombre
 * @returns {string}
 */
function imagen(nombre) {
  return new URL(`../../assets/landing/${nombre}.webp`, import.meta.url).href
}

export default {
  name: 'AntesAhora',

  data() {
    return {
      casos: ANTES_AHORA.map(function (caso) {
        return Object.assign({}, caso, {
          img_antes: imagen('antes-' + caso.clave),
          img_ahora: imagen('chat-' + (caso.imagen_ahora || caso.clave)),
        })
      }),
    }
  },
}
</script>
