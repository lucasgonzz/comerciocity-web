<template>
  <!-- El desarrollo a medida, con sección propia (pedido de Lucas, 26/10/2026): "somos la
       única plataforma de Argentina que le puede garantizar que va a tener desarrollo de las
       funcionalidades que necesite de por vida para agilizar continuamente la operatoria de
       su negocio, de forma gratis". Va después del precio: es lo que hace que la mensualidad
       se lea distinto.

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
        <li v-for="(paso, i) in pasos" :key="paso.titulo" class="demo-medida__paso demo-paso">
          <span class="demo-medida__numero" aria-hidden="true">{{ i + 1 }}</span>
          <h3 class="demo-medida__paso-titulo">{{ paso.titulo }}</h3>
          <p class="demo-medida__paso-texto">{{ paso.texto }}</p>
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

/** Cómo funciona, en tres pasos. El plazo es el compromiso del manual (un mes como máximo). */
const PASOS = [
  {
    titulo: 'Nos contás qué necesitás',
    texto: 'Por el mismo WhatsApp de soporte. Lo vemos con vos y definimos el alcance.',
  },
  {
    titulo: 'Lo desarrollamos',
    texto: 'En tu sistema, en un mes como máximo. En general, mucho antes.',
  },
  {
    titulo: 'Lo usás sin pagar de más',
    texto: 'Sin cotizaciones aparte. Y lo que piden otros clientes también te llega a vos.',
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
  max-width: 1000px;
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
  margin: clamp(30px, 4.5vw, 48px) 0 0;
  padding: 0;
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(12px, 1.8vw, 20px);
  text-align: left;
}

.demo-medida__paso {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: clamp(20px, 2.4vw, 26px);
  border-radius: 18px;
  border: 1px solid var(--demo-color-borde-superficie);
  background: var(--demo-color-superficie);
  box-shadow: 0 16px 34px -26px rgba(28, 35, 51, 0.45);
}

.demo-medida__numero {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  margin-bottom: 4px;
  border-radius: 50%;
  background: var(--demo-gradient-marca);
  color: #fff;
  font-weight: 800;
  font-size: 1.05rem;
}

.demo-medida__paso-titulo {
  margin: 0;
  font-size: clamp(1.1rem, 1.6vw, 1.22rem);
  font-weight: 700;
  line-height: 1.25;
  color: var(--demo-color-texto);
}

.demo-medida__paso-texto {
  margin: 0;
  font-size: clamp(0.96rem, 1.3vw, 1.03rem);
  line-height: 1.55;
  color: var(--demo-color-texto-suave);
}

.demo-medida__nota {
  margin: clamp(20px, 3vw, 28px) 0 0;
  max-width: 600px;
  font-size: clamp(0.86rem, 1.15vw, 0.93rem);
  line-height: 1.55;
  color: var(--demo-color-texto-suave);
}

@media (min-width: 768px) {
  .demo-medida__pasos {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
