// ============================================================================
//  LES MALÉDICTIONS
//  API (pour tous les modules) : malediction.frapper(id, cause), .lever(id),
//  .a(id) ; id = malchance | faim | betes | sommeil | pourriture | poids | ombre
//  (ou une cause connue : la malédiction qui va avec est choisie).
//  - la malchance : pièges vides, poissons qui décrochent, fouilles maigres ;
//  - la faim qui ne passe pas ; les bêtes qui fuient ; le sommeil sans repos ;
//  - les récoltes qui pourrissent ; le poids (on marche comme dans l'eau) ;
//  - l'ombre qui suit, la nuit, chaque jour plus près, et qui finit par
//    rattraper (la mort, si on ne l'a pas levée).
//  Causes : cygne de la Dame ou Cerf blanc, tombe fouillée au cimetière (à la
//  pelle), vol au temple, pierre dressée brisée (à la pioche), livre gardé,
//  boisson interdite (fiel noir), réponse à la voix d'une nuit noire…
//  Remèdes : l'eau lustrale (les petites), le curé (confession et offrande), la
//  guérisseuse (contre ce qu'elle veut), réparer la faute, l'un des Trois.
//  On en voit les signes dans le carnet. État sauvegardé : farm.s.malus.
// ============================================================================
const MALEDICTIONS = {
  malchance: { nom: 'La malchance', petite: true, signes: 'Les pièges restent vides, les poissons se décrochent, ce qu’on fouille ne donne presque rien. La chance vous a tourné le dos.' },
  faim: { nom: 'La faim qui ne passe pas', petite: true, signes: 'Vous mangez, et la faim revient aussitôt. Un creux que rien ne remplit, comme si quelqu’un mangeait avec vous.' },
  betes: { nom: 'Les bêtes qui fuient', petite: true, signes: 'Les bêtes vous fuient, même les vôtres. Le chien gronde quand vous approchez ; les chevaux se cabrent.' },
  sommeil: { nom: 'Le sommeil sans repos', petite: true, signes: 'Vous dormez, et vous vous réveillez plus las qu’avant. Il y a des mains, dans vos rêves.' },
  pourriture: { nom: 'Les récoltes qui pourrissent', petite: false, signes: 'Ce qui pousse noircit sur pied. Ce que vous cueillez pourrit entre vos doigts.' },
  poids: { nom: 'Le poids', petite: false, signes: 'Vous marchez comme dans l’eau. Chaque pas pèse le double, sauter est une peine.' },
  ombre: { nom: 'L’ombre qui suit', petite: false, grave: true, signes: 'Quelque chose vous suit, la nuit. Il s’arrête quand vous vous retournez. Chaque jour, il est un peu plus près.' },
};
// les fautes : la malédiction qu'elles attirent, et comment on les répare
const MAL_CAUSES = {
  cygne: { mal: 'malchance', faute: 'Vous avez tué un cygne de la Dame.', reparer: 'Une offrande à la pierre de la Dame, une nuit.' },
  cerf: { mal: 'betes', faute: 'Vous avez levé la main sur le Cerf blanc.', reparer: 'Une offrande à la pierre du Cerf.' },
  tombe: { mal: 'sommeil', faute: 'Vous avez fouillé une tombe.', reparer: 'Faire dire une messe pour le mort : le curé s’en chargera.' },
  temple: { mal: 'poids', faute: 'Vous avez pris ce qui avait été donné aux Trois.', reparer: 'Rendre au temple ce qui a été pris.' },
  tombeau: { mal: 'ombre', faute: 'Vous avez ouvert le tombeau sous la montagne.', reparer: 'Rendre au tombeau le diadème des Aëlim.' },
  pierre: { mal: 'pourriture', faute: 'Vous avez brisé une pierre dressée.', reparer: 'Une offrande à la pierre aux offrandes.' },
  livre: { mal: 'malchance', faute: 'Vous gardez un livre qui ne vous appartient pas.', reparer: 'Rendre le livre.' },
  boisson: { mal: 'faim', faute: 'Vous avez bu ce qu’il ne fallait pas boire.', reparer: '' },
  voix: { mal: 'ombre', faute: 'Vous avez dit son nom, une nuit noire.', reparer: '' },
  vesh: { mal: 'sommeil', faute: 'Le prix d’un pacte.', reparer: '' },
  durn: { mal: 'poids', faute: 'Vous avez réveillé le Dormeur.', reparer: '' },
};
// ce que la guérisseuse demande en échange (le premier qui existe dans la liste tirée)
const MAL_PRIX_GUERISSEUSE = ['fleur_lune', 'larme_dame', 'champi_lumineux', 'mandragore', 'plume_noire', 'lys_cimes', 'edelweiss', 'graisse_ours', 'miel', 'perle'];
const MAL_OMBRE_LOOK = { skin: '#040405', hair: '#040405', hairStyle: 'court', top: '#040405', bottom: '#040405', shoe: '#040405', coat: true, face: TL.blankF, height: 1.04, build: 'mince' };

