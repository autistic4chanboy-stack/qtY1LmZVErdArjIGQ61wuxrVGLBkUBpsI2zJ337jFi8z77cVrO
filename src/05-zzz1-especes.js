// ============================================================================
//  ESPÈCES (suite) : ce qu'on voit d'une plante qu'on ne connaît pas encore
//  (l'alchimiste de la ville seul sait la nommer), quelques plantes rares en
//  plus, des poissons pour les eaux nouvelles (douves, sources chaudes,
//  souterrains, bassin du temple), et les ESSENCES cachées de chaque
//  ingrédient : l'alchimie se fait à l'aveugle (11-zzz02-alchimie.js).
// ============================================================================

// ---------------------------------------------------------------- plantes à identifier : [nom tant qu'on ne sait pas, ce qu'on en voit]
const PLANT_LOOK = {
  ail_ours: ['Larges feuilles odorantes', 'De grandes feuilles d’un vert tendre. Froissées, elles sentent fort, comme une cuisine.'],
  muguet: ['Clochettes blanches parfumées', 'De minuscules clochettes blanches sur une tige arquée. Leur parfum entête.'],
  millepertuis: ['Petites étoiles jaunes', 'Des fleurs jaunes à cinq pétales. Tenues contre le jour, les feuilles semblent percées de mille trous.'],
  valeriane: ['Racine brune malodorante', 'Une racine brune, chevelue, qui sent le vieux fromage et les pieds.'],
  sauge: ['Feuilles grises veloutées', 'Des feuilles douces comme une oreille de lapin, grises et parfumées.'],
  serpolet: ['Petite plante rampante mauve', 'Un tapis de minuscules fleurs mauves qui embaume quand on marche dessus.'],
  arnica: ['Fleur orangée des alpages', 'Une fleur jaune orangé aux pétales ébouriffés, qui pousse haut, là où l’herbe est rase.'],
  genepi: ['Touffe argentée des rochers', 'Une touffe de feuilles argentées, poilues, accrochée à une fissure.'],
  joubarbe: ['Rosette charnue des pierres', 'Une rosette épaisse, verte et rouge, qui pousse sur la pierre nue comme sur un toit.'],
  lichen: ['Croûte grise des rochers', 'Une croûte grise et frisée, grattée sur un rocher. Elle craque sous le doigt.'],
  aconit: ['Hautes fleurs bleues en casque', 'Une grande tige de fleurs bleu nuit, en forme de casques. Elles ont quelque chose de menaçant.'],
  rossolis: ['Petite plante rouge collante', 'De petites feuilles rondes, rouges, couvertes de gouttes brillantes et collantes. Un moucheron y est pris.'],
  menthe_eau: ['Tige mauve qui sent frais', 'Une tige carrée aux fleurs mauves en pompon. Elle sent le frais, et un peu la vase.'],
  prele: ['Tiges creuses en anneaux', 'Des tiges creuses, rugueuses, faites d’anneaux emboîtés. Elles grincent sous les dents.'],
  cresson: ['Petites feuilles rondes du ruisseau', 'Des feuilles rondes et luisantes, cueillies les pieds dans l’eau froide.'],
  girolle: ['Champignon jaune en entonnoir', 'Un champignon jaune d’œuf, creusé en entonnoir, aux plis sous le chapeau.'],
  cepe: ['Gros champignon brun', 'Un champignon trapu au chapeau brun, au pied ventru. Il sent la noisette.'],
  amanite: ['Champignon rouge à points blancs', 'Un chapeau rouge vif semé de flocons blancs, comme dans les livres d’images.'],
  trompette: ['Champignon noir en cornet', 'Un cornet noir et mince, qui se confond avec les feuilles mortes.'],
  morille: ['Champignon alvéolé', 'Un chapeau brun creusé d’alvéoles, comme une éponge. Le pied est creux.'],
  lycopode: ['Mousse en guirlande', 'Une mousse raide qui court au sol en guirlandes. Secouée, elle lâche une poudre jaune.'],
  belladone_baies: ['Baies noires luisantes', 'Des baies noires et brillantes comme des yeux, posées dans une étoile de sépales.'],
  perce_neige: ['Clochette blanche des neiges', 'Une clochette blanche penchée, sortie à travers la neige. Trois pétales, et un cœur vert.'],
  linaigrette: ['Houppe de coton blanc', 'Une houppe de fils blancs au bout d’une tige, comme un flocon de coton.'],
  ortie: ['Feuilles qui piquent', 'Des feuilles dentées qui brûlent la peau. Vous le savez, maintenant.'],
  tussilage: ['Fleur jaune sans feuilles', 'Une fleur jaune sur une tige écailleuse, sans une seule feuille autour.'],
  colchique: ['Fleur mauve sans tige', 'Une fleur mauve pâle qui sort de terre sans feuilles, comme une flamme de bougie.'],
  digitale: ['Hautes clochettes pourpres', 'Une haute hampe de clochettes pourpres, tachetées dedans. Un doigt y entrerait.'],
  orchidee: ['Fleur rose étrange', 'Une fleur rose aux formes bizarres : on dirait une petite bête posée sur la tige.'],
  reine_pres: ['Grappes crème des berges', 'Des grappes mousseuses de fleurs crème, au parfum de miel et d’amande.'],
  achillee: ['Ombelles blanches, feuilles plumeuses', 'De petites fleurs blanches en plateau, et des feuilles fines comme des plumes.'],
  gentiane: ['Trompette bleu profond', 'Une grande trompette d’un bleu profond, posée presque à même le sol.'],
  edelweiss: ['Étoile laineuse des cimes', 'Une étoile de velours blanc, comme taillée dans de la laine.'],
  cynorhodon: ['Petits fruits rouges épineux', 'De petits fruits rouges et durs, pleins de graines qui grattent.'],
  baies_sureau: ['Grappes de baies noires', 'Des grappes de petites baies noires qui tachent les doigts en violet.'],
  baies_houx: ['Baies rouges luisantes', 'Des baies rouges, parfaites, sur des feuilles piquantes.'],
  fleur_tilleul: ['Fleurs pâles d’un grand arbre', 'Des fleurs pâles et parfumées, accrochées à une petite aile de feuille.'],
  lys_cimes: ['Lys blanc des éboulis', 'Un lys d’un blanc presque bleu, poussé seul dans les pierres. Il ne se fane pas.'],
  mousse_nains: ['Mousse dorée des cavernes', 'Une mousse courte qui brille faiblement d’or dans l’obscurité.'],
  asphodele: ['Épi de fleurs pâles des tombes', 'Un épi de fleurs blanches veinées de rose, qui aime les ruines et les cimetières.'],
  fleur_temple: ['Fleur de pierre', 'Une fleur dure et froide, grise comme du granit. Elle a pourtant un parfum.'],
};

