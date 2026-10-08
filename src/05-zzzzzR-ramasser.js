// ============================================================================
//  DES OBJETS À RAMASSER UN PEU PARTOUT (agent R, vague 13) — les données
//  Des choses posées à la vue, qu'on trouve en se promenant, sans ouvrir de
//  meuble : E, et c'est dans la sacoche. Ici : les objets nouveaux, quatre
//  recettes qui les rendent utiles, et le catalogue des « sortes » de
//  trouvailles (ce qu'on ramasse, combien, où on les trouve, si elles
//  reviennent, et leur saison pour les fruits tombés).
//  La pose (passe de génération), l'état sauvegardé, la touche E et le dessin :
//  11-zzzzR-ramasser.js ; les modèles et les icônes : 07-zzzzzzzzzzzzR-ramasser.js.
// ============================================================================

// ---------------------------------------------------------------- objets nouveaux
// (de quoi faire)
defItem('ficelle', 'Bout de ficelle', 'materiau', 1, ['r_ficelle', '#c8b08a'], { desc: 'Une longueur de ficelle de chanvre, encore solide. On ne jette jamais la ficelle.' });
defItem('chiffon', 'Chiffon', 'materiau', 1, ['r_chiffon', '#e4dccb', '#7a8ab0'], { desc: 'Un carré de toile de lin, lavé par la pluie. On en fait des torchons, des mèches, des pansements.' });
defItem('bouteille_vide', 'Bouteille vide', 'materiau', 1, ['r_bouteille', '#3e6a48'], { desc: 'Une bouteille de verre vert, sans étiquette ni bouchon. Le verre se refond.' });
defItem('bois_flotte', 'Bois flotté', 'materiau', 0, ['n2_buche', '#b8b4a8', '#e0dccc'], { desc: 'Une branche blanchie et lissée par l’eau, légère comme un os. Elle brûle bien.' });
defItem('liege', 'Flotteur de liège', 'materiau', 1, ['r_liege', '#9a7650'], { desc: 'Un flotteur de filet, en liège noirci. Le filet, lui, n’est jamais remonté.' });
defItem('coquille_mulette', 'Coquille de mulette', 'materiau', 1, ['r_coquille', '#2e3440', '#d8d4e4'], { desc: 'La coquille vide d’une moule de rivière, noire dehors, nacrée dedans.' });
defItem('mulette', 'Mulette fermée', 'materiau', 2, ['r_coquille', '#262a30', '#3a3e46'], { open: 'r_mulette', desc: 'Une moule de rivière, encore close, lourde dans la main. En main, un clic l’ouvre.' });
// (de quoi manger)
defItem('faines', 'Faînes', 'cueillette', 1, ['r_faines', '#8a5a34'], { food: 3, desc: 'Les petits fruits à trois angles du hêtre. Les cochons s’en régalent ; les gens aussi, les mauvaises années.' });
// (petites valeurs, choses perdues)
defItem('montre_arretee', 'Montre arrêtée', 'tresor', 24, ['montre', '#c8c8d0'], { desc: 'Une montre d’argent au boîtier cabossé. Les aiguilles disent quatre heures moins dix, et ne repartent pas.' });
defItem('bague_laiton', 'Bague de laiton', 'tresor', 6, ['anneau', '#c8a850'], { desc: 'Un anneau de laiton, trop large pour un doigt de femme, trop fin pour un doigt d’homme.' });
defItem('epingle_chapeau', 'Épingle à chapeau', 'tresor', 3, ['r_epingle', '#b8b8c0', '#1a1a1e'], { desc: 'Une longue épingle à tête de jais, tordue au bout. Une dame l’a perdue, un jour de vent.' });
defItem('cle_sans_porte', 'Clé sans porte', 'tresor', 2, ['cle', '#6a645c'], { desc: 'Une grosse clé de fer forgé, au panneton compliqué. Vous ne connaissez pas la porte qu’elle ouvre. Il n’y en a peut-être plus.' });
defItem('medaille_bapteme', 'Médaille de baptême', 'tresor', 12, ['medaillon', '#d0d0d8'], { desc: 'Une petite médaille d’argent. Au dos, un prénom gratté et une date : 1841.' });
defItem('cheval_bois', 'Petit cheval de bois', 'tresor', 3, ['r_cheval', '#a8784a'], { desc: 'Un petit cheval taillé au couteau, la crinière marquée de traits. Une jambe manque.' });
defItem('soldat_plomb', 'Soldat de plomb', 'tresor', 4, ['r_soldat', '#2a3a7a', '#c83a30'], { desc: 'Un fantassin de plomb, la peinture écaillée, le fusil à l’épaule.' });
defItem('toupie', 'Toupie', 'tresor', 2, ['r_toupie', '#c8a060'], { desc: 'Une toupie de buis, sa pointe de fer usée. La ficelle a disparu.' });
defItem('sabot_enfant', 'Sabot d’enfant', 'tresor', 1, ['r_sabot', '#9a6a40'], { desc: 'Un sabot de hêtre, à la taille d’un enfant de six ou sept ans, usé au talon.' });
defItem('gant_laine', 'Gant de laine', 'tresor', 1, ['r_gant', '#8a8680'], { desc: 'Un gant de laine grise, raidi par le froid. Il garde la forme d’une main.' });
defItem('pipe_terre', 'Pipe de terre', 'tresor', 2, ['r_pipe', '#e8e2d4'], { desc: 'Une pipe de terre blanche, le fourneau noirci. Le tuyau est cassé net.' });
defItem('lettre_perdue', 'Lettre perdue', 'tresor', 0, ['lettre', '#e2d8bc'], { desc: 'Un papier plié en quatre, ramassé par terre. En main, un clic : vous relisez ce que vous avez trouvé.' });
defItem('gourde', 'Gourde de fer-blanc', 'tresor', 3, ['r_gourde', '#a8acb0', '#6a4a2a'], { desc: 'Une gourde de fer-blanc cabossée, la courroie coupée. Elle sent encore l’eau-de-vie.' });
defItem('chapeau_feutre', 'Chapeau de feutre', 'tresor', 2, ['r_chapeau', '#2a2624'], { desc: 'Un chapeau de feutre noir, à large bord, détrempé. Personne ne l’a réclamé.' });
defItem('bois_chevreuil', 'Bois de chevreuil', 'materiau', 5, ['bois_cerf', '#c8b494'], { desc: 'Un bois de chevreuil tombé à la mue, à trois andouillers. Les couteliers en font des manches.' });
defItem('crane_renard', 'Crâne de renard', 'tresor', 3, ['r_crane', '#e4dcc8'], { desc: 'Un crâne de renard, blanchi, les dents encore en place. Léger comme du papier.' });
defItem('pointe_fleche', 'Pointe de flèche de silex', 'tresor', 8, ['r_pointe', '#6a625a'], { desc: 'Une pointe de silex taillée à petits éclats, d’une finesse qu’on ne sait plus faire.' });
defItem('fibule', 'Fibule de bronze', 'tresor', 30, ['r_fibule', '#5a8a6a', '#a8884a'], { desc: 'Une agrafe de bronze en forme d’arc, verte de vert-de-gris. Elle a fermé un manteau, il y a très longtemps.' });
defItem('perle_verre', 'Perle de verre', 'tresor', 6, ['r_perle', '#3a6ab8', '#e8c840'], { desc: 'Une perle de verre bleu, rayée de jaune, percée de part en part. Elle est plus vieille que l’église.' });
defItem('pierre_percee', 'Pierre percée', 'tresor', 10, ['r_percee', '#8a8a86'], { desc: 'Un galet percé d’un trou que l’eau a creusé. On dit qu’en regardant au travers, on voit ce qui se cache.' });
defItem('daguerreotype', 'Portrait sur plaque', 'tresor', 30, ['r_portrait', '#3a2a22', '#c8c8cc'], { desc: 'Un portrait sur une plaque d’argent, dans un étui de cuir. Le visage n’apparaît que si l’on penche la plaque.' });
defItem('ex_voto', 'Ex-voto de cire', 'tresor', 2, ['r_coeur', '#e0c890'], { desc: 'Un petit cœur de cire, déposé pour une guérison. Il a fondu un peu au soleil.' });

