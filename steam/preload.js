// ============================================================================
//  Le pont entre le jeu (la page) et l'application (contextIsolation : la page
//  ne voit que window.steamBridge, rien de Node ni d'Electron).
//  window.steamBridge :
//    quit()                      sauvegarde la copie des parties, puis quitte
//    setFullscreen(on), isFullscreen(), onFullscreen(fn)
//    achievement(api)            débloque un succès Steam (sans Steam : rien)
//    stat(nom, valeur)           une statistique Steam entière (qui ne fait que monter)
//    steam()                     { actif, appId, raison }
//    saveDir()                   le dossier des copies de sauvegarde (Steam Cloud)
//    flushSaves()                recopie tout de suite les parties dans ce dossier
//  Les sauvegardes : avant que le jeu ne démarre, si le fichier de sauvegarde est
//  plus récent que le stockage local (Steam Cloud), il le remplace ; ensuite,
//  toutes les 15 s et en quittant, les clés « prairie… » sont recopiées.
// ============================================================================
'use strict';
const { contextBridge, ipcRenderer } = require('electron');

const CLE_T = 'steam.mirror.t'; // l'heure de la dernière copie (hors « prairie… » : jamais recopiée)
const estCle = (k) => typeof k === 'string' && /^prairie/.test(k);

function lireLocal() {
  const keys = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (estCle(k)) keys[k] = localStorage.getItem(k);
    }
  } catch (e) { /* stockage indisponible */ }
  return keys;
}

// ---------------------------------------------------------------- au démarrage : reprendre le fichier s'il est plus récent
(function restaurer() {
  try {
    const d = ipcRenderer.sendSync('saves:lire');
    if (!d || !d.keys) return;
    const tLocal = parseInt(localStorage.getItem(CLE_T) || '0', 10) || 0;
    if (!(d.t > tLocal)) return;
    const avant = lireLocal();
    for (const k in avant) if (!(k in d.keys)) localStorage.removeItem(k);
    for (const k in d.keys) if (estCle(k) && typeof d.keys[k] === 'string') localStorage.setItem(k, d.keys[k]);
    localStorage.setItem(CLE_T, String(d.t));
    console.log('[saves] partie reprise du fichier de sauvegarde (' + Object.keys(d.keys).length + ' clés)');
  } catch (e) { console.error('[saves] reprise impossible : ' + e.message); }
})();

// ---------------------------------------------------------------- la copie
let derniere = null; // l'empreinte de la dernière copie
function empreinte(keys) {
  // rapide : longueur et somme sur des échantillons de chaque valeur (assez pour voir un changement)
  let h = 0;
  for (const k of Object.keys(keys).sort()) {
    const v = keys[k];
    h = (h * 31 + k.length * 7 + v.length) | 0;
    const pas = Math.max(1, Math.floor(v.length / 4096));
    for (let i = 0; i < v.length; i += pas) h = (h * 33 + v.charCodeAt(i)) | 0;
  }
  return h + ':' + Object.keys(keys).length;
}
function copier(sync) {
  const keys = lireLocal();
  if (!Object.keys(keys).length) return false;
  const e = empreinte(keys);
  if (e === derniere) return true;
  const t = Date.now();
  const d = { format: 1, t, keys };
  let ok = true;
  if (sync) ok = ipcRenderer.sendSync('saves:ecrireSync', d);
  else ipcRenderer.send('saves:ecrire', d);
  if (ok) {
    derniere = e;
    try { localStorage.setItem(CLE_T, String(t)); } catch (err) { /* rien */ }
  }
  return ok;
}
setInterval(() => { try { copier(false); } catch (e) { /* rien */ } }, 15000);
window.addEventListener('beforeunload', () => { try { copier(true); } catch (e) { /* rien */ } });
window.addEventListener('pagehide', () => { try { copier(true); } catch (e) { /* rien */ } });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { try { copier(false); } catch (e) { /* rien */ } } });

// ---------------------------------------------------------------- le pont
const auditeursPE = new Set();
ipcRenderer.on('fenetre:pleinEcran', (ev, on) => { for (const fn of auditeursPE) { try { fn(!!on); } catch (e) { /* rien */ } } });

contextBridge.exposeInMainWorld('steamBridge', {
  version: 1,
  quit() {
    // le jeu enregistre la partie (s'il le sait faire), puis on recopie, puis on quitte
    try { copier(true); } catch (e) { /* rien */ }
    ipcRenderer.send('app:quitter');
  },
  setFullscreen(on) { ipcRenderer.send('fenetre:setPleinEcran', !!on); },
  isFullscreen() { return !!ipcRenderer.sendSync('fenetre:estPleinEcran'); },
  onFullscreen(fn) { if (typeof fn === 'function') auditeursPE.add(fn); },
  achievement(api) { if (typeof api === 'string') ipcRenderer.send('steam:succes', api); },
  stat(nom, valeur) { if (typeof nom === 'string') ipcRenderer.send('steam:stat', nom, Number(valeur) || 0); },
  steam() { return ipcRenderer.sendSync('steam:etat'); },
  saveDir() { return ipcRenderer.sendSync('saves:dossier'); },
  flushSaves() { try { return copier(true); } catch (e) { return false; } },
});
