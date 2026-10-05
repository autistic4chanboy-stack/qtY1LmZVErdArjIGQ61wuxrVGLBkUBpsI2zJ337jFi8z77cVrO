// ============================================================================
//  L'ATELIER DES CORPS (agent G, suite) — la machine qui refait un peu le corps
//  Dans la cité, à l'Atelier (l'aile haute) : un fauteuil sous des bras
//  articulés. Il ne marche que si le Cœur marche. Quatre reprises possibles
//  (VG_CORPS, 05-zzzzzG-vaisseau.js) : les jambes (courir un peu plus vite), le
//  jarret (sauter un peu plus haut), le souffle (courir plus longtemps, tenir
//  plus longtemps sous l'eau), les os (tomber d'un peu plus haut sans se casser).
//  Trois degrés au plus par reprise, six en tout ; chaque degré coûte des cœurs
//  de verre (1, 2, 3) et des points de vie, et laisse des courbatures. C'est
//  permanent : farm.s.vaisseau.corps ; les effets valent partout, toujours.
//  Et les objets de la cité qu'on lit, qu'on écoute, qu'on fait tourner (clic).
// ============================================================================
const vgCorps = {
  C() { return VG.S().corps; },
  total() { const n = this.C(); return VG_CORPS.reduce((a, c) => a + (n[c.id] | 0), 0); },
  E() { return vgEffets(this.C()); },
  courbatures() { const V = VG.S(), s = farm.s; return !!(s && V.courbatures && V.courbatures > s.hours); },
  ouvrir() {
    if (mondes.cur !== 'vaisseau') return;
    if (!vgCite.courant()) { VGSON.clic(null, 0.6); ui.read('L’Atelier des corps', VG_CORPS_TEXTES.froid, ''); return; }
    const n = this.C(), tot = this.total(), coeurs = farm.count('vg_coeur'), p = game.player;
    const opts = VG_CORPS.map((c) => {
      const d = n[c.id] | 0, cout = vgCoutSuivant(n, c.id);
      const etat = d ? ` (déjà ${d} fois)` : '';
      if (!cout) return { label: `${c.nom}${etat} — ${d >= VG_CORPS_MAX ? 'pas une fois de plus' : 'le corps a sa mesure'}`, fn: () => ui.subtitle('', d >= VG_CORPS_MAX ? VG_CORPS_TEXTES.max : VG_CORPS_TEXTES.total, 4) };
      return { label: `${c.nom} : ${c.desc}${etat} — ${cout.coeurs > 1 ? cout.coeurs + ' cœurs de verre' : 'un cœur de verre'}`, fn: () => this.proposer(c, cout) };
    });
    opts.push({ label: 'Se relever', fn: () => ui.close() });
    const desc = VG_CORPS_TEXTES.intro + (coeurs ? (coeurs > 1 ? ` Vous avez ${coeurs} cœurs de verre.` : ' Vous avez un cœur de verre.') : ' Vous n’avez pas de cœur de verre.') + (tot ? ` Votre corps a déjà été repris ${tot > 1 ? tot + ' fois' : 'une fois'}.` : '');
    void p;
    ui.choice('L’Atelier des corps', desc, opts);
  },
  proposer(c, cout) {
    const p = game.player;
    if (farm.count('vg_coeur') < cout.coeurs) { ui.close(); ui.subtitle('', cout.coeurs > 1 ? `(Il faudrait ${cout.coeurs} cœurs de verre. Les bras ne bougent pas.)` : '(Il faudrait un cœur de verre. Les bras ne bougent pas.)', 4); return; }
    if (p.hp < cout.vie + 12) { ui.close(); ui.subtitle('', VG_CORPS_TEXTES.faible, 4); return; }
    ui.choice('L’Atelier des corps', VG_CORPS_TEXTES.avant[c.id] + ' ' + VG_CORPS_TEXTES.prix, [
      { label: 'S’allonger', fn: () => { ui.close(); this.operer(c, cout); } },
      { label: 'Non', fn: () => this.ouvrir() },
    ]);
  },
  async operer(c, cout) {
    if (this.enCours) return;
    this.enCours = true;
    const p = game.player, n = this.C(), V = VG.S();
    try {
      game.sleeping = true;
      const pos = vgCite.pos(18, 13.5, 111);
      VGSON.monte(pos, 1.0, 82);
      await ui.fade(true, '', 900);
      for (let i = 0; i < 7; i++) setTimeout(() => { VGSON.clic(pos, 0.7); if (i % 2) VGSON.la(pos, () => { const t = sound.at(0.01); sound.tone(t, 'sawtooth', 300 + i * 60, 900 + i * 40, 0.5, 0.012, sound.sfx, 0.05); }); }, 300 + i * 420);
      setTimeout(() => { sound.hurtHuman ? sound.hurtHuman(0.6) : sound.hurt && sound.hurt(10); }, 1700);
      $('#fade-text').textContent = VG_CORPS_TEXTES.pendant;
      await new Promise((r) => setTimeout(r, 3600));
      farm.take('vg_coeur', cout.coeurs);
      n[c.id] = (n[c.id] | 0) + 1;
      p.hp = Math.max(8, p.hp - cout.vie);
      V.courbatures = farm.s.hours + VG_CORPS_FATIGUE_H;
      V.operations = (V.operations || 0) + 1;
      $('#fade-text').textContent = '';
      await ui.fade(false, '', 1200);
      game.sleeping = false;
      play.hurtFlash = Math.max(play.hurtFlash, 0.5); game.shakeT = 0.3;
      ui.subtitle('', VG_CORPS_TEXTES.apres[c.id], 5);
      if (!V.dits.atelier_on) { V.dits.atelier_on = 1; setTimeout(() => vgCite.dire(VG_VOIX.atelier_on), 5500); }
      farm.save();
    } catch (e) { console.error(e); game.sleeping = false; ui.fade(false, '', 300); }
    this.enCours = false;
  },
  // ------------------------------------------------------------- les effets, partout et toujours
  appliquer(dt) {
    const p = game.player, n = this.C();
    if (!n || !(n.jambes || n.jarret || n.souffle || n.os || this.courbatures())) { this.lastB = p.breath; return; }
    const E = this.E();
    p.mods.speed *= E.vitesse * (this.courbatures() ? 0.9 : 1);
    p.mods.jump = (p.mods.jump || 1) * E.saut;
    // le souffle sous l'eau (et dans la Brèche) dure plus longtemps
    if (this.lastB !== undefined && p.breath < this.lastB && E.apnee > 1) p.breath = this.lastB - (this.lastB - p.breath) / E.apnee;
    this.lastB = p.breath;
  },
};
HOOKS.update.push((dt) => { if (farm.s && game.kind === 'farm') vgCorps.appliquer(dt); });
// la course fatigue moins (le souffle)
{
  const _upd = Player.prototype.update;
  Player.prototype.update = function (dt, w, c) {
    const s0 = this.stamina;
    const r = _upd.call(this, dt, w, c);
    if (game.kind === 'farm' && farm.s && farm.s.vaisseau && this.stamina < s0 && !this.riding) {
      const k = vgEffets(VG.S().corps).fatigue;
      if (k < 1) this.stamina = s0 - (s0 - this.stamina) * k;
    }
    return r;
  };
}
// les os : on tombe d'un peu plus haut sans se casser
{
  const _ch = corps.chute.bind(corps);
  corps.chute = function (v) { const k = farm.s && farm.s.vaisseau ? vgEffets(VG.S().corps).chute : 1; return _ch(v * k); };
}

