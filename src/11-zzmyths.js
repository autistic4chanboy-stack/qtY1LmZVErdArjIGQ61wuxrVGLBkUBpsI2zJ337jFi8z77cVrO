// ============================================================================
//  LÉGENDES : les habitants les racontent, des livres les gardent ; chacune
//  mène à un vrai secret. Les onze reliques des Anciens, réunies à l'autel du
//  cercle à minuit, apaisent la vallée.
// ============================================================================
const MYTH_ORDER = ['cerf_blanc', 'dame_du_lac', 'cloche_noyee', 'treize_pierres', 'tresor_valmont', 'bete_des_combes', 'feux_follets', 'moine_sans_visage', 'frappeurs', 'chene_des_ancetres', 'puits_aux_souhaits', 'chasse_volante', 'mere_des_moissons', 'lise'];
const MYTH_FALLBACK = {
  cerf_blanc: 'Le Cerf Blanc', dame_du_lac: 'La Dame du Lac', cloche_noyee: 'La Cloche noyée', treize_pierres: 'Les Treize Pierres', tresor_valmont: 'L’Or des Valmont', bete_des_combes: 'La Bête des Combes',
  feux_follets: 'Les Feux follets', moine_sans_visage: 'Le Moine sans visage', frappeurs: 'Les Frappeurs', chene_des_ancetres: 'Le Chêne des Ancêtres', puits_aux_souhaits: 'Le Puits aux souhaits', chasse_volante: 'La Chasse volante', mere_des_moissons: 'La Mère des Moissons', lise: 'La petite Lise',
};
const NPC_MYTHS = { maire: ['tresor_valmont', 'treize_pierres'], boulangere: ['mere_des_moissons', 'puits_aux_souhaits'], forgeron: ['frappeurs', 'bete_des_combes'], grainetiere: ['mere_des_moissons', 'chene_des_ancetres'], aubergiste: ['chasse_volante', 'feux_follets', 'tresor_valmont'], cure: ['cloche_noyee', 'moine_sans_visage'], postiere: ['lise', 'puits_aux_souhaits'], garde: ['bete_des_combes', 'chasse_volante'], eleveuse: ['cerf_blanc', 'bete_des_combes'], pecheur: ['dame_du_lac', 'cloche_noyee'], guerisseuse: ['cerf_blanc', 'treize_pierres', 'dame_du_lac', 'chene_des_ancetres'], fillette: ['lise', 'feux_follets'] };
const myths = {
  st() { const s = farm.s; s.myths = s.myths || { heard: {}, found: {} }; return s.myths; },
  M(id) { return (typeof MYTHS !== 'undefined' && MYTHS[id]) || { titre: MYTH_FALLBACK[id] || id, resume: '', texte: '…', indice: '', decouverte: '' }; },
  heard(id) { return !!this.st().heard[id]; },
  isFound(id) { return !!this.st().found[id]; },
  hear(id, who) { const S = this.st(); if (!S.heard[id]) { S.heard[id] = { day: farm.s.day, who: who || '' }; ui.subtitle('', '(Nouvelle légende au carnet : ' + this.M(id).titre + '.)', 3); } },
  found(id) {
    const S = this.st();
    if (S.found[id]) return;
    S.found[id] = farm.s.day;
    if (!S.heard[id]) S.heard[id] = { day: farm.s.day, who: '' };
    const M = this.M(id);
    sound.quest && sound.quest(true);
    setTimeout(() => ui.read(M.titre, fmtLine(M.decouverte || 'Vous l’avez vu de vos yeux.', null), 'Une légende de la vallée'), 1200);
    farm.s.stats.myths = Object.keys(S.found).length;
  },
  // un habitant raconte une légende qu'il connaît (d'abord celles qu'on ignore)
  tell(n) {
    const L = typeof NPC_LIFE !== 'undefined' && NPC_LIFE[n.id], list = (L && L.mythes) || NPC_MYTHS[n.id] || [];
    if (!list.length) return null;
    const id = list.find((m) => !this.heard(m)) || list[(farm.s.day + n.id.length) % list.length];
    const intro = L && L.mythe_intro ? pick(L.mythe_intro) : 'On raconte, par ici…';
    this.hear(id, n.id);
    return { id, intro: fmtLine(intro, n), texte: fmtLine(this.M(id).texte, n), titre: this.M(id).titre };
  },
  relicsHeld() { return RELICS.filter((r) => farm.count(r) > 0); },
};

