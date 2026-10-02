// ============================================================================
//  LA CITÉ DES MAISONS-D'ÉTOILE (agent G, douzième vague) — matières, modèles
//  et icônes. La mécanique est dans 11-zzzzG-portail.js (la pierre ronde, dans
//  la vallée) et 11-zzzzG-vaisseau.js (la cité, monde « à part » 'vaisseau').
//  - quatre matières peintes : la coque (panneaux gris-bleu, joints, rivets),
//    les dalles du sol, la nacre des Aëlim (blanc nacré, veines irisées, traits
//    gravés), les panneaux de lumière ;
//  - les modèles (boîtes, style « 1996 ») : la pierre ronde (PROP_MODELS), et
//    les décors et machines de la cité (VGM : modèles des « choses » des mondes,
//    fn(E, c, t) — c.on : la machine marche) ;
//  - les icônes des objets 'vg_*'.
// ============================================================================

// ---------------------------------------------------------------- les matières
function texVgCoque(seed) {
  const pal = ramp(['#5e6876', '#6c7684', '#7a8594', '#8994a3', '#98a3b2', '#a7b2c0', '#b8c2ce']);
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed), rnd = mulberry32(seed + 7);
  const PW = 32, PH = 64; // panneaux de 32 × 64 px (une tuile = 4 × 2 panneaux)
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const px = x % PW, py = y % PH, col = Math.floor(x / PW), row = Math.floor(y / PH);
    let v = 0.52 + (hash2i(col, row, seed) - 0.5) * 0.14 + (tileFbm(tn, x / 16, y / 16, 8, 3) - 0.5) * 0.16 + (tn(x / 2, y / 2, 64) - 0.5) * 0.05;
    if (px === 0 || py === 0) v = 0.08;                 // joint
    else if (px === 1 || py === 1) v += 0.22;           // arête claire (lumière d'en haut à gauche)
    else if (px === PW - 1 || py === PH - 1) v -= 0.18; // arête sombre
    pb.set(x, y, rampPick(pal, v, x, y));
  }
  // rivets aux coins des panneaux
  for (let row = 0; row < TS / PH; row++) for (let col = 0; col < TS / PW; col++) for (const [dx, dy] of [[4, 4], [PW - 5, 4], [4, PH - 5], [PW - 5, PH - 5]]) {
    const x = col * PW + dx, y = row * PH + dy;
    pb.set(x, y, [212, 220, 230]); pb.set(x + 1, y + 1, [70, 78, 90]); pb.set(x + 1, y, [150, 158, 170]);
  }
  // un panneau sur huit porte une ligne gravée, en Hautes Lettres (des traits courts, verticaux)
  for (let k = 0; k < 2; k++) {
    const col = (rnd() * 4) | 0, row = (rnd() * 2) | 0, x0 = col * PW + 14;
    for (let y = row * PH + 10; y < row * PH + PH - 10; y += 3) if (rnd() < 0.75) { const l = 1 + ((rnd() * 4) | 0); for (let i = 0; i < l; i++) pb.set(x0 + i - 1, y, [72, 80, 92]); }
  }
  // traces, coulures, rayures
  for (let k = 0; k < 40; k++) { const x = (rnd() * TS) | 0, y = (rnd() * TS) | 0, l = 2 + ((rnd() * 6) | 0); for (let i = 0; i < l; i++) pb.shade(x, y + i, 0.86, true); }
  return pb;
}
function texVgDalle(seed) {
  const pal = ramp(['#262b32', '#2e343c', '#383f48', '#424a54', '#4d5661', '#59626e', '#66707c']);
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed);
  const S = 64;
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const lx = x % S, ly = y % S;
    let v = 0.42 + (tileFbm(tn, x / 16, y / 16, 8, 3) - 0.5) * 0.18 + (hash2i(Math.floor(x / S), Math.floor(y / S), seed) - 0.5) * 0.1;
    // relief en losanges (tôle striée)
    const a = (lx + ly) % 8, b = (lx - ly + 64) % 8;
    if ((a === 0 && (ly >> 2) % 2 === 0) || (b === 0 && (ly >> 2) % 2 === 1)) v += 0.2;
    if (lx === 0 || ly === 0) v = 0.05; else if (lx === 1 || ly === 1) v += 0.18;
    pb.set(x, y, rampPick(pal, v, x, y));
  }
  return pb;
}
function texVgNacre(seed) {
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const w = tileFbm(tn, x / 21.333, y / 21.333, 6, 3);
    const k = TAU / TS; // (tout est périodique sur la tuile : pas de couture)
    const band = Math.sin((y + w * 46) * k * 2 + x * k); // veines qui ondulent
    const ir = Math.sin(x * k * 2 + y * k + w * 5);
    let L = 205 + band * 14 + (tn(x / 2, y / 2, 64) - 0.5) * 10;
    const c = [L - 6 + ir * 7, L + 2 - ir * 3, L - 4 - ir * 6];
    // traits gravés : une frise de Hautes Lettres tous les 64 px
    if (y % 64 === 30 || y % 64 === 41) { c[0] *= 0.86; c[1] *= 0.88; c[2] *= 0.9; }
    if (y % 64 > 31 && y % 64 < 40 && (x % 6 === 0 || (x % 6 === 3 && hash2i(x >> 1, y >> 2, seed) > 0.5))) { c[0] *= 0.78; c[1] *= 0.8; c[2] *= 0.84; }
    pb.set(x, y, c);
  }
  return pb;
}
function texVgLueur(seed) {
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const ly = y % 32, lx = x % 64;
    let k = 0.86 + (tn(x / 8, y / 8, 16) - 0.5) * 0.06;
    if (ly < 2 || lx < 2) k = 0.42;                    // cadre
    else if (ly > 12 && ly < 19) k += 0.12;            // le tube, au milieu
    pb.set(x, y, [176 * k + 40, 208 * k + 30, 232 * k + 22]);
  }
  return pb;
}
const M_VG_COQUE = MATERIALS.push({ id: 'vg_coque', name: 'Coque de la cité', scale: 2, gen: () => texVgCoque(701) }) - 1;
const M_VG_DALLE = MATERIALS.push({ id: 'vg_dalle', name: 'Dalles de la cité', scale: 2, gen: () => texVgDalle(702) }) - 1;
const M_VG_NACRE = MATERIALS.push({ id: 'vg_nacre', name: 'Nacre des Aëlim', scale: 2.5, gen: () => texVgNacre(703) }) - 1;
const M_VG_LUEUR = MATERIALS.push({ id: 'vg_lueur', name: 'Panneau de lumière', scale: 2, gen: () => texVgLueur(704) }) - 1;

