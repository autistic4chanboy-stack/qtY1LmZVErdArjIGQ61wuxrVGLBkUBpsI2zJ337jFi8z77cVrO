// ============================================================================
//  CONTENU (FERME) : trésors et butins, outils améliorés, machines de
//  transformation, décor en plus, cuisine, tables de butin
// ============================================================================

// ---------------------------------------------------------------- trésors, trophées, curiosités
defItem('vieille_piece', 'Vieille pièce', 'tresor', 40, ['rond', '#c8a040'], { desc: 'Une pièce frappée d’un roi dont personne ne se souvient.' });
defItem('tesson', 'Tesson de poterie', 'tresor', 18, ['caillou', '#b87850'], { desc: 'Un morceau de pot peint. Il y avait un visage dessus.' });
defItem('bijou', 'Bijou ancien', 'tresor', 160, ['gemme', '#e0a8e8']);
defItem('relique', 'Relique', 'tresor', 260, ['figurine', '#e0d8a8'], { desc: 'Un petit reliquaire de cuivre. Il est plus lourd qu’il ne devrait.' });
defItem('fossile', 'Fossile', 'tresor', 120, ['caillou', '#d8d0b8']);
defItem('perle', 'Perle', 'tresor', 220, ['oeuf', '#f4f4ff']);
defItem('croc', 'Croc de loup', 'chasse', 45, ['plume', '#ece4cc']);
defItem('defense', 'Défense de sanglier', 'chasse', 55, ['cerf', '#ece4cc']);
defItem('fourrure', 'Fourrure de renard', 'chasse', 70, ['cuir', '#c8652a']);
defItem('plume_noire', 'Plume noire', 'chasse', 8, ['plume', '#2a2a30']);
defItem('eclat', "Éclat de l'Envers", 'tresor', 0, ['gemme', '#b01818'], { desc: 'Froid comme une nuit rouge. Il bat, un peu.' });
// objets qu'on ouvre (clic)
defItem('coffre_peche', 'Coffre englouti', 'tresor', 0, ['objet', 'coffre'], { open: 'peche', desc: 'Remonté du fond. Il ruisselle encore.' });
defItem('geode', 'Géode', 'tresor', 20, ['caillou', '#7a7a92'], { open: 'geode', desc: 'Une pierre creuse. Quelque chose brille à l’intérieur.' });
defItem('sac_graines', 'Sac de graines', 'graine', 0, ['sac', '#8a6a44'], { open: 'graines', desc: 'Un vieux sac noué. Des graines mélangées.' });
defItem('caisse_vivres', 'Caisse de vivres', 'nourriture', 0, ['objet', 'coffre'], { open: 'vivres' });
// matières
defItem('corde', 'Corde', 'materiau', 12, ['fibre', '#b89060']);
defItem('toile', 'Toile de lin', 'materiau', 22, ['cuir', '#e4dcc4']);
defItem('farine', 'Farine', 'materiau', 12, ['sac', '#f2eee2']);
defItem('engrais', 'Engrais', 'materiau', 6, ['sac', '#5a4a30'], { fert: 1, desc: 'Sur une culture : elle pousse une fois et demie plus vite.' });
defItem('engrais_riche', 'Engrais riche', 'materiau', 16, ['sac', '#2e2216'], { fert: 2, desc: 'Sur une culture : elle pousse deux fois plus vite.' });
// produits transformés
defItem('cidre', 'Cidre', 'nourriture', 55, ['bouteille', '#d8a040'], { food: 8, heal: 6 });
defItem('vin', 'Vin de fruits', 'nourriture', 95, ['bouteille', '#8a2040'], { food: 6, heal: 4 });
defItem('beurre', 'Beurre', 'produit', 45, ['fromage', '#f8e880'], { food: 10, heal: 2 });
defItem('huile', 'Huile de tournesol', 'produit', 65, ['bouteille', '#f0d040']);
defItem('jus', 'Jus de légumes', 'nourriture', 42, ['bouteille', '#d86030'], { food: 12, heal: 8 });
defItem('poisson_fume', 'Poisson fumé', 'nourriture', 80, ['poisson', '#8a5a2a'], { food: 28, heal: 12 });
defItem('viande_fumee', 'Viande fumée', 'nourriture', 75, ['viande', '#6a3a1a'], { food: 30, heal: 12 });
// cuisine
defItem('omelette', 'Omelette', 'nourriture', 35, ['bol', '#f0d060'], { food: 22, heal: 10 });
defItem('crepes', 'Crêpes', 'nourriture', 50, ['pain', '#e8c070'], { food: 28, heal: 12 });
defItem('gateau', 'Gâteau au miel', 'nourriture', 120, ['brioche', '#d89040'], { food: 40, heal: 25 });
defItem('salade', 'Salade du jardin', 'nourriture', 55, ['bol', '#7ab050'], { food: 18, heal: 15 });
defItem('soupe_poisson', 'Soupe de poisson', 'nourriture', 75, ['bol', '#c8a060'], { food: 38, heal: 20 });
defItem('tarte_citrouille', 'Tarte à la citrouille', 'nourriture', 170, ['tarte', '#e88a20'], { food: 45, heal: 25 });
defItem('popcorn', 'Maïs grillé', 'nourriture', 40, ['baies', '#f8f0c0'], { food: 12, heal: 4 });
defItem('brochette', 'Brochette', 'nourriture', 85, ['viande', '#a86030'], { food: 40, heal: 20 });
defItem('salade_fruits', 'Salade de fruits', 'nourriture', 60, ['bol', '#e05060'], { food: 16, heal: 14 });
defItem('tisane', 'Tisane au miel', 'nourriture', 65, ['bol', '#a8c060'], { food: 6, heal: 40, stamina: 1 });
defItem('pain_mais', 'Pain de maïs', 'nourriture', 45, ['pain', '#f0c040'], { food: 24, heal: 8 });
// outils améliorés et équipement (certains agissent sur 3 × 3 cases)
defItem('houe_fer', 'Houe de fer', 'outil', 220, ['houe', '#9aa2ac'], { tool: 'houe', area: 1, tier: 1 });
defItem('arrosoir_cuivre', 'Arrosoir de cuivre', 'outil', 160, ['arrosoir', '#c8743a'], { tool: 'arrosoir', area: 1, cap: 40, tier: 1 });
defItem('arrosoir_fer', 'Grand arrosoir de fer', 'outil', 320, ['arrosoir', '#9aa2ac'], { tool: 'arrosoir', area: 1, cap: 100, tier: 2 });
defItem('semoir', 'Semoir', 'outil', 240, ['seau', '#8a6a44'], { passive: true, desc: 'Tant qu’il est dans la sacoche, chaque graine semée tombe sur 3 × 3 cases.' });
defItem('canne_fer', 'Canne à pêche de fer', 'outil', 200, ['canne', '#9aa2ac'], { tool: 'canne', fast: 0.55 });
defItem('arc_long', 'Arc long', 'outil', 260, ['arc', '#5a3a1a'], { tool: 'arc', power: 1.45 });
defItem('fleche_fer', 'Flèche de fer', 'outil', 8, ['fleche', '#dce4ec'], { arrow: 1.5 });
defItem('fourche', 'Fourche', 'outil', 90, ['faux', '#8a8680'], { tool: 'fourche' });
defItem('bottes', 'Bottes de cuir', 'outil', 180, ['cuir', '#5a3a1a'], { passive: true, desc: 'On marche plus vite avec (dans la sacoche).' });
defItem('amulette', "Amulette d'éclats", 'outil', 0, ['gemme', '#e03030'], { passive: true, desc: 'Les choses pâles vous perdent plus facilement de vue.' });
defItem('miroir_poche', 'Miroir de poche', 'outil', 0, ['montre', '#b8b8c8'], { tool: 'miroir', desc: 'Dans l’Envers : le lever vous ramène chez vous.' });

