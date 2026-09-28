// ============================================================================
//  LES PROFONDEURS ET LES HAUTEURS (vallée dessinée) :
//  - les Galeries : sous les contreforts, un labyrinthe de mine de plus de
//    cent mètres de côté (galeries étroites, salles, lac souterrain, grotte
//    aux cristaux, chapelle des profondeurs, éboulement, dépôt), où l'on se
//    perd ; des mains peintes montrent la sortie à qui sait les lire ; trois
//    issues (le puits de la mine, la Combe Perdue, une faille près du refuge) ;
//  - le refuge du col, les cairns de la piste, le lac gelé et son trou de pêche,
//    les crevasses et ceux qui y sont tombés, le lac Noir ;
//  - les sigles : des signes gravés, peints ou tracés qui ressemblent à des
//    religions (connues ou non), un peu partout.
// ============================================================================
const MAZE = { CX: 1540, CZ: 1168, R: 1.5, NC: 15, SP: 5, Hc: 3.4 };

function buildMineMaze(w, B, D, mineSite, interById) {
  const rnd = mulberry32(D.seed * 3 + 1), WL = D.WL, { R, NC, SP, Hc } = MAZE;
  const G = NC * SP + 1, x0 = MAZE.CX - G * R / 2, z0 = MAZE.CZ - G * R / 2, y = WL - 14;
  const f = { x: MAZE.CX, y, z: MAZE.CZ, r: 0 };
  const open = new Uint8Array(G * G), room = new Uint8Array(G * G);
  const O = (i, j, v = 1) => { if (i > 0 && j > 0 && i < G - 1 && j < G - 1) open[j * G + i] = v; };
  const isOpen = (i, j) => i >= 0 && j >= 0 && i < G && j < G && open[j * G + i] === 1;
  const W2 = (i, j) => [x0 + (i + 0.5) * R, z0 + (j + 0.5) * R]; // centre d'une case -> monde
  const C = (ci) => ci * SP + 2; // case centrale d'une cellule
  // labyrinthe parfait (parcours en profondeur), puis quelques boucles
  const seen = new Uint8Array(NC * NC), links = [];
  const stack = [[0, (NC / 2) | 0]];
  seen[stack[0][1] * NC] = 1;
  while (stack.length) {
    const [ci, cj] = stack[stack.length - 1];
    const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => [ci + a, cj + b]).filter(([a, b]) => a >= 0 && b >= 0 && a < NC && b < NC && !seen[b * NC + a]);
    if (!nb.length) { stack.pop(); continue; }
    const [ni, nj] = nb[(rnd() * nb.length) | 0];
    seen[nj * NC + ni] = 1; links.push([ci, cj, ni, nj]); stack.push([ni, nj]);
  }
  for (let k = 0; k < NC * NC * 0.16; k++) {
    const ci = (rnd() * NC) | 0, cj = (rnd() * NC) | 0, [a, b] = rnd() < 0.5 ? [1, 0] : [0, 1];
    if (ci + a < NC && cj + b < NC) links.push([ci, cj, ci + a, cj + b]);
  }
  // galeries (2 cases de large), carrefours
  for (const [ai, aj, bi, bj] of links) {
    const i0 = Math.min(C(ai), C(bi)), i1 = Math.max(C(ai), C(bi)), j0 = Math.min(C(aj), C(bj)), j1 = Math.max(C(aj), C(bj));
    for (let j = j0; j <= j1 + 1; j++) for (let i = i0; i <= i1 + 1; i++) O(i, j);
  }
  // salles : [cellule i, j, demi-largeur, demi-profondeur, sorte]
  const rooms = [[1, 7, 2, 2, 'entree'], [7, 7, 4, 3, 'lac'], [12, 3, 3, 3, 'cristaux'], [3, 12, 3, 2, 'chapelle'], [11, 11, 3, 3, 'eboulement'], [5, 3, 3, 2, 'depot'], [14, 1, 2, 2, 'combe'], [14, 13, 2, 2, 'faille'], [9, 13, 2, 2, 'mineur']];
  for (const [ci, cj, hw, hd] of rooms) for (let j = C(cj) - hd; j <= C(cj) + 1 + hd; j++) for (let i = C(ci) - hw; i <= C(ci) + 1 + hw; i++) { O(i, j); if (i > 0 && j > 0 && i < G - 1 && j < G - 1) room[j * G + i] = 1; }
  // blocs : sol et plafond d'un seul tenant, murs = roche qui borde le vide (fusionnée en rectangles)
  const n0 = w.blocks.length;
  B.block(f, 0, -0.6, 0, G * R, 0.6, G * R, M_ROCK);
  B.block(f, 0, Hc, 0, G * R, 0.8, G * R, M_CLIFF); w.blocks[w.blocks.length - 1].ceil = true;
  const wall = new Uint8Array(G * G);
  for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
    if (isOpen(i, j)) continue;
    let near = false;
    for (let b = -1; b <= 1 && !near; b++) for (let a = -1; a <= 1; a++) if (isOpen(i + a, j + b)) { near = true; break; }
    if (near) wall[j * G + i] = 1;
  }
  const used = new Uint8Array(G * G);
  for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
    if (!wall[j * G + i] || used[j * G + i]) continue;
    let wd = 1; while (i + wd < G && wall[j * G + i + wd] && !used[j * G + i + wd]) wd++;
    let hd = 1; outer: for (; j + hd < G; hd++) for (let a = 0; a < wd; a++) if (!wall[(j + hd) * G + i + a] || used[(j + hd) * G + i + a]) break outer;
    for (let b = 0; b < hd; b++) for (let a = 0; a < wd; a++) used[(j + b) * G + i + a] = 1;
    const cx = x0 + (i + wd / 2) * R, cz = z0 + (j + hd / 2) * R;
    w.blocks.push({ x: cx, y, z: cz, sx: wd * R, sy: Hc, sz: hd * R, r: 0, m: rnd() < 0.06 ? M_ORE : M_CLIFF, sh: 0 });
  }
  for (let k = n0; k < w.blocks.length; k++) w.blocks[k].under = true;
  // repères utiles
  const cellW = (ci, cj) => W2(C(ci) + 0.5, C(cj) + 0.5);
  const at = (ci, cj, dx = 0, dz = 0) => { const [x, z] = cellW(ci, cj); return [x + dx, z + dz]; };
  const [sx, sz] = at(1, 7);
  const trap = interById('mine_profonde');
  if (trap) {
    trap.data.to = [sx, y + 0.05, sz];
    B.prop('echelle', sx - 2.2, y, sz - 2.2, 0, { h: Hc });
    B.inter('ladder', 'mine_haut', sx - 2.2, y + 1.0, sz - 1.8, 'Remonter l’échelle', { to: [trap.x, trap.y - 0.6, trap.z] });
  }
  // les issues : la Combe Perdue (au bord du lac Noir), la faille du refuge
  const exits = [['combe', 14, 1, [1392, 902], 'Descendre dans la vieille galerie', 'Remonter vers la lumière'], ['faille', 14, 13, [1644, 700], 'Se glisser dans la faille', 'Remonter par la faille']];
  for (const [key, ci, cj, [ex, ez], down, up] of exits) {
    const [mx, mz] = at(ci, cj);
    const ey = w.heightAt(ex, ez);
    B.prop('bouche_mine', ex, ey, ez, Math.atan2(1392 - ex + 0.01, 870 - ez), { petite: key === 'faille' });
    B.inter('ladder', 'galerie_' + key, ex, ey + 1.0, ez, down, { to: [mx, y + 0.05, mz] });
    B.prop('echelle', mx + 1.6, y, mz + 1.6, 0, { h: Hc });
    B.inter('ladder', 'galerie_' + key + '_haut', mx + 1.6, y + 1.0, mz + 1.2, up, { to: [ex + 1.5, ey + 0.2, ez + 1.5] });
    B.landmark(key === 'combe' ? 'bouche_galerie' : 'faille', ex, ez, 6, key === 'faille' ? { secret: true } : null);
  }
  B.landmark('galeries', MAZE.CX, MAZE.CZ, 60, { under: true });
  w.maze = { x0, z0, G, R, y, open, exit: at(1, 7) };
  // décor : étais, rails, wagonnets, lanternes (près de l'entrée seulement), filons, caisses
  const O2 = [];
  for (let j = 1; j < G - 1; j++) for (let i = 1; i < G - 1; i++) if (isOpen(i, j) && !room[j * G + i]) O2.push([i, j]);
  // étais : seulement en travers d'une galerie de deux cases exactement (les poteaux touchent les parois)
  for (let k = 0, t = 0; k < 90 && t < 900; t++) {
    const [i, j] = O2[(rnd() * O2.length) | 0];
    if (isOpen(i - 1, j) && isOpen(i + 1, j) && !isOpen(i, j - 1) && isOpen(i, j + 1) && !isOpen(i, j + 2)) { const [x, z] = W2(i, j + 0.5); B.prop('etai', x, y, z, Math.PI / 2); k++; }
    else if (isOpen(i, j - 1) && isOpen(i, j + 1) && !isOpen(i - 1, j) && isOpen(i + 1, j) && !isOpen(i + 2, j)) { const [x, z] = W2(i + 0.5, j); B.prop('etai', x, y, z, 0); k++; }
  }
  for (let k = 0; k < 26; k++) {
    const [i, j] = O2[(rnd() * O2.length) | 0], [x, z] = W2(i, j);
    if (rnd() < 0.5) w.objects.push({ t: OBJ_INDEX.vein, x, z, h: 1.1, f: 0, v: (rnd() * 4) | 0, y });
    else B.prop(rnd() < 0.5 ? 'caisses' : 'tonneau_vieux', x, y, z, rnd() * TAU, { k: 'minerai' });
  }
  for (let ci = 1; ci < 4; ci++) { const [x, z] = at(ci, 7); B.prop('lanterne_sol', x + 0.8, y, z - 0.8, 0); }
  // salles
  const R2 = (key) => rooms.find((q) => q[4] === key);
  { const [ci, cj] = R2('lac'); const [x, z] = at(ci, cj); B.block({ x, y, z, r: 0 }, 0, -0.08, 0, 7, 0.12, 5, M_WATERB); w.blocks[w.blocks.length - 1].under = true; B.prop('barque', x + 1, y + 0.02, z + 3.2, 0.4); }
  { const [ci, cj] = R2('cristaux'); for (let k = 0; k < 9; k++) { const [x, z] = at(ci, cj, (rnd() - 0.5) * 8, (rnd() - 0.5) * 8); w.objects.push({ t: OBJ_INDEX.crystal, x, z, h: 1 + rnd() * 0.8, f: 0, v: 0, y }); } }
  { const [ci, cj] = R2('chapelle'); const [x, z] = at(ci, cj); B.prop('autel', x, y, z + 2, Math.PI); B.prop('bougie', x - 0.6, y + 0.9, z + 2, 0); B.prop('bougie', x + 0.6, y + 0.9, z + 2, 0);
    B.inter('loot', 'chapelle_profonde', x, y + 0.9, z + 1.2, 'Fouiller sous l’autel', { table: 'profond', prop: w.props.length - 1 });
    w.mazeShrine = { x, z: z + 2.4, y }; }
  { const [ci, cj] = R2('eboulement'); for (let k = 0; k < 9; k++) { const [x, z] = at(ci, cj, (rnd() - 0.5) * 7, (rnd() - 0.5) * 7); w.objects.push({ t: OBJ_INDEX[k % 3 ? 'stones' : 'rock'], x, z, h: k % 3 ? 0.5 : 1.2 + rnd(), f: 0, v: k % 2, y }); } }
  { const [ci, cj] = R2('depot'); const [x, z] = at(ci, cj); for (let k = -1; k <= 1; k++) B.prop('rails', x + k * 3, y, z, Math.PI / 2); B.prop('wagonnet', x, y + 0.07, z, Math.PI / 2, { ore: '#9aa2ac' }); B.inter('loot', 'depot_galeries', x + 2.5, y + 0.8, z - 2, 'Fouiller les caisses', { table: 'mine' }); B.prop('caisses', x + 2.5, y, z - 2, 0, { k: 'minerai' }); }
  { const [ci, cj] = R2('mineur'); const [x, z] = at(ci, cj); B.prop('squelette', x, y, z, 1.2, { arme: false }); B.prop('lanterne_sol', x + 0.8, y, z + 0.4, 0);
    B.inter('lire', 'carnet_mineur', x + 0.4, y + 0.5, z, 'Lire le carnet', { text: ['Le carnet d’un mineur', 'Troisième jour. La lampe baisse. J’ai suivi les mains peintes, au début — elles montrent toutes le même côté. Puis j’ai cru plus malin de faire à ma tête.\n\nIl y a une chapelle, là-dessous. Quelqu’un y descendait prier, avant nous. Ce n’est pas Dieu qu’on priait.\n\nSi vous lisez ceci : suivez les mains. Et ne restez pas quand la lampe s’éteint.'] }); }
  // mains peintes : à chaque carrefour, une main tournée vers la sortie (le puits)
  const dist = new Int32Array(G * G).fill(-1), q = [];
  { const ei = C(1) + 1, ej = C(7) + 1; dist[ej * G + ei] = 0; q.push([ei, ej]); }
  for (let h = 0; h < q.length; h++) { const [i, j] = q[h]; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ni = i + a, nj = j + b; if (isOpen(ni, nj) && dist[nj * G + ni] < 0) { dist[nj * G + ni] = dist[j * G + i] + 1; q.push([ni, nj]); } } }
  let hands = 0;
  for (let cj = 0; cj < NC; cj++) for (let ci = 0; ci < NC; ci++) {
    if (rnd() > 0.4 || (ci < 3 && cj === 7)) continue;
    const i = C(ci), j = C(cj);
    if (!isOpen(i, j) || room[j * G + i]) continue;
    let best = null;
    for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const d = dist[(j + b * 2) * G + i + a * 2]; if (d >= 0 && (!best || d < best.d)) best = { a, b, d }; }
    if (!best) continue;
    // la main est peinte sur un mur parallèle au bon chemin, les doigts dans le sens où il faut aller
    const sides = best.a ? [[0, 1], [0, -1]] : [[1, 0], [-1, 0]];
    for (const [sa, sb] of sides) {
      const ui = sa > 0 ? i + 2 : sa < 0 ? i - 1 : i, uj = sb > 0 ? j + 2 : sb < 0 ? j - 1 : j;
      if (isOpen(ui, uj) || isOpen(ui + (sb ? 1 : 0), uj + (sa ? 1 : 0))) continue;
      const [x, z] = W2(i + 0.5 + sa * 0.9, j + 0.5 + sb * 0.9), r = Math.atan2(sa, sb);
      const along = best.a * Math.cos(r) - best.b * Math.sin(r);
      B.prop('sigle', x, y + 1.25, z, r, { k: 'main', m: 'paroi', s: 0.55, dir: along >= 0 ? 0 : Math.PI });
      hands++;
      break;
    }
  }
  w.mazeHands = hands;
}

