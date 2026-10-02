// ============================================================================
//  LE HASARD DE LA VALLÉE (3) : LA VIE DES VILLAGES — dix événements.
//  - noce : de l'église à l'auberge, derrière le violoneux (on félicite) ;
//  - enterrement : le glas, le cercueil porté au cimetière (celui d'un habitant
//    mort ces jours-ci, s'il y en a un) ; on peut se recueillir ;
//  - enfant_perdu : une mère cherche son petit ; il pleure près d'un lieu-dit ;
//  - cheval_echappe : un cheval du ranch court les prés ; on le ramène ;
//  - saltimbanques : jongleur, cracheur de feu, ours, fifre et tambour ;
//  - procession : un Primedi, le curé bénit les champs (les vôtres poussent) ;
//  - bapteme : les cloches, le parrain jette des dragées aux enfants ;
//  - rixe : deux hommes se battent à la sortie de l'auberge ;
//  - incendie : une grange brûle au hameau ; la chaîne des seaux ;
//  - charivari : casseroles sous les fenêtres d'un veuf remarié.
// ============================================================================
defItem('dragees', 'Dragées', 'nourriture', 3, ['rond', '#f2e6ec'], { food: 4, desc: 'Des amandes sous une coque de sucre, blanches et roses, qu’un parrain a jetées aux enfants sur le parvis.' });

const HF_PRENOMS_H = ['Pierre', 'Jean', 'Louis', 'Étienne', 'Joseph', 'Antoine', 'Jules', 'Victor', 'Augustin', 'Félix', 'Eugène', 'Firmin', 'Paulin', 'Honoré'];
const HF_PRENOMS_F = ['Marie', 'Jeanne', 'Louise', 'Marguerite', 'Rose', 'Victorine', 'Augustine', 'Céleste', 'Joséphine', 'Eugénie', 'Mélanie', 'Clémence', 'Adèle', 'Philomène'];
const HF_NOMS = ['Rivière', 'Fournier', 'Bertin', 'Morin', 'Garnier', 'Delmas', 'Perrin', 'Roux', 'Vidal', 'Chevalier', 'Mercier', 'Barthe', 'Collin', 'Lenoir', 'Pradel', 'Fabre'];
// les airs (notation : [note midi | null, durée en temps])
const HF_AIR_NOCE = [[74, 1], [71, 0.5], [72, 0.5], [74, 1], [79, 1], [78, 0.5], [76, 0.5], [74, 1], [71, 1], [72, 0.5], [74, 0.5], [76, 1], [74, 0.5], [72, 0.5], [71, 1], [69, 1],
  [67, 0.5], [69, 0.5], [71, 1], [72, 1], [74, 1], [76, 0.5], [74, 0.5], [72, 0.5], [71, 0.5], [69, 1], [71, 0.5], [69, 0.5], [67, 2]];
const HF_AIR_FIFRE = [[74, 0.5], [76, 0.5], [78, 1], [74, 0.5], [76, 0.5], [78, 1], [79, 0.5], [78, 0.5], [76, 0.5], [74, 0.5], [73, 1], [69, 1],
  [74, 0.5], [76, 0.5], [78, 1], [81, 0.5], [79, 0.5], [78, 0.5], [76, 0.5], [74, 1], [76, 0.5], [73, 0.5], [74, 2]];
const HF_LITANIE = [[62, 1], [64, 1], [65, 1.5], [64, 0.5], [62, 1], [64, 2], [null, 0.5], [60, 1], [62, 1], [64, 1], [65, 1], [64, 1], [62, 2.5]];
// jouer un air depuis un figurant (si l'on est à portée d'oreille) ; renvoie la durée, ou 0
function hfJoue(F, air, o, portee) {
  if (!F || hfDistJ(F.x, F.z) > (portee || 90)) return 0;
  let d = 0;
  hfSon([F.x, F.y + 1.4, F.z], () => { d = sound.hfAir ? sound.hfAir(air, o) : 0; });
  return d;
}
// accessoires des figurants (dans le repère du corps : x à droite, y en haut, z devant)
const HF_ACC = {
  violon(F, buf, t) { PE.buf = buf; PE.fl = 0; PE.frame(F.x, F.y, F.z, F.h, F.s); PE.box(-0.18, 1.42, 0.16, 0.12, 0.08, 0.34, [0.45, 0.22, 0.1], TL.wood, 0.3); PE.box(0.12, 1.36 + Math.sin(t * 6) * 0.04, 0.3, 0.5, 0.015, 0.015, [0.8, 0.7, 0.5], TL.wood, 0.9 + Math.sin(t * 6) * 0.3); },
  croix(F, buf) { PE.buf = buf; PE.fl = 0; PE.frame(F.x, F.y, F.z, F.h, F.s); PE.box(0.28, 1.25, 0.22, 0.05, 2.0, 0.05, [0.35, 0.28, 0.2], TL.wood); PE.box(0.28, 2.0, 0.22, 0.36, 0.05, 0.05, [0.8, 0.7, 0.3], TL.gold); PE.box(0.28, 2.1, 0.22, 0.05, 0.28, 0.05, [0.8, 0.7, 0.3], TL.gold); },
  banniere(F, buf, t) { PE.buf = buf; PE.fl = 0; PE.frame(F.x, F.y, F.z, F.h, F.s); PE.box(0.3, 1.3, 0.15, 0.05, 2.4, 0.05, [0.35, 0.28, 0.2], TL.wood); PE.box(0.3, 2.45, 0.15, 0.7, 0.04, 0.04, [0.35, 0.28, 0.2], TL.wood); PE.box(0.3, 2.05, 0.15 + Math.sin(t * 2) * 0.03, 0.62, 0.75, 0.02, [0.75, 0.68, 0.45], TL.cloth); PE.box(0.3, 2.05, 0.165, 0.12, 0.4, 0.01, [0.6, 0.15, 0.12], TL.cloth); },
  bebe(F, buf) { PE.buf = buf; PE.fl = 0; PE.frame(F.x, F.y, F.z, F.h, F.s); PE.box(0, 1.15, 0.24, 0.42, 0.18, 0.2, [1.25, 1.22, 1.15], TL.cloth); PE.box(-0.17, 1.2, 0.24, 0.1, 0.1, 0.1, [0.95, 0.75, 0.62], TL.skin); },
  casserole(F, buf, t) { PE.buf = buf; PE.fl = 0; PE.frame(F.x, F.y, F.z, F.h, F.s); const k = Math.abs(Math.sin(t * 9 + F.phase)) * 0.15; PE.box(-0.25, 1.15 + k, 0.3, 0.3, 0.12, 0.3, [0.55, 0.52, 0.5], TL.metal); PE.box(0.25, 1.25 - k, 0.3, 0.05, 0.05, 0.35, [0.5, 0.48, 0.46], TL.metal, 0, 0.4); },
  seau(F, buf, t) { PE.buf = buf; PE.fl = 0; PE.frame(F.x, F.y, F.z, F.h, F.s); const k = Math.sin(t * 3 + F.phase); PE.box(k * 0.35, 0.95, 0.25, 0.25, 0.28, 0.25, [0.45, 0.35, 0.22], TL.wood); },
  tambour(F, buf, t) { PE.buf = buf; PE.fl = 0; PE.frame(F.x, F.y, F.z, F.h, F.s); PE.box(0, 0.95, 0.3, 0.42, 0.32, 0.42, [0.6, 0.2, 0.15], TL.wood); PE.box(0, 1.12, 0.3, 0.4, 0.02, 0.4, [0.92, 0.88, 0.78], TL.paper); PE.box(0.1, 1.2 + Math.abs(Math.sin(t * 8)) * 0.15, 0.3, 0.03, 0.03, 0.35, [0.7, 0.6, 0.45], TL.wood, 0.4); },
  balles(F, buf, t) {
    PE.buf = buf; PE.fl = 0;
    const c = [[0.9, 0.2, 0.15], [0.95, 0.8, 0.2], [0.2, 0.4, 0.9]];
    for (let i = 0; i < 3; i++) { const u = (t * 1.3 + i / 3) % 1, x = Math.cos(u * Math.PI) * 0.35, y = 1.3 + Math.sin(u * Math.PI) * 0.9; PE.frame(F.x + Math.cos(F.h) * x + Math.sin(F.h) * 0.3, F.y + y, F.z - Math.sin(F.h) * x + Math.cos(F.h) * 0.3, 0, 1); PE.box(0, 0, 0, 0.1, 0.1, 0.1, c[i], TL.plain); }
  },
};

