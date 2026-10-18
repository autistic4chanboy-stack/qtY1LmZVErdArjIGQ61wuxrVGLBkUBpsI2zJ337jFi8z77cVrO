// Le wiki — LA VINGTIÈME VAGUE : une cinématique pour chaque quête (Q20A, Q20B, Q20C : src/11-zzzzzzzzzzQ20-*.js,
// src/12-zzzzzzzzzzQ20-souvenirs.js).
// tools/wiki-build.js appelle :
//  - build(X) après tools/wiki-v18.js : la fiche sys:scenes-quetes (ce qui déclenche les scènes, l'option Jeu ›
//    « Scènes des quêtes », passer une scène, les Souvenirs rangés par donneur, les scènes qui attendent le bon monde,
//    les parties d'avant) ; dans la fiche de chaque quête, une ligne : où se jouent ses scènes, et avec qui (sous le
//    bloc de la quête, chez les habitants et dans « Des quêtes pour tout le monde » ; en tête des fiches des quêtes qui
//    ont la leur : les quêtes principales, les légendes, la tournée, les petits travaux…) ; un mot dans les fiches des
//    cinématiques, des options, du carnet, des quêtes pour tout le monde, de Basse-Fosse ;
//  - sections(cats, X) : la section « Les scènes des quêtes », après « Des quêtes pour tout le monde » ; un mot dans
//    « Quêtes » et dans « Nouveautés ».
// Les lignes sont écrites ici, d'après les tables de scènes (q20.scenes : qui, où, quand) : elles ne disent pas les
// dénouements. Ce qui se cache (sous « révéler les secrets ») : l'endroit des objets à retrouver, ce que montrent les
// fins, ce qu'on aperçoit dans les scènes, les lieux qui sont eux-mêmes des secrets.
'use strict';
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');