// ---------------------------------------------------------------- couleurs
const VGC = {
  coque: rgbf('#9aa4b2'), sombre: rgbf('#3a414c'), noir: [0.06, 0.07, 0.09], nacre: rgbf('#dfe6de'), os: rgbf('#d8d2c2'),
  verre: rgbf('#8ab4c8'), bleu: [0.45, 0.8, 1.35], bleuPale: [0.75, 0.95, 1.3], rouge: [1.3, 0.25, 0.15], ambre: [1.35, 0.9, 0.4],
  vert: [0.55, 1.25, 0.7], rose: [1.2, 0.5, 1.1], pierre: rgbf('#6a6a72'), pierreS: rgbf('#4a4a52'), mousse: rgbf('#5a6a44'),
};

// ---------------------------------------------------------------- l'anneau (la pierre ronde et le seuil de la cité)
// anneau debout dans le plan XY local, centre à la hauteur H, rayon moyen R, épaisseur ep, profondeur pr ;
// lumiere : 0 (éteint) .. 1 (allumé) ; t : temps (la lumière coule comme de l'eau)
function vgAnneau(E, H, R, ep, pr, col, code, lumiere, t, teinte) {
  const N = 18;
  for (let i = 0; i < N; i++) {
    const a = (i + 0.5) / N * TAU, L = 2 * R * Math.sin(Math.PI / N) + ep * 0.35;
    E.box(Math.cos(a) * R, H + Math.sin(a) * R, 0, L, ep, pr, col, code, 0, 0, a + Math.PI / 2);
  }
  if (lumiere <= 0.01) return;
  const fl0 = E.fl;
  E.fl = FX_EMIT;
  const Ri = R - ep * 0.5, n = 9, cs = Ri * 2 / n, T = teinte || [0.45, 0.8, 1.35];
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const x = -Ri + (i + 0.5) * cs, y = -Ri + (j + 0.5) * cs;
    if (x * x + y * y > Ri * Ri * 0.94) continue;
    const w = 0.55 + 0.45 * Math.sin(t * 1.3 + x * 1.7 - y * 2.2) * Math.sin(t * 0.7 - x * 0.9 + y * 1.3 + i * 0.2);
    const k = lumiere * (0.55 + 0.45 * w);
    E.box(x, H + y, 0, cs * 1.02, cs * 1.02, 0.04 + 0.04 * w, [T[0] * k, T[1] * k, T[2] * k], TL.plain);
  }
  E.fl = fl0;
}
// la pierre ronde de la vallée (objet posé ; data.morte : éteinte pour toujours) — l'anneau regarde vers +z local
PROP_MODELS.vg_pierre = function (E, o, T) {
  const t = (T && T.t) || 0, S = typeof vgPierreEtat === 'function' ? vgPierreEtat() : 0, morte = S >= 2;
  const col = morte ? VGC.pierreS : VGC.pierre;
  // le socle, à demi enterré, et deux pierres de calage
  E.bx(0, -0.3, 0, 2.6, 0.55, 1.3, VGC.pierreS, TL.stone);
  E.bx(-1.15, -0.2, 0.55, 0.7, 0.45, 0.6, VGC.pierreS, TL.stone, 0.4);
  E.bx(1.2, -0.2, -0.5, 0.6, 0.4, 0.55, VGC.pierreS, TL.stone, -0.3);
  vgAnneau(E, 1.85, 1.35, 0.62, 0.7, col, TL.stone, morte ? 0 : (T && T.night ? 1 : 0.7), t);
  // mousse sur le haut de l'anneau, lichens
  E.box(-0.3, 3.18, 0, 0.9, 0.12, 0.74, VGC.mousse, TL.leaves, 0, 0, 0.18);
  E.box(0.75, 2.95, 0.05, 0.5, 0.1, 0.72, VGC.mousse, TL.leaves, 0, 0, -0.5);
  // les traits gravés (Hautes Lettres) sur le flanc gauche de l'anneau
  for (let k = 0; k < 6; k++) E.box(-1.35, 1.25 + k * 0.17, 0.36, 0.14 - (k % 3) * 0.03, 0.035, 0.02, [0.22, 0.22, 0.25], TL.plain);
  if (morte) {
    // fêlée : un éclat manque en haut à droite, des fissures sombres
    E.box(0.95, 2.6, 0.36, 0.06, 0.7, 0.02, [0.12, 0.12, 0.14], TL.plain, 0, 0, 0.6);
    E.box(-0.7, 1.0, 0.36, 0.05, 0.5, 0.02, [0.12, 0.12, 0.14], TL.plain, 0, 0, -0.4);
  }
};
PROP_COLL.vg_pierre = [1.3, 0.62, 3.3];
// le caillou plat sous lequel quelqu'un a glissé un papier (un coin dépasse)
PROP_MODELS.vg_caillou = function (E) {
  E.bx(0, -0.05, 0, 0.62, 0.16, 0.48, VGC.pierre, TL.stone, 0.3);
  E.bx(0.22, -0.02, 0.2, 0.2, 0.012, 0.14, [0.86, 0.82, 0.7], TL.paper, 0.6);
};

