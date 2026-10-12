// ============================================================================
//  LES CASCADES, LES GROTTES ET LES COINS DE PARADIS (agent P18) — 6. LES SCÈNES
//  Une courte scène la première fois qu'on trouve une chute, qu'on passe
//  derrière le rideau de la Grande Chute, qu'on entre dans trois grandes salles
//  (la Cathédrale, le Lac aux Lueurs, la Salle des Cristaux) et dans chaque coin
//  de paradis. Le moteur des scènes de l'histoire (h17Cine) : on les passe en
//  maintenant Espace ou Échap ; une seule fois chacune ; elles rejoignent les
//  Souvenirs du carnet (et s'y revoient, d'où que l'on soit : la scène se joue
//  sur place, le personnage est rendu où il était).
//  Jouées au premier moment tranquille (pas pendant un danger, un panneau, un sommeil).
// ============================================================================
const P18_SCENES_TITRES = {
  grande: 'La Grande Chute', saules: 'La Cascade des Saules', cascatelles: 'Les Cascatelles', loup: 'Le Saut du Loup', voile: 'Le Voile de la Mariée',
  bouche: 'Derrière l’eau', g_cathedrale: 'La Cathédrale', g_lac: 'Le Lac aux Lueurs', g_cristaux: 'La Salle des Cristaux',
  papillons: 'Le Pré aux Papillons', source: 'La Source Tiède', saule: 'L’Îlot du Saule', fees: 'Le Bassin des Fées', belvedere: 'Le Belvédère', verger: 'Le Verger sauvage',
};
const P18_SCENES_MUSIQUE = { grande: 'eau_reflets', bouche: 'dessous_eaux', g_cathedrale: 'dessous_cristaux', g_lac: 'dessous_eaux', g_cristaux: 'dessous_cristaux', papillons: 'paradis_pre', source: 'paradis_eau', saule: 'paradis_eau', fees: 'paradis_pre', belvedere: 'paradis_pre', verger: 'paradis_pre' };

