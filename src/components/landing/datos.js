/**
 * Los datos de la landing (misión `landing-nueva`, 13/11/2026): todo lo que la página AFIRMA vive acá,
 * con de dónde sale cada cosa, para que un cambio de oferta se haga en un solo lugar.
 *
 * 🔴 REGLA: nada de lo que está acá es redacción libre. Cada promesa salió de una fuente verificable
 * (el posicionamiento del agente de leads, `agentes/lead/recursos/posicionamiento.md` del repo de
 * conocimiento; el guion de la prueba en `analitica/prueba.js`; el admin de producción) o de un registro
 * real (las capturas del chat son cuadros de los reels de Lucas, con datos de la demo). Si algo deja de
 * ser cierto, se cambia acá y no en el componente. Lo que no se pudo verificar quedó afuera de la página.
 *
 * Usan este módulo: los componentes de `components/landing/` y `recorrido/SeccionPrecio.vue` (que sigue
 * en el repo sin montar: la landing anterior se recupera cambiando una línea de `views/Home.vue`).
 */

/**
 * La promoción vigente: la misma que la página anterior mostraba en el bloque de precio (Lucas,
 * 3/11/2026, programa «Prueba gratuita de 7 días»). La barra de arriba, la línea de precio del hero y la
 * sección de precios la leen de acá. Sin mes ni fecha de vencimiento: la promo no tiene uno.
 */
export const PROMO = {
  /** El descuento, como se dice en la página. */
  descuento: '50 % de descuento los primeros 3 meses',
  /** Versión corta, para la barra de arriba en un teléfono. */
  descuento_corto: '50 % off los primeros 3 meses',
  /** La prueba. */
  prueba: '7 días gratis',
  /**
   * Al lado de una cifra. 🔴 La cifra que se muestra YA ES la del descuento (decisión de Lucas del 3/11/2026,
   * ver PLANES): «$27.950 · 50 % off» se leería como que todavía falta descontar la mitad. Por eso, junto a un
   * monto, se dice «con» el descuento.
   */
  junto_al_precio: 'con el 50 % de descuento de los primeros 3 meses',
}

/**
 * El rótulo de los logos. 🔴 SIN NÚMERO: la maqueta decía «Más de 60 negocios» y era falso (admin de
 * producción, 13/11/2026: 50 clientes reales activos, sin DEMO, el registro de Lucas, Scrap Free, las
 * pruebas gratuitas ni los ensayos). Y el 26/10/2026 Lucas ya había pedido sacar el número de la página
 * («son pocos negocios, prefiero que no diga el número», ver recorrido/SeccionClientes.vue). Si decide
 * ponerlo, el número verificado es «Más de 40».
 */
export const NEGOCIOS_QUE_LO_USAN = 'Ferreterías, corralones y distribuidoras que ya lo usan'

/**
 * La ficha de Google, tal como la muestra Google (copiado de `recorrido/SeccionResenas.vue`, donde está
 * explicado por qué la cantidad no se deriva de las tarjetas).
 */
export const GOOGLE = {
  perfil: 'https://maps.app.goo.gl/xQqz5B2BurGHxXyU7',
  promedio: '5,0',
  cantidad: 5,
}

/**
 * El video de «Miralo funcionando». 🔴 El pedido decía «video de 40 s»: no hay ninguno publicado de esa
 * duración. Se usa la pieza 04 de la campaña Imperio («atención al cliente»): es vertical, es la que más
 * se vio como anuncio desde el 11/11/2026 (así la landing continúa el anuncio) y termina en «Probá gratis
 * 7 días». Las otras piezas publicadas terminan en «Probá la demo». Se baja solo al tocar.
 *
 * Es una copia LIVIANA del anuncio (`meta-imperio-04-9x16.mp4` pesa 48 MB a 1440×2560): 720×1280, 1,6
 * Mbps, 4,3 MB, faststart. Subida el 13/11/2026 con nombre nuevo (sha256 84db567f3b56a8c0…065e,
 * verificada byte a byte contra el dominio público, con rangos 206).
 */
export const VIDEO_FUNCIONANDO = {
  url: 'https://videos.comerciocity.store/landing-miralo-funcionando-i04-720p-v1.mp4',
  segundos: 22,
  titulo: 'Un cliente pregunta por WhatsApp y el agente le contesta con el stock del sistema',
}

