(() => {
  let deferredPrompt = null;

  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  const isIOS = () =>
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const isAndroid = () => /android/i.test(navigator.userAgent);

  const refreshInstallButton = () => {
    const button = document.getElementById('pwa-install');
    if (!button) return;

    if (isStandalone()) {
      button.hidden = true;
      return;
    }

    button.hidden = !(deferredPrompt || isIOS() || isAndroid());
  };

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    refreshInstallButton();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    refreshInstallButton();
  });

  const initialise = () => {
    if (window.location.protocol === 'https:' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')
        .then(registration => {
          registration.update().catch(error =>
            console.warn('AnimeNeek update check:', error)
          );
        })
        .catch(error => console.error('AnimeNeek service worker:', error));
    }

    const button = document.getElementById('pwa-install');

    if (button) {
      button.addEventListener('click', async () => {
        if (isStandalone()) {
          refreshInstallButton();
          return;
        }

        if (deferredPrompt) {
          try {
            await deferredPrompt.prompt();
            await deferredPrompt.userChoice;
          } catch (error) {
            console.error('AnimeNeek installation:', error);
          }

          deferredPrompt = null;
          refreshInstallButton();
          return;
        }

        if (isIOS()) {
          window.alert(
            'To install AnimeNeek on your iPhone:\n\n' +
            '1. Tap the Share button in Safari.\n' +
            '2. Choose Add to Home Screen.\n' +
            '3. Tap Add.\n\n' +
            'iPhone requires you to confirm this action.'
          );
          return;
        }

        if (isAndroid()) {
          window.alert(
            'To install AnimeNeek:\n\n' +
            '1. Open the browser menu (three dots).\n' +
            '2. Choose Install app or Add to Home screen.\n' +
            '3. Confirm Install.'
          );
        }
      });
    }

    refreshInstallButton();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
})();