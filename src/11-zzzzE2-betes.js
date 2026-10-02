// ============================================================================
//  LES BÊTES DE LA LANDE, DES HAUTEURS ET DU LAC (agent E2, douzième vague) :
//  où et quand elles paraissent ; la chasse, le filet, les marchands.
//  - Pas d'objet nouveau dans le monde (les empreintes ne bougent pas) : chaque
//    espèce a ses TERRITOIRES, tirés de la graine au chargement (la grille des
//    milieux, la pente, l'eau, l'altitude) — le busard a sa lande, le gypaète
//    sa falaise et son ossuaire, les foulques leur eau libre, la pie-grièche
//    son buisson. Une bête ne vit (entities.add) que quand on approche de son
//    territoire, à son heure (jour, nuit, crépuscule) et par son temps (le
//    lézard au soleil, la salamandre noire après la pluie…) ; hors de vue, elle
//    s'en va. Peu de bêtes à la fois (E2_BUDGET).
//  - Tuée ou prise, le territoire reste vide quelques jours (selon la rareté).
//  - Le gypaète laisse tomber des os sur les rochers : on en ramasse les éclats.
//  - La chasse : leurs noms (dépouilles, tableau), le gibier des chasseurs du
//    Chassedi, les prises des pièges ; le filet prend le sphinx, l'apollon et
//    le minotaure ; qui achète quoi.
//  État : farm.s.e2 = { v, vides: { 'espèce:n': jour }, prises: { espèce: n }, os }
//  API : e2betes (territoires(id), forcer(id, x, z, n), actives(), etat(), …)
// ============================================================================
const E2_BUDGET = 16;                       // bêtes vivantes à la fois (toutes espèces de l'agent E2)
const E2_VIDE = [1, 3, 6, 12, 20];          // jours sans bête après une mort ou une prise (selon la rareté)
const E2_ALT = {                            // altitude au-dessus de l'eau (m) pour les bêtes des hauteurs ; neige : permise
  campagnol_neiges: [30, 220, true], bartavelle: [18, 76], tetras_lyre: [20, 74], peliade: [15, 76], salamandre_noire: [24, 76],
  apollon: [24, 74], tichodrome: [25, 230, true], grand_duc: [8, 72], vautour_fauve: [30, 160, true], gypaete: [45, 240, true],
};
const e2betes = {
  T: null,                  // { w, liste: [territoires], grille: Map }
  actifs: new Set(),        // territoires dont les bêtes sont là
  t: 0, tPluie: 0,
  // ------------------------------------------------------------ état sauvegardé
  S() {
    const s = farm.s;
    if (!s) return null;
    const E = s.e2 && typeof s.e2 === 'object' ? s.e2 : (s.e2 = {});
    if (!E.v) E.v = 1;
    if (!E.vides || typeof E.vides !== 'object') E.vides = {};
    if (!E.prises || typeof E.prises !== 'object') E.prises = {};
    if (!(E.os >= 0)) E.os = 0;
    return E;
  },
  // ------------------------------------------------------------ les territoires (tirés de la graine)
  // conditions du lieu, selon la « place » de l'espèce
  convient(w, B, x, z) {
    const WL = w.waterLevel, h = w.heightAt(x, z), alt = h - WL;
    if (!w.inside(x, z, 20)) return false;
    const bi = BIOMES[w.biome[clamp(Math.floor(z / 8), 0, w.biomeW - 1) * w.biomeW + clamp(Math.floor(x / 8), 0, w.biomeW - 1)]];
    if (B.place !== 'eau' && B.place !== 'berge' && B.place !== 'ciel' && bi !== B.biome) return false;
    if (typeof interditDeBatir === 'function' && B.place !== 'ciel' && B.place !== 'eau' && interditDeBatir(x, z, 4)) return false;
    const A = E2_ALT[B.id];
    if (A) { if (alt < A[0] || alt > A[1]) return false; if (!A[2] && w.snowLine && h > w.snowLine - 8) return false; }
    const pente = E2C.pente(w, x, z);
    switch (B.place) {
      case 'sol': return alt > 0.5 && pente < 0.3;
      case 'pierres': return alt > 0.5 && (pente > 0.12 || !!E2C.objet(w, x, z, 9, E2_PIERRES)) && pente < 0.65;
      case 'buisson': return alt > 0.5 && pente < 0.35 && !!E2C.objet(w, x, z, 10, E2_BUISSONS);
      case 'alpage': return alt > 0.5 && pente < 0.3;
      case 'falaise': return alt > 3 && pente > 0.33;
      case 'eau': {
        if (h > WL - 0.8 || bi !== B.biome) return false;
        for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; if (w.heightAt(x + Math.sin(a) * 6, z + Math.cos(a) * 6) > WL - 0.4) return false; }
        return true;
      }
      case 'berge': {
        if (!(alt > 0.04 && alt < 0.9) || pente > 0.4) return false;
        let eau = false;
        for (let k = 0; k < 8 && !eau; k++) { const a = k / 8 * TAU; if (w.heightAt(x + Math.sin(a) * 4, z + Math.cos(a) * 4) < WL - 0.35) eau = true; }
        if (!eau) return false;
        // au bord du lac (le biome du lac à moins de 16 m)
        for (let k = 0; k < 8; k++) { const a = k / 8 * TAU, xx = x + Math.sin(a) * 12, zz = z + Math.cos(a) * 12; if (BIOMES[w.biome[clamp(Math.floor(zz / 8), 0, w.biomeW - 1) * w.biomeW + clamp(Math.floor(xx / 8), 0, w.biomeW - 1)]] === B.biome) return true; }
        return bi === B.biome;
      }
      case 'ciel': return bi === B.biome;
    }
    return true;
  },
  calculer(w) {
    const t0 = performance.now(), BW = w.biomeW, CELL = 64, N = Math.ceil(w.size / CELL), seed = (w.seed || 1) >>> 0;
    // la part de chaque milieu dans chaque case de 64 m (8 x 8 cases de 8 m)
    const parts = {};
    for (const nom of ['lande', 'hauteurs', 'lac']) parts[nom] = [];
    for (let cj = 0; cj < N; cj++) for (let ci = 0; ci < N; ci++) {
      const n = {};
      for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) {
        const bi = ci * 8 + i, bj = cj * 8 + j;
        if (bi >= BW || bj >= BW) continue;
        const b = BIOMES[w.biome[bj * BW + bi]];
        n[b] = (n[b] || 0) + 1;
      }
      for (const nom in parts) if ((n[nom] || 0) >= (nom === 'hauteurs' ? 32 : 12)) parts[nom].push([ci, cj]);
    }
    const liste = [];
    for (const B of E2_BETES) {
      let h = 0x2545F491 ^ seed;
      for (let i = 0; i < B.id.length; i++) h = Math.imul(h ^ B.id.charCodeAt(i), 0x01000193);
      const rnd = mulberry32((h ^ 0xE2B37) >>> 0);
      const cells = parts[B.biome].slice();
      for (let i = cells.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; [cells[i], cells[j]] = [cells[j], cells[i]]; }
      const ecart = B.biome === 'hauteurs' ? 90 : B.T > 3 ? 22 : 40, pris = [];
      for (const [ci, cj] of cells) {
        if (pris.length >= B.T) break;
        for (let essai = 0; essai < 10; essai++) {
          const x = ci * CELL + 4 + rnd() * (CELL - 8), z = cj * CELL + 4 + rnd() * (CELL - 8);
          if (!this.convient(w, B, x, z)) continue;
          if (pris.some((q) => Math.hypot(q.x - x, q.z - z) < ecart)) break;
          pris.push({ x, z });
          break;
        }
      }
      pris.forEach((q, k) => liste.push({ cle: B.id + ':' + k, B, x: q.x, z: q.z, k, ents: null }));
    }
    const grille = new Map();
    for (const T of liste) { const g = ((T.x / 128) | 0) + ',' + ((T.z / 128) | 0); if (!grille.has(g)) grille.set(g, []); grille.get(g).push(T); }
    this.T = { w, liste, grille, ms: Math.round(performance.now() - t0) };
    this.actifs = new Set();
    return this.T;
  },
  // les territoires d'une espèce (ou tous)
  territoires(id) { if (!this.T) this.calculer(game.world); return this.T.liste.filter((T) => !id || T.B.id === id); },
  // ------------------------------------------------------------ l'heure et le temps de chaque bête
  heureOk(B, h) {
    if (B.id === 'oedicneme' || B.h === 'toujours') return true;
    if (B.id === 'vautour_fauve') return h >= 9 && h < 17.5;
    if (B.h === 'jour') return h >= 6 && h < 19.5;
    if (B.h === 'nuit') return h >= 20.5 || h < 5;
    if (B.h === 'crepuscule') return h >= 17.5 || h < 7.5;
    return true;
  },
  tempsOk(B) {
    const wc = weather.cur, froid = (typeof vallee !== 'undefined' && vallee.snowK > 0.15) || wc.frost > 0.5;
    const pluie = wc.rain, orage = wc.storm > 0.3;
    const sangFroid = ['lezard_vert', 'peliade', 'couleuvre_viperine', 'calamite', 'salamandre_noire', 'apollon', 'sphinx_tete_mort', 'minotaure'];
    if (froid && sangFroid.includes(B.id)) return false;
    if (B.id === 'salamandre_noire') return pluie > 0.1 || E2C.pluieRecente() || wc.fog > 0.4;
    if (['lezard_vert', 'apollon', 'peliade'].includes(B.id)) return pluie < 0.1 && wc.fog < 0.5;
    if (B.id === 'vautour_fauve') return pluie < 0.2 && wc.cloud < 0.85;
    if (['foulque', 'harle', 'cormoran', 'oie_cendree', 'calamite', 'campagnol_amphibie', 'campagnol_neiges', 'genette', 'vison', 'minotaure'].includes(B.id)) return !orage;
    return pluie < 0.45 && !orage;
  },
  // ------------------------------------------------------------ naître, partir
  naitre(T, w) {
    const B = T.B, R = Math.random, n = B.g[0] + ((R() * (B.g[1] - B.g[0] + 1)) | 0), arr = [];
    const C = CREATURES[B.id];
    for (let k = 0; k < n; k++) {
      let x = T.x, z = T.z;
      if (k) for (let essai = 0; essai < 8; essai++) {
        const a = R() * TAU, d = 1.5 + R() * (C.fly ? 6 : 4), tx = T.x + Math.sin(a) * d, tz = T.z + Math.cos(a) * d, h = w.heightAt(tx, tz) - w.waterLevel;
        const ok = C.fly ? true : C.water ? h < -0.4 : h > 0.05;
        if (ok) { x = tx; z = tz; break; }
      }
      const v = B.id === 'peliade' ? (R() < 0.25 ? 3 : (R() * 2) | 0) : (R() * 4) | 0;
      const e = entities.add(w, B.id, x, z, { v, scale: 0.92 + R() * 0.16 });
      e.hx = T.x; e.hz = T.z; e.terr = T; e.groupe = arr; e.heading = R() * TAU;
      if (e.rig) e.rig.e2e = e;
      if (C.fly) {
        const sol = Math.max(w.heightAt(x, z), w.waterLevel);
        e.y = sol + ({ busard_sm: 4, sphinx_tete_mort: 1.2, apollon: 0.8, vautour_fauve: 60, gypaete: 40, mouette: 8, balbuzard: 25 }[B.id] || 5);
        e.fly = 1;
      } else if (B.id === 'grand_duc' || B.id === 'tichodrome') e.y = w.heightAt(x, z);
      arr.push(e);
    }
    T.ents = arr; T.ne = n;
    this.actifs.add(T);
    return arr;
  },
  retirer(T) {
    if (T.ents) for (const e of T.ents) if (!e.removed && !e.corpse) entities.remove(e);
    T.ents = null;
    this.actifs.delete(T);
  },
  // une mort, une prise : le territoire reste vide quelques jours
  vider(T, pris) {
    const E = this.S();
    if (!E) return;
    E.vides[T.cle] = farm.s.day + E2_VIDE[T.B.r] + (Math.random() < 0.5 ? 1 : 0);
    if (pris) E.prises[T.B.id] = (E.prises[T.B.id] || 0) + 1;
  },
  vide(T) { const E = this.S(); return !!(E && E.vides[T.cle] && farm.s.day < E.vides[T.cle]); },
  // ------------------------------------------------------------ chaque seconde (à peu près)
  maj(dt) {
    const s = farm.s, w = game.world, p = game.player;
    if (!s || !w || game.mode !== 'play' || game.kind !== 'farm') return;
    // la pluie : on s'en souvient (salamandres noires, calamites)
    if (weather.cur.rain > 0.15 && !p.underground) E2C.pluie.t = game.time;
    this.t -= dt;
    if (this.t > 0) return;
    this.t = 0.7;
    if (!this.T || this.T.w !== w) this.calculer(w);
    const ailleurs = p.underground || (typeof mondes !== 'undefined' && mondes.cur) || strange.inEnvers() || strange.redNight() || game.sleeping;
    const h = E2C.heure(), px = p.pos[0], pz = p.pos[2];
    let vivants = 0;
    // les bêtes présentes : mortes, prises, parties, trop loin
    for (const T of [...this.actifs]) {
      const R = Math.min(T.B.R, 200), d = Math.hypot(T.x - px, T.z - pz);
      let restent = 0, mort = false, pris = false;
      for (const e of (T.ents || []).slice()) {
        if (e.e2pris) { pris = true; continue; }                                  // pris au filet (déjà retiré du monde)
        if (e.dead || e.corpse) { mort = true; if (!e.corpse && !e.removed) entities.remove(e); continue; }
        if (e.removed) { T.ents.splice(T.ents.indexOf(e), 1); continue; }
        if (e.e2part && e.hidden) { entities.remove(e); T.ents.splice(T.ents.indexOf(e), 1); continue; }
        restent++;
      }
      if (mort || pris) {
        if (!T.vide1) { T.vide1 = true; if (!T.essai) this.vider(T, pris && !mort); }
        for (const e of T.ents || []) if (!e.dead && !e.removed) e.e2part = true; // les autres s'en vont
      }
      if (ailleurs || d > R + 45 || !restent) { this.retirer(T); T.vide1 = false; continue; }
      if (!this.heureOk(T.B, h) || !this.tempsOk(T.B)) for (const e of T.ents) if (!e.dead) e.e2part = true;
      vivants += restent;
    }
    if (ailleurs) return;
    // les territoires proches : qu'ils s'éveillent (les plus proches d'abord, dans le budget)
    const gx = (px / 128) | 0, gz = (pz / 128) | 0, cand = [];
    for (let j = gz - 2; j <= gz + 2; j++) for (let i = gx - 2; i <= gx + 2; i++) {
      const L = this.T.grille.get(i + ',' + j);
      if (!L) continue;
      for (const T of L) {
        if (this.actifs.has(T)) continue;
        const d = Math.hypot(T.x - px, T.z - pz);
        if (d > Math.min(T.B.R, 200)) continue;
        cand.push([d, T]);
      }
    }
    cand.sort((a, b) => a[0] - b[0]);
    for (const [, T] of cand) {
      if (vivants >= E2_BUDGET) break;
      if (this.vide(T) || !this.heureOk(T.B, h) || !this.tempsOk(T.B)) continue;
      // (les petites bêtes ne naissent pas sous les yeux : on attend de ne plus regarder, ou d'être plus loin)
      if (!CREATURES[T.B.id].fly && Math.hypot(T.x - px, T.z - pz) < 30 && E2C.vu({ x: T.x, z: T.z })) continue;
      vivants += this.naitre(T, w).length;
    }
  },
  // ------------------------------------------------------------ les os du gypaète
  majOs(dt) {
    const w = game.world;
    if (!E2C.os.length || !w) return;
    for (let i = E2C.os.length - 1; i >= 0; i--) {
      const O = E2C.os[i];
      O.vy -= 9.8 * dt; O.x += O.vx * dt; O.z += O.vz * dt; O.y += O.vy * dt; O.rot += dt * 7;
      const sol = w.heightAt(O.x, O.z);
      if (O.y > sol + 0.05) continue;
      E2C.os.splice(i, 1);
      O.y = sol + 0.03;
      const p = game.player, d = Math.hypot(O.x - p.pos[0], O.z - p.pos[2]);
      if (sound.e2Cri && d < 260) sound.e2Cri('os', clamp(1.1 - d / 260, 0.15, 1), [O.x, O.y + 0.2, O.z], true);
      if (typeof particles !== 'undefined') for (let k = 0; k < 8; k++) particles.spawn(O.x, O.y + 0.05, O.z, (Math.random() - 0.5) * 2, 1 + Math.random() * 2, (Math.random() - 0.5) * 2, [0.92, 0.9, 0.84, 1], 0.03, 0.8, 9, false);
      if (E2C.osSol.length < 3) E2C.osSol.push({ x: O.x, y: O.y, z: O.z, rot: O.rot });
    }
  },
  ramasserOs(O) {
    const i = E2C.osSol.indexOf(O);
    if (i < 0) return;
    E2C.osSol.splice(i, 1);
    farm.give('os_gypaete', 1); play.flyer && play.flyer('os_gypaete', [O.x, O.y + 0.2, O.z], 1);
    const E = this.S(); if (E) E.os++;
    sound.pop && sound.pop();
  },
  // ------------------------------------------------------------ au dessin : le lardoir de la pie-grièche ; les os
  _M: new Float32Array(12),
  dessiner(buf, cam) {
    const M = this._M;
    const boite = (x, y, z, cap, ox, oy, oz, sx, sy, sz, col, tex) => { m34Root(M, x, y, z, cap, 1); buf.box(M, ox, oy, oz, sx, sy, sz, col, tex); };
    for (const T of this.actifs) {
      if (T.B.id !== 'pie_grieche' || !T.ents) continue;
      for (const e of T.ents) {
        const L = e.lardoir;
        if (!L || e.dead || Math.hypot(L.x - cam[0], L.z - cam[2]) > 22) continue;
        // un hanneton, une sauterelle, un jeune lézard, piqués sur les épines
        const r = mulberry32(((L.s * 1000) | 0) + 7);
        const prises = [[[0.018, 0.012, 0.022], [0.16, 0.1, 0.06]], [[0.012, 0.012, 0.05], [0.42, 0.56, 0.22]], [[0.014, 0.01, 0.07], [0.36, 0.44, 0.22]]];
        for (let k = 0; k < 3; k++) {
          const a = r() * TAU, rr = 0.18 + r() * 0.2, y = L.y - r() * 0.25;
          const [s, col] = prises[k];
          boite(L.x + Math.sin(a) * rr, y, L.z + Math.cos(a) * rr, a, 0, 0, 0, s[0], s[1], s[2], col, TL.plain);
          boite(L.x + Math.sin(a) * rr, y, L.z + Math.cos(a) * rr, a, 0, 0.012, 0, 0.004, 0.035, 0.004, [0.3, 0.24, 0.16], TL.plain);
        }
      }
    }
    for (const O of E2C.os) boite(O.x, O.y, O.z, O.rot, 0, 0, 0, 0.05, 0.05, 0.3, [0.92, 0.9, 0.82], TL.bone);
    for (const O of E2C.osSol) {
      if (Math.hypot(O.x - cam[0], O.z - cam[2]) > 60) continue;
      boite(O.x, O.y, O.z, O.rot, 0, 0.02, 0, 0.04, 0.035, 0.22, [0.92, 0.9, 0.82], TL.bone);
      boite(O.x, O.y, O.z, O.rot + 1.2, 0.08, 0.015, 0.05, 0.03, 0.025, 0.09, [0.86, 0.84, 0.76], TL.bone);
    }
  },
  // ------------------------------------------------------------ pour les essais (et la mise au point)
  // fait naître une espèce près d'un point, sans condition (n bêtes) ; renvoie les bêtes
  forcer(id, x, z, n) {
    const B = E2_PAR_ID[id], w = game.world;
    if (!B || !w) return [];
    if (!this.T || this.T.w !== w) this.calculer(w);
    const T = { cle: id + ':essai', B: Object.assign({}, B, n ? { g: [n, n] } : {}), x, z, k: -1, ents: null, essai: true };
    return this.naitre(T, w);
  },
  actives() { const L = []; for (const T of this.actifs) for (const e of T.ents || []) if (!e.removed) L.push(e); return L; },
  etat() {
    const par = {};
    for (const T of this.T ? this.T.liste : []) par[T.B.id] = (par[T.B.id] || 0) + 1;
    return { territoires: this.T ? this.T.liste.length : 0, ms: this.T ? this.T.ms : 0, par, actifs: this.actifs.size, vivantes: this.actives().length, S: this.S() };
  },
};

