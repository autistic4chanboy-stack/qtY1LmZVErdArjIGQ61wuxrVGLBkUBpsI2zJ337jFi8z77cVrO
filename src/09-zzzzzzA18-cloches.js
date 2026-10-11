// ============================================================================
//  LES CLOCHES (A18) : de vraies cloches d'église, et des petites cloches qui
//  ne leur ressemblent pas.
//  Une cloche d'église est calculée une fois, en tâche de fond, par tranches
//  (le tampon « s_cloche », trois cloches : la grosse, la moyenne, la petite ;
//  22 050 Hz, jusqu'à seize secondes de queue) :
//   - ses partiels de cloche à tierce mineure (bourdon 0,5 ; fondamental 1 ;
//     tierce 1,2 ; quinte 1,5 ; nominal 2 ; dixième 2,5 ; onzième 2,67 ;
//     douzième 3 ; double octave 4 ; puis 5,33, 6, 6,67, 8…), chaque cloche un
//     peu fausse à sa façon (quelques cents par partiel) ;
//   - chaque partiel est un doublet (deux modes très proches : la cloche n'est
//     pas parfaitement ronde) : il bat lentement, de 0,3 à 3 Hz — le « oua-oua »
//     d'une cloche qui sonne ;
//   - les graves durent (le bourdon : près de trente secondes pour la grosse),
//     les aigus meurent vite ; une petite cloche s'éteint plus tôt ;
//   - le coup du battant : un éclat métallique (des dizaines de modes aigus,
//     très brefs), le choc du fer sur le bronze, un coup sourd.
//  Les autres hauteurs : la même cloche jouée plus vite ou plus lentement (plus
//  aiguë, elle s'éteint aussi plus vite, comme une plus petite). Tant que le
//  tampon n'est pas prêt : des oscillateurs (même table de partiels, en court).
//  API : sound.frapperCloche(t, f, v, out, o) (o : lp, coupe, cote) ;
//  sound.clocheTampon(i) ; l'angélus (_sAngelus) : trois fois trois coups,
//  puis la volée (deux cloches, trois l'Orédi) ; sound.bell(k) (les cloches du
//  jeu), hfCloche (glas, baptême, tocsin), sonV5 (offices, tocsin, la Cloche
//  du Jour), sonV3 (le Guet), le château (v4Cloche).
//  Les petites cloches : clochette du rémouleur (une cloche à main secouée),
//  sonnailles (tôle et bronze), sonnette de comptoir, sonnette du Cercle.
// ============================================================================
{
  const S = SoundEngine.SYN, T = SoundEngine.TAMPONS;
  // un hasard qui se répète (une cloche ne change pas d'un jour à l'autre)
  const alea = (s) => () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  // ---------------------------------------------------------------- les trois cloches du clocher
  // f : la note de frappe (le fondamental), Hz ; k : l'échelle des durées (une petite cloche s'éteint plus vite) ;
  // fin : la longueur naturelle (s) ; graine : sa façon d'être fausse
  SoundEngine.CLOCHES18 = [
    { nom: 'grosse', f: 196, k: 1, fin: 16, graine: 1871 },
    { nom: 'moyenne', f: 247, k: 0.8, fin: 13.5, graine: 2203 },
    { nom: 'petite', f: 294, k: 0.66, fin: 11, graine: 3307 },
  ];
  // les partiels : [rapport à la note de frappe, amplitude au coup, T60 (s) pour la grosse, battement du doublet (Hz),
  // écart propre (cents, ± au hasard de la cloche)]
  SoundEngine.PARTIELS18 = [
    [0.5, 0.22, 28, 0.35, 18],   // bourdon (hum)
    [1.0, 0.32, 15, 0.7, 14],    // fondamental (prime)
    [1.2, 0.52, 11, 1.1, 8],     // tierce mineure
    [1.5, 0.15, 5.5, 1.5, 30],   // quinte
    [2.0, 1.0, 8.5, 1.3, 0],     // nominal (la note qu'on entend, une octave au-dessus)
    [2.5, 0.34, 4.2, 1.9, 15],   // dixième
    [2.667, 0.3, 3.6, 2.1, 12],  // onzième
    [3.0, 0.58, 3.6, 1.8, 10],   // douzième
    [4.0, 0.48, 2.3, 2.5, 20],   // double octave
    [5.33, 0.34, 1.5, 2.8, 30],
    [6.0, 0.3, 1.2, 3, 35],
    [6.67, 0.22, 0.85, 3, 40],
    [8.0, 0.2, 0.62, 3, 45],
    [9.33, 0.13, 0.45, 3, 50],
    [10.7, 0.1, 0.35, 3, 50],
    [12.0, 0.08, 0.28, 3, 55],
    [13.4, 0.06, 0.22, 3, 60],
    [16.1, 0.045, 0.16, 3, 60],
  ];
  // une sinusoïde amortie (résonateur à deux pôles, par récurrence), par tranches ; t60 : le temps de perdre 60 dB
  function* modeG(d, sr, f, t60, a, ph, n0, i0) {
    if (!(f > 0) || f >= sr * 0.45 || !(a > 1e-7)) return;
    i0 = i0 || 0;
    const w = 2 * Math.PI * f / sr, r = Math.pow(10, -3 / (t60 * sr)), c = 2 * r * Math.cos(w), r2 = r * r;
    const n = Math.min(n0 - i0, Math.ceil(Math.log(1e-5 / a) / Math.log(r))), at = Math.max(2, Math.floor(sr * 0.0006));
    let y1 = a * Math.sin(ph), y2 = a * Math.sin(ph - w) / r;
    for (let j = 0; j < n; j++) {
      d[i0 + j] += j < at ? y1 * j / at : y1;
      const y = c * y1 - r2 * y2; y2 = y1; y1 = y;
      if ((j & 8191) === 8191) yield;
    }
  }
  // une cloche d'église (variante iv : 0 la grosse, 1 la moyenne, 2 la petite), dans d (fréquence sr)
  S.cloche18G = function* (d, sr, iv) {
    const C = SoundEngine.CLOCHES18[(iv | 0) % 3], R = alea(C.graine), f0 = C.f;
    const n = Math.min(d.length, Math.floor(C.fin * sr));
    // les partiels, chacun en doublet
    for (const [r, a, t60, bat, ec] of SoundEngine.PARTIELS18) {
      const f = f0 * r * Math.pow(2, (R() - 0.5) * 2 * ec / 1200), T60 = t60 * C.k * (0.88 + 0.24 * R());
      const m = 0.3 + 0.5 * R(), fb = f + bat * (0.7 + 0.6 * R()) * (R() < 0.5 ? -1 : 1);
      yield* modeG(d, sr, f, T60, a, 0.15 * R(), n);
      yield* modeG(d, sr, fb, T60 * (0.85 + 0.3 * R()), a * m, 0.15 * R(), n);
    }
    // l'éclat du coup : des modes aigus, serrés, très brefs (le bronze qui « clangue »)
    for (let j = 0; j < 22; j++) {
      const q = 18 + j * 1.3 + R(), f = f0 * q;
      if (f >= sr * 0.45) break;
      yield* modeG(d, sr, f, 0.3 * Math.pow(18 / q, 1.2) * C.k * (0.7 + 0.6 * R()), 0.1 * Math.pow(18 / q, 0.8) * (0.5 + 0.5 * R()), 0, n);
      if (j % 4 === 3) yield;
    }
    yield;
    // le fer du battant sur la pince : un choc bref, clair ; et le coup sourd (le battant, le joug) — un bruit tiré du
    // même hasard que la cloche (le tampon est ramené à une crête de 1 : sa crête, c'est ce coup ; elle ne doit pas
    // changer d'un calcul à l'autre)
    for (const [fc, q, tau, a] of [[3200, 0.7, 0.0028, 0.55], [1200, 0.9, 0.012, 0.3]]) {
      const filt = S.bq('bp', fc, q, sr), na = Math.max(1, 0.0006 * sr), k = Math.exp(-1 / (tau * sr));
      let e = 1;
      for (let j = 0; j < n; j++) { let env; if (j < na) env = j / na; else { e *= k; env = e; if (e < 1e-3) break; } d[j] += filt(R() * 2 - 1) * env * a; }
    }
    yield* modeG(d, sr, 72 + 30 * R(), 0.09, 0.25, 0, n);
    // la fin naturelle : un fondu sur les trois dernières secondes (plus rien après)
    const nf = Math.min(n, Math.floor(3 * sr)), i0 = n - nf;
    for (let i = 0; i < nf; i++) { const u = i / nf; d[i0 + i] *= 1 - u * u * (3 - 2 * u); if ((i & 8191) === 8191) yield; }
    d.fill(0, n);
  };
  // le tampon : seize secondes (la grosse) ; les autres finissent plus tôt (le silence de la fin est rogné)
  T.s_cloche = [16.0, (d, sr, iv) => synDerouler(S.cloche18G(d, sr, iv))];
  (SoundEngine.TAMPONS_PAS || (SoundEngine.TAMPONS_PAS = {})).s_cloche = S.cloche18G;
  if (SoundEngine.VARIANTES) SoundEngine.VARIANTES.s_cloche = 3;
  if (SoundEngine.SR_TAMPON) SoundEngine.SR_TAMPON.s_cloche = 22050;

  // ---------------------------------------------------------------- les niveaux
  // Chaque appel garde la sonie d'avant (mesurée hors ligne, pondérée K, sur les premières secondes du coup ; le tampon
  // a sa crête au coup du battant, d'où des volumes plus grands qu'avant) : la cloche gagne de l'éclat, pas du volume.
  // osc : les oscillateurs de secours, au niveau du tampon.
  SoundEngine.CLOCHE18 = { gain: 1, osc: 0.68 };
  // le glas, le baptême, le tocsin (hfCloche) : selon la hauteur (Hz → facteur)
  const HF_NIV = [[150, 1.82], [330, 2.88], [440, 4.4]];
  const nivHf = (f) => {
    if (f <= HF_NIV[0][0]) return HF_NIV[0][1];
    for (let i = 1; i < HF_NIV.length; i++) if (f <= HF_NIV[i][0]) { const [fa, a] = HF_NIV[i - 1], [fb, b] = HF_NIV[i], u = Math.log(f / fa) / Math.log(fb / fa); return a * Math.pow(b / a, u); }
    return HF_NIV[HF_NIV.length - 1][1];
  };

  Object.assign(SoundEngine.prototype, {
    // le tampon de la cloche i, s'il est prêt (sinon : demandé à la tâche de fond, et null)
    clocheTampon(i) {
      const arr = this._bufs && this._bufs.s_cloche, b = arr && arr[i];
      if (b) return b;
      if (this._sDemander) this._sDemander('T:s_cloche');
      return null;
    },
    // la cloche la plus proche d'une hauteur f, et la vitesse de lecture qui donne f
    _clocheDe(f) {
      const C = SoundEngine.CLOCHES18;
      let i = 0, e0 = 1e9;
      for (let j = 0; j < C.length; j++) { const e = Math.abs(Math.log(f / C[j].f)); if (e < e0) { e0 = e; i = j; } }
      // (plus grave que la grosse : la grosse, ralentie ; plus aiguë que la petite : la petite, accélérée)
      return { i, rate: f / C[i].f };
    },
    // frapper une cloche d'église de hauteur f (Hz, la note de frappe) à t, volume v, vers out.
    // o.lp : un passe-bas (lointain, étouffé) ; o.coupe : on la coupe (fondu de deux secondes) au bout de tant de
    // secondes (une volée : le coup suivant la recouvre) ; renvoie l'heure où elle se tait
    frapperCloche(t, f, v, out, o) {
      o = o || SoundEngine.NUL;
      const c = this.ctx, { i, rate } = this._clocheDe(f), b = this.clocheTampon(i);
      out = out || this.amb;
      if (!b) return this._clocheOsc(t, f, v, out, o);
      const s = c.createBufferSource(), g = c.createGain(), V = v * SoundEngine.CLOCHE18.gain;
      s.buffer = b; s.playbackRate.value = rate; g.gain.value = V;
      let node = s;
      if (o.lp) { const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = this.nyq(o.lp); fl.Q.value = 0.5; s.connect(fl); node = fl; }
      node.connect(g).connect(out);
      let fin = t + b.duration / rate;
      if (o.coupe && t + o.coupe + 2 < fin) { g.gain.setValueAtTime(V, t + o.coupe); g.gain.linearRampToValueAtTime(0, t + o.coupe + 2); fin = t + o.coupe + 2.05; }
      s.start(t); s.stop(fin);
      this.mark(out, fin);
      return fin;
    },
    // la même, en oscillateurs (le tampon n'est pas encore prêt) : les partiels principaux, en court
    _clocheOsc(t, f, v, out, o) {
      const P = SoundEngine.PARTIELS18, V = v * SoundEngine.CLOCHE18.osc, k = Math.min(1.6, 196 / f), lim = this.ctx.sampleRate * 0.45;
      const dest = o.lp ? this.lp(o.lp, out) : out;
      for (let j = 0; j < 12; j++) {
        const [r, a, t60, bat] = P[j], ff = f * r, d = Math.min(o.coupe || 9, t60 * k * 0.45);
        if (ff > lim) break;
        this.tone(t, 'sine', ff, ff * 0.9995, d, V * a * 0.35, dest, 0.002);
        if (j < 5) this.tone(t, 'sine', ff + bat, ff + bat, d * 0.9, V * a * 0.18, dest, 0.002);
      }
      this.noiseHit(t, 0.03, 'bandpass', Math.min(4200, f * 14), 0.8, V * 0.25, dest);
      const fin = t + Math.min(o.coupe || 9, 28 * k * 0.45);
      this.mark(out, fin);
      return fin;
    },

    // ---------------------------------------------------------------- les cloches du jeu
    // la cloche de l'église, au clocher (événements, scènes) : la grosse
    bell(k = 1) {
      if (!this.ok) return;
      const t = this.at(), R = Math.random, P = this._scope ? null : this.clocher();
      const out = P ? this.emit(P, this.B.amb.inp, { att: 'aucune', dur: 17 }) : this.amb;
      this.frapperCloche(t, 196 * (0.995 + R() * 0.01), 0.275 * k, out, { lp: 5200 });
    },
    // une cloche d'église d'une hauteur donnée (le glas, le baptême, le tocsin) ; placée par l'appelant (hfSon)
    hfCloche(f = 196, k = 1) {
      if (!this.ok) return;
      const t = this.at(), out = this._hfOut(this.amb);
      this.frapperCloche(t, f, 0.062 * k * nivHf(f), out, f > 380 ? { coupe: 4 } : SoundEngine.NUL);
    },
    // le château : la cloche du Guet, qu'on tire à la corde
    v4Cloche(pos, k) {
      this.v4Ici(pos, () => { this.frapperCloche(this.at(0.02), 196, 0.26 * (k || 1), this.sfx, { lp: 4200 }); });
    },
  });

  // ---------------------------------------------------------------- l'angélus
  // trois fois trois coups (la grosse, battant tiré à la main), puis la volée : deux cloches (trois l'Orédi) qui se
  // balancent, chacune à son pas (deux coups par balancement, l'un un rien plus tôt que l'autre), qui prennent leur
  // élan puis s'apaisent ; la bouche tournée vers nous, la cloche est plus claire.
  // plan(seed, n) : [[t, cloche, volume, côté], …] (côté 1 : la bouche vers nous)
  SoundEngine.planAngelus = function (seed, n) {
    const R = alea(seed | 0), L = [];
    let t = 0;
    for (let g = 0; g < 3; g++) {
      for (let k = 0; k < 3; k++) { L.push([t, 0, 1 - 0.04 * k, 1]); t += 2.25 + 0.25 * R(); }
      t += g < 2 ? 4.2 + 1.2 * R() : 3.5 + R();
    }
    const v0 = t, D = 32 + 6 * R();
    // le pas de chaque cloche (s entre deux coups), le départ, le côté vers nous
    const PAS = [1.24, 1.02, 0.86], DEP = [0, 1.6 + 0.6 * R(), 3.1 + 0.8 * R()];
    for (let b = 0; b < n; b++) {
      let tt = v0 + DEP[b], k = 0;
      const p = PAS[b] * (0.97 + 0.06 * R()), asym = 0.05 + 0.05 * R(), cote0 = R() < 0.5 ? 0 : 1, fin = v0 + D - 0.8 * b;
      while (tt < fin + 6 * p) {
        const reste = (fin - tt) / p;
        // l'élan : les premiers coups plus doux ; la fin : le battant touche de moins en moins fort
        let v = Math.min(1, 0.42 + 0.16 * k);
        if (reste < 0) v *= Math.max(0.15, 0.85 + 0.14 * reste);
        if (v < 0.2) break;
        const cote = (k + cote0) % 2;
        L.push([tt, b, v * (cote ? 1 : 0.78), cote, 1]);
        tt += p * (1 + (k % 2 ? asym : -asym)) * (0.985 + 0.03 * R()) * (reste < 0 ? 1.04 : 1);
        k++;
      }
    }
    L.sort((a, b) => a[0] - b[0]);
    return L;
  };
  Object.assign(SoundEngine.prototype, {
    _sAngelus(inside) {
      const P = this.clocher && this.clocher(), L = this.L;
      if (!P || !this.ok) return;
      const fete = typeof cal !== 'undefined' && cal.is ? !!cal.is('messe') : false, nb = fete ? 3 : 2;
      // (pas encore calculées : elles le seront en tâche de fond ; cette fois, on se tait)
      let pret = true;
      for (let i = 0; i < nb; i++) if (!this.clocheTampon(i)) pret = false;
      if (!pret) return;
      const d = Math.hypot(P[0] - L.x, P[2] - L.z);
      if (d > 1100) return;
      const plan = SoundEngine.planAngelus((Math.random() * 1e9) | 0, nb), duree = plan[plan.length - 1][0] + 17;
      const c = this.ctx, em = this.emit(P, this.B.amb.inp, { att: 'phys', ref: 45, roll: 1, dur: duree });
      // dedans : les murs ne laissent passer que le grave
      let out = em;
      if (inside) { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 650; f.Q.value = 0.6; f.connect(em); out = f; }
      // la bouche tournée ailleurs : moins claire
      const loin = c.createBiquadFilter(); loin.type = 'lowpass'; loin.frequency.value = this.nyq(2600); loin.Q.value = 0.5; loin.connect(out);
      const v = 0.143 * (inside ? 0.37 : 1), F = SoundEngine.CLOCHES18;
      this.planifier(plan.map(([t, b, k, cote, volee]) => [t, (tt) => this.frapperCloche(tt, F[b].f, v * k * (volee ? 0.5 : 1), cote ? out : loin, volee ? { coupe: 5.5 } : SoundEngine.NUL)]), 0.05);
      this.mark(em, c.currentTime + duree);
      this._sNote('angelus', 'ville');
    },
    // des actions à leur heure (s, depuis maintenant + delai) : programmées quatre secondes d'avance, le reste par une
    // minuterie (peu de nœuds vivants à la fois) ; d'un coup pour un rendu hors ligne. Renvoie { arreter() }.
    planifier(L, delai) {
      const c = this.ctx, t0 = c.currentTime + (delai || 0.05);
      let i = 0, h = 0, stop = false;
      const lot = () => {
        h = 0;
        if (stop || !this.ctx || this.ctx !== c) return;
        const lim = this.offline ? Infinity : c.currentTime + 4;
        for (; i < L.length && t0 + L[i][0] < lim; i++) { try { L[i][1](t0 + L[i][0]); } catch (e) { /* un son n'est pas essentiel */ } }
        if (i < L.length) h = setTimeout(lot, 1500);
      };
      lot();
      return { t0, arreter() { stop = true; if (h) clearTimeout(h); } };
    },
  });

  // ---------------------------------------------------------------- les cloches des autres lieux
  // Basse-Fosse : les offices (deux cloches), le tocsin, la Cloche du Jour (énorme : la grosse, une octave plus bas)
  if (typeof sonV5 !== 'undefined') {
    sonV5.cloche = function (pos, f, k, etouffe) {
      this.la(pos, () => {
        const e = etouffe || 0;
        sound.frapperCloche(sound.at(0.02), f, 0.068 * (k || 1) * (1 - e * 0.55), sound.sfx, e > 0 ? { lp: lerp(2400, 380, e) } : { lp: 6000 });
      });
    };
    sonV5.tocsin = function (pos, n) {
      if (!this.ok()) return;
      for (let i = 0; i < (n || 8); i++) setTimeout(() => this.la(pos, () => sound.frapperCloche(sound.at(0.02), 233, 0.051, sound.sfx, { coupe: 3 })), i * 520);
    };
    sonV5.grandeCloche = function (pos) {
      this.la(pos, () => sound.frapperCloche(sound.at(0.02), 98, 0.1, sound.sfx, SoundEngine.NUL));
    };
  }
  // le Guet (le ver) : la cloche qu'on sonne pour qu'il rentre, et son écho
  if (typeof sonV3 !== 'undefined') {
    sonV3.cloche = function (pos) {
      this.la(pos, 120, () => {
        const t = sound.at(0.02);
        sound.frapperCloche(t, 147, 0.177, sound.sfx, SoundEngine.NUL);
        sound.frapperCloche(t + 1.9, 147 * 1.003, 0.1, sound.sfx, { lp: 2400 });
      }, 18);
    };
  }

  // ---------------------------------------------------------------- les petites cloches
  // Une petite cloche n'est pas une cloche d'église : un seul « ding » clair, des partiels très écartés (une coupe de
  // laiton, une boule de tôle), qui s'éteint en une seconde ou deux, sans bourdon.
  Object.assign(SoundEngine.prototype, {
    // un coup de petite cloche : f (Hz), partiels P [[rapport, ampl., durée]…], v, out ; un doublet sur le premier
    _petiteCloche(t, f, P, v, out, bat) {
      const lim = this.ctx.sampleRate * 0.45;
      for (const [r, a, d] of P) { const ff = f * r; if (ff < lim) this.tone(t, 'sine', ff, ff * 0.9998, d, v * a, out, 0.0012); }
      if (bat) this.tone(t, 'sine', f + bat, f + bat, P[0][2] * 0.85, v * P[0][1] * 0.45, out, 0.0012);
      this.noiseHit(t, 0.008, 'bandpass', Math.min(7000, f * 3.2), 1.2, v * 0.5, out);
    },
    // la clochette du rémouleur : une cloche à main en laiton qu'on secoue (le battant frappe d'un côté puis de
    // l'autre, irrégulièrement, de plus en plus doucement)
    hfClochette(k = 1) {
      if (!this.ok) return;
      const t = this.at(), out = this._hfOut(this.sfx), R = Math.random, f = 1480 + R() * 80;
      const P = [[1, 1, 1.1], [2.32, 0.42, 0.55], [4.18, 0.22, 0.3], [6.4, 0.08, 0.15]];
      let tt = t;
      for (let i = 0; i < 9; i++) {
        this._petiteCloche(tt, f * (i % 2 ? 1.003 : 1), P, 0.0072 * k * (1 - i * 0.06) * (0.8 + R() * 0.3), out, 2.2);
        tt += 0.11 + R() * 0.06 + (i === 4 ? 0.25 : 0);
      }
    },
    // les sonnailles d'un troupeau : des cloches de tôle (un « tonk » sec, sourd, sans tenue) et une de bronze
    hfSonnailles(k = 1, n = 6) {
      if (!this.ok) return;
      const t = this.at(), R = Math.random, out = this._hfOut(this.amb);
      for (let i = 0; i < n; i++) {
        const tt = t + R() * 2.4, bronze = i === 0 && R() < 0.5, f = bronze ? 820 + R() * 200 : 520 + R() * 380;
        const P = bronze ? [[1, 1, 0.9], [2.06, 0.5, 0.5], [2.74, 0.35, 0.35], [3.94, 0.15, 0.2]] : [[1, 1, 0.22], [1.48, 0.7, 0.16], [2.1, 0.55, 0.12], [2.76, 0.4, 0.09], [3.62, 0.25, 0.06]];
        this._petiteCloche(tt, f, P, 0.023 * k * (0.6 + R() * 0.4), out, bronze ? 1.5 : 0);
        this.noiseHit(tt, 0.025, 'bandpass', f * 2.2, 1.4, 0.0154 * k, out);
      }
    },
    // une clochette (à la ceinture, à la cheville) : de petits tintements clairs, irréguliers, qui s'espacent
    clochette(k = 1) {
      if (!this.ok) return;
      const t = this.at(), out = this._hfOut(this.sfx), R = Math.random, f = 2350 + R() * 300;
      const P = [[1, 1, 0.55], [2.42, 0.35, 0.24], [4.3, 0.12, 0.1]];
      let tt = t;
      for (let i = 0, n = 3 + ((R() * 3) | 0); i < n; i++) { this._petiteCloche(tt, f * (1 + (R() - 0.5) * 0.004), P, 0.01 * k * (1 - i * 0.12), out, 4); tt += 0.16 + R() * 0.22 + i * 0.05; }
    },
    // la sonnette de comptoir (la loge de l'hôtel, une boutique) : un timbre d'acier frappé d'en haut, « ding »
    sonnette(k = 1) {
      if (!this.ok) return;
      const t = this.at(0.01), out = this._scope ? this.sfx : this.ui || this.sfx, f = 2630 + Math.random() * 60;
      this._petiteCloche(t, f, [[1, 1, 1.8], [2.71, 0.3, 0.7], [5.03, 0.12, 0.3]], 0.03 * k, out, 3.1);
      this.noiseHit(t, 0.006, 'highpass', 5000, 0.8, 0.02 * k, out);
    },
  });
}
