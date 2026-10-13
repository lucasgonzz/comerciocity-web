import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { iniciar_pixel } from './analitica/meta-pixel'

/* Antes de montar: el `PageView` tiene que salir lo antes posible y la atribución de la
   campaña (fbclid/utm_*) tiene que quedar guardada antes de que cualquier navegación le
   saque la query string a la URL. Sin `VITE_META_PIXEL_ID` esto no hace nada. */
iniciar_pixel()

createApp(App).use(router).mount('#app')
