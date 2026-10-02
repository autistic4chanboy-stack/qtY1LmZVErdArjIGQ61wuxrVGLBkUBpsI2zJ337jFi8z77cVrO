// ============================================================================
//  LES BÊTES DES PRÉS, DE LA FERME ET DE LA VILLE (agent E1, douzième vague)
//  Trente espèces (05-zzzzzE1-betes.js : le catalogue et les notices ;
//  07-zzzzzzzzzzzzE1-modeles.js : les modèles ; 09-zzzzE1-cris.js : les cris ;
//  10-zzzzE1-betes.js : les réglages).
//  - LE PEUPLEMENT : aucune passe de génération. Les bêtes naissent autour du
//    joueur, dans leur milieu (le biome où il se trouve : les prés, la ferme —
//    quarante mètres autour de la vieille ferme —, la ville), à leur heure, par
//    le temps qui leur convient ; chacune est là une part du temps selon sa
//    rareté (E1_PART), quelques groupes à la fois (E1_BUDGET), puis s'en va.
//  - LES LIEUX se calculent au chargement d'après la graine, sans rien poser
//    dans le monde : le nid de frelons (un vieil arbre près de la ferme), les
//    toiles d'épeire, l'âtre (le grillon), les faîtes et les murs, les nids
//    d'hirondelles sous les avant-toits de la ville, la corbeautière, le
//    sommet du clocher, les réverbères, les douves, le lavoir.
//  - LES CONDUITES (E1_CONDUITES) : le faucon fait le Saint-Esprit puis tombe
//    dans l'herbe, la buse tourne en miaulant, la caille part sous les pieds,
//    les vanneaux se lèvent en bande, l'outarde se méfie de tout, la belette se
//    dresse, la chevêche hoche la tête, le putois empeste qui l'accule, le
//    frelon défend son nid, les hirondelles tournent autour des toits, les
//    choucas autour du clocher, le pèlerin tombe sur les pigeons, le petit-duc
//    devient branche, le surmulot nage dans les douves, la fouine court les
//    toits, l'alyte flûte, le grand paon se cogne aux réverbères…
//  - CE QU'ON EN FAIT : la chasse (PREY, noms), le filet (hanneton, sauterelle,
//    machaon, grand paon), la main (E : escargot, hanneton posé, sauterelle,
//    toile d'épeire, nid de frelons vide), les escargots à l'ail.
//  État : farm.s.e1 = { v, toiles: { id: jour }, nid: { pris, colere }, grillon: { mort, dit }, dits: {} }
//  API : e1 (lieux(w), naitre(kind), actifs, retirerTout(), cri(e, clé))
// ============================================================================

// la part du temps où une espèce est là quand tout lui convient, selon sa rareté (commune … introuvable)
const E1_PART = [0.6, 0.35, 0.14, 0.05, 0.015];
const E1_BUDGET = { groupes: 8, betes: 45 };
// les bêtes qui se défendent (rarement, et on le voit venir) : les frelons de leur nid (on s'en approche trop longtemps,
// on le touche : trois piqûres au plus), le surmulot acculé (une morsure), le putois acculé (une odeur, pas de mal)
const E1_DANGER = {
  frelon: { approche: 2.8, tout_pres: 1.6, patience: 4, colere: 12, piqures: 3, degats: [5, 9], cause: 'Piqué par les frelons' },
  surmulot: { coince: 1.2, degats: [3, 5], cause: 'Mordu par un rat' },
  putois: { accule: 1.8, nausee: 30 },
};
const E1_ARBRES = new Set(['oak', 'apple', 'hetre', 'chataignier', 'noyer', 'erable', 'tilleul', 'peuplier', 'poirier', 'cerisier', 'prunier', 'saule', 'aulne', 'birch', 'deadtree', 'if']);
const E1_GRANDS = new Set(['oak', 'hetre', 'chataignier', 'noyer', 'erable', 'tilleul', 'peuplier']);
const E1_BUISSONS = new Set(['bush', 'ronce', 'eglantier', 'sureau', 'houx', 'genet']);

