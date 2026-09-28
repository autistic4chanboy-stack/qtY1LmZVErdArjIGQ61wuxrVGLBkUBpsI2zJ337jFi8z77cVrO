// ============================================================================
//  ALCHIMIE : l'alambic (panneau de mélange), les potions et leurs effets.
//  Les effets (potions et bénédictions) sont des « états » datés en heures de jeu.
// ============================================================================
BUFF.on = (id) => { const s = farm.s; return !!(s && s.buffs && s.buffs[id] > s.hours); };
BUFF.add = (id, h) => { const s = farm.s; s.buffs = s.buffs || {}; s.buffs[id] = Math.max(s.buffs[id] || 0, s.hours) + h; };
BUFF.end = (id) => { const s = farm.s; if (s.buffs) delete s.buffs[id]; };
const BUFF_NAMES = {
  vigueur: 'Vigueur', celerite: 'Célérité', nyctalopie: 'Œil de chouette', chance: 'Bonne fortune', silence: 'Silence', clairvoyance: 'Clairvoyance',
  apnee: 'Souffle d’anguille', force: 'Force', legerete: 'Légèreté', antidote: 'Protégé du venin', charme: 'Charme', envers: 'Philtre de l’Envers',
  souffle: 'Dernier souffle', grace: 'La Grâce', cierge: 'Un cierge brûle pour vous', moisson: 'Bénédiction de la Mère', lac: 'Faveur de la Dame', cerf: 'Pas du Cerf',
  vision: 'Les yeux des Anciens', source: 'Eau de la source', pacte_nuit: 'Pacte de la nuit', pacte: 'Un pacte vous lie',
};
// ingrédients que l'alambic accepte : tout ce qui entre dans une recette, et les ingrédients d'alchimie
const ALCH_OK = new Set(Object.values(POTIONS).filter((P) => P.need).flatMap((P) => P.need));
for (const id in ITEMS) if (ITEMS[id].alch) ALCH_OK.add(id);

