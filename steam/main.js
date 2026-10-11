// ============================================================================
//  Newy and the Dark Forest — l'enveloppe de bureau (Electron) pour Steam.
//  - Une seule fenêtre, sans barre de menus, qui charge app/Prairie.html (le jeu
//    sans porte de code, copié par scripts/prepare.js : rien n'est chargé du réseau).
//  - Plein écran : F11 ou Alt+Entrée (et depuis les Options du jeu, par le pont).
//  - Taille, position, plein écran : retenus d'une fois sur l'autre (window-state.json).
//  - Une seule instance à la fois ; dossier de données fixe (voir userDataDir).
//  - Steam : steam.js (steamworks.js), facultatif — sans Steam, le jeu tourne quand même.
//  - Les sauvegardes : saves.js (copie des clés du stockage local en fichiers JSON,
//    pour Steam Auto-Cloud).
//  Options de lancement (Steam : Propriétés → Options de lancement) :
//    --windowed       démarrer en fenêtre
//    --fullscreen     démarrer en plein écran
//    --no-steam       ne pas initialiser Steam
//    --no-steam-overlay  ne pas préparer le rendu pour l'overlay Steam
//    --dev            outils de développement (seulement hors version empaquetée)
// ============================================================================
'use strict';
const { app, BrowserWindow, ipcMain, shell, screen, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

const ARGS = new Set(process.argv.slice(1));
const DEV = !app.isPackaged && (ARGS.has('--dev') || process.env.NEWY_DEV === '1');

// ---------------------------------------------------------------- le dossier de données
// Toujours le même nom, sans espaces : c'est lui que Steam Auto-Cloud doit viser.
//   Windows : %APPDATA%\NewyAndTheDarkForest
//   Linux   : ~/.config/NewyAndTheDarkForest   (ou $XDG_CONFIG_HOME)
//   macOS   : ~/Library/Application Support/NewyAndTheDarkForest
const DATA_DIR_NAME = 'NewyAndTheDarkForest';
app.setName('Newy and the Dark Forest');
app.setPath('userData', path.join(app.getPath('appData'), DATA_DIR_NAME));

// ---------------------------------------------------------------- une seule instance
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

// ---------------------------------------------------------------- Steam (avant app.ready : l'overlay)
const steam = require('./steam');
steam.preparer({ desactive: ARGS.has('--no-steam'), sansOverlay: ARGS.has('--no-steam-overlay') });

const saves = require('./saves');

// ---------------------------------------------------------------- l'état de la fenêtre
const STATE_FILE = () => path.join(app.getPath('userData'), 'window-state.json');
function lireEtat() {
  try {
    const s = JSON.parse(fs.readFileSync(STATE_FILE(), 'utf8'));
    if (s && s.width > 200 && s.height > 200) return s;
  } catch (e) { /* première fois */ }
  return null;
}
function ecrireEtat(win) {
  try {
    if (!win || win.isDestroyed()) return;
    const b = win.getNormalBounds();
    const s = { x: b.x, y: b.y, width: b.width, height: b.height, maximized: win.isMaximized(), fullscreen: win.isFullScreen() };
    fs.mkdirSync(app.getPath('userData'), { recursive: true });
    fs.writeFileSync(STATE_FILE(), JSON.stringify(s));
  } catch (e) { /* tant pis */ }
}
// la fenêtre retenue est-elle encore sur un écran (un écran débranché…) ?
function surUnEcran(s) {
  if (s.x === undefined || s.y === undefined) return false;
  return screen.getAllDisplays().some((d) => {
    const a = d.workArea;
    return s.x + 80 > a.x && s.y + 40 > a.y && s.x + 80 < a.x + a.width && s.y + 40 < a.y + a.height;
  });
}

let win = null;

function creerFenetre() {
  const etat = lireEtat();
  const travail = screen.getPrimaryDisplay().workAreaSize;
  const largeur = Math.min(Math.max(1280, (etat && etat.width) || 1280), Math.max(1280, travail.width));
  const hauteur = Math.min(Math.max(720, (etat && etat.height) || 720), Math.max(720, travail.height));
  const pleinEcran = ARGS.has('--fullscreen') ? true : ARGS.has('--windowed') ? false : etat ? !!etat.fullscreen : true;

  win = new BrowserWindow({
    width: largeur,
    height: hauteur,
    ...(etat && surUnEcran(etat) ? { x: etat.x, y: etat.y } : {}),
    minWidth: 960,
    minHeight: 540,
    show: false,
    backgroundColor: '#000000',
    title: 'Newy and the Dark Forest',
    autoHideMenuBar: true,
    fullscreenable: true,
    icon: path.join(__dirname, 'app', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: DEV,
      spellcheck: false,
      backgroundThrottling: false,
      autoplayPolicy: 'no-user-gesture-required',
    },
  });
  win.setMenuBarVisibility(false);
  if (etat && etat.maximized) win.maximize();
  if (pleinEcran) win.setFullScreen(true);

  win.once('ready-to-show', () => { win.show(); win.focus(); });

  // F11, Alt+Entrée : plein écran ; Ctrl+Maj+I seulement en développement
  win.webContents.on('before-input-event', (ev, input) => {
    if (input.type !== 'keyDown') return;
    const k = input.key;
    if (k === 'F11' || (k === 'Enter' && input.alt)) {
      ev.preventDefault();
      win.setFullScreen(!win.isFullScreen());
    } else if (DEV && k === 'I' && input.control && input.shift) {
      win.webContents.toggleDevTools();
    } else if (!DEV && (k === 'F5' || (k.toLowerCase() === 'r' && input.control))) {
      ev.preventDefault(); // pas de rechargement accidentel
    }
  });
  const signaler = () => { if (win && !win.isDestroyed()) win.webContents.send('fenetre:pleinEcran', win.isFullScreen()); };
  win.on('enter-full-screen', signaler);
  win.on('leave-full-screen', signaler);

  // rien ne sort de la page : les liens web s'ouvrent dans le navigateur du système
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (ev, url) => {
    if (url !== win.webContents.getURL()) {
      ev.preventDefault();
      if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    }
  });
  // ni micro, ni caméra, ni notifications… ; le verrouillage du pointeur et le plein écran, oui
  win.webContents.session.setPermissionRequestHandler((wc, perm, cb) => cb(['pointerLock', 'fullscreen', 'clipboard-sanitized-write'].includes(perm)));

  // la page plante (GPU…) : on la recharge une fois plutôt que de laisser un écran noir
  let relances = 0;
  win.webContents.on('render-process-gone', (ev, details) => {
    console.error('render-process-gone', details && details.reason);
    if (details && details.reason !== 'clean-exit' && relances++ < 2 && !win.isDestroyed()) win.reload();
  });

  win.on('close', () => ecrireEtat(win));
  win.on('closed', () => { win = null; });

  win.loadFile(path.join(__dirname, 'app', 'Prairie.html'));
}

// ---------------------------------------------------------------- le pont (preload.js)
ipcMain.on('app:quitter', () => { app.quit(); });
ipcMain.on('fenetre:setPleinEcran', (ev, on) => { if (win && !win.isDestroyed()) win.setFullScreen(!!on); });
ipcMain.on('fenetre:estPleinEcran', (ev) => { ev.returnValue = !!(win && !win.isDestroyed() && win.isFullScreen()); });
ipcMain.on('steam:etat', (ev) => { ev.returnValue = steam.etat(); });
ipcMain.on('steam:succes', (ev, api) => { steam.succes(api); });
ipcMain.on('steam:stat', (ev, nom, val) => { steam.stat(nom, val); });
saves.brancher(ipcMain, () => app.getPath('userData'));

// ---------------------------------------------------------------- la vie de l'application
app.on('second-instance', () => {
  if (!win) return;
  if (win.isMinimized()) win.restore();
  win.focus();
});

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  steam.demarrer();
  creerFenetre();
});

app.on('before-quit', () => { if (win) ecrireEtat(win); });
app.on('window-all-closed', () => { app.quit(); }); // aussi sous macOS : c'est un jeu
app.on('will-quit', () => { steam.arreter(); });