// ---------------------------------------------------------------- 1. la noce
hfDef('noce', {
  cat: 'village', poids: 1.4, ecart: 9, public: true, annonce: true, duree: 3.6, fenetre: 2.5,
  peut: (c) => !['morts', 'chome'].includes(c.dow) && !c.pluieA(10, 14),
  heure: (c, r) => 11 + r * 0.6,
  pret: (X) => X.ville,
  sansNous: () => true,
  lancer(E) {
    const w = game.world, B = w.bld.eglise, A = w.bld.auberge;
    if (!B || !A) return false;
    const pts = [B.out, ...hfTrajet(B.out[0], B.out[1], A.out[0], A.out[1])];
    const r = Math.random;
    E.mari = pick(HF_PRENOMS_H) + ' ' + pick(HF_NOMS); E.mariee = pick(HF_PRENOMS_F) + ' ' + pick(HF_NOMS);
    const M = [];
    const mk = (look, o) => { const F = hfPerso(look, B.out[0], B.out[1], Object.assign({ loin: 120 }, o)); M.push(F); return F; };
    E.violon = mk(hfLook('vieux', { held: undefined, hat: 'chapeau', top: '#3a2a22', beard: 'moustache' }), { rang: 0, nom: 'Le violoneux', acc: HF_ACC.violon });
    E.elle = mk({ skin: '#ecc6a8', hair: '#4a3020', hairStyle: 'chignon', dress: true, top: '#f2eee4', bottom: '#f2eee4', hat: 'voile', hatCol: '#faf8f2', shoe: '#d8d0c0' }, { rang: 1.4, lat: -0.42, nom: E.mariee, voix: 1.35 });
    E.lui = mk({ skin: '#ddb090', hair: '#2a2018', top: '#1e1e24', bottom: '#1e1e24', coat: true, hat: 'chapeau', hatCol: '#16161a' }, { rang: 1.4, lat: 0.42, nom: E.mari, voix: 0.95 });
    const invites = [['paysanne', { top: '#5a3a5a', apron: '#e8e0f0' }], ['paysan', { top: '#3a4a6a', hat: 'chapeau' }], ['vieille', {}], ['bourgeois', {}], ['paysanne', { top: '#6a5a2a', hat: 'bonnet', hatCol: '#f0e8d8' }], ['paysan', { top: '#5a4a3a', hat: 'casquette' }], ['enfant', {}], ['fillette', { top: '#c8c0e0' }]];
    invites.forEach(([k, o], i) => mk(hfLook(k, o), { rang: 2.6 + Math.floor(i / 2) * 1.1, lat: i % 2 ? 0.5 : -0.5, voix: 0.9 + r() * 0.5 }));
    E.C = hfCortege(M, pts, 1.3, 0.75);
    E.airT = 0.5; E.fini0 = false; E.felicite = false; E.t1 = 0;
    hfSon([B.out[0], hfSol(B.out[0], B.out[1]) + 1.5, B.out[1]], () => { sound.shot && sound.shot(); });
    setTimeout(() => hfSon([B.out[0], hfSol(B.out[0], B.out[1]) + 1.5, B.out[1]], () => { sound.shot && sound.shot(); }), 700);
    hasardF.cible(E, { pos: () => [E.elle.x, E.elle.y + 1.2, E.elle.z], r: 3, lab: 'Féliciter les mariés', vis: () => !E.felicite, use() {
      E.felicite = true;
      hfDit(E.elle, pick(['Merci ! Venez boire à notre santé, ce soir, à l’auberge.', 'Merci bien. Tenez, prenez des dragées, il y en a pour tout le monde.']), 3.5);
      farm.give('dragees', 2); play.flyer && play.flyer('dragees', [E.elle.x, E.elle.y + 1, E.elle.z], 2);
      for (const n of hfGens(E.elle.x, E.elle.z, 30)) npcs.addAmitie(n, 4);
      hasardF.noter(E, `J’ai félicité les mariés, ${E.mariee} et ${E.mari}, sur le chemin de l’auberge.`);
    } });
  },
  maj(E, dt) {
    const C = E.C;
    hfCortegeMaj(C, dt, false);
    E.airT -= dt;
    if (E.airT <= 0) { const d = hfJoue(E.violon, HF_AIR_NOCE, { bpm: 150, timbre: 'violon', vol: 0.05 }); E.airT = (d || 4) + 1.2; }
    if (!E.note && hfDistJ(E.elle.x, E.elle.z) < 35) { hasardF.noter(E, `Une noce est passée, de l’église à l’auberge, derrière un violoneux : ${E.mariee} et ${E.mari}.`); hasardF.reagir('noce', 'pendant', E.elle.x, E.elle.z); }
    if (C.fini) {
      E.t1 += dt;
      // devant l'auberge : on danse un peu (on piétine), puis on entre, un à un
      for (const [i, F] of C.membres.entries()) { F.move = 0.4 + Math.sin(game.time * 4 + i) * 0.3; F.phase += dt * 3; if (E.t1 > 50 + i * 3) F.cache = true; }
      if (E.t1 > 50 + C.membres.length * 3) E.fini = 'fin';
    }
  },
  dessin(E, buf, sbuf, cam, t) { for (const F of E.C.membres) hfDessine(F, buf, sbuf, cam, t); },
  txt: {
    journal: 'Une noce est passée, de l’église à l’auberge, derrière un violoneux.',
    avant: ['Il y a une noce demain, à l’église. Ils ont loué le violoneux de Clairpré.', 'Demain, on marie une fille du hameau. Toute la vallée y sera, ou presque.'],
    pendant: ['Vive les mariés !', 'Regardez la robe ! C’est sa grand-mère qui l’a cousue.', 'Le violoneux a déjà bu, ça s’entend.'],
    apres: ['La noce d’hier a duré jusqu’à l’aube. Le violoneux dort encore sous la table.', 'Une belle noce. La mariée a pleuré, la mère aussi, le marié n’a rien compris.', 'On a tiré des coups de fusil devant l’église. Le curé n’aime pas ça. Le curé n’aime rien.'],
  },
});

// ---------------------------------------------------------------- 2. l'enterrement
hfDef('enterrement', {
  cat: 'village', poids: 1.1, premier: 4, ecart: 10, public: true, annonce: true, duree: 8, fenetre: 2.5,
  peut: (c) => c.dow !== 'foire',
  heure: (c, r) => 14.6 + r * 1,
  pret: (X) => X.ville,
  sansNous: (e, d) => { hfMortDuJour(d, true); return true; },
  lancer(E) {
    const w = game.world, B = w.bld.eglise, T = w.townInfo;
    if (!B) return false;
    const g = (T && T.cemGrave) || (w.lm.cimetiere ? [w.lm.cimetiere.x, w.lm.cimetiere.z] : null);
    if (!g) return false;
    const M = hfMortDuJour(farm.s.day, true);
    E.qui = M.nom; E.pnj = M.id;
    const pts = [B.out, ...hfTrajet(B.out[0], B.out[1], g[0] + 2.5, g[1] + 2)];
    E.gx = g[0]; E.gz = g[1];
    const L = [];
    const mk = (look, o) => { const F = hfPerso(look, B.out[0], B.out[1], Object.assign({ loin: 120, vit: 0.7 }, o)); L.push(F); return F; };
    E.cure = mk(hfLook('cure'), { rang: 0, acc: HF_ACC.croix, nom: npcs.alive && npcs.alive('cure') ? npcs.byId.cure.name : 'Le curé', voix: 0.8 });
    E.porteurs = [];
    for (let i = 0; i < 4; i++) E.porteurs.push(mk(hfLook('paysan', { top: '#1e1c1e', bottom: '#1e1c1e', hat: 'chapeau', hatCol: '#141414' }), { rang: 1.4 + (i >> 1) * 1.6, lat: i % 2 ? 0.45 : -0.45 }));
    mk(hfLook('vieille', { top: '#141214', bottom: '#141214' }), { rang: 4.6, lat: 0 });
    for (let i = 0; i < 5; i++) mk(hfLook(i % 2 ? 'paysan' : 'paysanne', { top: '#232023', bottom: '#2a2628', hat: i % 2 ? 'chapeau' : 'voile', hatCol: '#161416' }), { rang: 5.8 + Math.floor(i / 2) * 1.2, lat: (i % 2 ? 0.5 : -0.5) });
    E.C = hfCortege(L, pts, 1.3, 0.85);
    E.glasT = 0.2; E.glas = 0; E.t1 = 0; E.recueilli = false;
    hasardF.cible(E, { pos: () => [E.gx, hfSol(E.gx, E.gz) + 0.6, E.gz], r: 4, cos: 0.5, lab: 'Se recueillir', vis: () => E.C.fini && !E.recueilli && E.t1 < 70, use() {
      E.recueilli = true;
      const c = npcs.byId && npcs.byId.cure;
      if (c && c.st.alive) npcs.addAmitie(c, 10);
      hasardF.noter(E, `J’ai suivi l’enterrement ${E.qui}, jusqu’au cimetière. J’ai baissé la tête avec les autres.`);
      const M = farm.s.dead.find((d) => d.id === E.pnj);
      hfPense(M && M.by === 'joueur' ? '(Personne ne vous regarde. C’est pire.)' : '(La terre tombe sur le bois. Un bruit mat.)', 3.5);
    } });
  },
  maj(E, dt) {
    const C = E.C;
    hfCortegeMaj(C, dt, false);
    // le glas : un coup lent toutes les six secondes, tant que le cortège est en route
    E.glasT -= dt;
    if (E.glasT <= 0 && E.glas < 14 && !C.fini) { E.glasT = 6.5; E.glas++; const P = sound.clocher ? sound.clocher() : null; if (P) hfSon(P, () => sound.hfCloche && sound.hfCloche(150, 0.9)); }
    // le cercueil, entre les porteurs
    const P = E.porteurs;
    E.cx = (P[0].x + P[1].x + P[2].x + P[3].x) / 4; E.cz = (P[0].z + P[1].z + P[2].z + P[3].z) / 4; E.cy = (P[0].y + P[3].y) / 2 + 1.45; E.ch = Math.atan2(P[0].x - P[2].x, P[0].z - P[2].z);
    if (!E.note && hfDistJ(E.cx, E.cz) < 40) { hasardF.noter(E, `On a enterré ${E.qui}. Le glas a sonné tout le temps que le cortège est allé au cimetière.`); hasardF.reagir('enterrement', 'pendant', E.cx, E.cz); }
    if (C.fini) {
      E.t1 += dt;
      if (E.t1 > 4 && !E.dit) { E.dit = true; hfDit(E.cure, 'Requiem æternam dona ei, Domine. Et lux perpetua luceat ei.', 5); }
      for (const [i, F] of C.membres.entries()) { hfFace(F, E.gx, E.gz, dt); if (i > 0) F.pose = { pray: 1, lookP: 0.4 }; if (E.t1 > 70 + i * 4) F.cache = true; }
      if (E.t1 > 70 + C.membres.length * 4) E.fini = 'fin';
    }
  },
  dessin(E, buf, sbuf, cam, t) {
    for (const F of E.C.membres) hfDessine(F, buf, sbuf, cam, t);
    if (E.C.fini) { PE.buf = buf; PE.fl = 0; PE.frame(E.gx, hfSol(E.gx, E.gz), E.gz, 0, 1); PE.box(0, 0.02, 0, 0.9, 0.06, 2.0, [0.18, 0.13, 0.1], TL.soil); PE.box(1.0, 0.15, 0, 0.6, 0.3, 1.6, [0.35, 0.27, 0.2], TL.soil); return; }
    PE.buf = buf; PE.fl = 0; PE.frame(E.cx, E.cy, E.cz, E.ch, 1);
    PE.box(0, 0, 0, 0.62, 0.42, 1.95, [0.32, 0.22, 0.15], TL.darkwood); PE.box(0, 0.22, 0, 0.5, 0.03, 1.6, [0.85, 0.82, 0.75], TL.cloth); PE.box(0, 0.24, 0.3, 0.06, 0.02, 0.5, [0.1, 0.08, 0.06], TL.plain); PE.box(0, 0.24, 0.42, 0.3, 0.02, 0.06, [0.1, 0.08, 0.06], TL.plain);
  },
  txt: {
    journal: 'Un enterrement est passé, de l’église au cimetière, sous le glas.',
    avant: ['On enterre demain. Le glas sonnera à trois heures. Habillez-vous en noir, si vous avez du noir.', 'Demain, l’enterrement. Le curé a déjà la voix de circonstance.'],
    pendant: ['Ôtez votre chapeau, au moins.', 'Le pauvre… On ne l’a pas vu partir.'],
    apres: ['L’enterrement d’hier… Il y avait plus de monde qu’à la messe. Les morts, ça rassemble.', 'Quand le glas sonne, on compte les coups. On a toujours peur d’entendre son propre âge.', 'Le fossoyeur dit que la terre était lourde, hier. Il dit ça à chaque fois.'],
  },
});
// le mort qu'on enterre : un habitant mort ces trois derniers jours (pas encore enterré par nous), sinon quelqu'un des écarts
function hfMortDuJour(d, retenir) {
  const S = hasardF.S(), s = farm.s, faits = S.mem.enterres || (S.mem.enterres = []);
  const v = (s.dead || []).filter((x) => x.day >= d - 3 && !faits.includes(x.id)).pop();
  if (v) {
    if (retenir) { faits.push(v.id); while (faits.length > 40) faits.shift(); }
    const n = npcs.byId && npcs.byId[v.id];
    return { id: v.id, nom: 'de ' + v.name + (n && n.d.surname ? ' ' + n.d.surname : '') };
  }
  const r = mulberry32((s.seed ^ (d * 7349)) >>> 0);
  const prenom = ['Barthélemy', 'Anselme', 'Mathurin', 'Hippolyte', 'Prosper', 'Célestin', 'Désiré', 'Onésime'][(r() * 8) | 0], nom = HF_NOMS[(r() * HF_NOMS.length) | 0];
  return { id: null, nom: pick([`du vieux ${prenom} ${nom}, un journalier des Combes`, `du père ${prenom} ${nom}, qui avait la ferme du bas`, `de la veuve ${nom}, qui avait quatre-vingt-dix ans`]) };
}