const e1 = {
  actifs: [], T: 1, fT: 0, dits: {},
  S() {
    const s = farm.s;
    if (!s) return null;
    const E = s.e1 && typeof s.e1 === 'object' ? s.e1 : (s.e1 = {});
    if (!E.v) E.v = 1;
    if (!E.toiles || typeof E.toiles !== 'object') E.toiles = {};
    if (!E.nid || typeof E.nid !== 'object') E.nid = {};
    if (!E.grillon || typeof E.grillon !== 'object') E.grillon = {};
    if (!E.dits || typeof E.dits !== 'object') E.dits = {};
    return E;
  },
  heure() { try { return npcs.hour(); } catch (err) { return ((game.world.time || 0) * 24) % 24; } },
  dans(h, H) { return H[0] <= H[1] ? h >= H[0] && h < H[1] : h >= H[0] || h < H[1]; },
  // une pensée, une seule fois par partie (clé)
  pense(cle, texte, dur) { const E = this.S(); if (!E || E.dits[cle]) return; E.dits[cle] = farm.s.day || 1; ui.subtitle('', texte, dur || 3); },

  // ============================================================== les lieux (une fois par monde, d'après la graine)
  // un bâtiment d'après ses blocs : le toit (prisme, faîte selon x local), les murs
  bat(w, b) {
    if (!b || !(b.x > 0)) return null;
    const R0 = Math.max(b.W || 8, b.D || 8) / 2 + 1.5, y0 = (b.f && b.f.y !== undefined ? b.f.y : b.y) || 0;
    let toit = null, murs = [];
    for (const k of w.blocks) {
      if (k.under || Math.abs(k.x - b.x) > R0 || Math.abs(k.z - b.z) > R0) continue;
      if (k.sh === 1 && k.y > y0 + 1.5 && (!toit || k.sx * k.sz > toit.sx * toit.sz)) toit = k;
      if (!k.sh && k.sy >= 1.8 && Math.min(k.sx, k.sz) <= 0.6 && Math.max(k.sx, k.sz) >= 1.2 && Math.abs(k.y - y0) < 0.8) murs.push(k);
    }
    if (!toit) return null;
    const c = Math.cos(toit.r), s = Math.sin(toit.r);
    const monde = (lx, lz) => [toit.x + lx * c + lz * s, toit.z - lx * s + lz * c];
    const W = toit.sx - 0.9, D = toit.sz - 1.0;
    return { x: toit.x, z: toit.z, y: y0, r: toit.r, W, D, egout: toit.y, faite: toit.y + toit.sy, monde, murs,
      faiteA: monde(-W / 2 + 0.3, 0), faiteB: monde(W / 2 - 0.3, 0) };
  },
  // un point au pied d'un mur, ou sur sa face (h : hauteur au-dessus du sol), tourné vers l'extérieur
  surMur(B, rnd, h) {
    const k = B.murs[(rnd() * B.murs.length) | 0];
    if (!k) return null;
    const c = Math.cos(k.r), s = Math.sin(k.r), long = k.sx >= k.sz, L = long ? k.sx : k.sz, ep = long ? k.sz : k.sx;
    const t = (rnd() - 0.5) * (L - 0.6);
    let lx = long ? t : 0, lz = long ? 0 : t;
    // la face extérieure : du côté opposé au centre du bâtiment
    const nx0 = long ? 0 : 1, nz0 = long ? 1 : 0, wx = nx0 * c + nz0 * s, wz = -nx0 * s + nz0 * c;
    const sg = (k.x - B.x) * wx + (k.z - B.z) * wz >= 0 ? 1 : -1;
    if (long) lz = sg * (ep / 2 + 0.04); else lx = sg * (ep / 2 + 0.04);
    return { x: k.x + lx * c + lz * s, z: k.z - lx * s + lz * c, y: B.y + (h || 0), cap: Math.atan2(wx * sg, wz * sg) };
  },
  lieux(w) {
    if (w._e1L) return w._e1L;
    const rnd = mulberry32(((w.seed | 0) ^ 0xe1b3) >>> 0), L = { ferme: null, ville: null };
    const objPres = (x, z, r, fn) => { const out = []; w.query(x, z, r, (o) => { if (o && !o.gone && fn(OBJ_TYPES[o.t].id, o)) out.push(o); }, null); return out; };
    const HAUT = { boite_lettres: 1.25, epouvantail: 2.1, poteau_dir: 2.0, panneau_carte: 1.9, calvaire: 2.4, tonneau: 0.92, tonneau_pluie: 1.0, tas_bois: 1.0, croix: 1.9, borne: 0.8, cloture_pierre: 0.9, puits: 1.3 };
    const hProp = (q) => HAUT[q.id] ?? (typeof PROP_COLL !== 'undefined' && PROP_COLL[q.id] ? PROP_COLL[q.id][2] : 1);
    // ---------------------------------------------------------- la ferme
    const F = w.farm && w.farm.f;
    if (F) {
      const M = this.bat(w, w.bld && w.bld.ferme);
      const fe = { x: F.x, z: F.z, maison: M, perchoirs: [], murs: [], pierres: [], arbres: [], foyer: null, nid: null, toiles: [] };
      const props = w.props.filter((q) => q && !q.gone && Math.hypot(q.x - F.x, q.z - F.z) < 48);
      if (M) {
        for (const [x, z] of [M.faiteA, M.faiteB]) fe.perchoirs.push({ x, y: M.faite + 0.02, z, cap: M.r + Math.PI / 2, toit: true });
        for (let k = 0; k < 14; k++) { const p = this.surMur(M, rnd, 0); if (p) fe.murs.push(p); }
      }
      for (const q of props) if (['boite_lettres', 'epouvantail', 'poteau_dir', 'panneau_carte', 'calvaire', 'tas_bois', 'croix'].includes(q.id)) fe.perchoirs.push({ x: q.x, y: q.y + hProp(q), z: q.z, cap: q.r || 0 });
      for (const q of props) if (['tas_bois', 'cloture_pierre', 'tonneau', 'tonneau_pluie', 'caisses', 'caisse', 'sac'].includes(q.id)) fe.murs.push({ x: q.x + (rnd() - 0.5) * 1.2, z: q.z + (rnd() - 0.5) * 1.2, y: w.heightAt(q.x, q.z), cap: rnd() * TAU });
      const arbres = objPres(F.x, F.z, 70, (id) => E1_ARBRES.has(id));
      arbres.sort((a, b) => Math.hypot(a.x - F.x, a.z - F.z) - Math.hypot(b.x - F.x, b.z - F.z));
      fe.arbres = arbres.slice(0, 10).map((o) => ({ x: o.x, z: o.z, y: w.objectY(o), h: o.h || 6, id: OBJ_TYPES[o.t].id }));
      for (const a of fe.arbres.slice(0, 4)) fe.perchoirs.push({ x: a.x + 0.4, y: a.y + a.h * 0.55, z: a.z, cap: rnd() * TAU, arbre: true });
      for (const o of objPres(F.x, F.z, 75, (id) => id === 'stones' || id === 'rock')) if (fe.pierres.length < 8) fe.pierres.push({ x: o.x, z: o.z, y: w.objectY(o) + (OBJ_TYPES[o.t].id === 'rock' ? 0.5 : 0.12) });
      for (const q of props) if ((q.id === 'tas_bois' || q.id === 'cloture_pierre') && fe.pierres.length < 10) fe.pierres.push({ x: q.x, z: q.z, y: q.y + hProp(q) * 0.9 });
      const che = w.props.find((q) => q && q.id === 'cheminee' && M && Math.hypot(q.x - M.x, q.z - M.z) < 7);
      if (che) fe.foyer = { x: che.x, y: che.y, z: che.z, r: che.r || 0 };
      // le nid de frelons : sur le tronc d'un vieil arbre, à trois mètres ; sinon sous l'avant-toit
      const vieux = fe.arbres.filter((a) => Math.hypot(a.x - F.x, a.z - F.z) > 16 && ['oak', 'apple', 'poirier', 'chataignier', 'noyer', 'tilleul', 'peuplier', 'saule', 'deadtree', 'hetre'].includes(a.id));
      if (vieux.length) { const a = vieux[(rnd() * Math.min(3, vieux.length)) | 0], t = rnd() * TAU; fe.nid = { x: a.x + Math.sin(t) * 0.42, y: a.y + 2.6 + rnd() * 0.6, z: a.z + Math.cos(t) * 0.42, arbre: true }; }
      else if (M) { const [x, z] = M.monde(-M.W / 2 + 0.6, M.D / 2 + 0.35); fe.nid = { x, y: M.egout - 0.15, z }; }
      // les toiles : contre les piquets et les poteaux, dans les buissons, au coin de la maison
      const ancres = props.filter((q) => ['boite_lettres', 'epouvantail', 'poteau_dir', 'panneau_carte', 'tonneau_pluie', 'calvaire'].includes(q.id)).map((q) => ({ x: q.x, z: q.z, y: q.y }));
      for (const o of objPres(F.x, F.z, 55, (id) => E1_BUISSONS.has(id))) ancres.push({ x: o.x, z: o.z, y: w.objectY(o) });
      if (M) for (const [lx, lz] of [[-M.W / 2 - 0.05, -M.D / 2 - 0.05], [M.W / 2 + 0.05, M.D / 2 + 0.05]]) { const [x, z] = M.monde(lx, lz); ancres.push({ x, z, y: M.y }); }
      for (let k = 0; k < 4 && ancres.length; k++) {
        const a = ancres.splice((rnd() * ancres.length) | 0, 1)[0], t = rnd() * TAU;
        fe.toiles.push({ id: 'f' + k, x: a.x + Math.sin(t) * 0.45, z: a.z + Math.cos(t) * 0.45, y: a.y + 0.75 + rnd() * 0.6, r: t + Math.PI / 2, R: 0.24 + rnd() * 0.12 });
      }
      L.ferme = fe;
    }
    // ---------------------------------------------------------- la ville
    const T = w.townInfo;
    if (T) {
      const vi = { x: T.x, z: T.z, clocher: null, toits: [], murs: [], nids: [], corbeautiere: null, arbres: [], reverberes: [], douves: [], lavoir: null, four: null, egl: null };
      const maisons = [];
      for (const k in w.bld) {
        const b = w.bld[k];
        if (!b || Math.max(Math.abs(b.x - T.x), Math.abs(b.z - T.z)) > 60 || /^tour_/.test(k)) continue;
        const B = this.bat(w, b);
        if (B) { B.cle = k; maisons.push(B); }
      }
      for (const B of maisons) {
        vi.toits.push({ a: B.faiteA, b: B.faiteB, y: B.faite + 0.02, cle: B.cle });
        for (let k = 0; k < 3; k++) { const p = this.surMur(B, rnd, 0); if (p) vi.murs.push(p); }
      }
      // les nids d'hirondelles : sous l'avant-toit d'une longue façade, sur trois maisons
      const hab = maisons.filter((B) => B.cle !== 'eglise' && B.W >= 6).sort(() => rnd() - 0.5).slice(0, 3);
      for (const B of hab) {
        const n = 3 + ((rnd() * 3) | 0), cote = rnd() < 0.5 ? -1 : 1;
        for (let k = 0; k < n; k++) { const lx = -B.W / 2 + 0.8 + (k + 0.5) * (B.W - 1.6) / n + (rnd() - 0.5) * 0.3; const [x, z] = B.monde(lx, cote * (B.D / 2 + 0.06)); vi.nids.push({ x, y: B.egout - 0.1, z, r: B.r + (cote > 0 ? 0 : Math.PI), cle: B.cle }); }
      }
      // le clocher : le plus haut bloc près de l'église ; le faîte de la nef
      const eg = w.bld.eglise;
      if (eg) {
        let top = null;
        for (const k of w.blocks) if (!k.under && Math.hypot(k.x - eg.x, k.z - eg.z) < 18 && (!top || k.y + k.sy > top.y + top.sy)) top = k;
        let mur = null; // le haut des murs de la tour (sous la flèche)
        if (top) for (const k of w.blocks) if (!k.under && Math.hypot(k.x - top.x, k.z - top.z) < 3.5 && k !== top && k.y + k.sy <= top.y + 0.05 && (!mur || k.y + k.sy > mur.y + mur.sy)) mur = k;
        if (top) {
          const yM = mur ? mur.y + mur.sy : top.y, demi = Math.min(top.sx, top.sz) / 2 - 0.25;
          vi.clocher = { x: top.x, z: top.z, pointe: top.y + top.sy, y: yM, demi, coins: [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => ({ x: top.x + a * demi, z: top.z + b * demi, y: yM + 0.02 })) };
        }
        const E = maisons.find((B) => B.cle === 'eglise');
        if (E) vi.egl = { a: E.faiteA, b: E.faiteB, y: E.faite + 0.02 };
      }
      // les arbres de la place et des alentours (le petit-duc) ; la corbeautière (le bouquet de grands arbres le plus serré, hors les murs)
      const arbres = objPres(T.x, T.z, 230, (id) => E1_ARBRES.has(id)).map((o) => ({ x: o.x, z: o.z, y: w.objectY(o), h: o.h || 6, id: OBJ_TYPES[o.t].id, d: Math.hypot(o.x - T.x, o.z - T.z) }));
      vi.arbres = arbres.filter((a) => a.d < 120).sort((a, b) => a.d - b.d).slice(0, 8);
      const grands = arbres.filter((a) => E1_GRANDS.has(a.id) && a.d > 60 && a.h > 5);
      let best = null, bn = 0;
      for (const a of grands) { let n = 0; for (const b of grands) if (Math.hypot(a.x - b.x, a.z - b.z) < 16) n++; if (n > bn || (n === bn && best && a.d < best.d)) { bn = n; best = a; } }
      if (best) {
        const bouquet = grands.filter((b) => Math.hypot(best.x - b.x, best.z - b.z) < 16).slice(0, 7);
        const nids = [];
        for (const b of bouquet) for (let k = 0; k < 1 + ((rnd() * 2) | 0); k++) { const t = rnd() * TAU, r = 0.4 + rnd() * 1.2; nids.push({ x: b.x + Math.sin(t) * r, y: b.y + b.h * (0.74 + rnd() * 0.16), z: b.z + Math.cos(t) * r, r: t }); }
        vi.corbeautiere = { x: best.x, z: best.z, nids };
      }
      for (const q of w.props) if (q && q.id === 'lampadaire' && Math.max(Math.abs(q.x - T.x), Math.abs(q.z - T.z)) < 70) vi.reverberes.push({ x: q.x, y: q.y + 2.92, z: q.z, sol: q.y });
      // les douves : des points de berge (l'eau à côté)
      const Md = w.moat;
      if (Md) for (let k = 0; k < 90 && vi.douves.length < 14; k++) {
        const cote = (rnd() * 4) | 0, t = (rnd() - 0.5) * 2 * Md.outer, dans = rnd() < 0.5, rr = dans ? Md.inner - 0.6 : Md.outer + 0.6, eau = (Md.inner + Md.outer) / 2;
        const P = (r) => cote === 0 ? [Md.x + t, Md.z - r] : cote === 1 ? [Md.x + t, Md.z + r] : cote === 2 ? [Md.x - r, Md.z + t] : [Md.x + r, Md.z + t];
        const [x, z] = P(rr), [ex, ez] = P(eau);
        if (w.heightAt(x, z) > w.waterLevel + 0.1 && w.heightAt(ex, ez) < w.waterLevel - 0.2) vi.douves.push({ x, z, y: w.heightAt(x, z), ex, ez });
      }
      const Lv = w.lm && w.lm.lavoir;
      if (Lv) vi.lavoir = { x: Lv.x, z: Lv.z, y: w.heightAt(Lv.x, Lv.z) };
      const four = w.props.find((q) => q && (q.id === 'four' || q.id === 'cheminee') && w.bld.boulangerie && Math.hypot(q.x - w.bld.boulangerie.x, q.z - w.bld.boulangerie.z) < 7);
      if (four) vi.four = { x: four.x, y: four.y, z: four.z, r: four.r || 0 };
      L.ville = vi;
    }
    return (w._e1L = L);
  },

  // ============================================================== naître, partir
  // un groupe : { kind, ents, fin (temps de jeu où il s'en va), part, x, z, …données de la conduite }
  ajouter(G, x, z, y, opts) {
    const w = game.world;
    const e = entities.add(w, G.kind, x, z, Object.assign({ v: (Math.random() * 6) | 0 }, opts || {}));
    e.y = y !== undefined && y !== null ? y : entities.groundY(w, e, x, z);
    e.hx = x; e.hz = z; e.G = G; e.mo = null; e.t1 = 0;
    if (e.rig) e.rig.ent = e;
    G.ents.push(e);
    return e;
  },
  groupe(kind, data) {
    const P = E1_PEUPLE[kind], G = Object.assign({ kind, ents: [], ne: game.time, fin: game.time + lerp(P.vie[0], P.vie[1], Math.random()), part: false }, data || {});
    this.actifs.push(G);
    return G;
  },
  retirer(G) {
    for (const e of G.ents) if (!e.removed && !e.corpse) entities.remove(e);
    const i = this.actifs.indexOf(G);
    if (i >= 0) this.actifs.splice(i, 1);
  },
  retirerTout() { for (const G of this.actifs.slice()) this.retirer(G); this.actifs = []; },
  compte() { let n = 0; for (const G of this.actifs) n += G.ents.length; return n; },
  // un point au hasard autour du joueur, de préférence hors de sa vue (on ne voit pas naître les bêtes)
  autour(P, r0, r1, test, f) {
    for (let k = 0; k < 14; k++) {
      const a = Math.random() * TAU, d = r0 + Math.random() * (r1 - r0), x = P[0] + Math.sin(a) * d, z = P[2] + Math.cos(a) * d;
      if (f && k < 9 && (Math.sin(a) * f[0] + Math.cos(a) * f[2]) > 0.25 && d < 90) continue;
      if (test(x, z)) return [x, z];
    }
    return null;
  },
  prePres(w, x, z) {
    if (!w.inside(x, z, 20) || w.heightAt(x, z) < w.waterLevel + 0.15) return false;
    if (game.biomeAt([x, 0, z]) !== 'plaine') return false;
    if (w.normalAt(x, z)[1] < 0.85) return false;
    return !interditDeBatir0(w, x, z) && !w.covered(x, w.heightAt(x, z) + 0.5, z);
  },
  // le peuplement (toutes les 2,5 s)
  // ce qu'il faut savoir pour décider : où est le joueur, quelle heure, quel temps
  ctx(f) {
    const w = game.world, p = game.player, P = p.pos, h = this.heure(), Lx = this.lieux(w);
    const b = game.biomeAt(P), wc = weather.cur, sec = wc.rain < 0.15, beau = sec && ['clear', 'heat', 'cloudy'].includes(weather.state);
    const froid = (typeof vallee !== 'undefined' && vallee.snowK > 0.15) || wc.frost > 0.4;
    const dF = Lx.ferme ? Math.hypot(P[0] - Lx.ferme.x, P[2] - Lx.ferme.z) : 1e9, dV = Lx.ville ? Math.max(Math.abs(P[0] - Lx.ville.x), Math.abs(P[2] - Lx.ville.z)) : 1e9;
    return { w, P, h, b, sec, beau, froid, dF, dV, L: Lx, f: f || null, pluie: wc.rain, vent: weather.windAngle || 0, nuit: game.sky ? game.sky.night : 0, jour: farm.s.day };
  },
  // faire naître une espèce tout de suite, là où elle naîtrait (pour les essais) ; renvoie le groupe, ou null
  naitre(kind) {
    const E = E1_PEUPLE[kind];
    if (!E || !game.world || !farm.s) return null;
    const n0 = this.actifs.length;
    try { E.nait(this.ctx(null), this); } catch (err) { console.error(err); }
    return this.actifs.length > n0 ? this.actifs[this.actifs.length - 1] : null;
  },
  peupler(eye, f) {
    const p = game.player, ctx = this.ctx(f), P = ctx.P;
    // ceux qui s'en vont, ceux qui sont trop loin, ceux qui sont morts
    for (const G of this.actifs.slice()) {
      G.ents = G.ents.filter((e) => !e.removed);
      for (const e of G.ents) if (e.dead && !e.plumes && !e.corpse) { e.plumes = true; this.mort(e); }
      const vivants = G.ents.filter((e) => !e.dead);
      if (!vivants.length) { if (!G.ents.some((e) => e.corpse)) this.retirer(G); else { const i = this.actifs.indexOf(G); if (i >= 0) this.actifs.splice(i, 1); } continue; }
      const loin = vivants.every((e) => Math.hypot(e.x - P[0], e.z - P[2]) > (G.loin || 200));
      const E = E1_PEUPLE[G.kind];
      if (loin) { this.retirer(G); continue; }
      if (!G.part && (game.time > G.fin || !this.convient(G.kind, E, ctx, true))) G.part = true;
      if (G.part) { G.partT = (G.partT || 0) + 2.5; if (G.partT > 40 || vivants.every((e) => e.hidden || e.dist > 70)) this.retirer(G); }
    }
    if (p.underground || (typeof mondes !== 'undefined' && mondes.cur) || strange.inEnvers() || strange.redNight() || game.mode !== 'play') return;
    if (this.actifs.length >= E1_BUDGET.groupes || this.compte() >= E1_BUDGET.betes) return;
    // une espèce au hasard parmi celles qui conviennent : chacune a sa chance de paraître (sa part du temps)
    const cand = [];
    for (const kind in E1_PEUPLE) {
      const E = E1_PEUPLE[kind];
      if (this.actifs.some((G) => G.kind === kind)) continue;
      if (!this.convient(kind, E, ctx)) continue;
      const f0 = E.part ?? E1_PART[E1_ESPECES.find((x) => x[0] === kind)[3]], vie = (E.vie[0] + E.vie[1]) / 2;
      const r = f0 >= 0.99 ? 1 : f0 / (vie * (1 - f0)); // naissances par seconde, pour que l'espèce soit là f0 du temps
      if (Math.random() < 1 - Math.exp(-r * 2.5 * (E.soir && this.soirAHannetons() ? 3 : 1))) cand.push(kind);
    }
    if (!cand.length) return;
    const kind = cand[(Math.random() * cand.length) | 0], E = E1_PEUPLE[kind];
    try { E.nait(ctx, this); } catch (err) { console.error(err); }
  },
  convient(kind, E, ctx, deja) {
    if (!E.ou(ctx) && !(deja && E.ou({ ...ctx, large: true }))) return false;
    if (!this.dans(ctx.h, E.h)) return false;
    if (E.meteo === 'sec' && !ctx.sec) return false;
    if (E.meteo === 'beau' && !ctx.beau) return false;
    if (E.meteo === 'humide' && !(ctx.pluie > 0.1 || this.aPlu())) return deja;
    if (E.chaud && ctx.froid) return false;
    if (E.calme && (weather.cur.storm > 0.3 || ctx.pluie > 0.4)) return false;
    return true;
  },
  // a-t-il plu ces deux dernières heures ? (les escargots sortent)
  pluieT: -1e9,
  aPlu() { return game.time - this.pluieT < JOUR_SECONDES / 12; },
  // un soir sur quatre est un soir à hannetons (d'après la graine et le jour)
  soirAHannetons() { const s = farm.s; return s && ((Math.imul((s.seed | 0) ^ 0x4a17, 2654435761) ^ (s.day * 7919)) >>> 0) % 4 === 0; },
  // une bête morte : des plumes qui volent (les oiseaux), un peu de poussière
  mort(e) {
    if (e.cfg.oiseau) { const c = e.kind === 'choucas' || e.kind === 'freux' ? [0.1, 0.1, 0.12, 1] : [0.55, 0.48, 0.4, 1]; for (let k = 0; k < 10; k++) particles.spawn(e.x, e.y + 0.15, e.z, (Math.random() - 0.5) * 1.4, 0.4 + Math.random() * 0.8, (Math.random() - 0.5) * 1.4, c, 0.05, 2.5 + Math.random() * 2, -0.3, false); }
    if (e.kind === 'grillon_foyer') { const E = this.S(); if (E) { E.grillon.mort = farm.s.day; E.grillon.dit = 0; } }
    if (e.kind === 'hirondelle_f') this.pense('hirondelle', '(On dit que tuer une hirondelle porte malheur à toute la maison.)', 4);
    if (e.kind === 'epeire' && e.toile) { const E = this.S(); if (E) E.toiles[e.toile.id] = farm.s.day + 4; }
  },

  // ============================================================== les cris
  cri(e, cle, k, portee) {
    if (!sound.ok || !sound.tb || !sound.B) return;
    const p = game.player.pos, d = Math.hypot(e.x - p[0], e.z - p[2]), Pt = portee || 70;
    if (d > Pt) return;
    const T = SoundEngine.TAMPONS, sKey = E1_CHANT_S[e.kind];
    let key = cle;
    if (sKey && cle === 'e1_' + e.kind && T[sKey]) key = sKey;
    if (!T[key]) return;
    const n = (SoundEngine.VARIANTES && SoundEngine.VARIANTES[key]) || 3, b = sound.tb(key, n);
    const vol = (SoundEngine.VOL_OISEAUX[key] || E1_VOL[key] || 0.04) * clamp(k === undefined ? 1 : k, 0, 1.5) * (0.85 + Math.random() * 0.3);
    const out = sound.en3d([e.x, e.y + Math.max(0.1, e.h * 0.6), e.z], sound.B.amb.inp, { ref: e.cfg.oiseau ? 7 : 3, roll: 0.9, dur: b.duration + 0.3 });
    const t = sound.at(0.01), rate = (e.voix || 1) * (0.96 + Math.random() * 0.08);
    sound.jouer(b, t, vol, out, rate);
    if (e.cfg.oiseau) sound.oiseauxFin = Math.max(sound.oiseauxFin || 0, t + b.duration / rate);
  },
  // un cri d'oiseau attend qu'aucun autre ne chante (comme ceux du décor)
  criOiseau(e, cle, k, portee) { if (sound.ctx && (sound.oiseauxFin || 0) > sound.ctx.currentTime + 0.3) return false; this.cri(e, cle, k, portee); return true; },
  // un son posé (pas une bête : un toit, un âtre)
  son(pos, cle, k, ref) {
    if (!sound.ok || !sound.tb || !sound.B || !SoundEngine.TAMPONS[cle]) return;
    const b = sound.tb(cle, 3), out = sound.en3d(pos, sound.B.amb.inp, { ref: ref || 3, roll: 0.9, dur: b.duration + 0.3 });
    sound.jouer(b, sound.at(0.01), (E1_VOL[cle] || 0.03) * (k ?? 1) * (0.85 + Math.random() * 0.3), out, 0.95 + Math.random() * 0.1);
  },
};
// (zones où l'on ne bâtit pas : villes, lieux-dits ; les bêtes des prés n'y naissent pas)
function interditDeBatir0(w, x, z) { try { return typeof interditDeBatir === 'function' && !!interditDeBatir(x, z, 0); } catch (err) { return false; } }