// ---------------------------------------------------------------- les décors et machines de la cité
// fn(E, c, t) ; c.on : en marche ; c.k : avancement (0..1) d'une animation (porte, ascenseur, pousse)
const VGM = {
  // le seuil de la cité : l'anneau de nacre, sur une estrade
  seuil(E, c, t) {
    E.bx(0, 0, 0, 5.2, 0.3, 2.6, VGC.coque, mt(M_VG_DALLE));
    E.bx(0, 0.3, 0, 4.6, 0.12, 2.2, VGC.nacre, mt(M_VG_NACRE));
    vgAnneau(E, 2.35, 1.75, 0.5, 0.6, VGC.nacre, mt(M_VG_NACRE), typeof c.eclat === 'number' ? c.eclat : 1, t, [0.6, 0.9, 1.4]);
    // les deux bras qui tiennent l'anneau
    for (const s of [-1, 1]) { E.bx(s * 2.25, 0.3, 0, 0.3, 2.2, 0.5, VGC.coque, mt(M_VG_COQUE)); E.box(s * 2.0, 2.6, 0, 0.26, 0.9, 0.42, VGC.coque, mt(M_VG_COQUE), 0, 0, s * 0.5); }
  },
  // écran mural (un terminal) ; c.on : allumé (sinon la ligne de veille)
  ecran(E, c, t) {
    E.bx(0, 0, 0, 1.6, 1.05, 0.12, VGC.sombre, mt(M_VG_COQUE));
    E.fl = FX_EMIT;
    if (c.on) {
      E.bx(0, 0.08, 0.065, 1.42, 0.88, 0.01, [0.12, 0.32, 0.42], TL.plain);
      for (let k = 0; k < 7; k++) { const w = 0.3 + ((k * 37 + Math.floor(t * 0.7) * 13) % 9) / 9 * 0.9; E.bx(-0.62 + w / 2, 0.82 - k * 0.1, 0.072, w, 0.035, 0.01, [0.6, 0.95, 1.2], TL.plain); }
    } else {
      E.bx(0, 0.08, 0.065, 1.42, 0.88, 0.01, [0.03, 0.04, 0.06], TL.plain);
      const x = ((t * 0.35) % 1) * 1.3 - 0.65;
      E.bx(x, 0.16, 0.072, 0.12, 0.03, 0.01, c.rouge ? [1.2, 0.2, 0.1] : [0.4, 0.75, 1.3], TL.plain);
    }
    E.fl = 0;
  },
  // pupitre de commande (debout) : un plateau incliné, des voyants ; c.on : vert, sinon ambre
  pupitre(E, c, t) {
    E.bx(0, 0, 0, 0.7, 0.95, 0.5, VGC.coque, mt(M_VG_COQUE));
    E.box(0, 1.02, 0.02, 0.86, 0.08, 0.62, VGC.sombre, mt(M_VG_DALLE), 0, -0.4);
    E.fl = FX_EMIT;
    const on = !!c.on, b = 0.7 + 0.3 * Math.sin(t * (on ? 2 : 0.8) + (c.id || 0));
    for (let k = 0; k < 4; k++) E.box(-0.27 + k * 0.18, 1.08, 0.04 - (k % 2) * 0.08, 0.07, 0.03, 0.07, on ? (k === 1 ? [0.5 * b, 1.3 * b, 0.6 * b] : [0.4, 0.9, 1.2]) : (k === 1 ? [1.3 * b, 0.7 * b, 0.2 * b] : [0.18, 0.2, 0.24]), TL.plain, 0, -0.4);
    E.fl = 0;
    // le levier
    E.box(0.32, 1.1 + (on ? 0.12 : 0), -0.1, 0.05, 0.3, 0.05, VGC.nacre, TL.metal, 0, on ? -0.5 : 0.5);
  },
  // le Cœur : une colonne de verre où une lumière se plie sur elle-même ; anneaux qui tournent quand il marche
  coeur(E, c, t) {
    const on = c.k || 0;
    E.bx(0, 0, 0, 5, 0.6, 5, VGC.sombre, mt(M_VG_DALLE)); E.bx(0, 0.6, 0, 4.2, 0.3, 4.2, VGC.coque, mt(M_VG_COQUE));
    E.bx(0, 13.2, 0, 4.6, 0.8, 4.6, VGC.coque, mt(M_VG_COQUE));
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; E.box(Math.cos(a) * 1.75, 6.9, Math.sin(a) * 1.75, 0.18, 12.2, 0.18, VGC.coque, TL.metal, -a); }
    // le verre (des lames claires, un peu bleutées)
    for (let i = 0; i < 8; i++) { const a = (i + 0.5) / 8 * TAU; E.box(Math.cos(a) * 1.68, 6.9, Math.sin(a) * 1.68, 1.25, 12.2, 0.04, [0.55, 0.68, 0.78], TL.glass, -a + Math.PI / 2); }
    // la lumière pliée
    E.fl = FX_EMIT;
    if (on > 0.02) {
      for (let k = 0; k < 14; k++) {
        const y = 1.4 + k * 0.82, a = t * (0.6 + k * 0.05) * (k % 2 ? 1 : -1) + k * 0.7, r = 0.45 + 0.35 * Math.sin(t * 0.9 + k);
        const b = on * (0.8 + 0.3 * Math.sin(t * 3 + k * 1.3));
        E.box(Math.cos(a) * r, y, Math.sin(a) * r, 0.5, 0.5, 0.5, [0.7 * b, 0.95 * b, 1.4 * b], TL.plain, a, a * 0.5, k);
        E.box(-Math.cos(a) * r * 0.6, y + 0.4, -Math.sin(a) * r * 0.6, 0.3, 0.3, 0.3, [1.2 * b, 1.1 * b, 0.9 * b], TL.plain, -a, k, a);
      }
      // les anneaux qui tournent
      for (let j = 0; j < 3; j++) { const y = 3.5 + j * 3.6, a0 = t * (0.4 + j * 0.15) * (j % 2 ? -1 : 1); for (let i = 0; i < 12; i++) { const a = a0 + i / 12 * TAU; E.box(Math.cos(a) * 2.35, y, Math.sin(a) * 2.35, 0.55, 0.12, 0.2, [0.5 * on, 0.85 * on, 1.3 * on], TL.plain, -a); } }
    } else {
      const b = 0.5 + 0.5 * Math.sin(t * 0.6);
      E.box(0, 2.0, 0, 0.6, 0.6, 0.6, [0.5 * b + 0.1, 0.08, 0.04], TL.plain, t * 0.1); // la braise du fond
    }
    E.fl = 0;
  },
  // porte coulissante à deux battants ; c.k : 0 fermée .. 1 ouverte ; c.l : largeur ; c.h : hauteur
  porte(E, c) {
    const L = c.l || 2.4, H = c.h || 2.6, o = (c.k || 0) * L / 2;
    for (const s of [-1, 1]) {
      E.bx(s * (L / 4 + o), 0, 0, L / 2 - 0.02, H, 0.16, VGC.coque, mt(M_VG_COQUE));
      E.bx(s * (L / 4 + o) - s * (L / 4 - 0.08), 0.2, 0.09, 0.04, H - 0.4, 0.02, VGC.nacre, TL.metal);
    }
    E.fl = FX_EMIT; E.bx(0, H + 0.05, 0.1, 0.3, 0.06, 0.04, c.verrou ? VGC.rouge : [0.4, 1.1, 0.6], TL.plain); E.fl = 0;
  },
  // plateau d'ascenseur ; c.on : en marche (les feux du bord) — la plate-forme est dessinée là où elle est (c.y)
  ascenseur(E, c, t) {
    E.bx(0, -0.25, 0, 3.4, 0.25, 3.4, VGC.coque, mt(M_VG_DALLE));
    E.fl = FX_EMIT;
    const b = c.bouge ? 0.6 + 0.4 * Math.sin(t * 8) : 0.7;
    for (const [x, z] of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]]) E.bx(x, 0, z, 0.12, 0.05, 0.12, c.on ? [0.4 * b, 1.1 * b, 0.6 * b] : [1.0 * b, 0.55 * b, 0.15 * b], TL.plain);
    E.fl = 0;
    // la rambarde de trois côtés
    for (const s of [-1, 1]) E.bx(s * 1.65, 0, 0.2, 0.06, 1.0, 3.0, VGC.nacre, TL.metal);
    E.bx(0, 1.0, 1.65, 3.3, 0.06, 0.06, VGC.nacre, TL.metal);
    E.bx(0.9, 0, 1.6, 0.6, 1.05, 0.25, VGC.coque, mt(M_VG_COQUE)); // la borne d'appel
  },
  // la serre : un bac de culture ; c.k : pousse (0..1) ; c.on : la lumière de croissance
  bac(E, c, t) {
    E.bx(0, 0, 0, 1.2, 0.75, 5.6, VGC.coque, mt(M_VG_COQUE));
    E.bx(0, 0.75, 0, 1.05, 0.05, 5.45, [0.22, 0.17, 0.12], TL.soil);
    const g = c.k || 0, mort = !c.vivant && g < 0.05;
    for (let i = 0; i < 7; i++) {
      const z = -2.4 + i * 0.8, h = mort ? 0.12 : 0.15 + g * (0.6 + ((i * 7) % 3) * 0.15);
      E.bx(0, 0.8, z, 0.1, h, 0.1, mort ? [0.45, 0.4, 0.3] : [0.35, 0.6, 0.3], TL.leaves);
      if (!mort && g > 0.2) { E.box(0.12, 0.8 + h * 0.7, z, 0.36 * g, 0.18 * g, 0.3 * g, [0.42, 0.72, 0.36], TL.leaves, i); E.box(-0.1, 0.8 + h * 0.5, z + 0.1, 0.3 * g, 0.16 * g, 0.26 * g, [0.38, 0.66, 0.32], TL.leaves, -i); }
      if (!mort && g > 0.85 && i % 2 === 0) E.bx(0.14, 0.8 + h * 0.75, z, 0.16, 0.18, 0.16, [0.86, 0.9, 0.6], TL.plain);
    }
    // la rampe de lumière au-dessus
    E.bx(0, 2.3, 0, 0.3, 0.1, 5.6, VGC.sombre, TL.metal);
    if (c.on) { E.fl = FX_EMIT; E.bx(0, 2.24, 0, 0.22, 0.06, 5.4, [1.25, 0.55, 1.15], TL.plain); E.fl = 0; }
  },
  // l'hologramme : un socle ; c.k : 0..1 ; la figure faite de points de lumière (c.fig : 'ville' | 'femme' | 'ciel')
  holo(E, c, t) {
    E.bx(0, 0, 0, 1.6, 0.5, 1.6, VGC.coque, mt(M_VG_COQUE)); E.bx(0, 0.5, 0, 1.1, 0.1, 1.1, VGC.nacre, mt(M_VG_NACRE));
    const k = c.k || 0;
    E.fl = FX_EMIT;
    E.bx(0, 0.6, 0, 0.5, 0.04, 0.5, k > 0.05 ? [0.5, 0.9, 1.3] : [0.1, 0.14, 0.2], TL.plain);
    if (k > 0.05) {
      const fl = Math.random() < 0.04 ? 0.3 : 1, b = k * fl;
      if (c.fig === 'femme') {
        // une femme debout, en manteau, les mains derrière le dos
        const pts = [[0, 2.55, 0, 0.22], [0, 2.25, 0, 0.2], [0, 1.95, 0, 0.36], [0, 1.55, 0, 0.4], [0, 1.15, 0, 0.42], [-0.12, 0.8, 0, 0.16], [0.12, 0.8, 0, 0.16], [-0.25, 1.95, -0.05, 0.12], [0.25, 1.95, -0.05, 0.12]];
        for (const [x, y, z, s] of pts) for (let i = 0; i < 3; i++) { const j = Math.sin(t * 7 + i * 2 + y * 9) * 0.02; E.box(x + j, y + i * 0.1 - 0.1, z, s, 0.05, s * 0.6, [0.45 * b, 0.85 * b, 1.3 * b], TL.plain); }
      } else if (c.fig === 'ciel') {
        for (let i = 0; i < 40; i++) { const a = i * 2.39996, r = 0.25 + (i % 7) * 0.12, y = 1.2 + ((i * 37) % 11) * 0.12; const aa = a + t * 0.15; const vide = Math.cos(aa) > 0.55; if (vide) continue; E.box(Math.cos(aa) * r, y, Math.sin(aa) * r, 0.05, 0.05, 0.05, i % 9 ? [1.2 * b, 1.2 * b, 1.3 * b] : [1.4 * b, 0.9 * b, 0.4 * b], TL.plain); }
      } else {
        // la cité elle-même, en petit, qui tourne : un fuseau, des anneaux, des tours
        const a = t * 0.25;
        E.box(0, 1.6, 0, 0.3, 0.3, 1.6, [0.45 * b, 0.85 * b, 1.3 * b], TL.plain, a);
        for (let i = 0; i < 10; i++) { const aa = a + i / 10 * TAU; E.box(Math.cos(aa) * 0.7, 1.6, Math.sin(aa) * 0.7, 0.32, 0.06, 0.08, [0.4 * b, 0.8 * b, 1.25 * b], TL.plain, -aa); }
        for (let i = 0; i < 5; i++) { const aa = a + i * 1.256; E.box(Math.cos(aa) * 0.3, 1.85 + (i % 2) * 0.1, Math.sin(aa) * 0.3, 0.06, 0.3, 0.06, [0.6 * b, 1.0 * b, 1.3 * b], TL.plain); }
      }
    }
    E.fl = 0;
  },
  // le régulateur de pesanteur : une sphère dans une cage, qui tourne quand il marche
  gravite(E, c, t) {
    E.bx(0, 0, 0, 2.2, 0.4, 2.2, VGC.coque, mt(M_VG_COQUE));
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; E.box(Math.cos(a) * 0.95, 1.6, Math.sin(a) * 0.95, 0.08, 2.4, 0.08, VGC.nacre, TL.metal, -a); }
    E.bx(0, 2.8, 0, 2.0, 0.12, 2.0, VGC.coque, mt(M_VG_COQUE));
    const k = c.k || 0, a = t * 1.8 * k;
    E.fl = k > 0.05 ? FX_EMIT : 0;
    const b = 0.3 + k * 0.9;
    for (let i = 0; i < 6; i++) E.box(0, 1.6, 0, 0.8, 0.8, 0.8, [0.35 * b, 0.55 * b, 1.0 * b], TL.plain, a + i * 0.26, a * 0.7 + i * 0.5, i * 0.3);
    E.fl = 0;
  },
  // un berceau (une capsule couchée, au verre givré) ; c.occupe : quelqu'un y dort
  berceau(E, c, t) {
    E.bx(0, 0, 0, 1.0, 0.5, 2.3, VGC.coque, mt(M_VG_COQUE));
    E.bx(0, 0.5, 0, 0.9, 0.12, 2.15, VGC.nacre, mt(M_VG_NACRE));
    E.box(0, 0.78, 0, 0.86, 0.4, 2.1, c.occupe ? [0.62, 0.74, 0.82] : [0.46, 0.52, 0.58], TL.glass);
    if (c.occupe) { E.fl = FX_EMIT; const b = 0.55 + 0.25 * Math.sin(t * 0.9); E.bx(0, 0.62, 0.2, 0.34, 0.06, 0.9, [0.4 * b, 0.7 * b, 1.0 * b], TL.plain); E.bx(0, 0.62, -0.62, 0.22, 0.08, 0.22, [0.5 * b, 0.8 * b, 1.1 * b], TL.plain); E.fl = 0; }
    E.fl = FX_EMIT; E.bx(0.38, 0.5, 1.12, 0.12, 0.05, 0.04, c.occupe ? [0.3, 1.0, 0.5] : [0.2, 0.22, 0.26], TL.plain); E.fl = 0;
  },
  // l'Atelier des corps : un fauteuil couché sous une arche de bras articulés ; c.on : sous tension
  atelier(E, c, t) {
    E.bx(0, 0, 0, 1.0, 0.55, 2.2, VGC.coque, mt(M_VG_COQUE));
    E.box(0, 0.75, 0.15, 0.85, 0.12, 1.9, VGC.nacre, mt(M_VG_NACRE), 0, 0.12);
    E.box(0, 0.95, -0.95, 0.7, 0.12, 0.5, VGC.nacre, mt(M_VG_NACRE), 0, -0.5);
    for (const s of [-1, 1]) { E.bx(s * 1.0, 0, 0, 0.2, 2.6, 0.3, VGC.coque, mt(M_VG_COQUE)); }
    E.bx(0, 2.6, 0, 2.2, 0.25, 0.4, VGC.coque, mt(M_VG_COQUE));
    const k = c.on ? 1 : 0, a = Math.sin(t * 1.3) * 0.3 * k;
    for (let i = 0; i < 3; i++) { const z = -0.6 + i * 0.6; E.box(0, 2.25, z, 0.08, 0.6, 0.08, VGC.sombre, TL.metal, 0, a * (i - 1)); E.fl = k ? FX_EMIT : 0; E.box(0, 1.92, z, 0.12, 0.12, 0.12, k ? [0.5, 1.0, 1.35] : [0.2, 0.22, 0.26], TL.plain); E.fl = 0; }
  },
  // la plaque gravée (inscription en Hautes Lettres)
  plaque(E) {
    E.bx(0, 0, 0, 0.9, 1.2, 0.1, VGC.nacre, mt(M_VG_NACRE));
    for (let k = 0; k < 9; k++) E.bx(-0.05 + ((k * 13) % 5 - 2) * 0.02, 0.15 + k * 0.1, 0.055, 0.1 + ((k * 7) % 3) * 0.06, 0.03, 0.01, [0.3, 0.32, 0.34], TL.plain);
  },
  // meubles de l'équipage (lit, table, banc, coffre, étagère)
  lit(E) { E.bx(0, 0, 0, 1.1, 0.45, 2.1, VGC.coque, mt(M_VG_COQUE)); E.bx(0, 0.45, 0.05, 1.0, 0.16, 1.95, [0.7, 0.72, 0.76], TL.blanket); E.bx(0, 0.6, -0.75, 0.7, 0.12, 0.35, [0.85, 0.86, 0.88], TL.pillow); },
  table(E) { E.bx(0, 0.72, 0, 1.4, 0.06, 0.8, VGC.nacre, mt(M_VG_NACRE)); E.bx(0, 0, 0, 0.3, 0.72, 0.3, VGC.coque, TL.metal); E.bx(0, 0, 0, 0.8, 0.05, 0.6, VGC.coque, TL.metal); },
  banc(E) { E.bx(0, 0.42, 0, 2.2, 0.08, 0.5, VGC.nacre, mt(M_VG_NACRE)); for (const s of [-0.9, 0.9]) E.bx(s, 0, 0, 0.12, 0.42, 0.45, VGC.coque, TL.metal); },
  coffre(E, c) { E.bx(0, 0, 0, 0.9, 0.55, 0.55, VGC.coque, mt(M_VG_COQUE)); E.bx(0, 0.55, 0, 0.92, 0.06, 0.57, c.vide ? VGC.sombre : VGC.nacre, TL.metal); E.fl = FX_EMIT; E.bx(0, 0.3, 0.28, 0.12, 0.05, 0.02, c.vide ? [0.25, 0.25, 0.3] : [0.4, 0.9, 1.3], TL.plain); E.fl = 0; },
  etagere(E, c) { E.bx(0, 0, 0, 1.6, 2.0, 0.4, VGC.coque, mt(M_VG_COQUE)); for (let k = 0; k < 4; k++) E.bx(0, 0.25 + k * 0.45, 0.02, 1.5, 0.04, 0.38, VGC.nacre, TL.metal); for (let k = 0; k < 7; k++) E.bx(-0.6 + k * 0.2, 0.29 + (k % 4) * 0.45, 0.02, 0.12, 0.22 + (k % 3) * 0.06, 0.25, [[0.5, 0.55, 0.6], [0.7, 0.6, 0.5], [0.4, 0.5, 0.45]][k % 3], TL.book); },
  // un arbre mort de la Nef dans son bac de nacre (c.v : variante)
  arbre(E, c) {
    E.bx(0, 0, 0, 2.4, 0.6, 2.4, VGC.nacre, mt(M_VG_NACRE)); E.bx(0, 0.6, 0, 2.1, 0.05, 2.1, [0.3, 0.24, 0.18], TL.soil);
    const v = c.v || 0;
    E.bx(0, 0.6, 0, 0.3, 4.2, 0.3, [0.42, 0.38, 0.34], TL.bark);
    for (let k = 0; k < 5; k++) E.box(Math.cos(k * 1.3 + v) * 0.7, 3.2 + k * 0.4, Math.sin(k * 1.3 + v) * 0.7, 0.1, 1.8, 0.1, [0.42, 0.38, 0.34], TL.bark, k * 1.3 + v, 0.8, 0.2);
  },
  // la fontaine sèche
  fontaine(E, c, t) {
    for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; E.box(Math.cos(a) * 2.3, 0.3, Math.sin(a) * 2.3, 1.85, 0.6, 0.35, VGC.nacre, mt(M_VG_NACRE), -a + Math.PI / 2); }
    E.bx(0, 0, 0, 4.2, 0.08, 4.2, VGC.sombre, mt(M_VG_DALLE));
    E.bx(0, 0, 0, 0.5, 1.6, 0.5, VGC.nacre, mt(M_VG_NACRE)); E.bx(0, 1.6, 0, 1.2, 0.15, 1.2, VGC.nacre, mt(M_VG_NACRE));
    if (c.on) { E.fl = FX_EMIT; for (let k = 0; k < 6; k++) { const y = 1.75 - ((t * 1.2 + k / 6) % 1) * 1.7; E.box(Math.cos(k) * 0.55, y, Math.sin(k) * 0.55, 0.05, 0.25, 0.05, [0.5, 0.75, 1.0], TL.plain); } E.fl = 0; E.bx(0, 0.08, 0, 3.8, 0.04, 3.8, [0.35, 0.5, 0.6], TL.glass); }
  },
  // les lampes : un globe au plafond (c.on : allumé)
  lampe(E, c) { E.bx(0, 0.3, 0, 0.06, 0.6, 0.06, VGC.sombre, TL.metal); E.fl = c.on ? FX_EMIT : 0; E.box(0, 0.15, 0, 0.45, 0.3, 0.45, c.on ? [1.2, 1.25, 1.3] : [0.3, 0.34, 0.4], TL.plain); E.fl = 0; },
  // une veilleuse (petite lampe bleue de secours, toujours allumée)
  veilleuse(E, c, t) { E.bx(0, 0, 0, 0.22, 0.12, 0.08, VGC.sombre, TL.metal); E.fl = FX_EMIT; const b = 0.75 + 0.25 * Math.sin(t * 0.5 + (c.id || 0)); E.bx(0, 0.02, 0.04, 0.16, 0.08, 0.02, [0.3 * b, 0.55 * b, 1.1 * b], TL.plain); E.fl = 0; },
  // le rideau de la brèche (un champ de lumière qui tient l'air) ; c.k : 0..1
  rideau(E, c, t) {
    const k = c.k || 0, L = c.l || 6, H = c.h || 4;
    for (const s of [-1, 1]) E.bx(s * (L / 2 + 0.15), 0, 0, 0.3, H, 0.4, VGC.coque, mt(M_VG_COQUE));
    if (k < 0.05) return;
    E.fl = FX_EMIT;
    for (let j = 0; j < 6; j++) for (let i = 0; i < 8; i++) { const w = 0.5 + 0.5 * Math.sin(t * 2 + i * 0.9 + j * 1.7); if (w < 0.35) continue; const b = k * w * 0.5; E.bx(-L / 2 + (i + 0.5) * L / 8, j * H / 6, 0, L / 8 * 0.9, H / 6 * 0.85, 0.02, [0.3 * b, 0.6 * b, 1.1 * b], TL.plain); }
    E.fl = 0;
  },
  // la lucarne de l'Observatoire : un grand cadre, et rien dedans que le ciel
  cadre(E, c) { const L = c.l || 8, H = c.h || 5; E.bx(0, 0, 0, L, 0.3, 0.4, VGC.coque, mt(M_VG_COQUE)); E.bx(0, H - 0.3, 0, L, 0.3, 0.4, VGC.coque, mt(M_VG_COQUE)); for (let k = 0; k <= 4; k++) E.bx(-L / 2 + k * L / 4, 0, 0, 0.12, H, 0.2, VGC.nacre, TL.metal); },
  // la lunette (Observatoire)
  lunette(E, c, t) { E.bx(0, 0, 0, 1.2, 0.9, 1.2, VGC.coque, mt(M_VG_COQUE)); E.box(0, 1.5, 0.2, 0.4, 0.4, 2.4, VGC.nacre, mt(M_VG_NACRE), 0, -0.6); E.box(0, 2.1, 1.25, 0.5, 0.5, 0.2, VGC.sombre, TL.metal, 0, -0.6); },
  // le banc de prière (Chapelle) et l'autel aux trois signes
  autel(E, c, t) {
    E.bx(0, 0, 0, 2.6, 1.0, 1.0, VGC.nacre, mt(M_VG_NACRE));
    E.fl = FX_EMIT; const b = 0.6 + 0.2 * Math.sin(t * 0.7);
    E.box(-0.7, 1.35, 0, 0.36, 0.36, 0.06, [1.3 * b, 1.1 * b, 0.6 * b], TL.plain); // le soleil (Aëla)
    for (let k = 0; k < 3; k++) E.bx(-0.12 + k * 0.12, 1.15, 0, 0.05, 0.42, 0.06, [0.7 * b, 0.7 * b, 0.75 * b], TL.plain); // trois traits (Durn)
    E.fl = 0; E.box(0.7, 1.35, 0, 0.36, 0.36, 0.06, [0.02, 0.02, 0.03], TL.plain); // le rond noir (Vesh)
  },
  // un objet à ramasser (petit) ; c.col : couleur ; c.forme : 'boule' | 'boite' | 'plaque' | 'livre' | 'papier' | 'lingot'
  objet(E, c, t) {
    const col = c.col || [0.8, 0.8, 0.8], f = c.forme || 'boite';
    if (f === 'boule') { E.fl = c.lueur ? FX_EMIT : 0; const b = c.lueur ? 0.8 + 0.3 * Math.sin(t * 3 + (c.id || 0)) : 1; E.box(0, 0.12, 0, 0.2, 0.2, 0.2, [col[0] * b, col[1] * b, col[2] * b], TL.glass, t * 0.3); E.fl = 0; return; }
    if (f === 'livre') { E.bx(0, 0, 0, 0.26, 0.06, 0.34, col, TL.book, 0.3); return; }
    if (f === 'papier') { E.bx(0, 0, 0, 0.24, 0.01, 0.32, [0.92, 0.92, 0.9], TL.paper, -0.4); return; }
    if (f === 'plaque') { E.bx(0, 0, 0, 0.32, 0.03, 0.24, col, TL.glass, 0.5); return; }
    if (f === 'lingot') { E.bx(0, 0, 0, 0.32, 0.1, 0.14, col, TL.metal, 0.2); return; }
    E.bx(0, 0, 0, 0.26, 0.14, 0.2, col, TL.metal, 0.4);
  },
};

