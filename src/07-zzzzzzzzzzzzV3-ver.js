// ============================================================================
//  LE VER (agent V3) — sa peau, son squelette, ses poses, son ombre ; les
//  objets de l'aire et des perchoirs
//  - Une matière (M_V3_ECAILLES : des écailles en rangs, presque noires, aux
//    bords de bronze), quatre tuiles de peau (membrane veinée, œil à pupille
//    fendue, corne annelée, plaques du ventre).
//  - Un seul grand modèle : une vouivre (deux pattes, deux ailes qui lui servent
//    de bras), d'environ quarante-cinq mètres du museau à la pointe de la queue,
//    cinquante d'envergure. Un squelette (Rig) d'à peu près deux cents boîtes ;
//    les membranes des ailes sont tendues à chaque image entre les doigts (des
//    bandes, au bord découpé). Le collier de fer au cou, un bout de chaîne, la
//    vieille plaie sous l'aile gauche avec le carreau planté dedans.
//  - v3Poser(rig, st) : vol (battement, plané, piqué), posé (ailes repliées, il
//    s'appuie sur les poignets, la tête qui tourne), endormi (lové, la tête au
//    sol), mort ; v3Emettre(buf, D) dessine tout (avec un niveau de détail selon
//    la distance) ; v3Ombre(buf, D, sky) son ombre au sol.
// ============================================================================

// ---------------------------------------------------------------- la matière : des écailles en rangs
function texV3Ecailles(seed) {
  const pb = new PixelBuf(TS, TS), tn = makeTileNoise(seed);
  const P = ramp(['#24201e', '#302a27', '#3d3530', '#4a4039', '#594c43', '#6a5a4d', '#7e6b58', '#957f66']);
  const cw = 16, ch = 11;                     // une écaille : 16 px de large, rangs tous les 11 px (≈ 0,37 m sur le Ver)
  const rows = Math.round(TS / ch);           // 11,6 → on prend des rangs qui se raccordent : 128 / 11 n'est pas entier,
  const chR = TS / rows;                      // on resserre un peu (≈ 10,7 px)
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    // l'écaille qui recouvre ce point : la plus proche, en allongeant vers le haut (elles se chevauchent vers le bas)
    let best = 1e9, bdy = 0, bdx = 0, second = 1e9, id = 0;
    const r0 = Math.floor(y / chR);
    for (let r = r0 - 1; r <= r0 + 2; r++) {
      const off = (((r % 2) + 2) % 2) * cw / 2, cy = r * chR;
      const c0 = Math.floor((x - off) / cw);
      for (let c = c0 - 1; c <= c0 + 1; c++) {
        const cx = c * cw + off + cw / 2;
        let dx = x + 0.5 - cx, dy = y + 0.5 - cy;
        // raccord sans couture (périodique)
        dx = ((dx + TS / 2) % TS + TS) % TS - TS / 2;
        const d = Math.hypot(dx / (cw * 0.62), dy / (dy < 0 ? chR * 1.6 : chR * 0.95));
        if (d < best) { second = best; best = d; bdy = dy; bdx = dx; id = ((r % rows + rows) % rows) * 31 + (((c % 8) + 8) % 8); }
        else if (d < second) second = d;
      }
    }
    const edge = second - best;                // 0 au bord de l'écaille
    let v = 0.36 + (hash2i(id, 3, seed) - 0.5) * 0.16 + (tn(x / 9, y / 9, 128 / 9) - 0.5) * 0.12;
    v += clamp(-bdy / chR, -0.6, 1) * 0.12;     // le haut de l'écaille, plus sombre (sous la précédente)
    v -= Math.abs(bdx) / cw * 0.12;             // arrondie
    if (Math.abs(bdx) < 1.2 && bdy > -2) v += 0.1; // l'arête au milieu
    if (edge < 0.07) v = 0.05;                  // le joint
    else if (edge < 0.16 && bdy > 0) v += 0.32; // le bord, qui accroche la lumière (bronze)
    pb.set(x, y, rampPick(P, v, x, y));
  }
  return pb;
}
const M_V3_ECAILLES = MATERIALS.push({ id: 'v3_ecailles', name: 'Écailles du Ver', scale: 2.4, gen: () => texV3Ecailles(1931) }) - 1;

// ---------------------------------------------------------------- les tuiles de peau (atlas 16 px)
Object.assign(TL, { v3Membrane: 160, v3Oeil: 161, v3Corne: 162, v3Ventre: 163 });
function v3Tuiles(cv) {
  const ctx = cv.getContext('2d');
  const T = (idx, fn) => {
    const img = ctx.createImageData(16, 16), D = img.data;
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      let c = fn(x, y); if (typeof c === 'number') c = [c, c, c];
      const k = (y * 16 + x) * 4;
      D[k] = clamp(c[0], 0, 255); D[k + 1] = clamp(c[1], 0, 255); D[k + 2] = clamp(c[2], 0, 255); D[k + 3] = 255;
    }
    ctx.putImageData(img, (idx % 16) * 16, Math.floor(idx / 16) * 16);
  };
  const N = (x, y, s) => hash2i(x, y, s);
  const mul = (c, k) => [c[0] * k, c[1] * k, c[2] * k];
  // la membrane : un cuir brun-rouge, des veines qui partent d'un coin, des plages plus claires (presque translucides)
  const veines = new Set();
  for (const [x0, y0, dx, dy] of [[0, 0, 1, 0.35], [0, 0, 1, 0.9], [0, 0, 0.45, 1], [6, 2, 1, -0.1], [5, 6, 1, 0.5], [2, 7, 0.5, 1]]) {
    let x = x0, y = y0;
    for (let k = 0; k < 22; k++) { veines.add((Math.round(x) & 15) + ',' + (Math.round(y) & 15)); x += dx * 0.8; y += dy * 0.8; }
  }
  T(TL.v3Membrane, (x, y) => {
    let c = mul([92, 52, 42], 0.78 + N(x >> 1, y >> 1, 1601) * 0.3);
    if (N(x >> 2, y >> 2, 1602) > 0.72) c = mul(c, 1.25);
    if (veines.has(x + ',' + y)) c = [46, 24, 22];
    return c;
  });
  // l'œil : ambre, la pupille fendue (verticale sur le côté de la tête)
  T(TL.v3Oeil, (x, y) => {
    const dx = x - 7.5, dy = y - 7.5, r = Math.hypot(dx / 1.0, dy / 0.8);
    if (r > 7.6) return [20, 10, 6];
    if (Math.abs(dx) < 0.9 && Math.abs(dy) < 6.5) return [8, 4, 2];
    const k = 1 - r / 9;
    return [255 * (0.7 + k * 0.35), 170 * (0.45 + k * 0.6), 40 + 60 * k];
  });
  // la corne : grise, annelée, salie
  T(TL.v3Corne, (x, y) => {
    let v = 0.62 + (N(x, y >> 1, 1621) - 0.5) * 0.18;
    if (y % 4 === 0) v -= 0.22; else if (y % 4 === 1) v += 0.08;
    if (N(x >> 1, y >> 2, 1622) > 0.8) v -= 0.18;
    return mul([206, 192, 164], v);
  });
  // le ventre : des plaques en travers, couleur de cendre et d'os, des sillons sombres
  T(TL.v3Ventre, (x, y) => {
    const b = y % 5;
    let v = 0.66 + (N(x >> 2, (y / 5) | 0, 1631) - 0.5) * 0.14 + (N(x, y, 1632) - 0.5) * 0.08;
    if (b === 4) v = 0.32; else if (b === 0) v += 0.12;
    return mul([186, 168, 140], v);
  });
}
{
  const _bsa = buildSkinAtlas;
  buildSkinAtlas = function () {
    _bsa();
    try { v3Tuiles(SKIN.canvas); } catch (e) { console.warn('V3 : tuiles', e); }
  };
}

