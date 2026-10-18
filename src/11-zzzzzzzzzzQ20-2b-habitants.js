// ============================================================================
//  LES SCÈNES DES QUÊTES (agent Q20B) — 2b. LES QUÊTES QUE Q16 A DONNÉES AUX HABITANTS
//  Seize quêtes (Q16_HABITANTS : les Sources, la naine, les gardes et le
//  chevalier, et une seconde pour quelques-uns), chacune ses scènes, faites
//  pour elle (le cadre : 11-zzzzzzzzzzQ20-0-cadre.js ; les outils du lot :
//  -2a-outils.js) :
//  - la demande : l'habitant à sa place, à sa façon, puis ce dont il parle ;
//  - le tournant (sauf quand on apporte) : ce qu'on voit en arrivant, ce
//    qu'on trouve, celui à qui l'on porte la chose ; la nuit veillée ;
//  - le dénouement, et pour les fins à choix, un dénouement par choix.
//  Les halles des nains sont sous terre : leurs scènes s'y jouent (monde
//  'nains'), quand on y est.
// ============================================================================
Object.assign(Q20_DESSINS, {
  // une lentille de verre, taillée ; une de cristal (elle luit à peine)
  lentille(PE) { PE.box(0, 0.012, 0, 0.09, 0.016, 0.09, [1.1, 1.2, 1.25], TL.glass); PE.box(0, 0.012, 0, 0.1, 0.01, 0.024, [0.62, 0.42, 0.22], TL.wood); },
  lentille_cristal(PE) { PE.fl = FX_EMIT; PE.box(0, 0.014, 0, 0.09, 0.02, 0.09, [0.7, 0.9, 1.1], TL.glass); PE.fl = 0; PE.box(0, 0.012, 0, 0.1, 0.01, 0.024, [0.5, 0.48, 0.46], TL.iron); },
  // un tas de charbon, deux lingots
  charbon(PE) { for (let k = 0; k < 7; k++) PE.box(-0.12 + (k % 4) * 0.08, 0.04 + Math.floor(k / 4) * 0.06, (k % 3) * 0.05 - 0.05, 0.08, 0.07, 0.07, [0.16, 0.15, 0.15], TL.stone, k); for (const s of [-1, 1]) PE.box(0.2, 0.03 + (s > 0 ? 0.05 : 0), s * 0.02, 0.18, 0.05, 0.07, [0.62, 0.6, 0.58], TL.iron); },
  // une feuille pliée en quatre (la liste du 6 août)
  liste(PE) { PE.box(0, 0.004, 0, 0.12, 0.006, 0.17, [1.1, 1.02, 0.86], TL.paper, 0.1); for (let k = 0; k < 8; k++) PE.box(-0.01, 0.009, -0.065 + k * 0.018, 0.08, 0.002, 0.006, [0.45, 0.3, 0.55], TL.plain, 0.1); },
  // une enveloppe réglementaire (le rapport n° 104), un sac de la préfecture plein
  rapport(PE) { PE.box(0, 0.004, 0, 0.22, 0.008, 0.11, [1.08, 1.04, 0.92], TL.paper, 0.2); PE.box(0.05, 0.009, 0, 0.04, 0.004, 0.04, [0.3, 0.32, 0.5], TL.plain, 0.2); },
  sac_prefecture(PE) { PE.box(0, 0.22, 0, 0.5, 0.44, 0.34, [0.62, 0.55, 0.4], TL.sack); PE.box(0, 0.47, 0, 0.2, 0.08, 0.14, [0.55, 0.5, 0.38], TL.sack); for (let k = 0; k < 4; k++) PE.box(-0.1 + k * 0.07, 0.46, 0.03, 0.06, 0.12, 0.012, [1.08, 1.04, 0.92], TL.paper, 0.3 * k); },
  // un livre que personne n'ose ouvrir (il est chaud)
  livre_chaud(PE) { PE.box(0, 0.04, 0, 0.26, 0.08, 0.34, [0.3, 0.12, 0.1], TL.leather); PE.box(0.004, 0.04, 0, 0.24, 0.07, 0.33, [1.0, 0.92, 0.75], TL.paper); },
  // le procès-verbal, la plume
  pv(PE) { PE.box(0, 0.004, 0, 0.21, 0.006, 0.28, [1.1, 1.05, 0.9], TL.paper, 0.15); for (let k = 0; k < 9; k++) PE.box(0, 0.008, -0.1 + k * 0.022, 0.15, 0.002, 0.005, [0.2, 0.18, 0.2], TL.plain, 0.15); PE.box(0.14, 0.03, 0.06, 0.012, 0.06, 0.012, [1.2, 1.18, 1.1], TL.paper, 0.6); },
  // une borne de cadastre, numéro effacé, la mousse dessus
  borne(PE) { PE.box(0, 0.32, 0, 0.3, 0.64, 0.22, [0.82, 0.8, 0.74], TL.stone); PE.box(0, 0.66, 0, 0.3, 0.06, 0.22, [0.42, 0.62, 0.28], TL.leaves); PE.box(0.06, 0.3, 0.112, 0.12, 0.4, 0.006, [0.4, 0.58, 0.26], TL.leaves); PE.box(-0.04, 0.48, 0.112, 0.1, 0.06, 0.004, [0.5, 0.48, 0.44], TL.plain); },
  // un feu froid, des cendres en rond, quatre bols posés pour des invités
  quatre_bols(PE) {
    PE.box(0, 0.02, 0, 0.62, 0.04, 0.62, [0.36, 0.34, 0.32], TL.ash || TL.soil);
    for (let k = 0; k < 4; k++) { const a = k / 4 * TAU + 0.4; PE.box(Math.sin(a) * 0.62, 0.035, Math.cos(a) * 0.62, 0.12, 0.07, 0.12, [0.72, 0.56, 0.38], TL.wood); PE.box(Math.sin(a) * 0.62, 0.07, Math.cos(a) * 0.62, 0.09, 0.01, 0.09, [0.2, 0.16, 0.12], TL.plain); }
  },
  // les noms gravés sous le pied de la Dame : quarante-deux traits, le dernier frais
  noms(PE) { PE.box(0, 0.25, 0, 0.9, 0.5, 0.04, [0.6, 0.56, 0.5], TL.stone); for (let k = 0; k < 42; k++) PE.box(-0.38 + (k % 7) * 0.125, 0.06 + Math.floor(k / 7) * 0.07, 0.022, 0.1, 0.012, 0.004, k === 41 ? [1.35, 1.32, 1.25] : [0.3, 0.28, 0.26], TL.plain); },
  // des calèus (cierges flottants) sur l'eau
  caleu(PE) { PE.box(0, 0.01, 0, 0.16, 0.02, 0.16, [0.62, 0.48, 0.3], TL.wood); PE.box(0, 0.08, 0, 0.04, 0.12, 0.04, [1.25, 1.2, 1.05], TL.plain); PE.fl = FX_EMIT; PE.box(0, 0.16, 0, 0.022, 0.04, 0.022, [1.6, 1.1, 0.45], TL.plain); PE.fl = 0; },
  // une plume d'aigle ; une carte pliée (la carte de l'est)
  plume(PE) { PE.box(0, 0.006, 0, 0.03, 0.008, 0.32, [0.42, 0.3, 0.18], TL.fur, 0.3); PE.box(0, 0.008, 0.12, 0.01, 0.006, 0.1, [0.95, 0.9, 0.82], TL.plain, 0.3); },
  carte(PE) { PE.box(0, 0.006, 0, 0.26, 0.01, 0.2, [1.05, 0.95, 0.75], TL.paper, 0.2); PE.box(0.03, 0.012, 0.02, 0.08, 0.002, 0.004, [0.45, 0.3, 0.2], TL.plain, 0.2); PE.box(-0.05, 0.012, -0.03, 0.004, 0.002, 0.1, [0.45, 0.3, 0.2], TL.plain, 0.2); },
  // la clochette de la mule (bronze verdi, le collier mangé)
  sonnaille(PE) { const v = [0.45, 0.62, 0.48]; PE.box(0, 0.04, 0, 0.07, 0.08, 0.06, v, TL.gold); PE.box(0, 0.085, 0, 0.05, 0.016, 0.045, v, TL.gold); PE.box(0.02, 0.012, 0, 0.3, 0.012, 0.035, [0.3, 0.2, 0.12], TL.leather, 0.8); },
  // des fleurs de lavande et de reine-des-prés, en bottes
  bouquets(PE) { for (let k = 0; k < 5; k++) { const lav = k < 3; PE.box(-0.12 + k * 0.06, 0.12, 0, 0.04, 0.24, 0.04, lav ? [0.62, 0.48, 0.95] : [1.25, 1.22, 1.05], TL.flowers, 0.1 * k); PE.box(-0.12 + k * 0.06, 0.04, 0, 0.02, 0.08, 0.02, [0.4, 0.6, 0.3], TL.leaves); } },
  // une fiole d'huile, des bougies
  huile(PE) { PE.box(0, 0.07, 0, 0.07, 0.14, 0.07, [1.2, 1.0, 0.45], TL.glass); PE.box(0, 0.16, 0, 0.03, 0.04, 0.03, [0.6, 0.45, 0.3], TL.wood); },
  bougies(PE) { for (let k = 0; k < 2; k++) PE.box(-0.04 + k * 0.08, 0.005, 0, 0.03, 0.01, 0.16, [1.25, 1.2, 1.05], TL.plain, 0.1); },
  // des cartouches, une couverture pliée
  cartouches(PE) { for (let k = 0; k < 6; k++) PE.box(-0.06 + (k % 3) * 0.06, 0.02, (k < 3 ? -0.03 : 0.03), 0.03, 0.04, 0.03, [0.85, 0.45, 0.25], TL.plain); },
  // une main de vapeur (dessinée en lueurs pâles : la vapeur la défait)
  main_vapeur(PE, t) {
    PE.fl = FX_EMIT;
    const c = [0.42, 0.44, 0.48], o = Math.sin((t || 0) * 0.6) * 0.04;
    PE.box(0, 0.9, 0, 0.9, 1.0, 0.08, c, TL.plain);
    for (let k = 0; k < 4; k++) PE.box(-0.33 + k * 0.22, 1.85 + (k === 1 || k === 2 ? 0.12 : 0) + o, 0, 0.14, 0.9 + (k === 1 || k === 2 ? 0.2 : 0), 0.07, c, TL.plain);
    PE.box(0.6, 1.1, 0, 0.14, 0.7, 0.07, c, TL.plain, 0.7);
    PE.fl = 0;
  },
});

