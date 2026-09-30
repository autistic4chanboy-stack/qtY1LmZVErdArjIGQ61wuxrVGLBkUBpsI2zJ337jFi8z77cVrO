// ============================================================================
//  AMBIANCES EN 3D : des sources placées autour de l'écouteur plutôt qu'un fond
//  plat. Le vent vient d'un côté (celui de l'orage), la pluie tombe tout autour
//  (et sur le toit quand on est dedans), la rivière coule là où elle coule, le
//  lac clapote à la rive, le feu crépite à sa place, les oiseaux chantent dans
//  les arbres, les grillons dans l'herbe, la chouette au loin, les gouttes
//  dans les grottes. Tout respire : fondus lents, rafales, jamais pareil.
//  Le lieu règle la réverbération (dehors, forêt, montagne, pièce, grande
//  salle, grotte), en fondu.
//  API : sound.source(clé, type, pos, k [, o]) — une boucle placée (types :
//  riviere, clapotis, feu, vent, feuilles, grillon, bourdon), à rafraîchir au
//  moins toutes les secondes ; elle s'éteint seule sinon.
// ============================================================================

// boucles (sans raccord) : [durée, remplissage]
SoundEngine.BOUCLES = {
  // ruisseau : un gargouillis grave, des éclats, beaucoup de petites bulles qui montent
  riviere: [6, (d, sr, D) => {
    const R = Math.random, S = SoundEngine.SYN, n = d.length, lo = S.bq('bp', 450, 0.7, sr), hi = S.bq('bp', 2200, 0.9, sr);
    let m1 = 0.5, m2 = 0.5, v1 = 0, v2 = 0;
    for (let i = 0; i < n; i++) {
      if (i % 64 === 0) { v1 += (R() - 0.5) * 0.08 - v1 * 0.02; v2 += (R() - 0.5) * 0.2 - v2 * 0.06; m1 = clamp(m1 + v1 * 0.1, 0.25, 1); m2 = clamp(m2 + v2 * 0.1, 0.1, 1); }
      const x = R() * 2 - 1;
      d[i] += lo(x) * 0.5 * m1 + hi(x) * 0.12 * m2;
    }
    for (let k = 0, N = Math.floor(D * 45); k < N; k++) { const f = 300 + Math.pow(R(), 1.6) * 1400, t = R() * (D - 0.06); S.note(d, sr, t, 0.012 + R() * 0.03, f, f * (1.3 + R() * 0.8), 0.06 + R() * 0.12, { att: 0.15, dec: 2, c: 0.5 }); }
  }],
  // clapotis : de petites vagues qui viennent mourir à la rive
  clapotis: [8, (d, sr, D) => {
    const R = Math.random, S = SoundEngine.SYN, lo = S.bq('lp', 380, 0.7, sr), n = d.length;
    let m = 0.3, v = 0;
    for (let i = 0; i < n; i++) { if (i % 128 === 0) { v += (R() - 0.5) * 0.05 - v * 0.03; m = clamp(m + v * 0.1, 0.1, 0.5); } d[i] += lo(R() * 2 - 1) * 0.25 * m; }
    for (let t = 0.2 + R() * 0.5; t < D - 0.6; t += 1.1 + R() * 1.6) {
      S.bruit(d, sr, t, 0.08 + R() * 0.06, 0.25 + R() * 0.15, 0.5 + R() * 0.3, S.bq('lp', 500 + R() * 200, 0.7, sr));
      S.bruit(d, sr, t + 0.06, 0.03, 0.12, 0.12 + R() * 0.08, S.bq('bp', 1100 + R() * 400, 0.8, sr));
      for (let k = 0; k < 3; k++) { const f = 500 + R() * 800; S.note(d, sr, t + 0.1 + R() * 0.3, 0.02 + R() * 0.02, f, f * 1.5, 0.04 + R() * 0.04, { att: 0.12, dec: 2 }); }
    }
  }],
  // feu : un souffle grave qui ondule, des crépitements, parfois une bûche qui craque
  feu: [5, (d, sr, D) => {
    const R = Math.random, S = SoundEngine.SYN, n = d.length, lo = S.bq('lp', 260, 0.7, sr), hs = S.bq('bp', 1800, 0.6, sr);
    let m = 0.5, v = 0;
    for (let i = 0; i < n; i++) { if (i % 64 === 0) { v += (R() - 0.5) * 0.12 - v * 0.05; m = clamp(m + v * 0.1, 0.2, 1); } const x = R() * 2 - 1; d[i] += lo(x) * 0.9 * m + hs(x) * 0.02; }
    for (let k = 0, N = Math.floor(D * 14); k < N; k++) { const a = Math.pow(R(), 3) * 0.9 + 0.05; S.bruit(d, sr, R() * (D - 0.02), 0.0003, 0.0015 + R() * 0.004, a, S.bq('bp', 900 + R() * 2600, 1.1, sr)); }
    for (let k = 0, N = 1 + ((R() * 2) | 0); k < N; k++) { const t = 0.3 + R() * (D - 0.8); S.mode(d, sr, t, 380 + R() * 500, 0.02, 0.35); S.bruit(d, sr, t, 0.0005, 0.01, 0.4, S.bq('bp', 1500, 0.8, sr)); }
  }],
  // gouttes de pluie tout près (sur l'herbe, sur les feuilles, dans les flaques)
  gouttes: [3, (d, sr, D) => {
    const R = Math.random, S = SoundEngine.SYN, b = S.bq('bp', 2600, 0.9, sr);
    for (let k = 0, N = Math.floor(D * 28); k < N; k++) {
      const t = R() * (D - 0.03);
      if (R() < 0.3) { const f = 1400 + R() * 1600; S.note(d, sr, t, 0.012 + R() * 0.012, f, f * 0.7, 0.1 + R() * 0.2, { att: 0.08, dec: 2.5 }); }
      else S.bruit(d, sr, t, 0.0003, 0.0015 + R() * 0.002, 0.2 + R() * 0.5, b);
    }
    S.lp1(d, sr, 6500);
  }],
  // feuillage agité par une rafale
  feuilles: [4, (d, sr) => {
    const R = Math.random, S = SoundEngine.SYN, b = S.bq('bp', 2400, 0.7, sr), n = d.length;
    let m = 0.5, v = 0;
    for (let i = 0; i < n; i++) { if (i % 32 === 0) { v += (R() - 0.5) * 0.35 - v * 0.2; m = clamp(m + v * 0.1, 0, 1); } d[i] += b(R() * 2 - 1) * m * m; }
    S.lp1(d, sr, 5500);
  }],
  // un grillon qui chante tout seul
  grillon: [2, (d, sr, D) => {
    const R = Math.random, S = SoundEngine.SYN, f = 3600 + R() * 500, per = 0.42 + R() * 0.3;
    for (let t = 0.03 + R() * 0.2; t < D - 0.12; t += per * (0.95 + R() * 0.1)) for (let p = 0, n = 3 + ((R() * 2) | 0); p < n; p++) S.note(d, sr, t + p * 0.027, 0.016, f, f * 0.99, 0.5, { att: 0.25, dec: 1.2 });
  }],
  // un long bruit doux (vent, lit de pluie) : assez long pour qu'on n'entende jamais la boucle
  bruit: [9, (d, sr) => {
    const R = Math.random, n = d.length;
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < n; i++) { const x = R() * 2 - 1; b0 = 0.99765 * b0 + x * 0.099046; b1 = 0.963 * b1 + x * 0.2965164; b2 = 0.57 * b2 + x * 1.0526913; d[i] = (b0 + b1 + b2 + x * 0.1848) * 0.6 + x * 0.25; }
    SoundEngine.SYN.lp1(d, sr, 9000);
  }],
  // bourdon grave des souterrains (on le sent plus qu'on ne l'entend)
  bourdon: [7, (d, sr) => {
    const R = Math.random, S = SoundEngine.SYN, lo = S.bq('lp', 120, 0.7, sr), n = d.length;
    let m = 0.5, v = 0;
    for (let i = 0; i < n; i++) { if (i % 256 === 0) { v += (R() - 0.5) * 0.03 - v * 0.01; m = clamp(m + v, 0.3, 1); } d[i] += lo(R() * 2 - 1) * m; }
  }, 8000],
};
// volume de chaque boucle (k = 1)
SoundEngine.VOL_BOUCLES = { riviere: 0.2, clapotis: 0.22, feu: 0.22, gouttes: 0.07, feuilles: 0.06, grillon: 0.12, bourdon: 0.05, vent: 0.14 };
// les oiseaux selon le milieu : [sorte, poids]
SoundEngine.OISEAUX = {
  foret: [['merle', 3], ['mesange', 3], ['pinson', 3], ['pic', 1], ['tourterelle', 1], ['coucou', 0.4]],
  bouleaux: [['mesange', 3], ['pinson', 3], ['merle', 2], ['pic', 1.2]],
  plaine: [['alouette', 2], ['merle', 1], ['pinson', 1], ['tourterelle', 1], ['coucou', 0.3]],
  ferme: [['moineau', 3], ['merle', 1.5], ['tourterelle', 2], ['mesange', 1]],
  ville: [['moineau', 4], ['tourterelle', 1], ['merle', 1]],
  lande: [['alouette', 3], ['pinson', 1]],
  lac: [['merle', 1], ['mesange', 1], ['pinson', 1]],
  marais: [['merle', 1], ['mesange', 1]],
  hauteurs: [['alouette', 1]],
};

