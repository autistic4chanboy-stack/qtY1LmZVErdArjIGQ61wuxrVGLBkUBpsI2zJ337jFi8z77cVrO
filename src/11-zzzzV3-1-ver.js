// ============================================================================
//  LE VER (agent V3, quatorzième vague) — le dragon qui surveille
//  - Ses heures : la nuit il dort dans son aire, au sommet du Pic (la tête
//    tournée vers la Porte) ; à l'aube il veille sur le bord de l'aire, puis
//    s'envole ; le jour il fait ses rondes au-dessus de la Zone (il passe sur
//    les régions, sur le Seuil et la Porte, et va souvent voir là où il s'est
//    passé quelque chose) et se pose sur ses perchoirs, où il tourne la tête ;
//    le soir il rentre. La cloche du Guet le fait rentrer (11-zzzzV3-2-aire.js).
//  - Ce qu'il perçoit : son propre regard (de haut, de loin : ce qui est À
//    DÉCOUVERT ; rien sous un toit, sous terre, sous les arbres serrés, dans les
//    herbes hautes quand on s'y accroupit, et peu dans le noir) et son ouïe ; le
//    soupçon, la mémoire et les états sont ceux du cadre commun (furtif, V1).
//  - Intrigué, il vient voir (il tourne au-dessus de l'endroit, ou tourne la tête
//    vers lui) ; alerté, il fond : un piqué, puis le feu, en rase-mottes, le long
//    d'une ligne qui passe sur vous (trois passes au plus) ; posé, il se dresse
//    et crache ; il cherche ensuite, en cercles bas, puis abandonne.
//  - Le feu tue vite ; il ne passe ni les toits ni la pierre ; il brûle l'herbe,
//    les roseaux, les buissons, le bois mort (DANS LA ZONE SEULEMENT) : la cendre
//    reste, l'herbe repousse au bout de quelques jours. L'herbe brûlée ne cache
//    plus.
//  - Son ombre passe au sol (et sur vous) ; on l'entend de loin : ses ailes, ses
//    cris, son souffle quand il dort.
//  - Le tuer : un seul endroit où il saigne (sous l'aile gauche, le carreau) ;
//    ailleurs, tout ricoche. Le délivrer : 11-zzzzV3-2-aire.js.
//  API : zone.dragon (contrat, section V3). État : farm.s.v3.
// ============================================================================
const V3_FLAMMES = { tallgrass: 1, reeds: 1, bush: 1, berry: 1, fern: 1, heather: 1, deadtree: 2, stump: 2, wheat: 1, mushroom: 1 };
const V3_ARBRES = { deadtree: 0.6, pine: 0.3, oak: 0.3, birch: 0.4, apple: 0.35, giantoak: 0.2, foudroye: 0.7 };

