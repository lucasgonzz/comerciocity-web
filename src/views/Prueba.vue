<template>
  <!-- El alta de la prueba gratuita de 7 días (programa «Prueba gratuita de 7 días», misión
       `prueba-precios-landing`, 3/11/2026). Dos fases en la misma página:

         1. El formulario: nombre, WhatsApp, correo, negocio, contraseña y rubro (opcional).
            Al confirmar, `POST landing/prueba/alta` del admin (contrato C6 en analitica/prueba.js).
         2. «Estamos armando tu sistema»: la página consulta `GET landing/prueba/{uuid}/estado`
            cada 3 s y dibuja el avance (una ventana del sistema que se va encendiendo, la barra,
            las etapas), con el video de bienvenida de Lucas al lado. Con `lista`, el botón «Entrar
            a mi sistema»; con `fallida`, el WhatsApp de soporte.

       La uuid viaja en la URL (`/prueba/<uuid>`): recargar, o volver desde el correo, retoma el
       seguimiento sin pedir nada de nuevo.

       Mismo scroller que Home.vue (<main class="sitio-scroller">: html/body/#app son
       height:100% + overflow:hidden, ver style.css) y mismos tokens de color y tipografía
       (`demo-experiencia-page`, experiencia.scss).

       🔴 MOCK: con `VITE_PRUEBA_MOCK=1` en el `.env` la página habla con un admin falso
       (`crear_mock()` de analitica/prueba.js) y no sale a la red: sirve para construirla y
       mirarla sin un admin que tenga el endpoint, y para probar los caminos raros (teléfonos
       terminados en 000000/000001/000002 → los tres 409; correo `422@…`; negocio con «falla»).
       `VITE_PRUEBA_MOCK_VIDEO` le da al mock una URL de video. Las dos se leen acá y no en
       config.js a propósito (alcance de la misión); en producción no se definen y no existen. -->
  <main ref="scroller" class="sitio-scroller">
    <div class="demo-experiencia-page prueba" :class="{ 'prueba--armando': fase === 'armando' }">
      <header class="prueba__barra">
        <router-link to="/" class="prueba__marca" aria-label="ComercioCity, inicio">
          <img :src="logotipo" alt="ComercioCity" class="prueba__logotipo" />
        </router-link>
        <a
          class="prueba__whatsapp"
          :href="cta_url"
          target="_blank"
          rel="noopener noreferrer"
          @click="on_whatsapp"
        >
          <i class="bi bi-whatsapp" aria-hidden="true"></i>
          <span class="prueba__texto-largo">¿Tenés dudas? Escribinos por WhatsApp</span>
          <span class="prueba__texto-corto">¿Dudas? WhatsApp</span>
        </a>
      </header>

      <!-- ============================== 1. El formulario ============================== -->
      <section v-if="fase === 'formulario'" class="prueba__alta">
        <div class="prueba__copy">
          <p class="demo-rotulo">Prueba gratis, 7 días</p>
          <h1 class="prueba__titulo">Probá ComercioCity con tu negocio de verdad.</h1>
          <p class="prueba__bajada">
            Te armamos tu propio sistema en unos minutos, con la tienda online y los agentes de IA
            andando. Sin turno y sin tarjeta.
          </p>
          <ul class="prueba__puntos">
            <li>
              <i class="bi bi-gift" aria-hidden="true"></i>
              <span>El sistema de gestión y la implementación son gratis.</span>
            </li>
            <li>
              <i class="bi bi-file-earmark-spreadsheet" aria-hidden="true"></i>
              <span>
                Importás tu Excel cuando quieras. Si no tenés, le mandás el PDF de tu proveedor a
                Martín por WhatsApp y te lo cargamos nosotros.
              </span>
            </li>
            <li>
              <i class="bi bi-grid-1x2" aria-hidden="true"></i>
              <span>Entrás al sistema completo: ventas, stock, cuentas corrientes, ARCA, tienda y agentes.</span>
            </li>
            <li>
              <i class="bi bi-telephone" aria-hidden="true"></i>
              <span>Antes de que termine, te llama alguien del equipo para ver cómo seguimos.</span>
            </li>
          </ul>
        </div>

        <!-- 409: ya es cliente o ya tiene una prueba. Reemplaza al formulario; el mensaje es del
             admin (o el de respaldo de prueba.js). -->
        <div v-if="bloqueo" class="prueba__tarjeta prueba__estado" role="alert">
          <span class="prueba__estado-icono" aria-hidden="true"><i class="bi bi-info-lg"></i></span>
          <p ref="foco_estado" class="prueba__estado-titulo" tabindex="-1">{{ bloqueo.mensaje }}</p>
          <p v-if="bloqueo.codigo === 'ya_tiene_prueba'" class="prueba__estado-texto">
            Si ya tenés el link de tu sistema en el correo, entrá por ahí. Si no, escribinos y te lo
            volvemos a mandar.
          </p>
          <a
            class="demo-boton-marca prueba__estado-boton"
            :href="cta_url"
            target="_blank"
            rel="noopener noreferrer"
            @click="on_whatsapp"
          >
            <i class="bi bi-whatsapp" aria-hidden="true"></i>
            <span>Escribinos por WhatsApp</span>
          </a>
          <button type="button" class="prueba__secundario" @click="volver_al_formulario">
            Probar con otro número
          </button>
        </div>

        <form v-else class="prueba__tarjeta prueba__form" novalidate @submit.prevent="enviar">
          <h2 class="prueba__form-titulo">Creá tu sistema</h2>
          <p class="prueba__form-bajada">Con estos datos entrás en el momento.</p>

          <div class="prueba__campo">
            <label for="prueba-nombre" class="prueba__rotulo">Tu nombre</label>
            <input
              id="prueba-nombre"
              ref="campo_nombre"
              v-model="datos.nombre"
              class="prueba__input"
              type="text"
              name="name"
              autocomplete="name"
              autocapitalize="words"
              maxlength="80"
              :aria-invalid="errores.nombre ? 'true' : 'false'"
              :aria-describedby="errores.nombre ? 'prueba-error-nombre' : null"
              @blur="revisar('nombre')"
              @input="revisar_si_hay_error('nombre')"
            />
            <p v-if="errores.nombre" id="prueba-error-nombre" class="prueba__error">{{ errores.nombre }}</p>
          </div>

          <div class="prueba__campo">
            <label for="prueba-telefono" class="prueba__rotulo">Tu WhatsApp</label>
            <input
              id="prueba-telefono"
              ref="campo_telefono"
              v-model="datos.telefono"
              class="prueba__input"
              type="tel"
              name="tel"
              inputmode="tel"
              autocomplete="tel"
              maxlength="30"
              placeholder="3444 622139"
              :aria-invalid="errores.telefono ? 'true' : 'false'"
              :aria-describedby="'prueba-ayuda-telefono' + (errores.telefono ? ' prueba-error-telefono' : '')"
              @blur="revisar('telefono')"
              @input="revisar_si_hay_error('telefono')"
            />
            <p id="prueba-ayuda-telefono" class="prueba__ayuda">Con característica, sin 0 ni 15. Por acá te escribe Martín.</p>
            <p v-if="errores.telefono" id="prueba-error-telefono" class="prueba__error">{{ errores.telefono }}</p>
          </div>

          <div class="prueba__campo">
            <label for="prueba-email" class="prueba__rotulo">Tu correo</label>
            <input
              id="prueba-email"
              ref="campo_email"
              v-model="datos.email"
              class="prueba__input"
              type="email"
              name="email"
              inputmode="email"
              autocomplete="email"
              autocapitalize="off"
              spellcheck="false"
              maxlength="120"
              :aria-invalid="errores.email ? 'true' : 'false'"
              :aria-describedby="errores.email ? 'prueba-error-email' : null"
              @blur="revisar('email')"
              @input="revisar_si_hay_error('email')"
            />
            <p v-if="errores.email" id="prueba-error-email" class="prueba__error">{{ errores.email }}</p>
          </div>

          <div class="prueba__campo">
            <label for="prueba-empresa" class="prueba__rotulo">El nombre de tu negocio</label>
            <input
              id="prueba-empresa"
              ref="campo_empresa"
              v-model="datos.empresa"
              class="prueba__input"
              type="text"
              name="organization"
              autocomplete="organization"
              autocapitalize="words"
              maxlength="80"
              placeholder="Ferretería Pérez"
              :aria-invalid="errores.empresa ? 'true' : 'false'"
              :aria-describedby="errores.empresa ? 'prueba-error-empresa' : null"
              @blur="revisar('empresa')"
              @input="revisar_si_hay_error('empresa')"
            />
            <p v-if="errores.empresa" id="prueba-error-empresa" class="prueba__error">{{ errores.empresa }}</p>
          </div>

          <div class="prueba__campo">
            <label for="prueba-password" class="prueba__rotulo">Una contraseña para entrar</label>
            <div class="prueba__password">
              <input
                id="prueba-password"
                ref="campo_password"
                v-model="datos.password"
                class="prueba__input"
                :type="ver_password ? 'text' : 'password'"
                name="new-password"
                autocomplete="new-password"
                autocapitalize="off"
                spellcheck="false"
                maxlength="120"
                :aria-invalid="errores.password ? 'true' : 'false'"
                :aria-describedby="'prueba-ayuda-password' + (errores.password ? ' prueba-error-password' : '')"
                @blur="revisar('password')"
                @input="revisar_si_hay_error('password')"
              />
              <button
                type="button"
                class="prueba__ver"
                :aria-pressed="ver_password ? 'true' : 'false'"
                :aria-label="ver_password ? 'Ocultar la contraseña' : 'Mostrar la contraseña'"
                @click="ver_password = !ver_password"
              >
                <i class="bi" :class="ver_password ? 'bi-eye-slash' : 'bi-eye'" aria-hidden="true"></i>
              </button>
            </div>
            <p id="prueba-ayuda-password" class="prueba__ayuda">Al menos 8 caracteres. Nada más.</p>
            <p v-if="errores.password" id="prueba-error-password" class="prueba__error">{{ errores.password }}</p>
          </div>

          <div class="prueba__campo">
            <label for="prueba-rubro" class="prueba__rotulo">
              Tu rubro <span class="prueba__opcional">(opcional)</span>
            </label>
            <select
              id="prueba-rubro"
              ref="campo_rubro"
              v-model="datos.rubro"
              class="prueba__input prueba__select"
              name="rubro"
              :aria-invalid="errores.rubro ? 'true' : 'false'"
              :aria-describedby="'prueba-ayuda-rubro' + (errores.rubro ? ' prueba-error-rubro' : '')"
              @change="revisar('rubro')"
            >
              <option value="">Elegí tu rubro</option>
              <option v-for="rubro in rubros" :key="rubro.slug" :value="rubro.slug">{{ rubro.nombre }}</option>
            </select>
            <p id="prueba-ayuda-rubro" class="prueba__ayuda">Para cargarte productos de ejemplo parecidos a los tuyos.</p>
            <p v-if="errores.rubro" id="prueba-error-rubro" class="prueba__error">{{ errores.rubro }}</p>
          </div>

          <!-- Honeypot: un humano no lo ve ni lo oye, y el tab no pasa por acá. Si viene con
               algo, el admin responde 422 (mismo anti-bot que la agenda).
               🔴 Sin nada que un autocompletado o un gestor de contraseñas reconozca en el name,
               el id o el rótulo. En el body viaja como `sitio_web` (lo arma `armar_body_alta`). -->
          <div class="prueba__trampa" aria-hidden="true">
            <label for="prueba-c9">No completar</label>
            <input
              id="prueba-c9"
              v-model="sitio_web"
              type="text"
              name="cc_c9"
              tabindex="-1"
              autocomplete="off"
              data-lpignore="true"
              data-1p-ignore="true"
              data-bwignore="true"
              data-form-type="other"
            />
          </div>

          <p v-if="aviso" class="prueba__aviso" role="alert">{{ aviso }}</p>

          <button
            ref="enviar"
            type="submit"
            class="demo-boton-marca prueba__enviar"
            :disabled="enviando"
            :aria-busy="enviando ? 'true' : 'false'"
          >
            <span v-if="enviando" class="prueba__girando" aria-hidden="true"></span>
            <i v-else class="bi bi-rocket-takeoff" aria-hidden="true"></i>
            <span>{{ enviando ? 'Creando tu sistema…' : 'Crear mi sistema' }}</span>
          </button>
          <p class="prueba__legal">
            Al crear tu sistema aceptás que te escribamos por WhatsApp y por correo durante la
            prueba. Sin tarjeta: si no seguís, no pagás nada.
          </p>
        </form>
      </section>

      <!-- ====================== 2. Estamos armando tu sistema ====================== -->
      <section v-else class="prueba__armado" aria-live="polite">
        <!-- Uuid que el admin no conoce (link viejo, o pegado mal). -->
        <div v-if="no_encontrada" class="prueba__tarjeta prueba__estado prueba__estado--suelto" role="alert">
          <span class="prueba__estado-icono" aria-hidden="true"><i class="bi bi-question-lg"></i></span>
          <p ref="foco_estado" class="prueba__estado-titulo" tabindex="-1">No encontramos esta prueba.</p>
          <p class="prueba__estado-texto">Puede que el link esté incompleto. Podés empezar una prueba nueva o escribirnos.</p>
          <router-link to="/prueba" class="demo-boton-marca prueba__estado-boton" @click="volver_al_formulario">
            <span>Empezar mi prueba</span>
            <i class="bi bi-arrow-right" aria-hidden="true"></i>
          </router-link>
          <a class="prueba__secundario" :href="cta_url" target="_blank" rel="noopener noreferrer" @click="on_whatsapp">
            <i class="bi bi-whatsapp" aria-hidden="true"></i>
            <span>Escribinos por WhatsApp</span>
          </a>
        </div>

        <template v-else>
          <div class="prueba__armado-cabeza">
            <p class="demo-rotulo">{{ rotulo_armado }}</p>
            <h1 ref="titulo_armado" class="prueba__titulo prueba__titulo--armado" tabindex="-1">{{ titulo_armado }}</h1>
            <p class="prueba__bajada prueba__bajada--armado">{{ bajada_armado }}</p>

            <!-- Lista: el botón, acá arriba, que es lo único que importa en ese momento. -->
            <div v-if="estado_actual === 'lista'" class="prueba__listo">
              <a
                v-if="url_ingreso"
                ref="entrar"
                class="demo-boton-marca prueba__entrar"
                :href="url_ingreso"
                @click="emitir_evento('prueba_ingreso_tocado', {})"
              >
                <span>Entrar a mi sistema</span>
                <i class="bi bi-arrow-right" aria-hidden="true"></i>
              </a>
              <p v-else class="prueba__estado-texto">
                El sistema está listo, pero no recibimos el link de ingreso. Escribinos por WhatsApp y te lo mandamos.
              </p>
              <p class="prueba__listo-nota">
                También te mandamos el acceso por correo. Entrás con tu correo y la contraseña que elegiste.
              </p>
            </div>

            <!-- Fallida: el WhatsApp de soporte (el que mande el admin, o el de la página). -->
            <div v-if="estado_actual === 'fallida'" class="prueba__fallida" role="alert">
              <p class="prueba__estado-texto">{{ mensaje_fallida }}</p>
              <a
                class="demo-boton-marca prueba__estado-boton"
                :href="whatsapp_fallida"
                target="_blank"
                rel="noopener noreferrer"
                @click="on_whatsapp"
              >
                <i class="bi bi-whatsapp" aria-hidden="true"></i>
                <span>Escribinos por WhatsApp</span>
              </a>
            </div>
          </div>

          <div class="prueba__armado-cuerpo">
            <!-- La escena: una ventana del sistema que se va encendiendo módulo por módulo con el
                 progreso real, y abajo la barra y las etapas. -->
            <div class="prueba__progreso-bloque">
              <div class="prueba__escena" :class="{ 'prueba__escena--lista': estado_actual === 'lista', 'prueba__escena--fallida': estado_actual === 'fallida' }" aria-hidden="true">
                <div class="prueba__halo"></div>
                <div class="prueba__ventana">
                  <div class="prueba__ventana-barra">
                    <span class="prueba__punto"></span>
                    <span class="prueba__punto"></span>
                    <span class="prueba__punto"></span>
                    <span class="prueba__ventana-titulo">{{ nombre_negocio }} · ComercioCity</span>
                  </div>
                  <div class="prueba__ventana-cuerpo">
                    <div class="prueba__ventana-menu">
                      <span
                        v-for="n in 6"
                        :key="n"
                        class="prueba__menu-item"
                        :class="{ 'prueba__menu-item--on': n <= menu_prendido }"
                      ></span>
                    </div>
                    <div class="prueba__modulos">
                      <div
                        v-for="(modulo, i) in modulos"
                        :key="modulo.clave"
                        class="prueba__modulo"
                        :class="{
                          'prueba__modulo--on': i < modulos_prendidos,
                          'prueba__modulo--actual': i === modulos_prendidos && estado_actual === 'creando',
                        }"
                      >
                        <i class="bi" :class="modulo.icono"></i>
                        <span>{{ modulo.texto }}</span>
                      </div>
                    </div>
                  </div>
                  <span v-if="estado_actual === 'creando'" class="prueba__barrido"></span>
                  <span v-if="estado_actual === 'lista'" class="prueba__sello"><i class="bi bi-check-lg"></i></span>
                  <span v-if="estado_actual === 'fallida'" class="prueba__sello prueba__sello--fallida"><i class="bi bi-exclamation-lg"></i></span>
                </div>
              </div>

              <div
                class="prueba__barra-progreso"
                role="progressbar"
                aria-label="Avance del armado de tu sistema"
                aria-valuemin="0"
                aria-valuemax="100"
                :aria-valuenow="progreso"
              >
                <span class="prueba__barra-relleno" :style="{ width: progreso + '%' }"></span>
              </div>
              <p class="prueba__etapa">
                <span v-if="estado_actual === 'creando'" class="prueba__girando prueba__girando--azul" aria-hidden="true"></span>
                <span>{{ etapa_texto }}</span>
                <span class="prueba__porcentaje">{{ progreso }} %</span>
              </p>

              <ol class="prueba__pasos">
                <li
                  v-for="(etapa, i) in etapas"
                  :key="etapa.clave"
                  class="prueba__paso"
                  :class="{ 'prueba__paso--hecho': etapa.hecha, 'prueba__paso--actual': etapa.actual }"
                >
                  <span class="prueba__paso-icono" aria-hidden="true">
                    <i class="bi" :class="etapa.hecha ? 'bi-check-lg' : etapa.icono"></i>
                  </span>
                  <span>{{ etapa.texto }}</span>
                  <span v-if="etapa.hecha" class="visualmente-oculto">, listo</span>
                  <span v-else-if="etapa.actual" class="visualmente-oculto">, en curso</span>
                </li>
              </ol>

              <!-- Red caída o admin que no responde: se sigue consultando, pero se dice. -->
              <p v-if="aviso_estado" class="prueba__aviso prueba__aviso--estado" role="status">{{ aviso_estado }}</p>
            </div>

            <!-- El video de bienvenida de Lucas, o su texto mientras el video no exista. -->
            <aside class="prueba__video-bloque">
              <p class="prueba__video-rotulo">
                <i class="bi bi-play-circle" aria-hidden="true"></i>
                <span>{{ estado_actual === 'creando' ? 'Mientras tanto, un mensaje de Lucas' : 'Un mensaje de Lucas' }}</span>
              </p>
              <div v-if="reproductor" class="prueba__video">
                <iframe
                  v-if="reproductor.tipo !== 'archivo'"
                  :src="reproductor.src"
                  title="Bienvenida a tu prueba de ComercioCity"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                  loading="lazy"
                ></iframe>
                <video
                  v-else
                  :src="reproductor.src"
                  controls
                  playsinline
                  preload="metadata"
                  aria-label="Bienvenida a tu prueba de ComercioCity"
                ></video>
              </div>
              <!-- Sin `video_url` todavía: el guion, como una carta. Cuando Lucas grabe el video,
                   el admin manda la URL y esto desaparece solo. -->
              <blockquote v-else class="prueba__carta">
                <p v-for="(parrafo, i) in guion" :key="i">{{ parrafo }}</p>
                <footer>Lucas González, fundador de ComercioCity</footer>
              </blockquote>
            </aside>
          </div>
        </template>
      </section>

      <footer class="prueba__pie">
        <span>© {{ anio }} ComercioCity</span>
        <router-link to="/" class="prueba__pie-enlace">Volver a la página</router-link>
      </footer>
    </div>
  </main>
