// ============================================================================
//  LA MUSIQUE (agent M) — 1. LE MOTEUR
//  De temps en temps, un morceau doux, puis de longues minutes de silence.
//  Tout est synthétisé. Les instruments frappés ou pincés (piano, harpe,
//  célesta, boîte à musique) et les cordes sont calculés une fois, note par
//  note, dans un travailleur (Worker) en tâche de fond : partiels,
//  inharmonicité des cordes, deux cordes à l'unisson qui battent (double
//  extinction), feutre du marteau, souffle de l'archet ; puis joués comme des
//  échantillons, avec étouffoirs et pédale. La flûte, le verre, les nappes et
//  l'orgue sont joués en direct (oscillateurs). Une réverbération de salle
//  calculée, un bus à part, très bas, sous le volume général.
//  Les morceaux sont des partitions en texte (MUSIQUE.ajouter, voir plus bas
//  la notation) ; l'exécution est « humaine » : phrases qui respirent,
//  nuances, pédale, rubato, mélodie un rien en avance sur l'accompagnement.
//  API : MUSIQUE.compiler(def), new MusJeu(ctx, sortie, def), MUSIQUE.rendre(id)
//  (rendu hors ligne, pour les essais) ; le jeu s'en sert dans 09-zzzzM-3-jeu.js.
// ============================================================================

