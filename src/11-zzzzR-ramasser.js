// ============================================================================
//  DES OBJETS À RAMASSER UN PEU PARTOUT (agent R, vague 13)
//  On trouve des choses en se promenant, posées à la vue : E (« Ramasser … »),
//  et c'est dans la sacoche — sans ouvrir de meuble. Le long des chemins et au
//  bord des champs, au pied des arbres (les fruits tombés, en saison), sur les
//  seuils, dans les rues et sur les places, au bord de l'eau (ce qu'elle
//  ramène), dans la forêt et la lande (ce qu'on y a perdu), près des lieux-dits
//  et des ruines, dans les maisons (sur un meuble, par terre) et les granges.
//  - La pose : une passe de génération, APRÈS toutes les autres (tirage propre,
//    mulberry32(graine ^ 0x52414d31)) : elle ne touche ni w.objects, ni
//    w.props, ni w.inter (les empreintes ne bougent pas) ; elle écrit la liste
//    w.ramasse.L = [{ k (sorte), x, y, z, r, tx, tz (pente), v, m (milieu),
//    b (bâtiment), o (arbre), t (lettre) }] et sa signature.
//  - L'état : farm.s.ramasse = { v, sig, p (ce qui est pris : un bit par
//    trouvaille, en base64), r ({ rang: jour } : ce qui revient, tant que ça
//    n'est pas revenu), n (combien en tout), l (les lettres lues), vu (les
//    pensées déjà venues) }.
//    Une sauvegarde d'avant se charge sans rien (tout est là) ; si la liste a
//    changé (signature), ce qui était pris est oublié (tout revient).
//  - Fluidité : rien sur w.objects ni w.props à chaque image. Une grille de
//    cases de 16 m ; la touche E ne regarde que les cases voisines ; le dessin
//    va dans le tampon des objets posés, reconstruit par le moteur (tous les
//    30 m, ou quand on ramasse) ; un éclat de soleil, de près, sur ce qui
//    brille (tampon dynamique, quelques boîtes au plus).
//  - Chez quelqu'un (dans sa maison, sur un meuble ou par terre), prendre est
//    un vol si l'on est vu : les règles de 11-zzzz2-objets.js (objets.lieu,
//    objets.consequences). Dehors, ce qui traîne est à qui le trouve.
//  - Les autres agents de la vague : rien n'est montré ni ramassable à moins de
//    25 m des lieux de la quête du nonos (nonos.lieux()) ni dans les endroits des
//    bêtes qui parlent (betesParlantes.places()) ; vérifié au fil de la partie.
//  API : ramasser (liste(), visible(i), prendre(i), enSaison(sorte, jour),
//        proches(x, z, r), compter(), S()).
// ============================================================================

const RAM_REGL = {
  cellule: 16,     // m : cases de la grille des trouvailles
  dessin: 72,      // m : on dessine les trouvailles à moins de tant du point où le moteur reconstruit les objets posés
  portee: 2.6,     // m : à portée de main
  eclat: 9,        // m : l'éclat de soleil des petits objets qui brillent, de près
  nonos: 25,       // m : rien autour des lieux de la quête du nonos (agent Q)
  betes: 3,        // m : de marge autour des endroits des bêtes qui parlent (agent P)
};
// les meubles sur lesquels une chose peut traîner (pas dedans : dessus)
const RAM_SUPPORTS = new Set(['table', 'etagere', 'commode', 'buffet', 'secretaire', 'petrin', 'malle', 'tonneau', 'tonneau_vieux', 'caisse', 'caisses',
  'etabli', 'banc', 'cheminee', 'gueridon', 'b1_toilette', 'coffre_vieux']);
// les arbres dont les fruits tombent : la sorte, et la part des arbres qui en ont au pied (près des maisons, plus)
const RAM_VERGERS = { apple: ['pommes', 0.025, 0.07], poirier: ['poires', 0.3, 0.4], prunier: ['prunes', 0.3, 0.4], cerisier: ['cerises', 0.3, 0.4],
  noyer: ['noix', 0.22, 0.35], chataignier: ['chataignes', 0.25, 0.35], hetre: ['faines', 0.1, 0.15] };
// les lieux-dits, par milieu (clé ou sorte du lieu)
const RAM_LIEUX = {
  saint: ['chapelle', 'eglise', 'cimetiere', 'calvaire', 'oratoire', 'croix_col', 'croix_avalanche', 'croix_peste', 'chapelle_ruine', 'tombe_isolee',
    'lanterne_morts', 'source_sacree', 'calvaire_trois', 'arbre_offrandes', 'source'],
  ancien: ['cercle', 'dolmen', 'menhirs', 'menhir', 'cromlech', 'dolmen_petit', 'pierre_cupules', 'pierre_branlante', 'pierre_sel', 'borne_ancienne',
    'rocher_marques', 'abri_sous_roche', 'pierre_offrandes', 'pierre_dame'],
  ruine: ['ruines', 'hameau_abandonne', 'chateau', 'abbaye', 'tour', 'tour_ruine', 'moulin_ruine', 'refuge_ruine', 'bergerie_ruine', 'ferme_brulee',
    'vieux_puits', 'puits_perdu', 'charrette_abandonnee', 'four_chaux', 'glaciere', 'jardin_clos', 'borie'],
  camp: ['campement', 'roulotte_a', 'roulotte_b', 'roulottes', 'camp_abandonne', 'charbonniere', 'loge_charbonnier', 'cabane_bucheron', 'affut',
    'cabane_perchee', 'relais_chasse', 'galerie_prospecteur'],
  estive: ['estive', 'estive_jasse', 'estive_feu', 'estive_pre', 'estive_crete', 'estive_plan', 'bergerie'],
  rue: ['lavoir', 'marche', 'puits_ville'],
};
const RAM_GRANDES_RUINES = new Set(['ruines', 'hameau_abandonne', 'chateau', 'abbaye']);
// les cours des fermes et des maisons des champs (où l'on trouve ce qui traîne autour d'une maison) ; les basses-cours
const RAM_COURS = ['ferme', 'maison_hameau_a', 'maison_hameau_b', 'ranch', 'cabane_pecheur', 'hutte_ermite', 'c2_mf87', 'c2_mf132', 'pl_doyenne', 'pl_vanniere',
  'pl_passeur', 'pl_fumoir', 'es_baile', 'es_fromagerie', 'es_patre', 'relais_chasse', 'roulotte_a', 'roulotte_b', 'g1_cabane_hameau', 'source_a', 'source_b', 'source_c'];
const RAM_POULES = new Set(['maison_hameau_a', 'maison_hameau_b', 'ranch', 'g1_cabane_hameau']);
// les bâtiments qui ne sont pas des maisons : ce qu'on y trouve est d'un autre milieu (les tours des remparts : 'tour…')
const RAM_BLD_MILIEU = { eglise: 'saint', forge: 'grange', es_fromagerie: 'grange', relais_chasse: 'camp', g1_corps_garde: 'tour' };

