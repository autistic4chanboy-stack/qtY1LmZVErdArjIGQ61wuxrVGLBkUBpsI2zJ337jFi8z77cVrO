// Le wiki — LA DIX-HUITIÈME VAGUE : les dettes de la ferme (D18), le Grand Hôtel des Cimes (L18), le Grand Cercle et la
// suite Impériale (C18), les récits des proches (K18). La cinquième part de la vague — les cascades, les grottes derrière
// la Grande Chute, les coins de paradis (P18) — n’est pas encore dans le jeu : sa place est prête, voir cascades().
// tools/wiki-build.js appelle :
//  - build(X) après tools/wiki-v17.js : la fiche sys:dettes ; sys:l18_hotel (l’identifiant de la page de l’hôtel dans le
//    wiki du jeu), sys:l18_concierge, les quatre histoires de l’hôtel (sys:l18_lucien…), ses gens (pnj:l18_…, comme le
//    wiki du jeu) ; sys:cercle, ses cinq jeux (sys:c18_roulette…, comme le wiki du jeu), sys:c18_suite, sys:c18_baron,
//    ses gens (pnj:c18_…) ; sys:recits ; un mot dans les fiches des onze habitants (leur récit), de la ferme, de la maison
//    Delorme, de la poste, de la place, du Grand Cercle, des lieux de l’hôtel, des Monts, du château, du carnet, des
//    cinématiques, de la musique, des morts, de la location, de l’alcool, des jeux de l’auberge ;
//  - sections(cats, X) : quatre sections (« Les récits des proches », « Les dettes de la ferme », « Le Grand Hôtel des
//    Cimes », « Le Grand Cercle ») ; un mot dans « Quêtes » et dans « Nouveautés ».
// Ce qui se cache (sous « révéler les secrets ») : les choix et ce qu’ils changent, les fins, les étapes qui en dépendent,
// ce que les portraits des proches révèlent à la longue ; la treize et ce qu’elle cache ; les bonnes réponses du métier
// de concierge ; ce qui se passe la nuit au Grand Cercle (l’homme en gris, la croupière) et la fin du baron.
// Les chances des jeux du Cercle sont calculées ici, exactement, avec les règles mêmes du jeu (C18_REGLES, lues dans
// src/11-zzzzzzzzC18-2-jeux.js) ; le vingt-et-un, contre le meilleur jeu (la méthode de tools/equilibrage/C18.js).
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = path.join(__dirname, '..', 'src');
const lire = (f) => { try { return fs.readFileSync(path.join(SRC, f), 'utf8'); } catch (e) { return ''; } };
const cap = (s) => (s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : '');
// 7.5 → « 7 h 30 » ; 23.4 → « 23 h 24 »
const heure = (h) => { h = ((h % 24) + 24) % 24; let H = Math.floor(h), m = Math.round((h - H) * 60); if (m === 60) { H = (H + 1) % 24; m = 0; } return m ? `${H} h ${String(m).padStart(2, '0')}` : `${H} h`; };
const fenetre = (F) => (Array.isArray(F) ? `de ${heure(F[0])} à ${heure(F[1])}` : '');
// une part, en pour cent, à la française
const pct = (x, d) => (x * 100).toFixed(d === undefined ? (x < 0.01 ? 2 : 1) : d).replace('.', ',') + ' %';

// ============================================================================ D18 : LES DETTES DE LA FERME
// ce que les travaux ajoutent (D18_PLAN), quand ce n'est pas un simple objet posé
const D18_LIBELLE = {
  toit: 'le toit de chaume passe à l’ardoise',
  allee: 'une allée pavée, de la porte au chemin',
  cour: 'une petite cour dallée devant la porte',
  murs: 'les colombages deviennent des murs de pierre, aux fenêtres vitrées',
  perron: 'un perron de pierre sous un auvent d’ardoise',
  verger: 'un verger de six pommiers déjà grands',
  aile_est: 'l’aile est : une chambre (un lit, un coffre, un guéridon)',
  serre: 'une serre de verre dépoli sur un soubassement de pierre (deux carrés de culture, une jardinière)',
  ecurie: 'une écurie ouverte (du foin, un abreuvoir, une lanterne, un poteau pour attacher les chevaux)',
  ardoises: 'les toits des chantiers (grange, poulailler, atelier) passent à l’ardoise, même ceux qu’on bâtira ensuite',
  etage: 'un étage à la maison',
  aile_ouest: 'l’aile ouest : un salon (une cheminée, deux fauteuils, une horloge, un chandelier)',
  piliers: 'les piliers du portail et leurs lanternes',
  murets: 'des murets de pierre de part et d’autre du portail',
};
// (un objet posé qui porte un autre rôle : le puits décoratif est la pompe, le coffre de la maison est l’armoire)
const D18_ROLE = { pompe: 'une pompe, près du champ', armoire: 'une armoire (un coffre de plus)' };

function dettes(X, H) {
  const { T, SP, SEC, esc, IL, nfmt, MF, ITEMS } = X;
  const { h3, ul, tbl, kv, lieu, pnj, pg, log } = H;
  const TERMES = T('D18_TERMES', null), R = T('D18_RETARD', {}) || {}, B = T('D18_BONUS', {}) || {}, AV = T('D18_AVANTAGES', {}) || {};
  const PLAN = T('D18_PLAN', []) || [], SAISIS = T('D18_SAISISSABLE', []) || [];
  if (!Array.isArray(TERMES) || !TERMES.length) { log('D18_TERMES introuvable : pas de fiche « Les dettes de la ferme »'); return; }
  const files = Object.keys(MF || {}).filter((f) => /D18-/.test(f));
  const total = TERMES.reduce((a, t) => a + (t.montant || 0), 0);
  const pc = (x) => Math.round((x || 0) * 100) + ' %';
  // les travaux d’un terme, d’après le plan
  const travaux = (n) => {
    const out = [], objets = {}, dedans = {};
    for (const e of PLAN.filter((q) => q.n === n)) {
      if (D18_ROLE[e.id]) out.push(esc(D18_ROLE[e.id]));
      else if (e.type === 'prop') objets[e.p] = (objets[e.p] || 0) + 1;
      else if (e.type === 'dedans') dedans[e.p] = (dedans[e.p] || 0) + 1;
      else if (D18_LIBELLE[e.id]) out.push(esc(D18_LIBELLE[e.id]));
    }
    const L = (o) => Object.entries(o).map(([p, k]) => (ITEMS[p] ? IL(p, k > 1 ? k : '') : esc(p))).join(', ');
    if (Object.keys(objets).length) out.push(L(objets));
    if (Object.keys(dedans).length) out.push('dans la maison : ' + L(dedans));
    return out;
  };
  const jourDu = 1 + (TERMES[0].delai || 0);

  let h = `<p class="lead">« Elle est à vous. Avec ses dettes, ses murs, et ce qui vient avec. » La succession d’Anselme Varenne est grevée d’une dette ancienne : ${TERMES.length} termes, de plus en plus lourds, à verser à l’étude de Maître Delorme, notaire. Chaque terme acquitté, l’étude fait exécuter les travaux qu’Anselme avait commandés de son vivant : la vieille ferme s’agrandit, se pare, devient un domaine. Le retard coûte ; il ne tue pas.</p>`;
  h += kv([
    ['En tout', `${nfmt(total)} pièces, en ${TERMES.length} termes`],
    ['Le premier', `${nfmt(TERMES[0].montant)} pièces, dû le jour ${jourDu} d’une partie neuve`],
    ['Où l’on paie', `la boîte de l’étude, sur la porte de ${lieu('vide5', 'la maison Delorme')}, en ville ; ou par mandat, à ${lieu('poste', 'la poste')}`],
    ['Au carnet', 'Carnet → « La ferme »'],
  ]);
  h += h3('Comment ça marche') + ul([
    `La première lettre, « L’échéancier », arrive le deuxième jour : le premier terme, ${nfmt(TERMES[0].montant)} pièces, est à régler en ${TERMES[0].delai} jours. <b>Une partie d’avant</b> reçoit tout de suite « Une dette retrouvée » : son premier terme n’est dû que ${R.grace || 24} jours plus tard.`,
    `<b>Payer à l’étude</b> : une plaque de cuivre ternie, et sa fente, à gauche de la porte close de ${lieu('vide5', 'la maison Delorme')} (l’écriteau « À louer » est à droite) : « Maître Delorme, notaire. Règlements par la boîte. » <kbd>E</kbd> dessus : « Glisser le terme dans la boîte », ou, si la bourse n’y suffit pas, « Glisser ce que j’ai » — un versement partiel compte. (Sans maison Delorme, la boîte serait à la porte de la mairie.)`,
    `<b>Payer par mandat</b>, à ${lieu('poste', 'la poste')} : ${pnj('postiere', 'la postière')}, « Un mandat pour l’étude Delorme » ; ${R.mandat || 3} pièces de frais. On envoie le terme entier, ou ce qu’on a.`,
    'Le terme payé, une quittance arrive à la boîte aux lettres, avec le montant du suivant et son échéance : le suivant s’ouvre le jour même, son délai court à partir de là.',
    'Les travaux se font <b>le lendemain matin</b>. En revenant à la ferme, une courte scène les montre (la carte « La ferme Varenne » et le nom des travaux). Un objet que vous avez posé gêne : les ouvriers le déplacent de quelques pas (une lettre le dit) ; il n’y a pas la place : l’élément attend, ils réessaient chaque matin. Rien n’est touché hors de la ferme.',
    'Tout se suit au carnet (menu <kbd>Tab</kbd>, onglet <b>Carnet</b>, page <b>La ferme</b>) : le terme en cours (ce qui est dû, pénalités comprises, l’échéance ou le retard, les scellés), les huit termes en pointillés, la silhouette de la ferme telle qu’elle est et, en pointillé, ce que paiera le terme suivant ; les travaux faits et ce qu’ils apportent ; où payer.',
  ]);

  // ---- les huit termes
  const rows = TERMES.map((t, i) => [
    `<b>${i + 1}. ${esc(t.titre)}</b><br><small>${esc(t.bas || '')}</small>`,
    `${nfmt(t.montant)} pièces`,
    `${t.delai} jours`,
    travaux(i + 1).join(' ; '),
    esc(t.avantage || ''),
  ]);
  rows.push(['<b>En tout</b>', `<b>${nfmt(total)} pièces</b>`, `${TERMES.reduce((a, t) => a + (t.delai || 0), 0)} jours`, '', '']);
  h += h3('Les huit termes') + `<p class="note">Le délai court du jour où le terme s’ouvre (le précédent payé). Les montants comprennent les intérêts.</p>` + tbl(['Terme', 'Montant', 'Délai', 'Les travaux', 'Ce qu’ils apportent'], rows);

  // ---- ce que les travaux apportent
  const n = (k) => AV[k] || '?';
  h += h3('Ce que le domaine apporte') + ul([
    `<b>Un toit sec</b> (terme ${n('lit')}) : une nuit dormie à la ferme, le ventre pas vide, rend ${B.lit || 10} points de santé de plus ; <b>la chambre</b> de l’aile neuve (terme ${n('chambre')}), encore ${B.chambre || 10}.`,
    `<b>La pompe</b> (terme ${n('pompe')}) : près du champ, l’arrosoir s’y remplit.`,
    `<b>L’armoire</b> (terme ${n('armoire')}) : un coffre de plus dans la maison ; l’aile neuve en ajoute un autre, dans la chambre.`,
    `<b>Le verger</b> (terme ${n('verger')}) : six pommiers adultes, plantés dans les cultures, et deux ruches : des pommes et du miel sans rien semer.`,
    `<b>Les arroseurs</b> (terme ${n('arroseurs')}) : deux ${IL('arroseur_fer')} gardent le champ humide.`,
    `<b>L’écurie</b> (terme ${n('ecurie')}) : chaque matin, les bêtes de la ferme gagnent un peu de contentement ; la fontaine donne de l’eau.`,
    `<b>La réputation du domaine</b> (terme ${n('reputation')}) : la coopérative paie ${pc(B.reputation || 0.05)} de plus sur ce qu’on expédie.`,
    'Sous scellés (après une saisie), le toit sec, la chambre, l’écurie et la réputation ne jouent plus, jusqu’au paiement du terme ; le reste demeure.',
  ]);

  // ---- le retard
  const vendable = { culture: 'les récoltes', produit: 'les produits de la ferme', cueillette: 'la cueillette', chasse: 'la chasse', materiau: 'les matériaux', nourriture: 'la nourriture', poisson: 'les poissons' };
  h += h3('Le retard') + ul([
    `Un rappel, ${R.rappel || 5} jours avant l’échéance.`,
    `Il faut avoir payé avant le matin de l’échéance : ce matin-là, la <b>mise en demeure</b>, et une pénalité de ${pc(R.demeure)} du terme. Puis ${pc(R.semaine)} de plus par semaine de retard (douze jours) — jamais plus de ${pc(R.plafond)} en tout.`,
    `<b>Les huissiers</b> (Maître Fouquet) : ${R.saisie || 6} jours après l’échéance, une saisie, puis une autre tous les ${R.reprise || 12} jours, ${R.saisies || 3} au plus par terme. Ils emportent ce qui se vend — ${SAISIS.map((c) => vendable[c] || c).join(', ')} —, dans les coffres de la ferme puis dans la sacoche, le plus cher d’abord ; jamais un outil, une clé, un livre, un trésor, un objet de quête, ni ce qu’on a en main. De quoi faire au plus ${pc(R.part)} du terme, vendu à la criée aux ${pc(R.criee)} de son prix : c’est déduit du terme. Un procès-verbal le dit (s’il n’y a rien à prendre, un procès-verbal de carence) ; en revenant à la ferme, une scène : deux hommes en noir qui repartent par le chemin.`,
    'Après une saisie, <b>les scellés</b> sont posés sur les privilèges du domaine, jusqu’à complet paiement du terme ; la quittance les lève.',
    'Jamais de fin de partie : on peut toujours payer, chaque saisie paie une part du terme ; mais la dette ne s’éteint pas d’elle-même.',
  ]);
  h += h3('Les lettres') + `<p>De ${pg('sys:savoir', 'la boîte aux lettres')} : « L’échéancier » (ou « Une dette retrouvée »), « Rappel », « Mise en demeure », « Pénalité de retard », les « Quittance » de chaque terme, « Les travaux » (quand un objet a été déplacé), le « Procès-verbal » des huissiers ; et, le huitième terme payé, l’« Acte de mainlevée » : la ferme, ses terres et ses murs sont quittes de toute dette.</p>`;
  h += SEC(`<p>Le post-scriptum de la mainlevée : « Les travaux que vous avez vus s’élever, feu M. Varenne les avait commandés il y a quarante ans. Personne avant vous n’était allé plus loin que le troisième terme. »</p><p>À la poste : « Un mandat pour l’étude ? Ils sont où, ces gens-là ? On n’a jamais vu personne y entrer. Mais les mandats partent, et les quittances reviennent. » Derrière la porte close de la maison Delorme, quand on glisse le dernier sou d’un terme dans la fente, une plume gratte.</p>`, 'Le post-scriptum de la dernière lettre, et ce qu’on dit de l’étude : masqué (secrets).');
  h += `<p>${pg('li:ferme', 'La vieille ferme')} · ${pg('sys:recits', 'Les récits des proches')} · ${pg('sys:savoir', 'La sacoche et le carnet')}</p>`;
  SP('sys:dettes', { t: 'Les dettes de la ferme', s: `${TERMES.length} termes à l’étude Delorme ; chaque terme payé, des travaux : la ferme devient un domaine`, c: ['dettes'], i: '⚖', h }, files);
}

// ============================================================================ L18 : LE GRAND HÔTEL DES CIMES
// les places de l’hôtel (w.l18.places, nœuds « n:… ») que nomment les journées des gens (L18_GENS.horaire)
const L18_PLACE = {
  bureau: 'au bureau', 'n:hall': 'dans le hall', maitre_hotel: 'à la salle à manger', terrasse_d: 'sur la terrasse', salon_bar: 'au bar du salon',
  ch_221: 'dans sa chambre, la 221', veilleur: 'à la table du veilleur, dans le couloir de service', loge: 'à la loge', ch_m4: 'dans sa mansarde, aux combles',
  salon_lecture: 'au salon de lecture', 'n:entree': 'à l’entrée', chef: 'en cuisine', 'n:cour_n': 'dans la cour', ch_m2: 'dans sa chambre, aux combles',
  'n:potager_c': 'au potager', 'n:service': 'dans le couloir de service', 'n:aile_porte': 'devant la porte de l’aile Nord', ch_m3: 'dans sa chambre, aux combles',
  lingerie: 'à la lingerie', 'n:c1_0': 'dans le couloir du premier', 'n:c2_0': 'dans le couloir du deuxième', ch_m5: 'dans sa chambre, aux combles',
  cocher: 'à la remise', 'n:funi_haut': 'à la gare haute du funiculaire', ch_108: 'dans sa chambre, la 108', resto_00: 'à la salle à manger',
  salon_canape: 'au salon', longue_vue: 'à la longue-vue de la terrasse', salon_canape2: 'au salon', ch_208: 'dans sa chambre, la 208',
  balcon2: 'au balcon d’honneur', resto_10: 'à la salle à manger', terrasse_t2: 'sur la terrasse', resto_11: 'à la salle à manger', piano: 'au piano du salon', treize: 'dans la treize',
};
// où vit chacun (la « demeure » du wiki du jeu)
const L18_VIT = { comtesse: 'au Grand Hôtel des Cimes, chambre 108', wolanski: 'au Grand Hôtel des Cimes, chambre 208', directeur: 'au Grand Hôtel des Cimes, chambre 221', treize: 'dans la treize, au bout du couloir du premier, dans l’aile Nord', cocher: 'au Grand Hôtel des Cimes, à la remise, près des chevaux', joseph: 'au Grand Hôtel des Cimes ; il tient la gare haute du funiculaire', maitre: 'au Grand Hôtel des Cimes' };
// où on les trouve, le plus souvent (d’après leurs journées)
const L18_OU = {
  directeur: 'à son bureau, au fond du hall ; aux repas, à la salle à manger ; le soir, au bar du salon',
  gaspard: 'la nuit, à la table du veilleur ; le matin, à la loge ; le soir, au salon de lecture',
  firmin: 'à l’entrée, pour les bagages',
  chef: 'en cuisine ; l’après-midi, un moment au potager',
  odile: 'à la lingerie, ou dans les couloirs des étages',
  cocher: 'à la remise, au nord de la cour',
  joseph: 'à la gare haute du funiculaire, de 6 h à 21 h',
  maitre: 'à la salle à manger, de 7 h à 22 h 30',
  comtesse: 'au salon, à la salle à manger ; au coucher du soleil, à la longue-vue',
  wolanski: 'sur le balcon d’honneur, la terrasse, au salon ; le soir, au piano',
};
// les histoires où chacun a sa part
const L18_PART = { directeur: ['firmin', 'symphonie'], gaspard: ['treize', 'symphonie', 'firmin'], firmin: ['firmin'], chef: ['treize', 'symphonie'], odile: ['firmin'], comtesse: ['lucien'], wolanski: ['symphonie'], treize: ['treize'] };

