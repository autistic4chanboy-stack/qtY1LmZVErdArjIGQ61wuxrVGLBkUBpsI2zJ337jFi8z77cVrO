// ============================================================================
//  LE GRAND HÔTEL DES CIMES (agent L18) — 4. LES GENS QUI PARLENT, LES QUATRE HISTOIRES
//  - hotelParler.ouvrir(id) : on parle à quelqu'un de l'hôtel (E, de près) ; ce
//    qu'il dit dépend de l'heure, de ce qu'on a vécu ensemble (amitié), de
//    l'histoire en cours ; les options : l'histoire, le service, « Parler »,
//    « S'en aller ». Le premier mot du jour rapproche (amitié +2).
//  - hotelHistoires : quatre histoires (L18_ARCS), chacune proposée par quelqu'un,
//    étape par étape ; certaines étapes se font en un lieu de la vallée (un petit
//    éclat d'or marque l'endroit, on y fait E), d'autres à une heure (écouter :
//    il suffit d'être là), d'autres en parlant. Des choix qui comptent, une fin
//    à chacune (et sa scène). Ce qu'on a fait ne se défait pas.
//  État : farm.s.hotel18.arcs[id] = { e (étape en cours), ouv (jour), faits: { étape: jour }, choix: {}, fin, finJ, attente }
// ============================================================================

// ---------------------------------------------------------------- ce que disent les gens (au hasard du jour, selon l'amitié)
const L18_PAROLES = {
  directeur: {
    inconnu: 'Monsieur ? Vous cherchez quelqu’un ? … Ah. Vous venez pour la place. Le dernier concierge est parti un matin sans prévenir, avec deux valises qui n’étaient pas à lui. Vous savez porter une valise sans l’emporter ?',
    jour: [
      'Un hôtel, c’est un navire : tout doit briller, et l’on ne parle pas de la cale.',
      'Le funiculaire nous a coûté le prix d’une aile. Il nous en a rapporté deux. La troisième… n’en parlons pas.',
      'Les clients n’achètent pas une chambre, ils achètent la certitude que rien ne leur arrivera. Vendez-la.',
      'Le préfet vient en août. Le préfet vient toujours en août. Je veux des lis dans le hall.',
      'Si un client vous demande pourquoi l’aile Nord est fermée : travaux. Il y a des travaux depuis 1871. Ce sont des travaux très délicats.',
    ],
    ami: [
      'Vous savez ce que disait mon prédécesseur ? « Un concierge est un homme qui ne s’étonne de rien. » Je m’étonne de vous, pourtant. En bien.',
      'Ma femme est restée à Lyon. Elle dit que j’ai épousé un hôtel. Elle n’a pas tort, et l’hôtel est plus fidèle.',
    ],
    nuit: 'Vous ne dormez pas ? Moi non plus. On écoute la maison craquer. Elle fait ça depuis dix-neuf ans.',
  },
  gaspard: {
    inconnu: 'Bonsoir, bonjour, je ne sais plus : je suis le veilleur, alors pour moi c’est toujours un peu le soir. Gaspard. Vous êtes nouveau ? Ça se voit : vous regardez les lustres.',
    jour: [
      'Le métier, c’est simple : on écoute, on se souvient, et on oublie au bon moment. Le reste, c’est des escaliers.',
      'Les commissions dans la vallée, prenez-les : les clients paient le double, et vous voyez du pays. La truite, au lac. Les morilles, sous les frênes. Le fromage, au marché de Valbrume.',
      'La cave est au fond de la cuisine. Ne vous perdez pas : elle est plus grande que l’hôtel.',
      'Mathilde, ma femme, était lingère ici. Elle repassait les draps en chantant. Depuis qu’elle est partie, les draps sont aussi lisses, mais ce n’est pas pareil.',
      'J’avais quinze ans à l’ouverture, en 1868. Groom. On m’a donné un costume trop grand, et je l’ai rempli à force d’années.',
      'Un client qui attend à la loge, c’est un client qui compte les secondes. Allez-y vite, mais sans courir : un concierge ne court jamais devant le client.',
      'Il y a des sonnettes qui sonnent, et des sonnettes qui appellent. Vous apprendrez la différence.',
    ],
    ami: [
      'Vous savez pourquoi on porte des clefs croisées ? Parce qu’un concierge a toujours deux clés : celle de la porte, et celle de la bouche.',
      'Si vous restez, un jour, vous serez comme moi : vous connaîtrez chaque marche par son grincement. Ce n’est pas une malédiction. Pas tout à fait.',
      'L’hiver 1871, il a fallu fermer l’aile. J’ai tenu la lanterne. Je n’en dirai pas plus ce soir.',
    ],
    nuit: 'La nuit, l’hôtel est à moi. Les couloirs, les sonnettes, et les pas au plafond quand il n’y a personne au-dessus.',
  },
  firmin: {
    inconnu: 'Bonjour m’sieur ! Firmin, le groom. Je porte tout ce qui se porte, sauf les ennuis. Vous êtes le nouveau concierge ? Ou un client ? Les clients ont des chaussures plus propres.',
    jour: [
      'À Paris, au Grand Hôtel du boulevard des Capucines, il y a sept cents chambres et un ascenseur hydraulique. Sept cents ! On pourrait y loger tout Clairpré et il resterait de la place.',
      'J’ai une carte postale de l’Opéra. On voit les chevaux de bronze sur le toit. Un jour je les verrai en vrai, même qu’ils seront plus petits.',
      'Le chef m’a donné une tartine. Il dit qu’il ne donne jamais rien. Il donne tout le temps.',
      'Mlle Fauvel compte même les épingles. Une fois elle en a trouvé une de trop, elle en a été malade.',
      'La 112 a laissé un pourboire d’un sou. Un sou ! Il faudrait des valises plus légères ou des clients plus riches.',
    ],
    ami: [
      'Vous croyez que j’y arriverai, moi, à Paris ? Les gens de là-bas parlent vite, il paraît. Moi aussi je parle vite. C’est déjà ça.',
      'Mes parents, je ne m’en souviens pas. Le curé dit qu’ils étaient bons. Je préfère croire le curé.',
    ],
    nuit: 'Je dors pas. J’entends l’aile, à travers le mur. Comme quelqu’un qui marche en chaussettes.',
  },
  chef: {
    inconnu: 'Pas de clients en cuisine. … Le concierge ? Encore pire : vous allez me demander des choses. Bon. Mercadier. Le chef. Ne touchez à rien.',
    jour: [
      'La vallée, c’est le meilleur garde-manger de France, et personne ne le sait. Des ombles dans le lac, des morilles sous les frênes, du beurre qui sent la fleur. À Paris, ils tueraient pour ce beurre.',
      'On ne cuisine pas pour les clients. On cuisine pour qu’ils se taisent un moment.',
      'J’ai travaillé au Café Anglais. J’ai servi le prince de Galles. Il a renvoyé un soufflé. J’ai renvoyé le prince de Galles. Enfin, je suis parti.',
      'La confiture de myrtilles, c’est ma mère qui la faisait. Je la fais pareil. Elle était meilleure.',
    ],
    ami: [
      'Je suis né au hameau, en bas, celui qu’on a abandonné. On est partis l’année où le puits a parlé. J’avais six ans. Ne me demandez pas ce qu’il a dit.',
      'Mon grand-père disait : « Un plateau de plus, ça ne ruine pas une maison. » Il avait raison. Il a souvent eu raison, ce vieux bougre.',
    ],
    nuit: 'Allez vous coucher. La cuisine, la nuit, c’est à moi. Et à personne d’autre.',
  },
  odile: {
    inconnu: 'Mademoiselle Fauvel, gouvernante. Vous marchez sur mon tapis, monsieur. Merci.',
    jour: [
      'Trois cent quarante draps, deux cent dix taies, cent dix-huit nappes. J’ai compté ce matin. Je recompterai ce soir.',
      'Les femmes de chambre chantent en faisant les lits. Je le leur interdis. Elles chantent plus bas.',
      'Une chambre bien faite ne doit pas avoir l’air d’avoir été faite. Elle doit avoir l’air d’attendre.',
    ],
    ami: [
      '« La neige sur les toits comme un drap qu’on étend / sur un lit où personne… » Rien. Je ne disais rien.',
      'J’avais vingt ans quand je suis montée. Je voulais être institutrice à Lyon. Les draps se plient plus facilement que les enfants.',
    ],
    nuit: 'Le linge sèche mieux la nuit. Les gens aussi : ils sèchent leurs larmes.',
  },
  cocher: {
    inconnu: 'Baptiste. Cocher. Les chevaux : Grisou, Mistral, et la Duchesse. Elle mord.',
    jour: ['La route du château, c’est du beurre. La montée, c’est autre chose : les chevaux la font à pied, et moi aussi.', 'Une voiture pour Valbrume ? Quand vous voulez. Les chevaux aiment descendre. C’est remonter qu’ils discutent.', 'Le funiculaire, c’est pour les gens pressés. Moi, je ne connais personne de pressé qui soit arrivé plus tôt.'],
    ami: ['La Duchesse vous a reniflé l’épaule. C’est qu’elle vous aime bien. Ou qu’elle a faim.'],
    nuit: '(Il dort sur la paille, à côté de la Duchesse. Elle a un œil ouvert.)',
  },
  joseph: {
    inconnu: 'Joseph Pellissier, mécanicien. Le funiculaire, c’est moi qui le tiens. Avec le câble. Surtout le câble.',
    jour: ['Cent quatre-vingts mètres de voie. Vingt-deux pour cent de pente. Un câble de trois centimètres, changé tous les cinq ans. Pas un accident. Je touche du bois.', 'La cabine pèse quatre tonnes à vide. Avec l’Anglais de la 104, cinq.', 'Je graisse les poulies chaque matin. Elles chantent faux, sinon.'],
    ami: ['Ma fille veut être ingénieur. Une fille ! Je lui ai donné mes plans. Elle a corrigé une cote.'],
    nuit: '(Le funiculaire dort. Joseph aussi.)',
  },
  maitre: {
    inconnu: 'Monsieur. Une table ? Ah, le concierge. Alors une table, non : mais un conseil, toujours.',
    jour: ['La 108 prend le thé à quatre heures et le chagrin à cinq. Je ne la sers pas : je l’accompagne.', 'Le chef est d’humeur. Il est toujours d’humeur. Aujourd’hui, c’est une bonne.'],
    ami: ['Trente ans de service, monsieur, et je n’ai jamais laissé tomber une assiette. Une fois, une cliente. Mais elle m’est tombée dessus.'],
    nuit: '',
  },
  comtesse: {
    inconnu: 'Vous êtes le concierge ? Alors vous savez tout, ou vous faites semblant. Hortense de Saint-Aubin. Je suis au 108 depuis deux étés. Ne me demandez pas pourquoi : tout le monde le sait, et personne n’en parle.',
    jour: [
      'Mon mari commandait une frégate. Il disait que la mer ne rend rien. La montagne non plus, apparemment.',
      'Le thé de cet hôtel est déplorable. Je le bois quand même : c’est une habitude, comme l’espoir.',
      'Lucien avait onze ans quand il m’a rapporté son premier caillou. Un morceau de quartz. Je l’ai encore. Il disait : « Maman, les pierres se souviennent de tout. »',
      'On me croit folle, à table. C’est commode : on me laisse la meilleure place.',
    ],
    ami: [
      'Vous êtes gentil. Ne le soyez pas trop : j’ai perdu l’habitude, et ça fait mal comme le sang qui revient dans les doigts.',
      'Venez à la longue-vue, un soir. Je vous montrerai la route de Clairpré. C’est par là qu’il est parti.',
    ],
    nuit: 'Je ne dors plus. Je fais une réussite. Elle ne réussit jamais, alors je recommence. C’est très reposant.',
  },
  wolanski: {
    inconnu: 'Ne me parlez pas de musique. Ne me parlez pas de la Pologne. Ne me parlez pas de ma santé. Bonjour : il fait beau, n’est-ce pas ? Voilà. Casimir Wolański. Nous avons fait connaissance.',
    jour: [
      'J’ai écrit trois symphonies. On en joue une à Vienne, le dimanche, entre une valse et un quadrille. C’est la gloire, à ce qu’il paraît.',
      'Vingt-trois ans d’exil. On finit par avoir le mal du pays pour des pays où l’on n’est jamais allé.',
      'Ce piano est accordé trop haut. Tout est trop haut ici. Même moi, j’ai l’impression d’être trop haut : on respire mal, on pense clair.',
      'Le médecin de Genève m’a donné six mois. C’était il y a un an. Je suis un très mauvais patient.',
    ],
    ami: [
      'Vous savez ce qui me manque de Lublin ? Pas les maisons. Le bruit des charrettes sur les pavés, à l’aube. Personne n’écrit une symphonie pour ça. Peut-être que je devrais.',
      'Vous écoutez bien, pour un concierge. Les concierges entendent, d’ordinaire. Ce n’est pas la même chose.',
    ],
    nuit: '(Il joue, très doucement, la même mesure, encore et encore, comme on frappe à une porte.)',
  },
  treize: {
    inconnu: '',
    jour: ['La neige ne fond jamais tout à fait, là-haut. Elle se repose.'],
    ami: ['Vous revenez. Les gens ne reviennent pas, d’habitude. Ils redescendent.'],
    nuit: '',
  },
};
// les clients de passage : ce qu'ils disent quand on leur parle (en plus de leur mot d'arrivée)
const L18_PAROLES_CLIENTS = [
  'Charmante maison. Un peu haute.', 'Le funiculaire m’a fait peur. Je redescendrai en voiture. Ou je ne redescendrai pas.', 'Il paraît que le chef a servi le prince de Galles !',
  'Cette vue ! On se croirait au bord du monde.', 'Vous savez pourquoi l’aile Nord est fermée ? Personne ne veut me répondre.', 'J’ai entendu sonner, cette nuit. Mais personne n’a sonné, m’a-t-on dit.',
];

