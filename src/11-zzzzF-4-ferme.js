// ============================================================================
//  LE HASARD DE LA VALLÉE (4) : LA FERME — dix événements.
//  - renard_poulailler : la nuit, le renard rôde autour des poules (on le
//    chasse ; sinon, au matin, des plumes) ;
//  - panier_porte : au matin, un panier sur le seuil — on vous remercie de
//    quelque chose (un enfant ramené, des draps, un incendie…) ;
//  - rats_grange : des rats dans la grange au crépuscule (sinon, la mangeoire vide) ;
//  - vagabond_grange : un vagabond a dormi dans la grange (du pain ? il dit
//    ce qu'il a vu en chemin) ;
//  - poussins : une poule a couvé en cachette ; on ramène la couvée ;
//  - sangliers_champ : la nuit, des sangliers retournent le champ ;
//  - corbeaux_semis : des corbeaux sur les semis (on les chasse) ;
//  - bete_echappee : une bête est sortie par le portillon ; on va la chercher ;
//  - naissance : une bête met bas, la nuit (il faut être là) ;
//  - comice : le jury du comice agricole passe juger la ferme.
// ============================================================================
defItem('medaille_comice', 'Médaille du comice', 'tresor', 30, ['medaillon', '#c8c8d2'], { desc: 'Une médaille d’argent, gravée « Comice agricole — encouragement », au bout d’un ruban tricolore un peu passé.' });

// des plumes, devant le poulailler, au matin (objet posé, retiré au bout de deux jours)
PROP_MODELS.hf_plumes = function (E) {
  for (let i = 0; i < 9; i++) { const a = i * 2.4, r = 0.2 + (i % 3) * 0.25; E.box(Math.cos(a) * r, 0.02, Math.sin(a) * r, 0.14, 0.015, 0.05, i % 3 ? [1.15, 1.1, 1.0] : [0.65, 0.4, 0.22], TL.fur, a); }
};
HOOKS.day.push(() => {
  if (!farm.s || !game.world) return;
  for (const q of game.world.props.slice()) if (q.id === 'hf_plumes' && (!q.data || q.data.d < farm.s.day - 1)) farm.removeProp(q);
});
// les poules du joueur (vivantes, présentes)
const hfPoules = () => (farm.s.animals || []).filter((a) => a.kind === 'hen' && !a.dead && !a.lost);
// le renard emporte une poule : on la perd ; des plumes au poulailler
function hfRenardPrend(x, z) {
  const L = hfPoules();
  if (!L.length) return null;
  const a = pick(L);
  a.dead = true;
  game.syncAnimals && game.syncAnimals();
  const w = game.world, C = w.farm.coop || w.farm.yard || w.farm.f;
  const px = x ?? C.x + 1.5, pz = z ?? C.z + 1.5;
  farm.addProp({ id: 'hf_plumes', x: px, y: w.heightAt(px, pz) + 0.01, z: pz, r: Math.random() * TAU, data: { d: farm.s.day } });
  return a;
}
// le panier est porté par… (le plus récent des bienfaits)
const HF_PANIERS = {
  enfant: { items: [['oeuf', 6], ['brioche', 1]], mot: 'Pour vous, de la part d’une mère qui dort de nouveau. Le petit a fait le dessin. C’est vous, avec un chapeau. Vous n’avez pas de chapeau, mais il y tenait.' },
  lavandiere: { items: [['savon', 2], ['pain', 2]], mot: 'Pour les draps. Ils sont redevenus blancs.' },
  cheval: { items: [['fromage', 1], ['lait', 1]], mot: 'Il n’a plus quitté l’écurie depuis. Je crois qu’il a eu peur de vous. Merci quand même. — L’éleveuse' },
  incendie: { items: [['pain', 3], ['confiture', 1]], mot: 'Du hameau, pour les seaux. On n’oublie pas ceux qui portent l’eau.' },
  rixe: { items: [['vin', 1]], mot: 'De la part de deux imbéciles réconciliés.' },
  vagabond: { items: [['champignon', 4], ['mure', 6]], mot: 'Pour le pain.' },
  colporteur: { items: [['tabac', 1], ['bougie', 2]], mot: 'Le pied va mieux. La route aussi. On se reverra. — J.' },
  pelerins: { items: [['pain', 2], ['bougie', 1]], mot: 'Nous avons prié pour vous à la chapelle. Que la route vous soit douce.' },
  diligence: { items: [['vin', 1], ['tabac', 1]], mot: 'Avec les compliments d’un voyageur qui a eu bien peur, et de son cocher, qui n’en dira rien.' },
  crapauds: { items: [['cresson', 5]], mot: null, bizarre: '(Pas de mot. Des traces de pattes palmées autour du panier, et le cresson est encore mouillé.)' },
  chevreuil: { items: [['girolle', 4], ['fraise_bois', 5]], mot: null, bizarre: '(Pas de mot. Le panier sent la mousse. Personne, dans la vallée, ne tresse l’osier de cette façon.)' },
  _: { items: [['oeuf', 4], ['pain', 1]], mot: 'Merci.' },
};

