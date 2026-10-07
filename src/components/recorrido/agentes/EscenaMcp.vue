<template>
  <div ref="marco" class="cc-mcp" aria-hidden="true">
    <!-- La tercera diapositiva de la sección de agentes: una computadora con Windows y la app
         de escritorio de ChatGPT abierta, con ComercioCity conectado como app por el MCP. El
         dueño le pide por voz un análisis; ChatGPT lee el negocio, investiga en internet,
         propone un plan, el dueño lo ajusta y le dice que lo publique, confirma los cambios en
         la tarjeta y, cuando ChatGPT termina de aplicarlos, la computadora GIRA y del otro lado
         está el sistema con los cambios entrando.

         Interfaz gráfica y no consola a pedido de Lucas (7/10/2026): que se vea lo más fácil y
         familiar posible. La ventana imita la disposición de ChatGPT (barra lateral, columna
         de conversación, cuadro de texto redondeado con dictado) sin copiar su logo.

         Las dos caras son dos monitores completos en una tarjeta 3D: la de adelante con
         ChatGPT y la de atrás con el sistema, girada 180° de entrada.

         Decorativa para un lector de pantalla: la sección describe la escena en texto al lado. -->
    <!-- (Este comentario va ADENTRO de la raíz a propósito: un comentario antes de la raíz
         vuelve al componente un fragmento, y la <transition mode="out-in"> de la sección
         se queda trabada en la salida sin montar la escena siguiente.) -->
    <div class="cc-mcp__maqueta" :class="{ 'cc-mcp__maqueta--angosta': angosta }" :style="estilo_maqueta">
      <div class="cc-mcp__tarjeta" :class="{ 'cc-mcp__tarjeta--girada': girada, 'cc-mcp__tarjeta--quieta': reducido }">
        <!-- ===================== Frente: Windows + ChatGPT ===================== -->
        <div class="cc-mcp__cara cc-mcp__cara--frente">
          <div class="cc-monitor">
            <div class="cc-monitor__pantalla cc-windows">
              <div class="cc-gpt">
                <div class="cc-gpt__ventana">
                  <span class="cc-gpt__icono-app"><i class="bi bi-stars"></i></span>
                  <span>{{ chat.app }}</span>
                  <span class="cc-gpt__controles">
                    <i class="bi bi-dash-lg"></i>
                    <i class="bi bi-square"></i>
                    <i class="bi bi-x-lg"></i>
                  </span>
                </div>

                <div class="cc-gpt__cuerpo">
                  <aside class="cc-gpt__lateral">
                    <span class="cc-gpt__lat-item"><i class="bi bi-pencil-square"></i> Nuevo chat</span>
                    <span class="cc-gpt__lat-item"><i class="bi bi-search"></i> Buscar chats</span>
                    <span class="cc-gpt__lat-rotulo">Apps conectadas</span>
                    <span class="cc-gpt__lat-item cc-gpt__lat-item--app">
                      <img :src="isotipo" alt="" /> ComercioCity <i class="cc-gpt__conectado"></i>
                    </span>
                    <span class="cc-gpt__lat-rotulo">Chats</span>
                    <span class="cc-gpt__lat-item cc-gpt__lat-item--activo">{{ chat.conversacion }}</span>
                    <span class="cc-gpt__lat-item">Ideas para Instagram</span>
                    <span class="cc-gpt__lat-item">Mail a un proveedor</span>
                  </aside>

                  <div class="cc-gpt__principal">
                    <div class="cc-gpt__barra">
                      <span class="cc-gpt__modelo">{{ chat.app }} <i class="bi bi-chevron-down"></i></span>
                      <span class="cc-gpt__compartir"><i class="bi bi-box-arrow-up"></i> Compartir</span>
                    </div>

                    <!-- Lo nuevo entra abajo y lo viejo se recorta arriba, como un chat que
                         scrollea solo (mismo recurso que el teléfono). -->
                    <div class="cc-gpt__conversacion">
                      <div
                        v-for="linea in lineas"
                        :key="linea.id"
                        class="cc-gpt__linea"
                        :class="'cc-gpt__linea--' + linea.tipo"
                      >
                        <div v-if="linea.tipo === 'prompt'" class="cc-gpt__usuario">{{ linea.texto }}</div>

                        <div v-else-if="linea.tipo === 'pensando'" class="cc-gpt__pensando cc-brillo">
                          {{ linea.texto }}…
                        </div>

                        <div v-else-if="linea.tipo === 'herramienta'" class="cc-gpt__herramienta">
                          <span class="cc-gpt__herramienta-icono" :class="'cc-gpt__herramienta-icono--' + linea.fuente">
                            <img v-if="linea.fuente === 'comerciocity'" :src="isotipo" alt="" />
                            <i v-else class="bi bi-globe2"></i>
                          </span>
                          <span class="cc-gpt__herramienta-texto">
                            <span :class="{ 'cc-brillo': !linea.listo }">{{ linea.accion }}</span>
                            <i v-if="linea.listo" class="bi bi-check2 cc-gpt__tilde"></i>
                            <span v-if="linea.listo && linea.resultado" class="cc-gpt__herramienta-resultado">
                              {{ linea.resultado }}
                            </span>
                          </span>
                        </div>

                        <div v-else-if="linea.tipo === 'confirmar'" class="cc-gpt__confirmar">
                          <div class="cc-gpt__confirmar-titulo">
                            <img :src="isotipo" alt="" />
                            <strong>{{ linea.titulo }}</strong>
                          </div>
                          <ul>
                            <li v-for="accion in linea.acciones" :key="accion">{{ accion }}</li>
                          </ul>
                          <div class="cc-gpt__confirmar-botones">
                            <span class="cc-gpt__boton cc-gpt__boton--secundario">Cancelar</span>
                            <span class="cc-gpt__boton" :class="{ 'cc-gpt__boton--presionado': linea.confirmado }">
                              <template v-if="linea.confirmado"><i class="bi bi-check2"></i> Confirmado</template>
                              <template v-else>Confirmar</template>
                            </span>
                          </div>
                        </div>

                        <div v-else-if="linea.tipo === 'respuesta'" class="cc-gpt__respuesta">
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
                      </div>
                    </div>

                    <div class="cc-gpt__composer" :class="'cc-gpt__composer--' + entrada">
                      <i class="bi bi-plus-lg cc-gpt__mas"></i>
                      <template v-if="entrada === 'escuchando'">
                        <span class="cc-gpt__onda">
                          <i v-for="n in 44" :key="n" :style="{ animationDelay: (n % 9) * 85 + 'ms' }"></i>
                        </span>
                        <span class="cc-gpt__redondo cc-gpt__redondo--claro"><i class="bi bi-x-lg"></i></span>
                        <span class="cc-gpt__redondo"><i class="bi bi-check-lg"></i></span>
                      </template>
                      <template v-else-if="entrada === 'tipeando'">
                        <span class="cc-gpt__tipeo">
                          <span
                            v-for="(palabra, i) in palabras(texto_entrada)"
                            :key="texto_entrada + i"
                            class="cc-palabra"
                            :style="{ animationDelay: i * ms_por_palabra + 'ms' }"
                            >{{ palabra + ' ' }}</span
                          >
                        </span>
                        <span class="cc-gpt__redondo"><i class="bi bi-arrow-up"></i></span>
                      </template>
                      <template v-else>
                        <span class="cc-gpt__placeholder">Preguntá lo que quieras</span>
                        <i class="bi bi-mic cc-gpt__mic"></i>
                        <span class="cc-gpt__redondo"><i class="bi bi-soundwave"></i></span>
                      </template>
                    </div>
                  </div>
                </div>
              </div>

              <div class="cc-barra-tareas">
                <span class="cc-barra-tareas__centro">
                  <span class="cc-ico cc-ico--inicio"><i></i><i></i><i></i><i></i></span>
                  <span class="cc-ico"><i class="bi bi-search"></i></span>
                  <span class="cc-ico cc-ico--activo"><span class="cc-ico__app"><i class="bi bi-stars"></i></span></span>
                  <span class="cc-ico"><i class="bi bi-folder-fill cc-carpeta"></i></span>
                  <span class="cc-ico"><i class="bi bi-globe2 cc-globo"></i></span>
                </span>
                <span class="cc-barra-tareas__hora">18:42</span>
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
                      <span class="cc-aviso__icono"><i class="bi bi-stars"></i></span>
                      <span><strong>{{ chat.app }} · vía MCP</strong><br />3 cambios aplicados</span>
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