const alchemy = {
  slots: [null, null, null], brewing: false, result: null,
  known(id) { const s = farm.s; return !!(s.alchemy && s.alchemy.known[id]); },
  learn(id, quiet) {
    const s = farm.s; s.alchemy = s.alchemy || { known: {}, clues: {} };
    if (s.alchemy.known[id] || !POTIONS[id] || id === 'mixture') return false;
    s.alchemy.known[id] = s.day;
    if (!quiet) ui.subtitle('', '(Nouvelle recette au grimoire : ' + POTIONS[id].name + '.)', 3);
    return true;
  },
  match(ids) {
    const key = ids.filter(Boolean).slice().sort().join('+');
    for (const id in POTIONS) { const P = POTIONS[id]; if (P.need && P.need.slice().sort().join('+') === key) return id; }
    return null;
  },
  open(src) {
    this.slots = [null, null, null]; this.result = null; this.src = src || null;
    ui.open('#alchemy'); this.render();
  },
  render() {
    const s = farm.s, el = $('#alchemy');
    const ings = Object.keys(s.inv).filter((k) => ALCH_OK.has(k) && s.inv[k] > 0 && !this.slots.includes(k)).sort((a, b) => itemName(a).localeCompare(itemName(b)));
    const known = Object.keys(POTIONS).filter((id) => this.known(id));
    const guess = this.match(this.slots), full = this.slots.filter(Boolean).length >= 2;
    el.innerHTML = `<div class="tabs"><b>L’alambic</b><button class="x" data-close>✕</button></div>
      <div class="body two">
        <div><h4>Ingrédients</h4><div class="grid">${ings.map((k) => `<button class="it" data-ing="${k}" title="${esc(itemName(k) + (ITEMS[k].desc ? ' — ' + ITEMS[k].desc : ''))}"><img src="${iconURL(k)}" alt=""><span>${esc(itemName(k))}</span><i>${s.inv[k]}</i></button>`).join('') || '<p class="hint">Rien qui puisse aller dans l’alambic. Herbes, miel, champignons, plumes, fleurs…</p>'}</div></div>
        <div><h4>Le mélange</h4>
          <div class="alch-slots">${this.slots.map((k, i) => `<button class="alch-slot" data-slot="${i}" title="${k ? esc(itemName(k)) + ' — clic : retirer' : 'vide'}">${k ? `<img src="${iconURL(k)}" alt="">` : '<span>+</span>'}</button>`).join('')}</div>
          <p class="alch-guess">${full ? (guess && this.known(guess) ? 'Vous reconnaissez la recette : <b>' + esc(POTIONS[guess].name) + '</b>.' : 'Vous ne savez pas ce que cela donnera.') : 'Deux ou trois ingrédients, et une fiole vide.'}</p>
          <button class="close brew" data-brew ${full && farm.count('fiole') && !this.brewing ? '' : 'disabled'}>${this.brewing ? 'Ça bout…' : 'Distiller'} <small>(fioles : ${farm.count('fiole')})</small></button>
          ${this.result ? `<div class="alch-res"><img src="${iconURL(this.result)}" alt=""><span>${esc(itemName(this.result))}</span></div>` : ''}
          <h4>Recettes connues</h4>${known.map((id) => `<button class="row" data-rec="${id}"><img src="${iconURL(id)}" alt=""><span>${esc(POTIONS[id].name)} <small>— ${POTIONS[id].need.map((k) => esc(itemName(k).toLowerCase())).join(', ')}</small></span></button>`).join('') || '<p class="hint">Aucune. Il faut essayer… ou trouver quelqu’un qui sait.</p>'}
        </div>
      </div>`;
    $('#alchemy [data-close]').onclick = () => ui.close();
    $$('#alchemy [data-ing]').forEach((b) => (b.onclick = () => { const i = this.slots.indexOf(null); if (i < 0) return; this.slots[i] = b.dataset.ing; this.result = null; sound.tick(); this.render(); }));
    $$('#alchemy [data-slot]').forEach((b) => (b.onclick = () => { this.slots[+b.dataset.slot] = null; sound.tick(); this.render(); }));
    $$('#alchemy [data-rec]').forEach((b) => (b.onclick = () => { const need = POTIONS[b.dataset.rec].need; if (!need.every((k) => farm.count(k))) { sound.click(); return; } this.slots = [need[0], need[1] || null, need[2] || null]; this.result = null; this.render(); }));
    const bb = $('#alchemy [data-brew]'); if (bb) bb.onclick = () => this.brew();
  },
  brew() {
    const ids = this.slots.filter(Boolean);
    if (ids.length < 2 || !farm.count('fiole') || !ids.every((k) => farm.count(k))) return;
    this.brewing = true; this.render();
    sound.bubble2 && sound.bubble2();
    setTimeout(() => sound.bubble2 && sound.bubble2(), 700);
    setTimeout(() => {
      this.brewing = false;
      for (const k of ids) farm.take(k, 1);
      farm.take('fiole', 1);
      const id = this.match(ids) || 'mixture';
      farm.give(id, 1);
      if (id !== 'mixture') { this.learn(id); farm.s.stats.potions = (farm.s.stats.potions || 0) + 1; }
      this.result = id; this.slots = [null, null, null];
      sound.pop();
      if (ui.panel === '#alchemy') this.render();
    }, 1500);
  },
  // boire une potion (clic droit, ou clic gauche avec la fiole en main)
  drink(id) {
    const P = POTIONS[id], p = game.player, s = farm.s;
    if (!P || !farm.take(id, 1)) return;
    play.eatT = 0.8; sound.eat && sound.eat();
    farm.give('fiole', 1);
    this.flashCol = hexToRgb(P.col).map((v) => v / 255); this.flashT = 1.2;
    const say = (t) => ui.subtitle('', '(' + t + ')', 3);
    switch (id) {
      case 'potion_soin': p.hp = Math.min(100, p.hp + 60); say('Une chaleur rouge descend dans vos veines.'); break;
      case 'potion_vigueur': BUFF.add('vigueur', P.h); p.stamina = 1; say('Le sommeil recule, loin derrière vous.'); break;
      case 'potion_celerite': BUFF.add('celerite', P.h); say('Vos jambes vous démangent de courir.'); break;
      case 'potion_nyctalopie': BUFF.add('nyctalopie', P.h); say('Vos yeux piquent, puis la nuit s’éclaircit.'); break;
      case 'potion_croissance': play.nausea = 6; say('Ça se versait sur les semis, pas dans la gorge.'); break;
      case 'potion_chance': BUFF.add('chance', P.h); say('Une pièce brille quelque part dans votre tête.'); break;
      case 'potion_silence': BUFF.add('silence', P.h); say('Vos pas ne font plus de bruit. Votre souffle non plus.'); break;
      case 'potion_clairvoyance': BUFF.add('clairvoyance', P.h); say('Le monde a des bords, et des choses brillent derrière.'); break;
      case 'potion_apnee': BUFF.add('apnee', P.h); p.breath = 1; say('Votre gorge a le goût de la vase. L’eau vous paraît douce.'); break;
      case 'potion_force': BUFF.add('force', P.h); say('Vos bras vous semblent faits pour fendre des chênes.'); break;
      case 'potion_legerete': BUFF.add('legerete', P.h); say('Vous pesez moins qu’une plume noire.'); break;
      case 'antidote': BUFF.add('antidote', P.h); play.poisonT = 0; play.nausea = 0; say('L’amertume chasse le venin.'); break;
      case 'philtre_charme': BUFF.add('charme', P.h); say('Vous avez envie de sourire à tout le monde.'); break;
      case 'philtre_envers': BUFF.add('envers', P.h); say('Vos oreilles bourdonnent. Le vieux puits vous appelle.'); break;
      case 'elixir_souffle': BUFF.add('souffle', P.h); say('Quelque chose en vous s’est accroché, et ne lâchera pas.'); break;
      case 'somnifere': say('Vos paupières tombent comme des volets.'); setTimeout(() => game.sleep('dehors'), 900); break;
      default: this.mixture(); break;
    }
  },
  mixture() {
    const p = game.player, r = Math.random();
    if (r < 0.3) { play.nausea = 12; ui.subtitle('', '(Le sol tangue. Très mauvaise idée.)', 3); }
    else if (r < 0.5) { p.hp = Math.min(100, p.hp + 15); ui.subtitle('', '(Pas si mauvais, finalement.)', 3); }
    else if (r < 0.7) { BUFF.add('celerite', 0.5); ui.subtitle('', '(Vous avez le hoquet, et les jambes qui s’agitent.)', 3); }
    else if (r < 0.85) { strange.glitchT = 1.2; ui.subtitle('', '(Pendant une seconde, vous voyez la vallée à l’envers.)', 3); }
    else { p.food = Math.max(0, p.food - 20); ui.subtitle('', '(Votre estomac se retourne. Vous avez faim, soudain.)', 3); }
  },
  // élixir de croissance : versé sur 3 × 3 cases
  pour(eye, f) {
    const cells = play.cellsAt(eye, f, 1);
    let n = 0;
    for (const c of cells) { const cr = farm.crop(c.x, c.z); if (cr && cr.c && !cr.dead && !farm.ripe(cr)) { cr.g = Math.min(CROPS[cr.c].h, cr.g + 4); n++; for (let k = 0; k < 4; k++) particles.spawn(c.x + (Math.random() - 0.5) * 0.6, c.y + 0.3, c.z + (Math.random() - 0.5) * 0.6, 0, 1, 0, [0.6, 1.0, 0.4, 1], 0.05, 0.9, -0.2, true); } }
    if (!n) { ui.subtitle('', '(Rien ici qui puisse pousser plus vite.)', 2); return; }
    farm.take('potion_croissance', 1); farm.give('fiole', 1); farm.dirtyProps = true;
    sound.pour && sound.pour(); play.canTilt = 0.5;
  },
};