// ---------------------------------------------------------------- les outils de ces scènes-ci
const Q20BH = {
  // une place nommée d'un bâtiment (B.spots), au plancher
  spot(c, cle, nom) { const B = c.w.bld[cle]; const s = B && B.spots && B.spots[nom]; return s ? [s.x, B.y, s.z] : null; },
  // les bassins des Sources (le grand d'abord) : { P (l'eau), r, w, d }
  bassins(c) { return (c.w.pools || []).filter((p) => p.kind === 'bains').map((p) => ({ P: [p.x, p.y, p.z], r: p.r || 0, w: p.w, d: p.d })); },
  // au bord d'un bassin : côté (0 : devant, 1 : derrière, 2 et 3 : les côtés), à d mètres du bord
  bord(c, B, cote, d) {
    const k = cote || 0, sx = k === 2 ? 1 : k === 3 ? -1 : 0, sz = k === 0 ? 1 : k === 1 ? -1 : 0;
    const [x, z] = qtW({ x: B.P[0], z: B.P[2], r: B.r }, sx * (B.w / 2 + 0.6 + (d || 0)), sz * (B.d / 2 + 0.6 + (d || 0)));
    return c.pt(x, z, B.P[1] + 0.3);
  },
  // la vapeur d'un bassin
  vapeur(B, n) { return Q20H.emet(c20h(B.P, 0.15), { n: (n || 9) * 1.6, col: [0.9, 0.9, 0.88, 0.38], taille: 0.07, vie: 3.2, v: 0.25, vy: 0.35, r: Math.min(B.w, B.d) * 0.8 }); },
  // une lueur de lanterne au sol (les six lanternes des Sources)
  lanternes(c, P, R, n) { return qtProps(c.w, P[0], P[2], R || 16, (q) => q.id === 'lanterne_sol' || q.id === 'lanterne_suspendue' || q.id === 'lampadaire').slice(0, n || 3).map((q) => c.lueur([q.x, q.y, q.z], 6, [1.0, 0.72, 0.38], 0.8)); },
  // la porte d'un pont (le côté de la ville) : pour la poterne, le pont du sud
  porteVille(c) { const G = c.w.nav && c.w.nav.nodes.find((q) => q.tag === 'pont_sud:porte'); return G ? c.pt(G.x, G.z) : null; },
};
function c20h(P, dy) { return [P[0], P[1] + dy, P[2]]; }

// ============================================================================ LES SOURCES : SOLANGE (la baigneuse)
q20.scenes('naturiste_a_1', {
  qui: 'naturiste_a',
  demande(c) {
    const Bs = Q20BH.bassins(c), B = Bs[0];
    if (!B) return null;
    const P0 = Q20BH.bord(c, B, 0, 0.2);
    const moi = c.habitant('naturiste_a', P0, { face: B.P, geste: ['penche', { lookP: 0.35 }] });
    const moi2 = c.habitant('naturiste_a', P0, { cap: c.cap(B.P, P0), geste: ['bras', 'parle'] });
    const F = c.lieu('ferme');
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 1.5, d: 2.6, buste: true }), acteurs: [moi], chaque: Q20BH.vapeur(B), dit: ['Le docteur dit que l’eau soigne mieux quand elle sent bon. Moi, je dis qu’elle sent l’œuf pourri et la montagne.'], court: true }),
      c.plan({ dur: 6, cam: c.camActeur(moi2, { cote: 0.3, d: 2.4 }), acteurs: [moi2], chaque: Q20BH.vapeur(B), dit: ['Trois brins de lavande, deux grappes de reine-des-prés. Et on verra qui a raison.'] }),
      F && c.plan({ dur: 5, cam: c.camLieu(F, { d: 34, haut: 6, dy: 2, recul: 0.12 }), dit: ['La lavande pousse chez ceux qui ont un jardin. Vous en avez un, il paraît.'] }),
    ];
  },
  fin(c) {
    const Bs = Q20BH.bassins(c), B = Bs[0];
    if (!B) return null;
    const P0 = Q20BH.bord(c, B, 0, 0.1);
    const moi = c.habitant('naturiste_a', P0, { face: B.P, geste: ['tend', 'penche'] });
    const fl = c.chose(Q20_DESSINS.bouquets, c.devant(P0, c.cap(P0, B.P), 0.5, 0, true), { s: 1.3, r: c.cap(P0, B.P) + Math.PI / 2 });
    const moi2 = c.habitant('naturiste_a', P0, { cap: c.cap(B.P, P0), geste: ['offre', 'parle'] });
    const hu = c.chose(Q20_DESSINS.huile, c.haut(c.devant(P0, moi2.cap, 0.4, 0.1, true), 1.0), { s: 1.3 });
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 1.1, d: 3.0, avec: B.P, k: 0.4, monte: 0.3 }), acteurs: [moi, fl], chaque: Q20BH.vapeur(B, 12), dit: ['Respirez… Voilà. On dirait presque un bain de dame. Le docteur dira que c’est l’eau.'], court: true }),
      c.plan({ dur: 5.8, cam: c.camActeur(moi2, { cote: 0.3, d: 2.2, buste: true }), acteurs: [moi2, hu, Q20H.face(c, moi2, 1.5, 0.2)], chaque: Q20BH.vapeur(B), son: 'piece', dit: ['Prenez cette huile. C’est la nôtre : les tournesols de la vallée.'] }),
    ];
  },
});

// ============================================================================ LES SOURCES : LISE (la gardienne des bains, qui dessine la vapeur)
q20.scenes('naturiste_c_1', {
  qui: 'naturiste_c',
  delais: { tournant: 2 },
  demande(c) {
    const Bs = Q20BH.bassins(c), B = Bs[1] || Bs[0];
    if (!B) return null;
    const P0 = Q20BH.bord(c, B, 2, 0.4);
    const moi = c.habitant('naturiste_c', P0, { face: B.P, geste: ['assis', 'travaille', { lookP: 0.2 }] });
    const Ca = c.lieu('cascade');
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 1.4, d: 2.6, buste: true, avec: B.P, k: 0.25 }), heure: Math.max(c.h, 18.8), acteurs: [moi], chaque: Q20BH.vapeur(B), dit: ['Je dessine la vapeur. Toujours les mêmes formes : une grande main, un œil, trois traits.'], court: true }),
      Ca && c.plan({ dur: 6.2, cam: c.camLieu(Ca, { d: 18, haut: 2.4, dy: 2.5, recul: 0.15 }), heure: c.heure('aube'), chaque: Q20H.emet(c.haut(Ca.P, 1.2), { n: 10, col: [0.92, 0.92, 0.92, 0.36], taille: 0.08, vie: 3.4, v: 0.5, vy: 0.5, r: 3 }), dit: ['Allez à la cascade, demain à l’aube. Ne me dites pas ce que je dessine : dites-moi ce que vous voyez.'] }),
    ];
  },
  tournant(c) {
    const Ca = c.lieu('cascade');
    if (!Ca) return null;
    const a = c.cap(Ca.P, c.devant(Ca.P, 0.5, 10)), ici = Q20H.ici(c, Ca, 11, 0.5);
    const J = ici && c.joueur(ici, { face: Ca.P, geste: 'leve' });
    const main = c.chose(Q20_DESSINS.main_vapeur, c.haut(Ca.P, 1.0), { r: c.cap(Ca.P, ici || c.devant(Ca.P, a, 8)), s: 1.6 });
    const brume = Q20H.emet(c.haut(Ca.P, 1.5), { n: 18, col: [0.94, 0.94, 0.94, 0.36], taille: 0.09, vie: 3.6, v: 0.6, vy: 0.4, r: 3.4 });
    return [
      c.plan({ dur: 6.6, cam: c.camLieu(Ca, { d: 14, haut: 1.8, dy: 2.6, a: ici ? c.cap(Ca.P, ici) + 0.25 : undefined, recul: 0.2 }), heure: c.heure('aube'), acteurs: [main, J], chaque: brume }),
      J && c.plan({ dur: 5.2, cam: c.camActeur(J, { cote: 0.6, d: 3.0, buste: true }), heure: c.heure('aube'), acteurs: [J, main], chaque: brume, son: 'murmure' }),
    ];
  },
  fin(c) {
    const Bs = Q20BH.bassins(c), B = Bs[1] || Bs[0];
    if (!B) return null;
    const P0 = Q20BH.bord(c, B, 2, 0.4);
    const moi = c.habitant('naturiste_c', P0, { face: B.P, geste: ['assis', 'baisse', { reach: 0.1 }] });
    const moi2 = c.habitant('naturiste_c', P0, { cap: c.cap(B.P, P0), geste: ['offre', 'parle'] });
    const bg = c.chose(Q20_DESSINS.bougies, c.haut(c.devant(P0, moi2.cap, 0.38, 0.1, true), 1.0), { s: 1.4 });
    const pb = c.devant(B.P, c.cap(B.P, P0), B.w / 2 + 0.35, 0.6);
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 1.2, d: 2.4, buste: true }), acteurs: [moi], chaque: Q20BH.vapeur(B), dit: ['Une main ? Ouverte, ou fermée ? … Ouverte. Alors elle ne nous chasse pas. Elle montre quelque chose.'], court: true }),
      c.plan({ dur: 5.8, cam: c.camActeur(moi2, { cote: -0.4, d: 2.3 }), heure: Math.max(c.h, 20.6), acteurs: [moi2, bg, c.chose('bougie', pb)], lum: [Q20B.flamme(c, pb, 3.5, 0.3)], dit: ['Prenez ces bougies, pour la prochaine fois que vous la verrez. Moi, je les allume toutes les nuits.'] }),
    ];
  },
});

