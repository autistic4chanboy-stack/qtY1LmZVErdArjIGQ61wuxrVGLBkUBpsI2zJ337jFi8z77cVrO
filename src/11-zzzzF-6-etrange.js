// ============================================================================
//  LE HASARD DE LA VALLÉE (6) : L'ÉTRANGE — onze événements (plus fréquents
//  quand l'esprit du personnage s'assombrit : bizarrerie()).
//  - lettre_autre : une lettre de 1812 pour quelqu'un qui habitait la ferme ;
//  - pas_neige : des pas dans la neige, qui s'arrêtent net au milieu d'un pré ;
//  - chanson_puits : la nuit, une berceuse monte d'un puits ;
//  - table_mise : au hameau abandonné, une table mise pour quatre, la soupe fume ;
//  - chien_noir : la nuit, sur la route, un grand chien noir vous suit ;
//  - dame_blanche : une femme en blanc demande qu'on l'accompagne jusqu'au pont ;
//  - messe_morts : la nuit du Vorndi, à minuit, on chante dans l'église fermée ;
//  - chasse_volante : la chasse fantastique passe dans le ciel ;
//  - meneur_loups : au crépuscule, un homme en cape, suivi de loups dociles ;
//  - tambour_dessous : un tambour bat sous la terre, très loin ;
//  - fenetre_allumee : une fenêtre éclairée au hameau abandonné.
// ============================================================================
defItem('montre_soldat', 'Montre d’un soldat', 'tresor', 35, ['montre', '#b89a50'], { desc: 'Une montre en laiton, arrêtée à cinq heures moins dix, enveloppée dans un morceau de capote bleue. Au dos, gravé au couteau : « J. D. — Smolensk ».' });
LOOT.hf_montre = { rolls: [1, 1], items: [['montre_soldat', 1, 1, 1]] };
// la cachette de la lettre de 1812 : sous la pierre du seuil (retrouvée à chaque chargement tant qu'on n'a pas creusé)
function hfPoserMontre() {
  const S = hasardF.S(), M = S.mem.montre, w = game.world;
  if (!M || !w || farm.s.flags['dug_hf_montre']) return;
  if (w.inter.some((i) => i.id === 'hf_montre')) return;
  w.inter.push({ kind: 'dig', id: 'hf_montre', x: M.x, y: hfSol(M.x, M.z) + 0.3, z: M.z, name: 'Creuser sous la pierre du seuil', data: { loot: 'hf_montre' } });
}
HOOKS.load.push(() => { if (farm.s && game.world) try { hfPoserMontre(); } catch (e) { /* rien */ } });

// ---------------------------------------------------------------- 1. une lettre qui n'est pas pour vous
hfDef('lettre_autre', {
  cat: 'etrange', etrange: true, poids: 1, premier: 5, fois: 1, duree: 0.2, fenetre: 10,
  peut: () => true,
  heure: (c, r) => 7 + r * 3,
  pret: () => true,
  lancer(E) {
    const w = game.world, B = w.bld.ferme;
    if (!B) return false;
    const o = B.out, a = Math.atan2(o[0] - B.x, o[1] - B.z);
    hasardF.S().mem.montre = { x: o[0] + Math.sin(a) * 0.4 + Math.cos(a) * 1.3, z: o[1] + Math.cos(a) * 0.4 - Math.sin(a) * 1.3 };
    hfPoserMontre();
    farm.mail('Sans expéditeur', 'À Madame veuve Delorme, la vieille ferme', 'Ma Jeanne,\n\nJe t’écris de très loin, d’un pays où l’hiver commence en septembre. Nous marchons vers une ville qui s’appelle Smolensk. On dit qu’après, ce sera Moscou, et qu’après Moscou on rentrera. Je ne sais pas ce qu’il y a après Moscou.\n\nJ’ai laissé ma montre sous la pierre du seuil, comme je te l’avais dit. Si je ne reviens pas pour les moissons, ne la vends pas. Donne-la au petit quand il saura lire l’heure.\n\nJe pense à la ferme tous les soirs. Je la vois mieux que ce qui est devant moi.\n\nTon Jean\n\nLe 2 août 1812', { strange: true });
    hasardF.noter(E, 'Une lettre est arrivée à la ferme, adressée à une Madame veuve Delorme. Elle était datée de 1812.');
    E.fini = 'fin';
  },
  txt: {
    journal: 'Une lettre de 1812, pour quelqu’un d’autre.',
    apres: ['La postière dit qu’elle a trouvé un sac de vieilles lettres dans son grenier. Elle ne sait pas qui les a mises là. Elle dit qu’elles sentent la neige.', 'Les Delorme ? Ils avaient la vieille ferme, du temps de mon arrière-grand-père. Le fils est parti avec l’Empereur. Il n’est pas revenu. Pourquoi ?'],
  },
});