</template>

<script>
import {
  ETAPAS_VISUALES,
  FALLOS_SEGUIDOS_PARA_AVISAR,
  GUION_BIENVENIDA,
  INTERVALO_ESTADO_MS,
  MODULOS_ESCENA,
  RUBROS_PRUEBA,
  TIEMPO_ALTA_MS,
  TIEMPO_ESTADO_MS,
  armar_body_alta,
  crear_mock,
  etapas_hechas,
  interpretar_alta,
  interpretar_estado,
  reproductor_de_video,
  uuid_valido,
  validar_alta,
} from '@/analitica/prueba'
import { PISO_ABIERTO_MS, leer_cookie_meta, pedir_json, unir_url, url_de_origen } from '@/analitica/agenda-demo'
import { registrar_evento, marcar_sesion_de_ensayo } from '@/analitica/meta-pixel'
import { armar_url_whatsapp, obtener_atribucion, solicitar_referencia } from '@/analitica/atribucion-whatsapp'
import { ADMIN_API_BASE, WHATSAPP_REFERENCIAS_URL } from '@/config'
import LOGOTIPO from '@/assets/marca/logotipo-comerciocity-oscuro.png'
import '@/assets/scss/experiencia.scss'

/** Las dos rutas de C6, sobre la misma base del admin que usa la agenda. */
const ALTA_URL = unir_url(ADMIN_API_BASE, '/landing/prueba/alta')

