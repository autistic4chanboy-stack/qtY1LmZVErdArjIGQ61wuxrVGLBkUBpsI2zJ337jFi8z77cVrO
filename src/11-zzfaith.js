// ============================================================================
//  PRIÈRE ET RELIGIONS : l'Église (saint Aubin, la messe du dimanche), la Vieille
//  Foi (la Mère des Moissons, la Dame du Lac, le Cerf Blanc) et Ceux d'En-Dessous.
//  La faveur de chacune est cachée ; on la devine aux signes et aux gens.
// ============================================================================
const FAITH_LABEL = { eglise: 'l’Église', anciens: 'la Vieille Foi', dessous: 'Ceux d’En-Dessous' };
const SHRINE_TITLE = {
  eglise: 'L’autel de l’église', chapelle: 'L’autel de la chapelle', abbaye: 'L’autel de l’abbaye', calvaire: 'Le calvaire', mere: 'La pierre aux offrandes', dame: 'La pierre de la Dame',
  cerf: 'La pierre du Cerf', cercle: 'L’autel du cercle', chene: 'Le chêne des Ancêtres', source: 'La source aux rubans', dolmen: 'La Table des Géants', crypte: 'L’autel noir', puits: 'Le vieux puits', maison: 'Votre coin de prière',
};
// ce que chaque foi reçoit volontiers en offrande (points de faveur)
const OFFER_VALUE = {
  eglise: { bougie: 3, pain: 1, fleur: 1, vin: 2, miel: 1 },
  anciens: { fleur: 2, lait: 2, miel: 3, pain: 2, pomme: 2, baies: 1, fromage: 2, lait_chevre: 2, oeuf: 1, perle: 5, bijou: 4, trefle: 3, fleur_lune: 4 },
  dessous: { viande: 2, os: 2, plume_noire: 3, eclat: 5, sang: 5, bijou: 2, vieille_piece: 2 },
};
const faith = {
  s() { const s = farm.s; s.faith = s.faith || { eglise: 0, anciens: 0, dessous: 0, prayed: {}, offers: {}, coins: 0, mass: {}, last: {} }; return s.faith; },
  lvl(f) { return Math.floor((this.s()[f] || 0) / 10); },
  add(f, k) { const F = this.s(); F[f] = clamp((F[f] || 0) + k, -50, 200); },
  text(path, fb) { try { let o = FAITH; for (const k of path) o = o[k]; return o || fb; } catch (e) { return fb; } },
  shrineKind(it) { const k = it.data.shrine || ''; return k.startsWith('calvaire') ? 'calvaire' : k; },
  // --------------------------------------------------------------- le petit panneau « prier / offrir / partir »
  open(it) {
    const d = it.data, F = this.s(), kind = this.shrineKind(it), s = farm.s, hand = s.hand, it2 = ITEMS[hand];
    const title = SHRINE_TITLE[kind] || 'Un lieu de prière';
    let desc = '';
    if (d.faith === 'eglise' && kind === 'calvaire') desc = pick(this.text(['eglise', 'calvaires'], ['Une croix de chemin.'])) || '';
    else if (d.faith === 'anciens') desc = this.text(['anciens', 'inscriptions', { mere: 'pierre_offrandes', dame: 'pierre_dame', cerf: 'pierre_cerf', source: 'source' }[kind] || kind], '') || '';
    else if (d.faith === 'dessous') desc = this.text(['dessous', 'inscriptions', kind === 'crypte' ? 'crypte' : 'dolmen'], '') || '';
    const opts = [];
    const today = (F.prayed[kind] === s.day);
    opts.push({ label: today ? 'Prier encore (vous l’avez déjà fait aujourd’hui)' : 'Prier', fn: () => this.pray(it) });
    const val = OFFER_VALUE[d.faith] && it2 ? (OFFER_VALUE[d.faith][hand] ?? (d.faith === 'anciens' && it2.cat === 'culture' ? 3 : d.faith === 'dessous' && it2.cat === 'chasse' ? 1 : null)) : null;
    if (val !== null && val !== undefined && farm.count(hand)) opts.push({ label: 'Déposer en offrande : ' + it2.name, fn: () => this.offer(it, hand, val) });
    if (d.faith === 'eglise' && s.money >= 5 && (kind === 'eglise' || kind === 'calvaire')) opts.push({ label: 'Glisser une pièce dans le tronc (5)', fn: () => { farm.pay(5); this.add('eglise', 1); sound.coin && sound.coin(); ui.close(); } });
    if (d.faith === 'dessous') opts.push({ label: 'Demander quelque chose…', fn: () => this.pactMenu(it) });
    opts.push({ label: 'Partir', fn: () => ui.close() });
    ui.choice(title, desc ? fmtLine(desc, null) : '', opts);
  },
  // --------------------------------------------------------------- prier
  async pray(it) {
    const d = it.data, F = this.s(), s = farm.s, kind = this.shrineKind(it), f = d.faith, h = npcs.hour(), night = h >= 21 || h < 5;
    ui.close(true);
    const first = F.prayed[kind] !== s.day;
    F.prayed[kind] = s.day;
    // texte de la prière
    let pr;
    if (f === 'eglise') pr = pick(this.text(['eglise', 'prieres'], ['Saint Aubin, gardez cette maison, et ceux qui dorment dedans.']));
    else if (f === 'anciens') pr = pick(this.text(['anciens', 'prieres', kind], ['Anciens de la vallée, voyez-moi, et ne m’oubliez pas.']));
    else pr = pick(this.text(['dessous', 'prieres'], ['Vous qui êtes en bas… je sais que vous écoutez.']));
    game.sleeping = true;
    sound.candle && sound.candle();
    await ui.fade(true, fmtLine(pr, null), 900);
    await new Promise((r) => setTimeout(r, 2600));
    await ui.fade(false, '', 900);
    game.sleeping = false;
    // la réponse
    let sign = 'neutre';
    if (first) { this.add(f, f === 'dessous' ? 2 : 1); sign = this.lvl(f) >= 1 || Math.random() < 0.5 ? 'bon' : 'neutre'; }
    if (f === 'eglise' && this.s().dessous > 20) sign = 'mauvais';
    if (f !== 'dessous' && kind === 'chapelle' && night) sign = 'mauvais';
    if (f === 'eglise') {
      if (first) BUFF.add('grace', kind === 'eglise' ? (farm.count('chapelet_buis') ? 30 : 16) : 6);
      if (kind === 'chapelle' && night) { sound.whisper && sound.whisper(0, 0.7); this.add('dessous', 1); }
    } else if (f === 'anciens') {
      if (first) {
        if (kind === 'mere') BUFF.add('moisson', 18);
        if (kind === 'dame') BUFF.add('lac', 18);
        if (kind === 'cerf') { BUFF.add('cerf', 18); if (typeof myths !== 'undefined') myths.found('cerf_blanc'); if (!s.flags.got_relique_cerf) { s.flags.got_relique_cerf = 1; farm.give('relique_cerf', 1); play.flyer('relique_cerf', [it.x, it.y + 0.5, it.z], 1); } }
        if (kind === 'cercle' && night) BUFF.add('vision', 2);
        if (kind === 'chene') BUFF.add('chene', 12);
        if (kind === 'source') { const p = game.player; p.hp = Math.min(100, p.hp + 30); play.poisonT = 0; BUFF.add('source', 6); }
      }
      if (this.s().dessous > 25 && Math.random() < 0.5) sign = 'mauvais';
    } else {
      sign = 'bon';
      sound.whisper && sound.whisper(0, 0.8);
      setTimeout(() => ui.subtitle('???', fmtLine(pick(this.text(['dessous', 'reponses'], ['… nous t’entendons…'])), null), 3.5), 1200);
    }
    const signs = this.text([f, 'signes_' + sign], null);
    if (signs && f !== 'dessous') ui.subtitle('', fmtLine(pick(signs), null), 4);
    if (f === 'eglise' && first) npcsNotice('eglise');
  },
  // --------------------------------------------------------------- offrandes
  offer(it, item, val) {
    const d = it.data, F = this.s(), s = farm.s, kind = this.shrineKind(it), h = npcs.hour(), night = h >= 20.5 || h < 5;
    if (!farm.take(item, 1)) return;
    ui.close(true);
    this.add(d.faith, val);
    F.offers[kind] = (F.offers[kind] || 0) + 1;
    sound.place && sound.place();
    puffAt(it.x, it.y - 0.3, it.z, [230, 220, 180], 8, 1, true);
    const q = d.prop !== undefined ? game.world.props[d.prop] : null;
    if (d.faith === 'anciens') {
      if (kind === 'mere') { if (q) farm.setPropData(q, { offer: item }); BUFF.add('moisson', 18); ui.subtitle('', '(Le vent passe sur le champ, et les tiges se redressent.)', 3.5); if (F.offers.mere >= 3 && this.lvl('anciens') >= 1 && !s.flags.poupeeProm) s.flags.poupeeProm = s.day; }
      else if (kind === 'dame') {
        if (q) farm.setPropData(q, { offer: true });
        if (night) {
          if (typeof myths !== 'undefined') myths.found('dame_du_lac');
          farm.give('larme_dame', 1); play.flyer('larme_dame', [it.x, it.y, it.z], 1); BUFF.add('lac', 24);
          sound.splash && sound.splash();
          if (F.offers.dame >= 2 && this.lvl('anciens') >= 1 && !s.flags.got_relique_dame) { s.flags.got_relique_dame = 1; setTimeout(() => { farm.give('relique_dame', 1); play.flyer('relique_dame', [it.x, it.y, it.z], 1); }, 2500); }
        } else ui.subtitle('', '(La pierre reste froide. Pas le jour.)', 3);
      } else ui.subtitle('', pick(this.text(['anciens', 'signes_bon'], ['(Les feuilles frémissent.)'])), 3.5);
    } else if (d.faith === 'eglise') {
      if (item === 'bougie') { BUFF.add('cierge', 12); ui.subtitle('', '(La flamme du cierge ne tremble pas.)', 3); }
    } else ui.subtitle('???', fmtLine(pick(this.text(['dessous', 'reponses'], ['… merci…'])), null), 3.5);
  },
  // --------------------------------------------------------------- les pactes de Ceux d'En-Dessous
  pactMenu(it) {
    const F = this.s(), s = farm.s;
    if (F.pactDay === s.day) { ui.close(); ui.subtitle('???', '… pas deux fois le même jour…', 3); return; }
    const has = ['viande', 'os', 'plume_noire', 'eclat'].filter((k) => farm.count(k));
    const need = has.length ? has[0] : null;
    const ask = (what) => () => this.pact(it, what, need);
    ui.choice('Demander quelque chose', need ? '(En échange : ' + itemName(need).toLowerCase() + '.)' : '(Ils ne donnent rien pour rien.)', need ? [
      { label: 'L’or', fn: ask('or') }, { label: 'La récolte', fn: ask('recolte') }, { label: 'La nuit : qu’elle ne me voie pas', fn: ask('nuit') }, { label: 'Le savoir : ce qui est caché', fn: ask('savoir') }, { label: 'Rien. Partir.', fn: () => ui.close() },
    ] : [{ label: 'Partir', fn: () => ui.close() }]);
  },
  pact(it, what, need) {
    const F = this.s(), s = farm.s;
    if (!need || !farm.take(need, 1)) { ui.close(); return; }
    ui.close(true);
    F.pactDay = s.day; F.pacts = (F.pacts || 0) + 1;
    this.add('dessous', 6); this.add('eglise', -4); this.add('anciens', -2);
    s.flags.prixDu = s.day + 1;
    BUFF.add('pacte', 30);
    sound.whisper && sound.whisper(0, 1); strange.glitchT = 0.8;
    if (what === 'or') { const n = 120 + Math.floor(Math.random() * 200); farm.earn(n); sound.coin && sound.coin(); ui.subtitle('???', '… prends…', 3); ui.subtitle('', `(${n} pièces dans votre poche.)`, 3.5); }
    else if (what === 'recolte') { for (const k in s.crops) { const c = s.crops[k]; if (c.c && !c.dead) c.g = Math.min(CROPS[c.c].h, c.g + 8); } farm.dirtyProps = true; ui.subtitle('', '(Dans le champ, tout a poussé d’un coup.)', 4); }
    else if (what === 'nuit') { BUFF.add('pacte_nuit', 20); ui.subtitle('???', '… cette nuit, tu n’existes pas…', 3.5); }
    else {
      const w = game.world, p = game.player.pos;
      const cand = [...(w.secrets || []).filter((q) => !s.flags['secret_' + q.id]).map((q) => [q.x, q.z, 'Là où l’on a enterré de l’or.']),
        ...Object.keys(w.caves || {}).filter((id) => !s.flags['grotte_' + id]).map((id) => [w.caves[id].x, w.caves[id].z, 'Là où la terre s’est refermée sur une grotte.'])];
      if (cand.length) { cand.sort((a, b) => Math.hypot(a[0] - p[0], a[1] - p[2]) - Math.hypot(b[0] - p[0], b[1] - p[2])); const [x, z, t] = cand[0]; const a = Math.atan2(x - p[0], z - p[2]), d = Math.hypot(x - p[0], z - p[2]); ui.subtitle('???', `… ${t.toLowerCase()} … vers ${game.world.cardinal(a)}… à ${Math.round(d / 50) * 50} pas…`, 6); }
      else ui.subtitle('???', '… tu sais déjà tout ce que nous savons…', 4);
    }
  },
  // le prix, le lendemain d'un pacte
  price() {
    const s = farm.s, r = Math.random();
    const txt = this.text(['dessous', 'prix'], null);
    if (r < 0.3) { const a = s.animals.find((q) => !q.dead && !q.lost); if (a) { a.lost = 1; game.syncAnimals(); } }
    else if (r < 0.55) { const lost = Math.floor(s.money * 0.15); s.money -= lost; }
    else if (r < 0.8) { const ks = Object.keys(s.crops).filter((k) => s.crops[k].c); for (let k = 0; k < 4 && ks.length; k++) { const c = s.crops[ks.splice((Math.random() * ks.length) | 0, 1)[0]]; c.dead = true; } farm.dirtyProps = true; }
    else if (strange.s) strange.s.t0 += 0.04;
    farm.mail('?', 'Sans signature', txt ? fmtLine(pick(txt), null).replace(/^\(|\)$/g, '') : 'Nous sommes passés prendre notre dû.', { strange: true });
  },
};
function npcsNotice(f) {
  // le curé apprend vite qui vient prier
  const c = npcs.byId.cure;
  if (c && c.st.alive && f === 'eglise') npcs.addAmitie(c, 6);
}

