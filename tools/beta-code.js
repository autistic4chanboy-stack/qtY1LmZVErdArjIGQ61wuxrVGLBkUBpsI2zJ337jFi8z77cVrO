#!/usr/bin/env node
// Le code de la bêta en ligne (GitHub Pages) : change l'empreinte (SHA-256 de « prairie:<code> ») partout où elle est
// écrite — la page d'accueil (index.html), le gabarit du jeu (src/shell.html) et celui du wiki (tools/wiki-build.js) —,
// puis il faut régénérer le jeu et le wiki :
//   node tools/beta-code.js <nouveau code>
//   node build.js && node tools/wiki-build.js
// Ceux qui étaient entrés avec l'ancien code devront donner le nouveau.
// (Une barrière simple : le code ne figure en clair nulle part, mais une page web publique ne protège pas vraiment
// ce qu'elle contient — qui lit les fichiers du dépôt y a accès.)
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const code = String(process.argv[2] || '').replace(/\s+/g, '');
if (!code) { console.error('usage : node tools/beta-code.js <nouveau code>'); process.exit(1); }
const ROOT = path.join(__dirname, '..');
const neuve = crypto.createHash('sha256').update('prairie:' + code).digest('hex');
const accueil = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const m = accueil.match(/var BETA = '([0-9a-f]{64})'/);
if (!m) { console.error('index.html : empreinte introuvable'); process.exit(1); }
const ancienne = m[1];
let n = 0;
for (const f of ['index.html', 'src/shell.html', 'tools/wiki-build.js']) {
  const p = path.join(ROOT, f), s = fs.readFileSync(p, 'utf8');
  const k = s.split(ancienne).length - 1;
  if (!k) { console.error(f + ' : empreinte introuvable'); process.exit(1); }
  fs.writeFileSync(p, s.split(ancienne).join(neuve));
  n += k;
  console.log(f + ' : ' + k + ' remplacement(s)');
}
console.log(ancienne === neuve ? 'Le code est déjà celui-là.' : `Nouveau code enregistré (${n} endroits). Puis : node build.js && node tools/wiki-build.js`);
