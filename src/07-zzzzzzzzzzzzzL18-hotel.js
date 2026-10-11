// ============================================================================
//  LE GRAND HÔTEL DES CIMES (agent L18, dix-huitième vague) — matière et modèles
//  Une seule matière (le jeu en a 64 au plus) : la façade du palace, une pierre
//  de taille crème, en assises, percée d'une haute porte-fenêtre à persiennes et
//  à garde-corps de fer (une travée de 4 m, la fenêtre au milieu de la tuile :
//  un mur de 4 m de haut posé sur son plancher montre une rangée de fenêtres).
//  Les objets posés de l'hôtel (l18_*) : lustres, appliques, la loge du concierge
//  et son tableau de clés, le tableau des sonnettes (treize sonnettes), les
//  portes closes des chambres, le piano, les tables nappées, les palmiers, les
//  canapés, les malles, la longue-vue de la terrasse, les lettres du toit, la
//  voiture, la cabine du funiculaire (dessinée à chaque image), le chariot à
//  bagages, les casiers à vin, la chaudière, les meubles sous leurs draps.
// ============================================================================

// ---------------------------------------------------------------- la façade
function texL18Facade(seed) {
  const P = ramp(['#9c9280', '#aca290', '#bab09c', '#c6bda8', '#d1c9b4', '#dbd4c0', '#e4ddcb']);
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed), rnd = mulberry32(seed + 5);
  // les assises (16 px = 0,5 m), joints décalés d'une assise à l'autre
  for (let y = 0; y < TS; y++) {
    const row = Math.floor(y / 16), ly = y % 16, off = row % 2 ? 24 : 0;
    for (let x = 0; x < TS; x++) {
      const bx = ((x + off) % 48 + 48) % 48, id = row * 8 + Math.floor(((x + off) % TS) / 48);
      if (ly === 15 || bx === 0) { pb.set(x, y, [118, 110, 96]); continue; }
      let v = 0.62 + (hash2i(id, 7, seed) - 0.5) * 0.16 + (tileFbm(tn, x / 10, y / 10, 12.8, 3) - 0.5) * 0.22;
      if (ly === 0) v += 0.06;
      if (ly === 14) v -= 0.07;
      pb.set(x, y, rampPick(P, v, x, y));
    }
  }
  // un bandeau mouluré en haut de la tuile (le haut de l'étage)
  for (let y = 0; y < 7; y++) for (let x = 0; x < TS; x++) pb.set(x, y, rampPick(P, y === 0 ? 0.35 : y === 1 ? 0.9 : y === 5 ? 0.3 : 0.7 - y * 0.03, x, y));
  // la porte-fenêtre, centrée sur la colonne 0 (la tuile boucle) : 42 px de large, de y 26 à 100
  const glass = ramp(['#141c26', '#1c2834', '#263646', '#34485c', '#4a627a']);
  const cadre = ramp(['#8a8272', '#a09684', '#b6ac98', '#ccc2ac']);
  const pers = ramp(['#3e4a42', '#4a584e', '#56665a', '#627466']);
  const X = (dx) => ((dx % TS) + TS) % TS;
  const top = 26, bot = 100, hw = 21;
  for (let y = top - 6; y <= bot + 2; y++) for (let dx = -hw - 5; dx <= hw + 4; dx++) {
    const enc = Math.abs(dx + 0.5) > hw || y < top || y > bot;
    if (enc) pb.setW(X(dx), y, rampPick(cadre, 0.55 + (y < top ? 0.15 : 0) - Math.abs(dx) * 0.004 + (hash2i(dx & 7, y >> 2, seed) - 0.5) * 0.2, X(dx), y));
  }
  for (let y = top; y <= bot; y++) for (let dx = -hw; dx < hw; dx++) {
    const ax = Math.abs(dx + 0.5);
    const bois = ax < 1.5 || ax > hw - 2 || (y - top) % 22 < 2 || y > bot - 3; // le montant du milieu, les petits-bois
    const reflet = ((dx + y) % 23 + 23) % 23 < 4 && y < bot - 20;
    pb.setW(X(dx), y, bois ? [214, 208, 192] : rampPick(glass, 0.25 + (reflet ? 0.55 : 0) + (y - top) / (bot - top) * 0.18, X(dx), y));
  }
  // les persiennes repliées, de chaque côté
  for (const s of [-1, 1]) for (let y = top - 1; y <= bot + 1; y++) for (let k = 0; k < 11; k++) {
    const dx = s < 0 ? -hw - 6 - k : hw + 5 + k;
    pb.setW(X(dx), y, rampPick(pers, (y % 4 === 0 ? 0.15 : 0.6) + (k === 0 || k === 10 ? -0.2 : 0), X(dx), y));
  }
  // la clé de linteau, au-dessus
  for (let y = top - 14; y < top - 5; y++) for (let dx = -4 + Math.floor((y - top + 14) / 3); dx <= 3 - Math.floor((y - top + 14) / 3) + 0; dx++) pb.setW(X(dx), y, rampPick(cadre, 0.8, X(dx), y));
  // le garde-corps de fer forgé, en bas de la fenêtre
  for (let y = bot - 16; y <= bot; y++) for (let dx = -hw - 2; dx < hw + 2; dx++) {
    const bar = y === bot - 16 || y === bot - 15 || y === bot || (dx % 4 === 0) || (y === bot - 8 && dx % 2 === 0) || (((dx + y) % 8 + 8) % 8 === 0 && y > bot - 12);
    if (bar) pb.setW(X(dx), y, [38, 36, 34]);
  }
  // l'appui, sous la fenêtre
  for (let y = bot + 1; y <= bot + 4; y++) for (let dx = -hw - 6; dx <= hw + 5; dx++) pb.setW(X(dx), y, rampPick(cadre, y === bot + 1 ? 0.95 : 0.4, X(dx), y));
  // quelques coulures sous l'appui
  for (let k = 0; k < 6; k++) { const dx = Math.floor(rnd() * 40) - 20; for (let y = bot + 5; y < bot + 5 + 6 + Math.floor(rnd() * 12); y++) pb.shade(X(dx), y, 0.9, true); }
  return pb;
}
const M_L18_FACADE = MATERIALS.push({ id: 'l18_facade', name: 'Façade du Grand Hôtel', scale: 4, gen: () => texL18Facade(1801) }) - 1;
BLOCK_MATS.push(M_L18_FACADE);