// ---------------------------------------------------------------- 2. des pas dans la neige qui s'arrêtent net
hfDef('pas_neige', {
  cat: 'etrange', etrange: true, poids: 3, premier: 5, ecart: 12, duree: 3, fenetre: 4,
  peut: (c) => c.neige,
  heure: (c, r) => 7.5 + r * 3,
  pret: (X) => X.dehors && evenements.S().neigeSol > 0.25 && !X.ville,
  sansNous: () => false,
  lancer(E) {
    const p = game.player.pos;
    const D = hfPoint(p[0], p[2], 25, 40, { r: 1, arbres: false });
    if (!D) return false;
    // une trace qui vient de loin et s'arrête au milieu du pré
    const a = Math.random() * TAU;
    E.pas = [];
    for (let i = 0; i < 34; i++) { const t = i * 0.72, x = D.x - Math.sin(a) * (34 * 0.72 - t), z = D.z - Math.cos(a) * (34 * 0.72 - t), s = i % 2 ? 1 : -1; E.pas.push({ x: x + Math.cos(a) * 0.14 * s, z: z - Math.sin(a) * 0.14 * s, r: a, y: hfSol(x, z) + 0.03 }); }
    E.fx = D.x; E.fz = D.z; E.a = a; E.fin1 = false;
  },
  maj(E) {
    const d = hfDistJ(E.fx, E.fz);
    if (!E.note && hfRegarde(E.pas[20].x, E.pas[20].y, E.pas[20].z, 0.85) && hfDistJ(E.pas[20].x, E.pas[20].z) < 30) { hasardF.noter(E, 'Dans la neige fraîche, une trace de pas venait de loin et s’arrêtait net au milieu du pré. Pas de retour.'); }
    if (!E.fin1 && d < 1.6) {
      E.fin1 = true;
      hfPense('(Les pas s’arrêtent là. Ni retour, ni rien autour. Au-dessus, le ciel blanc.)', 5);
      // derrière vous, deux pas de plus, tournés vers vous
      const p = game.player, b = p.yaw;
      for (let i = 0; i < 2; i++) { const x = p.pos[0] + Math.sin(b) * (1.4 + i * 0.7), z = p.pos[2] + Math.cos(b) * (1.4 + i * 0.7); E.pas.push({ x, z, r: b + Math.PI, y: hfSol(x, z) + 0.03, frais: true }); }
      strange.fear = Math.max(strange.fear || 0, 0.35);
      setTimeout(() => sound.whisper && sound.whisper(0, 0.25), 2500);
    }
  },
  dessin(E, buf, sbuf, cam) {
    if (Math.hypot(E.fx - cam[0], E.fz - cam[2]) > 70) return;
    PE.buf = buf; PE.fl = 0;
    for (const P of E.pas) { PE.frame(P.x, P.y, P.z, P.r, 1); PE.box(0, 0, 0.04, 0.13, 0.025, 0.3, [0.45, 0.48, 0.55], TL.plain); }
  },
  txt: {
    journal: 'Des pas dans la neige, qui s’arrêtaient net.',
    apres: ['Quelqu’un a vu des pas dans la neige qui s’arrêtaient au milieu d’un champ. Les vieux disent que c’est quelqu’un qui a été appelé. Appelé où, ils ne le disent pas.'],
  },
});

// ---------------------------------------------------------------- 3. une berceuse monte du puits
const HF_BERCEUSE = [[64, 1.5], [67, 0.5], [69, 1], [67, 1], [64, 1.5], [62, 0.5], [64, 2], [60, 1], [62, 1], [64, 1.5], [62, 0.5], [60, 1], [59, 1], [57, 3]];
function hfPuitsProche(x, z, r) {
  const w = game.world, L = [];
  for (const k of ['puits_ville', 'vieux_puits']) if (w.lm[k]) L.push({ x: w.lm[k].x, z: w.lm[k].z, nom: w.lm[k].name });
  for (const it of w.inter) if (it.kind === 'water' && it.id === 'puits_ferme') L.push({ x: it.x, z: it.z, nom: 'le puits de la ferme' });
  let best = null, bd = r;
  for (const P of L) { const d = Math.hypot(P.x - x, P.z - z); if (d < bd) { bd = d; best = P; } }
  return best;
}
hfDef('chanson_puits', {
  cat: 'etrange', etrange: true, tirage: 'heure', parHeure: 0.35, premier: 5, ecart: 12, duree: 0.8,
  ici: (X) => X.nuit && X.dehors && !!hfPuitsProche(X.pos[0], X.pos[2], 45),
  lancer(E) {
    const p = game.player.pos, P = hfPuitsProche(p[0], p[2], 45);
    if (!P) return false;
    E.x = P.x; E.z = P.z; E.y = hfSol(P.x, P.z) - 1.5; E.nom = P.nom;
    E.chantT = 0.5; E.tait = false; E.jete = false;
    hasardF.cible(E, { pos: () => [E.x, E.y + 2.5, E.z], r: 2.8, cos: 0.4, lab: 'Jeter une pièce dans le puits', vis: () => !E.jete, use() {
      if (!farm.pay(1)) { hfPense('(Vous n’avez pas une pièce sur vous.)', 2); return; }
      E.jete = true;
      setTimeout(() => { sound.drip && sound.drip(); }, 1400);
      setTimeout(() => { hfSon([E.x, E.y, E.z], () => sound.whisper && sound.whisper(0, 0.35)); hfPense('(… merci …)', 2.5); }, 3200);
      BUFF.add && BUFF.add('chance', 6);
      hasardF.noter('chanson_puits', `La nuit, une berceuse montait ${E.nom === 'le puits de la ferme' ? 'du puits de la ferme' : 'du fond de ' + E.nom}. J’y ai jeté une pièce ; quelqu’un, tout en bas, a dit merci.`);
      E.tait = true; setTimeout(() => { if (hasardF.actifs.chanson_puits === E) E.fini = 'fin'; }, 4500);
    } });
  },
  maj(E, dt) {
    const d = hfDistJ(E.x, E.z);
    // on s'approche trop : elle se tait
    if (!E.tait && d < 3) { E.tait = true; hfPense('(Le chant s’est arrêté au milieu d’une note. L’eau, tout en bas, est immobile.)', 4); }
    E.chantT -= dt;
    if (E.chantT <= 0 && !E.tait) {
      let du = 0;
      if (d < 50) hfSon([E.x, E.y, E.z], () => { if (!sound.hfAir) return; du = sound.hfAir(HF_BERCEUSE, { bpm: 66, timbre: 'voix', voyelle: 'ou', vol: 0.026, bus: 'voix' }); sound.hfAir(HF_BERCEUSE, { bpm: 66, timbre: 'voix', voyelle: 'ou', vol: 0.01, bus: 'voix', delai: 0.28 }); });
      E.chantT = (du || 12) + 3;
      if (!E.note && d < 40) { hasardF.noter(E, `La nuit, une berceuse montait ${E.nom === 'le puits de la ferme' ? 'du puits de la ferme' : 'du fond de ' + E.nom}. Une voix de femme, sans paroles.`); }
    }
  },
  txt: {
    journal: 'Une berceuse montait d’un puits, la nuit.',
    apres: ['On a entendu chanter dans le puits, cette nuit. Une berceuse. Le puisatier dit que c’est l’écho. L’écho de quoi, il ne dit pas.', 'Ma mère jetait une pièce dans le puits chaque fois qu’elle y entendait chanter. Elle n’a jamais manqué d’eau. Ni de pièces, d’ailleurs.'],
  },
});

