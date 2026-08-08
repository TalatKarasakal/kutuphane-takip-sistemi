const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("kutuphanem", {
  backup: {
    write: (json) => ipcRenderer.invoke("backup:write", json),
    list: () => ipcRenderer.invoke("backup:list"),
    read: (filePath) => ipcRenderer.invoke("backup:read", filePath),
    reveal: () => ipcRenderer.invoke("backup:reveal"),
  },
  secrets: {
    status: () => ipcRenderer.invoke("secrets:status"),
    setGemini: (value) => ipcRenderer.invoke("secrets:setGemini", value),
    clearGemini: () => ipcRenderer.invoke("secrets:clearGemini"),
  },
  metadata: {
    lookupIsbn: (isbn) => ipcRenderer.invoke("metadata:lookupIsbn", isbn),
    detectBooks: (payload) => ipcRenderer.invoke("ai:detectBooks", payload),
  },
  artwork: {
    fetch: (url) => ipcRenderer.invoke("artwork:fetch", url),
  },
  theme: {
    set: (theme) => ipcRenderer.invoke("theme:set", theme),
    onChange: (callback) => {
      if (typeof callback !== "function") return () => undefined;
      const listener = (_event, theme) => {
        if (theme === "light" || theme === "dark") callback(theme);
      };
      ipcRenderer.on("theme:changed", listener);
      return () => ipcRenderer.removeListener("theme:changed", listener);
    },
  },
  appInfo: {
    get: () => ipcRenderer.invoke("appInfo:get"),
    checkUpdate: () => ipcRenderer.invoke("appInfo:checkUpdate"),
    openExternal: (url) => ipcRenderer.invoke("appInfo:openExternal", url),
  },
});
