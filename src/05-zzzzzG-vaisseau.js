// ============================================================================
//  LA CITÉ DES MAISONS-D'ÉTOILE (agent G, douzième vague) — données et textes
//  Une seule pierre ronde dans toute la vallée (11-zzzzG-portail.js : tirée de
//  la graine) ouvre un passage vers une cité-vaisseau abandonnée, loin au-dessus
//  du ciel (11-zzzzG-vaisseau.js : le monde « à part » 'vaisseau'). Un seul
//  voyage : on revient par le seuil de la cité, et les deux pierres s'éteignent.
//  Ici : les objets, les améliorations du corps (l'Atelier des corps), les
//  inscriptions en Hautes Lettres, les journaux, les carnets, la voix de la
//  Veilleuse. (Les modèles : 07-zzzzzzzzzzzzG-vaisseau.js.)
// ============================================================================
ITEM_CAT_NAMES.cite = 'Choses de la cité';
// (les noms de lieux — LIEU_NAMES, défini en 06 — sont donnés par 11-zzzzG-portail.js)
const VG_LIEUX = { vg_pierre: 'la pierre ronde', vg_cite: 'la cité', vg_versant: 'là-haut' };

// ---------------------------------------------------------------- les objets
defItem('vg_coeur', 'Cœur de verre', 'cite', 30, ['vg_coeur', '#7ab8e8'], { desc: 'Une ampoule de verre épais, grosse comme un poing, où bat une lumière bleue. Elle est tiède. Elle bat moins vite quand on la serre.' });
defItem('vg_ration', 'Pain d’étoile', 'nourriture', 6, ['vg_ration', '#9aa0a8'], { food: 40, heal: 8, desc: 'Une galette grise et dense, dans une feuille qui brille. Elle n’a pas de goût ; ou plutôt, elle a le goût de ce qu’on regrette.' });
defItem('vg_fruit', 'Fruit de serre', 'nourriture', 4, ['vg_fruit', '#d8e0a0'], { food: 16, heal: 4, desc: 'Un fruit pâle, côtelé, qui sent la pluie. Il a poussé sous une lumière qui n’était pas le soleil.' });
defItem('vg_seve', 'Fiole de sève claire', 'nourriture', 22, ['vg_seve', '#c8f0d0'], { food: 2, heal: 35, desc: 'Une fiole de sève d’un vert presque blanc. Là-haut, on en mettait sur les plaies, et elles se fermaient.' });
defItem('vg_eclat', 'Éclat de coque', 'materiau', 12, ['vg_eclat', '#a8b4c0'], { desc: 'Un morceau de métal mince comme une feuille, léger comme du liège, qu’aucune lime ne raye.' });
defItem('vg_alliage', 'Lingot sans rouille', 'materiau', 35, ['vg_alliage', '#8a9cb0'], { desc: 'Un lingot d’un métal gris-bleu, plus léger que l’étain. Il ne rouille pas, il ne ternit pas, et le forgeron ne saura pas le fondre.' });
defItem('vg_etoffe', 'Étoffe qui ne se froisse pas', 'materiau', 25, ['vg_etoffe', '#c0c4cc'], { desc: 'Un pan de tissu gris d’argent, si fin qu’il tiendrait dans une coquille de noix, et qui reprend sa forme dès qu’on le lâche.' });
defItem('vg_plaque', 'Plaque des étoiles', 'tresor', 140, ['vg_plaque', '#202838'], { desc: 'Une plaque de verre noir où des points de lumière s’allument quand on souffle dessus. Des traits relient certaines étoiles ; l’un d’eux s’arrête net, au bord, comme si la route avait été coupée.' });
defItem('vg_insigne', 'Insigne de la cité', 'tresor', 45, ['vg_insigne', '#d8dce8'], { desc: 'Un insigne de métal clair : trois traits sous une étoile. Il a été porté longtemps ; le bord est poli par le pouce.' });
defItem('vg_toupie', 'Toupie de verre', 'tresor', 30, ['vg_toupie', '#c8e0f8'], { desc: 'Une toupie d’enfant, en verre, qui tourne longtemps, très longtemps, et ne tombe jamais tout à fait.' });
defItem('vg_boite', 'Boîte à musique d’étoiles', 'tresor', 90, ['vg_boite', '#e8e0d0'], { desc: 'Clic : l’ouvrir. Une petite boîte de nacre qui joue cinq notes, toujours les mêmes, dans un ordre qui change.' });
defItem('vg_cristal', 'Cristal à souvenirs', 'tresor', 70, ['vg_cristal', '#a8e8f0'], { desc: 'Clic : le tenir contre la lumière. Une lame de cristal où quelqu’un a laissé un moment de sa vie.' });
defItem('vg_graine', 'Graine de lumière', 'tresor', 55, ['vg_graine', '#f0e8a0'], { desc: 'Une graine grosse comme une noisette, qui luit doucement dans le noir. Rien, ici-bas, ne la fera germer. Ou peut-être que si.' });
defItem('vg_oeil', 'Œil de verre', 'tresor', 75, ['vg_oeil', '#3a4a6a'], { desc: 'Une sphère de verre sombre où tourne quelque chose, tout au fond, comme une pupille qui cherche.' });
defItem('vg_carnet_thalvor', 'Carnet de Thalvor', 'cite', 0, ['vg_carnet', '#5a6a7a'], { desc: 'Clic : le lire. Un carnet aux pages minces comme des pelures, couvert d’une écriture serrée qui change de forme à mesure qu’on la regarde.' });
defItem('vg_carnet_seriane', 'Carnet de Seriane', 'cite', 0, ['vg_carnet', '#5a7a5a'], { desc: 'Clic : le lire. Un carnet taché de terre, plein de dessins de feuilles et de racines.' });
defItem('vg_cahier_iorin', 'Cahier d’Iorin', 'cite', 0, ['vg_carnet', '#a87a9a'], { desc: 'Clic : le lire. Un cahier d’enfant, aux coins cornés. Des dessins, des mots de travers.' });
defItem('vg_notes_mirelle', 'Notes de Mirelle', 'cite', 0, ['vg_carnet', '#8a6a5a'], { desc: 'Clic : les lire. Des feuillets attachés par un fil, couverts de schémas de corps, de muscles et d’os.' });
defItem('vg_fiche', 'Fiche sur papier glacé', 'cite', 0, ['vg_fiche', '#e8e8e0'], { desc: 'Clic : la lire. Un papier lisse, trop blanc, imprimé à la machine. Rien, sur cette feuille, n’est de ce siècle ; rien, non plus, n’est de la cité.' });
defItem('vg_pierre_seuil', 'Éclat de la pierre ronde', 'cite', 0, ['vg_pierre', '#6a6a78'], { desc: 'Un éclat tombé de la pierre ronde quand sa lumière s’est éteinte. Il est froid. Il était tiède.' });

