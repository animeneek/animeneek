// Video source module. The original Sub/Dub server remains the primary source.
// GitHub JSON links are optional additional sources shown alongside Sub and Dub.
import { STREAM_URL, SRC_NAMES, STREAM_INDEX_URL } from './config.js';
let base = STREAM_URL;
let indexPromise = null, indexCache = null, indexLoadedAt = 0;

async function loadIndex() {
  if (!STREAM_INDEX_URL) return null;
  if (indexCache && Date.now() - indexLoadedAt < 5 * 60 * 1000) return indexCache;
  if (!indexPromise) {
    indexPromise = window.api.streamIndex(STREAM_INDEX_URL)
      .then(data => { indexCache = data; indexLoadedAt = Date.now(); return data; })
      .finally(() => { indexPromise = null; });
  }
  return indexPromise;
}

function withPlayerColor(rawUrl, color) {
  if (!rawUrl || typeof rawUrl !== 'string' || !/^https:\/\//i.test(rawUrl)) return null;
  try {
    const url = new URL(rawUrl);
    if (/(^|\.)streamtape\.(com|to|net)$/i.test(url.hostname)) {
      const hex = String(color || '#ff4444').replace('#', '');
      const rgb = hex.match(/.{2}/g)?.map(x => parseInt(x, 16));
      if (rgb?.length === 3 && rgb.every(Number.isFinite)) url.searchParams.set('color', rgb.join(','));
    }
    return url.toString();
  } catch { return null; }
}

export default {
  name: 'AnimeNeek server',
  setBase(u) {
    if (typeof u === 'string' && /^https:\/\//.test(u) && ['{MALID}', '{EP}', '{SRC}'].every(t => u.includes(t))) base = u;
  },
  // Preserve the existing server's original Sub and Dub options.
  getServerUrl({ media, malId, episode, audio }) {
    if (base && malId) return base.replace('{MALID}', malId).replace('{EP}', episode).replace('{SRC}', SRC_NAMES[audio] || audio);
    const t = media?.trailer;
    return t && t.site === 'youtube' ? 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(t.id) : null;
  },
  async getSources({ malId, alternateIds = [], episode, color }) {
    const ids = [malId, ...alternateIds].filter(Boolean).map(String);
    if (!ids.length) return [];
    const data = await loadIndex();
    let entries = null;
    for (const id of ids) {
      const show = data?.[id];
      const epKeys = [String(episode), `S${String(episode).padStart(2, '0')}`];
      entries = epKeys.map(k => show?.[k]).find(x => x && typeof x === 'object');
      if (entries) break;
    }
    if (!entries || typeof entries !== 'object') return [];
    return Object.entries(entries)
      .filter(([label, url]) => typeof label === 'string' && typeof url === 'string' && /^https:\/\//i.test(url))
      .map(([label, url]) => ({ label, url: withPlayerColor(url, color) }))
      .filter(x => x.url);
  }
};
