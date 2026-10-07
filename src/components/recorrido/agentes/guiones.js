/**
 * El contenido de la sección de agentes (pedido de Lucas del 7/10/2026): el texto de cada
 * diapositiva del carrusel y el guion de su escena. Todo el copy vive acá para que un cambio
 * de texto no obligue a tocar componentes.
 *
 * 🔴 Lo que dicen los chats es una ESCENA de ejemplo, pero lo que el sistema
 * hace en ella tiene que existir: está contrastado con
 * agentes/lead/recursos/posicionamiento.md del repo de conocimiento (7/10/2026):
 *   - El asistente por WhatsApp entiende audios, crea tareas de la agenda y, al marcar una
 *     tarea con gasto como hecha, registra el gasto con su caja. Que lo haga sin pedir un
 *     "sí" es el nivel de confianza directo (ConfianzaDelAgenteIaHelper en empresa-api).
 *   - El agente de clientes contesta con precios, stock y ofertas del sistema y pasa links
 *     de la tienda. El "objetivo" NO es un campo propio: el dueño lo escribe en la
 *     personalidad del agente (whatsapp_bot_configs.agent_personality), que es texto libre.
 *   - Por MCP, la IA crea combos, ofertas por cantidad y tareas, con las mismas reglas de
 *     confirmación que el asistente. 🔴 La escena muestra ChatGPT (pedido de Lucas, 7/10/2026),
 *     pero la conexión está probada solo con Claude Desktop y Claude Code: ver CHAT_IA.
 * Si se agrega algo que el sistema no hace, la página lo promete en público.
 *
 * Formato de los textos: `*negrita*` como en WhatsApp, y `\n` para cortar renglón.
 */

/** El dueño le habla a su asistente: una tarea por audio, el recordatorio y el gasto. */
const CHAT_ASISTENTE = {
  contacto: 'Tu asistente',
  estado: 'en línea',
  avatar: 'marca',
  /** Desde qué lado escribe el que sostiene el teléfono. */
  pasos: [
    { tipo: 'chip', texto: 'Jueves' },
    {
      tipo: 'audio',
      lado: 'saliente',
      duracion: '0:06',
      hora: '18:42',
      transcripcion: 'Che, agendame para el martes que tengo que pagar ARCA, que no se me pase.',
    },
    {
      tipo: 'texto',
      lado: 'entrante',
      hora: '18:42',
      texto: 'Listo 👍 Te agendé la tarea para el *martes*:',
      tarjeta: { icono: 'bi-calendar-check', titulo: 'Pagar ARCA', detalle: 'Martes · 9:00' },
      texto_final: 'Ese día a la mañana te lo recuerdo.',
    },
    { tipo: 'salto', texto: 'Martes' },
    {
      tipo: 'texto',
      lado: 'entrante',
      hora: '09:00',
      texto: 'Buen día ☀️ Te recuerdo que *hoy tenés que pagar ARCA*.',
      texto_final: 'Cuando lo pagues avisame y lo dejo registrado.',
    },
    {
      tipo: 'audio',
      lado: 'saliente',
      duracion: '0:08',
      hora: '11:15',
      transcripcion: 'Ya lo pagué, fueron 150 mil pesos. Lo pagué con transferencia.',
    },
    {
      tipo: 'texto',
      lado: 'entrante',
      hora: '11:15',
      texto: 'Listo ✅ Marqué la tarea como hecha y registré el gasto:',
      tarjeta: { icono: 'bi-cash-coin', titulo: 'ARCA · $150.000', detalle: 'Transferencia · ya impactó en la caja' },
      texto_final: 'Lo tenés en el sistema.',
    },
  ],
}

