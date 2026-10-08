// ============================================================================
//  LE NONOS DU CHIEN (agent Q, treizième vague) : la quête.
//  - Elle commence d'elle-même, une seule fois par partie, un matin (6 h à
//    14 h) où le chien est là depuis au moins deux jours et pas affamé : il
//    cherche autour de sa niche ; quand on s'approche, une courte scène, puis
//    un premier souvenir (11-zzzz-Q-2-scenes.js). Facultative : rien n'attend.
//  - Cinq lieux tirés au hasard à ce moment-là (chaque partie les siens) parmi
//    les lieux-dits connus (NONOS_TYPES, 05-zzzzzQ-nonos.js) : le premier à
//    110–380 m de la ferme, chacun à 150–430 m du précédent, à 140 m au moins
//    des autres, joignables à pied (grille de 11-zzzz7-carte.js), hors de l'eau,
//    des villes et des lieux cachés. À chacun, un indice posé près du lieu
//    (dessiné à la volée, HOOKS.draw ; E dessus, HOOKS.target) : on le trouve,
//    et un souvenir montre le lieu suivant. Au cinquième, le terrier d'un vieux
//    renard, et le nonos. Le chien, s'il vous suit, flaire l'indice.
//  - Rendu au chien (E sur lui, ou il le reconnaît en vous voyant revenir) :
//    une dernière scène ; il a faim deux fois moins vite pour toujours (un
//    repas le tient deux fois plus longtemps ; trois jours sans manger en
//    deviennent six), et on le voit ronger son os près de sa niche.
//  - Le chien meurt pendant la quête : elle s'arrête (les souvenirs restent au
//    carnet). Le chiot adopté ensuite n'hérite pas du nonos (c'était celui de
//    l'autre) ; l'os va avec son chien sous le tertre.
//  État : farm.s.nonos. API : nonos.etape(), nonos.lieu(i), nonos.lieux(),
//  nonos.rendu(), nonos.effet(), nonos.revoir(i). Aucune génération ajoutée.
// ============================================================================
const NONOS_N = 5;
const NONOS_D1 = [110, 380];     // ferme → premier lieu (m)
const NONOS_DN = [150, 430];     // d'un lieu au suivant (m)
const NONOS_SEP = 140;           // écart minimal entre deux lieux de la chaîne (m)
const NONOS_LOIN = 1150;         // aucun lieu à plus de… de la ferme (m)