/**
 * @param {string} uuid
 * @returns {string}
 */
function estado_url(uuid) {
  return unir_url(ADMIN_API_BASE, '/landing/prueba/' + encodeURIComponent(uuid) + '/estado')
}

/** El admin falso, solo con `VITE_PRUEBA_MOCK=1` (ver el encabezado). */
const MOCK = String(import.meta.env.VITE_PRUEBA_MOCK || '').trim() === '1'
const FETCHER = MOCK
  ? crear_mock({ video_url: String(import.meta.env.VITE_PRUEBA_MOCK_VIDEO || '').trim() })
  : undefined

/** Avisos generales del formulario. Los de cada campo vienen de prueba.js. */
const AVISOS = {
  red: 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo, o escribinos por WhatsApp.',
  tiempo: 'Está tardando más de lo normal. Puede que tu sistema se haya creado igual: fijate en tu correo en unos minutos, o escribinos por WhatsApp.',
  invalida: 'No pudimos crear tu sistema. Revisá los datos y probá de nuevo, o escribinos por WhatsApp.',
  limite: 'Hiciste varios intentos seguidos. Esperá unos minutos y probá de nuevo, o escribinos por WhatsApp.',
  reintentar: 'Ahora mismo tenemos mucho movimiento. Probá de nuevo en unos segundos.',
  error: 'Algo falló de nuestro lado. Probá de nuevo en un rato o escribinos por WhatsApp.',
}