// ---------------------------------------------------------------- plantes rares en plus (même forme que PLANTES2)
const PLANTES3 = [
  ['lys_cimes', 'Lys des cimes', 'Lys des cimes', [0.5, 0.65], ['lys_cimes', 1, 1], ['rochers', 'neiges'], 3, { heal: 20 }],
  ['mousse_nains', 'Mousse des nains', 'Mousse des nains', [0.1, 0.14], ['mousse_nains', 1, 2], ['souterrain', 'rochers'], 2, {}],
  ['asphodele', 'Asphodèle', 'Asphodèle', [0.7, 0.9], ['asphodele', 1, 1], ['ville', 'lande'], 2, {}],
  ['fleur_temple', 'Fleur de pierre', 'Fleur de pierre', [0.3, 0.4], ['fleur_temple', 1, 1], ['souterrain'], 4, {}],
];
{
  const IC = { lys_cimes: ['c2_fleur', '#f4f8ff', '#b0c8e0'], mousse_nains: ['lichen', '#d8b040'], asphodele: ['c2_fleur', '#f0e0e8', '#c07890'], fleur_temple: ['c2_fleur', '#9a9a98', '#5a5a58'] };
  const PRIX = [6, 14, 30, 60, 120];
  for (const [id, name, single, h, drop, hab, rar, fx] of PLANTES3) {
    OBJ_TYPES.push({ id, name, cat: 'Fleurs', spr: ['w3_' + id], h, col: 0, sway: 0.12, spacing: 0.9, sink: 0.04 });
    HARVEST[id] = { tool: 'main', hp: 0, drop: [drop], regrow: 48 };
    defItem(drop[0], single, 'cueillette', PRIX[rar], IC[drop[0]], Object.assign({ wild: true }, fx));
    PLANTES2.push([id, name, single, h, drop, hab, rar, fx]);
    ESPECES_PLANTES.push([id, hab, rar]);
  }
  OBJ_TYPES.forEach((t, i) => { OBJ_INDEX[t.id] = i; });
}
// pissenlits, orties : tout le monde les reconnaît
if (ITEMS.pissenlit) ITEMS.pissenlit.wild = false;
PLANTES_BANALES.add('pissenlit');