// ---------------------------------------------------------------- les lieux possibles d'une vallée
function nonosTypeDe(k, L) {
  if (!L || L.under || L.secret || !isFinite(L.x)) return null;
  if (L.c2) return NONOS_TYPES[L.c2] ? L.c2 : null;
  if (NONOS_LM[k]) return NONOS_LM[k];
  for (const [re, t] of NONOS_LM_PREFIXES) if (re.test(k)) return t;
  return null;
}
function nonosCandidats(w) {
  const WL = w.waterLevel, T = w.townInfo, out = [];
  for (const k in w.lm || {}) {
    const L = w.lm[k], t = nonosTypeDe(k, L);
    if (!t) continue;
    if (T && Math.max(Math.abs(L.x - T.x), Math.abs(L.z - T.z)) < 82) continue; // pas dans la ville
    if (w.heightAt(L.x, L.z) - WL > 45) continue;                                // pas dans la montagne
    out.push({ k, t, x: L.x, z: L.z, r: L.r || 5, nom: L.name || '' });
  }
  return out;
}
// un buisson, une touffe haute, un arbre à moins de R mètres (les fleurs ne comptent pas)
function nonosBuisson(w, x, z, R) {
  const G = w.objectsGrid(), C = G.C, m = R + 3;
  const gx0 = clamp(Math.floor((x - m) / C), 0, G.gw - 1), gx1 = clamp(Math.floor((x + m) / C), 0, G.gw - 1);
  const gz0 = clamp(Math.floor((z - m) / C), 0, G.gw - 1), gz1 = clamp(Math.floor((z + m) / C), 0, G.gw - 1);
  for (let gz = gz0; gz <= gz1; gz++) for (let gx = gx0; gx <= gx1; gx++) {
    const c = G.cells[gz * G.gw + gx];
    if (c) for (const i of c) {
      const o = w.objects[i], T = o && OBJ_TYPES[o.t];
      if (!T || T.animal || !w.live(o) || o.h < 1.0 || T.cat === 'Fleurs' || T.cat === 'Champignons') continue;
      if (Math.hypot(o.x - x, o.z - z) < R + (objRadius(T, o) || o.h * 0.35)) return true;
    }
  }
  return false;
}
// un sol où poser un indice : terre ferme, pente douce, joignable, ni mur ni toit ni tronc, ni sous un buisson
function nonosSol(w, A, x, z, rad, props) {
  if (!w.inside(x, z, 24)) return false;
  const h = w.heightAt(x, z);
  if (h < w.waterLevel + 0.35) return false;
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (Math.abs(w.heightAt(x + dx * 1.5, z + dz * 1.5) - h) > 0.85) return false;
  if (A) {
    const i = Math.round(x / A.st), j = Math.round(z / A.st);
    let ok = false;
    for (let b = -1; b <= 1 && !ok; b++) for (let a = -1; a <= 1 && !ok; a++) { const ii = i + a, jj = j + b; if (ii >= 0 && jj >= 0 && ii < A.n && jj < A.n && A.R[jj * A.n + ii] === 1) ok = true; }
    if (!ok) return false;
  }
  let bloque = false;
  w.query(x, z, rad + 1.2, null, (b) => {
    if (bloque || b.hidden || (b.ver && !(b.ver & w.curVer))) return;
    const [lx, lz] = World.blockLocal(b, x, z);
    if (Math.abs(lx) > b.sx / 2 + rad || Math.abs(lz) > b.sz / 2 + rad) return;
    if (b.y + b.sy > h + 0.25 && b.y < h + 14) bloque = true; // un mur, un meuble, un toit au-dessus
  });
  if (bloque) return false;
  // (un tronc à moins d'un mètre et demi volerait la touche E : on s'en écarte)
  const [cx, cz] = w.collideCircle(x, z, h, h + 1.7, rad + 0.5, 0.3);
  if (Math.hypot(cx - x, cz - z) > 0.05) return false;
  if (props) for (const q of props) if (Math.abs(q.x - x) < rad + 1.1 && Math.abs(q.z - z) < rad + 1.1) return false;
  if (nonosBuisson(w, x, z, rad + 0.5)) return false;
  return true;
}
// l'endroit de l'indice, près du lieu (renvoie { x, z } ou null)
function nonosSpot(w, A, c, rnd, terrier, props) {
  const r0 = clamp(c.r * 0.45, 1.5, 6), r1 = clamp(c.r + 4, 6, 15);
  const pres = props ? props.filter((q) => Math.abs(q.x - c.x) < r1 + 8 && Math.abs(q.z - c.z) < r1 + 8) : null;
  for (let k = 0; k < 48; k++) {
    const a = rnd() * TAU, d = r0 + rnd() * (r1 - r0) + (k >= 24 ? 3 : 0);
    const x = c.x + Math.sin(a) * d, z = c.z + Math.cos(a) * d;
    if (nonosSol(w, A, x, z, terrier ? 1.0 : 0.45, pres)) return { x, z };
  }
  return null;
}
// la chaîne des cinq lieux (o : { depart: [x, z], acces, eviter: [{x, z, r}] }) ; null si la vallée n'en offre pas
function nonosChoisir(w, rnd, o) {
  o = o || {};
  const F0 = (w.lm && w.lm.ferme) || (w.farm && w.farm.f) || { x: w.size / 2, z: w.size / 2 };
  const F = o.depart || [F0.x, F0.z];
  const A = o.acces || null, eviter = o.eviter || [];
  const props = (w.props || []).filter((q) => q && !q.gone && isFinite(q.x));
  let C = nonosCandidats(w).filter((c) => Math.hypot(c.x - F[0], c.z - F[1]) < NONOS_LOIN && !eviter.some((e) => Math.hypot(c.x - e.x, c.z - e.z) < (e.r || 0) + 25));
  const spots = new Map();
  const spot = (c, fin) => {
    const key = c.k + (fin ? ':t' : '');
    if (!spots.has(key)) spots.set(key, nonosSpot(w, A, c, rnd, fin, props));
    return spots.get(key);
  };
  for (let essai = 0; essai < 400; essai++) {
    const lache = essai < 200 ? 1 : essai < 320 ? 1.25 : 1.5;
    const ch = [];
    let prev = { x: F[0], z: F[1] };
    for (let i = 0; i < NONOS_N; i++) {
      const [d0, d1] = i === 0 ? NONOS_D1 : NONOS_DN;
      const pool = C.filter((c) => {
        const d = Math.hypot(c.x - prev.x, c.z - prev.z);
        if (d < d0 / lache || d > d1 * lache) return false;
        if (i > 0 && Math.hypot(c.x - F[0], c.z - F[1]) < NONOS_D1[0]) return false;
        for (const q of ch) if (q.k === c.k || Math.hypot(c.x - q.x, c.z - q.z) < NONOS_SEP / lache) return false;
        if (ch.length && ch[ch.length - 1].t === c.t && lache < 1.5) return false; // pas deux fois de suite la même sorte de lieu
        return true;
      });
      if (!pool.length) break;
      const c = pool[(rnd() * pool.length) | 0];
      const sp = spot(c, i === NONOS_N - 1);
      if (!sp) { if (i < NONOS_N - 1 || !spot(c, false)) C = C.filter((q) => q !== c); break; }
      ch.push(Object.assign({}, c, { ix: sp.x, iz: sp.z }));
      prev = c;
    }
    if (ch.length === NONOS_N) return ch;
  }
  return null;
}