const p18Scenes = {
  lumiere: false,
  // ------------------------------------------------------------ outils
  sol(x, z) { const w = game.world; return Math.max(w.heightAt(x, z), w.waterLevel); },
  // une vue dehors vers T, à d mètres, depuis la direction a (l'angle tourne jusqu'à trouver une vue libre)
  dehors(T, d, h, a0) {
    const w = game.world;
    for (let k = 0; k < 16; k++) {
      const a = a0 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * TAU / 24;
      const x = T[0] + Math.cos(a) * d, z = T[2] + Math.sin(a) * d;
      if (!w.inside(x, z, 6)) continue;
      const P = [x, Math.max(this.sol(x, z) + h, T[1] - 2), z];
      let ok = true;
      for (let i = 1; i < 12 && ok; i++) { const u = i / 12, xx = lerp(P[0], T[0], u), yy = lerp(P[1], T[1], u), zz = lerp(P[2], T[2], u); if (w.heightAt(xx, zz) > yy + 0.4) ok = false; }
      if (ok) return P;
    }
    return [T[0] + Math.cos(a0) * d, T[1] + h + 12, T[2] + Math.sin(a0) * d];
  },
  // un point ouvert d'une salle des grottes (à hauteur h au-dessus du sol, sous la voûte)
  dessous(x, z, h) { const S = souterrain, f = S.floorAt(x, z), v = S.vaultAt(x, z); return [x, Math.min(f + h, (f + v) / 2), z]; },
  carte(k) { return { titre: P18_SCENES_TITRES[k] || '' }; },
  noir(dur, k, P) { return { dur, de: P || h17.joueur(), fondu: 'noir', carte: k ? this.carte(k) : null }; },
  // la scène se joue sur place : au besoin, le personnage y est posé le temps de la scène (puis rendu où il était)
  poser(pos) { return () => { const p = game.player; if (!p || !pos) return; p.pos = pos.slice(); p.vel = [0, 0, 0]; }; },

  // ------------------------------------------------------------ une chute : de loin en montant le long de l'eau, puis au pied
  chute(k) {
    const D = p18Jeu.chute(k);
    if (!D) return null;
    const B = D.bassin, H = D.y0 - D.y1, fx = Math.cos(D.a), fz = Math.sin(D.a);
    let pied = [D.x + fx * 2, D.y1 + 1, D.z + fz * 2], milieu = [D.x, D.y1 + H * 0.55, D.z];
    const C = P18_CHUTES.find((q) => q.k === k), WL = game.world.waterLevel;
    if (C && C.gradins) { const G = C.gradins, m = G[Math.floor(G.length / 2)], b = G[G.length - 1]; milieu = [m[0], WL + m[2], m[1]]; pied = [b[0], WL + b[2], b[1]]; }
    const a0 = D.a; // on regarde la chute de l'aval
    const loin = this.dehors(milieu, Math.max(48, H * 1.9), 6, a0), pres = this.dehors(pied, Math.max(16, (B ? B.r : 8) + 8), 2.2, a0 + 0.5);
    const haut = [D.x - fx * 4, D.y0 + 2, D.z - fz * 4];
    const ici = [pres[0], this.sol(pres[0], pres[2]) + 0.1, pres[2]];
    return {
      lieu: ici,
      plans: [
        this.noir(1.6, k),
        { dur: 7.5, chemin: [{ pos: loin, look: milieu }, { pos: h17.vers(loin, milieu, 0.3), look: h17.haut(milieu, H * 0.1) }], ease: 'sort' },
        { dur: 6, de: { pos: pres, look: haut }, a: { pos: h17.vers(pres, pied, 0.25), look: h17.haut(pied, H * 0.3) } },
        { dur: 1.4, de: { pos: h17.vers(pres, pied, 0.25), look: pied }, fondu: 'noir' },
      ],
    };
  },
  // derrière le rideau de la Grande Chute : le passage, la bouche noire
  bouche() {
    const D = p18Jeu.chute('grande'), C = P18_CHUTES.find((q) => q.k === 'grande');
    if (!D || !D.bouche) return null;
    const [bx, by, bz] = D.bouche, [x0, x1, z0, z1] = C.corniche;
    const A = [(x0 + x1) / 2 + 0.8, by + 1.7, z1 - 1], Bq = [(x0 + x1) / 2 + 0.6, by + 1.6, bz + 3.5], bouche = [bx, by + 1.6, bz], rideau = [D.x + 1, by + 6, bz];
    return {
      lieu: [bx + 2.2, by + 0.05, bz],
      plans: [
        this.noir(1.4, 'bouche'),
        { dur: 7, de: { pos: A, look: h17.haut(rideau, -2) }, a: { pos: Bq, look: bouche } },
        { dur: 5, de: { pos: Bq, look: bouche }, a: { pos: [bx + 2.4, by + 1.6, bz], look: h17.haut(bouche, -0.3) } },
        { dur: 1.4, de: { pos: [bx + 2.4, by + 1.6, bz], look: bouche }, fondu: 'noir' },
      ],
    };
  },
  // une grande salle des grottes
  salle(k) {
    const Q = P18_GROTTE.salles.find((q) => q[0] === k) || P18_GROTTE.lacs.find((q) => q[0] === k);
    if (!Q) return null;
    const [, cx, cz, rx, rz] = Q, r = Math.min(rx, rz) * 0.55;
    const pts = [0, 1, 2, 3].map((i) => { const a = 0.4 + i * 0.5, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r; return this.dessous(x, z, k === 'lac' ? 1.6 : 3 + i); });
    const centre = k === 'lac' ? [cx, SOUT_WL + 1, cz] : this.dessous(cx, cz, k === 'cathedrale' ? 14 : 4);
    const ici = [pts[0][0], souterrain.floorAt(pts[0][0], pts[0][2]) + 0.05, pts[0][2]];
    // (pour le lac : sur la rive la plus proche du premier point)
    return {
      lieu: ici, sous: true,
      plans: [
        this.noir(1.4, 'g_' + k),
        { dur: 9, chemin: pts.map((P) => ({ pos: P, look: centre })), ease: 'lin' },
        { dur: 1.4, de: { pos: pts[3], look: centre }, fondu: 'noir' },
      ],
    };
  },
  // un coin de paradis : on en fait le tour, doucement
  coin(k) {
    const Q = p18Jeu.coin(k);
    if (!Q) return null;
    const c = [Q.x, Q.y + 1.2, Q.z], r = Math.max(9, Q.r * 0.9), a0 = hash2i(Q.x | 0, Q.z | 0, 5) * TAU;
    const P0 = this.dehors(c, r, 3.2, a0), a1 = Math.atan2(P0[2] - c[2], P0[0] - c[0]);
    const look = k === 'belvedere' ? [Q.x + 60, Q.y - 25, Q.z + 260] : c;
    return {
      lieu: [Q.x, Q.y + 0.05, Q.z],
      plans: [
        this.noir(1.6, k),
        { dur: 10, orbite: { c, r, h: 2.6, a0: Math.PI / 2 - a1, a1: Math.PI / 2 - a1 + 0.9, look } },
        { dur: 1.4, de: { pos: [c[0] + Math.sin(Math.PI / 2 - a1 + 0.9) * r, c[1] + 2.6, c[2] + Math.cos(Math.PI / 2 - a1 + 0.9) * r], look }, fondu: 'noir' },
      ],
    };
  },

  // ------------------------------------------------------------ jouer
  construire(k) {
    if (!game.world || !game.world.p18) return null;
    if (P18_CHUTES.some((c) => c.k === k)) return this.chute(k);
    if (k === 'bouche') return this.bouche();
    if (k.startsWith('g_')) return this.salle(k.slice(2));
    if (P18_COINS.some((c) => c.k === k)) return this.coin(k);
    return null;
  },
  jouer(k, rejeu) {
    let sc = null;
    try { sc = this.construire(k); } catch (e) { console.error('P18 scène ' + k, e); sc = null; }
    const S = p18Jeu.S();
    if (!rejeu) S.cines[k] = farm.s.day;
    S.aVoir = S.aVoir.filter((q) => q !== k);
    try { histoire.souvenir(k); } catch (e) { /* rien */ }
    if (!sc) return Promise.resolve(false);
    // la scène se joue là où elle se passe : le personnage y est posé s'il est ailleurs (dessous / dehors)
    const ailleurs = !!sc.sous !== !!p18Jeu.dansGrotte();
    if (ailleurs && sc.lieu) { const d0 = sc.plans[0]; const f = d0.debut; d0.debut = () => { this.poser(sc.lieu)(); if (f) f(); }; }
    this.lumiere = !!sc.sous;
    const mus = P18_SCENES_MUSIQUE[k];
    return h17Cine.jouer(sc.plans, { cle: 'p18_' + k, musique: mus, garderMusique: /^paradis/.test(mus || ''), apres: () => { this.lumiere = false; } });
  },
  // au premier moment tranquille
  peutEtre(S) {
    if (this._t && performance.now() - this._t < 1500) return;
    this._t = performance.now();
    const k = S.aVoir[0];
    if (!k) return;
    if (S.cines[k]) { S.aVoir.shift(); return; }
    if (typeof histoire === 'undefined' || !histoire.peutJouer(k)) return;
    if (game.player.riding || (play && play.hurtFlash > 0.05)) return;
    // (une scène de l'histoire attend son tour : elle passe d'abord)
    const H = histoire.S && histoire.S();
    if (H && (H.aVoir || (H.file && H.file.length))) return;
    this.jouer(k, false);
  },
};

