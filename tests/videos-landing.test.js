import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { parse } from '@vue/compiler-sfc'
import { video_publicado, seleccionar_video } from '../src/videos/disponibilidad.js'
import { pausar_otros } from '../src/videos/reproduccion.js'

const manifiesto = JSON.parse(await readFile(new URL('../src/videos/landing-manifest.json', import.meta.url), 'utf8'))
const tarea = manifiesto.videos.tarea
const url = `https://videos.comerciocity.store/landing-prueba/20261107/01-una-tarea-menos-v6-${tarea.sha256.slice(0, 16)}.mp4`
const publicado = { ...tarea, url, published: true, verified: true }

test('publicación pendiente no crea reproductores ni enlaces rotos', () => {
  for (const video of Object.values(manifiesto.videos)) {
    const pendiente = { ...video, published: false, verified: false, url: '' }
    assert.equal(video_publicado(pendiente), false)
    assert.equal(seleccionar_video(pendiente), null)
  }
})

test('solo se activa el objeto HTTPS versionado, publicado y verificado', () => {
  assert.equal(video_publicado(publicado), true)
  for (const cambio of [
    { published: false }, { verified: false }, { url: '' },
    { url: url.replace('https:', 'http:') }, { url: url.replace('videos.comerciocity.store', 'otro.example') },
    { url: url.replace(tarea.sha256.slice(0, 16), 'otro') }, { url: url + '?token=secreto' },
    { url: url.replace('https://', 'https://usuario:clave@') },
  ]) assert.equal(video_publicado({ ...publicado, ...cambio }), false)
})

test('preview requiere dev, mock sin medición e interruptor explícito; nunca entra al build', () => {
  const entorno = { DEV: true, VITE_PRUEBA_MOCK: '1', VITE_VIDEOS_LANDING_PREVIEW: '1' }
  const pendiente = { ...tarea, published: false, verified: false, url: '' }
  assert.equal(seleccionar_video(pendiente, entorno).url, '/__videos-preview/' + tarea.filename)
  for (const cambio of [{ DEV: false }, { VITE_PRUEBA_MOCK: '0' }, { VITE_VIDEOS_LANDING_PREVIEW: '' }]) {
    assert.equal(seleccionar_video(pendiente, { ...entorno, ...cambio }), null)
  }
})

test('iniciar un video pausa todos los otros medios, sin reiniciar el actual', () => {
  const pausados = []
  const actual = { paused: false, pause() { pausados.push('actual') } }
  const otro = { paused: false, pause() { pausados.push('otro') } }
  const quieto = { paused: true, pause() { pausados.push('quieto') } }
  pausar_otros(actual, { querySelectorAll(selector) { assert.equal(selector, 'video, audio'); return [actual, otro, quieto] } })
  assert.deepEqual(pausados, ['otro'])
})

const fuente = await readFile(new URL('../src/components/recorrido/VideoVoluntario.vue', import.meta.url), 'utf8')
const sfc = parse(fuente)
const componente = (await import('data:text/javascript;base64,' + Buffer.from(
  sfc.descriptor.script.content.replace("import { pausar_otros } from '../../videos/reproduccion.js'", 'const pausar_otros = () => {}')
).toString('base64'))).default

function instancia(reproductor) {
  const vm = { ...componente.data(), $refs: { reproductor }, $nextTick: async () => {} }
  for (const [nombre, funcion] of Object.entries(componente.methods)) vm[nombre] = funcion.bind(vm)
  return vm
}

test('video voluntario con controles y pista opcional, sin autoplay ni audio silenciado impuesto', () => {
  assert.deepEqual(sfc.errors, [])
  assert.match(sfc.descriptor.template.content, /v-if="!abierto"/)
  assert.match(sfc.descriptor.template.content, /controls\s+playsinline\s+preload="none"/)
  assert.doesNotMatch(sfc.descriptor.template.content, /\s(?:autoplay|muted|loop|default)(?:\s|>)/)
  assert.match(sfc.descriptor.template.content, /kind="captions"/)
})

test('clic abre, enfoca y reproduce; pausa/unmount no deja audio', async () => {
  const acciones = []
  const vm = instancia({ focus() { acciones.push('foco') }, async play() { acciones.push('play') }, pause() { acciones.push('pause') } })
  assert.equal(vm.abierto, false)
  await vm.reproducir()
  assert.equal(vm.abierto, true)
  vm.pausar()
  assert.deepEqual(acciones, ['foco', 'play', 'pause'])
})

test('denegación de autoplay conserva controles; error de red muestra reintento; AbortError no miente', async () => {
  for (const nombre of ['NotAllowedError', 'NotSupportedError', 'AbortError']) {
    const vm = instancia({ focus() {}, async play() { throw { name: nombre } } })
    vm.cargando = true
    await vm.reproducir()
    assert.equal(vm.cargando, false)
    assert.equal(vm.pedir_play, nombre === 'NotAllowedError')
    assert.equal(vm.fallo, nombre === 'NotSupportedError')
  }
})

test('otra reproducción pausa este reproductor, su propio evento no lo pausa', () => {
  let pausas = 0
  const medio = { pause() { pausas++ } }
  const vm = instancia(medio)
  vm.coordinar_audio({ target: medio })
  assert.equal(pausas, 0)
  vm.coordinar_audio({ target: {} })
  assert.equal(pausas, 1)
})

test('reintentar pausa la instancia anterior, espera el desmontaje y vuelve a reproducir', async () => {
  const acciones = []
  const vm = instancia({
    pause() { acciones.push('pause') },
    focus() { acciones.push('foco') },
    async play() { acciones.push('play') },
  })
  vm.abierto = true
  vm.fallo = true
  vm.$nextTick = async () => acciones.push(vm.abierto ? 'montado' : 'desmontado')
  await vm.reintentar()
  assert.deepEqual(acciones, ['pause', 'desmontado', 'montado', 'foco', 'play'])
  assert.equal(vm.fallo, false)
})

test('tracks locales coinciden exactamente con los VTT aprobados', async () => {
  for (const [nombre, hash] of [
    ['01-una-tarea-menos-v6.es.vtt', '24c44cd075d7495167111264357a23a6892e24e3e15cb1093bc87a389cf7e2f4'],
    ['02-historia-de-comerciocity-v4.es.vtt', 'eb696a0c1a663e220a55702ec35b92f3d54c9bb109b673f0611002c8ace60ee1'],
  ]) {
    const contenido = await readFile(new URL('../src/assets/videos/' + nombre, import.meta.url))
    assert.equal(createHash('sha256').update(contenido).digest('hex'), hash)
    assert.match(contenido.toString('utf8'), /^WEBVTT/)
  }
})

test('historia es un desplegable; al cerrar desmonta y pausa el reproductor', async () => {
  const fuente = await readFile(new URL('../src/components/recorrido/VideosLanding.vue', import.meta.url), 'utf8')
  assert.match(fuente, /<summary>Conocé la historia/)
  assert.match(fuente, /v-if="historia_abierta"/)
  assert.match(fuente, /@toggle="historia_abierta = \$event.target.open"/)
})
