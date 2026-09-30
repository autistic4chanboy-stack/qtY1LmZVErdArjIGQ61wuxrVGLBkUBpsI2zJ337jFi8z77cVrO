// ============================================================================
//  LE DESSOUS — ce qui pousse et ce qui se casse (agent C3)
//  - des minerais d'en bas, en filons : la galène (l'argent, au four), le cristal
//    de roche (une lentille pour la lanterne), la pierre luisante (elle boit le
//    jour et le rend dans le noir), la magnétite (qui affole les boussoles), le
//    soufre et le salpêtre, et les perles des vasques ;
//  - des plantes d'en bas, chacune son objet, son effet, ses essences : le
//    pied-de-pierre, la mousse luisante, le lichen d'argent, la fougère pâle,
//    la racine du grand chêne, l'algue blanche, le chapeau-de-suie (et le
//    champignon lumineux des grottes, qu'on connaissait déjà) ; le guano ;
//  - la pêche dans les eaux d'en bas (les poissons des eaux souterraines).
//  Cueillir, casser : E (une pioche pour les filons). État : farm.s.souterrain.c
//  (id stable → jour de la cueillette ; filons : ce qui en reste).
// ============================================================================

// ---------------------------------------------------------------- les objets
defItem('galene', 'Galène', 'materiau', 9, ['minerai', '#7a808c'], { desc: 'Un minerai lourd, gris-bleu, qui brille comme du plomb frais coupé. Au four, avec du charbon, il rend un peu d’argent.' });
defItem('lingot_argent', 'Lingot d’argent', 'materiau', 35, ['lingot', '#d8dce4'], { desc: 'De l’argent fondu, tiré de la galène d’en bas. Il noircit vite à l’air, et redevient blanc sous le pouce.' });
defItem('cristal_roche', 'Cristal de roche', 'materiau', 12, ['gemme', '#e8f0f8'], { desc: 'Un prisme d’eau figée, clair comme le verre, pointu aux deux bouts. On voit à travers, un peu de travers.' });
defItem('lentille_cristal', 'Lentille de cristal', 'materiau', 70, ['so_lentille', '#e8f0f8'], { desc: 'Un cristal de roche taillé en galet, serti d’argent. Posée devant la flamme de la lanterne, elle porte la lumière plus loin sous la terre. Il suffit de l’avoir sur soi.' });
defItem('luisante', 'Pierre luisante', 'materiau', 14, ['so_luisante', '#8ae8d0'], { desc: 'Clic : la montrer, ou la cacher. Laissée au grand jour, elle boit la lumière ; dans le noir, elle la rend, froide et verte, un moment. Elle ne brûle rien.' });
defItem('magnetite', 'Magnétite', 'materiau', 8, ['minerai', '#2e2c30'], { desc: 'Une pierre noire, lourde, qui retient les clous. Près d’elle, les boussoles perdent le nord.' });
defItem('soufre', 'Soufre', 'materiau', 3, ['tas', '#e0c840'], { alch: true, desc: 'Des croûtes jaunes, grasses au toucher, qui sentent l’œuf pourri et l’allumette.' });
defItem('salpetre', 'Salpêtre', 'materiau', 3, ['tas', '#ece8de'], { alch: true, desc: 'Une fleur blanche qui pousse sur les parois sèches, comme du givre. Elle pique la langue.' });
defItem('perle_caverne', 'Perle des cavernes', 'materiau', 40, ['so_perle', '#f0ece0'], { desc: 'Roulée pendant des siècles par l’eau qui goutte, au fond d’une vasque : ronde, laiteuse, sans défaut. Elle n’a jamais vu le jour.' });
defItem('pied_pierre', 'Pied-de-pierre', 'cueillette', 2, ['champi', '#dcd6c6', '#a89c88'], { food: 5, desc: 'Un champignon blanc, dur comme la craie, qui pousse sur l’argile des rives, en bas. Cru, il se défend.' });
defItem('pied_pierre_grille', 'Pieds-de-pierre grillés', 'nourriture', 6, ['champi', '#b8a078', '#8a7050'], { food: 26, desc: 'Grillés sur la braise, ils rendent une odeur de noisette et de cave. Nourrissants.' });
defItem('mousse_luisante', 'Mousse luisante', 'cueillette', 2, ['lichen', '#3ad8a8'], { alch: true, desc: 'Une mousse verte qui luit dans le noir. Dans la main, elle pâlit en une heure ; dans un bocal humide, dit-on, elle tient des jours.' });
defItem('lichen_argent', 'Lichen d’argent', 'cueillette', 4, ['lichen', '#c8ccd4'], { alch: true, desc: 'Une croûte grise, presque blanche, qui ne pousse que sur les pierres où dort du minerai. Il sent le fer.' });
defItem('fougere_pale', 'Fougère pâle', 'cueillette', 2, ['herbes', '#c8d8b0'], { food: 1, desc: 'Une fougère décolorée, presque blanche, qui pousse sous le seul rayon de jour d’en bas. Elle sent le foin mouillé.' });
defItem('racine_chene', 'Racine du grand chêne', 'cueillette', 5, ['racine', '#6a5038'], { food: 1, desc: 'Une racine vivante, épaisse comme le poignet, qui pendait de la voûte. Elle vient de là-haut. De très haut.' });
defItem('algue_blanche', 'Algue blanche', 'cueillette', 2, ['herbes', '#ece8dc'], { food: 6, desc: 'Des rubans blancs qui flottent dans l’eau tiède d’en bas. Salés, un peu gluants.' });
defItem('chapeau_suie', 'Chapeau-de-suie', 'cueillette', 3, ['champi', '#2e2a28', '#c8b840'], { food: 1, desc: 'Un petit champignon noir, poudré de jaune, qui ne pousse qu’au bord des souffles chauds. Il noircit les doigts.' });
defItem('guano', 'Guano', 'materiau', 2, ['tas', '#5a4a36'], { fert: 2, desc: 'Ce que laissent les chauves-souris sous leurs voûtes. Sur une culture, un engrais très fort. Il sent l’ammoniaque.' });
Object.assign(ESSENCES, {
  galene: { terre: 2, mort: 1 }, lingot_argent: { lumiere: 2, froid: 1 }, cristal_roche: { lumiere: 2, froid: 1, esprit: 1 }, luisante: { lumiere: 3, ombre: 1 },
  magnetite: { terre: 3, air: 1 }, soufre: { feu: 3, mort: 1 }, salpetre: { froid: 2, feu: 1 }, perle_caverne: { eau: 2, ombre: 1, sort: 1 },
  pied_pierre: { terre: 3, vie: 1 }, mousse_luisante: { lumiere: 2, eau: 1, vie: 1 }, lichen_argent: { froid: 1, lumiere: 1, terre: 1 }, fougere_pale: { ombre: 1, air: 1, esprit: 1 },
  racine_chene: { vie: 3, terre: 2 }, algue_blanche: { eau: 3, vie: 1 }, chapeau_suie: { mort: 2, feu: 2 }, guano: { terre: 1, mort: 1, air: 1 },
});
Object.assign(PLANT_LOOK, {
  pied_pierre: ['Champignon blanc et dur', 'Un champignon trapu, blanc de craie, qui sonne presque quand on le cogne.'],
  mousse_luisante: ['Mousse qui luit', 'Une mousse d’un vert trop vif, qui luit faiblement dans le creux de la main.'],
  lichen_argent: ['Croûte presque blanche', 'Une croûte grise, presque argentée, qui sent le fer mouillé.'],
  fougere_pale: ['Fougère décolorée', 'Une fougère sans couleur, comme une plante qu’on aurait oubliée dans une cave.'],
  racine_chene: ['Racine épaisse et vivante', 'Une racine noueuse, encore humide de sève, arrachée à une voûte.'],
  algue_blanche: ['Rubans blancs, gluants', 'Des rubans pâles, un peu salés, qui glissent entre les doigts.'],
  chapeau_suie: ['Petit champignon noir poudré', 'Un chapeau noir comme la suie, poudré de jaune, qui laisse les doigts noirs.'],
});
Object.assign(ALIMENTS_EFFETS, {
  pied_pierre: { c: 'du pied-de-pierre cru', r: [['coliques', 0.45, 40, 160], ['nausee', 0.3, 30, 120]] },
  pied_pierre_grille: { r: [['vigueur', 0.25, 20, 60]] },
  algue_blanche: { r: [['calme', 0.35, 10, 50]] },
  fougere_pale: { r: [['somnolence', 0.55, 30, 120]] },
  racine_chene: { r: [['vigueur', 0.5, 20, 60], ['nausee', 0.2, 30, 90]] },
  chapeau_suie: { c: 'des chapeaux-de-suie', r: [['poison', 0.75, 30, 120, 2], ['fievre', 0.5, 60, 200], ['hallucinations', 0.4, 60, 180]] },
  mousse_luisante: { r: [['vision_nuit', 0.5, 20, 60, 1, 120, 200], ['nausee', 0.3, 20, 80]] },
});
ITEMS.mousse_luisante.food = 1;
RECIPES.push(
  { out: 'lingot_argent', n: 1, need: { galene: 3, charbon: 1 }, st: 'four' },
  { out: 'lentille_cristal', n: 1, need: { cristal_roche: 2, lingot_argent: 1 }, st: 'etabli' },
  { out: 'pied_pierre_grille', n: 1, need: { pied_pierre: 3 }, st: 'feu' },
);
// ce que la guérisseuse et l'alchimiste reprennent volontiers
{
  const g = NPC_DATA.find((d) => d.id === 'guerisseuse');
  if (g && g.shop && g.shop.buys) for (const id of ['mousse_luisante', 'lichen_argent', 'fougere_pale', 'racine_chene']) if (!g.shop.buys.includes(id)) g.shop.buys.push(id);
}
// les icônes
{
  const _ip = iconPaint;
  iconPaint = function (shape, c1, c2) {
    if (typeof shape !== 'string' || !shape.startsWith('so_')) return _ip(shape, c1, c2);
    const pb = new PixelBuf(16, 16), P = rampOf(c1 || '#aaaaaa');
    const S = (cx, cy, r, pal, o) => drawSphere(pb, cx, cy, r, pal || P, (cx * 7 + cy) | 0, o || {});
    const L = (x0, y0, x1, y1, c, w) => drawLine(pb, x0, y0, x1, y1, typeof c === 'string' ? hexToRgb(c) : c, w || 1);
    switch (shape) {
      case 'so_luisante': S(8, 9, 5.5, rampOf('#3a4a44'), { sq: 0.8, noise: 0.3 }); for (const [x, y] of [[6, 8], [9, 7], [10, 10], [7, 11], [8, 9]]) pb.set(x, y, [120, 250, 200], EMISSIVE_A); break;
      case 'so_perle': S(8, 9, 4.5, rampOf('#e8e2d2')); pb.set(6, 7, [255, 255, 250]); pb.set(7, 6, [255, 255, 250]); break;
      case 'so_lentille': for (let a = 0; a < 40; a++) { const t = a / 40 * TAU; pb.set(8 + Math.cos(t) * 5.5, 8 + Math.sin(t) * 5.5, [200, 204, 214]); pb.set(8 + Math.cos(t) * 6, 8 + Math.sin(t) * 6, [150, 154, 164]); } S(8, 8, 4.6, rampOf('#c8e0f0'), { sq: 1 }); pb.set(6, 6, [255, 255, 255]); L(8, 14, 8, 15, '#9a9ea8'); break;
      default: return _ip(shape, c1, c2);
    }
    edgeDarken(pb, 0.85);
    return pb;
  };
}

