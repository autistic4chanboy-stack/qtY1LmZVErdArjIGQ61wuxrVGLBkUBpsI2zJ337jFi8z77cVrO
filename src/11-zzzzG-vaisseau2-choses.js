// ============================================================================
//  LA CITÉ (agent G, suite) — ce qu'il y a dedans : les machines (le Cœur, les
//  lampes, les portes, les ascenseurs, la pesanteur, les serres, les
//  hologrammes, la fontaine, le rideau de la Brèche), les écrans, les messages
//  enregistrés, les inscriptions, les maisons de l'équipage et ce qu'on y
//  trouve, la veilleuse à qui l'on parle ; et, chaque image, ce qui bouge.
//  Machines : farm.s.vaisseau.m[clé] = 1 (en marche) ; sans le Cœur, seules
//  marchent la veilleuse, l'écran du Seuil et les ascenseurs (lentement).
// ============================================================================
// les machines : celles qui ont besoin du Cœur
const VG_MACH = {
  coeur: { nom: 'le Cœur', courant: false, voixOn: 'coeur_on', voixOff: 'coeur_off', f0: 36 },
  lampes: { nom: 'les lampes de la Nef', courant: true, voixOn: 'lampes_on', f0: 110 },
  fontaine: { nom: 'la fontaine', courant: true, voixOn: 'fontaine_on', f0: 140 },
  gravite: { nom: 'le régulateur de pesanteur', courant: true, voixOn: 'gravite', f0: 70 },
  holo_nef: { nom: 'l’hologramme de la Nef', courant: true, voixOn: 'holo_on', f0: 220 },
  serre: { nom: 'les serres', courant: true, voixOn: 'serre_on', f0: 90 },
  holo_ciel: { nom: 'la carte du ciel', courant: true, voixOn: 'holo_ciel_on', f0: 260 },
  holo_ilaeth: { nom: 'l’image d’Ilaeth', courant: true, voixOn: 'ilaeth_on', f0: 240 },
  rideau: { nom: 'le rideau de la Brèche', courant: true, voixOn: 'rideau_on', f0: 80 },
};
const VG_COEUR_MAX = 300, VG_COEUR_ALERTE = 230; // secondes de Cœur allumé avant que la veilleuse ne l'éteigne elle-même

// ---------------------------------------------------------------- petits modèles propres à ce fichier
const VGM2 = {
  // la veilleuse : un socle de nacre, une flamme bleue qui tient dans l'air
  veilleuse(E, c, t) {
    E.bx(0, 0, 0, 0.7, 1.0, 0.7, VGC.nacre, mt(M_VG_NACRE)); E.bx(0, 1.0, 0, 0.9, 0.08, 0.9, VGC.coque, TL.metal);
    E.fl = FX_EMIT;
    const b = 0.8 + 0.2 * Math.sin(t * 1.7), y = 1.45 + Math.sin(t * 0.8) * 0.05;
    E.box(0, y, 0, 0.14, 0.2, 0.14, [0.5 * b, 0.8 * b, 1.4 * b], TL.plain, t * 0.6);
    E.box(0, y + 0.05, 0, 0.08, 0.1, 0.08, [1.2, 1.3, 1.4], TL.plain, -t);
    E.fl = 0;
  },
  // un lampadaire de la Nef ; on : allumé
  lampadaire(E, on) {
    E.bx(0, 0, 0, 0.5, 0.3, 0.5, VGC.nacre, mt(M_VG_NACRE)); E.bx(0, 0.3, 0, 0.14, 4.2, 0.14, VGC.coque, TL.metal);
    E.box(0.35, 4.55, 0, 0.8, 0.1, 0.1, VGC.coque, TL.metal);
    E.fl = on ? FX_EMIT : 0; E.box(0.7, 4.3, 0, 0.4, 0.35, 0.4, on ? [1.25, 1.22, 1.1] : [0.28, 0.3, 0.34], TL.plain); E.fl = 0;
  },
  // un plafonnier ; on : allumé
  plafonnier(E, on) { E.fl = on ? FX_EMIT : 0; E.bx(0, -0.12, 0, 1.6, 0.12, 0.5, on ? [1.15, 1.2, 1.25] : [0.3, 0.32, 0.36], TL.plain); E.fl = 0; E.bx(0, 0, 0, 1.75, 0.06, 0.62, VGC.coque, TL.metal); },
  // le garde-corps d'un puits d'ascenseur (dessiné quand la plate-forme n'est pas là)
  garde(E) { for (const s of [-1, 1]) { E.bx(s * 1.9, 0, 0, 0.08, 1.05, 3.9, VGC.nacre, TL.metal); E.bx(0, 0, s * 1.9, 3.9, 1.05, 0.08, VGC.nacre, TL.metal); } E.fl = FX_EMIT; E.bx(0, 1.05, -1.95, 1.2, 0.06, 0.06, [1.2, 0.6, 0.15], TL.plain); E.fl = 0; },
  // une trappe au sol, ou une échelle contre un mur
  trappe(E) { E.bx(0, 0, 0, 1.2, 0.06, 1.2, VGC.coque, mt(M_VG_DALLE)); E.bx(0, 0.06, 0, 1.0, 0.03, 0.08, VGC.sombre, TL.metal); E.bx(0.35, 0.06, 0.4, 0.2, 0.05, 0.05, VGC.nacre, TL.metal); },
  echelle(E, c) { const H = c.hh || 6; for (const s of [-0.28, 0.28]) E.bx(s, 0, 0, 0.06, H, 0.06, VGC.nacre, TL.metal); for (let y = 0.3; y < H; y += 0.35) E.bx(0, y, 0, 0.56, 0.04, 0.05, VGC.coque, TL.metal); },
  // une bande de lumière au pied d'un mur (c.l : longueur, le long de x local) : bleue sans courant, blanche avec
  bande(E, c, on) { E.fl = FX_EMIT; E.bx(0, 0.02, 0, c.l || 6, 0.05, 0.06, on ? [0.85, 0.9, 1.0] : [0.12, 0.24, 0.6], TL.plain); E.fl = 0; },
  // le pot de la graine de lumière
  pot(E) { E.bx(0, 0, 0, 0.5, 0.4, 0.5, VGC.nacre, mt(M_VG_NACRE)); E.bx(0, 0.4, 0, 0.42, 0.03, 0.42, [0.24, 0.2, 0.15], TL.soil); },
  // les fenêtres des tours lointaines (c.w, c.d, c.y0, c.h : la tour) ; k : le Cœur (0..1)
  fenetres(E, c, t, k) {
    const n = 5 + Math.round(k * 9), id = c.id || 1;
    E.fl = FX_EMIT;
    for (let i = 0; i < n; i++) {
      const hsh = (a) => { const s = Math.sin(id * 12.9898 + i * 78.233 + a * 37.719) * 43758.5453; return s - Math.floor(s); };
      if (i >= 5 && hsh(9) > k) continue;
      const face = (hsh(1) * 4) | 0, u = (hsh(2) - 0.5) * 0.8, yy = c.y0 + c.h * (0.15 + hsh(3) * 0.8);
      const b = (hsh(5) < 0.2 ? 0.55 + 0.45 * Math.sin(t * 0.3 + i) : 1) * (0.7 + k * 0.5);
      const col = hsh(4) < 0.6 ? [0.9 * b, 0.68 * b, 0.36 * b] : [0.45 * b, 0.65 * b, 1.0 * b];
      const lx = face === 0 ? -c.w / 2 - 0.05 : face === 1 ? c.w / 2 + 0.05 : u * c.w, lz = face === 2 ? -c.d / 2 - 0.05 : face === 3 ? c.d / 2 + 0.05 : u * c.d;
      E.bx(lx, yy, lz, face < 2 ? 0.1 : 1.1, 0.7, face < 2 ? 1.1 : 0.1, col, TL.plain);
    }
    E.fl = 0;
  },
  // un gant gelé, dans la Brèche
  gant(E) { E.bx(0, 0, 0, 0.16, 0.06, 0.24, [0.7, 0.72, 0.75], TL.cloth, 0.6); for (let k = 0; k < 4; k++) E.bx(-0.06 + k * 0.04, 0, 0.14, 0.03, 0.04, 0.08, [0.7, 0.72, 0.75], TL.cloth, 0.6); },
};

