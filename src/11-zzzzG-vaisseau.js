// ============================================================================
//  LA CITÉ DES MAISONS-D'ÉTOILE (agent G, douzième vague) — le monde 'vaisseau'
//  Un monde « à part » (11-zzz70-mondes.js) : la cité est bâtie très bas sous
//  la lisière est quand on y entre (par la pierre ronde, 11-zzzzG-portail.js),
//  défaite quand on en sort. Le temps de la vallée y est suspendu.
//  Plan (repère local, x à droite, z vers l'avant, y en haut ; niveaux 0, -16, +12, +24) :
//   - le Seuil (on arrive, on repart) ; un couloir à hublots ; la Nef (une salle
//     immense, ses arbres morts, sa fontaine, les huit maisons de l'équipage) ;
//     les Jardins (serres) ; par l'escalier de service, l'aile haute : la
//     galerie, les Archives, l'Atelier des corps, la Chapelle, les Berceaux ; par
//     l'ascenseur de la galerie, l'Observatoire ; sous la Nef, par l'ascenseur
//     ou l'échelle, la Machinerie (le Cœur) et la Brèche.
//  Les machines (le Cœur, les lampes, les portes, les ascenseurs, la pesanteur,
//  les serres, les hologrammes, la fontaine, le rideau de la Brèche, l'Atelier
//  des corps) : une « chose » qu'on actionne avec E ; leur état : farm.s.vaisseau.m.
//  UN SEUL VOYAGE : on revient par le seuil (vgCite.revenir) ; mourir là-haut
//  y ramène aussi (la veilleuse dépense la dernière lumière du seuil) ; dans les
//  deux cas, les deux portails s'éteignent pour toujours.
//  Essais : vgCite.essai() (y aller tout de suite), vgCite.aller('nef'), vgCite.revenir().
// ============================================================================
MONDES_FOND.vaisseau = { x: 2860, z: 1500, y: -900 };

// ---------------------------------------------------------------- les lieux de la cité (rectangles locaux) : la voix y parle la première fois
const VG_ZONES = [
  // clé, x0, x1, z0, z1, y0, y1
  ['seuil', -10, 10, -18, 4, -1, 9],
  ['couloir', -3, 3, 4, 20, -1, 5],
  ['nef', -30, 30, 20, 100, -1, 26],
  ['jardins', -64, -30, 40, 72, -1, 10],
  ['galerie', -6, 6, 100, 134, 11, 18],
  ['archives', -30, -6, 102, 134, 11, 18],
  ['atelier', 6, 30, 102, 118, 11, 18],
  ['chapelle', 6, 30, 118, 134, 11, 18],
  ['berceaux', 30, 58, 100, 134, 11, 18],
  ['observatoire', -12, 12, 112, 134, 23, 33],
  ['machinerie', -24, 24, 22, 58, -17, -1],
  ['breche', 24, 48, 30, 50, -17, -1],
];
const VG_ZONES_NOMS = { seuil: 'le Seuil', couloir: 'le couloir des hublots', nef: 'la Nef', jardins: 'les Jardins', galerie: 'la galerie haute', archives: 'les Archives', atelier: 'l’Atelier des corps', chapelle: 'la Chapelle', berceaux: 'les Berceaux', observatoire: 'l’Observatoire', machinerie: 'la Machinerie', breche: 'la Brèche' };

