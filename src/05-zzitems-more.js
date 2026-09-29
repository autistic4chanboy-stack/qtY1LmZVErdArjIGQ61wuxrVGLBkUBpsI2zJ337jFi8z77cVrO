// ============================================================================
//  OBJETS EN PLUS : pelle, cartes, alchimie (fioles, ingrédients, potions),
//  reliques des Anciens, bêtes de la ferme en plus, objets de piété, décor
// ============================================================================

Object.assign(ITEM_CAT_NAMES, { alchimie: 'Ingrédients d’alchimie', potion: 'Potions', relique: 'Reliques des Anciens', piete: 'Objets de piété' });
BULK_CATS.add('alchimie');

// ---------------------------------------------------------------- outils et objets d'usage
defItem('pelle', 'Pelle', 'outil', 70, ['pelle', '#8a8680'], { tool: 'pelle', tier: 1, desc: 'Pour creuser partout : trous, trésors, racines, grottes ensevelies.' });
defItem('carte_vallee', 'Carte de la vallée', 'outil', 45, ['carte', '#d8c8a0'], { use: 'carte', desc: 'Clic : déplier la carte.' });
defItem('carte_tresor', 'Carte au trésor', 'tresor', 15, ['carte', '#c8a870'], { use: 'tresor', desc: 'Clic : l’examiner. Une croix, quelque part dans la vallée.' });
defItem('grimoire', 'Grimoire du frère Anselme', 'quete', 0, ['livre', '#4a2a3a'], { desc: 'Des pages d’alchimie à l’encre brune. Certaines recettes vous sont désormais connues.' });
defItem('livre_legendes', 'Légendes de la vallée', 'quete', 0, ['livre', '#6a3a24'], { desc: 'Un recueil de veillées, annoté par plusieurs générations de lecteurs.' });

// matériaux
defItem('fiole', 'Fiole vide', 'materiau', 1, ['fiole', '#c8e0e8'], { desc: 'Pour l’alambic, la rosée, l’eau bénite.' });
defItem('sable', 'Sable', 'materiau', 0, ['tas', '#d8c080']);
defItem('os', 'Os', 'materiau', 1, ['os', '#e8e0cc']);
defItem('argile', 'Argile', 'materiau', 1, ['tas', '#a86a4a']);
defItem('silex', 'Silex', 'materiau', 1, ['caillou', '#5a5a64']);
defItem('vers', 'Vers de terre', 'cueillette', 1, ['ver', '#c07060'], { desc: 'Le pêcheur en raffole. Enfin, ses poissons.' });

// ingrédients d'alchimie
const ALCH = (id, name, price, ic, desc) => defItem(id, name, 'alchimie', price, ic, { alch: true, desc });
ALCH('trefle', 'Trèfle à quatre feuilles', 4, ['trefle', '#3a9a3a'], 'Rare, dans les prés. Porte-bonheur, dit-on.');
ALCH('champi_lumineux', 'Champignon lumineux', 4, ['champi', '#60e0d0'], 'Il luit doucement dans le noir des grottes.');
ALCH('plume_hibou', 'Plume de hibou', 3, ['plume', '#b09070'], 'Douce, silencieuse.');
ALCH('rosee', 'Fiole de rosée', 3, ['fiole', '#c0f0ff'], 'Recueillie à l’aube, sur l’herbe.');
ALCH('fleur_lune', 'Fleur de lune', 8, ['fleur', '#c8d8ff'], 'Elle ne s’ouvre que la nuit, dans le cercle de pierres.');
ALCH('lichen', 'Lichen', 1, ['lichen', '#a0b070'], 'Gratté sur les rochers.');
ALCH('eau_benite', 'Fiole d’eau bénite', 3, ['fiole', '#e8f0ff'], 'Puisée au bénitier de l’église.');
ALCH('aile_chauve_souris', 'Aile de chauve-souris', 4, ['aile', '#4a3a3a'], 'Fine comme du papier.');
ALCH('venin', 'Fiole de venin', 5, ['fiole', '#80c040'], 'Venin de vipère. Attention.');
ALCH('mue_serpent', 'Mue de serpent', 3, ['mue', '#c8b890'], 'Une peau vide, parfaite.');
ALCH('larme_dame', 'Larme de la Dame', 20, ['larme', '#80c0ff'], 'Une goutte d’eau qui ne sèche jamais.');
ALCH('mandragore', 'Racine de mandragore', 60, ['racine', '#c09060'], 'Elle a crié quand vous l’avez arrachée.');
ALCH('poudre_os', 'Poudre d’os', 3, ['sachet', '#e8e0d0'], 'Des os moulus, blancs comme la farine.');

