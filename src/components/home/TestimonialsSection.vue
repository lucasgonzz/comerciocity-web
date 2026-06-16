<script setup>
function getEmbedUrl(url) {
  if (!url) return null

  const youtube = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  )
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`

  return null
}

const content = {
  title: 'Lo que dicen nuestros clientes',
  testimonials: [
    {
      name: 'Innovate',
      business: 'Distribuidora / Corralon',
      quote:
        'Buscábamos ir más allá del Excel: una transformación con acompañamiento real, no solo software. Tras probar sistemas con «soporte» que terminaba en un bot, encontramos respuestas humanas y soluciones concretas para nuestro corralón. En el video contamos cómo lo logramos.',
      // Archivo en public/videos/testimonials/ (mp4, webm)
      videoSrc: '/images/testimonials/innovate_testimonio.mp4',
      // Enlace externo (YouTube, Vimeo, Drive, etc.)
      // videoUrl: 'https://drive.google.com/file/d/1NbphhaI33hoPd-fYiLlvcClglqsobkVv/view?usp=sharing',
      avatar: '/images/testimonials/innovate.jpeg',
      instagramUrl: 'https://www.instagram.com/innovate.materiales9dj/',
    },
    {
      name: 'Pack Descartables',
      business: 'Distribuidora / Articulos Descartables',
      quote:
        'Implementamos sin frenar la distribución: el equipo lo entendió al instante y seguimos operando durante el proyecto. Soporte paciente, siempre disponible — un 10 en atención. Escuchá la experiencia completa en el video.',
      videoSrc: '/images/testimonials/pack_testimonio.mp4',
      // videoUrl: null,
      avatar: '/images/testimonials/pack.png',
      instagramUrl: 'https://www.instagram.com/packdescartables_/',
    },
  ],
}
</script>

<template>
  <section id="testimonios" class="testimonials-section py-5 py-lg-6">
    <div class="container">
      <h2 class="text-center display-6 fw-bold mb-5">{{ content.title }}</h2>

      <div class="row g-4 justify-content-center">
        <div
          v-for="(t, index) in content.testimonials"
          :key="index"
          class="col-md-6"
        >
          <div class="testimonial-card h-100 p-4 rounded-4 d-flex flex-column">
            <div v-if="t.quote" class="mb-4">
              <i class="bi bi-quote quote-icon d-block mb-2"></i>
              <p class="fs-5 mb-0">{{ t.quote }}</p>
            </div>

            <div v-if="t.videoSrc || getEmbedUrl(t.videoUrl)" class="testimonial-video mb-4">
              <video
                v-if="t.videoSrc"
                :src="t.videoSrc"
                controls
                playsinline
                preload="metadata"
                class="testimonial-video-player w-100 rounded-3"
              ></video>
              <iframe
                v-else
                :src="getEmbedUrl(t.videoUrl)"
                title="Testimonio en video"
                class="testimonial-video-embed w-100 rounded-3"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>

            <a
              v-if="t.videoUrl"
              :href="t.videoUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="testimonial-video-link d-inline-flex align-items-center gap-2 small fw-semibold mb-4"
            >
              <i class="bi bi-play-circle"></i>
              Ver testimonio en video
            </a>

            <div class="d-flex align-items-center gap-3 mt-auto pt-3 border-top">
              <img
                :src="t.avatar"
                :alt="t.name"
                class="testimonial-avatar rounded-circle bg-light"
              />
              <div class="flex-grow-1 min-w-0">
                <div class="fw-bold">{{ t.name }}</div>
                <div class="text-secondary small">{{ t.business }}</div>
              </div>
              <a
                v-if="t.instagramUrl"
                :href="t.instagramUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="testimonial-instagram-btn flex-shrink-0"
                :aria-label="`Ver perfil de Instagram de ${t.name}`"
                :title="`Instagram de ${t.name}`"
              >
                <i class="bi bi-instagram" aria-hidden="true"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.testimonials-section {
  background-color: #fff;
}

.testimonial-card {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
}

.quote-icon {
  font-size: 2.5rem;
  color: var(--cc-primary);
  opacity: 0.35;
  line-height: 1;
}

.testimonial-avatar {
  width: 72px;
  height: 72px;
  object-fit: cover;
  flex-shrink: 0;
}

.testimonial-video-player,
.testimonial-video-embed {
  aspect-ratio: 16 / 9;
  background-color: #0f172a;
  display: block;
}

.testimonial-video-link {
  color: var(--cc-primary);
  text-decoration: none;
}

.testimonial-video-link:hover {
  color: var(--cc-primary);
  text-decoration: underline;
}

.testimonial-instagram-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  color: #fff;
  font-size: 1.35rem;
  line-height: 1;
  text-decoration: none;
  background: linear-gradient(
    45deg,
    #f09433 0%,
    #e6683c 25%,
    #dc2743 50%,
    #cc2366 75%,
    #bc1888 100%
  );
  box-shadow: 0 2px 8px rgba(188, 24, 136, 0.35);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.testimonial-instagram-btn:hover {
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(188, 24, 136, 0.45);
}

.testimonial-instagram-btn:focus-visible {
  outline: 2px solid var(--cc-primary);
  outline-offset: 2px;
}
</style>