function hotel(X, H) {
  const { T, SP, P, SEC, esc, IL, lk, nfmt, MF, pages, mapBtn } = X;
  const { h3, ul, tbl, kv, lieu, aLieu, pnj, pg, log } = H;
  const GENS = T('L18_GENS', null), ORDRE = T('L18_ORDRE_GENS', []) || [], ARCS = T('L18_ARCS', {}) || {}, ORDRE_A = T('L18_ORDRE_ARCS', []) || [];
  const RANGS = T('L18_RANGS', []) || [], REGL = T('L18_REGL', {}) || {}, CLIENTS = T('L18_CLIENTS', []) || [], DEM = T('L18_DEMANDES', {}) || {};
  const CINES = T('L18_CINES', {}) || {}, OCINES = T('L18_ORDRE_CINES', []) || [], PAROLES = T('L18_PAROLES', {}) || {}, TX = T('L18_TEXTES', {}) || {};
  const GOUTS = T('L18_GOUTS', {}) || {}, QUER = T('L18_QUERELLES', []) || [], SECR = T('L18_SECRETS', []) || [], DIN = T('L18_DINERS', []) || [];
  const VALLEE = T('L18_VALLEE', []) || [], PERDUS = T('L18_PERDUS', []) || [], OU = T('L18_OU', []) || [];
  if (!GENS || !ORDRE.length) { log('L18_GENS introuvable : pas de fiches de l’hôtel'); return; }
  const files = Object.keys(MF || {}).filter((f) => /L18-/.test(f));
  const SV = REGL.service || { debut: 7, fin: 19, duree: 5 }, DM = REGL.demande || {};
  const nomG = (id) => (GENS[id] ? GENS[id].nom : id);
  const gens = (id, t) => (pages.has('pnj:l18_' + id) || ORDRE.includes(id) ? lk('pnj:l18_' + id, t || nomG(id)) : esc(t || nomG(id)));
  const arc = (id, t) => lk('sys:l18_' + id, t || (ARCS[id] ? '« ' + ARCS[id].titre + ' »' : id));
  const cine = (k) => (CINES[k] ? `« ${esc(CINES[k].titre)} »` : esc(k));
  const hotelL = (t) => lk('sys:l18_hotel', t || 'le Grand Hôtel des Cimes');
  const metier = (t) => lk('sys:l18_concierge', t || 'le métier de concierge');

  // ================================================================ l’hôtel
  {
    let h = `<p class="lead">Un palace de la Belle Époque, bâti en 1868 sur le replat des monts de l’Est, au-dessus du château, par une compagnie lyonnaise qui croyait au tourisme des cimes : un funiculaire depuis la vallée (1882), une salle de bal, une terrasse sur toute la vallée, une aile fermée depuis l’hiver 1871. On peut s’y faire engager comme concierge.</p>`;
    h += kv([
      ['Où', `${lieu('l18_hotel', 'le replat des monts de l’Est')}, en face du ${lieu('chateau', 'château de Valmont')}, à 1,3 km de Valbrume ${mapBtn('li:l18_hotel')}`],
      ['On y monte', `par le funiculaire (${REGL.funiculaire || 2} pièces, de 6 h à 21 h), le chemin muletier (à toute heure), ou la voiture des Cimes (${REGL.voiture || 6} pièces, de 6 h à 21 h)`],
      ['Le service', `à la loge du concierge, de ${heure(SV.debut)} à ${heure(SV.fin)} : ${metier()}`],
      ['Le bal', 'le Veilledi soir, de 20 h 30 à 23 h 30'],
      ['Au carnet', 'Carnet → « Le Grand Hôtel » (dès qu’on l’a vu)'],
    ]);
    h += h3('Y monter') + ul([
      `<b>Le funiculaire</b> : ${lieu('l18_funi_bas', 'la gare d’en bas')} est dans la vallée, au bout de la route du château ; ${lieu('l18_funi_haut', 'la gare haute')}, au bout de la terrasse. Cent quatre-vingts mètres de voie (une tranchée, puis un viaduc de pierre), vingt-deux pour cent de pente, une cabine rouge à trois compartiments en gradins. ${REGL.funiculaire || 2} pièces la course — rien, une fois engagé ; de 6 h à 21 h : la nuit, il ne monte pas (${gens('joseph', 'Joseph')}, le mécanicien, dort). On monte ou on descend dans une courte scène : la cabine roule pour de vrai.`,
      '<b>Le chemin muletier</b>, en lacets, à côté de la voie : il monte toujours, la nuit aussi.',
      `<b>La voiture des Cimes</b> : une calèche verte à capote, aux armes des Cimes, attend à ${lieu('l18_arret', 'l’arrêt')}, à la fourche au nord de Valbrume (« départ à toute heure du jour, sur demande au cocher »). ${REGL.voiture || 6} pièces jusqu’aux Cimes, de 6 h à 21 h. Pour redescendre, on le demande à ${gens('cocher', 'Baptiste')}, le cocher, à la remise (${REGL.voiture || 6} pièces ; rien pour le personnel).`,
      `Les poteaux : « ${esc((TX.poteauBas || '').replace(/\n/g, ' — '))} » ; sur la route du château, « ${esc(TX.poteauChateau || '')} ».`,
    ]);
    h += h3('Les lieux') + ul([
      '<b>Le terre-plein</b> (110 × 66 m) : la cour d’honneur et sa fontaine, la marquise, les lettres sur le toit ; ' + lieu('l18_terrasse', 'la terrasse') + ' au couchant (la balustrade, les parasols, la longue-vue : le château, l’abbaye, la ferme, le lac, la Grande Porte) ; le potager ; la remise (la voiture de l’hôtel).',
      '<b>Le corps principal</b> (60 × 18 m), quatre niveaux. Au rez-de-chaussée : le hall et <b>la loge du concierge</b> (le comptoir d’acajou, le casier aux clés, le tableau des sonnettes, le registre), le bureau du directeur (au fond du hall, à droite ; le coffre-fort), la salle à manger (douze tables), la cuisine (et l’escalier de la cave), le salon de lecture (le piano, les canapés, le bar, la bibliothèque), le couloir de service (la table du veilleur de nuit, la lingerie), qui mène à la porte de l’aile Nord ; l’escalier d’honneur, à double volée, au fond du hall.',
      '<b>Les deux étages de chambres</b> : 101 à 129 et 201 à 229 — quinze sur la vallée, treize derrière. Il n’y a pas de 13 : les numéros sautent de 112 à 114. On entre dans quelques-unes (103, 105, 108, 110, 112, 115, 118, 202, 204, 208, 209, 211, 214, 221) ; les autres sont occupées. Le balcon d’honneur, au-dessus de l’entrée, donne sur les chambres 108 et 208.',
      '<b>Les combles</b> : le personnel (Firmin, le chef, la gouvernante, le cocher, le veilleur, les femmes de chambre), et la mansarde du concierge — un lit, un coffre, une fenêtre.',
      `<b>${lieu('l18_bal', 'La salle de bal')}</b>, au sud : vingt mètres sur vingt-deux, huit sous plafond, trois lustres, l’estrade de l’orchestre, le piano, les miroirs. Le Veilledi, de 20 h 30 à 23 h 30, l’orchestre joue des valses et les clients dansent.`,
      `<b>${lieu('l18_aile', 'L’aile Nord')}</b>, fermée depuis l’hiver 1871 : des planches clouées sur les fenêtres, la porte du couloir de service fermée à clé, et, au bout des couloirs des étages, des portes condamnées. « Si un client vous demande pourquoi l’aile Nord est fermée : travaux. »`,
      '<b>Les caves</b>, par l’escalier du fond de la cuisine — « Vingt marches, quarante, cent : on a creusé loin, sous la montagne » : la cave à vin, la réserve, la buanderie, la chaufferie (la chaudière de 1882).',
    ]);
    // les gens
    const pub = ORDRE.filter((id) => id !== 'treize');
    h += h3('Les gens de l’hôtel') + tbl(['Qui', 'Ce qu’il fait', 'Où le trouver'], pub.map((id) => [gens(id), esc(cap(GENS[id].role || '')), esc(L18_OU[id] || '')]));
    h += `<p class="small">On leur parle (<kbd>E</kbd>, de près) : ce qu’ils disent dépend de l’heure, de l’amitié, de l’histoire en cours ; le premier mot du jour rapproche un peu. Au carnet : « on se salue », puis « de la sympathie », « de la confiance », « un ami ». Leurs journées : sur leurs fiches. Des clients de passage, de quatre à six chaque jour : ${metier('le métier de concierge')}.</p>`;
    h += h3('Le métier de concierge') + `<p>Le directeur cherche un concierge : on se fait engager, et chaque jour on peut prendre un service de ${SV.duree} heures à la loge — les clients demandent, on porte, on cherche, on arrange, on se tait. Des gages selon le rang, des pourboires, une réputation qui fait monter en grade, venir de meilleurs clients, et qui ouvre les histoires. Tout est dans ${metier('« Le métier de concierge »')}.</p>`;
    // les histoires
    h += h3('Ses histoires') + tbl(['Histoire', 'Qui la propose', 'À partir de', 'Étapes'], ORDRE_A.filter((id) => ARCS[id]).map((id) => {
      const A = ARCS[id];
      return [arc(id), gens(A.qui), id === 'treize' ? `réputation ${A.rep}, ou après la nuit de Firmin dans l’aile Nord` : A.rep ? `réputation ${A.rep}` : 'dès qu’on est engagé', String((A.etapes || []).length)];
    }));
    h += `<p class="small">Des gens qu’on finit par aimer, des choix qui comptent, une fin à chacune, et ses scènes. Certaines étapes se font en un lieu de la vallée (un petit éclat d’or marque l’endroit : <kbd>E</kbd> dessus), d’autres à une heure dite (il suffit d’être là), d’autres en parlant. Une ligne discrète, à l’écran, quand une étape s’ouvre. Elles se suivent au carnet, et parmi les quêtes (Carnet → Quêtes, « En cours », « Accompli »).</p>`;
    // les scènes
    h += h3('Les scènes') + ul([
      `${cine('arrivee')}, la première fois qu’on approche ; ${cine('terrasse')}, la première fois qu’on est sur la terrasse, le soir (de 17 h à 20 h) ; ${cine('bal')}, la première fois qu’on entre dans la salle un soir de bal ; ${cine('aile')}, la première fois qu’on entre dans l’aile Nord ; ${cine('embauche')}, quand on est engagé ; ${cine('funiculaire')} et ${cine('voiture')}, à chaque course.`,
      'Et celles des histoires (une ou deux chacune). Sur le moteur des cinématiques de l’histoire : on les passe en maintenant <kbd>Espace</kbd> ou <kbd>Échap</kbd>. Celles qu’on a vues se revoient au carnet, page « Le Grand Hôtel », « Souvenirs de l’hôtel ».',
      'Deux airs de l’hôtel, qu’on n’entend que là : « La valse des Cimes » (l’orchestre du Veilledi, et l’arrivée), et « La Vallée », la symphonie de Casimir Wolański réduite pour piano.',
    ]);
    h += h3('Au carnet') + `<p>Menu <kbd>Tab</kbd> → Carnet → <b>Le Grand Hôtel</b> (la page paraît quand on a vu l’hôtel) : le rang et la réputation, les services faits et ce qu’ils ont rapporté, le service du jour, les commissions en cours et leur échéance, les histoires (l’étape en cours, puis leur fin), les gens de l’hôtel et ce qu’on est l’un pour l’autre, les scènes vues (« Revoir »). Le wiki du jeu a une page pour l’hôtel et pour chacun de ses gens (son métier, sa demeure, son caractère : appris en lui parlant, en le voyant chez lui, en devenant proches).</p>`;
    h += SEC(h3('Ce qui se cache') + ul([
      'Le tableau des sonnettes, à la loge, a treize timbres ; sous le treizième, l’étiquette est noire. Gaspard dit qu’il est là « pour la symétrie ». La nuit (de 22 h à 3 h), quand on est près de la loge, il lui arrive de tinter, tout seul, deux fois : le fil qui devrait monter aux étages est coupé depuis longtemps.',
      'Le registre des voyageurs, à la loge : sous les noms de la saison, en tirant le ruban, les vieilles pages — et, à chaque premier janvier depuis 1868, la même ligne : « Chambre 13. M. É. Rouvière, berger. Réglé. »',
      'Chaque soir à onze heures, le chef Mercadier monte un plateau couvert dans l’aile fermée, avec sa clé à lui.',
      'Dans l’aile Nord : le rez-de-chaussée, l’ancien salon de musique sous ses draps ; une échelle (l’escalier s’est effondré) ; au premier, quatre anciennes chambres et, au bout du couloir, une porte sans numéro, la treize ; au grenier, les malles des voyageurs qui ne sont pas redescendus — une robe de bal, un carnet de bal où les danses de l’hiver 1871 sont toutes réservées au même nom : « É. R. »',
      `Tout cela mène à ${arc('treize')}.`,
    ]), 'La treizième sonnette, le registre, l’aile Nord : masqué (secrets).');
    h += `<p>${metier('Le métier de concierge')} · ${ORDRE_A.filter((id) => ARCS[id]).map((id) => arc(id)).join(' · ')} · ${pg('sys:cercle', 'Le Grand Cercle')} · ${pg('li:monts', 'Les Monts Blancs')}</p>`;
    SP('sys:l18_hotel', { t: 'Le Grand Hôtel des Cimes', s: 'Un palace de 1868 sur le replat des monts de l’Est : le funiculaire, la loge du concierge, quatre histoires', c: ['grand-hotel'], i: '⌂', h }, files);
  }

  // ================================================================ le métier de concierge
  {
    const rang = (R) => `${esc(cap(R.nom))}`;
    let h = `<p class="lead">On se fait engager par M. Brissac, le directeur ; on prend son service à la loge, et les clients viennent demander. On porte, on cherche, on arrange, on se tait. Des gages, des pourboires, une réputation qui fait monter en grade et venir de meilleurs clients, et qui ouvre les histoires de l’hôtel.</p>`;
    h += h3('Se faire engager') + ul([
      `${gens('directeur', 'M. Brissac')} a son bureau au fond du hall, à droite (il y est de 7 h à 9 h, de 10 h 30 à 12 h 30 et de 14 h à 17 h ; sinon dans le hall, à la salle à manger, sur la terrasse, au bar du salon). « Je cherche une place de concierge. » : on est engagé sur-le-champ, ${esc(RANGS[0] ? RANGS[0].nom : 'concierge stagiaire')}. Une scène : ${cine('embauche')}.`,
      `On reçoit ${IL('l18_clefs')} — l’insigne des concierges, que ${gens('gaspard', 'Gaspard')} a portées trente ans — et la mansarde du concierge, au dernier étage, la première à gauche : un lit à soi, un coffre. Le funiculaire ne coûte plus rien (ni la voiture, pour redescendre).`,
      `Gaspard, l’ancien chef concierge devenu veilleur de nuit, tient la loge quand on n’y est pas ; la nuit, elle est à lui.`,
    ]);
    h += h3('Le service') + ul([
      `Un par jour, pris à la loge entre ${heure(SV.debut)} et ${heure(SV.fin)} (« Prendre son service ») ; il dure ${SV.duree} heures. « Rendre son service » avant l’heure : la moitié des gages. S’éloigner à plus de 900 m de l’hôtel pendant une heure, c’est quitter son service.`,
      `Les clients viennent à la loge l’un après l’autre : le premier un quart d’heure après, puis toutes les ${Math.round((DM.ecart || [0.6, 1])[0] * 60)} à ${Math.round((DM.ecart || [0.6, 1])[1] * 60)} minutes de jeu ; ${DM.max || 6} demandes au plus par service, deux clients au plus qui attendent. Un client qu’on fait attendre plus d’une heure s’en va (et la réputation baisse un peu).`,
      '« Écouter », puis « Accepter » — la demande devient une commission, au carnet — ou s’excuser : « Je suis désolé : ce n’est pas possible aujourd’hui. » (rien n’est perdu).',
      'Une commission se fait avant la fin du service (et une heure de grâce) ; une commission dans la vallée, avant le lendemain soir. Oubliée, elle coûte de la réputation.',
    ]);
    // les demandes
    const D = (k) => (DEM[k] ? esc(DEM[k].titre) : k);
    const rows = [
      [D('bagages'), `On prend ${IL('l18_valise')} ; à la porte de la chambre dite, <kbd>E</kbd> : « Déposer la valise ».`],
      [D('lettre'), `On prend ${IL('l18_pli')} : le glisser sous la porte de la chambre dite.`],
      [D('reserve'), `Descendre aux caves (l’escalier au fond de la cuisine) chercher ${IL('l18_bouteille')}, ${IL('l18_draps')} ou ${IL('l18_epicerie')}, et le remettre à la loge.`],
      [D('vallee'), `Rapporter à la loge, avant le lendemain soir, une chose de la vallée : ${VALLEE.map((k) => IL(k)).join(', ')}. Le pourboire compte en plus une fois et demie son prix.`],
      [D('voiture'), `Le dire à ${gens('cocher', 'Baptiste')}, à la remise (au nord de la cour) : « Faire atteler pour… ».`],
      [D('perdu'), `Un objet égaré (${PERDUS.map((p) => esc(p[0])).join(', ')}), là où le client dit l’avoir laissé (${OU.map((o) => esc(o[1])).join(' ; ')}) : un petit éclat doré ; <kbd>E</kbd> dessus, puis le rapporter à la loge (${IL('l18_objet_perdu')}).`],
      [D('dispute') + ' <small>(réputation 15)</small>', 'Aller voir (au salon, à la salle à manger ou sur la terrasse : deux silhouettes qui se font face), et choisir une réponse parmi trois.'],
      [D('secret') + ' <small>(réputation 15)</small>', `Accepter de mentir pour le client ; plus tard, quelqu’un vient vous demander (${SECR.map((s) => esc(s.qui)).join(', ')}) : se taire, ou parler — on est payé (${SECR.map((s) => s.paie).join(', ')} pièces), mais la réputation baisse.`],
      [D('diner'), `Voir ${gens('chef', 'le chef Mercadier')}, en cuisine, et choisir parmi trois le menu qui va avec ce que le client a dit.`],
      [D('conseil'), 'Le client dit ce qu’il aime ; lui conseiller un lieu de la vallée parmi trois — ou avouer qu’on ne sait pas (sans perte).'],
    ];
    h += h3('Les demandes') + tbl(['Demande', 'Ce qu’il faut faire'], rows) + `<p class="small">Dès la réputation 15, les querelles et les secrets ; dès 40, davantage de commissions dans la vallée, de dîners et de querelles.</p>`;
    // la paie
    h += h3('La paie et la réputation') + tbl(['Rang', 'Dès la réputation', 'Gages d’un service'], RANGS.map((R) => [rang(R), String(R.rep), `${R.gage} pièces`])) + ul([
      `Les gages, à la fin du service, selon le rang (la moitié si l’on part avant l’heure).`,
      `Un pourboire par demande bien faite : de ${(REGL.pourboire || [6, 38])[0]} à ${(REGL.pourboire || [6, 38])[1]} pièces, davantage chez les clients exigeants, et encore avec la réputation (jusqu’à moitié plus, à 100).`,
      `La réputation, de 0 à 100 : +${(REGL.repBien || [1, 2]).join(' ou +')} par demande réussie (moitié moins au-delà de 55), −${REGL.repMal || 2} par demande ratée, −1 par client parti sans réponse, ${REGL.repSecret || 4} de plus ou de moins pour un secret ; les histoires en donnent aussi. Gaspard annonce chaque grade (« Le directeur l’a dit à table, devant tout le monde »). Aux clefs d’or, s’il les a perdues, on retrouve ${IL('l18_clefs')}.`,
      'Un service rapporte, en moyenne, à peu près une journée de travail honnête : de 120 à 450 pièces, gages et pourboires, jamais plus de 700.',
    ]);
    // les clients
    h += h3('Les clients de passage') + `<p>De quatre à six chaque jour, tirés selon la réputation (les meilleurs d’abord) ; chacun a sa chambre, sa table, et un mot en arrivant.</p>` + tbl(['Client', 'Qui', 'Vient dès', 'Ce qu’il demande quand il veut un conseil'], CLIENTS.map((C) => [esc(C.nom), esc(C.qui), C.niv ? `réputation ${C.niv}` : 'le début', `« ${esc((GOUTS[C.gout] || {}).dit || '')} »`]));
    // les bonnes réponses
    const L = (k) => (pages.has('li:' + k) ? lieu(k) : null);
    let s = h3('Les bonnes réponses') + `<h4>Les conseils</h4>` + tbl(['Goût', 'Les bons lieux (un seul suffit)'], Object.entries(GOUTS).map(([k, G]) => [`« ${esc(G.dit)} »`, (G.bons || []).map(L).filter(Boolean).join(', ')]));
    s += `<h4>Les querelles</h4>` + ul(QUER.map((Q) => `<b>${esc(cap(Q.de))}</b> — ${esc(Q.a)} <br>→ « ${esc((Q.rep || [])[0] || '')} »`));
    s += `<h4>Les dîners</h4>` + ul(DIN.map((Dn) => `« ${esc(Dn.gout)} » → ${esc(Dn.bon)}`));
    s += `<h4>Les secrets</h4><p>Se taire : réputation +${REGL.repSecret || 4}, et le lendemain une enveloppe au casier (un pourboire et demi). Parler : la somme promise, réputation −${REGL.repSecret || 4}.</p>`;
    h += SEC(s, 'Les bonnes réponses (conseils, querelles, dîners) : masqué (secrets).');
    h += `<p>${hotelL('Le Grand Hôtel des Cimes')} · ${ORDRE_A.filter((id) => ARCS[id]).map((id) => arc(id)).join(' · ')}</p>`;
    SP('sys:l18_concierge', { t: 'Le métier de concierge', s: 'Un service par jour à la loge : les demandes, les gages, les pourboires, la réputation', c: ['grand-hotel'], i: '🛎', h });
  }

  // ================================================================ les quatre histoires
  const HIST = {
    lucien: {
      debut: `Proposée par ${gens('comtesse', 'la comtesse de Saint-Aubin')} (chambre 108) : « Madame, vous attendez quelqu’un ? », puis « Je ferai ce que je peux, madame. » Elle donne sa lettre du jour (${IL('l18_lettre_comtesse')}).`,
      notes: {
        poste: 'Avec la lettre (perdue ? elle en écrit une chaque matin). Un petit éclat d’or marque l’endroit : <kbd>E</kbd> dessus.',
        auberge: 'L’éclat d’or, à l’auberge : <kbd>E</kbd>.',
        bibliotheque: `À la grande bibliothèque : le registre des lecteurs, et ${IL('l18_croquis')} (clic : le regarder).`,
        porte: `L’éclat d’or, près de la stèle : on y trouve ${IL('l18_montre')}.`,
        montre: 'Elle est à la longue-vue, au coucher du soleil : « Lui montrer la montre ». Une scène, puis une question.',
        seuil: `Avec ${IL('l18_derniere_lettre')} : la poser sur le seuil (l’éclat d’or, près de la stèle), ou passer la Porte avec elle.`,
        adieu: 'Le lendemain matin : « Bonjour, madame. » Une scène.',
      },
      secret: [
        'À la poste, la postière se souvient : « Il dormait à l’auberge. » À l’auberge : « Redingote grise, des cailloux plein les poches… Un matin il est parti par la route de Clairpré, avec un marteau et son carnet. Il a laissé sa chambre payée d’avance. Elle l’est toujours. » À la bibliothèque : « L. de Saint-Aubin », six fois, toujours le même livre, « Des Portes de la vallée ». Sur la stèle de la Grande Porte, gravé au couteau : « L. de S.-A. — 24 juin », et la montre pendue à un clou du brasero, arrêtée à quatre heures dix.',
        '« Ne me mentez pas. Est-il mort ? » Trois réponses : « Il a passé la Grande Porte. On n’en revient pas souvent ; on n’y meurt pas toujours. » ; « Je crois qu’il est mort, madame. Je suis désolé. » ; « Je ne sais pas. »',
        'La lettre posée sur le seuil n’y est plus quand on se retourne, au bas des marches — et il n’y a pas de vent. Portée de l’autre côté, elle reste sur la première pierre plate : la cendre ne la recouvre pas.',
        `<b>La fin.</b> Si l’on a répondu par l’espoir, ou porté la lettre de l’autre côté : la comtesse reste au 108 ; le soir, à la longue-vue, elle tient compagnie à son fils. Sinon : elle rentre à Paris faire graver une date sur un caveau (elle quitte l’hôtel le lendemain), et vous remercie de ne pas lui avoir menti. Dans les deux cas : ${IL('boussole')} (celle de Lucien), cent soixante pièces « pour vos souliers », et de la réputation (+5). Scènes : ${cine('montre')}, ${cine('comtesse_fin')}.`,
      ],
    },
    firmin: {
      debut: `Proposée par ${gens('firmin', 'Firmin')}, le groom, dès qu’on est engagé : « Tu as l’air triste, Firmin. » Sa boîte à biscuits n’est plus sous son lit.`,
      notes: {
        boite: `${gens('odile', 'Mlle Fauvel')}, la gouvernante : « Avez-vous vu une boîte à biscuits rouge ? » ; lui dire à qui elle est. Elle la rend (${IL('l18_boite')}) : la rapporter à Firmin.`,
        examen: '« Récite-moi ce qu’un groom doit savoir. » Quatre questions ; trois bonnes réponses au moins (sinon, on recommence quand on veut).',
        lettre: `${gens('directeur', 'M. Brissac')} : « Firmin voudrait une lettre de recommandation. » Il ne l’écrit qu’à un concierge en titre (réputation 25), et l’on signe avec lui (${IL('l18_recommandation')}). La porter à Firmin.`,
        aile: `Une nuit, une dizaine d’heures au moins après la lettre, quand on est à l’hôtel : Gaspard vient le dire. Le chercher dans l’aile (la porte est ouverte), lui parler : il rentre, et donne ${IL('l18_cle_aile')}.`,
        choix: 'Le lendemain : lui parler de Paris. Un choix.',
        fin: 'Au matin : « C’est le matin, Firmin. » Une scène.',
      },
      secret: [
        'L’examen : « La 108 » (le balcon d’honneur, au premier) ; « Six heures » (le premier funiculaire) ; « On finit avec la 108, et on monte vite au 204 » ; « Personne. Il n’y a pas de 13. »',
        'La nuit de l’aile : Firmin est planté devant la porte sans numéro, la lanterne éteinte à la main. « Il y a quelqu’un. Derrière. Il chante. Tout doucement. » Au moment où il rentre, en bas, la treizième sonnette tinte.',
        `<b>Le choix.</b> « Va à Paris, Firmin. » : le lendemain matin, la scène ${cine('firmin_depart')} ; il part, avec sa boîte et sa lettre, porter les valises des lords au Grand Hôtel du boulevard des Capucines (on ne le revoit plus à l’hôtel). « Reste ici. Tu seras concierge, un jour ; et j’ai besoin d’un second. » : la scène ${cine('firmin_reste')} ; il devient votre second (on le trouve à la loge de 7 h à 19 h), une petite clef de laiton au revers, et soixante pièces « pour le second ». Dans les deux cas, de la réputation (+4).`,
      ],
    },
    symphonie: {
      debut: `Proposée par ${gens('wolanski', 'Casimir Wolański')} (chambre 208) : « Vous cherchez quelque chose, au piano ? », puis « Donnez-moi votre carnet. » (${IL('l18_carnet')}).`,
      notes: {
        eau: 'Avec le carnet, il suffit d’être là, à l’heure : ce qu’on entend s’écrit tout seul. Les quatre écoutes, dans n’importe quel ordre ; « Où en est la symphonie ? » : il dit ce qui manque.',
        ecrire: 'Il écrit : on ne le dérange pas (il reste dans sa chambre jusqu’au lendemain).',
        preparer: 'Une vingtaine d’heures après : « Et maintenant ? » Un choix ; puis demander à M. Brissac (« Un concert, dans la salle de bal, demain soir. »), au chef (un buffet) et à Gaspard (les invitations).',
        concert: 'Le lendemain soir, être dans la salle de bal : une scène.',
      },
      secret: [
        'Ce qu’on entend : à la cascade, sous l’eau qui tombe, « un la, très bas, qui ne s’arrête jamais » ; à midi, après le douzième coup, le bourdon qui tient la place d’un treizième ; au col, la nuit, trois notes de flûte de berger, montantes — et une quatrième, parfois ; au cercle, à minuit, dans un silence si complet qu’on entend son sang, un fredonnement très bas qui monte des pierres, quatre notes, une phrase qui ne finit pas, et qui s’arrête quand on lève le crayon.',
        `<b>Le choix.</b> « Jouez-le. C’est pour cela qu’on est montés si haut. » : la symphonie entière, le quatrième mouvement aussi ; M. Wolański reste aux Cimes, et le joue le soir, très bas. « Non. Il y a des choses qu’on ne rejoue pas. » : trois mouvements et un silence à la place du quatrième ; il part pour Vienne (« Je reviendrai le chercher »). Dans les deux cas : la scène ${cine('concert')}, le manuscrit qui vous est dédié (${IL('l18_partition')}), cent quatre-vingts pièces (« la recette »), et de la réputation (+6).`,
      ],
    },
    treize: {
      debut: `Proposée par ${gens('gaspard', 'Gaspard')} : « Gaspard… la treizième sonnette ? »`,
      notes: {
        sonnette: 'La nuit, quand on est près de la loge, le treizième timbre du tableau des sonnettes tinte parfois tout seul ; on peut aussi s’approcher du tableau.',
        registre: 'Le registre des voyageurs, à la loge.',
        plateau: 'Dans le couloir de service (ou au salon) : une scène. Puis demander au chef : « Pour qui est le plateau de onze heures ? »',
        porte: 'Au bout du couloir du premier, dans l’aile Nord : une scène.',
        glacier: `Au ${lieu('glacier', 'glacier des Treize')}, au milieu de la spirale tracée dans la neige : <kbd>E</kbd>, creuser. On y trouve ${IL('l18_cheval')}.`,
        rendre: 'Revenir à la treize, avec ce qu’on a trouvé. Un choix.',
        fin: 'Le lendemain matin, près de l’hôtel : une scène.',
      },
      public: 3,
      secret: [
        'Le registre : à chaque premier janvier, d’une écriture différente, « Chambre 13. M. É. Rouvière, berger. Réglé. » La première ligne est de 1868, de la main de Gaspard, à quinze ans. En 1871, à l’encre rouge : « Aile fermée sur ordre de la direction. Ne plus servir. » Et dessous, au crayon : « Le plateau monte quand même. »',
        `Le chef se confesse : son grand-père, Barthélemy Mercadier, est monté au col en 1854 avec douze autres pour chercher la petite Mariette, la fille du meunier, perdue dans la neige. Douze sont redescendus. Le treizième, le berger ${lk('pnj:l18_treize', 'Étienne Rouvière')}, non : on le recense encore. Son grand-père lui a monté à manger, puis son père, puis lui. On a bâti l’hôtel sur sa bergerie : l’aile Nord. En 1871, une cliente l’a vu ; on a fermé l’aile. Le directeur paie la treize, chaque année, de sa poche. Deux réponses (« Je ne dirai rien. » ; « Le directeur a le droit de savoir. ») ; dans les deux cas, ${IL('l18_registre54')} et la clé de l’aile.`,
        `À la porte sans numéro, une voix : « Vous n’êtes pas Auguste. Auguste frappe deux fois, et il ne parle pas. » Étienne cherche encore Mariette ; si l’on retrouvait le petit cheval de bois qu’il lui avait taillé, il saurait. « Le glacier rend ce qu’il prend, quand on le lui demande au lever du jour, au milieu de la spirale. » — « J’irai demander pour vous. » Au glacier, sous la neige, le cheval, un ruban rouge au cou ; derrière vous, un rire d’enfant : ne pas se retourner.`,
        `<b>Le choix.</b> La porte s’ouvre seule ; il tend la main sans se retourner. « Descendez. Le col se veillera seul. » : au lever du jour, il redescend par le chemin des mulets (la scène ${cine('treize_fin')}) ; la chambre est vide, la treizième sonnette n’a plus de battant, l’aile Nord rouvrira au printemps ; deux cents pièces. « Restez, si vous voulez. Je viendrai vous voir. » : il veille le col, à la fenêtre de la treize ; le chef monte deux plateaux le soir ; cent vingt pièces et ${IL('tarte_baies', 2)}. Dans les deux cas, de la réputation (+6). Scènes : ${cine('plateau')}, ${cine('treize_porte')}, ${cine('treize_fin')}.`,
      ],
    },
  };
  const SOUS = { lucien: 'La comtesse de Saint-Aubin cherche son fils', firmin: 'Le groom rêve des Grands Boulevards', symphonie: 'Un compositeur qui ne peut plus marcher, et les sons de la vallée', treize: 'Une sonnette de trop, une chambre qui n’existe pas' };
  for (const id of ORDRE_A) {
    const A = ARCS[id], I = HIST[id];
    if (!A || !I) continue;
    const etape = (E) => {
      const ou = E.lieu ? (E.lieu === 'grande_porte' ? ` <small>(${lieu('grande_porte', 'la Grande Porte')})</small>` : ` <small>(${aLieu(E.lieu)})</small>`) : '';
      const quand = E.quand ? ` <small>${fenetre(E.quand)}</small>` : '';
      return `<b>${esc(E.texte)}</b>${ou}${quand}${I.notes[E.id] ? `<br><span class="small">${I.notes[E.id]}</span>` : ''}`;
    };
    const L = A.etapes || [], np = I.public || L.length;
    let h = `<p class="lead">${esc(A.resume || '')}</p>`;
    h += kv([
      ['Qui la propose', gens(A.qui)],
      ['À partir de', id === 'treize' ? `la réputation ${A.rep} — ou après la nuit de Firmin dans l’aile Nord (${arc('firmin')})` : A.rep ? `la réputation ${A.rep} (une fois engagé)` : 'dès qu’on est engagé'],
      ['Étapes', String(L.length)],
    ]);
    h += `<p>${I.debut}</p>`;
    h += h3('Les étapes') + `<ol>${L.slice(0, np).map((E) => `<li>${etape(E)}</li>`).join('')}</ol>`;
    if (np < L.length) h += SEC(`<ol start="${np + 1}">${L.slice(np).map((E) => `<li>${etape(E)}</li>`).join('')}</ol>`, 'La suite des étapes : masqué (secrets).');
    h += h3('Ce qu’on y apprend, les choix, la fin') + SEC(ul(I.secret), 'Ce qu’on y apprend, les choix et la fin : masqué (secrets).');
    h += `<p>${hotelL('Le Grand Hôtel des Cimes')} · ${metier('Le métier de concierge')} · ${ORDRE_A.filter((k) => k !== id && ARCS[k]).map((k) => arc(k)).join(' · ')}</p>`;
    SP('sys:l18_' + id, { t: `« ${A.titre} »`, s: `Une histoire du Grand Hôtel des Cimes : ${SOUS[id] || ''}`, c: ['grand-hotel'], i: '✎', h });
  }

  // ================================================================ les gens de l’hôtel
  const journee = (G) => `<p class="sched">${(G.horaire || []).map(([hh, pl, pose]) => `<span class="sch"><b>${heure(hh)}</b> ${pose === 'absent' ? 'n’est plus là' : pose === 'dort' ? 'dort, ' + esc(L18_PLACE[pl] || pl) : esc((L18_PLACE[pl] || pl) + (pose === 'travail' ? ', au travail' : ''))}</span>`).join(' ')}</p>`;
  for (const id of ORDRE) {
    const G = GENS[id];
    if (!G) continue;
    const Pp = PAROLES[id] || {};
    let h = kv([['Rôle', esc(cap(G.role || ''))], ['Vit', esc(L18_VIT[id] || 'au Grand Hôtel des Cimes')]]);
    h += `<p class="lead">${esc(G.bio || '')}</p>`;
    if ((G.traits || []).length) h += h3('Son caractère') + `<p>${esc(cap((G.traits || []).join(', ')))}.</p>`;
    if (id !== 'treize') h += h3('Sa journée') + journee(G);
    if (Pp.inconnu) h += h3('La première fois') + `<blockquote>${esc(Pp.inconnu)}</blockquote>`;
    const rep = [...(Pp.jour || [])].map((t) => `<li>${esc(t)}</li>`).join('');
    const ami = (Pp.ami || []).map((t) => `<li>${esc(t)}</li>`).join('');
    if (rep || ami || Pp.nuit) h += h3('Ce qu’on l’entend dire') + `<details><summary>Toutes ses répliques</summary>${rep ? `<h5>D’ordinaire</h5><ul class="qs">${rep}</ul>` : ''}${ami ? `<h5>Entre amis <small>(amitié 30 et plus)</small></h5><ul class="qs">${ami}</ul>` : ''}${Pp.nuit ? `<h5>La nuit</h5><ul class="qs"><li>${esc(Pp.nuit)}</li></ul>` : ''}</details>`;
    const parts = (L18_PART[id] || []).filter((a) => ARCS[a]);
    if (parts.length) h += h3('Dans les histoires') + `<p>${parts.map((a) => arc(a)).join(' · ')}</p>`;
    if (id === 'cocher') h += `<p class="small">À la remise, on lui demande de redescendre à Valbrume en voiture (${REGL.voiture || 6} pièces ; rien pour le personnel). Ses chevaux : Grisou, Mistral, et la Duchesse (« Elle mord »).</p>`;
    if (id === 'joseph') h += `<p class="small">Le funiculaire marche de 6 h à 21 h, pendant qu’il est à la gare haute.</p>`;
    if (id === 'gaspard') h += `<p class="small">Il tient la loge du matin jusqu’à 13 h quand le concierge n’est pas de service ; la nuit, à la table du veilleur.</p>`;
    h += `<p>${hotelL('Le Grand Hôtel des Cimes')} · ${metier('Le métier de concierge')}</p>`;
    P('pnj:l18_' + id, { t: G.nom, s: cap(G.role || ''), c: ['grand-hotel'], g: 'Le Grand Hôtel des Cimes', i: '☺', x: id === 'treize' ? 1 : 0, h });
  }
}