/** Escalonado de los renglones de una respuesta. */
const MS_POR_BLOQUE = 140
/** Ritmo del dictado (rápido: es la voz transcripta) y del tipeo (más lento: son dedos). */
const MS_POR_PALABRA_DICTADO = 55
const MS_POR_PALABRA_TECLADO = 95
/** Debajo de este ancho disponible la ventana se dibuja angosta, sin barra lateral. */
const ANCHO_ANGOSTO = 520

/**
 * Pasa el guion de alto nivel a los pasos chicos que ve el que mira.
 *
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
      case 'confirmar':
        micro.push({ op: 'confirmar', linea: p })
        micro.push({ op: 'confirmado' })
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
    /** El guion del chat con la IA (guiones.js). */
    chat: {
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
     * Medida de la maqueta (contrato de ajuste-a-medida.js): angosta y más alta en un
     * teléfono, sin barra lateral, para que la letra no quede minúscula.
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
      /* El "Pensando…" es transitorio, como en ChatGPT: se va con lo siguiente. */
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
          return 1800

        case 'tipear':
          if (instantaneo) {
            return 0
          }
          this.entrada = 'tipeando'
          this.texto_entrada = paso.texto
          this.ms_por_palabra = paso.ms_por_palabra
          return this.palabras(paso.texto).length * paso.ms_por_palabra + 500

        case 'enviar':
          this.entrada = 'reposo'
          this.texto_entrada = ''
          this.agregar({ tipo: 'prompt', texto: paso.texto })
          return 500

        case 'pensando':
          if (instantaneo) {
            return 0
          }
          this.agregar({ tipo: 'pensando', texto: paso.texto })
          return paso.ms || 1000

        case 'herramienta':
          this.agregar(Object.assign({ listo: false }, paso.linea, { tipo: 'herramienta' }))
          return 850

        case 'resultado':
          this.ultima('herramienta').listo = true
          return 550

        case 'confirmar':
          this.agregar(Object.assign({ confirmado: false }, paso.linea, { tipo: 'confirmar' }))
          return 2900

        case 'confirmado':
          this.ultima('confirmar').confirmado = true
          return 900

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

/* --- La ventana de ChatGPT ------------------------------------------------------------- */

.cc-gpt {
  position: absolute;
  top: 10px;
  left: 12px;
  right: 12px;
  bottom: 40px;
  display: flex;
  flex-direction: column;
  border-radius: 9px;
  overflow: clip;
  background: #fff;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.12),
    0 18px 40px -12px rgba(0, 0, 0, 0.55);
  font-family: 'Segoe UI', -apple-system, 'Helvetica Neue', Roboto, sans-serif;
  font-size: 11px;
  line-height: 1.45;
  color: #0d0d0d;
  -webkit-font-smoothing: antialiased;
}

.cc-gpt__ventana {
  flex: none;
  display: flex;
  align-items: center;
  gap: 7px;
  height: 26px;
  padding: 0 0 0 10px;
  background: #f9f9f9;
  border-bottom: 1px solid #ececec;
  font-size: 10.5px;
  color: #3d3d3d;
}

.cc-gpt__icono-app,
.cc-ico__app {
  width: 15px;
  height: 15px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: #0d0d0d;
  color: #fff;
  font-size: 9px;
}

.cc-gpt__controles {
  display: inline-flex;
  gap: 16px;
  margin-left: auto;
  padding: 0 12px;
  font-size: 9.5px;
  color: #555;
}

.cc-gpt__cuerpo {
  flex: 1;
  min-height: 0;
  display: flex;
}

.cc-gpt__lateral {
  flex: none;
  width: 132px;
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 8px 6px;
  background: #f9f9f9;
  border-right: 1px solid #ececec;
  font-size: 10.5px;
}

.cc-gpt__lat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  border-radius: 6px;
  color: #2b2b2b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cc-gpt__lat-item .bi {
  font-size: 11px;
}

