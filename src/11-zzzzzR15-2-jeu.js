// ============================================================================
//  LES RUNES (agent R15, quinzième vague) — 3. LE JEU
//  - Les tablettes (E : « Une pierre gravée ») : on la prend ; elle rejoint les
//    autres (page « Runes » du menu) ; un son de pierre, une lueur.
//  - L'assemblage (runes.assembler) : trois runes. Domaine + signe + mesure :
//    un effet (une fois par jour ; un seul durable à la fois). La clé et deux
//    runes devant une dalle : elle s'ouvre si ce sont les siennes.
//  - Les effets (jamais nommés) : la pousse des cultures (farm.lenteur), les
//    fouilles (rollLoot), la pêche (l'attente, les prises qui décrochent),
//    l'allure, la nuit (plus claire, plus noire ; et, dans les Terres d'Avant, le
//    bruit des pas), la faim. Lône : d'un côté la nuit, de l'autre le jour.
//  - Le dessin : les tablettes et les dalles, dans le tampon dynamique (quatre
//    tablettes, trois dalles : rien sur w.objects). Les signes luisent à peine
//    la nuit et sous terre.
//  État : farm.s.runes = { v, t: { i: [runes] }, j (jour du dernier effet), e: { domaine: { r, s, m, fin } },
//         p: { porte: jour }, c: { porte: 1 } (coffre ouvert), n (assemblages), vus: { cle: 1 } }
//  API : runes.S(), tablettes(), nTablettes(), eveillee(), connues(), lire(ids), assembler(ids, porte),
//        k(domaine), actifs(), porteOuverte(id), porte(id), prendre(i), ecouter(fn), ouvrir(o)
// ============================================================================
const runes = {
  flashT: 0, lueurT: 0, anim: {}, auditeurs: [],
  S() {
    const s = farm.s;
    if (!s) return { t: {}, e: {}, p: {}, c: {}, vus: {}, j: -1, n: 0 };
    const R = s.runes || (s.runes = { v: 1, t: {}, j: -1, e: {}, p: {}, c: {}, n: 0, vus: {} });
    R.t = R.t || {}; R.e = R.e || {}; R.p = R.p || {}; R.c = R.c || {}; R.vus = R.vus || {};
    return R;
  },
  W() { return farm.w && farm.w.r15; },
  ecouter(fn) { this.auditeurs.push(fn); },
  dire(ev, a, b) { for (const fn of this.auditeurs) try { fn(ev, a, b); } catch (e) { console.error(e); } },
  voir(page, champ) { try { if (typeof decouvertes !== 'undefined' && decouvertes.voir) decouvertes.voir(page, champ); } catch (e) { console.error(e); } },

  // ------------------------------------------------------------- les tablettes
  tablettes() {
    const W = this.W(), S = this.S(), L = [];
    for (let i = 0; i < R15_REGL.tablettes; i++) {
      const T = W && W.tablettes.find((q) => q.i === i);
      L.push({ i, trouvee: !!S.t[i], runes: S.t[i] || null, lieu: T ? T.lieu : null });
    }
    return L;
  },
  nTablettes() { return Object.keys(this.S().t).length; },
  eveillee() { return this.nTablettes() >= R15_REGL.tablettes; },
  connues() { const S = this.S(), k = new Set(); for (const i in S.t) for (const r of S.t[i] || []) k.add(r); return R15_ORDRE.filter((r) => k.has(r)); },
  prendre(i) {
    const S = this.S(), W = this.W();
    if (S.t[i]) return false;
    const T = W && W.tablettes.find((q) => q.i === i);
    S.t[i] = (T && T.runes ? T.runes : i === 3 ? R15_DESSOUS : []).slice();
    const p = T ? [T.x, T.y + 0.3, T.z] : game.player.pos;
    try { sound.r15Pierre && sound.r15Pierre(p); } catch (e) { /* */ }
    if (T) puffAt(T.x, T.y + 0.2, T.z, [150, 140, 120], 8, 0.8, false);
    this.lueurT = 1.6;
    this.voir('sys:runes', 'tablette' + (i + 1));
    if (this.eveillee()) { this.voir('sys:runes', 'eveil'); setTimeout(() => { try { sound.r15Eveil && sound.r15Eveil(null, 0.6); } catch (e) { /* */ } }, 900); }
    try { if (typeof menus !== 'undefined' && menus.marque) menus.marque('runes', 1); } catch (e) { /* */ }
    this.dire('tablette', i, S.t[i]);
    // la tablette rejoint les autres : la page des runes s'ouvre, un instant après
    setTimeout(() => { try { if (game.mode === 'play' && !ui.panel && typeof runesUI !== 'undefined') runesUI.ouvrir({ nouvelle: i }); } catch (e) { console.error(e); } }, 900);
    return true;
  },

  // ------------------------------------------------------------- lire un assemblage
  // → { sorte: 'effet', d, r (rune du domaine), s, m } | { sorte: 'cle', runes } | null
  lire(ids) {
    if (!Array.isArray(ids) || ids.length !== 3 || new Set(ids).size !== 3 || ids.some((k) => !R15_RUNES[k])) return null;
    const by = { domaine: [], signe: [], mesure: [], cle: [] };
    for (const k of ids) by[R15_RUNES[k].sorte].push(k);
    if (by.cle.length === 1) return { sorte: 'cle', runes: ids.slice().sort() };
    if (by.domaine.length === 1 && by.signe.length === 1 && by.mesure.length === 1) return { sorte: 'effet', r: by.domaine[0], d: R15_RUNES[by.domaine[0]].d, s: by.signe[0], m: by.mesure[0] };
    return null;
  },
  // → { r: 'dort' | 'jour' | 'rien' | 'effet' | 'porte' | 'non', … }
  assembler(ids, porteId) {
    const S = this.S(), s = farm.s;
    if (!s || !this.eveillee()) return { r: 'dort' };
    if (ids.some((k) => !this.connues().includes(k))) return { r: 'rien' };
    const L = this.lire(ids);
    S.vus[ids.slice().sort().join('+')] = 1;
    if (porteId) {
      const P = R15_PORTES[porteId];
      if (!P || this.porteOuverte(porteId)) return { r: 'rien' };
      if (L && L.sorte === 'cle' && L.runes.join() === P.runes.slice().sort().join()) { this.ouvrirPorte(porteId); return { r: 'porte', porte: porteId }; }
      return { r: 'non' };
    }
    if (!L || L.sorte !== 'effet') return { r: 'rien' };
    if (S.j === s.day && R15_REGL.parJour <= 1) return { r: 'jour' };
    S.j = s.day; S.n = (S.n || 0) + 1;
    const fin = s.hours + (L.m === 'dar' ? R15_REGL.darJ * 24 : R15_REGL.filH);
    // un seul effet durable : le nouveau prend la place de l'ancien
    if (L.m === 'dar') for (const d in S.e) if (S.e[d].m === 'dar') delete S.e[d];
    S.e[L.d] = { r: L.r, s: L.s, m: L.m, fin };
    this.flashT = 0.9; this.lueurT = 2.2;
    try { sound.r15Eveil && sound.r15Eveil(null, 1); } catch (e) { /* */ }
    // ce que la rune du domaine et la mesure veulent dire, on l'apprend en le vivant
    this.voir('sys:runes', L.r); this.voir('sys:runes', L.m);
    this.dire('effet', L.d, S.e[L.d]);
    return { r: 'effet', d: L.d };
  },
  // le sens de l'effet d'un domaine, maintenant : +1 faveur, −1 défaveur, 0 rien
  k(d) {
    const s = farm.s, S = s && s.runes;
    if (!S || !S.e) return 0;
    const E = S.e[d];
    if (!E || !(E.fin > s.hours)) return 0;
    const sg = R15_RUNES[E.s];
    if (!sg) return 0;
    if (sg.s) return sg.s;
    const W = (typeof game !== 'undefined' && game.world) || farm.w, h = W ? (W.time || 0) * 24 : 12, nuit = h >= R15_REGL.nuit[0] || h < R15_REGL.nuit[1];
    return nuit ? 1 : -1;
  },
  actifs() { const s = farm.s, S = this.S(), L = []; for (const d in S.e) { const E = S.e[d]; if (E.fin > s.hours) L.push(Object.assign({ d, reste: E.fin - s.hours }, E)); } return L; },
  nettoyer() { const s = farm.s, S = s && s.runes; if (!S || !S.e) return; for (const d in S.e) if (!(S.e[d].fin > s.hours)) delete S.e[d]; },

  // ------------------------------------------------------------- les dalles
  porteOuverte(id) { return !!this.S().p[id]; },
  // la description d'une dalle et son monde
  porte(id) {
    const P = R15_PORTES[id];
    if (!P) return null;
    if (P.monde === 'zone') { const Z = typeof zone !== 'undefined' && zone.monde && zone.monde(); return Z && Z.r15 && Z.r15.portes.tertre ? { D: Z.r15.portes.tertre, w: Z } : null; }
    const W = this.W();
    return W && W.portes[id] ? { D: W.portes[id], w: farm.w } : null;
  },
  ouvrirPorte(id, sansBruit) {
    const S = this.S();
    if (!S.p[id]) S.p[id] = farm.s ? farm.s.day : 1;
    const P = this.porte(id);
    if (!P) return;
    const b = P.w.blocks[P.D.bloc];
    if (sansBruit) { if (b && !b.r15bas) { b.y -= 60; b.r15bas = true; P.w.grid = null; } this.anim[id] = 99; return; }
    this.anim[id] = 0;
    const d = P.D.dalle;
    try { sound.r15Dalle && sound.r15Dalle([d.x, d.y + 1, d.z]); } catch (e) { /* */ }
    this.flashT = 0.6;
    this.voir('sys:runes', 'gyve');
    if (R15_PORTES[id].lieu) this.voir('li:' + R15_PORTES[id].lieu, 'dedans');
    this.dire('porte', id);
  },
  // (chaque image) la dalle descend ; à la fin, le passage est libre
  majPortes(dt) {
    for (const id in this.anim) {
      const t = this.anim[id];
      if (t >= 99) continue;
      const nt = t + dt;
      this.anim[id] = nt;
      const P = this.porte(id);
      if (!P) continue;
      const d = P.D.dalle;
      if (Math.floor(nt * 3) !== Math.floor(t * 3) && Math.hypot(d.x - game.player.pos[0], d.z - game.player.pos[2]) < 30) puffAt(d.x, d.y + 0.1, d.z, [130, 120, 105], 4, 0.7, false);
      if (nt >= 2.6) {
        const b = P.w.blocks[P.D.bloc];
        if (b && !b.r15bas) { b.y -= 60; b.r15bas = true; P.w.grid = null; }
        this.anim[id] = 99;
      }
    }
  },
  baisse(id) { const t = this.anim[id]; if (t === undefined) return this.porteOuverte(id) ? 99 : 0; return t; },
  coffre(it) {
    const id = it.data.porte, S = this.S(), P = R15_PORTES[id];
    const ouvert = S.c[id];
    S.c[id] = 1;
    const titre = 'Le coffre';
    const objets = ouvert ? [] : () => rollLoot(P.table);
    if (typeof butin !== 'undefined' && butin.ouvrir && butin.ouvrir({ titre, cle: 'r15_' + id, objets, x: it.x, z: it.z })) return;
    if (ouvert) { sound.click && sound.click(); return; }
    for (const [k, n] of rollLoot(P.table)) { if (k === 'argent') { farm.earn(n); sound.coin && sound.coin(); continue; } farm.give(k, n); play.flyer(k, [it.x, it.y, it.z], n); }
    sound.lootOpen && sound.lootOpen();
  },

  // ------------------------------------------------------------- chargement
  charger() {
    this.anim = {};
    this.S();
    const W = this.W();
    if (!W) return;
    for (const id in W.portes) if (this.porteOuverte(id)) this.ouvrirPorte(id, true);
    for (const id in W.portes) { const D = W.portes[id], q = farm.w.props[D.coffre]; if (q && q.id === 'coffre_vieux' && this.S().c[id]) q.data = Object.assign({}, q.data || {}, { vide: true }); }
    farm.dirtyProps = true;
  },
  ouvrir(o) { if (typeof runesUI !== 'undefined') runesUI.ouvrir(o || {}); },

  // ------------------------------------------------------------- le dessin (tablettes, dalles)
  _L: [0, 0, 0],
  dessiner(buf, cam, t) {
    const w = game.world, S = this.S(), sky = game.sky, nuit = sky ? sky.night || 0 : 0;
    PE.buf = buf; PE.tint = null; PE.fl = 0;
    const dans = typeof zone !== 'undefined' && zone.dedans;
    if (!dans && w === farm.w && w.r15) {
      for (const T of w.r15.tablettes) {
        if (S.t[T.i]) continue;
        const d = Math.hypot(T.x - cam[0], T.z - cam[2]);
        if (d > 70) continue;
        this.tablette(T, d, (T.sous || nuit > 0.45) && d < 16, t);
      }
    }
    const portes = dans ? (w.r15 && w.r15.portes) : (w === farm.w && w.r15 && w.r15.portes);
    if (portes) for (const id in portes) {
      const D = portes[id], d = Math.hypot(D.dalle.x - cam[0], D.dalle.z - cam[2]);
      if (d > 80) continue;
      const tb = this.baisse(id);
      if (tb >= 99) continue;
      this.dalle(D, id, clamp(tb / 2.6, 0, 1), (D.sous || nuit > 0.45) && d < 14, t);
    }
    PE.fl = 0;
  },
  // un trait d'une rune (segment u0,v0 → u1,v1 dans un carré de côté s centré en (cx, cy)), sur la face z0, penché de rx
  trait(seg, cx, cy, s, z0, rx, col, miroir) {
    const [a0, v0, a1, v1] = seg, u0 = miroir ? 1 - a0 : a0, u1 = miroir ? 1 - a1 : a1;
    const x0 = cx + (u0 - 0.5) * s, y0 = cy + (0.5 - v0) * s, x1 = cx + (u1 - 0.5) * s, y1 = cy + (0.5 - v1) * s;
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, L = Math.hypot(x1 - x0, y1 - y0) + s * 0.1, ang = Math.atan2(y1 - y0, x1 - x0);
    const c = Math.cos(rx), sn = Math.sin(rx);
    PE.box(mx, my * c - z0 * sn, my * sn + z0 * c, L, s * 0.11, 0.012, col, TL.plain, 0, rx, ang);
  },
  tablette(T, d, luit, t) {
    const rx = -0.32, c = Math.cos(rx), sn = Math.sin(rx), pierre = [0.6, 0.58, 0.54];
    PE.frame(T.x, T.y, T.z, T.r, 1);
    const P = (y, z) => [y * c - z * sn, y * sn + z * c];
    { const [y, z] = P(0.27, 0); PE.box(0, y, z, 0.5, 0.7, 0.1, pierre, TL.stone, 0, rx, 0); }
    { const [y, z] = P(0.6, 0); PE.box(0, y, z, 0.42, 0.06, 0.09, [0.52, 0.5, 0.46], TL.stone, 0, rx, 0); }
    if (d > 28) return;
    const R = T.runes || [];
    const k = luit ? 0.55 + 0.25 * Math.sin(t * 1.3 + T.i) : 0;
    const col = luit ? [0.5 + k * 0.5, 0.75 + k * 0.4, 1.0 + k * 0.5] : [0.16, 0.15, 0.14];
    if (luit) PE.fl = FX_EMIT;
    R.forEach((r, j) => { const g = R15_RUNES[r]; if (g) for (const sg of g.segs) this.trait(sg, 0, 0.47 - j * 0.17, 0.13, 0.056, rx, col, true); });
    PE.fl = 0;
  },
  dalle(D, id, bas, luit, t) {
    const L = D.dalle, P = R15_PORTES[id], y = L.y - bas * (L.sy + 0.15);
    PE.frame(L.x, y, L.z, L.r, 1);
    PE.box(0, L.sy / 2, 0, L.sx, L.sy, L.sz, [0.62, 0.6, 0.56], TL.stone, 0, 0, 0);
    if (!P) return;
    const k = luit ? 0.5 + 0.2 * Math.sin(t * 1.1) : 0;
    const col = luit ? [0.45 + k * 0.5, 0.7 + k * 0.4, 0.95 + k * 0.5] : [0.15, 0.14, 0.13];
    const use = luit ? [0.35, 0.45, 0.55] : [0.4, 0.38, 0.35];
    const s = Math.min(0.3, L.sx / 4.2), z0 = -L.sz / 2 - 0.004, cy = Math.min(1.3, L.sy * 0.68);
    P.runes.forEach((r, j) => {
      const g = R15_RUNES[r];
      if (!g) return;
      const cx = (j - 1) * s * 1.35, efface = r === P.efface;
      if (luit && !efface) PE.fl = FX_EMIT;
      g.segs.forEach((sg, n) => { if (efface && n % 2) return; this.trait(sg, cx, cy, s, z0, 0, efface ? use : col, false); });
      PE.fl = 0;
    });
  },
};