const dragonV3 = {
  D: null, ST: { mode: 'pose', t: 0 }, rig: null, tmpBuf: null,
  flammes: new Map(), impacts: [], souffleT: 0, brule: 0, ombreK: 0, feuK: 0, rebuildT: 0, sonT: {}, vueT: 0, grace: 0,
  toits: null, toitsZ: null,

  // ------------------------------------------------------------- l'état sauvegardé
  S() {
    const s = typeof farm !== 'undefined' && farm.s;
    if (!s) return { v: 1, brule: {}, traces: [], lus: {}, ecailles: {}, corps: {}, pv: V3.pv };
    const S = s.v3 || (s.v3 = { v: 1 });
    for (const k of ['brule', 'lus', 'ecailles', 'corps']) if (!S[k] || typeof S[k] !== 'object') S[k] = {};
    if (!Array.isArray(S.traces)) S.traces = [];
    if (typeof S.pv !== 'number') S.pv = V3.pv;
    for (const k of ['vu', 'attaques', 'tas', 'passes']) if (typeof S[k] !== 'number') S[k] = 0;
    if (S.fin === undefined) S.fin = null;
    return S;
  },
  heure() { return farm.w ? farm.w.time * 24 : 12; },
  // ------------------------------------------------------------- les lieux (l'aire, les perchoirs, les points de ronde)
  lieux() {
    const Z = zone.Z;
    if (this.lieuxZ === Z && this.L) return this.L;
    const S = Z.size, A = zone.site('dragon_aire');
    const porte = Z.v1 ? Z.v1.porte : { x: S / 2, z: S * 0.95 };
    const vers = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);
    const L = { aire: { id: 'dragon_aire', x: A.x, y: Z.heightAt(A.x, A.z), z: A.z, yaw: vers(A.x, A.z, porte.x, porte.z), aire: true }, perchoirs: [], survols: [] };
    // l'aire : où il se couche (la passe de 11-zzzzV3-2 peut l'avoir précisé)
    if (Z.v3 && Z.v3.couche) Object.assign(L.aire, Z.v3.couche);
    for (const st of zone.sites('V3')) {
      if (st.id === 'dragon_aire') continue;
      L.perchoirs.push({ id: st.id, x: st.x, y: Z.heightAt(st.x, st.z), z: st.z, yaw: vers(st.x, st.z, S / 2, S * 0.55), perche: true });
    }
    for (const k in V1_REGIONS) {
      if (k === 'pic') continue;
      const R = V1_REGIONS[k];
      L.survols.push({ id: k, x: R.x * S, z: R.z * S, r: k === 'seuil' ? 110 : 150 });
    }
    // la Porte : il la regarde souvent
    L.survols.push({ id: 'porte', x: porte.x, z: porte.z - 140, r: 120, porte: true });
    this.L = L; this.lieuxZ = Z;
    return L;
  },
  // les toits (blocs) sur une grille de 16 m : le dessus le plus haut, pour ne pas voler dedans
  toitAt(x, z) {
    const Z = zone.Z;
    if (this.toitsZ !== Z || !this.toits || this.toitsN !== Z.blocks.length) {
      const C = 16, n = Math.ceil(Z.size / C) + 1, T = new Float32Array(n * n).fill(-1e4);
      for (const b of Z.blocks) {
        if (b.hidden || b.under) continue;
        const top = b.y + b.sy, r = Math.hypot(b.sx, b.sz) / 2;
        for (let j = Math.max(0, Math.floor((b.z - r) / C)); j <= Math.min(n - 1, Math.floor((b.z + r) / C)); j++)
          for (let i = Math.max(0, Math.floor((b.x - r) / C)); i <= Math.min(n - 1, Math.floor((b.x + r) / C)); i++) if (top > T[j * n + i]) T[j * n + i] = top;
      }
      this.toits = T; this.toitsC = C; this.toitsNn = n; this.toitsZ = Z; this.toitsN = Z.blocks.length;
    }
    const C = this.toitsC, n = this.toitsNn, i = clamp(Math.floor(x / C), 0, n - 1), j = clamp(Math.floor(z / C), 0, n - 1);
    return this.toits[j * n + i];
  },
  // l'altitude de sa ronde : haute par temps clair ; dans la brume, il descend (pour voir), et sort d'elle d'un coup
  altitudeRonde() {
    const f = game.sky ? game.sky.fog[1] : 300;
    return clamp(f * 0.6, 42, V3.altitude);
  },
  // le plus haut obstacle devant (relief, toits), sur la route
  plancher(x, z, yaw, d) {
    const Z = zone.Z, sx = Math.sin(yaw), sz = Math.cos(yaw);
    let h = -1e9;
    for (const k of [0, 0.4, 0.9, 1.6, 2.6]) {
      const px = x + sx * d * k, pz = z + sz * d * k;
      h = Math.max(h, Z.heightAt(px, pz), this.toitAt(px, pz), Z.waterLevel);
    }
    return h;
  },

  // ------------------------------------------------------------- le Ver dans la Zone : on le pose selon l'heure
  placer(raison) {
    const S = this.S(), L = this.lieux(), h = this.heure(), H = V3.heures;
    furtif.oublier && this.D && furtif.oublier(this.D);
    this.flammes.clear(); this.impacts = []; this.souffle = null; this.brule = 0;
    if (S.fin === 'delivre') { this.D = null; return; }
    if (!this.rig) this.rig = v3Rig();
    const D = this.D = { x: 0, y: 0, z: 0, yaw: 0, pitch: 0, roll: 0, v: 0, vy: 0, mode: 'pose', phase: 'veille', rig: this.rig, s: 1, dist: 999,
      battement: 0, ampl: 0, plane: 0, timer: 0, route: [], passes: 0, regardY: 0, regardP: 0, teteY: 0, teteP: 0, heading: 0, x0: 0 };
    if (S.fin === 'tue') { const M = S.mort || { x: L.aire.x, y: L.aire.y, z: L.aire.z, yaw: 0 }; Object.assign(D, { x: M.x, y: M.y, z: M.z, yaw: M.yaw, mode: 'mort', phase: 'mort' }); return; }
    const nuit = h >= H.coucher || h < H.reveil, aube = h >= H.reveil && h < H.envol, soir = h >= H.retour && h < H.coucher;
    const rappel = S.rappel && farm.s.hours < S.rappel;
    if (nuit) this.coucher(L.aire);
    else if (aube || soir || rappel) this.poser(L.aire, 'veille');
    else {
      // le jour : en vol sur sa ronde, ou posé sur un perchoir ; jamais tout près de l'arrivée
      const p = game.player.pos;
      const loin = (q) => Math.hypot(q.x - p[0], q.z - p[2]) > 700;
      const P = L.perchoirs.filter(loin);
      if (P.length && Math.random() < 0.5) this.poser(P[(Math.random() * P.length) | 0], 'veille');
      else {
        const V = L.survols.filter(loin), q = V[(Math.random() * V.length) | 0] || L.aire;
        Object.assign(D, { x: q.x, z: q.z, mode: 'vol', phase: 'ronde', v: V3.vitesse, yaw: Math.random() * TAU });
        D.y = this.plancher(q.x, q.z, D.yaw, 100) + V3.altitude;
        D.cible = q;
      }
    }
    D.timer = lerp(V3.pose[0], V3.pose[1], Math.random());
    this.grace = raison === 'entrer' ? 75 : 20;
    furtif.guetteur(D, { vue: V3.vueJour, cone: 150, nuit: 0.4, ouie: V3.ouiePerche, hauteur: 0, vitesse: V3.soupconVite, oubli: V3.oubli, memoire: V3.memoire, lumiere: 0.9 });
    D.furtif.tVue = 1e9; D.etatConnu = 'tranquille';
  },
  poser(q, phase) {
    const D = this.D, Z = zone.Z;
    Object.assign(D, { x: q.x, z: q.z, y: Z.heightAt(q.x, q.z) + V3_HAUT.pose, yaw: q.yaw, pitch: 0, roll: 0, v: 0, vy: 0, mode: 'pose', phase: phase || 'veille', ou: q });
    D.timer = lerp(V3.pose[0], V3.pose[1], Math.random());
  },
  coucher(q) {
    const D = this.D, Z = zone.Z;
    // la tête tournée vers la Porte : le cou se couche de côté (l'angle de la tête dans le repère du corps, mesuré une fois)
    const a = this.angleTeteDort();
    Object.assign(D, { x: q.x, z: q.z, y: Z.heightAt(q.x, q.z) + V3_HAUT.dort, yaw: q.yaw - a, pitch: 0, roll: 0, v: 0, vy: 0, mode: 'dort', phase: 'dort', ou: q });
  },
  // endormi : où sont la tête, le museau, le collier, dans le repère du corps (calculé une fois sur le squelette)
  dortLocal() {
    if (this._dL) return this._dL;
    const R = v3Rig(), b = new InstBuf(300);
    v3Poser(R, { mode: 'dort', replie: 1, pattes: 1, t: 0 });
    R.emit(b, M34_ID, 0);
    const P = (nm, x, y, z) => v3Pt(R.part(nm).W, x || 0, y || 0, z || 0);
    return (this._dL = { tete: P('tete', 0, 0, 1), museau: P('museau_bout'), collier: P('collier', 0, -1.2, 0) });
  },
  angleTeteDort() {
    if (this._aTD !== undefined) return this._aTD;
    const L = this.dortLocal(), a = L.tete, c = L.museau;
    return (this._aTD = Math.atan2(c[0] - a[0], c[2] - a[2]));
  },

  // ------------------------------------------------------------- chaque image, dans la Zone
  update(dt) {
    if (!zone.dedans || !zone.Z || !farm.s) return;
    if (!this.D && this.S().fin !== 'delivre') this.placer('entrer');
    const D = this.D;
    this.majFlammes(dt);
    this.majImpacts(dt);
    if (!D) return;
    const p = game.player;
    D.dist = Math.hypot(D.x - p.pos[0], D.y - p.pos[1], D.z - p.pos[2]);
    this.repousser();
    if (D.mode === 'mort') { this.majCorps(dt); return; }
    if (D.phase === 'parti') { this.majDepart(dt); return; }
    if (D.phase === 'parti0' || D.phase === 'parti1') return;   // (la délivrance : la cinématique le mène)
    this.grace = Math.max(0, this.grace - dt);
    this.percevoir(dt);
    this.decider(dt);
    if (D.mode === 'vol') this.voler(dt); else this.au_sol(dt);
    this.majSouffle(dt);
    this.majJoueur(dt);
    this.majSons(dt);
    // la première fois qu'on le voit (de près, sous le ciel ouvert)
    const S = this.S();
    if (!S.premiere && D.dist < 260 && D.dist < (game.sky ? game.sky.fog[1] : 300) && D.mode !== 'dort' && !cine.on) {
      const e = p.eyePos(), f = cameraBasis(p.yaw, p.pitch).f, dx = D.x - e[0], dy = D.y - e[1], dz = D.z - e[2], d = Math.hypot(dx, dy, dz);
      if ((dx * f[0] + dy * f[1] + dz * f[2]) / d > 0.8) { S.premiere = farm.s.day; setTimeout(() => ui.subtitle('', V3_TEXTES.premiere, 3.5), 1200); }
    }
  },

  // ------------------------------------------------------------- ce qu'il perçoit
  percevoir(dt) {
    const D = this.D, F = D.furtif;
    if (!F) return;
    D.heading = D.yaw + (D.teteY || 0);
    this.vueT -= dt;
    if (this.vueT <= 0) {
      this.vueT = 0.2;
      const J = furtif.joueur();
      F.vu = this.grace > 0 && D.mode !== 'dort' ? 0 : this.vue(J);
      F.entendu = this.ouie(J);
    }
    F.tVue = 1e9;
    // (les changements d'état, qu'ils viennent de lui ou d'un autre — un cri, furtif.alerter —, passent par onEtat)
    const avant = D.etatConnu || 'tranquille';
    furtif.percevoir(D, dt);
    if (F.etat !== avant) { D.etatConnu = F.etat; this.onEtat(avant, F.etat); }
  },
  // posé, endormi ou mort, il a un corps : on ne le traverse pas (on est repoussé hors des capsules du tronc, des pattes, de
  // la base du cou, des bras des ailes et de la queue ; pas de la tête ni du cou au-delà du collier, qui reste à portée de
  // main ; on passe sous le ventre d'un Ver debout)
  repousser() {
    const D = this.D, p = game.player, R = this.rig;
    if (!D || !R || !D.matOk || D.dist > 40 || p.fly || (D.mode !== 'pose' && D.mode !== 'dort' && D.mode !== 'mort')) return;
    const c = [p.pos[0], p.pos[1] + 0.9, p.pos[2]];
    for (const [nm, a, b, r] of V3_CORPS) {
      const q = R.part(nm);
      if (!q || !q.W) continue;
      const A = v3Pt(q.W, a[0], a[1], a[2]), B = v3Pt(q.W, b[0], b[1], b[2]);
      const ux = B[0] - A[0], uy = B[1] - A[1], uz = B[2] - A[2], L2 = ux * ux + uy * uy + uz * uz || 1;
      const t = clamp(((c[0] - A[0]) * ux + (c[1] - A[1]) * uy + (c[2] - A[2]) * uz) / L2, 0, 1);
      const px = A[0] + ux * t, py = A[1] + uy * t, pz = A[2] + uz * t;
      const dx = c[0] - px, dy = c[1] - py, dz = c[2] - pz, R0 = r + 0.45;
      if (Math.abs(dy) >= R0 || dx * dx + dy * dy + dz * dz >= R0 * R0) continue;
      // dehors, à l'horizontale (on ne monte pas sur lui)
      let nx = dx, nz = dz, dh = Math.hypot(dx, dz);
      if (dh < 1e-3) { nx = Math.cos(D.yaw); nz = -Math.sin(D.yaw); dh = 1; }
      const loin = Math.sqrt(R0 * R0 - dy * dy);
      p.pos[0] = px + nx / dh * loin; p.pos[2] = pz + nz / dh * loin;
      c[0] = p.pos[0]; c[2] = p.pos[2];
      const vn = (p.vel[0] * nx + p.vel[2] * nz) / dh;
      if (vn < 0) { p.vel[0] -= vn * nx / dh; p.vel[2] -= vn * nz / dh; }
    }
  },
  // l'œil (la tête) dans le monde
  oeil() {
    const R = this.rig, q = R && R.part('tete');
    if (q && q.W && this.D.matOk) return v3Pt(q.W, 0, 0.6, 1.4);
    return [this.D.x, this.D.y + 8, this.D.z];
  },
  bouche() {
    const R = this.rig, q = R && R.part('museau_bout');
    if (q && q.W && this.D.matOk) return v3Pt(q.W, 0, -0.3, 0.45);
    return [this.D.x + Math.sin(this.D.yaw) * 25, this.D.y, this.D.z + Math.cos(this.D.yaw) * 25];
  },
  // le joueur est-il à l'abri du ciel (toit, sous terre, un abri déclaré par un autre agent) ?
  abrite(x, y, z) {
    const w = game.world, p = game.player;
    if (x === undefined) { const e = p.eyePos(); x = e[0]; y = e[1]; z = e[2]; if (p.underground) return true; }
    else if (y < w.heightAt(x, z) - 2) return true;
    if (w.covered(x, y, z)) return true;
    for (const fn of zone.dragon.abris) { try { if (fn(x, y, z)) return true; } catch (e) { /* */ } }
    // les intérieurs du château (V4), la ville sous la ville (V5) : ils le disent eux-mêmes
    try { if (zone.chateau && zone.chateau.aCouvert && zone.chateau.aCouvert([x, y, z])) return true; } catch (e) { /* */ }
    try { if (zone.catacombes && zone.catacombes.aCouvert && zone.catacombes.aCouvert([x, y, z])) return true; } catch (e) { /* */ }
    return false;
  },
  // les arbres serrés autour (de haut, on voit mal dessous) : 1 = rien, moins = caché
  canopee(J) {
    const w = game.world;
    let k = 1;
    w.query(J.x, J.z, 3, (o) => {
      if (!o || o.gone) return;
      const T = OBJ_TYPES[o.t], c = V3_ARBRES[T.id];
      if (c === undefined || o.h < 3) return;
      const d = Math.hypot(o.x - J.x, o.z - J.z);
      if (d < 2.6) k *= lerp(c, 1, d / 2.6);
    }, null);
    return clamp(k, 0.15, 1);
  },
  // ce que le joueur montre au ciel (0..1) — la formule seule (l'équilibrage la lit) : lumière, couvert (herbes hautes),
  // arbres serrés au-dessus, mouvement, nage, et l'herbe en feu tout près (on se voit)
  expoPure(lumiere, couvert, canopee, immobile, accroupi, court, nage, feuProche) {
    let e = 0.22 + 0.78 * lumiere;
    e *= 1 - couvert * 0.95;
    e *= canopee;
    // (« il voit ce qui bouge » : immobile, on se fond dans le paysage ; accroupi et immobile, presque tout à fait — le
    // berger du conte ; accroupi en marchant, un peu ; en courant, on se voit de plus loin)
    e *= immobile ? (accroupi ? 0.32 : 0.5) : accroupi ? 0.7 : court ? 1.25 : 1;
    if (nage) e *= 0.45;
    if (feuProche) e = Math.max(e, 0.8);
    return clamp(e, 0, 1);
  },
  // la portée de son regard (m) : le jour, la nuit, la lanterne, la brume ; puis ce que le joueur montre
  porteeVue(jour, brouillard, lanterne, expo) {
    let portee = lerp(V3.vueNuit, V3.vueJour, jour);
    if (lanterne) portee = Math.max(portee, V3.vueLanterne * (1 - jour * 0.4));
    portee = Math.min(portee, brouillard * 1.15 + 25);
    return portee * (0.25 + 0.75 * expo);
  },
  exposition(J) {
    const p = game.player;
    let feu = false;
    if (this.flammes.size) for (const b of this.flammes.values()) if (Math.abs(b.x - J.x) < 6 && Math.abs(b.z - J.z) < 6) { feu = true; break; }
    return this.expoPure(J.lumiere, J.couvert, this.canopee(J), J.immobile, J.accroupi, p.sprinting, p.swimming, feu);
  },
  // son regard : 0..1
  vue(J) {
    const D = this.D, F = D.furtif, p = game.player, sky = game.sky;
    if (game.dying || !sky) return 0;
    if (D.mode === 'dort' && F.etat !== 'intriguee' && F.etat !== 'alertee') {
      // endormi : seule une lanterne tout près traverse ses paupières
      if (!(game.lantern && farm.count('lanterne')) || D.dist > 40) return 0;
    }
    if (this.abrite()) return 0;
    const eye = this.oeil(), cx = J.x, cy = J.y + (J.accroupi ? 0.8 : 1.3), cz = J.z;
    const d = Math.hypot(cx - eye[0], cy - eye[1], cz - eye[2]);
    const portee = this.porteeVue(sky.day, sky.fog[1], !!(game.lantern && farm.count('lanterne')), this.exposition(J));
    if (d > portee) return 0;
    // le cône : posé, celui de la tête ; en vol, il regarde devant et dessous (presque tout, sauf derrière lui et au-dessus)
    const a = Math.atan2(cx - eye[0], cz - eye[2]);
    const da = Math.abs(angDiff(D.yaw + (D.mode === 'vol' ? 0 : D.teteY || 0), a));
    let k;
    if (D.mode === 'vol') k = da < 2.0 ? 1 : (cy < eye[1] - 20 ? 0.6 : 0.15);
    else k = da < 1.15 ? 1 : da < 1.75 ? 0.35 : d < 12 ? 0.4 : 0;
    if (!k) return 0;
    if (!this.ligneDeVue(eye, [cx, cy, cz], d)) return 0;
    return clamp((1 - d / portee) * 2, 0, 1) * k;
  },
  ligneDeVue(o, c, L) {
    const w = game.world, v = [(c[0] - o[0]) / L, (c[1] - o[1]) / L, (c[2] - o[2]) / L];
    const bh = w.raycastBlocks(o, v, L - 0.6);
    if (bh && !bh.block.hidden) return false;
    if (o[1] > w.heightAt(o[0], o[2]) - 0.5) { const th = w.raycastTerrain(o, v, L - 0.8); if (th) return false; }
    return true;
  },
  // son ouïe : 0..1 (distance vraie : il est souvent très au-dessus)
  ouie(J) {
    const D = this.D, F = D.furtif, eye = this.oeil();
    const k = D.mode === 'dort' ? V3.ouieDort : D.mode === 'vol' ? V3.ouieVol : V3.ouiePerche;
    let best = 0, ou = null;
    if (J.bruit > 0) { const d = Math.hypot(J.x - eye[0], J.y - eye[1], J.z - eye[2]), por = J.bruit * k; if (d < por) { best = (1 - d / por) * 0.8; ou = [J.x, J.y, J.z]; } }
    for (const b of furtif.bruits) {
      const fort = b.nature === 'coup de feu' ? 2.6 : b.nature === 'cloche' || b.nature === 'feu' ? 0 : 1;
      const d = Math.hypot(b.x - eye[0], b.y - eye[1], b.z - eye[2]), por = b.portee * k * fort;
      if (d < por) {
        const q = 1 - d / por;
        if (q > best) { best = q; ou = [b.x, b.y, b.z]; }
        // un bruit soudain le fait tressaillir, une fois (comme les autres guetteurs de V1, en moins nerveux : pas pour
        // un bruit à peine perçu) ; un caillou tout près d'un perchoir lui fait tourner la tête
        if (q > 0.15) { if (!b.ont) b.ont = new Set(); if (!b.ont.has(D)) { b.ont.add(D); F.sursaut = Math.max(F.sursaut || 0, q * 0.5); } }
      }
    }
    F.ouLeBruit = ou;
    return best;
  },

  // ------------------------------------------------------------- les états (furtif) et ce qu'il en fait
  onEtat(avant, apres) {
    const D = this.D, F = D.furtif, S = this.S(), pos = [D.x, D.y, D.z];
    if (apres === 'intriguee') {
      if (typeof sonV3 !== 'undefined') sonV3.grogne(pos, D.dist);
      if (D.mode === 'dort') { D.phase = 'oeil'; return; }
      if (D.mode === 'vol' && !this.enAttaque()) { D.phase = 'cercle'; D.cercle = { x: F.dernier.x, z: F.dernier.z, r: 95, a: Math.atan2(D.x - F.dernier.x, D.z - F.dernier.z), y: null }; }
    } else if (apres === 'alertee') {
      if (avant !== 'cherche') { S.vu++; if (typeof sonV3 !== 'undefined') sonV3.rugit(pos, D.dist); zone.dragon.cri = { t: game.time, x: D.x, y: D.y, z: D.z, fort: true }; }
      if (this.enAttaque()) return;            // (déjà en chasse : il continue sa manœuvre)
      if (D.mode === 'dort') { D.phase = 'reveil'; D.timer = 1.6; return; }
      if (D.mode === 'pose') { this.attaquePosee(); return; }
      this.planAttaque();
    } else if (apres === 'cherche') {
      if (this.enAttaque()) return;            // (il finit sa passe sur le dernier endroit, il décidera en remontant)
      if (D.mode === 'vol') { D.phase = 'cherche'; D.cercle = { x: F.dernier.x, z: F.dernier.z, r: 70, a: Math.atan2(D.x - F.dernier.x, D.z - F.dernier.z), y: null }; }
      else if (D.mode === 'pose') { D.phase = 'guette'; D.timer = 6; }
    } else if (apres === 'abandonne') {
      D.passes = 0;
      if (D.mode === 'vol') { D.phase = 'ronde'; D.cible = null; }
      else if (D.mode === 'pose') D.phase = 'veille';
    }
  },
  enAttaque() { const ph = this.D && this.D.phase; return ph === 'approche' || ph === 'pique' || ph === 'feu' || ph === 'remonte' || ph === 'cabre' || ph === 'crache'; },
  // ------------------------------------------------------------- décider (l'emploi du temps, la ronde)
  decider(dt) {
    const D = this.D, F = D.furtif, S = this.S(), h = this.heure(), H = V3.heures, L = this.lieux();
    // il rentre à l'heure (plus tôt s'il est loin : il est couché avant la nuit)
    const loin = Math.hypot(D.x - L.aire.x, D.z - L.aire.z) / (V3.vitesse * 1.2) / (JOUR_SECONDES / 24);
    const rentrer = h >= Math.min(H.retour, H.coucher - 0.6 - loin) || h < H.envol || (S.rappel && farm.s.hours < S.rappel);
    const tranquille = F.etat === 'tranquille' || F.etat === 'abandonne';
    if (D.mode === 'dort') {
      if (D.phase === 'reveil') { D.timer -= dt; if (D.timer <= 0) { this.poser(L.aire, 'veille'); if (F.etat === 'alertee') this.attaquePosee(); } return; }
      if (D.phase === 'oeil' && tranquille) D.phase = 'dort';
      if (h >= H.reveil && h < H.coucher && tranquille) { this.poser(L.aire, 'veille'); D.timer = 20; }
      return;
    }
    if (D.mode === 'pose') {
      if (D.phase === 'cabre' || D.phase === 'crache') return;
      if (D.phase === 'guette') { D.timer -= dt; if (D.timer <= 0) { if (F.etat === 'cherche') this.envol('cherche'); else D.phase = 'veille'; } return; }
      if (!tranquille) return;
      // la nuit tombe : il se couche (s'il est dans son aire) ou rentre
      if ((h >= H.coucher || h < H.reveil) && D.ou && D.ou.aire) { this.coucher(L.aire); return; }
      // l'heure de rentrer, loin de son aire : il n'attend pas (il serait encore en route à la nuit)
      if (rentrer && !(D.ou && D.ou.aire) && h >= H.envol) { this.envol('retour'); return; }
      D.timer -= dt;
      if (D.timer > 0) return;
      if (D.ou && D.ou.aire && rentrer) { D.timer = 15; return; }
      this.envol('ronde');
      return;
    }
    // en vol (le soir, il cesse de tourner : il rentre)
    if (D.phase === 'cercle' && tranquille && rentrer && h >= H.envol) { D.phase = 'retour'; D.cercle = null; D.cible = L.aire; }
    if (D.phase === 'ronde' || D.phase === 'retour') {
      if (rentrer && D.phase !== 'retour') { D.phase = 'retour'; D.cible = L.aire; }
      if (!D.cible) D.cible = D.phase === 'retour' ? L.aire : this.prochain();
      const c = D.cible, dd = Math.hypot(c.x - D.x, c.z - D.z);
      if (c.perche || c.aire) { if (dd < 260) { D.phase = 'atterrit'; D.timer = 0; } }
      else if (dd < (c.r || 140)) { D.phase = 'cercle'; D.cercle = { x: c.x, z: c.z, r: c.r || 140, a: Math.atan2(D.x - c.x, D.z - c.z), y: null, tours: c.porte ? 1.2 : 0.8, fait: 0 }; D.cible = null; }
    } else if (D.phase === 'cercle' && tranquille && D.cercle && D.cercle.tours !== undefined && D.cercle.fait >= D.cercle.tours * TAU) { D.phase = 'ronde'; D.cercle = null; }
    else if (D.phase === 'cercle' && tranquille && D.cercle && D.cercle.tours === undefined) { D.cercle.fait = (D.cercle.fait || 0); if (D.cercle.fait > TAU * 1.3) { D.phase = 'ronde'; D.cercle = null; } }
    else if (D.phase === 'cherche' && tranquille) { D.phase = 'ronde'; D.cible = null; }
  },
  // le prochain point de la ronde
  prochain() {
    const D = this.D, L = this.lieux(), S = this.S(), p = game.player.pos;
    const recents = D.recents || (D.recents = []);
    const choix = (A) => { const B = A.filter((q) => !recents.includes(q.id)); const q = B.length ? B[(Math.random() * B.length) | 0] : A[(Math.random() * A.length) | 0]; recents.push(q.id); if (recents.length > 3) recents.shift(); return q; };
    const r = Math.random();
    // il surveille : il va souvent voir là où l'on est (la région du joueur), là où il s'est passé quelque chose
    if (r < 0.4 && this.grace <= 0) {
      const reg = zone.region(p[0], p[2]);
      const q = L.survols.find((v) => v.id === reg) || { id: 'joueur', x: p[0] + (Math.random() - 0.5) * 300, z: p[2] + (Math.random() - 0.5) * 300, r: 150 };
      if (Math.hypot(q.x - D.x, q.z - D.z) > 200) { recents.push(q.id); if (recents.length > 3) recents.shift(); return q; }
    }
    if (r < 0.62) return choix(L.perchoirs);
    return choix(L.survols);
  },
  envol(phase) {
    const D = this.D;
    D.mode = 'vol'; D.phase = 'envol'; D.apres = phase || 'ronde'; D.timer = 3.2; D.v = 4; D.vy = 7; D.cible = null;
    if (typeof sonV3 !== 'undefined') sonV3.envol([D.x, D.y, D.z], D.dist);
    this.secousse(D.dist, 70, 0.4);
  },

  // ------------------------------------------------------------- l'attaque
  cibleJoueur() {
    const p = game.player, F = this.D.furtif;
    if (F.vu > 0.05) return { x: p.pos[0] + p.vel[0] * 0.6, y: p.pos[1], z: p.pos[2] + p.vel[2] * 0.6 };
    const d = F.dernier || { x: p.pos[0], y: p.pos[1], z: p.pos[2] };
    return { x: d.x, y: d.y, z: d.z };
  },
  planAttaque() {
    const D = this.D;
    if (D.mode !== 'vol') { this.envol('approche'); return; }
    D.phase = 'approche'; D.proie = this.cibleJoueur(); D.passe = null;
    // trop près pour piquer : il s'éloigne d'abord, pour revenir en ligne
    D.ap = Math.hypot(D.proie.x - D.x, D.proie.z - D.z) < 160 ? 'eloigne' : 'revient';
  },
  // posé : il se dresse et crache (si l'on est assez près), sinon il s'envole pour fondre
  attaquePosee() {
    const D = this.D, p = game.player;
    const d = Math.hypot(p.pos[0] - D.x, p.pos[2] - D.z);
    if (d < V3.feuPortee + 18 && D.furtif.vu > 0.05) { D.phase = 'cabre'; D.timer = 1.1; D.proie = this.cibleJoueur(); }
    else this.envol('approche');
  },

  // ------------------------------------------------------------- le vol
  voler(dt) {
    const D = this.D, Z = zone.Z, S = this.S(), F = D.furtif;
    let tx = D.x + Math.sin(D.yaw) * 100, tz = D.z + Math.cos(D.yaw) * 100, ty = null, vt = V3.vitesse, virage = V3.virage, marge = 30, climbMax = 9;
    const sol = (x, z) => Math.max(Z.heightAt(x, z), Z.waterLevel, this.toitAt(x, z));
    switch (D.phase) {
      case 'envol': {
        D.timer -= dt; vt = 18; virage = 0.4; marge = 0; climbMax = 12;
        ty = sol(D.x, D.z) + 45;
        if (D.timer <= 0) { D.phase = D.apres || 'ronde'; if (D.phase === 'approche') D.proie = this.cibleJoueur(); }
        break;
      }
      case 'ronde': case 'retour': {
        const c = D.cible || (D.cible = this.prochain());
        tx = c.x; tz = c.z; ty = this.plancher(D.x, D.z, D.yaw, 140) + this.altitudeRonde();
        if (D.phase === 'retour') vt = V3.vitesse * 1.2;
        break;
      }
      case 'cercle': case 'cherche': {
        const C = D.cercle;
        if (!C) { D.phase = 'ronde'; break; }
        const vs = D.phase === 'cherche' ? V3.vitesseCherche : V3.vitesse * 0.85;
        C.a += vs / C.r * dt; C.fait = (C.fait || 0) + vs / C.r * dt;
        tx = C.x + Math.sin(C.a + 0.5) * C.r; tz = C.z + Math.cos(C.a + 0.5) * C.r;
        const g = sol(C.x, C.z);
        ty = Math.max(g + (D.phase === 'cherche' ? V3.altitudeCherche : this.altitudeRonde() * 0.75), this.plancher(D.x, D.z, D.yaw, 80) + 25);
        vt = vs; virage = 0.8;
        // il regarde l'endroit
        D.regardP = -0.45;
        if (D.phase === 'cherche' && F.dernier) { C.x = lerp(C.x, F.dernier.x, dt * 0.2); C.z = lerp(C.z, F.dernier.z, dt * 0.2); }
        break;
      }
      case 'approche': {
        // il se met en ligne : s'il est trop près, il s'éloigne tout droit (en prenant de la hauteur), puis il revient, de
        // loin, face à la proie, et pique quand il est aligné
        const P = D.proie || (D.proie = this.cibleJoueur());
        if (F.vu > 0.1) Object.assign(P, this.cibleJoueur());
        const d = Math.hypot(P.x - D.x, P.z - D.z), aim = Math.atan2(P.x - D.x, P.z - D.z), dir = Math.abs(angDiff(D.yaw, aim));
        vt = V3.vitesse * 1.15; virage = 0.7; ty = sol(P.x, P.z) + 62;
        if (D.ap === 'eloigne') {
          // il s'éloigne du côté où le relief est le plus bas (pour revenir en rase-mottes, pas du haut d'une montagne)
          if (D.apDir === undefined || D.apDir === null) {
            const loin = Math.atan2(D.x - P.x, D.z - P.z);
            let best = 1e9;
            for (const k of [0, 0.7, -0.7, 1.4, -1.4]) {
              const a = loin + k;
              let m = -1e9;
              for (let s = 60; s <= 260; s += 50) m = Math.max(m, sol(P.x + Math.sin(a) * s, P.z + Math.cos(a) * s));
              m += Math.abs(k) * 6;
              if (m < best) { best = m; D.apDir = a; }
            }
          }
          tx = P.x + Math.sin(D.apDir) * 300; tz = P.z + Math.cos(D.apDir) * 300;
          if (d > 220) { D.ap = 'revient'; D.apDir = null; }
        } else {
          tx = P.x; tz = P.z;
          // (il ne pique que s'il peut descendre à temps : pas d'une montagne)
          const haut = D.y - sol(P.x, P.z), faisable = haut < 30 + (d - 45) * 0.85;
          if (dir < 0.4 && d < 270 && d > 110 && faisable) { D.phase = 'pique'; D.passe = { ax: D.x, az: D.z, dir: aim }; this.S().attaques++; D.passes++; if (typeof sonV3 !== 'undefined') sonV3.pique([D.x, D.y, D.z], D.dist); }
          else if (d < 110) D.ap = 'eloigne';
        }
        break;
      }
      case 'pique': {
        const P = D.proie;
        if (F.vu > 0.1) Object.assign(P, this.cibleJoueur());
        const d = Math.hypot(P.x - D.x, P.z - D.z), g = sol(P.x, P.z);
        tx = P.x; tz = P.z; vt = V3.vitessePique; virage = 0.9; marge = 6; climbMax = 6;
        // la tête à V3.altitudeFeu au-dessus du sol, 45 m avant la proie (la racine est un peu plus haut que la tête)
        ty = g + V3.altitudeFeu + 3 + Math.max(0, d - 45) * 0.3;
        D.regardP = -0.35;
        const fwd = Math.cos(angDiff(D.yaw, Math.atan2(P.x - D.x, P.z - D.z)));
        if (d < 68 && fwd > 0.5) { D.phase = 'feu'; D.timer = 0; D.feuDir = D.yaw; this.ouvrirFeu(); }
        else if (d < 30 || d > 320) { D.phase = 'remonte'; D.timer = 0; }
        break;
      }
      case 'feu': {
        // tout droit, au ras, la gueule ouverte
        D.timer += dt; vt = V3.vitessePique * 0.85; virage = 0.15; marge = 5; climbMax = 6;
        tx = D.x + Math.sin(D.feuDir) * 100; tz = D.z + Math.cos(D.feuDir) * 100;
        ty = sol(D.x + Math.sin(D.yaw) * 30, D.z + Math.cos(D.yaw) * 30) + V3.altitudeFeu + 3;
        D.regardP = -0.55;
        if (D.timer > 2.2) { this.fermerFeu(); D.phase = 'remonte'; D.timer = 0; }
        break;
      }
      case 'remonte': {
        D.timer += dt; vt = V3.vitesse * 1.1; virage = 0.7; climbMax = 14;
        const s = D.tourne || (D.tourne = Math.random() < 0.5 ? 1 : -1);
        tx = D.x + Math.sin(D.yaw + s * 1.2) * 150; tz = D.z + Math.cos(D.yaw + s * 1.2) * 150;
        ty = sol(D.x, D.z) + 75;
        if (D.timer > 4.5) {
          D.tourne = null;
          if (F.etat === 'alertee' && D.passes < V3.passesMax) { D.phase = 'approche'; D.proie = this.cibleJoueur(); D.ap = 'eloigne'; }
          else if (F.etat === 'alertee' || F.etat === 'cherche') { D.phase = 'cherche'; const d0 = F.dernier || this.cibleJoueur(); D.cercle = { x: d0.x, z: d0.z, r: 70, a: Math.atan2(D.x - d0.x, D.z - d0.z), y: null }; }
          else { D.phase = 'ronde'; D.cible = null; D.passes = 0; }
        }
        break;
      }
      case 'atterrit': {
        const q = D.cible;
        if (!q) { D.phase = 'ronde'; break; }
        const dx = q.x - D.x, dz = q.z - D.z, d = Math.hypot(dx, dz), y0 = Z.heightAt(q.x, q.z) + V3_HAUT.pose;
        tx = q.x; tz = q.z; virage = 0.9;
        vt = clamp(d * 0.32, 7, V3.vitesse); marge = 4;
        ty = y0 + Math.min(70, d * 0.28);
        D.pattesK = clamp(1 - (d - 25) / 60, 0, 1);
        D.final = d < 60;   // (en finale, il ne regarde plus que le sol sous lui : les rochers du bord ne l'empêchent pas de se poser)
        if (d < 7 && Math.abs(D.y - y0) < 5) {
          if (q.aire && (this.heure() >= V3.heures.coucher || this.heure() < V3.heures.reveil)) this.coucher(q);
          else this.poser(q, 'veille');
          if (q.aire && S.rappel && farm.s.hours < S.rappel) D.timer = Math.max(D.timer, (S.rappel - farm.s.hours) * JOUR_SECONDES / 24);
          if (typeof sonV3 !== 'undefined') sonV3.atterrit([D.x, D.y - 6, D.z], D.dist);
          this.secousse(D.dist, 90, 0.5);
          puffAt(D.x, D.y - V3_HAUT.pose + 0.3, D.z, [120, 112, 100], 30, 9, false);
          return;
        }
        // il fait un tour s'il arrive mal aligné (trop vite, trop haut)
        if (d < 40 && Math.abs(D.y - y0) > 18) { D.phase = 'ronde'; D.cible = q; }
        break;
      }
    }
    // ---- la cinématique : cap, roulis, vitesse, altitude (jamais dans le relief ni dans les toits)
    const want = Math.atan2(tx - D.x, tz - D.z), dy = angDiff(D.yaw, want);
    const turn = clamp(dy, -virage * dt, virage * dt);
    D.yaw += turn;
    D.roll = lerp(D.roll, clamp(-turn / Math.max(dt, 1e-3) * 1.1, -0.7, 0.7), Math.min(1, dt * 2.5));
    D.v += clamp(vt - D.v, -14 * dt, 9 * dt);
    // (en chasse, il suit le relief de plus près : il ne regarde pas si loin devant lui ; en finale, le sol sous lui)
    const finale = D.phase === 'atterrit' && D.final;
    const yMin = finale ? Math.max(Z.heightAt(D.x, D.z), Z.waterLevel) + 4
      : this.plancher(D.x, D.z, D.yaw, this.enAttaque() ? Math.max(30, D.v * 1.6) : Math.max(40, D.v * 3)) + marge + 4;
    if (D.phase !== 'atterrit') D.final = false;
    const yWant = Math.max(ty === null ? D.y : ty, yMin);
    // (en piqué, il tombe bien plus vite qu'il ne monte)
    const pq = D.phase === 'pique' || D.phase === 'feu';
    const vyWant = clamp((yWant - D.y) * (pq ? 1.4 : 0.9), pq ? -42 : -26, climbMax + (yMin > D.y ? 10 : 0));
    D.vy += clamp(vyWant - D.vy, -(pq ? 30 : 16) * dt, 16 * dt);
    D.x += Math.sin(D.yaw) * D.v * dt; D.z += Math.cos(D.yaw) * D.v * dt; D.y += D.vy * dt;
    if (D.y < yMin - 3) D.y = yMin - 3; // (sûreté : jamais dans la pente)
    // dans la Zone, toujours (le rebord des montagnes)
    const S0 = Z.size;
    if (D.x < 120 || D.z < 120 || D.x > S0 - 120 || D.z > S0 - 120) { D.x = clamp(D.x, 120, S0 - 120); D.z = clamp(D.z, 120, S0 - 120); D.yaw += dt * 0.8; }
    D.pitch = lerp(D.pitch, clamp(Math.atan2(D.vy, Math.max(D.v, 6)) * 0.85, -0.6, 0.5), Math.min(1, dt * 3));
    // les ailes : on bat pour monter, ralentir, décoller ; on plane en croisière ou en piqué
    const effort = clamp((D.vy - 1) / 6, 0, 1) + (D.phase === 'envol' || D.phase === 'atterrit' ? 1 : 0) + (D.v < 16 ? 0.6 : 0);
    const planeVoulu = D.phase === 'pique' || D.phase === 'feu' ? 1 : effort > 0.3 ? 0 : (Math.sin(game.time * 0.11 + D.x0) > 0.1 ? 1 : 0);
    D.plane = lerp(D.plane, planeVoulu, Math.min(1, dt * 1.5));
    D.ampl = lerp(D.ampl, D.phase === 'envol' ? 1 : 0.85, Math.min(1, dt * 2));
    const freq = D.phase === 'envol' || D.phase === 'atterrit' ? 0.85 : 0.6;
    const ph0 = D.battement;
    D.battement += TAU * freq * dt * (1 - D.plane * 0.85);
    // un coup d'aile (vers le bas) : le son, et la poussière si l'on est près du sol
    if (Math.floor((ph0 - Math.PI / 2) / TAU) !== Math.floor((D.battement - Math.PI / 2) / TAU) && D.plane < 0.6) {
      if (typeof sonV3 !== 'undefined') sonV3.battement([D.x, D.y, D.z], D.dist, D.phase === 'envol' ? 1.3 : 1);
      const g = sol(D.x, D.z);
      if (D.y - g < 22) { puffAt(D.x, g + 0.4, D.z, [120, 112, 100], 18, 10, false); this.vent(D.x, D.z, 30, 3); }
    }
  },
  // ------------------------------------------------------------- au sol (posé, endormi)
  au_sol(dt) {
    const D = this.D, F = D.furtif, p = game.player;
    D.v = 0; D.vy = 0; D.pitch = 0; D.roll = 0;
    // le regard : il balaie lentement l'horizon ; intrigué, il fixe l'endroit ; il cherche : vite
    D.regT = (D.regT || 0) - dt;
    if (D.mode === 'pose') {
      if ((F.etat === 'intriguee' || F.etat === 'cherche' || F.etat === 'alertee') && F.dernier) {
        const a = angDiff(D.yaw, Math.atan2(F.dernier.x - D.x, F.dernier.z - D.z));
        D.regardY = clamp(a, -1.6, 1.6);
        const dd = Math.hypot(F.dernier.x - D.x, F.dernier.z - D.z);
        D.regardP = clamp(Math.atan2((F.dernier.y || 0) - (D.y + 7), dd), -0.8, 0.4);
        // tout le corps se tourne s'il faut (au-delà de ce que le cou permet)
        if (Math.abs(a) > 1.3) D.yaw += clamp(a, -0.5 * dt, 0.5 * dt);
      } else if (D.regT <= 0) {
        D.regT = 2.5 + Math.random() * 4;
        D.regardY = (Math.random() - 0.5) * 2.6; D.regardP = -0.1 - Math.random() * 0.35;
        if (Math.random() < 0.12) D.etirer = 3;
        if (Math.random() < 0.1 && typeof sonV3 !== 'undefined') sonV3.chaine([D.x, D.y + 4, D.z], D.dist);
      }
      // dressé : il crache vers la proie
      if (D.phase === 'cabre') {
        D.timer -= dt;
        const P = D.proie || this.cibleJoueur(), a = angDiff(D.yaw, Math.atan2(P.x - D.x, P.z - D.z));
        D.yaw += clamp(a, -1.4 * dt, 1.4 * dt);
        D.regardY = clamp(a, -0.6, 0.6);
        if (D.timer <= 0) { D.phase = 'crache'; D.timer = 1.9; this.ouvrirFeu(); }
      } else if (D.phase === 'crache') {
        D.timer -= dt;
        if (F.vu > 0.05) D.proie = this.cibleJoueur();
        const P = D.proie, a = angDiff(D.yaw, Math.atan2(P.x - D.x, P.z - D.z));
        D.yaw += clamp(a, -0.8 * dt, 0.8 * dt);
        D.regardY = clamp(a, -0.6, 0.6);
        if (D.timer <= 0) {
          this.fermerFeu();
          if (F.etat === 'alertee' && F.vu > 0.05) this.envol('approche');
          else { D.phase = 'guette'; D.timer = 5; }
        }
      }
    } else if (D.mode === 'dort') {
      D.regardY = 0; D.regardP = 0;
    }
  },

  // ------------------------------------------------------------- le feu
  ouvrirFeu() {
    const D = this.D;
    this.souffle = { t: 0, n: 0, debut: null };
    if (typeof sonV3 !== 'undefined') sonV3.feu(this.bouche(), D.dist, 2.2);
    this.secousse(D.dist, 80, 0.45);
  },
  fermerFeu() {
    const s = this.souffle;
    this.souffle = null;
    // la trace au sol (de la cendre), gardée quelques jours
    if (s && s.debut && s.fin) {
      const S = this.S();
      S.traces.push([Math.round(s.debut[0]), Math.round(s.debut[1]), Math.round(s.fin[0]), Math.round(s.fin[1]), farm.s.day]);
      while (S.traces.length > 40) S.traces.shift();
    }
  },
  // la direction du jet : vers la proie (posé) ou devant et dessous (en vol)
  jet() {
    const D = this.D, o = this.bouche();
    if (D.mode === 'pose') {
      // posé : vers la proie (la tête la suit, lentement : on peut lui échapper en courant de côté)
      const P = D.proie || this.cibleJoueur(), tgt = [P.x, P.y + 0.8, P.z];
      let d = [tgt[0] - o[0], tgt[1] - o[1], tgt[2] - o[2]];
      const L = Math.hypot(d[0], d[1], d[2]) || 1;
      return { o, d: [d[0] / L, d[1] / L, d[2] / L] };
    }
    // en vol : devant et dessous, à un angle fixe (selon sa hauteur) : le jet balaie le sol le long de sa route
    const hm = o[1] - zone.Z.heightAt(o[0], o[2]), th = clamp(Math.asin(clamp(hm / 32, 0, 1)), 0.3, 1.2), c = Math.cos(th);
    return { o, d: [Math.sin(D.yaw) * c, -Math.sin(th), Math.cos(D.yaw) * c] };
  },
  majSouffle(dt) {
    const s = this.souffle, D = this.D;
    this.feuK = lerp(this.feuK, s ? 1 : 0, Math.min(1, dt * 6));
    if (!s) return;
    s.t += dt;
    const { o, d } = this.jet(), w = game.world;
    // où le jet touche (le relief, un bloc) : il s'arrête là
    let L = V3.feuPortee;
    const th = w.raycastTerrain(o, d, L);
    if (th) L = th.t;
    const bh = w.raycastBlocks(o, d, L);
    if (bh && !bh.block.hidden) L = bh.t;
    s.o = o; s.d = d; s.L = L;
    // l'impact (tous les dixièmes de seconde) : le sol prend feu, l'herbe brûle
    s.n -= dt;
    if (s.n <= 0 && L < V3.feuPortee - 0.5) {
      s.n = 0.1;
      const x = o[0] + d[0] * L, y = o[1] + d[1] * L, z = o[2] + d[2] * L;
      this.impacts.push({ x, y, z, t: 0 });
      if (!s.debut) s.debut = [x, z];
      s.fin = [x, z];
      this.embraser(x, z, 3.6);
      this.cendre(x, z, 2.6);
      furtif.bruit(x, y, z, 14, 'feu');
      for (const fn of zone.dragon.surFeu) try { fn(x, y, z, 4); } catch (e) { console.error(e); }
    }
    // les flammes (particules) le long du jet
    const R = Math.random;
    for (let k = 0; k < 7; k++) {
      const t = R() * L, sp = 0.6 + t * 0.2;
      particles.spawn(o[0] + d[0] * t + (R() - 0.5) * sp, o[1] + d[1] * t + (R() - 0.5) * sp, o[2] + d[2] * t + (R() - 0.5) * sp,
        d[0] * 14 + (R() - 0.5) * 4, d[1] * 14 + R() * 3, d[2] * 14 + (R() - 0.5) * 4, [1, 0.45 + R() * 0.4, 0.1 + R() * 0.15, 1], 0.28 + t * 0.03, 0.25 + R() * 0.25, -2, true);
    }
    // le joueur dans le jet ?
    const p = game.player, c = [p.pos[0], p.pos[1] + 1.0, p.pos[2]];
    const v = [c[0] - o[0], c[1] - o[1], c[2] - o[2]], t = v[0] * d[0] + v[1] * d[1] + v[2] * d[2];
    if (t > 0 && t < L + 1.5) {
      const r = Math.hypot(v[0] - d[0] * t, v[1] - d[1] * t, v[2] - d[2] * t);
      if (r < 1.3 + t * 0.2 && !this.protege(o, c)) this.bruler(V3.feuDegats * dt * (1 - r / (1.3 + t * 0.2) * 0.5), o);
    }
  },
  // protégé du feu : sous un toit, sous terre, sous l'eau, derrière la pierre
  protege(o, c) {
    const p = game.player, w = game.world;
    if (p.underground || p.pos[1] < w.waterLevel - 1.3) return true;
    if (w.covered(c[0], c[1] + 0.6, c[2])) return true;
    const L = Math.hypot(c[0] - o[0], c[1] - o[1], c[2] - o[2]) || 1, d = [(c[0] - o[0]) / L, (c[1] - o[1]) / L, (c[2] - o[2]) / L];
    const bh = w.raycastBlocks(o, d, L - 0.5);
    if (bh && !bh.block.hidden) return true;
    for (const fn of zone.dragon.abris) { try { if (fn(c[0], c[1], c[2])) return true; } catch (e) { /* */ } }
    return false;
  },
  bruler(dmg, src, apres) {
    if (!apres) this.brule = 1.6;     // (on brûle encore un peu après : seulement si l'on vient d'être pris dans le feu)
    this.brulAcc = (this.brulAcc || 0) + dmg;
    if (this.brulAcc >= 4) { const n = this.brulAcc; this.brulAcc = 0; play.hurt(n, src ? { x: src[0], z: src[2] } : null, this.cause()); }
  },
  cause() { const pn = strange.placeName(game.player.pos); return V3_TEXTES.mort + (pn ? ' — ' + pn : ''); },
  // les impacts du jet : le sol brûle encore un peu (et brûle qui s'y tient)
  majImpacts(dt) {
    if (!this.impacts.length) return;
    const p = game.player, R = Math.random;
    for (const I of this.impacts) {
      I.t += dt;
      if (I.t < 1.4 && R() < dt * 14) particles.spawn(I.x + (R() - 0.5) * 3, I.y + 0.2, I.z + (R() - 0.5) * 3, (R() - 0.5) * 1.5, 2 + R() * 3, (R() - 0.5) * 1.5, [1, 0.5 + R() * 0.3, 0.12, 1], 0.22, 0.4 + R() * 0.4, -1, true);
      if (I.t < 1.2 && Math.hypot(I.x - p.pos[0], I.z - p.pos[2]) < 3.4 && Math.abs(I.y - p.pos[1]) < 3 && !this.protege([I.x, I.y + 1, I.z], [p.pos[0], p.pos[1] + 1, p.pos[2]])) this.bruler(V3.feuBord * dt, [I.x, I.y, I.z]);
    }
    this.impacts = this.impacts.filter((I) => I.t < 3);
  },
  // ------------------------------------------------------------- l'herbe qui brûle (la Zone seulement)
  embraser(x, z, r) {
    const w = zone.Z;
    if (!w || this.flammes.size >= V3.brulePar) return;
    const pluie = typeof weather !== 'undefined' ? weather.cur.rain : 0;
    w.forObjectsNearRay([x - r, 0, z], [1, 0, 0], r * 2, (o, i) => {
      if (!o || o.gone || this.flammes.has(i) || this.flammes.size >= V3.brulePar) return;
      const T = OBJ_TYPES[o.t];
      if (!V3_FLAMMES[T.id] || Math.hypot(o.x - x, o.z - z) > r) return;
      if (Math.random() < pluie * 0.6) return;
      this.allumer(o, i);
    });
  },
  allumer(o, i) {
    const w = zone.Z, T = OBJ_TYPES[o.t], gros = V3_FLAMMES[T.id] === 2;
    this.flammes.set(i, { o, i, t: 0, life: gros ? 14 + Math.random() * 10 : 4 + Math.random() * 4, x: o.x, z: o.z, y: w.objectY(o), h: Math.max(0.6, o.h), gros, sp: 0 });
    try { game.renderer.objFlag(i, 8); } catch (e) { /* */ }
  },
  majFlammes(dt) {
    if (!this.flammes.size) { if (this.rebuild && (this.rebuildT -= dt) <= 0) { this.rebuild = false; zone.Z.objectsDirty = true; zone.Z.grid = null; } return; }
    const p = game.player, R = Math.random, pluie = typeof weather !== 'undefined' ? weather.cur.rain : 0;
    const fini = [], neuf = [];
    let n = 0, proche = null, pd = 1e9;
    for (const b of this.flammes.values()) {
      b.t += dt * (1 + pluie * 2);
      // le feu gagne l'herbe voisine (un peu, et pas sous la pluie)
      b.sp -= dt;
      if (b.sp <= 0 && b.t > 1 && b.t < b.life * 0.7) {
        b.sp = 0.45;
        if (this.flammes.size + neuf.length < V3.brulePar && R() < 0.5 * (1 - pluie)) zone.Z.forObjectsNearRay([b.x - 2.6, 0, b.z], [1, 0, 0], 5.2, (o, i) => {
          if (!o || o.gone || this.flammes.has(i) || neuf.some((q) => q[1] === i)) return;
          if (!V3_FLAMMES[OBJ_TYPES[o.t].id] || Math.hypot(o.x - b.x, o.z - b.z) > 2.6 || R() > 0.3) return;
          neuf.push([o, i]);
        });
      }
      if (b.t >= b.life) fini.push(b);
      const d = Math.hypot(b.x - p.pos[0], b.z - p.pos[2]);
      if (d < pd) { pd = d; proche = b; }
      if (d < 1.3 && Math.abs(b.y - p.pos[1]) < 2) this.bruler(V3.feuBord * 0.7 * dt, [b.x, b.y, b.z]);
      if (d < 140 && ++n < 45) {
        if (R() < dt * (b.gros ? 9 : 5)) particles.spawn(b.x + (R() - 0.5) * (b.gros ? 1.6 : 0.7), b.y + b.h * (0.2 + R() * 0.7), b.z + (R() - 0.5) * (b.gros ? 1.6 : 0.7), (R() - 0.5) * 0.6, 1.8 + R() * 2, (R() - 0.5) * 0.6, [1, 0.5 + R() * 0.3, 0.12, 1], 0.08, 0.5 + R() * 0.5, -0.6, true);
        if (R() < dt * 1.2) { particles.spawn(b.x, b.y + b.h, b.z, (R() - 0.5) * 0.5, 1.4 + R(), (R() - 0.5) * 0.5, [0.2, 0.19, 0.18, 0.4], 0.5, 4 + R() * 3, -0.04, false); particles.list[particles.list.length - 1].grow = 3; }
      }
    }
    for (const [o, i] of neuf) this.allumer(o, i);
    for (const b of fini) this.eteindre(b);
    this.flammeProche = proche && pd < 60 ? proche : null;
    if (proche && pd < 30 && typeof sonV3 !== 'undefined' && (this.sonT.crepite = (this.sonT.crepite || 0) - dt) <= 0) { this.sonT.crepite = 0.35; sonV3.crepite([proche.x, proche.y + 0.5, proche.z]); }
  },
  // l'herbe brûlée : elle disparaît (sans tout reconstruire), la cendre reste ; gardé pour quelques jours
  eteindre(b) {
    const w = zone.Z, S = this.S(), o = b.o, rd = game.renderer;
    this.flammes.delete(b.i);
    o.gone = true;
    try {
      rd.objFlag(b.i, 0);
      const sl = rd.objSlot ? rd.objSlot[b.i] : -1;
      if (sl >= 0 && rd.objAll) { rd.objAll[sl * 13 + 3] = 0; rd.objAll[sl * 13 + 4] = 0; rd.activeCenter = null; }
    } catch (e) { /* */ }
    S.brule[b.i] = [farm.s.day, Math.round(o.x), Math.round(o.z)];
    this.cendre(o.x, o.z, b.gros ? 1.8 : 1.1);
    if (OBJ_TYPES[o.t].col || OBJ_TYPES[o.t].colK) { this.rebuild = true; this.rebuildT = 1.5; }
    else w.allGrid = null;
  },
  // de la cendre au sol (matière de V1)
  cendre(x, z, r) {
    const w = zone.Z, c = w.cell;
    let i0 = 1e9, j0 = 1e9, i1 = -1, j1 = -1;
    for (let j = Math.floor((z - r) / c); j <= Math.ceil((z + r) / c); j++) for (let i = Math.floor((x - r) / c); i <= Math.ceil((x + r) / c); i++) {
      if (i < 0 || j < 0 || i > w.N || j > w.N) continue;
      if (Math.hypot(i * c - x, j * c - z) + (hash2i(i, j, 71) - 0.5) * 1.4 > r) continue;
      const k = j * w.W + i;
      if (w.heights[k] < w.waterLevel + 0.1) continue;
      if (w.mats[k] === M_COBBLE) continue;
      w.mats[k] = M_V1_CENDRE;
      i0 = Math.min(i0, i); j0 = Math.min(j0, j); i1 = Math.max(i1, i); j1 = Math.max(j1, j);
    }
    if (i1 >= 0) w.markMats(i0, j0, i1, j1);
  },

  // ------------------------------------------------------------- le joueur : il brûle encore un peu ; l'ombre qui passe
  majJoueur(dt) {
    const p = game.player;
    if (this.brule > 0) {
      this.brule -= dt;
      if (p.swimming || p.wading) this.brule = 0;
      else this.bruler(V3.feuApres * dt, null, true);
    }
    // l'ombre sur soi : la projection du corps, au soleil
    const D = this.D, sky = game.sky;
    let k = 0;
    if (D && D.mode === 'vol' && sky && sky.day > 0.25) {
      const L = sky.sunDir, g = zone.Z.heightAt(D.x, D.z), h = Math.max(0, D.y - g);
      if (L[1] > 0.12) { const sx = D.x - L[0] / L[1] * h, sz = D.z - L[2] / L[1] * h, d = Math.hypot(sx - p.pos[0], sz - p.pos[2]); k = clamp(1 - d / 22, 0, 1) * sky.day * (h < 260 ? 1 : 0); }
    }
    this.ombreK = lerp(this.ombreK, k, Math.min(1, dt * 6));
    if (k > 0.3 && !this.ombrePasse) { this.ombrePasse = true; if (typeof sonV3 !== 'undefined' && D.dist < 220) sonV3.passage([D.x, D.y, D.z], D.dist); }
    else if (k < 0.05) this.ombrePasse = false;
  },
  // un souffle d'air : il pousse le joueur (atterrissage, coups d'aile près du sol)
  vent(x, z, r, f) {
    const p = game.player, dx = p.pos[0] - x, dz = p.pos[2] - z, d = Math.hypot(dx, dz);
    if (d > r || d < 0.1) return;
    const k = (1 - d / r) * f;
    p.vel[0] += dx / d * k; p.vel[2] += dz / d * k;
  },
  secousse(d, r, k) { if (d < r) game.shakeT = Math.max(game.shakeT || 0, k * (1 - d / r) + 0.1); },

  // ------------------------------------------------------------- les sons de fond (le cri lointain, le souffle quand il dort)
  majSons(dt) {
    const D = this.D;
    if (typeof sonV3 === 'undefined') return;
    const T = this.sonT;
    T.cri = (T.cri ?? 30 + Math.random() * 60) - dt;
    if (T.cri <= 0) {
      T.cri = 70 + Math.random() * 110;
      if (D.mode === 'vol' && !this.enAttaque()) { sonV3.cri([D.x, D.y, D.z], D.dist); zone.dragon.cri = { t: game.time, x: D.x, y: D.y, z: D.z, fort: false }; }
    }
    if ((D.mode === 'pose' || D.mode === 'dort') && D.dist < 70) {
      T.resp = (T.resp ?? 1) - dt;
      if (T.resp <= 0) { T.resp = D.mode === 'dort' ? 3.6 : 2.4; sonV3.respire(this.bouche(), D.dist, D.mode === 'dort'); this.fumee(); }
    }
  },
  // la fumée des naseaux
  fumee() {
    if (!this.D.matOk) return;
    const R = this.rig, o = v3Pt(R.part('museau_bout').W, 0, 0.4, 0.5), f = v3Pt(R.part('museau_bout').W, 0, 0.2, 2.5);
    const d = [f[0] - o[0], f[1] - o[1], f[2] - o[2]];
    for (let k = 0; k < 6; k++) { particles.spawn(o[0], o[1], o[2], d[0] * 0.5 + (Math.random() - 0.5) * 0.4, d[1] * 0.5 + 0.5, d[2] * 0.5 + (Math.random() - 0.5) * 0.4, [0.32, 0.3, 0.29, 0.35], 0.3, 2 + Math.random(), -0.1, false); particles.list[particles.list.length - 1].grow = 2; }
  },

  // ------------------------------------------------------------- le dessin (crochet draw de la Zone)
  dessiner(buf, sbuf, cam, t) {
    const D = this.D;
    if (!D) return;
    const ST = this.ST, R = this.rig;
    ST.t = t;
    // la pose selon l'état
    ST.mode = D.mode === 'vol' ? 'vol' : D.mode;
    const vol = D.mode === 'vol';
    ST.replie = lerp(ST.replie ?? 1, vol ? 0 : 1, 0.12);
    ST.appui = lerp(ST.appui ?? 1, D.mode === 'pose' ? 1 : 0, 0.12);
    ST.pattes = vol ? lerp(ST.pattes ?? 0, D.phase === 'atterrit' ? (D.pattesK || 0) : D.phase === 'envol' ? 0.5 : 0, 0.08) : 1;
    ST.cabre = lerp(ST.cabre || 0, D.phase === 'cabre' || D.phase === 'crache' ? 1 : 0, 0.1);
    ST.battement = D.battement; ST.ampl = D.ampl; ST.plane = vol ? D.plane : 0;
    ST.pique = lerp(ST.pique || 0, D.phase === 'pique' || D.phase === 'feu' ? 1 : 0, 0.06);
    D.teteY = lerp(D.teteY || 0, vol ? clamp(D.regardYv || 0, -0.5, 0.5) : D.regardY || 0, 0.04);
    D.teteP = lerp(D.teteP || 0, D.regardP || 0, 0.04);
    ST.teteY = D.teteY; ST.teteP = D.teteP;
    ST.gueule = lerp(ST.gueule || 0, this.souffle ? 1 : D.phase === 'cabre' ? 0.5 : D.mode === 'mort' ? 0.4 : 0, 0.15);
    ST.feu = !!this.souffle;
    ST.etire = lerp(ST.etire || 0, D.etirer > 0 ? 1 : 0, 0.03);
    if (D.etirer > 0) D.etirer -= 1 / 60;
    ST.souffle = D.mode === 'mort' ? 0 : 1;
    v3Poser(R, ST);
    // endormi, les yeux fermés : un œil s'entrouvre quand quelque chose l'inquiète (la phase « oeil »), les deux au réveil ;
    // mort, éteints ; la braise des naseaux rougeoie à chaque souffle quand il dort
    const ferme = D.mode === 'mort' || (D.mode === 'dort' && D.phase !== 'reveil');
    R.part('oeilL').hide = ferme && D.phase !== 'oeil'; R.part('oeilR').hide = ferme;
    const nar = D.mode === 'dort' ? 0.5 + 0.5 * Math.sin(t * 0.9) : -1;
    for (const S of ['L', 'R']) {
      const q = R.part('narine' + S);
      if (nar >= 0) { q.col = [0.5 + nar * 1.3, 0.14 + nar * 0.36, 0.04]; q.fl = FX_EMIT; q.tex = TL.ember; }
      else if (q.fl) { q.col = V3_COUL.noir; q.fl = 0; q.tex = 0; }
    }
    // les matrices (même de loin : la bouche, l'œil, les coups d'arme), puis les boîtes (de près)
    D.dist = Math.hypot(cam[0] - D.x, cam[1] - D.y, cam[2] - D.z);
    const sky = game.sky, loin = D.dist > (sky ? sky.fog[1] : 300) + 90;
    if (loin) { if (!this.tmpBuf) this.tmpBuf = new InstBuf(400); this.tmpBuf.reset(); v3Emettre(this.tmpBuf, D, 0); }
    else v3Emettre(buf, D, 0);
    D.matOk = true;
    // le jet de feu : des boîtes de flammes le long de l'axe
    const s = this.souffle;
    if (s && s.o && !loin) {
      const fl = withFlags(TL.flame, FX_EMIT);
      for (let k = 0; k < 9; k++) {
        const u = (k + Math.random() * 0.6) / 9, t2 = u * s.L, sz = 0.9 + t2 * 0.32 + Math.random() * 0.8;
        m34Root(V3_TMP.b, s.o[0] + s.d[0] * t2, s.o[1] + s.d[1] * t2 - sz / 2, s.o[2] + s.d[2] * t2, Math.random() * TAU, 1);
        buf.box(V3_TMP.b, 0, 0, 0, sz, sz, sz, k < 3 ? [1.9, 1.5, 0.8] : [1.8, 0.75 + Math.random() * 0.3, 0.2], fl);
      }
    }
    // l'ombre au sol, en vol
    if (vol && sky && D.dist < 320) v3Ombre(sbuf, D, sky.day > 0.2 ? sky.sunDir : sky.moonDir, zone.Z);
  },
  lumieres(eye) {
    const L = [], D = this.D, s = this.souffle;
    if (s && s.o) { const m = [s.o[0] + s.d[0] * s.L * 0.5, s.o[1] + s.d[1] * s.L * 0.5, s.o[2] + s.d[2] * s.L * 0.5]; L.push({ x: m[0], y: m[1], z: m[2], r: 34, c: [2.4, 1.1, 0.35], d: Math.hypot(m[0] - eye[0], m[1] - eye[1], m[2] - eye[2]) }); }
    for (const I of this.impacts) if (I.t < 1.5) { L.push({ x: I.x, y: I.y + 1.5, z: I.z, r: 14, c: [1.6, 0.7, 0.2], d: Math.hypot(I.x - eye[0], I.z - eye[2]) }); if (L.length > 4) break; }
    if (this.flammeProche) { const b = this.flammeProche; L.push({ x: b.x, y: b.y + 1, z: b.z, r: b.gros ? 12 : 7, c: [1.3, 0.62, 0.22], d: Math.hypot(b.x - eye[0], b.z - eye[2]) }); }
    // la gorge qui rougeoie, ses yeux la nuit (tout près)
    if (D && D.mode !== 'mort' && D.dist < 60 && D.matOk && (this.feuK > 0.05 || (game.sky && game.sky.night > 0.5 && D.mode !== 'dort'))) { const o = this.oeil(); L.push({ x: o[0], y: o[1], z: o[2], r: 7 + this.feuK * 10, c: [1.0 + this.feuK, 0.45, 0.12], d: D.dist }); }
    // endormi : la braise au fond des naseaux, qui rougeoit à chaque souffle (comme une forge qu'on tisonne) — on le trouve
    // dans le noir, de près
    else if (D && D.mode === 'dort' && D.dist < 70 && D.matOk) { const b = this.bouche(), k = 0.55 + 0.45 * Math.sin(game.time * 0.9); L.push({ x: b[0], y: b[1] + 0.4, z: b[2], r: 4.5 + k * 3, c: [0.95 * k, 0.32 * k, 0.07 * k], d: D.dist }); }
    return L;
  },
  fx(fx, tint, sky) {
    if (this.brule > 0) { const k = Math.min(1, this.brule); if (tint[3] < 0.32 * k) { tint[0] = 1; tint[1] = 0.42; tint[2] = 0.08; tint[3] = 0.32 * k; } }
    else if (this.ombreK > 0.02 && tint[3] < 0.22 * this.ombreK) { tint[0] = 0; tint[1] = 0; tint[2] = 0; tint[3] = 0.22 * this.ombreK; }
    if (this.feuK > 0.05 && this.D && this.D.dist < 60) fx[0] = Math.max(fx[0], 0.25 * this.feuK * (1 - this.D.dist / 60));
  },
  clocheT: -99,
  clocheAngle() { const t = game.time - this.clocheT; return t > 0 && t < 9 ? Math.sin(t * 3.2) * 0.45 * (1 - t / 9) : 0; },
};

