// ============================================================================
//  LES VOIX DE CHAQUE MILIEU (2) : les fonds (agent S, douzième vague)
//  Des boucles longues, sans raccord, qu'on joue en nappe tout autour de
//  l'écouteur : les criquets des prés au soleil, le grillon d'Italie et la
//  grande sauterelle le soir, les rainettes, les grenouilles vertes et les
//  notes de flûte du crapaud accoucheur ; le vent dans les pins et les chênes,
//  le frisson des bouleaux, les roseaux, la bruyère, l'air des cimes, le ressac
//  du lac. Et la pluie de chaque milieu : sur les feuilles, sur l'eau des mares
//  et du lac, sur les toits, les gouttières et les pavés de la ville, sur la
//  bruyère et la pierre, sur la paille, les tuiles et le tonneau de la ferme,
//  dans l'herbe des prés, sur le toit au-dessus de soi quand on est à l'abri ;
//  et, la pluie finie, l'égouttement des arbres.
//  Calculées une fois (22 050 Hz), en tâche de fond, quand on en a besoin.
//  (Qui joue où et quand : 09-zzzzS-3-scene.js.)
// ============================================================================
{
  const S = SoundEngine.SYN, B = SoundEngine.BOUCLES, R = Math.random;
  const rf = (a, b) => a + R() * (b - a), ri = (a, b) => a + Math.floor(R() * (b - a + 1));
  // un intervalle au hasard (loi exponentielle : des événements « qui tombent » sans régularité), débit en /s
  const expo = (debit) => -Math.log(1 - R() * 0.999) / Math.max(1e-6, debit);

  // ---------------------------------------------------------------- outils
  // une courbe lisse PÉRIODIQUE (période = la durée de la boucle) : K points au hasard, raccordés en cosinus
  const courbe = (dur, T, a, b) => {
    const K = Math.max(1, Math.round(dur / T)), Tp = dur / K, P = Array.from({ length: K }, () => a + R() * (b - a));
    return (t) => {
      const u = t / Tp, i = Math.floor(u), f = u - i, c = (1 - Math.cos(Math.PI * f)) / 2;
      return P[((i % K) + K) % K] * (1 - c) + P[(((i + 1) % K) + K) % K] * c;
    };
  };
  // un grain : un souffle de bruit très bref passé dans un résonateur (feuille touchée, goutte, brin de paille, gravier)
  // q : finesse (2 : sec et large ; 6 : plus « accordé ») ; la résonance s'éteint d'elle-même après le grain
  S.grain = function (d, sr, t0, len, f, a, q) {
    const i0 = Math.floor(t0 * sr), n = Math.max(4, Math.floor(len * sr)), fc = Math.min(f, sr * 0.45), w = 2 * Math.PI * fc / sr;
    const r = Math.exp(-Math.PI * (fc / (q || 2)) / sr), c1 = 2 * r * Math.cos(w), c2 = r * r, gn = (1 - r) * 1.5, du = 1 / n;
    const fin = Math.min(d.length, i0 + n + Math.ceil(4 / Math.max(1e-4, 1 - r)));
    let y1 = 0, y2 = 0, u = 0;
    for (let i = Math.max(0, i0), j = i - i0; i < fin; i++, j++) {
      // (fenêtre parabolique : 4u(1−u), sans sinus)
      const x = j < n ? (R() * 2 - 1) * 4 * u * (1 - u) : 0, y = gn * x + c1 * y1 - c2 * y2;
      y2 = y1; y1 = y; d[i] += y * a; u += du;
    }
  };
  // une bulle (une goutte qui tombe dans l'eau : la note monte en s'éteignant) ; un phaseur qui tourne, réaccordé tous
  // les seize échantillons (pas de sinus à chaque échantillon)
  S.bulle = function (d, sr, t0, f, tau, a, monte) {
    if (f > sr * 0.42) return;
    const i0 = Math.floor(t0 * sr), n = Math.floor(tau * 5 * sr), k = Math.exp(-1 / (tau * sr)), m = monte === undefined ? 0.35 : monte, at = Math.max(2, Math.floor(sr * 0.0006));
    let c = 1, s = 0, e = a, wc = 1, ws = 0;
    for (let j = 0; j < n; j++) {
      if ((j & 15) === 0) { const w = 2 * Math.PI * Math.min(f * (1 + m * (j + 8) / n), sr * 0.45) / sr; wc = Math.cos(w); ws = Math.sin(w); }
      const i = i0 + j;
      if (i >= d.length) break;
      if (i >= 0) d[i] += s * e * (j < at ? j / at : 1);
      const q = c * wc - s * ws; s = s * wc + c * ws; c = q; e *= k;
    }
  };
  // un gargouillis (gouttière, rigole) : du bruit dans une résonance qui erre vite (réaccordée tous les 64 échantillons),
  // et des bulles
  const gargouille = (d, sr, dur, a, fmin, fmax) => {
    const n = d.length, flux = courbe(dur, 1.3, 0.4, 1);
    let f = (fmin + fmax) / 2, v = 0, k = 1, c1 = 0, c2 = 0, g = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < n; i++) {
      if ((i & 63) === 0) {
        v += (R() - 0.5) * 0.35 - v * 0.15; f = clamp(f * (1 + v * 0.08), fmin, fmax); k = flux(i / sr);
        const r = Math.exp(-Math.PI * (f / 3.5) / sr); c1 = 2 * r * Math.cos(2 * Math.PI * f / sr); c2 = r * r; g = (1 - r) * 2;
      }
      const y = g * (R() * 2 - 1) + c1 * y1 - c2 * y2; y2 = y1; y1 = y;
      d[i] += y * a * k;
    }
    for (let t = 0; t < dur + 0.2; t += expo(14)) { const q = rf(fmin, fmax * 1.6); S.bulle(d, sr, t, q, rf(0.008, 0.02), a * rf(0.15, 0.5) * flux(t), 0.5); }
  };
  // un bruit de fond large et doux, modulé par une courbe (le « lit » d'une pluie, d'un feuillage)
  const lit = (d, sr, filt, a, mod) => {
    let k = 1;
    for (let i = 0; i < d.length; i++) { if (mod && (i & 63) === 0) k = mod(i / sr); d[i] += filt(R() * 2 - 1) * a * k; }
  };

  // ================================================================ LES INSECTES
  // les criquets des prés, au soleil : chacun sa chanson — l'un par strophes de trois couplets qui enflent, l'autre en
  // « zrrr » serrés, le troisième en petits « sst » brefs et réguliers —, à des distances différentes
  B.s_criquets = [16, (d, sr, D) => {
    const dur = D - 0.25;
    for (let k = 0, n = ri(6, 8); k < n; k++) {
      const type = k % 3, f = rf(6200, 8600), a = (k < 2 ? 1 : rf(0.25, 0.6)), filt = S.bq('bp', f, 1.4, sr);
      let t = rf(0, 5);
      while (t < dur) {
        if (type === 0) { // trois couplets de plus en plus forts
          for (let c = 0; c < 3 && t < dur; c++) { const du = rf(1.1, 1.6); S.rape(d, sr, t, du, filt, a * (0.5 + 0.25 * c), { att: 0.3, rel: 0.12, am: rf(32, 44), amd: 0.85 }); t += du + rf(0.25, 0.4); }
          t += rf(5, 11);
        } else if (type === 1) { const du = rf(1.2, 2.2); S.rape(d, sr, t, du, filt, a * 0.8, { att: 0.15, rel: 0.2, am: rf(12, 18), amd: 0.9 }); t += du + rf(3, 7); }
        else { for (let c = 0, nc = ri(4, 8); c < nc && t < dur; c++) { S.rape(d, sr, t, rf(0.14, 0.22), filt, a * 0.7, { att: 0.2, rel: 0.4, am: rf(55, 70), amd: 0.8 }); t += rf(1.6, 2.6); } t += rf(5, 10); }
      }
    }
    S.lp1(d, sr, 8500);
  }];
  // le grillon d'Italie, les nuits douces : un trille doux et pur, presque une note tenue (« trrrüüü »), repris sans fin ;
  // quatre ou cinq chanteurs, chacun sur sa note
  B.s_oecanthe = [16, (d, sr, D) => {
    const dur = D - 0.25;
    for (let k = 0, n = ri(4, 5); k < n; k++) {
      const f = rf(2450, 3050), pr = rf(34, 48), a = k === 0 ? 1 : rf(0.3, 0.75);
      for (let t = rf(0, 2); t < dur; ) {
        const du = rf(1.2, 2.6);
        S.trait(d, sr, t, du, [[0, f * 0.995], [0.5, f], [1, f * 0.99]], a, { am: pr, amd: 0.7, att: 0.25, rel: 0.2, h: [0.04] });
        t += du + rf(0.5, 1.6);
      }
    }
  }];
  // la grande sauterelle verte, le soir : de longues séries de doubles « dzi-dzi » secs et aigus, un ou deux chanteurs, loin
  B.s_sauterelle = [16, (d, sr, D) => {
    const dur = D - 0.25;
    for (let k = 0, n = ri(1, 2); k < n; k++) {
      const f = rf(7600, 8800), a = k ? 0.5 : 1, per = rf(0.055, 0.07);
      for (let t = rf(0, 3); t < dur; ) {
        const fin = t + rf(4, 9);
        for (let q = 0; t < fin; q++, t += per * rf(0.97, 1.03)) {
          const m = Math.min(1, (q + 1) / 8);
          S.grain(d, sr, t, 0.012, f, a * m, 2.2); S.grain(d, sr, t + per * 0.42, 0.01, f * 1.04, a * 0.8 * m, 2.2);
        }
        t += rf(1.2, 3);
      }
    }
    S.lp1(d, sr, 9000);
  }];

  // ================================================================ LES GRENOUILLES, LES CRAPAUDS
  // les rainettes, la nuit, en chœur : des séries rapides de « kèp-kèp-kèp » nasillards (chaque note : une dizaine
  // d'impulsions), qui partent ensemble et s'arrêtent ensemble, puis un silence
  B.s_rainettes = [16, (d, sr, D) => {
    const dur = D - 0.25, nf = ri(5, 7), F = [];
    for (let k = 0; k < nf; k++) {
      // la note de cette rainette, calculée une fois
      const f = rf(1950, 2550), pr = rf(170, 230), du = rf(0.04, 0.055), len = Math.floor((du + 0.03) * sr), x = new Float32Array(len);
      for (let t = 0; t < du; t += 1 / pr) { const e = Math.sin(Math.PI * t / du); S.modeR(x, sr, t, f, 0.003, e); S.modeR(x, sr, t, f * 0.49, 0.0035, 0.55 * e); S.modeR(x, sr, t, f * 1.5, 0.0018, 0.2 * e); }
      F.push({ x, a: k < 2 ? rf(0.7, 1) : rf(0.2, 0.55), per: rf(0.13, 0.17) });
    }
    for (let t0 = rf(0, 1.5); t0 < dur; ) {
      const fin = t0 + rf(3, 6.5);
      for (const fr of F) {
        if (R() < 0.15) continue; // celle-ci se tait cette fois
        for (let t = t0 + rf(0, 1.4); t < fin + rf(-0.6, 0.3); t += fr.per * rf(0.95, 1.05)) {
          const i0 = Math.floor(t * sr), x = fr.x;
          for (let j = 0; j < x.length && i0 + j < d.length; j++) d[i0 + j] += x[j] * fr.a;
        }
      }
      t0 = fin + rf(2, 5.5);
    }
  }];
  // les crapauds accoucheurs : une petite note de flûte, pure, toutes les deux secondes à peu près, chacun la sienne
  // (comme un carillon très lent dans les murs et les pierres)
  B.s_accoucheur = [15, (d, sr, D) => {
    const dur = D - 0.25, notes = [rf(1250, 1380), rf(1400, 1520), rf(1550, 1700), rf(1720, 1880)];
    for (let k = 0, n = ri(3, 4); k < n; k++) {
      const f = notes[k], per = rf(1.6, 2.7), a = k === 0 ? 1 : rf(0.35, 0.8);
      for (let t = rf(0, per); t < dur; t += per * rf(0.92, 1.08)) S.trait(d, sr, t, rf(0.11, 0.15), [[0, f * 1.01], [0.7, f], [1, f * 0.94]], a, { h: [0.03], att: 0.18, rel: 0.5, lisse: true });
    }
  }];
  // les grenouilles vertes : des rires roulés (« rrrekekekek »), des « kouak » isolés, et de temps en temps tout le
  // chœur qui part d'un coup
  B.s_grenouilles = [18, (d, sr, D) => {
    const dur = D - 0.25, G = Array.from({ length: ri(4, 5) }, (_, k) => ({ f: rf(380, 620), a: k < 2 ? rf(0.6, 1) : rf(0.2, 0.5) }));
    const rire = (g, t) => {
      const du = rf(0.45, 1.2), f = g.f;
      S.trait(d, sr, t, du, [[0, f * 0.95], [0.5, f * 1.05], [1, f * 0.9]], g.a, { h: [0.9, 0.7, 0.55, 0.4, 0.25, 0.12], am: rf(24, 34), amd: 0.92, souffle: 0.18, att: 0.1, rel: 0.2 });
      return du;
    };
    const kouak = (g, t) => { const f = g.f * rf(0.7, 0.85); S.trait(d, sr, t, rf(0.12, 0.18), [[0, f * 1.1], [1, f * 0.82]], g.a * 0.8, { h: [0.8, 0.6, 0.4, 0.2], am: 70, amd: 0.4, souffle: 0.12, att: 0.08, rel: 0.4 }); };
    for (const g of G) for (let t = rf(0, 4); t < dur; ) { if (R() < 0.6) t += rire(g, t); else kouak(g, t); t += rf(2.5, 7); }
    // un départ en chœur
    for (let t = rf(2, dur - 3), k = 0; k < ri(1, 2); k++, t = rf(1, dur - 3)) for (const g of G) rire(g, t + rf(0, 0.8));
    S.lp1(d, sr, 3200);
  }];

  // ================================================================ LE VENT DANS LES ARBRES, LES ROSEAUX, LA BRUYÈRE
  // la forêt : le souffle dans les pins et les chênes, qui enfle et se retire comme une mer lointaine
  B.s_pins = [18, (d, sr, D) => {
    const dur = D - 0.25, n = d.length;
    const lo = S.bq('bp', 650, 0.5, sr), mi = S.bq('bp', 1500, 0.6, sr), hi = S.bq('bp', 3200, 0.8, sr);
    const g1 = courbe(dur, 6, 0.3, 1), g2 = courbe(dur, 2.6, 0.35, 1), g3 = courbe(dur, 1.5, 0.15, 1);
    let k0 = 0, k1 = 0, k2 = 0;
    for (let i = 0; i < n; i++) {
      if ((i & 31) === 0) { const t = i / sr; k0 = g1(t); k1 = k0 * g2(t); k2 = k1 * g3(t); }
      const x = R() * 2 - 1;
      d[i] = lo(x) * 0.45 * k0 + mi(x) * 0.42 * k1 + hi(x) * 0.18 * k2;
    }
  }];
  // les feuilles des chênes et des hêtres : un froissement fin, par bouffées
  B.s_feuillus = [14, (d, sr, D) => {
    const dur = D - 0.25, g1 = courbe(dur, 3.5, 0.08, 1), g2 = courbe(dur, 1.2, 0.25, 1), m = (t) => g1(t) * g2(t);
    lit(d, sr, S.bq('bp', 2100, 0.7, sr), 0.1, m);
    for (let t = 0; t < D; ) { const a = m(t); t += expo(30 + 1100 * a * a); S.grain(d, sr, t, rf(0.001, 0.004), rf(1700, 5000), a * rf(0.15, 0.7), 2); }
    S.lp1(d, sr, 7500);
  }];
  // les bouleaux : leurs petites feuilles tremblent au moindre souffle (un frisson clair, rapide, plus aigu)
  B.s_bouleaux = [14, (d, sr, D) => {
    const dur = D - 0.25, g1 = courbe(dur, 3, 0.15, 1), g2 = courbe(dur, 0.9, 0.3, 1);
    const m = (t) => g1(t) * g2(t) * (0.55 + 0.45 * Math.sin(2 * Math.PI * 8.5 * t) * Math.sin(2 * Math.PI * 0.37 * t));
    lit(d, sr, S.bq('bp', 3600, 0.8, sr), 0.06, (t) => g1(t) * g2(t));
    lit(d, sr, S.bq('bp', 900, 0.6, sr), 0.05, g1);
    for (let t = 0; t < D; ) { const a = Math.max(0, m(t)); t += expo(40 + 1500 * a * a); S.grain(d, sr, t, rf(0.0006, 0.0022), rf(2800, 6800), a * rf(0.15, 0.6), 2.5); }
    S.lp1(d, sr, 8000);
  }];
  // les roseaux du marais : un froissement sec, papier, qui passe en vagues ; parfois deux tiges qui se cognent
  B.s_roseaux = [16, (d, sr, D) => {
    const dur = D - 0.25, g1 = courbe(dur, 5.3, 0.15, 1), g2 = courbe(dur, 1.6, 0.3, 1), m = (t) => g1(t) * g2(t);
    lit(d, sr, S.bq('bp', 1700, 0.7, sr), 0.07, m);
    for (let t = 0; t < D; ) { const a = m(t); t += expo(20 + 380 * a * a); S.grain(d, sr, t, rf(0.004, 0.014), rf(1300, 4200), a * rf(0.1, 0.45), 3); }
    for (let t = rf(0, 2); t < dur; t += rf(1.5, 5)) { const a = m(t); if (a < 0.3) continue; const f = rf(520, 900); S.modeR(d, sr, t, f, 0.012, 0.25 * a); S.modeR(d, sr, t, f * 2.7, 0.005, 0.08 * a); }
    S.lp1(d, sr, 6500);
  }];
  // la lande : le vent bas dans la bruyère et les ajoncs, sec, qui court sur l'herbe rase
  B.s_bruyere = [16, (d, sr, D) => {
    const dur = D - 0.25, n = d.length, g1 = courbe(dur, 4, 0.2, 1), g2 = courbe(dur, 1.4, 0.3, 1);
    const lo = S.bq('bp', 620, 0.5, sr), hi = S.bq('bp', 1800, 0.7, sr);
    let k0 = 0, k1 = 0;
    for (let i = 0; i < n; i++) { if ((i & 31) === 0) { const t = i / sr; k0 = g1(t); k1 = k0 * g2(t); } const x = R() * 2 - 1; d[i] = lo(x) * 0.5 * k0 + hi(x) * 0.2 * k1; }
    for (let t = 0; t < D; ) { const a = g1(t) * g2(t); t += expo(8 + 90 * a * a); S.grain(d, sr, t, rf(0.0008, 0.002), rf(2600, 4500), a * rf(0.1, 0.4), 3); }
  }];
  // les hauteurs : l'air qui passe sur les crêtes, très loin, grave et lent (on le devine plus qu'on ne l'entend)
  B.s_cimes = [20, (d, sr, D) => {
    const dur = D - 0.25, n = d.length, g1 = courbe(dur, 7, 0.25, 1), g2 = courbe(dur, 3.3, 0.4, 1);
    const lo = S.bq('bp', 300, 0.6, sr), mi = S.bq('bp', 620, 0.8, sr), hi = S.bq('bp', 1150, 1.1, sr);
    let k0 = 0, k1 = 0;
    for (let i = 0; i < n; i++) { if ((i & 31) === 0) { const t = i / sr; k0 = g1(t); k1 = k0 * g2(t); } const x = R() * 2 - 1; d[i] = lo(x) * 0.6 * k0 + mi(x) * 0.35 * k1 + hi(x) * 0.1 * k1 * k1; }
    // (rien au-dessus de 2 kHz : c'est loin, et le tampon est à 11 025 Hz)
    const lp = S.bq('lp', 1700, 0.7, sr);
    for (let i = 0; i < n; i++) d[i] = lp(d[i]);
  }, 11025];
  // le ressac du lac : une vague qui monte doucement, se couche sur la grève, et reflue en roulant les graviers
  B.s_ressac = [21, (d, sr, D) => {
    const dur = D - 0.25;
    lit(d, sr, S.bq('lp', 300, 0.6, sr), 0.04, null);
    for (let t = rf(0.2, 1.5); t < dur; t += rf(4.2, 7)) {
      const a = rf(0.6, 1);
      S.rape(d, sr, t, rf(1.3, 1.9), S.bq('lp', rf(300, 420), 0.6, sr), 0.55 * a, { att: 0.6, rel: 0.35 });
      S.rape(d, sr, t + 1.1, rf(0.5, 0.8), S.bq('bp', rf(850, 1300), 0.6, sr), 0.13 * a, { att: 0.2, rel: 0.6 });
      for (let k = 0, nk = ri(50, 110); k < nk; k++) { const tt = t + 1.35 + Math.pow(R(), 0.65) * rf(1.3, 2.1); S.grain(d, sr, tt, rf(0.0008, 0.0025), rf(1800, 4800), a * rf(0.04, 0.16) * (1 - (tt - t - 1.35) / 2.3), 3); }
    }
    S.lp1(d, sr, 5000);
  }];

  // ================================================================ LA PLUIE, MILIEU PAR MILIEU
  // dans les prés : un chuchotement fin dans l'herbe
  B.s_pl_herbe = [12, (d, sr, D) => {
    lit(d, sr, S.bq('bp', 2600, 0.5, sr), 0.05, null);
    lit(d, sr, S.bq('bp', 900, 0.6, sr), 0.025, null);
    for (let t = 0; t < D; t += expo(1300)) S.grain(d, sr, t, rf(0.0006, 0.002), rf(1500, 4800), rf(0.03, 0.14), 2);
    S.lp1(d, sr, 6500);
  }];
  // en forêt : le crépitement serré sur les feuilles, le tapotement des feuilles touchées, et les grosses gouttes qui
  // tombent des hautes branches sur les basses
  B.s_pl_feuilles = [12, (d, sr, D) => {
    lit(d, sr, S.bq('bp', 3000, 0.5, sr), 0.035, null);
    lit(d, sr, S.bq('bp', 1100, 0.6, sr), 0.025, null);
    for (let t = 0; t < D; t += expo(900)) S.grain(d, sr, t, rf(0.0006, 0.0018), rf(2600, 7000), rf(0.03, 0.13), 2.5);
    for (let t = 0; t < D; t += expo(120)) S.modeR(d, sr, t, rf(1400, 3600), rf(0.002, 0.0045), rf(0.03, 0.12));
    for (let t = 0; t < D; t += expo(4)) { const f = rf(480, 1250); S.modeR(d, sr, t, f, rf(0.008, 0.016), rf(0.12, 0.35)); S.grain(d, sr, t, 0.003, f * 2.2, 0.15, 2); }
    S.lp1(d, sr, 7000);
  }];
  // au marais, au lac : la pluie sur l'eau — un frémissement, des milliers de petites bulles, et des « bloups »
  B.s_pl_eau = [12, (d, sr, D) => {
    lit(d, sr, S.bq('bp', 4200, 0.5, sr), 0.025, null);
    lit(d, sr, S.bq('bp', 1500, 0.6, sr), 0.02, null);
    for (let t = 0; t < D; t += expo(240)) S.bulle(d, sr, t, rf(1500, 4600), rf(0.004, 0.011), rf(0.02, 0.09), rf(0.25, 0.5));
    for (let t = 0; t < D; t += expo(500)) S.grain(d, sr, t, rf(0.0005, 0.0015), rf(3000, 7000), rf(0.02, 0.07), 2);
    for (let t = 0; t < D; t += expo(6)) { S.bulle(d, sr, t, rf(520, 1150), rf(0.014, 0.03), rf(0.12, 0.3), 0.4); S.grain(d, sr, t, 0.002, 2500, 0.08, 2); }
    S.lp1(d, sr, 6500);
  }];
  // en ville : le crépitement sur les tuiles et les ardoises, la gouttière qui gargouille, et les gouttes des avant-toits
  // qui claquent sur les pavés, chacune à son rythme
  B.s_pl_toits = [12, (d, sr, D) => {
    const dur = D - 0.25;
    for (let t = 0; t < D; t += expo(1100)) S.grain(d, sr, t, rf(0.0015, 0.005), rf(700, 2600), rf(0.02, 0.08), 2);
    for (let t = 0; t < D; t += expo(180)) S.modeR(d, sr, t, rf(1200, 2600), 0.0025, rf(0.02, 0.07));
    gargouille(d, sr, dur, 0.09, 260, 650);
    for (const per of [rf(0.42, 0.5), rf(0.75, 0.9), rf(1.2, 1.45)]) {
      const f = rf(1700, 2700), a = rf(0.25, 0.5);
      for (let t = rf(0, per); t < D; t += per * rf(0.93, 1.07)) { S.grain(d, sr, t, 0.003, f * 1.3, a * 0.8, 1.2); S.modeR(d, sr, t, f, 0.004, a * 0.5); for (let k = 0; k < 3; k++) S.grain(d, sr, t + rf(0.004, 0.03), 0.001, rf(3000, 6000), a * 0.15, 2); }
    }
    S.lp1(d, sr, 7000);
  }];
  // sur la lande et les hauteurs : une pluie fine et sèche que le vent pousse par nappes, qui tique sur les pierres
  B.s_pl_bruyere = [12, (d, sr, D) => {
    const dur = D - 0.25, g = courbe(dur, 3, 0.35, 1);
    lit(d, sr, S.bq('bp', 5000, 0.6, sr), 0.05, g);
    lit(d, sr, S.bq('bp', 1900, 0.7, sr), 0.035, g);
    for (let t = 0; t < D; ) { const a = g(t); t += expo(160 * a); S.modeR(d, sr, t, rf(3000, 6000), rf(0.001, 0.002), rf(0.03, 0.1) * a); }
    for (let t = 0; t < D; ) { const a = g(t); t += expo(650 * a); S.grain(d, sr, t, rf(0.0005, 0.0015), rf(2000, 5200), rf(0.02, 0.09) * a, 2); }
    S.lp1(d, sr, 8000);
  }];
  // à la ferme : la pluie mate sur le chaume et la paille, plus claire sur les tuiles, la gouttière, et la goutte qui
  // tombe dans le tonneau (une note creuse, régulière)
  B.s_pl_paille = [12, (d, sr, D) => {
    const dur = D - 0.25;
    for (let t = 0; t < D; t += expo(1200)) S.grain(d, sr, t, rf(0.003, 0.008), rf(500, 1400), rf(0.02, 0.07), 1.2);
    for (let t = 0; t < D; t += expo(90)) S.modeR(d, sr, t, rf(1100, 2000), 0.002, rf(0.02, 0.06));
    gargouille(d, sr, dur, 0.05, 240, 520);
    for (const per of [rf(0.85, 1.0), rf(1.5, 1.8)]) {
      const f = rf(430, 680), a = rf(0.3, 0.5);
      for (let t = rf(0, per); t < D; t += per * rf(0.95, 1.05)) { S.bulle(d, sr, t, f * rf(0.97, 1.03), rf(0.025, 0.04), a, 0.25); S.grain(d, sr, t, 0.002, 1800, a * 0.3, 2); }
    }
    S.lp1(d, sr, 5000);
  }];
  // à l'abri : la pluie sur le toit, au-dessus de soi (sourde), et la gouttière dehors
  B.s_pl_dedans = [12, (d, sr, D) => {
    const dur = D - 0.25;
    for (let t = 0; t < D; t += expo(1500)) S.grain(d, sr, t, rf(0.002, 0.006), rf(350, 1200), rf(0.02, 0.07), 1.2);
    for (let t = 0; t < D; t += expo(3)) { S.modeR(d, sr, t, rf(180, 380), rf(0.006, 0.012), rf(0.08, 0.2)); }
    gargouille(d, sr, dur, 0.035, 220, 480);
    S.lp1(d, sr, 1500);
  }];
  // la pluie finie, sous les arbres : l'égouttement des branches, de plus en plus rare
  B.s_egouttement = [12, (d, sr, D) => {
    for (let t = 0; t < D; t += expo(4.5)) {
      const r = R(), a = rf(0.15, 0.6);
      if (r < 0.6) { const f = rf(700, 2600); S.modeR(d, sr, t, f, rf(0.004, 0.012), a); S.grain(d, sr, t, 0.002, f * 1.6, a * 0.3, 2); }
      else if (r < 0.85) S.bulle(d, sr, t, rf(800, 1600), rf(0.012, 0.025), a * 0.7, 0.35);
      else S.grain(d, sr, t, rf(0.003, 0.006), rf(900, 2000), a * 0.6, 1.5);
    }
    S.lp1(d, sr, 6000);
  }];

  // la fréquence d'échantillonnage de chaque fond : juste assez pour ce qu'il contient (moins de calcul, moins de
  // mémoire). Le navigateur relit ces tampons par interpolation linéaire, qui renvoie en miroir ce qui approche de la
  // moitié de la fréquence : on garde tout sous 0,3 × fs — 11 025 Hz pour ce qui reste sous 3 kHz, 16 000 sous 4,8 kHz,
  // 22 050 (par défaut) pour le reste (criquets, sauterelle, feuillages, pluies)
  for (const [k, s] of Object.entries({
    s_cimes: 11025, s_accoucheur: 11025, s_pl_dedans: 11025, s_pl_paille: 11025,
    s_pins: 16000, s_bruyere: 16000, s_ressac: 16000, s_grenouilles: 16000, s_rainettes: 16000, s_roseaux: 16000, s_oecanthe: 16000, s_egouttement: 16000,
  })) if (B[k]) B[k][2] = s;

  // volume de chaque fond (k = 1), en nappe tout autour. Mesuré sur des rendus d'une minute au réglage par défaut
  // (volume 0,6, ambiance 0,5) : un fond de jour vers −58 dBFS, un fond de nuit vers −52, la pluie vers −43 avec le
  // lit d'origine baissé de moitié (avant : −40,6) ; les boucles sont normalisées à la crête, d'où des volumes
  // inégaux (une boucle faite de grains a peu d'énergie pour sa crête)
  Object.assign(SoundEngine.VOL_BOUCLES, {
    s_criquets: 0.045, s_oecanthe: 0.025, s_sauterelle: 0.025, s_rainettes: 0.06, s_accoucheur: 0.04, s_grenouilles: 0.05,
    s_pins: 0.05, s_feuillus: 0.06, s_bouleaux: 0.3, s_roseaux: 0.2, s_bruyere: 0.06, s_cimes: 0.04, s_ressac: 0.05,
    s_pl_herbe: 0.12, s_pl_feuilles: 0.22, s_pl_eau: 0.155, s_pl_toits: 0.23, s_pl_bruyere: 0.12, s_pl_paille: 0.175, s_pl_dedans: 0.11,
    s_egouttement: 0.04,
  });
}
