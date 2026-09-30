// ============================================================================
//  LA PELLE TERRAFORME : clic gauche creuse (le sol s'abaisse d'un quart de
//  mètre, on récupère une motte de terre — ou du sable), clic droit remblaie
//  (avec la terre ou le sable qu'on porte), accroupi on nivelle à la hauteur
//  de ses pieds. Éboulis, secrets, cartes au trésor et terre remuée passent
//  en premier. Creuser plus bas qu'avant fait parfois remonter une trouvaille ;
//  sous le niveau de l'eau, le trou se remplit (on peut creuser une mare).
//  Pas en ville, ni contre un bâtiment, un objet posé ou des cultures.
//  Le sol retourné redevient herbe au bout de trois jours.
//  Sauvegarde : décalage de hauteur par sommet de la grille (2 m), ±3 m.
// ============================================================================
const TERRA_STEP = 0.25, TERRA_MAX = 3;
const TERRA_FREE = new Set(['trou', 'fouille', 'traces', 'sang', 'coffre_tresor', 'ossements']);
const TERRA_WHY = {
  roche: '(De la roche. La pelle ne mord pas.)', ville: '(Pas en ville : ces pavés-là ont un propriétaire.)', bati: '(Trop près d’une construction : ça finirait par s’effondrer.)',
  objet: '(Il y a quelque chose de posé là.)', culture: '(Vous abîmeriez les cultures.)', bord: '',
};
const terra = {
  sayT: 0, lastWhy: '',
  // sommet de la grille le plus proche du point visé
  vertexAt(eye, f) {
    const w = game.world, th = w.raycastTerrain(eye, f, 4.6);
    if (!th) return null;
    const bh = w.raycastBlocks(eye, f, th.t);
    if (bh && !bh.block.hidden) return null;
    const i = Math.round(th.x / w.cell), j = Math.round(th.z / w.cell), k = j * w.W + i;
    return { i, j, k, x: i * w.cell, z: j * w.cell, y: w.heights[k] };
  },
  blocked(w, v) {
    const { i, j, x, z } = v;
    if (i < 3 || j < 3 || i > w.N - 3 || j > w.N - 3) return 'bord';
    const T = w.townInfo;
    if (T && Math.max(Math.abs(x - T.x), Math.abs(z - T.z)) < 62) return 'ville';
    const m = w.mats[v.k];
    if (m === M_ROCK || m === M_COBBLE) return 'roche';
    const h = w.heights[v.k];
    let bati = false;
    w.query(x, z, 5, null, (b) => {
      if (bati || b.under || b.y > h + 4 || b.y + b.sy < h - 2.5) return;
      const [lx, lz] = World.blockLocal(b, x, z);
      if (Math.abs(lx) < b.sx / 2 + 2.3 && Math.abs(lz) < b.sz / 2 + 2.3) bati = true;
    });
    if (bati) return 'bati';
    for (const p of w.props) if (w.live(p) && !TERRA_FREE.has(p.id) && Math.abs(p.x - x) < 2.3 && Math.abs(p.z - z) < 2.3 && Math.abs(p.y - h) < 3) return 'objet';
    for (let dz = -2; dz <= 1; dz++) for (let dx = -2; dx <= 1; dx++) { const c = farm.s.crops[(Math.floor(x) + dx) + ',' + (Math.floor(z) + dz)]; if (c && (c.c || c.tree)) return 'culture'; }
    return null;
  },
  refuse(why, held) {
    if (why === 'roche') { sound.shovelHit && sound.shovelHit(); play.cool = 0.6; }
    else sound.click();
    if (TERRA_WHY[why] && (!held || why !== this.lastWhy || performance.now() > this.sayT)) { ui.subtitle('', TERRA_WHY[why], 2); this.sayT = performance.now() + 2500; this.lastWhy = why; }
  },
  // change la hauteur d'un sommet (dh en mètres) ; renvoie le changement effectif
  edit(w, v, dh, mat) {
    const s = farm.s, T = s.terra || (s.terra = {}), k = v.k;
    const cur = T[k] || 0, nv = Math.round(clamp(cur + dh, -TERRA_MAX, TERRA_MAX) * 100) / 100;
    if (Math.abs(nv - cur) < 0.005) return 0;
    w.heights[k] += nv - cur;
    if (Math.abs(nv) < 0.005) delete T[k]; else T[k] = nv;
    // sol retourné : de la terre (ou du sable), l'herbe repoussera
    const m = w.mats[k], want = mat ?? (m === M_SAND ? M_SAND : M_DIRT);
    const TM = s.terraM || (s.terraM = {});
    if (m !== want) { if (!TM[k]) TM[k] = [m, s.day]; w.mats[k] = want; w.markMats(v.i, v.j, v.i, v.j); }
    if (TM[k]) TM[k][1] = s.day;
    // la terre labourée vide autour disparaît (elle a été remuée)
    for (let dz = -2; dz <= 1; dz++) for (let dx = -2; dx <= 1; dx++) { const key = (Math.floor(v.x) + dx) + ',' + (Math.floor(v.z) + dz), c = s.crops[key]; if (c && !c.c && !c.tree) delete s.crops[key]; }
    this.mark(w, v);
    return nv - cur;
  },
  mark(w, v) {
    const { i, j } = v, d = w.dirtyHeights, i0 = Math.max(0, i - 1), j0 = Math.max(0, j - 1), i1 = Math.min(w.N, i + 1), j1 = Math.min(w.N, j + 1);
    w.dirtyHeights = d ? [Math.min(d[0], i0), Math.min(d[1], j0), Math.max(d[2], i1), Math.max(d[3], j1)] : [i0, j0, i1, j1];
    // herbes, fleurs, arbres posés sur ce sol : à redessiner à la bonne hauteur
    const G = w.objectsGrid(), C = G.C;
    let near = false;
    for (let gz = Math.floor((v.z - 3) / C); gz <= Math.floor((v.z + 3) / C) && !near; gz++) for (let gx = Math.floor((v.x - 3) / C); gx <= Math.floor((v.x + 3) / C) && !near; gx++) {
      const cell = G.cells[clamp(gz, 0, G.gw - 1) * G.gw + clamp(gx, 0, G.gw - 1)];
      if (cell) for (const oi of cell) { const o = w.objects[oi]; if (o.y === undefined && Math.abs(o.x - v.x) < 2.2 && Math.abs(o.z - v.z) < 2.2) { near = true; break; } }
    }
    if (near) w.objectsDirty = true;
    farm.dirtyProps = true;
  },
  fx(v, sand, k) {
    sound.shovel && sound.shovel(k || 1);
    puffAt(v.x, game.world.heights[v.k] + 0.1, v.z, sand ? [200, 180, 120] : [96, 68, 44], 10, 1.8, false);
  },
  // ---------------------------------------------------------------- creuser
  dig(eye, f, held) {
    const w = game.world, s = farm.s, v = this.vertexAt(eye, f);
    if (!v) { sound.impact && sound.impact('soft'); return; }
    const why = this.blocked(w, v);
    if (why) return this.refuse(why, held);
    const sand = w.mats[v.k] === M_SAND, before = w.heights[v.k];
    if (!this.edit(w, v, -TERRA_STEP)) { if (!held) ui.subtitle('', '(Plus profond, la terre s’effondre à mesure.)', 2); sound.shovel && sound.shovel(0.5); return; }
    this.fx(v, sand);
    const item = sand ? 'sable' : 'terre';
    farm.give(item, 1); play.flyer(item, [v.x, w.heights[v.k] + 0.3, v.z], 1);
    // trouvailles : seulement en creusant plus bas qu'on ne l'avait jamais fait ici
    const D = s.terraD || (s.terraD = {}), cur = (s.terra && s.terra[v.k]) || 0;
    if (cur < (D[v.k] ?? 0) - 0.001) {
      D[v.k] = cur;
      const h = npcs.hour(), b = game.biomeAt([v.x, v.y, v.z]), night = h >= 21 || h < 4;
      let loot = null;
      if (sand) { if (Math.random() < 0.12) loot = rollLoot('sable'); }
      else if (night && (b === 'foret' || b === 'bouleaux') && Math.random() < 0.05) { loot = [['mandragore', 1]]; sound.scream2 && sound.scream2(); strange.glitchT = 0.3; }
      else if (Math.random() < 0.13) loot = rollLoot('pelle');
      for (const [k, n] of loot || []) { if (k === 'argent') { farm.earn(n); continue; } farm.give(k, n); play.flyer(k, [v.x, w.heights[v.k] + 0.4, v.z], n); }
    }
    if (before >= w.waterLevel - 0.05 && w.heights[v.k] < w.waterLevel - 0.05) sound.splash();
    s.stats.holes = (s.stats.holes || 0) + 1;
  },
  // ---------------------------------------------------------------- remblayer (clic droit)
  raise(eye, f) {
    const w = game.world, v = this.vertexAt(eye, f);
    play.swingT = 0.3; play.cool = 0.42;
    if (!v) return;
    const src = farm.count('terre') ? 'terre' : farm.count('sable') ? 'sable' : null;
    if (!src) { ui.subtitle('', '(Il vous faut de la terre à remettre.)', 2.5); sound.click(); return; }
    const why = this.blocked(w, v);
    if (why) return this.refuse(why);
    if (!this.edit(w, v, TERRA_STEP, src === 'sable' ? M_SAND : M_DIRT)) { ui.subtitle('', '(Plus haut, la terre s’éboule.)', 2); return; }
    farm.take(src, 1);
    this.fx(v, src === 'sable', 0.8);
  },
  // ---------------------------------------------------------------- niveler (accroupi) : à la hauteur de ses pieds
  level(eye, f, held) {
    const w = game.world, p = game.player, v = this.vertexAt(eye, f);
    if (!v) return;
    const why = this.blocked(w, v);
    if (why) return this.refuse(why, held);
    const diff = p.pos[1] - w.heights[v.k];
    if (Math.abs(diff) < 0.04) { if (!held) ui.subtitle('', '(C’est de niveau.)', 1.2); sound.click(); return; }
    const dh = clamp(diff, -TERRA_STEP, TERRA_STEP);
    const src = farm.count('terre') ? 'terre' : farm.count('sable') ? 'sable' : null;
    if (dh > 0 && !src) { ui.subtitle('', '(Il manque de la terre pour remblayer.)', 2); sound.click(); return; }
    const got = this.edit(w, v, dh);
    if (!got) return;
    if (got > 0) farm.take(src, 1); else if (-got > 0.12) { farm.give('terre', 1); play.flyer('terre', [v.x, w.heights[v.k] + 0.3, v.z], 1); }
    this.fx(v, false, 0.8);
  },
  // ---------------------------------------------------------------- chargement, repousse
  apply(w) {
    const s = farm.s, T = s.terra || {}, M = s.terraM || {};
    for (const k in T) w.heights[+k] += T[k];
    for (const k in M) w.mats[+k] = w.mats[+k] === M_SAND ? M_SAND : M_DIRT;
  },
  regrow() {
    const s = farm.s, w = game.world, M = s.terraM || {};
    for (const k in M) {
      if (s.day - M[k][1] < 3) continue;
      const kk = +k, i = kk % w.W, j = (kk / w.W) | 0;
      w.mats[kk] = M[k][0]; w.markMats(i, j, i, j);
      delete M[k];
    }
  },
};

