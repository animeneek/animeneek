const { app, BrowserWindow, ipcMain, shell, session, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');

const JIKAN_TTL = 24 * 3600e3, ANILIST_TTL = 10 * 60e3, GAP_MS = 350; // ~3 requests/second
let cache = {}, cacheFile;
const sleep = ms => new Promise(r => setTimeout(r, ms));
function loadCache() { try { cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8')); } catch { cache = {}; } }
let saveTimer;
function saveCache() { clearTimeout(saveTimer); saveTimer = setTimeout(() => fs.writeFile(cacheFile, JSON.stringify(cache), () => {}), 500); }
const fresh = (k, ttl) => (cache[k] && Date.now() - cache[k].t < ttl ? cache[k].d : null);

// Jikan: one request at a time, spaced out, retries on 429
let chain = Promise.resolve(), last = 0;
function jikan(p) {
  const hit = fresh('j:' + p, JIKAN_TTL);
  if (hit) return Promise.resolve(hit);
  const job = chain.then(async () => {
    for (let i = 0; i < 4; i++) {
      await sleep(Math.max(0, last + GAP_MS - Date.now()));
      last = Date.now();
      let r; try { r = await fetch('https://api.jikan.moe/v4' + p, { signal: AbortSignal.timeout(12000) }); } catch { await sleep(1000 * (i + 1)); continue; }
      if (r.status === 429 || r.status >= 500) { await sleep(1500 * (i + 1)); continue; }
      if (!r.ok) throw new Error('Jikan error ' + r.status);
      const d = await r.json();
      cache['j:' + p] = { t: Date.now(), d }; saveCache();
      return d;
    }
    throw new Error('Jikan is busy, try again shortly');
  });
  chain = job.catch(() => {});
  return job;
}

async function anilist(query, variables) {
  const key = 'a:' + query + JSON.stringify(variables || {});
  const hit = fresh(key, ANILIST_TTL);
  if (hit) return hit;

  let lastError;

  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        signal: AbortSignal.timeout(30000),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ query, variables })
      });

      if (r.status === 429 || r.status >= 500) {
        lastError = new Error('AniList HTTP ' + r.status);
        await sleep(2000 * (i + 1));
        continue;
      }

      if (!r.ok) {
        throw new Error('AniList HTTP ' + r.status);
      }

      const j = await r.json();

      if (j.errors) {
        throw new Error(j.errors[0].message);
      }

      cache[key] = { t: Date.now(), d: j.data };
      saveCache();
      return j.data;

    } catch (error) {
      lastError = error;

      if (i < 2) {
        await sleep(1500 * (i + 1));
      }
    }
  }

  throw new Error('AniList request failed after 3 attempts: ' + (lastError?.message || 'Unknown error'));
}


// ---------- optional cloud-folder sync (a folder inside the user's own Google Drive / OneDrive / Dropbox) ----------
let syncDir = null;
const cfgFile = () => path.join(app.getPath('userData'), 'sync.json');
const okName = n => /^[a-z0-9_-]{1,64}$/i.test(String(n));
const syncPath = n => path.join(syncDir, `animeneek-${n}.json`);

// Block popups / new windows from everything, including frames inside the player
app.on('web-contents-created', (_e, wc) => {
  wc.setWindowOpenHandler(() => ({ action: 'deny' }));
  wc.on('will-navigate', (e, url) => { if (!url.startsWith('file://')) e.preventDefault(); });
});

