// Le wiki — LA DIX-SEPTIÈME VAGUE : l'histoire, « Le Guet » (H17), et la version de bureau (S17).
// tools/wiki-build.js appelle :
//  - build(X) après tools/wiki-v16.js : la fiche sys:histoire (les huit chapitres et ce qu'il faut y faire, les deux
//    fins, les cinématiques, le carnet), la fiche sys:options (les options du jeu, dont les nouvelles : plein écran,
//    qualité graphique, revoir les cinématiques ; le bouton « Quitter » de la version de bureau) ; un mot dans les
//    fiches des cinématiques, des quêtes principales, de la sacoche et du carnet ;
//  - sections(cats, X) : la section « L'histoire », avant les quêtes principales ; un mot dans « Quêtes » et dans
//    « Nouveautés ».
// Ce qui se cache (sous « révéler les secrets ») : ce que le carnet retient de chaque chapitre, les paroles des scènes,
// ce que veut dire chaque fin (le choix du Ver) et l'épilogue.
'use strict';

// où se fait chaque étape (des fiches qui existent : liées si elles sont là)
const ETAPE_LIENS = {
  lettre: [['li:ferme', 'la vieille ferme'], ['txt:notes_trouvees', 'les notes à trouver']],
  nuit: [['li:ferme', 'la vieille ferme'], ['sys:sommeil', 'dormir']],
  tombe: [['li:cimetiere', 'le cimetière'], ['txt:notes_trouvees', 'les notes à trouver']],
  page: [['li:vieux_puits', 'le vieux puits']],
  temple: [['li:cascade', 'la cascade de la source'], ['li:temple', 'le temple sous la montagne']],
  trois: [['sys:temple', 'le temple'], ['sys:divins', 'les Trois'], ['dieu:aela', 'Aëla'], ['dieu:durn', 'Durn'], ['dieu:vesh', 'Vesh']],
  pierres: [['sys:langues', 'les inscriptions'], ['li:dolmen', 'la Table des Géants'], ['li:menhirs', 'les Demoiselles'], ['li:cercle', 'le cercle de pierres']],
  mots: [['sys:langues', 'apprendre les langues perdues'], ['lg:aelin', 'l’aëlin'], ['lg:gorrain', 'le gorrain'], ['li:bibliotheque', 'la grande bibliothèque']],
  tablettes: [['sys:runes', 'les runes et leurs tablettes']],
  cercle: [['sys:runes', 'l’assemblage (Atelier → Runes)']],
  aller: [['li:hameau', 'le hameau de Clairpré'], ['li:grande_porte', 'la Grande Porte'], ['sys:grande-porte', 'la fiche de la Porte']],
  passer: [['sys:grande-porte', 'la Grande Porte'], ['sys:terres-avant', 'les Terres d’Avant']],
  feu: [['sys:terres-avant', 'les Terres d’Avant et leurs feux de veille'], ['zone:seuil', 'le Seuil']],
  carnet: [['it:v3_carnet', 'le carnet du Guet'], ['sys:ver', 'le Ver'], ['zone:hauts', 'les Hauts']],
  cle: [['zone:pic', 'le Pic'], ['it:v3_cle_collier', 'la clé du collier'], ['sys:ver', 'le Ver']],
  choix: [['sys:ver', 'le Ver']],
};
// le jour d'ouverture, en mots
const JOUR = (d) => (d <= 1 ? 'dès le premier jour' : `à partir du jour ${d}`);