// ---------------------------------------------------------------- où se jouent les scènes de chaque quête, et avec qui
// [texte|fiche] : un lien (du texte seul si la fiche n'existe pas) ; ((…)) : masqué (l'endroit d'un objet à retrouver,
// un lieu secret)
const OU = {
  // ---- les douze habitants (Q20A)
  maire_1: 'sur le perron de la [mairie|li:mairie], devant les jardinières vides ; la [place|li:place].',
  maire_2: 'à son bureau, à la mairie ; le [pont nord|li:pont_nord], la nuit, et le [garde des ponts|pnj:garde] à son poste ; le [puits de la place|li:puits_ville].',
  maire_3: 'à son bureau, puis sur le pas de la mairie ; ((la [tour de guet|li:tour], de loin, et la bague, là où elle était)) ; la [place|li:place].',
  maire_4: 'sur la [place|li:place], tourné vers le [vieux moulin|li:moulin] ; le moulin, la nuit ; puis à son bureau.',
  boulangere_1: 'derrière son comptoir, à la [boulangerie|li:boulangerie] ; le champ de la [ferme|li:ferme] ; avec la [petite|pnj:fillette].',
  boulangere_2: 'sur son seuil ; la [hutte de la guérisseuse|li:hutte_ermite], au fond des bois, avec la [guérisseuse|pnj:guerisseuse] ; puis devant son four.',
  boulangere_3: 'à la [boulangerie|li:boulangerie] ; son rêve ((, aux [ruines|li:ruines], à l’aube)) ; la table d’Émile.',
  forgeron_1: 'à l’enclume, à la [forge|li:forge] ; la [mine|li:mine], de loin.',
  forgeron_2: 'à la [forge|li:forge] ; ((la [mine|li:mine], et le fer, là où il était)).',
  forgeron_3: 'à la [forge|li:forge] ; le soir, seul près du feu ; la [boulangerie|li:boulangerie], de loin.',
  grainetiere_1: 'derrière ses sacs, à la [graineterie|li:graineterie] ; la [ferme|li:ferme].',
  grainetiere_2: 'à la [graineterie|li:graineterie] ; le [hameau|li:hameau], et l’[éleveuse|pnj:eleveuse] au [ranch|li:ranch].',
  grainetiere_3: 'à la [graineterie|li:graineterie] ; l’épouvantail de la [ferme|li:ferme], à l’aube.',
  aubergiste_1: 'derrière son comptoir, dans la salle de l’[auberge|li:auberge].',
  aubergiste_2: 'à l’[auberge|li:auberge], devant son ardoise ; le [forgeron|pnj:forgeron], à l’enclume ; puis de retour au comptoir.',
  aubergiste_3: 'derrière son comptoir, à l’[auberge|li:auberge] ; ((le [cimetière|li:cimetiere], et la pipe, là où elle était)).',
  cure_1: 'devant l’autel de l’[église|li:eglise] ; sur le parvis, avec les enfants et la [petite|pnj:fillette].',
  cure_2: 'sur le parvis de l’[église|li:eglise] ; ((la [chapelle abandonnée|li:chapelle], au crépuscule, et le chapelet)) ; puis devant l’autel.',
  cure_3: 'devant l’[église|li:eglise] ; le clocher, à trois heures du matin, vu de la [place|li:place] ; la porte de l’église.',
  postiere_1: 'à son guichet, à la [poste|li:poste] ; la [mairie|li:mairie], et le [maire|pnj:maire].',
  postiere_2: 'à la [poste|li:poste] ; le [ranch|li:ranch], au [hameau|li:hameau], et l’[éleveuse|pnj:eleveuse].',
  postiere_3: 'à la [poste|li:poste] ; les poules de la [ferme|li:ferme].',
  postiere_4: 'à la [poste|li:poste] ; le [grand lac|li:lac], et le [pêcheur|pnj:pecheur] sur son [ponton|li:ponton].',
  postiere_5: 'à la [poste|li:poste] ; la [hutte|li:hutte_ermite], à la chandelle, avec la [guérisseuse|pnj:guerisseuse].',
  garde_1: 'sur le tablier du [pont nord|li:pont_nord], vu d’en haut.',
  garde_2: 'au [pont sud|li:pont_sud] ; ((le [marais|li:marais], et la clé dans la vase)).',
  garde_3: 'à son poste, la nuit ; le [pont sud|li:pont_sud], levé.',
  eleveuse_1: 'à l’enclos du [ranch|li:ranch], avec Tempête, la jument.',
  eleveuse_2: 'au [ranch|li:ranch], avec Blanchette ; ((le [cercle de pierres|li:cercle], à l’aube, et la cloche)).',
  eleveuse_3: 'au [ranch|li:ranch], la nuit, avec ses bêtes ; le [hameau abandonné|li:hameau_abandonne] ; le ranch à l’aube.',
  pecheur_1: 'au bout du [ponton|li:ponton], sur le [grand lac|li:lac].',
  pecheur_2: 'sur le [ponton|li:ponton] ; ((le [phare|li:phare], et la boussole)) ; le [lac|li:lac].',
  pecheur_3: 'sur le [ponton|li:ponton], à l’aube ; le [grand lac|li:lac], dans la brume.',
  guerisseuse_1: 'à sa table, dans sa [hutte|li:hutte_ermite] ; le sous-bois, à l’aube.',
  guerisseuse_2: 'sur le seuil de sa [hutte|li:hutte_ermite] ; ((le [chêne millénaire|li:chene], et la dent dans la terre remuée)).',
  guerisseuse_3: 'dans sa [hutte|li:hutte_ermite], la nuit, à la chandelle ; le [vieux puits|li:vieux_puits] et sa margelle.',
  fillette_1: 'au [puits de la place|li:puits_ville], le jour, puis le soir.',
  fillette_2: 'à la porte de la [boulangerie|li:boulangerie] ; ((le [hameau abandonné|li:hameau_abandonne], et la poupée)).',
  fillette_3: 'la nuit, sur la [place|li:place], sous la lune ; la [guérisseuse|pnj:guerisseuse].',
  // ---- les habitants arrivés après, leurs premières quêtes (Q20C) et leurs secondes (Q20B)
  alchimiste_1: 'dans son [échoppe|li:vide6], en ville ; la montagne, de loin.',
  alchimiste_2: 'dans son [échoppe|li:vide6] ; ((les [ruines|li:ruines], un soir d’orage, et l’herbier)).',
  libraire_1: 'à son comptoir, à la [grande bibliothèque|li:bibliotheque] ; ((l’[abbaye de Montrevel|li:abbaye], au couchant, et le feuillet)).',
  libraire_2: 'à son comptoir, à la [grande bibliothèque|li:bibliotheque] ; l’[église|li:eglise] et le [curé|pnj:cure], à la sacristie.',
  colporteur_1: 'à sa [roulotte|li:roulotte_a] ; l’[auberge|li:auberge] et l’[aubergiste|pnj:aubergiste].',
  colporteur_2: 'à sa [roulotte|li:roulotte_a] ; le [refuge du col|li:refuge], la nuit.',
  colporteuse_1: 'à sa [roulotte|li:roulotte_b] ; les [Sources|li:sources], dans la vapeur du matin.',
  colporteuse_2: 'à sa [roulotte|li:roulotte_b], le soir ; ((le [col des Treize|li:col], et la clochette)).',
  chasseur_1: 'au [relais de chasse|li:relais_chasse], à l’aube.',
  chasseur_2: 'au [relais de chasse|li:relais_chasse] ; un piège ; la nuit, autour du relais.',
  naturiste_a_1: 'au bord des bains, aux [Sources|li:sources], dans la vapeur ; la [ferme|li:ferme], de loin.',
  naturiste_b_1: 'chez lui, aux [Sources|li:sources] ; l’[échoppe de l’alchimiste|li:vide6], en ville.',
  naturiste_b_2: 'chez lui, aux [Sources|li:sources] ; le bassin, la nuit ; un dénouement pour chaque réponse.',
  naturiste_c_1: 'aux bains des [Sources|li:sources], où elle dessine la vapeur ; la [cascade de la source|li:cascade], à l’aube.',
  nain_ancien_1: 'à la [falaise fendue|li:fente_nains], par où l’on descend aux halles ; la [boulangerie|li:boulangerie], en ville.',
  nain_ancien_2: 'à la [falaise fendue|li:fente_nains] ; ((la [mine|li:mine], et le marteau)).',
  nain_forgeronne_1: 'à sa forge, dans les [halles d’en bas|li:nains], sous la montagne.',
  nain_forgeronne_2: 'à sa forge, dans les [halles d’en bas|li:nains] ; son enclume, la nuit.',
  planches_doyenne_1: 'chez elle, aux [Planches|li:planches] ; la [Dame des Planches|li:planches_dame], la nuit, et les calèus sur l’eau.',
  planches_doyenne_2: 'chez elle, aux [Planches|li:planches] ; la [Dame des Planches|li:planches_dame], au bout des planches, et les noms sous son pied.',
  planches_passeur_1: 'chez lui, aux [Planches|li:planches] ; le [quai|li:planches_quai].',
  planches_vanniere_1: 'chez elle, aux [Planches|li:planches] ; la [Dame|li:planches_dame] et le gourg, le soir.',
  estive_baile_1: 'à l’[estive|li:estive], la [jasse|li:estive_jasse] et le [pré|li:estive_pre], avec ses bêtes ; la ville, tout en bas.',
  estive_baile_2: 'à l’[estive|li:estive], avec ses bêtes ; ((la [crête|li:estive_crete], et la sonnaille de la Noire)).',
  estive_fromagere_1: 'à sa [cabane à fromages|li:es_fromagerie], à l’estive ; la plaine, tout en bas.',
  estive_patre_1: 'à sa [cabane|li:es_patre], à l’estive ; les lumières de la ville, tout en bas.',
  estive_patre_2: 'avec ses brebis, à l’[estive|li:estive] ; la [crête|li:estive_crete], la nuit.',
  chevalier_guet_1: 'au [corps de garde du pont nord|li:g1_corps_garde] ; la [poterne|li:poterne], à trois heures du matin.',
  chevalier_guet_2: 'au [corps de garde|li:g1_corps_garde] ; l’[église|li:eglise] et le [curé|pnj:cure].',
  garde_champetre_1: 'à la [cabane des gardes|li:g1_cabane_hameau], au hameau ; les [Demoiselles|li:menhirs].',
  garde_champetre_2: 'à la [cabane des gardes|li:g1_cabane_hameau] ; le [marais|li:marais], la nuit ; un dénouement pour chaque réponse.',
  gendarme_1: 'à la [cabane des gardes|li:g1_cabane_hameau], près de son cheval ; la [poste|li:poste] et la [postière|pnj:postiere].',
  gendarme_2: 'sur sa tournée, le soir, avec son cheval, du côté du [hameau|li:hameau] ; puis à la cabane, au matin.',
  // ---- les autres (Q20B)
  q16_diseuse_1: 'sous sa tente, à sa table, à la bougie ; ((le [cimetière|li:cimetiere], au soir, et la carte)).',
  q16_diseuse_2: 'sous sa tente ; la [hutte|li:hutte_ermite], avec la [guérisseuse|pnj:guerisseuse], devant le feu.',
  q16_violoneux_1: 'là où il joue, en ville ; la [chapelle abandonnée|li:chapelle], la nuit.',
  q16_crieur_1: 'sur la place, avec son tambour ; la cabane du [garde champêtre|pnj:garde_champetre], au hameau, le soir.',
  q16_voiturier_1: 'au bord de la route, le matin, près de sa charrette et de sa jument.',
  q16_marchand_joie_1: 'au bord d’un chemin, le soir ; l’[église|li:eglise] et le [curé|pnj:cure].',
  q16_bete_chat_1: 'sur son tonneau, devant l’[auberge|li:auberge], le soir ; le [cimetière|li:cimetiere], la nuit.',
  q16_bete_hulotte_1: 'sur son chicot, au [chêne millénaire|li:chene], à la nuit tombée.',
  q16_bete_corbeau_1: 'sur la [Table des Géants|li:dolmen] ; ((les [Demoiselles|li:menhirs], et le dé)) ; un dénouement pour chaque réponse.',
  q16_roi_sucre_1: 'dans sa salle du trône, au [pays des bonbons|monde:bonbons].',
  q16_aieule_1: 'sur son siège, au grand tas de la Gobelinière, sous la vallée.',
  q16_aieule_2: 'à la Gobelinière ; l’[église|li:eglise] et le [curé|pnj:cure], dans la vallée.',
  q16_thibaud_1: 'au treuil du châtelet de [Hautguet|sys:hautguet], dans la Zone.',
  q16_dame_1: 'devant la porte de sa tour, à [Hautguet|sys:hautguet], la nuit.',
  q16_veilleuse_1: 'au Seuil, dans la [cité des Maisons-d’Étoile|monde:vaisseau] ; les Berceaux.',
  q16_sout_un_1: 'au [Hameau d’En-Bas|li:sout_hameau], et la cabane vide.',
  q16_sout_un_2: 'au [Hameau d’En-Bas|li:sout_hameau] ; ((la [cave des Murés|li:sout_cave], sous la vallée, et les traits à la paroi)).',
  q16_sout_deu_1: 'au [Hameau d’En-Bas|li:sout_hameau], près de sa marmite.',
  q16_sout_tre_1: 'au milieu du [Hameau d’En-Bas|li:sout_hameau].',
  q16_sout_katr_1: 'au bord de l’eau, au [Hameau d’En-Bas|li:sout_hameau], sa ligne à la main.',
  q16_sout_sin_1: 'à sa cabane, au [Hameau d’En-Bas|li:sout_hameau], près de Neu.',
  q16_sout_si_1: 'au [Hameau d’En-Bas|li:sout_hameau] ; la cabane d’[Ui, la fileuse|sout:g:ui].',
  q16_sout_se_1: 'au [Hameau d’En-Bas|li:sout_hameau] ; le [vieux puits|li:vieux_puits], dans la vallée, la nuit.',
  q16_sout_ui_1: 'au [Hameau d’En-Bas|li:sout_hameau], assise à filer.',
  q16_sout_neu_1: 'au [Hameau d’En-Bas|li:sout_hameau], le nez levé vers la voûte.',
  q16_sout_di_1: 'au [Hameau d’En-Bas|li:sout_hameau] ; ((la [Chambre des Gouttes|li:sout_dormeurs], au bout de la longue galerie)).',
  q16_v5_greffier_1: 'au registre, à [Basse-Fosse|sys:basse-fosse].',
  q16_v5_greffier_2: 'au registre ; la Sonneuse, au pied du clocher.',
  q16_v5_sonneuse_1: 'au pied du clocher, à [Basse-Fosse|sys:basse-fosse].',
  q16_v5_marchande_1: 'à son étal, à [Basse-Fosse|sys:basse-fosse].',
  q16_v5_veilleuse_1: 'au feu le plus proche de la Nef, à [Basse-Fosse|sys:basse-fosse].',
  q16_v5_ordonnateur_1: 'au mur des os, à [Basse-Fosse|sys:basse-fosse].',
};
// les gens de Basse-Fosse sans nom : une scène par modèle de quête, jouée par celui ou celle qui l'a tiré
const OU_ANONYMES = 'chaque quête possible a ses scènes, jouées par celui ou celle qui l’a tirée : devant sa maison, à sa table près de sa chandelle, à la porte de la ville pour les gardiens, au puits pour les enfants.';

