// ============================================================================
//  LA NATURE (données ; agent C2, huitième vague) — suite dans 11-zzzz8-nature.js
//  - CHAQUE PLANTE SON OBJET : les fleurs qui donnaient toutes des « Fleurs des
//    champs », les buissons, les fougères, les roseaux, les nénuphars, les
//    souches ont désormais leur propre objet (nom, icône, prix modeste,
//    description sobre), leur effet quand on les mange (11-zzzz8 : règles de
//    ALIMENTS_EFFETS) et leurs essences d'alchimie (ESSENCES). L'ancien objet
//    reste utilisable : « fleur », « baies » et « bois » deviennent des groupes
//    « au choix » qui les contiennent (ITEM_GROUPS), et toutes les recettes, les
//    quêtes et les machines qui les demandaient prennent n'importe laquelle.
//  - Les champignons rouges d'autrefois s'appellent maintenant des russules.
//  (les types d'objets du décor nouveaux ne sont PAS déclarés ici : 11-zzzz8 les
//  ajoute après tous les autres, pour que les numéros des types anciens restent
//  les mêmes — voir l'empreinte de tools/equilibrage/vm.js)
// ============================================================================
const NAT_PRIX = [1, 2, 5, 12, 25]; // prix selon la rareté (comme les plantes d'avant)
function natItem(id, name, price, ic, extra) {
  if (!ITEMS[id]) defItem(id, name, 'cueillette', price, ic, extra || {});
  return ITEMS[id];
}

// ---------------------------------------------------------------- les fleurs d'avant : chacune son objet
// [type du décor, objet, nom, prix, icône, faim/soin/poison, description, [min, max]]
const NAT_FLEURS = [
  ['poppies', 'coquelicot', 'Coquelicots', 1, ['c2_fleur', '#e03020', '#2a1414'], { food: 1 }, 'Des pétales froissés comme du papier de soie. En sirop, ils font dormir les enfants.', [1, 2]],
  ['daisies', 'marguerite', 'Marguerites', 1, ['c2_fleur', '#f4f4ec', '#f0c030'], { heal: 2 }, 'Un peu, beaucoup, passionnément. Les vieilles en font une tisane contre la toux.', [1, 2]],
  ['cornflower', 'bleuet', 'Bleuets', 1, ['c2_fleur', '#4a70e0', '#23306a'], { heal: 1 }, 'L’herbe à casse-lunettes : on en baigne les yeux fatigués.', [1, 2]],
  ['heather', 'bruyere', 'Bruyère', 1, ['c2_lavande', '#c070b0', '#6a7a4a'], { heal: 1 }, 'Des brins durs aux clochettes roses. Les abeilles l’aiment, les chèvres aussi.', [1, 1]],
  ['jacinthe', 'jacinthe', 'Jacinthes des bois', 1, ['c2_lavande', '#5a60d0', '#4a8a3a'], { heal: -4, poison: true }, 'Des clochettes bleues toutes penchées du même côté. Le bulbe est un poison.', [1, 2]],
  ['lupin', 'lupin', 'Lupins', 1, ['c2_lavande', '#7060d0', '#4a7a3a'], { food: 1 }, 'Les graines sont amères, et malsaines crues. Trempées trois jours, elles nourrissent.', [1, 2]],
  ['lupin2', 'lupin_blanc', 'Lupins blancs', 1, ['c2_lavande', '#f0f0f0', '#4a7a3a'], { food: 1 }, 'Le lupin des champs, qu’on semait autrefois pour engraisser la terre.', [1, 2]],
  ['iris', 'iris', 'Iris des marais', 1, ['c2_tulipe', '#f0d020', '#806010'], { heal: -5, poison: true }, 'Un iris jaune, les pieds dans l’eau. La racine purge violemment.', [1, 2]],
  ['bouton_or', 'bouton_or', 'Boutons d’or', 1, ['c2_fleur', '#f8e020', '#b09010'], { heal: -3, poison: true }, 'Des coupes jaunes vernies. Mâchés, ils brûlent la bouche : les vaches les laissent.', [1, 1]],
  ['primevere', 'primevere', 'Primevères', 1, ['c2_fleur', '#f8f0a0', '#e0a020'], { heal: 2 }, 'Les coucous, les clés du ciel. La tisane apaise et fait dormir.', [1, 1]],
  ['violette', 'violette', 'Violettes', 1, ['c2_fleur', '#7040a0', '#f0e070'], { food: 1, heal: 2 }, 'Petites, cachées, parfumées. En sirop, contre la toux.', [1, 1]],
  ['trefle_f', 'trefle_fleur', 'Fleurs de trèfle', 1, ['c2_fleur', '#d06080', '#f0b0c0'], { food: 2 }, 'On en suce le bout, comme les enfants : c’est sucré.', [1, 1]],
  ['campanule', 'campanule', 'Campanules', 1, ['c2_tulipe', '#8090e0', '#4a7a3a'], { food: 1 }, 'Des cloches bleues sur la lande. La racine de la raiponce, sa cousine, se mange.', [1, 2]],
  ['chardon', 'chardon', 'Têtes de chardon', 1, ['c2_dahlia', '#a050a0', '#607040'], { food: 1 }, 'Épineuses. Le cœur se mange, comme un petit artichaut.', [1, 1]],
  ['mauve', 'mauve', 'Mauves', 1, ['c2_fleur', '#c070c0', '#803080'], { heal: 3 }, 'Émolliente : elle adoucit la gorge et le ventre.', [1, 2]],
  ['rhododendron', 'rhododendron', 'Fleurs de rhododendron', 2, ['c2_rose', '#e04070', '#304a20'], { heal: -10, poison: true }, 'La rose des Alpes. Le miel qu’on en tire rend fou ; la fleur, pire.', [1, 2]],
  ['myosotis', 'myosotis', 'Myosotis', 1, ['c2_fleur', '#70a0f0', '#f0e070'], { heal: 1 }, 'Ne m’oubliez pas.', [1, 1]],
  ['jonquille', 'jonquille', 'Jonquilles', 1, ['c2_tulipe', '#f8d020', '#f09020'], { heal: -5, poison: true }, 'Le bulbe ressemble à un oignon. Il n’en est pas un.', [1, 2]],
];
// les autres plantes d'avant qui n'avaient pas d'objet à elles
// [type du décor, objet, nom, prix, icône, faim/soin/poison, description, [min, max, proba]]
const NAT_AUTRES = [
  ['bush', 'prunelle', 'Prunelles', 1, ['baies', '#3a3a6a'], { food: 2, heal: 1 }, 'Âpres à faire grimacer ; après les gelées, un peu moins.', [0, 2, 0.35]],
  ['fern', 'fougere', 'Fougère', 1, ['herbes', '#3a7a30'], { heal: -1 }, 'On en garnit les paillasses : les puces n’aiment pas.', [1, 1]],
  ['reeds', 'roseau', 'Roseaux', 1, ['fibre', '#a8a060'], { food: 1 }, 'Des tiges creuses. La racine se mange, en temps de disette.', [1, 1]],
  ['lilypad', 'nenuphar', 'Fleurs de nénuphar', 1, ['c2_fleur', '#f8f8f0', '#f0d040'], { heal: 1 }, 'Le lis des étangs. Les moines, dit-on, en buvaient pour rester sages.', [1, 1]],
];
for (const [obj, id, name, pr, ic, fx, desc, n] of NAT_FLEURS.concat(NAT_AUTRES)) {
  natItem(id, name, pr, ic, Object.assign({ desc }, fx));
  if (obj === 'lilypad') { HARVEST.lilypad = { tool: 'main', hp: 0, drop: [[id, n[0], n[1]]], regrow: 30 }; continue; }
  const H = HARVEST[obj];
  if (!H) continue;
  // premier butin : l'objet de la plante (les graines, le trèfle à quatre feuilles et les fibres suivent)
  let reste = H.drop.filter(([k]) => k !== 'fleur' && k !== 'herbes' && !(obj === 'bush' && k === 'baies'));
  if (obj === 'reeds') reste = [['fibre', 1, 2]];
  H.drop = [n.length > 2 ? [id, n[0], n[1], n[2]] : [id, n[0], n[1]]].concat(reste);
}
// la lavande et le tournesol sauvages donnent la lavande et le tournesol ; le buisson à baies, des myrtilles
HARVEST.lavender.drop = [['lavande', 1, 2]].concat(HARVEST.lavender.drop.filter(([k]) => k !== 'fleur' && k !== 'herbes'));
HARVEST.sunflower.drop = [['tournesol', 1, 1, 0.45]].concat(HARVEST.sunflower.drop.filter(([k]) => k !== 'fleur'));
HARVEST.berry.drop = [['myrtille', 1, 3]].concat(HARVEST.berry.drop.filter(([k]) => k !== 'baies'));
if (ITEMS.lavande && !ITEMS.lavande.heal) Object.assign(ITEMS.lavande, { heal: 1, desc: ITEMS.lavande.desc || 'Elle parfume le linge et chasse les mites. En tisane, elle calme.' });
// les fleurs en plus sur la digitale, l'églantier et le sureau : ce sont leurs propres fruits et fleurs, maintenant
for (const obj of ['digitale', 'eglantier', 'sureau']) if (HARVEST[obj]) HARVEST[obj].drop = HARVEST[obj].drop.filter(([k]) => k !== 'fleur');
// les champignons rouges des bois : des russules (le même objet, rebaptisé ; une souche donne des armillaires)
if (ITEMS.champignon) Object.assign(ITEMS.champignon, { name: 'Russules', desc: 'Des chapeaux rouges, un pied blanc et cassant. Certaines se mangent, d’autres font vomir ; on ne les distingue qu’au goût.' });
if (OBJ_INDEX.mushroom !== undefined) OBJ_TYPES[OBJ_INDEX.mushroom].name = 'Russules';
natItem('armillaire', 'Armillaires', 1, ['champi', '#c8a040'], { food: 3, desc: 'Des touffes de chapeaux miel, serrés au pied des souches. Crus, ils rendent malade ; cuits, ils se mangent.' });
if (HARVEST.stump) HARVEST.stump.drop = HARVEST.stump.drop.map((d) => (d[0] === 'champignon' ? ['armillaire', d[1], d[2], d[3]] : d));
// les baies sauvages d'avant (le groupe « baies ») et les fruits (confitures)
natItem('mure', 'Mûres', 1, ['c2_baie', '#2a1a3a', '#5a8a3a'], { food: 3, heal: 1, desc: 'Noires et tièdes de soleil. Les doigts en restent violets ; les bras, griffés.' });
natItem('fraise_bois', 'Fraises des bois', 1, ['c2_baie', '#e03040', '#4a8a3a'], { food: 3, heal: 2, desc: 'Minuscules, parfumées, cachées sous les feuilles. On en trouve une, puis dix.' });
natItem('airelle', 'Airelles', 1, ['c2_baie', '#d02030', '#3a6a2a'], { food: 3, heal: 2, desc: 'Petites, rouges et acides, sur un buisson ras aux feuilles de buis. En confiture, avec le gibier.' });