// ============================================================================ C18 : LE GRAND CERCLE
// les règles des jeux, telles que le jeu les a (C18_REGLES et les constantes qui les précèdent), lues dans la source
function reglesC18(T, log) {
  const src = lire('11-zzzzzzzzC18-2-jeux.js');
  const a = src.indexOf('const C18_MIN'), b = src.indexOf('const C18_REGLES = {'), c = b >= 0 ? src.indexOf('\n};', b) : -1;
  if (a < 0 || b < 0 || c < 0 || a > b) { log('C18_REGLES introuvable dans src/11-zzzzzzzzC18-2-jeux.js : pas de chances calculées'); return null; }
  try {
    const ctx = { Math, C18_ROUGES: new Set(T('C18_ROUGES', []) || []) };
    vm.createContext(ctx);
    vm.runInContext(src.slice(a, c + 3) + '\n;globalThis.__R = { R: C18_REGLES, ROULEAUX: C18_ROULEAUX, TROIS: C18_BANDIT_TROIS, CAGNOTTE: C18_CAGNOTTE };', ctx, { timeout: 4000 });
    return ctx.__R;
  } catch (e) { log('C18_REGLES : ' + e.message); return null; }
}
// le vingt-et-un, le meilleur jeu, calculé exactement (sabot sans fin) — la méthode de tools/equilibrage/C18.js : le
// croupier tire jusqu'à 16 et sur 17 souple, sa seconde carte après le joueur (son naturel prend tout, la mise doublée
// aussi) ; le naturel du joueur paie 6 pour 5 ; doubler sur deux cartes ; pas de séparation
function vingtEtUn() {
  const P = []; for (let v = 1; v <= 10; v++) P[v] = v === 10 ? 4 / 13 : 1 / 13;
  const plus = (t, s, v) => [t + v, s || v === 1];
  const best = (t, s) => (s && t + 10 <= 21 ? t + 10 : t);
  const memo = new Map();
  const croupier = (t, s, n) => {
    const k = t + ',' + s + ',' + n;
    if (memo.has(k)) return memo.get(k);
    const b = best(t, s), out = {};
    if (n === 2 && b === 21) out.N = 1;
    else if (b > 21) out[22] = 1;
    else if (!(b < 17 || (b === 17 && s && t + 10 === 17))) out[b] = 1;
    else for (let v = 1; v <= 10; v++) { const [T2, S2] = plus(t, s, v), D = croupier(T2, S2, n + 1); for (const r in D) out[r] = (out[r] || 0) + P[v] * D[r]; }
    memo.set(k, out); return out;
  };
  const dist = []; for (let u = 1; u <= 10; u++) dist[u] = croupier(u, u === 1, 1);
  const rester = (t, D) => { let e = 0; for (const r in D) { const p = D[r]; if (r === 'N') e -= p; else if (+r === 22) e += p; else e += p * Math.sign(t - +r); } return e; };
  const mj = new Map();
  const jouer = (t, s, u) => {
    const k = t + ',' + s + ',' + u;
    if (mj.has(k)) return mj.get(k);
    const b = best(t, s);
    let e;
    if (b > 21) e = -1;
    else { let eT = 0; for (let v = 1; v <= 10; v++) { const [T2, S2] = plus(t, s, v); eT += P[v] * (best(T2, S2) > 21 ? -1 : jouer(T2, S2, u)); } e = Math.max(rester(b, dist[u]), b >= 21 ? -9 : eT); }
    mj.set(k, e); return e;
  };
  const doubler = (t, s, u) => { let e = 0; for (let v = 1; v <= 10; v++) { const [T2, S2] = plus(t, s, v), b = best(T2, S2); e += P[v] * (b > 21 ? -2 : 2 * rester(b, dist[u])); } return e; };
  const naif = (t, s, u) => { const b = best(t, s); if (b > 21) return -1; if (b >= 17) return rester(b, dist[u]); let q = 0; for (let v = 1; v <= 10; v++) { const [T2, S2] = plus(t, s, v); q += P[v] * naif(T2, S2, u); } return q; };
  let E = 0, En = 0;
  for (let u = 1; u <= 10; u++) for (let a = 1; a <= 10; a++) for (let c = 1; c <= 10; c++) {
    const p = P[u] * P[a] * P[c], t = a + c, s = a === 1 || c === 1, b = best(t, s);
    if (b === 21) { const e = (1 - (dist[u].N || 0)) * 1.2; E += p * e; En += p * e; continue; }
    let eT = 0; for (let v = 1; v <= 10; v++) { const [T2, S2] = plus(t, s, v); eT += P[v] * (best(T2, S2) > 21 ? -1 : jouer(T2, S2, u)); }
    E += p * Math.max(rester(b, dist[u]), eT, doubler(t, s, u)); En += p * naif(t, s, u);
  }
  return { E, En, naturel: 2 * P[1] * P[10] };
}
// les chances de chaque mise, calculées avec les règles du jeu
function chancesC18(G, MIN, MAX) {
  const { R, ROULEAUX } = G, out = {};
  // la roulette : 37 cases
  const rl = (k) => { let e = 0, w = 0; for (let n = 0; n <= 36; n++) { const r = R.rouletteRend(k, n); e += r / 37; if (r) w++; } return { p: w / 37, edge: 1 - e }; };
  out.roulette = { plein: rl('n:17'), simple: rl('rouge'), douzaine: rl('d1') };
  // le passe-dix : 216 tirages
  const ds = (k) => { let s = 0, w = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) for (let c = 1; c <= 6; c++) { const r = R.rendDes(k, 10, [a, b, c]); s += r; if (r) w++; } return { p: w / 216, edge: 1 - s / 2160 }; };
  out.des = { passe: ds('passe'), manque: ds('manque'), brelan: ds('brelan'), point: ds('point:1') };
  // le bandit manchot : toutes les combinaisons des trois rouleaux
  {
    const cnt = {}; let s = 0, n = 0;
    for (const a of ROULEAUX[0]) for (const b of ROULEAUX[1]) for (const c of ROULEAUX[2]) {
      const g = R.gainBandit(a, b, c); s += g; n++;
      const k = a === b && b === c ? 'trois:' + a : g === 4 ? 'deuxfers' : g === 1 ? (a === b ? 'deux' : 'fer') : g ? 'autre' : 'rien';
      cnt[k] = (cnt[k] || 0) + 1;
    }
    out.bandit = { rend: s / n, p: Object.fromEntries(Object.entries(cnt).map(([k, c]) => [k, c / n])) };
  }
  // le baccara : le tableau du jeu, carte par carte
  {
    const W = [4 / 13, 1 / 13, 1 / 13, 1 / 13, 1 / 13, 1 / 13, 1 / 13, 1 / 13, 1 / 13, 1 / 13], K = (v) => ({ r: v === 0 ? 10 : v, c: 0 });
    let pP = 0, pB = 0, pT = 0;
    for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) for (let c = 0; c < 10; c++) for (let d = 0; d < 10; d++) {
      const p0 = W[a] * W[b] * W[c] * W[d], P0 = [K(a), K(c)], B0 = [K(b), K(d)], tp0 = R.tb(P0), tb0 = R.tb(B0);
      if (tp0 >= 8 || tb0 >= 8) { if (tp0 > tb0) pP += p0; else if (tb0 > tp0) pB += p0; else pT += p0; continue; }
      for (let e = 0; e < 10; e++) {
        const pe = tp0 <= 5 ? W[e] : (e === 0 ? 1 : 0);
        if (!pe) continue;
        const tp = tp0 <= 5 ? R.tb([...P0, K(e)]) : tp0, tire = R.banqueTire(tb0, tp0 <= 5 ? e : null);
        for (let f = 0; f < 10; f++) {
          const pf = tire ? W[f] : (f === 0 ? 1 : 0);
          if (!pf) continue;
          const tb = tire ? R.tb([...B0, K(f)]) : tb0, p = p0 * pe * pf;
          if (tp > tb) pP += p; else if (tb > tp) pB += p; else pT += p;
        }
      }
    }
    // (les mises qu'on peut faire avec les jetons de la table : 10, puis tout multiple de 5 à partir de 20)
    const mises = []; for (let m = MIN.baccara || 10; m <= (MAX.baccara || 200); m += 5) if (m !== 15) mises.push(m);
    const ev = (cote, m) => 1 - (pP * R.rendBaccara(cote, m, 5, 3) + pB * R.rendBaccara(cote, m, 3, 5) + pT * R.rendBaccara(cote, m, 4, 4)) / m;
    const borne = (cote) => { const L = mises.map((m) => ev(cote, m)); return [Math.min(...L), Math.max(...L)]; };
    out.baccara = { pP, pB, pT, punto: borne('punto'), banco: borne('banco'), egalite: borne('egalite') };
  }
  out.vingt = vingtEtUn();
  return out;
}
// la croupière, le barman, le docteur : ce qui, dans leurs mots, appartient à la nuit (sous « révéler les secrets »)
const C18_NUIT = { odile: ['ordinaire', 'minuit'], theodule: ['ordinaire:0'], docteur: ['ordinaire:0'] };
const C18_OU = { odile: 'à la roulette, au milieu de la salle', rigobert: 'au passe-dix, au fond', valentin: 'au vingt-et-un, au fond', desire: 'au baccara, au fond', theodule: 'au bar, contre le mur du fond', caissiere: 'à la caisse grillagée, près de l’entrée', directrice: 'dans la salle', portier: 'à la porte', pianiste: 'au piano', notaire: 'à la roulette', pelagie: 'aux bandits manchots', capitaine: 'au vingt-et-un', comtesse: 'au baccara', coquard: 'au passe-dix', docteur: 'il regarde jouer' };

