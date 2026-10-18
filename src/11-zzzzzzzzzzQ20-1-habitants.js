// ============================================================================
//  LES SCÈNES DES QUÊTES (agent Q20A) — 1. LES QUÊTES DES HABITANTS
//  Les trente-neuf quêtes des douze habitants (05-npc-data.js), chacune ses
//  scènes, faites pour elle (le cadre : 11-zzzzzzzzzzQ20-0-cadre.js) :
//  - la demande : l'habitant chez lui, à sa façon (son geste, son poste, la
//    lumière de l'heure), puis ce dont il parle, vu de loin (le lieu, la
//    personne, la chose), sans tout montrer ;
//  - le tournant (sauf quand on apporte des choses) : la trouvaille, sur place ;
//    celui à qui l'on porte l'objet ou le message ; la nuit veillée ;
//  - le dénouement : sa réaction, et ce qu'il donne.
//  Les places sont lues dans le monde : maisons (w.bld, leurs postes, leurs
//  meubles), lieux-dits (w.lm), l'endroit où l'objet était caché (Q.pos).
// ============================================================================
Object.assign(Q20_LOOKS, {
  // Émile, sorti un soir avec sa lanterne (la boulangère le voit en rêve)
  emile: { skin: '#d8b090', hair: '#4a3222', hairStyle: 'court', beard: 'moustache', top: '#5a4a3a', bottom: '#3a3228', shoe: '#2a2018', hat: 'casquette', coat: true, held: 'lanterne' },
  // Jules, le frère du pêcheur, sur le clocher noyé
  jules: { skin: '#c8ccc8', hair: '#5a5e5a', hairStyle: 'court', beard: 'courte', top: '#3e4a52', bottom: '#3a3c38', shoe: '#2a2a28', hat: 'bonnet', face: 'paleF' },
  // le grand homme maigre du marais (la petite l'a vu)
  maigre: { skin: '#121214', hair: '#101012', hairStyle: 'court', hat: 'chapeau', hatCol: '#0c0c0e', top: '#141416', bottom: '#101012', shoe: '#0a0a0a', coat: true, face: 'blankF', height: 1.38, build: 'mince' },
  // à la fenêtre éclairée du hameau abandonné
  fenetre: { skin: '#e4e2dc', hair: '#3a3836', hairStyle: 'long', top: '#d8d4ca', bottom: '#cfcac0', shoe: '#8a8680', dress: true, face: 'paleF', height: 0.98 },
  // les enfants du catéchisme
  enfant_a: { skin: '#eac8ac', hair: '#6a4a2a', hairStyle: 'court', top: '#6a7a8a', bottom: '#4a4a52', shoe: '#2a2420', height: 0.66, build: 'mince' },
  enfant_b: { skin: '#f0d2b8', hair: '#a8783a', hairStyle: 'queue', top: '#9a6a5a', bottom: '#9a6a5a', shoe: '#3a2a20', dress: true, apron: '#e8e0d0', height: 0.63, build: 'mince' },
  enfant_c: { skin: '#e2bc9a', hair: '#2a2018', hairStyle: 'court', top: '#7a6a4a', bottom: '#3a3a3a', shoe: '#2a2420', hat: 'casquette', height: 0.7, build: 'mince' },
  // une statue sur la place (de pierre)
  statue: { skin: '#a8a49c', hair: '#8a867e', hairStyle: 'court', beard: 'moustache', top: '#a8a49c', bottom: '#9a968e', shoe: '#8a867e', coat: true, build: 'rond' },
});

// ---------------------------------------------------------------- de petits objets (dessinés dans le repère de la chose)
const Q20_DESSINS = {
  // une bague d'or (la chevalière, l'alliance), posée à plat
  bague(PE) { const o = [1.55, 1.22, 0.52]; PE.box(0, 0.012, 0, 0.034, 0.014, 0.034, o, TL.gold); PE.box(0, 0.016, 0, 0.018, 0.012, 0.018, [0.12, 0.1, 0.07], TL.plain); PE.box(0, 0.018, 0.014, 0.018, 0.01, 0.012, o, TL.gold); },
  // la même, sur une pierre plate (le rêve de la boulangère)
  pierre_bague(PE) { PE.box(0, 0.08, 0, 0.42, 0.16, 0.32, [0.86, 0.84, 0.8], TL.stone, 0.3); PE.box(0.04, 0.17, 0.02, 0.034, 0.014, 0.034, [1.55, 1.22, 0.52], TL.gold); PE.box(0.04, 0.175, 0.02, 0.018, 0.012, 0.018, [0.12, 0.1, 0.07], TL.plain); },
  // la pipe en bruyère de l'oncle Anatole
  pipe(PE) { const b = [0.62, 0.38, 0.22]; PE.box(0, 0.035, 0, 0.045, 0.07, 0.045, b, TL.wood); PE.box(0, 0.06, 0, 0.03, 0.01, 0.03, [0.08, 0.06, 0.05], TL.plain); PE.box(0.0, 0.02, 0.09, 0.016, 0.016, 0.15, [0.25, 0.18, 0.12], TL.darkwood); },
  // la clé du treuil, rouillée, mordue
  cle(PE) { const r = [0.62, 0.36, 0.22]; PE.box(0, 0.012, 0, 0.022, 0.022, 0.26, r, TL.iron); PE.box(0, 0.012, -0.15, 0.08, 0.02, 0.06, r, TL.iron); PE.box(0, 0.012, -0.15, 0.04, 0.024, 0.025, [0.1, 0.08, 0.06], TL.plain); PE.box(0.025, 0.012, 0.11, 0.035, 0.02, 0.05, r, TL.iron); PE.box(0.1, 0.004, 0.02, 0.18, 0.006, 0.12, [0.3, 0.28, 0.2], TL.soilWet); },
  // la dent du vieux loup, dans la terre fraîchement remuée
  dent(PE) { PE.box(0, 0.03, 0, 0.36, 0.06, 0.3, [0.42, 0.32, 0.22], TL.soil, 0.4); PE.box(0.02, 0.07, 0, 0.022, 0.02, 0.07, [1.25, 1.15, 0.9], TL.bone, 0.3); PE.box(0.02, 0.075, 0.04, 0.012, 0.012, 0.02, [1.2, 1.1, 0.85], TL.bone, 0.3); },
  // la boussole de Jules, l'aiguille vers le lac (elle tourne un peu)
  boussole(PE, t) { const l = [1.3, 1.05, 0.55]; PE.box(0, 0.012, 0, 0.09, 0.024, 0.09, l, TL.gold); PE.box(0, 0.025, 0, 0.074, 0.006, 0.074, [1.2, 1.18, 1.1], TL.paper); PE.box(0, 0.03, 0, 0.008, 0.005, 0.07, [0.7, 0.12, 0.1], TL.plain, Math.sin((t || 0) * 0.9) * 0.15); },
  // la cloche de Blanchette, à son collier
  clochette(PE) { const l = [1.25, 1.0, 0.5]; PE.box(0, 0.045, 0, 0.07, 0.08, 0.06, l, TL.gold); PE.box(0, 0.092, 0, 0.05, 0.018, 0.045, l, TL.gold); PE.box(0, 0.012, 0.0, 0.32, 0.014, 0.04, [0.38, 0.24, 0.14], TL.leather, 0.6); },
  // le chapelet de l'abbé, sa croix à l'envers
  chapelet(PE) { const b = [0.78, 0.6, 0.36]; for (let k = 0; k < 14; k++) { const a = k / 14 * TAU; PE.box(Math.sin(a) * 0.09, 0.01, Math.cos(a) * 0.06, 0.016, 0.016, 0.016, b, TL.wood); } PE.box(0, 0.008, 0.11, 0.014, 0.01, 0.07, b, TL.wood); PE.box(0, 0.008, 0.125, 0.044, 0.01, 0.012, b, TL.wood); },
  // le fer à cheval du père, sur sa planchette, clous neufs
  fer(PE) { const f = [0.55, 0.5, 0.46]; PE.box(0, 0.015, 0, 0.26, 0.03, 0.2, [0.55, 0.4, 0.26], TL.wood); for (const s of [-1, 1]) PE.box(s * 0.055, 0.035, 0.01, 0.022, 0.012, 0.11, f, TL.iron); PE.box(0, 0.035, -0.06, 0.13, 0.012, 0.022, f, TL.iron); for (const s of [-1, 1]) PE.box(s * 0.055, 0.044, 0.03, 0.01, 0.006, 0.01, [1.3, 1.3, 1.25], TL.metal); },
  // le même, cloué au-dessus de la porte (debout)
  fer_porte(PE) { const f = [0.55, 0.5, 0.46]; for (const s of [-1, 1]) PE.box(s * 0.055, 0.06, 0, 0.022, 0.12, 0.012, f, TL.iron); PE.box(0, 0.0, 0, 0.13, 0.022, 0.012, f, TL.iron); },
  // une couronne de fleurs et de baies
  couronne(PE) { const C = [[1.4, 0.4, 0.4], [1.4, 1.2, 0.5], [1.3, 1.25, 1.2], [0.9, 0.5, 1.2], [0.5, 0.1, 0.2]]; for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; PE.box(Math.sin(a) * 0.13, 0.025, Math.cos(a) * 0.13, 0.05, 0.04, 0.05, C[k % C.length], k % 5 === 4 ? TL.plain : TL.flowers); } },
  // le panier de pain sous son torchon à carreaux
  panier(PE) { PE.box(0, 0.08, 0, 0.36, 0.16, 0.24, [0.85, 0.65, 0.4], TL.straw); PE.box(0, 0.18, 0, 0.3, 0.05, 0.2, [1.0, 0.85, 0.65], TL.bread); PE.box(0.04, 0.2, 0, 0.26, 0.012, 0.22, [1.1, 0.9, 0.85], TL.plaid, 0.2); },
  // le colis humide (« de la part de ton frère »)
  colis(PE) { PE.box(0, 0.09, 0, 0.3, 0.18, 0.22, [0.5, 0.42, 0.32], TL.paper); PE.box(0, 0.181, 0, 0.31, 0.006, 0.02, [0.4, 0.34, 0.22], TL.rope); PE.box(0, 0.181, 0, 0.02, 0.006, 0.23, [0.4, 0.34, 0.22], TL.rope); PE.box(0.06, 0.02, 0.05, 0.12, 0.004, 0.1, [0.25, 0.28, 0.26], TL.soilWet); },
  // un faire-part bordé de noir
  fairepart(PE) { PE.box(0, 0.004, 0, 0.17, 0.006, 0.12, [0.06, 0.05, 0.05], TL.plain, 0.1); PE.box(0, 0.008, 0, 0.15, 0.006, 0.1, [1.25, 1.22, 1.15], TL.paper, 0.1); },
  // une lettre mauve qui sent la violette
  violette(PE) { PE.box(0, 0.004, 0, 0.18, 0.006, 0.12, [0.95, 0.75, 1.05], TL.paper, 0.2); },
  // un pli cacheté de rouge
  pli(PE) { PE.box(0, 0.004, 0, 0.2, 0.006, 0.13, [1.1, 1.0, 0.82], TL.paper, -0.1); PE.box(0.02, 0.009, 0, 0.035, 0.006, 0.035, [0.8, 0.12, 0.1], TL.plain); },
  // des plumes taillées, et l'encrier
  plumes(PE) { PE.box(0, 0.03, 0, 0.05, 0.06, 0.05, [0.12, 0.12, 0.16], TL.glass); for (let k = 0; k < 3; k++) PE.box(0.06 + k * 0.03, 0.08, -0.02, 0.012, 0.2, 0.03, [1.25, 1.22, 1.15], TL.paper, 0.1 * k, 0.25, 0.2); },
  // un filet déchiré, étalé
  filet(PE) { for (let i = -3; i <= 3; i++) { PE.box(i * 0.14, 0.01, 0, 0.012, 0.012, 0.9, [0.62, 0.56, 0.42], TL.rope); PE.box(0, 0.01, i * 0.14, 0.9 - (i === 1 ? 0.5 : 0), 0.012, 0.012, [0.62, 0.56, 0.42], TL.rope); } },
  // une pierre levée, petite (là où l'on s'assoit pas)
  sacavoine(PE) { PE.box(0, 0.22, 0, 0.45, 0.44, 0.32, [0.86, 0.76, 0.56], TL.sack); PE.box(0, 0.47, 0, 0.18, 0.08, 0.14, [0.8, 0.7, 0.5], TL.sack); },
  // un chou, un beau
  chou(PE) { PE.box(0, 0.09, 0, 0.18, 0.17, 0.18, [0.75, 1.05, 0.6], TL.cabbage); PE.box(0, 0.1, 0, 0.22, 0.1, 0.12, [0.65, 0.95, 0.5], TL.cabbage, 0.6); },
  // des graines dans un cornet
  graines(PE) { PE.box(0, 0.06, 0, 0.08, 0.12, 0.08, [0.95, 0.85, 0.6], TL.paper); PE.box(0, 0.125, 0, 0.06, 0.012, 0.06, [0.95, 0.85, 0.55], TL.plain); },
  // un fromage
  fromage(PE) { PE.box(0, 0.05, 0, 0.2, 0.1, 0.2, [1.2, 1.05, 0.62], TL.plain); PE.box(0.06, 0.07, 0.06, 0.09, 0.08, 0.09, [1.25, 1.1, 0.7], TL.plain, 0.4); },
  // un poisson grillé, un poisson-lune
  poisson(PE) { PE.box(0, 0.03, 0, 0.08, 0.05, 0.3, [0.85, 0.6, 0.35], TL.scales); PE.box(0, 0.03, -0.17, 0.02, 0.06, 0.06, [0.7, 0.5, 0.3], TL.scales); },
  lune(PE) { PE.box(0, 0.06, 0, 0.06, 0.16, 0.24, [1.25, 1.25, 1.35], TL.scales); PE.box(0, 0.06, -0.14, 0.02, 0.1, 0.06, [1.1, 1.1, 1.25], TL.scales); },
  // un bol d'œufs, une confiture, un verre
  oeufs(PE) { PE.box(0, 0.05, 0, 0.3, 0.1, 0.22, [0.85, 0.65, 0.4], TL.straw); for (let k = 0; k < 6; k++) PE.box(-0.1 + (k % 3) * 0.1, 0.12, -0.05 + Math.floor(k / 3) * 0.1, 0.055, 0.07, 0.05, [1.3, 1.22, 1.08], TL.plain); },
  verre(PE) { PE.box(0, 0.05, 0, 0.06, 0.1, 0.06, [0.6, 0.15, 0.2], TL.glass); },
  // une ardoise au mur, des bâtons à la craie
  ardoise(PE) { PE.box(0, 0, 0, 0.5, 0.36, 0.03, [0.55, 0.38, 0.22], TL.wood); PE.box(0, 0, 0.018, 0.44, 0.3, 0.005, [0.16, 0.17, 0.18], TL.stone); for (let k = 0; k < 9; k++) PE.box(-0.18 + k * 0.035, 0.07, 0.022, 0.008, 0.08, 0.004, [1.3, 1.3, 1.25], TL.plain); for (let k = 0; k < 5; k++) PE.box(-0.18 + k * 0.035, -0.06, 0.022, 0.008, 0.08, 0.004, [1.3, 1.3, 1.25], TL.plain); },
  // des fleurs dans une jardinière (posées sur celles de la mairie)
  fleurs(PE) { const C = [[1.45, 0.42, 0.4], [1.45, 1.25, 0.5], [1.35, 1.3, 1.25], [1.0, 0.55, 1.25]]; for (let k = 0; k < 7; k++) { PE.box(-0.6 + k * 0.2, 0.2, 0, 0.16, 0.2, 0.18, C[k % 4], TL.flowers); PE.box(-0.6 + k * 0.2, 0.08, 0, 0.12, 0.14, 0.14, [0.45, 0.8, 0.35], TL.leaves); } },
  // une tache de farine, et la lanterne posée
  farine(PE) { const P = [[0.08, 0.05, 0.16, 0.12], [-0.12, 0.1, 0.1, 0.08], [0.02, -0.14, 0.12, 0.09], [0.2, -0.06, 0.07, 0.06], [-0.2, -0.1, 0.08, 0.05]]; for (const [x, z, a, b] of P) PE.box(x, 0.003, z, a, 0.004, b, [1.25, 1.22, 1.15], TL.plain, x * 3); },
  // un pas de pied nu, mouillé
  pas(PE) { const c = [0.16, 0.15, 0.14]; PE.box(0, 0.003, 0, 0.09, 0.005, 0.17, c, TL.soilWet); for (let k = 0; k < 5; k++) PE.box(-0.035 + k * 0.018, 0.003, 0.105, 0.016, 0.005, 0.022, c, TL.soilWet); },
  // une chose qui n'est qu'une lueur (une fenêtre allumée)
  fenetre(PE) { PE.fl = FX_EMIT; PE.box(0, 0, 0, 0.7, 0.9, 0.04, [1.5, 1.05, 0.55], TL.plain); PE.fl = 0; PE.box(0, 0, 0.025, 0.05, 0.9, 0.02, [0.12, 0.1, 0.08], TL.darkwood); PE.box(0, 0, 0.025, 0.7, 0.05, 0.02, [0.12, 0.1, 0.08], TL.darkwood); },
};

