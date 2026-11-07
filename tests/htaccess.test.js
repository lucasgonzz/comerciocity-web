import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const reglas = await readFile(new URL('../public/.htaccess', import.meta.url), 'utf8')

test('las pistas WebVTT tienen su MIME correcto, limitado a archivos .vtt', () => {
  const bloques = [...reglas.matchAll(/<FilesMatch ([^>]+)>([\s\S]*?)<\/FilesMatch>/g)]
  const vtt = bloques.filter(bloque => bloque[1] === '"\\.vtt$"')
  assert.equal(vtt.length, 1)
  assert.equal(vtt[0][2].trim(), 'ForceType text/vtt')
  assert.equal(reglas.replace(vtt[0][0], '').includes('ForceType text/vtt'), false)
})

test('se conserva el retiro de service worker como JavaScript sin caché', () => {
  const worker = reglas.match(/<Files "service-worker\.js">([\s\S]*?)<\/Files>/)
  assert.ok(worker)
  assert.match(worker[1], /ForceType application\/javascript/)
  assert.match(worker[1], /Header set Cache-Control "no-cache, no-store, must-revalidate"/)
  assert.match(worker[1], /Header set Service-Worker-Allowed "\/"/)
})

test('demo y prueba continúan resolviendo a la SPA antes de las carpetas existentes', () => {
  const rutas = reglas.indexOf('RewriteRule ^(demo|prueba)/?$ /index.html [L]')
  assert.ok(rutas >= 0)
  assert.ok(rutas < reglas.indexOf('RewriteCond %{REQUEST_FILENAME} !-d'))
  assert.ok(reglas.includes('RewriteCond %{REQUEST_FILENAME} !-f'))
  assert.ok(reglas.includes('RewriteRule ^ /index.html [L]'))
})