function cercle(X, H) {
  const { T, SP, P, SEC, esc, IL, lk, nfmt, MF, NAMES, mapBtn } = X;
  const { h3, ul, tbl, kv, lieu, pg, log } = H;
  const GENS = T('C18_GENS', null), PAR = T('C18_PAROLES', {}) || {}, MIN = T('C18_MIN', {}) || {}, MAX = T('C18_MAX', {}) || {};
  const JETONS = T('C18_JETONS', [5, 10, 25, 50, 100]) || [], TROIS = T('C18_BANDIT_TROIS', {}) || {}, SYMB = T('C18_SYMBOLES', {}) || {}, NOMS = T('C18_NOMS_JEUX', {}) || {};
  const BOISSONS = T('C18_BOISSONS', []) || [], HEURES = T('C18_HEURES', [18, 3]) || [18, 3], SUITE = T('C18_SUITE', { nuit: 350, achat: 30000 }) || {}, ARMES = T('C18_ARMES', []) || [], TXT = T('C18_TEXTES', {}) || {};
  if (!GENS) { log('C18_GENS introuvable : pas de fiche du Grand Cercle'); return; }
  const files = Object.keys(MF || {}).filter((f) => /C18-/.test(f));
  const scal = (f, k, d) => { const M = MF && MF[f]; return M && M.scal && M.scal[k] && typeof M.scal[k].v === 'number' ? M.scal[k].v : d; };
  const srcNum = (f, k, d) => { const m = lire(f).match(new RegExp('\\b' + k + '\\s*=\\s*(\\d+(?:\\.\\d+)?)')); return m ? +m[1] : d; };
  const CAGNOTTE = scal('11-zzzzzzzzC18-2-jeux.js', 'C18_CAGNOTTE', 0.075), PLAFOND = scal('11-zzzzzzzzC18-2-jeux.js', 'C18_PLAFOND_NUIT', 1500);
  const ENTREE = srcNum('11-zzzzzzzzC18-3-cercle.js', 'C18_ENTREE', 10), CARTE = srcNum('11-zzzzzzzzC18-3-cercle.js', 'C18_CARTE', 300);
  const ville = (NAMES && NAMES.ville) || 'Valbrume';
  const G = reglesC18(T, log), CH = G ? chancesC18(G, MIN, MAX) : null;
  const ch = (f, d) => { try { return CH ? f(CH) : d; } catch (e) { return d; } };
  const nom = (id) => cap((GENS[id] || {}).nom || id);
  const gens = (id, t) => lk('pnj:c18_' + id, t || nom(id));
  const jeu = (k, t) => lk('sys:c18_' + k, t || (NOMS[k] ? NOMS[k].toLowerCase() : k));
  const cercleL = (t) => lk('sys:cercle', t || 'le Grand Cercle');
  const hh = (a, b) => `de ${heure(a)} à ${heure(b)}`;
  const vers = (x, d) => pct(x, d === undefined ? 1 : d);

  // ---------------------------------------------------------------- les cinq jeux (une section chacun, et sa fiche)
  const JEUX = {
    roulette: () => {
      let s = `<p>Tenue par ${gens('odile', 'Odile')}, la croupière. Un seul zéro, trente-sept cases. On choisit la valeur de ses jetons (${JETONS.filter((v) => v >= (MIN.roulette || 5)).join(', ')}), on les pose sur le tapis en cliquant les cases — de ${MIN.roulette} à ${MAX.roulette} par coup, toutes mises comprises —, puis « Lancer la bille ». Le zéro fait perdre toutes les mises simples et les douzaines.</p>`;
      s += tbl(['Mise', 'Paie', 'Chances de gagner', 'La maison garde'], [
        ['Plein : un numéro, de 0 à 36', '35 pour 1', ch((C) => vers(C.roulette.plein.p, 2), '2,70 %'), ch((C) => vers(C.roulette.plein.edge), '2,7 %')],
        ['Rouge ou noir ; pair ou impair ; manque (1 à 18) ou passe (19 à 36)', '1 pour 1', ch((C) => vers(C.roulette.simple.p), '48,6 %'), ch((C) => vers(C.roulette.simple.edge), '2,7 %')],
        ['Une douzaine (1 à 12, 13 à 24, 25 à 36)', '2 pour 1', ch((C) => vers(C.roulette.douzaine.p), '32,4 %'), ch((C) => vers(C.roulette.douzaine.edge), '2,7 %')],
      ]);
      return s;
    },
    vingt: () => {
      let s = `<p>Tenu par ${gens('valentin', 'Monsieur Valentin')}. Une main contre le croupier, de ${MIN.vingt} à ${MAX.vingt} jetons (des jetons de ${JETONS.filter((v) => v >= (MIN.vingt || 10)).join(', ')}). Le sabot ne finit jamais : chaque carte vient au hasard, on ne compte pas. « Miser et donner », puis « Tirer », « Rester » ou « Doubler » (sur les deux premières cartes : la mise doublée, une carte, une seule) ; pas de séparation. Le croupier tire jusqu’à 16, et sur 17 souple ; il ne prend sa seconde carte qu’après vous, et son vingt-et-un naturel emporte tout, la mise doublée aussi.</p>`;
      s += tbl(['Coup', 'Paie', 'Chances'], [
        ['Le vingt-et-un naturel (un as et un dix ou une figure, en deux cartes)', '6 pour 5', ch((C) => vers(C.vingt.naturel), '4,7 %') + ' des mains'],
        ['Une main qui bat le croupier', '1 pour 1', '—'],
        ['Égalité', 'la mise rendue', '—'],
      ]);
      s += `<p>La maison garde ${ch((C) => vers(-C.vingt.E), '2,7 %')} contre le meilleur jeu ; ${ch((C) => vers(-C.vingt.En), '7,5 %')} contre qui joue comme le croupier (tirer jusqu’à 17, ne jamais doubler).</p>`;
      return s;
    },
    baccara: () => {
      let s = `<p>Tenu par ${gens('desire', 'Monsieur Désiré')}, le banquier. Punto banco, le tableau ordinaire : le punto tire une troisième carte à 5 et moins, la banque selon sa main et la carte du punto. On mise sur le punto, la banque ou l’égalité (de ${MIN.baccara} à ${MAX.baccara} par coup, toutes mises comprises), puis « Donner les cartes ». Un gain est payé moins la cagnotte (${pct(CAGNOTTE, 1)} du gain, arrondi en faveur de la maison) ; sur une égalité, les mises sur le punto et la banque sont rendues.</p>`;
      const B = (k, d) => ch((C) => `${vers(C.baccara[k][0])} à ${vers(C.baccara[k][1])}`, d);
      s += tbl(['Mise', 'Paie', 'Chances de gagner', 'La maison garde'], [
        ['Le punto', '1 pour 1, cagnotte déduite', ch((C) => vers(C.baccara.pP), '44,6 %'), B('punto', '≈ 4,6 %')],
        ['La banque', '1 pour 1, cagnotte déduite', ch((C) => vers(C.baccara.pB), '45,8 %'), B('banco', '≈ 2,2 %')],
        ['L’égalité', '10 pour 1, cagnotte déduite', ch((C) => vers(C.baccara.pT), '9,5 %'), B('egalite', '≈ 2,5 %')],
      ]);
      s += `<p class="small">Ce que garde la maison dépend un peu de la mise : la cagnotte arrondit à la pièce, en sa faveur, et pèse plus sur les petites mises.</p>`;
      return s;
    },
    des: () => {
      let s = `<p>Tenu par ${gens('rigobert', 'Rigobert')}. Trois dés, contre la banque, de ${MIN.des} à ${MAX.des} par coup, toutes mises comprises (des jetons de ${JETONS.filter((v) => v >= (MIN.des || 5)).join(', ')}) ; puis « Lancer les dés ». « Les brelans sont pour la banque ! » : trois dés pareils font perdre passe et manque.</p>`;
      s += tbl(['Mise', 'Paie', 'Chances de gagner', 'La maison garde'], [
        ['Passe (11 à 18)', '1 pour 1', ch((C) => vers(C.des.passe.p), '48,6 %'), ch((C) => vers(C.des.passe.edge), '2,8 %')],
        ['Manque (3 à 10)', '1 pour 1', ch((C) => vers(C.des.manque.p), '48,6 %'), ch((C) => vers(C.des.manque.edge), '2,8 %')],
        ['Un brelan (trois dés pareils)', '33 pour 1', ch((C) => vers(C.des.brelan.p), '2,8 %'), ch((C) => vers(C.des.brelan.edge), '5,6 %')],
        ['Sur un point (de 1 à 6)', '1 pour 1 par dé qui le montre (2 pour 1 sur deux dés, 3 pour 1 sur trois)', ch((C) => vers(C.des.point.p), '42,1 %'), ch((C) => vers(C.des.point.edge), '7,9 %')],
      ]);
      s += `<p class="small">À l’auberge, on joue aussi aux dés, entre clients : ${pg('act:des', 'les dés')}.</p>`;
      return s;
    },
    bandit: () => {
      const m = MIN.bandit || 5;
      let s = `<p>Trois machines américaines contre la façade, sans croupier : « Glisser un jeton de ${m} et tirer le bras ». Trois rouleaux de dix cases (des fers à cheval, des carreaux, des piques, des cœurs, des cloches, des étoiles) ; on gagne sur la ligne du milieu. Ce qu’elle rend, c’est tant de fois la mise.</p>`;
      const sym = (k) => esc(SYMB[k] || k);
      const L = Object.entries(TROIS).sort((a, b) => b[1] - a[1]).map(([k, g]) => [`Trois ${sym(k)}${k === 'fer' ? 's à cheval' : 's'}`, `${g} fois la mise (${g * m} jetons)`, ch((C) => vers(C.bandit.p['trois:' + k] || 0), '—')]);
      L.push(['Deux fers à cheval', `4 fois la mise (${4 * m} jetons)`, ch((C) => vers(C.bandit.p.deuxfers || 0), '—')]);
      L.push(['Les deux premiers rouleaux pareils', 'la mise rendue', ch((C) => vers(C.bandit.p.deux || 0), '—')]);
      L.push(['Un fer à cheval au premier rouleau', 'la mise rendue', ch((C) => vers(C.bandit.p.fer || 0), '—')]);
      L.push(['Rien de tout cela', 'rien', ch((C) => vers(C.bandit.p.rien || 0), '—')]);
      s += tbl(['Sur la ligne', 'Elle rend', 'Chances'], L);
      s += `<p>Elle rend ${ch((C) => vers(C.bandit.rend), '93,9 %')} de ce qu’on y met : la maison garde ${ch((C) => vers(1 - C.bandit.rend), '6,1 %')}. ${gens('pelagie', 'Madame Pélagie')} y passe ses soirées : « Prenez donc l’autre, celle-ci me connaît. »</p>`;
      return s;
    },
  };
  const LEADS = {
    roulette: 'Un seul zéro. Le plein paie trente-cinq pour un, les chances simples un pour un, les douzaines deux pour un.',
    vingt: 'Le croupier tire jusqu’à seize et sur dix-sept souple ; le vingt-et-un naturel paie six pour cinq ; on double sur deux cartes.',
    baccara: 'Punto ou banque, payés un pour un, cagnotte déduite ; l’égalité, dix pour un.',
    des: 'Trois dés : passe ou manque, les brelans pour la banque ; le brelan, trente-trois pour un ; « sur un point », payé par dé.',
    bandit: 'Une machine américaine, un jeton de cinq : trois cloches, quarante fois la mise.',
  };
  const ORDRE_J = ['roulette', 'vingt', 'baccara', 'des', 'bandit'];
  const sections = {};
  for (const k of ORDRE_J) { try { sections[k] = JEUX[k](); } catch (e) { log('jeu ' + k + ' : ' + e.message); sections[k] = ''; } }

  // ---------------------------------------------------------------- la fiche du Cercle
  {
    let h = `<p class="lead">Le Grand Cercle de ${esc(ville)}, fondé en 1852 « pour l’agrément des honnêtes gens » : un casino en pleine ville, au sud-est de la place, entre la grand-rue et la maison Delorme, adossé au rempart sud. La façade regarde le marché ; une marquise, une enseigne, une grande porte entre deux étals. Deux niveaux sous un toit d’ardoise : la grande salle et ses jeux au rez-de-chaussée, la suite Impériale à l’étage.</p>`;
    h += kv([
      ['Où', `${lieu('casino', 'le Grand Cercle')}, à ${lieu('place', 'la place')} de ${esc(ville)} ${mapBtn('li:casino')}`],
      ['Ouvert', `${hh(HEURES[0], HEURES[1])} (« On ne dit pas casino, ici, on dit le Cercle »)`],
      ['L’entrée', `le droit de cercle, ${ENTREE} pièces la soirée ; ou la carte de membre, ${CARTE} pièces, une fois pour toutes`],
      ['Les jetons', `un jeton vaut une pièce, à l’achat comme au change ; ${nfmt(PLAFOND)} jetons au plus par soirée`],
      ['Les jeux', ORDRE_J.map((k) => jeu(k)).join(', ')],
      ['À l’étage', `${lk('sys:c18_suite', 'la suite Impériale')} : ${nfmt(SUITE.nuit)} pièces la nuit, ${nfmt(SUITE.achat)} à l’achat`],
    ]);
    h += h3('La porte') + ul([
      `${gens('portier', 'Siméon')}, le portier, tient la porte ${hh(HEURES[0], HEURES[1])} : il l’ouvre quand on arrive, la referme derrière. Le droit de cercle, ${ENTREE} pièces pour la soirée (une soirée court de midi à midi) ; ou ${IL('c18_carte_membre')}, ${CARTE} pièces une fois pour toutes : on entre sans payer, et il vous reconnaît. Qui loue la suite, pour sa nuit, ou la possède, entre sans payer.`,
      `On n’entre pas une arme ou un outil à la main (${ARMES.slice(0, 8).map((k) => IL(k)).join(', ')}…) : « Rangez-moi ça. »`,
      `Fermé, une plaque de cuivre le dit : « Ouvert de six heures du soir à trois heures du matin. Tenue correcte exigée. La maison ne fait pas crédit. » À trois heures moins dix, la directrice annonce la fermeture. Le propriétaire de la suite entre à toute heure ; le reste de la maison, après trois heures, n’est à personne.`,
      'Quelqu’un qui ne tient plus debout, les croupiers le renvoient : « Revenez demain, la table vous attendra. »',
    ]);
    h += h3('La caisse') + ul([
      `La caisse grillagée, près de l’entrée : ${gens('caissiere', 'Madame Crozet')}. On achète des jetons par 50, 100, 250 ou 500, une pièce le jeton ; on les rechange au même prix (« Changer vos jetons contre des pièces »). Les jetons qu’on garde restent à soi d’une soirée à l’autre.`,
      `La caisse ne vend pas plus de ${nfmt(PLAFOND)} jetons par soirée : « La maison ne vend plus de jetons ce soir à monsieur. Ni à personne qui lui ressemble. »`,
      `On y loue aussi la suite pour la nuit.`,
      `Aux tables, on choisit la valeur de ses jetons (${JETONS.join(', ')}) et l’on mise par jetons de cette valeur. La croupière vous le dit quand vous avez perdu plus de 400 jetons dans la soirée : « Rentrez. La maison gagne toujours. »`,
    ]);
    h += h3('Les jeux') + tbl(['Jeu', 'Tenu par', 'Mises', 'La maison garde'], [
      [jeu('roulette', 'La roulette'), gens('odile', 'Odile'), `${MIN.roulette} à ${MAX.roulette}`, ch((C) => vers(C.roulette.simple.edge), '2,7 %')],
      [jeu('vingt', 'Le vingt-et-un'), gens('valentin', 'Monsieur Valentin'), `${MIN.vingt} à ${MAX.vingt}`, ch((C) => `${vers(-C.vingt.E)} (contre le meilleur jeu)`, '≈ 2,7 %')],
      [jeu('baccara', 'Le baccara'), gens('desire', 'Monsieur Désiré'), `${MIN.baccara} à ${MAX.baccara}`, ch((C) => `${vers(C.baccara.banco[0])} (banque) à ${vers(C.baccara.punto[1])} (punto)`, '2,2 à 4,6 %')],
      [jeu('des', 'Le passe-dix'), gens('rigobert', 'Rigobert'), `${MIN.des} à ${MAX.des}`, ch((C) => `${vers(C.des.passe.edge)} à ${vers(C.des.point.edge)}`, '2,8 à 7,9 %')],
      [jeu('bandit', 'Le bandit manchot'), '— (trois machines)', `un jeton de ${MIN.bandit || 5}`, ch((C) => vers(1 - C.bandit.rend), '6,1 %')],
    ]) + `<p class="small">Toujours un peu, jamais beaucoup : chaque mise perd en moyenne entre 2 et 8 % de ce qu’on y met. Les tables sont ouvertes quand leur croupier est là, aux heures du Cercle.</p>`;
    for (const k of ORDRE_J) h += `<h3>${jeu(k, NOMS[k] || k)}</h3>` + sections[k];
    h += h3('Le bar') + `<p>${gens('theodule', 'Théodule')}, au bar, contre le mur du fond, aux heures du Cercle.</p>` + tbl(['Ce qu’on boit', 'Prix', ''], BOISSONS.map((b) => [esc(b.nom), `${b.prix} pièce${b.prix > 1 ? 's' : ''}`, b.u ? `de l’alcool (${String(b.u).replace('.', ',')} verre${b.u >= 2 ? 's' : ''})` : 'réveille, et l’esprit va mieux'])) + `<p class="small">Quand on a misé 400 jetons dans la soirée, le verre suivant est « pour la maison », une fois. L’alcool : ${pg('sys:alcool', 'sa fiche')}.</p>`;
    // les gens
    const pub = Object.keys(GENS).filter((id) => id !== 'gris');
    h += h3('Les gens du Cercle') + tbl(['Qui', 'Ce qu’il fait', 'Heures', 'Où'], pub.map((id) => { const Gn = GENS[id]; return [gens(id), esc(Gn.role || ''), hh(Gn.h[0], Gn.h[1]), esc(C18_OU[id] || '')]; }));
    h += `<p class="small">On leur parle (<kbd>E</kbd>) : un mot, chacun le sien ; la première fois, ils se présentent, et l’on retient leur nom.</p>`;
    h += h3('La suite Impériale') + `<p>À l’étage, par le grand escalier, au fond à droite : le salon et son balcon sur la grand-rue, la chambre et son lit à baldaquin, la salle de bains et sa baignoire de cuivre. ${nfmt(SUITE.nuit)} pièces la nuit, ${nfmt(SUITE.achat)} à l’achat : ${lk('sys:c18_suite', 'la suite Impériale')}.</p>`;
    h += h3('Le baron') + `<p>Dans le secrétaire de la suite, un carnet de maroquin noir : celui du baron Edgar de Lancry, qui loua la suite en 1879. Une petite quête en cinq temps, dans la maison même : ${lk('sys:c18_baron', 'le baron de la suite Impériale')}.</p>`;
    h += h3('Les scènes') + `<p>La première fois qu’on entre dans la grande salle, Cercle ouvert ; la première fois qu’on entre dans la suite ; et la fin du baron. Sur le moteur des cinématiques : on les passe en maintenant <kbd>Espace</kbd> ou <kbd>Échap</kbd>. Le balcon de la suite : un regard sur la ville.</p>`;
    h += SEC(h3('Ce qui se passe la nuit') + ul([
      `Dans la grande salle, « on n’y voit aucune horloge ». ${gens('odile', 'Odile')} sait des choses qu’elle ne devrait pas savoir : le nom de vos bêtes, ce qu’elles ont mangé près de la clôture, la lampe qu’on a laissée allumée chez vous. « Je suis à cette table depuis toujours. C’est-à-dire depuis hier soir. »`,
      'Après minuit, une fois par soirée, il lui arrive de dire le numéro tout haut pendant que la bille roule encore — et c’est lui qui sort. « Après minuit, on ne joue plus tout à fait pour de l’argent. »',
      `Après minuit, au bout du bar, ${lk('pnj:c18_gris', 'un homme en gris')} : on ne le voit que de loin ; de près, le tabouret est vide, et le verre, à moitié plein, encore tiède. Le barman : « L’homme du bout du bar ? Quel homme ? » Une absinthe, avant cinq heures : il lève parfois son verre vers vous.`,
      'Après minuit, une fois par soirée, toutes les flammes des lustres se couchent du même côté, comme sous un souffle. Personne n’a ouvert la porte.',
      'Entre trois et cinq heures, Cercle fermé, on entend parfois le piano, du dehors.',
      `Le docteur Malzieu a vu la croupière en 1870 : « Elle n’a pas pris une ride. » Le portier : « Je tenais déjà la porte. Madame Odile tenait déjà la roulette. »`,
      `Tout cela tient au ${lk('sys:c18_baron', 'baron')} ; sa fin y met un terme.`,
    ]), 'Ce qui se passe la nuit au Grand Cercle : masqué (secrets).');
    h += `<p>${lk('sys:c18_suite', 'La suite Impériale')} · ${lk('sys:c18_baron', 'Le baron de la suite Impériale')} · ${pg('act:cartes', 'Le vingt-et-un de l’auberge')} · ${pg('act:des', 'Les dés de l’auberge')} · ${pg('sys:dettes', 'Les dettes de la ferme')}</p>`;
    SP('sys:cercle', { t: 'Le Grand Cercle', s: `Le casino de ${ville} : cinq jeux, une caisse, un bar, et la suite Impériale à l’étage`, c: ['grand-cercle'], i: '♣', h }, files);
  }
  // ---------------------------------------------------------------- les fiches des jeux (celles du wiki du jeu)
  for (const k of ORDRE_J) {
    const h = `<p class="lead">${esc(LEADS[k] || '')}</p>` + sections[k] + `<p>${cercleL('Le Grand Cercle')} · ${ORDRE_J.filter((q) => q !== k).map((q) => jeu(q, NOMS[q] || q)).join(' · ')}</p>`;
    P('sys:c18_' + k, { t: NOMS[k] || k, s: 'Un jeu du Grand Cercle', c: ['grand-cercle'], i: '♣', x: 0, h });
  }

  // ---------------------------------------------------------------- la suite Impériale
  {
    let h = `<p class="lead">À l’étage du Grand Cercle, au-dessus de la grande salle. « Elle porte ce nom depuis que l’Empereur ne l’a pas visitée, en cinquante-huit. »</p>`;
    h += kv([
      ['Louer', `${nfmt(SUITE.nuit)} pièces la nuit, à la caisse ou à ${gens('directrice', 'la directrice')}, aux heures du Cercle ; elle est à vous jusqu’au lendemain midi`],
      ['Acheter', `${nfmt(SUITE.achat)} pièces, comptant, à la directrice (« On ne loue pas un rêve à crédit ») : un acte de vente arrive à la boîte aux lettres, et ${IL('c18_cle_suite')}`],
      ['Y monter', 'le grand escalier, au fond à droite : <kbd>E</kbd> au pied ou en haut, on monte d’un trait'],
    ]);
    h += h3('Ce qu’il y a') + ul([
      'La porte, sur le palier : une serrure anglaise, à gorges, qu’on ne crochète pas ; elle n’ouvre qu’au locataire de la nuit, ou au propriétaire.',
      'L’antichambre ; le salon et son balcon sur la grand-rue (<kbd>E</kbd> : regarder la ville, un court plan — la grand-rue, le marché, la fontaine de la place, et plus loin la vallée) ; le secrétaire (le règlement de la suite) ; le portrait, dans son cadre doré : « M. le baron E. de Lancry, 1879 ».',
      'La chambre : le lit à baldaquin (on y dort) ; la commode, un coffre à soi ; une malle de voyage cerclée de laiton, aux initiales E. L., fermée à clé.',
      'La salle de bains et sa baignoire de cuivre : un bain par jour ; l’eau est si chaude qu’on manque de s’endormir (l’esprit s’apaise, et quinze points de santé).',
      'Le règlement : « Le locataire dispose du salon, de la chambre, du cabinet de toilette et du balcon. Il est prié de ne pas décrocher le portrait. »',
      `Le propriétaire entre au Cercle à toute heure ; « il ne pourra exiger du Cercle qu’il reste ouvert au-delà de trois heures ». À dormir : ${pg('sys:sommeil', 'le sommeil')} ; à louer, ailleurs : ${pg('sys:location', 'les maisons de la ville')}.`,
    ]);
    h += SEC(ul([
      'Une nuit dans la suite, tant que le baron n’est pas parti : on a entendu tourner les pages d’un carnet, longtemps, dans le salon ; ou, à trois heures, trois petits coups à la porte, et personne dans l’escalier. Après un bain, entre minuit et cinq heures, un zéro sur la buée du miroir.',
      'La directrice, quand on signe : « Félicitations. Vous êtes le second propriétaire de cette suite. Le premier ne l’a jamais quittée. »',
      `Le carnet du secrétaire et la malle : ${lk('sys:c18_baron', 'le baron de la suite Impériale')}.`,
    ]), 'Les nuits de la suite : masqué (secrets).');
    h += `<p>${cercleL('Le Grand Cercle')} · ${lk('sys:c18_baron', 'Le baron de la suite Impériale')}</p>`;
    SP('sys:c18_suite', { t: 'La suite Impériale', s: `À l’étage du Grand Cercle : ${nfmt(SUITE.nuit)} pièces la nuit, ${nfmt(SUITE.achat)} à l’achat`, c: ['grand-cercle'], i: '♛', h });
  }
  // ---------------------------------------------------------------- le baron
  {
    let h = `<p class="lead">Dans le secrétaire de la suite Impériale, un carnet de maroquin noir, plein de colonnes de chiffres : celui du baron Edgar de Lancry. Une petite quête en cinq temps, dans la maison même, qui se finit à la roulette, après minuit.</p>`;
    h += h3('Les étapes') + `<ol>${[
      `Louer la suite (ou l’acheter) et ouvrir le secrétaire du salon : ${IL('c18_carnet')} (en main, un clic : le relire).`,
      `Demander au ${gens('portier', 'portier')}, à la porte, s’il a connu le baron de Lancry : il ouvre le registre du Cercle.`,
      `Parler à ${gens('directrice', 'la directrice')} de la malle du baron : elle donne ${IL('c18_cle_malle')} — à qui a loué la suite au moins une fois, ou l’a achetée.`,
      `Ouvrir la malle, dans la chambre de la suite : ${IL('c18_jeton_noir')} et ${IL('c18_lettre_baron')}.`,
      `Jouer le jeton comme le baron le demande : après minuit (de minuit à trois heures), à ${gens('odile', 'Odile')}, à la roulette.`,
    ].map((x) => `<li>${x}</li>`).join('')}</ol>`;
    h += SEC(ul([
      `Le carnet : « 3 octobre 1879. Elle a dit dix-sept avant que la bille tombe… » ; « 13 novembre. Il me reste un jeton, celui que mon père m’a laissé. Je le mettrai sur le zéro. » La suite est blanche.`,
      `Le registre : « 13 novembre 1879. M. le baron Edgar de Lancry, suite Impériale. Entré : minuit. Sorti : — » La ligne suivante est de la même main, de la même encre ; elle date de la semaine dernière.`,
      `La lettre, à sa sœur Clémence : « On ne quitte pas cette table. On croit se lever ; on se rassoit. La croupière ne vieillit pas… Qu’il garde le jeton, qu’il le joue pour moi. Le zéro. Toujours le zéro. Et qu’il ne reste pas au-delà de trois heures. »`,
      `La fin : « Sur le zéro, n’est-ce pas. Comme lui. » — « Poser le jeton noir sur le zéro » (ou le garder : il attendra). Une scène : au bout du bar, ${lk('pnj:c18_gris', 'l’homme en gris')} se retourne pour la première fois ; « Le zéro, monsieur le baron. Comme toujours. » La bille hésite longtemps, et tombe dans la case verte. Il ramasse son chapeau et monte le grand escalier sans faire craquer une marche ; en haut, la porte de la suite ne s’ouvre pas : il n’est plus là. « Il a perdu. Il va pouvoir partir. Merci. »`,
      `Ce qu’il laisse sur le tapis : ${IL('c18_chevaliere')}, « pour vous ». Le portrait du salon est vide, désormais — un fauteuil, et personne ; l’homme en gris ne revient plus, ni les coups à la porte de la suite.`,
    ]), 'Le carnet, le registre, la lettre et la fin : masqué (secrets).');
    h += `<p>${cercleL('Le Grand Cercle')} · ${lk('sys:c18_suite', 'La suite Impériale')}</p>`;
    SP('sys:c18_baron', { t: 'Le baron de la suite Impériale', s: 'Une petite quête au Grand Cercle, en cinq temps', c: ['grand-cercle'], i: '✧', h });
  }
  // ---------------------------------------------------------------- les gens du Cercle (celles du wiki du jeu)
  const fmt = (t) => esc(String(t || '').replace(/\{prenom\}/g, '‹votre prénom›').replace(/\{bete\}/g, '‹une de vos bêtes›').replace(/\{ville\}/g, ville).replace(/\{jour\}/g, '‹jour›').replace(/\{perdu\}/g, '‹ce qu’on a perdu›'));
  const LIB = { salut: 'La première fois', ordinaire: 'D’ordinaire', accueil: 'À la table', faites: 'Avant le coup', riennevaplus: 'La bille lancée', lance: 'Les dés lancés', donne: 'La donne', perdu: 'Quand la banque gagne', offert: 'Un verre offert', conseil: 'Quand on perd trop', minuit: 'Après minuit' };
  for (const id of Object.keys(GENS)) {
    const Gn = GENS[id], Pp = PAR[id] || {}, nuit = C18_NUIT[id] || [];
    const secret = id === 'gris';
    let h = kv([['Rôle', esc((Gn.role === '—' ? 'un homme en gris, au bout du bar' : Gn.role) + ', au Grand Cercle')]]);
    h += `<p class="lead">${secret ? 'On ne le voit qu’après minuit, et de loin, au bout du bar.' : `${esc(cap(Gn.titre || ''))}, ${hh(Gn.h[0], Gn.h[1])}${C18_OU[id] ? ' : ' + esc(C18_OU[id]) : ''}.`}</p>`;
    const pubL = [], secL = [];
    for (const [k, L] of Object.entries(Pp)) {
      (L || []).forEach((t, i) => {
        const cache = !secret && (nuit.includes(k) || nuit.includes(k + ':' + i));
        (cache ? secL : pubL).push(`<h5>${esc(LIB[k] || cap(k))}</h5><ul class="qs"><li>${fmt(t)}</li></ul>`);
      });
    }
    if (pubL.length) h += h3('Ce qu’on l’entend dire') + `<details><summary>Ses mots</summary>${pubL.join('')}</details>`;
    if (secL.length) h += SEC(`<h5>La nuit, ce qu’elle sait</h5>${secL.join('')}`, 'Ce qu’on l’entend dire la nuit : masqué (secrets).');
    if (id === 'odile' || id === 'portier' || id === 'directrice') h += `<p class="small">Dans ${lk('sys:c18_baron', 'le baron de la suite Impériale')}.</p>`;
    if (secret) h += `<p>${lk('sys:c18_baron', 'Le baron de la suite Impériale')} ; ${cercleL('Le Grand Cercle')}.</p>`;
    else h += `<p>${cercleL('Le Grand Cercle')}${Gn.jeu ? ' · ' + jeu(Gn.jeu, NOMS[Gn.jeu] || Gn.jeu) : ''}</p>`;
    P('pnj:c18_' + id, { t: secret ? 'L’homme en gris' : nom(id), s: secret ? 'Au bout du bar, après minuit' : (Gn.role || ''), c: ['grand-cercle'], g: 'Le Grand Cercle', i: '☺', x: secret ? 1 : 0, h });
  }
}

