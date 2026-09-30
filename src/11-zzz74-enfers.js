// ============================================================================
//  LES ENFERS DE LA VALLÉE
//  Qui a tué au moins dix personnes de sa main ne meurt pas tout de suite : il
//  se réveille « à la cave », sous la vallée, sous l'Envers même. Une grève de
//  cendre, un fleuve de braise, le Recenseur et son registre, le champ où
//  attendent les âmes de ses victimes, une table servie où tout devient
//  cendre, le puits des noms, la Porte noire derrière laquelle est la Nuit.
//  On peut tout explorer, tout lire, tout entendre. On ne peut pas manger :
//  la faim finit par tuer, pour de bon (vraie fin de partie).
//  Sauvegarde : farm.s.enfers. mondes.entrer('enfers') : y descendre (essais).
// ============================================================================
defItem('page_registre', 'Page du registre', 'ailleurs', 0, ['md_page', '#d8ccb0', '#5a4a3a'], { desc: 'Une page arrachée au registre du Recenseur. Votre nom y est, tout en bas, d’une encre qui n’a pas encore séché.' });

const ENF = { // décors (boîtes)
  cendre: [0.3, 0.28, 0.27], os: [0.84, 0.8, 0.7], noir: [0.08, 0.07, 0.08], fer: [0.25, 0.22, 0.2],
  lave(E, c, t) { E.fl = FX_EMIT; for (let k = 0; k < 6; k++) { const b = 0.85 + Math.sin(t * 1.3 + k * 1.7 + c.id) * 0.15; E.bx((k - 2.5) * 3.4, 0, 0, 3.5, 0.2, c.l || 8, [1.4 * b, 0.42 * b, 0.08 * b], mt(M_BRAISE)); } E.fl = 0; },
  pont(E) { E.bx(0, -0.1, 0, 3.2, 0.25, 11, ENF.os, TL.bone); for (let z = -4.5; z <= 4.5; z += 1.5) { E.box(-1.7, 0.6, z, 0.18, 1.6, 0.18, ENF.os, TL.bone, 0, 0, -0.3); E.box(1.7, 0.6, z, 0.18, 1.6, 0.18, ENF.os, TL.bone, 0, 0, 0.3); } E.bx(-1.5, 1.2, 0, 0.12, 0.12, 11, ENF.os, TL.bone); E.bx(1.5, 1.2, 0, 0.12, 0.12, 11, ENF.os, TL.bone); },
  pupitre(E) { E.bx(0, 0, 0, 0.8, 1.1, 0.6, ENF.noir, mt(M_OBSIDIENNE)); E.box(0, 1.2, 0, 1.2, 0.08, 0.8, [0.2, 0.16, 0.12], TL.darkwood, 0, -0.35); E.box(-0.28, 1.28, 0.02, 0.55, 0.05, 0.66, [0.86, 0.8, 0.66], TL.paper, 0, -0.35); E.box(0.28, 1.28, 0.02, 0.55, 0.05, 0.66, [0.86, 0.8, 0.66], TL.paper, 0, -0.35); },
  brasero(E, c, t) { E.bx(0, 0, 0, 0.2, 1.1, 0.2, ENF.fer, TL.iron); E.bx(0, 1.1, 0, 0.8, 0.3, 0.8, ENF.fer, TL.iron); E.fl = FX_EMIT; for (let k = 0; k < 3; k++) E.box(Math.sin(k * 2.1) * 0.15, 1.5 + ((t * 1.2 + k * 0.33) % 1) * 0.5, Math.cos(k * 2.1) * 0.15, 0.22, 0.3, 0.22, [1.4, 0.55, 0.12], TL.flame, t + k); E.fl = 0; },
  table(E, c, t) {
    E.bx(0, 0.75, 0, 2.2, 0.1, 12, [0.18, 0.14, 0.12], TL.darkwood);
    for (const z of [-5.5, 0, 5.5]) for (const x of [-0.95, 0.95]) E.bx(x, 0, z, 0.12, 0.75, 0.12, [0.14, 0.1, 0.08], TL.darkwood);
    E.bx(0, 0.85, 0, 1.6, 0.01, 11.4, [0.7, 0.66, 0.6], TL.cloth);
    for (let k = 0; k < 9; k++) { const z = -5 + k * 1.25, v = k % 4; if (v === 0) { E.bx(0.3, 0.86, z, 0.5, 0.18, 0.3, [0.72, 0.46, 0.22], TL.bread); } else if (v === 1) { E.bx(-0.3, 0.86, z, 0.46, 0.24, 0.36, [0.55, 0.22, 0.12], TL.leather); } else if (v === 2) { E.bx(0.35, 0.86, z, 0.1, 0.34, 0.1, [0.3, 0.05, 0.08], TL.glass); E.bx(-0.2, 0.86, z, 0.14, 0.14, 0.14, [0.8, 0.2, 0.15], TL.plain); } else { for (let j = 0; j < 4; j++) E.bx(-0.3 + j * 0.2, 0.86, z, 0.12, 0.12, 0.12, [0.7, 0.3 + j * 0.1, 0.2], TL.plain); } }
    for (const x of [-1.6, 1.6]) E.bx(x, 0, 0, 0.5, 0.45, 11, [0.16, 0.12, 0.1], TL.darkwood);
  },
  puits(E, c, t) { for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; E.box(Math.cos(a) * 1.3, 0.45, Math.sin(a) * 1.3, 0.9, 0.9, 0.5, ENF.noir, mt(M_OBSIDIENNE), -a + Math.PI / 2); } E.bx(0, 0.02, 0, 2.2, 0.05, 2.2, [0, 0, 0], TL.plain); for (const s of [-1.2, 1.2]) E.bx(s, 0.9, 0, 0.14, 2.2, 0.14, ENF.fer, TL.iron); E.bx(0, 3.05, 0, 2.6, 0.14, 0.14, ENF.fer, TL.iron); E.bx(0, 1.4, 0, 0.03, 1.65, 0.03, [0.4, 0.34, 0.26], TL.rope); },
  porte(E, c, t) {
    for (const s of [-1, 1]) { E.bx(s * 3.6, 0, 0, 7, 22, 1.2, ENF.noir, mt(M_OBSIDIENNE)); for (let k = 0; k < 6; k++) E.bx(s * 3.6, 2 + k * 3.4, -0.65, 6.2, 0.35, 0.15, ENF.fer, TL.iron); }
    E.fl = FX_EMIT; const b = 0.5 + Math.sin(t * 0.6) * 0.3; E.bx(0, 0, -0.62, 0.12, 22, 0.05, [1.2 * b, 0.2 * b, 0.1 * b], TL.plain); E.fl = 0;
    E.bx(0, 22, 0, 16, 3, 2.4, ENF.noir, mt(M_OBSIDIENNE));
  },
  autel(E) { E.bx(0, 0, 0, 3, 1.1, 1.4, ENF.noir, mt(M_OBSIDIENNE)); E.bx(0, 1.1, 0, 3.2, 0.12, 1.6, [0.18, 0.16, 0.16], TL.stone); },
  stele(E, c) { E.bx(0, 0, 0, 1.0, 1.8 + (c.v % 3) * 0.3, 0.3, [0.14, 0.12, 0.13], mt(M_OBSIDIENNE)); E.box(0, 1.9 + (c.v % 3) * 0.3, 0, 0.72, 0.72, 0.3, [0.14, 0.12, 0.13], mt(M_OBSIDIENNE), 0, 0, Math.PI / 4); E.fl = FX_EMIT; E.bx(0, 0.8, 0.16, 0.6, 0.7, 0.01, [0.7, 0.22, 0.08], TL.paper); E.fl = 0; },
  os(E, c) { for (let k = 0; k < 7; k++) E.box(Math.cos(k * 2.3 + c.v) * 0.5, 0.08 + (k % 3) * 0.1, Math.sin(k * 1.7 + c.v) * 0.5, 0.6, 0.08, 0.08, ENF.os, TL.bone, k * 1.3); E.box(0.1, 0.22, 0.1, 0.24, 0.24, 0.22, ENF.os, TL.bone, c.v); },
  chaine(E, c, t) { const sw = Math.sin(t * 0.5 + c.id) * 0.1; for (let k = 0; k < 14; k++) E.box(sw * k * 0.1, k * 1.2, 0, 0.1, 1.0, 0.1, ENF.fer, TL.iron, k % 2 ? Math.PI / 2 : 0); E.box(sw * 0.1, -0.4, 0, 0.3, 0.4, 0.06, ENF.fer, TL.iron); },
  arbre(E, c) { E.bx(0, 0, 0, 0.35, 5, 0.35, [0.1, 0.09, 0.08], TL.bark); for (let k = 0; k < 4; k++) E.box(Math.cos(k * 1.6 + c.v) * 0.9, 3.2 + k * 0.5, Math.sin(k * 1.6 + c.v) * 0.9, 0.14, 2.2, 0.14, [0.1, 0.09, 0.08], TL.bark, k * 1.6, 0.9, 0.3); },
};