// ---------------------------------------------------------------- 4. la table mise, au hameau abandonné
hfDef('table_mise', {
  cat: 'etrange', etrange: true, tirage: 'heure', parHeure: 0.9, premier: 6, ecart: 14, duree: 1.5,
  ici: (X) => { const L = game.world.lm.hameau_abandonne; return !!L && (X.soir || X.nuit) && Math.hypot(X.pos[0] - L.x, X.pos[2] - L.z) < 60 && Math.hypot(X.pos[0] - L.x, X.pos[2] - L.z) > 15; },
  lancer(E) {
    const L = game.world.lm.hameau_abandonne;
    if (!L) return false;
    const P = hfPoint(L.x, L.z, 4, 14, { r: 1.6 });
    if (!P) return false;
    E.x = P.x; E.z = P.z; E.y = hfSol(P.x, P.z); E.r = Math.random() * TAU;
    E.eteint = false; E.assis = false; E.vapT = 0;
    hasardF.cible(E, { pos: () => [E.x, E.y + 0.9, E.z], r: 2.6, cos: 0.4, lab: 'S’asseoir à la table', vis: () => !E.eteint, use() {
      E.assis = true;
      ui.fade(true, '', 900).then(() => {
        hfSon([E.x, E.y + 1.2, E.z], () => { sound.hfFoule && sound.hfFoule(0.7, 4); });
        setTimeout(() => { hfSon([E.x, E.y + 1.2, E.z], () => sound.hfFoule && sound.hfFoule(0.5, 3)); }, 1600);
        setTimeout(() => ui.fade(false, '', 900), 3600);
        setTimeout(() => { E.eteint = true; sound.candle && sound.candle(); hfPense('(Les chandelles se sont éteintes toutes ensemble. Les bols sont vides. Ils l’ont toujours été.)', 5); hasardF.noter('table_mise', 'Au hameau abandonné, une table était mise pour quatre, la soupe fumait. Je me suis assis. On a parlé autour de moi, des voix que je ne voyais pas. Puis les chandelles se sont éteintes.'); }, 4200);
      });
    } });
  },
  maj(E, dt) {
    const d = hfDistJ(E.x, E.z);
    if (!E.eteint) {
      E.vapT -= dt;
      if (E.vapT <= 0) { E.vapT = 0.3; for (let i = 0; i < 4; i++) { const a = E.r + i * Math.PI / 2; particles.spawn(E.x + Math.sin(a) * 0.45, E.y + 0.85, E.z + Math.cos(a) * 0.45, 0, 0.35, 0, [0.85, 0.85, 0.85, 0.18], 0.12, 1.4, -0.05, false); } }
      if (!E.note && d < 18 && hfRegarde(E.x, E.y + 0.8, E.z, 0.75)) { hasardF.noter(E, 'Au hameau abandonné, une table était mise pour quatre, au milieu des ruines. Les chandelles brûlaient, la soupe fumait. Personne.'); }
      // on s'en va sans s'asseoir : en se retournant, plus rien
      if (E.note && d > 30 && !hfRegarde(E.x, E.y + 0.8, E.z, 0.3)) E.fini = 'fin';
    } else if (d > 10 && !hfRegarde(E.x, E.y + 0.8, E.z, 0.3)) E.fini = 'fin';
  },
  dessin(E, buf, sbuf, cam, t) {
    hfModele(buf, 'table', E.x, E.y, E.z, E.r, 1);
    for (let i = 0; i < 4; i++) { const a = E.r + i * Math.PI / 2 + Math.PI / 4, cx = E.x + Math.sin(a) * 0.95, cz = E.z + Math.cos(a) * 0.95; hfModele(buf, 'chaise', cx, hfSol(cx, cz), cz, a + Math.PI, 1); }
    PE.buf = buf; PE.fl = 0; PE.frame(E.x, E.y, E.z, E.r, 1);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; PE.box(Math.sin(a) * 0.42, 0.78, Math.cos(a) * 0.28, 0.16, 0.06, 0.16, [0.75, 0.72, 0.68], TL.plain); if (!E.eteint) PE.box(Math.sin(a) * 0.42, 0.81, Math.cos(a) * 0.28, 0.12, 0.01, 0.12, [0.55, 0.42, 0.22], TL.plain); }
    PE.box(0, 0.86, 0, 0.06, 0.18, 0.06, [0.95, 0.92, 0.85], TL.plain); PE.box(0.12, 0.84, 0.05, 0.05, 0.13, 0.05, [0.95, 0.92, 0.85], TL.plain);
    if (!E.eteint) { PE.fl = FX_EMIT; PE.box(0, 0.98, 0, 0.035, 0.06, 0.035, [1.5, 1.0, 0.4], TL.flame); PE.box(0.12, 0.93, 0.05, 0.035, 0.06, 0.035, [1.5, 1.0, 0.4], TL.flame); PE.fl = 0; }
  },
  lum(E, eye) { return E.eteint ? [] : [{ x: E.x, y: E.y + 1.1, z: E.z, r: 5, c: [1, 0.7, 0.35], d: Math.hypot(E.x - eye[0], E.z - eye[2]) }]; },
  txt: {
    journal: 'Une table mise pour quatre, au hameau abandonné.',
    apres: ['Au hameau abandonné, on voit parfois de la lumière, le soir. Ce sont des braconniers, dit le garde. Il n’y va pas voir.', 'Les gens du hameau sont partis en une nuit, il y a soixante ans. Ils avaient mis la table. Personne n’a jamais su pourquoi ils ne se sont pas assis.'],
  },
});