// ---------------------------------------------------------------- parler
const hotelParler = {
  ouvrir(id) {
    const g = hotelGens.par[id];
    if (!g) return;
    const S = hotel18.S(), def = g.def, h = hotel18.heure(), jour = farm.s.day;
    g.parle = 3;
    // le premier mot du jour rapproche
    if (S.parle[id] !== jour) { const neuf = !S.parle[id]; S.parle[id] = jour; hotel18.lier(id, neuf ? 4 : 2); }
    hotel18.voir('pnj:l18_' + id); hotel18.voir('pnj:l18_' + id, 'metier');
    if (hotel18.pieceDu(g.x, g.y, g.z)) hotel18.voir('pnj:l18_' + id, 'demeure');
    if (hotel18.ami(id) >= 20) hotel18.voir('pnj:l18_' + id, 'caractere');
    if (g.client) return this.client(g);
    const P = L18_PAROLES[id] || { jour: ['…'] };
    const nuit = h >= 22 || h < 5.5;
    let desc;
    const special = hotelHistoires.ligne(id);
    if (special) desc = special;
    else if (S.vus['parle_' + id] === undefined && P.inconnu) { desc = P.inconnu; S.vus['parle_' + id] = jour; }
    else if (nuit && P.nuit) desc = P.nuit;
    else {
      const L = P.jour.concat(hotel18.ami(id) >= 30 ? P.ami || [] : []);
      const k = (hashString(id) + jour * 7 + (S.parle[id + '_n'] = ((S.parle[id + '_n'] || 0) + 1))) % L.length;
      desc = L[k];
    }
    const opts = [];
    try { opts.push(...hotelHistoires.options(id)); } catch (e) { console.error('L18 options', e); }
    try { opts.push(...hotelService.options(id)); } catch (e) { console.error('L18 options service', e); }
    if (id === 'directeur' && !S.embauche) opts.unshift({ label: '« Je cherche une place de concierge. »', fn: () => { ui.close(); hotelHistoires.embaucher(); } });
    if (id === 'cocher' && hotelScenes) opts.push({ label: 'Descendre à Valbrume en voiture (' + L18_REGL.voiture + ' pièces)', fn: () => { ui.close(); hotelScenes.voiture('descendre'); } });
    opts.push({ label: 'S’en aller', fn: () => ui.close() });
    const titre = def.nom + (def.role ? ' — ' + def.role : '');
    ui.choice(titre, desc, opts);
  },
  client(g) {
    const S = hotel18.S(), C = g.client;
    const d = S.demandes.find((q) => q.etat === 'attend' && q.client === g.id);
    if (d) return hotelService.ecouter(d);
    const opts = hotelService.options(g.id);
    opts.push({ label: 'S’en aller', fn: () => ui.close() });
    const n = (S.parle[g.id + '_n'] = (S.parle[g.id + '_n'] || 0) + 1);
    const desc = n === 1 ? C.mot : L18_PAROLES_CLIENTS[(hashString(g.id) + n + farm.s.day) % L18_PAROLES_CLIENTS.length];
    ui.choice(C.nom + ' — ' + C.qui, desc, opts);
  },
};

// ---------------------------------------------------------------- les petits sons de l'hôtel
const sonL18 = {
  ok() { return typeof sound !== 'undefined' && sound.ok; },
  // le timbre de la loge (ou d'une chambre) ; grave : la treize
  timbre(grave, vol) {
    if (!this.ok()) return;
    try {
      const t = sound.at(), f = grave ? 1318 * 0.66 : 2093, v = (vol || 1) * 0.03;
      for (const [m, a, d] of [[1, 1, 1.4], [2.76, 0.4, 0.6], [5.4, 0.18, 0.3], [1.004, 0.5, 1.2]]) sound.tone(t, 'sine', f * m, f * m * (grave ? 0.995 : 1), d * (grave ? 2.2 : 1), v * a, sound.sfx, 0.002);
      if (grave) for (const [m, a, d] of [[1, 0.8, 2.6], [2.76, 0.3, 1.0]]) sound.tone(t + 0.42, 'sine', f * m * 0.997, f * m * 0.99, d, v * a * 0.7, sound.sfx, 0.002);
    } catch (e) { /* */ }
  },
  // un fredonnement très bas (le cercle, la nuit) ; une note de valse au loin
  fredonner() { if (!this.ok()) return; try { const t = sound.at(); [196, 220, 174.6, 196].forEach((f, i) => sound.tone(t + i * 0.9, 'sine', f, f * 0.998, 1.1, 0.012, sound.sfx, 0.25)); } catch (e) { /* */ } },
};

