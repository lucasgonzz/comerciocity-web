import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

/* Node no ejecuta import.meta.env ni los imports de Vite. Solo se sustituyen esos bordes;
   las funciones de producción se ejecutan completas, con fbq falso y sin salir a la red. */
async function cargar_pixel(entorno = {}) {
  let config = await readFile(new URL('../src/config.js', import.meta.url), 'utf8')
  config = config.replace("from './analitica/agenda-demo'",
    'from ' + JSON.stringify(new URL('../src/analitica/agenda-demo.js', import.meta.url).href))
    .replaceAll('import.meta.env', '(' + JSON.stringify(entorno) + ')')
  const configuracion = await import('data:text/javascript;base64,' + Buffer.from(config).toString('base64'))
  let fuente = await readFile(new URL('../src/analitica/meta-pixel.js', import.meta.url), 'utf8')
  fuente = fuente.replace("import { META_PIXEL_ID } from '../config'",
    'const META_PIXEL_ID = ' + JSON.stringify(configuracion.META_PIXEL_ID))
    .replace("import { obtener_atribucion } from './atribucion-whatsapp'", 'const obtener_atribucion = () => ({})')
    .replace("from './ensayo'", 'from ' + JSON.stringify(new URL('../src/analitica/ensayo.js', import.meta.url).href))
  /* Un import nuevo por carga: cada test arranca con el estado del módulo limpio. */
  return import('data:text/javascript;base64,' + Buffer.from(fuente + String.fromCharCode(10) + '// ' + Math.random()).toString('base64'))
}

test('el píxel solo registra Lead al alta; listo, fallo e IDs inválidos no convierten', async () => {
  const llamadas = []
  globalThis.window = { fbq: (...args) => llamadas.push(args) }
  globalThis.document = {}
  try {
    const pixel = await cargar_pixel({ VITE_META_PIXEL_ID: '123456' })
    assert.equal(pixel.iniciar_pixel(), true)
    llamadas.length = 0
    pixel.registrar_evento('prueba_alta', { meta_eventos: [
      { nombre: 'Lead', event_id: 'cc-lead-123-web-lead' },
      { nombre: 'StartTrial', event_id: 'cc-lead-123-web-starttrial' },
      { nombre: 'Purchase', event_id: 'cc-lead-123-web-purchase' },
      { nombre: 'Lead', event_id: 'id inválido' },
      { nombre: 'Lead' }, null,
    ] })
    pixel.registrar_evento('prueba_lista', {})
    pixel.registrar_evento('prueba_fallida', {})
    assert.deepEqual(llamadas, [
      ['track', 'Lead', { content_name: 'prueba' }, { eventID: 'cc-lead-123-web-lead' }],
    ])
  } finally {
    delete globalThis.window
    delete globalThis.document
  }
})

test('VITE_PRUEBA_MOCK apaga todo el píxel aunque haya un ID productivo configurado', async () => {
  const llamadas = []
  globalThis.window = { fbq: (...args) => llamadas.push(args) }
  globalThis.document = {}
  try {
    const pixel = await cargar_pixel({ VITE_META_PIXEL_ID: '123456', VITE_PRUEBA_MOCK: '1' })
    assert.equal(pixel.iniciar_pixel(), false)
    pixel.registrar_evento('prueba_alta', { meta_eventos: [{ nombre: 'Lead', event_id: 'simulado' }] })
    pixel.registrar_evento('prueba_cta_tocado', {})
    assert.deepEqual(llamadas, [])
  } finally {
    delete globalThis.window
    delete globalThis.document
  }
})

/** Un localStorage en memoria. */
function almacen() {
  const datos = {}
  return {
    datos: datos,
    getItem: (k) => (Object.prototype.hasOwnProperty.call(datos, k) ? datos[k] : null),
    setItem: (k, v) => { datos[k] = String(v) },
    removeItem: (k) => { delete datos[k] },
  }
}

test('una visita de ensayo (?cc_ensayo=1) no carga el píxel ni manda ningún evento', async () => {
  const llamadas = []
  const storage = almacen()
  globalThis.window = { fbq: (...args) => llamadas.push(args), location: { search: '?cc_ensayo=1' }, localStorage: storage }
  globalThis.document = {}
  try {
    const pixel = await cargar_pixel({ VITE_META_PIXEL_ID: '123456' })
    assert.equal(pixel.iniciar_pixel(), false)
    pixel.registrar_evento('scroll_bloque_visible', { bloque_id: 'hero' })
    pixel.registrar_evento('prueba_cta_tocado', { desde: 'hero' })
    pixel.registrar_evento('prueba_alta', { meta_eventos: [{ nombre: 'Lead', event_id: 'cc-lead-685-web-lead' }] })
    assert.deepEqual(llamadas, [], 'Ni PageView: el píxel no se inicializó.')
    assert.equal(pixel.estado_pixel().ensayo, true)
    assert.ok(storage.datos.cc_ensayo_hasta, 'El navegador queda marcado para las próximas visitas.')
  } finally {
    delete globalThis.window
    delete globalThis.document
  }
})

test('el 201 de ensayo apaga el píxel para el resto de la visita y marca el navegador', async () => {
  const llamadas = []
  const storage = almacen()
  globalThis.window = { fbq: (...args) => llamadas.push(args), location: { search: '?utm_source=facebook' }, localStorage: storage }
  globalThis.document = {}
  try {
    const pixel = await cargar_pixel({ VITE_META_PIXEL_ID: '123456' })
    assert.equal(pixel.iniciar_pixel(), true)
    llamadas.length = 0
    pixel.marcar_sesion_de_ensayo()
    pixel.registrar_evento('prueba_alta', { meta_eventos: [{ nombre: 'Lead', event_id: 'cc-lead-685-web-lead' }] })
    pixel.registrar_evento('cta_demo_tocado', { desde: 'prueba' })
    assert.deepEqual(llamadas, [])
    assert.ok(storage.datos.cc_ensayo_hasta)
  } finally {
    delete globalThis.window
    delete globalThis.document
  }
})

test('una visita real sigue mandando PageView, CtaPrueba y el Lead con el mismo eventID', async () => {
  const llamadas = []
  globalThis.window = { fbq: (...args) => llamadas.push(args), location: { search: '?utm_source=facebook' }, localStorage: almacen() }
  globalThis.document = {}
  try {
    const pixel = await cargar_pixel({ VITE_META_PIXEL_ID: '123456' })
    assert.equal(pixel.iniciar_pixel(), true)
    pixel.registrar_evento('prueba_cta_tocado', { desde: 'hero' })
    pixel.registrar_evento('prueba_alta', { meta_eventos: [{ nombre: 'Lead', event_id: 'cc-lead-700-web-lead' }] })
    assert.deepEqual(llamadas, [
      ['set', 'autoConfig', false, '123456'],
      ['init', '123456'],
      ['track', 'PageView', {}],
      ['trackCustom', 'CtaPrueba', { seccion: 'hero' }],
      ['track', 'Lead', { content_name: 'prueba' }, { eventID: 'cc-lead-700-web-lead' }],
    ])
  } finally {
    delete globalThis.window
    delete globalThis.document
  }
})
