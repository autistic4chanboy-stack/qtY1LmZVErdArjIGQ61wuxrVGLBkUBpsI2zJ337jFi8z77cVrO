// ============================================================================
//  LE HASARD DE LA VALLÉE (agent F, douzième vague) : soixante et un
//  événements nouveaux, rares ou peu fréquents, qui s'ajoutent au calendrier,
//  aux prodiges et à l'étrange (11-zzz40-evenements.js, 11-strange.js…) sans
//  les refaire : le ciel et le temps, les bêtes, la vie des villages, la
//  ferme, les routes, l'étrange (11-zzzzF-1-ciel.js … 11-zzzzF-6-etrange.js ;
//  les textes dans chaque définition, txt ; les sons : 09-zzzzF-sons.js).
//  - Chacun a sa condition (le lieu, l'heure, le temps du jour, le jour de la
//    semaine, ce que le joueur a ou a fait), quelque chose à voir, à entendre
//    ou à faire, une fin propre, et une trace : les habitants en parlent deux
//    jours ; le carnet de la sacoche en garde une ligne (« Ce qui est arrivé »).
//  - Deux façons d'arriver, mesurées par tools/equilibrage/F.js :
//    · le TIRAGE DU JOUR, à l'aube, déterministe (la graine et le jour) : un
//      événement certains jours, rarement deux, à une heure tirée dans sa
//      fenêtre ; s'il ne peut pas avoir lieu (on dort, on est ailleurs), il
//      se fait sans nous (on l'apprend le lendemain) ou pas du tout ;
//    · AU FIL DU TEMPS, là où l'on est (près d'un puits la nuit, au bord du
//      lac, dans les bois au crépuscule…) : tant de fois par heure de jeu
//      passée là (hasardHeure), jamais par image.
//  - En tout, environ un par jour de jeu ; jamais plus de deux le même jour,
//    jamais deux à moins d'une heure et demie de jeu l'un de l'autre.
//  État : farm.s.evF = { v, plan, demain, derniers, n, long, journal, recents,
//         jourN, dernierH, bienfaits, photos }.
//  API : hasardF (S(), planJour(d), lancer(id), arreter(E), declencher(id, o),
//        fin(id), noter(E, texte), retenir(id), ligne(), liste()) ; HF (les
//        définitions), hfDef(id, déf).
//  Essais : hasardF.declencher(id) — aussi evenements.declencher(id).
// ============================================================================
const HF = {};
const HF_IDS = [];
const HF_CATS = { ciel: 'Le ciel et le temps', betes: 'Les bêtes', village: 'La vie des villages', ferme: 'La ferme', routes: 'Les routes', etrange: 'L’étrange' };
// les fréquences (mesurées par tools/equilibrage/F.js ; voir le README, « Le hasard »)
const HF_FREQ = {
  jour: 0.5,      // chance, chaque jour, qu'un événement soit tiré (parmi ceux que le jour permet)
  second: 0.1,    // chance d'en tirer un second le même jour
  maxJour: 2,     // jamais plus de deux le même jour, tirés au jour et au fil du temps confondus
  ecartH: 1.5,    // heures de jeu au moins entre deux débuts
  premier: 3,     // rien avant le troisième jour (la découverte de la ferme), sauf mention contraire
  ecart: 12,      // jours au moins entre deux fois le même (sauf mention contraire)
};
// une définition : { cat, tirage: 'jour' | 'heure', poids | parHeure, etrange, premier, ecart, fois, h: [début, fin],
//   heure(c, r), fenetre, peut(c), pret(X), ici(X), ou, lancer(E), maj(E, dt, X), dessin(E, buf, sbuf, cam, t),
//   lum(E, eye), ciel(E, sky), ecran(E, fx, tint), fin(E, raison), sansNous(e, d), duree, annonce, public, restaurer(L) }
function hfDef(id, D) {
  D.id = id;
  D.tirage = D.tirage || 'jour';
  HF[id] = D; HF_IDS.push(id);
  return D;
}
// les textes d'un événement : dans sa définition (txt : { journal, pendant, apres, avant }) ou dans HF_TEXTES
const hfT = (id) => (HF[id] && HF[id].txt) || (typeof HF_TEXTES !== 'undefined' && HF_TEXTES[id]) || {};
const hfBiz = () => (typeof bizarrerie === 'function' ? bizarrerie() : 1);

