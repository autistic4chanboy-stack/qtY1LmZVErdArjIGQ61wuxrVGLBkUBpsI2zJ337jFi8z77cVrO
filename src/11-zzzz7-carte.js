// ============================================================================
//  UN LIEU TOUS LES DEUX CENTS MÈTRES (agent C1, huitième vague)
//  - La vallée (3 072 m) est découpée en carrés de 200 m. Chaque carré où l'on
//    marche (assez de terre ferme, joignable depuis la ferme, ni eau profonde
//    ni paroi) porte au moins un lieu qui mérite le détour : ce qui existait
//    déjà compte (villes, hameaux, lieux-dits, bâtiments, stèles, sigles,
//    coffres, tombes, notes…) ; les carrés vides reçoivent un lieu tiré d'un
//    catalogue (croix de peste, chapelles ruinées, oratoires, lanternes des
//    morts, gibets, menhirs, cercles, pierres branlantes, bornes, loges de
//    charbonniers, fours à chaux, cabanes de bûcherons, bories, bergeries,
//    affûts, cabanes perchées, glacières, puits perdus, moulins et tours en
//    ruine, camps abandonnés, charrettes, galeries de prospecteurs, sources
//    sacrées, arbres aux offrandes, ruchers, jardins clos et leur cadran,
//    pigeonniers, cairns et croix des sommets, abris sous roche, trous qui
//    soufflent, rochers de l'aigle, pierres à sel et rochers marqués…).
//  - Beaucoup portent quelque chose : un butin (menu de butin), une
//    inscription (en français, en aëlin, en gorrain), une lettre, un
//    mécanisme, un petit secret (voir 11-zzzz7-carte2-textes.js).
//  - Génération APRÈS tout le reste (emballage de generateValley), avec son
//    propre tirage : mulberry32(graine ^ 0x5C1A2E7). Les objets, objets posés et
//    interactions d'avant ne bougent pas (on ajoute à la fin des listes).
//  - Mesure : carte2Carres(w) (utilisée par tools/equilibrage/carte.js).
//  État : farm.s.carte2 (voir carte2.S()). API : carte2.
// ============================================================================

const C2_CARRE = 200;          // côté des carrés (m)
const C2_PAS = 4;              // pas de la grille d'accessibilité (m)
const C2_TERRE_MIN = 4000;     // un carré « accessible » : au moins 4 000 m² de terre ferme joignable (un dixième)
// interactions qui, seules, ne font pas un lieu (l'eau d'un puits, une échelle, un poteau indicateur…)
const C2_PAS_UN_LIEU = new Set(['water', 'ladder', 'grimper', 'sign', 'forage', 'bed', 'rentbed', 'cook', 'chest', 'mailbox', 'louer', 'feeder', 'station', 'ship', 'cellar', 'deep']);

// ---------------------------------------------------------------- l'accessibilité (grille de 4 m)
// terre ferme joignable depuis la ferme : on monte une pente de 46° au plus (plus raide sur un chemin), on descend
// tout, on traverse l'eau à la nage ; renvoie { n, st, H, R } (R[k] = 1 : on y marche, 2 : on y nage)
function carte2Acces(w) {
  if (w._c2acces) return w._c2acces;
  const st = C2_PAS, n = Math.floor(w.size / st) + 1, WL = w.waterLevel;
  const H = new Float32Array(n * n), P = new Uint8Array(n * n), R = new Uint8Array(n * n);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const x = i * st, z = j * st, k = j * n + i;
    H[k] = w.heightAt(x, z);
    const m = w.matAt(x, z);
    P[k] = m === M_DIRT || m === M_COBBLE || m === M_SAND ? 1 : 0;
  }
  const F = (w.lm && w.lm.ferme) || (w.farm && w.farm.f) || { x: w.size / 2, z: w.size / 2 };
  const s0 = Math.round(F.z / st) * n + Math.round(F.x / st);
  const Q = new Int32Array(n * n);
  let qa = 0, qb = 0;
  Q[qb++] = s0; R[s0] = H[s0] < WL - 0.3 ? 2 : 1;
  const NB = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2]];
  while (qa < qb) {
    const k = Q[qa++], i = k % n, j = (k / n) | 0, h = H[k];
    for (const [di, dj, dd] of NB) {
      const a = i + di, b = j + dj;
      if (a < 1 || b < 1 || a >= n - 1 || b >= n - 1) continue;
      const kk = b * n + a;
      if (R[kk]) continue;
      const h2 = H[kk], mouille = h2 < WL - 0.3 || h < WL - 0.3;
      if (!mouille && (h2 - h) / (st * dd) > (P[kk] ? 2.2 : 1.05)) continue;
      R[kk] = h2 < WL - 0.3 ? 2 : 1; Q[qb++] = kk;
    }
  }
  return (w._c2acces = { n, st, H, R });
}

// ---------------------------------------------------------------- ce qui fait déjà un lieu
// [x, z, étiquette] : lieux-dits de surface (pas les grandes étendues), bâtiments, interactions qui ne sont pas de
// simples commodités (sous terre exclu : une salle souterraine ne compte pas pour le carré au-dessus)
function carte2LieuxExistants(w) {
  const L = [];
  for (const k in w.lm || {}) { const q = w.lm[k]; if (q.under || (q.r || 0) > 60 || !isFinite(q.x)) continue; L.push([q.x, q.z, 'lieu:' + k]); }
  for (const k in w.bld || {}) { const b = w.bld[k]; if (!b || b.under || !isFinite(b.x)) continue; if (b.y !== undefined && b.y < w.heightAt(b.x, b.z) - 3) continue; L.push([b.x, b.z, 'bâtiment:' + k]); }
  for (const it of w.inter || []) {
    if (!it || C2_PAS_UN_LIEU.has(it.kind) || !isFinite(it.x)) continue;
    if (it.data && it.data.envers) continue;
    if (it.y < w.heightAt(it.x, it.z) - 3) continue;
    L.push([it.x, it.z, it.kind + ':' + (it.id || '')]);
  }
  return L;
}

// ---------------------------------------------------------------- les carrés : accessibles ? pourvus ?
function carte2Carres(w) {
  const A = carte2Acces(w), { n, st, H, R } = A, WL = w.waterLevel;
  const G = Math.ceil(w.size / C2_CARRE), C = [];
  for (let gj = 0; gj < G; gj++) for (let gi = 0; gi < G; gi++) C.push({ gi, gj, terre: 0, lieux: [] });
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const k = j * n + i;
    if (R[k] !== 1 || H[k] < WL + 0.2) continue;
    const gi = Math.min(G - 1, Math.floor(i * st / C2_CARRE)), gj = Math.min(G - 1, Math.floor(j * st / C2_CARRE));
    C[gj * G + gi].terre += st * st;
  }
  for (const [x, z, e] of carte2LieuxExistants(w)) {
    const gi = Math.floor(x / C2_CARRE), gj = Math.floor(z / C2_CARRE);
    if (gi < 0 || gj < 0 || gi >= G || gj >= G) continue;
    C[gj * G + gi].lieux.push(e);
  }
  for (const c of C) c.acc = c.terre >= C2_TERRE_MIN;
  const acc = C.filter((c) => c.acc), vides = acc.filter((c) => !c.lieux.length);
  return { G, carres: C, accessibles: acc.length, vides: vides.length, listeVides: vides.map((c) => [c.gi, c.gj]) };
}

// ---------------------------------------------------------------- les butins des lieux : [objet, min, max, poids]
// (ceux qui se regarnissent sont modestes ; « c2_t_ » : trésors d'une seule fois — voir tools/equilibrage/carte.js)
Object.assign(LOOT, {
  c2_abandon: { rolls: [1, 2], items: [['bougie', 1, 2, 3], ['corde', 1, 1, 2], ['charbon', 1, 3, 2], ['pain', 1, 1, 1], ['sel', 1, 1, 1.5], ['argent', 1, 6, 2], ['tesson', 1, 1, 1], ['clous', 1, 2, 1]] },
  c2_charbonnier: { rolls: [1, 2], items: [['charbon', 2, 5, 5], ['bois', 1, 3, 2], ['pain', 1, 1, 1], ['argent', 1, 5, 1], ['corde', 1, 1, 1]] },
  c2_bucheron: { rolls: [1, 2], items: [['bois', 2, 4, 4], ['corde', 1, 1, 2], ['fibre', 1, 3, 2], ['pain', 1, 1, 1], ['clous', 1, 2, 1], ['argent', 1, 6, 1]] },
  c2_chasseur: { rolls: [1, 2], items: [['fleche', 2, 4, 3], ['cuir', 1, 1, 2], ['viande_fumee', 1, 1, 2], ['corde', 1, 1, 1], ['argent', 2, 8, 1], ['cartouche', 1, 1, 0.4]] },
  c2_berger: { rolls: [1, 2], items: [['sel', 1, 2, 3], ['pain', 1, 1, 2], ['bougie', 1, 1, 2], ['corde', 1, 1, 1], ['laine', 1, 1, 0.5], ['fromage', 1, 1, 0.2]] },
  c2_rucher: { rolls: [1, 2], items: [['miel', 1, 2, 4], ['cire_abeille', 1, 1, 2]] },
  c2_pecheur: { rolls: [1, 2], items: [['vers', 2, 5, 3], ['corde', 1, 1, 2], ['anguille', 1, 1, 0.8], ['poisson_fume', 1, 1, 1], ['argent', 1, 5, 1]] },
  c2_mine: { rolls: [1, 2], items: [['minerai_cuivre', 1, 3, 4], ['minerai_fer', 1, 2, 2], ['charbon', 1, 3, 3], ['bougie', 1, 1, 2], ['geode', 1, 1, 0.4]] },
  c2_glaciere: { rolls: [1, 2], items: [['cidre', 1, 1, 2], ['vin', 1, 1, 1], ['sel', 1, 2, 2], ['bougie', 1, 1, 1], ['tesson', 1, 1, 1]] },
  c2_pigeons: { rolls: [1, 2], items: [['plume', 1, 3, 4], ['oeuf', 1, 1, 1], ['plume_noire', 1, 1, 1]] },
  c2_sel: { rolls: [1, 1], items: [['sel', 1, 3, 1]] },
  // trésors d'une fois
  c2_t_modeste: { rolls: [2, 3], items: [['vieille_piece', 1, 2, 4], ['argent', 10, 40, 4], ['tesson', 1, 2, 3], ['figurine', 1, 1, 1], ['bijou', 1, 1, 0.5], ['image_pieuse', 1, 1, 1], ['couteau_poche', 1, 1, 0.8]] },
  c2_t_sacre: { rolls: [2, 3], items: [['bougie', 2, 4, 4], ['image_pieuse', 1, 2, 3], ['vieille_piece', 1, 2, 3], ['relique', 1, 1, 0.5], ['bijou', 1, 1, 0.4], ['argent', 5, 30, 2], ['eau_benite', 1, 1, 1]] },
  c2_t_montagne: { rolls: [2, 3], items: [['vieille_piece', 1, 3, 3], ['bijou', 1, 1, 1], ['gemme', 1, 1, 0.6], ['lingot_or', 1, 1, 0.6], ['argent', 20, 60, 3], ['edelweiss', 1, 2, 2]] },
  c2_t_enfant: { rolls: [2, 3], items: [['bille', 1, 4, 4], ['figurine', 1, 1, 2], ['couteau_poche', 1, 1, 1], ['vieille_piece', 1, 1, 1], ['plume', 1, 3, 2]] },
  c2_t_puits: { rolls: [1, 2], items: [['bijou', 1, 1, 1], ['vieille_piece', 1, 3, 3], ['tesson', 1, 2, 2], ['argent', 5, 25, 2], ['cuillere_argent', 1, 1, 1]] },
  c2_t_offrande: { rolls: [1, 2], items: [['vieille_piece', 1, 1, 3], ['image_pieuse', 1, 1, 3], ['bougie', 1, 2, 2], ['bijou', 1, 1, 0.3], ['argent', 1, 10, 3], ['meche_cheveux', 1, 1, 1]] },
  c2_t_corps: { rolls: [2, 3], items: [['vieille_piece', 1, 3, 3], ['lingot_or', 1, 1, 0.5], ['argent', 20, 80, 3], ['couteau_poche', 1, 1, 2], ['tabac', 1, 1, 2], ['edelweiss', 1, 1, 1]] },
  c2_t_nid: { rolls: [1, 3], items: [['bille', 1, 1, 2], ['vieille_piece', 1, 1, 2], ['plume_aigle', 1, 2, 3], ['bijou', 1, 1, 0.4], ['cuillere_argent', 1, 1, 1], ['os', 1, 2, 2]] },
  c2_t_roche: { rolls: [1, 2], items: [['silex', 1, 3, 4], ['os', 1, 2, 3], ['tesson', 1, 1, 2], ['fossile', 1, 1, 0.5], ['vieille_piece', 1, 1, 0.8]] },
  c2_t_histoire: { rolls: [3, 4], items: [['bijou', 1, 2, 3], ['vieille_piece', 2, 4, 4], ['lingot_or', 1, 1, 1.5], ['argent', 40, 120, 3], ['relique', 1, 1, 0.4], ['cuillere_argent', 1, 2, 1]] },
});