// ---------------------------------------------------------------- 3. l'enfant perdu
const HF_LIEUX_ENFANT = ['chene', 'source', 'cercle_fees', 'pierre_dame', 'pierre_offrandes', 'moulin', 'lavoir', 'clairiere', 'menhirs', 'dolmen', 'bergerie', 'calvaire0', 'calvaire1', 'calvaire2', 'calvaire3', 'calvaire4', 'charbonniere', 'pont_riviere', 'pont_riviere1', 'campement2'];
hfDef('enfant_perdu', {
  cat: 'village', poids: 1.1, premier: 5, ecart: 12, public: true, duree: 9.5, fenetre: 3,
  peut: (c) => !c.P.storm && !c.pluieA(10, 16),
  heure: (c, r) => 10 + r * 4.5,
  pret: (X) => X.ville || X.hameau,
  sansNous: () => true,
  lancer(E) {
    const w = game.world, V = hfVillageProche(), p = game.player.pos;
    // un lieu-dit à quelques centaines de pas du village
    const cand = HF_LIEUX_ENFANT.map((k) => w.lm[k]).filter((L) => L && Math.hypot(L.x - V.x, L.z - V.z) > 110 && Math.hypot(L.x - V.x, L.z - V.z) < 420);
    const L = cand.length ? pick(cand) : null;
    if (!L) return false;
    const P = hfPoint(L.x, L.z, 4, 12, { r: 0.6 }) || { x: L.x + 5, z: L.z + 5 };
    E.lieu = L.name || 'le bois'; E.prenom = pick(HF_PRENOMS_H.slice(-6).concat(['Jules', 'Victor', 'Louis']));
    E.enfant = hfPerso(hfLook('enfant'), P.x, P.z, { loin: 90, nom: E.prenom, voix: 1.7, vit: 2.4 });
    E.enfant.h = Math.random() * TAU; E.enfant.pose = { sit: 1, lookP: 0.4 };
    const Pm = hfPoint(p[0], p[2], 8, 14, { r: 0.5 }) || { x: p[0] + 8, z: p[2] };
    E.mere = hfPerso(hfLook('paysanne', { top: '#6a4a3a', hat: 'bonnet' }), Pm.x, Pm.z, { loin: 110, nom: 'Une mère', voix: 1.3, vit: 1.6 });
    E.etat = 'cherche'; E.appelT = 1; E.pleurT = 2; E.dit = false; E.suit = false; E.v0 = [V.x, V.z];
    hfAller(E.mere, [[p[0] + 1.5, p[2] + 1.5]], 2);
    hasardF.cible(E, { pos: () => [E.enfant.x, E.enfant.y + 0.6, E.enfant.z], r: 2.6, cos: 0.6, lab: 'Prendre l’enfant par la main', vis: () => E.etat === 'cherche' && !E.suit, use() {
      E.suit = true; E.enfant.pose = {};
      hfDit(E.enfant, pick(['Je veux voir maman…', 'Je me suis perdu… le chemin a tourné tout seul.', 'Vous connaissez ma maman ?']), 3.5);
    } });
    hasardF.cible(E, { pos: () => [E.mere.x, E.mere.y + 1.3, E.mere.z], r: 3, lab: 'Parler à la femme', vis: () => E.etat === 'cherche' && E.dit && !E.suit, use() { hfDit(E.mere, `${E.prenom}… Il parlait d’aller voir ${E.lieu}. C’est loin pour ses petites jambes.`, 4.5); } });
  },
  maj(E, dt, eye) {
    const M = E.mere, K = E.enfant, p = game.player.pos;
    if (E.etat === 'cherche') {
      // la mère vient au joueur, demande, puis cherche en appelant
      if (!E.dit) { if (hfMarche(M, dt) || hfDistJ(M.x, M.z) < 3) { E.dit = true; hfFace(M, p[0], p[2], 1); hfDit(M, `Vous n’auriez pas vu mon petit ${E.prenom} ? Il est parti ce matin… Il parlait d’aller voir ${E.lieu}.`, 5); hasardF.noter(E, `Une femme cherchait son petit, ${E.prenom}. Il parlait d’aller voir ${E.lieu}.`); E.rencontre = true; } }
      else {
        if (!M.chemin || M.arrive) { const a = Math.random() * TAU; hfAller(M, [[E.v0[0] + Math.sin(a) * 25, E.v0[1] + Math.cos(a) * 25]], 1.3); }
        hfMarche(M, dt);
        E.appelT -= dt;
        if (E.appelT <= 0) { E.appelT = 6 + Math.random() * 5; if (hfDistJ(M.x, M.z) < 90) { hfSon([M.x, M.y + 1.5, M.z], () => sound.hfAppel && sound.hfAppel(1)); if (hfDistJ(M.x, M.z) < 25 && !ui.panel) ui.subtitle('Une mère', `${E.prenom} ! ${E.prenom} !`, 2); } }
      }
      // l'enfant pleure ; s'il suit, il trottine derrière
      if (!E.suit) {
        E.pleurT -= dt;
        if (E.pleurT <= 0) { E.pleurT = 5 + Math.random() * 4; if (hfDistJ(K.x, K.z) < 45) hfSon([K.x, K.y + 0.8, K.z], () => sound.hfSanglot && sound.hfSanglot(1)); }
      } else {
        const d = Math.hypot(K.x - p[0], K.z - p[2]);
        if (d > 2.2) { if (!K.chemin || K.ci >= K.chemin.length || Math.random() < dt * 2) hfAller(K, [[p[0], p[2]]], d > 8 ? 3.4 : 2.2); hfMarche(K, dt); } else K.move = lerp(K.move, 0, Math.min(1, dt * 6));
        if (Math.hypot(K.x - M.x, K.z - M.z) < 5) {
          E.etat = 'retrouve'; E.t1 = 0;
          hfDit(M, pick([`${E.prenom} ! Mon Dieu… Ne me refais jamais ça. Jamais.`, `Te voilà… te voilà. Merci, merci à vous. Que Dieu vous garde.`]), 4.5);
          farm.earn(8); sound.coin && sound.coin();
          hasardF.bienfait('enfant');
          hasardF.noter('enfant_perdu', `J’ai ramené le petit ${E.prenom} à sa mère. Il avait passé la matinée à pleurer près de ${E.lieu}.`);
          for (const n of hfGens(M.x, M.z, 40)) npcs.addAmitie(n, 6);
        }
      }
      if (npcs.hour() > 20.5) { E.fini = 'nuit'; }
    } else if (E.etat === 'retrouve') {
      E.t1 += dt;
      M.pose = E.t1 < 6 ? { reach: 0.6 } : {}; K.pose = {};
      if (E.t1 > 8) { if (!M.retour) { M.retour = true; hfAller(M, [[E.v0[0], E.v0[1]]], 1.2); hfAller(K, [[E.v0[0] + 0.6, E.v0[1]]], 1.2); } hfMarche(M, dt); hfMarche(K, dt); }
      if (E.t1 > 40) E.fini = 'fin';
    }
    void eye;
  },
  dessin(E, buf, sbuf, cam, t) { if (E.etat !== 'fin') { hfDessine(E.mere, buf, sbuf, cam, t); hfDessine(E.enfant, buf, sbuf, cam, t); } },
  fin(E, raison) { if (raison === 'nuit' && E.rencontre) hasardF.noter('enfant_perdu', `Le petit ${E.prenom} a été retrouvé à la nuit tombée par les hommes du village, près de ${E.lieu}. Il avait froid.`); },
  txt: {
    journal: 'Un enfant s’est perdu ; sa mère l’a cherché toute la journée.',
    pendant: ['Un petit s’est perdu ! Si vous le voyez, ramenez-le !'],
    apres: ['Le petit qui s’était perdu, hier… On l’a retrouvé. Il dit qu’une dame l’a accompagné un bout de chemin. Il n’y avait pas de dame.', 'Les enfants vont là où on leur dit de ne pas aller. C’est leur métier.', 'Sa mère a vieilli de dix ans en une journée. Lui a déjà oublié.'],
  },
});