Object.assign(SoundEngine.prototype, {
  // ---------------------------------------------------------------- boucles placées
  boucleTampon(nom) {
    const key = 'B_' + nom;
    if (this._bufs[key]) return this._bufs[key];
    const [dur, fill, srB] = SoundEngine.BOUCLES[nom], sr = Math.min(this.ctx.sampleRate, srB || SoundEngine.SR_SYNTH), n = Math.floor(dur * sr), X = Math.floor(0.25 * sr);
    const tmp = new Float32Array(n + X);
    fill(tmp, sr, dur + 0.25);
    const b = this.ctx.createBuffer(1, n, sr), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = tmp[i];
    for (let i = 0; i < X; i++) { const a = i / X; d[i] = tmp[i] * Math.sqrt(a) + tmp[n + i] * Math.sqrt(1 - a); } // le raccord : fondu enchaîné
    SoundEngine.SYN.norm(d, 1);
    return (this._bufs[key] = b);
  },
  _boucleNew(type, pos, o) {
    const c = this.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    if (type === 'vent') { s.buffer = this.boucleTampon('bruit'); f.type = 'lowpass'; f.frequency.value = 400; f.Q.value = 0.6; }
    else { s.buffer = this.boucleTampon(type); f.type = 'lowpass'; f.frequency.value = this.nyq(o.lp || 20000); f.Q.value = 0.5; }
    s.loop = true; s.playbackRate.value = o.rate || 1;
    g.gain.value = 0;
    s.connect(f).connect(g);
    const dest = o.dest || this.B.amb.inp;
    let em = null;
    if (pos) { em = this.tenir(pos, dest, { att: o.att || 'phys', ref: o.ref || 3, roll: o.roll }); g.connect(em.inp); }
    else g.connect(dest);
    s.start(c.currentTime + 0.02, Math.random() * s.buffer.duration);
    return { s, f, g, em, type, vu: 0, niv: 0 };
  },
  // une boucle d'ambiance placée (clé unique), niveau k ; à rafraîchir, sinon elle s'éteint en fondu
  source(cle, type, pos, k, o) {
    if (!this.ok || !SoundEngine.BOUCLES[type] && type !== 'vent') return null;
    o = o || {};
    const M = this.sources || (this.sources = new Map()), now = this.ctx.currentTime;
    let x = M.get(cle);
    if (!x) {
      if (!(k > 0.002)) return null;
      x = this._boucleNew(type, pos ? this.pos3(pos) : null, o);
      M.set(cle, x);
    }
    x.vu = now; x.niv = k;
    if (o.lp !== undefined && x.lp !== o.lp) { if (x.lp !== undefined) x.f.frequency.setTargetAtTime(this.nyq(o.lp), now, 0.25); x.lp = o.lp; } // on entre, on sort : la boucle s'assourdit ou s'ouvre
    const cible = Math.max(0, k) * (o.vol || SoundEngine.VOL_BOUCLES[type] || 0.1);
    if (x.cible === undefined || Math.abs(cible - x.cible) > Math.max(0.0004, x.cible * 0.03)) { x.cible = cible; x.g.gain.setTargetAtTime(cible, now, o.tau || 0.8); }
    if (pos && x.em) {
      const P = this.pos3(pos);
      if (P && Math.hypot(P[0] - x.em.pos[0], P[1] - x.em.pos[1], P[2] - x.em.pos[2]) > (o.pas || 0.25)) this._place(x.em, P, true);
    }
    return x;
  },
  _sourcesTick() {
    if (!this.sources) return;
    const now = this.ctx.currentTime;
    for (const [cle, x] of this.sources) {
      let fin = now - x.vu > 1.6;
      if (!fin) { if (x.niv <= 0.002) { x.zero = x.zero || now; fin = now - x.zero > 3; } else x.zero = 0; }
      if (!fin) continue;
      this.sources.delete(cle);
      x.g.gain.cancelScheduledValues(now); x.g.gain.setTargetAtTime(0, now, 0.35);
      try { x.s.stop(now + 2); } catch (e) { /* déjà */ }
      const em = x.em;
      if (em) setTimeout(() => this.lacher(em), 2300);
    }
  },
  // tout couper (changement de partie)
  sourcesStop() { if (!this.sources) return; for (const x of this.sources.values()) x.vu = -1e9; this._sourcesTick(); },

  // ---------------------------------------------------------------- chaque image
  update(dt, E) {
    if (!this.ok) return;
    // l'écouteur suit le joueur si aucune image n'a été rendue récemment (sinon : la caméra, voir Renderer.render)
    try {
      if (!(performance.now() - (this._rendT || 0) < 250) && typeof game !== 'undefined' && game.player && game.world) { const p = game.player; this.ecoute(p.eyePos(), p.yaw, p.pitch); }
    } catch (e) { /* rien */ }
    this.suivre();
    const S = this.sc || (this.sc = { acc: 0, lieuT: 0, oiseauT: 2, nuitT: 4, chouetteT: 30, eauT: 0, feuT: 0, arbres: [], arbresT: 0, arbresP: null, rafale: 0, rafaleT: 20, rafaleA: 0, rafaleS: 1, grillons: [], gouttesT: 0, vieux: 0, bioT: 0, caveT: 3 });
    S.acc += dt;
    if (S.acc < 0.1) return;
    const d = S.acc;
    S.acc = 0;
    try { this._scene(d, E, S); } catch (e) { if (!this._sceneErr) { this._sceneErr = true; console.error('son (scène)', e); } }
  },
  _scene(dt, E, S) {
    const now = this.ctx.currentTime, R = Math.random, B = this.bio || {}, L = this.L;
    const G = typeof game !== 'undefined' ? game : null, w = G && G.world, p = G && G.player;
    if (!w || !p) return;
    const ferme = G.kind === 'farm', mondeAPart = typeof mondes !== 'undefined' && mondes.cur;
    const under = !!(p.underground || (ferme && B.under));
    const inside = !!E.inside && !under;
    const dehors = !inside && !under;
    const biome = ferme ? B.biome || 'plaine' : 'plaine';
    const quiet = !(E.day > 0) && !(E.night > 0); // nuit rouge, Envers, temps arrêté, autres mondes
    const calme = 1 - clamp((E.rain || 0) * 1.5, 0, 1);
    // les tampons se calculent un à un au début de la partie, quand le navigateur a le temps (entre deux images)
    if (!this._chaud && !this._chauffeEnCours) {
      if (typeof requestIdleCallback === 'function') {
        this._chauffeEnCours = true;
        const f = (dl) => {
          let n = this.chauffer();
          while (n > 0 && dl.timeRemaining() > 4) n = this.chauffer();
          if (n > 0) requestIdleCallback(f, { timeout: 1500 }); else { this._chaud = true; this._chauffeEnCours = false; }
        };
        requestIdleCallback(f, { timeout: 1500 });
      } else if (!this.chauffer()) this._chaud = true;
    }
    // ---- le lieu : la réverbération
    S.lieuT -= dt;
    if (S.lieuT <= 0) { S.lieuT = 0.3; this.setLieu(this._lieuAuto(w, p, under, inside, biome, mondeAPart)); }
    // ---- le vent : seulement dans l'orage, sur les hauteurs, et par rafales ; il vient d'un côté
    const haut = biome === 'hauteurs' || (E.height || 0) > 55;
    S.rafaleT -= dt;
    if (S.rafaleT <= 0 && S.rafale <= 0) {
      S.rafaleT = 25 + R() * 50;
      if (dehors && !quiet && R() < (haut ? 0.9 : biome === 'lande' || biome === 'plaine' ? 0.6 : 0.45)) { S.rafale = 4 + R() * 5; S.rafaleD = S.rafale; S.rafaleA = R() * TAU; S.rafaleS = R() < 0.5 ? -1 : 1; }
    }
    let gust = 0;
    if (S.rafale > 0) { S.rafale -= dt; const u = 1 - S.rafale / S.rafaleD; gust = Math.sin(Math.PI * clamp(u, 0, 1)); }
    const tw = now * 0.9, souffle = clamp(0.5 + 0.32 * Math.sin(tw * 0.21) * Math.sin(tw * 0.067 + 1.3) + 0.18 * Math.sin(tw * 0.53 + 2.1), 0, 1);
    const orage = mondeAPart ? 0 : clamp(E.storm || 0, 0, 1);
    let vent = orage * (0.55 + 0.45 * souffle) + (haut ? 0.28 + 0.22 * souffle : 0) + gust * 0.38;
    if (under) vent = 0;
    if (inside) vent *= 0.35;
    const wa = (typeof weather !== 'undefined' && weather.windAngle !== undefined ? weather.windAngle : 0) + (S.rafale > 0 ? S.rafaleA + S.rafaleS * (1 - S.rafale / S.rafaleD) * 1.6 : 0);
    const vpos = [L.x + Math.cos(wa) * 14, L.y + 3, L.z + Math.sin(wa) * 14];
    const vx = this.source('vent', 'vent', vpos, vent, { att: 'aucune', tau: 0.6 });
    if (vx) vx.f.frequency.setTargetAtTime((inside ? 160 : 230) + 520 * clamp(souffle * orage + gust * 0.8 + (haut ? 0.3 : 0), 0, 1), now, 0.6);
    // un second souffle, de l'autre côté, plus sifflant (orage, sommets)
    const v2 = orage * 0.6 + (haut ? 0.35 : 0);
    const vx2 = this.source('vent2', 'vent', [L.x - Math.cos(wa + 0.7) * 16, L.y + 6, L.z - Math.sin(wa + 0.7) * 16], under ? 0 : v2 * (0.4 + 0.6 * souffle) * (inside ? 0.3 : 1), { att: 'aucune', tau: 0.8, vol: 0.05 });
    if (vx2) { vx2.f.type = 'bandpass'; vx2.f.Q.value = 5; vx2.f.frequency.setTargetAtTime(480 + 520 * souffle, now, 1.2); }
    // le feuillage, pendant la rafale, dans les arbres
    const bois = biome === 'foret' || biome === 'bouleaux';
    this.source('feuilles', 'feuilles', [L.x + Math.cos(wa + 0.3) * 7, L.y + 5, L.z + Math.sin(wa + 0.3) * 7], dehors && bois ? gust * 0.9 + orage * 0.5 : 0, { att: 'aucune', tau: 0.7 });
    // ---- la pluie : un lit large, et des gouttes tout autour (sur le toit quand on est à l'abri)
    this._pluie(dt, E, S, under, inside, now);
    // ---- l'eau : la rivière qui coule, le lac qui clapote
    S.eauT -= dt;
    if (S.eauT <= 0) { S.eauT = 0.5; this._eau(w, p, S, under); }
    if (S.riv) this.source('riviere', 'riviere', S.riv.p, S.riv.k * (inside ? 0.35 : 1), { ref: 6, roll: 0.9, lp: inside ? 1200 : 20000 });
    if (S.rive) this.source('clapotis', 'clapotis', S.rive.p, S.rive.k * (inside ? 0.3 : 1) * (E.storm > 0.5 ? 1.5 : 1), { ref: 4, roll: 0.9 });
    // ---- le feu : le vrai foyer le plus proche
    S.feuT -= dt;
    if (S.feuT <= 0) { S.feuT = 0.4; S.feu = (E.fire || 0) > 0.02 || (typeof vallee !== 'undefined' && vallee.burning && vallee.burning.size) ? this._feu(w, p) : null; }
    if (S.feu) this.source('feu', 'feu', S.feu.p, S.feu.k, { ref: S.feu.gros ? 7 : 1.6, roll: 1 });
    // ---- les oiseaux (le jour, par beau temps), dans les arbres
    S.arbresT -= dt;
    if (S.arbresT <= 0 && dehors) { S.arbresT = 3; this._arbres(w, p, S); }
    S.oiseauT -= dt;
    if (S.oiseauT <= 0) {
      const jour = E.day || 0, aube = this._heure() >= 5 && this._heure() < 9 ? 1.6 : 1;
      S.oiseauT = (0.9 + R() * 3.2) / Math.max(0.25, jour * aube) * (bois ? 0.8 : biome === 'ville' ? 1.4 : 1.1);
      if (dehors && !quiet && jour > 0.25 && calme > 0.5 && !mondeAPart) this._chanteur(biome, S, jour * calme);
    }
    // ---- la nuit : grillons dans l'herbe, chouette au loin, grenouilles près de l'eau
    const nuit = E.night || 0, herbeux = biome === 'plaine' || biome === 'ferme' || biome === 'lande' || biome === 'lac' || biome === 'bouleaux';
    this._grillons(S, dehors && !quiet && nuit > 0.3 && calme > 0.6 && herbeux && !mondeAPart ? nuit : 0, p);
    S.chouetteT -= dt;
    if (S.chouetteT <= 0) {
      S.chouetteT = 22 + R() * 40;
      if (dehors && !quiet && nuit > 0.6 && (bois || biome === 'ferme' || biome === 'plaine') && S.arbres.length) { const a = S.arbres[(R() * S.arbres.length) | 0]; if (Math.hypot(a[0] - L.x, a[2] - L.z) > 12) this.oiseau('chouette', a, 1, 4); }
    }
    // ---- sous terre : gouttes, bourdon lointain
    if (under && !mondeAPart) {
      S.caveT -= dt;
      if (S.caveT <= 0) {
        S.caveT = 0.6 + R() * 2.2;
        const a = R() * TAU, r = 3 + R() * 12, pos = [L.x + Math.cos(a) * r, L.y + 1 + R() * 3, L.z + Math.sin(a) * r];
        this.jouer(this.tb('goutte', 8), this.at(), 0.05 + R() * 0.05, this.en3d(pos, this.B.amb.inp, { ref: 2, dur: 0.6 }), 0.8 + R() * 0.5);
      }
    }
    this.source('bourdon', 'bourdon', null, under && !mondeAPart ? 1 : 0, { tau: 2 });
    this._sourcesTick();
  },
  _heure() { try { return npcs.hour(); } catch (e) { return 12; } },
  // le lieu où l'on est (pour la réverbération)
  _lieuAuto(w, p, under, inside, biome, mondeAPart) {
    if (under || (mondeAPart && mondeAPart !== 'bonbons')) return 'grotte';
    if (inside) {
      const S = this.sc;
      if (!S.bldT || performance.now() - S.bldT > 1000) {
        S.bldT = performance.now(); S.bld = null;
        const px = p.pos[0], pz = p.pos[2];
        for (const k in w.bld || {}) {
          const B = w.bld[k];
          if (!B || !B.f || !B.W || Math.abs(B.x - px) > 40 || Math.abs(B.z - pz) > 40) continue;
          const [lx, lz] = World.blockLocal({ x: B.f.x, z: B.f.z, r: B.f.r }, px, pz);
          if (Math.abs(lx) < B.W / 2 && Math.abs(lz) < B.D / 2) { S.bld = B; break; }
        }
      }
      const B = S.bld;
      if (B && (/eglise|chapelle|temple|biblio|halle|grange|mairie|auberge/.test(B.key || '') || B.W * B.D > 150)) return 'salle';
      return 'piece';
    }
    if (biome === 'foret' || biome === 'bouleaux' || biome === 'marais') return 'foret';
    if (biome === 'hauteurs') return 'montagne';
    return 'dehors';
  },
  // pluie : un lit stéréo large (hors 3D : elle est partout) + quatre nappes de gouttes placées autour
  _pluie(dt, E, S, under, inside, now) {
    const rain = under ? 0 : clamp(E.rain || 0, 0, 1), c = this.ctx, L = this.L;
    if (!S.pl && rain > 0.02) {
      const mk = (rate) => { const s = c.createBufferSource(); s.buffer = this.boucleTampon('bruit'); s.loop = true; s.playbackRate.value = rate; const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 280; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5200; lp.Q.value = 0.5; s.connect(hp).connect(lp); s.start(now, Math.random() * 8.5); return { s, lp }; };
      const a = mk(1), b = mk(0.97), m = c.createChannelMerger(2), g = c.createGain();
      g.gain.value = 0;
      a.lp.connect(m, 0, 0); b.lp.connect(m, 0, 1); m.connect(g).connect(this.B.amb.inp);
      S.pl = { a, b, g, zero: 0 };
    }
    if (S.pl) {
      const v = rain * rain * (inside ? 0.07 : 0.28);
      S.pl.g.gain.setTargetAtTime(v, now, 0.8);
      const lp = inside ? 900 : 4200 + rain * 1400;
      S.pl.a.lp.frequency.setTargetAtTime(lp, now, 0.5); S.pl.b.lp.frequency.setTargetAtTime(lp * 1.08, now, 0.5);
      if (rain <= 0.02) { S.pl.zero += dt; if (S.pl.zero > 4) { S.pl.g.gain.setTargetAtTime(0, now, 0.3); const P = S.pl; try { P.a.s.stop(now + 1.5); P.b.s.stop(now + 1.5); } catch (e) { /* rien */ } S.pl = null; } } else S.pl.zero = 0;
    }
    // les gouttes : devant, derrière, à gauche, à droite (au sol dehors ; au-dessus, sur le toit, dedans)
    const k = rain * (inside ? 0.5 : 1);
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + 0.6, r = inside ? 2.2 : 3.5;
      this.source('gouttes' + i, 'gouttes', [L.x + Math.cos(a) * r, L.y + (inside ? 2.6 : -1.3), L.z + Math.sin(a) * r], k, { att: 'aucune', rate: 0.9 + i * 0.07, lp: inside ? 1400 : 20000, pas: 1 });
    }
  },
  // la rivière la plus proche (lit connu du plan de la vallée) ; la rive d'un lac (l'eau sous le niveau)
  _eau(w, p, S, under) {
    S.riv = null; S.rive = null;
    if (under || !w.heightAt) return;
    const px = p.pos[0], pz = p.pos[2], WL = w.waterLevel;
    // rivières
    if (!S.rivs || S.rivsW !== w) {
      S.rivsW = w; S.rivs = [];
      try { if (w.designed && typeof VALLEY_DESIGN !== 'undefined') { const P = VALLEY_DESIGN.P || designPrepare(VALLEY_DESIGN); S.rivs = P.rivers.map((R) => ({ w: R.w, pts: R.pts })); } } catch (e) { S.rivs = []; }
    }
    let best = null;
    for (const V of S.rivs) for (let i = 1; i < V.pts.length; i++) {
      const a = V.pts[i - 1], b = V.pts[i], dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz || 1;
      const t = clamp(((px - a[0]) * dx + (pz - a[1]) * dz) / L2, 0, 1), x = a[0] + dx * t, z = a[1] + dz * t, d = Math.hypot(px - x, pz - z);
      if (!best || d < best.d) best = { d, x, z, w: V.w };
    }
    if (best && best.d < 90) {
      // au milieu du lit, à la surface
      const k = clamp(1.25 - best.d / 90, 0, 1) * (best.w > 5 ? 1 : 0.7);
      S.riv = { p: [best.x, WL + 0.3, best.z], k };
    }
    // rive d'un lac ou d'un étang : on cherche l'eau autour (16 directions, 5 distances)
    let near = null;
    for (const r of [4, 9, 16, 26, 40]) {
      for (let j = 0; j < 16; j++) {
        const a = j / 16 * TAU, x = px + Math.cos(a) * r, z = pz + Math.sin(a) * r;
        if (w.heightAt(x, z) < WL - 0.2) { const d = r; if (!near || d < near.d) near = { d, x, z }; }
      }
      if (near) break;
    }
    if (near && !(S.riv && best.d < near.d + 8)) S.rive = { p: [near.x, WL + 0.2, near.z], k: clamp(1.2 - near.d / 40, 0.15, 1) };
  },
  // le foyer le plus proche : feux de camp, cheminées, fours, grands feux ; arbres qui brûlent (pas les bougies)
  _feu(w, p) {
    const px = p.pos[0], pz = p.pos[2];
    let best = null;
    for (const l of w.lights || []) {
      if (!l.flicker) continue;
      const id = l.prop ? l.prop.id : 'campfire';
      if (!SoundEngine.FEUX[id]) continue;
      const d = Math.hypot(l.x - px, l.z - pz);
      if (d < 26 && (!best || d < best.d)) best = { d, p: [l.x, l.y - 0.3, l.z], k: SoundEngine.FEUX[id], gros: id === 'feu_geant' };
    }
    if (typeof vallee !== 'undefined' && vallee.burning && vallee.burning.size) {
      for (const b of vallee.burning.values()) { const d = Math.hypot(b.x - px, b.z - pz); if (d < 90 && (!best || d < best.d)) best = { d, p: [b.x, b.y + b.h * 0.5, b.z], k: b.tree ? 2.5 : 1.2, gros: true }; }
    }
    return best;
  },
  // les arbres autour (pour y percher les oiseaux et la chouette)
  _arbres(w, p, S) {
    const px = p.pos[0], pz = p.pos[2];
    if (S.arbresP && Math.hypot(S.arbresP[0] - px, S.arbresP[1] - pz) < 8 && S.arbres.length) return;
    S.arbresP = [px, pz]; S.arbres = [];
    if (!w.query || typeof OBJ_TYPES === 'undefined') return;
    const A = S.arbres;
    w.query(px, pz, 38, (o) => {
      if (!o || o.gone || A.length > 40) return;
      const T = OBJ_TYPES[o.t];
      if (!T || T.cat !== 'Arbres' || (o.h || 0) < 3) return;
      if (Math.hypot(o.x - px, o.z - pz) < 5) return;
      A.push([o.x, w.objectY(o) + o.h * (0.6 + Math.random() * 0.3), o.z]);
    }, null);
  },
  // un oiseau chante : dans un arbre s'il y en a, sinon dans la haie ou (l'alouette) haut dans le ciel
  _chanteur(biome, S, k) {
    const R = Math.random, T = SoundEngine.OISEAUX[biome] || SoundEngine.OISEAUX.plaine, L = this.L;
    let tot = 0;
    for (const [, w] of T) tot += w;
    let r = R() * tot, sorte = T[0][0];
    for (const [s, w] of T) { r -= w; if (r <= 0) { sorte = s; break; } }
    let pos;
    if (sorte === 'alouette') { const a = R() * TAU, d = 20 + R() * 30; pos = [L.x + Math.cos(a) * d, L.y + 25 + R() * 20, L.z + Math.sin(a) * d]; }
    else if (S.arbres.length) pos = S.arbres[(R() * S.arbres.length) | 0];
    else { const a = R() * TAU, d = 10 + R() * 25; pos = [L.x + Math.cos(a) * d, L.y + 1 + R() * 3, L.z + Math.sin(a) * d]; }
    this.oiseau(sorte, pos, k);
  },
  // les grillons : trois à cinq, chacun à sa place dans l'herbe ; ils se taisent quand on s'approche
  _grillons(S, k, p) {
    const L = this.L, R = Math.random, G = S.grillons, px = p.pos[0], pz = p.pos[2];
    const n = k > 0 ? 4 : 0;
    while (G.length < n) G.push({ id: 'grillon' + ((S.gid = (S.gid || 0) + 1)), pos: null, tait: 0 });
    for (let i = 0; i < G.length; i++) {
      const g = G[i];
      if (i >= n) { this.source(g.id, 'grillon', g.pos, 0); continue; }
      if (!g.pos || Math.hypot(g.pos[0] - px, g.pos[2] - pz) > 18) {
        const a = R() * TAU, d = 5 + R() * 10, x = px + Math.cos(a) * d, z = pz + Math.sin(a) * d;
        let y = L.y - 1.5;
        try { y = game.world.heightAt(x, z) + 0.1; } catch (e) { /* rien */ }
        if (g.pos) this.source(g.id, 'grillon', g.pos, 0);
        g.id = 'grillon' + ((S.gid = (S.gid || 0) + 1)); g.pos = [x, y, z];
      }
      if (Math.hypot(g.pos[0] - px, g.pos[2] - pz) < 2.8) g.tait = 7;
      g.tait = Math.max(0, g.tait - 0.1);
      this.source(g.id, 'grillon', g.pos, g.tait > 0 ? 0 : k * (0.7 + 0.3 * Math.sin(i * 1.7)), { ref: 2.5, roll: 1, rate: 0.96 + i * 0.03, tau: g.tait > 0 ? 0.08 : 1.5 });
    }
    if (!n) G.length = 0;
  },

  // ---------------------------------------------------------------- selon le milieu (appelé par le jeu en mode ferme)
  // E : { biome, day, night, rain, inside, under, envers, red, town, tension, forge }
  biomeAmb(dt, E) {
    if (!this.ok) return;
    this.bio = E;
    this.bT = (this.bT || 2) - dt;
    if (this.bT > 0) return;
    this.bT = 1.2 + Math.random() * 2.5;
    const r = Math.random(), calm = E.rain < 0.4, L = this.L, R = Math.random;
    const loin = (d0, d1, h) => { const a = R() * TAU, d = d0 + R() * (d1 - d0); return [L.x + Math.cos(a) * d, L.y + (h || 0), L.z + Math.sin(a) * d]; };
    if (E.envers) {
      if (r < 0.3) this.whisper(Math.random() * 2 - 1, 0.35);
      else if (r < 0.45) this.voice(this.at(), 'sine', 48, 46, 4, 0.03, this.lp(300, this.amb));
      return;
    }
    if (E.under) return; // (les gouttes et le bourdon sont dans la scène)
    if (E.red) { if (r < 0.12) this.whisper(Math.random() * 2 - 1, 0.25); return; }
    if (E.inside) {
      // la maison travaille : un craquement de bois, quelque part, rarement (la nuit surtout)
      if (r < (E.night > 0.5 ? 0.05 : 0.015)) this.ici(loin(2, 5, 1.5), () => this.voice(this.at(), 'sawtooth', 200 + R() * 120, 150 + R() * 60, 0.25 + R() * 0.3, 0.004, this.amb, { bp: 650 + R() * 300, q: 3, vib: 10, vibDepth: 14 }));
      return;
    }
    switch (E.biome) {
      case 'foret': case 'bouleaux':
        if (E.day > 0.5 && calm && r < 0.1) this.ici(this._unArbre() || loin(15, 35, 4), () => this.woodpecker(), SoundEngine.LOIN);
        break;
      case 'marais':
        if (r < 0.45) this.ici(this._presDeLEau() || loin(6, 20, -1), () => this.frog(E.night > 0.5 ? 1 : 0.6), SoundEngine.LOIN);
        if (r > 0.8) this.ici(this._presDeLEau() || loin(4, 12, -1), () => this.bubble(), SoundEngine.LOIN);
        break;
      case 'lac':
        if (E.night > 0.5 && r < 0.2) this.ici(this._presDeLEau() || loin(8, 25, -1), () => this.frog(0.7), SoundEngine.LOIN);
        if (E.day > 0.5 && r > 0.93) this.animal('duck', loin(20, 45, -1), 0.5);
        break;
      case 'hauteurs':
        if (E.day > 0.5 && calm && r < 0.06) this.ici(loin(60, 140, 45), () => this.eagle(), { att: 'aucune' }); // un cri qui porte : seule l'air l'assourdit
        break;
      case 'ville':
        if (E.day > 0.5 && r < 0.3) { const n = this._habitantPres(); if (n) this.ici(n, () => this.mumble(n.voice || (0.8 + Math.random() * 0.8), 20, 0, 0.45), { att: 'phys', ref: 3 }); }
        if (E.day > 0.5 && r > 0.9 && E.forge) this.anvil();
        break;
    }
  },
  _unArbre() { const A = this.sc && this.sc.arbres; return A && A.length ? A[(Math.random() * A.length) | 0] : null; },
  _presDeLEau() { const S = this.sc; if (!S) return null; const q = S.rive || S.riv; if (!q) return null; return [q.p[0] + (Math.random() - 0.5) * 8, q.p[1], q.p[2] + (Math.random() - 0.5) * 8]; },
  // un habitant éveillé, à portée de voix, qui ne parle pas déjà au joueur
  _habitantPres() {
    try {
      const L = this.L, c = [];
      for (const n of npcs.list) if (n.st && n.st.alive && !n.vanished && n.state !== 'sleep' && n.state !== 'gone' && !n.talking && n.dist > 4 && n.dist < 28) c.push(n);
      return c.length ? c[(Math.random() * c.length) | 0] : null;
    } catch (e) { return null; }
  },
});
// les foyers qui s'entendent (et leur force)
// les bruits d'ambiance placés au loin : une atténuation plus douce (on les entend de plus loin)
SoundEngine.LOIN = { att: 'phys', ref: 7, roll: 0.8 };
SoundEngine.FEUX = { campfire: 1, feu_camp: 1, cheminee: 0.8, four: 0.55, feu_geant: 2.2, brasero: 0.9, forge: 0.9 };