// ---------------------------------------------------------------- reliques à ramasser
HOOKS.interVis.relic = (it) => !farm.s.flags['got_' + (it.data.item || it.id)];
HOOKS.inter.relic = (it) => {
  const s = farm.s, w = game.world, d = it.data, item = d.item;
  s.flags['got_' + item] = 1; s.flags['got_' + it.id] = 1;
  farm.give(item, 1); play.flyer(item, [it.x, it.y, it.z], 1);
  sound.lootOpen && sound.lootOpen(); strange.glitchT = 0.3;
  const q = d.prop !== undefined ? w.props[d.prop] : null;
  if (q) { q.gone = true; if (d.prop < farm.genProps) s.gone[d.prop] = 1; farm.dirtyProps = true; }
  const desc = typeof LORE_TEXT !== 'undefined' && LORE_TEXT.reliques && LORE_TEXT.reliques[item];
  ui.read(itemName(item), fmtLine(desc || 'Un objet très ancien. Il est tiède.', null), 'Une relique des Anciens');
  const map = { relique_calice: 'cloche_noyee', relique_tablette: 'treize_pierres', relique_croix: 'moine_sans_visage', relique_lampe: 'frappeurs', relique_fer: 'chasse_volante', relique_poupee: 'mere_des_moissons' };
  if (d.myth || map[item]) myths.found(d.myth || map[item]);
};
// le grimoire du frère Anselme : on apprend six recettes
HOOKS.interPre.pickup = (it) => {
  if (it.data.grimoire) {
    for (const id of ['potion_nyctalopie', 'potion_silence', 'potion_clairvoyance', 'potion_apnee', 'potion_legerete', 'elixir_souffle']) alchemy.learn(id, true);
    const pages = typeof LORE_TEXT !== 'undefined' && LORE_TEXT.abbaye && LORE_TEXT.abbaye.grimoire_pages;
    farm.s.flags.grimoire = 1;
    setTimeout(() => { ui.read('Le grimoire du frère Anselme', fmtLine(pages ? pages.slice(0, 3).join('\n\n— ✦ —\n\n') : 'Des recettes à l’encre brune.', null), 'Six recettes sont désormais au grimoire (onglet Grimoire de la sacoche).'); myths.found('moine_sans_visage'); }, 400);
  }
  return false;
};
// l'abbaye : la pierre descellée derrière l'autel
HOOKS.inter.abbey_stone = (it) => {
  const s = farm.s;
  if (!s.flags.abbayeOuverte) {
    const T = typeof LORE_TEXT !== 'undefined' && LORE_TEXT.abbaye;
    if (!s.flags.abbayeVue) { s.flags.abbayeVue = 1; ui.read('Derrière l’autel', fmtLine((T && T.autel) || 'Une pierre du mur sonne creux sous les doigts.', null) + '\n\n(Elle bouge un peu, sous la main.)'); return; }
    s.flags.abbayeOuverte = s.day;
    sound.rumble && sound.rumble(); game.shakeT = 0.5;
  }
  game.teleport(it.data.to, 'Un escalier descend dans le noir.');
};
// les Frappeurs : pain et lait dans la niche ; le lendemain, la paroi s'ouvre
HOOKS.inter.frappeurs = (it) => {
  const s = farm.s, q = game.world.props[it.data.prop];
  const T = typeof LORE_TEXT !== 'undefined' && LORE_TEXT.frappeurs;
  if (s.flags.frappeursOffert) { ui.subtitle('', s.flags.frappeursOuvert ? '(La niche est vide. De petites empreintes dans la poussière.)' : '(Le pain et le lait sont toujours là.)', 3); return; }
  const lait = farm.count('lait') ? 'lait' : farm.count('lait_chevre') ? 'lait_chevre' : null;
  if (farm.count('pain') && lait) {
    farm.take('pain', 1); farm.take(lait, 1);
    s.flags.frappeursOffert = s.day;
    if (q) farm.setPropData(q, { offer: true });
    sound.place && sound.place();
    setTimeout(() => sound.knock && sound.knock(3), 1500);
    return;
  }
  ui.read('La niche des Frappeurs', fmtLine((T && T.niche) || 'Une niche taillée dans la roche, avec une planchette. Des miettes, très anciennes.', null));
};
HOOKS.interVis.paroi = () => true;
HOOKS.inter.paroi = (it) => {
  const s = farm.s, w = game.world, q = w.props[it.data.prop];
  if (s.flags.frappeursOuvert) { game.teleport(it.data.to, ''); return; }
  if (!s.flags.frappeursOffert || s.day <= s.flags.frappeursOffert) { sound.knock && sound.knock(2); return; }
  if (!farm.bestTool('pioche')) { ui.subtitle('', '(La fente s’est élargie. Il faudrait une pioche.)', 3); return; }
  s.flags.frappeursOuvert = s.day;
  if (q) { farm.setPropData(q, { ouvert: true }); removePropCollider(w, q); }
  sound.rumble && sound.rumble(); game.shakeT = 0.6;
  const T = typeof LORE_TEXT !== 'undefined' && LORE_TEXT.frappeurs;
  ui.read('La galerie des Frappeurs', fmtLine((T && T.galerie) || 'Derrière la paroi, une galerie que personne n’a creusée.', null));
};
// le cercle : la chambre des Treize (13e pierre, nuit rouge, ou l'Envers) — et, reliques réunies, la fin
HOOKS.interPre.altar = (it) => {
  const s = farm.s, w = game.world, h = npcs.hour(), midnight = h >= 23.5 || h < 2.5;
  const thirteen = (w.curVer & (0x4 | 0x8)) || strange.redNight() || strange.inEnvers();
  const held = myths.relicsHeld();
  if (held.length === RELICS.length && midnight && !s.flags.apaisee) { finalRitual(it); return true; }
  if (midnight && thirteen && w.circleRoom && !s.flags.cercleOuvert) {
    s.flags.cercleOuvert = s.day;
    sound.rumble && sound.rumble(); game.shakeT = 0.8; strange.glitchT = 0.6;
    game.teleport(w.circleRoom.to, 'La pierre du centre glisse, lentement, sur un lit de terre noire.');
    return true;
  }
  if (s.flags.cercleOuvert && midnight && w.circleRoom) { game.teleport(w.circleRoom.to, ''); return true; }
  const lines = [];
  lines.push(strange.inEnvers() ? '(Treize pierres. Toutes tournées vers vous.)' : '(La pierre est tiède, comme si quelqu’un venait de s’y asseoir.)');
  if (held.length) lines.push(held.length === RELICS.length ? '(Toutes les reliques. Pas à cette heure-ci.)' : `(Vous portez ${held.length} relique${held.length > 1 ? 's' : ''} sur ${RELICS.length}.)`);
  ui.subtitle('', lines.join(' '), 4.5);
  return true;
};
async function finalRitual(it) {
  const s = farm.s;
  for (const r of RELICS) farm.take(r, 1);
  s.flags.apaisee = s.day;
  game.sleeping = true;
  sound.rumble && sound.rumble();
  const F = typeof LORE_TEXT !== 'undefined' && LORE_TEXT.fin;
  await ui.fade(true, 'Les treize pierres, une à une, se tournent vers vous.', 1800);
  await new Promise((r) => setTimeout(r, 2600));
  if (F && F.veilleur) for (const v of F.veilleur) { $('#fade-text').textContent = fmtLine(v, null); await new Promise((r) => setTimeout(r, 3400)); }
  await ui.fade(false, '', 1500);
  game.sleeping = false;
  if (strange.s) { strange.s.redTonight = false; strange.s.red = false; }
  npcs.vanishAll(false);
  farm.give('couronne_anciens', 1);
  ui.read('La vallée s’apaise', fmtLine((F && F.autel) || 'Les nuits rouges ne reviendront plus.', null), 'Vous avez réuni les reliques des Anciens.');
  faith.add('anciens', 20);
}
// le chêne des Ancêtres : dormir à son pied (la nuit) montre un secret
HOOKS.inter.dream = async (it) => {
  const s = farm.s, h = npcs.hour();
  if (h > 5.5 && h < 20.5) { ui.subtitle('', '(Ce n’est pas l’heure. Le chêne veille la nuit.)', 3); return; }
  const w = game.world, R = typeof LORE_TEXT !== 'undefined' && LORE_TEXT.reves;
  const order = [['valmont', () => !s.flags.secret_valmont], ['abbaye', () => !s.flags.abbayeOuverte], ['lise', () => !s.flags.liseApaisee], ['frappeurs', () => !s.flags.frappeursOuvert], ['dame', () => !myths.isFound('dame_du_lac')]];
  const pickD = order.find(([k, test]) => test() && !(s.flags.reves || {})[k]);
  s.flags.reves = s.flags.reves || {};
  let txt;
  if (pickD) { s.flags.reves[pickD[0]] = 1; txt = R && R[pickD[0]]; } else txt = R && R.generique && pick(R.generique);
  myths.found('chene_des_ancetres');
  faith.add('anciens', 2);
  await game.sleep('chene');
  setTimeout(() => ui.read('Le rêve sous le chêne', fmtLine(txt || 'Vous rêvez de gens que vous n’avez jamais connus. Ils vous connaissent.', null), 'Au réveil, l’écorce a laissé son dessin sur votre joue.'), 400);
};
// le recueil de légendes, à la mairie
HOOKS.inter.book_legends = () => {
  const ids = ['treize_pierres', 'cloche_noyee', 'chasse_volante', 'bete_des_combes', 'lise'].filter((id) => !myths.heard(id));
  if (!ids.length) { ui.subtitle('', '(Vous connaissez déjà tout ce que ce recueil raconte.)', 3); return; }
  const id = ids[0], M = myths.M(id);
  myths.hear(id, '');
  ui.read(M.titre, fmtLine(M.texte, null), 'Recueil des légendes de la vallée, annoté par plusieurs mains');
};
// la chasse volante laisse parfois un fer à cheval là où elle est passée
HOOKS.inter.fer_mesnie = (it) => HOOKS.inter.relic(it);

