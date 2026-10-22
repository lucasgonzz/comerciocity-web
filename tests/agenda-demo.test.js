import test from 'node:test'
import assert from 'node:assert/strict'
import {
  RUBROS, PISO_ABIERTO_MS, unir_url, fecha_en_zona, sumar_dias, etiqueta_dia, texto_turno,
  normalizar_dias, normalizar_whatsapp, correo_valido, validar_datos, leer_cookie_meta,
  url_de_origen, armar_body, interpretar_turnos, interpretar_reserva, pedir_json,
} from '../src/analitica/agenda-demo.js'

const HOY = '2026-10-22' // jueves

test('une la base del admin con las rutas de la agenda sin barras de más ni de menos', () => {
  assert.equal(unir_url('https://api-admin.comerciocity.com/api', '/landing/agenda/turnos'),
    'https://api-admin.comerciocity.com/api/landing/agenda/turnos')
  assert.equal(unir_url(' https://x.test/api// ', 'landing/agenda/reservas'), 'https://x.test/api/landing/agenda/reservas')
})

test('«hoy» se cuenta en la hora de Argentina, no en UTC', () => {
  /* 23:30 del 22/10 en Buenos Aires = 02:30 del 23/10 en UTC. */
  assert.equal(fecha_en_zona(Date.parse('2026-10-23T02:30:00Z')), '2026-10-22')
  assert.equal(fecha_en_zona(Date.parse('2026-10-23T03:30:00Z')), '2026-10-23')
  assert.equal(sumar_dias('2026-10-31', 1), '2026-11-01')
  assert.equal(sumar_dias('2026-12-31', 1), '2027-01-01')
})

test('los chips de día dicen Hoy, Mañana y «Sáb 24/10»', () => {
  assert.deepEqual(etiqueta_dia('2026-10-22', HOY), { titulo: 'Hoy', detalle: 'Jue 22/10', accesible: 'Hoy, jueves 22/10' })
  assert.deepEqual(etiqueta_dia('2026-10-23', HOY), { titulo: 'Mañana', detalle: 'Vie 23/10', accesible: 'Mañana, viernes 23/10' })
  assert.deepEqual(etiqueta_dia('2026-10-24', HOY), { titulo: 'Sáb 24/10', detalle: '', accesible: 'sábado 24/10' })
  assert.equal(etiqueta_dia('2026-10-26', HOY).titulo, 'Lun 26/10')
  assert.equal(texto_turno('2026-10-23', '15:00', '17:00'), 'viernes 23/10 de 15:00 a 17:00')
  assert.equal(texto_turno('2026-10-23', '15:00', ''), 'viernes 23/10 de 15:00')
  assert.equal(texto_turno('mal', '15:00', '17:00'), '')
})

test('los días del admin se ordenan, se depuran y los vacíos no se muestran', () => {
  const dias = normalizar_dias([
    { fecha: '2026-10-24', horarios: [{ hora: '18:00', hasta: '20:00' }, { hora: '09:30', hasta: '11:30' }] },
    { fecha: '2026-10-22', horarios: [{ hora: '15:00', hasta: '17:00' }, { hora: '15:00', hasta: '17:00' }, { hora: '25:00' }] },
    { fecha: '2026-10-23', horarios: [] },
    { fecha: '2026-10-22', horarios: [{ hora: '16:00', hasta: '18:00' }] },
    null, { fecha: 'jueves' }, 'basura',
  ], HOY)
  assert.deepEqual(dias.map((d) => d.fecha), ['2026-10-22', '2026-10-24'])
  assert.deepEqual(dias[0].horarios, [{ hora: '15:00', hasta: '17:00', texto: '15:00 a 17:00' }])
  assert.deepEqual(dias[1].horarios.map((h) => h.texto), ['09:30 a 11:30', '18:00 a 20:00'])
  assert.equal(dias[0].titulo, 'Hoy')
  assert.deepEqual(normalizar_dias(null, HOY), [])
})

test('el WhatsApp argentino se lleva a sus 10 dígitos en todas las formas de escribirlo', () => {
  for (const escrito of ['3444 62-2139', '3444622139', '+54 9 3444 622139', '+5493444622139',
    '549 3444622139', '0 3444 15 622139', '03444 15-622139', '3444 15 622139', '+54 3444 622139',
    '+54 9 3444 15 622139', '(03444) 15 62-2139']) {
    assert.equal(normalizar_whatsapp(escrito), '3444622139', escrito)
  }
  assert.equal(normalizar_whatsapp('11 15 2345-6789'), '1123456789')
  assert.equal(normalizar_whatsapp('011 2345 6789'), '1123456789')
  assert.equal(normalizar_whatsapp('341 15 5123456'), '3415123456')
  assert.equal(normalizar_whatsapp('+54 9 11 2345 6789'), '1123456789')
})