// ---------------------------------------------------------------- 5. le chien noir
hfDef('chien_noir', {
  cat: 'etrange', etrange: true, tirage: 'heure', parHeure: 0.25, premier: 5, ecart: 12, duree: 1.4,
  ici: (X) => X.nuit && X.dehors && X.route && !X.ville && !X.hameau && !X.ferme,
  lancer(E) {
    const p = game.player, b = p.yaw;
    const x = p.pos[0] + Math.sin(b) * 18, z = p.pos[2] + Math.cos(b) * 18;
    E.c = hfBete('dog', x, z, { v: 1, s: 1.45, loin: 70, vit: 1.5, acc: hfYeuxRouges });
    for (const q of E.c.rig.parts) if (q.s) q.col = [0.05, 0.05, 0.06];
    E.etat = 'suit'; E.haleT = 3; E.t0 = 0;
  },
  maj(E, dt, eye) {
    const C = E.c, p = game.player, d = Math.hypot(C.x - p.pos[0], C.z - p.pos[2]);
    E.t0 += dt;
    if (E.etat === 'suit') {
      // il garde ses distances : quinze pas derrière ; si on le regarde, il s'assoit
      const vu = hfRegarde(C.x, C.y + 0.5, C.z, 0.85);
      if (vu) { C.move = lerp(C.move, 0, Math.min(1, dt * 6)); C.pose = { lie: 0.5, lookP: -0.2 }; hfFace(C, p.pos[0], p.pos[2], dt); if (!E.note && d < 40) { hasardF.noter(E, 'La nuit, sur la route, un grand chien noir m’a suivi, à quinze pas. Quand je me retournais, il s’asseyait.'); } }
      else { C.pose = {}; if (d > 14) { hfAller(C, [[p.pos[0], p.pos[2]]], clamp(d * 0.25, 1, 4.5)); hfMarche(C, dt); } else C.move = lerp(C.move, 0, Math.min(1, dt * 4)); }
      E.haleT -= dt;
      if (E.haleT <= 0) { E.haleT = 5 + Math.random() * 5; if (d < 25) hfSon([C.x, C.y + 0.6, C.z], () => sound.hfHalete && sound.hfHalete(1)); }
      // on marche droit sur lui : il n'est plus là
      if (d < 5 || (E.t0 > 70 && !vu)) { E.etat = 'parti'; for (let k = 0; k < 30; k++) particles.spawn(C.x + (Math.random() - 0.5), C.y + Math.random(), C.z + (Math.random() - 0.5), (Math.random() - 0.5) * 0.4, 0.3, (Math.random() - 0.5) * 0.4, [0.08, 0.08, 0.1, 0.5], 0.4, 2, -0.05, false); if (d < 5) hfPense('(Il n’y a plus de chien. Il n’y a que la brume, et une odeur de terre froide.)', 4); E.fini = 'fin'; }
    }
    void eye;
  },
  dessin(E, buf, sbuf, cam, t) { hfDessine(E.c, buf, sbuf, cam, t); },
  txt: {
    journal: 'Un chien noir m’a suivi sur la route, la nuit.',
    apres: ['Le chien noir des carrefours ? Il vous suit, il ne mord pas. Il vous raccompagne. Le jour où il vous précède, c’est autre chose.', 'Si un grand chien noir vous suit la nuit, ne le chassez pas. Ne le nourrissez pas non plus. Rentrez chez vous, c’est tout.'],
  },
});
function hfYeuxRouges(F, buf) { PE.buf = buf; PE.fl = FX_EMIT; PE.frame(F.x, F.y, F.z, F.h, F.s || 1); for (const s of [-0.06, 0.06]) PE.box(s, 0.62, 0.42, 0.045, 0.035, 0.02, [1.6, 0.25, 0.15], TL.plain); PE.fl = 0; }