Object.assign(vgCite, {
  // ------------------------------------------------------------- utilitaires
  ch(lx, ly, lz, o) {
    const [x, z] = this.at(lx, lz), y = this.f().y + ly;
    return mondes.chose(Object.assign({ x, z, y, yRef: y }, o));
  },
  marche(cle) { const V = VG.S(), D = VG_MACH[cle]; return !!V.m[cle] && (!D || !D.courant || !!V.m.coeur); },
  // une lumière qui ne brille que si cond()
  lum(lx, ly, lz, col, r, cond) { const c = this.ch(lx, ly, lz, { modele: null }); if (!c) return null; const L = { c: col, r, y: 0 }; Object.defineProperty(c, 'lumiere', { get: () => (!cond || cond() ? L : null), configurable: true }); return c; },
  pos(lx, ly, lz) { const [x, z] = this.at(lx, lz); return [x, this.f().y + ly, z]; },
  // ------------------------------------------------------------- la population
  peupler() {
    const V = VG.S();
    this.portes = []; this.ascs = []; this.anim = {};
    const C = () => this.courant();
    const lampes = () => this.marche('lampes');
    // ================= le Seuil =================
    this.seuilC = this.ch(0, 0.3, -15.6, { r: 0, modele: VGM.seuil, loin: 90, rayon: 1.8, h: 3, reste: true, eclat: 1, prendre: () => this.seuil() });
    this.lum(0, 2.6, -14.4, [0.35, 0.6, 1.1], 12);
    this.ch(9.75, 1.3, -6, { r: -Math.PI / 2, modele: VGM.ecran, on: true, rayon: 0.8, h: 1, reste: true, prendre: () => this.journal() });
    this.ch(9.2, 0, -8.2, { r: -Math.PI / 2, modele: VGM.table });
    this.ch(9.2, 0.78, -8.2, { modele: VGM.objet, forme: 'boule', col: [0.75, 0.88, 1.0], item: 'vg_toupie', cle: 'vg_toupie', rayon: 0.35, h: 0.3, prendre: (c) => { farm.give('vg_toupie', 1); play.flyer('vg_toupie', [c.x, c.y + 0.2, c.z], 1); sound.pop(); setTimeout(() => this.dire(VG_VOIX.toupie), 600); } });
    this.ch(-6, 0, -12, { modele: VGM2.veilleuse, rayon: 0.6, h: 1.6, reste: true, prendre: () => this.parler() });
    this.lum(-6, 1.5, -12, [0.2, 0.36, 0.75], 6);
    this.plaque('a_vg_retour', -3.0, 0.3, -17.45, 0);
    for (const [x, z] of [[-9.6, -14], [9.6, -14], [-9.6, 1], [9.6, 1]]) this.ch(x, 2.6, z, { r: x < 0 ? Math.PI / 2 : -Math.PI / 2, modele: VGM.veilleuse });
    this.lum(-8, 2.6, -2, [0.16, 0.26, 0.55], 9); this.lum(8, 2.6, -2, [0.16, 0.26, 0.55], 9);
    for (const z of [-12, -3]) for (const x of [-5, 5]) { this.ch(x, 8, z, { modele: (E) => VGM2.plafonnier(E, C()) }); }
    this.lum(0, 7, -6, [0.85, 0.9, 1.0], 16, C);
    // les bandes de lumière au pied des murs (Seuil, couloir, galerie)
    const bandes = (L) => { for (const [x, y, z, r, l] of L) this.ch(x, y, z, { r, l, modele: (E, c) => VGM2.bande(E, c, C()), loin: 90 }); };
    bandes([[-9.7, 0, -7, Math.PI / 2, 21], [9.7, 0, -7, Math.PI / 2, 21], [-6, 0, 3.7, 0, 7], [6, 0, 3.7, 0, 7], [-2.3, 0, 12, Math.PI / 2, 15.5], [2.3, 0, 12, Math.PI / 2, 15.5],
      [-5.7, 12, 117, Math.PI / 2, 33], [5.7, 12, 117, Math.PI / 2, 33], [-23.6, -16, 40, Math.PI / 2, 35], [23.6, -16, 30, Math.PI / 2, 15]]);
    // ================= le couloir des hublots =================
    for (const z of [8, 16]) { this.ch(0, 4, z, { modele: (E) => VGM2.plafonnier(E, C()) }); this.lum(0, 3.4, z, [0.8, 0.85, 0.95], 8, C); }
    for (const z of [6, 14]) this.ch(2.45, 0.3, z, { r: -Math.PI / 2, modele: VGM.veilleuse });
    this.lum(0, 0.6, 12, [0.14, 0.22, 0.45], 7);
    // ================= la Nef =================
    this.plaque('a_vg_aelim', 3.6, 0, 20.45, 0);
    this.machine('fontaine', this.ch(0, 0, 40, { modele: (E, c, t) => VGM.fontaine(E, { on: this.marche('fontaine') }, t), rayon: 2.6, h: 1.6, reste: true, loin: 110, prendre: () => this.basculer('fontaine', [0, 1, 40]) }));
    for (const [x, z] of [[-9, 32], [9, 32], [-9, 48], [9, 48], [-9, 70], [9, 70], [-9, 84], [9, 84]]) this.ch(x, 0, z, { v: x * 0.3 + z, r: z * 0.7, modele: VGM.arbre, loin: 120 });
    for (const x of [-4.6, 4.6]) this.ch(x, 0, 40, { r: Math.PI / 2, modele: VGM.banc });
    for (const z of [28, 40, 52, 64, 76, 88]) for (const s of [-1, 1]) {
      this.ch(s * 3.6, 0, z, { r: s < 0 ? 0 : Math.PI, modele: (E) => VGM2.lampadaire(E, lampes()), loin: 120 });
      if (s < 0 || z % 24 === 4) this.lum(s * 3.0, 4.2, z, [1.0, 0.98, 0.9], 14, lampes);
    }
    this.lum(0, 12, 60, [0.7, 0.75, 0.9], 40, lampes);
    this.ch(-5.6, 0, 22.4, { r: Math.PI, modele: (E, c, t) => VGM.pupitre(E, { on: this.marche('lampes'), id: 3 }, t), rayon: 0.6, h: 1.2, reste: true, prendre: () => this.basculer('lampes', [-5.6, 1, 22.4]) });
    this.machine('gravite', this.ch(0, 0, 62, { modele: (E, c, t) => VGM.gravite(E, { k: this.anim.gravite || 0 }, t), rayon: 1.4, h: 2.8, reste: true, loin: 110, prendre: () => this.basculer('gravite', [0, 1.5, 62]) }));
    this.machine('holo_nef', this.ch(0, 0, 90, { modele: (E, c, t) => VGM.holo(E, { k: this.anim.holo_nef || 0, fig: 'ville' }, t), rayon: 1.1, h: 1.2, reste: true, loin: 110, prendre: () => this.basculer('holo_nef', [0, 1, 90]) }));
    this.lum(0, 2, 90, [0.25, 0.45, 0.8], 8, () => (this.anim.holo_nef || 0) > 0.3);
    this.lum(-14, 1, 30, [0.14, 0.22, 0.45], 9); this.lum(14, 1, 30, [0.14, 0.22, 0.45], 9); this.lum(0, 1, 70, [0.14, 0.22, 0.45], 10);
    for (const z of [34, 62, 90]) for (const x of [-29.4, 29.4]) this.ch(x, 0.4, z, { r: x < 0 ? Math.PI / 2 : -Math.PI / 2, modele: VGM.veilleuse });
    // l'ascenseur de la Machinerie, la trappe de service
    this.ascenseur('A', 14, 26, -16, 0, [[16.9, 0, 26, -Math.PI / 2], [16.9, -16, 26, -Math.PI / 2]]);
    this.echelle([-14, 0, 21.6], [-14, -16, 23.6, Math.PI], 'trappe', VG_TEXTES.trappeDescendre);
    this.echelle([-14, -16, 22.55], [-14, 0, 23.2, Math.PI], 'echelle', VG_TEXTES.trappeMonter, 16);
    // les maisons de l'équipage
    for (const M of this.maisons) this.meubler(M);
    // ================= les Jardins =================
    this.porte('jardins', -30, 0, 56, 'z', 3.2, 3.2);
    let nb = 0;
    for (const x of [-58, -52, -46, -40]) for (const z of [49, 63]) { const i = nb++; this.ch(x, 0, z, { modele: (E, c, t) => VGM.bac(E, { k: this.anim.serre || 0, on: this.marche('serre'), vivant: false }, t), loin: 90, i }); }
    this.machine('serre', this.ch(-33, 0, 44, { r: Math.PI / 2, modele: (E, c, t) => VGM.pupitre(E, { on: this.marche('serre'), id: 5 }, t), rayon: 0.6, h: 1.2, reste: true, prendre: () => this.basculer('serre', [-33, 1, 44]) }));
    this.lum(-49, 2.4, 56, [1.0, 0.45, 0.95], 14, () => this.marche('serre'));
    this.lum(-49, 7, 56, [0.7, 0.8, 0.85], 22, C);
    this.lum(-36, 1, 66, [0.14, 0.22, 0.45], 8);
    this.ecran('jardins', -63.75, 1.3, 56, Math.PI / 2);
    this.ch(-60, 0, 43, { r: 0, modele: VGM.table });
    this.objet(-60.3, 0.78, 43, 'vg_carnet_seriane', 'livre', [0.36, 0.48, 0.36]);
    this.ch(-61, 0, 68.5, { modele: VGM2.pot });
    this.objet(-61, 0.45, 68.5, 'vg_graine', 'boule', [0.95, 0.9, 0.55], { lueur: true, dit: null, apres: () => setTimeout(() => this.dire(VG_VOIX.graine), 500) });
    this.lum(-61, 0.8, 68.5, [0.6, 0.55, 0.25], 3.5, () => !mondes.S().pris.vg_graine);
    // les fruits des serres : quand elles ont poussé
    for (const [x, z] of [[-58, 47], [-52, 61], [-46, 50], [-40, 64], [-52, 47.5], [-46, 62]]) this.objet(x + 0.2, 1.45, z, 'vg_fruit', 'boule', [0.86, 0.9, 0.6], { cle: 'vg_fruit_' + x + '_' + z, cond: () => (this.anim.serre || 0) > 0.95 });
    // ================= l'aile haute (y = 12) =================
    const y1 = 12;
    for (const z of [104, 116, 128]) { this.ch(0, y1 + 5, z, { modele: (E) => VGM2.plafonnier(E, C()) }); }
    this.lum(0, y1 + 4, 112, [0.8, 0.85, 0.95], 14, C); this.lum(0, y1 + 4, 126, [0.8, 0.85, 0.95], 14, C);
    this.lum(0, y1 + 0.8, 118, [0.14, 0.22, 0.45], 9);
    this.ascenseur('B', 3, 129, y1, 24, [[5.5, y1, 131.6, -Math.PI / 2], [5.5, 24, 131.6, -Math.PI / 2]]);
    this.echelle([-4.5, y1, 133.55], [-4.5, 24, 131.2, 0], 'echelle', VG_TEXTES.trappeMonter, 5);
    this.echelle([-4.5, 24, 132.6], [-4.5, y1, 131.8, 0], 'trappe', VG_TEXTES.trappeDescendre);
    // les Archives
    for (const x of [-27, -23]) for (const z of [106, 110, 114, 122, 126, 130]) this.ch(x, y1, z, { r: Math.PI / 2, modele: VGM.etagere, loin: 70 });
    this.ecran('archives', -14, y1 + 1.3, 133.75, Math.PI);
    this.machine('holo_ciel', this.ch(-14, y1, 118, { modele: (E, c, t) => VGM.holo(E, { k: this.anim.holo_ciel || 0, fig: 'ciel' }, t), rayon: 1.1, h: 1.2, reste: true, prendre: () => this.basculer('holo_ciel', [-14, y1 + 1, 118]) }));
    this.ch(-10, y1, 106, { r: 0, modele: VGM.table });
    this.objet(-10.4, y1 + 0.78, 106, 'vg_fiche', 'papier');
    this.objet(-9.7, y1 + 0.78, 106.1, 'lampe_torche', 'boite', [0.8, 0.82, 0.85]);
    this.objet(-27, y1 + 1.15, 112, 'vg_cristal', 'boule', [0.65, 0.92, 0.95], { lueur: true });
    this.objet(-23, y1 + 0.7, 126, 'vg_oeil', 'boule', [0.25, 0.3, 0.45]);
    this.objet(-27, y1 + 0.25, 130, 'vg_coeur', 'boule', [0.5, 0.75, 0.95], { lueur: true, cle: 'vg_coeur_archives' });
    this.lum(-18, y1 + 4, 118, [0.8, 0.85, 0.95], 16, C); this.lum(-18, y1 + 0.6, 108, [0.14, 0.22, 0.45], 9);
    this.lum(-14, y1 + 2, 118, [0.6, 0.65, 0.8], 7, () => (this.anim.holo_ciel || 0) > 0.3);
    // l'Atelier des corps
    this.ch(18, y1, 111, { r: 0, modele: (E, c, t) => VGM.atelier(E, { on: C() }, t), rayon: 1.4, h: 1.6, reste: true, loin: 70, prendre: () => (typeof vgCorps !== 'undefined' ? vgCorps.ouvrir() : null) });
    this.ecran('atelier', 29.75, y1 + 1.3, 106, -Math.PI / 2);
    this.plaque('a_vg_hem', 8, y1, 104.45, 0);
    this.ch(10, y1, 115, { r: 0, modele: VGM.table });
    this.objet(9.6, y1 + 0.78, 115, 'vg_notes_mirelle', 'livre', [0.55, 0.42, 0.36]);
    this.galet('mirelle', 10.6, y1 + 0.78, 115.1);
    this.coffre('atelier', 26, y1, 116.6, Math.PI, [['vg_coeur', 2], ['vg_seve', 1]]);
    this.lum(18, y1 + 4.5, 111, [0.85, 0.9, 1.0], 14, C); this.lum(18, y1 + 1.8, 111, [0.3, 0.55, 0.9], 5, C); this.lum(10, y1 + 0.6, 108, [0.14, 0.22, 0.45], 8);
    // la Chapelle
    this.ch(18, y1, 131.2, { r: Math.PI, modele: VGM.autel, loin: 70 });
    for (const z of [122, 125, 128]) for (const x of [12.5, 23.5]) this.ch(x, y1, z, { r: 0, modele: VGM.banc });
    this.plaque('a_vg_trois', 8.5, y1, 133.55, Math.PI);
    this.lum(18, y1 + 1.6, 131, [0.9, 0.75, 0.45], 9); this.lum(18, y1 + 5, 124, [0.8, 0.85, 0.95], 12, C);
    // les Berceaux
    for (const x of [36, 42, 48, 54]) for (const z of [104, 110, 116, 122, 128]) {
      if (x === 54 && z === 128) continue;
      this.ch(x, y1, z, { r: 0, modele: VGM.berceau, loin: 60 });
    }
    this.ch(54, y1, 128, { r: 0, modele: (E, c, t) => VGM.berceau(E, { occupe: true }, t), rayon: 1.2, h: 1.0, reste: true, prendre: () => this.iorin() });
    this.lum(54, y1 + 1.2, 128, [0.3, 0.55, 0.9], 5);
    this.ecran('berceaux', 57.75, y1 + 1.3, 117, -Math.PI / 2);
    this.plaque('a_vg_ior', 33, y1, 133.55, Math.PI);
    this.galet('seriane', 55.6, y1 + 0.55, 130.6);
    this.objet(52.2, y1, 131.2, 'vg_cahier_iorin', 'livre', [0.66, 0.48, 0.6]);
    this.objet(36, y1 + 0.95, 104, 'vg_seve', 'boule', [0.78, 0.95, 0.82], { cle: 'vg_seve_berceaux' });
    this.objet(48, y1 + 0.95, 122, 'vg_coeur', 'boule', [0.5, 0.75, 0.95], { lueur: true, cle: 'vg_coeur_berceaux' });
    this.lum(44, y1 + 5, 112, [0.75, 0.8, 0.95], 16, C); this.lum(44, y1 + 5, 126, [0.75, 0.8, 0.95], 16, C); this.lum(40, y1 + 0.6, 116, [0.14, 0.22, 0.45], 10);
    // ================= l'Observatoire (y = 24) =================
    const y2 = 24;
    this.ch(0, y2, 127, { r: 0, modele: VGM.lunette, rayon: 1.2, h: 2.2, reste: true, prendre: () => this.lunette() });
    this.ch(0, y2 + 1.2, 133.7, { r: Math.PI, modele: VGM.cadre, l: 20, h: 7.3 });
    this.ecran('observatoire', -11.75, y2 + 1.3, 116, Math.PI / 2);
    this.machine('holo_ilaeth', this.ch(7, y2, 118, { modele: (E, c, t) => VGM.holo(E, { k: this.anim.holo_ilaeth || 0, fig: 'femme' }, t), rayon: 1.1, h: 1.2, reste: true, prendre: () => this.basculer('holo_ilaeth', [7, y2 + 1, 118]) }));
    this.lum(7, y2 + 1.8, 118, [0.3, 0.55, 0.9], 6, () => (this.anim.holo_ilaeth || 0) > 0.3);
    this.galet('ilaeth', -6, y2 + 0.05, 130);
    this.plaque('a_vg_estel', 9, y2, 112.45, 0);
    this.ch(-8, y2, 124, { r: Math.PI / 2, modele: VGM.table });
    this.objet(-8, y2 + 0.78, 124, 'vg_plaque', 'plaque', [0.12, 0.16, 0.24]);
    this.objet(-7.6, y2 + 0.78, 124.6, 'vg_coeur', 'boule', [0.5, 0.75, 0.95], { lueur: true, cle: 'vg_coeur_observatoire' });
    this.lum(0, y2 + 1, 120, [0.14, 0.22, 0.45], 10); this.lum(0, y2 + 7, 122, [0.7, 0.75, 0.9], 14, C);
    // ================= la Machinerie (y = −16) =================
    const y3 = -16;
    this.machine('coeur', this.ch(0, y3, 42, { modele: (E, c, t) => VGM.coeur(E, { k: this.anim.coeur || 0 }, t), rayon: 2.6, h: 4, reste: true, loin: 120, prendre: () => this.basculer('coeur', [0, y3 + 4, 42]) }));
    this.ch(0, y3, 35.6, { r: Math.PI, modele: (E, c, t) => VGM.pupitre(E, { on: !!VG.S().m.coeur, id: 1 }, t), rayon: 0.6, h: 1.2, reste: true, prendre: () => this.basculer('coeur', [0, y3 + 1, 35.6]) });
    this.lum(0, y3 + 7, 42, [0.6, 0.85, 1.3], 30, () => (this.anim.coeur || 0) > 0.2);
    this.lum(0, y3 + 1.5, 42, [0.55, 0.1, 0.05], 7, () => (this.anim.coeur || 0) < 0.2);
    this.lum(-18, y3 + 1, 30, [0.14, 0.22, 0.45], 10); this.lum(18, y3 + 1, 52, [0.14, 0.22, 0.45], 10); this.lum(-18, y3 + 1, 52, [0.14, 0.22, 0.45], 9);
    this.ecran('machinerie', -23.75, y3 + 1.3, 42, Math.PI / 2);
    this.plaque('a_vg_vir', 6, y3, 35.3, Math.PI);
    this.ch(-18, y3, 50, { r: 0, modele: VGM.table });
    this.objet(-18.3, y3 + 0.78, 50, 'vg_carnet_thalvor', 'livre', [0.36, 0.42, 0.48]);
    this.galet('thalvor', -17.4, y3 + 0.78, 50.1);
    for (const z of [30, 34]) this.ch(-23.4, y3, z, { r: Math.PI / 2, modele: VGM.etagere });
    this.objet(-23.4, y3 + 1.15, 30, 'vg_alliage', 'lingot', [0.55, 0.62, 0.72]);
    this.objet(-23.4, y3 + 0.7, 34, 'vg_eclat', 'plaque', [0.66, 0.7, 0.76], { n: 2 });
    this.coffre('machinerie', -20, y3, 56.6, Math.PI, [['vg_coeur', 2], ['vg_alliage', 1], ['vg_ration', 1]]);
    this.machine('rideau', this.ch(21.4, y3, 36.6, { r: -Math.PI / 2, modele: (E, c, t) => VGM.pupitre(E, { on: this.marche('rideau'), id: 7 }, t), rayon: 0.6, h: 1.2, reste: true, prendre: () => this.basculer('rideau', [21.4, y3 + 1, 36.6]) }));
    this.porte('breche', 24, y3, 40, 'z', 3.2, 3.2);
    // ================= la Brèche =================
    this.ch(47.8, y3 + 1.6, 39.5, { r: Math.PI / 2, modele: (E, c, t) => VGM.rideau(E, { k: this.anim.rideau || 0, l: 7, h: 3.6 }, t), loin: 70 });
    this.lum(46, y3 + 3, 39.5, [0.3, 0.55, 1.0], 9, () => (this.anim.rideau || 0) > 0.3);
    this.lum(30, y3 + 1, 44, [0.4, 0.12, 0.06], 8);
    this.objet(40, y3, 33, 'vg_eclat', 'plaque', [0.66, 0.7, 0.76], { n: 2, cle: 'vg_eclat_b1' });
    this.objet(44.5, y3, 46, 'vg_eclat', 'plaque', [0.66, 0.7, 0.76], { cle: 'vg_eclat_b2' });
    this.objet(33, y3, 47, 'vg_alliage', 'lingot', [0.55, 0.62, 0.72], { cle: 'vg_alliage_b' });
    this.objet(46.6, y3, 38, 'vg_coeur', 'boule', [0.5, 0.75, 0.95], { lueur: true, cle: 'vg_coeur_breche' });
    this.objet(41, y3, 48.5, 'vg_etoffe', 'boite', [0.78, 0.8, 0.84], { cle: 'vg_etoffe_b' });
    this.ch(37, y3, 44, { r: 1.2, modele: VGM2.gant });
    // ================= le dehors : quelques fenêtres encore allumées dans les tours (plus, quand le Cœur marche) =================
    for (const [x, z, w, d, y0, h] of this.lointains || []) this.ch(x, 0, z, { modele: (E, c, t) => VGM2.fenetres(E, c, t, this.lumK || 0), loin: 320, w, d, y0, h });
    void V;
  },
  // ------------------------------------------------------------- briques de la population
  machine(cle, c) { if (c) c.machine = cle; return c; },
  plaque(id, lx, ly, lz, r) { return this.ch(lx, ly, lz, { r, modele: VGM.plaque, rayon: 0.6, h: 1.2, reste: true, prendre: () => langues.lireInscription(id) }); },
  ecran(cle, lx, ly, lz, r) { return this.ch(lx, ly, lz, { r, modele: (E, c, t) => VGM.ecran(E, { on: this.courant(), rouge: cle === 'machinerie', id: c.id }, t), rayon: 0.8, h: 1, reste: true, prendre: () => this.lireEcran(cle) }); },
  galet(cle, lx, ly, lz) { return this.ch(lx, ly, lz, { modele: VGM.objet, forme: 'boule', col: [0.62, 0.78, 0.9], lueur: true, rayon: 0.3, h: 0.3, reste: true, prendre: () => this.message(cle) }); },
  // un objet à ramasser (o : { n, cle, lueur, cond(), apres() })
  objet(lx, ly, lz, item, forme, col, o) {
    o = o || {};
    const cle = o.cle || item;
    const c = this.ch(lx, ly, lz, { modele: (E, cc, t) => { if (!o.cond || o.cond()) VGM.objet(E, cc, t); }, forme, col, lueur: o.lueur, rayon: 0.35, h: 0.35, cle, n: o.n || 1, item,
      prendre: (cc) => {
        if (o.cond && !o.cond()) return false;
        farm.give(item, cc.n || 1); play.flyer(item, [cc.x, cc.y + 0.2, cc.z], cc.n || 1); sound.pop();
        if (o.apres) o.apres(cc);
      } });
    return c;
  },
  coffre(cle, lx, ly, lz, r, contenu) {
    const K = 'coffre_' + cle;
    return this.ch(lx, ly, lz, { r, modele: (E, c, t) => VGM.coffre(E, { vide: !!VG.S().pris[K] }, t), rayon: 0.6, h: 0.6, reste: true,
      prendre: (c) => {
        const V = VG.S();
        if (V.pris[K]) { ui.subtitle('', VG_TEXTES.coffreVide, 2); return; }
        V.pris[K] = 1; VGSON.souffle([c.x, c.y + 0.4, c.z], 0.5, 0.4);
        for (const [id, n] of contenu) { farm.give(id, n); play.flyer(id, [c.x, c.y + 0.6, c.z], n); }
        sound.pop();
      } });
  },
  // une maison de l'équipage : un lit, une table, une étagère, un coffre, un mot
  meubler(M) {
    const D = VG_MAISONS[M.cle];
    const fond = M.cote === 'e' ? M.x0 + 1.2 : M.x1 - 1.2, dir = M.cote === 'e' ? 1 : -1, zc = (M.z0 + M.z1) / 2;
    this.ch(fond, 0, M.z0 + 1.5, { r: M.cote === 'e' ? Math.PI / 2 : -Math.PI / 2, modele: VGM.lit, loin: 50 });
    this.ch(fond + dir * 3.2, 0, M.z1 - 1.2, { r: 0, modele: VGM.table, loin: 50 });
    this.ch(fond + dir * 0.5, 0, M.z1 - 0.6, { r: Math.PI, modele: VGM.etagere, loin: 50 });
    this.lum(fond + dir * 2.5, 3, zc, [0.75, 0.78, 0.9], 6, () => this.courant());
    if (D) {
      if (D[2] && D[2].length) this.coffre('m_' + M.cle, fond + dir * 0.2, 0, M.z0 + 3.4, M.cote === 'e' ? Math.PI / 2 : -Math.PI / 2, D[2]);
      if (D[1]) { const [ti, tx, si] = D[1]; this.ch(fond + dir * 3.2, 0.78, M.z1 - 1.2, { modele: VGM.objet, forme: 'papier', rayon: 0.3, h: 0.3, reste: true, prendre: () => { sound.page && sound.page(); VG.S().lus['m_' + M.cle] = 1; ui.read(ti, tx, si ? si + ' — ' + D[0].toLowerCase() : D[0]); } }); }
    }
  },
  // une porte coulissante (axe : le mur va le long de x ou de z) ; elle s'ouvre seule devant vous, s'il y a du courant
  porte(cle, lx, ly, lz, axe, l, h) {
    const D = { cle, lx, ly, lz, k: 0, ouvre: false, l, h };
    D.bloc = axe === 'x' ? this.boite(lx - l / 2, lx + l / 2, ly, ly + h, lz - 0.12, lz + 0.12, 0, { hidden: true }) : this.boite(lx - 0.12, lx + 0.12, ly, ly + h, lz - l / 2, lz + l / 2, 0, { hidden: true });
    D.y0 = D.bloc.y;
    D.c = this.ch(lx, ly, lz, { r: axe === 'x' ? 0 : Math.PI / 2, modele: (E, c, t) => VGM.porte(E, { k: D.k, l, h, verrou: !this.courant() }, t), loin: 80, rayon: 1.2, h: 2, reste: true, prendre: () => this.porteFermee(D) });
    this.portes.push(D);
    return D;
  },
  porteFermee(D) {
    if (this.courant() || D.ouvre) return;
    VGSON.clic(this.pos(D.lx, D.ly + 1.2, D.lz), 0.7);
    const V = VG.S();
    if (!V.dits.porte_close) { V.dits.porte_close = 1; this.dire(VG_VOIX.porte_close); } else ui.subtitle('', '(La porte ne bouge pas. Le voyant est rouge.)', 2.5);
  },
  // un ascenseur : plate-forme de 3,6 m entre deux niveaux (le haut est un trou dans un plancher)
  ascenseur(cle, lx, lz, yBas, yHaut, bornes) {
    const V = VG.S();
    const A = { cle, lx, lz, yBas, yHaut, y: V.asc && V.asc[cle] !== undefined ? V.asc[cle] : yHaut, cible: null, v: 0 };
    A.bloc = this.B(lx, A.y - 0.3, lz, 3.6, 0.3, 3.6, 0, { hidden: true });
    A.c = this.ch(lx, A.y, lz, { modele: (E, c, t) => VGM.ascenseur(E, { on: this.courant(), bouge: A.cible !== null }, t), loin: 90, rayon: 1.6, h: 1.0, reste: true, prendre: () => this.appeler(A, null) });
    // le garde-corps du haut, quand la plate-forme n'y est pas (dessiné, et une barrière invisible)
    A.garde = [];
    const yh = yHaut;
    for (const [x0, x1, z0, z1] of [[lx - 1.95, lx + 1.95, lz - 1.95, lz - 1.85], [lx - 1.95, lx + 1.95, lz + 1.85, lz + 1.95], [lx - 1.95, lx - 1.85, lz - 1.95, lz + 1.95], [lx + 1.85, lx + 1.95, lz - 1.95, lz + 1.95]]) A.garde.push(this.boite(x0, x1, yh, yh + 1.1, z0, z1, 0, { hidden: true }));
    A.gardeY = A.garde.map((b) => b.y);
    this.ch(lx, yh, lz, { modele: (E) => { if (Math.abs(A.y - A.yHaut) > 0.05) VGM2.garde(E); }, loin: 80 });
    for (const [bx, by, bz, br] of bornes) this.ch(bx, by, bz, { r: br, modele: (E, c, t) => VGM.pupitre(E, { on: this.courant(), id: 9 }, t), rayon: 0.6, h: 1.2, reste: true, prendre: () => this.appeler(A, by) });
    this.ascs.push(A);
    this.majGarde(A);
    return A;
  },
  majGarde(A) { const la = Math.abs(A.y - A.yHaut) < 0.05; A.garde.forEach((b, i) => { b.y = la ? -1e4 : A.gardeY[i]; }); },
  appeler(A, niveau) {
    if (A.cible !== null) return;
    const p = game.player, [lx, ly, lz] = this.local(p.pos);
    const dessus = Math.abs(lx - A.lx) < 1.75 && Math.abs(lz - A.lz) < 1.75 && Math.abs(ly - A.y) < 0.5;
    let cible = niveau === null || niveau === undefined ? (Math.abs(A.y - A.yHaut) < 0.05 ? A.yBas : A.yHaut) : niveau;
    if (niveau !== null && niveau !== undefined && Math.abs(A.y - niveau) < 0.05) cible = dessus ? (niveau === A.yHaut ? A.yBas : A.yHaut) : niveau;
    if (Math.abs(cible - A.y) < 0.05) return;
    A.cible = cible; A.porte = dessus ? [p.pos[0], p.pos[2]] : null;
    VGSON.clic(this.pos(A.lx, A.y + 1, A.lz), 0.8); VGSON.monte(this.pos(A.lx, A.y, A.lz), 0.5, 60);
    const V = VG.S();
    if (dessus && !V.dits.ascenseur) { V.dits.ascenseur = 1; this.dire(VG_VOIX.ascenseur); }
  },
  // un passage par échelle (fondu au noir)
  echelle(de, vers, modele, label, hh) {
    this.ch(de[0], de[1], de[2], { r: 0, modele: modele === 'trappe' ? VGM2.trappe : VGM2.echelle, hh, rayon: 0.7, h: 1.0, reste: true, prendre: () => this.grimper(vers) });
  },
  async grimper(vers) {
    if (this.grimpe) return;
    this.grimpe = true;
    const p = game.player;
    try {
      sound.step && sound.step('wood', 1);
      await ui.fade(true, '', 260);
      for (let i = 0; i < 3; i++) setTimeout(() => sound.step && sound.step('wood', 0.8), 150 + i * 220);
      const [x, z] = this.at(vers[0], vers[2]);
      p.pos = [x, this.f().y + vers[1] + 0.05, z]; p.vel = [0, 0, 0]; if (vers[3] !== undefined) p.yaw = vers[3];
      if (game.renderer) game.renderer.uploadCover(p.pos[0], p.pos[2]);
      await new Promise((r) => setTimeout(r, 600));
      await ui.fade(false, '', 360);
    } catch (e) { console.error(e); }
    this.grimpe = false;
  },
  // ------------------------------------------------------------- les machines
  basculer(cle, lpos) {
    const V = VG.S(), D = VG_MACH[cle], pos = lpos ? this.pos(...lpos) : null;
    if (!D) return;
    if (cle === 'coeur' && !V.m.coeur && (this.coeurRepos || 0) > 0) { VGSON.clic(pos, 0.6); ui.subtitle('', '(Le levier résiste. Le Cœur n’est pas encore froid.)', 3); return; }
    if (D.courant && !V.m.coeur) {
      VGSON.clic(pos, 0.6);
      if (!V.dits.courant_non) { V.dits.courant_non = 1; this.dire(VG_VOIX.courant_non); } else ui.subtitle('', '(Rien ne répond.)', 2);
      return;
    }
    V.m[cle] = V.m[cle] ? 0 : 1;
    VGSON.clic(pos, 1);
    if (V.m[cle]) VGSON.monte(pos, cle === 'coeur' ? 1.4 : 0.7, D.f0); else VGSON.descend(pos, cle === 'coeur' ? 1.4 : 0.7, D.f0 * 2);
    if (cle === 'coeur') this.coeurChange(!!V.m.coeur);
    const k = V.m[cle] ? D.voixOn : D.voixOff;
    if (k && VG_VOIX[k] && !V.dits[k]) { V.dits[k] = 1; setTimeout(() => this.dire(VG_VOIX[k]), cle === 'coeur' ? 2600 : 900); }
  },
  coeurChange(on) {
    const V = VG.S();
    if (on) { V.coeurT = 0; this.alerteDite = false; MSON.drone('vg_coeur', [36.7, 55.1, 73.4, 110.2], 0.045, 'sawtooth', 240); game.shakeT = Math.max(game.shakeT || 0, 0.4); }
    else { MSON.stopDrone('vg_coeur'); }
  },
  // ------------------------------------------------------------- lire, écouter, parler
  journal() {
    VGSON.clic(null, 0.8);
    const V = VG.S();
    const opts = VG_JOURNAL.map(([t, x], i) => ({ label: t, fn: () => { V.lus['j' + i] = 1; ui.read(t, x, 'Registre de la cité — lu par la veilleuse'); } }));
    for (const [t, x] of VG_ECRANS.seuil.pages) opts.push({ label: t, fn: () => ui.read(t, x, VG_ECRANS.seuil.titre) });
    opts.push({ label: 'Laisser l’écran', fn: () => ui.close() });
    ui.choice('L’écran du Seuil', VG_TEXTES.registre, opts);
  },
  lireEcran(cle) {
    const E = VG_ECRANS[cle];
    if (!E) return;
    VGSON.clic(null, 0.7);
    if (!this.courant()) { ui.read(E.titre, E.nuit + '\n\n' + VG_TEXTES.ecranNuit, ''); return; }
    const V = VG.S();
    const opts = E.pages.map(([t, x], i) => ({ label: t, fn: () => { V.lus[cle + i] = 1; ui.read(t, x, E.titre); } }));
    opts.push({ label: 'Laisser l’écran', fn: () => ui.close() });
    ui.choice(E.titre, '', opts);
  },
  message(cle) {
    const M = VG_MESSAGES[cle];
    if (!M || this.ecoute) return;
    this.ecoute = true;
    VG.S().lus['msg_' + cle] = 1;
    VGSON.gresille(null, 0.8);
    let t = 600;
    M.lignes.forEach((l) => { setTimeout(() => { if (mondes.cur === 'vaisseau') { VGSON.gresille(null, 0.4); if (sound.mumble && sound.ok) sound.mumble(({ ilaeth: 1.2, thalvor: 0.82, seriane: 1.32, mirelle: 1.12 })[cle] || 1, Math.min(60, l.length), 0, 0.35); ui.subtitle(M.qui, l, Math.min(9, 2.5 + l.length * 0.05)); } }, t); t += 2600 + l.length * 50; });
    setTimeout(() => { this.ecoute = false; }, t);
  },
  parler() {
    const V = VG.S();
    VGSON.voix();
    const opts = VG_QUESTIONS.map(([q, a], i) => ({ label: q, fn: () => { V.lus['q' + i] = 1; VGSON.voix(); ui.choice('La veilleuse', '« ' + a + ' »', [{ label: 'Autre chose', fn: () => this.parler() }, { label: 'Laisser la veilleuse', fn: () => ui.close() }]); } }));
    opts.push({ label: 'Laisser la veilleuse', fn: () => ui.close() });
    ui.choice(V.nommee ? 'La veilleuse' : 'Une petite lumière', VG_TEXTES.veilleuse, opts);
  },
  lunette() {
    const V = VG.S();
    sound.step && sound.step('hard', 0.4);
    ui.read('La lunette', VG_TEXTES.lunette + ((V.coeurTotal || 0) > 120 ? VG_TEXTES.lunetteTard : ''), 'l’Observatoire');
    if (!V.dits.volets) { V.dits.volets = 1; setTimeout(() => this.dire(VG_VOIX.volets), 3000); }
  },
  iorin() {
    const V = VG.S();
    ui.read('Le dernier berceau', VG_TEXTES.iorin + '\n\n' + VG_TEXTES.iorinTouche, '« Iorin. Sept ans. En attente. »');
    if (!V.dits.iorin) { V.dits.iorin = 1; setTimeout(() => this.dire(VG_VOIX.iorin), 2500); }
  },
  // ------------------------------------------------------------- chaque image
  update(dt, playing) {
    const V = VG.S(), p = game.player;
    this.lumK = (this.lumK || 0) + ((this.courant() ? 1 : 0) - (this.lumK || 0)) * Math.min(1, dt * 0.8);
    // les animations des machines (0..1)
    for (const k in VG_MACH) { const tg = this.marche(k) ? 1 : 0, sp = k === 'serre' ? (tg ? 0.025 : 0.2) : k === 'coeur' ? 0.5 : 1.2; const a = this.anim[k] || 0; this.anim[k] = a + clamp(tg - a, -dt * sp, dt * sp); }
    // les portes : elles s'ouvrent devant vous s'il y a du courant
    for (const D of this.portes || []) {
      const [lx, ly, lz] = this.local(p.pos), d = Math.hypot(lx - D.lx, lz - D.lz), pres = d < 3.4 && Math.abs(ly - D.ly) < 3;
      // (sans courant, une porte reste comme elle est : ouverte, on ne s'y retrouve jamais enfermé)
      const veut = this.courant() ? pres : D.ouvre;
      if (veut !== D.ouvre) { D.ouvre = veut; VGSON.souffle(this.pos(D.lx, D.ly + 1.5, D.lz), 0.6, 0.6); }
      D.k = clamp(D.k + (D.ouvre ? dt : -dt) * 1.8, 0, 1);
      D.bloc.y = D.k > 0.8 ? -1e4 : D.y0;
      if (pres && !this.courant() && !D.ouvre && d < 1.9) { if (!D.cogne) { D.cogne = true; this.porteFermee(D); } } else if (d > 3) D.cogne = false;
    }
    // les ascenseurs
    for (const A of this.ascs || []) {
      if (A.cible === null) continue;
      const v = this.courant() ? 2.6 : 1.3, dy = A.cible - A.y, st = clamp(dy, -v * dt, v * dt);
      const avant = A.y;
      A.y += st;
      const arrive = Math.abs(A.cible - A.y) < 0.01;
      if (arrive) A.y = A.cible;
      A.bloc.y = this.f().y + A.y - 0.3;
      A.c.y = this.f().y + A.y;
      if (A.porte) { // le joueur est dessus : il suit la plate-forme
        p.pos = [A.porte[0], this.f().y + A.y + 0.01, A.porte[1]]; p.vel = [0, 0, 0];
      }
      this.humT = (this.humT || 0) - dt;
      if (this.humT <= 0) { this.humT = 0.9; VGSON.la(this.pos(A.lx, A.y, A.lz), () => { const t = sound.at(0.01); sound.tone(t, 'sine', 98, 98, 1.0, 0.012, sound.sfx, 0.2); }); }
      if (arrive) { A.cible = null; A.porte = null; VGSON.coup(this.pos(A.lx, A.y, A.lz), 0.8); V.asc = V.asc || {}; V.asc[A.cle] = A.y; game.world.grid = null; }
      if (Math.abs(avant - A.yHaut) < 0.05 || arrive) this.majGarde(A);
    }
    // la voix parle, la première fois, dans chaque lieu
    if (playing && !cine.on) {
      this.zoneT = (this.zoneT || 0) - dt;
      if (this.zoneT <= 0) {
        this.zoneT = 0.5;
        const z = this.zone();
        if (z !== this.zoneCur) {
          this.zoneCur = z;
          if (z && !V.dits[z] && V.nommee && VG_VOIX[z]) { V.dits[z] = 1; setTimeout(() => { if (mondes.cur === 'vaisseau' && this.zone() === z) this.dire(VG_VOIX[z]); }, 900); }
        }
        // la première maison de l'équipage où l'on entre
        if (z === 'nef' && !V.dits.quartiers && V.nommee) {
          const [lx, , lz] = this.local(p.pos);
          if ((this.maisons || []).some((M) => lx > M.x0 + 0.3 && lx < M.x1 - 0.3 && lz > M.z0 + 0.3 && lz < M.z1 - 0.3)) { V.dits.quartiers = 1; setTimeout(() => this.dire(VG_VOIX.quartiers), 700); }
        }
      }
    }
    const zone = this.zoneCur;
    // la Brèche : sans le rideau, il n'y a plus d'air
    if (zone === 'breche' && !this.marche('rideau') && playing) {
      p.breath = Math.max(0, p.breath - dt * (1 / 3 + 1 / 18));
      if (!this.ditAir) { this.ditAir = true; setTimeout(() => { if (this.zoneCur === 'breche' && !this.marche('rideau')) this.dire(VG_VOIX.breche_sans_air, 3); }, 2500); }
      if (p.breath <= 0) { p.hp -= dt * 9; play.hurtFlash = Math.max(play.hurtFlash, 0.35); if (p.hp <= 0) game.die('Mort sans air, dans la Brèche'); }
      this.ventT = (this.ventT || 0) - dt;
      if (this.ventT <= 0) { this.ventT = 1.4; VGSON.la(this.pos(46, -14, 39.5), () => { const t = sound.at(0.01); sound.noiseHit(t, 1.6, 'bandpass', 520, 0.7, 0.05, sound.sfx, 380, 0.4); }); }
      if (Math.random() < dt * 30) { const [x, z] = this.at(26 + Math.random() * 20, 31 + Math.random() * 18); particles.spawn(x, this.f().y - 16 + 0.2 + Math.random() * 3, z, 3 + Math.random() * 3, 0, (this.at(48, 39.5)[1] - z) * 0.2, [0.6, 0.62, 0.66, 0.8], 0.04, 1.2, 0, false); }
    } else if (zone !== 'breche') this.ditAir = false;
    // la pesanteur légère dans la Nef
    p.mods.grav = zone === 'nef' && this.marche('gravite') ? 0.42 : 1;
    if (zone === 'nef' && (this.anim.gravite || 0) > 0.5 && Math.random() < dt * 14) { const a = Math.random() * TAU, d = 2 + Math.random() * 10; particles.spawn(p.pos[0] + Math.cos(a) * d, p.pos[1] + Math.random() * 1.5, p.pos[2] + Math.sin(a) * d, 0, 0.25 + Math.random() * 0.3, 0, [0.75, 0.8, 0.9, 0.7], 0.035, 4, -0.02, true); }
    // le Cœur : il ne doit pas brûler trop longtemps
    if (V.m.coeur) {
      V.coeurT = (V.coeurT || 0) + dt; V.coeurTotal = (V.coeurTotal || 0) + dt;
      if (V.coeurT > VG_COEUR_ALERTE && !this.alerteDite) { this.alerteDite = true; this.dire(VG_VOIX.nuit1); }
      if (V.coeurT > VG_COEUR_MAX) {
        V.m.coeur = 0; this.coeurChange(false); this.coeurRepos = 25;
        VGSON.descend(this.pos(0, -12, 42), 1.6, 72); game.shakeT = Math.max(game.shakeT || 0, 0.5);
        setTimeout(() => this.dire(VG_VOIX.nuit2), 1200);
      }
    } else if ((this.coeurRepos || 0) > 0) this.coeurRepos -= dt;
    this.etoilesK = 1 - 0.55 * clamp((V.m.coeur ? V.coeurT || 0 : 0) / VG_COEUR_MAX, 0, 1);
    // la faim vient, lentement (le temps de la vallée est suspendu, pas votre ventre)
    if (playing && !cine.on) {
      p.food = Math.max(0, p.food - dt * 0.012);
      if (p.food < 15 && !this.ditFaim) { this.ditFaim = true; ui.subtitle('', '(Vous avez faim. Ici, rien ne passe, sauf la faim.)', 4.5); }
      if (p.food > 25) this.ditFaim = false;
      if (p.food <= 0) { p.hp -= dt * 0.08; if (p.hp <= 0) game.die('Mort de faim, dans la cité'); }
    }
    // les bruits des machines
    this.sonT = (this.sonT || 2) - dt;
    if (this.sonT <= 0) {
      this.sonT = 2.2 + Math.random() * 2.5;
      if (this.marche('fontaine') && zone === 'nef') VGSON.la(this.pos(0, 1, 40), () => { const t = sound.at(0.01); sound.noiseHit(t, 2.4, 'bandpass', 1800, 0.6, 0.025, sound.sfx, 1400, 0.5); });
      if (this.marche('serre') && zone === 'jardins') VGSON.bruine(this.pos(-49, 2.2, 56), 0.8);
      if (this.marche('gravite') && zone === 'nef') VGSON.la(this.pos(0, 1.5, 62), () => { const t = sound.at(0.01); sound.tone(t, 'sine', 140, 128, 2.0, 0.012, sound.sfx, 0.5); });
      if ((this.anim.holo_nef > 0.5 && zone === 'nef') || (this.anim.holo_ciel > 0.5 && zone === 'archives') || (this.anim.holo_ilaeth > 0.5 && zone === 'observatoire')) VGSON.gresille(null, 0.35);
      if (Math.random() < 0.18) VGSON.la(null, () => { const t = sound.at(0.01); sound.tone(t, 'sine', 55 + Math.random() * 20, 50, 1.6, 0.012, sound.sfx, 0.4); sound.noiseHit(t + 0.3, 0.5, 'bandpass', 900, 3, 0.008, sound.sfx); }); // la coque qui travaille
    }
  },
});
