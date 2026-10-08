// ============================================================================
//  LES GOBELINS (agent X) : le jeu
//  - LA NUIT, ILS VOLENT : chaque soir, la nichée choisit une à trois maisons
//    (habitées surtout, des commerces, parfois la ferme du joueur s'ils lui en
//    veulent). Un gobelin sort du terrier le plus proche, va à la maison, passe
//    à travers le mur, fouille un meuble (les meubles à fouiller de
//    11-zzz98-fouilles.js : le meuble est vraiment vidé), rentre. Le lendemain,
//    le volé se plaint ; trois griffes et un rond sont griffés sur le meuble ;
//    ce qui a été pris est sur l'étal de la Gobelinière, rangé par maisons.
//    Loin du joueur, le vol se déroule sur le papier (aux heures dites) ; près
//    de lui (moins de 125 m), le gobelin prend corps et on peut le voir faire.
//  - ILS SE BALADENT : la nuit (surtout), au bord des bois et des haies, on en
//    croise un, de loin, qui longe un mur, s'arrête, renifle, ramasse.
//  - ILS RESTENT LOIN DES HOMMES : un homme à moins de quinze mètres, ils se
//    cachent ou s'éloignent. S'ILS SE SAVENT VUS (le joueur les regarde, assez
//    près pour les distinguer — la nuit, c'est peu : la lune, la lanterne, un
//    réverbère y font beaucoup), ILS FUIENT pour sortir de son champ de vision :
//    derrière un mur, un tronc, une butte ; à quatre pattes, très vite. BLOQUÉS
//    (un mur, une maison), ILS PASSENT À TRAVERS : lentement, en s'étirant, avec
//    un bruit de bois mouillé. Puis ils s'enfoncent dans la terre.
//  - Les attraper (E, quand ils ne vous voient pas, ou qu'ils fouillent, ou qu'ils
//    dorment) : on les lâche (ils s'en souviennent : un présent sur le seuil), on
//    leur fait lâcher ce qu'ils portent (ils mordent), ou on les tue.
//  - Les tuer (à mains nues, au fusil, à l'arc, à l'outil) : il n'en reste au
//    matin qu'un tas de chiffons ; la nichée s'en souvient (la rancune) ; au-delà
//    de six morts, ou la vieille tuée, ils quittent la vallée pour toujours.
//  - LEUR VILLAGE (la Gobelinière) : un signe (trois griffes et un rond, sur les
//    pierres et les meubles), un mécanisme (la racine polie au pied de la vieille
//    souche, qu'on ne voit qu'accroupi, à leur hauteur), une condition (le
//    panneau ne cède que la nuit, quand ils sont dehors ; et pas si l'un d'eux
//    vous a vu rôder près de la souche). En bas : la chambre des racines, un
//    boyau où l'on passe accroupi, la grande salle. Le jour, ils y dorment
//    (on y entre en silence ; chaque bruit peut en réveiller un) ; la nuit, il
//    n'en reste que deux ou trois. Vu : un cri, et ils entrent tous dans les
//    parois. Les tas (des générations de vols) se fouillent par poignées, l'étal
//    des prises se reprend (et l'on rend aux gens ce qu'on leur avait pris) ;
//    mais ils comptent tout : chaque poignée, ils la reprendront dans vos
//    coffres. La vieille, sur le grand tas, parle avec des voix volées ; on peut
//    faire un marché avec elle (rien de chez vous, rien de chez eux) si l'on n'a
//    encore rien pris. Le boyau de l'est s'ouvre de l'intérieur : il mène à un
//    terrier près de la ferme (un raccourci).
//  État : farm.s.gobelins (S()) ; génération : w.gobelins (11-zzzzX-1-gen.js).
//  API : gobelins (S(), village(), souche(), terriers(), voles(), vus(), voler(cle),
//        presents(x, z, r), etat(), forcer…)
// ============================================================================

// ---------------------------------------------------------------- petits outils
const gobRnd = (a, b) => a + Math.random() * (b - a);
const gobPick = (L) => L[(Math.random() * L.length) | 0];
// un point libre pour un gobelin (rayon 0,22) à la hauteur y : pas de bloc en travers du corps
function gobLibre(w, x, z, y, r) {
  r = r || 0.24;
  let ok = true;
  w.query(x, z, r + 0.6, null, (b) => {
    if (!ok || (b.ver && !(b.ver & w.curVer))) return;
    if (b.y > y + 0.95 || b.y + World.blockTop(b, 0, 0) < y + 0.3) return;
    const [lx, lz] = World.blockLocal(b, x, z);
    if (Math.abs(lx) < b.sx / 2 + r && Math.abs(lz) < b.sz / 2 + r) ok = false;
  });
  return ok;
}

