// ============================================================================
//  AUDIO PROCÉDURAL (WebAudio) — le moteur
//  Tout est synthétisé. Chemin d'un son : source → bus (bruitages, ambiance,
//  voix, interface) → mélange → compression douce → adoucissement des aigus →
//  limiteur → volume général. Réverbération naturelle calculée (dehors, forêt,
//  montagne, pièce, grande salle, grotte), fondue d'un lieu à l'autre.
//  SON EN 3D (casque) : ce qui a une place dans le monde passe par un panneau
//  HRTF ; l'écouteur suit la caméra à chaque image ; atténuation, absorption de
//  l'air et réverbération selon la distance ; léger effet de proximité.
//
//  Pour les autres modules (tout est compatible avec les anciens appels) :
//   - sound.pan(p, dest)       : p = −1..1 (gauche/droite) OU une position [x,y,z] / {x,y,z} / une bête / un habitant
//   - sound.ici(pos, fn, o)    : tous les sons joués dans fn() viennent de pos (o.att 'aucune' si le volume tient déjà
//                                compte de la distance ; o.suivre : la source bouge avec l'objet)
//   - sound.en3d(pos, dest, o) : un nœud d'entrée placé en pos (pour brancher ses propres nœuds)
//   - sound.source(clé, type, pos, k) : une boucle d'ambiance placée (rivière, feu, vent…), à rafraîchir
//   - sound.setLieu(nom), sound.lieuForce : la réverbération (dehors, foret, montagne, piece, salle, grotte)
//   - sound.set3D(oui) : HRTF (casque) ou panoramique simple
// ============================================================================

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.volume = 0.6;
    this.ambVolume = 0.5;
    this.son3d = true;
    this.birdT = 1; this.cricketT = 0.5; this.owlT = 20; this.crackleT = 0;
    this.B = null; this.em = []; this.emMax = 24; this.persist = new Set();
    this._scope = null; this._depth = 0; this._st = [];
    this.L = { x: 0, y: 0, z: 0, f: [0, 0, -1], r: [1, 0, 0], u: [0, 1, 0], ok: false };
    this.lieu = null; this.lieuForce = null; this._irs = {}; this._bufs = {};
    this.pied = 1;
  }

  // ---------------------------------------------------------------- tampons de bruit
  // Bruit « brun » (grave, sans souffle aigu) qui boucle sans clic
  static brownBuffer(c, seconds) {
    const len = Math.floor(c.sampleRate * seconds), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last; }
    const drift = d[len - 1] - d[0];
    let peak = 1e-6;
    for (let i = 0; i < len; i++) { d[i] -= drift * (i / (len - 1)); peak = Math.max(peak, Math.abs(d[i])); }
    for (let i = 0; i < len; i++) d[i] /= peak;
    return buf;
  }
  // FFT en place (radix 2)
  static fft(re, im, inv) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
    }
    for (let len = 2; len <= n; len <<= 1) {
      const ang = (inv ? 2 : -2) * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang), h = len >> 1;
      for (let i = 0; i < n; i += len) {
        let cr = 1, ci = 0;
        for (let k = 0; k < h; k++) {
          const a = i + k, b = a + h, xr = re[b] * cr - im[b] * ci, xi = re[b] * ci + im[b] * cr;
          re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi;
          const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
        }
      }
    }
  }
  // Bruit « doux » : même niveau que le bruit blanc sous 1,2 kHz, puis −2 dB par octave, presque rien au-dessus de 12 kHz.
  // Calculé par FFT : il boucle parfaitement. (Remplace le bruit blanc cru : moins de sifflement, moins de fatigue.)
  static softNoise(c, n) {
    const sr = c.sampleRate, re = new Float64Array(n), im = new Float64Array(n);
    let m2 = 0;
    for (let k = 1; k < n / 2; k++) {
      const f = k * sr / n;
      const M = (f <= 1200 ? 1 : Math.pow(1200 / f, 0.35)) / Math.sqrt(1 + Math.pow(f / 12000, 4)) * (f < 25 ? f / 25 : 1);
      const ph = Math.random() * 2 * Math.PI;
      re[k] = M * Math.cos(ph); im[k] = M * Math.sin(ph);
      re[n - k] = re[k]; im[n - k] = -im[k];
      m2 += M * M;
    }
    SoundEngine.fft(re, im, true);
    let v = 0;
    for (let i = 0; i < n; i++) v += re[i] * re[i];
    // variance visée : celle d'un bruit blanc uniforme (1/3) pondérée par la forme du spectre
    const s = Math.sqrt((1 / 3) * (m2 / (n / 2 - 1)) / (v / n));
    const buf = c.createBuffer(1, n, sr), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = re[i] * s;
    return buf;
  }
  // Réponse impulsionnelle d'un lieu (queue diffuse, aigus qui meurent plus vite que les graves, premières réflexions)
  static reverbIR(c, P) {
    const sr = c.sampleRate, n = Math.max(64, Math.floor(sr * P.len)), buf = c.createBuffer(2, n, sr);
    const pre = Math.floor(P.pre * sr), att = Math.max(1, Math.floor(P.att * sr));
    const dl = Math.exp(-6.91 / (P.t60 * sr)), dh = Math.exp(-6.91 / (P.t60h * sr));
    const a = Math.exp(-2 * Math.PI * P.split / sr), b = Math.exp(-2 * Math.PI * P.lp / sr);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      // premières réflexions : des impulsions, adoucies par le même filtre que la queue
      const er = (P.er || []).map(([tt, g]) => [pre + Math.floor(tt * (ch ? 1.06 : 0.95) * sr), (Math.random() < 0.5 ? -1 : 1) * g * 4]).sort((u, v) => u[0] - v[0]);
      let lo = 0, el = 1, eh = 1, y = 0, q = 0;
      for (let i = pre; i < n; i++) {
        const w = Math.random() * 2 - 1;
        lo = w + (lo - w) * a;
        let v = lo * el * 2.2 + (w - lo) * P.hiK * eh;
        el *= dl; eh *= dh;
        const k = i - pre;
        if (k < att) v *= k / att;
        while (q < er.length && er[q][0] <= i) { if (er[q][0] === i) v += er[q][1]; q++; }
        y = v + (y - v) * b;
        d[i] = y;
      }
      const fo = Math.floor(n * 0.1);
      for (let q = 0; q < fo; q++) d[n - 1 - q] *= q / fo;
    }
    return buf;
  }

  // ---------------------------------------------------------------- la chaîne
  init(ctxArg) {
    if (this.ctx) { if (this.ctx.state === 'suspended' && this.ctx.resume && !this.offline) this.ctx.resume(); return; }
    try {
      let c = ctxArg;
      if (!c) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        try { c = new AC({ latencyHint: 'interactive' }); } catch (e) { c = new AC(); }
      }
      this.ctx = c; this.offline = !!ctxArg;
      const G = (v) => { const g = c.createGain(); g.gain.value = v; return g; };
      // sortie : compression douce (le mélange se tient), aigus adoucis, limiteur (jamais de saturation), volume général
      this.vol = G(this.volume); this.vol.connect(c.destination);
      const lim = this.lim = c.createDynamicsCompressor();
      lim.threshold.value = -3; lim.knee.value = 2; lim.ratio.value = 20; lim.attack.value = 0.002; lim.release.value = 0.12;
      lim.connect(this.vol);
      this.trim = G(SoundEngine.TRIM); this.trim.connect(lim);
      const shelf = c.createBiquadFilter(); shelf.type = 'highshelf'; shelf.frequency.value = 6500; shelf.gain.value = -3;
      shelf.connect(this.trim);
      const glue = this.glue = c.createDynamicsCompressor();
      glue.threshold.value = -22; glue.knee.value = 16; glue.ratio.value = 2.2; glue.attack.value = 0.02; glue.release.value = 0.35;
      glue.connect(shelf);
      const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 28; hp.Q.value = 0.6;
      hp.connect(glue);
      this.master = G(1); this.master.connect(hp);
      // réverbération : deux convolueurs pour passer d'un lieu à l'autre en fondu
      this.revIn = G(1);
      this.rev = [0, 1].map(() => { const cv = c.createConvolver(), g = G(0); cv.connect(g).connect(this.master); return { cv, g, on: false }; });
      this.revCur = 0;
      // les bus : entrée (volume du bus) → mélange ; envoi vers la réverbération ; retour « distance » des sources placées
      const bus = (level, send) => {
        const inp = G(level), snd = G(send), xrv = G(level);
        inp.connect(this.master); inp.connect(snd); snd.connect(this.revIn); xrv.connect(this.revIn);
        return { inp, snd, xrv, level, send };
      };
      this.B = {
        sfx: bus(1, 0.5),
        amb: bus(this.ambVolume, 0.7),
        voix: bus(SoundEngine.BUS.voix, 0.55),
      };
      this.uiBus = G(SoundEngine.BUS.ui); this.uiBus.connect(this.master);
      this.xrvOf = new Map([[this.B.sfx.inp, this.B.sfx.xrv], [this.B.amb.inp, this.B.amb.xrv], [this.B.voix.inp, this.B.voix.xrv]]);
      // tampons
      this.noise = SoundEngine.softNoise(c, 65536); // bruit adouci (l'ancien bruit blanc : pour les modules qui s'en servent)
      this.pink = this.noise;
      this.brown = SoundEngine.brownBuffer(c, 3);
      this.setLieu('dehors');
    } catch (e) { this.err = e; this.ctx = null; }
  }
  setVolume(v) {
    this.volume = v;
    if (this.vol) this.vol.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
  }
  setAmbient(v) {
    this.ambVolume = v;
    if (!this.B) return;
    const t = this.ctx.currentTime, A = this.B.amb;
    A.inp.gain.cancelScheduledValues(t);
    A.inp.gain.setTargetAtTime(v, t, 0.1);
    A.xrv.gain.setTargetAtTime(v, t, 0.1);
  }
  // son 3D pour casque (HRTF) ou panoramique simple (haut-parleurs)
  set3D(on) {
    this.son3d = on !== false;
    const m = this.son3d ? 'HRTF' : 'equalpower';
    for (const e of this.em) e.p.panningModel = m;
    for (const e of this.persist) e.p.panningModel = m;
  }
  get ok() { return this.ctx && this.ctx.state === 'running' && this.volume > 0; }

  // les bus (dans une portée « ici », ils mènent à une source placée)
  get sfx() { return this._scope ? this._sIn(this.B.sfx.inp) : this.B && this.B.sfx.inp; }
  get amb() { return this._scope ? this._sIn(this.B.amb.inp) : this.B && this.B.amb.inp; }
  get voix() { return this._scope ? this._sIn(this.B.voix.inp) : this.B && this.B.voix.inp; }
  get ui() { return this.uiBus; }

  // ---------------------------------------------------------------- réverbération (le lieu)
  setLieu(k) {
    if (!this.ctx) return;
    k = this.lieuForce || k;
    const P = SoundEngine.LIEUX[k];
    if (!P || k === this.lieu) return;
    this.lieu = k;
    const ir = this._irs[k] || (this._irs[k] = SoundEngine.reverbIR(this.ctx, P));
    const t = this.ctx.currentTime, old = this.rev[this.revCur], nw = this.rev[1 - this.revCur];
    this.revCur = 1 - this.revCur;
    nw.cv.buffer = ir;
    if (!nw.on) { this.revIn.connect(nw.cv); nw.on = true; }
    const fade = this.offline ? 0.001 : 0.6;
    nw.g.gain.cancelScheduledValues(t); nw.g.gain.setValueAtTime(nw.g.gain.value, t); nw.g.gain.linearRampToValueAtTime(P.wet, t + fade);
    old.g.gain.cancelScheduledValues(t); old.g.gain.setValueAtTime(old.g.gain.value, t); old.g.gain.linearRampToValueAtTime(0, t + fade);
    // l'ancien convolueur se tait puis se débranche (moins de calcul)
    const tok = this._revTok = (this._revTok || 0) + 1;
    if (old.on && !this.offline) setTimeout(() => { if (this._revTok === tok && old.on && this.rev[this.revCur] !== old) { try { this.revIn.disconnect(old.cv); } catch (e) { /* déjà */ } old.on = false; } }, P.len * 1000 + 1500);
  }

  // ---------------------------------------------------------------- le son en 3D
  // une source placée : entrée → absorption de l'air → proximité → panneau HRTF → bus ; envoi « distance » → réverbération
  _newEm() {
    const c = this.ctx, inp = c.createGain(), air = c.createBiquadFilter(), prox = c.createBiquadFilter(), p = c.createPanner(), xs = c.createGain();
    air.type = 'lowpass'; air.frequency.value = this.nyq(20000); air.Q.value = 0.4;
    prox.type = 'lowshelf'; prox.frequency.value = 220; prox.gain.value = 0;
    p.panningModel = this.son3d ? 'HRTF' : 'equalpower'; p.distanceModel = 'inverse'; p.refDistance = 2; p.maxDistance = 20000; p.rolloffFactor = 1;
    xs.gain.value = 0;
    inp.connect(air); air.connect(prox); prox.connect(p); prox.connect(xs);
    const em = { inp, air, prox, p, xs, dest: null, busy: 0, suivre: null, att: 'phys', o: null, pos: [0, 0, 0] };
    inp._em = em;
    return em;
  }
  _route(em, dest) {
    if (em.dest === dest) return;
    try { em.p.disconnect(); em.xs.disconnect(); } catch (e) { /* rien */ }
    em.p.connect(dest);
    em.xs.connect(this.xrvOf.get(dest) || this.B.sfx.xrv);
    em.dest = dest;
  }
  // place une source (pos : [x,y,z]) ; o.att : 'phys' (atténuation réelle) ou 'aucune' (le volume est déjà réglé par l'appelant)
  _place(em, pos, lisse) {
    const L = this.L, p = em.p, o = em.o || {};
    let x = pos[0], y = pos[1], z = pos[2];
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) { x = L.x; y = L.y; z = L.z; } // position impossible : au centre
    em.pos[0] = x; em.pos[1] = y; em.pos[2] = z;
    const d = Math.hypot(x - L.x, y - L.y, z - L.z), t = this.ctx.currentTime;
    if (p.positionX) {
      if (lisse) { p.positionX.setTargetAtTime(x, t, 0.04); p.positionY.setTargetAtTime(y, t, 0.04); p.positionZ.setTargetAtTime(z, t, 0.04); }
      else { p.positionX.cancelScheduledValues(t); p.positionY.cancelScheduledValues(t); p.positionZ.cancelScheduledValues(t); p.positionX.value = x; p.positionY.value = y; p.positionZ.value = z; }
    } else p.setPosition(x, y, z);
    const phys = em.att !== 'aucune';
    if (!lisse) {
      p.refDistance = o.ref || 2;
      p.rolloffFactor = phys ? (o.roll === undefined ? 1 : o.roll) : 0;
    }
    // l'air mange les aigus au loin ; tout près, un peu plus de grave (effet de proximité)
    const fc = this.nyq(Math.min(20000, 700 + 21000 / (1 + d / 22)));
    const prox = d < 1.6 ? 5 * (1 - d / 1.6) : 0;
    const wet = (phys ? 0.32 / (1 + d / 120) : 0.36) * Math.min(1, d / 35);
    if (lisse) { em.air.frequency.setTargetAtTime(fc, t, 0.1); em.prox.gain.setTargetAtTime(prox, t, 0.1); em.xs.gain.setTargetAtTime(wet, t, 0.1); }
    else { em.air.frequency.value = fc; em.prox.gain.value = prox; em.xs.gain.value = wet; }
  }
  // une source ponctuelle, prise dans la réserve (réutilisée) ; renvoie son entrée
  emit(pos, dest, o) {
    const c = this.ctx, now = c.currentTime;
    o = o || {};
    let em = null, libre = null;
    for (const e of this.em) if (e.busy <= now) { if (e.dest === dest) { em = e; break; } if (!libre) libre = e; }
    em = em || libre;
    if (!em) {
      if (this.em.length < this.emMax) { em = this._newEm(); this.em.push(em); }
      else { em = this.em[0]; for (const e of this.em) if (e.busy < em.busy) em = e; }
    }
    this._route(em, dest);
    em.o = o; em.att = o.att || 'phys'; em.suivre = o.suivre || null; em.busy = now + (o.dur || 0.5);
    this._place(em, pos, false);
    return em.inp;
  }
  // un nœud d'entrée placé en pos (pour les modules qui construisent leurs propres sons)
  en3d(pos, dest, o) {
    if (!this.ctx) return null;
    const P = this.pos3(pos), d = dest || this.B.sfx.inp;
    if (!P) return d;
    return this.emit(P, d._em ? d._em.dest : d, o);
  }
  // une source durable (boucle d'ambiance) : hors réserve ; libérer avec lacher()
  tenir(pos, dest, o) {
    const em = this._newEm();
    this._route(em, dest || this.B.amb.inp);
    em.o = o || {}; em.att = em.o.att || 'phys'; em.busy = Infinity;
    this._place(em, pos, false);
    this.persist.add(em);
    return em;
  }
  lacher(em) {
    if (!em) return;
    this.persist.delete(em);
    try { em.p.disconnect(); em.xs.disconnect(); em.inp.disconnect(); } catch (e) { /* rien */ }
  }
  // position sous toutes ses formes : [x,y,z], [x,z], {x,y,z}, {x,z}, une bête (y au sol + hauteur), un habitant (bouche)
  pos3(p) {
    if (!p || typeof p === 'number') return null;
    if (typeof p === 'function') return this.pos3(p());
    if (p.length !== undefined) return p.length >= 3 ? [+p[0], +p[1], +p[2]] : p.length === 2 ? this.sol(+p[0], +p[1]) : null;
    if (typeof p.x !== 'number' || typeof p.z !== 'number') return null;
    if (typeof p.y !== 'number') return this.sol(p.x, p.z);
    const h = typeof p.h === 'number' ? p.h * (p.scale || 1) * 0.6 : p.st && p.d ? 1.55 : 0;
    return [p.x, p.y + h, p.z];
  }
  sol(x, z) {
    try { const w = game.world; return [x, Math.max(w.heightAt(x, z), w.waterLevel) + 1.2, z]; } catch (e) { return [x, this.L.y, z]; }
  }
  // direction seule (−1 gauche … 1 droite) : une position virtuelle autour de la tête, devant (ou derrière)
  virt(p, dist, derriere) {
    const L = this.L, a = Math.asin(clamp(p, -1, 1)), s = Math.sin(a), co = Math.cos(a) * (derriere ? -1 : 1), D = dist || 2.5;
    let fx = L.f[0], fz = L.f[2];
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    return [L.x + (L.r[0] * s + fx * co) * D, L.y, L.z + (L.r[2] * s + fz * co) * D];
  }
  // direction d'un son : p = −1..1 (ancien panoramique) ou une position ; dest : le bus (ou un nœud) où il doit aller.
  // Dans une portée « ici », tout vient de la source placée. Sans direction (p = 0) : au centre, comme avant.
  pan(p, dest) {
    const c = this.ctx, d0 = dest || this.sfx;
    if (d0 && d0._em) return d0;
    const pos = typeof p === 'number' ? null : this.pos3(p);
    if (pos) return this.emit(pos, d0, { att: 'phys', ref: 5, dur: 1.5 });
    if (this._scope) { const S = this._scope; if (!S.pos) S.pos = this.pos3(S.src) || [this.L.x, this.L.y, this.L.z]; return this.emit(S.pos, d0, S.o); }
    const v = clamp(+p || 0, -1, 1);
    if (!v) return d0;
    if (this.son3d && this.L.ok) return this.emit(this.virt(v, 2.5), d0, { att: 'aucune', dur: 1.5 });
    const s = c.createStereoPanner ? c.createStereoPanner() : c.createGain();
    if (s.pan) s.pan.value = v;
    s.connect(d0);
    return s;
  }
  // tous les sons joués pendant fn() viennent de pos (portées imbriquées permises)
  ici(pos, fn, o) {
    const k = this.entrer(pos, o);
    try { return fn(); } finally { this.sortir(k); }
  }
  // la même chose sans fermeture (pour les appels à chaque image) : k = entrer(pos, o) ; … ; sortir(k)
  entrer(pos, o) {
    if (!this.ctx || !pos) return 0;
    const k = ++this._depth;
    const S = this._st[k] || (this._st[k] = { src: null, pos: null, o: null, ins: new Map(), prev: null });
    S.src = pos; S.pos = null; S.o = o || SoundEngine.NUL; S.prev = this._scope;
    if (S.ins.size) S.ins.clear();
    this._scope = S;
    return k;
  }
  sortir(k) { if (!k) return; const S = this._st[k]; this._scope = S.prev; this._depth = k - 1; }
  _sIn(dest) {
    const S = this._scope;
    let n = S.ins.get(dest);
    if (n) return n;
    if (!S.pos) S.pos = this.pos3(S.src) || [this.L.x, this.L.y, this.L.z];
    const o = S.o.suivre === true && typeof S.src === 'object' ? Object.assign({}, S.o, { suivre: S.src }) : S.o;
    n = this.emit(S.pos, dest, o);
    S.ins.set(dest, n);
    return n;
  }
  // un son se termine à « fin » : la source placée qui le porte reste réservée jusque-là
  mark(out, fin) { const e = out && out._em; if (e && fin > e.busy) e.busy = fin; }
  // l'écouteur suit la caméra (position et orientation)
  ecoute(pos, yaw, pitch) {
    if (!this.ctx || !pos || !Number.isFinite(pos[0] + pos[1] + pos[2] + yaw + pitch)) return;
    const L = this.L, l = this.ctx.listener;
    // rien à faire si la caméra n'a pas bougé (régler un paramètre audio coûte : on ne touche qu'à ce qui change)
    const bouge = !L.ok || Math.abs(pos[0] - L.x) + Math.abs(pos[1] - L.y) + Math.abs(pos[2] - L.z) > 0.004;
    const tourne = !L.ok || Math.abs(yaw - L.yaw) + Math.abs(pitch - L.pitch) > 0.0015;
    if (!bouge && !tourne) return;
    L.ok = true;
    if (bouge) { L.x = pos[0]; L.y = pos[1]; L.z = pos[2]; }
    if (tourne) { const b = cameraBasis(yaw, pitch); L.f = b.f; L.r = b.r; L.u = b.u; L.yaw = yaw; L.pitch = pitch; }
    if (l.positionX) {
      if (bouge) { l.positionX.value = L.x; l.positionY.value = L.y; l.positionZ.value = L.z; }
      if (tourne) { l.forwardX.value = L.f[0]; l.forwardY.value = L.f[1]; l.forwardZ.value = L.f[2]; l.upX.value = L.u[0]; l.upY.value = L.u[1]; l.upZ.value = L.u[2]; }
    } else { l.setPosition(L.x, L.y, L.z); l.setOrientation(L.f[0], L.f[1], L.f[2], L.u[0], L.u[1], L.u[2]); }
  }
  // chaque image : les sources qui bougent (bêtes qui crient en courant…), si elles ont bougé
  suivre() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    for (const e of this.em) {
      if (!e.suivre || e.busy <= now) continue;
      const P = this.pos3(e.suivre);
      if (P && Math.abs(P[0] - e.pos[0]) + Math.abs(P[1] - e.pos[1]) + Math.abs(P[2] - e.pos[2]) > 0.15) this._place(e, P, true);
    }
  }

  // ---------------------------------------------------------------- primitives (adoucies)
  at(delay) { return this.ctx.currentTime + (delay || 0) + 0.01; }
  // une fréquence de filtre toujours sous la moitié de la fréquence d'échantillonnage (casques à 16 ou 32 kHz)
  nyq(f) { return Math.min(f, this.ctx.sampleRate * 0.45); }
  lp(freq, dest) {
    const f = this.ctx.createBiquadFilter(), d = dest || this.sfx;
    f.type = 'lowpass'; f.frequency.value = this.nyq(freq); f.connect(d);
    if (d && d._em) f._em = d._em;
    return f;
  }
  env(g, t, a, peak, dur) {
    const p = Math.max(peak, 0.00012);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(p, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(dur, a + 0.004));
  }
  // les aigus paraissent plus forts : on les baisse un peu (courbe d'égale sonie, très simplifiée)
  loud(f) { return f > 2200 ? Math.pow(2200 / f, 0.45) : 1; }
  // formes d'onde douces (les harmoniques aiguës des carrés et des dents de scie sont atténuées)
  wave(type) {
    if (type !== 'square' && type !== 'sawtooth') return null;
    const W = this._waves || (this._waves = {});
    if (W[type]) return W[type];
    const n = 48, re = new Float32Array(n + 1), im = new Float32Array(n + 1);
    for (let k = 1; k <= n; k++) {
      if (type === 'square' && k % 2 === 0) continue;
      im[k] = (type === 'square' ? 1 : (k % 2 ? 1 : -1)) / k / Math.sqrt(1 + Math.pow(k / 8, 2));
    }
    return (W[type] = this.ctx.createPeriodicWave(re, im));
  }
  setWave(o, type) { const w = this.wave(type); if (w) o.setPeriodicWave(w); else o.type = type === 'triangle' ? 'triangle' : 'sine'; }
  // bruit filtré enveloppé ; att (facultatif) : attaque plus lente (souffles, froissements)
  noiseHit(t, dur, type, freq, q, vol, out, sweepTo, att) {
    const c = this.ctx, R = Math.random;
    dur = Math.max(0.006, dur * (0.94 + R() * 0.12));
    const f0 = this.nyq(Math.min(9000, Math.max(20, freq * (0.96 + R() * 0.08))));
    const s = c.createBufferSource(); s.buffer = this.noise;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(f0, t); f.Q.value = Math.min(q, 9);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(this.nyq(Math.min(9000, Math.max(20, sweepTo))), t + dur);
    const g = c.createGain(); g.gain.value = 0;
    const a = att ? Math.min(att, dur * 0.8) : clamp(dur * 0.12, 0.003, 0.012);
    this.env(g, t, a, vol * (0.9 + R() * 0.2), dur);
    const o = out || this.sfx;
    s.connect(f).connect(g).connect(o);
    s.loop = true; // le bruit doux boucle sans raccord
    s.start(t, R() * this.noise.duration); s.stop(t + dur + 0.05);
    this.mark(o, t + dur + 0.05);
  }
  tone(t, type, f0, f1, dur, vol, out, attack = 0.005) {
    const c = this.ctx, o = c.createOscillator();
    this.setWave(o, type);
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    const g = c.createGain(); g.gain.value = 0;
    const dur2 = Math.max(dur, 0.008), dure = type === 'square' || type === 'sawtooth';
    const a = Math.min(dur2 * 0.5, Math.max(attack, dure ? 0.006 : 0.004));
    this.env(g, t, a, vol * this.loud(Math.max(f0, f1)) * (0.95 + Math.random() * 0.1), dur2);
    let node = o;
    if (dure) { const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 0.5; lp.frequency.value = clamp(Math.max(f0, f1) * 4, 1800, 6500); o.connect(lp); node = lp; }
    const d = out || this.sfx;
    node.connect(g).connect(d);
    o.start(t); o.stop(t + dur2 + 0.05);
    this.mark(d, t + dur2 + 0.05);
  }
  // voix (cris de bêtes, grincements, violon…) : o = { vib, vibDepth, bp, q, lp, lp2 }
  voice(t, type, f0, f1, dur, vol, out, o = {}) {
    const c = this.ctx, osc = c.createOscillator();
    this.setWave(osc, type);
    osc.frequency.setValueAtTime(f0, t); osc.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    const nodes = [osc];
    if (o.vib) {
      const l = c.createOscillator(), lg = c.createGain();
      l.frequency.value = o.vib * (0.95 + Math.random() * 0.1); lg.gain.value = o.vibDepth || 20;
      l.connect(lg).connect(osc.frequency); l.start(t); l.stop(t + dur + 0.05);
    }
    let node = osc;
    if (o.bp) { const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = o.bp; f.Q.value = o.q || 1; node.connect(f); node = f; }
    const dure = type === 'square' || type === 'sawtooth';
    if (o.lp || dure) {
      const f = c.createBiquadFilter(); f.type = 'lowpass';
      const lp = this.nyq(Math.min(o.lp || 20000, dure ? clamp(Math.max(f0, f1) * 6, 2400, 6000) : 20000));
      f.frequency.setValueAtTime(lp, t); if (o.lp2) f.frequency.exponentialRampToValueAtTime(Math.min(o.lp2, lp), t + dur);
      node.connect(f); node = f;
    }
    const g = c.createGain(); g.gain.value = 0;
    const v = Math.max(vol * this.loud(Math.max(f0, f1)), 0.00012);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + clamp(dur * 0.25, 0.008, 0.06));
    g.gain.setValueAtTime(v, t + dur * 0.65);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const d = out || this.sfx;
    node.connect(g).connect(d);
    osc.start(t); osc.stop(t + dur + 0.05);
    this.mark(d, t + dur + 0.05);
    return nodes;
  }

  // ---------------------------------------------------------------- cris « voisés » (bêtes, voix)
  // Une source (dent de scie douce) → formants en parallèle → enveloppe. Hauteur en points [t, f] (relatifs à la durée),
  // vibrato, rugosité (modulation d'amplitude rapide), souffle (bruit), formants [[f, Q, gain] ou [[f0,f1], Q, gain]].
  cri(t, o, out) {
    const c = this.ctx, dur = o.dur, d = out || this.sfx;
    const osc = c.createOscillator();
    this.setWave(osc, o.type || 'sawtooth');
    const P = o.f;
    osc.frequency.setValueAtTime(P[0][1], t);
    for (let i = 1; i < P.length; i++) osc.frequency.exponentialRampToValueAtTime(Math.max(20, P[i][1]), t + P[i][0] * dur);
    const oscs = [osc], srcs = [];
    if (o.vib) {
      const l = c.createOscillator(), lg = c.createGain();
      l.frequency.value = o.vib[0] * (0.93 + Math.random() * 0.14); lg.gain.value = P[0][1] * o.vib[1];
      l.connect(lg).connect(osc.frequency); oscs.push(l);
    }
    // corps : filtres de formants en parallèle
    const body = c.createGain(); body.gain.value = 1;
    for (const [F, Q, A] of o.form) {
      const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = Q;
      if (typeof F === 'number') bp.frequency.value = F;
      else { bp.frequency.setValueAtTime(F[0], t); for (let i = 1; i < F.length; i++) bp.frequency.linearRampToValueAtTime(F[i], t + dur * i / (F.length - 1)); }
      const g = c.createGain(); g.gain.value = A;
      osc.connect(bp).connect(g).connect(body);
    }
    if (o.souffle) {
      const s = c.createBufferSource(); s.buffer = this.noise;
      const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = o.souffle[1] || 1500; f.Q.value = 0.8;
      const g = c.createGain(); g.gain.value = o.souffle[0];
      s.connect(f).connect(g).connect(body);
      s.loop = true; s.start(t, Math.random() * this.noise.duration); srcs.push(s);
    }
    let node = body;
    if (o.rug) { // rugosité : l'amplitude tremble vite
      const am = c.createGain(), l = c.createOscillator(), lg = c.createGain();
      am.gain.value = 1 - o.rug[1]; l.type = 'triangle'; l.frequency.value = o.rug[0] * (0.9 + Math.random() * 0.2); lg.gain.value = o.rug[1];
      l.connect(lg).connect(am.gain); body.connect(am); node = am; oscs.push(l);
    }
    const lpf = c.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = o.lp || 5000; lpf.Q.value = 0.5;
    node.connect(lpf);
    const g = c.createGain(); g.gain.value = 0;
    const v = Math.max(o.vol, 0.00012), a = o.a || clamp(dur * 0.12, 0.01, 0.08), r = o.r || dur * 0.35;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + a);
    g.gain.linearRampToValueAtTime(v * (o.sus || 0.85), t + Math.max(a + 0.002, dur - r)); // tenue qui s'affaisse (sans marche)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    lpf.connect(g).connect(d);
    for (const s of oscs) { s.start(t); s.stop(t + dur + 0.05); }
    for (const s of srcs) s.stop(t + dur + 0.05);
    this.mark(d, t + dur + 0.05);
  }

  // ---------------------------------------------------------------- tampons synthétisés (variantes gardées)
  // tampon(clé, n, durée, fn(d, sr, i)) : une variante au hasard, calculée à la première demande
  tampon(key, n, dur, fn, iv) {
    const arr = this._bufs[key] || (this._bufs[key] = []);
    const i = iv === undefined ? (Math.random() * n) | 0 : iv;
    if (!arr[i]) {
      // calculés à 22 050 Hz (tout est sous 8 kHz) : deux fois moins de calcul ; le navigateur rééchantillonne à la lecture
      const sr = Math.min(this.ctx.sampleRate, SoundEngine.SR_SYNTH), len = Math.max(32, Math.ceil(sr * dur)), b = this.ctx.createBuffer(1, len, sr), d = b.getChannelData(0);
      fn(d, sr, i);
      const fi = Math.min(24, len >> 3), fo = Math.min(Math.floor(len * 0.06), 2000);
      for (let k = 0; k < fi; k++) d[k] *= k / fi;
      for (let k = 0; k < fo; k++) d[len - 1 - k] *= k / fo;
      arr[i] = b;
    }
    return arr[i];
  }
  jouer(b, t, vol, out, rate, pan) {
    const c = this.ctx, s = c.createBufferSource(), g = c.createGain();
    s.buffer = b; s.playbackRate.value = rate || 1; g.gain.value = vol;
    let d = out || this.sfx;
    if (pan && !d._em && c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); p.connect(d); d = p; }
    s.connect(g).connect(d);
    s.start(t);
    this.mark(out || this.sfx, t + b.duration / (rate || 1) + 0.02);
    return s;
  }
}
SoundEngine.NUL = {};
// anciens assistants (le jeu ne s'en sert plus ; gardés pour qui les appellerait encore)
SoundEngine.buildWind = function (c, dest) {
  const src = c.createBufferSource();
  src.buffer = SoundEngine.brownBuffer(c, 6); src.loop = true;
  const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 70; hp.Q.value = 0.5;
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 320; lp.Q.value = 0.6;
  const g = c.createGain(); g.gain.value = 0;
  src.connect(hp).connect(lp).connect(g).connect(dest);
  src.start();
  return { src, lp, g };
};
SoundEngine.windLevel = function (t, high) {
  const gust = clamp(0.5 + 0.32 * Math.sin(t * 0.21) * Math.sin(t * 0.067 + 1.3) + 0.18 * Math.sin(t * 0.53 + 2.1), 0, 1);
  return { gain: (0.03 + 0.08 * gust) * (high ? 1.3 : 1), cutoff: 220 + 420 * gust };
};
SoundEngine.buildRain = function (c, dest) {
  const src = c.createBufferSource();
  src.buffer = SoundEngine.brownBuffer(c, 5); src.loop = true;
  const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 350; hp.Q.value = 0.5;
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400; lp.Q.value = 0.4;
  const g = c.createGain(); g.gain.value = 0;
  src.connect(hp).connect(lp).connect(g).connect(dest);
  src.start();
  return { g };
};
// fréquence d'échantillonnage des tampons synthétisés
SoundEngine.SR_SYNTH = 22050;
// équilibre des familles de sons (voix et interface : un peu en retrait)
SoundEngine.BUS = { voix: 0.9, ui: 0.7 };
// gain de sortie : compense le gain de rattrapage automatique du compresseur doux
SoundEngine.TRIM = 0.62;
// les lieux (réverbération) : longueur, pré-délai, T60 des graves et des aigus, premières réflexions, niveau
SoundEngine.LIEUX = {
  dehors: { len: 1.6, pre: 0.02, t60: 1.0, t60h: 0.35, split: 1100, hiK: 0.55, att: 0.03, lp: 4800, er: [[0.013, 0.22], [0.029, 0.1]], wet: 0.2 },
  foret: { len: 2.0, pre: 0.012, t60: 1.5, t60h: 0.5, split: 1000, hiK: 0.6, att: 0.02, lp: 4200, er: [[0.009, 0.25], [0.016, 0.22], [0.026, 0.18], [0.041, 0.13], [0.058, 0.09]], wet: 0.26 },
  montagne: { len: 3.0, pre: 0.02, t60: 1.6, t60h: 0.5, split: 900, hiK: 0.5, att: 0.03, lp: 3800, er: [[0.24, 0.3], [0.52, 0.2], [0.9, 0.12]], wet: 0.24 },
  piece: { len: 0.9, pre: 0.003, t60: 0.45, t60h: 0.25, split: 1400, hiK: 0.75, att: 0.004, lp: 5500, er: [[0.004, 0.45], [0.007, 0.38], [0.011, 0.32], [0.016, 0.26], [0.022, 0.2], [0.03, 0.14]], wet: 0.3 },
  salle: { len: 3.4, pre: 0.022, t60: 2.6, t60h: 1.2, split: 1000, hiK: 0.65, att: 0.03, lp: 4600, er: [[0.019, 0.32], [0.033, 0.28], [0.049, 0.22], [0.068, 0.18]], wet: 0.36 },
  grotte: { len: 4.2, pre: 0.03, t60: 3.2, t60h: 1.1, split: 850, hiK: 0.6, att: 0.02, lp: 3600, er: [[0.037, 0.4], [0.061, 0.34], [0.094, 0.28], [0.137, 0.22], [0.196, 0.16]], wet: 0.45 },
};

