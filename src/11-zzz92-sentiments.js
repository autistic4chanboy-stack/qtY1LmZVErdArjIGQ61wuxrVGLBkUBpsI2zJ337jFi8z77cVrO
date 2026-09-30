// ============================================================================
//  LES SENTIMENTS
//  Huit habitants, adultes et libres, choisis pour leur histoire, peuvent
//  s'attacher au fermier (ou à la fermière) : la boulangère (veuve d'Émile), le
//  forgeron (qui l'aime sans rien dire), la postière, le garde, l'éleveuse
//  (veuve d'Augustin), le pêcheur, la colporteuse et le chasseur.
//  - étapes au-delà de l'amitié : attirance (amitié haute), cour (après un aveu,
//    le sien ou le vôtre), couple (après des rendez-vous), fiançailles (un
//    anneau), mariage (à l'église, le jour dit), et il ou elle vient vivre à la
//    ferme (la petite aussi, si c'est la boulangère) ;
//  - cadeaux qui touchent le cœur, rendez-vous (promenade au lac au coucher du
//    soleil, pique-nique au bord de l'eau, danse à la veillée du Veilledi) ;
//  - répliques propres à chacun et à chaque étape ; jalousie si l'on en courtise
//    deux ; en couple : salut tendre, petits cadeaux, aide à la ferme ; la mort
//    de l'être aimé fait chuter la mentalité. Pudique et sobre.
//  État : farm.s.coeur. API : sentiments (etape(id), c(id), candidat(n),
//         auCachot(jours), visiteCachot(), conjoint())
// ============================================================================
defItem('anneau_fiancailles', 'Anneau de fiançailles', 'outil', 320, ['anneau', '#e8c860'], { desc: 'Un anneau d’or fin. En main, on peut demander la main de quelqu’un. Encore faut-il qu’on vous la donne.' });

