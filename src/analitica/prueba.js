/**
 * El alta de la prueba gratuita de 7 días desde la landing (misión `prueba-precios-landing`,
 * programa «Prueba gratuita de 7 días», 3/11/2026): todo lo que se puede decidir sin DOM ni Vue.
 *
 * La página (`views/Prueba.vue`) es la cara; acá vive la cuenta: la validación y normalización
 * de los datos, el body que viaja al admin (contrato C6 del plan del programa), la interpretación
 * de cada respuesta del alta y del estado, las etapas que dibuja la animación, y el MOCK que
 * simula al admin para construir y mirar la página sin un admin que tenga el endpoint.
 *
 * El contrato C6, en corto:
 *
 *   POST {admin}/landing/prueba/alta
 *     body  { nombre, telefono, email, empresa, password, rubro?, utm_*?, fbp?, fbc?,
 *             event_source_url?, sitio_web (honeypot, vacío), abierto_hace_ms }
 *     201   { uuid, meta_eventos?: [{ nombre, event_id }] }
 *     409   { code: ya_es_cliente | ya_tiene_prueba | telefono_invalido, mensaje? }
 *     422   { errores: { campo: [texto] } }   (o `errors`, la forma de Laravel)
 *     429 / 503 / otro
 *   GET  {admin}/landing/prueba/{uuid}/estado
 *     200   { estado: creando | lista | fallida, etapa, progreso (0-100), url_ingreso? (solo con
 *             lista), video_url?, whatsapp_soporte?, mensaje? }
 *
 * 🔴 Sin `import.meta.env` a propósito: este módulo se importa tal cual desde
 * `tests/prueba.test.js` con `node --test`, que no pasa por Vite. Las URLs y el interruptor del
 * mock llegan por parámetro desde la vista (que los lee de `config.js` y del entorno).
 */

/* Con extensión: `node --test` (sin Vite) no la resuelve solo. */
import { normalizar_whatsapp, correo_valido } from './agenda-demo.js'

/** Topes de espera: el alta crea el lead y la instancia (lento); el estado es una lectura. */
export const TIEMPO_ALTA_MS = 20000
export const TIEMPO_ESTADO_MS = 8000

/** Cada cuánto se consulta el estado mientras se arma el sistema. */
export const INTERVALO_ESTADO_MS = 3000

/**
 * Cuántas consultas seguidas pueden fallar (red, 5xx) antes de mostrarle al visitante que algo
 * anda mal. Se sigue consultando igual: la instancia se arma del lado del admin y una red caída
 * de este lado no la frena. 20 × 3 s = un minuto.
 */
export const FALLOS_SEGUIDOS_PARA_AVISAR = 20

/** La única regla de la contraseña (Lucas, 3/11/2026): al menos 8 caracteres. Nada más. */
export const PASSWORD_MINIMO = 8

/** Eventos del píxel que el alta puede disparar. Cualquier otro se ignora. */
export const EVENTOS_META_DEL_ALTA = ['Lead', 'StartTrial']

/**
 * Los 14 rubros de `demo_industrias.json` de empresa-api (`origin/develop`, 3/11/2026), con el
 * slug que recibe el demo setup y la etiqueta (`label`) tal cual está en el JSON. El orden es el
 * del archivo. Es opcional: sin rubro, el sistema se siembra con ferretería.
 */
export const RUBROS_PRUEBA = [
  { slug: 'ferreteria', nombre: 'Ferretería' },
  { slug: 'indumentaria', nombre: 'Indumentaria' },
  { slug: 'autopartes', nombre: 'Autopartes' },
  { slug: 'jugueteria', nombre: 'Juguetería' },
  { slug: 'construccion', nombre: 'Construcción y materiales' },
  { slug: 'bebidas', nombre: 'Bebidas y vinoteca' },
  { slug: 'mascotas', nombre: 'Mascotas' },
  { slug: 'limpieza', nombre: 'Limpieza' },
  { slug: 'belleza', nombre: 'Belleza y perfumería' },
  { slug: 'almacen', nombre: 'Almacén y alimentos' },
  { slug: 'pesca', nombre: 'Pesca y camping' },
  { slug: 'hogar', nombre: 'Hogar y bazar' },
  { slug: 'tecnologia', nombre: 'Tecnología' },
  { slug: 'distribuidora', nombre: 'Distribuidora y comercio general' },
]