// ============================================================================ LES HALLES D'EN BAS : HILDE (la forgeronne naine)
function q20Nains(c) { const en = Q20H.meuble(c, 'nain_b', 'enclume'), four = Q20H.meuble(c, 'nain_b', 'four'); return { en, four, lum: four ? [c.lueur(four.P, 5, [1.05, 0.5, 0.2], 0.7)] : [] }; }
q20.scenes('nain_forgeronne_1', {
  qui: 'nain_forgeronne',
  monde: 'nains',
  demande(c) {
    const N = q20Nains(c);
    const moi = Q20H.poste(c, 'nain_forgeronne', { vise: N.en && N.en.P, geste: 'travaille', tient: true });
    const etin = N.en ? Q20H.emet(c.haut(N.en.P, 0.85), { n: 14, col: [1.6, 0.9, 0.35, 1], taille: 0.025, vie: 0.6, v: 1.6, vy: 0.9, grav: 4, eclat: true }) : null;
    const E = Q20H.pres(c, c.lieu('nains').P, 'echelle', 40);
    const haut = E ? c.haut(E.P, 6) : c.haut(c.lieu('nains').P, 6);
    const pied = E ? Q20B.libre(c, Q20B.devant(c, E.P, c.cap(E.P, c.lieu('nains').P), 3.2, 0.8), 0, 4, 0.5) : null;
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 1.2, d: 2.6 }), acteurs: [moi], lum: N.lum, son: 'enclume', chaque: etin, dit: ['Notre charbon, on le prend dans la montagne. Et la montagne n’aime plus qu’on le prenne.'], court: true }),
      c.plan({ dur: 6, cam: pied ? c.camRegard(pied, haut, { haut: 1.3, recul: 0.05 }) : c.camActeur(moi, { cote: -0.6, d: 3 }), acteurs: [], dit: ['Dix charbons, deux lingots de fer. D’en haut. Pas de discussion.'] }),
    ];
  },
  fin(c) {
    const N = q20Nains(c);
    const moi = Q20H.poste(c, 'nain_forgeronne', { vise: N.four ? N.four.P : N.en && N.en.P, geste: ['baisse', { reach: 0.2 }] });
    const ch = moi && c.chose(Q20_DESSINS.charbon, c.devant(moi.P, moi.cap, 0.6, 0.1, true), { s: 1.4 });
    const moi2 = Q20H.poste(c, 'nain_forgeronne', { geste: ['offre', 'leve'] });
    const le = moi2 && c.chose(Q20_DESSINS.lentille, c.haut(c.devant(moi2.P, moi2.cap, 0.3, 0.08, true), 0.78), { s: 1.6, r: moi2.cap });
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.9, d: 2.3, buste: true }), acteurs: [moi, ch], lum: N.lum, dit: ['Ça brûle sec, votre charbon d’en haut. Ça sent le soleil.'], court: true }),
      c.plan({ dur: 6, cam: c.camActeur(moi2, { cote: 0.3, d: 2.0, buste: true }), acteurs: [moi2, le, Q20B.face(c, moi2, 1.3, 0.2)], lum: N.lum, dit: ['Une lentille. Taillée par moi. Ne la rayez pas.'] }),
    ];
  },
});

q20.scenes('nain_forgeronne_2', {
  qui: 'nain_forgeronne',
  monde: 'nains',
  delais: { tournant: 1.5 },
  demande(c) {
    const N = q20Nains(c);
    const moi = Q20H.poste(c, 'nain_forgeronne', { vise: N.en && N.en.P, geste: ['penche', { lookP: 0.6, reach: 0.15 }] });
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 1.0, d: 2.4 }), acteurs: [moi], lum: N.lum, dit: ['La nuit, sous mon enclume, on frappe. Trois coups, puis trois coups. Personne n’habite plus bas que nous.'], court: true }),
      N.en && c.plan({ dur: 6, cam: c.camChose(N.en.P, { d: 1.8, haut: 1.1, dy: 0.6, a: moi ? moi.cap + 2.2 : 0.8 }), acteurs: [moi], lum: N.lum, son: 'coups', dit: ['Mon père dit que c’est le dieu qui dort. Un dieu ne frappe pas en mesure. Venez écouter, cette nuit.'] }),
    ];
  },
  tournant(c) {
    const N = q20Nains(c);
    if (!N.en) return null;
    const J = c.joueur(c.devant(N.en.P, 0.6, 0.85, 0.2, true), { face: N.en.P, geste: ['penche', { reach: 0.3 }], tient: 'marteau' });
    return [
      c.plan({ dur: 6.2, cam: c.camChose(N.en.P, { d: 1.6, haut: 0.9, dy: 0.5, a: 2.4, recul: 0.15 }), acteurs: [J], heure: c.heure('nuit'), son: 'coups' }),
      c.plan({ dur: 5.4, cam: c.camActeur(J, { cote: 1.0, d: 2.4, buste: true }), acteurs: [J], heure: c.heure('nuit'), son: 'coups' }),
    ];
  },
  fin(c) {
    const N = q20Nains(c);
    const moi = Q20H.poste(c, 'nain_forgeronne', { vise: N.en && N.en.P, geste: ['raide', 'baisse'], tient: true });
    const moi2 = Q20H.poste(c, 'nain_forgeronne', { geste: ['offre'] });
    const le = moi2 && c.chose(Q20_DESSINS.lentille_cristal, c.haut(c.devant(moi2.P, moi2.cap, 0.3, 0.08, true), 0.78), { s: 1.6, r: moi2.cap, lueur: true });
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.8, d: 2.2 }), acteurs: [moi], lum: N.lum, dit: ['Ils répondent à mon marteau ? … Alors c’est quelqu’un qui a appris le métier.'], court: true }),
      c.plan({ dur: 5.8, cam: c.camActeur(moi2, { cote: 0.2, d: 1.9, buste: true }), acteurs: [moi2, le], lum: N.lum.concat(le ? [c.lueur(le.P, 1.6, [0.5, 0.7, 0.95], 0.1)] : []), dit: ['Une lentille de cristal. Cent ans de taille. Ne la vendez pas à un humain.'] }),
    ];
  },
});

