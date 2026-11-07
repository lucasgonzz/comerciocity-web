/** Ensayo local aislado. Nunca publica, nunca carga el píxel ni envía un alta real.
 * node scripts/preview-videos.mjs C:/ruta/a/editados [--error] [--port=5181]
 */
import { createServer } from 'vite'
import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const directorio = process.argv[2]
if (!directorio || directorio.startsWith('--')) throw new Error('Indicá el directorio de los MP4 aprobados.')
const manifiesto = JSON.parse(await readFile(new URL('../src/videos/landing-manifest.json', import.meta.url)))
const archivos = new Map()
for (const video of Object.values(manifiesto.videos)) {
  const archivo = path.resolve(directorio, video.filename)
  const hash = createHash('sha256')
  for await (const parte of createReadStream(archivo)) hash.update(parte)
  if (hash.digest('hex') !== video.sha256) throw new Error('El archivo no coincide con el aprobado: ' + video.filename)
  archivos.set('/__videos-preview/' + video.filename, { archivo, size: (await stat(archivo)).size })
}

process.env.VITE_PRUEBA_MOCK = '1'
process.env.VITE_META_PIXEL_ID = ''
process.env.VITE_VIDEOS_LANDING_PREVIEW = '1'
process.env.VITE_ADMIN_API_BASE = 'http://127.0.0.1:9/api'
process.env.VITE_WHATSAPP_REFERENCIAS_URL = 'http://127.0.0.1:9/disabled'
const error = process.argv.includes('--error')
const port = Number(process.argv.find(arg => arg.startsWith('--port='))?.split('=')[1] || 5181)
const server = await createServer({
  server: { host: '127.0.0.1', port, strictPort: true },
  plugins: [{
    name: 'videos-aprobados-solo-local',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const ruta = new URL(req.url, 'http://127.0.0.1').pathname
        const entrada = archivos.get(ruta)
        if (!entrada) return next()
        if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); return res.end() }
        if (error) { res.writeHead(503); return res.end('Fallo simulado para QA local') }
        let inicio = 0
        let fin = entrada.size - 1
        const rango = req.headers.range
        if (rango) {
          const match = /^bytes=(\d+)-(\d*)$/.exec(rango)
          if (!match) { res.writeHead(416, { 'Content-Range': `bytes */${entrada.size}` }); return res.end() }
          inicio = Number(match[1])
          fin = match[2] ? Math.min(Number(match[2]), fin) : fin
          if (inicio > fin || inicio >= entrada.size) {
            res.writeHead(416, { 'Content-Range': `bytes */${entrada.size}` }); return res.end()
          }
        }
        const cabeceras = { 'Content-Type': 'video/mp4', 'Accept-Ranges': 'bytes',
          'Content-Length': fin - inicio + 1, 'Cache-Control': 'no-store' }
        if (rango) cabeceras['Content-Range'] = `bytes ${inicio}-${fin}/${entrada.size}`
        res.writeHead(rango ? 206 : 200, cabeceras)
        if (req.method === 'HEAD') return res.end()
        const stream = createReadStream(entrada.archivo, { start: inicio, end: fin })
        stream.on('error', () => res.destroy())
        res.on('close', () => stream.destroy())
        stream.pipe(res)
      })
    },
  }],
})
await server.listen()
console.log(`Vista local con medición deshabilitada: http://127.0.0.1:${port}${error ? ' (error simulado)' : ''}`)
