// ============================================================================
//  DES QUÊTES POUR TOUT LE MONDE (Q16) : les données et les textes.
//  « Je veux que tous les PNJ aient des quêtes, et certains deux. »
//  - LES HABITANTS (NPC_DATA) : celles qui manquaient (les Sources, la naine,
//    les gardes et le chevalier) et une seconde pour quelques-uns ; elles
//    s'ajoutent à leur liste (d.quests) et passent par la machinerie de
//    toujours (11-npc.js : « Avez-vous besoin d'aide ? », le carnet). Deux
//    sortes en plus : 'aller' (se rendre à un lieu, à toute heure ou à une
//    heure dite) et 'chasse' (abattre une bête) ; et des fins à choix.
//  - LES AUTRES (Q16_PNJ) : ceux qui parlent sans être des habitants — la
//    diseuse, le violoneux, le crieur, le voiturier, le marchand de joie, le
//    roi Sucre, la vieille des gobelins, Thibaud et la Dame de Hautguet, la
//    veilleuse de la cité, les bêtes qui parlent, ceux du Dessous, les gens de
//    Basse-Fosse (les anonymes : des quêtes tirées de modèles, toujours les
//    mêmes pour une partie donnée). Le jeu : 11-zzzzzzQ16-quetes.js ; le
//    carnet : 12-zzzzzzQ16-quetes.js. État : farm.s.q16 (les autres) et
//    farm.s.quests (les habitants, comme avant).
// ============================================================================

// ---------------------------------------------------------------- les objets de quête (ils ne se vendent pas)
for (const [id, nom, ic, col, desc] of [
  ['q16_liste_cuirassiers', 'Liste de noms', 'lettre', '#d8ccb0', 'Une feuille pliée en quatre, des noms à l’encre violette, une colonne serrée. En tête : « 3e cuirassiers, 6 août 1870 ». Le papier a été mouillé, puis séché, souvent.'],
  ['q16_rapport_gendarme', 'Rapport du gendarme', 'lettre', '#e2dcc8', 'Une enveloppe réglementaire : « À Monsieur le Préfet. Rapport hebdomadaire n° 104. » L’écriture est droite. Elle penche un peu, sur la fin.'],
  ['q16_sonnaille_mule', 'Clochette de mule', 'objet', '#a88a4a', 'Une petite cloche de bronze verdi, au collier de cuir mangé. Le battant est attaché d’un fil. Elle sonne quand même, parfois, toute seule.'],
  ['q16_carte_pendu', 'Le Pendu', 'lettre', '#c8b48a', 'Une carte de tarot usée jusqu’à la trame : un homme pendu par un pied, qui sourit. Au dos, une tache de cire noire.'],
  ['q16_enveloppe_noire', 'Enveloppe bordée de noir', 'lettre', '#3a3430', 'Une enveloppe cachetée, bordée de noir, sans adresse. Elle sent la cannelle et la cire. Elle est plus lourde qu’une lettre.'],
  ['q16_avis_crieur', 'Avis à battre', 'lettre', '#e8e0c4', 'Une feuille d’avis, au tampon de la mairie : « Avis. On a perdu un enfant… » La date est effacée. Le papier est neuf.'],
  ['q16_cuillere_cure', 'Cuillère de baptême', 'objet', '#c8ccd4', 'Une petite cuillère d’argent, noircie. Gravé sur le manche : « Aimé, 1849 ». Elle est froide comme une pierre de cave.'],
  ['q16_de_argent', 'Dé à coudre d’argent', 'objet', '#d0d4dc', 'Un dé à coudre d’argent, cabossé, poli par un bec. Il brille plus qu’il ne devrait.'],
  ['q16_paquet_peau', 'Paquet de peau cousue', 'colis', '#c8c2b4', 'Un petit paquet de peau pâle, cousu serré. Il ne pèse presque rien. Quelque chose dedans bouge quand on le penche, comme du sable.'],
  ['q16_jeton_cire', 'Jeton de cire', 'objet', '#d8d0b8', 'Un rond de cire grise, gros comme une pièce, où l’on a pressé un pouce. On le donne, en bas, pour dire « c’est moi ».'],
]) defItem(id, nom, 'quete', 0, [ic, col], { desc, questItem: true });
// les objets qu'on cherche au sol : la forme de la chose posée (les autres : un livre)
const Q16_PROP = { q16_sonnaille_mule: 'figurine', q16_cuillere_cure: 'figurine', q16_de_argent: 'figurine' };

