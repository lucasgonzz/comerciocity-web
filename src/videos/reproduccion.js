/** Un solo audio a la vez, también al alternar con testimonios existentes. */
export function pausar_otros(actual, documento) {
  for (const medio of documento.querySelectorAll('video, audio')) {
    if (medio !== actual && !medio.paused) medio.pause()
  }
}