// ---------------------------------------------------------------- 1. le renard au poulailler
hfDef('renard_poulailler', {
  cat: 'ferme', poids: 1.6, ecart: 8, duree: 1.2, fenetre: 3,
  peut: (c) => c.joueur.poules > 0,
  heure: (c, r) => 22.3 + r * 4,
  pret: (X) => X.ferme && hfPoules().length > 0,
  // personne pour veiller : au matin, il manque une poule (moins souvent quand le chien veille)
  sansNous: () => {
    if (Math.random() > (farm.s.dog && farm.s.dog.alive ? 0.35 : 0.7)) return false;
    const a = hfRenardPrend();
    if (a) hasardF.noter('renard_poulailler', `Au matin, des plumes devant le poulailler. Le renard a emporté ${a.name}.`);
    return !!a;
  },
  lancer(E) {
    const w = game.world, C = w.farm.coop || w.farm.yard || { x: w.farm.f.x, z: w.farm.f.z };
    E.cx = C.x; E.cz = C.z;
    const P = hfPoint(C.x, C.z, 28, 38, { r: 0.5 }) || { x: C.x + 30, z: C.z };
    E.renard = hfBete('fox', P.x, P.z, { loin: 80, vit: 1.4, acc: hfYeux });
    hfAller(E.renard, [[C.x + 1.2, C.z + 1.2]], 1.4);
    E.etat = 'approche'; E.t1 = 0; E.caqT = 0; E.chienT = farm.s.dog && farm.s.dog.alive ? 9 : 1e9;
  },
  maj(E, dt) {
    const F = E.renard, d = hfDistJ(F.x, F.z);
    E.caqT -= dt;
    if (E.caqT <= 0 && E.etat !== 'fuite') { E.caqT = E.etat === 'poule' ? 0.7 : 1.6 + Math.random(); if (hfDistJ(E.cx, E.cz) < 70) hfSon([E.cx, hfSol(E.cx, E.cz) + 0.8, E.cz], () => sound.animal && sound.animal('hen', 0, E.etat === 'approche' ? 0.6 : 1)); }
    if (!E.note && hfDistJ(E.cx, E.cz) < 40) { hasardF.noter(E, 'Une nuit, les poules ont crié : le renard rôdait autour du poulailler.'); hfPense('(Quelque chose rôde.)', 2.5); }
    // le chien l'a senti
    E.chienT -= dt;
    if (E.chienT <= 0 && E.etat !== 'fuite') { E.chienT = 1e9; hfSon([F.x, F.y + 0.5, F.z], () => sound.bark && sound.bark(1)); E.etat = 'fuite'; E.par = 'chien'; }
    if (E.etat === 'approche') { if (hfMarche(F, dt)) { E.etat = 'poule'; E.t1 = 0; } }
    else if (E.etat === 'poule') { E.t1 += dt; F.pose = { lookP: 0.5 }; if (E.t1 > 22) { const a = hfRenardPrend(F.x, F.z); E.prise = a; E.etat = 'fuite'; E.par = 'poule'; if (a) hasardF.noter('renard_poulailler', `Le renard est venu au poulailler, cette nuit. Il est reparti avec ${a.name} dans la gueule.`); } }
    // on approche : il file
    if (E.etat !== 'fuite' && d < 9) { E.etat = 'fuite'; E.par = 'joueur'; hasardF.noter('renard_poulailler', 'Le renard est venu au poulailler, cette nuit. Je l’ai chassé avant qu’il ait pu prendre une poule.'); }
    if (E.etat === 'fuite') {
      if (!E.fuite) { E.fuite = true; const p = game.player.pos, a = Math.atan2(F.x - p[0], F.z - p[2]) + (Math.random() - 0.5) * 0.5; hfAller(F, [[F.x + Math.sin(a) * 60, F.z + Math.cos(a) * 60]], 7); F.pose = {}; }
      F.run = true;
      if (hfMarche(F, dt)) E.fini = 'fin';
    }
  },
  dessin(E, buf, sbuf, cam, t) {
    const F = E.renard;
    hfDessine(F, buf, sbuf, cam, t);
    if (E.prise) { PE.buf = buf; PE.fl = 0; PE.frame(F.x, F.y, F.z, F.h, 1); PE.box(0, 0.32, 0.55, 0.2, 0.18, 0.22, [1.1, 1.05, 0.95], TL.fur); }
  },
  txt: {
    journal: 'Le renard est venu au poulailler.',
    apres: ['Le renard rôde autour des poulaillers, ces temps-ci. Fermez bien, la nuit.', 'Un renard qui a goûté à la poule revient toujours. Comme le percepteur.'],
  },
});

// ---------------------------------------------------------------- 2. un panier sur le seuil
hfDef('panier_porte', {
  cat: 'ferme', poids: 3, premier: 3, ecart: 4, duree: 13, fenetre: 8,
  peut: (c) => c.joueur.bienfaits > 0,
  heure: (c, r) => 6.2 + r * 1.2,
  pret: () => true,
  lancer(E) {
    const w = game.world, B = w.bld.ferme, S = hasardF.S();
    const L = S.bienfaits.filter((b) => b.d >= farm.s.day - 6);
    if (!B || !L.length) return false;
    const b = L[L.length - 1];
    S.bienfaits = S.bienfaits.filter((x) => x !== b);
    E.qui = b.qui; E.P = HF_PANIERS[b.qui] || HF_PANIERS._;
    const o = B.out, a = Math.atan2(o[0] - B.x, o[1] - B.z);
    E.x = o[0] - Math.sin(a) * 0.6 + Math.cos(a) * 0.7; E.z = o[1] - Math.cos(a) * 0.6 - Math.sin(a) * 0.7; E.y = hfSol(E.x, E.z); E.r = a;
    E.pris = false;
    hasardF.cible(E, { pos: () => [E.x, E.y + 0.35, E.z], r: 2.4, cos: 0.5, lab: 'Prendre le panier', vis: () => !E.pris, use() {
      E.pris = true;
      for (const [id, n] of E.P.items) if (ITEMS[id]) { farm.give(id, n); play.flyer && play.flyer(id, [E.x, E.y + 0.4, E.z], n); }
      sound.pop && sound.pop();
      if (E.P.mot) ui.read('Un mot, sous le torchon', E.P.mot);
      else hfPense(E.P.bizarre, 4.5);
      hasardF.noter(E, E.P.mot ? 'Au matin, un panier sur le seuil, avec un mot : « ' + E.P.mot.split('. ')[0].replace(/\.$/, '') + '. »' : 'Au matin, un panier sur le seuil. Personne n’avait signé.');
      setTimeout(() => { if (hasardF.actifs.panier_porte === E) E.fini = 'fin'; }, 500);
    } });
  },
  dessin(E, buf) {
    if (E.pris) return;
    PE.buf = buf; PE.fl = 0; PE.frame(E.x, E.y, E.z, E.r, 1);
    PE.bx(0, 0, 0, 0.5, 0.26, 0.36, [0.78, 0.6, 0.36], TL.straw); PE.bx(0, 0.26, 0, 0.46, 0.04, 0.32, [1.05, 1.0, 0.95], TL.plaid);
    PE.box(-0.22, 0.42, 0, 0.04, 0.32, 0.04, [0.7, 0.54, 0.32], TL.straw, 0, 0, 0.5); PE.box(0.22, 0.42, 0, 0.04, 0.32, 0.04, [0.7, 0.54, 0.32], TL.straw, 0, 0, -0.5); PE.box(0, 0.56, 0, 0.3, 0.04, 0.04, [0.7, 0.54, 0.32], TL.straw);
  },
  txt: {
    journal: 'Au matin, un panier sur le seuil.',
    apres: ['On dit qu’on vous a laissé un panier, à la ferme. Ici, on ne dit pas merci : on donne des œufs.'],
  },
});

