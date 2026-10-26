/**
 * Índice de logos de clientes reales de ComercioCity, para la sección de clientes de la
 * página (SeccionClientes.vue).
 *
 * HISTORIA. Nació en este mismo repo (`src/data/clients.js`), la página de experiencia del
 * admin lo portó el 10/9/2026 recomprimiendo los logos (lado largo 320 px, WebP q82) y le
 * sumó nueve clientes el 11/9/2026. El 4/10/2026 la web pública volvió a tomar ESA versión
 * (misión `web-unificada`): los archivos `.webp` de `src/assets/clients/` son los del admin,
 * y los PNG/JPEG originales de 8,9 MB se retiraron del repo (quedan en el historial de git).
 *
 * ⚠️ Son dos copias (admin-spa y acá) y se mantienen a mano. Si Lucas suma un cliente en una,
 * en la otra no aparece solo.
 */

/**
 * URL final del logo, resuelta por Vite. El literal de plantilla no es cosmético: Vite
 * necesita ver el patrón para armar el glob de `../../assets/clients/*.webp` en build --
 * con una variable armada por concatenación no emite ningún asset y en producción quedan
 * las imágenes rotas aunque en `npm run dev` se vean perfectas.
 *
 * @param {string} id Slug del cliente, que es también el nombre del archivo.
 * @returns {string}
 */
export function logo_cliente(id) {
  return new URL(`../../assets/clients/${id}.webp`, import.meta.url).href
}

/**
 * Los logos, en el orden del índice histórico. `en_la_pared: false` marca archivos que
 * existen pero no se muestran (duplicados o piezas que no son un logo; ver cada nota).
 *
 * Medido contra `clients` del admin de producción el 4/10/2026: 53 filas, de las que son
 * negocios reales unas 48 (sin DEMO, el registro de Lucas, Scrap Free, un promovido sin
 * instalar y un duplicado). Los que operan y no tienen logo cargado en ningún lado (Rosmar,
 * Feitoamao, Electro Lacarra, Kas, Jorge Bello) no están acá: no se fuerza un logo malo.
 *
 * Vuelto a medir el 26/10/2026 (`claude/query?model=client`, 53 filas, todas `is_active`):
 * son clientes actuales 50 (afuera DEMO, el registro de Lucas y Scrap Free; Kas y Jorge Bello
 * no tienen ClientApi pero operan en la base compartida del shared, y Distribuidora Pets opera
 * con base y tienda propias). Los que faltaban se buscaron en la imagen del usuario dueño
 * (`users.image_url`) y en `online_configurations.logo_url` de la base de cada uno, por SSH de
 * solo lectura. Entraron siete (tanda del 26/10, al final de la lista: seis a la pared y
 * Ananda fuera de ella); Rosmar y Feitoamao ya tienen logo cargado. Siguen afuera, sin
 * logo usable:
 *   · Electro Lacarra: su imagen apunta al storage de la demo y da 404.
 *   · Kas (Kablan): sin imagen, y su dominio kasaberturas.com ya no resuelve.
 *   · Jorge Bello: lo cargado es la foto de una tarjeta con teléfono y mail, no un logo.
 * Bad Girls, Chevrocar, MZA Group y Renacer Joyas siguen en la pared pero ya no figuran en
 * `clients` del admin: se dejan hasta que Lucas decida.
 */
