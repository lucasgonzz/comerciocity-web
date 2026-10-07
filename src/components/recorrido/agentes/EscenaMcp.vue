<template>
  <div ref="marco" class="cc-mcp" aria-hidden="true">
    <!-- La tercera diapositiva de la sección de agentes: una computadora con Windows y Claude
         Code abierto. El dueño le pide por voz un análisis; Claude lee el negocio por el MCP de
         ComercioCity, investiga en internet, propone un plan, el dueño lo ajusta y le dice que
         lo publique. Cuando Claude termina de aplicarlo, la computadora GIRA y del otro lado
         está el sistema con los cambios entrando.

         Las dos caras son dos monitores completos en una tarjeta 3D: la de adelante con la
         terminal y la de atrás con el sistema, girada 180° de entrada. Girar la tarjeta es lo
         único que hace falta para "dar vuelta" la computadora.

         Decorativa para un lector de pantalla, como el teléfono: la sección describe la escena
         en texto al lado. -->
    <!-- (Este comentario va ADENTRO de la raíz a propósito: un comentario antes de la raíz
         vuelve al componente un fragmento, y la <transition mode="out-in"> de la sección
         se queda trabada en la salida sin montar la escena siguiente.) -->
    <div class="cc-mcp__maqueta" :class="{ 'cc-mcp__maqueta--angosta': angosta }" :style="estilo_maqueta">
      <div class="cc-mcp__tarjeta" :class="{ 'cc-mcp__tarjeta--girada': girada, 'cc-mcp__tarjeta--quieta': reducido }">
        <!-- ===================== Frente: Windows + Claude Code ===================== -->
        <div class="cc-mcp__cara cc-mcp__cara--frente">
          <div class="cc-monitor">
            <div class="cc-monitor__pantalla cc-windows">
              <div class="cc-terminal">
                <div class="cc-terminal__pestanas">
                  <span class="cc-terminal__pestana">
                    <span class="cc-terminal__icono">✻</span>
                    Claude Code
                    <i class="bi bi-x"></i>
                  </span>
                  <i class="bi bi-plus cc-terminal__mas"></i>
                  <span class="cc-terminal__ventana">
                    <i class="bi bi-dash-lg"></i>
                    <i class="bi bi-square"></i>
                    <i class="bi bi-x-lg"></i>
                  </span>
                </div>

                <div class="cc-terminal__cuerpo">
                  <div class="cc-terminal__historia">
                    <div class="cc-terminal__bienvenida">
                      <div><span class="cc-naranja">✻</span> <strong>Claude Code</strong></div>
                      <div class="cc-tenue">cwd: {{ terminal.directorio }}</div>
                      <div class="cc-tenue">
                        MCP: <span class="cc-azul">comerciocity</span>
                        <span class="cc-verde">● conectado</span>
                      </div>
                    </div>

                    <div
                      v-for="linea in lineas"
                      :key="linea.id"
                      class="cc-linea"
                      :class="'cc-linea--' + linea.tipo"
                    >
                      <template v-if="linea.tipo === 'prompt'">
                        <span class="cc-tenue">&gt;</span> {{ linea.texto }}
                      </template>

                      <template v-else-if="linea.tipo === 'pensando'">
                        <span class="cc-naranja cc-girando">✻</span>
                        <span class="cc-naranja">{{ linea.texto }}</span>
                        <span class="cc-tenue">(esc para interrumpir)</span>
                      </template>

                      <template v-else-if="linea.tipo === 'herramienta'">
                        <div>
                          <span
                            class="cc-punto"
                            :class="linea.listo ? (linea.ok ? 'cc-verde' : 'cc-verde') : 'cc-punto--latiendo'"
                            >⏺</span
                          >
                          <strong :class="{ 'cc-azul': linea.mcp }">{{ linea.nombre }}</strong>
                          <span v-if="linea.mcp" class="cc-mcp-pill">MCP</span>
                          <span v-if="linea.args" class="cc-tenue">({{ linea.args }})</span>
                        </div>
                        <div class="cc-resultado">
                          <span class="cc-tenue">⎿</span>
                          <span v-if="!linea.listo" class="cc-tenue">Ejecutando…</span>
                          <span v-else :class="{ 'cc-verde': linea.ok }">{{ linea.ok ? '✔ ' : '' }}{{ linea.resultado }}</span>
                        </div>
                      </template>

                      <template v-else-if="linea.tipo === 'respuesta'">
                        <span class="cc-punto cc-blanco">⏺</span>
                        <div class="cc-respuesta">
                          <div
                            v-for="(bloque, i) in linea.bloques"
                            :key="i"
                            class="cc-bloque"
                            :class="{
                              'cc-bloque--titulo': bloque.titulo,
                              'cc-bloque--item': bloque.item,
                            }"
                            :style="{ animationDelay: i * MS_POR_BLOQUE + 'ms' }"
                          >
                            <template v-if="bloque.titulo">{{ bloque.titulo }}</template>
                            <template v-else-if="bloque.item">
                              <span class="cc-vineta">{{ bloque.num ? bloque.num + '.' : '•' }}</span>
                              <span v-html="formatear(bloque.item)"></span>
                            </template>
                            <span v-else v-html="formatear(bloque.texto)"></span>
                          </div>
                        </div>
                      </template>
                    </div>
                  </div>

                  <div class="cc-terminal__entrada" :class="'cc-terminal__entrada--' + entrada">
                    <span class="cc-tenue">&gt;</span>
                    <template v-if="entrada === 'escuchando'">
                      <i class="bi bi-mic-fill cc-mic"></i>
                      <span class="cc-onda"><i v-for="n in 14" :key="n" :style="{ animationDelay: n * 60 + 'ms' }"></i></span>
                      <span class="cc-tenue">Escuchando…</span>
                    </template>
                    <span v-else-if="entrada === 'tipeando'" class="cc-terminal__tipeo">
                      <span
                        v-for="(palabra, i) in palabras(texto_entrada)"
                        :key="texto_entrada + i"
                        class="cc-palabra"
                        :style="{ animationDelay: i * ms_por_palabra + 'ms' }"
                        >{{ palabra + ' ' }}</span
                      >
                    </span>
                    <span v-else class="cc-cursor"></span>
                  </div>
                  <div class="cc-terminal__pie">
                    <span><i class="bi bi-mic"></i> dictado por voz</span>
                    <span><span class="cc-verde">●</span> comerciocity MCP</span>
                  </div>
                </div>
              </div>

              <div class="cc-barra-tareas">
                <span class="cc-barra-tareas__centro">
                  <span class="cc-ico cc-ico--inicio"><i></i><i></i><i></i><i></i></span>
                  <span class="cc-ico"><i class="bi bi-search"></i></span>
                  <span class="cc-ico cc-ico--activo"><i class="bi bi-terminal-fill"></i></span>
                  <span class="cc-ico"><i class="bi bi-folder-fill cc-carpeta"></i></span>
                  <span class="cc-ico"><i class="bi bi-globe2 cc-globo"></i></span>
                </span>
                <span class="cc-barra-tareas__hora">
                  <span>18:42</span>
                </span>
              </div>
            </div>
          </div>
          <div class="cc-monitor__pie"><span class="cc-monitor__cuello"></span><span class="cc-monitor__base"></span></div>
        </div>

        <!-- ===================== Dorso: el sistema con los cambios ===================== -->
        <div class="cc-mcp__cara cc-mcp__cara--dorso">
          <div class="cc-monitor">
            <div class="cc-monitor__pantalla cc-sistema">
              <div class="cc-navegador">
                <span class="cc-navegador__puntos"><i></i><i></i><i></i></span>
                <span class="cc-navegador__url"><i class="bi bi-lock-fill"></i> tunegocio.comerciocity.com/promociones</span>
              </div>

              <div class="cc-app">
                <nav class="cc-app__menu">
                  <span class="cc-app__marca">
                    <img :src="isotipo" alt="" />
                    <span>ComercioCity</span>
                  </span>
                  <span class="cc-app__item"><i class="bi bi-cart3"></i><span>Vender</span></span>
                  <span class="cc-app__item"><i class="bi bi-box-seam"></i><span>Artículos</span></span>
                  <span class="cc-app__item cc-app__item--activo"><i class="bi bi-tags"></i><span>Promociones</span></span>
                  <span class="cc-app__item"><i class="bi bi-people"></i><span>Clientes</span></span>
                  <span class="cc-app__item"><i class="bi bi-calendar-check"></i><span>Agenda</span></span>
                </nav>

                <main class="cc-app__contenido">
                  <div class="cc-app__encabezado">
                    <div>
                      <div class="cc-app__titulo">Promociones</div>
                      <div class="cc-app__bajada">Combos, ofertas por cantidad y agenda</div>
                    </div>
                  </div>

                  <transition name="cc-aviso">
                    <div v-if="cambios.aviso" class="cc-aviso">
                      <span class="cc-naranja">✻</span>
                      <span><strong>Claude · vía MCP</strong><br />3 cambios aplicados</span>
                    </div>
                  </transition>

                  <div class="cc-app__grilla">
                    <section class="cc-panel cc-panel--combos">
                      <div class="cc-panel__titulo"><i class="bi bi-boxes"></i> Combos</div>
                      <div v-if="cambios.combo" class="cc-fila cc-fila--nueva">
                        <span class="cc-fila__texto">
                          <strong>Previa Oktoberfest</strong>
                          <span>Fernet 750 ml + 2 cola 1,5 L</span>
                        </span>
                        <span class="cc-fila__precio">$16.900</span>
                        <span class="cc-insignia">Nuevo</span>
                      </div>
                      <div class="cc-fila">
                        <span class="cc-fila__texto">
                          <strong>Combo Asado</strong>
                          <span>Carbón 4 kg + 2 vinos tintos</span>
                        </span>
                        <span class="cc-fila__precio">$14.500</span>
                      </div>
                    </section>

                    <section class="cc-panel">
                      <div class="cc-panel__titulo"><i class="bi bi-percent"></i> Ofertas por cantidad</div>
                      <div v-if="cambios.oferta" class="cc-fila cc-fila--nueva">
                        <span class="cc-fila__texto">
                          <strong>Cerveza lata 473 ml</strong>
                          <span>10 % off desde 48 u.</span>
                        </span>
                        <span class="cc-insignia">Nuevo</span>
                      </div>
                      <div class="cc-fila">
                        <span class="cc-fila__texto">
                          <strong>Agua mineral 2 L</strong>
                          <span>5 % off desde 12 u.</span>
                        </span>
                      </div>
                    </section>

                    <section class="cc-panel">
                      <div class="cc-panel__titulo"><i class="bi bi-calendar-check"></i> Agenda</div>
                      <div v-if="cambios.tarea" class="cc-fila cc-fila--nueva">
                        <span class="cc-fila__texto">
                          <strong>Pedir 60 bultos de lata</strong>
                          <span>Jueves · 9:00</span>
                        </span>
                        <span class="cc-insignia">Nuevo</span>
                      </div>
                      <div class="cc-fila">
                        <span class="cc-fila__texto">
                          <strong>Pagar alquiler del depósito</strong>
                          <span>Viernes · 10:00</span>
                        </span>
                      </div>
                    </section>
                  </div>
                </main>
              </div>
            </div>
          </div>
          <div class="cc-monitor__pie"><span class="cc-monitor__cuello"></span><span class="cc-monitor__base"></span></div>
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

