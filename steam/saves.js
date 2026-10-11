// ============================================================================
//  Les sauvegardes en fichiers (pour Steam Auto-Cloud), côté processus principal.
//  Le jeu garde tout dans son stockage local (localStorage : clés « prairie… »).
//  preload.js en recopie les clés dans  <userData>/saves/prairie-save.json
//  (régulièrement, et en quittant), et au démarrage, si ce fichier est plus récent
//  que le stockage local (une partie venue d'un autre ordinateur par Steam Cloud),
//  il le remet dans le stockage local avant que le jeu ne démarre.
//  Format : { format: 1, jeu: 'newy', t: <ms>, keys: { clé: valeur brute } }.
//  Écriture sûre : fichier temporaire puis renommage ; l'ancien reste en .bak.
// ============================================================================
'use strict';
const path = require('path');
const fs = require('fs');

const NOM = 'prairie-save.json';
const MAX = 200 * 1024 * 1024; // au-delà, quelque chose ne va pas : on n'écrit pas

function dossier(userData) { return path.join(userData(), 'saves'); }

function lire(userData) {
  const f = path.join(dossier(userData), NOM);
  for (const g of [f, f.replace(/\.json$/, '.bak')]) {
    try {
      const d = JSON.parse(fs.readFileSync(g, 'utf8'));
      if (d && d.format === 1 && d.keys && typeof d.keys === 'object' && d.t > 0) return d;
    } catch (e) { /* absent ou abîmé : le suivant */ }
  }
  return null;
}

function ecrire(userData, d) {
  if (!d || d.format !== 1 || !d.keys || typeof d.keys !== 'object' || !(d.t > 0)) return false;
  for (const k in d.keys) if (!/^prairie/.test(k) || typeof d.keys[k] !== 'string') return false;
  const txt = JSON.stringify({ format: 1, jeu: 'newy', t: d.t, keys: d.keys });
  if (txt.length > MAX) return false;
  const dir = dossier(userData), f = path.join(dir, NOM), tmp = f + '.tmp', bak = f.replace(/\.json$/, '.bak');
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(tmp, txt);
    if (fs.existsSync(f)) { try { fs.copyFileSync(f, bak); } catch (e) { /* tant pis */ } }
    fs.renameSync(tmp, f);
    return true;
  } catch (e) {
    console.error('[saves] écriture impossible : ' + e.message);
    try { fs.unlinkSync(tmp); } catch (e2) { /* rien */ }
    return false;
  }
}

module.exports = {
  NOM,
  lire, ecrire, dossier,
  brancher(ipcMain, userData) {
    ipcMain.on('saves:lire', (ev) => { ev.returnValue = lire(userData); });
    ipcMain.on('saves:ecrire', (ev, d) => { ecrire(userData, d); });
    ipcMain.on('saves:ecrireSync', (ev, d) => { ev.returnValue = ecrire(userData, d); });
    ipcMain.on('saves:dossier', (ev) => { ev.returnValue = dossier(userData); });
  },
};
