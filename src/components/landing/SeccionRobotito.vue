<template>
  <!-- Robotito: la guía que señala en la pantalla dónde tocar. Es real y está publicada (empresa 4.3.46 en adelante,
       informes `20261108-robotito-tours-soporte` y `20261110-robotito-tarjetas-y-recorridos`): se le pregunta a
       Soporte cómo se hace algo y, si la persona acepta el recorrido, Robotito la guía paso a paso sobre su propia
       pantalla. La «pantallita» de abajo dibuja uno de los recorridos reales del catálogo: buscar un artículo en
       Vender por nombre o por código. -->
  <section class="lnd-seccion lnd-seccion--alt" data-seccion="robotito">
    <div class="lnd-contenedor lnd-robot-grilla">
      <div>
        <p class="lnd-eyebrow">Nunca te quedás trabado</p>
        <h2 class="lnd-h2">¿No sabés cómo se hace algo? Preguntale a Robotito.</h2>
        <div class="lnd-robot">
          <robotito class="lnd-robot__figura" pose="saludo" />
          <p class="lnd-globo">
            Me preguntás en Soporte y te señalo en la pantalla dónde tocar, paso a paso, sin salir de lo que estás
            haciendo.
          </p>
        </div>
      </div>

      <div>
        <div class="lnd-pantallita" aria-hidden="true">
          <div class="lnd-pantallita__barra"><i></i><i></i><i></i></div>
          <p class="lnd-pantallita__titulo">Vender</p>
          <div class="lnd-pantallita__campo lnd-pantallita__campo--senalado">Buscá por nombre o código…</div>
          <div class="lnd-pantallita__fila"></div>
          <div class="lnd-pantallita__fila" style="width: 70%"></div>
          <p class="lnd-pantallita__nota">Escribí acá el nombre del artículo o escaneá su código.</p>
        </div>
        <p class="lnd-persona">Y si preferís escribir por WhatsApp, Martín, de soporte, te contesta ahí.</p>
      </div>
    </div>
  </section>
</template>

<script>
import Robotito from './Robotito.vue'

export default {
  name: 'SeccionRobotito',

  components: { Robotito },
}
</script>
