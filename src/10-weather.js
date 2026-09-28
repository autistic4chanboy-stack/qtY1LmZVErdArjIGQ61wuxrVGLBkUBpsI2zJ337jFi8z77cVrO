// ============================================================================
//  MÉTÉO : beau temps, nuageux, pluie, orage, brouillard, gel, canicule
//  (en mode Ferme, le temps suit un programme par jour, connu des habitants)
// ============================================================================

const WEATHER_PRESETS = {
  clear: { cloud: 0.12, rain: 0, storm: 0, fog: 0, frost: 0, heat: 0 },
  cloudy: { cloud: 0.72, rain: 0, storm: 0, fog: 0, frost: 0, heat: 0 },
  rain: { cloud: 0.9, rain: 0.75, storm: 0, fog: 0.1, frost: 0, heat: 0 },
  storm: { cloud: 1, rain: 1, storm: 1, fog: 0, frost: 0, heat: 0 },
  fog: { cloud: 0.55, rain: 0, storm: 0, fog: 1, frost: 0, heat: 0 },
  frost: { cloud: 0.1, rain: 0, storm: 0, fog: 0.25, frost: 1, heat: 0 },
  heat: { cloud: 0.02, rain: 0, storm: 0, fog: 0, frost: 0, heat: 1 },
};
const WEATHER_NAMES = { auto: 'Automatique', clear: 'Beau temps', cloudy: 'Nuageux', rain: 'Pluie', storm: 'Orage', fog: 'Brouillard', frost: 'Gel', heat: 'Canicule' };
const WEATHER_ICONS = { clear: '☀', cloudy: '☁', rain: '🌧', storm: '⛈', fog: '🌫', frost: '❄', heat: '🔥' };
// type de journée -> clé des répliques météo des habitants
const DAY_KIND = { clear: 'soleil', heat: 'soleil', cloudy: 'soleil', rain: 'pluie', storm: 'orage', fog: 'brouillard', frost: 'gel' };

const weather = {
  cur: { cloud: 0.12, rain: 0, storm: 0, fog: 0, frost: 0, heat: 0 },
  state: 'clear', timer: 200, flash: 0, flash2: 0, bolt: 6, pending: [], windAngle: 0, plan: null, day: 0, log: null,

  reset(w) {
    this.state = w.weather === 'auto' ? 'clear' : (WEATHER_PRESETS[w.weather] ? w.weather : 'clear');
    Object.assign(this.cur, WEATHER_PRESETS[this.state]);
    this.timer = 150 + Math.random() * 150;
    this.flash = 0; this.pending = [];
    this.plan = null;
  },

  pick() {
    const r = Math.random();
    return r < 0.45 ? 'clear' : r < 0.7 ? 'cloudy' : r < 0.88 ? 'rain' : 'storm';
  },

  // Programme d'une journée (mode Ferme) : [heure de début, état]
  dayPlan(seed, day) {
    const rnd = mulberry32(seed * 131 + day * 7919);
    const r = day <= 1 ? 0 : rnd(), base = r < 0.36 ? 'clear' : r < 0.56 ? 'cloudy' : r < 0.74 ? 'rain' : r < 0.82 ? 'storm' : r < 0.9 ? 'fog' : r < 0.95 ? 'heat' : 'clear';
    const plan = [[0, base]];
    let kind = DAY_KIND[base];
    if (base !== 'storm' && base !== 'rain' && rnd() < 0.3) plan.push([12 + rnd() * 6, rnd() < 0.7 ? 'rain' : 'storm']);
    if (base === 'storm') plan.unshift([0, 'cloudy']), plan[1][0] = 10 + rnd() * 6;
    if (base === 'fog') plan.push([10 + rnd() * 2, 'cloudy']);
    // gel au petit matin (jamais les jours de pluie)
    const frost = day > 2 && (base === 'clear' || base === 'cloudy' || base === 'fog') && rnd() < 0.1;
    if (frost) { plan[0] = [0, 'frost']; plan.push([9.5, base]); kind = 'gel'; }
    return { plan: plan.sort((a, b) => a[0] - b[0]), kind, frost, rain: plan.some((p) => p[1] === 'rain' || p[1] === 'storm'), storm: plan.some((p) => p[1] === 'storm'), heat: base === 'heat' };
  },
  tomorrow() { const s = farm.s; return s ? this.dayPlan(s.seed, s.day + 1).kind : 'soleil'; },
  today() { const s = farm.s; return s ? this.dayPlan(s.seed, s.day) : null; },

  update(dt, w) {
    if (farm.on && w === farm.w) {
      const P = this.today(), h = w.time * 24;
      let st = P.plan[0][1];
      for (const [hr, x] of P.plan) if (h >= hr) st = x;
      if (st === 'storm' && this.state !== 'storm') this.windAngle = Math.random() * TAU;
      this.state = st;
    } else if (w.weather !== 'auto') this.state = w.weather;
    else {
      this.timer -= dt;
      if (this.timer <= 0) {
        const prev = this.state;
        this.state = this.pick();
        this.timer = (this.state === 'clear' ? 220 : 110) + Math.random() * 180;
        if (this.state === 'storm' && prev !== 'storm') this.windAngle = Math.random() * TAU;
      }
    }
    const tgt = WEATHER_PRESETS[this.state] || WEATHER_PRESETS.clear, k = Math.min(1, dt / 16);
    for (const key in tgt) this.cur[key] += (tgt[key] - this.cur[key]) * k;
    // le gel fond au soleil du matin
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

  get state4() { return this.cur.storm > 0.5 ? 'storm' : this.cur.rain > 0.3 ? 'rain' : this.cur.fog > 0.5 ? 'fog' : this.cur.cloud > 0.5 ? 'cloudy' : 'clear'; },
  rainWind() { const s = this.cur.storm * 5; return [Math.cos(this.windAngle) * s, Math.sin(this.windAngle) * s]; },
};