/** Un cliente le escribe a la pinturería y el agente lo asesora hasta la venta online. */
const CHAT_AGENTE = {
  contacto: 'Pinturería del Centro',
  estado: 'Cuenta de empresa',
  avatar: 'pintureria',
  pasos: [
    { tipo: 'chip', texto: 'Hoy' },
    {
      tipo: 'texto',
      lado: 'saliente',
      hora: '20:31',
      texto: 'Hola! Busco pintura para el interior de mi casa, algún color claro. ¿Qué me recomendás?',
    },
    {
      tipo: 'texto',
      lado: 'entrante',
      hora: '20:31',
      texto: '¡Hola! Te ayudo 😊 Antes de recomendarte algo, contame:',
      texto_final: '¿Las paredes tuvieron *humedad* o manchas? ¿Y más o menos cuántos m² son?',
    },
    {
      tipo: 'texto',
      lado: 'saliente',
      hora: '20:33',
      texto: 'Sí, el año pasado tuve humedad en el baño y en un dormitorio. Serán unos 40 m².',
    },
    {
      tipo: 'texto',
      lado: 'entrante',
      hora: '20:33',
      texto: 'Entonces no te conviene un látex común: con humedad se ampolla y aparece moho.',
      texto_final:
        'Te recomiendo un *látex interior antihumedad con fungicida*, lavable. Es el que más se está llevando en la zona: con las lluvias de esta época es el que mejor aguanta 💪',
    },
    {
      tipo: 'texto',
      lado: 'entrante',
      hora: '20:34',
      texto: 'Para 40 m² a dos manos te alcanza con *2 latas de 4 L*. En blanco tiza o arena te queda bien luminoso.',
    },
    {
      tipo: 'enlace',
      lado: 'entrante',
      hora: '20:34',
      enlace: {
        titulo: 'Látex Interior Antihumedad 4 L',
        detalle: 'Blanco tiza · Arena · Marfil',
        sitio: 'Tienda online · Pinturería del Centro',
      },
      texto: 'Y justo está en oferta 🔥\n1 lata: $20.000\n*Llevando 2, las dos por $35.000*',
      texto_final: 'Lo comprás directo desde nuestra tienda 👆',
    },
    {
      tipo: 'texto',
      lado: 'saliente',
      hora: '20:35',
      texto: 'Buenísimo, me llevo las dos por ahí 🙌',
    },
  ],
}

/**
 * El dueño le pide a ChatGPT (la app de escritorio, con ComercioCity conectado como app por
 * el MCP) un análisis que cruza su historial con lo que pasa afuera, ajusta el plan, lo manda
 * a publicar y confirma los cambios: ChatGPT los aplica en ComercioCity y la pantalla gira
 * para mostrar el sistema con los cambios.
 *
 * ChatGPT y en interfaz gráfica, no Claude Code en una consola: pedido de Lucas del
 * 7/10/2026, "que parezca lo más fácil y familiar posible". 🔴 Al 7/10/2026 el MCP de
 * ComercioCity se autentica SOLO con la clave personal como `Authorization: Bearer`
 * (McpConexionController de empresa-api), y los conectores de ChatGPT piden OAuth: la
 * conexión desde ChatGPT todavía no existe. Ver la nota en DIAPOSITIVAS.
 *
 * El caso es una distribuidora de bebidas del Valle de Calamuchita (Córdoba) antes de la
 * Fiesta Nacional de la Cerveza de Villa General Belgrano: un evento real y conocido, que
 * cruza bien con el historial de ventas (el quiebre de stock del año anterior) y con el
 * combo más cordobés que hay. Los números del negocio son inventados.
 */