const malediction = {
  // ------------------------------------------------------------ état (farm.s.malus)
  S() {
    const s = farm.s;
    const S = s.malus || (s.malus = {});
    if (!S.liste || typeof S.liste !== 'object') S.liste = {};
    return S;
  },
  a(id) { if (!farm.s) return false; const L = this.S().liste; return id ? !!L[id] : Object.keys(L).length > 0; },
  liste() { return farm.s ? Object.keys(this.S().liste) : []; },
  cause(id) { const M = farm.s && this.S().liste[id]; return M ? M.cause : null; },
  // ------------------------------------------------------------ frapper
  frapper(id, cause) {
    if (!farm.s || farm.s.over) return false;
    if (!MALEDICTIONS[id]) {
      const C = MAL_CAUSES[id] || MAL_CAUSES[cause];
      if (C) { if (!cause || !MAL_CAUSES[cause]) cause = id; id = C.mal; }
      else id = 'malchance';
    }
    const S = this.S(), L = S.liste;
    if (BUFF.on('aube')) { ui.subtitle('', '(Un froid passe sur vous, puis glisse.)', 3); return false; }
    if (L[id]) { L[id].n = (L[id].n || 1) + 1; if (id === 'ombre' && S.ombre) S.ombre.d = Math.max(20, S.ombre.d - 15); return false; }
    L[id] = { cause: cause || 'inconnue', jour: farm.s.day, h: farm.s.hours, n: 1 };
    if (id === 'ombre') S.ombre = { d: 90 };
    // un signe, discret
    const SIGNES = {
      malchance: '(Une pièce vous glisse des doigts. Vous ne la retrouvez pas.)',
      faim: '(Votre ventre se creuse d’un coup.)',
      betes: '(Au loin, tous les chiens aboient ensemble. Vers vous.)',
      sommeil: '(Une fatigue lourde tombe sur vos épaules.)',
      pourriture: '(Vos mains sentent le fruit gâté.)',
      poids: '(Vos jambes s’alourdissent.)',
      ombre: '(Derrière vous, votre ombre a bougé. En retard.)',
    };
    setTimeout(() => { if (!game.dying) { sound.voice && sound.ok && sound.voice(sound.at(), 'sine', 70, 52, 2.2, 0.06, sound.lp(300, sound.amb)); } }, 400);
    setTimeout(() => { if (!game.dying) ui.subtitle('', SIGNES[id], 3.5); }, 2600);
    strange.glitchT = Math.max(strange.glitchT || 0, 0.35);
    return true;
  },
  // ------------------------------------------------------------ lever : une malédiction, celles d'une cause, ou toutes
  lever(id, silent) {
    if (!farm.s) return false;
    const S = this.S(), L = S.liste;
    let ids;
    if (!id || id === 'toutes') ids = Object.keys(L);
    else if (MALEDICTIONS[id]) ids = L[id] ? [id] : [];
    else ids = Object.keys(L).filter((k) => L[k].cause === id);
    if (!ids.length) return false;
    for (const k of ids) { delete L[k]; if (k === 'ombre') S.ombre = null; }
    if (!silent) {
      ui.subtitle('', ids.includes('ombre') ? '(Derrière vous, quelque chose se défait. Vous êtes seul.)' : '(Quelque chose se détache de vous.)', 3.5);
      sound.ok && sound.tone(sound.at(), 'sine', 520, 780, 0.9, 0.03);
    }
    return true;
  },
  leverPetites(silent) {
    const ids = this.liste().filter((k) => MALEDICTIONS[k].petite);
    let n = 0;
    for (const k of ids) if (this.lever(k, true)) n++;
    if (n && !silent) ui.subtitle('', '(Quelque chose se lave, loin dedans.)', 3.5);
    return n;
  },

  // ------------------------------------------------------------ chaque image : les effets
  update(dt, eye, basis, sky, playing) {
    const s = farm.s;
    if (!s || game.mode === 'menu' || game.dying) return;
    const L = this.S().liste, p = game.player, w = game.world;
    if (!Object.keys(L).length) return;
    if (L.poids) { p.mods.speed *= 0.62; p.mods.jump = (p.mods.jump || 1) * 0.8; }
    if (L.faim && playing && !game.sleeping) p.food = Math.max(0, p.food - dt / w.dayLength * 75);
    if (L.betes) {
      this.betesT = (this.betesT || 0) - dt;
      if (this.betesT <= 0) {
        this.betesT = 1.2;
        entities.scare(p.pos[0], p.pos[2], 26);
        for (const e of entities.list) if (e.kind === 'dog' && e.owner && Math.hypot(e.x - p.pos[0], e.z - p.pos[2]) < 8 && Math.random() < 0.15) sound.growl && sound.growl(0.6);
      }
    }
    if (L.ombre) malOmbre.update(dt, eye, basis, sky);
  },
  // chaque matin : ce qui pourrit, les pièges vides, un rappel
  jourNouveau() {
    const s = farm.s, L = this.S().liste, w = game.world;
    if (L.pourriture) {
      let n = 0;
      for (const k in s.crops) { const c = s.crops[k]; if (c.c && !c.dead && !c.tree && Math.random() < 0.15) { c.dead = true; n++; } }
      if (n) { farm.dirtyProps = true; setTimeout(() => ui.subtitle('', '(Au champ, des plants ont noirci cette nuit.)', 4), 9000); }
    }
    if (L.malchance) for (const q of w.props) if ((q.id === 'piege' || q.id === 'piege_loup') && q.data && q.data.prise && Math.random() < 0.8) farm.setPropData(q, { prise: 0 });
    if (L.ombre && this.S().ombre) { const d = this.S().ombre.d; setTimeout(() => ui.subtitle('', d < 30 ? '(Cette nuit, il était tout près.)' : '(Cette nuit, il était plus près.)', 4.5), 11000); }
  },

  // ------------------------------------------------------------ le carnet : ce qui pèse sur vous
  carnetHTML() {
    const ids = this.liste();
    if (!ids.length) return '';
    const L = this.S().liste;
    const sait = savoir.lu('maledictions') || savoir.lu('livre_maledictions') || !!farm.s.flags.traiteMalus;
    let h = '<h4>Ce qui pèse sur vous</h4>';
    for (const k of ids) {
      const M = MALEDICTIONS[k], C = MAL_CAUSES[L[k].cause];
      h += `<div class="q actif"><b>${esc(sait ? M.nom : 'Quelque chose ne va pas')}</b><div>${esc(M.signes)}</div>${C ? `<div><i>${esc(C.faute)}${sait && C.reparer ? ' ' + C.reparer : ''}</i></div>` : ''}</div>`;
    }
    h += `<p class="hint">${sait ? 'Le traité le dit : l’eau lustrale lave les petites ; le curé en ôte certaines ; la guérisseuse d’autres, contre ce qu’elle voudra ; les plus lourdes ne partent qu’en réparant, ou par l’un des Trois.' : 'On dit que la guérisseuse sait ces choses. Et le curé, à sa façon.'}</p>`;
    return h;
  },
};

