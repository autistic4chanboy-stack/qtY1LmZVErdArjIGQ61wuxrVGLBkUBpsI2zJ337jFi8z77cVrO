// ============================================================================
//  CINQUANTE PLANTES NOUVELLES (agent D1, douzième vague) — le jeu
//  Données : 05-zzzzzD1-plantes.js (D1_PLANTES) ; sprites et icônes :
//  03-zzzzzD1-plantes.js.
//  - Les types du décor (après tous les autres : les numéros des types d'avant
//    ne bougent pas), ce que fait chaque plante mangée crue ou cuite, ce qu'en
//    dit l'alchimiste quand on la lui montre, qui l'achète, ce qu'on en fait
//    (café de chicorée, sirop de capillaire, eau de mélisse, genièvre, liqueur
//    de gentiane… ou de vérâtre, quand on s'est trompé de racine), où on la
//    trouve en fouillant (bocaux, apothicaire, malles de curé, caves).
//  - Quelques conduites : la sève de la berce brûle au soleil (des cloques,
//    plus tard) ; la carline se ferme quand il pleut ; l'ail victorial endurcit
//    un peu ; la racine d'auricule ôte le vertige (les chutes portent moins) ;
//    la nuit, près d'un homme-pendu, un murmure ; et la lunaire… (plus bas).
//  - LE PEUPLEMENT : une passe de génération après toutes les autres (son
//    propre tirage), dans les cinq milieux : les prés (talus, prés humides,
//    pelouses sèches, carrefours des calvaires), la ferme (autour des fermes, des
//    hameaux, du moulin, de la bergerie ; les champs ; les décombres), la ville
//    (au pied des murs, dans les jardins, contre l'église), la lande, les
//    hauteurs (alpages, rochers, bord des neiges, crêtes, chalets d'estive).
//  État : farm.s.d1 = { v, lunaires, brulures, pendu (la dernière nuit du murmure) }
//  API : d1plantes (peupler(w, seed), fermer(bool), S())
// ============================================================================

// ---------------------------------------------------------------- les types du décor
for (const P of D1_PLANTES) {
  const grand = P.h[1] > 1.1, ras = P.h[1] < 0.2;
  OBJ_TYPES.push({ id: P.o, name: P.nom, cat: P.cat, spr: P.o === 'carline' ? ['d1_carline', 'd1_carline_f'] : ['d1_' + P.o], h: P.h, col: 0, sway: ras ? 0.05 : grand ? 0.08 : 0.14, spacing: grand ? 1.6 : 0.9, sink: 0.04 });
}
OBJ_TYPES.forEach((t, i) => { OBJ_INDEX[t.id] = i; });
if (typeof natComestibles === 'function') natComestibles();

// ---------------------------------------------------------------- effets nouveaux
Object.assign(EFFETS, {
  // l'ail victorial : les coups portent un peu moins (voir play.hurt, plus bas) ; rien ne l'annonce
  d1_armure: { dur: [150, 300], fx(A, fx, tint) { teinte(tint, [0.55, 0.5, 0.42], 0.025); } },
  // la sève de la berce, au soleil : les cloques viennent plus tard
  d1_brulure: { instant: true, debut: ['(Des cloques rouges sont venues sur vos mains, là où la sève de la berce a coulé au soleil.)'], start() { const p = game.player; p.hp = Math.max(1, p.hp - 3); } },
  // la racine d'auricule, contre le vertige des chasseurs de chamois : les chutes portent un peu moins (corps.chute)
  d1_piedsur: { dur: [150, 260] },
});