// ---------------------------------------------------------------- l'alambic : objet posé (et celui de la guérisseuse)
PROP_USE_MORE.alambic = 1;
HOOKS.propPre.alambic = () => { alchemy.open('alambic'); return true; };
HOOKS.inter.alambic = () => alchemy.open('guerisseuse');

// ---------------------------------------------------------------- boire, verser, recueillir la rosée et l'eau bénite
HOOKS.secondary.push((eye, basis, it, id) => { if (it && it.potion) { alchemy.drink(id); return true; } return false; });
HOOKS.primary.push((eye, basis, held, it, id) => {
  if (!it) return false;
  if (id === 'potion_croissance') { if (!held) alchemy.pour(eye, basis.f); play.cool = 0.4; return true; }
  if (it.potion) { if (!held) alchemy.drink(id); play.cool = 0.5; return true; }
  if (id === 'fiole') {
    if (held) return true;
    const h = npcs.hour(), c = play.cellAt(eye, basis.f), w = game.world;
    play.cool = 0.5;
    if (c && h >= 4.5 && h < 8 && !weather.cur.rain && w.matAt(c.x, c.z) <= M_DRY && !farm.crop(c.x, c.z)) {
      const k = 'rosee_' + Math.round(c.x / 6) + '_' + Math.round(c.z / 6);
      if (farm.s.flags[k] === farm.s.day) { ui.subtitle('', '(L’herbe est déjà sèche, ici.)', 2); return true; }
      farm.s.flags[k] = farm.s.day;
      farm.take('fiole', 1); farm.give('rosee', 1); play.flyer('rosee', [c.x, c.y + 0.3, c.z], 1); sound.pour && sound.pour();
      return true;
    }
    ui.subtitle('', h >= 4.5 && h < 8 ? '(Il faut de l’herbe, et pas de pluie.)' : '(La rosée se recueille à l’aube, sur l’herbe.)', 2.5);
    return true;
  }
  return false;
});

