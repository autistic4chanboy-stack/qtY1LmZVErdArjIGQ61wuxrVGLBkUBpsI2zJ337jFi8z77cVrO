// ============================================================================
//  LE DESSOUS — les bêtes d'en bas (agent C3)
//  - chauves-souris, en colonies sous les hautes voûtes (elles fuient la
//    lanterne ; leur guano s'entasse dessous) ;
//  - protées, pâles et aveugles, au fond de l'eau près des rives (à la main) ;
//  - écrevisses aveugles dans les hauts-fonds (à la main) ;
//  - grillons des cavernes, le long des parois (à la main ; leur chant) ;
//  - scolopendres, dans les galeries sèches : elles se dressent et mordent
//    quand on les serre de trop près (les armes en viennent à bout).
//  Elles naissent autour du personnage, dans leurs endroits, et disparaissent
//  quand il s'éloigne. Dessinées par HOOKS.draw ; touchées par les armes via
//  strange.raycast / strange.hit (comme les bêtes des autres mondes).
// ============================================================================
defItem('protee', 'Protée', 'chasse', 10, ['mue', '#f2dcd6'], { alch: true, desc: 'Un petit animal rose et blanc, comme un lézard sans couleur, sans yeux, qui respire par des houppes rouges. Il se tortille, froid.' });
defItem('grillon_pale', 'Grillon des cavernes', 'chasse', 1, ['ver', '#c8b89a'], { food: 3, desc: 'Un grillon pâle, aux antennes deux fois longues comme lui. Il ne chante que dans le noir complet.' });
Object.assign(ESSENCES, { protee: { eau: 2, vie: 2, ombre: 1 }, grillon_pale: { ombre: 1, air: 1, terre: 1 } });
Object.assign(ALIMENTS_EFFETS, { protee: { c: 'un protée cru', r: [['hallucinations', 0.5, 40, 150], ['nausee', 0.5, 20, 90]] }, grillon_pale: { r: [['nausee', 0.15, 20, 60]] } });
{ const g = NPC_DATA.find((d) => d.id === 'guerisseuse'); if (g && g.shop && g.shop.buys && !g.shop.buys.includes('protee')) g.shop.buys.push('protee'); }

// ---------------------------------------------------------------- les squelettes
const SOUT_RIGS = {
  chauve() { return ANIMAL_RIGS.bat(); },
  protee() { return mdRecolor(scaleRig(ANIMAL_RIGS.salamandre(), 2.3), (q) => ({ col: /tache/.test(q.name) ? [0.86, 0.36, 0.36] : [0.95, 0.84, 0.8], tex: q.name === 'head' ? TL.plain : TL.skin })); },
  ecrevisse() {
    const { P, add } = rigParts(), c = [0.93, 0.88, 0.8];
    add('body', null, [0, 0.03, 0], [0.05, 0.035, 0.08], [0, 0, 0], c, TL.scales);
    add('queue', 'body', [0, 0, -0.04], [0.045, 0.025, 0.08], [0, -0.004, -0.04], c, TL.scales);
    for (const s of [-1, 1]) { add('pince' + s, 'body', [s * 0.03, 0, 0.04], [0.018, 0.015, 0.07], [s * 0.01, 0, 0.035], c, TL.scales); add('ant' + s, 'body', [s * 0.012, 0.012, 0.04], [0.003, 0.003, 0.12], [s * 0.02, 0.01, 0.06], c, TL.plain); }
    for (let k = 0; k < 3; k++) for (const s of [-1, 1]) add('p' + k + s, 'body', [s * 0.028, -0.01, 0.02 - k * 0.022], [0.035, 0.005, 0.006], [s * 0.015, -0.006, 0], c, TL.plain);
    const r = new Rig(P); r.kind = 'bug'; return r;
  },
  grillon() {
    const { P, add } = rigParts(), c = [0.78, 0.72, 0.6];
    add('body', null, [0, 0.025, 0], [0.028, 0.025, 0.06], [0, 0, 0], c, TL.plain);
    for (const s of [-1, 1]) { add('patte' + s, 'body', [s * 0.016, 0, -0.01], [0.006, 0.04, 0.05], [0, 0.012, -0.02], c, TL.plain, { r0: [0.5, 0, s * 0.3] }); add('ant' + s, 'body', [s * 0.008, 0.012, 0.03], [0.002, 0.002, 0.13], [s * 0.02, 0.02, 0.065], c, TL.plain); }
    const r = new Rig(P); r.kind = 'bug'; return r;
  },
  scolopendre() {
    const { P, add } = rigParts(), c = rgbf('#7a3a1a'), j = rgbf('#d8a030');
    add('s0', null, [0, 0.03, 0], [0.07, 0.035, 0.07], [0, 0, 0], c, TL.scales);
    add('crochets', 's0', [0, 0, 0.04], [0.06, 0.012, 0.03], [0, 0, 0.01], j, TL.plain);
    for (let k = 1; k < 11; k++) {
      add('s' + k, 's' + (k - 1), [0, 0, -0.058], [0.075 - k * 0.002, 0.03, 0.055], [0, 0, 0], k % 2 ? c : v3.scale(c, 0.85), TL.scales);
      for (const s of [-1, 1]) add('l' + k + s, 's' + k, [s * 0.04, -0.01, 0], [0.05, 0.006, 0.008], [s * 0.022, -0.008, 0], j, TL.plain);
    }
    const r = new Rig(P); r.kind = 'bug'; return r;
  },
};

