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
  return import('data:text/javascript;base64,' + Buffer.from(fuente).toString('base64'))
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