// ---------------------------------------------------------------- la quête
const nonos = {
  essai: false,          // essais automatiques : laisse la quête commencer d'elle-même sous un navigateur piloté
  cherche: null,         // le matin où tout commence : le chien cherche (centre de sa ronde)
  scene: null,           // une scène en cours (11-zzzzQ-2-scenes.js) : { chien(e, dt, w, c), draw(buf, sbuf, cam, t) }
  aJouer: null,          // un souvenir à montrer dans un instant : { i, t }
  reconnuT: 0, tickT: 0, yC: {}, tombesC: null, placeC: null,
  S() {
    const s = farm.s;
    if (!s) return null;
    let S = s.nonos;
    if (!S || typeof S !== 'object') S = s.nonos = { e: 0 };
    if (!Array.isArray(S.L)) S.L = [];
    if (!Array.isArray(S.tr)) S.tr = [];
    S.e = S.e | 0;
    return S;
  },
  // -------------------------------------------------------------- API
  etape() { const S = this.S(); return S ? S.e : 0; },
  lieu(i) { const S = this.S(), L = S && S.L[(i | 0) - 1]; return L ? { x: L.x, z: L.z, nom: L.nom } : null; },
  lieux() { const S = this.S(); return S ? S.L.map((L) => ({ x: L.x, z: L.z, nom: L.nom })) : []; },
  rendu() { const S = this.S(); return !!(S && S.rendu); },
  // le chien qui a retrouvé son os, toujours là : il a faim deux fois moins vite
  effet() { const s = farm.s, S = s && s.nonos; return !!(S && S.rendu && !S.ancien && s.dog && s.dog.alive); },
  enCours() { const S = this.S(); return !!(S && S.e >= 1 && S.e <= 5 && !S.fin && S.L.length === NONOS_N); },
  revoir(i) {
    const S = this.S();
    if (!S || cine.on || !S.L[i - 1] || i < 1 || i > (S.e >= 6 ? NONOS_N : S.e)) return false;
    nonosScenes.souvenir(i, false);
    return true;
  },

  // -------------------------------------------------------------- le début
  peutCommencer() {
    const s = farm.s, S = this.S();
    if (!S || S.e !== 0 || S.fin || !chien.vivant() || chien.stade() >= 2) return false;
    if (s.day - (S.adopte || 1) < 2) return false;
    const h = npcs.hour();
    if (h < 6 || h >= 14) return false;
    if (strange.inEnvers() || strange.redNight() || game.player.underground) return false;
    return !!chien.entite();
  },
  tickDebut() {
    if (!this.peutCommencer()) { this.cherche = null; return; }
    if (typeof navigator !== 'undefined' && navigator.webdriver && !this.essai) { this.cherche = null; return; }
    const e = chien.entite(), p = game.player, n = chien.niche();
    if (!this.cherche) { const pres = Math.hypot(n[0] - e.x, n[1] - e.z) < 40; this.cherche = { x: pres ? n[0] : e.x, z: pres ? n[1] : e.z, a: Math.random() * TAU, gratteT: 0, gemitT: 2 }; }
    if (cine.on || ui.panel || game.sleeping || game.dying || game.mode !== 'play' || p.riding) return;
    const fondu = typeof document !== 'undefined' && document.getElementById('fade');
    if (fondu && fondu.classList.contains('open')) return;   // (le réveil, un voyage : on attend d'y voir)
    const d = Math.hypot(e.x - p.pos[0], e.z - p.pos[2]);
    if (d < 9 || (d < 22 && espritVoit(e.x, e.y + 0.4, e.z, 22))) this.commencer();
  },
  // force : pour les essais (n'importe quelle heure)
  commencer(force) {
    const s = farm.s, S = this.S();
    if (!S || S.e !== 0 || S.fin || !chien.vivant() || !chien.entite()) return false;
    if (!force && !this.peutCommencer()) return false;
    S.e = 1; S.j0 = s.day; S.graine = (Math.random() * 4294967296) >>> 0; S.L = []; S.tr = [];
    this.cherche = null;
    nonosScenes.debut();
    return true;
  },
  // les cinq lieux (pendant le noir de la première scène : le calcul de la grille prend une demi-seconde)
  tirer() {
    const S = this.S(), w = game.world;
    if (!S || S.L.length === NONOS_N) return !!S;
    const rnd = mulberry32(S.graine >>> 0);
    const eviter = [];
    try { if (typeof betesParlantes !== 'undefined' && betesParlantes.places) for (const q of betesParlantes.places() || []) if (q && isFinite(q.x)) eviter.push({ x: q.x, z: q.z, r: q.r || 0 }); } catch (e) { console.error(e); }
    const had = !!w._c2acces, A = carte2Acces(w);
    let ch = nonosChoisir(w, rnd, { acces: A, eviter });
    if (!ch && eviter.length) ch = nonosChoisir(w, rnd, { acces: A });
    if (!had) delete w._c2acces;
    if (!ch) { console.warn('nonos : aucun chemin de cinq lieux dans cette vallée'); S.e = 0; S.fin = 'impossible'; return false; }
    const r1 = (v) => Math.round(v * 10) / 10, aube = rnd() < 0.5;
    S.L = ch.map((c, i) => {
      const ph = (NONOS_TYPES[c.t] && NONOS_TYPES[c.t].ph) || [['', '']];
      const matin = (i % 2 === 0) === aube;
      return { k: c.k, t: c.t, nom: c.nom, x: r1(c.x), z: r1(c.z), ix: r1(c.ix), iz: r1(c.iz), r: c.r, h: +((matin ? 6.5 : 16.6) + rnd() * 0.9).toFixed(2), v: (rnd() * ph.length) | 0 };
    });
    this.yC = {};
    return true;
  },

  // -------------------------------------------------------------- les indices
  yIndice(i) {
    if (this.yC[i] !== undefined) return this.yC[i];
    const S = this.S(), L = S.L[i - 1], w = game.world, h = w.heightAt(L.ix, L.iz);
    return (this.yC[i] = w.groundAt(L.ix, L.iz, h + 0.5, 0.6));
  },
  trouver(i) {
    const S = this.S();
    if (!S || S.e !== i || S.fin || cine.on || !S.L[i - 1]) return;
    S.tr[i - 1] = farm.s.day;
    const e = chien.entite();
    if (e && e.dist < 25) { sound.bark && sound.bark(0.5); e.wag = true; }
    if (i < NONOS_N) {
      S.e = i + 1;
      ui.subtitle('', NONOS_INDICES[i - 1].texte(chien.nom()), 6);
      sound.flairer && sound.flairer(0.5);
      this.aJouer = { i: i + 1, t: 2.4 };
    } else nonosScenes.terrier();
  },
  // le terrier a été trouvé : le nonos est dans la sacoche (une seule fois)
  prendreNonos() {
    const S = this.S();
    if (!S || S.e >= 6) return;
    S.e = 6; S.tr[NONOS_N - 1] = farm.s.day;
    farm.give('nonos', 1);
    const L = S.L[NONOS_N - 1];
    if (L && typeof play !== 'undefined' && play.flyer) try { play.flyer('nonos', [L.ix, this.yIndice(NONOS_N) + 0.3, L.iz], 1); } catch (e) { console.error(e); }
    sound.quest && sound.quest(false);
    this.reconnuT = 4;
  },
  // le chien a retrouvé son os
  finRetour() {
    const S = this.S(), s = farm.s;
    if (!S || S.rendu) return;
    farm.take('nonos', 1);
    S.rendu = s.day;
    if (s.dog) s.dog.love = (s.dog.love || 0) + 5;
    const C = chien.C();
    if (C) C.ordre = 'niche';
    try { esprit.changer(3, 'le nonos rendu', 4); } catch (e) { console.error(e); }
    sound.quest && sound.quest(true);
  },

  // -------------------------------------------------------------- le chien
  // true : géré ici ; undefined : la suite (module du chien)
  ia(e, dt, w, c) {
    const S = this.S();
    if (!S) return undefined;
    if (this.scene && this.scene.chien) return this.scene.chien(e, dt, w, c);
    e.ronge = false;
    if (e.mange > 0 || e.gamelle || chien.stade() >= 3 || e.alarm) return undefined;
    if (this.cherche && S.e === 0) return this.iaCherche(e, dt, w, c);
    if (this.enCours()) { const r = this.iaFlaire(e, dt, w, c); if (r) return r; }
    if (S.e === 6 && !S.rendu && !S.fin && farm.count('nonos')) { const r = this.iaReconnait(e, dt, w, c); if (r) return r; }
    if (S.rendu && this.effet()) return this.iaRonge(e, dt, w, c);
    return undefined;
  },
  // il tourne en rond, le nez dans l'herbe, gratte, gémit
  iaCherche(e, dt, w, c) {
    const K = this.cherche;
    K.a += dt * 0.9;
    K.gratteT -= dt;
    e.grazeT = 1; e.wag = false; e.lookY = Math.sin((game.time || 0) * 1.7) * 0.35;
    if (K.gratteT < -2.6) K.gratteT = 0.9 + Math.random() * 0.6;
    if (K.gratteT > 0) { e.move = 0.4; e.phase += dt * 16; e.state = 'idle'; return true; }
    const x = K.x + Math.sin(K.a) * 1.3, z = K.z + Math.cos(K.a) * 1.3;
    chien.marcher(e, dt, w, x, z, false);
    e.move = 0.6;
    K.gemitT -= dt;
    if (K.gemitT <= 0) { K.gemitT = 7 + Math.random() * 6; if (e.dist < 30) sound.gemissement && sound.gemissement(clamp(1 - e.dist / 30, 0.2, 1) * 0.8, 0); }
    return true;
  },
  // s'il vous suit, près de l'indice, il le flaire
  iaFlaire(e, dt, w, c) {
    const S = this.S(), C = chien.C(), L = S.L[S.e - 1];
    if (!C || C.ordre !== 'suivre') return undefined;
    const dp = Math.hypot(L.ix - c.px, L.iz - c.pz), dc = Math.hypot(L.ix - e.x, L.iz - e.z);
    if (dp > 32 || dc > 45) return undefined;
    const t = game.time || 0, K = e.flaire || (e.flaire = { a: Math.random() * TAU, ouafT: 3 });
    if (dc > 1.6) { chien.marcher(e, dt, w, L.ix + Math.sin(K.a) * 0.9, L.iz + Math.cos(K.a) * 0.9, dc > 8); e.grazeT = dc < 6 ? 1 : 0; e.wag = true; return true; }
    K.a += dt * 0.7;
    e.move = 0.25; e.phase += dt * 3; e.state = 'idle'; e.grazeT = 1; e.wag = true;
    e.heading = turnToward(e.heading, Math.atan2(L.ix - e.x, L.iz - e.z) + Math.sin(t * 1.3) * 0.6, dt * 3);
    K.ouafT -= dt;
    if (K.ouafT <= 0) { K.ouafT = 5 + Math.random() * 4; if (Math.random() < 0.5) sound.bark && sound.bark(0.3); else sound.flairer && sound.flairer(clamp(1 - e.dist / 20, 0.15, 0.7)); }
    return true;
  },
  // le nonos dans la sacoche : il le sent, il accourt
  iaReconnait(e, dt, w, c) {
    if (this.reconnuT > 0 || chien.stade() >= 3 || c.inside) return undefined;
    if (e.dist > 14 && !(chien.C().ordre === 'suivre' && e.dist < 40)) return undefined;
    const K = e.reconnait || (e.reconnait = { ouaf: false });
    if (!K.ouaf) { K.ouaf = true; sound.bark && sound.bark(0.8); }
    const p = game.player, dp = Math.hypot(e.x - p.pos[0], e.z - p.pos[2]) || 1;
    const tx = p.pos[0] + (e.x - p.pos[0]) / dp * 1.3, tz = p.pos[2] + (e.z - p.pos[2]) / dp * 1.3, d = Math.hypot(tx - e.x, tz - e.z);
    e.wag = true; e.grazeT = 0;
    if (d > 0.5) chien.marcher(e, dt, w, tx, tz, d > 3);
    else { e.move = 0; e.state = 'idle'; e.heading = turnToward(e.heading, Math.atan2(p.pos[0] - e.x, p.pos[2] - e.z), dt * 6); }
    if (e.dist < 2.6 && !cine.on && !ui.panel && !game.sleeping && !game.dying && game.mode === 'play') { e.reconnait = null; nonosScenes.retour(e); }
    return true;
  },
  // l'os retrouvé : il le ronge près de sa niche (quand vous n'êtes pas là, et souvent quand vous y êtes)
  iaRonge(e, dt, w, c) {
    const C = chien.C(), n = nonosPlaceOs(), d = Math.hypot(n[0] - e.x, n[1] - e.z);
    let veut = C.ordre === 'niche';
    if (C.ordre === 'libre') { const cyc = ((game.time || 0) + (e.seed || 0) * 10) % 170; veut = c.night < 0.6 && (c.inside || e.dist > 30 || cyc < 100); }
    if (!veut) return undefined;
    if (d > 0.7) { chien.marcher(e, dt, w, n[0], n[1], d > 12); e.wag = false; return true; }
    const t = game.time || 0, cap = n[2];
    e.move = 0; e.state = 'sheltered'; e.wag = false; e.ronge = true;
    if (cap !== null) e.heading = turnToward(e.heading, cap, dt * 3);
    // (couché, la tête presque à plat : un peu plus, et le museau — et l'os — passeraient sous terre)
    e.grazeT = 0.1 + 0.22 * Math.max(0, Math.sin(t * 2.3 + (e.seed || 0)));
    e.lookY = Math.sin(t * 0.7 + (e.seed || 0)) * 0.3;
    return true;
  },
  // E sur le chien : les choix en plus (avant ceux du module du chien)
  optionsChien(e) {
    const S = this.S(), out = [];
    if (!S || !farm.count('nonos')) return out;
    if (S.e === 6 && !S.rendu && !S.fin && !S.ancien) out.push({ label: 'Lui rendre son nonos', fn: () => { ui.close(true); nonosScenes.retour(e); } });
    else if (S.ancien || S.fin) out.push({ label: 'Lui montrer le vieil os', fn: () => { ui.close(); ui.subtitle('', `(${chien.nom()} renifle l’os, puis s’en détourne. Ce n’était pas le sien.)`, 4); } });
    return out;
  },
  nouveauChien() {
    const S = this.S();
    if (!S) return;
    S.adopte = farm.s.day;
    if (S.e > 0) S.ancien = 1;
  },

  // -------------------------------------------------------------- le temps qui passe
  tick(dt) {
    const S = this.S(), s = farm.s;
    if (!S) return;
    // une partie sauvegardée pendant la scène du début, avant le tirage : on tire les lieux (le premier souvenir se revoit au carnet)
    if (S.e >= 1 && S.e <= NONOS_N && !S.fin && S.L.length !== NONOS_N && !cine.on) { if (!S.graine) S.graine = (Math.random() * 4294967296) >>> 0; S.L = []; this.tirer(); }
    // le chien est mort en chemin : la quête s'arrête
    if (S.e >= 1 && !S.rendu && !S.fin && !chien.vivant()) { S.fin = 'mort'; S.finJ = s.day; this.aJouer = null; }
    // l'os rendu, le chien mort et enterré : l'os est avec lui
    if (S.rendu && !S.enterre && !chien.vivant() && s.chien && s.chien.mort && s.chien.mort.enterre === true) S.enterre = 1;
    if (S.e === 0 && !S.fin) this.tickDebut(); else this.cherche = null;
    if (this.reconnuT > 0) this.reconnuT -= dt;
  },
  update(dt) {
    if (!farm.s || game.mode !== 'play' || game.dying) return;
    const A = this.aJouer;
    if (A) {
      A.t -= dt;
      if (A.t <= 0 && !cine.on && !ui.panel && !game.sleeping) { this.aJouer = null; if (this.etape() === A.i) nonosScenes.souvenir(A.i, true); }
    }
    if (game.sleeping) return;
    this.tickT -= dt;
    if (this.tickT > 0) return;
    const step = 0.3 - this.tickT;
    this.tickT = 0.3;
    this.tick(step);
  },

  // -------------------------------------------------------------- ce qu'on voit
  draw(buf, sbuf, cam, t) {
    const S = this.S(), w = game.world;
    PE.buf = buf; PE.fl = 0;
    if (!S || !w || !S.L.length || (typeof strange !== 'undefined' && strange.inEnvers())) { if (this.scene && this.scene.draw) this.scene.draw(buf, sbuf, cam, t); return; }
    // l'indice en cours (et le terrier, qui reste) ; pas pendant un souvenir : il faut le chercher sur place
    if (!S.fin && S.e >= 1 && !nonosScenes.mem) {
      const i = Math.min(S.e, NONOS_N), L = S.L[i - 1];
      if (L && Math.hypot(L.ix - cam[0], L.iz - cam[2]) < 70) this.dessinerIndice(i, L, cam, t, S.e > NONOS_N);
    }
    if (S.rendu && !S.enterre) this.dessinerOs(buf, cam, t);
    if (this.scene && this.scene.draw) this.scene.draw(buf, sbuf, cam, t);
    PE.fl = 0;
  },
  // l'indice luit à peine quand on le regarde de près
  lueur(L, i, t) {
    const tg = game.target;
    if (tg && tg.nonos === i) return FX_HI;
    const p = game.player, e = p.eyePos(), dx = L.ix - e[0], dz = L.iz - e[2], d = Math.hypot(dx, dz);
    if (d > 4.5 || d < 0.5) return 0;
    const f = cinAvant();
    if ((dx * f[0] + dz * f[2]) / d < 0.8) return 0;
    return (t % 1.7) < 0.14 ? FX_HI : 0;
  },
  dessinerIndice(i, L, cam, t, vide) {
    const y = this.yIndice(i), r = ((L.ix * 7.31 + L.iz * 3.17) % TAU);
    PE.frame(L.ix, y, L.iz, r, 1);
    PE.fl = vide ? 0 : this.lueur(L, i, t);
    const id = NONOS_INDICES[i - 1].id;
    if (id === 'poils') {
      const br = rgbf('#4a3a24'), roux = rgbf('#c0602a'), clair = rgbf('#e6d6b8');
      PE.box(0, 0.16, 0, 0.022, 0.34, 0.022, br, TL.bark, 0, 0.22, 0.1);
      PE.box(0.06, 0.24, 0.02, 0.016, 0.2, 0.016, br, TL.bark, 0, -0.5, 0.6);
      PE.box(-0.05, 0.12, 0.03, 0.016, 0.16, 0.016, br, TL.bark, 0, 0.4, -0.7);
      PE.box(0.02, 0.27, 0.01, 0.11, 0.07, 0.07, roux, TL.fur, 0.4, 0.2, 0.3);
      PE.box(0.07, 0.25, 0.02, 0.07, 0.05, 0.05, roux, TL.fur, -0.3, 0.1, 0.5);
      PE.box(0.1, 0.24, 0.03, 0.04, 0.035, 0.035, clair, TL.fur, 0, 0, 0.8);
      PE.box(-0.03, 0.02, 0.06, 0.09, 0.03, 0.05, roux, TL.fur, 0.6);
    } else if (id === 'os_poulet') {
      const os = rgbf('#e8dcc0'), plume = rgbf('#c8b490'), sombre = rgbf('#5a4430');
      PE.box(0, 0.018, 0, 0.17, 0.025, 0.025, os, TL.bone, 0.5);
      PE.box(0.03, 0.02, 0.05, 0.12, 0.022, 0.022, os, TL.bone, -0.7);
      PE.box(-0.08, 0.02, -0.02, 0.035, 0.035, 0.03, os, TL.bone);
      PE.box(0.1, 0.006, -0.08, 0.13, 0.006, 0.04, plume, TL.plain, 1.1);
      PE.box(-0.12, 0.006, 0.09, 0.11, 0.006, 0.035, sombre, TL.plain, -0.4);
      PE.box(0.18, 0.006, 0.12, 0.09, 0.006, 0.03, plume, TL.plain, 0.3);
    } else if (id === 'empreintes') {
      // chaque empreinte épouse le sol (une plaque d'un seul tenant flotterait sur la pente)
      const w = game.world, boue = rgbf('#6a5238'), trace = rgbf('#3a2c1e'), c = Math.cos(r), sn = Math.sin(r);
      for (let k = 0; k < 8; k++) {
        const lz = -1.1 + k * 0.31, lx = (k % 2 ? 0.05 : -0.05) + Math.sin(k * 1.7) * 0.02;
        const x = L.ix + lx * c + lz * sn, z = L.iz - lx * sn + lz * c, h = w.heightAt(x, z);
        PE.frame(x, w.groundAt(x, z, h + 0.4, 0.5), z, r, 1);
        PE.box(0, 0.006, 0.01, 0.17, 0.008, 0.21, boue, TL.soilWet);
        PE.box(0, 0.011, -0.02, 0.065, 0.006, 0.075, trace, TL.plain);
        for (let d = 0; d < 4; d++) PE.box((d - 1.5) * 0.028, 0.011, 0.045 + (d === 0 || d === 3 ? -0.012 : 0), 0.021, 0.006, 0.025, trace, TL.plain);
      }
    } else if (id === 'ruban') {
      const rouge = rgbf('#a8161c');
      PE.box(0, 0.012, 0, 0.16, 0.008, 0.035, rouge, TL.cloth, 0.3);
      PE.box(0.13, 0.012, 0.05, 0.14, 0.008, 0.035, rouge, TL.cloth, -0.6);
      PE.box(-0.12, 0.016, -0.04, 0.12, 0.008, 0.035, rouge, TL.cloth, 0.9, 0, 0.15);
      PE.box(0.22, 0.012, 0.13, 0.06, 0.008, 0.03, rgbf('#7a1014'), TL.cloth, 0.2);
    } else this.dessinerTerrier(S_terrierAvecOs(this.S()));
    PE.fl = 0;
  },
  // le terrier (repère local déjà posé) ; avecOs : le nonos devant l'entrée
  dessinerTerrier(avecOs) {
    // une motte de terre ronde (des boîtes tournées les unes sur les autres), des racines au-dessus du trou
    const terre = rgbf('#8a6844'), terre2 = rgbf('#7a5a3a'), herbe = rgbf('#5a7a34'), racine = rgbf('#5a4430'), noir = [0.04, 0.03, 0.025];
    PE.box(0, 0.13, 0.15, 1.9, 0.26, 1.5, terre, TL.soil, 0.1);
    PE.box(0, 0.13, 0.15, 1.6, 0.26, 1.7, terre2, TL.soil, 0.9);
    PE.box(0.05, 0.36, 0.25, 1.3, 0.22, 1.1, terre, TL.soil, -0.35);
    PE.box(0.05, 0.36, 0.25, 1.1, 0.22, 1.25, terre2, TL.soil, 0.45);
    PE.box(0.08, 0.54, 0.3, 0.75, 0.16, 0.7, terre, TL.soil, 0.2);
    PE.box(0.1, 0.65, 0.32, 0.5, 0.08, 0.5, herbe, TL.leaves, -0.3);
    PE.box(-0.5, 0.3, 0.5, 0.35, 0.1, 0.3, herbe, TL.leaves, 0.6);
    // le trou, et les racines qui le surplombent
    PE.box(0, 0.2, -0.58, 0.5, 0.36, 0.12, noir, TL.plain);
    PE.box(0, 0.17, -0.5, 0.36, 0.3, 0.12, noir, TL.plain);
    PE.box(0, 0.42, -0.62, 0.62, 0.05, 0.05, racine, TL.bark, 0, 0, 0.15);
    PE.box(0.18, 0.33, -0.66, 0.04, 0.22, 0.04, racine, TL.bark, 0, 0.3, 0.4);
    PE.box(-0.2, 0.36, -0.64, 0.04, 0.18, 0.04, racine, TL.bark, 0, -0.2, -0.5);
    PE.box(0, 0.006, -1.0, 1.0, 0.012, 0.75, rgbf('#5a4430'), TL.soilWet);
    PE.box(-0.32, 0.012, -1.05, 0.15, 0.012, 0.035, rgbf('#a8a8b0'), TL.metal, 0.6);      // une cuillère
    PE.box(-0.25, 0.014, -1.0, 0.045, 0.02, 0.035, rgbf('#a8a8b0'), TL.metal, 0.6);
    PE.box(0.36, 0.025, -1.12, 0.05, 0.05, 0.05, rgbf('#c09a3a'), TL.gold, 0.3);          // un grelot
    PE.box(0.18, 0.014, -1.3, 0.1, 0.022, 0.13, rgbf('#8a3a34'), TL.wool, -0.4);         // un petit gant de laine
    PE.box(0.12, 0.014, -1.22, 0.035, 0.02, 0.06, rgbf('#8a3a34'), TL.wool, 0.3);
    if (avecOs) nonosOsLocal(-0.02, 0.0, -0.98, 0.5);
  },
  // l'os près de la niche, ou dans la gueule du chien qui le ronge
  dessinerOs(buf, cam, t) {
    const e = chien.entite();
    if (e && e.ronge && !e.removed && e.rig && Math.hypot(e.x - cam[0], e.z - cam[2]) < 60) { nonosOsGueule(e); return; }
    const n = nonosPlaceOs();
    if (Math.hypot(n[0] - cam[0], n[1] - cam[2]) > 60) return;
    const w = game.world, x = n[0] + 0.45, z = n[1] + 0.25, h = w.heightAt(x, z);
    PE.frame(x, w.groundAt(x, z, h + 0.5, 0.6), z, 0.7, 1.4);
    nonosOsLocal(0, 0, 0, 0);
  },

  // -------------------------------------------------------------- E : l'indice, le terrier, la tombe
  target(eye, f, cand) {
    const S = this.S();
    if (!S || cine.on || (typeof strange !== 'undefined' && strange.inEnvers())) return;
    if (this.enCours()) {
      const i = S.e, L = S.L[i - 1], y = this.yIndice(i);
      const dx = L.ix - eye[0], dy = y + (i === NONOS_N ? 0.3 : 0.08) - eye[1], dz = L.iz - eye[2], d = Math.hypot(dx, dy, dz);
      const R = i === NONOS_N ? 2.9 : 2.6, cos = (dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1);
      if (d < R && cos > (i === NONOS_N ? 0.62 : 0.74)) cand({ kind: 'hook', nonos: i, use: () => this.trouver(i) }, d);
    }
    // l'os de son chien mort, posé sur sa tombe
    if (farm.count('nonos') && (S.fin === 'mort' || S.ancien || (S.rendu && !chien.vivant()))) {
      const q = this.tombe(eye);
      if (q) {
        const dx = q.x - eye[0], dy = q.y + 0.2 - eye[1], dz = q.z - eye[2], d = Math.hypot(dx, dy, dz);
        if (d < 2.6 && (dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1) > 0.7) cand({ kind: 'hook', use: () => this.poserSurTombe() }, d + 0.05);
      }
    }
  },
  tombe(eye) {
    const now = performance.now(), w = game.world;
    if (!this.tombesC || this.tombesC.w !== w || now - this.tombesC.t > 3000) this.tombesC = { w, t: now, v: w.props.filter((q) => q.id === 'tombe_chien' && !q.gone) };
    let best = null, bd = 4;
    for (const q of this.tombesC.v) { const d = Math.hypot(q.x - eye[0], q.z - eye[2]); if (d < bd) { bd = d; best = q; } }
    return best;
  },
  poserSurTombe() {
    const S = this.S();
    if (!S || !farm.take('nonos', 1)) return;
    S.tombe = farm.s.day;
    sound.place && sound.place();
    ui.subtitle('', '(Vous posez son os sur le tertre.)', 4);
    try { esprit.changer(1, 'deuil', 2); } catch (e) { console.error(e); }
  },
  // -------------------------------------------------------------- essais
  etat() {
    const S = this.S();
    return S ? { e: S.e, j0: S.j0, fin: S.fin || null, rendu: S.rendu || 0, ancien: !!S.ancien, lieux: S.L.map((L) => [L.k, L.t, Math.round(L.x), Math.round(L.z), Math.round(L.ix), Math.round(L.iz), L.h]), effet: this.effet() } : null;
  },
};
// le nonos du terrier n'est dessiné que tant qu'on ne l'a pas pris
function S_terrierAvecOs(S) { return !!(S && S.e === NONOS_N); }
// le cap du chien couché à sa niche : celui de la niche posée, sinon le dos à la maison (sur le seuil)
function nonosCapNiche(n) {
  if (n[2] !== null && n[2] !== undefined) return n[2];
  const B = game.world && game.world.bld && game.world.bld.ferme;
  return B ? Math.atan2(n[0] - B.x, n[1] - B.z) : null;
}
// là où il ronge son os : devant sa niche ; sans niche, devant le seuil, de préférence sur la terre battue (l'herbe y
// cacherait l'os), jamais contre la porte ; [x, z, cap, posée] (mis en cache : chien.niche() change rarement)
function nonosPlaceOs() {
  const n = chien.niche(), cap = nonosCapNiche(n), w = game.world;
  if (n[3] || cap === null) return [n[0], n[1], cap, n[3]];
  const K = nonos.placeC;
  if (K && K.w === w && K.x === n[0] && K.z === n[1]) return K.v;
  let v = null;
  for (const d of [1.4, 1.9, 2.5, 1.1]) {
    for (const da of [0, 0.5, -0.5, 1.0, -1.0, 1.45, -1.45]) {
      const a = cap + da, x = n[0] + Math.sin(a) * d, z = n[1] + Math.cos(a) * d;
      if (w.matAt(x, z) < M_DIRT || !nonosSol(w, null, x, z, 0.3, null)) continue;
      v = [x, z, cap, false];
      break;
    }
    if (v) break;
  }
  if (!v) v = [n[0] + Math.sin(cap) * 1.4, n[1] + Math.cos(cap) * 1.4, cap, false];
  nonos.placeC = { w, x: n[0], z: n[1], v };
  return v;
}

