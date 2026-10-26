<template>
  <!-- "Bienvenido a la nueva era", reescrita el 26/10/2026 a pedido de Lucas: comunica dos
       cosas y nada más. Que migramos TODA la información de la empresa y le entregamos la
       plataforma con los productos y las imágenes ya cargados, y que le entregamos los TRES
       sistemas, cada uno en su tarjeta y con su color: gestión (el celeste azulado de la
       marca), e-commerce (amarillo) y agentes (naranja).

       Hasta esa fecha esta sección traía el tipeo de "no es fácil, y lo sabemos" y las cuatro
       tarjetas de la implementación (migración, ARCA, imágenes, desarrollos a medida). La
       migración y las imágenes quedaron acá arriba; los desarrollos a medida tienen ahora su
       propia sección (SeccionDesarrolloMedida.vue). -->
  <section ref="seccion" class="demo-nueva-era demo-seccion-flujo">
    <div ref="grupo_era" class="demo-nueva-era__grupo" :style="estilo_grupo('era')">
      <h2 class="demo-titulo-seccion demo-paso">Bienvenido a la nueva era.</h2>
      <p class="demo-nueva-era__parrafo demo-paso">
        Nos encargamos de migrar toda la información de tu empresa y te entregamos la
        plataforma lista para usar:
        <strong class="demo-nueva-era__remate-inline">
          con todos tus productos cargados y sus imágenes.
        </strong>
      </p>
      <ul class="demo-nueva-era__migrado demo-paso" aria-label="Lo que migramos">
        <li v-for="item in migrado" :key="item.texto">
          <i class="bi" :class="item.icono" aria-hidden="true"></i>
          <span>{{ item.texto }}</span>
        </li>
      </ul>
    </div>

    <div
      ref="grupo_sistemas"
      class="demo-nueva-era__grupo demo-nueva-era__grupo--ancho"
      :style="estilo_grupo('sistemas')"
    >
      <p class="demo-nueva-era__resaltado demo-paso">
        Y te entregamos los tres sistemas de la plataforma.
      </p>

      <ul class="demo-nueva-era__sistemas">
        <li
          v-for="sistema in sistemas"
          :key="sistema.clave"
          class="demo-nueva-era__sistema demo-paso"
          :class="'demo-nueva-era__sistema--' + sistema.clave"
        >
          <span class="demo-nueva-era__sistema-disco" aria-hidden="true">
            <i class="bi" :class="sistema.icono"></i>
          </span>
          <span class="demo-nueva-era__sistema-rotulo">{{ sistema.rotulo }}</span>
          <h3 class="demo-nueva-era__sistema-titulo">{{ sistema.titulo }}</h3>
          <p class="demo-nueva-era__sistema-texto">{{ sistema.texto }}</p>

          <ul v-if="sistema.agentes" class="demo-nueva-era__agentes">
            <li v-for="agente in sistema.agentes" :key="agente.nombre">
              <i class="bi" :class="agente.icono" aria-hidden="true"></i>
              <span>
                <strong>{{ agente.nombre }}</strong>
                {{ agente.texto }}
              </span>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
import entrada_por_scroll from './entrada-por-scroll'

/** Lo que migramos, en fichas. Productos e imágenes primero: es lo que Lucas pidió subrayar. */
const MIGRADO = [
  { icono: 'bi-box-seam', texto: 'Productos y precios' },
  { icono: 'bi-images', texto: 'Imágenes de cada producto' },
  { icono: 'bi-people', texto: 'Clientes y proveedores, con sus saldos' },
  { icono: 'bi-receipt', texto: 'ARCA conectado' },
]

/**
 * Los tres sistemas, con el texto que dictó Lucas el 26/10/2026. Los agentes son los tres
 * principales que nombró, y existen los tres (agentes/lead/recursos/posicionamiento.md del
 * repo de conocimiento): el asistente personal por WhatsApp, la carga de compras desde la
 * foto de la factura y el agente que atiende a los clientes.
 */
const SISTEMAS = [
  {
    clave: 'gestion',
    icono: 'bi-grid-1x2',
    rotulo: 'ComercioCity',
    titulo: 'Sistema de gestión',
    texto:
      'Con el que administrás tu negocio por dentro: ventas, stock, compras, caja, cuentas ' +
      'corrientes y facturación, desde cualquier dispositivo.',
  },
  {
    clave: 'ecommerce',
    icono: 'bi-bag-check',
    rotulo: 'Tu tienda online',
    /* Con guion que no parte (U+2011): a ~900 px de ancho el título quedaba "e-" / "commerce". */
    titulo: 'Sistema de e‑commerce',
    texto:
      'El portal por el que tus clientes interactúan con tu marca: ven tu catálogo con ' +
      'precios y stock al día y te compran de una forma mucho más práctica.',
  },
  {
    clave: 'agentes',
    icono: 'bi-stars',
    rotulo: 'Inteligencia artificial',
    titulo: 'Sistema de agentes',
    texto: 'Agentes de IA que trabajan en tu negocio. Los principales:',
    agentes: [
      {
        icono: 'bi-person-badge',
        nombre: 'Tu agente personal.',
        texto: 'Le preguntás y le pedís cosas por WhatsApp, como a un empleado de confianza.',
      },
      {
        icono: 'bi-camera',
        nombre: 'El agente de compras.',
        texto: 'Le mandás una foto de la factura y te carga la compra.',
      },
      {
        icono: 'bi-whatsapp',
        nombre: 'El agente de atención.',
        texto: 'Contesta y asesora a tus clientes por WhatsApp, a cualquier hora.',
      },
    ],
  },
]