// ---------------------------------------------------------------- les objets de la cité, en main (clic)
const vgObjets = {
  souvenirI: 0,
  utiliser(id) {
    const V = VG.S();
    if (VG_CARNETS[id]) { const [t, x, sg] = VG_CARNETS[id]; sound.page && sound.page(); V.lus[id] = 1; ui.read(t, x, sg); return true; }
    if (id === 'vg_cristal') {
      const [qui, x] = VG_SOUVENIRS[this.souvenirI++ % VG_SOUVENIRS.length];
      VGSON.verre(null, 1318.5, 0.6);
      ui.read('Le cristal à souvenirs', x, qui);
      if (qui === 'Seriane' && mondes.cur === 'vaisseau' && !V.dits.cristal) { V.dits.cristal = 1; setTimeout(() => vgCite.dire(VG_VOIX.cristal), 2500); }
      return true;
    }
    if (id === 'vg_boite') {
      // cinq notes, toujours les mêmes, dans un ordre qui change
      const N = [659.25, 739.99, 880, 987.77, 1108.73], o = N.slice().sort(() => Math.random() - 0.5);
      if (sound.ok) { const t = sound.at(0.02); o.forEach((f, i) => { for (const [m, a] of [[1, 1], [3.01, 0.15]]) sound.tone(t + i * 0.42, 'sine', f * m, f * m, 1.4, 0.016 * a, sound.sfx, 0.004); }); }
      ui.subtitle('', '(Cinq notes. Pas tout à fait dans le même ordre que la dernière fois.)', 3.5);
      return true;
    }
    if (id === 'vg_toupie') { VGSON.verre(null, 2093, 0.3); ui.subtitle('', '(Vous la lancez sur votre paume. Elle tourne, et tourne, et ne tombe pas.)', 3.5); return true; }
    if (id === 'vg_oeil') { ui.subtitle('', '(Tout au fond, quelque chose tourne. Quand vous le regardez, ça s’arrête, et ça vous regarde.)', 4); return true; }
    if (id === 'vg_plaque') { ui.subtitle('', '(Vous soufflez sur le verre noir. Des points s’allument, reliés par des traits ; l’un d’eux s’arrête net, au bord.)', 4.5); return true; }
    return false;
  },
};
HOOKS.primary.push((eye, basis, held, it, id) => {
  if (held || !id || typeof id !== 'string' || !(id.startsWith('vg_'))) return false;
  if (!vgObjets.utiliser(id)) return false;
  play.cool = 0.4;
  return true;
});