export const clientes = [
  { id: 'golonorte', nombre: 'Distribuidora Golonorte' },
  { id: 'fenix', nombre: 'Fenix Mayorista' },
  { id: '3dtisk', nombre: '3D Tisk' },
  { id: 'angeles-bad-girls', nombre: 'Bad Girls' },
  { id: 'arfren', nombre: 'Arfren Autopartes' },
  { id: 'chevrocar', nombre: 'Chevrocar' },
  { id: 'christian', nombre: 'Distribuidora CF' },
  { id: 'desire', nombre: 'Tienda Desire' },
  { id: 'ernesto', nombre: 'Ferretería San Cayetano' },
  { id: 'ferreteria-san-blas', nombre: 'Ferretería San Blas' },
  // Mismo logo que `panchito`, letra por letra.
  { id: 'fernando', nombre: 'Despensa Panchito', en_la_pared: false },
  { id: 'ferremas', nombre: 'Ferremas' },
  { id: 'ferretotal', nombre: 'Ferretotal Matheu' },
  { id: 'mza-group', nombre: 'MZA Group' },
  { id: 'sr-imperio-gerardo', nombre: 'Sr. Imperio' },
  { id: 'golden-breeze', nombre: 'Golden Breeze' },
  { id: 'hb-distribuciones', nombre: 'HB Distribuciones' },
  { id: 'hipermax', nombre: 'Hiper-Max' },
  { id: 'ht5', nombre: 'Hitotes' },
  { id: 'innovate', nombre: 'Innovate Materiales' },
  { id: 'la-martina', nombre: 'Despensa La Martina' },
  // No es un logo: es la pieza de un sorteo de fin de año de Trama.
  { id: 'trama-luis', nombre: 'Trama Ferretería', en_la_pared: false },
  { id: 'masquito', nombre: 'Masquito' },
  { id: 'matias-galvan', nombre: 'Galván Mayorista' },
  { id: 'mb-malizia', nombre: 'MB Malizia' },
  { id: 'golden-bike', nombre: 'Goldenbike Tandil' },
  { id: 'oliva', nombre: 'Ferretería Oliva' },
  { id: 'distri-creo', nombre: 'Creo Distribuidora' },
  { id: 'panchito', nombre: 'Despensa Panchito' },
  { id: 'racing-carts', nombre: '2R Racing Parts' },
  { id: 'renacer-joyas', nombre: 'Renacer Joyas' },
  { id: 'roberto', nombre: 'Ferretería Rober' },
  { id: 'ffperformance', nombre: 'FF Performance' },
  // La otra marca de Sr. Imperio (CrediHogar).
  { id: 'sr-imperio', nombre: 'CrediHogar', en_la_pared: false },
  { id: 'trama', nombre: 'Trama Ferretería' },
  { id: 'truvari', nombre: 'Truvari' },
  { id: 'kiosco-verde', nombre: 'Kiosco Verde' },
  { id: 'servian', nombre: 'Servian Repuestos' },
  // Tanda del 11/9/2026 (logos leídos de la configuración de la tienda o del perfil del dueño).
  { id: 'securepoint', nombre: 'Secure Point' },
  { id: 'la-cava-de-don-juan', nombre: 'La Cava de Don Juan' },
  { id: 'punto-diet', nombre: 'Punto Diet' },
  { id: 'grupolimp', nombre: 'Grupo Limp' },
  { id: 'unicas', nombre: 'Unicas Distribuidora Capilar' },
  { id: 'tiju', nombre: 'Distribuidora Tiju' },
  { id: 'quino2', nombre: 'Grupo Quino2' },
  { id: 'pack-descartables', nombre: 'Pack Descartables' },
  { id: 'candyguay', nombre: 'Candyguay' },
  // Tanda del 26/10/2026 (imagen del dueño en la base de cada cliente; ver la cabecera).
  { id: 'doblep-herrajes', nombre: 'DobleP Herrajes' },
  { id: 'mayorista-de-pesca', nombre: 'Mayorista de Pesca' },
  { id: 'los-pena', nombre: 'Distribuidora Los Peña' },
  { id: 'distribuidora-pets', nombre: 'Distribuidora Pets' },
  { id: 'rosmar', nombre: 'Distribuidora Ros-Mar' },
  { id: 'feitoamao', nombre: 'Feito a Mão' },
  // Cliente actual, pero el logo es de un club cannábico ("420 Club & Breeding"): fuera de la
  // pared hasta que Lucas lo decida, porque la página es destino de los anuncios de Meta.
  { id: 'ananda', nombre: 'Ananda', en_la_pared: false },
]

/**
 * Los que efectivamente van a la pared de logos. El número no está atado a la grilla: la
 * pared es un flex centrado, así que agregar o sacar uno no toca ninguna regla de CSS.
 */
export const logos_clientes = clientes
  .filter((cliente) => cliente.en_la_pared !== false)
  .map((cliente) => ({
    id: cliente.id,
    nombre: cliente.nombre,
    logo: logo_cliente(cliente.id),
  }))

/**
 * Clientes con tienda online real. Las de `'comerciocity'` son nuestra tienda (tienda-spa,
 * sobre la misma base que el sistema); las de `'tiendanube'` son tiendas de Tienda Nube
 * conectadas al sistema por la integración (el catálogo y el stock salen de acá). La
 * etiqueta de cada tarjeta dice cuál es cuál, y por eso el campo tiene que ser VERDADERO
 * tienda por tienda: se mira el HTML de la tienda, no el nombre del cliente.
 *
 * Verificadas una por una el 4/10/2026 (HTTP 200 + plataforma leída del HTML):
 *   · 2R volvió a estar en línea (el 11/9 respondía "tienda suspendida"): se prende.
 *   · Unicas pasó a ser tienda ComercioCity (instalada el 21/9/2026).
 *   · Entran La Cava de Don Juan (20/9) y DobleP Herrajes (22/9), las dos tienda ComercioCity.
 *
 * Vueltas a verificar el 26/10/2026, las 17 de arriba más las nuevas: HTTP 200 + plataforma
 * leída del HTML; en las nuestras, además, la tienda-api del `config.js` (o del bundle)
 * devolviendo artículos en `/api/articles/featured-last-uploads/{commerce_id}`, y las cuatro
 * nuevas miradas en el navegador con el catálogo cargado. Ninguna está caída.
 *   · Entran cuatro tiendas ComercioCity que no estaban en el módulo de ecommerce del admin
 *     (las del VPS y la de Pets, en el shared): Masquito, Mayorista de Pesca, Los Peña y
 *     Distribuidora Pets.
 *   · Entra HT5 (ht5.com.ar, Tienda Nube; el admin la marca `tiene_tienda_nube`).
 *   · DobleP ya tiene logo (el del dueño): se le saca `sin_logo`.
 *   · Ojo con la etiqueta Tienda Nube: sincronizan por la integración (TN_USER_ID en el
 *     `.env` de su empresa-api) solo Trama, 3DTisk y 2R. Golden Breeze, Innovate y HT5 son
 *     tiendas de Tienda Nube de clientes actuales, pero sin la integración medida.
 *   · Afuera: Kas (kasaberturas.com ya no resuelve), y SecurePoint y El Kiosco Verde, que el
 *     admin marca con ecommerce pero no tienen tienda publicada que se haya encontrado.
 *
 * `activa: false` saca una tienda de la página sin borrar su entrada. `sin_logo: true` dibuja
 * la inicial del nombre en lugar de la imagen (hoy no lo usa ninguna).
 */