// ---------------------------------------------------------------- 4. le cheval échappé
hfDef('cheval_echappe', {
  cat: 'village', poids: 1, premier: 4, ecart: 10, public: true, duree: 8, fenetre: 3,
  peut: (c) => !c.P.storm,
  heure: (c, r) => 9 + r * 7,
  pret: (X) => X.dehors && !X.ville && !!game.world.lm.ranch && Math.hypot(X.pos[0] - game.world.lm.ranch.x, X.pos[2] - game.world.lm.ranch.z) < 650,
  sansNous: () => true,
  lancer(E) {
    const e = game.player.eyePos(), f = cameraBasis(game.player.yaw, 0).f, a = Math.atan2(f[0], f[2]);
    const P = hfPoint(e[0], e[2], 30, 45, { a, ouv: 1.6, r: 1.2 });
    if (!P) return false;
    E.nom = pick(['Comète', 'Bijou', 'Fanfan', 'Pompon', 'Sultan', 'Mirza', 'Ulysse']);
    E.ch = hfBete('horse', P.x, P.z, { v: 2, loin: 130, vit: 6 });
    const b = a + Math.PI / 2 * (Math.random() < 0.5 ? 1 : -1);
    hfAller(E.ch, [[P.x + Math.sin(b) * 35, P.z + Math.cos(b) * 35]], 7);
    E.etat = 'court'; E.hennT = 1; E.R = game.world.lm.ranch;
    hasardF.cible(E, { pos: () => [E.ch.x, E.ch.y + 1.2, E.ch.z], r: 2.8, lab: 'Saisir la longe', vis: () => E.etat === 'broute', use() { E.etat = 'mene'; sound.animal && sound.animal('horse', 0, 0.5); hfPense('(Il se laisse faire. Il a l’air soulagé qu’on décide pour lui.)', 3); } });
  },
  maj(E, dt) {
    const F = E.ch, p = game.player, d = hfDistJ(F.x, F.z);
    E.hennT -= dt;
    if (E.hennT <= 0) { E.hennT = 9 + Math.random() * 9; if (d < 80 && E.etat !== 'mene') hfSon([F.x, F.y + 1.6, F.z], () => sound.animal && sound.animal('horse', 0, 0.9)); }
    if (E.etat === 'court') { F.run = true; if (hfMarche(F, dt)) { E.etat = 'broute'; F.pose = { graze: 1 }; } if (!E.note && d < 60) { hasardF.noter(E, `Un cheval échappé du ranch, ${E.nom}, courait les prés, sellé, la longe traînant.`); hfPense('(Un cheval sellé, sans cavalier. Il traîne sa longe.)', 3.5); } }
    else if (E.etat === 'broute') {
      F.pose = { graze: 0.8 + Math.sin(game.time * 0.7) * 0.2 }; F.move = 0;
      // on court vers lui : il repart
      if (d < 11 && p.sprinting) { const a = Math.atan2(F.x - p.pos[0], F.z - p.pos[2]); hfAller(F, [[F.x + Math.sin(a) * 25, F.z + Math.cos(a) * 25]], 6.5); F.pose = {}; E.etat = 'court'; }
    } else if (E.etat === 'mene') {
      F.pose = {};
      const dd = Math.hypot(F.x - p.pos[0], F.z - p.pos[2]);
      if (dd > 2.6) { if (!F.chemin || F.ci >= F.chemin.length || Math.random() < dt * 2) hfAller(F, [[p.pos[0], p.pos[2]]], clamp(dd * 0.9, 1.2, 6)); hfMarche(F, dt); } else F.move = lerp(F.move, 0, Math.min(1, dt * 5));
      if (E.R && Math.hypot(F.x - E.R.x, F.z - E.R.z) < 20) {
        E.etat = 'rendu';
        const n = npcs.byId && npcs.byId.eleveuse;
        if (n && n.st.alive) { npcs.addAmitie(n, 15); if (!ui.panel) ui.subtitle(n.name, `${E.nom} ! Où t’étais-tu encore fourré… Merci à vous. Tenez, pour la peine.`, 4); }
        else hfPense('(Le valet du ranch reprend la longe sans un mot, et vous tend quelques pièces.)', 3.5);
        farm.earn(12); sound.coin && sound.coin();
        hasardF.bienfait('cheval');
        hasardF.noter('cheval_echappe', `J’ai ramené au ranch ${E.nom}, un cheval échappé qui courait les prés.`);
        setTimeout(() => { if (hasardF.actifs.cheval_echappe === E) E.fini = 'fin'; }, 6000);
      }
    }
    if (npcs.hour() > 20.5 && E.etat !== 'rendu') E.fini = 'nuit';
  },
  dessin(E, buf, sbuf, cam, t) { hfDessine(E.ch, buf, sbuf, cam, t); },
  fin(E, raison) { if (raison === 'nuit' && E.note) hasardF.noter('cheval_echappe', `Le cheval échappé, ${E.nom}, est rentré seul à l’écurie à la nuit. Il avait mangé les choux de quelqu’un.`); },
  txt: {
    journal: 'Un cheval s’est échappé du ranch.',
    apres: ['Un cheval du ranch s’est sauvé, hier. Il a traversé trois champs et une lessive.', 'L’éleveuse dit que ses chevaux se sauvent quand le temps va tourner. Moi je dis qu’ils se sauvent parce qu’ils sont chevaux.'],
  },
});

