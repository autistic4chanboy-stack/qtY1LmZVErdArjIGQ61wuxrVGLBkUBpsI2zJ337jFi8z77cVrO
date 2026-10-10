// ============================================================================
//  CLINS D'ŒIL (agent E16, seizième vague) — 1. LES DONNÉES
//  Des hommages cachés à d'autres jeux, glissés dans la vallée sans rien
//  annoncer : des rencontres rares, des choses posées dans des coins, des mots
//  que les habitants laissent échapper une fois. Rien n'en parle : ni le wiki,
//  ni le README, ni les découvertes (les objets « e16 » n'y entrent pas).
//  (Pour qui lit le code : la liste des jeux est dans ce fichier, en commentaires.)
//  Noms en minuscules : les outils du wiki ne lisent que les tables en capitales.
//  API : e16Regl (les réglages, lus par tools/equilibrage/E16.js), e16Paroles
//  (les mots des habitants), e16Textes (les lettres, les inscriptions).
// ============================================================================

// les réglages : les récompenses restent petites (l'équilibrage le vérifie)
const e16Regl = {
  roll: 12,                 // s : on tente une rencontre toutes les 12 s (une à la fois, deux au plus)
  anneaux: 7,               // anneaux semés par le hérisson bleu
  anneauSous: 1,            // pièce par anneau
  anneauVie: 90,            // s : un anneau reste au sol
  feuSoin: 40,              // points de vie au repos près du feu à l'épée (une fois par jour)
  etoileSoin: 15,           // la petite étoile (une fois par jour)
  guimauve: 6,              // faim apaisée par la guimauve (une fois par jour)
  champiSoin: 25,           // le champignon vert (une fois : il n'y en a qu'un)
  pelle: 1 / 140,           // chance qu'un trou à la pelle fasse sonner des pièces
  pelleSous: [3, 8],        // combien
  graines: 2,               // le présent des petits esprits verts (une fois)
  cerises: 3, fraises: 2,   // trouvailles (une fois)
  parler: 0.05,             // chance qu'un habitant laisse échapper un de ses mots (chacun une seule fois)
  garde: 0.03,              // chance qu'un garde dise sa phrase en saluant (une fois par jour au plus)
};

// les objets cachés (hors du wiki et des découvertes : drapeau e16)
defItem('e16_epee', 'Épée de la pierre', 'tresor', 15, ['leg_rapiere', '#7a90c0'], { e16: true, desc: 'Une épée ancienne à la garde bleue, tirée d’un rocher de la forêt. Elle ne coupe plus grand-chose. On jurerait qu’elle brille un peu quand on est en pleine santé.' });
defItem('e16_champi_vert', 'Champignon vert', 'cueillette', 2, ['champi', '#3e9a3e'], { e16: true, food: 6, heal: e16Regl.champiSoin, desc: 'Vert à pois blancs. Un homme en vert l’a donné, au hameau abandonné : « une vie de plus », a-t-il dit, sans y croire.' });
defItem('e16_caisse_coeur', 'Caisse au cœur', 'tresor', 1, ['objet', '#d89aa8'], { e16: true, desc: 'Une petite caisse de bois, un cœur rose peint sur chaque face. Elle ne dit rien. On s’y attache quand même.' });
defItem('e16_pied_de_biche', 'Pied-de-biche', 'materiau', 6, ['marteau', '#b03020'], { e16: true, desc: 'Une barre de fer peinte en rouge, recourbée au bout. Quelqu’un a gravé une petite lettre grecque sur la poignée.' });