// ---------------------------------------------------------------- les noms (article compris)
const C2_NOMS = {
  croix_peste: ['la croix de la Peste', 'la croix des Pestiférés', 'la croix Saint-Roch', 'la croix des Quarante'],
  chapelle_ruine: ['la chapelle Saint-Genès', 'la chapelle Sainte-Radegonde', 'la chapelle des Pénitents', 'la chapelle Saint-Hubert', 'la chapelle Saint-Loup'],
  oratoire: ['l’oratoire Saint-Roch', 'l’oratoire de la Vierge noire', 'l’oratoire des Moissons', 'l’oratoire Saint-Christophe', 'l’oratoire des Voyageurs'],
  tombe_isolee: ['la tombe du Colporteur', 'la tombe de l’Étranger', 'la tombe des Deux Sœurs', 'la tombe de l’Enfant', 'la tombe du Soldat', 'la tombe sans nom'],
  lanterne_morts: ['la lanterne des morts', 'le fanal des morts'],
  gibet: ['les fourches de Valmont', 'le gibet', 'les fourches patibulaires'],
  menhir: ['la pierre Levée', 'la pierre du Loup', 'la Quenouille', 'le Grand Caillou', 'la pierre Fiche', 'la pierre qui Pleure'],
  cromlech: ['le cercle des Sept', 'les Danseuses', 'les Pierres Folles', 'la Ronde des Fées'],
  pierre_cupules: ['la pierre aux Écuelles', 'la pierre des Fées', 'la pierre à Cupules'],
  dolmen_petit: ['la Cabane des Fées', 'la Pierre Couverte', 'le Tombeau du Géant', 'la Table du Diable'],
  pierre_branlante: ['la pierre Branlante', 'la pierre qui Vire', 'la Roche Tremblante'],
  borne_ancienne: ['la borne de Valmont', 'la borne aux Trois Seigneurs', 'la borne du Roi', 'la borne de Montrevel'],
  loge_charbonnier: ['la loge des charbonniers', 'la loge aux Corbeaux', 'la loge des Bons Cousins'],
  four_chaux: ['le four à chaux', 'le vieux four à chaux', 'le four Barraud'],
  cabane_bucheron: ['la cabane du bûcheron', 'la cabane des Scieurs', 'la cabane du Fendeur'],
  bergerie_ruine: ['la bergerie ruinée', 'le parc aux Brebis', 'la jasse abandonnée'],
  borie: ['la borie', 'la cabane de pierre sèche', 'la cabane du Berger'],
  affut: ['l’affût du chasseur', 'le mirador aux Cerfs', 'l’affût des Sangliers'],
  cabane_perchee: ['la cabane dans l’arbre', 'la cabane perchée'],
  glaciere: ['la glacière', 'la glacière des moines', 'la glacière du château'],
  puits_perdu: ['le puits perdu', 'le puits des Sept', 'le puits sans eau', 'le puits aux Vœux'],
  moulin_ruine: ['le moulin brûlé', 'le moulin des Trois Vents', 'le moulin de la Butte'],
  tour_ruine: ['la tour brisée', 'la tour du Guet', 'la tour aux Corneilles'],
  camp_abandonne: ['un bivouac abandonné', 'le camp des Rouliers', 'un camp abandonné'],
  charrette_abandonnee: ['la charrette abandonnée', 'la charrette du Rémouleur'],
  galerie_prospecteur: ['la galerie du prospecteur', 'le trou aux Mineurs', 'la galerie murée'],
  source_sacree: ['la fontaine Saint-Martin', 'la source aux Ex-voto', 'la fontaine aux Fièvres', 'la fontaine Sainte-Agathe'],
  arbre_offrandes: ['l’arbre aux Clous', 'l’arbre à loques', 'le chêne aux Rubans', 'l’arbre aux Vœux'],
  rucher: ['le rucher des moines', 'le mur aux Abeilles'],
  jardin_clos: ['le jardin du Notaire', 'le jardin clos', 'le jardin du Cadran'],
  pigeonnier: ['le pigeonnier', 'la fuie du château', 'le colombier'],
  cairn_sommet: ['le cairn du sommet', 'le cairn des Marcheurs'],
  croix_col: ['la croix du col', 'la croix des Passants'],
  croix_avalanche: ['la croix de l’Avalanche', 'la croix des Arnaud'],
  abri_sous_roche: ['l’abri sous roche', 'la Baume', 'la Baume aux Mains'],
  trou_souffleur: ['le Souffleur', 'le trou qui Parle', 'le trou du Vent'],
  rocher_aigle: ['le rocher de l’Aigle', 'le Nid'],
  pierre_sel: ['les pierres à sel', 'la pierre à sel'],
  rocher_marques: ['le rocher aux Marques', 'la pierre des Familles'],
  corps_gele: ['le dormeur de glace'],
  barque_echouee: ['la barque échouée', 'la barque du Passeur'],
  ponton_ruine: ['le vieux ponton', 'la jetée cassée'],
  maison_forestiere: ['la maison forestière', 'la maison du Garde des bois'],
  fosse_loups: ['la fosse aux loups', 'la louvière'],
  ferme_brulee: ['la ferme brûlée', 'la ferme Chabert'],
  calvaire_trois: ['la pierre aux trois croix', 'le calvaire des Trois'],
  poteau_dame: ['le poteau de la Dame', 'la Dame des roseaux'],
  refuge_ruine: ['le refuge écroulé', 'la cabane des Marcheurs', 'l’abri des Six'],
  cache_contrebandiers: ['la cheminée des contrebandiers', 'la fente aux Ballots'],
  signal_geodesique: ['le signal de la carte', 'le signal des ingénieurs', 'la mire'],
};