// ---------------------------------------------------------------- interactions
HOOKS.inter.pray = (it) => faith.open(it);
HOOKS.inter.benitier = (it) => {
  const s = farm.s;
  if (farm.count('fiole') && s.flags.benitier !== s.day) { s.flags.benitier = s.day; farm.take('fiole', 1); farm.give('eau_benite', 1); play.flyer('eau_benite', [it.x, it.y, it.z], 1); sound.pour && sound.pour(); return; }
  BUFF.add('grace', 1); if (farm.count('fiole')) ui.subtitle('', '(Une fiole par jour, dit l’écriteau.)', 3);
};
// vieux puits : pièces, vœux, et la descente (nuits rouges, philtre)
HOOKS.interPre.oldwell = (it) => {
  const s = farm.s, F = faith.s();
  if ((strange.redNight() || BUFF.on('envers')) && !strange.inEnvers()) { if (BUFF.on('envers')) BUFF.end('envers'); game.goEnvers(); return true; }
  const opts = [];
  if (farm.count('vieille_piece') || s.money >= 1) opts.push({ label: farm.count('vieille_piece') ? 'Jeter une vieille pièce et faire un vœu' : 'Jeter une pièce et faire un vœu', fn: () => wishWell(it) });
  opts.push({ label: 'Se pencher au-dessus du puits', fn: () => { ui.close(); sound.whisper(0, 0.4); ui.subtitle('', '(Tout au fond, l’eau ne reflète rien. Pas même le ciel.)', 3); } });
  if (OFFER_VALUE.dessous[s.hand] && farm.count(s.hand)) opts.push({ label: 'Laisser tomber : ' + itemName(s.hand), fn: () => faith.offer({ x: it.x, y: it.y, z: it.z, data: { faith: 'dessous', shrine: 'puits' } }, s.hand, OFFER_VALUE.dessous[s.hand]) });
  opts.push({ label: 'Partir', fn: () => ui.close() });
  ui.choice('Le vieux puits', F.coins ? `Vous y avez déjà jeté ${F.coins} pièce${F.coins > 1 ? 's' : ''}.` : 'La margelle est usée, comme si des milliers de mains s’y étaient appuyées.', opts);
  return true;
};
function wishWell(it) {
  const s = farm.s, F = faith.s();
  if (farm.count('vieille_piece')) farm.take('vieille_piece', 1); else farm.pay(1);
  ui.close(true);
  F.coins = (F.coins || 0) + 1;
  if (typeof myths !== 'undefined') myths.found('puits_aux_souhaits');
  sound.tick(); setTimeout(() => sound.splash && sound.splash(), 1300);
  const P = typeof LORE_TEXT !== 'undefined' && LORE_TEXT.puits;
  if (F.coins === 13) { faith.add('dessous', 8); alchemy.learn('philtre_envers'); setTimeout(() => ui.read('Le vieux puits', fmtLine((P && P.treizieme) || 'Treize. Le compte est bon.', null)), 1600); return; }
  if (F.wishDay === s.day) { setTimeout(() => ui.subtitle('???', '… une par jour…', 3), 1500); return; }
  F.wishDay = s.day;
  const r = Math.random();
  if (r < 0.3) BUFF.add('chance', 8); else if (r < 0.5) { const p = game.player; p.hp = Math.min(100, p.hp + 25); } else if (r < 0.7) s.flags.voeuPiece = s.day + 1; else faith.add('dessous', 1);
  setTimeout(() => ui.subtitle('???', fmtLine(P && P.voeux ? pick(P.voeux) : '… entendu…', null), 4), 1500);
}
// la tombe de Lise
HOOKS.inter.lise = (it) => {
  const s = farm.s, q = game.world.props[it.data.prop];
  if (s.flags.liseApaisee) { ui.subtitle('', '(Les fleurs sont toujours fraîches.)', 3); return; }
  if (farm.count('fleur') || farm.count('fleur_lune')) {
    farm.take(farm.count('fleur_lune') ? 'fleur_lune' : 'fleur', 1);
    s.flags.liseApaisee = s.day;
    if (q) farm.setPropData(q, { fleurs: true });
    if (typeof myths !== 'undefined') myths.found('lise');
    const T = typeof LORE_TEXT !== 'undefined' && LORE_TEXT.lise;
    ui.read('La petite tombe', fmtLine((T && T.apaisee) || 'Vous posez les fleurs. Dans le bois, un rire d’enfant, très loin, puis plus rien.', null));
    faith.add('anciens', 3);
    setTimeout(() => farm.mail('L.', 'Une lettre d’enfant', 'Merci pour les fleurs. Je ne viendrai plus m’asseoir à vos tables. Maman dit qu’il ne faut pas déranger.\n\nL.', { strange: true }), 100);
    return;
  }
  const T = typeof LORE_TEXT !== 'undefined' && LORE_TEXT.lise;
  ui.read('Une petite tombe', fmtLine((T && T.tombe) || 'Une croix de bois, un nom gravé au couteau : LISE.', null) + '\n\n(Il n’y a pas de fleurs. Il devrait y en avoir.)');
};
// le rond des fées
HOOKS.inter.fees = (it) => {
  const s = farm.s, h = npcs.hour(), night = h >= 21 || h < 4;
  if (!night) { ui.subtitle('', '(Un cercle de champignons, parfait. Trop parfait.)', 3); return; }
  if (s.flags.fees === s.day) { ui.subtitle('', '(La ronde est finie pour cette nuit.)', 2.5); return; }
  s.flags.fees = s.day;
  faith.add('anciens', 1);
  farm.give('champi_lumineux', 2); play.flyer('champi_lumineux', [it.x, it.y, it.z], 2);
  sound.whisper && sound.whisper(0, 0.3); strange.glitchT = 0.4;
  ui.subtitle('', '(Quelque chose rit, tout bas, et s’éloigne.)', 3.5);
};