// ============================================================================
//  QUI, OÙ, QUAND (ou : le milieu ; h : les heures ; meteo : sec, beau, humide ; vie : combien de temps le groupe
//  reste, en secondes ; part : la part du temps où elle est là (sinon : selon la rareté) ; nait : la naissance)
// ============================================================================
const E1_PRES = (c) => c.b === 'plaine';
const E1_FERME = (c) => c.L.ferme && (c.b === 'ferme' || c.dF < (c.large ? 130 : 70));
const E1_VILLE = (c) => c.L.ville && (c.b === 'ville' || c.dV < (c.large ? 150 : 90));
const E1_PEUPLE = {
  // ------------------------------------------------------------------ les prés
  crecerelle: { ou: (c) => E1_PRES(c) || (c.b === 'ferme' && !c.large), h: [7, 19.5], meteo: 'sec', vie: [150, 320], nait(c, M) {
    const pt = M.autour(c.P, 50, 110, (x, z) => M.prePres(c.w, x, z)); if (!pt) return;
    const G = M.groupe('crecerelle', { cx: pt[0], cz: pt[1] }); const e = M.ajouter(G, pt[0], pt[1], E1V.sol(c.w, pt[0], pt[1]) + 15); e.mo = 'tourne';
  } },
  buse: { ou: E1_PRES, h: [8, 18.5], meteo: 'sec', vie: [180, 400], nait(c, M) {
    const pt = M.autour(c.P, 40, 120, (x, z) => M.prePres(c.w, x, z)); if (!pt) return;
    const G = M.groupe('buse', { cx: pt[0], cz: pt[1] }); const e = M.ajouter(G, pt[0], pt[1], E1V.sol(c.w, pt[0], pt[1]) + 38); e.mo = 'plane'; e.ang = Math.random() * TAU; e.rayon = 22 + Math.random() * 16;
  } },
  caille: { ou: (c) => E1_PRES(c) || c.b === 'ferme', h: [4, 23], vie: [200, 420], nait(c, M) {
    const pt = M.autour(c.P, 12, 45, (x, z) => M.prePres(c.w, x, z), c.f); if (!pt) return;
    const G = M.groupe('caille'); const e = M.ajouter(G, pt[0], pt[1]); e.mo = 'tapie'; e.hidden = true;
  } },
  vanneau: { ou: E1_PRES, h: [6, 19], vie: [200, 380], nait(c, M) {
    // des prés humides : près de l'eau, ou bas
    const pt = M.autour(c.P, 60, 130, (x, z) => M.prePres(c.w, x, z) && (c.w.heightAt(x, z) < c.w.waterLevel + 3 || E1V.eauPres(c.w, x, z, 40)), c.f)
      || (Math.random() < 0.4 && M.autour(c.P, 70, 130, (x, z) => M.prePres(c.w, x, z) && c.w.normalAt(x, z)[1] > 0.95, c.f)); // (ou un grand pré plat, un labour)
    if (!pt) return;
    const G = M.groupe('vanneau', { cx: pt[0], cz: pt[1], mo: 'sol', cri: 'e1_vanneau', fuite: 26, haut: [7, 16] });
    const n = 4 + ((Math.random() * 5) | 0); for (let k = 0; k < n; k++) M.ajouter(G, pt[0] + (Math.random() - 0.5) * 9, pt[1] + (Math.random() - 0.5) * 9);
  } },
  outarde: { ou: E1_PRES, h: [6, 20], meteo: 'sec', vie: [180, 300], nait(c, M) {
    const pt = M.autour(c.P, 90, 150, (x, z) => M.prePres(c.w, x, z) && c.w.normalAt(x, z)[1] > 0.95, c.f); if (!pt) return;
    const G = M.groupe('outarde', { cx: pt[0], cz: pt[1], mo: 'sol', fuite: 48, haut: [6, 14], alertes: 0 });
    const n = 1 + ((Math.random() * 3) | 0); for (let k = 0; k < n; k++) { const e = M.ajouter(G, pt[0] + (Math.random() - 0.5) * 8, pt[1] + (Math.random() - 0.5) * 8, null, { v: k }); e.voix = 0.95 + Math.random() * 0.1; }
  } },
  belette: { ou: (c) => E1_PRES(c) || c.b === 'ferme', h: [6, 21], vie: [120, 240], nait(c, M) {
    const pt = M.autour(c.P, 22, 55, (x, z) => M.prePres(c.w, x, z) || (c.b === 'ferme' && c.w.heightAt(x, z) > c.w.waterLevel + 0.2), c.f); if (!pt) return;
    const G = M.groupe('belette'); M.ajouter(G, pt[0], pt[1]).mo = 'erre';
  } },
  campagnol_champs: { ou: E1_PRES, h: [0, 24], vie: [150, 300], nait(c, M) {
    const pt = M.autour(c.P, 14, 40, (x, z) => M.prePres(c.w, x, z), c.f); if (!pt) return;
    const G = M.groupe('campagnol_champs', { cx: pt[0], cz: pt[1] });
    for (let k = 0; k < 2 + ((Math.random() * 3) | 0); k++) M.ajouter(G, pt[0] + (Math.random() - 0.5) * 4, pt[1] + (Math.random() - 0.5) * 4).mo = 'erre';
  } },
  hanneton: { ou: (c) => E1_PRES(c) || c.b === 'ferme' || (c.L.ferme && c.dF < 70), h: [19.3, 21.6], meteo: 'sec', chaud: true, calme: true, soir: true, vie: [120, 200], nait(c, M) {
    const arbres = []; c.w.query(c.P[0], c.P[2], 60, (o) => { if (o && !o.gone && E1_ARBRES.has(OBJ_TYPES[o.t].id) && Math.hypot(o.x - c.P[0], o.z - c.P[2]) > 8) arbres.push(o); }, null);
    if (!arbres.length) return;
    const a = arbres[(Math.random() * arbres.length) | 0], y0 = c.w.objectY(a);
    const G = M.groupe('hanneton', { cx: a.x, cz: a.z, cy: y0 + Math.min(4, (a.h || 5) * 0.5) });
    const n = M.soirAHannetons() ? 7 + ((Math.random() * 5) | 0) : 2 + ((Math.random() * 3) | 0);
    for (let k = 0; k < n; k++) { const e = M.ajouter(G, a.x + (Math.random() - 0.5) * 4, a.z + (Math.random() - 0.5) * 4, G.cy + (Math.random() - 0.5) * 2); e.mo = 'vole'; e.ang = Math.random() * TAU; e.rayon = 1 + Math.random() * 3; e.fly = 1; }
  } },
  sauterelle: { ou: E1_PRES, h: [11, 21.5], meteo: 'sec', chaud: true, vie: [160, 300], nait(c, M) {
    const pt = M.autour(c.P, 8, 26, (x, z) => M.prePres(c.w, x, z), c.f); if (!pt) return;
    const G = M.groupe('sauterelle');
    for (let k = 0; k < 2 + ((Math.random() * 2) | 0); k++) M.ajouter(G, pt[0] + (Math.random() - 0.5) * 6, pt[1] + (Math.random() - 0.5) * 6, null, { v: k }).mo = 'herbe';
  } },
  machaon: { ou: E1_PRES, h: [10, 17], meteo: 'beau', chaud: true, calme: true, vie: [90, 180], nait(c, M) {
    const pt = M.autour(c.P, 14, 35, (x, z) => M.prePres(c.w, x, z)); if (!pt) return;
    const G = M.groupe('machaon'); const e = M.ajouter(G, pt[0], pt[1], E1V.sol(c.w, pt[0], pt[1]) + 1); e.mo = 'danse'; e.fly = 1;
  } },
  // ------------------------------------------------------------------ la ferme
  cheveche: { ou: E1_FERME, h: [17.5, 8], vie: [240, 480], nait(c, M) {
    const L = c.L.ferme; if (!L.perchoirs.length) return;
    const pr = L.perchoirs[(Math.random() * L.perchoirs.length) | 0];
    const G = M.groupe('cheveche', { loin: 220 }); const e = M.ajouter(G, pr.x, pr.z, pr.y); e.mo = 'perche'; e.perche = pr; e.heading = pr.cap;
  } },
  putois: { ou: E1_FERME, h: [21.5, 4.5], vie: [120, 240], nait(c, M) {
    const L = c.L.ferme, m = L.murs[(Math.random() * L.murs.length) | 0]; if (!m) return;
    const a = Math.random() * TAU, x = m.x + Math.sin(a) * 18, z = m.z + Math.cos(a) * 18;
    if (c.w.heightAt(x, z) < c.w.waterLevel + 0.2 || Math.hypot(x - c.P[0], z - c.P[2]) < 20) return;
    const G = M.groupe('putois', { cible: m }); M.ajouter(G, x, z).mo = 'rode';
  } },
  lerot: { ou: (c) => E1_FERME(c), h: [21, 5], vie: [150, 300], nait(c, M) {
    const L = c.L.ferme; if (!L.maison) return;
    const G = M.groupe('lerot'); const p = M.surMur(L.maison, Math.random, 0); if (!p) return;
    const e = M.ajouter(G, p.x, p.z, p.y); e.mo = 'mur'; e.mur = p;
  } },
  rat_noir: { ou: E1_FERME, h: [19, 6], vie: [150, 300], nait(c, M) {
    const L = c.L.ferme; if (!L.murs.length) return;
    const G = M.groupe('rat_noir');
    for (let k = 0; k < 1 + ((Math.random() * 3) | 0); k++) { const p = L.murs[(Math.random() * L.murs.length) | 0]; if (Math.hypot(p.x - c.P[0], p.z - c.P[2]) < 6) continue; const e = M.ajouter(G, p.x, p.z); e.mo = 'longe'; e.mur = p; }
  } },
  bergeronnette: { ou: E1_FERME, h: [6.5, 19.5], vie: [150, 300], nait(c, M) {
    const L = c.L.ferme, a = Math.random() * TAU, d = 6 + Math.random() * 14, x = L.x + Math.sin(a) * d, z = L.z + Math.cos(a) * d;
    if (c.w.heightAt(x, z) < c.w.waterLevel + 0.1 || Math.hypot(x - c.P[0], z - c.P[2]) < 7) return;
    const G = M.groupe('bergeronnette', { cx: x, cz: z });
    for (let k = 0; k < 1 + ((Math.random() * 2) | 0); k++) M.ajouter(G, x + (Math.random() - 0.5) * 3, z + (Math.random() - 0.5) * 3).mo = 'trotte';
  } },
  etourneau: { ou: (c) => E1_FERME(c) || E1_PRES(c), h: [7, 18.5], vie: [200, 360], nait(c, M) {
    const L = c.L.ferme, pres = L && c.dF < 140;
    const pt = pres ? M.autour([L.x, 0, L.z], 18, 70, (x, z) => c.w.heightAt(x, z) > c.w.waterLevel + 0.2 && !c.w.covered(x, c.w.heightAt(x, z) + 0.5, z) && Math.hypot(x - c.P[0], z - c.P[2]) > 16)
      : M.autour(c.P, 50, 110, (x, z) => M.prePres(c.w, x, z), c.f);
    if (!pt) return;
    const G = M.groupe('etourneau', { cx: pt[0], cz: pt[1], mo: 'sol', cri: 'e1_etourneau', fuite: 15, haut: [6, 14], serre: true });
    const n = 7 + ((Math.random() * 6) | 0); for (let k = 0; k < n; k++) M.ajouter(G, pt[0] + (Math.random() - 0.5) * 7, pt[1] + (Math.random() - 0.5) * 7, null, { v: k });
  } },
  esculape: { ou: (c) => E1_FERME(c) || E1_PRES(c), h: [9.5, 18], meteo: 'beau', chaud: true, vie: [150, 280], nait(c, M) {
    const L = c.L.ferme, p = L && c.dF < 90 && L.pierres.length ? L.pierres[(Math.random() * L.pierres.length) | 0] : null;
    let x, z, y;
    if (p) { x = p.x; z = p.z; y = p.y; }
    else { const pt = M.autour(c.P, 18, 45, (x, z) => M.prePres(c.w, x, z), c.f); if (!pt) return; [x, z] = pt; }
    if (Math.hypot(x - c.P[0], z - c.P[2]) < 8) return;
    const G = M.groupe('esculape'); const e = M.ajouter(G, x, z, y); e.mo = 'soleil'; e.heading = Math.random() * TAU;
  } },
  frelon: { ou: (c) => c.L.ferme && c.L.ferme.nid && Math.hypot(c.P[0] - c.L.ferme.nid.x, c.P[2] - c.L.ferme.nid.z) < 90, h: [8, 20], meteo: 'sec', chaud: true, part: 1, vie: [600, 900], nait(c, M) {
    const N = c.L.ferme.nid; if (!e1.nidActif()) return;
    const G = M.groupe('frelon', { nid: N, loin: 120 });
    for (let k = 0; k < 4; k++) { const e = M.ajouter(G, N.x + (Math.random() - 0.5), N.z + (Math.random() - 0.5), N.y - 0.3); e.mo = 'ronde'; e.ang = Math.random() * TAU; e.rayon = 0.6 + Math.random() * 3; e.fly = 1; }
  } },
  grillon_foyer: { ou: (c) => (c.L.ferme && c.L.ferme.foyer && Math.hypot(c.P[0] - c.L.ferme.foyer.x, c.P[2] - c.L.ferme.foyer.z) < 14) || (c.L.ville && c.L.ville.four && Math.hypot(c.P[0] - c.L.ville.four.x, c.P[2] - c.L.ville.four.z) < 14),
    h: [20, 5], part: 0.5, vie: [200, 400], nait(c, M) {
      const L = c.L.ferme && c.L.ferme.foyer && Math.hypot(c.P[0] - c.L.ferme.foyer.x, c.P[2] - c.L.ferme.foyer.z) < 14 ? c.L.ferme.foyer : c.L.ville.four;
      if (L === (c.L.ferme && c.L.ferme.foyer) && !e1.grillonVit()) return;
      const a = L.r + (Math.random() - 0.5) * 1.2, x = L.x + Math.sin(a) * 0.75, z = L.z + Math.cos(a) * 0.75;
      const G = M.groupe('grillon_foyer', { foyer: L, loin: 40 }); const e = M.ajouter(G, x, z, L.y + 0.02); e.mo = 'foyer'; e.heading = a + Math.PI;
    } },
  epeire: { ou: (c) => c.L.ferme && c.L.ferme.toiles.length && c.dF < 75, h: [0, 24], part: 1, vie: [3000, 4000], nait(c, M) {
    const E = M.S(), G = M.groupe('epeire', { loin: 110 });
    for (const T of c.L.ferme.toiles) { if ((E.toiles[T.id] || -1) >= farm.s.day) continue; const e = M.ajouter(G, T.x, T.z, T.y); e.mo = 'toile'; e.toile = T; e.heading = T.r; }
    if (!G.ents.length) M.retirer(G);
  } },
  // ------------------------------------------------------------------ la ville
  hirondelle_f: { ou: (c) => E1_VILLE(c) && c.L.ville.nids.length, h: [6.5, 20], chaud: true, vie: [300, 500], part: 0.8, nait(c, M) {
    const V = c.L.ville, N = V.nids, cx = N.reduce((a, n) => a + n.x, 0) / N.length, cz = N.reduce((a, n) => a + n.z, 0) / N.length;
    const G = M.groupe('hirondelle_f', { cx, cz, cy: N[0].y, loin: 200 });
    for (let k = 0; k < 6 + ((Math.random() * 4) | 0); k++) { const e = M.ajouter(G, cx + (Math.random() - 0.5) * 20, cz + (Math.random() - 0.5) * 20, N[0].y + 3 + Math.random() * 6); e.mo = 'boucle'; e.fly = 1; e.ang = Math.random() * TAU; e.rayon = 6 + Math.random() * 10; e.haut = 3 + Math.random() * 8; e.sens = Math.random() < 0.5 ? 1 : -1; }
  } },
  choucas: { ou: (c) => E1_VILLE(c) && c.L.ville.clocher, h: [6, 20.5], vie: [300, 500], nait(c, M) {
    const C = c.L.ville.clocher, G = M.groupe('choucas', { cx: C.x, cz: C.z, loin: 220 });
    for (let k = 0; k < 4 + ((Math.random() * 4) | 0); k++) { const pc = C.coins[k % 4]; const e = M.ajouter(G, pc.x + (Math.random() - 0.5) * 0.6, pc.z + (Math.random() - 0.5) * 0.6, pc.y, { v: k }); e.mo = 'clocher'; e.perche = pc; e.t1 = 4 + Math.random() * 30; }
  } },
  freux: { ou: (c) => c.L.ville && c.L.ville.corbeautiere && (E1_VILLE(c) || Math.hypot(c.P[0] - c.L.ville.corbeautiere.x, c.P[2] - c.L.ville.corbeautiere.z) < 180), h: [6.5, 20], vie: [300, 500], nait(c, M) {
    const C = c.L.ville.corbeautiere, h = c.h;
    if (h >= 17.5) { // le soir : à la corbeautière, sur les nids, en criant
      const G = M.groupe('freux', { cx: C.x, cz: C.z, mo: 'corbeautiere', loin: 220 });
      for (let k = 0; k < 6 + ((Math.random() * 5) | 0); k++) { const n = C.nids[k % C.nids.length]; const e = M.ajouter(G, n.x + (Math.random() - 0.5), n.z + (Math.random() - 0.5), n.y + 0.2, { v: k }); e.mo = 'nid'; e.perche = n; }
      return;
    }
    const pt = M.autour([C.x, 0, C.z], 30, 160, (x, z) => M.prePres(c.w, x, z) && Math.hypot(x - c.P[0], z - c.P[2]) > 35); if (!pt) return;
    const G = M.groupe('freux', { cx: pt[0], cz: pt[1], mo: 'sol', cri: 'e1_freux', fuite: 32, haut: [8, 18], loin: 260 });
    for (let k = 0; k < 5 + ((Math.random() * 5) | 0); k++) M.ajouter(G, pt[0] + (Math.random() - 0.5) * 12, pt[1] + (Math.random() - 0.5) * 12, null, { v: k });
  } },
  pelerin: { ou: (c) => E1_VILLE(c) && c.L.ville.clocher, h: [7, 19], vie: [300, 600], nait(c, M) {
    const C = c.L.ville.clocher, G = M.groupe('pelerin', { loin: 260 });
    const e = M.ajouter(G, C.x, C.z, C.pointe + 0.02); e.mo = 'flèche'; e.t1 = 40 + Math.random() * 90; e.heading = Math.random() * TAU;
  } },
  petit_duc: { ou: (c) => E1_VILLE(c) && c.L.ville.arbres.length, h: [20.5, 5], chaud: true, vie: [300, 600], nait(c, M) {
    const A = c.L.ville.arbres, a = A[(Math.random() * Math.min(5, A.length)) | 0];
    const G = M.groupe('petit_duc', { loin: 200 }); const t = Math.random() * TAU;
    const pr = { x: a.x + Math.sin(t) * 0.5, z: a.z + Math.cos(t) * 0.5, y: a.y + a.h * 0.58, cap: t, arbre: true };
    const e = M.ajouter(G, pr.x, pr.z, pr.y); e.mo = 'perche'; e.perche = pr; e.heading = t;
  } },
  surmulot: { ou: (c) => E1_VILLE(c) && (c.L.ville.douves.length || c.L.ville.lavoir), h: [19, 6], vie: [150, 300], nait(c, M) {
    const V = c.L.ville, cand = V.douves.slice(); if (V.lavoir) cand.push({ x: V.lavoir.x + 3, z: V.lavoir.z + 2, y: V.lavoir.y });
    const p = cand.filter((q) => Math.hypot(q.x - c.P[0], q.z - c.P[2]) > 10).sort(() => Math.random() - 0.5)[0]; if (!p) return;
    const G = M.groupe('surmulot');
    for (let k = 0; k < 1 + ((Math.random() * 2) | 0); k++) { const e = M.ajouter(G, p.x + (Math.random() - 0.5) * 2, p.z + (Math.random() - 0.5) * 2); e.mo = 'berge'; e.berge = p; }
  } },
  fouine: { ou: (c) => (E1_VILLE(c) && c.L.ville.toits.length) || (E1_FERME(c) && c.L.ferme.maison), h: [22, 4.5], vie: [150, 300], nait(c, M) {
    const V = c.L.ville, F = c.L.ferme, toits = E1_VILLE(c) ? V.toits : [{ a: F.maison.faiteA, b: F.maison.faiteB, y: F.maison.faite + 0.02 }];
    const T = toits[(Math.random() * toits.length) | 0];
    const G = M.groupe('fouine', { toits }); const e = M.ajouter(G, T.a[0], T.a[1], T.y); e.mo = 'toit'; e.toit = T; e.u = 0; e.sens = 1;
  } },
  alyte: { ou: (c) => (E1_VILLE(c) && (c.L.ville.lavoir || c.L.ville.murs.length)) || (E1_FERME(c) && c.L.ferme.murs.length), h: [20.5, 4], chaud: true, vie: [200, 400], nait(c, M) {
    const V = E1_VILLE(c) ? c.L.ville : c.L.ferme, base = V.lavoir && Math.random() < 0.6 ? V.lavoir : V.murs[(Math.random() * V.murs.length) | 0];
    if (!base || Math.hypot(base.x - c.P[0], base.z - c.P[2]) < 8) return;
    const G = M.groupe('alyte');
    for (let k = 0; k < 2 + ((Math.random() * 3) | 0); k++) { const x = base.x + (Math.random() - 0.5) * 6, z = base.z + (Math.random() - 0.5) * 6; if (c.w.heightAt(x, z) < c.w.waterLevel + 0.05) continue; const e = M.ajouter(G, x, z, null, { v: k }); e.mo = 'flute'; e.voix = 0.82 + Math.random() * 0.36; }
    if (!G.ents.length) M.retirer(G);
  } },
  grand_paon: { ou: (c) => E1_VILLE(c) && c.L.ville.reverberes.length, h: [21, 3], meteo: 'sec', calme: true, vie: [180, 360], nait(c, M) {
    const R = c.L.ville.reverberes.filter((r) => Math.hypot(r.x - c.P[0], r.z - c.P[2]) > 6), r = R[(Math.random() * R.length) | 0]; if (!r) return;
    const G = M.groupe('grand_paon', { lampe: r }); const e = M.ajouter(G, r.x + 0.6, r.z, r.y); e.mo = 'lampe'; e.fly = 1; e.ang = 0;
  } },
  escargot: { ou: (c) => (E1_VILLE(c) && c.L.ville.murs.length) || (E1_FERME(c) && c.L.ferme.murs.length), h: [0, 24], meteo: 'humide', vie: [250, 450], nait(c, M) {
    if (!(c.nuit > 0.4 || c.pluie > 0.1 || M.aPlu())) return;
    const V = E1_VILLE(c) ? c.L.ville : c.L.ferme, G = M.groupe('escargot');
    for (let k = 0; k < 3 + ((Math.random() * 4) | 0); k++) {
      const m = V.murs[(Math.random() * V.murs.length) | 0]; if (!m || Math.hypot(m.x - c.P[0], m.z - c.P[2]) < 4) continue;
      const mur = Math.random() < 0.6, e = M.ajouter(G, m.x, m.z, mur ? m.y + 0.2 + Math.random() * 1.1 : null, { v: k });
      e.mo = 'rampe'; e.mur = mur ? m : null; e.grimpe = mur; e.heading = mur ? m.cap + Math.PI : Math.random() * TAU;
    }
    if (!G.ents.length) M.retirer(G);
  } },
};

