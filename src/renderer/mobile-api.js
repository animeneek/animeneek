if (!window.api) {
  const cache = new Map();

  async function request(url, options = {}, timeout = 15000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      if (!response.ok) throw new Error('Request failed: ' + response.status);
      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  window.api = {
    anilist: async (query, variables) => {
      const key = 'anilist:' + query + JSON.stringify(variables || {});
      if (cache.has(key)) return cache.get(key);

      const result = await request('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ query, variables })
      });

      if (result.errors?.length) throw new Error(result.errors[0].message);
      cache.set(key, result.data);
      return result.data;
    },

    jikan: async path => {
      if (!String(path).startsWith('/')) throw new Error('Invalid Jikan path');
      const key = 'jikan:' + path;
      if (cache.has(key)) return cache.get(key);

      const result = await request('https://api.jikan.moe/v4' + path, {}, 20000);
      cache.set(key, result);
      return result;
    },

    streamIndex: async url => {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:' || parsed.hostname !== 'raw.githubusercontent.com') {
        throw new Error('Invalid stream index URL');
      }
      return request(parsed.toString());
    },

    remoteConfig: async url => {
      if (!/^https:\/\//.test(url || '')) return null;
      try {
        return await request(url, {}, 8000);
      } catch {
        try {
          return JSON.parse(localStorage.getItem('animeneek-remote-config'));
        } catch {
          return null;
        }
      }
    },

    syncGet: async () => null,
    syncPick: async () => null,
    syncClear: async () => null,
    syncRead: async () => null,
    syncWrite: async () => false,

    openExternal: async url => {
      if (/^https:\/\//.test(url)) window.open(url, '_blank', 'noopener');
    },

    appVersion: async () => 'Mobile',
    checkUpdates: async () => ({ state: 'unavailable' }),
    installUpdate: async () => {},
    onUpdateStatus: () => {}
  };
}