// ============================================================================ K18 : LES RÉCITS DES PROCHES
// (K18_ARCS, tel que le wiki le lit, a perdu ses fonctions — choix qui dépendent de la partie, étapes qui n'existent
// que sur un chemin, fins calculées : ce qui suit le dit en clair, d'après 05-zzzzzzzK18-1/2/3-arcs.js)
// ce que le récit laisse voir, quand son accroche en dirait trop (elle va sous « révéler les secrets »)
const K18_PREMISSE = {
  forgeron: 'Le forgeron a les yeux rouges, ces temps-ci : certaines nuits, il ne dort pas. Ce qui le tient éveillé remonte à la mine, et à son père.',
  fillette: 'La petite Aubert a un secret, qu’elle ne confie qu’à ceux qui jurent « croix de bois, croix de fer ». Il y est question du vieux puits, et de son papa.',
  guerisseuse: 'La guérisseuse cherche quelqu’un à qui laisser le grimoire de sa grand-mère, « pour celle qui viendra ».',
};
// les étapes qui n'existent que sur un chemin (« si » dans le récit) : à quelle condition
const K18_SI = {
  forgeron: { reponse: 'si l’on a dit « Demandez-la. Aujourd’hui. »', noce: 'si elle a dit oui' },
  fillette: { mere: 'si l’on a choisi d’en parler à sa mère', veille: 'si l’on a promis de veiller avec elle' },
  grainetiere: { jean: 'si l’on a dit « Écrivez-lui »' },
  aubergiste: { aveux: 's’il a choisi de parler, le pêcheur vivant', apres: 's’il a choisi de parler' },
  pecheur: { poste: 'si l’on porte les lettres à la poste', feu: 'si l’on choisit de les brûler', apresfeu: 'si on les a brûlées', depart: 'si les lettres sont parties pour Lyon', retour: 'après son départ' },
  guerisseuse: { grimoire: 'si l’on a dit « Ne marchandez pas »', dolmen: 'si l’on a dit « Allez-y »', etrangere: 'si l’on a dit « Allez-y »' },
  eleveuse: { nom: 'si le garde est vivant', rencontre: 'si l’on a dit « Allez le trouver »' },
  garde: { quivive: 'si le chien s’appelle Yves' },
  maire: { remise: 'si la lettre a été donnée', puits: 'après la lettre remise', present: 'si l’arrêté est signé' },
  postiere: { route: 'si l’on a dit « Allez-y »', gare: 'à son retour', pont: 'si l’on a dit « Écrivez-lui de monter, lui »', noel: 'après le pont' },
};
// le choix, ce qu'il change, les fins (H : f(k) le titre d'une fin, c(étape, k) le libellé d'un choix, sc(k) une scène,
// IL, lieu, pnj) — sous « révéler les secrets »
const K18_SUITE = {
  boulangere: (H) => [
    `${H.c('terre', 'anneau')} : l’alliance d’Émile va en terre, sous la croix. Fin : ${H.f('veuve')}.`,
    `${H.c('terre', 'chanson')} <small>(retenu si le chapitre est sauté)</small> : la petite chante sur la tombe la chanson de son père, et la boulangère porte l’anneau au cou. Fin : ${H.f('chanson')}.`,
    `Dans les deux cas, la scène ${H.sc('enterrement')}, au cimetière, un soir ; le lendemain, ${H.IL('pain', 3)} et ${H.IL('brioche', 2)} ; et la boulangerie vend désormais ${H.vend('veuve')}. Sans forgeron pour la croix de fer, on plante une croix de bois ; sans curé, elle dit la prière elle-même.`,
    `Sa fin compte dans le récit du ${H.pnj('forgeron', 'forgeron')}.`,
  ],
  forgeron: (H) => [
    `« La bague de fer » attend que le récit de la boulangère soit fini — ou qu’elle soit morte, ou que vous lui fassiez la cour. Seize ans qu’il porte une bague de fer sous sa chemise, pour elle.`,
    `Si la boulangère est morte : « Elle aurait dit oui, je crois. » Fin : ${H.f('tombe')}.`,
    `Si vous faites la cour à la boulangère : « Je la lui donnerai. De votre part. » Il vous donne ${H.IL('k18_bague_fer')}. Fin : ${H.f('temoin')}.`,
    `Sinon : « Demandez-la. Aujourd’hui. » — le lendemain, « La réponse » : si la boulangère a enterré l’alliance (${H.f('veuve', 'boulangere')}), elle dit oui ; deux jours après, les noces, à l’église, dans la journée (la scène ${H.sc('noces')}, ${H.IL('tarte', 2)}) : fin ${H.f('noces')} — ils sont mari et femme, la petite l’appelle « docteur des choses », et on ne peut plus leur faire la cour. Sinon elle répond « pas encore » : fin ${H.f('pasencore')}. — Ou bien « Gardez-la encore sous la chemise. » <small>(retenu si le chapitre est sauté)</small> : fin ${H.f('seize')}.`,
    `Avant cela, la plaque des quatorze mineurs, posée à l’entrée de la mine : la scène ${H.sc('mine')}. Personne ne frappe plus sous la forge.`,
  ],
  fillette: (H) => [
    `${H.c('secret', 'mere')} <small>(retenu si le chapitre est sauté)</small> : la petite se fâche ; il faut alors en parler à ${H.pnj('boulangere', 'la boulangère')}. Fin : ${H.f('mere')}.`,
    `${H.c('secret', 'veille')} : le lendemain, la nuit, veiller au vieux puits avec la clochette (${H.IL('k18_clochette')}, que donne la guérisseuse) : la scène ${H.sc('puits')}. Fin : ${H.f('veillee')}.`,
    `Dans les deux cas, quelques jours après, dire au revoir à Lise — l’amie que personne d’autre ne voit — avec trois fleurs : la scène ${H.sc('lise')}, à l’aube, à ${H.lieu('tombe_lise', 'la tombe de Lise')} ; ${H.IL('k18_dessin')}, et une lettre (« Un dessin »).`,
  ],
  grainetiere: (H) => [
    `Il y a eu un petit, d’elle et d’Anselme, né la nuit du 9 mars 1871 sous une lune rouge ; son père l’a donné à des charbonniers qui descendaient vers la plaine, et Anselme n’a jamais su. « Je veux savoir s’il a eu froid. » La trace mène à la charbonnière, aux Garnier (la guérisseuse se souvient d’un « petit de plus, tombé du ciel »), et la mairie de Saint-Étienne répond : Jean, « le Tombé », contremaître, trois enfants.`,
    `${H.c('reponse', 'ecrire')} : cinq jours après, un soir, à la graineterie, un homme monte de la route, le chapeau à la main (la scène ${H.sc('retrouvailles')}). Fin : ${H.f('retrouvailles')}.`,
    `${H.c('reponse', 'paix')} <small>(retenu si le chapitre est sauté)</small>. Fin : ${H.f('graines')}.`,
    `Dans les deux cas, « Le tiroir du bas » : ${H.IL('graines_citrouille', 5)} et ${H.IL('graines_melon', 3)} ; la graineterie vend désormais ${H.vend('graines')}.`,
  ],
  aubergiste: (H) => [
    `Le soir de l’orage, il y a dix ans, l’aubergiste a dit « chiche » à Jules Morvan, le frère du pêcheur, qui est sorti sous la pluie et n’est jamais revenu.`,
    `« Dites-le-lui. Il porte peut-être quelque chose, lui aussi. » (ou, le pêcheur mort : « Dites-le-lui quand même. Au cimetière. ») : le lendemain soir, au ponton, être le témoin — la scène ${H.sc('ponton')} ; le surlendemain, ${H.IL('ragout', 2)}.`,
    `« Taisez-vous. Ça ne ramènerait pas Jules. » <small>(retenu si le chapitre est sauté)</small>.`,
    `Puis, dans tous les cas, « La fête des vivants », à l’auberge (la scène ${H.sc('veillee')}, et 120 pièces). Fin : ${H.f('reconcilies')} s’ils se sont parlé au ponton (ensuite, ils mangent à la même table et se disent quelques mots) ; ${H.f('tard')} si le pêcheur était mort ; ${H.f('silence')} s’il s’est tu.`,
  ],
  pecheur: (H) => [
    `Il donne le paquet (${H.IL('k18_lettres_rose')}), quel que soit le choix.`,
    `${H.c('lettres', 'poster')} : la postière les envoie à Lyon ; cinq jours après, une lettre de Rose Lemoine. Puis (amitié 5, cinq jours plus tard) il part sur la route six jours — la scène ${H.sc('depart')}, à l’aube, au pont sud — et revient : la scène ${H.sc('retour')}, au phare, le soir. Fin : ${H.f('rose')} : le soir, de 19 h à 5 h 30, il y a de nouveau une lumière au phare.`,
    `${H.c('lettres', 'bruler')} <small>(retenu si le chapitre est sauté)</small> : le lendemain soir, au ponton, il les brûle une à une ; puis ${H.IL('poisson_fume', 3)} et ${H.IL('soupe_poisson', 2)}. Fin : ${H.f('cendres')}.`,
    `Sans postière pour faire suivre le courrier : ${H.f('paquet')}. Et ${H.f('attente')}, si les lettres partaient sans que rien ne suive.`,
  ],
  guerisseuse: (H) => [
    `Dans la rosée du cercle, deux mains ouvertes, couvertes de cicatrices : celles d’Étienne, un charbonnier aux mains brûlées. L’hiver soixante-huit, pour que sa nièce, qui étouffait du croup, respire, elle est montée à la Table des Géants et a donné à ceux d’en bas ce qu’elle avait de plus cher : ils ont pris le visage d’Étienne. Elle pourrait le racheter, en payant avec ce qu’elle a de plus neuf : vous — votre nom, votre voix, le bruit de vos pas.`,
    `${H.c('visage', 'garder')} <small>(retenu si le chapitre est sauté)</small> : le lendemain, à la hutte, la scène ${H.sc('transmission')} ; ${H.IL('k18_grimoire')} et ${H.IL('potion_soin', 2)}. Fin : ${H.f('heritiere')}.`,
    `${H.c('visage', 'racheter')} : la nuit, à la Table des Géants (la scène ${H.sc('dolmen')}) ; le lendemain, ${H.IL('potion_soin', 3)}. Fin : ${H.f('visage')} — elle ne vous connaît plus.`,
  ],
  eleveuse: (H) => [
    `Celui qui vient chercher sous la pierre, au pas, comme on fait une ronde, c’est ${H.pnj('garde', 'le garde des ponts')} ; la postière reconnaît son écriture de rapport.`,
    `Si vous faites la cour à l’éleveuse ou au garde : « Répondez-lui gentiment. » Fin : ${H.f('amitie')}.`,
    `Sinon : « Allez le trouver. Au calvaire, au crépuscule. » — le lendemain soir, au calvaire, la scène ${H.sc('calvaire')}. Fin : ${H.f('ensemble')} (ils se fréquentent ; on ne peut plus leur faire la cour). « Laissez-le écrire. Répondez-lui sous la pierre. » <small>(retenu si le chapitre est sauté)</small>. Fin : ${H.f('lettres')}.`,
    `Le garde mort avant qu’ils se soient parlé : fin ${H.f('souvenir')}. Dans tous les cas, ${H.IL('fromage')} et ${H.IL('lait', 2)}.`,
  ],
  garde: (H) => [
    `Le chiot vient de la portée du ranch (${H.IL('k18_chiot')} ; sans l’éleveuse, c’est un chien jaune laissé par le colporteur). « Courage » <small>(retenu si le chapitre est sauté)</small>, ou « Yves » — il pâlit ; avec « Yves », un chapitre de plus (amitié 5) : il dit pourquoi (Madagascar, une nuit de faction, « Qui vive ? » crié une seule fois, et il a tiré), puis la scène ${H.sc('quivive')}, au pont nord.`,
    `Quelques nuits plus tard (amitié 6) : il y a un mot de passe à la guérite, « mon grand », comme dans les lettres de sa mère ; trois fois cette année, à travers la porte, quelqu’un le lui a donné, avec sa voix. « N’ouvrez jamais. Ce n’est pas elle. » <small>(retenu si le chapitre est sauté)</small> : fin ${H.f('courage')}. « Répondez-lui, sans ouvrir. Dites-lui au revoir. » : une lettre (« Rapport de nuit ») ; fin ${H.f('adieu')}.`,
  ],
  maire: (H) => [
    `Au hameau, le compte tombe juste ; mais en partant, on croise une femme en manteau gris que personne ne salue. Hélène, la femme du maire, avait un manteau gris : elle est partie une nuit d’octobre, sans lui. La postière, sa nièce, garde depuis vingt ans une lettre sans timbre de sa tante : elle n’est pas partie, elle est descendue — on l’appelait du fond du vieux puits, et elle a répondu. « Surtout, qu’il ne vienne pas me chercher. »`,
    `${H.c('lettre', 'donner')} : ${H.IL('k18_lettre_helene')}, à remettre au maire ; puis le retrouver au vieux puits, la nuit (la scène ${H.sc('puits_maire')}). ${H.c('lettre', 'bruler')}. (Sans la postière, la lettre est perdue.)`,
    `Puis « L’arrêté sans date » (amitié 6) — article unique : l’arrêté du 3 mars 1854 est abrogé. ${H.c('arrete', 'signer')} : la scène ${H.sc('arrete')}, sur la place, un soir (avec un article de prudence : les ponts se lèvent encore à neuf heures) ; deux jours après (amitié 7), il s’inscrit au registre, « Présent », ${H.IL('k18_medaille')}, 100 pièces, et une lettre de la mairie. Fin : ${H.f('signe')}. ${H.c('arrete', 'attendre')} <small>(retenu si le chapitre est sauté)</small> : fin ${H.f('poche')}.`,
  ],
  postiere: (H) => [
    `Sur la borne du pont sud, à l’aube, le sac du courrier est déjà là ; dans la boue, les sabots de deux chevaux qui s’arrêtent net au bord du pont. Son père conduisait la voiture jaune ; un soir de brouillard, les chevaux sont rentrés seuls.`,
    `${H.c('invitation', 'partir')} : deux jours après, elle part pour la gare (la scène ${H.sc('voiture')}, à l’aube, au pont sud ; cinq jours sur la route) ; à son retour, ${H.IL('k18_timbre')}, et une lettre d’Octave Fayolle, le receveur. Fin : ${H.f('gare')}.`,
    `${H.c('invitation', 'monter')} <small>(retenu si le chapitre est sauté)</small> : trois jours après, un soir, au pont sud, un homme en casquette neuve monte de la gare (la scène ${H.sc('octave')}) ; le lendemain, ${H.IL('k18_timbre')}. Fin : ${H.f('noel')}.`,
    `Si rien ne bouge : ${H.f('marge')}.`,
  ],
};
// les heures des récits (K18_HEURES)
const K18_MOMENT = { nuit: 'la nuit (21 h 30 - 4 h)', aube: 'à l’aube (4 h 30 - 7 h 30)', soir: 'le soir (18 h - 21 h 30)', jour: 'de jour (7 h 30 - 18 h)' };
// les choix qui dépendent de la partie (une fonction, dans le récit) : l'étape où ils tombent
const K18_CHOIX_FN = { forgeron: 'bague', aubergiste: 'chiche', eleveuse: 'nom' };
// comment on les appelle, dans les phrases
const K18_NOM = { fillette: 'la petite Aubert' };