// les huit, dans leur voix ({e} : le e de la fermière ; {autre} : l'autre personne courtisée)
const COEUR = {
  boulangere: {
    offre: ['brioche', 'tarte', 'pain'], cadeaux: ['fraise', 'rose', 'fleur', 'confiture', 'bouquet'], rival: 'forgeron',
    attirance: ['Tiens, c’est vous… J’ai de la farine sur le nez, pas vrai ? Ne dites rien. Si, dites quelque chose.', 'Je vous ai gardé la plus belle miche. Enfin, la plus belle… disons celle que j’ai regardée le plus longtemps.', 'Vous savez que vous êtes la seule personne à qui je parle sans penser au four ? C’est bête, ce que je dis. Oubliez.'],
    aveu_oui: 'Oh, mon chou… Doux Jésus. J’ai quarante et un ans, une fille, un four, et un mari que la nuit a gardé. Et vous me dites ça. … Oui. On peut se fréquenter. Doucement, hein. Je ne sais plus comment on fait.',
    aveu_pas: 'Oh… Vous êtes gentil{le}. Mais c’est trop tôt, mon chou. Il y a encore la place d’Émile, dans cette maison. Laissez-moi un peu de temps.',
    aveu_npc: 'Il faut que je vous dise quelque chose, et si je ne le dis pas maintenant, je vais le pétrir jusqu’à demain. Depuis que vous passez, je chante. Faux, mais je chante. Voilà. C’est vous qui me faites chanter.',
    aveu_npc_oui: 'Vraiment ? … Alors ne bougez pas. Laissez-moi vous regarder une minute, sans comptoir entre nous.',
    refus: 'Ah. Bon. Ce n’est rien, mon chou. Une bêtise de boulangère. On oublie, et vous reprenez du pain demain, d’accord ?',
    rdv_oui: { lac: 'Au lac, ce soir ? Doux Jésus, il faudra que je me recoiffe. Oui. Je demanderai à {npc:grainetiere} de garder la petite.', piquenique: 'Un pique-nique ! Ça fait des années. J’apporterai la nappe ; vous, apportez de quoi manger. Et pas mon pain, hein, je le connais par cœur.', danse: 'Danser ? Moi ? Je vous préviens, je marche sur les pieds. … Allez. Tenez-moi bien.' },
    rdv: { lac: ['Le soleil se couche, et moi, je ne suis pas au four. Émile disait que le lac, le soir, c’est de l’or qu’on ne peut pas vendre.', 'Je crois que je vais garder ce soir-là. Comme une miche qu’on ne vend pas.'], piquenique: ['Mangez, mangez ! Vous avez une petite mine, je vous l’ai toujours dit.', 'La petite serait jalouse, si elle savait. La prochaine fois, on l’emmène ?'], danse: ['Un, deux, trois… Doux Jésus, je vous ai encore écrasé le pied !', 'On nous regarde. Tant pis. Qu’ils regardent : ça leur fera une histoire pour l’hiver.'] },
    rdv_manque: 'Je vous ai attendu{e} jusqu’à la nuit, avec mon plus beau châle. Ce n’est rien. J’ai l’habitude d’attendre, vous savez.',
    couple_oui: 'Ensemble ? Vous et moi ? … Oui, mon chou. Oui. Je le dirai à la petite ce soir. Elle va pleurer, ou rire. Sans doute les deux.',
    couple_pas: 'Pas encore, mon chou. Laissez la pâte lever. On ne presse pas ce qui doit monter.',
    tendre: ['Te voilà ! Viens que je t’enlève cette poussière. Là. C’est mieux.', 'Je t’ai gardé une brioche, la plus dorée. Chut.', 'La petite demande quand tu reviens. Moi aussi, un peu.'],
    cadeau_donne: ['Tiens. C’est encore tiède. Ne le mange pas en route.', 'Pour toi. Je l’ai fait en pensant à toi, alors c’est un peu de travers.'],
    main_oui: 'Un anneau… Doux Jésus. J’ai rangé celui d’Émile dans la boîte à sel, le jour où j’ai recommencé à chanter. Il comprendrait. Oui. Oui, je veux bien.',
    main_pas: 'Pas encore… Je t’aime, tu sais. Mais laisse-moi le temps de dire au revoir à quelqu’un.',
    noces: 'Devant tout le monde, et devant Émile qui nous regarde sûrement de quelque part : oui.',
    foyer: ['La ferme sent le pain, maintenant. Tu as remarqué ?', 'La petite a pris le coin près de la cheminée. Elle dit qu’ici, personne ne frappe la nuit.', 'Je me lève encore à trois heures et demie. Toi, dors. Je te laisse le pain sur la table.'],
    jalousie: 'On m’a dit que tu te promènes avec {autre}. On me dit beaucoup de choses, au comptoir. Celle-là, je n’avais pas envie de l’entendre.',
    rupture: 'Alors c’est fini. Bien. Je ferai le pain, comme avant. Le pain, lui, ne s’en va pas.',
    noces_manquees: 'J’ai attendu devant l’autel, avec ma robe du dimanche, jusqu’à ce que le curé me prenne la main. Il avait l’air plus triste que moi. C’est dire.',
    aide: 'Je suis passée à la ferme avant le four. Les semis sont arrosés, et le chien a eu sa croûte. Ne me remercie pas : ça m’a fait plaisir.',
    visite: 'Je t’ai apporté du pain, et du fromage. Mange. On ne pense pas bien le ventre vide, et tu as besoin de penser.',
  },
  forgeron: {
    offre: ['lingot_fer', 'lingot_cuivre', 'lanterne'], cadeaux: ['brioche', 'lingot_acier', 'ragout'],
    attirance: ['Hm. … Vous restez un peu ? Le feu est bon.', 'J’ai redressé votre houe. Elle était tordue. Non, pas besoin de payer.', 'Vous parlez, et j’écoute. D’habitude, je n’écoute pas.'],
    aveu_oui: '… J’ai forgé toute ma vie sans rien dire. Je ne vais pas commencer à faire des phrases. Oui. On peut se voir.',
    aveu_pas: 'Hm. Trop tôt. Le fer, il faut le chauffer longtemps avant de le plier.',
    aveu_npc: 'Je vais dire un truc. Une fois. Ne me faites pas répéter. Je pense à vous quand je bats le fer. Voilà. C’est dit.',
    aveu_npc_oui: '… Bon. Bien. Je… bien.',
    refus: 'Hm. Compris. On n’en parle plus.',
    rdv_oui: { lac: 'Ce soir. Le lac. J’y serai.', piquenique: 'Un pique-nique. Hm. J’apporterai du pain. Pas de chez elle. … Si, de chez elle. C’est le meilleur.', danse: 'Je ne danse pas. … Une fois. Pour vous.' },
    rdv: { lac: ['Le soleil dans l’eau. Comme une barre qui sort de la forge.', 'Je n’ai jamais regardé un coucher de soleil jusqu’au bout. C’est long. C’est bien.'], piquenique: ['Bon. Le pain.', 'On pourrait rester là. Un moment. Sans rien faire.'], danse: ['Je compte. Un, deux, trois. Ne me parlez pas, je compte.', '… Je ne vous ai pas marché dessus. Pas encore.'] },
    rdv_manque: 'Je vous ai attendu{e}. Longtemps. J’ai compté les vagues. Il y en a beaucoup.',
    couple_oui: 'Oui. Hm. Oui.',
    couple_pas: 'Pas encore. Chauffe encore un peu.',
    tendre: ['Te voilà. Bien.', 'J’ai pensé à toi. Deux fois. Trois.', 'Viens t’asseoir. Le feu est bon.'],
    cadeau_donne: ['Tiens. J’ai fait ça le soir. C’est rien.', 'Pour toi. Ça servira. Ça sert toujours.'],
    main_oui: 'Un anneau. Moi, j’en forge. Personne ne m’en avait jamais offert. … Oui. Je le porterai. Même à la forge.',
    main_pas: 'Pas encore. Pas tout de suite.',
    noces: 'Oui. … C’est tout. Oui.',
    foyer: ['J’ai huilé les gonds de la porte. Elle ne grincera plus.', 'Je rentre tard, les jours de fer. Garde-moi une assiette.', 'La ferme est solide. Je vérifie quand même. Tous les soirs.'],
    jalousie: 'On dit que tu vois {autre}. Hm. Je ne suis pas homme à partager. Ni le feu, ni le reste.',
    rupture: 'Bon. J’ai l’habitude de me taire. Je me tairai.',
    noces_manquees: 'L’église était pleine. Pas de vous. Je suis resté debout jusqu’au bout. Je suis doué pour ça.',
    aide: 'Passé à la ferme à l’aube. Réparé la barrière. Arrosé. Le chien m’a suivi jusqu’au portail.',
    visite: 'Tiens. Du pain. Mange-le doucement : le milieu est dur. … Tu comprendras.',
    rival_dit: 'Elle chante, le matin, maintenant. On l’entend de la forge. … C’est bien. Prenez soin d’elle. Sinon, vous aurez affaire à moi.',
  },
  postiere: {
    offre: ['plume', 'bougie', 'brioche'], cadeaux: ['fleur', 'bouquet', 'rose', 'brioche', 'plume'],
    attirance: ['Il n’y a rien pour vous, aujourd’hui. Je le sais : j’ai vérifié trois fois. Pour rien. Enfin, pour vous.', 'Je vous ai vu{e} passer, ce matin. Je n’espionne pas ! Je regarde le courrier. Par la fenêtre.', 'Vous savez que vous avez une page à votre nom, dans mon carnet des bonnes nouvelles ? Non, je ne vous la montrerai pas.'],
    aveu_oui: 'Vous… Attendez. Je vais noter la date. Non, je plaisante. Si, je vais la noter. Oui ! Oui, on peut se voir. Mon oncle va en faire une attaque.',
    aveu_pas: 'Oh. C’est… Je ne suis pas sûre. Laissez-moi y penser. Je pense vite, d’habitude. Là, non.',
    aveu_npc: 'Je dois vous avouer quelque chose. Je vous ai écrit une lettre. Trois, en fait. Je ne les ai jamais envoyées : je savais ce qu’il y avait dedans. Elles disent que je vous aime bien. Plus que bien.',
    aveu_npc_oui: 'Oh ! Alors je peux les jeter ? Non. Je les garde. On ne jette pas une bonne nouvelle.',
    refus: 'Bien. Retour à l’envoyeur. Ce n’est pas grave. J’ai l’habitude des lettres qui reviennent.',
    rdv_oui: { lac: 'Le lac, ce soir ? Je ferai la tournée en courant. Je cours très bien.', piquenique: 'Un pique-nique ! J’apporte la limonade. Et mon carnet. Pour rien. Au cas où.', danse: 'Danser ! Enfin quelqu’un qui me le demande avant mon oncle. Vite, avant qu’il arrive.' },
    rdv: { lac: ['Mon père disait que le soleil se couche pour tout le monde, sauf pour les postiers : ils sont encore sur la route.', 'Aujourd’hui, je ne suis sur aucune route. C’est ça, une bonne nouvelle.'], piquenique: ['Il y a une fourmi sur votre pain. Elle doit être de la poste : elle est pressée.', 'Je pourrais rester là jusqu’à la dernière levée. Et même après.'], danse: ['Tout le monde nous regarde ! Demain, tout le village le saura. Et pour une fois, ce ne sera pas moi qui l’aurai dit !', 'Vous dansez comme on distribue le courrier : un peu en retard, mais au bon endroit.'] },
    rdv_manque: 'Vous n’êtes pas venu{e}. J’ai attendu, et puis j’ai fait comme avec les lettres sans adresse : je suis rentrée, et je n’ai rien dit.',
    couple_oui: 'Ensemble ! Je le note. Souligné deux fois. Non : trois.',
    couple_pas: 'Pas encore… Je veux être sûre. Les nouvelles, je les vérifie toujours avant de les annoncer.',
    tendre: ['Toi ! Il y avait une lettre pour toi. Non, je mens. Je voulais juste te voir.', 'J’ai fini la tournée plus tôt. Devine pourquoi.', 'Mon oncle demande qui me fait sourire au guichet. Je n’ai rien dit. Il a deviné.'],
    cadeau_donne: ['Tiens. Pour toi. Ne me demande pas pourquoi : je n’ai pas de raison.', 'Pour toi. Je l’avais gardé de côté, comme les plus jolis timbres.'],
    main_oui: 'Oui ! Oh, oui. Il faut que je l’écrive à quelqu’un. À toi. Je vais t’écrire que j’ai dit oui.',
    main_pas: 'Pas encore… Pardon. Je tremble comme une feuille de route.',
    noces: 'Oui. Et cette fois, c’est moi qui annonce la nouvelle.',
    foyer: ['Ta boîte aux lettres était pleine de toiles d’araignée. Maintenant, elle a du courrier : le mien.', 'Je suis rentrée par le chemin du puits. Pardon. Je sais, je sais.', 'Ton courrier est trié, classé, rangé. Je ne l’ai pas lu. Pas beaucoup.'],
    jalousie: 'On m’a dit que tu te promènes avec {autre}. Les nouvelles vont vite. Celle-là, j’aurais préféré la perdre en chemin.',
    rupture: 'Bien. Je range tout. Les lettres, le carnet. Je sais ranger. C’est mon métier.',
    noces_manquees: 'J’ai attendu devant l’autel. Toute la ville était là. Demain, tout le monde le saura. Et cette fois, je n’aurai rien à ajouter.',
    aide: 'Je suis passée à la ferme en faisant ma tournée. J’ai arrosé ce qui avait soif, et j’ai donné au chien ce qui restait de ma brioche. Ne le gronde pas : c’est moi qui ai commencé.',
    visite: 'Je t’ai apporté une lettre. De moi. Lis-la ce soir. Elle dit de tenir bon, avec plus de mots.',
  },
  garde: {
    offre: ['lanterne', 'ragout', 'pain'], cadeaux: ['ragout', 'soupe', 'viande_grillee'],
    attirance: ['Garde-à-vous ! … Non, repos. Pardon. C’est vous. Ça me fait toujours ça, quand c’est vous.', 'J’ai retardé le pont de deux minutes, hier soir. Hors règlement. Au cas où vous seriez en route.', 'La nuit me fait moins peur, depuis quelque temps. Je ne sais pas pourquoi. Enfin, si. Un peu.'],
    aveu_oui: 'Moi ? Vous… moi ? Article premier : ne pas s’évanouir en service. … Oui. Oui, je veux bien. Même si je ne vous vois qu’à la lueur d’une lampe.',
    aveu_pas: 'Je… Il faut que je réfléchisse. Réglementairement. Et autrement aussi.',
    aveu_npc: 'Je vais faire mon rapport. À vous. Depuis que vous êtes arrivé{e}, je guette le chemin de la ferme. Je guette le pont. Je vous guette, voilà. Fin du rapport.',
    aveu_npc_oui: 'Vraiment ? … Il faut que je m’assoie. Ce n’est pas réglementaire, de s’asseoir. Je m’assois quand même.',
    refus: 'Compris. Rompez. Enfin… je veux dire : bien. Bonne journée.',
    rdv_oui: { lac: 'Au lac ? Avant la levée des ponts, alors. Je ferai vite. Je courrai. Je cours bien, quand j’ai peur.', piquenique: 'Un pique-nique ! J’apporte le ragoût. Celui de l’auberge. Le mien, il vaut mieux pas.', danse: 'Danser ? En uniforme ? Le règlement ne l’interdit pas. Je l’ai relu douze fois.' },
    rdv: { lac: ['Le soleil se couche. D’habitude, c’est l’heure où je commence à avoir peur. Là, non.', 'Si vous restez à côté de moi, je crois que je pourrais regarder la nuit arriver jusqu’au bout.'], piquenique: ['C’est la première fois que je mange assis depuis des mois. En service, on mange debout.', 'Si le maire passe, vous direz que je surveille le pré. Je surveille : vous.'], danse: ['Un pas à gauche, un pas à droite… On m’a appris à marcher au pas, pas à danser.', 'Hortense disait que je ne la verrais qu’à la lueur d’une lampe. Il y a des lampes, ce soir. Et je vous vois très bien.'] },
    rdv_manque: 'Je suis resté au lac jusqu’à la levée des ponts. J’ai failli rester dehors toute la nuit. Pour rien.',
    couple_oui: 'Oui ! Enfin… affirmatif. Oui. Je vais l’écrire au registre. Non, je ne vais pas l’écrire au registre.',
    couple_pas: 'Pas encore. Je voudrais être sûr de ne pas avoir peur. De ça aussi.',
    tendre: ['Te voilà ! Tout est en ordre, maintenant.', 'J’ai rêvé de toi. Un rêve calme. C’est rare, chez moi.', 'Rentre avant la nuit. … Ou reste avec moi, à la guérite. Ça me ferait moins peur.'],
    cadeau_donne: ['Tiens. C’est pour toi. Ne dis pas non : ce n’est pas réglementaire, de dire non.', 'Pour toi. J’en avais deux. Le deuxième, c’était pour toi depuis le début.'],
    main_oui: 'Oui ! Oh… oui. Il y aura des bans, à la porte de la mairie. Et cette fois, personne ne les décrochera.',
    main_pas: 'Pas encore… J’ai déjà vu des bans décrochés. Je ne veux pas revivre ça.',
    noces: 'Oui. De jour comme de nuit. Surtout de nuit.',
    foyer: ['J’ai fait une ronde autour de la ferme. Tout est en ordre. Je t’aime. Tout est en ordre.', 'Et si on prenait un chien ? Un gros. On l’appellerait Courage.', 'Je dors mieux, ici. Je n’ai plus besoin de laisser la lampe allumée.'],
    jalousie: 'On m’a fait un rapport. Toi, avec {autre}. Je n’ai pas voulu le croire. Je l’ai relu douze fois.',
    rupture: 'Bien. Je retourne à ma guérite. On y est seul, mais au moins, on sait pourquoi.',
    noces_manquees: 'Les bans étaient affichés. Je les décrocherai moi-même. J’ai l’habitude.',
    aide: 'Rapport : passé à la ferme au petit jour. Semis arrosés. Chien nourri. Aucune anomalie. Tu me manques. (Ce dernier point est hors rapport.)',
    visite: 'Je n’ai pas le droit d’être ici. Je suis là quand même. Mange. Et ne fais pas de bêtise : c’est moi qui monte la garde, cette nuit.',
  },
  eleveuse: {
    offre: ['lait', 'fromage', 'oeuf'], cadeaux: ['miel', 'pomme', 'carotte', 'bouquet'], rival: 'pecheur',
    attirance: ['Tempête vous a encore laissé{e} approcher. Elle ne le fait pour personne. Moi non plus, d’ailleurs.', 'Je me suis surprise à guetter votre chemin. Comme une gamine. Ne riez pas.', 'Vous restez dîner ? Non, oubliez. Si, restez.'],
    aveu_oui: 'Ha ! Il vous en a fallu, du temps. Moi aussi, remarquez. Oui. On se voit. Mais je vous préviens : chez moi, on se lève à quatre heures.',
    aveu_pas: 'Pas si vite. Une bête qu’on brusque, elle rue. Une femme de ranch aussi.',
    aveu_npc: 'Bon. Je vais être directe, c’est comme ça que je suis faite. Vous me plaisez. Depuis un moment. Voilà. Maintenant, dites quelque chose, avant que je retourne à mes bêtes.',
    aveu_npc_oui: 'Bien. Très bien. … Je ne sais plus quoi faire de mes mains. Ça ne m’était pas arrivé depuis Augustin.',
    refus: 'Compris. Pas de rancune. Les bêtes, elles, ne me font jamais ce coup-là.',
    rdv_oui: { lac: 'Au lac, ce soir ? Je mettrai une robe. Une fois. Pour voir.', piquenique: 'Un pique-nique ? J’apporte le lait, le fromage, et Tempête, si elle veut bien suivre.', danse: 'Danser ! Je danse comme je travaille : fort. Vous êtes prévenu{e}.' },
    rdv: { lac: ['Augustin aimait le lac, le soir. Je n’y étais pas revenue depuis. Ça va. Avec vous, ça va.', 'Regardez les chevaux, là-bas, sur la rive d’en face. Ils regardent le soleil, eux aussi.'], piquenique: ['Le fromage est de ce matin. Le lait aussi. Moi, je suis de quatre heures, alors ne comptez pas sur moi pour la sieste.', 'On est bien, là. Rien à nourrir, rien à rentrer. Juste rester.'], danse: ['Tenez-moi plus fort. Je ne suis pas en sucre.', 'On nous regarde. Qu’ils regardent : une veuve qui danse, ça ne s’est pas vu depuis longtemps, ici.'] },
    rdv_manque: 'Je vous ai attendu{e} au bord de l’eau. J’avais mis une robe. Je ne la remettrai pas de sitôt.',
    couple_oui: 'Oui. Ça tombe bien : je n’avais pas envie de dire non.',
    couple_pas: 'Pas encore. J’ai besoin d’être sûre. Je n’ai pas envie de pleurer encore neuf jours.',
    tendre: ['Te voilà ! Viens, Tempête t’attend. Moi aussi, un peu.', 'Tu as de la paille dans les cheveux. Laisse. Ça te va bien.', 'J’ai reçu une lettre parfumée, ce matin. Ce n’était pas de toi, hein ? Dommage.'],
    cadeau_donne: ['Tiens. De ce matin. Mange, tu es trop maigre.', 'Pour toi. De la maison. Ne fais pas de manières.'],
    main_oui: 'Augustin m’avait offert une pouliche, avec un ruban rouge. J’avais dit oui à la pouliche, et il était venu avec. Toi, un anneau… Oui. Je dis oui à l’anneau, et à toi avec.',
    main_pas: 'Pas encore. Laisse-moi finir de dormir de son côté du lit.',
    noces: 'Oui. Et que ça dure plus de neuf jours.',
    foyer: ['J’ai amené Colombe à la ferme. Elle s’y plaît. Moi aussi.', 'Levée à quatre heures. Les bêtes sont nourries, le lait est tiré. Tu peux dormir, toi.', 'Tu ronfles. Un peu. Comme un poulain. J’aime bien.'],
    jalousie: 'On me dit que tu fréquentes {autre}. Je suis directe, alors je te le dis en face : je n’aime pas ça. Pas du tout.',
    rupture: 'Bon. Au moins, c’est clair. Retourne à tes affaires, je retourne à mes bêtes.',
    noces_manquees: 'J’avais remis la robe. Toute la matinée. Personne. Je l’ai donnée à la grainetière pour ses torchons.',
    aide: 'Passée à la ferme avant la traite. Tes bêtes ont mangé, ton potager a bu, ton chien m’a fait la fête. Tu devrais le nourrir plus.',
    visite: 'Du lait, du fromage, et des nouvelles : tes bêtes vont bien, je m’en occupe. Toi, tiens bon. Ce n’est pas une cage qui va te faire plier.',
  },
  pecheur: {
    offre: ['truite', 'perche', 'poisson_fume'], cadeaux: ['pomme', 'soupe', 'pain'],
    attirance: ['Hé. Asseyez-vous. Le ponton est plus doux quand vous êtes là.', 'Je vous ai gardé une place. Ça ne se fait pas, sur un ponton. Je l’ai fait quand même.', 'Vous regardez l’eau comme Jules. Non. Comme personne d’autre.'],
    aveu_oui: 'Hé… À mon âge. Le lac va rire de moi. Qu’il rie. Oui. On peut se voir. Doucement : je suis vieux, et je suis lent.',
    aveu_pas: 'Pas encore. Le poisson qu’on ferre trop tôt, on le perd.',
    aveu_npc: 'Je vais vous dire une chose, et après, je me tairai jusqu’à l’hiver. Je vous attends, maintenant. Sur le ponton. Tous les jours. Je ne pêche plus : j’attends.',
    aveu_npc_oui: 'Hé. Alors… alors le lac a bien fait de vous amener.',
    refus: 'Hé. Bon. Le lac donne, le lac prend. On a l’habitude.',
    rdv_oui: { lac: 'Au lac ? J’y suis toujours. Mais ce soir, je n’apporterai pas la canne.', piquenique: 'Un pique-nique. J’apporterai une truite. Grillée. Pas crue : je ne suis pas un sauvage.', danse: 'Danser ? J’ai les jambes d’un héron. Mais un héron, ça danse, au printemps.' },
    rdv: { lac: ['Le soleil se couche. Jules disait que c’est le seul moment où le lac se tait.', 'Hé. Écoutez. Rien. C’est ça que je voulais vous faire entendre.'], piquenique: ['Mangez la truite par le dos. Les arêtes, c’est pour les impatients.', 'Ça faisait dix ans que je n’avais pas mangé avec quelqu’un. Ça a meilleur goût.'], danse: ['Hé. Je n’ai pas dansé depuis la noce de mon frère. Il dansait mieux que moi.', 'Ne me lâchez pas. Si je tombe, je coule.'] },
    rdv_manque: 'Je vous ai attendu{e} au bord du lac. Le soleil est venu, lui.',
    couple_oui: 'Hé. Oui. Ça me fait comme une touche au bout de la ligne. Une grosse.',
    couple_pas: 'Pas encore. Laissez-moi m’y faire.',
    tendre: ['Hé. Te voilà. Le lac est plus beau.', 'Je t’ai gardé la plus belle perche. Ne la vends pas.', 'Viens t’asseoir. On ne parlera pas. C’est ça, le meilleur.'],
    cadeau_donne: ['Tiens. Pris ce matin, en pensant à toi.','Pour toi. Ça tiendra l’hiver. Comme nous.'],
    main_oui: 'Un anneau… Hé. Je le porterai à la main qui tient la canne. Comme ça, le lac saura. Oui.',
    main_pas: 'Pas encore. Je veux que Jules le sache d’abord. Je lui parlerai, dimanche, au bout du ponton.',
    noces: 'Oui. Et que le lac nous laisse tranquilles.',
    foyer: ['Je pose encore le bol de lait, le dimanche. Au bout du chemin, maintenant. On ne sait jamais.', 'J’ai pris une carpe, ce matin. Elle est dans le seau. Pour ce soir.', 'La ferme est loin de l’eau. Mais tu es là. Alors ça va.'],
    jalousie: 'Hé. On dit que tu vois {autre}. Le lac m’a appris à attendre. Pas à partager.',
    rupture: 'Hé. Bon. Je retourne à mes lignes. Elles, au moins, reviennent toujours.',
    noces_manquees: 'J’ai attendu devant l’autel. Comme au bout du ponton. On finit toujours par rentrer seul.',
    aide: 'Passé à ta ferme au petit jour, avant l’eau. Arrosé tes semis. Ton chien a eu une tête de carpe. Il a aimé.',
    visite: 'Hé. Du poisson fumé et du pain. Ça tient au corps. Tiens bon. L’eau finit toujours par redescendre.',
    rival_dit: 'Les lettres parfumées… c’était moi. Deux ans. Sans signer. Je n’ai jamais eu le courage de signer. Vous, vous l’avez eu. Soyez bon{ne} avec elle.',
  },
  colporteuse: {
    offre: ['toile', 'huile', 'bandage'], cadeaux: ['perle', 'poisson_source', 'miel', 'fleur', 'confiture', 'bouquet'],
    attirance: ['Vous encore ! Vous finirez par croire que je fais exprès de passer par ici. Vous auriez raison.', 'Je vous ai gardé la plus belle toile. Encore. Il va falloir que j’arrête, je vais me ruiner.', 'Sur les routes, on ne s’attache pas. C’est la règle. Je n’ai jamais été très douée pour les règles.'],
    aveu_oui: 'Moi qui ai franchi le col des Treize à dix-sept ans pour ne dépendre de personne… Oui. Oui, on se voit. Je suis franche : ça me fait peur, et j’en ai envie.',
    aveu_pas: 'Pas encore. Une femme des routes, ça ne s’arrête pas au premier sourire. Au deuxième, peut-être.',
    aveu_npc: 'Je vais être franche, c’est mon défaut. Je fais des détours pour passer devant chez vous. Des lieues de détours. Ma mule serait morte deux fois.',
    aveu_npc_oui: 'Alors je peux arrêter les détours ? Non. Je vais les faire quand même. Ils sont devenus mon chemin.',
    refus: 'Bon. La route est longue, et elle ne me demande rien, elle. À bientôt, quand même.',
    rdv_oui: { lac: 'Au lac, ce soir ? Je déballerai mon plus beau châle. Il n’est pas à vendre.', piquenique: 'Un pique-nique ! J’ai du sel, des épices, et une nappe de l’autre côté des Monts.', danse: 'Danser ! Dans les auberges du col, on danse jusqu’à l’aube. Suivez-moi, si vous pouvez.' },
    rdv: { lac: ['De l’autre côté des Monts, le soleil se couche plus tôt. Ici, il prend son temps. Moi aussi, ce soir.', 'Ma sœur dit que je finirai sur une route, seule. Elle se trompe peut-être.'], piquenique: ['Goûtez ce sel. Il vient de la mer. Personne ici n’a vu la mer. Moi si.', 'On devrait faire ça sur toutes les routes. S’arrêter. Manger. Regarder quelqu’un.'], danse: ['Plus vite ! Au col, on danse comme on se réchauffe.', 'Vous avez marché sur mon châle. Ce n’est rien. Je vous le vends quand même.'] },
    rdv_manque: 'Je vous ai attendu{e}. J’ai déballé mon châle pour rien. Je l’ai remballé. Je sais remballer.',
    couple_oui: 'Ensemble ! Moi. Ma sœur ne va jamais me croire. Je lui écrirai en lettres capitales.',
    couple_pas: 'Pas encore. Laissez-moi finir ma tournée. Elle est longue, ma tournée.',
    tendre: ['Toi ! J’ai fait trois lieues de détour. Ne dis rien.', 'Je t’ai gardé une chose de l’autre côté des Monts. Devine quoi. Non : moi.', 'Tu as l’air fatigué. Assieds-toi sur mon ballot. Il est doux, pour un ballot.'],
    cadeau_donne: ['Tiens. De mes ballots. Ne dis rien, c’est offert.','Pour toi. Ça vient de l’autre côté des Monts. Ça sent le soleil.'],
    main_oui: 'Un anneau ! Je n’en ai jamais vendu d’aussi beau. Celui-là, je ne le vendrai pas. Oui. Je pose mes ballots. Chez toi.',
    main_pas: 'Pas encore… Donne-moi le temps de faire mes adieux à la route.',
    noces: 'Oui. J’ai assez marché. Maintenant, je reste.',
    foyer: ['J’ai rangé mes ballots au grenier. Ils sentent encore le col.', 'Je vends toujours au marché. Mais le soir, je rentre. Rentrer : je ne connaissais pas ce mot.', 'Ma sœur m’a écrit. Elle dit que je suis folle. Elle dit aussi qu’elle viendra voir la ferme.'],
    jalousie: 'On parle, sur les routes. On m’a dit, pour toi et {autre}. Je suis franche : ça me fait mal. Voilà.',
    rupture: 'Bon. Je reprends la route. Elle, elle ne ment jamais.',
    noces_manquees: 'J’ai attendu à l’église. Et puis j’ai repris la route. Je sais faire ça, au moins.',
    aide: 'Passée à ta ferme ce matin, entre deux villages. Arrosé, nourri, balayé. Tu as un chien qui aime les colporteurs : c’est rare.',
    visite: 'Je t’ai apporté du pain, et du tabac à troquer avec le geôlier. Sur les routes, on apprend : en prison, tout s’échange.',
  },
  chasseur: {
    offre: ['viande_fumee', 'fourrure', 'cuir'], cadeaux: ['griffe_ours', 'bois_de_cerf', 'viande_grillee', 'cidre'],
    attirance: ['Vous. … Bon. Restez. Le gibier attendra.', 'J’ai relevé vos traces, ce matin. Je ne vous suivais pas. Enfin… si.', 'Vous marchez moins fort, dans les bois. Vous apprenez. J’aime bien.'],
    aveu_oui: '… Je suis un homme des bois. Je ne sais pas dire. Mais je sais attendre à l’affût. Oui. On se voit.',
    aveu_pas: 'Pas encore. On ne tire pas sur ce qu’on n’a pas bien vu.',
    aveu_npc: 'Je vais dire une chose. Depuis dix ans, je ne pense qu’à un garçon dans les fougères. Depuis quelque temps, je pense à vous. C’est mieux. C’est tout.',
    aveu_npc_oui: '… Bien. Alors restez dans mon champ de vision. Toujours.',
    refus: 'Bon. Compris. Les bêtes, elles, ne mentent pas.',
    rdv_oui: { lac: 'Au lac, ce soir. Sans fusil. Je vous le promets.', piquenique: 'Un pique-nique. J’apporte la viande. Grillée.', danse: 'Danser. … Je vais le regretter. Allons-y.' },
    rdv: { lac: ['Le soir, les bêtes viennent boire. Regardez, là-bas. Un chevreuil. Je ne tirerai pas.', 'Je n’avais jamais regardé le soleil se coucher sans guetter quelque chose. C’est reposant.'], piquenique: ['Mangez. Le grand air donne faim, même à ceux qui ne chassent pas.', 'On entend tout, ici. Les merles, le vent. Vous qui respirez.'], danse: ['Je danse comme je marche en forêt : sans bruit. Et sans grâce.', 'Tout le monde me regarde. D’habitude, on m’évite. C’est mieux, ça.'] },
    rdv_manque: 'Je vous ai attendu{e}. À l’affût. Je sais attendre. Mais pas pour rien.',
    couple_oui: 'Oui. … Oui.',
    couple_pas: 'Pas encore. Laissez la bête sortir du bois.',
    tendre: ['Te voilà. Je t’ai entendu{e} arriver. Je t’entends toujours.', 'J’ai vu un ours près du ruisseau. Fais attention. Pour moi.', 'Reste un peu. Le gibier attendra.'],
    cadeau_donne: ['Tiens. Pour l’hiver.', 'Pour toi. Ça te tiendra au corps.'],
    main_oui: 'Un anneau. … Je ne tirerai plus jamais sans regarder deux fois. Promis. Oui.',
    main_pas: 'Pas encore. Je dois encore faire la paix avec un garçon dans les fougères.',
    noces: 'Oui. Et que Dieu me pardonne le reste.',
    foyer: ['J’ai posé des collets autour de la ferme. Pour les renards. Pas pour les gens.', 'Je rentre avant la nuit, maintenant. Pour toi.', 'Ta ferme a de bons bois derrière. Et toi devant. Je suis bien.'],
    jalousie: 'Tu vois {autre}. Je t’ai vu{e}. Je vois tout, dans les bois. Je n’aime pas ce que j’ai vu.',
    rupture: 'Bon. Je retourne au relais. Seul. Comme avant.',
    noces_manquees: 'J’ai attendu à l’église, en habit. Je ne mets jamais d’habit. Je ne le remettrai pas.',
    aide: 'Passé à ta ferme à l’aube. Arrosé. Nourri les bêtes. Ton chien m’a suivi jusqu’à la lisière. Bon chien.',
    visite: 'Viande fumée. Du pain. Mange. Et ne pense pas à t’enfuir : je te trouverais. Tout le monde te trouverait.',
  },
};
const COEUR_ROMANTIQUE = ['bouquet', 'fleur', 'rose', 'tulipe', 'dahlia', 'lavande', 'bijou', 'perle', 'orchidee', 'edelweiss', 'lys_cimes', 'muguet', 'gateau', 'anneau_fiancailles'];
const COEUR_PENSEES = {
  lac: ['(Vous n’avez pas envie que ça finisse.)', '(Vous ne dites rien. Il n’y a rien à dire.)'],
  piquenique: ['(Pour une fois, la vallée se tient tranquille.)', '(Vous riez. Vous aviez oublié le bruit que ça fait.)'],
  danse: ['(Le temps d’une chanson, il n’y a plus de nuit dehors.)', '(Vous comptez les pas, et puis vous oubliez de compter.)'],
};
const COEUR_OFFICIANTS = {
  cure: ['Mes enfants. Nous voici réunis, devant Dieu et devant cette vallée qui en a vu d’autres, pour unir {a} et {b}.', 'Les anneaux, je vous prie. Et que vos mains ne tremblent pas : ce n’est que de l’or.', 'Je vous déclare unis. Allez. Aimez-vous. Et fermez bien vos portes, la nuit.'],
  maire: ['Au nom de la loi, et puisque notre curé n’est plus là pour le faire, je vais vous marier moi-même. {a}, {b}, approchez.', 'Les consentements, je vous prie. Clairs et nets : c’est pour le registre.', 'Au nom de la loi, vous êtes unis. Signez là. Et là. Voilà : la vallée compte un foyer de plus.'],
};
const COEUR_ETAPES = { 1: 'attirance', 2: 'cour', 3: 'couple', 4: 'fiançailles', 5: 'mariage' };
const COEUR_HOME0 = {};
for (const d of NPC_DATA) COEUR_HOME0[d.id] = d.home;