// ---------------------------------------------------------------- le catalogue
// mil : milieux (milieuAt) ; alt : hauteur au-dessus de l'eau ; r : emprise ; plat : dénivelé toléré sur l'emprise ;
// w : poids ; req : 'arbre' (un grand arbre tout près), 'adosse' (une pente derrière), 'eau' (l'eau tout près),
// 'sommet' (un point haut) ; build(C) : la construction (C : outils, voir c2Ctx)
const C2_MIL = {
  ouvert: ['pres', 'lande', 'alpage', 'combe'], bois: ['foret', 'bouleaux', 'sapiniere'], eau: ['berges', 'marais', 'riviere'],
  haut: ['alpage', 'rochers', 'neiges'], roc: ['rochers', 'neiges'],
};
const c2Mil = (...g) => new Set(g.flatMap((k) => C2_MIL[k] || [k]));
const C2_TYPES = {
  // ------------------------------------------------ croix, chapelles, tombes
  croix_peste: { mil: c2Mil('ouvert', 'bois'), alt: [0.8, 70], r: 5, plat: 2.5, w: 1, build(C) {
    C.plat(3.4, 4.6, 3); C.net(6);
    C.bl(0, -0.7, 0, 2.6, 1.0, 2.6, M_MOSSY); C.bl(0, 0.3, 0, 1.8, 0.35, 1.8, M_MOSSY); C.bl(0, 0.65, 0, 1.1, 0.35, 1.1, M_STONE);
    C.pr('c2_croix_pierre', 0, 1.0, 0, 0, { v: 0 });
    C.bl(0, -0.4, -3.3, 4.4, 0.62, 2.6, M_DIRT, 0, 1);
    for (let k = 0; k < 5; k++) C.pt('croix_bois', -1.7 + k * 0.85, -3.3 + (k % 2) * 0.35, (C.rnd() - 0.5) * 0.4, null, 0.55, 0.25);
    C.pr('c2_bougies', 0.2, 1.0, 0.62, 0, { q: 'morts' });
    C.lire(0, 0.9, 1.25, 'Lire le socle', 'croix_peste');
  } },
  chapelle_ruine: { mil: c2Mil('ouvert', 'bois'), alt: [1, 55], r: 9, plat: 2.2, w: 1.1, build(C) {
    const W = 6.4, D = 9.6, t = 0.6;
    C.plat(W / 2 + 1.5, D / 2 + 1.5, 4); C.net(10);
    C.dalle(W / 2, D / 2, M_COBBLE);
    C.bl(0, -0.8, -D / 2, W + t, 5.6, t, M_MOSSY);
    C.bl(0, 4.8, -D / 2, t, 1.9, W + t, M_MOSSY, Math.PI / 2, 1);
    C.bl(-W / 2, -0.8, 0, t, 4.2, D, M_MOSSY);
    C.bl(W / 2, -0.8, -D / 4, t, 3.3, D / 2, M_MOSSY); C.bl(W / 2, -0.8, D / 4, t, 1.5, D / 2, M_MOSSY);
    C.bl(-2.25, -0.8, D / 2, 2.1, 4.4, t, M_MOSSY); C.bl(2.25, -0.8, D / 2, 2.1, 4.4, t, M_MOSSY); C.bl(0, 2.5, D / 2, 2.4, 1.1, t, M_MOSSY);
    C.bl(-0.75, 3.6, D / 2, 0.45, 1.5, t, M_STONE); C.bl(0.75, 3.6, D / 2, 0.45, 1.5, t, M_STONE); C.bl(0, 5.1, D / 2, 1.95, 0.9, t + 0.1, M_STONE, Math.PI / 2 * 0, 0);
    C.bl(0.9, 0.1, -0.6, 0.26, 0.26, 5.8, M_LOGS, 0.35); C.bl(-1.1, 0.05, 1.8, 0.26, 0.26, 4.4, M_LOGS, -0.9);
    C.bl(W / 2 + 0.9, -0.3, 1.8, 1.3, 0.8, 1.1, M_MOSSY, 0.5); C.bl(W / 2 + 0.5, -0.3, 3.1, 0.9, 0.6, 0.8, M_MOSSY, 1.1);
    C.pr('autel', 0, 0, -D / 2 + 1.25, 0);
    C.pr('c2_cloche_fendue', 2.0, 0, -D / 2 + 1.7, 0.7);
    C.pr('c2_bougies', -0.5, 1.0, -D / 2 + 1.2, 0, { q: 'chapelle' });
    C.lire(0, 2.2, D / 2 + 0.55, 'Lire le linteau', 'chapelle');
    C.butin(0, 1.0, -D / 2 + 1.95, 'c2_t_sacre', { un: 1, label: 'Soulever la dalle de l’autel', titre: 'Sous la dalle de l’autel' });
    C.it('cloche', 2.0, 0.7, -D / 2 + 2.3, 'Frapper la cloche fêlée');
  } },
  oratoire: { mil: c2Mil('ouvert', 'bois', 'haut'), alt: [0.8, 140], r: 3, plat: 2.5, w: 1, build(C) {
    C.net(3);
    C.pt('c2_oratoire', 0, 0, 0, { v: C.i % 3 }, 1, -0.15);
    for (let k = 0; k < 4; k++) C.ob(C.rnd() < 0.5 ? 'daisies' : 'cornflower', (C.rnd() - 0.5) * 2.4, 0.9 + C.rnd() * 0.8);
    C.it('prier', 0, 1.1, 0.75, 'Se recueillir devant l’oratoire', { txt: C.texte('oratoire') });
  } },
  tombe_isolee: { mil: c2Mil('ouvert', 'bois', 'haut'), alt: [0.8, 110], r: 3, plat: 2, w: 1, build(C) {
    C.plat(1.6, 1.8, 2); C.net(3);
    C.pr('c2_tombe', 0, 0, 0, 0, { v: C.i % 3, q: C.jourAuHasard() });
    C.lire(0, 0.7, 1.05, 'Lire l’épitaphe', 'tombe');
    if (C.rnd() < 0.5) C.ob('if', -2.6, -1.8, 6.5);
  } },
  lanterne_morts: { mil: c2Mil('ouvert', 'bois'), alt: [0.8, 50], r: 5, plat: 2.2, w: 0.7, build(C) {
    C.plat(2.4, 2.4, 3); C.net(5);
    C.bl(0, -0.6, 0, 1.6, 0.85, 1.6, M_STONE);
    C.pr('c2_lanterne_morts', 0, 0.25, 0, 0, { lit: 0 });
    for (const [lx, lz] of [[-2.6, -1.2], [2.4, -1.6], [-1.8, 2.4]]) C.pt('tombe', lx, lz, (C.rnd() - 0.5) * 0.5 + Math.atan2(-lx, -lz));
    C.it('lanterne', 0, 1.1, 1.05, 'Regarder la lanterne des morts');
  } },
  gibet: { mil: c2Mil('ouvert'), alt: [2, 60], r: 5, plat: 2.5, w: 0.6, req: 'sommet', build(C) {
    C.plat(3.2, 2.2, 3); C.net(5);
    C.bl(0, -0.6, 0, 4.4, 0.7, 1.6, M_MOSSY);
    for (const s of [-1.6, 1.6]) { C.bl(s, 0.1, 0, 0.55, 3.5, 0.55, M_MOSSY); C.bl(s, 3.6, 0, 0.7, 0.16, 0.7, M_STONE); }
    C.pr('c2_gibet', 0, 0.1, 0, 0);
    C.lire(1.9, 0.9, 0.95, 'Lire la plaque rongée', 'gibet');
    C.it('creuser', -0.4, 0.35, 1.1, 'Remuer la terre au pied des fourches', { table: 'c2_t_roche', pelle: 1 });
  } },
  // ------------------------------------------------ pierres anciennes
  menhir: { mil: c2Mil('ouvert', 'bois', 'haut'), alt: [0.8, 120], r: 3, plat: 4, w: 1, build(C) {
    C.net(3);
    const s = 0.85 + C.rnd() * 0.5, grave = C.rnd() < 0.55;
    C.pt('c2_menhir', 0, 0, C.rnd() * 0.6 - 0.3, { v: grave ? 1 : 2 }, s, -0.35);
    if (grave) C.insSur(0, 1.15, 0.5 * s + 0.35, 'gorrain') || C.lire(0, 1.2, 0.8, 'Regarder la pierre', 'menhir');
    else C.lire(0, 1.2, 0.8, 'Regarder la pierre', 'menhir');
  } },
  cromlech: { mil: c2Mil('ouvert', 'haut'), alt: [1, 120], r: 8, plat: 2.8, w: 0.8, build(C) {
    C.plat(6, 6, 3); C.net(8);
    const n = 7 + ((C.rnd() * 5) | 0), R = 4.6 + C.rnd() * 1.2;
    for (let k = 0; k < n; k++) { const a = k / n * TAU + C.rnd() * 0.2, s = 0.42 + C.rnd() * 0.3; C.pt('c2_menhir', Math.cos(a) * R, Math.sin(a) * R, a, { v: 0 }, s, -0.25); }
    C.bl(0, -0.4, 0, 2.0, 0.75, 1.3, M_ROCK, C.rnd());
    C.insSur(0, 0.6, 1.0, 'gorrain') || C.lire(0, 0.5, 1.0, 'Regarder la pierre du milieu', 'menhir');
    C.pr('c2_lueur', 0, 0, 0, 0, { q: 'cercle', R });
  } },
  pierre_cupules: { mil: c2Mil('ouvert', 'haut', 'roc'), alt: [1, 160], r: 3, plat: 5, w: 0.8, build(C) {
    C.net(3);
    const y = C.minSol(1.6);
    C.blY(0, y - 0.5, 0, 2.6, 1.05, 1.9, M_ROCK, 0.2);
    C.prY('c2_cupules', 0, y + 0.55, 0, 0.2, { n: 5 + C.i % 5 });
    C.insSur(0, y + 0.6 - C.f.y, 1.15, 'gorrain') || C.lire(0, y + 0.6 - C.f.y, 1.15, 'Regarder les creux de la pierre', 'cupules');
  } },
  dolmen_petit: { mil: c2Mil('ouvert', 'bois'), alt: [1, 60], r: 4, plat: 2.5, w: 0.7, build(C) {
    C.plat(2.6, 2.2, 3); C.net(5);
    C.pr('dolmen', 0, -0.1, 0, 0, null, 0.72);
    C.butin(0, 0.3, 0.2, 'c2_t_modeste', { un: 1, label: 'Glisser la main sous la table de pierre', titre: 'Sous la table de pierre' });
    if (C.rnd() < 0.5) C.insSur(1.25, 0.9, 1.0, 'gorrain');
  } },
  pierre_branlante: { mil: c2Mil('ouvert', 'bois', 'haut', 'roc'), alt: [1, 150], r: 3, plat: 3.5, w: 0.7, build(C) {
    C.net(4);
    const y = C.minSol(1.5);
    C.blY(0, y - 0.6, 0, 2.4, 0.9, 2.0, M_ROCK, 0.3);
    C.prY('c2_branlante', 0, y + 0.3, 0, 0, { a: 0 });
    C.it('pousser', 0, y + 1.3 - C.f.y, 1.3, 'Pousser la grosse pierre');
    C.butin(0.95, y + 0.35 - C.f.y, 1.05, 'c2_t_modeste', { un: 1, label: 'Fouiller le creux sous la pierre', titre: 'Sous la pierre', apres: 'bascule' });
  } },
  borne_ancienne: { mil: c2Mil('ouvert', 'bois', 'haut'), alt: [0.8, 150], r: 2, plat: 4, w: 0.8, build(C) {
    C.net(2);
    C.pt('c2_borne', 0, 0, 0, { v: C.i % 4 }, 1, -0.2);
    if (C.rnd() < 0.35) C.insSur(0, 0.7, 0.45, 'aelin') || C.lire(0, 0.7, 0.55, 'Lire la borne', 'borne');
    else C.lire(0, 0.7, 0.55, 'Lire la borne', 'borne');
  } },
  // ------------------------------------------------ métiers, abris
  loge_charbonnier: { mil: c2Mil('bois'), alt: [1, 60], r: 6, plat: 2.5, w: 1, build(C) {
    C.plat(4.5, 4.5, 3); C.net(7); C.sol(4.5, M_DIRT, 2);
    C.bl(-0.8, -0.3, -1.2, 3.4, 3.4, 3.4, M_LOGS, 0.2, 3);
    C.bl(-0.8 + 0.3, 0, 0.45, 0.9, 1.3, 0.1, M_DARK, 0.2);
    C.pr('charbonniere', 3.2, 0, 1.2, 0);
    C.pr('tas_bois', -3.2, 0, 1.4, 0.3);
    C.pr('sac', 1.2, 0, 2.0, 0.5); C.pr('sac', 1.6, 0, 2.3, 1.4);
    C.cendres(0.6, 3.4);
    C.butin(1.4, 0.5, 2.15, 'c2_charbonnier', { rf: 5, label: 'Fouiller les sacs', titre: 'Les sacs de charbon' });
    C.lettre('charbonnier', 0.5);
  } },
  four_chaux: { mil: c2Mil('ouvert', 'bois'), alt: [2, 70], r: 5, plat: 3, w: 0.8, build(C) {
    C.plat(2.8, 2.8, 3); C.net(6);
    C.bl(0, -1.2, 0, 3.4, 5.0, 3.4, M_PLASTER); C.bl(0, -1.2, 0, 3.4, 5.0, 3.4, M_PLASTER, Math.PI / 4);
    C.bl(0, 3.6, 0, 3.6, 0.3, 3.6, M_STONE, Math.PI / 8);
    C.bl(0, 3.78, 0, 2.3, 0.06, 2.3, M_DARK, Math.PI / 8);
    C.bl(0, 0, 1.74, 1.0, 1.15, 0.06, M_DARK);
    C.bl(0, 1.15, 1.72, 1.4, 0.3, 0.2, M_STONE);
    C.bl(2.9, -0.3, 1.2, 1.5, 0.85, 1.3, M_ROCK, 0.4); C.bl(-2.8, -0.3, 1.5, 1.1, 0.6, 1.0, M_ROCK, 1.2);
    C.lire(1.25, 1.3, 1.9, 'Lire la pierre gravée', 'four_chaux');
  } },
  cabane_bucheron: { mil: c2Mil('bois'), alt: [1, 60], r: 6, plat: 2, w: 1, build(C) {
    const W = 3.6, D = 3.0, t = 0.2, H = 2.3;
    C.plat(3.6, 3.4, 3); C.net(7); C.sol(4, M_DIRT, 2);
    C.bl(0, -0.4, -D / 2, W, H + 0.4, t, M_PLANKS);
    C.bl(-W / 2, -0.4, 0, t, H + 0.4, D, M_PLANKS); C.bl(W / 2, -0.4, 0, t, H + 0.4, D, M_PLANKS);
    C.bl(-1.15, -0.4, D / 2, 1.3, H + 0.4, t, M_PLANKS); C.bl(1.15, -0.4, D / 2, 1.3, H + 0.4, t, M_PLANKS); C.bl(0, 1.9, D / 2, 1.0, 0.4, t, M_PLANKS);
    C.bl(0, 0, 0, W - 0.1, 0.06, D - 0.1, M_PLANKS);
    C.bl(0, H, 0, W + 0.7, 1.1, D + 0.7, M_THATCH, 0, 1);
    C.pr('paillasse', -0.9, 0.06, -0.6, Math.PI / 2);
    C.pr('coffre_outils', 1.1, 0.06, -0.95, Math.PI);
    C.pr('c2_billot', 2.5, 0, 2.3, 0.3);
    C.pr('tas_bois', -2.7, 0, 0.6, Math.PI / 2);
    C.pr('c2_chevalet', 1.2, 0, 3.4, 0.2);
    C.butin(1.1, 0.6, -0.45, 'c2_bucheron', { rf: 5, label: 'Ouvrir le coffre à outils', titre: 'Le coffre du bûcheron' });
    C.lettre('bucheron', 0.6);
  } },
  bergerie_ruine: { mil: c2Mil('ouvert'), alt: [2, 120], r: 8, plat: 2.6, w: 0.9, build(C) {
    C.plat(5.8, 5.8, 3); C.net(8);
    const R = 5.2, n = 14;
    for (let k = 0; k < n; k++) {
      const a = k / n * TAU; if (k === 0) continue;
      const h = k % 5 === 2 ? 0.45 : 0.9 + (k % 3) * 0.12;
      C.bl(Math.sin(a) * R, -0.4, Math.cos(a) * R, 2.35, h + 0.4, 0.6, M_MOSSY, a);
    }
    C.bl(-1.8, -0.4, -3.3, 3.2, 2.2, 0.5, M_MOSSY); C.bl(-3.3, -0.4, -2.2, 0.5, 2.0, 2.4, M_MOSSY);
    C.bl(-1.9, 1.7, -2.3, 3.4, 0.18, 2.4, M_SLATE, 0.08);
    C.pr('ossements', 1.2, 0, -1.0, 0.8); C.pr('botte_foin', -2.0, 0, -1.8, 0.2);
    C.butin(-2.6, 0.5, -1.5, 'c2_berger', { rf: 6, label: 'Fouiller sous l’appentis', titre: 'Sous l’appentis' });
    C.lettre('berger', 0.4);
  } },
  borie: { mil: c2Mil('ouvert', 'rochers'), alt: [1, 120], r: 4, plat: 2.2, w: 0.8, build(C) {
    C.plat(2.8, 2.8, 3); C.net(5);
    const L = [[3.8, 1.0], [3.2, 0.8], [2.5, 0.7], [1.7, 0.6], [0.9, 0.5]];
    let y = -0.4; L.forEach(([s, h], k) => { C.bl(0, y, 0, s, h + (k ? 0 : 0.4), s, M_MOSSY, k * 0.4); y += h + (k ? 0 : 0.4) - 0.02; });
    C.bl(0, 0, 1.92, 0.75, 1.1, 0.06, M_DARK);
    C.butin(1.4, 0.35, 1.45, 'c2_t_modeste', { un: 1, label: 'Desceller la pierre branlante du mur', titre: 'Derrière la pierre descellée', cache: 1 });
  } },
  affut: { mil: c2Mil('bois', 'ouvert'), alt: [1, 70], r: 3, plat: 3, w: 0.8, build(C) {
    C.net(3);
    const H = 3.2, S = 1.6;
    for (const [lx, lz] of [[-S / 2, -S / 2], [S / 2, -S / 2], [-S / 2, S / 2], [S / 2, S / 2]]) C.bl(lx, -0.6, lz, 0.2, H + 1.6, 0.2, M_LOGS);
    C.bl(0, H, 0, S + 0.4, 0.14, S + 0.4, M_PLANKS);
    for (const s of [-1, 1]) { C.bl(s * (S / 2 + 0.1), H + 0.14, 0, 0.08, 0.7, S + 0.3, M_PLANKS); C.bl(0, H + 0.14, s * (S / 2 + 0.1), S + 0.3, 0.7, 0.08, M_PLANKS); }
    C.bl(0, H + 1.4, 0, S + 0.8, 0.5, S + 0.8, M_THATCH, 0, 1);
    C.pr('echelle', 0, -0.1, S / 2 + 0.45, 0, { h: H + 0.3 });
    const [bx, bz] = C.at(0, S / 2 + 0.95), [tx, tz] = C.at(0, 0);
    C.B.inter('ladder', 'c2:' + C.i + ':haut', bx, C.f.y + 1.0, bz, 'Grimper à l’affût', { to: [tx, C.f.y + H + 0.16, tz] });
    C.B.inter('ladder', 'c2:' + C.i + ':bas', tx + (bx - tx) * 0.3, C.f.y + H + 0.9, tz + (bz - tz) * 0.3, 'Redescendre', { to: [bx, C.f.y, bz] });
    C.pr('c2_boite', -0.45, H + 0.14, -0.5, 0.4);
    C.butin(-0.45, H + 0.5, -0.5, 'c2_chasseur', { rf: 6, label: 'Ouvrir la boîte du chasseur', titre: 'La boîte du chasseur' });
    C.lettre('chasseur', 0.7);
  } },
  cabane_perchee: { mil: c2Mil('bois', 'pres'), alt: [1, 50], r: 4, plat: 3, w: 0.7, req: 'arbre', build(C) {
    const H = 3.4, S = 2.6;
    C.bl(0, H, 0, S, 0.14, S, M_PLANKS);
    for (const s of [-1, 1]) C.bl(s * (S / 2 - 0.05), H + 0.14, 0, 0.1, 1.2, S, M_PLANKS);
    C.bl(0, H + 0.14, -S / 2 + 0.05, S, 1.2, 0.1, M_PLANKS);
    C.bl(0.75, H + 0.14, S / 2 - 0.05, 1.1, 1.2, 0.1, M_PLANKS);
    C.bl(0, H + 1.34, 0, S + 0.5, 0.8, S + 0.5, M_PLANKS, 0, 1);
    for (const [lx, lz] of [[-S / 2 + 0.1, S / 2 - 0.1], [S / 2 - 0.1, S / 2 - 0.1]]) C.bl(lx, -0.4, lz, 0.14, H + 0.4, 0.14, M_LOGS);
    C.pr('echelle', -0.55, -0.1, S / 2 + 0.25, 0, { h: H + 0.3 });
    const [bx, bz] = C.at(-0.55, S / 2 + 0.8), [tx, tz] = C.at(-0.45, 0.35);
    C.B.inter('ladder', 'c2:' + C.i + ':haut', bx, C.f.y + 1.0, bz, 'Grimper à la cabane', { to: [tx, C.f.y + H + 0.16, tz] });
    C.B.inter('ladder', 'c2:' + C.i + ':bas', tx + (bx - tx) * 0.35, C.f.y + H + 0.9, tz + (bz - tz) * 0.35, 'Redescendre', { to: [bx, C.f.y, bz] });
    C.pr('c2_boite', 0.7, H + 0.14, -0.7, 2.6, { v: 1 });
    C.butin(0.7, H + 0.5, -0.7, 'c2_t_enfant', { un: 1, label: 'Ouvrir la boîte en fer-blanc', titre: 'La boîte en fer-blanc' });
    C.lettre('enfant', 1);
  } },
  glaciere: { mil: c2Mil('bois', 'ouvert'), alt: [2, 60], r: 5, plat: 3, w: 0.6, build(C) {
    C.plat(3.2, 3.2, 3); C.net(6);
    C.bl(0, -1.0, 0, 5.0, 1.9, 5.0, M_MOSSY); C.bl(0, 0.9, 0, 4.0, 0.9, 4.0, M_MOSSY, Math.PI / 4); C.bl(0, 1.8, 0, 2.6, 0.6, 2.6, M_MOSSY); C.bl(0, 2.4, 0, 1.2, 0.35, 1.2, M_MOSSY, Math.PI / 4);
    C.bl(0, -0.4, 2.7, 1.8, 2.1, 0.5, M_STONE); C.bl(0, 0, 2.96, 0.9, 1.4, 0.04, M_DARK);
    C.pr('c2_porte_bois', 0.48, 0, 3.05, -1.1);
    C.lire(0, 1.75, 3.1, 'Lire la pierre du linteau', 'glaciere');
    C.butin(0, 0.5, 2.6, 'c2_glaciere', { rf: 7, label: 'Descendre les marches, à tâtons', titre: 'Au fond de la glacière' });
  } },
  puits_perdu: { mil: c2Mil('ouvert', 'bois'), alt: [1, 60], r: 3, plat: 1.8, w: 0.8, build(C) {
    C.plat(2, 2, 2); C.net(3);
    C.B.well(C.f);
    C.pr('c2_seau', 0.62, 0.9, 0.1, 0.4);
    C.it('puits', 0, 1.1, 1.15, 'Se pencher au-dessus du puits');
    C.butin(0.62, 1.1, 0.1, 'c2_t_puits', { un: 1, label: 'Remonter le seau', titre: 'Au fond du seau', seau: 1 });
  } },
  moulin_ruine: { mil: c2Mil('ouvert'), alt: [2, 60], r: 6, plat: 2.6, w: 0.7, req: 'sommet', build(C) {
    C.plat(3.8, 3.8, 4); C.net(7);
    C.bl(0, -1, 0, 4.4, 5.6, 4.4, M_MOSSY); C.bl(0, -1, 0, 4.4, 5.3, 4.4, M_MOSSY, Math.PI / 4);
    C.bl(0, 4.6, 0, 3.6, 2.2, 3.6, M_MOSSY, Math.PI / 8); C.bl(0.9, 6.8, 0.4, 1.8, 1.2, 1.4, M_MOSSY, 0.3); C.bl(-1.0, 6.8, -0.7, 1.1, 0.7, 1.4, M_MOSSY, 0.9);
    C.bl(-0.6, 7.5, 0.2, 2.6, 0.22, 0.22, M_LOGS, 0.5); C.bl(0.4, 7.4, -0.5, 0.2, 0.2, 2.2, M_LOGS, 0.2);
    C.bl(0, 0, 2.22, 0.95, 1.9, 0.06, M_DARK); C.bl(2.22, 2.6, 0, 0.06, 0.7, 0.5, M_DARK); C.bl(-1.8, 5.0, 0, 0.06, 0.6, 0.45, M_DARK);
    C.pr('c2_ailes_brisees', -3.4, 0, 1.6, 0.6);
    C.pr('c2_meule_pierre', 2.6, 0, 1.4, -0.4);
    C.lettre('moulin', 0.6);
    C.butin(0.6, 0.5, 1.4, 'c2_abandon', { rf: 7, label: 'Fouiller les sacs éventrés', titre: 'Les sacs du meunier' });
  } },
  tour_ruine: { mil: c2Mil('ouvert', 'rochers'), alt: [2, 100], r: 5, plat: 3, w: 0.7, req: 'sommet', build(C) {
    C.plat(3.4, 3.4, 4); C.net(6);
    const S = 4.2, t = 0.7, H = 7;
    C.bl(0, -1, -S / 2 + t / 2, S, H + 1, t, M_MOSSY); C.bl(-S / 2 + t / 2, -1, 0, t, H - 1.2 + 1, S - 2 * t, M_MOSSY); C.bl(S / 2 - t / 2, -1, 0, t, H + 0.6, S - 2 * t, M_MOSSY);
    C.bl(-1.25, -1, S / 2 - t / 2, 1.7, H - 2.5 + 1, t, M_MOSSY); C.bl(1.25, -1, S / 2 - t / 2, 1.7, H - 0.8 + 1, t, M_MOSSY); C.bl(0, 2.2, S / 2 - t / 2, 0.9, 1.2, t, M_MOSSY);
    C.bl(0, H - 0.4, -0.4, S - 2 * t, 0.2, S - 2 * t - 0.9, M_PLANKS);
    C.bl(2.8, -0.3, 2.0, 1.4, 0.7, 1.2, M_MOSSY, 0.7);
    C.pr('echelle', 0.6, 0, 0.9, 0, { h: H - 0.2 });
    const [bx, bz] = C.at(0.6, 0.35), [tx, tz] = C.at(0, -0.6);
    C.B.inter('ladder', 'c2:' + C.i + ':haut', bx, C.f.y + 1.0, bz, 'Grimper en haut de la tour', { to: [tx, C.f.y + H - 0.2, tz] });
    C.B.inter('ladder', 'c2:' + C.i + ':bas', tx, C.f.y + H + 0.6, tz + 0.001, 'Redescendre', { to: [bx, C.f.y, bz] });
    C.lire(-0.8, H + 0.4, -1.1, 'Regarder les graffitis du parapet', 'tour');
  } },
  camp_abandonne: { mil: c2Mil('ouvert', 'bois', 'alpage', 'combe'), alt: [0.8, 90], r: 6, plat: 2, w: 1, build(C) {
    C.plat(4, 4, 2); C.net(6);
    C.pr('tente', -1.2, 0, -1.8, 0.3);
    C.cendres(1.5, 0.6);
    C.pr('caisses', 2.8, 0, -1.4, 0.4, { v: 1 }); C.pr('sac', -2.8, 0, 0.8, 1.2); C.pr('tonneau_vieux', 3.0, 0, 0.4, 0);
    C.butin(2.8, 0.7, -0.8, 'c2_abandon', { rf: 7, label: 'Fouiller les caisses', titre: 'Les caisses du bivouac' });
    C.lettre('camp', 0.8);
  } },
  charrette_abandonnee: { mil: c2Mil('ouvert', 'bois'), alt: [0.8, 60], r: 4, plat: 2.5, w: 0.8, build(C) {
    C.net(4);
    C.pt('charrette_renversee', 0, 0, 0.2);
    C.pt('caisse', 2.0, 1.2, 0.7); C.pt('tonneau_vieux', -1.6, 1.8, 0.2); C.pt('sac', 1.1, -1.9, 1.4);
    C.butin(1.4, 0.8, 1.0, 'c2_abandon', { rf: 7, label: 'Fouiller le chargement', titre: 'Le chargement de la charrette' });
    C.lettre('charrette', 0.7);
  } },
  galerie_prospecteur: { mil: c2Mil('ouvert', 'rochers', 'bois'), alt: [4, 160], r: 5, plat: 3.5, w: 0.7, req: 'adosse', build(C) {
    C.net(6);
    C.pt('bouche_mine', 0, -0.6, 0, null, 0.9, -0.2);
    C.pt('eboulis', 0, -1.4, 0, { p: 1 }, 0.7);
    C.pt('rails', 0, 1.6, 0); C.pt('wagonnet', 0.2, 2.6, 0.08);
    C.pt('caisses', -1.8, 1.8, 0.3, { v: 0 });
    C.butin(-1.6, 0.8, 2.4, 'c2_mine', { rf: 6, label: 'Fouiller les caisses du prospecteur', titre: 'Les caisses du prospecteur' });
    C.lettre('prospecteur', 0.7);
  } },
  source_sacree: { mil: c2Mil('ouvert', 'bois'), alt: [0.8, 60], r: 4, plat: 2, w: 0.9, build(C) {
    C.plat(2.6, 2.6, 2); C.net(4);
    C.bl(0, -0.5, 0, 2.4, 0.85, 0.35, M_MOSSY); C.bl(0, -0.5, -1.6, 2.4, 0.85, 0.35, M_MOSSY);
    C.bl(-1.05, -0.5, -0.8, 0.35, 0.85, 1.25, M_MOSSY); C.bl(1.05, -0.5, -0.8, 0.35, 0.85, 1.25, M_MOSSY);
    C.bl(0, 0.2, -0.8, 1.75, 0.06, 1.25, M_WATERB);
    C.bl(0, -0.3, -2.3, 1.5, 1.9, 0.7, M_MOSSY); C.bl(0, 0.6, -1.98, 0.5, 0.6, 0.08, M_DARK);
    C.pr('statue_saint', 0, 0.62, -2.04, 0, null, 0.28);
    C.pr('rubans', 2.2, 0, -1.4, -0.4);
    C.pr('c2_exvoto', -1.4, 0.35, -2.3, 0.3);
    C.it('boire', 0, 0.7, 0.35, 'Boire à la source');
    C.it('piece', 0.9, 0.7, 0.35, 'Jeter une pièce dans le bassin');
    C.lire(-0.6, 0.9, -1.9, 'Lire la plaque', 'source');
    if (C.rnd() < 0.6) C.insStele(1.8, -2.1, 'aelin');
    C.butin(0, 0.4, -0.8, 'c2_t_offrande', { un: 1, label: 'Ramasser les pièces du fond', titre: 'Au fond du bassin', sacrilege: 'source' });
  } },
  arbre_offrandes: { mil: c2Mil('ouvert', 'bois'), alt: [0.8, 60], r: 5, plat: 3, w: 0.8, req: 'arbre', build(C) {
    C.net(1.5);
    C.pr('c2_offrandes', 0, 0, 0, 0, { n: 10 + C.i % 7 });
    C.it('lire', 0, 1.4, 1.05, 'Lire les billets noués aux branches', { txt: C.texte('voeux') });
    C.it('nouer', -0.9, 1.1, 0.8, 'Nouer quelque chose aux branches');
    C.it('don', -0.4, 1.5, 0.9, 'Prendre ce qui pend à la branche');
    C.butin(0.9, 1.1, 0.8, 'c2_t_offrande', { un: 1, label: 'Décrocher les offrandes', titre: 'Les offrandes', sacrilege: 'arbre' });
  } },
  rucher: { mil: c2Mil('ouvert', 'bois'), alt: [0.8, 50], r: 5, plat: 2.4, w: 0.6, build(C) {
    C.plat(3.4, 2.2, 3); C.net(5);
    C.bl(0, -0.5, -0.6, 6.4, 2.4, 0.9, M_MOSSY);
    for (let k = 0; k < 4; k++) { C.bl(-2.4 + k * 1.6, 0.5, -0.12, 0.9, 0.9, 0.08, M_DARK); C.pr('c2_ruche_paille', -2.4 + k * 1.6, 0.5, -0.35, 0); }
    C.bl(0, 1.9, -0.35, 6.8, 0.14, 1.4, M_SLATE);
    C.lire(2.9, 1.2, 0.1, 'Lire la pierre gravée', 'rucher');
    C.butin(-0.8, 0.95, 0.35, 'c2_rucher', { rf: 4, label: 'Prendre le miel sauvage', titre: 'Les ruches de paille', abeilles: 1 });
  } },
  jardin_clos: { mil: c2Mil('ouvert'), alt: [0.8, 40], r: 8, plat: 1.8, w: 0.6, build(C) {
    C.plat(6, 6, 3); C.net(7);
    const R = 5.4;
    for (const [x0, z0, x1, z1] of [[-R, -R, R, -R], [R, -R, R, R], [-R, R, -R, -R]]) C.mur(x0, z0, x1, z1, 1.4, 0.45, M_MOSSY);
    C.mur(-R, R, -1.0, R, 1.3, 0.45, M_MOSSY); C.mur(1.0, R, R, R, 1.1, 0.45, M_MOSSY);
    C.pr('c2_cadran', 0, 0, 0, 0);
    C.pr('banc_pierre', 0, 0, -3.8, 0);
    for (const [lx, lz, id] of [[-3.4, -3.3, 'poirier'], [3.5, -3.1, 'prunier'], [-3.6, 2.6, 'bush'], [3.2, 3.0, 'eglantier'], [2.2, -1.5, 'sureau']]) C.ob(id, lx, lz);
    for (let k = 0; k < 8; k++) C.ob(C.rnd() < 0.5 ? 'tallgrass' : 'ortie', (C.rnd() - 0.5) * 9, (C.rnd() - 0.5) * 9);
    C.it('cadran', 0, 1.0, 0.75, 'Regarder le cadran solaire');
    C.cache(0.2, -4.4, 'c2_t_histoire', 'Creuser au pied de la dalle fendue', 'cadran');
  } },
  pigeonnier: { mil: c2Mil('ouvert'), alt: [0.8, 50], r: 4, plat: 2, w: 0.6, build(C) {
    C.plat(2.6, 2.6, 3); C.net(4);
    C.bl(0, -0.8, 0, 3.2, 5.4, 3.2, M_PLASTER); C.bl(0, -0.8, 0, 3.2, 5.4, 3.2, M_PLASTER, Math.PI / 4);
    C.bl(0, 4.6, 0, 3.9, 0.2, 3.9, M_STONE, Math.PI / 8);
    C.bl(0, 4.8, 0, 3.9, 2.0, 3.9, M_ROOF, Math.PI / 8, 3);
    for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; C.bl(Math.sin(a) * 1.62, 3.4, Math.cos(a) * 1.62, 0.22, 0.2, 0.06, M_DARK, a); }
    C.bl(0, 0, 1.62, 0.8, 1.7, 0.06, M_DARK);
    for (let k = 0; k < 3; k++) C.ob('pigeons', (C.rnd() - 0.5) * 6, 2 + C.rnd() * 3);
    C.butin(0, 0.6, 1.3, 'c2_pigeons', { rf: 4, label: 'Fouiller les boulins', titre: 'Les boulins' });
    C.lettre('pigeon', 0.8);
  } },
  // ------------------------------------------------ la montagne
  cairn_sommet: { mil: c2Mil('haut', 'roc', 'ouvert'), alt: [25, 400], r: 3, plat: 6, w: 1.1, req: 'sommet', build(C) {
    C.net(3);
    C.pt('cairn', 0, 0, 0, null, 1.4, -0.2);
    C.pt('c2_boite', 0.5, 0.55, 0.7, { v: 2 }, 1, 0.1);
    C.it('registre', 0.55, 0.5, 0.9, 'Ouvrir la boîte de fer du cairn');
  } },
  croix_col: { mil: c2Mil('haut', 'roc'), alt: [20, 400], r: 3, plat: 5, w: 0.9, build(C) {
    C.net(3);
    C.pt('calvaire', 0, 0, 0, { v: 1 }, 1.1, -0.2);
    C.pt('c2_exvoto', 0.9, 0.6, -0.4, null, 1, 0.2);
    C.lire(0, 0.8, 1.0, 'Lire les ex-voto cloués au socle', 'col');
  } },
  croix_avalanche: { mil: c2Mil('haut', 'roc', 'sapiniere'), alt: [15, 300], r: 3, plat: 5, w: 0.8, build(C) {
    C.net(3);
    C.pt('c2_croix_pierre', 0, 0, 0, { v: 2 }, 0.9, -0.3);
    C.lire(0, 0.7, 0.8, 'Lire les noms gravés', 'avalanche');
  } },
  abri_sous_roche: { mil: c2Mil('haut', 'roc', 'bois'), alt: [3, 250], r: 4, plat: 4, w: 0.8, req: 'adosse', build(C) {
    C.net(5);
    const y = C.minSol(3);
    C.blY(0, y - 1, -2.6, 6.2, 5.2, 1.6, M_ROCK, 0.05); C.blY(-2.7, y - 1, -0.8, 1.4, 3.6, 3.4, M_ROCK, 0.2); C.blY(2.8, y - 1, -0.6, 1.3, 3.2, 3.0, M_ROCK, -0.25);
    C.blY(0, y + 2.4, -0.7, 6.8, 0.9, 4.4, M_ROCK, 0.08);
    C.cendres(0.3, 0.2, y);
    C.prY('peinture', -0.4, y + 0.4, -1.72, 0, { v: C.i % 4 });
    C.prY('ossements', 1.4, y, -0.6, 0.8);
    C.butin(1.3, y + 0.35 - C.f.y, -1.2, 'c2_t_roche', { un: 1, label: 'Fouiller la terre noire du fond', titre: 'Dans la terre noire' });
    if (C.rnd() < 0.5) C.insSur(-1.9, y + 1.2 - C.f.y, 0.95, 'gorrain');
  } },
  trou_souffleur: { mil: c2Mil('haut', 'roc', 'bois', 'ouvert'), alt: [3, 250], r: 3, plat: 5, w: 0.6, build(C) {
    C.net(3);
    const y = C.minSol(2);
    C.blY(0, y - 0.3, 0, 1.3, 0.12, 1.1, M_DARK, 0.3);
    for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; C.blY(Math.cos(a) * 1.1, y - 0.5, Math.sin(a) * 1.0, 0.9, 0.9 + (k % 3) * 0.2, 0.8, M_ROCK, a); }
    C.it('souffle', 0, y + 0.4 - C.f.y, 0.9, 'Approcher l’oreille du trou');
  } },
  rocher_aigle: { mil: c2Mil('haut', 'roc'), alt: [15, 400], r: 3, plat: 6, w: 0.6, build(C) {
    C.net(3);
    const y = C.minSol(1.5);
    C.blY(0, y - 0.5, 0, 2.2, 2.2, 1.8, M_ROCK, 0.3); C.blY(0.2, y + 1.6, -0.1, 1.5, 0.9, 1.3, M_ROCK, 0.9);
    C.prY('c2_nid', 0.2, y + 2.5, -0.1, 0);
    C.butin(0.2, y + 2.45 - C.f.y, 0.6, 'c2_t_nid', { un: 1, label: 'Fouiller le nid', titre: 'Le nid' });
  } },
  pierre_sel: { mil: c2Mil('haut', 'ouvert'), alt: [15, 200], r: 3, plat: 3, w: 0.5, build(C) {
    C.net(4);
    for (const [lx, lz, a] of [[0, 0, 0.2], [1.8, 0.9, 1.1], [-1.6, 1.2, 2.2]]) C.pt('c2_pierre_sel', lx, lz, a, null, 1, -0.1);
    for (let k = 0; k < 2; k++) C.ob('sheep', (C.rnd() - 0.5) * 12, (C.rnd() - 0.5) * 12);
    C.butin(0, 0.4, 0.6, 'c2_sel', { rf: 5, label: 'Gratter le sel des pierres', titre: 'Le sel des bêtes' });
  } },
  rocher_marques: { mil: c2Mil('haut', 'ouvert', 'roc'), alt: [15, 250], r: 3, plat: 4, w: 0.7, build(C) {
    C.net(3);
    C.pt('c2_marques', 0, 0, 0, { v: C.i % 6 }, 1, -0.3);
    C.it('marques', 0, 1.0, 1.1, 'Regarder les marques gravées');
  } },
  corps_gele: { mil: c2Mil('roc', 'haut'), alt: [70, 500], r: 3, plat: 6, w: 0.35, max: 1, build(C) {
    C.net(3);
    const y = C.minSol(1.2);
    C.blY(0, y - 0.4, -0.9, 1.8, 1.5, 0.9, M_ROCK, 0.1);
    C.prY('c2_gele', 0, y, -0.15, 0);
    C.butin(0, y + 0.6 - C.f.y, 0.5, 'c2_t_corps', { un: 1, label: 'Fouiller les poches gelées', titre: 'Les poches du mort', mort: 1 });
    C.lettre('gele', 1);
  } },
  refuge_ruine: { mil: c2Mil('haut', 'roc'), alt: [25, 400], r: 5, plat: 3.5, w: 0.8, build(C) {
    C.plat(3.4, 3, 3); C.net(6);
    const W = 4.6, D = 3.8, t = 0.6;
    C.bl(0, -0.6, -D / 2, W, 2.5, t, M_MOSSY); C.bl(-W / 2, -0.6, 0, t, 2.2, D, M_MOSSY); C.bl(W / 2, -0.6, -0.4, t, 1.6, D - 0.8, M_MOSSY);
    C.bl(-1.35, -0.6, D / 2, 1.9, 1.7, t, M_MOSSY); C.bl(1.6, -0.6, D / 2, 1.4, 0.9, t, M_MOSSY);
    C.bl(-0.6, 1.5, -0.5, 3.2, 0.16, 2.8, M_SLATE, 0.2); C.bl(1.8, 0, 1.2, 1.4, 0.6, 1.2, M_MOSSY, 0.8);
    C.cendres(-0.9, -0.6);
    C.pr('paillasse', 1.0, 0, -0.9, 0);
    C.butin(-1.6, 0.5, -1.2, 'c2_t_montagne', { un: 1, label: 'Fouiller sous les lauzes tombées', titre: 'Sous les lauzes' });
    C.lire(W / 2 - 0.1, 1.2, 0.9, 'Lire ce qui est gravé sur le linteau', 'refuge');
  } },
  cache_contrebandiers: { mil: c2Mil('haut', 'roc', 'bois'), alt: [15, 300], r: 3, plat: 5, w: 0.6, req: 'adosse', build(C) {
    C.net(4);
    const y = C.minSol(2);
    C.blY(0, y - 0.5, -1.2, 3.4, 2.6, 1.2, M_ROCK, 0.1); C.blY(-1.3, y - 0.5, 0, 1.0, 1.6, 1.8, M_ROCK, 0.4); C.blY(1.4, y - 0.5, -0.1, 1.1, 1.9, 1.6, M_ROCK, -0.3);
    C.blY(0, y + 0.1, -0.58, 0.6, 0.8, 0.05, M_DARK);
    C.prY('c2_boite', 0.3, y, -0.2, 0.3, { v: 0 });
    C.butin(0.3, y + 0.45 - C.f.y, 0.3, 'c2_t_montagne', { un: 1, label: 'Tirer le ballot de la fente', titre: 'Le ballot des contrebandiers' });
    C.lettre('contrebande', 0.8);
  } },
  signal_geodesique: { mil: c2Mil('haut', 'roc', 'ouvert'), alt: [20, 400], r: 3, plat: 6, w: 0.6, req: 'sommet', build(C) {
    C.net(4);
    C.pt('c2_signal', 0, 0, 0, null, 1, -0.2);
    C.lire(0, 0.9, 1.0, 'Lire la plaque de fonte', 'signal');
  } },
  // ------------------------------------------------ au bord de l'eau
  barque_echouee: { mil: c2Mil('eau', 'pres', 'bois'), alt: [0.2, 3], r: 4, plat: 2.5, w: 1, req: 'eau', build(C) {
    C.net(4);
    C.pt('barque', 0, 0.4, 0.1, null, 1, -0.12);
    C.pt('nasse', 1.3, -0.8, 0.9); C.pt('tonneau_vieux', -1.4, -1.2, 0);
    C.butin(0.4, 0.5, 0.6, 'c2_pecheur', { rf: 5, label: 'Fouiller le fond de la barque', titre: 'Le fond de la barque' });
    C.lettre('pecheur', 0.6);
  } },
  ponton_ruine: { mil: c2Mil('eau', 'pres', 'bois'), alt: [0.2, 2.5], r: 5, plat: 2.5, w: 0.7, req: 'eau', build(C) {
    C.net(5);
    const y = C.w.waterLevel + 0.55;
    for (let k = 0; k < 4; k++) {
      const lz = -1 - k * 2.2, dy = k === 3 ? -0.5 : 0;
      C.blY(0, y - 0.12 + dy, lz, 1.6, 0.12, 2.1, M_PLANKS, k === 3 ? 0.25 : 0);
      for (const s of [-0.7, 0.7]) C.blY(s, C.w.waterLevel - 2.5, lz - 0.9, 0.18, y - C.w.waterLevel + 2.5 + (k === 3 ? -0.8 : 0.25), 0.18, M_LOGS);
    }
    C.prY('lanterne_sol', 0.55, y, -1.2, 0);
    C.butin(-0.5, y + 0.2 - C.f.y, -3.4, 'c2_t_modeste', { un: 1, label: 'Passer la main entre les planches', titre: 'Coincé sous les planches' });
  } },
  poteau_dame: { mil: c2Mil('eau', 'pres'), alt: [0.2, 2.5], r: 3, plat: 3, w: 0.6, req: 'eau', build(C) {
    C.net(3);
    C.pt('c2_dame_bois', 0, -1.2, 0, null, 0.8, -0.3);
    C.pt('rubans', 1.3, -0.4, 0.4, null, 0.8);
    C.it('dame', 0, 1.2, -0.3, 'Regarder la figure de bois');
  } },
  // ------------------------------------------------ fermes et maisons perdues
  maison_forestiere: { mil: c2Mil('bois'), alt: [1, 50], r: 9, plat: 1.8, w: 0.6, build(C) {
    C.plat(5.5, 5, 4); C.net(9);
    const key = 'c2_mf' + C.i;
    LIEU_NAMES[key] = C.nom;
    const Bl = C.B.building(key, C.f, 6, 5, { wall: M_TIMBER, win: M_TIMBERWIN, roof: M_THATCH, chimney: true, noLight: true }, function (bf, W, D) {
      this.propRel(bf, 'lit', -W / 2 + 0.85, 0.15, D / 2 - 1.3, Math.PI, { col: '#5a5a48' });
      this.propRel(bf, 'table', W / 4 - 0.3, 0.15, 0.2, 0); this.propRel(bf, 'chaise', W / 4 - 0.3, 0.15, -0.55, Math.PI + 0.4);
      this.propRel(bf, 'cheminee', W / 2 - 0.62, 0.15, D / 2 - 1.6, -Math.PI / 2, { lit: false });
      this.propRel(bf, 'armoire', -W / 2 + 0.35, 0.15, -0.6, Math.PI / 2);
      this.propRel(bf, 'trophee', 0, 1.6, D / 2 - 0.2, Math.PI);
    });
    C.w.doors[Bl.door].locked = false;
    C.butin(-6 / 2 + 0.8, 1.1, -0.6, 'c2_abandon', { rf: 7, label: 'Ouvrir l’armoire', titre: 'L’armoire du garde' });
    C.lettre('forestier', 1, [0.8, 0.9, 0.2]);
  } },
  fosse_loups: { mil: c2Mil('bois', 'ouvert'), alt: [1, 60], r: 4, plat: 2, w: 0.5, build(C) {
    C.plat(2.5, 2.5, 2); C.net(4);
    C.creuse(1.3, 0.8);
    for (let k = 0; k < 6; k++) C.pr('c2_pieu', -0.8 + (k % 3) * 0.8, -0.75, -0.4 + ((k / 3) | 0) * 0.8, C.rnd());
    C.pr('ossements', 0.2, -0.78, 0.1, 1.2);
    for (let k = 0; k < 5; k++) C.pr('c2_branches', (C.rnd() - 0.5) * 2.4, 0, (C.rnd() - 0.5) * 2.4, C.rnd() * TAU);
    C.butin(0, -0.3, 0.6, 'c2_t_roche', { un: 1, label: 'Fouiller le fond de la fosse', titre: 'Au fond de la fosse' });
  } },
  ferme_brulee: { mil: c2Mil('ouvert', 'bois'), alt: [1, 50], r: 9, plat: 2, w: 0.6, build(C) {
    C.plat(6, 5.5, 4); C.net(9); C.dalle(4.6, 3.6, M_DIRT);
    const W = 9, D = 7, t = 0.55;
    C.bl(0, -0.6, -D / 2, W, 3.4, t, M_MOSSY); C.bl(-W / 2, -0.6, 0, t, 2.6, D, M_MOSSY); C.bl(W / 2, -0.6, 0.8, t, 1.4, D - 1.6, M_MOSSY);
    C.bl(-2.5, -0.6, D / 2, 4, 1.8, t, M_MOSSY); C.bl(3.3, -0.6, D / 2, 2.4, 0.9, t, M_MOSSY);
    C.bl(W / 2 - 0.9, -0.6, -D / 2 + 0.6, 1.3, 7.2, 1.1, M_STONE);
    C.bl(-1, 0, 0.4, 0.3, 0.3, 6.4, M_DARK, 0.5); C.bl(1.6, 0, -1.2, 0.3, 0.3, 4.8, M_DARK, -1.1); C.bl(0.2, 0.1, 1.6, 0.28, 0.28, 3.6, M_DARK, 0.1);
    C.pr('trappe', -2.4, 0.02, -1.6, 0.2);
    C.butin(-2.4, 0.4, -1.6, 'c2_t_modeste', { un: 1, label: 'Soulever la trappe de la cave', titre: 'La cave effondrée' });
    C.lettre('ferme', 1);
  } },
  calvaire_trois: { mil: c2Mil('ouvert', 'bois'), alt: [1, 60], r: 4, plat: 2.2, w: 0.4, max: 1, build(C) {
    C.plat(2.6, 2.6, 2); C.net(4);
    C.bl(0, -0.4, 0, 3.2, 0.85, 2.2, M_ROCK, 0.1);
    for (const [lx, h] of [[-1.0, 0.8], [0, 1.0], [1.0, 0.8]]) C.pr('croix_bois', lx, 0.45, -0.3, 0, null, h);
    C.lire(0, 0.6, 1.2, 'Regarder la pierre', 'trois_croix');
    C.cache(0.3, 1.6, 'c2_t_histoire', 'Creuser au pied de la pierre', 'trois_croix');
  } },
};