// ---------------------------------------------------------------- les quêtes des habitants (ajoutées à d.quests)
// Mêmes champs que dans 05-npc-data.js. En plus : type 'aller' (lieu, moment facultatif : 'nuit', 'aube', 'soir'),
// texte.vu (ce qu'on voit en arrivant : une ligne) ; type 'chasse' (bete : une espèce de CHASSE_NOMS, n) ;
// choix : [{ label, texte, reward }] (la fin se choisit ; texte.fin est dit avant le choix).
const Q16_HABITANTS = {
  naturiste_a: [
    { id: 'naturiste_a_1', title: 'De quoi parfumer l’eau', type: 'apporter', need: { lavande: 3, reine_pres: 2 }, minAmitie: 0,
      reward: { argent: 60, amitie: 1, objets: { huile: 1 } },
      texte: {
        offre: 'Le docteur dit que l’eau soigne mieux quand elle sent bon. Moi, je dis qu’elle sent l’œuf pourri et la montagne. Trois brins de lavande et deux grappes de reine-des-prés, et on verra qui a raison.',
        accepte: 'Merci ! La reine-des-prés pousse au bord de l’eau ; la lavande, chez ceux qui ont un jardin. Vous en avez un, il paraît.',
        attente: 'Ça sent toujours l’œuf, ici. Vous avez vu ?',
        fin: 'Respirez… Voilà. On dirait presque un bain de dame. Le docteur dira que c’est l’eau. Prenez cette huile : c’est la nôtre, on la fait avec les tournesols de la vallée.',
      } },
  ],
  naturiste_c: [
    { id: 'naturiste_c_1', title: 'La main dans la vapeur', type: 'enquete', lieu: 'cascade', moment: 'aube', minAmitie: 0,
      reward: { argent: 90, amitie: 1, objets: { bougie: 2 } },
      texte: {
        offre: 'Je dessine la vapeur, à l’aube, au pied de {lieu:cascade}. Toujours les mêmes formes : une grande main, un œil, trois traits. Le docteur dit que je vois ce que je veux voir. Allez-y, vous, demain à l’aube. Ne me dites pas ce que je dessine : dites-moi ce que vous voyez.',
        accepte: 'À l’aube, quand l’eau fume le plus. Restez un moment. Elle met du temps à se décider.',
        attente: 'Vous n’y êtes pas encore allé ? L’aube, c’est tous les jours.',
        fin: 'Une main ? Ouverte, ou fermée ? … Ouverte. Alors elle ne nous chasse pas, elle montre quelque chose. Merci. Prenez ces bougies : vous les allumerez la prochaine fois que vous la verrez. Moi, je les allume toutes les nuits.',
      } },
  ],
  nain_forgeronne: [
    { id: 'nain_forgeronne_1', title: 'Du charbon d’en haut', type: 'apporter', need: { charbon: 10, lingot_fer: 2 }, minAmitie: 0,
      reward: { argent: 0, amitie: 2, objets: { lentille: 1 } },
      texte: {
        offre: 'Notre charbon, on le prend dans la montagne, et la montagne n’aime plus qu’on le prenne. Dix charbons, deux lingots de fer. D’en haut. Pas de discussion.',
        accepte: 'Bien. Ne traînez pas : la forge ne s’arrête jamais, et moi non plus.',
        attente: 'Dix charbons, deux lingots. Je ne compte pas en mots, moi.',
        fin: 'Ça brûle sec, votre charbon d’en haut. Ça sent le soleil. Tenez : une lentille. Taillée par moi. Ne la rayez pas.',
      } },
    { id: 'nain_forgeronne_2', title: 'Ce qui frappe sous l’enclume', type: 'enquete', lieu: 'nains', moment: 'nuit', minAmitie: 2,
      reward: { argent: 120, amitie: 2, objets: { lentille_cristal: 1 } },
      texte: {
        offre: 'La nuit, sous mon enclume, on frappe. Trois coups, puis trois coups. Personne n’habite plus bas que nous. Mon père dit que c’est le dieu qui dort. Moi, je dis qu’un dieu ne frappe pas en mesure. Venez écouter, cette nuit, aux {lieu:nains}.',
        accepte: 'Ne dites rien à mon père. Il prierait.',
        attente: 'Ils ont encore frappé. Vous n’étiez pas là.',
        fin: 'Ils répondent à mon marteau ? … Alors, c’est quelqu’un qui a appris le métier. Je ne sais pas si ça me rassure. Prenez cette lentille de cristal. Cent ans de taille. Ne la vendez pas à un humain.',
      } },
  ],
  chevalier_guet: [
    { id: 'chevalier_guet_1', title: 'On frappe à la poterne', type: 'enquete', lieu: 'poterne', moment: 'nuit', minAmitie: 0,
      reward: { argent: 110, amitie: 1, objets: { huile_lampe: 4 } },
      texte: {
        offre: 'À trois heures, on frappe à {lieu:poterne}. De l’extérieur. Trois fois. Quand j’ouvre, personne, et pas une trace dans la boue. J’ai vingt-deux ans de service, je n’ouvre plus. Cette nuit, guettez de dehors. Je veux savoir qui, pas pourquoi.',
        accepte: 'De dehors. Pas de lanterne. On ne guette pas avec une lanterne.',
        attente: 'Ils ont frappé, cette nuit encore. Je n’ai pas ouvert.',
        fin: 'Personne, et pourtant on a frappé. … Bien. Je ferai murer la poterne. Prenez cette huile. Les nuits sont longues, ici, et les lampes ont soif.',
      } },
    { id: 'chevalier_guet_2', title: 'Les huit cents', type: 'livrer', objet: 'q16_liste_cuirassiers', a: 'cure', minAmitie: 2,
      reward: { argent: 90, amitie: 2 },
      texte: {
        offre: 'Une liste de noms. Les camarades du 6 août. Je voudrais qu’on dise une messe pour eux, une fois. Je ne vais pas à l’église : j’y ai trop vu de bannières. Portez-la au curé, voulez-vous ?',
        accepte: 'Ne la lisez pas. Il y a des noms qui ne regardent personne.',
        attente: 'La liste… Le curé l’a eue ?',
        recu: 'Une liste du chevalier ? … Cent trente-sept noms. Je les lirai dimanche, tous, à voix haute. Dites-lui de venir. Il peut rester au fond.',
        fin: 'Dimanche. … Je resterai au fond. Merci. Ça faisait cinquante ans que je portais cette feuille. Elle pèse moins, d’un coup.',
      } },
  ],
  garde_champetre: [
    { id: 'garde_champetre_1', title: 'La borne qui marche', type: 'aller', lieu: 'menhirs', minAmitie: 0,
      reward: { argent: 70, amitie: 1 },
      texte: {
        offre: 'Une borne du cadastre a encore bougé. Trente mètres, cette fois. On la retrouve au milieu des {lieu:menhirs}, plantée comme une des leurs. Allez voir et dites-moi si elle y est toujours. Que je dresse procès-verbal.',
        accepte: 'Regardez bien le numéro gravé dessus. Le cadastre, c’est sacré.',
        attente: 'Alors, cette borne ? Mon procès-verbal attend, plume en l’air.',
        vu: '(Au milieu des Demoiselles, une borne de cadastre, numéro effacé, de la mousse dessus comme si elle était là depuis toujours.)',
        fin: 'De la mousse ? Elle a été posée l’an dernier ! … Je vais écrire : « borne déplacée par inconnus ». Les inconnus, c’est commode. Merci.',
      } },
    { id: 'garde_champetre_2', title: 'Le procès-verbal de la mare', type: 'enquete', lieu: 'marais', moment: 'nuit', minAmitie: 1,
      reward: { argent: 100, amitie: 1 },
      choix: [
        { label: 'Il marchait sur l’eau', texte: 'Bien. Je rouvre le dossier. Signez là. … Vous tremblez ? Moi aussi, la première fois.', reward: { argent: 120, amitie: 1 } },
        { label: 'Je n’ai rien vu', texte: 'Rien. Bien sûr. Je le laisse classé. Merci de ne pas avoir vu. C’est un service, ça aussi.', reward: { argent: 60, amitie: 2 } },
      ],
      texte: {
        offre: 'Vingt ans de procès-verbaux, et un seul que je n’ai pas su ranger : l’homme qui marchait sur l’eau du {lieu:marais}. Il paraît qu’il y repasse, les nuits calmes. Allez-y cette nuit. Il me faut un témoin, et je suis trop vieux pour en être un.',
        accepte: 'Ne l’appelez pas. On n’appelle pas quelqu’un qui marche sur l’eau.',
        attente: 'Alors ? Le marais, de nuit. Je ne vous force pas. Enfin, si, un peu.',
        fin: 'Vous l’avez vu ? Dites-le-moi comme vous le signeriez.',
      } },
  ],
  gendarme: [
    { id: 'gendarme_1', title: 'Le rapport n° 104', type: 'livrer', objet: 'q16_rapport_gendarme', a: 'postiere', minAmitie: 0,
      reward: { argent: 50, amitie: 1 },
      texte: {
        offre: 'Mes rapports partent chaque semaine, la postière me l’assure. Jamais de réponse. Portez celui-ci vous-même, en main propre, et regardez ce qu’elle en fait. Ce n’est pas un soupçon. C’est une procédure.',
        accepte: 'En main propre. Et regardez bien.',
        attente: 'Le rapport est parti ?',
        recu: 'Encore un rapport du gendarme ? Je le mets dans le sac de la préfecture, comme les autres. Le sac part le mardi. Il revient le mercredi. Plein. Je n’ai jamais osé lui dire.',
        fin: 'Plein. Mes rapports me reviennent, donc. Depuis deux ans. … Je continuerai quand même. Quelqu’un les lit, là-bas, ou ici. Ça revient au même.',
      } },
    { id: 'gendarme_2', title: 'Le loup de la tournée', type: 'chasse', bete: 'wolf', n: 1, minAmitie: 1,
      reward: { argent: 150, amitie: 1, objets: { cartouche: 6 } },
      texte: {
        offre: 'Un loup suit ma tournée. Toujours le même, une oreille fendue. Il ne m’attaque pas : il me suit, à vingt pas, d’un village à l’autre. Mon cheval ne dort plus. Abattez-le, si vous chassez. Je ne peux pas tirer en service.',
        accepte: 'Il est souvent à la lisière, vers le soir. Visez bien : il est plus malin que vous et moi.',
        attente: 'Il était encore là ce matin. Vingt pas.',
        fin: 'Abattu ? … Le cheval a mangé, ce matin. Voici pour vous, et des cartouches. Ne me dites pas s’il avait l’oreille fendue. Je préfère croire que oui.',
      } },
  ],
  libraire: [
    { id: 'libraire_2', title: 'Un lecteur en retard', type: 'parler', a: 'cure', minAmitie: 2,
      reward: { argent: 90, amitie: 2 },
      texte: {
        offre: 'Le registre des emprunts porte un nom : l’abbé Mauduit, 1871. Le livre n’est jamais revenu. L’abbé non plus. Demandez au curé si le livre est encore dans sa sacristie. Poliment. Les retards se paient, mais pas toujours en argent.',
        accepte: 'Ne dites pas le titre. Il le reconnaîtra.',
        attente: 'Alors, la sacristie ?',
        recu: 'Un livre de l’abbé Mauduit ? Il y en a un, dans la sacristie, que personne n’ose ouvrir. Il est chaud, même l’hiver. Dites au bibliothécaire de venir le chercher lui-même.',
        fin: 'Lui-même. Il sait bien que je ne peux pas sortir d’ici… Il ne sait pas, en fait. Tant mieux. Merci. Je vous inscris parmi les lecteurs exacts.',
      } },
  ],
  colporteur: [
    { id: 'colporteur_2', title: 'Une lumière au col', type: 'aller', lieu: 'refuge', minAmitie: 1,
      reward: { argent: 80, amitie: 1, objets: { corde: 2 } },
      texte: {
        offre: 'Un berger m’a dit qu’on voyait de la lumière au {lieu:refuge}, les nuits de neige. Personne n’y monte avant l’été. Allez voir, et racontez-moi. Une bonne nouvelle, ça se vend mieux qu’un couteau.',
        accepte: 'Couvrez-vous. Là-haut, le vent ne vend rien, il prend.',
        attente: 'Alors, ce refuge ? J’ai déjà commencé à raconter l’histoire. Il me manque la fin.',
        vu: '(Dans le refuge, un feu froid, des cendres en rond, et quatre bols posés comme pour des invités qui ne sont pas venus.)',
        fin: 'Quatre bols ? Parfait. Terrible, mais parfait. Je la raconterai jusqu’à Saint-Flour. Tenez, de la corde. Pour la prochaine fois que vous monterez.',
      } },
  ],
  colporteuse: [
    { id: 'colporteuse_2', title: 'La clochette de la mule', type: 'trouver', objet: 'q16_sonnaille_mule', lieu: 'col', minAmitie: 1,
      reward: { argent: 130, amitie: 2, objets: { carte_est: 1 } },
      texte: {
        offre: 'Ma mule est morte au {lieu:col}, il y a vingt ans. Sa clochette, je la lui ai laissée. Certaines nuits, sur les chemins d’ici, je l’entends derrière moi. Allez voir là-haut si elle y est encore. Si elle n’y est pas, je saurai que c’est bien elle.',
        accepte: 'Une petite cloche verte, au collier mangé. Vous la reconnaîtrez : elle sonne faux.',
        attente: 'Je l’ai encore entendue, hier soir. Derrière la roulotte.',
        fin: 'C’est elle. Elle était là-haut, alors. Ce que j’entends le soir, ce n’est pas elle. … Gardons ça pour nous. Prenez cette carte, je la connais par cœur.',
      } },
  ],
  naturiste_b: [
    { id: 'naturiste_b_2', title: 'La source qui respire', type: 'enquete', lieu: 'sources', moment: 'nuit', minAmitie: 1,
      reward: { argent: 100, amitie: 1 },
      choix: [
        { label: 'C’est la géologie', texte: 'Évidemment. Une poche de gaz qui se vide et se remplit. Je l’écrirai ainsi. Merci, vous êtes un esprit sain.', reward: { argent: 100, amitie: 1 } },
        { label: 'Quelque chose respire', texte: 'Je sais. Je l’écris « géologie » dans mes cahiers depuis vingt ans. Il faut bien écrire quelque chose. Merci de me l’avoir dit en face.', reward: { argent: 60, amitie: 2, objets: { bandage: 2 } } },
      ],
      texte: {
        offre: 'Les nuits sans vent, l’eau des {lieu:sources} baisse d’un pouce, puis remonte. Lentement. Huit fois par minute. Allez regarder, cette nuit. Je veux l’avis de quelqu’un qui n’a pas lu mes livres.',
        accepte: 'Comptez. Huit fois par minute. Si c’est douze, revenez tout de suite.',
        attente: 'Vous n’avez pas encore regardé l’eau, la nuit ?',
        fin: 'Alors ? Huit fois, comme je disais ? Et qu’est-ce que vous en pensez, vous ?',
      } },
  ],
  planches_doyenne: [
    { id: 'planches_doyenne_2', title: 'Les noms sous la Dame', type: 'aller', lieu: 'planches_dame', minAmitie: 1,
      reward: { argent: 0, amitie: 2, objets: { cierge_flottant: 2, tisane: 1 } },
      texte: {
        offre: 'Va jusqu’à {lieu:planches_dame}, au bout des planches. Sous son pied, il y a des noms gravés : ceux de Saint-Aubin qui sont restés en bas. Compte-les. Il doit y en avoir quarante et un.',
        accepte: 'Compte deux fois. L’eau ment, la pierre non.',
        attente: 'Tu n’as pas encore compté ?',
        vu: '(Sous le pied de la Dame, des noms gravés serrés. Quarante-deux. Le dernier est récent, les bords encore blancs.)',
        fin: 'Quarante-deux ? … Alors quelqu’un a gravé le sien. Ne me dis pas lequel. Prends ces calèus, pour le Vorndi. Et la tisane, pour dormir quand même.',
      } },
  ],
  estive_patre: [
    { id: 'estive_patre_2', title: 'La bête de trop', type: 'enquete', lieu: 'estive_crete', moment: 'nuit', minAmitie: 1,
      reward: { argent: 60, amitie: 2, objets: { plume_aigle: 1 } },
      texte: {
        offre: 'Hier, deux cent sept. Ce matin, deux cent six. Ça change tous les jours, d’une bête. La nuit, elles montent seules sur {lieu:estive_crete} et restent là, à regarder en bas. Va voir ce qui les appelle. Le grand-père ne veut pas que j’y aille.',
        accepte: 'Ne compte pas à voix haute. Elles n’aiment pas.',
        attente: 'Deux cent sept, aujourd’hui. Tu y es allé ?',
        fin: 'Une de trop, sans ombre, qui regardait vers la vallée ? … Je ne la compterai plus. Deux cent six, c’est le bon compte. Tiens, une plume d’aigle. Je l’avais trouvée pour toi.',
      } },
  ],
};