// ---------------------------------------------------------------- les outils de ces scènes-ci
const Q20H = {
  // un meuble d'une maison (le plus proche de pres, s'il y en a plusieurs) : { P, r } ou null
  meuble(c, cle, id, pres) {
    let L = [];
    try { L = qtPropsDans(c.w, cle, (q, lx, lz, h) => q.id === id && h < 1.4); } catch (e) { L = []; }
    if (!L.length) return null;
    if (pres) L.sort((a, b) => Math.hypot(a.x - pres[0], a.z - pres[2]) - Math.hypot(b.x - pres[0], b.z - pres[2]));
    const q = L[0];
    return { P: [q.x, q.y, q.z], r: q.r || 0, q };
  },
  // un objet posé dehors (id), le plus proche de P, à moins de R mètres
  pres(c, P, id, R) {
    if (!P) return null;
    const L = qtProps(c.w, P[0], P[2], R || 20, (q) => q.id === id).sort((a, b) => Math.hypot(a.x - P[0], a.z - P[2]) - Math.hypot(b.x - P[0], b.z - P[2]));
    return L[0] ? { P: [L[0].x, L[0].y, L[0].z], r: L[0].r || 0, q: L[0] } : null;
  },
  // l'habitant à son poste, dedans : o.ou ('poste', 'comptoir', 'assis', 'lit'), o.vise (un point à regarder ; sinon la porte)
  poste(c, qui, o) {
    o = o || {};
    const M = c.maison(qui);
    if (!M) return null;
    const P = (o.ou && M[o.ou]) || M.poste || M.centre;
    const cap = o.vise ? c.cap(P, o.vise) : o.cap !== undefined ? o.cap : M.cap;
    const A = c.habitant(qui, o.decale ? c.devant(P, cap, o.decale[0], o.decale[1], true) : P, Object.assign({}, o, { cap, vise: undefined, ou: undefined }));
    return A;
  },
  // l'habitant sur le pas de sa porte (dehors) : o.d (plus loin), o.lat (de côté), o.cap / o.vise (sinon : vers la rue)
  seuil(c, qui, o, cle) {
    o = o || {};
    const M = c.maison(cle || qui);
    if (!M) return null;
    const P = M.dehors(o.d ?? 0.5, o.lat || 0);
    const cap = o.vise ? c.cap(P, o.vise) : o.cap !== undefined ? o.cap : M.cap;
    return c.habitant(qui, P, Object.assign({}, o, { cap, vise: undefined }));
  },
  // le joueur en face d'un acteur (d mètres devant lui, lat de côté), qui le regarde
  face(c, A, d, lat, o) {
    if (!A) return null;
    const P = c.devant(A.P, A.cap, d || 1.4, lat || 0.2, true);
    // (au plancher, au sol ; sur un ponton, à la hauteur de celui qu'on regarde)
    P[1] = c.sol(P[0], P[2], A.P[1]);
    if (P[1] < A.P[1] - 0.5) P[1] = A.P[1];
    return c.joueur(P, Object.assign({ face: A.P }, o));
  },
  // un point de sol libre près de P (pour poser une chose, un acteur), sur des anneaux ; sinon P
  libre(c, P, r0, r1, rad) {
    if (!P) return null;
    try { for (const [x, z] of qtAnneaux(P[0], P[2], r0 || 0, r1 || 6, 0, 12)) if (qtSol(c.w, x, z, rad || 0.6, { buissons: true })) return c.pt(x, z); } catch (e) { /* rien */ }
    return P;
  },
  // un émetteur de particules pour plan.chaque : o = { n (par seconde), col, taille, vie, grav, v (vitesse), dy, eclat }
  emet(P, o) {
    o = o || {};
    return (t, dt) => {
      if (!P || typeof particles === 'undefined') return;
      const k = (dt || 0.02) * (o.n || 8);
      for (let i = 0; i < 4 && Math.random() < k - i; i++) {
        const v = o.v || 0.3, r = o.r || 0.05;
        particles.spawn(P[0] + (Math.random() - 0.5) * r, P[1] + (o.dy || 0), P[2] + (Math.random() - 0.5) * r, (Math.random() - 0.5) * v, (o.vy ?? 0.4) + Math.random() * v * 0.5, (Math.random() - 0.5) * v, o.col || [0.9, 0.9, 0.9, 0.8], o.taille || 0.04, o.vie || 1.6, o.grav ?? 0, !!o.eclat);
      }
    };
  },
  // au bord d'un puits, le regard au fond : une caméra sur la margelle (libre, hors de la pierre), qui plonge
  puits(c, Pu, o) {
    o = o || {};
    if (!Pu) return null;
    const w = c.w, C = Array.isArray(Pu) ? Pu : Pu.P, L = c.blocs(C, 10), T = c.haut(C, o.fond ?? -2.2);
    for (const r of o.r || [1.15, 1.5, 0.85, 1.9]) for (let k = 0; k < 16; k++) {
      const a = (o.a || 0) + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * TAU / 16, x = C[0] + Math.sin(a) * r, z = C[2] + Math.cos(a) * r;
      const P = [x, c.sol(x, z) + (o.haut ?? 1.75), z];
      try { if (qtDansBloc(L, P, 0.25) || !w.inside(x, z, 6)) continue; } catch (e) { continue; }
      let toit = false;
      try { toit = qtSousToit(w, L, P); } catch (e) { toit = false; }
      const P2 = [lerp(P[0], C[0], 0.25), P[1] - 0.15, lerp(P[2], C[2], 0.25)];
      return { de: { pos: P, look: T }, a: { pos: qtDansBloc(L, P2, 0.2) ? P : P2, look: T }, dedans: null, vise: [], toit };
    }
    c.repli++;
    return { de: { pos: c.haut(C, 2.4), look: T }, a: { pos: c.haut(C, 2.4), look: T }, dedans: null, vise: [], repli: true };
  },
  // le joueur là où il est (s'il est près du lieu), sinon un endroit du lieu (une scène revue depuis les Souvenirs)
  ici(c, L, d, a) {
    const p = game.player;
    if (!c.rejeu && p && L && Math.hypot(p.pos[0] - L.x, p.pos[2] - L.z) < Math.max(40, (L.r || 10) * 1.6)) return c.pt(p.pos[0], p.pos[2]);
    return L ? Q20H.libre(c, c.devant(L.P, a || 0.4, d || 13), 0, 6, 0.6) : null;
  },
  // le lieu d'une quête, et l'heure à laquelle on doit y être (la nuit, l'aube) ou celle d'aujourd'hui
  lieuQuete(c) { return c.q && c.q.lieu ? c.lieu(c.q.lieu) : null; },
  heureQuete(c) { return c.q && c.q.moment ? c.heure(c.q.moment) : c.h; },
  // la trouvaille : la chose posée là où elle était, le joueur penché dessus ; un plan rapproché, puis le lieu (o.d2,
  // o.haut2, o.dy2 : le lieu de plus loin, de plus haut — par-dessus les arbres)
  trouvaille(c, dessin, o) {
    o = o || {};
    const P = c.cachette();
    if (!P) return [];
    const ch = c.chose(dessin, P, { s: o.s || 1.7, r: o.r || 0.6, lueur: true });
    const L = Q20H.lieuQuete(c);
    const a = L ? Math.atan2(P[0] - L.x, P[2] - L.z) : 0.6;
    // (la nuit, la lanterne qu'on tient : une lueur chaude sur la chose)
    const lum = (o.lum || []).concat(c.nuit() || c.h >= 18.4 ? [c.lueur(c.devant(P, a, 0.6), 3.6, [1.0, 0.72, 0.4], 0.9)] : []);
    // (de près, en plongée : l'herbe haute ne la cache pas)
    const plans = [c.plan({ dur: o.dur || 5.6, cam: c.camChose(P, { a: a + 0.9, d: 1.45, haut: 1.55 }), acteurs: [ch], dit: o.dit, son: o.son, chaque: o.chaque, lum })];
    if (L && o.lieu !== false) plans.push(c.plan({ dur: o.dur2 || 5, cam: c.camLieu(L, { a: a + Math.PI * 0.8, d: o.d2, dy: o.dy2, haut: o.haut2 }), acteurs: [c.joueur(P, { face: L.P, geste: 'baisse', vu: false })], dit: o.dit2, son: o.son2 }));
    return plans;
  },
};

// ============================================================================ LE MAIRE (Vasseur ; la mairie, sur la place)
q20.scenes('maire_1', {
  qui: 'maire',
  demande(c) {
    const M = c.maison('maire'), bac = Q20H.pres(c, M.porte, 'bac_fleurs', 8);
    const moi = Q20H.seuil(c, 'maire', { d: 0.9, vise: bac ? bac.P : undefined, geste: ['montre', 'parle'] });
    const P = c.lieu('place');
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 1.0, d: 4.2, avec: bac ? bac.P : undefined, k: 0.35 }), acteurs: [moi], dit: ['Regardez-moi ces jardinières. La place a une mine de jour de deuil.'], court: true }),
      c.plan({ dur: 5.8, cam: c.camLieu(P, { d: 26, haut: 7, a: M.cap + 0.5, recul: 0.18 }), acteurs: [c.habitant('maire', c.devant(P.P, M.cap + Math.PI, 2, 0), { cap: M.cap + Math.PI, geste: 'bras' })], dit: ['Douze fleurs. Si le préfet passe, qu’il voie une commune vivante.'] }),
    ];
  },
  fin(c) {
    const M = c.maison('maire'), bacs = qtProps(c.w, M.porte[0], M.porte[2], 8, (q) => q.id === 'bac_fleurs' && q.y < M.sol + 1.5);
    const fl = bacs.map((b) => c.chose(Q20_DESSINS.fleurs, [b.x, b.y + 0.12, b.z], { r: (b.r || 0) + Math.PI / 2 }));
    const moi = Q20H.seuil(c, 'maire', { d: 2.2, cap: M.cap + Math.PI, geste: ['bras', 'leve'] });
    const P = c.lieu('place'), pb = Q20H.libre(c, c.devant(P.P, M.cap + Math.PI, 5, 4), 0, 5, 1.2);
    const banc = c.chose('banc', pb, { r: c.cap(pb, M.porte) });
    const assis = c.habitant('maire', c.devant(pb, c.cap(pb, M.porte), 0.05), { cap: c.cap(pb, M.porte), geste: ['assis', 'parle'] });
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 2.6, d: 4.4, buste: true, avec: M.porte, k: 0.4, monte: 0.4 }), acteurs: [moi, ...fl], dit: ['Splendide. La place respire enfin.'], court: true }),
      c.plan({ dur: 6.4, cam: c.camActeur(assis, { cote: 0.9, d: 3.8 }), acteurs: [banc, assis, ...fl, Q20H.face(c, assis, 1.9, -1.1)], dit: ['Un banc ici, pour le préfet. En attendant, je m’y assieds.'], son: 'piece' }),
    ];
  },
});

q20.scenes('maire_2', {
  qui: 'maire',
  demande(c) {
    const moi = Q20H.poste(c, 'maire', { geste: ['assis', 'penche', 'parle'] });
    const pont = c.lieu('pont_nord'), porte = c.lieu('garde');
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.3, d: 2.2 }), acteurs: [moi], dit: ['Le pont nord, abaissé, à minuit. Le garde jure l’avoir levé.'], court: true }),
      c.plan({ dur: 5.6, cam: c.camLieu(pont, { d: 18, haut: 3.5, a: Math.PI * 0.9, dy: 2.5 }), heure: 0.2, dit: ['Allez lui demander. Discrètement : à moi, il répond toujours « oui, monsieur le maire ».'] }),
    ];
  },
  tournant(c) {
    const w = c.w, G = (w.nav.nodes.find((q) => q.tag === 'pont_nord:porte')) || c.lieu('pont_nord');
    const P0 = c.pt(G.x + 1.6, G.z + 0.5);
    const moi = c.habitant('garde', P0, { cap: Math.PI * 0.95, geste: ['bras'], tient: true });
    const J = Q20H.face(c, moi, 1.6, 0.4);
    const loin = c.pt(G.x, G.z - 40);
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 1.3, d: 3.4, avec: J, k: 0.35 }), acteurs: [moi, J], dit: ['La manivelle ne quitte pas ma ceinture. Jamais.', '@garde'] }),
      c.plan({ dur: 6.2, cam: c.camRegard(P0, c.haut(loin, 1.5), { recul: 0.04 }), heure: Math.max(c.h, 19.5), acteurs: [], dit: ['Si le pont s’abaisse la nuit, c’est qu’on le descend d’en face.', '@garde'] }),
    ];
  },
  fin(c) {
    const Pu = c.lieu('puits_ville'), P0 = c.devant(Pu.P, 0, 2.2, 0.8);
    const moi = c.habitant('maire', P0, { cap: Math.PI, geste: ['bras', 'leve'] });
    const moi2 = c.habitant('maire', P0, { cap: c.cap(P0, Pu.P) + 2.4, geste: ['hoche', 'parle'] });
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.5, d: 3.6 }), acteurs: [moi], dit: ['D’en face… Il n’y a rien, en face, la nuit. Rien que les champs.'], court: true }),
      c.plan({ dur: 5.6, cam: c.camActeur(moi2, { cote: 0.2, d: 2.6 }), acteurs: [moi2, Q20H.face(c, moi2, 1.5, 0.3)], dit: ['N’ébruitons pas l’affaire. Merci.'], son: 'piece' }),
    ];
  },
});

q20.scenes('maire_3', {
  qui: 'maire',
  demande(c) {
    const moi = Q20H.poste(c, 'maire', { geste: ['assis', 'tend'] });
    const T = c.lieu('tour');
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: -0.4, d: 2.0 }), acteurs: [moi], dit: ['Le sceau de la commune. Égaré. Sans lui, aucun acte ne vaut rien.'], court: true }),
      c.plan({ dur: 6, cam: c.camLieu(T, { d: 40, haut: 4, dy: 8, monte: 2 }), dit: ['Ce que je faisais là-haut, de nuit ? Cela relève du secret administratif.'] }),
    ];
  },
  tournant(c) { return Q20H.trouvaille(c, Q20_DESSINS.bague, { s: 2.2, son: 'clochette', dy2: 6 }); },
  fin(c) {
    const moi = Q20H.seuil(c, 'maire', { d: 1.0, geste: ['eleve'] });
    const P = c.lieu('place'), ps = Q20H.libre(c, c.devant(P.P, Math.PI / 2, -3, -3), 0, 6, 1.0);
    const socle = c.chose((PE) => { PE.box(0, 0.4, 0, 1.0, 0.8, 1.0, [0.9, 0.88, 0.84], TL.stone); PE.box(0, 0.86, 0, 1.15, 0.12, 1.15, [0.85, 0.83, 0.8], TL.stone); }, ps);
    const st = c.gens('statue', c.haut(ps, 0.92), { cap: c.cap(ps, P.P) + 0.8, geste: ['montre', 'leve'], vu: false });
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.5, d: 2.4, buste: true }), acteurs: [moi], dit: ['Ma chevalière ! La commune existe de nouveau.'], court: true, son: 'piece' }),
      c.plan({ dur: 6.2, cam: c.camLieu(c.haut(ps, 1.6), { d: 7.5, haut: 1.4, a: c.cap(ps, P.P) + 0.6, recul: 0.1 }), acteurs: [socle, st], dit: ['Une statue, au milieu de la place. À ma gloire. Mettez-y qui vous voudrez.'] }),
    ];
  },
});

