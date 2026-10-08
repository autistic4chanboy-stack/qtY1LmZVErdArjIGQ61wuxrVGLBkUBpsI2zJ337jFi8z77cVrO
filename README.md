# Newy and the Dark Forest

*(Le jeu s'appelait d'abord « Prairie — La vieille ferme » : ses fichiers en gardent le nom — `Prairie.html`,
`Prairie-Wiki.html` —, comme les clés des sauvegardes, pour que rien ne se perde.)*

Jeu de ferme et d'horreur lente à la première personne, en 3D rétro (pixels façon Doom, personnages anguleux façon
premier Tomb Raider, bêtes en boîtes), presque sans affichage à l'écran. Un mode Création (éditeur de monde) est inclus.

## Jouer

Ouvrir **`Prairie.html`** dans un navigateur récent (Chrome, Edge ou Firefox, WebGL 2 requis).
Aucune installation ni connexion : tout est dans ce seul fichier. La partie est sauvegardée automatiquement.
Le jeu existe en **français** et en **anglais** (Options, ou le bouton de langue du menu ; bascule à chaud).
Les **Options** règlent aussi l'image : champ de vision, pixelisation, distance de vue, **distance du brouillard** (de 50 à
200 % : plus près pour l'ambiance, plus loin pour voir plus loin, sans jamais dépasser la distance de vue) et **distance de
l'herbe et des fleurs** (le tapis d'herbe et de fleurs autour de soi, de 20 à 80 m ; plus court, le jeu est plus léger).

**Le wiki de la vallée** : **`Prairie-Wiki.html`** (à ouvrir de même, hors du jeu) est un compagnon autonome : les cartes interactives,
en onglets — toute la vallée (relief, eaux, forêts, chemins, milieux, lieux-dits, lieux perdus, villages, maisons des habitants, zones de
pêche), le Dessous, les Enfers, le cauchemar, le pays des bonbons et les Ténèbres, dessinés depuis le jeu (zoom, recherche, repères qui
mènent aux fiches) — et les fiches de tout le jeu (habitants et leur semaine, objets, recettes, cultures, plantes, arbres, bêtes, poissons, alchimie, livres, langues perdues,
légendes, ce qu'il y a dans chaque bâtiment et à chaque étage…), avec une recherche plein texte. Les secrets restent masqués tant qu'on ne clique pas sur « révéler les secrets ». Il se
régénère depuis les sources du jeu (la vallée est générée, ≈ 1 minute) : `node tools/wiki-build.js`.

**La bêta en ligne (GitHub Pages)** : la page d'accueil **`index.html`** a deux portes, chacune son code — celui de la
bêta ouvre le jeu, celui du wiki ouvre le wiki (chaque code donné est retenu par le navigateur ; la langue choisie là
sera celle du jeu). Ouverts directement en ligne sans leur code, `Prairie.html` et `Prairie-Wiki.html` renvoient à
l'accueil ; ouverts en local (fichier), rien ne change.
Pour publier, une fois la branche fusionnée dans `main` : sur GitHub, *Settings → Pages → Build and deployment →
Source : « Deploy from a branch », Branch : `main`, dossier `/ (root)` → Save*. Le site est servi tel quel (fichier
`.nojekyll`) à l'adresse `https://<compte>.github.io/<dépôt>/`, une ou deux minutes après chaque fusion.
Les codes ne sont écrits en clair nulle part (seulement leur empreinte SHA-256) ; pour les changer :
`node tools/beta-code.js jeu <code>` puis `node build.js`, ou `node tools/beta-code.js wiki <code>` puis
`node tools/wiki-build.js`. C'est une barrière simple, pas un coffre : une page publique ne
cache pas vraiment ce qu'elle contient, et sur un dépôt public, les fichiers du jeu se lisent sur GitHub même (un dépôt
privé avec Pages demande un abonnement GitHub payant).

**La partie sans code (`libre/`)** : le même jeu et le même wiki, ouverts à qui a l'adresse, sans demander de code —
`libre/index.html` (une page d'accueil sans porte : « Jouer », « Le wiki de la vallée »), `libre/Prairie.html` et
`libre/Prairie-Wiki.html`, en ligne à `https://<compte>.github.io/<dépôt>/libre/`. Rien à y faire à la main :
`node build.js` écrit le jeu sans code en même temps que l'autre, `node tools/wiki-build.js` le wiki sans code ; ce
sont les mêmes pages moins le bloc « porte » (balisé dans `src/shell.html` et dans `tools/wiki-build.js`). La bêta
avec code ne change pas. Même site, même navigateur : les parties, les réglages et la langue sont les mêmes des deux
côtés.

**La présentation (`vitrine/`)** : une page d'images et de musiques, ouverte à tous, en ligne à
`https://<compte>.github.io/<dépôt>/vitrine/` (liée depuis les deux pages d'accueil) : la vallée, Valbrume, les cartes,
les écrans de jeu, les événements, les bêtes et les plantes, la cité vaisseau, les autres mondes, les affiches, et les
42 musiques à écouter (plus fortes que dans le jeu).

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
  neige** ; il y fait froid : on y a faim plus vite, et la nuit ou dans la tourmente, sans feu ni toit, **on gèle**
  petit à petit — le givre gagne l'écran depuis les bords, la vue pâlit et bleuit ; au bout d'un quart d'heure (quinze
  minutes réelles) de grand froid, le givre a tout pris, et c'est la fin. Au chaud (un feu, un toit, la potion de
  chaleur), il recule vite ; redescendu, ou au jour revenu, il fond lentement.

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
- **La terre** : une case arrosée (ou mouillée par la pluie) reste humide **deux jours** ; sèche, la culture tient encore
  **deux jours** avant d'être perdue (la canicule presse un peu les choses). Une case labourée qu'on laisse vide reverdit
  au même rythme. **La terre se fatigue** : chaque case compte ses récoltes ; au-delà de cinq sans engrais, on y pousse
  deux fois plus lentement, au-delà de dix, quatre fois (la terre lasse est plus pâle, et le personnage le remarque).
  L'engrais remet le compte à zéro (et donne toujours son coup de pouce) ; une longue jachère aussi, peu à peu.
- **Les arroseurs** gardent humide un carré de **7 × 7 cases** (celui de fer : **9 × 9**) ; le carré se montre quand on
  en tient un en main ou qu'on en regarde un de près.
- **La lanterne** brûle **dix minutes** au plus, puis s'éteint (dans la dernière minute, la flamme baisse et
  crachote). On la recharge d'un clic droit, ou en la rallumant : une fiole d'huile à lampe (la forge, les colporteurs)
  ou d'huile de tournesol la remplit, une bougie la fait tenir cinq minutes.
- **Le temps** : il pleut **deux fois moins** qu'avant (les crues et les orages suivent) ; sous la pluie ou la neige,
  **ni papillons, ni lucioles** : ceux qui volaient s'en vont, ils reviennent avec le beau temps.
  Les corbeaux mangent les semis : un épouvantail ne protège qu'à **six mètres** autour de lui (dix pour celui de fer) ;
  en le tenant en main, un anneau de paille lumineux montre sa portée (et celle des autres). Les oiseaux s'en écartent.
- **Élevage** : poules, vaches, moutons, cochons et cheval s'achètent au ranch et arrivent le lendemain.
- **Les ruches** : le ranch vend la ruche (avec son essaim) et l'enfumoir ; on peut aussi la fabriquer. Posée hors des
  villes, elle donne un pot de miel chaque matin (deux certains jours si des fleurs poussent autour : sauvages, en pot,
  parterres, tournesols, lavande…) et un pain de cire tous les trois jours, jusqu'à quatre pots ; E pour récolter. Sans
  enfumoir, les abeilles piquent ; avec, un peu de fumée et elles se calment. La cire fait des bougies (trois par pain).
  Les ruches du hameau sont à quelqu'un.