// ---------------------------------------------------------------- les interactions
HOOKS.inter.r15_tablette = (it) => { runes.prendre(it.data.i); };
HOOKS.interVis.r15_tablette = (it) => !(farm.s && farm.s.runes && farm.s.runes.t && farm.s.runes.t[it.data.i]);
HOOKS.inter.r15_porte = (it) => { runes.ouvrir({ porte: it.data.porte }); };
HOOKS.interVis.r15_porte = (it) => !runes.porteOuverte(it.data.porte);
HOOKS.inter.r15_tresor = (it) => { runes.coffre(it); const P = runes.porte(it.data.porte), q = P && P.w.props[P.D.coffre]; if (q) { q.data = Object.assign({}, q.data || {}, { vide: true }); farm.dirtyProps = true; } };
HOOKS.interVis.r15_tresor = (it) => runes.porteOuverte(it.data.porte) && runes.baisse(it.data.porte) >= 99;

// ---------------------------------------------------------------- les effets
// la pousse des cultures
{
  const _l = farm.lenteur;
  farm.lenteur = function (n) { const v = _l.call(this, n), k = runes.k('recolte'); return k > 0 ? v * R15_REGL.recolte[0] : k < 0 ? v * R15_REGL.recolte[1] : v; };
}
// les fouilles : un second tirage, ou presque rien
{
  const _rl = rollLoot;
  rollLoot = function (key, rnd) {
    const a = _rl(key, rnd);
    const k = typeof farm !== 'undefined' && farm.s ? runes.k('chance') : 0;
    if (k > 0 && Math.random() < R15_REGL.chance[0]) { const out = {}; for (const [id, n] of a.concat(_rl(key, rnd))) out[id] = (out[id] || 0) + n; return Object.entries(out); }
    if (k < 0 && Math.random() < R15_REGL.chance[1]) return a.filter(() => Math.random() < 0.5).map(([id, n]) => [id, Math.max(1, Math.floor(n / 2))]);
    return a;
  };
}
// la pêche : une prise sur trois se décroche (sans un mot)
{
  const _cf = play.catchFish.bind(play);
  play.catchFish = function (F) {
    if (runes.k('peche') < 0 && Math.random() < R15_REGL.pecheFuite) { sound.reel && sound.reel(0.3); this.fish = null; return; }
    return _cf(F);
  };
}
// chaque image : l'allure, la faim, l'attente au bout de la ligne, les dalles qui descendent, la fin des effets
{
  const maj = (dt, eye, basis, sky, playing) => {
    if (!farm.s) return;
    runes.flashT = Math.max(0, runes.flashT - dt); runes.lueurT = Math.max(0, runes.lueurT - dt);
    runes.majPortes(dt);
    if ((runes._n = (runes._n || 0) + dt) > 5) { runes._n = 0; runes.nettoyer(); }
    const S = farm.s.runes;
    if (!S || !S.e || !Object.keys(S.e).length) return;
    const p = game.player, kp = runes.k('pas');
    if (kp) p.mods.speed *= kp > 0 ? R15_REGL.pas[0] : R15_REGL.pas[1];
    const kf = runes.k('faim'), w = game.world;
    if (kf && playing && !game.sleeping && w && w.dayLength) {
      const base = dt / w.dayLength * CORPS_JOUR.faim;
      if (kf > 0 && p.food > 0 && p.food < 100) p.food = Math.min(100, p.food + base * R15_REGL.faim[0]);
      else if (kf < 0) p.food = Math.max(0, p.food - base * R15_REGL.faim[1]);
    }
    const F = play.fish, kk = F && F.state === 'wait' ? runes.k('peche') : 0;
    if (kk > 0) F.t -= dt * R15_REGL.peche[0] / (1 - R15_REGL.peche[0]);
    else if (kk < 0) F.t += dt * (1 - 1 / (1 + R15_REGL.peche[1]));
  };
  maj.zone = true;
  HOOKS.update.push(maj);
}
// la nuit : plus claire, ou plus noire
{
  const ciel = (sky) => {
    if (!farm.s || sky.night < 0.2) return;
    const k = runes.k('nuit');
    if (!k) return;
    const n = sky.night;
    if (k > 0) { const a = R15_REGL.nuitAmb[0] * n; sky.amb = v3.add(sky.amb, v3.scale([0.16, 0.2, 0.2], a)); sky.moonCol = v3.add(sky.moonCol, v3.scale([0.1, 0.13, 0.14], a)); }
    else { const m = 1 - (1 - R15_REGL.nuitAmb[1]) * n; sky.amb = v3.scale(sky.amb, m); sky.moonCol = v3.scale(sky.moonCol, m); sky.fog = [sky.fog[0], sky.fog[1] * (0.75 + 0.25 * (1 - n))]; }
  };
  ciel.zone = true;
  HOOKS.sky.push(ciel);
}
// les pas, dans les Terres d'Avant
if (typeof furtif !== 'undefined' && furtif.pasEnPlus) furtif.pasEnPlus.push(() => { const k = runes.k('nuit'); return k > 0 ? 0.8 : k < 0 ? 1.25 : 1; });
// une lueur (l'éveil, une dalle qui s'ouvre)
{
  const fx = (f, tint) => { if (runes.flashT > 0) { tint[0] = 0.95; tint[1] = 0.85; tint[2] = 0.6; tint[3] = Math.max(tint[3], runes.flashT * 0.22); } };
  fx.zone = true;
  HOOKS.fx.push(fx);
  const lum = (eye) => {
    const L = [];
    if (runes.lueurT > 0 && game.player) { const p = game.player.pos; L.push({ x: p[0], y: p[1] + 1.2, z: p[2], r: 5 * Math.min(1, runes.lueurT), c: [0.9, 0.8, 0.6], d: 0 }); }
    const w = game.world, S = farm.s && farm.s.runes;
    if (w && w === farm.w && w.r15 && !(typeof zone !== 'undefined' && zone.dedans)) for (const T of w.r15.tablettes) {
      if (!T.sous || (S && S.t && S.t[T.i])) continue;
      const d = Math.hypot(T.x - eye[0], T.y - eye[1], T.z - eye[2]);
      if (d < 26) L.push({ x: T.x, y: T.y + 0.5, z: T.z, r: 2.2, c: [0.25, 0.38, 0.55], d });
    }
    return L;
  };
  lum.zone = true;
  HOOKS.lights.push(lum);
  const dr = (buf, sbuf, cam, t) => { try { if (farm.s) runes.dessiner(buf, cam, t); } catch (e) { console.error('runes', e); } };
  dr.zone = true;
  HOOKS.draw.push(dr);
}
HOOKS.load.push(() => { try { runes.charger(); } catch (e) { console.error('runes', e); } });
if (typeof zone !== 'undefined' && zone.sur) zone.sur('entrer', () => { try { const Z = zone.monde(), P = Z && Z.r15 && Z.r15.portes.tertre; if (P && runes.porteOuverte('tertre')) runes.ouvrirPorte('tertre', true); } catch (e) { console.error(e); } });