// ============================================================================
//  PETITE SYNTHÈSE « À L'ÉCHANTILLON » (tampons calculés une fois, variantes)
// ============================================================================
SoundEngine.SYN = {
  // filtre biquadratique (RBJ) : une fonction x → y ; 'lp', 'hp', 'bp' (0 dB au centre)
  bq(type, f, q, sr) {
    const w = 2 * Math.PI * Math.min(f, sr * 0.45) / sr, cs = Math.cos(w), sn = Math.sin(w), al = sn / (2 * q);
    let b0, b1, b2;
    if (type === 'lp') { b0 = (1 - cs) / 2; b1 = 1 - cs; b2 = b0; } else if (type === 'hp') { b0 = (1 + cs) / 2; b1 = -(1 + cs); b2 = b0; } else { b0 = al; b1 = 0; b2 = -al; }
    const a0 = 1 + al, a1 = -2 * cs / a0, a2 = (1 - al) / a0;
    b0 /= a0; b1 /= a0; b2 /= a0;
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    return (x) => { const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x; y2 = y1; y1 = y; return y; };
  },
  // un mode de vibration (bois, pierre, métal) : sinusoïde amortie
  mode(d, sr, t0, f, tau, a) {
    if (f > sr * 0.45) return; // au-delà de la moitié de la fréquence d'échantillonnage : on l'omet
    const i0 = Math.floor(t0 * sr), w = 2 * Math.PI * f / sr, k = Math.exp(-1 / (tau * sr)), at = Math.max(2, Math.floor(sr * 0.0008));
    let e = a, ph = Math.random() * 0.4;
    for (let i = i0, j = 0; i < d.length && e > 1e-5; i++, j++) { d[i] += Math.sin(ph) * e * (j < at ? j / at : 1); ph += w; e *= k; }
  },
  // un souffle de bruit enveloppé (attaque, déclin), passé dans un filtre
  bruit(d, sr, t0, att, tau, a, filt) {
    const i0 = Math.floor(t0 * sr), na = Math.max(1, att * sr), k = Math.exp(-1 / (tau * sr));
    let e = 1;
    for (let i = i0, j = 0; i < d.length; i++, j++) {
      let env;
      if (j < na) env = j / na; else { e *= k; env = e; if (e < 1e-3) break; }
      const x = Math.random() * 2 - 1;
      d[i] += (filt ? filt(x) : x) * env * a;
    }
  },
  // une note sifflée (oiseaux, grillons…) : glissement f0 → f1 (courbe c), vibrato, 2e harmonique, modulation d'amplitude
  note(d, sr, t0, dur, f0, f1, a, o) {
    o = o || {};
    const i0 = Math.floor(t0 * sr), n = Math.floor(dur * sr), c = o.c || 1, vib = o.vib || 0, vd = o.vd || 0, h2 = o.h2 || 0, am = o.am || 0, amd = o.amd || 0, dec2 = (o.dec || 1.5) > 2.2;
    let ph = 0;
    for (let j = 0; j < n && i0 + j < d.length; j++) {
      const u = j / n, tt = j / sr;
      const f = f0 + (f1 - f0) * (c === 1 ? u : Math.pow(u, c)) + (vib ? Math.sin(2 * Math.PI * vib * tt) * vd * f0 : 0);
      ph += 2 * Math.PI * f / sr;
      let env;
      if (o.att) { if (u < o.att) env = u / o.att; else { const r = 1 - (u - o.att) / (1 - o.att); env = r * r * (dec2 ? r : 1); } }
      else { const sn = Math.sin(Math.PI * u); env = sn * (1.35 - 0.35 * sn); } // ≈ sin^0.7, sans puissance
      if (am) env *= 1 - amd + amd * (0.5 + 0.5 * Math.sin(2 * Math.PI * am * tt));
      d[i0 + j] += (Math.sin(ph) + h2 * Math.sin(2 * ph)) * env * a;
    }
  },
  lp1(d, sr, f) { const a = Math.exp(-2 * Math.PI * f / sr); let y = 0; for (let i = 0; i < d.length; i++) { y = d[i] + (y - d[i]) * a; d[i] = y; } },
  norm(d, peak) { let m = 1e-9; for (let i = 0; i < d.length; i++) { const v = Math.abs(d[i]); if (v > m) m = v; } const k = (peak || 1) / m; for (let i = 0; i < d.length; i++) d[i] *= k; },
};