const sentiments = {
  t: 0, pts: {}, hooked: false,
  S() {
    const s = farm.s;
    if (!s) return null;
    const S = s.coeur || (s.coeur = {});
    if (!S.c) Object.assign(S, { v: 1, c: {}, rdv: null, noces: null, foyer: null, fillette: false, lit2: false, deuils: [], rival: {} });
    if (!S.rival) S.rival = {};
    if (!S.deuils) S.deuils = [];
    return S;
  },
  c(id) {
    const S = this.S();
    return S.c[id] || (S.c[id] = { e: 0, p: 0, rdv: 0, depuis: farm.s.day, refus: 0, parleJ: 0, cadeauJ: 0, manques: 0, bague: false, jaloux: null });
  },
  etape(id) { const S = this.S(); return S && S.c[id] ? S.c[id].e : 0; },
  candidat(n) { return !!(n && COEUR[n.d.id] && n.st && n.st.alive && (n.d.age || 30) >= 18); },
  conjoint() { const S = this.S(); return S && S.foyer && npcs.alive(S.foyer) ? npcs.byId[S.foyer] : null; },
  D(n) { return COEUR[n.d.id]; },
  fmt(t, n, extra) {
    let s = String(t || '');
    const fem = !!(farm.s && farm.s.fem);
    s = s.replace(/\{e\}/g, fem ? 'e' : '').replace(/\{le\}/g, fem ? 'le' : '').replace(/\{ne\}/g, fem ? 'ne' : '');
    if (extra) for (const k in extra) s = s.split('{' + k + '}').join(extra[k]);
    return fmtLine(s, n);
  },
  crimes(n) { return typeof societe !== 'undefined' && societe.crimesSus ? societe.crimesSus(n) : []; },
  // ------------------------------------------------------------------ étapes
  majEtape(n) {
    const c = this.c(n.id), S = this.S(), s = farm.s;
    if (c.e === 0 && npcs.level(n) >= 6 && !(c.refus && s.day - c.refus < 12) && !(S.foyer && S.foyer !== n.id) && !this.crimes(n).length) {
      c.e = 1; c.depuis = s.day; c.p = Math.max(c.p, 40); c.nouveau = true;
    }
  },
  passer(n, e) {
    const c = this.c(n.id), s = farm.s;
    c.e = e; c.depuis = s.day;
    if (e === 2) this.nouvelleCour(n);
  },
  // quand une cour commence : les autres finiront par l'apprendre ; le rival, lui, le sait tout de suite
  nouvelleCour(n) {
    const S = this.S(), s = farm.s, vd = (id) => (typeof societe !== 'undefined' ? societe.villageDe(id) : null);
    for (const id in S.c) {
      if (id === n.id) continue;
      const c = S.c[id];
      if (c.e >= 2 && npcs.alive(id) && !c.jaloux) c.jaloux = { de: n.id, jour: s.day + (vd(id) && vd(id) === vd(n.id) ? 0 : 1) };
    }
    const r = COEUR[n.d.id].rival;
    if (r && npcs.alive(r) && !S.rival[r]) S.rival[r] = n.id;
  },
  rompre(n, silencieux) {
    const c = this.c(n.id), S = this.S(), s = farm.s;
    c.e = 0; c.p = 0; c.refus = s.day; c.jaloux = null; c.rdv = 0;
    npcs.addAmitie(n, -150); n.st.anger = Math.max(n.st.anger || 0, 3);
    if (S.rdv && S.rdv.id === n.id) S.rdv = null;
    if (S.noces && S.noces.id === n.id) S.noces = null;
    if (S.foyer === n.id) { S.foyer = null; S.fillette = false; this.appliquerFoyer(); npcs.snap(game.world); }
    if (!silencieux && typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-4, 'rupture', 6);
  },
  // ------------------------------------------------------------------ à l'ouverture du dialogue
  ouvrir(n, v, special) {
    const c = this.c(n.id), D = this.D(n), s = farm.s, S = this.S();
    const K = this.crimes(n);
    if (c.e >= 2 && K.some((C) => C.type === 'meurtre')) { this.rompre(n, true); setTimeout(() => ui.subtitle('', '(Dans ses yeux, il n’y a plus que de la peur.)', 4), 2500); return null; }
    if (c.e >= 2 && K.length) { c.crimesVus = c.crimesVus || {}; for (const C of K) if (!c.crimesVus[C.id]) { c.crimesVus[C.id] = 1; c.p -= 80; } return null; }
    if (special) return null;
    this.majEtape(n);
    if (c.e < 1) return this.rivalDit(n, v); // le rival : il sait, et il le dit une fois
    if (c.parleJ !== s.day) { c.parleJ = s.day; c.p += 15; }
    const set = (t) => { v.text = this.fmt(t, n); n.speakT = Math.min(6, 1 + v.text.length * 0.04); };
    // la jalousie
    if (c.jaloux && c.jaloux.jour <= s.day) {
      const J = c.jaloux, autre = npcs.byId[J.de];
      c.jaloux = null;
      if (autre && this.etape(J.de) >= 2) {
        set(this.fmt(D.jalousie, n, { autre: autre.name }));
        if (c.e >= 3) { this.rompre(n); v.options = [{ label: 'Partir', act: 'bye' }]; }
        else { c.p -= 150; if (c.p < 0) { c.p = 0; c.e = 1; } }
        return null;
      }
    }
    if (c.manqueJ) { const k = c.manqueJ; c.manqueJ = 0; set(k === 'noces' ? D.noces_manquees : D.rdv_manque); return null; }
    if (c.nouveau) { c.nouveau = false; set(pick(D.attirance)); return null; }
    // l'aveu, de sa part
    if (c.e === 1 && npcs.level(n) >= 8 && c.p >= 220 && !c.aveuNpc && Math.random() < 0.45) {
      c.aveuNpc = s.day;
      return talk.view(this.fmt(D.aveu_npc, n), [{ label: '(Vous aussi.)', act: 'k:oui' }, { label: '(Vous ne pouvez pas.)', act: 'k:non' }]);
    }
    if (c.e >= 3) {
      // un petit cadeau, de temps en temps
      if (s.day - (c.cadeauJ || 0) >= 3 && Math.random() < 0.5) {
        const id = pick(D.offre.filter((k) => ITEMS[k]));
        if (id) {
          c.cadeauJ = s.day; farm.give(id, 1);
          const p = game.player; play.flyer && play.flyer(id, [p.pos[0], p.pos[1] + 1.2, p.pos[2]], 1);
          set(pick(D.cadeau_donne));
          v.text = `(${n.d.gender === 'f' ? 'Elle' : 'Il'} vous tend : ${itemName(id).toLowerCase()}.) ` + v.text;
          return null;
        }
      }
      if (Math.random() < 0.65) set(pick(S.foyer === n.id && game.insideBuilding && game.insideBuilding('ferme') ? D.foyer : S.foyer === n.id && Math.random() < 0.5 ? D.foyer : D.tendre));
      n.waveT = 1.2;
      return null;
    }
    if (c.e >= 1 && Math.random() < 0.4) set(pick(D.attirance));
    return null;
  },
  rivalDit(n, v) {
    const S = this.S(), pour = S.rival[n.id], D = COEUR[n.d.id];
    if (!pour || pour === 'dit' || !D || !D.rival_dit || this.etape(pour) < 2) return null;
    S.rival[n.id] = 'dit';
    v.text = this.fmt(D.rival_dit, n); n.speakT = Math.min(6, 1 + v.text.length * 0.04);
    npcs.addAmitie(n, -40);
    return null;
  },
  // ------------------------------------------------------------------ options et choix
  options(n, opts) {
    if (!this.candidat(n) || this.crimes(n).length || n.st.anger > 0) return;
    const c = this.c(n.id), s = farm.s, lvl = npcs.level(n), extra = [];
    if (c.e === 1 && lvl >= 7 && c.aveuJ !== s.day) extra.push({ label: '(Lui avouer ce que vous ressentez)', act: 'k:aveu', quest: true });
    if (c.e >= 2 && this.veillee(n)) extra.push({ label: 'M’accorderez-vous une danse ?', act: 'k:danse', quest: true });
    if (c.e >= 2) extra.push({ label: 'Vous proposer une sortie…', act: 'k:sortie' });
    if (c.e === 2 && c.rdv >= 2) extra.push({ label: '(Lui demander de former un couple)', act: 'k:couple', quest: true });
    if (c.e === 3 && (farm.count('anneau_fiancailles') || c.bague)) extra.push({ label: '(Demander sa main)', act: 'k:main', quest: true });
    if (c.e === 4 && this.S().noces && this.S().noces.id === n.id) extra.push({ label: 'Nos noces…', act: 'k:noces' });
    if (c.e >= 2) extra.push({ label: '(Rompre)', act: 'k:rompre' });
    if (!extra.length) return;
    const i = opts.findIndex((o) => o.act === 'bye');
    opts.splice(i >= 0 ? i : opts.length, 0, ...extra);
  },
  veillee(n) {
    const h = npcs.hour(), w = game.world, B = w.bld.auberge, p = game.player;
    if (typeof cal === 'undefined' || !cal.is('veillee') || h < 19 || h > 23.5 || !B) return false;
    return Math.hypot(p.pos[0] - B.x, p.pos[2] - B.z) < 9 && Math.hypot(n.x - B.x, n.z - B.z) < 9;
  },
  choisir(n, act) {
    const c = this.c(n.id), D = this.D(n), s = farm.s, S = this.S(), h = npcs.hour();
    const V = (t, o) => talk.view(this.fmt(t, n), o || talk.options());
    switch (act) {
      case 'k:aveu':
        if (c.p >= 150) { this.passer(n, 2); c.p += 40; npcs.addAmitie(n, 30); this.bonheur(3); return V(D.aveu_oui); }
        c.aveuJ = s.day; c.p += 20; return V(D.aveu_pas);
      case 'k:oui': this.passer(n, 2); c.p += 60; npcs.addAmitie(n, 30); this.bonheur(3); return V(D.aveu_npc_oui);
      case 'k:non': c.e = 0; c.p = 0; c.refus = s.day; npcs.addAmitie(n, -40); return V(D.refus);
      case 'k:sortie': {
        const o = [];
        o.push({ label: h < 18.3 ? 'Ce soir, au lac, pour le coucher du soleil' : 'Demain soir, au lac, pour le coucher du soleil', act: 'k:rdv:lac' });
        o.push({ label: 'Demain midi, un pique-nique au bord de l’eau', act: 'k:rdv:piquenique' });
        if (this.veillee(n)) o.push({ label: 'Danser, ici, ce soir', act: 'k:danse' });
        o.push({ label: 'Rien. Pardon.', act: 'k:rien' });
        return talk.view(this.fmt('(Vous cherchez vos mots.)', n), o);
      }
      case 'k:rdv:lac': case 'k:rdv:piquenique': {
        if (S.rdv && !S.rdv.fait) return V(S.rdv.id === n.id ? 'On a déjà rendez-vous, vous vous souvenez ?' : '…');
        const type = act.slice(6), jour = type === 'lac' && h < 18.3 ? s.day : s.day + 1;
        S.rdv = type === 'lac' ? { id: n.id, type, jour, h0: 18.6, h1: 20.4 } : { id: n.id, type, jour, h0: 12, h1: 14.5 };
        npcs.addAmitie(n, 10);
        return V(D.rdv_oui[type]);
      }
      case 'k:danse': talk.close(); ui.close(true); setTimeout(() => this.scene(n, { type: 'danse' }), 250); return null;
      case 'k:couple':
        if (c.p >= 450) { this.passer(n, 3); npcs.addAmitie(n, 40); this.bonheur(4); return V(D.couple_oui); }
        return V(D.couple_pas);
      case 'k:main': {
        if (c.e === 3 && s.day - c.depuis >= 2 && c.p >= 650) {
          if (!c.bague) { if (!farm.take('anneau_fiancailles', 1)) return V(D.main_pas); c.bague = true; }
          this.passer(n, 4); this.planNoces(n); this.bonheur(5);
          sound.quest && sound.quest(true);
          return V(D.main_oui + '\n\n' + this.texteNoces());
        }
        return V(D.main_pas);
      }
      case 'k:noces': return V(this.texteNoces());
      case 'k:rompre': return talk.view(this.fmt(farm.s.fem ? '(Vous êtes sûre ?)' : '(Vous êtes sûr ?)', n), [{ label: '(Oui. Rompre.)', act: 'k:rompre2' }, { label: '(Non.)', act: 'k:rien' }]);
      case 'k:rompre2': this.rompre(n); return talk.view(this.fmt(D.rupture, n), [{ label: 'Partir', act: 'bye' }]);
      case 'k:rien': return talk.view('…', talk.options());
    }
    return talk.view('…', talk.options());
  },
  bonheur(k) { if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(k, 'le cœur', 8); },
  // ------------------------------------------------------------------ les cadeaux qui touchent le cœur
  cadeau(n, id) {
    const c = this.c(n.id), D = this.D(n);
    if (c.e < 1) return;
    const loves = n.d.loves || [], likes = n.d.likes || [], dis = n.d.dislikes || [];
    let k = 0;
    if (dis.includes(id)) k = -40;
    else if (loves.includes(id)) k = 70;
    else if ((D.cadeaux || []).includes(id)) k = 55;
    else if (likes.includes(id)) k = 40;
    else if (COEUR_ROMANTIQUE.includes(id)) k = 45;
    else k = 10;
    c.p += k;
    if (k >= 40) this.temoinsJaloux(n, 16);
  },
  // quelqu'un qu'on courtise aussi, tout près : il voit
  temoinsJaloux(n, r) {
    const S = this.S(), p = game.player, s = farm.s;
    for (const id in S.c) {
      if (id === n.id || S.c[id].e < 2) continue;
      const m = npcs.byId[id];
      if (!m || !m.st.alive || m.sleep || Math.hypot(m.x - p.pos[0], m.z - p.pos[2]) > r) continue;
      S.c[id].jaloux = { de: n.id, jour: s.day };
      npcs.say(m, '…', 2);
    }
  },
  // ------------------------------------------------------------------ rendez-vous
  pointRdv(type) {
    if (this.pts[type]) return this.pts[type];
    const w = game.world, WL = w.waterLevel;
    const L = type === 'lac' ? (w.lm.ponton || w.lm.lac) : (w.lm.moulin || w.lm.pont_riviere || w.lm.lavoir || w.lm.ponton || w.lm.lac);
    if (!L) return null;
    let best = null;
    for (let k = 0; k < 80; k++) {
      const a = k * 2.399, d = 3 + (k % 10) * 1.1, x = L.x + Math.cos(a) * d, z = L.z + Math.sin(a) * d, h = w.heightAt(x, z);
      if (h < WL + 0.35 || h > WL + 6 || w.normalAt(x, z)[1] < 0.9 || !pointFree(w, x, z, 0.8)) continue;
      // au bord de l'eau : qu'il y ait de l'eau à quelques pas
      let eau = null;
      for (let j = 0; j < 12 && !eau; j++) { const b = j / 12 * TAU, ex = x + Math.cos(b) * 7, ez = z + Math.sin(b) * 7; if (w.heightAt(ex, ez) < WL - 0.3) eau = [ex, ez]; }
      if (!eau && type === 'lac') continue;
      const r = eau ? Math.atan2(eau[0] - x, eau[1] - z) : 0;
      best = { x, z, r }; break;
    }
    if (!best) best = { x: L.x + 2, z: L.z + 2, r: 0 };
    this.pts[type] = best;
    return best;
  },
  // l'emploi du temps, les jours de rendez-vous et de noces
  horaire(n, h) {
    const S = this.S(), s = farm.s;
    if (!S || n.st.malade) return null;
    const R = S.rdv;
    if (R && !R.fait && R.id === n.id && s.day === R.jour && h >= R.h0 - 0.75 && h <= R.h1) return { place: 'k:rdv', sleep: false };
    const N = S.noces;
    if (N && !N.fait && s.day === N.jour && h >= 10.2 && h <= 13.2) {
      if (n.id === N.id) return { place: 'k:mariee', sleep: false };
      if (n.id === this.officiant()) return { place: 'k:autel', sleep: false };
      if (n.st.met && npcs.level(n) >= 3 && n.d.area !== 'nains' && !n.d.nomade) return { place: 'k:invite', sleep: false };
    }
    return null;
  },
  officiant() { return npcs.alive('cure') ? 'cure' : npcs.alive('maire') ? 'maire' : null; },
  autel() {
    const w = game.world, B = w.bld.eglise;
    if (!B || !B.spots.work) return null;
    const W = B.spots.work, r = W.r, fx = Math.sin(r), fz = Math.cos(r), rx = Math.cos(r), rz = -Math.sin(r);
    const cx = W.x + fx * 2.4, cz = W.z + fz * 2.4;
    return { r, y: W.y, autel: [W.x, W.z], centre: [cx, cz], mariee: [cx + rx * 0.55, cz + rz * 0.55], joueur: [cx - rx * 0.55, cz - rz * 0.55], B };
  },
  dest(n, pl) {
    const w = game.world, S = this.S();
    const node = (x, z) => npcs.nearestReach(x, z, (q) => !/:(in|mid)$/.test(q.tag));
    if (pl === 'k:rdv' && S.rdv) {
      const P = this.pointRdv(S.rdv.type);
      if (!P) return null;
      return { node: node(P.x, P.z), x: P.x, z: P.z, r: P.r, pose: S.rdv.type === 'piquenique' ? 'sit' : null };
    }
    const A = this.autel();
    if (!A) return null;
    if (pl === 'k:mariee') return { node: A.B.nMid, x: A.mariee[0], z: A.mariee[1], r: A.r + Math.PI, pose: null, bld: 'eglise' };
    if (pl === 'k:autel') return { node: A.B.nMid, x: A.autel[0], z: A.autel[1], r: A.r, pose: null, bld: 'eglise' };
    if (pl === 'k:invite') {
      const bancs = Object.keys(A.B.spots).filter((k) => k.startsWith('banc'));
      if (!bancs.length) return null;
      const sp = A.B.spots[bancs[(hashString(n.id) >>> 0) % bancs.length]];
      return { node: A.B.nMid, x: sp.x, z: sp.z, r: sp.r, pose: 'sit', bld: 'eglise', y: sp.y };
    }
    return null;
  },
  // ------------------------------------------------------------------ les scènes (cinématiques)
  async scene(n, R) {
    const D = this.D(n), c = this.c(n.id), S = this.S(), p = game.player, type = R.type;
    if (typeof cine === 'undefined' || cine.on || !n.st.alive) return;
    R.fait = true;
    n.talking = true; n.fleeT = 0;
    let gain = 150, pense = pick(COEUR_PENSEES[type]);
    if (type === 'piquenique') {
      const vivres = Object.keys(farm.s.inv).filter((id) => ITEMS[id] && ITEMS[id].cat === 'nourriture' && !ITEMS[id].alcool);
      let k = 0;
      for (const id of vivres) { while (k < 2 && farm.count(id) && farm.take(id, 1)) k++; if (k >= 2) break; }
      if (!k) { gain = 70; pense = '(Vous n’avez rien apporté. C’est bien quand même.)'; }
    }
    const y = n.y + 1.05, mid = [(n.x + p.pos[0]) / 2, y, (n.z + p.pos[2]) / 2];
    const a0 = Math.atan2(p.pos[0] - n.x, p.pos[2] - n.z) + Math.PI / 2;
    const L = D.rdv[type];
    let musique = null;
    const danse = type === 'danse' ? { cx: mid[0], cz: mid[2], a: Math.atan2(n.x - mid[0], n.z - mid[2]), y0: p.pos[1] } : null;
    const pas = (t, dt) => {
      if (!danse) return;
      danse.a += dt * 1.1;
      const r = 0.45;
      n.x = danse.cx + Math.sin(danse.a) * r; n.z = danse.cz + Math.cos(danse.a) * r;
      p.pos[0] = danse.cx - Math.sin(danse.a) * r; p.pos[2] = danse.cz - Math.cos(danse.a) * r;
      n.heading = Math.atan2(p.pos[0] - n.x, p.pos[2] - n.z);
      p.yaw = Math.atan2(n.x - p.pos[0], n.z - p.pos[2]) - Math.PI;
      n.move = 0.55; n.phase += dt * 5;
    };
    const plans = [
      { dur: 4.8, orbite: { c: mid, r: type === 'danse' ? 3.2 : 4.4, h: 0.8, a0, a1: a0 + 0.55, look: mid }, texte: this.fmt(L[0], n), qui: n.name, joueur: true, chaque: pas, debut: () => { if (type === 'danse') musique = this.musique(); } },
      { dur: 4.8, orbite: { c: mid, r: type === 'danse' ? 2.4 : 2.9, h: 0.45, a0: a0 + 1.0, a1: a0 + 1.35, look: mid }, texte: this.fmt(L[1], n), qui: n.name, joueur: true, chaque: pas },
      { dur: 3.8, orbite: { c: mid, r: 6.5, h: 2.4, a0: a0 + 1.9, a1: a0 + 2.3, look: mid }, texte: pense, joueur: true, chaque: pas },
    ];
    try { await cine.jouer(plans, {}); } catch (e) { console.error(e); }
    n.talking = false; n.move = 0; n.goal = null;
    if (danse) { p.pos[1] = Math.max(p.pos[1], danse.y0); }
    if (musique) musique.fin = true;
    c.p += gain; c.rdv = (c.rdv || 0) + 1; c.manques = 0;
    npcs.addAmitie(n, 40);
    this.bonheur(3);
    this.temoinsJaloux(n, 28);
    if (S.rdv === R) S.rdv = null;
  },
  // un air de vielle, pour la danse
  musique() {
    const M = { fin: false };
    if (!sound.ok || !sound.tone || !sound.at) return M;
    const N = [587, 659, 740, 784, 880, 988, 1175];
    const air = [4, 3, 2, 3, 4, 4, 4, -1, 3, 3, 3, -1, 4, 6, 6, -1, 4, 3, 2, 3, 4, 4, 4, 4, 3, 3, 4, 3, 2, -1, 0, 0];
    const t0 = sound.at() + 0.1, dur = 0.24;
    for (let rep = 0; rep < 2; rep++) for (let i = 0; i < air.length; i++) {
      const k = air[i];
      if (k < 0) continue;
      try { sound.tone(t0 + (rep * air.length + i) * dur, 'triangle', N[k], N[k], dur * 0.9, 0.035); } catch (e) { return M; }
    }
    try { sound.tone(t0, 'sawtooth', 147, 147, air.length * 2 * dur, 0.008); sound.tone(t0, 'sine', 294, 294, air.length * 2 * dur, 0.01); } catch (e) { /* rien */ }
    return M;
  },
  // ------------------------------------------------------------------ les noces
  planNoces(n) {
    const S = this.S(), s = farm.s;
    let jour = s.day + 2;
    if (npcs.alive('cure') && typeof cal !== 'undefined') { for (let k = 0; k < 13; k++) if (cal.is('messe', s.day + 2 + k)) { jour = s.day + 2 + k; break; } }
    S.noces = { id: n.id, jour, reports: 0 };
  },
  texteNoces() {
    const N = this.S().noces;
    if (!N) return '…';
    const date = typeof cal !== 'undefined' ? `${cal.nom(N.jour)} ${N.jour}` : `le jour ${N.jour}`;
    return `(Les noces : ${date}, à onze heures, à l’église de ${farm.names.ville}.)`;
  },
  async ceremonie(n) {
    const S = this.S(), N = S.noces, s = farm.s, A = this.autel(), p = game.player, D = this.D(n);
    if (!N || !A || cine.on) return;
    N.fait = true;
    n.talking = true;
    p.pos = [A.joueur[0], A.y, A.joueur[1]]; p.vel = [0, 0, 0]; p.yaw = A.r;
    n.x = A.mariee[0]; n.z = A.mariee[1]; n.heading = A.r + Math.PI;
    const off = this.officiant(), L = off ? COEUR_OFFICIANTS[off] : null, qui = off ? npcs.byId[off].name : '';
    const moi = s.prenom || (s.fem ? 'la fermière' : 'le fermier');
    const ab = { a: n.name, b: moi };
    const fx = Math.sin(A.r), fz = Math.cos(A.r), c = [A.centre[0], A.y + 1.2, A.centre[1]];
    const nef = [A.centre[0] + fx * 7, A.y + 2.4, A.centre[1] + fz * 7];
    const plans = [
      { dur: 5, de: { pos: nef, look: [A.autel[0], A.y + 1.2, A.autel[1]] }, a: { pos: [A.centre[0] + fx * 4.5, A.y + 1.9, A.centre[1] + fz * 4.5], look: c }, texte: L ? this.fmt(L[0], n, ab) : '(Il n’y a plus personne pour vous marier. Alors vous vous le dites l’un à l’autre, devant l’autel vide.)', qui, joueur: true, debut: () => { sound.bell && sound.bell(1); } },
      { dur: 4, orbite: { c, r: 2.6, h: 0.3, a0: A.r + 0.9, a1: A.r + 0.6, look: c }, texte: L ? this.fmt(L[1], n, ab) : '', qui, joueur: true },
      { dur: 4.5, orbite: { c, r: 2.0, h: 0.2, a0: A.r - 0.6, a1: A.r - 0.9, look: [n.x, A.y + 1.5, n.z] }, texte: this.fmt(D.noces, n), qui: n.name, joueur: true },
      { dur: 2.6, orbite: { c, r: 2.2, h: 0.2, a0: A.r + 0.4, a1: A.r + 0.2, look: [p.pos[0], A.y + 1.5, p.pos[2]] }, texte: '(Oui.)', joueur: true },
      { dur: 5, de: { pos: [A.centre[0] + fx * 3, A.y + 1.7, A.centre[1] + fz * 3], look: c }, a: { pos: nef, look: c }, texte: L ? this.fmt(L[2], n, ab) : '(Dehors, les cloches ne sonnent pas. Vous les entendez quand même.)', qui, joueur: true, fin: () => { sound.bell && sound.bell(1); setTimeout(() => sound.bell && sound.bell(0.8), 700); } },
    ];
    try { await cine.jouer(plans, {}); } catch (e) { console.error(e); }
    n.talking = false;
    this.marier(n);
  },
  marier(n) {
    const S = this.S(), s = farm.s;
    this.passer(n, 5);
    S.noces = null; S.foyer = n.id;
    if (n.d.id === 'boulangere' && npcs.alive('fillette')) S.fillette = true;
    this.appliquerFoyer();
    if (S.fillette) this.litPetite();
    this.bonheur(8);
    for (const m of npcs.list) if (m !== n && m.st.alive && m.st.met && npcs.level(m) >= 3) npcs.addAmitie(m, 20);
    s.rep.hero = (s.rep.hero || 0) + 1;
    farm.mail(npcs.alive('maire') ? 'La mairie de ' + farm.names.ville : 'Le presbytère', 'Registre de l’état civil', `Ce jour, ${cal.nom(s.day)} ${s.day}, ont été unis ${n.name} ${n.d.surname}, ${n.d.role.toLowerCase()}, et ${s.prenom || 'l’occupant de la vieille ferme'}.\n\nLes époux résideront à la vieille ferme.\n\n« Que la vallée leur soit douce. Elle l’est rarement. »`);
    setTimeout(() => ui.subtitle('', `(Ce soir, ${n.name} dormira à la ferme. Et les soirs d’après.)`, 5), 1500);
  },
  // l'être aimé vient vivre à la ferme (la petite aussi) : la maison change dans les données, à chaque chargement
  appliquerFoyer() {
    const S = this.S(), w = game.world;
    for (const d of NPC_DATA) if (COEUR_HOME0[d.id]) d.home = COEUR_HOME0[d.id];
    if (!S || !w || !w.bld.ferme) return;
    const B = w.bld.ferme;
    if (S.foyer && npcs.alive(S.foyer)) {
      NPC_BY_ID[S.foyer].home = 'ferme';
      if (S.fillette && npcs.alive('fillette')) NPC_BY_ID.fillette.home = 'ferme';
      const bb = new Builder(w, Math.random, new Uint8Array(1));
      const [x, z] = bb.toWorld(B.f, 1.0, -0.2);
      B.spots.sit = { x, y: B.f.y + 0.15, z, r: B.f.r + Math.PI };
      if (S.lit2) { const [x2, z2] = bb.toWorld(B.f, 3.55, -1.9); B.spots.bed2 = { x: x2, y: B.f.y + 0.65, z: z2, r: B.f.r + Math.PI }; }
    } else { delete B.spots.sit; delete B.spots.bed2; }
  },
  litPetite() {
    const S = this.S(), w = game.world, B = w.bld.ferme;
    if (S.lit2 || !B) return;
    const bb = new Builder(w, Math.random, new Uint8Array(1));
    const [x, z] = bb.toWorld(B.f, 3.55, -1.9);
    farm.addProp({ id: 'lit', x, y: B.f.y + 0.15, z, r: B.f.r + Math.PI, data: { col: '#c890a0' } });
    S.lit2 = true;
    this.appliquerFoyer();
  },
  // ------------------------------------------------------------------ la ferme : on vous aide
  aiderFerme() {
    const s = farm.s;
    let k = 0;
    for (const key in s.crops) { const c = s.crops[key]; if (!c || !c.c || c.dead) continue; if (!(c.wet > s.hours + TERRE.humide - 12)) { c.wet = s.hours + TERRE.humide; k++; } }
    for (const a of s.animals || []) a.fedUntil = Math.max(a.fedUntil || 0, s.hours + 14);
    try { if (typeof chien !== 'undefined' && chien.vivant && chien.vivant() && chien.stade() >= 1) chien.repas(14, false); } catch (e) { console.error(e); }
    farm.dirtyProps = true;
    return k;
  },
  jour() {
    const S = this.S(), s = farm.s;
    if (!S) return;
    // l'aide à la ferme : l'être aimé passe (en couple), ou vit là (marié)
    const qui = Object.keys(S.c).filter((id) => S.c[id].e >= 3 && npcs.alive(id));
    const conj = this.conjoint();
    if (conj) { this.aiderFerme(); setTimeout(() => { if (!game.dying) penser.une('conjoint_ferme', `(Le potager est arrosé, les bêtes ont mangé. ${conj.name} s’est levé${conj.d.gender === 'f' ? 'e' : ''} avant vous.)`, 4.5); }, 4200); }
    else for (const id of qui) {
      if (Math.random() > 0.3) continue;
      const n = npcs.byId[id];
      this.aiderFerme();
      farm.mail(n.name + ' ' + n.d.surname, 'Un mot', this.fmt(COEUR[id].aide, n) + '\n\n— ' + n.name);
      break;
    }
    // le deuil, appris le lendemain
    for (const d of S.deuils) if (!d.su && s.day > d.day) { d.su = true; const m = npcs.byId[d.id]; if (m) setTimeout(() => { if (!game.dying) ui.subtitle('', `(Une lettre bordée de noir. Le nom de ${m.name}.)`, 5); }, 5200); }
    for (const id in S.c) { const n = npcs.byId[id]; if (n && n.st.alive) this.majEtape(n); }
  },
  // ------------------------------------------------------------------ la mort de l'être aimé
  mort(n, by) {
    const S = this.S(), c = S && S.c[n.id];
    if (!c || c.e < 1) return;
    const e = c.e;
    c.e = -1; c.mortJ = farm.s.day;
    if (S.rdv && S.rdv.id === n.id) S.rdv = null;
    if (S.noces && S.noces.id === n.id) S.noces = null;
    if (S.foyer === n.id) { S.foyer = null; }
    if (e >= 2) {
      const k = (e >= 5 ? 30 : e >= 3 ? 20 : 12) + (by === 'joueur' ? 10 : 0);
      if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-k, 'la mort de ' + n.name);
      const p = game.player, pres = Math.hypot(n.x - p.pos[0], n.z - p.pos[2]) < 40;
      S.deuils.push({ id: n.id, day: farm.s.day, e, su: pres });
      if (pres) setTimeout(() => { if (!game.dying) ui.subtitle('', by === 'joueur' ? '(Qu’avez-vous fait. Qu’avez-vous fait.)' : `(Non. Pas ${n.name}. Pas maintenant.)`, 5); }, 1200);
    }
    this.appliquerFoyer();
  },
  // ------------------------------------------------------------------ la prison (appelé par le cachot)
  auCachot(jours) {
    const S = this.S();
    if (!S) return null;
    const g = S.c.garde;
    if (g && g.e >= 3 && npcs.alive('garde') && jours > 1) return { jours: jours - 1, texte: `${this.fmt('{npc:garde}', npcs.byId.garde)} a parlé au maire, à voix basse. Un jour de moins. Il ne vous regarde pas.` };
    return null;
  },
  visiteCachot() {
    const S = this.S();
    if (!S) return null;
    const ids = Object.keys(S.c).filter((id) => S.c[id].e >= 3 && npcs.alive(id));
    if (!ids.length) return null;
    const id = S.foyer && ids.includes(S.foyer) ? S.foyer : ids[0], n = npcs.byId[id];
    const objets = [['pain', 1], ['fromage', 1]];
    if (id === 'forgeron' && !farm.count('lime')) objets.push(['lime', 1]);
    if (id === 'pecheur') objets.push(['poisson_fume', 1]);
    return { qui: n.name, texte: this.fmt(COEUR[id].visite, n), objets };
  },
  // ------------------------------------------------------------------ chaque image (par demi-seconde)
  update(dt, playing) {
    const S = this.S(), s = farm.s;
    if (!S) return;
    this.t -= dt;
    if (this.t > 0) return;
    this.t = 0.5;
    const h = npcs.hour(), p = game.player, en = typeof prison !== 'undefined' && prison.enPrison();
    // le rendez-vous
    const R = S.rdv;
    if (R && !R.fait) {
      const n = npcs.byId[R.id];
      if (!n || !n.st.alive || this.etape(R.id) < 2) S.rdv = null;
      else if (s.day > R.jour || (s.day === R.jour && h > R.h1)) {
        const c = this.c(R.id);
        S.rdv = null;
        if (!en) { c.p -= 80; c.manques = (c.manques || 0) + 1; c.manqueJ = 'rdv'; npcs.addAmitie(n, -30); if (c.manques >= 2 && c.e > 1) { c.e -= 1; c.manques = 0; } }
      } else if (playing && s.day === R.jour && h >= R.h0 - 0.3 && !cine.on && !ui.panel && !game.sleeping) {
        const P = this.pointRdv(R.type);
        if (P && Math.hypot(n.x - P.x, n.z - P.z) < 5 && Math.hypot(p.pos[0] - n.x, p.pos[2] - n.z) < 7) this.scene(n, R);
      }
    }
    // les noces
    const N = S.noces;
    if (N && !N.fait) {
      const n = npcs.byId[N.id];
      if (!n || !n.st.alive) S.noces = null;
      else if (en && s.day >= N.jour) { N.jour = s.day + 3; N.reports = (N.reports || 0) + 1; farm.mail(n.name + ' ' + n.d.surname, 'Les noces', this.fmt('On repoussera les noces. Je t’attendrai. Je ne sais faire que ça, en ce moment.', n) + '\n\n— ' + n.name); }
      else if (s.day > N.jour || (s.day === N.jour && h > 13.2)) {
        const c = this.c(N.id);
        S.noces = null; c.p -= 300; c.manqueJ = 'noces'; npcs.addAmitie(n, -120);
        this.passer(n, 3); c.bague = true;
      } else if (playing && s.day === N.jour && h >= 10.3 && !cine.on && !ui.panel && !game.sleeping) {
        const A = this.autel();
        if (A && Math.hypot(n.x - A.centre[0], n.z - A.centre[1]) < 4 && Math.hypot(p.pos[0] - A.centre[0], p.pos[2] - A.centre[1]) < 9) this.ceremonie(n);
      }
    }
    // le soir, à la ferme, on ferme la porte à clé
    const conj = this.conjoint();
    if (conj && (h >= 21.5 || h < 5) && (conj.state === 'sleep' || conj.sleep) && conj.inside === 'ferme') {
      const w = game.world, dr = w.bld.ferme && w.doors[w.bld.ferme.door];
      if (dr && !dr.locked && !dr.open && !(p && game.insideBuilding && !game.insideBuilding('ferme') && Math.hypot(p.pos[0] - dr.x, p.pos[2] - dr.z) < 30)) dr.locked = true;
    }
  },
  // ------------------------------------------------------------------ le carnet
  carnet(body) {
    const S = this.S();
    if (!S || !body) return;
    const L = [];
    for (const id in S.c) {
      const c = S.c[id], n = npcs.byId[id];
      if (!n || c.e === 0 || !n.st.met) continue;
      const f = n.d.gender === 'f', nom = `${n.name} ${n.d.surname}`;
      let t = '';
      if (c.e === -1) { const M = typeof societe !== 'undefined' && societe.S().morts[id]; t = `${nom} — † ${M && typeof cal !== 'undefined' ? cal.nom(M.day) + ' ' + M.day : ''}. Vous ne l’oubliez pas.`; }
      else if (c.e === 1) t = `${nom} — ${f ? 'elle' : 'il'} vous regarde un peu plus longtemps qu’avant.`;
      else if (c.e === 2) t = `${nom} — vous vous fréquentez${c.rdv ? ` (${c.rdv} rendez-vous)` : ''}.`;
      else if (c.e === 3) t = `${nom} — vous êtes ensemble.`;
      else if (c.e === 4) t = `${nom} — ${f ? 'votre fiancée' : 'votre fiancé'}. ${this.texteNoces().replace(/[()]/g, '')}`;
      else if (c.e === 5) t = `${nom} — ${f ? 'votre épouse' : 'votre époux'}${S.foyer === id ? ', à la ferme avec vous' : ''}.`;
      L.push(t);
    }
    const R = S.rdv;
    if (R && !R.fait && npcs.byId[R.id]) {
      const n = npcs.byId[R.id], quand = R.jour === farm.s.day ? 'aujourd’hui' : 'demain';
      L.push(R.type === 'lac' ? `Rendez-vous avec ${n.name} : ${quand}, au lac, au coucher du soleil (vers sept heures).` : `Rendez-vous avec ${n.name} : ${quand} midi, pique-nique au bord de l’eau. Apportez de quoi manger.`);
    }
    if (typeof prison !== 'undefined' && prison.enPrison()) { const P = prison.S(); L.unshift(`Au cachot : encore ${prison.jours(Math.max(1, P.jours))}. Rançon : ${P.rancon} pièces.`); }
    if (!L.length) return;
    const d = document.createElement('div'); d.className = 'q coeur';
    d.innerHTML = `<b>${esc('Le cœur')}</b>${L.map((t) => `<div>${esc(t)}</div>`).join('')}`;
    const rech = body.querySelector('.q.recherche');
    if (rech && rech.nextSibling) body.insertBefore(d, rech.nextSibling); else body.insertBefore(d, body.firstChild);
  },
};