// ---------------------------------------------------------------- ce que fait chaque plante, crue ou cuite
// [effet, probabilité, délai min (s), délai max (s), intensité, durée min (s), durée max (s)] ; c : cause de la mort
Object.assign(ALIMENTS_EFFETS, {
  // ---- les prés
  chicoree: { r: [['vigueur', 0.12, 10, 40]] },
  gaillet_jaune: { r: [['calme', 0.25, 10, 40]] },
  rhinanthe: { c: 'la crête-de-coq', r: [['nausee', 0.35, 20, 90], ['coliques', 0.2, 60, 180]] },
  berce: { r: [['vigueur', 0.1, 10, 40]] },
  cardere: { r: [['yeux', 0.3, 5, 20, 1, 60, 140]] },
  saponaire: { c: 'la saponaire', r: [['nausee', 0.45, 20, 90], ['vomir', 0.15, 40, 120]] },
  tanaisie: { c: 'la tanaisie', r: [['nausee', 0.4, 20, 90], ['remede', 0.25, 10, 30], ['panique', 0.12, 40, 120]] },
  ophioglosse: { r: [['sang_arrete', 0.9, 0, 0, 2], ['soin', 0.3, 10, 30]] },
  oeillet_superbe: { r: [['charme', 0.5, 5, 20, 1, 120, 240]] },
  homme_pendu: { r: [['voyance', 0.4, 10, 40, 1, 90, 180], ['hallucinations', 0.2, 40, 120], ['panique', 0.1, 30, 90]] },
  // ---- la ferme
  bon_henri: { r: [['vigueur', 0.12, 10, 40]] },
  mouron_blanc: { r: [['soin', 0.15, 5, 20]] },
  bourse_pasteur: { r: [['sang_arrete', 0.85, 0, 0, 2]] },
  bardane: { r: [['remede', 0.45, 10, 30]] },
  pensee_champs: { r: [['remede', 0.35, 10, 30], ['calme', 0.15, 10, 40]] },
  nielle: { c: 'des graines de nielle', r: [['nausee', 0.7, 20, 90], ['vomir', 0.4, 40, 120], ['coliques', 0.5, 60, 180], ['poison', 0.3, 60, 180, 1]] },
  grande_cigue: { c: 'la grande ciguë', r: [['paralysie', 0.85, 30, 120, 1, 8, 14], ['poison', 0.95, 40, 150, 3], ['nausee', 0.5, 20, 90]] },
  bryone: { c: 'la racine de bryone', r: [['coliques', 0.9, 30, 120, 2], ['vomir', 0.6, 40, 150], ['poison', 0.4, 60, 180, 1]] },
  ivraie: { c: 'l’ivraie', r: [['ivresse', 0.8, 10, 40, 2], ['vue_trouble', 0.5, 20, 60], ['nausee', 0.3, 30, 90]] },
  adonis: { c: 'l’adonis', r: [['poison', 0.85, 30, 120, 2], ['panique', 0.6, 5, 40, 2], ['vigueur', 0.2, 5, 20]] },
  // ---- la ville
  parietaire: { r: [['remede', 0.4, 10, 30]] },
  cymbalaire: { r: [['soin', 0.12, 10, 30]] },
  orpin_acre: { c: 'le poivre de muraille', r: [['pique', 0.95, 0, 0], ['vomir', 0.35, 30, 120]] },
  capillaire: { r: [['remede', 0.3, 10, 30]] },
  giroflee: { r: [['calme', 0.3, 10, 40], ['charme', 0.1, 5, 20, 1, 60, 120]] },
  bourrache: { r: [['remede', 0.45, 10, 30], ['calme', 0.2, 10, 40]] },
  melisse: { r: [['calme', 0.6, 5, 30], ['somnolence', 0.15, 30, 90]] },
  laitue_vireuse: { c: 'la laitue vireuse', r: [['somnolence', 0.8, 20, 90, 2, 120, 240], ['endormir', 0.25, 90, 200], ['calme', 0.6, 10, 40], ['poison', 0.15, 60, 180, 1]] },
  ceterach: { r: [['remede', 0.35, 10, 30], ['vigueur', 0.1, 10, 40]] },
  orobanche: { r: [['nausee', 0.4, 20, 90], ['voyance', 0.25, 10, 40, 1, 90, 180]] },
  // ---- la lande
  genestrole: { r: [['nausee', 0.2, 20, 90]] },
  viperine: { r: [['remede', 0.3, 10, 30]] },
  genevrier: { r: [['chaleur', 0.3, 5, 20], ['vigueur', 0.1, 10, 40]] },
  polygala: { r: [['remede', 0.35, 10, 30]] },
  petite_centauree: { r: [['remede', 0.7, 5, 20], ['faim', 0.3, 20, 60]] },
  betoine: { r: [['calme', 0.4, 10, 40], ['sangfroid', 0.25, 5, 20, 1, 90, 180], ['remede', 0.3, 10, 30]] },
  pied_chat: { r: [['remede', 0.5, 5, 20]] },
  cuscute: { r: [['nausee', 0.35, 20, 90], ['egarement', 0.08, 20, 60, 1, 60, 120]] },
  immortelle: { r: [['remede', 0.3, 10, 30], ['calme', 0.2, 10, 40]] },
  botryche: { r: [['voyance', 0.4, 5, 20, 1, 120, 240], ['chanceux', 0.3, 0, 10, 1, 120, 240]] },
  // ---- les hauteurs
  veratre: { c: 'la racine de vérâtre', r: [['vomir', 0.9, 20, 90, 2], ['poison', 0.9, 30, 120, 3], ['paralysie', 0.3, 40, 120, 1, 6, 10], ['vue_trouble', 0.5, 20, 60]] },
  rumex_alpin: { r: [['coliques', 0.15, 60, 180]] },
  gentiane_jaune: { r: [['remede', 0.6, 5, 20], ['faim', 0.35, 20, 60], ['vigueur', 0.2, 10, 40]] },
  dryade: { r: [['calme', 0.4, 10, 40], ['chaleur', 0.2, 5, 20]] },
  carline: { r: [['vigueur', 0.15, 10, 40]] },
  trolle: { c: 'le trolle', r: [['pique', 0.9, 0, 0], ['nausee', 0.45, 20, 90], ['coliques', 0.25, 60, 180]] },
  auricule: { r: [['sangfroid', 0.6, 5, 20, 1, 120, 240], ['d1_piedsur', 0.7, 5, 20, 1, 150, 260], ['calme', 0.3, 10, 40]] },
  renoncule_glaciers: { c: 'la renoncule des glaciers', r: [['pique', 0.85, 0, 0], ['nausee', 0.3, 20, 90], ['sangfroid', 0.3, 5, 20]] },
  ail_victorial: { r: [['d1_armure', 0.85, 0, 10, 1, 150, 300], ['chaleur', 0.2, 5, 20]] },
  nard_celtique: { r: [['calme', 0.8, 5, 20, 2], ['somnolence', 0.35, 30, 90], ['reve', 0.3, 30, 90, 1, 150, 300]] },
  // ---- ce qu'on en fait
  cafe_chicoree: { r: [['vigueur', 0.45, 5, 20, 1, 90, 180]] },
  sirop_capillaire: { r: [['remede', 0.6, 5, 20], ['calme', 0.3, 10, 40]] },
  eau_melisse: { r: [['calme', 0.8, 5, 20, 2], ['remede', 0.4, 5, 20]] },
  eau_genievre: { c: 'un genièvre frelaté', r: [['chaleur', 0.4, 5, 20], ['vue_trouble', 0.04, 15, 40]] },
  liqueur_veratre: { c: 'une liqueur de vérâtre', r: [['ivresse', 1, 0, 5, 2], ['vomir', 0.9, 20, 90, 2], ['poison', 0.85, 30, 120, 2], ['vue_trouble', 0.5, 20, 60], ['paralysie', 0.2, 40, 120, 1, 5, 9]] },
});
// l'ail victorial endurcit : les coups portent un cinquième de moins (les coups, les chutes, les morsures)
{
  const _hurt = play.hurt;
  play.hurt = function (dmg, src, cause) {
    if (dmg > 0 && typeof effets !== 'undefined' && effets.actif('d1_armure')) dmg *= 0.8;
    return _hurt.call(this, dmg, src, cause);
  };
}
// l'auricule : on tombe comme si l'on tombait d'un peu moins haut
if (typeof corps !== 'undefined' && corps.chute) {
  const _chute = corps.chute.bind(corps);
  corps.chute = function (v) { return _chute(v > 0 && typeof effets !== 'undefined' && effets.actif('d1_piedsur') ? v * 0.9 : v); };
}