// ---------------------------------------------------------------- les icônes des objets de la cité
{
  const _ip = iconPaint;
  iconPaint = function (shape, c1, c2) {
    if (typeof shape !== 'string' || !shape.startsWith('vg_')) return _ip(shape, c1, c2);
    const pb = new PixelBuf(16, 16), base = hexToRgb(c1 || '#aab4c0');
    const R = (x0, y0, x1, y1, c, a) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) pb.set(x, y, typeof c === 'string' ? hexToRgb(c) : c, a); };
    const L = (x0, y0, x1, y1, c, w) => drawLine(pb, x0, y0, x1, y1, typeof c === 'string' ? hexToRgb(c) : c, w || 1);
    const K = (k) => [clamp(base[0] * k, 0, 255), clamp(base[1] * k, 0, 255), clamp(base[2] * k, 0, 255)];
    const boule = (cx, cy, r, lum) => { for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy); if (d < r) pb.set(x, y, K(1.25 - d / r * 0.55 + (x < cx && y < cy ? 0.15 : 0)), lum ? EMISSIVE_A : 255); } };
    switch (shape) {
      case 'vg_coeur': boule(8, 8.5, 5.6, true); R(7, 6, 8, 7, [240, 252, 255], EMISSIVE_A); L(8, 2, 8, 3, '#8a96a4'); break;
      case 'vg_ration': R(3, 4, 12, 11, '#c8ccd4'); R(4, 5, 11, 10, K(0.9)); L(3, 8, 12, 8, '#e8ecf0'); pb.set(5, 6, [255, 255, 255]); break;
      case 'vg_fruit': boule(8, 9, 5, false); for (const x of [6, 8, 10]) L(x, 5, x, 13, K(0.8)); L(8, 2, 9, 4, '#6a8a4a', 2); break;
      case 'vg_seve': R(6, 2, 9, 4, '#9aa4b0'); R(5, 5, 10, 13, '#e8f0f0'); R(6, 7, 9, 12, K(1)); pb.set(6, 8, [255, 255, 255]); break;
      case 'vg_eclat': for (let i = 0; i < 9; i++) L(3 + i, 12 - (i >> 1), 6 + i, 12 - i, K(0.9 + i * 0.03)); L(3, 12, 12, 4, '#e8eef4'); break;
      case 'vg_alliage': R(2, 7, 13, 11, K(0.85)); R(3, 6, 12, 7, K(1.15)); L(2, 11, 13, 11, K(0.6)); break;
      case 'vg_etoffe': for (let y = 3; y < 13; y++) for (let x = 3; x < 13; x++) pb.set(x + ((y % 3) === 0 ? 1 : 0), y, K(0.85 + ((x + y) % 4) * 0.08)); break;
      case 'vg_plaque': R(2, 3, 13, 12, '#1a2030'); for (const [x, y] of [[4, 5], [7, 4], [10, 7], [6, 9], [11, 10], [3, 10]]) pb.set(x, y, [230, 240, 255], EMISSIVE_A); L(4, 5, 7, 4, '#5a7aa0'); L(7, 4, 10, 7, '#5a7aa0'); break;
      case 'vg_insigne': R(4, 5, 11, 12, K(1)); L(8, 1, 8, 4, K(1.2)); L(6, 3, 10, 3, K(1.2)); for (const x of [6, 8, 10]) L(x, 7, x, 11, K(0.6)); break;
      case 'vg_toupie': for (let y = 4; y < 12; y++) { const w = y < 8 ? y - 3 : 12 - y; R(8 - w, y, 7 + w, y, K(1 + (y % 2) * 0.12)); } L(8, 1, 8, 4, '#8a96a4'); L(8, 12, 8, 14, '#8a96a4'); break;
      case 'vg_boite': R(3, 6, 12, 12, K(1)); R(3, 4, 12, 6, K(1.12)); L(3, 9, 12, 9, '#a89878'); pb.set(8, 5, [255, 240, 200]); break;
      case 'vg_cristal': for (let y = 2; y < 14; y++) { const w = y < 5 ? y - 1 : y > 11 ? 14 - y : 3; R(8 - w, y, 7 + w, y, K(1.1 - (y % 3) * 0.06), EMISSIVE_A); } break;
      case 'vg_graine': boule(8, 9, 4.2, true); L(8, 4, 9, 2, '#8a9a5a'); break;
      case 'vg_oeil': boule(8, 8, 6, false); boule(8, 8, 2.6, false); R(7, 7, 8, 8, [10, 12, 20]); pb.set(6, 6, [220, 230, 255]); break;
      case 'vg_carnet': R(3, 2, 12, 13, K(1)); R(4, 3, 11, 12, K(0.85)); L(4, 2, 4, 13, K(0.55)); L(6, 5, 10, 5, '#d8dce0'); L(6, 7, 10, 7, '#d8dce0'); break;
      case 'vg_fiche': R(3, 2, 12, 13, '#f4f4f0'); for (const y of [4, 6, 8, 10]) L(5, y, 10, y, '#7a7a80'); R(9, 10, 11, 12, '#c02020'); break;
      case 'vg_pierre': for (let i = 0; i < 8; i++) L(3 + i, 12 - i, 6 + i, 13 - (i >> 1), K(0.8 + (i % 3) * 0.1)); break;
      default: return _ip(shape, c1, c2);
    }
    edgeDarken(pb, 0.85);
    return pb;
  };
}
