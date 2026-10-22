<template>
  <!-- El modal de la agenda de la demo (misión `demo-autogestionada-landing`, 22/10/2026).

       Se teletransporta al <body>: la página scrollea dentro de <main class="sitio-scroller">
       con el avance guiado escuchando la rueda y el dedo ahí adentro, y un diálogo metido en
       ese árbol le pasaría sus gestos al recorrido de atrás. Afuera no los ve nadie. Home.vue
       además deja el scroller `inert` mientras está abierto (sin tocarle el overflow).

       Pensado primero para el teléfono: debajo de 768 px es una hoja de pantalla completa con
       el botón de confirmar pegado abajo; en escritorio, un diálogo centrado. -->
  <teleport to="body">
    <transition name="agenda-demo" @after-enter="on_entro">
      <div
        v-if="abierto"
        class="agenda-demo"
        :class="'agenda-demo--' + tema"
        :style="estilo_teclado"
        @keydown="on_keydown"
      >
        <div class="agenda-demo__fondo" aria-hidden="true" @click="cerrar"></div>

        <div
          ref="panel"
          class="agenda-demo__panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="agenda-demo-titulo"
          aria-describedby="agenda-demo-bajada"
          tabindex="-1"
        >
          <header class="agenda-demo__cabecera">
            <div class="agenda-demo__titulos">
              <h2 id="agenda-demo-titulo" class="agenda-demo__titulo">Elegí día y hora de tu demo</h2>
              <p id="agenda-demo-bajada" class="agenda-demo__bajada">
                Te la preparamos con tu rubro y la recorrés vos, a tu ritmo, en menos de una hora.
              </p>
            </div>
            <button
              type="button"
              class="agenda-demo__cerrar"
              aria-label="Cerrar"
              :disabled="enviando || redirigiendo"
              @click="cerrar"
            >
              <i class="bi bi-x-lg" aria-hidden="true"></i>
            </button>
          </header>

          <div ref="cuerpo" class="agenda-demo__cuerpo">
            <!-- ¡Listo! Un instante y a su página. -->
            <div v-if="resultado && resultado.tipo === 'reservada'" class="agenda-demo__estado" role="status">
              <span class="agenda-demo__estado-icono agenda-demo__estado-icono--ok" aria-hidden="true">
                <i class="bi bi-check-lg"></i>
              </span>
              <p ref="foco_estado" class="agenda-demo__estado-titulo" tabindex="-1">
                ¡Listo! Tu demo quedó reservada para el {{ resultado.texto_turno }}.
              </p>
              <p class="agenda-demo__estado-texto">
                <!-- WhatsApp solo si el admin dice que la confirmación sale (`whatsapp_confirmacion`):
                     depende de que Meta tenga aprobada la plantilla, y prometerlo sin eso deja al
                     lead esperando un mensaje que no llega. -->
                Te mandamos el acceso<template v-if="resultado.correo"> a {{ resultado.correo }}</template><template
                  v-if="resultado.whatsapp_confirmacion"> y por WhatsApp</template>.
                <template v-if="resultado.experiencia_url">Ahora te llevamos a tu página para prepararla.</template>
              </p>
              <a
                v-if="resultado.experiencia_url"
                class="demo-boton-marca agenda-demo__estado-boton"
                :href="resultado.experiencia_url"
              >
                <span>Ir a mi página</span>
                <i class="bi bi-arrow-right" aria-hidden="true"></i>
              </a>
            </div>

            <!-- 409: ya tiene demo, ya es cliente, ya la hizo. El mensaje es del admin. -->
            <div v-else-if="resultado && resultado.tipo === 'bloqueado'" class="agenda-demo__estado" role="alert">
              <span class="agenda-demo__estado-icono" aria-hidden="true">
                <i class="bi bi-info-lg"></i>
              </span>
              <p ref="foco_estado" class="agenda-demo__estado-titulo" tabindex="-1">{{ resultado.mensaje }}</p>
              <!-- Ya reservó: el acceso a su página le llegó por correo cuando reservó. No se dice
                   a qué casilla ni para cuándo (el formulario no autentica a nadie, D5). -->
              <p v-if="resultado.codigo === 'ya_tiene_demo'" class="agenda-demo__estado-texto">
                Revisá tu correo: ahí está el acceso a tu página.
              </p>
              <a
                class="demo-boton-marca agenda-demo__estado-boton"
                :href="cta_url"
                target="_blank"
                rel="noopener noreferrer"
                @click="on_whatsapp"
              >
                <i class="bi bi-whatsapp" aria-hidden="true"></i>
                <span>Escribinos por WhatsApp</span>
              </a>
            </div>

            <!-- Cargando los turnos. -->
            <div v-else-if="fase_turnos === 'cargando'" class="agenda-demo__cargando" role="status">
              <p class="agenda-demo__etiqueta">Buscando turnos libres…</p>
              <div class="agenda-demo__esqueleto" aria-hidden="true">
                <span v-for="n in 5" :key="n" class="agenda-demo__esqueleto-chip"></span>
              </div>
            </div>

            <!-- No se pudieron cargar (red, admin viejo con 404, 429, 503). -->
            <div v-else-if="fase_turnos === 'error'" class="agenda-demo__estado" role="alert">
              <span class="agenda-demo__estado-icono" aria-hidden="true">
                <i class="bi bi-wifi-off"></i>
              </span>
              <p ref="foco_estado" class="agenda-demo__estado-titulo" tabindex="-1">No pudimos cargar los turnos.</p>
              <p class="agenda-demo__estado-texto">
                Probá de nuevo, o escribinos por WhatsApp y te la agendamos por ahí.
              </p>
              <div class="agenda-demo__estado-acciones">
                <button type="button" class="demo-boton-marca agenda-demo__estado-boton" @click="cargar_turnos">
                  <i class="bi bi-arrow-clockwise" aria-hidden="true"></i>
                  <span>Probar de nuevo</span>
                </button>
                <a
                  class="agenda-demo__secundario"
                  :href="cta_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  @click="on_whatsapp"
                >
                  <i class="bi bi-whatsapp" aria-hidden="true"></i>
                  <span>Escribinos por WhatsApp</span>
                </a>
              </div>
            </div>

            <!-- El admin respondió bien pero no hay ningún turno en los próximos días. -->
            <div v-else-if="!dias.length" class="agenda-demo__estado" role="status">
              <span class="agenda-demo__estado-icono" aria-hidden="true">
                <i class="bi bi-calendar-x"></i>
              </span>
              <p ref="foco_estado" class="agenda-demo__estado-titulo" tabindex="-1">
                No nos quedan turnos libres en los próximos días.
              </p>
              <p class="agenda-demo__estado-texto">Escribinos por WhatsApp y te buscamos un horario.</p>
              <a
                class="demo-boton-marca agenda-demo__estado-boton"
                :href="cta_url"
                target="_blank"
                rel="noopener noreferrer"
                @click="on_whatsapp"
              >
                <i class="bi bi-whatsapp" aria-hidden="true"></i>
                <span>Escribinos por WhatsApp</span>
              </a>
            </div>

            <!-- El formulario: turno con chips y los datos. -->
            <form
              v-else
              id="agenda-demo-form"
              class="agenda-demo__form"
              novalidate
              @submit.prevent="confirmar"
            >
              <fieldset class="agenda-demo__grupo">
                <legend class="agenda-demo__etiqueta">¿Qué día?</legend>
                <div class="agenda-demo__chips agenda-demo__chips--dias">
                  <label v-for="dia in dias" :key="dia.fecha" class="agenda-demo__chip">
                    <input
                      v-model="fecha"
                      class="agenda-demo__radio"
                      type="radio"
                      name="agenda-demo-dia"
                      :value="dia.fecha"
                      :aria-label="dia.accesible"
                    />
                    <span class="agenda-demo__chip-cara">
                      <span class="agenda-demo__chip-titulo">{{ dia.titulo }}</span>
                      <span v-if="dia.detalle" class="agenda-demo__chip-detalle">{{ dia.detalle }}</span>
                    </span>
                  </label>
                </div>
              </fieldset>

              <fieldset
                ref="grupo_horas"
                class="agenda-demo__grupo"
                :aria-describedby="errores.turno ? 'agenda-demo-error-turno' : null"
              >
                <legend class="agenda-demo__etiqueta">¿A qué hora?</legend>
                <p
                  v-if="errores.turno"
                  id="agenda-demo-error-turno"
                  class="agenda-demo__error"
                  role="alert"
                >
                  {{ errores.turno }}
                </p>
                <!-- Por franja (Mañana / Tarde / Noche) con un subtítulo chico: con una docena de
                     horarios por día, una lista corrida no se lee en el teléfono. Todos los radios
                     comparten `name`: las flechas recorren el día entero. -->
                <div
                  v-for="franja in franjas_del_dia"
                  :key="franja.clave"
                  class="agenda-demo__franja"
                  role="group"
                  :aria-labelledby="'agenda-demo-franja-' + franja.clave"
                >
                  <p :id="'agenda-demo-franja-' + franja.clave" class="agenda-demo__franja-titulo">{{ franja.titulo }}</p>
                  <div class="agenda-demo__chips agenda-demo__chips--horas">
                    <label v-for="horario in franja.horarios" :key="horario.hora" class="agenda-demo__chip">
                      <input
                        v-model="hora"
                        class="agenda-demo__radio"
                        type="radio"
                        name="agenda-demo-hora"
                        :value="horario.hora"
                        @change="limpiar_error('turno')"
                      />
                      <span class="agenda-demo__chip-cara">
                        <span class="agenda-demo__chip-titulo">{{ horario.texto }}</span>
                      </span>
                    </label>
                  </div>
                </div>
              </fieldset>

              <fieldset class="agenda-demo__grupo agenda-demo__grupo--datos">
                <legend class="agenda-demo__etiqueta">Tus datos</legend>

                <div class="agenda-demo__campo">
                  <label for="agenda-demo-nombre" class="agenda-demo__rotulo">Nombre</label>
                  <input
                    id="agenda-demo-nombre"
                    ref="campo_nombre"
                    v-model="datos.nombre"
                    class="agenda-demo__input"
                    type="text"
                    name="name"
                    autocomplete="name"
                    autocapitalize="words"
                    maxlength="80"
                    :aria-invalid="errores.nombre ? 'true' : 'false'"
                    :aria-describedby="errores.nombre ? 'agenda-demo-error-nombre' : null"
                    @blur="revisar('nombre')"
                    @input="revisar_si_hay_error('nombre')"
                  />
                  <p v-if="errores.nombre" id="agenda-demo-error-nombre" class="agenda-demo__error">{{ errores.nombre }}</p>
                </div>

                <div class="agenda-demo__campo">
                  <label for="agenda-demo-whatsapp" class="agenda-demo__rotulo">WhatsApp</label>
                  <input
                    id="agenda-demo-whatsapp"
                    ref="campo_whatsapp"
                    v-model="datos.whatsapp"
                    class="agenda-demo__input"
                    type="tel"
                    name="tel"
                    inputmode="tel"
                    autocomplete="tel"
                    maxlength="30"
                    placeholder="3444 622139"
                    :aria-invalid="errores.whatsapp ? 'true' : 'false'"
                    :aria-describedby="'agenda-demo-ayuda-whatsapp' + (errores.whatsapp ? ' agenda-demo-error-whatsapp' : '')"
                    @blur="revisar('whatsapp')"
                    @input="revisar_si_hay_error('whatsapp')"
                  />
                  <p id="agenda-demo-ayuda-whatsapp" class="agenda-demo__ayuda">Con característica, sin 0 ni 15.</p>
                  <p v-if="errores.whatsapp" id="agenda-demo-error-whatsapp" class="agenda-demo__error">{{ errores.whatsapp }}</p>
                </div>

                <div class="agenda-demo__campo">
                  <label for="agenda-demo-email" class="agenda-demo__rotulo">Correo</label>
                  <input
                    id="agenda-demo-email"
                    ref="campo_email"
                    v-model="datos.email"
                    class="agenda-demo__input"
                    type="email"
                    name="email"
                    inputmode="email"
                    autocomplete="email"
                    autocapitalize="off"
                    spellcheck="false"
                    maxlength="120"
                    :aria-invalid="errores.email ? 'true' : 'false'"
                    :aria-describedby="errores.email ? 'agenda-demo-error-email' : null"
                    @blur="revisar('email')"
                    @input="revisar_si_hay_error('email')"
                  />
                  <p v-if="errores.email" id="agenda-demo-error-email" class="agenda-demo__error">{{ errores.email }}</p>
                </div>

                <div class="agenda-demo__campo">
                  <label for="agenda-demo-rubro" class="agenda-demo__rotulo">Rubro</label>
                  <select
                    id="agenda-demo-rubro"
                    ref="campo_rubro"
                    v-model="datos.rubro"
                    class="agenda-demo__input agenda-demo__select"
                    name="rubro"
                    :aria-invalid="errores.rubro ? 'true' : 'false'"
                    :aria-describedby="errores.rubro ? 'agenda-demo-error-rubro' : null"
                    @change="revisar('rubro')"
                  >
                    <option value="" disabled>Elegí tu rubro</option>
                    <option v-for="rubro in rubros" :key="rubro.slug" :value="rubro.slug">{{ rubro.nombre }}</option>
                  </select>
                  <p v-if="errores.rubro" id="agenda-demo-error-rubro" class="agenda-demo__error">{{ errores.rubro }}</p>
                </div>

                <!-- Honeypot: un humano no lo ve ni lo oye, y el tab no pasa por acá. Si viene
                     con algo, el admin responde 422 (contrato §3, D13).
                     🔴 Sin nada que un autocompletado o un gestor de contraseñas reconozca: ni
                     «sitio», «web», «url», «nombre», «correo» ni parecidos en el name, el id o el
                     rótulo. Si uno lo llenara, la reserva de una persona real caería en un 422
                     genérico sin nada que corregir. En el body viaja como `sitio_web` (lo arma
                     `armar_body` desde `this.sitio_web`), no por el name de este input. -->
                <div class="agenda-demo__trampa" aria-hidden="true">
                  <label for="agenda-demo-c7">No completar</label>
                  <input
                    id="agenda-demo-c7"
                    v-model="sitio_web"
                    type="text"
                    name="cc_c7"
                    tabindex="-1"
                    autocomplete="off"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-bwignore="true"
                    data-form-type="other"
                  />
                </div>
              </fieldset>

              <p class="agenda-demo__que-pasa">
                <i class="bi bi-envelope-check" aria-hidden="true"></i>
                <span>
                  Al confirmar te llega el acceso por correo y te llevamos a tu página para que la
                  prepares.
                </span>
              </p>
            </form>
          </div>

          <!-- El pie fijo del formulario: lo elegido, el aviso general, confirmar y la salida
               por WhatsApp. Afuera del cuerpo que scrollea para que el botón esté siempre a
               mano en el teléfono. -->
          <footer v-if="mostrar_formulario" class="agenda-demo__pie">
            <p v-if="resumen_turno" class="agenda-demo__resumen">
              <i class="bi bi-calendar-check" aria-hidden="true"></i>
              <span>{{ resumen_turno }}</span>
            </p>
            <p v-if="aviso" class="agenda-demo__aviso" role="alert">{{ aviso }}</p>
            <button
              ref="confirmar"
              type="submit"
              form="agenda-demo-form"
              class="demo-boton-marca agenda-demo__confirmar"
              :disabled="enviando"
              :aria-busy="enviando ? 'true' : 'false'"
            >
              <span v-if="enviando" class="agenda-demo__girando" aria-hidden="true"></span>
              <span>{{ enviando ? 'Reservando tu demo…' : 'Confirmar mi demo' }}</span>
            </button>
            <a
              class="agenda-demo__secundario"
              :href="cta_url"
              target="_blank"
              rel="noopener noreferrer"
              @click="on_whatsapp"
            >
              <i class="bi bi-whatsapp" aria-hidden="true"></i>
              <span>¿Tenés dudas? Escribinos por WhatsApp</span>
            </a>
          </footer>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