// ---------------------------------------------------------------- la synthèse des échantillons
// Le texte de cette fonction est recopié dans un Worker : elle ne doit RIEN utiliser du jeu.
// Chaque instrument est un générateur (il rend la main de temps en temps : le repli sans Worker
// le fait tourner par tranches pour ne pas faire sauter d'images).
function MUS_DSP() {
  const TAU = Math.PI * 2;
  const alea = (s) => () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const borne = (v, a, b) => (v < a ? a : v > b ? b : v);
  // une sinusoïde amortie ajoutée à d (résonateur récursif à deux pôles) : f (Hz), a, t60 (s), phase
  function amortie(d, sr, f, a, t60, ph, i0) {
    if (!(a > 1e-7) || f >= sr * 0.48 || f <= 0) return;
    i0 = i0 || 0;
    const w = TAU * f / sr, r = Math.pow(10, -3 / (t60 * sr)), c = 2 * r * Math.cos(w), r2 = r * r;
    const n = Math.min(d.length - i0, Math.ceil(Math.log(2e-6 / a) / Math.log(r)));
    let y = a * Math.sin(ph), ym = a * Math.sin(ph - w) / r;
    for (let i = 0; i < n; i++) { d[i0 + i] += y; const yn = c * y - r2 * ym; ym = y; y = yn; }
  }
  // un bruit bref (feutre du marteau, doigt, maillet) : passe-bas à un pôle, déclin exponentiel
  function bruit(d, sr, R, a, tau, fc, i0) {
    i0 = i0 || 0;
    const k = Math.exp(-TAU * Math.min(fc, sr * 0.45) / sr), n = Math.min(d.length - i0, Math.floor(tau * 7 * sr)), e = Math.exp(-1 / (tau * sr));
    let lp = 0, lp2 = 0, env = a;
    for (let i = 0; i < n; i++) { const x = R() * 2 - 1; lp = x + (lp - x) * k; lp2 = lp + (lp2 - lp) * k; d[i0 + i] += lp2 * env * 2; env *= e; }
  }
  // attaque en demi-cosinus, fin en fondu
  function bords(d, sr, att, fin) {
    const n = d.length, na = Math.min(n, Math.max(1, Math.floor(att * sr))), nf = Math.min(n, Math.max(1, Math.floor(fin * sr)));
    for (let i = 0; i < na; i++) d[i] *= 0.5 - 0.5 * Math.cos(Math.PI * i / na);
    for (let i = 0; i < nf; i++) d[n - 1 - i] *= 0.5 - 0.5 * Math.cos(Math.PI * i / nf);
  }
  // ramène la valeur efficace de [a, b] (s) à « cible » et rend un Float32Array
  function niveau(d, sr, a, b, cible) {
    let s = 0, k = 0;
    for (let i = Math.floor(a * sr); i < Math.min(d.length, Math.floor(b * sr)); i++) { s += d[i] * d[i]; k++; }
    const g = cible / Math.sqrt(s / Math.max(1, k) + 1e-14), o = new Float32Array(d.length);
    for (let i = 0; i < d.length; i++) o[i] = d[i] * g;
    return o;
  }

  // ------------------------------------------------ le piano
  // Cordes raides (partiels légèrement plus hauts que les harmoniques), deux cordes par note un rien
  // désaccordées (battements lents, extinction en deux temps : vive puis longue), marteau frappé au
  // huitième de la corde (creux vers le 8e partiel), feutre qui adoucit les aigus, bruit du marteau
  // et choc sourd de la table. Joué « mezzo-forte » ; les nuances plus douces sont assombries au jeu.
  function* piano(m, sr) {
    const R = alea(m * 7919 + 101), f0 = hz(m);
    const dur = borne(10 - (m - 21) * 0.1, 2.4, 9);
    const d = new Float64Array(Math.floor(dur * sr));
    const B = 0.00007 * Math.pow(2, (m - 21) / 13.5);              // inharmonicité
    const t60 = 26 * Math.pow(2, -(m - 21) / 24);                   // extinction longue du fondamental
    const fc = 650 + 2.7 * f0 + (m > 84 ? (m - 84) * 120 : 0);     // feutre du marteau
    const x0 = 0.118 + 0.012 * R();                                  // point de frappe
    const fmax = Math.min(sr * 0.46, 10500);
    for (let k = 1; k <= 96; k++) {
      const fk = k * f0 * Math.sqrt(1 + B * k * k);
      if (fk > fmax) break;
      let A = (0.22 + 0.78 * Math.abs(Math.sin(Math.PI * k * x0))) / Math.pow(k, 0.5) / (1 + Math.pow(fk / fc, 2.1));
      if (fk < 130) A *= Math.pow(fk / 130, 1.25);                   // la table rayonne mal les fondamentaux graves
      const perte = 1 + Math.pow(fk / 1600, 1.6) + 0.012 * k;
      const tl = t60 / perte, tv = tl / (3 + 1.8 * R());
      const ct = (0.35 + 1.25 * R()) * (R() < 0.5 ? -1 : 1);          // désaccord des cordes (cents)
      const ph = R() * TAU;
      amortie(d, sr, fk, A * 0.68, tv, ph);
      amortie(d, sr, fk * Math.pow(2, ct / 1200), A * 0.32, tl, ph + (R() - 0.5) * 0.6);
      if (m >= 50 && k <= 12) amortie(d, sr, fk * Math.pow(2, -ct * (0.4 + 0.5 * R()) / 1200), A * 0.12, tl * 0.8, ph + (R() - 0.5) * 0.6);
      if (k % 6 === 0) yield;
    }
    // marteau : un souffle feutré très bref, et le choc sourd de la table (à peine)
    let pic = 0;
    for (let i = 0; i < Math.min(d.length, sr * 0.05); i++) pic = Math.max(pic, Math.abs(d[i]));
    bruit(d, sr, R, pic * 0.05, 0.004 + 0.004 * (m < 48), 1200 + f0 * 1.5);
    amortie(d, sr, 70 + R() * 30, pic * 0.05, 0.07, 0);
    amortie(d, sr, 160 + R() * 60, pic * 0.025, 0.04, 0);
    bords(d, sr, m < 45 ? 0.004 : m < 72 ? 0.0028 : 0.0018, Math.min(1.2, dur * 0.2));
    // niveau : les graves ont plus d'énergie, les aigus percent davantage
    const cible = 0.1 * (m < 40 ? 1.12 : 1) * (m > 76 ? Math.pow(2, -(m - 76) / 30) : 1);
    return niveau(d, sr, 0.01, 0.35, cible);
  }

  // ------------------------------------------------ la harpe (corde pincée, sans étouffoir)
  function* harpe(m, sr) {
    const R = alea(m * 4253 + 7), f0 = hz(m);
    const dur = borne(7.5 - (m - 36) * 0.09, 1.6, 7);
    const d = new Float64Array(Math.floor(dur * sr));
    const t60 = borne(9 * Math.pow(2, -(m - 48) / 16), 1.2, 12);
    const p = 0.16 + 0.04 * R();
    for (let k = 1; k <= 48; k++) {
      const fk = k * f0 * (1 + 0.00003 * k * k);
      if (fk > Math.min(sr * 0.45, 8500)) break;
      const A = (0.15 + Math.abs(Math.sin(Math.PI * k * p))) / Math.pow(k, 1.3) / (1 + Math.pow(fk / 3200, 2));
      const t = t60 / (1 + Math.pow(fk / 1100, 1.4));
      const ph = R() * TAU;
      amortie(d, sr, fk, A, t, ph);
      amortie(d, sr, fk * (1 + 0.0004 * (R() - 0.5)), A * 0.18, t * 1.5, ph + 1);
      if (k % 8 === 0) yield;
    }
    let pic = 0;
    for (let i = 0; i < Math.min(d.length, sr * 0.03); i++) pic = Math.max(pic, Math.abs(d[i]));
    bruit(d, sr, R, pic * 0.025, 0.003, 2500);
    bords(d, sr, 0.0012, Math.min(0.8, dur * 0.2));
    return niveau(d, sr, 0.005, 0.3, 0.1 * (m > 80 ? Math.pow(2, -(m - 80) / 30) : 1));
  }

  // ------------------------------------------------ le célesta (lame d'acier sur résonateur de bois)
  function* celesta(m, sr) {
    const R = alea(m * 6007 + 11), f0 = hz(m);
    const dur = borne(4.6 - (m - 60) * 0.06, 1.5, 4.6);
    const d = new Float64Array(Math.floor(dur * sr));
    const t60 = borne(5 * Math.pow(2, -(m - 60) / 22), 1.3, 6);
    const ph = R() * TAU;
    amortie(d, sr, f0, 1, t60, ph);
    amortie(d, sr, f0 * 1.0007, 0.3, t60 * 1.3, ph + 0.4);
    amortie(d, sr, f0 * 2.0, 0.05, t60 * 0.3, R() * TAU);
    amortie(d, sr, f0 * 2.756, 0.32, 0.16, R() * TAU);
    amortie(d, sr, f0 * 5.404, 0.12, 0.06, R() * TAU);
    amortie(d, sr, f0 * 8.933, 0.05, 0.025, R() * TAU);
    yield;
    bruit(d, sr, R, 0.05, 0.002, 3000);
    bords(d, sr, 0.0015, Math.min(0.6, dur * 0.2));
    return niveau(d, sr, 0.005, 0.25, 0.1 * (m > 84 ? Math.pow(2, -(m - 84) / 24) : 1));
  }

  // ------------------------------------------------ la boîte à musique (lames de peigne, un peu fausses)
  function* boite(m, sr) {
    const R = alea(m * 3571 + 5), f0 = hz(m);
    const dur = borne(3.6 - (m - 72) * 0.05, 1.2, 3.6);
    const d = new Float64Array(Math.floor(dur * sr));
    const t60 = borne(3.2 * Math.pow(2, -(m - 72) / 20), 0.9, 4);
    const faux = (R() - 0.5) * 9;
    amortie(d, sr, f0 * Math.pow(2, faux / 1200), 1, t60, R() * TAU);
    amortie(d, sr, f0 * Math.pow(2, (faux + 3 + R() * 3) / 1200), 0.35, t60 * 0.9, R() * TAU);
    amortie(d, sr, f0 * 6.267, 0.16, 0.22, R() * TAU);
    amortie(d, sr, f0 * 17.55, 0.05, 0.05, R() * TAU);
    amortie(d, sr, f0 * 2.0, 0.04, t60 * 0.4, R() * TAU);
    yield;
    bruit(d, sr, R, 0.08, 0.0015, 4000);
    bords(d, sr, 0.0008, Math.min(0.5, dur * 0.2));
    return niveau(d, sr, 0.005, 0.2, 0.1 * (m > 88 ? Math.pow(2, -(m - 88) / 24) : 1));
  }

  // ------------------------------------------------ les cordes (pupitre : six instrumentistes)
  // Six voix un rien désaccordées, chacune avec son vibrato ; le timbre passe par les résonances
  // de la caisse (formants) ; une boucle sans raccord (le début reprend la fin en fondu).
  function* cordes(m, sr) {
    const R = alea(m * 911 + 3), f0 = hz(m);
    const L = Math.floor(3.2 * sr), X = Math.floor(0.7 * sr), n = L + X;
    const d = new Float64Array(n);
    const NT = 4096, tab = new Float64Array(NT + 1);
    for (let i = 0; i <= NT; i++) tab[i] = Math.sin(TAU * i / NT);
    const g = (f, c, l) => Math.exp(-Math.pow(Math.log(f / c) / l, 2));
    const caisse = (f) => (1 + 0.9 * g(f, 290, 0.35) + 0.55 * g(f, 1050, 0.3) + 0.45 * g(f, 2700, 0.25)) / (1 + Math.pow(f / 3400, 4)) * (f < 200 ? Math.pow(f / 200, 0.7) : 1);
    const K = Math.max(1, Math.min(36, Math.floor(Math.min(sr * 0.45, 8000) / f0)));
    for (let v = 0; v < 6; v++) {
      const det = (R() - 0.5) * 14, vr = 4.7 + R() * 1.3, vd = 4 + R() * 5, vp = R() * TAU, dr = R() * TAU, drr = 0.13 + R() * 0.2;
      const a = new Float64Array(K + 1), ps = new Float64Array(K + 1);
      for (let k = 1; k <= K; k++) { a[k] = caisse(k * f0) / k; ps[k] = R(); }
      let ph = R();
      for (let i = 0; i < n; i++) {
        const t = i / sr, cents = det + vd * Math.sin(TAU * vr * t + vp) + 3 * Math.sin(TAU * drr * t + dr);
        ph += f0 * (1 + cents * 0.000577623) / sr;
        ph -= Math.floor(ph);
        let s = 0;
        for (let k = 1; k <= K; k++) { let x = k * ph + ps[k]; x -= Math.floor(x); const j = x * NT, i0 = j | 0; s += a[k] * (tab[i0] + (tab[i0 + 1] - tab[i0]) * (j - i0)); }
        d[i] += s;
      }
      yield;
    }
    // un léger souffle d'archet
    let lp = 0;
    const k1 = Math.exp(-TAU * Math.min(f0 * 3, sr * 0.4) / sr);
    for (let i = 0; i < n; i++) { const x = R() * 2 - 1; lp = x + (lp - x) * k1; d[i] += lp * 0.04 * (0.7 + 0.3 * Math.sin(i / sr * 1.7)); }
    // boucle : les X premiers échantillons reprennent la fin en fondu à puissance constante
    const o = new Float64Array(L);
    for (let i = 0; i < L; i++) o[i] = d[i];
    for (let i = 0; i < X; i++) { const u = i / X; o[i] = d[i] * Math.sin(u * Math.PI / 2) + d[L + i] * Math.cos(u * Math.PI / 2); }
    return niveau(o, sr, 0, 3, 0.1);
  }

  // ------------------------------------------------ la cloche (lointaine : partiels inharmoniques)
  function* cloche(m, sr) {
    const R = alea(m * 2311 + 17), f0 = hz(m);
    const dur = borne(9 - (m - 48) * 0.08, 3, 9);
    const d = new Float64Array(Math.floor(dur * sr));
    const P = [[0.5, 0.5, 1.0], [1, 1, 0.7], [1.183, 0.45, 0.45], [1.506, 0.3, 0.35], [2.0, 0.35, 0.3], [2.514, 0.15, 0.2], [2.662, 0.12, 0.18], [3.011, 0.1, 0.12], [4.166, 0.06, 0.08]];
    const t60 = borne(8 * Math.pow(2, -(m - 60) / 20), 2.5, 12);
    for (const [r, a, tk] of P) { const ph = R() * TAU; amortie(d, sr, f0 * r, a, t60 * tk, ph); amortie(d, sr, f0 * r * 1.0012, a * 0.4, t60 * tk * 0.9, ph); }
    yield;
    bruit(d, sr, R, 0.03, 0.003, 2000);
    bords(d, sr, 0.002, Math.min(1.5, dur * 0.25));
    return niveau(d, sr, 0.01, 0.4, 0.1);
  }

  return { piano, harpe, celesta, boite, cordes, cloche, hz };
}

