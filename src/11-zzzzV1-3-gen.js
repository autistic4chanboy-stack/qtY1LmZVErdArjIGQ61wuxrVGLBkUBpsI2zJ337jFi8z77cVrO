// ============================================================================
//  LES TERRES D'AVANT (agent V1) — la génération de la Zone (une fois, en mémoire)
//  1. le relief grossier (grille de 8 m) : V1Relief.point, puis les chemins (adoucis,
//     pente bornée) et les ravines (entailles à pic) ; les ponts là où les chemins
//     les franchissent ;
//  2. le relief fin (2 m) : interpolation + détail selon la rugosité, aplanissement
//     exact des sites réservés ; les matières (cendre, terre morte, roche…) ;
//  3. la Porte, de ce côté-ci, et le Seuil ; les ruines de la Ville Basse ; les
//     tertres ; puis la végétation morte, les pierres, les os (objets) ;
//  4. les passes des autres agents (zone.passe), dans l'ordre ;
//  5. ce qui a été pris ou coupé dans la Zone (farm.s.zone.cartes) est retiré.
//  Coût mesuré : zone.mesures (ms par étape).
// ============================================================================
const zoneGen = {
  async generer(seed, progress) {
    const tick = (m) => { progress(m); return new Promise((r) => setTimeout(r, 0)); };
    const T0 = performance.now(), mes = {};
    const lap = (k, t) => { mes[k] = Math.round(performance.now() - t); return performance.now(); };
    const N = V1_ZONE_N, cell = V1_ZONE_CELL, W = N + 1, S = N * cell, WL = V1_ZONE_EAU;
    V1Relief.preparer(seed);
    const Z = new World(N, cell);
    Z.name = V1_ZONE_NOM; Z.seed = seed; Z.genVersion = 1; Z.zone = true; Z.waterLevel = WL;
    Object.defineProperty(Z, 'time', { get() { return farm.w ? farm.w.time : 0.3; }, set(v) { if (farm.w) farm.w.time = v; } });
    Object.defineProperty(Z, 'dayLength', { get() { return farm.w ? farm.w.dayLength : JOUR_SECONDES; }, set() {} });
    Z.weather = 'fog';
    Z.inter = []; Z.bld = {}; Z.lm = {}; Z.nav = { nodes: [], edges: [] }; Z.pools = []; Z.farm = null; Z.townInfo = null;
    Z.noBuild = [{ x: S / 2, z: S / 2, r: S, why: 'cette terre n’est à personne' }];
    Z.designed = false; Z.snowLine = WL + 150;
    const rnd = mulberry32((seed ^ 0x0B1E7A11) >>> 0);
    const B = new Builder(Z, rnd, new Uint8Array(1));
    const nD = V1Relief.nD, nC = V1Relief.nC;

    // ------------------------------------------------------------- 1. relief grossier
    await tick('Derrière la Porte… le relief');
    let t = performance.now();
    // (le relief grossier se calcule aux 16 m, puis s'interpole aux 8 m : chemins et ravines s'y creusent)
    const C2 = 16, n2 = Math.round(S / C2) + 1, G2 = new Float32Array(n2 * n2), RG2 = new Float32Array(n2 * n2), REG2 = new Uint8Array(n2 * n2);
    const regKeys = Object.keys(V1_REGIONS), RK = regKeys.map((k) => V1_REGIONS[k]);
    const RUG = { cendrieres: 0.5, ville_basse: 0.7, seuil: 0.7, etang: 0.9, ravines: 2.2, pic: 4, hauts: 0.9, degres: 1.6 };
    for (let j = 0; j < n2; j++) {
      for (let i = 0; i < n2; i++) {
        const x = i * C2, z = j * C2, u = x / S, v = z / S, id = j * n2 + i;
        G2[id] = V1Relief.point(x, z);
        let best = 0, bd = 1.25;
        for (let r = 0; r < RK.length; r++) { const R = RK[r], d = Math.hypot(u - R.x, v - R.z) / R.r; if (d < bd) { bd = d; best = r + 1; } }
        REG2[id] = best;
        const e = Math.min(u, v, 1 - u, 1 - v);
        RG2[id] = (best ? RUG[regKeys[best - 1]] || 1.5 : 1.5) + smoothstep(0.08, 0.0, e) * 6;
      }
      if (j % 48 === 47) await tick('Derrière la Porte… le relief');
    }
    const C = 8, n = Math.round(S / C) + 1, G = new Float32Array(n * n), RG = new Float32Array(n * n), REG = new Uint8Array(n * n);
    for (let j = 0; j < n; j++) {
      const gz = Math.min(j * C / C2, n2 - 1.001), jj = Math.floor(gz), fz = gz - jj;
      for (let i = 0; i < n; i++) {
        const gx = Math.min(i * C / C2, n2 - 1.001), ii = Math.floor(gx), fx = gx - ii, k = jj * n2 + ii, id = j * n + i;
        G[id] = (G2[k] * (1 - fx) + G2[k + 1] * fx) * (1 - fz) + (G2[k + n2] * (1 - fx) + G2[k + n2 + 1] * fx) * fz;
        RG[id] = (RG2[k] * (1 - fx) + RG2[k + 1] * fx) * (1 - fz) + (RG2[k + n2] * (1 - fx) + RG2[k + n2 + 1] * fx) * fz;
        REG[id] = REG2[(fz < 0.5 ? jj : jj + 1) * n2 + (fx < 0.5 ? ii : ii + 1)];
      }
    }
    const gAt = (x, z) => { const gx = clamp(x / C, 0, n - 1.001), gz = clamp(z / C, 0, n - 1.001), i = Math.floor(gx), j = Math.floor(gz), fx = gx - i, fz = gz - j, k = j * n + i; return (G[k] * (1 - fx) + G[k + 1] * fx) * (1 - fz) + (G[k + n] * (1 - fx) + G[k + n + 1] * fx) * fz; };
    t = lap('grossier', t);

    // chemins : profil lissé, pente bornée, puis le relief s'y couche
    await tick('Derrière la Porte… les chemins');
    const chemins = V1_CHEMINS.map((P) => {
      const pts = P.pts.map(([u, v]) => [u * S, v * S]);
      const smp = [];
      for (let s = 1; s < pts.length; s++) {
        const [x0, z0] = pts[s - 1], [x1, z1] = pts[s], L = Math.hypot(x1 - x0, z1 - z0), m = Math.max(1, Math.round(L / 8));
        for (let k = s === 1 ? 0 : 1; k <= m; k++) { const q = k / m; smp.push([lerp(x0, x1, q), lerp(z0, z1, q)]); }
      }
      let h = smp.map(([x, z]) => Math.max(gAt(x, z), WL + 1.2));
      for (let pass = 0; pass < 3; pass++) h = h.map((_, i) => { let s = 0, c = 0; for (let k = -5; k <= 5; k++) { const q = h[clamp(i + k, 0, h.length - 1)]; s += q; c++; } return s / c; });
      const dmax = (P.sentier ? 0.42 : 0.24) * 8;
      for (let i = 1; i < h.length; i++) h[i] = clamp(h[i], h[i - 1] - dmax, h[i - 1] + dmax);
      for (let i = h.length - 2; i >= 0; i--) h[i] = clamp(h[i], h[i + 1] - dmax, h[i + 1] + dmax);
      return { P, smp, h, w: P.w };
    });
    for (const R of chemins) {
      const { smp, h, w } = R, marge = w + 22;
      for (let s = 1; s < smp.length; s++) {
        const [x0, z0] = smp[s - 1], [x1, z1] = smp[s], dx = x1 - x0, dz = z1 - z0, L2 = dx * dx + dz * dz || 1;
        const i0 = Math.max(0, Math.floor((Math.min(x0, x1) - marge) / C)), i1 = Math.min(n - 1, Math.ceil((Math.max(x0, x1) + marge) / C));
        const j0 = Math.max(0, Math.floor((Math.min(z0, z1) - marge) / C)), j1 = Math.min(n - 1, Math.ceil((Math.max(z0, z1) + marge) / C));
        for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
          const x = i * C, z = j * C, q = clamp(((x - x0) * dx + (z - z0) * dz) / L2, 0, 1), d = Math.hypot(x - x0 - dx * q, z - z0 - dz * q);
          if (d > marge) continue;
          const ph = lerp(h[s - 1], h[s], q), k = smoothstep(marge, w + 3, d), id = j * n + i;
          G[id] = lerp(G[id], ph, k);
        }
      }
    }
    // ravines : entailles à pic (on les creuse après les chemins : là où un chemin passe, il faut un pont)
    const ravines = V1_RAVINES.map((R) => ({ R, pts: R.pts.map(([u, v]) => [u * S, v * S]) }));
    for (const { R, pts } of ravines) {
      const marge = R.w * 1.25;
      for (let s = 1; s < pts.length; s++) {
        const [x0, z0] = pts[s - 1], [x1, z1] = pts[s], dx = x1 - x0, dz = z1 - z0, L2 = dx * dx + dz * dz;
        const i0 = Math.max(0, Math.floor((Math.min(x0, x1) - marge) / C)), i1 = Math.min(n - 1, Math.ceil((Math.max(x0, x1) + marge) / C));
        const j0 = Math.max(0, Math.floor((Math.min(z0, z1) - marge) / C)), j1 = Math.min(n - 1, Math.ceil((Math.max(z0, z1) + marge) / C));
        for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
          const x = i * C, z = j * C, q = clamp(((x - x0) * dx + (z - z0) * dz) / L2, 0, 1), d = Math.hypot(x - x0 - dx * q, z - z0 - dz * q);
          const ww = R.w * (0.8 + 0.4 * (fbm(nC, x / 90, z / 90, 2) + 0.5));
          if (d > ww * 1.2) continue;
          const id = j * n + i, fond = WL + 1.5 + fbm(nD, x / 60, z / 60, 2) * 2;
          const k = 1 - smoothstep(ww * 0.45, ww * 1.05, d);
          G[id] = Math.min(G[id], lerp(G[id], fond, k));
          RG[id] = Math.max(RG[id], 2.5);
        }
      }
    }
    // où les chemins franchissent les ravines : des ponts
    const ponts = [];
    const inter2 = (a, b, c, d) => { const r = [b[0] - a[0], b[1] - a[1]], s = [d[0] - c[0], d[1] - c[1]], den = r[0] * s[1] - r[1] * s[0]; if (Math.abs(den) < 1e-9) return null; const t2 = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / den, u2 = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / den; return t2 >= 0 && t2 <= 1 && u2 >= 0 && u2 <= 1 ? { t: t2, x: a[0] + r[0] * t2, z: a[1] + r[1] * t2 } : null; };
    for (const Ch of chemins) for (let s = 1; s < Ch.smp.length; s++) for (const Rv of ravines) for (let k = 1; k < Rv.pts.length; k++) {
      const X = inter2(Ch.smp[s - 1], Ch.smp[s], Rv.pts[k - 1], Rv.pts[k]);
      if (!X) continue;
      const y = lerp(Ch.h[s - 1], Ch.h[s], X.t), dir = Math.atan2(Ch.smp[s][0] - Ch.smp[s - 1][0], Ch.smp[s][1] - Ch.smp[s - 1][1]);
      if (!ponts.some((p) => Math.hypot(p.x - X.x, p.z - X.z) < 30)) ponts.push({ x: X.x, z: X.z, y, r: dir, L: Rv.R.w * 2.5, w: Math.max(3.2, Ch.w * 1.6) });
    }
    t = lap('chemins', t);

    // ------------------------------------------------------------- 2. relief fin
    await tick('Derrière la Porte… les pentes');
    const H = Z.heights, M = Z.mats;
    // le détail fin : un bruit calculé aux 4 m, interpolé aux 2 m (deux échelles : 41 m et 13 m)
    const C4 = 4, n4 = Math.round(S / C4) + 1, NF = new Float32Array(n4 * n4);
    for (let j = 0; j < n4; j++) {
      const z = j * C4;
      for (let i = 0; i < n4; i++) { const x = i * C4; NF[j * n4 + i] = nD(x / 41, z / 41) * 0.75 + nC(x / 13, z / 13) * 0.25; }
      if (j % 200 === 199) await tick('Derrière la Porte… les pentes');
    }
    for (let j = 0; j <= N; j++) {
      const z = j * cell, gz = Math.min(z / C, n - 1.001), jj = Math.floor(gz), fz = gz - jj;
      const qz = Math.min(z / C4, n4 - 1.001), j4 = Math.floor(qz), f4z = qz - j4;
      for (let i = 0; i <= N; i++) {
        const x = i * cell, gx = Math.min(x / C, n - 1.001), ii = Math.floor(gx), fx = gx - ii, k = jj * n + ii;
        const g = (G[k] * (1 - fx) + G[k + 1] * fx) * (1 - fz) + (G[k + n] * (1 - fx) + G[k + n + 1] * fx) * fz;
        const r = (RG[k] * (1 - fx) + RG[k + 1] * fx) * (1 - fz) + (RG[k + n] * (1 - fx) + RG[k + n + 1] * fx) * fz;
        const qx = Math.min(x / C4, n4 - 1.001), i4 = Math.floor(qx), f4x = qx - i4, k4 = j4 * n4 + i4;
        const nf = (NF[k4] * (1 - f4x) + NF[k4 + 1] * f4x) * (1 - f4z) + (NF[k4 + n4] * (1 - f4x) + NF[k4 + n4 + 1] * f4x) * f4z;
        H[j * W + i] = g + nf * r;
      }
      if (j % 400 === 399) await tick('Derrière la Porte… les pentes');
    }
    // les sites réservés : aplanis à la hauteur annoncée (zone.site(id).y), sauf ceux qui sont sous terre
    for (const id in V1_SITES) {
      const st = zone.site(id);
      if (st.sous) continue;
      const fall = Math.max(10, st.r * 0.3);
      B.forVerts(st.x, st.z, st.r + fall, (i, j, k, x, z) => { const d = Math.hypot(x - st.x, z - st.z), q = 1 - smoothstep(st.r, st.r + fall, d); if (q > 0) H[k] = lerp(H[k], st.y, q); });
    }
    t = lap('fin', t);

    // ------------------------------------------------------------- matières
    await tick('Derrière la Porte… la cendre');
    const regAt = (x, z) => REG[clamp(Math.round(z / C), 0, n - 1) * n + clamp(Math.round(x / C), 0, n - 1)];
    const K = {}; regKeys.forEach((k, i) => { K[k] = i + 1; });
    // pour chaque région, ce qui pousse au sol (q : un tirage par bloc de 8 m)
    const MAT = new Uint8Array(regKeys.length + 1), ALT = new Uint8Array(regKeys.length + 1), ALTP = new Float32Array(regKeys.length + 1), ALT2 = new Uint8Array(regKeys.length + 1), ALT2P = new Float32Array(regKeys.length + 1);
    const regle = (r, m, a, ap, b, bp) => { MAT[r] = m; ALT[r] = a; ALTP[r] = ap; ALT2[r] = b === undefined ? m : b; ALT2P[r] = bp || 0; };
    // (q : un bruit doux, 0..1, en taches de quarante mètres ; ALTP : la part de la tache, en partant du haut)
    regle(0, M_V1_TERREMORTE, M_DRY, 0.16);
    regle(K.cendrieres, M_V1_CENDRE, M_DIRT, 0.08);
    regle(K.bois_mort, M_V1_TERREMORTE, M_DRY, 0.12);
    regle(K.ville_basse, M_V1_TERREMORTE, M_DRY, 0.1, M_COBBLE, 0.24); regle(K.seuil, M_V1_TERREMORTE, M_DRY, 0.08, M_COBBLE, 0.16);
    regle(K.tertres, M_V1_TERREMORTE, M_DRY, 0.45);
    regle(K.etang, M_V1_TERREMORTE, M_V1_TERREMORTE, 0);
    regle(K.hauts, M_V1_TERREMORTE, M_DRY, 0.35, M_GRASS, 0.42);
    regle(K.pic, M_ROCK, M_ROCK, 0);
    regle(K.ravines, M_V1_TERREMORTE, M_DRY, 0.16); regle(K.degres, M_V1_TERREMORTE, M_DRY, 0.2);
    const cend = K.cendrieres, WL6 = WL + 0.6, NEIGE = WL + 200;
    for (let j = 0; j <= N; j++) {
      const jr = Math.min(n - 1, Math.round(j * cell / C)) * n, jh = j < N ? W : -W;
      for (let i = 0; i <= N; i++) {
        const k = j * W + i, h = H[k];
        const hx = H[k + (i < N ? 1 : -1)] - h, hz = H[k + jh] - h, sl = (Math.abs(hx) > Math.abs(hz) ? Math.abs(hx) : Math.abs(hz)) / cell;
        let m;
        if (sl > 0.95) m = M_CLIFF;
        else if (sl > 0.62) m = M_ROCK;
        else {
          const r = REG[jr + Math.min(n - 1, Math.round(i * cell / C))];
          if (h < WL6) m = r === cend ? M_V1_CENDRE : M_DIRT;
          else if (h > NEIGE && sl < 0.8) m = M_SNOW;
          else {
            const q = 1 - clamp(NF[(j >> 1) * n4 + (i >> 1)] * 0.75 + 0.5, 0, 1); // (taches douces : le bruit fin du relief)
            m = q < ALTP[r] ? ALT[r] : q < ALT2P[r] ? ALT2[r] : MAT[r];
          }
        }
        M[k] = m;
      }
      if (j % 500 === 499) await tick('Derrière la Porte… la cendre');
    }
    // les chemins se voient : terre battue, et les vieux pavés de la Voie
    const masque = new Uint8Array(Math.ceil(S / 4) * Math.ceil(S / 4)), mW = Math.ceil(S / 4);
    for (const Ch of chemins) {
      const mat = Ch.P.nom === 'la Voie' ? M_COBBLE : M_DIRT;
      for (let s = 1; s < Ch.smp.length; s++) {
        const [x0, z0] = Ch.smp[s - 1], [x1, z1] = Ch.smp[s];
        B.paintLine(x0, z0, x1, z1, Ch.w, mat);
        for (let q = 0; q <= 4; q++) { const x = lerp(x0, x1, q / 4), z = lerp(z0, z1, q / 4); for (let dj = -2; dj <= 2; dj++) for (let di = -2; di <= 2; di++) { const a = clamp(Math.floor(x / 4) + di, 0, mW - 1), b = clamp(Math.floor(z / 4) + dj, 0, mW - 1); masque[b * mW + a] = 1; } }
      }
    }
    t = lap('matieres', t);

    // ------------------------------------------------------------- 3. constructions
    await tick('Derrière la Porte… les pierres');
    // la Porte, de ce côté-ci : dans la paroi du sud, face au nord
    let zP = 0.945 * S;
    for (let k = 0; k < 60; k++) { const zz = 0.93 * S + k * 2; if (Z.heightAt(S / 2, zz) > WL + 22 + 3) { zP = zz - 2; break; } }
    const fP = { x: S / 2, y: Z.heightAt(S / 2, zP - 6) + 0.05, z: zP, r: 0 };
    const PZ = v1BatirPorte(B, fP, { zone: true, feux: 'zone' });
    B.inter('v1_seuil', 'v1_seuil', PZ.inter[0], PZ.inter[1], PZ.inter[2], 'La Grande Porte', {});
    for (const q of PZ.braseros) q.data = { lit: true };
    const arrivee = { x: S / 2, z: zP - 16, yaw: 0 };
    arrivee.y = Z.heightAt(arrivee.x, arrivee.z);
    // le Seuil : une cour de murs bas effondrés, une arche brisée, une stèle, le premier feu de veille
    const fS = { x: S / 2, y: Z.heightAt(S / 2, zP - 40), z: zP - 40, r: 0 };
    zoneGen.murets(B, fS, 34, 26, rnd, M_V1_PIERRE);
    zoneGen.arche(B, { x: S / 2, y: Z.heightAt(S / 2, zP - 70), z: zP - 70, r: 0 }, 7, 8, M_V1_PIERRE, true);
    const [stx, stz] = [S / 2 + 6, zP - 22];
    B.prop('v1_stele', stx, Z.heightAt(stx, stz), stz, Math.PI);
    B.inter('v1_stele', 'v1_stele_seuil', stx, Z.heightAt(stx, stz) + 1.4, stz, 'Lire la stèle', { texte: 'seuil' });
    // les ponts sur les ravines
    for (const p of ponts) zoneGen.pont(B, p, Z);
    // les ruines de la Ville Basse (on ne bâtit ni sur les chemins ni sur les sites des autres)
    const VB = V1_REGIONS.ville_basse, cx = VB.x * S, cz = VB.z * S, rr = VB.r * S;
    let nRuines = 0;
    for (let k = 0; k < 400 && nRuines < 46; k++) {
      const a = rnd() * TAU, d = Math.sqrt(rnd()) * rr * 0.9, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
      if (zoneGen.surChemin(masque, mW, x, z, 3) || !zoneGen.horsSites(x, z, 8)) continue;
      const w0 = 5 + rnd() * 6, d0 = 5 + rnd() * 5, r0 = Math.round(rnd() * 4) * Math.PI / 2 + (rnd() - 0.5) * 0.3;
      if (zoneGen.occupe(Z, x, z, Math.hypot(w0, d0) / 2 + 2)) continue;
      const y0 = Z.heightAt(x, z);
      zoneGen.ruine(B, { x, y: y0, z, r: r0 }, w0, d0, rnd, Z);
      nRuines++;
    }
    // les tertres : des tumulus et des pierres dressées
    const TT = V1_REGIONS.tertres;
    for (let k = 0; k < 9; k++) {
      const a = rnd() * TAU, d = Math.sqrt(rnd()) * TT.r * S * 0.8, x = TT.x * S + Math.cos(a) * d, z = TT.z * S + Math.sin(a) * d;
      if (zoneGen.surChemin(masque, mW, x, z, 6) || !zoneGen.horsSites(x, z, 10)) continue;
      const R0 = 7 + rnd() * 6;
      B.forVerts(x, z, R0 * 1.4, (i, j, kk, px, pz) => { const q = 1 - Math.hypot(px - x, pz - z) / (R0 * 1.4); if (q > 0) H[kk] += Math.sin(q * Math.PI / 2) * R0 * 0.45; });
      const yy = Z.heightAt(x, z) + R0 * 0.45;
      B.block({ x, y: yy - 2.2, z, r: rnd() * TAU }, 0, 0, 0, 0.9, 3.2 + rnd() * 1.5, 0.6, M_V1_PIERRE);
    }
    t = lap('constructions', t);

    // ------------------------------------------------------------- objets : arbres morts, os, pierres, herbes hautes
    await tick('Derrière la Porte… le bois mort');
    const TY = (id) => OBJ_INDEX[id];
    const TABLE = {
      cendrieres: [['deadtree', 0.022], ['reeds', 0.10, 'eau'], ['stones', 0.03], ['bones', 0.006], ['wisp', 0.0012]],
      bois_mort: [['deadtree', 0.17], ['stump', 0.03], ['tallgrass', 0.14], ['bush', 0.004], ['rock', 0.012], ['bones', 0.004], ['mushroom', 0.006], ['fern', 0.02]],
      ville_basse: [['tallgrass', 0.09], ['stones', 0.04], ['deadtree', 0.012], ['tomb', 0.004], ['bones', 0.003], ['stump', 0.006]],
      seuil: [['stones', 0.02], ['tallgrass', 0.03], ['bones', 0.004]],
      ravines: [['rock', 0.05], ['stones', 0.04], ['deadtree', 0.02], ['bush', 0.004], ['tallgrass', 0.05]],
      etang: [['reeds', 0.16, 'eau'], ['deadtree', 0.03], ['lilypad', 0.02, 'dans'], ['tallgrass', 0.04]],
      tertres: [['tallgrass', 0.22], ['tomb', 0.012], ['heather', 0.05], ['stones', 0.02]],
      degres: [['rock', 0.05], ['stones', 0.03], ['heather', 0.04], ['deadtree', 0.01], ['tallgrass', 0.04]],
      hauts: [['heather', 0.05], ['tallgrass', 0.06], ['rock', 0.02], ['pine', 0.006], ['deadtree', 0.01]],
      pic: [['rock', 0.05], ['stones', 0.04]],
      '': [['deadtree', 0.03], ['tallgrass', 0.06], ['rock', 0.02], ['stones', 0.02], ['heather', 0.02], ['stump', 0.006]],
    };
    const tab = [null].concat(regKeys).map((k) => (TABLE[k || ''] || TABLE['']).map(([id, p, cond]) => ({ ti: TY(id), p, eau: cond === 'eau', dans: cond === 'dans' })).filter((e) => e.ti !== undefined));
    const tot = tab.map((L) => L.reduce((a, e) => a + e.p, 0));
    // les sites des autres restent nus : un masque aux 8 m
    const nus = new Uint8Array(n * n);
    for (const id in V1_SITES) { const D = V1_SITES[id]; if (D.sous) continue; const cx0 = D.x * S, cz0 = D.z * S, R0 = D.r + 2; for (let j = Math.max(0, Math.floor((cz0 - R0) / C)); j <= Math.min(n - 1, Math.ceil((cz0 + R0) / C)); j++) for (let i = Math.max(0, Math.floor((cx0 - R0) / C)); i <= Math.min(n - 1, Math.ceil((cx0 + R0) / C)); i++) if (Math.hypot(i * C - cx0, j * C - cz0) < R0) nus[j * n + i] = 1; }
    const sp = 5;
    for (let z = sp / 2; z < S; z += sp) {
      for (let x = sp / 2; x < S; x += sp) {
        const px = x + (rnd() - 0.5) * sp * 0.9, pz = z + (rnd() - 0.5) * sp * 0.9;
        const cid = Math.min(n - 1, Math.round(pz / C)) * n + Math.min(n - 1, Math.round(px / C)), reg = REG[cid];
        let roll = rnd();
        if (roll >= tot[reg] || nus[cid]) continue;
        const L = tab[reg];
        let e = null;
        for (let q = 0; q < L.length; q++) { if (roll < L[q].p) { e = L[q]; break; } roll -= L[q].p; }
        if (!e) continue;
        const ii = Math.min(N - 1, Math.round(px / cell)), jj = Math.min(N - 1, Math.round(pz / cell)), k = jj * W + ii, h = H[k];
        if (e.eau ? !(h > WL - 0.6 && h < WL + 0.8) : e.dans ? !(h < WL - 0.3 && h > WL - 2) : h < WL + 0.3) continue;
        if (Math.abs(H[k + 1] - h) > 3.5 || Math.abs(H[k + W] - h) > 3.5) continue; // (pente > 0,7 sur 5 m)
        if (masque[Math.floor(pz / 4) * mW + Math.floor(px / 4)]) continue;
        const T = OBJ_TYPES[e.ti];
        const o = { t: e.ti, x: px, z: pz, h: T.h[0] + (T.h[1] - T.h[0]) * rnd(), f: rnd() < 0.5 ? 1 : 0, v: (rnd() * T.spr.length) | 0 };
        if (e.dans) o.y = WL;
        Z.objects.push(o);
      }
      if (Math.round(z) % 600 < sp) await tick('Derrière la Porte… le bois mort');
    }
    // des corbeaux, quelques nuées
    for (let k = 0; k < 18; k++) { const x = (0.12 + rnd() * 0.76) * S, z = (0.12 + rnd() * 0.76) * S; if (Z.heightAt(x, z) > WL + 1) Z.objects.push({ t: TY('crows'), x, z, h: 0.3, f: 0, v: 0 }); }
    t = lap('objets', t);

    // ------------------------------------------------------------- repères (savoir.connaitreLieu, cartes)
    for (const k of regKeys) { const R = V1_REGIONS[k]; B.landmark('zone_' + k, R.x * S, R.z * S, R.r * S * 0.7, { zone: true, name: R.nom }); }
    Z.spawn = { x: arrivee.x, y: arrivee.y, z: arrivee.z, yaw: 0 };
    Z.v1 = { arrivee, porte: { x: fP.x, y: fP.y, z: fP.z, r: 0 }, ponts, masque, mW, REG, regKeys, C, n, ruines: nRuines, genProps: 0 };
    // ------------------------------------------------------------- 4. les passes des autres (V2…V5)
    for (const P of zone.passes) {
      await tick('Derrière la Porte… ' + (P.nom || ''));
      const t1 = performance.now();
      try { P.fn(Z, zoneGen.outils(Z, B, P.nom)); } catch (e) { console.error('zone.passe ' + P.nom, e); }
      mes['passe ' + P.nom] = Math.round(performance.now() - t1);
    }
    Z.v1.genProps = Z.props.length;
    // ------------------------------------------------------------- 5. ce qu'on y a déjà pris, coupé, ouvert
    const SZ = zone.S(), CA = SZ.cartes;
    for (const k in CA.removed) { const o = Z.objects[+k]; if (!o) continue; o.gone = true; if (CA.removed[k] === 'stump') Z.objects.push({ t: OBJ_INDEX.stump, x: o.x, z: o.z, h: 0.8, f: 0, v: 0, fromStump: +k }); }
    for (const k in CA.forage) { const o = Z.objects[+k]; if (o) o.gone = true; }
    for (const k in CA.gone) { const q = Z.props[+k]; if (q) { q.gone = true; removePropCollider(Z, q); } }
    for (const k in CA.propData) { const q = Z.props[+k]; if (q) q.data = Object.assign({}, q.data || {}, CA.propData[k]); }
    Z.objectsDirty = true; Z.blocksDirty = true; Z.shadeDirty = true; Z.grid = null;
    mes.total = Math.round(performance.now() - T0);
    zone.mesures = Object.assign(zone.mesures || {}, { etapes: mes, objets: Z.objects.length, blocs: Z.blocks.length, props: Z.props.length, inter: Z.inter.length, ponts: ponts.length, ruines: nRuines });
    await tick('Derrière la Porte…');
    return Z;
  },

  // ------------------------------------------------------------- outils pour les passes (V2…V5)
  outils(Z, B0, nom) {
    const rnd = mulberry32(((Z.seed ^ hashString(String(nom || 'passe'))) >>> 0));
    const B = new Builder(Z, rnd, new Uint8Array(1));
    return {
      Z, B, rnd, S: Z.size, WL: Z.waterLevel,
      site: (id) => zone.site(id), sites: (agent) => zone.sites(agent), region: (x, z) => zone.region(x, z),
      hauteur: (x, z) => Z.heightAt(x, z),
      sol: (x, z, yRef) => (yRef === undefined ? Z.groundAt(x, z, Z.heightAt(x, z) + 0.6, 0.6) : Z.groundAt(x, z, yRef + 0.6, 0.9)),
      libre: (x, z, r, sauf) => zoneGen.libre(Z, x, z, r, sauf),
      surChemin: (x, z, r) => zoneGen.surChemin(Z.v1.masque, Z.v1.mW, x, z, r || 0),
      bloc: (x, y, z, sx, sy, sz, m, r, sh, o) => { const b = { x, y, z, sx, sy, sz, r: r || 0, m: m === undefined ? M_V1_PIERRE : m, sh: sh || 0 }; if (o) Object.assign(b, o); Z.blocks.push(b); return b; },
      prop: (id, x, y, z, r, data, s) => B.prop(id, x, y, z, r, data, s),
      inter: (kind, id, x, y, z, name, data) => B.inter(kind, id, x, y, z, name, data),
      objet: (id, x, z, h, extra) => B.obj(id, x, z, h, extra),
      aplanir: (x, z, r, y, fall) => { const f = fall || Math.max(6, r * 0.3); B.forVerts(x, z, r + f, (i, j, k, px, pz) => { const q = 1 - smoothstep(r, r + f, Math.hypot(px - x, pz - z)); if (q > 0) Z.heights[k] = lerp(Z.heights[k], y, q); }); },
      peindre: (x, z, r, m) => B.paintDisk(x, z, r, m),
      lieu: (cle, x, z, r, nomLieu, extra) => { LIEU_NAMES[cle] = LIEU_NAMES[cle] || nomLieu; return B.landmark(cle, x, z, r, Object.assign({ zone: true, name: nomLieu }, extra || {})); },
    };
  },
  // libre : sec, pas trop pentu, hors des chemins et des sites (sauf celui qu'on nomme), sans bloc ni objet posé tout près
  libre(Z, x, z, r, sauf) {
    if (!Z.inside(x, z, r + 4)) return false;
    const h = Z.heightAt(x, z);
    if (h < Z.waterLevel + 0.4) return false;
    for (let a = 0; a < 6; a++) { const hh = Z.heightAt(x + Math.cos(a) * r, z + Math.sin(a) * r); if (Math.abs(hh - h) > 1.2 + r * 0.25) return false; }
    if (this.surChemin(Z.v1.masque, Z.v1.mW, x, z, Math.ceil(r / 4))) return false;
    if (!this.horsSites(x, z, r, sauf)) return false;
    return !this.occupe(Z, x, z, r);
  },
  occupe(Z, x, z, r) {
    let o = false;
    Z.grid = null;
    for (const b of Z.blocks) if (!b.hidden && Math.abs(b.x - x) < r + Math.max(b.sx, b.sz) && Math.abs(b.z - z) < r + Math.max(b.sx, b.sz) && Math.hypot(b.x - x, b.z - z) < r + Math.hypot(b.sx, b.sz) / 2) { o = true; break; }
    if (!o) for (const q of Z.props) if (Math.abs(q.x - x) < r + 1 && Math.abs(q.z - z) < r + 1) { o = true; break; }
    return o;
  },
  surChemin(masque, mW, x, z, r) {
    const a0 = Math.floor(x / 4), b0 = Math.floor(z / 4);
    for (let b = b0 - r; b <= b0 + r; b++) for (let a = a0 - r; a <= a0 + r; a++) { if (a < 0 || b < 0 || a >= mW || b >= mW) continue; if (masque[b * mW + a]) return true; }
    return false;
  },
  horsSites(x, z, r, sauf) {
    const S = V1_ZONE_N * V1_ZONE_CELL;
    for (const id in V1_SITES) { if (id === sauf) continue; const D = V1_SITES[id]; if (D.sous) continue; if (Math.hypot(D.x * S - x, D.z * S - z) < D.r + r) return false; }
    return true;
  },

  // ------------------------------------------------------------- petites constructions
  // une ruine : quatre murs à moitié tombés, des brèches, parfois un reste d'étage
  ruine(B, f, w, d, rnd, Z) {
    const m = rnd() < 0.7 ? M_V1_PIERRE : M_MOSSY, ep = 0.6;
    // les murs suivent le sol : leur pied descend sous le terrain le plus bas
    let mn = 1e9;
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 0]]) { const [x, z] = B.toWorld(f, a * w / 2, b * d / 2); mn = Math.min(mn, Z.heightAt(x, z)); }
    const y0 = mn - f.y - 0.6;
    const cote = (lx, lz, len, alongX) => {
      let u = -len / 2;
      while (u < len / 2) {
        const seg = Math.min(len / 2 - u, 1.2 + rnd() * 3.2);
        const trou = rnd() < 0.22;
        if (!trou) {
          const hh = 0.6 + Math.pow(rnd(), 0.7) * 4.2, c = u + seg / 2;
          B.block(f, alongX ? lx + c : lx, y0, alongX ? lz : lz + c, alongX ? seg : ep, hh - y0, alongX ? ep : seg, m);
        }
        u += seg;
      }
    };
    cote(0, -d / 2, w, true); cote(0, d / 2, w, true); cote(-w / 2, 0, d - ep, false); cote(w / 2, 0, d - ep, false);
    // des pierres tombées au pied
    for (let k = 0; k < 3; k++) { const lx = (rnd() - 0.5) * (w + 3), lz = (rnd() - 0.5) * (d + 3), [x, z] = B.toWorld(f, lx, lz); B.block({ x, y: Z.heightAt(x, z) - 0.25, z, r: rnd() * TAU }, 0, 0, 0, 0.6 + rnd() * 0.6, 0.5 + rnd() * 0.4, 0.5 + rnd() * 0.5, m); }
  },
  // des murets autour d'une cour (w × d), avec deux passages
  murets(B, f, w, d, rnd, m) {
    const Z = B.w;
    const seg = (lx, lz, len, alongX) => {
      for (let u = -len / 2; u < len / 2; u += 3) {
        if (Math.abs(u) < 3 && rnd() < 0.9) continue; // le passage, au milieu
        if (rnd() < 0.18) continue;
        const [x, z] = B.toWorld(f, alongX ? lx + u + 1.5 : lx, alongX ? lz : lz + u + 1.5), y = Z.heightAt(x, z);
        B.block({ x, y: y - 0.6, z, r: f.r }, 0, 0, 0, alongX ? 3 : 0.7, 0.6 + 0.5 + rnd() * 1.4, alongX ? 0.7 : 3, m);
      }
    };
    seg(0, -d / 2, w, true); seg(-w / 2, 0, d, false); seg(w / 2, 0, d, false);
  },
  // une arche (brisée ou non) au-dessus d'un chemin
  arche(B, f, larg, haut, m, brisee) {
    const p = 1.4;
    for (const c of [-1, 1]) B.block(f, c * (larg / 2 + p / 2), -1, 0, p, haut + 1, p, m);
    if (!brisee) B.block(f, 0, haut, 0, larg + 2 * p, 1.4, p, m);
    else { B.block(f, -larg / 4 - p / 2, haut, 0, larg / 2 + p, 1.4, p, m); B.block({ x: f.x + 2.5, y: f.y - 0.3, z: f.z + 3, r: f.r + 0.6 }, 0, 0, 0, larg / 2, 1.3, p, m); }
  },
  // un pont de pierre et de bois au-dessus d'une ravine
  pont(B, p, Z) {
    const f = { x: p.x, y: p.y, z: p.z, r: p.r }, L = p.L, w = p.w;
    B.block(f, 0, -0.5, 0, w, 0.5, L, M_PLANKS);                        // le tablier (le long de z local)
    for (const c of [-1, 1]) B.block(f, c * (w / 2 + 0.15), 0, 0, 0.3, 1.0, L, M_V1_PIERRE); // les parapets
    // les piles, jusqu'au fond
    for (const lz of [-L / 2 + 1, -L / 6, L / 6, L / 2 - 1]) {
      const [x, z] = B.toWorld(f, 0, lz), fond = Z.heightAt(x, z);
      if (fond < p.y - 2) B.block({ x, y: fond - 1, z, r: p.r }, 0, 0, 0, w * 0.6, p.y - 0.5 - fond + 1, 1.6, M_V1_PIERRE);
    }
  },
};