// ---------------------------------------------------------------- le cerf mène à la clairière ; les follets, à l'îlot
let mythHooksOn = false;
HOOKS.load.push(() => {
  const s = farm.s, w = game.world;
  myths.st();
  // la poupée de la Mère, promise et pas encore prise
  if (s.flags.poupeeProm && !s.flags.got_relique_poupee && s.day > s.flags.poupeeProm) {
    const q = w.props.find((p) => p.id === 'pierre_offrandes');
    if (q && !w.inter.some((i) => i.id === 'poupee_mere')) w.inter.push({ kind: 'relic', id: 'poupee_mere', x: q.x, y: q.y + 0.9, z: q.z, name: 'Prendre la poupée de paille', data: { item: 'relique_poupee', myth: 'mere_des_moissons' } });
  }
  if (s.flags.ferMesnie && !s.flags.got_relique_fer) spawnFer(s.flags.ferMesnie);
  if (mythHooksOn) return;
  mythHooksOn = true;
  const _stag = strange.spawnStag.bind(strange);
  strange.spawnStag = function (c) {
    const L = game.world.lm.clairiere, p = game.player;
    if (L && !myths.isFound('cerf_blanc') && (myths.heard('cerf_blanc') || faith.lvl('anciens') >= 1)) {
      const a = Math.atan2(L.x - p.pos[0], L.z - p.pos[2]) + (Math.random() - 0.5) * 1.2, x = p.pos[0] + Math.sin(a) * 40, z = p.pos[2] + Math.cos(a) * 40;
      this.ents.push({ kind: 'stag', x, z, y: game.world.heightAt(x, z), rig: ANIMAL_RIGS.deer(0, true), t: 0, heading: a, life: 600, tgt: { x: L.x, z: L.z }, phase: 0 });
      return;
    }
    _stag(c);
  };
  const _wisp = strange.E_wisp.bind(strange);
  strange.E_wisp = function (e, dt, c) {
    const I = game.world.islet;
    if (I && !farm.s.flags.secret_noyes && (myths.heard('feux_follets') || e.guide)) {
      const p = game.player, d = Math.hypot(e.x - p.pos[0], e.z - p.pos[2]), di = Math.hypot(e.x - I.x, e.z - I.z);
      e.y = game.world.waterLevel + 0.8 + Math.sin(e.t * 1.3) * 0.3;
      if (di > 2 && d < 18) { const a = Math.atan2(I.x - e.x, I.z - e.z); e.x += Math.sin(a) * dt * 2.2; e.z += Math.cos(a) * dt * 2.2; }
      else if (di <= 2) { e.x = I.x + Math.sin(e.t * 0.8 + e.seed) * 1.2; e.z = I.z + Math.cos(e.t * 0.8 + e.seed) * 1.2; e.y = I.y + 0.9 + Math.sin(e.t * 2) * 0.2; }
      return e.t < e.life && c.night > 0.4;
    }
    return _wisp(e, dt, c);
  };
});
// si l'on connaît la légende, le cerf blanc vient plus souvent à l'aube ; les follets aussi
HOOKS.day.push(() => {
  const S = strange.s, s = farm.s;
  if (!S) return;
  if (myths.heard('cerf_blanc') && !myths.isFound('cerf_blanc') && Math.random() < 0.4) S.events.push({ id: 'cerf', h: 5.2 + Math.random(), done: false });
  if (myths.heard('feux_follets') && !s.flags.secret_noyes && Math.random() < 0.45) S.events.push({ id: 'follets', h: 21.8 + Math.random(), done: false });
  if (s.flags.apaisee) { S.redTonight = false; }
});
function spawnFer(pos) {
  const w = game.world;
  if (w.inter.some((i) => i.id === 'fer_mesnie')) return;
  w.props.push({ id: 'relique_sol', x: pos[0], y: w.heightAt(pos[0], pos[1]), z: pos[1], r: 0, fer: true });
  w.inter.push({ kind: 'relic', id: 'fer_mesnie', x: pos[0], y: w.heightAt(pos[0], pos[1]) + 0.5, z: pos[1], name: 'Ramasser le fer à cheval', data: { item: 'relique_fer', myth: 'chasse_volante', prop: w.props.length - 1 } });
  farm.dirtyProps = true;
}
// clairvoyance (potion) et « les yeux des Anciens » : ce qui est caché luit
HOOKS.update.push((dt, eye) => {
  if (!(BUFF.on('clairvoyance') || BUFF.on('vision'))) return;
  game.clairT = (game.clairT || 0) - dt;
  if (game.clairT > 0) return;
  game.clairT = 0.25;
  const w = game.world, s = farm.s, pts = [];
  for (const q of w.secrets || []) if (!s.flags['secret_' + q.id]) pts.push([q.x, w.heightAt(q.x, q.z), q.z]);
  for (const m of s.maps || []) if (!m.found) pts.push([m.x, w.heightAt(m.x, m.z), m.z]);
  for (const id in w.caves || {}) if (!s.flags['grotte_' + id]) { const C = w.caves[id]; pts.push([C.x, C.y + 1, C.z]); }
  for (const it of w.inter || []) if ((it.kind === 'relic' && !s.flags['got_' + it.data.item]) || (it.kind === 'abbey_stone' && !s.flags.abbayeOuverte) || (it.kind === 'paroi' && !s.flags.frappeursOuvert) || (it.kind === 'dig' && !s.flags['dug_' + it.id])) pts.push([it.x, it.y, it.z]);
  for (const [x, y, z] of pts) {
    if (Math.abs(x - eye[0]) > 90 || Math.abs(z - eye[2]) > 90) continue;
    for (let k = 0; k < 3; k++) particles.spawn(x + (Math.random() - 0.5) * 1.5, y + Math.random() * 0.5, z + (Math.random() - 0.5) * 1.5, 0, 0.8 + Math.random(), 0, [1.0, 0.85, 0.4, 1], 0.07, 1.4, -0.3, true);
  }
});