const gobelins = {
  E: [], t: 0, tickT: 0, rodT: 0, villageT: 0, chuchoT: 20, dans: false, aieuleE: null, tenu: null, _branche: false,

  // ------------------------------------------------------------------ l'état
  S() {
    const s = farm.s;
    if (!s) return null;
    let S = s.gobelins;
    if (!S || typeof S !== 'object' || Array.isArray(S)) S = s.gobelins = {};
    if (!S.v) S.v = 1;
    for (const k of ['connu', 'tas', 'plaintes', 'recents']) if (!S[k] || typeof S[k] !== 'object' || Array.isArray(S[k])) S[k] = {};
    for (const k of ['morts', 'prises', 'rendre', 'meubles', 'lache', 'corps']) if (!Array.isArray(S[k])) S[k] = [];
    for (const k of ['rancune', 'tues', 'vols', 'pris', 'prisVal', 'vus', 'grand', 'aieule', 'partis', 'pacte', 'pacteRompu', 'lacheBonte', 'cadeau', 'barre', 'alerte']) if (!isFinite(S[k])) S[k] = 0;
    if (!S.nuit || typeof S.nuit !== 'object' || !Array.isArray(S.nuit.raids)) S.nuit = { n: -99, raids: [] };
    return S;
  },
  G() { const w = game.world; return w && farm.w === w ? w.gobelins || null : null; },
  village() { const G = this.G(); return G && G.village ? { x: G.village.x, y: G.village.y, z: G.village.z } : null; },
  souche() { const G = this.G(); return G && G.souche ? { x: G.souche.x, z: G.souche.z } : null; },
  terriers() { const G = this.G(); return G ? G.terriers.map((t) => ({ x: t.x, z: t.z, cle: t.cle })) : []; },
  voles() { const S = this.S(); return S ? S.prises.slice() : []; },
  vus() { const S = this.S(); return S ? S.vus : 0; },
  presents(x, z, r) { return this.E.filter((e) => !e.removed && !e.dead && !e.hidden && Math.hypot(e.x - x, e.z - z) < r); },
  heure() { try { return npcs.hour(); } catch (e) { return 12; } },
  nuitCle() { const h = this.heure(); return h >= 12 ? farm.s.day : farm.s.day - 1; },
  // heures depuis 21 h 30 (la nuit des gobelins) ; négatif avant
  T() { const h = this.heure(); return h >= 12 ? h - 21.5 : h + 2.5; },
  dehorsNuit() { const h = this.heure(); return h >= GOB_REGL.sortie[0] || h < GOB_REGL.sortie[1]; },
  hS() { return (game.world && game.world.dayLength ? game.world.dayLength : 1200) / 24; }, // secondes réelles par heure de jeu
  partis() { const S = this.S(); return !!(S && S.partis > 0 && S.partis <= farm.s.day); },
  vivants() { const S = this.S(), out = []; for (let i = 0; i < GOB_REGL.nichee; i++) if (!S.morts.includes(i)) out.push(i); return out; },
  // la vallée de tous les jours (pas un autre monde, pas le Dessous, pas la prison)
  monde() {
    if (!farm.s || !farm.on || farm.s.over || game.kind !== 'farm' || !game.world || game.world !== farm.w) return false;
    try {
      if (typeof strange !== 'undefined' && strange.inEnvers && strange.inEnvers()) return false;
      if (typeof mondes !== 'undefined' && (mondes.cur || (mondes.actuel && mondes.actuel()))) return false;
      if (typeof souterrain !== 'undefined' && souterrain.actif) return false;
      if (typeof prison !== 'undefined' && prison.S && prison.S() && prison.S().actif) return false;
      if (typeof zone !== 'undefined' && zone && typeof zone.dedans === 'function' && zone.dedans()) return false;
    } catch (e) { return false; }
    return true;
  },
  dansLeVillage() {
    const G = this.G(), V = G && G.village, p = game.player;
    if (!V || !p) return false;
    const dx = p.pos[0] - V.x, dz = p.pos[2] - V.z;
    return dx > -V.W / 2 - 16 && dx < V.W / 2 + 14 && Math.abs(dz) < V.D / 2 + 3 && p.pos[1] > V.y - 3 && p.pos[1] < V.y + V.H + 2;
  },

  // ------------------------------------------------------------------ la nuit : qui sort, où
  planifier() {
    const S = this.S(), s = farm.s, G = this.G(), n = this.nuitCle();
    if (S.nuit.n === n) return;
    this.finirNuit();
    S.nuit = { n, raids: [] };
    if (this.partis() || !G || !G.terriers.length) return;
    const libres = this.vivants();
    let nb = Math.round(gobRnd(GOB_REGL.vols[0] - 0.49, GOB_REGL.vols[1] + 0.49)) + (S.rancune >= 3 ? 1 : 0);
    nb = Math.min(3, libres.length, nb);
    const pacte = S.pacte > 0 && !S.pacteRompu;
    const pFerme = pacte ? 0 : S.rancune >= 1 ? 0.85 : s.day >= 4 ? 0.06 : 0;
    const raids = [];
    if (nb > 0 && Math.random() < pFerme && this.coffresFerme().length) raids.push({ bld: 'ferme', it: 'ferme' });
    // les maisons : un meuble pas encore vidé, un terrier pas trop loin
    const parBld = new Map();
    if (typeof fouilles !== 'undefined' && fouilles.par) for (const it of fouilles.par.values()) {
      const d = it.data || {};
      if (it.kind !== 'f2' || !d.bld || d.cache || d.t === 'cache' || d.lieu === 'rebut' || d.lieu === 'public' || d.lieu === 'libre') continue;
      const B = game.world.bld[d.bld];
      if (!B || B.under || d.bld === 'ferme') continue;
      try { if (fouilles.vide(it)) continue; } catch (e) { continue; }
      if (!parBld.has(d.bld)) parBld.set(d.bld, []);
      parBld.get(d.bld).push(it);
    }
    const cand = [];
    for (const [bld, L] of parBld) {
      const B = game.world.bld[bld], ter = this.terrierProche(B.x, B.z);
      if (!ter || ter.d > 330) continue;
      const own = typeof fouilles.proprio === 'function' ? fouilles.proprio(L[0]) : null;
      let k = own && own.st && own.st.alive ? (SHOP_DOORS.has(bld) ? 1.3 : 1) : 0.25;
      if (S.recents[bld] !== undefined && n - S.recents[bld] < 3) k *= 0.15;
      cand.push({ bld, L, k });
    }
    while (raids.length < nb && cand.length) {
      const tot = cand.reduce((a, c) => a + c.k, 0);
      let r = Math.random() * tot, i = 0;
      for (; i < cand.length - 1; i++) { r -= cand[i].k; if (r <= 0) break; }
      const c = cand.splice(i, 1)[0];
      const L = c.L.filter((it) => !it.data.lock), it = gobPick(L.length && Math.random() < 0.75 ? L : c.L);
      raids.push({ bld: c.bld, it: it.id });
    }
    const hS = this.hS();
    raids.forEach((R, i) => {
      const P1 = this.cibleRaid(R), ter = P1 ? this.terrierProche(P1.x, P1.z) : null;
      if (!P1 || !ter) return;
      const g = libres[i];
      const d = Math.hypot(P1.x - ter.t.x, P1.z - ter.t.z), voyage = d / 2.0 / hS, fouille = 0.35;
      let hd = gobRnd(0.5, 3.6);
      if (hd + voyage * 2 + fouille > 7.6) hd = Math.max(0.2, 7.6 - voyage * 2 - fouille);
      S.nuit.raids.push({ g, bld: R.bld, it: R.it, ter: ter.i, hd, ha: hd + voyage, hf: hd + voyage + fouille, hr: hd + voyage * 2 + fouille, etat: 'prevu', vole: false });
    });
  },
  // l'endroit visé : le meuble (ou le coffre de la ferme)
  cibleRaid(R) {
    const w = game.world;
    if (R.it === 'ferme') { const B = w.bld.ferme; if (!B) return null; const mid = w.nav.nodes[B.nMid] || B; return { x: mid.x, z: mid.z, y: B.y, it: null }; }
    const it = fouilles.par && fouilles.par.get(R.it);
    if (!it) return null;
    const y = w.groundAt(it.x, it.z, it.y + 0.2, 1.5);
    return { x: it.x, z: it.z, y, it };
  },
  terrierProche(x, z) {
    const G = this.G();
    if (!G) return null;
    let best = null;
    G.terriers.forEach((t, i) => { const d = Math.hypot(t.x - x, t.z - z); if (!best || d < best.d) best = { t, i, d }; });
    return best;
  },
  // le joueur a-t-il des coffres (et quelque chose dedans) ?
  coffresFerme() {
    const s = farm.s, out = [];
    for (const id in s.chests || {}) { const C = s.chests[id]; if (C && Object.keys(C).some((k) => C[k] > 0)) out.push(C); }
    for (const q of game.world.props) if (q.id === 'coffre' && q.data && q.data.items && Object.keys(q.data.items).some((k) => q.data.items[k] > 0) && q.x !== undefined && farm.w && w2ferme(q)) out.push(q.data.items);
    return out;
    function w2ferme(q) { const F = game.world.bld.ferme; return F && Math.hypot(q.x - F.x, q.z - F.z) < 60; }
  },
  // le vol lui-même (sur le papier ou sous les yeux)
  voler(R) {
    const S = this.S(), s = farm.s;
    if (!R || R.vole) return;
    R.vole = true;
    S.recents[R.bld] = S.nuit.n;
    // (la nuit du vol ; on s'en aperçoit le matin d'après)
    const j = S.nuit.n, matin = j + 1;
    if (R.it === 'ferme') {
      const Cs = this.coffresFerme();
      if (!Cs.length) return;
      let prises = 0;
      for (let essai = 0; essai < 6 && prises < 2; essai++) {
        const C = gobPick(Cs), ks = Object.keys(C).filter((k) => C[k] > 0 && ITEMS[k] && !ITEMS[k].unique && ITEMS[k].cat !== 'quete' && ITEMS[k].cat !== 'outil' && ITEMS[k].cat !== 'relique' && (ITEMS[k].price || 0) <= 40);
        if (!ks.length) continue;
        const k = gobPick(ks), n = Math.min(C[k], (ITEMS[k].price || 0) <= 5 ? 1 + ((Math.random() * 3) | 0) : 1);
        C[k] -= n; if (C[k] <= 0) delete C[k];
        this.ajouterPrise(k, n, 'ferme', 'ferme', j);
        prises++;
        S.rancune = Math.max(0, S.rancune - Math.max(0.5, (ITEMS[k].price || 1) * n / 25));
      }
      if (prises) { S.volFerme = matin; S.vols++; }
      return;
    }
    const it = fouilles.par && fouilles.par.get(R.it);
    if (!it) return;
    try { if (fouilles.vide(it)) return; } catch (e) { return; }
    const lots = rollLoot(fouilles.table(it));
    let pieces = 0;
    const own = fouilles.proprio(it), de = own && own.st && own.st.alive ? own.id : null;
    for (const [k, n] of lots) {
      if (k === 'argent') { pieces += n; continue; }
      if (!ITEMS[k] || ITEMS[k].unique || ITEMS[k].cat === 'quete') continue;
      this.ajouterPrise(k, n, de, R.bld, j);
    }
    if (pieces > 0) this.ajouterPrise('argent', pieces, de, R.bld, j);
    const F = fouilles.S();
    if (F) { F.vides[it.id] = s.day; fouilles.majProp(it); }
    if (de) S.plaintes[de] = matin;
    S.meubles.push({ it: it.id, j: matin });
    if (S.meubles.length > 8) S.meubles.shift();
    S.vols++;
  },
  ajouterPrise(k, n, de, bld, j) {
    const S = this.S();
    const P = S.prises.find((p) => p.k === k && p.de === de && p.bld === bld);
    if (P) { P.n += n; P.j = j; } else S.prises.push({ k, n, de, bld, j });
    while (S.prises.length > GOB_REGL.etal) S.prises.shift();
    this.majEtal();
  },
  // la fin de la nuit : ce qui n'a pas été fait sous nos yeux se fait sur le papier
  finirNuit() {
    const S = this.S();
    if (!S || !S.nuit) return;
    for (const R of S.nuit.raids) {
      if (R.etat === 'rate') continue;
      if (!R.vole) { try { this.voler(R); } catch (e) { console.error('gobelins', e); } }
      R.etat = 'fait';
    }
    for (const e of this.E.slice()) if (e.gx && e.gx.raid) this.oter(e);
  },

  // ------------------------------------------------------------------ les vols de la nuit, à chaque demi-seconde
  majRaids() {
    const S = this.S(), G = this.G(), T = this.T(), p = game.player;
    if (!S || !G) return;
    const ok = this.monde() && !p.underground && !this.dans;
    for (const R of S.nuit.raids) {
      if (R.etat === 'fait' || R.etat === 'rate') continue;
      const ph = T < R.hd ? 'prevu' : T < R.ha ? 'aller' : T < R.hf ? 'fouille' : T < R.hr ? 'retour' : 'fini';
      if (R.e && (R.e.removed || R.e.dead)) R.e = null;
      if (R.e) { // il a pris corps : c'est lui qui mène
        if (Math.hypot(R.e.x - p.pos[0], R.e.z - p.pos[2]) > GOB_REGL.quitter || !ok) this.oter(R.e);
        continue;
      }
      if (ph === 'fini') { if (!R.vole) this.voler(R); R.etat = 'fait'; continue; }
      if ((ph === 'retour') && !R.vole) this.voler(R);
      if (ph === 'prevu' || !ok) continue;
      const pos = this.posRaid(R, ph, T);
      if (!pos) continue;
      const d = Math.hypot(pos.x - p.pos[0], pos.z - p.pos[2]);
      if (d > GOB_REGL.paraitre) continue;
      // (il ne paraît pas sous les yeux du joueur, tout près)
      if (d < 45 && this.dansLaVue(pos.x, pos.y + 0.6, pos.z, 0.7)) continue;
      this.incarner(R, ph, pos);
    }
  },
  posRaid(R, ph, T) {
    const G = this.G(), ter = G.terriers[R.ter], C = this.cibleRaid(R);
    if (!ter || !C) return null;
    const w = game.world;
    if (ph === 'fouille') return { x: C.x, y: C.y, z: C.z };
    const k = ph === 'aller' ? clamp((T - R.hd) / Math.max(0.01, R.ha - R.hd), 0, 1) : clamp(1 - (T - R.hf) / Math.max(0.01, R.hr - R.hf), 0, 1);
    const x = lerp(ter.x, C.x, k), z = lerp(ter.z, C.z, k);
    return { x, z, y: w.groundAt(x, z, w.heightAt(x, z) + 0.6, 0.6) };
  },
  // ------------------------------------------------------------------ prendre corps
  creer(gid, x, y, z, etat, opts) {
    const w = game.world;
    const e = entities.add(w, 'gobelin', x, z, { v: gid % GOB_HABITS.length });
    e.gob = true; e.gid = gid; e.y = y; e.hp = 18; e.heading = Math.random() * TAU; e.move = 0; e.phase = 0; e.lookY = 0;
    e.gx = Object.assign({ etat, mode: 'marche', vu: 0, sait: false, bloque: 0, t: 0, fuites: 0, sac: false, ombre: 0 }, opts || {});
    this.E.push(e);
    return e;
  },
  incarner(R, ph, pos) {
    const G = this.G(), ter = G.terriers[R.ter], C = this.cibleRaid(R);
    const etat = ph === 'aller' ? 'aller' : ph === 'fouille' ? 'fouille' : 'retour';
    const e = this.creer(R.g, pos.x, pos.y, pos.z, etat, { raid: R, ter: { x: ter.x, y: ter.y, z: ter.z }, cible: C, sac: ph === 'retour' && R.vole, fouilleT: gobRnd(7, 11) });
    e.heading = Math.atan2((etat === 'retour' ? ter.x : C.x) - pos.x, (etat === 'retour' ? ter.z : C.z) - pos.z);
    R.e = e;
    return e;
  },
  oter(e) {
    if (!e) return;
    entities.remove(e);
    this.E = this.E.filter((q) => q !== e);
    if (e.gx && e.gx.raid && e.gx.raid.e === e) e.gx.raid.e = null;
    if (this.aieuleE === e) this.aieuleE = null;
    if (this.tenu === e) this.tenu = null;
  },

  // ------------------------------------------------------------------ ce que voit le joueur
  // le joueur regarde-t-il ce point (et le distingue-t-il) ? k : marge du cône (1 = le cône du regard)
  dansLaVue(x, y, z, k) {
    const p = game.player, eye = p.eyePos(), f = cameraBasis(p.yaw, p.pitch).f;
    const dx = x - eye[0], dy = y - eye[1], dz = z - eye[2], d = Math.hypot(dx, dy, dz) || 1;
    const cosMin = Math.cos(Math.min(1.2, ((settings.fov || 75) * DEG * (game.fovK || 1)) * 0.5 * (k || 1)));
    if ((dx * f[0] + dy * f[1] + dz * f[2]) / d < cosMin) return false;
    return this.ligneLibre(eye, [x, y, z]);
  },
  ligneLibre(a, b) {
    const w = game.world, dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], d = Math.hypot(dx, dy, dz);
    if (d < 0.5) return true;
    const dir = [dx / d, dy / d, dz / d];
    const bh = w.raycastBlocks(a, dir, d - 0.35);
    if (bh && !bh.block.hidden) return false;
    if (!game.player.underground) { const th = w.raycastTerrain(a, dir, d - 0.35); if (th) return false; }
    return true;
  },
  // jusqu'où le joueur les distingue, selon la lumière
  portee(e) {
    const sky = game.sky || {}, R = GOB_REGL.vue, w = game.world, p = game.player;
    if (this.dans) return 26; // (la salle est éclairée de chandelles)
    let v = R.nuit;
    const jour = sky.day || 0;
    if (jour > 0.45) v = R.jour * Math.min(1, jour * 1.3);
    else {
      const lune = sky.moonCol ? (sky.moonCol[0] + sky.moonCol[1] + sky.moonCol[2]) / 3 : 0;
      v = Math.max(v, lerp(R.nuit, R.lune, clamp(lune * 4, 0, 1)));
      if (game.lantern && farm.count('lanterne')) v = Math.max(v, R.lanterne);
      // sous un réverbère, près d'un feu
      e.lumT = (e.lumT || 0) - 1;
      if (e.lumT <= 0) {
        e.lumT = 12; e.lum = 0;
        for (const l of w.lights || []) { if (l.night && !(sky.nightLit)) continue; const d = Math.hypot(l.x - e.x, l.z - e.z); if (d < l.r * 0.8) { e.lum = 1; break; } }
      }
      if (e.lum) v = Math.max(v, R.lumiere);
    }
    if (w.covered(e.x, e.y + 0.5, e.z) && jour > 0.45) v = Math.min(v, 22);
    if (p.crouch > 0.5) v *= 0.95;
    return v;
  },
  // ------------------------------------------------------------------ chaque image
  maj(dt, eye, basis, sky, playing) {
    const S = this.S(), G = this.G();
    if (!S || !G) { if (this.E.length) for (const e of this.E.slice()) this.oter(e); return; }
    this.t += dt;
    // la cible : en surbrillance
    const tg = game.target;
    if (tg && tg.gobE) tg.gobE.highlight = true;
    // regards (chaque image : c'est léger)
    for (const e of this.E) if (!e.removed && !e.dead) this.regard(e, dt, eye, basis);
    this.tickT -= dt;
    if (this.tickT > 0) return;
    this.tickT = 0.5;
    const dansAvant = this.dans;
    this.dans = this.dansLeVillage();
    if (this.dans !== dansAvant) { if (this.dans) this.entrerVillage(); else this.quitterVillage(); }
    if (this.monde() && this.dehorsNuit()) this.planifier();
    else if (S.nuit.n !== this.nuitCle() && !this.dehorsNuit()) { /* le jour : rien à prévoir */ }
    this.majRaids();
    if (this.dans) this.majVillage(0.5);
    else this.majRodeurs(0.5);
    // ceux qui sont trop loin, ou dans un autre monde
    const p = game.player;
    for (const e of this.E.slice()) {
      if (e.removed) { this.oter(e); continue; }
      if (e.gx && e.gx.village) { if (!this.dans) this.oter(e); continue; }
      if (!this.monde() || Math.hypot(e.x - p.pos[0], e.z - p.pos[2]) > GOB_REGL.quitter + 20) this.oter(e);
    }
  },
  // le joueur regarde-t-il ce gobelin ? il le sait
  regard(e, dt, eye, basis) {
    const g = e.gx;
    if (!g || g.etat === 'mur' || g.etat === 'tenu' || g.etat === 'rentrer' || g.etat === 'dort' || g.etat === 'assis' || e.hidden) { if (g) g.vu = 0; return; }
    const tete = [e.x, e.y + 0.75, e.z];
    const dx = tete[0] - eye[0], dz = tete[2] - eye[2], d = Math.hypot(dx, tete[1] - eye[1], dz);
    g.chk = (g.chk || 0) - dt;
    if (g.chk <= 0) {
      g.chk = 0.1;
      g.vue = d < this.portee(e) && this.dansLaVue(tete[0], tete[1], tete[2], 0.85);
      // ou bien un habitant, tout près, éveillé, qui regarde par là
      g.pnj = null;
      if (!g.vue && !this.dans && !g.village) for (const n of npcs.list) {
        if (!n.st.alive || n.sleep || n.state === 'sleep' || n.vanished || n.hunting || n.state === 'gone' || n.state === 'dead') continue;
        const nd = Math.hypot(n.x - e.x, n.z - e.z);
        if (nd > 10 || Math.abs((n.y || 0) - e.y) > 3) continue;
        const face = ((e.x - n.x) * Math.sin(n.heading || 0) + (e.z - n.z) * Math.cos(n.heading || 0)) / (nd || 1);
        if (face > 0.2 && segClear(game.world, n.x, n.z, e.x, e.z)) { g.pnj = n; break; }
      }
    }
    if (g.vue || g.pnj) g.vu += dt * (d < 4 ? 3 : 1); else g.vu = Math.max(0, g.vu - dt * 0.5);
    if (!g.sait && g.vu > GOB_REGL.regard) this.seSaitVu(e, g.pnj && !g.vue ? g.pnj : null);
    if (g.vue && !g.compte) { g.compte = true; this.vuParLeJoueur(e); }
  },
  vuParLeJoueur(e) {
    const S = this.S();
    S.vus++;
    if (S.vus === 1) setTimeout(() => { if (!game.dying) penser.une('gob_premier', GOB_T.penses.premier, 3); }, 700);
  },
  seSaitVu(e, pnj) {
    const g = e.gx;
    g.sait = true;
    if (g.village) { this.alerte(e); return; }
    if (pnj && Math.hypot(pnj.x - game.player.pos[0], pnj.z - game.player.pos[2]) < 30 && Math.random() < 0.5) npcs.say(pnj, gobPick(['Qui va là ?', 'Hé ! Toi, là !', 'Qu’est-ce que… ?']), 2.5);
    // près de la souche, la nuit : ils barreront le panneau
    const G = this.G();
    if (G && G.souche && Math.hypot(e.x - G.souche.x, e.z - G.souche.z) < 60) this.S().barre = this.nuitCle();
    this.fuir(e, pnj ? [pnj.x, pnj.z] : null);
    if (Math.random() < 0.35) { const pos = [e.x, e.y + 0.7, e.z]; sound.gobRire && sound.gobRire(pos, 0.8); }
    else if (Math.random() < 0.3) this.motVole(e);
  },
  // des mots volés, avec une voix volée
  motVole(e) {
    const pos = [e.x, e.y + 0.7, e.z];
    sound.gobVoix && sound.gobVoix(pos, 0.7);
    if (Math.hypot(e.x - game.player.pos[0], e.z - game.player.pos[2]) < 22) ui.subtitle('…', '« ' + gobPick(GOB_T.mots) + ' »', 2.6);
  },

  // ------------------------------------------------------------------ fuir hors de la vue
  fuir(e, de) {
    const g = e.gx, w = game.world, p = game.player, eye = p.eyePos();
    if (g.etat === 'tenu' || g.etat === 'mort') return;
    g.fuites++;
    if (g.etat === 'fouille' && g.raid && !g.raid.vole) { g.raid.etat = 'rate'; g.raid.e = e; }
    if (g.fuites > 3) { this.etat(e, 'rentrer'); return; }
    const ox = de ? de[0] : eye[0], oz = de ? de[1] : eye[2];
    // des points autour : on garde le mieux caché (derrière un mur, un tronc, une butte), loin de qui regarde
    let best = null, bs = -1e9;
    const away = Math.atan2(e.x - ox, e.z - oz);
    for (let k = 0; k < 18; k++) {
      const a = away + (k / 18 - 0.5) * Math.PI * 1.7 + gobRnd(-0.1, 0.1), dd = k % 3 === 0 ? 6 : k % 3 === 1 ? 10 : 15;
      const x = e.x + Math.sin(a) * dd, z = e.z + Math.cos(a) * dd;
      if (!w.inside(x, z, 5)) continue;
      const y = w.groundAt(x, z, e.y + 1.5, 1.5);
      if (y < w.waterLevel + 0.05 && w.heightAt(x, z) < w.waterLevel + 0.05) continue;
      let sc = Math.hypot(x - ox, z - oz) * 0.6 - dd * 0.15;
      const vis = this.ligneLibre(de ? [ox, (de[2] || e.y) + 1.6, oz] : eye, [x, y + 0.6, z]);
      if (!vis) sc += 20;
      if (!de) { const f = cameraBasis(p.yaw, p.pitch).f, vx = x - eye[0], vz = z - eye[2], vd = Math.hypot(vx, vz) || 1; sc += (1 - (vx * f[0] + vz * f[2]) / vd) * 6; }
      // (à travers un mur, c'est permis : il passera au travers)
      if (sc > bs) { bs = sc; best = { x, y, z, cache: !vis }; }
    }
    g.fuite = best || { x: e.x + Math.sin(away) * 12, y: e.y, z: e.z + Math.cos(away) * 12 };
    g.fuiteT = 0; g.horsVue = 0;
    this.etat(e, 'fuite');
    sound.gobPas && sound.gobPas([e.x, e.y + 0.2, e.z], 1);
  },
  etat(e, etat) {
    const g = e.gx;
    if (g.etat === 'mur' && etat !== 'mur') g.apresMur = null;
    g.etat = etat; g.t = 0; g.bloque = 0;
    if (etat === 'rentrer') { g.y0 = e.y; sound.gobTrappe && Math.random() < 0.3 && sound.gobTrappe([e.x, e.y, e.z], 0.25); puffAt(e.x, e.y + 0.1, e.z, [60, 48, 36], 7, 1.2, false); }
  },

  // ------------------------------------------------------------------ la conduite (pour chaque gobelin incarné, chaque image)
  ia(e, dt, w, c) {
    const g = e.gx;
    if (!g) return;
    e.hurtT = Math.max(0, (e.hurtT || 0) - dt);
    g.t += dt;
    if (e.dead) { e.move = 0; return; }
    if (e.scared) { e.scared = false; if (g.etat !== 'mur' && g.etat !== 'tenu' && g.etat !== 'rentrer' && g.etat !== 'assis') { if (g.village) this.alerte(e); else this.fuir(e, [e.scareX, e.scareZ]); } }
    const p = game.player, dP = Math.hypot(e.x - p.pos[0], e.z - p.pos[2]);
    const V = GOB_REGL.vitesse;
    switch (g.etat) {
      case 'sortir': { // il sort de terre
        g.mode = 'rode'; e.move = 0;
        if (g.t > 0.7) this.etat(e, g.ensuite || 'aller');
        return;
      }
      case 'rentrer': { // il s'enfonce dans la terre (ou dans la paroi, au village)
        e.move = 0; g.mode = 'cache';
        if (g.t > 1.0) { if (g.raid && g.raid.e === e && g.raid.etat !== 'rate') g.raid.etat = g.raid.vole ? 'fait' : 'rate'; this.oter(e); }
        return;
      }
      case 'tenu': {
        const eye = p.eyePos(), f = cameraBasis(p.yaw, 0).f;
        e.x = p.pos[0] + f[0] * 0.75; e.z = p.pos[2] + f[2] * 0.75; e.y = p.pos[1] + 0.35;
        e.heading = Math.atan2(p.pos[0] - e.x, p.pos[2] - e.z); e.move = 0; g.mode = 'tenu';
        if (ui.panel !== '#choice' && g.t > 0.3) this.relacher(e, 'echappe');
        return;
      }
      case 'mur': return this.iaMur(e, dt, w);
      case 'dort': { e.move = 0; g.mode = 'dort'; return; }
      case 'assis': { e.move = 0; g.mode = 'assis'; const ly = angDiff(e.heading, Math.atan2(p.pos[0] - e.x, p.pos[2] - e.z)); e.lookY = lerp(e.lookY || 0, dP < 14 ? clamp(ly, -1.1, 1.1) : Math.sin(c.t * 0.2) * 0.4, Math.min(1, dt * 1.5)); return; }
      case 'fuite': {
        g.mode = 'course';
        const F = g.fuite;
        g.fuiteT += dt;
        const vue = g.vue || dP < 3;
        g.horsVue = vue ? 0 : g.horsVue + dt;
        if (Math.hypot(F.x - e.x, F.z - e.z) < 0.7 || g.fuiteT > 6) {
          if (g.horsVue > 0.6 || g.fuiteT > 6) { this.etat(e, vue ? 'rentrer' : 'cache'); g.cacheT = gobRnd(1.2, 2.6); }
          else if (vue) this.fuir(e);
          e.move = 0; return;
        }
        this.pas(e, dt, w, V.course, F.x, F.z, true);
        return;
      }
      case 'cache': {
        g.mode = 'cache'; e.move = lerp(e.move, 0, Math.min(1, dt * 6));
        if (g.t > (g.cacheT || 2)) {
          // plus personne ne regarde : il s'en va (dans la terre), ou il reprend son chemin
          if (g.raid && !g.raid.vole && g.raid.etat !== 'rate' && dP > 30) this.etat(e, 'aller');
          else this.etat(e, 'rentrer');
        }
        return;
      }
      case 'guet': {
        g.mode = g.fouilleSol ? 'fouille' : 'guet'; e.move = lerp(e.move, 0, Math.min(1, dt * 6));
        e.lookY = g.fouilleSol ? 0 : Math.sin(g.t * 1.7 + e.seed) * 0.9;
        if (g.t > (g.guetT || 1.5)) this.etat(e, g.ensuite || 'aller');
        return;
      }
      case 'fouille': {
        g.mode = 'fouille'; e.move = 0;
        const C = g.cible;
        if (C) e.heading = turnToward(e.heading, Math.atan2((C.it ? C.it.x : C.x) - e.x, (C.it ? C.it.z : C.z) - e.z), dt * 4);
        g.sonT = (g.sonT || 0) - dt;
        if (g.sonT <= 0) { g.sonT = gobRnd(1.2, 2.2); sound.gobFouille && sound.gobFouille([e.x, e.y + 0.4, e.z], dP < 12 ? 1 : 0.5); }
        // le joueur entre dans la maison : il l'entend
        if (dP < 6 && !g.sait && Math.abs(p.pos[1] - e.y) < 3) { this.seSaitVu(e); return; }
        if (g.t > (g.fouilleT || 8)) {
          if (g.raid) { this.voler(g.raid); g.raid.etat = 'enCours'; }
          g.sac = true;
          this.etat(e, 'retour');
        }
        return;
      }
      case 'aller': case 'retour': case 'promene': {
        // un homme trop près (qui ne l'a pas vu) : il se tapit, ou il s'écarte
        const homme = this.hommeProche(e);
        if (homme && homme.d < GOB_REGL.homme && g.etat !== 'retour') {
          if (homme.d < 7) { this.fuir(e, [homme.x, homme.z]); return; }
          g.mode = 'cache'; e.move = lerp(e.move, 0, Math.min(1, dt * 6)); g.attenteT = (g.attenteT || 0) + dt;
          if (g.attenteT > 7) { g.attenteT = 0; this.fuir(e, [homme.x, homme.z]); }
          return;
        }
        g.attenteT = 0;
        let bx, bz, vit = V.marche;
        if (g.etat === 'aller' && g.cible) { bx = g.cible.x; bz = g.cible.z; vit = dP < 40 ? V.rode : V.marche; }
        else if (g.etat === 'retour' && g.ter) { bx = g.ter.x; bz = g.ter.z; }
        else if (g.etat === 'promene' && g.chemin && g.chemin.length) { bx = g.chemin[0][0]; bz = g.chemin[0][1]; vit = V.rode + 0.2; }
        else { this.etat(e, 'rentrer'); return; }
        const d = Math.hypot(bx - e.x, bz - e.z);
        if (d < 0.6) {
          if (g.etat === 'aller') { this.etat(e, 'fouille'); return; }
          if (g.etat === 'retour') { this.etat(e, 'rentrer'); return; }
          g.chemin.shift();
          if (!g.chemin.length) { this.etat(e, 'rentrer'); return; }
          if (Math.random() < 0.6) { g.ensuite = 'promene'; g.guetT = gobRnd(0.8, 2.2); this.etat(e, 'guet'); g.fouilleSol = Math.random() < 0.4; }
          return;
        }
        g.mode = vit <= V.rode + 0.3 ? 'rode' : 'marche';
        this.pas(e, dt, w, vit, bx, bz, false);
        return;
      }
      case 'menage': return this.iaMenage(e, dt, w, dP);
      case 'alerte': {
        g.mode = 'course';
        const M = g.mur;
        if (!M) { this.etat(e, 'rentrer'); return; }
        const d = Math.hypot(M.x - e.x, M.z - e.z);
        if (d < 1.3) { this.entrerMur(e, M.x + M.nx * 1.4, M.z + M.nz * 1.4, 'disparu'); return; }
        this.pas(e, dt, w, V.course, M.x, M.z, true);
        return;
      }
    }
  },
  // un homme proche (le joueur, un habitant éveillé)
  hommeProche(e) {
    const p = game.player;
    let best = { d: Math.hypot(e.x - p.pos[0], e.z - p.pos[2]), x: p.pos[0], z: p.pos[2] };
    if (Math.abs(p.pos[1] - e.y) > 4) best.d = 1e9;
    e.gx.hpT = (e.gx.hpT || 0) - 1;
    if (e.gx.hpT <= 0) {
      e.gx.hpT = 6;
      e.gx.pnjP = null;
      for (const n of npcs.list) {
        if (!n.st.alive || n.sleep || n.state === 'sleep' || n.vanished || n.state === 'gone' || n.state === 'dead') continue;
        const d = Math.hypot(n.x - e.x, n.z - e.z);
        if (d < 14 && Math.abs((n.y || 0) - e.y) < 3 && (!e.gx.pnjP || d < e.gx.pnjP.d)) e.gx.pnjP = { d, x: n.x, z: n.z };
      }
    }
    if (e.gx.pnjP && e.gx.pnjP.d < best.d) best = e.gx.pnjP;
    return best;
  },
  // ------------------------------------------------------------------ marcher (leur façon : droit au but ; un mur, ils passent au travers)
  pas(e, dt, w, vit, bx, bz, court) {
    const g = e.gx;
    const want = Math.atan2(bx - e.x, bz - e.z);
    e.heading = turnToward(e.heading, want, dt * (court ? 9 : 5));
    if (g.devie > 0) { g.devie -= dt; e.heading += g.devieS * dt * 2.2; }
    let nx = e.x + Math.sin(e.heading) * vit * dt, nz = e.z + Math.cos(e.heading) * vit * dt;
    // l'eau : jamais (l'eau qui court, surtout)
    const gh = w.heightAt(nx, nz), sol = w.groundAt(nx, nz, e.y + 0.55, 0.55);
    if (gh < w.waterLevel + 0.08 && sol < w.waterLevel + 0.05) { g.devie = 0.6; g.devieS = Math.random() < 0.5 ? -1 : 1; e.move = lerp(e.move, 0.3, dt * 4); return; }
    [nx, nz] = w.collideCircle(nx, nz, e.y, e.y + 0.95, 0.22, 0.5, true);
    const moved = Math.hypot(nx - e.x, nz - e.z);
    g.bloque = moved < vit * dt * 0.3 ? g.bloque + dt : Math.max(0, g.bloque - dt * 2);
    if (g.bloque > (court ? 0.25 : 0.45)) {
      g.bloque = 0;
      if (this.traverser(e, w, want)) return;
      g.devie = 0.7; g.devieS = Math.random() < 0.5 ? -1 : 1;
    }
    e.x = nx; e.z = nz;
    e.y = w.groundAt(nx, nz, e.y + 0.55, 0.55);
    e.move = lerp(e.move, 1, Math.min(1, dt * 6));
    e.phase += dt * vit * (court ? 3.2 : 4.2);
    // les pieds nus, de près
    g.pasT = (g.pasT || 0) - dt * vit;
    if (g.pasT <= 0) { g.pasT = court ? 5 : 3.5; const d = Math.hypot(e.x - game.player.pos[0], e.z - game.player.pos[2]); if (d < 16 && sound.gobPas) sound.gobPas([e.x, e.y + 0.1, e.z], clamp(1 - d / 16, 0.1, 1) * (court ? 1 : 0.5)); }
  },
  // bloqué : y a-t-il un mur devant, et de la place derrière ? alors il passe au travers
  traverser(e, w, cap) {
    const sx = Math.sin(cap), sz = Math.cos(cap);
    // (un mur, un meuble, une porte fermée : ce qui le bloque, il le traverse)
    const bh = w.raycastBlocks([e.x, e.y + 0.5, e.z], [sx, 0, sz], 1.6);
    const porte = !bh && w.doors.some((d) => d.a < 0.4 && Math.hypot(d.x - e.x, d.z - e.z) < 1.6);
    if (!bh && !porte) return false;
    const t0 = bh ? bh.t : 0.3;
    for (let d = t0 + 0.4; d < t0 + 4.2; d += 0.25) {
      const x = e.x + sx * d, z = e.z + sz * d;
      if (!w.inside(x, z, 3) || w.heightAt(x, z) < w.waterLevel + 0.05) return false;
      const y = w.groundAt(x, z, e.y + 1.0, 1.0);
      if (Math.abs(y - e.y) > 1.6) continue;
      if (gobLibre(w, x, z, y, 0.26)) { this.entrerMur(e, x + sx * 0.25, z + sz * 0.25); return true; }
    }
    return false;
  },
  entrerMur(e, x, z, ensuite) {
    const g = e.gx, w = game.world;
    g.apresMur = ensuite || g.etat;
    g.murDe = [e.x, e.y, e.z]; g.murA = [x, w.groundAt(x, z, e.y + 1.0, 1.0), z];
    if (ensuite === 'disparu') g.murA[1] = e.y;
    g.murL = Math.hypot(x - e.x, z - e.z);
    this.etat(e, 'mur');
    e.heading = Math.atan2(x - e.x, z - e.z);
    const pos = [e.x, e.y + 0.5, e.z];
    sound.gobMur && sound.gobMur(pos, 1);
    puffAt(e.x + Math.sin(e.heading) * 0.4, e.y + 0.5, e.z + Math.cos(e.heading) * 0.4, [28, 24, 22], 9, 0.9, false);
    const p = game.player, d = Math.hypot(e.x - p.pos[0], e.z - p.pos[2]);
    if (d < 9 && this.dansLaVue(e.x, e.y + 0.5, e.z, 1)) { const S = this.S(); if (!S.vuMur) { S.vuMur = farm.s.day; setTimeout(() => { if (!game.dying) penser.une('gob_mur', GOB_T.penses.mur, 3.5); }, 1600); } }
  },
  iaMur(e, dt, w) {
    const g = e.gx, V = GOB_REGL.vitesse;
    g.mode = 'mur';
    const L = Math.max(0.01, g.murL), k = clamp(g.t * V.mur / L, 0, 1);
    e.x = lerp(g.murDe[0], g.murA[0], k); e.z = lerp(g.murDe[2], g.murA[2], k);
    e.y = lerp(g.murDe[1], g.murA[1], k);
    e.move = 0.4; e.phase += dt * 2;
    if (g.t > 0.4 && !g.suie) { g.suie = true; }
    if (k >= 1) {
      g.suie = false;
      if (g.apresMur !== 'disparu') puffAt(e.x - Math.sin(e.heading) * 0.3, e.y + 0.5, e.z - Math.cos(e.heading) * 0.3, [28, 24, 22], 7, 0.8, false);
      const ens = g.apresMur || 'aller';
      if (ens === 'disparu') { this.oter(e); return; }
      g.etat = ens; g.t = 0; g.bloque = 0;
    }
  },

  // ------------------------------------------------------------------ ceux qu'on croise (ils se baladent)
  majRodeurs(dt) {
    const S = this.S(), p = game.player, w = game.world;
    this.rodT -= dt;
    if (this.rodT > 0) return;
    this.rodT = GOB_REGL.rodeurs.periode * gobRnd(0.7, 1.3);
    if (!this.monde() || this.partis() || p.underground || game.sleeping || game.dying || (typeof cine !== 'undefined' && cine.on)) return;
    if (this.E.some((e) => e.gx && e.gx.rodeur && !e.removed)) return;
    if (w.covered(p.pos[0], p.pos[1] + 1, p.pos[2])) return;
    const h = this.heure(), R = GOB_REGL.rodeurs;
    const bi = typeof game.biomeAt === 'function' ? game.biomeAt(p.pos) : 'plaine', bois = bi === 'foret' || bi === 'bouleaux';
    let k = this.dehorsNuit() ? R.nuit : (h >= 19 || h < 6.5) ? (bois ? R.brune : R.brune * 0.3) : (bois ? R.jour : 0);
    if (!k) return;
    const vT = w.townInfo || { x: 1572, z: 1600 };
    if (Math.abs(p.pos[0] - vT.x) < 48 && Math.abs(p.pos[2] - vT.z) < 48) k *= 0.35;
    const ter = this.terrierProche(p.pos[0], p.pos[2]);
    if (ter && ter.d < 90) k *= 1.8;
    if (S.rancune > 0) k *= 1.3;
    if (game.lantern && farm.count('lanterne')) k *= 0.7;
    if (Math.random() > k) return;
    this.rodeur();
  },
  rodeur(force) {
    const p = game.player, w = game.world, f = cameraBasis(p.yaw, 0).f, base = Math.atan2(f[0], f[2]);
    const vivants = this.vivants().filter((i) => !this.E.some((e) => e.gid === i && !e.removed));
    if (!vivants.length) return null;
    for (let essai = 0; essai < 20; essai++) {
      const a = base + (Math.random() < 0.5 ? 1 : -1) * gobRnd(0.95, 2.6), d = force ? gobRnd(26, 34) : gobRnd(34, 55);
      const x = p.pos[0] + Math.sin(a) * d, z = p.pos[2] + Math.cos(a) * d;
      if (!w.inside(x, z, 20) || w.heightAt(x, z) < w.waterLevel + 0.3) continue;
      const y = w.groundAt(x, z, w.heightAt(x, z) + 0.6, 0.6);
      if (w.covered(x, y + 0.5, z) || !gobLibre(w, x, z, y, 0.3)) continue;
      if (!force && this.dansLaVue(x, y + 0.6, z, 1.05) && d < this.portee({ x, y, z })) continue;
      // un chemin : le long, en travers du regard du joueur ; ou vers un terrier tout proche
      const ter = this.terrierProche(x, z), chemin = [];
      const ta = a + (Math.random() < 0.5 ? 1 : -1) * gobRnd(1.2, 1.9);
      for (let i = 1; i <= 3; i++) { const cx = x + Math.sin(ta) * 14 * i + gobRnd(-4, 4), cz = z + Math.cos(ta) * 14 * i + gobRnd(-4, 4); if (w.inside(cx, cz, 20) && w.heightAt(cx, cz) > w.waterLevel + 0.3) chemin.push([cx, cz]); }
      if (ter && ter.d < 70) chemin.push([ter.t.x, ter.t.z]);
      if (!chemin.length) continue;
      const e = this.creer(gobPick(vivants), x, y, z, 'sortir', { rodeur: true, chemin, ensuite: 'promene' });
      e.heading = Math.atan2(chemin[0][0] - x, chemin[0][1] - z);
      return e;
    }
    return null;
  },

  // ------------------------------------------------------------------ le village
  entrerVillage() {
    const S = this.S(), G = this.G(), V = G.village, s = farm.s;
    for (const e of this.E.slice()) if (!e.gx || !e.gx.village) this.oter(e);
    if (!S.connu.village) { S.connu.village = s.day; setTimeout(() => { if (!game.dying) penser.une('gob_chambre', GOB_T.penses.chambre, 3.5); }, 1800); }
    this.majEtal(); this.majTas(); this.majLumieres();
    if (this.partis()) return;
    const h = this.heure(), nuit = this.dehorsNuit();
    // la vieille, sur son siège
    if (!(S.aieule > 0)) this.aieule();
    // une alerte récente : ils sont dans les parois
    if (S.alerte && s.hours - S.alerte < 3) return;
    const dehors = new Set(S.nuit.n === this.nuitCle() ? S.nuit.raids.filter((R) => R.etat !== 'fait' && R.etat !== 'rate' && this.T() >= R.hd && this.T() < R.hr).map((R) => R.g) : []);
    const ici = this.vivants().filter((i) => !dehors.has(i));
    if (!nuit) {
      ici.forEach((gid, k) => { const N = V.nids[k % V.nids.length]; const e = this.creer(gid, N.x, N.y + 0.12, N.z, 'dort', { village: true }); e.heading = N.r + 1.2; });
    } else {
      const eveilles = ici.slice(0, 2 + ((Math.random() * 2) | 0));
      eveilles.forEach((gid) => { const L = gobPick(V.lieux); const e = this.creer(gid, L.x, V.y, L.z, 'menage', { village: true }); });
      ici.slice(eveilles.length).forEach((gid, k) => { const N = V.nids[k % V.nids.length]; this.creer(gid, N.x, N.y + 0.12, N.z, 'dort', { village: true }).heading = N.r + 1.2; });
    }
  },
  quitterVillage() {
    for (const e of this.E.slice()) if (e.gx && e.gx.village) this.oter(e);
  },
  aieule() {
    const G = this.G(), V = G.village, Sg = V.siege;
    if (this.aieuleE && !this.aieuleE.removed) return this.aieuleE;
    const w = game.world, e = entities.add(w, 'gob_aieule', Sg.x, Sg.z, { v: 0 });
    e.gob = true; e.gid = -1; e.aieule = true; e.y = Sg.y - 0.27; e.heading = Sg.r; e.hp = 40; e.move = 0; e.lookY = 0;
    e.gx = { etat: 'assis', mode: 'assis', village: true, vu: 0, t: 0, sait: false };
    this.E.push(e); this.aieuleE = e;
    return e;
  },
  iaMenage(e, dt, w, dP) {
    const g = e.gx, V = this.G().village;
    if (!g.but || Math.hypot(g.but.x - e.x, g.but.z - e.z) < 0.6) {
      if (g.but) { g.etat = 'guet'; g.t = 0; g.guetT = gobRnd(2, 6); g.ensuite = 'menage'; g.but = null; return; }
      g.but = gobPick(V.lieux);
    }
    g.mode = 'marche';
    this.pas(e, dt, w, GOB_REGL.vitesse.rode, g.but.x, g.but.z, false);
  },
  majVillage(dt) {
    const S = this.S(), p = game.player, G = this.G(), V = G.village;
    if (this.partis()) return;
    // les dormeurs : un bruit, de près, peut en réveiller un
    const bruit = (p.sprinting ? 0.45 : p.crouch > 0.5 ? 0.012 : 0.05) * (game.lantern && farm.count('lanterne') ? 1.8 : 1);
    const mv = Math.hypot(p.vel[0], p.vel[2]) > 0.5;
    for (const e of this.E) {
      const g = e.gx;
      if (!g || g.etat !== 'dort' || e.dead) continue;
      const d = Math.hypot(e.x - p.pos[0], e.z - p.pos[2]);
      if (d < 4.5 && mv && Math.random() < bruit * dt * (4.5 - d)) this.reveiller(e);
    }
    // les murmures dans les parois, après l'alerte
    if (S.alerte && farm.s.hours - S.alerte < 3) {
      this.chuchoT -= dt;
      if (this.chuchoT <= 0) { this.chuchoT = gobRnd(14, 30); const M = gobPick(V.murs); sound.ici ? sound.ici([M.x, V.y + 1, M.z], () => sound.whisper(0, 0.5)) : sound.whisper(0, 0.4); }
    }
  },
  reveiller(e) {
    const g = e.gx;
    g.etat = 'guet'; g.t = 0; g.guetT = 1.0; g.ensuite = 'menage'; g.sait = false; g.vu = 0;
    sound.gobRire && sound.gobRire([e.x, e.y + 0.4, e.z], 0.4);
  },
  // l'alerte : un cri, et ils entrent tous dans les parois
  alerte(e) {
    const S = this.S(), G = this.G(), V = G.village, s = farm.s;
    if (S.alerte && s.hours - S.alerte < 0.2) return;
    S.alerte = s.hours;
    S.rancune = Math.min(GOB_REGL.rancuneMax, S.rancune + 0.5);
    if (e) sound.gobCri && sound.gobCri([e.x, e.y + 0.7, e.z], 1);
    for (const q of this.E) {
      const g = q.gx;
      if (!g || !g.village || q.aieule || q.dead || g.etat === 'mur' || g.etat === 'tenu') continue;
      let best = null, bd = 1e9;
      for (const M of V.murs) { const d = Math.hypot(M.x - q.x, M.z - q.z); if (d < bd) { bd = d; best = M; } }
      g.mur = best; g.etat = 'alerte'; g.t = 0;
    }
    setTimeout(() => { if (!game.dying && this.dans) penser.une('gob_alarme', GOB_T.penses.alarme, 4); }, 4500);
  },

  // ------------------------------------------------------------------ attraper
  attrapable(e) {
    const g = e.gx;
    if (!g || e.dead || e.aieule) return false;
    if (g.etat === 'fouille' || g.etat === 'dort' || g.etat === 'mur' || g.etat === 'cache' || g.etat === 'guet') return true;
    return !g.sait;
  },
  attraper(e) {
    const g = e.gx;
    if (!this.attrapable(e)) { sound.gobRire && sound.gobRire([e.x, e.y + 0.6, e.z], 1); ui.subtitle('', GOB_T.dit.echappe, 2.5); this.fuir(e); return; }
    g.etat = 'tenu'; g.t = 0; g.vu = 0;
    if (g.raid && g.raid.e === e && !g.raid.vole) g.raid.etat = 'rate';
    this.tenu = e;
    sound.gobCri && sound.gobCri([e.x, e.y + 0.7, e.z], 0.6);
    const porte = g.sac && g.raid;
    const opts = [{ label: 'Le laisser filer', fn: () => this.relacher(e, 'lacher') }];
    opts.push({ label: 'Lui faire lâcher ce qu’il a pris', fn: () => this.relacher(e, 'rendre') });
    opts.push({ label: 'Lui serrer le cou', fn: () => this.relacher(e, 'tuer') });
    ui.choice(GOB_T.dit.tenuTitre, GOB_T.dit.tenuDesc, opts);
    g.porte = !!porte;
  },
  relacher(e, comment) {
    const g = e.gx, S = this.S();
    if (!g || g.etat !== 'tenu') return;
    if (ui.panel === '#choice') ui.close();
    this.tenu = null;
    const p = game.player;
    e.y = game.world.groundAt(e.x, e.z, p.pos[1] + 0.6, 0.8);
    if (comment === 'tuer') { ui.subtitle('', GOB_T.dit.tuerMains, 4); this.mourir(e, 'mains'); return; }
    if (comment === 'rendre') {
      const R = g.raid;
      if (R && R.vole && R.it !== 'ferme') this.lacherButin(e, R);
      else if (R && R.vole && R.it === 'ferme') this.lacherButin(e, R);
      ui.subtitle('', R && R.vole ? GOB_T.dit.rendre : GOB_T.dit.rendreRien, 4);
      play.hurt(4, null, 'Mordu par un gobelin');
      S.rancune = Math.min(GOB_REGL.rancuneMax, S.rancune + 0.5);
    } else if (comment === 'lacher') {
      ui.subtitle('', GOB_T.dit.lacher, 3);
      S.lacheBonte = farm.s.day;
      S.rancune = Math.max(0, S.rancune - 1);
    } else ui.subtitle('', GOB_T.dit.echappe, 2.5);
    g.sait = true;
    this.etat(e, 'rentrer');
    sound.gobPas && sound.gobPas([e.x, e.y, e.z], 1);
  },
  // ce qu'il portait tombe par terre : on le ramasse (et on peut le rendre)
  lacherButin(e, R) {
    const S = this.S(), s = farm.s;
    const L = S.prises.filter((P) => P.bld === R.bld && P.j === S.nuit.n);
    for (const P of L.slice(0, 3)) {
      S.lache.push({ x: e.x + gobRnd(-0.3, 0.3), y: e.y, z: e.z + gobRnd(-0.3, 0.3), k: P.k, n: P.n, de: P.de, j: s.day });
      S.prises.splice(S.prises.indexOf(P), 1);
    }
    while (S.lache.length > 12) S.lache.shift();
    this.majEtal();
  },

  // ------------------------------------------------------------------ blesser, tuer
  blesser(e, dmg, eye) {
    if (!e || e.dead) return false;
    e.hp -= dmg; e.hurtT = 0.3;
    sound.gobCri && sound.gobCri([e.x, e.y + 0.7, e.z], 0.9);
    if (e.hp <= 0) { this.mourir(e, 'arme'); return true; }
    if (e.aieule) { this.alerte(null); return false; }
    if (e.gx && e.gx.village) this.alerte(e);
    else this.fuir(e, eye ? [eye[0], eye[2]] : null);
    return false;
  },
  mourir(e, comment) {
    const S = this.S(), s = farm.s;
    e.dead = true; e.corpse = true; e.hidden = false; e.move = 0;
    if (e.gx) { e.gx.etat = 'mort'; e.gx.mode = 'mort'; if (e.gx.raid && e.gx.raid.e === e) { e.gx.raid.etat = 'rate'; } }
    if (this.tenu === e) this.tenu = null;
    if (e.aieule) {
      S.aieule = s.day;
      S.partis = s.day + 1;
      ui.subtitle('', GOB_T.aieule.morte, 5);
      this.majLumieres();
      this.alerte(null);
      if (typeof malediction !== 'undefined' && malediction.frapper) { try { malediction.frapper('malchance', 'gob_aieule'); } catch (err) { console.error(err); } }
      if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-6, 'la vieille des gobelins, tuée', 10);
      S.corps.push({ x: e.x, y: e.y, z: e.z, j: s.day, aieule: true, couronne: true });
      return;
    }
    if (e.gid >= 0 && !S.morts.includes(e.gid)) S.morts.push(e.gid);
    S.tues++;
    S.rancune = Math.min(GOB_REGL.rancuneMax, S.rancune + 3);
    if (S.pacte > 0 && !S.pacteRompu) S.pacteRompu = s.day;
    if (comment === 'arme') setTimeout(() => { if (!game.dying) ui.subtitle('', GOB_T.dit.tuerArme, 4.5); }, 600);
    if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-2, 'un gobelin tué', 4);
    S.corps.push({ x: e.x, y: e.y, z: e.z, j: s.day, dent: true });
    if (S.tues >= GOB_REGL.partir && !S.partis) S.partis = s.day + 1;
    if (e.gx && e.gx.village) this.alerte(null);
    entities.scare(e.x, e.z, 25);
    // le corps reste là jusqu'à ce qu'on s'éloigne ; au matin, des chiffons
    setTimeout(() => { if (!e.removed) this.oter(e); }, 60000);
  },

  // ------------------------------------------------------------------ le village : les tas, l'étal, la vieille
  majTas() {
    const S = this.S(), G = this.G();
    if (!S || !G || !G.village) return;
    for (const T of G.village.tas) { const n = S.tas[T.i] | 0; if (!T.q.data || (T.q.data.n | 0) !== n) { T.q.data = Object.assign({}, T.q.data || {}, { n }); farm.dirtyProps = true; } }
    const gq = G.village.grand.q, gn = S.grand | 0;
    if (!gq.data || (gq.data.n | 0) !== gn) { gq.data = Object.assign({}, gq.data || {}, { n: gn }); farm.dirtyProps = true; }
  },
  majEtal() {
    const S = this.S(), G = this.G();
    if (!S || !G || !G.village) return;
    const q = G.village.etal.q, items = [];
    for (const P of S.prises) { const it = ITEMS[P.k]; const c = P.k === 'argent' ? '#d8b048' : it && Array.isArray(it.ic) && typeof it.ic[1] === 'string' ? it.ic[1] : '#c8c8d2'; for (let i = 0; i < Math.min(3, P.n); i++) items.push(c); }
    const k = items.slice(0, 30).join(',');
    if (q.dataKey !== k) { q.dataKey = k; q.data = Object.assign({}, q.data || {}, { items: items.slice(0, 30) }); farm.dirtyProps = true; }
  },
  majLumieres() {
    const S = this.S(), G = this.G();
    if (!S || !G || !G.village) return;
    const eteint = S.aieule > 0 || this.partis();
    let ch = false;
    for (const q of G.village.chandelles.concat([G.village.marmite])) { const v = eteint ? false : undefined; if ((q.data && q.data.lit) !== v) { q.data = Object.assign({}, q.data || {}, { lit: v }); ch = true; } }
    if (ch) { game.world.collectLights(); farm.dirtyProps = true; }
    // la trappe, le panneau du raccourci, la racine
    const tr = G.trappe && G.trappe.q;
    if (tr) { const cachee = !S.connu.racine; if (!!(tr.data && tr.data.cachee) !== cachee) { tr.data = Object.assign({}, tr.data || {}, { cachee }); farm.dirtyProps = true; } }
    const pq = G.village.panneau.q;
    if (pq) { const ouv = !!S.connu.raccourci; if (!!(pq.data && pq.data.ouvert) !== ouv) { pq.data = Object.assign({}, pq.data || {}, { ouvert: ouv }); farm.dirtyProps = true; } }
    const rq = G.racine && G.racine.q;
    if (rq) { const t2 = !!S.connu.racine; if (!!(rq.data && rq.data.tiree) !== t2) { rq.data = Object.assign({}, rq.data || {}, { tiree: t2 }); farm.dirtyProps = true; } }
  },
  poignee(i) {
    const S = this.S(), G = this.G(), V = G && G.village, s = farm.s;
    if (!V) return;
    const grand = i === 'grand';
    const n = grand ? S.grand | 0 : S.tas[i] | 0;
    if (n >= GOB_REGL.poignees) { ui.subtitle('', GOB_T.dit.tasVide, 2.5); return; }
    const pos = grand ? [V.grand.x, V.y + 1.2, V.grand.z] : (() => { const T = V.tas.find((q) => q.i === i); return [T.x, V.y + 0.5, T.z]; })();
    const lots = rollLoot(grand ? 'gob_grand_tas' : 'gob_tas');
    let pieces = 0, val = 0;
    const bits = [];
    for (const [k, m] of lots) {
      if (k === 'argent') { pieces += m; continue; }
      if (!ITEMS[k]) continue;
      farm.give(k, m); play.flyer && play.flyer(k, pos, m);
      val += (ITEMS[k].price || 0) * m;
      bits.push(m > 1 ? `${itemName(k).toLowerCase()} (${m})` : itemName(k).toLowerCase());
    }
    if (pieces) { farm.earn(pieces); val += pieces; sound.coin && sound.coin(); bits.unshift(pieces > 1 ? `${pieces} pièces` : 'une pièce'); }
    if (grand) S.grand = n + 1; else S.tas[i] = n + 1;
    S.pris++; S.prisVal += val;
    S.rancune = Math.min(GOB_REGL.rancuneMax, S.rancune + (grand ? 2 : 1));
    if (S.pacte > 0 && !S.pacteRompu) S.pacteRompu = s.day;
    this.majTas();
    sound.gobFouille && sound.gobFouille(pos, 1.2);
    ui.subtitle('', bits.length ? `(Vous prenez : ${bits.join(', ')}.)` : '(Rien que de la poussière.)', 3.5);
    // le bruit : les dormeurs, les éveillés, la vieille
    for (const e of this.E) {
      const g = e.gx;
      if (!g || e.dead) continue;
      const d = Math.hypot(e.x - pos[0], e.z - pos[2]);
      if (g.etat === 'dort' && d < 9 && Math.random() < 0.28) this.reveiller(e);
      else if (g.etat === 'menage' || g.etat === 'guet') { if (d < 14) this.seSaitVu(e); }
    }
    const A = this.aieuleE;
    if (A && !A.dead && Math.hypot(A.x - pos[0], A.z - pos[2]) < 12) setTimeout(() => { if (!game.dying && this.dans) { sound.gobVoix && sound.gobVoix([A.x, A.y + 1, A.z], 0.8); ui.subtitle(GOB_T.aieule.titre, GOB_T.aieule.salutPris, 3.5); } }, 900);
  },
  parlerAieule() {
    const S = this.S(), e = this.aieuleE;
    if (!e || e.dead) return;
    sound.gobVoix && sound.gobVoix([e.x, e.y + 1, e.z], 0.9);
    const tue = S.tues > 0, pris = S.pris > 0 || S.prises.length === 0 && S.rendre.length > 0;
    let salut = GOB_T.aieule.salut;
    if (tue) salut = GOB_T.aieule.salutTue;
    else if (S.pacteRompu) salut = GOB_T.aieule.salutPris;
    else if (S.pacte > 0) salut = GOB_T.aieule.salutPacte;
    else if (S.pris > 0) salut = GOB_T.aieule.salutPris;
    const T = GOB_T.aieule;
    const opts = [{ label: T.optPourquoi, fn: () => { ui.choice(T.titre, T.pourquoi, [{ label: T.optPartir, fn: () => ui.close() }]); } }];
    if (!(S.pacte > 0) && !tue) opts.push({ label: T.optPacte, fn: () => {
      if (S.pris > 0) { ui.choice(T.titre, T.pacteRefus, [{ label: T.optPartir, fn: () => ui.close() }]); return; }
      S.pacte = farm.s.day; S.rancune = 0;
      ui.choice(T.titre, T.pacte, [{ label: T.optPartir, fn: () => ui.close() }]);
    } });
    const aRendre = this.objetsDuTas();
    if (aRendre.length) opts.push({ label: T.optRendre, fn: () => {
      let n = 0;
      for (const [k, m] of aRendre) { const c = Math.min(m, farm.count(k)); if (c > 0 && farm.take(k, c)) n += c; }
      S.rancune = Math.max(0, S.rancune - n * 0.8);
      if (n >= 3 && S.pacteRompu && !tue) { S.pacteRompu = 0; }
      ui.choice(T.titre, T.rendu, [{ label: T.optPartir, fn: () => ui.close() }]);
    } });
    opts.push({ label: T.optPartir, fn: () => ui.close() });
    ui.choice(T.titre, T.desc + '\n\n' + salut, opts);
  },
  // ce que le joueur porte et qui vient des tas (les curiosités des gobelins)
  objetsDuTas() {
    const out = [];
    for (const k of ['gob_alliance', 'gob_hochet', 'gob_trousseau', 'gob_bonnet', 'gob_couronne']) if (farm.count(k)) out.push([k, farm.count(k)]);
    return out;
  },
  reprendre(cles) {
    const S = this.S(), s = farm.s, got = [];
    for (const P of S.prises.slice()) {
      const cle = (P.bld || '') + '|' + (P.de || '');
      if (cles && !cles.includes(cle)) continue;
      if (P.k === 'argent') farm.earn(P.n); else farm.give(P.k, P.n);
      if (P.de && P.k !== 'argent') S.rendre.push({ k: P.k, n: P.n, de: P.de, j: s.day });
      got.push(P);
      S.prises.splice(S.prises.indexOf(P), 1);
    }
    if (got.length) {
      S.rancune = Math.min(GOB_REGL.rancuneMax, S.rancune + 0.5 * new Set(got.map((P) => P.bld)).size);
      if (S.pacte > 0 && !S.pacteRompu) S.pacteRompu = s.day;
      sound.coin && sound.coin();
    }
    while (S.rendre.length > 40) S.rendre.shift();
    this.majEtal();
    return got;
  },

  // ------------------------------------------------------------------ chaque matin
  jour() {
    const S = this.S(), s = farm.s;
    if (!S) return;
    // (une nuit dormie d'un trait, ou passée ailleurs : elle a eu lieu quand même)
    if (S.nuit.n !== this.nuitCle() && game.world === farm.w) this.planifier();
    this.finirNuit();
    const msgs = [];
    if (S.volFerme && S.volFerme === s.day) msgs.push(gobPick(GOB_T.dit.volFerme));
    else if (S.rancune >= 4 && Math.random() < 0.5 && !this.partis()) msgs.push(gobPick(GOB_T.dit.vengeance));
    // un présent sur le seuil (marché tenu, ou un gobelin qu'on a laissé filer)
    const bon = (S.pacte > 0 && !S.pacteRompu) || (S.lacheBonte && s.day - S.lacheBonte <= 3);
    if (bon && s.day - (S.cadeau || -99) >= 5 && !this.partis()) {
      const B = game.world.bld.ferme;
      if (B && B.door >= 0) {
        const d = game.world.doors[B.door], k = gobPick(['de_coudre', 'bille', 'boutons_nacre', 'ruban', 'image_pieuse', 'vieille_piece', 'cuillere_argent']);
        if (d && ITEMS[k]) { S.cadeau = s.day; S.lacheBonte = 0; S.lache.push({ x: d.x - Math.sin(d.r) * 0.8, y: game.world.heightAt(d.x - Math.sin(d.r) * 0.8, d.z - Math.cos(d.r) * 0.8), z: d.z - Math.cos(d.r) * 0.8, k, n: 1, de: null, j: s.day, cadeau: true }); }
      }
    }
    // l'offrande de la veille a été prise
    if (S.offrande && S.offrande.j < s.day && !S.offrande.prise) { S.offrande.prise = s.day; S.rancune = Math.max(0, S.rancune - 1.5); }
    // la rancune s'use ; les corps deviennent des chiffons ; les vieilles plaintes s'oublient
    if (!(S.volFerme === s.day)) S.rancune = Math.max(0, S.rancune - 0.34);
    for (const C of S.corps) if (C.j < s.day) C.chiffons = true;
    while (S.corps.length > 10) S.corps.shift();
    for (const k in S.plaintes) if (s.day - S.plaintes[k] > 4) delete S.plaintes[k];
    S.meubles = S.meubles.filter((m) => s.day - m.j <= 5);
    S.lache = S.lache.filter((L) => s.day - L.j <= 6);
    if (S.partis && S.partis === s.day && !S.partisDit) { S.partisDit = 1; msgs.push(GOB_T.dit.partis); }
    msgs.forEach((t, i) => setTimeout(() => { if (!game.dying) ui.subtitle('', t, 5); }, 2600 + i * 5500));
    this.majLumieres();
  },

  // ------------------------------------------------------------------ E : ce qu'on vise
  cibles(eye, f, cand) {
    const S = this.S(), w = game.world;
    if (!S) return;
    const vise = (x, y, z, R, cos0) => {
      const dx = x - eye[0], dy = y - eye[1], dz = z - eye[2], d = Math.hypot(dx, dy, dz);
      if (d > R) return null;
      const cos = (dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1);
      if (cos < (d < 1.2 ? 0.5 : cos0)) return null;
      const bh = w.raycastBlocks(eye, [dx / d, dy / d, dz / d], Math.max(0, d - 0.45));
      if (bh && !bh.block.hidden) return null;
      return { d, cos };
    };
    for (const e of this.E) {
      if (e.removed || e.hidden) continue;
      const g = e.gx;
      if (!g) continue;
      if (e.aieule) { if (e.dead) continue; const v = vise(e.x, e.y + 1.0, e.z, 4.2, 0.8); if (v) cand({ kind: 'hook', gobE: e, use: () => this.parlerAieule(), f2lab: GOB_T.lab.aieule }, v.d * 0.5); continue; }
      if (e.dead) { const v = vise(e.x, e.y + 0.2, e.z, 2.4, 0.75); if (v) cand({ kind: 'hook', gobE: e, use: () => this.corps(e), f2lab: GOB_T.lab.corps }, v.d * 0.6); continue; }
      if (g.etat === 'rentrer' || g.etat === 'tenu') continue;
      const v = vise(e.x, e.y + 0.5, e.z, 2.3, 0.8);
      if (v) cand({ kind: 'hook', gobE: e, use: () => this.attraper(e), f2lab: GOB_T.lab.attraper }, v.d * 0.4);
    }
    // des chiffons, ce qui est tombé, la marque griffée sur un meuble
    for (const C of S.corps) { if (!C.chiffons && !C.aieule) continue; if (C.pris) continue; const v = vise(C.x, C.y + 0.1, C.z, 2.4, 0.75); if (v) cand({ kind: 'hook', use: () => this.chiffons(C), f2lab: C.couronne ? GOB_T.lab.corps : GOB_T.lab.chiffons }, v.d * 0.7); }
    for (const L of S.lache) { const v = vise(L.x, L.y + 0.1, L.z, 2.4, 0.75); if (v) cand({ kind: 'hook', use: () => this.ramasser(L), f2lab: GOB_T.lab.lache + ' : ' + (L.k === 'argent' ? 'des pièces' : itemName(L.k).toLowerCase()) }, v.d * 0.7); }
    for (const m of S.meubles) {
      const M = this.marqueMeuble(m);
      if (!M) continue;
      const v = vise(M.x, M.y, M.z, 2.2, 0.85);
      if (v) cand({ kind: 'hook', use: () => { ui.read(GOB_T.lab.marque, GOB_T.dit.marqueMeuble); this.signe(); }, f2lab: 'Une marque' }, v.d * 0.9);
    }
  },
  corps(e) {
    if (e.aieule) return;
    const S = this.S();
    if (!e.gx.dentPrise) { e.gx.dentPrise = true; farm.give('gob_dent', 1); play.flyer && play.flyer('gob_dent', [e.x, e.y + 0.3, e.z], 1); ui.subtitle('', '(Une dent pend, à moitié arrachée. Elle vient toute seule.)', 3.5); const C = S.corps.find((c) => Math.hypot(c.x - e.x, c.z - e.z) < 1.5); if (C) C.dent = false; return; }
    ui.subtitle('', '(Il est léger. Il sent le suif et la cave.)', 3);
  },
  chiffons(C) {
    C.pris = true;
    if (C.couronne) { farm.give('gob_couronne', 1); play.flyer && play.flyer('gob_couronne', [C.x, C.y + 0.3, C.z], 1); ui.subtitle('', '(Il ne reste d’elle que des chiffons, et la couronne.)', 4); return; }
    farm.give('gob_chiffons', 1 + ((Math.random() * 2) | 0)); play.flyer && play.flyer('gob_chiffons', [C.x, C.y + 0.2, C.z], 1);
    if (C.dent) farm.give('gob_dent', 1);
    ui.subtitle('', GOB_T.dit.chiffons, 4);
  },
  ramasser(L) {
    const S = this.S();
    if (L.k === 'argent') farm.earn(L.n); else farm.give(L.k, L.n);
    play.flyer && play.flyer(L.k === 'argent' ? 'vieille_piece' : L.k, [L.x, L.y + 0.2, L.z], L.n);
    if (L.de && L.k !== 'argent') S.rendre.push({ k: L.k, n: L.n, de: L.de, j: farm.s.day });
    S.lache.splice(S.lache.indexOf(L), 1);
    sound.pop && sound.pop();
  },
  // la marque griffée sur le meuble vidé (devant, à hauteur de genou)
  marqueMeuble(m) {
    if (!(typeof fouilles !== 'undefined' && fouilles.props)) return null;
    const q = fouilles.props.get(m.it), it = fouilles.par && fouilles.par.get(m.it);
    if (!q && !it) return null;
    if (q) {
      const c = PROP_COLL[q.id], hz = c ? c[1] * (q.s || 1) : 0.25, s = q.s || 1;
      return { x: q.x + Math.sin(q.r || 0) * (hz + 0.012), y: q.y + 0.42 * s, z: q.z + Math.cos(q.r || 0) * (hz + 0.012), r: q.r || 0 };
    }
    return { x: it.x, y: it.y - 0.5, z: it.z, r: 0 };
  },
  signe() { const S = this.S(); if (!S.connu.signe) { S.connu.signe = farm.s.day; setTimeout(() => { if (!game.dying) penser.une('gob_signe', GOB_T.penses.marque, 3); }, 900); } },

  // ------------------------------------------------------------------ dessiner (chaque image)
  dessiner(buf, sbuf, cam, maxD, t, flags) {
    const m2 = maxD * maxD, w = game.world, nuit = (game.sky && game.sky.night) || 0, S = this.S();
    for (const e of this.E) {
      if (e.removed || e.hidden || !e.rig) continue;
      const dx = e.x - cam[0], dz = e.z - cam[2];
      if (dx * dx + dz * dz > m2) continue;
      const g = e.gx || {}, r = e.rig;
      gobPose(r, { move: e.move, phase: e.phase, t, mode: e.dead ? 'mort' : g.mode || 'marche', lookY: e.lookY || 0, seed: e.seed, nuit: this.dans ? 1 : nuit, sac: !!g.sac });
      let fl = (e.hurtT > 0 || e.highlight ? FX_HI : 0) | (flags || 0);
      const M = this._M || (this._M = new Float32Array(12));
      let y = e.y, sx = 1, sy = 1, sz = 1;
      if (g.etat === 'sortir') y -= (1 - clamp(g.t / 0.7, 0, 1)) * 1.0;
      if (g.etat === 'rentrer') y -= clamp(g.t / 1.0, 0, 1) * 1.1;
      if (g.etat === 'mur') { // il s'étire, il tremble
        const k = Math.sin(clamp(g.t * GOB_REGL.vitesse.mur / Math.max(0.01, g.murL), 0, 1) * Math.PI);
        sy = 1 + 0.32 * k + Math.sin(t * 31) * 0.04 * k; sx = 1 - 0.4 * k; sz = 1 + 0.25 * k;
        if (Math.sin(t * 23 + e.seed) > 0.6) fl |= FX_HI;
      }
      if (e.dead || g.etat === 'dort') {
        m34Root(_root, e.x, y + 0.12, e.z, e.heading, e.aieule ? 1.15 : 1);
        m34TR(_mT, 0, 0, -0.4, Math.PI / 2, 0, e.dead ? 0.3 : 1.35);
        m34Mul(M, _root, _mT);
        drawRigM(buf, r, M, fl);
        continue;
      }
      gobRoot(M, e.x, y, e.z, e.heading, sx, sy, sz);
      drawRigM(buf, r, M, fl);
      if (sbuf && g.etat !== 'mur' && g.etat !== 'sortir' && g.etat !== 'rentrer' && !e.aieule) drawShadow(sbuf, e.x, e.y, e.z, 0.24);
    }
    if (!S) return;
    // les chiffons, ce qui est tombé, les marques griffées
    PE.buf = buf; PE.fl = 0; PE.tint = null;
    for (const C of S.corps) {
      if (!C.chiffons || C.pris || (C.x - cam[0]) ** 2 + (C.z - cam[2]) ** 2 > 3600) continue;
      PE.frame(C.x, C.y, C.z, C.x * 7.3, 1);
      PROP_MODELS.gob_nid(PE, { x: C.x, z: C.z, v: 0, data: {} });
    }
    for (const L of S.lache) {
      if ((L.x - cam[0]) ** 2 + (L.z - cam[2]) ** 2 > 1600) continue;
      const it = ITEMS[L.k], c = L.k === 'argent' ? GOB_C.or : it && Array.isArray(it.ic) && typeof it.ic[1] === 'string' ? rgbf(it.ic[1]) : GOB_C.argent;
      PE.frame(L.x, L.y, L.z, L.z * 3.1, 1);
      PE.bx(0, 0, 0, 0.11, 0.05, 0.08, c, TL.plain);
      if (L.cadeau) PE.bx(0, -0.01, 0, 0.3, 0.012, 0.25, rgbf('#5a7a3a'), TL.leaves);
    }
    for (const m of S.meubles) {
      const Mq = this.marqueMeuble(m);
      if (!Mq || (Mq.x - cam[0]) ** 2 + (Mq.z - cam[2]) ** 2 > 400) continue;
      PE.frame(Mq.x, Mq.y, Mq.z, Mq.r, 1);
      for (let k = 0; k < 3; k++) PE.box(-0.04 + k * 0.04, 0.03, 0, 0.012, 0.09, 0.006, [0.1, 0.08, 0.06], TL.plain, 0, 0, 0.15);
      for (let k = 0; k < 6; k++) { const a = k * TAU / 6; PE.box(Math.cos(a) * 0.03, -0.06 + Math.sin(a) * 0.03, 0, 0.014, 0.014, 0.006, [0.1, 0.08, 0.06], TL.plain); }
    }
  },

  // ------------------------------------------------------------------ essais (tests)
  heureFixer(h) { const w = game.world, s = farm.s; w.time = h / 24; game.lastT = w.time; s.hours = (s.day - 1) * 24 + h; },
  copie() { return JSON.parse(JSON.stringify(this.S())); },
  // un vol cette nuit dans telle maison (pour les essais)
  voler2(bld) {
    const S = this.S();
    const it = [...fouilles.par.values()].find((i) => i.kind === 'f2' && i.data.bld === bld && !fouilles.vide(i) && !i.data.cache);
    if (!it) return null;
    const P1 = this.cibleRaid({ bld, it: it.id }), ter = this.terrierProche(P1.x, P1.z);
    const R = { g: this.vivants()[0], bld, it: it.id, ter: ter.i, hd: 0, ha: 0.5, hf: 0.8, hr: 1.3, etat: 'prevu', vole: false };
    S.nuit.raids.push(R);
    return R;
  },
};