// ============================================================================
//  LA GÉNÉRATION
// ============================================================================
// objets qu'on ne dégage jamais autour d'un lieu (repères, notes, filons, décor des villages)
const C2_GARDE = new Set(['giantoak', 'note', 'vein', 'crystal', 'lamp', 'sign', 'campfire', 'barrel', 'lantern', 'cart', 'scarecrow', 'tomb', 'woodpile', 'hay', 'produce', 'minecart', 'orepile', 'bones', 'wisp']);
// en dernier recours (carré difficile), ces lieux-là vont partout
const C2_PARTOUT = new Set(['borne_ancienne', 'menhir', 'oratoire', 'tombe_isolee', 'pierre_cupules', 'rocher_marques', 'croix_avalanche']);
const C2_ARBRES_PORTEURS = new Set(['oak', 'hetre', 'chataignier', 'noyer', 'tilleul', 'erable', 'saule', 'peuplier', 'aulne', 'birch', 'pine', 'sapin', 'meleze', 'if']);

// grille de points occupés (cellules de 16 m) : [x, z, rayon]
function c2Grille() {
  const C = 16, cells = new Map();
  return {
    add(x, z, r) { const k = Math.floor(x / C) + ',' + Math.floor(z / C); (cells.get(k) || cells.set(k, []).get(k)).push([x, z, r]); },
    // le point le plus « serré » : renvoie vrai si (x, z) est à moins de marge + rayon d'un point
    pris(x, z, marge) {
      const R = Math.ceil((marge + 24) / C), cx = Math.floor(x / C), cz = Math.floor(z / C);
      for (let dz = -R; dz <= R; dz++) for (let dx = -R; dx <= R; dx++) {
        const L = cells.get((cx + dx) + ',' + (cz + dz));
        if (L) for (const [px, pz, r] of L) if (Math.hypot(px - x, pz - z) < r + marge) return true;
      }
      return false;
    },
  };
}