// ============================================================================
//  LES CONDUITES
// ============================================================================
const E1V = {
  sol(w, x, z) { return Math.max(w.heightAt(x, z), w.waterLevel); },
  eauPres(w, x, z, r) { for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; if (w.heightAt(x + Math.sin(a) * r, z + Math.cos(a) * r) < w.waterLevel - 0.3) return true; } return false; },
  // vole vers (x, y, z) à la vitesse v ; renvoie la distance qui reste
  vers(e, x, y, z, v, dt, tourne) {
    const dx = x - e.x, dy = y - e.y, dz = z - e.z, d = Math.hypot(dx, dy, dz) || 1e-6, k = Math.min(1, v * dt / d);
    e.x += dx * k; e.y += dy * k; e.z += dz * k;
    if (Math.hypot(dx, dz) > 0.02) e.heading = turnToward(e.heading, Math.atan2(dx, dz), dt * (tourne || 5));
    return d * (1 - k);
  },
  // au sol : marche vers une cible (e.tgt) ; pauses ; e.move et e.phase pour les pattes
  marche(e, dt, w, v) {
    const x0 = e.x, z0 = e.z;
    entities.stepMove(e, dt, w, v);
    const m = Math.hypot(e.x - x0, e.z - z0);
    e.move = lerp(e.move || 0, m > v * dt * 0.3 ? 1 : 0, Math.min(1, dt * 8)); e.run = v > e.cfg.walk * 1.5;
    e.phase += dt * v / Math.max(0.03, e.h) * 0.9;
    return m > v * dt * 0.25;
  },
  erre(e, dt, w, o) {
    if (e.pauseT > 0) { e.pauseT -= dt; e.move = lerp(e.move || 0, 0, Math.min(1, dt * 6)); return 'pause'; }
    if (!e.tgt) { const a = Math.random() * TAU, rr = Math.sqrt(Math.random()) * o.r; e.tgt = [(o.cx ?? e.hx) + Math.cos(a) * rr, (o.cz ?? e.hz) + Math.sin(a) * rr]; }
    const dx = e.tgt[0] - e.x, dz = e.tgt[1] - e.z, d = Math.hypot(dx, dz);
    if (d < 0.12 || (e.erreT = (e.erreT || 0) + dt) > 12) { e.tgt = null; e.erreT = 0; e.pauseT = lerp(o.pause[0], o.pause[1], Math.random()); return 'arrive'; }
    e.heading = turnToward(e.heading, Math.atan2(dx, dz), dt * 7);
    if (!this.marche(e, dt, w, o.v)) { e.tgt = null; e.pauseT = 0.5; }
    return 'marche';
  },
  fuit(e, dt, w, c, v, deX, deZ) {
    e.heading = turnToward(e.heading, Math.atan2(e.x - (deX ?? c.px), e.z - (deZ ?? c.pz)), dt * 8);
    if (!this.marche(e, dt, w, v)) e.heading += (Math.random() - 0.5) * 2;
  },
  alerte(e, c, r) { return e.peurT > 0 || e.dist < r * (c.crouch ? 0.5 : 1) * (c.sprint ? 1.4 : 1); },
  // au point le plus proche d'un arbre (une perche dans la couronne)
  arbre(w, x, z, R, loin) {
    const L = [];
    w.query(x, z, R, (o) => { if (o && !o.gone && E1_ARBRES.has(OBJ_TYPES[o.t].id) && (!loin || Math.hypot(o.x - loin.x, o.z - loin.z) > 6)) L.push(o); }, null);
    if (!L.length) return null;
    const o = L[(Math.random() * L.length) | 0], t = Math.random() * TAU;
    return { x: o.x + Math.sin(t) * 0.5, z: o.z + Math.cos(t) * 0.5, y: w.objectY(o) + (o.h || 6) * (0.5 + Math.random() * 0.2), cap: t, arbre: true };
  },
};
const E1_CONDUITES = {
  // ---------------------------------------------------------------- la crécerelle : tourne, fait le Saint-Esprit, tombe dans l'herbe
  crecerelle(e, dt, w, c) {
    const G = e.G, sol = E1V.sol(w, e.x, e.z);
    e.t1 -= dt;
    if (G && G.part && e.mo !== 'part') { e.mo = 'part'; e.cible = [e.x + Math.sin(e.heading) * 300, sol + 40, e.z + Math.cos(e.heading) * 300]; }
    switch (e.mo) {
      case 'tourne': {
        if (!e.cible) { const a = Math.random() * TAU, d = 15 + Math.random() * 45, x = (G.cx ?? e.x) + Math.sin(a) * d, z = (G.cz ?? e.z) + Math.cos(a) * d; e.cible = [x, E1V.sol(w, x, z) + 12 + Math.random() * 7, z]; }
        e.fly = 1; e.volM = Math.sin(c.t * 0.7 + e.seed) > 0.3 ? 'glisse' : 'bat';
        if (E1V.vers(e, e.cible[0], e.cible[1], e.cible[2], 6.5, dt, 2.5) < 0.6) { e.mo = 'surplace'; e.t1 = 5 + Math.random() * 7; e.cible = null; e.y0 = e.y; }
        break;
      }
      case 'surplace': { // face au vent, la queue ouverte, les ailes qui battent sans avancer
        e.fly = 1; e.volM = 'surplace';
        e.heading = turnToward(e.heading, (weather.windAngle || 0) + Math.PI, dt * 2);
        e.y = e.y0 + Math.sin(c.t * 1.3 + e.seed) * 0.15;
        e.lookY = 0;
        if (e.t1 <= 0) { if (Math.random() < 0.45) { e.mo = 'pique'; e.cible = [e.x + (Math.random() - 0.5) * 2, sol, e.z + (Math.random() - 0.5) * 2]; } else e.mo = 'tourne'; }
        if (e.t1 < 4 && e.t1 > 3.9 && Math.random() < 0.3) e1.criOiseau(e, 'e1_crecerelle', 0.8);
        break;
      }
      case 'pique': {
        e.fly = 1; e.volM = 'pique';
        if (E1V.vers(e, e.cible[0], e.cible[1] + 0.05, e.cible[2], 14, dt, 6) < 0.3) { e.mo = 'proie'; e.t1 = 2 + Math.random() * 3; e.y = sol; e.fly = 0; e1.prendCampagnol(e); }
        break;
      }
      case 'proie': e.fly = 0; e.peck = true; e.y = sol; if (e.t1 <= 0 || E1V.alerte(e, c, 18)) { e.peck = false; e.mo = Math.random() < 0.35 ? 'versPerche' : 'tourne'; e.cible = null; } break;
      case 'versPerche': {
        if (!e.perche) e.perche = E1V.arbre(w, e.x, e.z, 60);
        if (!e.perche) { e.mo = 'tourne'; break; }
        e.fly = 1; e.volM = 'bat';
        if (E1V.vers(e, e.perche.x, e.perche.y, e.perche.z, 7, dt, 3) < 0.15) { e.mo = 'perche'; e.t1 = 15 + Math.random() * 30; }
        break;
      }
      case 'perche': e.fly = 0; e.x = e.perche.x; e.y = e.perche.y; e.z = e.perche.z; e.lookY = clamp(angDiff(e.heading, Math.atan2(c.px - e.x, c.pz - e.z)), -1.4, 1.4) * (e.dist < 40 ? 1 : 0);
        if (e.t1 <= 0 || E1V.alerte(e, c, 22)) { e.perche = null; e.mo = 'tourne'; e.cible = null; if (e.dist < 30) e1.criOiseau(e, 'e1_crecerelle', 0.9); } break;
      case 'part': e.fly = 1; e.volM = 'bat'; if (E1V.vers(e, e.cible[0], e.cible[1], e.cible[2], 9, dt, 2) < 1) e.hidden = true; break;
      default: e.mo = 'tourne';
    }
    if (e.fly && e.mo !== 'pique' && e.mo !== 'part') e.y = Math.max(e.y, sol + 1.5);
    return true;
  },
  // ---------------------------------------------------------------- la buse : de larges cercles en miaulant ; parfois un arbre
  buse(e, dt, w, c) {
    const G = e.G, sol = E1V.sol(w, e.x, e.z);
    e.t1 -= dt; e.criT = (e.criT ?? 8 + Math.random() * 20) - dt;
    if (G.part && e.mo !== 'part') { e.mo = 'part'; e.cible = [e.x + Math.sin(e.heading) * 400, sol + 70, e.z + Math.cos(e.heading) * 400]; }
    switch (e.mo) {
      case 'plane': {
        e.fly = 1; e.volM = Math.sin(c.t * 0.2 + e.seed) > 0.85 ? 'bat' : 'plane';
        e.ang += dt * 0.11 * (e.seed > 50 ? 1 : -1);
        const x = G.cx + Math.cos(e.ang) * e.rayon, z = G.cz + Math.sin(e.ang) * e.rayon;
        const y = Math.max(E1V.sol(w, x, z) + 30, (e.y0 ?? sol + 38));
        E1V.vers(e, x, y + Math.sin(c.t * 0.3 + e.seed) * 2, z, 7, dt, 1.5);
        if (e.criT <= 0) { e.criT = 30 + Math.random() * 45; e1.criOiseau(e, 'e1_buse', 1, 160); }
        if (e.t1 <= 0) { e.t1 = 30 + Math.random() * 40; if (Math.random() < 0.3) { e.perche = E1V.arbre(w, G.cx, G.cz, 70); if (e.perche) e.mo = 'versPerche'; } }
        break;
      }
      case 'versPerche': e.fly = 1; e.volM = 'plane'; if (E1V.vers(e, e.perche.x, e.perche.y, e.perche.z, 8, dt, 2) < 0.2) { e.mo = 'perche'; e.t1 = 30 + Math.random() * 60; } break;
      case 'perche': e.fly = 0; e.x = e.perche.x; e.y = e.perche.y; e.z = e.perche.z; e.lookY = e.dist < 50 ? clamp(angDiff(e.heading, Math.atan2(c.px - e.x, c.pz - e.z)), -1.4, 1.4) : 0;
        if (e.t1 <= 0 || E1V.alerte(e, c, 30)) { e.mo = 'plane'; e.y0 = sol + 34; if (e.dist < 40) { sound.flutter && sound.flutter(0.4, 0); e1.criOiseau(e, 'e1_buse', 1, 160); } } break;
      case 'part': e.fly = 1; e.volM = 'plane'; if (E1V.vers(e, e.cible[0], e.cible[1], e.cible[2], 9, dt, 1) < 2) e.hidden = true; break;
      default: e.mo = 'plane'; e.ang = e.ang || 0; e.rayon = e.rayon || 28;
    }
    return true;
  },
  // ---------------------------------------------------------------- la caille : cachée ; chante ; part sous les pieds
  caille(e, dt, w, c) {
    const h = e1.heure();
    e.criT = (e.criT ?? 5 + Math.random() * 20) - dt;
    if (e.mo === 'vol') {
      e.fly = 1; e.volM = 'bat'; e.hidden = false;
      const sol = w.heightAt(e.x, e.z);
      e.x += Math.sin(e.heading) * dt * 8; e.z += Math.cos(e.heading) * dt * 8; e.y = sol + 0.9 + Math.sin(e.t1 * 0.4) * 0.2;
      e.t1 -= dt;
      if (e.t1 <= 0 || w.heightAt(e.x, e.z) < w.waterLevel + 0.1) { e.mo = 'tapie'; e.fly = 0; e.y = w.heightAt(e.x, e.z); e.hidden = true; e.hx = e.x; e.hz = e.z; }
      return true;
    }
    e.hidden = true; e.fly = 0;
    if (e.criT <= 0) { e.criT = (h < 8 || h > 19 ? 20 : 45) + Math.random() * 40; if (e.dist > 6 && e.dist < 120) e1.criOiseau(e, 'e1_caille', 1, 120); }
    if (e.dist < (c.crouch ? 2.2 : 4.2) || e.peurT > 0) {
      e.peurT = 0; e.mo = 'vol'; e.t1 = 2.5 + Math.random() * 1.5; e.heading = Math.atan2(e.x - c.px, e.z - c.pz) + (Math.random() - 0.5) * 0.7;
      sound.flutter && sound.flutter(1, ((e.x - c.px) * c.right[0] + (e.z - c.pz) * c.right[2]) / (e.dist || 1));
    }
    return true;
  },
  // ---------------------------------------------------------------- les bandes au sol (vanneaux, étourneaux, freux) : elles se lèvent ensemble
  vanneau(e, dt, w, c) { return E1_CONDUITES._bande(e, dt, w, c); },
  etourneau(e, dt, w, c) { return E1_CONDUITES._bande(e, dt, w, c); },
  _bande(e, dt, w, c) {
    const G = e.G;
    if (G.majT !== c.t) { // (une fois par image et par bande : la décision commune)
      G.majT = c.t;
      if (G.mo === 'sol' && !G.part && G.ents.some((q) => !q.dead && E1V.alerte(q, c, G.fuite))) { G.mo = 'vol'; G.t = 7 + Math.random() * 7; G.ang = Math.random() * TAU; G.r = 10 + Math.random() * 12; sound.flutter && sound.flutter(1, 0); G.criT = 0; if (G.kind === 'freux' || G.kind === 'vanneau') G.alertes = (G.alertes || 0) + 1; }
      if (G.mo === 'vol') {
        G.t -= dt; G.ang += dt * (G.kind === 'vanneau' ? 0.55 : 0.8);
        G.criT = (G.criT || 0) - dt;
        if (G.criT <= 0) { G.criT = G.kind === 'etourneau' ? 3 + Math.random() * 3 : 1.6 + Math.random() * 2; const q = G.ents[(Math.random() * G.ents.length) | 0]; if (q && !q.dead) e1.cri(q, G.cri, 0.8, 120); }
        if (G.t <= 0) {
          if (G.part || (G.alertes || 0) > 3) { G.mo = 'part'; G.cible = [G.cx + Math.sin(G.ang) * 300, G.cz + Math.cos(G.ang) * 300]; }
          else { // se reposer plus loin, à l'écart du joueur
            for (let k = 0; k < 10; k++) { const a = Math.random() * TAU, d = 30 + Math.random() * 40, x = c.px + Math.sin(a) * d, z = c.pz + Math.cos(a) * d; if (w.heightAt(x, z) > w.waterLevel + 0.2 && w.normalAt(x, z)[1] > 0.85 && !w.covered(x, w.heightAt(x, z) + 0.5, z)) { G.cx = x; G.cz = z; break; } }
            G.mo = 'pose';
          }
        }
      }
      if (G.mo === 'sol' && G.part) { G.mo = 'vol'; G.t = 3; }
      if (G.mo === 'sol' && G.kind === 'etourneau') { G.bavT = (G.bavT ?? 10 + Math.random() * 20) - dt; if (G.bavT <= 0) { G.bavT = 25 + Math.random() * 40; const q = G.ents.find((x) => !x.dead); if (q) { const imite = Math.random() < 0.25; e1.criOiseau(q, imite ? (Math.random() < 0.5 ? 'e1_siffle' : 'e1_buse') : 'e1_etourneau', imite ? 0.7 : 0.9, 70); } } }
    }
    const i = G.ents.indexOf(e), n = G.ents.length, sol = w.heightAt(e.x, e.z);
    if (G.mo === 'sol') {
      e.fly = 0; e.y = entities.groundY(w, e, e.x, e.z);
      E1V.erre(e, dt, w, { r: G.serre ? 5 : 8, v: e.cfg.walk, pause: [1, 4], cx: G.cx, cz: G.cz });
      e.peck = e.pauseT > 0 && Math.sin(c.t * 1.7 + e.seed) > -0.2;
      e.lookY = 0;
      return true;
    }
    e.peck = false;
    if (G.mo === 'vol' || G.mo === 'part') {
      e.fly = 1; e.volM = G.kind === 'vanneau' ? (Math.sin(c.t * 2 + i) > 0 ? 'bat' : 'glisse') : 'bat';
      const a = G.ang + i / n * TAU * 0.35, R = G.r + (i % 3) * 1.6;
      let x = G.cx + Math.cos(a) * R, z = G.cz + Math.sin(a) * R, y = sol + G.haut[0] + (i % 4) * 1.2 + Math.sin(c.t * 0.9 + i) * 1.5;
      if (G.mo === 'part') { x = G.cible[0] + Math.cos(i) * 3; z = G.cible[1] + Math.sin(i) * 3; y = sol + G.haut[1] + 10; }
      if (E1V.vers(e, x, Math.max(y, E1V.sol(w, x, z) + 3), z, G.mo === 'part' ? 9 : 8, dt, 4) < 1 && G.mo === 'part') e.hidden = true;
      return true;
    }
    // se poser : chacun descend vers sa place
    e.fly = 1; e.volM = 'glisse';
    const tx = G.cx + Math.cos(i * 2.4) * (1 + (i % 4)), tz = G.cz + Math.sin(i * 2.4) * (1 + (i % 4)), ty = w.heightAt(tx, tz);
    if (E1V.vers(e, tx, ty, tz, 7, dt, 4) < 0.15) { e.fly = 0; e.y = ty; e.hx = tx; e.hz = tz; e.tgt = null; e.posee = true; }
    if (G.ents.every((q) => q.dead || q.posee)) { G.mo = 'sol'; for (const q of G.ents) q.posee = false; }
    return true;
  },
  // ---------------------------------------------------------------- l'outarde : se méfie de tout ; s'éloigne à pied, puis s'envole loin
  outarde(e, dt, w, c) {
    const G = e.G;
    if (G.mo === 'sol' && !G.part) {
      if (G.ents.some((q) => !q.dead && q.dist < G.fuite * (c.crouch ? 0.7 : 1))) { G.mo = 'vol'; G.t = 6 + Math.random() * 4; G.alertes = (G.alertes || 0) + 1; G.ang = Math.atan2(G.cx - c.px, G.cz - c.pz); for (const q of G.ents) if (!q.dead) { e1.cri(q, 'e1_outarde', 0.9, 90); if ((q.v | 0) % 2 === 0) e1.cri(q, 'e1_sifflet', 1, 90); } }
      else if (e.dist < G.fuite * 1.6) { e.fly = 0; E1V.fuit(e, dt, w, c, e.cfg.walk * 1.6); e.y = entities.groundY(w, e, e.x, e.z); return true; }
    }
    if (G.mo === 'vol' || G.part) {
      e.fly = 1; e.volM = 'bat';
      const i = G.ents.indexOf(e), sol = E1V.sol(w, e.x, e.z);
      G.t -= dt / Math.max(1, G.ents.length);
      const x = e.x + Math.sin(G.ang) * 10, z = e.z + Math.cos(G.ang) * 10;
      E1V.vers(e, x + i, sol + 9 + i, z, 11, dt, 2);
      if (G.t <= 0 && !G.part && G.alertes < 3) { G.mo = 'pose'; G.cx = e.x + Math.sin(G.ang) * 60; G.cz = e.z + Math.cos(G.ang) * 60; }
      if (G.part || G.alertes >= 3) { G.part = true; if (e.dist > 150) e.hidden = true; }
      return true;
    }
    if (G.mo === 'pose') {
      const i = G.ents.indexOf(e), tx = G.cx + i * 2.5, tz = G.cz + (i % 2) * 2, ty = w.heightAt(tx, tz);
      e.fly = 1; e.volM = 'glisse';
      if (E1V.vers(e, tx, ty, tz, 9, dt, 3) < 0.2) { e.fly = 0; e.hx = tx; e.hz = tz; e.posee = true; }
      if (G.ents.every((q) => q.dead || q.posee)) { G.mo = 'sol'; for (const q of G.ents) q.posee = false; }
      return true;
    }
    e.fly = 0; e.y = entities.groundY(w, e, e.x, e.z);
    E1V.erre(e, dt, w, { r: 6, v: e.cfg.walk * 0.6, pause: [2, 6], cx: G.cx, cz: G.cz });
    e.peck = e.pauseT > 0 && Math.sin(c.t * 1.2 + e.seed) > 0.3;
    return true;
  },
  // ---------------------------------------------------------------- la belette : par bonds ; se dresse ; disparaît, reparaît plus loin
  belette(e, dt, w, c) {
    e.t1 -= dt;
    if (e.cache > 0) { e.cache -= dt; e.hidden = true; if (e.cache <= 0) { if ((e.vus = (e.vus || 0) + 1) > 3 || e.G.part) { e.G.part = true; return true; } const a = Math.random() * TAU; e.x += Math.sin(a) * 6; e.z += Math.cos(a) * 6; e.y = entities.groundY(w, e, e.x, e.z); e.hidden = false; e.dresse = 0; } return true; }
    e.hidden = false;
    if (e.dist < (c.crouch ? 3 : 6)) { e.cache = 6 + Math.random() * 8; e1.cri(e, 'e1_froisse', 1, 20); if (Math.random() < 0.4) e1.cri(e, 'e1_belette', 1, 25); return true; }
    // une proie : un campagnol qui passe
    if (!e.proie || e.proie.dead || e.proie.removed) { e.proie = null; for (const G of e1.actifs) if (G.kind === 'campagnol_champs') for (const q of G.ents) if (!q.dead && !q.hidden && Math.hypot(q.x - e.x, q.z - e.z) < 12) e.proie = q; }
    if (e.proie) { e.heading = Math.atan2(e.proie.x - e.x, e.proie.z - e.z); E1V.marche(e, dt, w, e.cfg.run * 0.8); e.dresse = 0; if (Math.hypot(e.proie.x - e.x, e.proie.z - e.z) < 0.15) { e.proie.dead = true; e.proie.hidden = true; e.proie = null; e1.cri(e, 'e1_couine', 1, 25); } return true; }
    const regarde = e.dist < 16 && e.dist > 5;
    if (regarde && e.pauseT > 0) { e.dresse = lerp(e.dresse || 0, 1.0, Math.min(1, dt * 6)); e.heading = turnToward(e.heading, Math.atan2(c.px - e.x, c.pz - e.z), dt * 4); e.pauseT -= dt; e.move = 0; return true; }
    e.dresse = lerp(e.dresse || 0, 0, Math.min(1, dt * 8));
    const r = E1V.erre(e, dt, w, { r: 7, v: e.cfg.walk * 2.2, pause: [0.8, 3] });
    if (r === 'arrive' && regarde) e.pauseT = 2 + Math.random() * 2;
    e.phase += dt * 6; // (les bonds)
    return true;
  },
  // ---------------------------------------------------------------- le campagnol : de petites courses, des arrêts ; plonge au trou
  campagnol_champs(e, dt, w, c) {
    if (e.trou > 0) { e.trou -= dt; e.hidden = true; if (e.trou <= 0) { e.hidden = false; e.x = e.hx + (Math.random() - 0.5) * 2; e.z = e.hz + (Math.random() - 0.5) * 2; e.y = entities.groundY(w, e, e.x, e.z); } return true; }
    e.hidden = false;
    if (e.dist < (c.crouch ? 1.8 : 4)) { e.trou = 8 + Math.random() * 14; if (Math.random() < 0.3) e1.cri(e, 'e1_couine', 0.7, 15); return true; }
    E1V.erre(e, dt, w, { r: 3, v: Math.random() < 0.5 ? e.cfg.run * 0.6 : e.cfg.walk, pause: [1, 4] });
    return true;
  },
  // ---------------------------------------------------------------- les hannetons : un vol lourd autour d'un arbre ; certains se posent
  hanneton(e, dt, w, c) {
    const G = e.G, h = e1.heure();
    e.t1 -= dt;
    if (e.mo === 'pose') {
      e.fly = 0; e.y = entities.groundY(w, e, e.x, e.z) + 0.004;
      E1V.erre(e, dt, w, { r: 0.4, v: 0.02, pause: [2, 6] });
      if (e.t1 <= 0 && !G.part && h < 21.4) { e.mo = 'vole'; e.fly = 1; }
      return true;
    }
    e.fly = 1; e.hidden = false;
    e.ang += dt * (0.9 + e.seed / 200) * (e.seed > 50 ? 1 : -1);
    const x = G.cx + Math.cos(e.ang) * e.rayon, z = G.cz + Math.sin(e.ang) * e.rayon, y = G.cy + Math.sin(c.t * 0.7 + e.seed) * 1.2;
    E1V.vers(e, x, y, z, 1.6, dt, 3);
    e.x += (Math.random() - 0.5) * dt * 0.6; e.z += (Math.random() - 0.5) * dt * 0.6;
    e.bzT = (e.bzT ?? Math.random() * 6) - dt;
    if (e.bzT <= 0) { e.bzT = 4 + Math.random() * 6; if (e.dist < 9) e1.cri(e, 'e1_bourdon', 1, 12); }
    if (e.t1 <= 0) { e.t1 = 10 + Math.random() * 20; if (Math.random() < 0.3 || h > 21.4 || G.part) { e.mo = 'pose'; e.t1 = 15 + Math.random() * 25; const a = Math.random() * TAU; e.x = G.cx + Math.sin(a) * 2; e.z = G.cz + Math.cos(a) * 2; } }
    return true;
  },
  // ---------------------------------------------------------------- la sauterelle : immobile dans l'herbe ; grésille ; saute
  sauterelle(e, dt, w, c) {
    e.criT = (e.criT ?? Math.random() * 10) - dt;
    if (e.saut > 0) {
      e.saut -= dt * (e.vol ? 0.6 : 1.8);
      e.fly = e.vol ? 1 : 0;
      e.x += Math.sin(e.heading) * dt * (e.vol ? 3 : 1.6); e.z += Math.cos(e.heading) * dt * (e.vol ? 3 : 1.6);
      const sol = entities.groundY(w, e, e.x, e.z);
      e.y = sol + Math.sin(Math.PI * clamp(e.saut, 0, 1)) * (e.vol ? 1.2 : 0.45);
      if (e.saut <= 0) { e.saut = 0; e.vol = false; e.fly = 0; e.y = sol; e.hx = e.x; e.hz = e.z; }
      return true;
    }
    e.fly = 0; e.move = 0;
    if (e.dist < (c.crouch ? 0.7 : 1.5)) { e.saut = 1; e.vol = Math.random() < 0.18; e.heading = Math.atan2(e.x - c.px, e.z - c.pz) + (Math.random() - 0.5) * 1.4; e1.cri(e, 'e1_froisse', 0.5, 8); return true; }
    if (e.criT <= 0) { e.criT = 6 + Math.random() * 9; if (e.dist > 3 && e.dist < 16 && e1.heure() > 15) e1.cri(e, 'e1_stridule', 1, 16); }
    return true;
  },
  // ---------------------------------------------------------------- le machaon : une danse vive au-dessus des fleurs ; il se pose, ailes ouvertes
  machaon(e, dt, w, c) {
    const sol = w.heightAt(e.x, e.z);
    if (e.G.part) { e.fly = 1; e.y += dt * 2; e.x += Math.sin(e.heading) * dt * 4; e.z += Math.cos(e.heading) * dt * 4; if (e.y > sol + 12) e.hidden = true; return true; }
    if (e.dist < (c.crouch ? 1.5 : c.sprint ? 7 : 3.4) && !(e.fuite > 0)) { e.fuite = 2.5; e.pose = 0; const a = Math.atan2(e.x - c.px, e.z - c.pz) + (Math.random() - 0.5); e.hx = e.x + Math.sin(a) * 9; e.hz = e.z + Math.cos(a) * 9; e.cible = null; if ((e.peurs = (e.peurs || 0) + 1) > 5) e.G.part = true; }
    e.fuite = Math.max(0, (e.fuite || 0) - dt);
    if (e.pose > 0) { e.pose -= dt; e.fly = 0; e.y = sol + 0.32; e.repos = e.seed > 50 ? -0.08 : -1.45; return true; }
    e.repos = null; e.fly = 1; e.volM = Math.random() < 0.02 ? 'plane' : e.volM || 'bat';
    e.cibleT = (e.cibleT || 0) - dt;
    if (!e.cible || e.cibleT <= 0) {
      const r = e.fuite > 0 ? 3 : 2.2;
      e.cible = [e.hx + (Math.random() - 0.5) * r * 2, sol + (e.fuite > 0 ? 1.8 + Math.random() * 2 : 0.4 + Math.random() * 1.4), e.hz + (Math.random() - 0.5) * r * 2];
      e.cibleT = 0.4 + Math.random() * 0.9; e.volM = Math.random() < 0.3 ? 'plane' : 'bat';
      if (!(e.fuite > 0) && Math.random() < 0.1) e.pose = 3 + Math.random() * 5;
      if (!(e.fuite > 0)) { e.hx += (Math.random() - 0.5) * 3; e.hz += (Math.random() - 0.5) * 3; }
    }
    E1V.vers(e, e.cible[0], Math.max(sol + 0.25, e.cible[1]), e.cible[2], e.fuite > 0 ? 4 : 2.2, dt, 9);
    return true;
  },
  // ---------------------------------------------------------------- les chouettes : perchées ; la chevêche hoche la tête ; le petit-duc devient branche
  cheveche(e, dt, w, c) { return E1_CONDUITES._chouette(e, dt, w, c, 'e1_cheveche', 7, c.lantern ? 9 : 6); },
  petit_duc(e, dt, w, c) { return E1_CONDUITES._chouette(e, dt, w, c, 'e1_petit_duc', 4, c.lantern ? 6 : 4); },
  _chouette(e, dt, w, c, cri, rest, fuite) {
    const G = e.G, duc = e.kind === 'petit_duc';
    e.criT = (e.criT ?? 4 + Math.random() * 12) - dt;
    if (e.mo === 'vol' || e.mo === 'part') {
      e.fly = 1; e.volM = 'bat'; e.mince = false; e.hoche = false;
      const P = e.perche;
      if (e.mo === 'part') { if (E1V.vers(e, e.x + Math.sin(e.heading) * 5, e.y + 0.5, e.z + Math.cos(e.heading) * 5, 6, dt) && e.dist > 60) e.hidden = true; return true; }
      const d = Math.hypot(P.x - e.x, P.z - e.z), y = P.y + Math.min(2.5, d * 0.25) - Math.abs(Math.sin(d * 0.6)) * 0.6; // (un vol bas, ondulé)
      if (E1V.vers(e, P.x, y, P.z, 6, dt, 4) < 0.15) { e.mo = 'perche'; e.x = P.x; e.y = P.y; e.z = P.z; e.heading = P.cap || e.heading; }
      return true;
    }
    if (G.part) { e.mo = 'part'; return true; }
    const P = e.perche;
    e.fly = 0; e.x = P.x; e.y = P.y; e.z = P.z;
    // regarder qui approche ; la chevêche hoche la tête ; le petit-duc se fait mince, la lanterne sur lui
    const regarde = e.dist < 26;
    e.lookY = regarde ? clamp(angDiff(e.heading, Math.atan2(c.px - e.x, c.pz - e.z)), -1.5, 1.5) : e.lookY * 0.98;
    e.hoche = !duc && regarde && e.dist > fuite && Math.sin(c.t * 0.35 + e.seed) > 0.2;
    e.mince = duc && e.dist < (c.lantern ? 14 : 7);
    if (e.dist < fuite * (c.crouch ? 0.6 : 1) || e.peurT > 0) {
      e.peurT = 0;
      const L = e1.lieux(w), cand = duc ? (L.ville ? L.ville.arbres.map((a) => ({ x: a.x + 0.5, z: a.z, y: a.y + a.h * 0.58, cap: Math.random() * TAU })) : []) : (L.ferme ? L.ferme.perchoirs : []);
      const loin = cand.filter((q) => Math.hypot(q.x - c.px, q.z - c.pz) > 12 && Math.hypot(q.x - P.x, q.z - P.z) > 3);
      if (loin.length) { e.perche = loin[(Math.random() * loin.length) | 0]; e.mo = 'vol'; sound.flutter && sound.flutter(0.35, 0); }
      else { e.mo = 'part'; e.heading = Math.atan2(e.x - c.px, e.z - c.pz); }
      return true;
    }
    // les cris : la chevêche de loin en loin ; le petit-duc par séries (« tiou » toutes les trois secondes), puis un long silence
    if (duc) {
      if (e.serie > 0) { if (e.criT <= 0) { e.serie--; e.criT = 2.6 + Math.random() * 0.5; if (!e.mince) e1.cri(e, cri, 1, 80); } }
      else if (e.criT <= 0) { e.serie = 8 + ((Math.random() * 14) | 0); e.criT = 0.5; if (e.dist > 50) e.serie = 0; }
      if (e.serie <= 0 && e.criT <= 0) e.criT = 50 + Math.random() * 80;
    } else if (e.criT <= 0) { e.criT = 35 + Math.random() * 60; if (c.night > 0.3 && e.dist > 6) e1.criOiseau(e, cri, 1, 90); }
    // la chevêche descend parfois au sol (un hanneton, un ver), puis revient
    if (!duc && e.mo === 'perche' && Math.random() < dt * 0.01 && e.dist > 15) { const t = Math.random() * TAU; e.perche0 = P; e.perche = { x: P.x + Math.sin(t) * 4, z: P.z + Math.cos(t) * 4, y: w.heightAt(P.x + Math.sin(t) * 4, P.z + Math.cos(t) * 4), cap: t, sol: true }; e.mo = 'vol'; e.retourT = 4; }
    if (P.sol) { e.retourT -= dt; e.peck = Math.sin(c.t * 4) > 0.6; if (e.retourT <= 0 && e.perche0) { e.perche = e.perche0; e.perche0 = null; e.mo = 'vol'; e.peck = false; } }
    void rest;
    return true;
  },
  // ---------------------------------------------------------------- le putois : rôde vers la ferme ; acculé, il empeste
  putois(e, dt, w, c) {
    const G = e.G;
    e.t1 -= dt;
    if (e.cache > 0) { e.cache -= dt; e.hidden = true; if (e.cache <= 0) G.part = true; return true; }
    e.hidden = false;
    // acculé : le joueur sur lui plus de deux secondes
    if (e.dist < 3.2) { e.acc = (e.acc || 0) + dt; if (e.acc > E1_DANGER.putois.accule && !e.pue) { e.pue = true; e1.empester(e); } } else e.acc = Math.max(0, (e.acc || 0) - dt);
    if (e.dist < (c.crouch ? 6 : 12) || e.peurT > 0) { E1V.fuit(e, dt, w, c, e.cfg.run); if (e.dist > 22) e.cache = 3; return true; }
    // vers la ferme, longeant les murs ; le chien l'a senti
    const m = G.cible;
    if (m && Math.hypot(m.x - e.x, m.z - e.z) > 1) { e.heading = turnToward(e.heading, Math.atan2(m.x - e.x, m.z - e.z), dt * 3); E1V.marche(e, dt, w, e.cfg.walk); }
    else E1V.erre(e, dt, w, { r: 5, v: e.cfg.walk, pause: [1, 4], cx: m ? m.x : e.hx, cz: m ? m.z : e.hz });
    e.chienT = (e.chienT ?? 3) - dt;
    if (e.chienT <= 0) { e.chienT = 2 + Math.random() * 3; const L = e1.lieux(w).ferme; if (L && Math.hypot(e.x - L.x, e.z - L.z) < 35 && game.dogAlarm) game.dogAlarm({ x: e.x, z: e.z }); }
    return true;
  },
  // ---------------------------------------------------------------- le lérot : le long des murs, la nuit ; il grimpe ; il siffle
  lerot(e, dt, w, c) {
    e.t1 -= dt; e.criT = (e.criT ?? 5 + Math.random() * 15) - dt;
    if (e.cache > 0) { e.cache -= dt; e.hidden = true; if (e.cache <= 0) { e.hidden = false; const p = e1.surMur(e1.lieux(w).ferme.maison, Math.random, 0); if (p) { e.x = p.x; e.z = p.z; e.mur = p; } } return true; }
    if (e.dist < (c.crouch ? 2.5 : 5)) { e.cache = 10 + Math.random() * 20; e1.cri(e, 'e1_couine', 0.6, 12); return true; }
    if (e.criT <= 0) { e.criT = 15 + Math.random() * 25; e1.cri(e, 'e1_lerot', 1, 30); }
    const m = e.mur, base = m ? m.y : w.heightAt(e.x, e.z);
    if (e.grimpe) { // il monte le long du mur, puis redescend
      e.hy = e.hy ?? 0; e.hy += dt * (e.monte ? 0.6 : -0.6);
      if (e.hy > 2.2) e.monte = false;
      if (e.hy <= 0) { e.hy = 0; e.grimpe = false; }
      e.y = base + e.hy; e.heading = m ? m.cap + Math.PI : e.heading; e.move = 1; e.phase += dt * 14;
      return true;
    }
    e.y = entities.groundY(w, e, e.x, e.z);
    const r = E1V.erre(e, dt, w, { r: 2.5, v: Math.random() < 0.3 ? e.cfg.run * 0.6 : e.cfg.walk, pause: [0.5, 3], cx: m ? m.x : e.hx, cz: m ? m.z : e.hz });
    if (r === 'arrive' && m && Math.random() < 0.3) { e.grimpe = true; e.monte = true; e.x = m.x; e.z = m.z; }
    return true;
  },
  // ---------------------------------------------------------------- les rats : le long des murs ; ils filent
  rat_noir(e, dt, w, c) {
    if (e.cache > 0) { e.cache -= dt; e.hidden = true; if (e.cache <= 0) { e.hidden = false; const L = e1.lieux(w).ferme, p = L.murs[(Math.random() * L.murs.length) | 0]; if (p && Math.hypot(p.x - c.px, p.z - c.pz) > 6) { e.x = p.x; e.z = p.z; e.mur = p; } } return true; }
    if (e.dist < (c.crouch ? 3 : 6)) { if (!e.file) { e.file = 1.2; e1.cri(e, 'e1_rat', 0.8, 15); } }
    if (e.file > 0) { e.file -= dt; E1V.fuit(e, dt, w, c, e.cfg.run); if (e.file <= 0) { e.file = 0; e.cache = 12 + Math.random() * 20; } return true; }
    // un chat de la ferme : on file aussi
    e.y = entities.groundY(w, e, e.x, e.z);
    E1V.erre(e, dt, w, { r: 3.5, v: Math.random() < 0.4 ? e.cfg.run * 0.7 : e.cfg.walk, pause: [0.5, 3], cx: e.mur ? e.mur.x : e.hx, cz: e.mur ? e.mur.z : e.hz });
    e.criT = (e.criT ?? 10 + Math.random() * 30) - dt;
    if (e.criT <= 0) { e.criT = 30 + Math.random() * 50; e1.cri(e, 'e1_rat', 0.7, 20); }
    return true;
  },
  surmulot(e, dt, w, c) {
    const B = e.berge;
    if (e.cache > 0) { e.cache -= dt; e.hidden = true; if (e.cache <= 0) e.hidden = false; return true; }
    // acculé : il saute aux jambes (une fois)
    if (e.dist < 1.3 && e.file > 0 && !e.mordu) { const D = E1_DANGER.surmulot; e.coince = (e.coince || 0) + dt; if (e.coince > D.coince) { e.mordu = true; e1.cri(e, 'e1_couine', 1.2, 15); if (c.alive) play.hurt(lerp(D.degats[0], D.degats[1], Math.random()), e, D.cause); e.cache = 15; return true; } }
    if (e.dist < (c.crouch ? 3 : 6) && !e.file) { e.file = 2.5; e1.cri(e, 'e1_rat', 0.8, 15); }
    if (e.file > 0) {
      e.file -= dt;
      // il file vers l'eau, et il nage
      if (B && B.ex !== undefined && Math.hypot(B.ex - e.x, B.ez - e.z) < 12) { e.heading = turnToward(e.heading, Math.atan2(B.ex - e.x, B.ez - e.z), dt * 6); e.x += Math.sin(e.heading) * dt * 2.4; e.z += Math.cos(e.heading) * dt * 2.4; }
      else E1V.fuit(e, dt, w, c, e.cfg.run);
      e.nage = w.heightAt(e.x, e.z) < w.waterLevel - 0.05;
      e.y = e.nage ? w.waterLevel - 0.035 : entities.groundY(w, e, e.x, e.z);
      if (e.nage && Math.random() < dt * 6) particles.spawn(e.x, w.waterLevel + 0.01, e.z, 0, 0, 0, [0.7, 0.75, 0.75, 0.6], 0.05, 1.2, 0, false);
      e.move = 1; e.phase += dt * 30;
      if (e.file <= 0) { e.file = 0; e.cache = 10 + Math.random() * 15; }
      return true;
    }
    e.nage = false; e.y = entities.groundY(w, e, e.x, e.z);
    E1V.erre(e, dt, w, { r: 4, v: Math.random() < 0.4 ? e.cfg.run * 0.6 : e.cfg.walk, pause: [0.5, 3], cx: B ? B.x : e.hx, cz: B ? B.z : e.hz });
    return true;
  },
  // ---------------------------------------------------------------- la bergeronnette : court, s'arrête, hoche la queue ; vole par bonds
  bergeronnette(e, dt, w, c) {
    const G = e.G;
    e.remue = !e.fly;
    if (e.saute > 0) {
      e.saute -= dt; e.fly = 1; e.volM = Math.sin(e.saute * 9) > 0 ? 'bat' : 'glisse';
      const sol = entities.groundY(w, e, e.x, e.z);
      e.x += Math.sin(e.heading) * dt * 5; e.z += Math.cos(e.heading) * dt * 5; e.y = sol + 0.8 + Math.sin(e.saute * 7) * 0.35;
      if (e.saute <= 0) { e.fly = 0; e.y = entities.groundY(w, e, e.x, e.z); e.hx = e.x; e.hz = e.z; }
      return true;
    }
    if (G.part) { e.saute = 3; e.heading = Math.random() * TAU; e.hidden = e.dist > 40; return true; }
    if (E1V.alerte(e, c, 5.5)) { e.saute = 1.2 + Math.random() * 1.2; e.heading = Math.atan2(e.x - c.px, e.z - c.pz) + (Math.random() - 0.5); e1.criOiseau(e, 'e1_bergeronnette', 0.9, 40); return true; }
    e.fly = 0; e.y = entities.groundY(w, e, e.x, e.z);
    E1V.erre(e, dt, w, { r: 5, v: e.cfg.walk * 1.4, pause: [0.4, 2], cx: G.cx, cz: G.cz });
    e.peck = e.pauseT > 0 && Math.sin(c.t * 3 + e.seed) > 0.5;
    return true;
  },
  // ---------------------------------------------------------------- la couleuvre d'Esculape : au soleil ; elle file, ou grimpe à un arbre
  esculape(e, dt, w, c) {
    if (e.cache > 0) { e.cache -= dt; e.hidden = true; if (e.cache <= 0) e.G.part = true; return true; }
    if (e.grimpe) {
      e.hy = Math.min(2.6, (e.hy || 0) + dt * 0.35); e.y = e.arbre.y + e.hy; e.x = e.arbre.x; e.z = e.arbre.z; e.move = 0.5; e.phase += dt * 3;
      e.raise = false;
      if (e.hy >= 2.6 && e.dist > 25) e.G.part = true;
      return true;
    }
    if (e.file > 0) {
      e.file -= dt;
      if (e.arbre && Math.hypot(e.arbre.x - e.x, e.arbre.z - e.z) < 0.4) { e.grimpe = true; e.hy = 0; return true; }
      if (e.arbre) { e.heading = turnToward(e.heading, Math.atan2(e.arbre.x - e.x, e.arbre.z - e.z), dt * 4); E1V.marche(e, dt, w, e.cfg.run); }
      else E1V.fuit(e, dt, w, c, e.cfg.run);
      if (e.file <= 0) e.cache = 20;
      return true;
    }
    e.move = 0; e.raise = e.dist < 6;
    if (e.dist < (c.crouch ? 2.2 : 4.2)) {
      e.file = 4; const a = E1V.arbre(w, e.x, e.z, 7);
      e.arbre = a && Math.random() < 0.45 ? { x: a.x, z: a.z, y: w.heightAt(a.x, a.z) } : null;
      e1.cri(e, 'e1_froisse', 0.7, 12);
    }
    return true;
  },
  // ---------------------------------------------------------------- les frelons : autour du nid ; qui s'en approche trop l'apprend
  frelon(e, dt, w, c) { return e1.frelon(e, dt, w, c); },
  // ---------------------------------------------------------------- le grillon : sur la pierre de l'âtre ; il chante ; il se tait quand on approche
  grillon_foyer(e, dt, w, c) {
    e.criT = (e.criT ?? 2 + Math.random() * 4) - dt;
    e.hidden = !(e.sort > 0);
    e.sortT = (e.sortT ?? 20 + Math.random() * 40) - dt;
    if (e.sortT <= 0) { e.sortT = 40 + Math.random() * 80; e.sort = 15 + Math.random() * 20; }
    if (e.sort > 0) { e.sort -= dt; if (e.dist < 1.2) e.sort = 0; }
    if (e.criT <= 0) {
      if (e.serie > 0) { e.serie--; e.criT = 2.1 + Math.random() * 0.4; if (e.dist > 1.6) e1.cri(e, 'e1_grillon', 1, 18); }
      else { e.serie = 5 + ((Math.random() * 6) | 0); e.criT = 25 + Math.random() * 50; }
    }
    return true;
  },
  // ---------------------------------------------------------------- l'épeire : au centre de sa toile, la tête en bas
  epeire(e, dt, w, c) {
    const T = e.toile; e.fly = 0; e.move = 0;
    if (!T) { e.hidden = true; return true; }
    const E = e1.S();
    if (E && (E.toiles[T.id] || -1) >= farm.s.day) { e.hidden = true; return true; }
    e.hidden = false; e.x = T.x; e.z = T.z; e.y = T.y - 0.01; e.heading = T.r; e.pend = true;
    e.bouge = e.dist < 1.2;
    return true;
  },
  // ---------------------------------------------------------------- les hirondelles : de grandes boucles autour des toits ; elles entrent au nid
  hirondelle_f(e, dt, w, c) {
    const G = e.G, V = e1.lieux(w).ville;
    if (G.part) { e.fly = 1; if (E1V.vers(e, e.x + Math.sin(e.heading) * 8, e.y + 3, e.z + Math.cos(e.heading) * 8, 11, dt, 1) && e.dist > 80) e.hidden = true; return true; }
    if (e.nid) {
      if (e.dedans > 0) { e.dedans -= dt; e.hidden = true; if (e.dedans <= 0) { e.hidden = false; e.nid = null; } return true; }
      e.fly = 1; e.volM = 'bat';
      if (E1V.vers(e, e.nid.x + Math.sin(e.nid.r) * 0.1, e.nid.y, e.nid.z + Math.cos(e.nid.r) * 0.1, 9, dt, 8) < 0.12) e.dedans = 3 + Math.random() * 6;
      return true;
    }
    e.fly = 1; e.volM = Math.sin(c.t * 3 + e.seed) > 0.2 ? 'bat' : 'glisse';
    e.ang += dt * (9 / e.rayon) * e.sens;
    const x = G.cx + Math.cos(e.ang) * e.rayon + Math.sin(c.t * 0.3 + e.seed) * 6, z = G.cz + Math.sin(e.ang) * e.rayon + Math.cos(c.t * 0.25 + e.seed) * 6;
    const y = Math.max(G.cy - 2 + e.haut + Math.sin(c.t * 1.1 + e.seed) * 2.5, E1V.sol(w, x, z) + 2.5);
    E1V.vers(e, x, y, z, 10, dt, 6);
    e.criT = (e.criT ?? Math.random() * 8) - dt;
    if (e.criT <= 0) { e.criT = 6 + Math.random() * 10; if (e.dist < 40) e1.cri(e, 'e1_hirondelle', 0.8, 45); }
    if (V && V.nids.length && Math.random() < dt * 0.04) e.nid = V.nids[(Math.random() * V.nids.length) | 0];
    if (Math.random() < dt * 0.05) { e.rayon = 5 + Math.random() * 12; e.haut = 2 + Math.random() * 9; }
    return true;
  },
  // ---------------------------------------------------------------- les choucas : sur le clocher ; des culbutes autour ; parfois sur la place
  choucas(e, dt, w, c) {
    const G = e.G, C = e1.lieux(w).ville.clocher, V = e1.lieux(w).ville;
    e.t1 -= dt; e.criT = (e.criT ?? 3 + Math.random() * 15) - dt;
    if (e.criT <= 0) { e.criT = 8 + Math.random() * 18; if (e.dist < 80) e1.cri(e, 'e1_choucas', 0.85, 90); }
    if (G.part && e.mo !== 'tour') { e.mo = 'tour'; e.t1 = 4; }
    switch (e.mo) {
      case 'clocher': e.fly = 0; e.x = e.perche.x; e.y = e.perche.y; e.z = e.perche.z; e.peck = false; e.lookY = Math.sin(c.t * 0.5 + e.seed) * 0.8;
        if (e.t1 <= 0) { e.mo = 'tour'; e.t1 = 8 + Math.random() * 14; e.ang = Math.random() * TAU; } break;
      case 'tour': {
        e.fly = 1; e.volM = Math.sin(c.t * 2.2 + e.seed) > -0.3 ? 'bat' : 'pique';
        e.ang = (e.ang || 0) + dt * 0.7;
        const R = 9 + (e.v % 3) * 4, x = C.x + Math.cos(e.ang) * R, z = C.z + Math.sin(e.ang) * R, y = C.y + Math.sin(c.t * 1.3 + e.seed) * 5 - (e.volM === 'pique' ? 3 : 0);
        E1V.vers(e, x, y, z, 8, dt, 4);
        if (G.part && e.t1 <= 0) { e.hidden = e.dist > 60; break; }
        if (e.t1 <= 0) {
          if (Math.random() < 0.3 && V.x) { e.mo = 'place'; const a = Math.random() * TAU, d = 3 + Math.random() * 8; e.sol = [V.x + Math.sin(a) * d, V.z + Math.cos(a) * d]; }
          else { e.mo = 'retour'; const pc = C.coins.concat(V.egl ? [{ x: V.egl.a[0], z: V.egl.a[1], y: V.egl.y }, { x: V.egl.b[0], z: V.egl.b[1], y: V.egl.y }] : []); e.perche = pc[(Math.random() * pc.length) | 0]; }
        }
        break;
      }
      case 'retour': e.fly = 1; e.volM = 'glisse'; if (E1V.vers(e, e.perche.x, e.perche.y, e.perche.z, 7, dt, 5) < 0.15) { e.mo = 'clocher'; e.t1 = 15 + Math.random() * 40; } break;
      case 'place': {
        const sy = w.groundAt(e.sol[0], e.sol[1], 50, 60);
        if (!e.pose) { e.fly = 1; e.volM = 'glisse'; if (E1V.vers(e, e.sol[0], sy, e.sol[1], 7, dt, 5) < 0.12) { e.pose = true; e.t1 = 10 + Math.random() * 20; e.hx = e.x; e.hz = e.z; } break; }
        e.fly = 0; e.y = entities.groundY(w, e, e.x, e.z);
        E1V.erre(e, dt, w, { r: 2, v: e.cfg.walk, pause: [1, 3] }); e.peck = e.pauseT > 0;
        if (e.t1 <= 0 || E1V.alerte(e, c, 9)) { e.pose = false; e.mo = 'tour'; e.t1 = 5; sound.flutter && sound.flutter(0.4, 0); }
        break;
      }
      default: e.mo = 'tour';
    }
    return true;
  },
  // ---------------------------------------------------------------- les freux : en bande aux champs ; le soir, à la corbeautière, en criant
  freux(e, dt, w, c) {
    const G = e.G;
    if (G.mo === 'corbeautiere') {
      e.criT = (e.criT ?? Math.random() * 6) - dt;
      if (e.criT <= 0) { e.criT = 5 + Math.random() * 12; if (e1.heure() < 20.5) e1.cri(e, 'e1_freux', 0.8, 120); }
      e.fly = 0; e.x = e.perche.x; e.y = e.perche.y; e.z = e.perche.z;
      if (E1V.alerte(e, c, 12) || (G.part && e1.heure() >= 6 && e1.heure() < 17)) { G.mo = 'vol'; G.t = 10; G.ang = 0; G.r = 14; G.haut = [12, 22]; G.cri = 'e1_freux'; G.fuite = 30; }
      return true;
    }
    return E1_CONDUITES._bande(e, dt, w, c);
  },
  // ---------------------------------------------------------------- le pèlerin : à la pointe du clocher ; il tourne haut, et tombe sur les pigeons
  pelerin(e, dt, w, c) { return e1.pelerin(e, dt, w, c); },
  // ---------------------------------------------------------------- la fouine : elle court sur les faîtes, la nuit
  fouine(e, dt, w, c) {
    const G = e.G, T = e.toit;
    if (e.cache > 0) { e.cache -= dt; e.hidden = true; if (e.cache <= 0) G.part = true; return true; }
    e.hidden = false; e.fly = 0;
    if (e.dist < (c.crouch ? 4 : 8) && !e.vu) { e.vu = true; e.vite = 4; e1.cri(e, 'e1_putois', 0.5, 20); }
    if (e.vite > 0) e.vite -= dt;
    const v = e.vite > 0 ? e.cfg.run : e.cfg.walk * (Math.sin(c.t * 0.7 + e.seed) > 0 ? 1.4 : 0.6), L = Math.hypot(T.b[0] - T.a[0], T.b[1] - T.a[1]) || 1;
    e.u += e.sens * v * dt / L;
    if (e.u > 1 || e.u < 0) {
      // au bout du faîte : un autre toit, s'il y en a un tout près ; sinon, demi-tour
      e.u = clamp(e.u, 0, 1); const bout = e.u >= 1 ? T.b : T.a;
      const autre = (G.toits || []).find((q) => q !== T && (Math.hypot(q.a[0] - bout[0], q.a[1] - bout[1]) < 7 || Math.hypot(q.b[0] - bout[0], q.b[1] - bout[1]) < 7));
      if (autre && Math.random() < 0.7) { e.toit = autre; const da = Math.hypot(autre.a[0] - bout[0], autre.a[1] - bout[1]); e.u = da < 7 ? 0 : 1; e.sens = da < 7 ? 1 : -1; e1.trotte(e); if (e.vite > 0 && e.dist > 25) e.cache = 2; }
      else { e.sens = -e.sens; if (e.vite > 0) e.cache = 1; }
      return true;
    }
    e.x = lerp(T.a[0], T.b[0], e.u); e.z = lerp(T.a[1], T.b[1], e.u); e.y = T.y;
    e.heading = Math.atan2((T.b[0] - T.a[0]) * e.sens, (T.b[1] - T.a[1]) * e.sens);
    e.move = 1; e.run = v > e.cfg.walk * 1.5; e.phase += dt * v * 9;
    e.trT = (e.trT ?? 2) - dt;
    if (e.trT <= 0) { e.trT = 3 + Math.random() * 5; e1.trotte(e); }
    return true;
  },
  // ---------------------------------------------------------------- l'alyte : il flûte ; il se tait quand on approche ; il s'éloigne à petits sauts
  alyte(e, dt, w, c) {
    e.criT = (e.criT ?? Math.random() * 5) - dt; e.chante = false;
    if (e.saut > 0) { e.saut -= dt * 1.5; e.x += Math.sin(e.heading) * dt * 0.4; e.z += Math.cos(e.heading) * dt * 0.4; e.y = entities.groundY(w, e, e.x, e.z) + Math.sin(Math.PI * clamp(e.saut, 0, 1)) * 0.05; return true; }
    e.y = entities.groundY(w, e, e.x, e.z);
    if (e.dist < 1.4) { e.saut = 1; e.heading = Math.atan2(e.x - c.px, e.z - c.pz) + (Math.random() - 0.5); return true; }
    if (e.dist < (c.crouch ? 2.5 : 4.5)) { e.criT = Math.max(e.criT, 6); return true; }
    if (e.criT <= 0) {
      if (e.serie > 0) { e.serie--; e.criT = 1.8 + Math.random() * 0.6; e.chante = true; e1.cri(e, 'e1_alyte', 1, 45); }
      else { e.serie = 6 + ((Math.random() * 12) | 0); e.criT = 20 + Math.random() * 50; }
    }
    return true;
  },
  // ---------------------------------------------------------------- le grand paon : il tourne autour du réverbère ; il s'y cogne ; il se pose
  grand_paon(e, dt, w, c) {
    const G = e.G, R = G.lampe;
    if (G.part || !(game.sky && game.sky.night > 0.4)) { e.fly = 1; e.volM = 'bat'; e.y += dt * 1.5; e.x += Math.sin(e.heading) * dt * 2; e.z += Math.cos(e.heading) * dt * 2; if (e.dist > 30) e.hidden = true; return true; }
    if (e.pose > 0) { e.pose -= dt; e.fly = 0; e.repos = -0.03; e.pend = true; if (e.dist < 1.1 && !c.crouch) e.pose = 0; return true; }
    e.repos = null; e.pend = false; e.fly = 1; e.volM = 'bat';
    e.ang += dt * (2.2 + Math.sin(c.t * 0.6 + e.seed));
    const r = 0.45 + Math.sin(c.t * 0.9 + e.seed) * 0.25;
    E1V.vers(e, R.x + Math.cos(e.ang) * r, R.y + Math.sin(c.t * 1.7) * 0.25, R.z + Math.sin(e.ang) * r, 2.4, dt, 10);
    e.tocT = (e.tocT ?? 3) - dt;
    if (e.tocT <= 0) { e.tocT = 2 + Math.random() * 5; if (e.dist < 12) e1.cri(e, 'e1_toc', 1, 14); }
    if (Math.random() < dt * 0.04) { e.pose = 15 + Math.random() * 30; const a = Math.random() * TAU; e.x = R.x + Math.sin(a) * 0.12; e.z = R.z + Math.cos(a) * 0.12; e.y = R.sol + 1.4 + Math.random() * 0.8; e.heading = a + Math.PI; }
    return true;
  },
  // ---------------------------------------------------------------- l'escargot : il rampe, sur le sol ou au mur ; il rentre si on le touche
  escargot(e, dt, w, c) {
    e.fly = 0;
    if (e.dist < 0.9) e.rentre = 6; else if (e.rentre > 0) e.rentre -= dt;
    if (e.rentre > 0) { e.move = 0; return true; }
    if (e.mur) { e.y = Math.min(e.mur.y + 1.6, e.y + dt * 0.004); e.heading = e.mur.cap + Math.PI; return true; }
    e.heading += (Math.random() - 0.5) * dt * 0.3;
    e.x += Math.sin(e.heading) * dt * 0.005; e.z += Math.cos(e.heading) * dt * 0.005; e.y = entities.groundY(w, e, e.x, e.z);
    return true;
  },
};