// ---------------------------------------------------------------- effets des potions et bénédictions
HOOKS.update.push((dt) => {
  const p = game.player;
  if (BUFF.on('celerite')) p.mods.speed *= 1.35;
  if (BUFF.on('cerf') && ['foret', 'bouleaux'].includes(game.biomeAt(p.pos))) p.mods.speed *= 1.15;
  p.mods.jump = BUFF.on('legerete') ? 1.55 : 1;
  if (BUFF.on('apnee')) p.breath = 1;
  if (BUFF.on('source') && p.hp < 100) p.hp = Math.min(100, p.hp + dt * 0.4);
  alchemy.flashT = Math.max(0, (alchemy.flashT || 0) - dt);
  // fin d'un effet : un mot discret
  const s = farm.s;
  if (s.buffs) for (const k in s.buffs) if (s.buffs[k] <= s.hours) { delete s.buffs[k]; if (BUFF_NAMES[k] && !['pacte', 'cierge'].includes(k)) ui.subtitle('', '(' + BUFF_NAMES[k] + ' : l’effet se dissipe.)', 2.5); }
});
HOOKS.sky.push((sky) => {
  if (!BUFF.on('nyctalopie') || sky.night < 0.2) return;
  const k = sky.night;
  sky.amb = v3.add(sky.amb, v3.scale([0.16, 0.24, 0.17], k));
  sky.moonCol = v3.add(sky.moonCol, v3.scale([0.12, 0.2, 0.13], k));
  sky.fog = [sky.fog[0], Math.max(sky.fog[1], 200)];
  sky.haze = v3.add(sky.haze, v3.scale([0.03, 0.06, 0.04], k));
});
HOOKS.fx.push((fx, tint) => {
  if (alchemy.flashT > 0) { const c = alchemy.flashCol || [1, 1, 1]; tint[0] = c[0]; tint[1] = c[1]; tint[2] = c[2]; tint[3] = Math.max(tint[3], alchemy.flashT * 0.25); }
  else if (BUFF.on('nyctalopie') && game.sky && game.sky.night > 0.3) { tint[0] = 0.2; tint[1] = 0.6; tint[2] = 0.3; tint[3] = Math.max(tint[3], 0.07); }
});
// l'élixir du dernier souffle : la mort recule une fois
HOOKS.death.push((cause) => {
  if (!BUFF.on('souffle')) return false;
  BUFF.end('souffle');
  const p = game.player;
  p.hp = 30; play.poisonT = 0; play.hurtFlash = 1;
  strange.glitchT = 1.5; sound.heartbeat && sound.heartbeat(1);
  ui.subtitle('', '(Quelque chose vous retient, tout au bord. Vous respirez encore.)', 4);
  return true;
});
// bonne fortune : un second tirage de butin
const _rollLoot = rollLoot;
rollLoot = function (key, rnd) {
  const a = _rollLoot(key, rnd);
  if (!BUFF.on('chance')) return a;
  const out = {}; for (const [k, n] of a.concat(_rollLoot(key, rnd))) out[k] = (out[k] || 0) + n;
  return Object.entries(out);
};
// philtre d'amitié
let alchHooksOn = false;
HOOKS.load.push(() => {
  const s = farm.s;
  s.buffs = s.buffs || {}; s.alchemy = s.alchemy || { known: {}, clues: {} };
  if (alchHooksOn) return;
  alchHooksOn = true;
  const _add = npcs.addAmitie.bind(npcs);
  npcs.addAmitie = (n, k) => _add(n, k > 0 && BUFF.on('charme') ? k * 2 : k);
  const _near = game.nearStation.bind(game);
  game.nearStation = (st) => _near(st);
});