// ---------------------------------------------------------------- objets à poser en plus (machines, arrosage, décor)
Object.assign(PLACEABLES, {
  arroseur: { name: 'Arroseur', price: 120, sprinkler: 1 }, arroseur_fer: { name: 'Arroseur de fer', price: 300, sprinkler: 2 },
  composteur: { name: 'Composteur', price: 60, machine: true }, baratte: { name: 'Baratte', price: 90, machine: true },
  fumoir: { name: 'Fumoir', price: 150, machine: true }, presse: { name: 'Presse', price: 140, machine: true },
  moulin_a_bras: { name: 'Moulin à bras', price: 80, machine: true },
  horloge: { name: 'Horloge de jardin', price: 160 }, nain_jardin: { name: 'Nain de jardin', price: 30 }, bassin: { name: 'Bassin', price: 90, water: true },
  fontaine_jardin: { name: 'Fontaine', price: 220, water: true }, tapis: { name: 'Tapis', price: 40, flat: true }, banc_pierre: { name: 'Banc de pierre', price: 60 },
  pergola: { name: 'Pergola', price: 120 }, jardiniere: { name: 'Jardinière', price: 35 }, cloture_blanche: { name: 'Clôture blanche', price: 8, snap: 2 },
  poteau_indicateur: { name: 'Poteau indicateur', price: 20 }, statue_cerf: { name: 'Statue de cerf', price: 300 },
  epouvantail_fer: { name: 'Épouvantail de fer', price: 160, scare: 14 }, lanterne_suspendue: { name: 'Lanterne suspendue', price: 70, light: true }, tente: { name: 'Tente', price: 80 },
});
for (const id of ['arroseur', 'arroseur_fer', 'composteur', 'baratte', 'fumoir', 'presse', 'moulin_a_bras', 'horloge', 'nain_jardin', 'bassin', 'fontaine_jardin', 'tapis', 'banc_pierre', 'pergola', 'jardiniere', 'cloture_blanche', 'poteau_indicateur', 'statue_cerf', 'epouvantail_fer', 'lanterne_suspendue', 'tente']) {
  const p = PLACEABLES[id];
  defItem(id, p.name, 'objet', p.price, ['objet', id], { place: id });
}

