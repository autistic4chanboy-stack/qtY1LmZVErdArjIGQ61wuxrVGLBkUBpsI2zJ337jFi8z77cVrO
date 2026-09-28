# Prairie — La vieille ferme

Jeu de ferme et d'horreur lente à la première personne, en 3D rétro (pixels façon Doom, personnages et
bêtes en boîtes façon 1998), presque sans affichage à l'écran. Un mode Création (éditeur de monde) est inclus.

## Jouer

Ouvrir **`Prairie.html`** dans un navigateur récent (Chrome, Edge ou Firefox, WebGL 2 requis).
Aucune installation ni connexion : tout est dans ce seul fichier. La partie est sauvegardée automatiquement.

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
- **Fabrication** (Tab) : outils, lingots au four, cuisine au feu, et des dizaines d'objets pour arranger la ferme
  (clôtures, haies, pavés, parterres, lampadaires, ruches, statues, puits, arches…). Certains plans s'apprennent des habitants.
- **Machines** : tonneau, baratte, fumoir, presse, meule à bras, composteur. On y dépose des produits (E), on revient
  quelques heures plus tard chercher cidre, vin, beurre, fromage, huile, jus, farine, fumaisons ou engrais.
- **Fouille** (jamais chez les habitants) : coffres, tonneaux et caisses des campements, ruines, hameau, chapelle, phare,
  mines, barques et charrettes renversées se remplissent de nouveau au bout de 3 jours. Chaque matin, de la terre
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
- **Prière et religions** : l'Église (messe le dimanche, calvaires, bénitier), la Vieille Foi (la Mère des Moissons, la Dame
  du Lac, le Cerf Blanc) et Ceux d'En-Dessous (pactes qui exaucent, avec un prix). Faveurs cachées, bénédictions, offrandes.
- **Légendes** : quatorze légendes racontées par les habitants ou lues dans les livres ; chacune mène à un vrai secret.
  Onze reliques des Anciens, réunies à l'autel du cercle à minuit, apaisent la vallée.
- **Panneaux** : poteaux indicateurs aux carrefours, panneaux-cartes (« vous êtes ici »), carte de la vallée à la poste.
- **Villes et villages** : enseignes qu'on peut lire, bacs à fleurs, panneau d'affichage (avis, messe, arrivages de graines,
  objets perdus, chevaux sauvages aperçus…), terrasse de l'auberge, second marché, monument aux morts, drapeau de la mairie,
  bancs, barres d'attache et abreuvoirs (le cheval y boit), arrière-cours avec linge, potagers, bois et poules ; pigeons
  et chats. Au hameau : potagers, four à pain, ruches, cage à poules ; au hameau abandonné, une balançoire qui bouge
  seule ; filets et séchoir chez le pêcheur ; rails et wagonnets à la mine.
- **Livraisons** : la postière confie des colis à porter avant 18 h. Le **cheval** va bien plus vite (E pour monter, G pour siffler).

### Les habitants

Douze habitants nommés (le prénom change à chaque partie), chacun avec sa routine, ses répliques, ses quêtes et sa boutique.
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
