// ============================================================================
//  CORPS ET ESPRIT (2) : ce qu'on mange. Des plantes, des baies, des
//  champignons, des viandes et des poissons, crus ou cuits, font de l'effet :
//  poison (la vie s'en va, on vomit), nausée, coliques, fièvre, somnolence,
//  visions, force, jambes de cerf, yeux de chat, calme ou panique, paralysie…
//  Chaque effet a sa probabilité, son délai (de tout de suite à cinq minutes,
//  en temps réel) et sa durée ; il s'annonce par une phrase du personnage.
//  La file d'attente est sauvegardée (farm.s.effets : { t, file, actifs }).
//  API : effets.declencher(id, { delai, duree, k, src, cause }), effets.actif(id),
//        effets.retirer(id), effets.regles(objet).
//  Essais : effets.forcer(objet, sansDelai), effets.avancer(secondes), effets.liste().
// ============================================================================
const s2h = (sec) => sec * 24 / JOUR_SECONDES; // secondes réelles -> heures de jeu
function teinte(tint, c, a) { if (a > tint[3]) { tint[0] = c[0]; tint[1] = c[1]; tint[2] = c[2]; tint[3] = a; } }
const MAL_NUIT = {
  1: '(Une nuit agitée, le ventre noué.)',
  2: '(Vous avez passé la nuit à vomir.)',
  3: '(Une nuit de fièvre.)',
};
// vomir : on perd ce qu'on a mangé
function vomir(k) {
  const p = game.player, eye = p.eyePos(), f = cameraBasis(p.yaw, -0.6).f;
  p.food = Math.max(0, p.food - (6 + 6 * (k || 1)));
  play.nausea = Math.max(play.nausea || 0, 3);
  p.stamina = Math.min(p.stamina, 0.25);
  game.shakeT = Math.max(game.shakeT || 0, 0.35);
  sound.vomissement && sound.vomissement(k || 1);
  for (let i = 0; i < 26; i++) particles.spawn(eye[0] + f[0] * 0.35, eye[1] - 0.25, eye[2] + f[2] * 0.35, f[0] * (1 + Math.random()) + (Math.random() - 0.5) * 0.6, -0.4 - Math.random(), f[2] * (1 + Math.random()) + (Math.random() - 0.5) * 0.6, [0.42 + Math.random() * 0.1, 0.38 + Math.random() * 0.08, 0.16, 1], 0.05 + Math.random() * 0.04, 0.7 + Math.random() * 0.5, 9, false);
  const S = effets.S();
  if (S && !S.vomi) { S.vomi = 1; effets.dire('(Vous vomissez tout ce que vous avez mangé.)'); }
}