// ---------------------------------------------------------------- les autres : qui ils sont, leurs quêtes
// Q16_PNJ.<clé> = { nom, ou (au carnet), aide (le mot pour proposer son aide), quetes: [ … ] } ; une quête : mêmes champs
// que plus haut (sans minAmitie ni amitie), et apres (l'id d'une quête du même à finir d'abord), garde (apporter :
// l'objet montré n'est pas pris), a (livrer, parler : un habitant, ou la clé d'un autre de cette liste).
// Les clés : 'diseuse', 'violoneux', 'crieur', 'voiturier', 'marchand_joie', 'roi_sucre', 'aieule', 'thibaud',
// 'dame', 'veilleuse', 'bete:<id>', 'sout:<k>', 'v5:<id>' (les gens de Basse-Fosse : id comme dans habitantsV5).
const Q16_PNJ = {
  diseuse: { nom: 'Mère Ysaure', ou: 'la diseuse', quetes: [
    { id: 'q16_diseuse_1', title: 'La carte qui manque', type: 'trouver', objet: 'q16_carte_pendu', lieu: 'cimetiere',
      reward: { argent: 60 },
      texte: {
        offre: '« Mon jeu a soixante-dix-sept cartes. Il en avait soixante-dix-huit. Le Pendu, je l’ai perdu au {lieu:cimetiere}, le soir où j’ai tiré les cartes pour une morte. Il ne faut pas laisser le Pendu à une morte. Elle s’en servirait. »',
        accepte: '« Il sera tombé face contre terre. Il tombe toujours face contre terre. »',
        attente: '« Mon jeu est incomplet. Je lis de travers. »',
        fin: '« Le voilà. » Elle le glisse au milieu du jeu sans le regarder. « Tu as remarqué qu’il souriait ? Il ne souriait pas, avant. » Elle vous rend dix fois votre peine.',
      } },
    { id: 'q16_diseuse_2', title: 'La lettre de la morte', type: 'livrer', objet: 'q16_enveloppe_noire', a: 'guerisseuse', apres: 'q16_diseuse_1',
      reward: { argent: 70 },
      texte: {
        offre: '« La morte du cimetière m’a dicté une lettre, la nuit dernière. Pour la femme des bois. Moi, je ne porte plus rien chez elle : nous nous sommes dit, il y a quarante ans, tout ce que deux sorcières peuvent se dire. »',
        accepte: '« Ne l’ouvre pas. Elle n’est pas fermée pour toi. »',
        attente: '« La lettre attend. Les morts n’aiment pas attendre : ils n’ont que ça à faire. »',
        recu: 'Une lettre d’Ysaure ? Elle sait que je ne lis pas. … Pose-la sur le feu. Voilà. C’est comme ça qu’on les lit, celles-là.',
        fin: '« Brûlée ? Alors elle est arrivée. » Elle bat les cartes, tire la première, la repose sans la retourner.',
      } },
  ] },
  violoneux: { nom: 'le vieux Tiennot', ou: 'le violoneux', quetes: [
    { id: 'q16_violoneux_1', title: 'L’air de la chapelle', type: 'enquete', lieu: 'chapelle', moment: 'nuit',
      reward: { argent: 40, objets: { cidre: 1 } },
      texte: {
        offre: 'Il s’arrête de jouer. « Il y a un air que je ne sais pas finir. Je l’ai entendu une fois, à {lieu:chapelle}, la nuit. Un violon, sans personne. Va l’écouter, et reviens me fredonner la fin. »',
        accepte: '« Ne chante pas avec. Écoute seulement. »',
        attente: '« Alors, cette fin ? » Il joue les premières mesures, s’arrête au même endroit.',
        vu: '(Dans la chapelle, quelques notes, très loin, puis rien. La fin ne vient pas.)',
        fin: 'Vous essayez de fredonner. Il n’en sort rien. Il vous regarde longtemps. « Tu as les lèvres bleues. Assieds-toi. Je jouerai autre chose. » Il vous tend un cidre.',
      } },
  ] },
  crieur: { nom: 'Barnabé Toquet', ou: 'le crieur', quetes: [
    { id: 'q16_crieur_1', title: 'L’avis à battre', type: 'livrer', objet: 'q16_avis_crieur', a: 'garde_champetre',
      reward: { argent: 35 },
      texte: {
        offre: '« Mon collègue de {hameau} a le tambour aussi. Portez-lui cet avis, qu’il le batte là-bas. La mairie me le donne chaque année, au même jour. »',
        accepte: '« En main propre. Les avis, ça s’égare. »',
        attente: '« L’avis est parti ? »',
        recu: '« Avis. On a perdu un enfant, un soir de 1868. Qui l’a trouvé est prié de le rendre. » … C’est le même chaque année. Je le bats quand même. On ne sait jamais qui écoute.',
        fin: '« Il l’a battu ? Bien. » Il resserre la peau de son tambour. « Un jour, quelqu’un répondra. »',
      } },
  ] },
  voiturier: { nom: 'le voiturier', ou: 'le roulage Bardin', quetes: [
    { id: 'q16_voiturier_1', title: 'Le fer de la jument', type: 'apporter', need: { fer_cheval: 1 },
      reward: { argent: 30, objets: { clous: 2 } },
      texte: {
        offre: '« Ma jument a perdu un fer sur la route, en venant. Elle boite, la pauvre. Un fer, si vous en avez un, et je repars d’aplomb. »',
        accepte: '« Le forgeron en a, ou bien vous savez en faire. Je repasse demain, de toute façon. »',
        attente: '« Toujours ce fer ? Elle boite, je vous dis. »',
        fin: '« Merci bien. Tenez, des clous, pour la peine. » Il ferre la jument sur place, en sifflant entre ses dents.',
      } },
  ] },
  marchand_joie: { nom: 'le marchand de joie', ou: 'au bord d’un chemin', quetes: [
    { id: 'q16_marchand_joie_1', title: 'Un mot pour le curé', type: 'parler', a: 'cure',
      reward: { argent: 50 },
      texte: {
        offre: '« Dites au curé que je suis revenu. Juste ça. Il comprendra. »',
        accepte: '« Et regardez ses mains, quand vous le lui direz. »',
        attente: '« Vous ne lui avez pas encore dit ? Je reviens toujours, vous savez. Je peux attendre. »',
        recu: 'Revenu ? … Il était déjà là quand j’étais enfant. Avec la même redingote verte. Dites-lui que l’église lui reste fermée.',
        fin: '« Fermée. Bien sûr. » Il sourit de toutes ses dents. « Elle l’était déjà. Tenez, pour la commission. »',
      } },
  ] },
  roi_sucre: { nom: 'le roi Sucre', ou: 'le pays des bonbons', quetes: [
    { id: 'q16_roi_sucre_1', title: 'Une pomme qui pourrit', type: 'apporter', need: { pomme: 1 },
      reward: { objets: { dragees: 4 } },
      texte: {
        offre: '« Apporte-moi une pomme de là-haut, la prochaine fois. Une vraie. Je voudrais voir quelque chose pourrir. Ici, rien ne pourrit. Tu ne peux pas savoir comme c’est long. »',
        accepte: '« Une vraie, hein. Avec un ver, si tu en trouves. »',
        attente: '« Pas de pomme ? Tant pis. Tout le monde revient. Toi aussi. »',
        fin: 'Il la tient longtemps au creux de sa main de pain d’épice. Elle ne pourrit pas. Il pleure du sirop. « Prends des dragées. Prends. »',
      } },
  ] },
  aieule: { nom: 'la vieille', ou: 'la Gobelinière', aide: 'Que voulez-vous ?', quetes: [
    { id: 'q16_aieule_1', title: 'Ce qu’on ne regarde plus', type: 'apporter', need: { ficelle: 1, bouteille_vide: 1, chiffon: 1 },
      reward: { objets: { vieille_piece: 2 } },
      texte: {
        offre: '« Apporte ce que tu ne regardes plus. » (Une voix de vieille.) « Trois choses. » (Une voix d’enfant.) « Un bout de ficelle, une bouteille vide, un chiffon. Ce qui traîne. Ce qu’on oublie d’avoir. »',
        accepte: '« Tu les trouveras chez toi. » (Votre propre voix.) « Tu ne les avais pas vues. »',
        attente: '« Pas encore. » (Une voix d’homme.) « Tu les regardes trop. »',
        fin: '« Tout revient. » (Une voix d’enfant.) Elle fouille l’argent du tas sans regarder, et vous tend deux pièces anciennes.',
      } },
    { id: 'q16_aieule_2', title: 'La cuillère du curé', type: 'livrer', objet: 'q16_cuillere_cure', a: 'cure', apres: 'q16_aieule_1',
      reward: { objets: { pierre_percee: 1 } },
      texte: {
        offre: '« Celle-ci pèse. » (La voix du curé, quand il était petit.) Elle tient une cuillère d’argent noircie. « Rends-la. Elle pèse sur le tas. »',
        accepte: '« Ne lui dis pas d’où. » (Une voix de femme.) « Il le sait. »',
        attente: '« Elle pèse encore. »',
        recu: 'Ma cuillère de baptême ! Je l’avais perdue à sept ans, le jour où… Où l’avez-vous… Non. Ne me dites pas. Ne me dites rien.',
        fin: '« Rendue. » (Une voix de femme.) « Une de moins sur le tas. » Elle vous tend une pierre percée. « Pour regarder à travers. Ce qu’on ne voit plus. »',
      } },
  ] },
  thibaud: { nom: 'Thibaud', ou: 'le treuil de Hautguet', quetes: [
    { id: 'q16_thibaud_1', title: 'Une couverture neuve', type: 'apporter', need: { laine: 2 },
      reward: { objets: { huile: 1 } },
      texte: {
        offre: '« Ma couverture est mangée. Les mites, ou autre chose. Il fait froid, au treuil. Il fait froid depuis cette nuit-là. Apportez-moi de la laine, si vous redescendez. »',
        accepte: '« Je ne bouge pas. Vous savez où me trouver. »',
        attente: '« Il fait froid. »',
        fin: 'Il ne la met pas sur ses épaules. Il la plie et la pose sur le banc. « Pour quand ils monteront. Il fera froid, sur le pont. » Il vous tend une fiole d’huile. « Pour le Guet. Il en faut trois. »',
      } },
  ] },
  dame: { nom: 'dame Ysolde', ou: 'la tour de Hautguet', quetes: [
    { id: 'q16_dame_1', title: 'Quelque chose de la foire', type: 'apporter', need: { bouquet: 1 },
      reward: { objets: { bijou: 1 } },
      texte: {
        offre: '« Aude voulait voir la foire. Rapporte-moi quelque chose qui sente la foire. Des fleurs nouées. Glisse-les sous la porte. »',
        accepte: '« Je ne dors pas. Je ne dors plus. »',
        attente: '« Tu as les mains vides. Je l’entends. »',
        fin: 'Le bouquet passe sous la porte, tiré de l’autre côté. « Elle sent la foire. » Un long silence. Sous la porte, quelque chose glisse vers vous.',
      } },
  ] },
  veilleuse: { nom: 'la veilleuse', ou: 'la cité', quetes: [
    { id: 'q16_veilleuse_1', title: 'Le cahier d’Iorin', type: 'apporter', need: { vg_cahier_iorin: 1 }, garde: true,
      reward: { objets: { vg_graine: 1 } },
      texte: {
        offre: '« Iorin avait un cahier. L’enfant. Je ne peux pas le lire : je n’ai pas d’yeux pour le papier. Trouve-le, et lis-le-moi. »',
        accepte: '« Il était dans les Berceaux. Ou ailleurs. Les enfants ne rangent pas. »',
        attente: '« Pas encore ? Je t’attends. Je ne fais que ça. »',
        fin: 'Vous lisez à voix haute. Les mots de travers, les dessins que vous décrivez. La lumière baisse, puis remonte. « Il écrivait mal. Il écrivait tout. Garde son cahier. Prends ceci : il l’avait gardé pour la vallée. »',
      } },
  ] },
  // ------------------------------------------------ les bêtes qui parlent (leur premier service est le leur : 11-zzzzP-betes.js)
  'bete:chat': { nom: 'Tibert', ou: 'le chat de l’auberge', bete: 'chat', aide: 'Un autre service ?', quetes: [
    { id: 'q16_bete_chat_1', title: 'Le conseil des chats', type: 'enquete', lieu: 'cimetiere', moment: 'nuit',
      reward: { objets: { vieille_piece: 1 } },
      texte: {
        offre: 'Les chats de la ville se réunissent au {lieu:cimetiere}, les nuits sans lune. Je n’y vais plus, depuis… une affaire. Allez voir s’ils m’attendent encore. Ne vous asseyez pas sur la tombe du milieu.',
        accepte: 'Comptez-les. S’ils sont treize, partez.',
        attente: 'Vous n’y êtes pas allé. Je le sens à votre odeur.',
        vu: '(Sur les tombes, des yeux. Douze paires. Au milieu, une place vide, et personne ne s’y assied.)',
        fin: 'Une place vide. Ils m’attendent encore. … Bien. Qu’ils attendent. Tenez : je l’ai trouvée sous un tonneau. Les pièces n’intéressent pas les chats.',
      } },
  ] },
  'bete:hulotte': { nom: 'la hulotte', ou: 'le chêne millénaire', bete: 'hulotte', aide: 'Autre chose ?', quetes: [
    { id: 'q16_bete_hulotte_1', title: 'Un nichoir', type: 'apporter', need: { nichoir: 1 },
      reward: { objets: { plume_hulotte: 1 } },
      texte: {
        offre: 'Mon chicot est pourri jusqu’au cœur. Il tombera avant l’hiver. Toi, tu sais faire des boîtes avec un trou rond. Fais-en une. Je ne dirai à personne que j’ai demandé.',
        accepte: 'Un trou large. Je ne suis pas une mésange.',
        attente: 'Le chicot a craqué, cette nuit. Je t’attends.',
        fin: 'Elle la regarde d’un œil, puis de l’autre. « Pas mal. Pour une main. » Elle laisse tomber une plume à vos pieds.',
      } },
  ] },
  'bete:corbeau': { nom: 'Tiécelin', ou: 'la Table des Géants', bete: 'corbeau', aide: 'Autre chose ?', quetes: [
    { id: 'q16_bete_corbeau_1', title: 'Ce qui brille chez les Demoiselles', type: 'trouver', objet: 'q16_de_argent', lieu: 'menhirs',
      reward: { objets: { vieille_piece: 2 } },
      choix: [
        { label: 'Le lui rendre', texte: 'Il le prend au bec, le cache sous son aile. « Tu es moins bête qu’un homme. Un peu. » Il pousse deux pièces vers vous.', reward: { objets: { vieille_piece: 2 } } },
        { label: 'Le garder', garde: true, texte: '« Garde-le. » Il ne crie pas. Il vous regarde. « Je m’en souviendrai. Les corbeaux se souviennent de tout, c’est pour ça qu’on nous déteste. »', reward: {} },
      ],
      texte: {
        offre: 'J’ai caché une chose qui brille sous une pierre des {lieu:menhirs}, et je ne sais plus laquelle. Elles se ressemblent toutes, ces pierres. Elles le font exprès. Retrouve-la.',
        accepte: 'Un dé. Une chose pour les doigts, en argent. Ne le mets pas à ton doigt.',
        attente: 'Tu ne l’as pas. Je le vois à ta main.',
        fin: 'Tu l’as. Je le vois briller d’ici. Alors ?',
      } },
  ] },
  // ------------------------------------------------ le Dessous (ils ne prennent pas de sous : ils donnent des choses)
  'sout:un': { nom: 'Un', ou: 'le Hameau d’En-Bas', sout: 'un', aide: 'Ouvrir les mains', quetes: [
    { id: 'q16_sout_un_1', title: 'Une pierre pour la cabane vide', type: 'apporter', need: { luisante: 1 },
      reward: { objets: { perle_caverne: 1 } },
      texte: {
        offre: '(Il montre la cabane vide, celle du onzième, toute noire. Puis votre main.) « Lum… nenn. Lui. »',
        accepte: '(Il hoche la tête, une fois.) « Lui. »',
        attente: '(Il regarde vos mains, puis la cabane noire.) « Lui ? »',
        fin: '(Il pose la pierre qui luit sur le seuil de la cabane vide. Une lueur verte, dedans, pour la première fois.) « Onz. Bô. » (Il vous donne une perle des cavernes.)',
      } },
    { id: 'q16_sout_un_2', title: 'Les encoches de la cave', type: 'aller', lieu: 'sout_cave', apres: 'q16_sout_un_1',
      reward: { objets: { luisante: 2 } },
      texte: {
        offre: '(Il montre le haut, très haut, la direction de la porte sud. Il frappe le mur du plat de la main.) « Mûr. Onz. Va. »',
        accepte: '« Va. »',
        attente: '« Mûr ? »',
        vu: '(Dans la cave des Murés, onze encoches sur la pierre. La onzième est fraîche.)',
        fin: '(Vous comptez sur vos doigts. Onze. Vous montrez le onzième, et le geste de gratter. Il écoute vos mains, longtemps.) « Onz. Tojor onz. » (Il vous donne deux pierres qui luisent.)',
      } },
  ] },
  'sout:deu': { nom: 'Deû', ou: 'le Hameau d’En-Bas', sout: 'deu', aide: 'Ouvrir les mains', quetes: [
    { id: 'q16_sout_deu_1', title: 'Manj', type: 'apporter', need: { soupe: 1 },
      reward: { objets: { pied_pierre_grille: 2 } },
      texte: {
        offre: '(La vieille montre sa bouche, puis la marmite froide.) « Manj ? Chô ? »',
        accepte: '« Chô. Bô. »',
        attente: '« Manj ? »',
        fin: '(Elle boit la soupe chaude à petites gorgées, les yeux fermés.) « Chô… » (Elle vous donne des pieds-de-pierre grillés.)',
      } },
  ] },
  'sout:tre': { nom: 'Trè', ou: 'le Hameau d’En-Bas', sout: 'tre', aide: 'Ouvrir les mains', quetes: [
    { id: 'q16_sout_tre_1', title: 'Sèl', type: 'apporter', need: { sel: 3 },
      reward: { objets: { luisante: 1 } },
      texte: {
        offre: '(Elle ouvre la main, la referme trois fois.) « Sèl. Trè sèl. »',
        accepte: '« Bô. »',
        attente: '« Sèl ? »',
        fin: '(Elle goûte le sel du bout du doigt, ferme les yeux.) « Sèl ! » (Elle vous donne une pierre qui luit.)',
      } },
  ] },
  'sout:katr': { nom: 'Katr', ou: 'le Hameau d’En-Bas', sout: 'katr', aide: 'Ouvrir les mains', quetes: [
    { id: 'q16_sout_katr_1', title: 'Une ligne', type: 'apporter', need: { corde: 1, clous: 1 },
      reward: { objets: { poisson_aveugle: 2 } },
      texte: {
        offre: '(Le pêcheur montre sa ligne, cassée, puis l’eau noire. Il fait le geste de tirer.) « Gout… tsi. Kord ? »',
        accepte: '« Kord. Bô. »',
        attente: '(Il tire sur un fil qui n’existe pas.) « Kord ? »',
        fin: '(Il plie un clou en hameçon entre ses dents, noue la corde.) « Gout bô. » (Il vous donne deux poissons sans yeux.)',
      } },
  ] },
  'sout:sin': { nom: 'Sin', ou: 'le Hameau d’En-Bas', sout: 'sin', aide: 'Ouvrir les mains', quetes: [
    { id: 'q16_sout_sin_1', title: 'Pour que Neu dorme', type: 'apporter', need: { laine: 1 },
      reward: { objets: { perle_caverne: 1 } },
      texte: {
        offre: '(Elle montre l’enfant, qui grelotte, puis la pierre nue où il dort.) « Neu… dôr. Frè. »',
        accepte: '« Bô. »',
        attente: '« Neu frè. »',
        fin: '(Elle étale la laine sous l’enfant, la lisse longtemps.) « Neu dôr. » (Elle vous donne une perle des cavernes.)',
      } },
  ] },
  'sout:si': { nom: 'Si', ou: 'le Hameau d’En-Bas', sout: 'si', aide: 'Ouvrir les mains', quetes: [
    { id: 'q16_sout_si_1', title: 'Porter à la fileuse', type: 'livrer', objet: 'q16_paquet_peau', a: 'sout:ui',
      reward: { objets: { pied_pierre_grille: 2 } },
      texte: {
        offre: '(Le porteur vous met un petit paquet de peau dans les mains, montre la cabane de la fileuse.) « Va. Ui. »',
        accepte: '« Va, va. »',
        attente: '« Ui ? »',
        recu: '(La fileuse ouvre le paquet : des cheveux blancs, longs, roulés en écheveau.) « Frè. »',
        fin: '(Il hoche la tête.) « Va. Bô. » (Il vous donne des pieds-de-pierre grillés.)',
      } },
  ] },
  'sout:se': { nom: 'Sè', ou: 'le Hameau d’En-Bas', sout: 'se', aide: 'Ouvrir les mains', quetes: [
    { id: 'q16_sout_se_1', title: 'Écouter en haut', type: 'enquete', lieu: 'vieux_puits', moment: 'nuit',
      reward: { objets: { luisante: 1 } },
      texte: {
        offre: '(Le guetteur montre le haut, puis son oreille, puis frappe trois coups sur la pierre.) « Hoûm. D’sû. »',
        accepte: '« Hoûm. »',
        attente: '« Hoûm ? »',
        vu: '(Penché sur le vieux puits, dans le noir : trois coups, tout au fond. Les mêmes qu’à la pierre d’appel.)',
        fin: '(Vous frappez trois coups sur votre paume. Il sourit, pour la première fois.) « Onz. Bô. » (Il vous donne une pierre qui luit.)',
      } },
  ] },
  'sout:ui': { nom: 'Ui', ou: 'le Hameau d’En-Bas', sout: 'ui', aide: 'Ouvrir les mains', quetes: [
    { id: 'q16_sout_ui_1', title: 'Du fil', type: 'apporter', need: { bobine_fil: 2 },
      reward: { objets: { perle_caverne: 1 } },
      texte: {
        offre: '(La fileuse montre son fuseau, vide, et ses doigts usés.) « Fil ? »',
        accepte: '« Bô. »',
        attente: '(Le fuseau tourne à vide.) « … »',
        fin: '(Elle tire le fil de la bobine, le roule entre ses doigts, le sent.) « D’sû. Bô. » (Elle vous donne une perle des cavernes.)',
      } },
  ] },
  'sout:neu': { nom: 'Neu', ou: 'le Hameau d’En-Bas', sout: 'neu', aide: 'Ouvrir les mains', quetes: [
    { id: 'q16_sout_neu_1', title: 'Quelque chose d’en haut', type: 'apporter', need: { fleur: 1 },
      reward: { objets: { pied_pierre: 2 } },
      texte: {
        offre: '(L’enfant tend les mains en coupe, regarde le haut.) « D’sû ? D’sû ? »',
        accepte: '« Vyin ! »',
        attente: '« D’sû ? »',
        fin: '(Il sent la fleur longtemps. Il ne sait pas ce que c’est. Il la cache sous sa chemise.) « Lum… » (Il vous donne deux champignons blancs.)',
      } },
  ] },
  'sout:di': { nom: 'Di', ou: 'le Hameau d’En-Bas', sout: 'di', aide: 'Ouvrir les mains', quetes: [
    { id: 'q16_sout_di_1', title: 'Vers les Gouttes', type: 'aller', lieu: 'sout_dormeurs',
      reward: { objets: { luisante: 1 } },
      texte: {
        offre: '(Le jeune montre la longue galerie, puis sa pierre verte, puis vous.) « Va. D’sou. »',
        accepte: '« Mo dôr. Va. »',
        attente: '« Va ? »',
        vu: '(Dans la Chambre des Gouttes, une pierre verte posée sur une dalle, et onze petites pierres en rond autour.)',
        fin: '(Vous montrez onze doigts, et le rond. Il rit sans bruit.) « Onz. » (Il vous donne une pierre qui luit.)',
      } },
  ] },
  // ------------------------------------------------ Basse-Fosse : ceux qui ont un nom (les autres : Q16_V5_MODELES)
  'v5:greffier': { nom: 'le Greffier', ou: 'Basse-Fosse', v5: 'greffier', quetes: [
    { id: 'q16_v5_greffier_1', title: 'Des chandelles d’en haut', type: 'apporter', need: { bougie: 2 },
      reward: { argent: 60 },
      texte: {
        offre: '« Ma chandelle baisse. Celles d’ici sont faites de… ce qu’il reste. Elles sentent. Apporte-m’en deux de là-haut. Je compterai mieux. »',
        accepte: '« Je ne bouge pas. Je ne bouge jamais. »',
        attente: '« Elle baisse. »',
        fin: '« De la cire d’abeille. » Il la tient sous son nez. « J’avais oublié les abeilles. » Il vous paie en pièces d’en haut, propres, rangées depuis longtemps.',
      } },
    { id: 'q16_v5_greffier_2', title: 'L’heure qu’il est là-haut', type: 'parler', a: 'v5:sonneuse_1', apres: 'q16_v5_greffier_1',
      reward: { argent: 40 },
      texte: {
        offre: '« Demande à la Sonneuse quelle heure il est, là-haut. Elle seule le sait encore. Moi, j’ai le compte, je n’ai plus l’heure. »',
        accepte: '« Va. Elle est au temple, ou près du temple. »',
        attente: '« Alors, l’heure ? »',
        recu: '« Là-haut ? » Elle ferme les yeux. « L’heure où l’on rentre les bêtes. Dis-lui ça. C’est toujours cette heure-là, dans ma tête. »',
        fin: '« L’heure où l’on rentre les bêtes. » Il l’écrit en marge du registre, très petit. « Merci. Je n’avais plus d’heure. »',
      } },
  ] },
  'v5:sonneuse_1': { nom: 'la Sonneuse', ou: 'Basse-Fosse', v5: 'sonneuse_1', quetes: [
    { id: 'q16_v5_sonneuse_1', title: 'La corde de la cloche', type: 'apporter', need: { corde: 2 },
      reward: { argent: 45 },
      texte: {
        offre: '« La corde de ma cloche s’effiloche. Quand elle cassera, plus personne ne saura l’heure. Apporte-m’en de la neuve. Du chanvre d’en haut. »',
        accepte: '« Deux longueurs. La cloche est haute. »',
        attente: '« Elle tient encore. Plus pour longtemps. »',
        fin: '« Elle sent l’herbe. » Elle noue la corde neuve, tire une fois, doucement. Le son descend jusqu’à vous comme de l’eau.',
      } },
  ] },
  'v5:marchande_2': { nom: 'la Marchande', ou: 'Basse-Fosse', v5: 'marchande_2', quetes: [
    { id: 'q16_v5_marchande_1', title: 'Ce qui a vu le jour', type: 'apporter', need: { pomme: 3, miel: 1 },
      reward: { objets: { v5_couronne_cire: 1 } },
      texte: {
        offre: '« Trois pommes et un pot de miel. Pour moi, pas pour vendre. Je ne compte pas, moi. Je vends. Mais ça, je le garde. »',
        accepte: '« Des pommes rouges, si tu en trouves. Le rouge, ici, on l’oublie. »',
        attente: '« Pas encore ? Je ne suis pas pressée. Personne ne l’est, ici. »',
        fin: '« Rouges. » Elle les range dans un panier à part, sous un linge. Elle vous donne une couronne de cire. « Pour rien. Ne le dis pas. »',
      } },
  ] },
  'v5:veilleuse_3': { nom: 'la Veilleuse', ou: 'Basse-Fosse', v5: 'veilleuse_3', quetes: [
    { id: 'q16_v5_veilleuse_1', title: 'Nourrir les feux', type: 'apporter', need: { huile_lampe: 3 },
      reward: { argent: 50 },
      texte: {
        offre: '« Ils ne s’éteignent pas. On les nourrit quand même. C’est la règle. Apporte de l’huile, trois mesures, et je n’aurai pas à en prendre là où on en prend. »',
        accepte: '« Ne me demande pas où on en prend. »',
        attente: '« Les feux ont faim. Ils ne le disent pas. »',
        fin: 'Elle verse l’huile dans le feu le plus proche. La flamme ne bouge pas. « Tu vois ? Ils n’en ont pas besoin. Merci quand même. »',
      } },
  ] },
  'v5:ordonnateur_4': { nom: 'l’Ordonnateur', ou: 'Basse-Fosse', v5: 'ordonnateur_4', quetes: [
    { id: 'q16_v5_ordonnateur_1', title: 'Il manque des os au mur', type: 'apporter', need: { os: 5 },
      reward: { objets: { v5_chapelet_dents: 1 } },
      texte: {
        offre: '« Il manque des os au mur, en bas à gauche. Les longs. Cinq. Je ne demande pas d’où. Ici, on ne demande jamais d’où. »',
        accepte: '« Des os de bête feront l’affaire. Personne ne regarde en bas à gauche. »',
        attente: '« En bas à gauche. Cinq. »',
        fin: 'Il les range un à un, les mesure du pouce, les tourne. « Chacun à sa place. » Il vous donne un chapelet de dents. « Pour compter, si tu en as besoin. »',
      } },
  ] },
};

