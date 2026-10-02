// ============================================================================
//  LES BÊTES DES BOIS ET DU MARAIS (agent E3, douzième vague) — données
//  Trente espèces : dix de la forêt, dix du bois de bouleaux, dix du marais.
//  Ici : le livre des bêtes (ESPECES_ANIMAUX, NOTICE_ANIMAUX), ce qu'elles
//  laissent (PREY), les objets nouveaux, leurs essences (alchimie), qui les
//  achète. Les créatures (CREATURES) : 10-zzzzE3-betes.js ; leurs modèles :
//  07-zzzzzzzzzzzzE3-betes.js ; leurs cris : 09-zzzzE3-cris.js ; leur vie (où
//  et quand elles paraissent, ce qu'elles font) : 11-zzzzE3-betes.js.
// ============================================================================
// [créature, nom, milieux (le premier : son chapitre du livre), rareté (0-4), dangereuse (0-3)]
const E3_BETES = [
  // la forêt
  ['daim', 'Daim', ['foret', 'bouleaux'], 1, 1], ['autour', 'Autour des palombes', ['foret', 'sapiniere'], 2, 1],
  ['pic_noir', 'Pic noir', ['foret', 'sapiniere'], 1, 0], ['becasse', 'Bécasse des bois', ['foret', 'bouleaux'], 1, 0],
  ['cigogne_noire', 'Cigogne noire', ['foret', 'marais'], 3, 0], ['sonneur', 'Sonneur à ventre jaune', ['foret'], 1, 0],
  ['coronelle', 'Coronelle lisse', ['foret', 'lande'], 2, 1], ['capricorne', 'Grand capricorne', ['foret'], 2, 0],
  ['grand_mars', 'Grand mars changeant', ['foret'], 2, 0], ['oreillard', 'Oreillard roux', ['foret', 'bouleaux'], 1, 0],
  // le bois de bouleaux
  ['gelinotte', 'Gélinotte des bois', ['bouleaux', 'sapiniere'], 2, 0], ['pic_epeiche', 'Pic épeiche', ['bouleaux', 'foret'], 0, 0],
  ['bondree', 'Bondrée apivore', ['bouleaux', 'foret'], 2, 0], ['moyen_duc', 'Hibou moyen-duc', ['bouleaux', 'foret'], 1, 0],
  ['musaraigne', 'Musaraigne carrelet', ['bouleaux', 'foret'], 0, 0], ['muscardin', 'Muscardin', ['bouleaux', 'foret'], 1, 0],
  ['lezard_vivipare', 'Lézard vivipare', ['bouleaux', 'marais'], 0, 0], ['grenouille_rousse', 'Grenouille rousse', ['bouleaux', 'foret'], 0, 0],
  ['morio', 'Morio', ['bouleaux'], 2, 0], ['cicindele', 'Cicindèle champêtre', ['bouleaux', 'lande'], 1, 0],
  // le marais
  ['busard_roseaux', 'Busard des roseaux', ['marais'], 1, 0], ['bihoreau', 'Bihoreau gris', ['marais', 'berges'], 2, 0],
  ['aigrette', 'Aigrette garzette', ['marais', 'berges'], 2, 0], ['rale_eau', 'Râle d’eau', ['marais'], 1, 0],
  ['becassine', 'Bécassine des marais', ['marais'], 1, 0], ['poule_eau', 'Gallinule poule-d’eau', ['marais', 'berges'], 0, 0],
  ['rainette', 'Rainette verte', ['marais'], 1, 0], ['sangsue', 'Sangsue médicinale', ['marais'], 1, 0],
  ['crossope', 'Crossope aquatique', ['marais', 'riviere'], 2, 0], ['cuivre_marais', 'Cuivré des marais', ['marais'], 2, 0],
];
ESPECES_ANIMAUX.push(...E3_BETES);
Object.assign(NOTICE_ANIMAUX, {
  daim: 'Plus petit que le cerf, plus grand que le chevreuil, la robe fauve semée de taches blanches, le derrière blanc bordé de noir. Le mâle porte des bois aplatis comme des pelles. Ils vont par petites hardes et ne quittent guère leur bois. Le mâle n’aime pas qu’on s’attarde près de lui : il gratte le sol et baisse la tête avant de charger.',
  autour: 'Le chasseur des bois : grand comme une buse, gris dessus, barré dessous, l’œil orange sous un sourcil blanc. Il file entre les troncs sans en toucher un seul et prend un pigeon en plein vol. Près de son arbre, il ne recule devant personne : on a vu des bûcherons rentrer le front griffé.',
  pic_noir: 'Noir comme un corbeau et presque aussi grand, une calotte rouge sang. Il creuse dans les vieux arbres des trous où l’on passerait le poing. Son cri traîne sous les arbres comme une plainte, et l’on se retourne.',
  becasse: 'On marche dessus avant de la voir : feuille morte parmi les feuilles mortes, elle ne bouge qu’au dernier instant, dans un grand bruit d’ailes. Au crépuscule, elle passe au-dessus des arbres en grognant doucement : c’est la croule. Elle porte au coude de l’aile une petite plume raide que les peintres paient cher.',
  cigogne_noire: 'La sœur sauvage de la cigogne des clochers : noire aux reflets verts, le ventre blanc, le bec et les pattes rouges. Elle fuit les hommes et vit au fond des bois, au bord de l’eau. On la voit une fois, et l’on n’est pas sûr de l’avoir vue.',
  sonneur: 'Un petit crapaud gris, pas plus gros qu’une noix, qui vit dans les ornières pleines d’eau. Il chante d’une voix de cloche fêlée, très douce. Inquiété, il se cambre et montre un ventre jaune taché de noir, comme pour dire qu’il ne faut pas le manger.',
  coronelle: 'On la prend pour une vipère, et on la tue. Elle n’en a pas le venin : une petite couleuvre grise ou rousse, tachée sur le dos, un trait sombre à travers l’œil. Prise en main, elle mord, et elle sent mauvais. Elle mange les lézards, et les jeunes vipères.',
  capricorne: 'Le plus long des scarabées : noir, roux au bout des élytres, et des antennes plus longues que lui. Il vit des années dans le cœur des vieux chênes, qu’il creuse. Il sort au crépuscule et grimpe sur l’écorce ; tenu dans la main, il grince.',
  grand_mars: 'Un grand papillon brun qui, sous un certain angle, devient d’un violet de vitrail. Il vole haut, à la cime des chênes, et ne descend que le matin, pour boire aux flaques des chemins. Les collectionneurs de la ville le cherchent.',
  oreillard: 'Une chauve-souris aux oreilles presque aussi longues que le corps. Elle vole lentement entre les arbres, s’arrête en l’air comme une phalène et cueille les papillons de nuit sur les feuilles. Au repos, elle replie ses oreilles sous ses ailes.',
  gelinotte: 'Une petite poule des bois, grise et rousse, qui reste tapie jusqu’à ce qu’on soit sur elle, puis part dans un grand fracas et se pose dans un arbre, droite contre le tronc. Son chant est un sifflement si fin qu’on le prend pour celui d’un insecte. La meilleure chair des bois, disent les chasseurs.',
  pic_epeiche: 'Noir et blanc, le dessous de la queue rouge. Il tambourine sur les branches mortes, vite et sec, pour dire où commence son domaine. Un « kik » bref, puis plus rien. C’est le plus commun des pics.',
  bondree: 'On la prend pour une buse. Elle n’en a ni les mœurs ni le goût : elle déterre les nids de guêpes avec ses pattes et mange les larves sans craindre les piqûres. Une petite tête de pigeon, des plumes serrées comme des écailles sur la face. Elle passe l’été dans nos bois et repart vers des pays qu’on ne connaît pas.',
  moyen_duc: 'Un hibou mince, aux longues aigrettes, aux yeux orange. Le jour, il se tient raide contre un tronc et ressemble à un bout de branche. La nuit, il pousse un « hou » sourd, toujours le même, qu’on entend de loin.',
  musaraigne: 'Plus petite qu’une souris, le museau long et mobile, le dos brun, les flancs plus clairs. Elle mange sans arrêt, jour et nuit, et meurt de faim en quelques heures. On l’entend plus qu’on ne la voit : des cris aigus dans les feuilles, quand deux se rencontrent. Les chats la tuent et ne la mangent pas.',
  muscardin: 'Un petit rongeur couleur de miel, aux grands yeux noirs, à la queue touffue. Il vit dans les noisetiers et les ronces, la nuit, et dort tout l’hiver roulé en boule dans un nid d’herbes, si profondément qu’on peut le prendre dans la main sans l’éveiller.',
  lezard_vivipare: 'Un lézard brun, plus sombre que celui des murailles, qui aime les bois humides et les tourbières. Il ne pond pas : les petits naissent tout formés, noirs comme de l’encre. Il prend le soleil sur les souches et file sous la mousse.',
  grenouille_rousse: 'Une grenouille brune ou rousse, une tache sombre derrière l’œil comme un masque. Elle vit loin de l’eau, dans les bois humides, et n’y retourne que pour pondre. Elle saute loin, en zigzag. Ses cuisses se mangent.',
  morio: 'Un grand papillon couleur de vin sombre, bordé de jaune pâle et semé de points bleus. Il boit la sève qui coule des bouleaux blessés. Il passe l’hiver endormi dans un creux d’arbre et reparaît aux premiers soleils, les ailes un peu usées.',
  cicindele: 'Un petit scarabée vert émeraude, piqueté de blanc, qui court sur les chemins de sable plus vite qu’on ne le suit des yeux, et s’envole d’un coup pour se reposer trois pas plus loin. Il chasse les fourmis. Ses mandibules pincent.',
  busard_roseaux: 'Un rapace brun à la tête crème, qui vole bas au-dessus des roseaux, les ailes relevées en V, en se balançant. Il tombe d’un coup sur une poule d’eau ou un rat. Il niche à même les roseaux, sur un tas de tiges.',
  bihoreau: 'Un petit héron trapu, le dos noir, les ailes grises, l’œil rouge, deux longues plumes blanches sur la nuque. Le jour, il dort dans les arbres au bord de l’eau, voûté. Au crépuscule, il part pêcher en lançant un « couac » rauque. On l’appelle le corbeau de nuit.',
  aigrette: 'Un petit héron d’un blanc parfait, le bec noir, les pattes noires et les doigts jaunes. Elle piétine la vase pour faire sortir les petits poissons. Elle porte sur le dos de longues plumes fines que les modistes de Paris paient au poids de l’or : on en a tant tué qu’on n’en voit plus guère.',
  rale_eau: 'On l’entend, on ne le voit pas : dans les roseaux, des cris de cochon qu’on égorge, des grognements, des gémissements. C’est un oiseau mince comme une lame, le bec rouge, les flancs rayés, qui se glisse entre les tiges. S’il traverse un passage découvert, il court, la queue relevée.',
  becassine: 'Elle part sous vos pieds avec un cri rauque et s’enfuit en zigzag, si vite que les meilleurs tireurs la manquent. Un long bec droit, la tête rayée. Au crépuscule, elle monte haut et se laisse tomber : ses plumes de queue bêlent comme une chèvre. On l’appelle la chèvre volante.',
  poule_eau: 'Noire, avec un écusson rouge sur le front et une ligne blanche au flanc. Elle nage en hochant la tête et en relevant la queue, blanche dessous. Inquiète, elle court sur l’eau en battant des ailes jusqu’aux roseaux.',
  rainette: 'Une petite grenouille vert pomme, lisse, avec une raie sombre sur le flanc. Elle grimpe aux roseaux grâce aux ventouses de ses doigts. Les nuits chaudes, elles chantent toutes ensemble, si fort qu’on les entend d’une lieue. Dans un bocal, dit-on, elle annonce la pluie en montant à l’échelle.',
  sangsue: 'Un ver noir et plat, rayé de roux, qui nage dans les mares en ondulant. Elle sent celui qui entre dans l’eau et vient se coller à ses jambes. Les médecins en posent par dizaines contre les fièvres ; des femmes en vivent, qui entrent dans les mares jambes nues et les ramassent à la main. Les apothicaires les achètent.',
  crossope: 'Une musaraigne qui nage : noire dessus, blanche dessous, elle plonge dans les mares et court au fond, enveloppée de bulles d’argent. Sa morsure engourdit les grenouilles et les petits poissons. On la voit une seconde, puis plus rien qu’un sillage.',
  cuivre_marais: 'Un petit papillon d’un orange de cuivre rougi au feu, qui vole bas dans les prés mouillés et se pose sur les fleurs des fossés. Il ne vit que là, et disparaît quand on draine le marais.',
});
// ce qu'elles laissent (la chasse ; les insectes et les papillons se prennent au filet, ils ne se tirent pas)
Object.assign(PREY, {
  daim: { hp: 32, drop: [['viande', 2, 3], ['cuir', 1, 1]] }, autour: { hp: 5, drop: [['plume', 1, 2]] }, pic_noir: { hp: 4, drop: [['plume_noire', 1, 1]] },
  becasse: { hp: 4, drop: [['viande', 0, 1], ['plume_peintre', 1, 2]] }, cigogne_noire: { hp: 10, drop: [['plume_noire', 2, 3]] }, sonneur: { hp: 2, drop: [['venin_crapaud', 0, 1, 0.4]] },
  coronelle: { hp: 4, drop: [['mue_serpent', 0, 1, 0.5]] }, capricorne: { hp: 1, drop: [] }, grand_mars: { hp: 1, drop: [] }, oreillard: { hp: 2, drop: [['aile_chauve_souris', 1, 1]] },
  gelinotte: { hp: 5, drop: [['viande', 1, 1], ['plume', 1, 2]] }, pic_epeiche: { hp: 2, drop: [['plume', 1, 1]] }, bondree: { hp: 8, drop: [['plume', 1, 2]] },
  moyen_duc: { hp: 5, drop: [['plume_hibou', 1, 2]] }, musaraigne: { hp: 1, drop: [] }, muscardin: { hp: 1, drop: [] }, lezard_vivipare: { hp: 1, drop: [] },
  grenouille_rousse: { hp: 2, drop: [['viande', 0, 1, 0.5]] }, morio: { hp: 1, drop: [] }, cicindele: { hp: 1, drop: [] },
  busard_roseaux: { hp: 7, drop: [['plume', 1, 2]] }, bihoreau: { hp: 7, drop: [['plume', 1, 2]] }, aigrette: { hp: 6, drop: [['plume_aigrette', 1, 2], ['plume', 0, 1]] },
  rale_eau: { hp: 3, drop: [['viande', 0, 1, 0.5], ['plume', 1, 1]] }, becassine: { hp: 3, drop: [['viande', 0, 1], ['plume', 1, 1]] }, poule_eau: { hp: 5, drop: [['viande', 1, 1], ['plume', 1, 1]] },
  rainette: { hp: 1, drop: [] }, sangsue: { hp: 1, drop: [] }, crossope: { hp: 1, drop: [] }, cuivre_marais: { hp: 1, drop: [] },
});
// les objets des bêtes (icônes « e3_… » : 03-zzzzzE3-icones.js)
defItem('bois_daim', 'Bois de daim', 'chasse', 16, ['e3_bois', '#cbb894'], { alch: true, desc: 'Un bois de daim, plat comme une main ouverte et dentelé sur le bord. Les couteliers en font des manches.' });
defItem('plume_peintre', 'Plume du peintre', 'materiau', 6, ['e3_plume_fine', '#6a5038', '#c8a878'], { alch: true, desc: 'La petite plume raide et pointue que la bécasse porte au coude de l’aile. Les peintres de miniatures en font des pinceaux d’un seul poil, pour les cils et le reflet dans l’œil.' });
defItem('plume_aigrette', 'Plumes d’aigrette', 'materiau', 24, ['e3_aigrette', '#f4f4f0'], { alch: true, desc: 'Une poignée de longues plumes blanches, fines comme des cheveux, qui se soulèvent au moindre souffle. Les modistes de la ville les paient plus cher que l’argent, au poids.' });
defItem('sangsue', 'Sangsue', 'alchimie', 3, ['e3_sangsue', '#2a2420', '#a0602a'], { alch: true, desc: 'Une sangsue des mares, noire et rayée de roux, qui se tord au fond de la poche. Posée sur la peau, elle boit le mauvais sang, disent les médecins. Les apothicaires les achètent.' });
defItem('capricorne', 'Grand capricorne', 'tresor', 5, ['e3_capricorne', '#3a2418', '#8a4a2a'], { desc: 'Un long scarabée noir aux antennes démesurées. Il grince encore entre les doigts.' });
defItem('cicindele', 'Cicindèle', 'tresor', 4, ['n2_insecte', '#3ab060', '#e8e0b0'], { desc: 'Un petit scarabée vert émeraude, piqueté de blanc. Il brille comme un bijou.' });
defItem('grand_mars', 'Grand mars changeant', 'tresor', 18, ['n2_papillon', '#5a3a6a', '#2a1e14'], { desc: 'Brun, puis violet, puis brun : la couleur change quand on tourne la main.' });
defItem('morio', 'Morio', 'tresor', 14, ['n2_papillon', '#4a1e1a', '#e8d890'], { desc: 'Des ailes couleur de vin sombre, bordées de jaune pâle et semées de points bleus.' });
defItem('cuivre_marais', 'Cuivré des marais', 'tresor', 12, ['n2_papillon', '#e86a20', '#3a2010'], { desc: 'Un petit papillon d’un orange de cuivre rougi au feu.' });
Object.assign(ESSENCES, {
  bois_daim: { terre: 2, sang: 1 }, plume_peintre: { air: 1, lumiere: 1, esprit: 1 }, plume_aigrette: { air: 2, lumiere: 1 }, sangsue: { sang: 2, eau: 1 },
  capricorne: { terre: 1, feu: 1, mort: 1 }, cicindele: { feu: 1, air: 1 }, grand_mars: { lumiere: 1, sort: 2 }, morio: { ombre: 1, sort: 1 }, cuivre_marais: { feu: 1, eau: 1 },
});
// qui les achète
{
  const S = (id) => { const d = NPC_DATA.find((x) => x.id === id); return d && d.shop ? d.shop : null; };
  const ajoute = (id, L) => { const s = S(id); if (s) { s.buys = s.buys || []; for (const k of L) if (ITEMS[k] && !s.buys.includes(k)) s.buys.push(k); } };
  ajoute('chasseur', ['bois_daim', 'plume_peintre']);
  ajoute('colporteur', ['bois_daim', 'plume_peintre', 'plume_aigrette']);
  ajoute('colporteuse', ['plume_aigrette']);
  ajoute('alchimiste', ['sangsue']);
  ajoute('guerisseuse', ['sangsue']);
  ajoute('maire', ['capricorne', 'cicindele', 'grand_mars', 'morio', 'cuivre_marais']);
}