const SLUGS_RUBRO = RUBROS_PRUEBA.map(function (rubro) { return rubro.slug })

/** Mismo formato que valida el admin para `fbp`/`fbc` (contrato de la agenda, §3). */
const RE_COOKIE_META = /^fb\.\d\.\d+\.[A-Za-z0-9_\-.]+$/
const RE_UUID = /^[A-Za-z0-9_-]{8,64}$/
const RE_EVENT_ID = /^[A-Za-z0-9_\-.:]{1,120}$/

/**
 * Las etapas que dibuja la animación de «estamos armando tu sistema». El admin manda su propio
 * `etapa` (texto corto) y `progreso` (0-100); estas son las PINTADAS, que avanzan con el
 * progreso. `umbral` es el progreso desde el que la etapa se da por hecha.
 *
 * Seis, porque son las seis cosas que un negocio entiende que se le están armando. Los
 * nombres hablan del negocio, no del servidor (nada de «DNS», «base de datos», «SSL»).
 */
export const ETAPAS_VISUALES = [
  { clave: 'direccion', icono: 'bi-globe2', texto: 'Reservando la dirección de tu sistema', umbral: 15 },
  { clave: 'datos', icono: 'bi-hdd-stack', texto: 'Creando tu espacio de datos', umbral: 35 },
  { clave: 'catalogo', icono: 'bi-box-seam', texto: 'Cargando productos de ejemplo de tu rubro', umbral: 55 },
  { clave: 'tienda', icono: 'bi-bag-check', texto: 'Armando tu tienda online', umbral: 70 },
  { clave: 'agentes', icono: 'bi-stars', texto: 'Encendiendo los agentes de IA', umbral: 85 },
  { clave: 'acceso', icono: 'bi-shield-check', texto: 'Asegurando tu acceso', umbral: 100 },
]

/** Los módulos que la escena va «encendiendo» en la ventana del sistema. */
export const MODULOS_ESCENA = [
  { clave: 'ventas', icono: 'bi-receipt', texto: 'Ventas' },
  { clave: 'stock', icono: 'bi-boxes', texto: 'Stock' },
  { clave: 'clientes', icono: 'bi-people', texto: 'Clientes' },
  { clave: 'compras', icono: 'bi-cart3', texto: 'Compras' },
  { clave: 'arca', icono: 'bi-file-earmark-check', texto: 'ARCA' },
  { clave: 'caja', icono: 'bi-cash-stack', texto: 'Caja' },
  { clave: 'tienda', icono: 'bi-shop', texto: 'Tienda' },
  { clave: 'agentes', icono: 'bi-stars', texto: 'Agentes' },
]

/**
 * El texto del video de bienvenida (guion §4b de `00-precios-contagram-y-guion.md`), para el
 * recuadro que ocupa el lugar del video mientras el admin no manda `video_url`.
 */
export const GUION_BIENVENIDA = [
  'Hola, soy Lucas, fundador de ComercioCity. Esto que estás viendo es el sistema completo, el mismo que usan nuestros clientes: con la tienda online y los agentes de inteligencia artificial andando. Lo tenés gratis siete días para que lo pruebes con tu negocio de verdad.',
  'Los productos que ves son de ejemplo: cuando importes tu Excel, se reemplazan por los tuyos. Si no tenés Excel, mandale a Martín por WhatsApp el PDF o la lista de tu proveedor y te la cargamos nosotros, sin costo.',
  'Martín te va a escribir en un rato por el número de soporte; preguntale lo que necesites. Y antes de que termine la prueba te llama Tomás, de nuestro equipo, para ver cómo seguimos. Bienvenido.',
]

// ---------------------------------------------------------------------------------------
// Validación de los datos
// ---------------------------------------------------------------------------------------