function build(X) {
  const { DB, T, SP, SEC, esc, lk, pages, used, MF } = X;
  const log = (m) => (DB.log || (DB.log = [])).push('wiki-v17.js : ' + m);
  for (const [n, t] of Object.entries(DB.tables || {})) if (/H17-/.test(t.file || '')) used.add(n);
  const files = Object.keys(MF || {}).filter((f) => /H17-/.test(f));
  const CH = T('H17_CHAPITRES', null), FINS = T('H17_FINS', {}) || {}, CINES = T('H17_CINES', {}) || {}, ORDRE = T('H17_ORDRE_CINES', []) || [];
  const V5 = T('H17_V5', {}) || {}, TX = T('H17_TEXTES', {}) || {};
  const TITRE = T('H17_HISTOIRE', 'Le Guet') || 'Le Guet';
  const h3 = (t) => `<h3>${esc(t)}</h3>`;
  const ul = (a) => `<ul>${a.map((x) => `<li>${x}</li>`).join('')}</ul>`;
  const pg = (id, t) => lk(id, t);
  const liens = (L) => (L || []).map(([id, t]) => pg(id, t)).join(' · ');

  // ================================================================ l'histoire
  if (!Array.isArray(CH) || !CH.length) log('H17_CHAPITRES introuvable');
  else {
    let h = `<p class="lead">« ${esc(TITRE)} » : la quête principale du jeu, de l’arrivée à la ferme d’Anselme Varenne jusqu’à une fin. ${CH.length} chapitres, qui tiennent ensemble ce que la vallée avait déjà — la lettre et la tombe d’Anselme, le temple des Trois, les langues perdues, les tablettes de runes, la Grande Porte, les Terres d’Avant, le Guet et le Ver.</p>`;
    h += h3('Comment ça marche') + ul([
      'Un chapitre s’ouvre quand le précédent est achevé et que son jour est venu ; il s’achève quand toutes ses étapes sont faites, <b>dans n’importe quel ordre</b>.',
      'Chaque étape se fait avec ce qui existe déjà dans la vallée (les notes, le temple, les inscriptions, les tablettes, la Porte…) : rien n’est généré, rien n’oblige, rien ne se bloque ; la ferme continue à côté. L’histoire ne paie rien : ni pièces ni objets.',
      'Ce qu’on a fait d’avance compte : une étape déjà faite est cochée dès l’ouverture du chapitre. <b>Une partie d’avant</b> reprend au bon chapitre, sans rejouer les scènes passées (elles rejoignent les souvenirs).',
      'À l’écran, rien qu’une ligne discrète, quelques secondes, quand un chapitre s’ouvre ou avance : le chapitre et ce qui reste à faire.',
      'Tout se suit dans le carnet (menu <kbd>Tab</kbd>, onglet <b>Carnet</b>, page <b>Histoire</b>) : le chapitre en cours et ses étapes (cochées quand elles sont faites), les chapitres passés en une phrase, et « Revoir » leur scène.',
    ]);

    // ---- les chapitres
    h += `<h3>Les chapitres</h3><table class="t"><tr><th>Chapitre</th><th>S’ouvre</th><th>Ce qu’il faut faire</th></tr>${CH.map((C) => `<tr><th>${esc(C.num)}. ${esc(C.titre)}</th><td>${esc(JOUR(C.des))}</td><td>${(C.etapes || []).map((E) => esc(E.texte)).join('<br>')}</td></tr>`).join('')}</table>`;
    for (const C of CH) {
      h += `<h4>Chapitre ${esc(C.num)} — ${esc(C.titre)} <small>${esc(JOUR(C.des))}</small></h4>`;
      h += ul((C.etapes || []).map((E) => `${esc(E.texte)}${ETAPE_LIENS[E.id] ? ` <small>(${liens(ETAPE_LIENS[E.id])})</small>` : ''}`));
      const sc = CINES[C.cine];
      if (sc && sc.titre) h += `<p class="small">Il s’ouvre sur une scène : « ${esc(sc.titre)} ».</p>`;
      if (C.resume) h += SEC(`<p class="small"><b>Ce que le carnet en retient :</b> ${esc(C.resume)}</p>`, false);
    }
    h += `<p class="sec-note">Ce que le carnet retient de chaque chapitre : masqué (secrets).</p>`;

    // ---- les fins
    const FK = Object.keys(FINS);
    h += h3('Les fins') + `<p>${FK.length === 2 ? 'Deux fins' : FK.length + ' fins'}, celles du ${pg('sys:ver', 'Ver')} : ${FK.map((k) => `« ${esc(FINS[k].titre)} »`).join(' et ')}. On y arrive où qu’en soit l’histoire : une scène sur place, puis l’épilogue dans la vallée (au retour, s’il le faut), puis le générique. Ensuite, la ferme continue.</p>`;
    {
      const V3 = { delivre: 'délivrer le Ver : lui ôter son collier avec la clé du dernier guetteur', tue: 'tuer le Ver' };
      let s = ul(FK.map((k) => { const F = FINS[k]; return `<b>« ${esc(F.titre)} »</b> — ${esc(V3[F.v3] || F.v3 || '')}. ${esc(F.resume || '')}`; }));
      const v5 = Object.values(V5).filter(Boolean);
      if (v5.length) s += `<p class="small">Dans l’épilogue, ce qu’on a fait à ${pg('sys:basse-fosse', 'Basse-Fosse')} ajoute sa phrase (${v5.length} possibles) : ${v5.map((x) => `« ${esc(x)} »`).join(' ; ')}</p>`;
      s += `<p class="small">Les clés et ce qu’on choisit là-haut : ${pg('it:v3_cle_collier', 'la clé du collier')} · ${pg('zone:pic', 'le Pic')} · ${pg('sys:ver', 'le Ver')}</p>`;
      h += SEC(s, 'Ce que veut dire chaque fin, et l’épilogue : masqué (secrets).');
    }

    // ---- les cinématiques
    h += h3('Les cinématiques') + ul([
      'L’arrivée (une partie neuve : la vallée, la vieille forêt, la ferme), une scène à l’ouverture de chaque chapitre, la fin et son épilogue, le générique.',
      'Elles se jouent au premier moment tranquille : pas pendant un danger, une nuit rouge, un panneau ouvert, le sommeil. Plusieurs chapitres d’un coup : seule la dernière scène se joue, les autres rejoignent les souvenirs.',
      'On les <b>passe en maintenant <kbd>Espace</kbd> ou <kbd>Échap</kbd></b> (une jauge sous l’invite « Maintenir Espace ou Échap : passer »). Pendant une scène, la vallée attend : le temps arrêté, ni coup ni mort ni faim ; on retrouve ensuite sa place et son regard.',
      'Les sous-titres donnent le nom de qui parle ; une phrase en aëlin ne se lit que par les mots qu’on en sait (le sens entier quand on les connaît tous : voir ' + pg('sys:langues', 'les langues perdues') + ').',
      'On les revoit : Carnet → <b>Souvenirs</b> (les scènes déjà vues, de cette partie et des autres), ou depuis les Options (section Jeu) : « Revoir les cinématiques (Souvenirs) ».',
    ]);
    const titres = ORDRE.filter((k) => CINES[k] && CINES[k].titre);
    if (titres.length) {
      const pub = titres.filter((k) => !CINES[k].fin && k !== 'finale' && k !== 'generique'), sec = titres.filter((k) => CINES[k].fin || k === 'finale');
      h += `<p>Les souvenirs, dans l’ordre : ${pub.map((k) => `« ${esc(CINES[k].titre)} »`).join(', ')}${sec.length ? ', puis les scènes de la fin' : ''}${titres.includes('generique') ? ' et le générique' : ''}.</p>`;
      const par = titres.filter((k) => (CINES[k].paroles || []).length).map((k) => {
        const C = CINES[k];
        const L = [...(C.paroles || []), ...(C.parolesCendre || [])].map(([qui, t, sens]) => `<p class="small">${qui ? `<b>${esc(qui)} :</b> ` : ''}« ${esc(t)} »${sens ? ` <small>(${esc(sens)})</small>` : ''}</p>`).join('');
        return `<h4>« ${esc(C.titre)} »</h4>${L}`;
      }).join('');
      if (par) h += SEC(`<details><summary>Les paroles des scènes</summary>${par}</details>`, 'Les paroles des scènes : masqué (secrets).');
    }
    h += h3('Le générique') + `<p>Après l’épilogue, le générique défile (des rôles, pas de noms), sur un air du domaine public. Il se revoit avec l’épilogue, depuis les souvenirs.</p>`;
    h += `<p>${pg('sys:quetes-principales', 'Les quêtes principales')} · ${pg('cat:quetes', 'Les quêtes des habitants')} · ${pg('sys:quetes-tous', 'Des quêtes pour tout le monde')} · ${pg('sys:cinematiques', 'Les cinématiques')} · ${pg('sys:options', 'Les options')}</p>`;
    SP('sys:histoire', { t: 'L’histoire : « ' + TITRE + ' »', s: `La quête principale, en ${CH.length} chapitres, et ses cinématiques`, c: ['histoire'], i: '📜', h }, files);
  }

  // ================================================================ les options (et la version de bureau)
  {
    const NV = (DB.derived && DB.derived.nv) || {};
    const opts = (NV.options || []).slice();
    let h = `<p class="lead">Le bouton ⚙ du menu ouvre les Options ; le jeu se met en pause. Quatre sections : Image, Son, Commandes, Jeu.</p>`;
    h += h3('Nouveau') + ul([
      '<b>Image › Qualité graphique</b> : quatre préréglages — Basse (machines modestes), Moyenne (par défaut), Haute, Très haute — qui règlent ensemble la pixelisation, la distance de vue, celle du brouillard et celle de l’herbe et des fleurs. Toucher un de ces réglages à la main : « Personnalisée ».',
      '<b>Image › Plein écran</b> : une case (dans un navigateur, le plein écran de la page ; dans la version de bureau, celui de la fenêtre, aussi par <kbd>F11</kbd> ou <kbd>Alt</kbd>+<kbd>Entrée</kbd>).',
      '<b>Jeu › Revoir les cinématiques (Souvenirs)</b> : ouvre la page Souvenirs du carnet (' + pg('sys:histoire', 'l’histoire') + ').',
      '<b>Quitter</b> : dans la version de bureau seulement, un bouton en bas du menu ; il enregistre la partie, puis ferme le jeu.',
    ]);
    if (opts.length) h += h3('Toutes les options') + `<ul class="cols">${[...opts, 'Qualité graphique', 'Plein écran', 'Revoir les cinématiques (Souvenirs)'].map((o) => `<li>${esc(o)}</li>`).join('')}</ul>`;
    h += `<p>${pg('sys:savoir', 'La sacoche et le carnet')} · <a href="#/p/cat%3Acommandes">Commandes et mécaniques</a> · ${pg('sys:son', 'Le son')}</p>`;
    SP('sys:options', { t: 'Les options', s: 'Image, Son, Commandes, Jeu ; la qualité graphique, le plein écran', c: ['corps'], g: (pages.get('sys:savoir') && pages.get('sys:savoir').g) || '', i: '⚙', h });
  }

  // ================================================================ un mot ailleurs
  const ajoute = (id, test, html, debut) => { const p = pages.get(id); if (p && !test.test(p.h || '')) p.h = debut ? html + (p.h || '') : (p.h || '') + html; };
  // les cinématiques
  ajoute('sys:cinematiques', /sys:histoire|h17-cine/, `<h3 class="h17-cine">L’histoire</h3><p>Les scènes de ${pg('sys:histoire', 'l’histoire')} — l’arrivée, une par chapitre, la fin, le générique — se passent en <b>maintenant</b> <kbd>Espace</kbd> ou <kbd>Échap</kbd> (une jauge) et se revoient dans le carnet (page Souvenirs) ou depuis les Options.</p>`);
  // les quêtes principales
  ajoute('sys:quetes-principales', /sys:histoire/, `<p class="note">Et la quête principale du jeu, en huit chapitres : ${pg('sys:histoire', 'l’histoire, « ' + TITRE + ' »')}.</p>`, true);
  // le menu : les pages du carnet
  const sv = pages.get('sys:savoir');
  if (sv && sv.h) {
    sv.h = sv.h.replace('<td>Quêtes · Légendes · Langues</td>', '<td>Histoire · Quêtes · Légendes · Langues · Souvenirs</td>')
      .replace('<td>quêtes, gens rencontrés, notes, journal ;', '<td>l’histoire (le chapitre en cours) ; quêtes, gens rencontrés, notes, journal ;')
      .replace('les mots de l’aëlin et du gorrain, les inscriptions</td>', 'les mots de l’aëlin et du gorrain, les inscriptions ; les scènes déjà vues, à revoir (la page n’apparaît qu’après la première)</td>');
    if (!/sys:options/.test(sv.h)) sv.h = sv.h.replace('rangées en quatre sections : Image, Son, Commandes, Jeu.', 'rangées en quatre sections : Image, Son, Commandes, Jeu (voir ' + pg('sys:options', 'les options') + ').');
  }
}

function sections(cats, X) {
  const { pages, link } = X;
  const at = (id) => cats.findIndex((c) => c.id === id);
  if (pages.has('sys:histoire') && at('histoire') < 0) {
    let i = at('principales');
    if (i < 0) { const j = at('quetes'); i = j >= 0 ? j + 1 : cats.length; }
    cats.splice(i, 0, { id: 'histoire', t: 'L’histoire', d: 'La quête principale, « Le Guet » : huit chapitres de l’héritage d’Anselme jusqu’au Guet, deux fins, les cinématiques et les souvenirs.', nouveau: true, groups: [{ t: 'L’histoire', ids: ['sys:histoire'] }] });
  }
  const cq = pages.get('cat:quetes');
  if (cq && pages.has('sys:histoire') && !cq.h.includes('sys%3Ahistoire')) cq.h = `<p class="note">La quête principale du jeu, en huit chapitres : ${link('sys:histoire', 'l’histoire, « Le Guet »')}.</p>` + cq.h;
  const nv = cats[at('nouveautes')];
  if (nv && nv.d && !/l’histoire/.test(nv.d)) nv.d = nv.d.replace(' : ', ' : l’histoire (« Le Guet ») et ses cinématiques, ');
}

module.exports = { build, sections };