export const clientes_ecommerce = [
  { id: 'ferretotal', nombre: 'Ferretotal', rubro: 'Ferretería', url: 'https://ferretotalmatheu.com.ar/', plataforma: 'comerciocity' },
  { id: 'hb-distribuciones', nombre: 'HB Distribuciones', rubro: 'Ferretería', url: 'https://hb-distribuciones.com.ar/', plataforma: 'comerciocity' },
  { id: 'trama', nombre: 'Trama', rubro: 'Ferretería', url: 'https://tramaferreteria.com.ar/', plataforma: 'tiendanube' },
  { id: 'truvari', nombre: 'Truvari', rubro: 'Distribuidora de bebidas', url: 'https://truvaribebidas.com.ar/', plataforma: 'comerciocity' },
  { id: 'fenix', nombre: 'Fenix', rubro: 'Juguetería mayorista', url: 'https://fenix-mayorista.com.ar/', plataforma: 'comerciocity' },
  { id: 'golonorte', nombre: 'Golonorte', rubro: 'Distribuidora', url: 'https://golonorte.com.ar/', plataforma: 'comerciocity' },
  { id: 'matias-galvan', nombre: 'Galván Mayorista', rubro: 'Distribuidora', url: 'https://galvanmayorista.com.ar/', plataforma: 'comerciocity' },
  { id: 'racing-carts', nombre: '2R Racing Parts', rubro: 'Importadora', url: 'https://dosrracingparts.mitiendanube.com/', plataforma: 'tiendanube' },
  { id: 'tiju', nombre: 'Tiju Distribuidora', rubro: 'Distribuidora', url: 'https://tijudistribuidora.com.ar/', plataforma: 'comerciocity' },
  { id: 'grupolimp', nombre: 'Grupo Limp', rubro: 'Limpieza', url: 'https://grupolimp.com.ar/', plataforma: 'comerciocity' },
  { id: 'quino2', nombre: 'Quino2', rubro: 'Distribuidora', url: 'https://quino2.com.ar/', plataforma: 'comerciocity' },
  { id: 'unicas', nombre: 'Unicas', rubro: 'Productos capilares', url: 'https://unicas.com.ar/', plataforma: 'comerciocity' },
  { id: 'la-cava-de-don-juan', nombre: 'La Cava de Don Juan', rubro: 'Vinoteca', url: 'https://lacavadedonjuan.com.ar/', plataforma: 'comerciocity' },
  { id: 'doblep-herrajes', nombre: 'DobleP Herrajes', rubro: 'Herrajes', url: 'https://doblepherrajes.com.ar/', plataforma: 'comerciocity' },
  { id: 'golden-breeze', nombre: 'Golden Breeze', rubro: 'Mascotas', url: 'https://goldenbreeze.mitiendanube.com/', plataforma: 'tiendanube' },
  { id: 'innovate', nombre: 'Innovate Materiales', rubro: 'Materiales de construcción', url: 'https://www.innovatemateriales.com.ar/', plataforma: 'tiendanube' },
  { id: '3dtisk', nombre: '3DTisk', rubro: 'Impresión 3D', url: 'https://3dtisk.com.ar/', plataforma: 'tiendanube' },
  // Tanda del 26/10/2026.
  { id: 'masquito', nombre: 'Masquito', rubro: 'Herramientas', url: 'https://masquitoreparaciones.com.ar/', plataforma: 'comerciocity' },
  { id: 'mayorista-de-pesca', nombre: 'Mayorista de Pesca', rubro: 'Pesca y camping', url: 'https://mayoristadepesca.com.ar/', plataforma: 'comerciocity' },
  { id: 'los-pena', nombre: 'Los Peña', rubro: 'Distribuidora de alimentos', url: 'https://lospena.com.ar/', plataforma: 'comerciocity' },
  { id: 'distribuidora-pets', nombre: 'Distribuidora Pets', rubro: 'Juguetería mayorista', url: 'https://distribuidorapets.com.ar/', plataforma: 'comerciocity' },
  { id: 'ht5', nombre: 'HT5', rubro: 'Tote bags personalizadas', url: 'https://ht5.com.ar/', plataforma: 'tiendanube' },
].map((cliente) => ({
  ...cliente,
  logo: cliente.sin_logo ? null : logo_cliente(cliente.id),
}))

/** Las tiendas que la página muestra: las activas, de las dos plataformas. */
export const tiendas_de_clientes = clientes_ecommerce.filter((cliente) => cliente.activa !== false)
