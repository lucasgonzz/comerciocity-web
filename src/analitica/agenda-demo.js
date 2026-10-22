/**
 * La agenda de la demo desde la landing: todo lo que se puede decidir sin DOM ni Vue.
 *
 * El modal (`components/recorrido/AgendaDemoModal.vue`) es la cara; acá vive la cuenta:
 * las etiquetas de los días, la validación y normalización de los datos, el body que viaja
 * al admin, la lectura de las cookies del píxel y la interpretación de cada respuesta del
 * contrato (plan de la misión `demo-autogestionada-landing`, §3).
 *
 * 🔴 Sin `import.meta.env` a propósito: este módulo se importa tal cual desde
 * `tests/agenda-demo.test.js` con `node --test`, que no pasa por Vite. Las URLs llegan por
 * parámetro desde `config.js`.
 */

/** Zona en la que el admin calcula los turnos. «Hoy» y «Mañana» se cuentan en esta zona. */
export const ZONA_AGENDA = 'America/Argentina/Buenos_Aires'

/** Topes de espera: los turnos se piden al abrir (rápido) y la reserva manda mail y demás. */
export const TIEMPO_TURNOS_MS = 8000
export const TIEMPO_RESERVA_MS = 15000

/**
 * El admin rechaza (422 genérico) una reserva enviada antes de 2500 ms de abierto el modal
 * (D13: los robots completan en el acto). El modal espera hasta este piso antes de mandar,
 * con un margen sobre el del admin.
 */
export const PISO_ABIERTO_MS = 2600

/** Eventos del píxel que la reserva puede disparar (D8/D12). Cualquier otro se ignora. */
export const EVENTOS_META_DE_RESERVA = ['Lead', 'Schedule']

/**
 * Los 14 rubros de la experiencia, con el slug de `DemoIndustriaCatalogo` del admin. El
 * orden es el del selector. Si el admin agrega uno, se agrega acá: el admin valida `in:` y
 * un slug que no conoce vuelve 422.
 */
export const RUBROS = [
  { slug: 'ferreteria', nombre: 'Ferretería y herrajes' },
  { slug: 'indumentaria', nombre: 'Indumentaria y accesorios' },
  { slug: 'autopartes', nombre: 'Autopartes y repuestos' },
  { slug: 'jugueteria', nombre: 'Juguetería' },
  { slug: 'construccion', nombre: 'Materiales de construcción' },
  { slug: 'bebidas', nombre: 'Bebidas y vinoteca' },
  { slug: 'mascotas', nombre: 'Mascotas' },
  { slug: 'limpieza', nombre: 'Limpieza y descartables' },
  { slug: 'belleza', nombre: 'Belleza y productos capilares' },
  { slug: 'almacen', nombre: 'Almacén, kiosco y dietética' },
  { slug: 'pesca', nombre: 'Pesca y aire libre' },
  { slug: 'hogar', nombre: 'Hogar y electrodomésticos' },
  { slug: 'tecnologia', nombre: 'Tecnología e impresión 3D' },
  { slug: 'distribuidora', nombre: 'Distribuidora y comercio general' },
]

const SLUGS_RUBRO = RUBROS.map(function (rubro) { return rubro.slug })
const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DIAS_LARGOS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const RE_FECHA = /^\d{4}-\d{2}-\d{2}$/
const RE_HORA = /^([01]\d|2[0-3]):[0-5]\d$/
/** Mismo formato que valida el admin para `fbp`/`fbc` (contrato §3). */
const RE_COOKIE_META = /^fb\.\d\.\d+\.[A-Za-z0-9_\-.]+$/
/** Hosts que el admin acepta en `event_source_url`. Desde otro host el campo no viaja. */
const HOSTS_LANDING = ['comerciocity.com', 'www.comerciocity.com']

// ---------------------------------------------------------------------------------------
// URLs
// ---------------------------------------------------------------------------------------

/**
 * Une la base del admin con una ruta sin duplicar ni perder barras.
 *
 * @param {string} base p.ej. `https://api-admin.comerciocity.com/api`
 * @param {string} ruta p.ej. `/landing/agenda/turnos`
 * @returns {string}
 */
export function unir_url(base, ruta) {
  const limpia = String(base || '').trim().replace(/\/+$/, '')
  return limpia + '/' + String(ruta || '').replace(/^\/+/, '')
}

// ---------------------------------------------------------------------------------------
// Fechas y etiquetas
// ---------------------------------------------------------------------------------------

