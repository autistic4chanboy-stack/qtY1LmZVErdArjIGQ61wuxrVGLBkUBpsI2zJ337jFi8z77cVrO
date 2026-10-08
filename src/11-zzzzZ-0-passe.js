// ============================================================================
//  LES TRAJETS DES HABITANTS (agent Z, vague 14) — 0. LA PASSE DE GÉNÉRATION (la dernière de la vallée)
//  Ce qui barre une maison habitée : la clôture de l'enclos du ranch traverse la maison (deux poteaux et
//  les lisses d'un côté passent dans la salle, entre la table et le lit) — l'éleveuse n'atteignait jamais
//  son lit, et l'on s'y cognait. Une clôture (poteaux de rondins, lisses de planches) qui entre dans une
//  maison s'arrête au mur : les poteaux du dedans descendent sous le plancher, les lisses sont raccourcies
//  (coupées en deux si elles ressortent). On ne retire rien des listes ; les objets, les objets posés et les
//  interactions ne bougent pas (empreintes inchangées) ; seuls ces blocs-là changent, sur place.
// ============================================================================
function zClotures(w) {
  let n = 0;
  const N0 = w.blocks.length;
  for (const k in w.bld) {
    const B = w.bld[k];
    if (!B || !B.f || B.under || !B.W || !B.D) continue;
    const f = B.f, hw = B.W / 2 - 0.16, hd = B.D / 2 - 0.16;
    const dedans = (x, z) => { const [lx, lz] = World.blockLocal({ x: f.x, z: f.z, r: f.r }, x, z); return Math.abs(lx) < hw && Math.abs(lz) < hd; };
    for (let i = 0; i < N0; i++) {
      const b = w.blocks[i];
      if (Math.abs(b.x - f.x) > 40 || Math.abs(b.z - f.z) > 40) continue;
      if (b.hidden || b.under || b.zCoupe || (b.m !== M_PLANKS && b.m !== M_LOGS)) continue;
      if (b.y > f.y + 2.2 || b.y + b.sy < f.y + 0.3) continue;
      const poteau = b.m === M_LOGS && b.sx <= 0.2 && b.sz <= 0.2 && b.sy > 1 && b.sy < 2;
      const lisse = b.m === M_PLANKS && b.sy <= 0.15 && Math.min(b.sx, b.sz) <= 0.1 && Math.max(b.sx, b.sz) >= 2;
      if (!poteau && !lisse) continue;
      if (poteau) {
        if (!dedans(b.x, b.z)) continue;
        b.y = f.y - 2.5; b.sy = 0.05; b.zCoupe = true; n++; // (sous le plancher, dans les fondations)
        continue;
      }
      // la lisse : le long de son grand côté, les morceaux du dehors
      const longX = b.sx >= b.sz, L = longX ? b.sx : b.sz, dir = longX ? [Math.cos(b.r), -Math.sin(b.r)] : [Math.sin(b.r), Math.cos(b.r)];
      const pas = 0.05, m = Math.ceil(L / pas), dans = [];
      let any = false;
      for (let j = 0; j <= m; j++) { const t = -L / 2 + L * j / m, d = dedans(b.x + dir[0] * t, b.z + dir[1] * t); dans.push(d); if (d) any = true; }
      if (!any) continue;
      // les morceaux du dehors (au bord : 0,05 m de jeu contre le mur)
      const morceaux = [];
      let a = -1;
      for (let j = 0; j <= m + 1; j++) {
        const out = j <= m && !dans[j];
        if (out && a < 0) a = j;
        if (!out && a >= 0) { const t0 = -L / 2 + L * a / m, t1 = -L / 2 + L * (j - 1) / m; if (t1 - t0 > 0.15) morceaux.push([t0, t1]); a = -1; }
      }
      const poser = (bb, t0, t1) => {
        const c = (t0 + t1) / 2, len = t1 - t0;
        bb.x = b.x + dir[0] * c; bb.z = b.z + dir[1] * c;
        if (longX) bb.sx = len; else bb.sz = len;
        bb.zCoupe = true;
      };
      const x0 = b.x, z0 = b.z;
      if (!morceaux.length) { b.y = f.y - 2.5; b.sy = 0.05; b.zCoupe = true; n++; continue; }
      for (let q = 1; q < morceaux.length; q++) { const nb = Object.assign({}, b, { x: x0, z: z0 }); delete nb.blk; poser(nb, morceaux[q][0], morceaux[q][1]); w.blocks.push(nb); }
      poser(b, morceaux[0][0], morceaux[0][1]);
      n++;
    }
  }
  if (n) { w.grid = null; w.blocksDirty = true; w.coverDirty = true; }
  return n;
}
{
  const _gv = generateValley;
  generateValley = async function (seed, progress, gen) {
    const w = await _gv(seed, progress, gen);
    if (w && w.bld) { try { w.zClotures = zClotures(w); } catch (e) { console.error('Z : clôtures', e); } }
    return w;
  };
}
