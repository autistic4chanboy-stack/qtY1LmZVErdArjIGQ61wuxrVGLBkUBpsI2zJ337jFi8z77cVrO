// ============================================================================
//  L'ESPRIT SECRET : la lavandière de nuit.
//  Marthe Aubry s'est noyée au lavoir, un soir de Lavedi, en lavant le linceul
//  de son petit. Depuis, certaines nuits, on entend battre le linge au lavoir ;
//  et très rarement, elle surgit : un visage plein écran, un cri, une secousse
//  (une fois toutes les deux ou trois semaines, plus souvent à l'esprit sombre ;
//  jamais deux fois de suite : au moins quatre jours entre deux).
//  Le secret : les nuits où elle lave, un drap blanc attend au lavoir ; si l'on
//  prend l'autre bout et qu'on tord dans son sens à elle (les vieux le savent :
//  on le dit à qui a déjà vu son visage), elle est apaisée pour toujours.
//  Dans l'autre sens, elle vous tord les bras. Essais : lavandiere.surgir(true).
// ============================================================================
const lavandiere = {
  el: null, cv: null, frames: null, t: 0, actif: false, battoirT: 0,
  S() { return evenements.S().esprit; },
  // le sens de la lavandière (selon la graine) : les vieux le disent
  sens() { return ((farm.s.seed >>> 0) % 2) ? 'gauche' : 'droite'; },
  lavoir() { const w = game.world; if (w.lavoir) return { x: w.lavoir.x, z: w.lavoir.z }; const L = w.lm.lavoir; return L ? { x: L.x, z: L.z } : null; },
  apaisee() { return !!this.S().apaise; },
  // ------------------------------------------------------------ sa fréquence (tools/equilibrage/hasard.js)
  // fois par heure de jeu passée éveillé la nuit (22 h – 4 h) : 0,015 dehors × bizarrerie, sept fois plus à moins de
  // soixante pas du lavoir, deux fois plus dans le noir d'une maison sans lanterne ; soit, pour qui veille une heure ou
  // deux chaque nuit, une fois en deux à trois semaines
  taux(pres, noir) { return 0.015 * EV_BIZ() * (pres ? 7 : noir ? 2 : 1); },
  ecart: 4, // jours au moins entre deux apparitions
  premierJour: 4, // rien de tel les trois premières nuits

  // ------------------------------------------------------------ le visage (dessiné une fois, trois images)
  dessiner() {
    const W = 320, H = 200, frames = [];
    for (let f = 0; f < 3; f++) {
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const c = cv.getContext('2d'), rnd = mulberry32(911 + f * 17);
      c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
      const cx = W / 2 + (f - 1) * 3, cy = H / 2 + 8 + (f === 2 ? 3 : 0);
      // cheveux mouillés derrière
      c.fillStyle = '#0c0b0a';
      c.beginPath(); c.ellipse(cx, cy - 10, 92, 112, 0, 0, TAU); c.fill();
      // le visage : blême, allongé
      const g = c.createRadialGradient(cx, cy - 20, 10, cx, cy, 95);
      g.addColorStop(0, '#d8d4ca'); g.addColorStop(0.6, '#a9a59a'); g.addColorStop(1, '#4a4842');
      c.fillStyle = g; c.beginPath(); c.ellipse(cx, cy, 62, 88, 0, 0, TAU); c.fill();
      // orbites noires, deux points pâles au fond
      for (const s of [-1, 1]) {
        c.fillStyle = '#050505'; c.beginPath(); c.ellipse(cx + s * 24, cy - 22, 17, 21 + f * 2, s * 0.15, 0, TAU); c.fill();
        c.fillStyle = '#e8e4d8'; c.fillRect(cx + s * 24 - 1 + (f - 1), cy - 22, 2, 2);
        // des coulures sombres sous les yeux
        c.strokeStyle = 'rgba(30,20,18,0.8)'; c.lineWidth = 2;
        for (let k = 0; k < 2; k++) { c.beginPath(); c.moveTo(cx + s * (20 + k * 7), cy - 5); c.lineTo(cx + s * (18 + k * 9) + (rnd() - 0.5) * 6, cy + 26 + rnd() * 30); c.stroke(); }
      }
      // la bouche : ouverte sur un cri, trop grande
      c.fillStyle = '#030303'; c.beginPath(); c.ellipse(cx, cy + 40, 20 + f * 3, 34 + f * 5, 0, 0, TAU); c.fill();
      c.fillStyle = '#6a625a'; for (let k = 0; k < 5; k++) c.fillRect(cx - 12 + k * 6, cy + 10 + f, 3, 5);
      // mèches collées sur le visage
      c.strokeStyle = '#0a0908'; c.lineWidth = 3;
      for (let k = 0; k < 9; k++) { const x0 = cx - 60 + k * 15 + (rnd() - 0.5) * 8; c.beginPath(); c.moveTo(x0, cy - 95); c.bezierCurveTo(x0 + (rnd() - 0.5) * 30, cy - 40, x0 + (rnd() - 0.5) * 40, cy + 20, x0 + (rnd() - 0.5) * 30, cy + 90 + rnd() * 20); c.stroke(); }
      // grain
      const img = c.getImageData(0, 0, W, H), d = img.data;
      for (let i = 0; i < d.length; i += 4) { const n = (rnd() - 0.5) * 50; d[i] = clamp(d[i] + n, 0, 255); d[i + 1] = clamp(d[i + 1] + n, 0, 255); d[i + 2] = clamp(d[i + 2] + n, 0, 255); }
      c.putImageData(img, 0, 0);
      frames.push(cv);
    }
    this.frames = frames;
  },
  dom() {
    if (this.el) return;
    const st = document.createElement('style');
    st.textContent = '#ev-esprit{position:fixed;inset:0;z-index:35;pointer-events:none;display:none;background:#000}#ev-esprit canvas{width:100%;height:100%;object-fit:cover;image-rendering:pixelated}';
    document.head.appendChild(st);
    this.el = document.createElement('div'); this.el.id = 'ev-esprit';
    this.cv = document.createElement('canvas'); this.cv.width = 320; this.cv.height = 200;
    this.el.appendChild(this.cv);
    document.body.appendChild(this.el);
  },
  // ------------------------------------------------------------ elle surgit
  surgir(force) {
    if (!farm.s || game.dying) return false;
    const S = this.S(), d = farm.s.day;
    if (!force && (this.apaisee() || d < this.premierJour || d - S.dernier < this.ecart || cine.on || ui.panel || game.sleeping || game.mode !== 'play')) return false;
    if (!this.frames) this.dessiner();
    this.dom();
    S.dernier = d; S.n = (S.n || 0) + 1;
    this.actif = true; this.t = 0; this.dur = 0.55 + Math.random() * 0.4;
    this.el.style.display = 'block';
    this.peindre(0);
    // le cri, fort
    sound.scream && sound.scream(1.25);
    sound.scream2 && sound.scream2();
    if (sound.ok) { const t = sound.at(); sound.noiseHit(t, 0.5, 'bandpass', 1800, 0.6, 0.5, sound.sfx, 600); sound.noiseHit(t, 0.35, 'lowpass', 400, 0.8, 0.4, sound.sfx); }
    game.shakeT = 1; strange.fear = 1; play.hurtFlash = Math.max(play.hurtFlash || 0, 0.4);
    return true;
  },
  peindre(i) { const c = this.cv.getContext('2d'); c.drawImage(this.frames[i % 3], 0, 0); },
  // ------------------------------------------------------------ chaque image
  update(dt, eye) {
    if (this.actif) {
      this.t += dt;
      this.peindre(Math.floor(this.t * 22));
      this.el.style.transform = `translate(${(Math.random() - 0.5) * 18}px,${(Math.random() - 0.5) * 14}px) scale(${1.02 + Math.random() * 0.05})`;
      if (this.t >= this.dur) { this.actif = false; this.el.style.display = 'none'; }
      return;
    }
    const s = farm.s;
    if (!s || game.mode !== 'play' || game.dying || game.sleeping || cine.on || this.apaisee() || strange.inEnvers()) return;
    const h = npcs.hour(), nuit = h >= 22 || h < 4, p = game.player, L = this.lavoir();
    if (!nuit) return;
    const dL = L ? Math.hypot(L.x - p.pos[0], L.z - p.pos[2]) : 1e9;
    // au lavoir, on l'entend battre le linge
    if (dL < 60 && this.lave()) {
      this.battoirT -= dt;
      if (this.battoirT <= 0 && sound.ok) {
        this.battoirT = 4 + Math.random() * 5;
        const t = sound.at(), k = clamp(1.2 - dL / 60, 0.1, 1), f = Math.atan2(L.x - eye[0], L.z - eye[2]) - Math.atan2(-Math.sin(p.yaw), -Math.cos(p.yaw));
        const out = sound.pan(clamp(-Math.sin(f), -0.9, 0.9), sound.amb);
        for (let i = 0; i < 3; i++) { sound.noiseHit(t + i * 0.42, 0.09, 'lowpass', 420, 0.9, 0.25 * k, out); sound.tone(t + i * 0.42, 'sine', 95, 60, 0.1, 0.12 * k, out); }
        if (Math.random() < 0.5) setTimeout(() => sound.splash && sound.splash(), 1500);
      }
    }
    // très rarement, elle surgit (plus souvent près du lavoir, ou seul dans le noir) : un tirage toutes les cinq
    // secondes, à la mesure des heures de jeu écoulées (voir taux)
    this.tirT = (this.tirT || 0) - dt;
    if (this.tirT <= 0) {
      this.tirT = 5;
      const w = game.world, noir = !game.lantern && (w.covered(eye[0], eye[1], eye[2]) || p.underground);
      if (Math.random() < hasardHeure(this.taux(dL < 60, noir), 5)) this.surgir(false);
    }
  },
  // les nuits où elle lave : une sur trois (et toujours les Lavedi)
  lave() { const d = farm.s.day; return (typeof cal !== 'undefined' && cal.is('lessive')) || hashString('lave' + d + ':' + (farm.s.seed >>> 0)) % 3 === 0 || this.S().n > 0; },
  // ------------------------------------------------------------ le drap, au lavoir
  drap() {
    const S = this.S(), s = farm.s;
    const opts = [
      { label: 'Tordre à main droite', fn: () => this.tordre('droite') },
      { label: 'Tordre à main gauche', fn: () => this.tordre('gauche') },
      { label: 'Lâcher le drap et s’en aller', fn: () => { ui.close(); ui.subtitle('', '(Dans le noir, quelqu’un soupire.)', 3); } },
    ];
    ui.choice('Le drap', '(Un drap blanc, trempé, à moitié tordu. De l’autre côté du bassin, dans le noir, deux mains attendent.)', opts);
    void S; void s;
  },
  tordre(sens) {
    const S = this.S();
    ui.close(true);
    if (sens === this.sens()) {
      S.apaise = farm.s.day;
      sound.whisper && sound.whisper(0, 0.5);
      ui.subtitle('???', 'Merci. Il est propre, maintenant. Je peux le lui porter.', 5);
      setTimeout(() => ui.subtitle('', '(Le battoir ne sonnera plus.)', 4), 5200);
      farm.give('toile', 2); if (typeof faith !== 'undefined') faith.add('anciens', 3);
      BUFF.add('grace', 24);
      evenements.retenir('esprit');
      return;
    }
    // dans l'autre sens : elle vous tord les bras
    this.surgir(true);
    setTimeout(() => { play.hurt(22, null, 'Les bras tordus par la lavandière de nuit'); ui.subtitle('', '(Le drap se tord tout seul, et vos bras avec.)', 4.5); }, 700);
    S.dernier = farm.s.day;
  },
};
// le drap : une interaction au lavoir, les nuits où elle lave
HOOKS.target.push((eye, f, cand) => {
  if (!farm.s || lavandiere.apaisee() || strange.inEnvers()) return;
  const h = npcs.hour();
  if (!(h >= 22 || h < 4) || !lavandiere.lave() || lavandiere.S().dernier === farm.s.day) return;
  const L = lavandiere.lavoir();
  if (!L) return;
  const dx = L.x - eye[0], dz = L.z - eye[2], d = Math.hypot(dx, dz);
  if (d > 3.2 || (dx * f[0] + dz * f[2]) / (d || 1) < 0.5) return;
  cand({ kind: 'hook', use: () => lavandiere.drap() }, Math.max(0.5, d - 0.5));
});
HOOKS.draw.push((buf, sbuf, cam, t) => {
  if (!farm.s || lavandiere.apaisee()) return;
  const h = npcs.hour();
  if (!(h >= 22 || h < 4) || !lavandiere.lave()) return;
  const L = lavandiere.lavoir();
  if (!L || Math.hypot(L.x - cam[0], L.z - cam[2]) > 60) return;
  const y = Math.max(game.world.heightAt(L.x, L.z), game.world.waterLevel) + 0.55;
  PE.buf = buf; PE.fl = FX_EMIT; PE.frame(L.x, y, L.z, 0.4, 1);
  PE.box(0, Math.sin(t * 0.8) * 0.03, 0, 1.4, 0.05, 0.7, [0.62, 0.64, 0.66], TL.cloth, Math.sin(t * 0.3) * 0.1, 0.1, 0.05);
  PE.box(0.72, -0.2, 0, 0.12, 0.45, 0.5, [0.58, 0.6, 0.62], TL.cloth, 0, 0, 0.3);
  PE.fl = 0;
});
// les vieux savent : on le dit à qui a déjà vu son visage
HOOKS.load.push(() => {
  if (lavandiere.el) lavandiere.el.style.display = 'none';
  lavandiere.actif = false; lavandiere.ditBattoir = false;
  if (game._espritHooks) return;
  game._espritHooks = true;
  const _choose = talk.choose.bind(talk);
  talk.choose = function (act) {
    const n = this.n, S = farm.s && lavandiere.S();
    if (act === 'chat' && n && S && S.n > 0 && !S.apaise && Math.random() < 0.4 && (n.d.gender === 'f' || ['guerisseuse', 'cure', 'aubergiste'].includes(n.d.id)) && n.d.id !== 'fillette') {
      const sens = lavandiere.sens() === 'gauche' ? 'à main gauche' : 'à main droite';
      return this.view(pick([
        `Une femme trempée, la nuit ? (Elle pâlit.) C’est Marthe Aubry. Elle s’est noyée au lavoir, un soir de Lavedi, en lavant le linceul de son petit. Elle lave encore. Si elle vous tend le drap, prenez l’autre bout, et tordez comme elle : ${sens}. Jamais dans l’autre sens.`,
        `Les lavandières de nuit… Ma grand-mère disait qu’il ne faut pas leur refuser son aide. On prend le drap, et on tord ${sens}, comme elles. Dans l’autre sens, elles vous tordent les bras.`,
        `Au lavoir, la nuit, on entend battre le linge. C’est Marthe. Elle ne finira jamais, à moins que quelqu’un l’aide. ${sens.charAt(0).toUpperCase() + sens.slice(1)}, qu’il faut tordre. Tout le monde le sait, ici. Personne ne l’a jamais fait.`,
      ]), this.options());
    }
    return _choose(act);
  };
  // le carnet : ce visage, la nuit
  const _rs = ui.renderSatchel.bind(ui);
  ui.renderSatchel = function () {
    _rs();
    if (this.satTab !== 'carnet' || !farm.s) return;
    const S = lavandiere.S(), body = $('#satchel .body');
    if (!body || !S.n) return;
    body.insertAdjacentHTML('afterbegin', S.apaise ? '<h4>La lavandière</h4><p class="hint">Le drap est propre. Le battoir ne sonne plus, la nuit, au lavoir.</p>' : '<h4>Un visage, la nuit</h4><div class="q actif"><div>Certaines nuits, un visage de femme trempé vous hurle au visage. Il sent l’eau froide et le savon. Les gens d’ici savent peut-être qui c’est.</div></div>');
  };
});
HOOKS.update.push((dt, eye) => { if (farm.s) lavandiere.update(dt, eye); });
