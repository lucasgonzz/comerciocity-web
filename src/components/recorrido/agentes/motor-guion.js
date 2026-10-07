/**
 * Motor de la línea de tiempo de las escenas de la sección de agentes (7/10/2026).
 *
 * Una escena (el chat del teléfono, la terminal de la computadora) se describe como una lista
 * de pasos chicos. El motor los aplica de a uno: llama a `aplicar(paso)`, que hace el cambio
 * en la escena y devuelve CUÁNTO esperar antes del siguiente, y recién ahí programa el
 * próximo. Así el ritmo lo decide cada paso (un mensaje largo se deja leer más que uno
 * corto) y no un intervalo fijo.
 *
 * Se puede pausar y reanudar sin perder el lugar: la sección pausa la escena cuando sale de
 * la pantalla, y al volver sigue desde donde estaba, con el resto de la espera que faltaba.
 *
 * @param {Array} pasos
 * @param {{ aplicar: Function, al_terminar?: Function, al_progresar?: Function }} opciones
 * @returns {{ reproducir: Function, pausar: Function, completar: Function, destruir: Function }}
 */
export default function crear_motor(pasos, opciones) {
  let indice = 0
  let timer = null
  let vence_en = 0
  /** Espera que quedó pendiente al pausar: se respeta al reanudar. */
  let restante = 0
  let corriendo = false
  let terminado = false
  let destruido = false

  function progresar() {
    if (opciones.al_progresar) {
      opciones.al_progresar(pasos.length ? indice / pasos.length : 1)
    }
  }

  function programar(espera) {
    vence_en = Date.now() + espera
    timer = window.setTimeout(avanzar, espera)
  }

  function avanzar() {
    timer = null
    if (destruido) {
      return
    }
    if (indice >= pasos.length) {
      corriendo = false
      terminado = true
      if (opciones.al_terminar) {
        opciones.al_terminar()
      }
      return
    }
    const paso = pasos[indice]
    indice++
    const espera = opciones.aplicar(paso, false)
    progresar()
    programar(typeof espera === 'number' && espera > 0 ? espera : 0)
  }

  return {
    /** Arranca, o sigue desde donde se pausó. */
    reproducir() {
      if (corriendo || terminado || destruido) {
        return
      }
      corriendo = true
      programar(restante)
      restante = 0
    },

    /** Frena guardando lo que faltaba de la espera en curso. */
    pausar() {
      if (!corriendo) {
        return
      }
      corriendo = false
      if (timer !== null) {
        window.clearTimeout(timer)
        timer = null
        restante = Math.max(0, vence_en - Date.now())
      }
    },

    /**
     * Aplica de una todos los pasos que faltan, sin esperas (movimiento reducido): la escena
     * queda en su estado final y quieta.
     */
    completar() {
      if (timer !== null) {
        window.clearTimeout(timer)
        timer = null
      }
      corriendo = false
      while (indice < pasos.length) {
        opciones.aplicar(pasos[indice], true)
        indice++
      }
      terminado = true
      progresar()
    },

    destruir() {
      destruido = true
      corriendo = false
      if (timer !== null) {
        window.clearTimeout(timer)
        timer = null
      }
    },
  }
}
