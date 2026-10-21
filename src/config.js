/**
 * Lo que la web lee del entorno en tiempo de BUILD (Vite reemplaza `import.meta.env.VITE_*`
 * por su valor al compilar: no hay forma de cambiarlo después sin volver a buildear).
 *
 * Las dos variables viven en el `.env` de la raíz del repo, que NO se commitea; el molde
 * con la explicación de cada una está en `.env.example`.
 */

/**
 * Lee una bandera del entorno con criterio amplio: lo que no es un sí explícito es `false`.
 * Una variable ausente llega como `undefined` y una vacía como `''`: las dos apagan.
 *
 * @param {*} valor
 * @returns {boolean}
 */
function bandera(valor) {
  const texto = String(valor === undefined || valor === null ? '' : valor)
    .trim()
    .toLowerCase()
  return texto === '1' || texto === 'true' || texto === 'si' || texto === 'sí' || texto === 'on'
}

/**
 * Id del píxel de Meta (solo dígitos, lo da Events Manager). VACÍO a propósito en el molde:
 * mientras no tenga valor, la web no carga `fbevents.js` ni define `fbq` -- cero pedidos a
 * Facebook y cero cookies. Lucas lo pega el día que la campaña arranca.
 */
export const META_PIXEL_ID = String(import.meta.env.VITE_META_PIXEL_ID || '').trim()

/** Endpoint público: no lleva credenciales. Si falla, el enlace normal sigue disponible. */
export const WHATSAPP_REFERENCIAS_URL = String(import.meta.env.VITE_WHATSAPP_REFERENCIAS_URL ||
  'https://api-admin.comerciocity.com/api/landing/whatsapp-referencias').trim()

/**
 * Interruptor del bloque de precio (decisión D2 del plan del 13/10/2026: el informe del 5/10
 * recomienda publicarlo, pero lo decide Lucas). APAGADO por defecto: el bloque está
 * construido y no se renderiza hasta que la variable diga que sí.
 */
export const MOSTRAR_PRECIO = bandera(import.meta.env.VITE_MOSTRAR_PRECIO)
