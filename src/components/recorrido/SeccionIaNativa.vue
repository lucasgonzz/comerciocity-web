<template>
  <!-- La inteligencia artificial como pilar (pedido de Lucas, 26/10/2026). Va entre "la nueva
       era" y las escenas de los agentes: primero el porqué (los negocios que más van a crecer
       son los que pongan a trabajar a la IA), después la diferencia (en ComercioCity la IA
       está en el núcleo, no pegada por fuera) y la capacitación por videollamada; las
       escenas de abajo muestran cómo se ve.

       Lucas dudaba de la palabra ("nativa, fundamental... algo que haga entender que la IA es
       un pilar"): se eligió "en su núcleo" para el titular y "pilar" en el texto, que dicen
       las dos cosas que pidió -- cómo está integrada y que es la base de lo que viene. -->
  <section ref="seccion" class="demo-ia demo-seccion-flujo">
    <div ref="grupo" class="demo-ia__grupo" :style="estilo_grupo('grupo')">
      <span class="demo-ia__rotulo demo-paso">
        <i class="bi bi-stars" aria-hidden="true"></i> Inteligencia artificial
      </span>
      <h2 class="demo-ia__titulo demo-paso">
        Los negocios que más van a crecer son los que pongan a trabajar a la inteligencia
        artificial.
      </h2>
      <p class="demo-ia__bajada demo-paso">
        A partir de ahora, la diferencia la va a hacer cuánto trabajo de tu negocio delegás en
        agentes de IA: atender, cargar, recordar, analizar.
        <strong>
          ComercioCity es la única plataforma que tiene la inteligencia artificial en su
          núcleo.
        </strong>
      </p>

      <ul class="demo-ia__pilares">
        <li v-for="pilar in pilares" :key="pilar.titulo" class="demo-ia__pilar demo-paso">
          <span class="demo-ia__pilar-disco" aria-hidden="true">
            <i class="bi" :class="pilar.icono"></i>
          </span>
          <h3 class="demo-ia__pilar-titulo">{{ pilar.titulo }}</h3>
          <p class="demo-ia__pilar-texto">{{ pilar.texto }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
import entrada_por_scroll from './entrada-por-scroll'

/**
 * Las tres ideas que pidió Lucas: cómo está integrada, que es la base de lo que viene, y la
 * videollamada de capacitación para aplicar la IA en la mayor cantidad de áreas posible.
 */
const PILARES = [
  {
    icono: 'bi-cpu',
    titulo: 'Integrada de raíz',
    texto:
      'Los agentes trabajan sobre la misma información del sistema: ventas, stock, compras, ' +
      'clientes y caja. No es un chat pegado por fuera: es parte de la plataforma.',
  },
  {
    icono: 'bi-rocket-takeoff',
    titulo: 'El pilar de lo que viene',
    texto:
      'Cada actualización suma más trabajo que le podés delegar a la IA. Es la base sobre la ' +
      'que construimos el futuro de ComercioCity, y de tu negocio.',
  },
  {
    icono: 'bi-camera-video',
    titulo: 'Te capacitamos por videollamada',
    texto:
      'Te damos una videollamada de capacitación para que apliques la inteligencia ' +
      'artificial en la mayor cantidad posible de áreas de tu empresa.',
  },
]

export default {
  name: 'SeccionIaNativa',

  mixins: [entrada_por_scroll],

  computed: {
    /** @returns {Array} */
    pilares() {
      return PILARES
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
/* Fondo noche con el violeta de la marca y una mancha del naranja de los agentes: es la
   única sección oscura antes de las escenas, y marca el cambio de tema. Colores fijos (no
   las variables del tema): esta sección es oscura en cualquier tema. */
.demo-ia {
  background-color: #0a1022;
  background-image:
    radial-gradient(90% 70% at 15% 10%, rgba(58, 49, 252, 0.45), transparent 60%),
    radial-gradient(70% 60% at 90% 95%, rgba(250, 126, 6, 0.28), transparent 60%),
    radial-gradient(80% 60% at 85% 5%, rgba(11, 132, 248, 0.3), transparent 60%);
  color: #f4f7fd;
}

.demo-ia__grupo {
  --p: 1;
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.demo-ia__rotulo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border-radius: 999px;
  border: 1px solid rgba(250, 126, 6, 0.45);
  background: rgba(250, 126, 6, 0.12);
  color: #ffb36b;
  font-size: clamp(0.8rem, 1.2vw, 0.9rem);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.demo-ia__titulo {
  margin: clamp(18px, 2.6vw, 26px) 0 0;
  max-width: 900px;
  font-size: clamp(1.9rem, 4.6vw, 3rem);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -0.025em;
  color: #fff;
  text-wrap: balance;
}

.demo-ia__bajada {
  margin: clamp(16px, 2.2vw, 22px) 0 0;
  max-width: 720px;
  font-size: clamp(1.05rem, 1.6vw, 1.22rem);
  line-height: 1.6;
  color: #b7c0d6;
  text-wrap: pretty;
}

.demo-ia__bajada strong {
  display: block;
  margin-top: 10px;
  color: #fff;
  font-weight: 700;
}

.demo-ia__pilares {
  list-style: none;
  margin: clamp(32px, 5vw, 52px) 0 0;
  padding: 0;
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(12px, 1.8vw, 20px);
  text-align: left;
}

.demo-ia__pilar {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: clamp(20px, 2.4vw, 26px);
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 20px 40px -28px rgba(0, 0, 0, 0.8);
}

.demo-ia__pilar-disco {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  margin-bottom: 6px;
  border-radius: 13px;
  background: #fa7e06;
  color: #fff;
  font-size: 1.3rem;
  box-shadow: 0 10px 22px -8px rgba(250, 126, 6, 0.7);
}

.demo-ia__pilar-titulo {
  margin: 0;
  font-size: clamp(1.12rem, 1.6vw, 1.25rem);
  font-weight: 700;
  line-height: 1.25;
  color: #fff;
}

.demo-ia__pilar-texto {
  margin: 0;
  font-size: clamp(0.96rem, 1.3vw, 1.03rem);
  line-height: 1.55;
  color: #b7c0d6;
}

@media (min-width: 900px) {
  .demo-ia__pilares {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