// ---------------------------------------------------------------- les endroits (tirés du plan une fois)
const soutBetes = {
  list: [], nids: null, seq: 0, sonT: 0,
  // les nids : [genre, x, y, z, nombre] — colonies sous les hautes voûtes, rives, galeries sèches, parois
  construireNids() {
    if (this.nids) return this.nids;
    const S = souterrain, N = [], rnd = mulberry32(0x50b7be7e);
    S.creuseurs();
    const salle = (k) => SOUT_PLAN.salles.find((q) => q[0] === k);
    for (const [k, n] of [['nef', 5], ['echos', 2], ['gouffres', 2], ['racines', 1], ['ruines', 2], ['orgues', 1], ['seuil', 1]]) {
      const P = salle(k); if (!P) continue;
      for (let i = 0; i < n; i++) { const a = rnd() * TAU, r = Math.sqrt(rnd()) * 0.6, x = P[1] + Math.cos(a) * r * P[3], z = P[2] + Math.sin(a) * r * P[4]; if (!S.ouvert(x, z, 6)) continue; N.push(['chauve', x, Math.min(S.vaultAt(x, z) - 2, S.floorAt(x, z) + 14), z, 4 + ((rnd() * 5) | 0)]); }
    }
    // rives : protées et écrevisses (sur la rivière, les lacs)
    const rive = (x, z) => { const f = S.floorAt(x, z); return f < SOUT_WL - 0.35 && f > SOUT_WL - 1.6; };
    const essais = [];
    for (const [cx, cz, r] of SOUT_PLAN.riviere) for (let i = 0; i < 3; i++) essais.push([cx + (rnd() - 0.5) * r * 2, cz + (rnd() - 0.5) * r * 2]);
    for (const [, cx, cz, rx, rz] of SOUT_PLAN.lacs) for (let i = 0; i < 26; i++) { const a = rnd() * TAU, k = 0.8 + rnd() * 0.22; essais.push([cx + Math.cos(a) * rx * k, cz + Math.sin(a) * rz * k]); }
    for (const [x, z] of essais) if (rive(x, z)) N.push([rnd() < 0.5 ? 'protee' : 'ecrevisse', x, S.floorAt(x, z), z, 2 + ((rnd() * 3) | 0)]);
    // galeries sèches : scolopendres ; parois : grillons
    for (const [key, pts] of SOUT_PLAN.galeries) {
      for (let i = 0; i + 1 < pts.length; i++) {
        const A = pts[i], B = pts[i + 1], t = rnd(), x = lerp(A[0], B[0], t), z = lerp(A[1], B[1], t);
        if (!S.ouvert(x, z, 2)) continue;
        const u = rnd();
        if (u < 0.18 && ['souffle', 'vers_souffle', 'fissure', 'descente', 'vers_echos', 'vers_gouffres', 'vers_ruines', 'mines', 'mines_n', 'mines_s'].includes(key)) N.push(['scolopendre', x, S.floorAt(x, z), z, 1]);
        else if (u < 0.55) N.push(['grillon', x, S.floorAt(x, z), z, 4 + ((rnd() * 5) | 0)]);
      }
    }
    return (this.nids = N.map(([k, x, y, z, n], i) => ({ i, k, x, y, z, n, vie: 0, mort: 0 })));
  },
  // chaque image : naissance autour du personnage, comportements
  update(dt, playing) {
    if (!souterrain.actif) { if (this.list.length) this.list = []; return; }
    const p = game.player, nids = this.construireNids();
    this.scanT = (this.scanT || 0) - dt;
    if (this.scanT <= 0) {
      this.scanT = 0.8;
      for (const N of nids) {
        const d = Math.hypot(N.x - p.pos[0], N.z - p.pos[2]);
        if (d < 85 && !N.vie && game.time > N.mort) this.naitre(N);
        else if (d > 130 && N.vie) { this.list = this.list.filter((e) => e.nid !== N); N.vie = 0; }
      }
    }
    if (!playing) return;
    for (let i = this.list.length - 1; i >= 0; i--) {
      const e = this.list[i];
      e.t += dt; e.hurtT = Math.max(0, (e.hurtT || 0) - dt);
      if (e.mort) { e.mortT += dt; if (e.mortT > 1.2) this.list.splice(i, 1); continue; }
      e.dist = Math.hypot(e.x - p.pos[0], e.z - p.pos[2]);
      if (e.dist > 70) continue;
      try { this.IA[e.k].call(this, e, dt, p); } catch (err) { console.error(err); }
    }
    this.sons(dt, p);
  },
  naitre(N) {
    N.vie = 1;
    const S = souterrain;
    for (let k = 0; k < N.n; k++) {
      const a = Math.random() * TAU, r = N.k === 'chauve' ? 3 + Math.random() * 8 : 0.5 + Math.random() * 3;
      let x = N.x + Math.cos(a) * r, z = N.z + Math.sin(a) * r;
      if (N.k !== 'chauve' && (!S.ouvert(x, z, 0.5) || Math.abs(S.floorAt(x, z) - N.y) > 1.5)) { x = N.x; z = N.z; }
      const e = { id: ++this.seq, sout: true, k: N.k, nid: N, x, z, y: N.k === 'chauve' ? N.y : S.floorAt(x, z), hx: N.x, hz: N.z, heading: Math.random() * TAU, t: Math.random() * 10, phase: 0, move: 0, hp: N.k === 'scolopendre' ? 8 : 1, a, r, w: (Math.random() < 0.5 ? 1 : -1) * (0.35 + Math.random() * 0.35), etat: 'calme', timer: Math.random() * 3 };
      e.rig = SOUT_RIGS[N.k]();
      this.list.push(e);
    }
  },
  // marcher sur le sol d'en bas (et rester sous l'eau, ou hors de l'eau)
  pas(e, dt, dir, v, eau) {
    const S = souterrain;
    e.heading = turnToward(e.heading, dir, dt * 5);
    const nx = e.x + Math.sin(e.heading) * v * dt, nz = e.z + Math.cos(e.heading) * v * dt, f = S.floorAt(nx, nz);
    if (!S.ouvert(nx, nz, 0.3) || Math.abs(f - e.y) > 0.6 || (eau === true && f > SOUT_WL - 0.25) || (eau === false && f < SOUT_WL + 0.1)) { e.heading += 1.4 + Math.random(); return false; }
    e.x = nx; e.z = nz; e.y = f; e.move = 1; e.phase += dt * v * 30;
    return true;
  },
  IA: {
    chauve(e, dt, p) {
      const lum = soutEntree.lumiere(), dy = e.y - p.pos[1];
      if (lum && e.dist < 11 && Math.abs(dy) < 14 && e.etat !== 'fuite') { e.etat = 'fuite'; e.timer = 3 + Math.random() * 2; if (Math.random() < 0.5) soutSon.pepie(clamp(1 - e.dist / 30, 0.2, 1)); }
      e.timer -= dt;
      if (e.etat === 'fuite') { e.r = Math.min(26, e.r + dt * 6); if (e.timer <= 0) e.etat = 'calme'; }
      else e.r += ((e.nid && e.r > 12 ? 8 : e.r) - e.r) * dt * 0.2;
      e.a += e.w * dt * (e.etat === 'fuite' ? 2.4 : 1) * (6 / Math.max(3, e.r));
      const x = e.hx + Math.cos(e.a) * e.r, z = e.hz + Math.sin(e.a) * e.r;
      const S = souterrain, v = S.vaultAt(x, z), f = S.floorAt(x, z);
      if (v - f > 3.5 && f < SOUT_ROCK - 1) { e.heading = Math.atan2(x - e.x, z - e.z); e.x = x; e.z = z; e.y += (Math.min(v - 1.2, e.nid.y + Math.sin(e.t * 0.7 + e.id) * 2) - e.y) * dt * 2; }
      else { e.w = -e.w; e.r *= 0.9; }
    },
    protee(e, dt, p) { this.IA.nageur.call(this, e, dt, p, 0.25, 0.9); },
    ecrevisse(e, dt, p) { this.IA.nageur.call(this, e, dt, p, 0.18, 0.7); },
    nageur(e, dt, p, v, vf) {
      e.timer -= dt; e.move = Math.max(0, e.move - dt * 3);
      if (e.dist < 1.8 && (p.sprinting || Math.hypot(p.vel[0], p.vel[2]) > 3) && e.etat !== 'fuite') { e.etat = 'fuite'; e.timer = 1.5; e.fuite = Math.atan2(e.x - p.pos[0], e.z - p.pos[2]); }
      if (e.etat === 'fuite') { this.pas(e, dt, e.fuite, vf, true); if (e.timer <= 0) e.etat = 'calme'; return; }
      if (e.timer <= 0) { e.timer = 2 + Math.random() * 5; e.but = Math.random() < 0.6 ? Math.random() * TAU : null; }
      if (e.but !== null && e.but !== undefined) { if (Math.hypot(e.x - e.hx, e.z - e.hz) > 4) e.but = Math.atan2(e.hx - e.x, e.hz - e.z); this.pas(e, dt, e.but, v, true); }
    },
    grillon(e, dt, p) {
      e.timer -= dt; e.move = 0;
      if (e.saut > 0) { e.saut -= dt; this.pas(e, dt, e.heading, 1.6, false); e.y += Math.sin((0.35 - e.saut) / 0.35 * Math.PI) * 0.03; return; }
      if (e.timer <= 0 || (e.dist < 1.6 && Math.random() < dt * 3)) { e.timer = 1.5 + Math.random() * 6; e.saut = 0.35; e.heading = e.dist < 2 ? Math.atan2(e.x - p.pos[0], e.z - p.pos[2]) : Math.random() * TAU; if (Math.hypot(e.x - e.hx, e.z - e.hz) > 3) e.heading = Math.atan2(e.hx - e.x, e.hz - e.z); }
    },
    scolopendre(e, dt, p) {
      e.timer -= dt; e.atk = Math.max(0, (e.atk || 0) - dt);
      const dy = Math.abs(e.y - p.pos[1]);
      if (e.dist < 2.8 && dy < 1.5 && !(p.crouch > 0.5 && e.dist > 1.6)) {
        e.etat = 'colere'; e.heading = turnToward(e.heading, Math.atan2(p.pos[0] - e.x, p.pos[2] - e.z), dt * 6);
        if (e.dist > 0.9) this.pas(e, dt, e.heading, 2.2, false);
        else if (e.atk <= 0) {
          e.atk = 1.4; e.mord = 0.35;
          soutSon.siffle(1);
          play.hurt(5, e, 'Mordu par une scolopendre');
          if (typeof corps !== 'undefined' && Math.random() < 0.5) corps.saigner(0.05, 'Mordu par une scolopendre, dans le noir');
          if (!e.ditMord) { e.ditMord = 1; ui.subtitle('', '(Une brûlure à la cheville. Quelque chose de long a filé dans le noir.)', 3.5); }
        }
        return;
      }
      if (e.etat === 'colere' && e.dist > 5) e.etat = 'calme';
      if (e.timer <= 0) { e.timer = 1.5 + Math.random() * 4; e.but = Math.random() < 0.7 ? Math.random() * TAU : null; }
      e.move = 0;
      if (e.but !== null && e.but !== undefined) { if (Math.hypot(e.x - e.hx, e.z - e.hz) > 5) e.but = Math.atan2(e.hx - e.x, e.hz - e.z); this.pas(e, dt, e.but, 0.7, false); }
    },
  },
  sons(dt, p) {
    this.sonT -= dt;
    if (this.sonT > 0) return;
    this.sonT = 0.6 + Math.random() * 1.4;
    let chauves = 0, grillons = 0;
    for (const e of this.list) { if (e.dist < 30 && e.k === 'chauve') chauves++; if (e.dist < 14 && e.k === 'grillon') grillons++; }
    if (chauves && Math.random() < 0.45) soutSon.pepie(Math.min(1, chauves / 8) * 0.6);
    if (grillons && !soutEntree.lumiere() && Math.random() < 0.7) soutSon.stridule(Math.min(1, grillons / 6));
  },
  // ---------------------------------------------------------------- dessin
  dessiner(buf, sbuf, cam, t) {
    if (!souterrain.actif) return;
    for (const e of this.list) {
      const dx = e.x - cam[0], dz = e.z - cam[2];
      if (dx * dx + dz * dz > 60 * 60) continue;
      const r = e.rig;
      if (e.k === 'chauve') poseBird(r, { fly: 1, t, seed: e.id });
      else if (e.k === 'protee') poseQuad(r, { move: e.move, phase: e.phase, t });
      else if (e.k === 'scolopendre') { for (let k = 1; k < 11; k++) r.set('s' + k, 0, Math.sin(e.t * 9 - k * 0.8) * 0.18 * (e.move || 0.2), 0); r.set('s0', e.mord > 0 ? -0.5 : e.etat === 'colere' ? -0.25 : 0, 0, 0); e.mord = Math.max(0, (e.mord || 0) - 0.016); }
      const fl = (e.hurtT > 0 || (game.target && game.target.bete === e)) ? FX_HI : 0;
      drawRig(buf, r, e.x, e.mort ? e.y - Math.min(1, e.mortT) * 0.05 : e.y, e.z, e.heading, 1, fl);
    }
  },
  // ---------------------------------------------------------------- attraper (E) : protées, écrevisses, grillons
  cibles(eye, f, cand) {
    if (!souterrain.actif) return;
    for (const e of this.list) {
      if (e.mort || !['protee', 'ecrevisse', 'grillon'].includes(e.k)) continue;
      const dx = e.x - eye[0], dy = e.y + 0.05 - eye[1], dz = e.z - eye[2], d = Math.hypot(dx, dy, dz);
      if (d > 2.4) continue;
      const cos = (dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1);
      if (cos < 0.8) continue;
      cand({ kind: 'hook', bete: e, use: () => this.attraper(e) }, d);
    }
  },
  attraper(e) {
    if (e.mort) return;
    const ok = Math.random() < (e.k === 'grillon' ? 0.55 : game.player.crouch > 0.5 ? 0.85 : 0.6);
    if (!ok) { e.etat = 'fuite'; e.timer = 1.5; e.saut = 0.35; e.fuite = Math.atan2(e.x - game.player.pos[0], e.z - game.player.pos[2]); if (e.k !== 'grillon') { sound.splash && sound.splash(); splashAt(e.x, SOUT_WL, e.z); } return; }
    const id = e.k === 'protee' ? 'protee' : e.k === 'ecrevisse' ? 'ecrevisse_aveugle' : 'grillon_pale';
    farm.give(id, 1); play.flyer(id, [e.x, e.y + 0.3, e.z], 1);
    if (e.k !== 'grillon') sound.splash && sound.splash(); else sound.pop && sound.pop();
    if (typeof savoir !== 'undefined' && savoir.voir) savoir.voir(id);
    this.retirer(e);
  },
  retirer(e) {
    const i = this.list.indexOf(e);
    if (i >= 0) this.list.splice(i, 1);
    if (e.nid && !this.list.some((q) => q.nid === e.nid)) { e.nid.vie = 0; e.nid.mort = game.time + 240; }
  },
  // ---------------------------------------------------------------- les coups (armes, flèches, fusil)
  raycast(o, d, maxDist) {
    let best = null;
    const dh = Math.hypot(d[0], d[2]) || 1e-6;
    for (const e of this.list) {
      if (e.mort) continue;
      const rr = e.k === 'chauve' ? 0.35 : e.k === 'scolopendre' ? 0.35 : 0.15, cx = e.x - o[0], cz = e.z - o[2];
      const tc = (cx * d[0] + cz * d[2]) / (dh * dh);
      if (tc < 0 || tc > maxDist) continue;
      const px = d[0] * tc - cx, pz = d[2] * tc - cz;
      if (px * px + pz * pz > rr * rr) continue;
      const y = o[1] + d[1] * tc;
      if (y < e.y - 0.2 || y > e.y + 0.4) continue;
      if (!best || tc < best.t) best = { t: tc, s: e, p: [o[0] + d[0] * tc, y, o[2] + d[2] * tc] };
    }
    return best;
  },
  frapper(e, dmg) {
    if (e.mort) return;
    e.hp -= dmg; e.hurtT = 0.3;
    if (e.k === 'scolopendre') { e.etat = 'colere'; soutSon.siffle(0.6); }
    if (e.hp > 0) return;
    e.mort = true; e.mortT = 0;
    const drop = e.k === 'chauve' ? 'aile_chauve_souris' : e.k === 'scolopendre' ? 'venin' : null;
    if (drop && ITEMS[drop] && Math.random() < 0.8) { farm.give(drop, 1); play.flyer(drop, [e.x, e.y + 0.3, e.z], 1); }
    if (e.nid) setTimeout(() => { if (!this.list.some((q) => q.nid === e.nid && !q.mort)) { e.nid.vie = 0; e.nid.mort = game.time + 300; } }, 1500);
  },
};
// quelques sons des bêtes d'en bas
Object.assign(soutSon, {
  pepie(k = 1) { if (!sound.ok) return; const t = sound.at(), out = sound.pan(Math.random() * 2 - 1, sound.amb); for (let i = 0; i < 3; i++) sound.tone(t + i * 0.05, 'sine', 7200 + Math.random() * 1800, 6200, 0.03, 0.008 * k, out, 0.002); },
  stridule(k = 1) { if (!sound.ok) return; const t = sound.at(), out = sound.pan(Math.random() * 2 - 1, sound.amb); for (let i = 0; i < 6; i++) sound.tone(t + i * 0.07, 'square', 4300, 4200, 0.03, 0.004 * k, out, 0.002); },
  siffle(k = 1) { if (!sound.ok) return; const t = sound.at(); sound.noiseHit(t, 0.35, 'highpass', 3000, 1, 0.08 * k, null, 5000); },
});
HOOKS.update.push((dt, eye, basis, sky, playing) => { if (farm.s) soutBetes.update(dt, playing); });
HOOKS.draw.push((buf, sbuf, cam, t) => soutBetes.dessiner(buf, sbuf, cam, t));
HOOKS.target.push((eye, f, cand) => soutBetes.cibles(eye, f, cand));
HOOKS.load.push(() => { soutBetes.list = []; if (soutBetes.nids) for (const N of soutBetes.nids) { N.vie = 0; N.mort = 0; } });
{
  const _ray = strange.raycast.bind(strange), _hit = strange.hit.bind(strange);
  strange.raycast = function (o, d, maxDist) {
    const a = _ray(o, d, maxDist);
    if (!souterrain.actif || !soutBetes.list.length) return a;
    const b = soutBetes.raycast(o, d, a ? a.t : maxDist);
    return b && (!a || b.t < a.t) ? b : a;
  };
  strange.hit = function (e, dmg, from) { if (e && e.sout) return soutBetes.frapper(e, dmg); return _hit(e, dmg, from); };
}
