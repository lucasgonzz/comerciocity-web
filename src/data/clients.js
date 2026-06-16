const IMAGE_EXT = /\.(png|jpe?g|webp|gif)$/i

export function clientLogo(file) {
  return new URL(`../assets/clients/${file}`, import.meta.url).href
}

/** Todos los clientes (franja de logos). Excluye archivos que no son imagen. */
export const clients = [
  { id: 'golonorte', name: 'golonorte', file: 'golonorte - gaston.jpeg' },
  { id: 'fenix', name: 'Fenix', file: 'fenix.png' },
  { id: '3dtisk', name: '3Dtisk', file: '3dtisk- Juance - cordoba.png' },
  { id: 'angeles-bad-girls', name: 'Ángeles Bad Girls', file: 'angeles - bad girls.jpeg' },
  { id: 'arfren', name: 'Arfren', file: 'arfren.png' },
  { id: 'chevrocar', name: 'Chevrocar', file: 'Chevrocar.png' },
  { id: 'christian', name: 'Christian', file: 'christian.jpeg' },
  { id: 'desire', name: 'Desire', file: 'desire.jpeg' },
  { id: 'ernesto', name: 'Ernesto', file: 'Ernesto.png' },
  { id: 'fabian-ferreteria-san-blas', name: 'Ferretería San Blas', file: 'fabian - ferreteria san blas.jpeg' },
  { id: 'fernando', name: 'Fernando', file: 'fernando.jpeg' },
  { id: 'ferremas', name: 'Ferremas', file: 'ferremas.png' },
  { id: 'ferretotal', name: 'Ferretotal', file: 'Ferretotal.png' },
  { id: 'mza-group', name: 'MZA Group', file: 'gabriel - mza group.png' },
  { id: 'sr-imperio-gerardo', name: 'Sr. Imperio', file: 'Gerardo - Sr. imperio.jpeg' },
  { id: 'golden-breeze', name: 'Golden Breeze', file: 'golden breeze - Marcelo.jpeg' },
  { id: 'hb-distribuciones', name: 'HB Distribuciones', file: 'hb distribuciones.png' },
  { id: 'hipermax', name: 'Hipermax', file: 'hipermax.jpg' },
  { id: 'ht5', name: 'HT5', file: 'ht5.png' },
  { id: 'innovate', name: 'Innovate', file: 'innovate - mariel.jpeg' },
  { id: 'la-martina', name: 'La Martina', file: 'la martina.png' },
  { id: 'trama-luis', name: 'Trama', file: 'luis - trama.jpeg' },
  { id: 'masquito', name: 'Masquito', file: 'Masquito.jpeg' },
  { id: 'matias-galvan', name: 'Matías Galván', file: 'Matias Galvan.webp' },
  { id: 'mb-malizia', name: 'MB Malizia', file: 'mb malizia.png' },
  { id: 'golden-bike', name: 'Golden Bike', file: 'Norberto - GoldenBike.jpg' },
  { id: 'oliva', name: 'Oliva', file: 'oliva.png' },
  { id: 'distri-creo', name: 'Distri Creo', file: 'pablo - distri creo.jpg' },
  { id: 'panchito', name: 'Panchito', file: 'panchito.png' },
  { id: 'racing-carts', name: 'Racing Carts', file: 'racing carts - Laura.jpg' },
  { id: 'renacer-joyas', name: 'Renacer Joyas', file: 'Renacer joyas - Anyeline.png' },
  { id: 'roberto', name: 'Roberto', file: 'roberto.jpeg' },
  { id: 'ffperformance', name: 'FF Performance', file: 'seba - ffperformance.jpeg' },
  { id: 'sr-imperio', name: 'Sr. Imperio', file: 'sr imperio.png' },
  { id: 'trama', name: 'Trama', file: 'trama.png' },
  { id: 'truvari', name: 'Truvari', file: 'Truvari - Fernando bebidas cordoba.jpg' },
  { id: 'kiosco-verde', name: 'Kiosco Verde', file: 'kioscoverde.png' },
  { id: 'servian', name: 'Servian', file: 'servian.jpg' },
].filter((c) => IMAGE_EXT.test(c.file))

/**
 * Clientes con tienda online. Completá `storeUrl` con la URL pública de la tienda
 * para que aparezca como tarjeta clickeable en la sección de ecommerce.
 */
export const ecommerceClients = [
  {
    id: 'ferretotal',
    name: 'Ferretotal',
    category: 'Ferretería',
    file: 'Ferretotal.png',
    storeUrl: 'https://ferretotalmatheu.com.ar/',
  },
  {
    id: 'hb-distribuciones',
    name: 'HB Distribuciones',
    category: 'Ferretería',
    file: 'hb distribuciones.png',
    storeUrl: 'https://hb-distribuciones.com.ar/',
  },
  {
    id: 'trama',
    name: 'Trama',
    category: 'Ferretería',
    file: 'trama.png',
    storeUrl: 'https://tramaferreteria.com.ar/',
  },
  {
    id: 'truvari',
    name: 'Truvari',
    category: 'Distribuidora',
    file: 'Truvari - Fernando bebidas cordoba.jpg',
    storeUrl: 'https://truvaribebidas.com.ar/',
  },
  {
    id: '2r',
    name: 'Racing parts',
    category: 'Importadora',
    file: 'racing carts - Laura.jpg',
    storeUrl: 'https://dosrracingparts.mitiendanube.com/',
  },
  {
    id: 'fenix',
    name: 'Fenix Jugueteria',
    category: 'Distribuidora',
    file: 'fenix.png',
    storeUrl: 'https://fenix-mayorista.com.ar/',
  },
  {
    id: 'golonorte',
    name: 'Golonorte',
    category: 'Distribuidora',
    file: 'golonorte - gaston.jpeg',
    storeUrl: 'https://golonorte.com.ar/',
  },
  {
    id: 'galvan',
    name: 'galvan',
    category: 'Distribuidora',
    file: 'Matias Galvan.webp',
    storeUrl: 'https://galvanmayorista.com.ar/',
  },
].map((client) => ({
  ...client,
  logo: clientLogo(client.file),
}))

export const clientsWithStore = ecommerceClients.filter((c) => c.storeUrl)

export const clientLogos = clients.map((c) => ({
  id: c.id,
  name: c.name,
  src: clientLogo(c.file),
}))
