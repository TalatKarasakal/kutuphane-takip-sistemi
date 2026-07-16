const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { registerAiIpc } = require('./ai.cjs');

// Dock/menü çubuğunda "Electron" yerine uygulama adı görünsün.
app.setName('Kütüphanem');

const ICON_PATH = path.join(__dirname, '..', 'build', 'icon.png');

let mainWindow = null;

const MAX_BACKUPS = 20;

function backupDir() {
  return path.join(app.getPath('userData'), 'backups');
}

function ensureBackupDir() {
  const dir = backupDir();
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function stamp(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}` +
    `-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
  );
}

function listBackups() {
  const dir = backupDir();
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((n) => n.startsWith('kutuphanem-') && n.endsWith('.json'))
    .map((name) => {
      const full = path.join(dir, name);
      const st = fs.statSync(full);
      return { name, path: full, size: st.size, mtime: st.mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime);
}

function rotateBackups() {
  const files = listBackups();
  files.slice(MAX_BACKUPS).forEach((f) => {
    try {
      fs.unlinkSync(f.path);
    } catch {
      /* yoksay */
    }
  });
}

function registerBackupIpc() {
  ipcMain.handle('backup:write', async (_e, json) => {
    try {
      const dir = ensureBackupDir();
      const filePath = path.join(dir, `kutuphanem-${stamp()}.json`);
      await fs.promises.writeFile(filePath, json, 'utf8');
      rotateBackups();
      return { ok: true, path: filePath };
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err) };
    }
  });

  ipcMain.handle('backup:list', async () => listBackups());

  ipcMain.handle('backup:read', async (_e, filePath) => {
    try {
      // Yalnızca yedek klasörü içindeki dosyalar okunabilir.
      const dir = backupDir();
      const resolvedDir = path.resolve(dir);
      const resolved = path.resolve(filePath);
      const base = resolvedDir + path.sep;
      if (resolved !== resolvedDir && !resolved.startsWith(base)) return null;
      return await fs.promises.readFile(resolved, 'utf8');
    } catch {
      return null;
    }
  });

  ipcMain.handle('backup:reveal', async () => {
    try {
      const dir = ensureBackupDir();
      await shell.openPath(dir);
      return true;
    } catch {
      return false;
    }
  });

  ipcMain.handle('backup:lastInfo', async () => {
    const files = listBackups();
    return files.length ? { name: files[0].name, mtime: files[0].mtime } : null;
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: '#0b1220',
    title: 'Kütüphanem',
    icon: ICON_PATH,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  mainWindow.removeMenu();

  // Geliştirme: VITE_DEV_SERVER_URL ayarlıysa canlı dev sunucusunu yükle
  // (gerçek Electron + IPC ile test için). Aksi halde paketlenmiş dosyayı aç.
  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    mainWindow.loadURL(devUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  // macOS: Dock simgesini çalışma anında ayarla (dev modda da doğru simge).
  if (process.platform === 'darwin' && app.dock) {
    try { app.dock.setIcon(ICON_PATH); } catch { /* yoksay */ }
  }

  registerBackupIpc();
  registerAiIpc();

  if (process.platform === 'darwin') {
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      { role: 'appMenu' },
      { role: 'editMenu' },
      { role: 'viewMenu' },
      { role: 'windowMenu' },
    ]));
  } else {
    Menu.setApplicationMenu(null);
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
