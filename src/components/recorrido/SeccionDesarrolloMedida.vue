<template>
  <!-- El desarrollo a medida, con sección propia (pedido de Lucas, 26/10/2026): "somos la
       única plataforma de Argentina que le puede garantizar que va a tener desarrollo de las
       funcionalidades que necesite de por vida para agilizar continuamente la operatoria de
       su negocio, de forma gratis". Va ANTES del precio (tercera vuelta del 26/10/2026): la
       mensualidad se lee sabiendo que incluye esto.

       Las tarjetas de los tres pasos llevan "más onda" (mismo pedido): cada una con su ícono
       en un azulejo de color, el número grande de fondo y un dato corto abajo; entre una y
       otra, una flecha que marca el recorrido, y la tercera —el remate, "sin pagar de más"—
       con el degradé de la marca.

       El alcance sale de manual_sistema/general/comunidad-y-acompanamiento.md del repo de
       conocimiento, y la nota del pie lo dice en una línea: los desarrollos coherentes con la
       operación del comercio están incluidos (~95 % de los pedidos, como orientación), el
       compromiso es de un mes como máximo para un pedido con alcance definido, y los pedidos
       radicalmente grandes se conversan aparte. Sin esa línea la página promete "cualquier
       desarrollo, gratis", que es lo que ese documento pide no prometer. -->
  <section ref="seccion" class="demo-medida demo-seccion-flujo">
    <div ref="grupo" class="demo-medida__grupo" :style="estilo_grupo('grupo')">
      <span class="demo-rotulo demo-paso">Desarrollo a medida</span>
      <h2 class="demo-titulo-seccion demo-paso">Tu sistema crece con tu negocio. De por vida.</h2>
      <p class="demo-bajada-seccion demo-medida__bajada demo-paso">
        Somos la única plataforma de Argentina que te garantiza el desarrollo de las
        funcionalidades que necesites,
        <strong>de por vida y sin costo</strong>, para que la operatoria de tu negocio sea cada
        vez más ágil.
      </p>

      <ol class="demo-medida__pasos">
        <li
          v-for="(paso, i) in pasos"
          :key="paso.titulo"
          class="demo-medida__paso demo-paso"
          :class="'demo-medida__paso--' + paso.clave"
        >
          <!-- El hover levanta esta capa y no el <li>: el <li> ya usa `transform` para la
               entrada por scroll (`.demo-paso`) y se pisarían. -->
          <div class="demo-medida__tarjeta">
            <span class="demo-medida__numero" aria-hidden="true">{{ '0' + (i + 1) }}</span>
            <span class="demo-medida__icono" aria-hidden="true">
              <i class="bi" :class="paso.icono"></i>
            </span>
            <h3 class="demo-medida__paso-titulo">{{ paso.titulo }}</h3>
            <p class="demo-medida__paso-texto">{{ paso.texto }}</p>
            <span class="demo-medida__dato">
              <i class="bi" :class="paso.dato_icono" aria-hidden="true"></i>
              {{ paso.dato }}
            </span>
          </div>
          <span v-if="i < pasos.length - 1" class="demo-medida__flecha" aria-hidden="true">
            <i class="bi bi-arrow-right"></i>
          </span>
        </li>
      </ol>

      <p class="demo-medida__nota demo-paso">
        Incluye los desarrollos para llevar los procesos de tu comercio al sistema: son la gran
        mayoría de los pedidos. Los pedidos radicalmente grandes los charlamos aparte.
      </p>
    </div>
  </section>
</template>

<script>
import entrada_por_scroll from './entrada-por-scroll'

/**
 * Cómo funciona, en tres pasos. El plazo es el compromiso del manual (un mes como máximo).
 * `dato` es el remate corto de cada tarjeta: repite lo que dice el texto, no promete más.
 */
const PASOS = [
  {
    clave: 'contas',
    icono: 'bi-chat-heart',
    titulo: 'Nos contás qué necesitás',
    texto: 'Por el mismo WhatsApp de soporte. Lo vemos con vos y definimos el alcance.',
    dato_icono: 'bi-whatsapp',
    dato: 'Por WhatsApp',
  },
  {
    clave: 'desarrollamos',
    icono: 'bi-code-slash',
    titulo: 'Lo desarrollamos',
    texto: 'En tu sistema, en un mes como máximo. En general, mucho antes.',
    dato_icono: 'bi-stopwatch',
    dato: 'Un mes como máximo',
  },
  {
    clave: 'usas',
    icono: 'bi-rocket-takeoff',
    titulo: 'Lo usás sin pagar de más',
    texto: 'Sin cotizaciones aparte. Y lo que piden otros clientes también te llega a vos.',
    dato_icono: 'bi-check2-circle',
    dato: '$0 extra',
  },
]

export default {
  name: 'SeccionDesarrolloMedida',

  mixins: [entrada_por_scroll],

  computed: {
    /** @returns {Array} */
    pasos() {
      return PASOS
    },
  },

  methods: {
    /** Los grupos cuya entrada sigue al scroll (contrato del mixin). */
    grupos() {
      return { grupo: this.$refs.grupo }
    },
  },
}
</script>

<style scoped>
.demo-medida {
  background:
    radial-gradient(90% 60% at 50% 0%, rgba(11, 132, 248, 0.12), transparent 65%),
    var(--demo-color-fondo);
}