// ---------------------------------------------------------------- ce que dit l'alchimiste quand on les lui montre
Object.assign(alchimie.REM, {
  gaillet_jaune: 'Du gaillet jaune, le caille-lait. Une pincée dans le lait tiède, et il prend. C’est lui qui donne aux fromages anglais leur couleur de beurre frais. Les Anglais ne le savent pas.',
  rhinanthe: 'De la crête-de-coq. Secouez-la. Vous entendez ? Les graines. Quand les prés sonnent comme ça, les faucheurs se lèvent avant l’aube. Ne la mangez pas : elle n’est bonne qu’à sonner.',
  cardere: 'Une cardère, le chardon à foulon. Les drapiers en montent les têtes sur des cylindres pour lever le poil du drap. Aucune machine ne fait mieux. On a essayé.',
  saponaire: 'De la saponaire, l’herbe à savon. Frottez-la dans l’eau : de la mousse. Pour la laine, rien de plus doux. Pour l’estomac, rien de plus rude.',
  tanaisie: 'De la tanaisie. Pendez-en un bouquet à la porte de la cuisine, les mouches ne passeront plus. On en garnissait aussi les cercueils, autrefois, contre les vers. Ça ne marchait pas.',
  ophioglosse: 'Une langue-de-serpent ! Une fougère qui n’a qu’une feuille. On en fait un baume pour les plaies, le meilleur que je connaisse. Il faut savoir la voir : la plupart des gens marchent dessus.',
  oeillet_superbe: 'Un œillet superbe. Sentez-le ce soir, pas maintenant : le soir, il embaume toute une chambre. Les jardiniers de la ville en paient la graine au poids de l’argent.',
  homme_pendu: 'Un homme-pendu. Regardez les fleurs de près… Oui. Chacune. On disait qu’il poussait au pied des gibets, et aux carrefours, là où l’on enterrait ceux qui s’étaient pendus. Je vous l’achète quand même.',
  bon_henri: 'Du bon-henri. L’épinard des pauvres, et des chalets. Il pousse au fumier : ne le dites pas aux gens de la ville, ils en mangeraient moins.',
  nielle: 'De la nielle. Une belle fleur, et la plaie des meuniers : ses graines dans la farine, et tout le village a mal au ventre. On dit « pain niellé ». Moi je dis : pain empoisonné.',
  grande_cigue: 'Posez ça. Doucement. Ne vous frottez pas les yeux. La grande ciguë, celle de Socrate. On commence par ne plus sentir ses pieds, et l’on bavarde encore quand ça arrive au cœur. Regardez la tige, toujours : les taches pourpres. Et l’odeur.',
  bryone: 'De la bryone ! Le navet du diable. Les charlatans des foires la taillent en petit bonhomme et la vendent pour de la mandragore. J’en ai vu acheter par des notaires. Ne la mangez pas : elle vide un homme par les deux bouts.',
  ivraie: 'De l’ivraie, la zizanie de l’Évangile. Un peu dans la farine, et tout le village marche de travers sans avoir bu une goutte. Les meuniers honnêtes la trient. Les autres la vendent.',
  adonis: 'Une goutte-de-sang ! Il n’en reste presque plus, depuis qu’on trie les blés. Le sang d’Adonis, dit-on. Pour le cœur : un peu le calme, un peu plus l’arrête net. Comme toutes les belles choses.',
  parietaire: 'De la pariétaire. La casse-pierre : elle pousse dans les murs, alors on la donne contre la pierre des reins. La médecine des anciens avait de ces raisonnements.',
  cymbalaire: 'De la cymbalaire, la ruine-de-Rome. Ses fruits se tournent vers le mur et plantent leurs graines dans les fentes. Dans cent ans, il n’y aura plus de mur. Il y aura de la cymbalaire.',
  orpin_acre: 'De l’orpin âcre, le poivre de muraille. Il vit sur les toits sans boire, et il brûle comme du poivre. Mettez-le sur vos cors, pas dans votre soupe.',
  capillaire: 'Du capillaire des murailles. Avec du sucre et un peu de fleur d’oranger, on en fait le sirop qu’on boit dans les cafés de la ville. Avec du miel, c’est meilleur, et c’est pour la toux.',
  laitue_vireuse: 'De la laitue vireuse. Cassez la tige… voyez ce lait ? On le fait sécher, et c’est l’opium des pauvres. Une pincée fait dormir. Deux font dormir longtemps. Je ne vous dirai pas ce que font trois.',
  ceterach: 'Du cétérach, l’herbe dorée. Regardez dessous : de l’or. Pas assez pour vous enrichir. Mettez-la sèche dans un verre d’eau et regardez-la revivre. Ça m’émeut à chaque fois. Ne le répétez pas.',
  orobanche: 'Une orobanche. Pas une feuille, pas une goutte de vert : elle boit les racines du lierre. Une plante vampire, si vous voulez. Où l’avez-vous prise ? Près de l’église ? Évidemment.',
  genestrole: 'De la genestrole, le genêt des teinturiers. Bouillie, elle teint la laine en jaune ; repassée au pastel, en vert. Les teinturiers vous l’achèteront. Moi, je n’ai rien à teindre.',
  viperine: 'De la vipérine. Regardez la graine : une petite tête de vipère. On la donnait donc contre les morsures. Elle n’y fait rien. Si une vipère vous mord, ne comptez pas sur elle.',
  polygala: 'Du polygala, l’herbe au lait. Les bergers disent que les vaches en donnent plus de lait. Les vaches ne disent rien. La racine fait cracher, c’est déjà ça.',
  petite_centauree: 'De la petite centaurée, l’herbe à la fièvre. Goûtez une fleur… voilà. Vous aurez la bouche amère jusqu’au soir. La fièvre aussi, et elle s’en ira avant vous.',
  betoine: 'De la bétoine. « Vends ta cotte et achète de la bétoine. » Mon maître le disait. Il en mettait dans tout. Il est mort de vieillesse : c’est déjà ça.',
  pied_chat: 'Du pied-de-chat. Touchez : c’est doux comme une patte. Contre la toux, avec la mauve et le coquelicot. Les quatre fleurs, on dit, même quand il y en a sept.',
  cuscute: 'De la cuscute. Les cheveux du diable. Elle n’a ni racine ni feuille : elle s’enroule et elle boit. Je connais des gens comme ça. Vous aussi, sans doute.',
  immortelle: 'Des immortelles. Elles ne fanent pas. On en fait les couronnes des tombes ; dans dix ans, elles seront encore jaunes, et plus personne ne viendra les voir.',
  botryche: 'Non. Non, ce n’est pas possible. La lunaire. La vraie. Je l’ai cherchée vingt ans. Les anciens disaient qu’elle ouvre les serrures, la nuit. Ne riez pas. Je vous l’achète. Le prix que vous voudrez. Enfin, presque.',
  veratre: 'Du vérâtre. Pas de la gentiane : du vérâtre. Regardez les feuilles : elles tournent autour de la tige. Celles de la gentiane vont par deux, face à face. Chaque été, un berger se trompe, et sa liqueur l’enterre. Chaque été.',
  rumex_alpin: 'Du rumex des Alpes, la rhubarbe des moines. Il pousse là où les vaches ont dormi ; on en cuit les feuilles pour les cochons. Les moines, je ne sais pas.',
  gentiane_jaune: 'De la gentiane jaune, la grande. Dix ans pour fleurir, cinquante pour mourir. Faites-en de la liqueur, avec de l’eau-de-vie et du miel. Et regardez bien les feuilles, toujours : par deux, face à face. Sinon, ce n’est pas elle.',
  dryade: 'De la dryade, le thé suisse. Les bergers en boivent faute de mieux, et finissent par le préférer. C’est ce qui arrive avec beaucoup de choses, là-haut.',
  carline: 'Une carline. Le baromètre du berger : elle se ferme quand il va pleuvoir. Clouez-la sur votre porte, la foudre passera à côté. C’est ce qu’on dit. Moi, j’ai un paratonnerre.',
  trolle: 'Un trolle, la boule d’or. Il ne s’ouvre jamais. De petites mouches vivent dedans, à l’abri du monde. On a tous connu la tentation.',
  auricule: 'Une auricule, l’oreille-d’ours ! Les chasseurs de chamois en mâchaient la racine pour ne pas avoir le vertige sur les vires. J’ai essayé une fois, sur l’échelle de ma bibliothèque. Je suis tombé quand même. Mais calmement.',
  renoncule_glaciers: 'Une renoncule des glaciers. Il n’y a rien qui fleurisse plus haut. Vous êtes donc allé là-haut. Je ne vous demande pas ce que vous y avez vu ; je vous demande si vous avez eu froid. Oui ? Bien.',
  ail_victorial: 'De l’ail victorial ! L’herbe à neuf chemises. Comptez les tuniques du bulbe… neuf, oui. Les mineurs en portent un sous la chemise, contre les éboulements et les esprits des galeries. Mangé, il endurcit. Un peu. N’allez pas vous battre avec un ours.',
  nard_celtique: 'Sentez… Le nard. Le nard celtique. Les Romains le payaient au poids de l’or ; on en oignait les rois, et les morts, pour qu’ils sentent bon dans l’autre monde. Je n’en avais jamais tenu. Merci.',
  liqueur_veratre: 'Ce n’est pas de la gentiane. Sentez : il y a autre chose sous l’amertume. Vous l’avez faite vous-même ? Avec une racine de vérâtre. Versez le reste dans le fumier et lavez la bouteille deux fois. Si vous en avez bu, asseyez-vous, et parlons d’autre chose.',
});