// ---------------------------------------------------------------- machines : on y met des produits, on revient plus tard (heures de jeu)
const MACHINES = {
  tonneau: [{ in: { pomme: 3 }, out: ['cidre', 1], h: 5 }, { in: { fraise: 3 }, out: ['vin', 1], h: 8 }, { in: { baies: 6 }, out: ['vin', 1], h: 8 }, { in: { melon: 1 }, out: ['vin', 2], h: 10 }],
  baratte: [{ in: { lait: 1 }, out: ['beurre', 1], h: 1.5 }, { in: { lait: 3 }, out: ['fromage', 2], h: 4 }],
  fumoir: [{ in: { poisson: 1 }, out: ['poisson_fume', 1], h: 2 }, { in: { viande: 1 }, out: ['viande_fumee', 1], h: 2 }],
  presse: [{ in: { tournesol: 2 }, out: ['huile', 1], h: 2 }, { in: { legume: 3 }, out: ['jus', 1], h: 1.5 }, { in: { pomme: 4 }, out: ['cidre', 1], h: 3 }],
  moulin_a_bras: [{ in: { ble: 2 }, out: ['farine', 1], h: 0.5 }, { in: { mais: 2 }, out: ['farine', 2], h: 0.8 }],
  composteur: [{ in: { fibre: 5 }, out: ['engrais', 3], h: 4 }, { in: { legume: 4 }, out: ['engrais_riche', 2], h: 6 }, { in: { foin: 6 }, out: ['engrais', 3], h: 4 }],
};
const MACHINE_HINT = {
  tonneau: 'Le tonneau attend des fruits : pommes, fraises, baies ou melon.', baratte: 'La baratte attend du lait.', fumoir: 'Le fumoir attend du poisson ou de la viande.',
  presse: 'La presse attend des tournesols ou des pommes — ou les légumes que vous tenez en main.', moulin_a_bras: 'La meule attend du blé ou du maïs.', composteur: 'Le composteur attend des fibres ou du foin — ou les légumes que vous tenez en main.',
};