// ---------------------------------------------------------------- les histoires
const hotelHistoires = {
  // ------------------------------------------------------------- l'état d'une histoire
  A(id) {
    const S = hotel18.S();
    const A = S.arcs[id];
    if (!A) return null;
    if (!A.faits || typeof A.faits !== 'object') A.faits = {};
    if (!A.choix || typeof A.choix !== 'object') A.choix = {};
    if (typeof A.e !== 'number') A.e = 0;
    return A;
  },
  ouvrir(id) {
    const S = hotel18.S();
    if (S.arcs[id]) return this.A(id);
    S.arcs[id] = { e: 0, ouv: farm.s.day, faits: {}, choix: {}, fin: null };
    try { sound.quest && sound.quest(false); } catch (e) { /* */ }
    hotel18.voir('sys:l18_hotel', 'histoires');
    return this.A(id);
  },
  etape(id) { const A = this.A(id), D = L18_ARCS[id]; return A && !A.fin ? D.etapes[A.e] || null : null; },
  est(id, e) { const E = this.etape(id); return !!E && E.id === e; },
  fait(id, e) { const A = this.A(id); return !!(A && A.faits[e]); },
  // finir l'étape en cours (et passer à la suivante) ; attente : le jour avant lequel la suivante ne se fait pas
  avancer(id, attente) {
    const A = this.A(id), D = L18_ARCS[id];
    if (!A || A.fin) return;
    const E = D.etapes[A.e];
    if (E) A.faits[E.id] = farm.s.day;
    A.e++;
    if (attente) A.attente = farm.s.hours + attente;
    try { sound.quest && sound.quest(false); } catch (e) { /* */ }
    this.indice = 2.5;
  },
  finir(id, fin) {
    const A = this.A(id), D = L18_ARCS[id];
    if (!A) return;
    for (const E of D.etapes) if (!A.faits[E.id]) A.faits[E.id] = farm.s.day;
    A.e = D.etapes.length; A.fin = fin; A.finJ = farm.s.day;
    try { sound.quest && sound.quest(true); } catch (e) { /* */ }
  },
  attendre(id) { const A = this.A(id); return !!(A && A.attente && farm.s.hours < A.attente); },
  payer(n, objets) { if (n > 0) farm.earn(n); for (const k in objets || {}) farm.give(k, objets[k]); },
  signal(type, data) {
    // (le service et les portes préviennent les histoires)
    if (type === 'aile') { hotel18.S().flags.aileOuverte = true; }
    void data;
  },
  // ------------------------------------------------------------- l'embauche
  embaucher() {
    const S = hotel18.S();
    if (S.embauche) return;
    S.embauche = farm.s.day;
    S.rep = Math.max(S.rep, 2);
    hotel18.lier('directeur', 6); hotel18.lier('gaspard', 8);
    hotel18.voir('sys:l18_hotel'); hotel18.voir('sys:l18_hotel', 'metier');
    if (!farm.count('l18_clefs')) farm.give('l18_clefs', 1);
    hotelScenes.jouer('embauche');
    setTimeout(() => hotel18.dire('M. Brissac', 'Votre mansarde est au dernier étage, la première à gauche. Le service se prend à la loge, de sept heures à sept heures. Gaspard vous expliquera le reste.', 8), 400);
  },
  // ------------------------------------------------------------- une ligne particulière, selon l'histoire
  ligne(id) {
    const S = hotel18.S();
    if (id === 'comtesse') {
      const A = this.A('lucien');
      if (A && A.fin === 'reste') return 'Je regarde toujours la route, le soir. Mais je ne l’attends plus : je lui tiens compagnie. C’est très différent, vous savez.';
      if (A && A.fin) return '';
      if (this.est('lucien', 'montre') && farm.count('l18_montre')) return 'Vous avez une drôle de figure. Vous avez trouvé quelque chose. Pas ici : sur la terrasse, au coucher du soleil. Je veux voir la route en l’apprenant.';
    }
    if (id === 'firmin') {
      const A = this.A('firmin');
      if (A && A.fin === 'reste') return 'Bonjour, second ! Euh, je veux dire : bonjour, chef. Gaspard dit que je dois dire « chef ». Ça me plaît bien.';
      if (this.est('firmin', 'boite') && !A.faits.boite) return 'Elle était sous mon lit, ma boîte. Avec tout dedans. Maintenant elle est plus là. Quelqu’un me l’a prise, ou alors elle est partie à Paris sans moi.';
    }
    if (id === 'wolanski') {
      const A = this.A('symphonie');
      if (A && A.fin === 'reste') return 'Tous les soirs, je joue le quatrième mouvement, très bas. Les clients croient que c’est une berceuse. Ils dorment comme des enfants. Je ne leur dis pas ce que c’est.';
      if (A && A.ecrit && farm.s.day <= A.ecrit) return '(Il écrit. Il ne lève pas la tête. Des feuilles partout, sur le lit, sur le balcon, dans la baignoire.)';
    }
    if (id === 'chef' && this.A('treize') && this.A('treize').fin === 'descendu') return 'Je fais toujours un plateau de trop, le soir. Je le mange. Il ne faut pas perdre les bonnes habitudes.';
    void S;
    return '';
  },
  // ------------------------------------------------------------- les options d'histoire, quand on parle à quelqu'un
  options(id) {
    const S = hotel18.S(), opts = [], h = hotel18.heure();
    if (!S.embauche) return opts;
    const O = (label, fn) => opts.push({ label, fn: () => { try { fn(); } catch (e) { console.error('L18 histoire', e); } } });
    // ---- Lucien (la comtesse)
    if (id === 'comtesse') {
      const A = this.A('lucien');
      if (!A && S.rep >= L18_ARCS.lucien.rep) O('« Madame, vous attendez quelqu’un ? »', () => this.lucienOuvrir());
      else if (A && !A.fin) {
        if (this.est('lucien', 'montre') && farm.count('l18_montre')) {
          if (hotel18.dans(h, [16.5, 21.5])) O('Lui montrer la montre', () => { ui.close(); this.lucienMontre(); });
        }
        if (this.est('lucien', 'adieu') && !this.attendre('lucien') && hotel18.dans(h, [6, 11])) O('« Bonjour, madame. »', () => { ui.close(); this.lucienAdieu(); });
        if (this.est('lucien', 'auberge')) O('« Que faisait Lucien, dans la vallée ? »', () => hotel18.dire('La comtesse', 'Il levait des cartes. Les pierres, les failles, les sources. Il logeait en bas, à l’auberge de Valbrume, avant de monter ici… non, il n’est jamais monté ici. Je crois qu’il avait peur que je vienne.', 7));
      }
    }
    // ---- Firmin
    if (id === 'firmin') {
      const A = this.A('firmin');
      if (!A) O('« Tu as l’air triste, Firmin. »', () => { this.ouvrir('firmin'); hotel18.dire('Firmin', 'Ma boîte. Ma boîte à biscuits, avec mes sous, mes cartes postales. Elle était sous mon lit et elle y est plus. Je l’ai dit à personne : on va croire que je l’ai vendue.', 7); ui.close(); });
      else if (!A.fin) {
        if (this.est('firmin', 'boite') && farm.count('l18_boite')) O('Lui rendre sa boîte', () => { ui.close(); farm.take('l18_boite', 1); hotel18.lier('firmin', 10); this.avancer('firmin'); hotel18.dire('Firmin', 'Ma boîte ! Mlle Fauvel ?! Elle l’a… et elle vous l’a rendue ? Elle a dit quoi ? … Elle a dit ça ? Elle ?', 6); });
        if (this.est('firmin', 'examen')) O('« Récite-moi ce qu’un groom doit savoir. »', () => this.firminExamen());
        if (this.est('firmin', 'lettre') && farm.count('l18_recommandation')) O('Lui donner la lettre de recommandation', () => { ui.close(); farm.take('l18_recommandation', 1); hotel18.lier('firmin', 8); this.avancer('firmin', 10); hotel18.dire('Firmin', '« Le soussigné certifie que le jeune Firmin Lebrun… » C’est moi ! C’est écrit ! Je vais la mettre dans la boîte, avec l’Opéra.', 6); });
        if (this.est('firmin', 'choix') && !this.attendre('firmin')) {
          O('« Va à Paris, Firmin. »', () => { ui.close(); const A2 = this.A('firmin'); A2.choix.paris = true; this.avancer('firmin', 6); hotel18.dire('Firmin', 'Vous croyez ? … Vous croyez vraiment ? Alors demain. Demain matin, la voiture de Baptiste, le train à Valbrume… Vous viendrez me dire au revoir ?', 7); });
          O('« Reste ici. Tu seras concierge, un jour ; et j’ai besoin d’un second. »', () => { ui.close(); const A2 = this.A('firmin'); A2.choix.paris = false; this.avancer('firmin', 6); hotel18.dire('Firmin', 'Un second… Moi ? Avec un gilet à boutons dorés ? … Paris attendra. Paris, ça ne bouge pas. Demain matin, alors : vous me montrerez les clés ?', 7); });
        }
        if (this.est('firmin', 'fin') && !this.attendre('firmin') && hotel18.dans(h, [6, 10])) O('« C’est le matin, Firmin. »', () => { ui.close(); this.firminFin(); });
      }
    }
    if (id === 'odile' && this.est('firmin', 'boite') && !farm.count('l18_boite') && !this.fait('firmin', 'boite')) O('« Avez-vous vu une boîte à biscuits rouge ? »', () => this.odileBoite());
    if (id === 'directeur' && this.est('firmin', 'lettre') && !farm.count('l18_recommandation')) O('« Firmin voudrait une lettre de recommandation. »', () => this.directeurLettre());
    // ---- La symphonie
    if (id === 'wolanski') {
      const A = this.A('symphonie');
      if (!A && S.rep >= L18_ARCS.symphonie.rep) O('« Vous cherchez quelque chose, au piano ? »', () => this.symphonieOuvrir());
      else if (A && !A.fin) {
        const E = this.etape('symphonie');
        if (E && ['eau', 'cloches', 'vent', 'silence'].includes(E.id)) O('« Où en est la symphonie ? »', () => hotel18.dire('M. Wolański', `Il me manque ${['eau', 'cloches', 'vent', 'silence'].filter((k) => !A.faits[k]).map((k) => ({ eau: 'l’eau', cloches: 'les cloches', vent: 'le vent', silence: 'le silence' })[k]).join(', ')}. Allez écouter pour moi. Écrivez tout dans le carnet, même ce que vous n’entendez pas.`, 7));
        if (this.est('symphonie', 'ecrire') && farm.count('l18_carnet')) O('Lui rendre le carnet', () => { ui.close(); this.symphonieCarnet(); });
        if (this.est('symphonie', 'preparer') && !this.attendre('symphonie')) O('« Et maintenant ? »', () => this.symphoniePreparer());
      }
    }
    if (this.est('symphonie', 'preparer') && !this.attendre('symphonie')) {
      const A = this.A('symphonie');
      if (A.choix.jouer !== undefined) {
        if (id === 'directeur' && !A.choix.dir) O('« Un concert, dans la salle de bal, demain soir. »', () => { A.choix.dir = 1; hotel18.dire('M. Brissac', 'Un concert ? De ce monsieur qui tousse ? … Le préfet aime la musique. Le préfet n’est pas là. Bon. Mais je veux des lis.', 6); this.symphoniePret(); ui.close(); });
        if (id === 'chef' && !A.choix.chef) O('« Un buffet, demain soir, pour un concert. »', () => { A.choix.chef = 1; hotel18.dire('Le chef Mercadier', 'Un buffet. Pour des gens qui vont écouter de la musique au lieu de manger. Je ferai des choses qui se mangent sans bruit.', 6); this.symphoniePret(); ui.close(); });
        if (id === 'gaspard' && !A.choix.gaspard) O('« Les invitations, pour le concert de demain. »', () => { A.choix.gaspard = 1; hotel18.dire('Gaspard', 'Une carte sous chaque porte, à la plume. Je n’ai pas fait ça depuis le bal de 1880. Vous me rendez trente ans, savez-vous.', 6); this.symphoniePret(); ui.close(); });
      }
    }
    // ---- La treize
    if (id === 'gaspard') {
      const A = this.A('treize');
      if (!A && this.treizeOuvrable()) O('« Gaspard… la treizième sonnette ? »', () => { ui.close(); this.ouvrir('treize'); if (hotel18.S().flags.treizeSonne) this.avancer('treize'); hotel18.dire('Gaspard', 'Vous l’avez remarquée. Les clients ne la remarquent pas. Elle sonne la nuit, parfois, depuis l’ouverture. Il n’y a pas de fil derrière. Lisez le registre, les vieilles pages. Et ne me demandez pas ce que j’en pense : je pense que je suis vieux.', 9); });
    }
    if (id === 'chef' && this.est('treize', 'plateau') && this.A('treize').vu) O('« Pour qui est le plateau de onze heures ? »', () => this.chefConfession());
    return opts;
  },
  treizeOuvrable() { const S = hotel18.S(); return S.embauche && (S.rep >= L18_ARCS.treize.rep || this.fait('firmin', 'aile')); },
  // ------------------------------------------------------------- Lucien
  lucienOuvrir() {
    ui.choice('La comtesse de Saint-Aubin', 'J’attends mon fils. Lucien. Vingt-huit ans, géologue, des yeux qui ne regardaient que les cailloux. Il est venu lever la carte des Monts il y a deux étés, et il n’est pas redescendu. J’écris au préfet chaque matin. Le préfet ne répond plus. Vous, vous répondriez ?', [
      { label: '« Je ferai ce que je peux, madame. »', fn: () => { ui.close(); this.ouvrir('lucien'); farm.give('l18_lettre_comtesse', 1); hotel18.lier('comtesse', 8); hotel18.dire('La comtesse', 'Alors commencez par ceci : ma lettre du jour. La poste de Valbrume. Et regardez autour de vous, en bas. Quelqu’un a dû le voir.', 6); } },
      { label: '« Pas maintenant. »', fn: () => { ui.close(); hotel18.dire('La comtesse', 'Personne n’a jamais le temps. Moi, j’en ai trop.', 3.5); } },
    ]);
  },
  lucienMontre() {
    const A = this.A('lucien');
    hotelScenes.jouer('montre').then(() => {
      ui.choice('La comtesse', 'Elle tient la montre ouverte, au creux de la main, comme un oiseau. « Ne me mentez pas. Est-il mort ? »', [
        { label: '« Il a passé la Grande Porte. On n’en revient pas souvent ; on n’y meurt pas toujours. »', fn: () => { ui.close(); A.choix.montre = 'espoir'; this.lucienLettre('Alors il est de l’autre côté. Vivant, peut-être. Égaré, sûrement : il s’est toujours égaré en chemin.'); } },
        { label: '« Je crois qu’il est mort, madame. Je suis désolé. »', fn: () => { ui.close(); A.choix.montre = 'deuil'; this.lucienLettre('Merci. Vous êtes le premier qui ose. Le préfet écrit « disparu ». Disparu, c’est un mot pour les choses, pas pour les fils.'); } },
        { label: '« Je ne sais pas. »', fn: () => { ui.close(); A.choix.montre = 'doute'; this.lucienLettre('C’est la vérité. C’est la seule chose qu’on m’ait dite depuis deux ans qui ne soit pas polie.'); } },
      ]);
    });
  },
  lucienLettre(rep) {
    farm.take('l18_montre', 1);
    hotel18.lier('comtesse', 15);
    this.avancer('lucien');
    farm.give('l18_derniere_lettre', 1);
    hotel18.dire('La comtesse', rep, 7);
    setTimeout(() => hotel18.dire('La comtesse', 'Gardez la montre ? Non. Je la garde. Mais prenez ceci : une lettre pour lui. Portez-la à cette Porte. Sur le seuil, si vous avez peur ; de l’autre côté, si vous n’avez plus peur de rien.', 9), 7600);
  },
  lucienAdieu() {
    const A = this.A('lucien'), espoir = A.choix.montre === 'espoir', loin = !!A.choix.audela;
    const fin = espoir || loin ? 'reste' : 'part';
    hotelScenes.jouer('comtesse_fin', { fin, loin }).then(() => {
      this.finir('lucien', fin);
      this.payer(160, { boussole: 1 });
      hotel18.lier('comtesse', 20);
      hotelService.reputation(5);
      hotel18.dire('', '(La comtesse vous a laissé la boussole de Lucien, et une enveloppe : cent soixante pièces, « pour vos souliers ».)', 6);
      if (fin === 'part') hotel18.S().flags.comtessePartie = farm.s.day;
    });
  },
  // ------------------------------------------------------------- Firmin
  odileBoite() {
    ui.choice('Mlle Fauvel', 'Une boîte rouge ? Dans l’armoire à linge du deuxième, entre les taies. Avec de l’argent dedans, et des images. Un client aurait pu croire à un vol. Je l’ai mise de côté. Elle est à qui ?', [
      { label: '« À Firmin. Il économise pour partir à Paris. »', fn: () => { ui.close(); farm.give('l18_boite', 1); hotel18.lier('odile', 12); hotel18.dire('Mlle Fauvel', 'Paris. … Moi, c’était Lyon. Institutrice. Tenez, rendez-la-lui. Et dites-lui de ne pas la cacher dans mon linge : c’est le premier endroit où l’on cherche, quand on veut partir.', 8); } },
      { label: '« Je ne sais pas. Je vais demander. »', fn: () => { ui.close(); hotel18.dire('Mlle Fauvel', 'Demandez. Et revenez avec un nom.', 3); } },
    ]);
  },
  firminExamen() {
    const Q = [
      ['Quelle chambre a le balcon d’honneur, au premier ?', ['La 108', 'La 113', 'La 101'], 0],
      ['À quelle heure monte le premier funiculaire ?', ['Six heures', 'Huit heures', 'Quand Joseph se réveille'], 0],
      ['Un client sonne au 204 pendant que la 108 vous parle. Que fait-on ?', ['On finit avec la 108, et on monte vite au 204', 'On court au 204', 'On fait semblant de ne rien entendre'], 0],
      ['Qui sonne la treizième sonnette ?', ['Personne. Il n’y a pas de 13.', 'Le vent', 'Gaspard, pour rire'], 0],
    ];
    let bons = 0, i = 0;
    const suivante = () => {
      if (i >= Q.length) {
        ui.close();
        if (bons >= 3) { hotel18.lier('firmin', 6); this.avancer('firmin'); hotel18.dire('Firmin', `${bons} sur ${Q.length} ! Je suis un groom de Paris ! Enfin, un groom qui pourrait l’être. Maintenant il me faut une lettre, du directeur. Vous lui demanderez ? Moi il me fait peur.`, 7); }
        else hotel18.dire('Firmin', `${bons} sur ${Q.length}… Vous êtes sûr que c’est vous le concierge ? On recommence quand vous voulez.`, 5);
        return;
      }
      const [q, R, ok] = Q[i];
      const L = R.map((r, k) => ({ r, k })), rnd = mulberry32((farm.s.day * 31 + i) >>> 0);
      for (let a = L.length - 1; a > 0; a--) { const b = Math.floor(rnd() * (a + 1)); [L[a], L[b]] = [L[b], L[a]]; }
      ui.choice('Firmin récite', `« ${q} » — C’est vous qui me corrigez, hein. Vous dites la bonne réponse.`, L.map((o) => ({ label: o.r, fn: () => { if (o.k === ok) bons++; i++; suivante(); } })));
    };
    suivante();
  },
  directeurLettre() {
    const S = hotel18.S();
    if (S.rep < 25) { ui.close(); hotel18.dire('M. Brissac', 'Une lettre ? Pour un groom ? On recommande un homme, pas un garçon. Quand vous serez concierge en titre, et non plus stagiaire, votre parole vaudra la mienne : revenez me voir ce jour-là.', 8); return; }
    ui.choice('M. Brissac', 'Pour Firmin ? … Il porte bien. Il parle trop. Il est honnête : il m’a rapporté un louis trouvé dans un lit, et vous savez combien de grooms font ça ? Aucun. Je l’écris. Mais vous signez avec moi : si Paris nous le renvoie, c’est vous qui l’aurez voulu.', [
      { label: 'Signer', fn: () => { ui.close(); farm.give('l18_recommandation', 1); hotel18.lier('directeur', 6); hotel18.dire('M. Brissac', 'Voilà. Le Grand Hôtel du boulevard des Capucines. Ils me connaissent, là-bas. Ils me connaissaient.', 5); } },
      { label: '« Laissez-moi y réfléchir. »', fn: () => ui.close() },
    ]);
  },
  firminFin() {
    const A = this.A('firmin'), paris = !!A.choix.paris;
    hotelScenes.jouer(paris ? 'firmin_depart' : 'firmin_reste').then(() => {
      this.finir('firmin', paris ? 'paris' : 'reste');
      hotel18.lier('firmin', 20); hotel18.lier('gaspard', 6);
      hotelService.reputation(4);
      if (paris) { hotel18.S().flags.firminParti = farm.s.day; this.payer(0, {}); }
      else this.payer(60, {});
      hotel18.dire('', paris ? '(La loge est plus calme, sans lui. Trop calme.)' : '(Firmin a épinglé à son revers une petite clef de laiton. Gaspard lui a donné la sienne, la plus vieille. Et à vous, une enveloppe : soixante pièces, « pour le second ».)', 6);
    });
  },
  // ------------------------------------------------------------- la symphonie
  symphonieOuvrir() {
    ui.choice('M. Wolański', 'Je cherche le premier accord. Depuis un an. Je l’entends presque. Il est fait de ce pays, et je ne peux plus marcher dans ce pays. Vous, vous marchez. Écoutez pour moi : l’eau qui tombe, à l’aube ; les cloches de midi ; le vent du col, la nuit ; et le silence des pierres, à minuit. Rapportez-moi ce que vous entendez. Je ferai le reste. Il me reste assez de souffle pour le reste.', [
      { label: '« Donnez-moi votre carnet. »', fn: () => { ui.close(); this.ouvrir('symphonie'); farm.give('l18_carnet', 1); hotel18.lier('wolanski', 10); hotel18.dire('M. Wolański', 'Écrivez avec des mots. Je traduirai. La musique, c’est ce qui reste quand les mots ont fini de parler.', 6); } },
      { label: '« Je ne connais rien à la musique. »', fn: () => { ui.close(); hotel18.dire('M. Wolański', 'Tant mieux. Les musiciens n’écoutent rien : ils attendent leur tour.', 4); } },
    ]);
  },
  // les quatre écoutes : il suffit d'être là, à l'heure, avec le carnet
  ECOUTES: {
    eau: { r: 30, texte: ['(L’eau tombe. D’abord, un bruit blanc ; puis, en écoutant mieux, cent voix qui se recouvrent : la chute, le bouillon, le filet qui coule de la mousse.)', '(Sous tout cela, une note grave, toujours la même, comme si la montagne respirait par la cascade. Vous l’écrivez dans le carnet : « un la, très bas, qui ne s’arrête jamais ».)'] },
    cloches: { r: 45, texte: ['(Midi. La cloche de Valbrume, douze coups, et après le douzième, le bourdonnement qui reste dans l’air, longtemps.)', '(Vous écrivez : « Le treizième coup qu’on n’entend pas. Le bourdon tient la place. »)'] },
    vent: { r: 45, texte: ['(La nuit, au col. Le vent passe entre les pierres comme dans une flûte de berger : trois notes, toujours les mêmes, montantes.)', '(Une quatrième, parfois, plus haut. Vous ne savez pas si c’est le vent. Vous l’écrivez quand même.)'] },
    silence: { r: 20, texte: ['(Minuit, au cercle. Le silence est si complet que vous entendez votre sang.)', '(Et puis, dans le silence, une voix. Pas une voix : un fredonnement, très bas, qui monte des pierres. Quatre notes, une phrase qui ne finit pas.)', '(Vous l’écrivez. Votre main tremble. Le fredonnement s’arrête quand vous levez le crayon, comme quelqu’un qui s’aperçoit qu’on l’écoute.)'] },
  },
  ecouter(k) {
    const A = this.A('symphonie'), E = this.ECOUTES[k];
    if (!A || A.faits[k]) return;
    A.faits[k] = farm.s.day;
    E.texte.forEach((t, i) => setTimeout(() => hotel18.dire('', t, 7), i * 7200));
    if (k === 'silence') { sonL18.fredonner(); hotel18.S().flags.silenceEntendu = farm.s.day; }
    if (k === 'cloches') try { sound.bell && sound.bell(0.6); } catch (e) { /* */ }
    if (k === 'vent') try { sound.wind1 && sound.wind1(); } catch (e) { /* */ }
    // quand les quatre sont là : l'étape « écrire »
    const D = L18_ARCS.symphonie.etapes;
    if (['eau', 'cloches', 'vent', 'silence'].every((q) => A.faits[q])) A.e = D.findIndex((q) => q.id === 'ecrire');
    else A.e = D.findIndex((q) => ['eau', 'cloches', 'vent', 'silence'].includes(q.id) && !A.faits[q.id]);
    try { sound.page && sound.page(); } catch (e) { /* */ }
  },
  symphonieCarnet() {
    farm.take('l18_carnet', 1);
    const A = this.A('symphonie');
    A.ecrit = farm.s.day + 1;
    hotel18.lier('wolanski', 12);
    this.avancer('symphonie', 20);
    hotel18.dire('M. Wolański', 'Le la de la cascade… le bourdon après midi… trois notes au col… Et ça. Ça, au cercle. Vous avez entendu ça ? … Laissez-moi. Revenez après-demain. Non : revenez demain soir. Non. Laissez-moi.', 9);
  },
  symphoniePreparer() {
    const A = this.A('symphonie');
    if (A.choix.jouer !== undefined) { ui.close(); hotel18.dire('M. Wolański', 'Le directeur, le chef, Gaspard. Quand tout le monde dira oui, je jouerai. Un orchestre ? Non. Un piano. La vallée n’a pas besoin d’orchestre : elle en est un.', 7); return; }
    ui.choice('M. Wolański', 'C’est écrit. Quatre mouvements. Il faut la jouer, maintenant, devant des gens : une symphonie qu’on ne joue pas, c’est une lettre qu’on garde dans sa poche. Dans la salle de bal. Mais le quatrième… ce que vous avez entendu au cercle. Je le joue ?', [
      { label: '« Jouez-le. C’est pour cela qu’on est montés si haut. »', fn: () => { ui.close(); A.choix.jouer = true; hotel18.dire('M. Wolański', 'Oui. Il le faut. On ne peut pas laisser une phrase comme ça sans personne pour la finir.', 5); } },
      { label: '« Non. Il y a des choses qu’on ne rejoue pas. »', fn: () => { ui.close(); A.choix.jouer = false; hotel18.dire('M. Wolański', 'Gaspard m’a dit la même chose, avec les mêmes yeux. Bon. Trois mouvements, et un silence à la place du quatrième. Le silence, je sais l’écrire.', 7); } },
    ]);
  },
  symphoniePret() {
    const A = this.A('symphonie');
    if (A.choix.dir && A.choix.chef && A.choix.gaspard) { this.avancer('symphonie', 6); hotel18.dire('Gaspard', 'Demain soir, neuf heures, la salle de bal. Mettez votre plus beau gilet.', 5); }
  },
  concert() {
    const A = this.A('symphonie'), jouer = !!A.choix.jouer;
    hotelScenes.jouer('concert', { jouer }).then(() => {
      this.finir('symphonie', jouer ? 'reste' : 'vienne');
      this.payer(180, { l18_partition: 1 });
      hotel18.lier('wolanski', 25);
      hotelService.reputation(6);
      hotel18.dire('M. Wolański', jouer ? 'J’ai cherché une patrie pendant vingt-trois ans. Elle était au bout d’un funiculaire. Je reste. Je jouerai le soir, très bas. (Le manuscrit vous est dédié, et une enveloppe : cent quatre-vingts pièces, « la recette ».)' : 'Vienne me réclame : trois mouvements, ça se joue partout. Le quatrième, je l’ai laissé ici, dans le silence de la salle. Je reviendrai le chercher. (Le manuscrit vous est dédié, et une enveloppe : cent quatre-vingts pièces.)', 10);
      if (!jouer) hotel18.S().flags.wolanskiParti = farm.s.day + 1;
    });
  },
  // ------------------------------------------------------------- la treize
  chefConfession() {
    const A = this.A('treize');
    ui.choice('Le chef Mercadier', 'Il pose sa louche. Longtemps. « Mon grand-père s’appelait Barthélemy Mercadier. En 1854, il est monté au col avec douze autres, pour chercher une petite qui s’était perdue dans la neige. Mariette. Douze sont redescendus. Le treizième, c’était le berger, Étienne Rouvière. On le recense encore. Il n’est pas mort : il n’est pas redescendu. Mon grand-père lui a monté à manger tant qu’il a pu marcher ; puis mon père ; puis moi. Quand ils ont bâti l’hôtel, ils l’ont bâti sur sa bergerie. L’aile Nord, c’est sa bergerie. En 1871, une cliente l’a vu. Ils ont fermé l’aile. » Il vous regarde. « Le directeur paie la treize, chaque année, de sa poche. Il croit que c’est un fou. Je ne l’ai jamais détrompé. »', [
      { label: '« Je ne dirai rien. »', fn: () => { ui.close(); A.choix.secret = true; hotel18.lier('chef', 15); this.chefSuite('Merci. Tenez : la page du recensement, recopiée par mon grand-père. Et la clé. Il frappe deux fois, Étienne : moi, je ne parle pas. Vous, parlez-lui. Il y a cinquante ans que personne ne lui parle.'); } },
      { label: '« Le directeur a le droit de savoir. »', fn: () => { ui.close(); A.choix.secret = false; hotel18.lier('chef', 4); hotel18.lier('directeur', 6); this.chefSuite('Le directeur ? Il sait. Il fait semblant de ne pas savoir, ça lui coûte moins cher. Allez-y. Tenez : la page du recensement, et la clé. Frappez à sa porte. Et ne lui mentez pas : il a eu assez de froid.'); } },
    ]);
  },
  chefSuite(txt) {
    farm.give('l18_registre54', 1);
    if (!farm.count('l18_cle_aile')) farm.give('l18_cle_aile', 1);
    this.avancer('treize');
    hotel18.dire('Le chef Mercadier', txt, 9);
  },
  porteTreize(dr) {
    const A = this.A('treize');
    if (A && this.est('treize', 'porte')) { this.treizePorte(); return true; }
    if (A && this.est('treize', 'rendre') && farm.count('l18_cheval')) { this.treizeRendre(dr); return true; }
    if (A && (A.fin === 'veille' || this.est('treize', 'fin'))) { hotel18.dire('Étienne', pick(['Entrez. Vous avez froid ? Moi non plus.', 'Le col est clair, ce soir. On voit jusqu’à la spirale.']), 4); return true; }
    if (A && A.fin === 'descendu') { hotel18.dire('', '(La chambre est vide. Le lit est fait. Sur l’oreiller, un brin d’herbe d’estive.)', 4); return true; }
    if (A) { try { sound.knock && sound.knock(2); } catch (e) { /* */ } hotel18.dire('Une voix, derrière la porte', 'Pas maintenant. La neige tombe, là-haut. Je l’entends.', 4); return true; }
    return false;
  },
  treizePorte() {
    try { sound.knock && sound.knock(2); } catch (e) { /* */ }
    hotelScenes.jouer('treize_porte').then(() => {
      ui.choice('Une voix, derrière la porte', '« Je m’appelle Étienne Rouvière. J’étais berger, à l’estive. La petite Mariette, la fille du meunier, s’était perdue dans la neige, au col. On est montés à treize. Douze sont redescendus, quand il a fait nuit. Moi, j’ai cherché. Je cherche encore. Elle avait un petit cheval de bois, que je lui avais taillé, avec un ruban rouge. Si je retrouvais le cheval, je saurais. Le glacier rend ce qu’il prend, vous savez : quand on le lui demande au lever du jour, au milieu de la spirale. Je la retrace chaque hiver, la spirale. Je n’ai jamais eu le courage de demander. »', [
        { label: '« J’irai demander pour vous. »', fn: () => { ui.close(); this.avancer('treize'); hotel18.lier('treize', 12); hotel18.dire('Étienne', 'Au lever du jour. Au milieu. Et ne vous retournez pas, si l’on rit derrière vous : c’est elle. Elle riait tout le temps.', 7); } },
        { label: '« Vous êtes mort, monsieur ? »', fn: () => { ui.close(); hotel18.dire('Étienne', 'Je ne crois pas. Les morts ont chaud, il paraît. … J’irais bien demander moi-même, mais je ne peux pas redescendre sans elle, et je ne peux pas monter sans redescendre. Vous comprenez ? Non. Moi non plus.', 8); } },
      ]);
    });
  },
  treizeRendre(dr) {
    const A = this.A('treize'), S = hotel18.S();
    dr.locked = false; dr.open = 1; S.flags.treizeOuverte = true;
    try { sound.door && sound.door(true); } catch (e) { /* */ }
    A.vuEtienne = farm.s.day;
    setTimeout(() => {
      ui.choice('Étienne Rouvière', 'La porte s’ouvre seule. Un homme est assis face à la fenêtre aveuglée, un chapeau de berger sur les genoux, du givre dans la barbe. Il ne se retourne pas. « Vous l’avez. Je l’entends : le ruban craque. » Il tend la main sans regarder. Elle est bleue de froid. « Si je le prends, je saurai qu’elle est en bas, au chaud, depuis longtemps. Et je pourrai descendre. Mais si je descends… qui veillera le col ? Il faut toujours que quelqu’un veille, ici. Vous le savez, vous qui veillez une loge. »', [
        { label: 'Lui donner le cheval. « Descendez. Le col se veillera seul. »', fn: () => { ui.close(); farm.take('l18_cheval', 1); A.choix.fin = 'descendu'; this.avancer('treize', 4); hotel18.lier('treize', 30); hotel18.dire('Étienne', 'Mariette… Le ruban. Je le lui avais noué moi-même. … Demain, au lever du jour. Je descendrai par le chemin des mulets. Dites à Auguste de ne plus faire de plateau. Dites-lui merci. Dites-le à son père, et au père de son père. Il comprendra.', 10); } },
        { label: 'Lui donner le cheval. « Restez, si vous voulez. Je viendrai vous voir. »', fn: () => { ui.close(); farm.take('l18_cheval', 1); A.choix.fin = 'veille'; this.avancer('treize', 4); hotel18.lier('treize', 30); hotel18.dire('Étienne', 'Rester… Oui. Maintenant que je sais, je peux veiller sans chercher. C’est très différent : on regarde la neige au lieu de la fouiller. Venez, le soir. Auguste montera deux plateaux. Ça lui fera plaisir, il ne l’avouera pas.', 10); } },
      ]);
    }, 900);
  },
  treizeFin() {
    const A = this.A('treize'), fin = A.choix.fin || 'descendu';
    hotelScenes.jouer('treize_fin', { fin }).then(() => {
      this.finir('treize', fin);
      hotel18.lier('chef', 12); hotel18.lier('gaspard', 8);
      hotelService.reputation(6);
      if (fin === 'descendu') { this.payer(200, {}); hotel18.S().flags.treizeParti = farm.s.day; hotel18.dire('M. Brissac', 'L’aile Nord rouvrira au printemps. Je ne sais pas ce que vous avez fait, et je ne veux pas le savoir. (Une enveloppe : deux cents pièces, « pour les travaux ».)', 8); }
      else { this.payer(120, { tarte_baies: 2 }); hotel18.dire('Le chef Mercadier', 'Deux plateaux, ce soir. Et un pour vous, si vous montez. (Cent vingt pièces dans une serviette pliée, et deux tartes aux baies.)', 7); }
    });
  },
  // ------------------------------------------------------------- les lieux des histoires : un éclat d'or, on fait E (ou il suffit d'être là)
  lieux() {
    const S = hotel18.S(), L = [];
    if (!S.embauche) return L;
    const w = hotel18.monde();
    const P = (k) => { const q = w && w.lm && w.lm[k]; return q ? [q.x, w.heightAt(q.x, q.z), q.z] : null; };
    const E1 = this.etape('lucien');
    if (E1 && E1.lieu && !this.attendre('lucien')) {
      let p = P(E1.lieu);
      if (E1.lieu === 'grande_porte' && w.v1porte) { const st = w.v1porte.stele; p = st ? [st[0], st[1], st[2]] : p; }
      if (p) L.push({ arc: 'lucien', e: E1.id, p, r: 3.2 });
    }
    const E3 = this.etape('treize');
    if (E3 && E3.id === 'glacier') { const p = this.spirale(); if (p) L.push({ arc: 'treize', e: 'glacier', p, r: 4, quand: E3.quand }); }
    return L;
  },
  spirale() {
    const w = hotel18.monde();
    const s = (typeof VALLEY_DESIGN !== 'undefined' ? VALLEY_DESIGN.sigils : []).find((q) => q[2] === 'spirale' && q[4] === 'neige');
    return s && w ? [s[0], w.heightAt(s[0], s[1]), s[1]] : null;
  },
  // les écoutes de la symphonie : où, et quelle fenêtre
  ecoutes() {
    const A = this.A('symphonie');
    if (!A || A.fin || !farm.count('l18_carnet')) return [];
    const w = hotel18.monde(), L = [];
    for (const E of L18_ARCS.symphonie.etapes) {
      if (!this.ECOUTES[E.id] || A.faits[E.id]) continue;
      const q = w.lm[E.lieu];
      if (q) L.push({ k: E.id, x: q.x, z: q.z, r: this.ECOUTES[E.id].r + (q.r || 0) * 0.3, quand: E.quand });
    }
    return L;
  },
  cibler(eye, f, cand) {
    for (const Q of this.lieux()) {
      if (Q.quand && !hotel18.dans(hotel18.heure(), Q.quand)) continue;
      const dx = Q.p[0] - eye[0], dz = Q.p[2] - eye[2], d = Math.hypot(dx, dz);
      if (d > Q.r || Math.abs(Q.p[1] + 1 - eye[1]) > 4) continue;
      cand({ kind: 'hook', use: () => this.lieu(Q.arc, Q.e) }, Math.max(0.5, d));
    }
  },
  dessiner(buf, cam) {
    for (const Q of this.lieux()) {
      if (Math.abs(Q.p[0] - cam[0]) > 60 || Math.abs(Q.p[2] - cam[2]) > 60) continue;
      PE.buf = buf; PE.fl = FX_EMIT; PE.frame(Q.p[0], Q.p[1] + 0.05 + Math.sin(game.time * 2) * 0.03, Q.p[2], game.time * 0.7, 1);
      PE.bx(0, 0, 0, 0.1, 0.06, 0.1, L18C.or, TL.gold); PE.bx(0, 0.02, 0, 0.16, 0.02, 0.03, L18C.or, TL.gold); PE.fl = 0;
    }
  },
  lieu(arc, e) {
    if (arc === 'lucien') {
      if (e === 'poste') { if (!farm.take('l18_lettre_comtesse', 1)) { hotel18.dire('', '(Vous n’avez plus la lettre de la comtesse. Elle en écrit une chaque matin : demandez-la-lui.)', 4); return; } this.avancer('lucien'); hotel18.dire('La postière', 'Encore une pour la préfecture ? Elle en envoie depuis deux ans, la dame d’en haut. Son fils… Il est passé ici, vous savez. Il dormait à l’auberge. Demandez là-bas : ils se souviennent de tout, à l’auberge, sauf de ce qu’on leur doit.', 9); return; }
      if (e === 'auberge') { this.avancer('lucien'); hotel18.dire('L’aubergiste', 'Le géologue ? Redingote grise, des cailloux plein les poches, il payait en pièces neuves. Il passait ses soirées à la bibliothèque, à lire des vieux livres sur la Porte. Il disait qu’une porte, ça s’étudie comme une faille. Un matin il est parti par la route de Clairpré, avec un marteau et son carnet. Il a laissé sa chambre payée d’avance. Elle l’est toujours.', 11); return; }
      if (e === 'bibliotheque') { this.avancer('lucien'); farm.give('l18_croquis', 1); hotel18.dire('', '(Au registre des lecteurs : « L. de Saint-Aubin », six fois, toujours le même livre : « Des Portes de la vallée ». Entre deux pages, une feuille arrachée à un carnet : la Grande Porte, dessinée avec soin. En bas : « J’y serai à la Saint-Jean. L. »)', 9); return; }
      if (e === 'porte') { this.avancer('lucien'); farm.give('l18_montre', 1); hotel18.dire('', '(Sur la stèle, gravé au couteau, petit : « L. de S.-A. — 24 juin ». Et pendue à un clou du brasero, par sa chaîne, une montre d’argent, arrêtée à quatre heures dix. Dans le couvercle : « À Lucien, pour ses vingt ans. Ta mère. »)', 10); return; }
      if (e === 'seuil') { if (!farm.take('l18_derniere_lettre', 1)) { hotel18.dire('', '(Vous n’avez plus la lettre.)', 3); return; } this.avancer('lucien', 8); hotel18.dire('', '(Vous posez la lettre sur la plus haute marche, contre le vantail. Une pierre dessus, pour le vent. Quand vous vous retournez, au bas des marches, elle n’y est plus. Il n’y a pas de vent.)', 9); return; }
    }
    if (arc === 'treize' && e === 'glacier') {
      this.avancer('treize');
      farm.give('l18_cheval', 1);
      try { sound.dig && sound.dig(0.5); } catch (e2) { /* */ }
      hotel18.dire('', '(Vous creusez la neige au milieu de la spirale. Elle est tassée, fraîche, comme si on l’avait retracée cette nuit. À un bras de profondeur, un petit cheval de bois, un ruban rouge au cou.)', 8);
      setTimeout(() => hotel18.dire('', '(Derrière vous, quelqu’un rit. Un rire d’enfant, bref. Vous ne vous retournez pas.)', 6), 8200);
    }
  },
  // la treizième sonnette : la nuit, à la loge (une fois par nuit, au hasard) ; et pendant l'histoire de Firmin, dans l'aile
  sonner() {
    const S = hotel18.S(), V = hotel18.V(), w = hotel18.monde();
    S.flags.treizeSonne = farm.s.day;
    sonL18.timbre(true, 1.2);
    const q = w.props.find((p) => p.id === 'l18_sonnettes');
    if (q) { q.data = Object.assign({}, q.data, { vibre: 1 }); setTimeout(() => { q.data.vibre = 0; }, 2600); }
    if (this.est('treize', 'sonnette')) this.avancer('treize');
    void V;
  },
  sonnettes() {
    if (this.est('treize', 'sonnette') && hotel18.dans(hotel18.heure(), [22, 3])) { this.sonner(); hotel18.dire('', '(Au moment où vous approchez, le treizième timbre tinte, tout seul, deux fois. Le fil qui devrait monter vers les étages est coupé net, depuis longtemps.)', 7); return true; }
    return false;
  },
  coffre() { return false; },
  porteChambre() { return false; },
  // ------------------------------------------------------------- chaque seconde
  indice: 0,
  tic() {
    const S = hotel18.S(), s = farm.s, h = hotel18.heure(), p = game.player;
    if (!S.embauche || !p) return;
    // les écoutes : être là, à l'heure, avec le carnet
    for (const Q of this.ecoutes()) {
      if (!hotel18.dans(h, Q.quand)) continue;
      if (Math.hypot(p.pos[0] - Q.x, p.pos[2] - Q.z) < Q.r) this.ecouter(Q.k);
    }
    // la treizième sonnette, la nuit, quand on est près de la loge
    const V = hotel18.V();
    if (V && hotel18.dans(h, [22, 3]) && S.flags.sonneNuit !== s.day + (h < 12 ? -1 : 0)) {
      const L = V.inters.l18_loge;
      if (L && Math.hypot(p.pos[0] - L.x, p.pos[2] - L.z) < 9 && Math.abs(p.pos[1] - L.y) < 3 && Math.random() < (this.est('treize', 'sonnette') ? 0.08 : 0.01)) {
        S.flags.sonneNuit = s.day + (h < 12 ? -1 : 0);
        this.sonner();
        if (this.A('treize')) hotel18.dire('', '(Au tableau des sonnettes, le treizième timbre tinte. Deux fois.)', 4);
      }
    }
    // Lucien : la lettre passée de l'autre côté (on est entré dans la Zone avec)
    if (this.est('lucien', 'seuil') && farm.count('l18_derniere_lettre') && typeof zone !== 'undefined' && zone.dedans) { farm.take('l18_derniere_lettre', 1); this.A('lucien').choix.audela = true; this.avancer('lucien', 8); hotel18.dire('', '(De l’autre côté de la Porte, vous posez la lettre sur la première pierre plate. La cendre ne la recouvre pas. Elle vous attendra : elle attendra qui elle doit attendre.)', 9); }
    // Firmin : la nuit de l'aile (l'étape s'ouvre deux jours après la lettre, la nuit)
    if (this.est('firmin', 'aile') && !this.attendre('firmin')) {
      const A = this.A('firmin');
      if (!A.fugue && hotel18.dans(h, [22, 4]) && hotel18.dedans()) {
        A.fugue = s.day; S.flags.aileOuverte = true;
        const dr = hotel18.monde().doors[V.portes.aile]; if (dr) { dr.locked = false; dr.open = 1; }
        hotel18.dire('Gaspard', 'Le petit ! Firmin est entré dans l’aile. Il a pris la clé dans le bureau du directeur, pour faire le brave devant les garçons de cuisine. Il y a une heure qu’il n’est pas ressorti. Moi, je n’y entre pas. Je n’y entre plus.', 10);
      }
    }
    // la treize : être dans le couloir de service à onze heures du soir
    if (this.est('treize', 'plateau') && !this.A('treize').vu && hotel18.dans(h, [22.5, 23.9]) && V) {
      const piece = hotel18.pieceDu(p.pos[0], p.pos[1], p.pos[2]);
      if (piece === 'service' || piece === 'salon') { this.A('treize').vu = s.day; hotelScenes.jouer('plateau'); }
    }
    // la symphonie : le concert, le soir venu, dans la salle de bal
    if (this.est('symphonie', 'concert') && !this.attendre('symphonie') && hotel18.dans(h, [20.5, 23.5]) && V && hotel18.pieceDu(p.pos[0], p.pos[1], p.pos[2]) === 'bal' && !this.A('symphonie').joue) { this.A('symphonie').joue = s.day; this.concert(); }
    // la treize : au matin, la fin
    if (this.est('treize', 'fin') && !this.attendre('treize') && hotel18.dans(h, [5, 9]) && hotel18.distance() < 150) this.treizeFin();
    // un indice, quand une étape vient de s'ouvrir
    if (this.indice > 0) { this.indice -= 1; if (this.indice <= 0) this.montrerIndice(); }
  },
  montrerIndice() {
    for (const id of L18_ORDRE_ARCS) {
      const E = this.etape(id);
      if (E && !this.attendre(id) && typeof document !== 'undefined') {
        try { hotel18.dire('', '(' + L18_ARCS[id].titre + ' : ' + E.texte.charAt(0).toLowerCase() + E.texte.slice(1).replace(/\.$/, '') + '.)', 6); } catch (e) { /* */ }
        return;
      }
    }
  },
};