// les tampons : pas, gouttes, cris d'oiseaux… (chacun : fonction de remplissage ; normalisés à une crête de 1)
SoundEngine.TAMPONS = {
  // ---- les pas : talon puis semelle, sourds et feutrés (on les sent plus qu'on ne les entend)
  herbe: [0.2, (d, sr) => {
    const R = Math.random, S = SoundEngine.SYN, b1 = S.bq('bp', 650 + R() * 400, 0.7, sr), b2 = S.bq('bp', 1300 + R() * 500, 1, sr);
    for (const [t0, a] of [[0.006, 1], [0.04 + R() * 0.03, 0.55 + R() * 0.25]]) {
      S.bruit(d, sr, t0, 0.009 + R() * 0.005, 0.03 + R() * 0.02, 0.55 * a, b1);
      const n = 3 + ((R() * 5) | 0);
      for (let k = 0; k < n; k++) S.bruit(d, sr, t0 + R() * 0.07, 0.0015, 0.003 + R() * 0.003, (0.05 + R() * 0.08) * a, b2);
      S.mode(d, sr, t0, 70 + R() * 20, 0.024, 0.2 * a);
    }
    S.lp1(d, sr, 2600);
  }],
  terre: [0.2, (d, sr) => {
    const R = Math.random, S = SoundEngine.SYN, l = S.bq('lp', 480 + R() * 220, 0.7, sr), b = S.bq('bp', 1300, 1, sr);
    for (const [t0, a] of [[0.006, 1], [0.045 + R() * 0.02, 0.5]]) {
      S.bruit(d, sr, t0, 0.008, 0.032 + R() * 0.015, 0.8 * a, l);
      S.mode(d, sr, t0, 64 + R() * 18, 0.03, 0.35 * a);
      for (let k = 0; k < 3; k++) S.bruit(d, sr, t0 + R() * 0.05, 0.0015, 0.003, 0.04 * a, b);
    }
    S.lp1(d, sr, 2200);
  }],
  pierre: [0.16, (d, sr) => {
    // (une semelle de cuir sur le pavé : un « toc » mat, sans claquement aigu)
    const R = Math.random, S = SoundEngine.SYN, t0 = 0.004;
    S.mode(d, sr, t0, 1100 + R() * 400, 0.005, 0.08); S.mode(d, sr, t0, 420 + R() * 120, 0.014, 0.28);
    S.mode(d, sr, t0, 110 + R() * 25, 0.02, 0.5);
    S.bruit(d, sr, t0, 0.003, 0.008, 0.08, S.bq('bp', 1200, 0.8, sr));
    S.bruit(d, sr, t0 + 0.03 + R() * 0.02, 0.008, 0.022, 0.07, S.bq('bp', 800, 0.8, sr));
    S.lp1(d, sr, 2600);
  }],
  bois: [0.22, (d, sr) => {
    const R = Math.random, S = SoundEngine.SYN;
    for (const [t0, a] of [[0.004, 1], [0.05 + R() * 0.02, 0.4]]) {
      S.mode(d, sr, t0, 130 + R() * 45, 0.05, 0.55 * a); S.mode(d, sr, t0, 340 + R() * 100, 0.026, 0.28 * a); S.mode(d, sr, t0, 820 + R() * 200, 0.009, 0.06 * a);
      S.bruit(d, sr, t0, 0.003, 0.006, 0.08 * a, S.bq('lp', 1300, 0.7, sr));
    }
    S.lp1(d, sr, 2800);
  }],
  eau: [0.4, (d, sr) => {
    const R = Math.random, S = SoundEngine.SYN;
    S.bruit(d, sr, 0.005, 0.014, 0.075, 0.5, S.bq('bp', 1000 + R() * 500, 0.7, sr));
    S.bruit(d, sr, 0.01, 0.02, 0.11, 0.5, S.bq('lp', 420, 0.7, sr));
    for (let k = 0, n = 3 + ((R() * 3) | 0); k < n; k++) { const f = 450 + R() * 900; S.note(d, sr, 0.03 + R() * 0.22, 0.025 + R() * 0.03, f, f * 1.7, 0.1 + R() * 0.1, { att: 0.12, dec: 2 }); }
    S.lp1(d, sr, 5000);
  }],
  neige: [0.2, (d, sr) => {
    const R = Math.random, S = SoundEngine.SYN, b = S.bq('bp', 1000 + R() * 400, 0.7, sr);
    for (let k = 0; k < 70; k++) S.bruit(d, sr, 0.004 + Math.pow(R(), 1.6) * 0.12, 0.0008, 0.0018 + R() * 0.002, 0.2 + R() * 0.2, b);
    S.mode(d, sr, 0.004, 78, 0.022, 0.2);
    S.lp1(d, sr, 2600);
  }],
  // ---- eau
  plouf: [0.75, (d, sr) => {
    const R = Math.random, S = SoundEngine.SYN;
    S.bruit(d, sr, 0.003, 0.003, 0.045, 0.55, S.bq('bp', 1400, 0.6, sr));
    S.bruit(d, sr, 0.006, 0.02, 0.17, 0.55, S.bq('lp', 850, 0.7, sr));
    S.bruit(d, sr, 0.07, 0.05, 0.2, 0.25, S.bq('bp', 600, 0.8, sr));
    for (let k = 0; k < 11; k++) { const tt = 0.04 + R() * 0.5, f = 550 + R() * 1400; S.note(d, sr, tt, 0.02 + R() * 0.04, f, f * 1.5, (0.1 + R() * 0.12) * (1 - tt), { att: 0.08, dec: 2 }); }
    S.lp1(d, sr, 5000);
  }],
  goutte: [0.3, (d, sr) => { // goutte qui tombe dans une flaque (grotte, puits)
    const R = Math.random, S = SoundEngine.SYN, f = 700 + R() * 900;
    S.note(d, sr, 0.004, 0.06 + R() * 0.03, f, f * (1.5 + R() * 0.5), 0.8, { att: 0.05, dec: 2.2, c: 0.5 });
    S.bruit(d, sr, 0.004, 0.001, 0.004, 0.15, S.bq('bp', 2500, 1, sr));
    S.lp1(d, sr, 6000);
  }],
  // ---- interface et petits objets
  pieces: [0.5, (d, sr) => {
    const R = Math.random, S = SoundEngine.SYN;
    for (let k = 0, t = 0.004; k < 3; k++, t += 0.045 + R() * 0.06) {
      const f = 1500 + R() * 600, a = k ? 0.6 : 1;
      S.mode(d, sr, t, f, 0.09, 0.5 * a); S.mode(d, sr, t, f * 2.38, 0.05, 0.22 * a); S.mode(d, sr, t, f * 3.9, 0.025, 0.08 * a);
      S.bruit(d, sr, t, 0.0005, 0.002, 0.1 * a, S.bq('bp', 3000, 1, sr));
    }
    S.lp1(d, sr, 7000);
  }],
  page: [0.4, (d, sr) => {
    const R = Math.random, S = SoundEngine.SYN, b = S.bq('bp', 1700 + R() * 700, 0.6, sr);
    S.bruit(d, sr, 0.01, 0.04, 0.09, 0.3, b);
    for (let k = 0; k < 26; k++) S.bruit(d, sr, 0.01 + Math.pow(R(), 0.8) * 0.25, 0.001, 0.004 + R() * 0.006, 0.15 + R() * 0.2, b);
    S.lp1(d, sr, 4500);
  }],
  toc: [0.25, (d, sr) => { // jointure sur une porte de bois
    const R = Math.random, S = SoundEngine.SYN, t0 = 0.003;
    S.mode(d, sr, t0, 120 + R() * 40, 0.045, 0.6); S.mode(d, sr, t0, 300 + R() * 90, 0.025, 0.4); S.mode(d, sr, t0, 760 + R() * 200, 0.01, 0.16);
    S.bruit(d, sr, t0, 0.001, 0.004, 0.2, S.bq('lp', 1500, 0.7, sr));
  }],
  coup: [0.3, (d, sr) => { // un coup sur du dur (bois, pierre)
    const R = Math.random, S = SoundEngine.SYN, t0 = 0.003;
    S.mode(d, sr, t0, 170 + R() * 60, 0.03, 0.45); S.mode(d, sr, t0, 780 + R() * 300, 0.014, 0.3); S.mode(d, sr, t0, 1700 + R() * 500, 0.007, 0.16);
    S.bruit(d, sr, t0, 0.0012, 0.006, 0.25, S.bq('bp', 1400, 0.8, sr));
    S.lp1(d, sr, 6000);
  }],
  sabot: [0.2, (d, sr) => { // sabot de cheval
    const R = Math.random, S = SoundEngine.SYN, t0 = 0.003;
    S.mode(d, sr, t0, 420 + R() * 160, 0.018, 0.5); S.mode(d, sr, t0, 1100 + R() * 300, 0.008, 0.2); S.mode(d, sr, t0, 95 + R() * 20, 0.03, 0.4);
    S.bruit(d, sr, t0, 0.001, 0.008, 0.25, S.bq('bp', 900, 0.8, sr));
  }],
  croque: [0.12, (d, sr) => {
    const R = Math.random, S = SoundEngine.SYN, b = S.bq('bp', 1100 + R() * 500, 0.9, sr);
    for (let k = 0; k < 14; k++) S.bruit(d, sr, 0.003 + Math.pow(R(), 1.5) * 0.06, 0.0005, 0.003 + R() * 0.004, 0.3 + R() * 0.3, b);
    S.mode(d, sr, 0.003, 150, 0.02, 0.2);
    S.lp1(d, sr, 3500);
  }],
  // ---- oiseaux
  merle: [2.0, (d, sr) => {
    const R = Math.random, S = SoundEngine.SYN, base = 1650 + R() * 450;
    let t = 0.03;
    for (let k = 0, n = 4 + ((R() * 5) | 0); k < n && t < 1.5; k++) {
      const du = 0.07 + R() * 0.14, f0 = base * (0.85 + R() * 0.6), f1 = f0 * (0.78 + R() * 0.5);
      S.note(d, sr, t, du, f0, f1, 0.5 + R() * 0.3, { vib: 22 + R() * 20, vd: 0.012, h2: 0.08, c: 0.7 });
      t += du + 0.02 + R() * 0.07;
    }
    if (R() < 0.5) for (let k = 0, n = 4 + ((R() * 4) | 0); k < n && t < 1.9; k++) { const f = 2700 + R() * 1000; S.note(d, sr, t, 0.03, f, f * 0.8, 0.16, {}); t += 0.042; }
  }],
  mesange: [1.6, (d, sr) => {
    const R = Math.random, S = SoundEngine.SYN, fA = 3300 + R() * 400, fB = 2400 + R() * 300;
    for (let k = 0, t = 0.03, n = 3 + ((R() * 3) | 0); k < n; k++, t += 0.24) { S.note(d, sr, t, 0.07, fA, fA * 0.95, 0.42, {}); S.note(d, sr, t + 0.1, 0.09, fB, fB * 0.97, 0.5, {}); }
  }],
  pinson: [1.4, (d, sr) => {
    const R = Math.random, S = SoundEngine.SYN, f = 2900 + R() * 400;
    let t = 0.03, per = 0.078;
    for (let k = 0, n = 8 + ((R() * 5) | 0); k < n; k++) { const ff = f * (1 - k * 0.013); S.note(d, sr, t, 0.045, ff, ff * 0.76, 0.4, {}); t += per; per *= 0.96; }
    S.note(d, sr, t + 0.03, 0.2, 3400, 1900, 0.5, { c: 0.6 });
  }],
  tourterelle: [1.8, (d, sr) => {
    const R = Math.random, S = SoundEngine.SYN, f = 520 + R() * 60;
    for (let k = 0; k < 3; k++) S.note(d, sr, 0.05 + k * 0.56, 0.46, f, f * 0.93, 0.6, { am: 26 + R() * 6, amd: 0.75, h2: 0.18 });
  }],
  coucou: [2.4, (d, sr) => {
    const S = SoundEngine.SYN;
    for (let k = 0; k < 3; k++) { const t = 0.05 + k * 0.78; S.note(d, sr, t, 0.22, 720, 700, 0.6, { h2: 0.05 }); S.note(d, sr, t + 0.29, 0.32, 585, 560, 0.6, { h2: 0.05 }); }
  }],
  alouette: [3.4, (d, sr) => {
    const R = Math.random, S = SoundEngine.SYN;
    for (let t = 0.03; t < 3.2;) { const du = 0.03 + R() * 0.06, f0 = 2500 + R() * 1700, f1 = f0 * (0.85 + R() * 0.3); S.note(d, sr, t, du, f0, f1, 0.22 + R() * 0.2, { vib: 55, vd: 0.02 }); t += du + R() * 0.025; }
  }],
  moineau: [1.2, (d, sr) => {
    const R = Math.random, S = SoundEngine.SYN;
    for (let k = 0, t = 0.03, n = 3 + ((R() * 4) | 0); k < n; k++, t += 0.13 + R() * 0.12) { const f = 2600 + R() * 600; S.note(d, sr, t, 0.05, f * 1.2, f * 0.8, 0.45, { vib: 170, vd: 0.05, h2: 0.25 }); }
  }],
  chouette: [3.4, (d, sr) => { // « hou… hou-hou-hou-houuu »
    const R = Math.random, S = SoundEngine.SYN, f = 400 + R() * 40;
    S.note(d, sr, 0.03, 0.5, f * 1.04, f, 0.6, { vib: 5, vd: 0.008, h2: 0.06 });
    let t = 1.5 + R() * 0.5;
    for (let k = 0; k < 3; k++) { S.note(d, sr, t, 0.11, f * 1.06, f, 0.42, { h2: 0.05 }); t += 0.17; }
    S.note(d, sr, t + 0.05, 0.8, f * 1.05, f * 0.96, 0.55, { vib: 7, vd: 0.02, h2: 0.06 });
  }],
  grillon: [2.0, (d, sr) => { // un grillon qui chante tout seul (en boucle)
    const R = Math.random, S = SoundEngine.SYN, f = 4100 + R() * 500, per = 0.42 + R() * 0.3;
    for (let t = 0.03 + R() * 0.2; t < 1.9; t += per * (0.93 + R() * 0.14)) for (let p = 0, n = 3 + ((R() * 2) | 0); p < n; p++) S.note(d, sr, t + p * 0.027, 0.016, f, f * 0.99, 0.5, { att: 0.25, dec: 1.2 });
  }],
  grenouille: [0.5, (d, sr) => { // « rrrôa » : un roulement grave et mou (de loin, une rafale sèche sonnait comme un coup de feu)
    const R = Math.random, S = SoundEngine.SYN, f = 380 + R() * 200, rate = 18 + R() * 9, du = 0.22 + R() * 0.15, b = S.bq('bp', f, 1.8, sr);
    for (let t = 0.02, k = 0; t < du; t += 1 / rate, k++) S.bruit(d, sr, t, 0.004, 0.016, 0.45 * Math.sin(Math.PI * t / du), b);
    S.note(d, sr, 0.02, du, f * 0.9, f * 0.8, 0.12, { att: 0.3, dec: 1.5 });
    S.lp1(d, sr, 1500);
  }],
  pic: [1.2, (d, sr) => { // pic qui tambourine
    const R = Math.random, S = SoundEngine.SYN, f = 850 + R() * 400;
    let t = 0.02, per = 0.05;
    for (let k = 0, n = 12 + ((R() * 8) | 0); k < n; k++) { const a = 0.5 * (1 - k / (n + 4)); S.mode(d, sr, t, f, 0.012, a); S.mode(d, sr, t, f * 2.3, 0.005, a * 0.3); t += per; per *= 1.012; }
  }],
  crepite: [0.05, (d, sr) => { // un crépitement de feu
    const R = Math.random, S = SoundEngine.SYN;
    S.bruit(d, sr, 0.001, 0.0004, 0.002 + R() * 0.004, 1, S.bq('bp', 1200 + R() * 2000, 1.2, sr));
    S.lp1(d, sr, 5000);
  }],
};
// volumes de base des pas (crête)
SoundEngine.PAS = { herbe: 0.019, terre: 0.023, pierre: 0.044, bois: 0.017, eau: 0.028, neige: 0.02 };

