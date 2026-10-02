// ============================================================================
//  LE HASARD DE LA VALLÉE (5) : LES ROUTES — dix événements.
//  - colporteur_blesse : un colporteur assis au bord du chemin, la cheville
//    tordue (un bandage, une attelle, ou une épaule) ;
//  - diligence_renversee : une voiture versée dans le fossé (on aide à la
//    redresser) ;
//  - pelerins : des pèlerins demandent leur chemin (du pain : ils prient pour vous) ;
//  - roulottes_nuit : des voyageurs font halte au bord de la route, un feu, une
//    vielle (on s'assoit au feu) ;
//  - remouleur : le rémouleur passe avec sa meule (il affûte les outils) ;
//  - soldats : une compagnie passe au pas, tambour en tête (on leur vend des vivres) ;
//  - charrette_embourbee : après la pluie, une charrette enlisée (on pousse) ;
//  - petit_savoyard : un petit Savoyard, sa vielle et sa marmotte ;
//  - transhumance : un troupeau monte vers l'estive, sonnailles et chiens ;
//  - peintre : un peintre anglais à son chevalet (il donne un croquis).
// ============================================================================
defItem('croquis_anglais', 'Croquis d’un peintre', 'tresor', 18, ['carte', '#e8dcc0'], { desc: 'Une feuille de carnet, à la mine de plomb : un paysage de la vallée, très juste. Dans un coin, une silhouette que vous n’aviez pas remarquée en vrai. Signé d’initiales anglaises.' });

// un point de chemin hors des villages, devant le joueur si possible ; null sinon
function hfCheminDevant(r0, r1) {
  const p = game.player, f = cameraBasis(p.yaw, 0).f;
  const R1 = hfRoute(p.pos[0] + f[0] * (r0 + r1) / 2, p.pos[2] + f[2] * (r0 + r1) / 2, 0, (r1 - r0) / 2 + 10, { horsVillage: true, test: (n) => { const d = Math.hypot(n.x - p.pos[0], n.z - p.pos[2]); return d >= r0 && d <= r1; } });
  return R1 || hfRoute(p.pos[0], p.pos[2], r0, r1, { horsVillage: true });
}
// le côté de la route (à droite du sens dir, à d pas)
const hfBord = (R, d) => ({ x: R.x + Math.cos(R.dir) * d, z: R.z - Math.sin(R.dir) * d });

// ---------------------------------------------------------------- 1. le colporteur blessé
hfDef('colporteur_blesse', {
  cat: 'routes', poids: 1.2, premier: 4, ecart: 10, duree: 6, fenetre: 4,
  peut: (c) => !c.P.storm,
  heure: (c, r) => 9 + r * 7,
  pret: (X) => X.route && X.dehors && !X.ville && !X.hameau,
  lancer(E) {
    const R = hfCheminDevant(25, 60);
    if (!R) return false;
    const P = hfBord(R, 2.2);
    E.x = P.x; E.z = P.z;
    E.c = hfPerso(hfLook('roulier', { top: '#6a4a2a', hat: 'chapeau', beard: 'courte' }), P.x, P.z, { nom: 'Le colporteur', voix: 0.95, loin: 90, vit: 0.9 });
    E.c.h = R.dir + Math.PI / 2; E.c.pose = { sit: 1, lookP: 0.3 };
    E.etat = 'assis'; E.geintT = 3;
    E.sac = { x: P.x + Math.sin(R.dir) * 0.9, z: P.z + Math.cos(R.dir) * 0.9 };
    hasardF.cible(E, { pos: () => [E.c.x, E.c.y + 0.7, E.c.z], r: 2.6, lab: 'Lui porter secours', vis: () => E.etat === 'assis', use: () => hfColporteurSoin(E) });
  },
  maj(E, dt) {
    const C = E.c, d = hfDistJ(C.x, C.z);
    if (E.etat === 'assis') {
      E.geintT -= dt;
      if (E.geintT <= 0) { E.geintT = 8 + Math.random() * 6; if (d < 25) hfDit(C, pick(['Aïe… Saleté de pierre.', 'Hé, l’ami ! Vous n’auriez pas une minute ?', 'Ma cheville… elle a doublé de volume.']), 3); }
      if (!E.note && d < 20) { hasardF.noter(E, 'Un colporteur était assis au bord du chemin, la cheville tordue, sa balle renversée dans l’herbe.'); hfPense('(Un colporteur, assis dans le fossé, sa balle éventrée à côté de lui.)', 3.5); }
      if (npcs.hour() > 20) E.fini = 'nuit';
    } else if (E.etat === 'part') { C.pose = {}; if (hfMarche(C, dt)) E.fini = 'fin'; }
  },
  dessin(E, buf, sbuf, cam, t) {
    hfDessine(E.c, buf, sbuf, cam, t);
    if (E.etat === 'assis') { PE.buf = buf; PE.fl = 0; PE.frame(E.sac.x, hfSol(E.sac.x, E.sac.z), E.sac.z, 0.4, 1); PE.bx(0, 0, 0, 0.6, 0.45, 0.4, [0.5, 0.38, 0.24], TL.leather); PE.bx(0.4, 0, 0.3, 0.2, 0.06, 0.14, [0.8, 0.2, 0.2], TL.cloth); PE.bx(-0.3, 0, 0.4, 0.12, 0.05, 0.2, [0.85, 0.82, 0.6], TL.paper); }
  },
  fin(E, raison) { if (raison === 'nuit' && E.note) hasardF.noter('colporteur_blesse', 'Le colporteur blessé, au bord du chemin… Un roulier l’a ramassé à la nuit, dit-on.'); },
  txt: {
    journal: 'Un colporteur blessé au bord du chemin.',
    apres: ['Il paraît qu’un colporteur s’est tordu la cheville sur la route. Ils marchent trop, ces gens-là. Avec ce qu’ils portent…', 'Les colporteurs portent toute leur boutique sur le dos. Le jour où ils tombent, ils tombent avec.'],
  },
});
function hfColporteurSoin(E) {
  const C = E.c;
  const soin = ['attelle', 'bandage'].find((k) => farm.count(k) > 0);
  if (soin) {
    farm.take(soin, 1);
    hfDit(C, soin === 'attelle' ? 'Une attelle ! Vous êtes médecin, ou quoi ? Tenez, prenez ça. Une pièce ancienne : on me l’a donnée pour un ruban, je vous la donne pour une jambe.' : 'Ah, ça serre… mais ça tient. Tenez. Une pièce ancienne. Ça vaut plus que ce que j’ai vendu de la semaine.', 6);
    farm.give('vieille_piece', 1); play.flyer && play.flyer('vieille_piece', [C.x, C.y + 1, C.z], 1);
    hasardF.noter('colporteur_blesse', 'Un colporteur s’était tordu la cheville au bord du chemin. Je lui ai bandé le pied ; il m’a donné une pièce ancienne.');
  } else {
    hfDit(C, 'Juste… aidez-moi à me relever. Voilà. Je boiterai jusqu’au prochain village. Merci, l’ami.', 5);
    hasardF.noter('colporteur_blesse', 'Un colporteur s’était tordu la cheville au bord du chemin. Je l’ai aidé à se relever ; il est reparti en boitant.');
  }
  hasardF.bienfait('colporteur');
  E.etat = 'part';
  const R = hfRoute(C.x, C.z, 0, 30);
  if (R && R.voisin) hfAller(C, [[R.x, R.z], [R.voisin.x, R.voisin.z], [R.voisin.x + (R.voisin.x - R.x) * 3, R.voisin.z + (R.voisin.z - R.z) * 3]], 0.7);
  else hfAller(C, [[C.x + 30, C.z]], 0.7);
}