import {
  RUBROS,
  PISO_ABIERTO_MS,
  agrupar_horarios,
  TIEMPO_RESERVA_MS,
  TIEMPO_TURNOS_MS,
  armar_body,
  fecha_en_zona,
  interpretar_reserva,
  interpretar_turnos,
  leer_cookie_meta,
  pedir_json,
  texto_turno,
  url_de_origen,
  validar_datos,
} from '@/analitica/agenda-demo'
import { obtener_atribucion } from '@/analitica/atribucion-whatsapp'
import { AGENDA_RESERVAS_URL, AGENDA_TURNOS_URL } from '@/config'

/**
 * Cuánto se ve el «¡Listo!» antes de ir a la página de experiencia. Más que los ~600 ms que
 * necesita el píxel para despachar Lead/Schedule, y lo justo para leer la confirmación.
 */
const ESPERA_REDIRECCION_MS = 1200

/** Lo que se puede enfocar con Tab adentro del diálogo (para atrapar el foco). */
const ENFOCABLES = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([tabindex="-1"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/** Avisos generales (debajo del botón). Los de cada campo vienen de agenda-demo.js. */
const AVISOS = {
  red: 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo, o escribinos por WhatsApp.',
  tiempo: 'La confirmación está tardando más de lo normal. Puede que se haya reservado igual: ' +
    'fijate en tu correo en unos minutos, o escribinos por WhatsApp.',
  invalida: 'No pudimos confirmar la reserva. Revisá los datos y probá de nuevo, o escribinos por WhatsApp.',
  limite: 'Hiciste varios intentos seguidos. Esperá unos minutos y probá de nuevo, o escribinos por WhatsApp.',
  reintentar: 'Ahora mismo tenemos mucho movimiento. Probá de nuevo en unos segundos.',
  error: 'Algo falló de nuestro lado. Probá de nuevo en un rato o escribinos por WhatsApp.',
}

/** Orden en que se busca el primer campo con error para llevarle el foco. */
const ORDEN_CAMPOS = ['turno', 'nombre', 'whatsapp', 'email', 'rubro']

export default {
  name: 'AgendaDemoModal',

  props: {
    abierto: {
      type: Boolean,
      default: false,
    },
    /** Sección desde la que se abrió (para el evento de WhatsApp de adentro). */
    seccion: {
      type: String,
      default: '',
    },
    /** URL de WhatsApp con la referencia de la visita: la salida de todos los estados. */
    cta_url: {
      type: String,
      required: true,
    },
    emitir_evento: {
      type: Function,
      default: function () {},
    },
    /** 'claro' (la web pública) u 'oscuro'. */
    tema: {
      type: String,
      default: 'claro',
    },
  },

  emits: ['cerrar'],

  data() {
    return {
      rubros: RUBROS,
      /** 'cargando' | 'error' | 'listo' */
      fase_turnos: 'cargando',
      dias: [],
      hoy: '',
      fecha: '',
      hora: '',
      datos: { nombre: '', whatsapp: '', email: '', rubro: '' },
      sitio_web: '',
      errores: {},
      aviso: '',
      enviando: false,
      /** null | {tipo: 'reservada', ...} | {tipo: 'bloqueado', mensaje} */
      resultado: null,
      /** Date.now() del momento en que se abrió: de acá sale `abierto_hace_ms`. */
      abierto_en: 0,
      /** Para descartar una respuesta de turnos vieja si se pidieron otros. */
      pedido_turnos: 0,
      temporizador_redireccion: null,
      /** {top, height} del viewport visual mientras el teclado del teléfono está abierto. */
      viewport_teclado: null,
    }
  },

  computed: {
    /** @returns {object|null} */
    dia_elegido() {
      const fecha = this.fecha
      return this.dias.find(function (dia) { return dia.fecha === fecha }) || null
    },

    /** @returns {object|null} */
    horario_elegido() {
      const hora = this.hora
      return this.dia_elegido
        ? this.dia_elegido.horarios.find(function (h) { return h.hora === hora }) || null
        : null
    },

    /**
     * Con el teclado del teléfono abierto, la hoja se ajusta al viewport VISUAL (lo que queda
     * arriba del teclado) para que el pie con «Confirmar mi demo» siga a la vista. En iOS
     * Safari y Chrome Android el teclado achica solo ese viewport; una hoja `fixed; inset: 0`
     * deja el pie debajo del teclado.
     *
     * @returns {object|null}
     */
    estilo_teclado() {
      if (!this.viewport_teclado) {
        return null
      }
      return {
        top: this.viewport_teclado.top + 'px',
        bottom: 'auto',
        height: this.viewport_teclado.height + 'px',
      }
    },

    /** Los horarios del día elegido, por franja. */
    franjas_del_dia() {
      return this.dia_elegido ? agrupar_horarios(this.dia_elegido.horarios) : []
    },

    /** «Viernes 23/10 de 15:00 a 17:00», al pie, para no perder de vista lo elegido. */
    resumen_turno() {
      if (!this.horario_elegido) {
        return ''
      }
      const texto = texto_turno(this.fecha, this.hora, this.horario_elegido.hasta)
      return texto.charAt(0).toUpperCase() + texto.slice(1)
    },

    /**
     * true durante el «¡Listo!» que termina en la página de experiencia. En ese tramo el
     * modal no se cierra (ni con Esc, ni con el velo, ni con la cruz): cerrarlo cancelaba la
     * redirección y el lead se quedaba sin su página (si reabría y confirmaba de nuevo, 409
     * `ya_tiene_demo`).
     *
     * @returns {boolean}
     */
    redirigiendo() {
      return !!(this.resultado && this.resultado.tipo === 'reservada' && this.resultado.experiencia_url)
    },

    /** @returns {boolean} */
    mostrar_formulario() {
      return !this.resultado && this.fase_turnos === 'listo' && this.dias.length > 0
    },
  },

  watch: {
    abierto: {
      immediate: true,
      handler(valor) {
        if (valor) {
          this.al_abrir()
          if (typeof window !== 'undefined') {
            window.addEventListener('keydown', this.on_keydown_afuera, true)
            this.escuchar_teclado(true)
          }
        } else {
          this.cancelar_redireccion()
          if (typeof window !== 'undefined') {
            window.removeEventListener('keydown', this.on_keydown_afuera, true)
          }
          this.escuchar_teclado(false)
        }
      },
    },

    /** Al cambiar de día, el horario elegido se mantiene solo si ese día también lo tiene. */
    fecha() {
      if (!this.horario_elegido) {
        this.hora = ''
      }
    },
  },

  beforeUnmount() {
    this.cancelar_redireccion()
    window.removeEventListener('keydown', this.on_keydown_afuera, true)
    this.escuchar_teclado(false)
  },

  methods: {
    /** @returns {void} */
    al_abrir() {
      this.abierto_en = Date.now()
      this.resultado = null
      this.aviso = ''
      this.enviando = false
      this.cargar_turnos()
    },

    /** Recién terminada la transición: el foco al diálogo (no a un campo: en el teléfono
     *  eso abriría el teclado y taparía los turnos). */
    on_entro() {
      if (this.$refs.panel) {
        this.$refs.panel.focus({ preventScroll: true })
      }
    },

    /**
     * @param {boolean} prender
     * @returns {void}
     */
    escuchar_teclado(prender) {
      const vv = typeof window !== 'undefined' ? window.visualViewport : null
      if (!vv) {
        return
      }
      if (prender) {
        vv.addEventListener('resize', this.on_viewport)
        vv.addEventListener('scroll', this.on_viewport)
        this.on_viewport()
      } else {
        vv.removeEventListener('resize', this.on_viewport)
        vv.removeEventListener('scroll', this.on_viewport)
        this.viewport_teclado = null
      }
    },

    /**
     * Decide si hay teclado: solo en la hoja de teléfono (< 768 px), sin zoom de pellizco
     * (con zoom el viewport visual también se achica y no hay que perseguirlo), y con el
     * viewport visual al menos 120 px más bajo que la ventana.
     *
     * @returns {void}
     */
    on_viewport() {
      const vv = window.visualViewport
      const hay_teclado = !!vv && window.innerWidth < 768 && Math.abs(vv.scale - 1) < 0.01 &&
        window.innerHeight - vv.height > 120
      this.viewport_teclado = hay_teclado
        ? { top: Math.round(vv.offsetTop), height: Math.round(vv.height) }
        : null
    },

    /** @returns {void} */
    cerrar() {
      if (this.enviando || this.redirigiendo) {
        return
      }
      this.$emit('cerrar')
    },

    /** @returns {void} */
    cancelar_redireccion() {
      if (this.temporizador_redireccion) {
        clearTimeout(this.temporizador_redireccion)
        this.temporizador_redireccion = null
      }
    },

    /**
     * Pide los turnos al admin. Se piden en cada apertura: los turnos cambian.
     *
     * @returns {Promise<void>}
     */
    async cargar_turnos() {
      const pedido = ++this.pedido_turnos
      this.fase_turnos = 'cargando'
      const respuesta = await pedir_json({ url: AGENDA_TURNOS_URL, timeout: TIEMPO_TURNOS_MS })
      if (pedido !== this.pedido_turnos || !this.abierto) {
        return
      }
      let turnos
      try {
        this.hoy = fecha_en_zona(Date.now())
        turnos = interpretar_turnos(respuesta.status, respuesta.cuerpo, this.hoy)
      } catch (_) {
        /* Nada de lo de acá debería tirar; si tira, error con salida a WhatsApp y no un
           «Buscando turnos…» eterno. */
        turnos = { tipo: 'error' }
      }
      if (turnos.tipo !== 'turnos') {
        this.fase_turnos = 'error'
        this.enfocar_estado()
        return
      }
      this.aplicar_dias(turnos.dias)
      this.fase_turnos = 'listo'
      if (!this.dias.length) {
        this.enfocar_estado()
      }
    },

    /**
     * Reemplaza los días (de la carga o del 409 `turno_tomado`) conservando lo elegido si
     * sigue existiendo; si no, el primer día queda marcado para mostrar ya sus horarios.
     *
     * @param {Array} dias
     * @returns {void}
     */
    aplicar_dias(dias) {
      this.dias = dias
      if (!this.dia_elegido) {
        this.fecha = dias.length ? dias[0].fecha : ''
      }
      if (!this.horario_elegido) {
        this.hora = ''
      }
    },

    /**
     * Valida un campo al salir de él (no mientras se escribe por primera vez).
     *
     * @param {string} campo
     * @returns {void}
     */
    revisar(campo) {
      const errores = validar_datos(Object.assign({ fecha: this.fecha, hora: this.hora }, this.datos))
      const nuevos = Object.assign({}, this.errores)
      if (errores[campo] && String(this.datos[campo] || '').trim() !== '') {
        nuevos[campo] = errores[campo]
      } else if (!errores[campo]) {
        delete nuevos[campo]
      }
      if (campo === 'rubro' && errores.rubro) {
        nuevos.rubro = errores.rubro
      }
      this.errores = nuevos
    },

    /**
     * Mientras se corrige un campo marcado, el error se va apenas queda bien.
     *
     * @param {string} campo
     * @returns {void}
     */
    revisar_si_hay_error(campo) {
      if (!this.errores[campo]) {
        return
      }
      const errores = validar_datos(Object.assign({ fecha: this.fecha, hora: this.hora }, this.datos))
      if (!errores[campo]) {
        this.limpiar_error(campo)
      }
    },

    /** @param {string} campo */
    limpiar_error(campo) {
      if (this.errores[campo]) {
        const nuevos = Object.assign({}, this.errores)
        delete nuevos[campo]
        this.errores = nuevos
      }
    },

    /** Lleva el foco (y la vista) al primer campo con error. */
    enfocar_primer_error() {
      const campo = ORDEN_CAMPOS.find((c) => this.errores[c])
      if (!campo) {
        return
      }
      this.$nextTick(() => {
        let destino
        if (campo === 'turno') {
          /* Por DOM y no por $refs: el orden de los refs de un v-for no es el del DOM
             después de re-renderizar, y el foco caía en el último horario. */
          const panel = this.$refs.panel
          const selector = this.fecha ? 'input[name="agenda-demo-hora"]' : 'input[name="agenda-demo-dia"]'
          destino = (panel && panel.querySelector(selector)) || this.$refs.grupo_horas
        } else {
          destino = this.$refs['campo_' + campo]
        }
        if (destino && destino.focus) {
          destino.focus({ preventScroll: true })
          if (destino.scrollIntoView) {
            destino.scrollIntoView({ block: 'center', behavior: this.movimiento_reducido() ? 'auto' : 'smooth' })
          }
        }
      })
    },

    /** El foco al título del estado que reemplazó al formulario (lo lee el lector de pantalla). */
    enfocar_estado() {
      this.$nextTick(() => {
        const destino = this.$refs.foco_estado
        if (destino && destino.focus) {
          destino.focus({ preventScroll: true })
        }
      })
    },

    /**
     * Mientras envía, «Confirmar» queda deshabilitado y el navegador le saca el foco (se va
     * al <body>, afuera del diálogo). Al volver la respuesta se lo devuelve; si después hay
     * un error de campo o un estado nuevo, esos lo mueven de nuevo a su lugar.
     *
     * @returns {void}
     */
    recuperar_foco() {
      this.$nextTick(() => {
        const panel = this.$refs.panel
        if (!panel || panel.contains(document.activeElement)) {
          return
        }
        const destino = this.$refs.confirmar || panel
        destino.focus({ preventScroll: true })
      })
    },

    /**
     * Red de seguridad para las teclas con el foco AFUERA del diálogo (en el <body>, p.ej.
     * después de un clic en una zona sin foco): Esc cierra igual, Tab vuelve a entrar, y
     * el resto no llega al avance guiado (escucha en el documento y movería la página de
     * atrás). En captura, para correr antes que él. Adentro del diálogo no hace nada: ahí
     * manda `on_keydown`.
     *
     * @param {KeyboardEvent} evento
     * @returns {void}
     */
    on_keydown_afuera(evento) {
      const raiz = this.$refs.panel && this.$refs.panel.parentNode
      if (!raiz || raiz.contains(evento.target)) {
        return
      }
      evento.stopPropagation()
      if (evento.key === 'Escape' || evento.key === 'Esc') {
        evento.preventDefault()
        this.cerrar()
        return
      }
      if (evento.key === 'Tab') {
        evento.preventDefault()
        this.$refs.panel.focus({ preventScroll: true })
        return
      }
      if ([' ', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].indexOf(evento.key) !== -1) {
        evento.preventDefault()
      }
    },

    /** @returns {boolean} */
    movimiento_reducido() {
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    },

    /**
     * «Confirmar mi demo»: valida, espera el piso anti-robot si hiciera falta, manda y
     * resuelve cada respuesta del contrato.
     *
     * @returns {Promise<void>}
     */
    async confirmar() {
      if (this.enviando) {
        return
      }
      this.aviso = ''
      this.errores = validar_datos(Object.assign({ fecha: this.fecha, hora: this.hora }, this.datos))
      if (Object.keys(this.errores).length) {
        this.enfocar_primer_error()
        return
      }

      this.enviando = true
      const falta = PISO_ABIERTO_MS - (Date.now() - this.abierto_en)
      if (falta > 0) {
        await new Promise(function (resolve) { setTimeout(resolve, falta) })
      }

      const hasta = this.horario_elegido ? this.horario_elegido.hasta : ''
      const body = armar_body(Object.assign({}, this.datos, {
        fecha: this.fecha,
        hora: this.hora,
        atribucion: obtener_atribucion(),
        fbp: leer_cookie_meta(document.cookie, '_fbp'),
        fbc: leer_cookie_meta(document.cookie, '_fbc'),
        event_source_url: url_de_origen(window.location),
        sitio_web: this.sitio_web,
        abierto_hace_ms: Date.now() - this.abierto_en,
      }))

      const respuesta = await pedir_json({
        url: AGENDA_RESERVAS_URL,
        metodo: 'POST',
        body: body,
        timeout: TIEMPO_RESERVA_MS,
      })
      this.enviando = false
      this.recuperar_foco()

      if (respuesta.status === 0) {
        this.aviso = AVISOS[respuesta.motivo] || AVISOS.red
        return
      }

      const r = interpretar_reserva(respuesta.status, respuesta.cuerpo, {
        hoy: this.hoy,
        fecha: this.fecha,
        hora: this.hora,
        hasta: hasta,
      })
      this.resolver(r)
    },

    /**
     * @param {object} r Salida de `interpretar_reserva`.
     * @returns {void}
     */
    resolver(r) {
      if (r.tipo === 'reservada') {
        this.resultado = r
        this.emitir_evento('demo_reservada', { meta_eventos: r.meta_eventos })
        this.enfocar_estado()
        if (r.experiencia_url) {
          this.temporizador_redireccion = setTimeout(function () {
            window.location.assign(r.experiencia_url)
          }, ESPERA_REDIRECCION_MS)
        }
        return
      }

      if (r.tipo === 'campos') {
        this.errores = r.errores
        this.enfocar_primer_error()
        return
      }

      if (r.tipo === 'turno_tomado') {
        this.hora = ''
        if (r.dias) {
          this.aplicar_dias(r.dias)
          if (!this.dias.length) {
            this.enfocar_estado()
            return
          }
        } else {
          this.cargar_turnos()
        }
        this.errores = Object.assign({}, this.errores, { turno: r.mensaje })
        this.enfocar_primer_error()
        return
      }

      if (r.tipo === 'ya_tiene_demo' || r.tipo === 'ya_es_cliente' || r.tipo === 'ya_hizo_la_demo') {
        this.resultado = { tipo: 'bloqueado', codigo: r.tipo, mensaje: r.mensaje }
        this.enfocar_estado()
        return
      }

      // El 429 del tope global de reservas trae su propio `mensaje`; el del throttle por IP, no.
      if (r.tipo === 'reintentar' || r.tipo === 'limite') {
        this.aviso = r.mensaje || AVISOS[r.tipo]
        return
      }

      this.aviso = AVISOS[r.tipo] || AVISOS.error
    },

    /** La salida por WhatsApp de adentro del modal mide igual que la de cualquier CTA. */
    on_whatsapp() {
      this.emitir_evento('cta_demo_tocado', { desde: 'agenda', seccion: this.seccion || 'desconocido' })
    },

    /**
     * Esc cierra; Tab no sale del diálogo. Ninguna tecla sigue de largo hasta el documento:
     * ahí escucha el avance guiado, y una flecha o un espacio movería la página de atrás.
     *
     * @param {KeyboardEvent} evento
     * @returns {void}
     */
    on_keydown(evento) {
      evento.stopPropagation()

      if (evento.key === 'Escape' || evento.key === 'Esc') {
        evento.preventDefault()
        this.cerrar()
        return
      }

      if (evento.key !== 'Tab' || !this.$refs.panel) {
        return
      }
      const enfocables = Array.prototype.filter.call(
        this.$refs.panel.querySelectorAll(ENFOCABLES),
        function (nodo) {
          return nodo.getClientRects().length > 0 && !nodo.closest('[aria-hidden="true"]')
        },
      )
      if (!enfocables.length) {
        evento.preventDefault()
        return
      }
      const primero = enfocables[0]
      const ultimo = enfocables[enfocables.length - 1]
      const activo = document.activeElement
      if (evento.shiftKey && (activo === primero || activo === this.$refs.panel)) {
        evento.preventDefault()
        ultimo.focus()
      } else if (!evento.shiftKey && activo === ultimo) {
        evento.preventDefault()
        primero.focus()
      }
    },
  },
}
</script>

<style scoped>
/* Los tokens de la página (experiencia.scss) viven en `.demo-experiencia-page`, y este
   diálogo está afuera (en el <body>): los mismos valores, acá. */
.agenda-demo {
  --demo-color-azul: #0b84f8;
  --demo-color-violeta: #3a31fc;
  --demo-gradient-marca: linear-gradient(135deg, var(--demo-color-azul) 0%, var(--demo-color-violeta) 100%);
  --demo-font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --demo-color-fondo: #f8f9fc;
  --demo-color-texto: #1c2333;
  --demo-color-texto-suave: #566078;
  --demo-color-superficie: #ffffff;
  --demo-color-borde-superficie: rgba(28, 35, 51, 0.08);
  --agenda-borde-chip: rgba(86, 96, 120, 0.28);
  --agenda-fondo-chip: #ffffff;
  --agenda-fondo-chip-elegido: rgba(11, 132, 248, 0.1);
  --agenda-fondo-input: #ffffff;
  --agenda-error: #c62828;
  --agenda-fondo-aviso: #fff4e5;
  --agenda-texto-aviso: #7a3e00;
  --agenda-velo: rgba(12, 18, 32, 0.55);

  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  font-family: var(--demo-font-family);
  color: var(--demo-color-texto);
  -webkit-text-size-adjust: 100%;
}

.agenda-demo *,
.agenda-demo *::before,
.agenda-demo *::after {
  box-sizing: border-box;
}

/* Tema oscuro: los mismos valores que `.demo-scroll-dolor` de experiencia.scss. */
.agenda-demo--oscuro {
  --demo-color-fondo: #04060b;
  --demo-color-texto: #f4f7fd;
  --demo-color-texto-suave: #99a3ba;
  --demo-color-superficie: #111a2c;
  --demo-color-borde-superficie: rgba(126, 172, 255, 0.2);
  --agenda-borde-chip: rgba(153, 163, 186, 0.32);
  --agenda-fondo-chip: #0c1424;
  --agenda-fondo-chip-elegido: rgba(11, 132, 248, 0.22);
  --agenda-fondo-input: #0c1424;
  --agenda-error: #ff8a80;
  --agenda-fondo-aviso: rgba(250, 126, 6, 0.16);
  --agenda-texto-aviso: #ffd3a8;
  --agenda-velo: rgba(0, 0, 0, 0.7);
}

.agenda-demo__fondo {
  position: absolute;
  inset: 0;
  background: var(--agenda-velo);
}

.agenda-demo__panel {
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(100%, 580px);
  max-height: min(92vh, 860px);
  max-height: min(92dvh, 860px);
  border-radius: 20px;
  background: var(--demo-color-superficie);
  box-shadow: 0 30px 80px rgba(12, 18, 32, 0.35);
  overflow: hidden;
}

.agenda-demo__panel:focus {
  outline: none;
}

.agenda-demo__cabecera {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 22px 22px 14px 26px;
  border-bottom: 1px solid var(--demo-color-borde-superficie);
}

.agenda-demo__titulo {
  margin: 0;
  font-size: clamp(1.25rem, 2.4vw, 1.5rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.015em;
}

.agenda-demo__bajada {
  margin: 6px 0 0;
  font-size: 0.95rem;
  line-height: 1.45;
  color: var(--demo-color-texto-suave);
}

.agenda-demo__cerrar {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin: -6px -6px 0 0;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--demo-color-texto-suave);
  font-size: 1.1rem;
  cursor: pointer;
}

.agenda-demo__cerrar:hover {
  color: var(--demo-color-texto);
  background: rgba(86, 96, 120, 0.1);
}

.agenda-demo__cerrar:focus-visible {
  outline: 3px solid var(--demo-color-azul);
  outline-offset: 0;
}

.agenda-demo__cerrar:disabled {
  opacity: 0.4;
  cursor: default;
}

.agenda-demo__cuerpo {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  padding: 18px 26px 22px;
}

/* ---- Formulario ---- */

.agenda-demo__form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.agenda-demo__grupo {
  margin: 0;
  padding: 0;
  border: 0;
  min-width: 0;
}

.agenda-demo__etiqueta {
  margin: 0 0 10px;
  padding: 0;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--demo-color-texto-suave);
}

.agenda-demo__chips {
  display: grid;
  gap: 8px;
}

.agenda-demo__chips--dias {
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
}

.agenda-demo__chips--horas {
  grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
}

.agenda-demo__chip {
  position: relative;
  display: block;
  cursor: pointer;
}

/* El radio nativo sigue ahí (teclado con flechas, lector de pantalla), invisible encima
   de su cara. */
.agenda-demo__radio {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}

.agenda-demo__chip-cara {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 48px;
  padding: 8px 10px;
  border: 1.5px solid var(--agenda-borde-chip);
  border-radius: 12px;
  background: var(--agenda-fondo-chip);
  text-align: center;
  transition: border-color 140ms ease, background-color 140ms ease;
}

.agenda-demo__chip-titulo {
  font-size: 0.98rem;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
}

.agenda-demo__chip-detalle {
  font-size: 0.78rem;
  line-height: 1.2;
  color: var(--demo-color-texto-suave);
  white-space: nowrap;
}

.agenda-demo__chip:hover .agenda-demo__chip-cara {
  border-color: rgba(11, 132, 248, 0.55);
}

.agenda-demo__radio:checked + .agenda-demo__chip-cara {
  border-color: var(--demo-color-azul);
  background: var(--agenda-fondo-chip-elegido);
  box-shadow: inset 0 0 0 1px var(--demo-color-azul);
}

.agenda-demo__radio:checked + .agenda-demo__chip-cara .agenda-demo__chip-titulo {
  color: var(--demo-color-azul);
}

.agenda-demo__radio:focus-visible + .agenda-demo__chip-cara {
  outline: 3px solid var(--demo-color-azul);
  outline-offset: 2px;
}

.agenda-demo__grupo--datos {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.agenda-demo__campo {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.agenda-demo__rotulo {
  font-size: 0.95rem;
  font-weight: 600;
}

/* 16 px de letra como mínimo: con menos, el iPhone hace zoom al enfocar. */
.agenda-demo__input {
  width: 100%;
  min-height: 48px;
  padding: 10px 14px;
  border: 1.5px solid var(--agenda-borde-chip);
  border-radius: 12px;
  background: var(--agenda-fondo-input);
  color: var(--demo-color-texto);
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.3;
  transition: border-color 140ms ease;
}

.agenda-demo__input::placeholder {
  color: var(--demo-color-texto-suave);
  opacity: 0.7;
}

.agenda-demo__input:focus {
  outline: none;
  border-color: var(--demo-color-azul);
  box-shadow: 0 0 0 3px rgba(11, 132, 248, 0.22);
}

.agenda-demo__input[aria-invalid='true'] {
  border-color: var(--agenda-error);
}

.agenda-demo__select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 40px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%23566078' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M3 6l5 5 5-5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
}

.agenda-demo__ayuda {
  margin: 0;
  font-size: 0.85rem;
  color: var(--demo-color-texto-suave);
}

.agenda-demo__error {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 500;
  line-height: 1.35;
  color: var(--agenda-error);
}

.agenda-demo__grupo .agenda-demo__error + .agenda-demo__franja {
  margin-top: 8px;
}

.agenda-demo__franja + .agenda-demo__franja {
  margin-top: 14px;
}

.agenda-demo__franja-titulo {
  margin: 0 0 6px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--demo-color-texto-suave);
}

/* El honeypot: afuera de la pantalla (no `display: none`, que algunos robots saltean). */
.agenda-demo__trampa {
  position: absolute;
  left: -10000px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.agenda-demo__que-pasa {
  display: flex;
  gap: 10px;
  margin: 0;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(11, 132, 248, 0.07);
  font-size: 0.92rem;
  line-height: 1.45;
  color: var(--demo-color-texto);
}

.agenda-demo__que-pasa .bi {
  flex: none;
  color: var(--demo-color-azul);
  font-size: 1.1rem;
  line-height: 1.3;
}

/* ---- Pie ---- */

.agenda-demo__pie {
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  padding: 14px 26px 16px;
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  border-top: 1px solid var(--demo-color-borde-superficie);
  background: var(--demo-color-superficie);
}

.agenda-demo__resumen {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.agenda-demo__resumen .bi {
  color: var(--demo-color-azul);
}

.agenda-demo__aviso {
  margin: 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--agenda-fondo-aviso);
  color: var(--agenda-texto-aviso);
  font-size: 0.9rem;
  line-height: 1.4;
}

.agenda-demo__confirmar {
  width: 100%;
  min-width: 0;
}

.agenda-demo__confirmar:disabled {
  cursor: progress;
  opacity: 0.85;
  transform: none;
}

.agenda-demo__girando {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255, 255, 255, 0.45);
  border-top-color: #fff;
  border-radius: 50%;
  animation: agenda-demo-giro 0.8s linear infinite;
}

@keyframes agenda-demo-giro {
  to {
    transform: rotate(360deg);
  }
}

.agenda-demo__secundario {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 6px 4px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--demo-color-texto-suave);
  text-decoration: none;
}