Object.assign(SoundEngine.prototype, {
  // un tampon de la bibliothèque (variantes gardées : n par sorte)
  tb(nom, n, iv) {
    const T = SoundEngine.TAMPONS[nom];
    return this.tampon(nom, n || 6, T[0], (d, sr, i) => { T[1](d, sr, i); SoundEngine.SYN.norm(d, 1); }, iv);
  },
  // mise en train : les tampons se calculent un par un, en tâche de fond (jamais tous d'un coup pendant le jeu)
  chauffer() {
    if (!this._chauffe) {
      const L = [], T = (nom, n) => { for (let i = 0; i < n; i++) L.push(() => this.tb(nom, n, i)); };
      for (const k of ['herbe', 'terre', 'pierre', 'bois']) T(k, 6);
      for (const k of ['coup', 'toc', 'pieces', 'page']) T(k, 6);
      L.push(() => this.boucleTampon && this.boucleTampon('bruit'), () => this.boucleTampon && this.boucleTampon('gouttes'));
      for (const k of ['merle', 'mesange', 'pinson', 'tourterelle', 'moineau', 'alouette', 'coucou']) T(k, 5);
      T('chouette', 4); T('pic', 4);
      for (const k of ['eau', 'neige', 'sabot', 'croque', 'grenouille']) T(k, 6);
      T('plouf', 5); T('goutte', 8);
      for (const k of ['grillon', 'feuilles', 'riviere', 'clapotis', 'feu', 'bourdon']) L.push(() => this.boucleTampon && this.boucleTampon(k));
      this._chauffe = L;
    }
    const f = this._chauffe.shift();
    if (f) f();
    return this._chauffe.length;
  },

  // ------------------------------------------------------------ tonnerre (vient de l'éclair : portée « ici », sinon d'une direction au hasard)
  thunder(k) {
    if (!this.ok) return;
    const c = this.ctx, t = c.currentTime + 0.02, K = clamp(k, 0.2, 1), R = Math.random, L = this.L;
    const S = this._scope, dist = 180 + (1 - K) * 1300;
    let pos = S ? this.pos3(S.src) : null;
    if (!pos) { const a = R() * TAU; pos = [L.x + Math.cos(a) * dist, L.y + 150 + R() * 250, L.z + Math.sin(a) * dist]; }
    // le grondement roule le long de l'horizon : une seconde source, décalée
    const a0 = Math.atan2(pos[2] - L.z, pos[0] - L.x) + (R() < 0.5 ? -1 : 1) * (0.35 + R() * 0.4), d0 = Math.hypot(pos[0] - L.x, pos[2] - L.z) * 1.1;
    const pos2 = [L.x + Math.cos(a0) * d0, pos[1] * 0.8, L.z + Math.sin(a0) * d0];
    const A = this.B.amb.inp, o1 = this.emit(pos, A, { att: 'aucune', dur: 9 }), o2 = this.emit(pos2, A, { att: 'aucune', dur: 9 });
    if (K > 0.62) { // claquement de l'éclair tout proche
      this.noiseHit(t, 0.1, 'bandpass', 1500, 0.5, 0.2 * K, o1, 500);
      this.noiseHit(t + 0.012, 0.45, 'lowpass', 2400, 0.6, 0.28 * K, o1, 260);
    }
    const s = c.createBufferSource(); s.buffer = this.brown; s.loop = true;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 0.6;
    lp.frequency.setValueAtTime(420 + 520 * K, t); lp.frequency.exponentialRampToValueAtTime(75, t + 4 + K * 2);
    const g = c.createGain(), g2 = c.createGain(), v = 0.34 * (0.25 + 0.75 * K);
    g.gain.value = 0; g2.gain.value = 0;
    // plusieurs roulements qui se chevauchent
    let tt = t + 0.04 + (1 - K) * 0.4;
    g.gain.setValueAtTime(0.0001, t); g2.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, tt);
    const n = 3 + ((R() * 3) | 0);
    for (let i = 0; i < n; i++) {
      const p = v * (0.45 + R() * 0.5) * (1 - i / (n + 1)), dt = 0.5 + R() * 0.9;
      g.gain.linearRampToValueAtTime(p * 0.55, tt + dt * 0.5); g.gain.linearRampToValueAtTime(p, tt + dt);
      g2.gain.linearRampToValueAtTime(p * 0.8, tt + dt * 0.7);
      tt += dt;
    }
    g.gain.exponentialRampToValueAtTime(0.0001, tt + 1.8 + K);
    g2.gain.exponentialRampToValueAtTime(0.0001, tt + 2.2 + K);
    s.connect(lp); lp.connect(g).connect(o1); lp.connect(g2).connect(o2);
    s.start(t, R() * 2); s.stop(tt + 3.4 + K);
    this.mark(o1, tt + 3.4 + K); this.mark(o2, tt + 3.4 + K);
    // un souffle très grave, qu'on sent plus qu'on n'entend
    this.tone(t + 0.05, 'sine', 48, 34, 2.5 + K, 0.12 * K, o1, 0.3);
  },

  // ------------------------------------------------------------ cris des bêtes (formants, vibrato, rugosité ; jamais deux fois pareil)
  animal(kind, pan, k) {
    if (!this.ok) return;
    const t = this.ctx.currentTime + 0.02, p = this.pan(pan, this.amb), v = clamp(k, 0, 1), R = Math.random;
    switch (kind) {
      case 'sheep': {
        const f = 285 + R() * 65, du = 0.55 + R() * 0.35, vr = 6.2 + R() * 1.4;
        this.cri(t, { dur: du, f: [[0, f * 0.95], [0.15, f * 1.05], [1, f * 0.88]], vib: [vr, 0.03], rug: [vr, 0.45], form: [[720, 5, 1], [1700, 7, 0.55], [2700, 9, 0.18]], souffle: [0.05, 2000], vol: 0.13 * v, lp: 4200 }, p);
        break;
      }
      case 'cow': {
        const f = 105 + R() * 28, du = 1.1 + R() * 0.55;
        this.cri(t, { dur: du, f: [[0, f * 0.9], [0.25, f * 1.08], [0.7, f * 1.02], [1, f * 0.84]], vib: [4, 0.01], form: [[[250, 520, 600, 330], 4, 1], [[820, 1040, 1120, 880], 6, 0.45], [2300, 8, 0.1]], souffle: [0.035, 800], vol: 0.18 * v, lp: 2600, a: 0.14, r: du * 0.4 }, p);
        break;
      }
      case 'pig': {
        if (v > 0.95 && R() < 0.5) { // le cochon (ou le sanglier) qui charge : un cri aigu
          this.cri(t, { dur: 0.5, f: [[0, 820], [0.3, 1150], [1, 700]], vib: [9, 0.04], rug: [30, 0.3], form: [[1300, 3, 1], [2600, 5, 0.35]], souffle: [0.1, 1800], vol: 0.066 * v, lp: 4000 }, p);
          break;
        }
        for (let i = 0, n = 2 + ((R() * 3) | 0), tt = t; i < n; i++) {
          const f = 95 + R() * 40, du = 0.13 + R() * 0.1;
          this.cri(tt, { type: 'square', dur: du, f: [[0, f * 1.1], [1, f * 0.84]], rug: [38 + R() * 14, 0.7], form: [[450, 3, 1], [1100, 5, 0.35]], souffle: [0.3, 700], vol: 0.15 * v, lp: 2400, a: 0.015 }, p);
          tt += du + 0.06 + R() * 0.12;
        }
        break;
      }
      case 'hen': {
        let tt = t;
        for (let i = 0, n = 3 + ((R() * 4) | 0); i < n; i++) {
          const f = 560 + R() * 240, du = 0.06 + R() * 0.035;
          this.cri(tt, { dur: du, f: [[0, f * 1.15], [1, f * 0.8]], form: [[950, 3, 1], [1900, 5, 0.35]], vol: 0.065 * v, lp: 3800, a: 0.008 }, p);
          tt += du + 0.05 + R() * 0.09;
        }
        if (R() < 0.35) this.cri(tt + 0.05, { dur: 0.36, f: [[0, 680], [0.3, 960], [1, 780]], vib: [8, 0.02], form: [[1050, 3, 1], [2100, 5, 0.3]], vol: 0.06 * v, lp: 3800 }, p);
        break;
      }
      case 'horse': {
        const du = 1.0 + R() * 0.35, f = 700 + R() * 120;
        this.cri(t, { dur: du, f: [[0, f], [0.15, f * 1.2], [0.6, f * 0.85], [1, f * 0.5]], vib: [11 + R() * 3, 0.07], rug: [12, 0.25], form: [[1000, 3, 1], [2000, 4, 0.45], [3000, 6, 0.12]], souffle: [0.07, 1500], vol: 0.074 * v, lp: 3800 }, p);
        this.noiseHit(t + du + 0.05, 0.28, 'lowpass', 1100, 0.6, 0.012 * v, p, 400); // l'ébrouement
        break;
      }
      case 'duck': {
        for (let i = 0, n = 2 + ((R() * 3) | 0), tt = t; i < n; i++) {
          const f = 240 + R() * 50, du = 0.11 + R() * 0.05;
          this.cri(tt, { type: 'square', dur: du, f: [[0, f * 1.1], [1, f * 0.9]], rug: [55, 0.35], form: [[1000, 6, 1], [2300, 8, 0.4]], vol: 0.11 * v, lp: 2600, a: 0.025 }, p);
          tt += du + 0.08 + R() * 0.1;
        }
        break;
      }
      default: return;
    }
  },

  // ------------------------------------------------------------ oiseaux, grillons, chouette (anciens appels : direction au hasard)
  oiseau(sorte, pos, k, n) {
    if (!this.ok) return;
    const R = Math.random, b = this.tb(sorte, n || 5), out = pos ? this.en3d(pos, this.B.amb.inp, { ref: 7, roll: 0.9, dur: b.duration + 0.2 }) : this.amb;
    const vol = (SoundEngine.VOL_OISEAUX[sorte] || 0.05) * (k === undefined ? 1 : k) * (0.8 + R() * 0.4), t = this.at(0.01), rate = 0.94 + R() * 0.12;
    this.jouer(b, t, vol, out, rate);
    // (un oiseau chante jusqu'à… : les autres attendent leur tour)
    if (sorte !== 'chouette') this.oiseauxFin = Math.max(this.oiseauxFin || 0, t + b.duration / rate);
  },
  chirp(k) {
    if (!this.ok) return;
    const p = this._scope ? null : this.virt(Math.random() * 2 - 1, 10 + Math.random() * 20);
    if (p) p[1] += 3 + Math.random() * 6;
    this.oiseau(['merle', 'mesange', 'pinson'][(Math.random() * 3) | 0], p, k * 2.2);
  },
  cricket(k) {
    if (!this.ok) return;
    const p = this._scope ? null : this.virt(Math.random() * 2 - 1, 4 + Math.random() * 8), t = this.at();
    if (p) p[1] -= 1.4;
    const out = p ? this.en3d(p, this.B.amb.inp, { ref: 2, dur: 1 }) : this.amb, f = 4100 + Math.random() * 400;
    for (let i = 0, n = 2 + ((Math.random() * 3) | 0); i < n; i++) this.tone(t + i * 0.028, 'sine', f, f * 0.99, 0.018, 0.1 * k, out, 0.004);
  },
  owl() {
    if (!this.ok) return;
    const p = this._scope ? null : this.virt(Math.random() * 1.6 - 0.8, 25 + Math.random() * 30, Math.random() < 0.5);
    if (p) p[1] += 8;
    this.oiseau('chouette', p, 1, 4);
  },

  // ------------------------------------------------------------ bruitages
  shot() {
    if (!this.ok) return;
    const t = this.ctx.currentTime + 0.005;
    this.noiseHit(t, 0.3, 'lowpass', 4200, 0.7, 1.0, null, 260);
    this.tone(t, 'sine', 135, 40, 0.24, 1.0, null, 0.002);
    this.noiseHit(t + 0.015, 0.8, 'lowpass', 900, 0.5, 0.12, null, 110);
    this.tone(t + 0.004, 'triangle', 2000, 1500, 0.02, 0.015);
  },
  dryFire() {
    if (!this.ok) return;
    const t = this.at();
    this.tone(t, 'triangle', 1700, 1350, 0.022, 0.14, null, 0.002);
    this.noiseHit(t, 0.012, 'bandpass', 2400, 1.2, 0.12);
  },
  reload() {
    if (!this.ok) return;
    const t = this.at();
    const clac = (tt, f, v) => { this.jouer(this.tb('coup'), tt, v, this.sfx, f); this.tone(tt, 'triangle', 900 * f, 620 * f, 0.04, v * 0.12); };
    clac(t + 0.05, 1.5, 0.05);
    this.noiseHit(t + 0.14, 0.12, 'bandpass', 900, 1, 0.015, null, 600);
    clac(t + 0.58, 1.7, 0.055);
    clac(t + 0.63, 1.2, 0.07);
  },
  // les pas (du joueur) : selon le sol, un pied puis l'autre, jamais deux fois le même
  step(mat, speed) {
    if (!this.ok) return;
    const R = Math.random, sp = Math.min(speed || 4, 9);
    let k = mat === 'water' ? 'eau' : mat === 'hard' ? 'pierre' : mat === 'wood' ? 'bois' : mat === 'soft' ? 'terre' : 'herbe';
    if (k === 'pierre' && !this._scope && this.surNeige()) k = 'neige';
    this.pied = -this.pied;
    // (courir s'entend un peu plus, pas beaucoup ; les pas des autres, placés autour de vous, un peu moins)
    const v = SoundEngine.PAS[k] * (0.52 + sp / 9 * 0.3) * (0.9 + R() * 0.2) * (this._scope ? 0.65 : 1);
    this.jouer(this.tb(k), this.at(), v, this.sfx, 0.88 + R() * 0.12, this._scope ? 0 : this.pied * 0.08);
    if (k === 'bois' && R() < 0.04) this.voice(this.at(0.05), 'sawtooth', 230 + R() * 80, 180 + R() * 40, 0.3 + R() * 0.2, 0.006, this.sfx, { bp: 700, q: 3, vib: 9, vibDepth: 12 });
  },
  // le joueur marche-t-il sur la neige ? (le sol de neige compte pour « dur » dans le jeu)
  surNeige() {
    try { const p = game.player, m = game.world.matAt(p.pos[0], p.pos[2]); return m === M_SNOW; } catch (e) { return false; }
  },
  land(k) {
    if (!this.ok) return;
    const t = this.at(), s = this.surNeige() ? 'neige' : 'terre';
    this.jouer(this.tb(s), t, 0.1 * k, this.sfx, 0.8, -0.1);
    this.jouer(this.tb(s), t + 0.035, 0.08 * k, this.sfx, 0.86, 0.1);
    this.tone(t, 'sine', 90, 45, 0.16, 0.07 * k, null, 0.004);
  },
  splash() { if (this.ok) this.jouer(this.tb('plouf', 5), this.at(), 0.073, this.sfx, 0.9 + Math.random() * 0.2); },
  click() { if (!this.ok) return; const t = this.at(); this.tone(t, 'sine', 1050, 720, 0.035, 0.08, this.ui, 0.002); this.noiseHit(t, 0.01, 'lowpass', 2500, 0.7, 0.04, this.ui); },
  pop() { if (!this.ok) return; const t = this.at(); this.tone(t, 'sine', 380, 760, 0.075, 0.11, this.ui, 0.004); this.tone(t + 0.01, 'sine', 760, 1150, 0.05, 0.02, this.ui, 0.004); },
  remove() { if (this.ok) this.tone(this.at(), 'sine', 640, 280, 0.1, 0.1, this.ui, 0.004); },
  impact(kind) {
    if (!this.ok) return;
    const t = this.ctx.currentTime + 0.03, R = Math.random;
    if (kind === 'hard') this.jouer(this.tb('coup'), t, 0.12, this.sfx, 0.9 + R() * 0.25);
    else { this.jouer(this.tb('terre'), t, 0.042, this.sfx, 0.8 + R() * 0.2); this.noiseHit(t, 0.07, 'lowpass', 600, 0.8, 0.012); }
  },
});
// volume de chaque oiseau (crête)
SoundEngine.VOL_OISEAUX = { merle: 0.085, mesange: 0.052, pinson: 0.06, tourterelle: 0.075, coucou: 0.075, alouette: 0.038, moineau: 0.048, chouette: 0.15, pic: 0.075 };

const sound = new SoundEngine();

// l'écouteur suit exactement la caméra rendue (cinématiques comprises)
if (typeof Renderer !== 'undefined' && Renderer.prototype && Renderer.prototype.render) {
  const _render = Renderer.prototype.render;
  Renderer.prototype.render = function (F) {
    try { if (F && F.cam && sound.ctx) { sound.ecoute(F.cam.pos, F.cam.yaw, F.cam.pitch); sound._rendT = performance.now(); } } catch (e) { /* rien */ }
    return _render.call(this, F);
  };
}
