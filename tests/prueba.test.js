import test from 'node:test'
import assert from 'node:assert/strict'
import {
  RUBROS_PRUEBA, PASSWORD_MINIMO, ETAPAS_VISUALES, validar_alta, armar_body_alta, interpretar_alta,
  interpretar_estado, eventos_meta_del_alta, etapas_hechas, reproductor_de_video, enlace_whatsapp_soporte,
  crear_mock, uuid_valido,
} from '../src/analitica/prueba.js'
import { pedir_json } from '../src/analitica/agenda-demo.js'

const DATOS = {
  nombre: '  Ana   Pérez ',
  telefono: '3444 15 622139',
  email: 'ana@negocio.com',
  empresa: ' Ferretería  Pérez ',
  password: 'claveSegura1',
  rubro: 'ferreteria',
}

test('los 14 rubros son los de demo_industrias.json, en su orden', () => {
  assert.deepEqual(RUBROS_PRUEBA.map(r => r.slug), [
    'ferreteria', 'indumentaria', 'autopartes', 'jugueteria', 'construccion', 'bebidas', 'mascotas',
    'limpieza', 'belleza', 'almacen', 'pesca', 'hogar', 'tecnologia', 'distribuidora',
  ])
})

test('un formulario completo no tiene errores, y el rubro es opcional', () => {
  assert.deepEqual(validar_alta(DATOS), {})
  assert.deepEqual(validar_alta(Object.assign({}, DATOS, { rubro: '' })), {})
  assert.equal(validar_alta(Object.assign({}, DATOS, { rubro: 'otro' })).rubro, 'Elegí un rubro de la lista, o dejalo vacío.')
})

test('cada campo obligatorio tiene su error, y la contraseña solo pide 8 caracteres', () => {
  const e = validar_alta({})
  assert.equal(e.nombre, 'Escribí tu nombre.')
  assert.equal(e.telefono, 'Escribí tu WhatsApp.')
  assert.equal(e.email, 'Escribí tu correo.')
  assert.equal(e.empresa, 'Escribí el nombre de tu negocio.')
  assert.equal(e.password, 'Elegí una contraseña.')
  assert.equal(validar_alta(Object.assign({}, DATOS, { password: '1234567' })).password,
    'La contraseña tiene que tener al menos ' + PASSWORD_MINIMO + ' caracteres.')
  /* Ocho cualquiera: sin mayúsculas, sin números, con espacios. Lucas no quiso más trabas. */
  assert.equal(validar_alta(Object.assign({}, DATOS, { password: 'a b c d ' })).password, undefined)
  assert.match(validar_alta(Object.assign({}, DATOS, { telefono: '12345' })).telefono, /^Revisá el número/)
  assert.equal(validar_alta(Object.assign({}, DATOS, { email: 'ana@' })).email, 'Revisá el correo.')
})

test('el body lleva exactamente las claves de C6, el teléfono con +549 y la contraseña intacta', () => {
  const body = armar_body_alta(Object.assign({}, DATOS, {
    password: ' clave con espacios ',
    atribucion: { utm_source: 'ig', utm_campaign: 'prueba', fbclid: 'abc', campaign_id: '1' },
    fbp: 'fb.1.1700000000.123', fbc: 'cookie rara', event_source_url: 'https://comerciocity.com/prueba',
    sitio_web: '', abierto_hace_ms: 4100.6,
  }))
  assert.deepEqual(body, {
    nombre: 'Ana Pérez',
    telefono: '+5493444622139',
    email: 'ana@negocio.com',
    empresa: 'Ferretería Pérez',
    password: ' clave con espacios ',
    sitio_web: '',
    abierto_hace_ms: 4101,
    rubro: 'ferreteria',
    utm_source: 'ig',
    utm_campaign: 'prueba',
    fbp: 'fb.1.1700000000.123',
    event_source_url: 'https://comerciocity.com/prueba',
  })
  /* Sin rubro no viaja la clave; un teléfono ilegible viaja como lo escribió (el admin decide). */
  const sin = armar_body_alta(Object.assign({}, DATOS, { rubro: '', telefono: 'abc' }))
  assert.equal('rubro' in sin, false)
  assert.equal(sin.telefono, 'abc')
})

