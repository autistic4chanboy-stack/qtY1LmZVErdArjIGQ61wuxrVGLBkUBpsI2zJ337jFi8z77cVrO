// Le wiki — ON ENTRE PARTOUT (dixième vague) : comment on monte, ce qu'il y a dedans et à l'étage, ce qui s'y cache.
// Rédigé d'après les deux modules (src/11-zzzzB1-ville.js : la ville et les étages ; src/11-zzzzB2-campagne.js : la
// campagne) et les notes de leurs auteurs. tools/wiki-build.js en fait la fiche « On entre partout » et ajoute à la
// fiche de chaque lieu (li:…) ou de chaque sorte de lieu perdu (c2t:…) ce qu'il y a dedans ; « secret » se lit sous
// « révéler les secrets ». Chaque entrée : { pages: [ids de fiches, la première qui existe reçoit le texte], titre,
// texte, secret }.
'use strict';

const REGLES = [
  ['Monter', 'Une échelle de meunier contre un mur, une trappe au battant relevé, dessinée au plafond comme au plancher : E au pied de l’échelle (« Monter à l’étage », « Monter aux combles », « Monter à l’échelle », « Monter au clocher »), on grimpe en voyant passer le plafond et l’on prend pied à un pas du trou ; E au bord du trou (« Redescendre ») pour l’inverse. Avec une jambe cassée, les barreaux échappent une fois sur deux. Au moulin et au phare, la trappe se soulève quand on passe et retombe derrière soi ; fermée, elle se marche comme un plancher, et une échelle ne se propose que depuis son étage.'],
  ['À l’abri, et dans la maison', 'L’étage est sous le toit — la pluie, la neige, le froid, le gel : on y est à l’abri — et dans la maison : ce qui demande où l’on est (la location, le crochetage, le vol, les témoins) vaut là-haut. Les lampes de l’étage ne s’allument que la nuit ; le jour, une lueur douce entre par les fenêtres, les meurtrières et les baies de la pièce où l’on est.'],
  ['Fouiller', 'Chez quelqu’un, fouiller reste un vol : les fouilles portent le nom de l’habitant. Ceux d’en bas ne voient pas l’étage ; à moins de neuf mètres, dans la maison, ils entendent parfois (une fois sur cinq ; plus d’une fois sur trois pour ce qui tinte — métal, monnaie, verre, vaisselle — ; moins quand on fouille accroupi), et un dormeur se réveille rarement. Chez les disparus et dans les lieux abandonnés (le moulin, le phare, les ruines), personne ne réclame rien : ce n’est pas voler ; ce qu’on y vide se regarnit lentement (douze jours au moins, à la campagne).'],
  ['Dormir', 'Les lits de là-haut se comportent comme ceux d’en bas : chez quelqu’un, c’est s’inviter ; chez les morts, on dort mal. À l’auberge, les cinq lits des chambres d’hôtes sont ceux qu’on loue à l’aubergiste. Dans les lieux abandonnés, lits et paillasses se prennent à toute heure (de jour, le jeu demande si l’on veut vraiment dormir jusqu’au lendemain matin).'],
  ['Meubler', 'L’étage d’une maison louée ou achetée (Vernet, Delorme, du Rempart) est au locataire : on y pose ses meubles comme en bas (sauf au bord de la trappe : il faut le passage) ; ils comptent parmi ceux de la maison et reviennent dans la sacoche quand on rend les clés.'],
];

