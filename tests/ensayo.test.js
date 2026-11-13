import test from 'node:test'
import assert from 'node:assert/strict'
import {
  es_visita_de_ensayo, marcar_ensayo, desmarcar_ensayo, marca_de_la_url, CLAVE_ENSAYO, DIAS_DE_LA_MARCA,
} from '../src/analitica/ensayo.js'

/** Un localStorage en memoria. */
function almacen() {
  const datos = {}
  return {
    datos: datos,
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(datos, k) ? datos[k] : null },
    setItem: function (k, v) { datos[k] = String(v) },
    removeItem: function (k) { delete datos[k] },
  }
}

const AHORA = 1763050000000
const HUMANO = { webdriver: false }

test('una visita normal no es de ensayo y no deja nada guardado', () => {
  const storage = almacen()
  assert.equal(es_visita_de_ensayo({ search: '?utm_source=facebook&fbclid=abc', storage, navegador: HUMANO, ahora: AHORA }), false)
  assert.equal(es_visita_de_ensayo({ search: '', storage, navegador: {}, ahora: AHORA }), false)
  assert.deepEqual(storage.datos, {})
})

test('?cc_ensayo=1 apaga esta visita y las siguientes del mismo navegador por 30 días', () => {
  const storage = almacen()
  assert.equal(es_visita_de_ensayo({ search: '?utm_source=x&cc_ensayo=1', storage, navegador: HUMANO, ahora: AHORA }), true)
  assert.equal(Number(storage.getItem(CLAVE_ENSAYO)), AHORA + DIAS_DE_LA_MARCA * 86400000)
  /* La recarga o la navegación interna ya no traen el parámetro. */
  assert.equal(es_visita_de_ensayo({ search: '', storage, navegador: HUMANO, ahora: AHORA + 86400000 }), true)
  /* Vencida: vuelve a ser una visita normal y la marca se borra. */
  assert.equal(es_visita_de_ensayo({ search: '', storage, navegador: HUMANO, ahora: AHORA + 31 * 86400000 }), false)
  assert.equal(storage.getItem(CLAVE_ENSAYO), null)
})

test('?cc_ensayo=0 borra la marca', () => {
  const storage = almacen()
  marcar_ensayo({ storage, ahora: AHORA })
  assert.equal(es_visita_de_ensayo({ search: '?cc_ensayo=0', storage, navegador: HUMANO, ahora: AHORA }), false)
  assert.equal(storage.getItem(CLAVE_ENSAYO), null)
  marcar_ensayo({ storage, ahora: AHORA })
  desmarcar_ensayo({ storage })
  assert.equal(es_visita_de_ensayo({ search: '', storage, navegador: HUMANO, ahora: AHORA }), false)
})

test('un navegador automatizado (Playwright) es siempre de ensayo, aunque no traiga el parámetro', () => {
  const storage = almacen()
  assert.equal(es_visita_de_ensayo({ search: '', storage, navegador: { webdriver: true }, ahora: AHORA }), true)
  assert.equal(es_visita_de_ensayo({ search: '?cc_ensayo=0', storage, navegador: { webdriver: true }, ahora: AHORA }), true)
  /* No guarda marca: el mismo navegador sin automatizar vuelve a medir. */
  assert.deepEqual(storage.datos, {})
})

test('sin localStorage (privado o bloqueado) no se rompe nada', () => {
  const roto = { getItem: () => { throw new Error('bloqueado') }, setItem: () => { throw new Error('bloqueado') }, removeItem: () => { throw new Error('bloqueado') } }
  assert.equal(es_visita_de_ensayo({ search: '?cc_ensayo=1', storage: roto, navegador: HUMANO, ahora: AHORA }), true)
  assert.equal(es_visita_de_ensayo({ search: '', storage: roto, navegador: HUMANO, ahora: AHORA }), false)
  assert.equal(es_visita_de_ensayo({ search: '', storage: null, navegador: null, ahora: AHORA }), false)
  marcar_ensayo({ storage: null })
})

test('una marca ilegible se descarta', () => {
  const storage = almacen()
  storage.setItem(CLAVE_ENSAYO, 'cualquier cosa')
  assert.equal(es_visita_de_ensayo({ search: '', storage, navegador: HUMANO, ahora: AHORA }), false)
  assert.equal(storage.getItem(CLAVE_ENSAYO), null)
})

test('solo 1 y 0 cuentan como valor del parámetro', () => {
  assert.equal(marca_de_la_url('?cc_ensayo=1'), '1')
  assert.equal(marca_de_la_url('cc_ensayo=0&x=1'), '0')
  assert.equal(marca_de_la_url('?cc_ensayo=si'), null)
  assert.equal(marca_de_la_url('?otro_cc_ensayo=1'), null)
  assert.equal(marca_de_la_url(''), null)
})