// potions (effets : voir le module d'alchimie)
const POTIONS = {
  potion_soin: { name: 'Potion de soin', col: '#d84040', need: ['herbes', 'miel'], h: 0, desc: 'Rend la santé.' },
  potion_vigueur: { name: 'Élixir de vigueur', col: '#e0a020', need: ['truffe', 'miel'], h: 20, desc: 'On tient toute la nuit sans s’effondrer.' },
  potion_celerite: { name: 'Potion de célérité', col: '#40c0e0', need: ['plume', 'trefle'], h: 4, desc: 'Les jambes courent toutes seules.' },
  potion_nyctalopie: { name: 'Potion d’œil de chouette', col: '#60e080', need: ['champi_lumineux', 'plume_hibou'], h: 6, desc: 'Voir dans la nuit.' },
  potion_croissance: { name: 'Élixir de croissance', col: '#80d040', need: ['rosee', 'poudre_os', 'fleur'], h: 0, desc: 'À verser sur les semis (clic) : ils lèvent de plusieurs heures.' },
  potion_chance: { name: 'Potion de bonne fortune', col: '#f0d040', need: ['trefle', 'vieille_piece', 'fleur_lune'], h: 12, desc: 'Meilleur butin, meilleures prises.' },
  potion_silence: { name: 'Potion de silence', col: '#5a5a70', need: ['plume_noire', 'lichen', 'rosee'], h: 3, desc: 'Ce qui chasse la nuit perd votre trace.' },
  potion_clairvoyance: { name: 'Potion de clairvoyance', col: '#b080ff', need: ['fleur_lune', 'eau_benite', 'eclat'], h: 2, desc: 'Voir ce qui est caché : trésors, grottes, reliques.' },
  potion_apnee: { name: 'Potion de souffle d’anguille', col: '#3070b0', need: ['anguille', 'perle', 'rosee'], h: 3, desc: 'Respirer sous l’eau.' },
  potion_force: { name: 'Potion de force', col: '#c05030', need: ['croc', 'viande', 'champignon'], h: 4, desc: 'Les outils frappent deux fois plus fort.' },
  potion_legerete: { name: 'Potion de légèreté', col: '#e0e0f8', need: ['aile_chauve_souris', 'plume', 'fleur'], h: 3, desc: 'Sauts plus hauts, chutes sans mal.' },
  antidote: { name: 'Antidote', col: '#a0e060', need: ['venin', 'lait', 'herbes'], h: 6, desc: 'Guérit des morsures et en protège.' },
  philtre_charme: { name: 'Philtre d’amitié', col: '#f080b0', need: ['fraise', 'miel', 'fleur_lune'], h: 24, desc: 'Les gens vous apprécient deux fois plus.' },
  philtre_envers: { name: 'Philtre de l’Envers', col: '#802030', need: ['eclat', 'larme_dame', 'plume_noire'], h: 20, desc: 'Le vieux puits vous laisse descendre, même sans nuit rouge.' },
  elixir_souffle: { name: 'Élixir du dernier souffle', col: '#f8f0d0', need: ['mandragore', 'larme_dame', 'eau_benite'], h: 24, desc: 'Vous sauve une fois de la mort.' },
  somnifere: { name: 'Somnifère', col: '#6a60a0', need: ['fleur', 'lait', 'champignon'], h: 0, desc: 'Sommeil immédiat, jusqu’au matin.' },
  mixture: { name: 'Mixture douteuse', col: '#6a6a40', need: null, h: 0, desc: 'Personne ne sait ce que c’est. Pas même vous.' },
};
for (const id in POTIONS) { const P = POTIONS[id]; defItem(id, P.name, 'potion', id === 'mixture' ? 1 : 6 + P.need.length * 4 + (P.h > 6 ? 6 : 0), ['fiole', P.col], { potion: id, desc: P.desc }); }
ITEMS.elixir_souffle.price = 60; ITEMS.philtre_envers.price = 30; ITEMS.potion_clairvoyance.price = 24;