// ============================================================================
//  BRANCHEMENTS
// ============================================================================
// la mort de l'être aimé
{
  const _kill = npcs.kill.bind(npcs);
  npcs.kill = function (n, by, wit) {
    const vivant = !!(n && n.st && n.st.alive);
    _kill(n, by, wit);
    try { if (vivant && n && n.st && !n.st.alive && farm.s) sentiments.mort(n, by); } catch (e) { console.error(e); }
  };
}
// les anneaux : au colporteur, à la colporteuse, à la forge
if (typeof HOTTES !== 'undefined') for (const id of ['colporteur', 'colporteuse']) if (HOTTES[id] && HOTTES[id].fonds && !HOTTES[id].fonds.includes('anneau_fiancailles')) HOTTES[id].fonds.push('anneau_fiancailles');
if (NPC_BY_ID.forgeron && NPC_BY_ID.forgeron.shop && !NPC_BY_ID.forgeron.shop.sells.some(([k]) => k === 'anneau_fiancailles')) NPC_BY_ID.forgeron.shop.sells.push(['anneau_fiancailles', 340]);

HOOKS.update.push((dt, eye, basis, sky, playing) => { if (farm.s && game.world) sentiments.update(dt, playing); });
HOOKS.day.push(() => { if (farm.s) sentiments.jour(); });
HOOKS.load.push(() => {
  sentiments.S(); sentiments.pts = {}; sentiments.t = 0;
  sentiments.appliquerFoyer();
  const S = sentiments.S();
  if (S.rdv) S.rdv.fait = false;
  if (S.noces) S.noces.fait = false;
  if (S.foyer) npcs.snap(game.world);
  if (sentiments.hooked) return;
  sentiments.hooked = true;
  // l'emploi du temps : rendez-vous, noces
  const _sp = npcs.schedulePlace.bind(npcs);
  npcs.schedulePlace = function (n, h) {
    const r = _sp(n, h);
    try { if (farm.s) { const o = sentiments.horaire(n, h); if (o) return o; } } catch (e) { console.error(e); }
    return r;
  };
  const _dest = npcs.dest.bind(npcs);
  npcs.dest = function (n, pl, sleep) {
    if (typeof pl === 'string' && pl.startsWith('k:')) { try { const D = sentiments.dest(n, pl); if (D && D.node >= 0) return D; } catch (e) { console.error(e); } pl = 'home'; }
    return _dest(n, pl, sleep);
  };
  // au lit, à la ferme : on ne le réveille pas en visant le lit
  const _rc = npcs.raycast.bind(npcs);
  npcs.raycast = function (o, d, m) {
    const c = sentiments.conjoint();
    if (!c || c.state !== 'sleep' || c.inside !== 'ferme') return _rc(o, d, m);
    const st = c.state; c.state = 'gone';
    try { return _rc(o, d, m); } finally { c.state = st; }
  };
  // le salut tendre
  const _sg = npcs.shortGreet.bind(npcs);
  npcs.shortGreet = function (n) {
    try {
      if (farm.s && sentiments.candidat(n) && sentiments.etape(n.id) >= 3 && !sentiments.crimes(n).length && !(n.st.anger > 0) && Math.random() < 0.6) {
        const D = COEUR[n.d.id], S = sentiments.S();
        n.waveT = 1.4;
        return sentiments.fmt(pick(S.foyer === n.id && Math.random() < 0.5 ? D.foyer : D.tendre), n);
      }
    } catch (e) { console.error(e); }
    return _sg(n);
  };
  // les dialogues
  const _open = talk.open.bind(talk);
  talk.open = function (n) {
    const s = farm.s, st = n.st, dd = s && s.dead.length ? s.dead[s.dead.length - 1] : null;
    const special = !s || !st.met || st.anger > 0 || npcs.murdererKnown() || (strange.wasRedNight() && st.redSeen !== s.day) || !!(dd && dd.day >= s.day - 2 && st.deuil !== dd.id && dd.id !== n.id);
    const v = _open(n);
    try { if (v && farm.s && sentiments.candidat(n)) { const r = sentiments.ouvrir(n, v, special); if (r) return r; } } catch (e) { console.error(e); }
    return v;
  };
  const _options = talk.options.bind(talk);
  talk.options = function () {
    const opts = _options();
    try { if (this.n && farm.s) sentiments.options(this.n, opts); } catch (e) { console.error(e); }
    return opts;
  };
  const _choose = talk.choose.bind(talk);
  talk.choose = function (act) {
    const n = this.n;
    if (n && typeof act === 'string' && act.startsWith('k:')) return sentiments.choisir(n, act);
    return _choose(act);
  };
  const _gift = talk.gift.bind(talk);
  talk.gift = function () {
    const n = this.n, id = farm.s && farm.s.hand, g0 = n && n.st.giftDay;
    const v = _gift();
    try { if (n && id && n.st.giftDay === farm.s.day && g0 !== farm.s.day && sentiments.candidat(n)) sentiments.cadeau(n, id); } catch (e) { console.error(e); }
    return v;
  };
  // le carnet
  const _rsat = ui.renderSatchel.bind(ui);
  ui.renderSatchel = function () {
    _rsat();
    try { if (this.satTab === 'carnet' && farm.s) sentiments.carnet($('#satchel .body')); } catch (e) { console.error(e); }
  };
});
