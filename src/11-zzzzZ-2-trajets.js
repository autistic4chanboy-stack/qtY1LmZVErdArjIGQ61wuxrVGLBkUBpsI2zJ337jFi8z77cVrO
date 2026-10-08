// ============================================================================
//  LES TRAJETS DES HABITANTS (agent Z, vague 14) — 2. LE SUIVI, ET CE QU'ON PEUT DEMANDER
//  - Un trajet : les grands nœuds du graphe (routes, rues, portes des maisons, ponts) pour aller loin, et entre
//    deux nœuds un tronçon tracé sur la carte des pas (11-zzzzZ-1-grille.js) quand la ligne droite ne passe pas :
//    plus de murs traversés, plus de nage, plus de douves, plus de coude dans une table.
//  - On marche pour de bon tant que le joueur peut voir (125 m : plus loin que le brouillard le plus clair) ;
//    au-delà, on file d'un nœud à l'autre sans rien heurter (personne ne regarde) ; départ et arrivée hors de
//    vue : on y est déjà (comme avant).
//  - Les portes : on ouvre en approchant, on attend que le battant soit ouvert, on referme derrière soi (les
//    boutiques restent ouvertes aux heures d'ouverture) ; une porte fermée à clé n'est qu'à ses gens (et l'on sort
//    toujours d'une maison où l'on se trouve). Les ponts-levis : on monte sur le tablier ; levés, on attend.
//  - Se croiser : on s'écarte sur sa droite, on ralentit, on laisse passer à une porte ; on ne traverse plus
//    personne (le joueur non plus : « Pardon… »).
//  - S'installer : un lit, un banc, une chaise, un établi — on s'en approche par le côté libre (du même côté des
//    murs), puis on s'y met (et l'on s'en relève de même) ; une place déjà prise : debout à côté ; la nuit, chacun
//    dort dans SON lit ; pour l'étage, l'échelle de meunier.
//  - Déblocage sûr : on recalcule, on se décale vers la case libre voisine, on attend qu'on nous laisse
//    passer ; on ne saute jamais à travers un mur sous les yeux du joueur.
//  API (pour les autres agents, gardée par typeof) : voir plus bas, « trajets.allerA / dormir / reveiller… ».
//  État sauvegardé : farm.s.trajets = { v: 1 } (rien d'indispensable : un réveil ne survit pas à un chargement).
// ============================================================================
const ZT_PRES = 125, ZT_LOIN = 175, ZT_SAUT = 165, ZT_BUDGET = 3.5;

