const { contextBridge, ipcRenderer } = require('electron');

// Renderer'a yalnızca yedekleme köprüsünü açıyoruz (contextIsolation + sandbox uyumlu).
contextBridge.exposeInMainWorld('kutuphanem', {
  backup: {
    write: (json) => ipcRenderer.invoke('backup:write', json),
    list: () => ipcRenderer.invoke('backup:list'),
    read: (filePath) => ipcRenderer.invoke('backup:read', filePath),
    reveal: () => ipcRenderer.invoke('backup:reveal'),
    lastInfo: () => ipcRenderer.invoke('backup:lastInfo'),
  },
  ai: {
    detectBooks: (payload) => ipcRenderer.invoke('ai:detectBooks', payload),
  },
});