// ---------------------------------------------------------------- la chasse : les noms, le gibier, les prises des pièges
if (typeof CHASSE_NOMS !== 'undefined') Object.assign(CHASSE_NOMS, {
  lezard_vert: 'le lézard vert', calamite: 'le crapaud', perdrix_rouge: 'la perdrix', pie_grieche: 'la pie-grièche', huppe: 'la huppe', oedicneme: 'l’œdicnème',
  busard_sm: 'le busard', minotaure: 'le minotaure', genette: 'la genette', sphinx_tete_mort: 'le sphinx', campagnol_neiges: 'le campagnol', bartavelle: 'la bartavelle',
  tetras_lyre: 'le tétras', peliade: 'la vipère', salamandre_noire: 'la salamandre', apollon: 'l’apollon', tichodrome: 'le tichodrome', grand_duc: 'le grand-duc',
  vautour_fauve: 'le vautour', gypaete: 'le gypaète', foulque: 'la foulque', mouette: 'la mouette', guignette: 'le chevalier', campagnol_amphibie: 'le rat d’eau',
  couleuvre_viperine: 'la couleuvre', oie_cendree: 'l’oie', harle: 'le harle', cormoran: 'le cormoran', balbuzard: 'le balbuzard', vison: 'le vison',
});
if (typeof CHASSE_GIBIER !== 'undefined') for (const k of ['perdrix_rouge', 'bartavelle', 'tetras_lyre', 'oie_cendree']) CHASSE_GIBIER.add(k);
if (typeof CHASSE_PRISES !== 'undefined') { if (CHASSE_PRISES.lande && !CHASSE_PRISES.lande.includes('genette')) CHASSE_PRISES.lande.push('genette'); }
// le filet : le sphinx, l'apollon, le minotaure
if (typeof nature2 !== 'undefined' && nature2.PRISES) Object.assign(nature2.PRISES, { sphinx_tete_mort: 'sphinx_tete_mort', apollon: 'apollon', minotaure: 'minotaure' });
{
  // le sphinx crie quand on le prend
  if (typeof nature2 !== 'undefined' && nature2.coupFilet) {
    const _cf = nature2.coupFilet.bind(nature2);
    nature2.coupFilet = function (eye, basis) {
      const e = this.cibleFilet(eye, basis.f);
      const r = _cf(eye, basis);
      if (e && e.removed && e.terr) { e.e2pris = true; if (e.kind === 'sphinx_tete_mort' && sound.e2Cri) sound.e2Cri('sphinx', 1, null, true); }
      return r;
    };
  }
}
// ---------------------------------------------------------------- qui achète quoi
{
  const S = (id) => { const d = NPC_DATA.find((x) => x.id === id); return d && d.shop ? d.shop : null; };
  const ajoute = (id, L) => { const s = S(id); if (s) { s.buys = s.buys || []; for (const k of L) if (ITEMS[k] && !s.buys.includes(k)) s.buys.push(k); } };
  ajoute('chasseur', ['peau_genette', 'peau_vison', 'plume_lyre']);
  ajoute('alchimiste', ['plume_huppe', 'os_gypaete', 'sphinx_tete_mort', 'plume_tichodrome', 'plume_balbuzard', 'plume_cormoran', 'plume_gypaete', 'minotaure']);
  ajoute('maire', ['apollon', 'plume_gypaete']);
}
// ---------------------------------------------------------------- branchements
HOOKS.update.push((dt) => { try { e2betes.maj(dt); e2betes.majOs(dt); } catch (err) { console.error(err); } });
HOOKS.draw.push((buf, sbuf, cam) => { try { if (e2betes.actifs.size || E2C.os.length || E2C.osSol.length) e2betes.dessiner(buf, cam); } catch (err) { console.error(err); } });
// les éclats d'os : on les ramasse (E)
HOOKS.target.push((eye, f, cand) => {
  for (const O of E2C.osSol) {
    const dx = O.x - eye[0], dy = O.y - eye[1], dz = O.z - eye[2], d = Math.hypot(dx, dy, dz);
    if (d > 2.6 || (dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1) < 0.7) continue;
    cand({ kind: 'hook', use: () => e2betes.ramasserOs(O) }, d);
  }
});
// une partie chargée ou commencée : les territoires de cette vallée, rien de vivant d'avant
HOOKS.load.push(() => {
  e2betes.S();
  e2betes.T = null; e2betes.actifs = new Set(); e2betes.t = 1.5;
  E2C.os.length = 0; E2C.osSol.length = 0; E2C.pluie.t = -1e9;
});