// reliques des Anciens (11)
const RELICS = ['relique_cerf', 'relique_dame', 'relique_calice', 'relique_tablette', 'relique_sceau', 'relique_croc', 'relique_medaillon', 'relique_croix', 'relique_lampe', 'relique_fer', 'relique_poupee'];
defItem('relique_cerf', 'Bois du Cerf Blanc', 'relique', 0, ['bois_cerf', '#f0f0e8']);
defItem('relique_dame', 'Anneau de la Dame', 'relique', 0, ['anneau', '#d8e4ff']);
defItem('relique_calice', 'Calice noyé', 'relique', 0, ['calice', '#c8a040']);
defItem('relique_tablette', 'Tablette des Treize', 'relique', 0, ['tablette', '#8a8a80']);
defItem('relique_sceau', 'Sceau des Valmont', 'relique', 0, ['sceau', '#d0a030']);
defItem('relique_croc', 'Croc de la Bête', 'relique', 0, ['croc', '#e8e0c8']);
defItem('relique_medaillon', 'Médaillon des noyés', 'relique', 0, ['medaillon', '#b0a060']);
defItem('relique_croix', 'Croix de Montrevel', 'relique', 0, ['croix', '#9a9aa0']);
defItem('relique_lampe', 'Lampe des Frappeurs', 'relique', 0, ['lampe', '#d09040']);
defItem('relique_fer', 'Fer de la Mesnie', 'relique', 0, ['fer', '#8090a0']);
defItem('relique_poupee', 'Poupée de paille de la Mère', 'relique', 0, ['poupee', '#d8c070']);
defItem('couronne_anciens', 'Couronne des Anciens', 'relique', 0, ['couronne', '#e0c060'], { desc: 'La vallée dort, enfin. Elle vous a choisi pour veiller.' });

// piété
defItem('chapelet_buis', 'Chapelet de buis', 'piete', 1, ['chapelet', '#b89a60'], { desc: 'Porté sur soi, il prolonge la Grâce d’une nuit.' });
defItem('talisman_paille', 'Talisman de paille', 'piete', 1, ['poupee', '#d8b860'], { desc: 'Porté sur soi : les corbeaux évitent vos champs.' });

// bêtes de la ferme en plus, et leurs produits
defItem('chevre', 'Chèvre', 'animal', 420, ['animal', '#d8d0c0'], { animal: 'goat' });
defItem('oie', 'Oie', 'animal', 180, ['animal', '#f0f0ea'], { animal: 'goose' });
defItem('cane', 'Cane', 'animal', 120, ['animal', '#8a6a4a'], { animal: 'farmduck' });
defItem('lapin', 'Lapin', 'animal', 90, ['animal', '#9a8672'], { animal: 'farmrabbit' });
defItem('ane', 'Âne', 'animal', 700, ['animal', '#7a7068'], { animal: 'donkey' });
defItem('lait_chevre', 'Lait de chèvre', 'produit', 14, ['bouteille', '#f4f0e4']);
defItem('fromage_chevre', 'Fromage de chèvre', 'nourriture', 38, ['fromage', '#f0ead8'], { food: 22, heal: 4 });
defItem('oeuf_cane', 'Œuf de cane', 'produit', 7, ['oeuf', '#dfe8e0']);
defItem('oeuf_oie', 'Œuf d’oie', 'produit', 12, ['oeuf', '#f4f2ea']);
defItem('poil_lapin', 'Poil de lapin', 'produit', 9, ['laine', '#e0d8d0']);
ITEM_GROUPS.oeufs = ['oeuf', 'oeuf_cane', 'oeuf_oie'];
GROUP_NAMES.oeufs = 'œufs (au choix)';

// ---------------------------------------------------------------- objets à poser en plus
Object.assign(PLACEABLES, {
  alambic: { name: 'Alambic', price: 74, alembic: true }, autel_maison: { name: 'Coin de prière', price: 11, shrine: true },
  croix_bois: { name: 'Croix de bois', price: 1 }, statue_saint: { name: 'Statue de saint Aubin', price: 1 },
  pierre_gravee: { name: 'Pierre gravée des Anciens', price: 2, shrine: true }, clapier: { name: 'Clapier', price: 1 },
  mare: { name: 'Mare aux canards', price: 5, water: true },
});
for (const id of ['alambic', 'autel_maison', 'croix_bois', 'statue_saint', 'pierre_gravee', 'clapier', 'mare']) {
  const p = PLACEABLES[id];
  defItem(id, p.name, 'objet', p.price, ['objet', id], { place: id });
}