// ---------------------------------------------------------------- où ça pousse, où ça se casse (génération)
// [objet posé, cueillette (objet), zones (clés du plan ; '*' partout), nombre, repousse (jours ; 0 : jamais), place : 'mur' | 'sol' | 'eau' | 'rive']
const SOUT_CUEILLETTES = [
  ['sout_filon', 'galene', ['mines', 'souffle', 'gouffres'], 26, 0, 'mur', { m: 'galene' }],
  ['sout_filon', 'magnetite', ['gouffres', 'echos', 'descente'], 12, 0, 'mur', { m: 'magnetite' }],
  ['sout_filon', 'soufre', ['souffle', 'fissure'], 14, 0, 'mur', { m: 'soufre' }],
  ['sout_filon', 'salpetre', ['*'], 22, 0, 'mur', { m: 'salpetre' }],
  ['sout_filon', 'luisante', ['hameau', 'ruines', 'orgues', 'dormeurs'], 10, 0, 'mur', { m: 'luisante' }],
  ['sout_filon', 'cristal_roche', ['cristal_a', 'cristal_b', 'cristal_c', 'cristal_ab', 'cristal_ac'], 16, 0, 'mur', { m: 'cristal' }],
  ['sout_vasque', 'perle_caverne', ['dormeurs', 'orgues', 'cristal_a', 'lac'], 8, 0, 'sol', {}],
  ['sout_pied_pierre', 'pied_pierre', ['riviere', 'lac', 'lac_tiede', 'vers_riviere', 'ruines_lac', 'mines_riviere'], 30, 3, 'rive', {}],
  ['sout_mousse', 'mousse_luisante', ['*'], 40, 4, 'mur', {}],
  ['sout_lichen', 'lichen_argent', ['mines', 'mines_n', 'mines_s', 'souffle', 'gouffres'], 16, 5, 'mur', {}],
  ['sout_fougere', 'fougere_pale', ['racines'], 12, 3, 'sol', {}],
  ['sout_algue', 'algue_blanche', ['lac_tiede', 'hameau'], 14, 2, 'eau', {}],
  ['sout_suie', 'chapeau_suie', ['souffle', 'fissure'], 12, 4, 'sol', {}],
  ['sout_guano', 'guano', ['nef', 'echos', 'gouffres', 'racines'], 12, 4, 'sol', {}],
];
SOUT_GEN.push((w, rnd, B) => {
  const S = souterrain;
  S.creuseurs();
  // les points d'échantillonnage de chaque zone (salles, lacs, galeries, rivière)
  const zones = {};
  const add = (k, x, z) => (zones[k] || (zones[k] = [])).push([x, z]);
  for (const [key, cx, cz, rx, rz, rot] of SOUT_PLAN.salles) { const co = Math.cos(rot), si = Math.sin(rot); for (let k = 0; k < 90; k++) { const a = rnd() * TAU, r = Math.sqrt(rnd()), lx = Math.cos(a) * r * rx, lz = Math.sin(a) * r * rz; add(key, cx + lx * co + lz * si, cz - lx * si + lz * co); } }
  for (const [key, cx, cz, rx, rz, rot] of SOUT_PLAN.lacs) { const co = Math.cos(rot), si = Math.sin(rot); for (let k = 0; k < 160; k++) { const a = rnd() * TAU, r = 0.75 + rnd() * 0.3, lx = Math.cos(a) * r * rx, lz = Math.sin(a) * r * rz; add(key, cx + lx * co + lz * si, cz - lx * si + lz * co); } }
  for (const [key, pts] of SOUT_PLAN.galeries) for (let i = 0; i + 1 < pts.length; i++) { const A = pts[i], Bq = pts[i + 1], L = Math.hypot(Bq[0] - A[0], Bq[1] - A[1]); for (let s = 0; s < L; s += 4) { const t = s / L, a = rnd() * TAU, d = rnd() * A[3]; add(key, lerp(A[0], Bq[0], t) + Math.cos(a) * d, lerp(A[1], Bq[1], t) + Math.sin(a) * d); if (/^mines/.test(key)) add('mines', lerp(A[0], Bq[0], t), lerp(A[1], Bq[1], t)); } }
  for (let i = 0; i + 1 < SOUT_PLAN.riviere.length; i++) { const A = SOUT_PLAN.riviere[i], Bq = SOUT_PLAN.riviere[i + 1], L = Math.hypot(Bq[0] - A[0], Bq[1] - A[1]); for (let s = 0; s < L; s += 3) { const t = s / L, a = rnd() * TAU, d = rnd() * A[2] * 1.1; add('riviere', lerp(A[0], Bq[0], t) + Math.cos(a) * d, lerp(A[1], Bq[1], t) + Math.sin(a) * d); } }
  const tous = Object.values(zones).flat();
  const mur = (x, z, h) => { for (let a = 0; a < 8; a++) { const b = a / 8 * TAU; if (!S.ouvert(x + Math.cos(b) * 2.2, z + Math.sin(b) * 2.2, h || 1.2)) return b; } return null; };
  const pris = [];
  const loin = (x, z, d) => { for (const q of pris) if (Math.abs(q[0] - x) < d && Math.abs(q[1] - z) < d) return false; return true; };
  let seq = 0;
  const L = w.soutCueillettes || (w.soutCueillettes = []);
  for (const [id, item, zs, n, every, place, data] of SOUT_CUEILLETTES) {
    const src = zs[0] === '*' ? tous : zs.flatMap((k) => zones[k] || []);
    if (!src.length) continue;
    let m = 0;
    for (let k = 0; k < n * 30 && m < n; k++) {
      const [x, z] = src[(rnd() * src.length) | 0];
      const f = S.floorAt(x, z), v = S.vaultAt(x, z);
      if (f > SOUT_ROCK - 1 || v - f < 2 || !loin(x, z, 3)) continue;
      let r = rnd() * TAU, y = f;
      if (place === 'eau') { if (f > SOUT_WL - 0.2 || f < SOUT_WL - 1.4) continue; y = SOUT_WL + 0.01; }
      else if (f < SOUT_WL + 0.15) continue;
      if (place === 'rive') { let eau = false; for (let a = 0; a < 6 && !eau; a++) { const b = a / 6 * TAU; if (S.floorAt(x + Math.cos(b) * 4, z + Math.sin(b) * 4) < SOUT_WL - 0.2) eau = true; } if (!eau) continue; }
      if (place === 'mur') { const b = mur(x, z); if (b === null) continue; r = Math.atan2(Math.cos(b), Math.sin(b)); }
      if (place === 'sol' && (S.normalAt(x, z)[1] < 0.8 || mur(x, z, 2) !== null && id === 'sout_guano')) continue;
      const q = B.prop(id, x, y, z, r, Object.assign({ k: 'c' + seq, it: item, every }, data, id === 'sout_filon' ? { n: 3 + ((rnd() * 3) | 0) } : {}), undefined, VER_SOUS);
      L.push(w.props.length - 1); seq++; m++; pris.push([x, z]);
      void q;
    }
  }
});

