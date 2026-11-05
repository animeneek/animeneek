if (
  window.location.protocol === 'https:' &&
  'serviceWorker' in navigator
) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .catch(error => console.error('AnimeNeek service worker:', error));
  });
}