const trajets = {
  w: null, ms: 0, img: 0, tImg: -1,
  S: { trajets: 0, troncons: 0, droits: 0, astar: 0, memo: 0, echecs: 0, coinces: 0, debloques: 0, sauts: 0, sautsVus: 0, ms: 0, msMax: 0, condamnees: 0, attentes: 0, installe: 0, reveils: 0 },
  cases: null, casesN: 0, deplaces: new Map(), vus: new Set(), inaccessibles: new Map(), memo: new Map(), lents: [], ecouteurs: { arrivee: [], reveil: [] },

  // ------------------------------------------------------------------ le monde
  monde(w) {
    if (this.w === w) return;
    this.w = w; this.cases = null; this.condamnees.clear(); this.essaisArete.clear(); this.deplaces.clear(); this.vus.clear(); this.inaccessibles.clear(); this.memo.clear();
    zgrille.reset(w);
  },
  // nouvelle image : le budget de calcul repart
  image() {
    if (this.tImg === game.time) return;
    this.tImg = game.time; this.img++; this.ms = 0;
    zgrille.image = this.img;
    const W = this.vallee();
    if (this.w !== W) this.monde(W);
    const w = this.w;
    // le monde a changé (on a bâti, abattu, posé) : on refait la carte autour du joueur
    if (w && w.grid !== zgrille.gridRef) {
      if (w.grid) {
        if (zgrille.gridRef) { const p = game.player.pos; zgrille.oublier(p[0], p[2], 40); this.memo.clear(); this.inaccessibles.clear(); this.vus.clear(); }
        zgrille.gridRef = w.grid;
      }
    }
    // (la « version » du monde a tourné — 11-strange.js — : des murs, des meubles ont changé ; les carreaux se refont
    //  d'eux-mêmes, les tronçons gardés et les buts reconnus inaccessibles, non)
    if (w && w.curVer !== this.verRef) { this.verRef = w.curVer; this.memo.clear(); this.inaccessibles.clear(); this.vus.clear(); this.deplaces.clear(); }
    if ((this.img & 255) === 0) zgrille.ranger(700);
    // (le temps de cette image : un carreau d'avance, s'il en faut)
    if (zgrille.file.length) { const t0 = performance.now(); zgrille.preparer(1.2); this.ms += performance.now() - t0; }
  },
  // la vallée (game.world n'est pas toujours la vallée : la Zone de V1 est un autre monde)
  vallee() { return (typeof farm !== 'undefined' && farm.w) || game.world; },
  temps(t0) { const d = performance.now() - t0; this.ms += d; this.S.ms += d; if (d > this.S.msMax) this.S.msMax = d; },

  // ------------------------------------------------------------------ le graphe : les nœuds par cases de 32 m
  noeudsPres(x, z, r, fn) {
    const w = this.w, N = w.nav.nodes;
    if (!this.cases || this.casesN !== N.length) {
      this.cases = new Map(); this.casesN = N.length;
      N.forEach((q, i) => { const k = Math.floor(q.x / 32) * 4096 + Math.floor(q.z / 32); (this.cases.get(k) || this.cases.set(k, []).get(k)).push(i); });
    }
    const c0 = Math.floor((x - r) / 32), c1 = Math.floor((x + r) / 32), d0 = Math.floor((z - r) / 32), d1 = Math.floor((z + r) / 32);
    for (let cx = c0; cx <= c1; cx++) for (let cz = d0; cz <= d1; cz++) { const L = this.cases.get(cx * 4096 + cz); if (L) for (const i of L) fn(i, N[i]); }
  },
  pos(i) { const q = this.w.nav.nodes[i]; return this.deplaces.get(i) || q; },
  // un grand nœud tombé dans un recoin (la margelle de la fontaine, une table, un enclos) : on le pose à côté, une fois
  verifierNoeud(i, n) {
    if (this.vus.has(i)) return;
    this.vus.add(i);
    const q = this.w.nav.nodes[i];
    if (/^(halle|village:)/.test(q.tag)) return;
    const c = zgrille.couche(q.x, n ? n.y : undefined, q.z), gx = Math.floor(q.x / ZG_C), gz = Math.floor(q.z / ZG_C);
    const k = zgrille.lire(gx, gz, c), T = zgrille.T;
    if (!(T.f[k] & ZG_BLOQ) && !zgrille.poche(gx, gz, c)) return;
    const L = zgrille.libre(q.x, q.z, c, 6, { ouvert: true, portes: true });
    if (L) this.deplaces.set(i, { x: L.x, z: L.z, tag: q.tag });
  },
  // (une arête que la carte des pas a trouvée impossible, deux fois : on l'oublie un moment — dix minutes de jeu)
  condamnees: new Map(), essaisArete: new Map(),
  condamnee(a, b) { const t = this.condamnees.get(a < b ? a + ':' + b : b + ':' + a); return t !== undefined && t > game.time; },
  condamner(a, b) {
    if (a < 0 || b < 0 || this.passage(a, b)) return;
    const k = a < b ? a + ':' + b : b + ':' + a, e = (this.essaisArete.get(k) || 0) + 1;
    this.essaisArete.set(k, e);
    if (e >= 2) { this.condamnees.set(k, game.time + 600); this.essaisArete.delete(k); this.S.condamnees++; }
  },

  // ------------------------------------------------------------------ les étages : les échelles de meunier (11-zzzzB1-ville.js)
  // { key (bâtiment), bas (où l'on se tient en bas), pied, haut (le haut de l'échelle), dessus (où l'on prend pied en haut), yaw, cb, ch }
  echelles() {
    if (this.ech && this.echW === this.w) return this.ech;
    this.echW = this.w; this.ech = [];
    for (const it of this.w.inter || []) {
      const d = it.kind === 'b1_echelle' && it.data;
      if (!d || d.sens !== 'haut' || !d.pied || !d.haut || !d.to) continue;
      const bas = { x: d.pied[0] + (d.pied[0] - d.haut[0]), z: d.pied[2], y: d.pied[1] };
      // (en bas : là où l'on revient en descendant — l'interaction « bas » le dit ; sinon un pas devant le pied)
      const desc = this.w.inter.find((j) => j.kind === 'b1_echelle' && j.data && j.data.sens === 'bas' && j.data.key === d.key && j.data.pied && Math.hypot(j.data.pied[0] - d.pied[0], j.data.pied[2] - d.pied[2]) < 0.2);
      const B = desc ? { x: desc.data.to[0], y: desc.data.to[1], z: desc.data.to[2] } : bas;
      const E = { key: d.key, bas: B, pied: { x: d.pied[0], y: d.pied[1], z: d.pied[2] }, haut: { x: d.haut[0], y: d.haut[1], z: d.haut[2] }, dessus: { x: d.to[0], y: d.to[1], z: d.to[2] }, yaw: d.yaw || 0 };
      E.cb = zgrille.couche(E.bas.x, E.bas.y, E.bas.z); E.ch = zgrille.couche(E.dessus.x, E.dessus.y, E.dessus.z);
      if (E.cb !== E.ch) this.ech.push(E);
    }
    return this.ech;
  },
  // l'échelle qui mène de la couche c à la couche cT (la plus proche du but, de préférence dans le même bâtiment)
  echellePour(n, c, cT, T) {
    let best = null, bd = 1e9;
    for (const E of this.echelles()) {
      const monte = E.cb === c && E.ch === cT, descend = E.ch === c && E.cb === cT;
      if (!monte && !descend) continue;
      const P = monte ? E.dessus : E.bas, d = Math.hypot(P.x - T.x, P.z - T.z) + Math.hypot(P.x - n.x, P.z - n.z) * 0.5;
      if (d < bd && d < 80) { bd = d; best = { E, monte }; }
    }
    return best;
  },
  // grimper (ou descendre) : jusqu'au pied (ou au bord de la trappe), le long de l'échelle, puis on prend pied
  grimper(n, dt, t) {
    const G = t.grimpe, E = G.E, a = (G.a = Math.min(1, G.a + dt / G.dur));
    const A = G.monte ? [E.bas, E.pied, E.haut, E.dessus] : [E.dessus, E.haut, E.pied, E.bas];
    const seg = a < 0.2 ? 0 : a < 0.8 ? 1 : 2, k = seg === 0 ? a / 0.2 : seg === 1 ? (a - 0.2) / 0.6 : (a - 0.8) / 0.2;
    const P0 = A[seg], P1 = A[seg + 1];
    n.x = lerp(P0.x, P1.x, k); n.z = lerp(P0.z, P1.z, k); n.y = lerp(P0.y, P1.y, k);
    n.heading = turnToward(n.heading, E.yaw + (G.monte ? 0 : Math.PI), dt * 8);
    n.move = seg === 1 ? 0.6 : 1; n.phase += dt * 4;
    if (a >= 1) { t.grimpe = null; t.pts = null; this.S.echelles = (this.S.echelles || 0) + 1; }
  },

  // ------------------------------------------------------------------ une destination sûre
  // (un point « debout » tombé dans l'eau d'une fontaine, un muret, un meuble : la case libre la plus proche ;
  //  un lit, un banc, une chaise, un poste : on garde le point, on s'en approchera)
  // (posé : on s'y met — lit, banc, chaise, poste de travail, bord de l'eau ; le reste, on s'y tient debout)
  pose(D) { return !!(D && (D.seat || D.pose === 'lie' || D.pose === 'sit' || D.pose === 'work' || D.pose === 'fish')); },
  but(n, D, force) {
    if (D && this.pose(D) && D.pose !== 'lie') return this.placeLibre(n, D);
    if (!D || this.pose(D)) return D;
    this.monde(this.vallee());
    if (this.ms > ZT_BUDGET && !force) { D.zAVerifier = true; return D; } // (plus tard, avant le dernier tronçon)
    D.zAVerifier = false;
    const t0 = performance.now();
    try {
      const c = zgrille.couche(D.x, n.y, D.z), gx = Math.floor(D.x / ZG_C), gz = Math.floor(D.z / ZG_C);
      const k = zgrille.lire(gx, gz, c), T = zgrille.T;
      if ((T.f[k] & ZG_BLOQ) || zgrille.poche(gx, gz, c)) {
        const L = zgrille.libre(D.x, D.z, c, 4, { qui: n, ouvert: true, meme: { x: D.x, z: D.z } });
        if (L) { D.x = L.x; D.z = L.z; }
      }
    } catch (err) { console.error('trajets.but', err); } finally { this.temps(t0); }
    return D;
  },

  // une chaise, un banc, un poste que quelqu'un d'autre occupe déjà (ou va occuper) : on se tient debout à côté, tourné vers
  // la place (l'auberge, le banc de la place, l'établi partagé) — plus de deux habitants l'un dans l'autre
  placeLibre(n, D) {
    let pris = false;
    // (des boucles par indice sur npcs.list : un « for … of » interrompu laisserait un itérateur emballé à mi-course)
    for (let i = 0, L = npcs.list; i < L.length; i++) {
      const m = L[i];
      if (m === n || !m.st.alive || m.vanished || m.state === 'gone' || !m.goal) continue;
      const G = m.goal;
      if (Math.abs(G.x - D.x) < 0.35 && Math.abs(G.z - D.z) < 0.35 && Math.abs((G.y ?? 0) - (D.y ?? 0)) < 0.6 && this.pose(G)) { pris = true; break; }
    }
    if (!pris) return D;
    this.monde(this.vallee());
    const t0 = performance.now();
    try {
      const c = zgrille.couche(D.x, D.y !== undefined && D.y !== null ? D.y - 0.6 : n.y, D.z);
      for (let k = 0; k < 16; k++) {
        const a = k * 2.4 + (n.id.length % 7), r = 0.9 + (k % 3) * 0.35, x = D.x + Math.cos(a) * r, z = D.z + Math.sin(a) * r;
        const e = zgrille.cellule(x, z, c);
        if (e.f & ZG_BLOQ) continue;
        if (npcs.list.some((m) => m !== n && m.goal && Math.hypot(m.goal.x - x, m.goal.z - z) < 0.75)) continue;
        if (zgrille.murEntre(x, z, D.x, D.z, e.sol)) continue;
        return { node: D.node, x, z, r: Math.atan2(D.x - x, D.z - z), pose: null, bld: D.bld, y: undefined };
      }
      // (tout est pris autour : la case libre la plus proche, du même côté des murs, debout)
      const L = zgrille.libre(D.x, D.z, c, 3, { qui: n, hors: true, meme: { x: D.x, z: D.z } });
      if (L) return { node: D.node, x: L.x, z: L.z, r: Math.atan2(D.x - L.x, D.z - L.z), pose: null, bld: D.bld, y: undefined };
    } catch (err) { console.error('trajets.placeLibre', err); } finally { this.temps(t0); }
    return D;
  },

  // ------------------------------------------------------------------ le départ
  batimentEn(x, y, z) {
    const w = this.w;
    if (!w || !w.bld) return null;
    for (const k in w.bld) {
      const B = w.bld[k], f = B.f;
      if (!f || B.under || !B.W || Math.abs(f.x - x) > 12 || Math.abs(f.z - z) > 12) continue;
      if (y < f.y - 1 || y > f.y + 6) continue;
      const [lx, lz] = World.blockLocal({ x: f.x, z: f.z, r: f.r || 0 }, x, z);
      if (Math.abs(lx) < B.W / 2 && Math.abs(lz) < B.D / 2) return k;
    }
    return null;
  },
  zt0(D, n) { return { G: D, t0: game.time, pts: null, k: 0, ni: 0, final: false, approche: null, bloque: 0, chk: game.time, cx: n ? n.x : 0, cz: n ? n.z : 0, attente: 0, leve: null, inst: null, porte: null, echec: false, loin: false }; },
  partir(n, D) {
    const w = this.w, t = n.zt = this.zt0(D, n);
    this.S.trajets++;
    n.state = 'walk'; n.stuck = 0;
    // (dans quelle maison est-il ? on sort toujours d'une maison où l'on se trouve, même fermée à clé pour la nuit)
    n.zDedans = this.batimentEn(n.x, n.y, n.z);
    // on se lève d'abord (lit, banc, chaise)
    if (n.zInst && Math.hypot(n.x - n.zInst.sx, n.z - n.zInst.sz) < 0.6) t.leve = { a: 0, x0: n.x, z0: n.z, y0: n.y, x1: n.zInst.x, z1: n.zInst.z, y1: n.zInst.y };
    else t.aLever = true; // (placé d'un coup : on regardera, sous budget, s'il faut d'abord se lever)
    n.zInst = null;
    // les grands nœuds (sous terre, ceux de la halle)
    let from;
    const dessous = n.d.area === 'nains', fil = dessous ? (q) => /^(halle|village:|nain_)/.test(q.tag) && !/:(in|mid)$/.test(q.tag) : (q) => !/:(in|mid)$/.test(q.tag) && !/^(halle|village:)/.test(q.tag);
    if (n.inside && w.bld[n.inside]) from = npcs.nearestNode(n.x, n.z, 60, (q, i) => npcs.inNode(n, i));
    else from = npcs.nearestReach(n.x, n.z, fil);
    let p = null;
    if (D.node >= 0 && from >= 0) p = npcs.findPath(n, from, D.node);
    if (!p && D.node >= 0 && from >= 0 && from !== D.node && Math.hypot(D.x - n.x, D.z - n.z) > 20) {
      // (un pont levé, une porte fermée à clé : la routine réessaiera — 11-zzz52-routines.js)
      n.path = []; n.pi = 0; t.echec = true; this.S.echecs++;
      return false;
    }
    n.path = p || []; n.pi = 0;
    if (n.dist < ZT_PRES + 40) { const c = zgrille.couche(n.x, n.y, n.z); zgrille.prechauffer(n.x, n.z, 10, c); if (n.path.length) { const q = this.pos(n.path[Math.min(1, n.path.length - 1)]); zgrille.prechauffer(q.x, q.z, 6, c); } }
    return true;
  },
  // se lever s'il le faut (placé d'un coup dans un lit, sur un banc — chargement, réveil, un autre module)
  sePreparer(n, t) {
    t.aLever = false;
    const c = zgrille.couche(n.x, n.y, n.z), e = zgrille.cellule(n.x, n.z, c);
    // (assis plus haut que le sol — margelle, banc sans meuble — : on se lève sur place)
    if (!(e.f & ZG_BLOQ)) { if (Math.abs(n.y - e.sol) > 0.25 && Math.abs(n.y - e.sol) < 2) t.leve = { a: 0, x0: n.x, z0: n.z, y0: n.y, x1: n.x, z1: n.z, y1: e.sol }; return; }
    const L = zgrille.libre(n.x, n.z, c, 2.5, { qui: n, y: Math.min(n.y, e.sol + 0.3), meme: { x: n.x, z: n.z } }) || zgrille.libre(n.x, n.z, c, 2.5, { qui: n, y: Math.min(n.y, e.sol + 0.3) });
    if (L && Math.hypot(L.x - n.x, L.z - n.z) < 2.6) t.leve = { a: 0, x0: n.x, z0: n.z, y0: n.y, x1: L.x, z1: L.z, y1: L.y };
  },

  // ------------------------------------------------------------------ la marche (chaque image, pour chaque habitant en route)
  marcher(n, dt, w, c) {
    this.image();
    this.c = c;
    let t = n.zt;
    // (sur l'échelle, on finit de grimper — même si le but a changé entre-temps : on ne reste pas pendu au barreau)
    if (t && t.grimpe && n.dist <= ZT_PRES) { this.grimper(n, dt, t); if (t.grimpe || !n.goal) return; }
    if (!n.goal) { n.state = 'idle'; n.move = 0; return; }
    if (!t || t.G !== n.goal) { this.partir(n, n.goal); t = n.zt; }
    if (t.echec) { n.move = lerp(n.move, 0, Math.min(1, dt * 6)); return; }
    const lunette = typeof chasse !== 'undefined' && chasse.f && chasse.f.lunette;
    if (n.dist > ZT_PRES && !n.run && !lunette) { this.filer(n, dt, w, t); return; }
    if (t.loin) { t.loin = false; t.pts = null; this.reposer(n, w); }
    if (t.aLever) { if (this.ms > ZT_BUDGET) { n.move = 0; return; } const t0 = performance.now(); this.sePreparer(n, t); this.temps(t0); }
    if (t.leve) { this.lever(n, dt, t); return; }
    if (t.grimpe) { this.grimper(n, dt, t); return; }
    if (t.inst) { this.installer(n, dt, t); return; }
    if (t.attendreT && game.time < t.attendreT) { n.move = lerp(n.move, 0, Math.min(1, dt * 6)); this.idle(n, dt, c); return; }
    for (let k = 0; k < 3 && !(t.pts && t.k < t.pts.length); k++) {
      if (t.pts) { // tronçon fini
        if (t.echelle) { t.grimpe = { a: 0, dur: 2.2, E: t.echelle.E, monte: t.echelle.monte }; t.echelle = null; t.pts = null; return; }
        if (t.final) { this.finTroncon(n, t); return; }
        t.ni = Math.max(t.ni, t.cible + 1); t.pts = null;
      }
      const t0 = performance.now();
      const ok = this.troncon(n, t, w);
      this.temps(t0);
      if (!ok) { n.move = lerp(n.move, 0, Math.min(1, dt * 6)); return; }
    }
    if (!t.pts || t.k >= t.pts.length) return;
    this.pas(n, dt, w, c, t);
  },
  // le prochain tronçon : jusqu'au prochain grand nœud (en sautant ceux qu'on voit dépassés), ou jusqu'au but
  troncon(n, t, w) {
    if (this.ms > ZT_BUDGET) { this.S.attentes++; return false; }
    const c = zgrille.couche(n.x, n.y, n.z), path = n.path || [], G = t.G, vOpts = { qui: n, depart: true };
    while (t.ni < path.length) {
      const q = this.pos(path[t.ni]);
      if (Math.hypot(q.x - n.x, q.z - n.z) < 1.0) { t.ni++; continue; }
      if (t.ni + 1 < path.length) {
        const q2 = this.pos(path[t.ni + 1]);
        if (Math.hypot(q2.x - n.x, q2.z - n.z) < 30 && !this.passage(path[t.ni], path[t.ni + 1]) && zgrille.vue(n.x, n.z, q2.x, q2.z, c, vOpts)) { t.ni++; continue; }
      } else if (Math.hypot(G.x - n.x, G.z - n.z) < 30 && zgrille.vue(n.x, n.z, G.x, G.z, c, vOpts)) { t.ni++; continue; }
      break;
    }
    n.pi = Math.min(t.ni, path.length);
    if (t.ni < path.length) this.verifierNoeud(path[t.ni], n);
    else if (G.zAVerifier) this.but(n, G);
    let final = t.ni >= path.length, T = final ? G : this.pos(path[t.ni]);
    t.cible = t.ni; t.echelle = null;
    // un autre étage : d'abord l'échelle (on va à son pied, ou au bord de la trappe)
    const cT = final && G.y !== undefined && G.y !== null ? zgrille.couche(G.x, G.y, G.z) : n.d.area === 'nains' ? c : 0;
    if (cT !== c) {
      const X = this.echellePour(n, c, cT, T);
      if (X) { t.echelle = X; T = X.monte ? X.E.bas : X.E.dessus; final = false; t.cible = t.ni - 1; }
    }
    this.S.troncons++;
    if (final && Math.hypot(G.x - n.x, G.z - n.z) < 0.3) { t.pts = []; t.k = 0; t.final = true; t.approche = null; return true; }
    let pts = null;
    if (Math.hypot(T.x - n.x, T.z - n.z) < 60 && zgrille.vue(n.x, n.z, T.x, T.z, c, vOpts)) { pts = [{ x: T.x, z: T.z, y: null }]; zgrille.approche = null; this.S.droits++; }
    else {
      this.S.astar++;
      const pose = final && this.pose(G), D = Math.hypot(T.x - n.x, T.z - n.z), t0 = performance.now(), marge = Math.min(12, Math.max(6, 4 + D * 0.5));
      // (un but déjà reconnu inaccessible d'ici : on vise directement le point le plus proche qu'on avait trouvé)
      const ck = final ? c + ':' + Math.floor(T.x / 2) + ':' + Math.floor(T.z / 2) : null, inac = ck && this.inaccessibles.get(ck);
      const X = inac && inac.t > game.time ? inac : T;
      // (un tronçon déjà tracé d'ici à là, sans porte ni pont-levis : on le reprend)
      const mk = !final && !t.echelle ? c + ':' + Math.floor(n.x) + ':' + Math.floor(n.z) + ':' + Math.floor(X.x * 4) + ':' + Math.floor(X.z * 4) : null, M = mk && this.memo.get(mk);
      if (M && M.t > game.time && zgrille.vue(n.x, n.z, M.pts[0].x, M.pts[0].z, c, vOpts)) { pts = M.pts.map((q) => Object.assign({}, q)); zgrille.approche = M.appro; zgrille.raison = null; this.S.memo++; }
      else {
        pts = zgrille.chemin(n.x, n.z, X.x, X.z, c, { qui: n, marge, max: Math.min(path.length ? 30000 : 12000, 8000 + D * 600), proche: !final ? 4 : pose ? 2.5 : 14, yDep: n.y, yBut: final && G.y !== undefined && G.y !== null ? G.y - 0.6 : undefined });
        if (mk && pts && pts.length && !this.porteSur(n.x, n.z, pts)) { if (this.memo.size > 1500) this.memo.clear(); this.memo.set(mk, { pts: pts.map((q) => Object.assign({}, q)), appro: zgrille.approche, t: game.time + 1200 }); }
      }
      const dt = performance.now() - t0;
      if (dt > 15 && this.lents.length < 40) this.lents.push({ id: n.id, de: [Math.round(n.x), Math.round(n.z)], a: [Math.round(T.x), Math.round(T.z)], final, ms: Math.round(dt), ok: !!pts, raison: zgrille.raison, t: Math.round(game.time) });
      if (final && pts && pts.length && X === T) { const L = pts[pts.length - 1]; if (Math.hypot(L.x - T.x, L.z - T.z) > 2.5 && zgrille.raison === null && !zgrille.approche) this.inaccessibles.set(ck, { x: L.x, z: L.z, t: game.time + 300 }); }
    }
    if (!pts && zgrille.raison !== 'but' && this.sortirDuRecoin(n, c)) return false; // (on était soi-même dans un recoin : on en descend d'abord)
    if (!pts && t.echelle) { t.echelle = null; this.S.echecs++; t.pts = []; t.k = 0; t.final = true; t.approche = null; t.manque = true; return true; } // (l'échelle ne se rejoint pas)
    if (!pts) {
      if (!final) {
        // ce nœud ne se rejoint pas d'ici : on passe au suivant (et si c'est sûr, l'arête est oubliée un moment)
        if (zgrille.raison === 'ferme') this.condamner(t.ni > 0 ? path[t.ni - 1] : -1, path[t.ni]);
        t.ni++; t.pts = null; this.S.echecs++;
        return false;
      }
      // le but ne se rejoint pas d'ici (enclos, îlot) : on s'arrête où l'on est, sans tricher
      this.S.echecs++;
      t.pts = []; t.k = 0; t.final = true; t.approche = null; t.manque = true;
      return true;
    }
    t.pts = pts; t.k = 0; t.final = final;
    t.approche = final ? zgrille.approche : null;
    // (au plus près seulement : il manque un bout)
    if (final && pts.length) { const L = pts[pts.length - 1]; t.manque = Math.hypot(L.x - G.x, L.z - G.z) > (t.approche ? Math.max(1.2, t.approche.d + 0.3) : 0.6); }
    // le nœud lui-même était dans un recoin (la fontaine, une table) : on s'en souviendra
    if (!final && !t.echelle && zgrille.approche && zgrille.approche.d > 0.4 && t.ni < path.length) this.deplaces.set(path[t.ni], { x: zgrille.approche.x, z: zgrille.approche.z, tag: this.w.nav.nodes[path[t.ni]].tag });
    return true;
  },
  // un chemin passe-t-il une porte ou un pont-levis ? (on ne garde pas ces tronçons-là : une porte se ferme à clé, un pont se lève)
  porteSur(x0, z0, pts) {
    const w = this.w;
    let ax = x0, az = z0;
    for (const P of pts) {
      const mx = Math.min(ax, P.x) - 2, Mx = Math.max(ax, P.x) + 2, mz = Math.min(az, P.z) - 2, Mz = Math.max(az, P.z) + 2;
      for (const d of w.doors) if (d.x > mx && d.x < Mx && d.z > mz && d.z < Mz) return true;
      for (const b of w.bridges) if (b.x > mx - b.L && b.x < Mx + b.L && b.z > mz - b.L && b.z < Mz + b.L) return true;
      ax = P.x; az = P.z;
    }
    return false;
  },
  // une arête qu'on ne coupe pas (porte, pont-levis) : on passe par ses deux bouts
  passage(a, b) {
    const L = this.w.nav.adj[a];
    if (!L) return false;
    for (const e of L) if (e.to === b) return !!e.flag && e.flag !== 'road';
    return false;
  },
  // au bout du dernier tronçon
  finTroncon(n, t) {
    const G = t.G;
    // s'installer : du point d'approche au lit, au banc, à la chaise, au poste
    const pose = this.pose(G);
    const dG = Math.hypot(G.x - n.x, G.z - n.z);
    if (t.manque) {
      // un lit, un banc qu'on n'a pas pu rejoindre : hors de vue, on s'y met (comme avant) ; sous les yeux, on attend et l'on réessaie
      if (pose && (n.dist > 60 || !this.vu(n))) { this.S.sauts++; t.manque = false; this.arriver(n, t, null); return; }
      if (pose) { t.pts = null; t.ni = (n.path || []).length; t.reessai = (t.reessai || 0) + 1; t.attendreT = game.time + 6; n.move = 0; if (t.reessai > 3) this.arriver(n, t, null, true); return; }
      this.arriver(n, t, null, true); return;
    }
    if (dG > 0.12 && dG < 2.6 && pose) { t.inst = { a: 0, x0: n.x, z0: n.z, y0: n.y, ax: n.x, az: n.z, ay: n.y }; return; }
    this.arriver(n, t, null, dG > 0.3);
  },
  vu(n) { const c = this.c; return !!(c && c.visible && c.visible(n)); },
  idle(n, dt, c) { if (c) npcs.idleLook(n, dt, c); },
  arriver(n, t, appro, ici) {
    const G = t.G;
    if (!ici) { n.x = G.x; n.z = G.z; }
    n.state = n.sleep ? 'sleep' : 'idle'; n.inside = G.bld || null; n.move = 0;
    if (G.y !== undefined && G.y !== null && (!ici || Math.abs(G.y - n.y) < 0.4)) n.y = G.y;
    if (G.r !== null && G.r !== undefined) n.heading = G.r;
    n.zInst = appro ? { x: appro.x, z: appro.z, y: appro.y, sx: n.x, sz: n.z } : null;
    if (appro) this.S.installe++;
    t.fini = true;
    for (const f of this.ecouteurs.arrivee) { try { f(n, G); } catch (e) { console.error(e); } }
    const O = n.zOrdre;
    if (O && O.D === G && O.arrivee && !O.arrDone) { O.arrDone = true; try { O.arrivee(n); } catch (e) { console.error(e); } }
  },
  installer(n, dt, t) {
    const I = t.inst, G = t.G;
    I.a = Math.min(1, I.a + dt / 0.6);
    const k = I.a * I.a * (3 - 2 * I.a);
    n.x = lerp(I.x0, G.x, k); n.z = lerp(I.z0, G.z, k);
    const y1 = G.y !== undefined && G.y !== null ? G.y : I.y0;
    n.y = lerp(I.y0, y1, k);
    if (G.r !== null && G.r !== undefined) n.heading = turnToward(n.heading, G.r, dt * 5);
    n.move = lerp(n.move, 0, Math.min(1, dt * 8));
    if (I.a >= 1) { t.inst = null; this.arriver(n, t, { x: I.ax, z: I.az, y: I.ay }); }
  },
  lever(n, dt, t) {
    const L = t.leve;
    L.a = Math.min(1, L.a + dt / 0.5);
    const k = L.a * L.a * (3 - 2 * L.a);
    n.x = lerp(L.x0, L.x1, k); n.z = lerp(L.z0, L.z1, k); n.y = lerp(L.y0, L.y1, k);
    n.move = 0;
    if (L.a >= 1) { t.leve = null; t.pts = null; n.inside = null; }
  },
  // pris dans un recoin (la margelle d'une fontaine, un muret où l'a posé un saut) : on en descend, d'un pas, vers la case
  // ouverte la plus proche (si elle est à deux mètres et demi au plus)
  sortirDuRecoin(n, c) {
    const gx = Math.floor(n.x / ZG_C), gz = Math.floor(n.z / ZG_C);
    if (!zgrille.poche(gx, gz, c)) return false;
    const L = zgrille.libre(n.x, n.z, c, 2.5, { qui: n, ouvert: true, hors: true, y: n.y, meme: { x: n.x, z: n.z } });
    const L2 = L || zgrille.libre(n.x, n.z, c, 2.5, { qui: n, ouvert: true, hors: true, y: n.y - 0.9, meme: { x: n.x, z: n.z } });
    if (!L2) return false;
    n.zt.leve = { a: 0, x0: n.x, z0: n.z, y0: n.y, x1: L2.x, z1: L2.z, y1: L2.y };
    n.zt.pts = null; this.S.recoins = (this.S.recoins || 0) + 1;
    return true;
  },
  // revenu dans le champ du joueur après avoir filé : on se pose sur une case libre (sans sauter de mur : on y est)
  reposer(n, w) {
    const c = zgrille.couche(n.x, n.y, n.z), e = zgrille.cellule(n.x, n.z, c);
    if (!(e.f & ZG_BLOQ)) { n.y = e.sol; return; }
    const L = zgrille.libre(n.x, n.z, c, 3, { qui: n, y: n.y, meme: { x: n.x, z: n.z } }) || zgrille.libre(n.x, n.z, c, 3, { qui: n, y: n.y });
    if (L) { n.x = L.x; n.z = L.z; n.y = L.y; }
  },

  // ------------------------------------------------------------------ un pas (direction, portes, voisins, collisions, eau)
  pas(n, dt, w, c, t) {
    const P = t.pts[t.k];
    let dx = P.x - n.x, dz = P.z - n.z, d = Math.hypot(dx, dz);
    const last = t.final && t.k === t.pts.length - 1;
    if (d < (last ? 0.2 : 0.4)) { t.k++; return; }
    // les portes sur le chemin
    if (this.portes(n, t, P, dt)) return;
    // vitesse
    let speed = n.run ? 3.4 : 1.35 * (n.d.age > 60 ? 0.85 : 1) * (n.d.id === 'fillette' ? 1.2 : 1);
    if (n.voyage && !n.run && !n.inside) speed *= 1.5;
    if (last && d < 1.2) speed *= 0.6 + 0.4 * d / 1.2;
    // les voisins (habitants, joueur) : s'écarter, ralentir, attendre
    let ux = dx / d, uz = dz / d;
    const v = this.voisins(n, ux, uz, c);
    if (v.stop) {
      n.move = lerp(n.move, 0, Math.min(1, dt * 8)); t.attente += dt;
      n.heading = turnToward(n.heading, Math.atan2(ux, uz), dt * 4);
      if (v.joueur && t.attente > 1.2 && !t.pardon) { t.pardon = true; if (n.dist < 6 && Math.random() < 0.6) npcs.say(n, pick(['Pardon…', 'Vous permettez ?', 'Excusez-moi.', 'Je passe, si vous voulez bien.']), 2.2); }
      // (un passant qui vient en face : un instant, puis chacun prend sa droite ; quelqu'un d'arrêté, de couché : deux
      //  secondes ; le joueur : trois — puis on contourne de plus près, tant pis)
      if (t.attente < (v.joueur ? 3 : v.fixe ? 2 : 0.7)) { this.suivi(n, t, w, c, true); return; }
    } else t.attente = Math.max(0, t.attente - dt * 2);
    const ux0 = ux, uz0 = uz;
    ux += v.sx; uz += v.sz;
    const ul = Math.hypot(ux, uz) || 1; ux /= ul; uz /= ul;
    speed *= v.k;
    n.heading = turnToward(n.heading, Math.atan2(ux, uz), dt * 6);
    // on avance dans la direction voulue (le corps se tourne à sa vitesse, les pieds ne glissent pas de travers) ;
    // si l'écart pour un voisin mène au bord de l'eau, on avance droit
    const cc = zgrille.couche(n.x, n.y, n.z);
    let r = this.unPas(n, w, ux, uz, speed * dt, cc);
    if (!r && (v.sx || v.sz)) r = this.unPas(n, w, ux0, uz0, speed * dt * 0.7, cc);
    if (!r) { n.move = lerp(n.move, 0, Math.min(1, dt * 8)); this.suivi(n, t, w, c, false); return; }
    const [nx, nz, g] = r;
    n.x = nx; n.z = nz; n.y = g;
    n.inside = null;
    n.move = lerp(n.move, 1, Math.min(1, dt * 6));
    n.phase += dt * speed * 2.4;
    const want = n.dist < 6 ? angDiff(n.heading, Math.atan2(c.px - n.x, c.pz - n.z)) : 0;
    n.lookY = lerp(n.lookY, Math.abs(want) < 1.5 ? clamp(want, -1, 1) : 0, Math.min(1, dt * 3));
    this.suivi(n, t, w, c, false);
  },
  // un pas dans la direction (ux, uz) : [x, z, y] ou null — jamais dans l'eau, jamais du haut d'un mur (une marche, un
  // banc d'où l'on descend : oui), jamais sur une case d'eau de la carte des pas (une berge des douves, le bord d'un
  // tablier de pont-levis) quand on n'y est pas déjà
  unPas(n, w, ux, uz, v, cc) {
    const hx = Math.sin(n.heading), hz = Math.cos(n.heading), align = Math.max(0, hx * ux + hz * uz);
    const step = v * (0.25 + 0.75 * align);
    let nx = n.x + (ux * 0.6 + hx * 0.4) * step, nz = n.z + (uz * 0.6 + hz * 0.4) * step;
    [nx, nz] = w.collideCircle(nx, nz, n.y, n.y + 1.7, 0.2, 0.5, true); // (le chemin garde 0,3 m des murs : 0,2 suffit en garde-fou)
    const g = w.groundAt(nx, nz, n.y, 0.55, 0.05); // (une marche de 0,55 m au plus, sous les pieds mêmes : on ne grimpe pas sur une table)
    if (g < w.waterLevel - 0.02 || g < n.y - 1.6) return null;
    let g2 = g;
    const G = zgrille, k1 = G.lire(Math.floor(nx / ZG_C), Math.floor(nz / ZG_C), cc), f1 = G.T.f[k1], s1 = G.T.sol[k1];
    if (f1 & ZG_EAU) { const k0 = G.lire(Math.floor(n.x / ZG_C), Math.floor(n.z / ZG_C), cc); if (!(G.T.f[k0] & ZG_EAU)) return null; }
    else if (!(f1 & ZG_BLOQ)) {
      // le tablier d'un pont-levis : on y monte (son bout est plus haut que la berge — une demi-marche de plus, en trois pas)
      if ((f1 & ZG_PONT) && s1 > g + 0.05 && s1 - n.y <= 0.95) g2 = Math.min(s1, Math.max(g, n.y + 0.3));
      // la carte dit un sol bien plus haut que celui qu'on trouve sous ses pieds (sous un tablier, au bas d'un mur) : on
      // n'y va pas — sauf si l'on y est déjà (alors on en sort)
      else if (g < s1 - 0.6) { const k0 = G.lire(Math.floor(n.x / ZG_C), Math.floor(n.z / ZG_C), cc); if (!(n.y < G.T.sol[k0] - 0.6)) return null; }
    }
    return [nx, nz, g2];
  },
  // les portes : ouvrir en approchant, attendre le battant, refermer derrière soi
  portes(n, t, P, dt) {
    const w = this.w;
    if (n.lastDoor && n.lastDoor !== t.porte) {
      const dr = n.lastDoor;
      if (Math.hypot(dr.x - n.x, dr.z - n.z) > 1.9) {
        n.lastDoor = null;
        const h = npcs.hour();
        if (!SHOP_DOORS.has(dr.bld) || h >= 19 || h < 7.5) { if (!npcs.someoneInDoor(dr)) dr.open = 0; }
      }
    }
    let dr = null;
    for (const d of w.doors) {
      if (Math.abs(d.x - n.x) > 2.6 || Math.abs(d.z - n.z) > 2.6) continue;
      // le segment (moi → point visé) passe-t-il l'embrasure ?
      const co = Math.cos(d.r), si = Math.sin(d.r);
      const ax = (n.x - d.x) * co - (n.z - d.z) * si, az = (n.x - d.x) * si + (n.z - d.z) * co;
      const bx = (P.x - d.x) * co - (P.z - d.z) * si, bz = (P.z - d.z) * co + (P.x - d.x) * si;
      if ((az > 0.05 && bz > 0.05) || (az < -0.05 && bz < -0.05)) { if (Math.abs(az) > 0.6 || Math.abs(ax) > d.w / 2 + 0.3) continue; }
      const k = Math.abs(az - bz) > 1e-6 ? az / (az - bz) : 0, xc = ax + (bx - ax) * clamp(k, 0, 1);
      if (Math.abs(xc) > d.w / 2 + 0.35) continue;
      dr = d; break;
    }
    t.porte = dr;
    if (!dr) return false;
    const dd = Math.hypot(dr.x - n.x, dr.z - n.z);
    if (dr.locked) {
      if (dr.bld === n.d.home || dr.bld === n.d.work || dr.bld === n.zDedans) dr.locked = false;
      else { t.pts = null; n.zt = null; return true; } // (fermée à clé entre-temps : on refait le trajet)
    }
    if (dd < 2.4) { dr.open = 1; n.lastDoor = dr; }
    // attendre que le battant soit ouvert ; et qu'on ne soit pas deux dans l'embrasure
    if (dd < 1.3 && dr.a < 1.0) {
      n.move = lerp(n.move, 0, Math.min(1, dt * 6)); t.attPorte = true;
      t.porteT = (t.porteT || 0) + dt;
      if (t.porteT > 2.5) { dr.open = 1; dr.a = Math.max(dr.a, 1.0); t.porteT = 0; } // (le battant résiste : on pousse)
      return true;
    }
    if (dd > 0.5 && dd < 1.5) {
      for (let i = 0, L = npcs.list; i < L.length; i++) {
        const m = L[i];
        if (m === n || !m.st.alive || m.vanished || m.state === 'gone' || m.state === 'sleep') continue;
        if (Math.hypot(m.x - dr.x, m.z - dr.z) < 0.55 && Math.hypot(m.x - dr.x, m.z - dr.z) < dd - 0.2) { n.move = lerp(n.move, 0, Math.min(1, dt * 6)); t.attente += dt; t.attPorte = t.attente < 5; return t.attente < 5; }
      }
    }
    return false;
  },
  // les voisins : on s'écarte (sur sa droite), on ralentit, on s'arrête
  voisins(n, ux, uz, c) {
    const out = { sx: 0, sz: 0, k: 1, stop: false, joueur: false, mobile: false, fixe: false };
    const look = (x, z, mv, mx, mz, joueur, assis) => {
      const rx = x - n.x, rz = z - n.z, d = Math.hypot(rx, rz);
      if (d > 1.6 || d < 1e-4) return;
      const ahead = (rx * ux + rz * uz) / d;
      if (ahead < 0.1) return;
      // côté : celui où l'autre n'est pas ; face à face, chacun sa droite
      let side = rx * uz - rz * ux > 0 ? -1 : 1;
      if (mv && mx * ux + mz * uz < -0.4) side = -1;
      const w = (1.6 - d) / 1.6 * (0.6 + ahead);
      out.sx += -uz * side * w * 0.9; out.sz += ux * side * w * 0.9;
      if (d < 0.9 && ahead > 0.6) out.k = Math.min(out.k, mv ? 0.55 : 0.4);
      if (d < (assis ? 0.42 : 0.62) && ahead > 0.75) { out.stop = true; if (joueur) out.joueur = true; else if (mv) out.mobile = true; else out.fixe = true; }
    };
    for (let i = 0, L = npcs.list; i < L.length; i++) {
      const m = L[i];
      if (m === n || !m.st.alive || m.vanished || m.state === 'gone' || m.state === 'dead' || Math.abs(m.y - n.y) > 1.4) continue;
      if (Math.abs(m.x - n.x) > 1.7 || Math.abs(m.z - n.z) > 1.7) continue;
      const mv = m.state === 'walk' && m.move > 0.3;
      look(m.x, m.z, mv, Math.sin(m.heading), Math.cos(m.heading), false, m.state === 'sleep' || (m.goal && (m.goal.seat || m.goal.pose === 'sit') && m.state === 'idle'));
    }
    const p = game.player;
    if (p && Math.abs(p.pos[1] - n.y) < 1.8) look(p.pos[0], p.pos[2], false, 0, 0, true, false);
    return out;
  },
  // la surveillance : avance-t-on ? sinon, on se débloque — sûrement
  suivi(n, t, w, c, attend) {
    if (game.time - t.chk < 1) return;
    const m = Math.hypot(n.x - t.cx, n.z - t.cz);
    t.chk = game.time; t.cx = n.x; t.cz = n.z;
    if (m > 0.3 || attend || t.attPorte) { t.bloque = 0; t.attPorte = false; return; }
    t.bloque++; n.stuck = t.bloque;
    if (t.bloque === 2) { this.S.coinces++; t.pts = null; return; } // 1. on recalcule le tronçon d'ici
    if (t.bloque === 3) { // 2. on se décale vers la case libre voisine (quelques centimètres, sans rien traverser)
      const cc = zgrille.couche(n.x, n.y, n.z), L = zgrille.libre(n.x, n.z, cc, 0.8, { qui: n, y: n.y, hors: true });
      if (L && Math.hypot(L.x - n.x, L.z - n.z) < 0.8 && this.segLibre(n.x, n.z, n.y, L.x, L.z)) { n.x = L.x; n.z = L.z; n.y = L.y; }
      t.pts = null; return;
    }
    if (t.bloque >= 4) {
      const vu = c.visible(n) && n.dist < 60;
      if (!vu || t.bloque >= 16) {
        // 3. hors de vue (ou après un long moment) : on se pose plus loin sur son propre chemin, sur une case libre
        const P = t.pts && t.pts.length ? t.pts[t.pts.length - 1] : null;
        const Q = P || (t.ni < (n.path || []).length ? this.pos(n.path[t.ni]) : t.G);
        const cc = zgrille.couche(Q.x, n.y, Q.z), L = zgrille.libre(Q.x, Q.z, cc, 2, { qui: n });
        if (L) { n.x = L.x; n.z = L.z; n.y = L.y; this.S.sauts++; if (vu) this.S.sautsVus++; }
        t.pts = null; t.bloque = 0; this.S.debloques++;
        if (P === null && t.ni < (n.path || []).length) t.ni++;
        return;
      }
      if (t.bloque % 4 === 0) { t.pts = null; if (t.bloque >= 8) this.partir(n, t.G); }
    }
  },

  // aucun mur, aucune porte fermée entre deux points proches ? (à hauteur de corps)
  segLibre(x0, z0, y, x1, z1) {
    const w = this.w, L = Math.hypot(x1 - x0, z1 - z0), nS = Math.max(1, Math.ceil(L / 0.08));
    for (let k = 1; k <= nS; k++) {
      const x = x0 + (x1 - x0) * k / nS, z = z0 + (z1 - z0) * k / nS;
      let hit = false;
      w.query(x, z, 0.3, null, (b) => {
        if (hit || (b.ver && !(b.ver & w.curVer))) return;
        const [lx, lz] = World.blockLocal(b, x, z);
        if (Math.abs(lx) > b.sx / 2 - 0.02 || Math.abs(lz) > b.sz / 2 - 0.02) return;
        if (b.y > y + 1.6 || b.y + World.blockTop(b, lx, lz) < y + 0.4) return;
        hit = true;
      });
      if (hit) return false;
      for (const d of w.doors) { if (d.a > 0.4 || Math.abs(d.x - x) > 1.5 || Math.abs(d.z - z) > 1.5) continue; const [lx, lz] = World.blockLocal(w.doorBox(d), x, z); if (Math.abs(lx) < d.w / 2 && Math.abs(lz) < 0.08) return false; }
    }
    return true;
  },

  // ------------------------------------------------------------------ loin des yeux : on file de nœud en nœud
  filer(n, dt, w, t) {
    t.loin = true; t.leve = null; t.inst = null; t.pts = null; t.grimpe = null;
    let reste = (n.dist > ZT_LOIN ? 28 : 6) * dt;
    const path = n.path || [];
    for (let k = 0; k < 10 && reste > 0; k++) {
      let T, last = false;
      if (t.ni < path.length) {
        if (t.ni > 0) { const a = path[t.ni - 1], b = path[t.ni], e = (w.nav.adj[a] || []).find((x) => x.to === b); if (e && e.flag && e.flag.startsWith('bridge:') && !npcs.edgeOk(n, e)) { n.goal = null; n.state = 'idle'; n.move = 0; return; } }
        T = this.pos(path[t.ni]);
      } else { T = t.G; last = true; }
      const dx = T.x - n.x, dz = T.z - n.z, d = Math.hypot(dx, dz);
      if (d <= reste) {
        n.x = T.x; n.z = T.z; reste -= d;
        if (last) {
          const G = t.G;
          n.y = G.y !== undefined && G.y !== null ? G.y : w.groundAt(n.x, n.z, Math.max(n.y, w.heightAt(n.x, n.z)) + 1.2, 1.6);
          t.loin = false; this.arriver(n, t, null);
          return;
        }
        t.ni++; n.pi = t.ni;
        continue;
      }
      n.x += dx / d * reste; n.z += dz / d * reste; n.heading = Math.atan2(dx, dz); reste = 0;
    }
    n.inside = null;
    n.y = w.groundAt(n.x, n.z, Math.max(n.y, w.heightAt(n.x, n.z) - 1) + 1.2, 1.8);
    n.move = 1; n.phase += dt * 6;
  },

  // ------------------------------------------------------------------ fuir (un assassin, un coup) : à l'écart, mais jamais dans l'eau ni dans un mur
  fuir(n, dt, w, c) {
    this.image();
    const a0 = Math.atan2(n.x - c.px, n.z - c.pz);
    const F = n.zFuite && game.time - n.zFuite.t < 0.6 ? n.zFuite : (n.zFuite = { t: game.time, a: this.cap(n, a0) });
    n.heading = turnToward(n.heading, F.a, dt * 6);
    let nx = n.x + Math.sin(n.heading) * 3.6 * dt, nz = n.z + Math.cos(n.heading) * 3.6 * dt;
    [nx, nz] = w.collideCircle(nx, nz, n.y, n.y + 1.7, 0.28, 0.5, true);
    const g = w.groundAt(nx, nz, n.y + 0.6, 0.6);
    if (g >= w.waterLevel - 0.02 && g >= n.y - 0.75) { n.x = nx; n.z = nz; n.y = g; }
    n.move = 1; n.run = true; n.phase += dt * 8;
    if (n.fleeT <= 0) { n.run = false; n.goal = null; }
  },
  // le meilleur cap de fuite : celui qui s'éloigne et dont les deux prochains mètres passent
  cap(n, a0) {
    const cc = zgrille.couche(n.x, n.y, n.z);
    for (const da of [0, 0.5, -0.5, 1.0, -1.0, 1.6, -1.6, 2.3, -2.3]) {
      const a = a0 + da, x = n.x + Math.sin(a) * 2.2, z = n.z + Math.cos(a) * 2.2;
      if (zgrille.vue(n.x, n.z, x, z, cc, { qui: n, depart: true })) return a;
    }
    return a0;
  },

  // ------------------------------------------------------------------ courir vers un point (gardes, poursuites, urgences)
  // (remplace societe.courir et gardes.courir : un chemin sur la carte des pas, revu chaque seconde ou quand la cible bouge)
  courir(n, tx, tz, dt, w, sp) {
    this.image();
    const R = n.zc || (n.zc = { tx: 1e9, tz: 1e9, pts: null, k: 0, t: 0 });
    const cc = zgrille.couche(n.x, n.y, n.z);
    if (Math.hypot(tx - R.tx, tz - R.tz) > 2.5 || game.time > R.t || (R.pts && R.k >= R.pts.length && Math.hypot(tx - n.x, tz - n.z) > 1)) {
      R.tx = tx; R.tz = tz; R.t = game.time + 1.1; R.k = 0;
      const t0 = performance.now();
      if (Math.hypot(tx - n.x, tz - n.z) < 3 || zgrille.vue(n.x, n.z, tx, tz, cc, { qui: n, depart: true })) R.pts = null;
      else if (this.ms < ZT_BUDGET * 2) R.pts = zgrille.chemin(n.x, n.z, tx, tz, cc, { qui: n, marge: 10, max: 16000, proche: 3, yDep: n.y });
      this.temps(t0);
    }
    let gx = tx, gz = tz;
    if (R.pts && R.k < R.pts.length) {
      const P = R.pts[R.k]; gx = P.x; gz = P.z;
      if (Math.hypot(gx - n.x, gz - n.z) < 0.6) R.k++;
    }
    for (const dr of w.doors) if (Math.abs(dr.x - n.x) < 2 && Math.abs(dr.z - n.z) < 2 && !dr.locked) dr.open = 1;
    n.heading = turnToward(n.heading, Math.atan2(gx - n.x, gz - n.z), dt * 6);
    const ud = Math.hypot(gx - n.x, gz - n.z) || 1;
    const r = w === this.w ? this.unPas(n, w, (gx - n.x) / ud, (gz - n.z) / ud, sp * dt, cc) : null;
    let nx, nz, g;
    if (r) [nx, nz, g] = r;
    else {
      if (w === this.w) { n.move = lerp(n.move, 0, dt * 6); return; }
      nx = n.x + Math.sin(n.heading) * sp * dt; nz = n.z + Math.cos(n.heading) * sp * dt;
      [nx, nz] = w.collideCircle(nx, nz, n.y, n.y + 1.7, 0.28, 0.5, true);
      g = w.groundAt(nx, nz, n.y + 0.6, 0.6);
      if (g < w.waterLevel - 0.25 && !n.inside) { n.move = lerp(n.move, 0, dt * 6); return; }
    }
    n.x = nx; n.z = nz; n.y = g; n.inside = null; n.state = 'walk';
    n.move = 1; n.run = sp > 3; n.phase += dt * sp * 2.2;
  },

  // ------------------------------------------------------------------ dormir, se réveiller (pour le cambriolage de nuit, les bruits, les gardes)
  // le lit d'un habitant : { x, y, z, r, bld } (le point où il est couché) ou null
  lit(n) {
    if (typeof n === 'string') n = npcs.byId[n];
    if (!n || !n.d) return null;
    const B = this.w && this.w.bld[n.d.home];
    if (!B || !B.spots) return null;
    const sp = B.spots['lit_' + n.id] || (n.d.id === 'fillette' && B.spots.bed2) || B.spots.bed;
    return sp ? { x: sp.x, y: sp.y, z: sp.z, r: sp.r, bld: B.key } : null;
  },
  // dort-il dans son lit, maintenant ?
  auLit(n) {
    if (typeof n === 'string') n = npcs.byId[n];
    if (!n || !n.st || !n.st.alive || n.vanished || n.state !== 'sleep') return false;
    const L = this.lit(n);
    return !!L && Math.hypot(L.x - n.x, L.z - n.z) < 0.6 && Math.abs(L.y - n.y) < 0.6;
  },
  // ceux qui dorment dans un bâtiment (clé de w.bld), ou partout
  dormeurs(bld) { return npcs.list.filter((n) => this.auLit(n) && (!bld || n.d.home === bld)); },
  // dormira-t-il à cette heure ? (selon sa routine du jour)
  dortA(n, h) { if (typeof n === 'string') n = npcs.byId[n]; if (!n) return false; try { return !!npcs.schedulePlace(n, h === undefined ? npcs.hour() : h).sleep; } catch (e) { return false; } },
  // réveiller : il se lève (à côté du lit), reste debout « duree » secondes (40 par défaut), va voir « vers » s'il le faut,
  // puis se recouche si c'est l'heure. opts : { duree, vers: {x, z, bld}, raison, arrivee(n), fin(n, ok), dire }
  reveiller(n, opts) {
    if (typeof n === 'string') n = npcs.byId[n];
    if (!n || !n.st || !n.st.alive || n.vanished || n.state === 'gone' || n.state === 'dead') return false;
    opts = opts || {};
    const L = this.lit(n), etaitAuLit = n.state === 'sleep';
    n.sleep = false;
    if (n.state === 'sleep') n.state = 'idle';
    this.S.reveils++;
    let D;
    if (opts.vers) D = this.point(n, opts.vers.x, opts.vers.z, { bld: opts.vers.bld });
    else {
      // debout au pied du lit, à regarder autour
      const B = L ? this.w.bld[L.bld] : null, cc = zgrille.couche(n.x, n.y, n.z);
      const A = zgrille.libre(n.x, n.z, cc, 2.5, { qui: n, y: L ? L.y - 0.5 : n.y, hors: etaitAuLit, meme: { x: n.x, z: n.z } });
      D = { node: B ? B.nMid : npcs.nearestReach(n.x, n.z, (q) => !/:(in|mid)$/.test(q.tag)), x: A ? A.x : n.x, z: A ? A.z : n.z, pose: null, bld: B ? B.key : null, r: Math.random() * TAU };
    }
    this.ordre(n, D, { duree: opts.duree ?? 40, fin: opts.fin, arrivee: opts.arrivee, raison: opts.raison || 'reveil', course: opts.course });
    if (opts.dire) npcs.say(n, opts.dire, 3);
    for (const f of this.ecouteurs.reveil) { try { f(n, opts); } catch (e) { console.error(e); } }
    return true;
  },
  // se recoucher tout de suite (si c'est l'heure de dormir ; sinon, la routine reprend)
  dormir(n) {
    if (typeof n === 'string') n = npcs.byId[n];
    if (!n) return false;
    this.liberer(n);
    n.goal = null; n.place = null;
    return true;
  },
  // aller à un point et y rester « duree » secondes (30 par défaut, comptées à l'arrivée), puis la routine reprend ;
  // opts : { duree, pose ('sit'|'work'|'fish'|null), r (cap), bld, y, course (courir), raison, arrivee(n), fin(n, ok), max (s) }
  allerA(n, x, z, opts) {
    if (typeof n === 'string') n = npcs.byId[n];
    if (!n || !n.st || !n.st.alive || n.vanished) return false;
    opts = opts || {};
    const D = this.point(n, x, z, opts);
    this.ordre(n, D, opts);
    if (opts.course) n.run = true;
    return true;
  },
  point(n, x, z, o) {
    o = o || {};
    const cc = zgrille.couche(x, o.y ?? n.y, z), e = zgrille.cellule(x, z, cc);
    let px = x, pz = z;
    if ((e.f & ZG_BLOQ) && !o.pose) { const L = zgrille.libre(x, z, cc, 3, { qui: n, meme: { x, z } }); if (L) { px = L.x; pz = L.z; } }
    const B = o.bld && this.w.bld[o.bld];
    const node = B ? B.nMid : npcs.nearestReach(px, pz, (q) => !/:(in|mid)$/.test(q.tag));
    return { node, x: px, z: pz, pose: o.pose || null, r: o.r ?? null, bld: o.bld || null, y: o.y, ordre: true };
  },
  // un ordre : remplace la routine jusqu'à la fin de sa durée (comptée à partir de l'arrivée) ; un second ordre remplace
  // le premier (dont la fin est appelée d'abord, fin(n, false) — le nouvel ordre passe après, quoi qu'elle fasse)
  ordre(n, D, o) {
    const old = n.zOrdre;
    if (old) { n.zOrdre = null; if (old.fin && !old.fini) { old.fini = true; try { old.fin(n, false); } catch (e) { console.error(e); } } }
    n.zOrdre = { D, duree: o.duree ?? 30, fin: o.fin || null, arrivee: o.arrivee || null, raison: o.raison || 'ordre', t0: game.time, max: game.time + (o.max ?? 240), dormir: !!o.dormir, course: !!o.course };
    n.goal = null;
  },
  // le mettre au lit sans marcher, quand il est au pied (à 3 m au plus, ou hors de vue) : il s'y couche (0,6 s) ; sinon
  // il y va à pied (comme dormir). Rend vrai s'il se couche sur place.
  coucher(n) {
    if (typeof n === 'string') n = npcs.byId[n];
    if (!n || !n.st || !n.st.alive || n.vanished || n.state === 'gone' || n.state === 'dead') return false;
    const L = this.lit(n);
    if (!L || (Math.hypot(L.x - n.x, L.z - n.z) > 3 && this.vu(n)) || Math.abs(L.y - n.y) > 2.2) { this.dormir(n); return false; }
    this.liberer(n);
    n.place = 'home'; n.sleep = true;
    const D = npcs.dest(n, 'home', true);
    if (!D || Math.hypot(D.x - L.x, D.z - L.z) > 0.6) { n.goal = null; n.place = null; return false; }
    n.goal = D; n.path = []; n.pi = 0; n.zInst = null; n.run = false;
    const t = n.zt = this.zt0(D, n);
    t.pts = []; t.final = true;
    t.inst = { a: 0, x0: n.x, z0: n.z, y0: n.y, ax: n.x, az: n.z, ay: n.y };
    n.state = 'walk';
    return true;
  },
  liberer(n) {
    if (typeof n === 'string') n = npcs.byId[n];
    if (!n || !n.zOrdre) return;
    const O = n.zOrdre; n.zOrdre = null;
    if (O.fin && !O.fini) { O.fini = true; try { O.fin(n, false); } catch (e) { console.error(e); } }
    n.goal = null; n.run = false;
  },
  occupe(n) { if (typeof n === 'string') n = npcs.byId[n]; return !!(n && n.zOrdre); },
  // (appelé par npcs.update) : l'ordre en cours mène l'habitant ; renvoie true si c'est le cas
  mener(n) {
    const O = n.zOrdre;
    if (!O) return false;
    if (!n.st.alive || n.vanished) { this.liberer(n); return false; }
    if (n.goal !== O.D) {
      if (O.lance) { this.liberer(n); return false; } // (un autre module a repris la main)
      O.lance = true;
      n.goal = O.D; n.place = 'ordre:' + O.raison; n.sleep = O.dormir;
      if (Math.hypot(O.D.x - n.x, O.D.z - n.z) < 0.3 && !n.zInst) { n.state = n.sleep ? 'sleep' : 'idle'; n.zt = { G: O.D, fini: true, pts: [], k: 0, ni: 0 }; O.arriveT = game.time; }
      else this.partir(n, O.D);
    }
    if (n.state !== 'walk' && !O.arriveT) O.arriveT = game.time;
    if (O.course && n.state === 'walk') n.run = true;
    if ((O.arriveT && game.time - O.arriveT > O.duree) || game.time > O.max) { const f = O.fin; n.zOrdre = null; n.goal = null; n.run = false; if (f && !O.fini) { O.fini = true; try { f(n, !!O.arriveT); } catch (e) { console.error(e); } } return false; }
    return true;
  },

  // ------------------------------------------------------------------ pour les autres : un chemin, un point libre, des mesures
  // la carte des pas d'un monde (la vallée, ou un autre : la Zone de V1 a la sienne, gardée à part)
  autres: new WeakMap(),
  grilleDe(w) {
    w = w || this.vallee();
    if (w === this.vallee()) { if (this.w !== w) this.monde(w); return zgrille; }
    let G = this.autres.get(w);
    if (!G) {
      G = Object.create(zgrille);
      Object.assign(G, { carreaux: new Map(), file: [], fileK: new Set(), stat: { astar: 0, exp: 0, ms: 0, echec: 0, trop: 0 }, vuB: new Uint32Array(16), vuO: new Uint32Array(16), tampon: 1, PQ: null, PV: null, PS: null, PF: null, pgen: 0, T: null });
      G.reset(w); this.autres.set(w, G);
    }
    if (G.w !== w) G.reset(w);
    return G;
  },
  // chemin(x0, z0, x1, z1, opts) → [{x, z, y}…] ou null
  // (opts : { monde (un World, la vallée par défaut), y (hauteur des pieds au départ), qui (un habitant : ses portes à clé),
  //  portes (toutes les portes comptent ouvertes), marge, max, proche (m : accepter d'arriver au plus près) })
  chemin(x0, z0, x1, z1, opts) {
    opts = opts || {};
    const G = this.grilleDe(opts.monde), w = G.w;
    const cc = G.couche(x0, opts.y ?? w.groundAt(x0, z0, w.heightAt(x0, z0) + 1, 1.5), z0);
    if (G.vue(x0, z0, x1, z1, cc, { qui: opts.qui, depart: true, portes: opts.portes })) return [{ x: x1, z: z1, y: null }];
    return G.chemin(x0, z0, x1, z1, cc, Object.assign({ marge: 12, max: 20000 }, opts));
  },
  libre(x, z, r, y, monde) { const G = this.grilleDe(monde), w = G.w, cc = G.couche(x, y ?? w.heightAt(x, z), z); return G.libre(x, z, cc, r || 3, { y }); },
  passable(x, z, y, monde) { const G = this.grilleDe(monde), w = G.w, cc = G.couche(x, y ?? w.heightAt(x, z), z), e = G.cellule(x, z, cc); return !(e.f & ZG_BLOQ); },
  stats() { return Object.assign({}, this.S, { lents: this.lents.slice(-12), carreaux: zgrille.carreaux.size, carreauxFaits: zgrille.nCarreaux, msCarreaux: Math.round(zgrille.tCarreaux), grille: Object.assign({}, zgrille.stat) }); },
  surArrivee(fn) { this.ecouteurs.arrivee.push(fn); },
  surReveil(fn) { this.ecouteurs.reveil.push(fn); },
};