// ---------------------------------------------------------------- petits outils du monde (à l'exécution)
function hfSol(x, z) { const w = game.world; return Math.max(w.heightAt(x, z), w.waterLevel); }
function hfY(x, z, y0) { const w = game.world, h = w.heightAt(x, z); return w.groundAt(x, z, (y0 === undefined ? h : y0) + 0.9, 0.6); }
function hfDistJ(x, z) { const p = game.player.pos; return Math.hypot(x - p[0], z - p[2]); }
function hfAilleurs() { return (typeof mondes !== 'undefined' && !!mondes.cur) || (typeof souterrain !== 'undefined' && souterrain.actif) || strange.inEnvers(); }
function hfDehors() {
  const p = game.player, w = game.world, e = p.eyePos();
  return !p.underground && !hfAilleurs() && !w.covered(e[0], e[1], e[2]);
}
// le joueur regarde-t-il vers (x, y, z) ? (cmin : cosinus de l'angle)
function hfRegarde(x, y, z, cmin) {
  const p = game.player, e = p.eyePos(), f = cameraBasis(p.yaw, p.pitch).f;
  const dx = x - e[0], dy = y - e[1], dz = z - e[2], d = Math.hypot(dx, dy, dz) || 1;
  return (dx * f[0] + dy * f[1] + dz * f[2]) / d > (cmin || 0.8);
}
// un endroit dégagé : terre ferme, pente douce, ni mur ni arbre, hors des zones où l'on ne bâtit pas si demandé
function hfLibre(x, z, r, o) {
  const w = game.world;
  o = o || {};
  if (!w.inside(x, z, 30) || w.heightAt(x, z) < w.waterLevel + (o.eau ?? 0.4) || w.normalAt(x, z)[1] < (o.pente ?? 0.85)) return false;
  if (o.horsVillage && typeof interditDeBatir === 'function' && interditDeBatir(x, z, 4)) return false;
  if (!pointFree(w, x, z, r || 0.8)) return false;
  if (o.arbres !== false) {
    let hit = false;
    w.query(x, z, (r || 0.8) + 1.2, (ob) => { if (hit || ob.gone || ob.cleared) return; const T = OBJ_TYPES[ob.t]; if (T && T.col > 0 && Math.hypot(ob.x - x, ob.z - z) < (r || 0.8) + T.col + 0.3) hit = true; }, null);
    if (hit) return false;
  }
  return true;
}
// un point libre entre r0 et r1 de (cx, cz) ; a : direction privilégiée (radians) ; test(x, z) facultatif
function hfPoint(cx, cz, r0, r1, o) {
  o = o || {};
  for (let k = 0; k < (o.essais || 40); k++) {
    const a = o.a !== undefined ? o.a + (Math.random() - 0.5) * (o.ouv || 1.2) : Math.random() * TAU, r = r0 + Math.random() * (r1 - r0);
    const x = cx + Math.sin(a) * r, z = cz + Math.cos(a) * r;
    if (!hfLibre(x, z, o.r, o)) continue;
    if (o.test && !o.test(x, z)) continue;
    return { x, z, y: hfY(x, z) };
  }
  return null;
}
// les nœuds de chemin (graphe des habitants), gardés par monde
function hfNoeuds(tag) {
  const w = game.world, C = w._hfNoeuds || (w._hfNoeuds = {});
  if (C[tag]) return C[tag];
  const L = [];
  w.nav.nodes.forEach((n, i) => { if (n.tag === tag) L.push(i); });
  return (C[tag] = L);
}
// un nœud de chemin entre r0 et r1 de (cx, cz), avec la direction du chemin là (vers un voisin)
function hfRoute(cx, cz, r0, r1, o) {
  const w = game.world, N = w.nav;
  o = o || {};
  const cand = [];
  for (const i of hfNoeuds('chemin')) {
    const n = N.nodes[i], d = Math.hypot(n.x - cx, n.z - cz);
    if (d < r0 || d > r1 || n.iso) continue;
    if (o.horsVillage && typeof interditDeBatir === 'function' && interditDeBatir(n.x, n.z, 6)) continue;
    if (o.test && !o.test(n)) continue;
    cand.push(i);
  }
  if (!cand.length) return null;
  const i = cand[(Math.random() * cand.length) | 0], n = N.nodes[i];
  const v = (N.adj[i] || []).map((e) => N.nodes[e.to]).filter((q) => q && q.tag === 'chemin');
  const q = v.length ? v[(Math.random() * v.length) | 0] : null;
  const dir = q ? Math.atan2(q.x - n.x, q.z - n.z) : Math.random() * TAU;
  return { i, x: n.x, z: n.z, y: hfY(n.x, n.z), dir, voisin: q };
}
// le trajet d'un point à un autre par le graphe des chemins (liste de [x, z])
function hfTrajet(x0, z0, x1, z1) {
  const w = game.world, N = w.nav;
  const ext = (q) => !/:(in|mid)$/.test(q.tag);
  try {
    const a = npcs.nearestReach(x0, z0, ext), b = npcs.nearestReach(x1, z1, ext);
    const P = a >= 0 && b >= 0 ? npcs.findPath(null, a, b) : null;
    const pts = P ? P.map((i) => [N.nodes[i].x, N.nodes[i].z]) : [];
    pts.push([x1, z1]);
    return pts;
  } catch (e) { return [[x1, z1]]; }
}
// le lieu « habité » le plus proche du joueur (la ville, le hameau) et sa distance
function hfVillageProche() {
  const w = game.world, p = game.player.pos, T = w.townInfo, H = w.lm.hameau;
  const dv = T ? Math.hypot(p[0] - T.x, p[2] - T.z) : 1e9, dh = H ? Math.hypot(p[0] - H.x, p[2] - H.z) : 1e9;
  return dv <= dh ? { k: 'ville', x: T.x, z: T.z, d: dv, nom: farm.names.ville } : { k: 'hameau', x: H.x, z: H.z, d: dh, nom: farm.names.hameau };
}
// un son placé dans le monde (si le moteur est prêt)
function hfSon(pos, fn) { if (!sound.ok) return; try { sound.ici(pos, fn); } catch (e) { /* le son n'est pas essentiel */ } }
// un point du ciel, vu de la caméra : direction (azimut, hauteur en radians) à R pas (en deçà du brouillard)
function hfCiel(cam, az, el, R) { const c = Math.cos(el); return [cam[0] + Math.sin(az) * c * R, cam[1] + Math.sin(el) * R, cam[2] + Math.cos(az) * c * R]; }
// un modèle d'objet posé (PROP_MODELS) dessiné à la volée : une charrette renversée, une table, des bougies…
function hfModele(buf, id, x, y, z, r, s, data, t) {
  const M = PROP_MODELS[id];
  if (!M) return;
  PE.buf = buf; PE.fl = 0; PE.frame(x, y, z, r || 0, s || 1);
  M(PE, { x, y, z, r: r || 0, s: s || 1, v: 0, data: data || {} }, t || { night: game.sky && game.sky.night > 0.5 });
  PE.fl = 0;
}
// l'arbre le plus proche entre r0 et r1 pas (objet du monde : { ob, T, x, z }), ou null
function hfArbre(x, z, r0, r1, test) {
  const w = game.world;
  let best = null, bd = 1e9;
  w.query(x, z, r1, (ob) => {
    if (ob.gone || ob.cleared) return;
    const T = OBJ_TYPES[ob.t];
    if (!T || T.cat !== 'Arbres' || T.id === 'giantoak') return;
    const d = Math.hypot(ob.x - x, ob.z - z);
    if (d < r0 || d > r1 || d >= bd) return;
    if (test && !test(ob)) return;
    best = ob; bd = d;
  }, null);
  return best ? { ob: best, T: OBJ_TYPES[best.t], x: best.x, z: best.z, y: w.heightAt(best.x, best.z) } : null;
}
// les objets posés d'une sorte, près d'un point (les plus proches d'abord)
function hfProps(ids, x, z, r) {
  const w = game.world, L = [];
  for (const q of w.props) if (!q.gone && ids.includes(q.id) && Math.abs(q.x - x) < r && Math.abs(q.z - z) < r && Math.hypot(q.x - x, q.z - z) < r) L.push(q);
  return L.sort((a, b) => Math.hypot(a.x - x, a.z - z) - Math.hypot(b.x - x, b.z - z));
}
// les habitants vivants, éveillés et présents près d'un point
function hfGens(x, z, r, filtre) {
  if (!npcs.list) return [];
  return npcs.list.filter((n) => n.st.alive && !n.vanished && !n.hunting && n.state !== 'sleep' && n.state !== 'dead' && n.state !== 'gone' && Math.hypot(n.x - x, n.z - z) < r && (!filtre || filtre(n)));
}
// l'intensité d'un événement qui monte puis redescend (heures de jeu : montée, descente ; durée : D.duree ou E.duree)
function hfK(E, monte, descend) { const D = E.duree || E.D.duree || 1; return smoothstep(0, monte || 0.1, E.age) * (1 - smoothstep(D - (descend || 0.1), D, E.age)); }
// le programme météo d'un jour : la première période d'un état (ou de plusieurs) entre h0 et h1 → [début, fin] ou null
function hfPeriode(P, etats, h0, h1) {
  const L = P.plan;
  for (let i = 0; i < L.length; i++) {
    const [h, st] = L[i];
    if (!etats.includes(st)) continue;
    const fin = i + 1 < L.length ? L[i + 1][0] : 24;
    const a = Math.max(h, h0), b = Math.min(fin, h1);
    if (b - a > 0.3) return [a, b];
  }
  return null;
}
// une petite pensée, seulement si rien d'autre n'est affiché
function hfPense(texte, dur) { if (!ui.panel && !game.dying) ui.subtitle('', texte, dur || 3.5); }
// des allures de gens de passage (humanRig) ; o : retouches
const HF_LOOKS = {
  paysan: { skin: '#d8ae8a', hair: '#4a3420', top: '#6a5a44', bottom: '#4a4034', hat: 'paille' },
  paysanne: { skin: '#e2b896', hair: '#5a3a22', top: '#7a5a48', bottom: '#5a4a3a', dress: true, apron: '#d8d0c0', hairStyle: 'chignon', hat: 'bonnet', hatCol: '#e8e0d0' },
  vieux: { skin: '#cfa888', hair: '#cfcac0', top: '#4a4038', bottom: '#3a342c', hat: 'chapeau', beard: 'courte', old: true, held: 'canne' },
  vieille: { skin: '#d6b090', hair: '#d8d2c8', top: '#2a2624', bottom: '#2a2624', dress: true, hat: 'voile', hatCol: '#1e1c1c', old: true },
  enfant: { skin: '#ecc4a2', hair: '#7a5030', top: '#8a6a4a', bottom: '#5a4a3a', height: 0.7 },
  fillette: { skin: '#eec6a4', hair: '#a06a30', top: '#9a5a5a', bottom: '#6a4a4a', dress: true, height: 0.68, hairStyle: 'queue' },
  bourgeois: { skin: '#e0b896', hair: '#3a2a20', top: '#2a2a30', bottom: '#2a2a2c', coat: true, hat: 'chapeau', beard: 'moustache' },
  cure: { skin: '#dcb090', hair: '#8a8278', top: '#16141a', bottom: '#16141a', dress: true, hairStyle: 'chauve', old: true },
  soldat: { skin: '#d8ae8a', hair: '#3a2a1c', top: '#2a3a6a', bottom: '#9a2a24', hat: 'casquette', hatCol: '#2a3a6a', beard: 'moustache' },
  roulier: { skin: '#c89a78', hair: '#2a2018', top: '#3a4a6a', bottom: '#4a3c30', hat: 'chapeau', hatCol: '#3a3028', beard: 'courte', coat: true },
};
function hfLook(k, o) { return Object.assign({}, HF_LOOKS[k] || HF_LOOKS.paysan, o || {}); }