const CHAT_IA = {
  app: 'ChatGPT',
  conversacion: 'Ventas y temporada',
  pasos: [
    {
      tipo: 'dictado',
      texto:
        'Analizá todas mis ventas del último año y buscá en internet qué se viene en la zona el mes que viene. Quiero saber qué me conviene comprar y qué promociones armar.',
    },
    { tipo: 'pensando', texto: 'Pensando', ms: 1100 },
    {
      tipo: 'herramienta',
      fuente: 'comerciocity',
      accion: 'Leyó tus ventas de los últimos 12 meses',
      resultado: '48.312 renglones · 1.284 artículos · 212 clientes',
    },
    {
      tipo: 'herramienta',
      fuente: 'comerciocity',
      accion: 'Revisó el stock de tus 3 depósitos',
      resultado: 'Cerveza lata 473 ml: quedan 18 bultos',
    },
    {
      tipo: 'herramienta',
      fuente: 'web',
      accion: 'Buscó en la web: eventos en el Valle de Calamuchita',
      resultado: 'Fiesta Nacional de la Cerveza · Villa General Belgrano · 2 fines de semana',
    },
    {
      tipo: 'herramienta',
      fuente: 'web',
      accion: 'Buscó en la web: pronóstico extendido',
      resultado: 'Calor anticipado: máximas de 30 °C esas semanas',
    },
    { tipo: 'pensando', texto: 'Cruzando tu historial con lo que encontré', ms: 1400 },
    {
      tipo: 'respuesta',
      bloques: [
        { titulo: 'Lo que encontré' },
        {
          item: 'En octubre del año pasado la lata te vendió *+61 %* y el viernes de la fiesta te quedaste sin la de 473 ml: *3 días sin stock* en la semana más fuerte.',
        },
        { item: 'En el *74 %* de los pedidos de kioscos que llevan fernet también va gaseosa cola.' },
        { item: 'La fiesta llena el valle dos fines de semana seguidos, y se viene calor.' },
        { titulo: 'Plan de acción' },
        { num: '1', item: 'Comprar *60 bultos* de lata 473 antes del jueves: con 18 no llegás al segundo finde.' },
        { num: '2', item: 'Combo *«Previa Oktoberfest»*: fernet 750 ml + 2 cola 2,25 L a *$18.900* (margen 27 %).' },
        { num: '3', item: 'Lata 473: *8 % off llevando 24 o más*.' },
        { num: '4', item: 'Te agendo el pedido al proveedor como tarea.' },
      ],
    },
    {
      tipo: 'escrito',
      texto: 'Bien. El combo armalo con la cola de 1,5 que la de 2,25 la tengo justa. Y la oferta de la lata, desde 48.',
    },
    { tipo: 'pensando', texto: 'Recalculando', ms: 900 },
    {
      tipo: 'herramienta',
      fuente: 'comerciocity',
      accion: 'Revisó el stock de cola 1,5 L',
      resultado: '312 unidades · alcanza para 3 semanas',
    },
    {
      tipo: 'respuesta',
      bloques: [
        { item: 'Combo *«Previa Oktoberfest»*: fernet 750 ml + 2 cola 1,5 L a *$16.900*, margen *29 %*.' },
        { item: 'Lata 473: *10 % off llevando 48 o más*. El margen queda en 21 %.' },
        { texto: '¿Lo publico?' },
      ],
    },
    { tipo: 'escrito', texto: 'Dale, publicalo.' },
    {
      tipo: 'confirmar',
      titulo: 'ComercioCity · 3 cambios para confirmar',
      acciones: [
        'Crear el combo «Previa Oktoberfest» a $16.900',
        'Crear la oferta: lata 473 ml, 10 % off desde 48 u.',
        'Agendar: pedir 60 bultos de lata, jueves 9:00',
      ],
    },
    { tipo: 'herramienta', fuente: 'comerciocity', accion: 'Creó el combo «Previa Oktoberfest»' },
    { tipo: 'herramienta', fuente: 'comerciocity', accion: 'Creó la oferta de la lata 473 ml' },
    { tipo: 'herramienta', fuente: 'comerciocity', accion: 'Agendó el pedido del jueves' },
    { tipo: 'respuesta', bloques: [{ texto: 'Listo ✅ Ya quedó todo aplicado en ComercioCity.' }] },
    { tipo: 'girar' },
    { tipo: 'sistema', cambio: 'aviso' },
    { tipo: 'sistema', cambio: 'combo' },
    { tipo: 'sistema', cambio: 'oferta' },
    { tipo: 'sistema', cambio: 'tarea' },
  ],
}

/**
 * Las tres diapositivas, en orden. `escena` elige el componente de la izquierda y `fondo`
 * el tono de su lado: claro para los teléfonos, noche para la computadora (un escritorio de
 * Windows se ve mejor sobre oscuro).
 */