// ---------------------------------------------------------------- les gens, selon les histoires (surcharges)
hotelGens.surcharges.push((id, h) => {
  const S = hotel18.S(), H = hotelHistoires;
  if (id === 'comtesse' && S.flags.comtessePartie && farm.s.day > S.flags.comtessePartie) return { place: null, pose: 'absent' };
  if (id === 'wolanski' && S.flags.wolanskiParti && farm.s.day > S.flags.wolanskiParti) return { place: null, pose: 'absent' };
  if (id === 'firmin') {
    if (S.flags.firminParti && farm.s.day > S.flags.firminParti) return { place: null, pose: 'absent' };
    const A = H.A('firmin');
    if (A && H.est('firmin', 'aile') && A.fugue) return { place: 'n:treize_porte', pose: 'debout' };
    if (A && A.fin === 'reste' && h >= 7 && h < 19) return { place: 'loge_client3', pose: 'debout' };
  }
  if (id === 'treize') {
    const A = H.A('treize');
    if (A && A.vuEtienne && A.fin !== 'descendu' && !(A.choix.fin === 'descendu' && H.est('treize', 'fin'))) return { place: 'treize', pose: 'assis' };
    return { place: null, pose: 'absent' };
  }
  if (id === 'wolanski') {
    const A = H.A('symphonie');
    if (A && A.ecrit && farm.s.day <= A.ecrit) return { place: 'ch_208', pose: 'assis' };
  }
  if (id === 'comtesse' && H.est('lucien', 'montre') && h >= 16.5 && h < 21.5) return { place: 'longue_vue', pose: 'debout' };
  return null;
});
// Firmin, dans l'aile : on lui parle, il rentre
{
  const _o = hotelParler.ouvrir.bind(hotelParler);
  hotelParler.ouvrir = function (id) {
    const H = hotelHistoires;
    if (id === 'firmin' && H.est('firmin', 'aile') && H.A('firmin').fugue) {
      ui.choice('Firmin', 'Il est planté devant la porte sans numéro, la lanterne éteinte à la main, blanc comme un drap. « Il y a quelqu’un. Derrière. Il chante. Tout doucement. Comme ma mère, je crois. Je me souviens pas de ma mère. »', [
        { label: '« Viens. On rentre. »', fn: () => {
          ui.close();
          H.sonner();
          farm.give('l18_cle_aile', 1);
          H.avancer('firmin', 14);
          hotel18.lier('firmin', 15);
          hotel18.dire('Firmin', 'Prenez la clé. Gardez-la. Je veux plus jamais la toucher. … Vous avez entendu ? La sonnette. En bas. Je veux partir. Je veux partir loin. Ou je veux rester tout près de vous. Je sais pas.', 9);
        } },
      ]);
      return;
    }
    return _o(id);
  };
}