// ---------------------------------------------------------------- les instruments
// Échantillonnés : une note calculée tous les « pas » demi-tons (jouée plus haut ou plus bas en
// changeant la vitesse de lecture) ; « sr » : fréquence d'échantillonnage selon le registre.
const MUS_INST = {
  piano: {
    ech: true, pas: 3, bas: 21, haut: 108, sr: (m) => (m < 48 ? 22050 : m < 72 ? 24000 : 32000), gain: 1, courbe: 1.7,
    // nuance douce : plus sombre (le feutre écrase moins la corde)
    filtre: (m, v) => Math.max(1100 + 1500 * v, MUS_hz(m) * (3 + 14 * Math.pow(v, 1.5))),
    // étouffoirs : plus lents dans les graves, aucun au-dessus du fa 6 (les cordes aiguës sonnent librement)
    etouffe: (m) => (m >= 89 ? 0 : m < 48 ? 0.22 : m < 60 ? 0.14 : 0.09),
    pan: (m) => (m - 64) / 52 * 0.42,
  },
  harpe: { ech: true, pas: 4, bas: 31, haut: 103, sr: (m) => (m < 55 ? 22050 : 32000), gain: 0.9, courbe: 1.5, filtre: (m, v) => Math.max(1400, MUS_hz(m) * (3 + 8 * v)), etouffe: () => 0, laisser: 2.5, pan: (m) => (m - 66) / 50 * 0.5 },
  celesta: { ech: true, pas: 4, bas: 60, haut: 108, sr: () => 32000, gain: 0.75, courbe: 1.5, etouffe: (m) => (m >= 96 ? 0 : 0.25), pan: (m) => (m - 84) / 40 * 0.4 },
  boite: { ech: true, pas: 4, bas: 64, haut: 108, sr: () => 32000, gain: 0.7, courbe: 1.4, etouffe: () => 0, pan: (m) => (m - 84) / 40 * 0.3 },
  cloche: { ech: true, pas: 5, bas: 36, haut: 96, sr: () => 22050, gain: 0.6, courbe: 1.4, filtre: (m, v) => 1500 + 4000 * v, etouffe: () => 0, pan: () => 0 },
  // tenus (boucle) : attaque et relâchement selon le rôle
  cordes: { ech: true, boucle: true, pas: 5, bas: 28, haut: 98, sr: (m) => (m < 52 ? 16000 : 24000), gain: 0.8, courbe: 1.3, filtre: (m, v) => 900 + 5200 * v * v + MUS_hz(m) * 2, att: 0.35, rel: 0.9, pan: (m) => (m - 60) / 40 * 0.35 },
  // en direct (oscillateurs)
  flute: { direct: true, gain: 0.32, courbe: 1.2 },
  verre: { direct: true, gain: 0.3, courbe: 1.3 },
  nappe: { direct: true, gain: 0.18, courbe: 1.2 },
  orgue: { direct: true, gain: 0.16, courbe: 1.2 },
};
const MUS_hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

// ---------------------------------------------------------------- les salles (réverbération)
// longueur, pré-délai, temps de réverbération des graves / médiums / aigus, montée, premières réflexions
const MUS_SALLES = {
  salle: { len: 4.6, pre: 0.024, tb: 2.6, tm: 2.1, th: 1.0, monte: 0.045, er: [[0.011, 0.3], [0.019, 0.24], [0.031, 0.2], [0.043, 0.16], [0.061, 0.12], [0.083, 0.08]] },
  chambre: { len: 2.4, pre: 0.008, tb: 1.25, tm: 0.95, th: 0.45, monte: 0.012, er: [[0.006, 0.4], [0.011, 0.32], [0.017, 0.25], [0.024, 0.2], [0.033, 0.14]] },
  cathedrale: { len: 8.5, pre: 0.045, tb: 5.6, tm: 4.6, th: 2.4, monte: 0.12, er: [[0.031, 0.25], [0.053, 0.2], [0.079, 0.16], [0.113, 0.12]] },
  grotte: { len: 6.5, pre: 0.03, tb: 4.4, tm: 3.3, th: 1.2, monte: 0.03, er: [[0.023, 0.4], [0.041, 0.33], [0.067, 0.27], [0.101, 0.2], [0.149, 0.14], [0.213, 0.1]] },
};
// réponse impulsionnelle stéréo : bruit partagé en trois bandes qui s'éteignent chacune à son rythme,
// premières réflexions, montée douce ; gauche et droite décorrélées
function musReponse(ctx, nom) {
  const P = MUS_SALLES[nom] || MUS_SALLES.salle, sr = ctx.sampleRate, n = Math.floor(P.len * sr);
  const buf = ctx.createBuffer(2, n, sr), TAU = Math.PI * 2;
  const kb = Math.exp(-TAU * 280 / sr), kh = Math.exp(-TAU * 3200 / sr), kf = Math.exp(-TAU * 9000 / sr), khp = Math.exp(-TAU * 50 / sr);
  const db = Math.pow(10, -3 / (P.tb * sr)), dm = Math.pow(10, -3 / (P.tm * sr)), dh = Math.pow(10, -3 / (P.th * sr));
  const pre = Math.floor(P.pre * sr), mo = Math.max(1, P.monte * sr);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let lb = 0, lh = 0, lf = 0, hp = 0, eb = 1, em = 1, eh = 1;
    const er = (P.er || []).map(([t, g]) => [pre + Math.floor(t * (ch ? 1.07 : 0.94) * sr), (Math.random() < 0.5 ? -1 : 1) * g]);
    for (let i = 0; i < n; i++) {
      let v = 0;
      if (i >= pre) {
        const x = Math.random() * 2 - 1;
        lb = x + (lb - x) * kb; lh = x + (lh - x) * kh;
        const bas = lb, haut = x - lh, mil = lh - lb;
        v = bas * eb * 1.6 + mil * em + haut * eh * 0.8;
        eb *= db; em *= dm; eh *= dh;
        const k = i - pre;
        if (k < mo * 5) v *= 1 - Math.exp(-k / mo);
      }
      for (const [j, g] of er) if (j === i) v += g * 3;
      lf = v + (lf - v) * kf;
      hp = lf + (hp - lf) * khp;
      d[i] = lf - hp;
    }
    const fo = Math.floor(n * 0.08);
    for (let q = 0; q < fo; q++) d[n - 1 - q] *= q / fo;
  }
  return buf;
}