// ---------------------------------------------------------------- 5. les saltimbanques sur la place
hfDef('saltimbanques', {
  cat: 'village', poids: 1.1, premier: 5, ecart: 12, public: true, annonce: true, duree: 2.6, fenetre: 2,
  peut: (c) => ['marche', 'foire', 'semailles', 'veillee', 'fer', 'peche'].includes(c.dow) && !c.pluieA(13, 18),
  heure: (c, r) => 13.5 + r * 2,
  pret: (X) => X.ville,
  sansNous: () => true,
  lancer(E) {
    const w = game.world, L = w.lm.place || { x: w.townInfo.x, z: w.townInfo.z };
    const P = hfPoint(L.x, L.z, 3, 9, { r: 2.5, arbres: false, pente: 0.8 }) || { x: L.x + 4, z: L.z + 4 };
    E.x = P.x; E.z = P.z; E.y = hfSol(P.x, P.z);
    const mk = (look, dx, dz, o) => { const F = hfPerso(look, P.x + dx, P.z + dz, Object.assign({ loin: 110 }, o)); F.h = Math.atan2(-dx, -dz) + Math.PI; return F; };
    E.jongleur = mk({ skin: '#d8ae8a', hair: '#2a1a12', top: '#a02a24', bottom: '#e8d020', hat: 'bonnet', hatCol: '#2a6a2a' }, 0, 0, { acc: HF_ACC.balles, nom: 'Le jongleur' });
    E.cracheur = mk({ skin: '#c89a78', hair: '#1a1210', top: '#2a2a2a', bottom: '#6a2a20', beard: 'moustache', build: 'rond' }, 2.6, -0.8, { nom: 'Le cracheur de feu' });
    E.tambour = mk({ skin: '#d8ae8a', hair: '#4a3020', top: '#3a5a8a', bottom: '#e8e0d0', hat: 'casquette', hatCol: '#a02a24' }, -2.6, -0.6, { acc: HF_ACC.tambour, nom: 'Le tambour' });
    E.fille = mk(hfLook('fillette', { top: '#e8c020', bottom: '#a02a24', height: 0.85 }), 1.2, 2.4, { nom: 'La petite', voix: 1.6 });
    E.ours = hfBete('bear', P.x - 1.5, P.z + 3, { loin: 100, s: 0.85 });
    E.montreur = mk(hfLook('roulier', { top: '#5a3a2a' }), -1.5, 4.2, { acc: null, nom: 'Le montreur d’ours' });
    E.badauds = [];
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + 0.4, r = 6 + Math.random() * 1.5; const F = mk(hfLook(pick(['paysan', 'paysanne', 'vieux', 'enfant', 'paysanne'])), Math.sin(a) * r, Math.cos(a) * r, { voix: 0.8 + Math.random() * 0.6 }); F.h = Math.atan2(-Math.sin(a), -Math.cos(a)); E.badauds.push(F); }
    E.airT = 0.5; E.feuT = 4; E.feu = 0; E.pieces = 0; E.t0 = 0; E.depart = false;
    hasardF.cible(E, { pos: () => [E.fille.x, E.fille.y + 0.9, E.fille.z], r: 2.8, lab: 'Jeter une pièce', vis: () => !E.depart, use() {
      if (!farm.pay(1)) { hfPense('(Vos poches sont vides.)', 2); return; }
      E.pieces++; sound.coin && sound.coin();
      hfDit(E.fille, pick(['Merci, monsieur-dame !', 'Que le bon Dieu vous le rende !', 'Merci ! L’ours vous salue !']), 2.5);
      if (E.pieces === 3) { E.ours.salut = 3; hasardF.noter(E, 'Sur la place, des saltimbanques : un jongleur, un cracheur de feu, un ours qui saluait. J’ai donné trois sous à la petite qui faisait la quête.'); }
    } });
  },
  maj(E, dt, eye) {
    E.t0 += dt;
    const d = Math.hypot(E.x - eye[0], E.z - eye[2]);
    if (!E.depart) {
      // la musique : le fifre du tambour et sa caisse
      E.airT -= dt;
      if (E.airT <= 0) { let du = 0; if (d < 100) hfSon([E.tambour.x, E.tambour.y + 1.3, E.tambour.z], () => { du = sound.hfAir ? sound.hfAir(HF_AIR_FIFRE, { bpm: 132, timbre: 'fifre', vol: 0.035 }) : 0; if (sound.hfTambour) sound.hfTambour('g.c.g.c.gcc.g.c.g.c.g.c.gcc.r...', { bpm: 132, vol: 0.05 }); }); E.airT = (du || 6) + 3; }
      // le feu craché
      E.feuT -= dt; E.feu = Math.max(0, E.feu - dt);
      if (E.feuT <= 0) { E.feuT = 7 + Math.random() * 5; E.feu = 1.2; if (d < 60) hfSon([E.cracheur.x, E.cracheur.y + 1.6, E.cracheur.z], () => sound.noiseHit && sound.noiseHit(sound.at(), 0.9, 'bandpass', 500, 0.7, 0.05, sound.sfx, 1500, 0.08)); }
      if (E.feu > 0) { const F = E.cracheur, fx = Math.sin(F.h), fz = Math.cos(F.h); for (let i = 0; i < 4; i++) particles.spawn(F.x + fx * 0.4, F.y + 1.62, F.z + fz * 0.4, fx * (3 + Math.random() * 2) + (Math.random() - 0.5), 1 + Math.random(), fz * (3 + Math.random() * 2) + (Math.random() - 0.5), [1.3, 0.6, 0.15, 1], 0.14 + Math.random() * 0.1, 0.35 + Math.random() * 0.2, -1, true); }
      E.cracheur.pose = { lookP: E.feu > 0 ? -0.5 : 0, reach: E.feu > 0 ? 0.2 : 0 };
      E.jongleur.pose = { reach: 0.3 + Math.sin(game.time * 8) * 0.1 };
      // l'ours tourne en rond au bout de sa chaîne ; il salue quand on a payé
      const O = E.ours, a = game.time * 0.4;
      O.x = E.montreur.x + Math.sin(a) * 1.8; O.z = E.montreur.z + Math.cos(a) * 1.8; O.y = hfY(O.x, O.z); O.h = a + Math.PI / 2; O.move = 0.4; O.phase += dt * 1.5;
      if (O.salut > 0) { O.salut -= dt; O.pose = { lookP: 0.7, lie: O.salut > 1.5 ? 1 : 0 }; } else O.pose = {};
      for (const [i, F] of E.badauds.entries()) F.pose = Math.sin(game.time * 0.5 + i * 1.7) > 0.93 ? { wave: 1 } : {};
      if (!E.note && d < 30) { hasardF.noter(E); hasardF.reagir('saltimbanques', 'pendant', E.x, E.z); }
      if (Math.random() < dt * 0.15 && d < 40) hfSon([E.x, E.y + 1.5, E.z], () => sound.hfFoule && sound.hfFoule(0.8, 3));
      if (E.age > E.D.duree - 0.5) { E.depart = true; const w = game.world, G = w.bld.garde || w.lm.pont_nord || { x: E.x + 60, z: E.z }; for (const F of [E.jongleur, E.cracheur, E.tambour, E.fille, E.montreur, ...E.badauds]) hfAller(F, hfTrajet(F.x, F.z, G.x + (Math.random() - 0.5) * 4, G.z + (Math.random() - 0.5) * 4), 1.2); }
    } else {
      for (const F of [E.jongleur, E.cracheur, E.tambour, E.fille, E.montreur, ...E.badauds]) if (hfMarche(F, dt)) F.cache = true;
      const M = E.montreur, O = E.ours; O.x = lerp(O.x, M.x - Math.sin(M.h) * 1.6, Math.min(1, dt * 2)); O.z = lerp(O.z, M.z - Math.cos(M.h) * 1.6, Math.min(1, dt * 2)); O.y = hfY(O.x, O.z); O.h = M.h; O.move = M.move; O.phase += dt * 2; O.cache = M.cache;
    }
  },
  dessin(E, buf, sbuf, cam, t) {
    for (const F of [E.jongleur, E.cracheur, E.tambour, E.fille, E.montreur, E.ours, ...E.badauds]) hfDessine(F, buf, sbuf, cam, t);
    // la chaîne de l'ours
    const M = E.montreur, O = E.ours;
    if (!O.cache) { PE.buf = buf; PE.fl = 0; const mx = (M.x + O.x) / 2, mz = (M.z + O.z) / 2, L = Math.hypot(O.x - M.x, O.z - M.z); PE.frame(mx, (M.y + O.y) / 2 + 0.85, mz, Math.atan2(O.x - M.x, O.z - M.z), 1); PE.box(0, 0, 0, 0.03, 0.03, L, [0.4, 0.4, 0.42], TL.metal); }
  },
  lum(E, eye) { return E.feu > 0 ? [{ x: E.cracheur.x, y: E.cracheur.y + 1.7, z: E.cracheur.z, r: 9, c: [1, 0.55, 0.2], d: Math.hypot(E.cracheur.x - eye[0], E.cracheur.z - eye[2]) }] : []; },
  txt: {
    journal: 'Des saltimbanques ont joué sur la place : un jongleur, un cracheur de feu, un ours au bout d’une chaîne.',
    avant: ['Des saltimbanques sont arrivés au pont nord. Ils joueront demain sur la place, avec un ours.', 'Demain, il y aura des bateleurs sur la place. Cachez vos poules et vos filles.'],
    pendant: ['Regarde l’ours ! Il danse !', 'Il crache le feu comme un dragon !'],
    apres: ['Les saltimbanques sont repartis vers le col. L’ours avait l’air plus triste que nous.', 'Le cracheur de feu a bu tout le pétrole du marchand, et il en redemandait.', 'Ils reviennent tous les sept ou huit ans. Les mêmes, à ce qu’il paraît. Ils ne vieillissent pas.'],
  },
});