export const DIAPOSITIVAS = [
  {
    clave: 'asistente',
    pestana: 'Tu asistente',
    icono: 'bi-person-badge',
    escena: 'telefono',
    chat: CHAT_ASISTENTE,
    fondo: 'claro',
    insignia: 'Asistente personal con IA',
    titulo: 'Un asistente que trabaja para vos, por WhatsApp.',
    bajada:
      'Le escribís o le mandás un audio, como a un empleado de confianza, y lo hace: te agenda tareas y te las recuerda el día que tocan, registra gastos y pagos, y te consigue cualquier dato del sistema — ventas, stock, deudas — sin que abras la computadora.',
    puntos: [
      'Entiende audios: los transcribe solo.',
      'Te recuerda lo que tenés que hacer, el día que toca.',
      'Lo que le contás queda cargado en el sistema.',
    ],
    escena_descripcion:
      'Animación de un chat de WhatsApp: el dueño le manda un audio a su asistente pidiéndole que le agende pagar ARCA el martes; el asistente lo agenda, el martes se lo recuerda, el dueño contesta con otro audio que ya pagó 150 mil pesos por transferencia y el asistente marca la tarea como hecha y registra el gasto.',
  },
  {
    clave: 'agente',
    pestana: 'Agente de ventas',
    icono: 'bi-chat-heart',
    escena: 'telefono',
    chat: CHAT_AGENTE,
    fondo: 'claro',
    insignia: 'Agente de WhatsApp para tus clientes',
    titulo: 'Un vendedor que asesora a tus clientes, a cualquier hora.',
    bajada:
      'Tu agente atiende por WhatsApp con la información real del sistema: precios, stock y ofertas al día. No contesta con un menú de opciones: pregunta, entiende qué necesita cada cliente y lo asesora como tu mejor vendedor.',
    objetivo: {
      titulo: 'Vos le marcás el objetivo',
      texto:
        'Que el cliente pase por el local o que compre en tu tienda online. En este ejemplo el objetivo es la venta online: después de asesorarlo, le manda el link del producto con la oferta vigente.',
    },
    escena_descripcion:
      'Animación de un chat de WhatsApp: un cliente le pregunta a una pinturería por pintura clara para el interior; el agente le pregunta si tuvo humedad, el cliente dice que sí, y el agente le recomienda un látex antihumedad y le manda el link de la tienda online con la oferta: una lata a 20 mil pesos o dos por 35 mil.',
  },
  {
    clave: 'mcp',
    pestana: 'MCP + tu IA',
    icono: 'bi-stars',
    escena: 'mcp',
    chat: CHAT_IA,
    fondo: 'noche',
    insignia: 'MCP de ComercioCity',
    titulo: 'Conectá ChatGPT a tu negocio.',
    /* 🔴 Nombra a ChatGPT por pedido de Lucas (7/10/2026), pero al 7/10/2026 la conexión
       desde ChatGPT NO existe: el MCP solo acepta la clave Bearer (Claude Desktop, Claude Code,
       la API) y ChatGPT pide OAuth. Antes de publicar esto hay que construir el OAuth del MCP
       en empresa-api o volver a nombrar solo a Claude. */
    bajada:
      'El MCP es el estándar con el que las inteligencias artificiales se conectan a otros sistemas. Conectás ChatGPT, Claude o la IA que ya usás a ComercioCity y le hablás como siempre: lee tu negocio entero, investiga en internet, cruza todo y te arma un plan concreto. Cuando le das el ok, lo aplica ella misma en tu sistema.',
    puntos: [
      'Lee todo: ventas, compras, stock y clientes.',
      'Investiga afuera: eventos, clima, tendencias.',
      'Opera el sistema: combos, ofertas, precios, tareas.',
      'Nada se aplica sin tu ok.',
    ],
    escena_descripcion:
      'Animación de una computadora con Windows y ChatGPT: el dueño le pide por voz que analice las ventas del último año y lo que se viene en la zona; ChatGPT lee el sistema ComercioCity, busca en internet la Fiesta Nacional de la Cerveza y el pronóstico, propone comprar stock, un combo y una oferta, el dueño ajusta el combo, le dice que lo publique y confirma los cambios, y la pantalla gira para mostrar el sistema ComercioCity con el combo, la oferta y la tarea ya creados.',
  },
]

/**
 * Convierte el formato de los guiones (`*negrita*`) en HTML seguro: primero escapa todo y
 * recién después marca la negrita, así un texto del guion nunca puede inyectar etiquetas.
 *
 * @param {string} texto
 * @returns {string}
 */
export function formatear(texto) {
  const escapado = String(texto || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
  return escapado.replace(/\*([^*\n]+)\*/g, '<strong>$1</strong>')
}
