// ============================================================================
//  LES CRÉATURES DES TERRES D'AVANT (agent V2) — la passe de génération
//  zone.passe('V2-repaires') : après celle de V1 (et avant V3, V4, V5).
//  Les huit repaires réservés (zone.sites('V2')) deviennent des lieux :
//    1 les Charrettes (Bois Mort) — les garous dorment près des charrettes des marchands ;
//    2 les Pendants (Bois Mort) — des arbres morts, des pendus ;
//    3 la Bauge (Cendrières) — la Tarasque dort sur les offrandes ;
//    4 le Jardin de pierre (Cendrières) — le basilic, l'œuf, les gens de pierre ;
//    5 l'Antre (Ravines) — la Chimère, couchée devant sa tanière ;
//    6 la Pierre plate (l'Étang) — la vouivre s'y baigne à l'aube ;
//    7 les Guetteurs (Degrés) — trois gargouilles sur leurs socles ;
//    8 la Ronde (Tertres) — les korrigans dansent autour de la grande pierre.
//  Et, dans les régions de V1 : d'autres garous, des mange-morts, des gargouilles
//  sur les murs de la Ville Basse, l'écoutant, des stryges et leurs nids, des
//  noyés dans l'Étang, des pendus près des chemins, le cerf-aux-mains et son
//  arbre creux, le chien gris au Seuil, les sans-visage des Degrés et des Hauts.
//  Tirage propre (O.rnd, tiré de la graine et du nom de la passe) ; on n'ôte rien
//  à ce que V1 a posé ; ids étiquetés v2_… ; aucune matière nouvelle.
// ============================================================================
zone.passe('V2-repaires', (Z, O) => {
  const C = creaturesV2, rnd = O.rnd, S = O.S, WL = O.WL;
  C.Zgen = Z;
  C.listeNids(Z);
  const R = V1_REGIONS, reg = (k) => ({ x: R[k].x * S, z: R[k].z * S, r: R[k].r * S });
  const feux = Z.props.filter((q) => q.id === 'v1_feu').map((q) => [q.x, q.z]);
  const A = Z.v1.arrivee;
  const nids = () => C.listeNids(Z);
  const loinDe = (x, z, L, d) => L.every((p) => Math.hypot(p[0] - x, p[1] - z) > d);
  const pasPresNid = (x, z, d) => nids().every((n) => Math.hypot(n.x - x, n.z - z) > d);
  const sol = (x, z) => Z.heightAt(x, z);
  // un point libre dans un disque (sec, plat, hors chemins et sites), loin des feux, de l'arrivée et des autres nids
  const chercher = (cx, cz, rr, o) => {
    o = o || {};
    for (let k = 0; k < (o.essais || 160); k++) {
      const a = rnd() * TAU, d = Math.sqrt(rnd()) * rr, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
      if (!O.libre(x, z, o.r || 3, o.sauf)) continue;
      if (!loinDe(x, z, feux, o.feu ?? 60) || Math.hypot(x - A.x, z - A.z) < (o.arrivee ?? 170)) continue;
      if (!pasPresNid(x, z, o.nid ?? 45)) continue;
      if (o.test && !o.test(x, z)) continue;
      return [x, z];
    }
    return null;
  };
  const lire = (cle, x, z, prop, r) => {
    const I = V2_INSCRIPTIONS[cle];
    if (prop) O.prop(prop, x, sol(x, z), z, r || 0);
    O.inter('v2_lire', 'v2_ins_' + cle, x, sol(x, z) + 1.0, z, I[0], { ins: cle });
  };
  const cache = (id, x, y, z, nom, table, txt) => O.inter('v2_cache', id, x, y, z, nom, { table, txt });
  const os = (x, z, n, rr) => { for (let k = 0; k < n; k++) { const a = rnd() * TAU, d = rnd() * rr, xx = x + Math.cos(a) * d, zz = z + Math.sin(a) * d; O.prop('ossements', xx, sol(xx, zz), zz, rnd() * TAU); } };
  const site = (k) => O.site('repaire_' + k);

  // ================================================================ 1. les Charrettes (Bois Mort, à l'ouest) : les garous
  {
    const s = site(1), y = s.y;
    for (const [lx, lz, r] of [[-5, 2, 0.4], [4, -3, 2.1]]) O.prop('charrette_renversee', s.x + lx, sol(s.x + lx, s.z + lz), s.z + lz, r);
    for (const [lx, lz, id] of [[-2, 5, 'caisses'], [6, 2, 'tonneau_vieux'], [7, 0.5, 'tonneau_vieux'], [-7, -2, 'sacs'], [1, -6, 'caisse']]) O.prop(id, s.x + lx, sol(s.x + lx, s.z + lz), s.z + lz, rnd() * TAU);
    os(s.x - 9, s.z + 4, 4, 3); os(s.x + 8, s.z - 7, 3, 2.5);
    lire('charrettes', s.x - 2.6, s.z + 6.2, null);
    cache('v2_cache_charrettes', s.x + 4, y + 0.8, s.z - 1.6, 'Fouiller la charrette', 'v2_charrettes', 'Sous la bâche pourrie, ce que les bêtes n’ont pas voulu.');
    O.lieu('v2_charrettes', s.x, s.z, 30, 'les Charrettes');
    C.poser('v2_garou', s.x, y, s.z, { id: 'v2_garous_charrettes', r: 140, cap: rnd() * TAU });
  }
  // ================================================================ 2. les Pendants (Bois Mort, au sud) : les arbres aux pendus
  const potence = (x, z, nb, id) => {
    const br = [], tips = [];
    const a0 = rnd() * TAU;
    for (let k = 0; k < nb; k++) { const a = a0 + k * (TAU / nb) + (rnd() - 0.5) * 0.6, L = 2.1 + rnd() * 0.7, h = 4.2 + rnd() * 0.7; br.push([a, L, h]); tips.push({ x: x + Math.sin(a) * (L - 0.35), z: z + Math.cos(a) * (L - 0.35), y: sol(x, z) + h - 0.1 }); }
    O.prop('v2_potence', x, sol(x, z), z, 0, { br });
    C.poser('v2_pendu', x, sol(x, z), z, { id, n: nb, r: 0, extra: { branches: tips } });
  };
  {
    const s = site(2);
    const pts = [[0, 0], [-11, 7], [10, -6], [-4, -12]];
    pts.forEach(([lx, lz], k) => potence(s.x + lx, s.z + lz, k === 0 ? 3 : 1 + (k % 2), 'v2_pendants_' + k));
    lire('pendants', s.x + 2, s.z + 9, 'pierre_gravee', rnd() * TAU);
    os(s.x + 3, s.z - 3, 3, 4);
    O.lieu('v2_pendants', s.x, s.z, 28, 'les Pendants');
  }
  // des pendus près des chemins (à quelques pas : sur le chemin, on ne craint rien)
  {
    const zones = [[0.49, 0.78], [0.47, 0.70], [0.28, 0.70], [0.42, 0.61]];
    zones.forEach(([u, v], k) => {
      const P = chercher(u * S, v * S, 40, { r: 2.5, test: (x, z) => O.surChemin(x, z, 3) && !O.surChemin(x, z, 1), nid: 60, arrivee: 120 });
      if (P) potence(P[0], P[1], 1 + (k % 2), 'v2_pendus_chemin_' + k);
    });
  }
  // ================================================================ 3. la Bauge (Cendrières, à l'ouest) : la Tarasque sur les offrandes
  {
    const s = site(3), cap = rnd() * TAU, fx = Math.sin(cap), fz = Math.cos(cap);
    const ox = s.x + fx * 4.6 + fz * 2.2, oz = s.z + fz * 4.6 - fx * 2.2;
    O.prop('v2_offrandes', ox, sol(ox, oz), oz, cap);
    O.inter('v2_offrandes', 'v2_offrandes_bauge', ox, sol(ox, oz) + 0.6, oz, 'Les offrandes', { table: 'v2_offrandes' });
    for (let k = 0; k < 6; k++) { const a = rnd() * TAU, d = 6 + rnd() * 5, x = s.x + Math.cos(a) * d, z = s.z + Math.sin(a) * d; O.prop('bougie', x, sol(x, z), z, 0); }
    const sx = s.x - fx * 9, sz = s.z - fz * 9;
    lire('bauge', sx, sz, 'pierre_gravee', cap + Math.PI);
    O.prop('statue_saint', s.x + fz * 10, sol(s.x + fz * 10, s.z - fx * 10), s.z - fx * 10, cap + 2.6);
    O.lieu('v2_bauge', s.x, s.z, 32, 'la Bauge');
    C.poser('v2_tarasque', s.x, s.y, s.z, { id: 'v2_tarasque', cap });
  }
  // ================================================================ 4. le Jardin de pierre (Cendrières, au nord) : le basilic
  {
    const s = site(4);
    O.prop('v2_oeuf', s.x + 2, sol(s.x + 2, s.z - 1), s.z - 1, rnd() * TAU);
    O.objet('deadtree', s.x - 1.5, s.z + 2.5, 7);
    const n = 7;
    let miroir = null;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * TAU + rnd() * 0.4, d = 10 + rnd() * 12, x = s.x + Math.cos(a) * d, z = s.z + Math.sin(a) * d;
      const r = Math.atan2(s.x - x, s.z - z) + (rnd() - 0.5) * 0.5;
      const v = k === 0 ? 0 : 1 + (k % 3);
      const q = O.prop('v2_statue', x, sol(x, z), z, r, { v });
      if (k === 0) miroir = q;
    }
    if (miroir) O.inter('v2_statue', 'v2_statue_miroir', miroir.x, miroir.y + 1.6, miroir.z, 'Un homme de pierre', { pris: false });
    const ex = s.x + 26, ez = s.z + 4;
    lire('jardin', ex, ez, 'pierre_gravee', -Math.PI / 2);
    O.lieu('v2_jardin', s.x, s.z, 30, 'le Jardin de pierre');
    C.poser('v2_basilic', s.x, s.y, s.z, { id: 'v2_basilic', r: 30 });
  }
  // ================================================================ 5. l'Antre (Ravines) : la Chimère devant sa tanière
  {
    const s = site(5);
    // l'ouverture regarde vers le chemin des Ravines (au sud-ouest du site) ; la tanière est derrière elle
    const cap = Math.atan2(0.77 * S - s.x, 0.70 * S - s.z) + (rnd() - 0.5) * 0.4, fx = Math.sin(cap), fz = Math.cos(cap);
    const f = { x: s.x - fx * 4, y: s.y, z: s.z - fz * 4, r: cap };
    const B = O.B, m = M_V1_PIERRE;
    // trois parois et un toit : une tanière de 6 m sur 5, haute de 3,2 m
    B.block(f, 0, -0.6, -2.8, 7.2, 4.4, 0.9, M_ROCK);
    B.block(f, -3.3, -0.6, 0, 0.9, 4.0, 6.2, M_ROCK);
    B.block(f, 3.3, -0.6, 0, 0.9, 4.2, 6.2, M_ROCK);
    B.block(f, 0, 3.2, -0.3, 7.6, 1.2, 6.0, m);
    B.block({ x: f.x + fx * 3.6 + fz * 3.4, y: s.y - 0.3, z: f.z + fz * 3.6 - fx * 3.4, r: cap + 0.5 }, 0, 0, 0, 1.6, 1.4, 1.2, M_ROCK);
    const [tx, tz] = B.toWorld(f, 1.6, -1.7);
    O.prop('coffre_vieux', tx, s.y, tz, cap + Math.PI);
    cache('v2_tanniere', tx, s.y + 0.6, tz, 'Fouiller la tanière', 'v2_tanniere', 'Des os rongés, de la paille noire, et ce qui reste d’un coffre.');
    os(f.x, f.z, 5, 2.4);
    const [px, pz] = B.toWorld(f, -2.7, 1.5);
    O.inter('v2_lire', 'v2_ins_antre', px, s.y + 1.6, pz, V2_INSCRIPTIONS.antre[0], { ins: 'antre' });
    O.lieu('v2_antre', s.x, s.z, 26, 'l’Antre');
    C.poser('v2_chimere', s.x + fx * 1.2, s.y, s.z + fz * 1.2, { id: 'v2_chimere', cap });
  }
  // ================================================================ 6. la Pierre plate (rive de l'Étang) : la vouivre
  {
    const s = site(6), E = reg('etang');
    // la rive : du site vers le centre de l'Étang, le dernier point au sec
    const dx = E.x - s.x, dz = E.z - s.z, d = Math.hypot(dx, dz) || 1, ux = dx / d, uz = dz / d;
    let px = s.x, pz = s.z, wx = E.x, wz = E.z;
    for (let k = 0; k < 400; k += 1) {
      const x = s.x + ux * k, z = s.z + uz * k;
      if (sol(x, z) >= WL - 0.3) continue;
      wx = x + ux * 9; wz = z + uz * 9;
      // la pierre : au sec (au moins trente centimètres au-dessus de l'eau), juste avant
      let b = k;
      while (b > 0 && sol(s.x + ux * b, s.z + uz * b) < WL + 0.35) b -= 0.5;
      px = s.x + ux * Math.max(0, b - 1.2); pz = s.z + uz * Math.max(0, b - 1.2);
      break;
    }
    const py = sol(px, pz);
    const pierre = O.prop('v2_pierre_plate', px, py, pz, Math.atan2(ux, uz), { gemme: false, lit: false });
    Z.v2.pierre = pierre;
    O.inter('v2_vouivre', 'v2_pierre_plate', px, py + 0.7, pz, 'La pierre plate', {});
    const lx = px - ux * 9 + uz * 5, lz = pz - uz * 9 - ux * 5;
    lire('bains', lx, lz, 'pierre_gravee', Math.atan2(ux, uz));
    O.lieu('v2_bains', px, pz, 26, 'la Pierre plate');
    C.poser('v2_vouivre', px, py, pz, { id: 'v2_vouivre', extra: { pierre: { x: px, y: py, z: pz }, bain: { x: wx, z: wz }, etang: { x: E.x, z: E.z }, lit: [-ux * 3.5 - uz * 1.5, -uz * 3.5 + ux * 1.5] } });
    if (C.S().vouivre.gemme === 'pierre') { pierre.data.gemme = true; pierre.data.lit = true; }
  }
  // ================================================================ 7. les Guetteurs (Degrés) : trois gargouilles sur leurs socles
  {
    const s = site(7), cap = Math.atan2(0.50 * S - s.x, 0.40 * S - s.z);
    [-1, 0, 1].forEach((k) => {
      const a = cap + Math.PI / 2, x = s.x + Math.sin(a) * k * 8 + Math.sin(cap) * Math.abs(k) * -3, z = s.z + Math.cos(a) * k * 8 + Math.cos(cap) * Math.abs(k) * -3;
      const y = sol(x, z), h = 2.4 + (k === 0 ? 0.6 : 0);
      O.prop('v2_socle', x, y, z, cap, { h });
      C.poser('v2_gargouille', x, y + h + 0.12, z, { id: 'v2_guetteur_' + (k + 1), perche: true, cap: cap + k * 0.5 });
    });
    O.inter('v2_lire', 'v2_ins_guetteurs', s.x - Math.sin(cap) * 1.2, sol(s.x, s.z) + 1.2, s.z - Math.cos(cap) * 1.2, V2_INSCRIPTIONS.guetteurs[0], { ins: 'guetteurs' });
    // un poste ruiné derrière eux
    O.B.block({ x: s.x - Math.sin(cap) * 9, y: s.y, z: s.z - Math.cos(cap) * 9, r: cap }, 0, -0.5, 0, 6, 2.2, 0.7, M_V1_PIERRE);
    O.B.block({ x: s.x - Math.sin(cap) * 9 + Math.cos(cap) * 3, y: s.y, z: s.z - Math.cos(cap) * 9 - Math.sin(cap) * 3, r: cap }, 0, -0.5, 2, 0.7, 1.6, 4, M_V1_PIERRE);
    O.lieu('v2_guetteurs', s.x, s.z, 24, 'les Guetteurs');
  }
  // ================================================================ 8. la Ronde (Tertres) : les korrigans
  {
    const s = site(8);
    O.prop('c2_menhir', s.x, s.y, s.z, rnd() * TAU);
    for (let k = 0; k < 9; k++) { const a = (k / 9) * TAU, x = s.x + Math.cos(a) * 7.5, z = s.z + Math.sin(a) * 7.5; O.prop('pierre_dressee', x, sol(x, z) - 0.2, z, a, null, 0.5); }
    const [lx, lz] = [s.x + 2.2, s.z - 1.6];
    O.prop('dalle', lx, sol(lx, lz), lz, 0.7);
    O.inter('v2_lire', 'v2_ins_ronde', lx, sol(lx, lz) + 0.4, lz, V2_INSCRIPTIONS.ronde[0], { ins: 'ronde' });
    O.lieu('v2_ronde', s.x, s.z, 22, 'la Ronde');
    C.poser('v2_korrigan', s.x, s.y, s.z, { id: 'v2_korrigans', n: 7 });
  }

  // ================================================================ dans les régions de V1
  // d'autres garous, à l'est du Bois Mort (deux, autour d'une charrette)
  {
    const B = reg('bois_mort'), P = chercher(B.x + B.r * 0.35, B.z - B.r * 0.1, B.r * 0.3, { r: 4 });
    if (P) { O.prop('charrette_renversee', P[0] + 2, sol(P[0] + 2, P[1]), P[1], rnd() * TAU); os(P[0], P[1], 3, 3); C.poser('v2_garou', P[0], sol(P[0], P[1]), P[1], { id: 'v2_garous_est', n: 2, r: 110 }); }
  }
  // les mange-morts : là où il y a des os
  [['cendrieres', 0.4, -0.3, 'v2_charognards_c1'], ['cendrieres', -0.3, 0.45, 'v2_charognards_c2'], ['tertres', 0.2, 0.3, 'v2_charognards_t'], ['ravines', -0.25, 0.1, 'v2_charognards_r']].forEach(([k, u, v, id]) => {
    const G = reg(k), P = chercher(G.x + G.r * u, G.z + G.r * v, G.r * 0.35, { r: 3 });
    if (P) { os(P[0], P[1], 4, 4); C.poser('v2_charognard', P[0], sol(P[0], P[1]), P[1], { id, r: 60 }); }
  });
  // la Ville Basse : des gargouilles sur les murs les plus hauts ; l'écoutant, la nuit
  {
    const G = reg('ville_basse'), cand = [];
    for (const b of Z.blocks) {
      if (b.hidden || b.under || (b.m !== M_V1_PIERRE && b.m !== M_MOSSY)) continue;
      if (Math.hypot(b.x - G.x, b.z - G.z) > G.r) continue;
      const top = b.y + b.sy, g = sol(b.x, b.z);
      if (top - g < 3.0 || Math.min(b.sx, b.sz) < 0.55 || Math.max(b.sx, b.sz) < 1.2) continue;
      if (!loinDe(b.x, b.z, feux, 35)) continue;
      cand.push(b);
    }
    cand.sort((a, b) => (b.y + b.sy) - (a.y + a.sy));
    const pris = [];
    for (const b of cand) {
      if (pris.length >= 5) break;
      if (!loinDe(b.x, b.z, pris, 45)) continue;
      pris.push([b.x, b.z]);
      const cap = Math.atan2(G.x - b.x, G.z - b.z) + (rnd() - 0.5) * 1.2;
      C.poser('v2_gargouille', b.x, b.y + b.sy, b.z, { id: 'v2_gargouille_vb' + pris.length, perche: true, cap });
    }
    for (const [u, v, id] of [[-0.35, 0.2, 'v2_ecoutant_1'], [0.3, -0.35, 'v2_ecoutant_2']]) {
      const P = chercher(G.x + G.r * u, G.z + G.r * v, G.r * 0.3, { r: 2, feu: 45, nid: 30 });
      if (P) C.poser('v2_ecoutant', P[0], sol(P[0], P[1]), P[1], { id, r: 70 });
    }
  }
  // les stryges : au bord des falaises (Ravines, Degrés, le pied du Pic) ; leurs nids, où brille ce qu'elles prennent
  {
    const falaise = (x, z) => { let m = 0; for (let a = 0; a < 8; a++) { const h = sol(x + Math.cos(a * 0.785) * 7, z + Math.sin(a * 0.785) * 7); m = Math.max(m, sol(x, z) - h); } return m > 4.5; };
    const lots = [['ravines', 0.1, -0.2], ['ravines', 0.35, 0.45], ['degres', -0.2, 0.1], ['degres', 0.3, -0.25], ['pic', 0.3, 0.8]];
    lots.forEach(([k, u, v], i) => {
      const G = reg(k);
      let P = null;
      for (let t = 0; t < 400 && !P; t++) { const a = rnd() * TAU, d = Math.sqrt(rnd()) * G.r * 0.6, x = G.x + G.r * u + Math.cos(a) * d, z = G.z + G.r * v + Math.sin(a) * d; if (Z.inside(x, z, 40) && sol(x, z) > WL + 2 && falaise(x, z) && !O.surChemin(x, z, 1) && zoneGen.horsSites(x, z, 3) && loinDe(x, z, feux, 50) && pasPresNid(x, z, 50)) P = [x, z]; }
      if (!P) return;
      const y = sol(P[0], P[1]);
      O.prop('v2_nid', P[0], y, P[1], rnd() * TAU);
      cache('v2_nid_stryge_' + i, P[0], y + 0.3, P[1], 'Un nid', 'v2_nid_stryge', 'Des brindilles, des os de lièvre, des cheveux. Et, au fond, ce qui brille.');
      C.poser('v2_stryge', P[0], y, P[1], { id: 'v2_stryges_' + i, r: 40 });
    });
  }
  // les noyés : dans l'Étang, là où c'est profond ; loin de la pierre plate
  {
    const E = reg('etang'), P0 = Z.v2.pierre, pris = [];
    for (let t = 0; t < 600 && pris.length < 5; t++) {
      const a = rnd() * TAU, d = Math.sqrt(rnd()) * E.r * 0.7, x = E.x + Math.cos(a) * d, z = E.z + Math.sin(a) * d;
      if (sol(x, z) > WL - 1.4) continue;
      if (P0 && Math.hypot(x - P0.x, z - P0.z) < 40) continue;
      if (!loinDe(x, z, pris, 35)) continue;
      // près d'une rive (on doit pouvoir l'entendre du bord)
      let rive = false;
      for (let b = 0; b < 8 && !rive; b++) for (const k of [10, 18, 26]) if (sol(x + Math.cos(b * 0.785) * k, z + Math.sin(b * 0.785) * k) > WL + 0.2) { rive = true; break; }
      if (!rive) continue;
      pris.push([x, z]);
      C.poser('v2_noye', x, WL - 1.3, z, { id: 'v2_noye_' + pris.length, r: 8 });
    }
  }
  // le cerf-aux-mains : le Bois Mort, à l'est ; son arbre creux, plus loin
  {
    const B = reg('bois_mort'), P = chercher(B.x + B.r * 0.15, B.z + B.r * 0.35, B.r * 0.25, { r: 3, nid: 120 });
    const T = chercher(B.x - B.r * 0.05, B.z - B.r * 0.4, B.r * 0.3, { r: 3, nid: 60, test: (x, z) => !P || Math.hypot(x - P[0], z - P[1]) > 140 });
    if (T) {
      O.prop('v2_creux', T[0], sol(T[0], T[1]), T[1], rnd() * TAU);
      cache('v2_creux', T[0], sol(T[0], T[1]) + 1.0, T[1], 'L’arbre creux', 'v2_cache_cerf', 'Un carnier de chasseur, rangé avec soin dans le creux de l’arbre, comme pour quelqu’un qui devait revenir.');
    }
    if (P) C.poser('v2_cerf', P[0], sol(P[0], P[1]), P[1], { id: 'v2_cerf', r: 70, extra: { creux: T ? { x: T[0], z: T[1] } : null } });
  }
  // le chien gris : au Seuil, à quelques pas du premier feu
  {
    const F0 = feux[0] || [A.x, A.z - 20];
    let P = null;
    for (let k = 0; k < 80 && !P; k++) { const a = rnd() * TAU, d = 14 + rnd() * 12, x = F0[0] + Math.cos(a) * d, z = F0[1] + Math.sin(a) * d; if (O.libre(x, z, 1.5) && Math.hypot(x - A.x, z - A.z) > 12) P = [x, z]; }
    if (P) C.poser('v2_chien', P[0], sol(P[0], P[1]), P[1], { id: 'v2_chien', r: 10 });
  }
  // les sans-visage : sur les paliers des Degrés, et au bord des Hauts
  [['degres', -0.35, 0.25, 'v2_sans_visage_1'], ['degres', 0.25, -0.4, 'v2_sans_visage_2'], ['hauts', -0.55, 0.45, 'v2_sans_visage_3']].forEach(([k, u, v, id]) => {
    const G = reg(k), P = chercher(G.x + G.r * u, G.z + G.r * v, G.r * 0.3, { r: 6, nid: 60 });
    if (P) C.poser('v2_sans_visage', P[0], sol(P[0], P[1]), P[1], { id, r: 26 });
  });
  Z.v2.n = nids().length;
});

