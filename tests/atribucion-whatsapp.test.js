import test from 'node:test'
import assert from 'node:assert/strict'
import { resolver_atribucion, armar_url_whatsapp, solicitar_referencia, CLAVE_ATRIBUCION,
  TTL_ATRIBUCION, TEXTO_CTA } from '../src/analitica/atribucion-whatsapp.js'

function memoria() {
  const valores = new Map()
  return { getItem: (clave) => valores.get(clave), setItem: (clave, valor) => valores.set(clave, valor) }
}
const reference = 'a'.repeat(32)
const fecha = Date.parse('2026-10-21T12:00:00Z')
const respuesta = (cuerpo, status = 201) => ({ status, json: async () => cuerpo })
const correcta = () => respuesta({ reference, expires_at: new Date(fecha + TTL_ATRIBUCION).toISOString() })

test('cada nueva llegada reemplaza el snapshot completo y conserva la navegación sin query', () => {
  const storage = memoria()
  resolver_atribucion({ search: '?fbclid=anterior&ad_id=10&utm_campaign=anterior', storage, ahora: fecha })
  assert.deepEqual(resolver_atribucion({ search: '?utm_content=nuevo', storage, ahora: fecha + 1 }), { utm_content: 'nuevo' })
  assert.deepEqual(resolver_atribucion({ search: '?nocache=1', storage, ahora: fecha + 2 }), { utm_content: 'nuevo' })
  assert.deepEqual(resolver_atribucion({ search: '?ad_id=', storage, ahora: fecha + 3 }), {})
})

test('caduca en siete días y descarta formato viejo, futuro, arrays y almacenamiento corrupto', () => {
  const storage = memoria()
  for (const previo of ['basura', JSON.stringify({ version: 1, created_at: fecha, datos: { ad_id: '1' } }),
    JSON.stringify({ version: 2, created_at: fecha + 1, datos: { ad_id: '1' } }),
    JSON.stringify({ version: 2, created_at: fecha, datos: [] }),
    JSON.stringify({ version: 2, created_at: fecha - TTL_ATRIBUCION, datos: { ad_id: '1' } })]) {
    storage.setItem(CLAVE_ATRIBUCION, previo)
    assert.deepEqual(resolver_atribucion({ storage, ahora: fecha }), {})
  }
  storage.setItem('cc_atribucion', JSON.stringify({ fbclid: 'legado' }))
  assert.deepEqual(resolver_atribucion({ storage, ahora: fecha }), {})
})

test('storage bloqueado no rompe y sólo conserva campos acotados válidos', () => {
  const storage = { getItem() { throw Error() }, setItem() { throw Error() } }
  const search = '?ad_id=123&adset_id={{adset.id}}&campaign_id=no&fbclid=click&campaign_name=Campaña&telefono=privado&utm_content=' + 'x'.repeat(256)
  assert.deepEqual(resolver_atribucion({ search, storage }), { ad_id: '123', campaign_name: 'Campaña', fbclid: 'click' })
  assert.deepEqual(resolver_atribucion({ storage }), {})
})

test('el href conserva número y frase exacta, y sólo incluye un código válido', () => {
  for (const invalida of [undefined, 'A'.repeat(32), 'mal&text=otra', 'a'.repeat(33)]) {
    assert.equal(new URL(armar_url_whatsapp(invalida)).searchParams.get('text'), TEXTO_CTA)
  }
  const url = new URL(armar_url_whatsapp(reference))
  assert.equal(url.origin + url.pathname, 'https://wa.me/543444544199')
  assert.equal(url.searchParams.get('text'), TEXTO_CTA + ' [CC:' + reference + ']')
})

test('crea una referencia con JSON plano, sin cookies ni referrer, tras respuesta 201 vigente', async () => {
  let pedido
  const resultado = await solicitar_referencia({ endpoint: 'https://api.example/referencias',
    datos: { ad_id: '123', telefono: 'privado' }, ahora: () => fecha,
    fetcher: async (url, opciones) => { pedido = { url, opciones }; return correcta() } })
  assert.equal(resultado, reference)
  assert.equal(pedido.opciones.method, 'POST')
  assert.equal(pedido.opciones.credentials, 'omit')
  assert.equal(pedido.opciones.referrerPolicy, 'no-referrer')
  assert.deepEqual(JSON.parse(pedido.opciones.body), { ad_id: '123' })
})

test('API vieja, inválida, vencida o caída siempre devuelve fallback', async () => {
  for (const devolver of [() => respuesta({}, 404), () => respuesta({}, 500),
    () => respuesta({ reference: 'MALA', expires_at: new Date(fecha + 1000).toISOString() }),
    () => respuesta({ reference, expires_at: new Date(fecha).toISOString() }),
    () => respuesta({ reference, expires_at: new Date(fecha + 2 * TTL_ATRIBUCION).toISOString() }),
    () => respuesta({ reference, expires_at: 'basura' }), () => respuesta(null),
    () => { throw Error('sin red') }]) {
    assert.equal(await solicitar_referencia({ endpoint: 'https://api.example', ahora: () => fecha, fetcher: devolver }), null)
  }
})

test('vence el timeout aunque fetch ignore la señal, sin activar una respuesta tardía', async () => {
  let signal
  let terminar
  const resultado = await solicitar_referencia({ endpoint: 'https://api.example', timeout: 10, ahora: () => fecha,
    fetcher: (_, opciones) => { signal = opciones.signal; return new Promise((resolve) => { terminar = resolve }) } })
  assert.equal(resultado, null)
  assert.equal(signal.aborted, true)
  terminar(correcta())
})

test('sin AbortController sigue aplicando el timeout y conserva el fallback', async () => {
  const anterior = globalThis.AbortController
  try {
    globalThis.AbortController = undefined
    assert.equal(await solicitar_referencia({ endpoint: 'https://api.example', timeout: 5,
      fetcher: () => new Promise(() => {}) }), null)
  } finally {
    globalThis.AbortController = anterior
  }
})