// ---------------------------------------------------------------- les couleurs
const V3_COUL = {
  dos: [0.9, 0.86, 0.82], flanc: [0.84, 0.8, 0.76], ventre: [0.9, 0.84, 0.76], epine: [0.42, 0.38, 0.35], corne: [0.74, 0.7, 0.62],
  corne2: [0.5, 0.46, 0.42], pointe: [0.28, 0.25, 0.23], os: [0.92, 0.88, 0.78], griffe: [0.36, 0.33, 0.3], membrane: [1, 1, 1],
  membrane2: [0.82, 0.8, 0.8], oeil: [1.7, 1.1, 0.42], noir: [0.03, 0.025, 0.02], fer: [0.46, 0.42, 0.4], fer2: [0.34, 0.3, 0.28],
  plaie: [0.42, 0.1, 0.08], bois: [0.5, 0.42, 0.34], feu: [1.9, 0.75, 0.22], gueule: [0.32, 0.08, 0.07], langue: [0.5, 0.16, 0.14],
};

// ---------------------------------------------------------------- le squelette
// Repère : la racine est au bassin ; +z vers la tête, +y en haut, +x à sa gauche (L), −x à sa droite (R).
// Les os des ailes s'étendent le long de +x (aile gauche) ou −x (aile droite) ; rz les lève, ry les balaie vers l'arrière.
const V3_DOIGTS = [[10.6, 0.56], [9.6, 0.47], [8.1, 0.4], [6.6, 0.34]];   // longueur, épaisseur
const V3_COU = 9, V3_QUEUE = 14;
function v3Rig() {
  const { P, add } = rigParts();
  const C = V3_COUL, EC = mt(M_V3_ECAILLES), VE = TL.v3Ventre, CO = TL.v3Corne;
  const det = (q) => { q.det = 1; return q; };          // détail : omis de loin
  add('racine', null, [0, 0, 0], null);
  // ------------------------------------------------ le corps : bassin, ventre, poitrine
  add('bassin', 'racine', [0, 0, 0], [4.4, 3.7, 5.4], [0, 0, -0.5], C.dos, EC);
  add('bassin_v', 'bassin', [0, -1.72, -0.4], [3.5, 0.5, 4.6], [0, 0, 0], C.ventre, VE);
  add('flanc', 'bassin', [0, 0.2, 2.0], null);
  add('ventre', 'flanc', [0, 0, 0], [5.0, 4.3, 4.8], [0, 0, 2.2], C.dos, EC);
  add('ventre_v', 'ventre', [0, -2.02, 2.2], [3.9, 0.55, 4.5], [0, 0, 0], C.ventre, VE);
  add('torse', 'ventre', [0, 0.1, 4.4], null);
  add('poitrine', 'torse', [0, 0, 0], [5.8, 5.0, 5.0], [0, 0.25, 2.3], C.dos, EC);
  add('poitrine_v', 'poitrine', [0, -2.28, 2.3], [4.5, 0.6, 4.7], [0, 0, 0], C.ventre, VE);
  add('cou0', 'poitrine', [0, 0.9, 4.7], [4.0, 3.9, 1.6], [0, 0, 0.3], C.dos, EC);   // la base du cou, épaisse
  // l'épine du dos
  for (const [par, z, h] of [['bassin', -2.2, 1.0], ['bassin', -0.4, 1.3], ['ventre', 1.0, 1.5], ['ventre', 3.2, 1.6], ['poitrine', 1.2, 1.7], ['poitrine', 3.3, 1.5]]) {
    const top = par === 'poitrine' ? 2.75 : par === 'ventre' ? 2.15 : 1.85;
    add('epine_' + par + z, par, [0, top, z], [0.34, h, 1.05], [0, h / 2, 0], C.epine, CO, { r0: [-0.75, 0, 0] });
  }
  // ------------------------------------------------ le cou (neuf vertèbres), la tête
  let par = 'cou0', piv = [0, 0.1, 0.9];
  for (let i = 1; i <= V3_COU; i++) {
    const k = (i - 1) / (V3_COU - 1), w = lerp(3.0, 1.55, k), h = lerp(3.1, 1.6, k), L = 1.42;
    add('cou' + i, par, piv, [w, h, L + 0.3], [0, 0, L / 2], C.dos, EC);
    add('cou' + i + '_v', 'cou' + i, [0, -h / 2 + 0.1, L / 2], [w * 0.78, 0.32, L + 0.2], [0, 0, 0], C.ventre, VE);
    det(add('cou' + i + '_e', 'cou' + i, [0, h / 2 - 0.05, L * 0.35], [0.24, lerp(1.1, 0.55, k), 0.7], [0, lerp(0.5, 0.25, k), 0], C.epine, CO, { r0: [-0.8, 0, 0] }));
    par = 'cou' + i; piv = [0, 0, L];
  }
  // la tête : le crâne, le museau, la mâchoire (rx l'ouvre)
  add('tete', 'cou' + V3_COU, [0, 0.05, 1.45], [2.3, 1.85, 2.5], [0, 0.35, 1.0], C.dos, EC);
  add('occiput', 'tete', [0, 0.55, -0.15], [2.0, 1.2, 1.1], [0, 0, 0], C.dos, EC);
  add('museau', 'tete', [0, 0.12, 2.15], [1.62, 1.12, 2.7], [0, 0, 1.3], C.dos, EC);
  add('museau_bout', 'museau', [0, -0.02, 2.65], [1.34, 0.95, 0.55], [0, 0, 0.22], C.dos, EC);
  add('chanfrein', 'museau', [0, 0.6, 1.0], [0.6, 0.25, 2.4], [0, 0, 0], C.epine, CO);
  for (const s of [1, -1]) {
    const S = s > 0 ? 'L' : 'R';
    add('narine' + S, 'museau', [s * 0.4, 0.42, 2.82], [0.24, 0.16, 0.2], [0, 0, 0], C.noir, 0);
    add('oeil' + S, 'tete', [s * 1.14, 0.62, 1.62], [0.1, 0.34, 0.66], [0, 0, 0], C.oeil, TL.v3Oeil, { fl: FX_EMIT, r0: [0, s * 0.12, 0] });
    add('arcade' + S, 'tete', [s * 0.98, 1.05, 1.5], [0.6, 0.42, 1.8], [0, 0, 0], C.dos, EC, { r0: [0.18, s * 0.22, s * -0.25] });
    // les grandes cornes, rejetées en arrière, en trois morceaux qui se recourbent
    add('corne' + S, 'tete', [s * 0.78, 1.15, 0.05], [0.6, 0.6, 2.5], [0, 0, -1.15], C.corne, CO, { r0: [-0.32, s * -0.32, 0] });
    add('corne' + S + '2', 'corne' + S, [0, 0, -2.3], [0.42, 0.42, 2.2], [0, 0, -1.0], C.corne2, CO, { r0: [-0.5, s * 0.08, 0] });
    det(add('corne' + S + '3', 'corne' + S + '2', [0, 0, -2.05], [0.24, 0.24, 1.5], [0, 0, -0.65], C.pointe, CO, { r0: [-0.55, 0, 0] }));
    // les petites cornes des joues, la crête du crâne
    det(add('joue' + S, 'tete', [s * 1.05, -0.25, 0.4], [0.26, 0.26, 1.5], [0, 0, -0.65], C.corne2, CO, { r0: [0.18, s * -0.55, 0] }));
    det(add('joue' + S + '2', 'tete', [s * 0.95, 0.15, -0.2], [0.22, 0.22, 1.1], [0, 0, -0.5], C.corne2, CO, { r0: [-0.1, s * -0.7, 0] }));
    // les dents du haut (sous le museau)
    for (let i = 0; i < 6; i++) det(add('dentH' + S + i, 'museau', [s * 0.66, -0.56, 0.35 + i * 0.4], [0.14, i === 1 ? 0.6 : 0.4, 0.14], [0, -0.18, 0], C.os, TL.bone));
  }
  det(add('crete1', 'tete', [0, 1.2, 0.7], [0.26, 0.7, 0.9], [0, 0.3, 0], C.epine, CO, { r0: [-0.6, 0, 0] }));
  det(add('crete2', 'tete', [0, 1.1, -0.25], [0.26, 0.9, 0.9], [0, 0.4, 0], C.epine, CO, { r0: [-0.75, 0, 0] }));
  add('machoire', 'tete', [0, -0.55, 0.35], [1.5, 0.55, 4.3], [0, -0.2, 2.05], C.dos, EC);
  add('machoire_v', 'machoire', [0, -0.48, 2.0], [1.16, 0.2, 3.9], [0, 0, 0], C.ventre, VE);
  add('gueule', 'machoire', [0, 0.06, 1.8], [1.14, 0.14, 3.4], [0, 0, 0], C.gueule, TL.blood);
  add('langue', 'machoire', [0, 0.16, 1.4], [0.5, 0.12, 2.6], [0, 0, 0], C.langue, TL.skin);
  add('gorge', 'machoire', [0, 0.2, 1.1], [0.9, 0.08, 1.8], [0, 0, 0], C.feu, TL.ember, { fl: FX_EMIT, hide: true });
  for (const s of [1, -1]) for (let i = 0; i < 5; i++) det(add('dentB' + (s > 0 ? 'L' : 'R') + i, 'machoire', [s * 0.6, 0.06, 0.9 + i * 0.55], [0.13, i === 0 ? 0.55 : 0.36, 0.13], [0, 0.16, 0], C.os, TL.bone));
  // ------------------------------------------------ le collier (troisième vertèbre), la serrure, la chaîne rompue
  add('collier', 'cou3', [0, 0, 0.75], [3.42, 3.42, 0.72], [0, 0, 0], C.fer, TL.iron, { col0: C.fer });
  add('collier_r', 'collier', [0, 0, 0], [3.6, 0.5, 0.82], [0, 1.45, 0], C.fer2, TL.iron);
  add('serrure', 'collier', [0, -1.82, 0], [0.7, 0.6, 0.6], [0, -0.1, 0], C.fer2, TL.iron);
  add('chaine1', 'collier', [0, -2.1, 0], [0.2, 0.95, 0.62], [0, -0.42, 0], C.fer, TL.iron);
  add('chaine2', 'chaine1', [0, -0.84, 0], [0.62, 0.95, 0.2], [0, -0.42, 0], C.fer, TL.iron);
  add('chaine3', 'chaine2', [0, -0.84, 0], [0.2, 0.95, 0.62], [0, -0.42, 0], C.fer2, TL.iron);
  // ------------------------------------------------ la vieille plaie sous l'aile gauche, et le carreau dedans
  add('plaie', 'poitrine', [2.86, -0.75, 1.55], [0.2, 1.4, 1.8], [0, 0, 0], C.plaie, TL.blood);
  add('carreau', 'poitrine', [2.95, -0.7, 1.5], [0.16, 0.16, 2.6], [0, 0, -1.0], C.bois, TL.darkwood, { r0: [0.25, 1.15, 0] });
  add('carreau_e', 'carreau', [0, 0, -2.2], [0.05, 0.36, 0.5], [0, 0, 0], C.fer2, TL.iron);
  // ------------------------------------------------ la queue (quatorze vertèbres) et son fer
  par = 'bassin'; piv = [0, 0.35, -3.0];
  for (let i = 1; i <= V3_QUEUE; i++) {
    const k = (i - 1) / (V3_QUEUE - 1), kk = Math.pow(k, 0.85), w = lerp(3.0, 0.36, kk), h = lerp(2.9, 0.42, kk), L = lerp(1.75, 1.2, k);
    add('queue' + i, par, piv, [w, h, L + 0.25], [0, 0, -L / 2], C.dos, EC);
    if (i % 2 === 1) add('queue' + i + '_v', 'queue' + i, [0, -h / 2 + 0.08, -L / 2], [w * 0.75, 0.24, L + 0.1], [0, 0, 0], C.ventre, VE);
    det(add('queue' + i + '_e', 'queue' + i, [0, h / 2 - 0.05, -L * 0.45], [0.2, lerp(1.25, 0.32, k), 0.66], [0, lerp(0.55, 0.15, k), 0], C.epine, CO, { r0: [-0.85, 0, 0] }));
    par = 'queue' + i; piv = [0, 0, -L];
  }
  add('queue_fer', 'queue' + V3_QUEUE, [0, 0, -1.1], [1.5, 0.16, 1.5], [0, 0, 0], C.corne2, CO, { r0: [0, Math.PI / 4, 0] });
  // ------------------------------------------------ les pattes
  for (const s of [1, -1]) {
    const S = s > 0 ? 'L' : 'R';
    add('cuisse' + S, 'bassin', [s * 2.35, -0.35, 0.25], [1.75, 4.3, 2.5], [0, -1.75, 0.15], C.dos, EC);
    add('jambe' + S, 'cuisse' + S, [0, -3.7, 0.45], [1.2, 3.7, 1.35], [0, -1.75, 0], C.dos, EC);
    add('tarse' + S, 'jambe' + S, [0, -3.5, 0], [0.95, 2.2, 1.0], [0, -1.0, 0], C.dos, EC);
    add('pied' + S, 'tarse' + S, [0, -2.1, 0], [1.75, 0.66, 2.0], [0, -0.05, 0.62], C.dos, EC);
    for (let i = 0; i < 3; i++) {
      const o = (i - 1) * 0.62;
      add('orteil' + S + i, 'pied' + S, [o, -0.12, 1.55], [0.34, 0.36, 1.2], [0, 0, 0.5], C.dos, EC, { r0: [0, (i - 1) * 0.25, 0] });
      det(add('griffe' + S + i, 'orteil' + S + i, [0, -0.02, 1.08], [0.2, 0.26, 0.8], [0, -0.08, 0.32], C.griffe, TL.bone, { r0: [0.55, 0, 0] }));
    }
    det(add('ergot' + S, 'pied' + S, [0, -0.05, -0.45], [0.24, 0.26, 0.9], [0, 0, -0.35], C.griffe, TL.bone, { r0: [0.3, 0, 0] }));
  }
  // ------------------------------------------------ les ailes : humérus, avant-bras, poignet (pouce griffu), quatre doigts
  for (const s of [1, -1]) {
    const S = s > 0 ? 'L' : 'R';
    add('epaule' + S, 'poitrine', [s * 2.45, 1.75, 3.5], [2.0, 2.0, 2.2], [s * 0.4, 0, 0], C.dos, EC);
    add('humerus' + S, 'epaule' + S, [s * 0.6, 0, 0], [5.4, 1.35, 1.55], [s * 2.6, 0, 0], C.dos, EC);
    add('radius' + S, 'humerus' + S, [s * 5.2, 0, 0], [7.4, 0.98, 1.08], [s * 3.6, 0, 0], C.dos, EC);
    add('poignet' + S, 'radius' + S, [s * 7.2, 0, 0], [1.25, 1.25, 1.25], [0, 0, 0], C.dos, EC);
    add('pouce' + S, 'poignet' + S, [s * 0.2, -0.15, 0.5], [0.36, 0.36, 1.6], [0, 0, 0.72], C.griffe, TL.bone, { r0: [0.55, 0, 0] });
    for (let f = 0; f < 4; f++) {
      const [L, th] = V3_DOIGTS[f];
      add('doigt' + (f + 1) + S, 'poignet' + S, [s * 0.35, 0, 0], [L, th, th], [s * L / 2, 0, 0], C.flanc, EC);
      det(add('ongle' + (f + 1) + S, 'doigt' + (f + 1) + S, [s * L, 0, 0], [0.7, th * 0.7, th * 0.7], [s * 0.3, 0, 0], C.griffe, TL.bone));
    }
  }
  const r = new Rig(P);
  r.v3 = true;
  return r;
}

