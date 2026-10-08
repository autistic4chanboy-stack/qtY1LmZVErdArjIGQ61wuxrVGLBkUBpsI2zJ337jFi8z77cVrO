// ============================================================================
//  DES BÊTES À QUI L'ON PEUT PARLER (agent P, treizième vague) : le jeu.
//  Données et textes : 05-zzzzzP-betes.js ; modèles : 07-zzzzzzzzzzzzP-betes.js ;
//  créatures : 10-zzzzzP-betes.js ; voix : 09-zzzzzP-voix.js.
//  - OÙ (bpLieux) : une passe de génération qui ne pose RIEN (ni objet, ni
//    interaction : les empreintes ne bougent pas) et calcule l'endroit de chaque
//    bête, d'après les lieux de la vallée (le tonneau devant l'auberge, un chicot
//    au pied du chêne millénaire, la margelle du vieux puits, le dessus de la
//    Table des Géants, la lisière du relais de chasse, le cairn de l'estive, le
//    bout du ponton du pêcheur, le pré de la ferme brûlée) : w.betesP.
//  - QUAND : chacune a ses heures (et son temps) ; elle paraît quand on approche
//    de son endroit — jamais sous les yeux du joueur — et s'en va quand l'heure
//    passe ou qu'on s'éloigne. Endormie (le chat le jour, le cheval la nuit), on
//    la voit, elle ne parle pas.
//  - PARLER (E) : ui.choice. La première fois, elle parle la première quand on
//    s'approche. Une salutation qui dépend de ce qu'elle sait (une bête tuée par
//    le joueur, un coup reçu, le premier jour, une longue absence, ce que le
//    joueur a fait — crimes, chasse, le chien, l'Envers, la cité —, une question
//    posée l'autre jour, le temps qu'il fait, le jour de la semaine, l'heure) ;
//    puis : qui elle est, pourquoi elle parle, son sujet (une ligne nouvelle par
//    jour, à mesure de la confiance), deux rumeurs par jour, un service (et la
//    pareille rendue : un objet, un renseignement, un endroit), les autres bêtes
//    qui parlent, un mot sur le nonos du chien si la quête de Q est en cours
//    (gardé : typeof nonos). Un petit cri au début de chaque réplique.
//  - LA MENACER (une arme pointée sur elle) : elle s'en va pour la journée.
//    La BLESSER : elle s'en va trois jours, et le reproche ; deux fois, elle ne
//    parle plus jamais. La TUER : elle ne revient pas ; l'esprit du joueur en
//    prend un coup (et quelques mauvaises nuits) ; les autres le savent et le
//    disent ; à trois, toutes se taisent. Les gens n'y croient pas (une option
//    de dialogue chez chacun, une fois), ou font semblant.
//  État : farm.s.betesParlantes = { v, b: { id: { n, jours, jour, conf, nomConnu, … } }, morts: [{ id, j }], tues,
//    gens: { npc: jour }, foyer: { x, y, z, ouvert }, cauchemar }
//  API : betesParlantes.places(w) → [{ x, z, r }] (les endroits des bêtes, pour ne rien y poser), liste(), etat(id),
//    lieu(id), presence(id), parler(id) ; essais : aller(id), forcer(id), choisir(i), heure(h)
// ============================================================================
const BP_R = 75;                      // une bête paraît quand on approche à cette distance de son endroit
const BP_SEUILS = [0, 1, 3, 5];       // la confiance qu'il faut pour chaque ligne de son sujet
const BP_ARMES = new Set(['fusil', 'arc', 'hache', 'faux', 'fourche', 'rapiere', 'masse']);
const BP_SECRETS_LIEUX = ['grotte_peinte', 'grotte_contrebandiers', 'grotte_cristaux', 'antre'];
// ce que sent l'assassin caché, selon son métier (le chat ne donne jamais de nom)
const BP_ODEURS = { boulangere: 'la farine', forgeron: 'le charbon et la corne brûlée', cure: 'la cire et l’encens', aubergiste: 'le vin aigre', postiere: 'la colle et l’encre',
  maire: 'le tabac fin et le papier timbré', garde: 'la poudre et le cuir', eleveuse: 'le lait et le foin', pecheur: 'la vase', guerisseuse: 'les herbes amères', grainetiere: 'la poussière de grain',
  alchimiste: 'le soufre', libraire: 'le vieux papier', chasseur: 'le sang de bête', colporteur: 'la poussière des routes', colporteuse: 'la poussière des routes' };