// ---------------------------------------------------------------- les groupes « au choix »
// (un groupe qui porte le nom d'un objet le contient : l'objet d'avant compte toujours ; farm.take est adapté dans
// 11-zzzz8-nature.js pour ne pas tourner en rond)
{
  const FLEURS = ['fleur'].concat(NAT_FLEURS.map((f) => f[1]), ['lavande', 'nenuphar', 'pissenlit', 'reine_pres', 'achillee', 'tussilage', 'millepertuis', 'muguet', 'perce_neige',
    'colchique', 'digitale', 'arnica', 'aconit', 'gentiane', 'asphodele', 'orchidee', 'edelweiss', 'lys_cimes']).filter((id, i, a) => ITEMS[id] && a.indexOf(id) === i);
  // les moins chères d'abord : une recette prend la fleur la plus commune avant l'edelweiss
  const ordre = (L) => L.slice(0, 1).concat(L.slice(1).sort((a, b) => (ITEMS[a].price || 0) - (ITEMS[b].price || 0)));
  ITEM_GROUPS.fleur = ordre(FLEURS);
  GROUP_NAMES.fleur = 'fleurs (au choix)';
  for (const id of ITEM_GROUPS.fleur) if (!ITEM_GROUPS.fleur_c.includes(id)) ITEM_GROUPS.fleur_c.push(id);
  ITEM_GROUPS.baies = ['baies', 'myrtille', 'mure', 'fraise_bois', 'airelle', 'prunelle', 'framboise', 'groseille', 'cassis', 'cynorhodon', 'baies_sureau'].filter((id) => ITEMS[id]);
  GROUP_NAMES.baies = 'baies (au choix)';
  for (const id of ['mure', 'fraise_bois', 'airelle', 'prunelle']) if (!ITEM_GROUPS.fruit.includes(id)) ITEM_GROUPS.fruit.push(id);
  for (const id of ['mauve', 'primevere', 'violette', 'marguerite', 'sauge', 'serpolet', 'menthe_eau']) if (ITEMS[id] && !ITEM_GROUPS.aromate.includes(id)) ITEM_GROUPS.aromate.push(id);
  // les champignons qui se mangent (une omelette, une poêlée)
  ITEM_GROUPS.champi_bon = ['champignon', 'girolle', 'cepe', 'trompette', 'morille', 'armillaire'].filter((id) => ITEMS[id]);
  GROUP_NAMES.champi_bon = 'champignons comestibles (au choix)';
}