// une mulette qu'on ouvre : sa coquille, rarement une perle
if (typeof LOOT !== 'undefined' && !LOOT.r_mulette) LOOT.r_mulette = { rolls: [1, 1], items: [['coquille_mulette', 1, 1, 0.97], ['perle', 1, 1, 0.012], ['boutons_nacre', 1, 1, 0.018]] };
// le bois flotté brûle et se travaille comme une bûche
if (ITEM_GROUPS.bois && !ITEM_GROUPS.bois.includes('bois_flotte')) ITEM_GROUPS.bois.push('bois_flotte');
// ce qu'on fait des trouvailles (à découvrir en assemblant, comme le reste)
RECIPES.push(
  { out: 'corde', n: 1, need: { ficelle: 3 }, st: null },
  { out: 'bandage', n: 1, need: { chiffon: 2 }, st: null },
  { out: 'fiole', n: 1, need: { bouteille_vide: 1 }, st: 'four' },
);
if (ITEMS.cierge_flottant) RECIPES.push({ out: 'cierge_flottant', n: 1, need: { liege: 1, bougie: 1 }, st: null });

// ---------------------------------------------------------------- les saisons des fruits tombés
// La vallée n'a pas de calendrier des saisons : les fruits tombés suivent leur propre cycle, de vingt-quatre jours
// (deux semaines de douze jours). Jour du cycle d = (jour − 1) mod 24 ; chaque fruit tombe pendant ses fenêtres [a, b[.
// Chaque jour, deux ou trois sortes de fruits jonchent le pied des arbres.
const RAM_CYCLE = 24;
const RAM_SAISONS = {
  pomme: [[0, 12], [20, 24]], poire: [[6, 15]], prune: [[2, 10]], cerise: [[0, 3], [18, 24]],
  noix: [[9, 18]], chataigne: [[12, 21]], faines: [[14, 22]],
};
function ramEnSaison(cle, jour) {
  const W = RAM_SAISONS[cle];
  if (!W) return true;
  const d = (((jour | 0) - 1) % RAM_CYCLE + RAM_CYCLE) % RAM_CYCLE;
  for (const [a, b] of W) if (d >= a && d < b) return true;
  return false;
}

