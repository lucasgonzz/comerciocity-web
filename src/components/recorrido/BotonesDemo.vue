<template>
  <!-- El par de botones de cada CTA de la página (misión `demo-autogestionada-landing`):

         1. «Elegí día y hora de tu demo»: abre el modal de la agenda. Es un <button> y no un
            <a>: no navega, abre un diálogo (aria-haspopup).
         2. «¿Tenés dudas? Escribinos por WhatsApp»: el MISMO enlace de siempre, con la
            referencia [CC:…] que arma Home.vue, y el MISMO evento (`cta_demo_tocado`, que el
            píxel traduce a Contact + CtaWhatsApp).

       Dos pesos: en las secciones intermedias el WhatsApp es un enlace discreto debajo del
       botón; en el cierre es un botón secundario (contorno) del mismo ancho. El hero tiene su
       propio par en la barra (HeroVideo.vue), con la forma de píldora que pide el video. -->
  <div
    class="demo-botones"
    :class="['demo-botones--' + variante, 'demo-botones--' + tono, 'demo-botones--' + alineacion]"
  >
    <button
      type="button"
      class="demo-boton-marca demo-botones__principal"
      aria-haspopup="dialog"
      @click="on_agenda"
    >
      <i class="bi bi-calendar-check" aria-hidden="true"></i>
      <span>Elegí día y hora de tu demo</span>
    </button>

    <!-- Un <a> de verdad: se abre con el teclado, con "abrir en pestaña nueva" y con el gesto
         largo del teléfono. -->
    <a
      class="demo-botones__whatsapp"
      :href="cta_url"
      target="_blank"
      rel="noopener noreferrer"
      @click="on_whatsapp"
    >
      <i class="bi bi-whatsapp" aria-hidden="true"></i>
      <span>¿Tenés dudas? Escribinos por WhatsApp</span>
    </a>
  </div>
</template>

<script>
export default {
  name: 'BotonesDemo',

  props: {
    /** URL de WhatsApp con el texto prearmado y la referencia de la visita. */
    cta_url: {
      type: String,
      required: true,
    },
    /** Sección desde la que se toca: viaja en `cta_demo_tocado` y en `agenda_abierta`. */
    desde: {
      type: String,
      required: true,
    },
    /** Datos extra del evento de WhatsApp (p.ej. la diapositiva de los agentes). */
    datos_evento: {
      type: Object,
      default: function () {
        return {}
      },
    },
    /** 'seccion' (WhatsApp como enlace discreto) o 'cierre' (botón secundario). */
    variante: {
      type: String,
      default: 'seccion',
    },
    /** 'claro' sobre fondo claro; 'oscuro' sobre un panel oscuro (agentes de IA). */
    tono: {
      type: String,
      default: 'claro',
    },
    /** 'centro' o 'inicio', según cómo alinea la sección su texto. */
    alineacion: {
      type: String,
      default: 'centro',
    },
    emitir_evento: {
      type: Function,
      default: function () {},
    },
    /** Abre el modal de la agenda: abrir_agenda(seccion, evento_del_clic). Lo da Home.vue. */
    abrir_agenda: {
      type: Function,
      default: function () {},
    },
  },

  methods: {
    /**
     * @param {MouseEvent} evento
     * @returns {void}
     */
    on_agenda(evento) {
      this.abrir_agenda(this.desde, evento)
    },

    /** @returns {void} */
    on_whatsapp() {
      this.emitir_evento('cta_demo_tocado', Object.assign({ desde: this.desde }, this.datos_evento))
    },
  },
}
</script>

<style scoped>
.demo-botones {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.demo-botones--inicio {
  align-items: flex-start;
}

/* El WhatsApp de las secciones intermedias: un enlace, no un segundo botón. 44 px de alto
   igual, para el dedo. */
.demo-botones__whatsapp {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 6px 4px;
  font-family: inherit;
  font-size: 0.98rem;
  font-weight: 500;
  line-height: 1.25;
  color: var(--demo-color-texto-suave);
  text-decoration: none;
  border-radius: 10px;
}

.demo-botones__whatsapp .bi {
  font-size: 1.1em;
  color: #1faa59;
}

.demo-botones__whatsapp:hover {
  color: var(--demo-color-texto);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.demo-botones__whatsapp:focus-visible {
  outline: 3px solid var(--demo-color-azul);
  outline-offset: 2px;
}

/* Sobre el panel oscuro de los agentes. */
.demo-botones--oscuro .demo-botones__whatsapp {
  color: rgba(255, 255, 255, 0.82);
}

.demo-botones--oscuro .demo-botones__whatsapp .bi {
  color: #4fd683;
}

.demo-botones--oscuro .demo-botones__whatsapp:hover {
  color: #fff;
}

.demo-botones--oscuro .demo-botones__whatsapp:focus-visible {
  outline-color: #6cb6ff;
}

/* El cierre: el WhatsApp es un botón secundario con contorno, del ancho del principal. */
.demo-botones--cierre {
  gap: 12px;
}

.demo-botones--cierre .demo-botones__principal,
.demo-botones--cierre .demo-botones__whatsapp {
  width: 100%;
}

.demo-botones--cierre {
  width: min(100%, 380px);
}

.demo-botones--cierre .demo-botones__whatsapp {
  min-height: 50px;
  padding: 12px 20px;
  border: 1.5px solid rgba(86, 96, 120, 0.32);
  border-radius: 14px;
  background: var(--demo-color-superficie, #fff);
  color: var(--demo-color-texto);
  font-weight: 600;
  transition: border-color 160ms ease, transform 160ms ease;
}

.demo-botones--cierre .demo-botones__whatsapp:hover {
  border-color: rgba(86, 96, 120, 0.6);
  text-decoration: none;
  transform: translateY(-1px);
}

@media (max-width: 767.98px) {
  .demo-botones {
    width: 100%;
  }

  .demo-botones__principal {
    width: 100%;
    max-width: 360px;
    min-width: 0;
    padding-left: 18px;
    padding-right: 18px;
  }

  .demo-botones--cierre {
    width: 100%;
    max-width: 360px;
  }

  /* Un solo renglón a 390 px: con la letra de escritorio se partía en dos. */
  .demo-botones--cierre .demo-botones__whatsapp {
    gap: 7px;
    padding: 12px 12px;
    font-size: 0.92rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .demo-botones--cierre .demo-botones__whatsapp {
    transition: none;
  }

  .demo-botones--cierre .demo-botones__whatsapp:hover {
    transform: none;
  }
}
</style>