// ============================================================================ LE CHEVALIER DU GUET (Vauquelin ; le corps de garde, la poterne)
function q20Poterne(c) {
  const L = c.lieu('poterne');
  if (!L) return null;
  // (le dehors : du côté où le sol est libre, loin du rempart)
  const w = c.w, Bl = c.blocs(L.P, 14);
  let best = null;
  for (let k = 0; k < 16; k++) {
    const a = k / 16 * TAU, P = c.pt(L.x + Math.sin(a) * 5, L.z + Math.cos(a) * 5);
    if (qtDansBloc(Bl, c.haut(P, 1.0), 0.4) || P[1] < w.waterLevel + 0.2) continue;
    const sc = -Math.abs(P[1] - L.y);
    if (!best || sc > best.sc) best = { sc, P, a };
  }
  return { L, dehors: best ? best.P : c.devant(L.P, 0.4, 5), a: best ? best.a : 0.4 };
}
q20.scenes('chevalier_guet_1', {
  qui: 'chevalier_guet',
  delais: { tournant: 2 },
  demande(c) {
    const ps = Q20BH.spot(c, 'g1_corps_garde', 'poste') || Q20BH.spot(c, 'g1_corps_garde', 'sit');
    const M = c.maison('chevalier_guet');
    const moi = ps ? c.habitant('chevalier_guet', ps, { cap: M.cap, geste: ['raide', 'bras'] }) : Q20H.seuil(c, 'chevalier_guet', { d: 0.8, geste: ['raide', 'bras'] });
    const Pt = q20Poterne(c);
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.5, d: 2.4 }), acteurs: [moi], lum: [Q20B.flamme(c, moi && moi.P, 3, 1.2)], dit: ['À trois heures, on frappe à la poterne. De l’extérieur. Trois fois. Quand j’ouvre, personne.'], court: true }),
      Pt && c.plan({ dur: 6.2, cam: c.camLieu(Pt.L, { d: 12, haut: 2, dy: 1.4, a: Pt.a + 0.3 }), heure: 3.0, son: 'coups', dit: ['Cette nuit, guettez de dehors. Sans lanterne. Je veux savoir qui, pas pourquoi.'] }),
    ];
  },
  tournant(c) {
    const Pt = q20Poterne(c);
    if (!Pt) return null;
    const J = c.joueur(Pt.dehors, { face: Pt.L.P, geste: 'raide' });
    const sol = c.devant(Pt.L.P, Pt.a, 1.4);
    return [
      c.plan({ dur: 6.2, cam: c.camLieu(Pt.L, { d: 7, haut: 1.5, dy: 1.3, a: Pt.a + 0.6, recul: 0.1 }), heure: 3.05, acteurs: [J], son: 'coups' }),
      c.plan({ dur: 5.4, cam: c.camChose(sol, { d: 2.2, haut: 1.0, a: Pt.a + 1.4, recul: 0.2 }), heure: 3.1, acteurs: [J] }),
    ];
  },
  fin(c) {
    const ps = Q20BH.spot(c, 'g1_corps_garde', 'assis_chevalier_guet') || Q20BH.spot(c, 'g1_corps_garde', 'sit');
    const t = Q20H.meuble(c, 'g1_corps_garde', 'table');
    const moi = ps ? c.habitant('chevalier_guet', ps, { face: t ? t.P : undefined, geste: ['assis', 'baisse'] }) : Q20H.seuil(c, 'chevalier_guet', { d: 0.8, geste: ['raide'] });
    const moi2 = Q20H.seuil(c, 'chevalier_guet', { d: 1.0, geste: ['offre', 'parle'] });
    const hu = moi2 && c.chose(Q20_DESSINS.huile, c.haut(c.devant(moi2.P, moi2.cap, 0.38, 0.1), 1.05), { s: 1.3 });
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.6, d: 2.0 }), acteurs: [moi], lum: [Q20B.flamme(c, t ? t.P : moi && moi.P, 3, 1.0)], dit: ['Personne, et pourtant on a frappé… Bien. Je ferai murer la poterne.'], court: true }),
      c.plan({ dur: 5.6, cam: c.camActeur(moi2, { cote: 0.4, d: 2.6, buste: true }), heure: Math.max(c.h, 19.4), acteurs: [moi2, hu, Q20H.face(c, moi2, 1.5, 0.3)], dit: ['Prenez cette huile. Les nuits sont longues, ici, et les lampes ont soif.'] }),
    ];
  },
});

q20.scenes('chevalier_guet_2', {
  qui: 'chevalier_guet',
  demande(c) {
    const t = Q20H.meuble(c, 'g1_corps_garde', 'table');
    const ps = Q20BH.spot(c, 'g1_corps_garde', 'assis_chevalier_guet') || Q20BH.spot(c, 'g1_corps_garde', 'sit');
    const moi = ps ? c.habitant('chevalier_guet', ps, { face: t ? t.P : undefined, geste: ['assis', 'baisse', { reach: 0.2 }] }) : Q20H.seuil(c, 'chevalier_guet', { d: 0.8, geste: ['baisse'] });
    const li = t && c.chose(Q20_DESSINS.liste, c.haut(t.P, 0.79), { s: 1.4, r: 0.2 });
    const E = c.maison('cure');
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.7, d: 1.9, buste: true }), acteurs: [moi, li], lum: [Q20B.flamme(c, t ? t.P : moi && moi.P, 3, 1.0)], dit: ['Une liste de noms. Les camarades du 6 août. Je voudrais qu’on dise une messe pour eux, une fois.'], court: true }),
      c.plan({ dur: 6, cam: c.camLieu(E.porte, { d: 18, haut: 3, dy: 3, a: E.cap + 0.4 }), dit: ['Je ne vais pas à l’église : j’y ai trop vu de bannières. Portez-la au curé. Et ne la lisez pas.'] }),
    ];
  },
  tournant(c) {
    const moi = Q20H.poste(c, 'cure', { geste: ['baisse', { reach: 0.3 }] });
    const li = moi && c.chose(Q20_DESSINS.liste, c.haut(c.devant(moi.P, moi.cap, 0.35, 0.05, true), 1.18), { s: 1.4, r: moi.cap });
    const cierges = qtPropsDans(c.w, 'eglise', (q) => q.id === 'bougie').slice(0, 2).map((q) => c.lueur([q.x, q.y, q.z], 3.5, [1.0, 0.7, 0.35], 0.3));
    const B = c.w.bld.eglise, banc = B && B.spots && B.spots.banc19 ? [B.spots.banc19.x, B.y + 0.8, B.spots.banc19.z] : null;
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.5, d: 2.0, buste: true }), acteurs: [moi, li], lum: cierges, dit: ['Une liste du chevalier ? … Cent trente-sept noms. Je les lirai dimanche, tous, à voix haute.', '@cure'] }),
      c.plan({ dur: 5.6, cam: banc ? c.camDedans('eglise', banc, { pref: c.maison('cure').cap + 0.4, d: 4, he: 1.8 }) : c.camActeur(moi, { cote: -0.8, d: 3 }), acteurs: [moi], lum: cierges, dit: ['Dites-lui de venir. Il peut rester au fond.', '@cure'] }),
    ];
  },
  fin(c) {
    const M = c.maison('chevalier_guet'), E = c.maison('cure');
    const moi = Q20H.seuil(c, 'chevalier_guet', { d: 1.2, vise: E.porte, geste: ['raide', 'leve'] });
    const moi2 = Q20H.seuil(c, 'chevalier_guet', { d: 1.2, vise: E.porte, geste: ['baisse', 'bras'] });
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.6, d: 2.6 }), acteurs: [moi], dit: ['Dimanche… Je resterai au fond. Merci.'], court: true }),
      c.plan({ dur: 6, cam: c.camActeur(moi2, { cote: Math.PI + 0.3, d: 3.0, haut: 1.8 }), heure: Math.max(c.h, 18.6), acteurs: [moi2], son: 'cloche', dit: ['Cinquante ans que je portais cette feuille. Elle pèse moins, d’un coup.'] }),
    ];
  },
});

// ============================================================================ LE GARDE CHAMPÊTRE (Tissier ; sa cabane du hameau, ses procès-verbaux)
function q20Cabane(c, qui, geste) {
  const t = Q20H.meuble(c, 'g1_cabane_hameau', 'table');
  const ps = Q20BH.spot(c, 'g1_cabane_hameau', 'assis_' + qui) || Q20BH.spot(c, 'g1_cabane_hameau', 'sit');
  const moi = ps ? c.habitant(qui, ps, { face: t ? t.P : undefined, geste }) : Q20H.seuil(c, qui, { d: 0.8, geste });
  return { t, moi, lum: [Q20B.flamme(c, t ? t.P : moi && moi.P, 3, 1.0)] };
}
q20.scenes('garde_champetre_1', {
  qui: 'garde_champetre',
  delais: { tournant: 1.8 },
  demande(c) {
    const C = q20Cabane(c, 'garde_champetre', ['assis', 'travaille']);
    const pv = C.t && c.chose(Q20_DESSINS.pv, c.haut(C.t.P, 0.79), { s: 1.3, r: 0.3 });
    const Me = c.lieu('menhirs');
    const bo = Me && c.chose(Q20_DESSINS.borne, Me.P, { s: 1.4, r: 0.7 });
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(C.moi, { cote: 0.6, d: 2.0, buste: true }), acteurs: [C.moi, pv], lum: C.lum, dit: ['Une borne du cadastre a encore bougé. Trente mètres, cette fois.'], court: true }),
      Me && c.plan({ dur: 6.2, cam: c.camLieu(Me, { d: 30, haut: 4, dy: 1.2, recul: 0.15 }), acteurs: [bo], dit: ['On la retrouve au milieu des Demoiselles, plantée comme une des leurs. Que je dresse procès-verbal.'] }),
    ];
  },
  tournant(c) {
    const Me = c.lieu('menhirs');
    if (!Me) return null;
    const ici = Q20H.ici(c, Me, 6, 0.6);
    const bo = c.chose(Q20_DESSINS.borne, Me.P, { s: 1.4, r: 0.7 });
    const J = ici && c.joueur(Q20B.devant(c, Me.P, c.cap(Me.P, ici), 1.6, 0.3), { face: Me.P, geste: 'baisse' });
    return [
      c.plan({ dur: 6, cam: c.camLieu(Me, { d: 16, haut: 2.4, dy: 1.2, a: ici ? c.cap(Me.P, ici) + 0.4 : undefined, recul: 0.25 }), acteurs: [bo, J] }),
      c.plan({ dur: 5.4, cam: c.camChose(Me.P, { d: 2.0, haut: 1.0, dy: 0.5, a: J ? c.cap(Me.P, J.P) + 0.6 : 0.8 }), acteurs: [bo, J] }),
    ];
  },
  fin(c) {
    const C = q20Cabane(c, 'garde_champetre', ['assis', 'leve', 'parle']);
    const C2 = q20Cabane(c, 'garde_champetre', ['assis', 'travaille']);
    const pv = C2.t && c.chose(Q20_DESSINS.pv, c.haut(C2.t.P, 0.79), { s: 1.3, r: 0.3 });
    return [
      c.plan({ dur: 6, cam: c.camActeur(C.moi, { cote: 0.5, d: 2.0 }), acteurs: [C.moi], lum: C.lum, dit: ['De la mousse ? Elle a été posée l’an dernier !'], court: true }),
      c.plan({ dur: 6.2, cam: c.camActeur(C2.moi, { cote: 1.0, d: 1.9, buste: true }), acteurs: [C2.moi, pv], lum: C2.lum, son: 'page', dit: ['« Borne déplacée par inconnus. » Les inconnus, c’est commode. Merci.'] }),
    ];
  },
});

