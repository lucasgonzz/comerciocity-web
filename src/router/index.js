import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Prueba from '../views/Prueba.vue'

const routes = [
  {
    path: '/inicio',
    redirect: (to) => ({ path: '/', query: to.query, hash: to.hash }),
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  /* La agenda de la demo por turno (misión `demo-autogestionada-landing`, 22/10/2026). Desde el
     3/11/2026 (programa «Prueba gratuita de 7 días») queda FUERA del flujo principal: ningún botón
     de la página la abre; sigue viva en esta ruta para quien tenga el link (los dos circuitos
     conviven hasta que Lucas apague la demo por turno). Es la misma Home con el modal abierto. */
  {
    path: '/demo',
    name: 'Demo',
    component: Home,
    meta: { agenda: true },
  },
  /* El alta de la prueba gratuita de 7 días. Con `uuid`, la página retoma el seguimiento del
     armado del sistema (por si el visitante recarga o vuelve desde el correo). */
  {
    path: '/prueba/:uuid?',
    name: 'Prueba',
    component: Prueba,
    props: true,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
