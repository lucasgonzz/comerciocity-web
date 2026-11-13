<template>
  <!-- Tres testimonios a la vista y el resto detrás de «Ver más». Los videos, las miniaturas y los títulos salen de
       `recorrido/testimonios.js` (la fuente de siempre): el titular de cada tarjeta es el título del clip, que es lo
       que la persona dice en el video. Cada video se baja recién al tocarlo, y uno solo suena a la vez. -->
  <section class="lnd-seccion" data-seccion="testimonios">
    <div class="lnd-contenedor">
      <p class="lnd-eyebrow">Lo cuentan ellos</p>
      <h2 class="lnd-h2">Negocios como el tuyo</h2>

      <ul class="lnd-testis">
        <li
          v-for="item in destacados"
          :key="item.clip.id"
          class="lnd-testi"
          :class="{ 'lnd-testi--abierto': reproduciendo === item.clip.id }"
        >
          <video
            v-if="reproduciendo === item.clip.id"
            class="lnd-testi__video"
            :src="item.clip.url + '#t=0.001'"
            :poster="item.clip.poster"
            :aria-label="'Testimonio de ' + item.persona + ': ' + item.clip.titulo"
            controls
            autoplay
            playsinline
            preload="none"
            @play="al_reproducir($event, item.clip.id)"
          ></video>
          <button
            v-else
            type="button"
            class="lnd-testi__mini"
            :aria-label="'Reproducir el testimonio de ' + item.persona + ', de ' + item.negocio"
            @click="reproducir(item.clip.id)"
          >
            <img :src="item.clip.poster" alt="" width="540" height="960" loading="lazy" decoding="async" />
          </button>
          <div>
            <p class="lnd-testi__titulo">{{ item.clip.titulo }}</p>
            <p class="lnd-testi__quien">{{ item.persona }} · {{ item.negocio }}, {{ item.rubro_corto }}</p>
          </div>
        </li>
      </ul>

      <button
        type="button"
        class="lnd-ver-mas"
        :aria-expanded="mas_abierto ? 'true' : 'false'"
        aria-controls="lnd-testimonios-mas"
        @click="alternar_mas"
      >
        {{ mas_abierto ? 'Ver menos' : 'Ver más videos de clientes →' }}
      </button>

      <div v-if="mas_abierto" id="lnd-testimonios-mas">
        <template v-for="grupo in resto" :key="grupo.id">
          <p class="lnd-mas-negocio">{{ grupo.persona }} · {{ grupo.negocio }}</p>
          <ul class="lnd-testis lnd-testis--mas">
            <li
              v-for="clip in grupo.clips"
              :key="clip.id"
              class="lnd-testi"
              :class="{ 'lnd-testi--abierto': reproduciendo === clip.id }"
            >
              <video
                v-if="reproduciendo === clip.id"
                class="lnd-testi__video"
                :class="{ 'lnd-testi__video--apaisado': clip.entrevista }"
                :src="clip.url + '#t=0.001'"
                :poster="clip.poster"
                :aria-label="'Testimonio de ' + grupo.persona + ': ' + clip.titulo"
                controls
                autoplay
                playsinline
                :preload="clip.entrevista ? 'none' : 'metadata'"
                @play="al_reproducir($event, clip.id)"
              ></video>
              <button
                v-else
                type="button"
                class="lnd-testi__mini"
                :aria-label="'Reproducir: ' + clip.titulo"
                @click="reproducir(clip.id)"
              >
                <img :src="clip.poster" alt="" loading="lazy" decoding="async" />
              </button>
              <div>
                <p class="lnd-testi__titulo">{{ clip.titulo }}</p>
                <p class="lnd-testi__quien">{{ duracion(clip.segundos) }}</p>
              </div>
            </li>
          </ul>
        </template>
      </div>
    </div>
  </section>
</template>

<script>
import { testimonios, duracion } from '../recorrido/testimonios'
import { pausar_otros } from '../../videos/reproduccion'
import { TESTIMONIOS_DESTACADOS } from './datos'

/**
 * El rubro, corto, para la línea de quién lo dice («ferretería en Matheu»). Sale del `rubro` de testimonios.js
 * con la primera letra en minúscula.
 *
 * @param {string} rubro
 * @returns {string}
 */
function rubro_corto(rubro) {
  const texto = String(rubro || '')
  return texto.charAt(0).toLowerCase() + texto.slice(1)
}

export default {
  name: 'Testimonios',

  props: {
    emitir_evento: { type: Function, default: function () {} },
  },

  data() {
    return {
      /** id del clip que se está reproduciendo, o null. */
      reproduciendo: null,
      mas_abierto: false,
      /** Último clip reportado: un pausa y play del mismo no cuenta dos veces. */
      evento_emitido: null,
    }
  },

  computed: {
    /** Los tres negocios a la vista, cada uno con su clip destacado. @returns {Array} */
    destacados() {
      const lista = []
      TESTIMONIOS_DESTACADOS.forEach(function (id) {
        const negocio = testimonios.find(function (t) { return t.id === id })
        if (!negocio) {
          return
        }
        const clip = negocio.clips.find(function (c) { return c.id === negocio.destacado_id }) || negocio.clips[0]
        if (!clip) {
          return
        }
        lista.push({
          negocio: negocio.negocio,
          persona: negocio.persona,
          rubro_corto: rubro_corto(negocio.rubro),
          clip: clip,
        })
      })
      return lista
    },

    /**
     * Todo lo demás, agrupado por negocio: los clips que no están a la vista y las entrevistas completas.
     *
     * @returns {Array<{id: string, negocio: string, persona: string, clips: Array}>}
     */
    resto() {
      const vistos = this.destacados.map(function (d) { return d.clip.id })
      const grupos = []
      testimonios.forEach(function (negocio) {
        const clips = negocio.clips.filter(function (c) { return vistos.indexOf(c.id) === -1 })
        if (negocio.entrevista) {
          clips.push(Object.assign({ entrevista: true }, negocio.entrevista))
        }
        if (clips.length) {
          grupos.push({ id: negocio.id, negocio: negocio.negocio, persona: negocio.persona, clips: clips })
        }
      })
      return grupos
    },
  },

  beforeUnmount() {
    this.pausar_videos()
  },

  methods: {
    duracion,

    /** @param {string} id */
    reproducir(id) {
      this.pausar_videos()
      this.reproduciendo = id
    },

    /** @returns {void} */
    alternar_mas() {
      this.mas_abierto = !this.mas_abierto
      if (this.mas_abierto) {
        this.emitir_evento('testimonio_abierto', { negocio: 'ver_mas' })
      }
    },

    /** Uno solo suena a la vez en toda la página; el evento sale una vez por clip. */
    al_reproducir(evento, id) {
      pausar_otros(evento.target, evento.target.ownerDocument)
      if (this.evento_emitido !== id) {
        this.emitir_evento('testimonio_reproducido', { clip: id })
        this.evento_emitido = id
      }
    },

    /** @returns {void} */
    pausar_videos() {
      if (!this.$el || !this.$el.querySelectorAll) {
        return
      }
      this.$el.querySelectorAll('video').forEach(function (video) {
        video.pause()
      })
    },
  },
}
</script>