// ---------------------------------------------------------------- 6. la procession des Rogations : le curé bénit les champs
function hfBenirChamps() {
  const s = farm.s;
  let n = 0;
  for (const k in s.crops || {}) { const c = s.crops[k]; if (!c || !c.c || c.dead || c.tree || !CROPS[c.c]) continue; const H = CROPS[c.c].h; if (c.g < H) { c.g = Math.min(H, c.g + H * 0.15); n++; } }
  if (n) farm.dirtyProps = true;
  return n;
}
hfDef('procession', {
  cat: 'village', poids: 2.2, premier: 3, ecart: 10, public: true, annonce: true, duree: 5.5, fenetre: 2,
  peut: (c) => c.dow === 'semailles' && !c.pluieA(8, 12),
  heure: (c, r) => 9 + r * 1.2,
  pret: (X) => X.ferme || Math.hypot(X.pos[0] - game.world.farm.f.x, X.pos[2] - game.world.farm.f.z) < 160,
  // en notre absence, la procession passe quand même bénir nos champs
  sansNous: () => { const n = hfBenirChamps(); if (n) hasardF.noter('procession', 'Pendant mon absence, la procession des Rogations est passée bénir mes champs. Les rangs ont l’air plus droits.'); return true; },
  lancer(E) {
    const w = game.world, fm = w.farm, fd = fm.field;
    const cx = fd ? (fd.x0 + fd.x1) / 2 : fm.f.x, cz = fd ? (fd.z0 + fd.z1) / 2 : fm.f.z;
    const R = hfRoute(cx, cz, 90, 170, {}) || hfRoute(cx, cz, 50, 250, {});
    if (!R) return false;
    const fin = hfPoint(cx, cz, fd ? 0 : 6, fd ? 10 : 14, { r: 1, arbres: false }) || { x: cx + 6, z: cz };
    const pts = [[R.x, R.z], ...hfTrajet(R.x, R.z, fin.x, fin.z)];
    E.fx = fin.x; E.fz = fin.z;
    const M = [];
    const mk = (look, o) => { const F = hfPerso(look, R.x, R.z, Object.assign({ loin: 120, vit: 0.6 }, o)); M.push(F); return F; };
    E.ban = mk(hfLook('enfant', { top: '#f0ece0', bottom: '#8a2a24', height: 0.8 }), { rang: 0, acc: HF_ACC.banniere });
    E.cure = mk(hfLook('cure'), { rang: 1.3, acc: HF_ACC.croix, nom: npcs.alive && npcs.alive('cure') ? npcs.byId.cure.name : 'Le curé', voix: 0.8 });
    for (let i = 0; i < 7; i++) mk(hfLook(pick(['paysan', 'paysanne', 'vieille', 'paysanne', 'vieux', 'paysan'])), { rang: 2.6 + Math.floor(i / 2) * 1.2, lat: i % 2 ? 0.5 : -0.5, voix: 0.8 + Math.random() * 0.5 });
    E.C = hfCortege(M, pts, 1.3, 0.72);
    E.chantT = 0.5; E.beni = false; E.t1 = 0;
  },
  maj(E, dt) {
    const C = E.C;
    hfCortegeMaj(C, dt, false);
    E.chantT -= dt;
    if (E.chantT <= 0 && !C.fini) {
      // une litanie à trois voix : le chant, l'octave, la quinte
      let du = 0;
      const F = C.membres[3] || C.membres[0];
      if (hfDistJ(F.x, F.z) < 110) hfSon([F.x, F.y + 1.5, F.z], () => { if (!sound.hfAir) return; du = sound.hfAir(HF_LITANIE, { bpm: 64, timbre: 'voix', voyelle: 'o', vol: 0.03 }); sound.hfAir(HF_LITANIE.map(([m, d]) => [m === null ? null : m - 12, d]), { bpm: 64, timbre: 'voix', voyelle: 'o', vol: 0.025 }); sound.hfAir(HF_LITANIE.map(([m, d]) => [m === null ? null : m - 5, d]), { bpm: 64, timbre: 'voix', voyelle: 'a', vol: 0.016 }); });
      E.chantT = (du || 8) + 2.5;
    }
    if (!E.note && hfDistJ(E.cure.x, E.cure.z) < 50) { hasardF.noter(E, 'Un Primedi, la procession des Rogations est passée par les champs, la croix et la bannière devant, en chantant.'); hasardF.reagir('procession', 'pendant', E.cure.x, E.cure.z); }
    if (C.fini) {
      E.t1 += dt;
      for (const F of C.membres) { hfFace(F, E.fx, E.fz, dt); if (F !== E.cure && F !== E.ban) F.pose = { pray: 1 }; }
      if (!E.beni && E.t1 > 3) {
        E.beni = true;
        hfDit(E.cure, 'Benedic, Domine, hos fructus terræ, et custodi eos a grandine et tempestate.', 5.5);
        E.cure.pose = { reach: 0.7 };
        for (let k = 0; k < 40; k++) particles.spawn(E.cure.x, E.cure.y + 1.6, E.cure.z, (Math.random() - 0.5) * 4, 1 + Math.random() * 2, (Math.random() - 0.5) * 4, [0.75, 0.85, 1, 0.8], 0.05, 0.9, 9, false);
        const n = hfBenirChamps();
        if (n && hfDistJ(E.cure.x, E.cure.z) < 40) { hasardF.noter('procession', 'La procession des Rogations s’est arrêtée au bord de mes champs ; le curé les a bénis. Les rangs ont l’air plus droits.'); const c = npcs.byId && npcs.byId.cure; if (c && c.st.alive) npcs.addAmitie(c, 5); }
      }
      if (E.t1 > 30) for (const [i, F] of C.membres.entries()) if (E.t1 > 30 + i * 2) F.cache = true;
      if (E.t1 > 32 + C.membres.length * 2) E.fini = 'fin';
    }
  },
  dessin(E, buf, sbuf, cam, t) { for (const F of E.C.membres) hfDessine(F, buf, sbuf, cam, t); },
  txt: {
    journal: 'Un Primedi, la procession des Rogations est passée bénir les champs.',
    avant: ['Demain, c’est la procession des Rogations. Le curé bénira les champs, même ceux des mécréants.', 'La procession passera demain par les champs du bas. Mettez une croix de buis au bout de vos rangs.'],
    pendant: ['Ora pro nobis…', 'Chantez avec nous, ça ne coûte rien.'],
    apres: ['La procession est passée par vos champs, hier. Vous verrez : ça pousse mieux après. Ou c’est la pluie.', 'Les Rogations… Mon grand-père disait qu’on bénissait les champs pour que la grêle aille chez le voisin.'],
  },
});

// ---------------------------------------------------------------- 7. le baptême : les cloches, les dragées
hfDef('bapteme', {
  cat: 'village', poids: 1.2, premier: 3, ecart: 9, public: true, duree: 1, fenetre: 1.5,
  peut: (c) => ['messe', 'semailles', 'mere'].includes(c.dow) && !c.pluieA(11, 13),
  heure: (c, r) => 11.6 + r * 0.6,
  pret: (X) => X.ville,
  sansNous: () => true,
  lancer(E) {
    const w = game.world, B = w.bld.eglise;
    if (!B) return false;
    const o = B.out, a = Math.atan2(o[0] - B.x, o[1] - B.z);
    E.x = o[0] + Math.sin(a) * 2; E.z = o[1] + Math.cos(a) * 2; E.y = hfSol(E.x, E.z); E.a = a;
    const mk = (look, dx, dz, o2) => { const F = hfPerso(look, E.x + dx, E.z + dz, Object.assign({ loin: 110 }, o2)); F.h = a; return F; };
    E.mere = mk(hfLook('paysanne', { top: '#3a4a6a', apron: '#f0f0f0' }), -0.8, 0, { acc: HF_ACC.bebe });
    E.pere = mk(hfLook('paysan', { top: '#2a2a2a', hat: 'chapeau' }), -1.8, 0.2, {});
    E.parrain = mk(hfLook('bourgeois'), 1, 0.5, { nom: 'Le parrain', voix: 0.9 });
    E.marraine = mk(hfLook('paysanne', { top: '#6a2a4a', hat: 'bonnet' }), 2, 0.2, {});
    E.gamins = [0, 1, 2].map((i) => mk(hfLook(i === 1 ? 'fillette' : 'enfant'), (i - 1) * 2.5, 5, { vit: 2.6 }));
    E.drag = []; E.jetT = 2.5; E.jets = 0; E.carT = 0; E.car = 0; E.pris = 0;
    hasardF.cible(E, { pos: () => { const D = hfDrageeProche(E, 2.2); return D ? [D.x, D.y + 0.1, D.z] : null; }, r: 2.2, cos: 0.5, lab: 'Ramasser des dragées', use() {
      const D = hfDrageeProche(E, 2.2);
      if (!D) return;
      E.drag = E.drag.filter((x) => x !== D); E.pris++;
      farm.give('dragees', 1); sound.pop && sound.pop();
      if (E.pris === 3) hfDit(E.gamins[1], 'Eh ! C’est pour les enfants, les dragées !', 3);
      if (E.pris === 1) hasardF.noter(E, 'Un baptême : les cloches à toute volée, et le parrain qui jetait des dragées aux enfants sur le parvis. J’en ai ramassé.');
    } });
  },
  maj(E, dt) {
    // les cloches à toute volée (trois cloches, en carillon)
    E.carT -= dt;
    if (E.carT <= 0 && E.car < 28) { E.carT = 0.55; E.car++; const P = sound.clocher ? sound.clocher() : null; if (P && hfDistJ(P[0], P[2]) < 400) hfSon(P, () => sound.hfCloche && sound.hfCloche([262, 330, 392][E.car % 3], 0.7)); }
    // le parrain jette des dragées
    E.jetT -= dt;
    if (E.jetT <= 0 && E.jets < 6) {
      E.jetT = 4 + Math.random() * 3; E.jets++;
      E.parrain.pose = { reach: 0.9 }; setTimeout(() => { E.parrain.pose = {}; }, 900);
      for (let i = 0; i < 7; i++) { const a = E.a + (Math.random() - 0.5) * 1.6, r = 2 + Math.random() * 4; E.drag.push({ x: E.parrain.x + Math.sin(a) * r, z: E.parrain.z + Math.cos(a) * r, y: E.y + 2.2, vy: 1.5, col: Math.random() < 0.5 ? [1.2, 1.18, 1.15] : [1.25, 0.95, 1.05], sol: false }); }
    }
    for (const D of E.drag) if (!D.sol) { D.vy -= 9 * dt; D.y += D.vy * dt; const g = hfSol(D.x, D.z) + 0.02; if (D.y <= g) { D.y = g; D.sol = true; } }
    // les gamins courent ramasser
    for (const K of E.gamins) {
      const D = E.drag.filter((x) => x.sol).sort((a, b) => Math.hypot(a.x - K.x, a.z - K.z) - Math.hypot(b.x - K.x, b.z - K.z))[0];
      if (D) { if (!K.chemin || K.cible !== D) { K.cible = D; hfAller(K, [[D.x, D.z]], 2.6); } hfMarche(K, dt); K.run = true; if (Math.hypot(D.x - K.x, D.z - K.z) < 0.4) { E.drag = E.drag.filter((x) => x !== D); K.chemin = null; K.pose = { reach: 0.5 }; } }
      else { K.move = lerp(K.move, 0, Math.min(1, dt * 5)); K.pose = {}; }
    }
    if (!E.note && hfDistJ(E.x, E.z) < 35) { hasardF.noter(E); hasardF.reagir('bapteme', 'pendant', E.x, E.z); }
  },
  dessin(E, buf, sbuf, cam, t) {
    for (const F of [E.mere, E.pere, E.parrain, E.marraine, ...E.gamins]) hfDessine(F, buf, sbuf, cam, t);
    PE.buf = buf; PE.fl = 0;
    for (const D of E.drag) { PE.frame(D.x, D.y, D.z, D.x * 3, 1); PE.box(0, 0.025, 0, 0.06, 0.04, 0.08, D.col, TL.plain); }
  },
  txt: {
    journal: 'Un baptême : les cloches à toute volée, et le parrain qui jetait des dragées aux enfants sur le parvis.',
    pendant: ['Les dragées ! Les dragées !', 'Il est beau, le petit. Il a le nez de son grand-père, le pauvre.'],
    apres: ['On a baptisé le petit, hier. Il a hurlé tout le long. C’est bon signe, dit le curé : le diable sort.', 'Le parrain a jeté des dragées, et des sous aussi. Les gamins se sont battus comme des moineaux.'],
  },
});
function hfDrageeProche(E, r) { const p = game.player.pos; let best = null, bd = r; for (const D of E.drag) { if (!D.sol) continue; const d = Math.hypot(D.x - p[0], D.z - p[2]); if (d < bd) { bd = d; best = D; } } return best; }