// la racine du corps, avec un étirement (le passage dans les murs)
function gobRoot(M, x, y, z, h, sx, sy, sz) {
  const c = Math.cos(h), s = Math.sin(h);
  // colonnes : x local → (c, 0, -s) × sx ; y → (0, 1, 0) × sy ; z → (s, 0, c) × sz
  M[0] = c * sx; M[1] = 0; M[2] = s * sz; M[3] = x;
  M[4] = 0; M[5] = sy; M[6] = 0; M[7] = y;
  M[8] = -s * sx; M[9] = 0; M[10] = c * sz; M[11] = z;
}

// ---------------------------------------------------------------- les interactions (E)
HOOKS.inter.gob_souche = () => {
  const S = gobelins.S(), s = farm.s, id = s.hand, G = gobelins.G();
  const offr = ['lait', 'pain', 'miel', 'fromage', 'oeuf', 'brioche', 'confiture'];
  if (id && offr.includes(id) && farm.count(id) && !(S.offrande && S.offrande.j === s.day)) {
    farm.take(id, 1);
    S.offrande = { j: s.day, k: id };
    ui.subtitle('', GOB_T.dit.offrande.replace('{objet}', (ITEMS[id] ? itemName(id) : id).toLowerCase()), 4);
    return;
  }
  if (S.offrande && S.offrande.prise && !S.offrande.vue) { S.offrande.vue = 1; ui.subtitle('', GOB_T.dit.offrandePrise, 4); return; }
  ui.subtitle('', GOB_T.dit.souche, 3.5);
  if (G && !S.connu.souche) S.connu.souche = s.day;
};
HOOKS.interVis.gob_racine = (it) => {
  const S = gobelins.S(), p = game.player;
  if (!S) return false;
  if (S.connu.racine) return true;
  return p.crouch > 0.5 && Math.hypot(it.x - p.pos[0], it.z - p.pos[2]) < 2.0;
};
HOOKS.inter.gob_racine = () => {
  const S = gobelins.S(), G = gobelins.G();
  if (!S.connu.racine) {
    S.connu.racine = farm.s.day;
    gobelins.majLumieres();
    sound.gobTrappe && sound.gobTrappe(G && G.trappe ? [G.trappe.x, G.trappe.y + 0.2, G.trappe.z] : null, 1);
    ui.subtitle('', GOB_T.dit.racineTiree, 3.5);
    if (G && G.trappe) puffAt(G.trappe.x, G.trappe.y + 0.1, G.trappe.z, [70, 56, 40], 12, 1.5, false);
    return;
  }
  ui.subtitle('', GOB_T.penses.racines, 3);
};
HOOKS.interVis.gob_trappe = () => { const S = gobelins.S(); return !!(S && S.connu.racine); };
HOOKS.inter.gob_trappe = async () => {
  const S = gobelins.S(), G = gobelins.G(), h = gobelins.heure(), Rg = GOB_REGL.porte;
  if (!G || !G.village) return;
  const ouverte = gobelins.partis() || ((h >= Rg[0] || h < Rg[1]) && S.barre !== gobelins.nuitCle());
  if (!ouverte) {
    sound.gobTrappe && sound.gobTrappe([G.trappe.x, G.trappe.y, G.trappe.z], 0.3);
    ui.subtitle('', S.barre === gobelins.nuitCle() && (h >= Rg[0] || h < Rg[1]) ? GOB_T.dit.trappeBarree : GOB_T.dit.trappeJour, 4.5);
    return;
  }
  S.connu.entre = S.connu.entre || farm.s.day;
  if (G.trappe.q) { G.trappe.q.data = Object.assign({}, G.trappe.q.data || {}, { ouverte: true }); farm.dirtyProps = true; }
  sound.gobTrappe && sound.gobTrappe([G.trappe.x, G.trappe.y, G.trappe.z], 0.8);
  await game.teleport(G.village.arrivee, GOB_T.dit.entrer);
  if (G.trappe.q) { G.trappe.q.data = Object.assign({}, G.trappe.q.data || {}, { ouverte: false }); farm.dirtyProps = true; }
};
HOOKS.inter.gob_remonter = async () => {
  const G = gobelins.G();
  if (!G || !G.trappe) return;
  await game.teleport(G.trappe.sortie, GOB_T.dit.remonter);
};
HOOKS.inter.gob_tas = (it) => gobelins.poignee(it.data.i | 0);
HOOKS.inter.gob_grand = () => gobelins.poignee('grand');
HOOKS.inter.gob_etal = () => { if (typeof gobEtal !== 'undefined') gobEtal.ouvrir(); };
HOOKS.inter.gob_lire = (it) => { const O = GOB_T.objets[it.data.cle]; if (O) { ui.read(O[0], O[1]); sound.page && sound.page(); } };
HOOKS.inter.gob_raccourci = async () => {
  const S = gobelins.S(), G = gobelins.G();
  const T = G && G.terriers.find((t) => t.raccourci);
  if (!T) return;
  if (!S.connu.raccourci) { S.connu.raccourci = farm.s.day; gobelins.majLumieres(); sound.gobTrappe && sound.gobTrappe(null, 0.8); }
  await game.teleport([T.x + Math.sin(T.r) * 1.2, T.y + 0.05, T.z + Math.cos(T.r) * 1.2], GOB_T.dit.barre);
};
HOOKS.inter.gob_terrier = async (it) => {
  const S = gobelins.S(), G = gobelins.G();
  const T = G && G.terriers.find((t) => t.cle === it.data.cle);
  if (T && T.raccourci && S.connu.raccourci && G.village) { await game.teleport(G.village.raccourciArrivee, GOB_T.dit.terrierGlisser); return; }
  ui.subtitle('', GOB_T.dit.terrier, 3.5);
};
HOOKS.inter.gob_marque = () => { ui.read(GOB_T.lab.marque, GOB_T.dit.marque); sound.page && sound.page(); gobelins.signe(); };

