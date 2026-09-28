// ============================================================================
//  MÉTÉO : beau temps, nuageux, pluie, orage (éclairs + tonnerre + vent)
// ============================================================================

const WEATHER_PRESETS = {
  clear: { cloud: 0.12, rain: 0, storm: 0 },
  cloudy: { cloud: 0.72, rain: 0, storm: 0 },
  rain: { cloud: 0.9, rain: 0.75, storm: 0 },
  storm: { cloud: 1, rain: 1, storm: 1 },
};
const WEATHER_NAMES = { auto: 'Automatique', clear: 'Beau temps', cloudy: 'Nuageux', rain: 'Pluie', storm: 'Orage' };
const WEATHER_ICONS = { clear: '☀', cloudy: '☁', rain: '🌧', storm: '⛈' };

const weather = {
  cur: { cloud: 0.12, rain: 0, storm: 0 },
  state: 'clear', timer: 200, flash: 0, flash2: 0, bolt: 6, pending: [], windAngle: 0,

  reset(w) {
    this.state = w.weather === 'auto' ? 'clear' : w.weather;
    Object.assign(this.cur, WEATHER_PRESETS[this.state]);
    this.timer = 150 + Math.random() * 150;
    this.flash = 0; this.pending = [];
  },

  pick() {
    const r = Math.random();
    return r < 0.45 ? 'clear' : r < 0.7 ? 'cloudy' : r < 0.88 ? 'rain' : 'storm';
  },

  update(dt, w) {
    if (w.weather !== 'auto') this.state = w.weather;
    else {
      this.timer -= dt;
      if (this.timer <= 0) {
        const prev = this.state;
        this.state = this.pick();
        this.timer = (this.state === 'clear' ? 220 : 110) + Math.random() * 180;
        if (this.state === 'storm' && prev !== 'storm') this.windAngle = Math.random() * TAU;
      }
    }
    const tgt = WEATHER_PRESETS[this.state], k = Math.min(1, dt / 16);
    for (const key of ['cloud', 'rain', 'storm']) this.cur[key] += (tgt[key] - this.cur[key]) * k;
    // éclairs puis tonnerre (le son arrive après la lumière)
    this.flash = Math.max(0, this.flash - dt * 5);
    if (this.flash2 > 0) { this.flash2 -= dt; if (this.flash2 <= 0) this.flash = Math.max(this.flash, 0.7); }
    if (this.cur.storm > 0.5) {
      this.bolt -= dt;
      if (this.bolt <= 0) {
        this.bolt = 5 + Math.random() * 14;
        const near = Math.random();
        this.flash = 0.55 + near * 0.6;
        if (Math.random() < 0.6) this.flash2 = 0.12;
        this.pending.push({ t: 0.25 + (1 - near) * 3.5, k: 0.35 + near * 0.65 });
      }
    }
    for (const p of this.pending) p.t -= dt;
    while (this.pending.length && this.pending[0].t <= 0) sound.thunder(this.pending.shift().k);
  },

  get state4() { return this.cur.storm > 0.5 ? 'storm' : this.cur.rain > 0.3 ? 'rain' : this.cur.cloud > 0.5 ? 'cloudy' : 'clear'; },
  rainWind() { const s = this.cur.storm * 5; return [Math.cos(this.windAngle) * s, Math.sin(this.windAngle) * s]; },
};
