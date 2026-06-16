<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const content = {
  badge: 'Plataforma de Operación Comercial',
  headline: 'Profesionalizá tu negocio. Sin vueltas.',
  subheadline:
    'Stock, ventas, ecommerce y facturación, todo conectado en tiempo real. Para distribuidoras y comercios argentinos.',
  cta: {
    text: 'Quiero ver la demo',
    url: 'https://wa.me/+543444622139',
    label: 'Abre WhatsApp',
  },
  // Agregá o quitá imágenes del carrusel acá:
  images: [
    new URL('../../assets/notebook-sistema.png', import.meta.url).href,
    new URL('../../assets/notebook-ecommerce.png', import.meta.url).href,
    new URL('../../assets/telefono.png', import.meta.url).href,
  ],
  nav: [
    { label: 'Tiendas', href: '#tiendas' },
    { label: 'Funciones', href: '#funciones' },
    { label: 'Testimonios', href: '#testimonios' },
  ],
}

const activeIndex = ref(0)
let timer = null

function goTo(i) {
  activeIndex.value = i
  resetTimer()
}

function resetTimer() {
  clearInterval(timer)
  if (content.images.length > 1) {
    timer = setInterval(() => {
      activeIndex.value = (activeIndex.value + 1) % content.images.length
    }, 4500)
  }
}

function scrollToSection(e, href) {
  e.preventDefault()
  const target = document.querySelector(href)
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

onMounted(resetTimer)
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <div class="hero-wrapper">
    <!-- Barra de navegación -->
    <nav class="hero-nav">
      <div class="hero-nav__inner">
        <a href="/" class="hero-nav__logo">
          <span class="hero-nav__logo-mark">CC</span>
          ComercioCity
        </a>

        <ul class="hero-nav__links">
          <li v-for="link in content.nav" :key="link.href">
            <a :href="link.href" class="hero-nav__link" @click="scrollToSection($event, link.href)">{{ link.label }}</a>
          </li>
        </ul>

        <a
          :href="content.cta.url"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-sm hero-nav__cta fw-semibold"
          :aria-label="content.cta.label"
        >
          <i class="bi bi-whatsapp me-1"></i>{{ content.cta.text }}
        </a>
      </div>
    </nav>

    <!-- Hero dividido -->
    <section class="hero-section">
      <!-- Columna izquierda: texto -->
      <div class="hero-left">
        <div class="hero-left__inner">
          <span class="hero-badge">{{ content.badge }}</span>
          <h1 class="hero-headline">{{ content.headline }}</h1>
          <p class="hero-sub">{{ content.subheadline }}</p>
          <a
            :href="content.cta.url"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-lg px-4 py-3 fw-semibold hero-cta"
            :aria-label="content.cta.label"
          >
            <i class="bi bi-whatsapp me-2"></i>{{ content.cta.text }}
          </a>
        </div>
      </div>

      <!-- Columna derecha: carrusel -->
      <div class="hero-right">
        <div class="hero-carousel">
          <img
            v-for="(img, i) in content.images"
            :key="img"
            :src="img"
            alt="Dashboard de ComercioCity"
            class="hero-carousel__img"
            :class="{ 'is-active': activeIndex === i }"
          />
        </div>

        <!-- Indicadores -->
        <div v-if="content.images.length > 1" class="hero-indicators" role="tablist">
          <button
            v-for="(_, i) in content.images"
            :key="i"
            class="hero-indicator"
            :class="{ 'is-active': activeIndex === i }"
            :aria-label="`Imagen ${i + 1}`"
            role="tab"
            @click="goTo(i)"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ── Wrapper: ocupa exactamente 100dvh ── */
.hero-wrapper {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  min-height: 560px;
}

/* ── Navbar ── */
.hero-nav {
  flex: none;
  background-color: #0a1f2e;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  z-index: 200;
}

.hero-nav__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0.75rem 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.hero-nav__logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.05rem;
  color: #ffffff;
  text-decoration: none;
  white-space: nowrap;
}

.hero-nav__logo-mark {
  background-color: #38bdf8;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 2px 5px;
  border-radius: 4px;
  letter-spacing: 0.05em;
}

.hero-nav__links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
  flex: 1;
}

.hero-nav__link {
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s;
}

.hero-nav__link:hover {
  color: #ffffff;
}

.hero-nav__cta {
  margin-left: auto;
  white-space: nowrap;
}

/* ── Hero section: ocupa todo el espacio restante ── */
.hero-section {
  flex: 1;
  display: flex;
  min-height: 0;
}

/* ── Columna izquierda ── */
.hero-left {
  flex: 0 0 50%;
  min-width: 0;
  background-color: #0a1f2e;
  display: flex;
  align-items: center;
  overflow-y: auto;
  padding: 3rem 2rem;
}

.hero-left__inner {
  max-width: 520px;
  width: 100%;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.hero-badge {
  display: inline-block;
  background-color: rgba(56, 189, 248, 0.15);
  color: #7dd3fc;
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 999px;
  padding: 0.3rem 0.9rem;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  margin-bottom: 1.25rem;
}

.hero-headline {
  font-size: clamp(1.85rem, 3vw, 2.85rem);
  font-weight: 800;
  line-height: 1.15;
  color: #ffffff;
  margin-bottom: 1.25rem;
}

.hero-sub {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.65;
  margin-bottom: 2rem;
  max-width: 420px;
}

.hero-cta,
.hero-nav__cta {
  background-color: #0ea5e9;
  color: #ffffff;
  border: none;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.hero-cta:hover,
.hero-nav__cta:hover {
  background-color: #0284c7;
  color: #ffffff;
}

/* ── Columna derecha: carrusel a sangre ── */
.hero-right {
  flex: 0 0 50%;
  min-width: 0;
  position: relative;
  overflow: hidden;
  background-color: #e0f2fe;
}

/* El carrusel llena toda la columna */
.hero-carousel {
  position: absolute;
  inset: 0;
}

.hero-carousel__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.65s ease;
  pointer-events: none;
}

.hero-carousel__img.is-active {
  opacity: 1;
  pointer-events: auto;
}

/* ── Indicadores ── */
.hero-indicators {
  position: absolute;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.45rem;
  z-index: 2;
}

.hero-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background-color: rgba(0, 0, 0, 0.25);
  padding: 0;
  cursor: pointer;
  transition: background-color 0.25s, transform 0.25s;
}

.hero-indicator.is-active {
  background-color: #38bdf8;
  transform: scale(1.4);
}

/* ── Mobile (≤ 792px) ── */
@media (max-width: 792px) {
  .hero-wrapper {
    height: auto;
    min-height: 0;
  }

  .hero-section {
    flex-direction: column;
    flex: none;
  }

  .hero-left {
    flex: none;
    width: 100vw;
    padding: 2.5rem 1.5rem;
    overflow-y: visible;
  }

  .hero-left__inner {
    padding: 0;
    max-width: 100%;
  }

  .hero-right {
    flex: none;
    width: 100vw;
    /* altura proporcional para el carrusel en móvil */
    height: 100vw;
    min-height: 240px;
  }

  .hero-nav__links {
    display: none;
  }
}
</style>