// ============================================================================
//  LA POSE (passe de génération)
// ============================================================================
const ramGen = {
  // les sortes possibles d'un milieu, avec leurs poids (dans l'ordre du catalogue : le tirage ne dépend que de lui)
  tables() {
    const T = {};
    for (const m of RAM_MILIEUX.concat(['poules', 'tour'])) T[m] = { k: [], c: [], t: 0 };
    for (const k of Object.keys(RAM_SORTES)) {
      const S = RAM_SORTES[k];
      if (!S || (S.it !== 'argent' && !ITEMS[S.it])) continue;
      for (const m of Object.keys(S.ou || {})) { const p = +S.ou[m]; if (!(p > 0) || !T[m]) continue; T[m].t += p; T[m].k.push(k); T[m].c.push(T[m].t); }
    }
    return T;
  },
  signature(L) {
    let h = 2166136261 >>> 0;
    for (const o of L) { const s = o.k + ',' + Math.round(o.x * 10) + ',' + Math.round(o.z * 10) + ';'; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } }
    return L.length + ':' + h.toString(36);
  },

  generer(w, seed) {
    if (!w || !w.nav || !w.objects || !w.heightAt) return null;
    const T0 = Date.now();
    const rnd = mulberry32(((seed | 0) ^ 0x52414d31) >>> 0), WL = w.waterLevel, S = w.size;
    const TAB = this.tables(), L = [], par = {};
    const tir = (m) => { const T = TAB[m]; if (!T || !T.t) return null; const r = rnd() * T.t; for (let i = 0; i < T.c.length; i++) if (r < T.c[i]) return T.k[i]; return T.k[T.k.length - 1]; };
    const biomeAt = (x, z) => (w.biome ? BIOMES[w.biome[clamp(Math.floor(z / 8), 0, w.biomeW - 1) * w.biomeW + clamp(Math.floor(x / 8), 0, w.biomeW - 1)]] : 'plaine');
    const milieu = (x, z) => (typeof milieuAt === 'function' ? milieuAt(w, x, z) : biomeAt(x, z) === 'foret' ? 'foret' : 'pres');

    // ---- ce qu'il faut éviter : objets posés (leur emprise), interactions, portes (grille de 8 m)
    const C = 8, OB = new Map(), cle = (x, z) => ((x / C) | 0) * 8192 + ((z / C) | 0);
    const marque = (x, z, y, r) => { const k = cle(x, z); let A = OB.get(k); if (!A) OB.set(k, (A = [])); A.push(x, z, y, r); };
    const rayons = {};
    const rayonProp = (q) => {
      const k = q.id + '|' + (q.s || 1);
      if (rayons[k] !== undefined) return rayons[k];
      let r = 0.6;
      try { const bb = typeof objModele === 'function' ? objModele({ id: q.id }).bb : null; if (bb) r = Math.hypot(bb.x1 - bb.x0, bb.z1 - bb.z0) / 2 * (q.s || 1); } catch (e) { /* rien */ }
      return (rayons[k] = clamp(r, 0.25, 4));
    };
    for (const q of w.props) if (q && !q.gone) marque(q.x, q.z, q.y || 0, rayonProp(q));
    for (const it of w.inter || []) if (it) marque(it.x, it.z, it.y || 0, 0.8);
    for (const d of w.doors || []) if (d && d.x !== undefined) marque(d.x, d.z, d.y || 0, 1.2);
    const obstacle = (x, z, y, m) => {
      for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
        const A = OB.get((((x / C) | 0) + dx) * 8192 + ((z / C) | 0) + dz);
        if (!A) continue;
        for (let i = 0; i < A.length; i += 4) { const rr = A[i + 3] + m; if (Math.abs(A[i] - x) < rr && Math.abs(A[i + 1] - z) < rr && Math.abs(A[i + 2] - y) < 2.4 && Math.hypot(A[i] - x, A[i + 1] - z) < rr) return true; }
      }
      return false;
    };
    // ---- mes trouvailles (espacement : 2 m de toute autre, d m de celles du même milieu)
    const MI = new Map(), MIL = {};
    const pres = (x, z, y, d, m) => {
      const mi = m ? (MIL[m] || (MIL[m] = Object.keys(MIL).length + 1)) : 0, n = Math.ceil(Math.max(d, 2.2) / C);
      for (let dx = -n; dx <= n; dx++) for (let dz = -n; dz <= n; dz++) {
        const A = MI.get((((x / C) | 0) + dx) * 8192 + ((z / C) | 0) + dz);
        if (!A) continue;
        for (let i = 0; i < A.length; i += 4) {
          if (Math.abs(A[i + 2] - y) > 2) continue;
          const e = Math.hypot(A[i] - x, A[i + 1] - z);
          if (e < Math.min(d, 2.2) || (e < d && (!mi || A[i + 3] === mi))) return true;
        }
      }
      return false;
    };
    // ---- un bloc (mur, plancher bas, marche) qui contient le point, entre y − 0,2 et y + haut
    const bloc = (x, z, y, haut, m) => {
      let hit = false;
      w.query(x, z, 1.5, null, (b) => {
        if (hit || b.hidden) return;
        const [lx, lz] = World.blockLocal(b, x, z);
        if (Math.abs(lx) > b.sx / 2 + m || Math.abs(lz) > b.sz / 2 + m) return;
        if (b.y < y + haut && b.y + b.sy > y - 0.2) hit = true;
      });
      return hit;
    };
    // ---- un arbre, un rocher (objet solide) trop proche
    const solide = (x, z, m) => {
      let hit = false;
      w.query(x, z, 2, (o) => { if (hit || o.gone) return; const t = OBJ_TYPES[o.t]; const r = t ? objRadius(t, o) : 0; if (r && Math.hypot(o.x - x, o.z - z) < r + m) hit = true; }, null);
      return hit;
    };
    const fd = w.farm && w.farm.field;
    const surChamp = (x, z) => !!fd && x > fd.x0 - 1.2 && x < fd.x1 + 2.2 && z > fd.z0 - 1.2 && z < fd.z1 + 2.2;
    // la pente du terrain, dans le repère de la trouvaille (tournée de r)
    const pente = (x, z, r) => {
      const n = w.normalAt(x, z), c = Math.cos(r), s = Math.sin(r);
      const nlx = c * n[0] - s * n[2], nlz = s * n[0] + c * n[2];
      return [Math.atan2(nlz, n[1]), -Math.asin(clamp(nlx, -1, 1))];
    };
    // ---- poser dehors : sur le terrain, au sec, à plat, hors des murs, des objets, des arbres
    const dehors = (x, z, m, opt) => {
      opt = opt || {};
      if (!w.inside(x, z, 24)) return null;
      const h = w.heightAt(x, z);
      if (opt.eau) { if (h < WL + 0.03 || h > WL + 1.1) return null; } else if (h < WL + 0.08) return null;
      if (w.normalAt(x, z)[1] < (opt.eau ? 0.72 : 0.8)) return null;
      if (surChamp(x, z)) return null;
      if (obstacle(x, z, h, opt.m === undefined ? 0.5 : opt.m)) return null;
      if (pres(x, z, h, opt.ecart || 3.5, m)) return null;
      if (bloc(x, z, h, opt.haut || 1.9, 0.25)) return null;
      if (solide(x, z, 0.3)) return null;
      return h;
    };
    const ajouter = (k, x, y, z, m, extra) => {
      const S = RAM_SORTES[k];
      if (!S) return null;
      const r = rnd() * TAU;
      const o = { k, x: Math.round(x * 100) / 100, y: Math.round(y * 1000) / 1000, z: Math.round(z * 100) / 100, r: Math.round(r * 100) / 100, tx: 0, tz: 0, v: Math.round(rnd() * 1000) / 1000, m, b: null, o: -1 };
      if (extra) Object.assign(o, extra);
      if (!o.b && !(extra && extra.plat)) { const [a, c] = pente(o.x, o.z, o.r); o.tx = Math.round(a * 1000) / 1000; o.tz = Math.round(c * 1000) / 1000; }
      delete o.plat;
      if (S.lire) o.t = (rnd() * RAM_LETTRES.length) | 0;
      L.push(o); par[m] = (par[m] || 0) + 1;
      const kk = cle(x, z); let A = MI.get(kk); if (!A) MI.set(kk, (A = [])); A.push(x, z, y, MIL[m] || (MIL[m] = Object.keys(MIL).length + 1));
      return o;
    };
    // la taille des choses : les toutes petites (moins de 7,5 cm) ne se voient pas dans l'herbe haute (touffes de 40 à
    // 75 cm) : dehors, on ne les pose que sur la terre nue, les pavés, le sable, la roche ; les moyennes, une fois sur deux
    const taille = {};
    for (const k of Object.keys(RAM_SORTES)) { const bb = typeof ramBoite === 'function' ? ramBoite(RAM_SORTES[k].mod) : null; taille[k] = !bb ? 1 : bb.r * 2 < 0.075 ? 0 : bb.r * 2 < 0.25 ? 1 : 2; }
    const herbe = (x, z) => { const mt = w.matAt(x, z); return mt === M_GRASS || mt === M_LUSH || mt === M_FLOWERS || mt === M_DRY; };
    const tirSol = (m, x, z) => {
      const hb = herbe(x, z);
      for (let e = 0; e < 5; e++) {
        const k = tir(m);
        if (!k) return null;
        if (!hb || taille[k] === 2 || (taille[k] === 1 && rnd() < 0.5)) return k;
      }
      return null;
    };
    // une sorte tirée pour un milieu, posée dehors au point donné (ou tout près)
    const poserDehors = (m, x, z, opt, essais) => {
      for (let e = 0; e < (essais || 3); e++) {
        const jx = e ? x + (rnd() - 0.5) * 3 : x, jz = e ? z + (rnd() - 0.5) * 3 : z;
        const h = dehors(jx, jz, m, opt);
        if (h === null) continue;
        const k = (opt && opt.k) || tirSol(m, jx, jz);
        if (!k) continue;
        return ajouter(k, jx, h, jz, m);
      }
      return null;
    };
    const tag = (n) => (n && n.tag ? n.tag.split(':')[0] : '');
    const N = w.nav;

    // ---------------------------------------------------- 1. les seuils et le pied des murs (près des portes)
    const blds = Object.keys(w.bld || {}).map((k) => [k, w.bld[k]]).filter(([, b]) => b && b.f && b.W && b.D && !b.under);
    for (const [k, b] of blds) {
      if (!b.out || rnd() >= 0.45 || k === 'ferme') continue;
      const dx = b.out[0] - b.f.x, dz = b.out[1] - b.f.z, dl = Math.hypot(dx, dz) || 1, ux = dx / dl, uz = dz / dl, s = rnd() < 0.5 ? -1 : 1, lat = 0.8 + rnd() * 0.6, av = -0.2 + rnd() * 0.6;
      poserDehors('seuil', b.out[0] - uz * lat * s + ux * av, b.out[1] + ux * lat * s + uz * av, { ecart: 2 }, 3);
    }
    // ---------------------------------------------------- 2. les rues, les places, les villages
    for (let i = 0; i < N.nodes.length; i++) {
      const n = N.nodes[i], t = tag(n);
      let p = 0, m = 'rue';
      if (t === 'rue') p = 0.18; else if (t === 'place') p = 1; else if (t === 'hameau') p = 1; else if (t === 'planches' || n.tag === 'village:planches') p = 0.6;
      else if (t === 'estive' || n.tag === 'village:estive') { p = 0.6; m = 'estive'; }
      if (!p) continue;
      const fois = t === 'place' ? 4 : t === 'hameau' ? 3 : 1;
      for (let f = 0; f < fois; f++) {
        if (rnd() >= p) continue;
        const a = rnd() * TAU, d = (t === 'place' || t === 'hameau' ? 3 + rnd() * 9 : rnd() * 2.2);
        poserDehors(m, n.x + Math.cos(a) * d, n.z + Math.sin(a) * d, { ecart: 9 }, 3);
      }
    }
    // ---------------------------------------------------- 3. le bord des chemins et des sentiers
    for (const [a, b] of N.edges || []) {
      const A = N.nodes[a], B = N.nodes[b];
      if (!A || !B) continue;
      const ta = tag(A), tb = tag(B), chemin = ta === 'chemin' && tb === 'chemin', sentier = !chemin && (ta === 'sentier' || tb === 'sentier') && ta !== 'rue' && tb !== 'rue';
      if (!chemin && !sentier) continue;
      const Lg = Math.hypot(B.x - A.x, B.z - A.z);
      if (Lg < 4 || Lg > 70) continue;
      if (rnd() >= (chemin ? 0.2 : 0.15) * Math.min(1.6, Lg / 22)) continue;
      const t = rnd(), ux = (B.x - A.x) / Lg, uz = (B.z - A.z) / Lg, s = rnd() < 0.5 ? -1 : 1, off = rnd() < 0.25 ? rnd() * 0.5 : 1.1 + rnd() * 1.3;
      poserDehors('chemin', A.x + (B.x - A.x) * t - uz * off * s, A.z + (B.z - A.z) * t + ux * off * s, { ecart: 28 }, 3);
    }
    // ---------------------------------------------------- 4. le pied des arbres à fruits
    const maisons = blds.map(([, b]) => [b.f.x, b.f.z]);
    const presMaison = (x, z) => { for (const [mx, mz] of maisons) if (Math.abs(mx - x) < 160 && Math.abs(mz - z) < 160 && Math.hypot(mx - x, mz - z) < 160) return true; return false; };
    const n0 = w.objects.length;
    for (let i = 0; i < n0; i++) {
      const ob = w.objects[i];
      if (!ob || ob.gone || ob.ver) continue;
      const t = OBJ_TYPES[ob.t], V = t && RAM_VERGERS[t.id];
      if (!V || rnd() >= (presMaison(ob.x, ob.z) ? V[2] : V[1])) continue;
      const a = rnd() * TAU, d = 0.9 + rnd() * 1.5, x = ob.x + Math.cos(a) * d, z = ob.z + Math.sin(a) * d;
      const h = dehors(x, z, 'verger', { ecart: 6, m: 0.3 });
      if (h !== null) ajouter(V[0], x, h, z, 'verger', { o: i });
    }
    // ---------------------------------------------------- 5. au bord de l'eau
    const berges = [];
    const bord = (x, z) => { for (let a = 0; a < 8; a++) { const t = a / 8 * TAU; if (w.heightAt(x + Math.cos(t) * 2.6, z + Math.sin(t) * 2.6) < WL - 0.05) return true; } return false; };
    for (const Lk of w.lakes || []) {
      if (!Lk || !(Lk.r > 7) || Lk.kind === 'douves') continue;
      const R = Lk.r, pas = Math.max(8, R * 0.25), nA = Math.max(8, Math.round(TAU * R / pas));
      for (let a = 0; a < nA; a++) {
        const t = a / nA * TAU + rnd() * 0.2, cx = Math.cos(t), cz = Math.sin(t);
        let mouille = false;
        for (let d = R * 0.4; d < R * 1.8 + 6; d += 1.2) {
          const x = Lk.x + cx * d, z = Lk.z + cz * d, h = w.heightAt(x, z);
          if (h < WL - 0.05) { mouille = true; continue; }
          if (mouille && h >= WL + 0.03) { const e = 0.5 + rnd() * 1.6; berges.push([x + cx * e, z + cz * e]); break; }
        }
      }
    }
    const DP = typeof VALLEY_DESIGN !== 'undefined' && w.designed && VALLEY_DESIGN.P ? VALLEY_DESIGN.P : null;
    if (DP && DP.rivers) for (const R of DP.rivers) for (let i = 1; i < R.pts.length; i++) {
      const [ax, az] = R.pts[i - 1], [bx, bz] = R.pts[i], Lg = Math.hypot(bx - ax, bz - az);
      for (let d = 0; d < Lg; d += 22) {
        const t = d / Lg, x = ax + (bx - ax) * t, z = az + (bz - az) * t, nx = -(bz - az) / Lg, nz = (bx - ax) / Lg;
        for (const s of [-1, 1]) for (let o = (R.w || 4) * 0.5; o < (R.w || 4) * 0.5 + 9; o += 1) { const px = x + nx * o * s, pz = z + nz * o * s; if (w.heightAt(px, pz) >= WL + 0.03) { berges.push([px + nx * s * (0.4 + rnd()), pz + nz * s * (0.4 + rnd())]); break; } }
      }
    }
    for (let i = berges.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; const tmp = berges[i]; berges[i] = berges[j]; berges[j] = tmp; }
    for (const [x, z] of berges) {
      if (rnd() >= 0.55) continue;
      if (!bord(x, z)) continue;
      poserDehors('eau', x, z, { eau: true, ecart: 36 }, 1);
    }
    // ---------------------------------------------------- 6. la forêt, la lande, les hauteurs, les prés (ce qu'on a perdu là)
    const neige = (w.snowLine || 1e4) - WL - 10;
    for (let z = 30; z < S - 30; z += 34) for (let x = 30; x < S - 30; x += 34) {
      const jx = x + (rnd() - 0.5) * 24, jz = z + (rnd() - 0.5) * 24, u = rnd();
      const h = w.heightAt(jx, jz);
      if (h < WL + 0.2) continue;
      const mi = milieu(jx, jz);
      let m = null, p = 0;
      if (mi === 'foret' || mi === 'bouleaux' || mi === 'sapiniere') { m = 'foret'; p = 0.13; }
      else if (mi === 'lande' || mi === 'combe') { m = 'lande'; p = 0.16; }
      else if ((mi === 'alpage' || mi === 'rochers') && h - WL < neige) { m = 'hauteurs'; p = 0.045; }
      else if (mi === 'pres') { m = 'pres'; p = 0.035; }
      if (!m || u >= p) continue;
      poserDehors(m, jx, jz, { ecart: 12 }, 3);
    }
    // ---------------------------------------------------- 7. les lieux-dits : croix et chapelles, pierres levées, ruines, campements, estive
    const classe = {};
    for (const m in RAM_LIEUX) for (const k of RAM_LIEUX[m]) classe[k] = m;
    for (const key of Object.keys(w.lm || {})) {
      const Lm = w.lm[key];
      if (!Lm || Lm.under || Lm.secret || !isFinite(Lm.x)) continue;
      const genre = Lm.c2 || key.replace(/\d+$/, ''), m = classe[genre] || classe[key];
      if (!m) continue;
      const grand = RAM_GRANDES_RUINES.has(key);
      let n = m === 'ruine' ? 1 + (rnd() < 0.6 ? 1 : 0) + (grand ? 2 : 0) : m === 'rue' ? 1 : (rnd() < 0.7 ? 1 : 0) + (rnd() < 0.3 ? 1 : 0);
      const R = clamp(Lm.r || 8, 4, 40);
      for (let j = 0; j < n; j++) { const a = rnd() * TAU, d = R * (0.25 + rnd() * 0.9) + rnd() * 3; poserDehors(m, Lm.x + Math.cos(a) * d, Lm.z + Math.sin(a) * d, { ecart: 4 }, 4); }
    }
    // ---------------------------------------------------- 8. les cours des fermes, les basses-cours, le bord des champs
    for (const k of RAM_COURS) {
      const b = w.bld && w.bld[k];
      if (!b || !b.f || b.under) continue;
      const m = RAM_POULES.has(k) ? 'poules' : 'cour', n = k === 'ferme' ? 2 : RAM_POULES.has(k) ? 1 + (rnd() < 0.6 ? 1 : 0) : (rnd() < 0.6 ? 1 : 0) + (rnd() < 0.3 ? 1 : 0);
      for (let j = 0; j < n; j++) { const a = rnd() * TAU, d = Math.max(b.W, b.D) * 0.5 + 1.5 + rnd() * 7; poserDehors(m, b.f.x + Math.cos(a) * d, b.f.z + Math.sin(a) * d, { ecart: 3 }, 5); }
    }
    if (fd) for (let j = 0; j < 2; j++) {
      const cote = (rnd() * 4) | 0, t = rnd();
      const x = cote === 0 ? fd.x0 - 1.8 : cote === 1 ? fd.x1 + 2.8 : fd.x0 + (fd.x1 - fd.x0) * t, z = cote === 2 ? fd.z0 - 1.8 : cote === 3 ? fd.z1 + 2.8 : fd.z0 + (fd.z1 - fd.z0) * t;
      poserDehors('champ', x, z, { ecart: 4 }, 4);
    }
    for (const k of ['hameau', 'ranch', 'moulin', 'bergerie', 'estive_pre']) {
      const Lm = w.lm && w.lm[k];
      if (!Lm) continue;
      for (let j = 0; j < 6; j++) { if (rnd() >= 0.4) continue; const a = rnd() * TAU, d = (Lm.r || 12) + 12 + rnd() * 30; poserDehors('champ', Lm.x + Math.cos(a) * d, Lm.z + Math.sin(a) * d, { ecart: 8 }, 3); }
    }
    // ---------------------------------------------------- 9. dans les maisons : sur un meuble, par terre
    const ptsProps = blds.length ? w.props.filter((q) => q && !q.gone) : [];
    for (const [k, b] of blds) {
      const f = b.f, c = Math.cos(f.r), s = Math.sin(f.r);
      const local = (x, z) => { const dx = x - f.x, dz = z - f.z; return [dx * c - dz * s, dx * s + dz * c]; };
      const mBase = RAM_BLD_MILIEU[k] || (/^tour_/.test(k) ? 'tour' : null), mInt = mBase || 'maison', mSol = mBase || 'sol';
      const niveaux = [b.y !== undefined ? b.y : f.y + 0.15];
      const NB = w.b1 && w.b1.niveaux && w.b1.niveaux[k];
      if (Array.isArray(NB)) for (const nv of NB) if (nv && isFinite(nv.y)) niveaux.push(nv.y);
      // les meubles de la maison
      const dedans = [];
      for (const q of ptsProps) {
        if (Math.abs(q.x - f.x) > b.W + b.D || Math.abs(q.z - f.z) > b.W + b.D) continue;
        const [lx, lz] = local(q.x, q.z);
        if (Math.abs(lx) > b.W / 2 - 0.05 || Math.abs(lz) > b.D / 2 - 0.05 || q.y < f.y - 0.6 || q.y > f.y + 14) continue;
        dedans.push(q);
      }
      // sur un meuble (deux au plus)
      let surMeuble = 0;
      for (const q of dedans) {
        if (surMeuble >= 2 || !RAM_SUPPORTS.has(q.id) || rnd() >= 0.3) continue;
        const P = this.surMeuble(w, q, rnd);
        if (!P) continue;
        if (obstacleInter(w, P[0], P[1], P[2])) continue;
        if (pres(P[0], P[2], P[1], 0.7)) continue;
        const kk = tir(mInt);
        if (kk && ajouter(kk, P[0], P[1], P[2], mInt, { b: k, plat: 1 })) surMeuble++;
      }
      // par terre, à chaque niveau
      for (const y0 of niveaux) {
        if (rnd() >= 0.4) continue;
        for (let e = 0; e < 6; e++) {
          const lx = (rnd() - 0.5) * (b.W - 1.2), lz = (rnd() - 0.5) * (b.D - 1.2);
          const x = f.x + lx * c + lz * s, z = f.z - lx * s + lz * c;
          const y = this.solLibre(w, k, b, x, z, y0, dedans, lx, lz);
          if (y === null || pres(x, z, y, 1)) continue;
          const kk = tir(mSol);
          if (kk) ajouter(kk, x, y, z, mSol, { b: k, plat: 1 });
          break;
        }
      }
    }
    // ---------------------------------------------------- 10. les granges et les tours (le grand fenil du hameau, le moulin, le phare)
    const H = w.lm && w.lm.hameau;
    if (H) {
      let fenil = null;
      w.query(H.x, H.z, 45, null, (b) => { if (!fenil && b.m === M_DIRT && b.sx * b.sz > 80 && b.sx * b.sz < 140 && !b.hidden) fenil = b; });
      if (fenil) {
        const yF = fenil.y + fenil.sy, cb = Math.cos(fenil.r), sb = Math.sin(fenil.r);
        for (let j = 0; j < 3; j++) {
          if (rnd() >= 0.8) continue;
          for (let e = 0; e < 5; e++) {
            const lx = (rnd() - 0.5) * (fenil.sx - 1.8), lz = (rnd() - 0.5) * (fenil.sz - 1.8), x = fenil.x + lx * cb + lz * sb, z = fenil.z - lx * sb + lz * cb;
            const g = w.groundAt(x, z, yF + 0.3, 0.4);
            if (!isFinite(g) || Math.abs(g - yF) > 0.15 || obstacle(x, z, g, 0.35) || pres(x, z, g, 1.2) || !ramVide(w, x, z, g, 1.6)) continue;
            const kk = tir(rnd() < 0.5 ? 'grange' : 'poules');
            if (kk) ajouter(kk, x, g, z, 'grange', { b: '_fenil', plat: 1 });
            break;
          }
        }
      }
    }
    for (const key of ['moulin', 'phare']) {
      const T = w.b2 && w.b2[key];
      if (!T || !Array.isArray(T.S) || !Array.isArray(T.R)) continue;
      for (let i = 0; i < T.S.length && i < T.R.length; i++) {
        if (rnd() >= 0.35) continue;
        for (let e = 0; e < 5; e++) {
          const a = rnd() * TAU, d = rnd() * T.R[i] * 0.55, x = T.x + Math.cos(a) * d, z = T.z + Math.sin(a) * d;
          const g = w.groundAt(x, z, T.S[i] + 0.3, 0.4);
          if (!isFinite(g) || Math.abs(g - T.S[i]) > 0.3 || obstacle(x, z, g, 0.3) || pres(x, z, g, 1) || !ramVide(w, x, z, g, 1.4)) continue;
          const kk = tir('tour');
          if (kk) ajouter(kk, x, g, z, 'tour', { b: '_' + key, plat: 1 });
          break;
        }
      }
    }
    const out = { L, n: L.length, par, sig: this.signature(L), ms: Date.now() - T0 };
    return out;
  },

  // le dessus d'un meuble, à un point tiré au hasard : [x, y, z] (monde), ou null (pas de place à plat, ou trop haut)
  surMeuble(w, q, rnd) {
    if (typeof objModele !== 'function') return null;
    let M;
    try { M = objModele({ id: q.id, v: q.v, data: q.data }); } catch (e) { return null; }
    if (!M || !M.bb || !M.formes) return null;
    const bb = M.bb, s = q.s || 1, c = Math.cos(q.r || 0), n = Math.sin(q.r || 0);
    for (let e = 0; e < 6; e++) {
      const lx = bb.x0 + 0.08 + (bb.x1 - bb.x0 - 0.16) * rnd(), lz = bb.z0 + 0.08 + (bb.z1 - bb.z0 - 0.16) * rnd();
      const top = ramDessusMeuble(M.formes, lx, lz, 1.45);
      if (top === null || top < 0.3) continue;
      // à plat sur quelques centimètres, et rien juste au-dessus
      let ok = true;
      for (const [ax, az] of [[0.05, 0], [-0.05, 0], [0, 0.05], [0, -0.05]]) { const t2 = ramDessusMeuble(M.formes, lx + ax, lz + az, top + 0.01); if (t2 === null || Math.abs(t2 - top) > 0.012) { ok = false; break; } }
      if (!ok || ramGeneAuDessus(M.formes, lx, lz, top, 0.12)) continue;
      return [q.x + (c * lx + n * lz) * s, q.y + top * s, q.z + (-n * lx + c * lz) * s];
    }
    return null;
  },
  // un point libre par terre dans une maison, au niveau y0 : la hauteur du plancher, ou null
  solLibre(w, k, b, x, z, y0, dedans, lx, lz) {
    // (la trappe d'un étage, et sa place autour)
    const NB = w.b1 && w.b1.niveaux && w.b1.niveaux[k];
    if (Array.isArray(NB)) for (const nv of NB) { const T = nv && nv.trappe; if (T && lx > T[0] - 0.6 && lx < T[1] + 0.6 && lz > T[2] - 0.6 && lz < T[3] + 0.6) return null; }
    const g = w.groundAt(x, z, y0 + 0.25, 0.4);
    if (!isFinite(g) || g < y0 - 0.06 || g > y0 + 0.14) return null;
    // ni sous un meuble, ni contre lui
    for (const q of dedans) {
      if (Math.abs(q.y - g) > 1.6 || Math.abs(q.x - x) > 3 || Math.abs(q.z - z) > 3) continue;
      let bb = null;
      try { bb = typeof objModele === 'function' ? objModele({ id: q.id, v: q.v, data: q.data }).bb : null; } catch (e) { bb = null; }
      const s = q.s || 1, c = Math.cos(q.r || 0), n = Math.sin(q.r || 0), dx = x - q.x, dz = z - q.z, qx = (c * dx - n * dz) / s, qz = (n * dx + c * dz) / s;
      const B = bb || { x0: -0.4, x1: 0.4, z0: -0.4, z1: 0.4 };
      if (qx > B.x0 - 0.18 && qx < B.x1 + 0.18 && qz > B.z0 - 0.18 && qz < B.z1 + 0.18) return null;
    }
    if (obstacleInter(w, x, g, z)) return null;
    return ramVide(w, x, z, g, 1.3) ? g : null;
  },
};
// rien de bâti juste au-dessus d'un plancher (marches, poutres, cloisons), et pas dans un mur
function ramVide(w, x, z, g, haut) {
  let hit = false;
  w.query(x, z, 1.2, null, (bl) => {
    if (hit || bl.hidden) return;
    const [bx, bz] = World.blockLocal(bl, x, z);
    if (Math.abs(bx) > bl.sx / 2 + 0.12 || Math.abs(bz) > bl.sz / 2 + 0.12) return;
    if (bl.y > g + 0.02 && bl.y < g + haut) hit = true;
    if (bl.y <= g - 0.02 && bl.y + bl.sy > g + 0.04) hit = true;
  });
  return !hit;
}
// une interaction ou une porte tout près (ce qu'on vise avec E là : on n'y met rien)
function obstacleInter(w, x, y, z) {
  for (const it of w.inter || []) if (it && Math.abs(it.x - x) < 0.9 && Math.abs(it.z - z) < 0.9 && Math.abs((it.y || 0) - y) < 1.8) return true;
  for (const d of w.doors || []) if (d && Math.abs(d.x - x) < 1.2 && Math.abs(d.z - z) < 1.2 && Math.abs((d.y || 0) - y) < 2) return true;
  return false;
}
// la verticale (lx, lz) du repère d'un meuble : la plus haute face sous yMax (null si aucune)
function ramDessusMeuble(F, lx, lz, yMax) {
  let top = null;
  for (const B of F) {
    const I = ramIntervalle(B, lx, lz);
    if (I && I[1] <= yMax + 1e-4 && (top === null || I[1] > top)) top = I[1];
  }
  return top;
}
// quelque chose dans [top + 0,004, top + haut] à cette verticale ?
function ramGeneAuDessus(F, lx, lz, top, haut) {
  for (const B of F) { const I = ramIntervalle(B, lx, lz); if (I && I[0] < top + haut && I[1] > top + 0.004) return true; }
  return false;
}
// l'intervalle de y où la verticale (lx, lz) traverse la boîte B ({ M (3 × 4), h }) ; null si elle la manque
function ramIntervalle(B, lx, lz) {
  const M = B.M, px = lx - M[3], pz = lz - M[11];
  let y0 = -1e9, y1 = 1e9;
  for (let a = 0; a < 3; a++) {
    const c1 = M[4 + a], c0 = M[a] * px + M[8 + a] * pz - c1 * M[7], h = B.h[a];
    if (Math.abs(c1) < 1e-9) { if (Math.abs(c0) > h) return null; continue; }
    let ya = (-h - c0) / c1, yb = (h - c0) / c1;
    if (ya > yb) { const t = ya; ya = yb; yb = t; }
    if (ya > y0) y0 = ya;
    if (yb < y1) y1 = yb;
    if (y0 > y1) return null;
  }
  return [y0, y1];
}
// la passe : après toutes les autres (P, Q, puis R ; avant le mode admin)
{
  const _gv = generateValley;
  generateValley = async function (seed, progress, gen) {
    const w = await _gv(seed, progress, gen);
    try { if (w && !w.ramasse) { const R = ramGen.generer(w, w.seed !== undefined ? w.seed : seed); if (R) w.ramasse = R; } } catch (e) { console.error('ramasser', e); }
    return w;
  };
}