// ---------------------------------------------------------------- cueillir, casser
const soutCueille = {
  C() { const S = souterrain.S(); return S.c || (S.c = {}); },
  // l'état sauvegardé remis sur les objets posés (au chargement, chaque matin)
  appliquer() {
    const w = game.world;
    if (!w || !w.soutCueillettes) return;
    const C = this.C(), day = farm.s.day;
    let chg = false;
    for (const i of w.soutCueillettes) {
      const q = w.props[i];
      if (!q || !q.data) continue;
      const c = C[q.data.k];
      if (q.id === 'sout_filon') { const n = c && c.n !== undefined ? c.n : q.data.n0 !== undefined ? q.data.n0 : q.data.n; if (q.data.n0 === undefined) q.data.n0 = q.data.n; if (q.data.n !== n) { q.data.n = n; chg = true; } continue; }
      const pris = !!(c && c.j && (!q.data.every || day - c.j < q.data.every));
      if (!!q.data.pris !== pris) { q.data.pris = pris; q.data.lit = pris ? false : undefined; chg = true; }
    }
    if (chg) { farm.dirtyProps = true; w.objectsDirty = true; }
    this.grille();
  },
  // grille de 8 m des objets à cueillir (pour la touche E)
  grille() {
    const w = game.world, G = new Map();
    for (const i of w.soutCueillettes || []) { const q = w.props[i]; if (!q) continue; const k = Math.floor(q.x / 8) + ',' + Math.floor(q.z / 8); (G.get(k) || G.set(k, []).get(k)).push(q); }
    this.G = G;
  },
  cibles(eye, f, cand) {
    if (!souterrain.actif || !this.G) return;
    const cx = Math.floor(eye[0] / 8), cz = Math.floor(eye[2] / 8);
    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
      const L = this.G.get((cx + dx) + ',' + (cz + dz));
      if (!L) continue;
      for (const q of L) {
        if (q.data.pris || (q.id === 'sout_filon' && q.data.n <= 0)) continue;
        const ty = q.y + (q.id === 'sout_filon' ? 0.45 : 0.2), ddx = q.x - eye[0], ddy = ty - eye[1], ddz = q.z - eye[2], d = Math.hypot(ddx, ddy, ddz);
        if (d > 2.7) continue;
        const cos = (ddx * f[0] + ddy * f[1] + ddz * f[2]) / (d || 1);
        if (cos < 0.72) continue;
        cand({ kind: 'hook', sout: q, use: () => this.prendre(q) }, d * (1.6 - cos * 0.6));
      }
    }
  },
  prendre(q) {
    const C = this.C(), d = q.data, id = d.it, day = farm.s.day;
    if (q.id === 'sout_filon') return this.casser(q);
    if (d.pris) return;
    const n = q.id === 'sout_guano' ? 2 + ((Math.random() * 2) | 0) : q.id === 'sout_algue' ? 2 : 1;
    farm.give(id, n); play.flyer(id, [q.x, q.y + 0.3, q.z], n);
    sound.pop && sound.pop();
    C[d.k] = { j: day };
    d.pris = true; d.lit = false;
    farm.dirtyProps = true; game.world.objectsDirty = true;
    if (typeof savoir !== 'undefined' && savoir.voir) savoir.voir(id);
    if (q.id === 'sout_vasque' && !C.perleDit) { C.perleDit = 1; ui.subtitle('', '(Au fond de l’eau, une bille laiteuse. Elle roule dans la paume, lourde et tiède.)', 4); }
  },
  // un filon : trois coups de pioche par morceau
  casser(q) {
    const d = q.data, C = this.C();
    const pioche = farm.bestTool('pioche');
    if (!pioche) { if (!C.piocheDit) { C.piocheDit = 1; ui.subtitle('', '(Ça ne se détache pas à la main. Il faudrait une pioche.)', 3); } sound.dig && sound.dig(0.3); return; }
    if (play.cool > 0) return;
    play.cool = 0.45; play.swingT = 0.42;
    sound.dig && sound.dig(0.8); soutSon.clang(0.35);
    const c = d.m === 'soufre' ? [220, 190, 60] : d.m === 'salpetre' ? [230, 228, 220] : d.m === 'luisante' ? [120, 240, 200] : d.m === 'cristal' ? [220, 230, 255] : [120, 124, 134];
    puffAt(q.x, q.y + 0.5, q.z, c, 8, 1.6, true);
    q.coups = (q.coups || 0) + 1 + ((ITEMS[pioche] && ITEMS[pioche].tier) || 0) * 0.5;
    if (q.coups < 3) return;
    q.coups = 0;
    const n = d.m === 'soufre' || d.m === 'salpetre' ? 2 : 1;
    farm.give(d.it, n); play.flyer(d.it, [q.x, q.y + 0.6, q.z], n);
    d.n = Math.max(0, d.n - 1);
    C[d.k] = { n: d.n };
    farm.dirtyProps = true;
    if (d.n <= 0) sound.pop && sound.pop();
  },
};
HOOKS.target.push((eye, f, cand) => soutCueille.cibles(eye, f, cand));
HOOKS.load.push(() => soutCueille.appliquer());
HOOKS.day.push(() => soutCueille.appliquer());
// l'objet visé brille un peu (comme les autres objets posés)
HOOKS.update.push(() => { const t = game.target; if (t && t.sout) game.hiProp = t.sout; });