/** Escalonado de los renglones de una respuesta de Claude. */
const MS_POR_BLOQUE = 140
/** Ritmo del dictado (rápido: es la voz transcripta) y del tipeo (más lento: son dedos). */
const MS_POR_PALABRA_DICTADO = 55
const MS_POR_PALABRA_TECLADO = 95
/** Debajo de este ancho disponible la terminal se dibuja angosta, para que la letra no quede minúscula. */
const ANCHO_ANGOSTO = 520

/**
 * @param {Array} pasos
 * @returns {Array}
 */
function expandir(pasos) {
  const micro = []
  pasos.forEach(function (p) {
    switch (p.tipo) {
      case 'dictado':
        micro.push({ op: 'escuchar' })
        micro.push({ op: 'tipear', texto: p.texto, ms_por_palabra: MS_POR_PALABRA_DICTADO })
        micro.push({ op: 'enviar', texto: p.texto })
        break
      case 'escrito':
        micro.push({ op: 'tipear', texto: p.texto, ms_por_palabra: MS_POR_PALABRA_TECLADO })
        micro.push({ op: 'enviar', texto: p.texto })
        break
      case 'herramienta':
        micro.push({ op: 'herramienta', linea: p })
        micro.push({ op: 'resultado' })
        break
      default:
        micro.push(Object.assign({ op: p.tipo }, p))
    }
  })
  /* Lo último que se ve (el sistema con los cambios) se queda un rato antes de pasar. */
  micro.push({ op: 'fin' })
  return micro
}