// ---------------------------------------------------------------- les Souvenirs (le carnet) : nos scènes s'y ajoutent
for (const k in P18_SCENES_TITRES) {
  H17_CINES[k] = H17_CINES[k] || { titre: P18_SCENES_TITRES[k] };
  if (!H17_ORDRE_CINES.includes(k)) H17_ORDRE_CINES.push(k);
  H17_SCENES[k] = () => { try { return p18Scenes.construire(k); } catch (e) { console.error(e); return null; } };
}
const P18_SCENES = H17_SCENES; // (les clés à jouer : voir p18Jeu.retenir)
// revoir depuis les Souvenirs : la scène se joue sur place (dessous ou dehors), le personnage est rendu où il était
{
  const _rj = histoire.rejouer.bind(histoire);
  histoire.rejouer = function (k) {
    if (!(k in P18_SCENES_TITRES)) return _rj(k);
    if (cine.on) return Promise.resolve(false);
    ui.close(true);
    return p18Scenes.jouer(k, true);
  };
}
// pendant une scène des grottes : une lueur douce près de la caméra (le noir d'en bas ne montrerait rien)
HOOKS.lights.push((eye) => (p18Scenes.lumiere && cine.on ? [{ x: eye[0], y: eye[1] + 0.5, z: eye[2], r: 34, c: [0.5, 0.46, 0.4], d: 0 }] : []));