// ---------------------------------------------------------------- recettes en plus
RECIPES.push(
  { out: 'corde', n: 1, need: { fibre: 3 }, st: null },
  { out: 'corde', n: 2, need: { lin: 2 }, st: null },
  { out: 'engrais', n: 2, need: { fibre: 3, fleur: 1 }, st: null },
  { out: 'salade', n: 1, need: { chou: 1, tomate: 1 }, st: null },
  { out: 'salade_fruits', n: 1, need: { fruit: 3 }, st: null },
  { out: 'toile', n: 1, need: { lin: 3 }, st: 'etabli' },
  { out: 'engrais_riche', n: 1, need: { engrais: 2, charbon: 1 }, st: 'etabli' },
  { out: 'houe_fer', n: 1, need: { bois: 2, lingot_fer: 3 }, st: 'etabli' },
  { out: 'arrosoir_cuivre', n: 1, need: { lingot_cuivre: 4 }, st: 'etabli' },
  { out: 'arrosoir_fer', n: 1, need: { lingot_fer: 4, lingot_cuivre: 1 }, st: 'etabli' },
  { out: 'semoir', n: 1, need: { bois: 6, lingot_fer: 2, corde: 1 }, st: 'etabli' },
  { out: 'canne_fer', n: 1, need: { bois: 2, lingot_fer: 2, corde: 1 }, st: 'etabli' },
  { out: 'arc_long', n: 1, need: { bois: 5, corde: 2, lingot_fer: 1 }, st: 'etabli' },
  { out: 'fleche_fer', n: 5, need: { bois: 1, lingot_fer: 1, plume: 2 }, st: 'etabli' },
  { out: 'fourche', n: 1, need: { bois: 3, lingot_fer: 2 }, st: 'etabli' },
  { out: 'bottes', n: 1, need: { cuir: 3, corde: 1 }, st: 'etabli' },
  { out: 'arroseur', n: 1, need: { lingot_cuivre: 2, lingot_fer: 1 }, st: 'etabli' },
  { out: 'arroseur_fer', n: 1, need: { lingot_fer: 2, lingot_or: 1 }, st: 'etabli' },
  { out: 'composteur', n: 1, need: { bois: 10, fibre: 5 }, st: 'etabli' },
  { out: 'baratte', n: 1, need: { bois: 8, lingot_fer: 1 }, st: 'etabli' },
  { out: 'fumoir', n: 1, need: { pierre: 15, bois: 5, lingot_fer: 1 }, st: 'etabli' },
  { out: 'presse', n: 1, need: { bois: 10, lingot_fer: 2 }, st: 'etabli' },
  { out: 'moulin_a_bras', n: 1, need: { pierre: 12, bois: 4 }, st: 'etabli' },
  { out: 'horloge', n: 1, need: { bois: 6, lingot_cuivre: 1, lingot_or: 1 }, st: 'etabli' },
  { out: 'nain_jardin', n: 1, need: { pierre: 4, fleur: 1 }, st: 'etabli' },
  { out: 'bassin', n: 1, need: { pierre: 16 }, st: 'etabli' },
  { out: 'fontaine_jardin', n: 1, need: { pierre: 20, lingot_cuivre: 2 }, st: 'etabli' },
  { out: 'tapis', n: 1, need: { toile: 3 }, st: 'etabli' },
  { out: 'banc_pierre', n: 1, need: { pierre: 10 }, st: 'etabli' },
  { out: 'pergola', n: 1, need: { bois: 12, fleur: 4 }, st: 'etabli' },
  { out: 'jardiniere', n: 1, need: { bois: 4, fleur: 3 }, st: 'etabli' },
  { out: 'cloture_blanche', n: 2, need: { bois: 3 }, st: 'etabli' },
  { out: 'poteau_indicateur', n: 1, need: { bois: 4 }, st: 'etabli' },
  { out: 'statue_cerf', n: 1, need: { pierre: 25, bois_de_cerf: 1 }, st: 'etabli' },
  { out: 'epouvantail_fer', n: 1, need: { lingot_fer: 2, toile: 2, foin: 3 }, st: 'etabli' },
  { out: 'lanterne_suspendue', n: 1, need: { lingot_fer: 1, bougie: 1, bois: 2 }, st: 'etabli' },
  { out: 'tente', n: 1, need: { toile: 4, bois: 3, corde: 1 }, st: 'etabli' },
  { out: 'amulette', n: 1, need: { eclat: 5, lingot_or: 1 }, st: 'etabli' },
  { out: 'miroir_poche', n: 1, need: { eclat: 8, lingot_fer: 1 }, st: 'etabli' },
  { out: 'cle_crypte', n: 1, need: { eclat: 13 }, st: 'etabli' },
  { out: 'pain', n: 2, need: { farine: 1 }, st: 'four' },
  { out: 'pain_mais', n: 2, need: { mais: 2, oeuf: 1 }, st: 'four' },
  { out: 'gateau', n: 1, need: { farine: 2, oeuf: 2, lait: 1, miel: 1 }, st: 'four' },
  { out: 'tarte_citrouille', n: 1, need: { citrouille: 1, farine: 1, oeuf: 1 }, st: 'four' },
  { out: 'omelette', n: 1, need: { oeuf: 2 }, st: 'feu' },
  { out: 'crepes', n: 2, need: { farine: 1, oeuf: 1, lait: 1 }, st: 'feu' },
  { out: 'soupe_poisson', n: 1, need: { poisson: 1, patate: 1 }, st: 'feu' },
  { out: 'popcorn', n: 2, need: { mais: 2 }, st: 'feu' },
  { out: 'brochette', n: 1, need: { viande: 1, legume: 2 }, st: 'feu' },
  { out: 'tisane', n: 1, need: { herbes: 1, miel: 1 }, st: 'feu' },
);
ITEM_GROUPS.legume.push('radis', 'betterave', 'haricot', 'melon');
ITEM_GROUPS.fruit.push('melon');

