<template>
  <div ref="marco" class="cc-tel" aria-hidden="true">
    <!-- Un teléfono con un chat de WhatsApp que se escribe solo, según un guion (guiones.js).
         Lo usan las dos primeras diapositivas de la sección de agentes: el dueño hablándole a
         su asistente, y un cliente hablándole al agente del negocio. El teléfono es siempre el
         de quien escribe en verde (`saliente`).

         La maqueta mide siempre 300 x 620 y se escala para entrar (ajuste-a-medida.js). Es
         decorativa para un lector de pantalla: la sección pone al lado una descripción en
         texto de lo que pasa. -->
    <!-- (Este comentario va ADENTRO de la raíz a propósito: un comentario antes de la raíz
         vuelve al componente un fragmento, y la <transition mode="out-in"> de la sección
         se queda trabada en la salida sin montar la escena siguiente.) -->
    <div class="cc-tel__maqueta" :style="estilo_maqueta">
      <div class="cc-tel__cuerpo">
        <div class="cc-tel__pantalla">
          <div class="cc-tel__barra-estado">
            <span class="cc-tel__reloj">{{ reloj }}</span>
            <span class="cc-tel__isla"></span>
            <span class="cc-tel__iconos-estado">
              <i class="bi bi-reception-4"></i>
              <i class="bi bi-wifi"></i>
              <i class="bi bi-battery-full"></i>
            </span>
          </div>

          <header class="cc-tel__cabecera">
            <i class="bi bi-arrow-left cc-tel__volver"></i>
            <span class="cc-tel__avatar" :class="'cc-tel__avatar--' + chat.avatar">
              <img v-if="chat.avatar === 'marca'" :src="isotipo" alt="" />
              <i v-else class="bi bi-paint-bucket"></i>
            </span>
            <span class="cc-tel__contacto">
              <span class="cc-tel__nombre">{{ chat.contacto }}</span>
              <span class="cc-tel__estado" :class="{ 'cc-tel__estado--escribiendo': escribiendo }">
                {{ escribiendo ? 'escribiendo…' : chat.estado }}
              </span>
            </span>
            <span class="cc-tel__acciones">
              <i class="bi bi-camera-video"></i>
              <i class="bi bi-telephone"></i>
              <i class="bi bi-three-dots-vertical"></i>
            </span>
          </header>

          <div class="cc-tel__chat">
            <transition-group name="cc-msg" tag="div" class="cc-tel__mensajes">
              <div
                v-for="m in mensajes"
                :key="m.id"
                class="cc-msg"
                :class="['cc-msg--' + m.tipo, m.lado ? 'cc-msg--' + m.lado : '']"
              >
                <!-- El cartelito del día, centrado. El del salto de tiempo entra con un
                     destello: es lo que le dice al que mira que pasaron días. -->
                <span v-if="m.tipo === 'chip' || m.tipo === 'salto'" class="cc-chip">{{ m.texto }}</span>

                <span v-else-if="m.tipo === 'escribiendo'" class="cc-burbuja cc-burbuja--escribiendo">
                  <span class="cc-puntos"><i></i><i></i><i></i></span>
                </span>

                <div v-else-if="m.tipo === 'audio'" class="cc-burbuja cc-burbuja--audio">
                  <div class="cc-audio">
                    <i class="bi bi-play-fill cc-audio__play"></i>
                    <span class="cc-audio__onda">
                      <i v-for="(alto, i) in onda" :key="i" :style="{ height: alto + 'px' }"></i>
                    </span>
                    <span class="cc-audio__foto">
                      <i class="bi bi-person-fill"></i>
                      <i class="bi bi-mic-fill cc-audio__mic" :class="{ 'cc-audio__mic--escuchado': m.leido }"></i>
                    </span>
                  </div>
                  <div class="cc-audio__pie">
                    <span>{{ m.duracion }}</span>
                    <span class="cc-meta">
                      {{ m.hora }}
                      <i class="bi bi-check2-all cc-tilde" :class="{ 'cc-tilde--leido': m.leido }"></i>
                    </span>
                  </div>
                  <div v-if="m.estado === 'transcribiendo'" class="cc-transcribiendo">
                    <i class="bi bi-soundwave"></i> Transcribiendo…
                  </div>
                  <p v-else-if="m.estado === 'transcripto'" class="cc-transcripcion">
                    <span
                      v-for="(palabra, i) in palabras(m.transcripcion)"
                      :key="i"
                      class="cc-palabra"
                      :style="{ animationDelay: i * MS_POR_PALABRA_TRANSCRIPCION + 'ms' }"
                      >{{ palabra + ' ' }}</span
                    >
                  </p>
                </div>

                <div v-else class="cc-burbuja">
                  <div v-if="m.enlace" class="cc-enlace">
                    <div class="cc-enlace__imagen">
                      <svg viewBox="0 0 120 120" class="cc-lata">
                        <defs>
                          <linearGradient id="cc-lata-cuerpo" x1="0" x2="1">
                            <stop offset="0" stop-color="#cfd6e1" />
                            <stop offset="0.45" stop-color="#ffffff" />
                            <stop offset="1" stop-color="#b8c1cf" />
                          </linearGradient>
                        </defs>
                        <ellipse cx="60" cy="98" rx="34" ry="7" fill="rgba(0,0,0,0.12)" />
                        <rect x="28" y="26" width="64" height="70" rx="6" fill="url(#cc-lata-cuerpo)" />
                        <ellipse cx="60" cy="26" rx="32" ry="7" fill="#e6eaf0" stroke="#aab4c3" />
                        <rect x="28" y="44" width="64" height="34" fill="#0b84f8" />
                        <text x="60" y="58" text-anchor="middle" font-size="9" font-weight="700" fill="#fff">ANTI</text>
                        <text x="60" y="69" text-anchor="middle" font-size="9" font-weight="700" fill="#fff">HUMEDAD</text>
                        <circle cx="40" cy="86" r="4" fill="#f6f3ea" stroke="#c9c2ad" />
                        <circle cx="52" cy="86" r="4" fill="#e9dcc3" />
                        <circle cx="64" cy="86" r="4" fill="#f3ead7" />
                        <path d="M30 26 Q60 2 90 26" fill="none" stroke="#8a94a6" stroke-width="2" />
                      </svg>
                      <span class="cc-enlace__oferta">OFERTA</span>
                    </div>
                    <div class="cc-enlace__datos">
                      <span class="cc-enlace__titulo">{{ m.enlace.titulo }}</span>
                      <span class="cc-enlace__detalle">{{ m.enlace.detalle }}</span>
                      <span class="cc-enlace__sitio"><i class="bi bi-bag"></i> {{ m.enlace.sitio }}</span>
                    </div>
                  </div>
                  <p class="cc-texto" v-html="formatear(m.texto)"></p>
                  <div v-if="m.tarjeta" class="cc-tarjeta">
                    <i class="bi" :class="m.tarjeta.icono"></i>
                    <span>
                      <strong>{{ m.tarjeta.titulo }}</strong>
                      <span>{{ m.tarjeta.detalle }}</span>
                    </span>
                  </div>
                  <p v-if="m.texto_final" class="cc-texto" v-html="formatear(m.texto_final)"></p>
                  <span class="cc-meta cc-meta--flotante">
                    {{ m.hora }}
                    <i
                      v-if="m.lado === 'saliente'"
                      class="bi bi-check2-all cc-tilde"
                      :class="{ 'cc-tilde--leido': m.leido }"
                    ></i>
                  </span>
                </div>
              </div>
            </transition-group>
          </div>

          <footer class="cc-tel__entrada" :class="'cc-tel__entrada--' + entrada">
            <div class="cc-tel__campo">
              <template v-if="entrada === 'grabando'">
                <span class="cc-grabando__punto"></span>
                <span class="cc-grabando__tiempo">0:0{{ segundos_grabando }}</span>
                <span class="cc-grabando__cancelar"><i class="bi bi-chevron-left"></i> Deslizá para cancelar</span>
              </template>
              <template v-else>
                <i class="bi bi-emoji-smile"></i>
                <span v-if="entrada === 'tipeando'" class="cc-tel__tipeo">
                  <span
                    v-for="(palabra, i) in palabras(texto_entrada)"
                    :key="texto_entrada + i"
                    class="cc-palabra cc-palabra--tipeo"
                    :style="{ animationDelay: i * MS_POR_PALABRA_TIPEO + 'ms' }"
                    >{{ palabra + ' ' }}</span
                  >
                </span>
                <span v-else class="cc-tel__placeholder">Mensaje</span>
                <i class="bi bi-paperclip"></i>
                <i v-if="entrada !== 'tipeando'" class="bi bi-camera"></i>
              </template>
            </div>
            <span class="cc-tel__boton">
              <i class="bi" :class="entrada === 'tipeando' ? 'bi-send-fill' : 'bi-mic-fill'"></i>
            </span>
          </footer>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ajuste_a_medida from './ajuste-a-medida'