// ============================================================================
//  BRANCHEMENTS
// ============================================================================
// la marche est refaite ici : l'emballage de 11-zzz52-routines.js (filer loin des yeux, pas vif des voyageurs)
// n'est plus appelé — les deux choses y sont reprises (filer, n.voyage).
npcs.walk = function (n, dt, w, c) { return trajets.marcher(n, dt, w, c); };
npcs.flee = function (n, dt, w, c) { return trajets.fuir(n, dt, w, c); };
// les poursuites et les urgences des gardes courent sur la carte des pas
if (typeof societe !== 'undefined' && societe.courir) societe.courir = function (n, tx, tz, dt, w, sp) { return trajets.courir(n, tx, tz, dt, w, sp); };
if (typeof gardes !== 'undefined' && gardes.courir) gardes.courir = function (n, tx, tz, dt, w, sp) { return trajets.courir(n, tx, tz, dt, w, sp); };
HOOKS.load.push(() => {
  const w = trajets.vallee();
  trajets.monde(null); trajets.monde(w);
  if (farm.s && !farm.s.trajets) farm.s.trajets = { v: 1 };
  for (let i = 0; i < npcs.list.length; i++) { const n = npcs.list[i]; n.zt = null; n.zOrdre = null; n.zInst = null; n.zc = null; n.zFuite = null; }
});
