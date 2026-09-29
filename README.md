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
  Ça pousse **en heures** (un radis en 8 h de jeu, moins de 7 minutes ; une citrouille en 40 h, deux journées), même la nuit.
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
- **Les corps restent au sol** : un habitant tué (par vous, par le tueur, par l'ours, par la fièvre…), le chien, un
  chasseur de primes abattu restent couchés là où ils sont tombés — dans l'herbe, dans la rue, dans leur lit —, sauvegardés
  d'une journée à l'autre, jusqu'à ce que quelqu'un les enterre. Et personne ne le fera : dans la vallée, on ne relève pas
  les morts. On grave leur nom au cimetière, sur une tombe vide ; la maison est mise sous scellés ; le corps, lui, attend.
- **Les jours passent sur eux**, sobrement : pâles le jour même, couleur de cire le lendemain, puis des restes affaissés,
  puis des os dans des vêtements vides. Les mouches, le jour ; les corbeaux s'y posent quand on arrive de loin.
- **E sur un corps** : fouiller ses poches (des pièces, les objets de son métier, parfois ce qu'une quête cherchait ; le
  menu de butin permet de choisir). Sous les yeux d'un habitant, c'est une **profanation**. **Avec une pelle**, on
  l'enterre là où il est tombé : un tertre et une croix de deux bâtons liés (sur les pavés, on le traîne jusqu'à la terre
  meuble ; sur la roche ou sous la montagne, un tas de pierres ; mort dans son lit, on le porte dehors). Un clic de pelle
  sur le corps fait de même. E sur la croix : le nom qu'on y a gravé. Le chien s'enterre à mains nues.
- **Les habitants qui voient un corps** s'arrêtent, se signent, reculent ; ils crient, ou prient, ou appellent le mort par
  son nom — et en parlent les jours suivants. Ceux qui vous voient l'enterrer vous remercient, ses proches l'apprennent.
- **Le fermier d'avant** : quand vous mourez dans la vallée, votre corps reste où vous êtes tombé, pour le fermier suivant —
  vos habits, vos poches, et dans la veste la même lettre du notaire, à un autre prénom. Enterré, son tertre reste pour
  ceux qui viendront après.
- **Un géant abattu** tombe à la renverse et reste là, long comme une grange ; il passe par les mêmes jours, deux fois plus
  lentement, jusqu'aux os longs comme des poutres. Sa besace se fouille. On ne l'enterre pas.
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
- **On choisit ce qu'on prend** : chaque conteneur ouvre un **menu de butin** (armoires, commodes, malles, coffres,
  tonneaux, caisses, sacs, étagères, tiroirs, charrettes, cachettes, coffres des ruines, des campements, des épaves, du
  temple et des archives, casiers de la Fondation, coffre du greffe, coffres qu'on déterre, et ce qu'on ouvre en main :
  coffre englouti, caisse de vivres, sac de graines). Chaque objet y a son icône, sa quantité et une courte description ;
  un clic prend la pile, Maj+clic ou −/+ une quantité choisie, « Tout prendre » le reste (clavier : flèches, Entrée,
  1 à 9, T ; E ou Échap referment). Ce qu'on laisse **reste dedans**, même après avoir rechargé la partie, jusqu'à ce
  que le conteneur se remplisse de nouveau. Un papier trouvé se lit en refermant.
- **Tout meuble se fouille** : en plus des cent endroits d'avant, près d'une centaine de meubles de la vallée — étagères des
  maisons et des boutiques, tiroirs des tables, tonneaux, caisses et sacs, wagonnets et caisses des galeries, tas de bois,
  charrettes abandonnées, caisses de la crypte… Le butin dépend du meuble et du lieu (le pain à la boulangerie, les
  timbres à la poste, les semences chez la grainetière, les bocaux chez l'alchimiste, le minerai à la mine, les
  souvenirs des maisons vides) ; chez quelqu'un c'est à lui, dans la rue à tout le monde, dans les ruines à personne.
- **Le vol, finement** : ouvrir chez quelqu'un sous les yeux d'un témoin (le menu le dit : « … vous regarde ») puis
  refermer sans rien prendre, c'est un soupçon — une remarque, un peu d'amitié en moins. Prendre, c'est voler : les cris,
  le garde, la prime ; pas vu, la plainte du lendemain. Au temple, la malédiction tombe au premier objet pris, pas avant.