// outils de construction d'un lieu (repère f : x, y, z, r ; +z local = le devant, d'où l'on arrive)
function c2Ctx(G, site, key) {
  const { w, B, rnd } = G, WL = w.waterLevel;
  const f = { x: site.x, y: site.y, z: site.z, r: site.r };
  const i = G.lieux.length;
  let nI = 0;
  const C = {
    w, B, rnd, f, i, t: key, nom: site.nom, dernierButin: null,
    at: (lx, lz) => B.toWorld(f, lx, lz),
    hl(lx, lz) { const [x, z] = B.toWorld(f, lx, lz); return w.heightAt(x, z); },
    minSol(r) { let m = w.heightAt(f.x, f.z); for (let a = 0; a < 8; a++) m = Math.min(m, w.heightAt(f.x + Math.cos(a * 0.785) * r, f.z + Math.sin(a * 0.785) * r)); return m; },
    plat(hw, hd, fall) { B.flattenRect(f, hw, hd, f.y, fall ?? 3); },
    net(r) { G.degager(f.x, f.z, r); },
    bl(lx, ly, lz, sx, sy, sz, m, rr, sh) { B.block(f, lx, ly, lz, sx, sy, sz, m, rr || 0, sh || 0); G.nb++; },
    blY(lx, y, lz, sx, sy, sz, m, rr, sh) { B.block(f, lx, y - f.y, lz, sx, sy, sz, m, rr || 0, sh || 0); G.nb++; },
    pr(id, lx, ly, lz, rr, data, s) { G.np++; return B.propRel(f, id, lx, ly, lz, rr, data || null, s); },
    prY(id, lx, y, lz, rr, data, s) { G.np++; return B.propRel(f, id, lx, y - f.y, lz, rr, data || null, s); },
    pt(id, lx, lz, rr, data, s, dy) { G.np++; const y = C.hl(lx, lz) + (dy || 0); return B.propRel(f, id, lx, y - f.y, lz, rr, data || null, s); },
    ob(id, lx, lz, h, extra) {
      if (OBJ_INDEX[id] === undefined) return null;
      const [x, z] = C.at(lx, lz);
      if (w.heightAt(x, z) < WL + 0.1) return null;
      G.no++; return B.obj(id, x, z, h, extra);
    },
    sol(r, mat, rag) { B.paintDisk(f.x, f.z, r, mat, rag || 0); },
    dalle(hw, hd, mat) { B.paintRect(f, 0, 0, hw, hd, mat); },
    mur(x0, z0, x1, z1, h, t, m) { const L = Math.hypot(x1 - x0, z1 - z0), a = Math.atan2(x1 - x0, z1 - z0); C.bl((x0 + x1) / 2, -0.5, (z0 + z1) / 2, t, h + 0.5, L, m, a); },
    // un foyer éteint : un cercle de pierres, de la cendre
    cendres(lx, lz, y) {
      const y0 = (y ?? C.hl(lx, lz)) - f.y;
      C.bl(lx, y0 - 0.03, lz, 1.0, 0.07, 1.0, M_DARK, 0.3);
      for (let k = 0; k < 7; k++) { const a = k / 7 * TAU; C.bl(lx + Math.cos(a) * 0.72, y0 - 0.1, lz + Math.sin(a) * 0.72, 0.34, 0.26, 0.28, M_ROCK, a); }
    },
    // un trou : le terrain s'abaisse (bords en pente douce, on en ressort à pied)
    creuse(half, prof) {
      B.forVerts(f.x, f.z, half + 2, (i2, j2, k) => {
        const x = i2 * w.cell, z = j2 * w.cell, [lx, lz] = B.toLocal(f, x, z), d = Math.max(Math.abs(lx), Math.abs(lz));
        const t = 1 - smoothstep(half, half + 1.2, d);
        if (t > 0) w.heights[k] = Math.min(w.heights[k], lerp(w.heights[k], f.y - prof, t));
      });
    },
    it(a, lx, ly, lz, label, data) { G.ni++; return B.interRel(f, 'c2', 'c2:' + i + ':' + (nI++), lx, ly, lz, label, Object.assign({ l: i, a }, data || {})); },
    texte(pool) { return G.tirer('txt', pool); },
    lire(lx, ly, lz, label, pool) { const t = C.texte(pool); return t ? C.it('lire', lx, ly, lz, label, { txt: t }) : null; },
    // une inscription gravée sur la pierre du lieu (langues perdues : 11-zzz22-langues.js la lit)
    insSur(lx, ly, lz, lang) {
      const id = G.tirer('ins', lang);
      if (!id) return null;
      const [x, z] = C.at(lx, lz);
      G.ni++;
      return B.inter('inscription', 'ins_' + id, x, f.y + ly, z, lang === 'aelin' ? 'Lire l’inscription' : 'Lire les cupules', { ins: id });
    },
    insStele(lx, lz, lang) {
      const id = G.tirer('ins', lang);
      if (!id) return null;
      const y = C.hl(lx, lz), [x, z] = C.at(lx, lz), r = Math.atan2(f.x - x, f.z - z);
      G.np++; B.prop('stele', x, y - 0.08, z, r, { ins: id });
      G.ni++; return B.inter('inscription', 'ins_' + id, x + Math.sin(r) * 0.55, y + 1.1, z + Math.cos(r) * 0.55, lang === 'aelin' ? 'Lire l’inscription' : 'Lire les cupules', { ins: id });
    },
    butin(lx, ly, lz, table, o) {
      o = o || {};
      const d = { table, titre: o.titre || '', un: o.un ? 1 : 0, rf: o.rf || 0 };
      for (const k of ['cache', 'seau', 'sacrilege', 'abeilles', 'mort', 'apres']) if (o[k]) d[k] = o[k];
      return (C.dernierButin = C.it('butin', lx, ly, lz, o.label || 'Fouiller', d));
    },
    // une lettre : glissée dans le dernier conteneur du lieu, ou posée à part
    lettre(pool, p, pos) {
      if (C.rnd() >= (p ?? 1)) return null;
      const id = G.tirer('lettre', pool);
      if (!id) return null;
      if (C.dernierButin && !pos) C.dernierButin.data.pap = id;
      else { const [lx, ly, lz] = pos || [0.7, 0.35, 1.3]; C.it('lettre', lx, ly, lz, 'Ramasser le papier', { pap: id }); }
      return id;
    },
    // un trésor enterré qu'on ne voit qu'une fois l'indice connu (clé : 11-zzzz7-carte2-textes.js)
    cache(lx, lz, table, label, cle) { const y = C.hl(lx, lz) - f.y; return C.it('cache', lx, y + 0.3, lz, label, { table, cle, pelle: 1 }); },
    jourAuHasard() { return SEMAINE[(C.rnd() * SEMAINE.length) | 0].cle; },
  };
  return C;
}