// ---------------------------------------------------------------- les milieux où l'on trouve
// chemin : le bord des chemins et des sentiers (hors des villages) ; champ : le bord des champs (la charrue remonte des
// choses) ; verger : le pied des arbres à fruits (la sorte suit l'arbre) ; seuil : les seuils et le pied des murs ;
// rue : les rues et les places des villages ; eau : les berges (ce que l'eau ramène) ; foret, lande, hauteurs, pres :
// ce qu'on a perdu là ; saint : chapelles, croix, calvaires, oratoires ; ancien : pierres levées, dolmens, cercles ;
// ruine : ruines, hameau abandonné, château, abbaye ; camp : campements, roulottes, charbonnières, cabanes ;
// estive : l'estive et la bergerie ; cour : les cours des fermes ; maison : dans les maisons, sur un meuble ; sol :
// dans les maisons, par terre ; poules : les basses-cours (hameau, ranch) ; grange : le grand fenil du hameau ; tour : les étages
// du moulin et du phare.
const RAM_MILIEUX = ['chemin', 'champ', 'verger', 'seuil', 'rue', 'eau', 'foret', 'lande', 'hauteurs', 'pres', 'saint', 'ancien', 'ruine', 'camp', 'estive', 'cour', 'poules', 'maison', 'sol', 'grange', 'tour'];