/** Orden en que se busca el primer campo con error para llevarle el foco. */
const ORDEN_CAMPOS = ['nombre', 'telefono', 'email', 'empresa', 'password', 'rubro']

export default {
  name: 'Prueba',

  props: {
    /** La uuid de la prueba (de la ruta `/prueba/:uuid`): con ella, se retoma el seguimiento. */
    uuid: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      logotipo: LOGOTIPO,
      rubros: RUBROS_PRUEBA,
      modulos: MODULOS_ESCENA,
      guion: GUION_BIENVENIDA,
      anio: new Date().getFullYear(),
      cta_url: armar_url_whatsapp(),
      montado: false,
      /** 'formulario' | 'armando' */
      fase: 'formulario',
      datos: { nombre: '', telefono: '', email: '', empresa: '', password: '', rubro: '' },
      ver_password: false,
      sitio_web: '',
      errores: {},
      aviso: '',
      enviando: false,
      /** 409: {codigo, mensaje}. Reemplaza al formulario. */
      bloqueo: null,
      /** Date.now() del momento en que se abrió la página: de acá sale `abierto_hace_ms`. */
      abierto_en: Date.now(),
      /** La uuid que se está siguiendo. */
      uuid_actual: '',
      /** El último estado interpretado (salida de `interpretar_estado`). */
      estado: null,
      no_encontrada: false,
      fallos_seguidos: 0,
      temporizador: null,
      /** Para descartar una respuesta vieja si cambió la uuid. */
      pedido_estado: 0,
    }
  },

  computed: {
    /** @returns {string} */
    estado_actual() {
      return this.estado ? this.estado.estado : 'creando'
    },

    /** @returns {number} */
    progreso() {
      return this.estado ? this.estado.progreso : 0
    },

    /** @returns {string|null} */
    url_ingreso() {
      return this.estado ? this.estado.url_ingreso : null
    },

    /** @returns {object|null} */
    reproductor() {
      return reproductor_de_video(this.estado ? this.estado.video_url : null)
    },

    /** Las etapas pintadas con su estado (hecha / actual) para este progreso. */
    etapas() {
      const hechas = this.estado_actual === 'lista' ? ETAPAS_VISUALES.length : etapas_hechas(this.progreso)
      const creando = this.estado_actual === 'creando'
      return ETAPAS_VISUALES.map(function (etapa, i) {
        return Object.assign({}, etapa, { hecha: i < hechas, actual: creando && i === hechas })
      })
    },

    /** Cuántos módulos de la ventana están prendidos (los ocho, con `lista`). */
    modulos_prendidos() {
      if (this.estado_actual === 'lista') {
        return MODULOS_ESCENA.length
      }
      return Math.min(MODULOS_ESCENA.length - 1, Math.floor((this.progreso / 100) * MODULOS_ESCENA.length))
    },

    /** @returns {number} */
    menu_prendido() {
      return this.estado_actual === 'lista' ? 6 : Math.min(6, Math.ceil((this.progreso / 100) * 6))
    },

    /** @returns {string} */
    nombre_negocio() {
      const nombre = String(this.datos.empresa || '').trim()
      return nombre ? nombre.slice(0, 32) : 'Tu negocio'
    },

    /** @returns {string} */
    rotulo_armado() {
      if (this.estado_actual === 'lista') return 'Listo'
      if (this.estado_actual === 'fallida') return 'Algo no salió'
      return 'Unos minutos'
    },

    /** @returns {string} */
    titulo_armado() {
      if (this.estado_actual === 'lista') return '¡Tu sistema está listo!'
      if (this.estado_actual === 'fallida') return 'No pudimos terminar.'
      return 'Estamos armando tu sistema.'
    },

    /** @returns {string} */
    bajada_armado() {
      if (this.estado_actual === 'lista') {
        return 'Entrá y recorrelo con calma: lo que ves es el sistema completo, con productos de ejemplo de tu rubro.'
      }
      if (this.estado_actual === 'fallida') {
        return 'Ya nos avisó solo. Escribinos y lo resolvemos ahora.'
      }
      return 'Tu propio sistema, con tu dirección, tu tienda online y tus agentes. Tarda unos minutos; podés quedarte acá o volver por el link que te mandamos al correo.'
    },

    /** El texto de la etapa: el del admin si manda uno, si no el de la etapa pintada actual. */
    etapa_texto() {
      if (this.estado_actual === 'lista') return 'Tu sistema está listo'
      if (this.estado && this.estado.etapa) return this.estado.etapa
      const actual = this.etapas.find(function (e) { return e.actual })
      return actual ? actual.texto : 'Preparando todo'
    },

    /** @returns {string} */
    mensaje_fallida() {
      return (this.estado && this.estado.mensaje) ||
        'Lo que cargaste quedó guardado: escribinos por WhatsApp y te dejamos el sistema andando enseguida.'
    },

    /** @returns {string} */
    whatsapp_fallida() {
      return (this.estado && this.estado.whatsapp_soporte) || this.cta_url
    },

    /** @returns {string} */
    aviso_estado() {
      if (this.fallos_seguidos < FALLOS_SEGUIDOS_PARA_AVISAR) {
        return ''
      }
      return 'No estamos pudiendo consultar el avance (puede ser tu conexión). Seguimos intentando; ' +
        'si pasan varios minutos, escribinos por WhatsApp.'
    },
  },

  watch: {
    /** Cambió la ruta (p.ej. de `/prueba` a `/prueba/<uuid>` después del 201, o al revés). */
    uuid(valor) {
      if (uuid_valido(valor)) {
        if (valor !== this.uuid_actual) {
          this.seguir(valor)
        }
      } else if (this.fase === 'armando') {
        this.volver_al_formulario()
      }
    },
  },

  created() {
    if (uuid_valido(this.uuid)) {
      this.seguir(this.uuid)
    }
  },

  mounted() {
    this.montado = true
    this.emitir_evento(this.fase === 'armando' ? 'prueba_seguimiento_retomado' : 'prueba_formulario_visto', {})
    solicitar_referencia({ endpoint: WHATSAPP_REFERENCIAS_URL, datos: obtener_atribucion() })
      .then((reference) => {
        if (reference && this.montado) this.cta_url = armar_url_whatsapp(reference)
      })
  },

  beforeUnmount() {
    this.montado = false
    this.detener()
  },

  methods: {
    /**
     * El mismo bus que Home.vue: consola siempre, Meta por meta-pixel.js (sin datos personales).
     *
     * @param {string} nombre
     * @param {object} payload
     * @returns {void}
     */
    emitir_evento(nombre, payload) {
      if (typeof console !== 'undefined' && console.debug) {
        console.debug('[comerciocity] ' + nombre, payload || {})
      }
      registrar_evento(nombre, payload)
    },

    /** La salida por WhatsApp mide igual que la de cualquier CTA. */
    on_whatsapp() {
      this.emitir_evento('cta_demo_tocado', { desde: 'prueba', fase: this.fase })
    },

    /**
     * Valida un campo al salir de él (no mientras se escribe por primera vez).
     *
     * @param {string} campo
     * @returns {void}
     */
    revisar(campo) {
      const errores = validar_alta(this.datos)
      const nuevos = Object.assign({}, this.errores)
      if (errores[campo] && String(this.datos[campo] || '').trim() !== '') {
        nuevos[campo] = errores[campo]
      } else if (!errores[campo]) {
        delete nuevos[campo]
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
      const errores = validar_alta(this.datos)
      if (!errores[campo]) {
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
        const destino = this.$refs['campo_' + campo]
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
        const destino = this.$refs.foco_estado || this.$refs.titulo_armado
        if (destino && destino.focus) {
          destino.focus({ preventScroll: true })
        }
      })
    },

    /** @returns {boolean} */
    movimiento_reducido() {
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    },

    /**
     * «Crear mi sistema»: valida, espera el piso anti-robot si hiciera falta, manda y resuelve
     * cada respuesta del contrato.
     *
     * @returns {Promise<void>}
     */
    async enviar() {
      if (this.enviando) {
        return
      }
      this.aviso = ''
      this.errores = validar_alta(this.datos)
      if (Object.keys(this.errores).length) {
        this.enfocar_primer_error()
        return
      }

      this.enviando = true
      const falta = PISO_ABIERTO_MS - (Date.now() - this.abierto_en)
      if (falta > 0) {
        await new Promise(function (resolve) { setTimeout(resolve, falta) })
      }

      const body = armar_body_alta(Object.assign({}, this.datos, {
        atribucion: obtener_atribucion(),
        fbp: leer_cookie_meta(document.cookie, '_fbp'),
        fbc: leer_cookie_meta(document.cookie, '_fbc'),
        event_source_url: url_de_origen(window.location),
        sitio_web: this.sitio_web,
        abierto_hace_ms: Date.now() - this.abierto_en,
      }))

      const respuesta = await pedir_json({
        url: ALTA_URL,
        metodo: 'POST',
        body: body,
        timeout: TIEMPO_ALTA_MS,
        fetcher: FETCHER,
      })
      this.enviando = false

      if (respuesta.status === 0) {
        this.aviso = AVISOS[respuesta.motivo] || AVISOS.red
        return
      }
      this.resolver(interpretar_alta(respuesta.status, respuesta.cuerpo))
    },

    /**
     * @param {object} r Salida de `interpretar_alta`.
     * @returns {void}
     */
    resolver(r) {
      if (r.tipo === 'creada') {
        /* Un ensayo (el admin contestó `ensayo: true`) apaga el píxel ANTES de emitir: no sale el Lead
           ni ningún evento más de esta visita (misión ensayos-sin-eventos-meta, 13/11/2026). */
        if (r.ensayo) {
          marcar_sesion_de_ensayo()
        }
        /* Solo Lead con el ID de la CAPI. StartTrial espera el primer ingreso real al sistema. */
        this.emitir_evento('prueba_alta', { meta_eventos: r.meta_eventos, rubro: this.datos.rubro || '' })
        /* La contraseña no se guarda en ningún lado de esta página. */
        this.datos.password = ''
        this.seguir(r.uuid)
        /* La uuid a la URL: recargar o volver retoma el seguimiento. */
        if (this.$route && this.$route.params.uuid !== r.uuid) {
          this.$router.replace({ name: 'Prueba', params: { uuid: r.uuid } })
        }
        return
      }

      if (r.tipo === 'campos') {
        this.errores = r.errores
        this.enfocar_primer_error()
        return
      }

      if (r.tipo === 'telefono_invalido') {
        this.errores = Object.assign({}, this.errores, { telefono: r.mensaje })
        this.enfocar_primer_error()
        return
      }

      if (r.tipo === 'ya_es_cliente' || r.tipo === 'ya_tiene_prueba') {
        this.bloqueo = { codigo: r.tipo, mensaje: r.mensaje }
        this.emitir_evento('prueba_bloqueada', { codigo: r.tipo })
        this.enfocar_estado()
        return
      }

      if (r.tipo === 'reintentar' || r.tipo === 'limite') {
        this.aviso = r.mensaje || AVISOS[r.tipo]
        return
      }

      this.aviso = AVISOS[r.tipo] || AVISOS.error
    },

    /**
     * Arranca (o reinicia) el seguimiento de una prueba: fase «armando» y la primera consulta
     * del estado, que se repite cada INTERVALO_ESTADO_MS hasta `lista` o `fallida`.
     *
     * @param {string} uuid
     * @returns {void}
     */
    seguir(uuid) {
      this.detener()
      this.uuid_actual = uuid
      this.fase = 'armando'
      this.bloqueo = null
      this.estado = null
      this.no_encontrada = false
      this.fallos_seguidos = 0
      this.consultar_estado()
      this.enfocar_estado()
    },

    /** @returns {void} */
    detener() {
      if (this.temporizador) {
        clearTimeout(this.temporizador)
        this.temporizador = null
      }
      this.pedido_estado++
    },

    /**
     * Una consulta del estado. Nunca tira: un error de red o un 5xx cuentan como fallo seguido
     * y se vuelve a intentar; un 404 frena (uuid desconocida); `lista` y `fallida` frenan.
     *
     * @returns {Promise<void>}
     */
    async consultar_estado() {
      const uuid = this.uuid_actual
      const pedido = ++this.pedido_estado
      const respuesta = await pedir_json({ url: estado_url(uuid), timeout: TIEMPO_ESTADO_MS, fetcher: FETCHER })
      if (pedido !== this.pedido_estado || !this.montado && this.fase !== 'armando') {
        return
      }
      let r
      try {
        r = interpretar_estado(respuesta.status, respuesta.cuerpo)
      } catch (_) {
        r = { tipo: 'error' }
      }

      if (r.tipo === 'no_encontrada') {
        this.no_encontrada = true
        this.emitir_evento('prueba_no_encontrada', {})
        this.enfocar_estado()
        return
      }

      if (r.tipo === 'estado') {
        this.fallos_seguidos = 0
        const anterior = this.estado ? this.estado.estado : null
        this.estado = r
        if (r.estado === 'lista') {
          if (anterior !== 'lista') {
            this.emitir_evento('prueba_lista', {})
            this.$nextTick(() => {
              const boton = this.$refs.entrar
              if (boton && boton.focus) boton.focus({ preventScroll: true })
            })
          }
          return
        }
        if (r.estado === 'fallida') {
          if (anterior !== 'fallida') {
            this.emitir_evento('prueba_fallida', {})
          }
          return
        }
      } else {
        this.fallos_seguidos++
      }

      this.temporizador = setTimeout(() => {
        this.temporizador = null
        this.consultar_estado()
      }, INTERVALO_ESTADO_MS)
    },

    /** Vuelve al formulario limpio (desde un 409 o desde «No encontramos esta prueba»). */
    volver_al_formulario() {
      this.detener()
      this.fase = 'formulario'
      this.bloqueo = null
      this.estado = null
      this.no_encontrada = false
      this.uuid_actual = ''
      this.errores = {}
      this.aviso = ''
      this.abierto_en = Date.now()
      if (this.$route && this.$route.params.uuid) {
        this.$router.replace({ name: 'Prueba', params: {} })
      }
      this.$nextTick(() => {
        const campo = this.$refs.campo_telefono
        if (campo && campo.focus) campo.focus({ preventScroll: true })
      })
    },
  },
}
</script>