function recits(X, H) {
  const { T, SP, SEC, esc, IL, lk, FILL, pages, MF } = X;
  const { h3, ul, tbl, lieu, aLieu, pnj, pg, log } = H;
  const ARCS = (T('K18_ARCS', []) || []).slice().sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
  const VOIX = T('K18_VOIX', {}) || {}, APRES = T('K18_APRES', {}) || {}, PORTR = T('K18_PORTRAITS', {}) || {}, NIV = T('K18_NIVEAUX', []) || [], REGL = T('K18_REGL', {}) || {};
  const NPCS = T('NPC_DATA', []) || [];
  if (!ARCS.length) { log('K18_ARCS introuvable : pas de fiche « Les récits des proches »'); return; }
  const files = Object.keys(MF || {}).filter((f) => /K18-/.test(f));
  const F = (t) => FILL(String(t || '').replace(/\{e\}/g, '').replace(/\{m:([^|}]*)\|([^}]*)\}/g, '$1'));
  const npcD = (id) => NPCS.find((d) => d.id === id) || null;
  const leRole = (id) => {
    if (K18_NOM[id]) return K18_NOM[id];
    const d = npcD(id), r = d ? String(d.role || id).toLowerCase() : id;
    return /^[aeéèêiîoôuh]/i.test(r) ? 'l’' + r : (d && d.gender === 'f' ? 'la ' : 'le ') + r;
  };
  const qui = (id) => pnj(id, leRole(id));
  const its = (o) => (o && typeof o === 'object' ? Object.entries(o).map(([k, n]) => IL(k, n > 1 ? n : '')).join(', ') : '');
  const quete = (qid) => { for (const d of NPCS) for (const q of d.quests || []) if (q.id === qid) return [d, q]; return null; };
  const ROM = T('K18_ROMAINS', null) || ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const branche = (D, E) => !!(K18_SI[D.id] && K18_SI[D.id][E.id]);
  const aChoix = (D, E) => (Array.isArray(E.choix) && E.choix.length) || K18_CHOIX_FN[D.id] === E.id;
  // ce qu'un chapitre demande, en clair (sans rien dire de l'histoire)
  const pratique = (D, E) => {
    const q = E.qui || D.npc;
    let t;
    if (E.aller) t = `aller ${aLieu(E.lieu)}${E.moment ? ', ' + K18_MOMENT[E.moment] : ''}`;
    else if (E.need && typeof E.need === 'object') t = `apporter ${its(E.need)} à ${qui(q)}`;
    else t = q === D.npc ? `${D.npc === 'fillette' ? 'lui' : 'lui'} parler` : `parler à ${qui(q)}`;
    const c = [];
    if (E.min) c.push(`amitié ${E.min}`);
    if (E.minQui) c.push(`amitié ${E.minQui} avec ${leRole(q)}`);
    if (E.jour) c.push(`dès le jour ${E.jour}`);
    if (E.delai) c.push(E.delai === 1 ? 'le lendemain' : `${E.delai} jours après`);
    return t + (c.length ? ` <small>(${c.join(', ')})</small>` : '');
  };
  const fins = (D) => Object.keys(D.fins || {}).length;
  const debut = (D) => { const E = D.etapes[0] || {}; return `amitié ${E.min || 0}, dès le jour ${E.jour || 1}`; };
  const premisse = (D) => (K18_PREMISSE[D.id] ? esc(K18_PREMISSE[D.id]) : F(D.accroche));
  const pub = (D) => D.etapes.filter((E) => !branche(D, E));

  // ================================================================ la fiche
  let h = `<p class="lead">Onze habitants de la vallée ont chacun un long récit : six à huit chapitres, sur des semaines — leur histoire révélée peu à peu, un vrai choix qui en change la fin, les liens entre eux. Il y faut du temps et de l’amitié. Les proches viennent aussi voir la ferme, apportent des cadeaux, et se souviennent de ce qu’on a fait pour eux.</p>`;
  h += h3('Comment ça marche') + ul([
    'Un récit commence quand on est assez lié à l’habitant et que son jour est venu (voir le tableau). Chaque chapitre s’ouvre à son tour : il demande parfois un peu plus d’amitié, parfois un délai (le lendemain, quelques jours), parfois qu’un autre récit en soit là.',
    'Quand un chapitre s’ouvre, une ligne discrète, en haut à gauche de l’écran, quelques secondes : « Un récit · » son titre, et ce qu’il demande.',
    `On le fait en parlant — une ligne de plus dans le dialogue de la personne, entre guillemets —, en apportant ce qui est demandé, ou en allant quelque part, parfois à une heure dite : ${Object.values(K18_MOMENT).join(', ')} ; il suffit d’y rester un instant (devant la porte d’une maison, cela compte aussi).`,
    'Chaque chapitre rapproche : l’habitant, et l’autre personne à qui l’on a parlé.',
    'Un vrai choix, au moins une fois par récit : il change la suite et la fin. Ce qu’on a choisi ne se défait pas ; un chapitre sauté prend le choix « par défaut ».',
    'Des lettres à la boîte, quelques jours après ; des cadeaux ; parfois un départ : l’habitant part sur la route quelques jours. Une ou deux scènes par récit, sur le moteur des cinématiques : elles se jouent au premier moment tranquille (l’histoire principale passe d’abord), on les passe en maintenant <kbd>Espace</kbd> ou <kbd>Échap</kbd>, on les revoit au carnet (page Proches).',
    'Les récits se croisent : la croix d’Émile (la boulangère, le curé, le forgeron), la soupe du dimanche (l’aubergiste, le pêcheur), une lettre gardée à la poste (le maire), le chiot du ranch (le garde), la clochette de la guérisseuse (la petite), les charbonniers (la grainetière)… Une fin en ouvre parfois une autre : celle de la boulangère compte pour le forgeron.',
    'À la fin, la vallée change parfois : une noce, des liens nouveaux entre habitants (et ce qu’ils se disent), une boutique qui vend autre chose, une lumière au phare.',
    'Une ancienne partie : les récits commencent au début ; rien ne se rejoue.',
  ]);
  h += h3('Les onze récits') + tbl(['Récit', 'Qui', 'Commence', 'Chapitres', 'Fins'], ARCS.map((D) => {
    const n = pub(D).length, b = D.etapes.length - n;
    return [`« ${esc(D.titre)} »`, qui(D.npc), debut(D), b ? `${n}, et ${b === 1 ? 'un autre' : 'd’autres'} selon le choix` : String(n), String(fins(D))];
  }));
  // ---- un récit par habitant
  for (const D of ARCS) {
    let s = `<h3>« ${esc(D.titre)} » <small>— ${qui(D.npc)}</small></h3><p>${premisse(D)}</p>`;
    const L = pub(D);
    s += `<p class="small">Commence : ${debut(D)}. Ce qu’il faudra faire :</p><ol>${L.map((E) => `<li><b>${esc(E.titre)}</b> — ${pratique(D, E)}${aChoix(D, E) ? ' — <b>un choix</b>' : ''}</li>`).join('')}</ol>`;
    if (L.length < D.etapes.length) s += `<p class="small">La suite dépend du choix.</p>`;
    // sous les secrets : le récit en entier
    const H2 = {
      f: (k, arc) => { const A = arc ? ARCS.find((x) => x.id === arc) : D, Fn = A && A.fins && A.fins[k]; return Fn ? `« ${esc(Fn.titre)} »` : esc(k); },
      c: (e, k) => { const E = D.etapes.find((x) => x.id === e), C = E && Array.isArray(E.choix) ? E.choix.find((x) => x.k === k) : null; return C ? `« ${F(C.label)} »` : esc(k); },
      sc: (k) => (D.scenes && D.scenes[k] ? `« ${esc(D.scenes[k].titre)} »` : esc(k)),
      vend: (k) => { const M = D.monde && D.monde[k] && D.monde[k].boutique; return M ? M.vend.map(([it, p]) => `${IL(it)} (${p} pièces)`).join(', ') : ''; },
      IL: (k, n) => IL(k, n > 1 ? n : ''), lieu, pnj,
    };
    let sec = '';
    if (K18_PREMISSE[D.id]) sec += `<p><b>Le fond de l’histoire :</b> ${F(D.accroche)}</p>`;
    sec += `<h4>Les chapitres</h4><ol>${D.etapes.map((E) => {
      const si = K18_SI[D.id] && K18_SI[D.id][E.id];
      const plus = [];
      if (E.vu) plus.push(`<i>${F(E.vu)}</i>`);
      if (E.don && typeof E.don === 'object') plus.push('reçu : ' + its(E.don));
      if (E.argent) plus.push(`${E.argent} pièces`);
      if (E.lettre && E.lettre.titre) plus.push(`une lettre, quelques jours après (« ${F(E.lettre.titre)} »)`);
      if (E.voyage) plus.push(`il part sur la route ${E.voyage[1]} jours`);
      return `<li><b>${esc(E.titre)}</b>${si ? ` <small>(${esc(si)})</small>` : ''} — ${F(E.carnet || '')}${plus.length ? `<br><span class="small">${plus.join(' ; ')}</span>` : ''}</li>`;
    }).join('')}</ol>`;
    sec += `<h4>Le choix, et ce qu’il change</h4>` + ul((K18_SUITE[D.id] ? K18_SUITE[D.id](H2) : []));
    sec += `<h4>Les fins</h4>` + ul(Object.values(D.fins || {}).map((Fn) => `<b>« ${esc(Fn.titre)} »</b> — ${F(Fn.resume)}${Fn.lettre && Fn.lettre.titre ? ` <small>(une lettre : « ${F(Fn.lettre.titre)} »)</small>` : ''}`));
    if (D.rituel) sec += `<p class="small">Le récit fini (et l’habitant vivant), un cadeau, tous les ${D.rituel.tous} jours environ, avec son salut : ${its(D.rituel.don)}.</p>`;
    sec += `<p class="small">Les scènes : ${Object.values(D.scenes || {}).map((S) => `« ${esc(S.titre)} »`).join(', ')}.</p>`;
    h += s + SEC(sec, 'Les chapitres, le choix et les fins : masqué (secrets).');
  }
  // ---- quand quelqu'un manque
  h += h3('Si quelqu’un meurt, s’en va, ou manque') + ul([
    'L’habitant du récit meurt : son récit s’achève là, doucement (au carnet : « † — … n’est plus. Le récit s’arrête au chapitre … »). Emmené à la préfecture (la prison) : il « ne pourra plus se poursuivre ». Un récit qui n’avait pas commencé ne commencera pas.',
    `La personne à qui il fallait parler n’est plus là : le chapitre est sauté, avec son choix par défaut, et le récit va au bout quand même. Un chapitre qui attend un autre récit est sauté au bout de ${REGL.attenteMax || 18} jours.`,
    'Quelques récits ont une fin pour cela — une bague sur une tombe, la dernière lettre, une soupe au cimetière : sous « révéler les secrets », plus haut.',
    `Voir aussi ${pg('sys:morts', 'la mort des habitants')}.`,
  ]);
  // ---- les proches
  const avecVoix = ARCS.map((D) => D.npc).filter((id) => VOIX[id]);
  h += h3('Les proches : saluts, visites, cadeaux') + ul([
    'Les saluts changent : selon l’amitié (de 3 à 5, un ami ; 6 et plus, un proche), le dernier cadeau qu’on a fait, la dernière quête rendue, la ferme qui pousse, le gel ou la pluie ; dans une partie d’avant, ils se souviennent qu’il y a eu quelqu’un d’autre à la vieille ferme ; et, un récit fini, ils en parlent.',
    `<b>Les visites</b> : à l’amitié ${REGL.visiteNiveau || 6}, un proche vient parfois voir la ferme, l’après-midi (il part de la ville vers 12 h 30 - 14 h) — une chance sur deux certains jours, jamais deux visites à moins de ${REGL.visiteEcart || 5} jours ; pas fâché, pas malade, pas sur la route, ni la personne qui vit avec vous. On le trouve près de la maison : un mot, un geste, ses cadeaux, et l’amitié grandit. Si l’on n’y est pas, il laisse un mot à la boîte.`,
    'Un récit achevé (autrement que par un deuil), l’habitant redonne de temps en temps un petit quelque chose, avec son salut (amitié 4 au moins).',
  ]) + tbl(['Qui', 'Ce qu’il apporte en visite', 'Le cadeau, un récit fini'], avecVoix.map((id) => { const D = ARCS.find((x) => x.npc === id); return [qui(id), its(VOIX[id].don), D && D.rituel ? `${its(D.rituel.don)} <small>(tous les ${D.rituel.tous} jours)</small>` : '—']; }));
  // ---- la suite des quêtes d'avant
  {
    const par = {};
    for (const qid of Object.keys(APRES)) { const r = quete(qid); if (r) (par[r[0].id] || (par[r[0].id] = [])).push([r[1], APRES[qid]]); }
    h += h3('La suite des quêtes d’avant') + `<p>Une à six journées après une quête faite, l’habitant en dit un mot de plus, une fois — comme on reparle d’une chose qui a compté.</p>` + ul(Object.entries(par).map(([id, L]) => `${qui(id)} : ${L.map(([q]) => `« ${esc(q.title)} »`).join(', ')}`));
    h += SEC(`<details><summary>Ce qu’ils en disent</summary>${Object.entries(par).map(([id, L]) => `<h5>${qui(id)}</h5><ul class="qs">${L.map(([q, t]) => `<li><b>« ${esc(q.title)} »</b> — ${F(t)}</li>`).join('')}</ul>`).join('')}</details>`, 'Ce qu’ils disent après leurs quêtes : masqué (secrets).');
  }
  // ---- le carnet
  h += h3('Au carnet') + ul([
    'Carnet → <b>Quêtes</b> : en tête, les « Récits » — le chapitre en cours et ce qu’il demande (« Chapitre III · … »), ou la fin d’un récit achevé ; « La suite viendra : il faut du temps, ou un peu plus d’amitié », tant que le chapitre n’est pas ouvert.',
    `Carnet → <b>Proches</b> : ceux qu’on connaît un peu (amitié 2, ou un récit commencé). Ce qu’on est pour eux (${NIV.map(([n, t]) => `${esc(t)}${n ? ` (${n})` : ''}`).join(', ')}), une barre d’amitié, un portrait qui s’étoffe avec l’amitié et la fin de leur récit, le dernier souvenir partagé (un cadeau, une quête, un chapitre, une visite), leurs récits, et leurs scènes à revoir. Les morts y restent, en gris ; ceux qui sont sur la route, aussi.`,
  ]);
  h += `<p>${pg('cat:quetes', 'Les quêtes des habitants')} · ${pg('sys:quetes-tous', 'Des quêtes pour tout le monde')} · ${pg('sys:dettes', 'Les dettes de la ferme')} · ${pg('sys:l18_hotel', 'Le Grand Hôtel des Cimes')}</p>`;
  SP('sys:recits', { t: 'Les récits des proches', s: 'Onze habitants, onze longs récits : leurs choix, leurs fins, leurs visites à la ferme', c: ['recits'], i: '❦', h }, files);

  // ================================================================ un mot dans la fiche de chacun
  const croise = {};
  for (const D of ARCS) for (const E of D.etapes) { const q = E.qui; if (q && q !== D.npc) (croise[q] || (croise[q] = new Set())).add(D.id); }
  const LIB = { ami: 'En ami', proche: 'En proche', cadeau: 'Après un cadeau', quete: 'Après une quête', ferme: 'De votre ferme', gel: 'Un matin de gel', pluie: 'Sous la pluie', vies: 'Dans une partie d’avant', visite: 'En visite à la ferme', absent: 'Le mot laissé à la boîte' };
  const pour = new Set([...ARCS.map((D) => D.npc), ...Object.keys(croise), ...Object.keys(APRES).map((q) => (quete(q) || [{}])[0].id).filter(Boolean)]);
  for (const id of pour) {
    const p = pages.get('pnj:' + id);
    if (!p || /k18-pnj/.test(p.h || '')) continue;
    let b = '';
    const D = ARCS.find((x) => x.npc === id);
    if (D) {
      b += `<h3 class="k18-pnj">Son récit : « ${esc(D.titre)} »</h3><p>${premisse(D)}</p><p class="small">Il commence à l’${debut(D)} ; ${pub(D).length} chapitres${pub(D).length < D.etapes.length ? ', et la suite selon un choix' : ''} ; ${fins(D)} fins possibles. ${lk('sys:recits', 'Les récits des proches')}</p>`;
    }
    if (croise[id]) {
      const L = [...croise[id]].map((a) => ARCS.find((x) => x.id === a)).filter(Boolean);
      b += `<p class="small${D ? '' : ' k18-pnj'}">On ${D ? 'le croise aussi' : 'le croise'} dans ${L.map((A) => `« ${esc(A.titre)} » (${leRole(A.npc)})`).join(', ')} : ${lk('sys:recits', 'les récits des proches')}.</p>`;
    }
    const V = VOIX[id];
    if (V) {
      b += `<h4>En visite</h4><p>À l’amitié ${REGL.visiteNiveau || 6}, ${leRole(id)} vient parfois voir la ferme, l’après-midi, et apporte ${its(V.don)}.</p>`;
      const lignes = Object.entries(LIB).map(([k, t]) => { const x = V[k]; const L = Array.isArray(x) ? x : x ? [x] : []; return L.length ? `<h5>${esc(t)}</h5><ul class="qs">${L.map((l) => `<li>${F(String(l).replace(/\{objet\}/g, '‹ce cadeau›').replace(/\{quete\}/g, '‹la quête›'))}</li>`).join('')}</ul>` : ''; }).join('');
      if (lignes) b += `<details><summary>Ce qu’il dit à ses proches</summary>${lignes}</details>`;
    }
    const Pt = PORTR[id];
    if (Pt && Pt.length) {
      b += `<h4>Au carnet « Proches »</h4><p>${F(Pt[0][1])}</p>`;
      if (Pt.length > 1) b += SEC(ul(Pt.slice(1).map(([n, t]) => `<small>amitié ${n} :</small> ${F(t)}`)), 'Ce que le portrait révèle, à mesure : masqué (secrets).');
    }
    const AQ = Object.keys(APRES).filter((q) => { const r = quete(q); return r && r[0].id === id; });
    if (AQ.length) b += (D || V ? '<h4>Après ses quêtes</h4>' : '<h3 class="k18-pnj">Après ses quêtes</h3>') + `<p class="small">Quelques jours après chacune, un mot de plus, une fois.</p>` + SEC(`<ul class="qs">${AQ.map((q) => `<li><b>« ${esc(quete(q)[1].title)} »</b> — ${F(APRES[q])}</li>`).join('')}</ul>`, 'Ce qu’il en dit : masqué (secrets).');
    if (b) p.h = (p.h || '') + b;
  }
  void ROM;
}