- **La boutique** : la liste ne remonte plus en haut après un achat ou une vente. Un clic sur un article ouvre un encart :
  sa description, le prix à l'unité, ce qu'on en a déjà, la quantité (−/+, saisie, « Maximum »), le total, puis
  « Confirmer » ou « Annuler » (Entrée, Échap) — pour vendre aussi. Un article trop cher s'ouvre quand même, pour le
  lire (« Il vous manque… »). Maj+clic et Ctrl+clic achètent ou vendent toujours par 5 et par 20 ; « Tout vendre » reste.
- **Ramasser** : E sur un petit objet posé le met dans la sacoche — bougies, lanternes (au sol, suspendues, grandes),
  chaises, pots de fleurs, nains de jardin, citrouilles, tapis (on le roule), livres (un « livre abîmé »), poupées,
  ossements, sacs de grain (un clic en main l'ouvre : blé, avoine, orge, seigle). Ce qui se pose se repose ensuite où
  l'on veut. Chez quelqu'un, dans une boutique, à l'église ou devant sa porte, c'est voler, et l'étiquette le dit
  (« chez Mathilde », « devant chez quelqu'un »). Les meubles et les conteneurs restent au menu de butin ; ce qui a
  déjà un usage le garde.
- **Tout se casse, avec le bon outil** : le bois à la hache (meubles, caisses, tonneaux, lits, clôtures, charrettes,
  barques, ruches, étais des galeries…), la pierre et le fer à la pioche (statues, calvaires, tombes, murets,
  abreuvoirs, cairns, meules, réverbères ; l'enclume et le coffre-fort veulent une pioche de fer), la poterie, le
  verre, la paille et la toile avec n'importe quel outil. Le mauvais outil rebondit (« Du bois : il faudrait une
  hache. »). Plusieurs coups selon la solidité et l'outil : des fêlures là où l'on frappe, des éclats qui volent et
  retombent, de la poussière, un bruit pour chaque matière. Il reste des débris trois jours, et l'on récupère des
  matériaux : bûches, clous, pierres, ferraille, éclats de verre, argile, toile, corde, foin… Ce qu'on a posé soi-même
  se casse aussi (le marteau, lui, le démonte toujours) ; ce qui est cassé le reste, même après avoir rechargé la partie.
- **Ce qu'il y avait dedans tombe** : une armoire, une malle, un tonneau, un coffre ou une charrette chargée qu'on
  casse répandent leur contenu au pied des débris (les objets y restent posés, bien visibles) ; E ouvre le menu de
  butin sur « Ce qui est tombé ». Ce qu'on y laisse attend trois jours. La fouille du meuble disparaît avec lui.
- **Enfoncer une porte** : à la hache, fermée à clé ou non, une porte de maison, de boutique ou de roulotte cède au bout
  de quelques coups (bien plus pour la mairie, la garde, l'auberge, la bibliothèque). Arrachée de ses gonds, elle gît à
  plat derrière le seuil, la serrure pendante, et ne se referme plus, jusqu'à ce que l'habitant la fasse réparer, trois
  jours plus tard. Les coups s'entendent de loin, et réveillent ceux qui dorment. Ni la ferme, ni l'église, ni la
  poterne, ni le temple, ni le cachot.
- **Casser a des suites** : chez quelqu'un, c'est une **effraction** ; devant chez lui, dans une boutique, en ville ou au
  cimetière, un **vol**. Vu ou entendu : les cris (« Mes meubles ! Vous êtes fou ?! »), l'amitié qui s'effondre, le
  garde qui accourt, la prime. Pas vu : la plainte du lendemain (« On a enfoncé ma porte, cette nuit. À la hache. ») et
  la mentalité qui baisse. Dans les ruines, on ne vole personne, mais un passant le prend mal. Une tombe ou une croix
  brisée, c'est une **profanation**, et ce qui dort dessous s'en souvient (le sommeil ne vient plus) ; abattre une
  croix de chemin porte malchance, jusqu'à ce qu'on s'en confesse au curé.
- **Ce qui ne se casse pas** : ce qui porte une quête ou un mécanisme — pierres, autels et portes du temple, dormeur,
  bornes gravées, stèles, cachettes, affiches, étals du marché, tombes neuves, lit et coffre de la ferme, charrette
  attelée, niche et gamelle du chien, écriteaux « À louer », machines au travail (on attend qu'elles aient fini) —, le
  cachot, les bâtiments, le terrain, les arbres et les rochers (qui ont déjà leurs outils).
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

## Équilibrage

Le jeu a été équilibré d'un bloc, en mesurant d'abord : chaque système avait été écrit avec ses propres nombres, et
la journée de vingt minutes (dix de jour, dix de nuit) changeait tous les rythmes. Quatre domaines, chacun avec sa mesure
et ses vérifications dans `tools/equilibrage/` : le jeu entier est chargé dans une machine virtuelle node (sans
navigateur, `tools/equilibrage/vm.js`), ses propres fonctions calculent les rendements, les espérances et les
fréquences, et la commande échoue si l'on recasse un équilibre :

```bash
node tools/equilibrage.js                 # les quatre domaines (≈ 3 min)
node tools/equilibrage.js commerce        # ou un seul : commerce, risques, survie, hasard
```

Aucun réglage ne touche à la génération de la vallée : les anciennes parties retrouvent leurs objets (l'empreinte des
98 896 objets, 1 308 objets posés et 516 interactions d'origine de la graine 1234 est vérifiée : `empreinte(w, n)`).

### Commerce et rendements

**Le constat.** Avec la journée de vingt minutes, tout ce qui se récolte rapportait dix à trente fois trop face aux
coûts du jeu (poule 150, vache 900, cheval 2 500, loyer 84 la semaine) : un champ de radis ≈ 3 800 pièces par jour,
la pêche ≈ 3 000, le bassin du temple ≈ 16 000, un cochon ≈ 460 ; soixante achats-reventes étaient gagnants (lingot
d'acier acheté 123 à la forge, revendu 198 ; plan de grange 1 100 → 1 200 à la caisse), la table d'alchimiste faisait
des potions à 45 avec trois baies achetées 8, et les lentilles récoltées devenaient des « lentilles de verre » à 60.

**Les cibles.** On garde les coûts (ce que tout le monde voit en boutique, les quêtes, les amendes) et l'on ramène la
production à leur échelle. Une journée entière de travail honnête rapporte **≈ 300-450 pièces au début**,
**≈ 1 000-2 000 au milieu** (outils de fer, bêtes, grand champ), **≈ 3 000-5 000 plus tard** ; se nourrir coûte
≈ 35-45 par jour. Une activité pratiquée à plein rend ≈ 0,3-0,5 pièce par seconde au début, ≈ 1 au milieu,
1,5-2,5 dans les coins rares. Une bête se rembourse en une dizaine de jours. **Aucun achat-revente gagnant, jamais**,
ni en fabriquant, distillant ou mêlant à la table d'alchimiste ce qu'on a acheté.

**Les règles de prix.** Le prix d'un objet (`ITEMS[…].price`) est ce que paient la caisse et les marchands.
- Ce qu'on récolte est réglé sur ces débits (cultures : 3 à 6 pièces de marge par case et par jour, graines déduites).
- Bois, pierres, fibres, foin, terre, sable ne se revendent plus (il y en a partout) ; le charbon vaut 1.
- Ce qui se fabrique ou se transforme vaut ses ingrédients × 1,15 à 1,35 (la recette la moins chère fait foi).
- Ce qu'on ne fait qu'acheter se revend moitié prix ; trésors et curiosités : moitié de l'ancien prix.
- Garde-fou dans `ui.shopPrice` : on n'achète jamais au prix où l'on pourrait revendre ailleurs (caisse, marchands au
  mieux de l'amitié, marchand de joie) ; les tables d'étal le rendent de toute façon inutile.

| Réglage | Avant | Après |
|---|---|---|
| Pousse des cultures (terre humide) | radis 2 h, chou 6 h, citrouille 10 h | × 4 : 8 h, 24 h, 40 h ; repousse × 6 |
| Prix des récoltes | radis 8, carotte 12, chou 32, citrouille 85, tomate 14 | 3, 6, 19, 36, 2 |
| Pêche : touche | 3 à 11 s (sous la glace : 5 à 15 s) | 8 à 28 s partout ; coffre englouti 4 % → 1 % ; perle 1,5 % |
| Concours de pêche : prises des habitants | pêcheur 55-130 … | au quart, comme les poissons (pêcheur 14-33) |
| Poissons | carpe 30, brochet 70, silure 120, reine du lac 900, poisson aveugle 250 | 8, 18, 27, 200, 25 |
| Bêtes : heures entre deux produits | poule 7, vache 9, mouton 14, cochon 7 | 16, 12, 36, 20 (≈ 2 œufs, 3 traites par jour) |
| Produits des bêtes | œuf 15, lait 30, laine 45, truffe 160, miel 70 | 7, 22, 30, 50, 5 |
| Cueillette | fleur 6, champignon 14, herbes 18, pomme 10, edelweiss 150 | 1, 2, 3, 1, 10 ; plantes rares par rareté 1-25 |
| Chasse | viande 25, cuir 30, fourrure 70, bois de cerf 90, trophée 180 | 5, 6, 12, 20, 60 |
| Minerais et lingots | cuivre 12/50, fer 20/80, acier 180, or 45/220, gemme 300 | 4/15, 7/25, 61, 16/56, 80 |
| Potions | 60 à 400 | 10 à 60 |
| Arbres secoués | 1-3 pommes ; un nid 45 % du temps | 0-2 pommes ; 15 % |
| Étals relevés | sel 5, baies 8 (guérisseuse), fromage 25 (auberge), géode 35 (Marchedi) | 10, 12, 60, 45 |
| Loyers en ville (semaine de 12 jours) | 84 / 96 / 120 | 150 / 170 / 210 (la chambre de l'auberge : 20 la nuit) |

| Mesure (par jour de jeu) | Avant | Après |
|---|---|---|
| Champ de départ (54 cases) | ≈ 3 800 | ≈ 260 |
| Pêche, grand lac, canne de base | ≈ 2 900 | ≈ 310 (≈ 200 mesurés en jeu sur 16 prises) |
| Bassin du temple, canne de fer | ≈ 26 000 | ≈ 1 600 |
| Cueillette mêlée près de la ferme | ≈ 1 500 | ≈ 280 |
| Bois (0,28 pièce/s), rochers (0,54 /s) | 2,8 /s, 3,2 /s | |
| Poule / vache / cochon | 77 / 120 / 460 | 16 / 66 / 50 |
| Achats-reventes gagnants ; transformations d'achats gagnantes | 60 ; 29 | 0 ; 0 |

**Relancer la mesure.** `node tools/equilibrage.js commerce` (≈ 70 s : la vallée est générée pour mesurer la densité
des plantes et des arbres ; `EQ_RAPIDE=1` s'en passe). L'outil inventorie tous les points d'achat et de vente (étals,
graineterie du jour, hottes des colporteurs, reprises, étals du Marchedi, marchand de joie, recel, caisse), cherche les
achats-reventes et les transformations gagnantes (recettes, machines, alambic, 6 000 mélanges de la table
d'alchimiste), modélise les revenus de chaque activité avec les gestes et délais du jeu, et échoue si un rendement sort
de ses bornes (`CIBLES`), si une table d'étal repasse sous la revente ou si un loyer devient dérisoire.

### Les risques : l'argent du crime et du hasard, et ses peines

Mesuré par l'outil (`tools/equilibrage/risques.js`, ≈ 1 min : la vallée de la graine 1234 est générée pour compter
coffres, fouilles et points à creuser), avec les vraies tables et formules du jeu. Toutes les sommes sont aussi
exprimées en jours de revenus honnêtes (échelle du commerce : 250-400 pièces par jour de jeu au début, 1000-1500 au
milieu, 2000-4000 ensuite ; une journée dure vingt minutes). Un objet trouvé vaut son prix ; un objet qui s'ouvre
(coffre englouti, géode) vaut son contenu ; une carte au trésor vaut son trésor.

**Cibles**
- Le crime peut tenter, il ne paie pas : risque compté (amende, amitié perdue), faire les poches ou fouiller chez
  quelqu'un rapporte moins que le travail ; seules quelques belles occasions (la cave de l'auberge, la nuit, tous les
  deux ou trois jours) valent le détour, jamais plus, à la minute, que le travail du milieu de partie.
- Des peines proportionnées : l'amende d'un vol vaut une demi-journée des débuts, un meurtre trois jours ; la rançon
  est lourde mais payable (la prime, les jours rachetés, un dixième de la bourse) et baisse avec la peine qui reste ;
  la plus longue peine se fait en moins de trois minutes réelles en dormant sur la paille (la carrière compte double).
- Les trésors récompensent l'exploration une fois : un coffre de tombe, de temple, de crevasse ou du clocher englouti
  est plein à la première ouverture, puis il n'y revient que de la poussière ; les coffres que des vivants regarnissent
  (campements, charrettes, contrebandiers, mines) rapportent peu à la tournée.
- La maison gagne, modérément : vingt-et-un −2,6 % au mieux, tombola −25 % ; le passe-dix entre habitués est égal.
- Emprunter ne décourage pas : 10 à 20 pièces le jour pour un livre ; une carte empruntée sept jours coûte moins de
  la moitié de son prix.

**Réglages (avant → après)**

| Réglage | Avant | Après |
|---|---|---|
| Tournée des coffres du temple (tous les 3 jours) | ≈ 1 400 pièces / jour (la malédiction se levait pour 300) | pleins une fois, puis ≈ 35 |
| Tournée de tous les coffres ordinaires | ≈ 3 200 / jour | ≈ 1 000 / jour (le plus riche des lieux : 157) |
| Carte au trésor (trésor) ; étal des curiosités | ≈ 820, achat à 70 sans limite | ≈ 235 (trois ou quatre trouvailles, 60 à 160 pièces) ; une pièce de chaque par semaine |
| Coffre englouti (4 % des prises à la pêche) | ≈ 430 | ≈ 125 |
| Terre remuée du jour (neuf trous) | ≈ 500 / jour | ≈ 250 / jour |
| Fouilles : cave de l'auberge, tonneaux, étals | un casier 224, un « pichet » 124, un étal 76 | 179, 71, ≤ 51 (une chose) |
| Maisons des disparus (armoires, malles) | se regarnissaient en 3-4 jours | en 12 à 16 jours |
| Primes : vol, effraction, agression, meurtre | 45, 50, 60, 350 | 150, 150, 200, 900 (récidive jusqu'au double) |
| Oubli d'un vol, d'un meurtre (sans récidive) | 10, 45 jours (3 h, 15 h de jeu) | 6, 30 jours (2 h, 10 h) |
| Chasseurs de primes ; le garde à la ferme | dès 150 ; dès 90 | dès 500 ; dès 250 |
| Rançon d'un premier vol ; d'un meurtre | 80 ; 615 | ≈ 315 ; ≈ 2 100 (baisse chaque jour) |
| Faire sa peine | le geôlier ne disait pas qu'on peut dormir ; pain +25 | il le dit (quelques secondes réelles par jour) ; la faim remonte à 60 au moins chaque matin |
| Poche réussie | ≈ 35 | ≈ 42 (risque compté : toujours perdant) |
| Crochetage vu par un passant | 12 % par demi-seconde, où qu'il regarde | de dos : le cinquième, de côté : la moitié |
| Tombola | billet à 5 pour un lot moyen de 15 (+ 200 %) | billet à 8 aux nouveaux prix du commerce (rend 75 %) |
| Concours de pêche | scores tirés au hasard ; toutes les prises comptaient | les habitants pêchent dans le lac ; prises du lac seules ; gagné ≈ 1 fois sur 5 |
| Carte empruntée 7 jours | ≈ 90 % du prix d'achat | ≈ 45 % |

**Où sont les réglages.** `LOOT` et `LOOT_RESTE` (05-zfarm-content.js : tables de butin, trésors qui s'épuisent,
`rollLoot`), les butins ajoutés de 05-zzitems-more.js (carte au trésor, contrebandiers) ; `CRIME_DEF` et les seuils de
`societe.jour` (11-zzz50-societe.js), l'évasion (11-zzz91), l'effraction et l'intrusion (11-zzz97) ;
`prison.peine`, `prison.prixRancon`, `prison.majRancon`, la ration (11-zzz91-prison.js) ; `VOL_POCHES`
(11-zzz90-vol.js) ; les tables `f2_*`, `F2_TYPES` et `fouilles.refill` (11-zzz98-fouilles.js) ; le crochetage
(`CROC_*`, le passant qui regarde, 11-zzz97) ; `BIBLIO` et `biblio.catalogue` (11-zzz21) ; `activites.BILLET`,
`activites.piece`, `activites.prisesPNJ` (11-zzz99-activites.js).

**Relancer la mesure.** `node tools/equilibrage.js risques` affiche les tableaux (espérance par tentative et par
minute réelle de chaque activité risquée, risque compté) et échoue si l'on recasse l'un de ces équilibres (un trésor
scellé qui se regarnit, une carte qui rapporte une fortune, une amende de vol hors de la demi-journée, une tombola qui
rend plus qu'elle ne coûte, un étal qui vend à la chaîne, un crime plus rentable que le travail…).

### Survie : le corps et l'esprit du personnage

Mesuré avec la journée de 20 minutes (10 min de jour, 10 min de nuit : une heure de jeu = 50 s). Le vrai code du
jeu tourne dans l'outil (`tools/equilibrage/survie.js`) : un joueur factice dans un monde plat, et les vraies
fonctions (`play.updateBody`, `play.nuit`, `Player.update` et `corps.chute`, `entities.wolfAI`, `chasse.charger`,
`vallee.update`, `evNeige.update`, `effets`, `alcool`, `esprit.update`, `sommeil.update`). Le hasard est tiré à
graine fixe : les chiffres sont reproductibles.

**Cibles, et pourquoi**

- *Manger* : trois vrais repas par jour (≈ 70 de faim par journée, nuit comprise : 3,5 pains, 2,3 soupes ou
  1,4 ragoût). La cuisine compte : un poisson cru nourrit cinq fois moins qu'un poisson grillé.
- *Mourir de faim* : ni d'un coup, ni sans conséquence. Rassasié, on tient 30 h debout sans manger ; le ventre
  vide, la vie s'en va en une demi-journée (12 h de jeu, 10 min réelles) ; des premiers gargouillis à la mort,
  environ une journée. Dormir ne sauve plus de la faim.
- *La vie qui remonte* : 2,5 PV par heure debout le ventre plein, 5 en dormant : une nuit et une demi-journée
  pour se remettre d'un grand coup (30 → 100 PV). Une vraie plaie ne guérit pas en dormant : il faut un bandage.
- *Le temps de réagir* : aucune bête ne tue d'un seul coup quelqu'un en pleine santé ; une meute laisse au moins
  10 s après la première morsure (lanterne, feu, abri) ; les ours menacés tuent parfois (un tiers), moins si l'on
  fait le mort ; le froid tue en quelques heures de jeu, pas en quelques minutes. Restent d'un coup, voulus : le
  tueur, le géant, le bibliothécaire, les Pâles, la balle du chasseur (un quart du temps), une chute de 12 m.
- *La mentalité* bouge vraiment petit à petit : une journée ordinaire la garde haute (≈ +6), les méfaits, la
  chasse et les nuits dehors sans lumière la font glisser en jours, la fatigue plus vite encore (voulu) ; elle
  remonte de 30 à 60 en trois à cinq jours, plus vite avec les quêtes, la prière, les bains, les veillées.

**Réglages (avant → après)**

| Réglage | Avant | Après |
|---|---|---|
| Le ventre vide (11-farm-play.js, `CORPS_JOUR`) | −0,25 PV/s : mort en 8 h de jeu | −200 PV par journée : mort en 12 h |
| La nuit (`play.nuit`, appelée par `game.sleep`) | +40 PV, −18 de faim, quelle que soit la nuit | 5 PV et 2,25 de faim par heure dormie ; le ventre vide, pas de soin et la faim ronge (réveil à 5 PV au moins) ; une plaie ouverte empêche de guérir, une égratignure se referme |
| Dormir sans manger, trois nuits de 12 h | 100 → 100 → 100 PV (on survivait en dormant) | 100 → 5 → 5 PV |
| Loups (10-entities.js) | la meute tue en 7 s après la 1re morsure, jusqu'à 84 PV en 5 s | le loup recule 2 à 4 s après avoir mordu, la meute ne mord qu'un loup à la fois (1,8 s) : 17 s en moyenne (au pire 14 s), 42 PV en 5 s au plus ; un loup seul : 22 → 44 s |
| Ours : faire le mort (11-zzz30-chasse.js) | sans effet (l'immobilité était lue après le recul du coup) | marche : mort 30 % → 7 % en pleine santé |
| Froid de la montagne (11-zzvallee.js) | 1 PV/s : mort en 2 h de jeu | 0,5 PV/s : 4 h |
| Froid d'un jour de neige (11-zzz40-evenements.js) | mort en 2,3 h | 4,2 h |
| Grêle, toute l'averse dehors (idem) | 43 PV | 21 PV |
| Accident de chasse (tapi à portée, le Chassedi) | 1/700 par seconde réelle : 11 %/h de jeu | 3,5 % par heure de jeu (× 1,4 accroupi) : 5 %/h, comme avec la journée de 10 min |
| Anguille crue (11-zzz61-nourriture.js) | poison fort : tue 13 % du temps (48 % affamé) | poison léger : 1 à 2 % |
| Mentalité, journée ordinaire (11-zzz60-esprit.js…) | +13/jour (100 en deux jours ; les méfaits n'y changeaient rien) | ≈ +6/jour |
| Mentalité, méfaits / chasse / nuit dehors sans lumière | +1 / +4 / +10 par jour | −5,6 / −2,2 / +3,8 par jour |
| Apports de la mentalité | sommeil 4 (auberge 3), soleil 0,35/h (plafond 4), bon repas 1,2 (3,6), chien 1,5 + caresse 0,7, verre 0,8 (2,4) ; hausse ≤ 20/jour | sommeil 2 (1,5), soleil 0,2/h (2), bon repas 0,6 (1,8), chien 0,8 + caresse 0,4, verre 0,5 (1) ; hausse ≤ 12/jour |

Mesuré et gardé tel quel : les chutes (rien sous 3 m, la jambe peut casser dès 5 m, 12 m tuent ; jambe cassée
48 h à 40 % de son pas, 12 h avec une attelle), l'ours en furie (26–40 par coup, un tiers de morts en pleine
santé : il faut le menacer pour qu'il charge), le sanglier (35 PV, ne tue pas), la vipère, les grands poisons
(aconit ≈ 45 %, belladone ≈ 50 %, colchique ≈ 75 % de morts ; le premier effet vient en moyenne après 25 s à
3 min, le temps de chercher un antidote), l'alcool (trois gnôles d'un coup
font tomber), la noyade (33 s), la fatigue et ses effets sur l'esprit, les pilules et leur retombée, le chien
(3 jours sans manger).

**Relancer la mesure** : `node tools/equilibrage.js survie` (≈ 20 s) affiche les tableaux et échoue si une cible
est manquée (un retour aux anciennes valeurs est détecté).

### Le hasard : ce qui arrive, et combien de fois

Tout ce qui arrive par hasard pendant la partie est mesuré par semaine de douze jours de jeu (une journée : vingt
minutes réelles), sur deux cents parties simulées, en appelant les fonctions du jeu. Les fréquences suivent la
mentalité par `bizarrerie()` : un esprit clair éloigne l'étrange, un esprit en ruine l'attire, sans qu'une rareté
devienne jamais quotidienne.

**Cibles, et pourquoi.** Rien de grand les trois premiers jours (le joueur découvre sa ferme). Quelques petits
événements par semaine, pas vingt : l'étrange doit rester une touche, et le carnet des quarante-quatre étrangetés
(trois fois chacune) doit durer des mois. Les grandes nuits (noire, rouge, tueur errant) se partagent la semaine sans
devenir une routine : environ une nuit sur dix chacune pour les deux premières, un passage du tueur toutes les trois
semaines environ, jamais la première (il tue à chaque passage : plus souvent, une longue partie viderait les
villages). Les Trois restent « très très rares » : un contact (un rêve, le plus souvent) tous les deux mois environ
pour chacun, une venue sur le monde dans une partie sur quatre. Ce qui se tire au fil du temps
(lavandière, Slender, chercheurs de la Fondation, frissons de la nuit) compte en heures de jeu (`hasardHeure`) : ni
les images par seconde ni la durée d'une journée n'en changent la fréquence. Une malédiction ne tombe jamais que de la
main du joueur.

| Par semaine de 12 jours (joueur typique, esprit ordinaire) | Avant | Après |
|---|---|---|
| `bizarrerie()` selon la mentalité | 1 (esprit ≥ 70) à 3 ; 4,5 épuisé | 0,6 (100) · 1 (70) · 2,5 (0) ; jamais plus de 2,5 |
| Nuit noire (avec les imprévues) | 1 nuit sur 12, dès le 1er soir | 1 sur 10, dès le 4e soir, jamais deux de suite |
| Tornade | 1 tous les 89 jours | 1 tous les 54 jours (≈ 4 semaines) |
| Tueur errant | 1 tous les 52 j ; 113 j à l'esprit sombre (la règle de vingt jours sur les seuls tirages l'étouffait) ; dès le jour 5 | 1 tous les 37 j (45 esprit clair, 26 sombre) ; jamais avant le jour 13 |
| Nuit rouge | 1 nuit sur 5,6 (2,5 esprit sombre) | 1 sur 12,5 (19 clair, 6 sombre) |
| Événements étranges | 20 par semaine ; carnet épuisé en 5 semaines | 3,4 (2,2 clair, 8,9 sombre) ; carnet > 24 semaines |
| Lavandière (le visage qui hurle) | 1 nuit sur 14, deux jours d'écart | 1 sur 31 (45 clair, 15 sombre), quatre jours d'écart, jamais les trois premières nuits |
| Rêves des Trois | 8 % des nuits : les six rêves en six semaines | 3 % : un contact par dieu en 6 à 8 semaines |
| Venues sur le monde en 24 semaines | Vesh 57 % des parties, Durn 70 % (sans limite) | Vesh 26 %, Durn 24 % (une fois dans une vie), Aëla 5 % |
| Cauchemar | 1 nuit sur 56 | 1 sur 40 (61 clair, 18 sombre) ; jamais deux en trois nuits, ni les trois premières (hors pilules) |
| Marchand de joie | 3,6 soirs, dès le jour 2 | 1,1 soir, dès le jour 4 |
| Pâles des nuits rouges | 2 % par image | 1,2 par seconde |
| Poisson des Anciens (temple) | 1 prise sur 29 | 1 sur 89, comme les autres légendes (1/85 à 1/590) |
| Cygne de la Dame abattu par un chasseur près de vous | vous maudissait | seulement de votre main |

Inchangés, vérifiés : soleil écrasant 1 jour sur 29, neige partout 1 sur 32, prodiges 2,6 par semaine (les étranges
dès le 4e jour), deux passages de colporteurs par semaine à la ferme, Slender 1 partie sur 499,0 et Fondation 1 sur
119,7 sur le milliard de graines possibles (l'écart vient du générateur ; la Fondation est décidée à la génération :
on n'y touche pas).

**Où sont les réglages.** `EV_FREQ` (11-zzz40-evenements.js : nuits noires, soleil, neige, tornade, tueur) ;
`strange.chanceRouge()` et `chanceEvenements()` (11-strange.js) ; `bizarrerieDe()`, `BIZ_MIN`, `BIZ_MAX` et l'effet
de l'esprit sur l'étrange (11-zzz60-esprit.js) ; `lavandiere.taux()` et `ecart` ; `divins.chanceReve/Aela/Vesh/Durn()` ;
`cauchemar.chance()` ; `pilules.chanceMarchand()` ; les poids `w` des poissons.

**Relancer la mesure.** `node tools/equilibrage.js hasard` (≈ 15 s ; `HASARD_GRAINES=n` pour simuler n parties par
profil). Quatre esprits (mentalité 95, 70, 35, 5) ; le joueur « typique » se couche à 21 h 30 (15 % des nuits), 23 h
(55 %), 2 h (25 %) ou veille toute la nuit (5 %), dehors 60 % du temps, près du lavoir un vingtième de ce temps.
L'outil échoue si l'on recasse l'équilibre (tueur la première semaine, anciennes nuits rouges, ancienne
`bizarrerie()`, lavandière plus fréquente, rêves trop serrés…).

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
| `11-zzzz1-butin.js`, `11-zzzz2-objets.js`, `11-zzzz3-depouilles.js` | menu de butin, meubles fouillables, encart de la boutique ; ramasser les petits objets, tout casser avec le bon outil ; les morts qui restent au sol |
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