// ---------------------------------------------------------------- la cité
const vgCite = {
  // ------------------------------------------------------------- repères
  f() { const F = MONDES_FOND.vaisseau; return { x: F.x, y: F.y, z: F.z, r: 0 }; },
  at(lx, lz) { return mondes.toWorld(this.f(), lx, lz); },
  local(p) { const F = MONDES_FOND.vaisseau; return [p[0] - F.x, p[1] - F.y, p[2] - F.z]; },
  zone(p) {
    const [x, y, z] = this.local(p || game.player.pos);
    for (const Z of VG_ZONES) if (x >= Z[1] && x <= Z[2] && z >= Z[3] && z <= Z[4] && y >= Z[5] && y <= Z[6]) return Z[0];
    return null;
  },
  // le Cœur marche-t-il ?
  courant() { return !!VG.S().m.coeur; },

  // ------------------------------------------------------------- construction : blocs
  B(lx, ly, lz, sx, sy, sz, m, o) { return mondes.bloc(this.f(), lx, ly, lz, sx, sy, sz, m, 0, 0, o); },
  // une boîte donnée par ses bornes (x0..x1, y0..y1, z0..z1)
  boite(x0, x1, y0, y1, z0, z1, m, o) { return this.B((x0 + x1) / 2, y0, (z0 + z1) / 2, x1 - x0, y1 - y0, z1 - z0, m, o); },
  // un mur droit, le long de x (axe 'x', à z = c) ou de z (axe 'z', à x = c), de a à b, du sol y0 sur H, percé
  // d'ouvertures [{ a, b, bas, haut, vitre }] (bas/haut : relatifs à y0 ; vitre : une collision invisible)
  mur(axe, c, a, b, y0, H, ouv, m, ep) {
    ep = ep || 0.4; m = m === undefined ? M_VG_COQUE : m;
    const seg = (u0, u1, v0, v1, mm, o) => {
      if (u1 - u0 < 0.02 || v1 - v0 < 0.02) return;
      if (axe === 'x') this.boite(u0, u1, y0 + v0, y0 + v1, c - ep / 2, c + ep / 2, mm, o);
      else this.boite(c - ep / 2, c + ep / 2, y0 + v0, y0 + v1, u0, u1, mm, o);
    };
    const O = (ouv || []).slice().sort((p, q) => p.a - q.a);
    let u = a;
    for (const o of O) {
      seg(u, o.a, 0, H, m);
      seg(o.a, o.b, 0, o.bas || 0, m);
      seg(o.a, o.b, o.haut, H, m);
      if (o.vitre) seg(o.a, o.b, o.bas || 0, o.haut, 0, { hidden: true });
      u = o.b;
    }
    seg(u, b, 0, H, m);
  },
  // une salle : sol, murs (ouvertures par côté : n (z1), s (z0), e (x1), o (x0)), plafond (o.plafond : false pour rien)
  salle(x0, x1, z0, z1, y0, H, o) {
    o = o || {};
    if (o.sol !== false) { if (o.trousSol) this.solTroue(x0, x1, z0, z1, y0, o.trousSol, o.sol || M_VG_DALLE); else this.boite(x0, x1, y0 - 0.5, y0, z0, z1, o.sol || M_VG_DALLE); }
    const ouv = o.ouv || {};
    if (!o.sans || !o.sans.includes('s')) this.mur('x', z0, x0 - 0.2, x1 + 0.2, y0, H, ouv.s, o.mur);
    if (!o.sans || !o.sans.includes('n')) this.mur('x', z1, x0 - 0.2, x1 + 0.2, y0, H, ouv.n, o.mur);
    if (!o.sans || !o.sans.includes('o')) this.mur('z', x0, z0 + 0.2, z1 - 0.2, y0, H, ouv.o, o.mur);
    if (!o.sans || !o.sans.includes('e')) this.mur('z', x1, z0 + 0.2, z1 - 0.2, y0, H, ouv.e, o.mur);
    if (o.plafond !== false) { if (o.trousPlafond) this.solTroue(x0 - 0.2, x1 + 0.2, z0 - 0.2, z1 + 0.2, y0 + H + 0.4, o.trousPlafond, o.plafond || M_VG_COQUE, 0.4); else this.boite(x0 - 0.2, x1 + 0.2, y0 + H, y0 + H + 0.4, z0 - 0.2, z1 + 0.2, o.plafond || M_VG_COQUE); }
    // la frise de nacre, à hauteur d'épaule, tout autour (le style des Aëlim)
    // (seulement sur les murs de la salle, et interrompue à chaque porte et à chaque baie : on passe dessous, pas au travers)
    if (o.frise !== false) {
      const fh = o.friseY || 1.3, fy = y0 + fh, e = 0.12, hb = 0.22, sans = o.sans || [];
      const bande = (cote, a, b, pose) => {
        if (sans.includes(cote)) return;
        const O = (ouv[cote] || []).filter((q) => (q.bas || 0) < fh + hb && q.haut > fh).sort((p, q) => p.a - q.a);
        let u = a;
        const segs = [];
        for (const q of O) { if (q.a > u) segs.push([u, q.a]); u = Math.max(u, q.b); }
        if (b > u) segs.push([u, b]);
        for (const [s0, s1] of segs) if (s1 - s0 > 0.05) pose(s0, s1);
      };
      bande('s', x0 + 0.2, x1 - 0.2, (a, b) => this.boite(a, b, fy, fy + hb, z0 + 0.2, z0 + 0.2 + e, M_VG_NACRE));
      bande('n', x0 + 0.2, x1 - 0.2, (a, b) => this.boite(a, b, fy, fy + hb, z1 - 0.2 - e, z1 - 0.2, M_VG_NACRE));
      bande('o', z0 + 0.3, z1 - 0.3, (a, b) => this.boite(x0 + 0.2, x0 + 0.2 + e, fy, fy + hb, a, b, M_VG_NACRE));
      bande('e', z0 + 0.3, z1 - 0.3, (a, b) => this.boite(x1 - 0.2 - e, x1 - 0.2, fy, fy + hb, a, b, M_VG_NACRE));
    }
  },
  // une porte (ouverture d'au moins 2,05 m sous le linteau) : { a, b, bas: 0, haut }
  P(centre, larg, haut) { return { a: centre - larg / 2, b: centre + larg / 2, bas: 0, haut: haut || 2.8 }; },
  // une baie vitrée (on voit les étoiles ; une collision invisible empêche de sortir)
  V(centre, larg, bas, haut) { return { a: centre - larg / 2, b: centre + larg / 2, bas, haut, vitre: true }; },

  // ------------------------------------------------------------- construction : le plan
  batir() {
    const P = (c, l, h) => this.P(c, l, h), V = (c, l, b, h) => this.V(c, l, b, h);
    // ============ le Seuil (on arrive ici) ============
    this.salle(-10, 10, -18, 4, 0, 8, { ouv: { n: [P(0, 3.2, 3.2)], e: [V(-8, 4, 1.4, 5.6), V(0, 4, 1.4, 5.6)], o: [V(-8, 4, 1.4, 5.6), V(0, 4, 1.4, 5.6)] } });
    this.boite(-3.5, 3.5, 0, 0.3, -17.6, -12.5, M_VG_NACRE); // l'estrade du seuil
    // ============ le couloir des hublots ============
    this.salle(-2.6, 2.6, 4, 20, 0, 4, { sans: ['s', 'n'], ouv: { e: [V(8, 1.6, 1.0, 2.8), V(12, 1.6, 1.0, 2.8), V(16, 1.6, 1.0, 2.8)], o: [V(8, 1.6, 1.0, 2.8), V(12, 1.6, 1.0, 2.8), V(16, 1.6, 1.0, 2.8)] } });
    // ============ la Nef ============
    {
      const H = 26, x0 = -30, x1 = 30, z0 = 20, z1 = 100;
      // le sol, percé du puits de l'ascenseur de la Machinerie (en 14, 26)
      this.solTroue(x0, x1, z0, z1, 0, [[14, 26, 1.8]], M_VG_DALLE);
      this.boite(-2, 2, -0.02, 0.01, z0 + 1, z1 - 1, M_VG_NACRE); // l'allée de nacre
      const baies = (de, a) => { const L = []; for (let z = de; z < a; z += 14) L.push(V(z, 8, 7, 21)); return L; };
      this.mur('x', z0, x0 - 0.2, x1 + 0.2, 0, H, [P(0, 5.2, 4.2)]);
      this.mur('x', z1, x0 - 0.2, x1 + 0.2, 0, H, [{ a: 24.5, b: 28.5, bas: 12, haut: 15.2 }]);
      this.mur('z', x0, z0 + 0.2, z1 - 0.2, 0, H, [P(51, 3.2, 3.2)].concat(baies(30, 96)));
      this.mur('z', x1, z0 + 0.2, z1 - 0.2, 0, H, baies(30, 96));
      // la voûte : un cadre tout autour ; au milieu, le ciel (aucune verrière ne l'arrête plus)
      this.boite(x0 - 0.2, x1 + 0.2, H, H + 0.6, z0 - 0.2, z0 + 8, M_VG_COQUE);
      this.boite(x0 - 0.2, x1 + 0.2, H, H + 0.6, z1 - 8, z1 + 0.2, M_VG_COQUE);
      this.boite(x0 - 0.2, x0 + 9, H, H + 0.6, z0 + 8, z1 - 8, M_VG_COQUE);
      this.boite(x1 - 9, x1 + 0.2, H, H + 0.6, z0 + 8, z1 - 8, M_VG_COQUE);
      for (let z = z0 + 16; z < z1 - 8; z += 16) this.boite(x0 + 9, x1 - 9, H, H + 0.5, z - 0.4, z + 0.4, M_VG_NACRE); // les nervures
      // la frise et les piliers de nacre le long des murs
      for (let z = z0 + 7; z < z1; z += 14) for (const x of [x0 + 0.5, x1 - 0.5]) this.boite(x - 0.5, x + 0.5, 0, H, z - 0.5, z + 0.5, M_VG_NACRE);
      // l'escalier de service, le long du mur est, jusqu'à la galerie haute (y = 12)
      this.B(26.5, 0, 82, 4, 12, 24, M_VG_DALLE).sh = 2;
      this.boite(24.5, 28.5, 0, 12, 94, 99.8, M_VG_COQUE);
      this.boite(24.4, 24.6, 12, 13.1, 70, 99.6, M_VG_NACRE); // la rampe (garde-corps)
      // les huit maisons de l'équipage, quatre de chaque côté, la porte vers l'allée
      for (const [i, z] of [30, 44, 58, 72].entries()) { this.maison(-29.6, -20.6, z - 4, z + 4, 'e', 'o' + i); if (z !== 72) this.maison(20.6, 29.6, z - 4, z + 4, 'o', 'e' + i); }
    }
    // ============ les Jardins (serres) ============
    this.salle(-64, -30, 40, 72, 0, 9, { sans: ['e'], ouv: { n: [V(-56, 6, 2.5, 7.5), V(-40, 6, 2.5, 7.5)], s: [V(-56, 6, 2.5, 7.5), V(-40, 6, 2.5, 7.5)], o: [V(48, 8, 2.5, 7.5), V(64, 8, 2.5, 7.5)] }, plafond: M_VG_LUEUR });
    // ============ l'aile haute (y = 12) ============
    {
      const y = 12;
      this.salle(-6, 6, 100, 134, y, 5, { sans: ['s'], ouv: { o: [P(110, 2.8), P(126, 2.8)], e: [P(110, 2.8), P(126, 2.8)], n: [V(0, 6, 1.0, 4.2)] }, trousPlafond: [[3, 129, 1.8]] });
      // le puits de l'ascenseur, entre le plafond de la galerie et le sol de l'Observatoire
      this.boite(1.0, 5.0, y + 5.4, 23.5, 126.8, 127.2, M_VG_COQUE); this.boite(1.0, 5.0, y + 5.4, 23.5, 130.8, 131.2, M_VG_COQUE);
      this.boite(0.8, 1.2, y + 5.4, 23.5, 126.8, 131.2, M_VG_COQUE); this.boite(4.8, 5.2, y + 5.4, 23.5, 126.8, 131.2, M_VG_COQUE);
      this.boite(-6.2, 6.2, y, y + 5, 99.8, 100.2, M_VG_COQUE);
      // le palier de l'escalier, et le couloir qui y mène (de x = 6 à x = 30, en z 100..103)
      this.salle(6, 30, 99.8, 104, y, 3.6, { sans: ['o', 'n', 'e'], ouv: { s: [{ a: 24.5, b: 28.5, bas: 0, haut: 3.2 }] }, frise: false });
      this.salle(-30, -6, 102, 134, y, 6, { sans: ['e'], ouv: { o: [V(112, 6, 1.4, 4.6), V(124, 6, 1.4, 4.6)] } });
      this.salle(6, 30, 104, 118, y, 6, { sans: ['o'], ouv: { s: [P(16, 2.6)], e: [P(111, 2.8)] } });
      this.salle(6, 30, 118, 134, y, 7, { sans: ['o', 's'], ouv: { n: [V(18, 8, 2.0, 6.2)] } });
      this.salle(30, 58, 100, 134, y, 6, { sans: ['o'], ouv: { e: [V(110, 5, 1.6, 4.6), V(124, 5, 1.6, 4.6)] } });
      this.mur('z', 30, 99.8, 104, y, 6, []);
      // le puits de l'ascenseur vers l'Observatoire (au bout de la galerie : x 0, z 131)
    }
    // ============ l'Observatoire (y = 24) ============
    this.salle(-12, 12, 112, 134, 24, 9, { ouv: { n: [V(0, 20, 1.2, 8.2)], e: [V(123, 8, 2.5, 7)], o: [V(123, 8, 2.5, 7)] }, plafond: M_VG_COQUE, trousSol: [[3, 129, 1.8]] });
    // ============ sous la Nef : la Machinerie et la Brèche (y = −16) ============
    this.salle(-24, 24, 22, 58, -16, 15.5, { plafond: false, ouv: { e: [P(40, 3.2, 3.2)] } });
    // (la Brèche : la coque est ouverte à l'est, au-dessus d'un rebord trop haut pour qu'on l'enjambe)
    this.salle(24, 48, 30, 50, -16, 6, { sans: ['o'], ouv: { e: [{ a: 36, b: 43, bas: 1.6, haut: 5.2 }] }, frise: false });
    // les bords déchirés de la brèche (des plaques tordues)
    for (const [z, y, a] of [[35.6, 1.6, 0.4], [43.4, 2.2, -0.5], [37.5, 5.2, 0.9], [41.6, 0.9, -0.3]]) this.B(48.3, -16 + y, z, 0.25, 1.6, 1.1, M_VG_COQUE).r = a;
    this.dehors();
    mondes.finConstruction();
  },
  // le reste de la cité, qu'on voit par les baies : des tours éteintes, une échine de coque, des ponts dans le vide
  dehors() {
    const rnd = mulberry32(70707), L = this.lointains = [];
    const tour = (x, z, w, d, y0, h) => { this.B(x, y0, z, w, h, d, M_VG_COQUE); this.B(x, y0 + h, z, w * 0.7, h * 0.08, d * 0.7, M_VG_NACRE); if (rnd() < 0.6) this.B(x, y0 + h * 1.08, z, w * 0.18, h * 0.35, d * 0.18, M_VG_COQUE); L.push([x, z, w, d, y0, h]); };
    // à l'est et à l'ouest de la Nef, de l'Observatoire, au-delà des Jardins
    for (let i = 0; i < 9; i++) tour(80 + rnd() * 110, -10 + i * 22 + rnd() * 10, 8 + rnd() * 14, 8 + rnd() * 14, -60 - rnd() * 30, 50 + rnd() * 90);
    for (let i = 0; i < 9; i++) tour(-95 - rnd() * 110, -10 + i * 22 + rnd() * 10, 8 + rnd() * 14, 8 + rnd() * 14, -60 - rnd() * 30, 50 + rnd() * 90);
    for (let i = 0; i < 6; i++) tour(-80 + i * 32 + rnd() * 12, 170 + rnd() * 70, 10 + rnd() * 16, 10 + rnd() * 16, -50 - rnd() * 30, 60 + rnd() * 80);
    // l'échine : une longue coque sous la cité, des deux côtés
    for (const s of [-1, 1]) this.B(s * 66, -48, 60, 20, 26, 230, M_VG_COQUE);
    this.B(0, -70, 60, 120, 20, 260, M_VG_COQUE);
    // des passerelles entre des tours, dans le vide
    for (let i = 0; i < 4; i++) { const z = 10 + i * 40 + rnd() * 10, y = 10 + rnd() * 30; this.B(110, y, z, 70, 1.2, 3, M_VG_DALLE); this.B(-125, y, z + 12, 60, 1.2, 3, M_VG_DALLE); }
  },
  // un sol percé de trous carrés [x, z, demi-côté]
  solTroue(x0, x1, z0, z1, y, trous, m, ep) {
    // découpe en bandes le long de z autour de chaque trou
    let parts = [[x0, x1, z0, z1]];
    for (const [tx, tz, r] of trous) {
      const out = [];
      for (const [a0, a1, b0, b1] of parts) {
        if (tx + r <= a0 || tx - r >= a1 || tz + r <= b0 || tz - r >= b1) { out.push([a0, a1, b0, b1]); continue; }
        if (tz - r > b0) out.push([a0, a1, b0, tz - r]);
        if (tz + r < b1) out.push([a0, a1, tz + r, b1]);
        if (tx - r > a0) out.push([a0, tx - r, Math.max(b0, tz - r), Math.min(b1, tz + r)]);
        if (tx + r < a1) out.push([tx + r, a1, Math.max(b0, tz - r), Math.min(b1, tz + r)]);
      }
      parts = out;
    }
    for (const [a0, a1, b0, b1] of parts) this.boite(a0, a1, y - (ep || 0.5), y, b0, b1, m);
  },
  // une maison de l'équipage (dans la Nef) : quatre murs, un toit plat, une porte du côté de l'allée
  maison(x0, x1, z0, z1, cote, cle) {
    const H = 4, zc = (z0 + z1) / 2;
    const ouv = { [cote]: [this.P(zc, 1.6, 2.4)] };
    // une fenêtre de chaque côté de la porte
    ouv[cote].push(this.V(zc - 2.6, 1.2, 1.1, 2.1), this.V(zc + 2.6, 1.2, 1.1, 2.1));
    this.salle(x0, x1, z0, z1, 0, H, { sol: M_VG_NACRE, ouv, frise: false, plafond: M_VG_NACRE });
    this.maisons.push({ cle, x0, x1, z0, z1, cote });
  },

  // ------------------------------------------------------------- entrer, sortir
  entrer(opts) {
    const V = VG.S(), p = game.player, M = mondes;
    this.maisons = []; this.machines = {}; this.choses = {}; this.zonesVues = {}; this.voixFile = []; this.voixT = 0;
    this.batir();
    this.peupler();
    const [ax, az] = this.at(0, -9.5);
    this.depart = [ax, this.f().y + 0.02, az];
    MONDES.vaisseau.depart = this.depart;
    if (!opts.restaurer) { p.pos = this.depart.slice(); p.vel = [0, 0, 0]; p.yaw = Math.PI; p.pitch = 0.05; }
    if (game.renderer) game.renderer.uploadCover(p.pos[0], p.pos[2]);
    MSON.drone('vaisseau', [41.2, 61.8, 82.4], 0.035, 'sine', 160);
    if (V.m && V.m.coeur) MSON.drone('vg_coeur', [36.7, 55.1, 73.4, 110.2], 0.028, 'sawtooth', 240); // (une partie rechargée : le Cœur brûlait)
    void M; void V;
  },
  sortir() {
    MSON.stopTout();
    const V = VG.S();
    if (V.etat === 1) { V.etat = 2; if (!V.revenu) V.revenu = farm.s ? farm.s.day : 0; }
    game.player.mods.grav = 1;
  },
  // partie rechargée là-haut : on y est toujours
  reprendre() {
    const V = VG.S(), p = game.player;
    mondes.entrer('vaisseau', { restaurer: true });
    if (V.pos && V.pos.length === 3) { p.pos = V.pos.slice(); p.yaw = V.yaw || 0; p.vel = [0, 0, 0]; } else { p.pos = this.depart.slice(); }
    if (game.renderer) game.renderer.uploadCover(p.pos[0], p.pos[2]);
    setTimeout(() => this.dire(VG_VOIX.reprise, 5), 1800);
  },

  // ------------------------------------------------------------- la voix (la veilleuse)
  dire(texte, dur, qui) {
    if (!texte) return;
    const V = VG.S();
    VGSON.voix(); if (sound.mumble && sound.ok) setTimeout(() => sound.mumble(1.55, Math.min(60, texte.length), 0, 0.4), 260);
    ui.subtitle(qui || (V.nommee ? 'La veilleuse' : 'Une voix'), texte, dur || Math.min(9, 2.5 + texte.length * 0.045));
  },
  // une suite de répliques, espacées
  suite(L, t0) { let t = t0 || 0; for (const x of L) { setTimeout(() => { if (mondes.cur === 'vaisseau') this.dire(x); }, t); t += 2200 + x.length * 52; } return t; },
  arrivee() {
    const V = VG.S();
    const t = this.suite(VG_VOIX.arrivee, 1600);
    setTimeout(() => { V.nommee = 1; }, t - 1000);
  },

  // ------------------------------------------------------------- le retour (un seul)
  async revenir(mort, cause) {
    if (this.retourEnCours || mondes.cur !== 'vaisseau') return;
    this.retourEnCours = true;
    const V = VG.S(), p = game.player;
    try {
      game.sleeping = true;
      ui.close(true);
      if (!mort) this.dire(VG_VOIX.depart, 6);
      else { play.hurtFlash = 1; sound.heartbeat && sound.heartbeat(1); }
      await new Promise((r) => setTimeout(r, mort ? 300 : 3800));
      $('#fade').style.background = '#e4f2fb';
      await ui.fade(true, mort ? 'Quelqu’un vous rattrape.' : '', mort ? 900 : 1800);
      await new Promise((r) => setTimeout(r, mort ? 2400 : 1000));
      V.etat = 2; V.revenu = farm.s.day; V.mort = mort ? 1 : 0; if (cause) V.cause = String(cause);
      V.pos = null;
      mondes.sortir();
      p.vel = [0, 0, 0]; p.mods.grav = 1;
      if (mort) { p.hp = Math.max(p.hp, 14); p.breath = 1; p.food = Math.max(p.food, 18); corps.panser && corps.panser(); }
      $('#fade-text').textContent = '';
      $('#fade').style.background = '';
      await ui.fade(false, '', 2200);
      game.sleeping = false;
      if (game.mode === 'play' && game.lock) game.lock();
      // la pierre s'éteint
      const P = vgPierre.P();
      if (P) {
        VGSON.extinction([P.x, P.y + 1.8, P.z]);
        for (let i = 0; i < 40; i++) { const a = Math.random() * TAU, r = Math.random() * 1.2; particles.spawn(P.x + Math.cos(a) * r * Math.cos(P.r), P.y + 1.85 + Math.sin(a) * r, P.z - Math.cos(a) * r * Math.sin(P.r), (Math.random() - 0.5) * 0.3, 0.4 + Math.random() * 0.8, (Math.random() - 0.5) * 0.3, [0.5, 0.8, 1.0, 1], 0.05, 1.5 + Math.random() * 1.5, -0.05, true); }
        setTimeout(() => { game.shakeT = 0.35; }, 2200);
      }
      setTimeout(() => ui.subtitle('', mort ? '(Vous êtes couché contre la pierre ronde. Elle est froide.)' : '(Derrière vous, la lumière s’éteint.)', 5), mort ? 1500 : 2600);
      farm.save();
    } catch (e) { console.error(e); game.sleeping = false; $('#fade').style.background = ''; ui.fade(false, '', 300); }
    this.retourEnCours = false;
  },

  // ------------------------------------------------------------- essais
  essai() { if (mondes.cur) return false; VG.S().etat = 1; return mondes.entrer('vaisseau', {}); },
  aller(cle) {
    const C = { seuil: [0, 0, -9], nef: [0, 0, 40], jardins: [-45, 0, 56], galerie: [0, 12, 110], archives: [-18, 12, 118], atelier: [18, 12, 110], chapelle: [18, 12, 126], berceaux: [44, 12, 116], observatoire: [0, 24, 120], machinerie: [0, -16, 44], breche: [36, 0 - 16, 40] }[cle];
    if (!C || mondes.cur !== 'vaisseau') return false;
    const [x, z] = this.at(C[0], C[2]), p = game.player;
    p.pos = [x, this.f().y + C[1] + 0.05, z]; p.vel = [0, 0, 0];
    if (game.renderer) game.renderer.uploadCover(p.pos[0], p.pos[2]);
    return true;
  },
};