// ---------------------------------------------------------------- 6. la dame blanche
const HF_PONTS = ['pont_riviere', 'pont_riviere1', 'pont_nord', 'pont_sud', 'cimetiere', 'calvaire0', 'calvaire1', 'calvaire2', 'calvaire3', 'calvaire4'];
hfDef('dame_blanche', {
  cat: 'etrange', etrange: true, tirage: 'heure', parHeure: 0.25, premier: 6, ecart: 14, duree: 2,
  ici: (X) => X.nuit && X.dehors && X.route && !X.ville && !X.hameau,
  lancer(E) {
    const p = game.player, w = game.world;
    const L = HF_PONTS.map((k) => w.lm[k]).filter((q) => q && Math.hypot(q.x - p.pos[0], q.z - p.pos[2]) > 60 && Math.hypot(q.x - p.pos[0], q.z - p.pos[2]) < 320).sort((a, b) => Math.hypot(a.x - p.pos[0], a.z - p.pos[2]) - Math.hypot(b.x - p.pos[0], b.z - p.pos[2]))[0];
    if (!L) return false;
    E.but = L; E.nomBut = L.name;
    const b = p.yaw + Math.PI, x = p.pos[0] + Math.sin(b) * 9, z = p.pos[2] + Math.cos(b) * 9;
    E.d = hfPerso({ skin: '#e8e2da', hair: '#d8d2c4', hairStyle: 'long', dress: true, top: '#eeeae2', bottom: '#eeeae2', hat: 'voile', hatCol: '#f4f2ec', shoe: '#d8d4cc' }, x, z, { nom: 'Une dame en blanc', voix: 1.2, loin: 90, vit: 1.1, fl: 0 });
    E.etat = 'attend'; E.t0 = 0;
    hasardF.cible(E, { pos: () => [E.d.x, E.d.y + 1.3, E.d.z], r: 3, lab: 'L’accompagner', vis: () => E.etat === 'attend' && E.parle, use() { E.etat = 'marche'; hfDit(E.d, 'Merci. Vous êtes bon. On ne l’est plus guère, sur cette route.', 4); } });
  },
  maj(E, dt) {
    const D = E.d, p = game.player, d = Math.hypot(D.x - p.pos[0], D.z - p.pos[2]);
    E.t0 += dt;
    if (E.etat === 'attend') {
      hfFace(D, p.pos[0], p.pos[2], dt);
      if (!E.parle && d < 7) { E.parle = true; hfDit(D, `Monsieur… Madame… vous voulez bien m’accompagner jusqu’à ${E.nomBut} ? J’ai peur, seule, à cette heure.`, 5.5); hasardF.noter(E, `La nuit, sur la route, une femme en blanc m’a demandé de l’accompagner jusqu’à ${E.nomBut}.`); }
      if (E.t0 > 60) { E.etat = 'fin'; hfFondre(E.d); hfPense('(Elle n’est plus là. Le chemin est vide, et froid.)', 3.5); E.fini = 'fin'; }
    } else if (E.etat === 'marche') {
      hfSuit(D, dt, 1.6, 1.8);
      // arrivés : elle remercie, et quand on la regarde de nouveau, elle n'y est plus
      if (Math.hypot(D.x - E.but.x, D.z - E.but.z) < 14) {
        E.etat = 'arrive';
        hfDit(D, 'C’est ici. C’est ici que je l’attendais. Il n’est jamais venu. … Vous pouvez partir, maintenant.', 6);
        setTimeout(() => { if (hasardF.actifs.dame_blanche === E) E.disp = true; }, 7000);
      }
    } else if (E.etat === 'arrive' && E.disp && !hfRegarde(D.x, D.y + 1.2, D.z, 0.7)) {
      E.etat = 'fin';
      hfPense('(Vous vous retournez. Personne. Sur la pierre, une couronne de fleurs d’oranger, fanée depuis longtemps.)', 5);
      strange.fear = Math.max(strange.fear || 0, 0.3);
      hasardF.noter('dame_blanche', `J’ai accompagné une dame en blanc jusqu’à ${E.nomBut}. Elle attendait quelqu’un qui n’est jamais venu. Quand je me suis retourné, il n’y avait plus qu’une couronne de mariée, fanée.`);
      hasardF.retenir('dame_blanche');
      E.fini = 'fin';
    }
  },
  dessin(E, buf, sbuf, cam, t) { if (E.etat !== 'fin') hfDessine(E.d, buf, null, cam, t, 0); },
  lum(E, eye) { return E.etat === 'fin' ? [] : [{ x: E.d.x, y: E.d.y + 1.2, z: E.d.z, r: 3.5, c: [0.6, 0.65, 0.8], d: Math.hypot(E.d.x - eye[0], E.d.z - eye[2]) }]; },
  txt: {
    journal: 'Une dame en blanc sur la route, la nuit.',
    apres: ['Une dame blanche sur la route ? Elle demande toujours qu’on l’accompagne. Une fiancée, il y a longtemps. Le garçon n’est pas venu. Elle, elle vient encore.', 'Il ne faut jamais refuser d’accompagner la dame en blanc. Ni accepter. Il faut ne pas être sur la route, voilà tout.'],
  },
});
function hfFondre(F) { for (let k = 0; k < 24; k++) particles.spawn(F.x + (Math.random() - 0.5) * 0.6, F.y + Math.random() * 1.7, F.z + (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.3, 0.4, (Math.random() - 0.5) * 0.3, [0.85, 0.88, 0.95, 0.35], 0.3, 2, -0.1, false); }

// ---------------------------------------------------------------- 7. la messe des morts, la nuit du Vorndi
const HF_REQUIEM = [[57, 2], [57, 1], [59, 1], [60, 2], [59, 1], [57, 1], [55, 2], [57, 3], [null, 1], [60, 2], [62, 1], [60, 1], [59, 2], [57, 4]];
hfDef('messe_morts', {
  cat: 'etrange', etrange: true, poids: 3, premier: 5, ecart: 11, duree: 1.2, fenetre: 0.8,
  peut: (c) => c.dow === 'morts',
  heure: (c, r) => 23.7 + r * 0.25,
  pret: (X) => X.ville,
  sansNous: () => false,
  lancer(E) {
    const B = game.world.bld.eglise;
    if (!B) return false;
    E.x = B.x; E.z = B.z; E.y = B.y; E.o = B.out;
    E.chantT = 0.5; E.tait = false; E.frappe = false;
    hasardF.cible(E, { pos: () => [E.o[0], hfSol(E.o[0], E.o[1]) + 1.4, E.o[1]], r: 3, cos: 0.4, lab: 'Frapper à la porte', vis: () => !E.frappe, use() {
      E.frappe = true; E.tait = true; sound.knock && sound.knock(3);
      setTimeout(() => { hfSon([E.o[0], hfSol(E.o[0], E.o[1]) + 1.4, E.o[1]], () => sound.knock && sound.knock(1)); hfPense('(De l’autre côté, quelqu’un a frappé une fois. Une seule.)', 4); strange.fear = Math.max(strange.fear || 0, 0.4); }, 3500);
      hasardF.noter('messe_morts', 'La nuit du Vorndi, à minuit, on chantait dans l’église fermée. J’ai frappé à la porte. Le chant s’est tu. De l’autre côté, quelqu’un a frappé une fois.');
    } });
  },
  maj(E, dt) {
    const d = hfDistJ(E.x, E.z);
    E.chantT -= dt;
    if (E.chantT <= 0 && !E.tait) {
      let du = 0;
      if (d < 120) hfSon([E.x, E.y + 3, E.z], () => { if (!sound.hfAir) return; du = sound.hfAir(HF_REQUIEM, { bpm: 54, timbre: 'voix', voyelle: 'o', vol: 0.028, bus: 'voix' }); sound.hfAir(HF_REQUIEM.map(([m, x]) => [m === null ? null : m - 12, x]), { bpm: 54, timbre: 'voix', voyelle: 'ou', vol: 0.024, bus: 'voix' }); sound.hfAir(HF_REQUIEM.map(([m, x]) => [m === null ? null : m - 5, x]), { bpm: 54, timbre: 'voix', voyelle: 'a', vol: 0.014, bus: 'voix' }); });
      E.chantT = (du || 16) + 2;
      if (!E.note && d < 70) { hasardF.noter(E, 'La nuit du Vorndi, à minuit, on chantait dans l’église fermée. Les fenêtres étaient éclairées. Le curé, lui, dormait.'); hfPense('(On chante, dans l’église fermée.)', 3); }
    }
    if (d < 4 && !E.tait && !E.frappe) { E.tait = true; hfPense('(Le chant s’est arrêté. Comme si on vous avait entendu arriver.)', 4); }
  },
  lum(E, eye) {
    if (E.tait && E.age > 0.5) return [];
    const d = Math.hypot(E.x - eye[0], E.z - eye[2]);
    return [{ x: E.x, y: E.y + 2.5, z: E.z, r: 16, c: [1, 0.72, 0.38], d }, { x: E.o[0], y: E.y + 1.5, z: E.o[1], r: 5, c: [1, 0.7, 0.35], d }];
  },
  txt: {
    journal: 'La messe des morts, à minuit, dans l’église fermée.',
    apres: ['Le curé a trouvé les cierges brûlés jusqu’au bout, ce matin. Tous. Il dit qu’il les avait éteints. Il en est sûr.', 'La nuit du Vorndi, on ne passe pas devant l’église. C’est leur messe à eux. Ils ne veulent pas de témoins.'],
  },
});

// ---------------------------------------------------------------- 8. la chasse volante
hfDef('chasse_volante', {
  cat: 'etrange', etrange: true, tirage: 'heure', parHeure: 0.22, premier: 7, ecart: 18, duree: 0.6,
  ici: (X) => X.nuit && X.dehors && !X.ville && ['lande', 'hauteurs', 'plaine', 'foret', 'bouleaux'].includes(X.biome) && (X.meteo === 'clear' || X.meteo === 'cloudy' || X.meteo === 'frost'),
  lancer(E) {
    const a = Math.random() * TAU;
    E.a = a; E.t0 = 0; E.duree0 = 16; E.sonT = 0; E.vu = false;
    E.membres = [];
    for (let i = 0; i < 14; i++) E.membres.push({ cheval: i % 4 === 0, off: [(Math.random() - 0.5) * 14, (Math.random() - 0.5) * 6, -i * 2.5 - Math.random() * 3], ph: Math.random() * 6 });
    sound.wind1 && sound.wind1();
    setTimeout(() => sound.wind1 && sound.wind1(), 900);
  },
  maj(E, dt, eye) {
    E.t0 += dt;
    // la chasse traverse le ciel d'un horizon à l'autre, à une soixantaine de pas
    const u = E.t0 / E.duree0, ax = Math.sin(E.a), az = Math.cos(E.a), px = Math.cos(E.a), pz = -Math.sin(E.a);
    E.cx = eye[0] + ax * lerp(-110, 110, u) + px * 20; E.cz = eye[2] + az * lerp(-110, 110, u) + pz * 20; E.cy = eye[1] + 38 + Math.sin(u * Math.PI) * 12;
    E.sonT -= dt;
    if (E.sonT <= 0 && u < 1) { E.sonT = 1.1 + Math.random() * 0.5; hfSon([E.cx, E.cy, E.cz], () => { sound.hfMeute && sound.hfMeute(1.2); if (Math.random() < 0.6) sound.hfSabots && sound.hfSabots(0.8); }); }
    game.shakeT = Math.max(game.shakeT || 0, 0.05 + 0.1 * Math.sin(Math.PI * clamp(u, 0, 1)));
    if (!E.vu && u > 0.15 && hfRegarde(E.cx, E.cy, E.cz, 0.8)) {
      E.vu = true;
      strange.fear = Math.max(strange.fear || 0, 0.5);
      hfPense('(Ne les regardez pas.)', 3);
      hasardF.noter(E, 'La nuit, la chasse volante est passée au-dessus de moi : des chiens qui aboyaient dans les nuages, une trompe, des cavaliers noirs. Je les ai regardés.');
    }
    if (u > 1.05) { if (!E.note) hasardF.noter(E, 'La nuit, la chasse volante est passée au-dessus de moi : des aboiements dans le ciel, une trompe, le vent. Je n’ai pas levé les yeux.'); E.fini = 'fin'; }
  },
  ecran(E, fx) { const u = E.t0 / E.duree0; if (u > 0 && u < 1) fx[0] = Math.max(fx[0], 0.12 * Math.sin(Math.PI * u)); },
  dessin(E, buf) {
    if (E.cx === undefined) return;
    PE.buf = buf; PE.fl = 0;
    const h = E.a, t = game.time;
    for (const M of E.membres) {
      const x = E.cx + Math.sin(h) * M.off[2] + Math.cos(h) * M.off[0], z = E.cz + Math.cos(h) * M.off[2] - Math.sin(h) * M.off[0], y = E.cy + M.off[1] + Math.sin(t * 6 + M.ph) * 0.6;
      PE.frame(x, y, z, h, M.cheval ? 2.2 : 1.6);
      const g = Math.sin(t * 12 + M.ph) * 0.5;
      PE.box(0, 0, 0, 0.35, 0.35, 1.2, [0.02, 0.02, 0.03], TL.fur);
      PE.box(0, 0.25, 0.7, 0.25, 0.3, 0.4, [0.02, 0.02, 0.03], TL.fur, 0, -0.4);
      for (const [lx, lz] of [[-0.13, 0.45], [0.13, 0.45], [-0.13, -0.45], [0.13, -0.45]]) PE.box(lx, -0.35, lz, 0.08, 0.5, 0.08, [0.02, 0.02, 0.03], TL.fur, 0, (lz > 0 ? g : -g));
      if (M.cheval) { PE.box(0, 0.55, -0.1, 0.3, 0.6, 0.25, [0.02, 0.02, 0.03], TL.coat); PE.box(0, 0.98, -0.1, 0.18, 0.2, 0.18, [0.02, 0.02, 0.03], TL.coat); }
    }
  },
  txt: {
    journal: 'La chasse volante est passée dans le ciel.',
    apres: ['La chasse volante est passée, cette nuit. Mon chien a hurlé jusqu’à l’aube. Il faut se coucher face contre terre quand elle passe, sinon elle vous emmène.', 'La chasse Hennequin, disait ma grand-mère. Des chasseurs damnés qui courent après une bête qu’ils n’attraperont jamais. Comme nous, en somme.', 'Celui qui regarde passer la chasse volante, il paraît qu’il mourra dans l’année. Mon oncle l’a regardée. Il a vécu quarante ans de plus. Il disait que c’était le pire.'],
  },
});

// ---------------------------------------------------------------- 9. le meneur de loups
hfDef('meneur_loups', {
  cat: 'etrange', etrange: true, tirage: 'heure', parHeure: 0.22, premier: 7, ecart: 16, duree: 0.9,
  ici: (X) => (X.soir || X.nuit) && X.dehors && !X.ville && !X.hameau && !X.ferme && ['lande', 'hauteurs', 'foret', 'bouleaux'].includes(X.biome),
  lancer(E) {
    const p = game.player, f = cameraBasis(p.yaw, 0).f, a = Math.atan2(f[0], f[2]);
    const P = hfPoint(p.pos[0], p.pos[2], 40, 55, { a: a + 0.6, ouv: 0.8, r: 1 });
    if (!P) return false;
    const b = a - Math.PI / 2 + (Math.random() - 0.5) * 0.5;
    E.m = hfPerso(hfLook('vieux', { top: '#1e1c1c', bottom: '#1e1c1c', coat: true, hat: 'chapeau', hatCol: '#141212', beard: 'longue', hair: '#5a5650', held: 'baton' }), P.x, P.z, { nom: 'L’homme à la cape', voix: 0.7, loin: 110, vit: 1 });
    E.loups = [];
    for (let i = 0; i < 5; i++) { const F = hfBete('wolf', P.x - Math.sin(b) * (2 + i * 1.6) + (Math.random() - 0.5), P.z - Math.cos(b) * (2 + i * 1.6) + (Math.random() - 0.5), { loin: 110, vit: 1, acc: hfYeux }); F.rang = 1.2 + i * 1.3; F.lat = (i % 2 ? 0.6 : -0.6); E.loups.push(F); }
    const pts = [[P.x, P.z], [P.x + Math.sin(b) * 90, P.z + Math.cos(b) * 90]];
    E.m.rang = 0;
    E.C = hfCortege([E.m, ...E.loups], pts, 1.2, 0.9);
    E.arret = 0; E.parle = false;
  },
  maj(E, dt) {
    const M = E.m, d = hfDistJ(M.x, M.z);
    if (d < 24 && !E.parle) {
      E.parle = true; E.arret = 9;
      hfFace(M, game.player.pos[0], game.player.pos[2], 3);
      M.pose = { lookP: 0.1 };
      hfDit(M, 'Passez votre chemin. Ils n’ont pas faim, ce soir.', 4);
      hasardF.noter(E, 'Au crépuscule, sur la lande, un homme en cape noire marchait, suivi de cinq loups dociles comme des chiens. Il m’a dit de passer mon chemin.');
    }
    E.arret -= dt;
    if (E.arret > 0) for (const L of E.loups) { L.move = 0; L.pose = { lookY: 0 }; hfFace(L, game.player.pos[0], game.player.pos[2], dt); }
    else for (const L of E.loups) L.pose = {};
    hfCortegeMaj(E.C, dt, E.arret > 0);
    if (!E.note && d < 70 && hfRegarde(M.x, M.y + 1, M.z, 0.85)) { hasardF.noter(E, 'Au crépuscule, un homme en cape noire passait au loin, suivi de loups qui marchaient à son pas.'); }
    if (E.C.fini) E.fini = 'fin';
  },
  dessin(E, buf, sbuf, cam, t) { for (const F of E.C.membres) hfDessine(F, buf, sbuf, cam, t); },
  txt: {
    journal: 'Un meneur de loups, au crépuscule.',
    apres: ['Le meneur de loups ? Un homme qui a fait un pacte. Les loups le suivent, et il les mène où il veut. Chez ceux qui lui ont fait du tort, par exemple.', 'Mon grand-père l’a croisé une fois, sur la lande. Il a ôté son chapeau. L’autre aussi. C’est pour ça que mon grand-père a encore ses moutons.'],
  },
});

// ---------------------------------------------------------------- 10. le tambour sous la terre
hfDef('tambour_dessous', {
  cat: 'etrange', etrange: true, tirage: 'heure', parHeure: 0.22, premier: 6, ecart: 12, duree: 0.6,
  ici: (X) => X.dehors && (X.nuit || X.soir) && (X.biome === 'hauteurs' || X.biome === 'lande' || hfPresDuDessous(X.pos)),
  lancer(E) { E.t0 = 0; E.tamT = 0.5; E.ecoute = false; const p = game.player.pos; E.x = p[0]; E.z = p[2];
    hasardF.cible(E, { pos: () => { const p2 = game.player.pos; return [p2[0], hfSol(p2[0], p2[2]) + 0.3, p2[2]]; }, r: 2.5, cos: -1, lab: 'Coller l’oreille contre la terre', vis: () => !E.ecoute && game.player.pitch < -0.7, use() { E.ecoute = true; hfPense('(On dirait des pas. Des milliers de pas, très loin dessous, qui marchent en cadence. Et qui s’arrêtent.)', 5.5); hasardF.noter('tambour_dessous', 'La nuit, un tambour battait sous la terre. J’ai collé l’oreille contre le sol : on aurait dit des milliers de pas, très loin dessous, qui marchaient en cadence.'); E.t0 = Math.max(E.t0, 22); } });
  },
  maj(E, dt) {
    E.t0 += dt;
    E.tamT -= dt;
    if (E.tamT <= 0 && E.t0 < 24) { E.tamT = 5.4; const p = game.player.pos; hfSon([p[0], hfSol(p[0], p[2]) - 6, p[2]], () => sound.hfTambourSourd && sound.hfTambourSourd(1)); }
    game.shakeT = Math.max(game.shakeT || 0, E.t0 < 24 ? 0.08 + 0.06 * Math.abs(Math.sin(E.t0 * 5)) : 0);
    if (!E.note && E.t0 > 3) { hasardF.noter(E, 'La nuit, un tambour battait sous la terre, très loin. Le sol vibrait sous mes pieds.'); hfPense('(Un battement, sous vos pieds. La terre bat comme un cœur, mais lentement.)', 4); }
    if (E.t0 > 27) E.fini = 'fin';
  },
  txt: {
    journal: 'Un tambour, sous la terre.',
    apres: ['Les gens des hauteurs disent qu’on entend battre sous la montagne, certaines nuits. Les nains, qu’ils disent. Les nains ne disent rien.', 'Sous la terre, il y a des gens qui marchent. Mon père descendait à la mine. Il disait qu’il les entendait passer, de l’autre côté de la roche.'],
  },
});
function hfPresDuDessous(pos) {
  const w = game.world;
  for (const k of ['mine', 'galeries', 'bouche_galerie', 'faille', 'col', 'sout_cave']) { const L = w.lm[k]; if (L && Math.hypot(L.x - pos[0], L.z - pos[2]) < (L.r || 10) + 40) return true; }
  return false;
}

// ---------------------------------------------------------------- 11. une fenêtre éclairée au hameau abandonné
hfDef('fenetre_allumee', {
  cat: 'etrange', etrange: true, tirage: 'heure', parHeure: 0.8, premier: 5, ecart: 10, duree: 1.2,
  ici: (X) => { const L = game.world.lm.hameau_abandonne; return !!L && X.nuit && X.dehors && Math.hypot(X.pos[0] - L.x, X.pos[2] - L.z) < 140 && Math.hypot(X.pos[0] - L.x, X.pos[2] - L.z) > 35; },
  lancer(E) {
    const L = game.world.lm.hameau_abandonne;
    if (!L) return false;
    const P = hfPoint(L.x, L.z, 3, 18, { r: 0.5, arbres: false }) || { x: L.x + 6, z: L.z };
    E.x = P.x; E.z = P.z; E.y = hfSol(P.x, P.z) + 1.6;
    E.allume = true; E.pris = false;
    hasardF.cible(E, { pos: () => [E.x, E.y - 1.2, E.z], r: 2.6, cos: 0.3, lab: 'Ramasser le bout de chandelle', vis: () => !E.allume && !E.pris, use() { E.pris = true; farm.give('bougie', 1); play.flyer && play.flyer('bougie', [E.x, E.y - 1, E.z], 1); hfPense('(La cire est encore tiède.)', 3); hasardF.noter('fenetre_allumee', 'La nuit, au hameau abandonné, une lumière à une fenêtre. Elle s’est éteinte quand je suis arrivé. Il restait un bout de chandelle, la cire encore tiède.'); setTimeout(() => { if (hasardF.actifs.fenetre_allumee === E) E.fini = 'fin'; }, 1500); } });
  },
  maj(E) {
    const d = hfDistJ(E.x, E.z);
    if (E.allume && !E.note && d < 130 && hfRegarde(E.x, E.y, E.z, 0.9)) { hasardF.noter(E, 'La nuit, au hameau abandonné, une lumière brûlait à une fenêtre.'); hfPense('(Une lumière. Là-bas, au hameau où personne n’habite plus.)', 4); }
    if (E.allume && d < 12) { E.allume = false; sound.candle && sound.candle(); hfPense('(Éteinte. Juste au moment où vous arriviez.)', 3); }
  },
  dessin(E, buf) {
    PE.buf = buf; PE.fl = E.allume ? FX_EMIT : 0; PE.frame(E.x, E.y - 1.55, E.z, 0, 1);
    PE.box(0, 0.05, 0, 0.07, 0.1, 0.07, [0.9, 0.86, 0.78], TL.plain);
    if (E.allume) { PE.box(0, 0.14, 0, 0.04, 0.07, 0.04, [1.6, 1.1, 0.5], TL.flame); PE.box(0, 1.55, 0, 0.9, 0.7, 0.05, [1.1, 0.75, 0.35], TL.glass); }
    PE.fl = 0;
  },
  lum(E, eye) { return E.allume ? [{ x: E.x, y: E.y, z: E.z, r: 8, c: [1, 0.7, 0.35], d: Math.hypot(E.x - eye[0], E.z - eye[2]) }] : []; },
  txt: {
    journal: 'Une fenêtre éclairée au hameau abandonné.',
    apres: ['Une lumière au hameau abandonné ? Encore ? Le garde dit que c’est un braconnier. Il dit ça depuis trente ans. Le braconnier doit être bien vieux.'],
  },
});
