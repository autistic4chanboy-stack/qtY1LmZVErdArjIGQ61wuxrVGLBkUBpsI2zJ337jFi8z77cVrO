// Mesures et vérifications d'équilibrage : node tools/equilibrage.js [domaine …]
// Chaque domaine est un fichier tools/equilibrage/<domaine>.js qui exporte
//   { titre: '…', async verifier(J, log) { …; return { echecs: n } } }
// (J : le jeu chargé dans une machine virtuelle, voir tools/equilibrage/vm.js ; log : affichage).
// Sans argument, tous les domaines passent ; la commande échoue (code 1) si une vérification échoue.
'use strict';
const fs = require('fs');
const path = require('path');
const { charger } = require('./equilibrage/vm.js');

(async () => {
  const dir = path.join(__dirname, 'equilibrage');
  const voulus = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  const doms = fs.readdirSync(dir).filter((f) => f.endsWith('.js') && f !== 'vm.js').map((f) => f.replace(/\.js$/, '')).sort()
    .filter((d) => !voulus.length || voulus.includes(d));
  if (!doms.length) { console.log('Aucun domaine d’équilibrage' + (voulus.length ? ' nommé ' + voulus.join(', ') : '') + '.'); process.exit(voulus.length ? 1 : 0); }
  let echecs = 0;
  for (const d of doms) {
    const m = require(path.join(dir, d + '.js'));
    console.log(`\n=== ${m.titre || d}`);
    const t0 = Date.now();
    try {
      const r = await m.verifier(charger(), (...a) => console.log(...a));
      const e = (r && r.echecs) || 0;
      echecs += e;
      console.log(`--- ${d} : ${e ? e + ' échec(s)' : 'ok'} (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
    } catch (e) { echecs++; console.log(`--- ${d} : ERREUR ${e && e.stack}`); }
  }
  console.log(echecs ? `\n${echecs} vérification(s) en échec.` : '\nToutes les vérifications passent.');
  process.exit(echecs ? 1 : 0);
})();