.agenda-demo__secundario .bi {
  color: #1faa59;
  font-size: 1.1em;
}

.agenda-demo__secundario:hover {
  color: var(--demo-color-texto);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.agenda-demo__secundario:focus-visible {
  outline: 3px solid var(--demo-color-azul);
  outline-offset: 2px;
}

/* ---- Estados (cargando, error, sin turnos, bloqueado, listo) ---- */

.agenda-demo__cargando {
  padding: 4px 0 8px;
}

.agenda-demo__esqueleto {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 8px;
}

.agenda-demo__esqueleto-chip {
  height: 52px;
  border-radius: 12px;
  background: linear-gradient(90deg, rgba(86, 96, 120, 0.08), rgba(86, 96, 120, 0.16), rgba(86, 96, 120, 0.08));
  background-size: 200% 100%;
  animation: agenda-demo-brillo 1.2s ease-in-out infinite;
}

@keyframes agenda-demo-brillo {
  from {
    background-position: 100% 0;
  }
  to {
    background-position: -100% 0;
  }
}

.agenda-demo__estado {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 18px 0 10px;
  text-align: center;
}

.agenda-demo__estado-icono {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(11, 132, 248, 0.1);
  color: var(--demo-color-azul);
  font-size: 1.6rem;
}

.agenda-demo__estado-icono--ok {
  background: var(--demo-gradient-marca);
  color: #fff;
}

.agenda-demo__estado-titulo {
  margin: 0;
  max-width: 420px;
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.35;
  text-wrap: balance;
}

.agenda-demo__estado-titulo:focus {
  outline: none;
}

.agenda-demo__estado-texto {
  margin: 0;
  max-width: 420px;
  font-size: 0.98rem;
  line-height: 1.5;
  color: var(--demo-color-texto-suave);
}

.agenda-demo__estado-acciones {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.agenda-demo__estado-boton {
  margin-top: 4px;
  min-width: 240px;
}

/* ---- Teléfono: hoja de pantalla completa ---- */

@media (max-width: 767.98px) {
  .agenda-demo {
    padding: 0;
    align-items: stretch;
  }

  .agenda-demo__panel {
    width: 100%;
    height: 100%;
    max-height: none;
    border-radius: 0;
    box-shadow: none;
  }

  .agenda-demo__cabecera {
    padding: 16px 12px 12px 16px;
    padding-top: max(16px, env(safe-area-inset-top));
  }

  .agenda-demo__cuerpo {
    padding: 16px 16px 20px;
  }

  .agenda-demo__pie {
    padding-left: 16px;
    padding-right: 16px;
  }

  .agenda-demo__chips--dias {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .agenda-demo__chips--horas {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .agenda-demo__estado-boton {
    width: 100%;
    min-width: 0;
  }

  .agenda-demo__estado-acciones {
    align-self: stretch;
  }
}

/* ---- Entrada y salida ---- */

.agenda-demo-enter-active,
.agenda-demo-leave-active {
  transition: opacity 200ms ease;
}

.agenda-demo-enter-active .agenda-demo__panel,
.agenda-demo-leave-active .agenda-demo__panel {
  transition: transform 240ms cubic-bezier(0.16, 1, 0.3, 1);
}

.agenda-demo-enter-from,
.agenda-demo-leave-to {
  opacity: 0;
}

.agenda-demo-enter-from .agenda-demo__panel,
.agenda-demo-leave-to .agenda-demo__panel {
  transform: translateY(16px) scale(0.985);
}

@media (max-width: 767.98px) {
  .agenda-demo-enter-from .agenda-demo__panel,
  .agenda-demo-leave-to .agenda-demo__panel {
    transform: translateY(40px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .agenda-demo-enter-active,
  .agenda-demo-leave-active,
  .agenda-demo-enter-active .agenda-demo__panel,
  .agenda-demo-leave-active .agenda-demo__panel,
  .agenda-demo__chip-cara,
  .agenda-demo__input {
    transition: none;
  }

  .agenda-demo-enter-from .agenda-demo__panel,
  .agenda-demo-leave-to .agenda-demo__panel {
    transform: none;
  }

  .agenda-demo__esqueleto-chip,
  .agenda-demo__girando {
    animation: none;
  }
}
</style>