/**
 * "Bienvenido a la nueva era": la migración y los tres sistemas.
 *
 * Sección de texto, en el flujo normal: no se pinnea. La entrada de cada renglón es función
 * pura del progreso del grupo (mixin entrada-por-scroll), así que la reversa al subir sale
 * gratis.
 */
export default {
  name: 'SeccionNuevaEra',

  mixins: [entrada_por_scroll],

  computed: {
    /** @returns {Array} */
    migrado() {
      return MIGRADO
    },

    /** @returns {Array} */
    sistemas() {
      return SISTEMAS
    },
  },

  methods: {
    /** Los grupos cuya entrada sigue al scroll (contrato del mixin). */
    grupos() {
      return {
        era: this.$refs.grupo_era,
        sistemas: this.$refs.grupo_sistemas,
      }
    },
  },
}
</script>

<style scoped>
.demo-nueva-era__grupo {
  --p: 1;
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  text-align: center;
}

.demo-nueva-era__grupo + .demo-nueva-era__grupo {
  margin-top: clamp(48px, 8vh, 96px);
  margin-top: clamp(48px, 8dvh, 96px);
}

.demo-nueva-era__grupo--ancho {
  max-width: 1120px;
}

.demo-nueva-era__parrafo {
  margin: clamp(16px, 2.4vw, 26px) auto 0;
  max-width: 640px;
  font-size: clamp(1.05rem, 1.6vw, 1.25rem);
  line-height: 1.6;
  color: var(--demo-color-texto-suave);
  text-wrap: pretty;
}

/* Jerarquía tenue y deliberada: cuerpo en suave, remate en el color fuerte. */
.demo-nueva-era__remate-inline {
  font-weight: 600;
  color: var(--demo-color-texto);
}

.demo-nueva-era__migrado {
  list-style: none;
  margin: clamp(20px, 3vw, 30px) 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.demo-nueva-era__migrado li {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  border-radius: 999px;
  border: 1px solid var(--demo-color-borde-superficie);
  background: var(--demo-color-superficie);
  font-size: clamp(0.9rem, 1.3vw, 1rem);
  font-weight: 500;
  color: var(--demo-color-texto);
}

.demo-nueva-era__migrado .bi {
  color: var(--demo-color-azul);
}

.demo-nueva-era__resaltado {
  margin: 0;
  font-size: clamp(1.3rem, 2.4vw, 1.8rem);
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.015em;
  color: var(--demo-color-texto);
  text-wrap: balance;
}

.demo-nueva-era__sistemas {
  list-style: none;
  margin: clamp(26px, 4vw, 42px) 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(14px, 1.8vw, 20px);
  text-align: left;
}

/* La tarjeta de cada sistema. El color entra por tres variables que define cada modificador:
   el tinte (RGB, para lavados y bordes), el disco del ícono y el color del ícono adentro
   del disco (oscuro sobre el amarillo, que con blanco no se lee). */
.demo-nueva-era__sistema {
  --tinte: 11, 132, 248;
  --disco: #0b84f8;
  --icono: #fff;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: clamp(20px, 2.4vw, 28px);
  border: 1px solid rgba(var(--tinte), 0.3);
  border-top: 4px solid var(--disco);
  border-radius: 18px;
  background:
    radial-gradient(120% 70% at 0% 0%, rgba(var(--tinte), 0.16), transparent 60%),
    var(--demo-color-superficie);
  box-shadow: 0 16px 36px -22px rgba(var(--tinte), 0.6);
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.demo-nueva-era__sistema:hover {
  transform: translateY(-2px);
  box-shadow: 0 22px 40px -22px rgba(var(--tinte), 0.75);
}

/* Gestión: el celeste azulado de ComercioCity. */
.demo-nueva-era__sistema--gestion {
  --tinte: 11, 132, 248;
  --disco: #0b84f8;
  --icono: #fff;
}

/* E-commerce: amarillo. */
.demo-nueva-era__sistema--ecommerce {
  --tinte: 245, 179, 1;
  --disco: #f5b301;
  --icono: #3a2a00;
}

/* Agentes: el naranja de la marca. */
.demo-nueva-era__sistema--agentes {
  --tinte: 250, 126, 6;
  --disco: #fa7e06;
  --icono: #fff;
}

.demo-nueva-era__sistema-disco {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-bottom: 6px;
  border-radius: 14px;
  background: var(--disco);
  color: var(--icono);
  font-size: 1.35rem;
  box-shadow: 0 10px 20px -8px rgba(var(--tinte), 0.7);
}

.demo-nueva-era__sistema-rotulo {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--demo-color-texto-suave);
}

.demo-nueva-era__sistema-titulo {
  margin: 0;
  font-size: clamp(1.25rem, 1.9vw, 1.45rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.015em;
  color: var(--demo-color-texto);
}

.demo-nueva-era__sistema-texto {
  margin: 0;
  font-size: clamp(0.97rem, 1.3vw, 1.04rem);
  line-height: 1.55;
  color: var(--demo-color-texto-suave);
}

.demo-nueva-era__agentes {
  list-style: none;
  margin: 4px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.demo-nueva-era__agentes li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: clamp(0.94rem, 1.25vw, 1rem);
  line-height: 1.45;
  color: var(--demo-color-texto-suave);
}

.demo-nueva-era__agentes strong {
  color: var(--demo-color-texto);
}

.demo-nueva-era__agentes .bi {
  flex: 0 0 auto;
  margin-top: 1px;
  color: var(--disco);
  font-size: 1.1rem;
}

/* Tablet y para arriba: las tres en una fila. */
@media (min-width: 900px) {
  .demo-nueva-era__sistemas {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (prefers-reduced-motion: reduce) {
  .demo-nueva-era__sistema {
    transition: none;
  }
}
</style>