// ---------------------------------------------------------------- la pierre luisante : elle boit le jour, elle le rend dans le noir
const soutLuisante = {
  MAX: 480,
  S() { const S = souterrain.S(); if (typeof S.lum !== 'number') S.lum = 0; return S; },
  on: false,
  update(dt, sky) {
    if (!farm.s || game.kind !== 'farm') return;
    const S = this.S(), p = game.player, n = farm.count('luisante');
    if (!n) { this.on = false; return; }
    // au grand jour, dehors : elle se charge (une minute pour être pleine)
    if (!p.underground && sky && sky.day > 0.55 && !game.world.covered(p.pos[0], p.pos[1] + 1.2, p.pos[2]) && S.lum < this.MAX) {
      S.lum = Math.min(this.MAX, S.lum + dt * 8);
      if (S.lum >= this.MAX && !this.pleineDit) { this.pleineDit = true; }
    }
    if (this.on && !game.sleeping) {
      S.lum = Math.max(0, S.lum - dt);
      if (S.lum <= 0) { this.on = false; ui.subtitle('', '(La pierre s’éteint. Elle n’est plus qu’une pierre.)', 3); }
    }
  },
  basculer() {
    const S = this.S();
    if (this.on) { this.on = false; sound.click && sound.click(); return; }
    if (S.lum <= 1) { ui.subtitle('', '(La pierre reste grise. Il lui faudrait le jour.)', 3); return; }
    this.on = true; this.pleineDit = false; sound.click && sound.click();
  },
  lumieres(eye) {
    if (!this.on || !farm.s) return [];
    const S = this.S(), k = clamp(S.lum / 90, 0.25, 1) * (0.93 + Math.sin(game.time * 1.7) * 0.04);
    return [{ x: eye[0] + 0.25, y: eye[1] - 0.3, z: eye[2], r: 8.5, c: [0.22 * k, 0.68 * k, 0.52 * k], d: 0.02 }];
  },
};
HOOKS.update.push((dt, eye, basis, sky) => soutLuisante.update(dt, sky));
HOOKS.lights.push((eye) => soutLuisante.lumieres(eye));
HOOKS.primary.push((eye, basis, held, it, id) => { if (id !== 'luisante' || held) return false; soutLuisante.basculer(); play.cool = 0.4; return true; });
soutEntree.lumieres.push(() => soutLuisante.on);
HOOKS.load.push(() => { soutLuisante.on = false; soutLuisante.S(); });

// ---------------------------------------------------------------- la pêche dans les eaux d'en bas
{
  const _fc = play.fishClick.bind(play);
  play.fishClick = function (eye, f) { return souterrain.avecMonde(() => _fc(eye, f)); };
  const _fz = play.fishZone.bind(play);
  play.fishZone = function (x, z) { if (souterrain.actif) return 'souterrain'; return _fz(x, z); };
}