// ---------------------------------------------------------------- l'API pour les autres (contrat : section V3)
zone.dragon = {
  abris: [],     // fn(x, y, z) → vrai : là, il ne voit pas (intérieurs, souterrains d'un autre agent)
  surFeu: [],    // fn(x, y, z, r) : le feu touche le sol là (vos créatures fuient, brûlent…)
  etat() { const D = dragonV3.D, S = dragonV3.S(); if (S.fin) return S.fin === 'tue' ? 'mort' : 'parti'; return D ? D.phase : null; },
  mode() { const D = dragonV3.D, S = dragonV3.S(); if (S.fin === 'delivre') return 'parti'; return D ? D.mode : null; },
  pos() { const D = dragonV3.D; return D ? { x: D.x, y: D.y, z: D.z } : null; },
  voit() { const D = dragonV3.D; return D && D.furtif ? D.furtif.vu || 0 : 0; },
  soupcon() { const D = dragonV3.D; return D && D.furtif ? D.furtif.soupcon || 0 : 0; },
  // 0..1 : ce qu'il menace là (son état, sa distance) — vos créatures peuvent se terrer quand il passe
  menace(x, z) {
    const D = dragonV3.D;
    if (!D || D.mode === 'mort' || D.mode === 'dort' || dragonV3.S().fin) return 0;
    if (x === undefined) { x = game.player.pos[0]; z = game.player.pos[2]; }
    const d = Math.hypot(D.x - x, D.z - z), et = D.furtif ? D.furtif.etat : 'tranquille';
    const k = et === 'alertee' ? 1 : et === 'cherche' ? 0.7 : et === 'intriguee' ? 0.5 : 0.25;
    return clamp(k * (1 - d / 400), 0, 1);
  },
  fin() { return dragonV3.S().fin || null; },
  endormi() { const D = dragonV3.D; return !!(D && D.mode === 'dort'); },
  parti() { return dragonV3.S().fin === 'delivre'; },
  mort() { return dragonV3.S().fin === 'tue'; },
  ici(x, z, r) { const D = dragonV3.D; return !!(D && D.mode !== 'mort' && !dragonV3.S().fin && Math.hypot(D.x - x, D.z - z) < r); },
  cacheDe(x, y, z) { return dragonV3.abrite(x, y, z); },
  // son ombre (ou lui, en rase-mottes) au-dessus d'un point : 0..1 — les bêtes de V2 se terrent quand il passe
  ombre(x, z) {
    const D = dragonV3.D;
    if (!D || D.mode !== 'vol' || dragonV3.S().fin) return 0;
    const g = zone.Z ? zone.Z.heightAt(D.x, D.z) : 0, h = Math.max(0, D.y - g);
    if (h > 220) return 0;
    let sx = D.x, sz = D.z;
    const L = game.sky && game.sky.day > 0.2 ? game.sky.sunDir : null;
    if (L && L[1] > 0.12) { sx -= L[0] / L[1] * h; sz -= L[2] / L[1] * h; }
    return clamp(1 - Math.min(Math.hypot(sx - x, sz - z), Math.hypot(D.x - x, D.z - z)) / 60, 0, 1) * clamp(1.4 - h / 160, 0, 1);
  },
  // le dernier cri (cri lointain, rugissement) : { t (game.time), x, y, z, fort (rugissement d'alerte) } ou null
  cri: null,
  // V4 : le Guet du château (le fanal du donjon) est rallumé : de jour, il vient voir la flamme ; il tourne au-dessus du
  // château un moment, bas, puis reprend sa ronde (un leurre, qui coûte cher à qui se tient sur le donjon)
  guet(allume, pos) {
    const D = dragonV3.D, S = dragonV3.S();
    S.guet = allume && pos ? { x: pos.x, y: pos.y, z: pos.z, h: farm.s.hours } : null;
    if (!allume || !pos || !D || D.mode === 'dort' || D.mode === 'mort' || S.fin || dragonV3.enAttaque()) return false;
    if (D.mode === 'pose') { dragonV3.envol('ronde'); }
    D.cible = { id: 'guet', x: pos.x, z: pos.z, r: 90, porte: true };
    if (D.phase !== 'envol') D.phase = 'ronde';
    return true;
  },
  // un leurre : il vient voir (force 0..1)
  appeler(x, z, force) {
    const D = dragonV3.D;
    if (!D || !D.furtif || D.mode === 'mort' || D.mode === 'dort' || dragonV3.enAttaque()) return false;
    const F = D.furtif;
    F.dernier = { x, y: zone.Z.heightAt(x, z), z, t: game.time, vu: false };
    F.soupcon = Math.max(F.soupcon, 0.5 * (force ?? 1));   // (il passe « intrigué » à l'image suivante, et vient voir)
    return true;
  },
};