function bpDans(h, plages) { for (const [a, b] of plages || []) if (h >= a && h < b) return true; return false; }
function bpCap(t) { t = String(t || ''); return t.charAt(0).toUpperCase() + t.slice(1); }
// la direction d'un point vu d'un autre (le nord est vers −z, le levant vers +x)
function bpDir(dx, dz) {
  const a = Math.atan2(dx, -dz), o = ((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8;
  return ['vers le nord', 'vers le nord et le levant', 'vers le levant', 'vers le levant et le midi', 'vers le midi', 'vers le midi et le couchant', 'vers le couchant', 'vers le couchant et le nord'][o];
}
function bpPas(d) { const p = d / 0.75; return p < 25 ? 'à une vingtaine de pas' : p < 45 ? 'à une quarantaine de pas' : p < 80 ? 'à une soixantaine de pas' : p < 150 ? 'à une centaine de pas' : p < 400 ? 'à quelques centaines de pas' : 'loin'; }

// ---------------------------------------------------------------- où elles se tiennent (la passe de génération : elle ne pose rien)
function bpLieux(w, seed) {
  const rnd = mulberry32((((seed | 0) ^ 0x0B37E5) >>> 0));
  const WL = w.waterLevel, L = {}, lm = w.lm || {}, inters = w.inter || [];
  const sol = (x, z) => w.heightAt(x, z);
  const plat = (x, z, r, tol) => { let mn = 1e9, mx = -1e9; for (let a = 0; a < 8; a++) { const h = sol(x + Math.cos(a * 0.785) * r, z + Math.sin(a * 0.785) * r); mn = Math.min(mn, h); mx = Math.max(mx, h); } return mx - mn < tol; };
  const loinInter = (x, z, sauf) => { let m = 1e9; for (const it of inters) { if (sauf && sauf(it)) continue; const d = Math.hypot(it.x - x, it.z - z); if (d < m) m = d; } return m; };
  const blocPres = (x, z, r) => { let b = false; w.query(x, z, r + 2, null, (k) => { if (!b && !k.under && Math.abs(k.x - x) < r + k.sx / 2 && Math.abs(k.z - z) < r + k.sz / 2) b = true; }); return b; };
  const propPres = (x, z, r) => w.props.some((q) => Math.abs(q.x - x) < r && Math.abs(q.z - z) < r);
  const F = lm.ferme || { x: w.spawn.x, z: w.spawn.z };
  // ---- Tibert : un tonneau devant l'auberge (celui où l'on ne remplit pas de pichet)
  {
    const B = w.bld && w.bld.auberge;
    if (B && B.out) {
      const [ox, oz] = B.out;
      let best = null, bd = 1e9;
      for (const q of w.props) {
        if (q.id !== 'tonneau') continue;
        const d = Math.hypot(q.x - ox, q.z - oz);
        if (d > 9 || Math.abs(q.y - sol(q.x, q.z)) > 0.3) continue;
        const sc = d + (loinInter(q.x, q.z) < 0.5 ? 8 : 0);
        if (sc < bd) { bd = sc; best = q; }
      }
      const x = best ? best.x : ox + 1.3, z = best ? best.z : oz + 1.3, y = best ? best.y + 0.9 : sol(x, z);
      L.chat = { x, y, z, cap: Math.atan2(x - B.x, z - B.z), r: 8, sur: best ? 'tonneau' : 'sol' };
    }
  }
  // ---- la hulotte : un chicot au pied du chêne millénaire, du côté où l'on ne fait rien d'autre
  {
    const C = lm.chene;
    if (C) {
      let cx = C.x, cz = C.z;
      w.query(C.x, C.z, 12, (o) => { if (o && OBJ_TYPES[o.t] && OBJ_TYPES[o.t].id === 'giantoak') { cx = o.x; cz = o.z; } }, null);
      let best = null;
      for (let k = 0; k < 24; k++) for (const rr of [3.6, 4.2, 4.8]) {
        const a = k / 24 * TAU, x = cx + Math.cos(a) * rr, z = cz + Math.sin(a) * rr;
        if (sol(x, z) < WL + 0.3 || !plat(x, z, 0.8, 0.6)) continue;
        const sc = Math.min(6, loinInter(x, z)) + rnd() * 0.3 - rr * 0.2;
        if (!best || sc > best.sc) best = { x, z, sc };
      }
      if (best) { const h = 1.9; L.hulotte = { x: best.x, y: sol(best.x, best.z) + h, z: best.z, cap: Math.atan2(best.x - cx, best.z - cz), r: 12, chicot: h, sol: sol(best.x, best.z) }; }
    }
  }
  // ---- le crapaud : sur la margelle du vieux puits
  {
    const V = lm.vieux_puits, it0 = inters.find((it) => it.kind === 'oldwell');
    const cx = it0 ? it0.x : V && V.x, cz = it0 ? it0.z : V && V.z;
    if (cx !== undefined) {
      const g = sol(cx, cz);
      let best = null;
      for (let k = 0; k < 32; k++) for (const rr of [0.7, 0.8, 0.9, 1.0]) {
        const a = k / 32 * TAU, x = cx + Math.cos(a) * rr, z = cz + Math.sin(a) * rr;
        const top = w.groundAt(x, z, g + 2, 0, 0) - g;
        if (top < 0.5 || top > 1.5) continue;
        // (assez de margelle sous lui : les points voisins aussi)
        let ok = true;
        for (const [ex, ez] of [[0.12, 0], [-0.12, 0], [0, 0.12], [0, -0.12]]) if (Math.abs(w.groundAt(x + ex, z + ez, g + 2, 0, 0) - g - top) > 0.05) ok = false;
        // (pas dans un poteau : rien ne doit occuper la place de son corps)
        w.query(x, z, 1.5, null, (b) => { if (!ok || b.under) return; const [lx, lz] = World.blockLocal(b, x, z); if (Math.abs(lx) < b.sx / 2 + 0.17 && Math.abs(lz) < b.sz / 2 + 0.17 && g + top + 0.04 < b.y + b.sy && g + top + 0.35 > b.y) ok = false; });
        if (!ok) continue;
        const sc = Math.min(4, loinInter(x, z, (it) => it.kind === 'oldwell')) + rnd() * 0.2;
        if (!best || sc > best.sc) best = { x, z, y: g + top, sc };
      }
      if (best) L.crapaud = { x: best.x, y: best.y, z: best.z, cap: Math.atan2(best.x - cx, best.z - cz), r: 8, puits: [cx, cz], sol: g };
    }
  }
  // ---- Tiécelin : sur la Table des Géants
  {
    const D = lm.dolmen;
    if (D) {
      const g = sol(D.x, D.z);
      let best = null;
      for (let k = 0; k < 16; k++) for (const rr of [0.5, 0.9, 1.2]) {
        const a = k / 16 * TAU, x = D.x + Math.cos(a) * rr, z = D.z + Math.sin(a) * rr, top = w.groundAt(x, z, g + 6, 0, 0);
        if (top - g < 0.8) continue;
        const sc = top - g + rr * 0.3 + rnd() * 0.1;
        if (!best || sc > best.sc) best = { x, z, y: top, sc };
      }
      if (best) {
        const st = w.props.find((q) => q.id === 'stele' && Math.hypot(q.x - D.x, q.z - D.z) < 9);
        L.corbeau = { x: best.x, y: best.y, z: best.z, cap: st ? Math.atan2(st.x - best.x, st.z - best.z) : rnd() * TAU, r: 10, sol: g };
      }
    }
  }
  // ---- Hermeline : à la lisière, près du relais de chasse (loin de la cible et des chemins)
  {
    const R = lm.relais_chasse, B = w.bld && w.bld.relais_chasse;
    if (R) {
      const c0 = B ? { x: B.x, z: B.z } : R, cible = w.props.find((q) => q.id === 'cible' && Math.hypot(q.x - R.x, q.z - R.z) < 40);
      const navs = (w.nav && w.nav.nodes) || [];
      let best = null;
      for (let k = 0; k < 160; k++) {
        const a = rnd() * TAU, rr = 18 + rnd() * 14, x = c0.x + Math.cos(a) * rr, z = c0.z + Math.sin(a) * rr;
        if (!w.inside(x, z, 20) || sol(x, z) < WL + 0.4 || !plat(x, z, 1, 0.7)) continue;
        if (cible && Math.hypot(cible.x - x, cible.z - z) < 22) continue;
        if (propPres(x, z, 4) || blocPres(x, z, 2.5) || loinInter(x, z) < 6) continue;
        let dn = 1e9; for (const q of navs) { const d = Math.abs(q.x - x) + Math.abs(q.z - z); if (d < dn) dn = d; }
        let arbre = 0, colle = false;
        w.query(x, z, 5, (o) => { if (o && !o.gone && OBJ_TYPES[o.t] && OBJ_TYPES[o.t].cat === 'Arbres') { const d = Math.hypot(o.x - x, o.z - z); if (d < 2) colle = true; else if (d < 4.5) arbre++; } }, null);
        if (colle) continue;
        const sc = Math.min(arbre, 3) + Math.min(dn, 14) / 7 + rnd() * 0.5;
        if (!best || sc > best.sc) best = { x, z, sc };
      }
      if (best) L.renarde = { x: best.x, y: sol(best.x, best.z), z: best.z, cap: Math.atan2(c0.x - best.x, c0.z - best.z), r: 10, sol: sol(best.x, best.z) };
    }
  }
  // ---- l'Écornée : près du cairn à la sonnaille, à l'estive
  {
    const C = lm.estive_cairn || lm.estive, E = lm.estive || C;
    if (C) {
      let best = null;
      for (let k = 0; k < 24; k++) for (const rr of [2.6, 3.4, 4.4]) {
        const a = k / 24 * TAU, x = C.x + Math.cos(a) * rr, z = C.z + Math.sin(a) * rr;
        if (sol(x, z) < WL + 1 || !plat(x, z, 0.8, 0.9) || propPres(x, z, 1.4) || blocPres(x, z, 0.8)) continue;
        const sc = Math.min(5, loinInter(x, z)) - Math.abs(sol(x, z) - sol(C.x, C.z)) + rnd() * 0.3;
        if (!best || sc > best.sc) best = { x, z, sc };
      }
      if (best) L.chevre = { x: best.x, y: sol(best.x, best.z), z: best.z, cap: Math.atan2(E.x - best.x, E.z - best.z), r: 10, sol: sol(best.x, best.z) };
    }
  }
  // ---- la Vieille : dans l'eau, au bout du ponton du pêcheur
  {
    const P0 = lm.ponton;
    const q = P0 && w.props.filter((p) => p.id === 'ponton').sort((a, b) => Math.hypot(a.x - P0.x, a.z - P0.z) - Math.hypot(b.x - P0.x, b.z - P0.z))[0];
    if (q && Math.hypot(q.x - P0.x, q.z - P0.z) < 30) {
      const Lp = (q.data && q.data.L) || 10, dx = Math.sin(q.r || 0), dz = Math.cos(q.r || 0);
      const tx = q.x + dx * Lp, tz = q.z + dz * Lp;
      const barques = w.props.filter((b) => b.id === 'barque' && Math.hypot(b.x - tx, b.z - tz) < 8);
      let best = null;
      for (const av of [1.3, 1.7, 2.2]) for (const lat of [-0.8, 0.8, -1.4, 1.4, 0]) {
        const x = tx + dx * av + dz * lat, z = tz + dz * av - dx * lat;
        if (sol(x, z) > WL - 0.9) continue;
        const db = barques.reduce((m, b) => Math.min(m, Math.hypot(b.x - x, b.z - z)), 9);
        if (db < 1.9) continue;
        const sc = db * 0.3 - av * 0.5 + rnd() * 0.1;
        if (!best || sc > best.sc) best = { x, z, sc };
      }
      if (best) L.carpe = { x: best.x, y: WL - 0.05, z: best.z, cap: Math.atan2(tx - best.x, tz - best.z), r: 8, bout: [tx, tz], eau: WL };
    }
  }
  // ---- Bayard : dans le pré de la ferme brûlée la plus proche de la ferme (celle des Chabert)
  {
    let C = null, cd = 1e9;
    for (const k in lm) {
      const Q = lm[k];
      if (Q.c2 !== 'ferme_brulee' || Q.under) continue;
      const d = Math.hypot(Q.x - F.x, Q.z - F.z) - (/Chabert/.test(Q.name || '') ? 400 : 0);
      if (d < cd) { cd = d; C = Q; }
    }
    if (C) {
      let best = null;
      for (let k = 0; k < 120; k++) {
        const a = rnd() * TAU, rr = 10 + rnd() * 9, x = C.x + Math.cos(a) * rr, z = C.z + Math.sin(a) * rr;
        if (!w.inside(x, z, 20) || sol(x, z) < WL + 0.4 || !plat(x, z, 1.4, 0.6) || blocPres(x, z, 2.2) || propPres(x, z, 2.5) || loinInter(x, z) < 4) continue;
        const sc = -Math.abs(rr - 13) * 0.2 + rnd();
        if (!best || sc > best.sc) best = { x, z, sc };
      }
      // la cheminée (le bloc le plus haut des ruines) : la pierre du foyer est à son pied, du côté des ruines
      let ch = null;
      w.query(C.x, C.z, 10, null, (b) => { if (!b.under && Math.hypot(b.x - C.x, b.z - C.z) < 9 && b.sy > 3 && (!ch || b.sy > ch.sy)) ch = b; });
      let foyer = null;
      if (ch) {
        const vx = C.x - ch.x, vz = C.z - ch.z, n = Math.hypot(vx, vz) || 1, off = Math.max(ch.sx, ch.sz) / 2 + 0.55;
        const fx = ch.x + vx / n * off, fz = ch.z + vz / n * off;
        foyer = { x: fx, y: sol(fx, fz) + 0.25, z: fz };
      } else foyer = { x: C.x, y: sol(C.x, C.z) + 0.25, z: C.z };
      if (best) L.cheval = { x: best.x, y: sol(best.x, best.z), z: best.z, cap: rnd() * TAU, r: 14, sol: sol(best.x, best.z), ferme: C.key, foyer };
    }
  }
  return L;
}
{
  const _gv = generateValley;
  generateValley = async function (seed, progress, gen) {
    const w = await _gv(seed, progress, gen);
    if (w && w.lm) {
      try { w.betesP = bpLieux(w, seed); if (typeof betesParlantes !== 'undefined') betesParlantes._genW = w; } catch (e) { console.error('P : les bêtes qui parlent', e); }
    }
    return w;
  };
}

// ---------------------------------------------------------------- le jeu
const betesParlantes = {
  _genW: null, vivantes: [], t: 0, conv: null, lastH: null,

  // ------------------------------------------------------------- l'état sauvegardé
  S() {
    const s = farm.s;
    if (!s) return { v: 1, b: {}, morts: [], tues: 0, gens: {}, indice: {} };
    const S = s.betesParlantes && typeof s.betesParlantes === 'object' ? s.betesParlantes : (s.betesParlantes = {});
    if (!S.v) S.v = 1;
    for (const k of ['b', 'gens', 'indice']) if (!S[k] || typeof S[k] !== 'object') S[k] = {};
    if (!Array.isArray(S.morts)) S.morts = [];
    if (typeof S.tues !== 'number') S.tues = 0;
    return S;
  },
  B(id) {
    const S = this.S(), B = S.b[id] || (S.b[id] = {});
    for (const k of ['n', 'jours', 'conf', 'sj', 'ri', 'rn', 'sv', 'sc']) if (typeof B[k] !== 'number') B[k] = 0;
    if (!B.rq || typeof B.rq !== 'object') B.rq = {};
    if (!Array.isArray(B.au)) B.au = [];
    if (!Array.isArray(B.sait)) B.sait = [];
    return B;
  },
  // ------------------------------------------------------------- les endroits
  lieux(w) { w = w || this._genW || (typeof game !== 'undefined' && game.world); return (w && w.betesP) || {}; },
  lieu(id) { return this.lieux()[id] || null; },
  // pour les autres (agent R) : ne rien poser là
  places(w) { const L = this.lieux(w); return BP_ORDRE.filter((id) => L[id]).map((id) => ({ x: L[id].x, z: L[id].z, r: L[id].r || 10 })); },
  liste() { return BP_ORDRE.slice(); },
  titre(id) { const D = BP_BETES[id], B = this.B(id); return B.nomConnu ? bpCap(D.nom) : D.titre0; },
  // « Parler à Tibert », « Parler au Crapaud », « Parler à l’Écornée »
  etiquette(e) {
    const id = e.bp, D = BP_BETES[id], B = this.B(id);
    if (e.dead) return BP_MOTS.corps;
    if (e.bpEtat === 'dort') return D.labDort || D.titre0;
    if (!B.n) return D.titre0;
    return B.nomConnu ? D.lab : D.lab0;
  },
  heure() { try { return npcs.hour(); } catch (e) { return 12; } },
  muet(id) { const B = this.B(id); return !!B.muet || this.S().tues >= 3; },
  // ------------------------------------------------------------- est-elle là ?
  presence(id) {
    const D = BP_BETES[id], B = this.B(id), s = farm.s;
    if (!s || !this.lieu(id) || B.mort) return null;
    if (B.absent && s.day < B.absent) return null;
    if (B.fui === s.day) return null;
    const h = this.heure(), W = (typeof weather !== 'undefined' && weather.cur) || {}, pluie = W.rain || 0, neige = typeof vallee !== 'undefined' ? (vallee.snowK || 0) : 0;
    if (D.orage === 'fuit' && (W.storm || 0) > 0.5) return null;
    if (D.neige === 'fuit' && neige > 0.3) return null;
    if (D.pluie === 'fuit' && pluie > 0.5) return null;
    if (bpDans(h, D.heures)) return 'eveil';
    if (D.pluie === 'aime' && pluie > 0.25 && h > 6 && h < 20) return 'eveil';
    if (D.dort && bpDans(h, D.dort)) return 'dort';
    return null;
  },
  entite(id) { return this.vivantes.find((e) => e.bp === id && !e.removed) || null; },
  // ------------------------------------------------------------- paraître, s'en aller
  apparaitre(id) {
    const w = game.world, P = this.lieu(id), D = BP_BETES[id];
    if (!w || !P || this.entite(id)) return null;
    const e = entities.add(w, D.kind, P.x, P.z, { v: 0, scale: D.echelle || 1 });
    e.bp = id; e.y = P.y; e.heading = P.cap || 0; e.hx = P.x; e.hz = P.z; e.hp = D.hp || 20; e.lookY = 0; e.move = 0;
    e.bpEtat = this.presence(id) || 'eveil';
    if (e.rig) e.rig.bpE = e;
    if (this.B(id).mort) { e.dead = true; e.corpse = true; }
    this.vivantes.push(e);
    return e;
  },
  oter(e) { entities.remove(e); this.vivantes = this.vivantes.filter((q) => q !== e); if (this.conv && this.conv.id === e.bp && ui.panel === '#choice') ui.close(); },
  vue(x, y, z, eye, f) {
    const dx = x - eye[0], dy = y - eye[1], dz = z - eye[2], d = Math.hypot(dx, dy, dz);
    if (d < 1.5) return true;
    if (d > 110) return false;
    return (dx * f[0] + dy * f[1] + dz * f[2]) / d > 0.45;
  },
  // ------------------------------------------------------------- toutes les demi-secondes : qui paraît, qui s'en va
  maj(dt, eye, basis) {
    const w = game.world, p = game.player, s = farm.s;
    if (!w || !s || game.kind !== 'farm' || game.mode !== 'play') return;
    // (la conversation se referme si l'on s'éloigne)
    if (this.conv) {
      const e = this.entite(this.conv.id);
      if (ui.panel !== '#choice') this.conv = null;
      else if (!e || Math.hypot(e.x - p.pos[0], e.z - p.pos[2]) > 7) { ui.close(); this.conv = null; }
    }
    this.menaces(dt, eye, basis);
    this.t -= dt;
    if (this.t > 0) return;
    this.t = 0.5;
    this.vivantes = this.vivantes.filter((e) => !e.removed);
    const ailleurs = p.underground || (typeof strange !== 'undefined' && strange.inEnvers()) || (typeof mondes !== 'undefined' && mondes.cur);
    const L = this.lieux(w);
    for (const id of BP_ORDRE) {
      const P = L[id];
      if (!P) continue;
      const e = this.entite(id), d = Math.hypot(P.x - p.pos[0], P.z - p.pos[2]);
      if (e) {
        if (e.dead) { if (d > 130 || ailleurs) this.oter(e); continue; }
        if (e.bpFuite) continue;
        const pres = this.presence(id), vue = this.vue(e.x, e.y + 0.3, e.z, eye, basis.f), de = Math.hypot(e.x - p.pos[0], e.z - p.pos[2]);
        if (ailleurs || !pres || d > BP_R + 45) { if (ailleurs || !vue || de > 70) this.oter(e); continue; }
        if (e.bpEtat !== pres) e.bpEtat = pres;
        // sa voix, de temps en temps, quand on approche : on la trouve à l'oreille (rare, et doux)
        if (pres === 'eveil' && de < 40 && de > 4 && !this.conv && !this.muet(id)) {
          e.criT = (e.criT === undefined ? 6 + Math.random() * 10 : e.criT) - 0.5;
          if (e.criT <= 0) { e.criT = 35 + Math.random() * 45; sound.bpVoix && sound.bpVoix(id, [e.x, e.y + (e.h || 0.5) * 0.6, e.z], 0.7); }
        }
        // la première fois, elle parle la première
        const B = this.B(id);
        if (pres === 'eveil' && !B.app && !B.n && de < 6 && !this.muet(id) && vue) {
          B.app = s.day;
          sound.bpVoix && sound.bpVoix(id, [e.x, e.y + (e.h || 0.5) * 0.6, e.z]);
          ui.subtitle(BP_BETES[id].titre0, BP_TEXTES[id].approche, 5);
        }
        continue;
      }
      const B = this.B(id);
      if (B.mort || ailleurs || d > BP_R) continue;
      if (!this.presence(id)) continue;
      if (d < 50 && this.vue(P.x, P.y + 0.3, P.z, eye, basis.f)) continue; // (pas sous les yeux : on attend)
      this.apparaitre(id);
    }
    this.veille(eye);
  },
  // ------------------------------------------------------------- une arme pointée sur elle : elle s'en va
  menaces(dt, eye, basis) {
    if (!this.vivantes.length) return;
    const s = farm.s, it = ITEMS[s.hand], arme = !!(it && BP_ARMES.has(it.tool)), f = basis.f, peur = this.S().tues > 0;
    for (const e of this.vivantes) {
      if (e.removed || e.dead || e.bpFuite || e.hidden) continue;
      const dx = e.x - eye[0], dy = e.y + (e.h || 0.5) * 0.5 - eye[1], dz = e.z - eye[2], d = Math.hypot(dx, dy, dz);
      const vise = arme && d < (peur ? 26 : 16) && (dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1) > (d < 4 ? 0.9 : 0.965);
      e.bpVise = vise ? (e.bpVise || 0) + dt : 0;
      if (e.bpVise > (peur ? 0.35 : 0.8)) { e.bpVise = 0; this.fuir(e, 'menace'); }
    }
  },
  fuir(e, raison) {
    if (!e || e.bpFuite || e.dead) return;
    const id = e.bp, D = BP_BETES[id], T = BP_TEXTES[id], B = this.B(id), s = farm.s, p = game.player, pos = [e.x, e.y + (e.h || 0.5) * 0.6, e.z];
    e.bpFuite = { t: 0, mode: D.fuite, raison, dir: Math.atan2(e.x - p.pos[0], e.z - p.pos[2]) + (Math.random() - 0.5) * 0.7 };
    if (D.fuite === 'vole') e.bpFuite.dir = Math.atan2(e.x - p.pos[0], e.z - p.pos[2]) + (Math.random() - 0.5) * 1.2;
    B.fui = s.day;
    if (this.conv && this.conv.id === id && ui.panel === '#choice') ui.close();
    if (raison === 'menace' && !this.muet(id)) {
      if (B.menJour !== s.day) { B.menJour = s.day; B.conf -= 3; B.menaces = (B.menaces || 0) + 1; }
      sound.bpVoix && sound.bpVoix(id, pos, 0.8);
      ui.subtitle(this.titre(id), T.menace[0], 3.5);
      if (T.menace[1] && T.menace[1].charAt(0) === '(') setTimeout(() => { if (!game.dying) ui.subtitle('', T.menace[1], 3); }, 1600);
    }
    sound.bpFuite && sound.bpFuite(id, pos);
  },
  // un coup de feu, un bruit (entities.scare) : elle part, sans un mot
  // (pas le cri d'alarme d'un geai ni les petits remous : un coup de feu, une flèche tout près, le tonnerre, une bête tuée)
  effrayer(x, z, r) {
    if (r > 24 && r < 40) return;
    for (const e of this.vivantes) {
      if (e.removed || e.dead || e.bpFuite) continue;
      if (Math.hypot(e.x - x, e.z - z) < r) this.fuir(e, 'bruit');
    }
  },
  // ------------------------------------------------------------- la conduite (à chaque image, pour chaque bête présente)
  ia(e, dt, w, c) {
    const id = e.bp, P = this.lieu(id);
    if (!P) return;
    e.hurtT = Math.max(0, (e.hurtT || 0) - dt);
    e.parleT = Math.max(0, (e.parleT || 0) - dt);
    if (e.dead) { e.move = 0; return; }
    if (e.bpFuite) return this.iaFuite(e, dt, w, c);
    e.x = P.x; e.z = P.z; e.move = 0; e.run = false; e.state = 'idle';
    e.y = id === 'carpe' ? P.y + Math.sin(c.t * 0.8 + e.seed) * 0.025 : P.y;
    const dx = c.px - e.x, dz = c.pz - e.z, dd = Math.hypot(dx, dz), veut = Math.atan2(dx, dz);
    if (id === 'carpe') { e.lookY = 0; e.grazeT = 0; e.heading = turnToward(e.heading, dd < 10 ? veut : P.cap || 0, dt * 0.35); return; }
    if (dd < 10 && e.bpEtat !== 'dort') {
      const diff = angDiff(e.heading, veut);
      if (Math.abs(diff) > (id === 'hulotte' ? 2.2 : 0.9)) e.heading = turnToward(e.heading, veut, dt * 1.1);
      e.lookY = lerp(e.lookY || 0, clamp(angDiff(e.heading, veut), id === 'hulotte' ? -2.4 : -1.1, id === 'hulotte' ? 2.4 : 1.1), Math.min(1, dt * 3));
      e.grazeT = 0;
    } else {
      e.heading = turnToward(e.heading, P.cap || 0, dt * 0.4);
      e.lookY = lerp(e.lookY || 0, Math.sin(c.t * 0.25 + e.seed) * 0.5, Math.min(1, dt));
      e.grazeT = (id === 'cheval' || id === 'chevre') && e.bpEtat !== 'dort' ? Math.max(0, Math.sin(c.t * 0.3 + e.seed) * 1.2) : 0;
    }
  },
  iaFuite(e, dt, w, c) {
    const F = e.bpFuite, P = this.lieu(e.bp);
    F.t += dt;
    e.lookY = 0; e.grazeT = 0;
    if (F.mode === 'court') {
      e.heading = turnToward(e.heading, F.dir, dt * 5);
      const x0 = e.x, z0 = e.z;
      entities.stepMove(e, dt, w, e.cfg.run);
      if (Math.hypot(e.x - x0, e.z - z0) < e.cfg.run * dt * 0.2) F.dir += (Math.random() < 0.5 ? 1 : -1) * dt * 6;
      e.state = 'flee'; e.move = 1; e.run = true; e.phase += dt * e.cfg.run * 2.6 / Math.max(0.5, e.h);
    } else if (F.mode === 'vole') {
      e.fly = 1; e.heading = turnToward(e.heading, F.dir, dt * 4);
      e.y += dt * (F.t < 1.2 ? 2.2 : 4.5); e.x += Math.sin(e.heading) * dt * 7; e.z += Math.cos(e.heading) * dt * 7;
    } else if (F.mode === 'puits' && P && P.puits) {
      const [cx, cz] = P.puits, d = Math.hypot(cx - e.x, cz - e.z);
      if (d > 0.08 && F.t < 0.6) { e.heading = Math.atan2(cx - e.x, cz - e.z); e.x += (cx - e.x) * Math.min(1, dt * 5); e.z += (cz - e.z) * Math.min(1, dt * 5); e.y += Math.sin(F.t * 5) * dt * 0.8; }
      else { e.y -= dt * 5; if (e.y < (P.sol || P.y) - 0.6) e.hidden = true; }
    } else if (F.mode === 'plonge') {
      e.y -= dt * 0.9; e.heading += dt * 0.7;
      if (F.t > 1.5) e.hidden = true;
    } else { e.hidden = true; }
    const de = Math.hypot(e.x - c.px, e.z - c.pz);
    const vue = this.vue(e.x, e.y + 0.3, e.z, game.player.eyePos(), cameraBasis(game.player.yaw, game.player.pitch).f);
    if (F.t > 9 || e.hidden || (F.t > 2.5 && (de > 32 || !vue))) this.oter(e);
  },

  // ------------------------------------------------------------- la touche E : sur la bête (ou ce qu'elle laisse)
  cibles(eye, f, cand) {
    const w = game.world;
    for (const e of this.vivantes) {
      if (e.removed || e.hidden || e.bpFuite) continue;
      const ty = e.y + (e.h || 0.5) * (e.bp === 'carpe' ? 0.2 : 0.55) + (e.bpDy || 0), dx = e.x - eye[0], dy = ty - eye[1], dz = e.z - eye[2], d = Math.hypot(dx, dy, dz);
      const R = e.bp === 'cheval' ? 3.8 : e.bp === 'carpe' || e.bp === 'corbeau' || e.bp === 'hulotte' ? 3.6 : 3.2;
      if (d > R) continue;
      const cos = (dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1);
      if (cos < (d < 1.5 ? 0.6 : 0.82)) continue;
      const bh = w.raycastBlocks(eye, [dx / d, dy / d, dz / d], Math.max(0, d - 0.6));
      if (bh && !bh.block.hidden) continue;
      // (regardée bien en face, elle passe avant l'arbre, le tonneau ou la margelle derrière elle)
      cand({ kind: 'hook', bpE: e, use: () => this.utiliser(e), f2lab: this.etiquette(e) }, Math.max(0.05, Math.min(2.6, d * (1.6 - cos * 0.6)) * (cos > 0.95 ? 0.2 : 0.45)));
    }
    // la pierre du foyer, à la ferme brûlée (quand Bayard en a parlé)
    const S = this.S(), Fo = S.foyer;
    if (Fo && !Fo.ouvert) {
      const dx = Fo.x - eye[0], dy = Fo.y - eye[1], dz = Fo.z - eye[2], d = Math.hypot(dx, dy, dz);
      if (d < 2.6 && (dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1) > 0.7) cand({ kind: 'hook', use: () => this.ouvrirFoyer(), f2lab: BP_MOTS.pierreFoyer }, d * 0.8);
    }
  },
  utiliser(e) {
    const id = e.bp, D = BP_BETES[id], T = BP_TEXTES[id], B = this.B(id);
    if (e.dead) return this.corps(e);
    if (this.muet(id)) {
      ui.subtitle('', T.muet, 4.5);
      if (id === 'renarde' || id === 'carpe' || id === 'hulotte') setTimeout(() => this.fuir(e, 'muet'), 900);
      return;
    }
    if (e.bpEtat === 'dort') { ui.subtitle('', T.dort ? T.dort[(B.dn = (B.dn || 0) + 1) % T.dort.length] : '…', 3.5); return; }
    this.converser(id);
  },
  corps(e) {
    const id = e.bp, S = this.S();
    if (id === 'crapaud' && !S.pierreTerne) {
      S.pierreTerne = 1;
      farm.give('pierre_terne', 1); play.flyer('pierre_terne', [e.x, e.y + 0.2, e.z], 1);
      ui.subtitle('', BP_MOTS.corpsCrapaud, 4.5);
      return;
    }
    ui.subtitle('', BP_MOTS.corpsAutre[(S.corpsN = (S.corpsN || 0) + 1) % BP_MOTS.corpsAutre.length], 3.5);
  },

  // ------------------------------------------------------------- la conversation
  converser(id) {
    const s = farm.s, B = this.B(id), S = this.S(), premier = !B.n, jourAvant = B.jour;
    if (premier) {
      B.rqc = this.nCrimes(); B.rqt = this.nTableau(); B.rqp = this.nPeche(); B.sait = S.morts.map((m) => m.id);
      S.rencontres = (S.rencontres || 0) + 1;
    }
    if (B.jour !== s.day) { B.jours++; B.jour = s.day; if (!premier) B.conf += 1; }
    B.n++;
    this.temoin();
    const g = premier ? { texte: BP_TEXTES[id].intro } : this.salut(id, jourAvant);
    this.dire(id, g.texte, g.opts);
  },
  // quelqu'un passe, et vous voit parler à une bête : il n'y croit pas, ou fait semblant (une fois par jour)
  temoin() {
    const S = this.S(), s = farm.s, p = game.player;
    if (S.temoinJour === s.day) return;
    let best = null, bd = 11;
    for (const n of npcs.list) {
      if (!n.st || !n.st.alive || n.vanished || n.hunting || n.inside || n.state === 'sleep' || n.state === 'gone') continue;
      const d = Math.hypot(n.x - p.pos[0], n.z - p.pos[2]);
      if (d < bd) { bd = d; best = n; }
    }
    if (!best) return;
    S.temoinJour = s.day;
    const n = best, l = BP_MOTS.temoins[(s.day + n.id.length) % BP_MOTS.temoins.length];
    setTimeout(() => { try { if (n.st.alive && !game.dying) npcs.say(n, l, 3.5); } catch (e) { console.error(e); } }, 1800);
  },
  dire(id, texte, opts) {
    const e = this.entite(id);
    if (e) { sound.bpVoix && sound.bpVoix(id, [e.x, e.y + (e.h || 0.5) * 0.6, e.z]); e.parleT = Math.min(5, 0.8 + String(texte).length * 0.025); }
    this.conv = { id };
    ui.choice(this.titre(id), texte, opts || this.options(id));
  },
  quitter(id) {
    const T = BP_TEXTES[id], B = this.B(id), e = this.entite(id);
    ui.close();
    this.conv = null;
    const l = T.adieu[(B.ad = (B.ad || 0) + 1) % T.adieu.length];
    if (e) sound.bpVoix && sound.bpVoix(id, [e.x, e.y + (e.h || 0.5) * 0.6, e.z], 0.8);
    ui.subtitle(this.titre(id), l, 4);
  },
  // ce qu'elle dit d'abord (jourAvant : le dernier jour où on lui a parlé, avant celui-ci)
  salut(id, jourAvant) {
    const D = BP_BETES[id], T = BP_TEXTES[id], B = this.B(id), S = this.S(), s = farm.s, day = s.day, h = this.heure();
    // une bête tuée par le joueur, qu'elle n'a pas encore reprochée
    const neuves = S.morts.filter((m) => m.id !== id && !B.sait.includes(m.id));
    if (neuves.length) {
      for (const m of neuves) B.sait.push(m.id);
      B.conf -= 2;
      const m = neuves[neuves.length - 1];
      return { texte: T.peur.replace('{nom}', bpCap(BP_BETES[m.id].nom)) };
    }
    if (B.blesse && !B.reproche) { B.reproche = 1; return { texte: T.blesse }; }
    // la promesse de la carpe : tenue, ou rompue
    if (D.service.promesse && B.sv === 1) {
      if (this.nCarpes() > (B.pv || 0)) { B.sv = -1; B.rompu = day; return { texte: T.service.rompu }; }
      if (day >= (B.pj || day) + D.service.promesse) { B.sv = 2; B.conf += 3; this.donner('bijou', 1, this.entite(id)); B.note = BP_MOTS.donne; return { texte: T.service.merci }; }
    }
    // la question, le deuxième jour où l'on se parle
    if (!B.q && B.jours >= 2 && B.qj !== day) {
      B.qj = day;
      return { texte: T.question.texte, opts: T.question.reponses.map((r, i) => ({ label: r.label, fn: () => { B.q = i + 1; B.qj = day; B.conf += 1; this.dire(id, r.reaction); } })) };
    }
    if (jourAvant && day - jourAvant > 6) return { texte: T.retour[B.n % T.retour.length] };
    const rq = this.remarque(id);
    if (rq) return { texte: rq };
    if (B.q && B.rap !== day && day - (B.qj || 0) >= 2 && Math.random() < 0.35) { B.rap = day; return { texte: T.question.reponses[B.q - 1].rappel }; }
    if (typeof strange !== 'undefined' && strange.wasRedNight && strange.wasRedNight() && B.nr !== day && T.nuitRouge) { B.nr = day; return { texte: T.nuitRouge }; }
    if (B.mj !== day) {
      const l = this.meteoLigne(id) || this.jourLigne(id);
      if (l) { B.mj = day; return { texte: l }; }
    }
    const k = h >= 5 && h < 10 ? 'matin' : h >= 10 && h < 17.5 ? 'jour' : h >= 17.5 && h < 21.5 ? 'soir' : 'nuit';
    const L = (T.salut[k] && T.salut[k].length && T.salut[k][0] !== '…' ? T.salut[k] : null) || T.salut.soir || T.salut.jour || T.salut.nuit;
    return { texte: L[B.n % L.length] };
  },
  meteoLigne(id) {
    const W = (typeof weather !== 'undefined' && weather.cur) || {}, M = BP_TEXTES[id].meteo || {}, neige = typeof vallee !== 'undefined' ? (vallee.snowK || 0) : 0;
    if ((W.storm || 0) > 0.5 && M.orage) return M.orage;
    if (neige > 0.2 && M.neige) return M.neige;
    if ((W.rain || 0) > 0.3 && M.pluie) return M.pluie;
    if ((W.fog || 0) > 0.5 && M.brouillard) return M.brouillard;
    if ((W.frost || 0) > 0.4 && M.gel) return M.gel;
    if ((W.heat || 0) > 0.5 && M.chaleur) return M.chaleur;
    return null;
  },
  jourLigne(id) { try { return (BP_TEXTES[id].jours || {})[cal.jour(farm.s.day).cle] || null; } catch (e) { return null; } },
  // ce qu'elle a remarqué de ce que le joueur a fait (une fois, ou de nouveau après quelques jours)
  remarque(id) {
    const T = BP_TEXTES[id], B = this.B(id), s = farm.s, day = s.day, R = T.remarques || {};
    const encore = (k, j) => B.rq[k] === undefined || (j && day - B.rq[k] >= j);
    const tests = {
      crimes: () => { const n = this.nCrimes(); if (n > (B.rqc || 0)) { B.rqc = n; return true; } return false; },
      chasse: () => { const n = this.nTableau(); if (n >= (B.rqt || 0) + 4) { B.rqt = n; return true; } return false; },
      peche: () => { const n = this.nPeche(); if (n >= (B.rqp || 0) + 10) { B.rqp = n; return true; } return false; },
      chienMort: () => encore('chienMort') && !!(s.dog && s.dog.alive === false),
      chienFaim: () => encore('chienFaim', 3) && typeof chien !== 'undefined' && chien.vivant() && chien.stade() >= 1,
      chien: () => encore('chien') && typeof chien !== 'undefined' && chien.vivant(),
      recherche: () => encore('recherche', 5) && typeof societe !== 'undefined' && !!(societe.recherche && societe.recherche()),
      esprit: () => encore('esprit', 4) && typeof esprit !== 'undefined' && esprit.niveau() < 40,
      versions: () => encore('versions') && farm.history().length > 0,
      vaisseau: () => encore('vaisseau') && !!(s.vaisseau && s.vaisseau.etat === 2),
      envers: () => encore('envers') && (s.flags.envers || 0) > 0,
      lise: () => encore('lise') && typeof myths !== 'undefined' && myths.isFound && myths.isFound('lise'),
      pieges: () => encore('pieges') && game.world && game.world.props.slice(farm.genProps || 0).some((q) => q.id === 'piege_loup' && !q.gone),
      froid: () => encore('froid', 5) && typeof vallee !== 'undefined' && (vallee.snowK || 0) > 0.2,
      cygne: () => encore('cygne') && typeof chasse !== 'undefined' && ((chasse.S().tableau || {}).swan || 0) > 0,
      cheval: () => encore('cheval') && (s.animals || []).some((a) => a.kind === 'horse' && !a.dead),
    };
    for (const k of Object.keys(R)) {
      let ok = false;
      try { ok = tests[k] ? tests[k]() : false; } catch (e) { ok = false; }
      if (ok) { B.rq[k] = day; return R[k]; }
    }
    // le cheval se souvient de ceux d'avant (l'historique des parties)
    if (id === 'cheval' && B.rq.versions === undefined && B.jours >= 2) {
      const H = farm.history();
      if (H.length) {
        B.rq.versions = day;
        const hh = H[H.length - 1], V = BP_VERSIONS.cheval;
        return V[H.length % V.length].replace('{qui}', hh.name ? hh.name : 'Celui d’avant toi').replace('{jours}', String(hh.day || 1)).replace(/^Celui d’avant toi, Celui d’avant toi,/, 'Celui d’avant toi,');
      }
    }
    // le nonos retrouvé (quête de l'agent Q)
    if (T.nonosFini && B.rq.nonosFini === undefined && this.nonosEtape() >= 6) { B.rq.nonosFini = day; return T.nonosFini; }
    return null;
  },
  nonosEtape() { try { return typeof nonos !== 'undefined' && nonos.etape ? (nonos.etape() | 0) : 0; } catch (e) { return 0; } },
  nCrimes() { const r = farm.s && farm.s.rep; return (r && Array.isArray(r.crimes) && r.crimes.length) || 0; },
  nTableau() { try { const T = typeof chasse !== 'undefined' ? chasse.S().tableau || {} : {}; let n = 0; for (const k in T) n += T[k] || 0; return n; } catch (e) { return 0; } },
  nPeche() { try { let n = 0; const V = savoir.S().vus; if (typeof FISH !== 'undefined') for (const k in FISH) n += V[k] || 0; return n; } catch (e) { return 0; } },
  nCarpes() { try { const P = BP_BETES.carpe.service.poissons; return P.reduce((a, k) => a + (savoir.vu(k) || 0), 0); } catch (e) { return 0; } },
  // les choix
  options(id) {
    const D = BP_BETES[id], T = BP_TEXTES[id], B = this.B(id), s = farm.s, vous = !D.tu, O = [], SV = D.service || {};
    if (!B.nomConnu) O.push({ label: vous ? BP_MOTS.quiVous : BP_MOTS.qui, fn: () => { B.nomConnu = 1; this.dire(id, T.qui); } });
    else if (!B.pq) O.push({ label: vous ? BP_MOTS.pourquoiVous : BP_MOTS.pourquoi, fn: () => { B.pq = 1; this.dire(id, T.pourquoi[0]); } });
    else if (B.pq === 1 && B.conf >= 4) O.push({ label: vous ? BP_MOTS.encoreVous : BP_MOTS.encore, fn: () => { B.pq = 2; this.dire(id, T.pourquoi[1]); } });
    // son sujet : une ligne nouvelle par jour, à mesure de la confiance
    const SJ = T.sujet.lignes;
    if (B.sj < SJ.length && B.conf >= BP_SEUILS[B.sj] && B.sjJour !== s.day) O.push({ label: T.sujet.label, fn: () => { const l = SJ[B.sj]; B.sj++; B.sjJour = s.day; this.dire(id, l); } });
    // deux rumeurs par jour
    if (B.rj !== s.day || B.rn < 2) O.push({ label: BP_MOTS.rumeur, fn: () => { if (B.rj !== s.day) { B.rj = s.day; B.rn = 0; } B.rn++; const R = T.rumeurs; this.dire(id, R[B.ri++ % R.length]); } });
    // le service
    if (SV.objets) {
      if (!B.sv) O.push({ label: T.service.label, fn: () => { B.sv = 1; B.svj = s.day; this.dire(id, T.service.demande); } });
      else if (B.sv === 1) {
        if (this.aDe(SV.objets)) O.push({ label: T.service.donner, fn: () => this.servir(id) });
        else O.push({ label: vous ? BP_MOTS.dejaVous : BP_MOTS.deja, fn: () => this.dire(id, T.service.attente) });
      } else if (B.sv === 2 && SV.cadeau && B.cj !== s.day && this.aDe([[SV.cadeau, 1]])) O.push({ label: T.service.donner, fn: () => this.cadeau(id) });
    } else if (SV.veille) {
      if (!B.sv) O.push({ label: T.service.label, fn: () => { B.sv = 1; B.svj = s.day; B.vh = 0; this.dire(id, T.service.demande); } });
    } else if (SV.promesse) {
      if (!B.sv) O.push({ label: T.service.label, fn: () => this.dire(id, T.service.demande, [
        { label: T.service.promettre, fn: () => { B.sv = 1; B.pj = s.day; B.pv = this.nCarpes(); this.dire(id, T.service.accepte); } },
        { label: T.service.refuser, fn: () => { B.refus = s.day; this.dire(id, T.service.refus); } },
      ]) });
      else if (B.sv === 1) O.push({ label: BP_MOTS.septJours, fn: () => this.dire(id, T.service.attente.replace('{n}', String(Math.max(1, (B.pj || s.day) + SV.promesse - s.day)))) });
    }
    // les autres bêtes qui parlent
    const autres = Object.keys(T.autres || {}).filter((k) => !B.au.includes(k));
    if (autres.length && B.conf >= 1 && B.jours >= 1) O.push({ label: vous ? BP_MOTS.autresVous : BP_MOTS.autres, fn: () => { const k = autres[0]; B.au.push(k); this.S().indice[k] = s.day; this.dire(id, T.autres[k]); } });
    // le nonos du chien, pendant la quête (agent Q) : un mot, jamais le chemin
    const et = this.nonosEtape();
    if (T.nonos && et >= 1 && et <= 5 && B.nonos !== et) O.push({ label: vous ? BP_MOTS.nonosVous : BP_MOTS.nonos, fn: () => { B.nonos = et; this.dire(id, T.nonos); } });
    O.push({ label: BP_MOTS.bye, fn: () => this.quitter(id) });
    return O;
  },
  // ------------------------------------------------------------- donner, rendre la pareille
  aDe(liste) {
    for (const [k, n] of liste) {
      const G = BP_GROUPES[k];
      if (!G) { if (farm.count(k) < n) return false; continue; }
      let c = 0;
      for (const id in farm.s.inv) if (farm.s.inv[id] > 0 && G.ok(id)) c += farm.s.inv[id];
      if (c < n) return false;
    }
    return true;
  },
  prendre(liste) {
    const pris = [];
    for (const [k, n0] of liste) {
      const G = BP_GROUPES[k];
      if (!G) { farm.take(k, n0); pris.push(k); continue; }
      let n = n0;
      // (ce qu'on a en main d'abord, puis le moins cher)
      const ids = Object.keys(farm.s.inv).filter((id) => farm.s.inv[id] > 0 && G.ok(id)).sort((a, b) => (a === farm.s.hand ? -1 : b === farm.s.hand ? 1 : (ITEMS[a].price || 0) - (ITEMS[b].price || 0)));
      for (const id of ids) { while (n > 0 && farm.count(id) > 0) { farm.take(id, 1); n--; pris.push(id); } if (n <= 0) break; }
    }
    return pris;
  },
  donner(id, n, e) {
    farm.give(id, n);
    const p = e ? [e.x, e.y + 0.4, e.z] : game.player.eyePos();
    play.flyer && play.flyer(id, p, n);
    sound.pop && sound.pop();
  },
  servir(id) {
    const D = BP_BETES[id], T = BP_TEXTES[id], B = this.B(id), e = this.entite(id);
    if (!this.aDe(D.service.objets)) return this.dire(id, T.service.attente);
    this.prendre(D.service.objets);
    B.sv = 2; B.svf = farm.s.day; B.conf += 3;
    const r = this.recompense(id, e);
    this.dire(id, T.service.merci + (r ? ' ' + r : ''));
  },
  cadeau(id) {
    const D = BP_BETES[id], T = BP_TEXTES[id], B = this.B(id);
    this.prendre([[D.service.cadeau, 1]]);
    B.cj = farm.s.day; B.conf += 1; B.cadeaux = (B.cadeaux || 0) + 1;
    let l = T.secrets && B.sc < T.secrets.length ? T.secrets[B.sc++] : null;
    if (!l) { const r = T.rumeurs[B.ri++ % T.rumeurs.length]; l = r.charAt(0).toLowerCase() + r.slice(1); }
    this.dire(id, T.service.cadeau[B.cadeaux % T.service.cadeau.length] + l);
  },
  // la pareille : un objet, un renseignement, un endroit (renvoie ce qu'elle dit en plus)
  recompense(id, e) {
    const B = this.B(id), w = game.world, s = farm.s, P = this.lieu(id);
    switch (id) {
      case 'chat': {
        // l'assassin caché : son odeur (jamais son nom) ; sinon, la cave des Murés
        const k = typeof strange !== 'undefined' && strange.s && strange.killerPhase && strange.killerPhase() >= 1 ? strange.s.killer : null;
        if (k && npcs.alive && npcs.alive(k)) {
          const od = BP_ODEURS[k] || 'quelque chose que je ne connais pas';
          B.note = `Celui qui sort la nuit sent ${od}.`;
          return `Il y a quelqu’un, en ville, qui sort la nuit par la porte de derrière et qui rentre avant la boulangère. Je ne vous dirai pas son nom ; je ne le sais pas. Je vous dirai son odeur : ${od}. Et du sang, par-dessus, qu’on a lavé à l’eau froide.`;
        }
        if (w.lm.sout_cave && savoir.connaitreLieu) savoir.connaitreLieu('sout_cave');
        B.note = 'Sous la rue de la porte du midi, une cave murée.';
        return 'Entre la place et la porte du midi, sous la rue, il y a une cave qu’on a murée avec des gens dedans, du temps de la peste. La grille est dans les douves, au pied de la tour. Les rats y passent. Moi, je ne passe pas où passent les rats.';
      }
      case 'crapaud': this.donner('crapaudine', 1, e); B.note = BP_MOTS.donne; return '';
      case 'corbeau': {
        const k = BP_SECRETS_LIEUX.find((q) => w.lm[q] && !savoir.lieuConnu(q) && !(this.S().ditLieux || []).includes(q));
        if (!k) { B.note = BP_MOTS.donne; return BP_TEXTES.corbeau.secrets[0]; }
        (this.S().ditLieux = this.S().ditLieux || []).push(k);
        const Lk = w.lm[k], dir = bpDir(Lk.x - P.x, Lk.z - P.z), d = Math.hypot(Lk.x - P.x, Lk.z - P.z), loin = d < 500 ? 'pas très loin d’ici' : d < 1100 ? 'à une bonne heure de marche' : 'loin d’ici';
        const T = {
          grotte_peinte: `Il y a, ${dir}, ${loin}, dans le bois de bouleaux, un trou dans la roche où des hommes très anciens ont dessiné des bêtes. Les bêtes dessinées me regardent quand j’y entre. Je n’y entre plus.`,
          grotte_contrebandiers: `Il y a, ${dir}, ${loin}, dans la forêt, une grotte où des hommes cachaient du sel et du tabac, du temps des gabelous. Ils ont laissé quelque chose. Je n’ai pas pu le soulever.`,
          grotte_cristaux: `Il y a, ${dir}, ${loin}, sous les arbres, une grotte pleine de pierres qui brillent toutes seules. C’est le seul endroit de la vallée que je n’ai jamais pu voler. Elles sont trop lourdes.`,
          antre: `Il y a, ${dir}, ${loin}, entre la lande et les bois, un trou qui sent le loup, mais plus gros que le loup. Je n’y descends pas. Je te dis où c’est pour que tu n’y ailles pas.`,
        };
        savoir.connaitreLieu && savoir.connaitreLieu(k);
        B.note = (T[k] || '').replace(/^Il y a, /, '').split('.')[0] + '.';
        return T[k] || '';
      }
      case 'renarde': {
        // une cache enterrée qu'on n'a pas encore creusée, la plus proche de la ferme
        const F = w.lm.ferme || { x: w.spawn.x, z: w.spawn.z };
        const caches = (w.inter || []).filter((it) => it.kind === 'dig' && /^cache/.test(it.id || '') && !s.flags['dug_' + it.id]).sort((a, b) => Math.hypot(a.x - F.x, a.z - F.z) - Math.hypot(b.x - F.x, b.z - F.z));
        const C = caches[0];
        if (!C) { B.note = BP_MOTS.donne; return BP_TEXTES.renarde.secrets[0]; }
        let best = null, bd = 1e9;
        for (const k in w.lm) { const L = w.lm[k]; if (L.under || L.secret || !L.name || L.name === k || /^sout_|^c2_\d+$/.test(k) && !L.name) continue; const d = Math.hypot(L.x - C.x, L.z - C.z); if (d < bd) { bd = d; best = L; } }
        const ou = best ? `${bpPas(bd)} ${bpDir(C.x - best.x, C.z - best.z)} de ${best.name}` : bpDir(C.x - P.x, C.z - P.z);
        B.note = `De la terre retournée, ${ou}.`;
        this.S().cache = { id: C.id, j: s.day };
        return `Les renards savent où dorment les choses enterrées. Il y a quelque chose sous la terre, ${ou}. Quelqu’un l’a mis là il y a longtemps, et il n’est jamais revenu. La terre a gardé la forme de sa pelle. Prends une houe.`;
      }
      case 'chevre': {
        const Fe = w.lm.fente_nains, Co = w.lm.col || P;
        if (Fe) savoir.connaitreLieu && savoir.connaitreLieu('fente_nains');
        const dir = Fe ? bpDir(Fe.x - Co.x, Fe.z - Co.z) : 'vers le levant';
        B.note = `Au-dessus du col des Treize, ${dir}, une falaise fendue.`;
        return `Au-dessus du col des Treize, ${dir}, il y a une falaise fendue de haut en bas. Le soir, appuie ton oreille contre la pierre. Si ça répond, frappe trois fois, et puis une. Moi, je n’y suis jamais allée. Je mens : j’y suis allée une fois.`;
      }
      case 'cheval': {
        const Fo = P && P.foyer;
        if (Fo) this.S().foyer = { x: Fo.x, y: Fo.y, z: Fo.z, ouvert: false };
        B.note = BP_MOTS.sousPierre;
        return '';
      }
    }
    return '';
  },
  ouvrirFoyer() {
    const S = this.S(), Fo = S.foyer;
    if (!Fo || Fo.ouvert) return;
    Fo.ouvert = farm.s.day;
    sound.dig ? sound.dig(0.6) : sound.pop && sound.pop();
    farm.earn(42); sound.coin && sound.coin();
    this.donner('vieille_piece', 2, { x: Fo.x, y: Fo.y, z: Fo.z });
    const m = { from: BP_MOTS.lettreSigne, title: BP_MOTS.lettreTitre, text: BP_MOTS.lettre, day: farm.s.day, read: true };
    if (Array.isArray(farm.s.mail)) farm.s.mail.push(m);
    setTimeout(() => ui.read(BP_MOTS.lettreTitre, BP_MOTS.lettre, BP_MOTS.lettreSigne), 700);
  },
  // la veille avec la hulotte : deux heures de nuit, à côté d'elle, sans lumière
  veille(eye) {
    const B = this.B('hulotte'), s = farm.s, h = s.hours;
    const dh = this.lastH === null ? 0 : Math.max(0, Math.min(1, h - this.lastH));
    this.lastH = h;
    if (B.sv !== 1) return;
    const e = this.entite('hulotte');
    if (!e || e.dead || e.bpFuite || e.bpEtat !== 'eveil') return;
    const d = Math.hypot(e.x - eye[0], e.z - eye[2]);
    if (d > 20) { B.vh = 0; return; }
    if (d > 12) return;
    if (game.lantern) {
      const nuit = s.day; // (le jour change à six heures : une nuit tient dans un seul jour)
      if (B.lum !== nuit) { B.lum = nuit; sound.bpVoix && sound.bpVoix('hulotte', [e.x, e.y + 0.3, e.z], 0.7); ui.subtitle(this.titre('hulotte'), BP_TEXTES.hulotte.service.lumiere, 4); }
      return;
    }
    B.vh = (B.vh || 0) + dh;
    if (B.vh >= BP_BETES.hulotte.service.veille) {
      B.sv = 2; B.svf = s.day; B.conf += 3; B.note = BP_MOTS.donne;
      this.donner('plume_hulotte', 1, e);
      sound.bpVoix && sound.bpVoix('hulotte', [e.x, e.y + 0.3, e.z]);
      ui.subtitle(this.titre('hulotte'), BP_TEXTES.hulotte.service.merci, 9);
    }
  },

  // ------------------------------------------------------------- les coups
  blesser(e, dmg, eye) {
    const id = e.bp, D = BP_BETES[id], B = this.B(id), s = farm.s;
    if (e.dead) return false;
    e.hp -= dmg; e.hurtT = 0.3;
    sound.bpVoix && sound.bpVoix(id, [e.x, e.y + (e.h || 0.5) * 0.6, e.z], 1.3);
    if (e.hp <= 0) { this.tuer(e); return true; }
    B.blesse = (B.blesse || 0) + 1; B.blesseJour = s.day; B.reproche = 0; B.absent = s.day + 3; B.conf -= 5;
    if (B.blesse >= 2) B.muet = 1;
    if (typeof esprit !== 'undefined') esprit.changer(-3, 'bête qui parle, blessée', 6);
    e.bpFuite = null;
    this.fuir(e, 'blesse');
    return false;
  },
  tuer(e) {
    const id = e.bp, D = BP_BETES[id], B = this.B(id), S = this.S(), s = farm.s;
    e.dead = true; e.corpse = true; e.hidden = false; e.bpFuite = null; e.move = 0; e.state = 'sheltered'; e.fly = 0;
    // la hulotte tombe de son chicot, à côté ; le corbeau reste sur la Table, le crapaud sur la margelle
    if (id === 'hulotte') { const P = this.lieu(id); if (P && P.sol !== undefined) { e.x += Math.sin(P.cap || 0) * 0.5; e.z += Math.cos(P.cap || 0) * 0.5; e.y = P.sol; } }
    B.mort = s.day;
    S.morts.push({ id, j: s.day });
    S.tues++;
    S.cauchemar = Math.max(S.cauchemar || 0, 3);
    if (this.conv && this.conv.id === id && ui.panel === '#choice') ui.close();
    if (typeof esprit !== 'undefined') esprit.changer(-12, 'une bête qui parlait, tuée', 14);
    sound.whisper && sound.whisper(0, 0.35);
    ui.subtitle('', D.fem ? BP_MOTS.tuee : BP_MOTS.tue, 5);
    if (S.tues === 3) setTimeout(() => { if (!game.dying) ui.subtitle('', BP_MOTS.silence, 5); }, 6000);
    entities.scare(e.x, e.z, 20);
  },

  // ------------------------------------------------------------- chaque matin
  jour() {
    const S = this.S(), s = farm.s;
    if (S.cauchemar > 0) {
      S.cauchemar--;
      if (typeof esprit !== 'undefined') esprit.changer(-1, 'cauchemar d’une bête', 2);
      setTimeout(() => { if (!game.dying) ui.subtitle('', BP_MOTS.cauchemar[S.cauchemar % BP_MOTS.cauchemar.length], 4.5); }, 3500);
    } else if (farm.count('plume_hulotte') && typeof esprit !== 'undefined') esprit.changer(0.6, 'la plume de la hulotte', 0.6);
    // la promesse de la carpe : rompue dès qu'on pêche une carpe (on le saura à la prochaine visite)
  },
  // ------------------------------------------------------------- le carnet de la sacoche
  carnetHTML() {
    const S = this.S(), L = [];
    for (const id of BP_ORDRE) {
      const B = S.b[id];
      if (!B || !B.n) continue;
      const D = BP_BETES[id], T = BP_TEXTES[id];
      let etat = '';
      if (B.mort) etat = D.fem ? BP_MOTS.morte : BP_MOTS.mort;
      else if (this.muet(id)) etat = BP_MOTS.muette;
      else if (B.sv === 1) {
        if (D.service.objets) etat = BP_MOTS.demande + ' : ' + D.service.objets.map(([k, n]) => (BP_GROUPES[k] ? BP_GROUPES[k].nom : (n > 1 ? n + ' × ' : '') + itemName(k).toLowerCase())).join(', ') + '.';
        else if (D.service.veille) etat = BP_MOTS.veille;
        else if (D.service.promesse) etat = BP_MOTS.promesse;
      } else if (B.sv === -1) etat = BP_MOTS.rompue;
      const note = B.note && B.note !== BP_MOTS.donne ? B.note : '';
      L.push(`<p><b>${esc(B.nomConnu ? bpCap(D.nom) : D.titre0)}</b> — ${esc(D.ou)}.${etat ? ` <i>${esc(etat)}</i>` : ''}${note ? ` ${esc(note)}` : ''}</p>`);
    }
    const ind = Object.keys(S.indice || {}).filter((id) => BP_BETES[id] && !(S.b[id] && S.b[id].n));
    for (const id of ind) L.push(`<p class="bp-ind">${esc(bpCap(BP_BETES[id].qui))} — ${esc(BP_BETES[id].ou)} ?</p>`);
    if (!L.length) return '';
    return `<h4>${esc(BP_MOTS.carnet)}</h4><div class="bp-carnet">${L.join('')}<p class="hint">${esc(BP_MOTS.carnetVide)}</p></div>`;
  },

  // ------------------------------------------------------------- les dessins (chaque image)
  dessiner(buf, sbuf, cam, maxD, t, flags) {
    const m2 = maxD * maxD, w = game.world;
    for (const e of this.vivantes) {
      if (e.removed || e.hidden || !e.rig || (e.dead && !e.corpse)) continue;
      const dx = e.x - cam[0], dz = e.z - cam[2];
      if (dx * dx + dz * dz > m2) continue;
      const r = e.rig;
      const st = { move: e.move, phase: e.phase, run: e.run, t, graze: e.grazeT, lookY: e.lookY, wag: false, fly: e.fly || 0, peck: false, seed: e.seed, lie: !!e.dead };
      if (r.kind === 'bird') poseBird(r, st); else poseQuad(r, st);
      const dy = bpPose(r, e, st, t) * (e.scale || 1);
      e.bpDy = dy;
      let fl = e.hurtT > 0 || e.highlight ? FX_HI : 0;
      drawRig(buf, r, e.x, e.y + dy, e.z, e.heading, e.scale || 1, fl | flags);
      if (sbuf && !e.dead && e.bp !== 'carpe' && !(e.fly > 0) && w && e.y < w.heightAt(e.x, e.z) + 0.3) drawShadow(sbuf, e.x, e.y, e.z, Math.max(0.2, e.cfg.radius * 1.1));
    }
    // le chicot de la hulotte (il reste quand elle s'en va)
    const H = this.lieu('hulotte');
    if (H && H.chicot && (H.x - cam[0]) ** 2 + (H.z - cam[2]) ** 2 < 120 * 120) {
      PE.buf = buf; PE.fl = flags || 0; PE.frame(H.x, H.sol !== undefined ? H.sol : H.y - H.chicot, H.z, H.cap || 0, 1);
      bpChicot(PE, H.chicot - 0.02);
      PE.fl = 0;
    }
  },

  // ------------------------------------------------------------- essais
  heureFixer(h) { const w = game.world, s = farm.s; w.time = h / 24; game.lastT = w.time; s.hours = (s.day - 1) * 24 + h; this.lastH = s.hours; },
  aller(id, recul) {
    const P = this.lieu(id), D = BP_BETES[id];
    if (!P) return null;
    const pl = D.heures[0], h = id === 'chat' ? 19 : id === 'hulotte' ? 22 : id === 'crapaud' ? 20 : pl[0] + Math.min(1, (pl[1] - pl[0]) / 2);
    this.heureFixer(h);
    const w = game.world, p = game.player, rr = recul || (id === 'cheval' ? 3.2 : id === 'carpe' ? 1.6 : 2.2);
    // un point de vue dégagé (pas d'arbre ni de mur entre elle et nous), devant elle de préférence
    let x = 0, z = 0;
    for (const da of [0, 0.6, -0.6, 1.2, -1.2, 1.9, -1.9, Math.PI]) {
      const a = (P.cap || 0) + da;
      x = P.x + Math.sin(a) * rr; z = P.z + Math.cos(a) * rr;
      const y0 = Math.max(w.heightAt(x, z), P.y) + 1.6, dx = P.x - x, dy = P.y + 0.3 - y0, dz = P.z - z, d = Math.hypot(dx, dy, dz) || 1;
      const ho = w.raycastObjects([x, y0, z], [dx / d, dy / d, dz / d], d, true), hb = w.raycastBlocks([x, y0, z], [dx / d, dy / d, dz / d], Math.max(0, d - 0.6));
      if ((!ho || ho.t > d - 0.4) && !(hb && !hb.block.hidden) && w.heightAt(x, z) > w.waterLevel + 0.1) break;
    }
    if (id === 'carpe' && P.bout) { x = P.bout[0]; z = P.bout[1]; }
    p.pos = [x, w.groundAt(x, z, Math.max(w.heightAt(x, z), P.y) + 1.2, 0.6) + 0.02, z]; p.vel = [0, 0, 0];
    const eye = p.eyePos(), dx = P.x - eye[0], dy = P.y + 0.3 - eye[1], dz = P.z - eye[2];
    p.yaw = Math.atan2(-dx, -dz); p.pitch = Math.atan2(dy, Math.hypot(dx, dz));
    return this.forcer(id);
  },
  forcer(id) { const e = this.entite(id); if (e) return e; return this.apparaitre(id); },
  choisir(i) { const o = ui.choiceOpts && ui.choiceOpts[i]; if (o) o.fn(); return ui.panel === '#choice' ? (document.querySelector('#choice .desc') || {}).textContent || '' : ''; },
  etat(id) { return JSON.parse(JSON.stringify(this.B(id))); },
  parler(id) { const e = this.entite(id); if (e) this.utiliser(e); return !!e; },
};

// ---------------------------------------------------------------- la pose de chaque bête (après la pose commune) ; renvoie le décalage en hauteur
function bpPose(r, e, st, t) {
  const id = e.bp, dort = e.bpEtat === 'dort', parle = (e.parleT || 0) > 0, F = e.bpFuite;
  const nuit = (typeof game !== 'undefined' && game.sky && game.sky.night) || 0;
  // les yeux qui luisent la nuit : ceux du chat, l'œil ouvert de la hulotte (pas celui que ferme la cicatrice)
  for (const n of r.bpLuisent || (r.bpLuisent = ['oeilG', 'oeilD', 'pupD'].filter((k) => r.has(k) && !(id === 'hulotte' && k === 'oeilG')))) r.part(n).fl = nuit > 0.55 && !dort && !e.dead ? FX_EMIT : 0;
  const hoche = parle ? Math.sin(t * 11) * 0.07 : 0;
  if (e.dead) {
    if (r.kind === 'bird') { r.set('body', 0, 0, 1.4); return -0.05; }
    if (r.kind === 'fish') { r.set('body', 0, 0, Math.PI); return 0.1; }
    r.set('body', 0, 0, 1.35);
    return id === 'cheval' ? -0.75 : id === 'chevre' ? -0.4 : id === 'crapaud' ? -0.02 : -0.15;
  }
  switch (id) {
    case 'chat': {
      if (F) return 0;
      // couché en pain sur le tonneau, la tête droite ; endormi, la tête basse ; la queue enroulée
      for (const n of ['legFL', 'legFR']) r.set(n, -1.45, 0, 0);
      for (const n of ['legBL', 'legBR']) r.set(n, 1.45, 0, 0);
      r.set('tail', 1.5, 1.1, 0);
      if (dort) { r.set('neck', 0.55, 0.3, 0); r.set('head', 0.3, 0, 0.2); }
      else { r.set('neck', -0.15 + hoche, clamp(e.lookY || 0, -1, 1), 0); r.set('head', parle ? Math.sin(t * 9) * 0.05 : 0, 0, Math.sin(t * 0.4 + e.seed) * 0.08); }
      return -0.17;
    }
    case 'hulotte': case 'corbeau': {
      const vol = F && F.mode === 'vole';
      for (const n of ['wingL', 'wingR']) { const q = r.part(n); if (q) q.hide = !vol; }
      for (const n of ['plieL', 'plieR']) { const q = r.part(n); if (q) q.hide = !!vol; }
      const bv = r.part('blancheV'); if (bv) bv.hide = !vol;
      if (vol) { const a = Math.sin(t * (id === 'hulotte' ? 9 : 12) + e.seed) * 0.8; r.set('wingL', 0, 0, a); r.set('wingR', 0, 0, -a); return 0; }
      const ly = clamp(e.lookY || 0, id === 'hulotte' ? -2.4 : -1.1, id === 'hulotte' ? 2.4 : 1.1);
      r.set('neck', hoche, ly, id === 'corbeau' ? Math.sin(t * 0.7 + e.seed) * 0.25 : Math.sin(t * 0.3 + e.seed) * 0.15);
      r.set('legFL', 0, 0, 0); r.set('legFR', 0, 0, 0);
      return 0;
    }
    case 'crapaud': {
      // la gorge qui bat, la tête qui se lève quand il parle
      r.set('head', -0.1 + (parle ? Math.sin(t * 10) * 0.08 : 0), clamp(e.lookY || 0, -0.5, 0.5) * 0.5, 0);
      r.set('body', Math.sin(t * 2.2 + e.seed) * 0.02, 0, 0);
      return 0;
    }
    case 'renarde': {
      if (F) { r.set('legFL', -0.9, 0, 0); return 0; }
      // couchée, la tête haute, la patte blessée tendue devant elle
      r.set('legFR', -1.4, 0, 0); r.set('legFL', -1.55, 0.25, 0);
      r.set('legBL', 1.4, 0, 0); r.set('legBR', 1.4, 0, 0);
      r.set('tail', -0.2, -1.05, 0);
      r.set('neck', -0.1 + hoche, clamp(e.lookY || 0, -1, 1), 0);
      return -0.21;
    }
    case 'chevre': {
      // l'encolure tendue en avant (une chèvre, pas un lama), la tête un peu basse ; elle broute quand on est loin
      const g = F ? 0 : (st.graze || 0);
      r.set('neck', 0.3 + g * 0.9, F ? 0 : clamp(e.lookY || 0, -0.9, 0.9), 0);
      r.set('head', -0.15 + hoche - g * 0.2, 0, F ? 0 : Math.sin(t * 0.5 + e.seed) * 0.1);
      return 0;
    }
    case 'carpe': {
      const k = F ? 2.5 : 1;
      r.set('tail', 0, Math.sin(t * 1.6 * k + e.seed) * 0.35, 0);
      // (le nez levé vers la surface ; quand elle parle, la bouche et l'anneau sortent de l'eau)
      r.set('body', (parle ? -0.4 + Math.sin(t * 6) * 0.03 : -0.2) * (F ? 0 : 1), Math.sin(t * 0.8 * k + e.seed) * 0.05, Math.sin(t * 0.5 + e.seed) * 0.04);
      r.set('head', parle ? Math.sin(t * 9) * 0.06 : 0, 0, 0);
      for (const n of ['pectL', 'pectR']) { const q = r.part(n); if (q) q.r[0] = Math.sin(t * 3 + (n === 'pectL' ? 0 : 1.5)) * 0.4; }
      return 0;
    }
    case 'cheval': {
      if (dort) { r.set('neck', 0.25, 0, 0); r.set('head', 0.55, 0, 0); r.set('legBR', -0.05, 0, 0.0); r.set('tail', 0.15, 0, 0); return 0; }
      if (parle) r.set('head', 0.55 + hoche, 0, 0);
      return 0;
    }
  }
  return 0;
}

// ---------------------------------------------------------------- points d'accroche
{
  // la conduite : elles restent à leur place (la conduite commune ne les touche pas)
  const _uw = entities.updateWalker.bind(entities);
  entities.updateWalker = function (e, dt, w, c) {
    if (e && e.bp) { try { betesParlantes.ia(e, dt, w, c); } catch (err) { console.error(err); } return; }
    return _uw(e, dt, w, c);
  };
  // le dessin : par nous (le dessin commun les saute)
  const _draw = entities.draw.bind(entities);
  entities.draw = function (buf, sbuf, cam, maxD, t, flags) {
    const L = betesParlantes.vivantes, H = [];
    for (const e of L) { H.push(e.hidden); e.hidden = true; }
    try { _draw(buf, sbuf, cam, maxD, t, flags); } finally { L.forEach((e, i) => { e.hidden = H[i]; }); }
    try { if (typeof game !== 'undefined' && game.kind === 'farm' && farm.s) betesParlantes.dessiner(buf, sbuf, cam, maxD, t, flags); } catch (err) { console.error(err); }
  };
  // les coups : la chasse, l'esprit, la société ne les comptent pas comme des bêtes ordinaires
  const _hc = play.hurtCreature.bind(play);
  play.hurtCreature = function (e, dmg, eye) {
    if (e && e.bp) { try { return betesParlantes.blesser(e, dmg, eye); } catch (err) { console.error(err); return false; } }
    return _hc(e, dmg, eye);
  };
  // un coup de feu, une flèche, le tonnerre : elles s'en vont
  const _sc = entities.scare.bind(entities);
  entities.scare = function (x, z, r) { _sc(x, z, r); try { if (typeof farm !== 'undefined' && farm.s) betesParlantes.effrayer(x, z, r); } catch (err) { console.error(err); } };
}
HOOKS.target.push((eye, f, cand) => { if (farm.s && game.kind === 'farm') betesParlantes.cibles(eye, f, cand); });
HOOKS.update.push((dt, eye, basis, sky, playing) => {
  if (!farm.s || game.kind !== 'farm') return;
  try {
    betesParlantes.maj(dt, eye, basis);
    // la cible en surbrillance
    const t = game.target;
    if (t && t.bpE) t.bpE.highlight = true;
    // la crapaudine boit le venin
    if (play.poisonT > 0 && farm.count('crapaudine')) {
      play.poisonT = Math.max(0, play.poisonT - dt * 2);
      penser.pas && penser.pas('bp_crapaudine', 120, '(La crapaudine tiédit dans votre poche.)', 3);
    }
  } catch (e) { console.error(e); }
});
HOOKS.day.push(() => { if (farm.s) try { betesParlantes.jour(); } catch (e) { console.error(e); } });
HOOKS.load.push((saved) => {
  const B = betesParlantes;
  B.vivantes = []; B.t = 0; B.conv = null; B.lastH = null;
  B.S();
  if (game.world && !game.world.betesP && game.world.lm) { try { game.world.betesP = bpLieux(game.world, game.world.seed || 0); } catch (e) { console.error(e); } }
  if (game._bpBranche) return;
  game._bpBranche = true;
  // le carnet de la sacoche : « Des bêtes qui parlent » (ui existe : on l'emballe ici)
  const _rs = ui.renderSatchel.bind(ui);
  ui.renderSatchel = function () {
    _rs();
    if (this.satTab !== 'carnet' || !farm.s) return;
    const body = $('#satchel .body'), html = betesParlantes.carnetHTML();
    if (!body || !html || body.querySelector('.bp-carnet')) return;
    if (!document.getElementById('bp-css')) {
      const st = document.createElement('style');
      st.id = 'bp-css';
      st.textContent = '#satchel .bp-carnet p{margin:3px 0;font-size:14px;line-height:1.45;color:#4a3a28}#satchel .bp-carnet i{color:#7a5a3a}#satchel .bp-carnet .bp-ind{color:#7a6448;font-style:italic}';
      document.head.appendChild(st);
    }
    const last = body.querySelector('p.hint:last-child');
    if (last) last.insertAdjacentHTML('beforebegin', html); else body.insertAdjacentHTML('beforeend', html);
  };
});

// ---------------------------------------------------------------- les gens : les rumeurs, et ce qu'ils en pensent
{
  const tous = () => NPC_DATA.concat(typeof C2_HABITANTS !== 'undefined' ? C2_HABITANTS.filter((d) => !NPC_DATA.includes(d)) : []);
  for (const id in BP_RUMEURS) {
    const d = tous().find((x) => x.id === id);
    if (d && d.lines && Array.isArray(d.lines.rumeurs)) for (const l of BP_RUMEURS[id]) if (!d.lines.rumeurs.includes(l)) d.lines.rumeurs.push(l);
  }
  const _op = talk.options.bind(talk);
  talk.options = function () {
    const opts = _op(), n = this.n;
    try {
      const S = farm.s && betesParlantes.S();
      if (n && S && (S.rencontres || 0) > 0 && S.gens[n.d.id] === undefined && n.st && n.st.alive !== false) {
        const i = opts.findIndex((o) => o.act === 'bye');
        opts.splice(i >= 0 ? i : opts.length, 0, { label: BP_DIRE_AUX_GENS, act: 'bp_betes' });
      }
    } catch (e) { console.error(e); }
    return opts;
  };
  const _ch = talk.choose.bind(talk);
  talk.choose = function (act) {
    if (act === 'bp_betes' && this.n) {
      const S = betesParlantes.S(), id = this.n.d.id;
      S.gens[id] = farm.s.day;
      let h = 0; for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
      const t = BP_INCREDULES[id] || BP_INCREDULES.defaut[h % BP_INCREDULES.defaut.length];
      return this.view(t, this.options());
    }
    return _ch(act);
  };
  // l'aubergiste, quand son chat est mort
  const _cl = talk.chatLine.bind(talk);
  talk.chatLine = function () {
    const n = this.n;
    try {
      const S = farm.s && betesParlantes.S(), B = S && S.b.chat;
      if (n && n.d && n.d.id === 'aubergiste' && B && B.mort && !S.aubergisteDit) { S.aubergisteDit = farm.s.day; return 'Mon chat… On l’a trouvé mort devant la porte, à côté du tonneau. Un chat qui ne faisait de mal à personne. Enfin, presque personne. Il me regardait, le soir, comme s’il savait des choses.'; }
    } catch (e) { console.error(e); }
    return _cl();
  };
}