// ---------------------------------------------------------------- les effets
// dur : durée par défaut (s) ; instant : sans durée ; mal : ce qu'il en reste quand on dort pendant (voir MAL_NUIT)
// dmgS(A) : vie perdue par seconde (pour le sommeil) ; start / tick / end / fx / ciel
const EFFETS = {
  poison: {
    dur: [60, 150], mal: 2,
    debut: ['(Une crampe vous plie en deux.)'],
    fin: '(Le mal passe.)',
    dmgS: (A) => 0.22 * A.k,
    tick(A, dt) {
      const p = game.player;
      if (BUFF.on('antidote')) { A.fin = Math.min(A.fin, effets.S().t); A.gueri = true; return; }
      p.hp -= dt * 0.22 * A.k;
      play.nausea = Math.max(play.nausea || 0, 0.8 + A.k * 0.4);
      A.T.v = (A.T.v ?? 6 + Math.random() * 8) - dt;
      if (A.T.v <= 0) { A.T.v = 14 + Math.random() * 14; if (Math.random() < 0.55) vomir(A.k); }
      if (p.hp <= 0) { const c = 'Empoisonné par ' + (A.cause || 'ce qu’il avait mangé'); play.lastHurtBy = c; game.die(c); }
    },
    end(A) { if (A.gueri) effets.dire('(Le ventre se dénoue.)'); },
    fx(A, fx, tint) { teinte(tint, [0.35, 0.5, 0.2], 0.05 + 0.02 * A.k); fx[2] = Math.max(fx[2], 0.1 * A.k); },
  },
  nausee: {
    dur: [30, 120], mal: 1,
    debut: ['(Votre estomac se soulève.)'],
    fin: '(La nausée passe.)',
    tick(A, dt) {
      if (BUFF.on('antidote')) { A.fin = Math.min(A.fin, effets.S().t); return; }
      play.nausea = Math.max(play.nausea || 0, 1 + A.k);
      A.T.v = (A.T.v ?? 10 + Math.random() * 12) - dt;
      if (A.T.v <= 0) { A.T.v = 12 + Math.random() * 14; if (Math.random() < 0.2 * A.k) vomir(A.k * 0.6); }
    },
  },
  vomir: { instant: true, mal: 2, start(A) { vomir(A.k); } },
  coliques: {
    dur: [60, 150], mal: 1,
    debut: ['(Des coliques vous tordent le ventre.)'],
    fin: '(Les coliques s’apaisent.)',
    dmgS: (A) => 0.08 * A.k,
    tick(A, dt) {
      const p = game.player;
      A.T.c = (A.T.c ?? 4 + Math.random() * 6) - dt;
      if (A.T.c <= 0) {
        A.T.c = 9 + Math.random() * 8;
        p.hp -= 1.2 * A.k; p.food = Math.max(0, p.food - 2); p.stamina = Math.min(p.stamina, 0.15);
        game.shakeT = Math.max(game.shakeT || 0, 0.15);
        sound.hurtHuman && sound.hurtHuman(1.1);
        if (p.hp <= 0) game.die('Mort de coliques, plié en deux');
      }
    },
  },
  fievre: {
    dur: [120, 280], mal: 3,
    debut: ['(Vous avez chaud, puis froid. La fièvre monte.)'],
    fin: '(La fièvre tombe.)',
    dmgS: (A) => 0.02 * A.k,
    tick(A, dt) {
      const p = game.player;
      p.hp -= dt * 0.02 * A.k;
      if (p.stamina > 0.7) p.stamina = 0.7;
      A.T.g = (A.T.g ?? 6 + Math.random() * 6) - dt;
      if (A.T.g <= 0) { A.T.g = 10 + Math.random() * 9; game.shakeT = Math.max(game.shakeT || 0, 0.3); sound.breath && sound.breath(0.6); }
      if (p.hp <= 0) game.die('Emporté par la fièvre');
    },
    fx(A, fx, tint, t) { teinte(tint, [1, 0.45, 0.2], (0.04 + 0.03 * Math.sin(t * 1.7)) * A.k); fx[2] = Math.max(fx[2], 0.06 * A.k); },
  },
  somnolence: {
    dur: [60, 180],
    debut: ['(Une grande lourdeur vous prend.)'],
    fin: '(La torpeur se dissipe.)',
    start() { sound.baillement && sound.baillement(); },
    tick(A, dt) {
      const p = game.player;
      p.mods.speed *= 0.82;
      if (p.stamina > 0.5) p.stamina = 0.5;
      A.T.b = (A.T.b ?? 5 + Math.random() * 5) - dt;
      if (A.T.b <= 0) { A.T.b = 6 + Math.random() * 6 / A.k; A.T.cl = 0.28 + 0.1 * A.k; if (Math.random() < 0.3) sound.baillement && sound.baillement(); }
      A.T.cl = Math.max(0, (A.T.cl || 0) - dt);
    },
    fx(A, fx, tint) { fx[0] = Math.max(fx[0], 0.25 + 0.15 * A.k); if (A.T.cl > 0) teinte(tint, [0, 0, 0], 0.88); },
  },
  endormir: {
    instant: true,
    start() {
      if (game.sleeping || game.dying) return;
      effets.dire('(Vos paupières tombent. Impossible de lutter.)');
      setTimeout(() => { if (!game.sleeping && !game.dying && farm.s) game.sleep('dehors'); }, 1800);
    },
  },
  hallucinations: {
    dur: [90, 240],
    debut: ['(Quelque chose ne va pas avec la lumière.)'],
    fin: '(Les couleurs reprennent leur place.)',
    tick(A, dt, c) {
      play.nausea = Math.max(play.nausea || 0, 0.3 * A.k);
      A.T.s = (A.T.s ?? 6 + Math.random() * 8) - dt;
      if (A.T.s <= 0 && c.eye) { A.T.s = 12 + Math.random() * 14 / A.k; esprit.silhouette(c.eye, c.basis, { dedans: true }); }
      A.T.m = (A.T.m ?? 8 + Math.random() * 10) - dt;
      if (A.T.m <= 0) { A.T.m = 8 + Math.random() * 12; sound.whisper && sound.whisper(Math.random() * 2 - 1, 0.25 + 0.1 * A.k); }
      A.T.g = (A.T.g ?? 15 + Math.random() * 15) - dt;
      if (A.T.g <= 0) { A.T.g = 15 + Math.random() * 15; strange.glitchT = Math.max(strange.glitchT, 0.12 + 0.05 * A.k); }
    },
    fx(A, fx, tint, t) {
      teinte(tint, [0.5 + 0.5 * Math.sin(t * 0.7), 0.5 + 0.5 * Math.sin(t * 0.7 + 2.1), 0.5 + 0.5 * Math.sin(t * 0.7 + 4.2)], 0.05 + 0.05 * A.k);
      fx[2] = Math.max(fx[2], 0.1 + 0.08 * A.k);
    },
    ciel(A, sky, t) {
      const k = 0.18 * A.k, c = [0.5 + 0.5 * Math.sin(t * 0.4 + 1), 0.5 + 0.5 * Math.sin(t * 0.4 + 3.1), 0.5 + 0.5 * Math.sin(t * 0.4 + 5.2)];
      const l = (v) => v[0] * 0.3 + v[1] * 0.55 + v[2] * 0.15;
      sky.zen = v3.lerp(sky.zen, v3.scale(c, l(sky.zen) * 1.8), k);
      sky.hor = v3.lerp(sky.hor, v3.scale(c, l(sky.hor) * 1.8), k);
      sky.haze = v3.lerp(sky.haze, v3.scale(c, l(sky.haze) * 1.8), k);
    },
  },
  // (buff : l'effet passe par les « états » de l'alchimie — BUFF — pour la durée de l'effet)
  force: {
    dur: [60, 150], buff: 'force',
    debut: ['(Une force sourde vous monte dans les bras.)'],
  },
  sprint: {
    dur: [50, 110], buff: 'celerite',
    debut: ['(Un feu vous monte aux joues, et aux jambes.)'],
    start() { game.player.stamina = 1; },
    tick() { const p = game.player; if (p.stamina < 0.6) p.stamina = 0.6; },
  },
  vision_nuit: {
    dur: [120, 240], buff: 'nyctalopie',
    debut: ['(Vos yeux piquent un peu. Le noir s’éclaircit.)'],
  },
  vigueur: {
    dur: [90, 200], buff: 'vigueur',
    debut: ['(Un coup de fouet : la fatigue recule.)'],
    start() { game.player.stamina = 1; },
    tick() { const p = game.player; if (p.stamina < 0.5) p.stamina = 0.5; },
  },
  soin: {
    dur: [30, 90],
    debut: ['(Une douce chaleur répare quelque chose en vous.)'],
    tick(A, dt) { const p = game.player; if (p.hp < 100) p.hp = Math.min(100, p.hp + dt * 0.25 * A.k); },
  },
  calme: {
    dur: [60, 180],
    debut: ['(Les épaules se dénouent. Tout est calme.)'],
    start(A) { esprit.changer(1.2 * A.k, 'calme', 5); },
    tick() { strange.fear = (strange.fear || 0) * 0.35; },
  },
  panique: {
    dur: [40, 120],
    debut: ['(Une peur sans objet vous serre la gorge.)'],
    fin: '(Le cœur ralentit.)',
    start(A) { esprit.changer(-1.2 * A.k, 'panique', 6); },
    tick(A, dt) {
      const p = game.player;
      strange.fear = Math.max(strange.fear || 0, 0.35 + 0.15 * A.k);
      p.mods.speed *= 1.08;
      A.T.s = (A.T.s ?? 3 + Math.random() * 4) - dt;
      if (A.T.s <= 0) { A.T.s = 5 + Math.random() * 5; game.shakeT = Math.max(game.shakeT || 0, 0.25); }
      A.T.m = (A.T.m ?? 6 + Math.random() * 6) - dt;
      if (A.T.m <= 0) { A.T.m = 7 + Math.random() * 8; sound.whisper && sound.whisper(Math.random() * 2 - 1, 0.35); }
    },
    fx(A, fx) { fx[0] = Math.max(fx[0], 0.2 + 0.1 * A.k); },
  },
  paralysie: {
    dur: [4, 10],
    debut: ['(Vos jambes ne répondent plus. Vous ne pouvez plus bouger.)'],
    fin: '(Des fourmis dans les jambes : vous pouvez de nouveau bouger.)',
    tick() { const p = game.player; p.mods.speed = 0; p.mods.jump = 0; p.vel[0] *= 0.5; p.vel[2] *= 0.5; },
    fx(A, fx, tint) { fx[0] = Math.max(fx[0], 0.3); teinte(tint, [0.2, 0.22, 0.25], 0.12); },
  },
  faim: { instant: true, debut: ['(Une faim de loup vous tord le ventre.)'], start(A) { const p = game.player; p.food = Math.max(0, p.food - 12 * A.k); } },
  pique: { instant: true, debut: ['(Ça pique la langue et les lèvres.)'], start() { const p = game.player; p.hp = Math.max(1, p.hp - 1); } },
  remede: {
    instant: true,
    start() {
      const S = effets.S();
      let ok = false;
      for (const A of S.actifs) if (A.id === 'fievre' || A.id === 'coliques') { A.fin = Math.min(A.fin, S.t + 5); ok = true; }
      if (ok) effets.dire('(La fièvre recule.)');
    },
  },
  vue_trouble: {
    dur: [40, 90],
    debut: ['(Votre vue se brouille. Cette gnôle-là n’était pas bonne.)'],
    fin: '(Vous y voyez de nouveau.)',
    fx(A, fx, tint) { fx[0] = Math.max(fx[0], 0.55); fx[2] = Math.max(fx[2], 0.35); teinte(tint, [0.55, 0.55, 0.5], 0.3); },
  },
  ivresse: { instant: true, start(A) { if (typeof alcool !== 'undefined') alcool.boire(A.k, A.src); } },
};

