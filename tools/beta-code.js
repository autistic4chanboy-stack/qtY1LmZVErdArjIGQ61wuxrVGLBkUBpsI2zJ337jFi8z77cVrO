#!/usr/bin/env node
// Les codes de la bêta en ligne (GitHub Pages) : le jeu a le sien, le wiki le sien. Change l'empreinte (SHA-256 de
// « prairie:<code> » pour le jeu, de « prairie-wiki:<code> » pour le wiki) partout où elle est écrite — la page
// d'accueil (index.html) et le gabarit de la page (src/shell.html pour le jeu, tools/wiki-build.js pour le wiki) —,
// puis il faut régénérer :
//   node tools/beta-code.js jeu <nouveau code>    puis  node build.js
//   node tools/beta-code.js wiki <nouveau code>   puis  node tools/wiki-build.js
// Ceux qui étaient entrés avec l'ancien code devront donner le nouveau. (La partie sans code, libre/, n'a pas de
// porte : les mêmes commandes la régénèrent, sans code.)
// (Une barrière simple : le code ne figure en clair nulle part, mais une page web publique ne protège pas vraiment
// ce qu'elle contient — qui lit les fichiers du dépôt y a accès.)
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const quoi = process.argv[2], code = String(process.argv[3] || '').replace(/\s+/g, '');
const PORTES = {
  jeu: { sel: 'prairie:', varia: 'BETA', fichiers: ['index.html', 'src/shell.html'], puis: 'node build.js' },
  wiki: { sel: 'prairie-wiki:', varia: 'WIKI', fichiers: ['index.html', 'tools/wiki-build.js'], puis: 'node tools/wiki-build.js' },
};
const P = PORTES[quoi];
if (!P || !code) { console.error('usage : node tools/beta-code.js jeu <code>  |  node tools/beta-code.js wiki <code>'); process.exit(1); }
const ROOT = path.join(__dirname, '..');
const neuve = crypto.createHash('sha256').update(P.sel + code).digest('hex');
const accueil = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const m = accueil.match(new RegExp(`var ${P.varia} = '([0-9a-f]{64})'`));
if (!m) { console.error('index.html : empreinte introuvable'); process.exit(1); }
const ancienne = m[1];
if (ancienne === neuve) { console.log('Le code est déjà celui-là.'); process.exit(0); }
for (const f of P.fichiers) {
  const p = path.join(ROOT, f), s = fs.readFileSync(p, 'utf8');
  const k = s.split(ancienne).length - 1;
  if (!k) { console.error(f + ' : empreinte introuvable'); process.exit(1); }
  fs.writeFileSync(p, s.split(ancienne).join(neuve));
  console.log(f + ' : ' + k + ' remplacement(s)');
}
console.log(`Nouveau code (${quoi}) enregistré. Puis : ${P.puis}`);