// ============================================================================ P18 : LES CASCADES, LES GROTTES, LES COINS DE PARADIS
// La cinquième part de la vague (les cascades, le réseau de grottes derrière la Grande Chute, les coins de paradis :
// modules *P18*) n'est pas encore fusionnée : cette fonction ne rend rien. Le jour venu, elle écrira ici la fiche
// sys:cascades (avec SP(…, fichiers /P18-/) pour que ses modules n'aient pas de fiche générique, et used.add() pour ses
// tables), ce que voient les lieux concernés, et sections() rangera la section « Les cascades et les grottes » (voir
// SECTION_P18, plus bas).
function cascades(X, H) {
  void X; void H;
}

// ============================================================================ UN MOT AILLEURS
function liens(X, H) {
  const { T, pages, lk, esc, IL } = X;
  const has = (id) => pages.has(id);
  const ajoute = (id, test, html, debut) => { const p = pages.get(id); if (p && !test.test(p.h || '')) p.h = debut ? html + (p.h || '') : (p.h || '') + html; };
  // ---- la ferme, la maison Delorme, la poste
  if (has('sys:dettes')) {
    ajoute('li:ferme', /d18-ferme/, `<h3 class="d18-ferme">Les dettes, et les travaux</h3><p>La ferme est grevée d’une dette ancienne : huit termes à l’étude de Maître Delorme. Chaque terme payé, les ouvriers viennent le lendemain matin — un toit d’ardoise, une cour pavée et ses réverbères, des murs de pierre, un verger, une aile neuve, une serre, une écurie, un étage — et la vieille ferme devient un domaine : ${lk('sys:dettes', 'les dettes de la ferme')}.</p>${has('sys:recits') ? `<p>Les proches viennent parfois la voir, l’après-midi, et apportent des cadeaux : ${lk('sys:recits', 'les récits des proches')}.</p>` : ''}`);
    ajoute('li:vide5', /d18-plaque/, `<p class="note d18-plaque">C’est la maison Delorme. Sur sa porte, à gauche, la plaque de cuivre de l’étude de Maître Delorme, notaire, et sa fente : on y paie ${lk('sys:dettes', 'les dettes de la ferme')}.</p>`, true);
    ajoute('li:poste', /d18-mandat/, `<p class="note d18-mandat">On y envoie aussi des mandats pour l’étude Delorme (trois pièces de frais) : ${lk('sys:dettes', 'les dettes de la ferme')}.</p>`);
    ajoute('pnj:postiere', /d18-mandat/, `<p class="note d18-mandat">« Un mandat pour l’étude Delorme » : elle fait partir les termes des ${lk('sys:dettes', 'dettes de la ferme')} (trois pièces de frais).</p>`);
  }
  // ---- la ville : la place, le Grand Cercle
  if (has('sys:cercle')) {
    ajoute('li:place', /c18-place/, `<p class="note c18-place">Au sud-est de la place, entre la grand-rue et la maison Delorme, adossé au rempart sud : ${lk('sys:cercle', 'le Grand Cercle')}, le casino de la ville (de 18 h à 3 h), et la suite Impériale à l’étage.</p>`);
    ajoute('li:marche', /c18-place/, `<p class="note c18-place">En face, de l’autre côté des étals : la façade et la marquise du ${lk('sys:cercle', 'Grand Cercle')}.</p>`);
    ajoute('li:casino', /c18-fiche/, `<p class="lead c18-fiche">Le casino de la ville, de 18 h à 3 h : ${lk('sys:cercle', 'le Grand Cercle')} — sa porte, sa caisse, ses cinq jeux, son bar et ses gens ; à l’étage, ${lk('sys:c18_suite', 'la suite Impériale')}.</p>`, true);
    ajoute('act:des', /c18-jeu/, `<p class="note c18-jeu">Au ${lk('sys:cercle', 'Grand Cercle')}, le passe-dix se joue contre la banque, avec des jetons : ${lk('sys:c18_des', 'le passe-dix du Cercle')}.</p>`);
    ajoute('act:cartes', /c18-jeu/, `<p class="note c18-jeu">Au ${lk('sys:cercle', 'Grand Cercle')}, le vingt-et-un se joue contre un croupier : ${lk('sys:c18_vingt', 'le vingt-et-un du Cercle')}.</p>`);
    ajoute('sys:alcool', /c18-bar/, `<p class="note c18-bar">Au bar du ${lk('sys:cercle', 'Grand Cercle')} : une coupe de champagne, un verre de fine, une absinthe, ou un café noir.</p>`);
    ajoute('sys:location', /c18-suite/, `<p class="note c18-suite">En ville encore, au ${lk('sys:cercle', 'Grand Cercle')} : ${lk('sys:c18_suite', 'la suite Impériale')}, à la nuit (350 pièces) ou à vendre (30 000).</p>`);
  }
  // (les interactions des gens du Cercle n'ont pas de nom à elles, dans la liste d'un lieu)
  for (const p of pages.values()) if (p.id.startsWith('li:') && p.h && p.h.includes('c18_parler')) p.h = p.h.replace(/<li>c18_parler( ×\d+)?<\/li>/g, (m, n) => `<li>Parler aux gens du Cercle${n || ''}</li>`);
  // ---- l'hôtel : ses lieux, les monts, le château
  if (has('sys:l18_hotel')) {
    const H18 = (t) => lk('sys:l18_hotel', t || 'le Grand Hôtel des Cimes');
    for (const id of [...pages.keys()].filter((k) => /^li:l18_/.test(k))) ajoute(id, /l18-fiche/, `<p class="note l18-fiche">Au ${H18('Grand Hôtel des Cimes')} : ses lieux, ses gens, ${lk('sys:l18_concierge', 'le métier de concierge')}, ses histoires.</p>`, true);
    ajoute('li:monts', /l18-monts/, `<p class="note l18-monts">À l’est de la vallée, sur le replat des monts de l’Est, au-dessus du château de Valmont : ${H18()}, un palace de 1868 ; on y monte par un funiculaire, au bout de la route du château, ou par le chemin muletier.</p>`);
    ajoute('li:chateau', /l18-monts/, `<p class="note l18-monts">En face, sur le replat des monts de l’Est : ${H18()}. Au bout de la route du château, la gare basse de son funiculaire (un poteau : « Grand Hôtel des Cimes ⇨ 450 m, puis le funiculaire »).</p>`);
    ajoute('sys:sommeil', /l18-lit/, `<p class="note l18-lit">Deux lits de plus : celui de la mansarde du concierge, au ${H18('Grand Hôtel des Cimes')} (une fois engagé), et le lit à baldaquin de ${lk('sys:c18_suite', 'la suite Impériale')}, au Grand Cercle (louée ou achetée).</p>`);
  }
  // ---- les morts
  if (has('sys:recits')) ajoute('sys:morts', /k18-morts/, `<p class="note k18-morts">Un habitant qui meurt : son récit s’achève là (au carnet, une croix) ; s’il manquait à un chapitre du récit d’un autre, le chapitre est sauté et le récit va au bout quand même : ${lk('sys:recits', 'les récits des proches')}.</p>`);
  // ---- les cinématiques
  ajoute('sys:cinematiques', /v18-cine/, `<h3 class="v18-cine">La ferme, l’hôtel, le Cercle, les proches</h3><p>Sur le même moteur, et qui se passent de même : les travaux de ${lk('sys:dettes', 'la ferme')} et les huissiers (en revenant à la ferme) ; les scènes du ${lk('sys:l18_hotel', 'Grand Hôtel des Cimes')} — l’arrivée, le funiculaire, la voiture, l’embauche, la terrasse, le bal, l’aile Nord, et celles de ses histoires —, qui se revoient au carnet, page « Le Grand Hôtel » ; celles du ${lk('sys:cercle', 'Grand Cercle')} (la première soirée, la suite) ; celles des ${lk('sys:recits', 'récits des proches')}, qui se revoient au carnet, page « Proches ».</p>`);
  // ---- le carnet
  const sv = pages.get('sys:savoir');
  if (sv && sv.h && !/sys%3Arecits|\u0002sys:recits/.test(sv.h)) {
    sv.h = sv.h.replace('<td>Histoire · Quêtes · Légendes · Langues · Souvenirs</td>', '<td>Histoire · Quêtes · Proches · La ferme · Légendes · Langues · Le Grand Hôtel · Souvenirs</td>')
      .replace('quêtes, gens rencontrés, notes, journal ;', `quêtes, gens rencontrés, notes, journal (en tête, les ${lk('sys:recits', 'récits des proches')}) ; les proches (ce qu’on est pour eux, leur portrait, leurs scènes) ; la ferme (${lk('sys:dettes', 'les dettes')} : le terme en cours, les travaux) ;`)
      .replace('les mots de l’aëlin et du gorrain, les inscriptions ;', `les mots de l’aëlin et du gorrain, les inscriptions ; ${lk('sys:l18_hotel', 'le Grand Hôtel')} (le rang de concierge, le service, les commissions, les histoires, les souvenirs de l’hôtel ; la page n’apparaît qu’une fois l’hôtel vu) ;`);
  }
  // ---- la musique : les deux airs de l'hôtel (groupe « hotel »)
  {
    const p = pages.get('sys:musique'), MU = T('MUSIQUE', null);
    const M = MU && MU.morceaux, fin = '<p class="note">Rien ne joue dans le cauchemar.</p>';
    if (p && p.h && M && p.h.includes(fin) && !/l18-musique/.test(p.h)) {
      const ids = (MU.ordre || Object.keys(M)).filter((id) => M[id] && M[id].groupe === 'hotel');
      const INST = { piano: 'piano', harpe: 'harpe', celesta: 'célesta', boite: 'boîte à musique', cloche: 'cloche', cordes: 'cordes', flute: 'flûte', verre: 'verre', nappe: 'nappes', orgue: 'orgue' }, SALLE = { chambre: 'chambre', salle: 'salle', cathedrale: 'grande nef', grotte: 'grotte' };
      // (la durée comme la fiche de la musique la calcule : la partition, le tempo, un peu de respiration, la salle)
      const duree = (q) => {
        const [num, den] = String(q.mesure || '4/4').split('/').map(Number), barQ = num * 4 / (den || 4);
        let nb = 0; for (const v of Object.values(q.voix || {})) nb = Math.max(nb, String(v.notes || '').split('|').filter((x) => x.trim()).length);
        let s = (q.anacrouse ? (nb - 1) * barQ + q.anacrouse : nb * barQ) * 60 / (q.tempo || 60);
        for (const f of q.fermates || []) s += f[1] || 0;
        return Math.round((s * 1.07 + 4) / 5) * 5;
      };
      const fmtS = (s) => { s = Math.round(s); const m = Math.floor(s / 60), r = s % 60; return m ? `${m} min${r ? ' ' + String(r).padStart(2, '0') : ''}` : `${r} s`; };
      if (ids.length) {
        const rows = ids.map((id) => { const q = M[id]; return `<tr><td>${q.auteur ? esc(q.titre) : `« ${esc(q.titre)} »`}</td><td><small>${esc(q.auteur ? q.auteur + ' (un personnage du jeu)' : 'composition originale')}</small></td><td>${esc([...new Set(Object.values(q.voix || {}).map((v) => INST[v.inst] || v.inst))].join(', '))}</td><td>${esc(q.mesure || '')}</td><td>${esc(SALLE[q.salle] || q.salle || '')}</td><td>${fmtS(duree(q))}</td></tr>`; }).join('');
        const bloc = `<h4 class="l18-musique">${lk('sys:l18_hotel', 'Le Grand Hôtel des Cimes')} <small>(dans l’hôtel et dans ses scènes, jamais ailleurs)</small></h4><table class="t"><tr><th>Morceau</th><th>Compositeur</th><th>Instruments</th><th>Mesure</th><th>Salle</th><th>Durée</th></tr>${rows}</table>`;
        p.h = p.h.replace(fin, bloc + fin);
      }
    }
  }
  void IL;
}