// ---------------------------------------------------------------- 3. des rats dans la grange
hfDef('rats_grange', {
  cat: 'ferme', poids: 1.1, premier: 6, ecart: 10, duree: 0.9, fenetre: 3,
  peut: () => true,
  heure: (c, r) => 19.5 + r * 3,
  pret: (X) => X.ferme && !!game.world.farm.barn && hfDistJ(game.world.farm.barn.x, game.world.farm.barn.z) < 25,
  lancer(E) {
    const G = game.world.farm.barn;
    if (!G) return false;
    E.gx = G.x; E.gz = G.z; E.tues = 0; E.sonT = 0.3;
    E.rats = [];
    for (let i = 0; i < 6 + ((Math.random() * 3) | 0); i++) { const F = hfBete('mulot', G.x + (Math.random() - 0.5) * 7, G.z + (Math.random() - 0.5) * 5, { s: 1.9, loin: 40, vit: 2.5 }); F.att = Math.random(); E.rats.push(F); }
    hasardF.cible(E, { pos: () => { const F = hfRatProche(E, 1.8); return F ? [F.x, F.y + 0.1, F.z] : null; }, r: 1.8, cos: 0.4, lab: 'Écraser le rat', use() {
      const F = hfRatProche(E, 1.8);
      if (!F) return;
      if (Math.random() < 0.35) { const a = Math.random() * TAU; hfAller(F, [[F.x + Math.sin(a) * 3, F.z + Math.cos(a) * 3]], 4); hfPense('(Raté.)', 1.5); return; }
      F.mort = true; E.tues++; sound.squeak && sound.squeak(); sound.shovelHit && sound.shovelHit();
    } });
  },
  maj(E, dt) {
    for (const F of E.rats) {
      if (F.mort) continue;
      F.att -= dt;
      if (F.att <= 0 || !F.chemin) { F.att = 0.6 + Math.random() * 1.8; hfAller(F, [[E.gx + (Math.random() - 0.5) * 8, E.gz + (Math.random() - 0.5) * 6]], 1.8 + Math.random() * 2.2); }
      hfMarche(F, dt); F.run = true;
    }
    E.sonT -= dt;
    if (E.sonT <= 0) { E.sonT = 0.8 + Math.random() * 1.5; if (hfDistJ(E.gx, E.gz) < 30) hfSon([E.gx + (Math.random() - 0.5) * 6, hfSol(E.gx, E.gz) + 0.3, E.gz + (Math.random() - 0.5) * 6], () => sound.squeak && sound.squeak(), HF_PETIT); }
    if (!E.note && hfDistJ(E.gx, E.gz) < 15) { hasardF.noter(E, 'Des rats dans la grange, au crépuscule : des couinements, des ombres qui filent le long des murs.'); }
    if (E.tues >= 4) E.fini = 'chasses';
  },
  dessin(E, buf, sbuf, cam, t) { for (const F of E.rats) if (!F.mort) hfDessine(F, buf, null, cam, t); else { PE.buf = buf; PE.fl = 0; PE.frame(F.x, F.y, F.z, F.h, 1); PE.box(0, 0.03, 0, 0.1, 0.05, 0.22, [0.3, 0.25, 0.22], TL.fur); } },
  fin(E, raison) {
    if (raison === 'chasses') { hasardF.noter('rats_grange', `Des rats dans la grange. J’en ai écrasé ${E.tues} ; les autres ont fui par les trous du mur.`); return; }
    if (raison === 'essai') return;
    // on les a laissés faire : la mangeoire est vide
    const q = hfProps(['mangeoire'], E.gx, E.gz, 12)[0];
    if (q) { farm.setPropData(q, { fill: 0 }); hasardF.noter('rats_grange', 'Des rats dans la grange. Au matin, la mangeoire était vide, et le foin plein de crottes.'); }
  },
  txt: {
    journal: 'Des rats dans la grange.',
    apres: ['Les rats sortent des greniers, cette année. C’est la faute des hivers doux. Ou du chat du meunier, qui est devenu paresseux.'],
  },
});
function hfRatProche(E, r) { const p = game.player.pos; let best = null, bd = r; for (const F of E.rats) { if (F.mort) continue; const d = Math.hypot(F.x - p[0], F.z - p[2]); if (d < bd) { bd = d; best = F; } } return best; }

