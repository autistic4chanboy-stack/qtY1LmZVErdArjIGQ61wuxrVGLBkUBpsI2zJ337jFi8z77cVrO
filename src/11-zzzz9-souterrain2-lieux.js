// ============================================================================
//  LE DESSOUS — les lieux (agent C3) : ce qui garnit les galeries et les salles
//  (concrétions, champignons qui luisent, cristaux, racines, étais, éboulis,
//  repères de ceux d'en bas), les noms des lieux, et les autres chemins du
//  retour vers la surface (la mine, les racines du grand chêne, l'antre).
//  Tout est posé à la génération, après le reste, avec le bit VER_SOUS.
// ============================================================================
DYN_PROPS.add('sout_vers');
const SOUT_DECOR = {
  // clé de salle : { objet: nombre, … } (les nombres sont des essais : on en pose ce qui trouve sa place)
  seuil: { sout_stalag: 5, sout_stalac: 10, sout_eboulis: 3, sout_vers: 3 },
  nef: { sout_stalag: 34, sout_stalac: 40, sout_champi: 130, sout_champi_grand: 48, sout_eboulis: 12, sout_vers: 24 },
  cristal_a: { sout_cristal: 38, sout_stalac: 12, sout_stalag: 5 },
  cristal_b: { sout_cristal: 24, sout_stalac: 8 },
  cristal_c: { sout_cristal: 18, sout_stalac: 6 },
  souffle: { sout_eboulis: 10, sout_stalac: 4 },
  gouffres: { sout_eboulis: 12, sout_stalac: 10 },
  echos: { sout_stalag: 10, sout_stalac: 14, sout_eboulis: 4, sout_vers: 10 },
  hameau: { sout_champi: 24, sout_stalac: 10 },
  dormeurs: { sout_stalag: 12, sout_stalac: 24, sout_vers: 6 },
  racines: { sout_racines: 16, sout_eboulis: 4, sout_champi: 5, sout_vers: 12 },
  ruines: { sout_stalac: 22, sout_stalag: 8, sout_eboulis: 10, sout_vers: 22, sout_champi: 20 },
  orgues: { sout_stalag: 80, sout_stalac: 36, sout_vers: 14 },
};
// les exigences de chaque objet : [au sol ?, place libre (m), hauteur libre min, max, près d'un mur ?]
const SOUT_POSE = {
  sout_stalag: [true, 1.6, 2.6, 99, false], sout_stalac: [false, 0.8, 3.0, 13, false], sout_eboulis: [true, 1.2, 2, 99, true],
  sout_champi: [true, 0.6, 1.2, 99, true], sout_champi_grand: [true, 2.2, 5.5, 99, false], sout_cristal: [true, 0.8, 1.6, 99, true],
  sout_racines: [false, 1.0, 3.2, 16, false], sout_os: [true, 0.6, 1.8, 99, false], sout_vers: [false, 1.6, 4, 60, false],
};

