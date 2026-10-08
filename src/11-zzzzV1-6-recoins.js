// ============================================================================
//  LES TERRES D'AVANT (agent V1) — raccourcis, recoins, passages, ceux d'avant
//  Une passe de génération (V1-recoins, avant celles de V2…V5) et ce qui se
//  fait avec E :
//  - RACCOURCIS qui ne s'ouvrent que d'un côté : le pont-levis des Ravines (le
//    levier est de l'autre côté de l'entaille ; la travée du milieu se dresse en
//    deux volées) ; l'échelle des Degrés (tirée en haut de la paroi : on la fait
//    glisser d'en haut) ; la grille des Tertres (barrée de l'intérieur de
//    l'enclos) ; deux boyaux des Degrés (une roche qui sonne creux, en bas ; en
//    haut, une dalle scellée).
//  - RECOINS : des caveaux dont un mur sonne creux (on le fait tomber : un
//    tombeau, du butin) ; des trappes sous les ruines (une cave, une échelle) ;
//    des tours creuses (une échelle jusqu'en haut, une niche) ; des corniches à
//    flanc de falaise (on y descend en sautant) ; trois chambres sous les plus
//    grands tertres (une dalle qu'on pousse) ; les maisons brûlées des
//    Cendrières ; une barque coulée ; la cabane du bûcheron et l'arbre à la
//    corde ; des inscriptions.
//  - PASSAGES vers la vallée, qui ne s'ouvrent que de la Zone : le puits sec des
//    Cendrières (on ressort par le vieux puits du hameau abandonné) ; la fente du
//    Pic (on ressort à l'antre, au pied des monts de l'est).
//  - CEUX D'AVANT : les fermiers des versions passées morts dans la Zone (le
//    registre des versions) : leurs restes, là où ils sont tombés.
//  État : farm.s.zone.ouverts (murs tombés, grilles, trappes), .pris (butins),
//  .raccourcis (pont, échelle), .lus (inscriptions, restes).
// ============================================================================
const recoinsV1 = {
  // blocs que l'on déplace (murs qui tombent, pont qui se baisse) : on refait la grille et le dessin
  bouger(Z, L) { for (const [b, champs] of L) Object.assign(b, champs); Z.grid = null; Z.blocksDirty = true; Z.coverDirty = true; Z.shadeDirty = true; },
  S() { return zone.S(); },
  it(id) { const Z = zone.Z; return Z ? Z.inter.find((i) => i.id === id) : null; },
  butin(it, table, cle) {
    const S = this.S();
    if (S.pris[cle]) { ui.subtitle('', '(Il n’y a plus rien.)', 2.5); return; }
    S.pris[cle] = farm.s.day;
    const pos = [it.x, it.y + 0.3, it.z];
    for (const [k, n] of rollLoot(table)) { if (k === 'argent') { farm.earn(n); sound.coin && sound.coin(); continue; } farm.give(k, n); play.flyer(k, pos, n); }
    sound.lootOpen && sound.lootOpen();
    puffAt(it.x, it.y, it.z, [110, 100, 90], 8, 1.4, false);
    furtif.bruit(it.x, it.y, it.z, 6, 'fouille');
  },
};

