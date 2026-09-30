// ============================================================================
//  LE BUTIN (agent U1) : on choisit ce qu'on prend.
//  - Un MENU DE BUTIN (panneau papier) pour tout conteneur : armoires,
//    commodes, malles, coffres, tonneaux, caisses, sacs, étagères, tiroirs,
//    charrettes, cachettes (11-zzz98-fouilles.js), coffres des lieux
//    (game.lootBox : archives, temple, épaves, campements, ruines…), casiers de
//    la Fondation, coffre du greffe, coffres déterrés, et ce qu'on ouvre en
//    main (coffre englouti, caisse de vivres, sac de graines). Chaque objet :
//    icône, nom, quantité, courte description (au survol ou à la sélection) ;
//    clic = la pile, Maj+clic ou −/+ = une quantité choisie, « Tout prendre » ;
//    E, Échap ou le bouton referment. Ce qu'on laisse RESTE dedans (farm.s.butin,
//    par la clé de l'interaction) jusqu'au remplissage habituel du conteneur.
//  - Le vol reste un vol (même règle que 11-zzz98) : ouvrir chez quelqu'un sous
//    les yeux d'un témoin puis refermer sans rien prendre, c'est un soupçon (une
//    remarque, un peu d'amitié en moins) ; prendre, c'est voler (cris,
//    societe.crime, le garde) ; pas vu, la plainte du lendemain.
//  - TOUT MEUBLE ou conteneur de la vallée se fouille : étagères, tiroirs des
//    tables, tonneaux, caisses, sacs, wagonnets, tas de bois, charrettes… des
//    maisons, boutiques, fermes, hameaux, campements, mines et lieux abandonnés
//    (butin selon le meuble et le lieu, propriétaire, délai de remplissage).
//    Génération après tout le reste, sans tirage : des interactions 'f2' en plus
//    à la fin de w.inter (les objets, les props et les interactions d'origine ne
//    bougent pas), jamais deux cibles au même endroit.
//  - La BOUTIQUE : la liste ne remonte plus en haut après un achat ou une vente ;
//    un clic sur un article ouvre un encart (description, prix à l'unité donné
//    par ui.shopPrice, quantité −/+, saisie ou maximum, total, Confirmer /
//    Annuler) ; Maj+clic et Ctrl+clic achètent et vendent par 5 et par 20.
//  État : farm.s.butin = { v, c: { clé: { src, j, o: [[id, n]…], pap, x, z } }, n }
//  API : butin.ouvrir({ titre, objets, cle, proprio, x, z, onPris(id, n), onFerme(pris) }),
//        butin.conteneur(q), butin.fouillable(q), butin.vider(q), butin.contenu(cle),
//        butin.oublier(cle), butin.description(id)
// ============================================================================

// ---------------------------------------------------------------- tables de butin des meubles nouveaux : [objet, min, max, poids]
Object.assign(LOOT, {
  bu_etagere: { rolls: [1, 2], items: [['bougie', 1, 2, 4], ['sel', 1, 1, 2], ['confiture', 1, 1, 1.5], ['miel', 1, 1, 0.6], ['tisane', 1, 1, 1], ['savon', 1, 1, 1], ['bobine_fil', 1, 1, 1], ['image_pieuse', 1, 1, 1], ['bougeoir', 1, 1, 0.5], ['cuillere_argent', 1, 1, 0.4], ['figurine', 1, 1, 0.4], ['tesson', 1, 1, 0.8], ['livre_contes', 1, 1, 0.15], ['argent', 1, 8, 1]] },
  bu_etagere_vide: { rolls: [1, 1], items: [['tesson', 1, 2, 4], ['bougie', 1, 1, 3], ['image_pieuse', 1, 1, 1], ['bille', 1, 1, 0.5], ['figurine', 1, 1, 0.4], ['vieille_piece', 1, 1, 0.6], ['meche_cheveux', 1, 1, 0.3], ['livre_contes', 1, 1, 0.1]] },
  bu_etagere_poste: { rolls: [1, 2], items: [['timbres', 1, 2, 3], ['cire', 1, 1, 2], ['plume', 1, 3, 2], ['encrier', 1, 1, 1], ['bougie', 1, 2, 2], ['toile', 1, 1, 1], ['corde', 1, 1, 1]] },
  bu_etagere_livres: { rolls: [1, 1], items: [['bougie', 1, 2, 3], ['plume', 1, 2, 2], ['encrier', 1, 1, 1], ['image_pieuse', 1, 1, 1], ['livre_contes', 1, 1, 0.4], ['vieille_piece', 1, 1, 0.4]] },
  bu_tiroir: { rolls: [1, 1], items: [['bougie', 1, 2, 3], ['bobine_fil', 1, 1, 2], ['boutons_nacre', 1, 1, 1.5], ['sel', 1, 1, 1.5], ['argent', 1, 6, 2], ['image_pieuse', 1, 1, 1], ['cire', 1, 1, 1], ['tabac', 1, 1, 0.8], ['de_coudre', 1, 1, 0.6], ['jeu_cartes', 1, 1, 0.5], ['cuillere_argent', 1, 1, 0.3], ['couteau_poche', 1, 1, 0.25]] },
  bu_tiroir_vide: { rolls: [1, 1], items: [['bougie', 1, 1, 2], ['boutons_nacre', 1, 1, 1.5], ['bobine_fil', 1, 1, 1], ['tesson', 1, 1, 2], ['bille', 1, 1, 0.6], ['image_pieuse', 1, 1, 0.8], ['vieille_piece', 1, 1, 0.5], ['meche_cheveux', 1, 1, 0.3]] },
  bu_tonneau: { rolls: [1, 1], items: [['pomme', 2, 4, 3], ['cidre', 1, 1, 2], ['patate', 2, 4, 2], ['sel', 1, 2, 1.5], ['huile', 1, 1, 0.8], ['clous', 1, 2, 1]] },
  bu_tonneau_peche: { rolls: [1, 2], items: [['vers', 2, 6, 4], ['sel', 1, 2, 2], ['poisson_fume', 1, 1, 2], ['corde', 1, 1, 1], ['gardon', 1, 1, 1]] },
  bu_tonneau_salaison: { rolls: [1, 2], items: [['viande_fumee', 1, 1, 3], ['sel', 1, 2, 3], ['cuir', 1, 1, 1], ['graisse_ours', 1, 1, 0.3]] },
  bu_vieux_tonneau: { rolls: [1, 1], items: [['charbon', 1, 2, 3], ['clous', 1, 3, 2], ['corde', 1, 1, 2], ['bougie', 1, 2, 2], ['huile', 1, 1, 0.6], ['tesson', 1, 1, 1], ['vieille_piece', 1, 1, 0.4]] },
  bu_caisse: { rolls: [1, 2], items: [['toile', 1, 2, 2], ['sel', 1, 2, 2], ['bougie', 1, 3, 2], ['clous', 1, 3, 2], ['corde', 1, 1, 2], ['pomme', 2, 4, 2], ['patate', 2, 4, 1.5], ['savon', 1, 1, 1], ['argent', 1, 8, 0.6]] },
  bu_caisse_mine: { rolls: [1, 2], items: [['charbon', 1, 3, 4], ['minerai_cuivre', 1, 3, 3], ['minerai_fer', 1, 2, 2], ['bougie', 1, 2, 3], ['corde', 1, 1, 2], ['clous', 1, 3, 2], ['lingot_fer', 1, 1, 0.3], ['argent', 2, 12, 0.8]] },
  bu_caisse_col: { rolls: [1, 2], items: [['pain', 1, 1, 2], ['corde', 1, 1, 3], ['bougie', 1, 2, 3], ['charbon', 1, 2, 2], ['viande_fumee', 1, 1, 1], ['edelweiss', 1, 1, 0.3], ['argent', 3, 15, 1]] },
  bu_sac: { rolls: [1, 1], items: [['farine', 1, 2, 3], ['avoine', 1, 3, 3], ['patate', 2, 4, 2], ['graines_ble', 2, 4, 1.5], ['sel', 1, 1, 1]] },
  bu_crypte: { rolls: [1, 1], items: [['bougie', 1, 3, 4], ['os', 1, 2, 3], ['tesson', 1, 2, 2], ['cire', 1, 1, 1], ['image_pieuse', 1, 1, 1], ['vieille_piece', 1, 1, 0.8], ['relique', 1, 1, 0.12]] },
  bu_wagonnet: { rolls: [1, 2], items: [['minerai_cuivre', 1, 4, 5], ['charbon', 1, 4, 4], ['minerai_fer', 1, 3, 3], ['pierre', 2, 5, 3], ['geode', 1, 1, 0.8], ['minerai_or', 1, 1, 0.4]] },
});