q20.scenes('maire_4', {
  qui: 'maire',
  delais: { tournant: 3 },
  demande(c) {
    const P = c.lieu('place'), Mo = c.lieu('moulin');
    const P0 = c.devant(P.P, c.cap(P.P, Mo.P), 4, 0);
    const moi = c.habitant('maire', P0, { cap: c.cap(P0, Mo.P), geste: ['bras', 'leve'] });
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.7, d: 3.4 }), acteurs: [moi], dit: ['On dit que le vieux moulin tourne certaines nuits. Ailes enchaînées. Sans un souffle.'], court: true }),
      c.plan({ dur: 6.2, cam: c.camLieu(Mo, { d: 32, haut: 3, dy: 9, recul: 0.1 }), heure: c.heure('nuit'), dit: ['Dites-moi que ce sont des sornettes. J’ai besoin qu’on me le dise.'] }),
    ];
  },
  tournant(c) {
    const Mo = c.lieu('moulin'), ici = Q20H.ici(c, Mo, 13, 0.4);
    if (!ici) return null;
    const J = c.joueur(ici, { face: Mo.P, tient: 'lanterne' });
    const pied = c.haut(ici, 0.05);
    return [
      c.plan({ dur: 6.4, cam: c.camLieu(Mo, { d: 18, haut: 1.2, dy: 10, a: c.cap(Mo.P, ici), monte: 3 }), acteurs: [J], heure: c.h }),
      c.plan({ dur: 5.2, cam: c.camChose(pied, { d: 1.4, haut: 0.7, a: c.cap(ici, Mo.P) + 2.2 }), acteurs: [J, c.chose(Q20_DESSINS.farine, c.haut(ici, 0.01))], chaque: Q20H.emet(c.haut(ici, 0.1), { n: 10, col: [0.95, 0.93, 0.88, 0.9], taille: 0.035, vie: 2.4, v: 0.25, vy: 0.15, r: 0.5 }) }),
    ];
  },
  fin(c) {
    const moi = Q20H.poste(c, 'maire', { geste: ['assis', 'leve'] });
    const P = c.lieu('place'), L = qtProps(c.w, P.x, P.z, 14, (q) => q.id === 'lampadaire').slice(0, 4).map((q) => c.lueur([q.x, q.y, q.z], 9, [1.0, 0.8, 0.5], 3.4));
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.2, d: 2.2 }), acteurs: [moi], dit: ['Rien, dites-vous ? Alors d’où vient cette farine sur vos souliers ?'], court: true }),
      c.plan({ dur: 6, cam: c.camLieu(P, { d: 20, haut: 5, recul: 0.12 }), heure: 22.5, lum: L, dit: ['Prenez ces plans de réverbères. Je veux de la lumière. Partout.'] }),
    ];
  },
});

// ============================================================================ LA BOULANGÈRE (la boulangerie)
q20.scenes('boulangere_1', {
  qui: 'boulangere',
  demande(c) {
    const moi = Q20H.poste(c, 'boulangere', { geste: ['travaille', 'parle'] });
    const F = c.w.farm && c.w.farm.field, champ = F ? c.pt((F.x0 + F.x1) / 2, (F.z0 + F.z1) / 2) : c.lieu('ferme').P;
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.25, d: 2.4, buste: true }), acteurs: [moi], dit: ['Le meunier du bourg voisin me vend sa farine à prix d’or. Le brigand !'], court: true }),
      c.plan({ dur: 5.8, cam: c.camLieu(champ, { d: 22, haut: 4, dy: 0.6 }), dit: ['Dix gerbes de votre blé, et je vous garde du pain. Promis.'] }),
    ];
  },
  fin(c) {
    const M = c.maison('boulangere'), four = Q20H.meuble(c, 'boulangerie', 'four');
    const moi = Q20H.poste(c, 'boulangere', { geste: ['offre', 'parle'] });
    const J = Q20H.face(c, moi, 1.5, 0.2);
    const pain = c.chose('pain_etal', c.devant(moi.P, moi.cap, 0.45, 0, true), { r: moi.cap });
    const lum = four ? [c.lueur(four.P, 4.5, [1.0, 0.55, 0.25], 0.6)] : [];
    const fille = c.habitant('fillette', c.devant(moi.P, moi.cap, -0.6, 1.0, true), { cap: moi.cap + 0.6, geste: 'leve' });
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 1.3, d: 2.6, avec: J, k: 0.35 }), acteurs: [moi, J], lum, dit: ['Regardez-moi ce grain, bien doré ! Il y a des années qu’on n’en a pas vu.'], court: true }),
      c.plan({ dur: 5.8, cam: c.camActeur(moi, { cote: -0.5, d: 2.2, buste: true }), acteurs: [moi, fille, pain], lum, dit: ['Deux pains tout chauds. Revenez quand vous voulez, mon chou.'], son: 'piece' }),
    ];
  },
});

q20.scenes('boulangere_2', {
  qui: 'boulangere',
  demande(c) {
    const moi = Q20H.seuil(c, 'boulangere', { d: 0.8, main: 'panier', geste: ['porte', 'baisse'] });
    const H = c.lieu('hutte_ermite');
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.6, d: 3.0 }), acteurs: [moi], dit: ['Chaque semaine, je fais porter du pain à la dame des bois. Avant, c’était Émile qui…'], court: true }),
      c.plan({ dur: 6, cam: c.camLieu(H, { d: 24, haut: 3.5, dy: 1.5 }), dit: ['Suivez le sentier. Ne le quittez pas. Et ne mangez pas la brioche en route !'] }),
    ];
  },
  tournant(c) {
    const moi = Q20H.seuil(c, 'guerisseuse', { d: 0.8, main: 'panier', geste: ['porte', 'leve'] });
    const J = Q20H.face(c, moi, 1.5, 0.3);
    const bois = moi && c.devant(moi.P, moi.cap + 2.0, 20, 0);
    const moi2 = moi && c.habitant('guerisseuse', moi.P, { cap: c.cap(moi.P, bois), main: 'panier', geste: ['porte', 'parle'] });
    return [
      c.plan({ dur: 5.6, cam: c.camActeur(moi, { cote: 1.3, d: 3.2, avec: J, k: 0.35 }), acteurs: [moi, J], dit: ['Le pain de la boulangère, encore tiède. Elle n’oublie jamais.', '@guerisseuse'] }),
      c.plan({ dur: 6.2, cam: c.camActeur(moi2, { cote: 0.4, d: 2.6 }), acteurs: [moi2, J], dit: ['Dites-lui qu’il n’a pas froid, là où il est. Elle saura de qui je parle.', '@guerisseuse'] }),
    ];
  },
  fin(c) {
    const four = Q20H.meuble(c, 'boulangerie', 'four');
    const moi = Q20H.poste(c, 'boulangere', { geste: ['coeur', 'baisse'] });
    const moi2 = four ? c.habitant('boulangere', c.devant(four.P, c.cap(four.P, moi.P), 1.0, 0, true), { cap: c.cap(moi.P, four.P), geste: ['baisse'] }) : moi;
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.3, d: 2.0 }), acteurs: [moi], dit: ['Elle a dit ça ? Qu’il n’a pas froid ?'], court: true }),
      c.plan({ dur: 5.6, cam: c.camActeur(moi2, { cote: 2.6, d: 2.6 }), acteurs: [moi2], lum: four ? [c.lueur(four.P, 4.5, [1.0, 0.55, 0.25], 0.6)] : [], dit: ['Tenez, deux brioches. Laissez-moi un moment, voulez-vous.'] }),
    ];
  },
});

q20.scenes('boulangere_3', {
  qui: 'boulangere',
  demande(c) {
    const moi = Q20H.poste(c, 'boulangere', { geste: ['raide'], cap: c.maison('boulangere').cap + 0.9 });
    const R = c.lieu('ruines'), pierre = Q20H.libre(c, c.devant(R.P, 1.2, 3), 0, 6, 0.6);
    const pe = c.devant(pierre, 2.2, 1.3);
    const emile = c.gens('emile', pe, { cap: c.cap(pe, pierre), geste: ['baisse', 'offre'], lanterne: true, vu: false });
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.9, d: 2.2 }), acteurs: [moi], dit: ['Cette nuit, j’ai rêvé d’Émile.'], court: true }),
      c.plan({ dur: 6.4, cam: c.camLieu(c.vers(pierre, pe, 0.5), { d: 8, haut: 1.8, dy: 0.9, a: c.cap(pe, pierre) + 1.3, recul: 0.18 }), heure: 5.8, acteurs: [emile, c.chose(Q20_DESSINS.pierre_bague, pierre, { s: 1.6 })], lum: [c.lueur(pe, 4.5, [1.0, 0.72, 0.4], 1.1)], dit: ['Il me montrait son alliance, posée sur une pierre, dans les ruines. Ce n’est qu’un rêve, je le sais bien.'] }),
    ];
  },
  tournant(c) { return Q20H.trouvaille(c, Q20_DESSINS.pierre_bague, { s: 1.4, son: 'murmure' }); },
  fin(c) {
    const moi = Q20H.poste(c, 'boulangere', { geste: ['eleve'] });
    const tb = Q20H.libre(c, c.maison('boulangere').dehors(3, -2.5), 0, 4, 0.9);
    const table = c.chose('table', tb, { r: c.maison('boulangere').cap });
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.2, d: 1.9 }), acteurs: [moi], dit: ['C’est elle. Nos initiales, gravées dedans. Et elle est tiède…'], court: true }),
      c.plan({ dur: 5.6, cam: c.camChose(tb, { d: 3.2, haut: 1.6, dy: 0.5, a: c.maison('boulangere').cap + 0.6 }), acteurs: [table, Q20H.seuil(c, 'boulangere', { d: 1.4, lat: -1.6, vise: tb, geste: 'bras' })], dit: ['Les plans de sa table. Il aurait voulu. Pas un mot à la petite.'] }),
    ];
  },
});

// ============================================================================ LE FORGERON (Marchal ; la forge)
q20.scenes('forgeron_1', {
  qui: 'forgeron',
  demande(c) {
    const en = Q20H.meuble(c, 'forge', 'enclume'), four = Q20H.meuble(c, 'forge', 'four');
    const moi = Q20H.poste(c, 'forgeron', { vise: en && en.P, geste: 'travaille', tient: true });
    const lum = four ? [c.lueur(four.P, 5, [1.05, 0.5, 0.2], 0.7)] : [];
    const etin = en ? Q20H.emet(c.haut(en.P, 0.85), { n: 14, col: [1.6, 0.9, 0.35, 1], taille: 0.025, vie: 0.6, v: 1.6, vy: 0.9, grav: 4, eclat: true }) : null;
    const Mi = c.lieu('mine');
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.9, d: 2.6, avec: en ? c.haut(en.P, 0.8) : undefined, k: 0.35 }), acteurs: [moi], lum, son: 'enclume', chaque: etin, dit: ['Des clous pour le toit de l’église. Pas assez de fer.'], court: true }),
      c.plan({ dur: 6, cam: c.camLieu(Mi, { d: 22, haut: 3, dy: 1.5 }), dit: ['Huit minerais, cinq charbons. Le fer, c’est à la mine. Prenez une lanterne.'] }),
    ];
  },
  fin(c) {
    const en = Q20H.meuble(c, 'forge', 'enclume'), four = Q20H.meuble(c, 'forge', 'four');
    const moi = Q20H.poste(c, 'forgeron', { vise: en && en.P, geste: 'travaille', tient: true });
    const lum = four ? [c.lueur(four.P, 5, [1.05, 0.5, 0.2], 0.7)] : [];
    const M = c.maison('forgeron'), pg = Q20H.libre(c, M.dehors(2.5, 3), 0, 4, 0.6);
    const gir = c.chose('girouette', pg, { r: 0, tourne: -0.5 });
    return [
      c.plan({ dur: 5.6, cam: c.camActeur(moi, { cote: 1.1, d: 2.2 }), acteurs: [moi], lum, son: 'enclume', chaque: en ? Q20H.emet(c.haut(en.P, 0.85), { n: 12, col: [1.6, 0.9, 0.35, 1], taille: 0.025, vie: 0.6, v: 1.6, vy: 0.9, grav: 4, eclat: true }) : null, dit: ['Bon minerai. Merci.'], court: true }),
      c.plan({ dur: 6.4, cam: c.camChose(pg, { d: 3.4, haut: 1.0, dy: 1.6, monte: 0.6 }), acteurs: [gir], dit: ['Les plans d’une girouette. Mon père l’a dessinée. Elle tourne toujours contre le vent. On ne sait pas pourquoi.'] }),
    ];
  },
});

q20.scenes('forgeron_2', {
  qui: 'forgeron',
  demande(c) {
    const Mi = c.lieu('mine'), M = c.maison('forgeron');
    const moi = Q20H.seuil(c, 'forgeron', { d: 0.6, vise: Mi.P, geste: ['bras'] });
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.5, d: 3.0 }), acteurs: [moi], dit: ['Mon père portait un fer à cheval sur lui. Le jour de l’éboulement, il l’a accroché à l’entrée de la mine.'], court: true }),
      c.plan({ dur: 5.8, cam: c.camLieu(Mi, { d: 18, haut: 2.5, dy: 1.5, recul: 0.2 }), dit: ['N’allez pas au fond. Juste l’entrée. Promettez.'] }),
    ];
  },
  tournant(c) { return Q20H.trouvaille(c, Q20_DESSINS.fer, { s: 1.5, son: 'grondement' }); },
  fin(c) {
    const en = Q20H.meuble(c, 'forge', 'enclume');
    const moi = Q20H.poste(c, 'forgeron', { vise: en && en.P, geste: ['tend'] });
    // (le fer contre le mur, au-dessus de la porte : le mur cherché à cette hauteur, au-dessus de l'ouverture)
    const M = c.maison('forgeron'), O = [M.B.out[0] + M.f[0] * 2, M.sol + 2.35, M.B.out[1] + M.f[1] * 2];
    let mur = 1.5;
    try { const R = qtRayon(c.w, qtBlocs(c.w, M.B.out[0], M.B.out[1], 8), O, [-M.f[0], 0, -M.f[1]], 6); if (R && R.t > 2) mur = R.t - 2; } catch (e) { /* le mur des maisons du bourg */ }
    const hp = [M.B.out[0] - M.f[0] * (mur - 0.1), M.sol + 2.35, M.B.out[1] - M.f[1] * (mur - 0.1)];
    const fer = c.chose(Q20_DESSINS.fer_porte, hp, { r: M.cap, s: 2.4, lueur: true });
    const moi2 = Q20H.seuil(c, 'forgeron', { d: 1.6, lat: 1.3, cap: M.cap + Math.PI, geste: ['leve'] });
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.9, d: 2.0, buste: true }), acteurs: [moi], dit: ['C’est le sien. Mais les clous sont neufs.'], court: true }),
      c.plan({ dur: 6, cam: c.camChose(hp, { d: 4.2, haut: 1.4, dy: -0.6, a: M.cap + 0.4 }), acteurs: [fer, moi2], dit: ['Quelqu’un l’a raccroché. Récemment… Tenez. Les plans d’une brouette.'] }),
    ];
  },
});