test('el WhatsApp rechaza lo que no es un celular argentino', () => {
  for (const escrito of ['', '   ', '622139', '15 622139', '15622139', '3444 62213', '34446221399',
    '+1 415 555 0100', '+598 99 123 456', '5 3444 622139', 'tres cuatro', '3444-622139 int 2',
    '0800 333 4444', '9' + '1'.repeat(40), null, undefined]) {
    assert.equal(normalizar_whatsapp(escrito), null, String(escrito))
  }
})

test('el correo y los datos se validan como el admin, con textos para el visitante', () => {
  assert.equal(correo_valido('lucas@gmail.com'), true)
  assert.equal(correo_valido(' lucas.g+demo@empresa.com.ar '), true)
  for (const malo of ['', 'lucas', 'lucas@', 'lucas@gmail', 'lu cas@gmail.com', 'a@b..com', 'x@y.c',
    'a'.repeat(115) + '@b.com']) {
    assert.equal(correo_valido(malo), false, malo)
  }

  assert.deepEqual(validar_datos({ nombre: 'Lucas', whatsapp: '3444 62-2139', email: 'l@x.com',
    rubro: 'ferreteria', fecha: '2026-10-23', hora: '15:00' }), {})
  const errores = validar_datos({ nombre: ' L ', whatsapp: '15622139', email: 'l@x', rubro: 'kiosco' })
  assert.deepEqual(Object.keys(errores).sort(), ['email', 'nombre', 'rubro', 'turno', 'whatsapp'])
  assert.match(errores.whatsapp, /sin 0 ni 15/)
  assert.equal(validar_datos({ whatsapp: '' }).whatsapp, 'Escribí tu WhatsApp.')
  assert.equal(validar_datos({ nombre: 'x'.repeat(81) }).nombre, 'El nombre puede tener hasta 80 letras.')
  assert.equal(RUBROS.length, 14)
  assert.equal(new Set(RUBROS.map((r) => r.slug)).size, 14)
})

test('las cookies del píxel solo viajan si tienen el formato que acepta el admin', () => {
  const cookies = 'otra=1; _fbp=fb.1.1729600000000.123456789; _fbc=fb.1.1729600000000.IwAR-abc_DEF.x'
  assert.equal(leer_cookie_meta(cookies, '_fbp'), 'fb.1.1729600000000.123456789')
  assert.equal(leer_cookie_meta(cookies, '_fbc'), 'fb.1.1729600000000.IwAR-abc_DEF.x')
  assert.equal(leer_cookie_meta('_fbp=basura', '_fbp'), null)
  assert.equal(leer_cookie_meta('x_fbp=fb.1.2.3', '_fbp'), null)
  assert.equal(leer_cookie_meta('_fbp=fb.1.2.' + 'a'.repeat(260), '_fbp'), null)
  assert.equal(leer_cookie_meta('_fbc=%E0%A4%A', '_fbc'), null)
  assert.equal(leer_cookie_meta('', '_fbp'), null)
})

test('event_source_url sale solo desde comerciocity.com y sin query', () => {
  assert.equal(url_de_origen({ hostname: 'comerciocity.com', origin: 'https://comerciocity.com', pathname: '/' }),
    'https://comerciocity.com/')
  assert.equal(url_de_origen({ hostname: 'www.comerciocity.com', origin: 'https://www.comerciocity.com', pathname: '/demo' }),
    'https://www.comerciocity.com/demo')
  assert.equal(url_de_origen({ hostname: 'localhost', origin: 'http://localhost:5179', pathname: '/' }), null)
  assert.equal(url_de_origen(null), null)
})

