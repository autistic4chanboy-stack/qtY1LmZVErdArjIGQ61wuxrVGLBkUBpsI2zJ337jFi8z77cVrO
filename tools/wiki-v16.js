// Le wiki — LA SEIZIÈME VAGUE : des quêtes pour tout le monde (Q16). Chaque personnage qui parle a au moins une
// quête, un bon tiers en a deux : les habitants (NPC_DATA, leurs quêtes en plus passent par leur fiche « pnj: »,
// tools/wiki-build.js, questHTML), et les autres (Q16_PNJ : la diseuse, le violoneux, le crieur, le voiturier, le
// marchand de joie, le roi Sucre, la vieille des gobelins, Thibaud, la Dame de Hautguet, la veilleuse de la cité, les
// bêtes qui parlent, ceux du Dessous, les gens de Basse-Fosse — les anonymes : Q16_V5_MODELES).
// tools/wiki-build.js appelle :
//  - build(X) après tools/wiki-v15b.js : la fiche sys:quetes-tous (toutes les quêtes nouvelles, par personnage), les
//    quêtes des autres en bas de leur fiche (la diseuse, les bêtes qui parlent, ceux d’en bas…) ; l’aide du wiki du jeu
//    (sys:decouvertes) : l’attente après une mauvaise réponse ;
//  - sections(cats, X) : la section « Des quêtes pour tout le monde », après les quêtes ; un mot dans « Quêtes ».
// Ce qui se cache (sous « révéler les secrets ») : la suite des dialogues, ce qu’on voit sur place, les fins à choix,
// l’endroit des objets à retrouver, les quêtes tirées au sort des anonymes de Basse-Fosse.
'use strict';

// qui, sa fiche, où le trouver (les clés de Q16_PNJ ; sout:<k> et v5:<id> plus bas)
const QUI = {
  diseuse: ['Mère Ysaure, la diseuse de bonne aventure', 'act:diseuse', 'sous sa tente, en ville, le Marchedi, le Veilledi et le Vorndi (9 h - 19 h)'],
  violoneux: ['Le vieux Tiennot, le violoneux', 'act:violon', 'en ville, quand il joue (tous les jours sauf le Chômedi et le Vorndi, 10 h - 12 h 30 et 16 h - 19 h 30) : on lui parle en lui donnant la pièce'],
  crieur: ['Barnabé Toquet, le crieur public', 'act:crieur', 'en ville, à l’heure des annonces (8 h - 9 h et 17 h - 18 h, sauf le Chômedi) ; il ne parle qu’en annonces : un panneau s’ouvre quand il a quelque chose à vous demander'],
  voiturier: ['Le voiturier', 'sys:commandes', 'quand il livre un colis commandé, le matin : lui parler pendant sa tournée'],
  marchand_joie: ['Le marchand de joie', 'monde:bonbons', 'certains soirs, au bord d’un chemin (un homme en redingote verte)'],
  roi_sucre: ['Le roi Sucre', 'monde:bonbons', 'au pays des bonbons, en audience'],
  aieule: ['La vieille des gobelins', 'an:gob_aieule', 'tout en haut du grand tas, à la Gobelinière ; on lui dit « Que voulez-vous ? »'],
  thibaud: ['Thibaud, le vieil homme du treuil', 'sys:hautguet', 'au treuil du châtelet de Hautguet, sur les Hauts (les Terres d’Avant)'],
  dame: ['Dame Ysolde', 'sys:hautguet', 'derrière la porte de sa tour, à Hautguet'],
  veilleuse: ['La veilleuse', 'monde:vaisseau', 'dans la cité des Maisons-d’Étoile'],
  'bete:chat': ['Tibert, le chat de l’auberge', 'an:p_chat', 'sur un tonneau devant l’auberge, le soir ; après son propre service (« Un autre service ? »)'],
  'bete:hulotte': ['La hulotte du vieux chêne', 'an:p_hulotte', 'au chêne millénaire, la nuit ; après son propre service (« Autre chose ? »)'],
  'bete:corbeau': ['Tiécelin, le corbeau de la Table des Géants', 'an:p_corbeau', 'sur la Table des Géants, le jour ; après son propre service (« Autre chose ? »)'],
};
const SOUT_NOM = { un: 'Un, le vieux', deu: 'Deû, la vieille', tre: 'Trè', katr: 'Katr, le pêcheur', sin: 'Sin', si: 'Si, le porteur', se: 'Sè, le guetteur', ui: 'Ui, la fileuse', neu: 'Neu, l’enfant', di: 'Di, le jeune' };
const V5_NOM = { greffier: 'le Greffier', sonneuse_1: 'la Sonneuse', marchande_2: 'la Marchande', veilleuse_3: 'la Veilleuse (de Basse-Fosse)', ordonnateur_4: 'l’Ordonnateur' };
const ROLE = { gardien: 'Les gardiens (quatre)', habitant: 'Les gens d’en bas (douze)', enfant: 'Les enfants (trois)' };
const MOMENT = { nuit: 'la nuit (21 h 30 - 4 h)', aube: 'à l’aube (4 h 30 - 7 h 30)', soir: 'le soir (18 h - 21 h 30)' };
const SORTE = { apporter: 'apporter', livrer: 'livrer', parler: 'porter un message', trouver: 'retrouver', enquete: 'enquêter', aller: 'se rendre', chasse: 'chasser' };

