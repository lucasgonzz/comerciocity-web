<template>
  <div v-if="tarea || historia" class="videos-landing">
    <video-voluntario
      v-if="tarea"
      id="video-una-tarea-menos"
      :video="tarea"
      :subtitulos="subtitulos_tarea"
      descripcion="Lucas te muestra cómo se conectan un precio, un presupuesto y las consultas de tus clientes."
    />
    <details v-if="historia" class="videos-landing__historia" @toggle="historia_abierta = $event.target.open">
      <summary>Conocé la historia <span aria-hidden="true">↗</span></summary>
      <div class="videos-landing__historia-contenido">
        <video-voluntario
          v-if="historia_abierta"
          id="video-historia-comerciocity"
          :video="historia"
          :subtitulos="subtitulos_historia"
          descripcion="Del quiosco familiar en Gualeguay a una plataforma donde Gestión, Tienda y Agentes comparten la misma información."
        />
      </div>
    </details>
  </div>
</template>

<script>
import VideoVoluntario from './VideoVoluntario.vue'
import manifiesto from '../../videos/landing-manifest.json'
import { seleccionar_video } from '../../videos/disponibilidad.js'
import subtitulos_tarea from '../../assets/videos/01-una-tarea-menos-v6.es.vtt?url&no-inline'
import subtitulos_historia from '../../assets/videos/02-historia-de-comerciocity-v4.es.vtt?url&no-inline'

export default {
  name: 'VideosLanding',
  components: { VideoVoluntario },
  data() {
    return {
      tarea: seleccionar_video(manifiesto.videos.tarea, import.meta.env),
      historia: seleccionar_video(manifiesto.videos.historia, import.meta.env),
      subtitulos_tarea,
      subtitulos_historia,
      historia_abierta: false,
    }
  },
}
</script>

<style scoped>
.videos-landing { width: 100%; max-width: 860px; margin: clamp(28px, 5vw, 48px) 0 0; }
.videos-landing__historia { margin-top: 24px; border-top: 1px solid #4e5b77; text-align: left; }
.videos-landing__historia summary { min-height: 48px; padding: 16px 2px; cursor: pointer; color: #ffb36b; font-weight: 600; }
.videos-landing__historia summary span { margin-left: 8px; }
.videos-landing__historia summary:focus-visible { outline: 3px solid #ffb36b; outline-offset: 3px; border-radius: 3px; }
.videos-landing__historia-contenido { padding: 8px 0 4px; }
</style>