// l'endroit où poser un lieu, dans un carré : plat, sec, libre, loin des chemins ; renvoie les meilleurs candidats
function c2Candidats(G, gi, gj, souple) {
  const { w, A, rnd } = G, { n, st, H, R } = A, WL = w.waterLevel, S = w.size;
  const x0 = gi * C2_CARRE, z0 = gj * C2_CARRE, x1 = Math.min(S, x0 + C2_CARRE), z1 = Math.min(S, z0 + C2_CARRE);
  const cells = [];
  for (let j = Math.ceil(z0 / st); j < Math.min(n, Math.ceil(z1 / st)); j++) for (let i = Math.ceil(x0 / st); i < Math.min(n, Math.ceil(x1 / st)); i++) {
    const k = j * n + i;
    if (R[k] !== 1 || H[k] < WL + 0.35) continue;
    const x = i * st, z = j * st;
    if (!w.inside(x, z, 22)) continue;
    cells.push(k);
  }
  const out = [], N = Math.min(cells.length, souple ? 400 : 240), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const marge = souple ? 7 : 15;
  for (let t = 0; t < N; t++) {
    const k = cells[(rnd() * cells.length) | 0], i = k % n, j = (k / n) | 0;
    const x = clamp(i * st + (rnd() - 0.5) * st, x0 + 1, x1 - 1), z = clamp(j * st + (rnd() - 0.5) * st, z0 + 1, z1 - 1), h = w.heightAt(x, z);
    if (h < WL + 0.25 || w.matAt(x, z) === M_ICE) continue;
    if (G.occ.pris(x, z, marge)) continue;
    if (G.hors(x, z, souple ? 2 : 6)) continue;
    // pas sur un chemin, pas dans un mur
    let chemin = false;
    for (let a = 0; a < 5 && !chemin; a++) { const px = x + (a ? Math.cos(a * 1.57) * 3.5 : 0), pz = z + (a ? Math.sin(a * 1.57) * 3.5 : 0), m = w.matAt(px, pz); if (m === M_DIRT || m === M_COBBLE) chemin = true; }
    if (chemin && !souple) continue;
    let mur = false;
    w.query(x, z, 6, null, (b) => { if (!mur && !b.under && !b.hidden && Math.hypot(b.x - x, b.z - z) < Math.max(b.sx, b.sz) / 2 + 5) mur = true; });
    if (mur) continue;
    // dénivelé sur 3 et 6 m, et l'eau
    let mn = h, mx = h, mn6 = h, mx6 = h;
    for (let a = 0; a < 8; a++) {
      const ca = Math.cos(a * 0.785), sa = Math.sin(a * 0.785);
      const h3 = w.heightAt(x + ca * 3, z + sa * 3), h6 = w.heightAt(x + ca * 6, z + sa * 6);
      mn = Math.min(mn, h3); mx = Math.max(mx, h3); mn6 = Math.min(mn6, h6); mx6 = Math.max(mx6, h6);
    }
    const sp3 = mx - mn, sp6 = Math.max(mx6, mx) - Math.min(mn6, mn);
    const dc = Math.hypot(x - cx, z - cz) / C2_CARRE;
    out.push({ x, z, h, sp3, sp6, mn6: Math.min(mn6, mn), score: sp3 * 0.6 + sp6 * 0.25 + dc * 2.2 + rnd() * 0.8 });
  }
  out.sort((a, b) => a.score - b.score);
  return out.slice(0, souple ? 60 : 40);
}

// le lieu qui convient à un endroit : milieu, hauteur, dénivelé, exigences ; renvoie { key, site } ou null
function c2Choisir(G, cands, gi, gj, souple) {
  const { w, rnd } = G, WL = w.waterLevel;
  let best = null;
  for (const s of cands) {
    const mil = milieuAt(w, s.x, s.z), alt = s.h - WL;
    for (const key in C2_TYPES) {
      const T = C2_TYPES[key];
      if (!T.mil.has(mil) && !(souple && C2_PARTOUT.has(key))) continue;
      if (alt < T.alt[0] || alt > T.alt[1]) continue;
      if (T.r > 5 && G.occ.pris(s.x, s.z, T.r + 5)) continue;
      if (T.max && (G.compte[key] || 0) >= T.max) continue;
      const sp = T.r <= 3.5 ? s.sp3 : s.sp6;
      if (sp > T.plat * (souple ? 1.8 : 1)) continue;
      if (s.mn6 < WL + 0.2 && !T.req) continue;
      const q = c2Exigence(G, T.req, s);
      if (!q) continue;
      if (q.x !== undefined && (Math.floor(q.x / C2_CARRE) !== gi || Math.floor(q.z / C2_CARRE) !== gj)) continue; // (l'arbre doit être dans le carré)
      const n = G.compte[key] || 0;
      let v = T.w / (1 + 0.9 * n);
      if (!n) v *= 2.2;
      if (G.voisin(gi, gj, key)) v *= 0.2;
      const score = s.score - Math.log(v) * 1.6 + rnd() * 0.9 - (q.bonus || 0);
      if (!best || score < best.score) best = { key, site: Object.assign({}, s, q), score };
    }
  }
  return best;
}

// exigences d'un lieu (et son orientation) ; renvoie {} si rien, un objet (r, x, z…) si c'est bon, null sinon
function c2Exigence(G, req, s) {
  const { w } = G, WL = w.waterLevel, H = (x, z) => w.heightAt(x, z);
  if (!req) return {};
  if (req === 'sommet') {
    let m = 0; for (let a = 0; a < 8; a++) m += H(s.x + Math.cos(a * 0.785) * 30, s.z + Math.sin(a * 0.785) * 30);
    const pro = s.h - m / 8;
    return pro >= 1.2 ? { bonus: Math.min(3, pro * 0.3) } : null;
  }
  if (req === 'adosse') {
    for (let a = 0; a < 16; a++) {
      const ang = a / 16 * TAU, dx = Math.sin(ang), dz = Math.cos(ang);
      const monte = H(s.x + dx * 7, s.z + dz * 7) - s.h, devant = H(s.x - dx * 5, s.z - dz * 5) - s.h;
      if (monte > 3 && devant < 1 && devant > -3) return { r: ang + Math.PI };
    }
    return null;
  }
  if (req === 'eau') {
    for (let d = 3; d <= 12; d += 1.5) for (let a = 0; a < 16; a++) {
      const ang = a / 16 * TAU;
      if (H(s.x + Math.sin(ang) * d, s.z + Math.cos(ang) * d) < WL - 0.25) return { r: ang, bonus: 1 };
    }
    return null;
  }
  if (req === 'arbre') {
    const o = G.arbre(s.x, s.z, 10);
    return o ? { x: o.x, z: o.z, h: H(o.x, o.z), arbre: 1 } : null;
  }
  return {};
}