// ---------------------------------------------------------------- génération
zone.passe('V1-recoins', (Z, O) => {
  const S = O.S, rnd = O.rnd, SZ = zone.S(), B = O.B, WL = O.WL;
  const H = (x, z) => Z.heightAt(x, z);
  const region = (k) => V1_REGIONS[k];
  const autour = (k, f) => { const R = region(k); const a = rnd() * TAU, d = Math.sqrt(rnd()) * R.r * S * (f || 0.85); return [R.x * S + Math.cos(a) * d, R.z * S + Math.sin(a) * d]; };
  const chercher = (k, r, f, essais) => { for (let n = 0; n < (essais || 80); n++) { const [x, z] = autour(k, f); if (O.libre(x, z, r)) return [x, z]; } return null; };
  const M = M_V1_PIERRE;

  // ------------------------------------------------------------- les inscriptions
  for (const [cle, reg] of V1_INSCRIPTIONS) {
    const p = cle === 'voie' ? [S * 0.505 + 5, S * 0.85] : cle === 'feu' ? [S * 0.52, S * 0.905] : chercher(reg, 2.5, 0.7, 120);
    if (!p) continue;
    const [x, z] = p, y = H(x, z), r = rnd() * TAU;
    if (cle === 'feu') { O.objet('bones', x + 0.8, z + 0.3); B.prop('lettre', x, y + 0.02, z, r); }
    else if (cle === 'puits') { for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; B.block({ x: x + Math.cos(a) * 1.05, y: y - 0.4, z: z + Math.sin(a) * 1.05, r: a }, 0, 0, 0, 0.8, 1.2, 0.35, M); } B.block({ x, y: y - 6, z, r: 0 }, 0, 0, 0, 1.6, 0.2, 1.6, M_DARK); }
    else B.prop('v1_stele', x, y, z, r);
    if (cle === 'puits') O.inter('v1_passage', 'passage_puits', x, y + 0.9, z, 'Le puits sec', { vers: 'vieux_puits', cle: 'puits' });
    O.inter('v1_inscr', 'inscr_' + cle, x, y + (cle === 'feu' ? 0.3 : 1.4), z, cle === 'feu' ? 'Une lettre' : 'Lire', { cle });
  }

  // ------------------------------------------------------------- le pont-levis des Ravines (le premier pont)
  const P0 = Z.v1.ponts.find((p) => p.levis);
  if (P0 && P0.blocs) {
    const f = { x: P0.x, y: P0.y, z: P0.z, r: P0.r };
    // le levier : au bout du pont, du côté des Ravines (+z local)
    const [lx, lz] = B.toWorld(f, P0.w / 2 + 1.6, P0.L / 2 + 3), ly = H(lx, lz);
    B.prop('v1_levier', lx, ly, lz, P0.r, { id: 'pont_ravines' });
    O.inter('v1_levier', 'pont_ravines', lx, ly + 1.1, lz, 'Le levier', { id: 'pont_ravines' });
    // de ce côté-ci (la Ville Basse), un poteau : on voit le pont dressé
    if (!SZ.raccourcis.pont_ravines) recoinsV1.leverPont(Z, P0, true);
  }

  // ------------------------------------------------------------- l'échelle des Degrés : une paroi entre deux paliers, près du chemin
  {
    let best = null;
    // (on longe le chemin des Degrés, de part et d'autre, du bas vers le haut : la première paroi qui convient)
    const essais = [];
    for (let v = 0.55; v > 0.3; v -= 0.0025) for (const off of [35, -35, 55, -55, 80, -80, 110, -110]) essais.push([S * 0.49 + off + (rnd() - 0.5) * 6, S * v]);
    for (let n = 0; n < essais.length && !best; n++) {
      const [x, z] = essais[n];
      if (O.surChemin(x, z, 3)) continue;
      for (let a = 0; a < 8; a++) {
        const dx = Math.sin(a * TAU / 8), dz = Math.cos(a * TAU / 8), h0 = H(x, z), h1 = H(x + dx * 9, z + dz * 9), h2 = H(x - dx * 4, z - dz * 4), h3 = H(x + dx * 14, z + dz * 14);
        if (h1 - h0 > 8 && h1 - h0 < 19 && Math.abs(h2 - h0) < 1.5 && Math.abs(h3 - h1) < 2 && h0 > WL + 2) { best = { x, z, dx, dz, h0, h1 }; break; }
      }
    }
    if (best) {
      const { x, z, dx, dz, h0, h1 } = best, r = Math.atan2(dx, dz);
      const bas = [x - dx * 1.2, h0, z - dz * 1.2], haut = [x + dx * 9, h1, z + dz * 9];
      const q1 = B.prop('echelle', x + dx * 0.8, h0, z + dz * 0.8, r, { h: h1 - h0 + 1 });
      const q2 = B.prop('v1_echelle_couchee', haut[0], h1 + 0.05, haut[2], r, { h: h1 - h0 + 1 });
      q1.v1echelle = 'echelle_degres'; q2.v1echelle = 'echelle_degres';
      O.inter('v1_echelle', 'echelle_degres_bas', bas[0], h0 + 1.2, bas[2], 'Le pied de la paroi', { id: 'echelle_degres', cote: 'bas', bas, haut });
      O.inter('v1_echelle', 'echelle_degres_haut', haut[0], h1 + 0.6, haut[2], 'L’échelle', { id: 'echelle_degres', cote: 'haut', bas, haut });
      Z.v1.echelle = best;
    }
  }

  // ------------------------------------------------------------- l'enclos des Tertres : un mur, deux grilles (l'une barrée de l'intérieur)
  {
    const T = region('tertres'), cx = T.x * S, cz = T.z * S, R = 60;
    const n = 36, grilles = [Math.PI * 1.0, Math.PI * 0.0]; // à l'ouest (barrée), à l'est (ouverte)
    for (let k = 0; k < n; k++) {
      const a = k / n * TAU, a2 = (k + 1) / n * TAU, am = (a + a2) / 2;
      const ouest = Math.abs(((am - Math.PI) % TAU + TAU) % TAU) < TAU / n * 0.6, est = Math.abs(((am + TAU) % TAU)) < TAU / n * 0.6 || Math.abs(am - TAU) < TAU / n * 0.6;
      if (ouest || est) continue;
      const x = cx + Math.cos(am) * R, z = cz + Math.sin(am) * R, L = 2 * R * Math.sin(Math.PI / n) + 0.3, y = H(x, z);
      B.block({ x, y: y - 1.2, z, r: Math.atan2(Math.cos(am), -Math.sin(am)) + Math.PI / 2 }, 0, 0, 0, L, 1.2 + 3.2 + (rnd() < 0.15 ? -1.6 : 0), 0.8, M);
    }
    // les deux grilles : des barreaux (blocs) ; la grille de l'ouest se lève de l'intérieur (levier près d'elle, à l'intérieur)
    for (const [a, id] of [[Math.PI, 'grille_tertres'], [0, null]]) {
      const x = cx + Math.cos(a) * R, z = cz + Math.sin(a) * R, y = H(x, z), r = a + Math.PI / 2;
      for (const c of [-1, 1]) B.block({ x: x + Math.cos(r) * c * 2.6 * -1, y: y - 1, z: z - Math.sin(r) * c * 2.6 * -1, r: 0 }, 0, 0, 0, 1.2, 5.6, 1.2, M);
      if (!id) continue;
      const barreaux = [];
      for (let k = -4; k <= 4; k++) { const b = { x: x + Math.sin(r + Math.PI / 2) * 0 + Math.cos(a + Math.PI / 2) * k * 0.45, y: y - 0.2, z: z - Math.sin(a + Math.PI / 2) * k * 0.45 * -1, sx: 0.12, sy: 4.0, sz: 0.12, r: 0, m: M_METAL, sh: 0 }; Z.blocks.push(b); barreaux.push(b); }
      const [ix, iz] = [cx + Math.cos(a) * (R - 2.2), cz + Math.sin(a) * (R - 2.2)], [ox, oz] = [cx + Math.cos(a) * (R + 2.2), cz + Math.sin(a) * (R + 2.2)];
      O.inter('v1_grille', id + '_dedans', ix, H(ix, iz) + 1.4, iz, 'La grille', { id, cote: 'dedans' });
      O.inter('v1_grille', id + '_dehors', ox, H(ox, oz) + 1.4, oz, 'La grille', { id, cote: 'dehors' });
      Z.v1.grilles = Z.v1.grilles || {}; Z.v1.grilles[id] = barreaux;
      if (SZ.ouverts[id]) recoinsV1.ouvrirGrille(Z, id, true);
    }
  }

  // ------------------------------------------------------------- les caveaux (un mur sonne creux)
  let nc = 0;
  for (const [reg, nb] of [['tertres', 3], ['bois_mort', 2], ['ville_basse', 2], ['cendrieres', 1], ['ravines', 1]]) {
    for (let k = 0; k < nb; k++) {
      const p = chercher(reg, 5, 0.8, 120);
      if (!p) continue;
      const id = 'caveau_' + (nc++), [x, z] = p, y = H(x, z), r = Math.round(rnd() * 4) * Math.PI / 2;
      const f = { x, y, z, r };
      // un petit caveau de pierre : quatre murs, un toit, un tombeau dedans ; le mur de devant est le mur creux
      const w = 3.2, d = 4.2, h = 2.6, bas = -1.2;
      B.block(f, 0, bas, d / 2, w + 0.6, h - bas, 0.5, M); B.block(f, -w / 2, bas, 0, 0.5, h - bas, d, M); B.block(f, w / 2, bas, 0, 0.5, h - bas, d, M);
      B.block(f, 0, h, 0, w + 1.0, 0.5, d + 0.8, M); B.block(f, 0, h + 0.5, 0, w + 0.4, 0.4, d, M, 0, 1);
      B.block(f, 0, -0.2, 0.6, 1.2, 0.85, 2.2, M); // le tombeau
      const [mx, mz] = B.toWorld(f, 0, -d / 2), mur = { x: mx, y: y + bas, z: mz, sx: w + 0.6, sy: h - bas, sz: 0.5, r, m: M, sh: 0, v1mur: id };
      Z.blocks.push(mur);
      const [ix, iz] = B.toWorld(f, 0, -d / 2 - 1.0), [tx, tz] = B.toWorld(f, 0, 0.6);
      O.inter('v1_mur_creux', id, ix, y + 1.3, iz, 'Le mur', { id });
      O.inter('v1_trouvaille', id + '_tombeau', tx, y + 0.8, tz, 'Le tombeau', { id: id + '_tombeau', table: 'v1_caveau', mur: id });
      Z.v1.murs = Z.v1.murs || {}; Z.v1.murs[id] = mur;
      if (SZ.ouverts[id]) recoinsV1.ouvrirMur(Z, id, true);
    }
  }

  // ------------------------------------------------------------- les caves sous les ruines (une trappe, une échelle)
  let nk = 0;
  for (let k = 0; k < 40 && nk < 4; k++) {
    const p = chercher('ville_basse', 4, 0.75, 6);
    if (!p) continue;
    const id = 'cave_' + (nk++), [x, z] = p, y = H(x, z);
    const fy = y - 7.5, f = { x, y: fy, z, r: rnd() * TAU };
    const w = 6, d = 5, h = 3.2, U = { under: true, ceil: true };
    const bl = (lx, ly, lz, sx, sy, sz, m) => { const [bx, bz] = B.toWorld(f, lx, lz); const b = { x: bx, y: f.y + ly, z: bz, sx, sy, sz, r: f.r, m: m === undefined ? M : m, sh: 0, under: true }; Z.blocks.push(b); return b; };
    bl(0, -0.5, 0, w + 1, 0.5, d + 1, M_COBBLE); bl(0, h, 0, w + 1, 0.6, d + 1, M); bl(0, 0, d / 2 + 0.25, w + 1, h, 0.5); bl(0, 0, -d / 2 - 0.25, w + 1, h, 0.5); bl(-w / 2 - 0.25, 0, 0, 0.5, h, d); bl(w / 2 + 0.25, 0, 0, 0.5, h, d);
    bl(-w / 2 + 0.6, 0, d / 2 - 0.7, 1.0, 0.9, 0.8, M_PLANKS); bl(w / 2 - 0.9, 0, 0, 1.2, 1.6, 0.6, M_PLANKS);
    B.prop('trappe', x, y + 0.02, z, f.r, { open: !!SZ.ouverts[id] });
    O.inter('v1_trappe', id, x, y + 0.5, z, 'La trappe', { id, bas: [x, fy + 0.05, z] });
    const [ex, ez] = B.toWorld(f, 0, 0);
    O.inter('v1_trappe_haut', id + '_echelle', ex, fy + 1.4, ez, 'Remonter', { id, haut: [x + 1.2, y + 0.05, z] });
    const [cx2, cz2] = B.toWorld(f, w / 2 - 0.9, 0);
    O.inter('v1_trouvaille', id + '_coffre', cx2, fy + 1.0, cz2, 'Des caisses pourries', { id: id + '_coffre', table: 'v1_recoin' });
    if (nk === 1) { const [bx2, bz2] = B.toWorld(f, -1.5, -1.2); O.inter('v1_inscr', 'inscr_cave', bx2, fy + 0.6, bz2, 'Des marques sur le mur', { cle: 'cave' }); }
  }

  // ------------------------------------------------------------- les tours creuses de la Ville Basse (une échelle, une niche en haut)
  let nt = 0;
  for (let k = 0; k < 60 && nt < 3; k++) {
    const p = chercher('ville_basse', 6, 0.9, 4);
    if (!p) continue;
    const id = 'tour_' + (nt++), [x, z] = p, y = H(x, z), f = { x, y, z, r: rnd() * TAU }, c = 5.2, h = 13 + rnd() * 5, e = 0.6;
    B.block(f, 0, -1.5, c / 2 - e / 2, c, h + 1.5, e, M); B.block(f, -c / 2 + e / 2, -1.5, 0, e, h + 1.5, c - 2 * e, M); B.block(f, c / 2 - e / 2, -1.5, 0, e, h + 1.5, c - 2 * e, M);
    B.block(f, -1.6, -1.5, -c / 2 + e / 2, 2.0, h + 1.5, e, M); B.block(f, 1.6, -1.5, -c / 2 + e / 2, 2.0, h + 1.5, e, M); B.block(f, 0, 2.3, -c / 2 + e / 2, 1.2, h - 2.3, e, M); // la porte (1,2 × 2,3 m)
    B.block(f, 0, h, 0, c, 0.4, c, M_PLANKS, 0, 0); // la plate-forme du haut
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) B.block(f, a * (c / 2 - 0.4), h + 0.4, b * (c / 2 - 0.4), 0.8, 1.2, 0.8, M); // les merlons
    const [ex, ez] = B.toWorld(f, 0, c / 2 - e - 0.5);
    B.propRel(f, 'echelle', 0, 0, c / 2 - e - 0.25, Math.PI, { h: h + 0.4 });
    O.inter('ladder', id + '_monter', ex, y + 1.2, ez, 'Grimper à l’échelle', { to: [x, y + h + 0.45, z] });
    O.inter('ladder', id + '_descendre', ex, y + h + 1.2, ez, 'Descendre', { to: [x, y + 0.1, z - 0.01] });
    const [nx2, nz2] = B.toWorld(f, c / 2 - 1.0, -c / 2 + 1.0);
    O.inter('v1_trouvaille', id + '_niche', nx2, y + h + 0.8, nz2, 'Une niche', { id: id + '_niche', table: 'v1_recoin' });
  }

  // ------------------------------------------------------------- des corniches sur les falaises des Degrés (on y descend en sautant)
  let nl = 0;
  for (let k = 0; k < 600 && nl < 5; k++) {
    const x = S * (0.36 + rnd() * 0.3), z = S * (0.28 + rnd() * 0.3);
    if (O.surChemin(x, z, 4)) continue;
    for (let a = 0; a < 8; a++) {
      const dx = Math.sin(a * TAU / 8), dz = Math.cos(a * TAU / 8), hb = H(x, z), hh = H(x + dx * 8, z + dz * 8);
      if (hh - hb < 10) continue;
      // la corniche à mi-hauteur, collée à la paroi
      const cx = x + dx * 3.2, cz = z + dz * 3.2, cy = hb + (hh - hb) * 0.5;
      if (H(cx, cz) > cy - 1) continue;
      const id = 'corniche_' + (nl++), f = { x: cx, y: cy, z: cz, r: Math.atan2(dx, dz) };
      B.block(f, 0, -0.6, 0, 3.2, 0.6, 2.2, M_ROCK);
      B.block(f, 0, -2.2, 0.6, 2.4, 1.6, 1.2, M_ROCK);
      O.objet('bones', cx + 0.4, cz - 0.2, 0.42, { y: cy });
      O.inter('v1_trouvaille', id, cx, cy + 0.6, cz, 'Un sac de toile', { id, table: 'v1_recoin' });
      break;
    }
  }

  // ------------------------------------------------------------- sous trois tertres, un roi (une dalle qu'on pousse, une chambre)
  {
    const L = (Z.v1.tertres || []).slice().sort((a, b) => b.R0 - a.R0).slice(0, 3);
    L.forEach((T, k) => {
      const id = 'tertre_' + k, a = rnd() * TAU, [dx, dz] = [Math.cos(a), Math.sin(a)];
      // la dalle, au pied du tumulus
      const sx = T.x + dx * (T.R0 * 1.15), sz = T.z + dz * (T.R0 * 1.15), sy = H(sx, sz);
      B.block({ x: sx, y: sy - 0.6, z: sz, r: Math.atan2(dx, dz) }, 0, 0, 0, 1.8, 2.0, 0.35, M);
      // la chambre, sous le tertre
      const fy = T.base - 5, f = { x: T.x, y: fy, z: T.z, r: a };
      const bl = (lx, ly, lz, sx2, sy2, sz2, m) => { const [bx, bz] = B.toWorld(f, lx, lz); Z.blocks.push({ x: bx, y: f.y + ly, z: bz, sx: sx2, sy: sy2, sz: sz2, r: f.r, m: m === undefined ? M : m, sh: 0, under: true }); };
      const w = 5, d = 7, h = 3;
      bl(0, -0.5, 0, w + 1, 0.5, d + 1); bl(0, h, 0, w + 1, 0.6, d + 1); bl(0, 0, d / 2 + 0.25, w + 1, h, 0.5); bl(0, 0, -d / 2 - 0.25, w + 1, h, 0.5); bl(-w / 2 - 0.25, 0, 0, 0.5, h, d); bl(w / 2 + 0.25, 0, 0, 0.5, h, d);
      bl(0, 0, 1.2, 1.4, 0.9, 2.6); // le lit de pierre
      const [kx, kz] = B.toWorld(f, 0, 1.2);
      O.objet('bones', kx, kz, 0.45, { y: fy + 0.9 });
      const [ix, iz] = B.toWorld(f, 0, -d / 2 + 1);
      O.inter('v1_tertre', id, sx - dx * 0.6, sy + 1.0, sz - dz * 0.6, 'Une dalle', { id, bas: [ix, fy + 0.05, iz], haut: [sx - dx * 1.6, sy + 0.05, sz - dz * 1.6] });
      O.inter('v1_tertre_haut', id + '_sortie', ix, fy + 1.3, iz, 'Remonter', { id, haut: [sx - dx * 1.6, sy + 0.05, sz - dz * 1.6] });
      O.inter('v1_trouvaille', id + '_roi', kx, fy + 1.4, kz, 'Le roi', { id: id + '_roi', table: 'v1_caveau' });
    });
  }

  // ------------------------------------------------------------- les Cendrières : des maisons brûlées (l'une a une cave)
  {
    let nb = 0;
    for (let k = 0; k < 120 && nb < 5; k++) {
      const p = chercher('cendrieres', 6, 0.8, 3);
      if (!p) continue;
      const [x, z] = p, y = H(x, z), f = { x, y, z, r: rnd() * TAU };
      if (y < WL + 0.6) continue;
      const n0 = Z.blocks.length;
      zoneGen.ruine(B, f, 6 + rnd() * 3, 5 + rnd() * 3, rnd, Z);
      // (la pierre noircie, pas de mousse ; dedans, les poutres du toit, tombées, charbonneuses)
      for (let q = n0; q < Z.blocks.length; q++) if (Z.blocks[q].m === M_MOSSY) Z.blocks[q].m = M_V1_PIERRE;
      for (let k2 = 0; k2 < 3; k2++) { const [bx, bz] = B.toWorld(f, (rnd() - 0.5) * 3, (rnd() - 0.5) * 3); B.block({ x: bx, y: H(bx, bz) - 0.12, z: bz, r: rnd() * TAU }, 0, 0, 0, 0.32, 0.3, 4 + rnd() * 2.5, M_DARK); }
      O.objet('stump', x + 1, z - 1, 0.8);
      (Z.v1.brulees || (Z.v1.brulees = [])).push({ x, z });
      nb++;
    }
  }

  // ------------------------------------------------------------- l'Étang : une barque à moitié coulée, un ponton pourri
  {
    // (du milieu de l'étang vers la rive, dans des directions tirées : la dernière eau peu profonde avant une rive proche)
    const E0 = region('etang'), cx = E0.x * S, cz = E0.z * S, a0 = rnd() * TAU;
    let ici = null;
    for (let k = 0; k < 64 && !ici; k++) {
      const a = a0 + k * TAU * 0.381966; // (l'angle d'or : on fait le tour sans repasser au même endroit)
      for (let r = E0.r * S * 0.1; r < E0.r * S * 1.3; r += 2) {
        const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r, y = H(x, z);
        if (y > WL - 0.3) break;
        const xr = x + Math.cos(a) * 8, zr = z + Math.sin(a) * 8;
        if (y > WL - 1.8 && H(xr, zr) > WL - 0.2 && zoneGen.horsSites(x, z, 10) && zoneGen.horsSites(xr, zr, 6)) { ici = { x, z, a }; break; }
      }
    }
    if (ici) {
      const { x, z, a } = ici, f = { x, y: WL - 0.55, z, r: a + Math.PI / 2 + 0.4 };
      B.block(f, 0, 0, 0, 1.4, 0.6, 4.2, M_PLANKS); B.block(f, -0.7, 0.3, 0, 0.12, 0.5, 4.0, M_PLANKS); B.block(f, 0.7, 0.1, 0, 0.12, 0.4, 3.6, M_PLANKS, 0.15);
      O.inter('v1_trouvaille', 'barque', x, WL + 0.5, z, 'La barque', { id: 'barque', table: 'v1_recoin' });
      // le ponton, de la barque vers la rive (une planche manque)
      const px = x + Math.cos(a) * 9, pz = z + Math.sin(a) * 9;
      for (let q = 0; q < 4; q++) { const t2 = q / 4, bx = lerp(x, px, t2 + 0.2), bz = lerp(z, pz, t2 + 0.2); if (q !== 1) B.block({ x: bx, y: WL + 0.2, z: bz, r: a + Math.PI / 2 }, 0, 0, 0, 1.6, 0.15, 2.0, M_PLANKS); B.block({ x: bx, y: WL - 2, z: bz, r: 0 }, 0, 0, 0, 0.2, 2.6, 0.2, M_LOGS); }
      Z.v1.barque = { x, z };
    }
  }

  // ------------------------------------------------------------- le Bois Mort : la cabane du bûcheron, l'arbre à la corde
  {
    const p = chercher('bois_mort', 5, 0.7, 120);
    if (p) {
      const [x, z] = p, y = H(x, z), f = { x, y, z, r: rnd() * TAU };
      zoneGen.ruine(B, f, 5, 4.5, rnd, Z);
      B.block(f, 0.5, 1.6, 0.4, 5.4, 0.25, 3.4, M_PLANKS, 0.12); // ce qui reste du toit
      const [wx, wz] = B.toWorld(f, 3.4, 1.0), [cx2, cz2] = B.toWorld(f, -1.2, 1.2);
      O.objet('woodpile', wx, wz, 1.0);
      O.inter('v1_trouvaille', 'bucheron', cx2, y + 0.6, cz2, 'Un coffre de bois', { id: 'bucheron', table: 'v1_recoin' });
    }
    const q = chercher('bois_mort', 3, 0.9, 120);
    if (q) {
      const [x, z] = q, y = H(x, z);
      O.objet('deadtree', x, z, 8.5);
      B.block({ x: x + 1.6, y: y + 2.4, z, r: 0 }, 0, 0, 0, 0.05, 2.8, 0.05, M_DARK); // la corde
      B.block({ x: x + 1.6, y: y + 2.2, z, r: 0 }, 0, 0, 0, 0.32, 0.32, 0.05, M_DARK);
      O.inter('v1_inscr', 'inscr_corde', x + 1.6, y + 1.6, z, 'La corde', { cle: 'corde' });
    }
  }

  // ------------------------------------------------------------- les Degrés : deux boyaux derrière un pan de roche qui sonne creux (de bas en haut)
  {
    let nb = 0;
    const lad = Z.v1.echelle;
    for (let n = 0; n < 800 && nb < 2; n++) {
      const x = S * (0.36 + rnd() * 0.28), z = S * (0.3 + rnd() * 0.26);
      if (O.surChemin(x, z, 5) || (lad && Math.hypot(x - lad.x, z - lad.z) < 80)) continue;
      for (let a = 0; a < 8; a++) {
        const dx = Math.sin(a * TAU / 8), dz = Math.cos(a * TAU / 8), h0 = H(x, z), h1 = H(x + dx * 9, z + dz * 9), h2 = H(x - dx * 4, z - dz * 4), h3 = H(x + dx * 14, z + dz * 14);
        if (!(h1 - h0 > 8 && h1 - h0 < 19 && Math.abs(h2 - h0) < 1.5 && Math.abs(h3 - h1) < 2 && h0 > WL + 2)) continue;
        if (!O.libre(x - dx * 2, z - dz * 2, 2) || !O.libre(x + dx * 13, z + dz * 13, 2)) continue;
        const id = 'boyau_' + (nb++), r = Math.atan2(dx, dz);
        const mur = { x: x + dx * 1.2, y: h0 - 0.5, z: z + dz * 1.2, sx: 2.6, sy: 3.4, sz: 1.2, r, m: M_ROCK, sh: 0, v1mur: id };
        Z.blocks.push(mur);
        B.block({ x: x + dx * 2.2, y: h0 - 0.5, z: z + dz * 2.2, r }, 0, 0, 0, 2.2, 3.0, 0.5, M_DARK);
        Z.v1.murs = Z.v1.murs || {}; Z.v1.murs[id] = mur;
        const haut = [x + dx * 13, h1 + 0.05, z + dz * 13];
        B.block({ x: haut[0], y: h1 - 0.02, z: haut[2], r }, 0, 0, 0, 1.4, 0.06, 1.4, M_V1_PIERRE);
        O.inter('v1_mur_creux', id, x - dx * 0.6, h0 + 1.3, z - dz * 0.6, 'La roche', { id });
        O.inter('v1_boyau', id + '_bas', x - dx * 0.2, h0 + 1.2, z - dz * 0.2, 'Le boyau', { id, vers: haut, cote: 'bas' });
        O.inter('v1_boyau', id + '_haut', haut[0], h1 + 0.4, haut[2], 'Une dalle', { id, vers: [x - dx * 1.4, h0 + 0.05, z - dz * 1.4], cote: 'haut' });
        if (SZ.ouverts[id]) recoinsV1.ouvrirMur(Z, id, true);
        break;
      }
    }
  }

  // ------------------------------------------------------------- les passages vers la vallée
  {
    const pic = zone.site('dragon_aire');
    let p = null, r0 = 0;
    // (au pied d'un ressaut du Pic : la roche monte derrière, c'est à peu près plat devant)
    for (let n = 0; n < 600 && !p; n++) {
      const x = pic.x + 120 + rnd() * 220, z = pic.z + 220 + rnd() * 200, h0 = H(x, z);
      if (h0 < WL + 40 || !O.libre(x, z, 2.5)) continue;
      for (let a = 0; a < 8 && !p; a++) { const dx = Math.sin(a * TAU / 8), dz = Math.cos(a * TAU / 8); if (H(x + dx * 6, z + dz * 6) - h0 > 4 && Math.abs(H(x - dx * 4, z - dz * 4) - h0) < 1.5) { p = [x, z]; r0 = Math.atan2(dx, dz); } }
    }
    for (let n = 0; n < 200 && !p; n++) { const x = pic.x + 120 + rnd() * 220, z = pic.z + 220 + rnd() * 200; if (O.libre(x, z, 2.5) && H(x, z) > WL + 40) { p = [x, z]; r0 = rnd() * TAU; } }
    if (p) {
      const [x, z] = p, y = H(x, z), f = { x, y, z, r: r0 };
      B.block(f, -1.4, -1, 0, 1.0, 4.2, 2.0, M_ROCK); B.block(f, 1.4, -1, 0, 1.0, 4.6, 2.0, M_ROCK); B.block(f, 0, 2.6, 0.3, 3.8, 1.2, 2.6, M_ROCK); B.block(f, 0, -1, 0.9, 1.8, 3.6, 0.4, M_DARK);
      // (de grosses masses de roche de part et d'autre, et au-dessus : la fente est dans le rocher, pas une cabane)
      B.block(f, -3.6, -1.5, 0.8, 3.6, 5.6 + rnd() * 1.5, 3.4, M_ROCK, 0.25); B.block(f, 3.7, -1.5, 0.7, 3.4, 6.2 + rnd() * 1.5, 3.6, M_ROCK, -0.3);
      B.block(f, 0.3, 3.4, 1.6, 6.5, 2.4 + rnd(), 3.8, M_ROCK, 0.1);
      O.inter('v1_passage', 'passage_fente', x, y + 1.3, z, 'Une fente dans la roche', { vers: 'antre', cle: 'fente' });
    }
  }

  // ------------------------------------------------------------- ceux d'avant : les fermiers des versions passées, morts dans la Zone
  {
    const H0 = typeof farm.history === 'function' ? farm.history() : [];
    const noms = {};
    for (const k in V1_REGIONS) noms[V1_REGIONS[k].nom] = k;
    noms[V1_ZONE_NOM] = 'seuil';
    let n = 0;
    for (const h of H0) {
      const reg = noms[h.place];
      if (!reg || n >= 6) continue;
      const rr = mulberry32((h.run * 7919 + 13) >>> 0);
      let p = null;
      for (let t = 0; t < 40 && !p; t++) { const R = V1_REGIONS[reg], a = rr() * TAU, d = Math.sqrt(rr()) * R.r * S * 0.6, x = R.x * S + Math.cos(a) * d, z = R.z * S + Math.sin(a) * d; if (O.libre(x, z, 1.5)) p = [x, z]; }
      if (!p) continue;
      Z.v1.restes = Z.v1.restes || [];
      Z.v1.restes.push({ x: p[0], z: p[1], h, id: 'reste_' + h.run });
      n++;
    }
  }
});
// (les restes de ceux d'avant ne sont pas des objets générés : ils dépendent du registre des versions ; on les pose à
// l'entrée, sans toucher aux rangs des objets de la Zone)
zone.sur('entrer', () => {
  const Z = zone.Z;
  if (!Z || !Z.v1.restes || Z.v1.restesPoses) return;
  Z.v1.restesPoses = true;
  for (const R of Z.v1.restes) {
    const y = Z.heightAt(R.x, R.z);
    Z.props.push({ id: 'v1_reste', x: R.x, y, z: R.z, r: (R.h.run * 1.7) % TAU, data: { run: R.h.run } });
    Z.inter.push({ kind: 'v1_reste', id: R.id, x: R.x, y: y + 0.4, z: R.z, name: 'Un corps', data: { run: R.h.run } });
  }
  farm.dirtyProps = true;
});