// ---------------------------------------------------------------- qui achète quoi
{
  const S = (id) => { const d = NPC_DATA.find((x) => x.id === id); return d && d.shop ? d.shop : null; };
  const ajoute = (id, L) => { const s = S(id); if (s) { s.buys = s.buys || []; for (const k of L) if (ITEMS[k] && !s.buys.includes(k)) s.buys.push(k); } };
  ajoute('guerisseuse', ['gaillet_jaune', 'ophioglosse', 'tanaisie', 'bourse_pasteur', 'bardane', 'pensee_champs', 'parietaire', 'capillaire', 'bourrache', 'melisse', 'ceterach',
    'viperine', 'polygala', 'petite_centauree', 'betoine', 'pied_chat', 'immortelle', 'gentiane_jaune', 'dryade', 'auricule', 'sirop_capillaire', 'eau_melisse']);
  ajoute('alchimiste', ['rhinanthe', 'saponaire', 'homme_pendu', 'nielle', 'grande_cigue', 'bryone', 'ivraie', 'adonis', 'orpin_acre', 'laitue_vireuse', 'orobanche', 'cuscute',
    'botryche', 'veratre', 'trolle', 'renoncule_glaciers', 'nard_celtique', 'liqueur_veratre', 'ail_victorial']);
  ajoute('aubergiste', ['chicoree', 'bon_henri', 'berce', 'carline', 'rumex_alpin', 'cafe_chicoree', 'sirop_capillaire', 'eau_melisse', 'eau_genievre', 'genevrier']);
  ajoute('eleveuse', ['mouron_blanc', 'berce', 'rumex_alpin', 'polygala']);
  ajoute('colporteuse', ['cardere', 'genestrole', 'immortelle', 'saponaire', 'giroflee', 'cymbalaire']);
  ajoute('colporteur', ['bryone', 'cardere']);
  ajoute('maire', ['oeillet_superbe', 'adonis', 'auricule', 'renoncule_glaciers', 'nard_celtique']);
  ajoute('estive_baile', ['gentiane_jaune', 'dryade', 'carline']);
  ajoute('estive_fromagere', ['rumex_alpin', 'gaillet_jaune', 'bon_henri']);
  // ce qu'ils aiment qu'on leur montre ou qu'on leur offre (l'amitié)
  const aime = (id, cle, L) => { const d = NPC_DATA.find((x) => x.id === id); if (!d) return; d[cle] = d[cle] || []; for (const k of L) if (ITEMS[k] && !d[cle].includes(k)) d[cle].push(k); };
  aime('alchimiste', 'loves', ['botryche', 'nard_celtique']);
  aime('alchimiste', 'likes', ['homme_pendu', 'orobanche', 'renoncule_glaciers', 'adonis', 'ceterach']);
  aime('guerisseuse', 'likes', ['melisse', 'bourrache', 'ophioglosse', 'eau_melisse']);
  aime('estive_fromagere', 'likes', ['gaillet_jaune']);
  aime('estive_baile', 'likes', ['gentiane_jaune']);
}