import crear_motor from './motor-guion'
import { formatear } from './guiones'
import ISOTIPO from '../../../assets/marca/isotipo-comerciocity.svg'

/** Ritmo de las palabras que aparecen solas: la transcripción y lo que se tipea abajo. */
const MS_POR_PALABRA_TRANSCRIPCION = 70
const MS_POR_PALABRA_TIPEO = 80

/** Alturas de las barritas de la onda del audio: fijas, para que no cambien en cada render. */
const ONDA = [6, 10, 14, 9, 16, 12, 7, 13, 18, 11, 8, 15, 10, 6, 12, 17, 9, 13, 7, 11, 15, 8, 5, 9]

/**
 * Cuánto se deja leer un mensaje del otro lado antes de seguir: un piso para los cortos y
 * un tope para que el más largo no frene la escena.
 *
 * @param {number} caracteres
 * @returns {number}
 */
function tiempo_de_lectura(caracteres) {
  return Math.min(5600, 1400 + caracteres * 30)
}

/**
 * Pasa el guion de alto nivel ("un audio", "un mensaje") a los pasos chicos que ve el que
 * mira: grabar, enviar, escuchado, transcribiendo, transcripto; o escribiendo y mensaje.
 *
 * @param {Array} pasos
 * @returns {Array}
 */