q20.scenes('garde_champetre_2', {
  qui: 'garde_champetre',
  delais: { tournant: 2.5 },
  demande(c) {
    const C = q20Cabane(c, 'garde_champetre', ['assis', 'baisse', { reach: 0.1 }]);
    const pv = C.t && c.chose(Q20_DESSINS.pv, c.haut(C.t.P, 0.79), { s: 1.3, r: 0.3 });
    const Ma = c.lieu('marais');
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(C.moi, { cote: 0.7, d: 1.9, buste: true }), acteurs: [C.moi, pv], lum: C.lum, dit: ['Vingt ans de procès-verbaux, et un seul que je n’ai pas su ranger : l’homme qui marchait sur l’eau du marais.'], court: true }),
      Ma && c.plan({ dur: 6, cam: c.camLieu(Ma, { d: 30, haut: 2.4, dy: 1 }), heure: c.heure('nuit'), lum: [Q20B.lune(c, Ma)], son: 'eau', dit: ['Il me faut un témoin, et je suis trop vieux pour en être un. Ne l’appelez pas.'] }),
    ];
  },
  tournant(c) {
    const Ma = c.lieu('marais'), w = c.w;
    if (!Ma) return null;
    // (sur l'eau du marais : un point d'eau libre, près du centre)
    let E = null;
    try { for (const [x, z] of qtAnneaux(Ma.x, Ma.z, 4, 26, 0.6, 16)) if (w.heightAt(x, z) < w.waterLevel - 0.15) { E = [x, w.waterLevel, z]; break; } } catch (e) { E = null; }
    if (!E) E = [Ma.x, w.waterLevel, Ma.z];
    const ici = Q20H.ici(c, Ma, 14, 0.4);
    const vers = c.devant(E, c.cap(E, ici || Ma.P) + 1.4, 6, 0, true);
    vers[1] = w.waterLevel;
    const lui = c.gens('sur_leau', E, { vers, t0: 0.4, t1: 6.2, face: ici || Ma.P, vu: false, vol: true });
    const lui2 = c.gens('sur_leau', vers, { face: 'camera', geste: 'raide', vu: false });
    return [
      c.plan({ dur: 6.6, cam: c.camLieu(E, { d: 20, haut: 1.6, dy: 1.2, a: ici ? c.cap(E, ici) : undefined, recul: 0.12 }), heure: c.heure('nuit'), acteurs: [lui], lum: [Q20B.lune(c, E)], son: 'eau' }),
      c.plan({ dur: 5.2, cam: c.camLieu(vers, { d: 12, haut: 1.5, dy: 1.3, a: ici ? c.cap(vers, ici) : undefined, recul: 0.18 }), heure: c.heure('nuit'), acteurs: [lui2] }),
    ];
  },
  fins: {
    0: (c) => {
      const C = q20Cabane(c, 'garde_champetre', ['assis', 'raide', 'parle']);
      const C2 = q20Cabane(c, 'garde_champetre', ['assis', 'travaille']);
      const pv = C2.t && c.chose(Q20_DESSINS.pv, c.haut(C2.t.P, 0.79), { s: 1.3, r: 0.3 });
      return [
        c.plan({ dur: 6.2, cam: c.camActeur(C.moi, { cote: 0.5, d: 1.9 }), acteurs: [C.moi], lum: C.lum, dit: ['Il marchait sur l’eau. Bien. Je rouvre le dossier. Signez là.'], court: true }),
        c.plan({ dur: 6, cam: c.camActeur(C2.moi, { cote: 1.1, d: 1.8, buste: true }), acteurs: [C2.moi, pv], lum: C2.lum, son: 'page', dit: ['Vous tremblez ? Moi aussi, la première fois.'] }),
      ];
    },
    1: (c) => {
      const C = q20Cabane(c, 'garde_champetre', ['assis', 'hoche']);
      const moi2 = Q20H.seuil(c, 'garde_champetre', { d: 1.0, geste: ['bras', 'leve'] });
      return [
        c.plan({ dur: 6, cam: c.camActeur(C.moi, { cote: 0.5, d: 1.9 }), acteurs: [C.moi], lum: C.lum, dit: ['Rien. Bien sûr. Je le laisse classé.'], court: true }),
        c.plan({ dur: 6, cam: c.camActeur(moi2, { cote: 0.6, d: 3.0 }), acteurs: [moi2], dit: ['Merci de ne pas avoir vu. C’est un service, ça aussi.'] }),
      ];
    },
  },
});

// ============================================================================ LE GENDARME (Delcourt ; la cabane du hameau, son cheval, sa tournée)
q20.scenes('gendarme_1', {
  qui: 'gendarme',
  demande(c) {
    const pc = Q20BH.spot(c, 'g1_cabane_hameau', 'cheval');
    const moi = Q20H.seuil(c, 'gendarme', { d: 1.0, geste: ['tend', 'raide'] });
    const env = moi && c.chose(Q20_DESSINS.rapport, c.haut(c.devant(moi.P, moi.cap, 0.4, 0.08), 1.15), { s: 1.3, r: moi.cap });
    const ch = pc && c.bete('horse', pc, { v: 3, cap: moi ? moi.cap + 1.6 : 0, geste: { graze: 0.4 } });
    const Po = c.maison('postiere');
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.6, d: 2.6, buste: true }), acteurs: [moi, env, ch], dit: ['Mes rapports partent chaque semaine, la postière me l’assure. Jamais de réponse.'], court: true }),
      c.plan({ dur: 6, cam: c.camLieu(Po.porte, { d: 16, haut: 3, dy: 1.8, a: Po.cap + 0.5 }), dit: ['Portez celui-ci en main propre, et regardez ce qu’elle en fait. Ce n’est pas un soupçon. C’est une procédure.'] }),
    ];
  },
  tournant(c) {
    const moi = Q20H.poste(c, 'postiere', { geste: ['tend', 'baisse'] });
    const env = moi && c.chose(Q20_DESSINS.rapport, c.haut(c.devant(moi.P, moi.cap, 0.4, 0.05, true), 1.08), { s: 1.3, r: moi.cap });
    const ps = moi && c.devant(moi.P, moi.cap + 2.2, 0.9, 0, true);
    const sac = ps && c.chose(Q20_DESSINS.sac_prefecture, ps, { r: moi.cap });
    const moi2 = ps && c.habitant('postiere', c.devant(ps, moi.cap + 2.2 + Math.PI, 0.7, 0, true), { face: ps, geste: ['penche', { reach: 0.4 }] });
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.4, d: 2.2, buste: true }), acteurs: [moi, env], son: 'page', dit: ['Encore un rapport du gendarme ? Dans le sac de la préfecture, comme les autres.', '@postiere'] }),
      moi2 && c.plan({ dur: 6, cam: c.camActeur(moi2, { cote: 1.2, d: 2.2, avec: ps, k: 0.5 }), acteurs: [moi2, sac], dit: ['Le sac part le mardi. Il revient le mercredi. Plein. Je n’ai jamais osé lui dire.', '@postiere'] }),
    ];
  },
  fin(c) {
    const pc = Q20BH.spot(c, 'g1_cabane_hameau', 'cheval');
    const moi = Q20H.seuil(c, 'gendarme', { d: 1.0, geste: ['raide', 'baisse'] });
    const ch = pc && c.bete('horse', pc, { v: 3, cap: moi ? moi.cap + 1.6 : 0 });
    const C = q20Cabane(c, 'gendarme', ['assis', 'travaille']);
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.5, d: 2.4 }), acteurs: [moi, ch], dit: ['Plein. Mes rapports me reviennent, donc. Depuis deux ans.'], court: true }),
      c.plan({ dur: 6, cam: c.camActeur(C.moi, { cote: 1.0, d: 1.9, buste: true }), acteurs: [C.moi], lum: C.lum, son: 'page', dit: ['Je continuerai quand même. Quelqu’un les lit, là-bas, ou ici. Ça revient au même.'] }),
    ];
  },
});