// ---------------------------------------------------------------- les bois : un par essence d'arbre
// [objet, nom, écorce, cœur, description, arbres qui le donnent]
const NAT_BOIS = [
  ['bois_sapin', 'Bois de sapin', '#5a4a3a', '#ecd8b0', 'Léger et droit : des planches, des poutres, des cercueils.', ['sapin', 'sapin_neige']],
  ['bois_pin', 'Bois de pin', '#7a5238', '#e0b878', 'Résineux, il colle aux doigts et flambe d’un coup.', ['pine']],
  ['bois_peuplier', 'Bois de peuplier', '#9a9a8a', '#f0e8d0', 'Blanc, léger, sans force. De bonnes caisses, de mauvaises poutres.', ['peuplier']],
  ['bois_bouleau', 'Bois de bouleau', '#e8e4dc', '#e0cca0', 'L’écorce blanche brûle même mouillée.', ['birch']],
  ['bois_aulne', 'Bois d’aulne', '#5a5048', '#e0a070', 'Coupé, il rougit en quelques minutes, comme s’il saignait. Sous l’eau, il dure toujours.', ['aulne']],
  ['bois_hetre', 'Bois de hêtre', '#8a8a82', '#d8b890', 'Pâle, serré, sans nœuds. Les sabotiers et les tourneurs ne jurent que par lui.', ['hetre']],
  ['bois_chataignier', 'Bois de châtaignier', '#5a4030', '#c8a068', 'Il fend droit ; un piquet de châtaignier tient trente ans en terre.', ['chataignier']],
  ['bois_chene', 'Bois de chêne', '#5a4632', '#b08a5a', 'Dur, lourd, et qui sent le tanin. Une charpente de chêne passe les siècles.', ['oak', 'giantoak']],
  ['bois_erable', 'Bois d’érable', '#7a6a58', '#f0dcb8', 'Clair et dur. Les tables de cuisine, les manches, les violons.', ['erable']],
  ['bois_saule', 'Bois de saule', '#6a6048', '#e8d8b8', 'Tendre et souple. L’écorce, en tisane, fait tomber la fièvre.', ['saule']],
  ['bois_meleze', 'Bois de mélèze', '#7a4a30', '#d89a68', 'Rouge et gras de résine : il ne pourrit pas sous la pluie.', ['meleze']],
  ['bois_tilleul', 'Bois de tilleul', '#8a7a62', '#f0e0b8', 'Doux sous le couteau : les sculpteurs de saints n’en veulent pas d’autre.', ['tilleul']],
  ['bois_mort', 'Bois mort', '#5a5048', '#a09078', 'Sec et gris, rongé de galeries. Il brûle bien, et vite.', ['deadtree']],
  ['bois_pommier', 'Bois de pommier', '#6a5040', '#d8a878', 'Dur et rosé. Il fait de bons manches, et sa fumée parfume les jambons.', ['apple']],
  ['bois_poirier', 'Bois de poirier', '#6a5448', '#d0a080', 'Si fin qu’on y grave les planches des imprimeurs.', ['poirier']],
  ['bois_prunier', 'Bois de prunier', '#5a4040', '#b87058', 'Veiné de violet, capricieux. Pour les petits objets.', ['prunier']],
  ['bois_merisier', 'Bois de merisier', '#6a3a30', '#c07a58', 'Le bois du cerisier : rose au sciage, il rougit avec les années.', ['cerisier']],
  ['bois_noyer', 'Bois de noyer', '#4a3a2e', '#7a5438', 'Brun, veiné de noir. Les beaux meubles, les crosses de fusil.', ['noyer']],
  ['bois_if', 'Bois d’if', '#6a3a28', '#c86a40', 'Rouge au cœur, blanc sous l’écorce. L’arbre des cimetières ; ses arcs ne rompent pas.', ['if']],
  ['bois_houx', 'Bois de houx', '#6a7a5a', '#f4f0e0', 'Blanc comme l’os, dur comme la corne.', ['houx']],
  ['bois_foudre', 'Bois foudroyé', '#2a2420', '#6a5040', 'Noirci d’un côté, fendu jusqu’au cœur. On en garde un éclat sur soi, dit-on, et la foudre passe.', ['foudroye']],
];
const NAT_BOIS_DE = {}; // arbre -> son bois
for (const [id, name, ecorce, coeur, desc, arbres] of NAT_BOIS) {
  defItem(id, name, 'materiau', 0, ['n2_buche', ecorce, coeur], { desc, bois: true });
  for (const a of arbres) {
    NAT_BOIS_DE[a] = id;
    const H = HARVEST[a];
    if (H && H.drop) H.drop = H.drop.map((d) => (d[0] === 'bois' ? [id].concat(d.slice(1)) : d));
  }
}
defItem('coeur_chene', 'Cœur de chêne', 'materiau', 20, ['n2_buche', '#3a2a1a', '#e0c080'], { desc: 'Le cœur du vieux chêne, dur comme la pierre, veiné d’or. Il sent encore la sève, après mille ans.', bois: true });
if (HARVEST.giantoak) HARVEST.giantoak.drop.push(['coeur_chene', 1, 1]);
// « bois (au choix) » : l'ancienne bûche d'abord, les bois communs, puis les bois fins (une recette les prend en dernier)
ITEM_GROUPS.bois = ['bois'].concat(NAT_BOIS.map((b) => b[0]));
GROUP_NAMES.bois = 'bois (au choix)';
ITEM_GROUPS.bois_dur = ['bois_hetre', 'bois_erable', 'bois_chene', 'bois_pommier', 'bois_poirier', 'bois_chataignier', 'bois_prunier', 'bois_houx', 'bois_merisier', 'bois_noyer'];
GROUP_NAMES.bois_dur = 'bois dur (au choix : hêtre, érable, chêne, bois fruitier…)';
// les outils et les ouvrages des bois
defItem('manche', 'Manche d’outil', 'materiau', 1, ['n2_manche', '#c8a070'], { desc: 'Un manche droit, poli à la main, dans un bois dur.' });
defItem('arc_if', 'Arc d’if', 'outil', 320, ['arc', '#8a3a24'], { tool: 'arc', power: 1.7, desc: 'Taillé dans un seul bâton d’if, le cœur rouge dedans, l’aubier blanc dehors. Il tire loin, et fort.' });
defItem('baton_houx', 'Bâton de houx', 'outil', 40, ['n2_baton', '#e8e4d0'], { tool: 'baton', desc: 'Un bâton blanc et dur, à hauteur d’épaule. En main, on grimpe les pentes un peu plus raides.' });
// meubles fins (ils se posent comme les autres, d'un bois qui se voit)
defItem('commode_noyer', 'Commode de noyer', 'objet', 14, ['objet', 'commode'], { place: 'commode', fin: 'noyer', desc: 'Trois tiroirs à poignées de laiton, dans un noyer sombre et veiné.' });
defItem('armoire_chene', 'Armoire de chêne', 'objet', 10, ['objet', 'armoire'], { place: 'armoire', fin: 'chene', desc: 'Une armoire de chêne massif, lourde comme une maison. Elle survivra à tout le monde.' });
defItem('table_merisier', 'Table de merisier', 'objet', 6, ['objet', 'table'], { place: 'table', fin: 'merisier', desc: 'Une table de merisier, rose le jour, rouge à la chandelle.' });
defItem('lit_noyer', 'Lit de noyer', 'objet', 16, ['objet', 'lit'], { place: 'lit', fin: 'noyer', desc: 'Un lit de noyer à haut chevet. Posé chez vous, on y dort.' });

// ---------------------------------------------------------------- les essences (alchimie) des objets nouveaux ou oubliés
Object.assign(ESSENCES, {
  coquelicot: { sang: 1, ombre: 1 }, marguerite: { lumiere: 1, vie: 1 }, bleuet: { eau: 1, lumiere: 1 }, bruyere: { terre: 1, air: 1 }, jacinthe: { ombre: 1, eau: 1 },
  lupin: { terre: 1, sang: 1 }, lupin_blanc: { terre: 1, lumiere: 1 }, iris: { eau: 2, sang: 1 }, bouton_or: { feu: 1, lumiere: 1 }, primevere: { vie: 1, esprit: 1 },
  violette: { ombre: 1, vie: 1 }, trefle_fleur: { vie: 1, terre: 1 }, campanule: { air: 2 }, chardon: { terre: 1, feu: 1 }, mauve: { eau: 1, vie: 1 },
  rhododendron: { mort: 1, feu: 1, esprit: 1 }, myosotis: { eau: 1, esprit: 1 }, jonquille: { lumiere: 1, mort: 1 },
  prunelle: { froid: 1, sang: 1 }, fougere: { ombre: 2, sort: 1 }, roseau: { eau: 1, air: 1 }, nenuphar: { eau: 2, ombre: 1 }, armillaire: { terre: 1, mort: 1 },
  mure: { sang: 1, vie: 1 }, fraise_bois: { vie: 1, sang: 1 }, airelle: { froid: 1, sang: 1 }, myrtille: { vie: 1, ombre: 1 }, tournesol: { lumiere: 2, feu: 1 },
  noix: { terre: 1, esprit: 1 }, pomme: { vie: 1, terre: 1 }, poire: { vie: 1, eau: 1 }, cerise: { sang: 1, vie: 1 }, prune: { ombre: 1, vie: 1 }, chataigne: { terre: 2 },
  // quelques bois ont leur place sur la table d'alchimiste
  bois_if: { mort: 2, esprit: 1 }, bois_houx: { vie: 1, froid: 1 }, bois_foudre: { feu: 2, air: 1, lumiere: 2 }, bois_noyer: { ombre: 1, esprit: 1 },
  bois_aulne: { eau: 1, sang: 1 }, bois_saule: { eau: 1, ombre: 1 }, bois_bouleau: { lumiere: 1, vie: 1 }, bois_mort: { mort: 1, air: 1 }, bois_tilleul: { esprit: 1, vie: 1 },
  coeur_chene: { terre: 3, vie: 2, esprit: 2 },
});
// (les bois vont sur la table d'alchimiste, qui lit ESSENCES, mais pas dans l'alambic)
for (const id of Object.keys(ESSENCES)) if (ITEMS[id] && ITEMS[id].cat === 'cueillette') ITEMS[id].alch = true;