test('el 201 da la uuid y los eventos del píxel: los del admin si vienen, si no los derivados', () => {
  const r = interpretar_alta(201, { uuid: 'a1b2c3d4-e5', meta_eventos: [{ nombre: 'Lead', event_id: 'x1' }, { nombre: 'Otro', event_id: 'x2' }] })
  assert.equal(r.tipo, 'creada')
  assert.equal(r.uuid, 'a1b2c3d4-e5')
  assert.deepEqual(r.meta_eventos, [{ nombre: 'Lead', event_id: 'x1' }])
  assert.deepEqual(eventos_meta_del_alta('a1b2c3d4-e5', null), [
    { nombre: 'Lead', event_id: 'prueba:a1b2c3d4-e5:Lead' },
    { nombre: 'StartTrial', event_id: 'prueba:a1b2c3d4-e5:StartTrial' },
  ])
  assert.equal(interpretar_alta(201, {}).tipo, 'error')
  assert.equal(uuid_valido('corto'), false)
})

test('el 422 va por campo (errores o errors), el 409 por code o codigo, y el resto por tipo', () => {
  assert.deepEqual(interpretar_alta(422, { errores: { telefono: ['Mal'], password: 'Corta', otro: ['x'] } }),
    { tipo: 'campos', errores: { telefono: 'Mal', password: 'Corta' }, mensaje: '' })
  assert.deepEqual(interpretar_alta(422, { errors: { whatsapp: ['Mal'] } }).errores, { telefono: 'Mal' })
  assert.equal(interpretar_alta(422, {}).tipo, 'invalida')
  assert.equal(interpretar_alta(409, { code: 'ya_es_cliente' }).tipo, 'ya_es_cliente')
  assert.equal(interpretar_alta(409, { codigo: 'ya_tiene_prueba', mensaje: 'Hola' }).mensaje, 'Hola')
  assert.match(interpretar_alta(409, { code: 'telefono_invalido' }).mensaje, /celular argentino/)
  assert.equal(interpretar_alta(409, { code: 'raro' }).tipo, 'error')
  assert.equal(interpretar_alta(429, {}).tipo, 'limite')
  assert.equal(interpretar_alta(503, {}).tipo, 'reintentar')
  assert.equal(interpretar_alta(500, null).tipo, 'error')
  assert.equal(interpretar_alta(0, null).tipo, 'error')
})

test('el estado se lee tolerante: progreso acotado, lista con url, estados raros = creando, 404 = no encontrada', () => {
  const creando = interpretar_estado(200, { estado: 'creando', etapa: 'Armando', progreso: '37.6' })
  assert.deepEqual(creando, { tipo: 'estado', estado: 'creando', etapa: 'Armando', progreso: 38, url_ingreso: null, video_url: null, whatsapp_soporte: null, mensaje: '' })
  const lista = interpretar_estado(200, { estado: 'lista', progreso: 90, url_ingreso: 'https://x.comerciocity.com/demo/ingreso?t=1', video_url: 'https://youtu.be/abc12345' })
  assert.equal(lista.progreso, 100)
  assert.equal(lista.url_ingreso, 'https://x.comerciocity.com/demo/ingreso?t=1')
  assert.equal(lista.video_url, 'https://youtu.be/abc12345')
  /* La url_ingreso solo vale con `lista`: un `creando` con url no manda a nadie a ningún lado. */
  assert.equal(interpretar_estado(200, { estado: 'creando', url_ingreso: 'https://x.test' }).url_ingreso, null)
  assert.equal(interpretar_estado(200, { estado: 'lista', url_ingreso: 'javascript:alert(1)' }).url_ingreso, null)
  assert.equal(interpretar_estado(200, { estado: 'otro', progreso: 500 }).estado, 'creando')
  assert.equal(interpretar_estado(200, { estado: 'otro', progreso: 500 }).progreso, 100)
  const fallida = interpretar_estado(200, { estado: 'fallida', mensaje: 'Se rompió', whatsapp_soporte: '+54 9 3444 544199' })
  assert.equal(fallida.estado, 'fallida')
  assert.equal(fallida.whatsapp_soporte, 'https://wa.me/5493444544199')
  assert.equal(interpretar_estado(404, {}).tipo, 'no_encontrada')
  assert.equal(interpretar_estado(500, {}).tipo, 'error')
  assert.equal(interpretar_estado(200, null).tipo, 'error')
})