q20.scenes('gendarme_2', {
  qui: 'gendarme',
  demande(c) {
    const H = c.lieu('hameau'), F = c.lieu('foret') || c.lieu('chene');
    const M = c.maison('gendarme');
    const cap = F ? c.cap(M.porte, F.P) : M.cap;
    const P0 = M.dehors(4, 2);
    const ch = c.bete('horse', P0, { v: 3, cap: cap + Math.PI, geste: { lookP: -0.1 } });
    const moi = c.habitant('gendarme', c.devant(P0, cap + Math.PI / 2, 1.2, 0), { cap: cap + Math.PI * 0.85, geste: ['raide', { lookY: 0.4 }] });
    const lp = Q20H.libre(c, c.devant(P0, cap + Math.PI, 15, 2), 0, 6, 0.7);
    const loup = c.bete('wolf', lp, { cap: c.cap(lp, P0), geste: { lookP: -0.1 } });
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.7, d: 3.4, avec: ch, k: 0.4 }), heure: Math.max(c.h, 18.4), acteurs: [moi, ch], son: 'cheval', dit: ['Un loup suit ma tournée. Toujours le même, une oreille fendue. À vingt pas, d’un village à l’autre.'], court: true }),
      c.plan({ dur: 6, cam: c.camChose(lp, { d: 5, haut: 1.0, dy: 0.5, a: c.cap(lp, P0) + 0.4, recul: 0.15 }), heure: Math.max(c.h, 18.8), acteurs: [loup], son: 'loup', dit: ['Mon cheval ne dort plus. Abattez-le, si vous chassez. Je ne peux pas tirer en service.'] }),
    ];
  },
  tournant(c) {
    const p = game.player, w = c.w;
    const P0 = !c.rejeu && p ? Q20H.libre(c, c.devant(c.pt(p.pos[0], p.pos[2]), p.yaw + Math.PI, 3.2), 0, 5, 0.8) : Q20H.libre(c, c.devant(c.lieu('hameau').P, 1.2, 40), 0, 8, 0.8);
    const loup = c.bete('wolf', P0, { cap: 1.2, geste: { lie: 1 } });
    const J = c.joueur(c.devant(P0, 2.4, 1.6), { face: P0, geste: 'baisse', tient: true });
    return [
      c.plan({ dur: 6, cam: c.camChose(P0, { d: 2.2, haut: 1.0, dy: 0.3, a: 0.4, recul: 0.15 }), acteurs: [loup, J] }),
      c.plan({ dur: 5.4, cam: c.camActeur(J, { cote: 0.7, d: 3.6, avec: P0, k: 0.4 }), acteurs: [J, loup], son: 'corbeau' }),
    ];
  },
  fin(c) {
    const M = c.maison('gendarme'), pc = Q20BH.spot(c, 'g1_cabane_hameau', 'cheval');
    const P0 = pc || M.dehors(3, 2);
    const ch = c.bete('horse', P0, { v: 3, cap: M.cap + 1.2, geste: { graze: 1 } });
    const moi = c.habitant('gendarme', Q20B.devant(c, P0, M.cap + 1.2 + Math.PI / 2, 1.3, 0), { face: P0, geste: ['penche', { reach: 0.4 }] });
    const moi2 = Q20H.seuil(c, 'gendarme', { d: 1.0, geste: ['offre', 'raide'] });
    const ca = moi2 && c.chose(Q20_DESSINS.cartouches, c.haut(c.devant(moi2.P, moi2.cap, 0.38, 0.08), 1.08), { s: 1.3 });
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 1.2, d: 3.0, avec: ch, k: 0.4 }), heure: Math.min(Math.max(c.h, 7), 10), acteurs: [moi, ch], son: 'cheval', dit: ['Abattu ? … Le cheval a mangé, ce matin.'], court: true }),
      c.plan({ dur: 5.8, cam: c.camActeur(moi2, { cote: 0.3, d: 2.2, buste: true }), acteurs: [moi2, ca, Q20H.face(c, moi2, 1.5, 0.2)], son: 'piece', dit: ['Voici pour vous, et des cartouches. Ne me dites pas s’il avait l’oreille fendue. Je préfère croire que oui.'] }),
    ];
  },
});

// ============================================================================ LE BIBLIOTHÉCAIRE (Morand ; la bibliothèque, le plateau)
q20.scenes('libraire_2', {
  qui: 'libraire',
  demande(c) {
    const co = Q20H.meuble(c, 'bibliotheque', 'comptoir');
    const moi = Q20H.poste(c, 'libraire', { vise: co ? co.P : undefined, geste: ['penche', { reach: 0.2 }] });
    const reg = co && c.chose(Q20_DESSINS.pv, c.haut(co.P, 1.0), { s: 1.4, r: 0.1 });
    const bg = qtPropsDans(c.w, 'bibliotheque', (q) => q.id === 'bougie').slice(0, 2).map((q) => c.lueur([q.x, q.y, q.z], 3.5, [1.0, 0.7, 0.35], 0.3));
    const E = c.maison('cure');
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.6, d: 2.0, buste: true }), acteurs: [moi, reg], lum: bg, dit: ['Le registre des emprunts porte un nom : l’abbé Mauduit, 1871. Le livre n’est jamais revenu. L’abbé non plus.'], court: true }),
      c.plan({ dur: 6, cam: c.camLieu(E.porte, { d: 20, haut: 4, dy: 4, a: E.cap + 0.6 }), dit: ['Demandez au curé s’il est encore dans sa sacristie. Poliment. Les retards se paient, mais pas toujours en argent.'] }),
    ];
  },
  tournant(c) {
    const moi = Q20H.poste(c, 'cure', { geste: ['raide', 'parle'] });
    const cierges = qtPropsDans(c.w, 'eglise', (q) => q.id === 'bougie').slice(0, 2).map((q) => c.lueur([q.x, q.y, q.z], 3.5, [1.0, 0.7, 0.35], 0.3));
    const pl = moi && c.haut(c.devant(moi.P, moi.cap + 1.3, 1.2, 0, true), 0.95);
    const li = pl && c.chose(Q20_DESSINS.livre_chaud, pl, { s: 1.3, r: 0.4 });
    const tbl = pl && c.chose('table', c.haut(pl, -0.95), { r: 0.4 });
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.5, d: 2.2 }), acteurs: [moi], lum: cierges, dit: ['Un livre de l’abbé Mauduit ? Il y en a un, dans la sacristie, que personne n’ose ouvrir.', '@cure'] }),
      pl && c.plan({ dur: 6, cam: c.camChose(pl, { d: 1.7, dy: 0.1 }), acteurs: [tbl, li], lum: cierges, chaque: Q20H.emet(c.haut(pl, 0.12), { n: 4, col: [0.8, 0.78, 0.74, 0.18], taille: 0.08, vie: 2.4, v: 0.05, vy: 0.2, r: 0.2 }), dit: ['Il est chaud, même l’hiver. Dites au bibliothécaire de venir le chercher lui-même.', '@cure'] }),
    ];
  },
  fin(c) {
    const co = Q20H.meuble(c, 'bibliotheque', 'comptoir');
    const moi = Q20H.poste(c, 'libraire', { vise: co ? co.P : undefined, geste: ['raide', 'baisse'] });
    const moi2 = Q20H.poste(c, 'libraire', { vise: co ? co.P : undefined, geste: ['travaille'] });
    const reg = co && c.chose(Q20_DESSINS.pv, c.haut(co.P, 1.0), { s: 1.4, r: 0.1 });
    const bg = qtPropsDans(c.w, 'bibliotheque', (q) => q.id === 'bougie').slice(0, 2).map((q) => c.lueur([q.x, q.y, q.z], 3.5, [1.0, 0.7, 0.35], 0.3));
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.4, d: 2.0 }), acteurs: [moi], lum: bg, dit: ['Lui-même. Il sait bien que je ne peux pas sortir d’ici… Il ne sait pas, en fait. Tant mieux.'], court: true }),
      c.plan({ dur: 5.6, cam: c.camActeur(moi2, { cote: 1.0, d: 1.9, buste: true }), acteurs: [moi2, reg], lum: bg, son: 'page', dit: ['Merci. Je vous inscris parmi les lecteurs exacts.'] }),
    ];
  },
});