q20.scenes('forgeron_3', {
  qui: 'forgeron',
  demande(c) {
    const Mb = c.maison('boulangere');
    const moi = Q20H.seuil(c, 'forgeron', { d: 0.7, vise: Mb.porte, geste: ['bras'] });
    const elle = Q20H.seuil(c, 'boulangere', { d: 0.6, geste: ['travaille'] });
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.7, d: 2.6 }), acteurs: [moi, elle], dit: ['Je veux forger une bague. Pour qui ? Ça ne vous regarde pas.'], court: true }),
      c.plan({ dur: 5.8, cam: c.camActeur(elle, { cote: 0.9, d: 9, haut: 2 }), acteurs: [elle, moi && Object.assign({}, moi, { vu: false })], dit: ['Et pas un mot. À personne. Surtout pas à la boulangerie.'] }),
    ];
  },
  fin(c) {
    const en = Q20H.meuble(c, 'forge', 'enclume'), four = Q20H.meuble(c, 'forge', 'four');
    const moi = Q20H.poste(c, 'forgeron', { vise: four ? four.P : en && en.P, geste: ['tend'] });
    const Mb = c.maison('boulangere');
    const lum = four ? [c.lueur(four.P, 4.5, [1.0, 0.45, 0.18], 0.6)] : [];
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.8, d: 1.9, buste: true }), acteurs: [moi], heure: Math.max(c.h, 20.5), lum, dit: ['Belle pierre. Elle ira bien avec… peu importe.'], court: true }),
      c.plan({ dur: 5.8, cam: c.camLieu(Mb.porte, { d: 9, haut: 1.8, dy: 1.6, a: Mb.cap + 0.7 }), heure: 21.5, lum: [c.lueur(c.devant(Mb.porte, Mb.cap + Math.PI, 1.2), 4, [1.0, 0.7, 0.35], 1.4)], dit: ['Les plans de la hache de mon père. Et si elle dit non, vous n’avez rien vu.'] }),
    ];
  },
});

// ============================================================================ LA GRAINETIÈRE (la graineterie)
q20.scenes('grainetiere_1', {
  qui: 'grainetiere',
  demande(c) {
    const moi = Q20H.poste(c, 'grainetiere', { geste: ['bras'] });
    const F = c.lieu('ferme');
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.4, d: 2.3 }), acteurs: [moi], dit: ['Personne n’a rien récolté à la vieille ferme depuis qu’Anselme est parti.'], court: true }),
      c.plan({ dur: 5.8, cam: c.camLieu(F, { d: 30, haut: 5, dy: 2 }), dit: ['Montrez-moi que la terre est encore bonne. Une terre qu’on délaisse, ça devient méchant.'] }),
    ];
  },
  fin(c) {
    const moi = Q20H.poste(c, 'grainetiere', { geste: ['tend'] });
    const chou = c.chose(Q20_DESSINS.chou, c.haut(c.devant(moi.P, moi.cap, 0.42, 0.12, true), 1.05), { s: 1.2 });
    const ep = Q20H.pres(c, c.lieu('ferme').P, 'epouvantail', 40);
    const F = c.lieu('ferme');
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.4, d: 2.1, buste: true }), acteurs: [moi, chou], dit: ['Belle récolte ! La terre de la vieille ferme vous fait confiance, on dirait.'], court: true }),
      c.plan({ dur: 6, cam: ep ? c.camChose(ep.P, { d: 6, haut: 1.5, dy: 1.3, a: (ep.r || 0) + 0.3 }) : c.camLieu(F), dit: ['Les plans d’un épouvantail. Face au chemin, rappelez-vous. Face au chemin.'] }),
    ];
  },
});

q20.scenes('grainetiere_2', {
  qui: 'grainetiere',
  demande(c) {
    const moi = Q20H.seuil(c, 'grainetiere', { d: 0.8, geste: ['penche'] });
    const sac = moi && c.chose(Q20_DESSINS.sacavoine, c.devant(moi.P, moi.cap + 1.4, 0.6), { r: 0.3 });
    const Ha = c.lieu('hameau');
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.8, d: 3.0 }), acteurs: [moi, sac], dit: ['Un sac d’avoine pour le ranch. Et mon dos refuse d’aller jusqu’au {hameau}.'], court: true }),
      c.plan({ dur: 6, cam: c.camLieu(Ha, { d: 34, haut: 6, dy: 2 }), dit: ['C’est lourd, ménagez vos reins. Et ne vous arrêtez pas en route. Surtout pas.'] }),
    ];
  },
  tournant(c) {
    const R = c.w.ranch, pen = R ? c.pt(R.pen.x, R.pen.z) : null;
    const moi = Q20H.seuil(c, 'eleveuse', { d: 1.2, geste: ['bras', 'parle'] });
    const sac = moi && c.chose(Q20_DESSINS.sacavoine, c.devant(moi.P, moi.cap - 1.2, 0.7));
    const ch = pen && c.bete('horse', c.devant(pen, 0.4, 2), { v: 1, cap: 2.2, geste: { graze: 1 } });
    const J = Q20H.face(c, moi, 1.6, 0.3);
    return [
      c.plan({ dur: 5.8, cam: c.camActeur(moi, { cote: 1.3, d: 3.4, avec: J, k: 0.35 }), acteurs: [moi, sac, ch, J], dit: ['L’avoine ! Enfin. Les chevaux allaient venir la chercher eux-mêmes.', '@eleveuse'] }),
      c.plan({ dur: 5.8, cam: c.camActeur(moi, { cote: 0.2, d: 2.2 }), acteurs: [moi, sac, ch], dit: ['Dites-lui de la mettre sur mon ardoise. Elle va râler. Comme d’habitude.', '@eleveuse'] }),
    ];
  },
  fin(c) {
    const moi = Q20H.poste(c, 'grainetiere', { geste: ['travaille', 'baisse'] });
    const moi2 = Q20H.poste(c, 'grainetiere', { geste: ['offre'] });
    const gr = moi2 && c.chose(Q20_DESSINS.graines, c.haut(c.devant(moi2.P, moi2.cap, 0.42, 0.1, true), 1.0), { s: 1.3 });
    return [
      c.plan({ dur: 5.8, cam: c.camActeur(moi, { cote: -0.6, d: 2.2 }), acteurs: [moi], dit: ['Sur son ardoise, évidemment. Comme toujours.'], court: true }),
      c.plan({ dur: 5.6, cam: c.camActeur(moi2, { cote: 0.3, d: 2.2, buste: true }), acteurs: [moi2, gr, Q20H.face(c, moi2, 1.4, 0.2)], dit: ['Des graines de citrouille. Pour vos reins.'], son: 'piece' }),
    ];
  },
});

q20.scenes('grainetiere_3', {
  qui: 'grainetiere',
  delais: { tournant: 2.5 },
  demande(c) {
    const moi = Q20H.seuil(c, 'grainetiere', { d: 0.6, geste: ['raide'] });
    const F = c.lieu('ferme'), ep = Q20H.pres(c, F.P, 'epouvantail', 40);
    const B = c.w.bld.ferme;
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.3, d: 2.4 }), acteurs: [moi], dit: ['Le matin où Anselme a disparu, son épouvantail regardait la maison. Pas le chemin : la maison.'], court: true }),
      c.plan({ dur: 6, cam: ep ? c.camChose(ep.P, { d: 5, haut: 1.6, dy: 1.4, a: c.cap(ep.P, F.P) + 2.6 }) : c.camLieu(F), heure: c.heure('aube'), dit: ['Demain, à l’aube, faites le tour de votre ferme. Et regardez bien ce qui vous regarde.'] }),
    ];
  },
  tournant(c) {
    const F = c.lieu('ferme'), ep = Q20H.pres(c, F.P, 'epouvantail', 40), B = c.w.bld.ferme;
    const porte = B ? c.pt(B.out[0], B.out[1]) : F.P;
    const derr = ep ? c.devant(ep.P, c.cap(porte, ep.P), 1.6, 0.5) : null;
    return [
      c.plan({ dur: 6.4, cam: derr ? c.camRegard(derr, c.haut(porte, 1.4), { haut: 1.7, recul: 0.05 }) : c.camLieu(porte), son: 'coups' }),
      c.plan({ dur: 5.4, cam: c.camLieu(porte, { d: 9, haut: 1.6, dy: 1.3, a: B ? Math.atan2(B.out[0] - B.x, B.out[1] - B.z) + 0.3 : 0, recul: 0.25 }) }),
    ];
  },
  fin(c) {
    const moi = Q20H.poste(c, 'grainetiere', { geste: ['raide', 'baisse'] });
    const B = c.w.bld.ferme, F = c.lieu('ferme');
    const pp = B ? Q20H.libre(c, c.pt(B.out[0] + 4, B.out[1] - 3), 0, 6, 0.8) : F.P;
    return [
      c.plan({ dur: 6.6, cam: c.camActeur(moi, { cote: 0.3, d: 2.0 }), acteurs: [moi], dit: ['Tout était à sa place ? Même la porte de la cave ? Anselme l’avait murée, cette porte. De ses mains.'], court: true }),
      c.plan({ dur: 5.4, cam: c.camChose(pp, { d: 3.4, haut: 1.2, dy: 0.6 }), acteurs: [c.chose('sapling', pp)], dit: ['Les plans d’un pommier. Plantez. Ça rassure.'] }),
    ];
  },
});

// ============================================================================ L'AUBERGISTE (Bonnefoy ; l'auberge)
q20.scenes('aubergiste_1', {
  qui: 'aubergiste',
  demande(c) {
    const moi = Q20H.poste(c, 'aubergiste', { geste: ['travaille', 'parle'] });
    const t = Q20H.meuble(c, 'auberge', 'table', moi && moi.P);
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.3, d: 2.4 }), acteurs: [moi], dit: ['Dimanche, c’est ragoût ! Sauf que mon garde-manger crie famine.'], court: true }),
      c.plan({ dur: 5.8, cam: t ? c.camDedans('auberge', c.haut(t.P, 0.8), { pref: c.maison('aubergiste').cap + 0.5, d: 3.6 }) : c.camActeur(moi), dit: ['Quatre morceaux de viande, six patates, quatre carottes. Vous me sauvez le dimanche !'] }),
    ];
  },
  fin(c) {
    const M = c.maison('aubergiste'), poste = M.poste || M.centre;
    const t = Q20H.meuble(c, 'auberge', 'table', poste);
    // (les chaises de cette table-là : les habitués y sont assis)
    const ch2 = t ? qtPropsDans(c.w, 'auberge', (q, lx, lz, h) => q.id === 'chaise' && h < 1 && Math.hypot(q.x - t.P[0], q.z - t.P[2]) < 1.6) : [];
    const gens = [['forgeron', 0], ['garde', 1]].map(([id, i]) => ch2[i] && npcs.alive(id) ? c.habitant(id, [ch2[i].x, ch2[i].y, ch2[i].z], { cap: c.cap([ch2[i].x, 0, ch2[i].z], t.P), geste: ['assis', i % 2 ? 'parle' : 'hoche'] }) : null);
    const pres = t ? c.devant(t.P, c.cap(t.P, poste), 0.9, 0.3, true) : poste;
    const moi = c.habitant('aubergiste', pres, { cap: t ? c.cap(pres, t.P) : M.cap, geste: ['porte', 'parle'] });
    const ch = Q20H.meuble(c, 'auberge', 'cheminee');
    const lum = ch ? [c.lueur(ch.P, 5.5, [1.0, 0.55, 0.25], 0.6)] : [];
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.8, d: 3.0, avec: t ? c.haut(t.P, 0.8) : undefined, k: 0.4 }), acteurs: [moi, ...gens], lum, dit: ['Magnifique ! Ça va sentir jusqu’à l’église.'], court: true }),
      c.plan({ dur: 5.6, cam: c.camActeur(moi, { cote: 0.2, d: 2.2, buste: true }), acteurs: [Object.assign({}, moi, { geste: ['trinque'] }), ...gens], lum, dit: ['Deux portions pour vous, et quelques sous. À la bonne vôtre !'], son: 'piece' }),
    ];
  },
});

q20.scenes('aubergiste_2', {
  qui: 'aubergiste',
  demande(c) {
    const B = c.w.bld.auberge;
    const moi = Q20H.poste(c, 'aubergiste', { geste: ['montre', 'parle'], cap: c.maison('aubergiste').cap + 1.4 });
    const ard = moi && c.chose(Q20_DESSINS.ardoise, c.haut(c.devant(moi.P, moi.cap, 0.9, 0, true), 1.55), { r: moi.cap + Math.PI });
    const elle = Q20H.seuil(c, 'forgeron', { d: 0.6, geste: 'travaille', tient: true });
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: -0.5, d: 2.4 }), acteurs: [moi, ard], dit: ['Trois mois d’ardoise, le forgeron. Et je n’ose rien lui dire : il a les bras trop gros.'], court: true }),
      c.plan({ dur: 5.8, cam: c.camActeur(elle, { cote: 0.6, d: 12, haut: 2.4 }), acteurs: [elle], son: 'enclume', dit: ['Allez le lui rappeler, gentiment. Très gentiment.'] }),
    ];
  },
  tournant(c) {
    const en = Q20H.meuble(c, 'forge', 'enclume');
    const moi = Q20H.poste(c, 'forgeron', { vise: en && en.P, geste: 'travaille', tient: true });
    const moi2 = Q20H.poste(c, 'forgeron', { geste: ['bras'], tient: false });
    return [
      c.plan({ dur: 5.6, cam: c.camActeur(moi, { cote: 1.2, d: 2.6 }), acteurs: [moi], son: 'enclume', dit: ['Dites-lui que je paierai…', '@forgeron'] }),
      c.plan({ dur: 5.8, cam: c.camActeur(moi2, { cote: 0.2, d: 2.0 }), acteurs: [moi2], dit: ['… quand son vin cessera d’avoir le goût du lac.', '@forgeron'] }),
    ];
  },
  fin(c) {
    const moi = Q20H.poste(c, 'aubergiste', { geste: ['trinque'] });
    const verre = moi && c.chose(Q20_DESSINS.verre, c.haut(c.devant(moi.P, moi.cap, 0.38, 0.16, true), 1.35));
    const moi2 = Q20H.poste(c, 'aubergiste', { geste: ['offre', 'parle'] });
    const fr = moi2 && c.chose(Q20_DESSINS.fromage, c.haut(c.devant(moi2.P, moi2.cap, 0.45, 0.1, true), 1.0));
    return [
      c.plan({ dur: 5.8, cam: c.camActeur(moi, { cote: 0.5, d: 2.0, buste: true }), acteurs: [moi, verre], dit: ['Le goût du lac ! Le goût du lac !'], court: true }),
      c.plan({ dur: 6, cam: c.camActeur(moi2, { cote: -0.75, d: 2.6 }), acteurs: [moi2, fr, Q20H.face(c, moi2, 1.3, 0.55)], dit: ['Bon. Il n’a peut-être pas tout à fait tort. Tenez, un fromage. Et pas un mot.'] }),
    ];
  },
});

