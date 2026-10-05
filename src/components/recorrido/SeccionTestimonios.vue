<template>
  <!-- Los testimonios en video, por negocio (4/10/2026). Primero los negocios que grabaron
       uno; al tocar uno aparecen todos sus clips. La lista crece sola desde testimonios.js a
       medida que Tomás hace más videollamadas y salen más cortes. -->
  <section ref="seccion" class="demo-testimonios demo-seccion-flujo">
    <div ref="grupo" class="demo-testimonios__grupo" :style="estilo_grupo('grupo')">
      <p class="demo-rotulo demo-paso">Testimonios</p>
      <h2 class="demo-titulo-seccion demo-paso">Lo cuentan ellos.</h2>
      <p class="demo-bajada-seccion demo-testimonios__bajada demo-paso">
        Dueños de negocios reales, en sus palabras. Tocá un negocio para ver sus videos.
      </p>

      <ul class="demo-testimonios__negocios">
        <li v-for="negocio in negocios" :key="negocio.id" class="demo-paso">
          <button
            type="button"
            class="demo-testimonios__negocio"
            :class="{ 'demo-testimonios__negocio--activo': activo === negocio.id }"
            :aria-expanded="activo === negocio.id ? 'true' : 'false'"
            :aria-controls="'demo-testimonios-panel'"
            @click="alternar(negocio.id)"
          >
            <span class="demo-testimonios__logo-caja">
              <img :src="negocio.logo_url" :alt="negocio.negocio" class="demo-testimonios__logo" loading="lazy" decoding="async" />
            </span>
            <span class="demo-testimonios__negocio-datos">
              <span class="demo-testimonios__negocio-nombre">{{ negocio.negocio }}</span>
              <span class="demo-testimonios__negocio-rubro">{{ negocio.persona }} · {{ negocio.rubro }}</span>
              <span class="demo-testimonios__cita">“{{ negocio.cita }}”</span>
              <span class="demo-testimonios__cantidad">
                <i class="bi bi-play-circle" aria-hidden="true"></i>
                {{ etiqueta_cantidad(negocio) }}
              </span>
            </span>
            <i
              class="bi demo-testimonios__chevron"
              :class="activo === negocio.id ? 'bi-chevron-up' : 'bi-chevron-down'"
              aria-hidden="true"
            ></i>
          </button>
        </li>
      </ul>
    </div>

    <!-- El panel de clips del negocio elegido. Fuera del grupo con entrada por scroll: aparece
         por un clic, no por el progreso. -->
    <div
      v-if="negocio_activo"
      id="demo-testimonios-panel"
      ref="panel"
      class="demo-testimonios__panel"
    >
      <div class="demo-testimonios__panel-cabecera">
        <p class="demo-testimonios__panel-titulo">
          {{ negocio_activo.persona }}, de {{ negocio_activo.negocio }}
        </p>
        <button type="button" class="demo-testimonios__cerrar" aria-label="Cerrar los videos" @click="cerrar">
          <i class="bi bi-x-lg" aria-hidden="true"></i>
        </button>
      </div>

      <ul v-if="negocio_activo.clips.length" class="demo-testimonios__clips">
        <li v-for="clip in negocio_activo.clips" :key="clip.id" class="demo-testimonios__clip">
          <!-- Hasta que se toca, solo la miniatura (una imagen de 15 KB): los videos pesan
               entre 5 y 24 MB y no se bajan hasta que alguien los quiere ver. Al tocar, el
               <video> reemplaza a la miniatura y arranca; uno solo a la vez. -->
          <video
            v-if="reproduciendo === clip.id"
            class="demo-testimonios__video"
            :src="clip.url + '#t=0.001'"
            :poster="clip.poster"
            :aria-label="'Testimonio de ' + negocio_activo.persona + ': ' + clip.titulo"
            controls
            autoplay
            playsinline
            preload="metadata"
            @ended="reproduciendo = null"
          ></video>
          <button
            v-else
            type="button"
            class="demo-testimonios__miniatura"
            :aria-label="'Reproducir: ' + clip.titulo"
            @click="reproducir(clip.id)"
          >
            <img :src="clip.poster" alt="" class="demo-testimonios__poster" loading="lazy" decoding="async" />
            <span class="demo-testimonios__play" aria-hidden="true"><i class="bi bi-play-fill"></i></span>
            <span class="demo-testimonios__duracion" aria-hidden="true">{{ duracion(clip.segundos) }}</span>
          </button>
          <p class="demo-testimonios__clip-titulo">{{ clip.titulo }}</p>
        </li>
      </ul>

      <!-- La entrevista completa, apaisada, para el que quiere escuchar todo. -->
      <div v-if="negocio_activo.entrevista" class="demo-testimonios__entrevista">
        <p class="demo-testimonios__entrevista-titulo">
          {{ negocio_activo.entrevista.titulo }}
          <span class="demo-testimonios__entrevista-duracion">· {{ duracion(negocio_activo.entrevista.segundos) }}</span>
        </p>
        <video
          class="demo-testimonios__entrevista-video"
          :src="negocio_activo.entrevista.url + '#t=0.001'"
          :aria-label="'Entrevista completa a ' + negocio_activo.persona + ', de ' + negocio_activo.negocio"
          controls
          playsinline
          preload="none"
        ></video>
      </div>
    </div>
  </section>