.demo-medida__grupo {
  --p: 1;
  width: 100%;
  max-width: 1060px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.demo-medida__bajada {
  max-width: 660px;
}

.demo-medida__bajada strong {
  color: var(--demo-color-texto);
}

.demo-medida__pasos {
  list-style: none;
  margin: clamp(34px, 5vw, 56px) 0 0;
  padding: 0;
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(30px, 3.2vw, 40px);
  text-align: left;
}

/* El color de cada paso: azul, violeta y, en el tercero, el degradé completo. */
.demo-medida__paso {
  --tono: #0b84f8;
  --tono-suave: rgba(11, 132, 248, 0.12);
  position: relative;
  display: flex;
}

.demo-medida__paso--desarrollamos {
  --tono: #3a31fc;
  --tono-suave: rgba(58, 49, 252, 0.12);
}

.demo-medida__tarjeta {
  position: relative;
  overflow: hidden;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: clamp(24px, 2.8vw, 32px);
  border-radius: 22px;
  border: 1px solid var(--demo-color-borde-superficie);
  background:
    radial-gradient(120% 80% at 0% 0%, var(--tono-suave), transparent 55%),
    var(--demo-color-superficie);
  box-shadow: 0 18px 40px -28px rgba(28, 35, 51, 0.5);
  transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
}

/* La línea de color arriba de cada tarjeta. */
.demo-medida__tarjeta::before {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 4px;
  background: linear-gradient(90deg, var(--tono), transparent);
}

.demo-medida__tarjeta:hover {
  transform: translateY(-6px);
  border-color: var(--tono);
  box-shadow: 0 26px 50px -26px var(--tono);
}

/* El número grande, de fondo, en la esquina: da ritmo sin competir con el título. */
.demo-medida__numero {
  position: absolute;
  top: clamp(8px, 1.2vw, 14px);
  right: clamp(14px, 1.8vw, 22px);
  font-size: clamp(3.6rem, 6vw, 4.6rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
  color: var(--tono);
  opacity: 0.1;
  font-variant-numeric: tabular-nums;
  pointer-events: none;
}

.demo-medida__icono {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  margin-bottom: 6px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--tono), #3a31fc);
  box-shadow: 0 12px 24px -12px var(--tono);
  color: #fff;
  font-size: 1.5rem;
  animation: demo-medida-flotar 4.5s ease-in-out infinite;
}

.demo-medida__paso--desarrollamos .demo-medida__icono {
  background: linear-gradient(135deg, #6d5dfc, var(--tono));
  animation-delay: -1.5s;
}

.demo-medida__paso--usas .demo-medida__icono {
  animation-delay: -3s;
}

.demo-medida__paso-titulo {
  margin: 0;
  font-size: clamp(1.15rem, 1.7vw, 1.3rem);
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.01em;
  color: var(--demo-color-texto);
}

.demo-medida__paso-texto {
  margin: 0;
  font-size: clamp(0.96rem, 1.3vw, 1.03rem);
  line-height: 1.55;
  color: var(--demo-color-texto-suave);
}

/* El remate de cada tarjeta, abajo de todo: una píldora con el tono del paso. */
.demo-medida__dato {
  align-self: flex-start;
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 13px;
  border-radius: 999px;
  background: var(--tono-suave);
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--tono);
}

/* El tercero es el remate de la sección: el degradé de la marca y texto blanco. */
.demo-medida__paso--usas .demo-medida__tarjeta {
  border-color: transparent;
  background:
    radial-gradient(90% 70% at 100% 0%, rgba(255, 255, 255, 0.22), transparent 60%),
    linear-gradient(140deg, #0b84f8 0%, #3a31fc 100%);
  box-shadow: 0 24px 50px -24px rgba(58, 49, 252, 0.75);
}

.demo-medida__paso--usas .demo-medida__tarjeta::before {
  display: none;
}

.demo-medida__paso--usas .demo-medida__tarjeta:hover {
  border-color: transparent;
  box-shadow: 0 30px 60px -24px rgba(58, 49, 252, 0.9);
}

.demo-medida__paso--usas .demo-medida__numero {
  color: #fff;
  opacity: 0.18;
}

.demo-medida__paso--usas .demo-medida__icono {
  background: rgba(255, 255, 255, 0.18);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
}

.demo-medida__paso--usas .demo-medida__paso-titulo {
  color: #fff;
}

.demo-medida__paso--usas .demo-medida__paso-texto {
  color: rgba(255, 255, 255, 0.86);
}

.demo-medida__paso--usas .demo-medida__dato {
  background: #fff;
  color: #15803d;
}

/* La flecha que une un paso con el siguiente: abajo en el celular, al costado en escritorio.
   Va centrada en el hueco entre tarjetas. */
.demo-medida__flecha {
  position: absolute;
  z-index: 1;
  left: 50%;
  bottom: calc(clamp(30px, 3.2vw, 40px) / -2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--demo-color-fondo);
  border: 1px solid var(--demo-color-borde-superficie);
  box-shadow: 0 8px 18px -10px rgba(28, 35, 51, 0.5);
  color: var(--demo-color-azul);
  font-size: 1.05rem;
  transform: translate(-50%, 50%) rotate(90deg);
}

.demo-medida__nota {
  margin: clamp(24px, 3.4vw, 34px) 0 0;
  max-width: 600px;
  font-size: clamp(0.86rem, 1.15vw, 0.93rem);
  line-height: 1.55;
  color: var(--demo-color-texto-suave);
}

@keyframes demo-medida-flotar {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

@media (min-width: 768px) {
  .demo-medida__pasos {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .demo-medida__flecha {
    top: 50%;
    bottom: auto;
    left: auto;
    right: calc(clamp(30px, 3.2vw, 40px) / -2);
    transform: translate(50%, -50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .demo-medida__icono {
    animation: none;
  }

  .demo-medida__tarjeta {
    transition: none;
  }

  .demo-medida__tarjeta:hover {
    transform: none;
  }
}
</style>