// ---------------------------------------------------------------- la notation
// Une voix est un texte. Hauteurs : lettre (a–g), altération (# ou b, doublées au besoin), octave (do 4 =
// do du milieu) : « f#5 », « bb3 », « c4 ». Accord : « g2+d3+b3 ». Durée après « / » : 1 ronde, 2 blanche,
// 4 noire, 8 croche, 16, 32 ; « . » pointée (« .. » double), « t » de triolet (« 8t ») ; omise : la même
// que la note d'avant. Silence : « r/4 ». Barres de mesure « | » (vérifiées). Suffixes : « ~ » liée à la
// suivante, « ! » appuyée, « ? » effleurée, « ' » détachée, « _ » tenue pleine. Préfixe « & » : accord
// arpégé (de bas en haut). Nuances : ppp pp p mp mf f, et « < » « > » jusqu'à la nuance suivante.
// « ( » et « ) » : les phrases (elles respirent ; sans parenthèses, une phrase tous les « respire » mesures).
const MUS_NUANCE = { ppp: 0.18, pp: 0.26, p: 0.36, mp: 0.46, mf: 0.56, f: 0.66, ff: 0.74 };
const MUS_LETTRE = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
function musHauteur(s) {
  const m = /^([a-g])(#{1,2}|b{1,2})?(-?\d)$/.exec(s);
  if (!m) return null;
  return 12 * (+m[3] + 1) + MUS_LETTRE[m[1]] + (m[2] ? (m[2][0] === '#' ? 1 : -1) * m[2].length : 0);
}
function musDuree(s) {
  const m = /^(\d+)(\.{0,2})(t?)$/.exec(s);
  if (!m) return null;
  let d = 384 / +m[1];
  if (m[2].length === 1) d *= 1.5; else if (m[2].length === 2) d *= 1.75;
  if (m[3]) d = d * 2 / 3;
  return Math.round(d);
}
// une voix → des notes simples { t, d (tics : noire = 96), m, v (nuance), acc, ch (accord), rg (rang dans l'accord), n (taille), arp, ph (phrase) }
function musVoix(txt, barT, ana, nom, erreurs) {
  const toks = String(txt).replace(/([|()<>])/g, ' $1 ').trim().split(/\s+/).filter(Boolean);
  const out = [], liens = new Map();
  let t = 0, dur = 96, dyn = 0.36, barre0 = 0, mes = 0, phrase = 0, ouvert = false, soufflet = null, ch = 0, premiere = true;
  const fermerSoufflet = (cible) => {
    if (!soufflet) return;
    const S = soufflet, t1 = t;
    for (let i = S.i; i < out.length; i++) { const u = t1 > S.t ? (out[i].t - S.t) / (t1 - S.t) : 1; out[i].v = S.v0 + (cible - S.v0) * u; }
    soufflet = null;
  };
  for (const tk of toks) {
    if (tk === '|') {
      if (t === barre0) continue; // barre de début, ou doublée
      const attendu = premiere && ana > 0 ? ana : barT;
      if (t - barre0 !== attendu) erreurs.push(`${nom} : mesure ${mes + 1} — ${(t - barre0) / 96} noires au lieu de ${attendu / 96}`);
      mes++; premiere = false; barre0 = t;
      continue;
    }
    if (tk === '(') { phrase++; ouvert = true; continue; }
    if (tk === ')') { if (out.length) out[out.length - 1].finPh = true; ouvert = false; continue; }
    if (MUS_NUANCE[tk] !== undefined) { fermerSoufflet(MUS_NUANCE[tk]); dyn = MUS_NUANCE[tk]; continue; }
    if (tk === '<' || tk === '>') { soufflet = { i: out.length, t, v0: dyn, sens: tk }; continue; }
    const m = /^(&?)([a-gr][a-g#b0-9+\-]*)(?:\/(\d+\.{0,2}t?))?([~!?'_]*)$/.exec(tk);
    if (!m) { erreurs.push(`${nom} : signe inconnu « ${tk} »`); continue; }
    if (m[3]) { const d = musDuree(m[3]); if (d) dur = d; else erreurs.push(`${nom} : durée « ${m[3]} »`); }
    const suf = m[4] || '';
    if (m[2] === 'r') { t += dur; continue; }
    const hs = m[2].split('+').map(musHauteur);
    if (hs.some((h) => h === null)) { erreurs.push(`${nom} : hauteur « ${m[2]} »`); t += dur; continue; }
    hs.sort((a, b) => a - b);
    ch++;
    hs.forEach((h, rg) => {
      // liée depuis la note d'avant : on prolonge, on ne refrappe pas
      const L = liens.get(h);
      if (L && L.t + L.d === t) { L.d += dur; liens.delete(h); if (suf.includes('~')) liens.set(h, L); return; }
      const n = { t, d: dur, m: h, v: dyn, acc: suf.includes('!') ? 1.2 : suf.includes('?') ? 0.72 : 1, det: suf.includes("'"), ten: suf.includes('_'), ch, rg, n: hs.length, arp: !!m[1], ph: ouvert ? phrase : -1, debPh: false };
      out.push(n);
      if (suf.includes('~')) liens.set(h, n);
    });
    t += dur;
  }
  fermerSoufflet(soufflet ? (soufflet.sens === '<' ? soufflet.v0 + 0.1 : soufflet.v0 - 0.1) : 0);
  return { notes: out, fin: t, mesures: mes };
}

// ---------------------------------------------------------------- l'exécution (tempo, pédale, nuances)
// def : { id, titre, groupe, tempo (noires/min), mesure '3/4', anacrouse (noires), salle, reverb, gain,
//   pedale : 'mesure' | 'demi' | 'temps' | 'basse' | 'aucune' | [[début, fin], …] (en noires),
//   respire (mesures par phrase, 0 : aucune), souffles [mesures], rit [[mesure début, mesure fin, facteur]],
//   fermates [[noire, secondes]], finRit (mesures de ritardando final), rubato, nuances [[mesure, facteur]],
//   voix : { nom: { inst, role ('chant' | 'accomp' | 'basse' | 'tenue'), notes, vol, pan, rev, oct, dyn } } }
function musCompiler(def, graine) {
  const R = mulberry32((graine >>> 0) || 1);
  const gauss = () => (R() + R() + R() - 1.5) * 1.15;
  const [num, den] = String(def.mesure || '4/4').split('/').map(Number);
  const barT = Math.round(num * 384 / den), ana = Math.round((def.anacrouse || 0) * 96);
  const erreurs = [];
  const voix = Object.keys(def.voix).map((k) => {
    const V = def.voix[k];
    const P = musVoix(V.notes, barT, ana, def.id + '/' + k, erreurs);
    return { k, V, P, role: V.role || 'chant' };
  });
  const fin = Math.max(...voix.map((x) => x.P.fin));
  // mesure 0 : la première mesure entière (l'anacrouse est la mesure −1)
  const mesureDe = (tk) => Math.floor((tk - ana) / barT);
  const debutMesure = (b) => ana + b * barT;
  const nMes = mesureDe(fin - 1) + 1;

  // --- le temps : tempo, respiration des phrases, ritardandos, rubato, fermates
  const PAS = 8, N = Math.ceil(fin / PAS) + 2, sec = new Float64Array(N + 1);
  const base = 60 / (def.tempo || 60) / 96, ru = def.rubato === undefined ? 0.022 : def.rubato;
  const r1 = R() * 6.283, r2 = R() * 6.283;
  const resp = def.respire === undefined ? 4 : def.respire;
  const souffles = new Set(def.souffles || []);
  if (resp > 0 && !def.souffles) for (let b = resp; b < nMes; b += resp) souffles.add(b);
  const beat = def.temps ? Math.round(def.temps * 96) : den === 8 && num % 3 === 0 ? 144 : 384 / den;
  const finRit = def.finRit === undefined ? 2 : def.finRit;
  for (let i = 0; i < N; i++) {
    const tk = i * PAS;
    let w = 1 + ru * (0.6 * Math.sin(6.283 * tk / (96 * 7.3) + r1) + 0.4 * Math.sin(6.283 * tk / (96 * 12.7) + r2));
    const b = mesureDe(tk), d0 = debutMesure(b + 1);
    // fin de phrase : le dernier temps s'allonge un peu
    if (souffles.has(b + 1) && d0 - tk <= beat) w *= 1 + 0.12 * (1 - (d0 - tk) / beat);
    if (souffles.has(b) && tk - debutMesure(b) < beat * 0.5) w *= 1.03;
    for (const [b0, b1, f] of def.rit || []) {
      const t0 = debutMesure(b0 - 1), t1 = debutMesure(b1);
      if (tk >= t0 && tk < t1) w *= 1 + (1 / f - 1) * Math.pow((tk - t0) / (t1 - t0), 1.4);
    }
    if (finRit > 0) { const t0 = Math.max(0, fin - finRit * barT); if (tk >= t0) w *= 1 + 0.55 * Math.pow((tk - t0) / Math.max(1, fin - t0), 1.6); }
    sec[i + 1] = sec[i] + PAS * base * w;
  }
  const ferm = (def.fermates || []).map(([q, s]) => [q * 96, s]);
  for (const b of souffles) if (b > 0 && b < nMes) ferm.push([debutMesure(b), 0.1 * beat * base]);
  ferm.sort((a, b) => a[0] - b[0]);
  const temps = (tk) => {
    const x = clamp(tk / PAS, 0, N - 1), i = Math.floor(x);
    let s = sec[i] + (sec[i + 1] - sec[i]) * (x - i);
    for (const [q, e] of ferm) if (q <= tk) s += e;
    return s;
  };

  // --- la pédale : des intervalles [appui, levée] en tics
  let ped = [];
  const pmode = def.pedale === undefined ? 'mesure' : def.pedale;
  const coupe = (pts) => { pts = [...new Set(pts)].sort((a, b) => a - b); for (let i = 0; i < pts.length; i++) ped.push([pts[i] + 10, i + 1 < pts.length ? pts[i + 1] : fin + 192]); };
  if (Array.isArray(pmode)) ped = pmode.map(([a, b]) => [Math.round(a * 96), Math.round(b * 96)]);
  else if (pmode === 'mesure') { const pts = [0]; for (let b = 0; b <= nMes; b++) pts.push(debutMesure(b)); coupe(pts.filter((x) => x >= 0 && x < fin)); }
  else if (pmode === 'demi') { const pts = [0]; for (let x = ana % (barT / 2); x < fin; x += barT / 2) pts.push(x); coupe(pts); }
  else if (pmode === 'temps') { const pts = [0]; for (let x = ana % beat; x < fin; x += beat) pts.push(x); coupe(pts); }
  else if (pmode === 'basse') {
    const vb = voix.find((x) => x.role === 'basse') || voix.reduce((a, x) => (x.P.notes.length && (!a || x.P.notes[0].m < a.P.notes[0].m) ? x : a), null);
    coupe([0, ...((vb && vb.P.notes) || []).map((n) => n.t)]);
  }
  const leve = (tk) => { for (const [a, b] of ped) if (tk >= a && tk < b) return b; return tk; };

  // --- nuances d'ensemble [[mesure, facteur]] (interpolées)
  const NU = (def.nuances || []).map(([b, f]) => [debutMesure(b - 1), f]);
  const nuance = (tk) => {
    if (!NU.length) return 1;
    if (tk <= NU[0][0]) return NU[0][1];
    for (let i = 1; i < NU.length; i++) if (tk < NU[i][0]) { const [a, fa] = NU[i - 1], [b, fb] = NU[i]; return fa + (fb - fa) * (tk - a) / (b - a); }
    return NU[NU.length - 1][1];
  };

  // --- les notes
  const ev = [];
  voix.forEach((X, vi) => {
    const V = X.V, role = X.role, inst = MUS_INST[V.inst] ? V.inst : 'piano', notes = X.P.notes;
    if (!notes.length) return;
    const oct = (V.oct || 0) * 12;
    const hs = notes.map((n) => n.m).sort((a, b) => a - b), med = hs[hs.length >> 1];
    // phrases : celles de la partition, sinon des groupes de « resp » mesures
    const phr = new Map();
    for (const n of notes) {
      const k = n.ph >= 0 ? 'p' + n.ph : 'm' + Math.floor(Math.max(0, mesureDe(n.t)) / Math.max(1, resp || 4));
      if (!phr.has(k)) phr.set(k, [n.t, n.t + n.d]); else { const P = phr.get(k); P[1] = Math.max(P[1], n.t + n.d); }
      n.pk = k;
    }
    const arc = role === 'chant' ? 0.16 : role === 'tenue' ? 0.1 : 0.07;
    for (const n of notes) {
      const P = phr.get(n.pk), x = (n.t - P[0]) / Math.max(1, P[1] - P[0]);
      let v = n.v * nuance(n.t) * (V.dyn || 1);
      v *= 1 + arc * (Math.sin(Math.PI * Math.pow(clamp(x, 0, 1), 0.85)) - 0.35);
      if (role === 'chant') v *= 1 + clamp((n.m - med) / 12, -1, 1) * 0.07;
      const dansMes = ((n.t - debutMesure(mesureDe(n.t))) % barT + barT) % barT;
      if (role !== 'tenue') v *= dansMes === 0 ? 1.06 : dansMes % beat === 0 ? (role === 'chant' ? 1 : 0.95) : (role === 'chant' ? 0.97 : 0.9);
      if (n.n > 1 && role !== 'tenue') v *= role === 'chant' ? (n.rg === n.n - 1 ? 1 : 0.78) : (n.rg === 0 ? 1 : n.rg === n.n - 1 ? 0.88 : 0.8);
      v *= n.acc * (1 + gauss() * 0.035);
      v = clamp(v, 0.04, 0.9);
      // le temps : la mélodie un rien en avance, l'accompagnement légèrement égrené
      let dt = gauss() * (role === 'chant' ? 0.006 : 0.005);
      if (role === 'chant') dt -= 0.009;
      if (n.n > 1) dt += n.arp ? n.rg * (0.032 + R() * 0.012) : n.rg * (0.004 + R() * 0.005);
      const t = Math.max(0, temps(n.t) + dt);
      let lache = temps(n.t + n.d);
      if (n.det) lache = t + (lache - t) * 0.5;
      else if (role === 'chant' || n.ten) lache += 0.03;
      else lache -= 0.01;
      lache = Math.max(lache, t + 0.05);
      // la pédale tient ce que les doigts ont lâché
      const I = MUS_INST[inst];
      let off = lache;
      if (I.ech && !I.boucle && pmode !== 'aucune' && !V.sansPedale) { const L = leve(n.t + n.d - 1); if (L > n.t + n.d - 1) off = Math.max(lache, temps(L)); }
      ev.push({ t, off, fin: lache, m: n.m + oct, v, inst, vx: vi, role });
    }
  });
  ev.sort((a, b) => a.t - b.t);
  const fin2 = ev.reduce((a, e) => Math.max(a, e.off), 0);
  return { ev, duree: fin2, voix: voix.map((x) => ({ k: x.k, inst: MUS_INST[x.V.inst] ? x.V.inst : 'piano', role: x.role, vol: x.V.vol === undefined ? 1 : x.V.vol, pan: x.V.pan || 0, rev: x.V.rev === undefined ? 1 : x.V.rev })), erreurs, mesures: nMes };
}

// ---------------------------------------------------------------- la banque d'échantillons
const MUS_BANQUE = {
  bufs: {}, attente: {}, travail: null, seq: 0, rappels: {}, dsp: null, file: [], occupe: false,
  point(inst, m) { const I = MUS_INST[inst]; return clamp(I.bas + Math.round((m - I.bas) / I.pas) * I.pas, I.bas, I.bas + Math.floor((I.haut - I.bas) / I.pas) * I.pas); },
  cle(inst, p) { return inst + ':' + p; },
  pret(inst, p) { return !!this.bufs[this.cle(inst, p)]; },
  // le travailleur (Worker) : créé une fois ; sans lui, calcul par tranches dans la page
  ouvrier() {
    if (this.travail !== null) return this.travail;
    try {
      const src = 'const D = (' + MUS_DSP.toString() + ')();\nonmessage = (e) => { const q = e.data; const it = D[q.inst](q.m, q.sr); let r; while (!(r = it.next()).done); postMessage({ id: q.id, d: r.value }, [r.value.buffer]); };';
      const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
      const w = new Worker(url);
      w.onmessage = (e) => { const f = this.rappels[e.data.id]; delete this.rappels[e.data.id]; if (f) f(e.data.d); };
      w.onerror = (e) => { console.warn('musique : travailleur indisponible, calcul dans la page', e.message || ''); this.travail = false; const R = this.rappels; this.rappels = {}; for (const id in R) R[id](null); };
      this.travail = w;
    } catch (e) { this.travail = false; }
    return this.travail;
  },
  // calcul dans la page, par tranches de quelques millisecondes (repli)
  tranche() {
    if (this.occupe || !this.file.length) return;
    this.occupe = true;
    const pas = () => {
      const J = this.file[0];
      if (!J) { this.occupe = false; return; }
      const t0 = performance.now();
      let r;
      while (!(r = J.it.next()).done) if (performance.now() - t0 > 5) break;
      if (r.done) { this.file.shift(); J.fin(r.value); }
      setTimeout(pas, 0);
    };
    pas();
  },
  calculer(inst, m, sr) {
    return new Promise((ok) => {
      const W = this.ouvrier();
      if (W) {
        const id = ++this.seq;
        this.rappels[id] = (d) => { if (d) ok(d); else { this.dsp = this.dsp || MUS_DSP(); this.file.push({ it: this.dsp[inst](m, sr), fin: ok }); this.tranche(); } };
        W.postMessage({ id, inst, m, sr });
      } else { this.dsp = this.dsp || MUS_DSP(); this.file.push({ it: this.dsp[inst](m, sr), fin: ok }); this.tranche(); }
    });
  },
  // un échantillon (promesse d'AudioBuffer) ; ctx : pour créer le tampon si le constructeur manque
  obtenir(inst, p, ctx) {
    const k = this.cle(inst, p);
    if (this.bufs[k]) return Promise.resolve(this.bufs[k]);
    if (this.attente[k]) return this.attente[k];
    const I = MUS_INST[inst], sr = I.sr(p);
    return (this.attente[k] = this.calculer(inst, p, sr).then((d) => {
      let b;
      try { b = new AudioBuffer({ length: d.length, sampleRate: sr, numberOfChannels: 1 }); } catch (e) { b = ctx.createBuffer(1, d.length, sr); }
      b.getChannelData(0).set(d);
      this.bufs[k] = b;
      delete this.attente[k];
      return b;
    }));
  },
  // tout ce qu'il faut pour une partition compilée
  preparer(C, ctx) {
    const besoin = new Set();
    for (const e of C.ev) { const I = MUS_INST[e.inst]; if (I.ech) besoin.add(e.inst + '|' + this.point(e.inst, e.m)); }
    return Promise.all([...besoin].map((s) => { const [i, p] = s.split('|'); return this.obtenir(i, +p, ctx); }));
  },
};

// ---------------------------------------------------------------- une exécution (dans un contexte audio)
// sortie : le nœud où va la musique (le bus du jeu, ou la destination d'un rendu hors ligne)
class MusJeu {
  constructor(ctx, sortie, def, C) {
    this.ctx = ctx; this.def = def; this.C = C; this.i = 0; this.t0 = 0; this.sonne = new Map(); this.actifs = []; this.fini = false;
    const c = ctx, G = (v) => { const g = c.createGain(); g.gain.value = v; return g; };
    this.out = G(def.gain === undefined ? 1 : def.gain);
    this.out.connect(sortie);
    // réverbération propre au morceau (branchée le temps du morceau seulement)
    this.rev = c.createConvolver();
    const k = def.salle || 'salle';
    MusJeu.ir = MusJeu.ir || new Map();
    const ck = k + '@' + c.sampleRate;
    if (!MusJeu.ir.has(ck)) MusJeu.ir.set(ck, musReponse(c, k));
    this.rev.buffer = MusJeu.ir.get(ck);
    this.revG = G(def.reverb === undefined ? 0.32 : def.reverb);
    this.rev.connect(this.revG).connect(this.out);
    // une tranche de console par voix : volume, place dans l'espace, envoi vers la salle
    this.vx = C.voix.map((V) => {
      const g = G(V.vol), p = c.createStereoPanner ? c.createStereoPanner() : null, s = G(V.rev);
      if (p) { p.pan.value = clamp(V.pan, -1, 1); g.connect(p); p.connect(this.out); p.connect(s); } else { g.connect(this.out); g.connect(s); }
      s.connect(this.rev);
      return { g, p, s, V };
    });
  }
  demarrer(t0) { this.t0 = t0; this.i = 0; }
  // programme les notes jusqu'à « horizon » (temps du contexte)
  pompe(horizon) {
    const E = this.C.ev;
    while (this.i < E.length && this.t0 + E[this.i].t < horizon) {
      try { this.note(E[this.i]); } catch (e) { console.error('musique', e); }
      this.i++;
    }
    if (this.i >= E.length) this.fini = true;
  }
  note(e) {
    const I = MUS_INST[e.inst], X = this.vx[e.vx];
    if (I.ech) this.echantillon(e, I, X); else this.direct(e, I, X);
  }
  // une note échantillonnée : vitesse de lecture, feutre (nuance), étouffoir ou relâchement
  echantillon(e, I, X) {
    const c = this.ctx, p = MUS_BANQUE.point(e.inst, e.m), buf = MUS_BANQUE.bufs[MUS_BANQUE.cle(e.inst, p)];
    if (!buf) return;
    const t = this.t0 + e.t, now = c.currentTime;
    if (t < now - 0.05) return;
    const src = c.createBufferSource(), g = c.createGain(), rate = Math.pow(2, (e.m - p) / 12);
    src.buffer = buf; src.playbackRate.value = rate;
    let nd = src;
    if (I.filtre) { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = Math.min(I.filtre(e.m, e.v), c.sampleRate * 0.45); f.Q.value = 0.5; src.connect(f); nd = f; }
    let pn = null;
    if (I.pan && c.createStereoPanner) { pn = c.createStereoPanner(); pn.pan.value = clamp(I.pan(e.m), -1, 1); nd.connect(pn); nd = pn; }
    nd.connect(g); g.connect(X.g);
    const amp = I.gain * Math.pow(e.v, I.courbe || 1.6);
    const longueur = I.boucle ? Infinity : buf.duration / rate;
    let stop = t + longueur;
    if (I.boucle) {
      // tenue : attaque et relâchement doux (une boucle sans fin)
      src.loop = true; src.loopStart = 0; src.loopEnd = buf.duration;
      const a = e.role === 'tenue' ? I.att * 2.2 : I.att, r = e.role === 'tenue' ? I.rel * 1.6 : I.rel;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(amp, t + a);
      g.gain.setValueAtTime(amp, Math.max(t + a, e.off));
      g.gain.setTargetAtTime(0, Math.max(t + a, e.off), r / 3);
      stop = Math.max(t + a, e.off) + r * 2.5;
    } else {
      g.gain.setValueAtTime(amp, t);
      const tau = I.etouffe ? I.etouffe(e.m) : 0;
      if (tau > 0 && e.off < stop) { g.gain.setTargetAtTime(0, e.off, tau); stop = Math.min(stop, e.off + tau * 8); }
      else if (I.laisser && e.off + I.laisser < stop) { g.gain.setTargetAtTime(0, e.off + I.laisser * 0.5, I.laisser / 3); stop = e.off + I.laisser * 1.6; }
    }
    // la même corde refrappée : l'ancienne vibration s'efface
    const k = e.inst + e.m, A = this.sonne.get(k);
    if (A && A.stop > t) { try { A.g.gain.cancelScheduledValues(t); A.g.gain.setTargetAtTime(0, t, 0.03); A.src.stop(t + 0.2); } catch (er) { /* déjà */ } }
    this.sonne.set(k, { g, src, stop });
    src.start(t, 0);
    src.stop(stop + 0.05);
    this.suivre(src, stop);
  }
  // les instruments joués en direct
  direct(e, I, X) {
    const c = this.ctx, t = this.t0 + e.t, now = c.currentTime;
    if (t < now - 0.05) return;
    const f = MUS_hz(e.m), amp = I.gain * Math.pow(e.v, I.courbe || 1.2), dur = Math.max(0.08, e.off - e.t);
    const W = MusJeu.ondes(c), g = c.createGain();
    g.connect(X.g);
    const fin = t + dur;
    if (e.inst === 'flute') {
      const o = c.createOscillator(), l = c.createOscillator(), lg = c.createGain();
      o.setPeriodicWave(W.flute); o.frequency.value = f;
      l.frequency.value = 4.6 + Math.random() * 0.8; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(0, t + Math.min(0.25, dur * 0.3)); lg.gain.linearRampToValueAtTime(f * 0.0045, t + Math.min(0.9, dur * 0.7));
      l.connect(lg).connect(o.frequency);
      const a = Math.min(0.09, dur * 0.3);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(amp, t + a); g.gain.setTargetAtTime(amp * 0.92, t + a, 0.3);
      g.gain.setTargetAtTime(0, fin, 0.07);
      o.connect(g);
      // le souffle : un bruit coloré autour de la note, plus marqué à l'attaque
      const nz = c.createBufferSource(), bp = c.createBiquadFilter(), ng = c.createGain();
      nz.buffer = MusJeu.souffle(c); nz.loop = true;
      bp.type = 'bandpass'; bp.frequency.value = Math.min(f * 2, c.sampleRate * 0.4); bp.Q.value = 2.5;
      ng.gain.setValueAtTime(0.0001, t); ng.gain.linearRampToValueAtTime(amp * 0.5, t + 0.02); ng.gain.setTargetAtTime(amp * 0.07, t + 0.03, 0.05); ng.gain.setTargetAtTime(0, fin, 0.05);
      nz.connect(bp).connect(ng).connect(X.g);
      const st = fin + 0.5;
      o.start(t); l.start(t); nz.start(t, Math.random() * 1.5); o.stop(st); l.stop(st); nz.stop(st);
      this.suivre(o, st);
    } else if (e.inst === 'verre') {
      // verre frotté : presque pur, montée lente, un battement très lent entre deux sons
      const o = c.createOscillator(), o2 = c.createOscillator(), g2 = c.createGain();
      o.setPeriodicWave(W.verre); o.frequency.value = f;
      o2.type = 'sine'; o2.frequency.value = f * Math.pow(2, (2 + Math.random() * 2) / 1200); g2.gain.value = 0.45;
      const a = Math.min(0.35, dur * 0.4);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(amp, t + a); g.gain.setTargetAtTime(amp * 0.8, t + a, 0.6);
      g.gain.setTargetAtTime(0, fin, 0.35);
      o.connect(g); o2.connect(g2).connect(g);
      const st = fin + 2;
      o.start(t); o2.start(t); o.stop(st); o2.stop(st);
      this.suivre(o, st);
    } else if (e.inst === 'nappe') {
      // nappe : deux scies douces désaccordées, un filtre qui s'ouvre lentement
      const o = c.createOscillator(), o2 = c.createOscillator(), lp = c.createBiquadFilter();
      o.setPeriodicWave(W.scie); o2.setPeriodicWave(W.scie);
      o.frequency.value = f; o2.frequency.value = f;
      o.detune.value = -7; o2.detune.value = 7;
      lp.type = 'lowpass'; lp.Q.value = 0.4;
      const fc0 = 300 + f * 1.2, fc1 = Math.min(c.sampleRate * 0.4, 700 + 2200 * e.v + f * 2.5);
      lp.frequency.setValueAtTime(fc0, t); lp.frequency.linearRampToValueAtTime(fc1, t + Math.min(dur, 2.5));
      const a = Math.min(1.4, dur * 0.45);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(amp, t + a);
      g.gain.setValueAtTime(amp, Math.max(t + a, fin)); g.gain.setTargetAtTime(0, Math.max(t + a, fin), 0.7);
      o.connect(lp); o2.connect(lp); lp.connect(g);
      const st = Math.max(t + a, fin) + 4;
      o.start(t); o2.start(t); o.stop(st); o2.stop(st);
      this.suivre(o, st);
    } else if (e.inst === 'orgue') {
      // orgue (jeux de fond : 16', 8', 4', quinte, 2'), sombre, qui parle doucement
      const o = c.createOscillator(), lp = c.createBiquadFilter();
      o.setPeriodicWave(W.orgue); o.frequency.value = f / 2;
      lp.type = 'lowpass'; lp.frequency.value = Math.min(c.sampleRate * 0.4, 900 + f * 2); lp.Q.value = 0.3;
      const a = 0.12;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(amp, t + a);
      g.gain.setValueAtTime(amp, Math.max(t + a, fin)); g.gain.setTargetAtTime(0, Math.max(t + a, fin), 0.12);
      o.connect(lp).connect(g);
      const st = Math.max(t + a, fin) + 1;
      o.start(t); o.stop(st);
      this.suivre(o, st);
    }
  }
  suivre(src, stop) {
    this.actifs.push([src, stop]);
    if (this.actifs.length > 160) { const now = this.ctx.currentTime; this.actifs = this.actifs.filter((a) => a[1] > now); }
  }
  // tout arrêter à t (en fondu) ; puis tout débrancher
  arreter(t, fondu) {
    const c = this.ctx;
    t = t || c.currentTime;
    fondu = fondu || 0.05;
    this.i = this.C.ev.length; this.fini = true;
    try { this.out.gain.cancelScheduledValues(t); this.out.gain.setValueAtTime(this.out.gain.value, t); this.out.gain.linearRampToValueAtTime(0.0001, t + fondu); } catch (e) { /* rien */ }
    for (const [s, st] of this.actifs) if (st > t) { try { s.stop(t + fondu + 0.05); } catch (e) { /* déjà */ } }
    this.actifs = [];
    setTimeout(() => this.debrancher(), (fondu + 0.6) * 1000);
  }
  debrancher() { try { this.out.disconnect(); this.rev.disconnect(); for (const X of this.vx) { X.g.disconnect(); if (X.p) X.p.disconnect(); X.s.disconnect(); } } catch (e) { /* déjà */ } }
  // durée totale avec la queue de réverbération
  get longueur() { return this.C.duree + (MUS_SALLES[this.def.salle || 'salle'] || MUS_SALLES.salle).tm * 1.1 + 0.5; }
  // formes d'onde (une fois par contexte)
  static ondes(c) {
    if (c._musOndes) return c._musOndes;
    const pw = (amps) => { const re = new Float32Array(amps.length + 1), im = new Float32Array(amps.length + 1); amps.forEach((a, i) => { im[i + 1] = a; }); return c.createPeriodicWave(re, im); };
    const scie = []; for (let k = 1; k <= 32; k++) scie.push((k % 2 ? 1 : -1) / k / (1 + Math.pow(k / 10, 2)));
    const orgue = new Array(8).fill(0); orgue[0] = 0.35; orgue[1] = 1; orgue[3] = 0.42; orgue[5] = 0.18; orgue[7] = 0.12;
    return (c._musOndes = { flute: pw([1, 0.22, 0.09, 0.035, 0.015, 0.006]), verre: pw([1, 0.06, 0.025]), scie: pw(scie), orgue: pw(orgue) });
  }
  static souffle(c) {
    if (c._musSouffle) return c._musSouffle;
    const n = Math.floor(c.sampleRate * 2), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return (c._musSouffle = b);
  }
}

// ---------------------------------------------------------------- le catalogue et le rendu hors ligne
const MUSIQUE = {
  morceaux: {}, ordre: [],
  // un morceau : voir musCompiler pour les champs ; groupe : pres, foret, eau, lande, village, nuit,
  // dessous, bonbons, tenebres, enfers, vaisseau
  ajouter(def) {
    if (this.morceaux[def.id]) console.warn('musique : morceau en double', def.id);
    this.morceaux[def.id] = def;
    if (!this.ordre.includes(def.id)) this.ordre.push(def.id);
    return def;
  },
  compiler(id, graine) {
    const def = typeof id === 'string' ? this.morceaux[id] : id;
    if (!def) return null;
    const C = musCompiler(def, graine === undefined ? (Math.random() * 4294967296) >>> 0 : graine);
    if (C.erreurs.length) console.warn('musique : ' + def.id + '\n' + C.erreurs.slice(0, 12).join('\n'));
    return C;
  },
  // rendu hors ligne d'un morceau (essais, fichiers WAV) : promesse d'AudioBuffer stéréo
  async rendre(id, opts) {
    opts = opts || {};
    const def = this.morceaux[id], sr = opts.sr || 44100;
    const C = this.compiler(def, opts.graine === undefined ? 12345 : opts.graine);
    const tete = new OfflineAudioContext(2, 128, sr);
    await MUS_BANQUE.preparer(C, tete);
    const queue = (MUS_SALLES[def.salle || 'salle'] || MUS_SALLES.salle).len;
    const n = Math.ceil((C.duree + queue + 1) * sr);
    const off = new OfflineAudioContext(2, n, sr);
    const sortie = off.createGain(); sortie.gain.value = opts.gain || 1; sortie.connect(off.destination);
    const J = new MusJeu(off, sortie, def, C);
    J.demarrer(0.2);
    J.pompe(Infinity);
    const buf = await off.startRendering();
    return { buf, C };
  },
};
