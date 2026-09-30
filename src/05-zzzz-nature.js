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