/**
 * @param {string} texto
 * @returns {boolean}
 */
export function uuid_valido(texto) {
  return RE_UUID.test(String(texto || ''))
}

/**
 * Los errores del formulario, por campo, con el texto que ve el visitante. Vacío = se puede
 * mandar. El rubro es opcional: solo da error si viene con un slug que no existe.
 *
 * @param {{nombre: string, telefono: string, email: string, empresa: string, password: string,
 *   rubro: string}} datos
 * @returns {Object<string, string>}
 */
export function validar_alta(datos) {
  const d = datos || {}
  const errores = {}
  const nombre = String(d.nombre || '').trim()
  if (nombre.length < 2) {
    errores.nombre = 'Escribí tu nombre.'
  } else if (nombre.length > 80) {
    errores.nombre = 'El nombre puede tener hasta 80 letras.'
  }
  if (!normalizar_whatsapp(d.telefono)) {
    errores.telefono = String(d.telefono || '').trim()
      ? 'Revisá el número: con característica, sin 0 ni 15 (por ejemplo, 3444 622139).'
      : 'Escribí tu WhatsApp.'
  }
  if (!String(d.email || '').trim()) {
    errores.email = 'Escribí tu correo.'
  } else if (!correo_valido(d.email)) {
    errores.email = 'Revisá el correo.'
  }
  const empresa = String(d.empresa || '').trim()
  if (empresa.length < 2) {
    errores.empresa = 'Escribí el nombre de tu negocio.'
  } else if (empresa.length > 80) {
    errores.empresa = 'El nombre del negocio puede tener hasta 80 letras.'
  }
  const password = String(d.password === undefined || d.password === null ? '' : d.password)
  if (!password) {
    errores.password = 'Elegí una contraseña.'
  } else if (password.length < PASSWORD_MINIMO) {
    errores.password = 'La contraseña tiene que tener al menos ' + PASSWORD_MINIMO + ' caracteres.'
  } else if (password.length > 120) {
    errores.password = 'La contraseña puede tener hasta 120 caracteres.'
  }
  if (d.rubro && SLUGS_RUBRO.indexOf(d.rubro) === -1) {
    errores.rubro = 'Elegí un rubro de la lista, o dejalo vacío.'
  }
  return errores
}

// ---------------------------------------------------------------------------------------
// El body del alta
// ---------------------------------------------------------------------------------------

/**
 * El body del POST del alta con las claves del contrato C6. Lo opcional vacío no viaja. Los
 * parámetros de campaña van como `utm_*` sueltos (así los pide el contrato), solo los que la
 * visita trajo de verdad.
 *
 * @param {object} datos
 * @param {string} datos.nombre
 * @param {string} datos.telefono Como lo escribió el visitante.
 * @param {string} datos.email
 * @param {string} datos.empresa
 * @param {string} datos.password Tal cual: ni se recorta ni se normaliza.
 * @param {string} [datos.rubro]
 * @param {object} [datos.atribucion] `obtener_atribucion()`.
 * @param {string|null} [datos.fbp]
 * @param {string|null} [datos.fbc]
 * @param {string|null} [datos.event_source_url]
 * @param {string} [datos.sitio_web] El honeypot, tal cual quedó.
 * @param {number} datos.abierto_hace_ms
 * @returns {object}
 */