// ============================================================================
//  LA PARTIE : l'état, ce qu'on voit, E, le dessin
// ============================================================================
const ramasser = {
  w: null, L: [], G: null, vis: null, bits: null, excl: null, exclCle: '', pollT: 0, cibleO: null, nVis: 0,

  // ------------------------------------------------------------------ l'état sauvegardé
  S() {
    const s = farm.s;
    if (!s) return null;
    let S = s.ramasse;
    if (!S || typeof S !== 'object' || Array.isArray(S)) S = s.ramasse = {};
    if (!S.v) S.v = 1;
    if (typeof S.p !== 'string') S.p = '';
    if (!S.r || typeof S.r !== 'object' || Array.isArray(S.r)) S.r = {};
    if (!Array.isArray(S.l)) S.l = [];
    if (!S.vu || typeof S.vu !== 'object' || Array.isArray(S.vu)) S.vu = {};
    if (!isFinite(S.n)) S.n = 0;
    return S;
  },
  liste() { return this.L; },
  enSaison(cle, jour) { return ramEnSaison(cle, jour === undefined ? (farm.s ? farm.s.day : 1) : jour); },

  // ------------------------------------------------------------------ chargement (partie neuve ou chargée)
  charger() {
    const w = game.world;
    this.w = null; this.L = []; this.G = null; this.vis = null; this.bits = null; this.excl = null; this.exclCle = ''; this.cibleO = null;
    if (!farm.s || game.kind !== 'farm' || !w || w !== farm.w) return;
    if (!w.ramasse) { try { w.ramasse = ramGen.generer(w, w.seed !== undefined ? w.seed : farm.s.seed); } catch (e) { console.error('ramasser', e); } }
    const R = w.ramasse;
    if (!R || !Array.isArray(R.L)) return;
    this.w = w; this.L = R.L;
    const S = this.S(), nb = Math.ceil(this.L.length / 8);
    // une liste qui a changé (une autre version du jeu) : ce qui était pris ne correspond plus à rien, on l'oublie
    if (S.sig && S.sig !== R.sig) { S.p = ''; S.r = {}; }
    S.sig = R.sig;
    this.bits = new Uint8Array(nb);
    if (S.p) { try { const t = atob(S.p); for (let i = 0; i < Math.min(nb, t.length); i++) this.bits[i] = t.charCodeAt(i); } catch (e) { S.p = ''; } }
    // la grille
    const C = RAM_REGL.cellule, G = new Map();
    this.L.forEach((o, i) => { const k = ((o.x / C) | 0) * 8192 + ((o.z / C) | 0); let A = G.get(k); if (!A) G.set(k, (A = [])); A.push(i); });
    this.G = G;
    this.purger();
    this.exclusions(true);
    this.rafraichir();
  },
  pris(i) { return !!(this.bits && (this.bits[i >> 3] >> (i & 7)) & 1); },
  marquer(i) {
    const S = this.S(), o = this.L[i], R = o && RAM_SORTES[o.k];
    if (!S || !R) return;
    if (R.rev > 0) S.r[i] = farm.s.day;
    else {
      this.bits[i >> 3] |= 1 << (i & 7);
      let t = '';
      for (let j = 0; j < this.bits.length; j++) t += String.fromCharCode(this.bits[j]);
      S.p = btoa(t);
    }
  },
  // ce qui revient : au bout de rev jours
  purger() {
    const S = this.S(), d = farm.s.day;
    if (!S) return;
    for (const k in S.r) {
      const o = this.L[+k], R = o && RAM_SORTES[o.k];
      if (!R || !(R.rev > 0) || d - S.r[k] >= R.rev || d < S.r[k]) delete S.r[k];
    }
  },
  // les lieux des autres (agents P et Q) : on n'y montre rien
  exclusions(force) {
    const Z = [];
    try { if (typeof nonos !== 'undefined' && nonos && typeof nonos.lieux === 'function') for (const p of nonos.lieux() || []) if (p && isFinite(p.x) && isFinite(p.z)) Z.push([p.x, p.z, RAM_REGL.nonos]); } catch (e) { /* rien */ }
    try { if (typeof betesParlantes !== 'undefined' && betesParlantes && typeof betesParlantes.places === 'function') for (const p of betesParlantes.places() || []) if (p && isFinite(p.x) && isFinite(p.z)) Z.push([p.x, p.z, (+p.r || 0) + RAM_REGL.betes]); } catch (e) { /* rien */ }
    const cle = Z.map((z) => z.map((v) => Math.round(v)).join(',')).join(';');
    if (!force && cle === this.exclCle) return false;
    this.exclCle = cle; this.excl = Z.length ? Z : null;
    return true;
  },
  exclu(o) {
    if (!this.excl) return false;
    for (const [x, z, r] of this.excl) if (Math.abs(o.x - x) < r && Math.abs(o.z - z) < r && Math.hypot(o.x - x, o.z - z) < r) return true;
    return false;
  },
  // ce qui se voit aujourd'hui (un octet par trouvaille)
  rafraichir() {
    const n = this.L.length;
    if (!this.vis || this.vis.length !== n) this.vis = new Uint8Array(n);
    if (!farm.s || !this.w) { this.vis.fill(0); return; }
    const S = this.S(), d = farm.s.day, w = this.w;
    let nv = 0;
    for (let i = 0; i < n; i++) {
      const o = this.L[i], R = RAM_SORTES[o.k];
      let v = 1;
      if (!R) v = 0;
      else if (R.rev > 0 ? S.r[i] !== undefined : this.pris(i)) v = 0;
      else if (R.saison && !ramEnSaison(R.saison, d)) v = 0;
      else if (o.o >= 0) { const t = w.objects[o.o]; if (!t || !w.live(t)) v = 0; }
      if (v && this.exclu(o)) v = 0;
      this.vis[i] = v; nv += v;
    }
    this.nVis = nv;
    farm.dirtyProps = true;
  },
  visible(i) { return !!(this.vis && this.vis[i]); },
  jour() { if (!this.w || !farm.s) return; this.purger(); this.rafraichir(); },
  compter() {
    const S = this.S();
    return { total: this.L.length, visibles: this.nVis, pris: S ? S.n : 0 };
  },
  proches(x, z, r) {
    const out = [];
    if (!this.G) return out;
    const C = RAM_REGL.cellule, n = Math.ceil(r / C);
    for (let gx = ((x / C) | 0) - n; gx <= ((x / C) | 0) + n; gx++) for (let gz = ((z / C) | 0) - n; gz <= ((z / C) | 0) + n; gz++) {
      const A = this.G.get(gx * 8192 + gz);
      if (A) for (const i of A) { const o = this.L[i]; if (this.vis[i] && Math.hypot(o.x - x, o.z - z) < r) out.push(i); }
    }
    return out;
  },

  // ------------------------------------------------------------------ où l'on agit : la vallée de tous les jours
  monde() {
    if (!farm.s || !farm.on || farm.s.over || game.kind !== 'farm' || !game.world || game.world !== farm.w || !this.w || !this.G) return false;
    try {
      if (typeof strange !== 'undefined' && strange.inEnvers && strange.inEnvers()) return false;
      if (typeof mondes !== 'undefined' && mondes.actuel && mondes.actuel()) return false;
      if (typeof souterrain !== 'undefined' && souterrain.actif) return false;
      if (typeof prison !== 'undefined' && prison.S && prison.S() && prison.S().actif) return false;
    } catch (e) { return false; }
    return true;
  },
  actif() { return this.monde() && !game.dying && !game.sleeping && !(typeof cine !== 'undefined' && cine.on); },

  // ------------------------------------------------------------------ E : la trouvaille sous le regard
  cible(eye, f, cand) {
    if (!this.actif()) return;
    const C = RAM_REGL.cellule, gx0 = ((eye[0] - 3) / C) | 0, gx1 = ((eye[0] + 3) / C) | 0, gz0 = ((eye[2] - 3) / C) | 0, gz1 = ((eye[2] + 3) / C) | 0, w = this.w;
    let best = -1, bs = 1e9, bd = 0, bdir = null;
    for (let gx = gx0; gx <= gx1; gx++) for (let gz = gz0; gz <= gz1; gz++) {
      const A = this.G.get(gx * 8192 + gz);
      if (!A) continue;
      for (const i of A) {
        if (!this.vis[i]) continue;
        const o = this.L[i], R = RAM_SORTES[o.k], bb = ramBoite(R.mod);
        const dx = o.x - eye[0], dy = o.y + bb.h * 0.5 - eye[1], dz = o.z - eye[2], d = Math.hypot(dx, dy, dz);
        if (d > RAM_REGL.portee || d < 0.05) continue;
        const cos = (dx * f[0] + dy * f[1] + dz * f[2]) / d, tol = Math.atan((bb.r + 0.1) / d);
        if (cos < Math.cos(Math.min(0.6, tol + 0.06))) continue;
        const sc = d * (1.6 - cos * 0.6) * 0.92;
        if (sc < bs) { bs = sc; best = i; bd = d; bdir = [dx / d, dy / d, dz / d]; }
      }
    }
    if (best < 0) return;
    const bh = w.raycastBlocks(eye, bdir, bd - 0.06);
    if (bh && !bh.block.hidden && bh.t < bd - 0.06) return;
    const th = w.raycastTerrain(eye, bdir, bd - 0.1);
    if (th && th.t < bd - 0.12) return;
    const o = this.L[best];
    cand({ kind: 'hook', ram: best, use: () => ramasser.prendre(best), lit: this.objetVise(best), f2lab: this.etiquette(best) }, bs);
  },
  // un « objet posé » pour la lueur de l'objet visé (le même modèle, au même endroit)
  objetVise(i) {
    const o = this.L[i];
    let q = this.cibleO;
    if (!q || q.i !== i) q = this.cibleO = { id: 'r_objet', i, x: o.x, y: o.y, z: o.z, r: o.r, s: 1, tx: o.tx, tz: o.tz, v: o.v, data: { k: o.k } };
    return q;
  },
  // à qui est-ce ? (dans une maison habitée seulement : dehors, ce qui traîne est à qui le trouve)
  lieu(o) {
    if (!o || !o.b || o.b[0] === '_') return null;
    if (typeof objets === 'undefined' || !objets.lieu) return null;
    try { const L = objets.lieu(o.x, o.y + 0.1, o.z); return L && (L.t === 'maison' || L.t === 'commerce') ? L : null; } catch (e) { return null; }
  },
  etiquette(i) {
    const o = this.L[i], R = RAM_SORTES[o.k];
    let t = R.lab;
    const L = this.lieu(o);
    if (L && L.own && L.own.st && L.own.st.alive) t += L.own.st.met ? ` (chez ${L.own.name})` : ' (chez quelqu’un)';
    return t;
  },

  // ------------------------------------------------------------------ ramasser
  prendre(i) {
    if (!this.actif() || !this.vis || !this.vis[i]) return false;
    const o = this.L[i], R = RAM_SORTES[o.k], S = this.S();
    if (!R || !S) return false;
    const n = ramNombre(R, o.v), pos = [o.x, o.y + 0.12, o.z];
    const L = this.lieu(o);
    this.marquer(i);
    this.vis[i] = 0; this.nVis = Math.max(0, this.nVis - 1);
    if (R.it === 'argent') { farm.earn(n); sound.coin && sound.coin(); if (ITEMS.vieille_piece) play.flyer('vieille_piece', pos, 1); }
    else { farm.give(R.it, n); play.flyer(R.it, pos, n); sound.pop && sound.pop(); }
    S.n++;
    farm.dirtyProps = true;
    if (game.hiProp && game.hiProp.id === 'r_objet') game.hiProp = null;
    this.cibleO = null;
    if (L && typeof objets !== 'undefined' && objets.consequences) {
      try { objets.consequences('ramasse', { L, cle: 'ram:' + i, pos, got: R.it === 'argent' ? [] : [[R.it, n]] }); } catch (e) { console.error('ramasser', e); }
    }
    if (R.lire) this.lire(o.t | 0, true);
    else if (R.pense && !S.vu[o.k]) { S.vu[o.k] = 1; setTimeout(() => { if (farm.s && !game.dying) ui.subtitle('', R.pense, 3.5); }, 500); }
    return true;
  },
  // une lettre trouvée : on la lit (et elle se relit ensuite, en main)
  lire(t, neuve) {
    const S = this.S(), T = RAM_LETTRES[((t % RAM_LETTRES.length) + RAM_LETTRES.length) % RAM_LETTRES.length];
    if (!S || !T) return;
    if (neuve && !S.l.includes(t)) S.l.push(t);
    ui.read(T.titre, T.texte, T.sign || '');
  },
  relire() {
    const S = this.S();
    if (!S || !S.l.length) { ui.subtitle('', '(L’encre a coulé. On ne lit plus rien.)', 3); return; }
    const parts = S.l.slice().reverse().map((t) => { const T = RAM_LETTRES[((t % RAM_LETTRES.length) + RAM_LETTRES.length) % RAM_LETTRES.length]; return T ? T.titre + '\n' + T.texte + (T.sign ? '\n— ' + T.sign : '') : ''; }).filter(Boolean);
    ui.read('Les papiers ramassés', parts.join('\n\n'));
  },

  // ------------------------------------------------------------------ le dessin (dans le tampon des objets posés)
  dessiner(buf, cam) {
    if (!this.monde() || !this.vis) return 0;
    const C = RAM_REGL.cellule, R = RAM_REGL.dessin, n = Math.ceil(R / C), cx = (cam[0] / C) | 0, cz = (cam[2] / C) | 0;
    const R2 = R * R, q = { id: 'r_objet', x: 0, y: 0, z: 0, r: 0, s: 1, tx: 0, tz: 0, v: 0, data: { k: '' } };
    let nb = 0;
    PE.buf = buf; PE.fl = 0; PE.tint = null;
    for (let gx = cx - n; gx <= cx + n; gx++) for (let gz = cz - n; gz <= cz + n; gz++) {
      const A = this.G.get(gx * 8192 + gz);
      if (!A) continue;
      for (const i of A) {
        if (!this.vis[i]) continue;
        const o = this.L[i], dx = o.x - cam[0], dz = o.z - cam[2];
        if (dx * dx + dz * dz > R2) continue;
        q.x = o.x; q.y = o.y; q.z = o.z; q.r = o.r; q.tx = o.tx; q.tz = o.tz; q.v = o.v; q.data.k = o.k;
        PE.frame(o.x, o.y, o.z, o.r, 1);
        PROP_MODELS.r_objet(PE, q);
        nb++;
      }
    }
    return nb;
  },
  // l'éclat de soleil sur ce qui brille, de près (tampon dynamique : une boîte par trouvaille, de temps en temps)
  eclats(buf, cam, t) {
    if (!this.actif() || !this.vis) return;
    const sky = game.sky;
    if (!sky || !(sky.day > 0.35)) return;
    const wc = typeof weather !== 'undefined' && weather.cur ? weather.cur : {};
    if ((wc.rain || 0) > 0.3 || (wc.fog || 0) > 0.6) return;
    const C = RAM_REGL.cellule, R = RAM_REGL.eclat, w = this.w;
    PE.buf = buf; PE.tint = null;
    for (let gx = ((cam[0] - R) / C) | 0; gx <= ((cam[0] + R) / C) | 0; gx++) for (let gz = ((cam[2] - R) / C) | 0; gz <= ((cam[2] + R) / C) | 0; gz++) {
      const A = this.G.get(gx * 8192 + gz);
      if (!A) continue;
      for (const i of A) {
        if (!this.vis[i]) continue;
        const o = this.L[i], S = RAM_SORTES[o.k];
        if (!S.brille) continue;
        const d = Math.hypot(o.x - cam[0], o.y - cam[1], o.z - cam[2]);
        if (d > R || d < 0.6) continue;
        const ph = (t * 0.37 + o.v * 7.31) % 1;
        if (ph > 0.07) continue;
        if (w.covered(o.x, o.y + 0.3, o.z)) continue;
        const bb = ramBoite(S.mod), k = Math.sin(ph / 0.07 * Math.PI), e = (0.01 + d * 0.003) * k;
        PE.fl = FX_EMIT;
        PE.frame(o.x, o.y + bb.h + 0.004, o.z, t * 0.5, 1);
        PE.box(bb.cx * 0.5, 0, bb.cz * 0.5, e, e, e * 0.3, [1.6, 1.5, 1.25], TL.plain, 0.6, 0, 0.785);
        PE.box(bb.cx * 0.5, 0, bb.cz * 0.5, e * 0.3, e, e, [1.6, 1.5, 1.25], TL.plain, 0.6, 0.785, 0);
        PE.fl = 0;
      }
    }
  },
};