function createWindow() {
  const win = new BrowserWindow({
    title: `AnimeNeek v${app.getVersion()}`,
    icon: path.join(__dirname, 'icon.png'),
    width: 1280, height: 800, minWidth: 480, minHeight: 560,
    backgroundColor: '#000000', autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(() => {
  cacheFile = path.join(app.getPath('userData'), 'api-cache.json');
  loadCache();
  // file:// pages send no Referer; give embedded players one (their own site) like a normal web page would
  session.defaultSession.webRequest.onBeforeSendHeaders({ urls: ['https://*/*'] }, (d, cb) => {
    const h = d.requestHeaders;
    if (d.resourceType === 'subFrame' && !h.Referer) { try { h.Referer = new URL(d.url).origin + '/'; } catch { /* ignore */ } }
    cb({ requestHeaders: h });
  });
  ipcMain.handle('anilist', (_e, q, v) => anilist(q, v));
  ipcMain.handle('stream-index', async (_e, url) => {
    // Only fetch the configured raw GitHub JSON endpoint.
    let parsed;
    try { parsed = new URL(url); } catch { throw new Error('Invalid stream index URL'); }
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'raw.githubusercontent.com') throw new Error('Stream index must use raw.githubusercontent.com over HTTPS');
    const r = await fetch(parsed.toString(), { signal: AbortSignal.timeout(15000), cache: 'no-store' });
    if (!r.ok) throw new Error('GitHub stream index returned HTTP ' + r.status);
    const data = await r.json();
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid stream index JSON');
    return data;
  });

  ipcMain.handle('jikan', (_e, p) => jikan(p));
  try { syncDir = JSON.parse(fs.readFileSync(cfgFile(), 'utf8')).dir || null; } catch { syncDir = null; }
  ipcMain.handle('sync-get', () => syncDir);
  ipcMain.handle('sync-pick', async () => {
    const win = BrowserWindow.getFocusedWindow();
    const r = await dialog.showOpenDialog(win, { title: 'Choose a folder in your cloud storage', properties: ['openDirectory', 'createDirectory'] });
    if (win) { win.focus(); win.webContents.focus(); }
    if (r.canceled || !r.filePaths[0]) return syncDir;
    syncDir = r.filePaths[0]; fs.writeFileSync(cfgFile(), JSON.stringify({ dir: syncDir })); return syncDir;
  });
  ipcMain.handle('sync-clear', () => { syncDir = null; try { fs.unlinkSync(cfgFile()); } catch { /* ignore */ } return null; });
  ipcMain.handle('sync-read', (_e, n) => { if (!syncDir || !okName(n)) return null; try { return JSON.parse(fs.readFileSync(syncPath(n), 'utf8')); } catch { return null; } });
  ipcMain.handle('sync-write', (_e, n, d) => { if (!syncDir || !okName(n)) return false; try { fs.writeFileSync(syncPath(n), JSON.stringify(d)); return true; } catch { return false; } });
  ipcMain.handle('remote-config', async (_e, url) => {
    const f = path.join(app.getPath('userData'), 'remote-config.json');
    if (!/^https:\/\//.test(url || '')) return null;
    try { const r = await fetch(url, { signal: AbortSignal.timeout(8000), cache: 'no-store' }); if (!r.ok) throw new Error('bad status'); const j = await r.json(); fs.writeFile(f, JSON.stringify(j), () => {}); return j; }
    catch { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } }
  });
  ipcMain.handle('open-external', (_e, url) => { if (/^https:\/\//.test(url)) shell.openExternal(url); });
  createWindow();
// AnimeNeek update management
function sendUpdateStatus(status) {
  const win = BrowserWindow.getAllWindows()[0];
  if (win && !win.isDestroyed()) {
    win.webContents.send('update-status', status);
  }
}

ipcMain.handle('app-version', () => app.getVersion());

ipcMain.handle('check-updates', async () => {
  if (!app.isPackaged) {
    sendUpdateStatus({
      state: 'unavailable',
      message: 'Updates are available in installed builds only.'
    });
    return { state: 'unavailable' };
  }

  try {
    sendUpdateStatus({ state: 'checking', message: 'Checking for updates...' });
    await autoUpdater.checkForUpdates();
    return { state: 'checking' };
  } catch (error) {
    sendUpdateStatus({ state: 'error', message: error.message });
    return { state: 'error' };
  }
});

ipcMain.handle('install-update', () => autoUpdater.quitAndInstall());

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.on('checking-for-update', () => {
  sendUpdateStatus({ state: 'checking', message: 'Checking for updates...' });
});

autoUpdater.on('update-available', info => {
  sendUpdateStatus({
    state: 'available',
    message: `Update ${info.version} found. Downloading...`
  });
});

autoUpdater.on('update-not-available', () => {
  sendUpdateStatus({
    state: 'latest',
    message: 'You are using the latest version.'
  });
});

autoUpdater.on('download-progress', progress => {
  sendUpdateStatus({
    state: 'downloading',
    message: `Downloading update... ${Math.round(progress.percent)}%`
  });
});

autoUpdater.on('update-downloaded', info => {
  sendUpdateStatus({
    state: 'downloaded',
    message: `Version ${info.version} is ready to install.`
  });
});

autoUpdater.on('error', error => {
  console.error('AnimeNeek update error:', error);
  sendUpdateStatus({ state: 'error', message: error.message });
});

if (app.isPackaged) {
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(error => {
      console.error('AnimeNeek update check failed:', error);
    });
  }, 5000);
}
  app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