// ---------------------------------------------------------------- ce que font les aliments
// [effet, probabilité, délai min (s), délai max (s), intensité (1 à 3), durée min (s), durée max (s)]
// c : ce qui empoisonne (cause de la mort : « Empoisonné par … »)
const ALIMENTS_EFFETS = {
  // ---- viandes et poissons (crus : ce sont les poissons tels qu'on les pêche)
  viande: { c: 'de la viande avariée', r: [['nausee', 0.35, 30, 120], ['coliques', 0.15, 60, 200], ['poison', 0.1, 60, 240, 1], ['fievre', 0.06, 150, 300]] },
  // (le sang d'anguille rend très malade, sans tuer souvent : un poisson de pêche ordinaire)
  anguille: { c: 'du sang d’anguille', r: [['poison', 0.6, 20, 90, 1], ['nausee', 0.7, 10, 60], ['vomir', 0.5, 40, 120]] },
  anguille_argent: { c: 'du sang d’anguille', r: [['poison', 0.5, 20, 90, 1], ['nausee', 0.6, 10, 60], ['hallucinations', 0.3, 60, 180]] },
  barbeau: { c: 'des œufs de barbeau', r: [['coliques', 0.5, 40, 150], ['vomir', 0.4, 60, 180]] },
  poisson_chat: { r: [['nausee', 0.3, 20, 90]] },
  poisson_lune: { r: [['vision_nuit', 0.75, 30, 90, 1, 200, 300], ['calme', 0.5, 20, 60]] },
  poisson_aveugle: { r: [['vision_nuit', 0.6, 30, 90, 1, 150, 260], ['hallucinations', 0.4, 60, 180]] },
  ecrevisse_aveugle: { r: [['paralysie', 0.3, 20, 60, 1, 5, 9], ['hallucinations', 0.2, 60, 150]] },
  poisson_ancien: { r: [['hallucinations', 0.6, 60, 180, 2], ['calme', 0.3, 30, 90]] },
  reine_lac: { r: [['calme', 0.9, 5, 30, 2], ['soin', 0.6, 10, 40, 2]] },
  vieux_silure: { r: [['panique', 0.7, 30, 120, 2], ['nausee', 0.5, 20, 80]] },
  brochet_douves: { r: [['panique', 0.4, 30, 120], ['coliques', 0.3, 60, 180]] },
  esturgeon: { r: [['force', 0.4, 20, 60, 1, 90, 160]] },
  lamproie: { r: [['force', 0.3, 20, 60], ['nausee', 0.25, 20, 90]] },
  truite_pierre: { r: [['force', 0.3, 20, 60]] },
  poisson_source: { r: [['soin', 0.45, 10, 40], ['calme', 0.3, 10, 40]] },
  blennie: { r: [['calme', 0.3, 10, 40]] },
  // ---- champignons
  champignon: { c: 'des champignons douteux', r: [['nausee', 0.12, 60, 240], ['coliques', 0.1, 60, 240], ['hallucinations', 0.04, 120, 300]] },
  amanite: { c: 'des amanites', r: [['hallucinations', 0.9, 60, 180, 2, 150, 260], ['nausee', 0.8, 40, 120, 2], ['vomir', 0.6, 80, 200, 2], ['poison', 0.6, 90, 240, 1], ['somnolence', 0.4, 180, 300]] },
  morille: { c: 'des morilles crues', r: [['nausee', 0.6, 60, 180], ['vomir', 0.4, 90, 200], ['coliques', 0.4, 90, 240]] },
  cepe: { r: [['force', 0.1, 30, 90]] },
  // ---- baies et plantes qui ne se mangent pas
  belladone_baies: { c: 'la belladone', r: [['poison', 0.9, 30, 150, 3], ['hallucinations', 0.9, 40, 120, 2, 150, 280], ['vision_nuit', 0.6, 20, 60, 1, 120, 200], ['panique', 0.5, 60, 150, 2], ['fievre', 0.4, 90, 200]] },
  belladone: { c: 'la belladone', r: [['poison', 0.85, 30, 150, 2], ['hallucinations', 0.85, 40, 120, 2], ['vision_nuit', 0.5, 20, 60], ['panique', 0.4, 60, 150]] },
  digitale: { c: 'la digitale', r: [['poison', 0.9, 30, 120, 2], ['panique', 0.7, 0, 30, 2], ['nausee', 0.6, 20, 90], ['vomir', 0.4, 60, 150]] },
  muguet: { c: 'le muguet', r: [['poison', 0.85, 60, 180, 2], ['panique', 0.5, 30, 90], ['nausee', 0.5, 30, 120]] },
  aconit: { c: 'l’aconit', r: [['poison', 0.95, 10, 60, 3], ['paralysie', 0.8, 20, 90, 1, 8, 14], ['panique', 0.4, 5, 40, 2]] },
  colchique: { c: 'la colchique', r: [['poison', 0.95, 200, 300, 3], ['coliques', 0.9, 150, 280, 2], ['vomir', 0.7, 160, 290, 2]] },
  baies_sureau: { c: 'des baies de sureau crues', r: [['nausee', 0.55, 30, 90], ['vomir', 0.35, 60, 150], ['coliques', 0.3, 60, 180]] },
  arnica: { c: 'l’arnica', r: [['nausee', 0.5, 30, 90], ['coliques', 0.4, 60, 150], ['panique', 0.2, 30, 90]] },
  haricot: { c: 'des haricots crus', r: [['nausee', 0.5, 30, 90], ['vomir', 0.3, 60, 150], ['coliques', 0.4, 90, 240]] },
  patate: { r: [['coliques', 0.25, 60, 180]] },
  chataigne: { r: [['coliques', 0.2, 60, 180]] },
  baies: { r: [['coliques', 0.12, 60, 180], ['nausee', 0.08, 60, 180]] },
  prune: { r: [['coliques', 0.2, 90, 240]] },
  cerise: { r: [['coliques', 0.12, 90, 240]] },
  cresson: { r: [['fievre', 0.18, 240, 300, 1, 150, 260], ['coliques', 0.15, 60, 180]] },
  ortie: { r: [['pique', 0.9, 0, 0]] },
  oeuf: { r: [['coliques', 0.06, 120, 300], ['fievre', 0.04, 200, 300]] },
  pain: { r: [['hallucinations', 0.012, 200, 300, 1]] }, // l'ergot du seigle : le mal des ardents
  // ---- ce qui fait du bien
  carotte: { r: [['vision_nuit', 0.2, 60, 150, 1, 120, 200]] },
  myrtille: { r: [['vision_nuit', 0.35, 60, 180, 1, 120, 240]] },
  epinard: { r: [['force', 0.3, 20, 60, 1, 60, 120]] },
  ail: { r: [['force', 0.15, 20, 60]] },
  ail_ours: { r: [['force', 0.2, 20, 60]] },
  piment: { r: [['sprint', 0.6, 0, 10, 1, 50, 90]] },
  gentiane: { r: [['vigueur', 0.6, 10, 40, 1, 120, 240], ['sprint', 0.2, 10, 40]] },
  cassis: { r: [['vigueur', 0.2, 20, 60]] },
  miel: { r: [['vigueur', 0.2, 10, 40]] },
  gateau: { r: [['sprint', 0.25, 10, 40]] },
  confiture: { r: [['sprint', 0.15, 10, 40]] },
  herbes: { r: [['soin', 0.5, 5, 20, 1, 30, 60], ['calme', 0.2, 10, 40]] },
  achillee: { r: [['soin', 0.5, 5, 20]] },
  joubarbe: { r: [['soin', 0.3, 5, 20]] },
  thym: { r: [['soin', 0.2, 5, 20]] },
  reine_pres: { r: [['remede', 0.95, 5, 20], ['soin', 0.3, 10, 30]] },
  cynorhodon: { r: [['soin', 0.2, 10, 30]] },
  menthe: { r: [['calme', 0.3, 10, 40]] },
  menthe_eau: { r: [['calme', 0.3, 10, 40]] },
  sauge: { r: [['calme', 0.35, 10, 40]] },
  camomille: { r: [['calme', 0.6, 10, 40], ['somnolence', 0.3, 30, 90]] },
  millepertuis: { r: [['calme', 0.75, 30, 120, 2]] },
  tussilage: { r: [['calme', 0.2, 10, 40]] },
  lys_cimes: { r: [['calme', 0.5, 10, 40, 2], ['vision_nuit', 0.2, 30, 90]] },
  pavot: { r: [['somnolence', 0.8, 30, 90, 2], ['hallucinations', 0.5, 60, 150], ['calme', 0.7, 10, 40, 2], ['endormir', 0.2, 120, 240]] },
  // ---- les plats
  viande_grillee: { r: [['force', 0.12, 20, 60]] },
  brochette: { r: [['force', 0.2, 20, 60]] },
  ragout: { r: [['force', 0.2, 20, 60], ['somnolence', 0.25, 60, 150]] },
  gratin: { r: [['somnolence', 0.3, 60, 150]] },
  tarte_citrouille: { r: [['somnolence', 0.15, 60, 150]] },
  soupe: { r: [['calme', 0.25, 10, 40]] },
  soupe_oignon: { r: [['calme', 0.25, 10, 40]] },
  soupe_poisson: { r: [['calme', 0.2, 10, 40]] },
  porridge: { r: [['vigueur', 0.3, 10, 40]] },
  tisane: { r: [['calme', 0.6, 5, 30], ['somnolence', 0.4, 30, 60]] },
  infusion: { r: [['calme', 0.5, 5, 30]] },
  lait: { r: [['calme', 0.15, 10, 40]] },
  patee: { c: 'de la pâtée pour chien', r: [['nausee', 0.35, 20, 60]] },
  // ---- ce qu'on n'aurait pas dû porter à la bouche (voir plus bas : ces plantes se mâchent désormais)
  mandragore: { c: 'la mandragore', r: [['hallucinations', 0.95, 20, 90, 3, 180, 300], ['paralysie', 0.6, 30, 120, 1, 6, 12], ['panique', 0.7, 10, 60, 2], ['poison', 0.5, 60, 180, 2]] },
  champi_lumineux: { c: 'un champignon des grottes', r: [['vision_nuit', 0.8, 30, 90, 1, 180, 300], ['hallucinations', 0.5, 60, 180], ['nausee', 0.3, 30, 90]] },
  baies_houx: { c: 'des baies de houx', r: [['nausee', 0.7, 20, 60], ['vomir', 0.5, 40, 120], ['coliques', 0.5, 60, 180]] },
  chanvre: { r: [['calme', 0.6, 30, 90, 2], ['faim', 0.5, 60, 150], ['hallucinations', 0.25, 60, 150]] },
  houblon: { r: [['somnolence', 0.6, 30, 90], ['calme', 0.4, 20, 60]] },
  fleur_tilleul: { r: [['calme', 0.6, 10, 40], ['somnolence', 0.3, 30, 90]] },
};
// ces plantes ne se mangeaient pas : elles se mâchent, maintenant (à vos risques)
{
  const M = { mandragore: { heal: -8 }, champi_lumineux: { food: 2 }, baies_houx: { food: 1 }, pavot: { food: 1 }, chanvre: { food: 1 }, houblon: { food: 1 }, fleur_tilleul: { heal: 2 } };
  for (const id in M) { const it = ITEMS[id]; if (it && !it.food && !it.heal) Object.assign(it, M[id]); }
}
// règles générales : poissons crus, viandes crues, plantes vénéneuses sans règle propre
const ALIMENTS_GENERIQUES = {
  poisson_cru: { c: 'du poisson cru', r: [['nausee', 0.18, 40, 150], ['coliques', 0.1, 60, 240], ['poison', 0.04, 90, 240, 1]] },
  cru: { c: 'de la viande crue', r: [['nausee', 0.25, 30, 120], ['coliques', 0.12, 60, 200]] },
};