// ---------------------------------------------------------------- 4. le vagabond endormi dans la grange
const HF_RUMEURS = [
  'Au-dessus du moulin, il y a une pierre qui sonne creux quand on tape dessus. Moi, je n’ai pas creusé. J’avais pas de pelle, et pas l’envie.',
  'J’ai dormi une nuit près de la Table des Géants. Le matin, mes bottes étaient tournées vers l’est. Je les avais mises vers l’ouest.',
  'Au bord du marais, quand il fait nuit, il y a quelqu’un qui fait la lessive. Ne lui demandez pas pour qui.',
  'Dans la Combe Perdue, il y a une cabane où personne n’habite, et le feu y est toujours chaud.',
  'Les nains, au fond, sous la montagne… vous croyez que c’est une histoire. Moi, j’ai acheté une pipe à l’un d’eux.',
  'Il ne faut pas dormir sous le grand chêne. Ce n’est pas dangereux. C’est qu’on rêve des choses qui ne sont pas à vous.',
  'Sur la route du col, il y a une borne où quelqu’un laisse du pain tous les matins. Je l’ai mangé une fois. Je ne recommencerai pas.',
  'Le libraire de la grande bibliothèque… il n’aime pas qu’on rende les livres en retard. Croyez-moi. Rendez-les.',
];
hfDef('vagabond_grange', {
  cat: 'ferme', poids: 1.2, premier: 4, ecart: 12, duree: 3, fenetre: 3,
  peut: (c) => !c.P.storm,
  heure: (c, r) => 6.3 + r * 1.5,
  pret: (X) => X.ferme,
  lancer(E) {
    const w = game.world, fm = w.farm, G = fm.barn;
    let P;
    if (G) P = { x: G.x + 3.5, z: G.z + 1 };
    else { const B = w.bld.ferme, o = B.out; P = { x: o[0] + 2.5, z: o[1] + 1.5 }; }
    E.v = hfPerso(hfLook('vieux', { top: '#4a4238', bottom: '#3a3530', hat: 'chapeau', hatCol: '#3a342c', beard: 'longue', held: 'baton' }), P.x, P.z, { nom: 'Le vagabond', voix: 0.8, loin: 70, vit: 1 });
    E.v.h = Math.random() * TAU; E.v.pose = { sit: 1, lean: -0.5, lookP: 0.5 };
    E.etat = 'dort'; E.ronfleT = 1;
    hasardF.cible(E, { pos: () => [E.v.x, E.v.y + 0.8, E.v.z], r: 2.6, lab: 'Lui donner à manger', vis: () => E.etat === 'eveille', use: () => hfVagabondNourrir(E) });
    hasardF.cible(E, { pos: () => [E.v.x, E.v.y + 1.3, E.v.z], r: 2.6, cos: 0.85, lab: 'Le chasser', vis: () => E.etat === 'eveille', use() { hfDit(E.v, 'Je m’en vais, je m’en vais. Que le bon Dieu vous garde quand même.', 3.5); hasardF.noter('vagabond_grange', 'Un vagabond avait dormi dans la grange. Je l’ai chassé.'); hfVagabondPart(E); } });
  },
  maj(E, dt) {
    const V = E.v, d = hfDistJ(V.x, V.z);
    if (E.etat === 'dort') {
      E.ronfleT -= dt;
      if (E.ronfleT <= 0) { E.ronfleT = 3 + Math.random(); if (d < 20) hfSon([V.x, V.y + 0.8, V.z], () => sound.noiseHit && sound.noiseHit(sound.at(), 1.1, 'bandpass', 220, 2, 0.02, sound.voix, 160, 0.4), HF_PETIT); }
      if (d < 3.2) { E.etat = 'eveille'; V.pose = { sit: 1, lookP: 0 }; hfFace(V, game.player.pos[0], game.player.pos[2], 1); hfDit(V, 'Pardon, pardon… J’ai juste dormi. Il pleuvait sur la route. Vous n’auriez pas un bout de pain ?', 5); if (!E.note) hasardF.noter(E, 'Au matin, un vagabond dormait dans la grange, sur le foin.'); }
      if (!E.note && d < 12 && hfRegarde(V.x, V.y + 0.6, V.z, 0.75)) { hasardF.noter(E, 'Au matin, un vagabond dormait dans la grange, sur le foin.'); }
      if (E.age > 2.5) hfVagabondPart(E);
    } else if (E.etat === 'part') { if (hfMarche(V, dt)) E.fini = 'fin'; }
    else if (E.etat === 'eveille') { hfFace(V, game.player.pos[0], game.player.pos[2], dt); if (E.age > 2.8) hfVagabondPart(E); }
  },
  dessin(E, buf, sbuf, cam, t) { hfDessine(E.v, buf, sbuf, cam, t); },
  txt: {
    journal: 'Un vagabond a dormi dans la grange.',
    apres: ['Un chemineau est passé par chez vous ? Il passe partout. Il sait tout. Il ne dit pas tout.', 'Les vagabonds, mon père leur donnait toujours du pain. Il disait : on ne sait jamais qui c’est.'],
  },
});
function hfVagabondNourrir(E) {
  const id = ['pain', 'brioche', 'galette', 'fromage', 'soupe', 'pomme'].find((k) => farm.count(k) > 0);
  if (!id) { hfPense('(Vous n’avez rien à manger sur vous.)', 2.5); return; }
  farm.take(id, 1);
  hfDit(E.v, pick(HF_RUMEURS), 7);
  setTimeout(() => {
    if (hasardF.actifs.vagabond_grange !== E) return;
    hfDit(E.v, 'Tenez. Je l’ai taillé en marchant. Ça porte chance, ou pas. Moi, ça m’a porté jusqu’ici.', 4);
    farm.give('figurine', 1); play.flyer && play.flyer('figurine', [E.v.x, E.v.y + 1, E.v.z], 1);
    hasardF.bienfait('vagabond');
    hasardF.noter('vagabond_grange', `Un vagabond avait dormi dans la grange. Je lui ai donné à manger ; il m’a laissé une figurine de bois, et une histoire.`);
    hfVagabondPart(E);
  }, 7500);
  E.etat = 'mange';
}
function hfVagabondPart(E) {
  if (E.etat === 'part') return;
  E.etat = 'part'; E.v.pose = {};
  const g = game.world.farm.gate || [E.v.x + 30, E.v.z];
  hfAller(E.v, hfTrajet(E.v.x, E.v.z, g[0], g[1]).concat([[g[0] + 25, g[1] + 25]]), 1);
}