// ---------------------------------------------------------------- les habitants d'en bas
Object.assign(BETES_MONDE, {
  damne: { rig: (v) => MONDES_RIGS.damne(v), h: 1.8, r: 0.3, hp: 999, vitesse: [0.55, 0.8], rayon: 16, intouchable: true, pale: true, actif: 200,
    touche(e) { MSON.gemissement(1); ui.subtitle('Un damné', pick(['… tu crois que ça fait encore mal ?…', '… frappe, frappe… il n’y a plus rien à casser…']), 3); },
    proche(e) { MONDES.enfers.parlerDamne(e); }, procheD: 3.5,
    ia(e, dt) { if (e.assis) { e.move = 0; if (e.dist < 3.5 && !e.ditProche) { e.ditProche = true; MONDES.enfers.parlerDamne(e); } if (e.dist > 8) e.ditProche = false; return true; } IA_MONDE.errant.call(this, e, dt); if (e.dist < 3.5 && !e.ditProche) { e.ditProche = true; MONDES.enfers.parlerDamne(e); } if (e.dist > 9) e.ditProche = false; e.gT = (e.gT || Math.random() * 10) - dt; if (e.gT <= 0) { e.gT = 8 + Math.random() * 14; if (e.dist < 30) MSON.gemissement(clamp(1 - e.dist / 30, 0.15, 0.7), 0); } return true; },
    pose(e, r, t, st) { poseHuman(r, Object.assign(st, { pale: false, sit: !!e.assis, tilt: Math.sin(t * 0.6 + e.id) * 0.1 })); if (e.assis) r.set('head', 0.5, 0, 0); } },
  chien_cendre: { rig: () => MONDES_RIGS.chien_cendre(), h: 1.1, r: 0.38, hp: 40, vitesse: [1.3, 6.6], ia: 'chasseur', vue: 22, perd: 55, portee: 1.4, degats: 11, cadence: 1.6, rayon: 14, enclos: 28, cause: 'Déchiré par les chiens de cendre', actif: 200,
    alerte(e) { sound.growl && sound.growl(1); }, bruit(e) { sound.growl && sound.growl(0.5); }, bruitT: 5,
    meurt(e) { puffAt(e.x, e.y + 0.5, e.z, [60, 56, 52], 18, 1.8, false); setTimeout(() => { if (mondes.cur === 'enfers') mondes.bete('chien_cendre', e.hx, e.hz); }, 30000); } },
  gardien: { rig: () => MONDES_RIGS.gardien(), h: 2.5, r: 0.45, hp: 999, vitesse: [0, 0], ia: 'immobile', regard: 18, intouchable: true, echelle: 1.0, actif: 300,
    touche(e) { strange.glitchT = Math.max(strange.glitchT, 0.8); ui.subtitle('Le Recenseur', 'Tu as assez frappé pour une vie. Pose ça.', 3.5); },
    proche(e) { if (!farm.s.enfers || !farm.s.enfers.salue) { if (farm.s.enfers) farm.s.enfers.salue = 1; ui.subtitle('Le Recenseur', 'Approche. Je ne mords pas. Je compte.', 3.5); } }, procheD: 6,
    parler(e) { MONDES.enfers.parlerGardien(); } },
  ame: { rig: (v, e) => MONDES_RIGS.ame(e && e.fem ? 1 : 0), h: 1.8, r: 0.3, hp: 999, vitesse: [0, 0], ia: 'immobile', regard: 14, intouchable: true, sansOmbre: true, flotte: 0.08, actif: 200,
    touche(e) { MSON.sanglot(0.6); ui.subtitle(e.nom || 'Une âme', 'Encore ?', 2.5); },
    proche(e) { MONDES.enfers.parlerAme(e); }, procheD: 3.2,
    parler(e) { MONDES.enfers.parlerAme(e, true); } },
});