.cc-gpt__lat-item--app img {
  width: 13px;
  height: 13px;
}

.cc-gpt__lat-item--app {
  font-weight: 600;
}

.cc-gpt__conectado {
  width: 6px;
  height: 6px;
  margin-left: auto;
  border-radius: 50%;
  background: #10a37f;
  box-shadow: 0 0 0 2px rgba(16, 163, 127, 0.18);
}

.cc-gpt__lat-item--activo {
  background: #ececec;
}

.cc-gpt__lat-rotulo {
  margin: 8px 6px 2px;
  font-size: 9.5px;
  color: #8f8f8f;
}

.cc-gpt__principal {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.cc-gpt__barra {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 30px;
  padding: 0 12px;
}

.cc-gpt__modelo {
  font-size: 12.5px;
  font-weight: 600;
}

.cc-gpt__modelo .bi {
  font-size: 9px;
  color: #8f8f8f;
}

.cc-gpt__compartir {
  font-size: 10px;
  color: #3d3d3d;
}

/* La columna de la conversación: centrada y angosta, como en ChatGPT. */
.cc-gpt__conversacion {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;
  max-width: 380px;
  margin: 0 auto;
  padding: 0 12px;
  overflow: clip;
}

.cc-gpt__linea {
  flex: none;
  display: flex;
  animation: cc-aparecer 0.28s ease-out both;
}

.cc-gpt__linea--prompt {
  justify-content: flex-end;
}

.cc-gpt__usuario {
  max-width: 82%;
  padding: 7px 11px;
  border-radius: 16px;
  background: #f1f1f1;
  color: #0d0d0d;
}

.cc-gpt__pensando {
  font-size: 11px;
}

/* El brillo que barre un texto gris: lo que en ChatGPT dice "está trabajando". */
.cc-brillo {
  background: linear-gradient(90deg, #8f8f8f 0%, #8f8f8f 40%, #e2e2e2 50%, #8f8f8f 60%, #8f8f8f 100%);
  background-size: 250% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: cc-brillo 1.4s linear infinite;
}

@keyframes cc-brillo {
  from {
    background-position: 100% 0;
  }
  to {
    background-position: -50% 0;
  }
}

.cc-gpt__herramienta {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  font-size: 10.5px;
  color: #5d5d5d;
}

.cc-gpt__herramienta-icono {
  flex: none;
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid #e5e5e5;
  background: #fff;
}

.cc-gpt__herramienta-icono img {
  width: 11px;
  height: 11px;
}

.cc-gpt__herramienta-icono--web {
  color: #5d5d5d;
  font-size: 10px;
}

.cc-gpt__herramienta-texto {
  min-width: 0;
  padding-top: 1px;
}

.cc-gpt__tilde {
  margin-left: 3px;
  color: #10a37f;
}

.cc-gpt__herramienta-resultado {
  display: block;
  color: #0d0d0d;
  font-weight: 600;
}

.cc-gpt__respuesta {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 100%;
}

.cc-bloque {
  animation: cc-aparecer 0.3s ease-out both;
}

.cc-bloque--titulo {
  margin-top: 4px;
  font-size: 11.5px;
  font-weight: 700;
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
  min-width: 9px;
  color: #5d5d5d;
}

.cc-bloque :deep(strong) {
  font-weight: 700;
}

/* La tarjeta en la que el dueño confirma lo que la IA va a cambiar en su sistema. */
.cc-gpt__confirmar {
  width: 100%;
  padding: 9px 11px;
  border: 1px solid #e3e3e3;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 6px 18px -10px rgba(0, 0, 0, 0.25);
}

.cc-gpt__confirmar-titulo {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
}

.cc-gpt__confirmar-titulo img {
  width: 14px;
  height: 14px;
}

.cc-gpt__confirmar ul {
  margin: 6px 0 8px;
  padding-left: 16px;
  color: #3d3d3d;
  font-size: 10.5px;
}

.cc-gpt__confirmar-botones {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.cc-gpt__boton {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 999px;
  background: #0d0d0d;
  color: #fff;
  font-size: 10.5px;
  font-weight: 600;
  transition:
    background-color 0.25s ease,
    transform 0.2s ease;
}

.cc-gpt__boton--secundario {
  background: #fff;
  color: #0d0d0d;
  border: 1px solid #d9d9d9;
}

/* El clic: el botón se hunde y queda verde. */
.cc-gpt__boton--presionado {
  background: #10a37f;
  animation: cc-clic 0.35s ease-out;
}

@keyframes cc-clic {
  40% {
    transform: scale(0.9);
  }
}

/* --- El cuadro de texto ---------------------------------------------------------------- */

.cc-gpt__composer {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  width: calc(100% - 24px);
  max-width: 400px;
  min-height: 38px;
  margin: 8px auto 10px;
  padding: 5px 6px 5px 11px;
  border: 1px solid #e3e3e3;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 4px 14px -6px rgba(0, 0, 0, 0.15);
}

.cc-gpt__mas {
  font-size: 13px;
  color: #3d3d3d;
}

.cc-gpt__placeholder {
  flex: 1;
  color: #8f8f8f;
}

.cc-gpt__mic {
  font-size: 13px;
  color: #3d3d3d;
}

.cc-gpt__redondo {
  flex: none;
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #0d0d0d;
  color: #fff;
  font-size: 12px;
}

.cc-gpt__redondo--claro {
  background: #f1f1f1;
  color: #3d3d3d;
  font-size: 10px;
}

.cc-gpt__tipeo {
  flex: 1;
  min-width: 0;
  max-height: 46px;
  overflow: clip;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-end;
  color: #0d0d0d;
}

.cc-gpt__tipeo .cc-palabra {
  white-space: pre;
}

/* El dictado: la onda de la voz ocupa el cuadro, como en ChatGPT. */
.cc-gpt__onda {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 16px;
  overflow: clip;
}

.cc-gpt__onda i {
  flex: none;
  width: 2px;
  height: 100%;
  border-radius: 1px;
  background: #3d3d3d;
  animation: cc-onda 0.75s ease-in-out infinite;
}

@keyframes cc-onda {
  0%,
  100% {
    transform: scaleY(0.2);
  }
  50% {
    transform: scaleY(1);
  }
}

.cc-gpt__composer--escuchando {
  border-color: #c9c9c9;
}

.cc-palabra {
  opacity: 0;
  animation: cc-aparecer 0.14s ease-out forwards;
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

.cc-ico .cc-ico__app {
  width: 16px;
  height: 16px;
  background: #fff;
  color: #0d0d0d;
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

/* Lo que acaba de crear la IA: entra con un destello azul que se asienta en un tinte. */
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

.cc-aviso__icono {
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: #fff;
  color: #0d0d0d;
  font-size: 11px;
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

/* Angosta (teléfono): ChatGPT sin barra lateral; en el sistema el menú se queda en íconos y
   los paneles van uno abajo del otro. */
.cc-mcp__maqueta--angosta .cc-gpt__lateral {
  display: none;
}

.cc-mcp__maqueta--angosta .cc-gpt {
  left: 10px;
  right: 10px;
}

.cc-mcp__maqueta--angosta .cc-gpt__conversacion {
  max-width: none;
}

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

@media (prefers-reduced-motion: reduce) {
  .cc-gpt__linea,
  .cc-bloque,
  .cc-palabra,
  .cc-fila--nueva,
  .cc-brillo {
    animation: none;
    opacity: 1;
  }

  .cc-brillo {
    -webkit-text-fill-color: #8f8f8f;
  }
}
</style>
