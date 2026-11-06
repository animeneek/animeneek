import provider from './provider.js';
import './mobile-api.js';
import { LANDING_IMAGE, REMOTE_CONFIG_URL } from './config.js';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const view = $('#view');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const strip = s => String(s || '').replace(/<[^>]+>/g, '');
const name = m => m.title.english || m.title.romaji;
const PLAY = '<i class="fa-solid fa-play"></i>';
const meta = m => [m.format === 'MOVIE' ? 'Movie' : m.format, m.episodes ? m.episodes + ' eps' : m.seasonYear].filter(Boolean).join(' · ');
const RIBBON = '<div class="ribbon"><span>Hentai</span></div>';

// ---------- profiles ("Who's watching?") + optional sync to the user's own cloud folder ----------
const GRADS = ['linear-gradient(135deg,#ff4444,#7a0d1c)', 'linear-gradient(135deg,#ff7a7a,#4a1030)', 'linear-gradient(135deg,#5b6cff,#14183f)', 'linear-gradient(135deg,#ffb347,#6b1d12)', 'linear-gradient(135deg,#ff6fa5,#3a1030)', 'linear-gradient(135deg,#31d0aa,#0d3a3a)', 'linear-gradient(135deg,#ffd93b,#5a3a05)', 'linear-gradient(135deg,#9aa3b5,#1b1f2a)'];
const SCENE = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMaxYMax slice" xmlns="http://www.w3.org/2000/svg"><defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset=".35" stop-color="#1a0508"/><stop offset=".62" stop-color="#6b1212"/><stop offset=".82" stop-color="#d4412a"/><stop offset="1" stop-color="#ff9a4a"/></linearGradient>
<radialGradient id="glow"><stop offset="0" stop-color="#ff7a3a" stop-opacity=".6"/><stop offset="1" stop-color="#ff4444" stop-opacity="0"/></radialGradient>
<radialGradient id="halo"><stop offset=".5" stop-color="#ffd9a0" stop-opacity=".9"/><stop offset="1" stop-color="#ff8a4a" stop-opacity="0"/></radialGradient></defs>
<rect width="1600" height="900" fill="url(#sky)"/><circle cx="1100" cy="610" r="440" fill="url(#glow)"/><circle cx="1100" cy="600" r="130" fill="url(#halo)"/><circle cx="1100" cy="600" r="78" fill="#ffe6b8"/>
<g fill="none" stroke="#000" stroke-width="3" stroke-linecap="round" opacity=".7"><path d="M880 360q14-16 28 0q14-16 28 0"/><path d="M960 410q10-12 20 0q10-12 20 0"/><path d="M820 440q8-10 16 0q8-10 16 0"/></g>
<path d="M0 700L120 610L230 660L380 560L520 650L640 600L800 690L960 620L1120 700L1300 610L1450 680L1600 630L1600 900L0 900Z" fill="#2a0d0f" opacity=".92"/>
<path d="M0 760L180 690L340 740L520 680L720 750L900 700L1060 760L1240 720L1400 770L1600 730L1600 900L0 900Z" fill="#0d0506"/>
<path d="M0 900L0 770C250 730 450 800 700 770C900 745 1000 705 1100 700C1250 693 1400 750 1600 735L1600 900Z" fill="#000"/>
<g fill="#000" stroke="#000" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M215 900C228 800 206 730 232 650C226 600 212 560 226 520L250 522C256 560 270 600 262 650C288 730 268 800 282 900Z"/>
<path fill="none" stroke-width="11" d="M232 650C170 620 130 590 90 520"/><path fill="none" stroke-width="11" d="M250 600C310 560 350 530 410 470"/><path fill="none" stroke-width="9" d="M238 540C226 490 262 450 248 390"/>
<path fill="none" stroke-width="5" d="M90 520C70 500 60 480 40 470M90 520C100 490 90 470 100 440M410 470C440 460 470 440 500 420M410 470C420 440 440 420 450 395M248 390C230 370 220 350 200 340M248 390C270 365 290 355 310 350"/></g>
<g fill="#1a0608"><ellipse cx="70" cy="455" rx="72" ry="38"/><ellipse cx="465" cy="405" rx="82" ry="40"/><ellipse cx="250" cy="335" rx="92" ry="46"/><ellipse cx="150" cy="498" rx="60" ry="28"/><ellipse cx="350" cy="478" rx="60" ry="28"/></g>
<g fill="#ff4444" opacity=".6"><circle cx="40" cy="450" r="6"/><circle cx="100" cy="470" r="5"/><circle cx="440" cy="395" r="6"/><circle cx="500" cy="415" r="5"/><circle cx="215" cy="325" r="6"/><circle cx="290" cy="345" r="5"/><circle cx="150" cy="498" r="5"/><circle cx="360" cy="480" r="6"/><circle cx="260" cy="360" r="4"/></g>
<g transform="translate(1100 702) scale(1.15)" fill="#000" stroke="#000" stroke-linejoin="round"><path class="cape" stroke="none" d="M14-190Q74-186 104-140Q64-152 32-128Z"/>
<path stroke="none" d="M-44-212L0-250L44-212Q0-200-44-212Z"/><path stroke="none" d="M-15-198L15-198L28-168L34-118L56 0L-56 0L-34-118L-28-168Z"/>
<path stroke="none" d="M-27-112L-84-86L-82-80L-25-106Z"/><path stroke="none" d="M-34-120L-22-112L-25-106L-37-114Z"/><path fill="none" stroke-width="8" stroke-linecap="round" d="M-20-170Q-36-140-29-114"/></g></svg>`;
const greeting = () => { const h = new Date().getHours(); return h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };
const BRAND = '<div class="pbrand"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M2.5 5l7 3.2L12 18l2.5-9.8 7-3.2-4.2 9.2L12 20.5l-5.3-6.3z"/></svg><span>AnimeNeek</span></div><div class="ptag">Anime. Anytime. Anywhere.</div>';
function ensureScene(a) {
  if (!$('.scene', a)) {
    a.innerHTML = `<div class="scene">${LANDING_IMAGE ? `<div class="bg" style="background-image:url('${esc(LANDING_IMAGE)}')"></div>` : SCENE}</div><div class="aurora"><i></i><i></i><i></i></div><div class="grain"></div><div id="pkhost"></div>`;
    a.addEventListener('pointermove', e => { const sc = $('.scene', a); if (sc) sc.style.transform = `translate(${-(e.clientX / innerWidth - .5) * 18}px,${-(e.clientY / innerHeight - .5) * 12}px) scale(1.05)`; });
  }
  return $('#pkhost', a);
}
const GUEST = { id: 'guest', name: 'Guest', g: 7 };
// ---------- anime themes (curated; any other series falls back to its cover colour) ----------
const THEMES = [
  { n: 'Dragon Ball', q: 'Dragon Ball', k: ['dragon ball'], acc: '#ff8a1f', acc2: '#ffd23f', hf: 'impact', fx: 'power' },
  { n: 'Naruto', q: 'Naruto', k: ['naruto'], acc: '#ff7a2f', acc2: '#ffb98a', hf: 'rounded', fx: 'snap' },
  { n: 'One Piece', q: 'One Piece', k: ['one piece'], acc: '#e63946', acc2: '#ff9aa2', hf: 'serif', fx: 'snap' },
  { n: 'Demon Slayer', q: 'Demon Slayer', k: ['kimetsu', 'demon slayer'], acc: '#2fbf9b', acc2: '#8be3cc', hf: 'serif', fx: 'calm' },
  { n: 'Jujutsu Kaisen', q: 'Jujutsu Kaisen', k: ['jujutsu'], acc: '#8b6cff', acc2: '#c3b4ff', hf: 'sans', up: true, fx: 'sharp' },
  { n: 'Attack on Titan', q: 'Attack on Titan', k: ['shingeki', 'attack on titan'], acc: '#8fae5a', acc2: '#cddfa6', hf: 'serif', up: true, fx: 'sharp' },
  { n: 'My Hero Academia', q: 'My Hero Academia', k: ['boku no hero', 'my hero academia'], acc: '#1fb6ff', acc2: '#94dcff', hf: 'impact', fx: 'power' },
  { n: 'Bleach', q: 'Bleach', k: ['bleach'], acc: '#e9e9e9', acc2: '#ffffff', hf: 'sans', up: true, fx: 'sharp' },
  { n: 'Death Note', q: 'Death Note', k: ['death note'], acc: '#d11a2a', acc2: '#ff6b78', hf: 'serif', fx: 'calm' },
  { n: 'Fullmetal Alchemist', q: 'Fullmetal Alchemist Brotherhood', k: ['fullmetal'], acc: '#d4a017', acc2: '#f3d98b', hf: 'serif', fx: 'calm' },
  { n: 'Spy x Family', q: 'Spy x Family', k: ['spy x family', 'spy×family', 'spy family'], acc: '#ff6fa5', acc2: '#ffc4da', hf: 'rounded', fx: 'snap' },
  { n: 'Sword Art Online', q: 'Sword Art Online', k: ['sword art online'], acc: '#35c7f0', acc2: '#a8ecff', hf: 'mono', fx: 'sharp' },
  { n: 'Chainsaw Man', q: 'Chainsaw Man', k: ['chainsaw man'], acc: '#ff3b2f', acc2: '#ff9a8f', hf: 'impact', fx: 'power' },
  { n: 'Frieren', q: 'Frieren', k: ['frieren'], acc: '#9ad1ff', acc2: '#e0f2ff', hf: 'serif', fx: 'calm' },
  { n: 'Hunter x Hunter', q: 'Hunter x Hunter 2011', k: ['hunter x hunter', 'hunter×hunter'], acc: '#3ecf5f', acc2: '#a9f0b9', hf: 'sans', fx: 'snap' },
  { n: 'Evangelion', q: 'Neon Genesis Evangelion', k: ['evangelion'], acc: '#a35cff', acc2: '#d3b0ff', hf: 'mono', fx: 'sharp' }
];
const FONTS = {
  serif: '"Iowan Old Style","Palatino Linotype",Palatino,"Book Antiqua","Noto Serif",Georgia,serif',
  impact: 'Impact,"Arial Narrow Bold","Haettenschweiler","Arial Black",sans-serif',
  rounded: 'ui-rounded,"Trebuchet MS","Segoe UI Variable Display","Segoe UI",system-ui,sans-serif',
  mono: 'ui-monospace,"Cascadia Code",Consolas,"SF Mono",Menlo,monospace',
  sans: '"Segoe UI",system-ui,-apple-system,Roboto,sans-serif'
};
const FX = { base: { tm: 1, ease: 'ease', rc: '12px', rb: '999px' }, calm: { tm: 1.5, ease: 'cubic-bezier(.2,.7,.2,1)', rc: '14px', rb: '999px' }, snap: { tm: .75, ease: 'cubic-bezier(.2,1.3,.3,1)', rc: '16px', rb: '999px' }, power: { tm: .8, ease: 'cubic-bezier(.2,1.2,.3,1)', rc: '8px', rb: '8px' }, sharp: { tm: .85, ease: 'cubic-bezier(.4,0,.2,1)', rc: '3px', rb: '4px' } };
const DEF = { acc: '#ff4444', acc2: '#ff7a7a', hf: 'serif', fx: 'base' };
function applyTheme(t) {
  const d = { ...DEF, ...(t || {}) }, fx = FX[d.fx] || FX.base, r = document.documentElement;
  const v = (k, x) => r.style.setProperty(k, x);
  v('--red', d.acc); v('--red2', d.acc2); v('--hf', FONTS[d.hf] || FONTS.serif);
  v('--ht', d.hf === 'impact' || d.up ? 'uppercase' : 'none'); v('--hls', d.hf === 'impact' ? '.04em' : d.up ? '.08em' : '-.01em');
  v('--tm', fx.tm); v('--ease', fx.ease); v('--rc', fx.rc); v('--rb', fx.rb); r.dataset.fx = d.fx;
}
const hex2 = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const toHex = a => '#' + a.map(x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('');
const mixHex = (a, b, t) => { const x = hex2(a), y = hex2(b); return toHex(x.map((v, i) => v + (y[i] - v) * t)); };
const lum = h => { const [r, g, b] = hex2(h).map(x => x / 255); return .2126 * r + .7152 * g + .0722 * b; };
const readable = c => { let h = c; for (let i = 0; i < 6 && lum(h) < .32; i++) h = mixHex(h, '#ffffff', .18); return h; };
function themeFor(nodes) {
  const names = (nodes || []).map(n => `${n.title?.romaji || ''} ${n.title?.english || ''}`.toLowerCase()).join(' | ');
  const hit = THEMES.find(t => t.k.some(k => names.includes(k)));
  if (hit) return { key: hit.n, acc: hit.acc, acc2: hit.acc2, hf: hit.hf, up: hit.up, fx: hit.fx };
  const c = (nodes || []).map(n => n.coverImage?.color).find(x => /^#[0-9a-f]{6}$/i.test(x || ''));
  if (c) { const a = readable(c); return { key: 'auto', acc: a, acc2: mixHex(a, '#ffffff', .35), hf: 'serif', fx: 'base' }; }
  return { ...DEF };
}
const CH = 'id name{full} image{large} media(perPage:4,type:ANIME,sort:POPULARITY_DESC){nodes{isAdult title{romaji english} coverImage{color}}}';
async function loadChars({ q, anime }) {
  const ok = c => c.image?.large && !c.image.large.includes('default.jpg');
  if (anime) {
    const d = await gql('query($q:String){Page(perPage:1){media(search:$q,type:ANIME,sort:POPULARITY_DESC){isAdult title{romaji english} coverImage{color} characters(perPage:30,sort:FAVOURITES_DESC){nodes{id name{full} image{large}}}}}}', { q: anime });
    const m = d.Page.media[0]; return m ? m.characters.nodes.filter(ok).map(c => ({ ...c, media: { nodes: [m] } })) : [];
  }
  const d = await gql(q ? `query($q:String){Page(perPage:30){characters(search:$q,sort:FAVOURITES_DESC){${CH}}}}` : `{Page(perPage:30){characters(sort:FAVOURITES_DESC){${CH}}}}`, q ? { q } : undefined);
  return d.Page.characters.filter(c => ok(c) && !(c.media?.nodes || []).some(m => m.isAdult));
}
const avStyle = p => p.img ? `background:#111 url('${esc(p.img)}') center top/cover no-repeat` : `background:${GRADS[(p.g ?? 7) % 8]}`;
const avInner = p => p.img ? '' : p.id === 'guest' ? '<i class="fa-solid fa-user"></i>' : esc((p.name || '?')[0].toUpperCase());