/**
 * Las tres partes. Fuente: posicionamiento §1 (gestión, ARCA, cuentas corrientes, listas de
 * proveedores), el bloque de la tienda propia (mismos precios y stock) y el de los agentes.
 * 🔴 Mercado Libre NO va en la tienda: el posicionamiento dice que hoy no se habilita a clientes nuevos.
 */
export const PARTES = [
  {
    clave: 'gestion',
    etiqueta: 'Gestión',
    color: 'azul',
    titulo: 'Tu mostrador',
    texto: 'Ventas, facturas de ARCA, stock por sucursal, cuentas corrientes y las listas de tus proveedores.',
  },
  {
    clave: 'tienda',
    etiqueta: 'Tienda online',
    color: 'naranja',
    titulo: 'Tu local abierto las 24 horas',
    texto: 'Con tus mismos precios y tu mismo stock, sin cargar nada dos veces.',
  },
  {
    clave: 'agentes',
    etiqueta: 'Agentes de IA',
    color: 'verde',
    titulo: 'Tu equipo, por WhatsApp',
    texto: 'Le mandás un audio o una foto y lo carga. Atiende a tus clientes con tu stock real, a cualquier hora.',
  },
]

/**
 * El antes y el ahora. Las imágenes son cuadros de los reels de Lucas aprobados el 23/10/2026: el
 * «antes» en blanco y negro y el «ahora» con la conversación real con el asistente (datos de la demo).
 * Los textos describen exactamente lo que muestra cada conversación.
 */
export const ANTES_AHORA = [
  {
    clave: 'factura',
    titulo: 'La factura del proveedor',
    antes: 'la cargabas ítem por ítem.',
    ahora: 'le mandás la foto y queda lista para revisar.',
    parte: 'Agente de IA',
    alt_ahora: 'Chat con el asistente: «te paso la factura de Ferretera del Sur, cargala» y la respuesta con la compra creada para revisar.',
  },
  {
    clave: 'stock',
    titulo: 'Mercadería entre sucursales',
    antes: 'papelitos y planillas.',
    ahora: 'le pedís «pasá 50 unidades» y te muestra el stock de cada una.',
    parte: 'Gestión + agente',
    alt_ahora: 'Chat con el asistente: pide pasar 50 duchas entre sucursales y el asistente muestra el stock de cada sucursal antes de registrarlo.',
  },
  {
    clave: 'presu',
    titulo: 'Un presupuesto',
    antes: 'sentarte a armarlo.',
    ahora: 'le dictás los productos y te devuelve el total.',
    parte: 'Agente de IA',
    alt_ahora: 'Chat con el asistente: pide un presupuesto para un cliente y el asistente lo arma con su número y su total.',
  },
  {
    clave: 'olvido',
    imagen_ahora: 'recordatorio',
    titulo: 'Lo que no te podés olvidar',
    antes: 'se te pasaba.',
    ahora: 'te lo recuerda a la hora que le pediste.',
    parte: 'Agente de IA',
    alt_ahora: 'Chat con el asistente: le pide que le recuerde un llamado a las 16:00 y a esa hora llega el recordatorio.',
  },
]

/**
 * Los testimonios que se ven de entrada (los mismos tres de la maqueta). Los ids son los de
 * `recorrido/testimonios.js`, que sigue siendo la fuente de los videos y las miniaturas: el titular es
 * el título de ese clip, no una cita redactada por nosotros.
 */
export const TESTIMONIOS_DESTACADOS = ['ferretotal', 'fenix', 'san-blas']

/** Cómo arrancás. Fuente: el guion de bienvenida de la prueba (`analitica/prueba.js`) y el posicionamiento. */
export const PASOS = [
  { titulo: 'Creás tu cuenta', texto: 'Dos minutos, sin tarjeta. Entrás al sistema completo.' },
  { titulo: 'Martín te escribe por WhatsApp', texto: 'Le mandás tu Excel o el PDF del proveedor y te cargamos los productos.' },
  { titulo: 'Lo usás con tus datos', texto: 'Gestión, tienda y agentes. Antes de que termine, te llamamos.' },
]