q20.scenes('aubergiste_3', {
  qui: 'aubergiste',
  demande(c) {
    const moi = Q20H.poste(c, 'aubergiste', { geste: ['tend'] });
    const Ci = c.lieu('cimetiere');
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.4, d: 2.0 }), acteurs: [moi], dit: ['On a enterré l’oncle Anatole avec sa pipe. Hier matin, son étui traînait vide sur mon comptoir.'], court: true }),
      c.plan({ dur: 5.8, cam: c.camLieu(Ci, { d: 22, haut: 3.5, dy: 1 }), dit: ['La troisième tombe à gauche, celle au pichet gravé. Moi, je n’ai pas le cœur.'] }),
    ];
  },
  tournant(c) {
    const P = c.cachette();
    return Q20H.trouvaille(c, Q20_DESSINS.pipe, { s: 1.8, son: 'murmure', chaque: P ? Q20H.emet(c.haut(P, 0.12), { n: 5, col: [0.75, 0.75, 0.78, 0.35], taille: 0.07, vie: 3, v: 0.08, vy: 0.25, r: 0.04 }) : null });
  },
  fin(c) {
    const t = Q20H.meuble(c, 'auberge', 'chaise');
    const moi = t ? c.habitant('aubergiste', [t.P[0], t.P[1], t.P[2]], { cap: (t.r || 0) + Math.PI, geste: ['assis', 'baisse'] }) : Q20H.poste(c, 'aubergiste');
    const pipe = moi && c.chose(Q20_DESSINS.pipe, c.haut(c.devant(moi.P, moi.cap, 0.32, 0.12, true), 0.72), { s: 1.4, r: moi.cap });
    const ton = Q20H.meuble(c, 'auberge', 'tonneau');
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.5, d: 1.9 }), acteurs: [moi, pipe], chaque: moi ? Q20H.emet(c.haut(moi.P, 0.95), { n: 3, col: [0.75, 0.75, 0.78, 0.3], taille: 0.06, vie: 2.4, v: 0.06, vy: 0.2 }) : null, dit: ['Sa pipe… Elle est encore tiède. Nom d’une pipe. Enfin, nom de SA pipe.'], court: true }),
      c.plan({ dur: 5.6, cam: ton ? c.camDedans('auberge', c.haut(ton.P, 0.6), { pref: 1.2, d: 2.6 }) : c.camActeur(moi, { cote: -0.8, d: 3 }), acteurs: [moi, pipe], dit: ['Gardez ces plans de tonneau. Moi, je vais m’asseoir un moment.'] }),
    ];
  },
});

// ============================================================================ LE CURÉ (l'église)
q20.scenes('cure_1', {
  qui: 'cure',
  demande(c) {
    const B = c.w.bld.eglise;
    const moi = Q20H.poste(c, 'cure', { geste: 'prie', tient: true });
    const cierges = qtPropsDans(c.w, 'eglise', (q) => q.id === 'bougie').slice(0, 2).map((q) => c.lueur([q.x, q.y, q.z], 3.5, [1.0, 0.7, 0.35], 0.3));
    const banc = B && B.spots && B.spots.banc9 ? [B.spots.banc9.x, B.y + 0.8, B.spots.banc9.z] : null;
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.3, d: 3.0 }), acteurs: [moi], lum: cierges, dit: ['Pour Pâques, je voudrais offrir un œuf à chaque enfant du catéchisme. Ils sont neuf.'], court: true }),
      c.plan({ dur: 6, cam: banc ? c.camDedans('eglise', banc, { pref: c.maison('cure').cap + Math.PI + 0.3, d: 4.5, he: 1.9 }) : c.camActeur(moi), acteurs: [moi], lum: cierges, dit: ['J’en voudrais douze. On ne sait jamais combien ils seront, ici.'] }),
    ];
  },
  fin(c) {
    const moi = Q20H.seuil(c, 'cure', { d: 1.2, main: 'panier', geste: ['porte'] });
    const enf = moi ? [['enfant_a', 1.4, -0.9], ['enfant_b', 1.7, 0.4], ['enfant_c', 1.2, 1.2]].map(([k, d, l]) => c.gens(k, c.devant(moi.P, moi.cap, d, l), { face: moi.P, geste: 'leve' })) : [];
    const fille = moi && npcs.alive('fillette') ? c.habitant('fillette', c.devant(moi.P, moi.cap, 1.9, -0.2), { face: moi.P, geste: 'leve' }) : null;
    const M = c.maison('cure'), pn = Q20H.libre(c, M.dehors(3, 5), 0, 5, 0.5);
    const nich = c.chose('nichoir', pn, { r: M.cap });
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.5, d: 4.2, buste: true }), acteurs: [moi, ...enf, fille], dit: ['Douze beaux œufs. Deo gratias. Les enfants seront heureux. Ceux qui viendront.'], court: true }),
      c.plan({ dur: 5.6, cam: c.camChose(pn, { d: 2.8, haut: 1.5, dy: 1.2 }), acteurs: [nich], son: 'hibou', dit: ['Un nichoir. Les oiseaux chantent mieux près d’une maison bénie.'] }),
    ];
  },
});

q20.scenes('cure_2', {
  qui: 'cure',
  demande(c) {
    const Ch = c.lieu('chapelle');
    const moi = Q20H.seuil(c, 'cure', { d: 0.8, vise: Ch.P, geste: ['leve'], tient: true });
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.6, d: 2.6 }), acteurs: [moi], dit: ['L’abbé Mauduit a fermé les portes de la chapelle un soir. Pour toujours. Son chapelet est resté là-haut.'], court: true }),
      c.plan({ dur: 6, cam: c.camLieu(Ch, { d: 30, haut: 4, dy: 3 }), heure: c.heure('soir'), son: 'murmure', dit: ['Ne restez pas après le coucher du soleil. Et si vous entendez chanter, ne chantez pas avec eux.'] }),
    ];
  },
  tournant(c) { return Q20H.trouvaille(c, Q20_DESSINS.chapelet, { s: 2.4, son: 'murmure', dy2: 2.5, d2: 24, haut2: 8 }); },
  fin(c) {
    const cierges = qtPropsDans(c.w, 'eglise', (q) => q.id === 'bougie').slice(0, 2).map((q) => c.lueur([q.x, q.y, q.z], 3.5, [1.0, 0.7, 0.35], 0.3));
    const moi = Q20H.poste(c, 'cure', { geste: ['tend'] });
    const ch = moi && c.chose(Q20_DESSINS.chapelet, c.haut(c.devant(moi.P, moi.cap, 0.42, 0.05, true), 1.25), { s: 1.4, r: moi.cap + Math.PI / 2 });
    const moi2 = Q20H.poste(c, 'cure', { geste: 'prie', tient: true, cap: c.maison('cure').cap + Math.PI });
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.3, d: 2.0, buste: true }), acteurs: [moi, ch], lum: cierges, dit: ['Sa croix est tournée à l’envers… Dans mon souvenir, elle ne l’était pas.'], court: true }),
      c.plan({ dur: 6, cam: c.camActeur(moi2, { cote: 2.7, d: 3.4 }), acteurs: [moi2], lum: cierges, dit: ['Deo gratias, malgré tout. Prenez ceci pour votre peine, mon enfant.'], son: 'piece' }),
    ];
  },
});

q20.scenes('cure_3', {
  qui: 'cure',
  delais: { tournant: 1.2 },
  demande(c) {
    const B = c.w.bld.eglise, M = c.maison('cure');
    const moi = Q20H.seuil(c, 'cure', { d: 1.4, cap: M.cap + Math.PI, geste: ['montre', 'leve'] });
    const haut = [B.out[0] - M.f[0] * 1.8, M.sol + 14, B.out[1] - M.f[1] * 1.8];
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 2.5, d: 3.2 }), acteurs: [moi], dit: ['La cloche sonne seule à trois heures trente-trois. J’ai attaché la corde, cloué la porte du clocher.'], court: true }),
      c.plan({ dur: 6, cam: c.camLieu(haut, { d: 26, haut: 3, dy: 0, a: M.cap + 0.3, monte: 2 }), heure: 3.55, dit: ['Elle sonne quand même. Comptez les coups. S’il y en a treize, pas à voix haute.'] }),
    ];
  },
  tournant(c) {
    const B = c.w.bld.eglise, M = c.maison('cure');
    const haut = [B.out[0] - M.f[0] * 1.8, M.sol + 15, B.out[1] - M.f[1] * 1.8];
    const Le = c.lieu('eglise'), p = game.player;
    const ici = !c.rejeu && p && Math.hypot(p.pos[0] - B.out[0], p.pos[2] - B.out[1]) < 30 && !c.batiment(p.pos) ? c.pt(p.pos[0], p.pos[2]) : M.dehors(9, 2);
    const J = c.joueur(ici, { face: haut, tient: 'lanterne', geste: 'leve' });
    return [
      c.plan({ dur: 6.4, cam: c.camRegard(M.dehors(14, 1.5), haut, { haut: 1.5, monte: 0.8 }), acteurs: [J] }),
      c.plan({ dur: 5.6, cam: c.camActeur(J, { cote: 0.6, d: 3.4, buste: true }), acteurs: [J] }),
    ];
  },
  fin(c) {
    const moi = Q20H.seuil(c, 'cure', { d: 1.0, main: 'lanterne', geste: ['raide'] });
    const M = c.maison('cure'), pl = M.dehors(1.6, 1.4);
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.4, d: 2.6 }), acteurs: [moi], dit: ['Treize coups, et la corde n’a pas bougé ? Et personne là-haut… Tant mieux.'], court: true }),
      c.plan({ dur: 5.6, cam: c.camChose(pl, { d: 2.4, haut: 1.0, dy: 0.25 }), heure: Math.max(c.h, 20.4), acteurs: [c.chose('lanterne_sol', pl)], lum: [c.lueur(pl, 5, [1.0, 0.72, 0.38], 0.4)], dit: ['Les plans d’une lanterne. Gardez-la allumée. Toujours.'] }),
    ];
  },
});

// ============================================================================ LA POSTIÈRE (la poste)
q20.scenes('postiere_1', {
  qui: 'postiere',
  tournantSi: (E) => !!(E.Q && E.Q.step),
  demande(c) {
    const moi = Q20H.poste(c, 'postiere', { geste: ['travaille', 'parle'] });
    const pli = moi && c.chose(Q20_DESSINS.pli, c.haut(c.devant(moi.P, moi.cap, 0.5, 0.1, true), 1.02), { s: 1.4, r: 0.3 });
    const Mm = c.maison('maire');
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.3, d: 2.3, buste: true }), acteurs: [moi, pli], son: 'page', dit: ['Un pli officiel pour monsieur le maire. Cachet de cire et tout le tralala !'], court: true }),
      c.plan({ dur: 5.6, cam: c.camLieu(Mm.porte, { d: 16, haut: 3, dy: 2, a: Mm.cap + 0.4 }), dit: ['Ne l’ouvrez pas. Et si vous l’ouvrez, racontez-moi.'] }),
    ];
  },
  tournant(c) {
    const moi = Q20H.seuil(c, 'maire', { d: 0.9, geste: ['tend'] });
    const pli = moi && c.chose(Q20_DESSINS.pli, c.haut(c.devant(moi.P, moi.cap, 0.38, 0.05), 1.15), { s: 1.4, r: moi.cap });
    const J = Q20H.face(c, moi, 1.5, 0.4);
    return [
      c.plan({ dur: 5.6, cam: c.camActeur(moi, { cote: 1.3, d: 3.2, avec: J, k: 0.35 }), acteurs: [moi, pli, J], son: 'page', dit: ['La préfecture ! Enfin, une réponse !', '@maire'] }),
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.2, d: 1.9, buste: true }), acteurs: [moi, pli], dit: ['… Le cachet date d’il y a vingt ans. Mais c’est une réponse.', '@maire'] }),
    ];
  },
  fin(c) {
    const moi = Q20H.poste(c, 'postiere', { geste: ['hoche', 'parle'] });
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.4, d: 2.3 }), acteurs: [moi, Q20H.face(c, moi, 1.4, 0.2)], dit: ['Vingt ans de retard ? La Poste n’est jamais en retard. Ce sont les gens qui ne sont pas prêts.'], court: true, son: 'piece' }),
      c.plan({ dur: 5, cam: c.camActeur(moi, { cote: -0.5, d: 2.0, buste: true }), acteurs: [moi], dit: ['Tenez, pour la course.'] }),
    ];
  },
});

q20.scenes('postiere_2', {
  qui: 'postiere',
  demande(c) {
    const moi = Q20H.poste(c, 'postiere', { geste: ['eleve'] });
    const l = moi && c.chose(Q20_DESSINS.violette, c.haut(c.devant(moi.P, moi.cap, 0.36, 0.02, true), 1.5), { s: 1.4, r: moi.cap });
    const Ha = c.lieu('ranch') || c.lieu('hameau');
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.5, d: 2.0, buste: true }), acteurs: [moi, l], dit: ['Encore une lettre parfumée pour l’éleveuse ! Sans signature, comme toujours.'], court: true }),
      c.plan({ dur: 6, cam: c.camLieu(Ha, { d: 26, haut: 4, dy: 2 }), dit: ['Regardez bien sa tête quand elle l’ouvrira. C’est pour la science.'] }),
    ];
  },
  tournant(c) {
    const M = c.maison('eleveuse');
    const moi = Q20H.seuil(c, 'eleveuse', { d: 1.0, geste: ['tend'] });
    const l = moi && c.chose(Q20_DESSINS.violette, c.haut(c.devant(moi.P, moi.cap, 0.36, 0.02), 1.25), { s: 1.4, r: moi.cap });
    const dos = Q20H.seuil(c, 'eleveuse', { d: 1.0, cap: M.cap + Math.PI * 0.85, geste: ['tend'] });
    const l2 = dos && c.chose(Q20_DESSINS.violette, c.haut(c.devant(dos.P, dos.cap, 0.36, 0.02), 1.25), { s: 1.4, r: dos.cap });
    return [
      c.plan({ dur: 5.6, cam: c.camActeur(moi, { cote: 0.4, d: 2.2, buste: true }), acteurs: [moi, l], dit: ['Encore une ! Même écriture, même violette… Qui, là-bas, oserait ?', '@eleveuse'] }),
      c.plan({ dur: 5.6, cam: c.camActeur(dos, { cote: Math.PI * 0.85, d: 2.8 }), acteurs: [dos, l2], dit: ['Merci. Et pas un mot à la postière !', '@eleveuse'] }),
    ];
  },
  fin(c) {
    const moi = Q20H.poste(c, 'postiere', { geste: ['salue', 'parle'] });
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.3, d: 2.3 }), acteurs: [moi], dit: ['Elle a rougi ? Je le savais !'], court: true }),
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: -0.6, d: 2.0, buste: true }), acteurs: [moi, Q20H.face(c, moi, 1.4, 0.2)], son: 'piece', dit: ['Non, ne me dites pas qui c’est. Je veux deviner toute seule.'] }),
    ];
  },
});

q20.scenes('postiere_3', {
  qui: 'postiere',
  demande(c) {
    const moi = Q20H.poste(c, 'postiere', { geste: ['travaille', 'baisse'] });
    const R = c.w.ranch, cage = Q20H.pres(c, c.lieu('hameau').P, 'cage_poules', 40);
    const P0 = cage ? Q20H.libre(c, c.devant(cage.P, 0.5, 2.2), 0, 4, 0.5) : c.lieu('hameau').P;
    const poules = [0, 1, 2].map((i) => c.bete('hen', c.devant(P0, i * 2.1, 0.6 + i * 0.4), { cap: i * 2.1, v: i, geste: { graze: 1 } }));
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.4, d: 2.2, buste: true }), acteurs: [moi], dit: ['Mes plumes d’acier sont arrivées tordues. Toutes ! J’écris au charbon, en attendant.'], court: true }),
      c.plan({ dur: 5.6, cam: c.camChose(P0, { d: 3.2, haut: 0.9, dy: 0.2 }), acteurs: poules, son: 'poule', dit: ['Six belles plumes à tailler. De poule, d’oie, je ne suis pas difficile.'] }),
    ];
  },
  fin(c) {
    const moi = Q20H.poste(c, 'postiere', { geste: ['travaille', 'leve'] });
    const pl = moi && c.chose(Q20_DESSINS.plumes, c.haut(c.devant(moi.P, moi.cap, 0.45, 0.15, true), 1.0), { s: 1.3 });
    const B = c.w.bld.ferme, bal = Q20H.pres(c, c.lieu('ferme').P, 'boite_lettres', 20);
    const pp = bal ? Q20H.libre(c, c.devant(bal.P, 0.7, 2.2), 0, 4, 0.5) : c.lieu('ferme').P;
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.4, d: 2.0, buste: true }), acteurs: [moi, pl], dit: ['De belles plumes ! Je vais écrire comme un notaire.'], court: true }),
      c.plan({ dur: 5.6, cam: c.camChose(pp, { d: 3.6, haut: 1.4, dy: 0.9 }), acteurs: [c.chose('panneau', pp, { r: B ? Math.atan2(B.out[0] - B.x, B.out[1] - B.z) : 0 })], dit: ['Les plans d’un panneau. Que les lettres trouvent enfin votre ferme.'] }),
    ];
  },
});