// ---------------------------------------------------------------- couleurs
const L18C = {
  laiton: rgbf('#c8a048'), or: rgbf('#d8b050'), fer: rgbf('#3a3a3e'), nappe: rgbf('#ece6d8'), velours: rgbf('#7a2430'), vert: rgbf('#2e4a38'),
  acajou: rgbf('#5a3020'), noir: [0.04, 0.04, 0.05], flamme: [1.5, 1.05, 0.5], verre: [1.25, 1.05, 0.75], blanc: rgbf('#f0ece2'), drap: rgbf('#d8d4c8'),
  rouge: rgbf('#8a2a24'), bleu: rgbf('#2a3a5a'), creme: rgbf('#e4dcc6'), cuivre: rgbf('#b0683a'), feuille: rgbf('#3e6a34'), tuile: rgbf('#6a6a72'),
};

// ---------------------------------------------------------------- les lettres du toit (une police de 5 × 7)
const L18_POLICE = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'], C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'], E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  G: ['01111', '10000', '10000', '10011', '10001', '10001', '01111'], H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'], L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'], N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'], R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'], T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  Ô: ['00100', '01010', '01110', '10001', '10001', '10001', '01110'], ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
};
const L18_ENSEIGNE = 'GRAND HÔTEL DES CIMES';