// ---------------------------------------------------------------- la messe du dimanche (tous les 7 jours, 10 h – 11 h 30)
const MASS = { start: 9.8, end: 11.5 };
const isSunday = () => farm.s && farm.s.day % 7 === 0;
function massGoer(n) {
  const L = typeof NPC_LIFE !== 'undefined' && NPC_LIFE[n.id];
  if (n.id === 'cure') return true;
  if (L) return L.foi === 'eglise' || (L.devotion || 0) >= 2 || n.id === 'fillette';
  return ['maire', 'boulangere', 'fillette', 'garde', 'postiere'].includes(n.id);
}
let faithHooksOn = false;
HOOKS.load.push(() => {
  faith.s();
  if (faithHooksOn) return;
  faithHooksOn = true;
  // la routine du dimanche : les fidèles à l'église, assis sur les bancs
  const _sched = npcs.schedulePlace.bind(npcs);
  npcs.schedulePlace = function (n, h) {
    if (isSunday() && h >= MASS.start && h < MASS.end && massGoer(n) && !strange.redNight()) return { place: n.id === 'cure' ? 'work' : 'messe', sleep: false };
    return _sched(n, h);
  };
  const _dest = npcs.dest.bind(npcs);
  npcs.dest = function (n, pl, sleep) {
    const w = game.world;
    if (pl === 'messe' && w.bld.eglise) {
      const B = w.bld.eglise, goers = npcs.list.filter((m) => massGoer(m) && m.id !== 'cure');
      const i = Math.max(0, goers.indexOf(n)), sp = B.spots['banc' + (i * 2 + 1) % (B.pews || 1)] || B.spots['banc' + i];
      if (sp) return { node: B.nMid, x: sp.x, z: sp.z, r: sp.r, pose: 'sit', bld: 'eglise', y: sp.y, seat: true };
    }
    if (pl === 'lavoir' && w.lavoir) { const x = w.lavoir.x + (Math.random() - 0.5) * 3, z = w.lavoir.z + (Math.random() - 0.5); return { node: npcs.nearestReach(x, z, (q) => !/:(in|mid)$/.test(q.tag)), x, z, pose: 'work' }; }
    return _dest(n, pl, sleep);
  };
});
HOOKS.update.push((dt, eye, basis, sky, playing) => {
  const s = farm.s, F = faith.s(), h = npcs.hour(), w = game.world;
  if (!isSunday() || h < 10 || h > MASS.end || strange.redNight()) return;
  const inside = game.insideBuilding('eglise');
  const cure = npcs.byId.cure, alive = cure && cure.st.alive;
  if (!F.mass[s.day]) F.mass[s.day] = { t: 0, said: 0, done: false };
  const M = F.mass[s.day];
  if (inside) M.t += dt;
  // le sermon (sous-titres, quand on est dans l'église)
  game.sermonT = (game.sermonT || 0) - dt;
  if (inside && alive && game.sermonT <= 0 && h < 11.3) {
    game.sermonT = 7;
    const S = faith.text(['eglise', 'sermons'], ['Mes frères, mes sœurs…']);
    const line = M.said === 0 ? faith.text(['eglise', 'messe_debut'], 'Au nom du Père… Asseyez-vous.') : S[(M.said - 1) % S.length];
    M.said++;
    npcs.say(cure, fmtLine(line, cure), 6.5);
  }
  if (!M.done && h >= 11.3 && M.t > 25) {
    M.done = true;
    faith.add('eglise', 3); BUFF.add('grace', 20);
    if (alive) { npcs.addAmitie(cure, 25); npcs.say(cure, fmtLine(faith.text(['eglise', 'messe_fin'], 'Allez en paix.'), cure), 4); }
    for (const n of npcs.list) if (n.st.alive && n.place === 'messe') npcs.addAmitie(n, 8);
    s.stats.masses = (s.stats.masses || 0) + 1;
  }
});
HOOKS.day.push(() => {
  const s = farm.s;
  if (s.flags.prixDu && s.flags.prixDu <= s.day) { delete s.flags.prixDu; faith.price(); }
  // la Mère des Moissons répond aux offrandes fidèles
  if (s.flags.poupeeProm && !s.flags.got_relique_poupee && s.day > s.flags.poupeeProm) {
    const w = game.world, q = w.props.find((p) => p.id === 'pierre_offrandes');
    if (q && !w.inter.some((i) => i.id === 'poupee_mere')) w.inter.push({ kind: 'relic', id: 'poupee_mere', x: q.x, y: q.y + 0.9, z: q.z, name: 'Prendre la poupée de paille', data: { item: 'relique_poupee', myth: 'mere_des_moissons' } });
  }
  if (s.flags.voeuPiece === s.day) { farm.give('vieille_piece', 2); farm.mail('?', 'Dans la boîte aux lettres', 'Deux vieilles pièces, enveloppées dans une feuille de nénuphar mouillée. Rien d’autre.', { strange: true }); }
  if (isSunday()) farm.mail('Le presbytère', 'Messe dominicale', 'La messe sera dite ce dimanche à dix heures, en l’église de ' + farm.names.ville + '. Tous sont les bienvenus, même ceux qui ne croient plus. Surtout eux.\n\nLe curé.');
});