// ============================================================================ LE COLPORTEUR (Jouvet ; sa roulotte, le refuge du col)
q20.scenes('colporteur_2', {
  qui: 'colporteur',
  delais: { tournant: 2.5 },
  demande(c) {
    const moi = Q20H.seuil(c, 'colporteur', { d: 1.2, geste: ['parle', 'montre'] });
    const R = c.lieu('refuge');
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.6, d: 2.8 }), acteurs: [moi], dit: ['Un berger m’a dit qu’on voyait de la lumière au refuge du col, les nuits de neige. Personne n’y monte avant l’été.'], court: true }),
      R && c.plan({ dur: 6.2, cam: c.camLieu(R, { d: 34, haut: 4, dy: 2, recul: 0.12 }), heure: c.heure('nuit'), lum: [c.lueur(R.P, 5, [1.0, 0.7, 0.4], 1.4), Q20B.lune(c, R)], dit: ['Allez voir, et racontez-moi. Couvrez-vous : là-haut, le vent ne vend rien, il prend.'] }),
    ];
  },
  tournant(c) {
    const R = c.lieu('refuge');
    if (!R) return null;
    const ch = Q20H.pres(c, R.P, 'cheminee', 8), t = Q20H.pres(c, R.P, 'table', 8);
    const P = ch ? c.devant(ch.P, ch.r || 0, 0.9, 0, true) : c.haut(R.P, 0);
    const bols = c.chose(Q20_DESSINS.quatre_bols, P, { r: 0.3, s: 1.1 });
    const J = c.joueur(c.devant(P, 0.9, 2.0, 0.3, true), { face: P, geste: 'baisse', vu: false });
    // (puis dehors, devant le refuge, dans le vent)
    const de = Q20H.libre(c, c.devant(R.P, 2.6, 7), 0, 6, 0.8);
    const J2 = c.joueur(de, { face: R.P, geste: 'raide' });
    return [
      c.plan({ dur: 6.4, cam: c.camChose(P, { d: 1.9, haut: 1.0, dy: 0.1, recul: 0.15 }), acteurs: [bols, J] }),
      c.plan({ dur: 5.4, cam: c.camActeur(J2, { cote: Math.PI + 0.3, d: 3.2, haut: 1.8 }), acteurs: [J2], chaque: Q20H.emet(c.haut(de, 1.6), { n: 10, col: [0.95, 0.95, 0.98, 0.7], taille: 0.04, vie: 1.6, v: 2.2, vy: -0.4, r: 4 }) }),
    ];
  },
  fin(c) {
    const moi = Q20H.seuil(c, 'colporteur', { d: 1.2, geste: ['leve', 'parle'] });
    const moi2 = Q20H.seuil(c, 'colporteur', { d: 1.2, geste: ['offre'] });
    const co = moi2 && c.chose('sac', c.devant(moi2.P, moi2.cap, 0.6, 0.3), { s: 0.7 });
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.5, d: 2.6 }), acteurs: [moi], dit: ['Quatre bols ? Parfait. Terrible, mais parfait. Je la raconterai jusqu’à Saint-Flour.'], court: true }),
      c.plan({ dur: 5.6, cam: c.camActeur(moi2, { cote: -0.4, d: 2.4, buste: true }), acteurs: [moi2, co, Q20H.face(c, moi2, 1.5, 0.2)], son: 'piece', dit: ['Tenez, de la corde. Pour la prochaine fois que vous monterez.'] }),
    ];
  },
});

// ============================================================================ LA COLPORTEUSE (Carrez ; sa roulotte, le col des Treize)
q20.scenes('colporteuse_2', {
  qui: 'colporteuse',
  demande(c) {
    const moi = Q20H.seuil(c, 'colporteuse', { d: 1.2, geste: ['raide', { lookY: 0.8 }] });
    const Co = c.lieu('col');
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.6, d: 2.6 }), heure: Math.max(c.h, 19), acteurs: [moi], son: 'clochette', dit: ['Ma mule est morte au col, il y a vingt ans. Sa clochette, je la lui ai laissée.'], court: true }),
      Co && c.plan({ dur: 6.2, cam: c.camLieu(Co, { d: 36, haut: 5, dy: 1.5 }), dit: ['Certaines nuits, je l’entends derrière moi. Allez voir si elle y est encore. Elle sonne faux.'] }),
    ];
  },
  tournant(c) { return Q20H.trouvaille(c, Q20_DESSINS.sonnaille, { s: 1.6, son: 'clochette', dy2: 2 }); },
  fin(c) {
    const moi = Q20H.seuil(c, 'colporteuse', { d: 1.0, geste: ['tend', 'baisse'] });
    const so = moi && c.chose(Q20_DESSINS.sonnaille, c.haut(c.devant(moi.P, moi.cap, 0.3, 0.05), 1.15), { s: 1.3, r: moi.cap });
    const moi2 = Q20H.seuil(c, 'colporteuse', { d: 1.0, geste: ['offre', 'raide'] });
    const ca = moi2 && c.chose(Q20_DESSINS.carte, c.haut(c.devant(moi2.P, moi2.cap, 0.36, 0.06), 1.1), { s: 1.3, r: moi2.cap });
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.4, d: 1.9, buste: true }), acteurs: [moi, so], dit: ['C’est elle. Elle était là-haut, alors. Ce que j’entends le soir, ce n’est pas elle.'], court: true }),
      c.plan({ dur: 5.6, cam: c.camActeur(moi2, { cote: -0.3, d: 2.0, buste: true }), heure: Math.max(c.h, 19.6), acteurs: [moi2, ca], son: 'clochette', dit: ['Gardons ça pour nous. Prenez cette carte, je la connais par cœur.'] }),
    ];
  },
});

// ============================================================================ LES SOURCES : LE DOCTEUR (Bréhal ; la source qui respire)
function q20Docteur(c, geste) {
  const t = Q20H.meuble(c, 'source_b', 'table'), ps = Q20BH.spot(c, 'source_b', 'sit');
  const moi = ps ? c.habitant('naturiste_b', ps, { face: t ? t.P : undefined, geste }) : Q20H.seuil(c, 'naturiste_b', { d: 0.8, geste });
  return { t, moi };
}
q20.scenes('naturiste_b_2', {
  qui: 'naturiste_b',
  delais: { tournant: 2 },
  demande(c) {
    const D = q20Docteur(c, ['assis', 'travaille']);
    const ca = D.t && c.chose(Q20_DESSINS.pv, c.haut(D.t.P, 0.79), { s: 1.3, r: 0.4 });
    const Bs = Q20BH.bassins(c), B = Bs[0];
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(D.moi, { cote: 0.7, d: 1.9, buste: true }), acteurs: [D.moi, ca], dit: ['Les nuits sans vent, l’eau des Sources baisse d’un pouce, puis remonte. Lentement. Huit fois par minute.'], court: true }),
      B && c.plan({ dur: 6, cam: c.camChose(B.P, { d: 5, haut: 1.4, dy: 0.2, a: B.r + 0.6 }), heure: c.heure('nuit'), lum: Q20BH.lanternes(c, B.P, 16, 3), chaque: Q20BH.vapeur(B), dit: ['Je veux l’avis de quelqu’un qui n’a pas lu mes livres. Comptez. Si c’est douze, revenez tout de suite.'] }),
    ];
  },
  tournant(c) {
    const Bs = Q20BH.bassins(c), B = Bs[0];
    if (!B) return null;
    const souffle = c.chose((PE, t) => { const k = Math.sin((t || 0) * TAU * 8 / 60); PE.box(0, -0.06 + k * 0.035, 0, B.w * 0.98, 0.02, B.d * 0.98, [0.32, 0.46, 0.5], TL.water || TL.plain); }, B.P, { r: B.r });
    const P0 = Q20BH.bord(c, B, 0, 0.1);
    const J = c.joueur(P0, { face: B.P, geste: ['penche', { lookP: 0.45 }] });
    const lum = Q20BH.lanternes(c, B.P, 16, 3);
    return [
      c.plan({ dur: 6.6, cam: c.camChose(B.P, { d: 3.6, haut: 1.6, dy: 0.3, a: B.r + 0.4, recul: 0.1 }), heure: c.heure('nuit'), acteurs: [souffle, J], lum, chaque: Q20BH.vapeur(B, 6) }),
      c.plan({ dur: 5.2, cam: c.camActeur(J, { cote: 0.9, d: 2.6, buste: true }), heure: c.heure('nuit'), acteurs: [J, souffle], lum, son: 'murmure' }),
    ];
  },
  fins: {
    0: (c) => {
      const D = q20Docteur(c, ['assis', 'hoche', 'parle']);
      const D2 = q20Docteur(c, ['assis', 'travaille']);
      const ca = D2.t && c.chose(Q20_DESSINS.pv, c.haut(D2.t.P, 0.79), { s: 1.3, r: 0.4 });
      return [
        c.plan({ dur: 6.2, cam: c.camActeur(D.moi, { cote: 0.5, d: 2.0 }), acteurs: [D.moi], dit: ['La géologie. Évidemment. Une poche de gaz qui se vide et se remplit.'], court: true }),
        c.plan({ dur: 5.8, cam: c.camActeur(D2.moi, { cote: 1.1, d: 1.9, buste: true }), acteurs: [D2.moi, ca], son: 'page', dit: ['Je l’écrirai ainsi. Merci : vous êtes un esprit sain.'] }),
      ];
    },
    1: (c) => {
      const D = q20Docteur(c, ['assis', 'raide', 'baisse']);
      const Bs = Q20BH.bassins(c), B = Bs[0];
      const moi2 = B && c.habitant('naturiste_b', Q20BH.bord(c, B, 1, 0.3), { face: B.P, geste: ['bras', 'baisse'] });
      return [
        c.plan({ dur: 6.4, cam: c.camActeur(D.moi, { cote: 0.4, d: 1.9 }), acteurs: [D.moi], dit: ['Je sais. Je l’écris « géologie » dans mes cahiers depuis vingt ans. Il faut bien écrire quelque chose.'], court: true }),
        moi2 && c.plan({ dur: 5.6, cam: c.camActeur(moi2, { cote: 0.8, d: 3.0, avec: B.P, k: 0.4 }), acteurs: [moi2], chaque: Q20BH.vapeur(B), dit: ['Merci de me l’avoir dit en face. Prenez ces bandages.'] }),
      ];
    },
  },
});