test('las etapas pintadas avanzan con el progreso y el video sabe qué reproductor necesita', () => {
  assert.equal(etapas_hechas(0), 0)
  assert.equal(etapas_hechas(15), 1)
  assert.equal(etapas_hechas(54), 2)
  assert.equal(etapas_hechas(69), 3)
  assert.equal(etapas_hechas(100), ETAPAS_VISUALES.length)
  assert.deepEqual(reproductor_de_video('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=3'),
    { tipo: 'youtube', src: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0' })
  assert.equal(reproductor_de_video('https://vimeo.com/123456789').tipo, 'vimeo')
  assert.deepEqual(reproductor_de_video('https://videos.comerciocity.store/bienvenida.mp4'),
    { tipo: 'archivo', src: 'https://videos.comerciocity.store/bienvenida.mp4' })
  assert.equal(reproductor_de_video(''), null)
  assert.equal(enlace_whatsapp_soporte('https://wa.me/5493444544199?text=hola'), 'https://wa.me/5493444544199?text=hola')
  assert.equal(enlace_whatsapp_soporte('no es un número'), null)
})

test('el mock responde el contrato C6 con el tiempo simulado, y pedir_json lo entiende', async () => {
  let reloj = 1000
  const mock = crear_mock({ duracion_ms: 10000, demora_ms: 0, ahora: () => reloj })
  const base = 'https://admin.test/api'

  const alta = await pedir_json({ url: base + '/landing/prueba/alta', metodo: 'POST', body: armar_body_alta(DATOS), timeout: 1000, fetcher: mock })
  assert.equal(alta.status, 201)
  const r = interpretar_alta(alta.status, alta.cuerpo)
  assert.equal(r.tipo, 'creada')

  const url_estado = base + '/landing/prueba/' + r.uuid + '/estado'
  let e = interpretar_estado(...Object.values(await pedir_json({ url: url_estado, timeout: 1000, fetcher: mock })).slice(0, 2))
  assert.equal(e.estado, 'creando')
  assert.equal(e.progreso, 0)
  reloj += 6000
  e = await pedir_json({ url: url_estado, timeout: 1000, fetcher: mock })
  e = interpretar_estado(e.status, e.cuerpo)
  assert.equal(e.estado, 'creando')
  assert.equal(e.progreso, 60)
  assert.equal(e.etapa, 'Armando tu tienda online')
  reloj += 5000
  e = await pedir_json({ url: url_estado, timeout: 1000, fetcher: mock })
  e = interpretar_estado(e.status, e.cuerpo)
  assert.equal(e.estado, 'lista')
  assert.match(e.url_ingreso, /^https:\/\//)

  /* Los caminos raros. */
  assert.equal((await mock(base + '/landing/prueba/alta', { method: 'POST', body: JSON.stringify({ telefono: '+5493444000000', password: 'x'.repeat(8) }) })).status, 409)
  assert.equal((await mock(base + '/landing/prueba/alta', { method: 'POST', body: JSON.stringify({ email: '422@x.com', telefono: '+5493444622139', password: 'x'.repeat(8) }) })).status, 422)
  assert.equal((await mock(base + '/landing/prueba/inexistente/estado', { method: 'GET' })).status, 404)
  const falla = await mock(base + '/landing/prueba/alta', { method: 'POST', body: JSON.stringify({ empresa: 'Negocio que falla', telefono: '+5493444622139', password: 'x'.repeat(8) }) })
  const uuid_falla = (await falla.json()).uuid
  reloj += 7000
  const estado_falla = await (await mock(base + '/landing/prueba/' + uuid_falla + '/estado', { method: 'GET' })).json()
  assert.equal(estado_falla.estado, 'fallida')
})