export function armar_body_alta(datos) {
  const d = datos || {}
  const normalizado = normalizar_whatsapp(d.telefono)
  const body = {
    nombre: String(d.nombre || '').trim().replace(/\s+/g, ' '),
    /* El número ya normalizado y con el +549: el admin lo vuelve a normalizar, pero así no
       depende de adivinar el 15 de la misma forma que acá. */
    telefono: normalizado ? '+549' + normalizado : String(d.telefono || '').trim(),
    email: String(d.email || '').trim(),
    empresa: String(d.empresa || '').trim().replace(/\s+/g, ' '),
    password: String(d.password === undefined || d.password === null ? '' : d.password),
    sitio_web: String(d.sitio_web || ''),
    abierto_hace_ms: Math.max(0, Math.round(Number(d.abierto_hace_ms) || 0)),
  }
  if (d.rubro && SLUGS_RUBRO.indexOf(d.rubro) !== -1) {
    body.rubro = d.rubro
  }

  Object.keys(d.atribucion || {}).forEach(function (clave) {
    const valor = d.atribucion[clave]
    if (clave.indexOf('utm_') === 0 && typeof valor === 'string' && valor) {
      body[clave] = valor
    }
  })

  ;['fbp', 'fbc'].forEach(function (clave) {
    if (typeof d[clave] === 'string' && RE_COOKIE_META.test(d[clave]) && d[clave].length <= 255) {
      body[clave] = d[clave]
    }
  })
  if (typeof d.event_source_url === 'string' && d.event_source_url) {
    body.event_source_url = d.event_source_url
  }
  return body
}

// ---------------------------------------------------------------------------------------
// Interpretación de las respuestas
// ---------------------------------------------------------------------------------------

/** Mensajes de respaldo si el 409 no trae `mensaje` (el del admin manda). */
export const MENSAJES_409 = {
  ya_es_cliente: 'Este WhatsApp ya es de un cliente de ComercioCity. Escribinos y te ayudamos a entrar.',
  ya_tiene_prueba: 'Ya hay una prueba creada con este WhatsApp. Revisá tu correo o escribinos y seguimos desde ahí.',
  telefono_invalido: 'Revisá el número: tiene que ser un celular argentino, con característica, sin 0 ni 15.',
}

/** Campos del admin → campos del formulario. */
const CAMPO_DEL_FORMULARIO = {
  nombre: 'nombre',
  telefono: 'telefono',
  whatsapp: 'telefono',
  email: 'email',
  empresa: 'empresa',
  password: 'password',
  rubro: 'rubro',
}

/**
 * Los eventos del píxel con los que se dispara el alta. Si el admin manda `meta_eventos` con
 * ids válidos, esos; si no, `Lead` y `StartTrial` con un id derivado del uuid (`prueba:<uuid>:Lead`),
 * que es el que el admin tiene que usar en la API de Conversiones para que Meta deduplique.
 *
 * @param {string} uuid
 * @param {*} meta_eventos Lo que vino en el 201.
 * @returns {Array<{nombre: string, event_id: string}>}
 */
export function eventos_meta_del_alta(uuid, meta_eventos) {
  const del_admin = (Array.isArray(meta_eventos) ? meta_eventos : []).filter(function (e) {
    return e && EVENTOS_META_DEL_ALTA.indexOf(e.nombre) !== -1 &&
      typeof e.event_id === 'string' && RE_EVENT_ID.test(e.event_id)
  }).map(function (e) {
    return { nombre: e.nombre, event_id: e.event_id }
  })
  if (del_admin.length) {
    return del_admin
  }
  if (!uuid_valido(uuid)) {
    return []
  }
  return EVENTOS_META_DEL_ALTA.map(function (nombre) {
    return { nombre: nombre, event_id: 'prueba:' + uuid + ':' + nombre }
  })
}

/**
 * La respuesta del alta (POST), traducida a lo que tiene que hacer la página.
 *
 * | status | tipo                                                              |
 * |--------|-------------------------------------------------------------------|
 * | 201    | `creada` (uuid + meta_eventos)                                    |
 * | 422    | `campos` (errores por campo) o `invalida` (genérico)               |
 * | 409    | `ya_es_cliente` / `ya_tiene_prueba` / `telefono_invalido` (campo)  |
 * | 429    | `limite`                                                          |
 * | 503    | `reintentar`                                                      |
 * | otro   | `error`                                                           |
 *
 * @param {number} status
 * @param {*} cuerpo
 * @returns {object}
 */