// ---------------------------------------------------------------- les interactions des repaires
function v2Cache(it, bruit) {
  const C = creaturesV2, S = C.S(), d = it.data || {};
  if (S.caches[it.id]) { ui.subtitle('', '(Il n’y a plus rien.)', 2.5); return; }
  S.caches[it.id] = farm.s.day;
  const p = game.player;
  furtif.bruit(it.x, it.y, it.z, p.crouch > 0.5 ? (bruit || 6) * 0.45 : (bruit || 6), 'fouille');
  const pos = [it.x, it.y + 0.2, it.z], L = rollLoot(d.table);
  for (const [id, n] of L) { if (id === 'argent') { farm.earn(n); sound.coin && sound.coin(); } else { farm.give(id, n); play.flyer(id, pos, n); } }
  // ce que les stryges ont pris revient dans leurs nids
  if (d.table === 'v2_nid_stryge' && S.strygeVol > 0) { farm.earn(S.strygeVol); sound.coin && sound.coin(); S.strygeVol = 0; }
  sound.lootOpen && sound.lootOpen();
  if (d.txt) ui.subtitle('', '(' + d.txt + ')', 4);
  farm.save();
}
HOOKS.inter.v2_lire = (it) => { const I = V2_INSCRIPTIONS[it.data.ins]; if (!I) return; ui.read(I[0], I[1]); const S = creaturesV2.S(); if (!S.lus || typeof S.lus !== 'object') S.lus = {}; S.lus[it.data.ins] = farm.s.day; };
HOOKS.inter.v2_cache = (it) => v2Cache(it, 6);
HOOKS.inter.v2_offrandes = (it) => v2Cache(Object.assign({}, it, { data: Object.assign({}, it.data, { txt: 'Des pièces vertes, des bagues, des petits saints de bois. Des gens sont venus jusqu’ici, autrefois, pour la prier de dormir.' }) }), 8);
HOOKS.inter.v2_statue = (it) => {
  const S = creaturesV2.S();
  if (S.caches.v2_miroir) { ui.read('Un homme de pierre', 'Un homme de pierre, le bras levé devant le visage. Sa main est vide, maintenant.'); return; }
  ui.choice('Un homme de pierre', 'Un homme de pierre, le bras levé devant le visage, comme pour se protéger du soleil. Dans sa main de pierre, une plaque d’acier poli, tournée vers lui.', [
    { label: 'Prendre la plaque', fn: () => {
      ui.close(); S.caches.v2_miroir = farm.s.day; farm.give('v2_miroir_acier', 1); play.flyer('v2_miroir_acier', [it.x, it.y, it.z], 1);
      const q = zone.Z && zone.Z.props.find((p) => p.id === 'v2_statue' && p.data && p.data.v === 0 && Math.hypot(p.x - it.x, p.z - it.z) < 1);
      if (q) zone.setPropData(q, { pris: true });
      furtif.bruit(it.x, it.y, it.z, 4, 'acier');
      farm.save();
    } },
    { label: 'Laisser', fn: () => ui.close() },
  ]);
};
HOOKS.inter.v2_vouivre = (it) => {
  const C = creaturesV2, V = C.S().vouivre;
  if (V.gemme === 'pierre') {
    ui.choice('La pierre plate', 'Sur la pierre, dans le creux usé, une pierre rouge grosse comme un œuf de caille. Elle luit doucement, comme une braise qui respire. Dans l’eau, tout près, quelque chose nage.', [
      { label: 'Prendre la pierre rouge', fn: () => {
        ui.close(); V.gemme = 'joueur'; V.prise = farm.s.day;
        farm.give('v2_escarboucle', 1); play.flyer('v2_escarboucle', [it.x, it.y, it.z], 1);
        v2PierreMaj();
        furtif.bruit(it.x, it.y, it.z, 6, 'pierre');
        const e = C.vivantes.find((q) => q.esp === 'v2_vouivre' && !q.mort);
        if (e) { C.crier(e, 'cri', 1.3, true); e.cri = 2.5; const F = e.furtif; if (F) { F.soupcon = 2; F.dernier = { x: it.x, y: it.y, z: it.z, t: game.time, vu: false }; furtif.changer(e, 'alertee'); } }
        ui.subtitle('', V2_TEXTES.vouivreGemme, 4);
        farm.save();
      } },
      { label: 'Laisser', fn: () => ui.close() },
    ]);
    return;
  }
  if (V.gemme === 'joueur' && farm.count('v2_escarboucle')) {
    ui.choice('La pierre plate', 'Le creux usé de la pierre est vide. L’escarboucle est chaude dans votre poche.', [
      { label: 'La reposer dans le creux', fn: async () => {
        ui.close(); farm.take('v2_escarboucle', 1); V.gemme = 'rendue'; V.rendue = farm.s.day;
        const e = C.vivantes.find((q) => q.esp === 'v2_vouivre' && !q.mort);
        if (e) { e.paisible = false; e.aveugle = true; }
        await new Promise((r) => setTimeout(r, 1800));
        if (!V.morte) { farm.give('v2_ecaille_vouivre', 1); play.flyer('v2_ecaille_vouivre', [it.x, it.y, it.z], 1); ui.subtitle('', V2_TEXTES.vouivreRendue, 5); C.noter('v2_vouivre', 2); }
        farm.save();
      } },
      { label: 'La garder', fn: () => ui.close() },
    ]);
    return;
  }
  ui.read('La pierre plate', V.gemme === 'rendue' ? 'La pierre plate, au bord de l’eau. Une écaille verte y a laissé sa trace, comme un sceau.' : 'Une grande pierre plate au bord de l’Étang, usée en son milieu comme une marche d’église, par quelque chose qui s’y pose souvent.');
};
for (const k of ['v2_lire', 'v2_cache', 'v2_offrandes', 'v2_statue', 'v2_vouivre']) HOOKS.interVis[k] = () => zone.dedans;
