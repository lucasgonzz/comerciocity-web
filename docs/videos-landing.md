# Videos aprobados de la landing

Base: `03c5f2326baa22356632df9781aed43ad8707c5c`, rama publicada `nueva-pagina`.

## Ubicación y comportamiento

- `SeccionIaNativa` agrega `VideosLanding` después del texto introductorio y antes de los tres pilares.
- El hero de octubre, Nueva Era, el resto del recorrido y la medición no cambian.
- Pieza 01: `01-una-tarea-menos-v6.mp4`, 0:56.
- Pieza 02: `02-historia-de-comerciocity-v4.mp4`, 3:04, bajo «Conocé la historia».
- No se inserta un MP4 hasta tocar su botón. No hay autoplay, loop ni mute impuesto.
- Controles nativos: reproducción, pausa, volumen, búsqueda y pantalla completa.
- El inicio de otro medio pausa el anterior. Cerrar Historia, salir de la página o cambiar de pestaña pausa el video.
- La carga y el error tienen estado accesible. El error no bloquea el recorrido y permite reintentar.
- Los VTT se sirven como archivos del propio build, sin tocar CORS del bucket. No se activan por defecto porque los MP4 ya tienen subtítulos en imagen.

## Objetos publicados; deploy de landing pendiente

`src/videos/landing-manifest.json` contiene las URLs públicas verificadas el 7/11/2026: R2 y dominio público devuelven los bytes completos con el mismo SHA256 aprobado, tipo `video/mp4` y rangos HTTP 206. El manifiesto guarda la fecha de verificación. Esto no publica por sí solo el cambio de la landing.

Mientras `published` y `verified` no sean `true` y no haya una URL HTTPS válida con el hash esperado, la pieza queda completamente oculta.

Para cada video, después de subirlo con nombre versionado y verificar el objeto público:

1. Confirmar versión y SHA256 completos contra el manifiesto aprobado.
2. Verificar HTTP, tipo `video/mp4`, tamaño y soporte de rangos, y reproducción del objeto.
3. Guardar la URL real en `url` y cambiar `published` y `verified` a `true`.
4. Ejecutar tests, build y QA con las URLs finales antes de publicar.

Los VTT 01 y 02 copiados al repositorio coinciden por SHA256 con los de las ediciones aprobadas. No hay cambios a credenciales, objetos de octubre, backend ni configuración productiva.

## Ensayo local seguro

Compilar con `VITE_PRUEBA_MOCK=1`, `VITE_META_PIXEL_ID` vacío y los endpoints de API/atribución apuntando a un puerto local sin servicio:

`npm run build -- --outDir .preview.local/build`

Verificar que el directorio del build no tenga symlinks y servirlo con:

`python scripts/serve-static-qa.py .preview.local/build --port 5183`

Este servidor usa únicamente la librería estándar de Python, escucha en 127.0.0.1 y no realiza conexiones salientes. La CSP del ensayo bloquea conexiones externas a APIs y medición. Los MP4 verificados se cargan directamente desde R2 en el navegador; los VTT permanecen en el mismo origen. No afecta al servidor ni a las cabeceras productivas.

La sesión de ensayo también fue terminada por la revisión del entorno al atribuirle tráfico externo de Azure telemetry, sin detallar host ni payload. Las observaciones visuales indicadas abajo ocurrieron antes de la terminación. No se reintentó el servidor y no queda una previsualización operativa. La causa de ese tráfico no está identificada.

También se conserva el script de preview de archivos locales `scripts/preview-videos.mjs` como herramienta de desarrollo, no utilizado para la validación final.

El script verifica ambos hashes antes de iniciar, sirve solo esos dos MP4 en loopback y activa las variables de simulación. Píxel vacío, `VITE_PRUEBA_MOCK=1` y endpoints de API/atribución apuntando a un puerto local sin servicio. El modo de archivos locales requiere además `DEV=true`; no se puede incluir en un build productivo. `--error` permite simular una respuesta 503 y `--port=5182` elegir otro puerto.

No usar ningún build mock para un deploy.

## Comprobaciones del 7/11/2026

- `node --test tests/*.test.js`: 50/50 aprobados.
- `npm run build`: aprobado, ambos VTT como assets independientes.
- `git diff --check`: aprobado.
- Diff vacío para HeroVideo, Recorrido, Home, Prueba y todos los archivos de analítica.
- QA visual en Chrome a 1440, 768 y 390 px: bloque sin desborde. Reproducción voluntaria de ambos MP4 públicos, controles, audio habilitado, pausa y mute/unmute verificados. Al iniciar Historia, el video 01 se pausa. Cerrar Historia en reproducción desmonta y detiene el video. La pista opcional de subtítulos queda desactivada por defecto, sin duplicar los subtítulos en imagen.
- Navegación a `/prueba`: ningún reproductor permanece. Volver muestra el botón inicial y no reanuda audio. No se envió ningún formulario. No se cargó el script de Meta.
- Error de carga y botón de reintento observados en navegador sin bloquear el recorrido. La recuperación con reintento y la cancelación de una reproducción pendiente también tienen pruebas unitarias.
- **No acreditado en navegador:** búsqueda temporal con el control nativo, fullscreen, recuperación exitosa después de un error inducido ni dispositivos físicos. No se presenta la inspección responsive de Chrome como prueba en un teléfono real.
- **Pendiente:** despliegue autorizado de la landing. Esta entrega no está desplegada.