SOUT_GEN.push((w, rnd, B) => {
  const S = souterrain;
  S.creuseurs();
  const pose = (id, x, z, r, data, s) => {
    const R = SOUT_POSE[id], f = S.floorAt(x, z), v = S.vaultAt(x, z);
    return B.prop(id, x, R && !R[0] ? v : f, z, r, data, s, VER_SOUS);
  };
  // une place convenable pour l'objet id autour de (x, z)
  const ok = (id, x, z) => {
    const R = SOUT_POSE[id] || [true, 1, 2, 99, false];
    const f = S.floorAt(x, z), v = S.vaultAt(x, z), h = v - f;
    if (f > SOUT_ROCK - 1 || h < R[2] || h > R[3]) return false;
    if (R[0] && f < SOUT_WL + 0.3) return false; // pas dans l'eau
    for (let a = 0; a < 6; a++) { const b = a / 6 * TAU, xx = x + Math.cos(b) * R[1], zz = z + Math.sin(b) * R[1]; if (!S.ouvert(xx, zz, Math.min(R[2], 1.6)) || Math.abs(S.floorAt(xx, zz) - f) > 1.2) return false; }
    if (R[4]) { let mur = false; for (let a = 0; a < 8 && !mur; a++) { const b = a / 8 * TAU; if (!S.ouvert(x + Math.cos(b) * 3.2, z + Math.sin(b) * 3.2, 1.2)) mur = true; } if (!mur) return false; }
    return true;
  };
  // on ne pose rien sur les grands passages (le milieu des galeries du plan)
  const passages = [];
  for (const [key, pts] of SOUT_PLAN.galeries) for (let i = 0; i + 1 < pts.length; i++) passages.push([pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], Math.min(pts[i][3], pts[i + 1][3]) * 0.55]);
  const surPassage = (x, z) => {
    for (const [ax, az, bx, bz, r] of passages) {
      const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1;
      let t = ((x - ax) * dx + (z - az) * dz) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t;
      if (Math.hypot(x - ax - dx * t, z - az - dz * t) < r) return true;
    }
    return false;
  };
  const pris = [];
  const loin = (x, z, d) => { for (const q of pris) if (Math.abs(q[0] - x) < d && Math.abs(q[1] - z) < d && Math.hypot(q[0] - x, q[1] - z) < d) return false; return true; };
  // les champignons lumineux se cueillent (et repoussent en trois jours)
  w.soutCueillettes = w.soutCueillettes || [];
  let nChampi = 0;
  const champi = (bleu) => Object.assign({ k: 'd' + nChampi++, it: 'champi_lumineux', every: 3 }, bleu ? { b: 1 } : {});
  // ------------------------------------------------ les salles du plan
  for (const [key, cx, cz, rx, rz, rot] of SOUT_PLAN.salles) {
    const D = SOUT_DECOR[key];
    if (!D) continue;
    const co = Math.cos(rot), si = Math.sin(rot);
    for (const id in D) {
      let n = 0;
      for (let k = 0; k < D[id] * 14 && n < D[id]; k++) {
        const a = rnd() * TAU, r = Math.sqrt(rnd()) * 0.95, lx = Math.cos(a) * r * rx, lz = Math.sin(a) * r * rz;
        const x = cx + lx * co + lz * si, z = cz - lx * si + lz * co;
        if (!loin(x, z, id === 'sout_champi' ? 1.6 : id === 'sout_cristal' ? 1.2 : 2.4) || surPassage(x, z) || !ok(id, x, z)) continue;
        pose(id, x, z, rnd() * TAU, id === 'sout_champi' ? champi(rnd() < 0.3) : undefined, id === 'sout_cristal' ? 0.7 + rnd() * 0.9 : id === 'sout_stalag' && key === 'orgues' ? 1.3 + rnd() * 1.4 : undefined);
        if (id === 'sout_champi') w.soutCueillettes.push(w.props.length - 1);
        pris.push([x, z]); n++;
      }
    }
    B.landmark('sout_' + key, cx, cz, Math.max(rx, rz), { under: true, secret: true, y: S.floorAt(cx, cz), souterrain: true });
  }
  for (const [key, cx, cz, rx, rz] of SOUT_PLAN.lacs) B.landmark('sout_' + key, cx, cz, Math.max(rx, rz), { under: true, secret: true, y: SOUT_WL, souterrain: true });
  B.landmark('sout_riviere', 1400, 1450, 60, { under: true, secret: true, y: SOUT_WL, souterrain: true });
  B.landmark('sout_mines', 1518, 1200, 50, { under: true, secret: true, y: -98, souterrain: true });
  // ------------------------------------------------ le long des galeries et des boyaux : quelques concrétions, des éboulis
  const segs = [];
  for (const [key, pts] of SOUT_PLAN.galeries) for (let i = 0; i + 1 < pts.length; i++) segs.push([key, pts[i], pts[i + 1]]);
  for (const b of S._brOk || []) for (let i = 0; i + 1 < b.pts.length; i++) segs.push([b.key, b.pts[i], b.pts[i + 1]]);
  for (const [key, A, Bq] of segs) {
    const len = Math.hypot(Bq[0] - A[0], Bq[1] - A[1]), mine = /^mines/.test(key);
    for (let s = 4; s < len; s += mine ? 7 : 9) {
      const t = s / len, x0 = lerp(A[0], Bq[0], t), z0 = lerp(A[1], Bq[1], t), nx = -(Bq[1] - A[1]) / len, nz = (Bq[0] - A[0]) / len;
      if (mine) { if (S.ouvert(x0, z0, 2.6)) { B.prop('sout_etai', x0, S.floorAt(x0, z0), z0, Math.atan2(-nz, nx), undefined, undefined, VER_SOUS); pris.push([x0, z0]); } continue; }
      const u = rnd();
      const id = u < 0.42 ? 'sout_stalac' : u < 0.6 ? 'sout_eboulis' : u < 0.72 && key !== 'fissure' ? 'sout_champi' : null;
      if (!id) continue;
      const side = (rnd() - 0.5) * 2 * (A[3] || 2.5) * 0.7, x = x0 + nx * side, z = z0 + nz * side;
      if (id !== 'sout_stalac' && Math.abs(side) < 1.4) continue;
      if (!loin(x, z, 1.5) || !ok(id, x, z)) continue;
      pose(id, x, z, rnd() * TAU, id === 'sout_champi' ? champi(rnd() < 0.3) : undefined); if (id === 'sout_champi') w.soutCueillettes.push(w.props.length - 1); pris.push([x, z]);
    }
  }
  // les petites salles au bout des boyaux
  for (const b of S._brOk || []) {
    if (!b.fin) continue;
    const [cx, cz, , r] = b.fin;
    for (const [id, n] of [['sout_stalag', 2], ['sout_stalac', 4], ['sout_eboulis', 1], ['sout_champi', 2]]) {
      let m = 0;
      for (let k = 0; k < n * 10 && m < n; k++) { const a = rnd() * TAU, d = Math.sqrt(rnd()) * r * 0.85, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d; if (!loin(x, z, 2) || !ok(id, x, z)) continue; pose(id, x, z, rnd() * TAU, id === 'sout_champi' ? champi(false) : undefined); if (id === 'sout_champi') w.soutCueillettes.push(w.props.length - 1); pris.push([x, z]); m++; }
    }
  }
  w.soutDecor = pris.length;
});