// ---------------------------------------------------------------- les textes gravés
const ENFERS_STELES = [
  ['Au bord du fleuve', 'Ici finit ce que la vallée ne garde pas.\n\nLe fleuve ne mouille pas : il brûle. Ce qui le traverse ne revient pas le traverser. Les pierres du gué sont des os ; ne demandez pas à qui ils étaient. Ils étaient à des gens comme vous.'],
  ['Le compte', 'On ne descend pas ici pour une vie. On descend pour la dixième.\n\nLes neuf premières, la vallée les pardonne, ou les oublie, ce qui revient au même. La dixième, elle la compte. Le Recenseur l’inscrit, et le nom qu’il écrit ne s’efface plus.'],
  ['Des Trois', 'Aëla est l’Aube, et l’Aube ne descend jamais.\n\nDurn dort au-dessus de nos têtes, dans la montagne, et son sommeil fait le plafond de ce lieu : quand il se retourne, il pleut de la cendre.\n\nVesh est la Nuit noire. Ceci est sa cave.'],
  ['De la Nuit', 'Vesh offre, et ce qu’il offre se paie. Ceux qui ont pris dix vies ont cru prendre pour eux. Ils prenaient pour lui.\n\nIl ne vient jamais ici. C’est ici qui va à lui, une âme après l’autre, par la porte qui ne s’ouvre pas. On dit qu’il a faim, lui aussi. On dit que c’est la même faim.'],
  ['Du Recenseur', 'Registre de la commune, 1854 : treize habitants montèrent au col chercher un enfant perdu dans la neige. Douze redescendirent.\n\nLe treizième tient depuis le compte de ceux qui descendent. Il n’a jamais retrouvé l’enfant. Il cherche encore, entre deux noms.'],
  ['De la faim', 'Rien ne nourrit ici que ce qu’on a pris, et ce qu’on a pris n’est pas à vous.\n\nLe pain devient cendre. L’eau devient cendre. Le vin devient cendre. La mémoire devient cendre en dernier, et c’est pour cela qu’on se souvient si longtemps.'],
  ['Des Pâles', 'Les Pâles qui marchent là-haut les nuits rouges ne sont pas d’ici. Ils sont d’entre-deux : de l’Envers, qui est la doublure de la vallée.\n\nIci, il n’y a plus d’entre-deux. Ici, c’est le fond de l’étoffe.'],
  ['Du puits', 'Le vieux puits de la ferme descend jusqu’ici, disent les damnés. On y jetait des pièces, autrefois, treize à la fois, pour payer une nuit de silence.\n\nPersonne n’y jette plus rien. Écoutez : on entend les noms remonter.'],
  ['Des fermiers', 'Chaque fermier a reçu la même lettre. Chaque fermier a cru être le premier.\n\nCertains sont descendus jusqu’ici. Ils ne sont pas repartis. Ils attendent près de la porte, avec leur lettre à la main, qu’on leur dise enfin qui l’a écrite.'],
  ['Des Gorr', 'Les Gorr, qui dressaient des pierres avant les villes, en posaient une sur chaque tombe de meurtrier, pour qu’il ne remonte pas.\n\nOn en voit ici les ombres, posées sur rien. Elles pèsent quand même.'],
  ['Des Aëlim', 'Les Aëlim ont creusé le temple de Durn au-dessus, pour qu’il dorme, et ils ont scellé la cave en dessous, pour qu’elle ne l’éveille pas.\n\nIls ont écrit sur le sceau un seul mot. Personne ne sait plus le lire. Le Recenseur dit que c’est « assez ».'],
  ['De la fin', 'On ne meurt pas deux fois. On s’arrête.\n\nOn s’arrête quand la faim a fini de compter. Alors le Recenseur tourne la page, et la page suivante est déjà pleine.'],
];
const ENFERS_AMES = [
  'Tu te souviens de moi ? Moi, je me souviens de toi. C’est tout ce qui me reste.',
  'J’avais encore du pain au four, le jour {jour}. Il a dû brûler.',
  'Pourquoi moi ? Je ne t’avais rien fait. Je crois.',
  'Ici, il ne fait ni chaud ni froid. Il fait longtemps.',
  'Tu as faim ? Moi aussi. Depuis le jour {jour}.',
  'Je ne t’en veux plus. Je n’ai plus la force de t’en vouloir.',
  'Regarde-moi. Non, ne détourne pas les yeux. Tu l’as déjà fait une fois.',
  'Quelqu’un a dû fermer ma porte, après. J’espère qu’on a pensé aux bêtes.',
  'On m’a enterré(e) sous le mauvais nom. Ici, au moins, on m’appelle par le mien.',
  'Tu as eu peur, ce jour-là ? Moi, oui. Maintenant, je n’ai plus peur de rien. C’est pire.',
];
const ENFERS_SANS_NOM = ['Tu ne connaissais même pas mon nom.', 'J’étais de passage. Je le suis toujours.', 'Personne ne m’a cherché. Personne ne me cherchera.'];
const ENFERS_DAMNES = ['… encore un…', '… tu as quelque chose à manger ?… non… personne n’a jamais rien…', '… ne regarde pas la porte… elle te regarde aussi…', '… j’ai compté jusqu’à dix, moi aussi… on compte tous jusqu’à dix…', '… le fleuve… le fleuve ne rend rien…', '… il fait longtemps, ici… il fait si longtemps…', '… on m’appelait comment, déjà ?…'];