// ---------------------------------------------------------------- les figurants : gens de passage, bêtes dessinées
// (ce ne sont pas des habitants : pas de routine, pas de mémoire ; ils viennent, font, s'en vont)
function hfPerso(look, x, z, o) {
  const F = Object.assign({ hum: true, rig: humanRig(look), look, x, z, y: 0, h: 0, move: 0, phase: Math.random() * 6, vit: 1.3, chemin: null, ci: 0, pose: {}, nom: '', s: look.height || 1, voix: 1, cache: false }, o || {});
  F.y = hfY(F.x, F.z);
  return F;
}
// une bête (rig existant : 'wolf', 'stork', 'bat'…) ; v : variante de couleur
function hfBete(rig, x, z, o) {
  const mk = ANIMAL_RIGS[rig] || ANIMAL_RIGS.dog;
  const r = mk((o && o.v) || 0, o && o.white);
  const F = Object.assign({ hum: false, rig: r, x, z, y: 0, h: 0, move: 0, phase: Math.random() * 6, vit: 1.2, chemin: null, ci: 0, pose: {}, s: 1, cache: false }, o || {});
  F.y = F.vol ? F.y : hfY(F.x, F.z);
  return F;
}
function hfAller(F, pts, vit) { F.chemin = pts; F.ci = 0; F.arrive = false; if (vit) F.vit = vit; }
// avance sur son chemin ; renvoie true quand il est arrivé
function hfMarche(F, dt, o) {
  const w = game.world;
  if (!F.chemin || F.ci >= F.chemin.length) { F.move = lerp(F.move, 0, Math.min(1, dt * 6)); F.arrive = true; return true; }
  const [tx, tz] = F.chemin[F.ci], dx = tx - F.x, dz = tz - F.z, d = Math.hypot(dx, dz);
  if (d < (F.ci < F.chemin.length - 1 ? 0.9 : 0.25)) { F.ci++; return false; }
  F.h = turnToward(F.h, Math.atan2(dx, dz), dt * (F.tourne || 4));
  const v = Math.min(F.vit * dt, d);
  F.x += Math.sin(F.h) * v; F.z += Math.cos(F.h) * v;
  F.y = F.vol ? F.y : w.groundAt(F.x, F.z, F.y + 0.6, 0.6);
  F.move = Math.min(1, F.vit / (F.hum ? 1.4 : 1.2)); F.run = F.vit > (F.hum ? 3 : 4);
  F.phase += dt * F.vit * (F.hum ? 2.2 : 2.6);
  void o;
  return false;
}
// tourner vers un point
function hfFace(F, x, z, dt) { F.h = turnToward(F.h, Math.atan2(x - F.x, z - F.z), dt * 3); }
// un figurant suit le joueur (un enfant qu'on mène par la main, une bête qu'on ramène) ; renvoie la distance
function hfSuit(F, dt, ecart, vmax) {
  const p = game.player.pos, d = Math.hypot(F.x - p[0], F.z - p[2]);
  if (d > (ecart || 2.2)) { if (!F.chemin || F.ci >= F.chemin.length || Math.random() < dt * 2) hfAller(F, [[p[0], p[2]]], clamp(d * 0.9, 1.1, vmax || 4)); hfMarche(F, dt); }
  else F.move = lerp(F.move, 0, Math.min(1, dt * 6));
  return d;
}
// dessin d'un figurant (si près de la caméra)
function hfDessine(F, buf, sbuf, cam, t, fl) {
  if (!F || F.cache) return;
  const dx = F.x - cam[0], dz = F.z - cam[2];
  if (dx * dx + dz * dz > (F.loin || 140) * (F.loin || 140)) return;
  const st = Object.assign({ move: F.move, phase: F.phase, run: F.run, t, lookY: F.lookY || 0 }, F.pose);
  const r = F.rig;
  if (F.hum) poseHuman(r, st);
  else if (r.kind === 'bird') poseBird(r, st);
  else if (r.kind === 'snake') poseSnake(r, st);
  else poseQuad(r, st);
  drawRig(buf, r, F.x, F.y + (F.dy || 0), F.z, F.h, F.s, (fl || 0) | (F.fl || 0));
  if (sbuf && !F.vol && !F.ombre0) drawShadow(sbuf, F.x, F.y, F.z, F.hum ? 0.34 * F.s : 0.4 * F.s);
  if (F.acc) F.acc(F, buf, t);
}
// un figurant parle : sous-titre (s'il est assez près) et murmure placé
function hfDit(F, texte, dur) {
  if (!F || F.cache) return;
  const d = hfDistJ(F.x, F.z);
  if (d > (F.porte || 16) || game.dying) return;
  if (!ui.panel) ui.subtitle(F.nom || '', texte, dur || 3.5);
  hfSon([F.x, F.y + 1.55 * (F.s || 1), F.z], () => sound.mumble && sound.mumble(F.voix || 1, Math.min(60, texte.length), 0, 0.9));
}
// un cortège : des figurants qui suivent la même ligne à la file (procession, noce, enterrement)
function hfCortege(membres, pts, ecart, vit) {
  const L = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { membres, pts, L, s: 0, ecart: ecart || 1.6, vit: vit || 0.9, fini: false };
}
function hfCortegeAt(C, s) {
  const { pts, L } = C;
  if (s <= 0) { const a = pts[0], b = pts[1] || pts[0]; return [a[0], a[1], Math.atan2(b[0] - a[0], b[1] - a[1])]; }
  for (let i = 1; i < pts.length; i++) if (L[i] >= s) { const k = (s - L[i - 1]) / ((L[i] - L[i - 1]) || 1), a = pts[i - 1], b = pts[i]; return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), Math.atan2(b[0] - a[0], b[1] - a[1])]; }
  const a = pts[pts.length - 2] || pts[0], b = pts[pts.length - 1];
  return [b[0], b[1], Math.atan2(b[0] - a[0], b[1] - a[1])];
}
function hfCortegeMaj(C, dt, arret) {
  const w = game.world, tot = C.L[C.L.length - 1], der = Math.max(...C.membres.map((F, i) => F.rang ?? i)), fin = tot + der * C.ecart;
  if (!arret) C.s = Math.min(fin, C.s + C.vit * dt);
  C.fini = C.s >= fin - 0.01;
  C.membres.forEach((F, i) => {
    const si = Math.min(tot, C.s - (F.rang ?? i) * C.ecart);
    const [x, z, h] = hfCortegeAt(C, Math.max(0, si));
    const lat = F.lat || 0, nx = x + Math.cos(h) * lat, nz = z - Math.sin(h) * lat;
    const mv = !arret && si > 0 && si < tot;
    F.move = lerp(F.move, mv ? 1 : 0, Math.min(1, dt * 5));
    if (mv) { F.phase += dt * C.vit * 2.4; F.h = turnToward(F.h, h, dt * 3); }
    F.x = nx; F.z = nz; F.y = w.groundAt(nx, nz, (F.y || w.heightAt(nx, nz)) + 0.6, 0.6);
    F.cache = si < 0 && !F.devant;
  });
}