// ============================================================================
//  LES PLANTES NOUVELLES (46) : fleurs des prés, herbes des chemins, poisons des
//  décombres, plantes du sous-bois, champignons, plantes d'eau, de la lande et
//  des hauteurs. Chacune : son objet, son allure tant que l'alchimiste ne l'a
//  pas nommée (les plus connues n'en ont pas besoin), sa notice pour l'herbier,
//  ses essences. Effets, remarques de l'alchimiste et peuplement : 11-zzzz8.
// ============================================================================
// o : type du décor, nom : son nom, it : l'objet, un : le nom de l'objet, h : hauteur, n : [min, max] cueillis,
// hab : milieux, r : rareté (0 commune … 4 légendaire), fx : faim/soin/poison, ic : icône, cat : catégorie du décor,
// desc : description (vraie), look : [allure, ce qu'on en voit] (à faire nommer) ou rien, note : notice de l'herbier,
// ess : essences
const NAT_PLANTES = [
  // ---- les prés, les chemins, les fermes
  { o: 'paquerette', nom: 'Pâquerettes', it: 'paquerette', un: 'Pâquerettes', h: [0.16, 0.2], n: [1, 3], hab: ['pres', 'ferme', 'ville'], r: 0, fx: { food: 1, heal: 2 }, ic: ['c2_fleur', '#f8f4ec', '#f0c030'], cat: 'Fleurs',
    desc: 'De petites marguerites qui s’ouvrent au soleil et se ferment le soir. On en frotte les bosses des enfants.', note: 'Partout où l’herbe est rase : les prés, les cours de ferme, les cimetières.', ess: { vie: 1, lumiere: 1 } },
  { o: 'oseille', nom: 'Oseille sauvage', it: 'oseille', un: 'Feuilles d’oseille', h: [0.35, 0.5], n: [1, 3], hab: ['pres', 'ferme'], r: 0, fx: { food: 3 }, ic: ['c2_salade', '#6aa040', '#a04030'], cat: 'Végétation',
    desc: 'Acide à faire pleurer. En soupe, avec une pomme de terre, c’est le printemps.', note: 'Des feuilles en fer de lance, et des épis rouillés. Trop en manger fatigue les reins.', ess: { eau: 1, sang: 1 } },
  { o: 'plantain', nom: 'Plantain', it: 'plantain', un: 'Feuilles de plantain', h: [0.2, 0.3], n: [1, 2], hab: ['pres', 'ferme', 'ville'], r: 0, fx: { heal: 3 }, ic: ['c2_herbe', '#5a8a40'], cat: 'Végétation',
    desc: 'Des feuilles nervurées comme une paume, le long des chemins. Mâché et posé sur une coupure, il arrête le sang.', note: 'Il suit les hommes : on le trouve là où l’on marche. L’herbe aux coupures.', ess: { vie: 1, terre: 1, sang: 1 } },
  { o: 'barbe_bouc', nom: 'Salsifis des prés', it: 'barbe_bouc', un: 'Barbe-de-bouc', h: [0.55, 0.8], n: [1, 1], hab: ['pres'], r: 1, fx: { food: 4, heal: 1 }, ic: ['c2_fleur', '#f0d040', '#c0a020'], cat: 'Fleurs',
    look: ['Grosse houppe de soie grise', 'Une fleur jaune qui se ferme à midi, et plus tard une grosse boule de soie grise, bien plus grande que celle d’un pissenlit.'],
    desc: 'Le salsifis des prés. La fleur se ferme à midi ; la racine se mange, douce comme un navet.', note: 'On l’appelle aussi « ferme-à-midi ». La racine se mange, cuite.', ess: { air: 2, terre: 1 } },
  { o: 'cardamine', nom: 'Cardamines des prés', it: 'cardamine', un: 'Cardamine', h: [0.3, 0.42], n: [1, 2], hab: ['pres', 'berges'], r: 0, fx: { food: 2, heal: 1 }, ic: ['c2_fleur', '#e8d8f0', '#b090c0'], cat: 'Fleurs',
    look: ['Fleurs lilas des prés humides', 'Des fleurs à quatre pétales, d’un lilas si pâle qu’on les dirait blanches. Les feuilles piquent la langue comme du cresson.'],
    desc: 'La cardamine, le cresson des prés. Elle pique un peu ; les vaches n’en veulent pas.', note: 'Dans les prés humides, au printemps. Elle se mange comme le cresson.', ess: { eau: 1, air: 1 } },
  { o: 'verveine', nom: 'Verveine officinale', it: 'verveine', un: 'Verveine', h: [0.55, 0.8], n: [1, 2], hab: ['pres', 'ferme', 'ville'], r: 1, fx: { heal: 3 }, ic: ['c2_lavande', '#b8a0d8', '#5a7a3a'], cat: 'Fleurs',
    look: ['Tige raide aux fleurs minuscules', 'Une tige carrée et raide, presque nue, au bout de laquelle s’ouvrent quelques fleurs mauves, minuscules. Rien de remarquable.'],
    desc: 'L’herbe sacrée, l’herbe aux sorciers. On la cueillait sans fer, de la main gauche, avant le lever du soleil.', note: 'Le long des chemins et des murs. Les anciens la tenaient pour sacrée ; les sorciers aussi.', ess: { esprit: 2, lumiere: 1 } },
  { o: 'mouron', nom: 'Mouron rouge', it: 'mouron', un: 'Mouron rouge', h: [0.14, 0.18], n: [1, 2], hab: ['ferme', 'pres'], r: 0, fx: { heal: -4, poison: true }, ic: ['c2_fleur', '#e05020', '#6a2040'], cat: 'Fleurs',
    look: ['Minuscules fleurs écarlates', 'Des fleurs rouge orangé, pas plus grosses qu’un ongle, sur une plante couchée. Elles étaient fermées ce matin.'],
    desc: 'Le mouron des champs, baromètre du pauvre : ses fleurs se ferment quand la pluie approche. Il empoisonne les oiseaux, et les enfants.', note: 'Dans les champs et les jardins. Ses fleurs se ferment avant la pluie.', ess: { air: 1, eau: 1, mort: 1 } },
  { o: 'bouillon_blanc', nom: 'Bouillon-blanc', it: 'bouillon_blanc', un: 'Fleurs de bouillon-blanc', h: [1.3, 1.9], n: [1, 2], hab: ['lande', 'ferme', 'pres'], r: 1, fx: { heal: 4 }, ic: ['c2_lavande', '#f0d040', '#a0a898'], cat: 'Fleurs',
    desc: 'Une grande chandelle de laine grise, piquée de fleurs jaunes. La tisane adoucit la toux ; la hampe séchée, trempée de suif, fait une torche.', note: 'Sur les talus et les terres pauvres. Les feuilles sont douces comme une couverture.', ess: { feu: 1, air: 1 } },
  { o: 'armoise', nom: 'Armoise', it: 'armoise', un: 'Armoise', h: [0.9, 1.3], n: [1, 2], hab: ['ferme', 'ville', 'lande'], r: 1, fx: { heal: 1 }, ic: ['herbes', '#a0a8a0'], cat: 'Végétation',
    look: ['Haute herbe aux feuilles argentées dessous', 'Des feuilles découpées, vert sombre dessus, blanches et duveteuses dessous. Froissées, elles sentent l’encens.'],
    desc: 'L’herbe de la Saint-Jean. Glissée sous l’oreiller, dit-on, elle fait rêver juste.', note: 'Au bord des chemins, près des maisons. Les voyageurs en mettaient dans leurs souliers.', ess: { esprit: 2, ombre: 1 } },
  { o: 'coprin', nom: 'Coprins chevelus', it: 'coprin', un: 'Coprins', h: [0.2, 0.28], n: [1, 3], hab: ['pres', 'ferme', 'ville'], r: 1, fx: { food: 4, heal: 1 }, ic: ['champi', '#f0ece0'], cat: 'Champignons',
    look: ['Champignon blanc en forme d’œuf', 'Un champignon blanc, haut et serré comme un œuf posé sur un doigt, hérissé d’écailles. Le bord noircit déjà.'],
    desc: 'Le coprin, l’encrier : jeune, il se mange ; vieux, il fond en une encre noire dont on écrivait autrefois.', note: 'Au bord des chemins, sur les terres remuées. Il faut le cueillir le matin même.', ess: { eau: 1, ombre: 1 } },
  // ---- les décombres et les vieux murs (les poisons des sorcières)
  { o: 'jusquiame', nom: 'Jusquiame noire', it: 'jusquiame', un: 'Jusquiame', h: [0.5, 0.8], n: [1, 1], hab: ['ville', 'ferme'], r: 2, fx: { heal: -12, poison: true }, ic: ['c2_fleur', '#d8c890', '#5a2a4a'], cat: 'Fleurs',
    look: ['Plante gluante aux fleurs veinées de violet', 'Des feuilles poisseuses qui sentent mauvais, et des fleurs couleur de vieux papier, veinées de violet comme des paupières.'],
    desc: 'L’herbe aux sorcières, la mort-aux-poules. Ses graines, jetées sur la braise, font voir et entendre ce qui n’est pas là.', note: 'Sur les décombres et au pied des vieux murs. Toute la plante est un poison.', ess: { ombre: 2, esprit: 2, mort: 1 } },
  { o: 'datura', nom: 'Datura', it: 'datura', un: 'Pommes épineuses', h: [0.7, 1.1], n: [1, 1], hab: ['ferme', 'ville'], r: 2, fx: { heal: -14, poison: true }, ic: ['c2_tulipe', '#f4f4f0', '#6a8a40'], cat: 'Fleurs',
    look: ['Grande trompette blanche et fruit épineux', 'Une longue fleur blanche en trompette, qui s’ouvre le soir, et un fruit vert hérissé d’épines comme une châtaigne.'],
    desc: 'La pomme épineuse, l’herbe du diable. Arrivée on ne sait d’où, elle pousse sur les fumiers et les décombres. Qui en mange ne sait plus où il est.', note: 'Sur les fumiers et les terrains vagues. Elle ne fleurit que le soir.', ess: { esprit: 3, ombre: 1, mort: 1 } },
  { o: 'chelidoine', nom: 'Grande chélidoine', it: 'chelidoine', un: 'Chélidoine', h: [0.4, 0.7], n: [1, 2], hab: ['ville', 'ferme'], r: 1, fx: { heal: -6, poison: true }, ic: ['c2_fleur', '#f0c020', '#6a8a50'], cat: 'Fleurs',
    look: ['Fleurs jaunes au suc orange', 'De petites fleurs jaunes à quatre pétales. La tige cassée pleure un lait orange qui tache les doigts.'],
    desc: 'L’herbe aux verrues : son lait orange les brûle. Les hirondelles, dit-on, en frottaient les yeux de leurs petits pour les ouvrir.', note: 'Au pied des murs, dans les fentes des pierres, près des maisons.', ess: { lumiere: 2, feu: 1 } },
  { o: 'rue', nom: 'Rue des jardins', it: 'rue', un: 'Rue', h: [0.5, 0.7], n: [1, 1], hab: ['ville', 'ferme'], r: 3, fx: { heal: -3 }, ic: ['herbes', '#8aa0a0'], cat: 'Végétation',
    look: ['Touffe bleutée à l’odeur forte', 'Des feuilles gris-bleu, rondes et découpées, et des fleurs jaunes. L’odeur est si forte qu’elle reste sur les mains.'],
    desc: 'L’herbe de grâce. On en pendait au-dessus des portes contre le mauvais œil ; les femmes grosses la fuyaient.', note: 'Échappée des vieux jardins de curé. Rare.', ess: { lumiere: 2, mort: 1 } },
  // ---- le sous-bois
  { o: 'anemone', nom: 'Anémones des bois', it: 'anemone', un: 'Anémones', h: [0.22, 0.3], n: [1, 2], hab: ['foret', 'bouleaux'], r: 0, fx: { heal: -3, poison: true }, ic: ['c2_fleur', '#f8f8f4', '#e0c040'], cat: 'Fleurs',
    look: ['Étoiles blanches du sous-bois', 'Une fleur blanche à six pétales, lavée de rose au revers, qui tremble au moindre souffle.'],
    desc: 'La sylvie, la fleur du vent. Elle couvre les bois avant que les arbres ne feuillent ; elle brûle la bouche et l’estomac.', note: 'En tapis dans les bois clairs, au printemps.', ess: { air: 2, mort: 1 } },
  { o: 'pervenche', nom: 'Pervenches', it: 'pervenche', un: 'Pervenche', h: [0.16, 0.22], n: [1, 2], hab: ['foret', 'ville'], r: 1, fx: { heal: 1 }, ic: ['c2_fleur', '#6070d0', '#f0f0f0'], cat: 'Fleurs',
    look: ['Fleur bleue aux pétales tordus', 'Une fleur bleu-violet à cinq pétales comme tordus par le vent, sur une tige qui court au sol.'],
    desc: 'La violette des sorciers. On en tressait des couronnes pour les condamnés qu’on menait au gibet.', note: 'Sous les haies et dans les cimetières. Toujours verte, même l’hiver.', ess: { esprit: 2, mort: 1 } },
  { o: 'sceau_salomon', nom: 'Sceau-de-Salomon', it: 'sceau_salomon', un: 'Sceau-de-Salomon', h: [0.5, 0.8], n: [1, 1], hab: ['foret', 'combe'], r: 1, fx: { heal: -5, poison: true }, ic: ['n2_clochettes', '#f0f0e0'], cat: 'Végétation',
    look: ['Tige arquée aux clochettes pendantes', 'Une tige courbée comme un arc, et dessous, pendues deux par deux, des clochettes blanches bordées de vert.'],
    desc: 'La racine porte des cicatrices rondes, comme des sceaux. Les baies noires font vomir ; la racine râpée efface les bleus.', note: 'Dans les bois ombreux. On dit que Salomon y apposa son sceau.', ess: { sort: 1, terre: 1, esprit: 1 } },
  { o: 'parisette', nom: 'Parisette', it: 'parisette', un: 'Baie de parisette', h: [0.3, 0.4], n: [1, 1], hab: ['combe', 'foret'], r: 2, fx: { heal: -15, poison: true }, ic: ['c2_belladone', '#1a1a3a', '#4a7a3a'], cat: 'Végétation',
    look: ['Une seule baie noire sur quatre feuilles', 'Quatre larges feuilles en croix, et au centre, sur un fil, une baie d’un bleu-noir, luisante comme un œil qui regarde.'],
    desc: 'Le raisin de renard, l’herbe à Pâris. Une baie, une seule : ceux qui la goûtent voient tourner le monde, puis ne voient plus rien.', note: 'Dans les combes humides, à l’ombre. Une seule baie par pied.', ess: { mort: 2, ombre: 1, esprit: 1 } },
  { o: 'oxalis', nom: 'Pain-de-coucou', it: 'oxalis', un: 'Oxalis', h: [0.14, 0.2], n: [1, 2], hab: ['foret', 'sapiniere'], r: 0, fx: { food: 1, heal: 1 }, ic: ['c2_salade', '#8ac070', '#f0f0f0'], cat: 'Végétation',
    look: ['Petit trèfle aigrelet du sous-bois', 'Trois feuilles en cœur qui se replient la nuit, et de petites fleurs blanches veinées de rose. Au goût : acide.'],
    desc: 'L’oxalis, pain-de-coucou, alléluia. Un trèfle des bois qui plie ses feuilles à la tombée du jour, et quand l’orage arrive.', note: 'Sous les sapins et les hêtres. Ses feuilles se ferment avant l’orage.', ess: { ombre: 1, vie: 1 } },
  { o: 'asperule', nom: 'Aspérule odorante', it: 'asperule', un: 'Aspérule', h: [0.25, 0.35], n: [1, 2], hab: ['foret', 'bouleaux'], r: 1, fx: { heal: 2 }, ic: ['c2_herbe', '#4a8a3a'], cat: 'Végétation',
    look: ['Étoiles de feuilles et petites fleurs blanches', 'Des feuilles en étoiles le long de la tige, et de minuscules fleurs blanches. Fraîche, elle ne sent rien ; séchée, elle sent le foin coupé.'],
    desc: 'Le petit muguet, la reine-des-bois. On la laisse faner, et elle parfume le linge et le vin de mai.', note: 'Dans les hêtraies. Elle ne sent qu’une fois fanée.', ess: { air: 1, vie: 1 } },
  { o: 'fraisier_bois', nom: 'Fraisiers des bois', it: 'fraise_bois', un: 'Fraises des bois', h: [0.18, 0.25], n: [1, 3], hab: ['foret', 'bouleaux', 'lande'], r: 0, fx: null, ic: null, cat: 'Végétation',
    note: 'Dans les clairières et au bord des bois. Les fraises sont petites, et bien meilleures que celles des jardins.', ess: null },
  { o: 'ronce', nom: 'Ronces', it: 'mure', un: 'Mûres', h: [0.9, 1.3], n: [2, 3], hab: ['foret', 'pres', 'lande'], r: 0, fx: null, ic: null, cat: 'Végétation',
    note: 'Aux lisières, dans les friches. On y laisse de la laine, et un peu de peau.', ess: null },
  { o: 'mousse', nom: 'Mousse', it: 'mousse', un: 'Mousse', h: [0.14, 0.2], n: [1, 3], hab: ['foret', 'combe', 'sapiniere'], r: 0, fx: { heal: 1 }, ic: ['lichen', '#4a8a3a'], cat: 'Végétation',
    desc: 'Un coussin vert et spongieux. Elle pousse du côté du nord, dit-on ; ce n’est pas toujours vrai.', note: 'Au pied des arbres, sur les souches et les pierres.', ess: { terre: 1, eau: 1 } },
  { o: 'usnee', nom: 'Barbe-de-vieillard', it: 'usnee', un: 'Usnée', h: [0.3, 0.45], n: [1, 1], hab: ['sapiniere'], r: 1, fx: { heal: 2 }, ic: ['lichen', '#c0c8a0'], cat: 'Végétation',
    look: ['Lichen en longs fils gris-vert', 'Des fils gris-vert, emmêlés comme une barbe, tombés des branches des sapins. Au centre de chaque fil, un fil plus dur, élastique.'],
    desc: 'L’usnée, la barbe des sapins. Posée sur une plaie, elle empêche le mal d’y entrer.', note: 'Elle pend aux branches des vieux sapins, là où l’air est pur ; le vent en fait tomber.', ess: { air: 1, froid: 1, vie: 1 } },
  { o: 'herbe_egaree', nom: 'Herbe d’égarement', it: 'herbe_egaree', un: 'Herbe d’égarement', h: [0.25, 0.35], n: [1, 1], hab: ['foret', 'combe', 'bouleaux'], r: 4, fx: { heal: -2 }, ic: ['herbes', '#6a9a5a'], cat: 'Végétation',
    look: ['Herbe ordinaire, un peu trop verte', 'Une touffe d’herbe comme une autre. Plus verte que les autres, peut-être. Vous ne vous rappelez pas l’avoir cueillie.'],
    desc: 'L’herbe qui égare. Qui marche dessus sans la voir tourne en rond jusqu’au soir, dit-on, et ne reconnaît plus les chemins qu’il a toujours pris.', note: 'On ne la voit pas. On la reconnaît après, quand on s’est perdu.', ess: { esprit: 2, air: 2 } },
  // ---- les champignons
  { o: 'pied_mouton', nom: 'Pieds-de-mouton', it: 'pied_mouton', un: 'Pieds-de-mouton', h: [0.16, 0.22], n: [1, 3], hab: ['foret', 'sapiniere'], r: 1, fx: { food: 6, heal: 2 }, ic: ['champi', '#e8c890'], cat: 'Champignons',
    look: ['Champignon crème à aiguillons', 'Un chapeau crème, bosselé, et dessous, au lieu de lamelles, des centaines de petits aiguillons.'],
    desc: 'L’hydne sinué : sous le chapeau, des aiguillons au lieu de lamelles. On ne peut pas le confondre ; c’est le champignon de ceux qui ont peur.', note: 'En ronds dans les bois de sapins et de hêtres, à l’automne.', ess: { terre: 2, vie: 1 } },
  { o: 'coulemelle', nom: 'Coulemelles', it: 'coulemelle', un: 'Coulemelle', h: [0.45, 0.7], n: [1, 1], hab: ['pres', 'bouleaux'], r: 1, fx: { food: 8, heal: 3 }, ic: ['n2_parasol', '#c8a880', '#6a5040'], cat: 'Champignons',
    look: ['Grand champignon en ombrelle', 'Un champignon haut comme une botte, au chapeau large comme une assiette, écailleux, sur un pied chiné. Un anneau coulisse le long du pied.'],
    desc: 'La lépiote élevée, la grisette, la coulemelle : grande, bonne, et facile. Ses petites cousines, elles, sont mortelles.', note: 'Dans les prés et au bord des bois clairs. Seules les grandes se mangent.', ess: { terre: 1, air: 1, vie: 1 } },
  { o: 'bolet_satan', nom: 'Bolets Satan', it: 'bolet_satan', un: 'Bolet Satan', h: [0.2, 0.26], n: [1, 1], hab: ['foret'], r: 2, fx: { heal: -10, poison: true }, ic: ['n2_bolet', '#e0d8c8', '#c02020'], cat: 'Champignons',
    look: ['Gros champignon pâle au pied rouge', 'Un champignon trapu, au chapeau blanchâtre comme un vieux cèpe, mais au pied renflé veiné de rouge vif. Coupé, il bleuit.'],
    desc: 'Le bolet de Satan. Il ressemble à un cèpe qui aurait mal tourné, et il pue la charogne en vieillissant. Il ne tue pas : il fait regretter de vivre.', note: 'Sous les chênes, sur les sols calcaires. Rare.', ess: { feu: 2, mort: 2 } },
  { o: 'vesse_loup', nom: 'Vesses-de-loup', it: 'vesse_loup', un: 'Vesse-de-loup', h: [0.14, 0.2], n: [1, 2], hab: ['pres', 'foret'], r: 0, fx: { food: 3 }, ic: ['n2_boule', '#f0ece0'], cat: 'Champignons',
    look: ['Boule blanche sans chapeau', 'Une boule blanche, sans chapeau ni lamelles, couverte de petites verrues. Vieille, elle crève et crache une fumée brune.'],
    desc: 'Jeune et blanche, elle se mange en tranches. Vieille, elle lâche un nuage de poussière brune qui fait tousser, et qu’on disait capable d’aveugler.', note: 'Dans les prés et les bois. Vieille, elle fume quand on la touche.', ess: { air: 2, terre: 1 } },
  { o: 'phalloide', nom: 'Amanites phalloïdes', it: 'phalloide', un: 'Amanite phalloïde', h: [0.18, 0.24], n: [1, 1], hab: ['foret', 'bouleaux'], r: 2, fx: { food: 5, heal: 2, poison: true }, ic: ['champi', '#d8dcc0'], cat: 'Champignons',
    look: ['Champignon pâle à collerette', 'Un chapeau lisse d’un vert très pâle, presque blanc, des lamelles blanches, une collerette, et le pied planté dans une sorte de sac. Il sent à peine.'],
    desc: 'L’amanite phalloïde, la calice de la mort. Elle a bon goût, dit-on ; ceux qui le disent l’ont appris trop tard. Le mal vient longtemps après, quand on croit que tout va bien.', note: 'Sous les chênes et les bouleaux. Un seul chapeau suffit à tuer.', ess: { mort: 3, terre: 1 } },
  // ---- les eaux, les marais, les berges
  { o: 'populage', nom: 'Populages des marais', it: 'populage', un: 'Populage', h: [0.28, 0.38], n: [1, 2], hab: ['marais', 'berges', 'riviere'], r: 0, fx: { heal: -4, poison: true }, ic: ['c2_fleur', '#f8d020', '#4a8a3a'], cat: 'Fleurs',
    look: ['Grands boutons d’or luisants au bord de l’eau', 'Des fleurs jaunes, larges et vernissées, sur des feuilles rondes et luisantes, les pieds dans la vase.'],
    desc: 'Le souci d’eau. Il brûle la bouche comme ses cousins les boutons d’or ; les vaches le laissent, et elles ont raison.', note: 'Les pieds dans l’eau, au bord des ruisseaux et des mares.', ess: { eau: 2, feu: 1 } },
  { o: 'salicaire', nom: 'Salicaires', it: 'salicaire', un: 'Salicaire', h: [0.9, 1.3], n: [1, 2], hab: ['berges', 'marais', 'riviere'], r: 0, fx: { heal: 3 }, ic: ['c2_lavande', '#c04090', '#4a8a3a'], cat: 'Fleurs',
    look: ['Hauts épis pourpres des berges', 'De longs épis de fleurs pourpres, serrés, au bord de l’eau. Les tiges sont carrées.'],
    desc: 'La salicaire, l’herbe aux coliques : en décoction, elle arrête les flux de ventre mieux que tout.', note: 'Au bord des eaux dormantes et des fossés.', ess: { terre: 1, sang: 1 } },
  { o: 'massette', nom: 'Massettes', it: 'massette', un: 'Épis de massette', h: [1.4, 2.0], n: [1, 2], hab: ['marais', 'berges'], r: 0, fx: { food: 3 }, ic: ['n2_massette', '#6a4a2a'], cat: 'Végétation',
    desc: 'Un cigare brun au bout d’une longue tige. La racine se mange ; la bourre sert d’amadou et de rembourrage.', note: 'En roselières serrées, dans l’eau peu profonde.', ess: { eau: 1, feu: 1 } },
  { o: 'menyanthe', nom: 'Trèfles d’eau', it: 'menyanthe', un: 'Trèfle d’eau', h: [0.24, 0.32], n: [1, 2], hab: ['marais'], r: 1, fx: { heal: 4 }, ic: ['c2_fleur', '#f8f0f0', '#e0a0b0'], cat: 'Fleurs',
    look: ['Fleurs frangées de blanc dans la tourbe', 'Trois feuilles comme un trèfle, et des fleurs blanches rosées, hérissées de poils comme une frange de laine.'],
    desc: 'Le ményanthe, trèfle des marais : amer comme la gentiane, et, comme elle, contre les fièvres et la fatigue.', note: 'Dans les tourbières et les eaux froides.', ess: { eau: 1, froid: 1, vie: 1 } },
  { o: 'sphaigne', nom: 'Sphaignes', it: 'sphaigne', un: 'Sphaigne', h: [0.14, 0.18], n: [1, 3], hab: ['marais'], r: 1, fx: { heal: 2 }, ic: ['lichen', '#a0b870'], cat: 'Végétation',
    look: ['Mousse pâle gorgée d’eau', 'Une mousse pâle, rousse par endroits, qui boit l’eau comme une éponge. Pressée, elle en rend un plein verre.'],
    desc: 'La sphaigne des tourbières. Elle boit vingt fois son poids d’eau et garde les plaies propres : on en bourrait les pansements. Dans la tourbe, elle garde aussi les morts.', note: 'Elle fait la tourbe. On retire parfois de la tourbe des gens qui n’ont pas changé depuis mille ans.', ess: { eau: 2, mort: 1 } },
  { o: 'consoude', nom: 'Grande consoude', it: 'consoude', un: 'Racine de consoude', h: [0.7, 1.0], n: [1, 1], hab: ['berges', 'riviere', 'pres'], r: 1, fx: { heal: 6 }, ic: ['c2_racine_long', '#3a3028', '#4a7a3a'], cat: 'Végétation',
    look: ['Grandes feuilles rêches et clochettes violettes', 'De grandes feuilles rugueuses qui piquent un peu, des clochettes violettes en crosse, et une racine noire dehors, blanche et gluante dedans.'],
    desc: 'La consoude, l’oreille d’âne, l’herbe à souder les os : on en fait des cataplasmes pour les fractures.', note: 'Dans les prés humides et au bord des rivières.', ess: { terre: 2, vie: 1 } },
  // ---- la lande
  { o: 'genet', nom: 'Genêts', it: 'genet', un: 'Fleurs de genêt', h: [1.2, 1.7], n: [1, 2], hab: ['lande'], r: 0, fx: { heal: -2 }, ic: ['c2_fleur', '#f8d020', '#3a6a2a'], cat: 'Végétation',
    desc: 'Des balais d’or sur la lande. Les fleurs font battre le cœur trop vite ; les tiges font de bons balais.', note: 'Sur la lande et les terres pauvres, en grandes touffes.', ess: { lumiere: 1, air: 1, feu: 1 } },
  { o: 'pulsatille', nom: 'Pulsatilles', it: 'pulsatille', un: 'Pulsatille', h: [0.22, 0.3], n: [1, 1], hab: ['lande', 'alpage'], r: 1, fx: { heal: -6, poison: true }, ic: ['n2_clochettes', '#7040a0'], cat: 'Fleurs',
    look: ['Clochette violette velue', 'Une grande clochette violette, velue comme un petit animal, penchée sur une tige couverte de poils argentés.'],
    desc: 'L’anémone pulsatille, la coquelourde, l’herbe au vent. Belle, et vénéneuse ; les bergers l’appelaient fleur de Pâques.', note: 'Sur les pelouses sèches et les coteaux. Vénéneuse.', ess: { air: 2, ombre: 1 } },
  { o: 'euphraise', nom: 'Euphraises', it: 'euphraise', un: 'Euphraise', h: [0.16, 0.22], n: [1, 2], hab: ['lande', 'alpage'], r: 1, fx: { heal: 2 }, ic: ['c2_fleur', '#f8f8f4', '#a060c0'], cat: 'Fleurs',
    look: ['Minuscules fleurs blanches à œil jaune', 'De toutes petites fleurs blanches, rayées de violet, avec une tache jaune au milieu, comme un œil.'],
    desc: 'Le casse-lunettes : on en baigne les yeux fatigués, ceux qui ont trop lu ou trop regardé le soleil.', note: 'Dans les pâturages maigres. Elle vit aux dépens des herbes voisines.', ess: { lumiere: 2, eau: 1 } },
  { o: 'absinthe', nom: 'Grande absinthe', it: 'absinthe', un: 'Absinthe', h: [0.6, 0.9], n: [1, 1], hab: ['rochers', 'lande'], r: 2, fx: { heal: 2 }, ic: ['herbes', '#b8c8b0'], cat: 'Végétation',
    look: ['Touffe argentée très amère', 'Des feuilles découpées, d’un gris d’argent, douces au toucher. Une feuille mâchée emplit la bouche d’une amertume qui dure une heure.'],
    desc: 'L’absinthe, l’aluine. Amère à faire pleurer ; elle chasse les vers, le froid, et, en liqueur, la raison.', note: 'Sur les rocailles ensoleillées. La plus amère de toutes.', ess: { esprit: 2, feu: 1 } },
  // ---- les hauteurs
  { o: 'soldanelle', nom: 'Soldanelles', it: 'soldanelle', un: 'Soldanelle', h: [0.15, 0.2], n: [1, 2], hab: ['neiges', 'alpage'], r: 1, fx: { heal: 1 }, ic: ['n2_clochettes', '#a080e0'], cat: 'Fleurs',
    look: ['Clochette mauve frangée, dans la neige', 'Une petite clochette mauve, frangée au bord comme une dentelle, qui perce la neige en la faisant fondre autour d’elle.'],
    desc: 'La soldanelle des Alpes : elle fond la neige de sa propre chaleur pour fleurir. Les bergers disent qu’elle annonce la fin de l’hiver.', note: 'Au bord des névés qui fondent.', ess: { feu: 1, vie: 1, lumiere: 1 } },
  { o: 'saxifrage', nom: 'Saxifrages', it: 'saxifrage', un: 'Saxifrage', h: [0.14, 0.18], n: [1, 2], hab: ['rochers'], r: 0, fx: { heal: 2 }, ic: ['c2_fleur', '#f8f8f0', '#e0a040'], cat: 'Fleurs',
    look: ['Coussinet de rosettes aux fleurs blanches', 'Des petites rosettes serrées en coussin dans une fente de rocher, piquées de fleurs blanches ponctuées de rouge.'],
    desc: 'Le perce-pierre : elle pousse dans les fentes et, dit-on, fend le roc. On la donnait contre la pierre, celle des reins.', note: 'Dans les fentes des rochers, jusque très haut.', ess: { terre: 2, froid: 1 } },
  { o: 'nigritelle', nom: 'Nigritelles', it: 'nigritelle', un: 'Nigritelle', h: [0.2, 0.26], n: [1, 1], hab: ['alpage'], r: 2, fx: { heal: 1 }, ic: ['c2_lavande', '#5a1020', '#3a5a2a'], cat: 'Fleurs',
    look: ['Petit épi pourpre noir qui sent la vanille', 'Un épi serré de fleurs pourpres si sombres qu’elles paraissent noires. Il sent la vanille, et un peu le chocolat.'],
    desc: 'L’orchis vanillé des alpages. Les filles des bergers en cachaient dans leur corsage, pour plaire.', note: 'Dans les pâturages d’altitude. Elle sent la vanille.', ess: { sort: 2, sang: 1 } },
  { o: 'ancolie', nom: 'Ancolies des Alpes', it: 'ancolie', un: 'Ancolie', h: [0.5, 0.7], n: [1, 1], hab: ['alpage', 'combe'], r: 2, fx: { heal: -5, poison: true }, ic: ['n2_clochettes', '#4060d0'], cat: 'Fleurs',
    look: ['Grande fleur bleue à éperons recourbés', 'Une grande fleur bleu vif, penchée, dont les pétales se prolongent en cinq éperons crochus, comme des serres d’oiseau.'],
    desc: 'L’ancolie, le gant de Notre-Dame, la colombine : cinq colombes autour d’un plat, disent les enfants. Vénéneuse, comme tout ce qui est bleu là-haut.', note: 'Dans les prairies d’altitude et les combes. Vénéneuse.', ess: { air: 2, esprit: 1 } },
  { o: 'airelle', nom: 'Airelles', it: 'airelle', un: 'Airelles', h: [0.24, 0.32], n: [1, 3], hab: ['sapiniere', 'alpage', 'lande'], r: 0, fx: null, ic: null, cat: 'Végétation',
    note: 'Sous les sapins et sur les landes d’altitude. Les baies restent sur la branche tout l’hiver.', ess: null },
  { o: 'chardon_bleu', nom: 'Chardons bleus', it: 'chardon_bleu', un: 'Chardon bleu', h: [0.6, 0.8], n: [1, 1], hab: ['alpage', 'rochers'], r: 3, fx: { heal: 1 }, ic: ['c2_dahlia', '#5080d0', '#a0c0e0'], cat: 'Fleurs',
    look: ['Chardon d’un bleu d’acier', 'Un chardon tout entier bleu, tige, feuilles et fleur, avec une collerette de dentelle épineuse. On dirait du métal.'],
    desc: 'La reine des Alpes. Si rare qu’on en a compté les pieds ; les messieurs de la ville en paient la cueillette.', note: 'Dans quelques prairies des hauteurs, nulle part ailleurs. On en a compté les pieds.', ess: { froid: 2, lumiere: 1, sort: 1 } },
];
{
  const NAT_CAT_ICON = { Fleurs: ['c2_fleur', '#e0e0e0', '#e0c040'], Champignons: ['champi', '#c8a070'], Végétation: ['herbes', '#6a9a50'] };
  for (const P of NAT_PLANTES) {
    if (P.fx) natItem(P.it, P.un, NAT_PRIX[P.r] || 1, P.ic || NAT_CAT_ICON[P.cat], Object.assign({ desc: P.desc }, P.fx));
    if (ITEMS[P.it] && P.look) { ITEMS[P.it].wild = true; PLANT_LOOK[P.it] = P.look; }
    HARVEST[P.o] = { tool: 'main', hp: 0, drop: [[P.it, P.n[0], P.n[1]]], regrow: [30, 30, 40, 48, 72][P.r] };
    ESPECES_PLANTES.push([P.o, P.hab, P.r]);
    NOTICE_PLANTES[P.o] = P.note;
    if (P.ess) ESSENCES[P.it] = P.ess;
    if (ITEMS[P.it] && ITEMS[P.it].cat === 'cueillette' && ESSENCES[P.it]) ITEMS[P.it].alch = true;
  }
  // les ronces : des mûres, et parfois une fibre ; le chardon bleu vaut son prix (les messieurs de la ville)
  HARVEST.ronce.drop.push(['fibre', 0, 1, 0.3]);
  ITEMS.chardon_bleu.price = 12;
  // les herbes des plaies (11-zzzz8 : on les applique même le ventre plein)
  ITEMS.plantain.panse = 1; ITEMS.sphaigne.panse = 2; ITEMS.usnee.panse = 2;
  // les aromates (tisanes), les fleurs et les champignons au choix
  for (const id of ['verveine', 'asperule', 'armoise', 'menyanthe']) if (!ITEM_GROUPS.aromate.includes(id)) ITEM_GROUPS.aromate.push(id);
  for (const P of NAT_PLANTES) if (P.cat === 'Fleurs' && ITEMS[P.it] && !ITEM_GROUPS.fleur.includes(P.it)) { ITEM_GROUPS.fleur.push(P.it); ITEM_GROUPS.fleur_c.push(P.it); }
  ITEM_GROUPS.fleur = ITEM_GROUPS.fleur.slice(0, 1).concat(ITEM_GROUPS.fleur.slice(1).sort((a, b) => (ITEMS[a].price || 0) - (ITEMS[b].price || 0)));
  for (const id of ['pied_mouton', 'coulemelle', 'coprin', 'vesse_loup']) if (!ITEM_GROUPS.champi_bon.includes(id)) ITEM_GROUPS.champi_bon.push(id);
}