// ---------------------------------------------------------------- l'os (dessin), dans le repère courant de PE
function nonosOsLocal(x, y, z, r) {
  const os = rgbf('#e2d4b2'), noirci = rgbf('#5a4a36');
  PE.box(x, y + 0.024, z, 0.22, 0.045, 0.05, os, TL.bone, r);
  const c = Math.cos(r), s = Math.sin(r);
  for (const k of [-1, 1]) {
    const bx = x + c * 0.125 * k, bz = z - s * 0.125 * k;
    PE.box(bx - s * 0.026, y + 0.032, bz - c * 0.026, 0.055, 0.062, 0.045, k > 0 ? noirci : os, TL.bone, r);
    PE.box(bx + s * 0.026, y + 0.032, bz + c * 0.026, 0.055, 0.062, 0.045, k > 0 ? noirci : os, TL.bone, r);
  }
}
// dans la gueule du chien (repère de sa tête, tel que le squelette vient d'être dessiné)
function nonosOsGueule(e) {
  const head = e.rig && e.rig.part('head');
  if (!head || !head.W) return;
  // en travers de la gueule, sous la truffe, un peu plus gros que nature pour qu'on le voie dépasser des deux côtés
  const M = PE.M;
  M.set(head.W);
  const s = 1.35;
  for (let k = 0; k < 3; k++) { M[k * 4] *= s; M[k * 4 + 1] *= s; M[k * 4 + 2] *= s; }
  nonosOsLocal(0, -0.12 / s, 0.33 / s, 0);   // (sous la truffe : y −0,12, z +0,33 dans le repère de la tête)
}