// ---------------------------------------------------------------- 5. la couvée cachée
hfDef('poussins', {
  cat: 'ferme', poids: 1.2, premier: 4, ecart: 14, duree: 3, fenetre: 3,
  peut: (c) => c.joueur.poules > 0 && !c.pluieA(9, 15),
  heure: (c, r) => 9 + r * 5,
  pret: (X) => X.ferme && hfPoules().length > 0,
  lancer(E) {
    const w = game.world, F = w.farm.f;
    const P = hfPoint(F.x, F.z, 16, 32, { r: 0.6 });
    if (!P) return false;
    E.x = P.x; E.z = P.z;
    E.mere = hfBete('hen', P.x, P.z, { v: 1, loin: 60, vit: 0.8 });
    E.petits = [];
    for (let i = 0; i < 5; i++) {
      const F2 = hfBete('hen', P.x + (Math.random() - 0.5), P.z + (Math.random() - 0.5), { s: 0.38, loin: 40, vit: 0.9 });
      for (const q of F2.rig.parts) if (q.s) q.col = q.name === 'beak' ? [0.9, 0.55, 0.15] : [1.25, 1.05, 0.35];
      E.petits.push(F2);
    }
    E.suit = false; E.pioT = 1;
    hasardF.cible(E, { pos: () => [E.mere.x, E.mere.y + 0.3, E.mere.z], r: 2.2, cos: 0.5, lab: 'Ramener la poule et ses poussins', vis: () => !E.suit, use() { E.suit = true; } });
  },
  maj(E, dt) {
    const M = E.mere, w = game.world, C = w.farm.coop || w.farm.yard;
    if (E.suit) { hfSuit(M, dt, 1.8, 2.2); M.pose = {}; }
    else { M.pose = { peck: 1 }; if (!M.chemin || M.arrive) { const a = Math.random() * TAU; hfAller(M, [[E.x + Math.sin(a) * 1.5, E.z + Math.cos(a) * 1.5]], 0.5); } hfMarche(M, dt); }
    for (const [i, F] of E.petits.entries()) { const a = game.time * 0.7 + i * 1.3, tx = M.x + Math.sin(a) * 0.5, tz = M.z + Math.cos(a) * 0.5; F.x = lerp(F.x, tx, Math.min(1, dt * 2.5)); F.z = lerp(F.z, tz, Math.min(1, dt * 2.5)); F.y = hfY(F.x, F.z); F.h = Math.atan2(tx - F.x, tz - F.z); F.move = 0.6; F.phase += dt * 6; F.pose = { peck: (i + Math.floor(game.time)) % 3 === 0 ? 1 : 0 }; }
    E.pioT -= dt;
    if (E.pioT <= 0) { E.pioT = 1.8 + Math.random() * 2; if (hfDistJ(M.x, M.z) < 25) hfSon([M.x, M.y + 0.2, M.z], () => sound.hfPiou && sound.hfPiou(1), HF_PETIT); }
    if (!E.note && hfDistJ(M.x, M.z) < 14) { hasardF.noter(E, 'Une poule avait couvé en cachette dans les hautes herbes : cinq poussins jaunes la suivaient.'); }
    if (E.suit && C && Math.hypot(M.x - C.x, M.z - C.z) < 8) {
      const a = farm.newAnimal('hen'); a.name = pick(['Poulette', 'Biscotte', 'Pâquerette', 'Noisette', 'Brindille']); farm.s.animals.push(a); game.syncAnimals && game.syncAnimals();
      hasardF.noter('poussins', 'Une poule avait couvé en cachette. J’ai ramené la couvée au poulailler ; une des poulettes est restée.');
      hfPense('(Une des poulettes restera. Les autres… on verra bien.)', 3);
      E.fini = 'fin';
    }
  },
  dessin(E, buf, sbuf, cam, t) { hfDessine(E.mere, buf, sbuf, cam, t); for (const F of E.petits) hfDessine(F, buf, null, cam, t); },
  txt: {
    journal: 'Une poule avait couvé en cachette.',
    apres: ['Une poule qui couve en cachette, c’est une poule qui ne vous fait pas confiance. Elle a raison.'],
  },
});

// ---------------------------------------------------------------- 6. les sangliers dans le champ
hfDef('sangliers_champ', {
  cat: 'ferme', poids: 1.3, premier: 5, ecart: 9, duree: 1, fenetre: 3,
  peut: (c) => c.joueur.cultures >= 3,
  heure: (c, r) => 23 + r * 3.5,
  pret: (X) => X.ferme && !!game.world.farm.field,
  // personne pour veiller : au matin, le champ est retourné
  sansNous: () => { if (Math.random() > 0.6) return false; const n = hfAbimer(2 + ((Math.random() * 3) | 0)); if (n) hasardF.noter('sangliers_champ', `Au matin, le champ était retourné : des sangliers sont passés. ${n} rangs perdus.`); return n > 0; },
  lancer(E) {
    const fd = game.world.farm.field;
    if (!fd) return false;
    E.cx = (fd.x0 + fd.x1) / 2; E.cz = (fd.z0 + fd.z1) / 2;
    E.porcs = [];
    for (let i = 0; i < 2 + ((Math.random() * 2) | 0); i++) { const F = hfBete('boar', lerp(fd.x0, fd.x1, Math.random()), lerp(fd.z0, fd.z1, Math.random()), { loin: 80, vit: 0.6, acc: hfYeux }); F.att = Math.random() * 3; E.porcs.push(F); }
    E.grT = 0.5; E.etat = 'fouille'; E.charge = false;
  },
  maj(E, dt) {
    const p = game.player, fd = game.world.farm.field;
    let dmin = 1e9;
    for (const F of E.porcs) dmin = Math.min(dmin, Math.hypot(F.x - p.pos[0], F.z - p.pos[2]));
    if (E.etat === 'fouille') {
      for (const F of E.porcs) { F.att -= dt; if (F.att <= 0) { F.att = 2 + Math.random() * 3; hfAller(F, [[lerp(fd.x0, fd.x1, Math.random()), lerp(fd.z0, fd.z1, Math.random())]], 0.5); } hfMarche(F, dt); F.pose = { graze: 1 }; }
      E.grT -= dt;
      if (E.grT <= 0) { E.grT = 2 + Math.random() * 2; const F = pick(E.porcs); if (hfDistJ(F.x, F.z) < 60) hfSon([F.x, F.y + 0.5, F.z], () => sound.hfGrogne && sound.hfGrogne(1)); }
      if (!E.note && hfDistJ(E.cx, E.cz) < 40) { hasardF.noter(E, 'Une nuit, des sangliers sont venus fouiller le champ.'); hfPense('(Ça fouille la terre, dans le champ.)', 3); }
      // on arrive dessus : ils détalent ; de trop près, l'un d'eux charge
      if (dmin < 11 || (p.sprinting && dmin < 18)) {
        // on leur court dessus : l'un d'eux charge avant de détaler
        if (p.sprinting && !E.charge && Math.random() < 0.5) { E.charge = true; play.hurt(9, null, 'Chargé par un sanglier dans son propre champ'); sound.animal && sound.animal('pig', 0, 1); game.shakeT = Math.max(game.shakeT || 0, 0.4); }
        E.etat = 'fuite'; hasardF.noter('sangliers_champ', 'Une nuit, des sangliers fouillaient le champ. Je les ai chassés avant qu’ils aient tout retourné.'); for (const F of E.porcs) { const a = Math.atan2(F.x - p.pos[0], F.z - p.pos[2]) + (Math.random() - 0.5) * 0.6; hfAller(F, [[F.x + Math.sin(a) * 70, F.z + Math.cos(a) * 70]], 6.5); F.pose = {}; } }
      if (E.age > 0.8) { const n = hfAbimer(2 + ((Math.random() * 3) | 0), E.porcs); hasardF.noter('sangliers_champ', `Une nuit, des sangliers ont retourné le champ sous mes yeux. ${n} rangs perdus.`); E.etat = 'fuite'; for (const F of E.porcs) { hfAller(F, [[F.x + 60, F.z + 40]], 5); F.pose = {}; } }
    } else { let fin = true; for (const F of E.porcs) { F.run = true; if (!hfMarche(F, dt)) fin = false; } if (fin) E.fini = 'fin'; }
  },
  dessin(E, buf, sbuf, cam, t) { for (const F of E.porcs) hfDessine(F, buf, sbuf, cam, t); },
  txt: {
    journal: 'Des sangliers dans le champ, la nuit.',
    apres: ['Les sangliers descendent jusqu’aux champs, ces nuits-ci. Le chasseur dit qu’il faudrait une battue. Il dit ça en souriant.', 'Un sanglier, ça vous retourne un champ comme une charrue. Mais une charrue ne vous charge pas.'],
  },
});
// des cultures perdues (sous les bêtes, sinon au hasard) ; renvoie le nombre
function hfAbimer(n, betes) {
  const s = farm.s, L = [];
  for (const k in s.crops || {}) { const c = s.crops[k]; if (c && c.c && !c.dead && !c.tree) L.push([k, c]); }
  if (!L.length) return 0;
  if (betes && betes.length) L.sort((a, b) => { const pa = a[0].split(',').map(Number), pb = b[0].split(',').map(Number); const da = Math.min(...betes.map((F) => Math.hypot(F.x - pa[0], F.z - pa[1]))), db = Math.min(...betes.map((F) => Math.hypot(F.x - pb[0], F.z - pb[1]))); return da - db; });
  else L.sort(() => Math.random() - 0.5);
  let k = 0;
  for (const [, c] of L.slice(0, n)) { c.dead = true; k++; }
  if (k) farm.dirtyProps = true;
  return k;
}

