<template>
  <!-- «Un sistema, tres partes», con nombre propio y en grilla como hacen Fudo y Flexxus (informe del 13/11/2026,
       §2.3 punto 4). Cada tarjeta lleva un dibujo chico de lo que hace, no una pantalla de manifiesto. -->
  <section class="lnd-seccion lnd-seccion--oscura" data-seccion="tres_partes">
    <div class="lnd-contenedor">
      <p class="lnd-eyebrow">Un sistema, tres partes</p>
      <h2 class="lnd-h2">Todo conectado. Lo cargás una vez.</h2>
      <p class="lnd-sub">
        Lo que vendés en el mostrador baja el stock de la tienda, y el agente responde con ese mismo stock.
      </p>

      <ul class="lnd-partes">
        <li v-for="parte in partes" :key="parte.clave" class="lnd-parte">
          <span class="lnd-parte__tag" :class="'lnd-parte__tag--' + parte.color">● {{ parte.etiqueta }}</span>
          <h3>{{ parte.titulo }}</h3>
          <p>{{ parte.texto }}</p>

          <!-- Gestión: una venta con su factura. Los artículos y montos son ilustrativos. -->
          <div v-if="parte.clave === 'gestion'" class="lnd-parte__vis" aria-hidden="true">
            <div class="lnd-ui">
              <div class="lnd-ui__fila"><span>Taladro 13 mm</span><span>$84.900</span></div>
              <div class="lnd-ui__fila"><span>Mechas x5</span><span>$12.300</span></div>
              <div class="lnd-ui__total"><span>Total</span><span>$97.200</span></div>
              <span class="lnd-ui__fac">Factura emitida</span>
            </div>
          </div>

          <!-- Tienda: los mismos artículos, con su precio. -->
          <div v-else-if="parte.clave === 'tienda'" class="lnd-parte__vis" aria-hidden="true">
            <div class="lnd-tienda">
              <div><span></span>Taladro<br /><em>$84.900</em></div>
              <div><span></span>Amoladora<br /><em>$96.500</em></div>
              <div><span></span>Llave 10<br /><em>$7.800</em></div>
            </div>
          </div>

          <!-- Agentes: la conversación real del presupuesto (cuadro del reel de Lucas). -->
          <div v-else class="lnd-parte__vis">
            <img
              class="lnd-parte__chat"
              :src="chat_presu"
              alt="Chat con el asistente: arma un presupuesto con su número y su total y pregunta si se lo manda al cliente."
              width="480"
              height="654"
              loading="lazy"
              decoding="async"
            />
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
import { PARTES } from './datos'
import chat_presu from '../../assets/landing/chat-presu.webp'

export default {
  name: 'TresPartes',

  data() {
    return {
      partes: PARTES,
      chat_presu,
    }
  },
}
</script>