let user = null, prof = null, syncDir = null, syncT;
const KEYS = ['history', 'favorites', 'seen'];
const key = k => `u:${user || 'guest'}:${k}`;
const store = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(key(k))) ?? d; } catch { return d; } },
  set: (k, v) => { localStorage.setItem(key(k), JSON.stringify(v)); localStorage.setItem(key('at'), String(Date.now())); schedSync(); }
};
const profiles = () => { try { return JSON.parse(localStorage.getItem('profiles')) || []; } catch { return []; } };
const saveProfiles = l => { localStorage.setItem('profiles', JSON.stringify(l)); if (syncDir) window.api.syncWrite('profiles', l).catch(() => {}); };
const canSync = () => syncDir && user && user !== 'guest';
function flush() { if (!canSync()) return Promise.resolve(); const d = { at: +localStorage.getItem(key('at')) || Date.now() }; KEYS.forEach(k => (d[k] = store.get(k, null))); return window.api.syncWrite('p-' + user, d).catch(() => {}); }
function schedSync() { if (!canSync()) return; clearTimeout(syncT); syncT = setTimeout(flush, 1500); }
window.addEventListener('beforeunload', () => { if (syncT) flush(); });
async function pull(id) {
  if (!syncDir || id === 'guest') return;
  try {
    const d = await window.api.syncRead('p-' + id), local = +localStorage.getItem(`u:${id}:at`) || 0;
    if (d && d.at > local) { KEYS.forEach(k => { if (d[k] != null) localStorage.setItem(`u:${id}:${k}`, JSON.stringify(d[k])); }); localStorage.setItem(`u:${id}:at`, String(d.at)); }
    else if (!d) schedSync();
  } catch { /* offline: keep local copy */ }
}
function who() {
  const p = prof || GUEST;
  $('#who').innerHTML = `<span class="av" style="${avStyle(p)}" title="Switch profile">${avInner(p)}</span><span class="wn">${esc(p.name)}</span><button class="ghost sm" id="out"><i class="fa-solid fa-repeat"></i> Switch</button>`;
  $('#out').onclick = () => showProfiles(); $('#who .av').onclick = () => showProfiles();
}
function ask(title, text, ok) {
  return new Promise(res => {
    const m = $('#modal'); m.classList.remove('hidden');
    m.innerHTML = `<div class="box glass"><h1 class="serif">${esc(title)}</h1><p>${esc(text)}</p><button class="cream" id="mok" style="justify-content:center">${esc(ok)}</button><button class="ghost" id="mno" style="justify-content:center">Cancel</button></div>`;
    const done = v => { m.classList.add('hidden'); res(v); };
    $('#mok').onclick = () => done(true); $('#mno').onclick = () => done(false); m.onclick = e => { if (e.target === m) done(false); };
  });
}
function newProfile(existing = null) {
  let sel = existing ? { img: existing.img || '', theme: existing.theme || { ...DEF }, g: existing.g ?? 7 } : null;
  let rt = 0, t;
  ensureScene($('#auth')).innerHTML = `${BRAND}<div class="pk"><div class="greet"><i></i>${existing ? 'Edit profile' : 'Create a profile'}</div><h1 class="serif pk-t" style="margin-bottom:22px">${existing ? 'Change your character' : 'Pick your character'}</h1>
    <div class="newp wide"><div class="npav"><div class="pav" id="npav" style="${avStyle(sel || { g: 7 })}">${sel?.img ? '' : '<i class="fa-solid fa-user"></i>'}</div></div>
    <input id="pn" type="text" maxlength="16" placeholder="Your name" autocomplete="off" spellcheck="false" value="${esc(existing?.name || '')}">
    <div class="achips">${THEMES.map(x => `<span class="chip" data-a="${esc(x.q)}">${esc(x.n)}</span>`).join('')}</div>
    <div class="csrch"><i class="fa-solid fa-magnifying-glass"></i><input id="cq" type="text" placeholder="Search any character, e.g. Goku" autocomplete="off" spellcheck="false"></div>
    <div class="cgrid" id="cg"></div>
    <div class="profile-edit-actions">${existing ? '<button class="ghost sm" id="pclear"><i class="fa-solid fa-image-slash"></i> Remove picture</button>' : ''}</div>
    <div class="err" id="pe"></div>
    <div class="nb"><button class="cream" id="pc">${existing ? 'Save changes' : 'Create'}</button><button class="ghost" id="px">Cancel</button></div></div></div>`;
  const grid = $('#cg');
  const paintAvatar = () => {
    const av = $('#npav');
    if (!av) return;
    av.style.cssText = avStyle(sel || { g: 7 });
    av.innerHTML = sel?.img ? '' : '<i class="fa-solid fa-user"></i>';
    if (sel?.theme) applyTheme(sel.theme);
  };
  const choose = (c, el) => {
    sel = { img: c.image.large, theme: themeFor(c.media?.nodes), g: existing?.g ?? 7 };
    $$('.cc', grid).forEach(x => x.classList.toggle('on', x === el));
    paintAvatar();
  };
  const show = async p => {
    const my = ++rt; grid.innerHTML = '<div class="msg" style="padding:30px">Loading…</div>';
    try {
      const l = await p; if (my !== rt) return;
      grid.innerHTML = l.length ? l.map((c, i) => `<div class="cc" data-i="${i}" title="${esc(c.name.full)}"><img loading="lazy" src="${esc(c.image.large)}"><span>${esc(c.name.full)}</span></div>`).join('') : '<div class="msg" style="padding:30px">No characters found.</div>';
      $$('.cc', grid).forEach(el => el.onclick = () => choose(l[+el.dataset.i], el));
    } catch {
      if (my === rt) grid.innerHTML = '<div class="msg" style="padding:30px">Could not load characters right now. You can still save the profile without changing its picture.</div>';
    }
  };
  show(loadChars({}));
  $$('.achips .chip').forEach(c => c.onclick = () => {
    $$('.achips .chip').forEach(x => x.classList.toggle('on', x === c));
    $('#cq').value = ''; show(loadChars({ anime: c.dataset.a }));
  });
  $('#cq').oninput = e => {
    clearTimeout(t); const v = e.target.value.trim();
    t = setTimeout(() => { $$('.achips .chip').forEach(x => x.classList.remove('on')); if (v) show(loadChars({ q: v })); }, 400);
  };
  $('#pclear')?.addEventListener('click', () => { sel = { img: '', theme: existing?.theme || { ...DEF }, g: existing?.g ?? 7 }; $$('.cc', grid).forEach(x => x.classList.remove('on')); paintAvatar(); });
  $('#px').onclick = () => showProfiles(!!existing);
  const save = () => {
    const n = $('#pn').value.trim(), l = profiles();
    if (!n) return ($('#pe').textContent = 'Please type a name.');
    if (n.toLowerCase() === 'guest' || l.some(p => p.id !== existing?.id && p.name.toLowerCase() === n.toLowerCase())) return ($('#pe').textContent = 'That name is already used.');
    if (existing) {
      const updated = l.map(p => p.id === existing.id ? { ...p, name: n, img: sel?.img ?? p.img ?? '', theme: sel?.theme || p.theme || { ...DEF }, g: sel?.g ?? p.g } : p);
      saveProfiles(updated);
    } else {
      l.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: n, img: sel?.img || '', theme: sel?.theme || { ...DEF }, g: Math.floor(Math.random() * 8) });
      saveProfiles(l);
    }
    showProfiles(!!existing);
  };
  $('#pc').onclick = save;
  $('#pn').onkeydown = e => { if (e.key === 'Enter') save(); };
  setTimeout(() => $('#pn')?.focus(), 80);
}
async function pick(p, el) {
  const a = $('#auth'); a.classList.add('leaving'); el.classList.add('chosen');
  user = p.id; prof = p.id === 'guest' ? null : p; localStorage.setItem('last', p.id);

  // Load cloud data in the background instead of blocking profile entry.
  pull(p.id).catch(() => {});

  await new Promise(r => setTimeout(r, 320));
  applyTheme(p.theme); who(); a.classList.add('hidden'); go('home');
}
async function showProfiles(edit = false, skipCloudSync = false) {
  applyTheme(); const a = $('#auth'); a.classList.remove('hidden', 'leaving');
  if (syncDir && !skipCloudSync) {
    window.api.syncRead('profiles').then(r => {
      if (!Array.isArray(r)) return;
      const l = profiles(), m = [...l];
      r.forEach(x => {
        if (x && x.id && !m.some(y => y.id === x.id)) m.push(x);
      });
      if (m.length !== l.length) {
        localStorage.setItem('profiles', JSON.stringify(m));
        if (!a.classList.contains('hidden') && a.querySelector('.ptiles')) {
          showProfiles(edit, true);
        }
      }
    }).catch(() => {});
  }
  const list = [...profiles(), GUEST];
  ensureScene(a).innerHTML = `${BRAND}<div class="pk"><div class="greet"><i></i>${greeting()}</div><h1 class="serif pk-t">Who's watching?</h1>
    <div class="ptiles ${edit ? 'edit' : ''}">${list.map((p, i) => `<div class="pt" style="--i:${i}" data-id="${esc(p.id)}"><div class="pav" style="${avStyle(p)}">${avInner(p)}${edit && p.id !== 'guest' ? `<button class="pedit" data-edit="${esc(p.id)}" title="Edit profile"><i class="fa-solid fa-pen"></i></button><button class="pdel" data-del="${esc(p.id)}" title="Delete profile"><i class="fa-solid fa-xmark"></i></button>` : ''}</div><span>${esc(p.name)}</span></div>`).join('')}${list.length < 8 ? `<div class="pt add" style="--i:${list.length}"><div class="pav"><i class="fa-solid fa-plus"></i></div><span>Add profile</span></div>` : ''}</div>
    ${edit ? '<div class="profile-manage-note">Select a profile to change its name or character picture. Use × to delete.</div>' : ''}
    <div class="pkb"><button class="ghost sm" id="mng">${edit ? '<i class="fa-solid fa-check"></i> Done' : '<i class="fa-solid fa-pen"></i> Manage profiles'}</button></div>
    <div class="syncbar">${syncDir ? `<div><i class="fa-solid fa-cloud"></i> Backing up to <code>${esc(syncDir)}</code></div><div><button class="ghost sm" id="sc">Change folder</button> <button class="ghost sm" id="sx">Stop</button></div>` : '<button class="ghost sm" id="sp"><i class="fa-solid fa-cloud"></i> Back up to my cloud folder</button><div>Pick a folder inside Google Drive, OneDrive or Dropbox. Your list and history are saved there, in your own storage.</div>'}</div></div>`;
  $$('.pt', a).forEach(el => el.onclick = async e => {
    if (e.target.closest('.pdel,.pedit')) return;
    if (el.classList.contains('add')) return newProfile();
    const selectedProfile = list.find(p => p.id === el.dataset.id);
    if (edit) { if (selectedProfile && selectedProfile.id !== 'guest') return newProfile(selectedProfile); return; }
    pick(selectedProfile, el);
  });
  $$('.pedit', a).forEach(b => b.onclick = e => {
    e.stopPropagation();
    const selectedProfile = list.find(p => p.id === b.dataset.edit);
    if (selectedProfile) newProfile(selectedProfile);
  });
  $$('.pdel', a).forEach(b => b.onclick = async e => {
    e.stopPropagation(); const id = b.dataset.del;
    if (!await ask('Delete profile?', 'Its list, history and watched marks on this device will be removed.', 'Delete')) return;
    saveProfiles(profiles().filter(p => p.id !== id)); Object.keys(localStorage).filter(k => k.startsWith(`u:${id}:`)).forEach(k => localStorage.removeItem(k)); showProfiles(true);
  });
  $('#mng').onclick = () => showProfiles(!edit);
  const chooseDir = async () => { try { syncDir = await window.api.syncPick(); if (syncDir) saveProfiles(profiles()); } catch { /* ignore */ } showProfiles(edit); };
  $('#sp')?.addEventListener('click', chooseDir); $('#sc')?.addEventListener('click', chooseDir);
  $('#sx')?.addEventListener('click', async () => { try { syncDir = await window.api.syncClear(); } catch { /* ignore */ } showProfiles(edit); });
}