// les quêtes qui ont une fiche à elles (et pas de bloc dans celle d'un habitant) : [fiche, ids des scènes, ligne]
const FICHES = [
  ['act:tournee', ['q20c_tournee'], 'la [postière|pnj:postiere] à son comptoir, à la [poste|li:poste], le matin ; le dernier colis remis, le soir.'],
  ['act:travaux', ['q20c_pli', 'q20c_banc', 'q20c_parvis', 'q20c_depot'], 'le tableau contre la [mairie|li:mairie], et le [maire|pnj:maire] ; puis l’ouvrage fait : le pli remis, le banc de la [place|li:place], le parvis de l’[église|li:eglise] (avec le [curé|pnj:cure]), ce que la commune demande.'],
  ['sys:bibliotheque', ['q20c_emprunt', 'q20c_cle_porte'], 'un emprunt : le [bibliothécaire|pnj:libraire] à son registre, puis un dénouement selon qu’on rend le livre à l’heure ou en retard. La clé de la Grande Porte : au comptoir ; la [Grande Porte|li:grande_porte], la nuit ; un dénouement selon la façon dont on l’a eue.'],
  ['ev:lavandiere', ['q20c_lavandiere'], 'quelqu’un vous dit qui elle est ; le [lavoir|li:lavoir], la nuit ; le [cimetière|li:cimetiere] et le lavoir, à l’aube.'],
  ['sys:gobelins', ['q20c_petits'], 'les Petits : leur marque (trois griffes et un rond), sur la [place|li:place] ; ((la [vieille souche|li:gob_souche], la nuit)) ; à l’aube, un dénouement pour chacune des deux issues.'],
  ['sys:c18_baron', ['q20c_baron'], 'le carnet du baron, au [Grand Cercle|li:casino], la nuit ; la lettre jamais envoyée. Sa fin, après minuit, a sa scène à elle.'],
  ['sys:l18_concierge', ['q20c_loge'], 'M. Brissac, le matin, à la loge du [Grand Hôtel des Cimes|li:l18_hotel] ; les gages, le soir (ou la moitié, si l’on part avant l’heure).'],
  ['sys:crimes', ['q20c_avis'], 'un avis de recherche : le [garde des ponts|pnj:garde] cloue l’affiche sur la [place|li:place] ; un dénouement pour chaque façon dont l’affaire finit.'],
  ['ent:tueur', ['q20c_masque'], 'l’homme au masque : le [garde des ponts|pnj:garde], au matin, devant une porte forcée ; ce qu’on trouve ; un dénouement pour chaque issue.'],
  ['sys:maledictions', ['q20c_malediction'], 'ce qui pèse sur vous : la nuit, à la [ferme|li:ferme] ; le [curé|pnj:cure] ou la [guérisseuse|pnj:guerisseuse] ; le jour qui se lève, ensuite.'],
  ['sys:commandes', ['q20c_commande'], 'le carnet de commandes : le bon du roulage Bardin, à la [ferme|li:ferme] ; le voiturier, au matin, au point de livraison.'],
  ['it:carte_tresor', ['q20c_tresor'], 'la croix sur la carte (la première carte au trésor) : la carte, à la [ferme|li:ferme] ; le coin qu’elle montre, au soir ; ce qu’on y déterre.'],
  ['sys:runes', ['q20c_caveau'], 'le caveau du bois : le petit caveau, au fond du bois, et sa dalle gravée ; ce qu’il y avait dedans.'],
  ['qp:qt-t1', ['t1'], 'chez l’[aubergiste|pnj:aubergiste], derrière son comptoir, et la chambre sept, la nuit ; un dénouement pour chaque fin, à l’[auberge|li:auberge].'],
  ['qp:qt-t2', ['t2'], 'la lettre de Marie Lemarié, à la [ferme|li:ferme], et le [phare|li:phare] au soir ; un dénouement pour chaque fin, la nuit, puis au matin avec elle.'],
  ['qp:qt-t3', ['t3'], 'l’avis, au panneau de la [place|li:place], et la [mairie|li:mairie] ; un dénouement pour chaque fin, avec le [maire|pnj:maire] ou à l’[église|li:eglise].'],
  ['qp:qt-t4', ['t4'], 'la crécelle, devant le [relais de chasse|li:relais_chasse], le soir ; un dénouement pour chaque fin, avec le [chasseur|pnj:chasseur].'],
  ['qp:qt-t5', ['t5'], 'chez le [docteur des Sources|pnj:naturiste_b], et la caisse sous son lit ; un dénouement pour chaque fin.'],
];
// (les reliques des Anciens n'ont pas de fiche à elles : leur ligne est dans la fiche d'ensemble)
const SANS_FICHE = ['q20c_reliques'];