/**
 * Las preguntas frecuentes. 🔴 Respuestas tomadas del posicionamiento del agente de leads (que es lo que
 * el agente contesta por WhatsApp: la página no puede decir otra cosa), con sus límites. Si una respuesta
 * deja de ser cierta, se saca la pregunta.
 *
 * `historia: true` agrega debajo de la respuesta el video de la historia (pieza 02 de la serie pizarra).
 */
export const PREGUNTAS = [
  {
    clave: 'cargar',
    pregunta: '¿Tengo que cargar todo yo?',
    respuesta: 'No. Podés importar tu Excel o el PDF de tu proveedor, o mandárselo a Martín por WhatsApp y te lo cargamos nosotros, sin costo. Cuando importás tus datos se borran los de ejemplo.',
  },
  {
    clave: 'nunca',
    pregunta: '¿Sirve si nunca usé un sistema?',
    respuesta: 'Sí. Martín te escribe desde el primer día, Robotito te señala en la pantalla dónde tocar y tenés tutoriales en video adentro del sistema. En Ferretería San Cayetano lo cuentan en uno de sus videos: «La primera vez que trabajo con un sistema».',
  },
  {
    clave: 'despues',
    pregunta: '¿Qué pasa cuando terminan los 7 días?',
    respuesta: 'Antes de que termine te llama alguien del equipo para ver cómo seguís. Si contratás, seguís en el mismo sistema con tus datos. Si no, se cierra y no pagás nada: nunca te pedimos tarjeta.',
  },
  {
    clave: 'arca',
    pregunta: '¿Factura con ARCA?',
    respuesta: 'Sí, emite factura electrónica de ARCA desde el mismo sistema. Vos decidís qué se factura y cuándo: nada se factura solo. Para conectarlo delegás la facturación a ComercioCity en la web de ARCA, y te guiamos paso a paso.',
  },
  {
    clave: 'ia',
    pregunta: '¿Quién controla lo que hace la IA?',
    /* Fuente: manual_sistema/ia/asistente.md («¿Cuánta confianza le tenés?»). 🔴 NO decir «nada se registra
       sin confirmar»: en Resuelto (de fábrica) hace solo lo simple y la compra por foto de la factura la carga
       directo, y en Directo carga en el acto. */
    respuesta: 'Vos elegís cuánta confianza le tenés: que pregunte antes de todo, que resuelva solo lo simple (así viene) o que haga las cargas directo. Lo que emite un comprobante ante ARCA o borra algo te lo pregunta siempre. Antes de mandarle un mensaje a tus clientes te muestra a quiénes y el texto exacto. Y las respuestas del agente de WhatsApp pueden quedar para que las apruebes antes de enviarlas.',
  },
  {
    clave: 'internet',
    pregunta: '¿Funciona si se corta internet?',
    respuesta: 'El mostrador sigue vendiendo: cada computadora guarda los artículos y las ventas se suben solas cuando vuelve la conexión, sin duplicarse. Hace falta tener prendido el modo sin conexión y haber entrado antes con internet en esa computadora. La factura se emite cuando vuelve internet.',
  },
  {
    clave: 'quienes',
    pregunta: '¿Quiénes están detrás de ComercioCity?',
    respuesta: 'Lucas, el fundador, lo cuenta en tres minutos: del quiosco familiar en Gualeguay a una plataforma donde la gestión, la tienda y los agentes comparten la misma información.',
    historia: true,
  },
]

// ---------------------------------------------------------------------------------------
// Los planes. Movidos tal cual desde recorrido/SeccionPrecio.vue (13/11/2026).
// ---------------------------------------------------------------------------------------