// ---------------------------------------------------------------- son corps (on ne le traverse pas : dragonV3.repousser)
const V3_CORPS = [
  ['bassin', [0, 0, -2.5], [0, 0, 2.0], 2.2], ['ventre', [0, 0, 0], [0, 0, 4.4], 2.3], ['poitrine', [0, 0.2, 0], [0, 0.2, 4.6], 2.5],
  ['cou1', [0, 0, 0], [0, 0, 1.4], 1.4], ['cou2', [0, 0, 0], [0, 0, 1.4], 1.3],
  ['cuisseL', [0, 0, 0], [0, -3.6, 0.4], 1.0], ['cuisseR', [0, 0, 0], [0, -3.6, 0.4], 1.0],
  ['jambeL', [0, 0, 0], [0, -3.5, 0], 0.7], ['jambeR', [0, 0, 0], [0, -3.5, 0], 0.7],
  ['tarseL', [0, 0, 0], [0, -2.1, 0], 0.5], ['tarseR', [0, 0, 0], [0, -2.1, 0], 0.5],
  ['humerusL', [0, 0, 0], [5.2, 0, 0], 0.8], ['radiusL', [0, 0, 0], [7.2, 0, 0], 0.6], ['humerusR', [0, 0, 0], [-5.2, 0, 0], 0.8], ['radiusR', [0, 0, 0], [-7.2, 0, 0], 0.6],
];
for (let i = 1; i <= 9; i++) { const k = (i - 1) / (V3_QUEUE - 1), kk = Math.pow(k, 0.85); V3_CORPS.push(['queue' + i, [0, 0, 0], [0, 0, -lerp(1.75, 1.2, k)], Math.max(0.35, lerp(2.9, 0.42, kk) / 2)]); }