// ce qui se cache : ce qu'on aperçoit dans les scènes, ce que montrent les fins (sous « révéler les secrets »)
const CACHE = [
  'Dans le rêve de la boulangère (« L’alliance d’Émile »), aux ruines, un homme se tient près de la pierre, sa lanterne à la main : Émile, tel qu’il est sorti ce soir-là.',
  'Au marais (« La clé du treuil »), au loin, un grand homme maigre, tout noir, immobile. « Il n’y a pas de grand homme maigre, ici. »',
  'Au clocher sous l’eau, quelqu’un se tient au sommet du clocher et fait signe : Jules.',
  'Au hameau abandonné (« Ce que regardent les bêtes »), une fenêtre éclairée, et derrière, une femme pâle qui fait signe.',
  'Le soir du dénouement d’« Une couronne pour Lise », une petite fille pâle se tient près du puits de la place, à côté de la couronne.',
  'Au dénouement du « Fer du père », le fer est cloué au-dessus de la porte de la forge, avec des clous neufs.',
  'La borne qui marche est couverte de mousse « comme si elle était là depuis toujours » ; elle a été posée l’an dernier.',
  'Au refuge du col, le feu est froid, et quatre bols attendent des invités qui ne sont pas venus.',
  'Sous le pied de la Dame des Planches, le dernier des quarante-deux noms a les bords encore blancs.',
  'Sur la crête de l’estive, la bête de trop n’a pas d’ombre, et elle est un peu plus pâle que les autres.',
  'Quand le garde champêtre bat l’avis de l’enfant perdu, une petite silhouette se tient au bord du champ.',
  'Au cimetière (« Le conseil des chats »), douze paires d’yeux, et une place vide au milieu.',
  'Le roi Sucre pleure du sirop sur une pomme qui ne pourrit pas.',
  'La vieille des gobelins parle avec les voix qu’elle a prises : celle d’une vieille, d’un enfant, d’une femme… et celle du curé quand il était petit.',
  'Quand on lit le cahier d’Iorin à la veilleuse, sa lumière baisse, puis remonte.',
  'Dans la cabane vide du onzième, au Dessous, une lueur verte s’allume pour la première fois.',
  'L’homme au masque n’est jamais montré à visage découvert avant d’être pris.',
];
// les fins à choix : ce que chacune montre
const FINS = [
  '« Le procès-verbal de la mare » : « Il marchait sur l’eau » (le dossier rouvert) ou « Je n’ai rien vu » (laissé classé).',
  '« La source qui respire » : la géologie, ou quelque chose qui respire.',
  '« Ce qui brille chez les Demoiselles » : le dé rendu au corbeau, ou gardé.',
  'Un emprunt à la grande bibliothèque : rendu à l’heure, ou en retard ; la clé de la Grande Porte : prêtée contre caution, ou prise dans son livre creux.',
  'Les Petits : le marché de la vieille (un présent sur le seuil), ou leur départ (une file de petites ombres vers les monts).',
  'Le service à la loge : les gages entiers, ou la moitié si l’on part avant l’heure.',
  'L’avis de recherche : payé, purgé au cachot, ou oublié avec le temps.',
  'L’homme au masque : la préfecture, ou une tombe sans croix.',
  'Les quêtes principales : chaque fin a sa réaction (l’aubergiste au pied de l’escalier, le maire et sa caisse pour Lyon, le curé, le chasseur et la crécelle de son père, le docteur et son registre…).',
];