<style scoped>
.prueba {
  --prueba-borde: rgba(86, 96, 120, 0.28);
  --prueba-error: #c62828;
  --prueba-ok: #16a34a;
  --prueba-fondo-aviso: #fff4e5;
  --prueba-texto-aviso: #7a3e00;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(85% 55% at 15% 0%, rgba(11, 132, 248, 0.12), transparent 60%),
    radial-gradient(70% 50% at 100% 100%, rgba(58, 49, 252, 0.1), transparent 60%),
    var(--demo-color-fondo);
}

/* La barra: la marca a la izquierda, WhatsApp a la derecha. Igual que la del hero. */
.prueba__barra {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: clamp(14px, 2.2vh, 24px) clamp(16px, 3vw, 36px);
}

.prueba__marca {
  display: inline-flex;
  align-items: center;
  line-height: 0;
}

.prueba__logotipo {
  height: clamp(26px, 3.2vh, 34px);
  width: auto;
}

.prueba__whatsapp {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 40px;
  padding: 8px 14px;
  border: 1px solid var(--prueba-borde);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  color: var(--demo-color-texto);
  font-size: 0.88rem;
  font-weight: 500;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  transition: border-color 160ms ease, background-color 160ms ease;
}

.prueba__whatsapp .bi {
  color: #1faa59;
  font-size: 1.1em;
}

