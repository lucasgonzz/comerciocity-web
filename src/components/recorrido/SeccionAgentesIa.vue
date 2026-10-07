<template>
  <!-- La sección de los agentes de IA (pedido de Lucas del 7/10/2026). Reemplaza al hero
       partido de la web vieja ("Profesionalizá tu negocio", con el carrusel de las tres
       pantallas del sistema) y conserva su forma: una pantalla partida, con la escena sobre
       un fondo luminoso de un lado y el texto sobre el azul noche del otro. Lo que cambió es
       el lado de cada cosa (la escena va a la izquierda) y lo que se muestra: un carrusel de
       tres escenas animadas, cada una con su texto.

         1. Tu asistente: el dueño le pide una tarea por audio y le avisa por audio que la pagó.
         2. Agente de ventas: un cliente consulta y el agente lo asesora hasta la tienda.
         3. MCP: ChatGPT analiza el negocio y aplica el plan en el sistema.

       Cada escena avisa cuando terminó su guion y el carrusel pasa a la siguiente; las
       pestañas muestran cuánto le falta a la actual. Todo se pausa mientras la escena no se
       ve: un chat que se escribe solo fuera de pantalla es una escena que nadie vio. -->
  <section ref="seccion" class="demo-agentes demo-seccion-flujo">
    <div ref="escena" class="demo-agentes__escena">
      <span class="demo-agentes__fondo demo-agentes__fondo--claro" :class="{ 'demo-agentes__fondo--visible': actual.fondo === 'claro' }"></span>
      <span class="demo-agentes__fondo demo-agentes__fondo--noche" :class="{ 'demo-agentes__fondo--visible': actual.fondo === 'noche' }"></span>

      <div class="demo-agentes__lienzo">
        <transition name="demo-agentes-escena" mode="out-in">
          <telefono-chat
            v-if="actual.escena === 'telefono'"
            :key="actual.clave + '-' + vuelta"
            :chat="actual.chat"
            :reproduciendo="reproduciendo"
            :reducido="movimiento_reducido"
            @progreso="on_progreso"
            @terminado="on_terminado"
          />
          <escena-mcp
            v-else
            :key="actual.clave + '-' + vuelta"
            :chat="actual.chat"
            :reproduciendo="reproduciendo"
            :reducido="movimiento_reducido"
            @progreso="on_progreso"
            @terminado="on_terminado"
          />
        </transition>
      </div>

      <!-- Lo que muestra la animación, en texto: la escena es aria-hidden. -->
      <p class="demo-agentes__solo-lector">{{ actual.escena_descripcion }}</p>
    </div>

    <div class="demo-agentes__panel">
      <div ref="grupo" class="demo-agentes__texto" :style="estilo_grupo('texto')">
        <span class="demo-agentes__rotulo demo-paso">Inteligencia artificial que trabaja en tu negocio</span>

        <div class="demo-agentes__pestanas demo-paso" role="tablist" aria-label="Elegir ejemplo">
          <button
            v-for="(diapositiva, i) in diapositivas"
            :id="'demo-agentes-pestana-' + diapositiva.clave"
            :key="diapositiva.clave"
            type="button"
            class="demo-agentes__pestana"
            :class="{ 'demo-agentes__pestana--activa': indice === i }"
            role="tab"
            :aria-selected="indice === i ? 'true' : 'false'"
            aria-controls="demo-agentes-contenido"
            @click="elegir(i)"
          >
            <i class="bi" :class="diapositiva.icono" aria-hidden="true"></i>
            <span>{{ diapositiva.pestana }}</span>
            <span class="demo-agentes__avance" aria-hidden="true">
              <span :style="{ transform: 'scaleX(' + avance_de(i) + ')' }"></span>
            </span>
          </button>
        </div>

        <div class="demo-paso">
          <transition name="demo-agentes-texto" mode="out-in">
            <div
              id="demo-agentes-contenido"
              :key="actual.clave"
              class="demo-agentes__contenido"
              role="tabpanel"
              :aria-labelledby="'demo-agentes-pestana-' + actual.clave"
            >
              <span class="demo-agentes__insignia">{{ actual.insignia }}</span>
              <h2 class="demo-agentes__titulo">{{ actual.titulo }}</h2>
              <p class="demo-agentes__bajada">{{ actual.bajada }}</p>

              <div v-if="actual.objetivo" class="demo-agentes__objetivo">
                <i class="bi bi-bullseye" aria-hidden="true"></i>
                <div>
                  <strong>{{ actual.objetivo.titulo }}</strong>
                  <p>{{ actual.objetivo.texto }}</p>
                </div>
              </div>

              <ul v-if="actual.puntos" class="demo-agentes__puntos">
                <li v-for="punto in actual.puntos" :key="punto">
                  <i class="bi bi-check2-circle" aria-hidden="true"></i>
                  <span>{{ punto }}</span>
                </li>
              </ul>
            </div>
          </transition>
        </div>

        <a
          class="demo-boton-marca demo-paso"
          :href="cta_url"
          target="_blank"
          rel="noopener noreferrer"
          @click="emitir_evento('cta_demo_tocado', { desde: 'agentes_ia', diapositiva: actual.clave })"
        >
          <i class="bi bi-whatsapp" aria-hidden="true"></i>
          <span>Agendá tu demo</span>
        </a>
      </div>
    </div>
  </section>