// ---------------------------------------------------------------- le refuge, les cairns, le lac gelé, les crevasses, le lac Noir
function designExtras(w, B, D, ctx) {
  const P = D.P, WL = D.WL, rnd = mulberry32(D.seed * 7 + 5), H = (x, z) => w.heightAt(x, z);
  // le refuge du col
  {
    const { x, z } = P.refuge, y = H(x, z);
    B.flatten(x, z, 7, y, 5);
    const f = { x, y, z, r: Math.PI };
    const res = B.house(f, 6, 5, { wall: M_STONE, win: M_STONEWIN, roof: M_SLATE, chimney: true, found: M_STONE, floor: M_PLANKS });
    B.door(f, res, 'refuge', {});
    B.propRel(f, 'cheminee', 3 - 0.62, 0.15, 0.6, -Math.PI / 2, { lit: true });
    B.interRel(f, 'cook', 'cheminee_refuge', 3 - 1.2, 0.8, 0.6, 'Cuisiner / se réchauffer');
    B.propRel(f, 'lit', -1.8, 0.15, 1.2, Math.PI, { col: '#7a4a3a' });
    B.interRel(f, 'refuge', 'lit_refuge', -1.8, 0.8, 1.2, 'Dormir au refuge');
    B.propRel(f, 'coffre_vieux', 0.4, 0.15, 1.9, Math.PI, { vide: false });
    B.interRel(f, 'loot', 'coffre_refuge', 0.4, 0.7, 1.9, 'Fouiller le coffre', { table: 'refuge', prop: w.props.length - 1 });
    B.propRel(f, 'table', 0.6, 0.15, -0.4, 0); B.propRel(f, 'bougie', 0.8, 0.94, -0.4, 0);
    const [nx, nz] = B.toWorld(f, 0.2, -0.4);
    B.inter('lire', 'livre_refuge', nx, y + 1.05, nz, 'Lire le registre du refuge', { text: ['Le registre du refuge', '« Montés par la piste des cairns. Le glacier chante la nuit : ce sont les crevasses qui travaillent. Ne marchez pas où la neige est plus bleue. »\n\n« Trouvé une grande spirale tracée dans la glace, au milieu du glacier. Personne ne sait qui la refait chaque hiver. »\n\n« Une faille, derrière le refuge, descend dans la montagne. Il paraît qu’elle rejoint les vieilles galeries de la mine. Je n’y suis pas allé. »\n\n« Au lac gelé, un trou dans la glace. On y pêche des ombles, quand on a de la patience et une canne. »'] });
    B.prop('lanterne_suspendue', x + 3.6, y, z - 3.4, 0);
    B.landmark('refuge', x, z, 12);
  }
  // cairns le long de la piste (au-dessus des prés)
  for (let i = 2; i < P.trail.length; i++) {
    const [x, z] = P.trail[i], h = H(x, z);
    if (h < WL + 20) continue;
    const a = rnd() * TAU; B.prop('cairn', x + Math.cos(a) * 3, H(x + Math.cos(a) * 3, z + Math.sin(a) * 3), z + Math.sin(a) * 3, rnd() * TAU);
  }
  // le lac gelé : un trou dans la glace (on y pêche), un vieux traîneau
  {
    const F = P.frozen, y = H(F.x, F.z);
    B.prop('trou_glace', F.x + 14, y + 0.01, F.z + 9, 0);
    B.inter('peche_glace', 'trou_glace', F.x + 14, y + 0.4, F.z + 9, 'Pêcher dans le trou');
    B.landmark('lac_gele', F.x, F.z, F.r);
  }
  B.landmark('glacier', P.glacier.x, P.glacier.z, 220);
  B.landmark('monts', 1640, 420, 480);
  B.landmark('combe', 1320, 900, 150);
  B.landmark('col', 1502, 1090, 40);
  { const L = P.lakes.find((q) => q.kind === 'lac_noir'); if (L) { B.landmark('lac_noir', L.x, L.z, L.r, { fish: 'lac_noir' }); const a = 0.6, x = L.x + Math.cos(a) * (L.r + 6), z = L.z + Math.sin(a) * (L.r + 6); B.prop('barque', x, WL - 0.05, z, a + 1.2); B.prop('panneau', x + 4, H(x + 4, z + 3), z + 3, a); B.inter('lire', 'panneau_lac_noir', x + 4, H(x + 4, z + 3) + 1.2, z + 3, 'Lire le panneau', { text: ['Lac Noir', 'Pêche interdite après la tombée de la nuit.\n(En dessous, gratté au couteau : « il remonte les lignes »)'] }); } }
  { const R = P.rivers[0], m = R.pts[(R.pts.length / 2) | 0]; B.landmark('riviere', m[0], m[1], 30, { fish: 'riviere' }); }
  w.crevasses = P.crevasses;
  // ceux qui sont tombés dans les crevasses
  const fall = [[1, 'un guide'], [5, 'un colporteur'], [9, 'une jeune femme en robe de noce']];
  for (const [ci, who] of fall) {
    const [[ax, az], [bx, bz]] = P.crevasses[ci], x = (ax + bx) / 2, z = (az + bz) / 2, y = H(x, z);
    B.prop('squelette', x, y, z, rnd() * TAU, { arme: false });
    B.inter('loot', 'crevasse' + ci, x, y + 0.5, z, 'Fouiller les restes', { table: 'crevasse' });
    B.inter('lire', 'crevasse_note' + ci, x + 0.6, y + 0.4, z, 'Regarder de plus près', { text: ['Au fond de la crevasse', `Les restes d’${who}, pris dans la glace bleue. Depuis combien d’hivers ?\nAu-dessus, le ciel n’est plus qu’un trait.`] });
  }
}