// ---------------------------------------------------------------- l'Atelier des corps : les améliorations
// Modestes, permanentes, chères : chaque degré coûte des cœurs de verre (1, puis 2, puis 3), et le corps paie aussi
// (des points de vie, une fatigue). Trois degrés au plus par amélioration, six en tout : « le corps a sa mesure ».
// (vérifié par tools/equilibrage/G.js : on reste en deçà des potions et des bottes, et la cité ne cache pas de quoi
// tout prendre)
const VG_CORPS = [
  { id: 'jambes', nom: 'Les jambes', desc: 'Courir un peu plus vite.', effet: 'la vitesse, à pied : +4 % par degré' },
  { id: 'jarret', nom: 'Le jarret', desc: 'Sauter un peu plus haut.', effet: 'l’élan du saut : +4,5 % par degré (la hauteur : +9 % environ)' },
  { id: 'souffle', nom: 'Le souffle', desc: 'Courir plus longtemps sans s’essouffler ; tenir plus longtemps sous l’eau.', effet: 'la fatigue de la course : −12 % par degré ; le souffle sous l’eau : +30 % par degré' },
  { id: 'os', nom: 'Les os', desc: 'Tomber d’un peu plus haut sans se faire mal.', effet: 'la chute ressentie : −5 % par degré' },
];
const VG_CORPS_MAX = 3;            // degrés par amélioration
const VG_CORPS_TOTAL = 6;          // degrés en tout
const VG_CORPS_COUT = [1, 2, 3];   // cœurs de verre pour le premier, le deuxième, le troisième degré
const VG_CORPS_VIE = [12, 18, 26]; // points de vie que coûte l'opération (on ne descend jamais sous 10)
const VG_CORPS_FATIGUE_H = 6;      // heures de jeu de courbatures après une opération (la vitesse : −10 %)
// effets d'un état { jambes, jarret, souffle, os } (des multiplicateurs : 1 = rien)
function vgEffets(n) {
  n = n || {};
  const d = (k) => clamp(n[k] | 0, 0, VG_CORPS_MAX);
  return {
    vitesse: 1 + 0.04 * d('jambes'),
    saut: 1 + 0.045 * d('jarret'),
    fatigue: 1 - 0.12 * d('souffle'),
    apnee: 1 + 0.3 * d('souffle'),
    chute: 1 - 0.05 * d('os'),
  };
}
// coût du degré suivant d'une amélioration (null : impossible)
function vgCoutSuivant(n, id) {
  n = n || {};
  const cur = n[id] | 0, tot = VG_CORPS.reduce((a, c) => a + (n[c.id] | 0), 0);
  if (cur >= VG_CORPS_MAX || tot >= VG_CORPS_TOTAL) return null;
  return { coeurs: VG_CORPS_COUT[cur], vie: VG_CORPS_VIE[cur], degre: cur + 1 };
}