// ---------------------------------------------------------------- les raccourcis et les recoins, à l'usage
Object.assign(recoinsV1, {
  // le pont levé ou baissé : la travée du milieu se couche, ou se dresse en deux volées (debout sur les piles du milieu)
  leverPont(Z, P, leve) {
    const T = P.blocs;
    if (!T) return;
    if (!P.dresse) {
      const f = { x: P.x, y: P.y, z: P.z, r: P.r }, B = new Builder(Z, Math.random, new Uint8Array(1));
      P.dresse = [-1, 1].map((c) => {
        const [x, z] = B.toWorld(f, 0, c * (P.L / 6 - 0.3));
        return { x, y: -1000, z, sx: P.w + 0.6, sy: P.L / 6, sz: 0.5, r: P.r, m: M_PLANKS, sh: 0 };
      });
      Z.blocks.push(...P.dresse);
    }
    if (leve) this.bouger(Z, [...T.tablier.map((b) => [b, { y: -1000 }]), ...P.dresse.map((d) => [d, { y: P.y - 0.5 }])]);
    else this.bouger(Z, [...T.tablier.map((b) => [b, { y: b.y0 }]), ...P.dresse.map((d) => [d, { y: -1000 }])]);
  },
  ouvrirMur(Z, id, silencieux) {
    const b = Z.v1.murs && Z.v1.murs[id];
    if (!b) return;
    this.bouger(Z, [[b, { y: b.y - 60 }]]);
    if (!silencieux) {
      puffAt(b.x, b.y + 61.5, b.z, [120, 115, 105], 30, 3, true);
      // les pierres tombées, au pied
      for (let k = 0; k < 4; k++) Z.blocks.push({ x: b.x + (Math.random() - 0.5) * 2.2, y: Z.heightAt(b.x, b.z) - 0.2, z: b.z + (Math.random() - 0.5) * 1.6, sx: 0.6, sy: 0.45, sz: 0.5, r: Math.random() * TAU, m: M_V1_PIERRE, sh: 0 });
      Z.grid = null; Z.blocksDirty = true;
    }
  },
  ouvrirGrille(Z, id, silencieux) {
    const L = Z.v1.grilles && Z.v1.grilles[id];
    if (!L) return;
    this.bouger(Z, L.map((b) => [b, { y: (b.y0 === undefined ? (b.y0 = b.y) : b.y0) + 3.6 }]));
    if (!silencieux && sound.chain) sound.chain();
  },
});
HOOKS.inter.v1_inscr = (it) => {
  const cle = it.data.cle, I = V1_INSCRIPTIONS.find((e) => e[0] === cle);
  zone.S().lus['inscr_' + cle] = farm.s.day;
  sound.page && sound.page();
  if (cle === 'cave') { ui.read('Des marques sur le mur', 'Des traits, par cinq, à la craie. Beaucoup de traits. Puis, plus bas, d’une autre main :\nIL N’Y A PAS DE NUIT ICI. SEULEMENT DES JOURS PLUS SOMBRES.'); return; }
  if (cle === 'corde') { ui.subtitle('', '(La corde est neuve.)', 3.5); return; }
  if (I) ui.read(I[2], I[3]);
};
HOOKS.inter.v1_mur_creux = (it) => {
  const S = zone.S(), id = it.data.id;
  if (S.ouverts[id]) return;
  if (!S.frappe || S.frappe !== id) {
    S.frappe = id;
    sound.impact && sound.impact('hard');
    furtif.bruit(it.x, it.y, it.z, 10, 'coup');
    ui.subtitle('', V1_TEXTES.murCreux, 3);
    return;
  }
  // le second coup : il tombe
  S.ouverts[id] = farm.s.day; S.frappe = null;
  recoinsV1.ouvrirMur(zone.Z, id, false);
  sound.impact && sound.impact('hard');
  sound.rumble && sound.rumble(0.5);
  furtif.bruit(it.x, it.y, it.z, 22, 'eboulement');
  ui.subtitle('', V1_TEXTES.murCreuxTombe, 3.5);
};
HOOKS.interVis.v1_mur_creux = (it) => zone.dedans && !zone.S().ouverts[it.data.id];
HOOKS.inter.v1_trouvaille = (it) => recoinsV1.butin(it, it.data.table || 'v1_recoin', it.data.id);
HOOKS.interVis.v1_trouvaille = (it) => zone.dedans && !zone.S().pris[it.data.id] && (!it.data.mur || !!zone.S().ouverts[it.data.mur]);
HOOKS.inter.v1_trappe = (it) => {
  const S = zone.S(), id = it.data.id;
  if (!S.ouverts[id]) {
    S.ouverts[id] = farm.s.day;
    const q = zone.Z.props.find((p) => p.id === 'trappe' && Math.abs(p.x - it.x) < 0.1 && Math.abs(p.z - it.z) < 0.1);
    if (q) zone.setPropData(q, { open: true });
    sound.door && sound.door(true);
    furtif.bruit(it.x, it.y, it.z, 8, 'trappe');
  }
  game.teleport(it.data.bas, 'Vous descendez…');
};
HOOKS.inter.v1_trappe_haut = (it) => game.teleport(it.data.haut, 'Vous remontez…');
HOOKS.inter.v1_echelle = (it) => {
  const S = zone.S(), d = it.data, baissee = !!S.raccourcis[d.id];
  if (d.cote === 'bas') { if (!baissee) { ui.subtitle('', V1_TEXTES.echelleBas, 3.5); return; } game.teleport(d.haut, 'Vous grimpez à l’échelle…'); return; }
  if (!baissee) {
    ui.choice('L’échelle', V1_TEXTES.echelleHaut, [
      { label: 'La faire glisser le long de la paroi', fn: () => { ui.close(); S.raccourcis[d.id] = farm.s.day; recoinsV1.majEchelles(); sound.scratch && sound.scratch(); furtif.bruit(it.x, it.y, it.z, 14, 'echelle'); } },
      { label: 'La laisser', fn: () => ui.close() },
    ]);
    return;
  }
  game.teleport(d.bas, 'Vous descendez l’échelle…');
};
recoinsV1.majEchelles = function () {
  const Z = zone.Z, S = zone.S();
  if (!Z) return;
  for (const q of Z.props) if (q.v1echelle) { const b = !!S.raccourcis[q.v1echelle]; q.gone = q.id === 'echelle' ? !b : b; }
  farm.dirtyProps = true;
};
zone.sur('entrer', () => recoinsV1.majEchelles());
HOOKS.inter.v1_levier = (it) => {
  const S = zone.S(), id = it.data.id;
  if (S.raccourcis[id]) { ui.subtitle('', '(Le pont est baissé.)', 2.5); return; }
  ui.choice('Le levier', V1_TEXTES.levier, [
    { label: 'Peser de tout son poids', fn: () => {
      ui.close();
      S.raccourcis[id] = farm.s.day;
      const P = zone.Z.v1.ponts.find((p) => p.levis);
      recoinsV1.leverPont(zone.Z, P, false);
      const q = zone.Z.props.find((p) => p.id === 'v1_levier' && p.data && p.data.id === id);
      if (q) zone.setPropData(q, { tire: true });
      sound.chain && sound.chain();
      game.shakeT = 0.6;
      furtif.bruit(P.x, P.y, P.z, 40, 'pont');
    } },
    { label: 'Laisser', fn: () => ui.close() },
  ]);
};
HOOKS.inter.v1_grille = (it) => {
  const S = zone.S(), d = it.data;
  if (S.ouverts[d.id]) { ui.subtitle('', '(La grille est levée.)', 2); return; }
  if (d.cote === 'dehors') { ui.subtitle('', V1_TEXTES.grilleDehors, 3); return; }
  ui.choice('La grille', V1_TEXTES.grilleDedans, [
    { label: 'Ôter la barre et lever la grille', fn: () => { ui.close(); S.ouverts[d.id] = farm.s.day; recoinsV1.ouvrirGrille(zone.Z, d.id, false); furtif.bruit(it.x, it.y, it.z, 18, 'grille'); } },
    { label: 'Laisser', fn: () => ui.close() },
  ]);
};
// les passages vers la vallée (d'un seul côté)
HOOKS.inter.v1_passage = (it) => {
  const d = it.data;
  ui.choice(d.cle === 'puits' ? 'Le puits sec' : 'La fente', V1_TEXTES.passage, [
    { label: d.cle === 'puits' ? 'Descendre, en s’accrochant aux pierres' : 'S’y glisser', fn: () => { ui.close(); recoinsV1.passer(d); } },
    { label: 'Rester', fn: () => ui.close() },
  ]);
};
recoinsV1.passer = async function (d) {
  const w = farm.w;
  let L = w.lm[d.vers];
  if (!L) L = w.lm.vieux_puits || w.lm.ferme;
  // à côté du repère, sur la terre ferme
  let x = L.x + 3, z = L.z + 2;
  for (let k = 0; k < 24; k++) { const a = k * 0.8, r = 2.5 + k * 0.4, xx = L.x + Math.cos(a) * r, zz = L.z + Math.sin(a) * r; if (w.heightAt(xx, zz) > w.waterLevel + 0.4) { x = xx; z = zz; break; } }
  zone.S().lus['passage_' + d.cle] = farm.s.day;
  const y = w.groundAt(x, z, w.heightAt(x, z) + 1, 0.8) + 0.05;
  await zone.sortir({ pos: [x, y, z], yaw: Math.atan2(-(L.x - x), -(L.z - z)) });
  ui.subtitle('', V1_TEXTES.passageFerme, 4);
};
HOOKS.inter.v1_reste = (it) => {
  const run = it.data.run, h = farm.history().find((e) => e.run === run), S = zone.S(), cle = 'reste_' + run;
  const qui = h ? `${h.name ? h.name + ', ' : ''}fermier de la vieille ferme — version n° ${h.run}.\nIl a tenu ${h.day} jour${h.day > 1 ? 's' : ''}.\n${h.cause}.` : '';
  sound.page && sound.page();
  ui.read('Un corps', V1_TEXTES.reste + (qui ? '\n\n' + qui : ''));
  if (!S.lus[cle]) { S.lus[cle] = farm.s.day; const n = 15 + (run % 4) * 10; farm.earn(n); sound.coin && sound.coin(); }
};
HOOKS.inter.v1_tertre = (it) => {
  const S = zone.S(), id = it.data.id;
  if (S.ouverts[id]) { game.teleport(it.data.bas, 'Vous descendez…'); return; }
  ui.choice('Une dalle', 'Une dalle de pierre debout contre le flanc du tertre. Derrière, on entend l’air passer.', [
    { label: 'Pousser la dalle', fn: () => { ui.close(); S.ouverts[id] = farm.s.day; sound.rumble && sound.rumble(0.4); furtif.bruit(it.x, it.y, it.z, 14, 'dalle'); game.teleport(it.data.bas, 'La dalle pivote. Vous vous glissez dessous…'); } },
    { label: 'Laisser', fn: () => ui.close() },
  ]);
};
HOOKS.inter.v1_tertre_haut = (it) => game.teleport(it.data.haut, 'Vous remontez…');
HOOKS.inter.v1_boyau = (it) => {
  const S = zone.S(), d = it.data;
  if (!S.ouverts[d.id]) { ui.subtitle('', '(Une dalle de pierre, scellée. Elle ne se soulève pas d’ici.)', 3); return; }
  game.teleport(d.vers, d.cote === 'bas' ? 'Vous montez dans le boyau, à quatre pattes…' : 'Vous descendez dans le boyau…');
};
HOOKS.interVis.v1_boyau = (it) => zone.dedans && (it.data.cote === 'haut' || !!zone.S().ouverts[it.data.id]);
HOOKS.interVis.v1_tertre = () => zone.dedans;
HOOKS.interVis.v1_inscr = () => zone.dedans;
HOOKS.interVis.v1_passage = () => zone.dedans;
HOOKS.interVis.v1_reste = () => zone.dedans;