// ---------------------------------------------------------------- 8. la rixe à la sortie de l'auberge
hfDef('rixe', {
  cat: 'village', poids: 1, premier: 4, ecart: 10, public: true, duree: 1, fenetre: 1.5,
  peut: (c) => ['veillee', 'foire', 'marche', 'fer', 'chasse'].includes(c.dow) && !c.pluieA(20, 23),
  heure: (c, r) => 21 + r * 1.2,
  pret: (X) => X.ville,
  sansNous: () => true,
  lancer(E) {
    const w = game.world, A = w.bld.auberge;
    if (!A) return false;
    const o = A.out, a = Math.atan2(o[0] - A.x, o[1] - A.z), x = o[0] + Math.sin(a) * 3, z = o[1] + Math.cos(a) * 3;
    E.x = x; E.z = z;
    const n1 = pick(HF_PRENOMS_H), n2 = pick(HF_PRENOMS_H.filter((k) => k !== n1));
    E.A = hfPerso(hfLook('roulier'), x - 0.7, z, { nom: n1, voix: 0.85, loin: 90 });
    E.B = hfPerso(hfLook('paysan', { hat: 'casquette', top: '#5a4a3a' }), x + 0.7, z, { nom: n2, voix: 1.05, loin: 90 });
    E.A.h = Math.PI / 2; E.B.h = -Math.PI / 2;
    E.badauds = [0, 1, 2].map((i) => { const b = a + (i - 1) * 0.8, F = hfPerso(hfLook(pick(['paysan', 'vieux', 'paysanne'])), x + Math.sin(b) * 4.5, z + Math.cos(b) * 4.5, { loin: 90 }); F.h = Math.atan2(x - F.x, z - F.z); return F; });
    E.coupT = 1; E.cri = 0.5; E.etat = 'bagarre'; E.t1 = 0;
    hasardF.cible(E, { pos: () => [x, hfSol(x, z) + 1.3, z], r: 3.2, cos: 0.5, lab: 'Les séparer', vis: () => E.etat === 'bagarre', use() {
      if (Math.random() < 0.3) { play.hurt(4, null, 'Un coup de poing, en séparant deux ivrognes'); hfDit(E.A, 'Toi, mêle-toi de tes oignons !', 2.5); setTimeout(() => hfPense('(Le coup était pour l’autre. Vous l’avez pris quand même.)', 3), 1500); }
      else hfDit(E.B, pick(['Ça va, ça va… On s’amusait.', 'C’est lui qui a commencé ! … Bon. Bon.']), 3);
      E.etat = 'fin'; E.t1 = 0; hasardF.bienfait('rixe');
      hasardF.noter('rixe', 'À la sortie de l’auberge, deux hommes se battaient. Je les ai séparés.');
      const g = npcs.byId && npcs.byId.garde; if (g && g.st.alive) npcs.addAmitie(g, 6);
      hfFinRixe(E);
    } });
  },
  maj(E, dt) {
    if (E.etat === 'bagarre') {
      E.coupT -= dt;
      const k = Math.max(0, E.coupT) < 0.3 ? 1 : 0;
      E.A.pose = { attack: k ? Math.min(1, (0.3 - E.coupT) * 5) : 0, lean: 0.15 }; E.B.pose = { attack: k ? 0 : Math.abs(Math.sin(game.time * 3)) * 0.5, cower: k ? 1 : 0 };
      if (E.coupT <= 0) { E.coupT = 1.2 + Math.random() * 1.6; if (hfDistJ(E.x, E.z) < 50) hfSon([E.x, hfSol(E.x, E.z) + 1.4, E.z], () => sound.hfCoups && sound.hfCoups(1)); [E.A, E.B] = [E.B, E.A]; }
      E.cri -= dt;
      if (E.cri <= 0) { E.cri = 3 + Math.random() * 3; const F = Math.random() < 0.5 ? E.A : E.B; hfDit(F, pick(['Répète un peu, pour voir !', 'Tricheur ! Tu triches aux dés depuis Pâques !', 'Ma sœur ! Tu as parlé de ma sœur !', 'Lâche-moi ! Lâche-moi, je te dis !', 'Tu me dois trois francs !']), 2.5); }
      if (!E.note && hfDistJ(E.x, E.z) < 30) { hasardF.noter(E); hasardF.reagir('rixe', 'pendant', E.x, E.z); }
      if (E.age > 0.7) { E.etat = 'fin'; E.t1 = 0; hfFinRixe(E); }
    } else {
      E.t1 += dt;
      let fin = true;
      for (const F of [E.A, E.B, ...E.badauds]) { if (F.chemin) { if (hfMarche(F, dt)) F.cache = true; else fin = false; } }
      if (fin && E.t1 > 3) E.fini = 'fin';
    }
  },
  dessin(E, buf, sbuf, cam, t) { for (const F of [E.A, E.B, ...E.badauds]) hfDessine(F, buf, sbuf, cam, t); },
  txt: {
    journal: 'À la sortie de l’auberge, deux hommes se sont battus, ivres, devant tout le monde.',
    pendant: ['Arrêtez, vous deux ! Pas devant l’auberge !', 'Allez chercher le garde !'],
    apres: ['La bagarre d’hier soir… Pour une histoire de dés. Ou de femme. Ça finit toujours par une histoire de femme.', 'L’aubergiste dit qu’il ne servira plus ces deux-là. Il dit ça tous les mois.'],
  },
});
function hfFinRixe(E) {
  const p = game.player.pos;
  for (const F of [E.A, E.B, ...E.badauds]) { F.pose = {}; const a = Math.atan2(F.x - E.x, F.z - E.z) + (Math.random() - 0.5) * 0.6; hfAller(F, [[F.x + Math.sin(a) * 22, F.z + Math.cos(a) * 22]], 1.1); }
  void p;
}