export function interpretar_alta(status, cuerpo) {
  const c = cuerpo && typeof cuerpo === 'object' ? cuerpo : {}
  const mensaje = typeof c.mensaje === 'string' && c.mensaje.trim() ? c.mensaje.trim() : ''

  if (status === 201) {
    if (!uuid_valido(c.uuid)) {
      /* Un 201 sin uuid no se puede seguir: se trata como error del lado nuestro. */
      return { tipo: 'error', mensaje: '' }
    }
    return {
      tipo: 'creada',
      uuid: String(c.uuid),
      meta_eventos: eventos_meta_del_alta(String(c.uuid), c.meta_eventos),
    }
  }

  if (status === 422) {
    const errores = {}
    const lista = c.errores && typeof c.errores === 'object' ? c.errores
      : (c.errors && typeof c.errors === 'object' ? c.errors : null)
    if (lista) {
      Object.keys(lista).forEach(function (campo) {
        const destino = CAMPO_DEL_FORMULARIO[campo]
        const valor = lista[campo]
        const texto = Array.isArray(valor) ? valor[0] : valor
        if (destino && !errores[destino] && typeof texto === 'string' && texto) {
          errores[destino] = texto
        }
      })
    }
    return Object.keys(errores).length
      ? { tipo: 'campos', errores: errores, mensaje: mensaje }
      : { tipo: 'invalida', mensaje: mensaje }
  }

  if (status === 409) {
    const code = typeof c.code === 'string' ? c.code : (typeof c.codigo === 'string' ? c.codigo : '')
    if (MENSAJES_409[code]) {
      return { tipo: code, mensaje: mensaje || MENSAJES_409[code] }
    }
    return { tipo: 'error', mensaje: mensaje }
  }

  if (status === 429) {
    return mensaje ? { tipo: 'limite', mensaje: mensaje } : { tipo: 'limite' }
  }
  if (status === 503) {
    return { tipo: 'reintentar', mensaje: mensaje }
  }
  return { tipo: 'error', mensaje: '' }
}

/**
 * Si el admin manda una URL utilizable (https, o http para probar en local).
 *
 * @param {*} url
 * @returns {string|null}
 */
function url_utilizable(url) {
  return typeof url === 'string' && /^https?:\/\/[^\s]+$/.test(url) && url.length <= 500 ? url : null
}

/**
 * Un número de WhatsApp de soporte del estado, a enlace `wa.me`. Acepta «+54 9 3444 544199»,
 * «5493444544199» o ya un `https://wa.me/...`; cualquier otra cosa, null.
 *
 * @param {*} valor
 * @returns {string|null}
 */
export function enlace_whatsapp_soporte(valor) {
  if (typeof valor !== 'string' || !valor.trim()) {
    return null
  }
  const texto = valor.trim()
  if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(texto)) {
    return texto.length <= 500 ? texto : null
  }
  const digitos = texto.replace(/\D/g, '')
  return /^\d{10,15}$/.test(digitos) ? 'https://wa.me/' + digitos : null
}

/**
 * La respuesta del estado (GET), traducida.
 *
 * | status | tipo                                                              |
 * |--------|-------------------------------------------------------------------|
 * | 200    | `estado` (creando / lista / fallida, con lo que vino)             |
 * | 404    | `no_encontrada` (uuid que el admin no conoce)                     |
 * | otro   | `error` (se sigue consultando)                                    |
 *
 * Un 200 con un `estado` que no es ninguno de los tres se lee como `creando`: el admin puede
 * sumar estados intermedios y la página no tiene por qué romperse.
 *
 * @param {number} status
 * @param {*} cuerpo
 * @returns {object}
 */
export function interpretar_estado(status, cuerpo) {
  if (status === 404) {
    return { tipo: 'no_encontrada' }
  }
  if (status !== 200 || !cuerpo || typeof cuerpo !== 'object') {
    return { tipo: 'error' }
  }
  const c = cuerpo
  const estado = c.estado === 'lista' || c.estado === 'fallida' ? c.estado : 'creando'
  let progreso = Number(c.progreso)
  if (!Number.isFinite(progreso)) {
    progreso = 0
  }
  progreso = Math.max(0, Math.min(100, Math.round(progreso)))
  if (estado === 'lista') {
    progreso = 100
  }
  const url_ingreso = estado === 'lista' ? url_utilizable(c.url_ingreso) : null
  return {
    tipo: 'estado',
    estado: estado,
    etapa: typeof c.etapa === 'string' ? c.etapa.trim().slice(0, 120) : '',
    progreso: progreso,
    url_ingreso: url_ingreso,
    video_url: url_utilizable(c.video_url),
    whatsapp_soporte: enlace_whatsapp_soporte(c.whatsapp_soporte),
    mensaje: typeof c.mensaje === 'string' ? c.mensaje.trim().slice(0, 300) : '',
  }
}