</template>

<script>
import entrada_por_scroll from './entrada-por-scroll'
import TelefonoChat from './agentes/TelefonoChat.vue'
import EscenaMcp from './agentes/EscenaMcp.vue'
import { DIAPOSITIVAS } from './agentes/guiones'

/** Respiro entre el final de una escena y la siguiente: lo último que pasó se deja ver. */
const ESPERA_ENTRE_DIAPOSITIVAS_MS = 2200

export default {
  name: 'SeccionAgentesIa',

  components: {
    TelefonoChat,
    EscenaMcp,
  },

  mixins: [entrada_por_scroll],

  props: {
    cta_url: {
      type: String,
      required: true,
    },
    emitir_evento: {
      type: Function,
      default: function () {},
    },
  },

  data() {
    return {
      indice: 0,
      /** Sube cada vez que se vuelve a una escena: la remonta y su guion arranca de cero. */
      vuelta: 0,
      /** Cuánto del guion de la escena actual ya corrió, de 0 a 1. */
      progreso: 0,
      escena_a_la_vista: false,
      documento_visible: true,
      /** La escena terminó mientras no se veía: se pasa a la siguiente al volver. */
      avance_pendiente: false,
      timer_avance: null,
      observador_escena: null,
    }
  },

  computed: {
    /** @returns {Array} */
    diapositivas() {
      return DIAPOSITIVAS
    },

    /** @returns {object} */
    actual() {
      return DIAPOSITIVAS[this.indice]
    },

    /** @returns {boolean} */
    reproduciendo() {
      return this.escena_a_la_vista && this.documento_visible && !this.movimiento_reducido
    },
  },

  watch: {
    reproduciendo(valor) {
      if (!valor) {
        this.frenar_avance()
        return
      }
      if (this.avance_pendiente) {
        this.avance_pendiente = false
        this.programar_avance()
      }
    },
  },

  mounted() {
    if (typeof IntersectionObserver === 'function' && this.$refs.escena) {
      const self = this
      this.observador_escena = new IntersectionObserver(
        function (entradas) {
          self.escena_a_la_vista = entradas[entradas.length - 1].isIntersecting
        },
        /* 0.35: que asome el borde no es estar viéndola. */
        { threshold: 0.35 },
      )
      this.observador_escena.observe(this.$refs.escena)
    } else {
      this.escena_a_la_vista = true
    }
    document.addEventListener('visibilitychange', this.on_visibilidad_documento)
  },

  beforeUnmount() {
    this.frenar_avance()
    if (this.observador_escena) {
      this.observador_escena.disconnect()
      this.observador_escena = null
    }
    document.removeEventListener('visibilitychange', this.on_visibilidad_documento)
  },

  methods: {
    /** Los grupos cuya entrada sigue al scroll (contrato del mixin). */
    grupos() {
      return { texto: this.$refs.grupo }
    },

    /**
     * Cuánto se llena la barrita de una pestaña: la actual según su guion, las demás vacías.
     *
     * @param {number} i
     * @returns {number}
     */
    avance_de(i) {
      if (i !== this.indice) {
        return 0
      }
      return this.movimiento_reducido ? 1 : this.progreso
    },

    /**
     * Click en una pestaña. Sobre la actual, la escena vuelve a empezar.
     *
     * @param {number} i
     * @returns {void}
     */
    elegir(i) {
      this.ir_a(i, 'click')
    },

    /**
     * @param {number} i
     * @param {string} motivo 'click' | 'auto'
     * @returns {void}
     */
    ir_a(i, motivo) {
      this.frenar_avance()
      this.avance_pendiente = false
      this.indice = i
      this.vuelta++
      this.progreso = 0
      this.emitir_evento('agentes_diapositiva', { clave: DIAPOSITIVAS[i].clave, motivo: motivo })
    },

    /** @param {number} fraccion */
    on_progreso(fraccion) {
      this.progreso = fraccion
    },

    /** La escena terminó su guion: después del respiro, la siguiente. */
    on_terminado() {
      if (this.movimiento_reducido) {
        return
      }
      if (this.reproduciendo) {
        this.programar_avance()
      } else {
        this.avance_pendiente = true
      }
    },

    programar_avance() {
      const self = this
      this.frenar_avance()
      this.timer_avance = window.setTimeout(function () {
        self.timer_avance = null
        self.ir_a((self.indice + 1) % DIAPOSITIVAS.length, 'auto')
      }, ESPERA_ENTRE_DIAPOSITIVAS_MS)
    },

    frenar_avance() {
      if (this.timer_avance !== null) {
        window.clearTimeout(this.timer_avance)
        this.timer_avance = null
        /* Si se cortó un avance ya programado, queda pendiente para cuando se vuelva. */
        this.avance_pendiente = true
      }
    },

    on_visibilidad_documento() {
      this.documento_visible = document.visibilityState !== 'hidden'
    },
  },
}
</script>