// ---------------------------------------------------------------- les poses
// st : { mode: 'vol'|'pose'|'dort'|'mort', t, battement (phase), ampl (0..1), plane (0..1), pique (0..1), replie (0..1 : ailes
//        repliées), appui (0..1 : posé, il s'appuie sur ses poignets), cabre (0..1 : dressé pour cracher), teteY, teteP (rad, le
//        regard), gueule (0..1), souffle (0..1, la poitrine), queue (balancement), pattes (0 rentrées … 1 sorties), etire (0..1) }
// Hauteur du bassin au-dessus du sol : posé V3_HAUT.pose, endormi V3_HAUT.dort (les pieds y touchent le sol).
const V3_HAUT = { pose: 6.6, dort: 2.3, mort: 2.6 };
// les angles de l'aile gauche repliée (trouvés par l'ajustement : le coude en arrière et en bas, le poignet au sol devant la
// poitrine, les doigts couchés le long du flanc) ; l'aile droite en miroir (rx, −ry, −rz)
const V3_REPLI = {
  humerus: [0.47, 0.925, -0.634], radius: [0.56, -2.43, -1.02],
  doigts: [[1.4, 3.109, -0.008], [1.466, 3.031, -0.08], [1.44, 2.981, -0.15], [1.409, 2.942, -0.22]],
};
// endormi : les ailes couchées sur le dos comme une cape, le poignet au sol près de l'épaule
const V3_REPLI_DORT = {
  humerus: [-1.029, 1.395, 0.067], radius: [0.816, -4.243, -0.971],
  doigts: [[1.4, 3.342, -0.177], [1.4, 3.39, -0.12], [1.4, 3.43, -0.09], [1.4, 3.481, -0.055]],
};
// les pattes : en vol (rentrées), posé (accroupi), endormi (repliées sous le corps) : cuisse, jambe, tarse, pied
const V3_PATTES = { vol: [0.95, 1.1, -0.4, 0.9], pose: [-0.95, 1.82, -1.335, 0.446], dort: [-1.167, 2.914, -2.678, 0.886] };
function v3Poser(R, st) {
  const t = st.t || 0, rep = clamp(st.replie || 0, 0, 1), app = clamp(st.appui || 0, 0, 1), cab = clamp(st.cabre || 0, 0, 1);
  const mode = st.mode || 'vol', dort = mode === 'dort' ? 1 : 0, mort = mode === 'mort' ? 1 : 0, vol = mode === 'vol' ? 1 : 0;
  const set = (n, x, y, z) => R.set(n, x, y, z);
  // ------------------------------------------------ le corps : la poitrine qui respire
  const resp = Math.sin(t * (dort ? 0.9 : 1.7)) * (st.souffle ?? 1) * (mort ? 0 : 1);
  const P = R.part('poitrine'); P.s[0] = 5.8 + resp * 0.12; P.s[1] = 5.0 + resp * 0.1;
  const V = R.part('ventre'); V.s[0] = 5.0 + resp * 0.08;
  // posé : le devant un peu relevé ; dressé (pour cracher) : davantage ; endormi : à plat
  const fl = -0.05 * app - 0.16 * cab + 0.03 * dort, to = -0.06 * app - 0.2 * cab + 0.03 * dort;
  set('flanc', fl, 0, 0); set('torse', to, 0, 0);
  // ------------------------------------------------ le cou et la tête
  // vol : presque droit, un peu baissé ; posé : une courbe en S douce, la tête en avant ; endormi : lové sur le côté, la tête
  // posée au sol près des pattes ; mort : la tête retombée
  const ty = clamp(st.teteY || 0, -1.7, 1.7), tp = clamp(st.teteP || 0, -0.9, 0.9);
  const c0 = -0.12 * app - 0.12 * cab + 0.12 * dort + 0.1 * mort;
  set('cou0', c0, 0, 0);
  let pente = fl + to + c0;
  for (let i = 1; i <= V3_COU; i++) {
    const k = (i - 1) / (V3_COU - 1);
    let rx = vol * (0.035 + (st.pique || 0) * 0.02) + app * (k < 0.34 ? -0.15 : k < 0.67 ? -0.02 : 0.12) + cab * (k < 0.5 ? -0.12 : 0.1)
      + dort * (i <= 4 ? -0.014 : 0.158) + mort * (i <= 4 ? 0.06 : 0.12);
    rx += tp / V3_COU * (0.5 + k);
    const ry = ty / V3_COU * (0.6 + k * 0.8) + dort * 0.274 + mort * 0.2;
    set('cou' + i, rx + Math.sin(t * 0.7 + i * 0.5) * 0.008 * (1 - mort), ry, dort * 0.03);
    if (i <= 3) pente += rx;
  }
  set('tete', vol * 0.12 + app * 0.08 + dort * 0.16 + mort * 0.3 + tp * 0.25 - cab * 0.22, ty * 0.12, dort * 0.4 + mort * 0.7);
  set('machoire', clamp(st.gueule || 0, 0, 1) * 0.75 + mort * 0.3, 0, 0);
  R.part('gorge').hide = !(st.gueule > 0.3 && st.feu);
  // la chaîne pend (on compense la pente du cou)
  set('chaine1', -pente, 0, Math.sin(t * 1.3) * 0.08 * (1 - mort)); set('chaine2', 0, 0.2, 0); set('chaine3', 0, -0.2, 0);
  // ------------------------------------------------ la queue : un balancement lent ; posé, elle retombe et traîne ; endormie,
  // elle s'enroule autour du corps, du côté où la tête est couchée
  const qs = st.queue ?? 1;
  for (let i = 1; i <= V3_QUEUE; i++) {
    const k = (i - 1) / (V3_QUEUE - 1);
    const sway = Math.sin(t * 0.8 - i * 0.45) * 0.045 * qs * (0.4 + k) * (1 - mort);
    const rx = vol * (0.012 - (st.pique || 0) * 0.008) + app * (i <= 4 ? -0.24 : i <= 8 ? 0.2 : 0.043) + dort * (i <= 3 ? -0.037 : -0.044)
      + mort * (i <= 3 ? -0.05 : -0.04);
    set('queue' + i, rx, sway - dort * (i >= 2 ? 0.227 : 0) - mort * (i >= 2 ? 0.12 : 0), 0);
  }
  // ------------------------------------------------ les pattes : rentrées en vol, accroupies posé, repliées endormi
  const pat = clamp(st.pattes ?? (vol ? 0 : 1), 0, 1), PL = dort || mort ? V3_PATTES.dort : V3_PATTES.pose, PV = V3_PATTES.vol;
  for (const s of [1, -1]) {
    const S = s > 0 ? 'L' : 'R';
    set('cuisse' + S, lerp(PV[0], PL[0], pat), 0, s * lerp(0.06, dort ? 0.3 : 0.04, pat) + s * mort * 0.3);
    set('jambe' + S, lerp(PV[1], PL[1], pat), 0, 0);
    set('tarse' + S, lerp(PV[2], PL[2], pat), 0, 0);
    set('pied' + S, lerp(PV[3], PL[3], pat), 0, 0);
    for (let i = 0; i < 3; i++) set('orteil' + S + i, lerp(0.6, 0.05, pat), (i - 1) * 0.25, 0);
  }
  // ------------------------------------------------ les ailes
  const ph = st.battement || 0, amp = clamp(st.ampl ?? 1, 0, 1), pl = clamp(st.plane || 0, 0, 1), pq = clamp(st.pique || 0, 0, 1);
  const et = clamp(st.etire || 0, 0, 1);
  const RP = dort ? V3_REPLI_DORT : V3_REPLI;
  for (const s of [1, -1]) {
    const S = s > 0 ? 'L' : 'R';
    // déployées (vol) : l'humérus bat, l'avant-bras suit avec un retard ; piqué : balayées vers l'arrière
    const b = Math.sin(ph), b2 = Math.sin(ph - 0.7), bat = amp * (1 - pl);
    let h = [0, -0.04 + pq * 0.5 + bat * Math.cos(ph) * 0.1, 0.1 + bat * (b * 0.5 + 0.06) + pl * 0.04];
    let r = [0, 0.05 + pq * 0.7, -0.03 + bat * b2 * 0.26];
    // dressé pour cracher, posé : les ailes à demi ouvertes (la menace) ; s'étirer : grandes ouvertes
    const ouvre = clamp(et + cab * 0.55, 0, 1);
    const rep2 = rep * (1 - ouvre * 0.85);
    const lerpA = (A, B, k) => [lerp(A[0], B[0], k), lerp(A[1], B[1], k), lerp(A[2], B[2], k)];
    if (ouvre > 0 && !vol) { h = [0, 0.15, 0.55]; r = [0, 0.35, -0.25]; } // levées, de part et d'autre
    h = lerpA(h, RP.humerus, rep2); r = lerpA(r, RP.radius, rep2);
    if (mort) { h = [0.1, 0.25, -0.28]; r = [0, 0.2, -0.12]; }
    set('humerus' + S, h[0], s * h[1], s * h[2]);
    set('radius' + S, r[0], s * r[1], s * r[2]);
    set('poignet' + S, 0, 0, 0);
    // les doigts : en éventail (déployés) ; serrés et rabattus le long du flanc (repliés)
    const ouv = [-0.12, 0.3, 0.74, 1.22];
    for (let f = 0; f < 4; f++) {
      let d = [0, ouv[f] + pq * 0.35 * (1 - f * 0.15) + (ouvre && !vol ? 0.1 * f : 0), bat * Math.sin(ph - 1.2) * 0.1 * (1 + f * 0.3) - pl * 0.02 * f];
      d = lerpA(d, RP.doigts[f], rep2);
      if (mort) d = [0, ouv[f] * 0.85, -0.12 - f * 0.03];
      set('doigt' + (f + 1) + S, d[0], s * d[1], s * d[2]);
    }
  }
}