/**
 * Cuántas etapas pintadas están hechas para este progreso. La que sigue es «la actual».
 *
 * @param {number} progreso 0-100
 * @returns {number} 0..ETAPAS_VISUALES.length
 */
export function etapas_hechas(progreso) {
  const p = Number(progreso) || 0
  let hechas = 0
  ETAPAS_VISUALES.forEach(function (etapa) {
    if (p >= etapa.umbral) {
      hechas++
    }
  })
  return hechas
}

/**
 * Qué reproductor necesita el video: `youtube` (con la URL de embed), `vimeo` (ídem) o
 * `archivo` (un .mp4/.webm/.m3u8 o cualquier otra cosa, que va a un <video>).
 *
 * @param {string|null} url
 * @returns {{tipo: 'youtube'|'vimeo'|'archivo', src: string}|null}
 */
export function reproductor_de_video(url) {
  const limpia = url_utilizable(url)
  if (!limpia) {
    return null
  }
  const youtube = limpia.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/)
  if (youtube) {
    return { tipo: 'youtube', src: 'https://www.youtube-nocookie.com/embed/' + youtube[1] + '?rel=0' }
  }
  const vimeo = limpia.match(/vimeo\.com\/(?:video\/)?(\d{5,})/)
  if (vimeo) {
    return { tipo: 'vimeo', src: 'https://player.vimeo.com/video/' + vimeo[1] + '?dnt=1' }
  }
  return { tipo: 'archivo', src: limpia }
}

// ---------------------------------------------------------------------------------------
// El mock del admin (VITE_PRUEBA_MOCK=1)
// ---------------------------------------------------------------------------------------

/**
 * Las etapas que «dice» el admin falso, en orden, con el momento (en fracción del total) en que
 * arranca cada una. Textos cortos, como pide C6.
 */
const ETAPAS_MOCK = [
  [0, 'Reservando tu dirección'],
  [0.15, 'Creando tu base de datos'],
  [0.35, 'Cargando los productos de ejemplo'],
  [0.55, 'Armando tu tienda online'],
  [0.7, 'Encendiendo los agentes de IA'],
  [0.85, 'Asegurando la conexión'],
]

/**
 * Un `fetcher` con la firma de `fetch` que hace de admin: responde el alta y el estado según el
 * contrato C6, con el tiempo simulado. Sirve para construir y mirar la página sin admin, y para
 * probar los caminos raros sin tocar un servidor:
 *
 *   - teléfono terminado en `000000` → 409 `ya_es_cliente`; en `000001` → 409 `ya_tiene_prueba`;
 *     en `000002` → 409 `telefono_invalido`.
 *   - correo que empieza con `422@` → 422 con errores en `email` y `empresa`.
 *   - correo que empieza con `429@` → 429; con `503@` → 503; con `500@` → 500.
 *   - empresa que contiene «falla» → la instancia llega al 60 % y da `fallida`.
 *   - uuid que el mock no creó → 404.
 *
 * @param {object} [opciones]
 * @param {number} [opciones.duracion_ms] Cuánto tarda en estar lista (default 45 s).
 * @param {string} [opciones.video_url] Lo que manda en `video_url` (default: nada).
 * @param {string} [opciones.url_ingreso] (default: una URL de ejemplo).
 * @param {number} [opciones.demora_ms] Latencia simulada de cada respuesta.
 * @param {Function} [opciones.ahora] Reloj (para los tests).
 * @returns {Function} fetcher(url, opciones) → Promise<{status, json()}>
 */