<style scoped>
/* Full-bleed: las dos mitades pintan hasta el borde, así que esta sección no usa el padding
   de .demo-seccion-flujo. `clip` y no `hidden`: un overflow hidden la volvería contenedor
   de scroll y le robaría el punto de enganche al scroller de la página (ver la memoria
   scroll-snap-overflow-hidden-roba-el-punto-de-enganche). */
.demo-agentes {
  flex-direction: row;
  align-items: stretch;
  padding: 0;
  overflow: clip;
}

/* --- La escena (izquierda) -------------------------------------------------------------- */

.demo-agentes__escena {
  position: relative;
  flex: 0 0 52%;
  min-width: 0;
  overflow: clip;
}

/* Dos fondos apilados y se cruza la opacidad: un degradé no se puede transicionar. */
.demo-agentes__fondo {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.8s ease;
}

.demo-agentes__fondo--visible {
  opacity: 1;
}

.demo-agentes__fondo--claro {
  background:
    radial-gradient(52% 48% at 50% 46%, #ffffff 0%, rgba(255, 255, 255, 0.85) 30%, rgba(255, 255, 255, 0) 72%),
    radial-gradient(70% 60% at 15% 100%, rgba(58, 49, 252, 0.12), transparent 60%),
    linear-gradient(160deg, #e0f2fe 0%, #dbeafe 55%, #eef2ff 100%);
}

.demo-agentes__fondo--noche {
  background:
    radial-gradient(50% 45% at 50% 46%, rgba(11, 132, 248, 0.42), transparent 70%),
    radial-gradient(40% 40% at 78% 85%, rgba(58, 49, 252, 0.35), transparent 70%),
    radial-gradient(35% 35% at 20% 15%, rgba(11, 132, 248, 0.18), transparent 70%),
    #040812;
}

.demo-agentes__lienzo {
  position: absolute;
  inset: clamp(20px, 5vh, 56px) clamp(16px, 3vw, 44px);
}

.demo-agentes-escena-enter-active,
.demo-agentes-escena-leave-active {
  transition:
    opacity 0.35s ease,
    transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

.demo-agentes-escena-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.97);
}

.demo-agentes-escena-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}

.demo-agentes__solo-lector {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* --- El texto (derecha) ----------------------------------------------------------------- */

.demo-agentes__panel {
  flex: 1 1 48%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(40px, 7vh, 80px) clamp(24px, 4vw, 56px);
  /* El azul noche del hero partido de la web anterior, con las dos manchas de marca. */
  background:
    radial-gradient(110% 80% at 85% 10%, rgba(11, 132, 248, 0.28), transparent 60%),
    radial-gradient(90% 70% at 10% 95%, rgba(58, 49, 252, 0.26), transparent 55%),
    #0a1f2e;
  color: #fff;
}

.demo-agentes__texto {
  --p: 1;
  width: 100%;
  max-width: 540px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.demo-agentes__rotulo {
  margin-bottom: 14px;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(159, 213, 251, 0.85);
}

.demo-agentes__pestanas {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: clamp(22px, 3.5vh, 34px);
}

.demo-agentes__pestana {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 46px;
  padding: 8px 10px 10px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.72);
  font-family: inherit;
  font-size: 0.86rem;
  font-weight: 600;
  line-height: 1.2;
  text-align: center;
  overflow: clip;
  cursor: pointer;
  transition:
    background-color 0.25s ease,
    border-color 0.25s ease,
    color 0.25s ease;
}

.demo-agentes__pestana:hover {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.3);
}