q20.scenes('postiere_4', {
  qui: 'postiere',
  demande(c) {
    const moi = Q20H.poste(c, 'postiere', { geste: ['loin', 'raide'] });
    const co = moi && c.haut(c.devant(moi.P, moi.cap, 0.5, 0, true), 1.15);
    const Po = c.lieu('ponton');
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.6, d: 2.2, buste: true }), acteurs: [moi, co && c.chose(Q20_DESSINS.colis, co, { r: 0.2 })], chaque: co ? Q20H.emet(co, { n: 3, col: [0.5, 0.58, 0.6, 0.8], taille: 0.025, vie: 0.8, v: 0.02, vy: -0.6, grav: 6 }) : null, son: 'goutte', dit: ['« De la part de ton frère. » Son frère s’est noyé il y a dix ans.'], court: true }),
      c.plan({ dur: 5.8, cam: c.camLieu(Po, { d: 22, haut: 2.5, dy: 0.5 }), dit: ['Moi, je ne vais plus au lac. Pas depuis que l’eau m’a appelée par mon nom.'] }),
    ];
  },
  tournant(c) {
    const lac = c.lieu('lac'), P0 = q20Ponton(c);
    const moi = P0 && c.habitant('pecheur', P0, { cap: c.cap(P0, lac.P), geste: ['porte', 'baisse'] });
    const co = moi && c.chose(Q20_DESSINS.colis, c.haut(c.devant(P0, moi.cap, 0.32, 0.1, true), 0.95), { r: moi.cap });
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: Math.PI * 0.82, d: 3.4, buste: true }), acteurs: [moi, co], dit: ['C’est son bonnet. Celui qu’il portait ce jour-là. Il est encore trempé.', '@pecheur'] }),
      c.plan({ dur: 5.6, cam: c.camLieu(P0, { d: 14, haut: 2, dy: 1, a: c.cap(lac.P, P0) + 0.5 }), acteurs: [moi, co], dit: ['Laissez-moi, voulez-vous.', '@pecheur'] }),
    ];
  },
  fin(c) {
    const moi = Q20H.poste(c, 'postiere', { geste: ['raide', 'baisse'] });
    const M = c.maison('postiere'), pc = Q20H.libre(c, M.dehors(1.6, 2.2), 0, 3, 0.6);
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.4, d: 2.2 }), acteurs: [moi], dit: ['Il n’a rien dit ? Pauvre homme.'], court: true }),
      c.plan({ dur: 6, cam: c.camChose(pc, { d: 2.8, haut: 1.2, dy: 0.4 }), acteurs: [c.chose('caisse_expedition', pc, { r: M.cap })], dit: ['Les plans d’une caisse d’expédition. Vos envois à vous, au moins, auront un expéditeur.'] }),
    ];
  },
});

q20.scenes('postiere_5', {
  qui: 'postiere',
  demande(c) {
    const moi = Q20H.poste(c, 'postiere', { geste: ['raide', 'baisse'] });
    const fp = moi && c.chose(Q20_DESSINS.fairepart, c.haut(c.devant(moi.P, moi.cap, 0.55, 0, true), 1.02), { s: 1.5 });
    const H = c.lieu('hutte_ermite');
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.4, d: 2.0, buste: true }), acteurs: [moi, fp], dit: ['Un faire-part de deuil, arrivé sans timbre. Le nom du défunt est resté en blanc.'], court: true }),
      c.plan({ dur: 5.6, cam: c.camLieu(H, { d: 22, haut: 3, dy: 1.5 }), heure: 19.4, dit: ['Ne le lisez pas en chemin. Il n’y a rien à lire. C’est bien ce qui m’inquiète.'] }),
    ];
  },
  tournant(c) {
    const t = Q20H.meuble(c, 'hutte_ermite', 'table');
    const moi = Q20H.poste(c, 'guerisseuse', { vise: t && t.P, geste: ['tend'] });
    const fp = t && c.chose(Q20_DESSINS.fairepart, c.haut(t.P, 0.78), { s: 1.4 });
    const bg = qtPropsDans(c.w, 'hutte_ermite', (q) => q.id === 'bougie').slice(0, 1).map((q) => c.lueur([q.x, q.y, q.z], 3, [1.0, 0.65, 0.3], 0.3));
    const moi2 = Q20H.poste(c, 'guerisseuse', { geste: ['raide'], regard: 'camera' });
    return [
      c.plan({ dur: 5.8, cam: c.camActeur(moi, { cote: 0.9, d: 2.0, buste: true }), acteurs: [moi, fp], lum: bg, dit: ['Le nom est en blanc ? Alors rien n’est encore décidé.', '@guerisseuse'] }),
      c.plan({ dur: 6, cam: c.camActeur(moi2, { cote: 0.1, d: 1.9 }), acteurs: [moi2, fp], lum: bg, dit: ['Et vous, dormez chez vous cette semaine. Portes fermées.', '@guerisseuse'] }),
    ];
  },
  fin(c) {
    const M = c.maison('postiere');
    const moi = Q20H.seuil(c, 'postiere', { d: 0.5, cap: M.cap + Math.PI, geste: ['offre'] });
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: Math.PI - 0.6, d: 3.0 }), acteurs: [moi], heure: Math.max(c.h, 18.4), dit: ['« Rien n’est décidé », elle a dit ? … Bon.'], court: true }),
      c.plan({ dur: 5.6, cam: c.camLieu(M.porte, { d: 10, haut: 2.4, dy: 1.6, a: M.cap + 0.6 }), acteurs: [moi], heure: Math.max(c.h, 18.6), dit: ['Je fermerai le bureau un peu plus tôt, ce soir. Merci. Vraiment.'], son: 'porte' }),
    ];
  },
});

// ============================================================================ LE GARDE DES PONTS (sa maison, les deux ponts)
// le pont : son tablier (de jour), et la porte de la ville (le côté de la ville, la nuit)
function q20Pont(c, cle) {
  const w = c.w, br = (w.bridges || []).find((b) => b.key === cle), G = w.nav.nodes.find((q) => q.tag === cle + ':porte');
  if (!br || !G) return null;
  const dz = br.z - G.z, s = Math.sign(dz) || 1;
  return { br, G, porte: c.pt(G.x, G.z), milieu: [br.x, (br.y || w.waterLevel + 2) + 0.05, br.z], dehors: c.pt(G.x, G.z + s * 26), s };
}
// sur le tablier (le pont baissé, de jour), ou devant la porte de la ville (le pont levé)
function q20SurPont(c, Po, avance) {
  const ax = Po.s > 0 ? 0 : Math.PI;
  if (!Po.br.up) { const P = c.devant([Po.G.x, Po.br.y || c.w.waterLevel + 2, Po.G.z], ax, avance || 2.6, 0.7, true); P[1] = c.w.groundAt(P[0], P[2], (Po.br.y || 6) + 0.6, 0.8); if (P[1] > c.w.waterLevel + 0.5) return P; }
  const P = c.devant(Po.porte, ax + Math.PI, 1.2, 0.8);
  P.leve = true;
  return P;
}
q20.scenes('garde_1', {
  qui: 'garde',
  demande(c) {
    const Po = q20Pont(c, 'pont_nord');
    if (!Po) return null;
    // (sur le tablier, tourné vers le dehors : on le voit depuis le pont, la porte de la ville derrière lui ; le pont
    // levé, devant la porte, tourné vers la ville)
    const P0 = q20SurPont(c, Po, 2.8), ax = Po.s > 0 ? 0 : Math.PI;
    const moi = c.habitant('garde', P0, { cap: P0.leve ? ax + Math.PI : ax, geste: ['penche', 'montre'] });
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.35, d: 3.4 }), acteurs: [moi], dit: ['Le tablier du pont nord a des planches pourries. Grignotées. Par en dessous.'], court: true }),
      // (le pont baissé, vu d'en haut, depuis le dehors ; levé, la nuit : de plus loin, dressé devant la porte)
      c.plan({ dur: 6, cam: Po.br.up || Po.br.a > 0.3 ? c.camLieu(Po.porte, { d: 16, haut: 6, dy: 2.5, a: ax + 0.5, recul: 0.1 }) : c.camLieu(Po.milieu, { d: 12, haut: 5, dy: -0.4, a: ax + 0.45, recul: 0.1 }), son: 'eau', dit: ['Vingt brassées de bois, deux lingots de fer. Et faites vite. Je n’aime pas penser à ce qui grignote.'] }),
    ];
  },
  fin(c) {
    const Po = q20Pont(c, 'pont_nord');
    if (!Po) return null;
    const P0 = q20SurPont(c, Po, 2.0);
    const moi = c.habitant('garde', P0, { cap: (Po.s > 0 ? 0 : Math.PI) + (P0.leve ? Math.PI : 0) + 0.5, main: 'marteau', geste: 'travaille' });
    const pp = Q20H.libre(c, c.pt(Po.G.x + 3.2, Po.G.z + 1.2), 0, 3, 0.4);
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.3, d: 3.0 }), acteurs: [moi], son: 'enclume', dit: ['Du bon bois, du bon fer. Le pont tiendra.'], court: true }),
      c.plan({ dur: 6, cam: c.camChose(pp, { d: 2.2, haut: 1.0, dy: 0.1 }), acteurs: [c.chose('piege', pp)], dit: ['Les plans d’un piège. Pour ce qui grignote. Ou pour les renards, si ce sont des renards.'] }),
    ];
  },
});

q20.scenes('garde_2', {
  qui: 'garde',
  demande(c) {
    const Po = q20Pont(c, 'pont_sud');
    if (!Po) return null;
    const P0 = c.pt(Po.G.x + 1.4, Po.G.z - Po.s * 1.2);
    const moi = c.habitant('garde', P0, { cap: Po.s > 0 ? -0.6 : Math.PI + 0.6, geste: ['raide', { reach: 0.05, lookP: 0.3 }], tient: true });
    const Ma = c.lieu('marais'), loin = Ma && Q20H.libre(c, c.devant(Ma.P, 2.4, 14), 0, 8, 0.6);
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.6, d: 2.8 }), acteurs: [moi], dit: ['La clé du treuil a disparu. La petite dit qu’un grand homme maigre l’a jetée dans le marais.'], court: true }),
      c.plan({ dur: 6, cam: c.camLieu(Ma, { d: 30, haut: 2, dy: 1.5 }), acteurs: [loin && c.gens('maigre', loin, { face: 'camera', vu: false })], dit: ['Il n’y a pas de grand homme maigre, ici. Ne restez pas là-bas quand le brouillard se lève.'] }),
    ];
  },
  tournant(c) { return Q20H.trouvaille(c, Q20_DESSINS.cle, { s: 1.6, son: 'eau' }); },
  fin(c) {
    const Po = q20Pont(c, 'pont_sud');
    if (!Po) return null;
    const P0 = c.pt(Po.G.x + 1.4, Po.G.z - Po.s * 1.2);
    const moi = c.habitant('garde', P0, { cap: Po.s > 0 ? -0.4 : Math.PI + 0.4, geste: ['tend'] });
    const cl = c.chose(Q20_DESSINS.cle, c.haut(c.devant(P0, moi.cap, 0.4, 0.1), 1.1), { s: 1.3, r: moi.cap });
    const pc = Q20H.libre(c, c.pt(Po.G.x - 4, Po.G.z - Po.s * 3), 0, 4, 0.6);
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.5, d: 2.0, buste: true }), acteurs: [moi, cl], dit: ['C’est elle. Couverte de vase. Et… de marques de dents.'], court: true }),
      c.plan({ dur: 6, cam: c.camChose(pc, { d: 3.2, haut: 1.2, dy: 0.5 }), acteurs: [c.chose('cloture', pc)], dit: ['Les plans d’une bonne clôture. Ça n’arrête pas tout. Mais ça ralentit.'] }),
    ];
  },
});

q20.scenes('garde_3', {
  qui: 'garde',
  delais: { tournant: 2 },
  demande(c) {
    const Pn = q20Pont(c, 'pont_nord'), Ps = q20Pont(c, 'pont_sud');
    if (!Pn || !Ps) return null;
    const P0 = c.pt(Pn.G.x + 1.6, Pn.G.z + 0.6);
    const moi = c.habitant('garde', P0, { cap: c.cap(P0, Ps.porte), geste: ['raide'], tient: true });
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.7, d: 2.6 }), acteurs: [moi], heure: Math.max(c.h, 20.6), lum: [c.lueur(P0, 5, [1.0, 0.72, 0.38], 2.4)], dit: ['Chaque nuit, vers trois heures, quelqu’un marche sur le pont sud. Le pont est levé. Et moi, je suis ici.'], court: true }),
      c.plan({ dur: 5.6, cam: c.camLieu(Ps.porte, { d: 14, haut: 2.4, dy: 3, a: Ps.s > 0 ? Math.PI + 0.4 : 0.4 }), heure: 3.05, dit: ['Ne l’appelez pas. Ne répondez pas s’il vous appelle. Et surtout, ne baissez pas le pont.'] }),
    ];
  },
  tournant(c) {
    const Ps = q20Pont(c, 'pont_sud');
    if (!Ps) return null;
    const ax = Ps.s > 0 ? 0 : Math.PI, pas = [];
    for (let k = 0; k < 7; k++) { const P = c.devant(Ps.porte, ax, 0.4 + k * 0.62, k % 2 ? 0.13 : -0.13); pas.push(c.chose(Q20_DESSINS.pas, c.haut(P, 0.01), { r: ax, s: 1.15 })); }
    const J = c.joueur(c.devant(Ps.porte, ax, -1.3, 0.9), { face: Ps.milieu, tient: 'lanterne', geste: 'baisse', vu: false });
    const lum = [c.lueur(c.devant(Ps.porte, ax, 1.4), 4.5, [1.0, 0.72, 0.4], 1.2)];
    return [
      c.plan({ dur: 5.8, cam: c.camChose(c.devant(Ps.porte, ax, 1.6), { d: 2.6, haut: 1.1, a: ax + Math.PI + 0.35, recul: 0.25 }), acteurs: [...pas, J], lum }),
      c.plan({ dur: 6, cam: c.camRegard(c.devant(Ps.porte, ax, -1.5), c.haut(Ps.milieu, 7), { haut: 1.4, monte: 0.5 }), acteurs: [...pas, J], lum }),
    ];
  },
  fin(c) {
    const Ps = q20Pont(c, 'pont_sud'), Pn = q20Pont(c, 'pont_nord');
    const G = Pn || Ps;
    if (!G) return null;
    const P0 = c.pt(G.G.x + 1.6, G.G.z + 0.6);
    const moi = c.habitant('garde', P0, { cap: Math.PI * 0.7, main: 'lanterne', geste: ['peur'] });
    const pp = Ps ? Q20H.libre(c, c.pt(Ps.G.x + 3.5, Ps.G.z - Ps.s * 2), 0, 3, 0.5) : null;
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.4, d: 2.4 }), acteurs: [moi], dit: ['Des traces de pieds nus, sur le tablier dressé… qui montent vers le ciel ?'], court: true }),
      c.plan({ dur: 5.6, cam: pp ? c.camChose(pp, { d: 3, haut: 1.2, dy: 0.5 }) : c.camActeur(moi), acteurs: [pp && c.chose('portillon', pp, { r: 0 })], dit: ['Bon. Bon. Les plans d’un portillon. Et fermez-le à clé.'] }),
    ];
  },
});