// ============================================================================
//  LA FILE DES EFFETS
// ============================================================================
const effets = {
  q: [], qT: 0, branche: false,
  S() {
    const s = farm.s;
    if (!s) return null;
    const E = s.effets || (s.effets = { t: 0, file: [], actifs: [] });
    if (!Array.isArray(E.file)) E.file = [];
    if (!Array.isArray(E.actifs)) E.actifs = [];
    if (!(E.t >= 0)) E.t = 0;
    return E;
  },
  // les règles d'un aliment : { c, r: [[effet, p, d0, d1, k, dur0, dur1]] }
  regles(id) {
    const it = ITEMS[id];
    if (!it) return null;
    const own = ALIMENTS_EFFETS[id];
    const fish = typeof FISH !== 'undefined' && FISH[id] && it.raw;
    if (fish) { const G = ALIMENTS_GENERIQUES.poisson_cru; return { c: (own && own.c) || G.c, r: G.r.concat(own ? own.r : []) }; }
    if (own) return own;
    if (it.raw) return ALIMENTS_GENERIQUES.cru;
    if (it.poison || (it.heal || 0) < 0) { const k = clamp(Math.ceil(-(it.heal || -15) / 15), 1, 3); return { c: it.name.toLowerCase(), r: [['poison', 0.9, 30, 150, k], ['nausee', 0.6, 20, 90]] }; }
    return null;
  },
  // un aliment vient d'être mangé
  manger(id) {
    const it = ITEMS[id], R = this.regles(id);
    if (R) for (const r of R.r) {
      if (Math.random() >= r[1]) continue;
      if (r[0] === 'poison' && BUFF.on('antidote')) continue;
      this.declencher(r[0], { delai: lerp(r[2], r[3], Math.random()), k: r[4] || 1, duree: r[5] ? lerp(r[5], r[6] || r[5], Math.random()) : undefined, src: id, cause: R.c });
    }
    // bien manger remonte le moral ; la tisane chasse la gueule de bois
    if (it.cat === 'nourriture' && (it.food || 0) >= 18 && !it.alcool) esprit.changer(0.6, 'bon repas', 1.8);
    else if ((it.food || 0) >= 4 && !it.raw && !it.poison && !it.alcool) esprit.changer(0.2, 'manger', 0.6);
    if (typeof alcool !== 'undefined' && ['tisane', 'infusion', 'porridge', 'soupe', 'soupe_oignon'].includes(id)) alcool.soulager();
  },
  // déclenche un effet : tout de suite, ou après un délai (secondes réelles, 5 minutes au plus)
  declencher(id, o) {
    o = o || {};
    const D = EFFETS[id], S = this.S();
    if (!D) { console.warn('effet inconnu', id); return null; }
    if (!S) return null;
    const dur = o.duree !== undefined ? +o.duree : lerp((D.dur || [30, 60])[0], (D.dur || [30, 60])[1], Math.random());
    const E = { id, at: S.t + clamp(+o.delai || 0, 0, 300), dur: D.instant ? 0 : Math.max(1, dur), k: clamp(+o.k || 1, 0.5, 3), src: o.src || null, cause: o.cause || null };
    if (E.at <= S.t) return this.lancer(E);
    S.file.push(E);
    return E;
  },
  lancer(E, silencieux) {
    const S = this.S(), D = EFFETS[E.id];
    if (!D) return null;
    const cur = D.instant ? null : S.actifs.find((a) => a.id === E.id);
    if (cur) { // déjà en cours : il dure plus longtemps, et peut-être plus fort
      const old = cur.fin;
      cur.fin = Math.max(cur.fin, S.t + E.dur); cur.k = Math.max(cur.k, E.k);
      if (D.buff && cur.fin > old) BUFF.add(D.buff, s2h(cur.fin - old));
      return cur;
    }
    const A = { id: E.id, k: E.k, t0: S.t, fin: S.t + (E.dur || 0), src: E.src, cause: E.cause, T: {} };
    if (D.debut && !silencieux) this.dire(pick(D.debut));
    if (D.buff) BUFF.add(D.buff, s2h(A.fin - A.t0));
    if (D.start) try { D.start(A); } catch (e) { console.error(e); }
    if (!D.instant) S.actifs.push(A);
    return A;
  },
  actif(id) { const S = this.S(); return !!(S && S.actifs.some((a) => a.id === id)); },
  enAttente(id) { const S = this.S(); return !!(S && S.file.some((a) => a.id === id)); },
  retirer(id) {
    const S = this.S();
    if (!S) return;
    S.file = S.file.filter((a) => a.id !== id);
    for (const A of S.actifs.filter((a) => a.id === id)) { const D = EFFETS[A.id]; if (D.end) D.end(A); }
    S.actifs = S.actifs.filter((a) => a.id !== id);
  },
  dire(t, dur) { if (t) this.q.push([t, dur || 3.5]); },
  // chaque image
  update(dt, eye, basis) {
    const S = this.S();
    if (!S) return;
    this.qT -= dt;
    if (this.qT <= 0 && this.q.length) { const [t, d] = this.q.shift(); if (!cine.on) ui.subtitle('', t, d); this.qT = 2.4; }
    if (game.mode !== 'play' || game.dying || game.sleeping) return;
    S.t += dt;
    for (let i = S.file.length - 1; i >= 0; i--) if (S.file[i].at <= S.t) this.lancer(S.file.splice(i, 1)[0]);
    const c = { eye, basis };
    for (let i = S.actifs.length - 1; i >= 0; i--) {
      const A = S.actifs[i], D = EFFETS[A.id];
      if (!D) { S.actifs.splice(i, 1); continue; }
      if (D.tick && !cine.on) try { D.tick(A, dt, c); } catch (e) { console.error(e); }
      if (game.dying) return;
      if (S.t >= A.fin) { const j = S.actifs.indexOf(A); if (j >= 0) S.actifs.splice(j, 1); if (D.end) D.end(A); if (D.fin && !A.gueri) this.dire(D.fin); }
    }
  },
  // le temps passe d'un coup (sommeil, évanouissement) : ce qui devait arriver arrive pendant la nuit
  sauter(sec) {
    const S = this.S();
    if (!S || !(sec > 0)) return;
    const t0 = S.t, t1 = t0 + sec, p = game.player;
    let dmg = 0, mal = 0;
    for (let i = S.file.length - 1; i >= 0; i--) {
      const E = S.file[i];
      if (E.at > t1) continue;
      S.file.splice(i, 1);
      const D = EFFETS[E.id];
      if (!D) continue;
      if (D.instant) { mal = Math.max(mal, D.mal || 0); continue; }
      S.actifs.push({ id: E.id, k: E.k, t0: E.at, fin: E.at + E.dur, src: E.src, cause: E.cause, T: {}, dort: true });
    }
    for (let i = S.actifs.length - 1; i >= 0; i--) {
      const A = S.actifs[i], D = EFFETS[A.id] || {};
      const d = Math.max(0, Math.min(A.fin, t1) - Math.max(A.t0, t0));
      if (D.dmgS) dmg += D.dmgS(A) * d;
      if (d > 0) mal = Math.max(mal, D.mal || 0);
      if (A.fin <= t1) { S.actifs.splice(i, 1); if (D.end && !A.dort) D.end(A); }
      else if (A.dort) { // commencé pendant le sommeil : il continue au réveil
        delete A.dort;
        if (D.buff) BUFF.add(D.buff, s2h(A.fin - t1));
        if (D.start) try { D.start(A); } catch (e) { console.error(e); }
      }
    }
    S.t = t1;
    if (dmg > 0) p.hp = Math.max(Math.min(p.hp, 10), p.hp - dmg * 0.6);
    if (mal && MAL_NUIT[mal]) setTimeout(() => { if (!game.dying && farm.s) ui.subtitle('', MAL_NUIT[mal], 5); }, 3400);
  },
  fx(fx, tint, sky) {
    const S = this.S();
    if (!S || !S.actifs.length) return;
    const t = game.time;
    for (const A of S.actifs) { const D = EFFETS[A.id]; if (D && D.fx) D.fx(A, fx, tint, t); }
  },
  ciel(sky) {
    const S = this.S();
    if (!S || !S.actifs.length) return;
    for (const A of S.actifs) { const D = EFFETS[A.id]; if (D && D.ciel) D.ciel(A, sky, game.time); }
  },
  // ---------------------------------------------------------------- essais
  // tous les effets d'un aliment, à coup sûr (sansDelai : tout de suite)
  forcer(id, sansDelai) {
    const R = this.regles(id), out = [];
    if (!R) return out;
    for (const r of R.r) out.push(this.declencher(r[0], { delai: sansDelai ? 0 : lerp(r[2], r[3], Math.random()), k: r[4] || 1, duree: r[5] ? lerp(r[5], r[6] || r[5], Math.random()) : undefined, src: id, cause: R.c }));
    return out;
  },
  // avancer l'horloge des effets (les délais courent ; les effets en cours ne sont pas joués)
  avancer(sec) { const S = this.S(); if (S) S.t += Math.max(0, +sec || 0); return S && S.t; },
  liste() { const S = this.S(); return S ? { t: +S.t.toFixed(1), file: S.file.map((e) => `${e.id}@${(e.at - S.t).toFixed(0)}s(${e.src || '-'})`), actifs: S.actifs.map((a) => `${a.id}:${(a.fin - S.t).toFixed(0)}s k${a.k}`) } : null; },
};

