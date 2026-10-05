// ============================================================================
//  LES VOIX DE CHAQUE MILIEU (1) : les chants (agent S, douzième vague)
//  Des oiseaux qu'on entend sans les voir, chacun avec son vrai chant (rythme,
//  timbre, phrasé) : la grive qui redit chaque motif deux ou trois fois, le
//  rouge-gorge et ses cascades aiguës, le troglodyte et ses trilles, la
//  sittelle, la fauvette à tête noire, le ramier, les pouillots, la mésange
//  bleue, le bouvreuil ; dans les prés le bruant jaune, le proyer, la caille,
//  la linotte ; sur la lande l'alouette lulu et le tarier ; là-haut le merle à
//  plastron, le pipit, la buse et la crécerelle ; en ville les martinets, le
//  serin, le rougequeue ; à la ferme l'hirondelle et le coq d'à côté ; au bord
//  de l'eau le loriot et les rousserolles ; la nuit le rossignol, la chevêche,
//  le moyen-duc, le petit-duc. Et : un chien au loin, les cloches (l'angélus),
//  les sonnailles des troupeaux, un bourdon qui passe, une charrette.
//  Tout est calculé une fois (tampons de 22 050 Hz, quelques variantes), puis
//  rejoué : rien n'est recalculé pendant le jeu.
//  (Qui chante où et quand : 09-zzzzS-3-scene.js.)
// ============================================================================
{
  const S = SoundEngine.SYN, T = SoundEngine.TAMPONS;

  // ---------------------------------------------------------------- outils
  // un trait de chant : hauteur en points [[u, f], …] (u de 0 à 1 sur la durée), ou f, ou [f0, f1] ;
  // o : h (harmoniques [h2, h3…]), att / rel (part de la durée), vib / vd (vibrato : Hz, profondeur relative),
  //     am / amd (modulation d'amplitude : Hz, profondeur), souffle (part de bruit qui suit la note), lisse (glissés en cosinus)
  S.trait = function (d, sr, t0, dur, F, a, o) {
    o = o || {};
    const i0 = Math.floor(t0 * sr), n = Math.max(2, Math.floor(dur * sr)), lim = sr * 0.45, W = 2 * Math.PI / sr;
    const P = typeof F === 'number' ? [[0, F], [1, F]] : typeof F[0] === 'number' ? [[0, F[0]], [1, F[1]]] : F;
    const H = o.h || null, nh = H ? H.length : 0, att = o.att === undefined ? 0.15 : o.att, rel = o.rel === undefined ? 0.3 : o.rel;
    const vib = o.vib || 0, vd = o.vd || 0, am = o.am || 0, amd = o.amd || 0, sf = o.souffle || 0, li = !!o.lisse;
    let ph = Math.random() * 6.283, k = 0, y1 = 0, y2 = 0, r = 0, a1 = 0, a2 = 0, g = 0;
    // vibrato et modulation d'amplitude : des phaseurs qui tournent (pas de sinus à chaque échantillon)
    const v0 = Math.random() * 6.283, vwc = Math.cos(W * vib), vws = Math.sin(W * vib), awc = Math.cos(W * am), aws = Math.sin(W * am);
    let vc = Math.cos(v0), vs = Math.sin(v0), ac = 1, as = 0;
    for (let j = 0; j < n; j++) {
      const i = i0 + j;
      if (i >= d.length) break;
      const u = j / n;
      while (k < P.length - 2 && u > P[k + 1][0]) k++;
      const ua = P[k][0], ub = P[k + 1][0], fa = P[k][1], fb = P[k + 1][1];
      let v = ub > ua ? (u - ua) / (ub - ua) : 1;
      v = v < 0 ? 0 : v > 1 ? 1 : v;
      if (li) v = v * v * (3 - 2 * v);
      let f = fa + (fb - fa) * v;
      if (vib) { f *= 1 + vd * vs; const q = vc * vwc - vs * vws; vs = vs * vwc + vc * vws; vc = q; }
      if (f > lim) f = lim;
      ph += W * f;
      let e = u < att ? u / att : u > 1 - rel ? (1 - u) / rel : 1;
      e = e * e * (3 - 2 * e);
      if (am) { e *= 1 - amd + amd * (0.5 + 0.5 * as); const q = ac * awc - as * aws; as = as * awc + ac * aws; ac = q; }
      const s1 = Math.sin(ph);
      let y = s1;
      // harmoniques : sin((h+1)x) = 2 cos x · sin(hx) − sin((h−1)x)
      if (nh) { const c2 = 2 * Math.cos(ph); let sp = 0, sk = s1; for (let h = 0; h < nh; h++) { const sn = c2 * sk - sp; sp = sk; sk = sn; if (H[h] && (h + 2) * f < lim) y += H[h] * sn; } }
      if (sf) {
        // un souffle qui suit la note (résonateur à deux pôles accordé sur f, réaccordé tous les 32 échantillons)
        if ((j & 31) === 0) { r = Math.exp(-Math.PI * Math.max(80, f * 0.12) / sr); a1 = -2 * r * Math.cos(W * f); a2 = r * r; g = (1 - r) * 4; }
        const yy = g * (Math.random() * 2 - 1) - a1 * y1 - a2 * y2; y2 = y1; y1 = yy;
        y = y * (1 - sf) + yy * sf * 3;
      }
      if (i >= 0) d[i] += y * e * a;
    }
    return t0 + dur;
  };
  // une résonance amortie (bois, métal, cloche) : la même que SYN.mode, calculée par récurrence (bien plus rapide)
  S.modeR = function (d, sr, t0, f, tau, a) {
    if (f > sr * 0.45) return;
    const i0 = Math.floor(t0 * sr), w = 2 * Math.PI * f / sr, r = Math.exp(-1 / (tau * sr)), c = 2 * r * Math.cos(w), r2 = r * r, at = Math.max(2, Math.floor(sr * 0.0008)), ph = Math.random() * 0.4;
    // y(j) = a·rʲ·sin(ph + j·w) : y(j) = c·y(j−1) − r²·y(j−2)
    let y1 = a * Math.sin(ph), y2 = a * Math.sin(ph - w) / r, e = a;
    for (let i = i0, j = 0; i < d.length && e > 1e-5; i++, j++) {
      d[i] += y1 * (j < at ? j / at : 1);
      const y = c * y1 - r2 * y2; y2 = y1; y1 = y; e *= r;
    }
  };
  // un souffle de bruit filtré (attaque, tenue, relâche), avec modulation d'amplitude (râpe, grésillement)
  S.rape = function (d, sr, t0, dur, filt, a, o) {
    o = o || {};
    const i0 = Math.floor(t0 * sr), n = Math.max(2, Math.floor(dur * sr)), att = o.att === undefined ? 0.1 : o.att, rel = o.rel === undefined ? 0.4 : o.rel;
    const am = o.am || 0, amd = o.amd || 0, ph0 = Math.random() * 6.283, W = 2 * Math.PI * am / sr, wc = Math.cos(W), ws = Math.sin(W);
    let ac = Math.cos(ph0), as = Math.sin(ph0);
    for (let j = 0; j < n; j++) {
      const i = i0 + j;
      if (i >= d.length) break;
      const u = j / n;
      let e = u < att ? u / att : u > 1 - rel ? (1 - u) / rel : 1;
      e = e * e * (3 - 2 * e);
      if (am) { const s = 0.5 + 0.5 * as; e *= 1 - amd + amd * s * s; const q = ac * wc - as * ws; as = as * wc + ac * ws; ac = q; }
      d[i] += filt(Math.random() * 2 - 1) * e * a;
    }
    return t0 + dur;
  };
  // un petit choc sec (« tsak » du tarier, cailloux) : un éclat de bruit et deux résonances brèves
  S.clic = function (d, sr, t0, f, a) {
    S.bruit(d, sr, t0, 0.0004, 0.0025, a * 0.8, S.bq('bp', f * 1.4, 0.8, sr));
    S.modeR(d, sr, t0, f, 0.012, a * 0.5); S.modeR(d, sr, t0, f * 1.63, 0.007, a * 0.3);
  };
  const R = Math.random, ri = (a, b) => a + Math.floor(R() * (b - a + 1)), rf = (a, b) => a + R() * (b - a);

  // ================================================================ LA FORÊT, LE BOIS DE BOULEAUX
  // la grive musicienne : des motifs variés (sifflés, flûtés, piqués, râpeux), chacun redit deux à quatre fois
  const griveMotif = () => {
    const k = R(), s = rf(0.85, 1.2);
    if (k < 0.3) { // sifflé, deux ou trois notes : « tchou-li », « ti-tiou »
      const N = Array.from({ length: ri(2, 3) }, () => { const f = rf(2300, 4300) * s, g = rf(0.7, 1.4); return [rf(0.06, 0.13), [[0, f], [0.5, f * (0.5 + g / 2) * rf(0.95, 1.1)], [1, f * g]]]; });
      return { dur: N.reduce((x, [du]) => x + du + 0.025, 0), jouer: (d, sr, t) => { for (const [du, F] of N) { S.trait(d, sr, t, du, F, rf(0.6, 0.9), { h: [0.12], att: 0.15, rel: 0.35 }); t += du + 0.025; } } };
    }
    if (k < 0.5) { // flûté, une note longue qui monte et retombe
      const f = rf(2200, 3200) * s, du = rf(0.18, 0.3);
      return { dur: du, jouer: (d, sr, t) => S.trait(d, sr, t, du, [[0, f * 0.9], [0.35, f * 1.18], [1, f * 0.75]], 0.8, { h: [0.15, 0.04], att: 0.2, rel: 0.4, lisse: true, vib: 30, vd: 0.01 }) };
    }
    if (k < 0.75) { // piqué : « kitikiti »
      const fA = rf(3600, 5600) * s, fB = fA * rf(0.72, 0.9), n = ri(3, 6);
      return { dur: n * 0.052, jouer: (d, sr, t) => { for (let q = 0; q < n; q++) { const f = q % 2 ? fB : fA; S.trait(d, sr, t, 0.034, [f * 1.05, f * 0.88], 0.55, { att: 0.12, rel: 0.5 }); t += 0.052; } } };
    }
    if (k < 0.9) { // râpeux : « tchrr »
      const f = rf(2600, 3800) * s, du = rf(0.1, 0.16);
      return { dur: du, jouer: (d, sr, t) => S.trait(d, sr, t, du, [f * 1.1, f * 0.9], 0.55, { am: rf(90, 140), amd: 0.85, souffle: 0.45, att: 0.1, rel: 0.4 }) };
    }
    // aigu et bref, en deux temps : « ti-iu »
    const f = rf(4500, 6200), du = 0.05;
    return { dur: 0.15, jouer: (d, sr, t) => { S.trait(d, sr, t, du, [f, f * 1.1], 0.5, {}); S.trait(d, sr, t + 0.075, 0.07, [f * 0.8, f * 0.62], 0.6, { rel: 0.5 }); } };
  };
  T.s_grive = [5.4, (d, sr) => {
    let t = 0.04;
    for (let m = 0, nm = ri(2, 3); m < nm && t < 4.0; m++) {
      const M = griveMotif();
      for (let r = 0, nr = R() < 0.15 ? 5 : ri(2, 4); r < nr && t + M.dur < 5.2; r++) { M.jouer(d, sr, t); t += M.dur + rf(0.05, 0.11); }
      t += rf(0.3, 0.6);
    }
  }];
  // le rouge-gorge : une ou deux notes tenues très aiguës, puis une cascade rapide de petites notes glissées, liquides,
  // parfois un trille ; une phrase haute, la suivante plus basse
  T.s_rougegorge = [3.0, (d, sr, iv) => {
    const haut = iv % 2 === 0;
    let t = 0.03;
    for (let k = 0, n = ri(1, 2); k < n; k++) { const f = (haut ? 6400 : 5300) + rf(0, 900), du = rf(0.12, 0.24); S.trait(d, sr, t, du, [f, f * rf(0.88, 1.05)], 0.5, { att: 0.3, rel: 0.4 }); t += du + rf(0.03, 0.08); }
    let c = haut ? rf(4500, 5600) : rf(3300, 4300);
    for (let k = 0, n = ri(9, 16); k < n && t < 2.5; k++) {
      c = clamp(c * rf(0.82, 1.2), 2400, 7200);
      const du = rf(0.025, 0.075), f0 = c * rf(0.8, 1.25), f1 = c * rf(0.75, 1.25);
      S.trait(d, sr, t, du, [[0, f0], [0.5, (f0 + f1) / 2 * rf(0.85, 1.2)], [1, f1]], rf(0.45, 1), { att: 0.15, rel: 0.4, lisse: true });
      t += du + rf(0.008, 0.035);
    }
    if (R() < 0.5 && t < 2.6) { const f = rf(4000, 6500); for (let k = 0, n = ri(4, 8); k < n; k++) { S.trait(d, sr, t, 0.022, [f, f * 0.84], 0.45, { att: 0.2, rel: 0.5 }); t += 0.031; } }
  }];
  // le troglodyte : très fort pour sa taille ; des notes claires, vives, puis un trille roulé, et encore
  T.s_troglodyte = [5.0, (d, sr) => {
    let t = 0.03;
    const fin = rf(3.6, 4.6);
    while (t < fin) {
      const f = rf(4300, 7000), g = R() < 0.5 ? 1.22 : 0.8;
      for (let k = 0, n = ri(3, 7); k < n; k++) { S.trait(d, sr, t, rf(0.03, 0.05), [f * rf(0.95, 1.05), f * g], 0.65, { att: 0.1, rel: 0.5 }); t += rf(0.06, 0.08); }
      const ft = rf(3700, 6200), per = rf(0.021, 0.028);
      for (let k = 0, n = ri(12, 26); k < n; k++) { const fa = k % 2 ? ft : ft * 1.16; S.trait(d, sr, t, per * 0.8, [fa, fa * 0.9], 0.55, { att: 0.2, rel: 0.5 }); t += per; }
      t += rf(0.02, 0.06);
    }
    const f = rf(6000, 7600); S.trait(d, sr, t, 0.05, [f * 0.9, f], 0.5, {});
  }];
  // la sittelle torchepot : des sifflements forts, répétés (« tui-tui-tui », un trille rapide, ou « piou… piou… »)
  T.s_sittelle = [2.2, (d, sr, iv) => {
    let t = 0.03;
    const k = iv % 3, s = rf(0.9, 1.12);
    if (k === 0) for (let q = 0, n = ri(7, 11); q < n; q++) { S.trait(d, sr, t, 0.07, [[0, 1750 * s], [1, 2900 * s]], 0.7, { h: [0.1], att: 0.15, rel: 0.3 }); t += rf(0.12, 0.14); }
    else if (k === 1) for (let q = 0, n = ri(16, 26); q < n; q++) { S.trait(d, sr, t, 0.04, [3300 * s, 2700 * s], 0.6, { h: [0.08], att: 0.2, rel: 0.4 }); t += 0.062; }
    else for (let q = 0, n = ri(4, 6); q < n; q++) { S.trait(d, sr, t, 0.16, [[0, 2600 * s], [0.25, 2700 * s], [1, 1700 * s]], 0.75, { h: [0.12], att: 0.1, rel: 0.4, lisse: true }); t += rf(0.32, 0.38); }
  }];
  // la fauvette à tête noire : un babil rapide et doux, puis des notes flûtées, fortes et claires, qui descendent
  T.s_fauvette = [3.6, (d, sr) => {
    let t = 0.03;
    for (let k = 0, n = ri(10, 18); k < n; k++) { const f = rf(2400, 5200), du = rf(0.025, 0.05); S.trait(d, sr, t, du, [f, f * rf(0.75, 1.3)], rf(0.15, 0.35), { att: 0.2, rel: 0.4, souffle: R() < 0.3 ? 0.3 : 0 }); t += du + rf(0.01, 0.03); }
    t += rf(0.02, 0.06);
    let f = rf(3000, 3900);
    for (let k = 0, n = ri(4, 7); k < n; k++) {
      const du = rf(0.08, 0.16), f0 = f, f1 = f * rf(0.85, 1.15);
      S.trait(d, sr, t, du, [[0, f0 * 0.92], [0.4, (f0 + f1) / 2 * 1.08], [1, f1 * 0.9]], rf(0.75, 1), { h: [0.16, 0.04], att: 0.15, rel: 0.35, lisse: true });
      t += du + rf(0.015, 0.04);
      f = clamp(f * rf(0.82, 1.08), 1800, 4200);
    }
  }];
  // le pigeon ramier : « hou-HOUU-hou, hou-hou », grave, enroué
  T.s_ramier = [2.4, (d, sr) => {
    const f = rf(430, 520);
    let t = 0.04;
    const coo = (du, F, a) => { S.trait(d, sr, t, du, F, a, { h: [0.35, 0.12, 0.05], att: 0.25, rel: 0.45, lisse: true, souffle: 0.18 }); t += du; };
    coo(0.2, [[0, f * 0.93], [0.6, f], [1, f * 0.95]], 0.55); t += 0.06;
    coo(0.5, [[0, f * 0.95], [0.3, f * 1.12], [1, f * 0.97]], 1); t += 0.05;
    coo(0.24, [[0, f], [1, f * 0.93]], 0.6); t += rf(0.28, 0.34);
    coo(0.2, [[0, f * 0.95], [0.5, f * 1.03], [1, f * 0.94]], 0.6); t += 0.07;
    coo(0.24, [[0, f * 0.96], [0.5, f * 1.02], [1, f * 0.9]], 0.55);
  }];
  // le pouillot fitis : une cadence douce qui descend, de l'aigu au médium, et finit en tournant
  T.s_fitis = [3.0, (d, sr) => {
    let t = 0.03, f = rf(5000, 5800);
    const n = ri(12, 18);
    for (let k = 0; k < n; k++) {
      const u = k / n, a = clamp(0.3 + u * 1.6, 0, 1) * (1 - 0.25 * u);
      S.trait(d, sr, t, rf(0.065, 0.085), [[0, f * 1.04], [0.2, f * 1.1], [1, f * 0.8]], a, { att: 0.12, rel: 0.4, lisse: true });
      t += rf(0.11, 0.135);
      if (k % 2) f *= rf(0.93, 0.975);
    }
    S.trait(d, sr, t, 0.11, [[0, f * 0.9], [0.5, f * 1.15], [1, f * 0.95]], 0.7, { lisse: true });
  }];
  // le pouillot véloce : « tchif-tchaf-tchif-tchif-tchaf », deux notes qui alternent sans ordre
  T.s_veloce = [3.6, (d, sr) => {
    const fH = rf(5700, 6300), fL = rf(4300, 4800);
    let t = 0.04;
    if (R() < 0.3) for (let k = 0; k < 2; k++) { S.trait(d, sr, t, 0.05, [3200, 3000], 0.2, { am: 60, amd: 0.7 }); t += 0.14; }
    for (let k = 0, n = ri(6, 11); k < n; k++) {
      const h = R() < 0.55;
      S.trait(d, sr, t, 0.075, h ? [[0, fH * 1.08], [1, fH * 0.8]] : [[0, fL * 1.15], [1, fL * 0.86]], h ? 0.7 : 0.6, { att: 0.08, rel: 0.5 });
      t += rf(0.26, 0.34);
    }
  }];
  // la mésange bleue : deux ou trois notes très aiguës, puis un trille qui roule plus bas
  T.s_mesbleue = [1.6, (d, sr) => {
    let t = 0.03;
    for (let k = 0, n = ri(2, 3); k < n; k++) { const f = rf(7000, 8000); S.trait(d, sr, t, 0.07, [f, f * 0.94], 0.5, { att: 0.2, rel: 0.4 }); t += rf(0.11, 0.14); }
    const f = rf(4500, 5400);
    for (let k = 0, n = ri(10, 16); k < n; k++) { S.trait(d, sr, t, 0.038, [f * 1.04, f * 0.9], 0.55, { att: 0.15, rel: 0.5 }); t += 0.05; }
  }];
  // le bouvreuil : un « piou » doux et triste, un ou deux ; parfois un petit chant grinçant, à mi-voix
  T.s_bouvreuil = [1.6, (d, sr, iv) => {
    let t = 0.04;
    if (iv % 3 === 2) {
      for (let k = 0, n = ri(5, 8); k < n; k++) { const f = rf(1500, 2600); S.trait(d, sr, t, rf(0.06, 0.12), [f, f * rf(0.8, 1.15)], rf(0.3, 0.6), { am: R() < 0.4 ? 70 : 0, amd: 0.5, h: [0.2] }); t += rf(0.1, 0.16); }
      return;
    }
    for (let k = 0, n = iv % 3 === 0 ? 1 : 2; k < n; k++) { const f = rf(1850, 2100); S.trait(d, sr, t, rf(0.16, 0.2), [[0, f], [0.3, f * 1.03], [1, f * 0.78]], 0.8, { h: [0.08], att: 0.2, rel: 0.45, lisse: true }); t += rf(0.6, 0.8); }
  }];

  // ================================================================ LES PRÉS, LA LANDE
  // le bruant jaune : « ti-ti-ti-ti-ti-ti-tîîî… tuuu »
  T.s_bruant = [2.4, (d, sr) => {
    const f = rf(5200, 6200);
    let t = 0.04;
    for (let k = 0, n = ri(7, 11); k < n; k++) { S.trait(d, sr, t, 0.055, [[0, f * 1.06], [0.5, f], [1, f * 0.94]], 0.55, { am: 170, amd: 0.35, att: 0.15, rel: 0.4 }); t += rf(0.105, 0.12); }
    t += 0.02;
    const fl = f * rf(0.92, 1.05);
    S.trait(d, sr, t, rf(0.38, 0.55), [fl, fl * 0.97], 0.7, { am: 150, amd: 0.25, att: 0.08, rel: 0.25 });
    if (R() < 0.6) { t += 0.5; S.trait(d, sr, t, rf(0.3, 0.42), [f * 0.72, f * 0.68], 0.55, { am: 140, amd: 0.25, att: 0.1, rel: 0.3 }); }
  }];
  // le bruant proyer : quelques notes piquées, puis un cliquetis sec et rapide « comme un trousseau de clés »
  T.s_proyer = [1.9, (d, sr) => {
    let t = 0.04, per = 0.13;
    for (let k = 0, n = ri(2, 4); k < n; k++) { S.clic(d, sr, t, rf(4200, 5200), 0.5); S.trait(d, sr, t, 0.02, [5200, 4600], 0.35, {}); t += per; per *= 0.8; }
    const fin = t + rf(0.8, 1.1);
    while (t < fin) {
      const f = rf(2800, 7000), a = rf(0.25, 0.6) * (1 - 0.4 * (t - fin + 1));
      S.modeR(d, sr, t, f, rf(0.008, 0.016), a); S.modeR(d, sr, t, f * rf(1.31, 1.47), 0.007, a * 0.5); S.bruit(d, sr, t, 0.0004, 0.002, a * 0.4, S.bq('bp', f, 1, sr));
      t += rf(0.022, 0.04);
    }
  }];
  // la caille : « pwit, pwit-wit » (paye-tes-dettes), liquide, comme lancé de partout ; parfois précédé d'un « wa-wa » sourd
  T.s_caille = [0.95, (d, sr, iv) => {
    let t = 0.03;
    if (iv % 3 === 2) { for (let k = 0; k < 2; k++) { S.trait(d, sr, t, 0.09, [900, 850], 0.12, { h: [0.4, 0.2], am: 40, amd: 0.4 }); t += 0.14; } t += 0.05; }
    const f = rf(2350, 2700), note = (du, a) => { S.trait(d, sr, t, du, [[0, f * 0.82], [0.35, f * 1.32], [1, f * 1.08]], a, { h: [0.32, 0.08], att: 0.12, rel: 0.4, lisse: true }); t += du; };
    note(0.105, 1); t += 0.15;
    note(0.07, 0.8); t += 0.075;
    note(0.075, 0.85);
  }];
  // la linotte : un gazouillis vif et varié, des notes doublées, un « tsouî » nasillard çà et là
  T.s_linotte = [3.0, (d, sr) => {
    let t = 0.03;
    const fin = rf(2.2, 2.8);
    while (t < fin) {
      if (R() < 0.12) { const f = rf(2500, 3400); S.trait(d, sr, t, 0.16, [[0, f], [1, f * 1.3]], 0.6, { am: 85, amd: 0.6, h: [0.25] }); t += 0.2; continue; }
      const f = rf(2600, 5600), du = rf(0.025, 0.055), g = rf(0.75, 1.3), r = R() < 0.4 ? 2 : 1;
      for (let q = 0; q < r; q++) { S.trait(d, sr, t, du, [f, f * g], rf(0.4, 0.8), { att: 0.15, rel: 0.4 }); t += du + rf(0.015, 0.035); }
    }
  }];
  // l'alouette lulu : des notes flûtées, liquides, en série qui s'accélère puis retombe, et descend (« lu-lu-lu-lu… »)
  T.s_lulu = [3.2, (d, sr, iv) => {
    let t = 0.04, f = rf(3100, 3800);
    const n = ri(9, 18), dbl = iv % 3 === 1, desc = rf(0.965, 0.985);
    for (let k = 0; k < n && t < 2.9; k++) {
      const u = k / n, per = 0.17 - 0.09 * Math.sin(Math.PI * Math.min(1, u * 1.3)), a = 0.5 + 0.5 * Math.sin(Math.PI * Math.min(1, u * 1.2));
      if (dbl) { S.trait(d, sr, t, 0.045, [f * 0.9, f * 1.1], a * 0.8, { h: [0.08], lisse: true }); S.trait(d, sr, t + 0.055, 0.06, [[0, f * 1.12], [1, f * 0.88]], a, { h: [0.08], lisse: true }); }
      else S.trait(d, sr, t, 0.075, [[0, f * 0.95], [0.3, f * 1.08], [1, f * 0.86]], a, { h: [0.1], att: 0.2, rel: 0.4, lisse: true, vib: 40, vd: 0.008 });
      t += per + (dbl ? 0.05 : 0);
      f *= desc;
    }
  }];
  // le tarier pâtre : « huit, tsak-tsak » (deux cailloux qu'on cogne) ; ou une courte strophe grinçante
  T.s_tarier = [1.4, (d, sr, iv) => {
    let t = 0.04;
    if (iv % 3 === 2) {
      for (let k = 0, n = ri(7, 11); k < n; k++) { const f = rf(2600, 6000), du = rf(0.03, 0.07); S.trait(d, sr, t, du, [f, f * rf(0.7, 1.3)], rf(0.4, 0.8), { am: R() < 0.3 ? 110 : 0, amd: 0.6, att: 0.15, rel: 0.4 }); t += du + rf(0.01, 0.03); }
      return;
    }
    S.trait(d, sr, t, 0.12, [[0, 2500], [1, 3600]], 0.55, { att: 0.2, rel: 0.3 });
    t += 0.24;
    for (let k = 0, n = ri(2, 3); k < n; k++) { S.clic(d, sr, t, rf(3800, 4600), 0.9); t += rf(0.12, 0.15); }
  }];

  // ================================================================ LES HAUTEURS
  // le merle à plastron : deux à quatre notes tristes, redites (« tchu-tchu-tchu »), et parfois un « tac-tac » dur
  T.s_plastron = [1.8, (d, sr, iv) => {
    let t = 0.04;
    const f = rf(2700, 3300), n = ri(2, 4);
    for (let k = 0; k < n; k++) { S.trait(d, sr, t, 0.15, [[0, f * 1.05], [0.3, f * 1.1], [1, f * 0.82]], 0.75, { h: [0.12], att: 0.15, rel: 0.4, lisse: true, vib: 25, vd: 0.01 }); t += rf(0.26, 0.3); }
    if (iv % 2) { t += 0.15; for (let k = 0; k < 3; k++) { S.clic(d, sr, t, rf(2500, 3000), 0.6); t += 0.1; } }
  }];
  // le pipit spioncelle : il monte en chantant « tsip-tsip-tsip » de plus en plus vite, et redescend en parachute, « tsiou-tsiou »
  T.s_spioncelle = [3.6, (d, sr) => {
    let t = 0.04, per = 0.22;
    for (let k = 0, n = ri(8, 12); k < n; k++) { const f = rf(5200, 6200); S.trait(d, sr, t, 0.04, [f * 0.9, f * 1.05], 0.45 + k * 0.04, { att: 0.15, rel: 0.4 }); t += per; per = Math.max(0.075, per * 0.86); }
    const ft = rf(4400, 5000);
    for (let k = 0; k < 10; k++) { S.trait(d, sr, t, 0.03, [ft * 1.05, ft * 0.92], 0.6, {}); t += 0.04; }
    t += 0.08;
    let f = rf(4400, 4900);
    for (let k = 0, n = ri(5, 7); k < n; k++) { S.trait(d, sr, t, 0.09, [[0, f * 1.1], [1, f * 0.8]], 0.7, { att: 0.12, rel: 0.4 }); t += 0.16; f *= 0.95; }
  }];
  // la buse variable : un miaulement plaintif qui descend, « piiiiéou », un peu rauque, très haut dans le ciel
  T.s_buse = [2.6, (d, sr, iv) => {
    let t = 0.05;
    for (let k = 0, n = iv % 3 === 2 ? 2 : 1; k < n; k++) {
      const f = rf(2000, 2300), du = rf(0.85, 1.15);
      S.trait(d, sr, t, du, [[0, f * 0.92], [0.12, f * 1.1], [0.35, f * 1.02], [1, f * 0.62]], 0.8, { h: [0.35, 0.15, 0.05], att: 0.08, rel: 0.35, souffle: 0.18, vib: 9, vd: 0.012, lisse: true });
      t += du + rf(0.35, 0.5);
    }
  }];
  // le faucon crécerelle : « kli-kli-kli-kli-kli », vif et perçant
  T.s_crecerelle = [1.7, (d, sr) => {
    let t = 0.04;
    const f = rf(2800, 3300);
    for (let k = 0, n = ri(6, 11); k < n; k++) { S.trait(d, sr, t, 0.075, [[0, f * 0.96], [0.3, f * 1.05], [1, f * 0.9]], 0.7 + 0.3 * Math.sin(Math.PI * k / n), { h: [0.35, 0.1], att: 0.08, rel: 0.4 }); t += rf(0.11, 0.125); }
  }];

  // ================================================================ LA VILLE, LA FERME
  // le rougequeue noir : une phrase sifflée et piquée, un silence, puis un grésillement sec (du verre qu'on froisse),
  // et quelques notes encore
  T.s_rougequeue = [2.8, (d, sr) => {
    let t = 0.04;
    S.trait(d, sr, t, 0.16, [[0, 3100], [0.5, 3600], [1, 3300]], 0.7, { lisse: true }); t += 0.2;
    const f = rf(3800, 4600);
    for (let k = 0, n = ri(4, 7); k < n; k++) { S.trait(d, sr, t, 0.035, [f, f * 0.85], 0.55, {}); t += 0.055; }
    t += rf(0.45, 0.8);
    const bp = S.bq('bp', rf(4200, 5500), 0.7, sr), du = rf(0.3, 0.45);
    for (let q = 0, n = Math.floor(du * 260); q < n; q++) S.bruit(d, sr, t + R() * du, 0.0003, rf(0.001, 0.003), rf(0.15, 0.6), bp);
    t += du + 0.08;
    for (let k = 0, n = ri(2, 4); k < n; k++) { const g = rf(2800, 4200); S.trait(d, sr, t, 0.06, [g, g * rf(0.85, 1.15)], 0.55, {}); t += 0.09; }
  }];
  // les martinets : une bande qui passe en criant, « srîîîî », plusieurs voix qui se croisent ; la hauteur baisse en
  // passant (l'effet Doppler), le son monte puis s'éloigne
  T.s_martinet = [3.6, (d, sr) => {
    const n = ri(3, 6), D = 3.4;
    for (let k = 0; k < n; k++) {
      const t0 = rf(0.05, 1.9), du = rf(0.4, 0.9), f = rf(4300, 6200), u0 = t0 / D, u1 = (t0 + du) / D;
      const dop = (u) => 1.05 - 0.1 * u, env = (u) => Math.exp(-Math.pow((u - 0.45) / 0.28, 2));
      S.trait(d, sr, t0, du, [[0, f * dop(u0) * 0.96], [0.3, f * dop((u0 + u1) / 2) * 1.04], [1, f * dop(u1) * 0.93]], 0.35 + 0.65 * env((u0 + u1) / 2), { am: rf(28, 42), amd: 0.75, h: [0.12], att: 0.12, rel: 0.3, souffle: 0.25 });
    }
  }];
  // le serin cini : un grésillement aigu, très rapide, comme des éclats de verre qui tintent
  T.s_serin = [2.6, (d, sr) => {
    let t = 0.04, f = rf(4500, 6000);
    const fin = rf(1.6, 2.3);
    while (t < fin) { f = clamp(f * rf(0.85, 1.18), 3600, 8200); const du = rf(0.014, 0.026); S.trait(d, sr, t, du, [f, f * rf(0.8, 1.25)], rf(0.4, 0.85), { att: 0.2, rel: 0.4 }); t += du + rf(0.004, 0.014); }
  }];
  // l'hirondelle rustique : un gazouillis vif et liquide, puis un petit roulement sec « zrrrr-it »
  T.s_hirondelle = [3.6, (d, sr) => {
    let t = 0.04;
    const fin = rf(2.2, 2.8);
    while (t < fin) { const f = rf(2200, 6000), du = rf(0.03, 0.08); S.trait(d, sr, t, du, [[0, f], [0.5, f * rf(0.8, 1.3)], [1, f * rf(0.7, 1.2)]], rf(0.35, 0.8), { att: 0.15, rel: 0.4, lisse: true }); t += du + rf(0.02, 0.06); }
    t += 0.05;
    const f = rf(3200, 4000);
    S.trait(d, sr, t, rf(0.35, 0.5), [f, f * 0.95], 0.7, { am: rf(55, 75), amd: 0.9, souffle: 0.35, h: [0.15] }); t += 0.55;
    S.trait(d, sr, t, 0.04, [6000, 6800], 0.5, {});
  }];
  // le coq d'une ferme voisine : « co-co-ri-cooo », rauque, au loin
  T.s_coq = [2.3, (d, sr) => {
    const f = rf(470, 560), Fo = [[900, 0.9], [1700, 1], [2700, 0.5]];
    const syl = (t, du, F, a, rug) => {
      // un son voisé : harmoniques pondérées par trois formants (comme une gorge), rugosité, souffle
      const H = [];
      for (let h = 2; h <= 9; h++) { let g = 0; for (const [fc, w] of Fo) g += w * Math.exp(-Math.pow((h * f - fc) / 450, 2)); H.push(0.15 + g); }
      S.trait(d, sr, t, du, F, a, { h: H, am: rug, amd: 0.45, souffle: 0.12, att: 0.12, rel: 0.25, lisse: true });
    };
    let t = 0.04;
    syl(t, 0.12, [[0, f * 0.95], [1, f * 1.05]], 0.5, 60); t += 0.2;
    syl(t, 0.11, [[0, f * 1.02], [1, f * 1.1]], 0.55, 60); t += 0.18;
    syl(t, 0.16, [[0, f * 1.2], [1, f * 1.32]], 0.7, 55); t += 0.22;
    syl(t, rf(0.85, 1.1), [[0, f * 1.3], [0.2, f * 1.42], [0.7, f * 1.3], [1, f * 0.95]], 0.9, 48);
  }];
  // un chien au loin : « ouah… ouah ouah »
  T.s_chien = [2.6, (d, sr) => {
    let t = 0.05;
    const f = rf(330, 480);
    for (let k = 0, n = ri(2, 5); k < n && t < 2.2; k++) {
      const du = rf(0.12, 0.2);
      S.trait(d, sr, t, du, [[0, f * 1.05], [0.3, f * 1.25], [1, f * 0.75]], 0.9, { h: [0.8, 0.6, 0.5, 0.35, 0.25, 0.15], souffle: 0.3, att: 0.06, rel: 0.5 });
      t += du + (R() < 0.4 ? rf(0.12, 0.2) : rf(0.4, 0.8));
    }
    S.lp1(d, sr, 2600);
  }];

  // ================================================================ AU BORD DE L'EAU
  // le loriot : une phrase flûtée, ronde, liée, comme un yodel (« didl-io »)
  T.s_loriot = [1.3, (d, sr) => {
    const P = [], n = ri(3, 5);
    let f = rf(1350, 1700), u = 0;
    for (let k = 0; k < n; k++) { P.push([u, f]); u += rf(0.12, 0.25); P.push([u, f * rf(0.97, 1.03)]); u += rf(0.04, 0.08); f = clamp(f * (R() < 0.5 ? rf(1.15, 1.4) : rf(0.72, 0.88)), 1150, 2500); }
    P.push([u + 0.15, f * 0.88]);
    const D = u + 0.15;
    S.trait(d, sr, 0.04, D * 0.95, P.map(([q, g]) => [q / D, g]), 0.9, { h: [0.32, 0.12, 0.04], att: 0.08, rel: 0.2, lisse: true, vib: 7, vd: 0.006 });
  }];
  // la rousserolle turdoïde : des éléments rauques, forts, redits deux ou trois fois (« karra-karra-kiet-kiet-gurk »)
  T.s_turdoide = [3.4, (d, sr) => {
    let t = 0.04;
    const el = [
      () => { const f = rf(1500, 2200); S.trait(d, sr, t, 0.15, [f, f * 0.9], 0.8, { am: rf(60, 85), amd: 0.9, souffle: 0.35, h: [0.4, 0.2] }); return 0.15; },
      () => { const f = rf(2600, 3200); S.trait(d, sr, t, 0.08, [f, f * 1.45], 0.7, { h: [0.25] }); return 0.08; },
      () => { const f = rf(1000, 1400); S.trait(d, sr, t, 0.12, [f, f * 0.85], 0.8, { am: 70, amd: 0.8, souffle: 0.4, h: [0.5, 0.3] }); return 0.12; },
    ];
    while (t < 2.8) { const e = el[(R() * el.length) | 0]; for (let r = 0, n = ri(2, 3); r < n && t < 3.0; r++) t += e() + rf(0.05, 0.09); t += rf(0.05, 0.15); }
  }];
  // la rousserolle effarvatte : un bavardage régulier, à mi-voix, chaque élément redit deux à quatre fois
  T.s_effarvatte = [5.0, (d, sr) => {
    let t = 0.04;
    const el = [
      () => { const f = rf(2800, 3800); S.trait(d, sr, t, 0.07, [f, f * 0.92], 0.6, { am: rf(100, 140), amd: 0.8, souffle: 0.3 }); return 0.07; },
      () => { const f = rf(3800, 5000); S.trait(d, sr, t, 0.03, [f, f * 1.2], 0.5, {}); S.trait(d, sr, t + 0.04, 0.03, [f * 1.1, f * 0.85], 0.5, {}); return 0.075; },
      () => { S.clic(d, sr, t, rf(2600, 3400), 0.6); S.trait(d, sr, t + 0.005, 0.04, [3000, 2600], 0.3, { souffle: 0.5 }); return 0.05; },
      () => { const f = rf(2200, 3000); S.trait(d, sr, t, 0.06, [f * 0.9, f * 1.15], 0.55, { h: [0.2] }); return 0.06; },
    ];
    while (t < 4.5) { const e = el[(R() * el.length) | 0]; for (let r = 0, n = ri(2, 4); r < n && t < 4.8; r++) t += e() + rf(0.05, 0.08); }
  }];
  // le bruant des roseaux : « tsip, tsip, tsip, tissik », bref et hésitant
  T.s_bruantroseaux = [1.4, (d, sr) => {
    let t = 0.04;
    for (let k = 0, n = ri(3, 5); k < n; k++) { const f = rf(3800, 5200); S.trait(d, sr, t, 0.07, [f * 1.05, f * 0.85], 0.6, { att: 0.12, rel: 0.4 }); t += rf(0.2, 0.3); }
    const f = rf(4800, 5600);
    S.trait(d, sr, t, 0.035, [f, f * 0.9], 0.55, {}); S.trait(d, sr, t + 0.05, 0.05, [f * 0.8, f * 1.05], 0.6, {});
  }];

  // ================================================================ LA NUIT
  // le rossignol : des phrases toutes différentes — sifflements purs qui enflent (« piou… piou… piou »), coups
  // rapides (« tchouk-tchouk »), trilles, notes liquides, un roulement final ; de longs silences entre elles
  const ross = [
    (d, sr) => { let t = 0.04; const f = rf(1650, 2150), n = ri(5, 8); for (let k = 0; k < n; k++) { S.trait(d, sr, t, rf(0.16, 0.22), [[0, f * 0.97], [0.5, f * 1.03], [1, f]], 0.2 + 0.8 * k / (n - 1), { h: [0.05], att: 0.25, rel: 0.35, lisse: true }); t += rf(0.27, 0.31); } const g = rf(2600, 3200); for (let k = 0; k < 4; k++) { S.clic(d, sr, t, g, 0.7); t += 0.07; } },
    (d, sr) => { let t = 0.04; const f = rf(1200, 1800); for (let k = 0, n = ri(9, 15); k < n; k++) { S.trait(d, sr, t, 0.03, [f * 1.3, f], 0.8, { h: [0.4, 0.2], att: 0.05, rel: 0.6, souffle: 0.2 }); S.clic(d, sr, t, f * 2.1, 0.25); t += rf(0.085, 0.095); } },
    (d, sr) => { let t = 0.04; S.trait(d, sr, t, 0.2, [2200, 2400], 0.4, { att: 0.3 }); t += 0.28; const a = rf(3000, 3600), b = a * rf(1.3, 1.5); for (let k = 0, n = ri(18, 30); k < n; k++) { const f = k % 2 ? b : a; S.trait(d, sr, t, 0.03, [f, f * 0.92], 0.75, { att: 0.15, rel: 0.4 }); t += 0.04; } },
    (d, sr) => { let t = 0.04, c = rf(2600, 3600); for (let k = 0, n = ri(8, 13); k < n; k++) { c = clamp(c * rf(0.8, 1.2), 1600, 5000); const du = rf(0.04, 0.1); S.trait(d, sr, t, du, [[0, c * rf(0.8, 1.2)], [0.5, c], [1, c * rf(0.75, 1.25)]], rf(0.5, 1), { h: [0.22, 0.06], att: 0.12, rel: 0.4, lisse: true }); t += du + rf(0.02, 0.05); } S.trait(d, sr, t, 0.3, [2500, 2300], 0.7, { am: 55, amd: 0.85, souffle: 0.3, h: [0.2] }); },
    (d, sr) => { let t = 0.04; S.trait(d, sr, t, 0.55, [[0, 1500], [1, 2900]], 0.8, { h: [0.06], att: 0.3, rel: 0.15, lisse: true }); t += 0.6; S.trait(d, sr, t, 0.4, [2600, 2400], 0.75, { am: 48, amd: 0.9, souffle: 0.25, h: [0.25] }); },
    (d, sr) => { let t = 0.04; const f = rf(1000, 1350); for (let k = 0, n = ri(6, 10); k < n; k++) { S.trait(d, sr, t, 0.07, [[0, f * 0.9], [0.4, f * 1.1], [1, f * 0.85]], 0.85, { h: [0.6, 0.35, 0.15], att: 0.1, rel: 0.4, souffle: 0.1 }); t += 0.125; } },
    (d, sr) => { let t = 0.04; for (let k = 0; k < 4; k++) { const f = rf(5600, 6400); S.trait(d, sr, t, 0.06, [f, f * 0.95], 0.5, {}); t += 0.15; } let f = rf(4200, 4800); for (let k = 0; k < 14; k++) { S.trait(d, sr, t, 0.03, [f * 1.05, f * 0.9], 0.7, {}); t += 0.045; f *= 0.97; } },
    (d, sr) => { let t = 0.04; S.trait(d, sr, t, 0.12, [1800, 1900], 0.3, { att: 0.4 }); t += 0.3; let f = rf(2800, 3200); for (let k = 0, n = ri(4, 6); k < n; k++) { S.trait(d, sr, t, 0.17, [[0, f], [1, f * 0.62]], 0.45 + k * 0.12, { h: [0.1], att: 0.1, rel: 0.4, lisse: true }); t += 0.3; f *= 0.98; } },
  ];
  T.s_rossignol = [3.3, (d, sr, iv) => ross[iv % ross.length](d, sr)];
  // la chevêche d'Athéna : « kiou », plaintif et nasillard ; ou son chant, « gouuu-ek », qui monte
  T.s_cheveche = [1.0, (d, sr, iv) => {
    if (iv % 3 === 2) { const f = rf(640, 720); S.trait(d, sr, 0.04, 0.55, [[0, f], [0.85, f * 1.35], [1, f * 1.5]], 0.8, { h: [0.25, 0.1], att: 0.2, rel: 0.08, lisse: true, souffle: 0.08 }); return; }
    const f = rf(1350, 1500);
    S.trait(d, sr, 0.04, rf(0.28, 0.36), [[0, f * 0.92], [0.3, f * 1.2], [1, f * 0.85]], 0.85, { h: [0.55, 0.28, 0.1], att: 0.12, rel: 0.4, lisse: true, souffle: 0.12 });
  }];
  // le hibou moyen-duc : un « hou » grave et doux, régulier, toutes les deux ou trois secondes
  T.s_moyenduc = [0.7, (d, sr) => {
    const f = rf(330, 380);
    S.trait(d, sr, 0.04, rf(0.32, 0.4), [[0, f * 0.95], [0.4, f * 1.04], [1, f * 0.97]], 0.9, { h: [0.12, 0.03], att: 0.3, rel: 0.45, lisse: true, souffle: 0.06 });
  }];
  // le petit-duc scops : un « tiou » bref, pur, comme une note de flûte, redit sans fin
  T.s_petitduc = [0.45, (d, sr) => {
    const f = rf(1180, 1300);
    S.trait(d, sr, 0.03, rf(0.13, 0.17), [[0, f * 1.02], [0.7, f], [1, f * 0.9]], 0.9, { h: [0.05], att: 0.2, rel: 0.35, lisse: true });
  }];

  // ================================================================ CLOCHES, SONNAILLES, BOURDON, CHARRETTE
  // une cloche d'église (les partiels d'une vraie cloche) : variante 0 la grosse, 1 la petite, 2 une cloche lointaine
  T.s_cloche = [6.0, (d, sr, iv) => {
    const f = [196, 262, 174.6][iv % 3] * rf(0.997, 1.003);
    for (const [m, a, tau] of [[0.5, 0.5, 2.2], [0.5028, 0.25, 2.0], [1, 1, 1.5], [1.0035, 0.35, 1.4], [1.19, 0.45, 1.1], [1.5, 0.28, 0.8], [2, 0.42, 0.9], [2.52, 0.16, 0.5], [2.99, 0.12, 0.4], [4.02, 0.06, 0.25]]) S.modeR(d, sr, 0.01, f * m, tau, a);
    S.bruit(d, sr, 0.01, 0.0008, 0.01, 0.15, S.bq('bp', 1700, 0.9, sr));
  }];
  // des sonnailles de troupeau, au loin : deux ou trois cloches (tôle martelée, une de bronze) qui tintent quand les
  // bêtes bougent la tête, par petites grappes
  T.s_sonnailles = [5.0, (d, sr) => {
    const cl = [];
    for (let b = 0, n = ri(2, 3); b < n; b++) {
      const bronze = b === 0 && R() < 0.5, f = bronze ? rf(700, 950) : rf(420, 800);
      cl.push({ f, P: bronze ? [[1, 1, 0.7], [2.02, 0.5, 0.45], [2.7, 0.35, 0.3], [3.9, 0.15, 0.2]] : [[1, 1, 0.18], [1.48, 0.7, 0.14], [2.1, 0.55, 0.1], [2.75, 0.4, 0.08], [3.6, 0.25, 0.05]] });
    }
    for (const c of cl) {
      let t = rf(0.05, 1.5);
      for (let g = 0, ng = ri(1, 2); g < ng && t < 4.2; g++) {
        for (let k = 0, n = ri(2, 5); k < n && t < 4.4; k++) { const a = rf(0.4, 1); for (const [m, w, tau] of c.P) S.modeR(d, sr, t, c.f * m * rf(0.995, 1.005), tau, a * w * 0.3); S.bruit(d, sr, t, 0.0005, 0.004, a * 0.12, S.bq('bp', c.f * 2.5, 0.8, sr)); t += rf(0.18, 0.45); }
        t += rf(0.6, 1.4);
      }
    }
    S.lp1(d, sr, 3500);
  }];
  // un bourdon qui passe tout près : le vrombissement monte, passe, s'éloigne (et baisse en passant)
  T.s_bourdons = [3.0, (d, sr) => {
    const f = rf(140, 190), D = 2.9, i0 = Math.floor(0.03 * sr), n = Math.floor(D * sr);
    const Hk = Array.from({ length: 14 }, (_, h) => 1 / Math.pow(h + 1, 1.1));
    let ph = 0, ff = f, e = 0, hmax = 14;
    for (let j = 0; j < n; j++) {
      if ((j & 31) === 0) { // (la hauteur et l'enveloppe changent lentement : recalculées tous les 32 échantillons)
        const u = j / n, dop = 1.06 - 0.12 / (1 + Math.exp(-(u - 0.5) * 12));
        ff = f * dop * (1 + 0.02 * Math.sin(2 * Math.PI * 3.1 * u * D));
        e = Math.exp(-Math.pow((u - 0.5) / 0.22, 2)) * (0.85 + 0.15 * Math.sin(2 * Math.PI * 9 * u * D)) * 0.4;
        hmax = Math.min(14, Math.floor(sr * 0.45 / ff));
      }
      ph += 2 * Math.PI * ff / sr;
      const s1 = Math.sin(ph), c2 = 2 * Math.cos(ph);
      let y = s1, sp = 0, sk = s1;
      for (let h = 1; h < hmax; h++) { const sn = c2 * sk - sp; sp = sk; sk = sn; y += Hk[h] * sn; }
      d[i0 + j] += y * e;
    }
    S.lp1(d, sr, 2500);
  }];
  // une charrette sur les pavés : le roulement, les cahots, l'essieu qui grince à chaque tour, le pas du cheval
  T.s_charrette = [7.0, (d, sr) => {
    const D = 6.8, lo = S.bq('lp', 300, 0.7, sr), n = Math.floor(D * sr);
    let e = 0;
    for (let j = 0; j < n; j++) { if ((j & 63) === 0) e = Math.exp(-Math.pow((j / n - 0.5) / 0.3, 2)) * 0.5; d[j] += lo(R() * 2 - 1) * e; }
    for (let t = 0.1; t < D - 0.2; t += rf(0.05, 0.16)) { const u = t / D, e = Math.exp(-Math.pow((u - 0.5) / 0.3, 2)); S.modeR(d, sr, t, rf(90, 180), 0.03, rf(0.1, 0.35) * e); S.bruit(d, sr, t, 0.001, 0.006, 0.08 * e, S.bq('bp', 900, 0.8, sr)); }
    for (let t = 0.6; t < D - 0.6; t += rf(1.1, 1.3)) { const u = t / D, e = Math.exp(-Math.pow((u - 0.5) / 0.3, 2)); S.trait(d, sr, t, 0.25, [[0, 620], [0.5, 700], [1, 600]], 0.06 * e, { h: [0.5, 0.3, 0.2], am: 26, amd: 0.6 }); }
    for (let t = 0.2, k = 0; t < D - 0.3; k++, t += k % 2 ? 0.22 : 0.42) { const u = t / D, e = Math.exp(-Math.pow((u - 0.5) / 0.3, 2)); S.modeR(d, sr, t, rf(380, 520), 0.016, 0.45 * e); S.modeR(d, sr, t, rf(1000, 1300), 0.007, 0.18 * e); S.modeR(d, sr, t, rf(90, 115), 0.025, 0.3 * e); }
    S.lp1(d, sr, 3000);
  }];

  // ================================================================ LE CRÉPUSCULE, LA NUIT (suite)
  // l'engoulevent : un ronronnement sec et continu (« rrrrrrr… »), comme un petit moteur dans la bruyère, qui change de
  // ton toutes les deux ou trois secondes ; parfois, à la fin, un « kou-ik » et un claquement d'ailes
  T.s_engoulevent = [7.0, (d, sr, iv) => {
    let t = 0.05, haut = R() < 0.5;
    const fin = rf(5.4, 6.4), fb = rf(1050, 1250);
    while (t < fin) {
      const du = Math.min(fin - t, rf(1.4, 2.8)), f = haut ? fb * 1.3 : fb;
      S.trait(d, sr, t, du, [[0, f * 0.97], [0.5, f], [1, f * 1.01]], haut ? 0.8 : 1, { h: [0.45, 0.2, 0.08], am: haut ? rf(40, 44) : rf(31, 35), amd: 0.93, souffle: 0.22, att: 0.04, rel: 0.04 });
      t += du; haut = !haut;
    }
    if (iv % 2) { t += 0.25; S.trait(d, sr, t, 0.08, [[0, 1500], [1, 1900]], 0.6, { h: [0.2] }); S.trait(d, sr, t + 0.12, 0.14, [[0, 2300], [0.4, 2600], [1, 2000]], 0.7, { h: [0.15], lisse: true }); S.clic(d, sr, t + 0.4, 900, 0.4); S.clic(d, sr, t + 0.47, 850, 0.35); }
  }];
  // le râle des genêts : « crex-crex… crex-crex », deux syllabes râpeuses (comme un peigne qu'on gratte), dans l'herbe haute
  T.s_rale = [2.6, (d, sr) => {
    let t = 0.05;
    const f = rf(2200, 2800), bp = S.bq('bp', f, 0.9, sr);
    for (let k = 0, n = ri(2, 3); k < n; k++) {
      for (let s = 0; s < 2; s++) { S.rape(d, sr, t, 0.17, bp, 0.8, { att: 0.05, rel: 0.2, am: rf(70, 85), amd: 0.95 }); S.trait(d, sr, t, 0.17, [f * 0.55, f * 0.5], 0.12, { am: 78, amd: 0.9, h: [0.5, 0.3] }); t += 0.27; }
      t += rf(0.42, 0.55);
    }
  }];
  // une brindille qui casse dans le sous-bois (un pas de bête, une branche morte qui tombe), et un froissement de feuilles
  T.s_brindille = [1.2, (d, sr) => {
    let t = 0.04;
    for (let k = 0, n = ri(1, 2); k < n; k++) {
      const f = rf(1800, 3200);
      S.bruit(d, sr, t, 0.0003, 0.0018, 0.8, S.bq('bp', f, 1, sr));
      S.modeR(d, sr, t, f, 0.005, 0.35); S.modeR(d, sr, t, f * 1.7, 0.003, 0.2); S.modeR(d, sr, t, rf(280, 480), 0.014, 0.3);
      t += rf(0.06, 0.2);
    }
    for (let k = 0, n = ri(8, 20); k < n; k++) S.bruit(d, sr, t + rf(0.05, 0.6), 0.002, rf(0.004, 0.012), rf(0.04, 0.12), S.bq('bp', rf(1800, 4200), 1, sr));
    S.lp1(d, sr, 5000);
  }];
  // un tronc qui grince dans le vent (deux arbres qui se frottent), long et lent
  T.s_tronc = [2.2, (d, sr) => {
    const f = rf(130, 230), du = rf(0.9, 1.7);
    S.trait(d, sr, 0.05, du, [[0, f], [0.4, f * rf(1.05, 1.25)], [1, f * rf(0.85, 1)]], 0.8, { h: [0.8, 0.7, 0.55, 0.45, 0.35, 0.25, 0.18, 0.12], am: rf(14, 24), amd: 0.75, souffle: 0.12, att: 0.3, rel: 0.3, lisse: true });
    if (R() < 0.5) S.trait(d, sr, 0.15 + du, rf(0.25, 0.45), [f * 1.1, f * 0.95], 0.4, { h: [0.7, 0.6, 0.45, 0.3], am: 20, amd: 0.8, att: 0.3, rel: 0.4 });
    S.lp1(d, sr, 1800);
  }];
  // les gousses d'ajonc et de genêt qui éclatent au soleil : de petits claquements secs, et les graines qui crépitent
  T.s_gousse = [2.2, (d, sr) => {
    let t = rf(0.03, 0.3);
    for (let k = 0, n = ri(1, 4); k < n && t < 1.9; k++) {
      S.clic(d, sr, t, rf(2600, 4200), rf(0.6, 1));
      for (let g = 0, ng = ri(2, 5); g < ng; g++) S.bruit(d, sr, t + rf(0.03, 0.2), 0.0003, rf(0.001, 0.003), rf(0.05, 0.15), S.bq('bp', rf(2500, 5000), 1.2, sr));
      t += rf(0.25, 0.7);
    }
  }];
  // un caillou qui dévale la pente, loin : des chocs qui s'espacent, puis plus rien
  T.s_caillou = [3.2, (d, sr) => {
    let t = 0.05, per = rf(0.12, 0.2), a = 1;
    for (let k = 0, n = ri(5, 11); k < n && t < 2.9; k++) {
      const f = rf(700, 1900);
      S.modeR(d, sr, t, f, rf(0.008, 0.018), 0.45 * a); S.modeR(d, sr, t, f * rf(1.4, 1.9), 0.006, 0.2 * a); S.bruit(d, sr, t, 0.0005, 0.004, 0.25 * a, S.bq('bp', f * 1.5, 0.8, sr));
      for (let g = 0; g < 3; g++) S.bruit(d, sr, t + rf(0.01, 0.08), 0.0005, 0.002, 0.06 * a, S.bq('bp', rf(2000, 4000), 1, sr));
      t += per * rf(0.8, 1.3); per *= rf(1.05, 1.25); a *= rf(0.75, 0.95);
    }
    S.lp1(d, sr, 3200);
  }];
  // un poisson qui saute (un « plop » léger, et l'eau qui retombe)
  T.s_poisson = [1.0, (d, sr) => {
    const t = 0.03;
    S.bruit(d, sr, t, 0.002, 0.03, 0.35, S.bq('bp', rf(1200, 2200), 0.8, sr));
    S.trait(d, sr, t + 0.005, 0.06, [[0, rf(380, 520)], [1, rf(700, 900)]], 0.6, { att: 0.1, rel: 0.6 });
    for (let k = 0, n = ri(3, 7); k < n; k++) { const f = rf(900, 2400), tt = t + rf(0.08, 0.45); S.trait(d, sr, tt, rf(0.015, 0.03), [f, f * 1.4], rf(0.08, 0.2), { att: 0.1, rel: 0.6 }); }
    S.lp1(d, sr, 5000);
  }];

  // ---------------------------------------------------------------- volumes, phrasé, variantes
  // volume de chaque chanteur (crête du tampon) : les forts (troglodyte, rossignol) restent mesurés
  Object.assign(SoundEngine.VOL_OISEAUX, {
    s_grive: 0.07, s_rougegorge: 0.05, s_troglodyte: 0.045, s_sittelle: 0.05, s_fauvette: 0.06, s_ramier: 0.08, s_fitis: 0.045, s_veloce: 0.045,
    s_mesbleue: 0.04, s_bouvreuil: 0.04, s_bruant: 0.045, s_proyer: 0.045, s_caille: 0.05, s_linotte: 0.04, s_lulu: 0.05, s_tarier: 0.045,
    s_plastron: 0.055, s_spioncelle: 0.035, s_buse: 0.05, s_crecerelle: 0.04, s_rougequeue: 0.045, s_martinet: 0.045, s_serin: 0.035,
    s_hirondelle: 0.04, s_coq: 0.07, s_chien: 0.07, s_loriot: 0.07, s_turdoide: 0.055, s_effarvatte: 0.045, s_bruantroseaux: 0.04,
    s_rossignol: 0.06, s_cheveche: 0.07, s_moyenduc: 0.11, s_petitduc: 0.07, s_engoulevent: 0.045, s_rale: 0.04,
    s_cloche: 0.1, s_sonnailles: 0.06, s_bourdons: 0.018, s_charrette: 0.06, s_brindille: 0.05, s_tronc: 0.035, s_gousse: 0.035, s_caillou: 0.05, s_poisson: 0.05,
  });
  // combien de fois il reprend sa phrase (de…, à…), et le silence entre deux reprises (s, en plus du chant)
  Object.assign(SoundEngine.PHRASES, {
    s_grive: [1, 2, 1.2], s_rougegorge: [2, 4, 2.6], s_troglodyte: [1, 2, 4], s_sittelle: [1, 3, 2.5], s_fauvette: [1, 3, 3], s_ramier: [2, 4, 0.6],
    s_fitis: [2, 4, 4], s_veloce: [1, 3, 2.5], s_mesbleue: [1, 3, 3], s_bouvreuil: [1, 3, 2.5], s_bruant: [2, 4, 3], s_proyer: [2, 4, 3.5],
    s_caille: [3, 6, 1.0], s_linotte: [1, 2, 2], s_lulu: [2, 5, 2.2], s_tarier: [2, 4, 1.8], s_plastron: [2, 4, 2.2], s_spioncelle: [0, 1, 4],
    s_buse: [0, 2, 3.5], s_crecerelle: [0, 1, 4], s_rougequeue: [1, 3, 3], s_martinet: [0, 1, 2], s_serin: [1, 3, 2], s_hirondelle: [1, 2, 2.5],
    s_loriot: [2, 4, 2.6], s_turdoide: [1, 2, 2], s_effarvatte: [1, 2, 1.5], s_bruantroseaux: [2, 4, 3.5], s_rossignol: [4, 9, 2.4],
    s_cheveche: [2, 5, 3.4], s_moyenduc: [4, 9, 2.0], s_petitduc: [5, 12, 2.1], s_engoulevent: [1, 3, 0.8], s_rale: [3, 7, 0.4], s_coq: [0, 2, 9],
  });
  // nombre de variantes gardées (les chanteurs au grand répertoire en ont plus)
  // (quatre par défaut ; plus pour les grands répertoires, moins pour les bruits)
  SoundEngine.VARIANTES = { s_rossignol: 6, s_grive: 4, s_rougegorge: 5, s_troglodyte: 3, s_lulu: 4, s_loriot: 4, s_cloche: 2, s_coq: 3, s_chien: 3, s_moyenduc: 3, s_petitduc: 3, s_cheveche: 3, s_sonnailles: 3, s_bourdons: 3, s_charrette: 2, s_buse: 3, s_tarier: 3, s_bouvreuil: 3, s_sittelle: 3, s_caille: 3,
    s_engoulevent: 3, s_rale: 3, s_brindille: 3, s_tronc: 3, s_gousse: 3, s_caillou: 3, s_poisson: 3 };
  for (const k of Object.keys(T)) if (k.startsWith('s_') && !SoundEngine.VARIANTES[k]) SoundEngine.VARIANTES[k] = 4;
}
