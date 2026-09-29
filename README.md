# Prairie — La vieille ferme

Jeu de ferme et d'horreur lente à la première personne, en 3D rétro (pixels façon Doom, personnages anguleux façon
premier Tomb Raider, bêtes en boîtes), presque sans affichage à l'écran. Un mode Création (éditeur de monde) est inclus.

## Jouer

Ouvrir **`Prairie.html`** dans un navigateur récent (Chrome, Edge ou Firefox, WebGL 2 requis).
Aucune installation ni connexion : tout est dans ce seul fichier. La partie est sauvegardée automatiquement.
Le jeu existe en **français** et en **anglais** (Options, ou le bouton de langue du menu ; bascule à chaud).

**Le wiki de la vallée** : **`Prairie-Wiki.html`** (à ouvrir de même, hors du jeu) est un compagnon autonome : la carte interactive de toute
la vallée (relief, eaux, forêts, chemins, milieux, lieux-dits, maisons des habitants, zones de pêche ; zoom, recherche) et les fiches de
tout le jeu (habitants et leur semaine, objets, recettes, cultures, plantes, arbres, bêtes, poissons, alchimie, livres, langues perdues,
légendes…), avec une recherche plein texte. Les secrets restent masqués tant qu'on ne clique pas sur « révéler les secrets ». Il se
régénère depuis les sources du jeu (la vallée est générée, ≈ 1 minute) : `node tools/wiki-build.js`.

### La grande vallée

