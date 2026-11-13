<template>
  <!-- Preguntas frecuentes. <details> nativo: se abre con el teclado y con el lector de pantalla sin código propio.
       Las respuestas están en datos.js, con su fuente. La de «¿Quiénes están detrás?» trae el video de la historia
       (pieza 02 de la serie pizarra, la que ya publicaba la página anterior), que se baja recién al tocarlo. -->
  <section class="lnd-seccion lnd-seccion--alt" data-seccion="preguntas">
    <div class="lnd-contenedor">
      <p class="lnd-eyebrow">Preguntas frecuentes</p>
      <div class="lnd-faq">
        <details v-for="item in preguntas" :key="item.clave" @toggle="al_abrir(item, $event)">
          <summary>{{ item.pregunta }}</summary>
          <p class="lnd-faq__respuesta">{{ item.respuesta }}</p>
          <div v-if="item.historia && historia" class="lnd-faq__video">
            <video
              v-if="historia_abierta"
              :src="historia.url"
              :aria-label="historia.title"
              controls
              autoplay
              playsinline
              preload="none"
              @play="al_reproducir"
            >
              <track kind="captions" :src="subtitulos_historia" srclang="es" label="Español" />
            </video>
            <button v-else type="button" class="lnd-faq__video-boton" @click="abrir_historia">
              ▶ Ver «{{ historia.title }}» · {{ historia.duration }}
            </button>
          </div>
        </details>
      </div>
    </div>
  </section>
</template>

<script>
import { PREGUNTAS } from './datos'
import manifiesto from '../../videos/landing-manifest.json'
import { seleccionar_video } from '../../videos/disponibilidad.js'
import { pausar_otros } from '../../videos/reproduccion.js'
import subtitulos_historia from '../../assets/videos/02-historia-de-comerciocity-claude-v1.es.vtt?url&no-inline'

export default {
  name: 'Preguntas',

  props: {
    emitir_evento: { type: Function, default: function () {} },
  },

  data() {
    return {
      preguntas: PREGUNTAS,
      /** El video de la historia, solo si está publicado y verificado (si no, la pregunta queda sin video). */
      historia: seleccionar_video(manifiesto.videos.historia, import.meta.env),
      subtitulos_historia,
      historia_abierta: false,
    }
  },

  methods: {
    /**
     * Telemetría de la página (el píxel la ignora): qué preguntas se abren.
     *
     * @param {object} item
     * @param {Event} evento
     */
    al_abrir(item, evento) {
      if (evento.target.open) {
        this.emitir_evento('pregunta_abierta', { pregunta: item.clave })
      } else if (item.historia) {
        /* Cerrar la pregunta frena el video. */
        const video = evento.target.querySelector('video')
        if (video) {
          video.pause()
        }
      }
    },

    /** @returns {void} */
    abrir_historia() {
      this.historia_abierta = true
    },

    /** Un solo audio a la vez en toda la página. */
    al_reproducir(evento) {
      pausar_otros(evento.target, evento.target.ownerDocument)
    },
  },
}
</script>