// ---------------------------------------------------------------- les armes : on peut le toucher (presque toujours en vain)
// des capsules le long du corps ; la plaie (sous l'aile gauche) d'abord
const V3_CAPSULES = [
  ['plaie', [0, 0, 0], [0, 0, 0], 1.25],
  ['bassin', [0, 0, -2.5], [0, 0, 2.0], 2.3], ['ventre', [0, 0, 0], [0, 0, 4.4], 2.5], ['poitrine', [0, 0.2, 0], [0, 0.2, 4.6], 2.7],
  ['cou1', [0, 0, 0], [0, 0, 1.4], 1.6], ['cou4', [0, 0, 0], [0, 0, 1.4], 1.3], ['cou7', [0, 0, 0], [0, 0, 1.4], 1.0], ['tete', [0, 0.3, -0.2], [0, 0.1, 3.4], 1.2],
  ['humerusL', [0, 0, 0], [5.2, 0, 0], 0.9], ['radiusL', [0, 0, 0], [7.2, 0, 0], 0.7], ['humerusR', [0, 0, 0], [-5.2, 0, 0], 0.9], ['radiusR', [0, 0, 0], [-7.2, 0, 0], 0.7],
  ['queue1', [0, 0, 0], [0, 0, -1.6], 1.4], ['queue4', [0, 0, 0], [0, 0, -1.6], 1.1], ['queue8', [0, 0, 0], [0, 0, -1.4], 0.7],
  ['cuisseL', [0, 0, 0], [0, -3.6, 0.4], 1.0], ['cuisseR', [0, 0, 0], [0, -3.6, 0.4], 1.0],
];
function v3RayCapsule(o, d, A, B, r) {
  // distance minimale entre le rayon et le segment, approchée par échantillonnage du segment (court : quelques mètres)
  let best = null;
  for (let k = 0; k <= 6; k++) {
    const u = k / 6, c = [A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u, A[2] + (B[2] - A[2]) * u];
    const v = [c[0] - o[0], c[1] - o[1], c[2] - o[2]], t = v[0] * d[0] + v[1] * d[1] + v[2] * d[2];
    if (t < 0) continue;
    const q = Math.hypot(v[0] - d[0] * t, v[1] - d[1] * t, v[2] - d[2] * t);
    if (q < r) { const tt = t - Math.sqrt(r * r - q * q); if (!best || tt < best) best = tt; }
  }
  return best;
}
zone.armes.push({
  raycast(o, d, max) {
    const D = dragonV3.D;
    if (!D || !D.matOk || dragonV3.S().fin === 'delivre') return null;
    if (Math.hypot(D.x - o[0], D.y - o[1], D.z - o[2]) > max + 40) return null;
    const R = dragonV3.rig;
    let best = null;
    for (const [nm, a, b, r] of V3_CAPSULES) {
      const q = R.part(nm);
      if (!q || !q.W) continue;
      const A = v3Pt(q.W, a[0], a[1], a[2]), B = v3Pt(q.W, b[0], b[1], b[2]);
      const t = v3RayCapsule(o, d, A, B, r);
      if (t !== null && t < max && (!best || t < best.t - (nm === 'plaie' ? 0.6 : 0))) best = { t, s: { v3: true, part: nm }, p: [o[0] + d[0] * t, o[1] + d[1] * t, o[2] + d[2] * t] };
    }
    return best;
  },
  frapper(s, dmg, from) { return dragonV3.frappe(s, dmg, from); },
});