// ---------------------------------------------------------------- les meubles nouveaux (mêmes champs que F2_TYPES de 11-zzz98)
Object.assign(F2_TYPES, {
  bu_etagere: { lab: 'Fouiller l’étagère', table: 'bu_etagere', d: 1.2, son: 'vaisselle', p: 0.15, r: 3, h: 1.1 },
  bu_tiroir: { lab: 'Ouvrir le tiroir de la table', table: 'bu_tiroir', d: 0.9, son: 'bois', p: 0.2, r: 3, h: 0.8 },
  bu_tonneau: { lab: 'Fouiller le tonneau', table: 'bu_tonneau', d: 1.1, son: 'bois', p: 0, r: 3, h: 0.95 },
  bu_caisse: { lab: 'Fouiller la caisse', table: 'bu_caisse', d: 1.2, son: 'bois', p: 0.05, r: 3, h: 0.85 },
  bu_caisses: { lab: 'Fouiller les caisses', table: 'bu_caisse', d: 1.3, son: 'bois', p: 0.05, r: 3, h: 0.95 },
  bu_sac: { lab: 'Fouiller le sac', table: 'bu_sac', d: 1.0, son: 'grain', p: 0, r: 3, h: 0.6 },
  bu_wagonnet: { lab: 'Fouiller le wagonnet', table: 'bu_wagonnet', d: 1.3, son: 'pierre', p: 0, r: 5, h: 0.9 },
  bu_coffre: { lab: 'Ouvrir le coffre', table: 'f2_malle', d: 1.5, son: 'bois', p: 0.2, r: 5, h: 0.6 },
});
// prop -> type de fouille ; h : hauteur de la cible ; av : la cible avancée devant le meuble (l'avant regarde +z)
const BU_MEUBLES = {
  etagere: { t: 'bu_etagere', h: 1.1, av: 0.42 }, table: { t: 'bu_tiroir', h: 0.8, dedans: true },
  tonneau: { t: 'bu_tonneau', h: 0.95 }, tonneau_vieux: { t: 'bu_tonneau', h: 0.9 },
  caisse: { t: 'bu_caisse', h: 0.85 }, caisses: { t: 'bu_caisses', h: 0.95 }, sac: { t: 'bu_sac', h: 0.6 }, sacs: { t: 'sacs_grain', h: 0.6 },
  wagonnet: { t: 'bu_wagonnet', h: 0.9 }, tas_bois: { t: 'tas_bois', h: 0.7 }, charrette: { t: 'charrette', h: 1.1 }, coffre_vieux: { t: 'bu_coffre', h: 0.6 },
  malle: { t: 'malle', h: 0.55, av: 0.3 }, armoire: { t: 'armoire', h: 1.1, av: 0.35 }, commode: { t: 'commode', h: 0.8, av: 0.3 }, buffet: { t: 'buffet', h: 0.9, av: 0.35 },
  jarre: { t: 'jarre', h: 0.6 },
};
// étagères : ce qu'on y range, selon la maison ou la boutique
const BU_ETAGERE_BLD = {
  mairie: 'f2_archives', boulangerie: 'f2_pains', poste: 'bu_etagere_poste', graineterie: 'f2_semences', vide6: 'f2_apothicaire', ranch: 'f2_sellerie',
  source_a: 'f2_sources', source_b: 'f2_sources', source_c: 'f2_sources', relais_chasse: 'f2_chasse', nain_a: 'f2_nain', nain_b: 'f2_nain', forge: 'f2_outils',
  cabane_pecheur: 'f2_peche', auberge: 'f2_buffet', hutte_ermite: 'f2_bocaux', eglise: 'f2_sacristie', garde: 'f2_coffre_garde',
};
// les meubles et conteneurs (le ramassage de l'agent U2 n'y touche pas : butin.conteneur)
const BU_CONTENEURS = new Set(['armoire', 'commode', 'buffet', 'malle', 'secretaire', 'coffre_fort', 'apothicaire', 'casier_tri', 'petrin', 'coffre_outils', 'poubelle', 'tronc',
  'sellerie', 'coffre_nain', 'boite_tresors', 'jambons', 'coffre', 'coffre_vieux', 'coffre_tresor', 'coffre_loc', 'coffre_enterre', 'tonneau', 'tonneau_vieux', 'caisse', 'caisses',
  'caisse_expedition', 'sac', 'sacs', 'etagere', 'jarre', 'wagonnet', 'comptoir', 'fond_casier', 'huche', 'vaisselier', 'panier', 'tiroir']);
// ce qui s'ouvre en main et garde ce qu'on y laisse (la géode, elle, se casse d'un coup)
const BU_MAIN = new Set(['coffre_peche', 'caisse_vivres', 'sac_graines']);

// ---------------------------------------------------------------- textes
const BU_TITRES = {
  armoire: 'L’armoire', commode: 'La commode', buffet: 'Le buffet', malle: 'La malle', secretaire: 'Le secrétaire', coffre_fort: 'Le coffre-fort', tiroir: 'Le tiroir-caisse',
  tonneaux: 'Le tonneau', petrin: 'Le pétrin', boite_tresors: 'La boîte à trésors', casier_tri: 'Les casiers du tri', colis: 'Les colis', baquet: 'Le baquet',
  coffre_outils: 'Le coffre à outils', sacs_grain: 'Les sacs', sacristie: 'L’armoire de la sacristie', tronc: 'Le tronc des pauvres', apothicaire: 'Les tiroirs de l’apothicaire',
  charrette: 'La charrette', caisses: 'Les caisses', etal: 'L’étal', tas_bois: 'Le tas de bois', linge: 'La corde à linge', poulailler: 'Le poulailler',
  boite_lettres: 'La boîte aux lettres', poubelle: 'La poubelle', foin: 'Le foin', sacs_avoine: 'Les sacs d’avoine', sellerie: 'La sellerie', bocaux: 'Les bocaux',
  jarre: 'La jarre', coffre_peche: 'Le coffre de pêche', coffre_chasse: 'Le coffre du chasseur', coffre_roulotte: 'Le coffre de la roulotte', coffre_nain: 'Le coffre de pierre',
  cave_tonneaux: 'Les tonneaux de la cave', cave_casier: 'Le casier à bouteilles', cave_jambons: 'Les jambons', cave_caisse: 'Les caisses de la cave', cache: 'La cachette',
  bu_etagere: 'L’étagère', bu_tiroir: 'Le tiroir de la table', bu_tonneau: 'Le tonneau', bu_caisse: 'La caisse', bu_caisses: 'Les caisses', bu_sac: 'Le sac',
  bu_wagonnet: 'Le wagonnet', bu_coffre: 'Le coffre',
};
const BU_TITRES_LAB = {
  'Fouiller l’armoire aux archives': 'L’armoire aux archives', 'Ouvrir le coffre du garde': 'Le coffre du garde', 'Ouvrir la malle du curé': 'La malle du curé',
  'Fouiller le tiroir des lettres perdues': 'Le tiroir des lettres perdues',
};
const BU_TITRES_PROPS = {
  coffre_vieux: 'Un vieux coffre', tonneau_vieux: 'Un vieux tonneau', caisse: 'Une caisse', caisses: 'Des caisses', sac: 'Un sac', barque: 'La barque',
  charrette_renversee: 'La charrette renversée', coffre_enterre: 'Un coffre enterré', wagonnet: 'Le wagonnet', tonneau: 'Un tonneau',
};
const BU_OUTILS = {
  hache: 'Abat les arbres et fend les souches. Plus le métal est bon, plus elle mord.',
  pioche: 'Casse les pierres, les rochers et le minerai.',
  houe: 'Retourne la terre avant de semer.',
  arrosoir: 'Arrose les cultures ; il se remplit au puits, à la rivière ou à l’étang.',
  faux: 'Fauche les hautes herbes, dont on fait le foin.',
  canne: 'Pour pêcher : lancez vers l’eau, et attendez que ça morde.',
  arc: 'Tendez longtemps, puis relâchez : la flèche part.',
  marteau: 'Démonte ce que vous avez posé.',
  cisailles: 'Pour tondre les moutons.',
  seau: 'Pour traire les vaches.',
  lanterne: 'Éclaire la nuit (touche F).',
  montre: 'Donne l’heure, même la nuit.',
  fourche: 'Pour remuer le foin et la paille.',
  pelle: 'Creuse la terre, là où quelque chose attend peut-être.',
};
const BU_CATS = {
  culture: 'Une récolte des champs, à manger, à cuisiner ou à vendre.',
  graine: 'Des graines, à semer dans une terre retournée à la houe, puis à arroser.',
  produit: 'Un produit de la ferme, qui se vend bien en ville.',
  cueillette: 'Cueilli dans la vallée, au bord des chemins.',
  chasse: 'Une prise de chasse.',
  poisson: 'Un poisson de la vallée.',
  materiau: 'Un matériau, pour fabriquer ou pour bâtir.',
  nourriture: 'De quoi manger.',
  outil: 'Un outil.',
  objet: 'Un objet à poser : prenez-le en main et cliquez là où vous voulez l’installer.',
  animal: 'Une bête, livrée à la ferme le lendemain matin.',
  quete: 'Un objet particulier, qu’on garde précieusement.',
  tresor: 'Une curiosité, que certains collectionnent et paient bien.',
  legende: 'Un objet dont on raconte l’histoire à la veillée.',
  construction: 'De quoi bâtir.',
  alchimie: 'Un ingrédient d’alchimie.',
  potion: 'Une potion : prenez-la en main et cliquez pour la boire.',
  relique: 'Une relique des Anciens.',
  piete: 'Un objet de piété.',
  livre: 'Un livre : prenez-le en main et cliquez pour le lire.',
  ailleurs: 'Une chose qui ne vient pas d’ici.',
  futur: 'Un objet d’un autre temps.',
};
const BU_SOUPCON = ['Vous cherchez quelque chose, là-dedans ?', 'Ce n’est pas à vous, ça. Refermez.', 'On ne fouille pas chez les gens.'];
const BU_SOUPCON_PROPRIO = ['Qu’est-ce que vous cherchez dans mes affaires ?', 'Refermez ça. Tout de suite.', 'Mes affaires ne vous regardent pas.'];

