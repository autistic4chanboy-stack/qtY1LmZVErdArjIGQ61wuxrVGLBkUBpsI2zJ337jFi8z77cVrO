// ============================================================================
//  LES AIRS (A18) — 2. LES INSTRUMENTS, LE JEU
//  sound.jouerAir(air, o) joue un air d'AIRS18 (09-zzzzzzA18-airs.js) sur son
//  instrument, depuis le début ou depuis le milieu (o.depuis, s), et rend
//  { t0, fin, duree, arreter(quand, fondu), finPartie(t) }. Peu de nœuds : un
//  instrument tenu (violon, fifre, vielle) est UNE voix pour tout l'air (ses
//  oscillateurs suivent les notes : hauteur, archet, souffle, par
//  automatisations), programmée trois secondes d'avance, le reste par une
//  minuterie ; d'un coup pour un rendu hors ligne.
//  - le violon : une corde frottée (dent de scie de Helmholtz, creusée là où
//    frotte l'archet), passée par la caisse (le mode d'air vers 280 Hz, les
//    modes du corps vers 480 Hz, le creux du nasillard vers 1,1 kHz, la
//    « colline du chevalet » vers 2,9 kHz) ; le coup d'archet (attaque de 35 à
//    75 ms, la note qui se pose d'un rien trop bas, le crin qui gratte : un
//    souffle aigu, plus fort à l'attaque), l'éclat qui suit la nuance, le
//    vibrato qui ne vient qu'après l'attaque, les liaisons (pas de nouvelle
//    attaque, un glissé de doigt), les doubles cordes sur les cordes à vide,
//    les petites notes, les trilles ;
//  - le fifre : presque une sinusoïde, un peu d'octave et de douzième, le
//    souffle (accordé sur la note, et un chuintement), le coup de langue ;
//  - la vielle à roue : deux chanterelles à l'unisson (un rien désaccordées :
//    elles « grésillent »), la roue qui tourne sans cesse (pas de nuances, la
//    touche qui claque), les deux bourdons, et la trompette sur son chien qui
//    grince en rythme quand la main pousse la roue (le coup de poignet) ;
//  - les voix (chants des pèlerins, berceuse, requiem) : celles du jeu
//    (_hf_voix), une note à la fois ;
//  - le piano du Cercle : une note qui s'éteint en deux temps, la main gauche
//    qui fait « boum-tchac » ;
//  - le tambour (grosse caisse, caisse claire, roulements) qui suit la mesure de
//    l'air et roule à la fin des parties.
// ============================================================================
{
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  // la note du mode juste au-dessus de m (la trille)
  const auDessus = (air, m) => {
    if (!air.mode || air.ton === undefined) return m + 2;
    const S = AIRS18.MODES[air.mode];
    for (let k = 1; k <= 2; k++) { const r = ((m + k - air.ton) % 12 + 12) % 12; if (S.includes(r)) return m + k; }
    return m + 2;
  };

  // ---------------------------------------------------------------- les formes d'onde (chacune à sa première note, une fois
  // par contexte : la poser coûte un peu)
  const IRR = [1, 0.92, 1.06, 0.88, 1.1, 0.95, 1.04, 0.9, 1.07, 0.93];
  const FORMES = {
    // la corde frottée : 1/k (le mouvement de Helmholtz), creusée aux multiples de 9 (l'archet au neuvième de la corde), un
    // rien irrégulière d'un partiel à l'autre
    archet: [64, (k) => (1 / k) * (0.3 + 0.7 * Math.abs(Math.sin(Math.PI * k / 9)) / Math.sin(Math.PI / 9)) * IRR[k % 10] / (1 + Math.pow(k / 34, 2))],
    // le fifre : le fondamental, un peu d'octave, de douzième
    fifre: [6, (k) => [0, 1, 0.22, 0.1, 0.035, 0.015, 0.006][k]],
    // la vielle : riche, nasillarde (la roue frotte près du chevalet)
    vielle: [48, (k) => Math.pow(k, -0.82) * (0.45 + 0.55 * Math.abs(Math.sin(Math.PI * k / 6.5))) / (1 + Math.pow(k / 28, 2))],
    // la trompette (sur le chien) : une impulsion étroite, très riche
    trompette: [48, (k) => 0.9 / Math.pow(k, 0.35)],
    // le piano : les partiels, creusés au huitième (le marteau)
    piano: [24, (k) => Math.pow(k, -1.35) * (0.25 + 0.75 * Math.abs(Math.sin(Math.PI * k / 8)))],
  };
  function onde(eng, nom) {
    const c = eng.ctx;
    if (!eng._a18o || eng._a18o.c !== c) eng._a18o = { c };
    const O = eng._a18o;
    if (!O[nom]) { const [n, f] = FORMES[nom], re = new Float32Array(n + 1), im = new Float32Array(n + 1); for (let k = 1; k <= n; k++) im[k] = f(k); O[nom] = c.createPeriodicWave(re, im); }
    return O[nom];
  }
  const filtre = (c, type, f, q, g) => { const b = c.createBiquadFilter(); b.type = type; b.frequency.value = f; if (q !== undefined) b.Q.value = q; if (g !== undefined) b.gain.value = g; return b; };
  // relie n0 → n1 → … ; rend le premier (l'entrée)
  const chaine = (...n) => { for (let i = 0; i < n.length - 1; i++) n[i].connect(n[i + 1]); return n[0]; };
  const bruit = (eng) => { const s = eng.ctx.createBufferSource(); s.buffer = eng.noise; s.loop = true; return s; };

  // ---------------------------------------------------------------- le violon
  // une voix pour tout l'air : deux oscillateurs (la note, la double corde), un vibrato, l'archet (gain), l'éclat
  // (passe-bas), le crin (souffle), la caisse (égaliseur)
  function violon(eng, out, air) {
    const c = eng.ctx, W = { archet: onde(eng, 'archet') };
    const p4 = filtre(c, 'peaking', 2900, 0.9, 6.5);
    const caisse = chaine(filtre(c, 'highpass', 185, 0.7), filtre(c, 'peaking', 280, 2.4, 5), filtre(c, 'peaking', 480, 3, 3.5), filtre(c, 'peaking', 1120, 1.3, -4.5), p4, filtre(c, 'highshelf', 6000, undefined, -7), out);
    const lp = filtre(c, 'lowpass', 2000, 0.6); lp.connect(caisse);
    const amp = c.createGain(), amp2 = c.createGain(); amp.gain.value = 0; amp2.gain.value = 0;
    amp.connect(lp); amp2.connect(lp);
    const osc = c.createOscillator(), osc2 = c.createOscillator(); osc.setPeriodicWave(W.archet); osc2.setPeriodicWave(W.archet);
    osc.connect(amp); osc2.connect(amp2);
    const vib = c.createOscillator(), vg = c.createGain(); vib.frequency.value = 5.4 + Math.random() * 0.9; vg.gain.value = 0; vib.connect(vg); vg.connect(osc.detune); vg.connect(osc2.detune);
    const nz = bruit(eng), ng = c.createGain(); ng.gain.value = 0;
    chaine(nz, filtre(c, 'bandpass', 3400, 0.8), ng, p4);
    const H = { cur: 0, v2: 0, f: 440 };
    const A = 0.11; // le niveau de l'archet (réglé à l'oreille de la sonie : celle de l'ancien violon)
    let parti = false;
    const demarrer = (t) => { if (parti) return; parti = true; for (const x of [osc, osc2, vib]) x.start(t); nz.start(t, Math.random() * eng.noise.duration); };
    return {
      note(t, N, D, prec, suiv) {
        demarrer(t);
        const v = N.v || 0.7;
        if (N.m === null) { // un silence : l'archet se lève
          amp.gain.setValueAtTime(H.cur, t); amp.gain.linearRampToValueAtTime(0, t + 0.06); amp2.gain.setValueAtTime(H.v2, t); amp2.gain.linearRampToValueAtTime(0, t + 0.06);
          ng.gain.setValueAtTime(0, t); vg.gain.setValueAtTime(0, t);
          H.cur = 0; H.v2 = 0; return;
        }
        const f = hz(N.m), lie = !!(prec && prec.l && prec.m !== null), pk = A * (0.55 + 0.6 * v), sus = pk * 0.86;
        const fin = t + D, rel = suiv && (N.l || suiv.m === null) ? 0 : Math.min(0.09, D * 0.18);
        // la hauteur : liée, un glissé de doigt (25 ms) ; sinon, la note qui se pose (d'un rien trop bas, 45 ms)
        if (lie) { osc.frequency.setValueAtTime(H.f, t - 0.012); osc.frequency.exponentialRampToValueAtTime(f, t + 0.014); }
        else { osc.frequency.setValueAtTime(f * 0.991, t); osc.frequency.exponentialRampToValueAtTime(f, t + 0.045); }
        // la petite note (prise sur le début de la note), la trille (la note du dessus, en alternance)
        let tt = t;
        if (N.g && D > 0.12) { const fg = hz(N.g); osc.frequency.setValueAtTime(fg, t); osc.frequency.setValueAtTime(fg, t + 0.045); osc.frequency.exponentialRampToValueAtTime(f, t + 0.06); tt = t + 0.06; }
        if (N.tr && D > 0.25) { const fu = hz(auDessus(air, N.m)); let k = 0; for (let x = tt + 0.02; x < t + D * 0.78; x += 0.062, k++) osc.frequency.setValueAtTime(k % 2 ? f : fu, x); osc.frequency.setValueAtTime(f, t + D * 0.78); }
        if (N.gl && !N.ds) { osc.frequency.setValueAtTime(f * Math.pow(2, N.gl / 1200), t); osc.frequency.exponentialRampToValueAtTime(f, t + D * 0.7); }
        // l'archet : une attaque et le crin qui gratte ; liée : un petit creux (le doigt) ; puis la tenue, la fin
        const ta = Math.min(0.075, Math.max(0.035, D * 0.3)) * (v > 0.85 ? 0.75 : 1);
        amp.gain.setValueAtTime(H.cur, t);
        if (lie) { amp.gain.linearRampToValueAtTime(H.cur * 0.82, t + 0.02); amp.gain.linearRampToValueAtTime(sus, t + Math.min(0.06, D * 0.5)); }
        else {
          amp.gain.linearRampToValueAtTime(0, t + 0.006);
          amp.gain.linearRampToValueAtTime(pk, t + 0.006 + ta); amp.gain.linearRampToValueAtTime(sus, t + Math.min(D * 0.6, ta + 0.14));
          ng.gain.setValueAtTime(0, t + 0.004); ng.gain.linearRampToValueAtTime(pk * 0.32, t + 0.016); ng.gain.linearRampToValueAtTime(pk * 0.07, t + 0.09);
          lp.frequency.setValueAtTime(900 + 1100 * v, t); lp.frequency.exponentialRampToValueAtTime(2600 + 5200 * v * v, t + ta + 0.02);
        }
        if (rel > 0) { amp.gain.setValueAtTime(sus, fin - rel); amp.gain.linearRampToValueAtTime(sus * 0.15, fin); H.cur = sus * 0.15; ng.gain.setValueAtTime(pk * 0.07, fin - rel); ng.gain.linearRampToValueAtTime(0, fin); }
        else { amp.gain.setValueAtTime(sus, fin - 0.001); H.cur = sus; }
        // le vibrato : après l'attaque, sur les notes assez longues
        vg.gain.setValueAtTime(0, t);
        if (D > 0.32 && !N.tr) vg.gain.linearRampToValueAtTime(11 + 7 * v, t + Math.min(0.42, D * 0.55));
        // la double corde (une corde à vide), qui se règle quand on accorde (gl)
        if (N.ds) {
          const f2 = hz(N.ds);
          if (N.gl) { osc2.frequency.setValueAtTime(f2 * Math.pow(2, N.gl / 1200), t); osc2.frequency.setValueAtTime(f2 * Math.pow(2, N.gl / 1200), t + D * 0.3); osc2.frequency.exponentialRampToValueAtTime(f2, t + D * 0.85); }
          else osc2.frequency.setValueAtTime(f2, t);
          amp2.gain.setValueAtTime(H.v2, t); amp2.gain.linearRampToValueAtTime(pk * 0.72, t + ta + 0.01); amp2.gain.setValueAtTime(pk * 0.7, fin - Math.max(rel, 0.02)); amp2.gain.linearRampToValueAtTime(0, fin); H.v2 = 0;
        } else if (H.v2 > 0) { amp2.gain.setValueAtTime(H.v2, t); amp2.gain.linearRampToValueAtTime(0, t + 0.03); H.v2 = 0; }
        H.f = f;
      },
      fin(t) {
        demarrer(t);
        amp.gain.setValueAtTime(H.cur, t); amp.gain.linearRampToValueAtTime(0, t + 0.12); amp2.gain.setValueAtTime(H.v2, t); amp2.gain.linearRampToValueAtTime(0, t + 0.12); ng.gain.setValueAtTime(0, t + 0.12);
        for (const x of [osc, osc2, vib, nz]) x.stop(t + 0.2);
      },
    };
  }

  // ---------------------------------------------------------------- le fifre
  function fifre(eng, out, air) {
    const c = eng.ctx, W = { fifre: onde(eng, 'fifre') };
    const sortie = chaine(filtre(c, 'highpass', 300, 0.7), filtre(c, 'highshelf', 7000, undefined, -4), out);
    const osc = c.createOscillator(); osc.setPeriodicWave(W.fifre);
    const amp = c.createGain(); amp.gain.value = 0; osc.connect(amp).connect(sortie);
    const vib = c.createOscillator(), vg = c.createGain(); vib.frequency.value = 5 + Math.random(); vg.gain.value = 0; vib.connect(vg).connect(osc.detune);
    // le souffle : accordé sur la note (le tuyau), et un chuintement aigu (le coup de langue)
    const nz = bruit(eng), nbp = filtre(c, 'bandpass', 1500, 4), ng = c.createGain(), ng2 = c.createGain(); ng.gain.value = 0; ng2.gain.value = 0;
    nz.connect(nbp).connect(ng).connect(sortie); nz.connect(filtre(c, 'highpass', 3500, 0.7)).connect(ng2).connect(sortie);
    const H = { cur: 0, f: 600 }, A = 0.075;
    let parti = false;
    const demarrer = (t) => { if (parti) return; parti = true; osc.start(t); vib.start(t); nz.start(t, Math.random() * eng.noise.duration); };
    return {
      note(t, N, D, prec, suiv) {
        demarrer(t);
        if (N.m === null) { amp.gain.setValueAtTime(H.cur, t); amp.gain.linearRampToValueAtTime(0, t + 0.03); ng.gain.setValueAtTime(0, t + 0.03); ng2.gain.setValueAtTime(0, t); vg.gain.setValueAtTime(0, t); H.cur = 0; return; }
        const f = hz(N.m), v = N.v || 0.7, pk = A * (0.6 + 0.5 * v), lie = !!(prec && prec.l && prec.m !== null), fin = t + D;
        const gap = suiv && (N.l || suiv.m === null) ? 0 : Math.min(0.045, D * 0.16);
        nbp.frequency.setValueAtTime(f, t);
        amp.gain.setValueAtTime(H.cur, t);
        if (lie) { osc.frequency.setValueAtTime(H.f, t - 0.006); osc.frequency.exponentialRampToValueAtTime(f, t + 0.008); amp.gain.linearRampToValueAtTime(pk * 0.9, t + 0.03); }
        else {
          // le coup de langue : la note part un peu haut (le souffle force), un « tu » de bruit
          osc.frequency.setValueAtTime(f * 1.012, t); osc.frequency.exponentialRampToValueAtTime(f, t + 0.035);
          amp.gain.linearRampToValueAtTime(0, t + 0.003); amp.gain.linearRampToValueAtTime(pk * 1.05, t + 0.02); amp.gain.linearRampToValueAtTime(pk * 0.9, t + 0.06);
          ng2.gain.setValueAtTime(0, t); ng2.gain.linearRampToValueAtTime(pk * 0.5, t + 0.006); ng2.gain.linearRampToValueAtTime(pk * 0.05, t + 0.04);
        }
        ng.gain.setValueAtTime(pk * 0.14, t + 0.01);
        let tt = t;
        if (N.g && D > 0.1) { const fg = hz(N.g); osc.frequency.setValueAtTime(fg, t); osc.frequency.setValueAtTime(fg, t + 0.04); osc.frequency.exponentialRampToValueAtTime(f, t + 0.05); tt = t + 0.05; }
        if (N.tr && D > 0.2) { const fu = hz(auDessus(air, N.m)); let k = 0; for (let x = tt + 0.02; x < t + D * 0.8; x += 0.055, k++) osc.frequency.setValueAtTime(k % 2 ? f : fu, x); osc.frequency.setValueAtTime(f, t + D * 0.8); }
        if (gap > 0) { amp.gain.setValueAtTime(pk * 0.9, fin - gap); amp.gain.linearRampToValueAtTime(0, fin - 0.004); ng.gain.setValueAtTime(pk * 0.14, fin - gap); ng.gain.linearRampToValueAtTime(0, fin - 0.004); H.cur = 0; }
        else { amp.gain.setValueAtTime(pk * 0.9, fin - 0.001); H.cur = pk * 0.9; }
        vg.gain.setValueAtTime(0, t);
        if (D > 0.45 && !N.tr) vg.gain.linearRampToValueAtTime(7, t + Math.min(0.4, D * 0.6));
        H.f = f;
      },
      fin(t) { demarrer(t); amp.gain.setValueAtTime(H.cur, t); amp.gain.linearRampToValueAtTime(0, t + 0.06); ng.gain.setValueAtTime(0, t + 0.06); ng2.gain.setValueAtTime(0, t + 0.06); for (const x of [osc, vib, nz]) x.stop(t + 0.12); },
    };
  }

  // ---------------------------------------------------------------- la vielle à roue
  // les bourdons (la tonique, et sa quinte en dessous ou l'octave), la trompette sur son chien (coup(t, k) : un coup
  // de poignet) ; o.bourdons : [midi…] (sinon d'après le ton)
  function vielle(eng, out, air, o) {
    const c = eng.ctx, W = { vielle: onde(eng, 'vielle'), trompette: onde(eng, 'trompette') };
    const hp = chaine(filtre(c, 'highpass', 90, 0.7), filtre(c, 'peaking', 260, 1.5, 3), filtre(c, 'peaking', 1300, 2, 6), filtre(c, 'peaking', 2600, 2.2, 4), filtre(c, 'lowpass', 6500, 0.5), out);
    const roue = c.createGain(); roue.gain.value = 0; roue.connect(hp);
    // la roue n'est pas parfaitement ronde : le son respire un peu
    const wl = c.createOscillator(), wg = c.createGain(); wl.frequency.value = 0.9 + Math.random() * 0.5; wg.gain.value = 0.0025; wl.connect(wg).connect(roue.gain);
    const ch1 = c.createOscillator(), ch2 = c.createOscillator(); ch1.setPeriodicWave(W.vielle); ch2.setPeriodicWave(W.vielle); ch2.detune.value = 5;
    const chg = c.createGain(); chg.gain.value = 0; ch1.connect(chg); ch2.connect(chg); chg.connect(roue);
    // les bourdons : sous la mélodie, plus sombres
    const ton = air.ton || 67, B = o.bourdons || [ton - 24, ton - 12 + (air.mode === 'maj' || air.mode === 'mix' ? -5 : 0)];
    const bg = c.createGain(); bg.gain.value = 0.2; bg.connect(filtre(c, 'lowpass', 1300, 0.6)).connect(roue);
    const bos = B.map((m) => { const x = c.createOscillator(); x.setPeriodicWave(W.vielle); x.frequency.value = hz(m); x.detune.value = (Math.random() - 0.5) * 6; x.connect(bg); return x; });
    // la trompette sur son chien : une corde grave, très riche, qu'on n'entend qu'aux coups de poignet (un grincement)
    const ft = hz(ton - 12), tr = c.createOscillator(); tr.setPeriodicWave(W.trompette); tr.frequency.value = ft;
    const trg = c.createGain(); trg.gain.value = 0;
    const nz = bruit(eng);
    tr.connect(filtre(c, 'bandpass', 1900, 1.2)).connect(trg); nz.connect(filtre(c, 'bandpass', 2600, 1.5)).connect(trg); trg.connect(roue);
    // (le chien bat contre la table : le son tremble vite, à la moitié de la fréquence de la trompette)
    const chienL = c.createOscillator(), chienG = c.createGain(); chienL.type = 'square'; chienL.frequency.value = ft / 2; chienG.gain.value = 0; chienL.connect(chienG).connect(trg.gain);
    const H = { cur: 0 }, A = 0.07;
    let parti = false;
    const demarrer = (t) => {
      if (parti) return; parti = true;
      for (const x of [ch1, ch2, tr, chienL, wl, ...bos]) x.start(t);
      nz.start(t, Math.random() * eng.noise.duration);
      // la roue se met à tourner
      roue.gain.setValueAtTime(0, t); roue.gain.linearRampToValueAtTime(A, t + 0.35);
      ch1.frequency.setValueAtTime(hz(ton), t); ch2.frequency.setValueAtTime(hz(ton), t);
    };
    return {
      note(t, N, D) {
        demarrer(t);
        // un silence : les touches lâchées, la chanterelle à vide sonne doucement (la roue tourne toujours)
        if (N.m === null) { chg.gain.setValueAtTime(H.cur, t); chg.gain.linearRampToValueAtTime(0.35, t + 0.03); for (const x of [ch1, ch2]) x.frequency.setValueAtTime(hz(ton), t + 0.02); H.cur = 0.35; return; }
        const f = hz(N.m);
        // la touche : la note change d'un coup, un petit claquement (le son se coupe une fraction)
        for (const x of [ch1, ch2]) x.frequency.setValueAtTime(f, t);
        chg.gain.setValueAtTime(H.cur, t); chg.gain.linearRampToValueAtTime(H.cur * 0.55, t + 0.004); chg.gain.linearRampToValueAtTime(1, t + 0.02);
        H.cur = 1;
        if (N.g && D > 0.12) { const fg = hz(N.g); for (const x of [ch1, ch2]) { x.frequency.setValueAtTime(fg, t); x.frequency.setValueAtTime(f, t + 0.045); } }
        if (N.tr && D > 0.25) { const fu = hz(auDessus(air, N.m)); let k = 0; for (let x = t + 0.03; x < t + D * 0.75; x += 0.065, k++) for (const y of [ch1, ch2]) y.frequency.setValueAtTime(k % 2 ? f : fu, x); for (const y of [ch1, ch2]) y.frequency.setValueAtTime(f, t + D * 0.75); }
      },
      // un coup de poignet : la trompette qui grince (k : sa force)
      coup(t, k) {
        demarrer(t);
        const pk = A * 0.9 * k, d = 0.1;
        trg.gain.setValueAtTime(0, t); trg.gain.linearRampToValueAtTime(pk, t + 0.008); trg.gain.linearRampToValueAtTime(pk * 0.35, t + d * 0.5); trg.gain.linearRampToValueAtTime(0, t + d);
        chienG.gain.setValueAtTime(0, t); chienG.gain.linearRampToValueAtTime(pk * 0.8, t + 0.008); chienG.gain.linearRampToValueAtTime(0, t + d);
      },
      fin(t) {
        demarrer(t);
        // la roue s'arrête : tout descend ensemble, un peu plus grave
        roue.gain.setValueAtTime(A, t); roue.gain.linearRampToValueAtTime(0, t + 0.5);
        for (const x of [ch1, ch2, ...bos]) { x.detune.setValueAtTime(x.detune.value, t); x.detune.linearRampToValueAtTime(x.detune.value - 40, t + 0.5); }
        for (const x of [ch1, ch2, tr, chienL, wl, nz, ...bos]) x.stop(t + 0.6);
      },
    };
  }

  // ---------------------------------------------------------------- les voix (une note à la fois, celles du jeu)
  function voix(eng, out, air, o) {
    const oo = { voyelle: o.voyelle || 'a' };
    return {
      note(t, N, D) { if (N.m !== null) eng._hf_voix(t, hz(N.m), D, 0.04 * (0.7 + 0.45 * (N.v || 0.7)), out, oo); },
      fin() {},
    };
  }

  // ---------------------------------------------------------------- le piano (une voix par note), et sa main gauche
  function piano(eng, out, air) {
    const c = eng.ctx, W = { piano: onde(eng, 'piano') };
    const sortie = filtre(c, 'highshelf', 5000, undefined, -6); sortie.connect(out);
    const frappe = (t, m, v, du) => {
      const f = hz(m), x = c.createOscillator(), g = c.createGain(), lp = c.createBiquadFilter();
      x.setPeriodicWave(W.piano); x.frequency.value = f; lp.type = 'lowpass'; lp.Q.value = 0.4;
      const a = 0.06 * v * (m > 76 ? Math.pow(2, -(m - 76) / 30) : 1), long = Math.min(4, Math.max(0.6, 7 - (m - 40) * 0.07));
      lp.frequency.setValueAtTime(Math.min(9000, f * (4 + 6 * v)), t); lp.frequency.setTargetAtTime(Math.min(9000, f * 2.2), t + 0.02, 0.35);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(a, t + 0.004); g.gain.setTargetAtTime(a * 0.32, t + 0.005, 0.22);
      const fin = t + Math.max(0.12, du);
      g.gain.setTargetAtTime(0, fin, 0.12 + 0.05 * (m < 60));
      x.connect(lp).connect(g).connect(sortie);
      x.start(t); x.stop(Math.min(fin + 0.8, t + long));
    };
    // la main gauche : la fondamentale de l'accord à la basse, puis l'accord, selon la mesure
    const S = AIRS18.MODES[air.mode || 'maj'], ton = air.ton || 60;
    const deg = (d) => ton + 12 * Math.floor(d / 7) + S[((d % 7) + 7) % 7];
    let mes = -1;
    return {
      note(t, N, D, prec, suiv, pos) {
        if (N.m !== null) { frappe(t, N.m, N.v || 0.7, D); if (N.g) frappe(Math.max(0, t - 0.04), N.g, (N.v || 0.7) * 0.6, 0.05); }
        if (pos === undefined || N.r === undefined) return;
        const bar = air.bar || 3, b = Math.floor(pos / bar + 1e-6);
        if (b === mes || b < 0) return;
        mes = b;
        const r = N.r, spb = 60 / air.bpm, t0 = t - ((pos - b * bar) * spb);
        let basse = deg(r) - 24; if (basse < 38) basse += 12;
        const acc = [deg(r) - 12, deg(r + 2) - 12, deg(r + 4) - 12].map((m) => (m < 52 ? m + 12 : m));
        if ((air.temps || []).length === 3 && bar === 3) { frappe(t0, basse, 0.55, spb * 0.9); for (const k of [1, 2]) for (const m of acc) frappe(t0 + k * spb, m, 0.3, spb * 0.5); }
        else for (let k = 0; k < bar; k++) { if (k % 2 === 0) frappe(t0 + k * spb, k % 4 === 2 ? basse + 7 : basse, 0.5, spb * 0.8); else for (const m of acc) frappe(t0 + k * spb, m, 0.28, spb * 0.45); }
      },
      fin() {},
    };
  }

  // ---------------------------------------------------------------- le tambour, le chien de la vielle : sur la mesure
  // un coup de tambour : g grosse caisse, c caisse claire, a accent, r roulement (quatre coups serrés)
  function coupTambour(eng, t, k, v, out) {
    if (k === 'g') { eng.tone(t, 'sine', 115, 58, 0.24, v * 0.9, out, 0.003); eng.noiseHit(t, 0.06, 'lowpass', 420, 0.7, v * 0.5, out); eng.noiseHit(t, 0.03, 'bandpass', 900, 1, v * 0.22, out); }
    else if (k === 'c' || k === 'a') { const a = k === 'a' ? 1.35 : 1; eng.noiseHit(t, 0.12, 'bandpass', 2300, 0.8, v * 1.05 * a, out); eng.noiseHit(t, 0.09, 'highpass', 4800, 0.7, v * 0.35 * a, out); eng.tone(t, 'triangle', 215, 175, 0.06, v * 0.33 * a, out, 0.002); }
    else if (k === 'r') { for (let i = 0; i < 4; i++) eng.noiseHit(t + i * 0.045, 0.05, 'bandpass', 2450, 0.8, v * (0.55 + 0.1 * i), out); }
  }
  // le motif d'une mesure, d'après la mesure de l'air : [position (noires), coup]
  function motifTambour(air) {
    const m = air.mesure;
    if (m === '3/8') return [[0, 'g'], [0.5, 'c'], [1, 'c']];
    if (m === '3/4') return air.style === 'mazurka' ? [[0, 'g'], [1, 'a'], [2, 'c']] : [[0, 'g'], [1, 'c'], [2, 'c']];
    if (m === '6/8') return [[0, 'g'], [1, 'c'], [1.5, 'g'], [2.5, 'c']];
    if (m === '4/4') return [[0, 'g'], [1, 'c'], [2, 'g'], [3, 'c']];
    // 2/4 : la marche, le rigaudon, la polka (« boum, tchac-tchac »)
    return air.style === 'polka' ? [[0, 'g'], [1, 'c'], [1.5, 'c']] : [[0, 'g'], [0.5, 'c'], [1, 'g'], [1.5, 'c']];
  }
  // les coups du chien (vielle) par mesure : [position, force]
  function motifChien(air) {
    const m = air.mesure;
    if (air.lent || air.accord) return [[0, 0.55]];
    if (m === '3/8') return [[0, 1], [0.5, 0.45], [1, 0.7]];
    if (m === '3/4') return air.style === 'mazurka' ? [[0, 1], [1, 0.85], [2, 0.5]] : [[0, 1], [1, 0.5], [2, 0.5]];
    if (m === '6/8') return [[0, 1], [1, 0.5], [1.5, 0.8], [2.5, 0.5]];
    if (m === '4/4') return [[0, 1], [1, 0.5], [2, 0.8], [3, 0.5]];
    return [[0, 1], [0.5, 0.4], [1, 0.75], [1.5, 0.4]];
  }
  // la grille d'un air (positions en noires depuis le début) : le motif sur chaque mesure, sauf la dernière note ;
  // fins : un roulement sur la seconde moitié de la mesure qui finit une partie, un coup à la dernière note
  function grille(air, motif, fins) {
    const bar = air.bar || 2, M = motif, L = [], t0 = air.t0 || 0, der = air.beats - air.notes[air.notes.length - 1].d;
    const finsP = air.sections.map((s) => s.t).filter((t) => t > t0 + 0.01);
    if (fins && t0 > 0.1) L.push([0, 'r']);
    for (let b = t0; b < der - 0.01; b += bar) {
      const fp = fins && finsP.some((x) => Math.abs(x - (b + bar)) < 1e-3);
      for (const [p, k] of M) { const t = b + p; if (t >= der - 0.01) break; L.push([t, fp && p >= bar / 2 ? 'r' : k]); }
    }
    if (fins) L.push([der, 'a'], [der, 'g']); else L.push([der, M[0][1]]);
    return L;
  }

  const INSTRUMENTS = { violon, fifre, vielle, voix, piano };

  // ---------------------------------------------------------------- les heures des notes (un rien humaines)
  // [t (s), note, durée (s), position (noires depuis la première mesure)] ; temps(b) : l'heure de la position b
  function horaire(air, R) {
    const spb = 60 / air.bpm, L = [], n = air.notes.length, lent = air.lent, derniers = (air.bar || 2) * 2;
    let t = 0, pos = -(air.t0 || 0);
    for (let i = 0; i < n; i++) {
      const N = air.notes[i], reste = air.beats - (pos + (air.t0 || 0));
      // un tempo qui respire un peu ; le ralenti des deux dernières mesures (plus marqué pour les airs lents)
      let k = 1 + (R() - 0.5) * (lent ? 0.04 : 0.012);
      if (reste < derniers) k *= 1 + (lent ? 0.22 : 0.08) * (1 - reste / derniers);
      const D = N.d * spb * k;
      L.push([t, N, D, pos]);
      t += D; pos += N.d;
    }
    // l'heure d'une position (noires depuis le début de l'air) : d'après les notes (pour le tambour, le chien)
    const temps = (b) => {
      let lo = 0, hi = L.length - 1;
      const x = b - (air.t0 || 0);
      while (lo < hi) { const m = (lo + hi + 1) >> 1; if (L[m][3] <= x + 1e-9) lo = m; else hi = m - 1; }
      const [t1, N, D, p] = L[lo];
      return t1 + Math.max(0, x - p) / N.d * D;
    };
    return { L, fin: t, temps };
  }

  Object.assign(SoundEngine.prototype, {
    // en tâche de fond : poser la prochaine forme d'onde pas encore posée ; false : toutes prêtes
    a18Ondes() {
      if (!this.ctx) return false;
      for (const k in FORMES) if (!this._a18o || this._a18o.c !== this.ctx || !this._a18o[k]) { onde(this, k); return true; }
      return false;
    },
    // jouer un air : o = { inst, out, bus ('sfx'|'amb'|'voix'), vol, depuis (s), delai (s), tambour (volume), voyelle,
    // chien (false : sans), bourdons } ; rend { t0, fin, duree, arreter(quand, fondu), finPartie(t) } ou null
    jouerAir(air, o) {
      if (!this.ok || !air || !air.notes || !air.notes.length) return null;
      o = o || {};
      const c = this.ctx, nomI = INSTRUMENTS[o.inst || air.inst] ? o.inst || air.inst : 'violon';
      const sortie = o.out || this._hfOut(o.bus === 'amb' ? this.amb : o.bus === 'voix' ? this.voix : this.sfx);
      const bus = c.createGain(); bus.gain.value = 0; bus.connect(sortie);
      const { L, fin, temps } = horaire(air, Math.random);
      const depuis = Math.max(0, Math.min(o.depuis || 0, fin - 0.5));
      const t0 = c.currentTime + 0.06 + (o.delai || 0) - depuis, vol = o.vol === undefined ? 1 : o.vol, tDeb = t0 + depuis;
      // (au milieu d'un air : on arrive en fondu)
      bus.gain.setValueAtTime(depuis > 0 ? 0 : vol, tDeb); if (depuis > 0) bus.gain.linearRampToValueAtTime(vol, tDeb + 0.8);
      const J = INSTRUMENTS[nomI](this, bus, air, o);
      // les coups : le tambour (o.tambour) ; le chien de la vielle
      const coups = [];
      if (o.tambour) for (const [b, k] of grille(air, motifTambour(air), true)) coups.push([temps(b), (t) => coupTambour(this, t, k, 0.05 * o.tambour, bus)]);
      if (nomI === 'vielle' && o.chien !== false && J.coup) for (const [b, k] of grille(air, motifChien(air), false)) coups.push([temps(b), (t) => J.coup(t, typeof k === 'number' ? k : 1)]);
      coups.sort((a, b) => a[0] - b[0]);
      let i = 0, j = 0, h = 0, stop = Infinity, fini = false;
      while (i < L.length && L[i][0] < depuis - 1e-6) i++;
      while (j < coups.length && coups[j][0] < depuis) j++;
      const i0 = i;
      let avance = 1.2, attente = 300;
      const lot = () => {
        h = 0;
        if (!this.ctx || this.ctx !== c || fini) return;
        // (le premier lot est court : lancer un air ne doit pas coûter plus qu'une image)
        const lim = Math.min(this.offline ? Infinity : c.currentTime + avance, stop);
        avance = 3;
        try {
          for (; i < L.length && t0 + L[i][0] < lim; i++) {
            const [t, N, D, pos] = L[i];
            J.note(t0 + t, N, Math.min(D, stop - (t0 + t)), i > i0 ? L[i - 1][1] : null, L[i + 1] ? L[i + 1][1] : null, pos);
          }
          for (; j < coups.length && t0 + coups[j][0] < lim; j++) coups[j][1](t0 + coups[j][0]);
        } catch (e) { if (!this._a18err) { this._a18err = true; console.error('air', e); } }
        if ((i >= L.length && j >= coups.length) || t0 + (i < L.length ? L[i][0] : fin) >= stop) { fini = true; try { J.fin(Math.min(t0 + fin, stop)); } catch (e) { /* rien */ } return; }
        h = setTimeout(lot, attente);
        attente = 900;
      };
      lot();
      this.mark(sortie, t0 + fin + 1);
      return {
        t0, fin: t0 + fin, duree: fin, debut: tDeb,
        // s'arrêter à « quand » (heure audio ; maintenant par défaut), en fondu
        arreter(quand, fondu) {
          const q = Math.max(c.currentTime + 0.02, quand || 0), fd = fondu === undefined ? 0.6 : fondu;
          if (q >= this.fin) return;
          stop = q + fd; this.fin = stop;
          try { bus.gain.cancelScheduledValues(q); bus.gain.setValueAtTime(vol, q); bus.gain.linearRampToValueAtTime(0, q + fd); } catch (e) { /* rien */ }
          if (!fini && (i >= L.length || t0 + L[i][0] >= stop)) { fini = true; if (h) clearTimeout(h); try { J.fin(stop); } catch (e) { /* rien */ } }
          setTimeout(() => { try { bus.disconnect(); } catch (e) { /* rien */ } }, Math.max(0, (stop - c.currentTime) * 1000 + 1500));
        },
        // la fin de la partie en cours (heure audio), pour s'arrêter proprement
        finPartie(t) {
          const x = (t === undefined ? c.currentTime : t) - t0;
          for (const s of air.sections) { const ts = temps(s.t); if (ts > x + 0.5) return t0 + ts; }
          return t0 + fin;
        },
      };
    },
  });
  SoundEngine.A18 = { grille, motifTambour, motifChien, horaire };
}