function build(X) {
  const { DB, T, SP, SEC, esc, lk, IL, FILL, npcLink, placeLink, pages, used, nfmt, MF } = X;
  const log = (m) => (DB.log || (DB.log = [])).push('wiki-v16.js : ' + m);
  const files = Object.keys(MF || {}).filter((f) => /Q16-/.test(f));
  for (const [n, t] of Object.entries(DB.tables || {})) if (/Q16-/.test(t.file || '')) used.add(n);
  const PNJ = T('Q16_PNJ', null), HAB = T('Q16_HABITANTS', {}), MOD = T('Q16_V5_MODELES', {}), ANO = T('Q16_V5_ANONYMES', []);
  const NPCS = T('NPC_DATA', []), CHN = T('CHASSE_NOMS', {}) || {};
  if (!PNJ) { log('Q16_PNJ introuvable'); return; }
  // (les textes du jeu disent « au {lieu:cimetiere} » : « au le cimetière » ; ici, la contraction)
  const F = (t, who) => FILL(t, who).replace(/(^|[\s(«])(au|aux|à|des|de) (<a [^>]*>)(le|les) /g, (m, d, p, a, art) => {
    const c = art === 'le' ? (p === 'de' ? 'du' : p === 'des' ? 'des' : 'au') : (p === 'de' || p === 'des' ? 'des' : 'aux');
    return `${d}${c} ${a}`;
  });
  const cap = (t) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);
  const h3 = (t) => `<h3>${esc(t)}</h3>`;
  const ul = (a) => `<ul>${a.map((x) => `<li>${x}</li>`).join('')}</ul>`;
  const pg = (id, t) => (id && pages.has(id) ? lk(id, t) : esc(t));
  // le nom (lié) d'un personnage : un habitant, ou une clé de Q16_PNJ
  const quiInfo = (key) => {
    if (QUI[key]) return { nom: QUI[key][0], page: QUI[key][1], ou: QUI[key][2] };
    if (key.startsWith('sout:')) { const k = key.slice(5); return { nom: SOUT_NOM[k] || (PNJ[key] && PNJ[key].nom) || k, page: 'sout:g:' + k, ou: 'au Hameau d’En-Bas, dans le Dessous, une fois admis parmi eux ; on « ouvre les mains » : ils ne parlent pas notre langue' }; }
    if (key.startsWith('v5:')) { const k = key.slice(3); return { nom: V5_NOM[k] || (PNJ[key] && PNJ[key].nom) || k, page: 'sys:basse-fosse', ou: 'à Basse-Fosse, sous la Ville Basse, une fois compté parmi eux' }; }
    return { nom: key, page: null, ou: '' };
  };
  const qui = (key) => {
    if (!key) return '';
    if (!PNJ[key] && !QUI[key] && !/^(sout|v5):/.test(key)) return npcLink(key);
    const I = quiInfo(key);
    return pg(I.page, I.nom);
  };
  const rew = (r) => {
    r = r || {};
    const a = [];
    if (r.argent) a.push(`${nfmt(r.argent)} pièces`);
    if (r.amitie) a.push(`amitié +${r.amitie}`);
    if (r.objets) a.push(Object.entries(r.objets).map(([k, n]) => IL(k, n)).join(', '));
    return a.join(' · ') || '—';
  };
  const quoi = (q) => {
    const m = q.moment ? ' ' + esc(MOMENT[q.moment] || q.moment) : '';
    switch (q.type) {
      case 'apporter': return 'Apporter ' + Object.entries(q.need || {}).map(([k, n]) => IL(k, n)).join(', ') + (q.garde ? ' <small>(à montrer : on le garde)</small>' : '');
      case 'livrer': return `Remettre ${IL(q.objet)} à ${qui(q.a)} <small>(l’objet est donné en acceptant)</small>`;
      case 'parler': return `Porter un message à ${qui(q.a)}, puis revenir`;
      case 'trouver': return `Retrouver ${IL(q.objet)}, là où la demande le dit`;
      case 'aller': return `Se rendre${m} vers ${placeLink(q.lieu)}, y rester un moment, puis revenir`;
      case 'enquete': return `Aller observer${m} ${placeLink(q.lieu)}, y rester quelques instants, puis revenir`;
      case 'chasse': return `Abattre ${esc(CHN[q.bete] || q.bete)}${(q.n || 1) > 1 ? ` <small>×${q.n}</small>` : ''}, une fois la quête acceptée`;
      default: return esc(q.type || '');
    }
  };
  // une quête : son bloc (comme celles des habitants)
  const bloc = (q, who, opts) => {
    opts = opts || {};
    let h = `<div class="quest"><h4>« ${esc(q.title)} » <small>${esc(SORTE[q.type] || q.type)}${q.minAmitie ? ` · amitié ${q.minAmitie} au moins` : ''}${q.apres ? ' · après la précédente' : ''}</small></h4><dl class="kv">`;
    h += `<dt>Ce qu’il faut faire</dt><dd>${quoi(q)}</dd>`;
    if (q.type === 'trouver' && q.lieu) h += `<dt>Où</dt><dd>${SEC(placeLink(q.lieu), false)}<span class="sec-note">masqué</span></dd>`;
    h += `<dt>Récompense</dt><dd>${q.choix && q.choix.length ? `selon la réponse qu’on choisit à la fin (${q.choix.length} possibles)` : rew(q.reward)}</dd></dl>`;
    const tx = q.texte || {};
    if (tx.offre && !opts.court) h += `<blockquote>${F(tx.offre, who)}</blockquote>`;
    const L = { accepte: 'Quand on accepte', attente: 'En attendant', vu: 'Sur place', recu: 'Le message', fin: 'À la fin' };
    const rest = Object.keys(L).filter((k) => tx[k]).map((k) => `<p class="small"><b>${L[k]} :</b> ${F(tx[k], k === 'recu' ? null : who)}</p>`);
    const chx = (q.choix || []).map((c) => `<p class="small"><b>« ${esc(c.label)} »</b> <small>(${rew(c.reward)}${c.garde ? ' ; on garde l’objet' : ''})</small> : ${F(c.texte, who)}</p>`);
    if (!opts.court && (rest.length || chx.length)) h += SEC(`<details><summary>La suite de la quête</summary>${rest.join('')}${chx.join('')}</details>`, false);
    return h + '</div>';
  };

  // ---------------------------------------------------------------- les groupes
  const GRP = [
    ['En ville et sur les chemins', ['diseuse', 'violoneux', 'crieur', 'voiturier', 'marchand_joie']],
    ['Les bêtes qui parlent', Object.keys(PNJ).filter((k) => k.startsWith('bete:'))],
    ['Ailleurs : les autres mondes, les gobelins, Hautguet, la cité', ['roi_sucre', 'aieule', 'thibaud', 'dame', 'veilleuse']],
    ['Le Dessous : ceux d’en bas', Object.keys(PNJ).filter((k) => k.startsWith('sout:'))],
    ['Basse-Fosse : ceux qui ont un nom', Object.keys(PNJ).filter((k) => k.startsWith('v5:'))],
  ];
  const nHab = NPCS.filter((d) => (d.quests || []).length).length;
  const nDeux = NPCS.filter((d) => (d.quests || []).length >= 2).length + Object.values(PNJ).filter((P) => (P.quetes || []).length >= 2).length;
  const nAutres = Object.keys(PNJ).length + ANO.length;
  const nNew = Object.values(HAB).reduce((a, L) => a + L.length, 0) + Object.values(PNJ).reduce((a, P) => a + (P.quetes || []).length, 0) + ANO.length;

  let h = `<p class="lead">Tout le monde a quelque chose à demander. Chaque personnage qui parle a au moins une quête, un bon tiers en a deux : les habitants, et aussi ceux qui ne sont pas des habitants — la diseuse, le violoneux, le crieur, le voiturier, les bêtes qui parlent, ceux d’en bas, les gens de Basse-Fosse…</p>`;
  h += `<p>${nHab} habitants et ${nAutres} autres personnages ; ${nDeux} ont deux quêtes. ${nNew} quêtes nouvelles en tout.</p>`;
  h += h3('Comment ça marche') + ul([
    'On parle à quelqu’un : dans son panneau, une ligne de plus, « Avez-vous besoin d’aide ? » (la vieille des gobelins : « Que voulez-vous ? » ; ceux d’en bas : « Ouvrir les mains »). Il dit ce qu’il veut : « D’accord, je m’en charge », ou « Pas maintenant » (il redemandera le lendemain).',
    'Ceux qui ne parlent qu’en sous-titres (le crieur, le voiturier, les gens de Basse-Fosse) ouvrent un panneau seulement quand ils ont quelque chose : une proposition par jour au plus.',
    'Une quête à la fois par personnage ; la seconde vient quand la première est finie. Chez les habitants, il faut parfois un peu d’amitié d’abord.',
    'Les bêtes qui parlent proposent la leur après leur propre service. Ceux du Dessous, seulement une fois qu’on est admis parmi eux ; ceux de Basse-Fosse, une fois compté.',
    '<b>Livrer</b> : l’objet est donné en acceptant ; chez le destinataire, la ligne « Remettre : … ». <b>Porter un message</b> : la ligne « Un message de … ». Puis on revient voir celui qui l’a demandé.',
    `<b>Se rendre</b>, <b>enquêter</b> : aller jusqu’au lieu (à l’heure dite, s’il y en a une : ${Object.values(MOMENT).join(', ')}) et y rester un moment, un peu plus pour une enquête ; ce qu’on voit s’affiche en bas de l’écran. <b>Retrouver</b> : l’objet est posé quelque part dans le lieu nommé. <b>Chasser</b> : seules comptent les bêtes abattues après avoir accepté.`,
    'Quelques fins se choisissent : une réponse parmi deux, et la récompense en dépend.',
    'Si celui qui demande, ou celui à qui l’on doit porter quelque chose, meurt ou s’en va, la quête ne pourra plus se faire.',
    'Tout se suit dans le carnet (menu <kbd>Tab</kbd>, onglet <b>Carnet</b>, page <b>Quêtes</b>) : « En cours » et « Accompli », avec ce qu’il reste à faire. Les objets de quête ne se vendent pas. Ceux d’en bas ne paient pas en pièces : ils donnent des choses.',
  ]);

  // ---------------------------------------------------------------- les habitants
  {
    const rows = [];
    for (const [id, L] of Object.entries(HAB)) for (const q of L) rows.push(`<tr><td>« ${esc(q.title)} »${q.minAmitie ? ` <small>amitié ${q.minAmitie}</small>` : ''}</td><td>${npcLink(id)}</td><td>${quoi(q)}</td><td>${q.choix && q.choix.length ? 'selon la réponse choisie' : rew(q.reward)}</td></tr>`);
    if (rows.length) {
      h += h3('Les habitants') + `<p>Les Sources, la naine, les gardes et le chevalier ont maintenant leurs quêtes ; quelques autres en ont une seconde. Où trouver chacun : sa fiche. Toutes les quêtes des habitants : ${lk('cat:quetes', 'Quêtes')}.</p>`;
      h += `<table class="t"><tr><th>Quête</th><th>Qui</th><th>Ce qu’il faut faire</th><th>Récompense</th></tr>${rows.join('')}</table>`;
    }
  }
  // ---------------------------------------------------------------- les autres, par personnage
  const fichesAutres = {};
  for (const [titre, keys] of GRP) {
    const ks = keys.filter((k) => PNJ[k]);
    if (!ks.length) continue;
    h += `<h3>${esc(titre)}</h3>`;
    for (const key of ks) {
      const P = PNJ[key], I = quiInfo(key);
      let b = `<h4>${pg(I.page, cap(I.nom))}</h4>${I.ou ? `<p class="small">Où : ${esc(I.ou)}.</p>` : ''}`;
      b += (P.quetes || []).map((q) => bloc(q, null)).join('');
      h += b;
      if (I.page && pages.has(I.page)) (fichesAutres[I.page] || (fichesAutres[I.page] = [])).push([key, I]);
    }
  }
  // ---------------------------------------------------------------- Basse-Fosse : les anonymes
  {
    let s = `<p>Les autres gens de Basse-Fosse — ${Object.keys(ROLE).map((r) => ROLE[r].toLowerCase().replace(/^les /, '')).join(', ')} — ont chacun une quête, tirée parmi celles de leur rang ; toujours la même pour une partie donnée.</p>`;
    let sec = '';
    for (const [role, L] of Object.entries(MOD)) {
      if (!Array.isArray(L) || !L.length) continue;
      sec += `<h4>${esc(ROLE[role] || role)}</h4><table class="t"><tr><th>Quête</th><th>Ce qu’il faut faire</th><th>Récompense</th></tr>${L.map((q) => `<tr><td>« ${esc(q.title)} »</td><td>${quoi(q)}</td><td>${rew(q.reward)}</td></tr>`).join('')}</table>`;
    }
    h += h3('Basse-Fosse : les autres') + s + SEC(sec, 'Les quêtes possibles des anonymes de Basse-Fosse : masqué (secrets).');
  }
  h += `<p>${lk('cat:quetes', 'Les quêtes des habitants')} · ${pages.has('sys:quetes-principales') ? lk('sys:quetes-principales', 'Les quêtes principales') : ''}</p>`;
  SP('sys:quetes-tous', { t: 'Des quêtes pour tout le monde', s: 'Chaque personnage a au moins une quête, un tiers en a deux', c: ['quetes16'], i: '✎', h }, files);

  // ---------------------------------------------------------------- les quêtes des autres, en bas de leur fiche
  for (const [id, L] of Object.entries(fichesAutres)) {
    const p = pages.get(id);
    if (!p || /q16-fiche/.test(p.h || '')) continue;
    const plusieurs = L.length > 1 || id === 'sys:basse-fosse';
    let b = `<h3 class="q16-fiche">${plusieurs ? 'Leurs quêtes' : 'Ses quêtes'}</h3>`;
    for (const [key, I] of L) {
      if (plusieurs) b += `<h4>${esc(cap(I.nom))}</h4>`;
      b += (PNJ[key].quetes || []).map((q) => bloc(q, null)).join('');
    }
    b += `<p>${lk('sys:quetes-tous', 'Des quêtes pour tout le monde')}</p>`;
    p.h = (p.h || '') + b;
  }
  // les fiches des habitants : un lien vers la fiche d'ensemble
  for (const id of Object.keys(HAB)) {
    const p = pages.get('pnj:' + id);
    if (p && !/sys%3Aquetes-tous|sys:quetes-tous/.test(p.h || '')) p.h = (p.h || '') + `<p class="note">Ses quêtes nouvelles, avec celles des autres : ${lk('sys:quetes-tous', 'Des quêtes pour tout le monde')}.</p>`;
  }
  // les objets de quête : à quoi ils servent
  const qobj = {};
  for (const [key, P] of Object.entries(PNJ)) for (const q of P.quetes || []) if (q.objet) (qobj[q.objet] || (qobj[q.objet] = [])).push([q, key]);
  for (const [id, L] of Object.entries(HAB)) for (const q of L) if (q.objet) (qobj[q.objet] || (qobj[q.objet] = [])).push([q, id]);
  for (const M of Object.values(MOD)) for (const q of M || []) if (q.objet) (qobj[q.objet] || (qobj[q.objet] = [])).push([q, 'v5:anonyme']);
  for (const [it, L] of Object.entries(qobj)) {
    const p = pages.get('it:' + it);
    if (!p || /sys%3Aquetes-tous|sys:quetes-tous/.test(p.h || '')) continue;
    p.h = (p.h || '') + `<h3>Quête</h3><ul>${L.map(([q, k]) => `<li>« ${esc(q.title)} » — ${k === 'v5:anonyme' ? 'un habitant de Basse-Fosse' : qui(k)}</li>`).join('')}</ul><p>${lk('sys:quetes-tous', 'Des quêtes pour tout le monde')}</p>`;
  }

  // ---------------------------------------------------------------- le wiki du jeu : l'attente après une mauvaise réponse
  const dc = pages.get('sys:decouvertes');
  if (dc && dc.h) dc.h = dc.h.replace('l’on attend quelques secondes avant de rechoisir', 'l’on attend six secondes avant de rechoisir');
}