// ---------------------------------------------------------------- la génération : tout meuble ou conteneur de la vallée (après tout le reste, sans tirage)
function butinGen(w) {
  if (!w || !w.props || !w.bld || !w.inter || !w.nav) return;
  const T = w.townInfo, lm = w.lm || {}, H = lm.hameau, bl = w.bld, N0 = w.props.length;
  const proprio = (key) => { const d = NPC_DATA.find((q) => q.home === key && (q.age || 30) >= 16); return d ? d.id : null; };
  const dans = (q) => { for (const k in bl) { const b = bl[k]; if (!b || !b.f) continue; const [lx, lz] = f2Local(b.f, q.x, q.z); if (Math.abs(lx) < b.W / 2 + 0.05 && Math.abs(lz) < b.D / 2 + 0.05 && Math.abs(q.y - b.f.y) < 3) return k; } return null; };
  const prochain = (q, max) => { let best = null, bd = max; for (const k in bl) { const b = bl[k]; if (!b.f || b.under) continue; const [lx, lz] = f2Local(b.f, q.x, q.z), d = Math.hypot(Math.max(0, Math.abs(lx) - b.W / 2), Math.max(0, Math.abs(lz) - b.D / 2)); if (d < bd && Math.abs(q.y - b.f.y) < 4) { bd = d; best = k; } } return best; };
  const enVille = (q) => T && Math.abs(q.x - T.x) < 46.5 && Math.abs(q.z - T.z) < 46.5;
  const auHameau = (q) => H && Math.hypot(q.x - H.x, q.z - H.z) < 45;
  // un lieu-dit souterrain garde la hauteur du sol au-dessus de lui : on y est si l'on est sous terre, dans son rayon
  const sousTerre = (q) => q.y < w.heightAt(q.x, q.z) - 3;
  const dansLm = (q, L, m) => Math.hypot(L.x - q.x, L.z - q.z) < (L.r || 8) + m && (L.under ? sousTerre(q) : L.y === undefined || Math.abs(L.y - q.y) < 12);
  const lieuDit = (q) => { let best = null, bd = 1e9; for (const k in lm) { const L = lm[k], d = Math.hypot(L.x - q.x, L.z - q.z); if (d < bd && dansLm(q, L, 6)) { bd = d; best = k; } } return best; };
  const pres = (o, q, r, dy) => !!o && isFinite(o.x) && Math.hypot(o.x - q.x, o.z - q.z) < r && Math.abs((o.y || 0) - q.y) < dy;
  // pas là : la ferme du joueur et sa cave, la bibliothèque et les archives (leurs livres ont leur propre règle), le cachot,
  // le temple, la Fondation, la cave de l'auberge (déjà fouillable, pièce par pièce)
  const exclu = (q, key) => {
    if (key === 'ferme' || key === 'bibliotheque') return true;
    for (const [k, m] of [['archives', 4], ['cachot', 6], ['carriere_cachot', 6], ['temple', 6], ['ferme', 0]]) if (lm[k] && dansLm(q, lm[k], m)) return true;
    return pres(w.fondation, q, 45, 12) || pres(w.cellar, q, 9, 5) || pres(w.caveAuberge, q, 9, 5);
  };
  const occupe = (x, y, z, r) => w.inter.some((i) => Math.abs(i.x - x) < r && Math.abs(i.z - z) < r && Math.hypot(i.x - x, i.z - z) < r && Math.abs(i.y - y) < 2);
  let n = 0;
  for (let i = 0; i < N0; i++) {
    const q = w.props[i], R = BU_MEUBLES[q.id];
    if (!R || q.gone || q.f2 || q.ver || q.questFind || q.hole || q.fouille || q.bld) continue;
    const key = dans(q);
    if (R.dedans && !key) continue;
    if (exclu(q, key)) continue;
    if (q.id === 'table' && (key === 'auberge' || key === 'eglise')) continue; // (les tables de la salle commune sont aux clients)
    const s = q.s || 1, av = (R.av || 0) * s, r = q.r || 0;
    const x = q.x + Math.sin(r) * av, z = q.z + Math.cos(r) * av, y = q.y + R.h * s;
    if (occupe(x, y, z, 1.2) || occupe(q.x, y, q.z, 1.0)) continue;
    // à qui ? dedans : l'habitant de la maison (sinon abandonnée) ; dehors : le voisin le plus proche, la rue, ou personne
    let own = null, lieu, bp = null;
    if (key) { own = proprio(key); lieu = key === 'eglise' ? 'eglise' : own ? 'maison' : 'abandon'; }
    else { bp = prochain(q, 6); own = bp ? proprio(bp) : null; lieu = own ? 'maison' : enVille(q) || auHameau(q) ? 'public' : 'libre'; }
    const k = key || bp, ld = lieuDit(q), kind = q.data && q.data.kind;
    let t = R.t, table = null;
    const crypte = pres(w.crypt, q, 10, 5);
    if (t === 'bu_etagere') table = kind === 'livres' && k !== 'mairie' ? 'bu_etagere_livres' : BU_ETAGERE_BLD[k] || (kind === 'pain' ? 'f2_pains' : lieu === 'abandon' ? 'bu_etagere_vide' : 'bu_etagere');
    else if (crypte && (t === 'bu_caisse' || t === 'bu_caisses' || t === 'bu_tonneau')) table = 'bu_crypte';
    else if (t === 'bu_tiroir') table = lieu === 'abandon' ? 'bu_tiroir_vide' : 'bu_tiroir';
    else if (t === 'bu_tonneau') {
      if (k === 'auberge') t = 'tonneaux';
      else if (k === 'forge') t = 'baquet';
      else table = k === 'cabane_pecheur' ? 'bu_tonneau_peche' : k === 'relais_chasse' ? 'bu_tonneau_salaison' : lieu === 'libre' || q.id === 'tonneau_vieux' ? 'bu_vieux_tonneau' : 'bu_tonneau';
    } else if (t === 'bu_caisse' || t === 'bu_caisses') table = /^(mine|galeries|bouche_galerie|faille|grotte)/.test(ld || '') ? 'bu_caisse_mine' : /^(col|refuge|monts|glacier|combe)/.test(ld || '') ? 'bu_caisse_col' : k === 'poste' ? 'f2_colis' : 'bu_caisse';
    else if (t === 'bu_sac' || t === 'sacs_grain') table = k === 'graineterie' ? 'f2_semences' : k === 'boulangerie' ? 'f2_farine' : t === 'bu_sac' ? 'bu_sac' : null;
    else if (t === 'bu_coffre') table = lieu === 'abandon' ? 'f2_abandon' : null;
    else if ((t === 'armoire' || t === 'commode' || t === 'malle') && lieu === 'abandon') table = t === 'commode' ? 'f2_abandon_commode' : 'f2_abandon';
    const pool = own && F2_POOLS[own] ? own : k && F2_POOLS[k] ? k : null;
    const id = 'f2:p:' + i;
    if (w.inter.some((it) => it.id === id)) continue;
    const data = { t, own, bld: k || null, lieu, pr: i, bu: 1 };
    if (table) data.table = table;
    if (pool) data.pool = pool;
    if (lieu === 'libre') data.refill = 7; else if (lieu === 'abandon') data.refill = 6;
    w.inter.push({ kind: 'f2', id, x, y, z, name: F2_TYPES[t].lab, data });
    q.f2 = id; n++;
  }
  w.butin = { n };
}
{
  const _gv = generateValley;
  generateValley = async function (seed, progress, gen) {
    const w = await _gv(seed, progress, gen);
    if (w && w.designed) { try { butinGen(w); } catch (e) { console.error('butin', e); } }
    return w;
  };
}