// ---------------------------------------------------------------- le dessin
const V3_TMP = { a: new Float32Array(12), b: new Float32Array(12), M: new Float32Array(12) };
// un point du repère d'une partie (W : sa matrice monde) → monde
function v3Pt(W, x, y, z, out) {
  out = out || [0, 0, 0];
  out[0] = W[0] * x + W[1] * y + W[2] * z + W[3];
  out[1] = W[4] * x + W[5] * y + W[6] * z + W[7];
  out[2] = W[8] * x + W[9] * y + W[10] * z + W[11];
  return out;
}
// une bande de membrane (un parallélogramme mince) : centre c, axe u (le long des doigts), axe v (en travers), épaisseur e
function v3Bande(buf, c, u, v, e, col, code) {
  const nx = u[1] * v[2] - u[2] * v[1], ny = u[2] * v[0] - u[0] * v[2], nz = u[0] * v[1] - u[1] * v[0];
  const nl = Math.hypot(nx, ny, nz) || 1, k = e / nl;
  const M = V3_TMP.M;
  M[0] = u[0]; M[1] = nx * k; M[2] = v[0]; M[3] = c[0];
  M[4] = u[1]; M[5] = ny * k; M[6] = v[1]; M[7] = c[1];
  M[8] = u[2]; M[9] = nz * k; M[10] = v[2]; M[11] = c[2];
  buf.box(M, 0, 0, 0, 1, 1, 1, col, code);
}
// une voile entre deux bords : A→B (bord avant, de la racine à la pointe) et D→C (bord arrière), n bandes ; le bord libre
// (près des pointes) est échancré entre les doigts
function v3Voile(buf, A, B, C, D, n, col, code, echancre) {
  const lerp3 = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
  for (let i = 0; i < n; i++) {
    const t0 = i / n, t1 = (i + 1) / n;
    const P0 = lerp3(A, B, t0), P1 = lerp3(A, B, t1), Q0 = lerp3(D, C, t0), Q1 = lerp3(D, C, t1);
    let c = [(P0[0] + P1[0] + Q0[0] + Q1[0]) / 4, (P0[1] + P1[1] + Q0[1] + Q1[1]) / 4, (P0[2] + P1[2] + Q0[2] + Q1[2]) / 4];
    const u = [(P1[0] + Q1[0] - P0[0] - Q0[0]) / 2, (P1[1] + Q1[1] - P0[1] - Q0[1]) / 2, (P1[2] + Q1[2] - P0[2] - Q0[2]) / 2];
    let v = [(Q0[0] + Q1[0] - P0[0] - P1[0]) / 2, (Q0[1] + Q1[1] - P0[1] - P1[1]) / 2, (Q0[2] + Q1[2] - P0[2] - P1[2]) / 2];
    // un peu plus que la largeur (les bandes se recouvrent : pas de jour entre elles)
    let ku = 1.12, kv = 1.04;
    if (echancre && i === n - 1) { kv = 0.7; c = lerp3(c, lerp3(P0, P1, 0.5), 0.3); }
    v3Bande(buf, c, [u[0] * ku, u[1] * ku, u[2] * ku], [v[0] * kv, v[1] * kv, v[2] * kv], 0.09, col, code);
  }
}
// D : { x, y, z, yaw, pitch, roll, s (échelle), rig, dist (à la caméra) }
function v3Racine(D, out) {
  m34TR(out, D.x, D.y, D.z, -(D.pitch || 0), D.yaw || 0, D.roll || 0);
  const s = D.s || 1;
  if (s !== 1) for (const k of [0, 1, 2, 4, 5, 6, 8, 9, 10]) out[k] *= s;
  return out;
}
function v3Emettre(buf, D, flags) {
  const R = D.rig, root = v3Racine(D, V3_TMP.a), loin = (D.dist || 0) > 210, fl = flags || 0;
  // les parties (les détails sont cachés de loin)
  for (const q of R.parts) if (q.det) q.hide = loin;
  R.emit(buf, root, fl);
  // les membranes : quatre voiles par aile, plus la voile du bras
  const n = loin ? 2 : 4, code = withFlags(TL.v3Membrane, fl), pt = (nm, x, y, z) => v3Pt(R.part(nm).W, x, y, z);
  for (const s of [1, -1]) {
    const S = s > 0 ? 'L' : 'R';
    const epaule = pt('humerus' + S, 0, 0.2, 0), coude = pt('radius' + S, 0, 0, 0), poignet = pt('poignet' + S, 0, 0, 0);
    const bouts = V3_DOIGTS.map(([L], f) => pt('doigt' + (f + 1) + S, s * L, 0, 0));
    const hanche = pt('bassin', s * 2.0, 0.4, -1.6), flanc = pt('ventre', s * 2.4, 0.5, 1.5);
    const col = V3_COUL.membrane, col2 = V3_COUL.membrane2;
    // la voile du bras (devant l'humérus et l'avant-bras, de l'épaule au poignet) : étroite
    const avB = pt('radius' + S, s * 3.6, 0, 0.85), avA = pt('humerus' + S, s * 2.6, 0, 0.75);
    v3Voile(buf, epaule, avA, avB, epaule, 1, col2, code, false);
    v3Voile(buf, avA, poignet, poignet, avB, 1, col2, code, false);
    // entre les doigts
    for (let f = 0; f < 3; f++) v3Voile(buf, poignet, bouts[f], bouts[f + 1], poignet, n, f % 2 ? col2 : col, code, true);
    // la grande voile : du dernier doigt au flanc et à la hanche
    v3Voile(buf, poignet, bouts[3], hanche, coude, n, col, code, true);
    v3Voile(buf, coude, hanche, flanc, epaule, Math.max(1, n - 2), col2, code, false);
  }
}
// l'ombre du Ver, au sol (disques sombres le long du corps et des ailes), projetée selon la lumière
function v3Ombre(sbuf, D, L, w) {
  const R = D.rig, pt = (nm, x, y, z) => v3Pt(R.part(nm).W, x, y, z);
  if (!L || L[1] < 0.12) return;
  const proj = (p) => {
    let g = w.heightAt(p[0], p[2]);
    for (let k = 0; k < 2; k++) { const h = Math.max(0, p[1] - g), x = p[0] - L[0] / L[1] * h, z = p[2] - L[2] / L[1] * h; g = w.heightAt(x, z); if (k === 1) return [x, Math.max(g, w.waterLevel), z]; }
    return null;
  };
  const ellipse = (a, b, larg) => {
    const A = proj(a), B = proj(b);
    if (!A || !B) return;
    const dx = B[0] - A[0], dz = B[2] - A[2], len = Math.hypot(dx, dz) + larg * 0.4;
    const y = (A[1] + B[1]) / 2 + 0.08;
    m34Root(V3_TMP.b, (A[0] + B[0]) / 2, y, (A[2] + B[2]) / 2, Math.atan2(dx, dz), 1);
    sbuf.box(V3_TMP.b, 0, 0, 0, larg, 0.02, len, [0, 0, 0], 0);
  };
  ellipse(pt('queue8', 0, 0, 0), pt('bassin', 0, 0, 0), 2.6);
  ellipse(pt('bassin', 0, 0, -2), pt('poitrine', 0, 0, 4), 5.6);
  ellipse(pt('cou2', 0, 0, 0), pt('tete', 0, 0, 3), 2.4);
  for (const s of [1, -1]) {
    const S = s > 0 ? 'L' : 'R';
    const poignet = pt('poignet' + S, 0, 0, 0), b1 = pt('doigt1' + S, s * V3_DOIGTS[0][0], 0, 0), b4 = pt('doigt4' + S, s * V3_DOIGTS[3][0], 0, 0);
    const mil = [(b1[0] + b4[0]) / 2, (b1[1] + b4[1]) / 2, (b1[2] + b4[2]) / 2];
    ellipse(pt('humerus' + S, 0, 0, 0), poignet, 7.5);
    ellipse(poignet, mil, 8.5);
  }
}

