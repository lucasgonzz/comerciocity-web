/**
 * Los testimonios en video: un negocio por entrada, con todos los clips que salieron de su
 * videollamada. La sección (SeccionTestimonios.vue) muestra los negocios y, al tocar uno,
 * sus clips.
 *
 * DE DÓNDE SALE CADA COSA.
 *   · Los reels viven en el bucket público de R2 (`videos.comerciocity.store`). No van en el
 *     repo: pesan entre 5 y 24 MB cada uno.
 *   · Las miniaturas (`src/assets/testimonios/*.webp`, 540 px de ancho) salen del propio
 *     video (un cuadro a 1,5 s para los de Mariel; la placa de apertura para los de Pablo).
 *   · Los cortes de Mariel (Innovate Materiales) se armaron en agosto de 2026; los de Pablo
 *     (Ferretotal) el 2 y 3/10/2026 desde la llamada de Tomás grabada con Fathom. La tabla
 *     de origen está en `comercial/contenido_para_nutrir.md` y en
 *     `_video/testimonios/ferretotal/ESTADO.md` del repo de conocimiento.
 *   · Las entrevistas completas de Innovate y Pack Descartables (16:9, 8 y 10 minutos) son
 *     los videos que ya publicaba esta web; siguen en `/images/testimonials/` del hosting,
 *     fuera del repo.
 *
 * 🔴 Las citas son frases que la persona dice en el video, no redacción nuestra. Para sumar
 * un negocio: una entrada más, con sus clips y sus miniaturas. Nada más que tocar.
 */

const R2 = 'https://videos.comerciocity.store/'

/**
 * @param {string} archivo
 * @returns {string}
 */
function miniatura(archivo) {
  return new URL(`../../assets/testimonios/${archivo}.webp`, import.meta.url).href
}

/**
 * @param {string} prefijo  Prefijo del archivo en R2 y en las miniaturas.
 * @param {Array<[string, string, number]>} lista  [sufijo, título, segundos]
 * @returns {Array<{id: string, titulo: string, url: string, poster: string, segundos: number}>}
 */
function clips(prefijo, lista) {
  return lista.map(([sufijo, titulo, segundos]) => ({
    id: prefijo + '-' + sufijo,
    titulo,
    url: R2 + prefijo + '-' + sufijo + '.mp4',
    poster: miniatura(prefijo + '-' + sufijo),
    segundos,
  }))
}

export const testimonios = [
  {
    id: 'innovate',
    negocio: 'Innovate Materiales',
    persona: 'Mariel',
    rubro: 'Corralón y materiales de construcción',
    cita: 'Lo que más nos gustó fue que hubo una persona detrás.',
    logo: 'innovate',
    clips: clips('test-mariel', [
      ['01-lio-total', 'Un lío total.', 25],
      ['02-presupuestos', 'Perdía ventas porque no pasaba los presupuestos', 22],
      ['03-velocidad', 'La velocidad de pasar presupuestos y sacar costos', 20],
      ['04-clientes', 'Los clientes se quedaban en el aire', 30],
      ['05-facturacion', 'La facturación electrónica fue una ayuda terrible', 14],
      ['06-bots-vs-persona', 'Hubo una persona detrás', 32],
      ['07-precio', 'Cuando el dinero está en orden, lo sabés', 28],
      ['08-proveedores', 'Ahora encuentro todo lo que le compré a cada proveedor', 22],
      ['09-aliviada', 'Aliviada.', 24],
      ['10-consejos', 'Tres consejos: se puede confiar', 42],
    ]),
    entrevista: {
      url: '/images/testimonials/innovate_testimonio.mp4',
      titulo: 'La entrevista completa',
      segundos: 602,
    },
  },
  {
    id: 'ferretotal',
    negocio: 'Ferretotal',
    persona: 'Pablo',
    rubro: 'Ferretería en Matheu, Buenos Aires',
    cita: 'Hoy el sistema me está respondiendo. Para mí es el mil.',
    logo: 'ferretotal',
    clips: clips('test-ferretotal', [
      ['01-mostrador-es-el-mil', 'Para mí es el mil', 50],
      ['02-muy-feliz-de-haber-conocido-comerciocity', 'Muy feliz de haber conocido ComercioCity', 16],
      ['03-antes-10-minutos-por-boleta', 'Antes, diez minutos por boleta', 43],
      ['04-tercer-sistema-y-este-no-lo-cambio', 'Es mi tercer sistema, y este no lo cambio', 27],
      ['05-me-lo-recomendo-un-colega', 'Me lo recomendó un colega', 25],
      ['06-el-80-por-ciento-se-lo-dije-yo', 'El 80 % de las mejoras las pedí yo', 22],
      ['07-me-siento-comodo-con-el-sistema', 'Me siento cómodo para crecer', 34],
    ]),
    entrevista: null,
  },
  {
    id: 'pack-descartables',
    negocio: 'Pack Descartables',
    persona: 'Franco',
    rubro: 'Distribuidora de descartables',
    cita: 'Implementamos sin frenar la distribución. Un 10 en atención.',
    logo: 'pack-descartables',
    clips: [],
    entrevista: {
      url: '/images/testimonials/pack_testimonio.mp4',
      titulo: 'La entrevista completa',
      segundos: 492,
    },
  },
]

/**
 * Duración legible de un clip ("0:25", "10:02").
 *
 * @param {number} segundos
 * @returns {string}
 */
export function duracion(segundos) {
  const total = Math.round(Number(segundos) || 0)
  const min = Math.floor(total / 60)
  const seg = total % 60
  return min + ':' + (seg < 10 ? '0' : '') + seg
}