// ---------- data ----------
const gql = (q, v) => window.api.anilist(q, v);
const C = 'id idMal type isAdult title{romaji english} coverImage{large} format episodes seasonYear averageScore';
const F = 'id idMal isAdult title{romaji english} coverImage{large} bannerImage description(asHtml:false) genres episodes status format season seasonYear averageScore trailer{id site} externalLinks{site url}';
async function page(v) {
  const d = await gql(`query($page:Int,$perPage:Int,$search:String,$genre_in:[String],$format:MediaFormat,$year:Int,$season:MediaSeason,$status:MediaStatus,$sort:[MediaSort],$score:Int,$adult:Boolean){Page(page:$page,perPage:$perPage){pageInfo{hasNextPage}media(type:ANIME,search:$search,genre_in:$genre_in,format:$format,seasonYear:$year,season:$season,status:$status,sort:$sort,averageScore_greater:$score,isAdult:$adult){${F}}}}`, { page: 1, perPage: 24, adult: false, ...v });
  return d.Page;
}
const getMedia = async id => (await gql(`query($id:Int){Media(id:$id,type:ANIME){${F} duration studios(isMain:true){nodes{name}} nextAiringEpisode{episode airingAt} relations{edges{relationType(version:2) node{${C}}}} recommendations(sort:RATING_DESC,perPage:12){nodes{mediaRecommendation{${C}}}}}}`, { id })).Media;
const mini = m => ({ isAdult: m.isAdult, id: m.id, idMal: m.idMal, title: m.title, coverImage: m.coverImage, bannerImage: m.bannerImage, format: m.format, episodes: m.episodes, seasonYear: m.seasonYear, averageScore: m.averageScore });
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('timeout')), ms))]);
const jk = path => withTimeout(window.api.jikan(path), 20000);