const TOURS = {
  texte: 'Les huit tours des remparts de Valbrume sont creuses. Une porte au pied, côté ville (jamais côté douves), fermée la nuit comme les autres portes sans habitant ; de l’intérieur, à n’importe quel niveau, on tire le verrou. Les tours sont au garde : ce qu’on y fouille est à lui.\n\nLes tours d’angle — la tour des Douves (sud-est), du Guet (nord-est), aux Corneilles (nord-ouest), de la Poudre (sud-ouest). Au pied, le magasin : tonneaux, caisses, sacs, bois. À 3,1 m, le corps de garde : paillasses, râtelier d’armes, une table et sa lampe, le coffre des gardes (fermé à clé), des meurtrières. À 6,25 m, le haut : un banc, un seau, des meurtrières, et deux passages sur le chemin de ronde.\n\nLes tours des portes, de part et d’autre des portes nord et sud : au pied, le treuil du pont-levis et ses chaînes, une caisse ; une échelle jusqu’au haut (un garde-corps au bord du trou : six mètres de chute), une meurtrière, et les passages vers le rempart et par-dessus la porte.\n\nLe chemin de ronde : le dessus des murs, 1,2 m de large, les merlons côté douves, une main courante de bois côté ville. On fait le tour de la ville d’une tour à l’autre, par-dessus les portes. Sur le rempart, on est dehors ; dans une tour, dedans.',
  secret: 'À la tour de la Poudre, un tonneau marqué d’une croix sent encore la poudre ; aux Douves, un filet et une nasse. Au Guet, la consigne des tours (« Lire »). Aux Corneilles, un nid et des plumes noires partout — et pas un oiseau. Dans le coffre des gardes : un billet du garde.',
};

const TENTE = {
  texte: 'La tente de la diseuse, au marché (Mère Ysaure y est le Marchedi, le Veilledi et le Vorndi, de 9 h à 19 h) : quand elle est là, on entre jusqu’à sa table, à pied ou par « Entrer sous la tente » (deux pas, puis elle parle) ; dedans, « Se faire tirer les cartes ». Les autres jours, un rideau tiré et son écriteau ; le soir, elle s’en va, mais la tente ne se ferme pas tant qu’on est dedans.',
};