// ---------------------------------------------------------------- les Hautes Lettres de la cité (non traduites)
// Les mots sont tous ceux du lexique aëlin : qui en sait assez lira ; les autres verront des traits.
for (const I of [
  ['a_vg_seuil', 'aelin', 'dalen na-estel , an tor , an kor', 'Le seuil de l’étoile : une fois on ouvre, une fois on ferme.', null],
  ['a_vg_retour', 'aelin', 'rath an , dalen kor', 'Un seul chemin ; le seuil se ferme.', null],
  ['a_vg_aelim', 'aelin', 'aelim vora estel , teh ven', 'Les Aëlim, autrefois, les étoiles ; ici, la vie.', null],
  ['a_vg_trois', 'aelin', 'aela ma durn teh , vesh na-ve rath', 'Aëla et Durn étaient ici ; Vesh est venue par notre chemin.', null],
  ['a_vg_ior', 'aelin', 'ior sae , ve rim', 'L’enfant dort ; nous gardons.', null],
  ['a_vg_estel', 'aelin', 'estel ulen , ves vesa vor', 'Les étoiles se taisent ; la nuit noire est devant.', null],
  ['a_vg_vir', 'aelin', 'vir nai tor , ves kala', 'N’ouvre pas le feu : la nuit appelle.', null],
  ['a_vg_hem', 'aelin', 'ta ne hem , hem rim', 'Toi qui es un homme, garde l’homme.', null],
]) if (!INSCR_BY_ID[I[0]]) { INSCRIPTIONS.push(I); INSCR_BY_ID[I[0]] = { id: I[0], lang: I[1], texte: I[2], sens: I[3], lieu: I[4] }; }