// l'heure d'un moment, en mots
const HEURE = (h) => {
  h = ((h % 24) + 24) % 24;
  if (h >= 4.5 && h < 7.5) return 'à l’aube';
  if (h >= 7.5 && h < 12) return 'le matin';
  if (h >= 12 && h < 17) return 'l’après-midi';
  if (h >= 17 && h < 19.5) return 'au crépuscule';
  if (h >= 19.5 && h < 22.5) return 'le soir';
  if (h >= 22.5 || h < 1.5) return 'vers minuit';
  return 'la nuit';
};

function build(X) {
  const { DB, T, SP, SEC, esc, lk, pages, used, MF } = X;
  const log = (m) => (DB.log || (DB.log = [])).push('wiki-v20.js : ' + m);
  const files = Object.keys(MF || {}).filter((f) => /Q20-/.test(f));
  // les tables de la vague : lues ici (pas de « données du module » en bas des fiches)
  for (const [n, t] of Object.entries(DB.tables || {})) if (/Q20-/.test(t.file || '')) used.add(n);
  const h3 = (t) => `<h3>${esc(t)}</h3>`;
  const ul = (a) => `<ul>${a.filter(Boolean).map((x) => `<li>${x}</li>`).join('')}</ul>`;
  const pg = (id, t) => lk(id, t);
  const secS = (html) => `<span class="sec">${html}</span><span class="sec-note">masqué</span>`;
  // une ligne : les liens (mis de côté le temps d'échapper le texte), puis ce qui est masqué
  const rendre = (s) => {
    const L = [];
    const t = esc(String(s).replace(/\[([^\]|]+)\|([^\]]+)\]/g, (m, x, id) => { L.push(lk(id, x)); return '\u0005' + (L.length - 1) + '\u0006'; }));
    return t.replace(/\u0005(\d+)\u0006/g, (m, k) => L[+k]).replace(/\(\(([\s\S]*?)\)\)/g, (m, x) => secS(x));
  };
  // (les sections : leur page, ou leur liste)
  const cat = (id, t, page) => (page ? `<a href="#/p/${encodeURIComponent('cat:' + id)}">${esc(t)}</a>` : `<a href="#/cat/${esc(id)}">${esc(t)}</a>`);
  // (une ligne dans la fiche même qu'elle nomme : le nom, sans le lien)
  const ligne = (s, cls, ici) => {
    let html = `<p class="small q20-l${cls ? ' ' + cls : ''}"><b>Scènes :</b> ${rendre(s)}</p>`;
    if (ici) html = html.split('\u0002' + ici + '\u0003').map((x, k) => (k ? x.replace(/^([^\u0004]*)\u0004/, (m, t) => esc(decodeURIComponent(t))) : x)).join('');
    return html;
  };

  // ---------------------------------------------------------------- ce que les fichiers inscrivent (pour les compter, et voir ce qui manque)
  const ids = new Set(), dyn = { leg: 0, ano: 0 };
  for (const f of fs.readdirSync(SRC).filter((x) => /Q20-/.test(x))) {
    let t = '';
    try { t = fs.readFileSync(path.join(SRC, f), 'utf8'); } catch (e) { continue; }
    for (const m of t.matchAll(/q20(?:\.scenes|Sout)\(\s*'([^']+)'\s*,/g)) ids.add(m[1]);
  }
  const LEG = T('Q20C_LEGENDES', {}) || {}, ANO = T('Q16_V5_ANONYMES', []) || [];
  dyn.leg = Object.keys(LEG).length; dyn.ano = Array.isArray(ANO) ? ANO.length : 0;
  const dansFiches = new Set(FICHES.flatMap((F) => F[1]).concat(SANS_FICHE));
  for (const id of ids) if (!OU[id] && !dansFiches.has(id)) log('des scènes sans ligne dans le wiki : ' + id);
  for (const id of Object.keys(OU)) if (!ids.has(id)) log('une ligne pour une quête sans scènes : ' + id);

  // ---------------------------------------------------------------- une ligne sous le bloc de chaque quête (habitants, quêtes pour tout le monde)
  {
    const TITRE = {};
    for (const d of T('NPC_DATA', []) || []) for (const q of d.quests || []) if (q && q.id && q.title) TITRE[q.title] = q.id;
    for (const P of Object.values(T('Q16_PNJ', {}) || {})) for (const q of (P && P.quetes) || []) if (q && q.id && q.title) TITRE[q.title] = q.id;
    for (const L of Object.values(T('Q16_HABITANTS', {}) || {})) for (const q of L || []) if (q && q.id && q.title) TITRE[q.title] = q.id;
    const vus = new Set();
    const A = '<div class="quest"><h4>« ';
    for (const p of pages.values()) {
      const h = p.h || '';
      if (!h.includes(A)) continue;
      let out = '', i = 0;
      for (;;) {
        const a = h.indexOf(A, i);
        if (a < 0) { out += h.slice(i); break; }
        const b = h.indexOf(' »', a + A.length), titre = b > 0 ? h.slice(a + A.length, b) : '';
        const id = TITRE[titre.replace(/&amp;/g, '&')] || TITRE[titre];
        const d = h.indexOf('</dl>', a);
        const fin = h.indexOf(A, a + A.length);
        if (!id || !OU[id] || d < 0 || (fin >= 0 && d > fin) || h.slice(d, d + 40).includes('q20-l')) { out += h.slice(i, a + A.length); i = a + A.length; continue; }
        out += h.slice(i, d + 5) + ligne(OU[id], '', p.id);
        i = d + 5;
        vus.add(id);
      }
      p.h = out;
    }
    for (const id of Object.keys(OU)) if (!vus.has(id) && ids.has(id)) log('pas de bloc de quête pour ' + id);
  }

  // ---------------------------------------------------------------- une ligne en tête des fiches des autres quêtes
  // (après le premier paragraphe de la fiche)
  const enTete = (id, html) => {
    const p = pages.get(id);
    if (!p || /q20-f/.test(p.h || '')) return false;
    const h = p.h || '', i = h.indexOf('</p>');
    p.h = i >= 0 ? h.slice(0, i + 4) + html + h.slice(i + 4) : html + h;
    return true;
  };
  for (const [id, , s] of FICHES) if (!enTete(id, ligne(s, 'note q20-f', id))) log('pas de fiche ' + id);
  // les légendes : quand on l'entend, et quand on voit son secret (l'endroit et l'heure, masqués)
  for (const [k, L] of Object.entries(LEG)) {
    const lieu = (L.lieu || []).map((x) => pages.get('li:' + x)).find(Boolean);
    const nom = lieu ? lieu.t.charAt(0).toLowerCase() + lieu.t.slice(1) : '';
    const s = 'quand on l’entend : son conteur, à sa porte, puis le lieu qu’elle dit, à son heure (lue dans un livre, le lieu seul) ; et quand on voit son secret de ses yeux' + (nom ? ` ((: ${nom}, ${HEURE(L.hF)}))` : '') + '.';
    const p = pages.get('my:' + k);
    if (!p || /q20-f/.test(p.h || '')) { if (!p) log('pas de fiche my:' + k); continue; }
    const i = (p.h || '').indexOf('<div class="sec">');
    const html = ligne(s, 'note q20-f');
    p.h = i >= 0 ? p.h.slice(0, i) + html + p.h.slice(i) : (p.h || '') + html;
  }
  // Basse-Fosse : les gens sans nom
  for (const id of ['sys:basse-fosse', 'sys:quetes-tous']) {
    const p = pages.get(id);
    if (!p || /q20-ano/.test(p.h || '')) continue;
    const html = ligne(OU_ANONYMES, 'q20-ano', id);
    const a = (p.h || '').indexOf('<h3>Basse-Fosse : les autres</h3>');
    const b = a >= 0 ? p.h.indexOf('</p>', a) : -1;
    if (b >= 0) p.h = p.h.slice(0, b + 4) + html + p.h.slice(b + 4);
    else {
      const c = (p.h || '').indexOf('<h3 class="q16-fiche">');
      p.h = c >= 0 ? p.h.slice(0, c) + p.h.slice(c).replace(/(<h3 class="q16-fiche">[^<]*<\/h3>)/, '$1' + html) : (p.h || '') + html;
    }
  }

  // ---------------------------------------------------------------- la fiche
  {
    const R = T('Q20_REGL', {}) || {}, TX = T('Q20_TEXTES', {}) || {}, M = TX.modes || {}, MO = TX.moments || {};
    const court = Array.isArray(R.court) ? R.court : [5, 8];
    const vieux = R.vieux || { demande: 1, tournant: 1, fin: 2 };
    const n = ids.size + dyn.leg + dyn.ano;
    const mom = (k, d) => `<b>${esc(MO[k] || d)}</b>`;
    let h = `<p class="lead">Chaque quête a maintenant ses scènes${n > 100 ? ` (${n} quêtes en tout)` : ''} : deux ou trois moments courts, d’une douzaine de secondes, filmés là où ils se passent, avec ceux qu’ils concernent, quelques répliques en sous-titres et la lumière de l’heure. Rien ne change aux quêtes elles-mêmes, ni à leurs récompenses.</p>`;
    h += h3('Quand elles se jouent') + ul([
      `${mom('demande', 'La demande')}, quand on accepte (« D’accord, je m’en charge ») : celui qui la donne, chez lui ou à son poste, à sa façon ; puis ce dont il parle, vu de loin.`,
      `${mom('tournant', 'Le tournant')}, quand la quête devient bonne à rendre : l’objet trouvé, le message porté, la nuit veillée. Les quêtes où l’on apporte des choses n’en ont pas.`,
      `${mom('fin', 'Le dénouement')}, quand on la rend : sa réaction, et ce qu’il donne. Une quête à plusieurs fins (une réponse à choisir, deux issues possibles) a un dénouement pour chacune.`,
      `Une scène attend le premier moment calme : jamais pendant un dialogue ou un panneau ouvert (elle vient quand on le ferme), ni en combat, ni juste après un coup reçu, ni quand une bête charge ou que des loups rôdent, ni sous l’eau, ni en tombant. L’histoire et les récits des proches passent d’abord.`,
      `Elle ne se joue pas si elle n’a plus de sens (la quête a avancé, celui qui l’a donnée est mort, elle attend depuis plus ${vieux.fin > 1 ? `d’un jour, ${vieux.fin === 2 ? 'deux' : vieux.fin} pour un dénouement` : 'd’un jour'}) : elle rejoint les Souvenirs. Une scène déjà vue ne revient pas.`,
    ]);
    h += h3('Le réglage, et passer une scène') + ul([
      `Options › section <b>Jeu</b> › <b>« ${esc(TX.option || 'Scènes des quêtes')} »</b> : <b>${esc(M.toutes || 'Toutes')}</b> (par défaut) ; <b>${esc(M.courtes || 'Courtes')}</b> (la demande et le dénouement seulement, de ${court[0]} à ${court[1]} secondes chacun) ; <b>${esc(M.aucune || 'Aucune')}</b> (rien ne se joue ; les scènes rejoignent quand même les Souvenirs, on peut les voir plus tard).`,
      'On passe une scène en <b>maintenant</b> <kbd>Espace</kbd> ou <kbd>Échap</kbd> (une petite jauge). Pendant une scène, la partie est tenue : le temps ne passe pas, rien ne peut arriver au personnage, qui se retrouve ensuite là où il était.',
    ]);
    h += h3('Les Souvenirs') + ul([
      `Sacoche (<kbd>Tab</kbd>), onglet <b>Carnet</b>, page <b>Souvenirs</b> (ou Options › Jeu › « Revoir les cinématiques ») : après les scènes de ${pg('sys:histoire', 'l’histoire')}, une partie <b>« ${esc(TX.section || 'Les quêtes')} »</b>, rangée sous celui qui a donné chaque quête (son nom, son métier), puis chaque quête et ses moments, vus ou passés : un clic les rejoue.`,
      'Les quêtes qui n’ont pas de donneur sont rangées à part : la vallée, les Petits, le Grand Cercle, le Grand Hôtel des Cimes, la commune (le tableau des petits travaux), une carte au trésor, une lettre, un avis, une chose trouvée, les légendes de la vallée.',
    ]);
    h += h3('Ailleurs que dans la vallée') + `<p>Une scène se joue là où se passe ce qu’elle montre : sous terre, ${pg('sys:dessous', 'au Dessous')} (le Hameau d’En-Bas), dans la Zone (${pg('sys:basse-fosse', 'Basse-Fosse')}, ${pg('sys:hautguet', 'Hautguet')}), ${pg('monde:bonbons', 'au pays des bonbons')}, ${pg('monde:vaisseau', 'dans la cité')}. Elle attend qu’on y soit, et s’y joue à la lumière du lieu (une chandelle, la pierre qui luit, le rose des bonbons, la lueur bleue de la cité) ; celles qu’on peut jouer là où l’on est passent d’abord. Une quête peut changer de monde en chemin : la demande d’en bas, le tournant dans la vallée. Une scène d’ailleurs ne se revoit que là-bas (sinon : « ${esc(String(TX.pasIci || '(Pas d’ici.)').replace(/^\(|\)$/g, ''))} »).</p>`;
    h += h3('Les parties d’avant') + `<p>Une partie commencée avant ces scènes se charge sans rien rejouer : les quêtes déjà faites ont leurs scènes dans les Souvenirs ; une quête en cours ne rejoue pas sa demande (son tournant et son dénouement viendront à leur heure).</p>`;
    h += h3('Où les trouver') + ul([
      `Sous chaque quête, dans la fiche de l’habitant qui la donne (${cat('quetes', 'les quêtes des habitants', true)}) et dans ${pg('sys:quetes-tous', 'Des quêtes pour tout le monde')}, une ligne dit où se jouent ses scènes, et avec qui.`,
      `À ${pg('sys:basse-fosse', 'Basse-Fosse')}, les gens sans nom : ${esc(OU_ANONYMES)}`,
      `${pg('sys:quetes-principales', 'Les quêtes principales')} : la demande, chez celui qui la propose (ou la lettre, l’avis, la chose trouvée), et le dénouement de chacune de leurs fins ; les scènes de leurs étapes ne changent pas.`,
      `Les ${dyn.leg === 14 ? 'quatorze' : dyn.leg || ''} légendes de la vallée (${cat('legendes', 'Légendes et lore')}) : quand on l’entend, et quand on voit son secret de ses yeux.`,
      `Et les quêtes qui ne passent pas par le carnet des habitants : ${pg('act:tournee', 'la tournée de la poste')}, ${pg('act:travaux', 'les petits travaux de la mairie')}, ${pg('sys:bibliotheque', 'un emprunt à la grande bibliothèque et la clé de la Grande Porte')}, ${pg('sys:gobelins', 'les Petits')}, ${pg('sys:c18_baron', 'le baron de Lancry')}, ${pg('sys:l18_concierge', 'le service à la loge')}, ${pg('sys:crimes', 'l’avis de recherche')}, ${pg('sys:maledictions', 'ce qui pèse sur vous')}, ${pg('sys:commandes', 'le carnet de commandes')}, ${pg('it:carte_tresor', 'la croix sur la carte')}, ${pg('sys:runes', 'le caveau du bois')}, et les reliques des Anciens (l’autel du cercle, à minuit).`,
    ]);
    // ce qui se cache
    let s = `<h4>Les lieux qui sont eux-mêmes des secrets</h4><p class="small">Sous terre : ${pg('li:nains', 'les halles d’en bas')} (la forgeronne naine), ${pg('li:sout_cave', 'la cave des Murés')}, ${pg('li:gobeliniere', 'la Gobelinière')} ; au Dessous, ${pg('li:sout_dormeurs', 'la Chambre des Gouttes')}. Et deux quêtes sans donneur : ${pg('ev:lavandiere', 'la lavandière de nuit')} (« Un visage, la nuit »), ${pg('ent:tueur', 'l’homme au masque')}.</p>`;
    s += `<h4>Ce qu’on aperçoit</h4>${ul(CACHE.map(esc))}<h4>Ce que montrent les fins à choix</h4>${ul(FINS.map(esc))}`;
    h += h3('Ce qui se cache') + SEC(s, 'Ce qu’on aperçoit dans les scènes, ce que montrent les fins, les lieux secrets : masqué (secrets).');
    h += `<p>${pg('sys:cinematiques', 'Les cinématiques')} · ${pg('sys:histoire', 'L’histoire')} · ${pg('sys:recits', 'Les récits des proches')} · ${pg('sys:options', 'Les options')} · ${pg('sys:savoir', 'La sacoche et le carnet')}</p>`;
    SP('sys:scenes-quetes', { t: 'Les scènes des quêtes', s: 'Une cinématique pour chaque quête : la demande, le tournant, le dénouement', c: ['scenes-quetes'], i: '🎬', h }, files);
  }

  // ---------------------------------------------------------------- un mot ailleurs
  const ajoute = (id, test, html, debut) => { const p = pages.get(id); if (p && !test.test(p.h || '')) p.h = debut ? html + (p.h || '') : (p.h || '') + html; };
  ajoute('sys:cinematiques', /q20-cine/, `<h3 class="q20-cine">Les quêtes</h3><p>Chaque quête a aussi ses scènes, sur le même moteur : la demande, le tournant, le dénouement. Elles se passent de même (en maintenant <kbd>Espace</kbd> ou <kbd>Échap</kbd>), se règlent dans les Options (Jeu › « Scènes des quêtes ») et se revoient au carnet, page Souvenirs : ${lk('sys:scenes-quetes', 'les scènes des quêtes')}.</p>`);
  ajoute('sys:quetes-tous', /sys%3Ascenes-quetes|sys:scenes-quetes/, `<p class="note">Chaque quête a ses scènes ; sous chacune, où elles se jouent : ${lk('sys:scenes-quetes', 'les scènes des quêtes')}.</p>`, true);
  {
    const p = pages.get('sys:options');
    if (p && p.h && !/o-quetescine|Scènes des quêtes/.test(p.h)) {
      const opt = esc((T('Q20_TEXTES', {}) || {}).option || 'Scènes des quêtes');
      p.h = p.h.replace('<li><b>Quitter</b>', `<li><b>Jeu › ${opt}</b> : Toutes (par défaut), Courtes (la demande et le dénouement seulement), Aucune (voir ${lk('sys:scenes-quetes', 'les scènes des quêtes')}).</li><li><b>Quitter</b>`)
        .replace('<li>Revoir les cinématiques (Souvenirs)</li></ul>', `<li>Revoir les cinématiques (Souvenirs)</li><li>${opt}</li></ul>`);
    }
  }
  {
    const p = pages.get('sys:savoir');
    if (p && p.h && !/scènes des quêtes/.test(p.h)) p.h = p.h.replace('les scènes déjà vues, à revoir (la page n’apparaît qu’après la première)', 'les scènes déjà vues, à revoir : celles de l’histoire, puis celles des quêtes, rangées par donneur (la page n’apparaît qu’après la première)');
  }
}