- **Le carnet de commandes** : dans le coffre de la ferme, un carnet de bons à souches, à l'en-tête du roulage Bardin
  (les parties d'avant le trouvent au premier chargement). Au coffre, « Ouvrir » ; pris dans la sacoche, en main, un
  clic l'ouvre n'importe où. On y commande ce que vendent les habitants **déjà rencontrés** : leur étal du jour
  (graines du jour, hotte des colporteurs selon l'endroit, reprises d'un commerce, garde-meuble de la commune), **au
  prix de leur boutique** (remise d'amitié comprise), plus un **port modeste** : trois pièces par étal et trois par
  kilomètre jusqu'au point de livraison (huit pour un colporteur, deux de plus par meuble). On paie d'avance ; tant
  que l'aube n'est pas passée, une commande se **raye** (remboursée). Pas de bêtes par la poste (l'éleveuse les
  livre elle-même), ni de chiot ; la forge des nains n'a pas d'adresse. Un habitant mort n'a plus d'étal (barré au
  carnet) ; qui vous en veut, ou connaît vos crimes, ne prend pas vos commandes.
- **Le voiturier** : le lendemain matin, entre six heures et demie et huit heures, il dépose un **colis** au **point de
  livraison** — devant la ferme au départ ; le carnet le change : devant une maison louée ou achetée en ville, ou
  « ici » (carnet en main, dehors, à portée d'un chemin). Qui est dans les parages le voit venir par la route, sa
  charrette chargée de caisses, son cheval, sa blouse bleue ; il descend, pose le colis, dit un mot parfois, fait
  demi-tour. Sinon, le colis est simplement là. On peut lui parler (E), il ne s'attarde pas.
- **Le colis** : papier kraft et ficelle, une caisse s'il est gros ; E l'ouvre dans le **menu de butin**, et ce qu'on y
  laisse **y reste** (même après avoir rechargé) ; vide, il n'y est plus. L'onglet « En cours » du carnet dit ce qui
  est en route et où attendent les colis. Un habitant mort entre la commande et la livraison : le prix de l'article
  revient dans le colis, en pièces. Rarement, un colis s'égare (une lettre du roulage, la marchandise remboursée,
  pas le port), ou, laissé seul, on le retrouve ouvert.
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
  habitants de métier (« Vous pourriez m'apprendre à fabriquer quelque chose ? »). **Ce que les mains savent ne meurt
  pas** : les recettes trouvées, lues ou apprises (et les mélanges d'alchimie réussis) sont gardées d'une vie à l'autre ;
  le fermier suivant les sait dès son arrivée (« sue d'une autre vie »).
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
- **Le chien** : il faut le nourrir (gamelle, ou E sur lui) : trois jours sans manger et il meurt (six, s'il a
  retrouvé son nonos : voir plus bas). E sur lui : le caresser, « À la niche ! », « Au pied ! », « Pas bouger ! ».

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
- **Acheter sa maison** : les trois maisons de la commune s'achètent aussi, chez le maire (« Les maisons de la commune »)
  ou sur l'écriteau : vingt semaines de loyer, comptant. Elle est alors à vous pour toujours — la clé, le lit, le coffre,
  plus de loyer ni d'expulsion. Un bail en cours se change en achat (le coffre suit) ; on peut la revendre à la commune,
  moitié prix.
- **Meubler sa maison** (celle de la ferme, une maison louée ou achetée) : un meuble en main, son fantôme suit le regard,
  se colle aux murs et tourne d'un quart de tour (clic droit ou R) ; il refuse les murs, les autres meubles et le passage
  devant la porte. E le reprend. Lit (on y dort), lit clos, armoire, commode, buffet, malle (on y range), étagère,
  horloge comtoise (elle sonne les heures), chandelier, guéridon et sa lampe (E : allumer), tableau (au mur), fauteuil,
  table, chaises, banc, coffre, tapis, pot de fleurs. Ils s'achètent au **garde-meuble de la commune** (le grenier de la
  mairie : les successions que personne n'a réclamées) et d'occasion chez le brocanteur du Marchedi, ou se fabriquent à
  l'établi (recettes à trouver, Manuel du menuisier ; les clous se forgent). Casser ses propres meubles n'est pas un
  crime ; ceux d'une maison saisie partent à la mairie avec le coffre.
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

**Une vallée plus pleine**
- **Un lieu tous les deux cents mètres** : la vallée est découpée en carrés de 200 m ; chaque carré où l'on peut
  marcher porte au moins un lieu qui mérite le détour. Ce qui existait compte (villes, hameaux, temple, ruines,
  cairns…) ; les carrés vides reçoivent un lieu d'un **catalogue de cinquante sortes** : croix de peste, chapelles en
  ruine et leur cloche fêlée, oratoires, tombes isolées, lanternes des morts, calvaire aux trois croix ; menhirs,
  cercles de pierres, pierres à cupules, dolmens, pierres branlantes, bornes, rochers aux marques, cairns de sommet et
  leur registre, abris sous roche, trous souffleurs ; loges de charbonnier, fours à chaux, bories, glacières, puits
  perdus, moulins et tours en ruine, cabanes perchées, ruchers, pigeonniers, jardins clos au cadran solaire, refuges,
  caches de contrebandiers ; sources sacrées, arbres aux offrandes, barques échouées ; fosses aux loups, fermes
  brûlées, et d'autres choses. Avec la graine habituelle : 196 lieux nouveaux, aucun carré vide.
- **Ce qu'ils portent** : un butin (qui se regarnit, ou un trésor d'une seule fois), un texte, une **lettre**
  (quarante-sept, rangées au carnet), une **inscription** en aëlin ou en gorrain (quatorze, sans traduction), un
  mécanisme ou un **petit secret** — une chose qui n'arrive qu'à une heure, un jour de la semaine, une nuit ; une
  cachette qu'un texte lu ailleurs révèle ; trois **histoires à recouper** d'un bout à l'autre de la vallée.
- **Deux peuples** en surface, avec leurs maisons, leurs métiers, leurs boutiques, leurs coutumes, leurs journées et
  leurs quêtes (six en tout) ; ils entrent dans la société (le bruit d'un crime finit par leur parvenir) :
  - **Les Planches**, sur le grand lac, au sud : ceux de Saint-Aubin-des-Eaux, restés au-dessus de leur village noyé
    en 1791 — maisons sur pieux, trottoir, quai, et la **Dame** de bois dans l'eau. La doyenne, le passeur (qui fait
    traverser le lac, de jour), la vannière.
  - **L'estive du Plan**, dans la haute cuvette de l'ouest : des bergers — cabanes de pierre et de lauzes, jasse et
    brebis, feu, rocher des marques des familles. Le baïle, la fromagère, le pâtre.
- **Leurs parlers** (« le parler d'eau », « le parler des hauts ») : des mots à eux dans leur français. Les mots
  entendus ou vus taillés s'inscrivent au carnet (onglet **Langues**), où l'on écrit ce qu'on croit qu'ils veulent
  dire. Personne ne les traduit d'office.
- **Chaque plante son objet** : les fleurs donnent des coquelicots, des marguerites, des bleuets, de la bruyère, des
  iris, des jonquilles… (dix-huit fleurs), les buissons des prunelles, les fougères des frondes, les souches des
  armillaires ; le champignon d'avant s'appelle « russules ». Chaque objet a son prix, sa notice, son **effet** quand
  on le mange, cru ou cuit (nourrir, soigner, calmer, faire rêver, rendre malade), et ses **essences en alchimie**.
  Les recettes qui demandaient « une fleur » ou « des baies » prennent n'importe laquelle. Trois plats nouveaux :
  soupe d'orties, omelette aux champignons, tarte aux baies.
- **Quarante-six plantes nouvelles**, chacune dans ses milieux, avec sa rareté : des prés, des vieux murs, de la forêt,
  des sous-bois de sapins, des champignons (dont de mortels), du bord de l'eau, de la lande et des hauteurs — et une
  herbe dont on ne parle pas. Les moins connues sont à faire nommer par l'alchimiste ; certains habitants en achètent.
  Les **herbes des plaies** (plantain, achillée, barbe-de-vieillard, sphaigne) s'appliquent sur une plaie qui saigne ;
  la consoude aide une jambe cassée.
- **Un bois par arbre** (vingt et un : sapin, pin, bouleau, hêtre, châtaignier, chêne, érable, saule, noyer, merisier,
  if, houx, bois foudroyé…) ; la souche donne le sien. Partout où une recette demande du bois, n'importe lequel
  convient. À l'établi : des manches, un **arc d'if** (plus puissant que l'arc long), des **meubles fins** qui ont la
  couleur de leur bois (commode et lit de noyer, armoire de chêne, table de merisier) ; un **bâton de houx** aide à
  grimper les pentes raides.
- **Vingt-deux bêtes nouvelles**, chacune avec sa manière d'être et son cri : hermine, taupe, mulot, loir, lièvre, chat
  sauvage, lézard, orvet, crapaud, triton, pic vert, coucou, geai (qui donne l'alerte à tout le bois), alouette,
  chouette effraie, grand corbeau, cincle, grèbe, butor, grues en vol, lucane, mante. Elles se chassent, se dépècent, et
  le bestiaire les connaît.
- **Le papillon d'or** : très rare (beau temps, heures du jour, prés, lande ou alpages, et de la chance : une fois tous
  les quarante jours environ). Il fuit qui s'approche trop vite ; on le prend au **filet à papillons** (fabriqué, ou
  acheté à la colporteuse), et il se vend **2 000 pièces**.

**Le Dessous**
- **Le Dessous** : sous la vallée s'étend un monde souterrain d'environ **1,6 km sur 1,5 km**, cent à deux cents mètres
  sous l'herbe : des galeries et des boyaux, une **Grande Nef** où poussent des champignons grands comme des arbres, des
  **Cristallières**, le **Souffle** (roche soufrée), les **Gouffres** et la **Salle des Échos**, la **Chambre des
  Gouttes**, les **Orgues** (forêt de stalagmites), les **Racines** (celles du grand chêne pendent de la voûte), les
  **Vieilles Mines**, deux lacs (la **Mer muette**, le **Lac tiède**) et la **Rivière noire**, et les ruines d'une
  **Ville engloutie**. Pas de carte : chaque lieu dit son nom quand on y entre, et l'on retrouve son chemin comme on
  peut.
- **Un passage bien caché à Valbrume** : on n'y tombe pas par hasard. Deux habitants en parlent à demi-mot (une
  rumeur du garde, une comptine de la fillette). Au bout : la **cave des Murés**, où l'on enferma des malades en 1631,
  et un puits aux barreaux qui descend dans le noir.
- **Le noir, pour de vrai** : sous terre il n'y a que ce qu'on apporte (la lanterne et ses dix minutes d'huile) et ce
  qui luit de soi-même (champignons, mousses, vers de voûte, cristaux, et ceux qui vivent là). Dans les grandes salles,
  le noir porte plus loin. La **pierre luisante** boit le jour quand on la porte dehors, et le rend en lumière verte,
  froide, huit minutes au plus (clic pour la montrer ou la cacher). La **lentille de cristal**, sur soi, porte la
  flamme de la lanterne beaucoup plus loin.
- **Minerais d'en bas** (filons à casser à la pioche) : la **galène** (trois galènes et du charbon au four : un lingot
  d'argent), le **cristal de roche** (deux cristaux et un lingot d'argent à l'établi : la lentille), la **pierre
  luisante**, la **magnétite**, le **soufre**, le **salpêtre** ; et les **perles des cavernes**, au fond des vasques.
- **Plantes d'en bas**, chacune son objet, ses effets, ses essences : le **pied-de-pierre** (cru, il se défend ;
  grillé au feu, il nourrit), la **mousse luisante**, le **lichen d'argent**, la **fougère pâle**, la **racine du grand
  chêne**, l'**algue blanche**, le **chapeau-de-suie** (à ne pas manger) ; le **guano** des chauves-souris, engrais
  très fort ; les champignons lumineux se cueillent et repoussent.
- **Bêtes d'en bas** : chauves-souris en colonies (elles fuient la lanterne), **protées** et **écrevisses aveugles**
  qu'on prend à la main au bord de l'eau, **grillons des cavernes** qui ne chantent que dans le noir complet,
  **scolopendres** qui mordent dans les galeries sèches ; la pêche dans l'eau d'en bas. Et quelque chose, aux
  Gouffres, qu'on entend souffler.
- **Ceux d'en bas** : au **Hameau d'En-Bas**, des pâles vivent dans des cabanes de pierre sèche en forme de ruche,
  à la lueur des pierres luisantes. Ils n'ont pas de noms. La flamme leur brûle les yeux ; ils ne parlent pas à
  n'importe qui ; ils ne veulent pas de sous. Leur langue, le **parler d'en bas**, ne se traduit pas : chaque mot
  entendu s'inscrit au carnet (onglet **Langues**) avec ce qui se passait à ce moment-là, et l'on peut ensuite le leur
  redire (« Dire un mot… ») pour voir ce qu'ils en font. Ils écrivent par **encoches**. Ils troquent, ils gardent
  leurs morts et leurs souvenirs, et l'un d'eux va et vient dans la longue galerie, une pierre verte à la main.
- **Les Aëlim, avant eux** : dans la Ville engloutie, des pierres gravées en Hautes Lettres (de nouvelles inscriptions
  d'aëlin, à lire avec les mots du lexique) et un tombeau fermé.
- **Remonter** : par où l'on est descendu (le puits de la cave, puis le conduit des douves), et par d'autres chemins
  qu'on découvre d'en bas et qui ne s'ouvrent, d'en haut, qu'une fois qu'on les a pris. Le **charbon** en main, sous
  terre, trace une flèche au sol (clic) ou l'efface (clic droit) : de quoi ne pas se perdre deux fois.

**Dire peu**
- **Le jeu dit peu** : le personnage ne raconte plus ce qu'on voit ou entend déjà, ni ses propres gestes (atteler,
  dépecer, creuser une fosse, remplir la lanterne, tirer un verrou…). Restent, en une phrase, les refus et leur raison
  (« Fermé à clé. »), ce qu'on ne peut pas voir (une malédiction posée, un avis de recherche, la dette, un danger dans
  le noir) et, rarement, une sensation brève ; l'étrange n'est jamais expliqué : le son, la lumière et le silence font
  le travail. Une règle à connaître (la durée d'une bougie, ce qui amadoue un cheval, où trouver des crochets) se dit
  **une seule fois par vie** (`penser.une`) ou reste dans la notice de l'objet ; un avertissement ne revient pas sans
  cesse (`penser.pas`). L'inventaire des pensées : `node tools/pensees.js` (fichier:ligne, par canal et par module).
- **Les langues perdues se déchiffrent par recoupement, lentement** : aucun habitant ne traduit plus une inscription
  entière (le bibliothécaire en donne un seul mot par leçon, l'ancien des nains parle des cupules de travers) ; les
  leçons et les lexiques donnent deux fois moins de mots, dans un **ordre mêlé propre à chaque partie** (pas les mots
  des pierres d'abord) : il faut relever les pierres et comparer dans le carnet. L'onglet Langues dit ce qu'on sait
  (mots, grammaire si l'on a lu la préface d'un lexique, ce qu'on lit de chaque pierre), pas où l'apprendre.
- **Les énigmes se recoupent** : l'ordre des pierres du temple, les coups à frapper chez les nains, le rayonnage de la
  bibliothèque, la niche des Frappeurs ou la fin des reliques ne sont plus écrits en entier nulle part ; chaque
  solution se reconstitue à partir d'au moins deux sources obliques (un livre, une réplique, un conte à relire, un
  objet, la couleur d'une pierre), et l'essai reste possible.

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

**On entre partout**
- **Chaque bâtiment s'ouvre, à chaque étage** (`node tools/equilibrage.js batiments` le vérifie : chaque toit de la
  vallée, chacun de ses niveaux, à hauteur d'homme, comme le joueur se cogne). Pour monter : une échelle de meunier
  contre un mur et une trappe — **E au pied**, **E au bord du trou** pour redescendre ; on grimpe en voyant passer le
  plafond. À l'étage, on est sous le toit (la pluie, le froid : à l'abri) et dans la maison (les règles suivent : chez
  quelqu'un, fouiller reste un vol ; d'en bas on ne vous voit pas, on vous entend parfois).
- **L'étage de chaque maison de Valbrume** — la mairie, l'auberge, la boulangerie, la poste, les maisons aux volets
  bleus, du tisserand, Rivière, aux lilas, Vernet, Delorme, du Rempart, l'échoppe de l'alchimiste —, du ranch, et les
  deux niveaux de la bibliothèque : une pièce qui dit qui vit là (chambres, atelier, fenil, archives, réserve de farine,
  lettres en souffrance), des lampes pour la nuit, des endroits à fouiller, seize papiers nouveaux. Le **garde-meuble
  de la commune** est au grenier de la mairie (le maire vend d'en bas) ; à l'auberge, **cinq chambres d'hôtes** (et la
  sept, où l'on ne dort pas) ; l'étage d'une maison louée ou achetée se meuble.
- **Les huit tours des remparts sont creuses** : une porte côté ville (fermée la nuit), le magasin ou le treuil du
  pont-levis au pied, le corps de garde (paillasses, râtelier, le coffre des gardes), et en haut le **chemin de ronde** :
  on fait le tour de la ville sur les remparts, par-dessus les portes. **Le clocher** a son beffroi, sous la cloche (on
  y monte le jour, hors de la messe ; « Regarder la vallée » se fait là-haut) ; on entre sous **la tente de la diseuse**.
- **Le vieux moulin** se visite jusque sous le chapeau (le coin du meunier, les farines, les meules, le rouet qui tourne
  avec les ailes) ; **le phare** du pied à la lanterne (la chambre du gardien, la réserve d'huile, le bureau et son
  **registre du feu**, la longue-vue, la galerie sur le lac) ; les **pigeonniers** (boulins, échelle tournante, pigeons
  qui roucoulent), les **loges des charbonniers** (on y dort sur les fougères), les moulins en ruine, les bories (on
  entre accroupi, on se relève sous la voûte), les glacières ; les cabanes de **l'estive** ont des portes d'homme ; la
  bergerie des Combes a retrouvé les affaires de son berger. **Le clocher englouti** est creux : on plonge (C), on entre
  par la baie ; la cloche n'y est que les nuits d'orage.

**Les gardes et les chevaliers**
- **Deux protecteurs par lieu, pas un de plus** : à Valbrume, Grosjean, le garde des ponts, le jour, et le **chevalier
  du guet** (cuirasse, casque à crinière, sabre), la nuit, au **corps de garde du pont nord**, de l'autre côté des
  douves (un lit de camp pour le passant, le registre du guet, le brasero allumé tant qu'on veille, une guérite au bout
  du pont) ; à Clairpré, le **garde champêtre** (képi, plaque, fusil en bandoulière), le jour, et le **gendarme à
  cheval**, la nuit, à la **cabane des gardes**, à l'entrée du hameau (son cheval, Mistral, à l'écurie) ; l'après-midi,
  le gendarme fait la tournée des petits villages et porte les nouvelles. À deux, l'un dort pendant que l'autre veille ;
  on les entend se passer la relève. Ils meurent pour de bon, comme les autres habitants.
- **Se rendre, ou pas** : un garde qui vous rattrape pour un délit que son village connaît vous somme, et vous
  choisissez : **vous rendre** (le cachot), **payer la prime sur-le-champ** pour un petit délit si vous avez de quoi, ou
  **refuser**. Refuser, c'est la **rébellion** : une prime de plus, les coups (quel que soit le délit), l'autre garde qui
  accourt. On peut fuir (semés, ils lâchent, la prime monte), se battre (un garde blessé, c'est une agression ; tué, un
  meurtre) ou se rendre plus tard. Mis au tapis par un garde, on se réveille arrêté, pas mort — sauf quand on est
  recherché pour un meurtre. On peut aussi aller **se rendre de soi-même** à n'importe quel garde.
- **Ils sont là quand il y a un problème** dans leur village et un peu autour : l'homme au long manteau, l'homme au
  masque, une bête dangereuse près des maisons (le garde champêtre tire : manquée, elle s'enfuit et il la chasse ;
  touchée, elle charge), le feu (les seaux), un cri, un vol. Rien de surhumain : ils arrivent parfois trop tard,
  Grosjean a peur, et ils peuvent y rester. Chez eux, on lit le registre du guet, celui des procès-verbaux et le
  tableau des avis.

**Le son**
- **Tous les sons refaits, toujours synthétisés** : plus de bruit blanc cru ni de clics — bruits filtrés et adoucis, attaques
  douces, formes d'onde sans harmoniques perçantes, aigus un peu en retrait ; et jamais deux fois le même son (hauteur,
  timbre, durée, niveau varient un peu). Les **pas** changent avec le sol (herbe, terre, pierre, plancher, eau, neige qui
  crisse), un pied puis l'autre : sourds et feutrés, on les sent plus qu'on ne les entend (sur le pavé, un « toc » mat
  de semelle, sans claquement ; ceux des habitants un peu plus bas encore). Rien qui claque de loin comme un coup de
  feu : les petites vagues s'enflent, les grenouilles roulent, la lavandière de nuit claque son linge sur la pierre. Les **bêtes** ont de vraies voix (formants, vibrato, rugosité) : bêlement qui tremble,
  meuglement qui s'ouvre, grognements, caquètements, hennissement et ébrouement, coin-coin, braiment, aboiement,
  hurlement du loup, croassement… Les **habitants** murmurent des syllabes qui ressemblent à des mots, avec l'intonation
  d'une phrase (parfois une question). La **cloche** de l'église a les partiels d'une vraie cloche, qui battent lentement.
  Le **tonnerre** roule le long de l'horizon. Outils, portes, serrures, pièces, pages, interface : plus doux.
- **Un vrai mélange** : bruitages, ambiance, voix et interface ont chacun leur bus ; une compression douce tient le tout,
  un limiteur empêche toute saturation ; les niveaux sont équilibrés (les pas s'entendent enfin sur l'herbe ; un toc à la
  porte ne fait plus sursauter qu'autant qu'il le doit).
- **La réverbération du lieu**, calculée : légère dehors, plus dense en forêt, un écho sur les sommets, proche dans une
  maison, ample dans l'église, la bibliothèque ou une grande salle, immense sous terre et dans les autres mondes ; on
  passe de l'une à l'autre en fondu en franchissant une porte.
- **Le son en 3D (au casque)** : ce qui a une place dans le monde s'entend de là où il est — devant, derrière, à côté,
  au-dessus : les bêtes (et les sabots de celles qui marchent près de vous), les habitants (leur voix, leurs cris, leurs
  pas, les portes qu'ils ouvrent), les coups de feu et les pièges des chasseurs, le tonnerre (de l'arbre que la foudre a
  frappé), la cloche (du clocher), l'enclume (de la forge), le violoneux, la tornade, le grand vol d'oies qui passe
  au-dessus de vous, la lavandière au lavoir, et les choses qui ne devraient pas être là. L'écouteur suit la caméra à
  chaque image, cinématiques comprises ; au loin, les sons baissent, l'air en mange les aigus et la réverbération
  domine ; tout près, un peu plus de grave.
- **Des ambiances tout autour, plus un fond plat** : **le vent suit le temps qu'il fait** — presque rien par beau temps
  (de loin en loin, un souffle léger qui passe), une brise sous les nuages, du vent sous la pluie, la tempête dans
  l'orage, un peu plus sur les hauteurs ; il souffle par bouffées, des deux côtés à la fois, plus clair quand il forcit,
  avec le feuillage en forêt, et ne siffle que dans le grand vent (sur les hauteurs par beau temps, 14 dB de moins
  qu'avant) ; la pluie tombe tout autour de vous, et sourdement sur le toit quand on est à l'abri ; la rivière coule là
  où elle coule, le lac clapote à la rive — doucement, et de moins loin qu'avant (la rivière : 6 dB de moins à dix
  mètres, 13 à cinquante) ; le feu crépite à sa place (feux de camp, cheminées, fours, incendies) et **un mur ou une
  porte fermée l'étouffe** : la cheminée d'une maison ne s'entend pas de la rue, ni collé au mur derrière elle, seulement
  par une porte ouverte, dans son axe ; les oiseaux chantent dans les arbres — merle, mésange,
  pinson, tourterelle, coucou, pic, moineaux au village, alouette haut dans le ciel au-dessus des prés —, **chacun son
  tour** : un chanteur reprend sa phrase deux ou trois fois de la même branche, puis un silence, plus court à l'aube et
  en forêt ; les oiseaux des bois et des cours attendent qu'aucun autre ne chante (en forêt, 44 chants par minute
  avant, dont un tiers du temps à plusieurs ; une dizaine aujourd'hui, jamais ensemble, et trois quarts de silence) ; la nuit, des grillons dans l'herbe (ils se taisent quand on s'approche), la chouette au loin, les grenouilles
  au marais ; sous terre, des gouttes et un grondement sourd.
- **Options** : « Son 3D pour casque » (coché par défaut ; décoché : simple panoramique, pour des haut-parleurs), à côté
  du volume général, de celui de la musique et de celui de l'ambiance.

**Les voix de chaque milieu**
- **Chaque milieu a sa voix** : les prés (l'alouette, le bruant jaune, la caille, les criquets au soleil), la forêt (la
  grive, le rouge-gorge, le troglodyte, le souffle dans les pins), le bois de bouleaux (le pouillot fitis, le frisson des
  petites feuilles), le marais (les rousserolles, les roseaux, le chœur des rainettes la nuit), le bord du lac (le
  loriot, le ressac, un poisson qui saute), la lande (l'alouette lulu, le tarier, les gousses d'ajonc qui éclatent au
  soleil), les hauteurs (le merle à plastron, la buse très haut, les sonnailles), la ville (les martinets, le petit-duc
  la nuit, une charrette sur les pavés) et la ferme (les hirondelles, la basse-cour, la chevêche). Trente-cinq oiseaux
  nouveaux, qu'on entend sans les voir, chacun avec son vrai chant ; d'un milieu à l'autre, les sons se fondent en
  quelques secondes.
- **L'heure et le temps qu'il fait** : le chœur de l'aube commence dans le noir, les derniers chants viennent le soir,
  puis la nuit le rossignol, l'engoulevent, le râle des genêts, les chouettes, le grillon d'Italie, les crapauds
  accoucheurs. Les insectes aiment le beau temps et la chaleur ; la pluie, l'orage, le brouillard, le gel et la neige
  font taire, chacun à sa façon ; les nuits noires, toute la nature se tait. L'angélus sonne à 7 h, à midi et à 19 h.
- **La pluie de chaque milieu** : sur les feuilles en forêt (et l'égouttement des arbres après l'averse), sur l'eau au
  marais et au lac, sur les toits, les gouttières et les pavés en ville, sur la bruyère et la pierre là-haut, sur le
  chaume, les tuiles et le tonneau à la ferme ; à l'abri, sur le toit au-dessus de soi. Le tout n'est pas plus fort
  qu'avant.
- **Doux et rare** : un chanteur à la fois, de longs silences ; tout se règle avec le curseur « Ambiance » des Options.
  Synthétisé, calculé en tâche de fond : rien de plus à chaque image.

**La musique**
- **De temps en temps, un morceau doux** (piano surtout, parfois harpe, flûte, célesta, cordes, verre, boîte à musique,
  orgue, cloche), puis un long silence (de douze à vingt-cinq minutes, au hasard : à peu près un morceau par journée de
  jeu ; le premier vient deux minutes et demie à six minutes après le début de la partie). Le morceau dépend de
  l'endroit où l'on est quand il commence, et il va jusqu'au bout.
- **Quarante-deux morceaux** (une heure et demie de musique), de quatre à sept par endroit : les prés et la ferme, la
  forêt et les bouleaux, le marais et le lac, la lande et les hauteurs, la ville et le hameau, la nuit, le Dessous, le
  pays des bonbons, les Ténèbres, les Enfers, la cité vaisseau (rien dans le cauchemar). Trente-trois compositions
  originales ; l'air d'« Au clair de la lune » (celui de la boîte à musique des bonbons, enfin juste) ; huit œuvres du
  domaine public arrangées fidèlement : les trois Gymnopédies de Satie, quatre préludes de Chopin (op. 28 n° 4, 6, 7,
  20) et le prélude en ut de Bach (BWV 846), pour harpe et cordes.
- **Tout est synthétisé** dans le navigateur, sans fichier audio : un piano calculé partiel par partiel (cordes raides,
  deux cordes qui battent, double extinction, feutre du marteau, étouffoirs et pédale), joué avec des nuances, des
  phrases qui respirent et un léger rubato, dans une salle (réverbération calculée).
- **Elle se tait** quand la peur monte, pendant une nuit noire ou rouge, dans l'Envers, quand le violoneux joue près de
  vous ; si l'on change de monde, le morceau s'efface et celui du nouveau monde vient bientôt.
- **Options** : le curseur « Musique » (juste après le volume général) et la case « Musique de temps en temps », qui la
  coupe en fondu ; enregistrés avec les autres réglages. La musique reste sous l'ambiance et sous le volume général.

**Plantes et bêtes de chaque milieu**
- **Quatre-vingt-dix plantes nouvelles, dix par milieu** (les prés, la ferme, la ville, la lande, les hauteurs, la
  forêt, le bois de bouleaux, le marais, le bord du lac) : des espèces vraies de la flore de France, de communes à
  introuvables ou presque — la chicorée et l'orchis homme-pendu des prés, la cymbalaire des vieux murs, le genévrier de
  la lande, la grande gentiane des alpages, le lis martagon et l'oronge vraie des sous-bois, l'amadouvier des bouleaux
  morts, la grassette du marais, le nénuphar jaune et la macre du lac… Chacune a son objet, sa notice dans l'herbier,
  son effet quand on la mange (remède, herbe qui arrête le sang, sommeil, ivresse, poison), ses essences pour la table
  d'alchimiste et ses acheteurs. La plupart n'ont d'abord que leur allure, jusqu'à ce que l'alchimiste de la ville les
  nomme — et la grande gentiane ressemble beaucoup au vérâtre, qui tue.
- **Où les trouver** : au bord des chemins et dans les prés ; autour des fermes, du hameau et du moulin, dans les champs
  et les décombres ; au pied des murs et dans les jardins ; sur la lande ; dans les alpages, sur les rochers, au bord
  des neiges ; sous les vieux chênes et sur le bois mort ; autour des mares du marais ; sur les rives et dans l'eau
  libre du grand lac. Près de deux mille pieds, posés après tout le reste (les objets d'avant ne bougent pas) ; on en
  trouve aussi en fouillant (bocaux, apothicaire, caves, cabanes des bûcherons et des pêcheurs…).
- **Ce qu'on en fait** : café de chicorée, sirop de capillaire et pâte de guimauve au feu ; genièvre et eau de mélisse
  à l'alambic du bouilleur de cru ; liqueur de gentiane au tonneau ; chandelles de jonc, lait caillé à la grassette ;
  l'amadou et quelques herbes pansent les plaies. Et quelques conduites : la sève de la berce brûle la peau au soleil,
  la carline se ferme quand il pleut, l'ail victorial endurcit un peu.
- **Quatre-vingt-dix bêtes nouvelles, dix par milieu**, de la faune française du XIXᵉ siècle : du faucon crécerelle qui
  « fait le Saint-Esprit » au-dessus des prés au gypaète des falaises, en passant par le grillon du foyer, les
  hirondelles sous les avant-toits de la ville, la huppe de la lande, la foulque du lac, le daim de la forêt, la
  gélinotte des bouleaux ou la rainette du marais. Chacune a son modèle en boîtes, sa rareté, son heure (le jour, le
  crépuscule, la nuit), son temps (le lézard au soleil, les grenouilles sous la pluie), sa notice au bestiaire, et ses
  cris, synthétisés, doux et rares, en 3D (le curseur « Ambiance » les règle).
- **Chacune sa manière** : la caille part sous les pieds, la perdrix en compagnie dans un fracas d'ailes ; les pics
  tambourinent, la bécasse « croule » au crépuscule, le râle crie comme un goret sans qu'on le voie ; le cormoran sèche
  ses ailes en croix, le balbuzard plonge et emporte son poisson, le gypaète laisse tomber des os sur les rochers, les
  vautours descendent sur une bête morte quand on s'éloigne ; la nuit, le sphinx tête-de-mort tourne autour de la
  lanterne.
- **Pas de points d'apparition** : les bêtes paraissent autour de vous dans leur milieu, ou sur leurs **territoires**
  tirés de la graine (un arbre, une rive, une mare, une falaise : on retrouve une bête là où on l'a vue, à son heure),
  et s'en vont hors de vue ; tuée ou prise, sa place reste vide quelques jours (plus longtemps pour les rares). Peu de
  bêtes à la fois, et rien n'est ajouté au monde : les parties anciennes se chargent telles quelles.
- **Ce qu'on en tire** : à la chasse, de la viande, des peaux (putois, fouine, genette, vison), des plumes (huppe, tétras
  lyre, gypaète, la plume du peintre de la bécasse, les aigrettes que paient les modistes), le bois du daim ; au filet à
  papillons, le machaon, le grand paon de nuit, le sphinx, l'apollon, le grand mars ; à la main (E), un escargot après
  la pluie (à l'ail, au feu), un hanneton, une toile d'araignée qui arrête le sang. Le maire collectionne les papillons,
  le chasseur prend les peaux, l'alchimiste les plumes. Qui entre dans l'eau du marais en ressort avec des sangsues aux
  jambes ; posée sur la peau, une sangsue boit le venin.
- **Les dangereuses restent rares et se font entendre** : la sentinelle des frelons tourne d'abord autour de la tête, la
  vipère péliade siffle avant de mordre, la nuit le grand-duc fait face et claque du bec, le daim mâle gratte et rait
  avant de charger, l'autour crie avant de piquer sur qui s'attarde sous son arbre ; acculé, le putois empeste et le
  surmulot mord.

**Le hasard de la vallée**
- **Soixante et un événements nouveaux**, rares ou peu fréquents, qui s'ajoutent aux prodiges, au calendrier et à
  l'étrange d'avant : **le ciel** (un arc-en-ciel double, les faux soleils d'un matin de gel, la foudre en boule, le
  rayon vert sur le lac, une comète sept nuits durant…), **les bêtes** (des cigognes sur le clocher, le brame, les
  crapauds qui traversent le chemin, un essaim, des renardeaux à l'aube…), **les villages** (une noce derrière le
  violoneux, un enterrement sous le glas, un enfant perdu, des saltimbanques et leur ours, un charivari…), **la ferme**
  (le renard au poulailler, un panier sur le seuil, un vagabond dans le foin, une mise bas la nuit, le jury du
  comice…), **les routes** (une diligence versée, le rémouleur, la transhumance, un petit Savoyard et sa marmotte, un
  peintre anglais…) et **l'étrange** (une lettre de 1812 pour quelqu'un d'autre, une berceuse qui monte d'un puits, le
  chien noir, la dame blanche, la messe des morts à minuit, la chasse volante…).
- **Chacun a sa condition** : le lieu, l'heure, le temps qu'il fait — ou qu'il fera (la lune cerclée annonce la pluie,
  les hirondelles qui rasent l'herbe l'averse) —, le jour de la semaine (la procession un Primedi, le linge envolé un
  Lavedi, la messe des morts la nuit du Vorndi), ce qu'on a (des poules pour le renard, des cultures pour les
  sangliers) et ce qu'on a fait (un bienfait vaut un panier sur le seuil). **Quelque chose à voir, à entendre ou à
  faire** : rapporter les draps, ramener l'enfant par la main, saisir la longe, passer les seaux, séparer les ivrognes,
  bander un colporteur, pousser une charrette, s'asseoir au feu des voyageurs… — pour des suites modestes (une pièce,
  des dragées, une poulette, une poule perdue, l'amitié des habitants). La musique des gens (violon de la noce, fifre
  et tambour, litanie, vielle, requiem) et les bruits sont synthétisés.
- **Un par jour environ, tous confondus** : la plupart sont tirés à l'aube, et ce qui arrive sans vous se fait quand
  même (la procession bénit vos champs même si vous n'y êtes pas, le renard prend une poule pendant que vous dormez) ;
  les autres arrivent là où l'on se trouve (au bord du lac au coucher du soleil, la nuit près d'un puits, dans les bois
  au crépuscule). Jamais plus de deux le même jour, jamais deux fois le même avant plusieurs jours ; l'étrange vient
  plus souvent quand l'esprit s'assombrit.
- **Des traces** : le carnet de la sacoche en garde une ligne (« Ce qui est arrivé ») ; les habitants en parlent deux
  jours, et annoncent la veille ce qui se prépare (une noce, un enterrement, des saltimbanques, la procession).

**La pierre ronde et la cité vaisseau**
- **Une seule pierre ronde dans toute la vallée**, ailleurs à chaque partie, quelque part sur les hauteurs, loin des
  chemins et des villages : un anneau de pierre grise, haut comme une porte de grange, plein d'une lumière bleue qui
  coule sans bruit. Elle luit la nuit et chante tout bas quand on s'approche. Trois habitants en parlent de loin, sans
  dire où ; au pied, un papier glissé sous un caillou dit qu'« on n'y va qu'une fois ».
- **De l'autre côté, la cité des Maisons-d'Étoile**, abandonnée : un monde à part, où le temps de la vallée s'arrête
  (pas la faim). Le Seuil, le couloir des hublots, la Nef immense et les maisons de l'équipage, les Jardins, l'aile
  haute (Archives, Atelier des corps, Chapelle, Berceaux), l'Observatoire, et sous la Nef la Machinerie et la Brèche,
  où il n'y a plus d'air. Une voix, la veilleuse, vous accueille, vous répond et se souvient. Le registre de bord, des
  écrans, des carnets, des messages enregistrés, des inscriptions en Hautes Lettres, une lunette : qui a bâti la cité,
  pourquoi elle est là, ce qui l'a suivie, ce que sont devenus ceux qui sont descendus — à vous de recouper.
- **Des machines qu'on met en route ou qu'on arrête** (E) : le Cœur, le générateur de la cité (la veilleuse l'éteint
  elle-même s'il brûle trop longtemps), les lampes de la Nef, la fontaine, le régulateur de pesanteur (on saute très
  haut dans la Nef), les serres (les plantes repoussent, on en cueille les fruits), trois hologrammes, le rideau qui
  tient l'air dans la Brèche, des portes qui s'ouvrent devant vous, deux ascenseurs ; chacune avec sa lumière et son
  bruit.
- **L'Atelier des corps** : quatre reprises modestes et permanentes — les jambes (courir un peu plus vite), le jarret
  (sauter un peu plus haut), le souffle (moins de fatigue à la course, plus longtemps sous l'eau), les os (les chutes
  font moins de mal) ; trois fois au plus pour chacune, six en tout, et chaque fois des cœurs de verre (un, puis deux,
  puis trois), du sang et des courbatures.
- **Un seul voyage** : on reste aussi longtemps qu'on veut ; on revient par le seuil de la cité, devant la pierre, et
  les deux portails s'éteignent pour toujours. Mourir là-haut vous ramène aussi (la veilleuse dépense la dernière
  lumière du seuil), et le voyage finit de la même façon. Ce qu'on a rapporté (une trentaine d'objets, environ 1 400
  pièces à la revente) et ce que l'Atelier a fait restent.

**Des trouvailles un peu partout**
- **Ce qui traîne, à la vue** : un millier de choses posées dans la vallée, qu'on trouve en se promenant, sans meuble
  à ouvrir ni fouille : on les vise (« Ramasser le fer à cheval »), **E**, et c'est dans la sacoche. Le long des
  chemins et au bord des champs, au pied des arbres à fruits, sur les seuils, dans les rues et sur les places des
  villages, au bord de l'eau (ce qu'elle ramène), dans la forêt, la lande et les hauteurs (ce qu'on y a perdu), près
  des croix, des pierres levées et des ruines, et dans les maisons et les granges (sur une table, une étagère, un
  rebord, ou par terre). Plus dense en ville et près des maisons ; rare dans les montagnes.
- **Soixante-treize sortes**, chacune à sa taille (une branche morte fait près d'un mètre, un sou deux centimètres et
  demi ; de près, le métal et le verre accrochent le soleil ; les plus petites choses ne sont jamais dans l'herbe,
  mais sur la terre des chemins, les pavés, le sable, la roche) : de quoi faire (bois mort, ficelle, chiffon, clous,
  bouteille, fer à cheval, ferraille, bois flotté, liège, plumes, silex…), de quoi manger (pommes, poires, prunes,
  cerises, noix, châtaignes, faînes tombées — en saison), de petites valeurs (sous, boutons de nacre, dé à coudre,
  bague, médaille, montre arrêtée…), des choses perdues qui racontent un peu (des lettres qu'on lit, un sabot
  d'enfant, un gant, une pipe, un soldat de plomb, une clé sans porte…) et quelques raretés (fibule de bronze,
  portrait sur plaque, pierre percée, fossile…).
- **Ce qui revient** : les fruits tombés (trois jours après, et seulement en saison : chaque fruit a ses semaines, sur
  un cycle de vingt-quatre jours), le bois mort (quatre jours), les œufs pondus dehors (deux), les plumes de poule
  (trois), le bois flotté (six), les coquilles (huit) ; le reste se trouve une fois pour toutes.
- **Chez les gens, c'est à eux** : dehors, ce qui traîne est à qui le trouve ; dans une maison habitée, on lit
  « (chez Untel) » sous le réticule, et prendre sous les yeux de quelqu'un est un vol.
- **Ce qu'on en fait** : trois bouts de ficelle font une corde, deux chiffons un bandage, une bouteille vide une fiole
  (au four), un flotteur de liège et une bougie une chandelle sur liège ; le bois flotté compte comme du bois ; une
  mulette s'ouvre (rarement, une perle) ; une lettre ramassée se relit, en main. De quoi récompenser la promenade, pas
  d'en vivre : une journée à flâner rapporte une quarantaine de pièces.

**Les bêtes qui parlent**
- **Huit bêtes uniques**, chacune à son endroit et à ses heures : Tibert, le gros chat gris de l'auberge (le soir, sur
  le tonneau devant la porte ; il y dort le jour) ; la hulotte du chêne millénaire (la nuit) ; le Crapaud du vieux
  puits, au hameau abandonné (le soir, et le jour quand il pleut) ; Tiécelin, le grand corbeau de la Table des Géants
  (le jour) ; Hermeline, la renarde boiteuse du relais de chasse (à la brune et à l'aube) ; l'Écornée, la vieille
  chèvre de l'estive (le jour) ; la Vieille, la grosse carpe du ponton du pêcheur (le matin et le soir) ; Bayard, le
  vieux cheval de trait de la ferme brûlée des Chabert (le jour ; il dort debout la nuit). Chacune se reconnaît à un
  détail, qu'on ne dit pas. On les entend avant de les voir (un petit cri, de temps en temps) ; la nuit, les yeux du
  chat luisent, et celui de la hulotte.
- **Elles ne parlent qu'au joueur** : les gens n'y croient pas, ou font semblant (on peut leur en parler, une fois
  chacun), et qui passe pendant qu'on parle à une bête le remarque.
- **Parler (E)** : la première fois, la bête parle la première quand on approche. Puis une conversation qui se
  souvient : qui elle est, pourquoi elle parle, son sujet (une confidence de plus chaque jour où l'on revient), deux
  rumeurs par jour, obliques, sur la vallée et ses secrets (jamais la solution), une question qu'elle vous pose et
  dont elle vous reparlera, ce que vous avez fait (crimes, chasse, le chien, l'Envers, la cité…) — selon l'heure, le
  temps qu'il fait et le jour de la semaine. Un petit cri de bête au début de chaque réplique. Chacune, quand on la
  connaît un peu, dit où en trouver deux autres.
- **Un service, et la pareille** : chacune demande un jour quelque chose (une chose à lui apporter, une veille, une
  promesse) et rend la pareille, une fois : un objet, un renseignement, un endroit.
- **On peut les menacer, les blesser, les tuer** : une arme pointée sur elle, la bête s'en va pour la journée ;
  blessée, pour trois jours (blessée deux fois, elle ne vous parle plus jamais) ; tuée, elle ne revient pas — l'esprit
  en prend un coup, quelques nuits sont mauvaises, les autres le savent et vous le disent ; trois tuées, et toutes se
  taisent.
- **Le carnet** de la sacoche garde une page « Des bêtes qui parlent ».

**Le nonos du chien (une quête principale, facultative)**
- **Un matin, le chien cherche** : une seule fois par partie, à partir du troisième jour (au premier matin venu dans
  une partie déjà avancée), le chien de la ferme tourne en rond près de sa niche, gratte, gémit : le vieil os qu'il
  traînait partout a disparu. Une courte scène, puis un premier souvenir ; le carnet de la sacoche note
  « Quête principale — facultative ». On peut ne jamais s'en occuper : rien n'attend après elle.
- **Cinq lieux, tirés au hasard** au début de la quête (d'autres à chaque partie) parmi les vrais repères de la
  vallée — calvaires, chapelles en ruine, pierres levées, moulins, ponts, sources, arbres aux offrandes, fermes
  brûlées, bords de l'eau… —, le premier non loin de la ferme, chacun à quelques centaines de mètres du précédent,
  tous joignables à pied.
- **Chaque lieu se montre dans un souvenir** (une cinématique) : on le voit à hauteur de chien, dans la lumière de
  l'aube ou du soir, sans jamais voir le chemin qui y mène (ni survol, ni flèche, ni carte) ; le carnet en garde une
  phrase vague, et un bouton « Revoir ». Sur place, un indice à chercher un peu (il luit à peine quand on le regarde
  de près) : E dessus, et un nouveau souvenir montre le lieu suivant. Le chien, s'il vous suit (« Au pied ! »), le
  sent à une trentaine de mètres et court le flairer. Au cinquième lieu, le nonos — et qui l'avait pris.
- **Rendu au chien** (E sur lui, ou il le reconnaît en vous voyant revenir) : une dernière scène, et pour toujours il
  a faim **deux fois moins vite** — un repas le tient deux fois plus longtemps, trois jours sans manger en deviennent
  six. On le voit ronger son os devant sa niche. Si le chien meurt en chemin, la quête s'arrête ; le chiot adopté
  ensuite n'hérite pas du nonos.

**Cinq autres quêtes principales, à lieux précis (facultatives)**
- **Cinq histoires, proposées, jamais imposées** : *La chambre sept* (l'aubergiste du Coq Tordu, à partir du deuxième
  jour), *Le feu du lac* (une lettre d'une veuve, dans la boîte aux lettres, à partir du quatrième), *Les toiles
  d'Ardoin* (un avis de la mairie, au panneau de la place, à partir du troisième), *La crécelle* (un objet trouvé sur une
  souche devant le relais de chasse, à partir du troisième), *La source froide* (le docteur des Sources, à partir du
  quatrième). Trois réponses à chaque fois : accepter, plus tard (elle attend au carnet, sous « Proposées »), ou jamais.
  Une quête commencée s'abandonne et se reprend là où on l'avait laissée ; plusieurs peuvent courir ensemble ; si
  l'habitant qui l'a proposée meurt, elle est perdue.
- **Des lieux précis, les mêmes dans toutes les parties**, tantôt dedans, tantôt dehors : l'étage de l'auberge, le
  pont des Saules, le casier de la poste, le cimetière ; la grève, le bureau et la lanterne du phare, le quai des
  Planches ; le grenier de la mairie, le lavoir, les combles de la bibliothèque, l'abbaye de Montrevel, la nef de
  l'église ; le relais de chasse, la cascade, la hutte de la guérisseuse, la chapelle abandonnée ; la maison du
  docteur, le chêne millénaire, la maison du bas à Clairpré, la source aux rubans. Quatre ou cinq étapes par quête ;
  sur place, quelque chose à trouver (E) ; certaines étapes ne se font que la nuit, ou avant l'aube.
- **Chaque étape se montre dans une courte scène** : le nom du lieu dans le noir, le lieu en entier, puis l'endroit
  précis où chercher, à l'heure qui lui convient (l'aube, le couchant, la nuit) ; dedans, la caméra reste dans la pièce,
  éclairée. Chaque scène se revoit au carnet (sacoche, onglet Carnet, rubrique « Quêtes principales » : proposées, en
  cours avec le lieu de l'étape nommé, abandonnées, achevées).
- **Une fin à choisir**, et des récompenses à la mesure de chaque histoire : de l'argent (au plus 790 pièces pour les
  cinq, la fin la mieux payée de chacune), une longue-vue (quatre fois plus près), une recette d'appeau, une montre de
  gousset, de petits avantages durables (la chambre de l'auberge pour rien ; une source qui, à l'aube, referme une
  plaie) — et des morceaux de vérité sur la vallée.

### Mode Création

Éditeur de monde séparé : relief, peinture du sol, objets, animaux, blocs. **Exporter** télécharge un fichier
`.prairie.json`, rechargeable avec **Importer**.

## Équilibrage

Le jeu a été équilibré d'un bloc, en mesurant d'abord : chaque système avait été écrit avec ses propres nombres, et
la journée de vingt minutes (dix de jour, dix de nuit) changeait tous les rythmes. Vingt et un domaines, chacun avec sa
mesure et ses vérifications dans `tools/equilibrage/` : le jeu entier est chargé dans une machine virtuelle node (sans
navigateur, `tools/equilibrage/vm.js`), ses propres fonctions calculent les rendements, les espérances et les
fréquences, et la commande échoue si l'on recasse un équilibre :

```bash
node tools/equilibrage.js                 # les vingt et un domaines (≈ 25 min)
node tools/equilibrage.js commerce        # ou un seul : commerce, ferme, risques, survie, hasard, commandes, carte, nature, batiments
node tools/equilibrage.js S D1 E2         # ou plusieurs ; ceux de la douzième vague : S, D1, D2, E1, E2, E3, F, G
node tools/equilibrage.js R P Q T         # ceux de la treizième vague : R, P, Q, T
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

### La ferme et le temps

Les règles de la terre (`TERRE`, 11-farm-state.js) et du temps, mesurées sur le vrai code (`farm.tick`, `farm.water`,
`farm.fertilize`, la récolte, `weather.dayPlan`, les crues) :

| Réglage | Avant | Après |
|---|---|---|
| Terre arrosée ou mouillée par la pluie | humide 10 h | humide 48 h (deux jours), la canicule 32 h |
| Culture sur terre sèche | perdue après 30 h | tient encore 48 h (deux jours), la canicule 32 h |
| Case labourée laissée vide | redevenait herbe au hasard après 48 h | reverdit après deux jours humides et deux jours secs |
| Fatigue du sol | — | au-delà de 5 récoltes sans engrais : pousse à 50 % ; au-delà de 10 : 25 % ; l'engrais remet à zéro, deux jours d'herbe effacent une récolte |
| Arroseur / arroseur de fer | 3 × 3 / 5 × 5 cases | 7 × 7 / 9 × 9 cases |
| Heures de pluie | 28,5 % | 13,8 % (jours de pluie 48 % → 38 %, longues pluies 44 % → 12 %) |
| Crues | 5,1 par semaine, l'eau haute 33 % des heures | 3,0 par semaine, 7,6 % des heures |
| Engrais à la graineterie ; chou, melon ; repousse du raisin | 10 ; 19, 32 ; 24 h | 2 ; 18, 30 ; 28 h (pour garder les marges du commerce avec la terre humide plus longtemps) |

Orages, brouillard, gel du matin et neige partout gardent leur fréquence. Sous la pluie ou la neige, papillons et
lucioles s'en vont. `node tools/equilibrage.js ferme` (≈ 2 s) vérifie tout cela.

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
- Refuser de suivre un garde (la rébellion) coûte plus cher que se rendre, sans doubler : le cachot d'un premier vol
  passe de 315 à 565 pièces (`risques` le vérifie) ; semer les gardes ajoute 50 pièces à la prime.
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
  fait le mort ; le froid tue lentement (la montagne : un quart d'heure réel de gel ; un jour de neige : quelques
  heures de jeu). Restent d'un coup, voulus : le
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
| Froid de la montagne (11-zzvallee.js) | 1 PV/s : mort en 2 h de jeu | 0,5 PV/s : 4 h ; puis le gel (`11-zzvallee0-gel.js`) : plus de dégâts, un quart d'heure réel de grand froid jusqu'à la mort, le givre à l'écran |
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

**Les événements nouveaux de la douzième vague** (soixante et un : le ciel, les bêtes, les villages, la ferme, les
routes, l'étrange) se règlent dans `HF_FREQ` (11-zzzzF-0-moteur.js) et se mesurent à part : `node tools/equilibrage.js F`
(≈ 10 s ; `F_GRAINES=n` pour n parties) rejoue le tirage du jour tel quel sur cent vingt parties de 288 jours et suit
les tirages au fil du temps pour trois joueurs (un nouveau venu, un fermier, un fermier à l'esprit très sombre).
Environ un événement par jour, tous confondus (1,03 ; 1,14 pour l'esprit sombre), deux le même jour une fois sur
trois, jamais trois ; aucun ne revient plus d'une fois tous les douze jours en moyenne (six pour le panier des
bienfaits), rien avant le troisième jour ; ni renard, ni sangliers, ni couvée, ni mise bas dans une ferme sans bêtes
ni cultures ; l'étrange passe d'un jour sur quatre à un sur trois quand l'esprit s'assombrit.

### Les commandes par la poste

`node tools/equilibrage.js commandes` vérifie que chaque article coûte au carnet le prix de sa boutique (1 600 prix,
amitié 0 à 10), que rien de commandé ne se revend à son prix même sans le port, et joue les remboursements (rayer,
vendeur mort, colis égaré) : on ne récupère jamais plus que ce qu'on a payé.

### La carte et la nature

`node tools/equilibrage.js carte` compte les carrés de 200 m sans lieu (aucun attendu), vérifie l'empreinte des objets
d'avant, la variété du catalogue, ce que rapportent les butins des lieux (les trésors d'une fois font environ 4 000
pièces pour toute la vallée ; ce qui se regarnit, environ 50 pièces par jour en passant partout : la tournée de tous
les coffres reste sous une journée de travail), les deux villages (chaque habitant relié à sa maison) et le poids de la
génération. `node tools/equilibrage.js nature` vérifie que chaque plante donne son objet (avec un effet et des
essences), que chaque arbre donne son bois et que tous les bois servent de « bois », que les bêtes nouvelles sont
complètes, et mesure la fréquence du papillon d'or sur le vrai programme météo (300 parties de 240 jours, trois façons
de jouer) : une fois tous les 39 jours pour le joueur typique, 22 pour qui le cherche, jamais avant le cinquième jour ;
il rapporte au plus 2 % d'une journée de revenu du milieu de partie (5 % pour qui le chasse).

### Les bâtiments

`node tools/equilibrage.js batiments` (≈ 90 s) examine chaque toit de la vallée (un bloc à deux pans ou en flèche, ou
une grande dalle haute sans toit au-dessus) et, dessous, chaque niveau — le sol, puis chaque plancher plus haut — sur
une grille de 0,2 m, à hauteur d'homme, exactement comme le joueur se cogne (marche de 0,55 m, 1,75 m sous un linteau,
0,33 m de rayon ; les portes comptent comme ouvertes). Un niveau est « ouvert » (on y entre à pied), « échelle » (une
interaction qui transporte y dépose le joueur, à l'intérieur), « clos » ou « plein » : la commande échoue s'il en reste
un seul clos, ou plein sous un toit en pente (les masses pleines à dessus plat, fours à chaux ou table des géants, ne
sont pas des bâtiments). Avant la dixième vague : 47 niveaux sans accès ; après : aucun. Elle vérifie aussi les
empreintes des objets d'avant (`BATIMENTS_DETAIL=1` liste tout, `BATIMENTS_GRAINES=1234,77` d'autres graines).

### Les voix, les plantes, les bêtes et la cité

Les domaines de la douzième vague (les événements nouveaux, `F`, sont mesurés avec le hasard, plus haut) :
- `node tools/equilibrage.js S` (≈ 2 s) : chacun des neuf milieux a ses chanteurs (aube, jour, soir, nuit), ses nappes,
  sa pluie et ses bruits rares ; chaque tampon se calcule sans valeur aberrante et n'est pas muet ; la mémoire d'une
  promenade (trois milieux à la fois ; ce qui n'a pas servi depuis cinq minutes est libéré) reste sous 34 Mo ; et la
  rareté : au plus 2,5 chanteurs par minute en plein jour, moins de deux bruits rares.
- `D1` (≈ 2 min) et `D2` (≈ 1,5 min) : chaque plante est complète (objet, type du décor, sprite, icône, effet,
  essences, notice, allure et mot de l'alchimiste, acheteur, prix selon la rareté ; les vénéneuses disent ce qui a
  tué), une cueillette rapporte au plus 30 pièces et les recettes ne font pas d'argent de rien ; la passe de génération
  (graine 1234 : ≈ 1 260 et ≈ 670 pieds) pose chaque espèce dans son milieu, en nombre selon sa rareté, jamais sur un
  chemin, devant une porte ou sur le champ de la ferme, les plantes d'eau dans l'eau et les autres au sec ; les objets
  d'avant ne bougent pas.
- `E1`, `E2`, `E3` (≈ 1,5 à 2 min chacun) : les trente bêtes de chacun sont complètes (conduite, modèle, notice, butin,
  nom à la chasse, cri qui se calcule sans écrêter) ; les objets nouveaux ont un prix modeste, des essences, un
  acheteur et pas de vendeur ; les dangereuses restent rares et lisibles ; `E1` mesure l'attente avant de voir chaque
  espèce là où elle vit, `E2` et `E3` calculent les territoires sur la vraie vallée (chaque espèce en a, les rares
  moins que les communes, ceux du marais dans le marais) ; aucun objet n'est ajouté au monde.
- `G` (≈ 1,5 min) : une seule pierre ronde par vallée, sur la terre ferme, loin des chemins, et un chemin praticable à
  pied pour y monter depuis la ferme ; l'Atelier des corps reste en deçà de la potion de célérité et de l'élixir de
  légèreté, et la cité ne cache pas de quoi tout prendre ; ce qu'on en rapporte, une fois, vaut quelques journées de
  travail, pas une fortune.

### Les trouvailles, les bêtes qui parlent, le nonos et les quêtes à lieux précis

Les domaines de la treizième vague :
- `node tools/equilibrage.js R` (≈ 1,5 min) : la pose sur la vraie vallée (≈ 1 000 trouvailles, 69 des 73 sortes, en
  un quart de seconde ; rien dans l'eau, dans un mur ni devant une interaction, aucune toute petite chose dans l'herbe
  haute, rien d'ajouté à `w.objects`, `w.props` ni `w.inter` : l'empreinte des anciennes parties ne bouge pas) ; la
  valeur, aux prix du jeu : tout ce qui ne se ramasse qu'une fois vaut ≈ 2 000 pièces pour toute la vallée (cinq
  journées et demie de travail du début) ; une journée de promenade (sur les chemins, les rues et les sentiers, au
  hasard des carrefours, avec un petit détour pour ce qu'on aperçoit) rapporte une quarantaine de pièces, ≈ 11 % d'une
  journée de travail du début (la meilleure, un tiers) ; le ramassage le plus acharné, en sachant où tout est, à peu
  près la moitié ; ce qui revient, ramassé chaque jour au plus près, ≈ 6 % ; la sauvegarde ne garde qu'un bit par
  trouvaille (127 octets, quelques centaines au plus quand tout est pris).
- `P` (≈ 2,5 min : deux vallées, graines 1234 et 77) : les huit bêtes ont tous leurs textes (≈ 10 000 mots ; rien de
  vide, aucun gabarit oublié, les bêtes qu'elles nomment existent) ; ce qu'elles demandent existe dans le jeu, et ce
  qu'elles rendent, une fois, ne vaut pas une fortune (≈ 200 pièces pour les huit ; le reste, ce sont des
  renseignements et des endroits) ; leurs endroits : chacune son milieu, loin des autres, pas toutes près de la ferme
  (quatre à plus de 500 m), à la bonne hauteur, et l'on y va à pied depuis la ferme ; la passe de génération ne pose
  rien.
- `Q` (≈ 1,5 min) : le nonos ne se vend pas, et chacune des cinquante-sept sortes de lieux a ses phrases ; trois cents
  tirages des cinq lieux sur la vraie vallée, avec le tirage du jeu : aucun raté, trois cents chaînes différentes, le
  premier lieu à 110-380 m de la ferme, chacun à 150-430 m du précédent et à 140 m au moins des autres, tous à moins
  de 1 150 m de la ferme, l'indice sur la terre ferme et joignable à pied ; la faim du chien, mesurée avec ses vraies
  fonctions avant et après le nonos rendu : un repas de viande le tient 52 h au lieu de 26, chaque stade de faim vient
  deux fois plus tard, trois jours sans manger en deviennent six.
- `T` (≈ 2 min : deux vallées, graines 1234 et 77) : les objets des cinq quêtes à lieux précis ne se vendent pas ;
  chaque quête a sa proposition, ses trois réponses, ses étapes (un lieu nommé, deux plans, une phrase de carnet, ce
  qu'on y trouve), des scènes dedans et dehors, une fin à deux choix ; les récompenses, mesurées avec les vraies
  fonctions (la fin, puis le courrier qui suit) : chaque fin donne quelque chose, aucune plus de 250 pièces, les cinq
  ensemble (la fin la mieux payée de chacune) 790 pièces, un peu plus de deux journées de revenu du début ; les
  vingt-trois lieux trouvés et cadrés dans les deux vallées (le plus lent en un tiers de seconde), aux mêmes positions
  d'une vallée à l'autre.

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
| `09-audio.js`, `09-zaudio-farm.js`, `09-zzaudio-more.js`, `09-zzzaudio-scene.js` | le son : moteur (bus, compression douce, limiteur, réverbération du lieu, son 3D HRTF, écouteur qui suit la caméra), sons synthétisés, ambiances placées autour du joueur |
| `12-zzzzz-sons.js`, `13-zz-son3d.js` | sons des autres modules adoucis ; le son 3D branché sur le monde (bêtes, habitants, étrange, chasse, foudre, violoneux, tornade…), option « Son 3D pour casque » |
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
| `11-zzzz6-*.js` | la lanterne et son huile, les ruches, la mémoire des recettes d'une vie à l'autre |
| `11-zzzzA-commandes.js` | le carnet de commandes, le voiturier et ses colis (`farm.s.commandes`) |
| `11-zzzzB1-ville.js`, `07-zzzzzzzzzzzzB1-ville.js` | on entre partout, en ville : les étages (échelle de meunier et trappe, `b.plafond` pour que l'étage soit sous le toit), les huit tours et le chemin de ronde, le beffroi du clocher, la tente de la diseuse ; `game.insideBuilding` vaut à l'étage (API `b1`) |
| `11-zzzzB2-campagne.js`, `07-zzzzzzzzzzzzB2-campagne.js` | on entre partout, à la campagne : le vieux moulin, le phare, les pigeonniers, les loges, le clocher englouti, les ruines où le butin était muré, la bergerie, les cabanes de l'estive (`farm.s.campagne`, API `campagne`) |
| `11-zzzzC-gardes.js`, `11-zzzzC1-gardes-jeu.js`, `07-zzzzzzzzzzzzC-gardes.js` | les gardes et les chevaliers : les trois nouveaux protecteurs (le chevalier du guet, le garde champêtre, le gendarme), le corps de garde du pont nord et la cabane des gardes (générés après tout le reste), la sommation (se rendre, payer, refuser), la rébellion, les rondes et la relève, ce qu'ils font quand il y a un problème (`farm.s.gardes`, API `gardes`) |
| `09-zzzzS-1-chants.js`, `09-zzzzS-2-fonds.js`, `09-zzzzS-3-scene.js` | les voix de chaque milieu : les chants (trente-cinq oiseaux qu'on entend sans les voir, chacun son phrasé ; un chien au loin, l'angélus), les fonds (insectes, grenouilles, vent dans les arbres, roseaux, bruyère, ressac ; la pluie de chaque milieu, l'égouttement), la scène (les milieux pesés autour de l'écouteur et fondus en quelques secondes, l'heure, le temps qu'il fait ; tampons calculés en tâche de fond, sous le réglage « Ambiance » ; API `ambiance`) |
| `09-zzzzM-*.js`, `12-zzzzM-musique.js` | la musique : le moteur (piano, harpe, célesta, boîte à musique et cordes calculés note par note dans un Worker ; flûte, verre et orgue joués en direct ; réverbération de salle, bus à part), l'aide à l'écriture des accompagnements, les partitions en texte par endroit (prés, forêt, eau, lande, village, nuit, Dessous, autres mondes, cité vaisseau) et celles du domaine public ; dans le jeu (`12-zzzzM-musique.js`) : le choix du morceau, les silences, ce qui la fait taire, les Options (`settings.musique`, `settings.musiqueVol` ; API `musique`) |
| `03-zzzzzD1-plantes.js`, `05-zzzzzD1-plantes.js`, `11-zzzzD1-plantes.js` | cinquante plantes des prés, de la ferme, de la ville, de la lande et des hauteurs : sprites et icônes ; données (allure, notice d'herbier, rareté, prix, essences) ; le jeu : types du décor (après tous les autres : les numéros d'avant ne bougent pas), effets, mot de l'alchimiste, acheteurs, recettes, fouilles, quelques conduites, la passe de génération (`farm.s.d1`, API `d1plantes`) |
| `03-zzzzD2-plantes.js`, `05-zzzzzD2-plantes.js`, `11-zzzzD2-plantes.js` | quarante plantes de la forêt, du bois de bouleaux, du marais et du bord du lac, de même (les plantes d'eau dans l'eau ; `farm.s.d2`, API `d2`) |
| `03-zzzzzE1-icones.js`, `05-zzzzzE1-betes.js`, `07-zzzzzzzzzzzzE1-modeles.js`, `09-zzzzE1-cris.js`, `10-zzzzE1-betes.js`, `11-zzzzE1-betes.js` | trente bêtes des prés, de la ferme et de la ville : icônes des objets, données (bestiaire, notices, butins, objets, essences), modèles en boîtes, cris, réglages des créatures ; le jeu : elles naissent autour du joueur selon le milieu, l'heure, le temps et la rareté (sans passe de génération), leurs lieux se calculent d'après la graine (nid de frelons, toiles, âtre, clocher, réverbères, douves…), la chasse, le filet, la main, les dangers (`farm.s.e1`, API `e1`) |
| `03-zzzzzE2-icones.js`, `05-zzzzzE2-betes.js`, `07-zzzzzzzzzzzzE2-modeles.js`, `09-zzzzE2-cris.js`, `10-zzzzE2-betes.js`, `11-zzzzE2-betes.js` | trente bêtes de la lande, des hauteurs et du bord du lac, en six fichiers de même (icônes, données, modèles, cris, conduites, jeu) : leurs territoires, tirés de la graine au chargement (la pente, l'eau, l'altitude, les buissons), la chasse, le filet, les marchands (`farm.s.e2`, API `e2betes`) |
| `03-zzzzzE3-icones.js`, `05-zzzzzE3-betes.js`, `07-zzzzzzzzzzzzE3-betes.js`, `09-zzzzE3-cris.js`, `10-zzzzE3-betes.js`, `11-zzzzE3-betes.js` | trente bêtes de la forêt, du bois de bouleaux et du marais, de même : leurs territoires (un arbre, un vieux chêne, une rive, une mare, un pan de ciel), leurs heures, leurs mœurs, les sangsues du marais (`farm.s.e3`, API `e3`) |
| `11-zzzzF-*.js`, `09-zzzzF-sons.js` | le hasard de la vallée : le moteur (`11-zzzzF-0-moteur.js` : le tirage du jour à l'aube, ceux du fil du temps là où l'on est, le quota et les écarts `HF_FREQ`, les traces au carnet et dans les conversations) et les soixante et un événements, une famille par fichier, de `11-zzzzF-1-ciel.js` à `11-zzzzF-6-etrange.js` (les textes dans chaque définition) ; leurs sons et la musique des gens (`farm.s.evF`, API `hasardF`) |
| `05-zzzzzG-vaisseau.js`, `07-zzzzzzzzzzzzG-vaisseau.js`, `11-zzzzG-portail.js`, `11-zzzzG-vaisseau.js`, `11-zzzzG-vaisseau2-choses.js`, `11-zzzzG-vaisseau3-corps.js` | la pierre ronde et la cité vaisseau : objets, papiers, journaux et voix de la veilleuse ; matières, modèles et icônes ; la pierre (générée après tout le reste, avec son propre tirage) ; la cité, monde « à part » `vaisseau` (plan, lieux, un seul voyage, le retour) ; ses machines, écrans, messages et maisons ; l'Atelier des corps (`farm.s.vaisseau`) |
| `05-zzzzzR-ramasser.js`, `07-zzzzzzzzzzzzR-ramasser.js`, `11-zzzzR-ramasser.js` | des trouvailles un peu partout : les objets nouveaux et quatre recettes, le catalogue des soixante-treize sortes (ce qu'on ramasse, combien, dans quels milieux, ce qui revient et en combien de jours, la saison des fruits tombés) et les lettres trouvées ; les modèles, chacun à sa taille, et les icônes ; la passe de génération (après toutes les autres, tirage propre : la liste dans `w.ramasse`, rien d'ajouté à `w.objects`, `w.props` ni `w.inter`), les cases de 16 m, la touche E, le dessin dans le tampon des objets posés, l'éclat du soleil sur ce qui brille, le vol chez les gens (`farm.s.ramasse` : un bit par trouvaille ; API `ramasser`) |
| `05-zzzzzP-betes.js`, `07-zzzzzzzzzzzzP-betes.js`, `09-zzzzzP-voix.js`, `10-zzzzzP-betes.js`, `11-zzzzP-betes.js` | les bêtes qui parlent : ce qu'elles sont (endroit, heures, temps, service) et tout ce qu'elles disent ; leurs modèles en boîtes ; leurs voix (un petit cri au début de chaque réplique, en 3D, et le bruit de leur fuite) ; les créatures ; le jeu : leurs endroits (une passe de génération qui ne pose rien : `w.betesP`), leur apparition hors de la vue, la conversation, les services, la menace, les coups et la mort, ce qu'en disent les gens, le carnet (`farm.s.betesParlantes`, API `betesParlantes`) |
| `05-zzzzzQ-nonos.js`, `11-zzzzQ-1-nonos.js`, `11-zzzzQ-2-scenes.js`, `12-zzzzzQ-nonos.js` | le nonos du chien : l'objet, les sortes de lieux et leurs phrases, les indices, les textes ; la quête (son début, les cinq lieux tirés au début de la quête, sans passe de génération, les indices dessinés à la volée, le chien qui flaire puis ronge son os, la faim deux fois moins vite) ; les scènes (moteur `cine` : le début, les souvenirs à hauteur de chien, la trouvaille, le retour) ; le carnet, « Quête principale — facultative », et ses « Revoir » (`farm.s.nonos`, API `nonos`) |
| `05-zzzzzT-quetes.js`, `11-zzzzT-1-quetes.js`, `11-zzzzT-2-scenes.js`, `12-zzzzzT-quetes.js` | les cinq quêtes principales à lieux précis (la chambre sept, le feu du lac, les toiles d'Ardoin, la crécelle, la source froide) : les objets et tous les textes (`QT_QUETES`) ; la quête (les propositions — un habitant, une lettre, un avis, un objet trouvé —, les lieux précis, les objets dessinés à la volée, les étapes, les fins et leurs récompenses, les avantages durables) ; les scènes (cadrages dehors et dedans, l'heure du lieu, les lumières de scène, les épilogues) ; le carnet, rubrique « Quêtes principales », la lettre et les papiers qui se relisent (`farm.s.quetes`, API `quetes`) |
| `11-zzz00b-pensees.js`, `tools/pensees.js` | dire peu : `penser.une` (une règle dite une fois par vie), `penser.pas` (un avertissement espacé), `farm.s.pensees` ; l'inventaire des pensées (`node tools/pensees.js`) |
| `11-zzvallee0-gel.js` | le gel en altitude : la jauge `farm.s.gel`, le givre à l'écran, la mort de froid |
| `11-zzzz7-carte*.js`, `07-zzzzzzzzzz-carte.js` | un lieu tous les 200 m (catalogue, textes, lettres, inscriptions, petits secrets), les deux peuples de surface et leurs parlers (`farm.s.carte2`, API `carte2`) |
| `05-zzzz-nature.js`, `03-zzzz-sprites-nature.js`, `11-zzzz8-nature.js` | la nature : plantes et leurs objets, effets et essences, bois par essence, bêtes nouvelles, papillon d'or (`farm.s.nature2`, API `nature2`) |
| `11-zzzz9-souterrain*.js`, `07-zzzzzzzzzzz-souterrain.js` | le Dessous : moteur (sol et voûte en reliefs, rendu, physique, bascule), le passage de Valbrume, les salles, minerais, plantes et bêtes d'en bas, ceux d'en bas et leur parler, ce qui s'y cache, les chemins du retour (`farm.s.souterrain`, par identifiants stables ; API `souterrain`) |
| `11-zzzz4-ferme-temps.js`, `11-zzzz4-meubles.js`, `07-zzzzzzzz-meubles.js` | portée des arroseurs, petites bêtes sous la pluie ; acheter et meubler sa maison (meubles, garde-meuble) |
| `11-zzzz1-butin.js`, `11-zzzz2-objets.js`, `11-zzzz3-depouilles.js` | menu de butin, meubles fouillables, encart de la boutique ; ramasser les petits objets, tout casser avec le bon outil ; les morts qui restent au sol |
| `14-i18n.js`, `14-i18n-en.js` | traduction anglaise (bascule à chaud) et ses données |
| `tools/` | `i18n-extract.js`, `i18n-delta.js`, `i18n-build.js` (vagues de traduction) ; `wiki-build.js` (génère `Prairie-Wiki.html`) ; `equilibrage.js` (mesures et vérifications d'équilibrage, voir plus haut ; un fichier par domaine dans `equilibrage/`, pris de lui-même — la douzième vague y a ajouté `S.js`, `D1.js`, `D2.js`, `E1.js`, `E2.js`, `E3.js`, `F.js` et `G.js`, la treizième `R.js`, `P.js`, `Q.js` et `T.js`) |
| `shell.html` | HTML + CSS |
| `index.html`, `.nojekyll`, `tools/beta-code.js` | la bêta en ligne : la page d'accueil et ses deux codes (le jeu, le wiki), le site servi tel quel par GitHub Pages, changer un code |
| `libre/` | la partie sans code : sa page d'accueil (`libre/index.html`), le jeu et le wiki sans leur porte (écrits par `node build.js` et `node tools/wiki-build.js`) |
| `vitrine/` | la présentation du jeu : une page (`vitrine/index.html`), 106 images (captures du jeu en 1920 × 1080, du wiki, affiches ; `img/` en grand, `min/` en vignettes) et les 42 musiques en MP3 (`audio/`) ; liée depuis les deux pages d'accueil |

Le son, pour placer un bruit dans le monde : `sound.pan(p, dest)` accepte un panoramique −1..1 (comme avant) **ou une
position** (`[x, y, z]`, `{x, y, z}`, une bête, un habitant) ; `sound.ici(pos, () => …, o)` place tous les sons joués
dans la fonction (`o.att : 'aucune'` si le volume tient déjà compte de la distance, `o.suivre : true` pour une source
qui bouge ; `sound.entrer(pos, o)` / `sortir(k)` : la même chose sans fermeture) ; `sound.en3d(pos, dest)` donne un
nœud d'entrée placé ; `sound.source(clé, type, pos, k)` entretient une boucle d'ambiance placée (`riviere`, `clapotis`,
`feu`, `vent`, `feuilles`, `grillon`, `bourdon` — à rafraîchir au moins chaque seconde, elle s'éteint seule sinon) ;
`sound.cri(t, {…})` fabrique un cri « voisé » (hauteur, formants, vibrato, rugosité, souffle) ; `sound.lieuForce =
'grotte'` impose une réverbération (sinon `dehors`, `foret`, `montagne`, `piece`, `salle` ou `grotte`, choisie d'après
le lieu). Une fonction enveloppée garde son original dans `f.__orig` (l'outil d'équilibrage y lit les tirages).

Le marais de la vallée dessinée n'a pas de case de biome : `game.biomeAt` n'y répond jamais « marais » (une
particularité ancienne de `designFields`, dans 06-zzdesign.js, à ne pas corriger : elle changerait la génération et les
sauvegardes). Les voix des milieux, la musique et les bêtes du marais le reconnaissent à ses mares (les `w.fishZones`
« marais ») et à leurs abords : `e3.milieu(w, x, z)` répond « marais » dans le rayon des mares, à moins de 5 m
au-dessus de l'eau.

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