.prueba__whatsapp:hover {
  color: var(--demo-color-texto);
  border-color: rgba(86, 96, 120, 0.55);
  background: #fff;
}

.prueba__whatsapp:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px #fff, 0 0 0 6px var(--demo-color-azul);
}

.prueba__texto-corto {
  display: none;
}

/* ---------------------------------------------------------------- 1. El formulario */
.prueba__alta {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: clamp(16px, 4vh, 48px) clamp(16px, 4vw, 48px) clamp(32px, 6vh, 72px);
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(24px, 4vw, 56px);
  align-items: start;
}

.prueba__titulo {
  margin: 0;
  font-size: clamp(1.9rem, 4.6vw, 3rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: var(--demo-color-texto);
  text-wrap: balance;
}

.prueba__bajada {
  margin: clamp(14px, 2vw, 20px) 0 0;
  font-size: clamp(1.05rem, 1.6vw, 1.25rem);
  line-height: 1.55;
  color: var(--demo-color-texto-suave);
  text-wrap: pretty;
}

.prueba__puntos {
  list-style: none;
  margin: clamp(20px, 3vw, 32px) 0 0;
  padding: 0;
  display: grid;
  gap: 14px;
}

.prueba__puntos li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: clamp(0.98rem, 1.3vw, 1.05rem);
  line-height: 1.5;
  color: var(--demo-color-texto);
}

.prueba__puntos .bi {
  flex: 0 0 auto;
  margin-top: 2px;
  font-size: 1.2rem;
  color: var(--demo-color-azul);
}

/* La tarjeta del formulario (y de los estados): la misma piel que la tarjeta del precio. */
.prueba__tarjeta {
  width: 100%;
  padding: clamp(22px, 3vw, 32px);
  border-radius: 22px;
  border: 1px solid rgba(11, 132, 248, 0.35);
  background: var(--demo-color-superficie, #fff);
  box-shadow: 0 24px 50px -30px rgba(11, 132, 248, 0.6);
}

.prueba__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.prueba__form-titulo {
  margin: 0;
  font-size: clamp(1.3rem, 2vw, 1.5rem);
  font-weight: 700;
  letter-spacing: -0.015em;
  color: var(--demo-color-texto);
}

.prueba__form-bajada {
  margin: -8px 0 4px;
  font-size: 0.95rem;
  color: var(--demo-color-texto-suave);
}

.prueba__campo {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.prueba__rotulo {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--demo-color-texto);
}

.prueba__opcional {
  font-weight: 400;
  color: var(--demo-color-texto-suave);
}

.prueba__input {
  width: 100%;
  min-height: 48px;
  padding: 10px 14px;
  border: 1.5px solid var(--prueba-borde);
  border-radius: 12px;
  background: #fff;
  color: var(--demo-color-texto);
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.3;
  transition: border-color 140ms ease;
}

.prueba__input::placeholder {
  color: var(--demo-color-texto-suave);
  opacity: 0.7;
}

.prueba__input:focus {
  outline: none;
  border-color: var(--demo-color-azul);
  box-shadow: 0 0 0 3px rgba(11, 132, 248, 0.22);
}

.prueba__input[aria-invalid='true'] {
  border-color: var(--prueba-error);
}

.prueba__select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 40px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%23566078' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M3 6l5 5 5-5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
}