// ---------------------------------------------------------------- points d'accroche
HOOKS.update.push((dt, eye, basis, sky, playing) => { if (farm.s && !game.dying) effets.update(dt, eye, basis); });
HOOKS.fx.push((fx, tint, sky) => effets.fx(fx, tint, sky));
HOOKS.sky.push((sky) => effets.ciel(sky));
HOOKS.load.push((saved) => {
  const s = farm.s;
  if (!saved || !s.effets) s.effets = { t: 0, file: [], actifs: [] };
  effets.S(); effets.q = []; effets.qT = 0;
  if (effets.branche) return;
  effets.branche = true;
  // manger : les règles de ce module remplacent la nausée au hasard de la viande crue et l'amertume des baies
  // (cet emballage passe après celui de 11-zzfarm2.js : il le neutralise pour les aliments du tableau)
  const _eat = play.eat.bind(play);
  play.eat = function (id) {
    const it = ITEMS[id], p = game.player;
    if (!it) return _eat(id);
    const n0 = farm.count(id);
    const saved = { raw: it.raw, poison: it.poison, heal: it.heal, stamina: it.stamina };
    it.raw = false; it.poison = false;
    if ((it.heal || 0) < 0) it.heal = 0;
    const sta0 = p.stamina;
    if (it.alcool && p.food > 96 && !it.stamina) it.stamina = 1; // on boit même le ventre plein
    try { _eat(id); } finally {
      it.raw = saved.raw; it.poison = saved.poison; it.heal = saved.heal; it.stamina = saved.stamina;
      if (it.alcool && !saved.stamina) p.stamina = sta0;
    }
    if (farm.count(id) >= n0) return; // rien n'a été avalé
    try {
      if (it.alcool && typeof alcool !== 'undefined') alcool.boire(it.alcool, id);
      effets.manger(id);
    } catch (e) { console.error(e); }
  };
  // le temps sauté (sommeil, évanouissement) compte aussi pour les effets
  const _skip = game.skipHours.bind(game);
  game.skipHours = function (h) { const r = _skip(h); try { if (h > 0) effets.sauter(h * JOUR_SECONDES / 24); } catch (e) { console.error(e); } return r; };
});

// ---------------------------------------------------------------- des bruits de corps
Object.assign(SoundEngine.prototype, {
  vomissement(k = 1) {
    if (!this.ok) return;
    const t = this.at(), v = clamp(k, 0.5, 2);
    this.voice(t, 'sawtooth', 170, 95, 0.55, 0.045 * v, this.sfx, { lp: 650, vib: 17, vibDepth: 25 });
    this.noiseHit(t + 0.18, 0.55, 'lowpass', 900, 0.8, 0.12 * v, null, 260);
    this.noiseHit(t + 0.8, 0.3, 'lowpass', 600, 0.8, 0.07 * v);
  },
  baillement() { if (!this.ok) return; const t = this.at(); this.voice(t, 'sawtooth', 210, 130, 1.3, 0.025, this.sfx, { bp: 600, q: 1.2 }); this.noiseHit(t + 0.1, 1.1, 'bandpass', 800, 1.2, 0.012); },
});