test('el body lleva exactamente las claves del contrato y lo opcional vacío no viaja', () => {
  const completo = armar_body({
    nombre: '  Lucas   González ', whatsapp: '0 3444 15 622139', email: ' lu@gmail.com ', rubro: 'ferreteria',
    fecha: '2026-10-23', hora: '15:00', sitio_web: '', abierto_hace_ms: 4321.7,
    atribucion: { fbclid: 'abc', utm_source: '', ad_id: '123', vacio: undefined },
    fbp: 'fb.1.2.3', fbc: 'malo', event_source_url: 'https://comerciocity.com/',
  })
  assert.deepEqual(completo, {
    nombre: 'Lucas González', whatsapp: '+5493444622139', email: 'lu@gmail.com', rubro: 'ferreteria',
    fecha: '2026-10-23', hora: '15:00', sitio_web: '', abierto_hace_ms: 4322,
    atribucion: { fbclid: 'abc', ad_id: '123' }, fbp: 'fb.1.2.3', event_source_url: 'https://comerciocity.com/',
  })
  const minimo = armar_body({ nombre: 'Ana', whatsapp: '3444622139', email: 'a@b.com', rubro: 'pesca',
    fecha: '2026-10-23', hora: '09:00', abierto_hace_ms: PISO_ABIERTO_MS, atribucion: {}, fbp: null })
  assert.deepEqual(Object.keys(minimo).sort(),
    ['abierto_hace_ms', 'email', 'fecha', 'hora', 'nombre', 'rubro', 'sitio_web', 'whatsapp'])
  /* El honeypot viaja como quedó: si un robot lo llenó, que lo vea el admin. */
  assert.equal(armar_body({ sitio_web: 'http://spam' }).sitio_web, 'http://spam')
})

test('turnos: 200 bien formado da los días; cualquier otra cosa es error', () => {
  const ok = interpretar_turnos(200, { zona: 'America/Argentina/Buenos_Aires', duracion_minutos: 60,
    dias: [{ fecha: '2026-10-23', etiqueta: 'jue 23/10', nombre: 'jueves', horarios: [{ hora: '15:00', hasta: '17:00' }] }] }, HOY)
  assert.equal(ok.tipo, 'turnos')
  assert.equal(ok.duracion_minutos, 60)
  assert.equal(ok.dias[0].titulo, 'Mañana')
  assert.deepEqual(interpretar_turnos(200, { dias: [] }, HOY), { tipo: 'turnos', dias: [], duracion_minutos: null })
  for (const [status, cuerpo] of [[404, null], [503, { mensaje: 'x' }], [429, null], [200, null], [200, { dias: 'no' }], [0, null]]) {
    assert.deepEqual(interpretar_turnos(status, cuerpo, HOY), { tipo: 'error' })
  }
})

test('reserva 201: URL, texto del turno y solo los eventos Lead/Schedule con su event_id', () => {
  const r = interpretar_reserva(201, {
    experiencia_url: 'https://admin.comerciocity.com/experiencia/5493444622139',
    turno: { fecha: '2026-10-23', desde: '15:00', hasta: '17:00', texto: 'jueves 23/10 de 15:00 a 17:00' },
    correo: 'lu***@gmail.com',
    whatsapp_confirmacion: true,
    meta_eventos: [{ nombre: 'Lead', event_id: 'cc-lead-123-web-lead' }, { nombre: 'Schedule', event_id: 'cc-lead-123-web-schedule' },
      { nombre: 'Purchase', event_id: 'x' }, { nombre: 'Lead', event_id: 'con espacios' }, null],
  }, { hoy: HOY })
  assert.deepEqual(r, {
    tipo: 'reservada',
    experiencia_url: 'https://admin.comerciocity.com/experiencia/5493444622139',
    texto_turno: 'jueves 23/10 de 15:00 a 17:00',
    correo: 'lu***@gmail.com',
    whatsapp_confirmacion: true,
    meta_eventos: [{ nombre: 'Lead', event_id: 'cc-lead-123-web-lead' }, { nombre: 'Schedule', event_id: 'cc-lead-123-web-schedule' }],
  })
  /* Sin texto ni URL utilizable: se arma el texto con lo elegido y no se redirige. */
  const pobre = interpretar_reserva(201, { experiencia_url: 'javascript:alert(1)' },
    { hoy: HOY, fecha: '2026-10-24', hora: '18:00', hasta: '20:00' })
  assert.equal(pobre.experiencia_url, null)
  assert.equal(pobre.texto_turno, 'sábado 24/10 de 18:00 a 20:00')
  assert.deepEqual(pobre.meta_eventos, [])
  /* El WhatsApp de confirmación se promete solo con un true explícito. */
  assert.equal(pobre.whatsapp_confirmacion, false)
  assert.equal(interpretar_reserva(201, { whatsapp_confirmacion: 'true' }, { hoy: HOY }).whatsapp_confirmacion, false)
  assert.equal(interpretar_reserva(201, { whatsapp_confirmacion: 1 }, { hoy: HOY }).whatsapp_confirmacion, false)
})

