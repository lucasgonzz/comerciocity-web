/**
 * Las visitas de ENSAYO no le mandan nada a Meta (misión `ensayos-sin-eventos-meta`, 13/11/2026).
 *
 * El 11 y 12/11/2026 los ensayos de la prueba gratuita (Playwright manejando esta misma página con
 * el correo de pruebas) le mandaron al píxel `PageView`, `CtaPrueba` y `Lead` como si fueran
 * negocios reales, y la campaña optimiza por esos eventos. Una visita es de ensayo si:
 *
 *   1. la URL trae `?cc_ensayo=1` — queda guardado en este navegador por `DIAS_DE_LA_MARCA` días, así
 *      la navegación interna y las recargas siguen apagadas. `?cc_ensayo=0` lo borra;
 *   2. el alta de la prueba devolvió `ensayo: true` (el correo está en la lista de ensayos del
 *      admin): `marcar_ensayo()` la guarda igual que el punto 1;
 *   3. el navegador está automatizado (`navigator.webdriver === true`: Playwright, Selenium,
 *      Puppeteer). Un navegador automatizado no es un negocio que se interesa: nunca es tráfico real.
 *
 * Con cualquiera de las tres, `meta-pixel.js` no carga `fbevents.js` ni define `fbq`: cero pedidos
 * a Facebook. Para el tráfico real no cambia nada: ninguna de las tres condiciones se da.
 *
 * 🔴 Sin `import.meta.env` y sin tocar `window` al importarse: este módulo se prueba con
 * `node --test` (tests/ensayo.test.js). Todo lo del navegador llega por parámetro, con el `window`
 * real como default.
 */

/** Parámetro de la URL que prende (`1`) o apaga (`0`) la marca. */
export const PARAMETRO_ENSAYO = 'cc_ensayo'

/** Clave de la marca en localStorage: guarda el vencimiento en milisegundos. */
export const CLAVE_ENSAYO = 'cc_ensayo_hasta'

/** Cuánto dura la marca en un navegador. Lo que dura un ensayo de punta a punta, con margen. */
export const DIAS_DE_LA_MARCA = 30

const MS_POR_DIA = 24 * 60 * 60 * 1000

/**
 * El entorno del navegador, o el que pasen los tests.
 *
 * @param {object} [entorno] `{ search, storage, navegador, ahora }`.
 * @returns {{search: string, storage: object|null, navegador: object|null, ahora: number}}
 */
function resolver_entorno(entorno) {
  const e = entorno || {}
  const hay_window = typeof window !== 'undefined'
  let storage = null
  if (e.storage !== undefined) {
    storage = e.storage
  } else if (hay_window) {
    try {
      storage = window.localStorage
    } catch (_) {
      /* Safari en privado o cookies bloqueadas: sin marca persistente, el resto sigue andando. */
      storage = null
    }
  }
  return {
    search: e.search !== undefined ? String(e.search || '') : (hay_window && window.location ? String(window.location.search || '') : ''),
    storage: storage,
    navegador: e.navegador !== undefined ? e.navegador : (typeof navigator !== 'undefined' ? navigator : null),
    ahora: typeof e.ahora === 'number' ? e.ahora : Date.now(),
  }
}

/**
 * Lo que dice la URL: `'1'` prende, `'0'` apaga, `null` si no dice nada.
 *
 * @param {string} search `location.search`.
 * @returns {string|null}
 */
export function marca_de_la_url(search) {
  const texto = String(search || '').replace(/^\?/, '')
  if (!texto) {
    return null
  }
  const pares = texto.split('&')
  for (let i = 0; i < pares.length; i++) {
    const partes = pares[i].split('=')
    /* Un parámetro mal codificado (un `%` suelto) no puede tirar la página: esto corre antes de montar la app. */
    let nombre = ''
    let valor = ''
    try {
      nombre = decodeURIComponent(partes[0] || '')
      valor = decodeURIComponent((partes[1] || '').replace(/\+/g, ' ')).trim()
    } catch (_) {
      continue
    }
    if (nombre === PARAMETRO_ENSAYO) {
      return valor === '0' ? '0' : (valor === '1' ? '1' : null)
    }
  }
  return null
}

/**
 * Guarda la marca de ensayo en este navegador por `DIAS_DE_LA_MARCA` días.
 *
 * @param {object} [entorno] Para los tests.
 * @returns {void}
 */
export function marcar_ensayo(entorno) {
  const e = resolver_entorno(entorno)
  if (!e.storage) {
    return
  }
  try {
    e.storage.setItem(CLAVE_ENSAYO, String(e.ahora + DIAS_DE_LA_MARCA * MS_POR_DIA))
  } catch (_) {
    /* Sin lugar o sin permiso: la visita actual igual queda apagada por quien llamó. */
  }
}

/**
 * Borra la marca de ensayo de este navegador.
 *
 * @param {object} [entorno] Para los tests.
 * @returns {void}
 */
export function desmarcar_ensayo(entorno) {
  const e = resolver_entorno(entorno)
  if (!e.storage) {
    return
  }
  try {
    e.storage.removeItem(CLAVE_ENSAYO)
  } catch (_) {
    /* Nada que hacer. */
  }
}

/**
 * ¿La marca guardada sigue vigente? Una vencida o ilegible se borra.
 *
 * @param {object} e Entorno resuelto.
 * @returns {boolean}
 */
function marca_guardada_vigente(e) {
  if (!e.storage) {
    return false
  }
  let valor = null
  try {
    valor = e.storage.getItem(CLAVE_ENSAYO)
  } catch (_) {
    return false
  }
  if (valor === null || valor === undefined) {
    return false
  }
  const hasta = Number(valor)
  if (!isFinite(hasta) || hasta <= e.ahora) {
    try {
      e.storage.removeItem(CLAVE_ENSAYO)
    } catch (_) {
      /* Nada que hacer. */
    }
    return false
  }
  return true
}

/**
 * ¿Esta visita es de ensayo? Aplica primero lo que diga la URL (prender o apagar la marca).
 *
 * @param {object} [entorno] `{ search, storage, navegador, ahora }` para los tests.
 * @returns {boolean}
 */
export function es_visita_de_ensayo(entorno) {
  const e = resolver_entorno(entorno)
  const de_la_url = marca_de_la_url(e.search)

  if (de_la_url === '1') {
    marcar_ensayo(e)
    return true
  }
  if (de_la_url === '0') {
    desmarcar_ensayo(e)
  } else if (marca_guardada_vigente(e)) {
    return true
  }

  return !!(e.navegador && e.navegador.webdriver === true)
}