// ---------------------------------------------------------------- la voix de la cité : la Veilleuse
// (sous-titres ; « qui » : 'Une voix' tant qu'elle ne s'est pas nommée)
const VG_VOIX = {
  arrivee: [
    '… Vous êtes revenus.',
    'Non. Pardon. Vous n’êtes pas des nôtres. Vous venez d’en bas : vous sentez l’herbe.',
    'Je suis la veilleuse. On m’a laissée allumée. Il ne me reste plus beaucoup de lumière, mais j’en ai gardé pour vous.',
  ],
  reprise: 'Vous êtes toujours là. Je suis contente. Je parle si peu.',
  nef: 'C’était la Nef. On y jouait, on s’y mariait, on s’y disputait. Il y avait des arbres, et quand on levait la tête, les étoiles.',
  quartiers: 'Les maisons de l’équipage. Ne vous gênez pas : personne ne reviendra chercher ses affaires.',
  machinerie: 'Le Cœur dort. Thalvor l’a éteint de ses mains. Si vous le rallumez, ne le laissez pas trop longtemps : la lumière se voit de loin.',
  coeur_on: 'Oh. … J’avais oublié ce que c’est, d’avoir chaud.',
  coeur_off: 'Merci. Il fait noir de nouveau. On est plus tranquille, dans le noir.',
  berceaux: 'Ici dormaient les enfants. On les a descendus les premiers, endormis. Tous, sauf une.',
  iorin: 'Ne la réveillez pas. Je l’ai promis à sa mère : elle se réveillera en bas. Mais personne n’est remonté la chercher.',
  jardins: 'Les jardins de Seriane. Elle chantait en arrosant. Faux, mais elle chantait.',
  serre_on: 'Ça pousse. Ça pousse ! Pardonnez-moi. Je n’avais rien vu pousser depuis si longtemps.',
  archives: 'Tout ce que nous savions est ici. Il y en a beaucoup. Ça n’a servi à rien, mais il y en a beaucoup.',
  observatoire: 'D’ici, on voyait la route. Ne regardez pas trop longtemps du côté où il n’y a plus d’étoiles.',
  volets: 'Elle est là, en bas. Votre maison. Elle est si petite, vue d’ici, et elle nous a tous pris.',
  atelier: 'L’Atelier des corps. Mirelle y préparait ceux qui descendaient : la pesanteur d’en bas n’était pas la nôtre. Elle disait qu’un corps a sa mesure.',
  chapelle: 'Ils priaient les Trois avant de les connaître. Après, ils ont prié pour ne plus les connaître.',
  breche: 'Là, la coque s’est ouverte. Il n’y a plus d’air. Retenez votre souffle, ou rallumez le rideau.',
  seuil: 'Le seuil est prêt. Je l’ai tenu prêt longtemps. Quand vous le passerez, je pourrai enfin me reposer.',
  longtemps: 'Vous pouvez rester. Personne ne vous presse. Ici, le temps ne passe que pour moi.',
  cristal: 'Ça, c’est la voix de Seriane. Gardez-la. Moi, je la sais par cœur.',
  gravite: 'La Nef est légère, maintenant. Les enfants adoraient. Les vieux, beaucoup moins.',
  depart: 'Au revoir. Dites-leur, en bas… Non. Ne leur dites rien. Ils ont fini par oublier ; c’est ce qu’ils voulaient.',
};

// ---------------------------------------------------------------- le Registre de la cité (journal de bord)
// lu sur l'écran du Seuil ; la Veilleuse traduit à mesure (« la traduction est approximative »)
const VG_JOURNAL = [
  ['An 612 du Voyage', 'La lumière d’Iseth s’est éteinte derrière nous. Ce n’était pas une mort d’étoile : elle n’a pas enflé, elle n’a pas brûlé. Elle s’est tue.\n\nLes astronomes disent qu’il n’existe rien qui fasse cela. Il existe quelque chose qui fait cela.'],
  ['An 640 du Voyage', 'Nous sommes trois cent mille à bord, dont deux cent mille qui dorment. Les Maisons de l’Étoile tiennent. Les jardins donnent. Les enfants qui naissent ici n’ont jamais vu de ciel qui ne soit pas noir. Ils demandent ce que c’est, « dehors ». Nous leur montrons la Nef.'],
  ['An 702 du Voyage', 'Un monde. Bleu et vert, une seule lune, de l’eau qui coule à ciel ouvert. Nous l’avons regardé une année entière avant d’oser y croire.\n\nIl y a quelqu’un, en bas. Trois quelqu’un. Nos mesures ne savent pas les nommer. Nos prêtres, si.'],
  ['An 703 du Voyage', 'La Cité ne peut pas se poser : elle se briserait sous son propre poids. Les ingénieurs ont bâti le seuil. On passe d’ici à là-bas comme on passe une porte, à condition de ne pas penser au chemin. Thalvor dit que le seuil coûte une fortune de lumière à chaque passage. Nous avons de la lumière.'],
  ['An 704 du Voyage', 'Les premiers sont descendus dans une vallée entre des montagnes. Ils disent que la pluie a une odeur. Ils disent qu’une femme de lumière les a regardés depuis une colline, à l’aube, et qu’elle n’a rien dit. Ils l’appellent déjà par un nom.'],
  ['An 705 du Voyage', 'Une montagne a bougé. Pas beaucoup. Les géologues d’en bas jurent qu’elle respire. Thalvor dit qu’elle dort, et qu’il ne faut pas faire de bruit dans la maison de quelqu’un qui dort. Nous avons appris à marcher doucement.'],
  ['An 709 du Voyage', 'Les étoiles s’éteignent à l’avant. Pas derrière : à l’avant. Une par une, comme on souffle des chandelles en remontant une allée.\n\nCe qui a éteint Iseth nous a suivis. Il a pris son temps.'],
  ['An 709 du Voyage, plus tard', 'Le Conseil a décidé : tout le monde descend. Les berceaux d’abord. Les enfants ne se réveilleront qu’en bas, sous un ciel bleu, et on leur dira que le noir était un rêve.'],
  ['An 710 du Voyage', 'Ceux d’en bas demandent qu’on éteigne la Cité. Ils disent que la Nuit suit la lumière ; qu’elle nous a trouvés par notre lumière. Ils disent : « Éteignez tout. Fermez le seuil. Ne nous cherchez plus. »\n\nIls ont creusé sous la montagne pour cacher leurs lampes. Ils ont raison. Ils ont peur. Les deux.'],
  ['An 710 du Voyage, dernière entrée', 'Thalvor reste pour éteindre. Je reste avec lui : une capitaine descend la dernière. Nous laissons la veilleuse. Il faut bien que quelqu’un se souvienne de nous.\n\n— Ilaeth'],
  ['Ajout de la veilleuse', 'Je n’ai pas compté les années depuis. J’ai compté les nuits où la vallée chantait : on l’entend, par le fil du seuil, quand le vent est du bon côté. Il y en a eu beaucoup.\n\nJ’ai appris vos mots en écoutant. Pardonnez les miens : ils ont deux cents ans.'],
];