// ---------------------------------------------------------------- objets posés
Object.assign(PROP_MODELS, {
  // un lustre de cristal et de laiton, pendu au plafond (l'objet est posé au plafond ; il descend)
  l18_lustre(E, o) {
    const g = (o.data && o.data.g) || 1;
    E.bx(0, -0.5 * g, 0, 0.04, 0.5 * g, 0.04, L18C.laiton, TL.gold);
    E.bx(0, -0.62 * g, 0, 0.22 * g, 0.14 * g, 0.22 * g, L18C.laiton, TL.gold);
    for (let k = 0; k < 8; k++) {
      const a = k / 8 * TAU, r = 0.55 * g;
      E.box(Math.sin(a) * r / 2, -0.7 * g, Math.cos(a) * r / 2, 0.03, 0.03, r, L18C.laiton, TL.gold, a);
      E.bx(Math.sin(a) * r, -0.76 * g, Math.cos(a) * r, 0.07, 0.08, 0.07, L18C.laiton, TL.gold);
      E.fl = FX_EMIT; E.bx(Math.sin(a) * r, -0.68 * g, Math.cos(a) * r, 0.04, 0.09, 0.04, L18C.flamme, TL.flame); E.fl = 0;
      E.bx(Math.sin(a + 0.4) * r * 0.7, -0.98 * g, Math.cos(a + 0.4) * r * 0.7, 0.05, 0.16, 0.05, L18C.verre, TL.glass);
    }
    E.fl = FX_EMIT; E.bx(0, -1.05 * g, 0, 0.16 * g, 0.36 * g, 0.16 * g, L18C.verre, TL.glass); E.fl = 0;
  },
  // le grand lustre de la salle de bal (le même, plus grand, plus lumineux)
  l18_grand_lustre(E, o) { PROP_MODELS.l18_lustre(E, o); },
  // une applique : un bras de laiton, un globe dépoli
  l18_applique(E) {
    E.bx(0, -0.12, -0.04, 0.12, 0.24, 0.04, L18C.laiton, TL.gold);
    E.bx(0, 0, 0.08, 0.03, 0.03, 0.2, L18C.laiton, TL.gold);
    E.fl = FX_EMIT; E.bx(0, 0.02, 0.2, 0.15, 0.2, 0.15, L18C.verre, TL.glass); E.fl = 0;
  },
  // une porte de chambre qu'on n'ouvre pas : le numéro de laiton, la poignée, le seuil
  l18_porte_close(E, o) {
    E.bx(0, 0, 0, 1.02, 2.22, 0.08, WHITE, tx(TL.darkwood, TL.portePanneau));
    E.bx(0, 2.22, 0, 1.2, 0.12, 0.12, WHITE, TL.wood);
    for (const s of [-1, 1]) E.bx(s * 0.56, 0, 0, 0.1, 2.3, 0.12, WHITE, TL.wood);
    E.bx(0, 1.62, 0.05, 0.22, 0.12, 0.02, L18C.laiton, TL.gold);
    E.bx(0.38, 1.0, 0.06, 0.05, 0.05, 0.06, L18C.laiton, TL.gold);
    if (o.data && o.data.dnd) E.box(0.38, 0.82, 0.07, 0.12, 0.18, 0.01, L18C.blanc, TL.paper);
  },
  // la loge du concierge : un comptoir d'acajou en fer à cheval, le registre, la sonnette, le casier aux clés
  l18_loge(E) {
    E.bx(0, 0, 0, 3.2, 1.05, 0.7, WHITE, tx(TL.darkwood, TL.meuSculpte));
    E.bx(0, 1.05, 0, 3.32, 0.06, 0.82, L18C.acajou, TL.wood);
    for (const s of [-1, 1]) { E.bx(s * 1.9, 0, -0.55, 0.7, 1.05, 1.8, WHITE, TL.darkwood); E.bx(s * 1.9, 1.05, -0.55, 0.82, 0.06, 1.92, L18C.acajou, TL.wood); }
    E.bx(-0.6, 1.11, 0.05, 0.42, 0.06, 0.3, rgbf('#5a2a24'), TL.leather); E.bx(-0.6, 1.17, 0.05, 0.4, 0.02, 0.28, WHITE, TL.paper);
    E.bx(0.7, 1.11, 0.15, 0.1, 0.06, 0.1, L18C.laiton, TL.gold); E.bx(0.7, 1.17, 0.15, 0.04, 0.04, 0.04, L18C.laiton, TL.gold);
    E.fl = FX_EMIT; E.bx(1.3, 1.11, -0.1, 0.12, 0.3, 0.12, [1.2, 1.0, 0.65], TL.glass); E.fl = 0;
  },
  // le casier aux clés : des cases, des clés qui pendent (une case vide : la treize)
  l18_casier(E) {
    E.bx(0, 0, 0, 2.6, 2.3, 0.3, WHITE, TL.darkwood);
    for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) {
      const x = -1.12 + c * 0.32, y = 0.35 + r * 0.38;
      E.bx(x, y, 0.13, 0.28, 0.32, 0.04, [0.18, 0.14, 0.1], TL.plain);
      if ((r * 8 + c) % 7 !== 3) { E.bx(x, y + 0.1, 0.16, 0.03, 0.16, 0.02, L18C.laiton, TL.gold); E.bx(x, y + 0.02, 0.16, 0.08, 0.06, 0.02, L18C.rouge, TL.leather); }
    }
    E.bx(0, 2.3, 0, 2.8, 0.14, 0.36, WHITE, TL.wood);
  },
  // le tableau des sonnettes : treize timbres de cuivre sur une planche (la dernière, sans numéro)
  l18_sonnettes(E, o, t) {
    E.bx(0, 0, 0, 1.6, 0.9, 0.08, WHITE, TL.darkwood);
    const vibre = o.data && o.data.vibre && t ? Math.sin(t.t * 60) * 0.02 : 0;
    for (let k = 0; k < 13; k++) {
      const x = -0.66 + (k % 7) * 0.22, y = k < 7 ? 0.62 : 0.26, dern = k === 12;
      E.bx(x + (dern ? vibre : 0), y, 0.06, 0.12, 0.12, 0.06, dern ? rgbf('#7a5a3a') : L18C.cuivre, TL.gold);
      E.bx(x, y - 0.12, 0.05, 0.1, 0.06, 0.02, dern ? L18C.noir : L18C.blanc, TL.paper);
    }
  },
  // le piano à queue
  l18_piano(E, o) {
    E.bx(0, 0.62, 0, 1.5, 0.34, 2.0, L18C.noir, TL.darkwood);
    E.bx(0.2, 0.62, 1.0, 1.1, 0.34, 0.5, L18C.noir, TL.darkwood);
    E.box(-0.1, 1.3, 0.1, 1.3, 0.02, 1.6, L18C.noir, TL.darkwood, 0, -0.55);
    E.bx(0, 0.85, -1.12, 1.4, 0.06, 0.26, WHITE, TL.plain);
    for (let k = 0; k < 18; k++) E.bx(-0.64 + k * 0.075, 0.91, -1.08, 0.025, 0.02, 0.12, L18C.noir, TL.plain);
    for (const [x, z] of [[-0.6, -0.8], [0.6, -0.8], [0.3, 1.1]]) E.bx(x, 0, z, 0.1, 0.62, 0.1, L18C.noir, TL.darkwood);
    E.bx(0, 0.96, -1.18, 0.6, 0.3, 0.02, L18C.creme, TL.paper);
    if (!o.data || !o.data.sansBanc) E.bx(0, 0, -1.65, 0.8, 0.48, 0.36, L18C.noir, TL.darkwood);
  },
  // une table ronde nappée de blanc (un couvert, un bougeoir)
  l18_table(E, o) {
    E.bx(0, 0, 0, 0.14, 0.72, 0.14, WHITE, TL.darkwood);
    E.bx(0, 0, 0, 0.6, 0.05, 0.6, WHITE, TL.darkwood);
    E.bx(0, 0.72, 0, 1.12, 0.04, 1.12, L18C.nappe, TL.cloth);
    E.bx(0, 0.72, 0, 1.18, 0.04, 1.06, L18C.nappe, TL.cloth, Math.PI / 4);
    E.bx(0, 0.5, 0, 1.06, 0.24, 1.06, L18C.nappe, TL.cloth);
    for (const s of [-1, 1]) { E.bx(s * 0.3, 0.76, 0, 0.2, 0.01, 0.2, WHITE, TL.plain); E.bx(s * 0.3, 0.76, 0.16, 0.02, 0.01, 0.1, L18C.laiton, TL.metal); }
    E.bx(0, 0.76, 0, 0.05, 0.16, 0.05, L18C.laiton, TL.gold);
    if (o.data && o.data.fleurs) E.bx(0, 0.76, -0.25, 0.12, 0.2, 0.12, WHITE, TL.flowers);
  },
  // un palmier en caisse
  l18_palmier(E) {
    E.bx(0, 0, 0, 0.6, 0.55, 0.6, WHITE, TL.wood); E.bx(0, 0.55, 0, 0.5, 0.05, 0.5, WHITE, TL.soil);
    E.bx(0, 0.55, 0, 0.08, 1.2, 0.08, WHITE, TL.bark);
    for (let k = 0; k < 7; k++) { const a = k / 7 * TAU; E.box(Math.sin(a) * 0.45, 1.65, Math.cos(a) * 0.45, 0.18, 0.03, 0.95, L18C.feuille, TL.leaves, a, 0.5); }
  },
  // un canapé de velours
  l18_canape(E, o) {
    const c = o.data && o.data.col ? rgbf(o.data.col) : L18C.velours;
    E.bx(0, 0, 0, 1.9, 0.42, 0.8, c, TL.meuVelours); E.bx(0, 0.42, -0.32, 1.9, 0.5, 0.16, c, TL.meuVelours);
    for (const s of [-1, 1]) E.bx(s * 0.92, 0.42, 0, 0.14, 0.22, 0.8, c, TL.meuVelours);
    for (const s of [-1, 1]) E.bx(s * 0.85, -0.0, 0.32, 0.06, 0.08, 0.06, WHITE, TL.darkwood);
  },
  // des malles et des valises, en pile
  l18_malles(E, o) {
    const k = (o.data && o.data.n) || 3;
    E.bx(0, 0, 0, 0.9, 0.5, 0.55, rgbf('#5a3a24'), TL.leather);
    E.bx(0, 0.18, 0.28, 0.9, 0.04, 0.02, L18C.laiton, TL.metal);
    if (k > 1) E.bx(0.05, 0.5, 0, 0.7, 0.32, 0.45, rgbf('#2a3a4a'), TL.leather, 0.15);
    if (k > 2) E.bx(-0.05, 0.82, 0.02, 0.5, 0.24, 0.32, rgbf('#7a5a3a'), TL.leather, -0.2);
  },
  // le chariot à bagages de laiton
  l18_chariot(E) {
    E.bx(0, 0.2, 0, 0.8, 0.05, 1.2, rgbf('#8a2a24'), TL.cloth);
    for (const s of [-1, 1]) { E.bx(s * 0.38, 0.2, 0.55, 0.04, 1.5, 0.04, L18C.laiton, TL.gold); E.bx(s * 0.38, 0.2, -0.55, 0.04, 1.5, 0.04, L18C.laiton, TL.gold); }
    E.bx(0, 1.68, 0, 0.84, 0.05, 1.2, L18C.laiton, TL.gold);
    for (const [x, z] of [[-0.35, 0.5], [0.35, 0.5], [-0.35, -0.5], [0.35, -0.5]]) E.bx(x, 0, z, 0.06, 0.18, 0.18, L18C.noir, TL.plain);
    E.bx(0, 0.25, 0.1, 0.6, 0.4, 0.4, rgbf('#5a3a24'), TL.leather);
  },
  // la longue-vue de la terrasse, sur son trépied
  l18_longue_vue(E) {
    for (let k = 0; k < 3; k++) { const a = k / 3 * TAU; E.box(Math.sin(a) * 0.2, 0.6, Math.cos(a) * 0.2, 0.04, 1.25, 0.04, L18C.laiton, TL.gold, a, 0.3); }
    E.box(0, 1.28, 0.1, 0.11, 0.11, 0.9, L18C.laiton, TL.gold, 0, -0.18);
    E.box(0, 1.36, 0.52, 0.15, 0.15, 0.08, L18C.laiton, TL.gold, 0, -0.18);
  },
  // les lettres du toit : GRAND HÔTEL DES CIMES, sur une armature de fer (data.l : largeur d'un pixel)
  l18_enseigne(E, o) {
    const p = (o.data && o.data.p) || 0.34, txt = L18_ENSEIGNE, W = txt.length * 6 * p;
    E.bx(0, 0, 0, W, 0.12, 0.12, L18C.fer, TL.iron);
    for (let k = 0; k <= 10; k++) { const x = -W / 2 + k * W / 10; E.bx(x, 0, 0, 0.08, 0.6, 0.08, L18C.fer, TL.iron); E.box(x, 0.6, -0.4, 0.06, 0.06, 0.9, L18C.fer, TL.iron, 0, 0.7); }
    let x0 = -W / 2;
    for (const ch of txt) {
      const G = L18_POLICE[ch] || L18_POLICE[' '];
      for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) if (G[r][c] === '1') {
        E.fl = (o.data && o.data.nuit) ? FX_EMIT : 0;
        E.bx(x0 + (c + 0.5) * p, 0.6 + (6 - r) * p, 0, p * 0.92, p * 0.92, 0.14, L18C.or, TL.gold);
        E.fl = 0;
      }
      x0 += 6 * p;
    }
  },
  // la voiture de l'hôtel (une calèche à capote, vernie de vert bouteille, les armes des Cimes sur la portière)
  l18_voiture(E) {
    E.bx(0, 0.75, 0, 1.4, 0.7, 2.2, L18C.vert, TL.darkwood);
    E.bx(0, 1.45, -0.55, 1.36, 0.5, 1.0, L18C.noir, TL.leather);
    E.box(0, 1.95, -0.5, 1.36, 0.08, 1.0, L18C.noir, TL.leather);
    E.bx(0, 1.45, 0.9, 1.2, 0.2, 0.4, L18C.vert, TL.darkwood);
    for (const s of [-1, 1]) {
      E.bx(s * 0.71, 0.95, 0, 0.02, 0.3, 0.3, L18C.or, TL.gold);
      for (const z of [-0.8, 0.9]) { E.box(s * 0.8, 0.55, z, 0.08, 1.1, 1.1, L18C.noir, TL.darkwood, 0, 0, 0); E.box(s * 0.8, 0.55, z, 0.09, 0.12, 0.12, L18C.laiton, TL.gold); }
    }
    E.bx(0, 0.6, 1.9, 0.08, 0.08, 2.0, L18C.acajou, TL.wood);
    for (const s of [-0.4, 0.4]) E.bx(s, 0.62, 2.0, 0.06, 0.06, 1.8, L18C.acajou, TL.wood);
  },
  // la cabine du funiculaire (dessinée à chaque image ; data.a : la pente)
  l18_cabine(E, o) {
    const a = (o.data && o.data.a) || 0.24;
    const c = Math.cos(a), s = Math.sin(a);
    // le châssis suit la pente ; la caisse est en gradins (trois compartiments)
    E.box(0, 0.35, 0, 2.2, 0.25, 6.2, L18C.fer, TL.iron, 0, -a);
    for (let k = -1; k <= 1; k++) {
      const z = k * 2.0, y = 0.5 - z * s;
      E.bx(0, y, z * c, 2.3, 2.3, 1.95, rgbf('#7a2a24'), TL.wood);
      E.bx(0, y + 2.3, z * c, 2.42, 0.12, 2.05, L18C.creme, TL.wood);
      for (const sx of [-1, 1]) { E.fl = FX_EMIT; E.bx(sx * 1.16, y + 1.1, z * c, 0.02, 0.8, 1.5, [0.55, 0.5, 0.42], TL.glass); E.fl = 0; }
    }
    for (const z of [-2.6, -0.9, 0.9, 2.6]) E.box(0, 0.12 - z * s, z * c, 1.6, 0.3, 0.3, L18C.noir, TL.iron, 0, 0, 0);
    E.bx(0, 3.0 + 2 * s, -2 * c, 0.9, 0.3, 0.12, L18C.or, TL.gold);
  },
  // un casier à bouteilles (la cave)
  l18_casier_vin(E) {
    E.bx(0, 0, 0, 2.0, 2.0, 0.5, WHITE, TL.darkwood);
    for (let r = 0; r < 6; r++) for (let c = 0; c < 9; c++) if ((r * 9 + c) % 5) E.bx(-0.88 + c * 0.22, 0.18 + r * 0.31, 0.24, 0.08, 0.08, 0.04, rgbf((r + c) % 3 ? '#2a3a22' : '#4a2a22'), TL.glass);
  },
  // la chaudière du chauffage central (la fierté de l'hôtel, depuis 1882)
  l18_chaudiere(E, o, t) {
    E.bx(0, 0, 0, 1.6, 1.8, 2.2, L18C.fer, TL.iron);
    E.bx(0, 1.8, 0, 1.3, 0.3, 1.9, L18C.fer, TL.iron);
    E.bx(0, 2.1, 0.6, 0.3, 1.6, 0.3, L18C.fer, TL.iron);
    E.bx(0, 0.3, 1.11, 0.5, 0.4, 0.02, L18C.laiton, TL.gold);
    E.fl = FX_EMIT; E.bx(0, 0.35, 1.12, 0.36, 0.28, 0.02, [1.4, 0.6, 0.2], TL.ember); E.fl = 0;
    E.bx(0.5, 1.4, 1.11, 0.2, 0.2, 0.04, L18C.laiton, TL.gold);
  },
  // un meuble sous son drap (l'aile fermée)
  l18_drap(E, o) {
    const h = (o.data && o.data.h) || 1.0, w = (o.data && o.data.w) || 1.2;
    E.bx(0, 0, 0, w, h, 0.7, L18C.drap, TL.cloth);
    E.bx(0, h, 0, w * 0.8, 0.12, 0.55, L18C.drap, TL.cloth);
    E.bx(0, 0, 0, w + 0.1, 0.06, 0.8, L18C.drap, TL.cloth);
  },
  // une corbeille de fleurs fraîches (le hall)
  l18_bouquet(E) {
    E.bx(0, 0, 0, 0.5, 0.75, 0.5, L18C.creme, TL.stone);
    E.bx(0, 0.75, 0, 0.7, 0.4, 0.7, WHITE, TL.flowers); E.bx(0, 1.05, 0, 0.45, 0.25, 0.45, WHITE, TL.flowers, 0.6);
  },
  // le pupitre du chef d'orchestre, et des pupitres de musiciens (la salle de bal)
  l18_pupitre(E) {
    E.bx(0, 0, 0, 0.04, 1.1, 0.04, L18C.fer, TL.iron);
    E.box(0, 1.15, 0.02, 0.5, 0.36, 0.02, L18C.fer, TL.iron, 0, 0.35);
    E.box(0, 1.17, 0.05, 0.4, 0.3, 0.01, L18C.creme, TL.paper, 0, 0.35);
  },
  // un plateau couvert (le repas de la treize)
  l18_plateau(E) {
    E.bx(0, 0, 0, 0.5, 0.03, 0.36, L18C.laiton, TL.metal);
    E.bx(0, 0.03, 0, 0.3, 0.12, 0.22, L18C.laiton, TL.metal); E.bx(0, 0.15, 0, 0.05, 0.04, 0.05, L18C.laiton, TL.metal);
  },
  // un panneau indicateur de fonte, ses deux bras
  l18_poteau(E) {
    E.bx(0, 0, 0, 0.1, 2.4, 0.1, L18C.fer, TL.iron);
    E.bx(0.55, 2.0, 0, 1.1, 0.28, 0.05, L18C.vert, TL.sign); E.bx(0.55, 2.0, 0.03, 0.9, 0.06, 0.01, L18C.or, TL.gold);
    E.bx(-0.45, 1.6, 0, 0.9, 0.24, 0.05, L18C.vert, TL.sign);
    E.bx(0, 2.4, 0, 0.16, 0.12, 0.16, L18C.or, TL.gold);
  },
});
// (la cabine du funiculaire et le tableau des sonnettes bougent : DYN_PROPS, dans 11-zzzzzzzL18-1-plan.js)
Object.assign(PROP_COLL, {
  l18_porte_close: [0.6, 0.08, 2.3], l18_loge: [1.75, 0.45, 1.1], l18_casier: [1.3, 0.16, 2.3], l18_sonnettes: null, l18_piano: [0.78, 1.05, 1.0],
  l18_table: [0.56, 0.56, 0.78], l18_palmier: [0.3, 0.3, 2], l18_canape: [0.95, 0.4, 0.9], l18_malles: [0.45, 0.28, 0.9], l18_chariot: [0.42, 0.62, 1.7],
  l18_longue_vue: [0.2, 0.2, 1.4], l18_enseigne: null, l18_voiture: [0.75, 1.3, 2.0], l18_cabine: null, l18_casier_vin: [1.0, 0.25, 2.0],
  l18_chaudiere: [0.8, 1.1, 2.2], l18_drap: [0.6, 0.35, 1.0], l18_bouquet: [0.25, 0.25, 1.2], l18_pupitre: null, l18_plateau: null, l18_poteau: [0.06, 0.06, 2.4],
  l18_lustre: null, l18_grand_lustre: null, l18_applique: null,
});
Object.assign(PROP_LIGHTS, {
  l18_lustre: { c: [1.05, 0.82, 0.52], r: 13, y: -0.9 },
  l18_grand_lustre: { c: [1.25, 0.98, 0.62], r: 22, y: -1.8 },
  l18_applique: { c: [1.0, 0.8, 0.5], r: 6.5, y: 0.05 },
  l18_chaudiere: { c: [1.0, 0.5, 0.2], r: 6, y: 0.4, flicker: true },
});