// ---------------------------------------------------------------- les sortes de trouvailles
// it : l'objet donné ('argent' : des sous) ; n : [min, max] ; lab : ce qu'on lit sous le réticule ; mod : le modèle
// (07-zzzzzzzzzzzzR) ; ou : { milieu: poids } ; rev : revient au bout de tant de jours (0 : une fois pour toutes) ;
// nv : le nombre suit le détail v (ce qu'on voit, c'est ce qu'on ramasse) ; saison : clé de RAM_SAISONS ; brille : un éclat de soleil, de près (métal, verre) ; lire : on la lit en la ramassant ;
// pense : une pensée, la première fois seulement.
const RAM_SORTES = {
  // ---- de quoi faire
  branche: { it: 'bois_mort', n: [1, 2], lab: 'Ramasser la branche morte', mod: 'branche', ou: { foret: 5, pres: 1.5, chemin: 2, lande: 1.5, cour: 1.5, camp: 1, poules: 1 }, rev: 4 },
  galet: { it: 'pierre', n: [1, 1], lab: 'Ramasser le galet', mod: 'galet', ou: { eau: 1.5, chemin: 0.6 } },
  silex: { it: 'silex', n: [1, 1], lab: 'Ramasser le silex', mod: 'silex', ou: { champ: 6, lande: 4, hauteurs: 1.5, chemin: 1.2, pres: 1.2, ancien: 1 } },
  clous: { it: 'clous', n: [1, 1], lab: 'Ramasser les clous', mod: 'clous', vu: 0, ou: { seuil: 3, grange: 5, rue: 1.5, chemin: 1.5, sol: 2, ruine: 3, cour: 1.5, poules: 0.8, tour: 2 }, brille: 1 },
  ficelle: { it: 'ficelle', n: [1, 2], lab: 'Ramasser le bout de ficelle', mod: 'ficelle', vu: 1, ou: { chemin: 3.5, grange: 5, cour: 3, maison: 2, rue: 1, eau: 1, champ: 2, camp: 1.5, poules: 1.5, tour: 2, sol: 1.5 } },
  chiffon: { it: 'chiffon', n: [1, 1], lab: 'Ramasser le chiffon', mod: 'chiffon', ou: { chemin: 2, rue: 1.5, eau: 1.5, maison: 1, grange: 2, camp: 3, cour: 1, tour: 1.5, sol: 1 } },
  bouteille: { it: 'bouteille_vide', n: [1, 1], lab: 'Ramasser la bouteille', mod: 'bouteille', ou: { eau: 3.5, chemin: 1, rue: 0.8, camp: 3, ruine: 1, grange: 0.5, tour: 0.8 }, brille: 1 },
  fer: { it: 'fer_cheval', n: [1, 1], lab: 'Ramasser le fer à cheval', mod: 'fer', ou: { chemin: 4.5, rue: 1.5, grange: 2.5, cour: 2, champ: 1, estive: 0.5, poules: 1 } },
  ferraille: { it: 'ferraille', n: [1, 1], lab: 'Ramasser la ferraille', mod: 'ferraille', ou: { chemin: 0.8, ruine: 2, cour: 1, grange: 1.2, camp: 0.8 } },
  verre: { it: 'eclats_verre', n: [1, 2], lab: 'Ramasser les éclats de verre', mod: 'verre', ou: { rue: 1, ruine: 2, chemin: 0.6, seuil: 0.5 }, brille: 1 },
  corde: { it: 'corde', n: [1, 1], lab: 'Ramasser le bout de corde', mod: 'corde', ou: { grange: 3, eau: 1.2, cour: 1, estive: 0.8, tour: 1.5 } },
  flotte: { it: 'bois_flotte', n: [1, 2], lab: 'Ramasser le bois flotté', mod: 'flotte', ou: { eau: 10 }, rev: 6 },
  liege: { it: 'liege', n: [1, 1], lab: 'Ramasser le flotteur de liège', mod: 'liege', ou: { eau: 2.5 } },
  charbon: { it: 'charbon', n: [1, 2], lab: 'Ramasser les morceaux de charbon', mod: 'charbon', ou: { camp: 2.5, foret: 0.3 } },
  plume_poule: { it: 'plume', n: [1, 2], lab: 'Ramasser la plume', mod: 'plume', ou: { poules: 4, grange: 2, tour: 1.5 }, rev: 3 },
  plume_geai: { it: 'plume_geai', n: [1, 1], lab: 'Ramasser la plume bleue', mod: 'plume_geai', ou: { foret: 2, pres: 0.5 } },
  plume_buse: { it: 'plume_rapace', n: [1, 1], lab: 'Ramasser la grande plume', mod: 'plume_buse', vu: 1, ou: { lande: 1.5, hauteurs: 1.2, pres: 0.4 } },
  plume_noire: { it: 'plume_cormoran', n: [1, 1], lab: 'Ramasser la plume noire', mod: 'plume_noire', ou: { eau: 1.5 } },
  os: { it: 'os', n: [1, 1], lab: 'Ramasser l’os', mod: 'os', ou: { foret: 1, lande: 2, hauteurs: 1.2, ruine: 0.8, pres: 0.4 } },
  mue: { it: 'mue_serpent', n: [1, 1], lab: 'Ramasser la mue de serpent', mod: 'mue', vu: 1, ou: { lande: 1.5, hauteurs: 0.8, pres: 0.3, ruine: 0.3 } },
  andouiller: { it: 'bois_chevreuil', n: [1, 1], lab: 'Ramasser le bois de chevreuil', mod: 'andouiller', ou: { foret: 0.7, pres: 0.15 } },
  crane: { it: 'crane_renard', n: [1, 1], lab: 'Ramasser le crâne', mod: 'crane', ou: { foret: 0.6, lande: 0.8, hauteurs: 0.6 } },
  coquille: { it: 'coquille_mulette', n: [1, 2], lab: 'Ramasser les coquilles', mod: 'coquille', ou: { eau: 4 }, rev: 8 },
  mulette: { it: 'mulette', n: [1, 1], lab: 'Ramasser la mulette', mod: 'mulette', ou: { eau: 0.8 } },
  cartouche: { it: 'cartouche', n: [1, 2], lab: 'Ramasser la cartouche', mod: 'cartouche', ou: { foret: 0.8, pres: 0.4, camp: 0.5 }, brille: 1 },
  oeuf: { it: 'oeuf', n: [1, 1], lab: 'Ramasser l’œuf', mod: 'oeuf', ou: { poules: 4, grange: 2.5 }, rev: 2 },
  // ---- de quoi manger : les fruits tombés (au pied de leur arbre, en saison)
  pommes: { it: 'pomme', n: [2, 4], nv: 1, lab: 'Ramasser les pommes tombées', mod: 'pommes', ou: {}, rev: 3, saison: 'pomme', arbre: 'apple' },
  poires: { it: 'poire', n: [1, 3], nv: 1, lab: 'Ramasser les poires tombées', mod: 'poires', ou: {}, rev: 3, saison: 'poire', arbre: 'poirier' },
  prunes: { it: 'prune', n: [3, 5], nv: 1, lab: 'Ramasser les prunes tombées', mod: 'prunes', ou: {}, rev: 3, saison: 'prune', arbre: 'prunier' },
  cerises: { it: 'cerise', n: [4, 7], nv: 1, lab: 'Ramasser les cerises tombées', mod: 'cerises', ou: {}, rev: 3, saison: 'cerise', arbre: 'cerisier' },
  noix: { it: 'noix', n: [3, 5], nv: 1, lab: 'Ramasser les noix', mod: 'noix', ou: {}, rev: 3, saison: 'noix', arbre: 'noyer' },
  chataignes: { it: 'chataigne', n: [2, 4], nv: 1, lab: 'Ramasser les châtaignes', mod: 'chataignes', ou: {}, rev: 3, saison: 'chataigne', arbre: 'chataignier' },
  faines: { it: 'faines', n: [4, 7], nv: 1, lab: 'Ramasser les faînes', mod: 'faines', ou: {}, rev: 3, saison: 'faines', arbre: 'hetre' },
  // ---- petites valeurs
  sou: { it: 'argent', n: [1, 1], lab: 'Ramasser le sou', mod: 'sou', ou: { rue: 6, seuil: 2, chemin: 1.2, sol: 1, cour: 0.5, tour: 0.4 }, brille: 1 },
  bouton: { it: 'boutons_nacre', n: [1, 1], lab: 'Ramasser le bouton', mod: 'bouton', ou: { rue: 3, sol: 3, maison: 2, seuil: 1.5 }, brille: 1 },
  bille: { it: 'bille', n: [1, 1], lab: 'Ramasser la bille', mod: 'bille', ou: { rue: 3, sol: 2, seuil: 1, cour: 1, poules: 0.4 }, brille: 1 },
  de: { it: 'de_coudre', n: [1, 1], lab: 'Ramasser le dé à coudre', mod: 'de', ou: { maison: 3, sol: 1, rue: 0.4 }, brille: 1 },
  bobine: { it: 'bobine_fil', n: [1, 1], lab: 'Prendre la bobine de fil', mod: 'bobine', ou: { maison: 3, sol: 0.4 } },
  epingle: { it: 'epingle_chapeau', n: [1, 1], lab: 'Ramasser l’épingle', mod: 'epingle', vu: 0, ou: { rue: 1.5, maison: 1, seuil: 0.5, chemin: 0.3 }, brille: 1 },
  ruban: { it: 'ruban', n: [1, 1], lab: 'Ramasser le ruban', mod: 'ruban', vu: 1, ou: { rue: 2, camp: 1, seuil: 0.5, pres: 0.2 } },
  peigne: { it: 'peigne_corne', n: [1, 1], lab: 'Ramasser le peigne', mod: 'peigne', ou: { maison: 1, rue: 0.8, sol: 0.6 } },
  mouchoir: { it: 'mouchoir_brode', n: [1, 1], lab: 'Ramasser le mouchoir', mod: 'mouchoir', ou: { rue: 0.8, chemin: 0.3, seuil: 0.4, saint: 0.2 } },
  tabac: { it: 'tabac', n: [1, 1], lab: 'Ramasser la blague à tabac', mod: 'blague', ou: { chemin: 0.8, rue: 0.5, camp: 0.6, pres: 0.3, grange: 0.3, tour: 0.3, maison: 0.3 } },
  couteau: { it: 'couteau_poche', n: [1, 1], lab: 'Ramasser le couteau', mod: 'couteau', ou: { chemin: 0.4, foret: 0.4, camp: 0.4, pres: 0.2 }, brille: 1 },
  besicles: { it: 'besicles', n: [1, 1], lab: 'Ramasser les besicles', mod: 'besicles', vu: 0, ou: { maison: 0.4, rue: 0.3, chemin: 0.1 }, brille: 1 },
  bague: { it: 'bague_laiton', n: [1, 1], lab: 'Ramasser la bague', mod: 'bague', ou: { rue: 0.5, eau: 0.3, sol: 0.3, chemin: 0.2 }, brille: 1 },
  medaille: { it: 'medaille_bapteme', n: [1, 1], lab: 'Ramasser la médaille', mod: 'medaille', ou: { rue: 0.3, chemin: 0.2, saint: 0.5, maison: 0.2 }, brille: 1 },
  montre: { it: 'montre_arretee', n: [1, 1], lab: 'Ramasser la montre', mod: 'montre', ou: { rue: 0.15, chemin: 0.1, foret: 0.08, maison: 0.1 }, brille: 1, pense: '(Elle marque quatre heures moins dix.)' },
  // ---- des choses perdues, qui racontent
  lettre: { it: 'lettre_perdue', n: [1, 1], lab: 'Ramasser la lettre', mod: 'lettre', ou: { rue: 1, chemin: 0.5, maison: 0.8, seuil: 0.4, eau: 0.12, tour: 0.4, sol: 1 }, lire: 1 },
  cheval_bois: { it: 'cheval_bois', n: [1, 1], lab: 'Ramasser le petit cheval de bois', mod: 'cheval_bois', ou: { rue: 0.6, maison: 0.5, cour: 0.4, sol: 0.3, poules: 0.3 } },
  soldat: { it: 'soldat_plomb', n: [1, 1], lab: 'Ramasser le soldat de plomb', mod: 'soldat', ou: { rue: 0.6, maison: 0.5, sol: 0.4 } },
  toupie: { it: 'toupie', n: [1, 1], lab: 'Ramasser la toupie', mod: 'toupie', ou: { rue: 0.8, sol: 0.5, cour: 0.4, poules: 0.3 } },
  sabot: { it: 'sabot_enfant', n: [1, 1], lab: 'Ramasser le petit sabot', mod: 'sabot', ou: { chemin: 0.4, eau: 0.6, foret: 0.25, ruine: 0.4 }, pense: '(L’autre sabot n’est nulle part.)' },
  gant: { it: 'gant_laine', n: [1, 1], lab: 'Ramasser le gant', mod: 'gant', ou: { chemin: 0.8, rue: 0.6, lande: 0.3, hauteurs: 0.5, estive: 0.5 } },
  pipe: { it: 'pipe_terre', n: [1, 1], lab: 'Ramasser la pipe', mod: 'pipe', ou: { chemin: 0.6, camp: 0.8, rue: 0.4, grange: 0.5, cour: 0.4, tour: 0.6, maison: 0.4, sol: 0.2 } },
  chapelet: { it: 'chapelet_buis', n: [1, 1], lab: 'Ramasser le chapelet', mod: 'chapelet', vu: 0, ou: { saint: 1, chemin: 0.2 } },
  image: { it: 'image_pieuse', n: [1, 1], lab: 'Ramasser l’image pieuse', mod: 'image', ou: { saint: 1, maison: 0.4, rue: 0.3, sol: 0.3 } },
  ex_voto: { it: 'ex_voto', n: [1, 1], lab: 'Ramasser l’ex-voto', mod: 'ex_voto', ou: { saint: 1.5 } },
  chandelle: { it: 'bougie', n: [1, 1], lab: 'Ramasser le bout de chandelle', mod: 'chandelle', ou: { saint: 1.2, maison: 0.6, grange: 0.4, ruine: 0.3, tour: 1.5 } },
  gourde: { it: 'gourde', n: [1, 1], lab: 'Ramasser la gourde', mod: 'gourde', ou: { chemin: 0.3, foret: 0.25, lande: 0.25, hauteurs: 0.35, camp: 0.4 }, brille: 1 },
  chapeau: { it: 'chapeau_feutre', n: [1, 1], lab: 'Ramasser le chapeau', mod: 'chapeau', ou: { foret: 0.35, chemin: 0.3, eau: 0.3 } },
  cle: { it: 'cle_sans_porte', n: [1, 1], lab: 'Ramasser la clé', mod: 'cle', ou: { ruine: 1, chemin: 0.2, rue: 0.2, eau: 0.2, foret: 0.12, tour: 0.2 } },
  poupee: { it: 'poupee_vieille', n: [1, 1], lab: 'Ramasser la poupée', mod: 'poupee', ou: { ruine: 0.6, maison: 0.15, eau: 0.12 } },
  sonnaille: { it: 'sonnaille', n: [1, 1], lab: 'Ramasser la sonnaille', mod: 'sonnaille', ou: { estive: 2.5, hauteurs: 0.6 } },
  // ---- choses anciennes, et quelques raretés
  tesson: { it: 'tesson', n: [1, 1], lab: 'Ramasser le tesson', mod: 'tesson', ou: { ruine: 3, ancien: 2, champ: 1.5 } },
  piece_ancienne: { it: 'vieille_piece', n: [1, 1], lab: 'Ramasser la vieille pièce', mod: 'piece_ancienne', ou: { ruine: 1, ancien: 1, champ: 0.25 }, brille: 1 },
  pointe: { it: 'pointe_fleche', n: [1, 1], lab: 'Ramasser la pointe de silex', mod: 'pointe', ou: { ancien: 2, lande: 0.4, champ: 0.4 } },
  perle: { it: 'perle_verre', n: [1, 1], lab: 'Ramasser la perle de verre', mod: 'perle', ou: { ancien: 0.8, ruine: 0.6 }, brille: 1 },
  fibule: { it: 'fibule', n: [1, 1], lab: 'Ramasser l’agrafe de bronze', mod: 'fibule', ou: { ruine: 0.25, ancien: 0.3 }, brille: 1 },
  percee: { it: 'pierre_percee', n: [1, 1], lab: 'Ramasser la pierre percée', mod: 'percee', ou: { eau: 0.3, ancien: 0.3 } },
  fossile: { it: 'fossile', n: [1, 1], lab: 'Ramasser la pierre striée', mod: 'fossile', ou: { hauteurs: 0.25, lande: 0.1 } },
  portrait: { it: 'daguerreotype', n: [1, 1], lab: 'Ramasser l’étui de cuir', mod: 'portrait', ou: { ruine: 0.15, maison: 0.08 }, brille: 1, pense: '(Le visage n’apparaît que de biais.)' },
  medaillon: { it: 'medaillon_portrait', n: [1, 1], lab: 'Ramasser le médaillon', mod: 'medaillon', ou: { ruine: 0.1, eau: 0.05 }, brille: 1 },
};