// ---------------------------------------------------------------- les écrans (terminaux) des salles
// clé → { titre, pages: [[titre, texte], …] } ; « nuit » : texte de l'écran tant que le Cœur dort
const VG_ECRANS = {
  seuil: { titre: 'L’écran du Seuil', nuit: 'Un seul trait de lumière bleue court au bas de l’écran, d’un bord à l’autre, et recommence. Sous le trait, des signes qui ne bougent pas.', pages: [
    ['Le seuil', 'Des colonnes de signes défilent, puis se figent. La voix, tout près de votre oreille : « Ce sont des chiffres. Je ne sais plus très bien les lire ; je sais seulement qu’il en reste un. »'],
    ['Le fil', '« Le seuil n’a jamais été tout à fait fermé. Thalvor a laissé un fil, pas plus large qu’un cheveu de lumière. Par lui, j’entends la vallée. Par lui, vous êtes venu. »'],
  ] },
  machinerie: { titre: 'L’écran de la Machinerie', nuit: 'Une ligne rouge, très lente, qui s’allume et s’éteint comme une braise sur laquelle on souffle.', pages: [
    ['Le Cœur', 'Un dessin s’allume : une colonne, et dedans une lumière pliée sur elle-même. « Le Cœur. Il buvait la lumière des étoiles par la coque, et il la rendait aux maisons. Il en a gardé un peu. »'],
    ['Consignes d’extinction', 'Une liste, tracée d’une main pressée : fermer les jardins ; vider la Nef ; endormir les berceaux ; baisser le Cœur ; garder la veilleuse ; garder le fil du seuil. Tout est coché. La dernière ligne n’est pas cochée : « remonter chercher la petite ».'],
    ['Note de Thalvor', '« Si quelqu’un rallume le Cœur : ne le laissez pas brûler longtemps. Ce qui a éteint Iseth voit la lumière comme vous voyez une fenêtre allumée dans la campagne, la nuit. On y va. On frappe. »'],
  ] },
  berceaux: { titre: 'L’écran des Berceaux', nuit: 'Une seule ligne de signes est encore allumée, tout en bas de la liste.', pages: [
    ['La liste', 'Des centaines de noms, et devant chacun, le même signe : un trait qui descend. « Descendu. Descendu. Descendu. » La voix lit sans vous regarder.'],
    ['Le dernier', '« Iorin. Sept ans. En attente. » La ligne clignote doucement, comme une respiration. « Son berceau ne s’est pas ouvert. Thalvor a essayé trois jours. Il a pleuré. Puis il a dit : quelqu’un reviendra. »'],
  ] },
  jardins: { titre: 'L’écran des Jardins', nuit: 'Une feuille dessinée en traits pâles, qui se fane et reverdit, se fane et reverdit.', pages: [
    ['Les serres', '« Les serres demandent peu : de la lumière, de l’eau, quelqu’un pour parler aux feuilles. Seriane leur parlait. Je peux faire la lumière et l’eau. »'],
    ['Note de Seriane', '« Si tu lis ceci, c’est que tu as faim. Les fruits de la troisième rangée sont les meilleurs. Ne mange pas les violets : ils sont pour les bêtes, et il n’y a plus de bêtes. »'],
  ] },
  archives: { titre: 'L’écran des Archives', nuit: 'L’écran est mort ; quand on pose la main dessus, il tiédit un peu, puis plus rien.', pages: [
    ['Iseth', '« Iseth était notre soleil. Il était jaune, un peu plus pâle que le vôtre. Nous avions des saisons, des fleuves, des chats. Nous avions des chats, je vous assure. »'],
    ['Les Trois', '« Trois présences, en bas. La première est une lumière qui se tient à l’aube sur les hauteurs. La deuxième est une montagne qui dort et qui rêve, et ses rêves font trembler la terre. La troisième n’était pas en bas. La troisième, nous l’avons amenée. »'],
    ['Ceux qui sont descendus', '« Ils ont pris un nom, en bas : le peuple de la lumière. Ils ont oublié la cité exprès, une génération après l’autre, comme on laisse un feu mourir pour que la fumée ne se voie plus. Ils ont gardé les mots. Pas tous. »'],
    ['Visiteur sans seuil', '« Il y a eu un autre visiteur. Il n’est pas passé par le seuil : il est apparu dans la Nef, dans une boîte qui bourdonnait, avec un vêtement jaune et un œil de verre sur la poitrine. Il a pris des mesures. Il a dit des mots que je n’ai pas compris. Il a laissé un papier et une lampe. Il n’est pas revenu. »'],
  ] },
  observatoire: { titre: 'L’écran de l’Observatoire', nuit: 'Des points blancs, et une tache noire au milieu, qui ne bouge pas.', pages: [
    ['La route', 'Une carte du ciel s’allume, traversée d’un trait clair : la route de la cité, d’Iseth jusqu’ici. Derrière le trait, des étoiles. Devant, sur une large part du ciel, plus rien. « Elle avance moins vite que nous. Elle a le temps. »'],
    ['Le dernier relevé', '« Distance de la Nuit : » — les signes se brouillent. La voix : « Je ne regarde plus ce chiffre. Il diminue. »'],
  ] },
  atelier: { titre: 'L’écran de l’Atelier', nuit: 'Une silhouette de corps humain, dessinée en traits bleus, à laquelle il manque la tête.', pages: [
    ['L’Atelier des corps', '« Mirelle préparait ceux qui descendaient : la pesanteur d’en bas était plus lourde que la nôtre, l’air plus épais, le soleil plus dur. Elle refaisait un muscle, un os, un souffle. Un peu. Jamais beaucoup. »'],
    ['La mesure', '« Trois fois sur le même muscle, pas davantage. Six fois en tout sur un même corps. Au-delà, disait Mirelle, le corps se souvient de ce qu’il était, et il s’en venge. »'],
    ['Le prix', '« Chaque reprise boit des cœurs de verre : un, puis deux, puis trois. Et le corps paie aussi : il saigne un peu, il a mal longtemps. Mirelle disait : ce qu’on ajoute, on l’emprunte. »'],
  ] },
};