// ---------------------------------------------------------------- recettes
RECIPES.push(
  { out: 'pelle', n: 1, need: { bois: 2, lingot_fer: 1 }, st: 'etabli' },
  { out: 'fiole', n: 2, need: { sable: 3, charbon: 1 }, st: 'four' },
  { out: 'alambic', n: 1, need: { lingot_cuivre: 4, fiole: 2, pierre: 4 }, st: 'etabli' },
  { out: 'poudre_os', n: 1, need: { os: 3 }, st: null },
  { out: 'chapelet_buis', n: 1, need: { bois: 1, fibre: 3 }, st: null },
  { out: 'talisman_paille', n: 1, need: { foin: 3, fibre: 2, fleur: 1 }, st: null },
  { out: 'autel_maison', n: 1, need: { bois: 4, bougie: 2, fleur: 3 }, st: 'etabli' },
  { out: 'croix_bois', n: 1, need: { bois: 3, corde: 1 }, st: null },
  { out: 'statue_saint', n: 1, need: { pierre: 14 }, st: 'etabli' },
  { out: 'pierre_gravee', n: 1, need: { pierre: 8, silex: 2 }, st: 'etabli' },
  { out: 'clapier', n: 1, need: { bois: 6, corde: 1 }, st: 'etabli' },
  { out: 'mare', n: 1, need: { pierre: 6, argile: 4 }, st: null },
  { out: 'poteau_indicateur', n: 1, need: { bois: 3, corde: 1 }, st: null },
);
MACHINES.moulin_a_bras.push({ in: { os: 2 }, out: ['poudre_os', 1], h: 0.5 });
MACHINES.baratte.push({ in: { lait_chevre: 2 }, out: ['fromage_chevre', 1], h: 3 });

// ---------------------------------------------------------------- boutiques
{
  const S = (id) => NPC_DATA.find((d) => d.id === id);
  const F = S('forgeron'); if (F && F.shop) { F.shop.sells.push(['pelle', 70]); F.shop.buys.push('silex', 'os'); }
  const G = S('guerisseuse');
  if (G) {
    G.shop = G.shop || { name: 'La hutte', sells: [], buys: [] };
    G.shop.sells.push(['fiole', 10], ['potion_soin', 60], ['antidote', 90], ['alambic', 420], ['rosee', 20]);
    G.shop.buys.push('mandragore', 'champi_lumineux', 'venin', 'mue_serpent', 'fleur_lune', 'trefle', 'plume_hibou', 'aile_chauve_souris', 'lichen', 'os', 'larme_dame');
  }
  const P = S('postiere'); if (P && P.shop) P.shop.sells.push(['carte_vallee', 45]); else if (P) P.shop = { name: 'La poste', sells: [['carte_vallee', 45]], buys: [] };
  const E = S('eleveuse'); if (E && E.shop) { E.shop.sells.push(['chevre', 420], ['oie', 180], ['cane', 120], ['lapin', 90], ['ane', 700]); E.shop.buys.push('lait_chevre', 'poil_lapin', 'oeuf_cane', 'oeuf_oie'); }
  const Pe = S('pecheur'); if (Pe && Pe.shop) Pe.shop.buys.push('vers');
  const A = S('aubergiste'); if (A && A.shop) A.shop.buys.push('fromage_chevre', 'oeuf_cane', 'oeuf_oie', 'lait_chevre');
}