// ---------------------------------------------------------------- les objets posés : l'aire, les perchoirs, la loge du Guet
const V3P = { os: [0.86, 0.8, 0.68], os2: [0.72, 0.66, 0.56], fer: [0.4, 0.37, 0.35], rouille: [0.52, 0.34, 0.24], or: [1.05, 0.86, 0.45], noir: [0.16, 0.14, 0.13], bois: [0.45, 0.36, 0.27] };
Object.assign(PROP_MODELS, {
  // le tas : un amas de fer, d'os et d'or terni (data.n : fouillé n fois, il s'abaisse)
  v3_tas(E, o) {
    const k = 1 - clamp(((o.data && o.data.n) || 0) / 6, 0, 0.7);
    const R = mulberry32(((o.x * 13 + o.z * 7) | 0) >>> 0);
    E.bx(0, -0.3, 0, 7 * k + 1, 1.6 * k + 0.3, 6 * k + 1, [0.42, 0.36, 0.3], mt(M_V1_CENDRE));
    for (let i = 0; i < 46; i++) {
      const a = R() * TAU, d = Math.sqrt(R()) * 3.4 * k, x = Math.cos(a) * d, z = Math.sin(a) * d, h = (1.6 * k + 0.3) * (1 - d / (3.6 * k + 0.4)) + 0.05;
      const r = R(), ry = R() * TAU, rx = (R() - 0.5) * 1.2;
      if (r < 0.32) E.box(x, h, z, 0.12, 0.05, 1.3 + R(), V3P.fer, TL.iron, ry, rx);                      // une lame
      else if (r < 0.5) E.box(x, h + 0.15, z, 0.5, 0.42, 0.55, V3P.rouille, TL.iron, ry, rx);           // un casque
      else if (r < 0.66) E.box(x, h, z, 0.35, 0.06, 0.35, V3P.or, TL.gold, ry, rx);                      // des pièces, un plat
      else if (r < 0.86) E.box(x, h, z, 0.14, 0.14, 0.9 + R() * 0.6, V3P.os, TL.bone, ry, rx);          // un os
      else E.box(x, h + 0.1, z, 0.42, 0.36, 0.48, V3P.os2, TL.bone, ry, rx);                            // un crâne
    }
  },
  // l'anneau scellé, la chaîne qui pend
  v3_anneau(E) {
    E.bx(0, -0.4, 0, 2.6, 1.6, 2.2, [0.5, 0.48, 0.46], mt(M_V1_PIERRE));
    E.bx(0, 1.0, 0, 0.9, 0.5, 0.9, [0.3, 0.3, 0.32], TL.iron);
    for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; E.box(Math.cos(a) * 1.05, 2.3 + Math.sin(a) * 1.05, 0, 0.36, 0.7, 0.36, V3P.fer, TL.iron, 0, 0, a); }
    for (let k = 0; k < 4; k++) E.box(0.4 + k * 0.85, 0.35, 0.6 + k * 0.25, k % 2 ? 0.25 : 0.9, 0.9, k % 2 ? 0.9 : 0.25, V3P.rouille, TL.iron, 0.3, 0, Math.PI / 2);
  },
  // le collier ouvert (après la délivrance)
  v3_collier(E) {
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 1.1 - 0.2; E.box(Math.cos(a) * 1.6, 0.36, Math.sin(a) * 1.6, 0.72, 0.72, 0.9, V3P.fer, TL.iron, -a); }
    E.bx(1.75, 0, -0.2, 0.7, 0.6, 0.6, [0.3, 0.27, 0.25], TL.iron);
  },
  // des os : une cage thoracique (data.g : géante), un crâne de cheval, des os épars
  v3_os(E, o) {
    const g = (o.data && o.data.g) || 1, R = mulberry32(((o.x * 17 + o.z * 3) | 0) >>> 0);
    for (let i = 0; i < 7; i++) { const a = R() * TAU, d = R() * 1.4 * g; E.box(Math.cos(a) * d, 0.05, Math.sin(a) * d, 0.12 * g, 0.12 * g, (0.6 + R() * 0.8) * g, V3P.os, TL.bone, R() * TAU); }
    E.box(0.2 * g, 0.18 * g, 0.4 * g, 0.36 * g, 0.32 * g, 0.5 * g, V3P.os2, TL.bone, R() * TAU);
  },
  v3_cotes(E, o) {
    const g = (o.data && o.data.g) || 1;
    E.box(0, 0.2 * g, 0, 0.3 * g, 0.3 * g, 4.2 * g, V3P.os2, TL.bone);   // l'échine
    for (let i = 0; i < 7; i++) for (const s of [1, -1]) {
      const z = (i - 3) * 0.55 * g;
      E.box(s * 0.7 * g, 0.75 * g, z, 0.13 * g, 1.5 * g, 0.16 * g, V3P.os, TL.bone, 0, 0, s * -0.5);
      E.box(s * 1.15 * g, 0.2 * g, z, 0.12 * g, 0.9 * g, 0.15 * g, V3P.os, TL.bone, 0, 0, s * 0.35);
    }
  },
  v3_heaume(E) {
    E.bx(0, 0, 0, 0.62, 0.42, 0.66, [0.42, 0.36, 0.32], TL.iron, 0.4, 0.2);
    E.bx(0.35, 0, 0.1, 0.5, 0.12, 0.7, [0.36, 0.3, 0.26], TL.iron, 0.9);
    E.box(-0.3, 0.06, -0.2, 0.3, 0.08, 0.5, [0.3, 0.26, 0.22], TL.iron, 1.4);
  },
  // le carreau tordu, au pied de la baliste
  v3_lance(E) { E.box(0, 0.12, 0, 0.16, 0.16, 3.4, V3P.bois, TL.darkwood, 0, 0.05, 0.4); E.box(0, 0.12, 1.75, 0.08, 0.4, 0.6, V3P.fer, TL.iron); },
  // la grande arbalète de rempart, renversée, l'arc brisé
  v3_baliste(E) {
    E.box(0, 0.45, 0, 0.6, 0.5, 4.6, [0.42, 0.33, 0.25], TL.darkwood, 0, 0, 0.35);
    for (const s of [1, -1]) E.box(s * 1.4, 0.9, 1.8, 2.8, 0.3, 0.32, [0.36, 0.28, 0.22], TL.darkwood, s * 0.35, 0, s * 0.5);
    E.box(0, 0.25, -1.4, 1.6, 0.5, 0.5, [0.38, 0.3, 0.24], TL.darkwood, 0.2);
    E.bx(0.9, 0, -0.6, 0.5, 0.9, 0.5, [0.4, 0.37, 0.35], TL.iron);
  },
  // une borne aux anneaux
  v3_borne(E) {
    E.bx(0, 0, 0, 0.9, 2.2, 0.7, [0.55, 0.53, 0.5], mt(M_V1_PIERRE));
    for (const y of [1.1, 1.6]) for (const s of [1, -1]) { E.box(s * 0.5, y, 0, 0.08, 0.5, 0.5, V3P.rouille, TL.iron); }
  },
  // la chaîne du Guet : du bord de l'aire (l'origine) jusqu'au pied de la roche (data.dx, dy, dz) ; des crampons
  v3_chaine(E, o) {
    const d = o.data || {}, dx = d.dx || 0, dy = d.dy || -60, dz = d.dz || 0, L = Math.hypot(dx, dy, dz), n = Math.max(2, Math.round(L / 1.25));
    // (le repère de l'objet est tourné de o.r : on remet la direction dans le repère monde)
    const c = Math.cos(-o.r), s = Math.sin(-o.r), lx = dx * c + dz * s, lz = -dx * s + dz * c;
    const ry = Math.atan2(lx, lz), rx = Math.atan2(Math.hypot(lx, lz), -dy);
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      E.box(lx * t, dy * t, lz * t, i % 2 ? 0.16 : 0.55, 1.45, i % 2 ? 0.55 : 0.16, V3P.fer, TL.iron, ry, -rx);
      if (i % 9 === 0) E.box(lx * t, dy * t, lz * t, 0.9, 0.18, 0.18, V3P.rouille, TL.iron, ry);   // un crampon
    }
    E.bx(0, -0.3, 0, 1.2, 0.5, 1.2, [0.42, 0.4, 0.38], TL.iron);                                     // l'anneau du haut
  },
  // une écaille tombée, à plat
  v3_ecaille(E, o) { if (o.data && o.data.prise) return; E.box(0, 0.06, 0, 1.0, 0.07, 1.25, [0.5, 0.45, 0.42], mt(M_V3_ECAILLES), 0.3, 0.06, 0.04); },
  // la paillasse du Guet, le carnet dessus (data.carnet : encore là)
  v3_grabat(E, o) {
    E.bx(0, 0, 0, 1.0, 0.25, 2.0, [0.5, 0.42, 0.32], TL.straw);
    E.bx(0, 0.25, 0.6, 0.9, 0.1, 0.7, [0.42, 0.36, 0.3], TL.cloth);
    if (o.data && o.data.carnet) E.bx(0.15, 0.26, -0.4, 0.26, 0.06, 0.34, [0.42, 0.28, 0.2], TL.leather);
  },
  // la cloche du Guet, sur son portique (data.t : le temps qu'elle balance)
  v3_cloche(E, o, T) {
    for (const s of [1, -1]) E.bx(s * 1.1, 0, 0, 0.28, 3.2, 0.28, [0.4, 0.32, 0.25], TL.darkwood);
    E.bx(0, 3.2, 0, 2.6, 0.3, 0.34, [0.4, 0.32, 0.25], TL.darkwood);
    const a = typeof dragonV3 !== 'undefined' ? dragonV3.clocheAngle() : 0;
    const L = E._L, M0 = new Float32Array(E.M);
    m34TR(L, 0, 3.15, 0, a, 0, 0); m34Mul(E.M, M0, L);
    E.bx(0, -1.05, 0, 0.78, 0.9, 0.78, [0.36, 0.5, 0.4], TL.metal);
    E.bx(0, -1.2, 0, 0.98, 0.18, 0.98, [0.32, 0.46, 0.36], TL.metal);
    E.box(0, -1.25, 0, 0.12, 0.5, 0.12, [0.3, 0.3, 0.3], TL.iron);
    E.M.set(M0);
    E.box(0.5, 1.4, 0.15, 0.04, 2.2, 0.04, [0.6, 0.52, 0.4], TL.rope, 0, 0.08);
  },
});
// des collisions (blocs cachés) pour ce qui est gros
Object.assign(PROP_COLL, { v3_tas: [3.2, 2.8, 1.4], v3_anneau: [1.3, 1.1, 3.4], v3_baliste: [1.2, 2.3, 1.2], v3_borne: [0.45, 0.35, 2.2], v3_cloche: [1.3, 0.25, 3.4] });