// ---------------------------------------------------------------- L'OMBRE QUI SUIT
const malOmbre = {
  rig: null, x: 0, z: 0, y: 0, vis: false, placeT: 0, peurT: 0, dit: 0,
  update(dt, eye, basis, sky) {
    const S = malediction.S(), O = S.ombre, s = farm.s, p = game.player, w = game.world;
    if (!O || this.cine) return;
    // elle avance : vite la nuit, dans le noir ; à peine le jour ; pas du tout près d'un feu, ou quand un cierge brûle
    const dH = dt * (game.fastTime ? 60 : 1) * game.timeScale * 24 / w.dayLength;
    const night = sky ? sky.night : 0;
    let k = 0.35 + night * 1.1;
    if (game.nearFire(p.pos)) k = 0;
    if (BUFF.on('grace') || BUFF.on('cierge')) k *= 0.3;
    if (game.sleeping) k *= 1.3;
    O.d = Math.max(0, O.d - dH * 0.92 * k);
    if (O.d <= 0.5 && !cine.on && !game.dying && !game.sleeping) { this.rattrape(); return; }
    // on la voit : la nuit, ou quand elle est tout près ; elle ne bouge que quand on ne la regarde pas
    const show = (night > 0.35 || O.d < 24 || p.underground) && !strange.inEnvers();
    this.placeT -= dt;
    const seen = show && this.rig && this.seen(eye, basis);
    if (!seen && this.placeT <= 0) {
      this.placeT = 0.6;
      const f = basis.f, fl = Math.hypot(f[0], f[2]) || 1, bx = -f[0] / fl, bz = -f[2] / fl;
      const a = Math.atan2(bx, bz) + (Math.random() - 0.5) * 0.9, d = Math.max(2.5, O.d);
      const x = p.pos[0] + Math.sin(a) * d, z = p.pos[2] + Math.cos(a) * d;
      this.x = x; this.z = z; this.y = p.underground ? p.pos[1] : w.groundAt(x, z, Math.max(p.pos[1], w.heightAt(x, z)) + 1, 1);
      this.heading = Math.atan2(p.pos[0] - x, p.pos[2] - z);
    }
    this.vis = show;
    if (!this.rig) this.rig = humanRig(MAL_OMBRE_LOOK);
    if (show && O.d < 45) {
      strange.fear = Math.max(strange.fear || 0, clamp(1 - O.d / 45, 0, 1) * 0.8);
      this.peurT -= dt;
      if (this.peurT <= 0 && O.d < 30) { this.peurT = 25 + Math.random() * 20; ui.subtitle('', '(Des pas derrière vous. Ils s’arrêtent quand vous vous arrêtez.)', 3.5); }
    }
    if (seen && !this.vuFois) { this.vuFois = true; sound.heartbeat && sound.heartbeat(1); }
  },
  seen(eye, basis) {
    const dx = this.x - eye[0], dz = this.z - eye[2], dy = this.y + 1 - eye[1], d = Math.hypot(dx, dy, dz) || 1;
    return (dx * basis.f[0] + dy * basis.f[1] + dz * basis.f[2]) / d > 0.55;
  },
  draw(buf, sbuf, cam, t) {
    const S = malediction.S();
    if (!S.ombre || !this.vis || !this.rig || cine.on && !this.cine) return;
    poseHuman(this.rig, { move: 0, t, pale: true, lookY: 0, tilt: Math.sin(t * 0.6) * 0.08 });
    drawRig(buf, this.rig, this.x, this.y, this.z, this.heading || 0, 1, 0);
  },
  // elle vous rattrape : c'est la fin
  rattrape() {
    const p = game.player;
    const fin = () => { malediction.S().ombre = null; delete malediction.S().liste.ombre; game.die('Rattrapé par son ombre'); };
    if (typeof cinematiques !== 'undefined') cinematiques.ombre(fin); else fin();
    void p;
  },
};