// ---------------------------------------------------------------- butins en plus
// (une carte au trésor mène à un trésor : rare dans les coffres qui se regarnissent)
LOOT.campement.items.push(['carte_tresor', 1, 1, 0.15], ['os', 1, 2, 1], ['fiole', 1, 2, 1]);
LOOT.charrette.items.push(['carte_tresor', 1, 1, 0.15], ['fiole', 1, 2, 1]);
LOOT.barque.items.push(['carte_tresor', 1, 1, 0.15]);
LOOT.ruines.items.push(['carte_tresor', 1, 1, 0.3], ['os', 1, 3, 2]);
LOOT.hameau.items.push(['os', 1, 2, 2], ['fiole', 1, 1, 1]);
LOOT.chapelle.items.push(['eau_benite', 1, 1, 1.5], ['fiole', 1, 2, 1.5]);
LOOT.marais.items.push(['mue_serpent', 1, 1, 1], ['os', 1, 2, 1]);
LOOT.mine.items.push(['silex', 1, 3, 2]);
LOOT.crypte.items.push(['os', 2, 4, 3], ['eau_benite', 1, 1, 1]);
LOOT.envers.items.push(['larme_dame', 1, 1, 0.5]);
LOOT.fouille.items.push(['os', 1, 2, 2], ['silex', 1, 1, 2], ['carte_tresor', 1, 1, 0.3], ['vers', 1, 3, 2]);
LOOT.arbre.items.push(['plume_hibou', 1, 1, 0.3]);
Object.assign(LOOT, {
  pelle: { rolls: [1, 1], items: [['vers', 1, 3, 6], ['pierre', 1, 2, 5], ['os', 1, 1, 2], ['silex', 1, 1, 2], ['argile', 1, 2, 3], ['tesson', 1, 1, 1.2], ['vieille_piece', 1, 1, 0.8], ['fossile', 1, 1, 0.2], ['carte_tresor', 1, 1, 0.08]] },
  sable: { rolls: [1, 1], items: [['sable', 1, 3, 10], ['perle', 1, 1, 0.1], ['vieille_piece', 1, 1, 0.3]] },
  // le coffre d'une carte au trésor : un beau jour de chance, pas une fortune (les cartes s'achètent au Marchedi)
  tresor_carte: { rolls: [3, 4], items: [['argent', 60, 160, 5], ['vieille_piece', 1, 3, 5], ['bijou', 1, 1, 2], ['lingot_or', 1, 1, 1], ['gemme', 1, 1, 0.7], ['relique', 1, 1, 0.5], ['trefle', 1, 1, 1], ['geode', 1, 1, 2]] },
  // la cache des contrebandiers se regarnit (ils passent) : de quoi boire, un peu d'argent, rarement une carte
  contrebandiers: { rolls: [1, 2], items: [['vin', 1, 2, 4], ['cidre', 1, 2, 4], ['argent', 20, 70, 4], ['bijou', 1, 1, 0.5], ['carte_tresor', 1, 1, 0.3], ['corde', 1, 3, 3], ['lanterne', 1, 1, 0.5], ['toile', 1, 3, 2], ['tabac', 0, 0, 0]] },
  clocher: { rolls: [3, 4], items: [['vieille_piece', 3, 8, 5], ['bijou', 1, 2, 3], ['relique', 1, 1, 2], ['perle', 1, 3, 3], ['eau_benite', 1, 2, 2], ['argent', 80, 200, 3]] },
  noyes: { rolls: [3, 4], items: [['vieille_piece', 2, 6, 5], ['bijou', 1, 2, 3], ['perle', 1, 2, 3], ['lingot_or', 1, 1, 1.5], ['argent', 60, 160, 3], ['anguille', 1, 2, 1]] },
  valmont: { rolls: [4, 5], items: [['lingot_or', 2, 4, 5], ['bijou', 2, 3, 4], ['gemme', 1, 3, 3], ['vieille_piece', 4, 10, 5], ['argent', 200, 500, 4]] },
  bete: { rolls: [2, 3], items: [['os', 2, 5, 5], ['croc', 1, 3, 4], ['fourrure', 1, 2, 3], ['vieille_piece', 1, 3, 2], ['fleche_fer', 2, 6, 2], ['cuir', 1, 2, 2]] },
  scriptorium: { rolls: [2, 3], items: [['bougie', 2, 4, 4], ['fiole', 2, 4, 4], ['eau_benite', 1, 2, 2], ['livre', 0, 0, 0], ['vieille_piece', 1, 3, 3], ['argent', 30, 90, 3]] },
  frappeurs: { rolls: [3, 5], items: [['minerai_or', 2, 5, 5], ['gemme', 1, 3, 4], ['lingot_or', 1, 2, 2], ['geode', 2, 3, 4], ['cristal_bleu', 0, 0, 0], ['argent', 50, 150, 3]] },
  cristaux: { rolls: [2, 3], items: [['gemme', 1, 2, 4], ['geode', 1, 3, 4], ['champi_lumineux', 1, 3, 4], ['minerai_or', 1, 2, 2], ['fossile', 1, 1, 2]] },
  grotte_peinte: { rolls: [2, 3], items: [['silex', 2, 4, 5], ['os', 1, 3, 4], ['fossile', 1, 2, 3], ['tesson', 1, 2, 3], ['relique', 1, 1, 1]] },
  cercle_cache: { rolls: [2, 3], items: [['eclat', 1, 3, 4], ['vieille_piece', 2, 5, 4], ['bijou', 1, 1, 2], ['gemme', 1, 1, 2]] },
});
// cueillette : quelques ingrédients en plus
HARVEST.tallgrass.drop.push(['trefle', 1, 1, 0.025]);
HARVEST.rock.drop.push(['lichen', 1, 1, 0.14], ['silex', 1, 1, 0.12]);
HARVEST.stones.drop.push(['silex', 1, 1, 0.15]);
if (HARVEST.bones) HARVEST.bones.drop.push(['os', 1, 2, 1]); else HARVEST.bones = { tool: 'main', hp: 0, drop: [['os', 1, 3]], regrow: 72 };
HARVEST.mushroom && HARVEST.mushroom.drop.push(['champi_lumineux', 1, 1, 0.03]);
