import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import {
  PLANES, PROMO, PREGUNTAS, NEGOCIOS_QUE_LO_USAN, VIDEO_FUNCIONANDO, PARTES, ANTES_AHORA, USUARIO_EXTRA, formatear_pesos,
} from '../src/components/landing/datos.js'
import { TEXTO_CTA } from '../src/analitica/atribucion-whatsapp.js'

/* La landing nueva (misión `landing-nueva`, 13/11/2026): lo que AFIRMA y lo que MIDE. */

const leer = (ruta) => readFile(new URL('../' + ruta, import.meta.url), 'utf8')

test('los planes son los mismos de la página anterior y la cifra que se ve es la del descuento', () => {
  assert.deepEqual(PLANES.map((p) => p.promocional), [27950, 42700, 99700, 131500])
  assert.deepEqual(PLANES.map((p) => p.mensual), [55900, 85400, 199400, 263000])
  PLANES.forEach((p) => assert.equal(p.promocional * 2, p.mensual, p.nombre))
  assert.equal(USUARIO_EXTRA, 30400)
  assert.equal(formatear_pesos(27950), '$27.950')
})

test('la promo es la vigente, sin mes inventado, y junto a un monto dice «con» el descuento', () => {
  assert.match(PROMO.descuento, /50 %.*3 meses/)
  assert.match(PROMO.junto_al_precio, /^con el 50 %/)
  Object.values(PROMO).forEach((texto) => assert.doesNotMatch(texto, /noviembre|cyber/i))
})

test('lo que la página afirma no promete lo que no está verificado', () => {
  /* Sin número: el 26/10/2026 Lucas pidió no publicarlo, y el «60» de la maqueta era falso. */
  assert.doesNotMatch(NEGOCIOS_QUE_LO_USAN, /\d/)
  /* El asistente no espera confirmación en todo (modo Resuelto y Directo, manual_sistema/ia/asistente.md). */
  assert.doesNotMatch(JSON.stringify(PREGUNTAS), /no se registra nada|nada se registra/)
  const todo = JSON.stringify({ PREGUNTAS, PARTES, ANTES_AHORA })
  assert.doesNotMatch(todo, /Mercado Libre/, 'Mercado Libre no se habilita a clientes nuevos (posicionamiento)')
  assert.doesNotMatch(todo, /una persona/, 'Martín es el soporte; la página no dice que es una persona')
  PREGUNTAS.forEach((p) => {
    assert.ok(p.pregunta.endsWith('?'), p.clave)
    assert.ok(p.respuesta.length > 40, p.clave)
  })
})

test('el video corto es un objeto publicado de R2 y se baja solo al tocarlo', async () => {
  const url = new URL(VIDEO_FUNCIONANDO.url)
  assert.equal(url.protocol, 'https:')
  assert.equal(url.hostname, 'videos.comerciocity.store')
  assert.ok(url.pathname.endsWith('.mp4'))
  const fuente = await leer('src/components/landing/PruebaSocial.vue')
  assert.match(fuente, /v-if="reproduciendo"/)
  assert.match(fuente, /preload="none"/)
})

test('los botones emiten los mismos eventos que traduce el píxel, con la sección', async () => {
  const botones = await leer('src/components/landing/BotonesPrueba.vue')
  assert.match(botones, /emitir_evento\('prueba_cta_tocado', \{ desde: this\.desde \}\)/)
  assert.match(botones, /emitir_evento\('cta_demo_tocado', \{ desde: this\.desde \}\)/)
  assert.match(botones, /to="\/prueba"/)
  const barra = await leer('src/components/landing/BarraFija.vue')
  assert.match(barra, /prueba_cta_tocado', \{ desde: 'barra_fija' \}/)
  assert.match(barra, /cta_demo_tocado', \{ desde: 'barra_fija' \}/)
  const precios = await leer('src/components/landing/Precios.vue')
  assert.match(precios, /<botones-prueba\s+desde="precio"/, 'el precio ofrece la prueba y el WhatsApp, como antes')
  const cierre = await leer('src/components/landing/Cierre.vue')
  assert.match(cierre, /cta_demo_tocado', \{ desde: 'pie' \}/)
})

test('cada sección se reporta con su id, y se conservan los de precio, testimonios y cierre', async () => {
  const landing = await leer('src/components/landing/Landing.vue')
  assert.match(landing, /emitir_evento\('scroll_bloque_visible', \{ bloque_id:/)
  const ids = []
  for (const archivo of ['LandingHero', 'PruebaSocial', 'TresPartes', 'AntesAhora', 'SeccionRobotito', 'Testimonios', 'Precios', 'ComoArrancas', 'Preguntas', 'Cierre']) {
    const fuente = await leer('src/components/landing/' + archivo + '.vue')
    const m = fuente.match(/data-seccion="([a-z_.]+)"/)
    assert.ok(m, archivo + ' sin data-seccion')
    ids.push(m[1])
  }
  assert.equal(new Set(ids).size, ids.length, 'ids repetidos')
  for (const id of ['precio', 'testimonios', 'cta']) assert.ok(ids.includes(id), id)
})

test('Home monta la landing y sigue armando el WhatsApp con la referencia de la visita', async () => {
  const home = await leer('src/views/Home.vue')
  assert.match(home, /<landing\b/)
  assert.doesNotMatch(home, /<recorrido\b/)
  assert.match(home, /solicitar_referencia\(/)
  assert.match(home, /armar_url_whatsapp\(reference\)/)
  assert.match(home, /registrar_evento\(nombre, payload\)/)
})

test('el texto del WhatsApp no cambia hasta que el admin de producción reconozca la frase nueva', () => {
  /* El admin saca `leads.origen` y el primer paso de Martín de esta frase (LeadOrigenService::FRASE_LANDING).
     «Hola, quiero probar ComercioCity» entra recién cuando `FRASE_LANDING_PRUEBA` esté desplegada. */
  assert.equal(TEXTO_CTA, 'Hola, quiero hacer la demo de ComercioCity')
})