function carte2Gen(w) {
  if (!w || !w.designed || w.carte2) return;
  const rnd = mulberry32((((w.seed | 0) ^ 0x5C1A2E7) >>> 0));
  const B = new Builder(w, rnd, new Uint8Array(w.W * w.W));
  const G = {
    w, B, rnd, lieux: [], compte: {}, parCarre: {}, nObj0: w.objects.length, nb: 0, np: 0, ni: 0, no: 0,
    pris: { txt: {}, ins: {}, lettre: {} }, noms: {},
  };
  // ---- tirer un texte, une inscription, une lettre d'une réserve (chacun une fois, tant qu'il en reste)
  G.tirer = (sorte, pool) => {
    const R = sorte === 'txt' ? (typeof C2_TEXTES_POOLS !== 'undefined' ? C2_TEXTES_POOLS[pool] : null)
      : sorte === 'ins' ? (typeof C2_INS_POOLS !== 'undefined' ? C2_INS_POOLS[pool] : null)
        : (typeof C2_LETTRES_POOLS !== 'undefined' ? C2_LETTRES_POOLS[pool] : null);
    if (!R || !R.length) return null;
    const P = G.pris[sorte], libres = R.filter((id) => !P[id]);
    if (!libres.length) { if (sorte !== 'txt') return null; const id = R[(rnd() * R.length) | 0]; return id; }
    const id = libres[(rnd() * libres.length) | 0];
    P[id] = 1;
    return id;
  };
  // ---- les points déjà occupés
  G.occ = c2Grille();
  const remplir = () => {
    for (const q of w.props) if (!q.gone && isFinite(q.x)) G.occ.add(q.x, q.z, 1.5);
    for (const it of w.inter) if (isFinite(it.x) && !(it.y < w.heightAt(it.x, it.z) - 3)) G.occ.add(it.x, it.z, 1.5);
    for (const k in w.bld) { const b = w.bld[k]; if (b && isFinite(b.x)) G.occ.add(b.x, b.z, Math.max(b.W || 8, b.D || 8) * 0.7 + 3); }
    for (const k in w.lm) { const L = w.lm[k]; if (!L.under && isFinite(L.x) && (L.r || 0) <= 60) G.occ.add(L.x, L.z, Math.min(L.r || 8, 40) * 0.7 + 2); }
  };
  G.hors = (x, z, m) => { for (const P of w.noBuild || []) if (Math.hypot(x - P.x, z - P.z) < P.r + m) return true; if (w.townInfo && Math.max(Math.abs(x - w.townInfo.x), Math.abs(z - w.townInfo.z)) < 66 + m) return true; return false; };
  // ---- les objets (arbres, buissons) : grille pour dégager et trouver un grand arbre
  const OG = new Map(), OC = 8;
  for (let k = 0; k < G.nObj0; k++) { const o = w.objects[k]; if (o.gone) continue; const key = Math.floor(o.x / OC) + ',' + Math.floor(o.z / OC); (OG.get(key) || OG.set(key, []).get(key)).push(k); }
  const autour = (x, z, r, fn) => { const R = Math.ceil(r / OC); for (let dz = -R; dz <= R; dz++) for (let dx = -R; dx <= R; dx++) for (const k of OG.get((Math.floor(x / OC) + dx) + ',' + (Math.floor(z / OC) + dz)) || []) fn(w.objects[k], k); };
  G.degager = (x, z, r) => autour(x, z, r, (o) => { const T = OBJ_TYPES[o.t]; if (o.gone || T.animal || C2_GARDE.has(T.id) || Math.hypot(o.x - x, o.z - z) > r) return; o.gone = true; o.cleared = true; });
  G.arbre = (x, z, r) => { let best = null, bd = r; autour(x, z, r, (o) => { const T = OBJ_TYPES[o.t]; if (o.gone || !C2_ARBRES_PORTEURS.has(T.id) || o.h < 6.5) return; const d = Math.hypot(o.x - x, o.z - z); if (d < bd && !G.occ.pris(o.x, o.z, 12)) { bd = d; best = o; } }); return best; };
  G.voisin = (gi, gj, key) => { for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) if ((di || dj) && G.parCarre[(gi + di) + ',' + (gj + dj)] === key) return true; return false; };
  // ---- orientation par défaut : vers le chemin le plus proche (sinon au hasard)
  const nav = (w.nav && w.nav.nodes) || [];
  const versChemin = (x, z) => { let best = null, bd = 140; for (const q of nav) { if (q.iso || /:(in|mid)$/.test(q.tag)) continue; const d = Math.hypot(q.x - x, q.z - z); if (d < bd && d > 4) { bd = d; best = q; } } return best ? Math.atan2(best.x - x, best.z - z) : rnd() * TAU; };
  // ---- les villages des peuples d'abord (11-zzzz7-carte3-peuples.js)
  if (typeof c2Villages === 'function') { try { c2Villages(G); } catch (e) { console.error('carte2 villages', e); } }
  remplir();
  delete w._c2acces;
  G.A = carte2Acces(w);
  // ---- chaque carré vide reçoit un lieu
  const poser = (gi, gj, souple) => {
    const cands = c2Candidats(G, gi, gj, souple);
    if (!cands.length) return false;
    const ch = c2Choisir(G, cands, gi, gj, souple);
    if (!ch) return false;
    const T = C2_TYPES[ch.key], s = ch.site;
    const noms = C2_NOMS[ch.key] || [ch.key], minU = Math.min(...noms.map((q) => G.noms[q] || 0)), libres = noms.filter((q) => (G.noms[q] || 0) === minU);
    const nom = libres[(rnd() * libres.length) | 0];
    G.noms[nom] = (G.noms[nom] || 0) + 1;
    const site = { x: s.x, z: s.z, y: w.heightAt(s.x, s.z), r: s.r !== undefined ? s.r : versChemin(s.x, s.z), nom };
    const C = c2Ctx(G, site, ch.key);
    T.build(C);
    const L = { i: C.i, t: ch.key, x: site.x, z: site.z, y: site.y, r: site.r, nom, gi, gj };
    G.lieux.push(L);
    B.landmark('c2_' + C.i, site.x, site.z, Math.max(5, T.r + 1), { name: nom, c2: ch.key });
    G.occ.add(site.x, site.z, T.r + 4);
    G.compte[ch.key] = (G.compte[ch.key] || 0) + 1;
    G.parCarre[gi + ',' + gj] = ch.key;
    return true;
  };
  const Cq = carte2Carres(w);
  const reste = [];
  for (const [gi, gj] of Cq.listeVides) if (!poser(gi, gj, false)) reste.push([gi, gj]);
  for (const [gi, gj] of reste) poser(gi, gj, true);
  // ---- les histoires à recouper et les secrets (11-zzzz7-carte2-textes.js)
  if (typeof c2PoserHistoires === 'function') { try { c2PoserHistoires(G); } catch (e) { console.error('carte2 histoires', e); } }
  w.carte2 = { lieux: G.lieux, n: { blocs: G.nb, props: G.np, inter: G.ni, objets: G.no }, reste: reste.length };
  delete w._c2acces;
  w.objectsDirty = true; w.grid = null; w.blocksDirty = true; w.coverDirty = true; w.shadeDirty = true;
}
// branchement : après tout le reste de la vallée
{
  const _gv = generateValley;
  generateValley = async function (seed, progress, gen) {
    const w = await _gv(seed, progress, gen);
    if (w && w.designed) { try { if (progress) progress('Les lieux perdus…'); carte2Gen(w); } catch (e) { console.error('carte2', e); } }
    return w;
  };
}

// ============================================================================
//  LE JEU : ce qu'on fait dans les lieux
// ============================================================================
for (const id of ['c2_gibet', 'c2_branlante', 'c2_bougies', 'c2_lueur', 'c2_lanterne_morts']) DYN_PROPS.add(id);
if (typeof MAL_CAUSES !== 'undefined') Object.assign(MAL_CAUSES, {
  offrandes: { mal: 'malchance', faute: 'Vous avez décroché ce que d’autres avaient noué à l’arbre aux vœux.', reparer: 'Nouer à l’arbre quelque chose à vous, et n’y plus rien prendre.' },
  source_sacree: { mal: 'malchance', faute: 'Vous avez ramassé les pièces d’une fontaine.', reparer: 'Rendre à la fontaine plus qu’on n’y a pris.' },
});
const C2_ROMAINS = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];

