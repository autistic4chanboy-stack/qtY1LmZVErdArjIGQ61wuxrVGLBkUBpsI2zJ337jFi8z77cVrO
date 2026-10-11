// Remplit les identifiants Steam partout d'un coup (on peut le relancer) :
//   node scripts/set-ids.js --app 1234560 --win 1234561 --linux 1234562 [--mac 1234563 | --no-mac]
// Écrit : steam_appid.txt, steampipe/app_build_XXXX.vdf, steampipe/depot_build_*.vdf.
// (app/steam.json suit au prochain scripts/prepare.js.)
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SP = path.join(ROOT, 'steampipe');
const arg = (k) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : null; };
const ids = { app: arg('app'), win: arg('win'), linux: arg('linux'), mac: arg('mac') };
const sansMac = process.argv.includes('--no-mac');
for (const k in ids) if (ids[k] !== null && !/^\d{3,10}$/.test(ids[k])) { console.error(`--${k} : un nombre attendu (${ids[k]})`); process.exit(1); }
if (!ids.app) { console.error('usage : node scripts/set-ids.js --app <id> --win <id> --linux <id> [--mac <id> | --no-mac]'); process.exit(1); }

fs.writeFileSync(path.join(ROOT, 'steam_appid.txt'), ids.app + '\n');

const fichiers = { win: 'depot_build_windows.vdf', linux: 'depot_build_linux.vdf', mac: 'depot_build_macos.vdf' };
let app = fs.readFileSync(path.join(SP, 'app_build_XXXX.vdf'), 'utf8');
app = app.replace(/("AppID"\s*")[^"]*(")/, `$1${ids.app}$2`);
for (const k in fichiers) {
  const ligne = new RegExp(`^(\\s*)"[^"]*"(\\s*"${fichiers[k].replace('.', '\\.')}")\\s*$`, 'm');
  if (k === 'mac' && sansMac) { app = app.replace(new RegExp(`^.*"${fichiers[k].replace('.', '\\.')}".*\\n`, 'm'), ''); continue; }
  if (!ids[k]) continue;
  if (!ligne.test(app)) { console.error('ligne du dépôt ' + k + ' introuvable dans app_build_XXXX.vdf'); process.exit(1); }
  app = app.replace(ligne, `$1"${ids[k]}"$2`);
  const f = path.join(SP, fichiers[k]);
  fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replace(/("DepotID"\s*")[^"]*(")/, `$1${ids[k]}$2`));
}
fs.writeFileSync(path.join(SP, 'app_build_XXXX.vdf'), app);
console.log('Identifiants écrits :', JSON.stringify(ids), sansMac ? '(sans macOS)' : '');
const reste = /"APPID"|"DEPOTID_/.test(app);
if (reste) console.log('Il reste des identifiants à remplir dans steampipe/app_build_XXXX.vdf.');