/* La contraseña con el ojo adentro del campo. */
.prueba__password {
  position: relative;
}

.prueba__password .prueba__input {
  padding-right: 52px;
}

.prueba__ver {
  position: absolute;
  top: 50%;
  right: 6px;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--demo-color-texto-suave);
  font-size: 1.15rem;
  cursor: pointer;
}

.prueba__ver:hover {
  color: var(--demo-color-texto);
  background: rgba(86, 96, 120, 0.08);
}

.prueba__ver:focus-visible {
  outline: 2px solid var(--demo-color-azul);
  outline-offset: 1px;
}

.prueba__ayuda {
  margin: 0;
  font-size: 0.85rem;
  color: var(--demo-color-texto-suave);
}

.prueba__error {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 500;
  line-height: 1.35;
  color: var(--prueba-error);
}

/* El honeypot: fuera de la vista y del árbol de accesibilidad, sin display:none (algunos
   robots saltean lo oculto por display). */
.prueba__trampa {
  position: absolute;
  left: -10000px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.prueba__aviso {
  margin: 0;
  padding: 10px 14px;
  border-radius: 12px;
  background: var(--prueba-fondo-aviso);
  color: var(--prueba-texto-aviso);
  font-size: 0.92rem;
  line-height: 1.45;
}

.prueba__enviar {
  width: 100%;
  margin-top: 4px;
}

.prueba__enviar:disabled {
  opacity: 0.75;
  cursor: wait;
  transform: none;
}

.prueba__legal {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.45;
  color: var(--demo-color-texto-suave);
  text-align: center;
}

/* El rulito de «enviando». */
.prueba__girando {
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2.5px solid rgba(255, 255, 255, 0.45);
  border-top-color: #fff;
  animation: prueba-girar 0.8s linear infinite;
}

.prueba__girando--azul {
  width: 14px;
  height: 14px;
  border-width: 2px;
  border-color: rgba(11, 132, 248, 0.25);
  border-top-color: var(--demo-color-azul);
}

@keyframes prueba-girar {
  to { transform: rotate(360deg); }
}

/* Los estados que reemplazan al formulario (409, no encontrada). */
.prueba__estado {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
}

.prueba__estado--suelto {
  max-width: 560px;
  margin: 0 auto;
}

.prueba__estado-icono {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(11, 132, 248, 0.12);
  color: var(--demo-color-azul);
  font-size: 1.6rem;
}

.prueba__estado-titulo {
  margin: 0;
  font-size: clamp(1.15rem, 1.8vw, 1.35rem);
  font-weight: 700;
  line-height: 1.3;
  color: var(--demo-color-texto);
}

.prueba__estado-titulo:focus {
  outline: none;
}

.prueba__estado-texto {
  margin: 0;
  font-size: 0.98rem;
  line-height: 1.5;
  color: var(--demo-color-texto-suave);
}

.prueba__estado-boton {
  margin-top: 4px;
}

.prueba__secundario {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 6px 4px;
  border: 0;
  background: transparent;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--demo-color-texto-suave);
  text-decoration: none;
  cursor: pointer;
}

.prueba__secundario .bi {
  color: #1faa59;
  font-size: 1.1em;
}

.prueba__secundario:hover {
  color: var(--demo-color-texto);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.prueba__secundario:focus-visible {
  outline: 3px solid var(--demo-color-azul);
  outline-offset: 2px;
  border-radius: 10px;
}

/* --------------------------------------------------- 2. Estamos armando tu sistema */
.prueba__armado {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: clamp(12px, 3vh, 36px) clamp(16px, 4vw, 48px) clamp(32px, 6vh, 72px);
}

.prueba__armado-cabeza {
  text-align: center;
  max-width: 720px;
  margin: 0 auto;
}

.prueba__titulo--armado:focus {
  outline: none;
}

.prueba__bajada--armado {
  margin-left: auto;
  margin-right: auto;
  max-width: 600px;
}

.prueba__armado-cuerpo {
  margin-top: clamp(24px, 4vh, 44px);
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(24px, 3vw, 40px);
  align-items: start;
}

.prueba__progreso-bloque {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* La escena: la ventana del sistema sobre un halo que gira despacio. */
.prueba__escena {
  position: relative;
  padding: clamp(14px, 2.5vw, 26px);
  border-radius: 24px;
  overflow: hidden;
  isolation: isolate;
}

.prueba__halo {
  position: absolute;
  inset: -40%;
  z-index: -1;
  background: conic-gradient(from 0deg, rgba(11, 132, 248, 0.22), rgba(58, 49, 252, 0.08), rgba(250, 126, 6, 0.1), rgba(11, 132, 248, 0.22));
  filter: blur(28px);
  animation: prueba-halo 14s linear infinite;
}

.prueba__escena--lista .prueba__halo {
  background: conic-gradient(from 0deg, rgba(22, 163, 74, 0.28), rgba(11, 132, 248, 0.14), rgba(22, 163, 74, 0.28));
}

.prueba__escena--fallida .prueba__halo {
  background: conic-gradient(from 0deg, rgba(198, 40, 40, 0.2), rgba(86, 96, 120, 0.1), rgba(198, 40, 40, 0.2));
  animation: none;
}

@keyframes prueba-halo {
  to { transform: rotate(360deg); }
}

.prueba__ventana {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid rgba(11, 132, 248, 0.25);
  background: #fff;
  box-shadow: 0 24px 50px -30px rgba(11, 132, 248, 0.6);
}

.prueba__ventana-barra {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(28, 35, 51, 0.08);
  background: #f2f6ff;
}

.prueba__punto {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(86, 96, 120, 0.25);
}

.prueba__ventana-titulo {
  margin-left: 10px;
  padding-right: 32px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--demo-color-texto-suave);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.prueba__ventana-cuerpo {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  min-height: 190px;
}

.prueba__ventana-menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 12px;
  border-right: 1px solid rgba(28, 35, 51, 0.08);
  background: #f8f9fc;
}

.prueba__menu-item {
  height: 10px;
  border-radius: 999px;
  background: rgba(86, 96, 120, 0.14);
  transition: background 400ms ease;
}

.prueba__menu-item--on {
  background: var(--demo-gradient-marca);
}

.prueba__modulos {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  padding: 14px;
}

.prueba__modulo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 68px;
  border-radius: 12px;
  border: 1px dashed rgba(86, 96, 120, 0.28);
  background: #fff;
  color: rgba(86, 96, 120, 0.45);
  font-size: 0.72rem;
  font-weight: 600;
  transform: scale(0.94);
  transition: transform 420ms cubic-bezier(0.2, 0.9, 0.3, 1.2), background 420ms ease, color 420ms ease, border-color 420ms ease;
}