// ---------------------------------------------------------------- crochets de la Zone
zone.sur('update', (dt) => { try { dragonV3.update(dt); } catch (e) { console.error('V3', e); } });
zone.sur('draw', (buf, sbuf, cam, t) => { try { dragonV3.dessiner(buf, sbuf, cam, t); } catch (e) { console.error('V3 dessin', e); } });
zone.sur('lights', (eye) => { try { return dragonV3.lumieres(eye); } catch (e) { return []; } });
zone.sur('fx', (fx, tint, sky) => dragonV3.fx(fx, tint, sky));
zone.sur('entrer', () => { dragonV3.D = null; dragonV3.placer('entrer'); });
zone.sur('sortir', () => { if (dragonV3.D) furtif.oublier(dragonV3.D); dragonV3.D = null; dragonV3.souffle = null; dragonV3.flammes.clear(); dragonV3.impacts = []; dragonV3.brule = 0; dragonV3.ombreK = 0; });
zone.sur('repos', () => { dragonV3.placer('repos'); });
// (un coup de fusil, dans la Zone : V1 en fait un bruit de 90 m, « coup de feu » ; le Ver l'entend de très loin — voir ouie)
// l'œil (V1) montre aussi le Ver, de loin (au-delà des 90 m de l'œil commun)
HOOKS.load.push(() => {
  if (dragonV3.oeilBranche || typeof oeilV1 === 'undefined') return;
  dragonV3.oeilBranche = true;
  const _m = oeilV1.montrer.bind(oeilV1);
  oeilV1.montrer = function (k, etat) {
    const D = dragonV3.D, F = D && D.furtif;
    if (zone.dedans && F && D.mode !== 'mort' && !dragonV3.S().fin) {
      const kd = F.etat === 'alertee' ? 2 : F.etat === 'cherche' ? 1.5 : F.etat === 'intriguee' ? Math.min(1, F.soupcon) : 0;
      if (kd > k) return _m(kd, F.etat);
    }
    return _m(k, etat);
  };
});
DYN_PROPS.add('v3_cloche');