// ---------------------------------------------------------------- les groupes « au choix » ; recettes, alambic, tonneau
{
  const F = D1_PLANTES.filter((P) => P.cat === 'Fleurs').map((P) => P.o);
  for (const id of F) { if (!ITEM_GROUPS.fleur.includes(id)) ITEM_GROUPS.fleur.push(id); if (!ITEM_GROUPS.fleur_c.includes(id)) ITEM_GROUPS.fleur_c.push(id); }
  // (les moins chères d'abord : une recette prend une pâquerette avant une goutte-de-sang)
  ITEM_GROUPS.fleur = ITEM_GROUPS.fleur.slice(0, 1).concat(ITEM_GROUPS.fleur.slice(1).sort((a, b) => (ITEMS[a].price || 0) - (ITEMS[b].price || 0)));
  for (const id of ['melisse', 'dryade', 'betoine', 'gaillet_jaune']) if (!ITEM_GROUPS.aromate.includes(id)) ITEM_GROUPS.aromate.push(id);
  RECIPES.push(
    { out: 'cafe_chicoree', n: 1, need: { chicoree: 2 }, st: 'feu' },
    { out: 'sirop_capillaire', n: 1, need: { capillaire: 3, miel: 1 }, st: 'feu' },
  );
  if (typeof LIVRES !== 'undefined' && LIVRES.manuel_cuisine) for (const id of ['cafe_chicoree', 'sirop_capillaire']) if (!LIVRES.manuel_cuisine.recettes.includes(id)) LIVRES.manuel_cuisine.recettes.push(id);
  // l'alambic du bouilleur de cru : le genièvre, l'eau de mélisse (avec de l'eau-de-vie de grain)
  if (MACHINES.alambic_cru) {
    for (const fuel of [{ bois: 2 }, { charbon: 1 }]) {
      MACHINES.alambic_cru.push({ in: Object.assign({ genevrier: 5, eau_de_vie_grain: 1 }, fuel), out: ['eau_genievre', 2], h: 6 });
      MACHINES.alambic_cru.push({ in: Object.assign({ melisse: 4, eau_de_vie_grain: 1 }, fuel), out: ['eau_melisse', 2], h: 6 });
    }
    if (MACHINE_HINT.alambic_cru) MACHINE_HINT.alambic_cru += ' Avec de l’eau-de-vie de grain, il prend aussi le parfum d’une baie ou d’une herbe.';
  }
  // le tonneau : la liqueur de gentiane se fait aussi (surtout) avec la racine de la grande gentiane ; et avec celle du
  // vérâtre, on obtient une liqueur qui lui ressemble en tout, sauf en ce qu'elle fait
  // (trois racines, de l'eau-de-vie de grain et du miel : ce que coûte la liqueur de gentiane bleue, à peu près)
  if (MACHINES.tonneau) {
    MACHINES.tonneau.push({ in: { gentiane_jaune: 3, eau_de_vie_grain: 1, miel: 1 }, out: ['liqueur_gentiane', 2], h: 12 });
    MACHINES.tonneau.push({ in: { veratre: 3, eau_de_vie_grain: 1, miel: 1 }, out: ['liqueur_veratre', 2], h: 12 });
  }
}

// ---------------------------------------------------------------- les fouilles : ce qu'on trouve dans les bocaux, les malles, les caves
{
  const ajoute = (t, L) => { if (LOOT[t] && LOOT[t].items) for (const e of L) if (ITEMS[e[0]] && !LOOT[t].items.some((x) => x[0] === e[0])) LOOT[t].items.push(e); };
  ajoute('f2_bocaux', [['tanaisie', 1, 1, 1], ['melisse', 1, 2, 1.2], ['bourrache', 1, 2, 0.8], ['petite_centauree', 1, 1, 0.8], ['betoine', 1, 1, 0.6], ['gentiane_jaune', 1, 1, 0.5]]);
  ajoute('f2_apothicaire', [['eau_melisse', 1, 1, 0.5], ['sirop_capillaire', 1, 1, 0.6], ['laitue_vireuse', 1, 1, 0.4], ['nard_celtique', 1, 1, 0.04]]);
  ajoute('f2_malle_cure', [['eau_melisse', 1, 1, 0.8]]);
  ajoute('f2_jarre', [['genevrier', 1, 3, 1]]);
  ajoute('f2_abandon', [['immortelle', 1, 2, 0.6]]);
  ajoute('f2_cave_casier', [['eau_genievre', 1, 1, 0.3]]);
  ajoute('bu_etagere', [['cafe_chicoree', 1, 1, 0.8]]);
}