// ---------------------------------------------------------------- les sigles
const SIGIL_KINDS = ['mere', 'dame', 'cerf', 'dessous', 'croix', 'treize', 'soleil', 'spirale', 'main', 'corne', 'noeud', 'oeil'];
function addSigils(w, B, seed, ctx) {
  const rnd = mulberry32(seed * 191 + 7), WL = w.waterLevel, H = (x, z) => w.heightAt(x, z);
  let n = 0;
  const place = (x, z, k, s, m) => {
    let y = H(x, z);
    if (m === 'sol') { // un sol battu, débarrassé des arbres et des herbes : le signe se voit
      B.flatten(x, z, s * 0.9 + 1, y, 3); y = H(x, z);
      B.paintDisk(x, z, s + 1.2, M_DIRT, 1.6);
      w.query(x, z, s + 2, (o) => { if (o && !o.gone && Math.hypot(o.x - x, o.z - z) < s + 2) { o.gone = true; o.cleared = true; } }, null);
      w.objectsDirty = true;
    }
    const r = rnd() * TAU;
    B.prop('sigle', x, y, z, r, { k, m, s });
    if (m === 'stele') w.blocks.push({ x, y: y - 0.3, z, sx: 0.9 * s, sy: 1.7 * s + 0.3, sz: 0.3 * s, r, m: 0, sh: 0, hidden: true });
    const big = m === 'sol' || m === 'neige' || m === 'glace';
    B.inter('sigle', 'sigle' + n, x, y + (big ? 0.5 : 1.1), z, big ? 'Examiner le signe tracé au sol' : 'Examiner la pierre gravée', { k, big });
    n++;
  };
  const D = ctx.design;
  if (D && D.P) { for (const [x, z, k, s, m] of D.P.sigils) place(x, z, k, s, m); return; }
  // anciennes vallées : près des lieux chargés d'histoire
  const spots = [['cercle', 'treize', 3.5, 'sol'], ['chapelle', 'croix', 1.2, 'stele'], ['dolmen', 'dessous', 1.2, 'stele'], ['hameau_abandonne', 'noeud', 1.2, 'stele'], ['tour', 'oeil', 1.2, 'stele'],
    ['ruines', 'soleil', 3, 'sol'], ['chene', 'cerf', 1.2, 'stele'], ['marais', 'spirale', 2.5, 'sol'], ['lac', 'dame', 1.2, 'stele'], ['mine', 'main', 1.2, 'stele'], ['menhirs', 'corne', 3, 'sol'], ['pierre_offrandes', 'mere', 1.2, 'stele']];
  for (const [key, k, s, m] of spots) {
    const L = w.lm[key];
    if (!L) continue;
    for (let t = 0; t < 40; t++) {
      const a = rnd() * TAU, d = (L.r || 10) + 4 + rnd() * 12, x = L.x + Math.cos(a) * d, z = L.z + Math.sin(a) * d;
      if (!w.inside(x, z, 30) || H(x, z) < WL + 0.6 || w.matAt(x, z) === M_DIRT || !pointFree(w, x, z, s)) continue;
      place(x, z, k, s, m);
      break;
    }
  }
}