// ---------------------------------------------------------------- récoltes et gibier : davantage de butin
HARVEST.rock.drop.push(['geode', 0, 1, 0.14]);
HARVEST.stones.drop.push(['geode', 0, 1, 0.05]);
HARVEST.tallgrass.drop.push(['sac_graines', 0, 1, 0.04], ['foin', 0, 1, 0.3]);
HARVEST.bush.drop.push(['baies', 0, 2, 0.35], ['sac_graines', 0, 1, 0.05]);
HARVEST.stump.drop.push(['champignon', 0, 1, 0.2]);
HARVEST.deadtree.drop.push(['plume_noire', 0, 1, 0.2]);
// la cueillette repousse (heures de jeu)
for (const k of ['berry', 'mushroom', 'herbs', 'poppies', 'daisies', 'lavender', 'cornflower', 'sunflower', 'heather', 'tallgrass', 'reeds', 'fern']) HARVEST[k].regrow = k === 'tallgrass' ? 10 : k === 'berry' ? 16 : 24;
PREY.wolf.drop.push(['croc', 1, 2]);
PREY.boar.drop.push(['defense', 1, 2]);
PREY.fox.drop = [['fourrure', 1, 1], ['cuir', 0, 1]];
PREY.crow.drop = [['plume_noire', 1, 2]];
PREY.deer.drop.push(['sac_graines', 0, 1, 0.1]);

// ---------------------------------------------------------------- boutiques : plus de choses à vendre et à acheter
{
  const S = (id) => NPC_DATA.find((d) => d.id === id);
  const G = S('grainetiere');
  if (G && G.shop) {
    for (const e of G.shop.sells) { const m = /^graines_(.+)$/.exec(e[0]); if (m && SEED_PRICE[m[1]]) e[1] = SEED_PRICE[m[1]]; }
    for (const k of ['radis', 'lin', 'betterave', 'haricot', 'melon']) { G.shop.sells.push(['graines_' + k, SEED_PRICE[k]]); G.shop.buys.push(k); }
    // graines en tête, des moins chères aux plus chères
    const isSeed = (e) => e[0].startsWith('graines_');
    G.shop.sells.sort((a, b) => (isSeed(b) - isSeed(a)) || (isSeed(a) ? a[1] - b[1] : 0));
    G.shop.sells.push(['engrais', 10], ['arroseur', 180], ['composteur', 90]);
  }
  const F = S('forgeron');
  if (F && F.shop) { F.shop.sells.push(['arrosoir_cuivre', 240], ['houe_fer', 320], ['fleche_fer', 12]); F.shop.buys.push('geode', 'croc', 'defense'); }
  const A = S('aubergiste');
  if (A && A.shop) A.shop.buys.push('cidre', 'vin', 'jus', 'poisson_fume', 'viande_fumee', 'beurre', 'huile', 'radis', 'haricot', 'betterave', 'melon');
  const B = S('boulangere');
  if (B && B.shop) { B.shop.buys.push('farine', 'beurre', 'mais', 'melon'); B.shop.sells.push(['farine', 18], ['crepes', 60]); }
  const E = S('eleveuse');
  if (E && E.shop) { E.shop.buys.push('fourrure', 'defense'); E.shop.sells.push(['baratte', 140]); }
  const P = S('pecheur');
  if (P && P.shop) { P.shop.buys.push('perle', 'coffre_peche'); P.shop.sells.push(['canne_fer', 300], ['fumoir', 220]); }
  const H = S('guerisseuse');
  if (H && H.shop) H.shop.buys.push('plume_noire', 'croc', 'fossile', 'tisane');
  // le maire collectionne les antiquités
  const M = S('maire');
  if (M && !M.shop) M.shop = { name: 'Le cabinet de curiosités du maire', sells: [['vieille_piece', 90]], buys: ['vieille_piece', 'tesson', 'bijou', 'relique', 'fossile', 'perle', 'figurine', 'bois_de_cerf'] };
}