// ---------------------------------------------------------------- le jeu
const butin = {
  sess: null, enc: null, branche: false, styled: false, eFerme: false, shopGarde: false,
  parProp: new Map(), propPar: new Map(), tresors: [],

  S() {
    const s = farm.s;
    if (!s) return null;
    const B = s.butin || (s.butin = { v: 1, c: {}, n: 0 });
    if (!B.c || typeof B.c !== 'object') B.c = {};
    return B;
  },
  pret() { return !!(farm.s && typeof game !== 'undefined' && game.world && typeof document !== 'undefined' && document.body && $('#paper')); },
  // ------------------------------------------------------------------ le contenu
  nettoyer(lots) {
    const out = [], ix = {};
    for (const e of lots || []) {
      if (!Array.isArray(e)) continue;
      const k = e[0], n = Math.floor(+e[1] || 0);
      if (!(n > 0) || (k !== 'argent' && !ITEMS[k])) continue;
      if (ix[k] !== undefined) { out[ix[k]][1] += n; continue; }
      ix[k] = out.length; out.push([k, n]);
    }
    return out;
  },
  // ce qui peut se prendre (un objet unique déjà en poche, une merveille déjà trouvée : non)
  prenable(k) {
    if (k === 'argent') return true;
    const I = ITEMS[k];
    if (!I || (I.unique && farm.count(k))) return false;
    try { if (typeof LEGENDAIRES !== 'undefined' && LEGENDAIRES[k] && typeof legendaires !== 'undefined' && legendaires.a && legendaires.a(k)) return false; } catch (e) { /* rien */ }
    return true;
  },
  // le contenu gardé vaut-il encore ? (un conteneur qui s'est rempli de nouveau repart d'un tirage neuf)
  valide(k, C) {
    const s = farm.s;
    if (C.src === 'f2') {
      if (typeof fouilles === 'undefined') return false;
      const it = fouilles.par.get(k);
      if (!it) return false;
      const F = fouilles.S();
      return it.data.cache ? !!F.prises[it.data.cache] : F.vides[k] === C.j;
    }
    if (C.src === 'loot') return s.looted[k] === C.j;
    return true;
  },
  papierVisible(C) { return !!(C && C.pap && typeof F2_PAPIERS !== 'undefined' && F2_PAPIERS[C.pap] && !(typeof fouilles !== 'undefined' && fouilles.S() && fouilles.S().papiers.includes(C.pap))); },
  plein(C) { return !!C && ((C.o || []).some(([k, n]) => n > 0 && this.prenable(k)) || this.papierVisible(C)); },
  reste(k) {
    const B = this.S();
    if (!B || !k) return null;
    const C = B.c[k];
    if (!C) return null;
    if (!this.valide(k, C)) { delete B.c[k]; return null; }
    return this.plein(C) ? C : null;
  },
  contenu(k) { const C = this.reste(k); return C ? C.o.filter(([id, n]) => n > 0 && this.prenable(id)).map((e) => e.slice()) : null; },
  oublier(k) { const B = this.S(); if (B) delete B.c[k]; },
  // donne sans rien montrer ce qu'une fonction aurait donné d'un coup (fouilles d'origine, coffres…)
  capturer(fn) {
    const L = [], g = farm.give, e = farm.earn, f = play.flyer;
    farm.give = (id, n = 1) => { if (n > 0) L.push([id, n]); };
    farm.earn = (n) => { if (n > 0) L.push(['argent', n]); };
    play.flyer = () => {};
    try { fn(); } finally { farm.give = g; farm.earn = e; play.flyer = f; }
    return L;
  },
  donner(L) { for (const [k, n] of L || []) { if (k === 'argent') farm.earn(n); else if (ITEMS[k]) farm.give(k, n); } },

  // ------------------------------------------------------------------ les fouilles (11-zzz98) passent par le menu
  tirerF2(it) {
    const F = fouilles.S(), s = farm.s, d = it.data, B = this.S(), Cc = d.cache ? F2_CACHES[d.cache] : null;
    const lots = d.cache ? ((Cc && Cc.lots) || []).map((a) => a.slice()) : rollLoot(fouilles.table(it));
    let pap = d.cache ? (Cc && Cc.papier) || null : fouilles.tirerPapier(it);
    if (pap && F.papiers.includes(pap)) pap = null;
    if (d.cache) F.prises[d.cache] = s.day; else F.vides[it.id] = s.day;
    F.n = (F.n || 0) + 1;
    return (B.c[it.id] = { src: 'f2', j: s.day, o: this.nettoyer(lots), pap });
  },
  titreF2(it) {
    const d = it.data || {}, maj = (t) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);
    if (d.cache && F2_CACHES[d.cache]) return maj(F2_CACHES[d.cache].nom);
    if (BU_TITRES_LAB[it.name]) return BU_TITRES_LAB[it.name];
    if (!d.lab && BU_TITRES[d.t]) return BU_TITRES[d.t];
    return maj(String(it.name || '').replace(/^(Fouiller|Ouvrir|Forcer) (le |la |les |l’)?/, (m0, v, art) => art || ''));
  },
  fouilleF2(it) {
    const C = this.reste(it.id) || this.tirerF2(it), d = it.data, own = fouilles.proprio(it);
    fouilles.majProp(it);
    return this.ouvrir({ titre: this.titreF2(it), chez: own && own.st.alive && d.lieu !== 'rebut' && !this.chezSoi(d.bld) ? (own.st.met ? `chez ${own.name}` : 'chez quelqu’un') : '', contenu: C, cle: it.id, it, x: it.x, y: it.y, z: it.z });
  },
  chezSoi(k) { try { return !!(k && typeof locations !== 'undefined' && locations.locataire && locations.locataire(k)); } catch (e) { return false; } },

  // ------------------------------------------------------------------ les coffres des lieux (game.lootBox), le temple
  titreLoot(it, q) {
    const d = it.data || {};
    if (d.temple) return d.table === 'temple_or' ? 'Le trésor des Trois' : 'Un coffre du temple';
    if (d.table === 'archives') return 'Le coffre des archives';
    if (d.table === 'crevasse') return 'Des restes, dans la glace';
    if (d.table === 'refuge') return 'Le coffre du refuge';
    if (it.id === 'chapelle_profonde') return 'Sous l’autel';
    if (q && BU_TITRES_PROPS[q.id]) return BU_TITRES_PROPS[q.id];
    if (/caisses/.test(it.name || '')) return 'Des caisses';
    return 'Ce que vous trouvez';
  },
  lootBox(it, extra) {
    const s = farm.s, w = game.world, d = it.data || {};
    let C = this.reste(it.id);
    if (!C) {
      const avant = s.looted[it.id];
      const L = this.capturer(() => this._lootBox(it));
      if (s.looted[it.id] !== s.day || avant === s.day) { this.donner(L); return; } // (vide : l'original l'a dit)
      C = this.S().c[it.id] = { src: 'loot', j: s.day, o: this.nettoyer(L) };
    }
    const q = d.prop !== undefined ? w.props[d.prop] : null;
    return this.ouvrir(Object.assign({ titre: this.titreLoot(it, q), contenu: C, cle: it.id, x: it.x, y: it.y, z: it.z }, extra || {}));
  },

  // ------------------------------------------------------------------ le menu
  ouvrir(o) {
    o = o || {};
    if (!farm.s || typeof game === 'undefined' || !game.world) return false;
    // (mourant, endormi, pendant une cinématique : pas maintenant ; ce qui est gardé attend)
    if (game.dying || game.sleeping || (typeof cine !== 'undefined' && cine.on)) return false;
    const B = this.S();
    // une clé déjà connue : son contenu gardé compte (même si « objets » est redonné) ; butin.oublier(cle) pour repartir de zéro
    const garde = !o.contenu && o.cle && B.c[o.cle] && B.c[o.cle].src === 'ext' ? B.c[o.cle] : null;
    let C = o.contenu || garde;
    if (!C) {
      const L = typeof o.objets === 'function' ? o.objets() : o.objets;
      C = { src: 'ext', j: farm.s.day, o: this.nettoyer(L), pap: o.papier || null };
      if (o.cle) B.c[o.cle] = C;
    }
    if (!this.pret()) { // (pas de page : tout d'un coup, comme avant)
      const L = C.o.splice(0);
      this.donner(L);
      for (const [k, n] of L) if (o.onPris) try { o.onPris(k, n); } catch (e) { console.error(e); }
      if (o.onFerme) try { o.onFerme(L); } catch (e) { console.error(e); }
      return false;
    }
    if (this.sess) ui.close(true);
    if (this.sess) this.clore();
    const S = { o, C, pris: [], sel: 0, k: 0, kPour: null, vus: [], cri: null, vol: false, agi: false, attrape: false, papier: null, premier: false, videAvant: !!garde && !this.plein(garde) };
    this.sess = S;
    try { this.ouvertureSociale(S); } catch (e) { console.error('butin', e); }
    if (this.sess !== S) return false;
    this.panneau();
    return true;
  },
  // qui voit ? une seule fois, à l'ouverture (même règle que 11-zzz98 : témoins, marchands qui gardent leur étal)
  ouvertureSociale(S) {
    const o = S.o, it = o.it;
    if (it) {
      const d = it.data, own = fouilles.proprio(it), vivant = !!(own && own.st.alive);
      let lieu = d.lieu || (vivant ? 'maison' : 'public');
      if (this.chezSoi(d.bld)) lieu = 'libre';
      Object.assign(S, { own, vivant, lieu, T: fouilles.type(it) });
      if (lieu === 'libre') return;
      const vus = fouilles.temoins(it, own);
      let cri = null;
      if (lieu !== 'rebut' && lieu !== 'abandon') for (const fn of fouilles.gardiens) { try { cri = fn(it); } catch (e) { console.error(e); } if (cri) break; }
      S.vus = vus; S.cri = cri;
      if (lieu === 'rebut') {
        if (vus.length) { const m = vus[0]; npcs.say(m, pick(F2_TEMOIN_REBUT), 3); npcs.addAmitie(m, -5); if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-0.3, 'fouiller les ordures', 1); }
      } else if (lieu === 'abandon' || (own && !vivant)) {
        if (vus.length) { const m = vus[0]; npcs.say(m, fmtLine(pick(own && !vivant ? F2_TEMOIN_MORT : F2_TEMOIN_ABANDON), m, { victime: own ? own.name : '' }), 3.5); for (const v of vus) npcs.addAmitie(v, -20); }
        if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(own && !vivant ? -1 : -0.4, 'fouiller chez les disparus', 2);
      } else S.vol = true; // chez quelqu'un, dans un commerce, à l'église, dans la rue : prendre sera voler
      return;
    }
    // une autre source, aux affaires d'un vivant
    const own = o.proprio ? (typeof o.proprio === 'object' ? o.proprio : npcs.byId[o.proprio]) : null;
    if (!own || !own.st || !own.st.alive || o.temoins === false) return;
    const p = game.player;
    S.itF = { id: o.cle || 'butin', x: o.x ?? p.pos[0], y: o.y ?? p.pos[1], z: o.z ?? p.pos[2], name: o.titre || '', data: { own: own.id, bld: o.bld || null, lieu: o.lieu || 'maison', lock: 0, t: 'malle' } };
    Object.assign(S, { own, vivant: true, lieu: S.itF.data.lieu, T: F2_TYPES.malle, vol: true });
    S.vus = fouilles.temoins(S.itF, own);
  },
  // le premier objet pris : c'est un vol (vu : cris, crime, garde ; pas vu : la plainte du lendemain)
  acte(S) {
    if (!S.premier) { S.premier = true; if (S.o.onPremier) try { S.o.onPremier(); } catch (e) { console.error(e); } }
    if (!S.vol || S.agi) return;
    S.agi = true;
    const it = S.o.it || S.itF, own = S.own, vivant = S.vivant;
    if (S.vus.length || S.cri) { fouilles.pris(it, vivant ? own : null, S.vus, S.cri); S.attrape = true; return; }
    if (vivant && own) fouilles.S().plaintes[own.id] = farm.s.day;
    if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer((S.T && S.T.enfant) || (it && it.data && it.data.t === 'tronc') ? -1.5 : -0.6, 'voler', 3);
  },
  // ouvert sous les yeux de quelqu'un, refermé sans rien prendre : un soupçon
  soupcon(S) {
    const own = S.own, p = game.player;
    for (const v of S.vus) { v.heading = Math.atan2(p.pos[0] - v.x, p.pos[2] - v.z); v.chatT = 0; }
    if (own && S.vus.includes(own)) { npcs.say(own, pick(BU_SOUPCON_PROPRIO), 3); npcs.addAmitie(own, -8); npcs.remember(own, 'intrus'); }
    else { const m = S.vus[0]; npcs.say(m, pick(BU_SOUPCON), 3); npcs.addAmitie(m, -3); if (own && own.st.alive) npcs.addAmitie(own, -2); }
  },
  // ce qu'on voit dans le conteneur (index dans C.o, ou le papier)
  entrees(S) {
    const C = S.C, out = [];
    C.o.forEach((e, i) => { if (e[1] > 0 && this.prenable(e[0])) out.push({ k: e[0], n: e[1], i }); });
    if (this.papierVisible(C)) out.push({ k: 'papier', n: 1, pap: C.pap });
    return out;
  },
  nomEntree(e) { return e.pap ? F2_PAPIERS[e.pap].t : e.k === 'argent' ? (e.n > 1 ? 'Des pièces' : 'Une pièce') : itemName(e.k); },
  iconeEntree(e) { return iconURL(e.pap ? 'lettre' : e.k === 'argent' ? 'vieille_piece' : e.k); },
  descEntree(e) { return e.pap ? 'Un papier plié, oublié là. Si vous le prenez, vous le lirez en refermant.' : e.k === 'argent' ? 'De la monnaie : elle va droit dans la bourse.' : this.description(e.k); },
  prendre(j, k) {
    const S = this.sess;
    if (!S) return;
    const e = this.entrees(S)[j];
    if (!e) return;
    this.retirer(S, e, e.pap ? 1 : clamp(Math.floor(k || e.n), 1, e.n));
    this.apres(S);
  },
  toutPrendre() {
    const S = this.sess;
    if (!S) return;
    let E = this.entrees(S), g = 0;
    if (!E.length) { ui.close(); return; }
    for (; E.length && g < 200; E = this.entrees(S), g++) { const e = E[E.length - 1]; this.retirer(S, e, e.pap ? 1 : e.n); }
    this.apres(S);
  },
  retirer(S, e, n) {
    const C = S.C;
    if (e.pap) {
      C.pap = null; S.papier = e.pap; S.pris.push(['papier', 1, e.pap]);
      fouilles.garderPapier(e.pap, S.o.it || null);
      sound.page && sound.page();
      return;
    }
    const L = C.o[e.i];
    L[1] -= n;
    if (L[1] <= 0) C.o.splice(e.i, 1);
    if (e.k === 'argent') { farm.earn(n); sound.coin && sound.coin(); } else { farm.give(e.k, n); sound.pop && sound.pop(); }
    S.pris.push([e.k, n]);
    const B = this.S(); B.n = (B.n || 0) + n;
    if (e.k !== 'argent' && S.vol && S.vivant && S.own) fouilles.marquer([[e.k, n]], S.own.id, S.T); // (les objets pris chez quelqu'un se reconnaissent)
    if (S.o.onPris) try { S.o.onPris(e.k, n); } catch (err) { console.error(err); }
  },
  apres(S) {
    this.acte(S);
    if (this.sess !== S) return;
    if (S.o.it) fouilles.majProp(S.o.it);
    if (S.attrape) { ui.close(); return; }
    this.maj();
    if (!this.entrees(S).length) setTimeout(() => { if (this.sess === S) ui.close(); }, 450);
  },
  clore() {
    const S = this.sess;
    if (!S) return;
    this.sess = null;
    try {
      if (S.vol && !S.agi && S.vus.length) this.soupcon(S);
      if (S.o.it) fouilles.majProp(S.o.it);
      if (S.pris.length) ui.subtitle('', `(Vous prenez : ${this.resume(S.pris)}.)`, 3.5);
      if (S.o.onFerme) try { S.o.onFerme(S.pris.filter((p) => p[0] !== 'papier').map((p) => p.slice(0, 2))); } catch (e) { console.error(e); }
      const pap = S.papier;
      if (pap && !S.attrape) setTimeout(() => { if (!ui.panel && !game.dying) fouilles.lirePapier(pap); }, 450);
      else if (pap) setTimeout(() => ui.subtitle('', '(Le papier, vous le relirez plus tard : sacoche, onglet Lettres.)', 3.5), 2600);
    } catch (e) { console.error('butin', e); }
    this.menage();
  },
  resume(pris) {
    let pieces = 0;
    const m = new Map(), paps = [];
    for (const [k, n, pap] of pris) { if (k === 'argent') pieces += n; else if (k === 'papier') paps.push(pap); else m.set(k, (m.get(k) || 0) + n); }
    const bits = [];
    if (pieces > 0) bits.push(pieces > 1 ? `${pieces} pièces` : 'une pièce');
    for (const [k, n] of m) bits.push(n > 1 ? `${itemName(k).toLowerCase()} (${n})` : itemName(k).toLowerCase());
    for (const p of paps) if (F2_PAPIERS[p]) bits.push(F2_PAPIERS[p].t.toLowerCase());
    return bits.join(', ');
  },

  // ------------------------------------------------------------------ le panneau
  htmlListe(S) {
    const E = this.entrees(S);
    if (!E.length) return `<p class="bu-vide">${S.pris.length || S.videAvant ? '(Il n’y a plus rien.)' : '(Rien qui vaille la peine. Des miettes, de la poussière.)'}</p>`;
    S.sel = clamp(S.sel, 0, E.length - 1);
    return E.map((e, j) => `<button class="row bu-it${j === S.sel ? ' on' : ''}" data-bu="${j}"><kbd>${j < 9 ? j + 1 : ''}</kbd><img src="${this.iconeEntree(e)}" alt=""><span>${esc(this.nomEntree(e))}</span><i>${e.pap ? '' : e.k === 'argent' ? e.n : '×' + e.n}</i></button>`).join('');
  },
  htmlInfo(S) {
    const e = this.entrees(S)[S.sel];
    if (!e) return '';
    const cle = e.pap || e.k;
    if (S.kPour !== cle) { S.kPour = cle; S.k = e.n; }
    S.k = clamp(S.k, 1, e.n);
    const cat = e.pap || e.k === 'argent' ? '' : ITEM_CAT_NAMES[ITEMS[e.k].cat] || '';
    const qte = e.n > 1 ? `<button class="bu-b sec" data-q="-" title="Un de moins">−</button><input class="bu-n" type="text" inputmode="numeric" value="${S.k}"><button class="bu-b sec" data-q="+" title="Un de plus">+</button>` : '';
    return `<div class="bu-t"><img src="${this.iconeEntree(e)}" alt=""><div><b>${esc(this.nomEntree(e))}</b>${cat ? `<small>${esc(cat)}</small>` : ''}</div></div>
      <p>${esc(this.descEntree(e))}</p><div class="bu-qte">${qte}<button class="bu-b" data-prendre>Prendre</button></div>`;
  },
  alerte(S) {
    if (!S.vol || S.attrape) return '';
    if (S.vus.length) { const m = S.vus[0]; return m.st && m.st.met ? `${m.name} vous regarde.` : 'Quelqu’un vous regarde.'; }
    return S.cri ? 'On vous a à l’œil.' : '';
  },
  panneau() {
    const S = this.sess;
    if (!S) return;
    this.style();
    if (!$('#butin')) { const d = document.createElement('div'); d.id = 'butin'; d.className = 'pp-panel'; $('#paper').appendChild(d); }
    const o = S.o;
    ui.open('#butin', `<div class="tabs"><b>${esc(o.titre || 'Ce que vous trouvez')}${o.chez ? ` <small class="bu-chez">${esc(o.chez)}</small>` : ''}</b><button class="x" data-fermer title="Refermer">✕</button></div>
      <div class="body"><div class="bu-liste"></div><div class="bu-info"></div></div>
      <div class="foot bu-pied"><span class="bu-alerte"></span><button class="bu-b" data-tout>Tout prendre</button><button class="bu-b sec" data-fermer>Refermer</button></div>
      <div class="bu-aide">Clic : prendre la pile · Maj+clic : choisir la quantité · 1 à 9 : prendre · T : tout prendre · E ou Échap : refermer</div>`);
    const el = $('#butin');
    el.querySelectorAll('[data-fermer]').forEach((b) => (b.onclick = () => ui.close()));
    el.querySelector('[data-tout]').onclick = () => this.toutPrendre();
    this.maj();
  },
  maj() {
    const S = this.sess, el = $('#butin');
    if (!S || !el) return;
    const li = el.querySelector('.bu-liste'), top = li ? li.scrollTop : 0;
    if (li) { li.innerHTML = this.htmlListe(S); li.scrollTop = top; }
    this.majInfo();
    const al = el.querySelector('.bu-alerte'), t = this.alerte(S);
    if (al && al.textContent !== t) al.textContent = t;
    const tout = el.querySelector('[data-tout]');
    if (tout) tout.disabled = !this.entrees(S).length;
    el.querySelectorAll('[data-bu]').forEach((b) => {
      b.onclick = (ev) => { const j = +b.dataset.bu; if (ev.shiftKey) { this.choisir(j); const inp = el.querySelector('.bu-n'); if (inp) { inp.focus(); inp.select(); } return; } this.prendre(j); };
      b.onmouseenter = () => { const j = +b.dataset.bu; if (this.sess && j !== this.sess.sel) this.choisir(j); };
    });
  },
  majInfo() {
    const S = this.sess, el = $('#butin'), inf = el && el.querySelector('.bu-info');
    if (!S || !inf) return;
    inf.innerHTML = this.htmlInfo(S);
    const moins = inf.querySelector('[data-q="-"]'), plus = inf.querySelector('[data-q="+"]'), inp = inf.querySelector('.bu-n'), pr = inf.querySelector('[data-prendre]');
    if (moins) moins.onclick = () => this.quantite(-1);
    if (plus) plus.onclick = () => this.quantite(1);
    if (inp) { inp.oninput = () => { const e = this.entrees(S)[S.sel], v = parseInt(inp.value.replace(/\D/g, ''), 10); if (e && v > 0) S.k = clamp(v, 1, e.n); }; inp.onchange = () => { inp.value = S.k; }; }
    if (pr) pr.onclick = () => this.prendre(S.sel, S.k);
  },
  choisir(j) {
    const S = this.sess;
    if (!S) return;
    const E = this.entrees(S);
    if (!E.length) return;
    S.sel = clamp(j, 0, E.length - 1);
    const el = $('#butin');
    if (el) el.querySelectorAll('[data-bu]').forEach((b) => b.classList.toggle('on', +b.dataset.bu === S.sel));
    const b = el && el.querySelector(`[data-bu="${S.sel}"]`);
    if (b && b.scrollIntoView) b.scrollIntoView({ block: 'nearest' });
    this.majInfo();
  },
  quantite(d) {
    const S = this.sess;
    if (!S) return;
    const e = this.entrees(S)[S.sel];
    if (!e || e.n < 2) return;
    S.k = clamp((S.k || e.n) + d, 1, e.n);
    const inp = $('#butin .bu-n');
    if (inp) inp.value = S.k;
    sound.click && sound.click();
  },
  clavier(e) {
    const S = this.sess, c = e.code;
    const a = document.activeElement, saisie = !!(a && a.classList && a.classList.contains('bu-n'));
    // Échap : le jeu referme le panneau (depuis la saisie aussi, d'un seul coup)
    if (c === 'Escape') { if (saisie) { e.preventDefault(); e.stopImmediatePropagation(); a.blur(); ui.close(); } return; }
    if (saisie && /^(Digit|Numpad)[0-9]$|^Backspace$|^Delete$|^Tab$/.test(c)) return;
    // (un bouton du panneau qui a gardé le focus ne doit pas se déclencher en plus : Espace, Entrée)
    if (a && a.tagName === 'BUTTON' && a.closest && a.closest('#butin')) a.blur();
    let fait = true;
    if (c === 'KeyE') { if (!e.repeat) { this.eFerme = true; ui.close(); } }
    else if (c === 'ArrowDown') this.choisir(S.sel + 1);
    else if (c === 'ArrowUp') this.choisir(S.sel - 1);
    else if (c === 'ArrowLeft' || c === 'Minus' || c === 'NumpadSubtract') this.quantite(e.shiftKey ? -10 : -1);
    else if (c === 'ArrowRight' || c === 'Equal' || c === 'NumpadAdd') this.quantite(e.shiftKey ? 10 : 1);
    else if (c === 'Enter' || c === 'NumpadEnter' || c === 'Space') { if (!e.repeat) this.prendre(S.sel, S.k); }
    else if (c === 'KeyT') { if (!e.repeat) this.toutPrendre(); }
    else if (/^(Digit|Numpad)[1-9]$/.test(c) && !saisie) { if (!e.repeat) this.prendre(+c.slice(-1) - 1); }
    else fait = false;
    if (fait) e.preventDefault();
  },

  // ------------------------------------------------------------------ les objets posés (contrat avec les agents U2 et W)
  indexer() {
    const w = game.world;
    this.parProp = new Map(); this.propPar = new Map();
    if (!w) return;
    const lier = (q, it) => { if (!q || !it || this.parProp.has(q) || this.propPar.has(it)) return; this.parProp.set(q, it); this.propPar.set(it, q); };
    const F = typeof fouilles !== 'undefined' ? fouilles : null;
    const n0 = farm.genProps || w.props.length;
    for (let i = 0; i < n0; i++) { const q = w.props[i]; if (q && q.f2 && F) lier(q, F.par.get(q.f2)); }
    for (const it of w.inter) if (it.kind === 'loot' && it.data && it.data.prop !== undefined) lier(w.props[it.data.prop], it);
    // les endroits posés sur un objet (comptoir, tonneau, caisse, étagère, jarre…) : le conteneur le plus proche
    for (const it of w.inter) {
      if ((it.kind !== 'f2' && it.kind !== 'loot' && it.kind !== 'fond_casier') || this.propPar.has(it) || (it.data && it.data.cache)) continue;
      let best = null, bd = 0.95;
      for (let i = 0; i < n0; i++) {
        const q = w.props[i];
        if (!q || !BU_CONTENEURS.has(q.id) || this.parProp.has(q) || Math.abs(q.x - it.x) > bd || Math.abs(q.z - it.z) > bd || Math.abs(q.y - it.y) > 2.5) continue;
        const d = Math.hypot(q.x - it.x, q.z - it.z);
        if (d < bd) { bd = d; best = q; }
      }
      lier(best, it);
    }
  },
  // l'interaction de fouille d'un objet posé (ou null)
  interDe(q) { if (!q) return null; const it = this.parProp.get(q); if (it) return it; return q.f2 && typeof fouilles !== 'undefined' ? fouilles.par.get(q.f2) || null : null; },
  // l'objet posé d'une interaction est-il encore là ? (cassé, ramassé : on ne le fouille plus)
  present(it) { const q = this.propPar.get(it); return !q || typeof game === 'undefined' || !game.world || game.world.live(q); },
  conteneur(q) { return !!q && (!!this.interDe(q) || BU_CONTENEURS.has(q.id)); },
  fouillable(q) { const it = this.interDe(q); return !!(it && q && game.world.live(q) && (!HOOKS.interVis[it.kind] || HOOKS.interVis[it.kind](it))); },
  // un conteneur cassé : ce qu'il reste dedans ([[id, n]…], 'argent' pour les pièces), et il est marqué vide
  vider(q) {
    const out = [];
    try {
      if (!q || !farm.s || typeof game === 'undefined' || !game.world) return out;
      if (q.data && q.data.items && typeof q.data.items === 'object') { // (coffre du joueur, charrette : leur chargement)
        for (const k in q.data.items) { const n = q.data.items[k]; if (n > 0 && ITEMS[k]) out.push([k, n]); }
        farm.setPropData(q, { items: {} });
        return out;
      }
      const it = this.interDe(q), s = farm.s;
      if (!it) return out;
      let C = this.reste(it.id);
      if (it.kind === 'f2') { if (!C && !it.data.cache && !fouilles.vide(it)) C = this.tirerF2(it); }
      else if (it.kind === 'loot') { if (!C && s.looted[it.id] === undefined) { s.looted[it.id] = s.day; C = this.S().c[it.id] = { src: 'loot', j: s.day, o: this.nettoyer(rollLoot(it.data.table)) }; } }
      else if (it.kind === 'fond_casier' && typeof fondation !== 'undefined') {
        const F = fondation.S(), k = 'casier_' + it.data.c;
        if (!F.pris[k]) { C = this.S().c['fond:' + it.data.c] || { src: 'fond', j: s.day, o: (FOND_CASIERS[it.data.c] || []).map((a) => a.slice()) }; F.pris[k] = s.day; delete this.S().c['fond:' + it.data.c]; }
      }
      if (C) {
        for (const [k, n] of C.o) if (n > 0 && this.prenable(k)) out.push([k, n]);
        if (this.papierVisible(C)) { fouilles.garderPapier(C.pap, it); ui.subtitle('', '(Un papier glisse des débris. Vous le gardez : sacoche, onglet Lettres.)', 3.5); }
        C.o = []; C.pap = null;
      }
      if (it.kind === 'f2') fouilles.majProp(it);
      this.menage();
    } catch (e) { console.error('butin.vider', e); }
    return out;
  },

  // ------------------------------------------------------------------ les coffres déterrés (cartes au trésor, secrets enfouis)
  coffreDeterre(cle, x, z, L) {
    const C = this.S().c[cle] = { src: 'tresor', j: farm.s.day, o: this.nettoyer(L), x: Math.round(x * 10) / 10, z: Math.round(z * 10) / 10 };
    this.majTresors();
    this.ouvrir({ titre: 'Le coffre enterré', contenu: C, cle, x, z });
  },
  majTresors() { const B = this.S(); this.tresors = []; if (!B) return; for (const k in B.c) { const C = B.c[k]; if (C.src === 'tresor' && this.plein(C)) this.tresors.push({ cle: k, x: C.x, z: C.z }); } },
  menage() {
    const B = this.S();
    if (!B) return;
    for (const k in B.c) {
      const C = B.c[k];
      if (!C || !Array.isArray(C.o)) { delete B.c[k]; continue; }
      if (C.src === 'ext') continue;
      if (!this.valide(k, C) || (!this.plein(C) && !(this.sess && this.sess.C === C))) delete B.c[k];
    }
    this.majTresors();
  },

  // ------------------------------------------------------------------ descriptions (menu de butin, boutique)
  description(id) {
    const it = ITEMS[id];
    if (!it) return '';
    const L = [];
    if (it.desc) L.push(it.desc);
    else if (it.tool && BU_OUTILS[it.tool]) L.push(BU_OUTILS[it.tool]);
    else if (it.crop && CROPS[it.crop]) { const c = CROPS[it.crop]; L.push(BU_CATS.graine); L.push(c.h <= 3 ? 'Pousse vite.' : c.h <= 6 ? 'Pousse en quelques heures de terre humide.' : 'Pousse lentement : il faut de la patience.'); if (c.regrow) L.push('Donne plusieurs récoltes.'); if (c.frost) L.push('Craint le gel.'); }
    else if (it.animal) L.push(BU_CATS.animal);
    else if (it.place) L.push(BU_CATS.objet);
    else if (it.open) L.push('S’ouvre en main, d’un clic.');
    else if (it.book) L.push(BU_CATS.livre);
    else if (it.potion) L.push(BU_CATS.potion);
    else L.push(BU_CATS[it.cat] || 'Un objet.');
    const f = it.food || 0, h = it.heal || 0;
    if (it.raw && f > 0) L.push('Cru, il nourrit mal : mieux vaut le faire cuire.');
    else if (f > 0) {
      L.push(f >= 35 ? 'Un vrai repas, de quoi tenir une bonne partie de la journée.' : f >= 18 ? 'De quoi tenir quelques heures.' : f >= 8 ? 'De quoi calmer une petite faim.' : 'À peine de quoi grignoter.');
      if (h >= 25) L.push('Et ça redonne des forces.'); else if (h >= 10) L.push('Et ça fait du bien.');
    } else if (h > 0) L.push(h >= 25 ? 'Soigne bien les plaies et la fatigue.' : 'Soigne un peu.');
    if (it.alcool) L.push('Il y a de l’alcool dedans.');
    return L.join(' ');
  },

  // ================================================================== la boutique
  brancherBoutique() {
    const el = $('#shop');
    if (!el) return;
    const s = farm.s;
    for (const b of el.querySelectorAll('[data-buy],[data-sell]')) {
      if (b._bu) continue;
      b._bu = true;
      const f0 = b.onclick, achat = b.hasAttribute('data-buy');
      b._buF0 = f0;
      // un article hors de portée s'ouvre quand même (pour lire sa description) ; il ne s'achète pas
      if (achat && b.disabled) { b.disabled = false; b.classList.add('bu-non'); b.dataset.buNon = s.money < +b.dataset.p ? 'argent' : 'autre'; }
      b.onclick = (e) => {
        if (e && (e.shiftKey || e.ctrlKey || e.metaKey)) { if (b.dataset.buNon) { sound.click && sound.click(); return; } return f0 ? f0(e) : undefined; }
        this.encart({ id: achat ? b.dataset.buy : b.dataset.sell, achat, pr: +b.dataset.p, f0, b });
      };
    }
    const ft = el.querySelector('.foot');
    if (ft && !ft.querySelector('.bu-pied-aide')) { const sp = document.createElement('span'); sp.className = 'bu-pied-aide'; sp.textContent = 'Clic : détails et quantité'; ft.append(' · ', sp); }
  },
  maxAchat(E) {
    const s = farm.s, it = ITEMS[E.id];
    if (!it || (E.b && E.b.dataset.buNon === 'autre')) return 0;
    let m = E.pr > 0 ? Math.floor(s.money / E.pr) : 99;
    if (it.animal) {
      const same = s.animals.filter((a) => a.kind === it.animal).length + s.pending.filter((p) => p.kind === it.animal).length;
      const barn = s.animals.filter((a) => a.kind !== 'hen').length + s.pending.filter((p) => p.kind !== 'hen').length;
      m = Math.min(m, it.animal === 'hen' ? 10 - same : 8 - barn);
    }
    if (it.unique) m = Math.min(m, farm.count(E.id) ? 0 : 1);
    return clamp(m, 0, 99);
  },
  raison(E) {
    const s = farm.s, it = ITEMS[E.id];
    if (!E.achat) return farm.count(E.id) ? '' : 'Vous n’en avez plus.';
    if (E.b && E.b.dataset.buNon === 'autre') { const sm = E.b.querySelector('span small'); return sm ? sm.textContent : 'Pas pour l’instant.'; }
    if (s.money < E.pr) return `Il vous manque ${E.pr - s.money} pièces.`;
    if (it && it.animal && E.max <= 0) return 'Vous n’avez plus de place pour loger une bête de plus.';
    return '';
  },
  encart(E) {
    const el = $('#shop');
    if (!el || !ITEMS[E.id]) return;
    this.fermerEncart();
    this.style();
    E.max = E.achat ? this.maxAchat(E) : farm.count(E.id);
    E.k = E.k ? clamp(E.k, 1, Math.max(1, E.max)) : 1;
    if (E.max <= 0) E.k = 0;
    this.enc = E;
    const v = document.createElement('div'); v.className = 'bu-voile'; v.onclick = () => this.fermerEncart();
    const d = document.createElement('div'); d.className = 'bu-encart';
    el.appendChild(v); el.appendChild(d);
    const it = ITEMS[E.id], cat = ITEM_CAT_NAMES[it.cat] || '', rs = this.raison(E), s = farm.s;
    // (une bête : on compte celles de la ferme, et celles qu'on attend)
    const n = it.animal ? s.animals.filter((a) => a.kind === it.animal).length + s.pending.filter((q) => q.kind === it.animal).length : farm.count(E.id);
    d.innerHTML = `<div class="bu-e-tete"><img src="${iconURL(E.id)}" alt=""><div><b>${esc(itemName(E.id))}</b>${cat ? `<small>${esc(cat)}</small>` : ''}</div></div>
      <p class="bu-e-desc">${esc(this.description(E.id))}</p>
      <div class="bu-e-l"><span>${E.achat ? 'Prix à l’unité' : 'Prix de reprise, à l’unité'}</span><b>${E.pr > 1 ? `${E.pr} pièces` : '1 pièce'}</b></div>
      <div class="bu-e-l"><span>${it.animal ? 'À la ferme' : 'Dans votre sacoche'}</span><b>${n}</b></div>
      <div class="bu-e-l"><span>Votre bourse</span><b>${farm.s.money > 1 ? `${farm.s.money} pièces` : farm.s.money === 1 ? 'Une pièce' : 'Pas une pièce'}</b></div>
      <div class="bu-e-qte"><span>Quantité</span><button class="bu-b sec" data-eq="-" title="Un de moins">−</button><input class="bu-e-n" type="text" inputmode="numeric" value="${E.k}"><button class="bu-b sec" data-eq="+" title="Un de plus">+</button><button class="bu-b sec" data-eq="max">Maximum (${E.max})</button></div>
      <div class="bu-e-total"><span>Total</span><b class="bu-e-tot"></b></div>
      ${rs ? `<p class="bu-e-raison">${esc(rs)}</p>` : ''}
      <div class="bu-e-actions"><button class="bu-b sec" data-eannuler>Annuler</button><button class="bu-b" data-econfirmer>${E.achat ? 'Confirmer l’achat' : 'Confirmer la vente'}</button></div>`;
    d.querySelector('[data-eq="-"]').onclick = () => this.qteEncart(-1);
    d.querySelector('[data-eq="+"]').onclick = () => this.qteEncart(1);
    d.querySelector('[data-eq="max"]').onclick = () => this.qteEncart(0, E.max);
    d.querySelector('[data-eannuler]').onclick = () => this.fermerEncart();
    d.querySelector('[data-econfirmer]').onclick = () => this.confirmerEncart();
    const inp = d.querySelector('.bu-e-n');
    inp.oninput = () => { const x = parseInt(inp.value.replace(/\D/g, ''), 10); E.k = clamp(x || 0, 0, E.max); this.totalEncart(); };
    inp.onchange = () => { inp.value = E.k; };
    this.totalEncart();
    sound.page && sound.page();
  },
  qteEncart(dk, fixe) {
    const E = this.enc, d = $('#shop .bu-encart');
    if (!E || !d) return;
    E.k = clamp(fixe !== undefined ? fixe : E.k + dk, E.max > 0 ? 1 : 0, E.max);
    const inp = d.querySelector('.bu-e-n');
    if (inp) inp.value = E.k;
    this.totalEncart();
    sound.click && sound.click();
  },
  totalEncart() {
    const E = this.enc, d = $('#shop .bu-encart');
    if (!E || !d) return;
    const t = E.pr * E.k, tot = d.querySelector('.bu-e-tot'), ok = d.querySelector('[data-econfirmer]');
    if (tot) tot.textContent = t > 1 ? `${t} pièces` : t === 1 ? 'Une pièce' : 'Rien';
    if (ok) ok.disabled = !(E.k > 0 && E.k <= E.max);
  },
  fermerEncart() {
    const el = $('#shop');
    if (el) el.querySelectorAll('.bu-voile, .bu-encart').forEach((x) => x.remove());
    this.enc = null;
  },
  // l'achat (ou la vente) passe par le bouton d'origine, par paquets de 20, 5 et 1 (Ctrl, Maj, simple), sans redessiner entre deux
  confirmerEncart() {
    const E = this.enc, s = farm.s;
    if (!E || !(E.k > 0) || E.k > E.max || !E.f0) return;
    this.fermerEncart();
    const R = ui.renderShop;
    ui.renderShop = function () {};
    try {
      let reste = E.k;
      while (reste > 0 && ui.panel === '#shop') {
        const lot = reste >= 20 ? 20 : reste >= 5 ? 5 : 1, m0 = s.money, c0 = farm.count(E.id), p0 = s.pending.length;
        E.f0({ ctrlKey: lot === 20, shiftKey: lot === 5, metaKey: false, altKey: false, preventDefault() {}, stopPropagation() {} });
        if (s.money === m0 && farm.count(E.id) === c0 && s.pending.length === p0) break;
        reste -= lot;
      }
    } catch (e) { console.error('boutique', e); } finally { ui.renderShop = R; }
    if (ui.panel === '#shop' && ui.shopN) ui.renderShop();
  },
  clavierEncart(e) {
    const c = e.code;
    if (c === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); this.fermerEncart(); return; }
    if (c === 'Enter' || c === 'NumpadEnter') { e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat) this.confirmerEncart(); return; }
    if (c === 'ArrowLeft' || c === 'ArrowDown' || c === 'NumpadSubtract' || c === 'Minus') { e.preventDefault(); this.qteEncart(e.shiftKey ? -10 : -1); }
    else if (c === 'ArrowRight' || c === 'ArrowUp' || c === 'NumpadAdd' || c === 'Equal') { e.preventDefault(); this.qteEncart(e.shiftKey ? 10 : 1); }
  },

  // ------------------------------------------------------------------ l'allure (injectée une fois)
  style() {
    if (this.styled || typeof document === 'undefined' || !document.head) return;
    this.styled = true;
    const st = document.createElement('style');
    st.id = 'butin-css';
    st.textContent = `
#butin { width: min(660px, calc(100vw - 24px)); }
#butin .tabs b .bu-chez { font-size: 13px; font-style: italic; color: #7a6a52; margin-left: 6px; }
#butin .body { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 16px; padding: 12px 16px 10px; min-height: 170px; }
#butin .bu-liste { display: flex; flex-direction: column; gap: 4px; max-height: min(392px, 52vh); overflow-y: auto; scrollbar-width: thin; padding-right: 2px; }
#butin .bu-it { margin: 0; cursor: pointer; }
#butin .bu-it kbd { flex: none; min-width: 17px; padding: 0 3px; border: 1px solid rgba(90,70,40,.35); border-radius: 3px; font: 11px Georgia, serif; color: #7a5e3a; text-align: center; background: rgba(255,255,255,.3); }
#butin .bu-it.on { border-color: #8a5a2a; background: rgba(255,228,165,.7); box-shadow: inset 3px 0 0 #8a5a2a; }
#butin .bu-vide { font-style: italic; color: #7a6a52; margin: 8px 2px; }
#butin .bu-info { border-left: 1px dashed rgba(90,70,40,.3); padding-left: 16px; font-size: 14px; }
#butin .bu-t { display: flex; gap: 10px; align-items: center; }
#butin .bu-t img { width: 40px; height: 40px; image-rendering: pixelated; flex: none; }
#butin .bu-t b { display: block; font-weight: normal; font-size: 16px; color: #2d2216; line-height: 1.2; }
#butin .bu-t small { color: #7a6a52; font-style: italic; font-size: 12px; }
#butin .bu-info p { margin: 9px 0 10px; font-size: 13px; line-height: 1.45; color: #4a3a22; font-style: italic; }
#butin .bu-qte { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
#butin .bu-qte [data-prendre] { margin-left: 4px; }
#butin .bu-pied { display: flex; align-items: center; gap: 10px; }
#butin .bu-alerte { flex: 1; color: #9a3a2a; font-style: italic; font-size: 13px; }
#butin .bu-aide { padding: 0 18px 10px; font-size: 12px; color: #8a7a62; }
.bu-b { padding: 5px 13px; background: #8a5a2a; color: #f4ead2; border: 1px solid #7a4a1a; border-radius: 3px; font: 14px Georgia, 'Times New Roman', serif; cursor: pointer; }
.bu-b.sec { background: rgba(255,255,255,.4); color: #3d2e1c; border-color: rgba(90,70,40,.4); }
.bu-b:hover:not(:disabled) { filter: brightness(1.08); }
.bu-b:disabled { opacity: .45; cursor: default; }
#butin .bu-n, #shop .bu-e-n { width: 50px; padding: 4px 2px; text-align: center; font: 15px Georgia, serif; color: #2d2216; background: rgba(255,255,255,.65); border: 1px solid rgba(90,70,40,.4); border-radius: 3px; }
#shop .row.bu-non { opacity: .5; }
#shop .bu-voile { position: absolute; inset: 0; background: rgba(40,30,15,.4); z-index: 3; }
#shop .bu-encart { position: absolute; left: 50%; bottom: 50px; transform: translateX(-50%); width: min(440px, calc(100% - 28px)); z-index: 4; background: #efe6cf; border: 1px solid rgba(90,70,40,.45); border-radius: 4px; box-shadow: 0 12px 34px rgba(0,0,0,.45), inset 0 0 34px rgba(120,90,40,.18); padding: 14px 16px 12px; font-size: 14px; color: #33291d; }
#shop .bu-e-tete { display: flex; gap: 10px; align-items: center; }
#shop .bu-e-tete img { width: 40px; height: 40px; image-rendering: pixelated; flex: none; }
#shop .bu-e-tete b { display: block; font-weight: normal; font-size: 17px; line-height: 1.2; }
#shop .bu-e-tete small { color: #7a6a52; font-style: italic; font-size: 12px; }
#shop .bu-e-desc { margin: 9px 0 10px; font-style: italic; font-size: 13px; line-height: 1.45; color: #4a3a22; }
#shop .bu-e-l { display: flex; justify-content: space-between; gap: 10px; padding: 3px 0; border-bottom: 1px dotted rgba(90,70,40,.25); }
#shop .bu-e-l b, #shop .bu-e-total b { font-weight: normal; color: #7a4a1a; }
#shop .bu-e-qte { display: flex; align-items: center; gap: 6px; margin: 11px 0 7px; flex-wrap: wrap; }
#shop .bu-e-qte > span { margin-right: auto; }
#shop .bu-e-total { display: flex; justify-content: space-between; font-size: 16px; padding: 7px 0 2px; border-top: 1px solid rgba(90,70,40,.3); }
#shop .bu-e-raison { margin: 6px 0 0; color: #9a3a2a; font-style: italic; font-size: 13px; }
#shop .bu-e-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
#shop .bu-pied-aide { font-style: italic; }
@media (max-width: 560px) {
  #butin .body { grid-template-columns: 1fr; }
  #butin .bu-info { border-left: 0; padding-left: 0; border-top: 1px dashed rgba(90,70,40,.3); padding-top: 10px; }
  #butin .bu-liste { max-height: 30vh; }
  #butin .bu-aide { display: none; }
}
`;
    document.head.appendChild(st);
  },
};