function sections(cats, X) {
  const { pages, link } = X;
  const at = (id) => cats.findIndex((c) => c.id === id);
  if (pages.has('sys:scenes-quetes') && at('scenes-quetes') < 0) {
    const i = ['quetes16', 'principales', 'histoire', 'quetes'].map(at).find((x) => x >= 0);
    cats.splice(i >= 0 ? i + 1 : cats.length, 0, { id: 'scenes-quetes', t: 'Les scènes des quêtes', d: 'Une cinématique pour chaque quête : la demande, le tournant, le dénouement (un par fin) ; l’option « Scènes des quêtes », passer une scène, les Souvenirs rangés par donneur.', nouveau: true, groups: [{ t: 'Les scènes des quêtes', ids: ['sys:scenes-quetes'] }] });
  }
  const cq = pages.get('cat:quetes');
  if (cq && pages.has('sys:scenes-quetes') && !cq.h.includes('sys%3Ascenes-quetes')) {
    const mot = `<p class="note">Chaque quête a ses scènes (la demande, le tournant, le dénouement) ; sous chaque quête, dans la fiche de l’habitant, où elles se jouent : ${link('sys:scenes-quetes', 'les scènes des quêtes')}.</p>`;
    const i = cq.h.indexOf('<p class="lead">');
    cq.h = i >= 0 ? cq.h.slice(0, i) + mot + cq.h.slice(i) : mot + cq.h;
  }
  const nv = cats[at('nouveautes')];
  if (nv && nv.d && !/scènes des quêtes/.test(nv.d)) nv.d = nv.d.replace(' : ', ' : les scènes des quêtes, ');
}

module.exports = { build, sections, OU, FICHES };