function sections(cats, X) {
  const { pages, link } = X;
  const at = (id) => cats.findIndex((c) => c.id === id);
  if (pages.has('sys:quetes-tous') && at('quetes16') < 0) {
    const i = ['principales', 'quetes', 'habitants'].map(at).find((x) => x >= 0);
    cats.splice(i >= 0 ? i + 1 : cats.length, 0, { id: 'quetes16', t: 'Des quêtes pour tout le monde', d: 'Chaque personnage a au moins une quête, un tiers en a deux : les habitants, la diseuse, le violoneux, le crieur, les bêtes qui parlent, ceux d’en bas, les gens de Basse-Fosse…', nouveau: true, groups: [{ t: 'Des quêtes pour tout le monde', ids: ['sys:quetes-tous'] }] });
  }
  const cq = pages.get('cat:quetes');
  if (cq && pages.has('sys:quetes-tous') && !cq.h.includes('sys%3Aquetes-tous')) cq.h = `<p class="note">Et celles des autres (la diseuse, les bêtes qui parlent, ceux d’en bas…) : ${link('sys:quetes-tous', 'des quêtes pour tout le monde')}.</p>` + cq.h;
  const nv = cats[at('nouveautes')];
  if (nv && nv.d && !/quêtes pour tout le monde/.test(nv.d)) nv.d = nv.d.replace(' : ', ' : des quêtes pour tout le monde, ');
}

module.exports = { build, sections, QUI };