// ce que les habitants laissent échapper (une fois chacun, rarement, en bavardant) : [clé, texte]
const e16Paroles = {
  // Skyrim, Fallout, Super Mario Bros.
  chevalier_guet: [
    ['genou', 'J’étais aventurier, moi aussi, dans le temps. Et puis j’ai pris une flèche dans le genou.'],
    ['guerre', 'La guerre… La guerre ne change jamais.'],
    ['chateau', 'Merci d’être venu jusqu’ici. Mais la demoiselle que vous cherchez est dans un autre château.'],
  ],
  // Metal Gear Solid
  garde: [['carton', 'J’ai cru voir une caisse bouger, cette nuit, près du corps de garde. Une caisse ! Je me fais vieux.']],
  // Among Us
  garde_champetre: [['louche', 'Je l’ai vu sortir par le soupirail de la grange, je vous dis. Et puis plus rien. C’est louche. Très louche.']],
  // The Secret of Monkey Island
  gendarme: [['vache', 'Vous vous battez comme un bouvier. … Allons, c’est là que vous deviez répondre : « Comme c’est à propos : vous, vous vous battez comme une vache. »']],
  // Pokémon, The Secret of Monkey Island, Tetris
  fillette: [
    ['bocaux', 'Je les attrape tous dans des bocaux : les grillons, les scarabées, les lucioles… Tous. Il faut tous les attraper.'],
    ['singe', 'Regardez derrière vous ! Un singe à trois têtes !'],
    ['briques', 'J’ai rêvé de briques qui tombaient du ciel. Quand une ligne était pleine, elle s’en allait. Et la musique allait de plus en plus vite.'],
  ],
  // Animal Crossing, Donkey Kong
  colporteur: [
    ['raton', 'À la foire de Bresse, un raton laveur tient boutique. Il vous vend une maison à crédit, puis une plus grande, et vous remboursez toute votre vie. Il sourit tout le temps.'],
    ['tonneaux', 'Un cirque a perdu son grand singe, du côté de la mine. Depuis, des tonneaux dévalent les pentes. Un charpentier moustachu lui court après en sautant par-dessus.'],
  ],
  // The Witcher, Final Fantasy
  colporteuse: [
    ['sorceleur', 'L’homme aux cheveux blancs, avec ses deux épées ? Il passe à l’auberge, des fois. Il ne parle que de ses cartes. Et du vent.'],
    ['oiseau', 'Là-haut, à l’estive, il y a un grand oiseau jaune qu’on monte comme un cheval. Il fait « couèque ». Si, si.'],
  ],
  // The Legend of Zelda (le présent est donné une fois)
  nain_ancien: [['seul', 'C’est dangereux d’y aller seul. Tiens, prends ceci.']],
  // Metroid, Minecraft
  nain_forgeronne: [
    ['boule', 'Une chasseuse en armure orange est passée par les galeries. Elle se mettait en boule pour passer sous les rochers. Jamais vu ça.'],
    ['droit', 'Ne creuse jamais tout droit vers le bas. Jamais. C’est la première chose qu’on apprend chez nous.'],
  ],
  // Diablo, Castlevania : Symphony of the Night, Myst
  libraire: [
    ['ecoutez', 'Restez un moment, et écoutez…'],
    ['tas', 'Qu’est-ce qu’un homme ? Un misérable petit tas de secrets. Ce n’est pas de moi : d’un comte, dans un livre que je n’ai jamais retrouvé.'],
    ['ile', 'J’ai catalogué un livre, un jour, qui montrait une île. Dans l’image, les vagues bougeaient. J’ai posé la main dessus. Je me suis réveillé ailleurs.'],
  ],
  // BioShock
  maire: [['obligeance', 'Auriez-vous l’obligeance de… Non. Rien. Je me méfie de cette formule, depuis quelque temps.']],
  // Age of Empires
  cure: [['wololo', 'Wololo… Pardon. Une vieille prière de mon séminaire. Elle faisait changer les gens de couleur, disait-on.']],
  // Five Nights at Freddy's
  aubergiste: [['automates', 'L’ancien patron avait acheté des automates à une foire : un ours, un lapin, une poule. On les a descendus à la cave. Je n’y vais plus après minuit.']],
  // Street Fighter
  forgeron: [['hadou', 'Un lutteur venu d’Orient est passé à la foire. Il lançait du feu avec les mains en criant « Hadou… » quelque chose. J’ai cru que ma forge allait prendre.']],
  // Castlevania
  chasseur: [['fouet', 'Mon arrière-grand-mère était une Belmont, à ce qu’on dit. Ils chassaient les vampires au fouet. Moi, je me contente des lapins.']],
  // Silent Hill
  guerisseuse: [['sirene', 'Quand la brume tombe sur Valbrume et qu’on entend une sirène au loin, rentrez chez vous. Ne demandez pas pourquoi.']],
  // Harvest Moon
  eleveuse: [['coeurs', 'Mon grand-père disait : parle à tes bêtes tous les jours, brosse-les, et elles te le rendront en cœurs. Il les comptait, les cœurs. Il était un peu bizarre.']],
  // Stardew Valley
  grainetiere: [['esprits', 'Le soir, près des vieilles maisons, il y a de petits esprits verts qui ramassent ce qu’on laisse traîner. Si on leur donne des graines, ils réparent les choses.']],
  postiere: [['grand_pere', 'Il y a une lettre pour vous. Elle dormait au fond d’un tiroir, avec ces mots sur l’enveloppe : « Pour mon petit-enfant, quand il aura retrouvé la terre. »']],
  // Portal
  boulangere: [['gateau', 'Un gâteau ? Promis, il y en aura un à la fin. Il y en a toujours un, à la fin.']],
  // Outer Wilds
  estive_baile: [['harmonica', 'Il y a un vieux, plus haut, qui joue de l’harmonica près de son feu. Il dit qu’il a déjà vécu cette journée des centaines de fois, et qu’à la fin, le soleil grossit.']],
  // Final Fantasy
  estive_patre: [['siffle', 'Le grand oiseau jaune ? Il vient quand je siffle. Pas toujours.']],
  alchimiste: [['phenix', 'Une potion qui relève les morts ? Certains appellent ça une plume de phénix. Moi, j’appelle ça une escroquerie.']],
};

// les textes qu'on lit
const e16Textes = {
  // Silent Hill 2 (Valbrume : la ville de la brume)
  lettre: ['Une lettre roulée dans une bouteille', 'Dans mes rêves agités, je vois cette ville. Valbrume.\nTu m’avais promis de m’y ramener un jour. Tu ne l’as jamais fait.\nAlors j’y suis, seule, à notre endroit… à t’attendre.', '— M.'],
  // Stardew Valley
  grandPere: ['Une lettre jaunie', 'Mon petit,\nSi tu lis ceci, c’est que tu as quitté la ville pour la terre. Je savais que tu y viendrais.\nIl n’y a pas de plus grand bien que de cultiver un lien avec la nature et avec ceux qui vivent près de toi.\nNe laisse pas l’ouvrage de tous les jours te faire oublier ce qui compte.\nJe reviendrai voir ce que tu en as fait.', '— Ton grand-père'],
  // Portal
  gateau: ['Griffé dans la roche', 'LE GÂTEAU EST UN MENSONGE\nLE GÂTEAU EST UN MENSONGE\nLE GÂTEAU EST UN MENSONGE\nLE GÂTEAU EST UN MENSONGE\nle gâteau est un mensonge\nle gâteau est un mensonge'],
  // Dark Souls, Elden Ring : les messages laissés au sol
  craie: ['Essayez de sauter', 'Trésor en avant', 'Mais un trou…'],
};