// ---------------------------------------------------------------- 7. les corbeaux sur les semis
hfDef('corbeaux_semis', {
  cat: 'ferme', poids: 1.3, premier: 3, ecart: 7, duree: 1, fenetre: 2.5,
  peut: (c) => c.joueur.cultures >= 1 && !c.pluieA(7, 10),
  heure: (c, r) => 7.2 + r * 2.2,
  pret: (X) => X.ferme && !!game.world.farm.field,
  lancer(E) {
    const fd = game.world.farm.field;
    if (!fd) return false;
    E.fd = fd; E.chasse = 0; E.crT = 0.5; E.vol = 0;
    E.cx = (fd.x0 + fd.x1) / 2; E.cz = (fd.z0 + fd.z1) / 2;
    E.corbeaux = [];
    for (let i = 0; i < 11; i++) { const F = hfBete('crow', lerp(fd.x0, fd.x1, Math.random()), lerp(fd.z0, fd.z1, Math.random()), { loin: 90, vol: true, y: 0, ombre0: true }); F.y = hfSol(F.x, F.z); F.h = Math.random() * TAU; F.ang = Math.random() * TAU; E.corbeaux.push(F); }
    hasardF.cible(E, { pos: () => [E.cx, hfSol(E.cx, E.cz) + 1, E.cz], r: 14, cos: 0.3, lab: 'Chasser les corbeaux', vis: () => E.vol <= 0 && E.chasse < 3, use() { E.vol = 9 + Math.random() * 4; E.chasse++; sound.crow && sound.crow(1); sound.flutter && sound.flutter(1, 0); if (E.chasse === 3) { hasardF.noter('corbeaux_semis', 'Des corbeaux sur les semis. Je les ai chassés trois fois ; à la troisième, ils sont partis pour de bon.'); E.vol = 40; } } });
  },
  maj(E, dt) {
    E.vol -= dt;
    for (const F of E.corbeaux) {
      if (E.vol > 0) { F.pose = { fly: 1, seed: F.ang }; hfTourne(F, E.cx, hfSol(E.cx, E.cz) + 9 + (F.ang % 1) * 4, E.cz, 10 + (F.ang % 3) * 3, 0.9, dt); if (E.chasse >= 3) { F.x += (F.x - E.cx) * dt * 0.8; F.z += (F.z - E.cz) * dt * 0.8; F.y += dt * 2; } }
      else { F.pose = { peck: 1 }; F.y = lerp(F.y, hfSol(F.x, F.z), Math.min(1, dt * 3)); if (Math.random() < dt * 0.5) { F.x = clamp(F.x + (Math.random() - 0.5) * 0.6, E.fd.x0, E.fd.x1); F.z = clamp(F.z + (Math.random() - 0.5) * 0.6, E.fd.z0, E.fd.z1); F.h += (Math.random() - 0.5); } }
    }
    E.crT -= dt;
    if (E.crT <= 0) { E.crT = 2.5 + Math.random() * 3; if (hfDistJ(E.cx, E.cz) < 70) hfSon([E.cx, hfSol(E.cx, E.cz) + 1, E.cz], () => sound.crow && sound.crow(0.8)); }
    if (!E.note && hfDistJ(E.cx, E.cz) < 35) { hasardF.noter(E, 'Des corbeaux sur les semis. L’épouvantail ne leur faisait plus peur.'); hfPense('(L’épouvantail ne leur fait plus peur.)', 2.5); }
    if (E.chasse >= 3 && E.vol < 30) E.fini = 'fin';
    if (E.age > 0.85 && E.chasse < 3 && !E.mange) {
      E.mange = true;
      // ils ont picoré les jeunes pousses
      let n = 0;
      for (const k in farm.s.crops) { const c = farm.s.crops[k]; if (n < 3 && c.c && !c.dead && !c.tree && CROPS[c.c] && c.g < CROPS[c.c].h * 0.35 && Math.random() < 0.5) { c.dead = true; n++; } }
      if (n) { farm.dirtyProps = true; hasardF.noter('corbeaux_semis', `Des corbeaux sur les semis : ils ont picoré ${n} jeunes pousses.`); }
    }
  },
  dessin(E, buf, sbuf, cam, t) { for (const F of E.corbeaux) hfDessine(F, buf, null, cam, t); },
  txt: {
    journal: 'Des corbeaux sur les semis.',
    apres: ['Les corbeaux se moquent des épouvantails. Mon père disait qu’il faut en pendre un mort au milieu du champ. Je ne l’ai jamais fait. Je n’ai jamais eu de récolte, non plus.'],
  },
});

