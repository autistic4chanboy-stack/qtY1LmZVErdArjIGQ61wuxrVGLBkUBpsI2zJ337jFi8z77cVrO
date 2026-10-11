// Prépare le dossier app/ de l'application de bureau : node scripts/prepare.js
//  1. construit le jeu (node ../build.js) : il écrit Prairie.html (avec la porte du
//     code de la bêta) et libre/Prairie.html (le même jeu, sans porte) ;
//  2. copie libre/Prairie.html dans app/Prairie.html (la version Steam est TOUJOURS
//     celle sans porte) ;
//  3. vérifie : pas de porte, aucune ressource chargée du réseau (script, feuille de
//     style, police, image, fetch…) ; le jeu doit tourner hors ligne ;
//  4. app/steam.json (l'identifiant d'application, lu dans steam_appid.txt) et app/icon.png.
// Options : --no-build (reprend libre/Prairie.html tel quel).
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const REPO = path.join(ROOT, '..');
const APP = path.join(ROOT, 'app');

if (!process.argv.includes('--no-build')) {
  console.log('Construction du jeu (build.js)…');
  execFileSync(process.execPath, [path.join(REPO, 'build.js')], { cwd: REPO, stdio: 'inherit' });
}
const src = path.join(REPO, 'libre', 'Prairie.html');
if (!fs.existsSync(src)) { console.error('libre/Prairie.html introuvable : lancer node build.js à la racine du dépôt.'); process.exit(1); }
const html = fs.readFileSync(src, 'utf8');

// ---- les vérifications
const pbs = [];
if (html.includes("getItem('prairie.beta')") || html.includes('<!--porte-->')) pbs.push('la porte du code est encore là');
// ressources distantes dans le HTML (balises) et dans le code (fetch, import, XHR, url() CSS, new Audio/Image d'une adresse web)
const motifs = [
  /<script[^>]+src\s*=\s*["']?(https?:)?\/\//i,
  /<link[^>]+href\s*=\s*["']?(https?:)?\/\//i,
  /<img[^>]+src\s*=\s*["']?(https?:)?\/\//i,
  /@import\s+(url\()?["']?(https?:)?\/\//i,
  /url\(\s*["']?https?:\/\//i,
  /fetch\(\s*["'`]https?:/i,
  /\.open\(\s*["'`](GET|POST)["'`]\s*,\s*["'`]https?:/i,
  /import\(\s*["'`]https?:/i,
  /new (Audio|Image|WebSocket|EventSource)\(\s*["'`](https?|wss?):/i,
];
for (const m of motifs) { const r = html.match(m); if (r) pbs.push('ressource distante : ' + r[0].slice(0, 80)); }
if (pbs.length) { console.error('Arrêt :\n - ' + pbs.join('\n - ')); process.exit(1); }

// ---- la copie
fs.mkdirSync(APP, { recursive: true });
fs.writeFileSync(path.join(APP, 'Prairie.html'), html);
let appId = 480;
try { const n = parseInt(fs.readFileSync(path.join(ROOT, 'steam_appid.txt'), 'utf8').trim(), 10); if (n > 0) appId = n; } catch (e) { /* 480 */ }
fs.writeFileSync(path.join(APP, 'steam.json'), JSON.stringify({ appId }) + '\n');
const icone = path.join(ROOT, 'build', 'icons', '512x512.png');
if (!fs.existsSync(icone)) execFileSync(process.execPath, [path.join(__dirname, 'icons.js')], { stdio: 'inherit' });
fs.copyFileSync(icone, path.join(APP, 'icon.png'));
if (appId === 480) console.log('ATTENTION : steam_appid.txt vaut encore 480 (Spacewar, l’application d’essai de Valve) : à remplacer par le vrai identifiant.');
console.log(`app/Prairie.html prêt (${(html.length / 1048576).toFixed(1)} Mo, sans porte, hors ligne), application Steam ${appId}.`);