// ---------------------------------------------------------------- tables de butin : [objet, min, max, poids] ; « argent » = pièces
const LOOT = {
  campement: { rolls: [2, 4], items: [['pain', 1, 2, 4], ['bougie', 1, 3, 4], ['corde', 1, 2, 3], ['fleche', 3, 8, 4], ['charbon', 1, 3, 3], ['sac_graines', 1, 1, 3], ['cuir', 1, 2, 2], ['argent', 10, 45, 4], ['vieille_piece', 1, 1, 1], ['caisse_vivres', 1, 1, 1], ['lanterne', 1, 1, 0.3]] },
  charrette: { rolls: [2, 3], items: [['bois', 3, 8, 4], ['pomme', 2, 5, 3], ['farine', 1, 2, 2], ['corde', 1, 2, 2], ['graines_patate', 3, 6, 2], ['argent', 15, 50, 3], ['caisse_vivres', 1, 1, 1], ['toile', 1, 2, 1]] },
  barque: { rolls: [1, 3], items: [['carpe', 1, 2, 3], ['corde', 1, 2, 3], ['fleche', 2, 5, 2], ['perle', 1, 1, 0.6], ['coffre_peche', 1, 1, 0.8], ['argent', 10, 40, 3], ['canne', 1, 1, 0.5]] },
  ruines: { rolls: [1, 3], items: [['vieille_piece', 1, 3, 5], ['tesson', 1, 3, 5], ['bijou', 1, 1, 1], ['relique', 1, 1, 0.5], ['figurine', 1, 1, 1], ['argent', 20, 80, 4], ['lingot_fer', 1, 1, 1], ['graines_melon', 2, 4, 1], ['geode', 1, 2, 2]] },
  hameau: { rolls: [1, 3], items: [['tesson', 1, 2, 4], ['bougie', 1, 2, 3], ['vieille_piece', 1, 2, 3], ['sac_graines', 1, 1, 3], ['poupee_chiffon', 0, 0, 0], ['figurine', 1, 1, 1], ['argent', 5, 30, 3], ['corde', 1, 1, 2]] },
  chapelle: { rolls: [1, 3], items: [['bougie', 2, 4, 5], ['vieille_piece', 1, 3, 3], ['relique', 1, 1, 1], ['bijou', 1, 1, 0.6], ['argent', 10, 60, 3], ['livre', 0, 0, 0]] },
  marais: { rolls: [1, 3], items: [['herbes', 1, 3, 4], ['champignon', 1, 3, 4], ['anguille', 1, 1, 2], ['bougie', 1, 2, 2], ['relique', 1, 1, 0.4], ['argent', 5, 40, 3], ['plume_noire', 1, 3, 2]] },
  phare: { rolls: [2, 3], items: [['charbon', 2, 5, 4], ['corde', 1, 3, 3], ['bougie', 2, 4, 3], ['perle', 1, 1, 0.8], ['lingot_cuivre', 1, 2, 2], ['argent', 20, 70, 3], ['boussole', 1, 1, 0.3]] },
  tour: { rolls: [2, 3], items: [['fleche', 4, 10, 4], ['fleche_fer', 2, 5, 1], ['corde', 1, 2, 3], ['pain', 1, 2, 2], ['lingot_fer', 1, 2, 2], ['argent', 20, 60, 3], ['bijou', 1, 1, 0.5]] },
  mine: { rolls: [2, 3], items: [['charbon', 2, 6, 5], ['minerai_cuivre', 2, 5, 5], ['minerai_fer', 1, 4, 3], ['lingot_cuivre', 1, 2, 2], ['geode', 1, 2, 3], ['bougie', 1, 3, 2], ['argent', 10, 50, 2], ['fossile', 1, 1, 0.8]] },
  profond: { rolls: [2, 4], items: [['minerai_or', 1, 3, 4], ['gemme', 1, 2, 2], ['geode', 2, 3, 4], ['lingot_fer', 1, 3, 3], ['fossile', 1, 2, 2], ['relique', 1, 1, 0.6], ['argent', 40, 150, 3]] },
  cave: { rolls: [2, 4], items: [['cidre', 1, 2, 3], ['vin', 1, 1, 1], ['farine', 1, 2, 3], ['bougie', 1, 3, 3], ['graines_citrouille', 1, 3, 2], ['vieille_piece', 1, 2, 2], ['argent', 20, 60, 3], ['conserve', 0, 0, 0]] },
  crypte: { rolls: [2, 4], items: [['relique', 1, 2, 3], ['bijou', 1, 2, 3], ['vieille_piece', 2, 5, 4], ['lingot_or', 1, 2, 2], ['gemme', 1, 1, 1], ['bougie', 2, 4, 2], ['argent', 60, 200, 3]] },
  envers: { rolls: [1, 3], items: [['eclat', 1, 3, 7], ['relique', 1, 1, 1], ['bijou', 1, 1, 1], ['poisson_aveugle', 1, 1, 1], ['vieille_piece', 1, 3, 2]] },
  fouille: { rolls: [1, 2], items: [['vieille_piece', 1, 2, 4], ['tesson', 1, 2, 5], ['fossile', 1, 1, 1], ['sac_graines', 1, 1, 3], ['minerai_cuivre', 1, 3, 3], ['minerai_fer', 1, 2, 2], ['geode', 1, 1, 2], ['argent', 5, 30, 3], ['relique', 1, 1, 0.3], ['bijou', 1, 1, 0.4], ['figurine', 1, 1, 0.3], ['charbon', 1, 2, 2]] },
  // le coffre englouti : une prise sur vingt-cinq à la pêche, le premier prix du concours ; une bonne surprise (≈ 4 poissons)
  peche: { rolls: [1, 3], items: [['vieille_piece', 1, 2, 5], ['argent', 10, 50, 4], ['perle', 1, 1, 1], ['bijou', 1, 1, 0.5], ['lingot_or', 1, 1, 0.3], ['gemme', 1, 1, 0.2], ['relique', 1, 1, 0.2], ['corde', 1, 1, 2], ['tesson', 1, 1, 2]] },
  geode: { rolls: [1, 2], items: [['minerai_cuivre', 2, 4, 4], ['minerai_fer', 1, 3, 3], ['minerai_or', 1, 2, 2], ['gemme', 1, 1, 1], ['charbon', 1, 3, 2], ['fossile', 1, 1, 0.6]] },
  graines: { rolls: [1, 2], items: [['graines_radis', 3, 6, 5], ['graines_ble', 3, 6, 5], ['graines_carotte', 2, 5, 4], ['graines_lin', 2, 5, 3], ['graines_betterave', 2, 4, 3], ['graines_haricot', 2, 3, 2], ['graines_fraise', 1, 3, 1.5], ['graines_tomate', 1, 3, 1.5], ['graines_mais', 1, 3, 1.5], ['graines_melon', 1, 2, 0.8], ['graines_citrouille', 1, 2, 0.6], ['graines_tournesol', 1, 3, 1.5]] },
  vivres: { rolls: [2, 3], items: [['pain', 1, 3, 5], ['fromage', 1, 1, 2], ['pomme', 2, 4, 4], ['viande_fumee', 1, 1, 1], ['cidre', 1, 1, 1], ['confiture', 1, 1, 1], ['omelette', 1, 1, 1]] },
  arbre: { rolls: [1, 1], items: [['plume', 1, 2, 4], ['oeuf', 1, 1, 2], ['sac_graines', 1, 1, 2], ['fibre', 1, 3, 4], ['bois', 1, 2, 4], ['vieille_piece', 1, 1, 0.5], ['figurine', 1, 1, 0.15], ['baies', 1, 3, 2]] },
};
// Les trésors scellés ne se remplissent pas : les coffres des lieux se regarnissent tous les trois jours, mais ce qui
// dormait dans une tombe, un temple, une crevasse ou au fond du lac n'y revient pas. Une table qui a un « reste » ne
// donne son plein que tant qu'il reste des coffres jamais ouverts de cette table dans la vallée (farm.s.tresors :
// tirages déjà faits, par table) ; ensuite, la table du reste (ce que le temps y ramène : de la poussière, des os, un
// peu de cire). Sans cela, le temple et la crypte rapportaient plus, à la tournée, qu'une ferme entière.
const LOOT_RESTE = {
  temple: 'reste_temple', temple_or: 'reste_temple', crypte: 'reste_tombe', crevasse: 'reste_glace', clocher: 'reste_noye',
  profond: 'reste_roche', cristaux: 'reste_roche', cercle_cache: 'reste_roche', grotte_peinte: 'reste_roche', bete: 'reste_roche',
  archives: 'reste_papiers', scriptorium: 'reste_papiers',
};
Object.assign(LOOT, {
  reste_temple: { rolls: [1, 1], items: [['cendre_sacree', 1, 1, 3], ['bougie', 1, 2, 3], ['tesson', 1, 1, 2], ['vieille_piece', 1, 1, 1], ['poussiere_etoile', 1, 1, 0.15]] },
  reste_tombe: { rolls: [1, 2], items: [['os', 1, 3, 5], ['bougie', 1, 2, 3], ['tesson', 1, 1, 2], ['vieille_piece', 1, 1, 0.8], ['eau_benite', 1, 1, 0.5]] },
  reste_glace: { rolls: [1, 1], items: [['os', 1, 2, 4], ['corde', 1, 1, 2], ['edelweiss', 1, 1, 0.6], ['vieille_piece', 1, 1, 0.2]] },
  reste_noye: { rolls: [1, 1], items: [['tesson', 1, 2, 4], ['vieille_piece', 1, 1, 2], ['anguille', 1, 1, 1], ['perle', 1, 1, 0.1]] },
  reste_roche: { rolls: [1, 1], items: [['os', 1, 2, 4], ['silex', 1, 2, 3], ['tesson', 1, 1, 1], ['champi_lumineux', 1, 1, 0.6], ['geode', 1, 1, 0.5], ['vieille_piece', 1, 1, 0.2]] },
  reste_papiers: { rolls: [1, 2], items: [['bougie', 1, 2, 4], ['plume', 1, 2, 3], ['cire', 1, 1, 2], ['fiole', 1, 1, 1], ['vieille_piece', 1, 1, 0.4]] },
});
// combien de trésors pleins d'une table dort dans la vallée (coffres et points à creuser qui la tirent)
function lootPleins(key) {
  const w = typeof game !== 'undefined' && game ? game.world : null;
  if (!w || !w.inter) return 1;
  const C = w.lootPleins || (w.lootPleins = {});
  if (C[key] === undefined) C[key] = Math.max(1, w.inter.filter((i) => i.data && ((i.kind === 'loot' && i.data.table === key) || (i.kind === 'dig' && i.data.loot === key))).length);
  return C[key];
}
// Tirage d'un butin : liste [[objet, n], …]
function rollLoot(key, rnd) {
  let T = LOOT[key] || LOOT.fouille;
  const reste = LOOT_RESTE[key];
  if (reste && LOOT[reste] && typeof farm !== 'undefined' && farm.s) {
    const R = farm.s.tresors || (farm.s.tresors = {});
    if ((R[key] || 0) >= lootPleins(key)) T = LOOT[reste];
    R[key] = (R[key] || 0) + 1;
  }
  rnd = rnd || Math.random;
  const items = T.items.filter((e) => e[3] > 0 && (e[0] === 'argent' || ITEMS[e[0]]));
  const tot = items.reduce((a, e) => a + e[3], 0);
  const n = T.rolls[0] + Math.floor(rnd() * (T.rolls[1] - T.rolls[0] + 1));
  const out = {};
  for (let k = 0; k < n; k++) {
    let r = rnd() * tot, pick = items[0];
    for (const e of items) { r -= e[3]; if (r <= 0) { pick = e; break; } }
    const q = pick[1] + Math.floor(rnd() * (pick[2] - pick[1] + 1));
    if (q > 0) out[pick[0]] = (out[pick[0]] || 0) + q;
  }
  return Object.entries(out);
}
ITEM_CAT_NAMES.tresor = 'Trésors et curiosités';
// catégories vendues d'un coup (« Tout vendre », « Tout déposer »)
const BULK_CATS = new Set(['culture', 'produit', 'poisson', 'cueillette', 'chasse', 'tresor']);