// ============================================================================ L'ÉLEVEUSE (le ranch du hameau)
function q20Enclos(c) { const R = c.w.ranch; return R && R.pen ? c.pt(R.pen.x, R.pen.z) : c.lieu('ranch') && c.lieu('ranch').P; }
q20.scenes('eleveuse_1', {
  qui: 'eleveuse',
  demande(c) {
    const E = q20Enclos(c), ab = Q20H.pres(c, E, 'abreuvoir', 16);
    const auge = ab ? ab.P : E;
    const jument = c.bete('horse', c.devant(auge, 0.9, 2.2), { v: 1, cap: c.cap(auge, c.devant(auge, 0.9, 6)), geste: { lookP: 0.1 } });
    const moi = c.habitant('eleveuse', c.devant(auge, 2.3, 2.6), { face: jument.P, geste: ['bras'] });
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.8, d: 4.4, avec: jument, k: 0.5 }), acteurs: [moi, jument], son: 'cheval', dit: ['Ma jument Tempête boude sa mangeoire depuis trois jours.'], court: true }),
      c.plan({ dur: 5.8, cam: c.camActeur(jument, { cote: 0.7, d: 3.2 }), acteurs: [moi, jument], dit: ['Il n’y a que les carottes et les pommes pour la décider. Huit carottes, six pommes.'] }),
    ];
  },
  fin(c) {
    const E = q20Enclos(c);
    const jument = c.bete('horse', c.devant(E, 0.5, 3), { v: 1, cap: 2.4, geste: { graze: 0.6 } });
    const J = c.joueur(c.devant(jument.P, jument.cap, 1.5, 0), { face: jument.P, geste: 'offre' });
    const moi = c.habitant('eleveuse', c.devant(jument.P, jument.cap + 1.4, 2.2), { face: jument.P, geste: ['hoche', 'parle'] });
    const pm = Q20H.libre(c, c.devant(E, 2.6, 5), 0, 4, 0.8);
    return [
      c.plan({ dur: 6, cam: c.camActeur(jument, { cote: 1.3, d: 3.6, avec: J, k: 0.5 }), acteurs: [jument, J, moi], son: 'cheval', dit: ['Regardez-la manger ! Elle vous adore déjà.'], court: true }),
      c.plan({ dur: 6, cam: c.camChose(pm, { d: 3, haut: 1.2, dy: 0.4 }), acteurs: [c.chose('mangeoire', pm, { r: 0.4 }), jument], dit: ['Les plans d’une mangeoire. Elle vous le rendra. Enfin, elle vous mordra moins.'], son: 'piece' }),
    ];
  },
});

q20.scenes('eleveuse_2', {
  qui: 'eleveuse',
  demande(c) {
    const Ce = c.lieu('cercle'), M = c.maison('eleveuse');
    const P0 = M.dehors(2.6, 1.6);
    const vache = c.bete('cow', P0, { cap: c.cap(P0, Ce.P), geste: { lookP: -0.1 } });
    const moi = c.habitant('eleveuse', c.devant(P0, c.cap(P0, Ce.P) + 1.6, 1.6), { face: vache.P, geste: ['bras'] });
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.7, d: 4.2, avec: vache, k: 0.5 }), acteurs: [moi, vache], son: 'vache', dit: ['Ce matin, j’ai retrouvé Blanchette au milieu du cercle de pierres. Plantée. Sans bouger.'], court: true }),
      c.plan({ dur: 5.8, cam: c.camLieu(Ce, { d: 24, haut: 3, dy: 1.2 }), heure: 6.3, dit: ['Sa cloche avait disparu. Et ne vous asseyez pas sur les pierres. Personne ne s’assoit sur les pierres.'] }),
    ];
  },
  tournant(c) { return Q20H.trouvaille(c, Q20_DESSINS.clochette, { s: 1.7, son: 'clochette', lum: [c.lueur(c.cachette(), 3, [0.55, 0.65, 0.85], 0.4)] }); },
  fin(c) {
    const Ce = c.lieu('cercle'), M = c.maison('eleveuse');
    const P0 = M.dehors(2.6, 1.6);
    const vache = c.bete('cow', P0, { cap: c.cap(P0, Ce.P) + 0.6 });
    const moi = c.habitant('eleveuse', c.devant(P0, vache.cap, 1.1, 0.5), { face: vache.P, geste: ['penche', 'offre'] });
    const vache2 = c.bete('cow', P0, { cap: c.cap(P0, Ce.P), geste: { lookP: -0.15 } });
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 1.0, d: 3.4, avec: vache, k: 0.5 }), acteurs: [moi, vache], dit: ['Sa cloche ! Elle est froide comme la glace…'], court: true }),
      c.plan({ dur: 6, cam: c.camActeur(vache2, { cote: 2.4, d: 4.6 }), acteurs: [vache2, c.habitant('eleveuse', c.devant(P0, vache2.cap + Math.PI, 1.6, 1.2), { face: vache2.P, geste: 'bras' })], dit: ['Du lait, et un fromage. Et merci. Tout le monde n’en revient pas aussi vite.'] }),
    ];
  },
});

q20.scenes('eleveuse_3', {
  qui: 'eleveuse',
  delais: { tournant: 1.5 },
  demande(c) {
    const E = q20Enclos(c), Ha = c.lieu('hameau_abandonne');
    const cap = c.cap(E, Ha.P);
    const betes = [['cow', 0, 0], ['horse', 2.6, 1.4], ['cow', -2.4, 2.2], ['horse', 1.2, -2.6]].map(([r, lx, lz], i) => c.bete(r, c.devant(E, cap + Math.PI / 2, lx, lz), { cap: cap + (i - 1.5) * 0.04, v: i }));
    const moi = c.habitant('eleveuse', c.devant(E, cap + Math.PI, 4.2, 1.2), { cap, main: 'lanterne', geste: ['raide'] });
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: Math.PI - 0.5, d: 3.6, haut: 2.0 }), heure: Math.max(c.h, 21), acteurs: [moi, ...betes], dit: ['Certaines nuits, toutes mes bêtes se tournent vers le hameau abandonné. Toutes ensemble. Jusqu’à l’aube.'], court: true }),
      c.plan({ dur: 5.8, cam: c.camLieu(Ha, { d: 40, haut: 4, dy: 2 }), heure: c.heure('nuit'), dit: ['Allez voir ce qu’elles regardent. Si vous voyez une lumière, ne marchez pas vers elle.'] }),
    ];
  },
  tournant(c) {
    const L = c.lieu('hameau_abandonne'), w = c.w;
    const F = [L.x + 8, c.sol(L.x + 8, L.z + 5), L.z + 5];
    // (d'où l'on vient : le joueur, ou le chemin du hameau)
    const p = game.player, de = !c.rejeu && p && Math.hypot(p.pos[0] - F[0], p.pos[2] - F[2]) < 60 ? p.pos : c.devant(F, 0.7, 12);
    const a = c.cap(F, de), win = c.chose(Q20_DESSINS.fenetre, c.devant(F, a, 0.35, 0, true), { r: a });
    win.P[1] = F[1] + 1.45;
    const fig = c.gens('fenetre', c.devant(F, a, -0.25), { cap: a, geste: 'salue', vu: false });
    const lum = [c.lueur(F, 6, [1.0, 0.7, 0.4], 1.5)];
    return [
      c.plan({ dur: 6.4, cam: c.camLieu(F, { d: 16, haut: 1.8, dy: 1.4, a, recul: 0.25 }), acteurs: [win, fig], lum }),
      c.plan({ dur: 5.4, cam: c.camLieu(F, { d: 7, haut: 1.6, dy: 1.4, a: a + 0.2, recul: 0.12 }), acteurs: [win, fig], lum }),
    ];
  },
  fin(c) {
    const E = q20Enclos(c), Ha = c.lieu('hameau_abandonne'), cap = c.cap(E, Ha.P);
    const betes = [['cow', 0, 0], ['horse', 2.6, 1.4], ['cow', -2.4, 2.2]].map(([r, lx, lz], i) => c.bete(r, c.devant(E, cap + Math.PI / 2, lx, lz), { cap: cap + 1.5 + i, v: i, geste: { lie: 1 } }));
    const moi = c.habitant('eleveuse', c.devant(E, cap + Math.PI, 3.8, 0.6), { face: E, geste: ['bras', 'baisse'] });
    const pr = Q20H.libre(c, c.devant(E, cap + 2.2, 7), 0, 4, 0.6);
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.6, d: 3.6, avec: betes[0], k: 0.4 }), heure: c.h < 9 ? c.h : 6.4, acteurs: [...betes, moi], dit: ['Une fenêtre éclairée, dans une maison sans toit ? Et quelqu’un qui vous faisait signe ?'], court: true }),
      c.plan({ dur: 5.6, cam: c.camChose(pr, { d: 3, haut: 1.2, dy: 0.5 }), acteurs: [c.chose('ruche', pr)], dit: ['Mes bêtes n’ont pas dormi. Les plans d’une ruche. Les abeilles, elles, ne regardent rien.'] }),
    ];
  },
});

// ============================================================================ LE PÊCHEUR (sa cabane, le ponton)
// (au bout du ponton, là où il pêche : sur les planches, au-dessus de l'eau)
function q20Ponton(c) { const Po = c.lieu('ponton'); return Po ? [Po.x, c.w.waterLevel + 0.45, Po.z] : null; }
q20.scenes('pecheur_1', {
  qui: 'pecheur',
  demande(c) {
    const P0 = q20Ponton(c), lac = c.lieu('lac');
    if (!P0) return null;
    const moi = c.habitant('pecheur', P0, { cap: c.cap(P0, lac.P) + 0.5, geste: ['assis', 'travaille'] });
    const fi = c.chose(Q20_DESSINS.filet, c.devant(P0, moi.cap, 0.7, 0.2, true), { s: 1.0 });
    const eau = c.devant(P0, c.cap(P0, lac.P), 12);
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.9, d: 2.6, buste: true }), acteurs: [moi, fi], dit: ['Mes filets sont en loques. Quelque chose les a déchirés, cette nuit. Quelque chose de gros.'], court: true }),
      c.plan({ dur: 5.8, cam: c.camRegard(c.devant(P0, c.cap(P0, lac.P) + Math.PI, 1.3, 0.5, true), [eau[0], c.w.waterLevel, eau[2]], { haut: 1.75, recul: 0.02 }), son: 'eau', acteurs: [moi, fi], dit: ['Quinze bottes de fibre, et je les ravaude. Le lac n’est pas pressé. Moi, un peu.'] }),
    ];
  },
  fin(c) {
    const P0 = q20Ponton(c), lac = c.lieu('lac');
    if (!P0) return null;
    const moi = c.habitant('pecheur', P0, { cap: c.cap(P0, lac.P), geste: 'peche', tient: true });
    const moi2 = c.habitant('pecheur', P0, { cap: c.cap(P0, lac.P) + 2.6, geste: ['offre'] });
    const po = c.chose(Q20_DESSINS.poisson, c.haut(c.devant(P0, moi2.cap, 0.4, 0.1, true), 1.0), { s: 1.2, r: moi2.cap });
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 1.6, d: 3.4 }), acteurs: [moi], son: 'eau', dit: ['Bonne fibre, solide. Mes filets tiendront.'], court: true }),
      c.plan({ dur: 5.8, cam: c.camActeur(moi2, { cote: 0.3, d: 2.2, buste: true }), acteurs: [moi2, po, Q20H.face(c, moi2, 1.4, 0.2)], dit: ['Deux poissons grillés, et ces sous. Ne discutez pas.'], son: 'piece' }),
    ];
  },
});

q20.scenes('pecheur_2', {
  qui: 'pecheur',
  demande(c) {
    const P0 = q20Ponton(c), Ph = c.lieu('phare');
    if (!P0 || !Ph) return null;
    const moi = c.habitant('pecheur', P0, { cap: c.cap(P0, Ph.P), geste: ['raide'] });
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.8, d: 3.0 }), acteurs: [moi], dit: ['Jules gardait sa boussole au phare. Il y montait réfléchir.'], court: true }),
      c.plan({ dur: 6, cam: c.camLieu(Ph, { d: 30, haut: 3, dy: 10, a: c.cap(Ph.P, P0) + 0.5 }), dit: ['Montez l’escalier doucement. Il manque des marches. Et il en apparaît d’autres.'] }),
    ];
  },
  tournant(c) { return Q20H.trouvaille(c, Q20_DESSINS.boussole, { s: 2.0, dy2: 9 }); },
  fin(c) {
    const P0 = q20Ponton(c), lac = c.lieu('lac');
    if (!P0) return null;
    const moi = c.habitant('pecheur', P0, { cap: c.cap(P0, lac.P) + 2.4, geste: ['tend'] });
    const bo = c.chose(Q20_DESSINS.boussole, c.haut(c.devant(P0, moi.cap, 0.4, 0.05, true), 1.08), { s: 1.6, r: c.cap(P0, lac.P) });
    const moi2 = c.habitant('pecheur', P0, { cap: c.cap(P0, lac.P), geste: ['raide'] });
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.5, d: 1.9, buste: true }), acteurs: [moi, bo], dit: ['Sa boussole… L’aiguille ne montre pas le nord. Elle montre le lac. Toujours le lac.'], court: true }),
      c.plan({ dur: 6, cam: c.camActeur(moi2, { cote: Math.PI * 0.9, d: 3.6 }), acteurs: [moi2], dit: ['Les plans de sa canne. La meilleure de la vallée.'] }),
    ];
  },
});

q20.scenes('pecheur_3', {
  qui: 'pecheur',
  delais: { tournant: 1.5 },
  demande(c) {
    const P0 = q20Ponton(c), lac = c.lieu('lac');
    if (!P0) return null;
    const moi = c.habitant('pecheur', P0, { cap: c.cap(P0, lac.P), geste: ['baisse'] });
    const C = [lac.x, c.w.waterLevel + 1, lac.z];
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.9, d: 2.8 }), acteurs: [moi], dit: ['À l’aube, par temps calme, on voit le clocher du village noyé. Au fond.'], court: true }),
      c.plan({ dur: 6, cam: c.camRegard(c.devant(P0, c.cap(P0, lac.P), 2), C, { haut: 1.2, recul: 0.05 }), heure: 5.85, son: 'eau', dit: ['Jules disait qu’on l’entendait sonner. Allez regarder. Moi, je ne peux plus.'] }),
    ];
  },
  tournant(c) {
    const P0 = q20Ponton(c), lac = c.lieu('lac'), w = c.w;
    if (!P0) return null;
    const S = [lac.x, w.waterLevel + 8.6, lac.z];
    const clocher = c.chose((PE) => { PE.bx(0, -3, 0, 3, 9, 3, [1, 1, 1], mt(M_MOSSY)); PE.bx(0, 6, 0, 3.4, 5, 3.4, [1, 1, 1], mt(M_SLATE), 0.78); PE.fl = FX_EMIT; PE.bx(0, 3, 1.52, 0.8, 1.2, 0.05, [1.2, 0.9, 0.5], 0); PE.fl = 0; }, [lac.x, w.waterLevel - 3, lac.z]);
    const jules = c.gens('jules', [lac.x + 1.1, w.waterLevel + 8.2, lac.z + 1.1], { face: P0, geste: 'salue', vu: false });
    // (comme un regard qui s'approche, au ras de l'eau : de trente mètres, puis de quinze)
    const a = c.cap(S, P0), loin = [lac.x + Math.sin(a) * 32, w.waterLevel + 0.6, lac.z + Math.cos(a) * 32], pres = [lac.x + Math.sin(a + 0.5) * 15, w.waterLevel + 0.6, lac.z + Math.cos(a + 0.5) * 15];
    return [
      c.plan({ dur: 6.4, cam: c.camRegard(loin, c.haut(S, -3.5), { haut: 1.4, recul: 0.2 }), acteurs: [clocher, jules], son: 'clochette' }),
      c.plan({ dur: 5.4, cam: c.camRegard(pres, c.haut(S, -1.2), { haut: 1.0, recul: 0.15, monte: 0.4 }), acteurs: [clocher, jules], son: 'cloche' }),
    ];
  },
  fin(c) {
    const P0 = q20Ponton(c), lac = c.lieu('lac');
    if (!P0) return null;
    const moi = c.habitant('pecheur', P0, { cap: c.cap(P0, lac.P), geste: ['assis', 'baisse'] });
    const moi2 = c.habitant('pecheur', P0, { cap: c.cap(P0, lac.P) + 2.5, geste: ['offre'] });
    const po = c.chose(Q20_DESSINS.lune, c.haut(c.devant(P0, moi2.cap, 0.42, 0.1, true), 1.0), { s: 1.3, r: moi2.cap, lueur: true });
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: Math.PI * 0.85, d: 3.2 }), acteurs: [moi], dit: ['Quelqu’un, sur le clocher, qui vous faisait signe ? … Jules faisait signe comme ça.'], court: true }),
      c.plan({ dur: 5.8, cam: c.camActeur(moi2, { cote: 0.3, d: 2.1, buste: true }), acteurs: [moi2, po, Q20H.face(c, moi2, 1.4, 0.2)], dit: ['Un poisson-lune. Pêché une nuit rouge. Je n’en veux plus chez moi.'] }),
    ];
  },
});