// ---------------------------------------------------------------- 8. une bête échappée
const HF_RIG_BETE = { cow: 'cow', sheep: 'sheep', pig: 'pig', goat: 'goat', horse: 'horse', donkey: 'donkey', goose: 'goose', farmduck: 'farmduck', farmrabbit: 'farmrabbit' };
hfDef('bete_echappee', {
  cat: 'ferme', poids: 1.2, premier: 4, ecart: 9, duree: 9, fenetre: 3,
  peut: (c) => c.joueur.especes.some((k) => HF_RIG_BETE[k] && k !== 'horse') && !c.P.storm,
  heure: (c, r) => 8 + r * 7,
  pret: (X) => X.ferme,
  lancer(E) {
    const s = farm.s, w = game.world, F0 = w.farm.f;
    const L = s.animals.filter((a) => !a.dead && !a.lost && HF_RIG_BETE[a.kind] && a.kind !== 'horse');
    if (!L.length) return false;
    const a = pick(L);
    const P = hfPoint(F0.x, F0.z, 90, 170, { r: 1 });
    if (!P) return false;
    a.lost = 1; game.syncAnimals && game.syncAnimals();
    E.aid = a.id; E.nom = a.name;
    E.b = hfBete(HF_RIG_BETE[a.kind], P.x, P.z, { v: a.v || 0, loin: 120, vit: 1.2 });
    E.b.h = Math.random() * TAU;
    E.suit = false; E.criT = 3;
    hfPense(`(Le portillon bat. ${a.name} n’est plus dans la cour.)`, 4);
    hasardF.noter(E, `${a.name} s’est échappée par le portillon.`);
    hasardF.cible(E, { pos: () => [E.b.x, E.b.y + 0.8, E.b.z], r: 2.6, lab: `Ramener ${a.name}`, vis: () => !E.suit, use() { E.suit = true; } });
  },
  maj(E, dt) {
    const F = E.b, w = game.world, Y = w.farm.yard || w.farm.f;
    if (E.suit) { hfSuit(F, dt, 2.4, 3.2); F.pose = {}; }
    else { F.pose = { graze: 1 }; if (!F.chemin || F.arrive) { if (Math.random() < dt * 0.1) { const a = Math.random() * TAU; hfAller(F, [[F.x + Math.sin(a) * 3, F.z + Math.cos(a) * 3]], 0.6); } } else hfMarche(F, dt); }
    E.criT -= dt;
    if (E.criT <= 0) { E.criT = 10 + Math.random() * 10; const A = farm.s.animals.find((a) => a.id === E.aid); if (A && hfDistJ(F.x, F.z) < 90) hfSon([F.x, F.y + 1, F.z], () => sound.animal && sound.animal(A.kind, 0, 0.8)); }
    if (E.suit && Math.hypot(F.x - Y.x, F.z - Y.z) < 16) {
      const A = farm.s.animals.find((a) => a.id === E.aid);
      if (A) { A.lost = 0; A.x = F.x; A.z = F.z; game.syncAnimals && game.syncAnimals(); }
      hasardF.noter('bete_echappee', `${E.nom} s’était échappée. Je l’ai retrouvée à travers champs et ramenée à la ferme.`);
      E.rendue = true; E.fini = 'fin';
    }
    if (npcs.hour() > 21) E.fini = 'nuit';
  },
  dessin(E, buf, sbuf, cam, t) { if (!E.rendue) hfDessine(E.b, buf, sbuf, cam, t); },
  fin(E, raison) {
    // pas ramenée : elle reste « perdue » (elle reviendra peut-être d'elle-même, un matin) ; un essai la rend aussitôt
    const A = farm.s.animals.find((a) => a.id === E.aid);
    if (A && raison === 'essai' && !E.rendue) { A.lost = 0; game.syncAnimals && game.syncAnimals(); }
    else if (A && !E.rendue) hasardF.noter('bete_echappee', `${E.nom} ne s’est pas laissé retrouver. Elle reviendra peut-être d’elle-même.`);
  },
  txt: {
    journal: 'Une bête s’est échappée de la ferme.',
    apres: ['Il paraît qu’une de vos bêtes courait les champs, hier. Les portillons, ça se ferme. Ça se ferme.'],
  },
});

// ---------------------------------------------------------------- 9. une bête met bas, la nuit
const HF_MISEBAS = { cow: 'un veau', sheep: 'un agneau', goat: 'un chevreau', pig: 'des porcelets' };
hfDef('naissance', {
  cat: 'ferme', poids: 0.9, premier: 6, ecart: 24, fois: 4, duree: 1.4, fenetre: 3,
  peut: (c) => c.joueur.especes.some((k) => HF_MISEBAS[k]),
  heure: (c, r) => 22 + r * 3,
  pret: (X) => X.ferme && farm.s.animals.some((a) => !a.dead && !a.lost && HF_MISEBAS[a.kind]),
  lancer(E) {
    const L = farm.s.animals.filter((a) => !a.dead && !a.lost && HF_MISEBAS[a.kind]);
    if (!L.length) return false;
    const a = pick(L);
    E.aid = a.id; E.nom = a.name; E.kind = a.kind;
    E.cri = 1; E.aide = 0; E.etat = 'travail';
    hfPense(`(Dans la nuit, ${a.name} gémit. Le petit arrive, et ça se passe mal.)`, 4);
    hasardF.noter(E, `Une nuit, ${a.name} a mis bas.`);
    hasardF.cible(E, { pos: () => { const e = hfEntite(E.aid); return e ? [e.x, e.y + 0.8, e.z] : null; }, r: 2.8, cos: 0.4, lab: 'Aider à la mise bas', vis: () => E.etat === 'travail', use() {
      E.aide++;
      sound.breath && sound.breath(0.6);
      if (E.aide === 1) hfPense('(Les mains dans la paille et le sang tiède. Tirer quand elle pousse.)', 3.5);
      if (E.aide >= 3) {
        E.etat = 'ne';
        const b = farm.newAnimal(E.kind); b.name = pick(['Petit', 'Mignon', 'Frisé', 'Noiraud', 'Tendron', 'Bijou']); b.age = 0;
        farm.s.animals.push(b); game.syncAnimals && game.syncAnimals();
        sound.animal && sound.animal(E.kind, 0, 0.6);
        hasardF.noter('naissance', `Une nuit, j’ai aidé ${E.nom} à mettre bas : ${HF_MISEBAS[E.kind]}, vivant, qui tétait avant l’aube.`);
        hfPense('(Il respire. Il cherche déjà la mamelle.)', 3.5);
        setTimeout(() => { if (hasardF.actifs.naissance === E) E.fini = 'fin'; }, 5000);
      }
    } });
  },
  maj(E, dt) {
    if (E.etat !== 'travail') return;
    E.cri -= dt;
    const e = hfEntite(E.aid);
    if (E.cri <= 0) { E.cri = 4 + Math.random() * 3; if (e && hfDistJ(e.x, e.z) < 60) hfSon([e.x, e.y + 1, e.z], () => sound.animal && sound.animal(E.kind, 0, 1)); }
    if (E.age > 1.2) { E.etat = 'perdu'; E.fini = 'seule'; }
  },
  fin(E, raison) { if (raison === 'seule') hasardF.noter('naissance', `Une nuit, ${E.nom} a mis bas, seule. Au matin, le petit était mort dans la paille. Il aurait fallu être là.`); },
  txt: {
    journal: 'Une bête a mis bas.',
    apres: ['Une naissance à la ferme, c’est toujours la nuit. Les bêtes ont leur pudeur.'],
  },
});
function hfEntite(aid) { return entities.list.find((e) => e.owner && e.aid === aid && !e.removed) || null; }