// ============================================================================
//  LE MODULE : état, conduites (berce, carline, lunaire), peuplement
// ============================================================================
const d1plantes = {
  ferme: false, carlT: 0,
  S() { const s = farm.s; if (!s) return {}; const D = s.d1 || (s.d1 = { v: 1 }); return D; },

  // ------------------------------------------------------------ la carline se ferme quand il pleut
  // (on change seulement l'image de chaque carline dans le tampon du rendu, sans tout reconstruire)
  fermer(f) {
    this.ferme = !!f;
    const w = game.world, R = game.renderer, L = w && w.d1 && w.d1.carl;
    if (!L || !L.length) return;
    const s = typeof ATLAS !== 'undefined' && ATLAS.sprites[f ? 'd1_carline_f' : 'd1_carline'];
    for (const i of L) {
      const o = w.objects[i];
      if (!o) continue;
      o.v = f ? 1 : 0;
      const sl = R && R.objSlot ? R.objSlot[i] : -1;
      if (s && sl >= 0 && R.objAll) { const b = sl * 13; R.objAll[b + 3] = o.h * s.aspect; R.objAll[b + 5] = s.u0; R.objAll[b + 6] = s.v0; R.objAll[b + 7] = s.u1; R.objAll[b + 8] = s.v1; }
    }
    if (R) R.activeCenter = null;
  },

  // ============================================================ le peuplement
  // Après toutes les autres passes, son propre tirage. Rien dans l'eau, sur un chemin des prés, dans un lieu-dit ou une
  // zone protégée (sauf les plantes des villes, des fermes et des chalets, qui vivent justement là, au pied des murs et
  // dans les cours), ni sur un objet posé, devant une interaction ou une porte, ni sur le champ de la ferme.
  peupler(w, seed) {
    if (!w || !w.designed || typeof milieuAt !== 'function' || !w.biome) return 0;
    const rnd = mulberry32(((seed | 0) ^ 0x44315f50) >>> 0), WL = w.waterLevel, S = w.size;
    const B = new Builder(w, rnd, new Uint8Array(1));
    const n0 = w.objects.length, compte = {}, T0 = Date.now(), chrono = {};
    let n = 0;
    const biomeAt = (x, z) => BIOMES[w.biome[clamp(Math.floor(z / 8), 0, w.biomeW - 1) * w.biomeW + clamp(Math.floor(x / 8), 0, w.biomeW - 1)]];
    const tir = (L) => L[(rnd() * L.length) | 0];
    // ce qu'il faut éviter : zones protégées et lieux-dits (pour les plantes sauvages), le champ de la ferme
    const zones = (w.noBuild || []).map((P) => [P.x, P.z, P.r + 4]);
    for (const k in w.lm || {}) { const L = w.lm[k]; if (L && !L.under && !/^c2_/.test(k)) zones.push([L.x, L.z, Math.min(L.r || 10, 40) * 0.8 + 3]); }
    const enZone = (x, z) => { for (const [zx, zz, zr] of zones) if (Math.abs(x - zx) < zr && Math.abs(z - zz) < zr && Math.hypot(x - zx, z - zz) < zr) return true; return false; };
    const fd = w.farm && w.farm.field;
    const surChamp = (x, z) => !!fd && x > fd.x0 - 3 && x < fd.x1 + 3 && z > fd.z0 - 3 && z < fd.z1 + 3;
    // objets posés, interactions, portes (grille de 16 m)
    const C = 16, grille = new Map(), cle = (x, z) => ((x / C) | 0) * 4096 + ((z / C) | 0);
    const marque = (x, z, r) => { const k = cle(x, z); if (!grille.has(k)) grille.set(k, []); grille.get(k).push(x, z, r); };
    for (const q of w.props) if (q && !q.gone) marque(q.x, q.z, 0);
    for (const it of w.inter || []) marque(it.x, it.z, 0);
    for (const d of w.doors || []) if (d && d.x !== undefined) marque(d.x, d.z, 1.2);
    const pres = (x, z, r) => {
      for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
        const L = grille.get((((x / C) | 0) + dx) * 4096 + ((z / C) | 0) + dz);
        if (L) for (let i = 0; i < L.length; i += 3) { const rr = r + L[i + 2]; if (Math.abs(L[i] - x) < rr && Math.abs(L[i + 1] - z) < rr) return true; }
      }
      return false;
    };
    // tous les objets du décor (grille de 4 m), et ce qu'on y ajoute
    const CO = 4, tous = new Map(), cleO = (x, z) => ((x / CO) | 0) * 4096 + ((z / CO) | 0);
    const ajoute = (x, z) => { const k = cleO(x, z); if (!tous.has(k)) tous.set(k, []); tous.get(k).push(x, z); };
    for (let i = 0; i < n0; i++) { const o = w.objects[i]; if (o && !o.gone && !o.cleared) ajoute(o.x, o.z); }
    const voisin = (x, z, r) => {
      for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
        const L = tous.get((((x / CO) | 0) + dx) * 4096 + ((z / CO) | 0) + dz);
        if (L) for (let i = 0; i < L.length; i += 2) if (Math.hypot(L[i] - x, L[i + 1] - z) < r) return true;
      }
      return false;
    };
    // un bloc (mur, toit, plancher) à moins de m mètres du point, ou au-dessus de lui
    const bloc = (x, z, m) => {
      let hit = false;
      w.query(x, z, 2, null, (b) => {
        if (hit || b.under) return;
        const [lx, lz] = World.blockLocal(b, x, z);
        if (Math.abs(lx) < b.sx / 2 + m && Math.abs(lz) < b.sz / 2 + m) hit = true;
      });
      return hit;
    };
    const MURS = new Set(['mur', 'jardin', 'eglise']), HUMAINS = new Set(['mur', 'jardin', 'eglise', 'ferme', 'champ', 'decombres', 'chalet']);
    const libre = (x, z, mode, grand) => {
      if (!w.inside(x, z, 20)) return false;
      if (w.heightAt(x, z) < WL + 0.05) return false;
      if (!HUMAINS.has(mode) && enZone(x, z)) return false;
      if (surChamp(x, z)) return false;
      const i = Math.round(x / w.cell), j = Math.round(z / w.cell), m = w.mats[j * w.W + i];
      if (m === M_ICE) return false;
      if (!MURS.has(mode) && (m === M_DIRT || m === M_COBBLE)) return false;
      if (mode === 'jardin' && (m === M_DIRT || m === M_COBBLE || m === M_STONE)) return false;
      if (!['rochers', 'crete', 'neiges', 'mur', 'eglise'].includes(mode) && w.normalAt(x, z)[1] < 0.8) return false;
      if (pres(x, z, MURS.has(mode) ? 1.4 : 2)) return false;
      if (voisin(x, z, grand ? 1.3 : MURS.has(mode) ? 0.55 : 0.8)) return false;
      if (bloc(x, z, MURS.has(mode) ? 0.15 : 0.6)) return false;
      return true;
    };
    const pose = (id, x, z, extra) => { B.obj(id, x, z, undefined, extra); ajoute(x, z); n++; compte[id] = (compte[id] || 0) + 1; };

    chrono.grilles = Date.now() - T0;
    // ---------------------------------------------------- les milieux (échantillonnage : 16 m)
    const pts = {}; const P = (k, x, z) => (pts[k] || (pts[k] = [])).push([x, z]);
    const eauPres = (x, z, R) => { for (let a = 0; a < 8; a++) { const t = a / 8 * TAU; for (const d of [R * 0.4, R * 0.75, R]) if (w.heightAt(x + Math.cos(t) * d, z + Math.sin(t) * d) < WL - 0.1) return true; } return false; };
    const cheminPres = (x, z) => { for (let a = 0; a < 8; a++) { const t = a / 8 * TAU; for (const d of [2.5, 5]) { const mx = x + Math.cos(t) * d, mz = z + Math.sin(t) * d, i = Math.round(mx / w.cell), j = Math.round(mz / w.cell), m = w.mats[j * w.W + i]; if (m === M_DIRT || m === M_COBBLE) return [mx - Math.cos(t) * 1.6, mz - Math.sin(t) * 1.6]; } } return null; };
    const neigeL = (w.snowLine || 1e4) - WL;
    for (let z = 40; z < S - 40; z += 16) for (let x = 40; x < S - 40; x += 16) {
      const jx = x + (rnd() - 0.5) * 14, jz = z + (rnd() - 0.5) * 14;
      const h = w.heightAt(jx, jz);
      if (h < WL - 0.2) continue;
      const b = biomeAt(jx, jz);
      if (b !== 'plaine' && b !== 'lande' && b !== 'hauteurs') continue;
      const k = milieuAt(w, jx, jz), alt = h - WL;
      if (b === 'plaine') {
        if (k === 'pres') {
          P('pres', jx, jz);
          const c = cheminPres(jx, jz); if (c) P('talus', c[0], c[1]);
          if (eauPres(jx, jz, 30)) P('humide', jx, jz);
          else if (w.normalAt(jx, jz)[1] < 0.97) P('sec', jx, jz);
        } else if (k === 'berges' || k === 'combe') P('humide', jx, jz);
      } else if (b === 'lande') {
        if (k === 'lande' || k === 'pres') P('lande', jx, jz);
      } else {
        if (k === 'alpage' || k === 'pres') { P('alpage', jx, jz); if (alt > neigeL - 30) P('crete', jx, jz); }
        else if (k === 'rochers') { P('rochers', jx, jz); if (alt > neigeL - 30) P('crete', jx, jz); }
        else if (k === 'neiges') {
          // au bord des neiges : un point voisin qui ne l'est pas
          for (let a = 0; a < 6; a++) { const t = a / 6 * TAU, tx = jx + Math.cos(t) * 9, tz = jz + Math.sin(t) * 9; if (w.heightAt(tx, tz) > WL && milieuAt(w, tx, tz) === 'rochers') { P('neiges', (jx + tx) / 2, (jz + tz) / 2); break; } }
        }
      }
    }
    chrono.milieux = Date.now() - T0;
    // les carrefours des calvaires (on enterrait là ceux qui s'étaient pendus)
    for (const k in w.lm || {}) if (/^calvaire\d/.test(k)) { const L = w.lm[k]; for (let a = 0; a < 10; a++) { const t = rnd() * TAU, d = 8 + rnd() * 12; P('carrefour', L.x + Math.cos(t) * d, L.z + Math.sin(t) * d); } }
    // les fermes : la vieille ferme, le hameau, le ranch, le moulin, la bergerie ; les champs autour ; les décombres
    const fermes = [];
    for (const k of ['ferme', 'ranch', 'maison_hameau_a', 'maison_hameau_b', 'g1_cabane_hameau']) { const b = w.bld && w.bld[k]; if (b && b.x > 0) fermes.push([b.x, b.z, Math.max(b.W || 8, b.D || 8) * 0.6]); }
    for (const k of ['moulin', 'bergerie']) { const L = w.lm && w.lm[k]; if (L) fermes.push([L.x, L.z, (L.r || 10) * 0.7]); }
    for (const [fx, fz, R] of fermes) {
      for (let a = 0; a < 26; a++) { const t = rnd() * TAU, d = R + 2 + rnd() * 9; P('ferme', fx + Math.cos(t) * d, fz + Math.sin(t) * d); }
      for (let a = 0; a < 26; a++) { const t = rnd() * TAU, d = R + 12 + rnd() * 30; P('champ', fx + Math.cos(t) * d, fz + Math.sin(t) * d); }
      for (let a = 0; a < 6; a++) { const t = rnd() * TAU, d = R + 1.5 + rnd() * 4; P('decombres', fx + Math.cos(t) * d, fz + Math.sin(t) * d); }
    }
    // (les cases de 8 m des biomes de la ferme et de la ville : des points dans chacune)
    {
      const BW = w.biomeW, bF = BIOMES.indexOf('ferme'), bV = BIOMES.indexOf('ville');
      for (let j = 0; j < BW; j++) for (let i = 0; i < BW; i++) {
        const b = w.biome[j * BW + i];
        if (b === bF) for (let k = 0; k < 3; k++) P('ferme', i * 8 + rnd() * 8, j * 8 + rnd() * 8);
        else if (b === bV) for (let k = 0; k < 4; k++) P('jardin', i * 8 + rnd() * 8, j * 8 + rnd() * 8);
      }
    }
    for (const k of ['hameau_abandonne', 'ruines', 'chapelle', 'vieux_puits']) { const L = w.lm && w.lm[k]; if (L) for (let a = 0; a < 24; a++) { const t = rnd() * TAU, d = rnd() * (L.r || 12) * 1.1; P('decombres', L.x + Math.cos(t) * d, L.z + Math.sin(t) * d); } }
    // les chalets d'estive, la bergerie, le refuge (le rumex des Alpes, le bon-henri)
    for (const k of ['es_baile', 'es_fromagerie', 'es_patre']) { const b = w.bld && w.bld[k]; if (b) for (let a = 0; a < 16; a++) { const t = rnd() * TAU, d = Math.max(b.W || 6, b.D || 6) * 0.6 + 1.5 + rnd() * 8; P('chalet', b.x + Math.cos(t) * d, b.z + Math.sin(t) * d); } }
    for (const k of ['estive_jasse', 'refuge', 'bergerie']) { const L = w.lm && w.lm[k]; if (L) for (let a = 0; a < 16; a++) { const t = rnd() * TAU, d = (L.r || 8) * 0.5 + rnd() * 12; P('chalet', L.x + Math.cos(t) * d, L.z + Math.sin(t) * d); } }
    // la ville : le pied des murs (et ceux des maisons du hameau), les jardins, l'église et le cimetière
    const hameau = w.lm && w.lm.hameau, eglise = w.lm && w.lm.eglise, cimetiere = w.lm && w.lm.cimetiere;
    const pied = [], piedEglise = [];
    for (const b of w.blocks || []) {
      if (b.under || b.sy < 1.4) continue;
      const bv = biomeAt(b.x, b.z) === 'ville', bh = hameau && Math.hypot(b.x - hameau.x, b.z - hameau.z) < 40;
      const be = (eglise && Math.hypot(b.x - eglise.x, b.z - eglise.z) < 22) || (cimetiere && Math.hypot(b.x - cimetiere.x, b.z - cimetiere.z) < 24);
      if (!bv && !bh && !be) continue;
      const g = w.heightAt(b.x, b.z);
      if (b.y > g + 0.8) continue; // (un toit, un étage : pas un mur qui touche le sol)
      const c = Math.cos(b.r), s = Math.sin(b.r);
      const W2 = b.sx / 2, D2 = b.sz / 2;
      for (const [nx, nz, L] of [[1, 0, b.sz], [-1, 0, b.sz], [0, 1, b.sx], [0, -1, b.sx]]) {
        if (L < 1.2) continue;
        for (let t = -L / 2 + 0.6; t < L / 2 - 0.5; t += 1.6 + rnd() * 1.2) {
          const off = 0.32 + rnd() * 0.3;
          const lx = nx ? nx * (W2 + off) : t, lz = nz ? nz * (D2 + off) : t;
          const x = b.x + lx * c + lz * s, z = b.z - lx * s + lz * c;
          (be ? piedEglise : pied).push([x, z]);
        }
      }
    }
    for (const q of pied) P('mur', q[0], q[1]);
    for (const q of piedEglise) { P('eglise', q[0], q[1]); P('mur', q[0], q[1]); }
    if (hameau) for (let a = 0; a < 40; a++) { const t = rnd() * TAU, d = 6 + rnd() * 26; P('jardin', hameau.x + Math.cos(t) * d, hameau.z + Math.sin(t) * d); }

    chrono.lieux = Date.now() - T0;
    // ---------------------------------------------------- les plantes
    // touffes par rareté (commune … introuvable), selon l'étendue du milieu ; pieds par touffe
    const PER = [24, 13, 6, 3, 2], K = { plaine: 1, ferme: 0.55, ville: 0.75, lande: 0.6, hauteurs: 1.1 };
    const PIEDS = [[2, 5], [2, 4], [1, 3], [1, 2], [1, 1]];
    const carl = [];
    for (const D of D1_PLANTES) {
      if (OBJ_INDEX[D.o] === undefined) continue;
      const modes = D.ou.filter((m) => pts[m] && pts[m].length);
      if (!modes.length) continue;
      const grand = D.h[1] > 1.1, mur = modes.every((m) => MURS.has(m));
      const touffes = Math.max(1, Math.round(PER[D.r] * (K[D.bio] || 1)));
      const [p0, p1] = PIEDS[D.r];
      for (let k = 0; k < touffes; k++) {
        // (une plante rare cherche plus longtemps sa place)
        for (let essai = 0, ok = 0; essai < (D.r >= 2 ? 10 : mur ? 6 : 3) && !ok; essai++) {
          const mode = tir(modes), [cx, cz] = tir(pts[mode]);
          const m = grand ? 1 + ((rnd() * 2) | 0) : p0 + ((rnd() * (p1 - p0 + 1)) | 0), sp = mur ? 2.2 : grand ? 7 : 5;
          for (let j = 0; j < m; j++) {
            const x = j === 0 ? cx : cx + (rnd() - 0.5) * sp, z = j === 0 ? cz : cz + (rnd() - 0.5) * sp;
            if (!libre(x, z, mode, grand)) continue;
            if (D.o === 'carline') { carl.push(w.objects.length); pose(D.o, x, z, { v: 0 }); } else pose(D.o, x, z);
            ok++;
          }
        }
      }
    }
    chrono.plantes = Date.now() - T0;
    w.d1 = { carl, n, compte, chrono };
    if (n) { w.objectsDirty = true; w.grid = null; w.shadeDirty = true; }
    return n;
  },
};
{
  const _gv = generateValley;
  generateValley = async function (seed, progress, gen) {
    const w = await _gv(seed, progress, gen);
    try { if (w && w.designed) d1plantes.peupler(w, w.seed || seed); } catch (e) { console.error(e); }
    return w;
  };
}