.prueba__modulo .bi {
  font-size: 1.25rem;
}

.prueba__modulo--on {
  border: 1px solid rgba(11, 132, 248, 0.3);
  background:
    radial-gradient(120% 90% at 0% 0%, rgba(11, 132, 248, 0.18), transparent 60%),
    #f2f6ff;
  color: var(--demo-color-texto);
  transform: scale(1);
}

.prueba__modulo--on .bi {
  color: var(--demo-color-azul);
}

.prueba__modulo--actual {
  border-style: solid;
  border-color: rgba(11, 132, 248, 0.45);
  color: var(--demo-color-texto-suave);
  animation: prueba-latido 1.4s ease-in-out infinite;
}

@keyframes prueba-latido {
  0%, 100% { box-shadow: 0 0 0 0 rgba(11, 132, 248, 0); transform: scale(0.96); }
  50% { box-shadow: 0 0 0 6px rgba(11, 132, 248, 0.12); transform: scale(1); }
}

/* Una luz que barre la ventana mientras se arma. */
.prueba__barrido {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -40%;
  width: 40%;
  background: linear-gradient(100deg, transparent, rgba(11, 132, 248, 0.08), transparent);
  animation: prueba-barrido 2.6s ease-in-out infinite;
  pointer-events: none;
}

@keyframes prueba-barrido {
  to { left: 100%; }
}

/* El sello de «listo» / «falló», en la barra de la ventana, a la derecha: no pisa ningún
   módulo. */
.prueba__sello {
  position: absolute;
  right: 10px;
  top: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--prueba-ok);
  color: #fff;
  font-size: 1rem;
  box-shadow: 0 8px 18px -6px rgba(22, 163, 74, 0.6);
  animation: prueba-sello 500ms cubic-bezier(0.2, 0.9, 0.3, 1.3);
}

.prueba__sello--fallida {
  background: var(--prueba-error);
  box-shadow: 0 10px 24px -8px rgba(198, 40, 40, 0.6);
}

@keyframes prueba-sello {
  from { transform: scale(0.4); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* La barra de progreso. */
.prueba__barra-progreso {
  height: 10px;
  border-radius: 999px;
  background: rgba(86, 96, 120, 0.14);
  overflow: hidden;
}

.prueba__barra-relleno {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--demo-gradient-marca);
  transition: width 900ms ease;
}

.prueba__escena--lista + .prueba__barra-progreso .prueba__barra-relleno {
  background: var(--prueba-ok);
}

.prueba__etapa {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: clamp(1rem, 1.4vw, 1.08rem);
  font-weight: 600;
  color: var(--demo-color-texto);
}

.prueba__porcentaje {
  margin-left: auto;
  font-variant-numeric: tabular-nums;
  color: var(--demo-color-texto-suave);
  font-weight: 500;
}

.prueba__pasos {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
}

.prueba__paso {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  line-height: 1.4;
  color: var(--demo-color-texto-suave);
  transition: color 300ms ease;
}

.prueba__paso-icono {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1.5px solid rgba(86, 96, 120, 0.25);
  color: rgba(86, 96, 120, 0.6);
  font-size: 0.9rem;
  transition: background 300ms ease, color 300ms ease, border-color 300ms ease;
}

.prueba__paso--actual {
  color: var(--demo-color-texto);
}

.prueba__paso--actual .prueba__paso-icono {
  border-color: var(--demo-color-azul);
  color: var(--demo-color-azul);
  animation: prueba-latido 1.4s ease-in-out infinite;
}

.prueba__paso--hecho {
  color: var(--demo-color-texto);
}

.prueba__paso--hecho .prueba__paso-icono {
  border-color: transparent;
  background: var(--prueba-ok);
  color: #fff;
}

.prueba__aviso--estado {
  background: #eef4ff;
  color: #1f3f78;
}

.prueba__listo,
.prueba__fallida {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: clamp(18px, 2.5vw, 26px);
  text-align: center;
}

.prueba__entrar {
  width: 100%;
  max-width: 380px;
  font-size: 1.2rem;
}

.prueba__listo-nota {
  margin: 0;
  font-size: 0.9rem;
  color: var(--demo-color-texto-suave);
}

/* El video (o la carta) de Lucas. */
.prueba__video-bloque {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.prueba__video-rotulo {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--demo-color-texto);
}

.prueba__video-rotulo .bi {
  color: var(--demo-color-azul);
  font-size: 1.2rem;
}

.prueba__video {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: 18px;
  overflow: hidden;
  background: #04060b;
  box-shadow: 0 24px 50px -30px rgba(11, 132, 248, 0.6);
}

.prueba__video iframe,
.prueba__video video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}

.prueba__carta {
  margin: 0;
  padding: clamp(18px, 2.5vw, 26px);
  border-radius: 18px;
  border: 1px solid rgba(11, 132, 248, 0.25);
  background:
    radial-gradient(120% 90% at 0% 0%, rgba(11, 132, 248, 0.14), transparent 60%),
    #fff;
  font-size: 0.98rem;
  line-height: 1.6;
  color: var(--demo-color-texto);
}

.prueba__carta p {
  margin: 0 0 12px;
}

.prueba__carta footer {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--demo-color-texto-suave);
}

/* El pie. */
.prueba__pie {
  margin-top: auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 22px;
  padding: 16px 20px clamp(16px, 3vh, 28px);
  font-size: 0.82rem;
  color: var(--demo-color-texto-suave);
}

.prueba__pie-enlace {
  color: inherit;
  text-decoration: none;
}

.prueba__pie-enlace:hover,
.prueba__pie-enlace:focus-visible {
  color: var(--demo-color-texto);
  text-decoration: underline;
}

.visualmente-oculto {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* Tablet: el formulario centrado y angosto; el armado todavía en una columna. */
@media (min-width: 640px) {
  .prueba__tarjeta {
    max-width: 560px;
    margin: 0 auto;
  }

  .prueba__pasos {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* Escritorio: copy a la izquierda y formulario a la derecha; escena y video lado a lado. */
@media (min-width: 1024px) {
  .prueba__alta {
    grid-template-columns: minmax(0, 1fr) minmax(0, 480px);
    padding-top: clamp(24px, 5vh, 64px);
  }

  .prueba__tarjeta {
    max-width: none;
    margin: 0;
  }

  .prueba__tarjeta.prueba__estado--suelto {
    max-width: 560px;
    margin: 0 auto;
  }

  .prueba__armado-cuerpo {
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  }

  .prueba__pasos {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 767.98px) {
  .prueba__texto-largo {
    display: none;
  }

  .prueba__texto-corto {
    display: inline;
  }

  .prueba__modulos {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .prueba__ventana-cuerpo {
    grid-template-columns: 40px minmax(0, 1fr);
  }

  .prueba__porcentaje {
    flex: 0 0 auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .prueba__halo,
  .prueba__barrido,
  .prueba__modulo--actual,
  .prueba__paso--actual .prueba__paso-icono,
  .prueba__sello {
    animation: none;
  }

  .prueba__modulo,
  .prueba__barra-relleno {
    transition: none;
  }
}
</style>