// ---------------------------------------------------------------- les effets branchés sur le jeu
// la malchance : fouilles maigres, poissons qui décrochent
{
  const _rl = rollLoot;
  rollLoot = function (key, rnd) {
    const a = _rl(key, rnd);
    if (!malediction.a('malchance') || Math.random() < 0.25) return a;
    return a.filter(() => Math.random() < 0.45).map(([k, n]) => [k, Math.max(1, Math.floor(n / 2))]);
  };
  const _cf = play.catchFish.bind(play);
  play.catchFish = function (F) {
    if (malediction.a('malchance') && Math.random() < 0.6) { sound.reel && sound.reel(0.3); ui.subtitle('', '(Il s’est décroché. Encore.)', 2.5); return; }
    return _cf(F);
  };
  // la faim : on mange, et ça ne tient pas
  const _eat = play.eat.bind(play);
  play.eat = function (id) {
    const p = game.player, f0 = p.food;
    const r = _eat(id);
    if (malediction.a('faim') && p.food > f0) p.food -= (p.food - f0) * 0.6;
    return r;
  };
  // la pourriture : ce qu'on cueille noircit entre les doigts
  const _hc = play.harvestCrop.bind(play);
  play.harvestCrop = function (x, z, c, silent) {
    const C = malediction.a('pourriture') && c && c.c && CROPS[c.c], item = C ? (C.fruit || c.c) : null, n0 = item ? farm.count(item) : 0;
    const r = _hc(x, z, c, silent);
    if (C && Math.random() < 0.35) {
      const got = farm.count(item) - n0;
      if (got > 0) { farm.take(item, got); puffAt(x, game.world.heightAt(x, z) + 0.4, z, [50, 40, 30], 8, 1, false); ui.subtitle('', '(Ça pourrit entre vos doigts.)', 3); }
    }
    return r;
  };
  // les cygnes de la Dame (quand ils meurent de notre main : jamais du coup de fusil d'un habitant, même tout près de nous)
  const _dmg = entities.damage.bind(entities);
  entities.damage = function (e, dmg, fx, fz) {
    const parUnHabitant = typeof chasse !== 'undefined' && !!chasse._src; // (lu avant : la chasse l'efface au passage)
    const died = _dmg(e, dmg, fx, fz);
    if (died && !parUnHabitant && e.cfg && e.cfg.sacre === 'dame' && !e.owner && farm.s && game.player && Math.hypot((fx ?? e.x) - game.player.pos[0], (fz ?? e.z) - game.player.pos[2]) < 250) malediction.frapper('malchance', 'cygne');
    return died;
  };
  // le Cerf blanc (on ne frappe pas le Cerf blanc)
  const _hit = strange.hit.bind(strange);
  strange.hit = function (e, dmg, from) { if (e && e.kind === 'stag') malediction.frapper('betes', 'cerf'); return _hit(e, dmg, from); };
  // boire : l'eau lustrale lave les petites malédictions ; le fiel noir en attire une ; la potion de soleil efface la tache
  const _drink = alchemy.drink.bind(alchemy);
  alchemy.drink = function (id) {
    const mien = id === 'eau_lustrale' || id === 'potion_soleil' || id === 'fiel_noir';
    if (mien && typeof alchimie === 'undefined') { // sans le module d'alchimie, on boit nous-mêmes
      if (!farm.take(id, 1)) return;
      farm.give('fiole', 1); play.eatT = 0.8; sound.eat && sound.eat();
      malBoire(id);
      return;
    }
    const n0 = farm.count(id);
    const r = _drink(id);
    if (mien && farm.count(id) < n0) malBoire(id);
    return r;
  };
}
function malBoire(id) {
  if (id === 'eau_lustrale') { if (!malediction.leverPetites()) ui.subtitle('', '(L’eau n’a rien trouvé à laver.)', 3); }
  else if (id === 'fiel_noir') { setTimeout(() => malediction.frapper('faim', 'boisson'), 800); }
  else if (id === 'potion_soleil') {
    const T = evenements.S().tache;
    if (!BUFF.on('soleil')) BUFF.add('soleil', 12);
    if (T.a > 0.01) evSoleil.effacer();
  }
}
BUFF_NAMES.soleil = 'Les yeux protégés du soleil';
// la pierre dressée : à la pioche, on peut la briser (on ne devrait pas)
PROP_COLL.pierre_dressee = PROP_COLL.pierre_dressee || [0.4, 0.25, 3];
{
  const _pd = PROP_MODELS.pierre_dressee;
  PROP_MODELS.pierre_dressee = function (E, o, t) {
    if (!(o.data && o.data.brisee)) return _pd(E, o, t);
    E.bx(0, -0.3, 0, 0.8, 1.2, 0.5, WHITE, mt(M_MOSSY));
    E.box(0.9, 0.18, 0.2, 0.7, 0.45, 1.9, WHITE, mt(M_MOSSY), 0.6, 0.1, 0.2);
    E.box(-0.6, 0.12, -0.5, 0.5, 0.3, 0.6, WHITE, mt(M_MOSSY), 1.2);
  };
}
const malPierres = {};
HOOKS.primary.push((eye, basis, held, it, id) => {
  if (held || !it || it.tool !== 'pioche') return false;
  const w = game.world, f = basis.f;
  let best = null, bt = 3;
  for (const q of w.props) {
    if (q.id !== 'pierre_dressee' || !w.live(q) || (q.data && q.data.brisee)) continue;
    const dx = q.x - eye[0], dz = q.z - eye[2];
    if (dx * dx + dz * dz > 16) continue;
    const fl = Math.hypot(f[0], f[2]) || 1e-6, tc = (dx * f[0] + dz * f[2]) / (fl * fl);
    if (tc < 0 || tc > bt) continue;
    const px = f[0] * tc - dx, pz = f[2] * tc - dz, r = 0.45 * (q.s || 1);
    if (px * px + pz * pz > r * r) continue;
    const y = eye[1] + f[1] * tc;
    if (y < q.y - 0.3 || y > q.y + 3.2 * (q.s || 1)) continue;
    best = q; bt = tc;
  }
  if (!best) return false;
  const i = w.props.indexOf(best);
  play.swingT = 0.42; play.pendingHit = null; play.cool = 0.55;
  sound.impact && sound.impact('hard');
  puffAt(eye[0] + f[0] * bt, eye[1] + f[1] * bt, eye[2] + f[2] * bt, [120, 125, 110], 8, 1.8, true);
  malPierres[i] = (malPierres[i] || 0) + 1;
  if (malPierres[i] === 1) ui.subtitle('', '(Elle est là depuis bien avant la ferme.)', 3);
  if (malPierres[i] < 5) return true;
  // elle se brise
  farm.setPropData(best, { brisee: 1 });
  if (best.blk) { best.blk.sy = 1.0 * (best.s || 1); w.grid = null; }
  sound.treeFall && sound.treeFall(); game.shakeT = Math.max(game.shakeT || 0, 0.4);
  farm.give('pierre', 3); play.flyer('pierre', [best.x, best.y + 1, best.z], 3);
  if (typeof faith !== 'undefined') faith.add('anciens', -10);
  const wit = npcs.witnesses(best.x, best.z);
  if (wit.length) { npcs.say(wit[0], 'Qu’est-ce que vous avez fait ?! On ne touche pas aux pierres !', 3.5); for (const m of wit) npcs.addAmitie(m, -60); if (typeof societe !== 'undefined' && societe.crime) try { societe.crime({ type: 'profanation', victime: null, x: best.x, z: best.z }); } catch (e) { console.error(e); } }
  malediction.frapper('pourriture', 'pierre');
  return true;
});
// la tombe fouillée : au cimetière, la pelle déterre quelqu'un
{
  const _at = dig.at.bind(dig);
  dig.at = function (eye, f, held) {
    const w = game.world, c = play.cellAt(eye, f);
    const g = c && (w.graves || []).find((q) => Math.hypot(q.x - c.x, q.z - c.z) < 1.8);
    if (!g) return _at(eye, f, held);
    const k = 'tombe_fouillee_' + g.i, s = farm.s;
    s.flags[k] = (s.flags[k] || 0) + 1;
    play.swingT = 0.32; play.cool = 0.6;
    sound.shovel && sound.shovel(1); puffAt(c.x, c.y + 0.1, c.z, [96, 68, 44], 12, 2, false);
    if (s.flags[k] === 1) ui.subtitle('', '(Vous creusez sur une tombe.)', 3);
    if (s.flags[k] < 3) return;
    if (s.flags[k] === 3) {
      if (Math.random() < 0.5) { farm.give('bijou', 1); play.flyer('bijou', [c.x, c.y + 0.4, c.z], 1); }
      farm.give('os', 1); play.flyer('os', [c.x, c.y + 0.4, c.z], 1);
      const wit = npcs.witnesses(c.x, c.z);
      if (wit.length) { npcs.say(wit[0], 'Profanateur ! Vous déterrez nos morts !', 3.5); for (const m of wit) npcs.addAmitie(m, -80); }
      if (typeof societe !== 'undefined' && societe.crime && wit.length) try { societe.crime({ type: 'profanation', victime: null, x: c.x, z: c.z }); } catch (e) { console.error(e); }
      malediction.frapper('sommeil', 'tombe');
    }
  };
}
// réparer : les offrandes aux pierres des Anciens
{
  const _off = faith.offer.bind(faith);
  faith.offer = function (it, item, val) {
    const kind = this.shrineKind(it), h = npcs.hour(), night = h >= 20.5 || h < 5;
    const r = _off(it, item, val);
    if (kind === 'dame' && night && malediction.cause('malchance') === 'cygne') setTimeout(() => malediction.lever('cygne'), 1800);
    if (kind === 'cerf') setTimeout(() => malediction.lever('cerf'), 1800);
    if (kind === 'mere') setTimeout(() => malediction.lever('pierre'), 1800);
    return r;
  };
}

