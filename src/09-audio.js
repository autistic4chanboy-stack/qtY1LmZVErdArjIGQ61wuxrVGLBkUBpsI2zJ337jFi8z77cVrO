// ============================================================================
//  AUDIO PROCÉDURAL (WebAudio) : vent, oiseaux, grillons, chouette, feu, bruitages
// ============================================================================

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.volume = 0.6;
    this.ambVolume = 0.5;
    this.birdT = 1; this.cricketT = 0.5; this.owlT = 20; this.crackleT = 0;
  }

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
  // Chaîne du vent : bruit brun -> passe-haut 70 Hz -> passe-bas mobile -> gain
  static buildWind(c, dest) {
    const src = c.createBufferSource();
    src.buffer = SoundEngine.brownBuffer(c, 6);
    src.loop = true;
    const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 70; hp.Q.value = 0.5;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 320; lp.Q.value = 0.6;
    const g = c.createGain(); g.gain.value = 0;
    src.connect(hp).connect(lp).connect(g).connect(dest);
    src.start();
    return { src, lp, g };
  }
  static windLevel(t, high) {
    const gust = clamp(0.5 + 0.32 * Math.sin(t * 0.21) * Math.sin(t * 0.067 + 1.3) + 0.18 * Math.sin(t * 0.53 + 2.1), 0, 1);
    return { gain: (0.03 + 0.08 * gust) * (high ? 1.3 : 1), cutoff: 220 + 420 * gust };
  }
  // Pluie : bruit brun filtré (doux, sans souffle aigu)
  static buildRain(c, dest) {
    const src = c.createBufferSource();
    src.buffer = SoundEngine.brownBuffer(c, 5);
    src.loop = true;
    const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 350; hp.Q.value = 0.5;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400; lp.Q.value = 0.4;
    const g = c.createGain(); g.gain.value = 0;
    src.connect(hp).connect(lp).connect(g).connect(dest);
    src.start();
    return { g };
  }

  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const c = this.ctx = new AC();
      this.master = c.createGain(); this.master.gain.value = this.volume;
      // simple limiteur (pas de gain de compensation audible)
      const lim = c.createDynamicsCompressor();
      lim.threshold.value = -4; lim.knee.value = 4; lim.ratio.value = 12; lim.attack.value = 0.002; lim.release.value = 0.15;
      this.master.connect(lim).connect(c.destination);
      this.sfx = c.createGain(); this.sfx.connect(this.master);
      this.amb = c.createGain(); this.amb.gain.value = this.ambVolume; this.amb.connect(this.master);
      const len = c.sampleRate * 2, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.noise = buf; // bruit blanc : uniquement pour des impacts très courts
      this.brown = SoundEngine.brownBuffer(c, 3);
      this.wind = SoundEngine.buildWind(c, this.amb);
      this.rainSnd = SoundEngine.buildRain(c, this.amb);
    } catch (e) { this.ctx = null; }
  }
  setVolume(v) {
    this.volume = v;
    if (this.master) this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
  }
  setAmbient(v) {
    this.ambVolume = v;
    if (this.amb) this.amb.gain.setTargetAtTime(v, this.ctx.currentTime, 0.1);
  }
  get ok() { return this.ctx && this.ctx.state === 'running' && this.volume > 0; }

  pan(p, dest) {
    const c = this.ctx;
    const s = c.createStereoPanner ? c.createStereoPanner() : c.createGain();
    if (s.pan) s.pan.value = clamp(p, -1, 1);
    s.connect(dest || this.sfx);
    return s;
  }
  env(g, t, a, peak, dur) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }
  noiseHit(t, dur, type, freq, q, vol, out, sweepTo) {
    const c = this.ctx, s = c.createBufferSource();
    s.buffer = this.noise;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    const g = c.createGain(); g.gain.value = 0; this.env(g, t, 0.004, vol, dur);
    s.connect(f).connect(g).connect(out || this.sfx);
    s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.05);
  }
  tone(t, type, f0, f1, dur, vol, out, attack = 0.005) {
    const c = this.ctx, o = c.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = c.createGain(); g.gain.value = 0; this.env(g, t, attack, vol, dur);
    o.connect(g).connect(out || this.sfx);
    o.start(t); o.stop(t + dur + 0.05);
  }

  // ------------------------------------------------------------ ambiance
  update(dt, E) {
    if (!this.ok) return;
    const c = this.ctx, t = c.currentTime;
    const calm = 1 - clamp(E.rain * 1.5, 0, 1);
    this.windT = (this.windT || 0) - dt;
    if (this.windT <= 0) {
      this.windT = 0.2;
      // le vent ne souffle que pendant les tempêtes
      const wl = SoundEngine.windLevel(t, E.height > 12);
      this.wind.g.gain.setTargetAtTime(wl.gain * E.storm * (E.inside ? 0.45 : 1), t, 0.8);
      this.wind.lp.frequency.setTargetAtTime(wl.cutoff, t, 0.6);
      this.rainSnd.g.gain.setTargetAtTime(0.17 * E.rain * (E.inside ? 0.5 : 1), t, 0.8);
    }
    // gouttes (texture de la pluie)
    if (E.rain > 0.05 && !E.inside) {
      this.dropT = (this.dropT || 0) - dt;
      if (this.dropT <= 0) {
        this.dropT = (0.02 + Math.random() * 0.1) / E.rain;
        const f = 1800 + Math.random() * 2600;
        this.tone(t, 'sine', f, f * 0.8, 0.012, 0.006 * E.rain * (0.3 + Math.random() * 0.7), this.pan(Math.random() * 2 - 1, this.amb), 0.002);
      }
    }
    // oiseaux (jour, pas sous la pluie)
    this.birdT -= dt;
    if (this.birdT <= 0) {
      this.birdT = 0.8 + Math.random() * 4 / Math.max(0.2, E.day);
      if (E.day > 0.25 && calm > 0.5) this.chirp(E.day * calm);
    }
    // grillons (nuit)
    this.cricketT -= dt;
    if (this.cricketT <= 0) {
      this.cricketT = 0.35 + Math.random() * 0.8;
      if (E.night > 0.2 && calm > 0.5) this.cricket(E.night * calm);
    }
    // chouette
    this.owlT -= dt;
    if (this.owlT <= 0) {
      this.owlT = 25 + Math.random() * 40;
      if (E.night > 0.6) this.owl();
    }
    // crépitement du feu de camp (petits claquements, seulement tout près)
    if (E.fire > 0.05) {
      this.crackleT -= dt;
      if (this.crackleT <= 0) {
        this.crackleT = 0.08 + Math.random() * 0.35;
        this.noiseHit(t, 0.012 + Math.random() * 0.02, 'bandpass', 1400 + Math.random() * 1600, 1.4, 0.05 * E.fire * (0.3 + Math.random() * 0.7), this.pan(E.firePan, this.amb));
      }
    }
  }
  chirp(k) {
    const t = this.ctx.currentTime + 0.02, p = this.pan(Math.random() * 2 - 1, this.amb);
    const n = 2 + ((Math.random() * 5) | 0), base = 2300 + Math.random() * 1900, vol = (0.02 + Math.random() * 0.025) * k;
    const pattern = Math.random();
    for (let i = 0; i < n; i++) {
      const st = t + i * (0.08 + Math.random() * 0.06);
      const f0 = base * (1 + Math.random() * 0.15), f1 = pattern < 0.5 ? f0 * 1.45 : f0 * 0.7;
      this.tone(st, 'sine', f0, f1, 0.05 + Math.random() * 0.04, vol, p, 0.008);
    }
  }
  cricket(k) {
    const t = this.ctx.currentTime + 0.02, p = this.pan(Math.random() * 2 - 1, this.amb);
    const f = 4300 + Math.random() * 500, vol = 0.006 * k, n = 2 + ((Math.random() * 3) | 0);
    for (let i = 0; i < n; i++) this.tone(t + i * 0.05, 'sine', f, f * 0.98, 0.03, vol, p, 0.006);
  }
  owl() {
    const t = this.ctx.currentTime + 0.05, p = this.pan(Math.random() * 1.6 - 0.8, this.amb);
    const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900;
    f.connect(p);
    this.tone(t, 'sine', 400, 370, 0.4, 0.06, f, 0.06);
    this.tone(t + 0.62, 'sine', 410, 360, 0.75, 0.065, f, 0.08);
  }

  // ------------------------------------------------------------ tonnerre
  thunder(k) {
    if (!this.ok) return;
    const c = this.ctx, t = c.currentTime;
    if (k > 0.65) this.noiseHit(t, 0.1, 'bandpass', 900, 0.6, 0.12 * k, this.amb, 300);
    const s = c.createBufferSource(); s.buffer = this.brown;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass';
    lp.frequency.setValueAtTime(500 + 500 * k, t); lp.frequency.exponentialRampToValueAtTime(80, t + 3.5 + k);
    const g = c.createGain(); g.gain.value = 0;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.5 * (0.35 + 0.65 * k), t + 0.06 + (1 - k) * 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 4 + k * 2);
    s.connect(lp).connect(g).connect(this.amb);
    s.start(t, Math.random() * 1.5); s.stop(t + 6.5);
  }

  // ------------------------------------------------------------ cris d'animaux
  voice(t, type, f0, f1, dur, vol, out, o = {}) {
    const c = this.ctx, osc = c.createOscillator(); osc.type = type;
    osc.frequency.setValueAtTime(f0, t); osc.frequency.exponentialRampToValueAtTime(f1, t + dur);
    if (o.vib) {
      const l = c.createOscillator(), lg = c.createGain();
      l.frequency.value = o.vib; lg.gain.value = o.vibDepth || 20;
      l.connect(lg).connect(osc.frequency); l.start(t); l.stop(t + dur + 0.05);
    }
    let node = osc;
    if (o.bp) { const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = o.bp; f.Q.value = o.q || 1; node.connect(f); node = f; }
    if (o.lp) { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(o.lp, t); if (o.lp2) f.frequency.exponentialRampToValueAtTime(o.lp2, t + dur); node.connect(f); node = f; }
    const g = c.createGain(); g.gain.value = 0;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + Math.min(0.06, dur * 0.25));
    g.gain.setValueAtTime(vol, t + dur * 0.65);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    node.connect(g).connect(out);
    osc.start(t); osc.stop(t + dur + 0.05);
  }
  animal(kind, pan, k) {
    if (!this.ok) return;
    const t = this.ctx.currentTime + 0.02, p = this.pan(pan, this.amb), v = clamp(k, 0, 1);
    switch (kind) {
      case 'sheep': this.voice(t, 'sawtooth', 340, 300, 0.55, 0.05 * v, p, { vib: 7, vibDepth: 28, bp: 1300, q: 2 }); break;
      case 'cow': this.voice(t, 'sawtooth', 118, 96, 1.3, 0.09 * v, p, { lp: 700, lp2: 260 }); break;
      case 'pig': for (let i = 0; i < 2; i++) this.voice(t + i * 0.2, 'square', 190, 130, 0.14, 0.035 * v, p, { bp: 700, q: 1.5 }); break;
      case 'hen': for (let i = 0; i < 3; i++) this.voice(t + i * 0.11, 'triangle', 760, 520, 0.07, 0.04 * v, p, { bp: 900, q: 1.2 }); break;
      case 'horse': this.voice(t, 'sawtooth', 950, 480, 0.9, 0.035 * v, p, { vib: 13, vibDepth: 60, bp: 1400, q: 1.2 }); break;
      case 'duck': for (let i = 0; i < 2; i++) this.voice(t + i * 0.16, 'sawtooth', 540, 430, 0.12, 0.045 * v, p, { bp: 1100, q: 3 }); break;
    }
  }

  // ------------------------------------------------------------ bruitages
  shot() {
    if (!this.ok) return;
    const t = this.ctx.currentTime;
    this.noiseHit(t, 0.22, 'lowpass', 5000, 0.7, 0.45, null, 400);
    this.tone(t, 'sine', 140, 45, 0.18, 0.7);
    this.noiseHit(t + 0.02, 0.45, 'lowpass', 700, 0.5, 0.06, null, 150);
  }
  dryFire() { if (this.ok) this.tone(this.ctx.currentTime, 'square', 1800, 1200, 0.02, 0.04); }
  reload() {
    if (!this.ok) return;
    const t = this.ctx.currentTime;
    this.tone(t + 0.05, 'square', 900, 600, 0.03, 0.05);
    this.tone(t + 0.1, 'triangle', 500, 300, 0.05, 0.08);
    this.tone(t + 0.58, 'square', 1100, 700, 0.03, 0.06);
    this.tone(t + 0.62, 'triangle', 420, 260, 0.06, 0.09);
  }
  step(mat, speed) {
    if (!this.ok) return;
    const t = this.ctx.currentTime, v = 0.05 + Math.min(speed, 9) * 0.005;
    if (mat === 'water') this.noiseHit(t, 0.2, 'lowpass', 700, 0.8, v * 0.9, null, 250);
    else if (mat === 'hard') { this.noiseHit(t, 0.03, 'bandpass', 2000, 1.5, v * 0.35); this.tone(t, 'sine', 160, 80, 0.05, v * 0.6); }
    else if (mat === 'wood') { this.tone(t, 'sine', 190, 110, 0.07, v * 0.8); this.noiseHit(t, 0.04, 'bandpass', 900, 2, v * 0.3); }
    else if (mat === 'soft') { this.noiseHit(t, 0.06, 'lowpass', 450, 0.7, v * 0.7); this.tone(t, 'sine', 110, 70, 0.05, v * 0.4); }
    else this.noiseHit(t, 0.07, 'bandpass', 520 + Math.random() * 200, 1.2, v * 0.5);
  }
  land(k) {
    if (!this.ok) return;
    const t = this.ctx.currentTime;
    this.noiseHit(t, 0.12, 'lowpass', 400, 0.7, 0.15 * k);
    this.tone(t, 'sine', 90, 45, 0.12, 0.25 * k);
  }
  splash() { if (this.ok) this.noiseHit(this.ctx.currentTime, 0.45, 'lowpass', 1200, 0.6, 0.22, null, 250); }
  click() { if (this.ok) this.tone(this.ctx.currentTime, 'sine', 1200, 1000, 0.03, 0.04); }
  pop() { if (this.ok) this.tone(this.ctx.currentTime, 'sine', 420, 880, 0.07, 0.12); }
  remove() { if (this.ok) this.tone(this.ctx.currentTime, 'sine', 700, 260, 0.09, 0.1); }
  impact(kind) {
    if (!this.ok) return;
    const t = this.ctx.currentTime + 0.03;
    if (kind === 'hard') { this.tone(t, 'triangle', 1500, 700, 0.05, 0.05); this.noiseHit(t, 0.03, 'bandpass', 2500, 1.5, 0.05); }
    else this.noiseHit(t, 0.07, 'lowpass', 600, 0.8, 0.1);
  }
}

const sound = new SoundEngine();
