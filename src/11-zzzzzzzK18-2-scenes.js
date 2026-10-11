// ============================================================================
//  LES RÉCITS DES PROCHES (agent K18) — 3. LES SCÈNES
//  Une scène de récit (05-zzzzzzzK18-*-arcs.js : scenes) se compose sur le
//  moteur de l'histoire (h17Cine : passer en maintenant Espace ou Échap, la
//  partie tenue pendant ce temps) : une scène (un lieu-dit, le seuil d'une
//  maison, une note posée ; repli : un autre lieu), des gens posés autour (les
//  habitants vivants, le joueur, quelques silhouettes : Rose, Lise, Jean,
//  Octave, la chose blanche), qui marchent si on le leur demande ; un plan
//  d'ensemble, puis un plan par réplique (sur celui qui parle), puis le noir.
//  Les habitants qui jouent sont cachés de la vallée le temps de la scène.
//  API : k18Scenes.construire(cle, k) → { plans, opts, ids } ou null (lieu absent).
// ============================================================================
const K18_SONS = {
  cloche: () => sound.bell && sound.bell(1),
  clochette: () => sound.bell && sound.bell(0.35),
  coups: () => sound.knock && sound.knock(3),
  murmure: () => sound.whisper && sound.whisper(0, 0.4),
  grondement: () => sound.rumble && sound.rumble(),
  corbeau: () => sound.crow && sound.crow(0.6),
};