// ---------------------------------------------------------------- 2. la diligence renversée
hfDef('diligence_renversee', {
  cat: 'routes', poids: 1, premier: 5, ecart: 14, duree: 4, fenetre: 3,
  peut: (c) => !c.P.storm,
  heure: (c, r) => 10 + r * 6,
  pret: (X) => X.route && X.dehors && !X.ville && !X.hameau,
  lancer(E) {
    const R = hfCheminDevant(30, 70);
    if (!R) return false;
    const P = hfBord(R, 3.2);
    E.x = P.x; E.z = P.z; E.dir = R.dir; E.y = hfSol(P.x, P.z);
    E.cocher = hfPerso(hfLook('roulier', { top: '#2a3a5a', hat: 'chapeau', hatCol: '#1a1a1a' }), P.x - Math.sin(R.dir) * 3, P.z - Math.cos(R.dir) * 3, { nom: 'Le cocher', voix: 0.85, loin: 100 });
    E.dame = hfPerso({ skin: '#ecc6a8', hair: '#3a2418', hairStyle: 'chignon', dress: true, top: '#5a2a3a', bottom: '#5a2a3a', hat: 'voile', hatCol: '#3a1a2a' }, P.x + Math.cos(R.dir) * 2.2, P.z - Math.sin(R.dir) * 2.2, { nom: 'Une voyageuse', voix: 1.3, loin: 100 });
    E.dame.pose = { sit: 1 };
    E.monsieur = hfPerso(hfLook('bourgeois'), P.x + Math.cos(R.dir) * 2.6 + Math.sin(R.dir) * 1.4, P.z - Math.sin(R.dir) * 2.6 + Math.cos(R.dir) * 1.4, { nom: 'Un voyageur', voix: 0.9, loin: 100 });
    E.chevaux = [-0.8, 0.8].map((s) => { const F = hfBete('horse', P.x + Math.sin(R.dir) * 4.5 + Math.cos(R.dir) * s, P.z + Math.cos(R.dir) * 4.5 - Math.sin(R.dir) * s, { v: s < 0 ? 1 : 4, loin: 100 }); F.h = R.dir; return F; });
    for (const F of [E.cocher, E.monsieur]) F.h = Math.atan2(E.x - F.x, E.z - F.z);
    E.etat = 'verse'; E.pousse = 0; E.criT = 2; E.hennT = 4; E.t1 = 0;
    hasardF.cible(E, { pos: () => [E.x, E.y + 0.9, E.z], r: 3.4, cos: 0.4, lab: 'Aider à redresser la voiture', vis: () => E.etat === 'verse', use() {
      E.pousse++; sound.shovelHit && sound.shovelHit(); game.shakeT = Math.max(game.shakeT || 0, 0.15);
      if (E.pousse === 1) hfDit(E.cocher, 'À la une… à la deux… Poussez, nom d’un chien !', 3);
      if (E.pousse >= 4) {
        E.etat = 'debout'; E.t1 = 0;
        sound.door && sound.door(true);
        hfDit(E.cocher, 'Elle est debout ! Merci, l’ami. Sans vous, on dormait dans le fossé. Tenez, pour boire à ma santé, et pas un mot à la compagnie.', 5.5);
        farm.earn(10); sound.coin && sound.coin();
        hasardF.bienfait('diligence');
        hasardF.noter('diligence_renversee', 'Une voiture versée dans le fossé, sur la route. J’ai aidé le cocher à la redresser ; il m’a payé à boire, sans boire.');
      }
    } });
  },
  maj(E, dt) {
    const d = hfDistJ(E.x, E.z);
    E.hennT -= dt;
    if (E.hennT <= 0) { E.hennT = 7 + Math.random() * 6; if (d < 80) hfSon([E.chevaux[0].x, E.chevaux[0].y + 1.6, E.chevaux[0].z], () => sound.animal && sound.animal('horse', 0, 0.9)); }
    if (E.etat === 'verse') {
      E.criT -= dt;
      if (E.criT <= 0) { E.criT = 7 + Math.random() * 5; if (d < 30) hfDit(pick([E.cocher, E.monsieur, E.dame]), pick(['Une ornière ! Une ornière grande comme une tombe !', 'Mon chapeau… où est mon chapeau ?', 'Nous allions à Valmont. Nous n’irons nulle part.', 'Vous, là ! Aidez-nous, par pitié !']), 3); }
      E.cocher.pose = { lean: 0.2, reach: 0.4 };
      if (!E.note && d < 35) { hasardF.noter(E, 'Une voiture de voyageurs versée dans le fossé, roues en l’air, les chevaux dételés qui tremblaient.'); hfPense('(Une voiture renversée, les roues en l’air. Des malles dans l’herbe.)', 3.5); }
      if (npcs.hour() > 19.5) E.fini = 'fin';
    } else {
      E.t1 += dt;
      E.dame.pose = {}; E.cocher.pose = {};
      if (E.t1 > 12) for (const F of [E.cocher, E.dame, E.monsieur, ...E.chevaux]) F.cache = true;
      if (E.t1 > 13) E.fini = 'fin';
    }
  },
  dessin(E, buf, sbuf, cam, t) {
    for (const F of [E.cocher, E.dame, E.monsieur, ...E.chevaux]) hfDessine(F, buf, sbuf, cam, t);
    if (E.t1 > 12 && E.etat === 'debout') return;
    hfModele(buf, E.etat === 'verse' ? 'charrette_renversee' : 'charrette', E.x, E.y, E.z, E.dir + Math.PI / 2, 1.25);
    if (E.etat === 'verse') { PE.buf = buf; PE.fl = 0; PE.frame(E.x + Math.cos(E.dir) * 1.8, hfSol(E.x, E.z), E.z - Math.sin(E.dir) * 1.8, 0.7, 1); PE.bx(0, 0, 0, 0.9, 0.5, 0.55, [0.45, 0.3, 0.18], TL.leather); PE.bx(1.1, 0, 0.6, 0.6, 0.4, 0.4, [0.35, 0.3, 0.25], TL.wood); }
  },
  txt: {
    journal: 'Une voiture renversée dans le fossé, sur la route.',
    apres: ['La voiture de Valmont a versé, hier, sur la route. Personne de mort. Un chapeau perdu, dit-on.', 'Les routes sont si mauvaises que même les chevaux se plaignent. Le maire dit que le département va les refaire. Il le dit depuis vingt ans.'],
  },
});