// combien on en ramasse (et combien on en voit, pour les sortes « nv »)
function ramNombre(S, v) { const a = S.n[0], b = S.n[1]; return S.nv ? a + Math.min(b - a, Math.floor((v || 0) * (b - a + 1))) : a + Math.floor(Math.random() * (b - a + 1)); }

// ---------------------------------------------------------------- ce qu'on lit (lettres trouvées)
// Peu de mots ; ce sont des bouts de vies. Une lettre trouvée se relit en main (clic).
const RAM_LETTRES = [
  { titre: 'Une lettre pliée en quatre', texte: 'Marthe, ne m’attends pas pour la Saint-Jean. Le patron garde les gars jusqu’à la fin des foins. Embrasse la petite.', sign: 'Jules' },
  { titre: 'Un brouillon de lettre', texte: 'Monsieur le curé, je vous écris parce que je n’ose pas venir. Ma mère se lève la nuit et parle à la fenêtre. Elle dit que quelqu’un lui répond.', sign: '' },
  { titre: 'Un reçu', texte: 'Reçu de M. Fauvel la somme de douze francs pour la vache rousse, livrée ce jour. Restent deux francs dus.', sign: 'Joseph Mercier' },
  { titre: 'Un billet', texte: 'Si tu trouves ce mot, rends-le à Lucie, au moulin. Il n’est pas pour toi.', sign: '' },
  { titre: 'Un mot froissé', texte: 'Ne passe plus par le bois après la cloche du soir. Je te l’ai dit cent fois. Prends la route, même si c’est plus long.', sign: 'ta mère' },
  { titre: 'Une liste', texte: 'Du fil noir, deux aiguilles, du sel, une chandelle pour la veillée. Ne pas oublier la chandelle.', sign: '' },
  { titre: 'Une lettre tachée', texte: 'On a revu la lumière au-dessus du marais, trois soirs de suite. Le père dit que c’est du gaz. Le père dit toujours que c’est du gaz.', sign: 'Ernestine' },
  { titre: 'Une lettre sans enveloppe', texte: 'Je reviendrai quand les pommiers fleuriront. Garde la clé sous la pierre, comme d’habitude.', sign: 'A.' },
  { titre: 'Un papier mouillé', texte: 'À qui trouvera ce papier : je suis la fille du passeur. Je n’ai jamais vu la mer. Écrivez-moi aux Planches.', sign: 'Rose' },
  { titre: 'Une page arrachée', texte: 'Compté les brebis deux fois ce soir. Cent douze. Ce matin, cent onze. Personne n’a ouvert la barrière.', sign: '' },
];