// ---------------------------------------------------------------- les conduites longues : frelons, pèlerin ; l'odeur du putois ; la proie du faucon
Object.assign(e1, {
  nidActif() {
    const E = this.S(); if (!E) return false;
    if (E.nid.pris && farm.s.day - E.nid.pris < 40) return false; // (une colonie nouvelle, quarante jours plus tard)
    if ((typeof vallee !== 'undefined' && vallee.snowK > 0.2) || (weather.cur.frost || 0) > 0.5) return false; // (le froid les engourdit)
    return true;
  },
  nidVide() { const E = this.S(); return !!E && !(E.nid.pris && farm.s.day - E.nid.pris < 40) && !this.nidActif(); },
  nidPresent() { const E = this.S(); return !!E && !(E.nid.pris && farm.s.day - E.nid.pris < 40); },
  frelon(e, dt, w, c) {
    const G = e.G, N = G.nid, dN = Math.hypot(c.px - N.x, c.pz - N.z);
    e.fly = 1;
    // la colère : on s'est trop approché du nid (ou on l'a frappé)
    const D = E1_DANGER.frelon;
    if (!G.colere && !G.part && c.alive) {
      if (dN < D.tout_pres) G.colere = 1;
      else if (dN < D.approche) { G.trop = (G.trop || 0) + dt / G.ents.length; if (G.trop > D.patience) G.colere = 1; }
      else G.trop = Math.max(0, (G.trop || 0) - dt / G.ents.length);
      if (G.colere) { G.colereT = D.colere; G.piqures = 0; }
    }
    if (G.colere) {
      if (e === G.ents[0]) G.colereT -= dt;
      const p = game.player, cible = [p.pos[0], p.pos[1] + 1.5, p.pos[2]];
      const d = E1V.vers(e, cible[0] + Math.sin(c.t * 7 + e.seed) * 0.35, cible[1] + Math.cos(c.t * 5 + e.seed) * 0.3, cible[2] + Math.cos(c.t * 6 + e.seed) * 0.35, 6.5, dt, 12);
      e.piqT = (e.piqT ?? 0.5 + Math.random()) - dt;
      if (d < 0.5 && e.piqT <= 0 && G.piqures < D.piqures && c.alive) { e.piqT = 1.5 + Math.random() * 2; G.piqures++; play.hurt(lerp(D.degats[0], D.degats[1], Math.random()), e, D.cause); play.nausea = Math.max(play.nausea || 0, 0.5); game.shakeT = Math.max(game.shakeT || 0, 0.15); }
      e.bzT = (e.bzT ?? 0) - dt;
      if (e.bzT <= 0) { e.bzT = 1 + Math.random(); e1.cri(e, 'e1_frelon', 1.3, 15); }
      if (G.colereT <= 0 || dN > 26 || !c.alive || c.inside) { G.colere = 0; G.trop = 0; }
      return true;
    }
    // la ronde : autour du nid, des allées et venues ; une sentinelle vient tourner autour de la tête de qui s'approche
    if (dN < 5 && e === G.ents[0]) { E1V.vers(e, c.px + Math.sin(c.t * 3) * 0.8, game.player.pos[1] + 1.7, c.pz + Math.cos(c.t * 3) * 0.8, 3.5, dt, 10); return true; }
    e.ang += dt * (1.4 + e.seed / 100);
    const sortie = Math.sin(c.t * 0.25 + e.seed) > 0.5 ? 6 + (e.seed % 5) : 0;
    const x = N.x + Math.cos(e.ang) * (e.rayon + sortie), z = N.z + Math.sin(e.ang) * (e.rayon + sortie), y = N.y - 0.3 + Math.sin(c.t * 1.3 + e.seed) * 0.6 + sortie * 0.3;
    E1V.vers(e, x, y, z, 2.8, dt, 8);
    return true;
  },
  pelerin(e, dt, w, c) {
    const G = e.G, V = this.lieux(w).ville, C = V.clocher;
    e.t1 -= dt; e.criT = (e.criT ?? 20 + Math.random() * 40) - dt;
    if (G.part && e.mo === 'flèche') { e.mo = 'part'; e.cible = [e.x + Math.sin(e.heading) * 400, C.pointe + 50, e.z + Math.cos(e.heading) * 400]; }
    switch (e.mo) {
      case 'flèche': e.fly = 0; e.x = C.x; e.z = C.z; e.y = C.pointe + 0.02; e.lookY = Math.sin(c.t * 0.3 + e.seed) * 1.3;
        if (e.criT <= 0) { e.criT = 50 + Math.random() * 70; if (e.dist < 90) this.criOiseau(e, 'e1_pelerin', 0.9, 120); }
        if (e.t1 <= 0) { e.mo = 'haut'; e.t1 = 20 + Math.random() * 25; e.ang = Math.random() * TAU; } break;
      case 'haut': {
        e.fly = 1; e.volM = Math.sin(c.t * 0.4 + e.seed) > 0.4 ? 'bat' : 'plane';
        e.ang += dt * 0.25; const x = C.x + Math.cos(e.ang) * 35, z = C.z + Math.sin(e.ang) * 35;
        E1V.vers(e, x, C.pointe + 30, z, 11, dt, 2);
        if (e.t1 <= 0) {
          // un pigeon de la place ?
          let pg = null; for (const q of entities.list) if (q.kind === 'pigeon' && !q.dead && !q.hidden && Math.hypot(q.x - V.x, q.z - V.z) < 80 && (!pg || Math.random() < 0.3)) pg = q;
          if (pg && Math.random() < 0.6) { e.mo = 'pique'; e.proie = pg; this.cri(e, 'e1_pique', 1, 80); }
          else { e.mo = 'retour'; }
        }
        break;
      }
      case 'pique': {
        const pg = e.proie;
        if (!pg || pg.dead || pg.removed) { e.mo = 'retour'; break; }
        e.fly = 1; e.volM = 'pique';
        const d = E1V.vers(e, pg.x, pg.y + 0.2, pg.z, 26, dt, 8);
        if (d < 6 && !e.effraye) { e.effraye = true; for (const q of entities.list) if (q.kind === 'pigeon' && !q.dead && Math.hypot(q.x - pg.x, q.z - pg.z) < 12) { q.flyT = 3 + Math.random() * 2; q.flyH0 = 0.3; q.heading = Math.random() * TAU; } sound.flutter && sound.flutter(1, 0); }
        if (d < 0.6) {
          if (Math.random() < 0.3) { // pris : quelques plumes grises, et il remonte
            for (let k = 0; k < 14; k++) particles.spawn(pg.x, pg.y + 0.4, pg.z, (Math.random() - 0.5) * 2, Math.random() * 1.2, (Math.random() - 0.5) * 2, [0.6, 0.62, 0.68, 1], 0.05, 3 + Math.random() * 2, -0.25, false);
            pg.dead = true; pg.hidden = true;
          }
          e.mo = 'retour'; e.proie = null; e.effraye = false;
        }
        break;
      }
      case 'retour': e.fly = 1; e.volM = 'bat'; if (E1V.vers(e, C.x, C.pointe + 0.02, C.z, 12, dt, 3) < 0.2) { e.mo = 'flèche'; e.t1 = 60 + Math.random() * 120; } break;
      case 'part': e.fly = 1; e.volM = 'bat'; if (E1V.vers(e, e.cible[0], e.cible[1], e.cible[2], 14, dt, 2) < 2) e.hidden = true; break;
      default: e.mo = 'flèche';
    }
    return true;
  },
  // le putois acculé : une odeur à vous retourner l'estomac
  empester(e) {
    for (let k = 0; k < 26; k++) particles.spawn(e.x + (Math.random() - 0.5) * 0.6, e.y + 0.2, e.z + (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.5, 0.1 + Math.random() * 0.25, (Math.random() - 0.5) * 0.5, [0.48, 0.46, 0.22, 0.25], 0.35, 4 + Math.random() * 3, 0, false);
    this.cri(e, 'e1_putois', 1.2, 25);
    if (game.player && Math.hypot(game.player.pos[0] - e.x, game.player.pos[2] - e.z) < 4) { play.nausea = Math.max(play.nausea || 0, 1.0); this.pueT = E1_DANGER.putois.nausee; this.pense('putois', '(Une odeur à vous retourner l’estomac.)', 3.5); }
    e.cache = 0; e.state = 'flee';
  },
  pueT: 0,
  // le faucon tombe sur un campagnol (s'il y en a un, tout près)
  prendCampagnol(e) {
    for (const G of this.actifs) if (G.kind === 'campagnol_champs') for (const q of G.ents) if (!q.dead && Math.hypot(q.x - e.x, q.z - e.z) < 6) { q.dead = true; q.hidden = true; this.cri(q, 'e1_couine', 0.8, 30); return; }
  },
  trotte(e) { this.son([e.x, e.y, e.z], 'e1_trotte', game.player && Math.hypot(game.player.pos[0] - e.x, game.player.pos[2] - e.z) < 30 ? 1 : 0.5, 4); },
  grillonVit() { const E = this.S(); return !!E && !(E.grillon.mort && farm.s.day - E.grillon.mort < 20); },
});
// les noms (chasse, pièges)
Object.assign(CHASSE_NOMS, {
  crecerelle: 'le faucon', buse: 'la buse', caille: 'la caille', vanneau: 'le vanneau', outarde: 'l’outarde', belette: 'la belette', campagnol_champs: 'le campagnol', hanneton: 'le hanneton',
  sauterelle: 'la sauterelle', machaon: 'le papillon', cheveche: 'la chevêche', putois: 'le putois', lerot: 'le lérot', rat_noir: 'le rat', bergeronnette: 'la bergeronnette',
  etourneau: 'l’étourneau', esculape: 'la couleuvre', frelon: 'le frelon', grillon_foyer: 'le grillon', epeire: 'l’araignée', hirondelle_f: 'l’hirondelle', choucas: 'le choucas',
  freux: 'le freux', pelerin: 'le faucon', petit_duc: 'le petit-duc', surmulot: 'le rat', fouine: 'la fouine', alyte: 'le crapaud', grand_paon: 'le papillon', escargot: 'l’escargot',
});
// les pièges laissés la nuit dans les prés et près des fermes prennent aussi des belettes, des putois, des fouines
if (typeof CHASSE_PRISES !== 'undefined') { CHASSE_PRISES.pres.push('belette', 'putois'); if (CHASSE_PRISES.foret) CHASSE_PRISES.foret.push('fouine'); }
// le filet prend les insectes et les papillons
if (typeof nature2 !== 'undefined') Object.assign(nature2.PRISES, { hanneton: 'hanneton', sauterelle: 'sauterelle', machaon: 'machaon', grand_paon: 'grand_paon' });
// manger un escargot cru : on le regrette
if (typeof ALIMENTS_EFFETS !== 'undefined') Object.assign(ALIMENTS_EFFETS, { escargot: { c: 'un escargot cru', r: [['nausee', 0.7, 10, 60], ['coliques', 0.35, 40, 150]] } });

// ============================================================================
//  LES BRANCHEMENTS
// ============================================================================
{
  // les conduites passent avant les autres (et ne laissent rien aux conduites communes)
  const _uw = entities.updateWalker.bind(entities);
  entities.updateWalker = function (e, dt, w, c) {
    if (e.cfg.e1 && e1.fige) return; // (les essais : on les pose, elles ne bougent plus)
    if (e.cfg.e1 && !e.owner && !e.piege) {
      // (blessée de loin, elle a peur : chaque conduite le lit dans e.peurT)
      if (e.state === 'flee') { e.state = 'idle'; e.peurT = 4; }
      if (e.peurT > 0) e.peurT -= dt;
      const B = E1_CONDUITES[e.kind];
      if (B) { try { if (B(e, dt, w, c) !== false) return; } catch (err) { console.error(err); e.hidden = true; return; } }
    }
    _uw(e, dt, w, c);
  };
  // au dessin : l'ombre est à leur taille, et seulement quand elles touchent le sol (pas sous un faucon en vol)
  const MIENNES = Object.keys(CREATURES).filter((k) => CREATURES[k].e1).map((k) => CREATURES[k]);
  const _draw = entities.draw.bind(entities);
  entities.draw = function (buf, sbuf, cam, maxD, t, flags) {
    for (const C of MIENNES) C.fly = true; // (dans le dessin, « fly » ne sert qu'à taire l'ombre commune)
    try { _draw(buf, sbuf, cam, maxD, t, flags); } finally { for (const C of MIENNES) delete C.fly; }
    const w = game.world;
    if (!sbuf || !w) return;
    const m2 = Math.min(maxD, 60) ** 2;
    for (const G of e1.actifs) for (const e of G.ents) {
      if (e.hidden || e.far || e.dead || e.removed || e.fly || e.grimpe || e.mur) continue;
      const dx = e.x - cam[0], dz = e.z - cam[2];
      if (dx * dx + dz * dz < m2 && e.y < w.heightAt(e.x, e.z) + 0.25) drawShadow(sbuf, e.x, e.y, e.z, e.cfg.ombre * (e.scale || 1));
    }
  };
}
// chaque image : le peuplement (espacé), les lieux (le nid, les toiles, le grillon, le grenier)
HOOKS.update.push((dt, eye, basis, sky, playing) => {
  const s = farm.s, w = game.world;
  if (!s || !w || game.kind !== 'farm') return;
  try {
    if ((weather.cur.rain || 0) > 0.15) e1.pluieT = game.time;
    if (e1.pueT > 0) { e1.pueT -= dt; play.nausea = Math.max(play.nausea || 0, 0.25 * clamp(e1.pueT / 10, 0, 1)); }
    e1.T -= dt;
    if (e1.T <= 0) { e1.T = 2.5; e1.peupler(eye, basis.f); }
    if (playing) e1.lieuxMaj(dt, eye);
  } catch (err) { console.error(err); }
});
HOOKS.load.push(() => { e1.actifs = []; e1.T = 3; e1.pueT = 0; e1.S(); });

// ============================================================================
//  LES LIEUX : le nid de frelons (et son bourdonnement), les toiles, les nids
//  d'hirondelles et de freux ; le grillon et le grenier qu'on entend
// ============================================================================
Object.assign(e1, {
  lieuxMaj(dt, eye) {
    const w = game.world, L = this.lieux(w), p = game.player, E = this.S();
    if (!E || p.underground) return;
    const F = L.ferme;
    // le bourdonnement du nid (placé ; il s'éteint seul quand on s'éloigne)
    if (F && F.nid && sound.source && sound.ok) {
      const d = Math.hypot(eye[0] - F.nid.x, eye[2] - F.nid.z), actif = this.nidActif() && this.dans(this.heure(), [7.5, 20.5]);
      sound.source('e1_nid', 'e1_essaim', [F.nid.x, F.nid.y - 0.2, F.nid.z], actif && d < 18 ? clamp(1.15 - d / 15, 0, 1) : 0, { ref: 2, roll: 1.1, tau: 0.6 });
    }
    // les toiles : qui passe au travers les déchire (une pensée, la première fois)
    if (F) {
      this.toileT = (this.toileT || 0) - dt;
      if (this.toileT <= 0) {
        this.toileT = 0.2;
        for (const T of F.toiles) {
          if ((E.toiles[T.id] || -1) >= farm.s.day) continue;
          const dx = p.pos[0] - T.x, dz = p.pos[2] - T.z;
          if (dx * dx + dz * dz > 0.6 * 0.6) continue;
          const nx = Math.sin(T.r), nz = Math.cos(T.r), plan = Math.abs(dx * nx + dz * nz);
          if (plan < 0.25 && Math.abs(T.y - (p.pos[1] + 1.0)) < T.R + 0.8) { E.toiles[T.id] = farm.s.day; this.pense('toile', '(Une toile, en plein visage.)', 2.5); }
        }
      }
    }
    // la nuit, dans la maison : le grillon sans qu'on le voie ; le lérot au grenier
    this.nuitT = (this.nuitT || 4) - dt;
    if (this.nuitT <= 0) {
      this.nuitT = 3;
      const h = this.heure(), nuit = this.dans(h, [21, 5]);
      if (F && F.maison && nuit && game.insideBuilding && game.insideBuilding('ferme')) {
        const M = F.maison;
        if (Math.random() < 0.05) this.son([M.x + (Math.random() - 0.5) * M.W * 0.6, M.egout + 0.6, M.z + (Math.random() - 0.5) * M.D * 0.6], Math.random() < 0.5 ? 'e1_lerot' : 'e1_trotte', 0.6, 3);
      }
      // le grillon qui s'est tu : la première nuit, la maison semble trop calme
      if (F && F.foyer && nuit && E.grillon.mort && !E.grillon.dit && game.insideBuilding && game.insideBuilding('ferme') && farm.s.day > E.grillon.mort) { E.grillon.dit = 1; ui.subtitle('', '(La maison est trop silencieuse, cette nuit.)', 3.5); }
    }
  },
  dessiner(buf) {
    const w = game.world, L = this.lieux(w), E = this.S(), p = game.player;
    if (!E || p.underground) return;
    PE.buf = buf;
    const P = p.pos, F = L.ferme, V = L.ville, h = this.heure();
    if (F) {
      if (F.nid && this.nidPresent() && Math.hypot(P[0] - F.nid.x, P[2] - F.nid.z) < 120) {
        PE.frame(F.nid.x, F.nid.y, F.nid.z, 0, 1); PE.fl = game.target && game.target.e1nid ? FX_HI : 0;
        E1_LIEUX_MODELES.guepier(PE, { vide: !this.nidActif() }); PE.fl = 0;
      }
      for (const T of F.toiles) {
        if ((E.toiles[T.id] || -1) >= farm.s.day || Math.hypot(P[0] - T.x, P[2] - T.z) > 22) continue;
        PE.frame(T.x, T.y, T.z, T.r, 1); PE.fl = game.target && game.target.e1toile === T ? FX_HI : 0;
        E1_LIEUX_MODELES.toile(PE, { R: T.R, rosee: h > 5 && h < 9.5 }); PE.fl = 0;
      }
    }
    if (V) {
      const dV = Math.max(Math.abs(P[0] - V.x), Math.abs(P[2] - V.z));
      if (dV < 160) for (const n of V.nids) { PE.frame(n.x, n.y, n.z, n.r, 1); E1_LIEUX_MODELES.nid_hirondelle(PE); }
      const C = V.corbeautiere;
      if (C && Math.hypot(P[0] - C.x, P[2] - C.z) < 260) for (const n of C.nids) { PE.frame(n.x, n.y, n.z, n.r, 1); E1_LIEUX_MODELES.nid_freux(PE); }
    }
  },
  // ce qu'on prend à la main (E) : l'escargot, le hanneton posé, la sauterelle (accroupi), la toile, le nid vide
  cibles(eye, f, cand) {
    const w = game.world, L = this.lieux(w), E = this.S();
    if (!E) return;
    for (const G of this.actifs) {
      if (!['escargot', 'hanneton', 'sauterelle'].includes(G.kind)) continue;
      for (const e of G.ents) {
        if (e.dead || e.hidden || e.removed || e.fly) continue;
        const dx = e.x - eye[0], dy = e.y + 0.03 - eye[1], dz = e.z - eye[2], d = Math.hypot(dx, dy, dz);
        if (d > 2.4 || (dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1) < 0.9) continue;
        cand({ kind: 'hook', e1bete: e, use: () => this.prendre(e) }, d);
      }
    }
    const F = L.ferme;
    if (!F) return;
    for (const T of F.toiles) {
      if ((E.toiles[T.id] || -1) >= farm.s.day) continue;
      const dx = T.x - eye[0], dy = T.y - eye[1], dz = T.z - eye[2], d = Math.hypot(dx, dy, dz);
      if (d > 2.2 || (dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1) < 0.85) continue;
      cand({ kind: 'hook', e1toile: T, use: () => this.prendreToile(T) }, d + 0.05);
    }
    if (F.nid && this.nidPresent()) {
      const N = F.nid, dx = N.x - eye[0], dy = N.y - 0.25 - eye[1], dz = N.z - eye[2], d = Math.hypot(dx, dy, dz);
      if (d < 2.6 && (dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1) > 0.8) cand({ kind: 'hook', e1nid: true, use: () => this.prendreNid() }, d);
    }
  },
  prendre(e) {
    if (e.kind === 'sauterelle' && (game.player.crouch < 0.5 || Math.random() < 0.4)) { e.saut = 1; e.heading = Math.random() * TAU; return; }
    farm.give(e.kind, 1); play.flyer(e.kind, [e.x, e.y + 0.05, e.z], 1);
    sound.pop && sound.pop();
    entities.remove(e);
    if (e.G) e.G.ents = e.G.ents.filter((q) => q !== e);
  },
  prendreToile(T) {
    const E = this.S();
    E.toiles[T.id] = farm.s.day;
    farm.give('toile_epeire', 1); play.flyer('toile_epeire', [T.x, T.y, T.z], 1);
    sound.pop && sound.pop();
  },
  prendreNid() {
    const E = this.S(), F = this.lieux(game.world).ferme;
    if (this.nidActif()) { // on ne prend pas un nid habité : ils sortent tous
      const G = this.actifs.find((q) => q.kind === 'frelon');
      if (G) { G.colere = 1; G.colereT = E1_DANGER.frelon.colere; G.piqures = 0; }
      else { play.hurt(E1_DANGER.frelon.degats[0], null, E1_DANGER.frelon.cause); sound.hurt && sound.hurt(); }
      this.son([F.nid.x, F.nid.y, F.nid.z], 'e1_frelon', 1.4, 3);
      return;
    }
    E.nid.pris = farm.s.day;
    farm.give('nid_frelon', 1); play.flyer('nid_frelon', [F.nid.x, F.nid.y, F.nid.z], 1);
    sound.pop && sound.pop();
  },
});
HOOKS.draw.push((buf) => { if (farm.s && game.world) e1.dessiner(buf); });
HOOKS.target.push((eye, f, cand) => { if (farm.s && game.world && game.kind === 'farm') e1.cibles(eye, f, cand); });
// frapper le nid : la colère
HOOKS.primary.push((eye, basis, held) => {
  if (held || !farm.s || game.kind !== 'farm') return false;
  const L = e1.lieux(game.world).ferme;
  if (!L || !L.nid || !e1.nidActif()) return false;
  const N = L.nid, d = Math.hypot(N.x - eye[0], N.y - 0.25 - eye[1], N.z - eye[2]);
  if (d > 2.6) return false;
  const f = basis.f, cos = ((N.x - eye[0]) * f[0] + (N.y - 0.25 - eye[1]) * f[1] + (N.z - eye[2]) * f[2]) / d;
  if (cos < 0.85) return false;
  const G = e1.actifs.find((q) => q.kind === 'frelon');
  if (G) { G.colere = 1; G.colereT = E1_DANGER.frelon.colere; G.piqures = 0; }
  return false; // (le coup part quand même)
});
// les objets nouveaux se vendent là où l'on vend déjà leurs semblables
{
  const ajoute = (id, objets) => { const n = typeof NPC_BY_ID !== 'undefined' && NPC_BY_ID[id]; if (n && n.shop && n.shop.buys) for (const o of objets) if (!n.shop.buys.includes(o)) n.shop.buys.push(o); };
  ajoute('alchimiste', ['plume_faucon', 'plume_rapace', 'musc_putois', 'toile_epeire', 'nid_frelon', 'hanneton', 'sauterelle']);
  ajoute('chasseur', ['peau_putois', 'peau_fouine', 'peau_belette', 'plume_faucon', 'plume_rapace']);
  ajoute('colporteur', ['peau_fouine', 'peau_putois', 'machaon', 'grand_paon']);
  ajoute('maire', ['hanneton', 'machaon', 'grand_paon']); // (le hannetonnage, et le maire collectionne)
  ajoute('aubergiste', ['escargot', 'escargots_cuits']);
  ajoute('pecheur', ['sauterelle', 'hanneton']); // (des appâts)
  ajoute('guerisseuse', ['toile_epeire', 'escargot', 'plume_rapace']);
}
