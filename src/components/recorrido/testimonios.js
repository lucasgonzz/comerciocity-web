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
 *     (Ferretotal) el 2 y 3/10/2026 desde la llamada de Tomás grabada con Fathom; los de Fernando
 *     (Truvari Bebidas) el 23/10/2026 desde sus dos llamadas, con su permiso; los de Ernesto y
 *     Alejandra (San Cayetano) y Federico (Fenix) se armaron el 13/10/2026 de las llamadas del
 *     28/9 y se publicaron el 23/10/2026, con el permiso de ambos; los de Fabián (Ferretería San
 *     Blas) salieron de la llamada del 27/10/2026 y se publicaron el 28/10/2026. La tabla
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
    id: 'truvari',
    negocio: 'Truvari Bebidas',
    persona: 'Fernando',
    rubro: 'Distribuidora de vinos en Córdoba',
    cita: 'Si me preguntás si lo recomendaría, sí, totalmente que lo recomiendo.',
    logo: 'truvari',
    clips: clips('test-truvari', [
      ['01-lo-recomiendo-totalmente', 'Lo recomiendo totalmente', 31],
      ['02-google-se-amigo-con-la-pagina', 'Google se amigó con la página', 39],
      ['03-me-ayuda-a-vender-me-encanta', 'Me ayuda a vender, me encanta', 33],
      ['04-es-directamente-proporcional', 'Es directamente proporcional', 29],
    ]),
    entrevista: null,
  },
  {
    id: 'san-cayetano',
    negocio: 'Ferretería San Cayetano',
    persona: 'Ernesto y Alejandra',
    rubro: 'Corralón y ferretería con dos sucursales',
    cita: 'Siempre hubo solución, siempre.',
    logo: 'ernesto',
    clips: clips('test-san-cayetano', [
      ['01-puse-el-sistema-para-abrir-otra-sucursal', 'Puse el sistema para abrir otra sucursal', 39],
      ['02-un-excel-de-cada-proveedor', 'Un Excel de cada proveedor', 32],
      ['03-buscas-en-cualquier-orden-y-lo-encuentra', 'Buscás en cualquier orden y lo encuentra', 40],
      ['04-es-facil-los-chicos-lo-entienden', 'Es fácil, los chicos lo entienden', 18],
      ['05-la-primera-vez-que-trabajo-con-un-sistema', 'La primera vez que trabajo con un sistema', 25],
      ['06-antes-dividia-los-precios-uno-por-uno', 'Antes dividía los precios uno por uno', 41],
    ]),
    entrevista: null,
  },
  {
    id: 'fenix',
    negocio: 'Fenix Mayorista',
    persona: 'Federico',
    rubro: 'Mayorista de juguetería y bazar en Rosario',
    cita: 'El 70 % de las ventas hoy son por ahí.',
    logo: 'fenix',
    clips: clips('test-fenix', [
      ['01-el-70-por-ciento-de-las-ventas-por-la-tienda', 'El 70 % de las ventas, por la tienda', 31],
      ['02-fuimos-el-primer-cliente', 'Fuimos el primer cliente', 13],
      ['03-el-buscador-te-filtra-tres-cosas', 'El buscador te filtra tres cosas', 17],
    ]),
    entrevista: null,
  },
  {
    id: 'san-blas',
    negocio: 'Ferretería San Blas',
    persona: 'Fabián',
    rubro: 'Ferretería y corralón en Laguna Blanca',
    cita: 'La hora que sea, ustedes siempre estuvieron.',
    logo: 'ferreteria-san-blas',
    clips: clips('test-san-blas', [
      ['01-la-unica-ferreteria-con-todo-en-el-sistema', 'La única ferretería con todo en el sistema', 26],
      ['02-la-hora-que-sea-siempre-estuvieron', 'La hora que sea, siempre estuvieron', 26],
      ['03-el-que-mas-encajaba-era-comerciocity', 'El que más encajaba era ComercioCity', 40],
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