// ---------------------------------------------------------------- branchements
// le dessin : quand le moteur reconstruit les objets posés (tous les 30 m, ou quand quelque chose change), on ajoute les trouvailles
{
  const _bp = play.buildProps.bind(play);
  play.buildProps = function (cam, sky) {
    const buf = this.propBuf, v0 = buf ? buf.ver : 0;
    const r = _bp(cam, sky);
    if (buf && buf.ver !== v0) {
      try { if (ramasser.dessiner(buf, cam)) buf.ver = (buf.ver || 0) + 1; } catch (e) { console.error('ramasser', e); }
    }
    return r;
  };
}
// une lettre ramassée se relit, en main (clic)
HOOKS.primary.push((eye, basis, held, it, id) => {
  if (id !== 'lettre_perdue' || held || !farm.s) return false;
  ramasser.relire(); play.cool = 0.4;
  return true;
});
HOOKS.target.push((eye, f, cand) => { try { ramasser.cible(eye, f, cand); } catch (e) { console.error('ramasser', e); } });
HOOKS.update.push((dt) => {
  if (!farm.s || !ramasser.w) return;
  const t = game.target;
  if (t && t.kind === 'hook' && t.ram !== undefined && t.lit) game.hiProp = t.lit;
  ramasser.pollT -= dt;
  if (ramasser.pollT <= 0) { ramasser.pollT = 4; if (ramasser.exclusions(false)) ramasser.rafraichir(); }
});
HOOKS.draw.push((buf, sbuf, cam, t) => { try { ramasser.eclats(buf, cam, t); } catch (e) { console.error('ramasser', e); } });
HOOKS.day.push(() => { try { ramasser.jour(); } catch (e) { console.error('ramasser', e); } });
HOOKS.load.push(() => { try { ramasser.charger(); } catch (e) { console.error('ramasser', e); } });