// ---------------------------------------------------------------- poissons des eaux nouvelles
Object.assign(FISH, {
  carpe_miroir: { name: 'Carpe miroir', price: 45, where: ['douves', 'etang'], time: 'tout', w: 3, col: '#b89a4a' },
  brochet_douves: { name: 'Le vieux brochet des douves', price: 380, where: ['douves'], time: 'nuit', w: 0.15, col: '#4a5a3a' },
  truite_arc: { name: 'Truite arc-en-ciel', price: 60, where: ['riviere', 'lac'], time: 'jour', w: 1.2, col: '#c89090' },
  poisson_source: { name: 'Poisson des sources', price: 35, where: ['bains'], time: 'tout', w: 4, col: '#e0c8a0' },
  anguille_argent: { name: 'Anguille d’argent', price: 160, where: ['bains', 'souterrain'], time: 'nuit', w: 0.5, col: '#d0d8e0' },
  ecrevisse_aveugle: { name: 'Écrevisse aveugle', price: 55, where: ['souterrain'], time: 'tout', w: 2, col: '#f0e8e0' },
  truite_pierre: { name: 'Truite de pierre', price: 90, where: ['souterrain'], time: 'tout', w: 1.5, col: '#8a8a88' },
  poisson_ancien: { name: 'Poisson des Anciens', price: 1200, where: ['temple'], time: 'tout', w: 0.08, col: '#e8d080' },
  lamproie: { name: 'Lamproie', price: 40, where: ['riviere', 'douves'], time: 'nuit', w: 1.5, col: '#5a5048' },
  gremille: { name: 'Grémille', price: 14, where: ['lac', 'etang', 'douves'], time: 'jour', w: 4, col: '#9a9a6a' },
  blennie: { name: 'Blennie des sources', price: 22, where: ['bains', 'riviere'], time: 'jour', w: 3, col: '#8a9a7a' },
});
for (const id of ['carpe_miroir', 'brochet_douves', 'truite_arc', 'poisson_source', 'anguille_argent', 'ecrevisse_aveugle', 'truite_pierre', 'poisson_ancien', 'lamproie', 'gremille', 'blennie']) {
  defItem(id, FISH[id].name, 'poisson', FISH[id].price, ['poisson', FISH[id].col], { food: 6, heal: 2, raw: true });
  ITEM_GROUPS.poisson.push(id);
}
FISH.carpe.where.push('douves'); FISH.perche.where.push('douves'); FISH.tanche.where.push('douves');
FISH.poisson_roche.where.push('temple'); FISH.poisson_aveugle.where.push('temple');
ITEMS.poisson_ancien.desc = 'Des écailles comme des pièces d’or anciennes, frappées d’un signe que personne ne sait lire.';
ITEMS.brochet_douves.desc = 'On le disait mort depuis le siège. Il a une vieille pointe de flèche plantée dans la mâchoire.';
// les eaux (pour le livre des poissons)
const EAUX = { lac: 'le grand lac', etang: 'les étangs', marais: 'le marais', riviere: 'la rivière', lac_noir: 'le lac Noir', lac_gele: 'le lac gelé (sous la glace)',
  douves: 'les douves de la ville', bains: 'les sources chaudes', souterrain: 'les eaux souterraines', temple: 'le bassin du temple', mine: 'le puits de la mine', envers: 'l’Envers' };

