/**
 * Mixin: dibuja una maqueta de tamaño FIJO (el teléfono, el monitor) y la escala para que
 * entre entera en el lugar que le toca, en cualquier ancho.
 *
 * Por qué escalar y no hacerla fluida: adentro hay texto chico, burbujas y una terminal, y lo
 * que tiene que mantenerse es la proporción entre todo eso. Una maqueta fluida reacomoda las
 * líneas en cada ancho y en uno intermedio la terminal parte una palabra o el chat pierde un
 * mensaje; una maqueta escalada se ve igual en 1366, en 900 y en 390, solo más grande o más
 * chica.
 *
 * CÓMO SE USA. El componente pone `ref="marco"` en el contenedor que ocupa el lugar
 * disponible, declara `diseno(ancho_disponible)` devolviendo `{ ancho, alto }` de la maqueta
 * (puede cambiar según el ancho, para que en un teléfono la terminal sea más angosta y su
 * letra no quede minúscula) y pinta la maqueta con `:style="estilo_maqueta"`.
 */

/** Tope de escala: en un monitor grande la maqueta no se agranda hasta pixelarse. */
const ESCALA_MAXIMA = 1.18

export default {
  data() {
    return {
      escala: 1,
      medida: { ancho: 300, alto: 600 },
      observador_medida: null,
    }
  },

  computed: {
    /** @returns {object} */
    estilo_maqueta() {
      return {
        width: this.medida.ancho + 'px',
        height: this.medida.alto + 'px',
        transform: 'translate(-50%, -50%) scale(' + this.escala.toFixed(4) + ')',
      }
    },
  },

  mounted() {
    this.medir()
    if (typeof ResizeObserver === 'function' && this.$refs.marco) {
      this.observador_medida = new ResizeObserver(this.medir)
      this.observador_medida.observe(this.$refs.marco)
    } else {
      window.addEventListener('resize', this.medir, { passive: true })
    }
  },

  beforeUnmount() {
    if (this.observador_medida) {
      this.observador_medida.disconnect()
      this.observador_medida = null
    } else {
      window.removeEventListener('resize', this.medir)
    }
  },

  methods: {
    /** @returns {void} */
    medir() {
      const marco = this.$refs.marco
      if (!marco) {
        return
      }
      const ancho = marco.clientWidth
      const alto = marco.clientHeight
      if (!ancho || !alto) {
        return
      }
      const medida = this.diseno ? this.diseno(ancho) : this.medida
      this.medida = medida
      this.escala = Math.min(ESCALA_MAXIMA, ancho / medida.ancho, alto / medida.alto)
    },
  },
}