// ============================================================================ LA GUÉRISSEUSE (sa hutte, au fond des bois)
function q20Bougies(c) { return qtPropsDans(c.w, 'hutte_ermite', (q) => q.id === 'bougie').slice(0, 2).map((q) => c.lueur([q.x, q.y, q.z], 3.2, [1.0, 0.66, 0.3], 0.3)); }
q20.scenes('guerisseuse_1', {
  qui: 'guerisseuse',
  demande(c) {
    const t = Q20H.meuble(c, 'hutte_ermite', 'table');
    // (une botte d'herbes dans les mains, qu'elle regarde : le bras levé cachait son visage)
    const moi = Q20H.poste(c, 'guerisseuse', { vise: t && t.P, geste: ['tend', 'baisse'] });
    const herbe = moi && c.chose(Q20_DESSINS.fleurs, c.haut(c.devant(moi.P, moi.cap, 0.38, 0, true), 1.0), { s: 0.32, r: moi.cap });
    const H = c.lieu('hutte_ermite'), sol = Q20H.libre(c, c.devant(H.P, 0.9, 9), 0, 6, 0.5);
    const ec = c.bete(ANIMAL_RIGS.squirrel ? 'squirrel' : 'rabbit', sol, { cap: 2.2, geste: { graze: 0.5 } });
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.7, d: 2.1, buste: true }), acteurs: [moi, herbe], lum: q20Bougies(c), dit: ['L’hiver sera long. Je le sais, les écureuils le savent.'], court: true }),
      c.plan({ dur: 5.8, cam: c.camChose(sol, { d: 2.6, haut: 0.95, dy: 0.15 }), heure: 6.2, acteurs: [ec], dit: ['Huit bottes d’herbes, cinq champignons. Cueillez à l’aube, quand la plante dort encore.'] }),
    ];
  },
  fin(c) {
    const t = Q20H.meuble(c, 'hutte_ermite', 'table');
    const moi = Q20H.poste(c, 'guerisseuse', { vise: t && t.P, geste: ['tend', 'parle'] });
    const herbe = moi && c.chose(Q20_DESSINS.fleurs, c.haut(c.devant(moi.P, moi.cap, 0.38, 0, true), 1.0), { s: 0.32, r: moi.cap });
    const M = c.maison('guerisseuse'), pp = Q20H.libre(c, M.dehors(2.6, 2.0), 0, 4, 0.8);
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.6, d: 2.1 }), acteurs: [moi, herbe], lum: q20Bougies(c), dit: ['Belles herbes. Vous avez la main verte. Ou la main heureuse.'], court: true }),
      c.plan({ dur: 5.8, cam: c.camChose(pp, { d: 2.8, haut: 1.2, dy: 0.2 }), acteurs: [c.chose('parterre', pp, { r: M.cap })], dit: ['Les plans d’un parterre. Faites pousser vos propres remèdes.'] }),
    ];
  },
});

q20.scenes('guerisseuse_2', {
  qui: 'guerisseuse',
  demande(c) {
    const Ch = c.lieu('chene'), M = c.maison('guerisseuse');
    const moi = Q20H.seuil(c, 'guerisseuse', { d: 0.8, cap: M.cap + 0.7, geste: ['raide', 'leve'], tient: true });
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.6, d: 2.6 }), acteurs: [moi], dit: ['Il y a longtemps, j’ai enterré une dent de loup sous le vieux chêne. Pour garder la forêt.'], court: true }),
      c.plan({ dur: 6, cam: c.camLieu(Ch, { d: 38, haut: 3, dy: 8, ign: [Ch.x, Ch.z], monte: 2 }), son: 'loup', dit: ['Creusez entre les deux grosses racines. Et si le chêne gémit, excusez-vous.'] }),
    ];
  },
  tournant(c) {
    const Ch = c.lieu('chene');
    return Q20H.trouvaille(c, Q20_DESSINS.dent, { s: 1.6, son: 'loup', lieu: false }).concat(Ch ? [c.plan({ dur: 5.4, cam: c.camLieu(Ch, { d: 30, haut: 2.6, dy: 6, ign: [Ch.x, Ch.z] }), son: 'grondement' })] : []);
  },
  fin(c) {
    const moi = Q20H.seuil(c, 'guerisseuse', { d: 0.8, geste: ['eleve'] });
    const de = moi && c.chose(Q20_DESSINS.dent, c.haut(c.devant(moi.P, moi.cap, 0.12, 0.24), 2.05), { s: 0.9 });
    const M = c.maison('guerisseuse'), pa = Q20H.libre(c, M.dehors(3, -2.5), 0, 4, 1.0);
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.4, d: 1.8, buste: true }), acteurs: [moi, de], dit: ['La voilà. Elle est chaude… Quelqu’un l’a tenue avant vous, ce matin.'], court: true }),
      c.plan({ dur: 5.6, cam: c.camChose(pa, { d: 4, haut: 1.4, dy: 1.1 }), acteurs: [c.chose('arche_fleurie', pa, { r: M.cap })], dit: ['Les plans d’une arche fleurie. Passez dessous chaque soir : ça trompe ce qui suit.'] }),
    ];
  },
});

q20.scenes('guerisseuse_3', {
  qui: 'guerisseuse',
  delais: { tournant: 2 },
  demande(c) {
    const t = Q20H.meuble(c, 'hutte_ermite', 'table');
    const moi = Q20H.poste(c, 'guerisseuse', { vise: t && t.P, geste: ['raide', 'baisse'] });
    const Pu = c.lieu('vieux_puits');
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.6, d: 1.9 }), acteurs: [moi], heure: Math.max(c.h, 20.4), lum: q20Bougies(c), dit: ['Le vieux puits murmure, la nuit. Anselme y écoutait des heures.'], court: true }),
      c.plan({ dur: 6, cam: c.camLieu(Pu, { d: 12, haut: 2.2, dy: 0.8 }), heure: c.heure('nuit'), son: 'murmure', dit: ['Penchez-vous, et écoutez. Ne répondez pas. Surtout, ne répondez pas.'] }),
    ];
  },
  tournant(c) {
    const Pu = c.lieu('vieux_puits');
    if (!Pu) return null;
    const bord = c.devant(Pu.P, 0.7, 1.3);
    return [
      c.plan({ dur: 6.4, cam: Q20H.puits(c, Pu, { a: 0.7, fond: -1.2, r: [2.0, 2.5, 1.6, 3.0], haut: 2.0 }), son: 'murmure', acteurs: [] }),
      c.plan({ dur: 5.2, cam: c.camLieu(Pu, { d: 7, haut: 1.6, dy: 0.8, a: 3.4 }), acteurs: [c.joueur(bord, { face: Pu.P, tient: 'lanterne', geste: 'penche' })] }),
    ];
  },
  fin(c) {
    const moi = Q20H.seuil(c, 'guerisseuse', { d: 0.8, geste: ['raide'], regard: 'camera' });
    const F = c.lieu('ferme'), B = c.w.bld.ferme, pp = B ? Q20H.libre(c, c.pt(B.out[0] - 5, B.out[1] - 3), 0, 6, 1.0) : F.P;
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.05, d: 1.9 }), acteurs: [moi], dit: ['Il a dit votre nom ? Avec votre propre voix ?'], court: true }),
      c.plan({ dur: 5.6, cam: c.camChose(pp, { d: 4, haut: 1.5, dy: 0.7 }), acteurs: [c.chose('puits_deco', pp)], dit: ['Alors il vous connaît déjà. Les plans d’un puits : n’allez plus là-bas.'] }),
    ];
  },
});

// ============================================================================ LA FILLETTE (la boulangerie ; et Lise, que personne ne voit)
q20.scenes('fillette_1', {
  qui: 'fillette',
  demande(c) {
    const Pu = c.lieu('puits_ville');
    const P0 = c.devant(Pu.P, 2.2, 1.9);
    const moi = c.habitant('fillette', P0, { face: Pu.P, geste: ['parle', 'baisse'] });
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.9, d: 2.4 }), acteurs: [moi], dit: ['Tu veux bien m’aider ? Je fais une couronne pour Lise.'], court: true }),
      c.plan({ dur: 6, cam: Q20H.puits(c, Pu, { a: 2.2 }), son: 'goutte', dit: ['Là où elle habite, y a pas de fleurs. Il fait tout noir.'] }),
    ];
  },
  fin(c) {
    const Pu = c.lieu('puits_ville');
    // (la couronne sur la margelle : le dessus de la pierre)
    const bord = c.devant(Pu.P, 2.2, 0.95, 0, true);
    bord[1] = c.w.groundAt(bord[0], bord[2], Pu.P[1] + 0.2, 1.4) + 0.02;
    const P0 = c.devant(Pu.P, 2.2, 1.9);
    const moi = c.habitant('fillette', P0, { face: Pu.P, geste: ['penche', 'offre'] });
    const co = c.chose(Q20_DESSINS.couronne, bord, { s: 1.1 });
    const lise = c.gens('lise', c.devant(Pu.P, 3.6, 1.9), { face: bord, geste: ['raide', 'baisse'], vu: false });
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.8, d: 2.4, avec: bord, k: 0.4 }), acteurs: [moi, co], heure: Math.max(c.h, 18.6), dit: ['Elle est trop belle ! Je la poserai sur le puits ce soir.'], court: true }),
      c.plan({ dur: 5.6, cam: c.camChose(bord, { d: 2.4, haut: 1.0, a: 2.2, recul: 0.1 }), acteurs: [co, lise], heure: 22.8, son: 'murmure', dit: ['Tiens, c’est la confiture de maman. Chut. Je l’ai prise dans le placard.'] }),
    ];
  },
});

q20.scenes('fillette_2', {
  qui: 'fillette',
  demande(c) {
    const M = c.maison('fillette');
    const moi = Q20H.seuil(c, 'fillette', { d: 1.0, lat: 0.6, geste: ['parle', { lookY: -0.7 }] });
    const Ha = c.lieu('hameau_abandonne');
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 0.15, d: 2.0 }), acteurs: [moi], dit: ['Lise a perdu sa poupée. Elle dit qu’elle est dans la maison sans toit.'], court: true }),
      c.plan({ dur: 5.8, cam: c.camLieu(Ha, { d: 26, haut: 2.6, dy: 1.4 }), heure: Math.max(c.h, 18.8), dit: ['Moi, j’ai pas le droit d’y aller. Toi, t’es une grande personne.'] }),
    ];
  },
  tournant(c) { return Q20H.trouvaille(c, 'poupee', { s: 1.4, son: 'murmure' }); },
  fin(c) {
    const M = c.maison('fillette');
    const moi = Q20H.seuil(c, 'fillette', { d: 0.9, geste: ['porte', 'baisse'] });
    const po = moi && c.chose('poupee', c.haut(c.devant(moi.P, moi.cap, 0.18, 0.05), 0.55), { s: 0.8, r: moi.cap + Math.PI });
    const moi2 = Q20H.seuil(c, 'fillette', { d: 0.9, geste: ['offre'] });
    const fi = moi2 && c.chose('figurine', c.haut(c.devant(moi2.P, moi2.cap, 0.32, 0.05), 0.62), { s: 0.9, r: moi2.cap + Math.PI });
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.4, d: 1.8, buste: true }), acteurs: [moi, po], dit: ['Elle est toute mouillée… Lise dit merci.'], court: true }),
      c.plan({ dur: 6, cam: c.camActeur(moi2, { cote: -0.4, d: 1.7, buste: true }), acteurs: [moi2, fi], dit: ['Elle t’a fait ça, regarde : c’est toi, en bois. Elle dit que tu vas en avoir besoin.'] }),
    ];
  },
});

q20.scenes('fillette_3', {
  qui: 'fillette',
  demande(c) {
    const P = c.lieu('place'), P0 = c.devant(P.P, 0.8, 3);
    const moi = c.habitant('fillette', P0, { cap: 0.8, geste: ['leve'] });
    const ciel = [P0[0] + Math.sin(0.8) * 20, P0[1] + 26, P0[2] + Math.cos(0.8) * 20];
    return [
      c.plan({ dur: 6, cam: c.camActeur(moi, { cote: 0.6, d: 2.2 }), acteurs: [moi], heure: Math.max(c.h, 20.6), dit: ['Tu peux demander à la dame de la forêt pourquoi la lune devient rouge ?'], court: true }),
      c.plan({ dur: 6, cam: c.camRegard(c.devant(P0, 0.8, -1.2), ciel, { haut: 0.9, recul: 0.03 }), heure: 22.5, acteurs: [moi], dit: ['Maman veut pas que j’y aille. Et le curé dit que c’est péché de poser la question.'] }),
    ];
  },
  tournant(c) {
    const moi = Q20H.seuil(c, 'guerisseuse', { d: 0.9, geste: ['leve'] });
    const J = Q20H.face(c, moi, 1.6, 0.4);
    const moi2 = Q20H.seuil(c, 'guerisseuse', { d: 0.9, geste: ['raide'], regard: 'camera' });
    return [
      c.plan({ dur: 6.2, cam: c.camActeur(moi, { cote: 1.3, d: 3.2, avec: J, k: 0.35 }), acteurs: [moi, J], dit: ['La lune ne change pas. C’est nous qui passons de l’autre côté.', '@guerisseuse'] }),
      c.plan({ dur: 5.8, cam: c.camActeur(moi2, { cote: 0.2, d: 2.0 }), acteurs: [moi2, J], dit: ['Dites-lui qu’elle continue de faire semblant de dormir.', '@guerisseuse'] }),
    ];
  },
  fin(c) {
    const M = c.maison('fillette');
    const moi = Q20H.seuil(c, 'fillette', { d: 0.9, geste: ['hoche', 'baisse'] });
    const moi2 = Q20H.seuil(c, 'fillette', { d: 0.9, geste: ['offre'] });
    const fl = moi2 && c.chose(Q20_DESSINS.couronne, c.haut(c.devant(moi2.P, moi2.cap, 0.3, 0.05), 0.6), { s: 0.55 });
    return [
      c.plan({ dur: 6.4, cam: c.camActeur(moi, { cote: 0.4, d: 1.9 }), acteurs: [moi], dit: ['C’est nous qui changeons de côté ? … Oh. Ça, je le savais déjà un peu.'], court: true }),
      c.plan({ dur: 5.6, cam: c.camActeur(moi2, { cote: -0.3, d: 1.7, buste: true }), acteurs: [moi2, fl], dit: ['Tiens, des fleurs. Merci d’avoir demandé pour moi.'] }),
    ];
  },
});