// ---------------------------------------------------------------- 3. les pèlerins
const HF_CANTIQUE = [[67, 1], [67, 1], [69, 1], [71, 2], [69, 1], [67, 1], [66, 1], [67, 3], [null, 1], [71, 1], [72, 1], [74, 2], [72, 1], [71, 1], [69, 2], [67, 3]];
hfDef('pelerins', {
  cat: 'routes', poids: 1.1, premier: 4, ecart: 9, duree: 4, fenetre: 3,
  peut: (c) => !c.pluieA(8, 17),
  heure: (c, r) => 8.5 + r * 7,
  pret: (X) => X.route && X.dehors && !X.ville,
  lancer(E) {
    const p = game.player.pos, w = game.world;
    const R = hfRoute(p[0], p[2], 30, 60, { horsVillage: true });
    if (!R) return false;
    const L = w.lm.abbaye || w.lm.chapelle || w.lm.eglise;
    E.but = L ? L.name : 'la chapelle';
    const pts = [[R.x, R.z], ...hfTrajet(R.x, R.z, p[0], p[2]).slice(0, 6)];
    const lo = pts[pts.length - 1];
    if (L) for (const q of hfTrajet(lo[0], lo[1], L.x, L.z).slice(0, 10)) pts.push(q);
    const M = [];
    const look = (k) => hfLook(k, { top: '#5a5048', bottom: '#4a4038', hat: 'chapeau', hatCol: '#4a4034', held: 'canne', coat: true });
    for (let i = 0; i < 4; i++) M.push(hfPerso(look(i === 2 ? 'vieux' : i % 2 ? 'paysanne' : 'paysan'), R.x, R.z, { rang: i, loin: 110, voix: 0.85 + i * 0.12, nom: i === 0 ? 'Un pèlerin' : '', acc: hfCoquille }));
    E.C = hfCortege(M, pts, 1.6, 0.85);
    E.chantT = 1; E.parle = false; E.donne = false;
    hasardF.cible(E, { pos: () => { const F = E.C.membres[0]; return [F.x, F.y + 1.3, F.z]; }, r: 3, lab: 'Leur donner du pain', vis: () => !E.donne && ['pain', 'brioche', 'galette'].some((k) => farm.count(k) > 0), use() {
      const k = ['pain', 'brioche', 'galette'].find((x) => farm.count(x) > 0);
      farm.take(k, 1); E.donne = true;
      hfDit(E.C.membres[0], `Dieu vous le rende. Nous prierons pour vous, à ${E.but}. Pour vous, et pour ceux que vous avez perdus.`, 5);
      BUFF.add && BUFF.add('chance', 8);
      hasardF.bienfait('pelerins');
      hasardF.noter('pelerins', `Des pèlerins m’ont demandé le chemin de ${E.but}. Je leur ai donné du pain ; ils ont promis de prier pour moi.`);
    } });
  },
  maj(E, dt) {
    const C = E.C, F0 = C.membres[0], d = hfDistJ(F0.x, F0.z);
    // ils s'arrêtent un moment quand on les croise
    const arret = d < 5 && !E.parle;
    hfCortegeMaj(C, dt, arret);
    if (arret) { E.parle = true; hfFace(F0, game.player.pos[0], game.player.pos[2], 2); hfDit(F0, `Bonjour à vous. C’est bien par ici, ${E.but} ? Nous marchons depuis la Saint-Jean.`, 5); hasardF.noter(E, `Des pèlerins, sur la route, en chemin vers ${E.but}, le bâton à la main et la coquille au chapeau.`); }
    E.chantT -= dt;
    if (E.chantT <= 0) { let du = 0; if (d < 90) hfSon([F0.x, F0.y + 1.5, F0.z], () => { du = sound.hfAir ? sound.hfAir(HF_CANTIQUE, { bpm: 76, timbre: 'voix', voyelle: 'a', vol: 0.028 }) : 0; if (sound.hfAir) sound.hfAir(HF_CANTIQUE.map(([m, x]) => [m === null ? null : m - 12, x]), { bpm: 76, timbre: 'voix', voyelle: 'o', vol: 0.02 }); }); E.chantT = (du || 10) + 6; }
    if (C.fini) E.fini = 'fin';
  },
  dessin(E, buf, sbuf, cam, t) { for (const F of E.C.membres) hfDessine(F, buf, sbuf, cam, t); },
  txt: {
    journal: 'Des pèlerins sur la route.',
    apres: ['Des pèlerins sont passés, hier. Ils allaient à l’abbaye. Ils vont toujours quelque part, eux.', 'On dit qu’un pèlerin qui vous bénit, ça vaut trois messes. Le curé dit que non. Le curé est jaloux.'],
  },
});
// la coquille au chapeau
function hfCoquille(F, buf) { PE.buf = buf; PE.fl = 0; PE.frame(F.x, F.y, F.z, F.h, F.s || 1); PE.box(0, 1.84, 0.14, 0.12, 0.1, 0.03, [1.15, 1.05, 0.9], TL.bone); }