test('reserva 422: errores por campo (fecha/hora van al turno) o genérico', () => {
  assert.deepEqual(interpretar_reserva(422, { mensaje: 'Revisá los datos.', errores: {
    whatsapp: ['El WhatsApp no es un celular argentino.'], hora: ['El horario no es válido.'], fecha: ['x'], raro: ['y'] } }, {}),
  { tipo: 'campos', mensaje: 'Revisá los datos.', errores: { whatsapp: 'El WhatsApp no es un celular argentino.', turno: 'El horario no es válido.' } })
  assert.deepEqual(interpretar_reserva(422, { mensaje: 'Hay campos no admitidos.' }, {}),
    { tipo: 'invalida', mensaje: 'Hay campos no admitidos.' })
  assert.deepEqual(interpretar_reserva(422, null, {}), { tipo: 'invalida', mensaje: '' })
})

test('reserva 409: turno tomado trae días frescos; los demás códigos, su mensaje', () => {
  const tomado = interpretar_reserva(409, { codigo: 'turno_tomado', mensaje: 'Ese horario ya no está.',
    turnos: [{ fecha: '2026-10-23', horarios: [{ hora: '16:00', hasta: '18:00' }] }] }, { hoy: HOY })
  assert.equal(tomado.tipo, 'turno_tomado')
  assert.equal(tomado.mensaje, 'Ese horario ya no está.')
  assert.deepEqual(tomado.dias.map((d) => d.horarios[0].texto), ['16:00 a 18:00'])
  assert.equal(interpretar_reserva(409, { codigo: 'turno_tomado' }, { hoy: HOY }).dias, null)

  for (const codigo of ['ya_tiene_demo', 'ya_es_cliente', 'ya_hizo_la_demo']) {
    assert.deepEqual(interpretar_reserva(409, { codigo, mensaje: 'Del admin.' }, {}), { tipo: codigo, mensaje: 'Del admin.' })
    assert.equal(interpretar_reserva(409, { codigo }, {}).tipo, codigo)
    assert.ok(interpretar_reserva(409, { codigo }, {}).mensaje.length > 10)
  }
  assert.equal(interpretar_reserva(409, { codigo: 'otro' }, {}).tipo, 'error')
})

test('reserva 429, 503 y cualquier otra cosa', () => {
  assert.deepEqual(interpretar_reserva(429, null, {}), { tipo: 'limite' })
  assert.deepEqual(interpretar_reserva(503, { codigo: 'reintentar' }, {}), { tipo: 'reintentar', mensaje: '' })
  assert.deepEqual(interpretar_reserva(500, { mensaje: 'Server Error' }, {}), { tipo: 'error', mensaje: '' })
  assert.deepEqual(interpretar_reserva(0, null, {}), { tipo: 'error', mensaje: '' })
})

test('pedir_json: sin credenciales ni referrer, JSON adentro y afuera, nunca tira', async () => {
  let visto
  const fetcher = async (url, opciones) => {
    visto = { url, opciones }
    return { status: 201, json: async () => ({ ok: true }) }
  }
  assert.deepEqual(await pedir_json({ url: 'https://x.test/r', metodo: 'POST', body: { a: 1 }, timeout: 1000, fetcher }),
    { status: 201, cuerpo: { ok: true } })
  assert.equal(visto.opciones.credentials, 'omit')
  assert.equal(visto.opciones.referrerPolicy, 'no-referrer')
  assert.equal(visto.opciones.headers['Content-Type'], 'application/json')
  assert.equal(visto.opciones.body, '{"a":1}')

  await pedir_json({ url: 'https://x.test/t', timeout: 1000, fetcher })
  assert.equal(visto.opciones.method, 'GET')
  assert.equal(visto.opciones.body, undefined)

  const sin_json = async () => ({ status: 404, json: async () => { throw new SyntaxError('html') } })
  assert.deepEqual(await pedir_json({ url: 'u', timeout: 1000, fetcher: sin_json }), { status: 404, cuerpo: null })
  const caido = async () => { throw new TypeError('Failed to fetch') }
  assert.deepEqual(await pedir_json({ url: 'u', timeout: 1000, fetcher: caido }), { status: 0, motivo: 'red' })
  const colgado = (url, opciones) => new Promise((resolve, reject) => {
    opciones.signal.addEventListener('abort', () => reject(new Error('abort')))
  })
  assert.deepEqual(await pedir_json({ url: 'u', timeout: 20, fetcher: colgado }), { status: 0, motivo: 'tiempo' })
  assert.deepEqual(await pedir_json({ url: '', timeout: 20, fetcher }), { status: 0, motivo: 'red' })
})