// ---------------------------------------------------------------- les étiquettes (le texte sous le réticule)
{
  const lab = (k) => (it) => esc(GOB_T.lab[k]);
  if (typeof fouilles !== 'undefined' && fouilles.etiquettes) Object.assign(fouilles.etiquettes, {
    gob_souche: () => { const id = farm.s && farm.s.hand; return esc(id && ['lait', 'pain', 'miel', 'fromage', 'oeuf', 'brioche', 'confiture'].includes(id) && farm.count(id) ? GOB_T.lab.offrande : GOB_T.lab.souche); },
    gob_racine: lab('racine'), gob_trappe: lab('trappe'), gob_remonter: lab('remonter'),
    gob_tas: (it) => { const S = gobelins.S(); return esc((S && (S.tas[it.data.i] | 0) >= GOB_REGL.poignees) ? GOB_T.lab.tasVide : GOB_T.lab.tas); },
    gob_grand: () => { const S = gobelins.S(); return esc((S && (S.grand | 0) >= GOB_REGL.poignees) ? GOB_T.lab.tasVide : GOB_T.lab.grandTas); },
    gob_etal: lab('etal'), gob_lire: (it) => esc(it.name || ''), gob_raccourci: () => { const S = gobelins.S(); return esc(S && S.connu.raccourci ? 'Sortir par le boyau' : GOB_T.lab.barre); },
    gob_terrier: (it) => { const S = gobelins.S(), G = gobelins.G(), T = G && G.terriers.find((t) => t.cle === it.data.cle); return esc(T && T.raccourci && S && S.connu.raccourci ? GOB_T.lab.terrierOuvert : GOB_T.lab.terrier); },
    gob_marque: lab('marque'),
  });
}

