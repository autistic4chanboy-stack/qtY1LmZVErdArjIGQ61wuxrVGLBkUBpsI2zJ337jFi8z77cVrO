// ============================================================================
//  Steam (steamworks.js), côté processus principal. Tout est facultatif :
//  sans Steam lancé, sans bibliothèque, sans identifiant, le jeu tourne quand
//  même et les appels ne font rien.
//  L'identifiant de l'application : app/steam.json (écrit par scripts/prepare.js
//  depuis steam_appid.txt), ou la variable SteamAppId que pose Steam au lancement.
// ============================================================================
'use strict';
const path = require('path');
const fs = require('fs');

let sw = null;       // le module steamworks.js
let client = null;   // le client Steam initialisé
let appId = 0;
let desactive = false;
let raison = '';
const enAttente = new Set(); // succès demandés avant que Steam ne réponde
let statsT = null;

function lireAppId() {
  const env = parseInt(process.env.SteamAppId || process.env.SteamGameId || '', 10);
  if (env > 0) return env;
  for (const f of [path.join(__dirname, 'app', 'steam.json'), path.join(__dirname, 'steam_appid.txt')]) {
    try {
      const txt = fs.readFileSync(f, 'utf8');
      const n = parseInt(f.endsWith('.json') ? JSON.parse(txt).appId : txt.trim(), 10);
      if (n > 0) return n;
    } catch (e) { /* suivant */ }
  }
  return 0;
}

module.exports = {
  // avant app.ready : l'overlay Steam a besoin de deux réglages de Chromium
  preparer(o) {
    desactive = !!(o && o.desactive);
    appId = lireAppId();
    if (desactive) { raison = 'désactivé (--no-steam)'; return; }
    if (!appId) { raison = 'pas d’identifiant d’application'; desactive = true; return; }
    try {
      sw = require('steamworks.js');
    } catch (e) {
      sw = null; raison = 'steamworks.js introuvable : ' + e.message; return;
    }
    if (!(o && o.sansOverlay)) {
      try { sw.electronEnableSteamOverlay(); } catch (e) { /* sans overlay */ }
    }
  },
  demarrer() {
    if (desactive || !sw || client) return;
    try {
      client = sw.init(appId);
      raison = 'ok';
      const nom = client.localplayer && client.localplayer.getName ? client.localplayer.getName() : '';
      console.log('[steam] connecté, application ' + appId + (nom ? ', joueur ' + nom : ''));
      for (const api of enAttente) this.succes(api);
      enAttente.clear();
    } catch (e) {
      client = null;
      raison = 'Steam ne répond pas (non lancé ?) : ' + e.message;
      console.log('[steam] ' + raison);
    }
  },
  arreter() {
    if (client && statsT) { try { client.stats.store(); } catch (e) { /* rien */ } }
  },
  etat() { return { actif: !!client, appId, raison }; },
  succes(api) {
    if (typeof api !== 'string' || !/^[A-Z0-9_]{1,64}$/.test(api)) return false;
    if (!client) { if (sw && !desactive) enAttente.add(api); return false; }
    try {
      if (client.achievement.isActivated(api)) return true;
      return client.achievement.activate(api);
    } catch (e) { console.log('[steam] succès ' + api + ' : ' + e.message); return false; }
  },
  stat(nom, val) {
    if (!client || typeof nom !== 'string' || !/^[A-Z0-9_]{1,64}$/.test(nom)) return false;
    const v = Math.floor(Number(val));
    if (!Number.isFinite(v)) return false;
    try {
      const cur = client.stats.getInt(nom);
      if (cur !== null && cur >= v) return true; // les statistiques ne font que monter
      client.stats.setInt(nom, v);
      clearTimeout(statsT);
      statsT = setTimeout(() => { try { client.stats.store(); } catch (e) { /* rien */ } }, 5000);
      return true;
    } catch (e) { return false; }
  }
};