const carte2 = {
  aHeure: [], branche: false, pousses: [], majT: 0,
  S() {
    const s = farm.s;
    const C = s.carte2 || (s.carte2 = { v: 1 });
    for (const k of ['vide', 'lus', 'cles', 'prie', 'bu', 'voeux', 'noue', 'don', 'lanterne', 'bascule', 'creuse', 'pap', 'vus']) if (!C[k] || typeof C[k] !== 'object') C[k] = {};
    if (!Array.isArray(C.registre)) C.registre = [];
    return C;
  },
  W() { return game.world; },
  lieu(it) { const w = this.W(), L = w && w.carte2 && w.carte2.lieux; return L && it && it.data ? L[it.data.l] : null; },
  nom(it) { const L = this.lieu(it); return L ? L.nom : ''; },
  maj(t) { return t ? t.charAt(0).toUpperCase() + t.slice(1) : t; },
  heure() { return npcs.hour(); },
  // la nuit en cours (le jour de son soir) : de 18 h à 6 h
  nuit() { const h = this.heure(), d = farm.s.day; return h >= 18 ? d : h < 6 ? d - 1 : 0; },
  soleil() { const h = this.heure(), W = typeof weather !== 'undefined' && weather.cur ? weather.cur : {}; return h > 6.8 && h < 17.4 && !(W.rain > 0.15) && !(W.storm > 0.1) && !(W.fog > 0.5) && !((W.cloud || 0) > 0.7); },
  // un indice lu (texte ou lettre) : il peut révéler une cachette
  indice(id) {
    if (typeof C2_INDICES === 'undefined' || !C2_INDICES[id]) return;
    const S = this.S();
    for (const k of [].concat(C2_INDICES[id])) {
      const req = typeof C2_CLES !== 'undefined' && C2_CLES[k];
      if (S.cles[k]) continue;
      if (req && !req.every((q) => S.lus[q] || (typeof fouilles !== 'undefined' && fouilles.S() && fouilles.S().lus[q]))) continue;
      S.cles[k] = farm.s.day;
    }
  },
  // ------------------------------------------------------------------ interactions
  agir(it) {
    const d = it.data || {};
    try {
      if (typeof C2_SECRETS !== 'undefined' && C2_SECRETS[d.a] && C2_SECRETS[d.a](it, this)) return;
      const fn = this['a_' + d.a];
      if (fn) fn.call(this, it, d);
    } catch (e) { console.error('carte2', e); }
  },
  visible(it) {
    const d = it.data || {}, S = farm.s && this.S();
    if (!S) return true;
    if (d.a === 'lettre') return !S.pap[it.id];
    if (d.a === 'cache') { const k = this.cleDe(it); return !!S.cles[k] && !S.creuse[it.id]; }
    if (d.a === 'don') return !!S.don[d.l];
    if (d.apres === 'bascule') return !!S.bascule[d.l];
    if (d.cache && d.a === 'butin') return !S.vide[it.id] || !!butin.reste(it.id);
    return true;
  },
  cleDe(it) { const d = it.data || {}; return d.cle === 'cadran' ? 'cadran:' + d.l : d.cle; },
  a_lire(it, d) {
    const T = typeof C2_TEXTES !== 'undefined' && C2_TEXTES[d.txt];
    if (!T) { ui.subtitle('', '(Les lettres sont trop effacées pour qu’on les lise.)', 3); return; }
    ui.read(T[0], fmtLine(T[1], null), T[2] ? fmtLine(T[2], null) : '');
    this.S().lus[d.txt] = farm.s.day;
    this.indice(d.txt);
  },
  a_lettre(it, d) {
    const pap = d.pap;
    if (!pap || typeof F2_PAPIERS === 'undefined' || !F2_PAPIERS[pap] || typeof fouilles === 'undefined') return;
    this.S().pap[it.id] = farm.s.day;
    this.garder(pap, this.nom(it));
    sound.page && sound.page();
    fouilles.lirePapier(pap);
  },
  garder(pap, ou) { const F = fouilles.S(); if (!F) return; fouilles.garderPapier(pap); if (!F.ou[pap]) F.ou[pap] = ou || ''; },
  // un conteneur (menu de butin) ; « un » : trésor d'une seule fois ; « rf » : se regarnit au bout de rf jours
  a_butin(it, d, o) {
    const S = this.S(), cle = it.id, jour = farm.s.day;
    if (d.rf && S.vide[cle] !== undefined && jour - S.vide[cle] >= d.rf) { butin.oublier(cle); delete S.vide[cle]; }
    if (S.vide[cle] !== undefined && !butin.reste(cle)) {
      sound.click && sound.click();
      ui.subtitle('', d.un ? pick(['(Il n’y a plus rien.)', '(Vide. Vous l’avez déjà pris.)']) : pick(['(Vide. Revenez dans quelques jours.)', '(Il n’y a plus rien pour l’instant.)']), 2.5);
      return;
    }
    const neuf = S.vide[cle] === undefined;
    if (neuf) S.vide[cle] = jour;
    if (d.seau && neuf) { sound.chain && sound.chain(); }
    const pap = d.pap && typeof F2_PAPIERS !== 'undefined' && F2_PAPIERS[d.pap] && !(fouilles.S() && fouilles.S().papiers.includes(d.pap)) ? d.pap : null;
    const ou = this.nom(it);
    const self = this;
    butin.ouvrir(Object.assign({
      titre: d.titre || this.maj(ou) || 'Ce que vous trouvez', cle, x: it.x, y: it.y, z: it.z,
      objets: () => rollLoot(d.table),
      papier: neuf ? pap : null,
      onPremier() {
        if (d.sacrilege === 'arbre') { if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-1.5, 'offrandes', 3); if (typeof malediction !== 'undefined' && malediction.frapper) setTimeout(() => malediction.frapper('offrandes'), 1200); }
        else if (d.sacrilege === 'source') { if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-1, 'offrandes', 3); if (typeof malediction !== 'undefined' && malediction.frapper) setTimeout(() => malediction.frapper('source_sacree'), 1200); }
        if (d.mort && typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-1.2, 'fouiller un mort', 2);
        if (d.abeilles && !farm.count('enfumoir') && typeof ruches !== 'undefined' && ruches.piquer) setTimeout(() => ruches.piquer(), 300);
      },
      onFerme() { if (pap && fouilles.S() && fouilles.S().papiers.includes(pap) && !fouilles.S().ou[pap]) fouilles.S().ou[pap] = ou; self.indice(pap); },
    }, o || {}));
  },
  a_creuser(it, d) {
    if (!farm.count('pelle')) { ui.subtitle('', '(La terre est tassée, pleine de cailloux. Il faudrait une pelle.)', 3); sound.click && sound.click(); return; }
    const S = this.S();
    if (!S.creuse[it.id]) { S.creuse[it.id] = farm.s.day; sound.dig && sound.dig(1); sound.dig && setTimeout(() => sound.dig(0.8), 350); }
    this.a_butin(it, Object.assign({}, d, { un: 1 }), { titre: d.titre || 'Dans la terre retournée' });
  },
  a_cache(it, d) {
    if (!farm.count('pelle')) { ui.subtitle('', '(Il faudrait une pelle.)', 2.5); return; }
    const S = this.S();
    sound.dig && sound.dig(1); setTimeout(() => sound.dig && sound.dig(0.9), 380);
    const d2 = Object.assign({}, d, { un: 1 });
    const fin = () => { if (!butin.reste(it.id)) S.creuse[it.id] = farm.s.day; };
    this.a_butin(it, d2, { titre: 'Ce que la terre gardait', onFerme: fin });
  },
  a_don(it, d) {
    const S = this.S(), D = S.don[d.l];
    if (!D) return;
    delete S.don[d.l];
    farm.give(D, 1); play.flyer && play.flyer(D, [it.x, it.y, it.z], 1); sound.pop && sound.pop();
    ui.subtitle('', `(Pendu à la branche, à la place de votre nœud : ${itemName(D).toLowerCase()}.)`, 4);
  },
  a_cloche(it) {
    sound.bell && sound.bell(0.55);
    const h = this.heure(), S = this.S();
    if (h >= 23 || h < 3.5) {
      setTimeout(() => sound.bell && sound.bell(0.18), 2800);
      if (!S.vus.cloche) { S.vus.cloche = farm.s.day; setTimeout(() => ui.subtitle('', '(Très loin, une autre cloche répond. Une seule fois.)', 4), 3400); }
      if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-0.4, 'cloche', 1);
    }
  },
  a_prier(it, d) {
    const S = this.S(), L = this.lieu(it);
    const T = typeof C2_TEXTES !== 'undefined' && C2_TEXTES[d.txt];
    if (T) ui.read(T[0], fmtLine(T[1], null), T[2] || '');
    if (L && S.prie[L.i] !== farm.s.day) { S.prie[L.i] = farm.s.day; if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(0.8, 'oratoire', 1.5); }
    if (d.txt) { S.lus[d.txt] = farm.s.day; this.indice(d.txt); }
  },
  a_lanterne(it) {
    const S = this.S(), L = this.lieu(it), q = this.propDe(it, 'c2_lanterne_morts'), nuit = this.nuit();
    if (!L) return;
    if (nuit && S.lanterne[L.i] === nuit) { ui.subtitle('', '(La flamme tient, derrière les pierres ajourées.)', 3); return; }
    if (!nuit) { ui.subtitle('', '(Tout en haut du fût, une petite loge de pierre, ouverte aux quatre vents. De la vieille cire a coulé sur le rebord.)', 4); return; }
    if (!farm.count('bougie')) { ui.subtitle('', '(La loge est vide et noire. Il faudrait une bougie.)', 3); return; }
    ui.choice(this.maj(L.nom), 'La loge de pierre, tout en haut, est vide et noire.', [
      { label: 'Y poser une bougie allumée', fn: () => { ui.close(); farm.take('bougie', 1); S.lanterne[L.i] = nuit; if (q) { q.data = Object.assign({}, q.data || {}, { lit: 1 }); game.world.collectLights(); } sound.equip && sound.equip(); if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(0.6, 'lanterne', 1); if (typeof C2_SECRETS !== 'undefined' && C2_SECRETS.lanterneAllumee) C2_SECRETS.lanterneAllumee(it, this); } },
      { label: 'Laisser', fn: () => ui.close() },
    ]);
  },
  a_pousser(it) {
    const S = this.S(), L = this.lieu(it), q = this.propDe(it, 'c2_branlante');
    if (!L || !q) return;
    const now = game.time;
    q.data = Object.assign({}, q.data || {}, { t0: now });
    sound.rumble && sound.rumble();
    game.shakeT = Math.max(game.shakeT || 0, 0.25);
    if (S.bascule[L.i]) { ui.subtitle('', '(Elle oscille, lourdement, et revient.)', 2.5); return; }
    this.pousses = this.pousses.filter((t) => now - t < 5 && t <= now).concat(now);
    if (this.pousses.length < 3) return;
    this.pousses = [];
    S.bascule[L.i] = farm.s.day;
    q.data = Object.assign({}, q.data, { a: 0.16 });
    setTimeout(() => { ui.subtitle('', '(La pierre bascule d’un cran, et reste penchée. Dessous, un creux sec, que la pluie n’a jamais touché.)', 4.5); }, 700);
  },
  a_puits(it) {
    const h = this.heure(), S = this.S(), L = this.lieu(it);
    if ((h >= 23.8 || h < 0.4) && L && S.vus['puits' + L.i] !== farm.s.day) {
      S.vus['puits' + L.i] = farm.s.day;
      sound.whisper && sound.whisper(0, 0.5);
      ui.subtitle('', fmtLine('(Tout au fond, quelqu’un dit « {prenom} ». Doucement, comme on réveille un enfant.)', null), 4.5);
      if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-1, 'puits', 2);
      return;
    }
    ui.subtitle('', pick(['(Tout en bas, un rond de ciel, et votre tête dedans, toute petite.)', '(Un air froid monte du fond. Il sent la cave et la mousse.)', '(Vous lâchez un caillou. Longtemps après, un bruit mou.)', '(L’eau est si basse qu’on ne la voit pas. On l’entend.)']), 3.5);
  },
  a_boire(it) {
    const S = this.S(), L = this.lieu(it), p = game.player;
    sound.splash && sound.splash();
    if (!L || S.bu[L.i] === farm.s.day) { ui.subtitle('', '(L’eau est glacée. Elle a un goût de fer et de pierre.)', 3); return; }
    S.bu[L.i] = farm.s.day;
    p.hp = Math.min(100, (p.hp || 0) + 8);
    if (typeof play !== 'undefined' && play.poisonT > 0) play.poisonT = Math.max(0, play.poisonT - 30);
    ui.subtitle('', '(L’eau est si froide qu’elle fait mal aux dents. Après, on respire mieux.)', 3.5);
  },
  a_piece(it) {
    const S = this.S(), L = this.lieu(it);
    if (!farm.pay(1)) { ui.subtitle('', '(Vous n’avez pas une pièce sur vous.)', 2.5); return; }
    sound.coin && sound.coin(); setTimeout(() => sound.splash && sound.splash(), 350);
    if (L) S.voeux[L.i] = (S.voeux[L.i] || 0) + 1;
    if (L && S.prie['s' + L.i] !== farm.s.day) { S.prie['s' + L.i] = farm.s.day; if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(0.4, 'voeu', 1); }
  },
  a_nouer(it) {
    const S = this.S(), L = this.lieu(it), s = farm.s, id = s.hand, I = ITEMS[id];
    if (!L) return;
    if (!I || id === 'main' || I.tool || ['outil', 'quete', 'legende', 'animal', 'objet'].includes(I.cat) || I.unique) { ui.subtitle('', '(Il faudrait avoir en main quelque chose à laisser : un ruban, une fleur, un peu de soi.)', 3.5); return; }
    if (S.noue[L.i] === s.day) { ui.subtitle('', '(Vous avez déjà noué quelque chose aujourd’hui.)', 2.5); return; }
    farm.take(id, 1);
    S.noue[L.i] = s.day;
    S.nn = S.nn || {}; S.nn[L.i] = (S.nn[L.i] || 0) + 1;
    sound.pop && sound.pop();
    if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(0.5, 'voeu', 1);
    farm.dirtyProps = true;
  },
  a_cadran(it) {
    const S = this.S(), L = this.lieu(it), h = this.heure();
    const devise = typeof C2_TEXTES !== 'undefined' && C2_TEXTES[L ? 'devise' + (L.i % 4) : 'devise0'];
    const dev = devise ? `Autour de la table, gravé : « ${devise[1]} »` : '';
    if (!this.soleil()) { ui.read('Le cadran solaire', `Pas d’ombre sur la table. Il faut du soleil pour qu’il parle.\n\n${dev}`); return; }
    const i = Math.round(h) % 12;
    let txt = `L’ombre du style tombe sur ${C2_ROMAINS[i]}.\n\n${dev}`;
    if (L && h >= 11.6 && h <= 12.4) {
      txt = `À midi juste, l’ombre du style quitte la table. Elle file dans l’herbe, droite comme un doigt, jusqu’au pied du mur du nord, où une dalle est fendue.\n\n${dev}`;
      S.cles['cadran:' + L.i] = farm.s.day;
    }
    ui.read('Le cadran solaire', txt);
  },
  a_registre(it) {
    const S = this.S(), L = this.lieu(it), s = farm.s;
    const lignes = this.lignesRegistre(L).slice();
    const vies = (farm.history ? farm.history() : []).filter((h) => h && h.name && h.run !== s.run).slice(-4);
    for (const h of vies) lignes.push(`${h.name}. Monté seul. Il fait beau, pour une fois.`);
    const moi = S.registre.filter((q) => q.l === (L && L.i));
    for (const q of moi) lignes.push(`${q.n}, le ${q.j}e jour.`);
    const html = `<h3>La boîte du cairn</h3><div class="txt">Un carnet gondolé, dans une boîte de fer rouillée. Sur la première page : « Ceux qui sont montés jusqu’ici ».<br><br>${lignes.map((x) => esc(x)).join('<br>')}</div><div class="opts"><button class="c2signe">Écrire votre nom</button> <button class="close">Refermer</button></div>`;
    ui.open('#reader', html);
    const b = $('#reader .c2signe');
    if (b) b.onclick = () => { S.registre.push({ l: L ? L.i : -1, n: s.prenom || (s.fem ? 'Jeanne' : 'Jean'), j: s.day }); ui.close(); ui.subtitle('', '(Vous écrivez votre nom, au crayon, sous les autres.)', 3); };
    const c = $('#reader .close'); if (c) c.onclick = () => ui.close();
    this.indice('registre:' + ((L ? L.i : 0) % 4));
  },
  lignesRegistre() { return []; },
  a_souffle(it) {
    const h = this.heure(), J = cal.jour(farm.s.day).cle;
    const noire = typeof evenements !== 'undefined' && evenements.nuitNoire && evenements.nuitNoire(farm.s.day) && (h >= 20 || h < 5);
    sound.whisper && sound.whisper(0, 0.25);
    if (noire) { ui.subtitle('', '(Le trou se tait. Tout se tait, cette nuit.)', 3.5); return; }
    if (J === 'veillee' && (h >= 22 || h < 1)) { ui.subtitle('', '(Du fond, très loin, on dirait qu’on chante. Des voix graves, sans paroles, qui montent et s’arrêtent.)', 5); return; }
    if (h >= 19 || h < 6) { ui.subtitle('', '(Le trou aspire l’air, longuement. Puis il retient son souffle.)', 4); return; }
    ui.subtitle('', '(Un air frais monte du trou, régulier. Il sent la pierre mouillée et quelque chose de plus vieux.)', 4);
  },
  a_marques(it) {
    const L = this.lieu(it), v = L ? L.i % 6 : 0;
    const T = typeof C2_MARQUES !== 'undefined' && C2_MARQUES[v];
    ui.read('Des marques gravées', T || 'Des signes taillés au couteau, les uns par-dessus les autres. Certains sont frais, d’autres presque effacés par le gel.');
    if (typeof C2_SECRETS !== 'undefined' && C2_SECRETS.marquesVues) C2_SECRETS.marquesVues(v, this);
  },
  a_dame(it) {
    const T = typeof C2_TEXTES !== 'undefined' && C2_TEXTES.dame_bois;
    if (T) ui.read(T[0], T[1]); else ui.subtitle('', '(Une femme de bois, les mains ouvertes vers l’eau.)', 3);
  },
  // l'objet posé du lieu (le plus proche de l'interaction)
  propDe(it, id) {
    const w = this.W();
    let best = null, bd = 12;
    for (const q of w.props) if (q.id === id && !q.gone) { const d = Math.hypot(q.x - it.x, q.z - it.z); if (d < bd) { bd = d; best = q; } }
    return best;
  },
  // ------------------------------------------------------------------ ce qui n'arrive qu'à son heure
  indexer() {
    const w = this.W();
    this.aHeure = w.props.filter((q) => ['c2_bougies', 'c2_lueur', 'c2_tombe', 'c2_lanterne_morts', 'c2_branlante', 'c2_offrandes'].includes(q.id));
    this.lieuDe = new Map();
    const L = (w.carte2 && w.carte2.lieux) || [];
    for (const q of this.aHeure) { let best = null, bd = 14; for (const l of L) { const d = Math.hypot(l.x - q.x, l.z - q.z); if (d < bd) { bd = d; best = l; } } if (best) this.lieuDe.set(q, best); }
  },
  majHeures() {
    const s = farm.s, S = this.S(), h = this.heure(), J = cal.jour(s.day).cle, Jveille = cal.jour(s.day - 1).cle, nuit = this.nuit();
    let lum = false, statique = false;
    for (const q of this.aHeure) {
      const d = q.data || {}, L = this.lieuDe.get(q);
      let lit = !!d.lit;
      if (q.id === 'c2_bougies') lit = d.q === 'morts' ? (J === 'morts' && h >= 17) || (Jveille === 'morts' && h < 5) : d.q === 'chapelle' ? (J === 'morts' && h >= 2.5 && h < 4.5) : false;
      else if (q.id === 'c2_lueur') lit = (J === 'mere' && h >= 22) || (Jveille === 'mere' && h < 4);
      else if (q.id === 'c2_lanterne_morts') lit = !!(L && nuit && S.lanterne[L.i] === nuit);
      else if (q.id === 'c2_branlante') { const b = !!(L && S.bascule[L.i]); if (!!d.a !== b) { q.data = Object.assign({}, d, { a: b ? 0.16 : 0 }); } continue; }
      else if (q.id === 'c2_tombe') { const f = !!(d.q && J === d.q && h >= 7); if (!!d.fleurs !== f) { q.data = Object.assign({}, d, { fleurs: f }); statique = true; } continue; }
      else if (q.id === 'c2_offrandes') { const n0 = d.n0 !== undefined ? d.n0 : (d.n || 12), n = n0 + Math.min(12, (L && S.nn && S.nn[L.i]) || 0); if (d.n0 === undefined || (d.n || 0) !== n) { q.data = Object.assign({}, d, { n0, n }); statique = true; } continue; }
      if (lit !== !!d.lit) { q.data = Object.assign({}, d, { lit: lit ? 1 : 0 }); lum = true; }
    }
    if (lum) this.W().collectLights();
    if (statique) farm.dirtyProps = true;
  },
  // chaque matin : les dons de l'arbre aux vœux
  jour() {
    const s = farm.s, S = this.S();
    for (const k in S.noue) {
      if (S.noue[k] !== s.day - 1 || S.don[k]) continue;
      const r = mulberry32(s.seed * 7 + s.day * 131 + (+k) * 17)();
      if (r < 0.55) S.don[k] = ['bille', 'image_pieuse', 'plume', 'vieille_piece', 'figurine', 'meche_cheveux', 'boutons_nacre', 'tesson'][(r * 1000 | 0) % 8];
    }
  },
  charger() {
    if (!game.world || !game.world.carte2) return;
    this.S(); this.indexer(); this.majT = 0; this.majHeures();
    if (this.branche) return;
    this.branche = true;
    // une lettre lue (même à travers le menu de butin) peut révéler une cachette
    if (typeof fouilles !== 'undefined' && fouilles.lirePapier) {
      const _lp = fouilles.lirePapier.bind(fouilles);
      fouilles.lirePapier = function (id) { const r = _lp(id); try { carte2.indice(id); } catch (e) { console.error(e); } return r; };
    }
  },
};
HOOKS.inter.c2 = (it) => carte2.agir(it);
HOOKS.interVis.c2 = (it) => carte2.visible(it);
HOOKS.load.push(() => { try { carte2.charger(); } catch (e) { console.error('carte2', e); } });
HOOKS.day.push(() => { try { if (game.world && game.world.carte2) carte2.jour(); } catch (e) { console.error('carte2', e); } });
HOOKS.update.push((dt) => {
  if (!farm.s || !game.world || !game.world.carte2) return;
  carte2.majT -= dt;
  if (carte2.majT > 0) return;
  carte2.majT = 2;
  try { carte2.majHeures(); } catch (e) { console.error('carte2', e); }
});