// ---------------------------------------------------------------- branchements (au chargement du module : ce qui existe déjà)
{
  // les fouilles de 11-zzz98 : le butin passe par le menu ; un conteneur où il reste quelque chose n'est pas vide
  const _vide = fouilles.vide.bind(fouilles);
  fouilles.vide = function (it) { return _vide(it) && !butin.reste(it.id); };
  const _res = fouilles.resoudre.bind(fouilles);
  fouilles.resoudre = function (it) { if (!butin.pret()) return _res(it); return butin.fouilleF2(it); };
  // un conteneur cassé ou ramassé ne se fouille plus
  const _v2 = HOOKS.interVis.f2;
  HOOKS.interVis.f2 = (it) => (!_v2 || _v2(it)) && butin.present(it);
  const _vl = HOOKS.interVis.loot;
  HOOKS.interVis.loot = (it) => (!_vl || _vl(it)) && butin.present(it);
  // ce qui reste dans une crevasse ou un coffre des lieux se reprend (le temple garde sa question)
  const _lp = HOOKS.interPre.loot;
  HOOKS.interPre.loot = (it) => { if (!(it.data && it.data.temple) && butin.reste(it.id) && butin.pret()) { game.lootBox(it); return true; } return _lp ? _lp(it) : false; };
  // le coffre englouti, la caisse de vivres, le sac de graines : on choisit, le reste attend dedans
  const _oi = play.openItem.bind(play);
  play.openItem = function (id) {
    const it = ITEMS[id];
    if (!it || !BU_MAIN.has(id) || !butin.pret() || !farm.count(id)) return _oi(id);
    const B = butin.S(), k = 'main:' + id;
    let C = butin.plein(B.c[k]) ? B.c[k] : null;
    if (!C) { C = B.c[k] = { src: 'main', j: farm.s.day, o: butin.nettoyer(rollLoot(it.open)) }; sound.lootOpen && sound.lootOpen(); }
    this.cool = 0.5;
    butin.ouvrir({ titre: itemName(id), contenu: C, cle: k, onFerme: () => { if (!butin.plein(C) && farm.take(id, 1)) delete B.c[k]; } });
  };
  // les coffres qu'on déterre (secrets enfouis, cartes au trésor)
  const _sd = dig.secretDig.bind(dig);
  dig.secretDig = function (q, c) { if (!butin.pret()) return _sd(q, c); const L = butin.capturer(() => _sd(q, c)); if (L.length) butin.coffreDeterre('tresor:' + q.id, q.x, q.z, L); };
  const _md = dig.mapDig.bind(dig);
  dig.mapDig = function (m, c) { if (!butin.pret()) return _md(m, c); const L = butin.capturer(() => _md(m, c)); if (L.length) butin.coffreDeterre('tresor:' + m.id, m.x, m.z, L); };
  // les coffres enterrés des énigmes et des caches (houe, pelle) ; la terre remuée du jour, elle, donne d'un coup
  const _du = play.digUp.bind(play);
  play.digUp = function (it) {
    if (!it || !it.data || it.data.daily || !butin.pret() || !farm.propByKind('coffre_enterre', [it.x, it.z], 2)) return _du(it);
    const L = butin.capturer(() => _du(it));
    if (L.length) butin.coffreDeterre('tresor:' + it.id, it.x, it.z, L);
  };
  // le temple : « Prendre » ouvre le menu ; la malédiction tombe au premier objet pris, pas à l'ouverture
  const _tc = temple.coffre.bind(temple);
  temple.coffre = function (it) {
    if (!butin.pret()) return _tc(it);
    const s = farm.s, last = s.looted[it.id], vide = last !== undefined && s.day - last < 3 && !butin.reste(it.id), or = it.data.table === 'temple_or';
    const opts = [];
    if (!vide) opts.push({ label: 'Prendre', fn: () => { ui.close(true); butin.lootBox(it, { onPremier: () => { temple.S().vols = (temple.S().vols || 0) + 1; setTimeout(() => malediction.frapper(or ? 'poids' : 'malchance', 'temple'), 1200); } }); } });
    if (malediction.liste().some((k) => malediction.cause(k) === 'temple')) opts.push({ label: 'Rendre ce qui a été pris', fn: () => this.rendre(it) });
    opts.push({ label: 'Laisser', fn: () => ui.close() });
    ui.choice(or ? 'Le trésor des Trois' : 'Un coffre du temple', vide ? 'Le coffre est vide. Quelqu’un est déjà passé.' : 'De l’or, des pierres, des choses données aux Trois il y a très longtemps. Rien ne vous empêche de les prendre. Rien, sinon ce qui regarde.', opts);
  };
  // les casiers de la Fondation : un témoin, et l'on vous reconduit ; sinon on choisit
  const _fc = HOOKS.inter.fond_casier;
  HOOKS.inter.fond_casier = (it) => {
    if (!butin.pret()) return _fc(it);
    const F = fondation.S(), k = 'casier_' + it.data.c, cle = 'fond:' + it.data.c, B = butin.S();
    if (F.pris[k]) return;
    const r = fondation.temoin();
    if (r) { fondation.reconduire(r, 'vol'); return; }
    let C = B.c[cle];
    if (!C) { C = B.c[cle] = { src: 'fond', j: farm.s.day, o: butin.nettoyer(FOND_CASIERS[it.data.c] || []) }; sound.lootOpen && sound.lootOpen(); }
    butin.ouvrir({ titre: 'Le casier', contenu: C, cle, x: it.x, y: it.y, z: it.z, onFerme: () => { if (!butin.plein(C)) { F.pris[k] = farm.s.day; delete B.c[cle]; } } });
  };
  // le coffre du greffe : vos affaires saisies, reprises une à une si l'on veut
  const _kg = HOOKS.inter.k_greffe;
  HOOKS.inter.k_greffe = (it) => {
    const P = prison.S(), ids = Object.keys(P.saisie || {}).filter((id) => ITEMS[id] && P.saisie[id] > 0);
    if (!butin.pret() || !ids.length) return _kg(it);
    sound.lootOpen && sound.lootOpen();
    butin.ouvrir({ titre: 'Le coffre du greffe', objets: ids.map((id) => [id, P.saisie[id]]), x: it && it.x, z: it && it.z, onPris: (id, n) => { P.saisie[id] = (P.saisie[id] || 0) - n; if (P.saisie[id] <= 0) delete P.saisie[id]; } });
  };
}
// E sur un coffre déterré où il reste quelque chose
HOOKS.target.push((eye, f, cand) => {
  if (!farm.s || !butin.tresors.length || typeof game === 'undefined' || !game.world) return;
  for (const T of butin.tresors) {
    const y = game.world.heightAt(T.x, T.z) + 0.25, dx = T.x - eye[0], dy = y - eye[1], dz = T.z - eye[2], d = Math.hypot(dx, dy, dz);
    if (d > 2.6) continue;
    const cos = (dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1);
    if (cos < 0.75) continue;
    cand({ kind: 'hook', f2lab: 'Fouiller le coffre déterré', use: () => { const C = butin.reste(T.cle); if (C) butin.ouvrir({ titre: 'Le coffre enterré', contenu: C, cle: T.cle, x: T.x, z: T.z }); } }, d * (1.6 - cos * 0.6));
  }
});
// le clavier : le menu de butin, l'encart de la boutique (avant le jeu : phase de capture)
window.addEventListener('keydown', (e) => {
  try {
    if (butin.enc && typeof ui !== 'undefined' && ui.panel === '#shop') { butin.clavierEncart(e); return; }
    if (butin.sess && typeof ui !== 'undefined' && ui.panel === '#butin') butin.clavier(e);
  } catch (err) { console.error('butin', err); }
}, true);
window.addEventListener('keyup', (e) => {
  // E a refermé le menu : le relâcher ne doit pas rouvrir le conteneur
  if (e.code === 'KeyE' && butin.eFerme) { butin.eFerme = false; if (typeof game !== 'undefined') game.holdDone = true; }
}, true);
HOOKS.update.push(() => { if (butin.sess && ui.panel !== '#butin') butin.clore(); });
HOOKS.death.push(() => { if (butin.sess && ui.panel === '#butin') ui.close(true); butin.fermerEncart(); return false; });
HOOKS.day.push(() => { if (farm.s) butin.menage(); });
HOOKS.load.push(() => {
  butin.sess = null; butin.enc = null; butin.eFerme = false; butin.shopGarde = false;
  if (!farm.s || !game.world) return;
  butin.S(); butin.indexer(); butin.menage();
  if (butin.branche) return;
  butin.branche = true;
  // les coffres des lieux : le butin tiré par 13-main.js s'ouvre dans le menu
  butin._lootBox = game.lootBox.bind(game);
  game.lootBox = function (it) { if (!butin.pret()) return butin._lootBox(it); return butin.lootBox(it); };
  // un panneau refermé (Échap, E, croix, un autre panneau) : le menu se clôt tout de suite
  const _close = ui.close.bind(ui);
  ui.close = function (silent) {
    const was = this.panel, r = _close(silent);
    if (was === '#butin' && butin.sess) butin.clore();
    if (was === '#shop') butin.enc = null;
    return r;
  };
  // la boutique : la liste reste où elle était ; un clic sur un article ouvre l'encart
  const _os = ui.openShop.bind(ui);
  ui.openShop = function (n) { butin.shopGarde = false; butin.enc = null; return _os(n); };
  const _rs = ui.renderShop.bind(ui);
  ui.renderShop = function () {
    const b0 = $('#shop .body'), top = butin.shopGarde && b0 ? b0.scrollTop : 0, enc = butin.enc;
    butin.enc = null;
    const r = _rs();
    butin.shopGarde = true;
    try {
      const b1 = $('#shop .body');
      if (b1 && top) b1.scrollTop = top;
      butin.brancherBoutique();
      if (enc) { const b = $(`#shop [data-${enc.achat ? 'buy' : 'sell'}="${enc.id}"]`); if (b && b._buF0) butin.encart({ id: enc.id, achat: enc.achat, pr: +b.dataset.p, f0: b._buF0, b, k: enc.k }); }
    } catch (e) { console.error('boutique', e); }
    return r;
  };
});