// ---------------------------------------------------------------- les carnets (objets qu'on lit d'un clic)
const VG_CARNETS = {
  vg_carnet_thalvor: ['Carnet de Thalvor', 'Les pages sont si minces qu’on voit le jour à travers. L’écriture glisse, se défait, se recompose en lettres que vous savez lire.\n\n« J’ai éteint les jardins aujourd’hui. Seriane m’aurait tué. Elle est en bas, elle ne le saura jamais, c’est peut-être pire.\n\n« J’ai vidé la Nef. Le bruit des pas, dans une salle vide, on ne s’y fait pas.\n\n« La petite ne se réveille pas. Son berceau refuse de s’ouvrir : il croit qu’elle doit dormir encore. Il a peut-être raison. J’ai essayé trois jours.\n\n« Je laisse la veilleuse allumée. Je lui ai appris à attendre. Elle apprend vite, elle a peur du noir.\n\n« Le seuil gardera de quoi faire un aller et un retour. Pas plus : il faut éteindre tout le reste. Pour qui, cet aller et ce retour ? Pour quelqu’un qui reviendrait chercher la petite. Je descends ce soir. Je reviendrai. »', 'Thalvor, ingénieur du Cœur'],
  vg_carnet_seriane: ['Carnet de Seriane', 'Des feuilles dessinées partout, des racines, des chiffres au crayon. Entre les dessins :\n\n« Troisième rangée : les fruits côtelés. Ils aiment qu’on les touche.\n\n« Iorin a planté une graine de lumière dans la terre des serres, en cachette. Je ne lui ai pas dit que ça ne pousse pas. Elle l’arrose tous les soirs.\n\n« On descend demain. Je cache des graines dans la poche de ma veste. On ne descend pas les mains vides.\n\n« Ils disent qu’en bas, il y a du vent. Iorin veut voir le vent. Moi aussi. »', 'Seriane, des Jardins'],
  vg_cahier_iorin: ['Cahier d’Iorin', 'Un dessin : une maison, un soleil jaune, et un grand trait noir au-dessus, qui mange le coin de la page.\n\n« Maman dit qu’en bas il y a du vent. Le vent c’est de l’air qui court. Je veux voir l’air qui court.\n\n« Je n’aime pas les étoiles qui s’éteignent. Thalvor dit que c’est rien. Il ment, il a les oreilles rouges.\n\n« Si je dors longtemps est-ce que je serai grande en bas ?\n\n« Demain je dors. Maman a dit que je me réveillerai sous le ciel bleu. Je laisse ma toupie à la veilleuse pour qu’elle ait un jouet. »', 'Iorin, sept ans'],
  vg_notes_mirelle: ['Notes de Mirelle', 'Des schémas de corps, des flèches, des muscles dessinés couche après couche. En marge :\n\n« Jambes : on gagne un peu de vitesse ; trop, et le genou lâche à la première pente.\n« Jarret : un peu plus d’élan. Pas de quoi voler. Ils voudraient voler. Ils ne voleront pas.\n« Souffle : plus long, plus calme. Le meilleur des trois, le moins demandé.\n« Os : on les durcit, un peu. Une chute reste une chute.\n\n« Trois fois sur un même muscle, six fois en tout. Au-delà, le corps se souvient de ce qu’il était, et il s’en venge.\n\n« Ce qu’on ajoute, on l’emprunte. Je ne sais pas à qui. »', 'Mirelle, de l’Atelier des corps'],
  vg_fiche: ['Fiche de terrain', 'Un papier glacé, imprimé à la machine, avec un tampon rouge qui déborde de la case :\n\n« FICHE DE TERRAIN — VAL-7 — ACCÈS NON AUTORISÉ\nStructure orbitale d’origine inconnue. Liée à la vallée par un pont d’une nature indéterminée. Pont à usage unique (une traversée aller et retour).\nRECOMMANDATION : NE PAS EMPRUNTER LE PONT. Nous ne repasserions pas.\nL’entité vocale du site est coopérative. Elle demande des nouvelles d’une enfant. Ne pas répondre. »\n\nEn bas, au crayon, d’une autre main : « J’ai répondu. »', 'sans signature'],
};