/**
 * Los cuatro planes (3/11/2026). Cómo se armaron:
 *
 * - LA REFERENCIA. Contagram (contagram.com, leído el 3/11/2026): es el único competidor que
 *   corta sus planes por OPERACIONES (ventas + compras + gastos) y no por comprobantes de
 *   venta, y es lo que Lucas pidió copiar. Sus planes, sin IVA: Inicial $58.900 (0 a 100
 *   operaciones, 1 usuario, excedente $800), Intermedio $89.900 (101 a 250, 2 usuarios,
 *   $600), Plus $209.900 (251 a 500, 2 usuarios, $200), Empresa $276.900 (501 a 3.000,
 *   3 usuarios, $80); usuario adicional $32.000. Dux y Contabilium se miraron el mismo día
 *   para ubicarse (`00-precios-contagram-y-guion.md` §2b del programa): cortan por
 *   comprobantes de venta y no son la referencia.
 * - EL PRECIO. 5 % menos que el número que publica Contagram (su neto, sin IVA), y ese es el
 *   precio FINAL nuestro: no se le suma IVA (esquema A, elegido por Lucas el 3/11/2026).
 *   Inicial $58.900 × 0,95 = $55.955 → $55.900; Intermedio $85.405 → $85.400; Plus $199.405 →
 *   $199.400; Empresa $263.055 → $263.000. Se redondea siempre para abajo, a la centena, para
 *   que la diferencia nunca quede por debajo del 5 % (como se hizo el 26/10 con Dux).
 *   Excedentes: $760 / $570 / $190 / $76. Usuario extra: $32.000 × 0,95 = $30.400.
 * - LO QUE SE VE. La mitad: $27.950 / $42.700 / $99.700 / $131.500, porque los primeros tres
 *   meses tienen el 50 % de descuento y Lucas pidió mostrar ya ese número, sin decir cuánto
 *   queda después (`mensual` queda acá como referencia y es lo que dice el manual de precios).
 * - LOS NOMBRES Y LOS CORTES. Los de Contagram: Inicial, Intermedio, Plus y Empresa; 0-100,
 *   101-250, 251-500 y 501-3.000. Más de 3.000, a medida.
 * - USUARIOS. 1 / 2 / 2 / 3 incluidos, como Contagram.
 */
export const PLANES = [
  {
    clave: 'inicial',
    nombre: 'Inicial',
    limite: 'Hasta 100 operaciones por mes',
    mensual: 55900,
    promocional: 27950,
    usuarios: 1,
    excedente: 760,
    para: 'Para el comercio que arranca o atiende con un solo mostrador.',
  },
  {
    clave: 'intermedio',
    nombre: 'Intermedio',
    limite: 'De 101 a 250 operaciones por mes',
    mensual: 85400,
    promocional: 42700,
    usuarios: 2,
    excedente: 570,
    para: 'Para el negocio con movimiento todos los días y un vendedor más.',
    destacado: true,
  },
  {
    clave: 'plus',
    nombre: 'Plus',
    limite: 'De 251 a 500 operaciones por mes',
    mensual: 199400,
    promocional: 99700,
    usuarios: 2,
    excedente: 190,
    para: 'Para el que vende mucho: varios vendedores, compras todas las semanas.',
  },
  {
    clave: 'empresa',
    nombre: 'Empresa',
    limite: 'De 501 a 3.000 operaciones por mes',
    mensual: 263000,
    promocional: 131500,
    usuarios: 3,
    excedente: 76,
    para: 'Para distribuidoras, mayoristas y negocios con varias sucursales.',
  },
]

/** Cada usuario adicional, por mes, en cualquier plan (Contagram $32.000 × 0,95 → $30.400). */
export const USUARIO_EXTRA = 30400

/** El punto de miles de Argentina: 27.950. */
const FORMATO_PESOS = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 })

/**
 * @param {number} monto
 * @returns {string} "$27.950"
 */
export function formatear_pesos(monto) {
  return '$' + FORMATO_PESOS.format(monto)
}

/** Lo que incluye la mensualidad, con las palabras de Lucas (26/10/2026 y 3/11/2026). */
export const INCLUYE = [
  { icono: 'bi-laptop', texto: 'Acceso al sistema desde cualquier dispositivo.' },
  { icono: 'bi-people', texto: 'Implementación y migración de tus datos, sin costo.' },
  { icono: 'bi-bag-check', texto: 'La tienda online de tu negocio funcionando 24/7.', etiqueta: 'si sumás Tienda' },
  { icono: 'bi-stars', texto: 'El sistema de agentes, con los tokens para usarlo.', etiqueta: 'si sumás Agentes' },
  { icono: 'bi-whatsapp', texto: 'Soporte por WhatsApp de por vida.' },
  { icono: 'bi-sliders', texto: 'Desarrollo de funcionalidades a medida.' },
  { icono: 'bi-arrow-repeat', texto: 'Actualizaciones constantes de la plataforma.' },
]