const k18Scenes = {
  actif: null,
  sol(w, x, z) { const h = w.heightAt(x, z); return h < w.waterLevel ? w.waterLevel + 0.42 : h; },
  lookJoueur() {
    return farm.s && farm.s.fem
      ? { skin: '#e2b894', hair: '#5a3a22', hairStyle: 'long', top: '#7a6a58', bottom: '#4a3c30', dress: true, bust: 0.5, hips: 0.5 }
      : { skin: '#dcb08a', hair: '#4a3020', top: '#6a5a48', bottom: '#3a3830', hat: 'paille', beard: 'courte' };
  },
  // le centre de la scène, et d'où la regarder
  scene(def, w) {
    let L = null, a0 = def.angle;
    const lieu = def.lieu, devant = (B) => { L = { x: B.out[0], z: B.out[1] }; if (a0 === undefined && B.x !== undefined) a0 = Math.atan2(B.out[0] - B.x, B.out[1] - B.z); };
    if (typeof lieu === 'string') { const B = w.bld && w.bld[lieu]; if (B && B.out) devant(B); else if (w.lm[lieu]) L = { x: w.lm[lieu].x, z: w.lm[lieu].z }; }
    else if (lieu && lieu.bld) { const B = w.bld && w.bld[lieu.bld]; if (B && B.out) devant(B); }
    else if (lieu && lieu.note) { const N = h17.note(lieu.note); if (N) L = { x: N[0], z: N[2] }; }
    if (!L && def.repli) { const B = w.bld && w.bld[def.repli]; if (B && B.out) devant(B); else if (w.lm[def.repli]) L = { x: w.lm[def.repli].x, z: w.lm[def.repli].z }; }
    if (!L) return null;
    // pas dans un mur : le premier endroit libre autour
    if (typeof pointFree === 'function' && !pointFree(w, L.x, L.z, 1.4)) {
      let ok = null;
      for (let r = 3; r <= 15 && !ok; r += 2) for (let k = 0; k < 12 && !ok; k++) { const a = k / 12 * TAU, x = L.x + Math.sin(a) * r, z = L.z + Math.cos(a) * r; if (pointFree(w, x, z, 1.4)) ok = { x, z }; }
      if (ok) L = ok;
    }
    return { T: [L.x, this.sol(w, L.x, L.z), L.z], a0: a0 || 0 };
  },
  duree(t) { return clamp(3.4 + String(t || '').length * 0.052, 4.2, 10); },
  son(k) { const f = K18_SONS[k]; return f ? () => { try { f(); } catch (e) { /* rien */ } } : undefined; },
  construire(cle, k) {
    const r = k18.scene(cle), w = h17.monde();
    if (!r || !w) return null;
    const def = r[1];
    const st = this.scene(def, w);
    if (!st) return null;
    const T = st.T, look0 = [T[0], T[1] + 1.3, T[2]];
    const C = h17.cadre(look0, 13, 2.4, st.a0);
    let f = [T[0] - C[0], 0, T[2] - C[2]];
    const fl = Math.hypot(f[0], f[2]) || 1;
    f = [f[0] / fl, 0, f[2] / fl];
    const rv = [-f[2], 0, f[0]];
    const at = (x, z) => { const px = T[0] + rv[0] * x - f[0] * z, pz = T[2] + rv[2] * x - f[2] * z; return [px, this.sol(w, px, pz), pz]; };
    const aC = Math.atan2(C[0] - T[0], C[2] - T[2]);
    // les gens
    const gens = [], ids = [];
    for (const g of k18.liste(def.gens, k)) {
      let look = null;
      if (g.id) { if (!k18.vivant(g.id)) continue; const n = npcs.byId[g.id]; look = n && n.look; if (look) ids.push(g.id); }
      else if (g.joueur) look = this.lookJoueur();
      else look = typeof g.look === 'string' ? K18_LOOKS[g.look] : g.look;
      if (look && typeof look.face === 'string') look = Object.assign({}, look, { face: TL[look.face] });
      if (!look) continue;
      const P = at(g.x || 0, g.z || 0);
      const ch = g.chemin ? { de: at(g.chemin.de[0], g.chemin.de[1]), a: at(g.chemin.a[0], g.chemin.a[1]), t0: g.chemin.t0 || 0, t1: Math.max((g.chemin.t0 || 0) + 0.5, g.chemin.t1 || 10) } : null;
      const fin = ch ? ch.a : P;
      let cap;
      if (typeof g.cap === 'number') cap = aC + g.cap;
      else if (g.cap === 'dos') cap = Math.atan2(fin[0] - C[0], fin[2] - C[2]);
      else if (g.cap === 'centre') cap = Math.hypot(T[0] - fin[0], T[2] - fin[2]) > 0.3 ? Math.atan2(T[0] - fin[0], T[2] - fin[2]) : Math.atan2(C[0] - fin[0], C[2] - fin[2]);
      else if (g.cap === 'droite') cap = Math.atan2(rv[0], rv[2]);
      else if (g.cap === 'gauche') cap = Math.atan2(-rv[0], -rv[2]);
      else cap = Math.atan2(C[0] - fin[0], C[2] - fin[2]);
      gens.push({ id: g.id || null, joueur: !!g.joueur, look, P, ch, fin, cap, s: g.s || 1 });
    }
    // les répliques (celles d'un absent tombent)
    const nom = (qui) => { if (!qui) return ''; if (qui[0] === '@') { const n = npcs.byId[qui.slice(1)]; return n ? n.name : ''; } return qui; };
    const P0 = [];
    for (const x of k18.liste(def.paroles, k)) {
      const p = typeof x === 'function' ? k18.val(x, k) : x;
      if (!Array.isArray(p) || !p[1]) continue;
      if (p[0] && p[0][0] === '@' && !gens.some((g) => g.id === p[0].slice(1))) continue;
      P0.push(p);
    }
    const texte = (p) => k18.f(p[1], p[0] && p[0][0] === '@' ? npcs.byId[p[0].slice(1)] : null);
    const plans = [];
    const loin = h17.cadre(look0, 34, 9, aC);
    if (def.carte) plans.push({ dur: 2.8, de: { pos: loin, look: look0 }, fondu: 'noir', carte: def.carte });
    let i0 = 0;
    const p0 = P0[0] && !P0[0][0] ? P0[0] : null;
    plans.push({ dur: p0 ? this.duree(p0[1]) + 1.4 : 5.5, chemin: [{ pos: loin, look: look0 }, { pos: h17.vers(loin, C, 0.6), look: look0 }, { pos: C, look: look0 }],
      texte: p0 ? texte(p0) : '', qui: '', debut: p0 ? this.son(p0[2]) : undefined });
    if (p0) i0 = 1;
    let der = C;
    for (let i = i0; i < P0.length; i++) {
      const p = P0[i], who = p[0] && p[0][0] === '@' ? gens.find((g) => g.id === p[0].slice(1)) : null;
      const tgt = who ? [who.fin[0], who.fin[1] + 1.45 * who.s, who.fin[2]] : look0;
      const side = i % 2 ? 1 : -1, rr = i % 3 === 2 ? 9.5 : 6.4;
      const A1 = h17.cadre(tgt, rr, 1.5, aC + side * 0.45 + i * 0.06);
      const A2 = h17.vers(A1, tgt, 0.14);
      plans.push({ dur: this.duree(p[1]), de: { pos: A1, look: tgt }, a: { pos: A2, look: tgt }, texte: texte(p), qui: nom(p[0]), debut: this.son(p[2]) });
      der = A2;
    }
    plans.push({ dur: def.fin ? 3.2 : 2.2, de: { pos: der, look: look0 }, fondu: 'noir', carte: def.fin || undefined });
    const tot = plans.reduce((a, P) => a + (P.dur || 0), 0);
    // la lumière d'une lanterne, le soir et la nuit (lum : [[x, z, hauteur, rayon]] ; par défaut, au milieu, après 19 h 30)
    const lum = (def.lum || (def.h >= 19.5 ? [[0, 0.6, 2.1, 11]] : [])).map(([x, z, hy, r]) => { const P = at(x, z); return { x: P[0], y: P[1] + (hy || 2), z: P[2], r: r || 11, c: [1.0, 0.76, 0.42], d: 12 }; });
    this.actif = { cle, gens };
    return { plans, opts: { h: def.h, musique: def.musique, lum }, ids, gens, duree: tot };
  },
  // les gens, à l'heure de la scène (k18.sceneT)
  dessiner(buf, sbuf, t) {
    const A = this.actif;
    if (!A || !cine.on || !k18.joue || A.cle !== k18.joue || !game.world) return;
    const w = game.world, ts = k18.sceneT;
    for (const g of A.gens) {
      let x = g.P[0], z = g.P[2], cap = g.cap, bouge = false;
      if (g.ch) {
        const u = clamp((ts - g.ch.t0) / (g.ch.t1 - g.ch.t0), 0, 1);
        x = lerp(g.ch.de[0], g.ch.a[0], u); z = lerp(g.ch.de[2], g.ch.a[2], u);
        bouge = u > 0 && u < 1;
        if (bouge) cap = Math.atan2(g.ch.a[0] - g.ch.de[0], g.ch.a[2] - g.ch.de[2]);
      }
      const y = this.sol(w, x, z), r = h17Cine.rig(g.look);
      poseHuman(r, { move: bouge ? 1 : 0, phase: bouge ? ts * 5.2 : 0, t, lookY: 0 });
      drawRig(buf, r, x, y, z, cap, g.s || 1, 0);
      if (sbuf) drawShadow(sbuf, x, y, z, 0.34);
    }
  },
};
HOOKS.draw.push((buf, sbuf, cam, t) => { if (k18.joue && cine.on) k18Scenes.dessiner(buf, sbuf, t); });