export default {
  name: 'EscenaMcp',

  mixins: [ajuste_a_medida],

  props: {
    /** El guion de la terminal (guiones.js). */
    terminal: {
      type: Object,
      required: true,
    },
    reproduciendo: {
      type: Boolean,
      default: false,
    },
    reducido: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['terminado', 'progreso'],

  data() {
    return {
      isotipo: ISOTIPO,
      MS_POR_BLOQUE,
      lineas: [],
      /** reposo | escuchando | tipeando */
      entrada: 'reposo',
      texto_entrada: '',
      ms_por_palabra: MS_POR_PALABRA_DICTADO,
      girada: false,
      cambios: { aviso: false, combo: false, oferta: false, tarea: false },
      angosta: false,
      motor: null,
      proximo_id: 1,
    }
  },

  mounted() {
    const self = this
    this.motor = crear_motor(expandir(this.terminal.pasos), {
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

    /**
     * Medida de la maqueta (contrato de ajuste-a-medida.js): angosta en un teléfono, para
     * que la terminal no quede con letra de 6 px.
     *
     * @param {number} ancho_disponible
     * @returns {{ ancho: number, alto: number }}
     */
    diseno(ancho_disponible) {
      this.angosta = ancho_disponible < ANCHO_ANGOSTO
      return this.angosta ? { ancho: 400, alto: 590 } : { ancho: 590, alto: 450 }
    },

    /**
     * @param {string} texto
     * @returns {Array<string>}
     */
    palabras(texto) {
      return String(texto || '').split(' ')
    },

    /**
     * @param {object} paso
     * @param {boolean} instantaneo
     * @returns {number}
     */
    aplicar(paso, instantaneo) {
      /* La ruedita de "pensando" es transitoria, como en Claude Code: se va con lo siguiente. */
      if (paso.op !== 'pensando') {
        this.lineas = this.lineas.filter(function (l) {
          return l.tipo !== 'pensando'
        })
      }

      switch (paso.op) {
        case 'escuchar':
          if (instantaneo) {
            return 0
          }
          this.entrada = 'escuchando'
          return 1700

        case 'tipear':
          if (instantaneo) {
            return 0
          }
          this.entrada = 'tipeando'
          this.texto_entrada = paso.texto
          this.ms_por_palabra = paso.ms_por_palabra
          return this.palabras(paso.texto).length * paso.ms_por_palabra + 450

        case 'enviar':
          this.entrada = 'reposo'
          this.texto_entrada = ''
          this.agregar({ tipo: 'prompt', texto: paso.texto })
          return 450

        case 'pensando':
          if (instantaneo) {
            return 0
          }
          this.agregar({ tipo: 'pensando', texto: paso.texto })
          return paso.ms || 1000

        case 'herramienta':
          this.agregar(Object.assign({ listo: false }, paso.linea, { tipo: 'herramienta' }))
          return 650

        case 'resultado':
          this.ultima('herramienta').listo = true
          return 520

        case 'respuesta': {
          this.agregar({ tipo: 'respuesta', bloques: paso.bloques })
          const largo = paso.bloques.reduce(function (total, b) {
            return total + (b.item || b.texto || b.titulo || '').length
          }, 0)
          return paso.bloques.length * MS_POR_BLOQUE + Math.min(8000, 1100 + largo * 18)
        }

        case 'girar':
          if (instantaneo) {
            return 0
          }
          this.girada = true
          return 1500

        case 'sistema':
          this.cambios[paso.cambio] = true
          return paso.cambio === 'aviso' ? 900 : 1100

        case 'fin':
          return 5500

        default:
          return 0
      }
    },

    /** @param {object} linea */
    agregar(linea) {
      this.lineas.push(Object.assign({ id: this.proximo_id++ }, linea))
    },

    /**
     * @param {string} tipo
     * @returns {object}
     */
    ultima(tipo) {
      for (let i = this.lineas.length - 1; i >= 0; i--) {
        if (this.lineas[i].tipo === tipo) {
          return this.lineas[i]
        }
      }
      return {}
    },
  },
}
</script>

<style scoped>
.cc-mcp {
  position: relative;
  width: 100%;
  height: 100%;
}

.cc-mcp__maqueta {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: center center;
  perspective: 1800px;
}

/* La tarjeta que gira: sus dos caras ocupan el mismo lugar y cada una esconde su espalda. */
.cc-mcp__tarjeta {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.cc-mcp__tarjeta--girada {
  animation: cc-girar 1.35s cubic-bezier(0.65, 0, 0.35, 1) forwards;
}

.cc-mcp__tarjeta--quieta {
  animation: none;
}

/* Gira y se aleja un poco a mitad de camino: sin el alejamiento el giro de un monitor tan
   ancho se come los bordes de la columna. */
@keyframes cc-girar {
  0% {
    transform: rotateY(0deg) scale(1);
  }
  50% {
    transform: rotateY(90deg) scale(0.82);
  }
  100% {
    transform: rotateY(180deg) scale(1);
  }
}

.cc-mcp__cara {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.cc-mcp__cara--dorso {
  transform: rotateY(180deg);
}

/* --- El monitor ------------------------------------------------------------------------ */

.cc-monitor {
  flex: 1;
  width: 100%;
  min-height: 0;
  padding: 9px;
  border-radius: 14px;
  background: linear-gradient(160deg, #2b313c, #0f1218 60%, #222833);
  box-shadow:
    0 0 0 1px #3c4452,
    0 34px 70px -26px rgba(0, 0, 0, 0.7);
}

.cc-monitor__pantalla {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 6px;
  overflow: clip;
}

.cc-monitor__pie {
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cc-monitor__cuello {
  width: 70px;
  height: 30px;
  background: linear-gradient(90deg, #2a303a, #464e5c 50%, #2a303a);
  clip-path: polygon(14% 0, 86% 0, 100% 100%, 0 100%);
}

.cc-monitor__base {
  width: 190px;
  height: 9px;
  border-radius: 6px 6px 3px 3px;
  background: linear-gradient(180deg, #4a5262, #232831);
  box-shadow: 0 10px 22px -8px rgba(0, 0, 0, 0.6);
}

/* --- Escritorio de Windows ------------------------------------------------------------- */

.cc-windows {
  background:
    radial-gradient(60% 75% at 62% 58%, rgba(85, 160, 255, 0.85), transparent 70%),
    radial-gradient(45% 55% at 38% 40%, rgba(120, 90, 255, 0.55), transparent 70%),
    linear-gradient(160deg, #0b1a3a, #123a7a 55%, #0a1430);
}

.cc-terminal {
  position: absolute;
  top: 12px;
  left: 16px;
  right: 16px;
  bottom: 42px;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: clip;
  background: #141414;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08),
    0 18px 40px -12px rgba(0, 0, 0, 0.7);
  font-family: 'Cascadia Mono', 'Cascadia Code', Consolas, 'SFMono-Regular', Menlo, monospace;
  font-size: 11px;
  line-height: 1.45;
  color: #e4e4e4;
}

.cc-terminal__pestanas {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 30px;
  padding: 0 0 0 8px;
  background: #202020;
  font-family: 'Segoe UI', -apple-system, sans-serif;
  font-size: 11px;
  color: #d8d8d8;
}

.cc-terminal__pestana {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  margin-top: 6px;
  padding: 0 8px 0 10px;
  border-radius: 6px 6px 0 0;
  background: #141414;
}

.cc-terminal__icono {
  color: #d97757;
  font-size: 12px;
}

.cc-terminal__mas {
  font-size: 14px;
  opacity: 0.7;
}

.cc-terminal__ventana {
  display: inline-flex;
  gap: 16px;
  margin-left: auto;
  padding: 0 12px;
  font-size: 10px;
  opacity: 0.75;
}

.cc-terminal__cuerpo {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 8px 12px 6px;
}

/* Igual que el chat del teléfono: lo nuevo entra abajo y lo viejo se recorta arriba. */
.cc-terminal__historia {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 7px;
  overflow: clip;
}

.cc-terminal__bienvenida {
  flex: none;
  padding: 6px 10px;
  border: 1px solid #d97757;
  border-radius: 6px;
}

.cc-linea {
  flex: none;
  animation: cc-aparecer 0.25s ease-out both;
}

.cc-linea--prompt {
  padding: 3px 8px;
  border-radius: 4px;
  background: #262626;
  color: #cfcfcf;
}

.cc-linea--respuesta {
  display: flex;
  gap: 6px;
}

.cc-punto {
  display: inline-block;
  width: 12px;
}

.cc-punto--latiendo {
  color: #8a8a8a;
  animation: cc-latido 0.7s ease-in-out infinite;
}

.cc-resultado {
  display: flex;
  gap: 6px;
  padding-left: 10px;
}

.cc-mcp-pill {
  display: inline-block;
  margin-left: 4px;
  padding: 0 4px;
  border-radius: 3px;
  background: rgba(74, 168, 255, 0.18);
  color: #7cc0ff;
  font-size: 9px;
  font-weight: 700;
  line-height: 14px;
  vertical-align: 1px;
}

.cc-respuesta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cc-bloque {
  animation: cc-aparecer 0.3s ease-out both;
}

.cc-bloque--titulo {
  margin-top: 3px;
  font-weight: 700;
  color: #fff;
}

.cc-bloque--titulo:first-child {
  margin-top: 0;
}

.cc-bloque--item {
  display: flex;
  gap: 6px;
}

.cc-vineta {
  flex: none;
  color: #d97757;
}

.cc-bloque :deep(strong) {
  color: #fff;
  font-weight: 700;
}

.cc-terminal__entrada {
  flex: none;
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 30px;
  margin-top: 8px;
  padding: 5px 9px;
  border: 1px solid #555;
  border-radius: 6px;
  color: #f2f2f2;
}

.cc-terminal__entrada--escuchando {
  border-color: #d97757;
}

.cc-terminal__tipeo {
  flex: 1;
  min-width: 0;
}

.cc-mic {
  color: #ff5f57;
  animation: cc-latido 0.9s ease-in-out infinite;
}

.cc-onda {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  height: 14px;
}

.cc-onda i {
  width: 2px;
  height: 100%;
  border-radius: 1px;
  background: #d97757;
  animation: cc-onda 0.8s ease-in-out infinite;
}

@keyframes cc-onda {
  0%,
  100% {
    transform: scaleY(0.25);
  }
  50% {
    transform: scaleY(1);
  }
}

.cc-cursor {
  width: 7px;
  height: 13px;
  background: #e4e4e4;
  animation: cc-latido 1s steps(1) infinite;
}

.cc-terminal__pie {
  flex: none;
  display: flex;
  justify-content: space-between;
  padding: 3px 2px 0;
  font-size: 9.5px;
  color: #7d7d7d;
}

.cc-palabra {
  opacity: 0;
  animation: cc-aparecer 0.14s ease-out forwards;
}

.cc-tenue {
  color: #8a8a8a;
}

.cc-naranja {
  color: #d97757;
}

.cc-azul {
  color: #6cb6ff;
}

.cc-verde {
  color: #4ec98a;
}

.cc-blanco {
  color: #f2f2f2;
}

.cc-girando {
  display: inline-block;
  animation: cc-girar-estrella 1.2s linear infinite;
}

@keyframes cc-girar-estrella {
  to {
    transform: rotate(360deg);
  }
}

@keyframes cc-aparecer {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes cc-latido {
  50% {
    opacity: 0.3;
  }
}

/* --- Barra de tareas ------------------------------------------------------------------- */

.cc-barra-tareas {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(20, 26, 40, 0.82);
  backdrop-filter: blur(8px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  color: #fff;
}

.cc-barra-tareas__centro {
  display: flex;
  gap: 6px;
}

.cc-ico {
  position: relative;
  width: 26px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  font-size: 13px;
}

.cc-ico--activo {
  background: rgba(255, 255, 255, 0.1);
}

.cc-ico--activo::after {
  content: '';
  position: absolute;
  bottom: 1px;
  width: 10px;
  height: 2px;
  border-radius: 2px;
  background: #6cb6ff;
}

.cc-ico--inicio {
  display: inline-grid;
  grid-template-columns: 6px 6px;
  gap: 1.5px;
  align-content: center;
  justify-content: center;
}

.cc-ico--inicio i {
  width: 6px;
  height: 6px;
  border-radius: 1px;
  background: linear-gradient(135deg, #6cc4ff, #2f8cff);
}

.cc-carpeta {
  color: #ffc83d;
}

.cc-globo {
  color: #4cc2ff;
}

.cc-barra-tareas__hora {
  position: absolute;
  right: 12px;
  font-family: 'Segoe UI', -apple-system, sans-serif;
  font-size: 10px;
}

/* --- El sistema ------------------------------------------------------------------------ */

.cc-sistema {
  display: flex;
  flex-direction: column;
  background: #f5f7fb;
  font-family: 'Geist', 'Segoe UI', -apple-system, sans-serif;
  color: #1c2333;
}

.cc-navegador {
  flex: none;
  display: flex;
  align-items: center;
  gap: 12px;
  height: 30px;
  padding: 0 10px;
  background: #e9edf3;
  border-bottom: 1px solid #d9dfe8;
}

.cc-navegador__puntos {
  display: inline-flex;
  gap: 5px;
}

.cc-navegador__puntos i {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #c3cad6;
}

.cc-navegador__url {
  flex: 1;
  height: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  border-radius: 10px;
  background: #fff;
  color: #566078;
  font-size: 10px;
  white-space: nowrap;
  overflow: hidden;
}

.cc-app {
  flex: 1;
  min-height: 0;
  display: flex;
}

.cc-app__menu {
  flex: none;
  width: 120px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 12px 8px;
  background: #fff;
  border-right: 1px solid #e3e8f0;
  font-size: 11px;
}

.cc-app__marca {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  padding: 0 4px;
  font-weight: 700;
  font-size: 11px;
}

.cc-app__marca img {
  width: 16px;
  height: 16px;
}

.cc-app__item {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 7px;
  border-radius: 6px;
  color: #566078;
}

.cc-app__item--activo {
  background: rgba(11, 132, 248, 0.1);
  color: #0b84f8;
  font-weight: 600;
}

.cc-app__contenido {
  position: relative;
  flex: 1;
  min-width: 0;
  padding: 12px 14px;
  overflow: clip;
}

.cc-app__titulo {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.cc-app__bajada {
  font-size: 11px;
  color: #566078;
}

.cc-app__grilla {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 14px;
}

.cc-panel {
  padding: 10px 11px;
  border-radius: 9px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(28, 35, 51, 0.07), 0 0 0 1px rgba(28, 35, 51, 0.05);
}

.cc-panel--combos {
  grid-column: 1 / -1;
}

.cc-panel__titulo {
  margin-bottom: 7px;
  font-size: 11.5px;
  font-weight: 700;
  color: #1c2333;
}

.cc-panel__titulo .bi {
  color: #0b84f8;
}

.cc-fila {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  border-radius: 6px;
  font-size: 11px;
}

.cc-fila + .cc-fila {
  margin-top: 3px;
}

.cc-fila__texto {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.cc-fila__texto span {
  color: #566078;
  font-size: 10px;
}

.cc-fila__precio {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* Lo que acaba de crear Claude: entra con un destello azul que se asienta en un tinte. */
.cc-fila--nueva {
  background: rgba(11, 132, 248, 0.08);
  box-shadow: inset 3px 0 0 #0b84f8;
  animation: cc-fila-nueva 1.2s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes cc-fila-nueva {
  0% {
    opacity: 0;
    transform: translateX(-10px);
    background: rgba(11, 132, 248, 0.35);
  }
  35% {
    opacity: 1;
    transform: none;
    background: rgba(11, 132, 248, 0.3);
  }
  100% {
    background: rgba(11, 132, 248, 0.08);
  }
}

.cc-insignia {
  flex: none;
  padding: 1px 6px;
  border-radius: 999px;
  background: linear-gradient(135deg, #0b84f8, #3a31fc);
  color: #fff;
  font-size: 8.5px;
  font-weight: 700;
}

.cc-aviso {
  position: absolute;
  top: 10px;
  right: 12px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 11px;
  border-radius: 9px;
  background: #1c2333;
  color: #fff;
  font-size: 10px;
  line-height: 1.3;
  box-shadow: 0 10px 24px -8px rgba(28, 35, 51, 0.45);
}

.cc-aviso .cc-naranja {
  font-size: 16px;
}

.cc-aviso-enter-active {
  transition:
    opacity 0.35s ease,
    transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

.cc-aviso-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* Angosta (teléfono): el menú se queda en íconos y los paneles van uno abajo del otro. */
.cc-mcp__maqueta--angosta .cc-app__menu {
  width: 40px;
  align-items: center;
  padding: 10px 4px;
}

.cc-mcp__maqueta--angosta .cc-app__marca span,
.cc-mcp__maqueta--angosta .cc-app__item span {
  display: none;
}

.cc-mcp__maqueta--angosta .cc-app__grilla {
  grid-template-columns: 1fr;
  gap: 7px;
}

.cc-mcp__maqueta--angosta .cc-terminal {
  left: 10px;
  right: 10px;
}

.cc-mcp__maqueta--angosta .cc-terminal__ventana {
  gap: 10px;
}

@media (prefers-reduced-motion: reduce) {
  .cc-linea,
  .cc-bloque,
  .cc-palabra,
  .cc-fila--nueva {
    animation: none;
    opacity: 1;
  }
}
</style>