function expandir(pasos) {
  const micro = []
  pasos.forEach(function (p) {
    if (p.tipo === 'chip' || p.tipo === 'salto') {
      micro.push({ op: p.tipo, texto: p.texto })
      return
    }
    if (p.tipo === 'audio') {
      micro.push({ op: 'grabar' })
      micro.push({ op: 'agregar', mensaje: Object.assign({}, p, { estado: 'enviado', leido: false }) })
      micro.push({ op: 'leer' })
      micro.push({ op: 'transcribir' })
      micro.push({ op: 'transcripto', palabras: p.transcripcion.split(' ').length })
      return
    }
    /* texto o enlace */
    if (p.lado === 'saliente') {
      micro.push({ op: 'tipear', texto: p.texto })
    } else {
      micro.push({ op: 'escribiendo' })
    }
    micro.push({ op: 'agregar', mensaje: Object.assign({}, p, { leido: false }) })
  })
  return micro
}

export default {
  name: 'TelefonoChat',

  mixins: [ajuste_a_medida],

  props: {
    /** El chat: contacto, estado, avatar y los pasos del guion (guiones.js). */
    chat: {
      type: Object,
      required: true,
    },
    /** true mientras la escena tiene que avanzar (diapositiva activa y sección a la vista). */
    reproduciendo: {
      type: Boolean,
      default: false,
    },
    /** prefers-reduced-motion: la escena se muestra terminada y quieta. */
    reducido: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['terminado', 'progreso'],

  data() {
    return {
      isotipo: ISOTIPO,
      onda: ONDA,
      MS_POR_PALABRA_TRANSCRIPCION,
      MS_POR_PALABRA_TIPEO,
      mensajes: [],
      reloj: '',
      /** reposo | grabando | tipeando */
      entrada: 'reposo',
      texto_entrada: '',
      segundos_grabando: 0,
      escribiendo: false,
      motor: null,
      timer_grabacion: null,
      proximo_id: 1,
    }
  },

  mounted() {
    const self = this
    const primero = this.chat.pasos.find(function (p) {
      return p.hora
    })
    this.reloj = primero ? primero.hora : '9:41'

    this.motor = crear_motor(expandir(this.chat.pasos), {
      aplicar: this.aplicar,
      al_progresar(fraccion) {
        self.$emit('progreso', fraccion)
      },
      al_terminar() {
        self.$emit('terminado')
      },
    })

    if (this.reducido) {
      this.motor.completar()
    } else if (this.reproduciendo) {
      this.motor.reproducir()
    }
  },

  beforeUnmount() {
    this.frenar_grabacion()
    if (this.motor) {
      this.motor.destruir()
      this.motor = null
    }
  },

  watch: {
    reproduciendo(valor) {
      if (!this.motor || this.reducido) {
        return
      }
      if (valor) {
        this.motor.reproducir()
      } else {
        this.motor.pausar()
      }
    },
  },

  methods: {
    formatear,

    /** Medida fija de la maqueta (contrato de ajuste-a-medida.js). */
    diseno() {
      return { ancho: 300, alto: 620 }
    },

    /**
     * @param {string} texto
     * @returns {Array<string>}
     */
    palabras(texto) {
      return String(texto || '').split(' ')
    },

    /**
     * Aplica un paso chico y devuelve cuánto esperar antes del siguiente.
     *
     * @param {object} paso
     * @param {boolean} instantaneo true cuando se completa de una (movimiento reducido):
     *   se saltean los estados de paso (grabando, escribiendo) y queda solo el resultado.
     * @returns {number}
     */
    aplicar(paso, instantaneo) {
      switch (paso.op) {
        case 'chip':
          this.agregar({ tipo: 'chip', texto: paso.texto })
          return 500

        case 'salto':
          this.agregar({ tipo: 'salto', texto: paso.texto })
          return 1500

        case 'grabar':
          if (instantaneo) {
            return 0
          }
          this.entrada = 'grabando'
          this.arrancar_grabacion()
          return 2000

        case 'tipear':
          if (instantaneo) {
            return 0
          }
          this.entrada = 'tipeando'
          this.texto_entrada = paso.texto
          return this.palabras(paso.texto).length * MS_POR_PALABRA_TIPEO + 550

        case 'escribiendo':
          this.marcar_leidos()
          if (instantaneo) {
            return 0
          }
          this.escribiendo = true
          this.agregar({ tipo: 'escribiendo', lado: 'entrante' })
          return 1000 + Math.min(1200, this.largo_del_siguiente() * 6)

        case 'agregar':
          return this.agregar_mensaje(paso.mensaje)

        case 'leer':
          this.marcar_leidos()
          return 550

        case 'transcribir':
          this.cambiar_estado_audio(instantaneo ? 'transcripto' : 'transcribiendo')
          return 1500

        case 'transcripto':
          this.cambiar_estado_audio('transcripto')
          return paso.palabras * MS_POR_PALABRA_TRANSCRIPCION + 1100

        default:
          return 0
      }
    },

    /**
     * @param {object} mensaje
     * @returns {number} la espera que corresponde después de este mensaje.
     */
    agregar_mensaje(mensaje) {
      if (mensaje.lado === 'saliente') {
        this.entrada = 'reposo'
        this.texto_entrada = ''
        this.frenar_grabacion()
      } else {
        this.escribiendo = false
        this.mensajes = this.mensajes.filter(function (m) {
          return m.tipo !== 'escribiendo'
        })
      }
      if (mensaje.hora) {
        this.reloj = mensaje.hora
      }
      this.agregar(mensaje)

      if (mensaje.lado === 'saliente') {
        return 900
      }
      const largo = (mensaje.texto || '').length + (mensaje.texto_final || '').length
      return tiempo_de_lectura(largo + (mensaje.tarjeta ? 30 : 0) + (mensaje.enlace ? 60 : 0))
    },

    /** @param {object} mensaje */
    agregar(mensaje) {
      this.mensajes.push(Object.assign({ id: this.proximo_id++ }, mensaje))
    },

    /** Tildes azules en todo lo que mandó el que sostiene el teléfono. */
    marcar_leidos() {
      this.mensajes.forEach(function (m) {
        if (m.lado === 'saliente') {
          m.leido = true
        }
      })
    },

    /** @param {string} estado */
    cambiar_estado_audio(estado) {
      for (let i = this.mensajes.length - 1; i >= 0; i--) {
        if (this.mensajes[i].tipo === 'audio') {
          this.mensajes[i].estado = estado
          return
        }
      }
    },

    /**
     * Largo del próximo mensaje entrante: el "escribiendo…" dura más antes de uno largo.
     *
     * @returns {number}
     */
    largo_del_siguiente() {
      const pasos = this.chat.pasos
      const ya = this.mensajes.filter(function (m) {
        return m.tipo !== 'escribiendo' && m.tipo !== 'chip' && m.tipo !== 'salto'
      }).length
      const pendientes = pasos.filter(function (p) {
        return p.tipo === 'texto' || p.tipo === 'enlace' || p.tipo === 'audio'
      })
      const siguiente = pendientes[ya]
      return siguiente ? (siguiente.texto || '').length + (siguiente.texto_final || '').length : 40
    },

    arrancar_grabacion() {
      const self = this
      this.frenar_grabacion()
      this.segundos_grabando = 0
      this.timer_grabacion = window.setInterval(function () {
        self.segundos_grabando = Math.min(9, self.segundos_grabando + 1)
      }, 700)
    },

    frenar_grabacion() {
      if (this.timer_grabacion !== null) {
        window.clearInterval(this.timer_grabacion)
        this.timer_grabacion = null
      }
    },
  },
}
</script>

<style scoped>
.cc-tel {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Centrada y escalada desde su centro (ajuste-a-medida.js pone el translate + scale). */
.cc-tel__maqueta {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: center center;
}

.cc-tel__cuerpo {
  width: 100%;
  height: 100%;
  padding: 10px;
  border-radius: 46px;
  background: linear-gradient(145deg, #2a2f3a, #0d1016 55%, #1d222c);
  box-shadow:
    0 0 0 1.5px #3a4150,
    0 30px 60px -18px rgba(10, 31, 46, 0.45),
    0 18px 36px -24px rgba(10, 31, 46, 0.5);
}

.cc-tel__pantalla {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 36px;
  overflow: clip;
  display: flex;
  flex-direction: column;
  background: #efeae2;
  font-family: 'Segoe UI', -apple-system, 'Helvetica Neue', Roboto, sans-serif;
  color: #111b21;
  -webkit-font-smoothing: antialiased;
}

/* --- Barra de estado y cabecera ------------------------------------------------------ */

.cc-tel__barra-estado {
  position: relative;
  flex: none;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 22px 0 26px;
  background: #008069;
  color: #fff;
  font-size: 11.5px;
  font-weight: 600;
}

.cc-tel__isla {
  position: absolute;
  top: 7px;
  left: 50%;
  width: 78px;
  height: 20px;
  margin-left: -39px;
  border-radius: 12px;
  background: #050608;
}

.cc-tel__iconos-estado {
  display: flex;
  gap: 4px;
  font-size: 11px;
}

.cc-tel__cabecera {
  flex: none;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 10px 9px 8px;
  background: #008069;
  color: #fff;
}

.cc-tel__volver {
  font-size: 16px;
}

.cc-tel__avatar {
  flex: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.cc-tel__avatar--marca {
  background: #fff;
}

.cc-tel__avatar--marca img {
  width: 22px;
  height: 22px;
}

.cc-tel__avatar--pintureria {
  background: linear-gradient(140deg, #ffa53a, #fa7e06);
  font-size: 15px;
}

.cc-tel__contacto {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.cc-tel__nombre {
  font-size: 13.5px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cc-tel__estado {
  font-size: 10.5px;
  opacity: 0.82;
}

.cc-tel__estado--escribiendo {
  opacity: 1;
  font-style: italic;
}

.cc-tel__acciones {
  display: flex;
  gap: 12px;
  font-size: 14px;
}

/* --- El chat ------------------------------------------------------------------------- */

/* Los mensajes se apilan desde abajo y lo que ya no entra se recorta ARRIBA: con
   justify-content: flex-end el desborde va hacia el inicio, como un chat real que scrollea
   solo. `clip` y no `hidden`: no hace falta un contenedor de scroll para esto. */
.cc-tel__chat {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: clip;
  padding: 8px 9px 6px;
  background-color: #efeae2;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(0, 0, 0, 0.035) 1.5px, transparent 2px),
    radial-gradient(circle at 70% 80%, rgba(0, 0, 0, 0.03) 1.5px, transparent 2px);
  background-size: 26px 26px, 34px 34px;
}

.cc-tel__mensajes {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.cc-msg {
  display: flex;
}

.cc-msg--saliente {
  justify-content: flex-end;
}

.cc-msg--entrante {
  justify-content: flex-start;
}

.cc-msg--chip,
.cc-msg--salto {
  justify-content: center;
  margin: 4px 0;
}

/* Entrada de cada mensaje y corrimiento de los de arriba (FLIP de transition-group). */
.cc-msg-enter-active {
  transition:
    opacity 0.32s ease,
    transform 0.32s cubic-bezier(0.16, 1, 0.3, 1);
}

.cc-msg-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.96);
}

.cc-msg-move {
  transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1);
}

.cc-chip {
  padding: 3px 10px;
  border-radius: 7px;
  background: #fff;
  color: #54656f;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  box-shadow: 0 1px 0.5px rgba(11, 20, 26, 0.13);
}

/* El salto de tiempo: el cartel entra creciendo con un halo azul. */
.cc-msg--salto .cc-chip {
  animation: cc-salto 1.3s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes cc-salto {
  0% {
    transform: scale(0.6);
    box-shadow: 0 0 0 0 rgba(11, 132, 248, 0.55);
  }
  45% {
    transform: scale(1.15);
    box-shadow: 0 0 0 10px rgba(11, 132, 248, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 1px 0.5px rgba(11, 20, 26, 0.13);
  }
}

.cc-burbuja {
  position: relative;
  max-width: 84%;
  padding: 5px 8px 6px;
  border-radius: 8px;
  font-size: 12.5px;
  line-height: 1.38;
  box-shadow: 0 1px 0.5px rgba(11, 20, 26, 0.13);
  background: #fff;
}

.cc-msg--saliente .cc-burbuja {
  background: #d9fdd3;
  border-top-right-radius: 2px;
}

.cc-msg--entrante .cc-burbuja {
  border-top-left-radius: 2px;
}

.cc-texto {
  margin: 0;
  white-space: pre-line;
}

.cc-texto + .cc-texto,
.cc-tarjeta + .cc-texto {
  margin-top: 5px;
}

/* El último renglón deja lugar a la hora, que flota abajo a la derecha como en WhatsApp. */
.cc-texto:last-of-type::after {
  content: '';
  display: inline-block;
  width: 52px;
}

.cc-meta {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 9.5px;
  color: #667781;
}

.cc-meta--flotante {
  position: absolute;
  right: 7px;
  bottom: 3px;
}

.cc-tilde {
  font-size: 13px;
  line-height: 1;
  color: #8696a0;
  transition: color 0.3s ease;
}

.cc-tilde--leido {
  color: #53bdeb;
}

.cc-tarjeta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 5px;
  padding: 6px 8px;
  border-left: 3px solid #0b84f8;
  border-radius: 6px;
  background: #f0f6ff;
  font-size: 11.5px;
  line-height: 1.3;
}

.cc-tarjeta .bi {
  font-size: 17px;
  color: #0b84f8;
}

.cc-tarjeta strong {
  display: block;
  font-weight: 700;
  color: #111b21;
}

.cc-tarjeta span span {
  color: #54656f;
}

/* --- Escribiendo ----------------------------------------------------------------------- */

.cc-burbuja--escribiendo {
  padding: 9px 12px;
}

.cc-puntos {
  display: inline-flex;
  gap: 3px;
}

.cc-puntos i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #8696a0;
  animation: cc-punto 1.1s ease-in-out infinite;
}

.cc-puntos i:nth-child(2) {
  animation-delay: 0.16s;
}

.cc-puntos i:nth-child(3) {
  animation-delay: 0.32s;
}

@keyframes cc-punto {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.45;
  }
  30% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

/* --- Audio y transcripción ------------------------------------------------------------- */

.cc-burbuja--audio {
  width: 84%;
  padding: 6px 8px 5px;
}

.cc-audio {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cc-audio__play {
  font-size: 22px;
  color: #54656f;
}

.cc-audio__onda {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 2px;
  height: 22px;
}

.cc-audio__onda i {
  flex: 1;
  border-radius: 2px;
  background: #8fb3a6;
}

.cc-audio__foto {
  position: relative;
  flex: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: inline-flex;
  align-items: flex-end;
  justify-content: center;
  overflow: visible;
  background: linear-gradient(160deg, #a7b8c9, #6f8399);
  color: #e9eef3;
  font-size: 24px;
  line-height: 1;
}

.cc-audio__foto > .bi-person-fill {
  display: block;
  height: 26px;
  overflow: hidden;
  border-radius: 0 0 16px 16px;
}

.cc-audio__mic {
  position: absolute;
  left: -5px;
  bottom: -2px;
  font-size: 12px;
  color: #8696a0;
  transition: color 0.3s ease;
}

.cc-audio__mic--escuchado {
  color: #53bdeb;
}

.cc-audio__pie {
  display: flex;
  justify-content: space-between;
  padding: 1px 46px 0 30px;
  font-size: 9.5px;
  color: #667781;
}

.cc-transcribiendo {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 5px;
  padding-top: 5px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  font-size: 11px;
  font-style: italic;
  color: #3b7a68;
  /* Brillo que barre el texto: lo que dice "está trabajando". */
  background: linear-gradient(90deg, #3b7a68 0%, #3b7a68 40%, #a8d8c6 50%, #3b7a68 60%, #3b7a68 100%);
  background-size: 250% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: cc-brillo 1.3s linear infinite;
}

.cc-transcribiendo .bi {
  -webkit-text-fill-color: #3b7a68;
}

@keyframes cc-brillo {
  from {
    background-position: 100% 0;
  }
  to {
    background-position: -50% 0;
  }
}

.cc-transcripcion {
  margin: 5px 0 0;
  padding-top: 5px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  font-size: 12px;
  line-height: 1.38;
  color: #1f2c34;
}

.cc-palabra {
  opacity: 0;
  animation: cc-palabra 0.22s ease-out forwards;
}

@keyframes cc-palabra {
  from {
    opacity: 0;
    filter: blur(3px);
  }
  to {
    opacity: 1;
    filter: blur(0);
  }
}

/* --- Vista previa del link de la tienda ------------------------------------------------ */

.cc-enlace {
  margin: -1px -4px 6px;
  border-radius: 6px;
  overflow: clip;
  background: #f0f2f5;
}

.cc-enlace__imagen {
  position: relative;
  height: 92px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(70% 90% at 50% 40%, #ffffff, #dde9f7);
}

.cc-lata {
  height: 84px;
}

.cc-enlace__oferta {
  position: absolute;
  top: 7px;
  right: 7px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #fa7e06;
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.05em;
}

.cc-enlace__datos {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 6px 8px 7px;
  line-height: 1.25;
}

.cc-enlace__titulo {
  font-size: 12px;
  font-weight: 700;
}

.cc-enlace__detalle {
  font-size: 10.5px;
  color: #54656f;
}

.cc-enlace__sitio {
  margin-top: 2px;
  font-size: 10px;
  color: #008069;
}

/* --- Barra de entrada ------------------------------------------------------------------ */

.cc-tel__entrada {
  flex: none;
  display: flex;
  align-items: flex-end;
  gap: 6px;
  padding: 6px 8px 14px;
  background: #efeae2;
}

.cc-tel__campo {
  flex: 1;
  min-width: 0;
  min-height: 38px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  background: #fff;
  color: #8696a0;
  font-size: 13px;
  box-shadow: 0 1px 0.5px rgba(11, 20, 26, 0.13);
}

.cc-tel__campo > .bi {
  font-size: 16px;
}

.cc-tel__placeholder {
  flex: 1;
}

.cc-tel__tipeo {
  flex: 1;
  min-width: 0;
  color: #111b21;
  font-size: 12px;
  line-height: 1.3;
  max-height: 48px;
  overflow: clip;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-end;
}

.cc-palabra--tipeo {
  white-space: pre;
  animation-duration: 0.12s;
}

.cc-grabando__punto {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #ea0038;
  animation: cc-latido 0.9s ease-in-out infinite;
}

.cc-grabando__tiempo {
  color: #111b21;
  font-variant-numeric: tabular-nums;
}

.cc-grabando__cancelar {
  margin-left: auto;
  font-size: 11px;
}

@keyframes cc-latido {
  50% {
    opacity: 0.25;
  }
}

.cc-tel__boton {
  flex: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #00a884;
  color: #fff;
  font-size: 17px;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.cc-tel__entrada--grabando .cc-tel__boton {
  transform: scale(1.22);
  box-shadow: 0 0 0 6px rgba(0, 168, 132, 0.18);
}

@media (prefers-reduced-motion: reduce) {
  .cc-palabra,
  .cc-msg--salto .cc-chip,
  .cc-transcribiendo {
    animation: none;
    opacity: 1;
  }

  .cc-msg-enter-active,
  .cc-msg-move {
    transition: none;
  }
}
</style>