// ---------------------------------------------------------------- cueillir : la sève de la berce, au soleil
{
  const _collect = play.collect.bind(play);
  play.collect = function (o, idx, H, p) {
    const T = o && OBJ_TYPES[o.t];
    const r = _collect(o, idx, H, p);
    if (r && T && T.id === 'berce' && farm.s && typeof effets !== 'undefined') {
      const sky = game.sky, cur = weather.cur || {};
      if (sky && sky.day > 0.6 && (cur.rain || 0) < 0.05 && (cur.cloud || 0) < 0.7 && Math.random() < 0.3) {
        effets.declencher('d1_brulure', { delai: 70 + Math.random() * 80, k: 1 });
        const S = d1plantes.S(); S.brulures = (S.brulures || 0) + 1;
      }
    }
    return r;
  };
}

// ---------------------------------------------------------------- la lunaire (ce qui se cache)
// On dit qu'elle ouvre les serrures. La nuit (de neuf heures du soir à quatre heures du matin), qui tient une lunaire
// en main et veut crocheter une serrure n'a pas besoin de crochets : la serrure cède d'elle-même, sans bruit, et la
// plante se fane. Le jour, elle n'y fait rien.
if (typeof crochetage !== 'undefined') {
  const _tenter = crochetage.tenter.bind(crochetage);
  crochetage.tenter = function (o) {
    const s = farm.s, w = game.world;
    if (s && w && !this.jeu && s.hand === 'botryche' && farm.count('botryche') > 0) {
      const h = (w.time * 24) % 24;
      if (h >= 21 || h < 4) {
        farm.take('botryche', 1);
        const D = d1plantes.S(); D.lunaires = (D.lunaires || 0) + 1;
        setTimeout(() => sound.lock && sound.lock(false), 400);
        if (D.lunaires === 1) setTimeout(() => ui.subtitle('', '(La serrure a cédé d’elle-même. Dans votre main, la petite plante s’est fanée.)', 4), 900);
        return Promise.resolve(true);
      }
    }
    return _tenter(o);
  };
}