// ---------------------------------------------------------------- 10. le jury du comice agricole
hfDef('comice', {
  cat: 'ferme', poids: 1, premier: 8, ecart: 30, fois: 3, duree: 2.5, fenetre: 3,
  peut: (c) => ['foire', 'marche', 'fer'].includes(c.dow) && !c.pluieA(10, 15),
  heure: (c, r) => 10 + r * 4,
  pret: (X) => X.ferme,
  lancer(E) {
    const w = game.world, g = w.farm.gate || [w.farm.f.x, w.farm.f.z - 36], Y = w.farm.yard || w.farm.f;
    E.juge = hfPerso(hfLook('bourgeois', { hat: 'chapeau', beard: 'courte', hair: '#9a9288' }), g[0], g[1], { nom: 'Le président du comice', voix: 0.85, vit: 1.1, loin: 100 });
    E.clerc = hfPerso(hfLook('bourgeois', { beard: undefined, held: 'livre', hat: 'casquette', hatCol: '#2a2a30' }), g[0] + 1, g[1] + 1, { nom: 'Le greffier', voix: 1.1, vit: 1.1, loin: 100 });
    const pts = hfTrajet(g[0], g[1], Y.x + 2, Y.z + 2);
    hfAller(E.juge, pts, 1.1); hfAller(E.clerc, pts.map(([x, z]) => [x + 1.2, z + 0.8]), 1.1);
    E.etat = 'vient'; E.t1 = 0;
  },
  maj(E, dt) {
    const J = E.juge, C = E.clerc;
    if (E.etat === 'vient') {
      const a = hfMarche(J, dt), b = hfMarche(C, dt);
      if (!E.note && hfDistJ(J.x, J.z) < 30) hasardF.noter(E);
      if (a && b) { E.etat = 'juge'; E.t1 = 0; const fd = game.world.farm.field; if (fd) { hfFace(J, (fd.x0 + fd.x1) / 2, (fd.z0 + fd.z1) / 2, 2); } }
    } else if (E.etat === 'juge') {
      E.t1 += dt;
      C.pose = { reach: 0.4, lookP: 0.4 };
      if (E.t1 > 4 && !E.dit1) { E.dit1 = true; hfDit(J, 'Le comice agricole du canton. Nous visitons les exploitations, pour les encouragements. Ne vous dérangez pas.', 5); }
      if (E.t1 > 16 && !E.verdict) {
        E.verdict = true;
        const P = hasardF.profil();
        hfFace(J, game.player.pos[0], game.player.pos[2], 3);
        if (P.cultures >= 8 && P.betes >= 1) {
          hfDit(J, 'Des rangs droits, des bêtes en bon état. Le comice vous décerne la médaille d’encouragement, et une prime. Continuez, mon ami.', 6);
          farm.give('medaille_comice', 1); farm.earn(20); sound.quest && sound.quest(true);
          hasardF.noter('comice', 'Le jury du comice agricole est passé juger la ferme. Médaille d’encouragement, et vingt pièces de prime.');
        } else if (P.cultures >= 4 || P.betes >= 1) {
          hfDit(J, 'C’est un début. Une mention honorable, et quelques pièces pour les semences. Revenez nous voir à la foire.', 5);
          farm.earn(5); sound.coin && sound.coin();
          hasardF.noter('comice', 'Le jury du comice agricole est passé juger la ferme : une mention honorable, et cinq pièces pour les semences.');
        } else {
          hfDit(J, 'Hum. Il y a… du travail, ici. Beaucoup de travail. Nous repasserons.', 4);
          hasardF.noter('comice', 'Le jury du comice agricole est passé juger la ferme. Ils sont repartis sans rien dire, ou presque.');
        }
      }
      if (E.t1 > 26) { E.etat = 'part'; const g = game.world.farm.gate || [J.x + 30, J.z]; hfAller(J, [[g[0], g[1]], [g[0] + 40, g[1] + 10]], 1.1); hfAller(C, [[g[0] + 1, g[1]], [g[0] + 41, g[1] + 10]], 1.1); C.pose = {}; }
    } else { const a = hfMarche(J, dt), b = hfMarche(C, dt); if (a && b) E.fini = 'fin'; }
  },
  dessin(E, buf, sbuf, cam, t) { hfDessine(E.juge, buf, sbuf, cam, t); hfDessine(E.clerc, buf, sbuf, cam, t); },
  txt: {
    journal: 'Le jury du comice agricole est passé juger la ferme.',
    apres: ['Le comice passe dans les fermes, cette semaine. Ils regardent les rangs, les bêtes, et la couleur du fumier.', 'Le président du comice a une médaille pour tout le monde, sauf pour ceux qui votent mal.'],
  },
});
