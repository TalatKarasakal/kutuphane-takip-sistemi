const {
  app,
  BrowserWindow,
  Menu,
  shell,
  ipcMain,
  safeStorage,
  nativeTheme,
} = require("electron");
const path = require("path");
const fs = require("fs");
const { registerAiIpc } = require("./ai.cjs");
const { lookupIsbn } = require("./metadata.cjs");
const { fetchArtwork } = require("./artwork.cjs");

app.setName("Kütüphanem");
if (process.env.KUTUPHANEM_E2E_USER_DATA) {
  app.setPath("userData", path.resolve(process.env.KUTUPHANEM_E2E_USER_DATA));
}

const ICON_PATH = path.join(__dirname, "..", "build", "icon.png");
// Dock simgesi görünüme göre değişir: koyu temada siyah, açık temada beyaz
// zemin. macOS yalnızca paket içindeki .icns'i sabit çizdiği için zemini
// çalışma anında biz değiştiriyoruz.
const DOCK_ICONS = {
  dark: path.join(__dirname, "..", "build", "icon-dark.png"),
  light: path.join(__dirname, "..", "build", "icon-light.png"),
};
const MAX_BACKUPS = 20;
const MAX_BACKUP_BYTES = 100 * 1024 * 1024;
const MAX_SECRET_BYTES = 8 * 1024;
const RELEASES_URL =
  "https://github.com/TalatKarasakal/kutuphane-takip-sistemi/releases";
const ALLOWED_EXTERNAL = new Set([
  "https://aistudio.google.com/apikey",
  RELEASES_URL,
]);

let mainWindow = null;

function applyDockIcon() {
  if (process.platform !== "darwin" || !app.dock) return;
  const icon = nativeTheme.shouldUseDarkColors
    ? DOCK_ICONS.dark
    : DOCK_ICONS.light;
  try {
    app.dock.setIcon(fs.existsSync(icon) ? icon : ICON_PATH);
  } catch {
    /* best effort */
  }
}

function isTrustedEvent(event) {
  if (!mainWindow || event.sender !== mainWindow.webContents) return false;
  if (event.senderFrame !== mainWindow.webContents.mainFrame) return false;
  const url = event.senderFrame?.url ?? "";
  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (url === mainWindow.webContents.getURL() && url.startsWith("file://"))
    return true;
  if (!devUrl) return false;
  try {
    return (
      new URL(url).origin === new URL(devUrl).origin &&
      url === mainWindow.webContents.getURL()
    );
  } catch {
    return false;
  }
}

function handle(channel, callback) {
  ipcMain.handle(channel, async (event, ...args) => {
    if (!isTrustedEvent(event))
      throw new Error("Güvenilmeyen IPC çağrısı engellendi.");
    return callback(...args);
  });
}

function backupDir() {
  return path.join(app.getPath("userData"), "backups");
}

function ensureBackupDir() {
  const dir = backupDir();
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  return dir;
}

function stamp(date = new Date()) {
  const part = (value) => String(value).padStart(2, "0");
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");
  return `${date.getFullYear()}${part(date.getMonth() + 1)}${part(date.getDate())}-${part(date.getHours())}${part(date.getMinutes())}${part(date.getSeconds())}-${milliseconds}`;
}

function listBackups() {
  const dir = backupDir();
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => /^kutuphanem-\d{8}-\d{6}(?:-\d{3})?\.json$/.test(name))
    .map((name) => {
      const filePath = path.join(dir, name);
      const stat = fs.statSync(filePath);
      return { name, path: filePath, size: stat.size, mtime: stat.mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime);
}

function safeBackupPath(filePath) {
  if (typeof filePath !== "string" || filePath.length > 4096) return null;
  const dir = path.resolve(backupDir());
  const resolved = path.resolve(filePath);
  return resolved.startsWith(`${dir}${path.sep}`) ? resolved : null;
}

function rotateBackups() {
  listBackups()
    .slice(MAX_BACKUPS)
    .forEach((file) => {
      try {
        fs.unlinkSync(file.path);
      } catch {
        /* best effort */
      }
    });
}

function registerBackupIpc() {
  handle("backup:write", async (json) => {
    if (
      typeof json !== "string" ||
      Buffer.byteLength(json, "utf8") > MAX_BACKUP_BYTES
    ) {
      return {
        ok: false,
        error: "Yedek verisi geçersiz veya 100 MB sınırını aşıyor.",
      };
    }
    try {
      const parsed = JSON.parse(json);
      if (parsed?.app !== "kutuphanem" || parsed?.version !== 2)
        return { ok: false, error: "Yedek başlığı geçersiz." };
      const filePath = path.join(
        ensureBackupDir(),
        `kutuphanem-${stamp()}.json`,
      );
      await fs.promises.writeFile(filePath, json, {
        encoding: "utf8",
        mode: 0o600,
        flag: "wx",
      });
      rotateBackups();
      return { ok: true, path: filePath };
    } catch (error) {
      return { ok: false, error: String(error?.message || error) };
    }
  });
  handle("backup:list", async () => listBackups());
  handle("backup:read", async (filePath) => {
    const resolved = safeBackupPath(filePath);
    if (!resolved) return null;
    try {
      const stat = await fs.promises.stat(resolved);
      if (stat.size > MAX_BACKUP_BYTES) return null;
      return await fs.promises.readFile(resolved, "utf8");
    } catch {
      return null;
    }
  });
  handle("backup:reveal", async () => {
    const result = await shell.openPath(ensureBackupDir());
    return result === "";
  });
}

function secretPath() {
  return path.join(app.getPath("userData"), "secrets.json");
}

function readGeminiSecret() {
  if (!safeStorage.isEncryptionAvailable()) return undefined;
  try {
    const value = JSON.parse(fs.readFileSync(secretPath(), "utf8"));
    if (typeof value.gemini !== "string") return undefined;
    return safeStorage.decryptString(Buffer.from(value.gemini, "base64"));
  } catch {
    return undefined;
  }
}

function registerSecretIpc() {
  handle("secrets:status", async () => ({
    gemini: !!readGeminiSecret(),
    secure: safeStorage.isEncryptionAvailable(),
  }));
  handle("secrets:setGemini", async (value) => {
    if (!safeStorage.isEncryptionAvailable())
      return {
        ok: false,
        error: "İşletim sistemi güvenli depolaması kullanılamıyor.",
      };
    if (
      typeof value !== "string" ||
      !value.trim() ||
      Buffer.byteLength(value, "utf8") > MAX_SECRET_BYTES
    ) {
      return { ok: false, error: "API anahtarı geçersiz." };
    }
    try {
      const encrypted = safeStorage
        .encryptString(value.trim())
        .toString("base64");
      await fs.promises.writeFile(
        secretPath(),
        JSON.stringify({ gemini: encrypted }),
        { encoding: "utf8", mode: 0o600 },
      );
      return { ok: true };
    } catch (error) {
      return { ok: false, error: String(error?.message || error) };
    }
  });
  handle("secrets:clearGemini", async () => {
    try {
      await fs.promises.unlink(secretPath()).catch((error) => {
        if (error.code !== "ENOENT") throw error;
      });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: String(error?.message || error) };
    }
  });
}