// ---------------------------------------------------------------- 9. une grange brûle au hameau
hfDef('incendie', {
  cat: 'village', poids: 0.8, premier: 6, ecart: 18, public: true, duree: 3, fenetre: 2,
  peut: (c) => !c.P.rain && (c.P.heat || c.etat(20) === 'clear') && !c.noire,
  heure: (c, r) => 21.3 + r * 1.5,
  pret: (X) => { const H = game.world.lm.hameau; return !!H && X.dehors && Math.hypot(X.pos[0] - H.x, X.pos[2] - H.z) < 380; },
  sansNous: () => true,
  lancer(E) {
    const w = game.world, H = w.lm.hameau;
    const B = ['maison_hameau_a', 'maison_hameau_b', 'ranch'].map((k) => w.bld[k]).filter(Boolean)[0];
    if (!H || !B) return false;
    // le feu prend dans le toit d'une grange, à côté de la maison
    E.x = B.x; E.z = B.z; E.y = hfToit(B.x, B.z) ?? (B.y + (B.H || 4) + 1);
    // l'eau la plus proche (rivière, mare), ou le centre du hameau
    let ex = H.x, ez = H.z;
    for (let r = 8; r < 120; r += 6) { let ok = false; for (let a = 0; a < TAU; a += 0.4) { const x = B.x + Math.sin(a) * r, z = B.z + Math.cos(a) * r; if (w.heightAt(x, z) < w.waterLevel) { ex = x; ez = z; ok = true; break; } } if (ok) break; }
    E.ex = ex; E.ez = ez;
    E.feu = 0.3; E.aide = 0; E.t0 = 0; E.sonT = 0; E.tocsinT = 0; E.toc = 0;
    // la chaîne des seaux
    E.chaine = [];
    const n = 6, d0 = Math.hypot(ex - B.x, ez - B.z);
    for (let i = 0; i < n; i++) { const t = 0.15 + 0.7 * i / (n - 1), x = lerp(B.x, ex, t) + (Math.random() - 0.5), z = lerp(B.z, ez, t) + (Math.random() - 0.5); const F = hfPerso(hfLook(i % 2 ? 'paysan' : 'paysanne', { hat: undefined }), x, z, { acc: HF_ACC.seau, loin: 140 }); F.h = Math.atan2(B.x - ex, B.z - ez) + Math.PI / 2; E.chaine.push(F); }
    void d0;
    hasardF.cible(E, { pos: () => { const F = E.chaine[2]; return [F.x, F.y + 1.1, F.z]; }, r: 3.5, cos: 0.4, lab: 'Passer les seaux', vis: () => E.feu > 0.15, use() { E.aide++; E.feu = Math.max(0, E.feu - 0.06); sound.splash && sound.splash(); if (E.aide === 1) hfPense('(Le seau est lourd, l’eau glacée vous coule dans les manches.)', 3); if (E.aide === 6) { hasardF.bienfait('incendie'); const n = npcs.byId && npcs.byId.eleveuse; if (n && n.st.alive) npcs.addAmitie(n, 10); } } });
  },
  maj(E, dt, eye) {
    E.t0 += dt;
    // le feu monte d'abord, puis la chaîne le fait reculer (plus vite si l'on aide)
    if (E.t0 < 40) E.feu = Math.min(1, E.feu + dt * 0.02);
    else E.feu = Math.max(0, E.feu - dt * (0.004 + E.aide * 0.0015));
    const d = Math.hypot(E.x - eye[0], E.z - eye[2]), f = E.feu;
    if (f > 0.02) {
      if (Math.random() < dt * 40 * f) particles.spawn(E.x + (Math.random() - 0.5) * 5, E.y - 0.5 + Math.random(), E.z + (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 0.8, 2 + Math.random() * 3, (Math.random() - 0.5) * 0.8, [1.3, 0.55, 0.12, 1], 0.15 + Math.random() * 0.15, 0.6 + Math.random() * 0.6, -0.8, true);
      if (Math.random() < dt * 8 * f) { particles.spawn(E.x + (Math.random() - 0.5) * 3, E.y + 1.5, E.z + (Math.random() - 0.5) * 3, 0.4, 1.8 + Math.random(), 0.2, [0.25, 0.22, 0.2, 0.5], 0.8, 5, -0.05, false); particles.list[particles.list.length - 1].grow = 4; }
    }
    // le tocsin, au début
    E.tocsinT -= dt;
    if (E.tocsinT <= 0 && E.toc < 30 && E.t0 > 2) { E.tocsinT = 0.45; E.toc++; if (d < 500) hfSon([E.x, E.y + 3, E.z], () => sound.hfCloche && sound.hfCloche(440, clamp(1.2 - d / 400, 0.2, 1))); }
    E.sonT -= dt;
    if (E.sonT <= 0) { E.sonT = 2.4; if (d < 120) hfSon([E.x, E.y, E.z], () => { sound.hfFeu && sound.hfFeu(f); if (Math.random() < 0.5) sound.hfFoule && sound.hfFoule(1, 3); }); }
    for (const [i, F] of E.chaine.entries()) { F.pose = { reach: 0.4 + Math.sin(game.time * 3 + i * 1.2) * 0.3 }; F.phase = i * 1.2; }
    if (!E.note && d < 400 && f > 0.2) { hasardF.noter(E, 'Une nuit, une grange a brûlé au hameau. On voyait la lueur de loin ; on a fait la chaîne jusqu’à l’eau.'); hasardF.reagir('incendie', 'pendant', E.x, E.z); }
    if (E.t0 > 60 && E.feu <= 0.001) E.fini = 'fin';
  },
  dessin(E, buf, sbuf, cam, t) {
    for (const F of E.chaine) hfDessine(F, buf, sbuf, cam, t);
    if (E.feu > 0.05) { PE.buf = buf; PE.fl = FX_EMIT; for (let i = 0; i < 6; i++) { const a = i * 1.1 + t * 1.5; PE.frame(E.x + Math.cos(a) * 1.8, E.y - 0.4 + Math.sin(t * 6 + i) * 0.3, E.z + Math.sin(a) * 1.8, a, 1); PE.box(0, 0, 0, 0.9 * E.feu, 1.6 * E.feu, 0.9 * E.feu, [1.4, 0.6, 0.15], TL.flame); } PE.fl = 0; }
  },
  lum(E, eye) { return E.feu > 0.05 ? [{ x: E.x, y: E.y + 1, z: E.z, r: 30 * E.feu + 6, c: [1.1, 0.55, 0.2], d: Math.hypot(E.x - eye[0], E.z - eye[2]) }] : []; },
  fin(E) { if (E.aide >= 6) hasardF.noter('incendie', 'La grange du hameau a brûlé ; j’ai passé les seaux avec les autres jusqu’à ce que le feu tombe. On a sauvé la maison.'); },
  txt: {
    journal: 'Une grange a brûlé au hameau, une nuit sans pluie.',
    pendant: ['Au feu ! Au feu ! Les seaux, vite !', 'Faites la chaîne ! Jusqu’à l’eau !'],
    apres: ['La grange du hameau a brûlé, cette nuit. Un fanal renversé, qu’on dit. Ou quelqu’un.', 'Sans la chaîne, la maison y passait aussi. Tout le monde a porté des seaux. Même le curé, en soutane.', 'Il faisait si sec. Une étincelle, et voilà.'],
  },
});

// ---------------------------------------------------------------- 10. le charivari
hfDef('charivari', {
  cat: 'village', poids: 0.9, premier: 5, ecart: 14, public: true, duree: 1.2, fenetre: 1.5,
  peut: (c) => !c.pluieA(21, 24) && c.dow !== 'morts',
  heure: (c, r) => 21.3 + r * 1,
  pret: (X) => X.ville,
  sansNous: () => true,
  lancer(E) {
    const w = game.world, B = pick(['maison_a', 'maison_b', 'maison_c', 'maison_d'].map((k) => w.bld[k]).filter(Boolean));
    if (!B) return false;
    const o = B.out, a = Math.atan2(o[0] - B.x, o[1] - B.z);
    E.x = o[0] + Math.sin(a) * 3.5; E.z = o[1] + Math.cos(a) * 3.5; E.a = a;
    E.veuf = pick(['le vieux Mathurin', 'le père Anselme', 'le veuf Prosper', 'le meunier']);
    E.bande = [];
    for (let i = 0; i < 6; i++) { const b = a + (i - 2.5) * 0.35, r = 1.5 + (i % 2) * 1.2; const F = hfPerso(hfLook(pick(['paysan', 'paysan', 'paysanne', 'enfant'])), E.x + Math.sin(b) * r, E.z + Math.cos(b) * r, { acc: i === 5 ? null : HF_ACC.casserole, loin: 100, voix: 0.9 + Math.random() * 0.4 }); F.h = a + Math.PI; E.bande.push(F); }
    E.bruitT = 0.3; E.criT = 2; E.t0 = 0; E.joint = false; E.paye = false;
    hasardF.cible(E, { pos: () => [E.x, hfSol(E.x, E.z) + 1.2, E.z], r: 3.5, cos: 0.4, lab: 'Taper sur une casserole avec eux', vis: () => !E.joint && !E.paye, use() { E.joint = true; hfDit(E.bande[0], 'Ha ! Voilà quelqu’un qui sait vivre ! Tapez plus fort !', 3); hasardF.noter(E, `Un soir, j’ai fait le charivari sous les fenêtres ${E.veuf.replace(/^le /, 'du ')}, qui s’est remarié avec une jeunesse. On a tapé sur des casseroles jusqu’à ce qu’il paie à boire.`); } });
  },
  maj(E, dt) {
    E.t0 += dt;
    const d = hfDistJ(E.x, E.z);
    if (!E.paye) {
      E.bruitT -= dt;
      if (E.bruitT <= 0) { E.bruitT = 3.2; if (d < 120) hfSon([E.x, hfSol(E.x, E.z) + 1.4, E.z], () => sound.hfCharivari && sound.hfCharivari(E.joint ? 1.25 : 1)); }
      E.criT -= dt;
      if (E.criT <= 0) { E.criT = 4 + Math.random() * 3; hfDit(pick(E.bande), pick([`Hou ! Hou ! ${E.veuf[0].toUpperCase() + E.veuf.slice(1)}, paie à boire !`, 'Une jeunesse de vingt ans ! À son âge !', 'On ne dormira pas, et toi non plus !', 'Paie, et on s’en va !']), 2.5); }
      if (!E.note && d < 40) { hasardF.noter(E, `Un charivari sous les fenêtres ${E.veuf.replace(/^le /, 'du ')}, remarié avec une jeunesse : des casseroles, une corne, des cris, jusqu’à ce qu’il paie à boire.`); hasardF.reagir('charivari', 'pendant', E.x, E.z); }
      if (E.t0 > 55) {
        // la fenêtre s'ouvre, une bourse tombe : on va boire à l'auberge
        E.paye = true; sound.coin && sound.coin();
        hfDit(E.bande[0], 'Il a payé ! À l’auberge !', 3);
        const A = game.world.bld.auberge;
        for (const F of E.bande) hfAller(F, A ? hfTrajet(F.x, F.z, A.out[0], A.out[1]) : [[F.x + 30, F.z]], 1.3);
      }
    } else { let fin = true; for (const F of E.bande) if (hfMarche(F, dt)) F.cache = true; else fin = false; if (fin) E.fini = 'fin'; }
  },
  dessin(E, buf, sbuf, cam, t) { for (const F of E.bande) hfDessine(F, buf, sbuf, cam, t); },
  txt: {
    journal: 'Un charivari, sous les fenêtres d’un veuf remarié avec une jeunesse.',
    pendant: ['C’est un charivari ! Il s’est remarié avec une gamine !', 'Tapez, tapez ! Il finira par payer.'],
    apres: ['Le charivari d’hier soir… Le pauvre homme a payé deux tonneaux pour avoir la paix. Elle a vingt ans, lui soixante-dix. Il dit que c’est l’amour.', 'Le curé est contre les charivaris. Le maire est pour, quand il n’est pas visé.'],
  },
});
