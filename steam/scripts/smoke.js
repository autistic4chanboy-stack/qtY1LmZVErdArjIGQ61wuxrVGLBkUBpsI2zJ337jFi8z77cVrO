// Essai rapide de l'application empaquetée (Linux, ou celle qu'on indique) avec Playwright :
//   xvfb-run -a node scripts/smoke.js [chemin de l'exécutable]
// (par défaut : dist/linux-unpacked/NewyAndTheDarkForest ; Playwright : require('playwright')
//  ou PLAYWRIGHT=<chemin du module>). Un dossier de données temporaire est utilisé
// (XDG_CONFIG_HOME) : rien n'est touché chez le joueur.
// Vérifie : le jeu démarre, le pont (window.steamBridge) est là, Steam absent ne gêne
// pas, le bouton Quitter, le plein écran, la copie des sauvegardes en fichier et la
// reprise d'un fichier plus récent au démarrage suivant, puis « Quitter ».
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const pw = require(process.env.PLAYWRIGHT || 'playwright');

const exe = path.resolve(process.argv[2] || path.join(__dirname, '..', 'dist', 'linux-unpacked', 'NewyAndTheDarkForest'));
const cfg = fs.mkdtempSync(path.join(os.tmpdir(), 'newy-essai-'));
const savesDir = path.join(cfg, 'NewyAndTheDarkForest', 'saves');
const saveFile = path.join(savesDir, 'prairie-save.json');
let echecs = 0;
const ok = (c, t) => { console.log((c ? 'OK    ' : 'ÉCHEC ') + t); if (!c) echecs++; };
// rendu logiciel : la machine d'essai n'a pas de carte graphique
const ARGS = ['--no-sandbox', '--windowed', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];

async function lancer() {
  const app = await pw._electron.launch({ executablePath: exe, args: ARGS, env: Object.assign({}, process.env, { XDG_CONFIG_HOME: cfg }), timeout: 120000 });
  const page = await app.firstWindow({ timeout: 120000 });
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.waitForFunction(() => { try { return game.world && !document.querySelector('#loading').classList.contains('open'); } catch (e) { return false; } }, null, { timeout: 600000 });
  return { app, page, errs };
}

(async () => {
  console.log('exécutable :', exe);
  // ---- 1. premier lancement
  let { app, page, errs } = await lancer();
  ok(true, 'le jeu démarre');
  const t = await page.evaluate(() => ({
    pont: typeof window.steamBridge === 'object', node: typeof require, steam: window.steamBridge.steam(),
    quit: !!document.getElementById('m-quit'), porte: !!document.querySelector('script') && document.documentElement.innerHTML.includes("getItem('prairie.beta')"),
    titre: document.title, opt: !!document.getElementById('o-qualite'),
  }));
  ok(t.pont && t.node === 'undefined', 'le pont est là, Node ne l’est pas (contextIsolation)');
  ok(t.steam && t.steam.actif === false, 'sans Steam : ' + JSON.stringify(t.steam));
  ok(t.quit, 'le bouton Quitter est dans le menu');
  ok(!t.porte, 'pas de porte de code');
  ok(t.opt, 'options : qualité graphique');
  await page.evaluate(() => window.steamBridge.achievement('NEWY_PREMIERE_RECOLTE'));
  await page.evaluate(() => window.steamBridge.setFullscreen(true));
  await page.waitForTimeout(1500);
  ok(await page.evaluate(() => window.steamBridge.isFullscreen()), 'plein écran par le pont');
  await page.evaluate(() => window.steamBridge.setFullscreen(false));
  // ---- 2. la copie des sauvegardes
  await page.evaluate(() => { localStorage.setItem('prairie.essai', 'un'); return window.steamBridge.flushSaves(); });
  let d = JSON.parse(fs.readFileSync(saveFile, 'utf8'));
  ok(d.keys['prairie.essai'] === 'un' && d.t > 0, 'copie en fichier : ' + Object.keys(d.keys).length + ' clés, ' + (fs.statSync(saveFile).size / 1024).toFixed(0) + ' Ko');
  ok(await page.evaluate(() => window.steamBridge.saveDir()) === savesDir, 'saveDir : ' + savesDir);
  ok(!errs.length, 'pas d’erreur de page' + (errs.length ? ' : ' + errs.slice(0, 3).join(' | ') : ''));
  // ---- 3. Quitter (le bouton du menu)
  const fin = app.waitForEvent('close', { timeout: 20000 }).then(() => true, () => false);
  await page.evaluate(() => { setTimeout(() => window.steamBridge.quit(), 50); }).catch(() => {});
  ok(await fin, 'Quitter ferme l’application');
  // ---- 4. un fichier plus récent (venu de Steam Cloud) est repris au démarrage
  d = JSON.parse(fs.readFileSync(saveFile, 'utf8'));
  d.keys['prairie.essai'] = 'deux'; d.t = Date.now() + 60000;
  fs.writeFileSync(saveFile, JSON.stringify(d));
  ({ app, page, errs } = await lancer());
  ok(await page.evaluate(() => localStorage.getItem('prairie.essai')) === 'deux', 'au démarrage : la sauvegarde plus récente est reprise');
  ok(fs.existsSync(path.join(cfg, 'NewyAndTheDarkForest', 'window-state.json')), 'l’état de la fenêtre est retenu');
  await app.close();
  fs.rmSync(cfg, { recursive: true, force: true });
  console.log(echecs ? echecs + ' échec(s)' : 'tout va bien');
  process.exit(echecs ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