/**
 * La fecha calendario (`YYYY-MM-DD`) de un instante en una zona horaria. Es lo que decide
 * si un día es «Hoy»: a las 23:30 de Argentina, en UTC ya es mañana.
 *
 * @param {number|Date} ahora
 * @param {string} [zona]
 * @returns {string}
 */
export function fecha_en_zona(ahora, zona) {
  const formato = new Intl.DateTimeFormat('en-CA', {
    timeZone: zona || ZONA_AGENDA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const partes = {}
  formato.formatToParts(new Date(ahora)).forEach(function (parte) {
    partes[parte.type] = parte.value
  })
  return partes.year + '-' + partes.month + '-' + partes.day
}

/**
 * @param {string} fecha `YYYY-MM-DD`
 * @param {number} dias
 * @returns {string}
 */
export function sumar_dias(fecha, dias) {
  const d = new Date(fecha + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString().slice(0, 10)
}

/**
 * «Vie 24/10» a partir de la fecha. Mediodía UTC: ningún huso corre el día.
 *
 * @param {string} fecha `YYYY-MM-DD`
 * @returns {{ corta: string, nombre: string, dia_mes: string }}
 */
function partes_de_fecha(fecha) {
  const d = new Date(fecha + 'T12:00:00Z')
  const dia_mes = String(d.getUTCDate()).padStart(2, '0') + '/' +
    String(d.getUTCMonth() + 1).padStart(2, '0')
  return {
    corta: DIAS_CORTOS[d.getUTCDay()] + ' ' + dia_mes,
    nombre: DIAS_LARGOS[d.getUTCDay()],
    dia_mes: dia_mes,
  }
}

/**
 * La etiqueta de un chip de día: «Hoy» y «Mañana» con la fecha chica abajo; el resto,
 * «Vie 24/10» solo.
 *
 * @param {string} fecha `YYYY-MM-DD`
 * @param {string} hoy `YYYY-MM-DD` en la zona de la agenda.
 * @returns {{ titulo: string, detalle: string, accesible: string }}
 */
export function etiqueta_dia(fecha, hoy) {
  const partes = partes_de_fecha(fecha)
  if (fecha === hoy) {
    return { titulo: 'Hoy', detalle: partes.corta, accesible: 'Hoy, ' + partes.nombre + ' ' + partes.dia_mes }
  }
  if (fecha === sumar_dias(hoy, 1)) {
    return { titulo: 'Mañana', detalle: partes.corta, accesible: 'Mañana, ' + partes.nombre + ' ' + partes.dia_mes }
  }
  return { titulo: partes.corta, detalle: '', accesible: partes.nombre + ' ' + partes.dia_mes }
}

/**
 * «jueves 23/10 de 15:00 a 17:00». El admin manda su propio `turno.texto` en el 201; esto es
 * el respaldo si no viniera, y el texto del resumen antes de confirmar.
 *
 * @param {string} fecha
 * @param {string} hora
 * @param {string} hasta
 * @returns {string}
 */
export function texto_turno(fecha, hora, hasta) {
  if (!RE_FECHA.test(fecha || '') || !RE_HORA.test(hora || '')) {
    return ''
  }
  const partes = partes_de_fecha(fecha)
  return partes.nombre + ' ' + partes.dia_mes + ' de ' + hora + (RE_HORA.test(hasta || '') ? ' a ' + hasta : '')
}

/**
 * Pasa los `dias` del admin (200 de turnos, o `turnos` del 409 `turno_tomado`) a lo que
 * pinta el modal. Descarta lo que no tiene la forma del contrato en vez de romper, ordena
 * por fecha y hora, y saca los días que se quedan sin horarios.
 *
 * @param {*} dias
 * @param {string} hoy `YYYY-MM-DD` en la zona de la agenda.
 * @returns {Array<{fecha: string, titulo: string, detalle: string, accesible: string,
 *   horarios: Array<{hora: string, hasta: string, texto: string}>}>}
 */
export function normalizar_dias(dias, hoy) {
  if (!Array.isArray(dias)) {
    return []
  }
  const vistos = {}
  const resultado = []
  dias.forEach(function (dia) {
    if (!dia || typeof dia !== 'object' || !RE_FECHA.test(dia.fecha || '') || vistos[dia.fecha]) {
      return
    }
    const horas = {}
    const horarios = (Array.isArray(dia.horarios) ? dia.horarios : [])
      .filter(function (h) {
        if (!h || !RE_HORA.test(h.hora || '') || horas[h.hora]) {
          return false
        }
        horas[h.hora] = true
        return true
      })
      .map(function (h) {
        const hasta = RE_HORA.test(h.hasta || '') ? h.hasta : ''
        return { hora: h.hora, hasta: hasta, texto: hasta ? h.hora + ' a ' + hasta : h.hora }
      })
      .sort(function (a, b) { return a.hora < b.hora ? -1 : a.hora > b.hora ? 1 : 0 })
    if (!horarios.length) {
      return
    }
    vistos[dia.fecha] = true
    resultado.push(Object.assign({ fecha: dia.fecha, horarios: horarios }, etiqueta_dia(dia.fecha, hoy)))
  })
  return resultado.sort(function (a, b) { return a.fecha < b.fecha ? -1 : 1 })
}

/**
 * Los horarios de un día partidos en franjas, para que en el teléfono la lista se lea
 * (con paso de 60 min son unos 12 chips por día). Mañana: antes de las 12; Tarde: de 12
 * a antes de las 19; Noche: desde las 19. Solo viajan las franjas con horarios, en orden.
 *
 * @param {Array<{hora: string}>} horarios Ya normalizados (ver `normalizar_dias`).
 * @returns {Array<{clave: string, titulo: string, horarios: Array}>}
 */
export function agrupar_horarios(horarios) {
  const franjas = [
    { clave: 'manana', titulo: 'Mañana', horarios: [] },
    { clave: 'tarde', titulo: 'Tarde', horarios: [] },
    { clave: 'noche', titulo: 'Noche', horarios: [] },
  ]
  ;(Array.isArray(horarios) ? horarios : []).forEach(function (horario) {
    const hora = parseInt(String(horario && horario.hora).slice(0, 2), 10)
    if (!Number.isFinite(hora)) {
      return
    }
    franjas[hora < 12 ? 0 : hora < 19 ? 1 : 2].horarios.push(horario)
  })
  return franjas.filter(function (franja) { return franja.horarios.length > 0 })
}

// ---------------------------------------------------------------------------------------
// Validación de los datos
// ---------------------------------------------------------------------------------------

/**
 * El WhatsApp argentino a sus 10 dígitos nacionales (característica + número, sin 0 ni 15),
 * o `null` si no se puede leer como un celular argentino.
 *
 * Acepta las formas en que la gente lo escribe: «3444 62-2139», «+54 9 3444 622139»,
 * «0 3444 15 622139», «11 15 2345-6789», «549 3444622139». El admin vuelve a normalizar y
 * es el que decide; esto es para avisar en el campo antes de mandar.
 *
 * @param {string} texto
 * @returns {string|null}
 */
export function normalizar_whatsapp(texto) {
  const crudo = String(texto === undefined || texto === null ? '' : texto).trim()
  if (!crudo || crudo.length > 30 || /[^\d\s+\-().]/.test(crudo)) {
    return null
  }
  let digitos = crudo.replace(/\D/g, '')
  const con_mas = crudo.charAt(0) === '+'

  /* Prefijo internacional: con «+», o sin él cuando el largo solo cierra con el 54 adelante
     (12 o más dígitos que empiezan con 54; un número nacional tiene 10, o 12 con el 15). */
  let internacional = false
  if (con_mas) {
    if (digitos.indexOf('54') !== 0) {
      return null
    }
    digitos = digitos.slice(2)
    internacional = true
  } else if (digitos.indexOf('54') === 0 && digitos.length >= 12) {
    digitos = digitos.slice(2)
    internacional = true
  }

  /* El 9 de los celulares, que solo existe detrás del 54: queda un 9 adelante de los 10
     dígitos (o de los 12, si además le pusieron el 15). */
  if (internacional && digitos.charAt(0) === '9' && (digitos.length === 11 || digitos.length === 13)) {
    digitos = digitos.slice(1)
  }

  /* El 0 de larga distancia. */
  if (digitos.charAt(0) === '0') {
    digitos = digitos.slice(1)
  }

  /* El 15 entre la característica y el número: 12 dígitos. La característica tiene 2 (solo
     11, Buenos Aires), 3 o 4 dígitos; se prueba en ese orden y gana la primera que deja un
     15 justo después. */
  if (digitos.length === 12) {
    const largos = digitos.indexOf('11') === 0 ? [2] : [3, 4]
    let sin_15 = null
    largos.some(function (largo) {
      if (digitos.substr(largo, 2) === '15') {
        sin_15 = digitos.slice(0, largo) + digitos.slice(largo + 2)
        return true
      }
      return false
    })
    if (!sin_15) {
      return null
    }
    digitos = sin_15
  }

  /* 10 dígitos y una característica posible (las argentinas empiezan con 1, 2 o 3). */
  return /^[123]\d{9}$/.test(digitos) ? digitos : null
}

/**
 * @param {string} texto
 * @returns {boolean}
 */
export function correo_valido(texto) {
  const valor = String(texto || '').trim()
  return valor.length <= 120 && /^[^\s@,;<>"']+@[^\s@,;<>"']+\.[A-Za-z]{2,}$/.test(valor) &&
    valor.indexOf('..') === -1
}

/**
 * Los errores del formulario, por campo, con el texto que ve el visitante. Vacío = se
 * puede mandar. `turno` agrupa fecha y hora (no hay campos libres: se eligen con chips).
 *
 * @param {{nombre: string, whatsapp: string, email: string, rubro: string, fecha: string,
 *   hora: string}} datos
 * @returns {Object<string, string>}
 */
export function validar_datos(datos) {
  const d = datos || {}
  const errores = {}
  if (!RE_FECHA.test(d.fecha || '') || !RE_HORA.test(d.hora || '')) {
    errores.turno = 'Elegí un día y un horario.'
  }
  const nombre = String(d.nombre || '').trim()
  if (nombre.length < 2) {
    errores.nombre = 'Escribí tu nombre.'
  } else if (nombre.length > 80) {
    errores.nombre = 'El nombre puede tener hasta 80 letras.'
  }
  if (!normalizar_whatsapp(d.whatsapp)) {
    errores.whatsapp = String(d.whatsapp || '').trim()
      ? 'Revisá el número: con característica, sin 0 ni 15 (por ejemplo, 3444 622139).'
      : 'Escribí tu WhatsApp.'
  }
  if (!String(d.email || '').trim()) {
    errores.email = 'Escribí tu correo.'
  } else if (!correo_valido(d.email)) {
    errores.email = 'Revisá el correo.'
  }
  if (SLUGS_RUBRO.indexOf(d.rubro) === -1) {
    errores.rubro = 'Elegí el rubro de tu negocio.'
  }
  return errores
}

// ---------------------------------------------------------------------------------------
// Píxel: cookies y URL de origen
// ---------------------------------------------------------------------------------------

/**
 * El valor de la cookie `_fbp` o `_fbc` si existe y tiene el formato que acepta el admin;
 * si no, `null` (el campo no viaja). Las escribe `fbevents.js`: sin píxel no hay.
 *
 * @param {string} cookies `document.cookie`
 * @param {'_fbp'|'_fbc'} nombre
 * @returns {string|null}
 */
export function leer_cookie_meta(cookies, nombre) {
  const partes = String(cookies || '').split(';')
  for (let i = 0; i < partes.length; i++) {
    const igual = partes[i].indexOf('=')
    if (igual === -1 || partes[i].slice(0, igual).trim() !== nombre) {
      continue
    }
    let valor = partes[i].slice(igual + 1).trim()
    try {
      valor = decodeURIComponent(valor)
    } catch (_) {
      return null
    }
    return valor.length <= 255 && RE_COOKIE_META.test(valor) ? valor : null
  }
  return null
}

/**
 * `event_source_url` = origen + ruta, sin query ni hash (ahí viajan los parámetros de
 * campaña, que van aparte en `atribucion`). Solo desde el host de la landing: el admin
 * rechaza cualquier otro, y un 422 por esto en una prueba local no le sirve a nadie.
 *
 * @param {{origin: string, pathname: string, hostname: string}} ubicacion `window.location`
 * @returns {string|null}
 */
export function url_de_origen(ubicacion) {
  if (!ubicacion || HOSTS_LANDING.indexOf(String(ubicacion.hostname || '').toLowerCase()) === -1) {
    return null
  }
  const url = String(ubicacion.origin || '') + String(ubicacion.pathname || '/')
  return url.length <= 500 ? url : null
}

// ---------------------------------------------------------------------------------------
// El body de la reserva
// ---------------------------------------------------------------------------------------

/**
 * El body del POST de reservas con EXACTAMENTE las claves del contrato (el admin responde
 * 422 ante cualquier otra). Lo opcional vacío no viaja.
 *
 * @param {object} datos
 * @param {string} datos.nombre
 * @param {string} datos.whatsapp Como lo escribió el visitante.
 * @param {string} datos.email
 * @param {string} datos.rubro
 * @param {string} datos.fecha
 * @param {string} datos.hora
 * @param {object} [datos.atribucion] `obtener_atribucion()`.
 * @param {string|null} [datos.fbp]
 * @param {string|null} [datos.fbc]
 * @param {string|null} [datos.event_source_url]
 * @param {string} [datos.sitio_web] El honeypot, tal cual quedó.
 * @param {number} datos.abierto_hace_ms
 * @returns {object}
 */
export function armar_body(datos) {
  const d = datos || {}
  const normalizado = normalizar_whatsapp(d.whatsapp)
  const body = {
    nombre: String(d.nombre || '').trim().replace(/\s+/g, ' '),
    /* El número ya normalizado y con el +549: el admin lo vuelve a normalizar, pero así no
       depende de adivinar el 15 de la misma forma que acá. */
    whatsapp: normalizado ? '+549' + normalizado : String(d.whatsapp || '').trim(),
    email: String(d.email || '').trim(),
    rubro: String(d.rubro || ''),
    fecha: String(d.fecha || ''),
    hora: String(d.hora || ''),
    sitio_web: String(d.sitio_web || ''),
    abierto_hace_ms: Math.max(0, Math.round(Number(d.abierto_hace_ms) || 0)),
  }

  const atribucion = {}
  Object.keys(d.atribucion || {}).forEach(function (clave) {
    const valor = d.atribucion[clave]
    if (typeof valor === 'string' && valor) {
      atribucion[clave] = valor
    }
  })
  if (Object.keys(atribucion).length) {
    body.atribucion = atribucion
  }

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
const MENSAJES_409 = {
  ya_tiene_demo: 'Ya tenés una demo reservada con este WhatsApp. Si querés cambiar el horario, escribinos.',
  ya_es_cliente: 'Este WhatsApp ya es de un cliente de ComercioCity. Escribinos y te ayudamos.',
  ya_hizo_la_demo: 'Ya hiciste la demo con este WhatsApp. Escribinos y seguimos desde ahí.',
}

/** Campos del admin → campos del formulario (fecha y hora se eligen juntas). */
const CAMPO_DEL_FORMULARIO = {
  nombre: 'nombre',
  whatsapp: 'whatsapp',
  email: 'email',
  rubro: 'rubro',
  fecha: 'turno',
  hora: 'turno',
}

/**
 * La respuesta de turnos (GET). 200 bien formado → los días; cualquier otra cosa (404 de un
 * admin viejo, 429, 503, cuerpo raro) → error, y el modal ofrece WhatsApp.
 *
 * @param {number} status
 * @param {*} cuerpo
 * @param {string} hoy
 * @returns {{tipo: 'turnos', dias: Array, duracion_minutos: number|null} | {tipo: 'error'}}
 */
export function interpretar_turnos(status, cuerpo, hoy) {
  if (status !== 200 || !cuerpo || typeof cuerpo !== 'object' || !Array.isArray(cuerpo.dias)) {
    return { tipo: 'error' }
  }
  const duracion = Number(cuerpo.duracion_minutos)
  return {
    tipo: 'turnos',
    dias: normalizar_dias(cuerpo.dias, hoy),
    duracion_minutos: Number.isFinite(duracion) && duracion > 0 ? duracion : null,
  }
}

/**
 * La respuesta de la reserva (POST), traducida a lo que tiene que hacer el modal.
 *
 * | status | tipo                                                   |
 * |--------|--------------------------------------------------------|
 * | 201    | `reservada` (con o sin `experiencia_url`; `whatsapp_confirmacion` solo si es true) |
 * | 422    | `campos` (errores por campo) o `invalida` (genérico)    |
 * | 409    | `turno_tomado` (+ días frescos) / `ya_tiene_demo` / `ya_es_cliente` / `ya_hizo_la_demo` |
 * | 429    | `limite`                                               |
 * | 503    | `reintentar`                                           |
 * | otro   | `error`                                                |
 *
 * @param {number} status
 * @param {*} cuerpo
 * @param {{hoy: string, fecha?: string, hora?: string, hasta?: string}} contexto
 * @returns {object}
 */
export function interpretar_reserva(status, cuerpo, contexto) {
  const c = cuerpo && typeof cuerpo === 'object' ? cuerpo : {}
  const ctx = contexto || {}
  const mensaje = typeof c.mensaje === 'string' && c.mensaje.trim() ? c.mensaje.trim() : ''

  if (status === 201) {
    const turno = c.turno && typeof c.turno === 'object' ? c.turno : {}
    const texto = typeof turno.texto === 'string' && turno.texto.trim()
      ? turno.texto.trim()
      : texto_turno(turno.fecha || ctx.fecha, turno.desde || ctx.hora, turno.hasta || ctx.hasta)
    const url = typeof c.experiencia_url === 'string' && /^https?:\/\/[^\s]+$/.test(c.experiencia_url)
      ? c.experiencia_url
      : null
    const meta_eventos = (Array.isArray(c.meta_eventos) ? c.meta_eventos : []).filter(function (e) {
      return e && EVENTOS_META_DE_RESERVA.indexOf(e.nombre) !== -1 &&
        typeof e.event_id === 'string' && /^[A-Za-z0-9_\-.:]{1,120}$/.test(e.event_id)
    }).map(function (e) {
      return { nombre: e.nombre, event_id: e.event_id }
    })
    return {
      tipo: 'reservada',
      experiencia_url: url,
      texto_turno: texto,
      correo: typeof c.correo === 'string' ? c.correo : '',
      /* Solo un `true` explícito: ausente o cualquier otra cosa = no se promete el WhatsApp
         (sale únicamente con la plantilla aprobada en Meta, D10). */
      whatsapp_confirmacion: c.whatsapp_confirmacion === true,
      meta_eventos: meta_eventos,
    }
  }

  if (status === 422) {
    const errores = {}
    if (c.errores && typeof c.errores === 'object') {
      Object.keys(c.errores).forEach(function (campo) {
        const destino = CAMPO_DEL_FORMULARIO[campo]
        const lista = c.errores[campo]
        const texto = Array.isArray(lista) ? lista[0] : lista
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
    if (c.codigo === 'turno_tomado') {
      return {
        tipo: 'turno_tomado',
        mensaje: mensaje || 'Ese horario se acaba de ocupar. Elegí otro.',
        /* null = no vinieron turnos: el modal los vuelve a pedir. */
        dias: Array.isArray(c.turnos) ? normalizar_dias(c.turnos, ctx.hoy) : null,
      }
    }
    if (MENSAJES_409[c.codigo]) {
      return { tipo: c.codigo, mensaje: mensaje || MENSAJES_409[c.codigo] }
    }
    return { tipo: 'error', mensaje: mensaje }
  }

  if (status === 429) {
    return { tipo: 'limite' }
  }
  if (status === 503) {
    return { tipo: 'reintentar', mensaje: mensaje }
  }
  return { tipo: 'error', mensaje: '' }
}

// ---------------------------------------------------------------------------------------
// Red
// ---------------------------------------------------------------------------------------

/**
 * Un pedido JSON al admin con tope de tiempo. Nunca tira: devuelve `{status, cuerpo}` o
 * `{status: 0, motivo: 'red'|'tiempo'}`. Sin credenciales ni referrer (contrato §3).
 *
 * @param {object} opciones
 * @param {string} opciones.url
 * @param {'GET'|'POST'} [opciones.metodo]
 * @param {object} [opciones.body]
 * @param {number} opciones.timeout
 * @param {Function} [opciones.fetcher]
 * @returns {Promise<{status: number, cuerpo?: *, motivo?: string}>}
 */
export async function pedir_json({ url, metodo = 'GET', body, timeout, fetcher = globalThis.fetch }) {
  if (!url || typeof fetcher !== 'function') {
    return { status: 0, motivo: 'red' }
  }
  const controlador = typeof AbortController === 'function' ? new AbortController() : null
  let vencido = false
  let temporizador
  const limite = new Promise(function (resolve) {
    temporizador = setTimeout(function () {
      vencido = true
      if (controlador) controlador.abort()
      resolve({ status: 0, motivo: 'tiempo' })
    }, timeout)
  })
  const pedido = Promise.resolve().then(function () {
    const opciones = {
      method: metodo,
      mode: 'cors',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      headers: { Accept: 'application/json' },
      signal: controlador ? controlador.signal : undefined,
    }
    if (body !== undefined) {
      opciones.headers['Content-Type'] = 'application/json'
      opciones.body = JSON.stringify(body)
    }
    return fetcher(url, opciones)
  }).then(async function (respuesta) {
    let cuerpo = null
    try {
      cuerpo = await respuesta.json()
    } catch (_) { /* 404 en HTML, 429 sin cuerpo: el status alcanza. */ }
    return { status: respuesta.status, cuerpo: cuerpo }
  }).catch(function () {
    return { status: 0, motivo: vencido ? 'tiempo' : 'red' }
  })
  try {
    return await Promise.race([pedido, limite])
  } finally {
    clearTimeout(temporizador)
  }
}