</template>

<script>
import entrada_por_scroll from './entrada-por-scroll'
import { testimonios, duracion } from './testimonios'
import { logo_cliente } from './clientes'

export default {
  name: 'SeccionTestimonios',

  mixins: [entrada_por_scroll],

  props: {
    emitir_evento: {
      type: Function,
      default: function () {},
    },
  },

  data() {
    return {
      /** id del negocio cuyos clips se ven, o null. */
      activo: null,
      /** id del clip que se está reproduciendo, o null. */
      reproduciendo: null,
    }
  },

  computed: {
    /** @returns {Array} */
    negocios() {
      return testimonios.map(function (t) {
        return Object.assign({}, t, { logo_url: logo_cliente(t.logo) })
      })
    },

    /** @returns {Object|null} */
    negocio_activo() {
      const self = this
      return this.negocios.find(function (n) {
        return n.id === self.activo
      }) || null
    },
  },

  methods: {
    grupos() {
      return { grupo: this.$refs.grupo }
    },

    duracion,

    /**
     * @param {Object} negocio
     * @returns {string}
     */
    etiqueta_cantidad(negocio) {
      const n = negocio.clips.length
      if (n === 0) {
        return 'Entrevista completa'
      }
      return n + (n === 1 ? ' video' : ' videos') + (negocio.entrevista ? ' + entrevista' : '')
    },

    /**
     * @param {string} id
     * @returns {void}
     */
    alternar(id) {
      this.reproduciendo = null
      if (this.activo === id) {
        this.activo = null
        return
      }
      this.activo = id
      this.emitir_evento('testimonio_abierto', { negocio: id })

      /* Llevar el panel a la vista: la sección mide más que una pantalla cuando está
         abierto, y el avance guiado deja pasar el scroll nativo adentro. */
      const self = this
      this.$nextTick(function () {
        const panel = self.$refs.panel
        if (panel && typeof panel.scrollIntoView === 'function') {
          panel.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
    },

    /** @returns {void} */
    cerrar() {
      this.reproduciendo = null
      this.activo = null
    },

    /**
     * @param {string} id
     * @returns {void}
     */
    reproducir(id) {
      this.reproduciendo = id
      this.emitir_evento('testimonio_reproducido', { clip: id })
    },
  },
}
</script>

<style scoped>
.demo-testimonios__grupo {
  --p: 1;
  width: 100%;
  max-width: 1040px;
  margin: 0 auto;
  text-align: center;
}

.demo-testimonios__bajada {
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
}

.demo-testimonios__negocios {
  list-style: none;
  margin: clamp(32px, 5vw, 56px) 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(12px, 1.6vw, 18px);
  text-align: left;
}

/* La tarjeta del negocio es un botón: abre sus clips. */
.demo-testimonios__negocio {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: clamp(16px, 2vw, 22px);
  border: 1px solid var(--demo-color-borde-superficie);
  border-radius: 18px;
  background: var(--demo-color-superficie);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.demo-testimonios__negocio:hover {
  border-color: rgba(11, 132, 248, 0.35);
  box-shadow: 0 10px 28px -14px rgba(28, 35, 51, 0.3);
  transform: translateY(-2px);
}

.demo-testimonios__negocio:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(11, 132, 248, 0.35);
}

.demo-testimonios__negocio--activo {
  border-color: transparent;
  box-shadow: 0 0 0 2px var(--demo-color-azul), 0 14px 32px -16px rgba(11, 132, 248, 0.5);
}

.demo-testimonios__logo-caja {
  flex: 0 0 auto;
  width: 60px;
  height: 60px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border: 1px solid rgba(28, 35, 51, 0.08);
  border-radius: 14px;
  background: #fff;
}

.demo-testimonios__logo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.demo-testimonios__negocio-datos {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1 1 auto;
}

.demo-testimonios__negocio-nombre {
  font-size: clamp(1.05rem, 1.4vw, 1.15rem);
  font-weight: 700;
  color: var(--demo-color-texto);
}

.demo-testimonios__negocio-rubro {
  font-size: 0.85rem;
  color: var(--demo-color-texto-suave);
}

.demo-testimonios__cita {
  margin-top: 8px;
  font-size: clamp(0.98rem, 1.3vw, 1.05rem);
  font-style: italic;
  line-height: 1.45;
  color: var(--demo-color-texto);
}

.demo-testimonios__cantidad {
  margin-top: 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--demo-color-azul);
}

.demo-testimonios__chevron {
  flex: 0 0 auto;
  margin-top: 4px;
  color: var(--demo-color-texto-suave);
}

/* El panel de clips. */
.demo-testimonios__panel {
  width: 100%;
  max-width: 1040px;
  margin: clamp(20px, 3vw, 32px) auto 0;
  padding: clamp(16px, 2.4vw, 28px);
  border: 1px solid var(--demo-color-borde-superficie);
  border-radius: 20px;
  background: var(--demo-color-superficie);
  /* Que al abrirse con scrollIntoView quede un poco de aire arriba. */
  scroll-margin-top: 16px;
}

.demo-testimonios__panel-cabecera {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: clamp(14px, 2vw, 22px);
}

.demo-testimonios__panel-titulo {
  margin: 0;
  font-size: clamp(1.1rem, 1.8vw, 1.4rem);
  font-weight: 700;
  letter-spacing: -0.015em;
  color: var(--demo-color-texto);
}

.demo-testimonios__cerrar {
  flex: 0 0 auto;
  width: 40px;
  height: 40px;
  border: 1px solid var(--demo-color-borde-superficie);
  border-radius: 50%;
  background: transparent;
  color: var(--demo-color-texto-suave);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.demo-testimonios__cerrar:hover,
.demo-testimonios__cerrar:focus-visible {
  outline: none;
  color: var(--demo-color-texto);
  border-color: rgba(11, 132, 248, 0.45);
}

/* Los clips: verticales 9:16, dos por fila en teléfono y hasta cinco en escritorio. */
.demo-testimonios__clips {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(10px, 1.6vw, 18px);
}

.demo-testimonios__clip {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.demo-testimonios__miniatura {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 9 / 16;
  padding: 0;
  border: 0;
  border-radius: 14px;
  overflow: hidden;
  background: #0f172a;
  cursor: pointer;
}

.demo-testimonios__poster {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.demo-testimonios__miniatura:hover .demo-testimonios__poster {
  transform: scale(1.03);
}

.demo-testimonios__miniatura:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(11, 132, 248, 0.5);
}

.demo-testimonios__play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: #0b84f8;
  font-size: 1.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 3px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.demo-testimonios__duracion {
  position: absolute;
  right: 8px;
  bottom: 8px;
  padding: 2px 7px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
}

.demo-testimonios__video {
  display: block;
  width: 100%;
  aspect-ratio: 9 / 16;
  border-radius: 14px;
  background: #0f172a;
  object-fit: cover;
}

.demo-testimonios__clip-titulo {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--demo-color-texto);
}

.demo-testimonios__entrevista {
  margin-top: clamp(18px, 2.4vw, 28px);
}

.demo-testimonios__entrevista-titulo {
  margin: 0 0 10px;
  font-size: 1rem;
  font-weight: 700;
  color: var(--demo-color-texto);
}

.demo-testimonios__entrevista-duracion {
  font-weight: 400;
  color: var(--demo-color-texto-suave);
}

.demo-testimonios__entrevista-video {
  display: block;
  width: 100%;
  max-width: 720px;
  aspect-ratio: 16 / 9;
  border-radius: 14px;
  background: #0f172a;
}

@media (min-width: 768px) {
  .demo-testimonios__negocios {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .demo-testimonios__negocio {
    flex-direction: column;
    gap: 12px;
  }

  .demo-testimonios__chevron {
    align-self: flex-end;
    margin-top: 0;
  }

  .demo-testimonios__clips {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 1100px) {
  .demo-testimonios__clips {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

@media (prefers-reduced-motion: reduce) {
  .demo-testimonios__negocio,
  .demo-testimonios__poster {
    transition: none;
  }
}
</style>