// ---------------------------------------------------------------- la mécanique
const hasardF = {
  actifs: {}, cibles: [], _t: 0, _tH: 0, _hAcc: 0, _X: null,

  // ------------------------------------------------------------ état sauvegardé (farm.s.evF)
  S() {
    const s = farm.s;
    let S = s.evF;
    if (!S || typeof S !== 'object') S = s.evF = {};
    if (!S.v) S.v = 1;
    for (const k of ['derniers', 'n', 'long', 'photos', 'mem']) if (!S[k] || typeof S[k] !== 'object') S[k] = {};
    for (const k of ['journal', 'recents', 'bienfaits']) if (!Array.isArray(S[k])) S[k] = [];
    if (!S.jourN || typeof S.jourN !== 'object') S.jourN = { d: 0, n: 0 };
    if (typeof S.dernierH !== 'number') S.dernierH = -99;
    return S;
  },
  // ------------------------------------------------------------ le tirage du jour (déterministe ; aussi dans la mesure)
  alea(d, k) { const s = farm.s; return mulberry32((hash2i(d, k * 6271 + 29, ((s ? s.seed : 1) >>> 0) ^ 0x46e4a7) * 4294967296) >>> 0)(); },
  // ce que le joueur a (sans le monde : la mesure tourne sans vallée)
  profil() {
    const s = farm.s, A = (s.animals || []).filter((a) => !a.dead);
    let cultures = 0;
    for (const k in s.crops || {}) { const c = s.crops[k]; if (c && c.c && !c.dead) cultures++; }
    return { poules: A.filter((a) => a.kind === 'hen').length, betes: A.length, especes: [...new Set(A.filter((a) => !a.lost).map((a) => a.kind))], cultures, chien: !!(s.dog && s.dog.alive), argent: s.money || 0,
      bienfaits: (this.S().bienfaits || []).filter((b) => b.d >= (s.day || 1) - 6).length, crimes: (s.rep && s.rep.crimes ? s.rep.crimes.length : 0) };
  },
  contexteJour(d, S) {
    const s = farm.s, P = weather.dayPlan(s.seed, d);
    const etat = (h) => evEtat(P, h);
    return { d, P, etat, dow: cal.jour(d).cle, s, S: S || this.S(), biz: hfBiz(), joueur: this.profil(),
      neige: evenements.neige(d), soleil: evenements.soleil(d), noire: evenements.nuitNoire(d), demain: weather.dayPlan(s.seed, d + 1),
      pluieA: (h0, h1) => { for (let h = h0; h < h1; h += 0.5) { const x = etat(h); if (x === 'rain' || x === 'storm') return true; } return false; } };
  },
  eligible(id, c, deja) {
    const D = HF[id], S = c.S;
    if (D.tirage !== 'jour') return false;
    if (c.d < (D.premier ?? HF_FREQ.premier)) return false;
    const last = deja && deja[id] !== undefined ? deja[id] : S.derniers[id];
    if (last !== undefined && c.d - last < (D.ecart ?? HF_FREQ.ecart)) return false;
    if (D.fois && (S.n[id] || 0) >= D.fois) return false;
    if (S.long[id]) return false;
    try { return !D.peut || !!D.peut(c); } catch (e) { return false; }
  },
  poids(id, c) { const D = HF[id]; return (D.poids ?? 1) * (D.etrange ? c.biz : 1); },
  choisir(ids, c, r) {
    let tot = 0;
    for (const id of ids) tot += this.poids(id, c);
    if (tot <= 0) return null;
    let x = r * tot;
    for (const id of ids) { x -= this.poids(id, c); if (x <= 0) return id; }
    return ids[ids.length - 1];
  },
  heureDe(id, c, r) {
    const D = HF[id];
    if (D.heure) { const h = D.heure(c, r); if (h !== null && h !== undefined) return h; }
    const H = D.h || [9, 17];
    return H[0] + r * (H[1] - H[0]);
  },
  // le programme d'un jour : { d, liste: [{ id, h, st }] } (st : 0 à venir, 1 lancé, 2 passé)
  planJour(d, deja) {
    const c = this.contexteJour(d), liste = [];
    if (this.alea(d, 1) < HF_FREQ.jour) {
      const ids = HF_IDS.filter((id) => this.eligible(id, c, deja));
      const a = this.choisir(ids, c, this.alea(d, 2));
      if (a) {
        liste.push({ id: a, h: this.heureDe(a, c, this.alea(d, 5)), st: 0 });
        if (this.alea(d, 3) < HF_FREQ.second) {
          const ids2 = ids.filter((id) => id !== a && HF[id].cat !== HF[a].cat);
          const b = this.choisir(ids2, c, this.alea(d, 4));
          if (b) { const hb = this.heureDe(b, c, this.alea(d, 6)); if (Math.abs(hb - liste[0].h) >= 2) liste.push({ id: b, h: hb, st: 0 }); }
        }
      }
    }
    liste.sort((x, y) => x.h - y.h);
    return { d, liste };
  },
  // le programme de demain (pour qu'on puisse l'annoncer), gardé : il aura lieu tel qu'annoncé
  demain() {
    const S = this.S(), d = farm.s.day + 1;
    if (S.demain && S.demain.d === d) return S.demain;
    const deja = {};
    if (S.plan && S.plan.d === d - 1) for (const e of S.plan.liste) deja[e.id] = d - 1;
    S.demain = this.planJour(d, deja);
    return S.demain;
  },
  planDuJour() {
    const S = this.S(), d = farm.s.day;
    if (S.plan && S.plan.d === d) return S.plan;
    S.plan = S.demain && S.demain.d === d ? S.demain : this.planJour(d);
    S.demain = null;
    return S.plan;
  },

  // ------------------------------------------------------------ lancer, arrêter
  peutCommencer() {
    return game.mode === 'play' && !game.sleeping && !game.dying && !(typeof cine !== 'undefined' && cine.on) && !hfAilleurs() && !(farm.s && farm.s.over);
  },
  quotaOk() {
    const S = this.S(), s = farm.s;
    if (S.jourN.d !== s.day) S.jourN = { d: s.day, n: 0 };
    return S.jourN.n < HF_FREQ.maxJour && s.hours - S.dernierH >= HF_FREQ.ecartH;
  },
  lancer(id, o) {
    const D = HF[id];
    if (!D || this.actifs[id] || !farm.s || !game.world) return false;
    const s = farm.s, S = this.S();
    const E = Object.assign({ id, D, t: 0, h0: s.hours, age: 0, cibles: [], ents: [], boucles: [], inters: [], vu: false }, o || {});
    let ok;
    try { ok = D.lancer ? D.lancer(E) : true; } catch (e) { console.error('hasardF', id, e); ok = false; }
    if (ok === false) { this.nettoyer(E); return false; }
    this.actifs[id] = E;
    if (!E.essai) {
      S.derniers[id] = s.day; S.n[id] = (S.n[id] || 0) + 1;
      if (S.jourN.d !== s.day) S.jourN = { d: s.day, n: 0 };
      S.jourN.n++; S.dernierH = s.hours;
    }
    if (D.public) this.retenir(id);
    return true;
  },
  arreter(E, raison) {
    if (!E) return;
    const D = E.D;
    if (this.actifs[E.id] === E) delete this.actifs[E.id];
    try { if (D.fin) D.fin(E, raison || 'fin'); } catch (e) { console.error('hasardF fin', E.id, e); }
    this.nettoyer(E);
  },
  nettoyer(E) {
    this.cibles = this.cibles.filter((C) => C.E !== E);
    for (const e of E.ents || []) if (!e.removed) entities.remove(e);
    for (const em of E.boucles || []) try { sound.lacher(em); } catch (e) { /* rien */ }
    const w = game.world;
    if (w && E.inters && E.inters.length) w.inter = w.inter.filter((it) => !E.inters.includes(it));
    E.ents = []; E.boucles = []; E.inters = [];
  },
  // une chose qu'on peut faire (touche E) : { pos() | x, y, z, lab, use(), vis(), r }
  cible(E, C) { C.E = E; this.cibles.push(C); return C; },
  // une bête « vraie » ajoutée au monde pour la durée de l'événement (retirée à la fin)
  ajouterBete(E, kind, x, z, o) { const e = entities.add(game.world, kind, x, z, o || {}); E.ents.push(e); return e; },

  // ------------------------------------------------------------ les traces : le carnet, ce qu'on en dit
  noter(E, texte) {
    const id = typeof E === 'string' ? E : E.id;
    if (E && typeof E === 'object') { if (E.note) return; E.note = true; E.vu = true; }
    const S = this.S(), s = farm.s, t = texte || hfT(id).journal;
    if (!t) return;
    S.journal.push({ d: s.day, h: Math.round(npcs.hour() * 10) / 10, id, t });
    while (S.journal.length > 40) S.journal.shift();
  },
  retenir(id) {
    const S = this.S(), d = farm.s.day;
    S.recents = S.recents.filter((r) => r.d >= d - 2 && r.id !== id);
    S.recents.push({ id, d, h: farm.s.hours });
  },
  // un bienfait (un enfant ramené, un colporteur soigné…) : le panier à la porte s'en souvient
  bienfait(qui) { const S = this.S(); S.bienfaits.push({ d: farm.s.day, qui }); while (S.bienfaits.length > 12) S.bienfaits.shift(); },
  // les habitants proches réagissent (lignes « pendant »)
  reagir(id, quand, x, z) {
    const L = hfT(id)[quand || 'pendant'];
    if (!L || !L.length || !npcs.list) return;
    const p = game.player.pos, cx = x ?? p[0], cz = z ?? p[2];
    const near = npcs.list.filter((n) => n.st.alive && !n.vanished && !n.hunting && n.state !== 'sleep' && n.state !== 'dead' && n.state !== 'gone' && !n.talking && Math.hypot(n.x - cx, n.z - cz) < 50 && Math.hypot(n.x - p[0], n.z - p[2]) < 60);
    near.sort(() => Math.random() - 0.5);
    near.slice(0, 2).forEach((n, i) => setTimeout(() => { if (n.st.alive && !game.dying && farm.s) npcs.say(n, pick(L), 3.8); }, 1200 + i * 3400 + Math.random() * 1200));
  },
  // une ligne pour qui parle (événement récent, ou annoncé pour demain)
  ligne() {
    if (!farm.s) return null;
    const S = this.S(), s = farm.s, d = s.day, h = npcs.hour();
    const rec = S.recents.filter((r) => r.d >= d - 2 && hfT(r.id).apres && s.hours - (r.h || 0) > 0.5);
    const ann = [];
    const P = S.plan && S.plan.d === d ? S.plan.liste : [];
    for (const e of P) if (e.st === 0 && HF[e.id] && HF[e.id].annonce && hfT(e.id).avant && e.h > h + 0.5) ann.push(e.id);
    if (h > 12) for (const e of this.demain().liste) if (HF[e.id] && HF[e.id].annonce && hfT(e.id).avant) ann.push(e.id);
    if (ann.length && (!rec.length || Math.random() < 0.5)) return pick(hfT(pick(ann)).avant);
    if (rec.length) return pick(hfT(rec[rec.length - 1].id).apres);
    return null;
  },
  // ce qu'on garde au carnet (les huit dernières lignes)
  carnetHTML() {
    if (!farm.s) return '';
    const S = this.S(), L = S.journal.slice(-8).reverse();
    if (!L.length) return '';
    return `<h4>Ce qui est arrivé</h4><div class="hf-journal">${L.map((e) => `<p><i>Jour ${e.d}</i> — ${esc(e.t)}${e.photo ? ` <button class="hf-voir" data-hf-photo="${esc(e.photo)}">Regarder</button>` : ''}</p>`).join('')}</div>`;
  },

  // ------------------------------------------------------------ le monde, en bref (toutes les deux secondes)
  contexte() {
    const w = game.world, p = game.player, pos = p.pos, hh = evHH();
    const X = { hh, h: hh % 24, pos, dehors: hfDehors(), biome: game.biomeAt(pos), nuit: hh >= 21.5 && hh < 28.8, soir: hh >= 18 && hh < 21.5, jour: hh >= 7 && hh < 18.5, aube: hh >= 28.8 || hh < 7.5 };
    const T = w.townInfo, H = w.lm.hameau;
    X.ville = !!T && Math.hypot(pos[0] - T.x, pos[2] - T.z) < 70;
    X.hameau = !!H && Math.hypot(pos[0] - H.x, pos[2] - H.z) < 45;
    const F = w.farm && w.farm.f;
    X.ferme = !!F && Math.hypot(pos[0] - F.x, pos[2] - F.z) < 55;
    let route = 1e9;
    for (const i of hfNoeuds('chemin')) { const n = w.nav.nodes[i], d = Math.abs(n.x - pos[0]) + Math.abs(n.z - pos[2]); if (d < route) route = d; }
    X.route = route < 9;
    const L = w.lm.lac;
    X.lac = !!L && Math.hypot(pos[0] - L.x, pos[2] - L.z) < L.r + 25;
    X.foret = X.biome === 'foret' || X.biome === 'bouleaux';
    X.meteo = weather.state;
    X.pluie = weather.cur.rain > 0.3;
    return X;
  },

  // ------------------------------------------------------------ chaque image
  update(dt, eye, basis, sky) {
    const s = farm.s;
    if (!s || !game.world || game.mode === 'menu' || game.kind !== 'farm') return;
    // ailleurs (un autre monde, le Dessous, l'Envers) : ce qui se passait dans la vallée s'interrompt
    const loin = hfAilleurs();
    for (const id in this.actifs) {
      const E = this.actifs[id], D = E.D;
      if (loin && !E.long) { this.arreter(E, 'ailleurs'); continue; }
      E.t += dt; E.age = s.hours - E.h0;
      try { if (D.maj && !loin) D.maj(E, dt, eye, basis, sky); } catch (e) { console.error('hasardF', id, e); E.fini = 'erreur'; }
      if (E.fini || (D.duree && E.age > D.duree && !E.long)) this.arreter(E, E.fini || 'temps');
    }
    // le programme : une fois par seconde
    this._t -= dt;
    this._hAcc += dt;
    if (this._t > 0) return;
    this._t = 1;
    if (!this.peutCommencer()) { this._hAcc = 0; return; }
    const P = this.planDuJour(), hh = evHH();
    for (const e of P.liste) {
      if (e.st !== 0 || hh < e.h) continue;
      const D = HF[e.id];
      if (!D) { e.st = 2; continue; }
      if (hh > e.h + (D.fenetre ?? 2)) { e.st = 2; this.manque(e, P.d); continue; }
      if (ui.panel && !D.sansPanneau) continue;
      if (!this.quotaOk()) continue;
      let pret = true;
      try { pret = !D.pret || D.pret(this.contexte(), e); } catch (err) { pret = false; }
      if (!pret) continue;
      if (this.lancer(e.id, { plan: e })) e.st = 1; else { e.st = 2; this.manque(e, P.d); }
    }
    // au fil du temps : toutes les deux secondes
    this._tH -= 1;
    if (this._tH > 0) return;
    this._tH = 2;
    const acc = this._hAcc; this._hAcc = 0;
    if (ui.panel || !this.quotaOk()) return;
    const X = this._X = this.contexte(), c = { d: s.day, S: this.S(), biz: hfBiz() };
    for (const id of HF_IDS) {
      const D = HF[id];
      if (D.tirage !== 'heure' || this.actifs[id]) continue;
      if (s.day < (D.premier ?? HF_FREQ.premier)) continue;
      const last = c.S.derniers[id];
      if (last !== undefined && s.day - last < (D.ecart ?? HF_FREQ.ecart)) continue;
      if (D.fois && (c.S.n[id] || 0) >= D.fois) continue;
      let ici = false;
      try { ici = D.ici(X) && (!D.peut || D.peut(this.contexteJour(s.day))); } catch (err) { ici = false; }
      if (!ici) continue;
      if (Math.random() < hasardHeure(D.parHeure * (D.etrange ? c.biz : 1), acc)) { if (this.lancer(id, { X })) break; }
    }
  },
  // un événement du jour qui n'a pas pu avoir lieu : il se fait sans nous, ou pas du tout
  manque(e, d) {
    const D = HF[e.id];
    if (!D || !D.sansNous) return;
    try { if (D.sansNous(e, d) !== false && D.public) this.retenir(e.id); } catch (err) { console.error('hasardF sansNous', e.id, err); }
  },
  draw(buf, sbuf, cam, t) {
    if (!farm.s || game.kind !== 'farm') return;
    for (const id in this.actifs) { const E = this.actifs[id]; if (E.D.dessin) try { E.D.dessin(E, buf, sbuf, cam, t); } catch (e) { console.error('hasardF dessin', id, e); E.fini = 'erreur'; } }
  },
  lights(eye) {
    const L = [];
    if (!farm.s || game.kind !== 'farm') return L;
    for (const id in this.actifs) { const E = this.actifs[id]; if (E.D.lum) try { for (const l of E.D.lum(E, eye) || []) L.push(l); } catch (e) { /* rien */ } }
    return L;
  },
  sky(sky) { if (!farm.s) return; for (const id in this.actifs) { const E = this.actifs[id]; if (E.D.ciel) try { E.D.ciel(E, sky); } catch (e) { /* rien */ } } },
  fx(fx, tint, sky) { if (!farm.s) return; for (const id in this.actifs) { const E = this.actifs[id]; if (E.D.ecran) try { E.D.ecran(E, fx, tint, sky); } catch (e) { /* rien */ } } },

  // ------------------------------------------------------------ une partie chargée, un jour nouveau
  charger(saved) {
    for (const id in this.actifs) this.nettoyer(this.actifs[id]);
    this.actifs = {}; this.cibles = []; this._t = 2; this._tH = 3; this._hAcc = 0;
    if (!farm.s) return;
    if (!saved) farm.s.evF = null;
    const S = this.S();
    // ce qui dure plusieurs jours (la comète, les cigognes…) revient
    for (const id in S.long) {
      const D = HF[id], L = S.long[id];
      if (!D || !D.restaurer || !L) { delete S.long[id]; continue; }
      try { const E = D.restaurer(L); if (E) { Object.assign(E, { id, D, t: 0, h0: L.h0 ?? farm.s.hours, age: 0, cibles: E.cibles || [], ents: E.ents || [], boucles: E.boucles || [], inters: E.inters || [], long: true }); this.actifs[id] = E; } else delete S.long[id]; } catch (e) { console.error('hasardF restaurer', id, e); delete S.long[id]; }
    }
    this.planDuJour();
  },
  jourNouveau() {
    const S = this.S(), d = farm.s.day;
    // la veille : ce qui n'a pas pu se faire
    if (S.plan && S.plan.d < d) for (const e of S.plan.liste) if (e.st === 0) { e.st = 2; this.manque(e, S.plan.d); }
    this.planDuJour();
    S.recents = S.recents.filter((r) => r.d >= d - 2);
    for (const id in S.long) { const D = HF[id], E = this.actifs[id]; if (D && D.chaqueJour) try { D.chaqueJour(S.long[id], d, E); } catch (e) { console.error('hasardF chaqueJour', id, e); } }
  },

  // ------------------------------------------------------------ pour les essais
  // déclenche un événement tout de suite, près du joueur (sans tenir compte de sa condition ni de sa fréquence)
  declencher(id, o) {
    if (!HF[id] || !farm.s) return false;
    if (this.actifs[id]) this.arreter(this.actifs[id], 'essai');
    return this.lancer(id, Object.assign({ essai: true, force: true }, o || {}));
  },
  fin(id) { const E = this.actifs[id]; if (E) this.arreter(E, 'essai'); },
  liste(cat) { return HF_IDS.filter((id) => !cat || HF[id].cat === cat); },
};