// ---------------------------------------------------------------- les essences (cachées) de chaque ingrédient
// vie ↔ mort, feu ↔ froid, lumière ↔ ombre, terre ↔ air ; eau, esprit, sang, sort n'ont pas d'opposé
const ESSENCE_NAMES = { vie: 'Vie', mort: 'Mort', feu: 'Feu', froid: 'Froid', eau: 'Eau', terre: 'Terre', air: 'Air', ombre: 'Ombre', lumiere: 'Lumière', esprit: 'Esprit', sang: 'Sang', sort: 'Fortune' };
const ESSENCE_OPP = [['vie', 'mort'], ['feu', 'froid'], ['lumiere', 'ombre'], ['terre', 'air']];
const ESSENCES = {
  // plantes de la vallée
  herbes: { vie: 2, terre: 1 }, fleur: { vie: 1, air: 1 }, champignon: { terre: 2, ombre: 1 }, baies: { vie: 1, sang: 1 }, trefle: { sort: 3, vie: 1 },
  ail_ours: { vie: 2, feu: 1 }, muguet: { mort: 2, lumiere: 1 }, millepertuis: { lumiere: 3, vie: 1 }, valeriane: { ombre: 2, esprit: 1 },
  sauge: { vie: 2, esprit: 1 }, serpolet: { feu: 1, air: 2 }, arnica: { vie: 3, sang: 1 }, genepi: { froid: 2, esprit: 2 }, joubarbe: { terre: 2, eau: 1 },
  lichen: { terre: 1, froid: 1, air: 1 }, aconit: { mort: 3, froid: 1 }, rossolis: { sang: 2, esprit: 1 }, menthe_eau: { eau: 2, froid: 1 },
  prele: { terre: 2, air: 1 }, cresson: { eau: 2, vie: 1 }, girolle: { terre: 1, feu: 1 }, cepe: { terre: 2, vie: 1 }, amanite: { mort: 2, esprit: 2 },
  trompette: { ombre: 2, terre: 1 }, morille: { terre: 2, sort: 1 }, lycopode: { feu: 2, air: 1 }, belladone_baies: { mort: 2, ombre: 2 },
  perce_neige: { froid: 2, vie: 1 }, linaigrette: { air: 3 }, ortie: { sang: 1, feu: 1 }, tussilage: { air: 1, vie: 1, eau: 1 }, colchique: { mort: 2, terre: 1 },
  digitale: { mort: 2, sang: 2 }, orchidee: { esprit: 2, sort: 2 }, reine_pres: { vie: 2, eau: 1 }, achillee: { vie: 2, sang: 1 }, gentiane: { froid: 1, vie: 2, lumiere: 1 },
  edelweiss: { lumiere: 2, froid: 2, sort: 1 }, cynorhodon: { vie: 1, feu: 1 }, baies_sureau: { ombre: 1, vie: 1 }, baies_houx: { mort: 1, feu: 1 }, fleur_tilleul: { ombre: 1, eau: 1, esprit: 1 },
  lys_cimes: { lumiere: 3, esprit: 2 }, mousse_nains: { terre: 3, lumiere: 1 }, asphodele: { mort: 2, esprit: 1 }, fleur_temple: { esprit: 3, terre: 2, sort: 1 },
  fleur_lune: { lumiere: 2, esprit: 2 }, champi_lumineux: { lumiere: 2, terre: 1 }, mandragore: { terre: 3, esprit: 2, mort: 1 }, pissenlit: { vie: 1, air: 1 },
  lavande: { air: 1, esprit: 1 }, miel: { vie: 2, sort: 1 }, rosee: { eau: 2, lumiere: 1 }, eau_benite: { lumiere: 2, vie: 1 }, larme_dame: { eau: 3, esprit: 2 },
  // bêtes
  plume: { air: 2 }, plume_noire: { ombre: 2, air: 1 }, plume_hibou: { ombre: 1, esprit: 1, air: 1 }, plume_bleue: { eau: 1, air: 2 }, plume_aigle: { air: 2, lumiere: 1, sang: 1 },
  aile_chauve_souris: { ombre: 2, air: 1 }, venin: { mort: 3 }, mue_serpent: { mort: 1, esprit: 1, terre: 1 }, croc: { sang: 3 }, os: { mort: 1, terre: 1 }, poudre_os: { mort: 1, terre: 2 },
  peau_salamandre: { feu: 3, mort: 1 }, ecaille_tortue: { terre: 2, eau: 1 }, viande: { sang: 2 }, oeuf: { vie: 1, terre: 1 }, lait: { vie: 1, eau: 1 }, fourrure: { feu: 1, terre: 1 },
  bois_de_cerf: { esprit: 1, terre: 1, sang: 1 }, graisse_ours: { feu: 2, sang: 1 }, griffe_ours: { sang: 2, terre: 1 },
  // pierres, métaux, étrangetés
  eclat: { esprit: 2, ombre: 1 }, gemme: { lumiere: 2, sort: 1 }, perle: { eau: 2, sort: 1 }, vieille_piece: { sort: 2 }, charbon: { feu: 2, ombre: 1 }, argile: { terre: 2, eau: 1 },
  silex: { feu: 1, terre: 1 }, fossile: { terre: 2, esprit: 1 }, sel: { froid: 1, terre: 1 }, cendre_sacree: { feu: 1, esprit: 2 }, poussiere_etoile: { lumiere: 2, air: 2 },
  // poissons
  anguille: { eau: 2, ombre: 1 }, poisson_aveugle: { ombre: 2, eau: 1 }, poisson_lune: { lumiere: 1, eau: 1, esprit: 1 }, poisson_roche: { terre: 2, eau: 1 },
  ecrevisse_aveugle: { ombre: 1, eau: 1, sang: 1 }, anguille_argent: { eau: 2, lumiere: 1 }, poisson_ancien: { esprit: 3, sort: 2 }, carpe: { eau: 1, vie: 1 },
};
// Résultat d'un mélange : [essence dominante, seconde] -> potion (les paires sont dans l'ordre alphabétique)
const ALCH_SINGLE = {
  vie: 'potion_soin', mort: 'fiole_poison', feu: 'potion_chaleur', froid: 'potion_sang_froid', eau: 'potion_apnee', terre: 'potion_force', air: 'potion_legerete',
  ombre: 'potion_silence', lumiere: 'potion_nyctalopie', esprit: 'potion_clairvoyance', sang: 'potion_vigueur', sort: 'potion_chance',
};
const ALCH_PAIRS = {
  'terre+vie': 'potion_croissance', 'eau+vie': 'potion_regeneration', 'sang+vie': 'baume_moelle', 'esprit+vie': 'eau_lustrale', 'lumiere+vie': 'antidote',
  'feu+vie': 'potion_chaleur', 'froid+vie': 'potion_givre', 'ombre+vie': 'somnifere', 'sort+vie': 'philtre_charme', 'air+vie': 'potion_celerite',
  'mort+ombre': 'philtre_envers', 'esprit+mort': 'philtre_morts', 'mort+sang': 'appat_empoisonne', 'mort+terre': 'fiole_poison', 'eau+mort': 'fiole_poison',
  'air+mort': 'mixture', 'mort+sort': 'fiel_noir', 'feu+mort': 'fiole_poison', 'froid+mort': 'potion_givre', 'lumiere+mort': 'antidote',
  'feu+terre': 'potion_force', 'air+feu': 'potion_celerite', 'feu+sang': 'potion_vigueur', 'esprit+feu': 'philtre_charme', 'feu+lumiere': 'potion_soleil',
  'feu+ombre': 'potion_chaleur', 'feu+sort': 'potion_chance', 'eau+feu': 'mixture',
  'eau+froid': 'potion_apnee', 'froid+terre': 'potion_peau_pierre', 'air+froid': 'potion_legerete', 'esprit+froid': 'potion_sang_froid', 'froid+ombre': 'potion_silence',
  'froid+lumiere': 'potion_nyctalopie', 'froid+sang': 'potion_givre', 'froid+sort': 'potion_chance',
  'eau+terre': 'potion_croissance', 'air+eau': 'potion_silence', 'eau+ombre': 'potion_apnee', 'eau+lumiere': 'eau_benite', 'eau+esprit': 'potion_memoire', 'eau+sang': 'potion_regeneration', 'eau+sort': 'potion_chance',
  'ombre+terre': 'potion_peau_pierre', 'lumiere+terre': 'potion_croissance', 'esprit+terre': 'potion_clairvoyance', 'sang+terre': 'potion_force', 'sort+terre': 'potion_chance',
  'air+ombre': 'potion_silence', 'air+lumiere': 'potion_clairvoyance', 'air+esprit': 'potion_songe', 'air+sang': 'potion_celerite', 'air+sort': 'potion_chance',
  'esprit+ombre': 'philtre_envers', 'ombre+sang': 'potion_nyctalopie', 'ombre+sort': 'fiel_noir',
  'esprit+lumiere': 'potion_clairvoyance', 'lumiere+sang': 'antidote', 'lumiere+sort': 'eau_lustrale',
  'esprit+sang': 'philtre_charme', 'esprit+sort': 'elixir_souffle', 'sang+sort': 'potion_vigueur',
};
// nouvelles potions (effets : 11-zzz02-alchimie.js)
Object.assign(POTIONS, {
  fiole_poison: { name: 'Fiole de poison', col: '#304020', need: null, h: 0, desc: 'Ça ne se boit pas. Versé sur de la viande, ça fait un appât mortel.' },
  potion_chaleur: { name: 'Potion de chaleur', col: '#e06020', need: null, h: 10, desc: 'Le froid ne mord plus.' },
  potion_sang_froid: { name: 'Potion de sang-froid', col: '#90c0e0', need: null, h: 8, desc: 'Ni les murmures ni les cris ne vous font plus rien.' },
  potion_regeneration: { name: 'Potion de régénération', col: '#e07080', need: null, h: 6, desc: 'Les blessures se referment d’elles-mêmes, lentement.' },
  baume_moelle: { name: 'Baume de moelle', col: '#f0e0b0', need: null, h: 0, desc: 'Ressoude les os brisés en une nuit… ou en une heure.' },
  eau_lustrale: { name: 'Eau lustrale', col: '#f0f8ff', need: null, h: 0, desc: 'Lave ce qui colle à l’âme : les malédictions légères s’en vont.' },
  potion_givre: { name: 'Potion de givre', col: '#c0e8f8', need: null, h: 0, desc: 'Le sang qui coule se fige. Arrête les saignements.' },
  philtre_morts: { name: 'Philtre des morts', col: '#506050', need: null, h: 2, desc: 'Pour un moment, on entend ce que disent les morts.' },
  appat_empoisonne: { name: 'Appât empoisonné', col: '#6a3020', need: null, h: 0, desc: 'Posé dans un piège, il tue ce qui le mord.' },
  fiel_noir: { name: 'Fiel noir', col: '#1a1010', need: null, h: 0, desc: 'Personne ne sait pourquoi on en fabrique. Surtout pas celui qui le boit.' },
  potion_soleil: { name: 'Potion de soleil', col: '#ffe060', need: null, h: 12, desc: 'Protège les yeux de l’éclat du soleil, et efface les taches qu’il y a laissées.' },
  potion_peau_pierre: { name: 'Potion de peau de pierre', col: '#8a8a80', need: null, h: 3, desc: 'Les coups portent deux fois moins.' },
  potion_memoire: { name: 'Eau de mémoire', col: '#80a0e0', need: null, h: 0, desc: 'On se souvient de mots qu’on n’a jamais appris.' },
  potion_songe: { name: 'Potion de songe', col: '#c0a0e0', need: null, h: 24, desc: 'La nuit suivante, le rêve montre quelque chose de vrai.' },
});
for (const id of ['fiole_poison', 'potion_chaleur', 'potion_sang_froid', 'potion_regeneration', 'baume_moelle', 'eau_lustrale', 'potion_givre', 'philtre_morts', 'appat_empoisonne', 'fiel_noir', 'potion_soleil', 'potion_peau_pierre', 'potion_memoire', 'potion_songe']) {
  const P = POTIONS[id];
  defItem(id, P.name, 'potion', 60 + (P.h > 6 ? 30 : 0), ['fiole', P.col], { potion: id, desc: P.desc });
}
ITEMS.baume_moelle.price = 180; ITEMS.eau_lustrale.price = 150; ITEMS.fiel_noir.price = 5; ITEMS.fiole_poison.price = 20; ITEMS.appat_empoisonne.price = 25;
// ingrédients en plus
defItem('graisse_ours', 'Graisse d’ours', 'materiau', 40, ['pot', '#e8d8a8'], { alch: true, desc: 'Contre le froid, dit-on, et contre les engelures.' });
defItem('griffe_ours', 'Griffe d’ours', 'materiau', 55, ['croc', '#3a2a20'], { alch: true, desc: 'Longue comme un doigt, et bien plus dure.' });
defItem('sel', 'Sel', 'materiau', 4, ['sachet', '#f0f0f0'], { alch: true, desc: 'Du sel gris, en gros grains. Il conserve, et il protège, disent les vieux.' });
defItem('cendre_sacree', 'Cendre sacrée', 'materiau', 60, ['sachet', '#8a8078'], { alch: true, desc: 'Ramassée au pied de l’autel d’un temple que personne ne connaît.' });
defItem('poussiere_etoile', 'Poussière d’étoile', 'materiau', 200, ['sachet', '#d0d8ff'], { alch: true, desc: 'Tombée du ciel une nuit d’étoiles filantes. Elle brille encore un peu.' });
for (const id of Object.keys(ESSENCES)) if (ITEMS[id] && !ITEMS[id].alch && id !== 'viande' && id !== 'oeuf' && id !== 'lait' && id !== 'miel' && id !== 'carpe') ITEMS[id].alch = true;