const DEDANS = [
  // ---------------------------------------------------------------- la ville : les étages
  { pages: ['li:mairie'], titre: 'À l’étage : les archives et le garde-meuble',
    texte: 'Une cloison, une porte au milieu. Au fond, les archives : deux rayonnages de registres, l’armoire des registres (fermée à clé : la petite clé de laiton du bureau l’ouvre, ou des crochets), une table et sa lampe, un lutrin et le registre de l’état civil (« Lire »). Devant, le garde-meuble de la commune : les meubles des successions sous leurs draps (armoire, horloge, commodes, tableau, lit, fauteuils, chaises empilées) et une malle de succession. « Les meubles des successions » : si le maire est en bas, éveillé et pas fâché, il les vend d’en bas ; sinon, on lit les étiquettes (« Succession Varenne », « Succession Lefèvre », « Succession — »). Papiers : Inventaire après décès, Rapport sur les remparts.',
    secret: 'Dans le registre de l’état civil, une troisième colonne, tracée à la règle, sans en-tête, et pleine.' },
  { pages: ['li:auberge'], titre: 'À l’étage : les chambres d’hôtes',
    texte: 'Un couloir, cinq chambres numérotées (une plaque peinte sur chaque porte, de 1 à 5), chacune son lit à louer et sa table de toilette ; l’armoire à linge au bout du couloir (à l’aubergiste), une lampe ; une malle oubliée par un voyageur (Lettre d’un voyageur, jamais postée).',
    secret: 'La sept — il n’y a pas de six : un lit défait, des draps tièdes (« Le lit »), une chandelle qui brûle, un bol vide, des souliers crottés. On n’y dort pas.' },
  { pages: ['li:boulangerie'], titre: 'À l’étage : la réserve, et le coin d’Émile',
    texte: 'La réserve : les sacs de farine, la huche. Le coin d’Émile, le mari disparu : son manteau et son chapeau à la patère, ses souliers ; au mur, à hauteur d’enfant, des dessins de la petite (« Lire »).',
    secret: 'Sur la table, une miche ronde sous un torchon propre, encore tendre (« La miche »). Le troisième dessin a été arraché ; il en reste un coin, un plancher, et une oreille collée contre.' },
  { pages: ['li:poste'], titre: 'À l’étage : les lettres en souffrance',
    texte: 'Le casier des lettres en souffrance (fermé, une serrure simple), des sacs de courrier, une caisse de colis, un bureau et sa lampe ; près du petit poêle, la bouilloire.',
    secret: 'Les lettres en souffrance : pour Anselme, pour les enfants Lefèvre, et « À celui qui dort dans la sept ». Près de la bouilloire, une enveloppe décollée à la vapeur (« Lire »).' },
  { pages: ['li:maison_a'], titre: 'À l’étage : la chambre des enfants',
    texte: 'Les Lefèvre sont partis. Un petit lit, une poupée, un berceau, des jouets ; la commode et la malle (Un cahier de dessins).',
    secret: 'Au mur, un dessin (« Lire ») : un monsieur bleu, très long, derrière la vitre.' },
  { pages: ['li:maison_b'], titre: 'À l’étage : l’atelier',
    texte: 'Le tisserand est parti. Le métier et sa pièce presque finie (« Lire »), le rouet, les rouleaux de drap (Livre des commandes), un sac de laine, une étagère.',
    secret: 'Sur le métier, trois rangs d’une laine presque noire, d’un rouge qui ne se voit qu’en biais. Au livre : douze aunes de drap couleur de nuit, livrées à la maison aux lilas — qui n’en avait pas commandé.' },
  { pages: ['li:maison_c'], titre: 'À l’étage : la chambre de la famille',
    texte: 'Les Rivière sont partis. Trois lits ; la fenêtre clouée de planches, un seau. La commode (Billet coincé sous la plinthe).',
    secret: 'Des traces de pieds terreux sur le plancher. Le billet parle des croix à la craie, au pied des lits.' },
  { pages: ['li:maison_d'], titre: 'À l’étage : la chambre de la veuve',
    texte: 'Des lilas secs sur la table et par terre, un tableau, un fauteuil ; la commode (Lettre du régiment).',
    secret: 'Au pied du lit, des souliers d’homme. La lettre : « ses bottes étaient crottées de frais ».' },
  { pages: ['li:vide4'], titre: 'À l’étage',
    texte: 'Presque vide : une malle (Lettre de la veuve Vernet), une petite table, une chaise, un cahier d’écolier (« Lire »). L’étage est au locataire : on peut le meubler.',
    secret: 'Dans le cahier : « La semaine a douze jours », et la dernière ligne raturée à trouer le papier.' },
  { pages: ['li:vide5'], titre: 'À l’étage : la chambre du haut',
    texte: 'Un lit, une chaise, une malle (Mot plié sous le lit), et sur la table une chandelle. L’étage est au locataire : on peut le meubler.',
    secret: 'Le Vorndi, la chandelle est allumée (et elle éclaire) ; le lendemain, éteinte. Personne ne dit qui l’allume.' },
  { pages: ['li:maison_rempart'], titre: 'À l’étage',
    texte: 'Une paillasse, et la malle du sergent Ferrand, qui n’est jamais arrivé (Ordre d’affectation, et ses deux télégrammes). L’étage est au locataire, ou au propriétaire : on peut le meubler.' },
  { pages: ['li:echoppe', 'li:vide6'], titre: 'À l’étage : le laboratoire',
    texte: 'Le laboratoire de Fauvel : une table, une lampe, un alambic, des jarres, une étagère de bocaux, une paillasse ; le bocal scellé de cire rouge (« Lire ») ; sa malle (Note de Fauvel).',
    secret: 'Sur le bocal : « Laboratoire du deuxième étage — ne pas déplacer » ; dessous, de sa main : « Déplacé. » La note parle de lune rouge.' },
  { pages: ['li:ranch'], titre: 'À l’étage : le fenil',
    texte: 'Les bottes de foin, les sacs d’avoine ; le manteau et les souliers d’Augustin, son lit, sa malle (Carnet d’Augustin).',
    secret: 'Au carnet : « Je rentre pour la traite. » Sur le rebord de la fenêtre, un bol de lait, frais.' },
  { pages: ['li:bibliotheque'], titre: 'Les étages : la galerie des cartes et les combles',
    texte: 'La bibliothèque a trois niveaux de haut. La galerie des cartes (par l’échelle contre le mur de droite) : neuf rayonnages au fond (« Parcourir les rayonnages »), des tables de lecture et leurs quinquets (allumés jour et nuit), deux globes, des cartes au mur, des commodes, un lutrin et le registre des prêts (« Lire »). Les combles (par une autre échelle, contre le mur de gauche) : des caisses d’archives ficelées, des piles de livres, des meubles sous des draps.',
    secret: 'Au registre des prêts, de petites croix rouges, la même main depuis cent ans. Dans les combles, un billet sous une ficelle : « Ne pas ouvrir avant le retour du lecteur ».' },
  { pages: ['li:eglise'], titre: 'Le clocher et son beffroi',
    texte: 'Au porche, la corde de la cloche (sa poignée de laine aux trois couleurs) et « Monter au clocher », au pied de l’échelle — fermé la nuit, de 20 h à 7 h (une chaîne cadenassée), et pendant la messe. À 11 m, le beffroi : un plancher, un garde-corps autour du trou, une baie et ses abat-sons sur chaque face (on voit la ville entre les lames ; on ne peut pas passer), la cloche à sa poutre, sa roue. « Regarder la vallée » se fait là-haut (une fois par jour, le jour : les lieux les plus proches se font connaître). « Lire l’inscription de la cloche » : « J’appelle les vivants, je pleure les morts, je brise la foudre », refondue en 1824, Marie-Jeanne. Le beffroi ne compte pas pour la messe.',
    secret: 'Sous la dernière ligne de l’inscription, treize petits traits gravés au couteau. Dans un coin, un nid, des plumes de pigeon, et une plume blanche, longue comme la main, qui n’est pas d’un pigeon.' },
  // ---------------------------------------------------------------- la campagne
  { pages: ['li:moulin'], titre: 'Dedans : du coin du meunier au chapeau',
    texte: 'La porte est là où les planches étaient peintes, jamais fermée à clé ; la tour garde sa silhouette, ce sont ses quatre étages qui ont été creusés. La salle basse, le coin du meunier : son lit (on y dort), une table, une chaise, une lanterne, des sacs, un vieux tonneau, ses habits pendus, la malle du meunier. L’étage des farines (première échelle) : la bluterie, la goulotte, des sacs, la huche à farine ; de la farine partout. L’étage des meules (deuxième échelle) : les meules dans leur archure sous la trémie, les marteaux à rhabiller ; « Passer la main sous l’archure » (de la farine, parfois une vieille pièce, très rarement un bijou). Sous le chapeau (troisième échelle) : le rouet sur l’arbre des ailes, qui tourne quand elles tournent, le frein, le treuil ; quand les ailes tournent, le bois grince, on l’entend d’en bas.',
    secret: 'Les papiers de la malle (« Une page du livre du moulin », « Lettre pliée en quatre ») parlent de ce qu’on entend là-haut, la nuit. Sous le chapeau, dans la farine, il y a des pas. Ils montent de la trappe.' },
  { pages: ['li:phare'], titre: 'Dedans : du pied à la lanterne',
    texte: 'La porte est au pied, du côté de la terre ferme ; six niveaux, par cinq échelles. En bas : de vieux tonneaux, les bidons et la caisse (huile à lampe, bougies, corde, toile, clous), le ciré du gardien. La chambre du gardien : son lit (on y dort), le poêle, une chaise, une lanterne, sa commode. La réserve : les tonneaux d’huile, une caisse, un sac. Le bureau : le registre du feu (« Lire le registre du feu »), le baromètre, le bureau du gardien. La chambre de veille : une chaise à la fenêtre et la longue-vue (« Regarder dans la longue-vue » : le champ se resserre sur le lac ; on lâche dès qu’on fait un pas). La lanterne : l’optique autour de la lampe, la porte de la galerie, la rambarde ; d’en haut, tout le lac.',
    secret: 'Lisez le registre du feu jusqu’au bout, et regardez les dates : après le « Il est revenu. Plus près. » du 4 novembre, page après page, d’une même main, « Allumé. » — la dernière date est celle d’hier. Les papiers : « Lettre de l’Inspection des phares », « Un mot, glissé sous le baromètre » (« Si tu entends marcher là-haut, ne monte pas »). La nuit, la lanterne a quelque chose à dire sur les marches.' },
  { pages: ['c2t:pigeonnier'], titre: 'Dedans',
    texte: 'On entre par une porte dans la pointe de devant. Dedans, la terre battue, des fientes, les boulins sur les huit pans, du sol au toit (« Fouiller les boulins »), des pigeons sur les rebords ; de jour, ils roucoulent, rarement, plus fort quand on est dedans. L’échelle tournante au milieu, sur son axe : « Faire tourner l’échelle » lui fait faire un huitième de tour (elle reste où on l’a laissée, même après une sauvegarde).' },
  { pages: ['c2t:loge_charbonnier'], titre: 'Dedans',
    texte: 'Une loge de perches et de mottes où l’on entre debout (porte de 1,95 m sous l’auvent) : la couche de fougères sur sa paillasse (on y dort), la marmite, les outils (pelle, râteau, claie), une lanterne, le coffre des charbonniers (pain, charbon, tabac, quelques pièces, corde, viande fumée, rarement de l’eau-de-vie).',
    secret: 'Parfois, dans le coffre, « Une planchette, écrite au charbon » : le petit ne dort plus dans la loge ; on gratte aux mottes, la nuit, du côté du bois.' },
  { pages: ['c2t:moulin_ruine'], titre: 'Dedans',
    texte: 'Les deux tours de pierre moussue sont creuses : on entre par la porte, une fenêtre s’ouvre plus haut. Une poutre tombée, des gravats, de la farine mêlée de terre, et les sacs éventrés du meunier (« Fouiller les sacs éventrés »). Le toit est crevé par endroits.' },
  { pages: ['c2t:borie'], titre: 'Dedans',
    texte: 'Les lits de pierres sont creux. La porte est basse (1,25 m) : on entre accroupi, et l’on se relève au milieu, sous la voûte. « Desceller la pierre branlante du mur » se fait de l’intérieur ; la cachette « derrière la pierre percée », quand on en connaît l’histoire, aussi.' },
  { pages: ['c2t:glaciere'], titre: 'Dedans',
    texte: 'Le portail est percé ; au fond, le noir de l’escalier. « Descendre les marches, à tâtons » se fait depuis le seuil.' },
  { pages: ['li:clocher_noye'], titre: 'Dedans',
    texte: 'On y entre en plongeant (C : on descend ; un peu moins d’une demi-minute de souffle) : la baie est là où le rectangle sombre était peint. Dedans, la vase, des marches qui s’enfoncent, les quatre abat-sons, le mouton d’un mur à l’autre, et la corde.',
    secret: 'La cloche n’y est que les nuits d’orage, de vingt heures et demie à cinq heures : elle sonne alors toute seule, lentement, et on l’entend de la rive. « Tirer la corde » ces nuits-là la fait sonner (on n’en sort pas tranquille) ; les autres jours, la corde est molle et ne tient à rien.' },
  { pages: ['li:bergerie'], titre: 'Dedans',
    texte: 'La cabane du berger a retrouvé ses affaires : la paillasse (on y dort), la lanterne, le râtelier des sonnailles, le foin, la mangeoire, la houlette appuyée près de la porte, le coffre du berger (laine, sel, corde, bougies, pain, quelques pièces, rarement un couteau de poche). Dans l’enclos, la pierre à sel.',
    secret: 'Parfois, dans le coffre, « Un bâton de compte » : des encoches par cinq, puis il en manque une, puis deux — et au bout, gratté plus profond que le reste, une encoche de trop.' },
  { pages: ['li:es_baile', 'li:estive'], titre: 'La porte', texte: 'La porte de la jasse du baïle est à hauteur d’homme (2,05 m) : on y entre debout.' },
  { pages: ['li:es_fromagerie'], titre: 'La porte', texte: 'La porte de la fromagerie est à hauteur d’homme (2,05 m) : on y entre debout.' },
  { pages: ['li:es_patre'], titre: 'La porte', texte: 'La porte de la cabane du pâtre est à hauteur d’homme (2,05 m) : on y entre debout.' },
];

module.exports = { REGLES, TOURS, TENTE, DEDANS };