// ---------------------------------------------------------------- branchements
HOOKS.target.push((eye, f, cand) => { try { if (farm.s && hotel18.V()) hotelHistoires.cibler(eye, f, cand); } catch (e) { /* */ } });
HOOKS.draw.push((buf, sbuf, cam) => { try { if (farm.s && hotel18.V()) hotelHistoires.dessiner(buf, cam); } catch (e) { /* */ } });
{
  let t = 0;
  HOOKS.update.push((dt) => { t -= dt; if (t > 0 || !farm.s || !hotel18.V()) return; t = 1; try { hotelHistoires.tic(); } catch (e) { if (!hotelHistoires._err) { hotelHistoires._err = true; console.error('L18 histoires', e); } } });
}
HOOKS.inter.l18_treize = () => { const dr = hotel18.monde().doors[hotel18.V().portes.treize]; if (!hotelHistoires.porteTreize(dr)) hotel18.dire('', L18_TEXTES.treizeFermee, 3.5); };
HOOKS.inter.l18_registre = () => {
  const H = hotelHistoires;
  if (H.est('treize', 'registre')) {
    H.avancer('treize');
    ui.read('Le registre des voyageurs — les vieilles pages', 'Sous les noms de l’été, en tirant le ruban, on remonte les années. 1886, 1885, 1884… À chaque premier janvier, la même ligne, d’une écriture différente chaque fois : « Chambre 13. M. É. Rouvière, berger. Réglé. »\n\nLa première est de 1868, l’année de l’ouverture. Elle est de la main de Gaspard, à quinze ans : les lettres penchent.\n\nEn 1871, sous la ligne, quelqu’un a ajouté à l’encre rouge : « Aile fermée sur ordre de la direction. Ne plus servir. » Et dessous, d’une autre main, au crayon : « Le plateau monte quand même. »');
    return;
  }
  ui.read('Le registre des voyageurs', 'Les noms de la saison, d’une belle écriture penchée : des Lyonnais, des Genevois, un Anglais qui signe d’une croix pour rire, une princesse dont le titre prend deux lignes. Au bas de chaque page, la même mention : « Aucune réclamation. »');
};
HOOKS.inter.l18_malles = () => ui.read('Les malles du grenier', 'Une douzaine de malles, de valises, de cartons à chapeaux. Des étiquettes de l’hôtel, des noms : « Mlle Clotilde Vernay, 1869 ». « M. et Mme Gautier, 1870 ». « Lt. Arnaud, 1871 ». Les voyageurs ne sont jamais venus les chercher. Dans l’une, sur le dessus, une robe de bal, pliée, et un carnet de bal où les danses de l’hiver 1871 sont toutes réservées au même nom : « É. R. »');
HOOKS.inter.l18_bal = () => {
  const h = hotel18.heure();
  if (hotelHistoires.est('symphonie', 'concert')) { hotel18.dire('', '(Le piano est ouvert. Des feuilles sont posées sur le pupitre, numérotées de la main tremblante de M. Wolański.)', 4); return; }
  hotel18.dire('', cal.is('veillee') && h >= 20 ? '(L’orchestre joue une valse de Waldteufel, un peu trop vite : les musiciens ont un train à prendre demain.)' : '(L’estrade est vide. Les pupitres attendent le Veilledi.)', 4);
};
HOOKS.primary.push((eye, basis, held, it, id) => {
  if (id === 'l18_croquis') { ui.read('Le croquis de Lucien', 'La Grande Porte, au crayon, avec une précision de géologue : les assises, les failles, les deux statues agenouillées, les braseros. Dans la marge, des notes : « Calcaire ? Non. Rien de ce pays. » — « Les statues regardent la porte, pas la route. » En bas : « J’y serai à la Saint-Jean. L. »'); return true; }
  if (id === 'l18_carnet') { const A = hotelHistoires.A('symphonie'); ui.read('Le carnet de Wolański', ['eau', 'cloches', 'vent', 'silence'].map((k) => ({ eau: 'L’eau', cloches: 'Les cloches', vent: 'Le vent', silence: 'Le silence' })[k] + ' — ' + (A && A.faits[k] ? hotelHistoires.ECOUTES[k].texte[hotelHistoires.ECOUTES[k].texte.length - 1].replace(/^\(|\)$/g, '') : 'une portée vide.')).join('\n\n')); return true; }
  if (id === 'l18_registre54') { ui.read('La page de 1854', 'Recensement de la commune, an 1854. « Montés au col des Treize, le 14 décembre, pour la petite Mariette Aubrac, fille du meunier : » suivent treize noms. Douze sont barrés à l’encre bleue, avec un mot : « redescendu ». Le treizième ne l’est pas : « Rouvière, Étienne, berger, 38 ans ».\n\nDans la marge, d’une écriture plus récente, celle d’un grand-père : « Il a faim le soir. Pas de sel. »'); return true; }
  return false;
});
