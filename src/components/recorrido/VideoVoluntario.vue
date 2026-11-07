<template>
  <figure class="video-voluntario" :aria-labelledby="id + '-titulo'">
    <figcaption class="video-voluntario__cabecera">
      <h3 :id="id + '-titulo'">{{ video.title }}</h3>
      <p :id="id + '-detalle'">{{ descripcion }}</p>
      <span class="video-voluntario__nota">{{ video.duration }} · Con audio y subtítulos incluidos</span>
    </figcaption>
    <div class="video-voluntario__pantalla" :aria-busy="cargando">
      <button
        v-if="!abierto"
        type="button"
        class="video-voluntario__inicio"
        :aria-label="'Reproducir ' + video.title"
        :aria-describedby="id + '-detalle'"
        @click="reproducir"
      >
        <span class="video-voluntario__play" aria-hidden="true">▶</span>
        <span>Ver el video</span>
        <small>Vos elegís cuándo empezar</small>
      </button>
      <video
        v-else
        ref="reproductor"
        class="video-voluntario__video"
        :src="video.url"
        :aria-label="video.title"
        :aria-describedby="id + '-detalle'"
        controls
        playsinline
        preload="none"
        @loadstart="cargando = true"
        @waiting="cargando = true"
        @canplay="cargando = false"
        @playing="al_reproducir"
        @pause="cargando = false"
        @ended="cargando = false"
        @error="al_error"
      >
        <!-- El MP4 ya tiene subtítulos en imagen. La pista accesible no se activa por defecto. -->
        <track kind="captions" :src="subtitulos" srclang="es" label="Español" />
        Tu navegador no puede reproducir este video.
      </video>
    </div>
    <p v-if="cargando && !fallo" class="video-voluntario__estado" role="status">Cargando el video…</p>
    <div v-if="fallo" class="video-voluntario__error" role="status">
      <p>No pudimos cargar el video. Podés seguir recorriendo la página o volver a intentarlo.</p>
      <button type="button" @click="reintentar">Volver a intentar</button>
    </div>
    <p v-else-if="pedir_play" class="video-voluntario__estado" role="status">
      Usá el botón de reproducción del video para empezar.
    </p>
  </figure>
</template>

<script>
import { pausar_otros } from '../../videos/reproduccion.js'

export default {
  name: 'VideoVoluntario',
  props: {
    id: { type: String, required: true },
    video: { type: Object, required: true },
    descripcion: { type: String, required: true },
    subtitulos: { type: String, required: true },
  },
  data() {
    return { abierto: false, cargando: false, fallo: false, pedir_play: false }
  },
  mounted() {
    document.addEventListener('play', this.coordinar_audio, true)
    document.addEventListener('visibilitychange', this.al_ocultar)
    window.addEventListener('pagehide', this.pausar)
  },
  beforeUnmount() {
    this.pausar()
    document.removeEventListener('play', this.coordinar_audio, true)
    document.removeEventListener('visibilitychange', this.al_ocultar)
    window.removeEventListener('pagehide', this.pausar)
  },
  methods: {
    async reproducir() {
      this.abierto = true
      this.fallo = false
      this.pedir_play = false
      await this.$nextTick()
      const video = this.$refs.reproductor
      if (!video) return
      video.focus()
      try {
        await video.play()
      } catch (error) {
        this.cargando = false
        if (error.name === 'NotAllowedError') this.pedir_play = true
        else if (error.name !== 'AbortError') this.al_error()
      }
    },
    async reintentar() {
      this.pausar()
      this.abierto = false
      await this.$nextTick()
      await this.reproducir()
    },
    al_reproducir() {
      this.cargando = false
      this.fallo = false
      this.pedir_play = false
      pausar_otros(this.$refs.reproductor, document)
    },
    coordinar_audio(evento) {
      if (evento.target !== this.$refs.reproductor) this.pausar()
    },
    al_error() {
      this.cargando = false
      this.fallo = true
    },
    pausar() {
      this.$refs.reproductor?.pause()
    },
    al_ocultar() {
      if (document.hidden) this.pausar()
    },
  },
}
</script>

<style scoped>
.video-voluntario { width: 100%; min-width: 0; margin: 0; text-align: left; }
.video-voluntario__cabecera { margin-bottom: 18px; }
.video-voluntario__cabecera h3 { margin: 0 0 8px; font-size: clamp(1.3rem, 3vw, 1.8rem); color: #fff; line-height: 1.2; }
.video-voluntario__cabecera p { margin: 0 0 8px; color: #c5cee2; font-size: 1rem; line-height: 1.5; }
.video-voluntario__nota { color: #aebbd4; font-size: 0.85rem; }
.video-voluntario__pantalla { position: relative; aspect-ratio: 16 / 9; border: 1px solid #626e8b; border-radius: 16px; overflow: hidden; background: #040915; }
.video-voluntario__inicio { width: 100%; height: 100%; padding: 20px; border: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; background: radial-gradient(ellipse at center, #202f64, #080f24); color: #fff; cursor: pointer; font-size: clamp(1rem, 2.4vw, 1.25rem); font-weight: 600; }
.video-voluntario__inicio:hover { background: radial-gradient(ellipse at center, #2b3f83, #080f24); }
.video-voluntario__inicio small { font-size: 0.8rem; font-weight: 400; color: #c5cee2; }
.video-voluntario__play { display: grid; place-items: center; border-radius: 50%; width: clamp(44px, 6vw, 64px); height: clamp(44px, 6vw, 64px); padding-left: 3px; background: #ff9636; color: #141a2c; font-size: 1.35rem; }
.video-voluntario__video { display: block; width: 100%; height: 100%; object-fit: contain; }
.video-voluntario__inicio:focus-visible, .video-voluntario__video:focus-visible { outline: 3px solid #ffb36b; outline-offset: -5px; }
.video-voluntario__estado, .video-voluntario__error { margin: 12px 0 0; color: #dbe3f5; line-height: 1.5; font-size: 0.95rem; }
.video-voluntario__error p { margin-bottom: 10px; }
.video-voluntario__error button { min-height: 44px; padding: 9px 16px; border: 1px solid #ffb36b; border-radius: 8px; background: transparent; color: #ffb36b; cursor: pointer; }
.video-voluntario__error button:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }
</style>