// ---------- episodes ----------
const epCache = {};
const aired = m => m.status === 'NOT_YET_RELEASED' ? 0 : m.nextAiringEpisode ? m.nextAiringEpisode.episode - 1 : Infinity;
const totalEps = m => m.episodes || (m.nextAiringEpisode ? m.nextAiringEpisode.episode : 0) || 12;
const fill = (m, list) => { const by = new Map(list.map(e => [e.mal_id, e])), n = Math.max(totalEps(m), ...list.map(e => e.mal_id), 0); return Array.from({ length: n }, (_, i) => by.get(i + 1) || { mal_id: i + 1, title: '' }); };
const baseEps = m => fill(m, []);
async function enrich(m) { // titles from Jikan; the page never waits for this
  if (epCache[m.id]) return epCache[m.id];
  if (!m.idMal) return null;
  let eps = [], p = 1, more = true;
  try { while (more && p <= 15) { const r = await jk(`/anime/${m.idMal}/episodes?page=${p++}`); eps = eps.concat(r.data || []); more = r.pagination?.has_next_page; } } catch { if (!eps.length) return null; }
  if (!eps.length) return null;
  return (epCache[m.id] = { eps: fill(m, eps) });
}
const lockLabel = (n, m) => { const x = m.nextAiringEpisode; return x && n === x.episode ? 'Airs ' + new Date(x.airingAt * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Coming soon'; };
const epRow = (e, m, cur, seen) => { const n = e.mal_id, lock = n > aired(m);
  return `<div class="ep ${n === cur ? 'cur' : ''} ${!lock && n !== cur && seen.has(n) ? 'seen' : ''} ${lock ? 'locked' : ''}" data-ep="${n}"><b>${String(n).padStart(2, '0')}</b><span>${esc(e.title || 'Episode ' + n)}</span>${lock ? `<em>${esc(lockLabel(n, m))}</em>` : n === cur ? '<em>playing</em>' : seen.has(n) ? '<i class="stamp" title="Watched">済</i>' : e.filler ? '<em>filler</em>' : ''}</div>`; };
function epPanel(box, eps, m, cur, pick) {
  const per = 25; let range = cur ? Math.floor((cur - 1) / per) : 0, q = '', hide = false;
  box.innerHTML = '<div class="epctl"><input class="epq" placeholder="Find episode…"><span class="chip epw"><i class="fa-regular fa-eye-slash"></i> Hide watched</span></div><div class="ranges"></div><div class="eplist"></div>';
  const list = $('.eplist', box), rg = $('.ranges', box);
  const draw = () => {
    const seen = new Set(store.get('seen', {})[m.id] || []), s = q.toLowerCase(); let l = eps;
    if (hide) l = l.filter(e => !seen.has(e.mal_id));
    if (s) l = l.filter(e => String(e.mal_id).startsWith(s) || (e.title || '').toLowerCase().includes(s));
    else if (eps.length > per) l = l.filter(e => Math.floor((e.mal_id - 1) / per) === range);
    rg.innerHTML = !s && eps.length > per ? Array.from({ length: Math.ceil(eps.length / per) }, (_, i) => `<span class="chip ${i === range ? 'on' : ''}" data-r="${i}">${i * per + 1}–${Math.min((i + 1) * per, eps.length)}</span>`).join('') : '';
    $$('.chip', rg).forEach(c => c.onclick = () => { range = +c.dataset.r; draw(); });
    list.innerHTML = l.map(e => epRow(e, m, cur, seen)).join('') || '<div class="msg">No episodes match.</div>';
    $$('.ep:not(.locked)', list).forEach(el => el.onclick = () => pick(+el.dataset.ep));
  };
  $('.epq', box).oninput = e => { q = e.target.value.trim(); draw(); };
  $('.epw', box).onclick = e => { hide = !hide; e.target.classList.toggle('on', hide); draw(); };
  draw();
}

// ---------- ui helpers ----------
const card = (m, i = 0, rm = false) => `<div class="card" style="--i:${Math.min(i, 24)}" data-id="${m.id}"><div class="pic"><img loading="lazy" src="${esc(m.coverImage.large)}">${m.isAdult ? RIBBON : ''}${m._b ? `<span class="badge">${esc(m._b)}</span>` : ''}${rm ? `<button class="x" data-rm="${m.id}" title="Remove"><i class="fa-solid fa-xmark"></i></button>` : ''}</div><div class="t">${esc(name(m))}</div><div class="s">${esc(meta(m))}</div></div>`;
const lcard = (m, i = 0, o = {}) => `<div class="lcard" style="--i:${Math.min(i, 24)}" data-id="${m.id}"${o.resume ? ` data-resume="${o.resume}"` : ''}><div class="lpic"><img loading="lazy" src="${esc(m.bannerImage || m.coverImage.large)}">${m.isAdult ? RIBBON : ''}${o.badge ? `<span class="badge">${esc(o.badge)}</span>` : ''}${o.rm ? `<button class="x" data-rm="${m.id}" title="Remove"><i class="fa-solid fa-xmark"></i></button>` : ''}</div><div class="t">${esc(name(m))}</div><div class="s">${esc(meta(m))}</div></div>`;
const grid = l => `<div class="grid">${l.map((m, i) => card(m, i)).join('')}</div>`;
const sec = (k, title, body, i, g = '') => `<section class="sec ${i % 2 ? 'b' : 'a'}" data-k="${esc(k)}"><div class="wrap"><h2><small>${esc(k)}</small>${esc(title)}${g ? `<a class="all" data-g="${esc(g)}">See all <i class="fa-solid fa-arrow-right"></i></a>` : ''}</h2>${body}</div></section>`;
const row = html => `<div class="rowwrap"><button class="rb l" aria-label="Previous"><i class="fa-solid fa-chevron-left"></i></button><div class="row">${html}</div><button class="rb r" aria-label="Next"><i class="fa-solid fa-chevron-right"></i></button></div>`;
const bindCards = r => $$('.card,.lcard', r || view).forEach(c => c.onclick = () => go('anime', +c.dataset.id));
const bindRows = () => $$('.rowwrap').forEach(w => { const r = $('.row', w); $('.rb.l', w).onclick = () => r.scrollBy({ left: -r.clientWidth * .8, behavior: 'smooth' }); $('.rb.r', w).onclick = () => r.scrollBy({ left: r.clientWidth * .8, behavior: 'smooth' }); });
const tabsHtml = t => `<div class="tabs">${t.map((x, i) => `<a data-tab="${x[0]}" class="${i ? '' : 'on'}">${x[1]}</a>`).join('')}</div>`;
const bindTabs = () => $$('.tabs a').forEach(a => a.onclick = () => { $$('.tabs a').forEach(x => x.classList.toggle('on', x === a)); $$('.pane').forEach(p => p.classList.toggle('on', p.id === 'pane-' + a.dataset.tab)); });
const loader = '<div class="loader"><i></i><i></i><i></i></div>';
const REL = { PREQUEL: 'Prequel', SEQUEL: 'Sequel', PARENT: 'Parent story', SIDE_STORY: 'Side story', SPIN_OFF: 'Spin-off', ALTERNATIVE: 'Alternative', SUMMARY: 'Summary' };
const relOrder = Object.keys(REL);
const relParts = m => ({
  rel: (m.relations?.edges || []).filter(e => e.node.type === 'ANIME' && REL[e.relationType]).sort((a, b) => relOrder.indexOf(a.relationType) - relOrder.indexOf(b.relationType)).map(e => ({ ...e.node, _b: REL[e.relationType] })),
  rec: (m.recommendations?.nodes || []).map(n => n.mediaRecommendation).filter(Boolean)
});
const extraTabs = r => [...(r.rel.length ? [['rel', 'Related']] : []), ...(r.rec.length ? [['rec', 'Similar']] : [])];
const extraPanes = r => (r.rel.length ? `<div class="pane" id="pane-rel">${grid(r.rel)}</div>` : '') + (r.rec.length ? `<div class="pane" id="pane-rec">${grid(r.rec)}</div>` : '');
const toggleFav = m => { let f = store.get('favorites', []); const on = f.some(x => x.id === m.id); f = on ? f.filter(x => x.id !== m.id) : [mini(m), ...f]; store.set('favorites', f); return !on; };
const favLabel = on => on ? '<i class="fa-solid fa-check"></i> In My List' : '<i class="fa-solid fa-plus"></i> My List';
const isFav = id => store.get('favorites', []).some(x => x.id === id);

function bindRemove() {
  $$('[data-rm]').forEach(b => b.onclick = e => {
    e.stopPropagation(); const id = +b.dataset.rm, c = b.closest('.card,.lcard');
    store.set('history', store.get('history', []).filter(x => x.id !== id));
    c.style.transition = '.3s'; c.style.opacity = 0; c.style.transform = 'scale(.92)';
    setTimeout(() => { c.remove(); if ((cur[0] === 'home' && !$('[data-resume]')) || (cur[0] === 'history' && !$('.card'))) go(cur[0]); }, 300);
  });
}

let homeN = 0;
const FULL = new Set(['home', 'anime']);
let cur = ['home'], tok = 0, timers = [], curM = null;

// Mini-player state
let floatingPlayer = null;
let floatingPlayerInfo = null;

// Move the existing video into the floating player
function movePlayerToMini() {
  const frame = view.querySelector('.frame iframe');
  if (!frame) return;

  floatingPlayer = frame;
  floatingPlayerInfo = cur[1];

  const mini = document.getElementById('mini-player');
  const video = document.getElementById('mini-player-video');
  const title = document.getElementById('mini-player-title');

  title.textContent = `AnimeNeek · Episode ${floatingPlayerInfo.ep}`;
  video.appendChild(frame);
  mini.hidden = false;
}

// Restore the existing video to the full player
function restorePlayerFromMini() {
  if (!floatingPlayer) return;

  const frame = view.querySelector('.frame');
  if (!frame) return;

  frame.innerHTML = '';
  frame.appendChild(floatingPlayer);

  floatingPlayer = null;
  floatingPlayerInfo = null;
  document.getElementById('mini-player').hidden = true;
}

// Main navigation
async function go(route, arg) {
  // Keep playback alive when leaving the player page
  if (cur[0] === 'player' && route !== 'player') {
    movePlayerToMini();
  }

  cur = [route, arg];
  const my = ++tok;
  timers.forEach(clearInterval);
  timers = [];

  document.body.dataset.page = route;
  $('.srch').classList.remove('open');
  $$('nav a').forEach(a => a.classList.toggle('on', a.dataset.go === route));

  view.classList.remove('in');
  view.innerHTML = loader;

  try {
    const html = await routes[route](arg);
    if (my !== tok) return;

    view.innerHTML = FULL.has(route) ? html : `<div class="wrap">${html}</div>`;
    void view.offsetWidth;
    view.classList.add('in');

    if (route === 'player' && floatingPlayer) {
  const sameEpisode =
    floatingPlayerInfo &&
    Number(floatingPlayerInfo.id) === Number(arg.id) &&
    Number(floatingPlayerInfo.ep) === Number(arg.ep) &&
    floatingPlayerInfo.audio === arg.audio;

  if (sameEpisode) {
    restorePlayerFromMini();
  } else {
    floatingPlayer.remove();
    floatingPlayer = null;
    floatingPlayerInfo = null;
    miniVideo.innerHTML = '';
    miniPlayer.hidden = true;
  }
}

    after[route]?.(arg, my);

    document.scrollingElement.scrollTop = 0;
  } catch (e) {
    if (my === tok) {
      view.innerHTML = `<div class="msg">Something went wrong: ${esc(e.message)}<br><br><button class="ghost" id="retry">Try again</button></div>`;
      view.classList.add('in');
      $('#retry').onclick = () => go(...cur);
    }
  }
}


// Mini-player controls
const miniPlayer = document.getElementById('mini-player');
const miniVideo = document.getElementById('mini-player-video');
const miniHeader = document.querySelector('.mini-player-header');

document.getElementById('mini-close').onclick = () => {
  if (floatingPlayer) {
    floatingPlayer.remove();
    floatingPlayer = null;
    floatingPlayerInfo = null;
  }

  miniVideo.innerHTML = '';
  miniPlayer.hidden = true;
};

document.getElementById('mini-expand').onclick = () => {
  if (floatingPlayerInfo) {
    go('player', floatingPlayerInfo);
  }
};

// Allow the mini-player to be dragged
let dragOffsetX = 0;
let dragOffsetY = 0;

miniHeader.addEventListener('pointerdown', event => {
  if (event.target.closest('button')) return;

  const rect = miniPlayer.getBoundingClientRect();

  dragOffsetX = event.clientX - rect.left;
  dragOffsetY = event.clientY - rect.top;

  miniPlayer.style.left = `${rect.left}px`;
  miniPlayer.style.top = `${rect.top}px`;
  miniPlayer.style.right = 'auto';
  miniPlayer.style.bottom = 'auto';

  miniHeader.setPointerCapture(event.pointerId);
});

miniHeader.addEventListener('pointermove', event => {
  if (!miniHeader.hasPointerCapture(event.pointerId)) return;

  const x = Math.max(0, Math.min(
    window.innerWidth - miniPlayer.offsetWidth,
    event.clientX - dragOffsetX
  ));

  const y = Math.max(0, Math.min(
    window.innerHeight - miniPlayer.offsetHeight,
    event.clientY - dragOffsetY
  ));

  miniPlayer.style.left = `${x}px`;
  miniPlayer.style.top = `${y}px`;
});

miniHeader.addEventListener('pointerup', event => {
  if (miniHeader.hasPointerCapture(event.pointerId)) {
    miniHeader.releasePointerCapture(event.pointerId);
  }
});

// ---------- browse filters ----------
const defF = () => ({ q: '', genres: [], format: '', year: '', season: '', status: '', sort: 'POPULARITY_DESC', score: 0 });
let filters = defF(), bpage = 1, rtok = 0;
const opts = (list, sel) => list.map(([v, l]) => `<option value="${v}" ${v === sel ? 'selected' : ''}>${l}</option>`).join('');
async function runSearch(reset = true) {
  const my = ++rtok, res = $('#res'); if (!res) return; if (reset) { bpage = 1; res.innerHTML = loader; }
  try {
    const f = filters, adult = f.genres.includes('Hentai'), others = f.genres.filter(g => g !== 'Hentai'), sort = f.sort === 'SEARCH_MATCH' && !f.q ? 'POPULARITY_DESC' : f.sort;
    const r = await page({ page: bpage, search: f.q || undefined, genre_in: adult ? (others.length ? others : ['Hentai']) : (f.genres.length ? f.genres : undefined), format: f.format || undefined, year: f.year ? +f.year : undefined, season: f.season || undefined, status: f.status || undefined, score: f.score || undefined, sort: [sort], adult });
    if (my !== rtok) return;
    const html = r.media.map((m, i) => card(m, i)).join('');
    if (reset) res.innerHTML = r.media.length ? `<div class="grid">${html}</div>` : '<div class="msg">No anime match these filters. Try removing one.</div>'; else $('.grid', res).insertAdjacentHTML('beforeend', html);
    bindCards(res); $('#more').innerHTML = r.pageInfo.hasNextPage ? '<br><button class="ghost" id="lm">Load more</button>' : '';
    $('#lm')?.addEventListener('click', () => { bpage++; runSearch(false); });
  } catch (e) { if (my === rtok) res.innerHTML = `<div class="msg">${esc(e.message)}</div>`; }
}

// ---------- routes ----------
const routes = {
  async home() {
    const [t, p, s] = await Promise.all([page({ sort: ['TRENDING_DESC'] }), page({ sort: ['POPULARITY_DESC'] }), page({ sort: ['SCORE_DESC'], status: 'FINISHED' })]);
    const heroes = t.media.filter(m => m.bannerImage).slice(0, 6), cont = store.get('history', []).slice(0, 12);
    let n = 0;
    const out = `<section class="hero">${heroes.map((m, i) => `<div class="slide ${i ? '' : 'on'}" style="background-image:linear-gradient(90deg,#000 4%,#000000c8 36%,#00000000 74%),linear-gradient(0deg,#000 1%,#00000000 38%),url('${esc(m.bannerImage)}')"><div class="hc"><div class="eyebrow"><i></i>Featured</div><h1 class="serif">${esc(name(m))}</h1><div class="meta">${esc(m.format || '')} · ${m.seasonYear || ''} · ${esc(m.genres.slice(0, 3).join(', '))}</div><p>${esc(strip(m.description))}</p><div class="btns"><button class="cream" data-watch="${m.id}">${PLAY} Watch Now</button><button class="ghost" data-id="${m.id}">Details</button></div></div></div>`).join('')}<div class="vtext">また、見ようね。</div><div class="scroll"><i></i>Scroll</div><div class="dots">${heroes.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div></section>${cont.length ? sec('続き', 'Continue Watching', row(cont.map((h, i) => lcard(h, i, { rm: true, resume: h.ep + '|' + h.audio, badge: 'EP ' + h.ep })).join('')), n++) : ''}${sec('話題', 'Trending Now', row(t.media.map((m, i) => lcard(m, i)).join('')), n++)}${sec('人気', 'Most Popular', row(p.media.map((m, i) => lcard(m, i)).join('')), n++)}${sec('名作', 'All-Time Top Rated', row(s.media.map((m, i) => lcard(m, i)).join('')), n++)}`;
    homeN = n; return out + '<div id="more-secs"></div>';
  },
  async browse() {
    const g = (await gql('{GenreCollection}')).GenreCollection, f = filters, yr = new Date().getFullYear();
    const years = [['', 'Any year'], ...Array.from({ length: yr + 1 - 1980 }, (_, i) => [String(yr + 1 - i), String(yr + 1 - i)])];
    return `<h1 class="ptitle serif">Anime</h1><p class="sub">Explore, discover, and lose yourself in extraordinary worlds.</p>
      <div class="gbar"><span class="chip ${f.genres.length ? '' : 'on'}" data-g="">All</span>${g.map(x => `<span class="chip ${f.genres.includes(x) ? 'on' : ''}" data-g="${esc(x)}">${esc(x)}</span>`).join('')}</div>
      <div class="frow"><input id="fq" placeholder="Search by title…" value="${esc(f.q)}" style="flex:1;min-width:200px">
      <label>Format<select id="ff">${opts([['', 'Any'], ['TV', 'TV'], ['MOVIE', 'Movie'], ['OVA', 'OVA'], ['ONA', 'ONA'], ['SPECIAL', 'Special']], f.format)}</select></label>
      <label>Year<select id="fy">${opts(years, f.year)}</select></label>
      <label>Season<select id="fs">${opts([['', 'Any'], ['WINTER', 'Winter'], ['SPRING', 'Spring'], ['SUMMER', 'Summer'], ['FALL', 'Fall']], f.season)}</select></label>
      <label>Status<select id="fst">${opts([['', 'Any'], ['RELEASING', 'Airing'], ['FINISHED', 'Finished'], ['NOT_YET_RELEASED', 'Upcoming']], f.status)}</select></label>
      <label>Sort<select id="fo">${opts([['POPULARITY_DESC', 'Popular'], ['TRENDING_DESC', 'Trending'], ['SCORE_DESC', 'Top rated'], ['START_DATE_DESC', 'Newest'], ['FAVOURITES_DESC', 'Most favorited'], ['SEARCH_MATCH', 'Best match']], f.sort)}</select></label>
      <label>Min score: <span id="sv">${f.score || 'any'}</span><input id="fsc" type="range" min="0" max="90" step="5" value="${f.score}"></label>
      <button class="ghost sm" id="rs">Reset</button></div>
      <div id="res"></div><div id="more" style="text-align:center"></div>`;
  },
  async favorites() {
    const f = store.get('favorites', []);
    return `<h1 class="ptitle serif">My List</h1><p class="sub">Everything you saved, in one place.</p>${f.length ? `<div class="list">${f.map((m, i) => `<div class="li" data-id="${m.id}"><img src="${esc(m.coverImage.large)}"><div class="lt"><b>${esc(name(m))}</b><span>${esc(meta(m))}${m.isAdult ? ' · 18+' : ''}</span></div><button class="ck" data-fav="${m.id}" title="Remove from My List"><i class="fa-solid fa-check"></i></button></div>`).join('')}</div>` : '<div class="msg">Your list is empty. Open an anime and press + My List.</div>'}`;
  },
  async history() {
    const h = store.get('history', []);
    return `<h1 class="ptitle serif">History</h1><p class="sub">Pick up where you left off.</p>${h.length ? `<div class="grid">${h.map((x, i) => card({ ...x, _b: 'EP ' + x.ep }, i, true)).join('')}</div><br><button class="ghost" id="clear">Clear all history</button>` : '<div class="msg">No history yet.</div>'}`;
  },
    async settings() {
  return `
    <div class="settings-page">
      <h1 class="ptitle serif">Settings</h1>
      <p class="sub">Make AnimeNeek yours.</p>

      <section class="glass settings-card">
        <div class="settings-heading">
          <h2>Application</h2>
          <span class="meta">APP & UPDATES</span>
        </div>

        <div class="settings-row">
          <div>
            <b>Installed Version</b>
            <p class="meta">Your current AnimeNeek version</p>
          </div>
          <span class="settings-value" id="app-version">Loading...</span>
        </div>

        <div class="settings-actions">
          <button class="ghost" id="check-updates">Check for Updates</button>
          <button class="cream" id="install-update" hidden>Restart to Install</button>
        </div>

        <p class="meta settings-status" id="update-status">Automatic updates enabled.</p>
      </section>

      <section class="glass settings-card">
        <div class="settings-heading">
          <h2>Playback</h2>
          <span class="meta">WATCH PREFERENCES</span>
        </div>

        <label class="settings-toggle">
          <span>
            <b>Automatically play next episode</b>
            <small class="meta">Continue to the next episode automatically</small>
          </span>
          <input type="checkbox" id="autoplay-next" checked>
        </label>

        <label class="settings-toggle">
          <span>
            <b>Remember playback position</b>
            <small class="meta">Resume where you left off when supported</small>
          </span>
          <input type="checkbox" id="resume-playback" checked>
        </label>
      </section>

      <section class="glass settings-card">
        <div class="settings-heading">
          <h2>About AnimeNeek</h2>
          <span class="meta">ABOUT</span>
        </div>
        <p class="meta">Anime. Anytime. Anywhere.</p>
        <p class="meta">AnimeNeek — Your anime experience.</p>
      </section>
    </div>
  `;
},
  async anime(id) {
    const m = curM = await getMedia(id), last = store.get('history', []).find(h => h.id === id), soon = m.status === 'NOT_YET_RELEASED', rp = relParts(m), st = m.studios?.nodes?.map(s => s.name).join(', ');
    return `<section class="dhero" style="background-image:linear-gradient(90deg,#000 6%,#000000c8 42%,#00000040),linear-gradient(0deg,#000 2%,#00000000 45%),url('${esc(m.bannerImage || m.coverImage.large)}')">${m.isAdult ? RIBBON : ''}<div class="hc"><div class="eyebrow"><i></i>${m.format === 'MOVIE' ? 'Movie' : 'Series'}${m.isAdult ? ' · 18+' : ''}</div><h1 class="serif">${esc(name(m))}</h1>
      <div class="meta"><span>${m.averageScore ? (m.averageScore / 10).toFixed(1) + ' · ' : ''}</span>${m.seasonYear || '?'} · ${m.episodes ?? '?'} eps${m.duration ? ' · ' + m.duration + ' min' : ''} · ${esc(m.status || '')}${st ? '<br>' + esc(st) : ''}</div>
      <p>${esc(strip(m.description))}</p><div class="btns"><button class="cream" id="play" ${soon ? 'disabled' : ''}>${PLAY} ${soon ? 'Coming soon' : last ? 'Resume episode ' + last.ep : 'Watch Now'}</button><button class="ghost" id="fav">${favLabel(isFav(id))}</button></div>
      <div class="tags">${m.genres.map(g => `<span>${esc(g)}</span>`).join('')}</div><div id="extra" class="meta"></div></div></section>
      <div class="wrap top0">${tabsHtml([['eps', 'Episodes'], ...extraTabs(rp)])}<div class="pane on" id="pane-eps"><div id="prog" class="prog"></div><div id="eps"></div></div>${extraPanes(rp)}</div>`;
  },
  async player({ id, ep, audio }) {
    const m = curM = await getMedia(id), rp = relParts(m);
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--red').trim() || '#ff4444';
    let sources = [];
    const tmdbLink = (m.externalLinks || []).find(x => /the.?movie.?database|tmdb/i.test(`${x.site || ''} ${x.url || ''}`));
    const tmdbMatch = tmdbLink?.url?.match(/(?:movie|tv)\/(\d+)/i);
    const alternateIds = tmdbMatch ? [`TMDB${tmdbMatch[1]}`] : [];
    try { sources = await provider.getSources({ malId: m.idMal, alternateIds, episode: ep, color: accent }); } catch (e) { console.warn('Could not load GitHub episode sources:', e); }

    // Keep the original server choices. GitHub entries are extra choices, never replacements.
    const legacyExtra = typeof audio === 'string' && sources.some(x => x.label === audio) ? audio : '';
    const requestedExtra = typeof audio === 'string' && audio.startsWith('json:') ? audio.slice(5) : legacyExtra;
    const serverAudio = audio === 'dub' || audio === 'Dub' ? 'dub' : 'sub';
    const activeExtra = requestedExtra ? sources.find(x => x.label === requestedExtra) : null;
    const serverUrl = activeExtra ? null : provider.getServerUrl({ media: m, malId: m.idMal, episode: ep, audio: serverAudio });
    const url = activeExtra?.url || serverUrl;
    const activeKey = activeExtra ? `json:${activeExtra.label}` : serverAudio;
    const total = Math.min(m.episodes || 9999, aired(m));
    store.set('history', [{ ...mini(m), ep, audio: activeKey, at: Date.now() }, ...store.get('history', []).filter(x => x.id !== id)].slice(0, 100));
    const s = store.get('seen', {}); s[id] = [...new Set([...(s[id] || []), ep])]; store.set('seen', s);
    const sourceButtons = [
      `<button type="button" class="source-btn ${activeKey === 'sub' ? 'on' : ''}" data-audio="sub">SUB</button>`,
      `<button type="button" class="source-btn ${activeKey === 'dub' ? 'on' : ''}" data-audio="dub">DUB</button>`,
      ...sources.map(x => `<button type="button" class="source-btn extra ${activeKey === `json:${x.label}` ? 'on' : ''}" data-audio="json:${esc(x.label)}">${esc(x.label)}</button>`)
    ].join('');
    return `<div class="pwrap"><div class="ptop"><button class="icon" id="back" aria-label="Back"><i class="fa-solid fa-arrow-left"></i></button><div><div class="serif" style="font-size:22px">${esc(name(m))}</div><div class="meta" id="eptitle" style="margin:0">Episode ${ep}</div></div></div>
      <div class="frame">${url ? `<iframe src="${esc(url)}" frameborder="0" scrolling="no" allow="fullscreen; autoplay; encrypted-media" allowfullscreen></iframe>` : `<div class="nosrc" style="background-image:linear-gradient(#000000d9,#000000d9),url('${esc(m.bannerImage || m.coverImage.large)}')"><div><h2 class="serif" style="font-size:24px">No video for this title</h2>No video source is available for this episode.<br>Check your server address in <code>src/renderer/config.js</code> or add an extra link to <code>hianime.json</code>.</div></div>`}</div>
      <div class="bar"><div class="seg source-options" role="group" aria-label="Video source">${sourceButtons}</div><span class="sp"></span><button class="ghost" id="prev" ${ep <= 1 ? 'disabled' : ''}><i class="fa-solid fa-arrow-left"></i> Prev</button><button class="cream" id="next" ${ep >= total ? 'disabled' : ''}>Next <i class="fa-solid fa-arrow-right"></i></button></div>
      ${tabsHtml([['info', 'Info'], ['eps', 'Episodes'], ...extraTabs(rp)])}
      <div class="pane on" id="pane-info"><div class="info2"><div class="pw"><img src="${esc(m.coverImage.large)}">${m.isAdult ? RIBBON : ''}</div><div><h2 class="serif t2" style="margin:0 0 6px;font-size:28px;display:block">${esc(name(m))}</h2><div class="meta">${esc(meta(m))} · Episode ${ep}</div><div class="tags" style="margin-top:0">${m.genres.map(g => `<span>${esc(g)}</span>`).join('')}</div><div class="syn" id="epsyn">Loading synopsis…</div><div class="btns"><button class="ghost" id="fav2">${favLabel(isFav(id))}</button></div></div></div></div>
      <div class="pane" id="pane-eps"><div id="eps"></div></div>${extraPanes(rp)}</div>`;
  }
};

const GK = { Action: '戦', Romance: '恋', Comedy: '笑', Fantasy: '幻', 'Sci-Fi': '宙', 'Slice of Life': '日', Horror: '怖', Mystery: '謎', Sports: '熱', Mecha: '機', Supernatural: '霊', Psychological: '心', Drama: '劇', Adventure: '冒', Music: '音' };
async function moreSections(my) { // extra rows load after the page is already on screen
  const host = $('#more-secs'); if (!host) return;
  const gs = Object.keys(GK).sort(() => Math.random() - .5).slice(0, 3), h = store.get('history', [])[0];
  const P = v => page(v).then(r => r.media).catch(() => []), plan = [];
  if (h) plan.push(['推', `Because you watched ${name(h)}`, getMedia(h.id).then(m => relParts(m).rec).catch(() => []), '']);
  plan.push(['愛', 'Fan Favorites', P({ sort: ['FAVOURITES_DESC'] }), ''], [GK[gs[0]], `Dive into ${gs[0]}`, P({ genre_in: [gs[0]], sort: ['POPULARITY_DESC'] }), gs[0]], ['近日', 'Coming Soon', P({ status: 'NOT_YET_RELEASED', sort: ['POPULARITY_DESC'] }), ''],
    [GK[gs[1]], `Dive into ${gs[1]}`, P({ genre_in: [gs[1]], sort: ['POPULARITY_DESC'] }), gs[1]], ['映画', 'Anime Movies', P({ format: 'MOVIE', sort: ['POPULARITY_DESC'] }), ''], [GK[gs[2]], `Dive into ${gs[2]}`, P({ genre_in: [gs[2]], sort: ['TRENDING_DESC'] }), gs[2]]);
  for (const [k, title, pr, g] of plan) {
    const list = await pr; if (my !== tok) return; if (!list.length) continue;
    host.insertAdjacentHTML('beforeend', sec(k, title, row(list.map((m, i) => lcard(m, i)).join('')), homeN++, g));
    const el = host.lastElementChild; bindCards(el); bindRows();
    $$('.all', el).forEach(b => b.onclick = () => { filters = { ...defF(), genres: [b.dataset.g] }; go('browse'); });
  }
}
function applyAnimeNeekTheme(theme) {
  const selected = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
    : theme;

  document.body.dataset.theme = selected;
}
const after = {
    settings() {
  const version = $('#app-version');
  const status = $('#update-status');
  const check = $('#check-updates');
  const install = $('#install-update');
  const autoplay = $('#autoplay-next');
  const resume = $('#resume-playback');
  const api = window.api;

  const isElectron = !!api &&
    typeof api.appVersion === 'function' &&
    typeof api.checkUpdates === 'function' &&
    typeof api.installUpdate === 'function' &&
    typeof api.onUpdateStatus === 'function';

  if (isElectron) {
    api.appVersion()
      .then(v => { version.textContent = 'v' + v; })
      .catch(() => { version.textContent = 'Unavailable'; });
  } else {
    version.textContent = 'Web App';
  }

  autoplay.checked = localStorage.getItem('animeneek-autoplay') !== 'false';
  resume.checked = localStorage.getItem('animeneek-resume') !== 'false';

  autoplay.onchange = () => {
    localStorage.setItem('animeneek-autoplay', autoplay.checked);
  };

  resume.onchange = () => {
    localStorage.setItem('animeneek-resume', resume.checked);
  };

  if (!isElectron) {
    check.hidden = true;
    install.hidden = true;
    status.textContent = 'Web app updates automatically. Reopen AnimeNeek to receive the latest version.';
    return;
  }

  api.onUpdateStatus(update => {
    status.textContent = update.message || 'Update status changed.';
    install.hidden = update.state !== 'downloaded';
    check.disabled = update.state === 'checking' || update.state === 'downloading';
    check.textContent = check.disabled ? 'Please wait...' : 'Check for Updates';
  });

  check.onclick = async () => {
    check.disabled = true;
    check.textContent = 'Checking...';
    status.textContent = 'Checking for updates...';

    try {
      await api.checkUpdates();
    } catch (error) {
      status.textContent = error.message || 'Unable to check for updates.';
      check.disabled = false;
      check.textContent = 'Check for Updates';
    }
  };

  install.onclick = () => api.installUpdate();
},
  home(_, my) {
    bindCards(); bindRows(); moreSections(my); const sl = $$('.slide'), dots = $$('.dots i'); let n = 0;
    const show = i => { n = i; sl.forEach((s, j) => s.classList.toggle('on', j === i)); dots.forEach((d, j) => d.classList.toggle('on', j === i)); };
    dots.forEach((d, i) => d.onclick = () => show(i)); if (sl.length > 1) timers.push(setInterval(() => show((n + 1) % sl.length), 7000));
    $$('[data-watch]').forEach(b => b.onclick = e => {
  e.stopPropagation();
  go('player', {
    id: +b.dataset.watch,
    ep: 1,
    audio: localStorage.getItem('animeneek-default-audio') || 'sub'
  });
});
    $$('.slide [data-id]').forEach(b => b.onclick = () => go('anime', +b.dataset.id));
    $$('[data-resume]').forEach(c => c.onclick = () => { const [ep, audio] = c.dataset.resume.split('|'); go('player', { id: +c.dataset.id, ep: +ep, audio }); });
    bindRemove();
  },
  browse() {
    const f = filters, upd = () => runSearch(true); let t;
    $('#fq').oninput = e => { f.q = e.target.value.trim(); clearTimeout(t); t = setTimeout(upd, 350); };
    [['ff', 'format'], ['fy', 'year'], ['fs', 'season'], ['fst', 'status'], ['fo', 'sort']].forEach(([id, k]) => $('#' + id).onchange = e => { f[k] = e.target.value; upd(); });
    $('#fsc').oninput = e => { f.score = +e.target.value; $('#sv').textContent = f.score || 'any'; clearTimeout(t); t = setTimeout(upd, 300); };
    $$('.gbar .chip').forEach(c => c.onclick = async () => {
      const g = c.dataset.g;
      if (!g) f.genres = [];
      else { if (g === 'Hentai' && !f.genres.includes(g) && !localStorage.getItem('adultOK')) { if (!await ask('Adults only', 'This genre contains explicit adult content. Please confirm that you are 18 or older.', 'I am 18 or older')) return; localStorage.setItem('adultOK', '1'); } f.genres = f.genres.includes(g) ? f.genres.filter(x => x !== g) : [...f.genres, g]; }
      $$('.gbar .chip').forEach(x => x.classList.toggle('on', x.dataset.g ? f.genres.includes(x.dataset.g) : !f.genres.length)); upd();
    });
    $('#rs').onclick = () => { filters = defF(); go('browse'); };
    runSearch(true);
  },
  favorites() {
    $$('.li').forEach(c => c.onclick = () => go('anime', +c.dataset.id));
    $$('.ck').forEach(b => b.onclick = e => { e.stopPropagation(); store.set('favorites', store.get('favorites', []).filter(x => x.id !== +b.dataset.fav)); const li = b.closest('.li'); li.style.transition = '.3s'; li.style.opacity = 0; setTimeout(() => { li.remove(); if (!$('.li')) go('favorites'); }, 300); });
  },
  history() { bindCards(); bindRemove(); $('#clear')?.addEventListener('click', () => { store.set('history', []); go('history'); }); },
  anime(id, my) {
    const m = curM; bindCards(); bindTabs();
    $('#play').onclick = () => { const h = store.get('history', []).find(x => x.id === id); go('player', {
  id,
  ep: h?.ep || 1,
  audio: localStorage.getItem('animeneek-default-audio') || h?.audio || 'sub'
}); };
    $('#fav').onclick = () => { $('#fav').innerHTML = favLabel(toggleFav(m)); };
    const box = $('#eps');
    const paint = eps => {
      epPanel(box, eps, m, 0, n => go('player', {
  id, ep: n,
  audio: localStorage.getItem('animeneek-default-audio') || 'sub'
}));
      const seen = new Set(store.get('seen', {})[id] || []), pl = eps.filter(e => e.mal_id <= aired(m)), n = pl.filter(e => seen.has(e.mal_id)).length;
      $('#prog').innerHTML = pl.length ? `<div class="bar2"><i style="width:${n / pl.length * 100}%"></i></div><small>${n} of ${pl.length} watched</small>` : '<small>Not aired yet</small>';
    };
    paint(baseEps(m)); enrich(m).then(r => { if (r && my === tok) paint(r.eps); });
    if (m.idMal) jk(`/anime/${m.idMal}/full`).then(j => { const d = j.data; if (my === tok && d) $('#extra').innerHTML = [d.rating, d.rank && 'MAL rank #' + d.rank, d.members && d.members.toLocaleString() + ' members'].filter(Boolean).map(esc).join(' · '); }).catch(() => {});
  },
  player({ id, ep, audio }, my) {
    const m = curM; bindCards(); bindTabs();
    $('#back').onclick = () => go('anime', id);
    $('#prev').onclick = () => go('player', { id, ep: ep - 1, audio }); $('#next').onclick = () => go('player', { id, ep: ep + 1, audio });
    $$('[data-audio]').forEach(b => b.onclick = () => {
  const selected = b.dataset.audio;

  if (selected === 'sub' || selected === 'dub') {
    localStorage.setItem('animeneek-default-audio', selected);
  }

  if (selected !== $('.seg button.on')?.dataset.audio) {
    go('player', { id, ep, audio: selected });
  }
});
    $('#fav2').onclick = () => { $('#fav2').innerHTML = favLabel(toggleFav(m)); };
    const synP = m.idMal ? jk(`/anime/${m.idMal}/episodes/${ep}`) : Promise.resolve(null), box = $('#eps');
    const paint = eps => {
      epPanel(box, eps, m, ep, n => n !== ep && go('player', { id, ep: n, audio }));
      const t = eps.find(e => e.mal_id === ep)?.title; if (t) $('#eptitle').textContent = `Episode ${ep} · ${t}`;
    };
    paint(baseEps(m)); enrich(m).then(r => { if (r && my === tok) paint(r.eps); });
    synP.then(j => { if (my === tok) $('#epsyn').textContent = j?.data?.synopsis || 'No synopsis available for this episode.'; }).catch(() => { if (my === tok) $('#epsyn').textContent = 'Synopsis unavailable right now.'; });
  }
};

$$('nav a').forEach(a => a.onclick = () => go(a.dataset.go));
$('#logo').onclick = () => go('home');
$('#sbtn').onclick = () => { const s = $('.srch'); s.classList.toggle('open'); if (s.classList.contains('open')) $('#search').focus(); };
$('#search').addEventListener('keydown', e => { const q = e.target.value.trim(); if (e.key === 'Escape') $('.srch').classList.remove('open'); if (e.key === 'Enter' && q) { filters = { ...defF(), q, sort: 'SEARCH_MATCH' }; e.target.value = ''; go('browse'); } });
window.addEventListener('scroll', () => $('header').classList.toggle('solid', scrollY > 30), { passive: true });
if (REMOTE_CONFIG_URL) window.api.remoteConfig(REMOTE_CONFIG_URL).then(c => c && provider.setBase(c.streamUrl)).catch(() => {});
showProfiles();

(async () => {
  try {
    syncDir = await window.api.syncGet();

    // Refresh cloud profile information only if the profile screen is still open.
    if (syncDir && !$('#auth').classList.contains('hidden')) {
      showProfiles();
    }
  } catch {
    // Continue normally when cloud storage is unavailable.
  }
})();