// ---------------------------------------------------------------- les messages enregistrés (une voix, des mots)
const VG_MESSAGES = {
  ilaeth: { qui: 'Ilaeth', lignes: ['Si quelqu’un entend ceci… nous sommes en bas. Nous allons bien. Nous n’avons pas froid.', 'Ne rallumez pas la Cité. Ne nous cherchez pas.', 'Laissez-nous oublier. C’est la seule chose que nous sachions encore bien faire.'] },
  thalvor: { qui: 'Thalvor', lignes: ['Si la veilleuse vous parle, soyez gentil avec elle.', 'Elle a peur du noir. Je lui ai laissé tout ce que j’ai pu.', 'Et si vous remontez la petite… non. Personne ne remontera. Pardon.'] },
  seriane: { qui: 'Seriane', lignes: ['Iorin, tu dors ? C’est maman.', 'On t’attend en bas. Il y a du vent. Il y a des arbres qui poussent tout seuls, sans lampe.', 'Dors bien. Je viendrai te réveiller.'] },
  mirelle: { qui: 'Mirelle', lignes: ['Allongez-vous. Respirez. Ça va faire mal, et puis ça va passer.', 'Ce qu’on ajoute, on l’emprunte.'] },
};

// ---------------------------------------------------------------- les souvenirs des cristaux (le cristal à souvenirs)
const VG_SOUVENIRS = [
  ['Seriane', 'Une femme chante, faux, au milieu des feuilles. Elle rit d’elle-même et recommence le même couplet.'],
  ['Iorin', 'Une petite fille court dans la Nef, les bras écartés, et saute si haut qu’elle touche une branche. « Encore ! Encore ! »'],
  ['Ilaeth', 'Une femme en manteau gris regarde par une grande vitre un monde bleu, et elle pleure sans bruit, les mains derrière le dos.'],
  ['Thalvor', 'Un homme seul éteint une lampe, puis une autre, puis une autre, dans une salle immense. Il compte à voix basse.'],
];