.demo-agentes__pestana--activa {
  background: rgba(11, 132, 248, 0.2);
  border-color: rgba(108, 182, 255, 0.65);
  color: #fff;
}

.demo-agentes__pestana:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(108, 182, 255, 0.55);
}

.demo-agentes__pestana .bi {
  font-size: 1.05rem;
}

/* La barrita de avance de la escena, abajo de la pestaña. */
.demo-agentes__avance {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 5px;
  height: 2px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.08);
  overflow: clip;
}

.demo-agentes__avance span {
  display: block;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #6cb6ff, #8f88ff);
  transform-origin: left center;
  transition: transform 0.6s linear;
}

.demo-agentes__contenido {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.demo-agentes-texto-enter-active,
.demo-agentes-texto-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.demo-agentes-texto-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.demo-agentes-texto-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.demo-agentes__insignia {
  display: inline-block;
  margin-bottom: 1rem;
  padding: 0.35rem 0.95rem;
  border: 1px solid rgba(125, 211, 252, 0.35);
  border-radius: 999px;
  background: rgba(11, 132, 248, 0.16);
  color: #9fd5fb;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.demo-agentes__titulo {
  margin: 0 0 1rem;
  font-size: clamp(1.75rem, 2.9vw, 2.6rem);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -0.025em;
  color: #fff;
  text-wrap: balance;
}

.demo-agentes__bajada {
  margin: 0;
  font-size: clamp(0.98rem, 1.15vw, 1.06rem);
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.74);
  text-wrap: pretty;
}

.demo-agentes__objetivo {
  display: flex;
  gap: 12px;
  margin-top: 1.25rem;
  padding: 14px 16px;
  border: 1px solid rgba(250, 126, 6, 0.35);
  border-radius: 14px;
  background: rgba(250, 126, 6, 0.08);
}

.demo-agentes__objetivo .bi {
  flex: none;
  font-size: 1.35rem;
  line-height: 1.3;
  color: #ffb067;
}

.demo-agentes__objetivo strong {
  display: block;
  margin-bottom: 3px;
  font-size: 0.98rem;
  color: #fff;
}

.demo-agentes__objetivo p {
  margin: 0;
  font-size: 0.93rem;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.72);
}

.demo-agentes__puntos {
  margin: 1.25rem 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.demo-agentes__puntos li {
  display: flex;
  gap: 10px;
  font-size: 0.97rem;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.86);
}

.demo-agentes__puntos .bi {
  flex: none;
  color: #6cb6ff;
  font-size: 1.05rem;
  line-height: 1.4;
}

.demo-agentes .demo-boton-marca {
  margin-top: clamp(24px, 4vh, 36px);
}

/* Teléfono y tablet vertical: apilado. Primero la escena (a lo alto que entre, sin pasarse
   de la pantalla) y abajo el texto. La sección mide más que una pantalla y el avance
   guiado la deja recorrer con el scroll nativo (hay_contenido_sin_ver en avance-guiado.js). */
@media (max-width: 991.98px) {
  .demo-agentes {
    flex-direction: column;
    min-height: 0;
  }

  .demo-agentes__escena {
    flex: none;
    width: 100%;
    height: min(86svh, 760px);
    min-height: 520px;
  }

  .demo-agentes__lienzo {
    inset: 28px 16px;
  }

  .demo-agentes__panel {
    flex: none;
    width: 100%;
    padding: clamp(40px, 8vh, 72px) clamp(20px, 5vw, 40px) clamp(48px, 9vh, 80px);
  }

  .demo-agentes__texto {
    max-width: 640px;
    margin: 0 auto;
  }

  .demo-boton-marca {
    width: 100%;
    max-width: 360px;
  }
}

@media (max-width: 479.98px) {
  .demo-agentes__pestana {
    flex-direction: column;
    gap: 3px;
    min-height: 58px;
    padding: 8px 4px 11px;
    font-size: 0.76rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .demo-agentes__fondo,
  .demo-agentes__avance span {
    transition: none;
  }

  .demo-agentes-escena-enter-active,
  .demo-agentes-escena-leave-active,
  .demo-agentes-texto-enter-active,
  .demo-agentes-texto-leave-active {
    transition: none;
  }
}
</style>