// ---------------------------------------------------------------- le monde (la mécanique commune : 11-zzz70-mondes.js)
MONDES.vaisseau = {
  nom: 'vaisseau', titre: 'la cité', aPart: true, lieu: 'la cité', plancher: 0, depart: null,
  entrer(opts) { vgCite.entrer(opts || {}); },
  sortir(opts) { vgCite.sortir(opts || {}); },
  reprendre() { vgCite.reprendre(); },
  posReelle() { return mondes.S().retour || null; },
  avantSauvegarde() { const V = VG.S(), p = game.player; V.pos = p.pos.map((v) => Math.round(v * 100) / 100); V.yaw = Math.round(p.yaw * 1000) / 1000; },
  update(dt, playing) { vgCite.update && vgCite.update(dt, playing); },
  // le ciel de la cité : le noir, les étoiles ; la lumière dépend du Cœur
  ciel(sky) {
    const on = vgCite.lumK || 0;
    mondes.melerCiel(sky, {
      zen: [0.004, 0.006, 0.018], hor: [0.018, 0.024, 0.05], amb: [0.2 + on * 0.42, 0.23 + on * 0.41, 0.32 + on * 0.36], glow: [0, 0, 0], haze: [0.012, 0.016, 0.034],
      cloudLit: [0, 0, 0], cloudDark: [0, 0, 0], cloudCover: 0, sunCol: [0, 0, 0], moonCol: [0.05, 0.07, 0.1], sunDisk: [0.8, 0.85, 1],
      stars: vgCite.etoilesK === undefined ? 1 : vgCite.etoilesK, sunVis: 0, moonVis: 1, moonTint: [0.55, 0.85, 1.05], mist: 0, fog: [70, 260], nightLit: 1, shadowK: 0,
    }, 1);
    sky.moonDir = v3.norm([0.55, 0.42, 0.72]);
  },
};
HOOKS.sky.push((sky) => { if (mondes.cur === 'vaisseau') MONDES.vaisseau.ciel(sky); });
// un voile bleu très léger tant que le Cœur dort
HOOKS.fx.push((fx, tint) => {
  if (mondes.cur !== 'vaisseau' || tint[3] > 0.06) return;
  const a = 0.05 * (1 - (vgCite.lumK || 0));
  if (a > 0.003) { tint[0] = 0.18; tint[1] = 0.32; tint[2] = 0.7; tint[3] = a; }
});
// pendant le voyage, aucun autre monde ne vous prend (on ne rêve pas, on ne glisse pas dans une vision) — sauf les Enfers
{
  const _e = mondes.entrer.bind(mondes);
  mondes.entrer = function (nom, opts) {
    if (this.cur === 'vaisseau' && nom !== 'vaisseau' && nom !== 'enfers') return false;
    return _e(nom, opts);
  };
}
// mourir là-haut : la veilleuse vous rend à la vallée ; le voyage finit comme par le seuil
HOOKS.death.push((cause) => {
  if (mondes.cur !== 'vaisseau') return false;
  vgCite.revenir(true, cause);
  return true;
});