export function crear_mock(opciones) {
  const o = opciones || {}
  const duracion = Number(o.duracion_ms) > 0 ? Number(o.duracion_ms) : 45000
  const demora = Number(o.demora_ms) >= 0 ? Number(o.demora_ms) : 500
  const ahora = typeof o.ahora === 'function' ? o.ahora : Date.now
  const pruebas = {}
  let contador = 0

  function respuesta(status, cuerpo) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve({
          status: status,
          ok: status >= 200 && status < 300,
          json: function () { return Promise.resolve(cuerpo) },
        })
      }, demora)
    })
  }

  function alta(body) {
    const b = body || {}
    const telefono = String(b.telefono || '').replace(/\D/g, '')
    const email = String(b.email || '')
    if (/000000$/.test(telefono)) return respuesta(409, { code: 'ya_es_cliente' })
    if (/000001$/.test(telefono)) return respuesta(409, { code: 'ya_tiene_prueba' })
    if (/000002$/.test(telefono)) return respuesta(409, { code: 'telefono_invalido' })
    if (email.indexOf('422@') === 0) {
      return respuesta(422, { errores: { email: ['Ese correo ya tiene una prueba.'], empresa: ['Ya existe un negocio con ese nombre.'] } })
    }
    if (email.indexOf('429@') === 0) return respuesta(429, {})
    if (email.indexOf('503@') === 0) return respuesta(503, {})
    if (email.indexOf('500@') === 0) return respuesta(500, {})
    if (String(b.password || '').length < PASSWORD_MINIMO) {
      return respuesta(422, { errores: { password: ['La contraseña tiene que tener al menos 8 caracteres.'] } })
    }
    contador++
    const uuid = 'mock-' + contador + '-' + ahora().toString(36)
    pruebas[uuid] = {
      creada_en: ahora(),
      empresa: String(b.empresa || ''),
      falla: /falla/i.test(String(b.empresa || '')),
    }
    return respuesta(201, { uuid: uuid })
  }

  function estado(uuid) {
    const prueba = pruebas[uuid]
    if (!prueba) {
      return respuesta(404, { message: 'Not Found' })
    }
    const fraccion = Math.min(1, (ahora() - prueba.creada_en) / duracion)
    const progreso = Math.round(fraccion * 100)
    let etapa = ETAPAS_MOCK[0][1]
    ETAPAS_MOCK.forEach(function (par) {
      if (fraccion >= par[0]) etapa = par[1]
    })
    if (prueba.falla && progreso >= 60) {
      return respuesta(200, {
        estado: 'fallida',
        etapa: 'No se pudo terminar',
        progreso: 60,
        mensaje: 'No pudimos terminar de armar tu sistema. Ya nos avisó solo; escribinos y lo resolvemos.',
        whatsapp_soporte: '+54 9 3444 544199',
        video_url: o.video_url || '',
      })
    }
    if (fraccion >= 1) {
      return respuesta(200, {
        estado: 'lista',
        etapa: 'Tu sistema está listo',
        progreso: 100,
        url_ingreso: o.url_ingreso || 'https://mi-negocio.comerciocity.com/demo/ingreso?t=mock',
        video_url: o.video_url || '',
      })
    }
    return respuesta(200, { estado: 'creando', etapa: etapa, progreso: progreso, video_url: o.video_url || '' })
  }

  return function fetcher(url, opciones_pedido) {
    const u = String(url || '')
    const metodo = (opciones_pedido && opciones_pedido.method) || 'GET'
    if (metodo === 'POST' && /\/landing\/prueba\/alta\/?$/.test(u)) {
      let body = {}
      try { body = JSON.parse((opciones_pedido && opciones_pedido.body) || '{}') } catch (_) { /* vacío */ }
      return alta(body)
    }
    const m = u.match(/\/landing\/prueba\/([^/]+)\/estado\/?$/)
    if (metodo === 'GET' && m) {
      return estado(decodeURIComponent(m[1]))
    }
    return respuesta(404, { message: 'Not Found' })
  }
}
