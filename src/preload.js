const { contextBridge, ipcRenderer } = require('electron');
const call = c => (...a) => ipcRenderer.invoke(c, ...a);
contextBridge.exposeInMainWorld('api', {
  anilist: call('anilist'), jikan: call('jikan'), openExternal: call('open-external'), remoteConfig: call('remote-config'), streamIndex: call('stream-index'),
  syncGet: call('sync-get'), syncPick: call('sync-pick'), syncClear: call('sync-clear'), syncRead: call('sync-read'), syncWrite: call('sync-write')
});
