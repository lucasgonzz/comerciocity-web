<template>
  <!-- El cierre de la página: agendar la demo. `data-bloque-id="cta"` es lo que Recorrido
       observa para reportar que el visitante llegó al final. -->
  <section class="demo-cta" data-bloque-id="cta">
    <h2 class="demo-cta__titulo" :style="estilo_entrada(0)">
      ¿Querés verlo funcionando con tu negocio?
    </h2>
    <p class="demo-cta__bajada" :style="estilo_entrada(1)">
      Agendá tu demo. Te la preparamos con la configuración de tu negocio y la recorrés con
      uno de nosotros, sin usuario ni contraseña.
    </p>

    <div class="demo-cta__accion" :style="estilo_entrada(2)">
      <!-- Es un <a> de verdad y no un <button> con window.open: se abre con el teclado, con
           "abrir en pestaña nueva" y con el gesto largo del teléfono. -->
      <a
        class="demo-boton-marca demo-cta__boton"
        :href="cta_url"
        target="_blank"
        rel="noopener noreferrer"
        @click="on_click"
      >
        <i class="bi bi-whatsapp" aria-hidden="true"></i>
        <span>Agendá tu demo</span>
      </a>
      <p class="demo-cta__nota">Se abre WhatsApp, nos escribís y la dejamos lista.</p>
    </div>

    <footer class="demo-cta__pie" :style="estilo_entrada(3)">
      <span>© {{ anio }} ComercioCity</span>
      <a
        class="demo-cta__pie-enlace"
        href="https://www.instagram.com/comerciocity_com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i class="bi bi-instagram" aria-hidden="true"></i> comerciocity_com
      </a>
      <a class="demo-cta__pie-enlace" :href="cta_url" target="_blank" rel="noopener noreferrer">
        <i class="bi bi-whatsapp" aria-hidden="true"></i> +54 3444 544199
      </a>
    </footer>
  </section>
</template>

<script>
/* Tramo de entrada, en unidades de progreso [0,1] de la sección: el 0.42 es el `snap_progreso`
   en que el avance guiado deposita al visitante, así que todo tiene que haber terminado de
   entrar ahí. Cuatro escalones (título, bajada, botón, pie) con desfase corto. */
const ENTRADA_FIN = 0.42
const DESFASE = 0.04
const ENTRADA_Y = 40

/**
 * La curva de toda la página: 1 - (1-t)³.
 *
 * @param {number} t
 * @returns {number}
 */
function ease_out(t) {
  return 1 - Math.pow(1 - t, 3)
}

export default {
  name: 'CtaDemo',

  props: {
    /** URL del CTA (WhatsApp con el texto prearmado). */
    cta_url: {
      type: String,
      required: true,
    },
    /** Progreso [0,1] de la sección que lo contiene (slot escopeado de FondoSeccionSticky). */
    progreso: {
      type: Number,
      default: 0,
    },
    emitir_evento: {
      type: Function,
      default: function () {},
    },
  },

  data() {
    return {
      /* Resuelto antes del primer render: bajo reduced-motion FondoSeccionSticky no mueve el
         progreso y sin esta salida el CTA sería invisible. */
      movimiento_reducido: !!(
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ),
      anio: new Date().getFullYear(),
    }
  },

  methods: {
    /**
     * @param {number} p
     * @param {number} inicio
     * @param {number} fin
     * @returns {number}
     */
    normalizar(p, inicio, fin) {
      if (p <= inicio) {
        return 0
      }
      if (p >= fin) {
        return 1
      }
      return (p - inicio) / (fin - inicio)
    },

    /**
     * Estilo de entrada del escalón `orden`. Sin tramo de salida: es el final de la página.
     *
     * @param {number} orden
     * @returns {object}
     */
    estilo_entrada(orden) {
      if (this.movimiento_reducido) {
        return {}
      }
      const desfase = orden * DESFASE
      const entrada = ease_out(this.normalizar(this.progreso, desfase, ENTRADA_FIN + desfase))
      return {
        opacity: String(entrada),
        transform: 'translateY(' + (1 - entrada) * ENTRADA_Y + 'px)',
      }
    },

    /** @returns {void} */
    on_click() {
      this.emitir_evento('cta_demo_tocado', { desde: 'cierre' })
    },
  },
}
</script>

<style scoped>
.demo-cta {
  position: relative;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: var(--demo-color-texto);
  gap: clamp(14px, 2.4vh, 26px);
}

.demo-cta__titulo {
  margin: 0;
  max-width: 720px;
  font-size: clamp(1.6rem, 3.4vw, 2.3rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.015em;
  will-change: opacity, transform;
}

.demo-cta__bajada {
  margin: 0;
  max-width: 560px;
  font-size: clamp(1.1rem, 2.1vw, 1.4rem);
  font-weight: 400;
  line-height: 1.45;
  color: var(--demo-color-texto-suave);
  will-change: opacity, transform;
}

.demo-cta__accion {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  margin-top: clamp(6px, 1.6vh, 16px);
  will-change: opacity, transform;
}

.demo-cta__nota {
  margin: 0;
  font-size: 0.92rem;
  color: var(--demo-color-texto-suave);
}

/* El pie, pegado al borde inferior del pin. Pequeño: es el final, no una sección más. */
.demo-cta__pie {
  position: absolute;
  left: 0;
  right: 0;
  bottom: clamp(16px, 3vh, 28px);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 22px;
  padding: 0 20px;
  font-size: 0.82rem;
  color: var(--demo-color-texto-suave);
}

.demo-cta__pie-enlace {
  color: inherit;
  text-decoration: none;
}

.demo-cta__pie-enlace:hover,
.demo-cta__pie-enlace:focus-visible {
  color: var(--demo-color-texto);
  text-decoration: underline;
}

@media (max-width: 767.98px) {
  .demo-cta__titulo {
    font-size: clamp(1.7rem, 7.6vw, 2.1rem);
  }

  .demo-cta__boton {
    width: 100%;
    max-width: 360px;
  }
}
</style>