// la pelle : les secrets d'abord (éboulis, trésors, terre remuée), puis on retourne le sol
dig.at = function (eye, f, held) {
  const w = game.world, s = farm.s;
  play.swingT = 0.32; play.cool = held ? 0.45 : 0.5;
  const eb = (w.inter || []).find((it) => it.kind === 'eboulis' && !this.caveOpen(it.data.cave) && Math.hypot(it.x - eye[0], it.z - eye[2]) < 3.6 && this.facing(eye, f, it, 0.55));
  if (eb) return this.rubble(eb);
  const c = play.cellAt(eye, f);
  if (c) {
    for (const q of w.secrets || []) { if (s.flags['secret_' + q.id]) continue; if (Math.hypot(q.x - c.x, q.z - c.z) < q.r) return this.secretDig(q, c); }
    for (const m of s.maps || []) { if (m.found || Math.hypot(m.x - c.x, m.z - c.z) > 2.6) continue; return this.mapDig(m, c); }
    const d0 = (w.inter || []).find((it) => it.kind === 'dig' && !s.flags['dug_' + it.id] && Math.hypot(it.x - c.x, it.z - c.z) < 1.6 && (!it.data.envers || strange.inEnvers()));
    if (d0) { play.digUp(d0); if (Math.random() < 0.5) { const L = rollLoot('pelle'); for (const [k, n] of L) if (k !== 'argent') { farm.give(k, n); play.flyer(k, [c.x, c.y + 0.4, c.z], n); } } return; }
  }
  if (game.player.crouch > 0.5) return terra.level(eye, f, held);
  return terra.dig(eye, f, held);
};
HOOKS.secondary.push((eye, basis, it) => {
  if (!it || it.tool !== 'pelle') return false;
  if (play.cool > 0) return true;
  terra.raise(eye, basis.f);
  return true;
});
{
  const _start = farm.start;
  farm.start = async function (saved, seed, progress) {
    const w = await _start.call(this, saved, seed, progress);
    terra.apply(w);
    if (typeof builds !== 'undefined') builds.apply(w);
    return w;
  };
}
HOOKS.day.push(() => terra.regrow());