// ---------------------------------------------------------------- le monde
MONDES.enfers = {
  nom: 'enfers', titre: 'les Enfers', aPart: true, lieu: 'les Enfers', plancher: 1,
  E() { const s = farm.s; return s.enfers || (s.enfers = { fait: 0, actif: 0, lus: {}, faim: 0 }); },
  f() { const F = MONDES_FOND.enfers; return { x: F.x, y: F.y, z: F.z, r: 0 }; },
  at(lx, lz) { return mondes.toWorld(this.f(), lx, lz); },
  ciel(sky, k) {
    mondes.melerCiel(sky, {
      zen: [0.07, 0.012, 0.006], hor: [0.34, 0.07, 0.025], amb: [0.28, 0.11, 0.075], glow: [0.6, 0.15, 0.03], haze: [0.2, 0.045, 0.02],
      cloudLit: [0.4, 0.09, 0.03], cloudDark: [0.09, 0.02, 0.01], cloudCover: 0.85, sunCol: [0.55, 0.22, 0.1], moonCol: [0, 0, 0], sunDir: v3.norm([0.25, 0.92, 0.3]),
      stars: 0, sunVis: 0, moonVis: 0, fog: [16, 105], nightLit: 1, shadowK: 0.25, mist: 0,
    }, k);
  },
  posReelle() { return this.E().corps || mondes.S().retour || null; },
  avantSauvegarde() { const E = this.E(), p = game.player; E.pos = p.pos.map((v) => Math.round(v * 100) / 100); E.yaw = p.yaw; },
  entrer(opts) {
    const E = this.E(), f = this.f(), M = mondes, p = game.player;
    E.actif = 1;
    if (!E.corps) { const R = mondes.S().retour; if (R) E.corps = { pos: R.pos.slice(), yaw: R.yaw, pitch: R.pitch }; }
    // le sol : grève de cendre au sud, fleuve de braise, puis les champs jusqu'à la Porte noire ; des falaises tout autour
    for (let x = -60; x < 60; x += 20) {
      for (let z = -72; z < -48; z += 12) M.bloc(f, x + 10, -2, z + 6, 20, 2, 12, M_ROCK);
      for (let z = -40; z < 48; z += 22) M.bloc(f, x + 10, -2, z + 11, 20, 2, 22, M_ROCK);
    }
    M.bloc(f, 0, -4, -44, 120, 1.5, 8.2, M_BRAISE); // lit du fleuve
    M.bloc(f, 0, -0.25, -44, 3.2, 0.25, 11, M_STONE); // le gué
    for (const s of [-1, 1]) M.bloc(f, s * 63.5, -5, -11, 3, 50, 126, M_OBSIDIENNE);
    M.bloc(f, 0, -5, -74.5, 130, 50, 3, M_OBSIDIENNE); M.bloc(f, 0, -5, 50.5, 130, 50, 3, M_OBSIDIENNE);
    // aiguilles de roche
    const rnd = mulberry32(farm.s.seed * 5 + 13);
    for (let k = 0; k < 16; k++) { const x = (rnd() - 0.5) * 108, z = -36 + rnd() * 80; if (Math.abs(x) < 8 || (Math.abs(x - 32) < 9 && Math.abs(z + 8) < 9) || (Math.abs(x + 30) < 6 && Math.abs(z + 6) < 6)) continue; const h = 4 + rnd() * 14; M.bloc(f, x, 0, z, 1.5 + rnd() * 2.5, h, 1.5 + rnd() * 2.5, M_OBSIDIENNE, rnd() * TAU, rnd() < 0.5 ? 3 : 0); }
    // le portique du Recenseur
    for (const s of [-1, 1]) M.bloc(f, s * 5, 0, -34, 2, 10, 2, M_OBSIDIENNE);
    M.bloc(f, 0, 10, -34, 13, 1.6, 2.4, M_OBSIDIENNE);
    // le puits des noms, l'autel devant la Porte
    M.finConstruction();
    const ch = (lx, lz, o) => { const [x, z] = this.at(lx, lz); return M.chose(Object.assign({ x, z, y: f.y, yRef: f.y }, o)); };
    // fleuve de braise et gué d'os
    for (let x = -50; x <= 50; x += 20) ch(x, -44, { y: f.y - 1.3, modele: ENF.lave, l: 8, loin: 140, lumiere: { c: [1.3, 0.45, 0.12], r: 16, y: 1.5, vacille: true } });
    ch(0, -44, { modele: ENF.pont, loin: 100 });
    // le Recenseur, son pupitre, ses braseros
    ch(0, -31.5, { r: Math.PI, modele: ENF.pupitre });
    for (const s of [-3.4, 3.4]) ch(s, -31, { modele: ENF.brasero, lumiere: { c: [1.3, 0.55, 0.15], r: 11, y: 1.7, vacille: true } });
    { const [gx, gz] = this.at(0, -30); M.bete('gardien', gx, gz, { heading: Math.PI, y: f.y, yRef: f.y }); }
    // le champ des âmes : les victimes du personnage, en rangs le long du chemin
    this.ames();
    // la table servie
    ch(32, -8, { r: 0, modele: ENF.table, loin: 90, lumiere: { c: [1.1, 0.5, 0.2], r: 9, y: 2.5, vacille: true } });
    for (let k = 0; k < 6; k++) ch(32 + (k % 2 ? 1.1 : -1.1), -12.6 + k * 1.9, { modele: null, rayon: 0.5, h: 1, reste: true, prendre: () => this.manger() });
    for (let k = 0; k < 3; k++) { const [x, z] = this.at(32 + (k % 2 ? 1.6 : -1.6), -6 + k * 3.5); M.bete('damne', x, z, { assis: true, heading: k % 2 ? -Math.PI / 2 : Math.PI / 2, y: f.y + 0.02, yRef: f.y, v: k }); }
    // le puits des noms
    ch(-30, -6, { modele: ENF.puits, rayon: 1.2, h: 1.2, reste: true, prendre: () => this.puits() });
    // la Porte noire, son autel, les fermiers d'avant
    ch(0, 48.8, { modele: ENF.porte, loin: 160, lumiere: { c: [0.9, 0.15, 0.08], r: 14, y: 6 } });
    ch(0, 44, { modele: ENF.autel, rayon: 1.2, h: 1.2, reste: true, prendre: () => this.porte() });
    this.fermiers();
    // stèles gravées
    const pos = [[-6, -58], [6, -40], [8, -28], [-9, -24], [14, -10], [-15, 2], [22, 12], [-24, 16], [10, 26], [-10, 30], [28, 30], [-4, 40]];
    ENFERS_STELES.forEach(([titre, texte], i) => { const [lx, lz] = pos[i]; ch(lx, lz, { r: Math.atan2(-lx, -(lz + 62)) + Math.PI, v: i, modele: ENF.stele, rayon: 0.7, h: 1.6, reste: true, prendre: () => { this.E().lus[i] = 1; sound.page && sound.page(); ui.read(titre, texte + (i === 8 ? this.listeFermiers() : ''), 'gravé dans la pierre noire'); } }); });
    // os, chaînes qui pendent du ciel rouge, arbres morts
    for (let k = 0; k < 26; k++) { const x = (rnd() - 0.5) * 110, z = -66 + rnd() * 110; if (Math.abs(z + 44) < 6) continue; ch(x, z, { v: k, r: rnd() * TAU, modele: ENF.os }); }
    for (let k = 0; k < 10; k++) { const x = (rnd() - 0.5) * 100, z = -30 + rnd() * 70; ch(x, z, { y: f.y + 3 + rnd() * 6, modele: ENF.chaine, loin: 110 }); }
    for (let k = 0; k < 9; k++) { const x = (rnd() - 0.5) * 110, z = -68 + rnd() * 112; if (Math.abs(x) < 6 || Math.abs(z + 44) < 6) continue; ch(x, z, { v: k, r: rnd() * TAU, modele: ENF.arbre, loin: 110 }); }
    // les damnés qui errent, les chiens de cendre
    for (let k = 0; k < 8; k++) { const [x, z] = this.at((rnd() - 0.5) * 90, -30 + rnd() * 64); M.bete('damne', x, z, { v: k, y: f.y, yRef: f.y }); }
    for (const [lx, lz] of [[36, 4], [-20, 26], [18, 36]]) { const [x, z] = this.at(lx, lz); M.bete('chien_cendre', x, z, { y: f.y, yRef: f.y }); }
    // où l'on arrive
    const [ax, az] = this.at(0, -62);
    this.depart = [ax, f.y + 0.05, az];
    if (!opts.restaurer) { p.pos = this.depart.slice(); p.vel = [0, 0, 0]; p.yaw = Math.PI; p.pitch = 0; }
    if (game.renderer) game.renderer.uploadCover(p.pos[0], p.pos[2]);
    MSON.drone('enfers', [36, 38.4, 54.2], 0.08, 'sawtooth', 200);
  },
  // les âmes des victimes du personnage (et une âme sans nom par meurtre sans nom)
  ames() {
    const s = farm.s, f = this.f();
    const V = (s.dead || []).filter((d) => d.by === 'joueur');
    const autres = Math.min(12, (s.stats && s.stats.autresMeurtres) || 0);
    const L = V.map((d) => ({ nom: d.name + (npcs.byId[d.id] ? ' ' + (npcs.byId[d.id].d.surname || '') : ''), role: npcs.byId[d.id] ? npcs.byId[d.id].d.role : '', jour: d.day, id: d.id, fem: npcs.byId[d.id] ? npcs.byId[d.id].d.gender === 'f' : false }));
    for (let k = 0; k < autres; k++) L.push({ nom: null, jour: null, id: 'inconnu' + k, fem: k % 2 === 1 });
    L.forEach((a, i) => {
      const row = Math.floor(i / 6), col = i % 6, side = col % 2 ? 1 : -1;
      const [x, z] = this.at(side * (4.5 + Math.floor(col / 2) * 3.2), -22 + row * 5.5 + (col % 3) * 0.6);
      mondes.bete('ame', x, z, { nom: a.nom, role: a.role, jour: a.jour, vid: a.id, fem: a.fem, heading: side > 0 ? -Math.PI / 2 : Math.PI / 2, y: f.y + 0.1, yRef: f.y + 0.1, v: i });
    });
  },
  fermiers() {
    const f = this.f(), H = farm.history().filter((h) => h.place === 'les Enfers').slice(-5);
    const L = H.map((h) => ({ nom: (h.name || 'Un fermier') + ', version n° ' + h.run, ligne: `Moi aussi, j’ai cru être le premier. J’ai tenu ${h.day} jour${h.day > 1 ? 's' : ''}, là-haut. Ici, je ne compte plus.` }));
    L.unshift({ nom: 'Anselme Varenne', ligne: 'Tu as eu ma lettre ? Le notaire l’a envoyée comme je le lui avais demandé. Moi aussi, j’ai répondu, une nuit noire, à la voix qui appelait. On m’a donné la pluie à point, le blé haut, l’or au fond du puits. Et puis on m’a demandé de rendre. J’ai rendu dix fois. L’épouvantail, tu l’as bien laissé face au chemin ?' });
    L.forEach((a, i) => { const [x, z] = this.at(-6 + i * 3, 34 + (i % 2) * 1.5); mondes.bete('ame', x, z, { nom: a.nom, ligneFixe: a.ligne, heading: Math.PI, y: f.y + 0.1, yRef: f.y + 0.1, v: i + 3 }); });
  },
  listeFermiers() {
    const H = farm.history().filter((h) => h.place === 'les Enfers');
    if (!H.length) return '\n\nSous le texte, une seule ligne, gravée plus profond : « Anselme Varenne. »';
    return '\n\nSous le texte, des noms :\n' + ['Anselme Varenne'].concat(H.map((h) => `${h.name || 'Un fermier'} (version n° ${h.run}, ${h.day} jour${h.day > 1 ? 's' : ''})`)).join('\n');
  },
  parlerAme(e, force) {
    if (!force && e.parleT > 0) return;
    e.parleT = 1;
    const nom = e.nom || 'Une âme sans nom';
    let t = e.ligneFixe;
    if (!t) { const P = e.nom ? ENFERS_AMES : ENFERS_SANS_NOM; t = P[(hashString(e.vid || String(e.id)) + (e.nParle || 0)) % P.length].replace(/\{jour\}/g, String(e.jour || '')); e.nParle = (e.nParle || 0) + 1; }
    MSON.sanglot(0.35);
    ui.subtitle(nom + (e.role ? ', ' + e.role.toLowerCase() : ''), t, 6);
  },
  parlerDamne(e) { if (Math.random() < 0.6) ui.subtitle('Un damné', pick(ENFERS_DAMNES), 4); },
  manger() {
    const s = farm.s;
    farm.give('cendre', 1); play.flyer('cendre', game.player.eyePos(), 1); sound.eat && sound.eat();
    ui.subtitle('', pick(['(Le pain se change en cendre avant d’arriver à vos lèvres.)', '(Le vin coule gris. De la cendre, jusqu’au fond du verre.)']), 4.5);
    const r = this.E(); r.table = (r.table || 0) + 1;
    if (r.table === 3) setTimeout(() => ui.subtitle('Un damné', '… on a tous essayé… la table est toujours servie… c’est ça, le pire…', 4), 1800);
  },
  puits() {
    const s = farm.s, noms = (s.dead || []).map((d) => d.name).filter(Boolean);
    sound.whisper && sound.whisper(0, 1); strange.glitchT = Math.max(strange.glitchT, 0.4);
    const L = noms.length ? noms.slice(-8) : ['… Anselme…', '… Varenne…'];
    L.forEach((n, i) => setTimeout(() => { sound.whisper && sound.whisper(Math.random() * 2 - 1, 0.7); ui.subtitle('???', '… ' + n + '…', 2.2); }, 600 + i * 1300));
    setTimeout(() => ui.subtitle('???', '… ' + (s.prenom || (s.fem ? 'Jeanne' : 'Jean')) + '…', 3), 900 + L.length * 1300);
  },
  porte() {
    this.E().porte = (this.E().porte || 0) + 1;
    sound.knock && sound.knock(3); game.shakeT = 0.6;
    setTimeout(() => { strange.glitchT = Math.max(strange.glitchT, 1); sound.glitchSnd && sound.glitchSnd(1); sound.whisper && sound.whisper(0, 1); }, 1400);
    ui.read('La Porte noire', 'Sur l’autel, gravé à la main, maladroitement, comme par quelqu’un qui aurait appris à écrire dans le noir :\n\n« Derrière cette porte, la Nuit. Elle ne s’ouvre pas. Elle n’a pas besoin de s’ouvrir. »\n\nVous posez la main sur la pierre. De l’autre côté, quelqu’un frappe trois coups. Puis une voix, très près, tout contre la porte :\n\n« Pas encore. »', 'devant la Porte noire');
  },
  // ------------------------------------------------------------- le Recenseur
  parlerGardien(txt) {
    const s = farm.s, E = this.E(), n = meurtresDuJoueur();
    const Q = [
      ['Qui êtes-vous ?', 'Le treizième. Nous étions treize à monter au col, en cinquante-quatre, pour chercher la petite Morel, perdue dans la neige. Douze sont redescendus. Moi, j’ai continué à descendre. Depuis, je tiens le compte. Quelqu’un doit le tenir.'],
      ['Où suis-je ?', 'Sous la vallée. Sous l’Envers, même, qui n’en est que la doublure. Ici tombe ce que la vallée ne veut plus porter. Les gens d’en haut disent « les Enfers ». Nous, on dit « la cave ».'],
      ['Pourquoi moi ?', `Dix. Tu en as fait descendre ${n}. Au dixième, la Nuit t’a compté parmi les siens. Ce n’est pas une punition. Ce n’est même pas une justice. C’est un compte, et les comptes tombent toujours juste.`],
      ['Pourquoi ne puis-je pas manger ?', 'Parce que tout ce qui nourrit, ici, a été pris à quelqu’un. Tu as assez pris. Tu vas avoir faim, longtemps, et puis tu t’arrêteras. Comme les autres. Comme moi, un jour, peut-être.'],
      ['Comment sortir d’ici ?', 'Par la faim. C’est la seule porte qui s’ouvre. L’autre, la noire, là-bas au fond, ne s’est jamais ouverte, et le jour où elle s’ouvrira, ce ne sera pas pour toi. Ce sera pour tout le monde.'],
      ['Qui est Vesh ?', 'Chut. Ne dis pas ce nom. Pas ici. Ici, il entend même ce qu’on pense de lui.'],
      ['Et l’enfant que vous cherchiez ?', 'Je ne l’ai pas trouvée. Ni en haut, ni en bas. Certains soirs, je crois l’entendre de l’autre côté de la Porte. Alors je compte plus fort, pour ne plus l’entendre.'],
      ['Montrez-moi le registre.', null],
    ];
    const opts = Q.map(([q, a], i) => ({ label: q, fn: () => {
      E.q = E.q || {}; E.q[i] = 1;
      if (i === 5) { strange.glitchT = Math.max(strange.glitchT, 1.2); sound.glitchSnd && sound.glitchSnd(1.2); sound.whisper && sound.whisper(0, 1); }
      if (a) this.parlerGardien(a); else this.registre();
    } }));
    if (!farm.count('page_registre') && E.q && Object.keys(E.q).length >= 5) opts.push({ label: 'Puis-je garder une page ?', fn: () => { farm.give('page_registre', 1); this.parlerGardien('Prends. C’est la tienne. Elle ne te servira à rien, mais c’est la tienne. On a le droit de tenir son propre nom, à la fin.'); } });
    opts.push({ label: 'Partir', fn: () => ui.close() });
    ui.choice('Le Recenseur', txt || 'Un homme très grand, en redingote, les yeux blancs, tient un registre ouvert sur un pupitre de pierre noire. Il ne lève pas la tête. « Te voilà. Je t’ai inscrit au dixième. Assieds-toi, si tu veux. Il n’y a pas de chaises. »', opts);
  },
  registre() {
    const s = farm.s, V = (s.dead || []).filter((d) => d.by === 'joueur'), autres = (s.stats && s.stats.autresMeurtres) || 0;
    const L = V.map((d) => `— ${d.name}${npcs.byId[d.id] ? ' ' + (npcs.byId[d.id].d.surname || '') + ', ' + (npcs.byId[d.id].d.role || '').toLowerCase() : ''} : descendu(e) le jour ${d.day}.`);
    if (autres) L.push(`— ${autres} autre${autres > 1 ? 's' : ''}, dont tu ne savais pas le nom. Moi, je le sais.`);
    ui.read('Le registre du Recenseur', `Une écriture fine, patiente, la même depuis des pages et des pages.\n\n${L.join('\n')}\n\nEt, tout en bas, d’une encre qui n’a pas encore séché :\n\n— ${s.prenom || 'Le fermier'}, de la vieille ferme, version n° ${s.run}. Descendu(e) le jour ${(this.E().jour || s.day)}. En attente.`, 'le Recenseur');
  },
  // ------------------------------------------------------------- chaque image : la faim
  update(dt, playing) {
    const p = game.player, E = this.E();
    if (playing && !cine.on) { p.food = Math.max(0, p.food - dt * 0.06); if (p.food <= 0) { p.hp -= dt * 0.15; if (p.hp <= 0) game.die('Mort de faim'); } }
    const f = p.food;
    const seuils = [[60, '(La faim. Elle est venue plus vite qu’en haut.)'], [35, '(Vous regardez les chiens de cendre en pensant à de la viande.)'], [15, '(Vous ne tenez plus debout que par habitude.)'], [0.5, '(La faim a fini de compter. Il ne reste que le corps, et le corps s’arrête.)']];
    for (const [s0, t] of seuils) if (f < s0 && !(E.faimDit || {})[s0]) { E.faimDit = E.faimDit || {}; E.faimDit[s0] = 1; ui.subtitle('', t, 5); break; }
    // tomber dans le fleuve de braise
    const f0 = this.f(), lz = p.pos[2] - f0.z;
    if (p.pos[1] < f0.y - 1.4 && Math.abs(lz + 44) < 5) {
      mondes.blesser(10, null, 'Tombé dans le fleuve de braise'); sound.splashBig && sound.splashBig();
      const [x, z] = this.at(clamp(p.pos[0] - f0.x, -50, 50), lz < -44 ? -51 : -37);
      p.pos = [x, f0.y + 0.05, z]; p.vel = [0, 0, 0];
      ui.subtitle('', '(Le feu ne brûle pas ce qui est déjà mort. Vous êtes de nouveau sur la rive.)', 4);
    }
    // ambiance : bourdon, crépitements, gémissements lointains, chaînes, cendres qui montent
    this.sonT = (this.sonT || 3) - dt;
    if (this.sonT <= 0) {
      this.sonT = 2.5 + Math.random() * 5;
      const r = Math.random();
      if (r < 0.35) MSON.crepite(0.7);
      else if (r < 0.55) MSON.gemissement(0.35, Math.random() * 2 - 1);
      else if (r < 0.68) sound.chain && sound.chain();
      else if (r < 0.8) sound.whisper && sound.whisper(Math.random() * 2 - 1, 0.5);
      else if (r < 0.88) MSON.cri(0.12, 0.6, 2, Math.random() * 2 - 1);
      else sound.rumble && sound.rumble();
    }
    if (playing && Math.random() < dt * 14) { const a = Math.random() * TAU, d = 2 + Math.random() * 18; particles.spawn(p.pos[0] + Math.cos(a) * d, p.pos[1] + Math.random() * 2, p.pos[2] + Math.sin(a) * d, (Math.random() - 0.5) * 0.4, 0.8 + Math.random() * 0.8, (Math.random() - 0.5) * 0.4, [1, 0.45, 0.12, 1], 0.04, 4, -0.1, true); }
  },
  sortir() { MSON.stopTout(); const E = this.E(); E.actif = 0; },
  reprendre(S) {
    const E = this.E(), p = game.player;
    mondes.entrer('enfers', { restaurer: true });
    if (E.pos) { p.pos = E.pos.slice(); p.yaw = E.yaw || 0; p.vel = [0, 0, 0]; }
    if (game.renderer) game.renderer.uploadCover(p.pos[0], p.pos[2]);
    setTimeout(() => ui.subtitle('', '(Vous êtes toujours à la cave. La faim aussi.)', 4), 1500);
  },
};