function compareVersions(left, right) {
  const a = String(left).replace(/^v/, "").split(".").map(Number);
  const b = String(right).replace(/^v/, "").split(".").map(Number);
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    if ((a[index] || 0) !== (b[index] || 0))
      return (a[index] || 0) - (b[index] || 0);
  }
  return 0;
}

async function checkUpdate() {
  try {
    const response = await fetch(
      "https://api.github.com/repos/TalatKarasakal/kutuphane-takip-sistemi/releases/latest",
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "Kutuphanem-Desktop",
        },
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!response.ok) throw new Error(`GitHub ${response.status}`);
    const body = await response.json();
    const latest = String(body.tag_name || "").replace(/^v/, "");
    const url =
      typeof body.html_url === "string" &&
      body.html_url.startsWith(RELEASES_URL)
        ? body.html_url
        : RELEASES_URL;
    if (!/^\d+\.\d+\.\d+(?:[-+].+)?$/.test(latest))
      throw new Error("Geçersiz sürüm yanıtı.");
    return {
      ok: true,
      current: app.getVersion(),
      latest,
      url,
      updateAvailable: compareVersions(latest, app.getVersion()) > 0,
    };
  } catch (error) {
    return { ok: false, error: String(error?.message || error) };
  }
}

function isAllowedExternal(rawUrl) {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "https:" || url.username || url.password) return false;
    if (ALLOWED_EXTERNAL.has(url.toString().replace(/\/$/, ""))) return true;
    return (
      url.hostname === "github.com" &&
      url.pathname.startsWith(
        "/TalatKarasakal/kutuphane-takip-sistemi/releases/",
      )
    );
  } catch {
    return false;
  }
}

function registerUtilityIpc() {
  handle("metadata:lookupIsbn", (isbn) => lookupIsbn(isbn));
  handle("artwork:fetch", (url) => fetchArtwork(url));
  handle("theme:set", async (theme) => {
    if (!["light", "dark", "system"].includes(theme)) return false;
    nativeTheme.themeSource = theme;
    return true;
  });
  handle("appInfo:get", async () => ({
    version: app.getVersion(),
    name: app.getName(),
  }));
  handle("appInfo:checkUpdate", checkUpdate);
  handle("appInfo:openExternal", async (url) => {
    if (!isAllowedExternal(url)) return false;
    await shell.openExternal(url);
    return true;
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: "#0b1220",
    title: "Kütüphanem",
    icon: ICON_PATH,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });
  mainWindow.removeMenu();
  mainWindow.webContents.session.setPermissionRequestHandler(
    (_webContents, _permission, callback) => callback(false),
  );
  mainWindow.webContents.on("will-navigate", (event, url) => {
    const current = mainWindow?.webContents.getURL() ?? "";
    if (url !== current) event.preventDefault();
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isAllowedExternal(url)) void shell.openExternal(url);
    return { action: "deny" };
  });
  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    void mainWindow.loadURL(devUrl);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    void mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

app.whenReady().then(() => {
  applyDockIcon();
  registerBackupIpc();
  registerSecretIpc();
  registerUtilityIpc();
  registerAiIpc({ handle, getApiKey: readGeminiSecret });
  if (process.platform === "darwin") {
    Menu.setApplicationMenu(
      Menu.buildFromTemplate([
        { role: "appMenu" },
        { role: "editMenu" },
        { role: "viewMenu" },
        { role: "windowMenu" },
      ]),
    );
  } else {
    Menu.setApplicationMenu(null);
  }
  createWindow();
  nativeTheme.on("updated", () => {
    applyDockIcon();
    mainWindow?.webContents.send(
      "theme:changed",
      nativeTheme.shouldUseDarkColors ? "dark" : "light",
    );
  });
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