// ============================================================================ LES OUTILS, ET LE TOUT
function outils(X) {
  const { DB, esc, lk, pages, placeLink, npcLink } = X;
  const log = (m) => (DB.log || (DB.log = [])).push('wiki-v18.js : ' + m);
  const h3 = (t) => `<h3>${esc(t)}</h3>`;
  const ul = (a) => `<ul>${a.filter(Boolean).map((x) => `<li>${x}</li>`).join('')}</ul>`;
  const tbl = (head, rows) => `<table class="t"><tr>${head.map((x) => `<th>${esc(x)}</th>`).join('')}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
  const kv = (L) => `<dl class="kv">${L.filter(Boolean).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`).join('')}</dl>`;
  const lieu = (k, t) => (pages.has('li:' + k) ? placeLink(k, t) : esc(t || k));
  // « au cimetière », « à la forge », « à l’église », d’après le titre de la fiche du lieu
  const aLieu = (k) => {
    const p = pages.get('li:' + k);
    if (!p) return 'à ' + esc(k);
    const t = p.t; let m;
    if ((m = t.match(/^Le (.+)$/))) return 'au ' + placeLink(k, m[1]);
    if ((m = t.match(/^Les (.+)$/))) return 'aux ' + placeLink(k, m[1]);
    if ((m = t.match(/^La (.+)$/))) return 'à la ' + placeLink(k, m[1]);
    if ((m = t.match(/^L['’](.+)$/))) return 'à l’' + placeLink(k, m[1]);
    return 'à ' + placeLink(k, t);
  };
  const pnj = (id, t) => (pages.has('pnj:' + id) ? npcLink(id, t) : esc(t || id));
  const pg = (id, t) => lk(id, t);
  return { log, h3, ul, tbl, kv, lieu, aLieu, pnj, pg };
}

function build(X) {
  const { DB, used } = X;
  const H = outils(X);
  // les tables de la vague : lues ici (pas d'« Autres tables », pas de « données du module » en bas des fiches)
  for (const [n, t] of Object.entries(DB.tables || {})) if (/(D18|L18|C18|K18)-/.test(t.file || '')) used.add(n);
  for (const [nom, f] of [['dettes', dettes], ['hôtel', hotel], ['Cercle', cercle], ['récits', recits], ['cascades', cascades], ['liens', liens]]) {
    try { f(X, H); } catch (e) { H.log(nom + ' : ' + (e && e.stack ? e.stack.split('\n').slice(0, 2).join(' ') : e)); }
  }
}

// la section de la cinquième part (P18), le jour où elle sera écrite : { id: 'cascades', t: 'Les cascades et les grottes', … }
const SECTION_P18 = null;

function sections(cats, X) {
  const { pages, link } = X;
  const at = (id) => cats.findIndex((c) => c.id === id);
  const apres = (cat, ancres) => {
    if (at(cat.id) >= 0 || !cat.groups.some((g) => g.ids.length)) return;
    let i = -1;
    for (const a of ancres) { i = at(a); if (i >= 0) break; }
    cats.splice(i >= 0 ? i + 1 : cats.length, 0, cat);
  };
  const ids = (L) => L.filter((id) => pages.has(id));
  const par = (re) => [...pages.keys()].filter((id) => re.test(id));
  const tri = (L) => L.sort((a, b) => pages.get(a).t.localeCompare(pages.get(b).t, 'fr'));
  // les récits, puis les dettes : après les quêtes
  if (pages.has('sys:recits')) {
    const onze = ['boulangere', 'forgeron', 'fillette', 'grainetiere', 'aubergiste', 'pecheur', 'guerisseuse', 'eleveuse', 'garde', 'maire', 'postiere'].map((k) => 'pnj:' + k);
    apres({ id: 'recits', t: 'Les récits des proches', d: 'Onze habitants, onze longs récits : l’amitié qui les ouvre, leurs chapitres, un choix qui change la fin ; les visites à la ferme, les cadeaux, le carnet « Proches ».', nouveau: true, groups: [{ t: 'Les récits des proches', ids: ['sys:recits'] }, { t: 'Les onze', ids: ids(onze) }] }, ['quetes16', 'principales', 'histoire', 'quetes']);
  }
  if (pages.has('sys:dettes')) apres({ id: 'dettes', t: 'Les dettes de la ferme', d: 'Huit termes à l’étude de Maître Delorme ; chaque terme payé, des travaux : la vieille ferme devient un domaine. Le retard, les huissiers, les scellés.', nouveau: true, groups: [{ t: 'Les dettes de la ferme', ids: ['sys:dettes'] }, { t: 'La ferme', ids: ids(['li:ferme']) }] }, ['recits', 'quetes16', 'principales']);
  // l'hôtel et le Cercle : après les runes (les grands lieux)
  if (pages.has('sys:l18_hotel')) apres({ id: 'grand-hotel', t: 'Le Grand Hôtel des Cimes', d: 'Un palace de 1868 sur le replat des monts de l’Est : le funiculaire, le métier de concierge (les clients, les gages, la réputation), quatre histoires, ses gens, ses lieux — et une chambre qui n’existe pas.', nouveau: true, groups: [{ t: 'L’hôtel', ids: ids(['sys:l18_hotel', 'sys:l18_concierge']) }, { t: 'Ses histoires', ids: ids(['sys:l18_firmin', 'sys:l18_lucien', 'sys:l18_symphonie', 'sys:l18_treize']) }, { t: 'Ses gens', ids: par(/^pnj:l18_/) }, { t: 'Ses lieux', ids: tri(par(/^li:l18_/)) }] }, ['runes', 'terres']);
  if (pages.has('sys:cercle')) apres({ id: 'grand-cercle', t: 'Le Grand Cercle', d: 'Le casino de Valbrume : la porte et la caisse, cinq jeux et leurs chances, le bar, les habitués ; la suite Impériale à l’étage, et le baron qui ne l’a jamais quittée.', nouveau: true, groups: [{ t: 'Le Cercle', ids: ids(['sys:cercle', 'sys:c18_suite', 'sys:c18_baron']) }, { t: 'Les jeux', ids: ids(['sys:c18_roulette', 'sys:c18_vingt', 'sys:c18_baccara', 'sys:c18_des', 'sys:c18_bandit']) }, { t: 'Ses gens', ids: par(/^pnj:c18_/) }, { t: 'Le lieu', ids: ids(['li:casino']) }] }, ['grand-hotel', 'runes', 'terres']);
  if (SECTION_P18) apres(SECTION_P18, ['grand-cercle']);
  // un mot dans « Quêtes » et dans « Nouveautés »
  const cq = pages.get('cat:quetes');
  if (cq && pages.has('sys:recits') && !cq.h.includes('sys%3Arecits')) cq.h = `<p class="note">Et les longues histoires : ${link('sys:recits', 'les récits des proches')} (onze habitants, un choix chacun) ; ${link('sys:l18_hotel', 'les histoires du Grand Hôtel des Cimes')} (quatre) ; ${link('sys:c18_baron', 'le baron de la suite Impériale')}, au Grand Cercle.</p>` + cq.h;
  const nv = cats[at('nouveautes')];
  if (nv && nv.d && !/dettes de la ferme/.test(nv.d)) nv.d = nv.d.replace(' : ', ' : les dettes de la ferme, le Grand Hôtel des Cimes, le Grand Cercle, les récits des proches, ');
}

module.exports = { build, sections };