// ---------------------------------------------------------------- le curé, la guérisseuse
function malPrixGuerisseuse(id) {
  const M = malediction.S().liste[id];
  const L = MAL_PRIX_GUERISSEUSE.filter((k) => ITEMS[k]);
  if (!L.length) return null;
  return L[hashString(id + ':' + (M ? M.jour : 0) + ':' + (farm.s.seed | 0)) % L.length];
}
HOOKS.load.push(() => {
  if (game._malHooks) return;
  game._malHooks = true;
  // les chevaux refusent de porter qui est maudit
  const _mount = game.mount.bind(game);
  game.mount = function (e) {
    if (malediction.a('betes') && e && e.owner && Math.random() < 0.7) { sound.animal && sound.animal('horse', 0, 0.8); ui.subtitle('', '(Le cheval refuse de vous porter.)', 3); return; }
    return _mount(e);
  };
  // le sommeil sans repos
  const _sleep = game.sleep.bind(game);
  game.sleep = async function (where) {
    const maudit = malediction.a('sommeil');
    await _sleep(where);
    if (maudit && !game.dying && farm.s && !farm.s.over) {
      const p = game.player;
      p.hp = Math.max(5, p.hp - 32); p.stamina = 0.3; p.food = Math.max(0, p.food - 8);
      setTimeout(() => ui.subtitle('', pick(['(Vous vous réveillez plus las qu’avant.)', '(Une nuit sans repos. Quelqu’un vous a regardé dormir.)']), 4), 1500);
    }
  };
  // le carnet : ce qui pèse sur vous
  const _rs = ui.renderSatchel.bind(ui);
  ui.renderSatchel = function () {
    _rs();
    if (this.satTab !== 'carnet' || !farm.s) return;
    const html = malediction.carnetHTML(), body = $('#satchel .body');
    if (html && body) body.insertAdjacentHTML('afterbegin', html);
  };
  // les habitants : le curé et la guérisseuse savent y faire
  const _opts = talk.options.bind(talk);
  talk.options = function () {
    const opts = _opts(), n = this.n;
    if (!n || !farm.s || !malediction.a()) return opts;
    const i = Math.max(0, opts.findIndex((o) => o.act === 'bye'));
    if (n.d.id === 'cure') opts.splice(i, 0, { label: 'Mon père, je crois qu’on m’a jeté un sort', act: 'mal_cure' });
    if (n.d.id === 'guerisseuse') opts.splice(i, 0, { label: 'Il y a quelque chose sur moi. Vous pouvez l’ôter ?', act: 'mal_gue' });
    return opts;
  };
  const _choose = talk.choose.bind(talk);
  talk.choose = function (act) {
    if (!act || !act.startsWith('mal_')) return _choose(act);
    return malParler(this, act);
  };
});
function malParler(T, act) {
  const n = T.n, s = farm.s, S = malediction.S(), L = malediction.liste();
  const cure = (k) => k !== 'ombre';
  if (act === 'mal_cure') {
    if (S.cureJour === s.day) return T.view('Je vous ai déjà reçu aujourd’hui, mon enfant. Priez, et revenez demain.', T.options());
    const ok = L.filter(cure);
    if (!ok.length) return T.view('Ce qui vous suit… (Il se tait longtemps.) Ce n’est pas de mon ressort. Ni de ce monde-ci, ni de l’autre. On raconte qu’une lumière se lève avant le soleil, sous la montagne, là où naît la rivière. Je n’ai rien dit. Allez.', T.options());
    const opts = [{ label: 'Me confesser, et donner 50 pièces pour les pauvres', act: 'mal_cure_or' }];
    if (farm.count('bougie')) opts.push({ label: 'Me confesser, et offrir un cierge', act: 'mal_cure_cierge' });
    opts.push({ label: 'Plus tard', act: 'chat' });
    return T.view('Un sort ? Ici, on dit « un péché qui colle ». Confessez-vous d’abord : tout, même ce qui vous fait honte. Puis une offrande. Le reste, c’est l’affaire du bon Dieu.', opts);
  }
  if (act === 'mal_cure_or' || act === 'mal_cure_cierge') {
    if (act === 'mal_cure_or' ? !farm.pay(50) : !farm.take('bougie', 1)) return T.view('Il faut une offrande, mon enfant. Le bon Dieu est patient ; les pauvres, moins.', T.options());
    S.cureJour = s.day;
    const ordre = ['sommeil', 'faim', 'malchance', 'betes', 'poids', 'pourriture'], k = ordre.find((x) => malediction.a(x));
    if (typeof faith !== 'undefined') faith.add('eglise', 2);
    npcs.addAmitie(n, 8);
    if (k) setTimeout(() => malediction.lever(k), 1200);
    if (k === 'sommeil' && malediction.cause('sommeil') === 'tombe') s.flags.messeMort = s.day;
    const reste = malediction.liste().filter((x) => x !== k).length;
    return T.view('(Il vous écoute jusqu’au bout. Puis il pose deux doigts sur votre front, et murmure en latin.) Allez. C’est ôté.' + (reste ? ' Mais il y a autre chose sur vous, de plus lourd. Revenez demain.' : ' Et ne recommencez pas.'), T.options());
  }
  if (act === 'mal_gue') {
    const ok = L.filter(cure);
    if (!ok.length) return T.view('Celle-là… (Elle recule d’un pas.) Non. L’ombre, il n’y a que la lumière qui la chasse. Pas celle des lampes : celle d’avant le soleil. Sous la montagne, là où la rivière sort de la roche. Et vite.', T.options());
    const k = ok[0], it = malPrixGuerisseuse(k);
    if (!it) return T.view('Je ne peux rien pour vous aujourd’hui.', T.options());
    S.gueDemande = { id: k, it };
    const opts = farm.count(it) ? [{ label: 'Donner : ' + itemName(it), act: 'mal_gue_donner' }, { label: 'Plus tard', act: 'chat' }] : [{ label: 'Je reviendrai', act: 'chat' }];
    return T.view(`Oui, je la vois. ${MALEDICTIONS[k].nom}. (Elle renifle vos mains.) Je peux l’ôter. Pas d’argent : il me faut ${itemName(it).toLowerCase()}. Rapportez-le-moi.`, opts);
  }
  if (act === 'mal_gue_donner') {
    const D = S.gueDemande;
    if (!D || !farm.take(D.it, 1)) return T.view('Vous ne l’avez pas. Ne me faites pas perdre mon temps.', T.options());
    S.gueDemande = null;
    npcs.addAmitie(n, 15);
    setTimeout(() => malediction.lever(D.id), 1500);
    return T.view('(Elle brûle quelque chose dans une coupelle, vous souffle la fumée au visage, et crache par terre.) Voilà. C’est parti. Si ça revient, c’est que vous l’avez cherché.', T.options());
  }
  return T.view('…', T.options());
}

// ---------------------------------------------------------------- branchements
HOOKS.load.push((saved) => {
  malOmbre.rig = null; malOmbre.vuFois = false;
  if (!farm.s) return;
  if (!saved) farm.s.malus = null;
  malediction.S();
  // les pierres dressées brisées restent brisées
  const w = game.world;
  for (const q of w.props) if (q.id === 'pierre_dressee' && q.data && q.data.brisee && q.blk) { q.blk.sy = 1.0 * (q.s || 1); w.grid = null; }
});
HOOKS.update.push((dt, eye, basis, sky, playing) => malediction.update(dt, eye, basis, sky, playing));
HOOKS.draw.push((buf, sbuf, cam, t) => { if (farm.s && malediction.a('ombre')) malOmbre.draw(buf, sbuf, cam, t); });
HOOKS.day.push(() => malediction.jourNouveau());
