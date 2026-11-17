// Windows version of the E-2008 maintenance log: the same page as the phone app (e2008/), in its own window.
// Entries are kept by Electron in %APPDATA%\Carnet entretien E-2008 (localStorage).
// The page loads its fonts from ../entretien/fonts, copied next to app/ by "npm run copy".
const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

if (!app.requestSingleInstanceLock()) app.quit();

function createWindow() {
  const win = new BrowserWindow({
    width: 1000, height: 820, minWidth: 380, minHeight: 500,
    backgroundColor: '#eceff2',
    title: 'Carnet entretien E-2008',
    icon: path.join(__dirname, 'app', 'icon-512.png'),
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, sandbox: true, nodeIntegration: false }
  });
  Menu.setApplicationMenu(null);
  // links to the web open in the normal browser, never inside the app
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file:')) e.preventDefault(); });
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
}

app.on('second-instance', () => { const w = BrowserWindow.getAllWindows()[0]; if (w) { if (w.isMinimized()) w.restore(); w.focus(); } });
app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