// ---------------------------------------------------------------- la touche E sur ce que les événements proposent
HOOKS.target.push((eye, f, cand) => {
  if (!farm.s || !hasardF.cibles.length) return;
  for (const C of hasardF.cibles) {
    if (C.vis && !C.vis()) continue;
    const P = C.pos ? C.pos() : [C.x, C.y, C.z];
    if (!P) continue;
    const dx = P[0] - eye[0], dy = P[1] - eye[1], dz = P[2] - eye[2], d = Math.hypot(dx, dy, dz);
    if (d > (C.r || 2.7)) continue;
    const cos = (dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1);
    if (cos < (C.cos || 0.72)) continue;
    const lab = typeof C.lab === 'function' ? C.lab() : C.lab;
    cand({ kind: 'hook', use: () => C.use(), f2lab: lab, hf: C }, d * (1.6 - cos * 0.6));
  }
});

// ---------------------------------------------------------------- branchements
HOOKS.load.push((saved) => hasardF.charger(saved));
HOOKS.update.push((dt, eye, basis, sky, playing) => hasardF.update(dt, eye, basis, sky, playing));
HOOKS.draw.push((buf, sbuf, cam, t) => hasardF.draw(buf, sbuf, cam, t));
HOOKS.lights.push((eye) => hasardF.lights(eye));
HOOKS.sky.push((sky) => hasardF.sky(sky));
HOOKS.fx.push((fx, tint, sky) => hasardF.fx(fx, tint, sky));
HOOKS.day.push(() => { if (farm.s) hasardF.jourNouveau(); });
// les habitants en parlent (avec les prodiges : la ligne de 11-zzz40, ou la nôtre)
HOOKS.load.push(() => {
  if (game._hfTalk) return;
  game._hfTalk = true;
  const _ligne = evenements.ligne.bind(evenements);
  evenements.ligne = function () {
    const a = _ligne(), b = hasardF.ligne();
    if (a && b) return Math.random() < 0.5 ? a : b;
    return a || b;
  };
  // evenements.declencher('noce') : nos événements aussi
  const _dec = evenements.declencher.bind(evenements);
  evenements.declencher = function (id, o) { if (HF[id]) return hasardF.declencher(id, o); return _dec(id, o); };
  const _fin = evenements.fin.bind(evenements);
  evenements.fin = function (id) { if (HF[id]) return hasardF.fin(id); return _fin(id); };
});
// le carnet de la sacoche : « Ce qui est arrivé » (ui est défini plus loin, dans 12-ui.js : on l'emballe au chargement d'une partie)
HOOKS.load.push(() => {
  if (game._hfCarnet) return;
  game._hfCarnet = true;
  const _rs = ui.renderSatchel.bind(ui);
  ui.renderSatchel = function () {
    _rs();
    if (this.satTab !== 'carnet' || !farm.s) return;
    const body = $('#satchel .body'), html = hasardF.carnetHTML();
    if (!body || !html || body.querySelector('.hf-journal')) return;
    if (!document.getElementById('hf-css')) {
      const st = document.createElement('style');
      st.id = 'hf-css';
      st.textContent = '#satchel .hf-journal p{margin:3px 0;font-size:14px;line-height:1.45;color:#4a3a28}#satchel .hf-journal i{color:#7a6448}#satchel .hf-voir{margin-left:6px;font-size:12px;padding:1px 7px}'
        + '#reader .hf-plaque{display:block;margin:8px auto 12px;max-width:92%;image-rendering:pixelated;border:6px solid #2a2016;box-shadow:0 2px 10px rgba(0,0,0,.5)}';
      document.head.appendChild(st);
    }
    const last = body.querySelector('p.hint:last-child');
    if (last) last.insertAdjacentHTML('beforebegin', html); else body.insertAdjacentHTML('beforeend', html);
    body.querySelectorAll('[data-hf-photo]').forEach((b) => (b.onclick = () => { if (typeof hfVoirPhoto === 'function') hfVoirPhoto(b.dataset.hfPhoto); }));
  };
});