// ---------------------------------------------------------------- chaque image (rien de lourd) : la carline et le temps
HOOKS.update.push((dt, eye, basis, sky, playing) => {
  if (!playing || !farm.s) return;
  d1plantes.carlT -= dt;
  if (d1plantes.carlT > 0) return;
  d1plantes.carlT = 4;
  const w = game.world;
  if (!w || !w.d1 || !w.d1.carl.length) return;
  const cur = weather.cur || {}, f = (cur.rain || 0) > 0.06 || (cur.fog || 0) > 0.55 || (cur.storm || 0) > 0.2;
  if (f !== d1plantes.ferme) d1plantes.fermer(f);
});
// la nuit, près d'un homme-pendu : une fois par nuit, un murmure (rien d'autre)
HOOKS.update.push((dt, eye, basis, sky, playing) => {
  if (!playing || !farm.s || game.dying) return;
  d1plantes.penduT = (d1plantes.penduT || 0) - dt;
  if (d1plantes.penduT > 0) return;
  d1plantes.penduT = 0.9;
  const w = game.world, p = game.player, ti = OBJ_INDEX.homme_pendu;
  if (!w || !w.d1 || ti === undefined || p.underground || !w.objectsGrid || (typeof mondes !== 'undefined' && mondes.cur)) return;
  const h = (w.time * 24) % 24;
  if (h < 22 && h >= 4) return;
  const D = d1plantes.S(), nuit = h >= 22 ? farm.s.day : farm.s.day - 1;
  if (D.pendu === nuit) return;
  const G = w.objectsGrid(), gx = clamp(Math.floor(p.pos[0] / G.C), 0, G.gw - 1), gz = clamp(Math.floor(p.pos[2] / G.C), 0, G.gw - 1);
  for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
    const c = G.cells[clamp(gz + dz, 0, G.gw - 1) * G.gw + clamp(gx + dx, 0, G.gw - 1)];
    if (c) for (const i of c) {
      const o = w.objects[i];
      if (!o || o.t !== ti || o.gone) continue;
      const ddx = o.x - p.pos[0], ddz = o.z - p.pos[2], d = Math.hypot(ddx, ddz);
      if (d > 4.5) continue;
      D.pendu = nuit;
      const pan = d > 0.1 ? clamp((ddx * Math.cos(p.yaw) - ddz * Math.sin(p.yaw)) / d, -1, 1) : 0;
      setTimeout(() => sound.whisper && sound.whisper(pan, 0.13), 600 + Math.random() * 1500);
      return;
    }
  }
});
// au chargement d'une partie : l'état, et les carlines ouvertes (le monde vient d'être régénéré)
HOOKS.load.push(() => { d1plantes.S(); d1plantes.ferme = false; d1plantes.carlT = 1; });