// ---------------------------------------------------------------- la descente
const enfers = {
  enCours: false,
  // meurt-on pour de bon, ou descend-on ?
  intercepter(cause) {
    const s = farm.s;
    if (!s || s.over || game.kind !== 'farm') return false;
    if (mondes.cur === 'enfers') {
      if (cause === 'Mort de faim') { game.die('Mort de faim aux Enfers'); return true; }
      return false;
    }
    if (this.enCours) return true;
    const E = MONDES.enfers.E();
    if (E.fait || meurtresDuJoueur() < 10) return false;
    this.enCours = true;
    this.descendre(cause).catch((e) => { console.error(e); this.enCours = false; game.sleeping = false; });
    return true;
  },
  async descendre(cause) {
    const s = farm.s, p = game.player, E = MONDES.enfers.E();
    E.fait = 1; E.cause = cause; E.jour = s.day;
    E.corps = { pos: p.pos.slice(), yaw: p.yaw, pitch: p.pitch };
    p.hp = 100; play.hurtFlash = 0; corps.C().saigne = 0; corps.soignerJambe(true);
    if (typeof pilules !== 'undefined') { const P = pilules.P(); P.phase = null; P.manque = 0; }
    if (mondes.cur) mondes.sortir({ garderPos: true });
    game.sleeping = true;
    ui.close(true);
    sound.heartbeat(1);
    $('#fade').style.background = '#1a0000';
    await ui.fade(true, '', 1400);
    $('#fade-text').textContent = 'Vous mourez.';
    await new Promise((r) => setTimeout(r, 2400));
    $('#fade').style.background = '#000';
    $('#fade-text').textContent = 'Et puis, vous ne mourez pas.';
    await new Promise((r) => setTimeout(r, 2600));
    mondes.S().retour = { pos: E.corps.pos.slice(), yaw: E.corps.yaw, pitch: E.corps.pitch };
    mondes.entrer('enfers', {});
    p.hp = 100;
    $('#fade-text').textContent = '';
    game.sleeping = false;
    const M = MONDES.enfers, f = M.f(), A = M.at(0, -62), G = M.at(0, -30), C = M.at(0, -10), P0 = M.depart;
    const plans = [
      { dur: 5.5, de: { pos: [A[0] + 30, f.y + 40, A[1] - 20], look: [G[0], f.y + 2, G[1]] }, a: { pos: [A[0] + 8, f.y + 14, A[1] - 6], look: [G[0], f.y + 2, G[1]] }, texte: 'Il y a un endroit, sous la vallée, où l’on descend quand on a trop pris.', debut: () => { $('#fade').style.background = ''; ui.fade(false, '', 1500); MSON.cri(0.25, 0.5, 3, 0); } },
      { dur: 5, orbite: { c: [G[0], f.y + 2.2, G[1]], r: 6.5, h: 1.2, a0: Math.PI * 0.8, a1: Math.PI * 1.2, look: [G[0], f.y + 2.6, G[1]] }, texte: 'Te voilà. Je t’attendais depuis le dixième.', qui: 'Le Recenseur' },
      { dur: 4.5, de: { pos: [C[0] - 14, f.y + 5, C[1] - 16], look: [C[0], f.y + 1.5, C[1]] }, a: { pos: [C[0] + 10, f.y + 4, C[1] - 18], look: [C[0], f.y + 1.5, C[1]] }, texte: 'Ils sont tous là. Tous ceux que vous avez fait descendre.' },
      { dur: 3.5, de: { pos: [P0[0], P0[1] + 1.62, P0[2]], yaw: Math.PI, pitch: 0.05 }, texte: '(Vous avez faim. Déjà.)' },
    ];
    await cine.jouer(plans, { passer: true });
    $('#fade').style.background = '';
    if (game.mode === 'play') game.lock();
    this.enCours = false;
    if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-30, 'les Enfers');
    farm.save();
  },
};
HOOKS.death.push((cause) => enfers.intercepter(cause));
// aux Enfers, rien ne se mange : tout devient cendre (avant tout autre usage des objets)
{
  const cendre = (id) => {
    if (mondes.cur !== 'enfers' || cine.on) return false;
    const it = ITEMS[id];
    if (!it || !(it.food || it.heal || it.potion || it.drink || it.boisson || it.cat === 'potion' || it.pilule)) return false;
    if (!farm.take(id, 1)) return true;
    farm.give('cendre', 1); play.cool = 0.9; sound.eat && sound.eat();
    ui.subtitle('', pick(['(À peine dans la bouche, ça devient de la cendre.)', '(Vous avalez. C’est de la cendre. Vous avez encore plus faim.)']), 4);
    return true;
  };
  mondes.apresInstall.push(() => {
    HOOKS.primary.unshift((eye, basis, held, it, id) => (held ? false : cendre(id)));
    HOOKS.secondary.unshift((eye, basis, it, id) => cendre(id));
  });
  const _eat = play.eat.bind(play);
  play.eat = function (id) { if (cendre(id)) return; return _eat(id); };
}