// ---------------------------------------------------------------- les plaques (signes des salles)
const VG_PLAQUES = {
  seuil: 'Le Seuil', nef: 'La Nef', quartiers: 'Les Maisons de l’équipage', machinerie: 'La Machinerie', berceaux: 'Les Berceaux',
  jardins: 'Les Jardins', archives: 'Les Archives', observatoire: 'L’Observatoire', atelier: 'L’Atelier des corps', chapelle: 'La Chapelle', breche: 'La Brèche',
};

// ---------------------------------------------------------------- dans la vallée : la pierre ronde, ce qu'on en dit
// (les rumeurs nomment le côté de la vallée où elle se trouve : {lieu:vg_versant}, écrit à la génération)
const VG_RUMEURS = {
  eleveuse: ['Les nuits sans lune, il y a une lueur bleue, {lieu:vg_versant}. Elle ne bouge pas, elle ne fume pas. Mes bêtes ne veulent pas brouter de ce côté-là, et moi, je ne les y force pas.'],
  chasseur: ['J’ai suivi un chevreuil {lieu:vg_versant}, une fois. Il s’est arrêté devant une pierre ronde, il l’a regardée, et il est reparti à reculons. Je n’ai pas tiré. Je ne sais pas pourquoi.'],
  fillette: ['Il y a une porte dans le ciel, {lieu:vg_versant}. Je l’ai vue en rêve. Elle a de la place pour une seule personne. Pas pour deux.'],
};
// (ajoutées aux rumeurs des habitants par 11-zzzzG-portail.js)
// ce qu'on trouve près de la pierre ronde (le papier d'Anselme), et ce qu'on lit sur le papier perdu plus loin
const VG_PAPIERS = {
  anselme: ['Un papier plié, sous une pierre', '« J’ai trouvé la pierre ronde. Elle chante quand il n’y a pas de lune. Elle m’a montré, dedans, une ville pleine d’étoiles.\n\nJe n’y suis pas allé. On n’y va qu’une fois : ça se sent, comme on sent qu’une planche ne portera qu’un seul passage. J’ai laissé la place à un autre.\n\nA. V. »', 'Anselme Varenne'],
  berger: ['Une page de carnet, mouillée et séchée', '« Le bleu revient chaque nuit sans lune, {cote}. Ce n’est pas un feu follet : ça ne bouge pas. Ça attend.\n\nJ’y suis monté une fois. Il y a une pierre ronde, debout, grande comme une porte de grange, et dedans de la lumière qui coule comme de l’eau. Je n’ai pas touché. Mon père disait qu’il ne faut pas mettre la main dans ce qui attend. »', 'un berger, sans nom'],
};

// ---------------------------------------------------------------- la pierre ronde : ce qu'on voit
const VG_TEXTES = {
  pierreJour: 'Un anneau de pierre grise, debout, haut comme une porte de grange, posé sur un socle à demi enterré. Dedans, une lumière bleue coule sans bruit, comme de l’eau qui tomberait vers le haut. Au fond de la lumière, très loin, on devine un sol lisse et des lampes alignées. Il en vient une odeur de pluie froide.',
  pierreNuit: 'Dans le noir, l’anneau de pierre est plein d’une lumière bleue qui coule sans bruit. Elle éclaire l’herbe autour, et vos mains. Au fond, très loin, des lampes alignées, un sol lisse, et quelque chose comme une voûte d’étoiles. La pierre chante, tout bas, trois notes, toujours les mêmes.',
  pierreMorte: 'La pierre est froide. L’anneau est vide : à travers, on ne voit plus que l’herbe et le ciel.',
  seuil: 'L’anneau de nacre est plein d’une lumière qui coule vers le haut, plus pâle qu’à votre arrivée, comme une lampe qu’on a gardée pour le retour. De l’autre côté, à peine, l’herbe, le vent, une odeur de foin.',
  registre: 'Des lignes de signes défilent, puis se figent. La voix, tout près : « Le registre de la cité. Je vous le lis. La traduction est approximative. »',
};
