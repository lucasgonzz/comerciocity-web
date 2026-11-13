<template>
  <!-- Pantalla 2: quién lo usa (logos reales de la pared de clientes), la ficha de Google y el video corto del
       sistema funcionando. El video NO se baja hasta que se toca: el póster es un webp de 16 KB. -->
  <section class="lnd-seccion" data-seccion="clientes">
    <div class="lnd-contenedor lnd-social">
      <div>
        <p class="lnd-eyebrow">{{ negocios }}</p>
        <ul class="lnd-logos" aria-label="Algunos de los negocios que usan ComercioCity">
          <li v-for="logo in logos" :key="logo.id">
            <img :src="logo.url" :alt="logo.nombre" width="320" height="320" loading="lazy" decoding="async" />
          </li>
        </ul>
        <a class="lnd-estrellas" :href="google.perfil" target="_blank" rel="noopener noreferrer">
          <b aria-hidden="true">★★★★★</b>
          <span>{{ google.promedio }} en Google · {{ google.cantidad }} reseñas</span>
        </a>
      </div>

      <div class="lnd-video">
        <video
          v-if="reproduciendo"
          ref="video"
          :src="video.url"
          :aria-label="video.titulo"
          controls
          autoplay
          playsinline
          preload="none"
          @play="al_reproducir"
        ></video>
        <button
          v-else
          type="button"
          class="lnd-video__boton"
          :aria-label="'Reproducir el video: ' + video.titulo"
          @click="reproducir"
        >
          <img :src="poster" alt="" width="540" height="960" loading="lazy" decoding="async" />
          <span class="lnd-video__play" aria-hidden="true">
            <span><svg viewBox="0 0 24 24"><path d="M6 4l15 8-15 8z" fill="#0b84f8" /></svg></span>
          </span>
          <span class="lnd-video__dur" aria-hidden="true">Miralo funcionando · {{ duracion }}</span>
        </button>
      </div>
    </div>
  </section>
</template>

<script>
import { logo_cliente } from '../recorrido/clientes'
import { duracion } from '../recorrido/testimonios'
import { pausar_otros } from '../../videos/reproduccion'
import { GOOGLE, NEGOCIOS_QUE_LO_USAN, VIDEO_FUNCIONANDO } from './datos'
import poster from '../../assets/landing/poster-video-atencion.webp'

/**
 * Los ocho logos de la maqueta. Todos son clientes reales que figuran en `recorrido/clientes.js` (la pared de
 * logos de la página anterior) y en el admin de producción al 13/11/2026.
 */
const LOGOS = [
  { id: 'ferretotal', nombre: 'Ferretotal' },
  { id: 'fenix', nombre: 'Fenix Mayorista' },
  { id: 'innovate', nombre: 'Innovate Materiales' },
  { id: 'truvari', nombre: 'Truvari Bebidas' },
  { id: 'ferreteria-san-blas', nombre: 'Ferretería San Blas' },
  { id: 'hb-distribuciones', nombre: 'HB Distribuciones' },
  { id: 'masquito', nombre: 'Masquito' },
  { id: 'sr-imperio', nombre: 'Sr. Imperio' },
]

export default {
  name: 'PruebaSocial',

  props: {
    emitir_evento: { type: Function, default: function () {} },
  },

  data() {
    return {
      negocios: NEGOCIOS_QUE_LO_USAN,
      google: GOOGLE,
      video: VIDEO_FUNCIONANDO,
      duracion: duracion(VIDEO_FUNCIONANDO.segundos),
      poster,
      reproduciendo: false,
      logos: LOGOS.map(function (logo) {
        return Object.assign({ url: logo_cliente(logo.id) }, logo)
      }),
    }
  },

  methods: {
    /** Cambia el póster por el reproductor y lo arranca (con el toque del visitante, así el audio puede sonar). */
    reproducir() {
      this.reproduciendo = true
      this.emitir_evento('video_funcionando_abierto', {})
    },

    /** Un solo audio a la vez en toda la página (el mismo criterio que los testimonios). */
    al_reproducir(evento) {
      pausar_otros(evento.target, evento.target.ownerDocument)
    },
  },
}
</script>