Par défaut, la vallée est **dessinée à la main** (3 km de côté, la même à chaque partie ; « une vallée au hasard » de 2 km
reste proposée à la nouvelle partie). Au centre, la ferme sur sa butte, Valbrume la ville fortifiée, le hameau de Clairpré,
la rivière qui descend des contreforts (bordée de saules, deux ponts de bois, des noues), le grand lac et son marais ;
vieille forêt au nord-ouest, lande et plateau au nord-est (abbaye, château, dolmen, tour de guet), bois de bouleaux,
prés du sud-est où vit la harde de chevaux sauvages, forêt du sud et son hameau abandonné. Tout autour, les montagnes :
une ceinture de forêt, des alpages, des falaises, et au nord **les Monts Blancs enneigés**.
- **Au nord** : le col des Treize (une entaille dans les contreforts), la **Combe Perdue** et son lac Noir (pêche : brochet,
  lotte… et ce qui remonte les lignes), une piste en lacets marquée de cairns jusqu'au **refuge du col** (on y dort, on s'y
  réchauffe), le **glacier** et ses **crevasses** (on y tombe ; des restes gelés s'y fouillent une fois), le **lac gelé**
  dans son cirque : un trou dans la glace, on y pêche l'omble.
- **Les Galeries** : sous les contreforts, un **labyrinthe de mine** de plus de cent mètres de côté, étayé, sans lumière
  (lanterne !), où l'on se perd : lac souterrain, grotte aux cristaux, chapelle des profondeurs, éboulement, dépôt, et le
  carnet d'un mineur. Des **mains peintes à l'ocre** montrent la sortie, à qui sait les lire. Trois issues : le puits de la
  mine, une vieille galerie au bord du lac Noir, une faille près du refuge.
- **Les signes** : dix-huit sigles qui ressemblent à des religions, connues ou non (croix cerclée, Mère, Dame, Cerf, ceux
  d'en dessous, les Treize, soleil, spirale, main, cornes, nœud sans fin, œil) : gravés sur des stèles, posés en pierres
  blanches dans l'herbe, une grande spirale tracée dans la neige du glacier, un œil dans la glace du lac gelé. On les
  recopie dans son carnet (onglet Légendes) ; ils comptent pour les fois de la vallée.
- **Arbres et fleurs** : hêtres, châtaigniers, noyers, saules pleureurs, peupliers, sapins (enneigés en altitude),
  mélèzes, ifs des cimetières, tilleuls, érables, cerisiers, poiriers, pruniers, aulnes, houx, arbres foudroyés ; jacinthes,
  digitales (poison), lupins, iris, orchidées, boutons d'or, pissenlits, primevères, violettes, trèfle, reine-des-prés,
  achillée, campanules, chardons, mauves, gentianes, edelweiss, rhododendrons, églantiers, sureaux, myosotis, jonquilles.
  On secoue les fruitiers (cerises, poires, prunes, châtaignes, noix), on cueille les fleurs et les plantes utiles.
- **Le temps** : quand il pleut longtemps, **l'eau monte** (rivière et lacs débordent sur les prés du bas, les cultures trop
  basses se noient, les barques flottent), puis se retire. L'**orage** frappe les grands arbres (ils restent noircis) ; les
  jours de canicule éclate parfois un **orage sec**. Un arbre frappé peut prendre feu : l'**incendie** gagne les voisins,
  poussé par le vent, et s'arrête aux prés, aux chemins, à l'eau, sous la pluie — ou à l'arrosoir. En montagne, **il
  neige** ; il y fait froid : on y a faim plus vite, et la nuit ou sous la neige, sans feu ni toit, le froid tue.

### La ferme

Vous héritez de la vieille ferme d'Anselme Varenne, au fond d'une vallée. Il n'en reste que la maison
(tonneau d'eau de pluie, boîte aux lettres) et un champ avec son épouvantail ; on commence avec cinq graines de radis et
trois de blé. Grange, poulailler, atelier (établi + four) et puits se **construisent** : on tient le chantier en main
(acheté à l'éleveuse ou au forgeron, ou fabriqué), un gabarit lumineux montre l'emprise (vert si l'endroit convient),
clic pour bâtir, clic droit pour tourner ; la journée passe et le terrain est aplani. Sans grange ni poulailler, on ne
peut pas acheter de bêtes. (Les parties commencées avant cette version gardent leur ferme complète.)
- **Cultures** : labourer (houe), semer, arroser (arrosoir, à remplir au puits ou à l'eau), récolter (E ou faux).
  **Soixante-quatre plantes** : légumes (navet, panais, céleri, poireau, ail, oignon, laitue, blettes, chou-fleur, artichaut,
  asperges, courgette, poivron, aubergine, pastèque, courges…), céréales (seigle, orge, avoine, sarrasin, colza, chanvre,
  houblon), petits fruits (framboises, groseilles, cassis, myrtilles, vigne), aromates (basilic, persil, menthe, thym,
  camomille, lavande), fleurs (tulipes, roses, pavots, dahlias, soucis) et deux plantes étranges (la mandragore, qui ne
  pousse que la nuit ; la belladone). Chacune a ses **variétés** (tomate noire de Crimée, carotte violette, tulipe
  « Reine de la nuit », rose noire…), chaque pied sa taille ; les variétés rares donnent un peu plus, et une citrouille, un
  melon, un chou, une courge ou une pastèque devient parfois **géant** (récolte × 4). Quelques graines reviennent à la
  récolte ; la graineterie a ses graines de base et **six nouvelles chaque matin** (ardoise devant la porte) ; les fleurs
  et herbes sauvages en donnent parfois.
- **Ce qu'on ramasse** s'affiche un instant à droite de l'écran (icône, quantité, variété, total dans la sacoche).
  **Clic maintenu** : on laboure, sème, arrose et récolte en balayant le champ ; **E maintenu** récolte à la volée.
  Ça pousse **en heures** (un radis en 2 h de jeu, soit moins de 2 minutes ; une citrouille en 10 h), même pendant la nuit.
  Houe de fer et arrosoirs de cuivre ou de fer travaillent 3 × 3 cases ; arroseurs, engrais et semoir accélèrent encore.
  La pluie arrose, le gel tue les jeunes pousses sensibles, l'orage couche les récoltes, la canicule assèche.
  Les corbeaux mangent les semis : un épouvantail ne protège qu'à **six mètres** autour de lui (dix pour celui de fer) ;
  en le tenant en main, un anneau de paille lumineux montre sa portée (et celle des autres). Les oiseaux s'en écartent.
- **Élevage** : poules, vaches, moutons, cochons et cheval s'achètent au ranch et arrivent le lendemain.
- **Chevaux sauvages** : une harde vit dans un grand pré, loin de tout (le panneau du ranch et les affiches de la ville
  disent où). Accroupi et immobile, une pomme, une carotte ou de l'avoine à la main, les bêtes curieuses viennent à vous ;
  E pour les nourrir (trois fois par jour) : leur confiance grandit. Quand l'une pose la tête contre votre épaule, E pour
  la monter : elle se cabre et se jette de côté — gardez les yeux droit devant vous jusqu'à ce qu'elle s'apaise. Elle
  devient alors la vôtre (une selle, vendue au ranch, la rend un peu plus rapide).
  Œufs, lait (seau), laine (cisailles), truffes ; la mangeoire se remplit de foin.
- **Chasse et pêche** : arc et flèches (maintenir le clic), canne à pêche (lancer, puis cliquer quand le bouchon plonge).
- **Bois et pierre** : haches et pioches de pierre, cuivre, fer puis acier (les arbres et filons résistent aux outils faibles).
- **Fabrication par assemblage** (Tab) : pas de liste toute faite. On pose de un à cinq objets de la sacoche sur l'établi
  d'assemblage, avec leurs quantités, et l'on assemble : si cela fait quelque chose (et que l'établi, le four ou le feu est
  à portée), on le fabrique et la recette entre dans « Ce que vous savez faire » ; sinon, un indice sobre. On ne connaît
  au départ que les recettes de base ; les autres se trouvent en essayant, dans les manuels (livres) ou auprès des
  habitants de métier (« Vous pourriez m'apprendre à fabriquer quelque chose ? »).
- **Machines** : tonneau, baratte, fumoir, presse, meule à bras, composteur. On y dépose des produits (E), on revient
  quelques heures plus tard chercher cidre, vin, beurre, fromage, huile, jus, farine, fumaisons ou engrais.
- **Fouille** : coffres, tonneaux et caisses des campements, ruines, hameau, chapelle, phare, mines, barques et
  charrettes renversées se remplissent de nouveau au bout de 3 jours (chez les habitants, c'est voler : voir « Fouiller »). Chaque matin, de la terre
  remuée apparaît çà et là : on y creuse à la houe. Secouer un arbre (E) fait tomber fruits, nids ou graines.
- **Commerce** : on achète et vend chez les habitants (Maj+clic : par 5, Ctrl+clic : par 20, bouton « Tout vendre ») ;
  la caisse d'expédition est relevée chaque matin (« Tout déposer »).
- **La pelle** : elle **terraforme**. Clic : le sol s'abaisse d'un quart de mètre et l'on récupère de la terre (ou du sable) ;
  clic droit : on remblaie avec ; accroupi : on nivelle à la hauteur de ses pieds. Creuser plus bas qu'avant fait remonter
  des trouvailles (vers, silex, os, argile, pièces, mandragore la nuit en forêt) ; sous le niveau de l'eau, le trou se
  remplit (une mare). Jusqu'à 3 m en plus ou en moins, pas en ville ni contre un bâtiment ; la terre retournée reverdit en
  trois jours. Elle déterre aussi les trésors (cartes, légendes) et dégage les éboulis de quatre grottes cachées.
- **Barre d'outils** (1 à 9, molette) : chaque case se compose dans la sacoche en y glissant un objet. Discrète, elle
  s'efface d'elle-même (option : toujours visible, ou jamais). Chaque objet a son icône ; les objets à poser et les bêtes
  ont une icône tirée de leur modèle 3D.
- **Alchimie** : un alambic (chez la guérisseuse, ou fabriqué) mêle deux ou trois ingrédients dans une fiole. Seize potions
  à découvrir (soin, vigueur, célérité, œil de chouette, croissance, bonne fortune, silence, clairvoyance, souffle d'anguille,
  force, légèreté, antidote, philtre d'amitié, philtre de l'Envers, élixir du dernier souffle, somnifère).
  **À l'aveugle** : la **table d'alchimiste** (dans l'échoppe de l'alchimiste de la ville, ou achetée et posée à la ferme)
  mêle deux à quatre ingrédients ; chacun porte des essences cachées (vie, mort, feu, froid, lumière, ombre, terre, air) qui
  s'additionnent et s'annulent. On ne voit que le résultat, noté dans le carnet (onglet Grimoire) : potions simples ou rares,
  mixtures, poisons, bouillie grise. Quatorze potions nouvelles (chaleur, sang-froid, régénération, baume de moelle, eau
  lustrale, givre, philtre des morts, peau de pierre, mémoire, songe, soleil, fiel noir, appât empoisonné…).
  **Les plantes sauvages sont inconnues** : on ne connaît que leur allure (« Larges feuilles odorantes ») tant que
  l'**alchimiste de la ville** ne les a pas nommées : on lui en porte une, elle la nomme (et en garde un brin).
- **Prière et religions** : l'Église (messe le dimanche, calvaires, bénitier), la Vieille Foi (la Mère des Moissons, la Dame
  du Lac, le Cerf Blanc) et Ceux d'En-Dessous (pactes qui exaucent, avec un prix). Faveurs cachées, bénédictions, offrandes.
- **Légendes** : quatorze légendes racontées par les habitants ou lues dans les livres ; chacune mène à un vrai secret.
  Onze reliques des Anciens, réunies à l'autel du cercle à minuit, apaisent la vallée.
- **Panneaux et cartes** : poteaux indicateurs aux carrefours. **Il n'existe aucune carte de toute la vallée** : les
  panneaux-cartes des villes ne montrent que les environs, à main levée et incomplets ; les cartes de régions (poste,
  colporteurs, bibliothèque) sont déformées, sans « vous êtes ici », et n'indiquent que les lieux où l'on est déjà allé.
- **Villes et villages** : enseignes qu'on peut lire, bacs à fleurs, panneau d'affichage (avis, messe, arrivages de graines,
  objets perdus, chevaux sauvages aperçus…), terrasse de l'auberge, second marché, monument aux morts, drapeau de la mairie,
  bancs, barres d'attache et abreuvoirs (le cheval y boit), arrière-cours avec linge, potagers, bois et poules ; pigeons
  et chats. Au hameau : potagers, four à pain, ruches, cage à poules ; au hameau abandonné, une balançoire qui bouge
  seule ; filets et séchoir chez le pêcheur ; rails et wagonnets à la mine.
- **Livraisons** : la postière confie des colis à porter avant 18 h. Le **cheval** va bien plus vite (E pour monter, G pour siffler).

### Les habitants

Vingt-deux habitants nommés (le prénom change à chaque partie), chacun avec sa routine, ses répliques, ses quêtes et sa boutique.
Chacun a son histoire (racontée chapitre après chapitre, à mesure qu'on se lie), ses questions (dont il se souvient),
son humeur du jour, ses souvenirs de vous, ses conversations avec les autres, sa foi, ses légendes, son jour de fête.
Ils s'assoient, prient à la messe, se saluent, clignent des yeux, bougent les lèvres en parlant ; passé un certain degré
d'amitié, ils vous appellent par votre prénom.
Tous rentrent chez eux le soir et **ferment leur porte à clé** ; les **ponts-levis** de la ville se lèvent de 21 h à 6 h.
Il n'y a pas de jauge de réputation : ils se souviennent (cadeaux, services, coups, intrusions, meurtres…).

### L'étrange

Au fil des jours, des choses changent : d'abord presque rien, puis de moins en moins discret, au hasard, jusqu'à ce qu'un
**tueur masqué** rôde la nuit. **Nuits rouges**, entités qui ne bougent que lorsqu'on ne les regarde pas, une autre
dimension cachée (**l'Envers**), et une vallée qui a déjà connu d'autres **versions**… Une seule vie : à la mort, la partie
s'efface et la vallée recommence autrement. Elle s'en souviendra.

Les commandes sont dans le menu **Commandes** (Échap).

### La grande mise à jour

**Le temps et le corps**
- Le jour dure **dix minutes** et la nuit **dix minutes** (vingt minutes pour vingt-quatre heures) ; la semaine a **douze jours**, chacun son nom (Primedi, Ferdi, Marchedi, Lavedi, Nahédi,
  Chassedi, Pêchedi, Orédi, Foiredi, Veilledi, Chômedi, Vorndi), et chaque habitant a ses jours à lui (marché, lessive,
  chasse, pêche, messe, foire, veillée, jour des morts, visites…).
- **Trois états, dont deux cachés** : la faim (plus elle creuse, plus le cœur bat vite), la vie (jamais affichée) et la
  **mentalité**. Elle baisse peu à peu quand on tue des bêtes, qu'on erre la nuit loin des lumières, qu'on fait le mal,
  qu'on voit des horreurs ; elle remonte avec les quêtes, le soleil, les bons repas, le chien, le sommeil, la prière, le
  bain. Plus l'esprit s'assombrit, plus l'étrange se montre (et il se devine : couleurs éteintes, murmures, silhouettes).
- **Chutes** : dégâts dès trois mètres, **jambe cassée** en sautant de trop haut (on boite ; une attelle aide), mort vers
  quatorze mètres. On **saigne** (mort lente, un bandage l'arrête) ou l'on meurt d'un coup, selon la menace. On ne gravit pas
  les pentes trop raides (hors des chemins), on glisse sur les parois.
- **Ce qu'on mange** : crus ou cuits, des champignons, baies, plantes, viandes et poissons donnent des effets (poison,
  nausée, coliques, fièvre, somnolence, visions, force, jambes de cerf, yeux de chat, calme, panique, paralysie…), tout de
  suite ou jusqu'à cinq minutes plus tard.
- **Son propre alcool** : le tonneau (cidre, vin, bière, hydromel, liqueurs) et l'alambic du bouilleur de cru (eaux-de-vie
  de prune, de poire, de grain…). L'ivresse fait tanguer la vue et dériver les pas ; trop, c'est le coma ; le lendemain,
  la gueule de bois. L'aubergiste achète les bouteilles.
- **Le chien** : il faut le nourrir (gamelle, ou E sur lui) : trois jours sans manger et il meurt. E sur lui : le caresser,
  « À la niche ! », « Au pied ! », « Pas bouger ! ».

**Les gens**
- Dix habitants de plus : l'alchimiste de la ville, le bibliothécaire, deux colporteurs qui vont de village en village
  selon le jour (jusqu'à la ferme) et portent les nouvelles, le chasseur du relais, les gens des Sources, deux nains.
- **La mort est définitive** : un habitant mort emporte ses quêtes et ses répliques à jamais (carnet : « † ne pourra plus
  se faire »), sa maison est mise sous scellés, son commerce repris ; la nouvelle court de village en village.
- **Avis de recherche** : un crime vu est su dans le village des témoins, puis ailleurs au fil des jours (postière, garde,
  colporteurs). Une prime est mise sur votre tête, des affiches « RECHERCHÉ » sont clouées, on refuse de vous parler, le
  garde somme, arrête ou frappe, des chasseurs de primes rôdent. La prime se paie au garde, au maire, ou s'oublie.
- **Construire** : partout, sauf dans les villes, les villages et les lieux protégés.
- **Vol à la tire** : accroupi, dans le dos d'un habitant, E pour « faire les poches ». La réussite dépend de la position,
  de son attention, de la nuit, de la foule… Raté : il crie, les témoins parlent, le garde accourt. Les objets volés se
  reconnaissent (les colporteurs, eux, rachètent sans rien demander).
- **Prison** : arrêté, on se retrouve au **cachot** (objets volés et armes confisqués), pour des jours selon les crimes. On en
  sort en payant une **rançon**, en faisant ses **travaux forcés** à la carrière (chaque journée de travail compte double), en
  attendant sur la paille — ou en s'évadant (une lime, un barreau, le trousseau du geôlier endormi…), ce qui aggrave la prime.
  Pendant ce temps, la ferme vit sans vous.
- **Sentiments** : huit habitants peuvent s'éprendre du personnage (la boulangère, le forgeron, la postière, le garde,
  l'éleveuse, le pêcheur, la colporteuse, le chasseur) : attirance, aveu, cour, rendez-vous (le lac au coucher du soleil, un
  pique-nique, la danse de la veillée), couple, fiançailles, noces à l'église, puis il ou elle vient vivre à la ferme et aide.
  Jalousie si l'on en courtise deux ; la mort de l'être aimé pèse lourd sur l'esprit.
- **Les douves** de la ville : on peut y descendre, y nager, et en ressortir par les échelles.

**Dormir, se loger, fouiller, s'occuper**
- **Dormir à toute heure**, dans chaque lit de la vallée (une quarantaine : la ferme, les maisons, les chambres de
  l'auberge, les lieux abandonnés) : E sur le lit, « Dormir ici », et l'on se réveille le lendemain à six heures (le jour,
  le jeu le demande d'abord). La chambre de l'auberge se loue à l'aubergiste. Dans le lit de quelqu'un : s'il est là, il
  proteste ; s'il rentre pendant la nuit, il vous trouve (amitié en chute, intrusion, et dehors).
- **Plus d'évanouissement** à trois heures du matin : à la place, la **fatigue**. Après seize heures debout, les
  paupières s'alourdissent, la vue se voile, l'endurance revient moins vite, la mentalité s'abîme plus vite et l'étrange
  se montre davantage ; très tard, les yeux se ferment tout seuls, une seconde. Une nuit de sommeil efface tout.
- **Louer une maison en ville** : trois maisons à louer (la maison Vernet, la maison Delorme contre le rempart, la maison
  du Rempart au nord-est), avec un écriteau « À louer » devant chacune (E : le prix à la semaine de douze jours) ; le
  maire s'en occupe aussi. Le locataire a la clé (la porte se referme à clé derrière lui), le lit et un coffre cerclé de
  fer. Loyer dû chaque semaine : avis d'échéance, lettre de rappel au troisième jour de retard, expulsion au sixième (le
  coffre est saisi, on le reprend à la mairie contre la dette). « Rendre les clés » quand on veut.
- **Crocheter** : avec un jeu de crochets (le colporteur, le forgeron, ou l'établi), E sur une porte fermée à clé :
  « Frapper » ou « Crocheter ». Petit jeu d'adresse : les goupilles montent et descendent, on cale chacune quand elle
  affleure la ligne (Espace, E ou clic) ; plus la serrure est bonne, plus elles sont nombreuses et rapides. Un raté fait
  du bruit (l'habitant peut se réveiller, un passant peut voir) et peut casser un crochet ; fatigué ou ivre, les mains
  tremblent. Vu : c'est une effraction. De l'intérieur, une porte fermée à clé s'ouvre toujours (le verrou).
- **La poterne** du rempart est : une petite porte qui s'ouvre **de l'intérieur seulement** — on sort de la ville même
  ponts levés, elle se referme derrière soi ; dehors, ni serrure ni poignée. Pour rentrer : les douves et leurs échelles.
- **De vraies portes** : planches, pentures, clous, serrures et encadrements, différentes selon la maison (ferme,
  maisons de ville peintes, boutiques vitrées, auberge cloutée, mairie, garde bardée de fer, bibliothèque et église à
  deux battants, roulottes).
- **Fouiller** : plus de cent endroits dans la ville, le hameau et les lieux habités (armoires, commodes, buffets, malles,
  secrétaire et coffre-fort de la mairie, tiroirs-caisses, cave de l'auberge par la trappe, pétrin, casiers de la poste,
  sacristie et tronc des pauvres, apothicaire, sellerie, charrettes, étals, poulaillers, poubelles…). Chacun a son butin
  (objets du quotidien, pièces, nourriture, outils, parfois un objet rare) et souvent des lettres et papiers intimes qui
  racontent les habitants (onglet Lettres de la sacoche). Chez quelqu'un, c'est voler : vu, l'amitié chute et le garde
  accourt ; pas vu, l'habitant se plaint le lendemain. Certains meubles ferment à clé (une clé trouvée ou volée, ou les
  crochets). Sept **cachettes** n'apparaissent qu'à qui a lu le bon papier. Tout se remplit avec le temps.
- **Des choses à faire** : à Valbrume, les dés et le vingt-et-un de l'auberge (gare aux dés pipés), le bras de fer, la
  tournée payée, la veillée du Veilledi (contes au coin du feu), le tableau des petits travaux de la mairie, le puits aux
  souhaits, la diseuse de bonne aventure (qui lit l'almanach), le crieur public, le violoneux des rues, la vue du clocher,
  les cierges, les tombes qu'on fleurit, les étals du Marchedi (brocanteur, curiosités, grainier des Monts, fromagère) ;
  à Clairpré, le jeu de quilles, le four banal et la tombola du Foiredi ; ailleurs, le concours de tir du Chassedi au
  relais de chasse et le concours de pêche du Pêchedi au ponton.

**Chasse et attelage**
- **Fusil de chasse à lunette** (le chasseur le vend, ou on le fabrique) : bouton droit maintenu pour viser (la respiration
  fait danser le réticule, Maj retient le souffle), clic pour tirer, une cartouche par coup. Les bêtes abattues se dépècent
  (E), une bête blessée fuit en saignant.
- **Pièges à loup** : ils prennent les bêtes, les habitants… et le joueur distrait (E pour se dégager).
- **Bêtes dangereuses** : ours et sangliers attaquent rarement, quand on les menace. Le Chassedi, les chasseurs battent les
  bois : coups de feu au loin, pièges, et parfois l'accident (pris pour un gibier).
- **Charrette** : un harnais, un cheval (ou un âne), E sur la charrette : elle suit comme une remorque et se charge.

**Savoir**
- **Livres** (chez les colporteurs, le bibliothécaire…) : bestiaire, herbier, livre des poissons (avec ce qu'on a vu ou
  pris), sciences, manuels (qui enseignent des recettes), et les livres de la bibliothèque (histoire, légendes, secrets).
- **La grande bibliothèque** du plateau : on emprunte un livre ou une carte pour 1, 3 ou 7 jours, en payant d'avance.
  En retard, le bibliothécaire devient un **sorcier** et vous traque où que vous soyez. Un passage caché mène aux archives.
- **Deux langues perdues** : l'**aëlin** (les Hautes Lettres des Aëlim, en colonnes) et le **gorrain** (les cupules des
  Gorr, le peuple des géants). Des stèles gravées partout ; on apprend les mots dans les lexiques, auprès du bibliothécaire,
  de l'ancien des nains ; les inscriptions se traduisent à mesure. Onglet « Langues » dans la sacoche.

**Lieux**
- **Les Sources** : un village de naturistes autour de sources chaudes (on s'y baigne : soin, chaleur, apaisement).
- **Le village caché des nains**, sous la falaise de la Combe : il faut savoir frapper (trois coups, un, trois).
- **Le camp des géants** sur les hauteurs de l'est : trois géants paisibles, qui parlent gorrain.
- **Le temple sous la montagne**, immense, derrière la cascade où naît la rivière : la porte des Trois, les autels, le
  Dormeur, le tombeau des Aëlim, des coffres qu'il vaut mieux ne pas vider.
- Le relais de chasse, l'échoppe de l'alchimiste, le campement des colporteurs.
- Chaque milieu a ses plantes et ses bêtes, communes ou rares (chamois, lièvres blancs, lagopèdes, castors, salamandres,
  cistudes, martres, aigles…) ; des dizaines de poissons nouveaux selon les eaux (douves, sources chaudes, lacs
  souterrains, bassin du temple).

**L'étrange, encore**
- **Nuits noires** (l'almanach les prédit) : plus aucune lumière au ciel, et des murmures ; une voix vous appelle — il ne
  faut pas répondre. **Neige** possible sur toute la vallée. **Soleil écrasant** : le regarder laisse une tache noire.
  **Tornades**, très rares. Et d'autres prodiges : étoiles filantes, aurore, éclipse, grêle, tremblement de terre, mur de
  brouillard, feux follets, cloches, météorite, pluie de grenouilles, un géant sur la crête à l'aube…
- **L'homme au long manteau**, très rare : il passe une nuit, tue une fois (un habitant resté dehors, ou vous), et disparaît.
- **La lavandière** du lavoir, qui surgit certaines nuits. **Malédictions** (malchance, faim, bêtes qui fuient, sommeil sans
  repos, pourriture, le poids, l'ombre qui suit) : on les lève par l'eau lustrale, le curé, la guérisseuse, ou l'un des Trois.
- **Les Trois** : Aëla l'Aube, Durn la Pierre, Vesh la Nuit noire. Dans de très rares cas, ils viennent sur le monde ou
  prennent contact (rêves, voix, apparitions).
- **Pilules de joie**, un peu partout : la vallée devient le **pays des bonbons**… puis vient la retombée dans les
  **Ténèbres**, d'autant plus dure qu'on en abuse. **Cauchemars** très rares, où l'on est poursuivi. Qui a tué dix
  personnes de sa main ne meurt pas tout de suite : il descend aux **Enfers**, où l'on ne peut pas manger.
- **Objets légendaires et mythiques** (quinze, uniques) ; dans une partie sur cinq cents, **l'Homme long** hante les bois ;
  dans une partie sur cent vingt, un **complexe de la Fondation** — des humains venus du futur étudier les bizarreries de la
  vallée — est caché sous la lande (la Fondation SCP est une création collective sous licence CC BY-SA 3.0 :
  https://scp-wiki.wikidot.com ; les textes du jeu sont originaux).
- **Cinématiques** : l'arrivée dans la vallée, le temple, les Trois, la tornade, le tueur… (Espace pour passer).

### Mode Création

Éditeur de monde séparé : relief, peinture du sol, objets, animaux, blocs. **Exporter** télécharge un fichier
`.prairie.json`, rechargeable avec **Importer**.

## Modifier le code

Les sources sont dans `src/` (triées par nom = ordre de chargement) :

| Fichier | Rôle |
| --- | --- |
| `00-util.js`, `01-gl.js` | maths, bruit, stockage, aide WebGL 2 |
| `02-textures.js` | textures procédurales (sol, blocs) |
| `03-sprites*.js` | sprites (décor, anciens animaux, icônes d'objets, outils en main) + atlas |
| `04-defs.js`, `05-farm-defs.js` | objets du décor ; objets, cultures, poissons, recettes |
| `05-npc-data.js` | les douze habitants : répliques, quêtes, routines ; notes à trouver |
| `05-zzlife-*.js`, `05-zzlore.js` | leur vie (histoire, questions, conversations…) ; légendes, fois, inscriptions, rêves |
| `05-zzhooks.js` | points d'accroche des systèmes ajoutés (interactions, image, jour, rendu…) |
| `05-world.js` | données du monde, collisions (portes, ponts-levis), abris, sérialisation |
| `06-structures.js`, `06-zfarm-structures.js` | maisons, église, mine ; ferme, ville à douves, hameau, lieux-dits |
| `06-worldgen.js`, `06-zgen-valley.js` | générateurs : mode Création ; la Vallée |
| `07-models.js`, `07-shaders.js`, `08-renderer.js` | modèles 3D en boîtes (habitants, bêtes, objets), shaders, rendu |
| `09-audio.js`, `09-zaudio-farm.js` | sons procéduraux, ambiances par biome |
| `10-*.js` | créatures (comportements), joueur, météo |
| `11-farm-*.js` | état et sauvegarde de la partie ; actions du joueur |
| `11-npc.js` | routines, chemins, portes, mémoire, dialogues, quêtes, livraisons |
| `11-strange.js` | événements étranges, tueur, nuits rouges, l'Envers, versions du monde |
| `11-editor.js`, `12-ui.js`, `12-zui-farm.js` | éditeur ; menus ; panneaux papier (dialogues, sacoche, boutique) |
| `11-zz*.js` | pelle et grottes, terraformage, chantiers, chevaux sauvages, alchimie, prière, légendes, panneaux, apparitions en plus, vie des habitants |
| `05-zzcrops-more.js`, `07-zzmodels-crops.js`, `03-zzsprites-crops.js` | nouvelles plantes et variétés : données, modèles 3D (gabarits), icônes |
| `06-zzgen-wonders.js`, `06-zzgen-towns.js` | nouveaux lieux et secrets ; décor des villes et villages (ajoutés après le reste : les sauvegardes restent valables) |
| `06-zzdesign.js` | **la grande vallée dessinée** : plan (contour, montagnes, arêtes, cuvettes, collines, lacs, rivières, lieux, chemins, zones, sigles), relief en deux passes, ponts, piste du col |
| `06-zzgen-deep.js`, `06-zzgen-flora.js` | les Galeries (labyrinthe), refuge, cairns, lac gelé, crevasses, sigles ; arbres et fleurs de chaque milieu |
| `02-zztextures-snow.js`, `03-zzsprites-flora.js`, `05-zzflora.js`, `05-zzworld.js`, `07-zzmodels-world.js` | neige, glace, falaise ; sprites et données des arbres et fleurs ; poissons et butins de la montagne ; ponts, sigles, cairns, étais… |
| `11-zzvallee.js` | la vallée vivante : crues, foudre, incendies, neige et froid, signes, refuge, pêche sous la glace |
| `12-zzui-feed.js` | ce qu'on ramasse (liste discrète à droite) |
| `13-main.js` | modes, boucle principale, interactions, journées |
| `05-zzz*.js` | espèces par milieu et rareté, notices, poissons, essences d'alchimie, langues perdues, livres, objets et habitants nouveaux |
| `06-zzzgen-lieux3.js` | lieux nouveaux (bibliothèque et archives, Sources, relais de chasse, roulottes, halles des nains, camp des géants, temple, échelles des douves) et peuplement des milieux |
| `07-zzzz-modeles.js`, `07-zzzzz-personnages.js`, `07-zzzzzz-mondes.js` | modèles nouveaux ; personnages anguleux façon 1996 (boîtes effilées dans le shader) ; modèles des autres mondes |
| `11-zzz00-socle.js` | socle commun : jour de 10 min et nuit de 10 min, savoirs du personnage, chutes, jambe cassée, saignements, pentes, cinématiques (`cine`), zones où l'on ne bâtit pas, `bizarrerie()` |
| `11-zzz02-*.js`, `11-zzz03-*.js` | alchimie à l'aveugle et plantes à faire nommer ; fabrication par assemblage |
| `11-zzz2*.js` | livres, grande bibliothèque et sorcier, langues perdues, cartes approximatives |
| `11-zzz3*.js` | fusil à lunette, dépouilles, pièges à loup, bêtes dangereuses, chasseurs ; charrette attelée |
| `11-zzz4*.js`, `12-zzzD-*.js` | événements (nuits noires, neige, soleil, prodiges), les Trois, malédictions, temple, cinématiques ; tornade, tueur, lavandière |
| `11-zzz5*.js` | société (mort définitive, avis de recherche), Sources, nains, géants, semaine de chacun |
| `11-zzz6*.js` | mentalité, ce qu'on mange, le chien, l'alcool |
| `11-zzz7*.js` | autres mondes : pays des bonbons, Ténèbres, cauchemar, Enfers |
| `11-zzz8*.js` | objets légendaires et mythiques, l'Homme long, la Fondation |
| `11-zzz9*.js` | vol à la tire, prison (cachot, rançon, carrière, évasion), sentiments ; sommeil et fatigue, lits, maisons à louer, crochetage et poterne, fouilles et cachettes, activités des villes et villages |
| `07-zzzzzzz-portes.js` | les portes (modèles selon le bâtiment, trois niveaux de détail) |
| `14-i18n.js`, `14-i18n-en.js` | traduction anglaise (bascule à chaud) et ses données |
| `tools/` | `i18n-extract.js`, `i18n-delta.js`, `i18n-build.js` (vagues de traduction) ; `wiki-build.js` (génère `Prairie-Wiki.html`) ; `equilibrage.js` (mesures et vérifications d'équilibrage, voir plus bas) |
| `shell.html` | HTML + CSS |

Après une modification, régénérer le fichier unique :

```bash
node build.js
```

Si vous modifiez le générateur de la Vallée, incrémentez `VALLEY_GEN` : les sauvegardes reposent sur la graine
et l'ordre des objets générés. `generateValley(graine, …, gen)` reçoit la version de la sauvegarde : la version 1 garde
la ferme complète d'origine, la version 2 ne bâtit que la maison et le champ (en consommant le même tirage, pour que le
reste de la vallée soit identique), la version 3 lit le plan de `06-zzdesign.js` (graine fixe : la même vallée pour tous ;
la graine de la partie ne règle plus que le temps, les habitants et l'étrange). Les passes ajoutées ensuite (fleurs,
sigles…) viennent après tout le reste, avec leur propre tirage : les numéros des objets des anciennes vallées ne bougent
pas. Le relief creusé et les constructions sont enregistrés à part et rejoués au chargement.

Pour retoucher la grande vallée : tout est dans `VALLEY_DESIGN` (coordonnées en mètres, nord = −z ; la partie « cœur »
est décalée de `DESIGN_OFF`). Changer ce plan change la carte des parties déjà commencées en version 3.