// ============================================================================ LES PLANCHES : LA DOYENNE (Lacombe ; la Dame des Planches)
function q20Dame(c) { const L = c.lieu('planches_dame'); if (!L) return null; const q = Q20H.pres(c, L.P, 'c2_dame_bois', 8); return { L, P: q ? q.P : [L.x, c.w.waterLevel + 0.4, L.z], r: q ? q.r : 0 }; }
q20.scenes('planches_doyenne_2', {
  qui: 'planches_doyenne',
  delais: { tournant: 1.6 },
  demande(c) {
    const t = Q20H.meuble(c, 'pl_doyenne', 'table'), ps = Q20BH.spot(c, 'pl_doyenne', 'sit');
    const moi = ps ? c.habitant('planches_doyenne', ps, { face: t ? t.P : undefined, geste: ['assis', 'parle'] }) : Q20H.seuil(c, 'planches_doyenne', { d: 0.8, geste: ['parle'] });
    const bg = qtPropsDans(c.w, 'pl_doyenne', (q) => q.id === 'bougie').slice(0, 1).map((q) => c.lueur([q.x, q.y, q.z], 3.5, [1.0, 0.7, 0.35], 0.3));
    const D = q20Dame(c);
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.6, d: 2.0 }), acteurs: [moi], lum: bg, dit: ['Va jusqu’à la Dame, au bout des planches. Sous son pied, il y a des noms gravés : ceux de Saint-Aubin qui sont restés en bas.'], court: true }),
      D && c.plan({ dur: 6, cam: c.camChose(D.P, { d: 7, haut: 1.6, dy: 1.6, a: (D.r || 0) + 0.5, recul: 0.15 }), son: 'eau', dit: ['Compte-les. Il doit y en avoir quarante et un. Compte deux fois : l’eau ment, la pierre non.'] }),
    ];
  },
  tournant(c) {
    const D = q20Dame(c);
    if (!D) return null;
    const a = c.cap(D.P, c.lieu('planches') ? c.lieu('planches').P : c.devant(D.P, 0, 10));
    const pn = c.devant(D.P, a, 0.32, 0, true);
    pn[1] = D.P[1] - 0.1;
    const noms = c.chose(Q20_DESSINS.noms, pn, { r: a, s: 0.8 });
    return [
      c.plan({ dur: 6.4, cam: c.camChose(c.haut(pn, 0.2), { d: 1.3, haut: 0.6, dy: 0, a, recul: 0.12 }), acteurs: [noms], son: 'eau' }),
      c.plan({ dur: 5.4, cam: c.camChose(D.P, { d: 6, haut: 1.4, dy: 1.6, a: a + 0.5 }), acteurs: [noms], son: 'goutte' }),
    ];
  },
  fin(c) {
    const t = Q20H.meuble(c, 'pl_doyenne', 'table'), ps = Q20BH.spot(c, 'pl_doyenne', 'sit');
    const moi = ps ? c.habitant('planches_doyenne', ps, { face: t ? t.P : undefined, geste: ['assis', 'raide', 'baisse'] }) : Q20H.seuil(c, 'planches_doyenne', { d: 0.8, geste: ['raide'] });
    const D = q20Dame(c), w = c.w;
    const cal = D ? [0, 1, 2].map((k) => c.chose(Q20_DESSINS.caleu, [D.P[0] + Math.sin(k * 2.1) * (1.4 + k * 0.5), w.waterLevel + 0.02, D.P[2] + Math.cos(k * 2.1) * (1.4 + k * 0.5)], { s: 1.2 })) : [];
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.4, d: 1.9 }), acteurs: [moi], dit: ['Quarante-deux ? … Alors quelqu’un a gravé le sien. Ne me dis pas lequel.'], court: true }),
      D && c.plan({ dur: 5.8, cam: c.camChose(D.P, { d: 6, haut: 1.3, dy: 0.8, a: (D.r || 0) + 0.8 }), heure: Math.max(c.h, 20.8), acteurs: cal, lum: cal.map((q) => q && c.lueur(q.P, 2.4, [1.0, 0.7, 0.35], 0.2)), dit: ['Prends ces calèus, pour le Vorndi. Et la tisane, pour dormir quand même.'] }),
    ];
  },
});

// ============================================================================ L'ESTIVE : LE PÂTRE (Rouveyrol ; ses brebis, la crête)
q20.scenes('estive_patre_2', {
  qui: 'estive_patre',
  delais: { tournant: 2 },
  demande(c) {
    const Es = c.lieu('estive'), Cr = c.lieu('estive_crete');
    const P0 = Es ? Q20H.libre(c, c.devant(Es.P, 0.6, 6), 0, 8, 0.8) : c.maison('estive_patre').dehors(3, 0);
    const moi = c.habitant('estive_patre', P0, { cap: Cr ? c.cap(P0, Cr.P) : 0, geste: ['montre', 'parle'] });
    const mout = [0, 1, 2, 3].map((i) => c.bete('sheep', c.devant(P0, moi.cap + 0.4 + i * 0.5, 3 + i * 0.9, i % 2 ? 1 : -1), { cap: i * 1.3, v: i, geste: { graze: 1 } }));
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.7, d: 3.2 }), acteurs: [moi, ...mout], dit: ['Hier, deux cent sept. Ce matin, deux cent six. Ça change tous les jours, d’une bête.'], court: true }),
      Cr && c.plan({ dur: 6, cam: c.camLieu(Cr, { d: 30, haut: 3, dy: 1.2, recul: 0.1 }), heure: c.heure('nuit'), lum: [Q20B.lune(c, Cr)], acteurs: [0, 1, 2].map((i) => c.bete('sheep', Q20H.libre(c, c.devant(Cr.P, i * 2.1, 2.4), 0, 4, 0.5), { cap: c.cap(Cr.P, Es ? Es.P : P0) + Math.PI, v: i })), dit: ['La nuit, elles montent seules sur la crête, et restent là, à regarder en bas. Va voir ce qui les appelle.'] }),
    ];
  },
  tournant(c) {
    const Cr = c.lieu('estive_crete');
    if (!Cr) return null;
    const bas = c.lieu('place') || c.lieu('ferme');
    const cap = bas ? c.cap(Cr.P, bas.P) : 0;
    const mout = [0, 1, 2, 3].map((i) => c.bete('sheep', Q20H.libre(c, c.devant(Cr.P, cap + Math.PI / 2, -3 + i * 2, 0.4 * (i % 2)), 0, 3, 0.5), { cap, v: i }));
    // (la bête de trop : sans ombre, plus pâle que les autres)
    const pale = c.figure(() => ANIMAL_RIGS.sheep(), (r, st) => { poseQuad(r, st); return 0; }, Q20H.libre(c, c.devant(Cr.P, cap, 2.5, 4), 0, 3, 0.5), { cap, lueur: true });
    const ici = Q20H.ici(c, Cr, 8, cap + Math.PI);
    const J = ici && c.joueur(ici, { face: Cr.P, geste: 'raide' });
    return [
      c.plan({ dur: 6.6, cam: c.camLieu(Cr, { d: 10, haut: 1.4, dy: 0.8, a: cap + Math.PI + 0.5, recul: 0.15 }), heure: c.heure('nuit'), acteurs: [...mout, pale, J] }),
      c.plan({ dur: 5.2, cam: c.camChose(pale.P, { d: 3.2, haut: 1.0, dy: 0.5, a: cap + Math.PI + 0.3 }), heure: c.heure('nuit'), acteurs: [pale, ...mout] }),
    ];
  },
  fin(c) {
    const moi = Q20H.seuil(c, 'estive_patre', { d: 1.0, geste: ['raide', 'baisse'] });
    const moi2 = Q20H.seuil(c, 'estive_patre', { d: 1.0, geste: ['offre', 'leve'] });
    const pl = moi2 && c.chose(Q20_DESSINS.plume, c.haut(c.devant(moi2.P, moi2.cap, 0.36, 0.06), 1.12), { s: 1.4, r: moi2.cap });
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.5, d: 2.2 }), acteurs: [moi], dit: ['Une de trop, sans ombre, qui regardait vers la vallée ? … Je ne la compterai plus.'], court: true }),
      c.plan({ dur: 5.6, cam: c.camActeur(moi2, { cote: -0.3, d: 2.0, buste: true }), acteurs: [moi2, pl, Q20H.face(c, moi2, 1.4, 0.2)], dit: ['Deux cent six, c’est le bon compte. Tiens, une plume d’aigle. Je l’avais trouvée pour toi.'] }),
    ];
  },
});
