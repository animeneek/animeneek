// >>> YOUR STREAM SERVER ADDRESS - change it here, nowhere else. <<<
// {MALID} = MyAnimeList id, {EP} = episode number, {SRC} = sub or dub
// Example for later:  'https://aneek.com/stream/mal/{MALID}/{EP}/{SRC}'
export const STREAM_URL = 'https://megaplay.buzz/stream/mal/{MALID}/{EP}/{SRC}';

// What goes in place of {SRC}. Change to 'Sub' / 'Dub' if your server wants capital letters.
export const SRC_NAMES = { sub: 'sub', dub: 'dub' };

// >>> LANDING SCREEN ("Who's watching?") BACKGROUND <<<
// Leave '' to use the built-in samurai sunset. Or paste your own image or GIF:
//   a web address:  'https://example.com/my-scene.gif'
//   a local file:   put it in src/renderer/ and write its name, e.g. 'landing.gif'
export const LANDING_IMAGE = 'https://raw.githubusercontent.com/18otaku/18Otaku/refs/heads/main/assets/images/BG_001.jpg';

// >>> REMOTE SERVER ADDRESS (so you never have to update the app when your server URL changes) <<<
// Put a tiny JSON file online (for example on GitHub) containing just:
//   { "streamUrl": "https://animeneek.io/stream/mal/{MALID}/{EP}/{SRC}" }
// then put that file's RAW address here (it must start with https://), e.g.
//   'https://raw.githubusercontent.com/YOUR-NAME/YOUR-REPO/main/animeneek.json'
// The app reads it each time it starts. If it can't be reached, STREAM_URL above is used.
export const REMOTE_CONFIG_URL = '';

// AnimeNeek episode sources (your existing GitHub JSON; do not change its structure).
export const STREAM_INDEX_URL = 'https://raw.githubusercontent.com/animeneek/Neek/main/anime/hianime.json';