// ---------------------------------------------------------------- Basse-Fosse : les anonymes (des modèles, tirés par partie)
// les gardiens (quatre : role gardien), les habitants (douze), les enfants (trois) : ids comme dans habitantsV5
// (le rôle et le rang dans la liste : gardien_5 … gardien_8, habitant_9 … habitant_20, enfant_21 … enfant_23).
const Q16_V5_ANONYMES = [];
for (let k = 5; k <= 8; k++) Q16_V5_ANONYMES.push({ id: 'gardien_' + k, role: 'gardien', nom: 'Un gardien' });
for (let k = 9; k <= 20; k++) { const j = k - 9, fem = j % 2 === 1, vieux = j % 5 === 4; Q16_V5_ANONYMES.push({ id: 'habitant_' + k, role: 'habitant', nom: fem ? (vieux ? 'Une vieille d’en bas' : 'Une femme d’en bas') : (vieux ? 'Un vieux d’en bas' : 'Un homme d’en bas') }); }
for (let k = 21; k <= 23; k++) Q16_V5_ANONYMES.push({ id: 'enfant_' + k, role: 'enfant', nom: 'Un enfant' });
// chaque modèle : titre, type, need ou a, reward, textes ; {qui} : le destinataire nommé (parler)
const Q16_V5_MODELES = {
  gardien: [
    { title: 'Ce qui rôde aux Ravines', type: 'apporter', need: { v2_dent_charognard: 2 }, reward: { argent: 40 },
      texte: { offre: '« Il y a des mange-morts aux Ravines. Ils viennent jusqu’à la porte. Rapporte deux de leurs dents, qu’on sache qu’ils ne sont pas invincibles. »', accepte: '« Ne cours pas, là-bas. Eux courent mieux. »', attente: '« Marche. Et rapporte les dents. »', fin: '« Deux. » Il les pend à son cou, à côté des autres. « On dormira mieux à la porte. »' } },
    { title: 'Une lame qui tient', type: 'apporter', need: { lingot_fer: 1 }, reward: { argent: 45 },
      texte: { offre: '« Ma pique se fend. Le fer d’ici est fait de clous de cercueil. Rapporte un lingot de là-haut. »', accepte: '« Un seul. Je ne suis pas gourmand. »', attente: '« Elle se fend. »', fin: '« Du fer qui a vu le jour. » Il le soupèse longtemps. « Tu es compté. Tu le restes. »' } },
    { title: 'Du pain pour la porte', type: 'apporter', need: { pain: 3 }, reward: { argent: 25 },
      texte: { offre: '« À la porte, on a faim. Le pain d’ici est fait de racines. Trois pains d’en haut, pour la garde. »', accepte: '« Marche. Ne cours pas. »', attente: '« On a faim, à la porte. »', fin: '« Du vrai pain. » Il le rompt en quatre, pour les quatre gardiens. « On ne t’a rien demandé. Tu comprends ? »' } },
    { title: 'Le mot de la porte', type: 'parler', a: 'v5:greffier', reward: { argent: 30 },
      texte: { offre: '« Va demander au Greffier le mot de cette nuit. Moi, je ne quitte pas mon poste. »', accepte: '« Ne le dis à personne d’autre. »', attente: '« Le mot ? »', recu: '« Le mot ? » Il ne lève pas les yeux. « Dis-lui : le même qu’hier. C’est toujours le même. Ils le savent. »', fin: '« Le même qu’hier. » Il hoche la tête. « Bien. Rien ne change. C’est ça, garder. »' } },
  ],
  habitant: [
    { title: 'Du pain qui a vu le jour', type: 'apporter', need: { pain: 2 }, reward: { argent: 20 },
      texte: { offre: '« Le pain d’en haut… Je me souviens de l’odeur. Pas du goût. Rapporte-m’en deux. Je veux me souvenir du goût. »', accepte: '« Ne le dis pas aux gardiens. »', attente: '« Je me souviens de l’odeur… »', fin: 'Il mord dedans, s’arrête, pleure sans bruit. « C’était ça. C’était ça. »' } },
    { title: 'Une poignée de sel', type: 'apporter', need: { sel: 2 }, reward: { argent: 20 },
      texte: { offre: '« Tout a le même goût, ici. Le goût de la cave. Du sel. Deux poignées. »', accepte: '« Tu es bon. On dit que ceux d’en haut sont bons. »', attente: '« Le même goût… »', fin: 'Elle en met un grain sur sa langue et ferme les yeux. « La mer. Je ne l’ai jamais vue. C’est la mer. »' } },
    { title: 'Trois pommes', type: 'apporter', need: { pomme: 3 }, reward: { argent: 25 },
      texte: { offre: '« Trois pommes. Une pour moi, une pour ma mère, une pour celui qui était là avant moi. »', accepte: '« Celui d’avant n’en mangera pas. Mais il faut compter. »', attente: '« Trois. Il faut compter. »', fin: 'Il en pose une sur le seuil, une sur la table, et garde la troisième contre sa joue. « Merci. »' } },
    { title: 'Un peu de miel', type: 'apporter', need: { miel: 1 }, reward: { argent: 25 },
      texte: { offre: '« Les abeilles. Tu en as vu ? Rapporte-moi un pot de leur miel. Je le garderai fermé. Je veux savoir qu’il est là. »', accepte: '« Fermé. Je le garderai fermé. »', attente: '« Les abeilles… »', fin: 'Elle cache le pot sous sa paillasse, sans l’ouvrir. « Il est là. C’est tout ce que je voulais. »' } },
    { title: 'Des chandelles', type: 'apporter', need: { bougie: 2 }, reward: { argent: 20 },
      texte: { offre: '« Nos chandelles fument noir. Les tiennes fument blanc, il paraît. Deux. Pour la nuit du compte. »', accepte: '« Blanc. On verra. »', attente: '« Elles fument noir… »', fin: 'Il en allume une au feu du compte. La fumée monte blanche, et tout le monde se tourne vers elle.' } },
    { title: 'Un mot pour la Sonneuse', type: 'parler', a: 'v5:sonneuse_1', reward: { argent: 20 },
      texte: { offre: '« Dis à la Sonneuse que je n’ai pas entendu la cloche, hier. Elle comprendra. Ou bien elle aura peur. »', accepte: '« Ne dis pas mon nom. Je n’en ai plus. »', attente: '« Tu lui as dit ? »', recu: '« Pas entendu ? » Elle se tait longtemps. « Alors c’est qu’il commence à partir. Dis-lui de venir s’asseoir près du temple. »', fin: '« Près du temple. » Il hoche la tête, lentement. « Oui. Bientôt. »' } },
    { title: 'Un jeton pour la Veilleuse', type: 'livrer', objet: 'q16_jeton_cire', a: 'v5:veilleuse_3', reward: { argent: 20 },
      texte: { offre: '« Porte ce jeton à la Veilleuse. Elle saura que c’est moi, et elle gardera ma flamme une nuit de plus. »', accepte: '« Ne le perds pas. Il n’y en a qu’un par personne. »', attente: '« Mon jeton ? »', recu: 'Elle prend le jeton, regarde l’empreinte du pouce. « Une nuit de plus. Dis-le-lui. »', fin: '« Une nuit de plus. » Il respire, enfin. « Merci. »' } },
    { title: 'Des fleurs pour la Nef', type: 'apporter', need: { fleur: 3 }, reward: { argent: 25 },
      texte: { offre: '« Il n’y a pas de fleurs, ici. On en sculpte dans la cire, pour la Nef. Rapporte-m’en des vraies. Trois. »', accepte: '« Elles faneront. Je sais. C’est pour ça. »', attente: '« Trois fleurs… »', fin: 'Elle les pose au pied du mur de la Nef. « Elles faneront. Tout le monde le verra. C’est bien. »' } },
  ],
  enfant: [
    { title: 'Ça sent comment ?', type: 'apporter', need: { fleur: 1 }, reward: { objets: { v5_cerceau: 1 } },
      texte: { offre: '« C’est vrai qu’il y a des fleurs, là-haut ? Ça sent comment ? Rapporte-m’en une. Juste une. »', accepte: '« Tu promets ? »', attente: '« Tu as promis… »', fin: 'Il la sent si fort qu’il éternue, et rit, et se cache la bouche. Il vous donne son cerceau.' } },
    { title: 'Une plume', type: 'apporter', need: { plume: 1 }, reward: { objets: { v5_cloche_muette: 1 } },
      texte: { offre: '« Les oiseaux, ça existe ? Rapporte une plume, pour que je montre aux autres. »', accepte: '« Une grande ! »', attente: '« Une plume… »', fin: 'Elle la fait tourner devant ses yeux. « Ça vole avec ça ? » Elle vous donne une clochette qui ne sonne pas.' } },
    { title: 'Un œuf', type: 'apporter', need: { oeuf: 1 }, reward: { objets: { v5_dents_lait: 1 } },
      texte: { offre: '« Ma grand-mère dit qu’il y a des pierres blanches qui deviennent des oiseaux. Rapporte-m’en une. »', accepte: '« Une pierre-oiseau ! »', attente: '« La pierre-oiseau… »', fin: 'Il la tient contre son oreille, longtemps. « Il dort. » Il vous donne un fil de dents de lait. « C’est ce que j’ai de mieux. »' } },
  ],
};
// le modèle d'un anonyme, pour une graine de partie : toujours le même
function q16Modele(seed, A) {
  const L = Q16_V5_MODELES[A.role] || Q16_V5_MODELES.habitant;
  let h = (seed | 0) ^ 0x51600016;
  for (const c of A.id) h = Math.imul(h ^ c.charCodeAt(0), 0x5bd1e995) >>> 0;
  const rnd = mulberry32(h >>> 0);
  rnd();
  return L[(rnd() * L.length) | 0];
}