// ---------------------------------------------------------------- 4. la halte des voyageurs, la nuit
const HF_AIR_VIELLE = [[69, 1], [72, 0.5], [71, 0.5], [69, 1], [67, 1], [69, 1.5], [64, 0.5], [67, 1], [69, 2], [72, 1], [74, 0.5], [72, 0.5], [71, 1], [69, 1], [67, 1.5], [64, 0.5], [69, 3]];
hfDef('roulottes_nuit', {
  cat: 'routes', poids: 1.1, premier: 4, ecart: 10, duree: 5, fenetre: 2.5,
  peut: (c) => !c.pluieA(19, 24),
  heure: (c, r) => 20.3 + r * 2,
  pret: (X) => X.route && X.dehors && !X.ville && !X.hameau && !X.ferme,
  lancer(E) {
    const R = hfCheminDevant(25, 60);
    if (!R) return false;
    const P = hfBord(R, 7);
    if (!hfLibre(P.x, P.z, 3, { arbres: false })) { const Q = hfPoint(R.x, R.z, 6, 12, { r: 3 }); if (!Q) return false; P.x = Q.x; P.z = Q.z; }
    E.x = P.x; E.z = P.z; E.y = hfSol(P.x, P.z); E.dir = R.dir;
    E.gens = [];
    const L = [['roulier', { top: '#7a2a2a', hat: 'chapeau', beard: 'moustache' }, 'Le vielleux', 0.9], ['paysanne', { top: '#2a4a6a', hat: undefined, hairStyle: 'long', hair: '#1a1210', apron: '#c8a030' }, 'Une voyageuse', 1.25], ['vieille', { top: '#4a2a3a', hat: 'voile', hatCol: '#6a2a2a' }, 'La vieille', 1.1], ['enfant', {}, '', 1.6]];
    L.forEach(([k, o, nom, v], i) => { const a = i / L.length * TAU + 0.4, F = hfPerso(hfLook(k, o), P.x + Math.sin(a) * 1.8, P.z + Math.cos(a) * 1.8, { nom, voix: v, loin: 110 }); F.h = Math.atan2(P.x - F.x, P.z - F.z); F.pose = { sit: 1 }; E.gens.push(F); });
    E.chien = hfBete('dog', P.x + 2.6, P.z - 1.2, { v: 3, loin: 80 }); E.chien.pose = { lie: 1 };
    E.airT = 1; E.feuT = 0; E.assis = false;
    hasardF.cible(E, { pos: () => [E.x, E.y + 0.6, E.z], r: 3.5, cos: 0.4, lab: 'S’asseoir au feu', vis: () => !E.assis, use() {
      E.assis = true;
      BUFF.add && BUFF.add('chaleur', 4);
      const p = game.player; p.food = Math.min(100, (p.food || 0) + 12);
      hfDit(E.gens[2], pick(['Assieds-toi, assieds-toi. Mange. Le feu est à tout le monde.', 'On ne demande rien aux gens qui s’assoient au feu. On ne leur dit pas tout, non plus.']), 4.5);
      setTimeout(() => { if (hasardF.actifs.roulottes_nuit === E) hfDit(E.gens[2], pick(['Dans cette vallée, il y a un endroit où les morts lavent leur linge. Tu le sais, ça ? Évite-le, la nuit.', 'Il y a longtemps, on passait par le col sans s’arrêter. Maintenant, on s’arrête. On ne sait plus pourquoi on avait peur.', 'Ta main. Montre. … Non, rien. Une ligne qui hésite. Ça se soigne.']), 6); }, 6000);
      hasardF.noter('roulottes_nuit', 'Une nuit, des voyageurs faisaient halte au bord de la route. Je me suis assis à leur feu ; on m’a donné de la soupe, et une histoire que je n’ai pas toute comprise.');
    } });
  },
  maj(E, dt) {
    const d = hfDistJ(E.x, E.z);
    E.airT -= dt;
    if (E.airT <= 0) { let du = 0; if (d < 90) hfSon([E.gens[0].x, E.gens[0].y + 1.1, E.gens[0].z], () => { du = sound.hfAir ? sound.hfAir(HF_AIR_VIELLE, { bpm: 104, timbre: 'vielle', vol: 0.035, bourdon: [45, 52], chien: true }) : 0; }); E.airT = (du || 10) + 5 + Math.random() * 6; }
    E.feuT -= dt;
    if (E.feuT <= 0) { E.feuT = 2.5; if (d < 40) hfSon([E.x, E.y + 0.4, E.z], () => sound.hfFeu && sound.hfFeu(0.35)); }
    if (Math.random() < dt * 8) particles.spawn(E.x + (Math.random() - 0.5) * 0.5, E.y + 0.4, E.z + (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.4, 1.4 + Math.random(), (Math.random() - 0.5) * 0.4, [1.2, 0.6, 0.2, 1], 0.06, 0.7, -0.4, true);
    E.gens[0].pose = { sit: 1, reach: 0.4 + Math.sin(game.time * 5) * 0.08 };
    if (!E.note && d < 60) { hasardF.noter(E, 'Une nuit, au bord de la route, un feu, une roulotte, et une vielle qui jouait un air ancien.'); hfPense('(Un feu au bord de la route. Une vielle, des voix.)', 3); }
    if (npcs.hour() > 5 && npcs.hour() < 18) E.fini = 'fin';
  },
  dessin(E, buf, sbuf, cam, t) {
    hfModele(buf, 'feu_camp', E.x, E.y, E.z, 0, 1);
    hfModele(buf, 'tente', E.x - Math.sin(E.dir) * 4.5, hfSol(E.x - Math.sin(E.dir) * 4.5, E.z - Math.cos(E.dir) * 4.5), E.z - Math.cos(E.dir) * 4.5, E.dir, 1.1);
    for (const F of E.gens) hfDessine(F, buf, sbuf, cam, t);
    hfDessine(E.chien, buf, sbuf, cam, t);
    PE.buf = buf; PE.fl = FX_EMIT; PE.frame(E.x, E.y + 0.25, E.z, t * 2, 1); PE.box(0, 0, 0, 0.3, 0.35 + Math.sin(t * 9) * 0.06, 0.3, [1.4, 0.6, 0.15], TL.flame); PE.fl = 0;
  },
  lum(E, eye) { return [{ x: E.x, y: E.y + 0.8, z: E.z, r: 10, c: [1.1, 0.6, 0.25], d: Math.hypot(E.x - eye[0], E.z - eye[2]) }]; },
  txt: {
    journal: 'Des voyageurs ont fait halte au bord de la route, une nuit.',
    apres: ['Des voyageurs ont campé au bord de la route, cette nuit. Au matin, plus rien : les cendres, et une poule de moins chez le meunier.', 'Ceux qui vont sur les routes, on les accuse de tout. Ils ont bon dos. Ils ont surtout bon pied.'],
  },
});

// ---------------------------------------------------------------- 5. le rémouleur
hfDef('remouleur', {
  cat: 'routes', poids: 1.1, premier: 3, ecart: 9, duree: 3, fenetre: 3,
  peut: (c) => !c.pluieA(9, 16),
  heure: (c, r) => 9 + r * 6,
  pret: (X) => (X.route || X.ferme || X.ville || X.hameau) && X.dehors,
  lancer(E) {
    const p = game.player.pos, R = hfRoute(p[0], p[2], 12, 35) || hfRoute(p[0], p[2], 5, 60);
    if (!R) return false;
    E.x = R.x; E.z = R.z;
    E.r = hfPerso(hfLook('vieux', { top: '#5a4a3a', hat: 'chapeau', hatCol: '#2a2420', apron: '#6a5030', held: undefined, beard: 'courte' }), R.x, R.z, { nom: 'Le rémouleur', voix: 0.9, loin: 90 });
    E.r.h = R.dir;
    E.meule = { x: R.x + Math.cos(R.dir) * 1.1, z: R.z - Math.sin(R.dir) * 1.1, r: R.dir };
    E.appelT = 0.5; E.affute = false; E.meuleT = 0;
    hasardF.cible(E, { pos: () => [E.r.x, E.r.y + 1.2, E.r.z], r: 3, lab: 'Faire affûter vos outils (6 pièces)', vis: () => !E.affute, use() {
      if (!farm.pay(6)) { hfDit(E.r, 'Six sous, mon brave. Le fil, ça ne se donne pas.', 3); return; }
      E.affute = true; E.meuleT = 6;
      hfDit(E.r, 'Donnez. … Voilà. Elles couperaient un cheveu en quatre. Attention aux doigts.', 5);
      BUFF.add && BUFF.add('force', 3);
      sound.coin && sound.coin();
      hasardF.noter('remouleur', 'Le rémouleur est passé avec sa meule. Il m’a affûté les outils ; ils mordent comme au premier jour.');
    } });
  },
  maj(E, dt) {
    const d = hfDistJ(E.r.x, E.r.z);
    E.appelT -= dt;
    if (E.appelT <= 0 && !E.affute) { E.appelT = 14 + Math.random() * 8; if (d < 70) { hfSon([E.r.x, E.r.y + 1.3, E.r.z], () => sound.hfClochette && sound.hfClochette(1)); if (d < 35) hfDit(E.r, 'Rémouleur ! Couteaux, ciseaux, faux, serpes ! Rémouleur !', 3.5); } }
    E.meuleT -= dt;
    if (E.meuleT > 0) { E.r.pose = { work: 1 }; if (Math.random() < dt * 0.8) hfSon([E.meule.x, hfSol(E.meule.x, E.meule.z) + 0.8, E.meule.z], () => sound.hfMeule && sound.hfMeule(1)); if (Math.random() < dt * 20) particles.spawn(E.meule.x, hfSol(E.meule.x, E.meule.z) + 0.9, E.meule.z, (Math.random() - 0.5) * 2, Math.random() * 1.5, (Math.random() - 0.5) * 2, [1.3, 0.9, 0.4, 1], 0.03, 0.3, 6, true); }
    else E.r.pose = {};
    if (!E.note && d < 30) { hasardF.noter(E, 'Le rémouleur est passé, poussant sa meule, en faisant sonner sa clochette.'); }
  },
  dessin(E, buf, sbuf, cam, t) { hfDessine(E.r, buf, sbuf, cam, t); hfModele(buf, 'meule_aiguiser', E.meule.x, hfSol(E.meule.x, E.meule.z), E.meule.z, E.meule.r, 1); },
  txt: {
    journal: 'Le rémouleur est passé.',
    apres: ['Le rémouleur est passé, hier. Il affûte tout, même les langues : il sait tout ce qui se dit d’un village à l’autre.', 'Rémouleur, c’est un métier qui coupe, comme il dit. Il le dit à chaque fois.'],
  },
});

// ---------------------------------------------------------------- 6. une compagnie de soldats passe
const HF_PRIX_SOLDATS = { oeuf: 2, pain: 2, fromage: 1.3, pomme: 3, cidre: 1.5, vin: 1.5 };
hfDef('soldats', {
  cat: 'routes', poids: 0.9, premier: 6, ecart: 14, public: true, duree: 4, fenetre: 3,
  peut: (c) => !c.pluieA(8, 17) && c.dow !== 'messe',
  heure: (c, r) => 8.5 + r * 7,
  pret: (X) => X.route && X.dehors && !X.ville,
  sansNous: () => true,
  lancer(E) {
    const p = game.player.pos;
    const A = hfRoute(p[0], p[2], 45, 80, { horsVillage: true });
    if (!A) return false;
    const pts = [[A.x, A.z], ...hfTrajet(A.x, A.z, p[0], p[2])];
    const lo = pts[pts.length - 1], B = hfRoute(lo[0], lo[1], 90, 160, { horsVillage: true, test: (n) => Math.hypot(n.x - A.x, n.z - A.z) > 100 });
    if (B) for (const q of hfTrajet(lo[0], lo[1], B.x, B.z)) pts.push(q);
    const M = [];
    E.officier = hfBete('horse', A.x, A.z, { v: 1, loin: 120 }); E.officier.rang = 0; M.push(E.officier);
    E.cavalier = hfPerso(hfLook('soldat', { hat: 'chapeau', hatCol: '#1a1a2a', beard: 'moustache', coat: true }), A.x, A.z, { nom: 'Le capitaine', voix: 0.85, loin: 120 });
    E.tambour = hfPerso(hfLook('soldat', { height: 0.9 }), A.x, A.z, { rang: 1.4, acc: HF_ACC.tambour, loin: 120 }); M.push(E.tambour);
    for (let i = 0; i < 10; i++) M.push(hfPerso(hfLook('soldat', { beard: i % 3 ? 'moustache' : undefined, held: 'hallebarde' }), A.x, A.z, { rang: 2.6 + Math.floor(i / 2) * 1.1, lat: i % 2 ? 0.55 : -0.55, loin: 120 }));
    E.C = hfCortege(M, pts, 1.2, 1.1);
    E.tamT = 0.2; E.vend = false; E.arret = 0;
    hasardF.cible(E, { pos: () => [E.officier.x, E.officier.y + 2.2, E.officier.z], r: 4, cos: 0.5, lab: 'Vendre des vivres au capitaine', vis: () => !E.vend && E.arret > 0, use: () => hfSoldatsVente(E) });
  },
  maj(E, dt) {
    const C = E.C, O = E.officier, d = hfDistJ(O.x, O.z);
    // la troupe fait halte un moment à la hauteur du joueur
    if (d < 9 && !E.halte) { E.halte = true; E.arret = 25; hfDit(E.cavalier, pick(['Halte ! … Vous, l’ami. Vous auriez des vivres à vendre à la troupe ? Nous payons, et nous payons bien.', 'Halte ! Dites-moi, il y a de quoi manger, dans ce pays ? Mes hommes ont le ventre creux depuis Valmont.']), 5.5); hasardF.noter(E, 'Une compagnie de soldats est passée sur la route, tambour en tête, le capitaine à cheval.'); }
    E.arret -= dt;
    hfCortegeMaj(C, dt, E.arret > 0);
    // le cavalier sur son cheval
    const K = E.cavalier; K.x = O.x; K.z = O.z; K.y = O.y + 0.95; K.h = O.h; K.pose = { sit: 1 }; K.move = 0;
    E.tamT -= dt;
    if (E.tamT <= 0 && E.arret <= 0) { let du = 0; if (d < 120) hfSon([E.tambour.x, E.tambour.y + 1, E.tambour.z], () => { du = sound.hfTambour ? sound.hfTambour('g.c.g.c.g.c.gcc.', { bpm: 112, vol: 0.06 }) : 0; if (sound.hfPas) sound.hfPas(0.8, 8, 112); }); E.tamT = (du || 4) + 0.3; }
    if (!E.note && d < 50) { hasardF.noter(E, 'Une compagnie de soldats est passée sur la route, tambour en tête, le capitaine à cheval.'); hasardF.reagir('soldats', 'pendant', O.x, O.z); }
    if (C.fini) E.fini = 'fin';
  },
  dessin(E, buf, sbuf, cam, t) { for (const F of E.C.membres) hfDessine(F, buf, sbuf, cam, t); hfDessine(E.cavalier, buf, null, cam, t); },
  txt: {
    journal: 'Une compagnie de soldats est passée sur la route.',
    pendant: ['Des soldats ! Rentrez les filles et les poules !', 'Ils vont vers le col. Il y a une guerre, quelque part ? Il y a toujours une guerre quelque part.'],
    apres: ['Les soldats sont passés, hier. Ils ont tout acheté au marché, même les œufs fêlés.', 'Mon fils est parti comme eux, il y a six ans. Il écrit à Pâques. Cette année, pas encore.', 'Ils marchaient vers le col. Le capitaine avait l’air de quelqu’un qui sait où il va. C’est le pire genre.'],
  },
});
function hfSoldatsVente(E) {
  let gain = 0, n = 0;
  for (const id in HF_PRIX_SOLDATS) {
    if (!ITEMS[id]) continue;
    const q = Math.min(farm.count(id), 6 - n);
    if (q <= 0) continue;
    farm.take(id, q); n += q;
    gain += Math.round((ITEMS[id].price || 1) * HF_PRIX_SOLDATS[id] * q);
    if (n >= 6) break;
  }
  E.vend = true;
  if (!n) { hfDit(E.cavalier, 'Rien ? Tant pis. En avant, marche !', 3); E.arret = 2; return; }
  farm.earn(gain); sound.coin && sound.coin();
  hfDit(E.cavalier, `Parfait. ${gain} pièces, et l’armée vous remercie. En avant, marche !`, 4);
  hasardF.noter('soldats', `Une compagnie de soldats est passée sur la route. J’ai vendu des vivres au capitaine, pour ${gain} pièces.`);
  E.arret = 3;
}

// ---------------------------------------------------------------- 7. la charrette embourbée
hfDef('charrette_embourbee', {
  cat: 'routes', poids: 1.2, premier: 3, ecart: 8, duree: 4, fenetre: 3,
  peut: (c) => !!hfPeriode(c.P, ['rain', 'storm'], 5, 15),
  heure: (c, r) => { const p = hfPeriode(c.P, ['rain', 'storm'], 5, 15); return p ? Math.min(18, p[1] + 0.3 + r * 2) : null; },
  pret: (X) => X.route && X.dehors && !X.ville,
  lancer(E) {
    const R = hfCheminDevant(20, 55);
    if (!R) return false;
    E.x = R.x; E.z = R.z; E.dir = R.dir; E.y = hfSol(R.x, R.z);
    E.paysan = hfPerso(hfLook('paysan', { hat: 'chapeau', top: '#4a4a3a', beard: 'courte' }), R.x - Math.sin(R.dir) * 2.4 + Math.cos(R.dir) * 0.8, R.z - Math.cos(R.dir) * 2.4 - Math.sin(R.dir) * 0.8, { nom: 'Un paysan', voix: 0.9, loin: 100, vit: 1 });
    E.paysan.h = R.dir;
    E.cheval = hfBete('donkey', R.x + Math.sin(R.dir) * 2.6, R.z + Math.cos(R.dir) * 2.6, { loin: 100, vit: 1 });
    E.cheval.h = R.dir;
    E.pousse = 0; E.etat = 'pris'; E.t1 = 0; E.criT = 1;
    hasardF.cible(E, { pos: () => [E.x, E.y + 0.8, E.z], r: 3.2, cos: 0.4, lab: 'Pousser la charrette', vis: () => E.etat === 'pris', use() {
      E.pousse++; sound.shovel && sound.shovel(1); game.shakeT = Math.max(game.shakeT || 0, 0.12);
      for (let k = 0; k < 8; k++) particles.spawn(E.x + (Math.random() - 0.5), E.y + 0.1, E.z + (Math.random() - 0.5), (Math.random() - 0.5) * 2, Math.random() * 2, (Math.random() - 0.5) * 2, [0.3, 0.22, 0.14, 1], 0.06, 0.5, 9, false);
      if (E.pousse >= 4) {
        E.etat = 'libre'; E.t1 = 0;
        hfDit(E.paysan, 'Elle sort ! Hue ! … Merci, merci. Tenez, prenez des pommes, j’en ai trop pour ce que j’en vendrai.', 5);
        farm.give('pomme', 6); play.flyer && play.flyer('pomme', [E.x, E.y + 1, E.z], 6);
        hasardF.noter('charrette_embourbee', 'Après la pluie, une charrette était enlisée jusqu’aux moyeux. J’ai poussé avec le paysan ; il m’a donné des pommes.');
        const pts = [[E.x + Math.sin(E.dir) * 40, E.z + Math.cos(E.dir) * 40]];
        hfAller(E.paysan, pts, 1); hfAller(E.cheval, pts, 1);
      }
    } });
  },
  maj(E, dt) {
    const d = hfDistJ(E.x, E.z);
    if (E.etat === 'pris') {
      E.criT -= dt;
      if (E.criT <= 0) { E.criT = 6 + Math.random() * 4; if (d < 50) { hfSon([E.cheval.x, E.cheval.y + 1.2, E.cheval.z], () => sound.animal && sound.animal('donkey', 0, 0.8)); if (d < 25) hfDit(E.paysan, pick(['Hue ! Hue, carne !', 'Rien à faire… elle est prise jusqu’aux moyeux.', 'Vous ne voudriez pas pousser un peu, par hasard ?']), 3); } }
      E.paysan.pose = { reach: 0.5, lean: 0.3 };
      if (!E.note && d < 30) hasardF.noter(E, 'Après la pluie, une charrette enlisée sur le chemin, un âne qui tirait en vain.');
    } else {
      E.t1 += dt;
      E.paysan.pose = {};
      hfMarche(E.paysan, dt);
      const fin = hfMarche(E.cheval, dt);
      E.x = E.cheval.x - Math.sin(E.dir) * 2.6; E.z = E.cheval.z - Math.cos(E.dir) * 2.6; E.y = hfSol(E.x, E.z);
      if (fin || E.t1 > 45) E.fini = 'fin';
    }
  },
  dessin(E, buf, sbuf, cam, t) {
    hfDessine(E.paysan, buf, sbuf, cam, t); hfDessine(E.cheval, buf, sbuf, cam, t);
    hfModele(buf, 'charrette', E.x, E.y - (E.etat === 'pris' ? 0.35 : 0), E.z, E.dir + Math.PI / 2, 1);
    if (E.etat === 'pris') { PE.buf = buf; PE.fl = 0; PE.frame(E.x, E.y, E.z, E.dir, 1); PE.box(0, 0.02, 0, 3.2, 0.06, 4, [0.2, 0.15, 0.1], TL.soilWet); }
  },
  txt: {
    journal: 'Une charrette embourbée sur le chemin, après la pluie.',
    apres: ['Les chemins sont des fondrières, après la pluie. Il y a eu trois charrettes prises, hier, et un âne qui a refusé d’en parler.'],
  },
});

// ---------------------------------------------------------------- 8. le petit Savoyard et sa marmotte
const HF_AIR_SAVOYARD = [[64, 1], [67, 1], [69, 1.5], [67, 0.5], [64, 1], [62, 1], [64, 2], [67, 1], [69, 1], [71, 1.5], [69, 0.5], [67, 1], [64, 1], [62, 2], [64, 3]];
hfDef('petit_savoyard', {
  cat: 'routes', poids: 1, premier: 4, ecart: 12, duree: 3, fenetre: 3,
  peut: (c) => !c.pluieA(10, 17),
  heure: (c, r) => 10 + r * 6,
  pret: (X) => (X.ville || X.hameau || X.route) && X.dehors,
  lancer(E) {
    const p = game.player.pos, P = hfPoint(p[0], p[2], 8, 16, { r: 0.8 });
    if (!P) return false;
    E.x = P.x; E.z = P.z; E.y = P.y;
    E.g = hfPerso(hfLook('enfant', { top: '#6a4a2a', bottom: '#3a3028', hat: 'bonnet', hatCol: '#7a2a20', height: 0.78 }), P.x, P.z, { nom: 'Le petit Savoyard', voix: 1.55, loin: 80, acc: hfVielleEnfant });
    E.g.h = Math.atan2(p[0] - P.x, p[2] - P.z);
    E.marmotte = hfBete('marmot', P.x + Math.sin(E.g.h) * 0.8 + Math.cos(E.g.h) * 0.5, P.z + Math.cos(E.g.h) * 0.8 - Math.sin(E.g.h) * 0.5, { loin: 50 });
    E.marmotte.h = E.g.h;
    E.airT = 0.5; E.sous = 0; E.danse = 0;
    hasardF.cible(E, { pos: () => [E.g.x, E.g.y + 0.9, E.g.z], r: 2.8, lab: 'Lui donner un sou', vis: () => E.sous < 3, use() {
      if (!farm.pay(1)) { hfPense('(Vos poches sont vides.)', 2); return; }
      E.sous++; E.danse = 4; sound.coin && sound.coin();
      hfDit(E.g, pick(['Merci, m’sieur-dame ! Allez, Pierrot, danse !', 'Merci ! Je rentre au pays à la Saint-Michel, avec ça.', 'La marmotte vous dit merci. Elle parle pas, mais elle le dit.']), 3.5);
      if (E.sous === 1) hasardF.noter('petit_savoyard', 'Un petit Savoyard jouait de la vielle, une marmotte au bout d’une ficelle. Je lui ai donné un sou ; la marmotte a dansé.');
    } });
  },
  maj(E, dt) {
    const d = hfDistJ(E.x, E.z);
    E.airT -= dt;
    if (E.airT <= 0) { let du = 0; if (d < 60) hfSon([E.g.x, E.g.y + 0.9, E.g.z], () => { du = sound.hfAir ? sound.hfAir(HF_AIR_SAVOYARD, { bpm: 88, timbre: 'vielle', vol: 0.03, bourdon: [52], chien: false }) : 0; }); E.airT = (du || 9) + 4; }
    E.danse -= dt;
    const M = E.marmotte;
    M.dy = E.danse > 0 ? Math.abs(Math.sin(game.time * 7)) * 0.25 : 0; M.h += E.danse > 0 ? dt * 3 : 0;
    E.g.pose = { reach: 0.3 + Math.sin(game.time * 4) * 0.05 };
    if (!E.note && d < 20) { hasardF.noter(E, 'Un petit Savoyard jouait de la vielle, une marmotte au bout d’une ficelle.'); hfPense('(Un enfant, une vielle trop grande pour lui, une marmotte qui dort à moitié.)', 3.5); }
  },
  dessin(E, buf, sbuf, cam, t) { hfDessine(E.g, buf, sbuf, cam, t); hfDessine(E.marmotte, buf, sbuf, cam, t); },
  txt: {
    journal: 'Un petit Savoyard est passé, avec sa vielle et sa marmotte.',
    apres: ['Le petit Savoyard est reparti vers le col. Huit ans, et il fait la route seul. Sa mère l’attend au printemps, s’il revient.', 'Les petits Savoyards descendent chaque automne avec leurs marmottes. Les marmottes dorment tout l’hiver. Les petits, non.'],
  },
});
function hfVielleEnfant(F, buf, t) { PE.buf = buf; PE.fl = 0; PE.frame(F.x, F.y, F.z, F.h, F.s || 1); PE.box(0, 0.75, 0.24, 0.32, 0.2, 0.42, [0.5, 0.3, 0.15], TL.wood, 0.4); PE.box(0.18, 0.78, 0.1, 0.03, 0.03, 0.12, [0.3, 0.25, 0.2], TL.wood, Math.sin(t * 8)); }

// ---------------------------------------------------------------- 9. la transhumance
hfDef('transhumance', {
  cat: 'routes', poids: 1, premier: 4, ecart: 14, duree: 4, fenetre: 3,
  peut: (c) => !c.pluieA(6, 12),
  heure: (c, r) => 6.8 + r * 3.5,
  pret: (X) => X.route && X.dehors && !X.ville,
  lancer(E) {
    const p = game.player.pos, w = game.world;
    const A = hfRoute(p[0], p[2], 40, 70, { horsVillage: true });
    if (!A) return false;
    const pts = [[A.x, A.z], ...hfTrajet(A.x, A.z, p[0], p[2])];
    const lo = pts[pts.length - 1], L = w.lm.estive || w.lm.bergerie;
    if (L) for (const q of hfTrajet(lo[0], lo[1], L.x, L.z).slice(0, 14)) pts.push(q);
    const M = [];
    E.berger = hfPerso(hfLook('vieux', { top: '#5a4a38', hat: 'chapeau', hatCol: '#3a3024', held: 'baton', coat: true }), A.x, A.z, { rang: 0, nom: 'Le berger', voix: 0.85, loin: 120 });
    M.push(E.berger);
    for (let i = 0; i < 24; i++) { const F = hfBete(i % 9 === 4 ? 'goat' : 'sheep', A.x, A.z, { loin: 110 }); F.rang = 1.2 + i * 0.32; F.lat = (Math.random() - 0.5) * 2.6; M.push(F); }
    E.chiens = [0, 1].map((i) => { const F = hfBete('dog', A.x, A.z, { v: i ? 1 : 3, loin: 110 }); F.rang = 2 + i * 6; F.lat = i ? 2.2 : -2.2; M.push(F); return F; });
    E.C = hfCortege(M, pts, 1, 0.8);
    E.belT = 0; E.beeT = 1; E.sifT = 3;
  },
  maj(E, dt) {
    const C = E.C, B = E.berger, d = hfDistJ(B.x, B.z);
    hfCortegeMaj(C, dt, false);
    for (const F of C.membres) if (!F.hum && F !== E.chiens[0] && F !== E.chiens[1] && Math.random() < dt * 0.3) F.pose = { graze: 1 }; else if (!F.hum) F.pose = {};
    E.belT -= dt;
    if (E.belT <= 0) { E.belT = 2.2; const F = C.membres[(Math.random() * C.membres.length) | 0]; if (hfDistJ(F.x, F.z) < 90) hfSon([F.x, F.y + 0.8, F.z], () => sound.hfSonnailles && sound.hfSonnailles(1, 6)); }
    E.beeT -= dt;
    if (E.beeT <= 0) { E.beeT = 1.5 + Math.random() * 2; const F = C.membres[1 + ((Math.random() * 20) | 0)]; if (F && hfDistJ(F.x, F.z) < 60) hfSon([F.x, F.y + 0.8, F.z], () => sound.animal && sound.animal(Math.random() < 0.85 ? 'sheep' : 'goat', 0, 0.7)); }
    E.sifT -= dt;
    if (E.sifT <= 0) { E.sifT = 8 + Math.random() * 7; if (d < 60) hfSon([B.x, B.y + 1.6, B.z], () => { sound.whistle && sound.whistle(); setTimeout(() => sound.bark && sound.bark(0.8, 0), 600); }); }
    if (!E.note && d < 60) { hasardF.noter(E, 'Un grand troupeau est passé sur le chemin, en montant vers l’estive : des sonnailles, des chiens, un berger qui ne disait rien.'); hfPense('(Des sonnailles, des centaines. Le chemin disparaît sous les moutons.)', 3.5); }
    if (C.fini) E.fini = 'fin';
  },
  dessin(E, buf, sbuf, cam, t) { for (const F of E.C.membres) hfDessine(F, buf, sbuf, cam, t); },
  txt: {
    journal: 'Un troupeau montait vers l’estive.',
    apres: ['Le troupeau est monté à l’estive, hier. On les a entendus passer pendant une heure. Les sonnailles, c’est pour que les bêtes ne se perdent pas. Et pour que le berger ne s’ennuie pas.', 'À l’estive, ils restent tout l’été, là-haut. Le berger redescend plus maigre, et plus silencieux.'],
  },
});

// ---------------------------------------------------------------- 10. le peintre anglais
hfDef('peintre', {
  cat: 'routes', poids: 0.9, premier: 5, ecart: 18, fois: 3, duree: 4, fenetre: 3,
  peut: (c) => !c.pluieA(9, 17) && c.etat(13) !== 'fog',
  heure: (c, r) => 9.5 + r * 5,
  pret: (X) => X.dehors && !X.ville && (X.lac || X.biome === 'hauteurs' || X.biome === 'lande' || X.biome === 'plaine'),
  lancer(E) {
    const e = game.player.eyePos(), f = cameraBasis(game.player.yaw, 0).f;
    const P = hfPoint(e[0], e[2], 14, 26, { a: Math.atan2(f[0], f[2]), ouv: 2.5, r: 1.2 });
    if (!P) return false;
    E.x = P.x; E.z = P.z; E.y = P.y;
    const vue = Math.random() * TAU;
    E.p = hfPerso(hfLook('bourgeois', { top: '#6a6a50', bottom: '#8a7a5a', hat: 'paille', beard: 'courte', hair: '#a87a4a', coat: false }), P.x, P.z, { nom: 'Un peintre', voix: 1, loin: 80 });
    E.p.h = vue; E.p.pose = { reach: 0.3 };
    E.ch = { x: P.x + Math.sin(vue) * 0.9, z: P.z + Math.cos(vue) * 0.9, r: vue + Math.PI };
    E.parle = 0; E.donne = false;
    hasardF.cible(E, { pos: () => [E.p.x, E.p.y + 1.4, E.p.z], r: 3, lab: 'Regarder le tableau', use() {
      E.parle++;
      if (E.parle === 1) hfDit(E.p, 'Oh ! Good morning. Pardon : bonjour. Vous habitez ici ? Quelle chance. La lumière, ici, est… comment dit-on… inquiète.', 6);
      else if (E.parle === 2 && !E.donne) {
        E.donne = true;
        hfDit(E.p, 'Tenez, prenez ce croquis. J’en fais dix par jour. Celui-ci, je ne l’aime pas : il y a quelqu’un dedans que je n’ai pas dessiné.', 6);
        farm.give('croquis_anglais', 1); play.flyer && play.flyer('croquis_anglais', [E.p.x, E.p.y + 1.2, E.p.z], 1);
        hasardF.noter('peintre', 'Un peintre anglais, à son chevalet, m’a donné un croquis. Il dit qu’il y a quelqu’un dedans qu’il n’a pas dessiné.');
      } else hfDit(E.p, pick(['Les Anglais viennent pour les Alpes. Moi, je suis venu pour vos brumes.', 'Ne bougez pas… Voilà. Vous êtes dans le tableau, maintenant. Pour toujours, ou presque.', 'Le soir, je ne peins pas. Le soir, ici, les ombres ne tombent pas du bon côté.']), 5);
    } });
  },
  maj(E) {
    E.p.pose = { reach: 0.3 + Math.sin(game.time * 1.5) * 0.15 };
    if (!E.note && hfDistJ(E.x, E.z) < 22) { hasardF.noter(E, 'Un peintre étranger avait planté son chevalet au bord du chemin, un chapeau de paille sur la tête.'); hfPense('(Un homme en chapeau de paille, devant un chevalet. Il peint le paysage, et un peu vous.)', 3.5); }
  },
  dessin(E, buf, sbuf, cam, t) {
    hfDessine(E.p, buf, sbuf, cam, t);
    PE.buf = buf; PE.fl = 0; PE.frame(E.ch.x, hfSol(E.ch.x, E.ch.z), E.ch.z, E.ch.r, 1);
    for (const s of [-0.3, 0.3]) PE.box(s, 0.75, 0, 0.04, 1.5, 0.04, [0.5, 0.36, 0.22], TL.wood, 0, s < 0 ? 0.08 : -0.08);
    PE.box(0, 0.75, -0.35, 0.04, 1.5, 0.04, [0.5, 0.36, 0.22], TL.wood, 0, 0.25);
    PE.box(0, 1.25, 0.03, 0.7, 0.55, 0.03, [1.05, 1.02, 0.95], TL.paper); PE.box(0, 1.2, 0.05, 0.55, 0.3, 0.01, [0.45, 0.6, 0.5], TL.plain); PE.box(0, 1.38, 0.05, 0.55, 0.12, 0.01, [0.55, 0.7, 0.85], TL.plain);
  },
  txt: {
    journal: 'Un peintre anglais à son chevalet.',
    apres: ['Un Anglais peint la vallée, ces jours-ci. Il dit qu’elle est « pittoresque ». Ça veut dire qu’il n’y habite pas.', 'Le peintre anglais est reparti. Il a laissé un tableau à l’auberge, pour payer. L’aubergiste l’a retourné contre le mur. Il dit que les yeux le suivent.'],
  },
});