// ---------------------------------------------------------------- points d'accroche
{
  // la faim : deux fois moins vite, et un repas tient deux fois plus longtemps (le plafond aussi)
  const _faim = chien.faim.bind(chien);
  chien.faim = function () { const h = _faim(); return nonos.effet() ? h / 2 : h; };
  const _repas = chien.repas.bind(chien);
  chien.repas = function (h, main) {
    if (!nonos.effet()) return _repas(h, main);
    const s = farm.s, C = this.C(), R0 = C ? C.rassasie : s.hours;
    const r = _repas(h, main);
    if (C) C.rassasie = Math.min(s.hours + 72, Math.max(R0, s.hours) + 2 * h);
    return r;
  };
  // E sur le chien : rendre le nonos (en tête des choix)
  const _parler = chien.parler.bind(chien);
  chien.parler = function (e) {
    let extra = [];
    try { extra = nonos.optionsChien(e); } catch (err) { console.error(err); }
    if (!extra.length) return _parler(e);
    const _ch = ui.choice;
    ui.choice = function (t, d, opts) { ui.choice = _ch; return _ch.call(ui, t, d, extra.concat(opts)); };
    try { return _parler(e); } finally { ui.choice = _ch; }
  };
  // un chiot : il n'hérite pas du nonos
  const _adopter = chien.adopter.bind(chien);
  chien.adopter = function (nom) { const r = _adopter(nom); if (r) try { nonos.nouveauChien(); } catch (err) { console.error(err); } return r; };
  // ce que fait le chien
  const _ia = chien.ia.bind(chien);
  chien.ia = function (e, dt, w, c) {
    let r;
    try { r = nonos.ia(e, dt, w, c); } catch (err) { console.error(err); r = undefined; }
    return r === undefined ? _ia(e, dt, w, c) : r;
  };
}
HOOKS.update.push((dt) => { try { nonos.update(dt); } catch (e) { console.error(e); } });
HOOKS.draw.push((buf, sbuf, cam, t) => { if (farm.s && game.world) nonos.draw(buf, sbuf, cam, t); });
HOOKS.target.push((eye, f, cand) => { if (farm.s && game.world) nonos.target(eye, f, cand); });
HOOKS.load.push((saved) => {
  const S = nonos.S();
  if (!S) return;
  if (!S.adopte) S.adopte = 1;
  nonos.cherche = null; nonos.scene = null; nonos.aJouer = null; nonos.reconnuT = 0; nonos.yC = {}; nonos.tombesC = null; nonos.placeC = null;
  // une partie chargée au milieu d'un souvenir à venir : il attendra qu'on le revoie au carnet
});