// ---------------------------------------------------------------- les points d'accroche
{
  // leur conduite : la nôtre (la conduite commune ne les touche pas)
  const _uw = entities.updateWalker.bind(entities);
  entities.updateWalker = function (e, dt, w, c) {
    if (e && e.gob) { try { gobelins.ia(e, dt, w, c); } catch (err) { console.error('gobelins', err); } return; }
    return _uw(e, dt, w, c);
  };
  // le dessin : par nous
  const _draw = entities.draw.bind(entities);
  entities.draw = function (buf, sbuf, cam, maxD, t, flags) {
    const L = gobelins.E, H = [];
    for (const e of L) { H.push(e.hidden); e.hidden = true; }
    try { _draw(buf, sbuf, cam, maxD, t, flags); } finally { L.forEach((e, i) => { e.hidden = H[i]; }); }
    try { if (typeof game !== 'undefined' && game.kind === 'farm' && farm.s) gobelins.dessiner(buf, sbuf, cam, maxD, t, flags); } catch (err) { console.error('gobelins', err); }
  };
  // les coups (la chasse, la société, l'esprit ne les comptent pas comme des bêtes)
  const _hc = play.hurtCreature.bind(play);
  play.hurtCreature = function (e, dmg, eye) {
    if (e && e.gob) { try { return gobelins.blesser(e, dmg, eye); } catch (err) { console.error(err); return false; } }
    return _hc(e, dmg, eye);
  };
  const _dmg = entities.damage.bind(entities);
  entities.damage = function (e, dmg, fx, fz) {
    if (e && e.gob) { try { return gobelins.blesser(e, dmg, [fx, 0, fz]); } catch (err) { console.error(err); return false; } }
    return _dmg(e, dmg, fx, fz);
  };
}
HOOKS.target.push((eye, f, cand) => { try { if (farm.s && game.kind === 'farm') gobelins.cibles(eye, f, cand); } catch (e) { console.error('gobelins', e); } });
HOOKS.update.push((dt, eye, basis, sky, playing) => { try { if (farm.s && game.kind === 'farm') gobelins.maj(dt, eye, basis, sky, playing); } catch (e) { console.error('gobelins', e); } });
HOOKS.day.push(() => { try { if (farm.s) gobelins.jour(); } catch (e) { console.error('gobelins', e); } });
// le ciel de la Gobelinière : la nuit d'une cave, des chandelles
HOOKS.sky.push((sky) => {
  if (!gobelins.dans) return;
  const N = [0, 0, 0];
  sky.zen = [0.012, 0.009, 0.006]; sky.hor = [0.016, 0.012, 0.008]; sky.glow = N; sky.haze = [0.02, 0.014, 0.009];
  sky.amb = [0.035, 0.028, 0.022]; sky.sunCol = N; sky.moonCol = N; sky.cloudLit = N; sky.cloudDark = N;
  sky.stars = 0; sky.sunVis = 0; sky.moonVis = 0; sky.cloudCover = 0; sky.mist = 0; sky.shadowK = 0; sky.nightLit = 1; sky.wet = 0; sky.frost = 0;
  sky.fog = [4, 46];
});
HOOKS.load.push(() => {
  const X = gobelins;
  X.E = []; X.t = 0; X.tickT = 0; X.rodT = 8; X.dans = false; X.aieuleE = null; X.tenu = null;
  if (!farm.s) return;
  const S = X.S();
  // une partie d'avant les gobelins : la vallée régénérée les a déjà (w.gobelins) ; rien d'autre à faire
  if (game.world && !game.world.gobelins && game.world.designed && game.world === farm.w) { try { game.world.gobelins = gobGenerer(game.world, game.world.seed || farm.s.seed || 0); } catch (e) { console.error('gobelins', e); } }
  X.majTas(); X.majEtal(); X.majLumieres();
  if (S.nuit && S.nuit.raids) for (const R of S.nuit.raids) R.e = null;
  if (X._branche) return;
  X._branche = true;
  // la plainte du lendemain
  const _open = talk.open.bind(talk);
  talk.open = function (n) {
    const v = _open(n);
    try {
      const S2 = gobelins.S(), j = S2 && S2.plaintes[n.id];
      if (v && v.text && j !== undefined && farm.s.day >= j && farm.s.day - j <= 3 && n.st.alive && !npcs.murdererKnown() && !(n.st.anger > 0)) {
        delete S2.plaintes[n.id];
        v.text = fmtLine(GOB_T.plaintes[n.id] || gobPick(GOB_T.plaintes._), n);
        n.speakT = Math.min(6, 1 + v.text.length * 0.04);
      }
    } catch (e) { console.error(e); }
    return v;
  };
  // rendre à chacun ce qu'on lui avait pris
  const aRendre = (n) => { const S2 = gobelins.S(); return S2 ? S2.rendre.filter((r) => r.de === n.id && farm.count(r.k) > 0) : []; };
  const rendre = (n, L) => {
    const S2 = gobelins.S(), noms = [];
    for (const r of L) {
      const c = Math.min(r.n, farm.count(r.k));
      if (c <= 0 || !farm.take(r.k, c)) continue;
      noms.push(itemName(r.k).toLowerCase());
      r.n -= c;
      npcs.addAmitie(n, Math.min(60, 20 + (ITEMS[r.k] ? ITEMS[r.k].price || 0 : 0)));
    }
    S2.rendre = S2.rendre.filter((r) => r.n > 0);
    if (!noms.length) return null;
    npcs.remember(n, 'rendu');
    const liste = noms.length > 1 ? noms.slice(0, -1).join(', ') + ' et ' + noms[noms.length - 1] : noms[0];
    return gobPick(GOB_T.rendre.merci).replace('{objets}', liste.charAt(0).toUpperCase() + liste.slice(1));
  };
  const _opts = talk.options.bind(talk);
  talk.options = function () {
    const opts = _opts();
    try { const n = this.n; if (n && aRendre(n).length) { const i = opts.findIndex((o) => o.act === 'bye'); opts.splice(i < 0 ? opts.length : i, 0, { label: GOB_T.rendre.opt, act: 'gob_rendre' }); } } catch (e) { console.error(e); }
    return opts;
  };
  const _choose = talk.choose.bind(talk);
  talk.choose = function (act) {
    if (act === 'gob_rendre') { const n = this.n; const t = n ? rendre(n, aRendre(n)) : null; return this.view(t || '…', this.options()); }
    return _choose(act);
  };
  // offrir, en main, ce qui lui avait été pris : c'est le lui rendre
  const _gift = talk.gift.bind(talk);
  talk.gift = function () {
    const n = this.n, id = farm.s && farm.s.hand;
    if (n && id) { const L = aRendre(n).filter((r) => r.k === id); if (L.length) { const t = rendre(n, L.slice(0, 1)); if (t) return this.view(t, this.options()); } }
    return _gift();
  };
});

// ---------------------------------------------------------------- ce qu'on dit d'eux (les rumeurs des habitants)
{
  const tous = () => NPC_DATA.concat(typeof C2_HABITANTS !== 'undefined' ? C2_HABITANTS.filter((d) => !NPC_DATA.includes(d)) : []);
  for (const d of tous()) { const t = GOB_T.rumeurs[d.id]; if (t && d.lines && Array.isArray(d.lines.rumeurs) && !d.lines.rumeurs.includes(t)) d.lines.rumeurs.push(t); }
}
// la malédiction de la vieille (si on la tue)
if (typeof MAL_CAUSES !== 'undefined') MAL_CAUSES.gob_aieule = { mal: 'malchance', faute: 'Vous avez tué la vieille des gobelins.', reparer: 'Rendre à la Gobelinière ce qui y a été pris.' };
