// Le wiki — LA VINGT ET UNIÈME VAGUE : la pêche à QTE (P21 : src/11-zzzzzzzzzzzP21-*.js, src/12-zzzzzzzzzzzP21-hud.js),
// les menus refaits (M21 : src/12-zzzzzzzzzzzM21-menus.js) et le garde-sol (src/11-zzzzzzzzzzzZ21-sol.js).
// tools/wiki-build.js appelle :
//  - build(X) après tools/wiki-v20.js : la fiche sys:peche (« La pêche », comme le wiki du jeu : les quatre temps, la
//    prise, chaque espèce à sa façon, les appâts, les cannes, les coins à poissons, le carnet, le concours au poids, la
//    pêche sous la glace, l'aide à la pêche, les commandes) ; dans la fiche de chaque poisson, sa façon de se battre, sa
//    taille et ses appâts ; dans celle de chaque appât, ce qu'il attire ; les cannes, le concours du Pêchedi, le lac
//    gelé, le menu de butin, le wiki du jeu ; la fiche sys:options (les onglets, la taille de l'interface, réduire les
//    animations, l'aide à la pêche, les menus) ; la sacoche et le carnet (les raccourcis, la page Pêche) ; une ligne
//    dans la fiche du corps (les chutes) : passé sous la carte, on est remis là où l'on était ;
//  - sections(cats, X) : « La pêche » en tête de la section « Poissons » ; un mot dans « Poissons » et « Nouveautés » ;
//  - commandes(X) une fois la page « Commandes et mécaniques » faite : la ligne de la pêche, la manette en jeu.
// Ce qui se cache (sous « révéler les secrets ») : le combat des quatre grands poissons, le poisson échappé qui revient,
// ce que font la malchance et les runes contraires.
'use strict';

// la façon de se battre de chaque espèce (la clé : P21_STYLES ; le jeu en a sa phrase, P21_TEXTES.combats)
const FACON = {
  fretin: 'se laisse remonter',
  perche: 'secoue la tête et part de côté',
  carpe: 'file loin, longtemps',
  truite: 'saute hors de l’eau',
  saumon: 'saute, et file',
  brochet: 'se débat violemment : la tension saute sans cesse',
  anguille: 'se tortille : des invites à gauche, à droite, à la suite',
  silure: 'plonge, lourd',
  ecrevisse: 'recule',
  aveugle: 'tire vers le fond',
  lune: 'glisse et saute, sans bruit',
  esturgeon: 'plonge, et ne lâche rien',
};
// les quatre grands poissons (la Reine du lac, le vieux silure, le vieux brochet, le poisson des Anciens) : leur combat est un secret
const LEGENDE = {
  reine: 'file loin, puis tourne autour de la ligne (des invites à gauche, à droite, qui s’enchaînent), puis sonde au fond.',
  vieux: 'plonge, puis se cale au fond : la ligne ne gagne plus rien ; il faut tenir la tension dans la bonne zone, ni molle ni rouge, pour l’en arracher.',
  notaire: 'le plus rageur ; il saute et secoue la tête sans cesse, avec des invites plus courtes.',
  ancien: 'tire en suites : trois invites à la file, dans un ordre qui ne se devine pas, « comme on frappe à une porte ».',
};
// le poids, comme sur la carte de la prise : 1,1 kg ; 40 g
const kg = (x) => (x >= 1 ? `${(Math.round(x * 10) / 10).toString().replace('.', ',')} kg` : `${Math.max(1, Math.round(x * 1000))} g`);
const dec = (x) => String(x).replace('.', ',');
// « plus vite » : 1 / 0,55 → presque deux fois
const fois = (k) => (k < 1.15 ? '' : k < 1.4 ? 'un peu plus vite' : k < 1.95 ? 'presque deux fois plus vite' : k < 2.4 ? 'deux fois plus vite' : k < 2.9 ? 'presque trois fois plus vite' : k < 3.2 ? 'trois fois plus vite' : 'plus de trois fois plus vite');
const moins = (t) => { const p = Math.round((1 - t) * 100); return p === 25 ? 'un quart de moins' : p === 50 ? 'moitié moins' : `${p} % de moins`; };

function build(X) {
  const { DB, T, SP, SEC, esc, lk, IL, pages, used, MF, ITEMS, mapBtn } = X;
  const log = (m) => (DB.log || (DB.log = [])).push('wiki-v21.js : ' + m);
  const fichiers = (re) => Object.keys(MF || {}).filter((f) => re.test(f));
  // les tables de la vague : lues ici (pas de « données du module » en bas des fiches)
  for (const [n, t] of Object.entries(DB.tables || {})) if (/(P21|M21|Z21)-/.test(t.file || '')) used.add(n);
  const h3 = (t) => `<h3>${esc(t)}</h3>`;
  const ul = (a) => `<ul>${a.filter(Boolean).map((x) => `<li>${x}</li>`).join('')}</ul>`;
  const secS = (html) => `<span class="sec">${html}</span><span class="sec-note">masqué (secrets)</span>`;
  const k = (s) => `<kbd>${esc(s)}</kbd>`;
  const ajoute = (id, test, html, debut) => { const p = pages.get(id); if (!p) { log('pas de fiche ' + id); return; } if (!test.test(p.h || '')) p.h = debut ? html + (p.h || '') : (p.h || '') + html; };
  // remplacer un passage d'une fiche (une fois) ; prévenir s'il a disparu (sauf si c'est déjà fait)
  const remplace = (id, avant, apres, fait) => {
    const p = pages.get(id);
    if (!p || !p.h) { log('pas de fiche ' + id); return; }
    if (fait && fait.test(p.h)) return;
    if (avant instanceof RegExp ? !avant.test(p.h) : !p.h.includes(avant)) { log(`${id} : passage introuvable (${String(avant).slice(0, 50)})`); return; }
    p.h = p.h.replace(avant, apres);
  };

  const R = T('P21_REGL', {}) || {}, ST = T('P21_STYLES', {}) || {}, ESP = T('P21_ESPECES', {}) || {}, AP = T('P21_APPATS', {}) || {};
  const ORDRE = (T('P21_APPATS_ORDRE', null) || Object.keys(AP)).filter((a) => AP[a] && ITEMS[a]);
  const TX = T('P21_TEXTES', {}) || {}, AIDES = TX.aides || { complete: 'Complète', simplifiee: 'Simplifiée', auto: 'Automatique' };
  const OPTION = TX.option || 'Aide à la pêche';
  const FISH = T('FISH', {}) || {};
  const FEN = R.fenetre || { complete: 0.75, simplifiee: 1.5, auto: 2.2 }, LAN = R.lancer || { min: 4, max: 17 }, EPU = R.epuisette || { kg: 1.2 };
  const TENUE = R.tenue || { canne: 1, canne_fer: 0.75, canne_dame: 0.6 };
  if (!Object.keys(ST).length || !Object.keys(ESP).length) log('P21_STYLES ou P21_ESPECES introuvable');
  // les espèces, par façon de se battre (dans l'ordre des façons du jeu), et les appâts qui attirent chacune
  const style = (id) => (ESP[id] ? ESP[id][0] : 'perche');
  const especes = Object.keys(FISH).filter((id) => ITEMS[id]);
  for (const id of especes) if (!ESP[id]) log('pas de taille pour ' + id + ' (P21_ESPECES)');
  for (const id of especes) if (!FACON[style(id)] && !LEGENDE[style(id)]) log('pas de façon de se battre pour ' + id + ' (' + style(id) + ')');
  const appatsDe = (id) => ORDRE.filter((a) => (AP[a].esp || []).includes(id));
  const taille = (id) => { const E = ESP[id]; return E ? `de ${Math.round(E[1])} à ${Math.round(E[2])} cm, de ${kg(E[3])} à ${kg(E[4])}` : ''; };

  // ================================================================ la fiche « La pêche »
  {
    const lgd = especes.filter((id) => LEGENDE[style(id)]);
    let h = `<p class="lead">Une canne en main, face à l’eau : on dose le lancer, on attend que le bouchon plonge — pas qu’il frémisse —, on ferre, puis on mouline sans casser la ligne. Les gros se sortent à l’épuisette, et chaque prise est mesurée et pesée.</p>`;
    h += h3('En quatre temps') + `<ol>${[
      `<b>Le lancer.</b> On <b>maintient le clic</b> : une jauge monte, puis redescend ; on <b>relâche</b> quand la distance est la bonne (de ${LAN.min} à ${LAN.max} m). Le bouchon tombe droit devant, à la distance dosée, avec des ronds dans l’eau. Sur la berge : « (Pas d’eau là-bas.) », et l’on recommence.`,
      `<b>L’attente.</b> Le bouchon dandine. Parfois il <b>frémit</b> (un poisson goûte) : ce n’est pas le moment. La vraie touche s’annonce : il s’enfonce une fois, se relève, puis <b>plonge</b>, avec un « ploc » sourd et de grands ronds ; un « ! » s’allume.`,
      `<b>Ferrer.</b> Un clic (ou ${k('Espace')}) dans la courte fenêtre qui suit la plongée (${dec(FEN.complete)} s). Trop tôt ou trop tard, le poisson part — la ligne reste à l’eau, un autre mordra ; trop tard, il emporte l’appât une fois sur deux. Un clic quand rien ne bouge relève la ligne.`,
      `<b>Le combat.</b> On <b>mouline en maintenant le clic</b> (ou ${k('Espace')}), en surveillant trois choses : la <b>tension</b>, une jauge à zones (molle, bonne, dangereuse, rouge) — au rouge, « Lâchez du fil ! », et si l’on mouline encore, la ligne casse ; trop longtemps molle, le poisson se décroche ; son <b>endurance</b>, qui fond quand on mouline sous tension ; la <b>distance</b> — s’il prend tout le fil (${R.fil || 32} m), elle casse. À ses coups, une <b>invite</b> montre quoi faire, avant que son anneau se referme : il part d’un côté, <b>tirez de l’autre</b> (${k('←')} ${k('→')}, ${k('Q')} ${k('D')}, ou un geste net de la souris) ; il plonge, <b>levez la canne</b> (${k('↑')}, ${k('Z')}, la souris vers le haut) ; il saute, <b>baissez-la</b> (${k('↓')}, ${k('S')}, la souris vers le bas), sinon il risque de se décrocher. Réussie, il perd des forces ; manquée, la tension bondit et il reprend du fil. « Il s’épuise. » : on le ramène sans peine ; <b>au-delà de ${kg(EPU.kg)}, il se sort à l’épuisette</b>, une dernière invite au bord (${k('Espace')} ou clic) ; manquée, il repart pour un tour. Pendant le combat, on ne marche pas : les flèches et ZQSD tirent la canne.`,
    ].map((x) => `<li>${x}</li>`).join('')}</ol>`;
    h += h3('La prise') + `<p>Le poisson est montré en main, en gros plan, avec sa carte : son nom, <b>sa taille et son poids</b> (« 58 cm · 1,1 kg », tirés selon l’espèce : la plupart moyens, quelques gros), <b>« Record ! »</b> quand c’est le plus gros jamais pris de son espèce, <b>« Première prise »</b> pour une espèce nouvelle. ${IL('coffre_peche')}, ${IL('perle')} ou ${IL('fibre')} se montrent aussi, sans taille. Une ligne cassée coûte l’appât, jamais la canne.</p>`;
    // chaque espèce à sa façon
    {
      const rows = Object.keys(FACON).map((s) => [s, especes.filter((id) => style(id) === s)]).filter(([, L]) => L.length);
      h += h3('Chaque espèce à sa façon') + `<table class="t"><tr><th>Au bout de la ligne</th><th>Espèces</th></tr>${rows.map(([s, L]) => `<tr><td>${esc(FACON[s])}</td><td>${L.map((id) => IL(id)).join(', ')}</td></tr>`).join('')}</table>`;
      h += `<p>La taille compte : un gros de son espèce tire plus fort et plus longtemps (la fiche de chaque poisson donne sa taille). ${lgd.length === 4 ? 'Les quatre' : 'Les'} grands poissons de la vallée (${lgd.map((id) => IL(id)).join(', ')}) ont chacun leur combat.</p>`;
    }
    // les appâts
    h += h3('Les appâts') + `<p>Clic droit, la canne en main et la ligne relevée : on passe d’un appât à l’autre parmi ceux qu’on a sur soi, ou « Sans appât ». Un appât est mangé à chaque prise et perdu si la ligne casse. Avec un appât, ça mord un peu plus vite, et chacun <b>attire certaines espèces</b> — jamais les poissons rares, qui ne changent pas.</p>`;
    h += `<table class="t"><tr><th>Appât</th><th>Attire</th></tr>${ORDRE.map((a) => `<tr><td>${IL(a)}${AP[a].vif ? ' <small>(vif)</small>' : ''}</td><td>${(AP[a].esp || []).filter((id) => ITEMS[id]).map((id) => IL(id)).join(', ')}</td></tr>`).join('')}</table>`;
    // les cannes
    {
      const canne = (id, base) => {
        if (!ITEMS[id]) return '';
        const v = fois(1 / (ITEMS[id].fast || 1)), t = TENUE[id] !== undefined && TENUE[id] < 1 ? moins(TENUE[id]) : '';
        return `${IL(id)} : ${base || [v ? `la touche vient ${v}` : '', t ? `elle tient mieux la tension (${t}) : moins de lignes cassées` : ''].filter(Boolean).join(', et ')}.`;
      };
      h += h3('Les cannes') + ul([canne('canne', 'la base'), canne('canne_fer'), canne('canne_dame')]);
    }
    h += h3('Les coins à poissons') + `<p>Dans chaque eau, <b>un à trois coins</b> où ça mord mieux : des ronds naissent à la surface, un petit poisson saute (un « ploc »). Un bouchon posé dedans : la touche vient plus vite. Les coins changent <b>chaque jour</b>, toujours à portée de lancer d’une rive.</p>`;
    h += h3('Le carnet de pêche') + ul([
      `Menu (${k('Tab')}), onglet <b>Carnet</b>, page <b>Pêche</b> : le nombre de prises, les espèces prises sur toutes celles qui existent, les lignes cassées et les poissons décrochés ; l’appât en place, la canne, l’aide choisie.`,
      'Chaque espèce prise, de la plus lourde à la plus légère (on cherche, on trie par poids, par nom, par nombre) : <b>son record</b> (taille et poids), <b>où et quand</b> il a été pris ; un bouton « Fiche » ouvre sa page dans le wiki du jeu. En bas, combien d’espèces n’ont jamais été prises (sans les nommer). Un record nouveau met une pastille sur la page.',
      `Le ${lk('sys:decouvertes', 'wiki du jeu')} apprend à chaque prise de nouvelles lignes sur la fiche du poisson : où il mord, quand il mord, sa façon de se battre, et ce qui le fait mordre quand on l’a pris avec un appât qui l’attire.`,
    ]);
    h += h3('Le concours du Pêchedi') + `<p>${lk('act:peche', 'Le concours')} se juge <b>au poids</b> : on présente sa prise la plus lourde du jour, pesée au ponton. Chaque prise plus lourde est annoncée ; le panneau donne la pesée de chacun (« 1. le pêcheur (carpe, 6,3 kg) ; 2. vous… »).</p>`;
    h += h3('Sous la glace') + `<p>Au ${lk('li:lac_gele', 'lac gelé')}, ${k('E')} sur le trou, une canne sur soi (n’importe laquelle : elle passe en main) : la ligne descend dans le trou ; on ferre quand le bouchon plonge, on remonte le poisson du fond. ${k('E')} à nouveau relève la ligne.</p>`;
    h += h3('L’aide à la pêche') + `<p>Options › Jeu › <b>« ${esc(OPTION)} »</b> :</p>` + ul([
      `<b>${esc(AIDES.complete)}</b> (par défaut) : tout ce qui précède.`,
      `<b>${esc(AIDES.simplifiee)}</b> : la jauge du lancer reste en haut, la fenêtre pour ferrer est ${FEN.simplifiee >= FEN.complete * 1.9 ? 'deux fois plus longue' : 'plus longue'} (${dec(FEN.simplifiee)} s), pas d’invites pendant le combat (les coups du poisson se parent d’eux-mêmes), la ligne tient plus longtemps dans le rouge, l’épuisette se fait seule : on mouline et l’on surveille la tension.`,
      `<b>${esc(AIDES.auto)}</b> : comme avant — un clic lance là où l’on vise, on ferre quand ça plonge (${dec(FEN.auto)} s), le poisson vient tout seul, sans risque.`,
    ]);
    h += h3('Les commandes') + `<table class="t"><tr><th></th><th>Clavier et souris</th><th>Manette</th></tr>${[
      ['lancer', 'maintenir le clic, relâcher', 'maintenir A (ou RT), relâcher'],
      ['ferrer', `clic ou ${k('Espace')}`, 'A'],
      ['mouliner', `clic ou ${k('Espace')} maintenu`, 'RT ou A maintenu'],
      ['tirer, lever, baisser la canne', `flèches, ${k('Z')}${k('Q')}${k('S')}${k('D')} (${k('W')}${k('A')}${k('S')}${k('D')} en QWERTY), ou un geste net de la souris`, 'croix ou stick gauche'],
      ['l’épuisette', `${k('Espace')} ou clic`, 'A'],
      ['relever la ligne', 'clic droit (ou un clic quand rien ne mord)', 'B'],
      ['changer d’appât', 'clic droit, la ligne relevée', 'X'],
    ].map(([a, b, c]) => `<tr><th>${esc(a)}</th><td>${b}</td><td>${esc(c)}</td></tr>`).join('')}</table>`;
    h += `<p class="note">Mêmes poissons, mêmes prix, mêmes raretés qu’avant : un pêcheur moyen prend autant de poissons à l’heure, un maladroit un quart de moins, un adroit un cinquième de plus. Les appâts servent à viser une espèce (un record, le concours) plus qu’à gagner davantage.</p>`;
    // ce qui se cache
    {
      let s = `<h4>Les grands poissons</h4>${ul(lgd.map((id) => `${IL(id)} : ${esc(LEGENDE[style(id)])}`))}`;
      s += `<h4>Le poisson qui s’échappe</h4><p>Une ligne cassée, un poisson décroché : la prochaine touche, au même endroit, le même jour, c’est <b>lui</b> (« Il est encore là, quelque part sous l’eau. », parfois). Un poisson rare manqué n’est pas perdu. Mais une ${lk('sys:maledictions', 'malédiction')} de malchance ou une ${lk('sys:runes', 'rune')} contraire fait toujours décrocher des poissons, au tout dernier moment : ceux-là ne reviennent pas.</p>`;
      h += h3('Ce qui se cache') + SEC(s, 'Le combat des grands poissons, le poisson qui revient : masqué (secrets).');
    }
    h += `<p>${mapBtn ? mapBtn('couche:peche', 'Les zones de pêche sur la carte') + ' ' : ''}<a href="#/p/cat%3Apoissons">Le tableau de pêche</a> · ${lk('act:peche', 'Le concours du Pêchedi')} · ${lk('sys:options', 'Les options')} · <a href="#/p/cat%3Acommandes">Commandes et mécaniques</a></p>`;
    SP('sys:peche', { t: 'La pêche', s: 'Le lancer, la touche, le combat, la prise ; les appâts, les records, le carnet', c: ['poissons'], i: '🎣', h }, fichiers(/P21-/));
  }

  // ================================================================ chaque poisson : sa façon de se battre, sa taille, ses appâts
  for (const id of especes) {
    const p = pages.get('it:' + id);
    if (!p || !p.h || /p21-f/.test(p.h)) { if (!p) log('pas de fiche it:' + id); continue; }
    const a = p.h.indexOf('<dt>Pêche</dt><dd>'), b = a >= 0 ? p.h.indexOf('</dd>', a) : -1;
    if (b < 0) { log('it:' + id + ' : pas de ligne « Pêche »'); continue; }
    const s = style(id), t = taille(id), ap = appatsDe(id);
    let rows = LEGENDE[s]
      ? `<dt class="p21-f">Au bout de la ligne</dt><dd>un combat à part${t ? ` <small>(${t})</small>` : ''} : ${secS(esc(LEGENDE[s]))}</dd>`
      : `<dt class="p21-f">Au bout de la ligne</dt><dd>${esc(FACON[s] || '')}${t ? ` <small>(${t})</small>` : ''} — ${lk('sys:peche', 'la pêche')}</dd>`;
    if (ap.length) rows += `<dt>Ce qui le fait mordre</dt><dd>${ap.map((x) => IL(x)).join(', ')}</dd>`;
    p.h = p.h.slice(0, b + 5) + rows + p.h.slice(b + 5);
  }
  // chaque appât : ce qu'il attire
  for (const a of ORDRE) {
    const p = pages.get('it:' + a);
    if (!p || !p.h || /p21-a/.test(p.h)) { if (!p) log('pas de fiche it:' + a); continue; }
    const row = `<dt class="p21-a">Appât</dt><dd>${AP[a].vif ? 'un petit poisson vif ; ' : ''}attire ${(AP[a].esp || []).filter((id) => ITEMS[id]).map((id) => IL(id)).join(', ')} (${lk('sys:peche', 'la pêche')})</dd>`;
    const A = '<h3>À quoi il sert</h3><dl class="kv wide">';
    const i = p.h.indexOf(A);
    if (i >= 0) p.h = p.h.slice(0, i + A.length) + row + p.h.slice(i + A.length);
    else {
      const html = `<h3>À quoi il sert</h3><dl class="kv wide">${row}</dl>`;
      const j = ['<div class="sec"><h3>Essences', '<h3 class="seealso">'].map((x) => p.h.indexOf(x)).filter((x) => x >= 0).sort((x, y) => x - y)[0];
      p.h = j >= 0 ? p.h.slice(0, j) + html + p.h.slice(j) : p.h + html;
    }
  }
  // les cannes : « Fast » dit en mots
  for (const id of ['canne', 'canne_fer', 'canne_dame']) {
    const p = pages.get('it:' + id), I = ITEMS[id];
    if (!p || !p.h || !I || /p21-c/.test(p.h)) continue;
    const v = fois(1 / (I.fast || 1)), t = TENUE[id] !== undefined && TENUE[id] < 1 ? moins(TENUE[id]) : '';
    const dd = `<dt class="p21-c">À la pêche</dt><dd>${[v ? `la touche vient ${v}` : 'la canne de base', t ? `elle tient mieux la tension (${t})` : ''].filter(Boolean).join(' ; ')} — ${lk('sys:peche', 'la pêche')}</dd>`;
    if (/<dt>Fast<\/dt><dd>[^<]*<\/dd>/.test(p.h)) p.h = p.h.replace(/<dt>Fast<\/dt><dd>[^<]*<\/dd>/, dd);
    else { const i = p.h.indexOf('</dl>'); if (i >= 0) p.h = p.h.slice(0, i) + dd + p.h.slice(i); }
  }
  // le concours : au poids
  remplace('act:peche', /on présente sa plus belle prise, et le jury classe par la valeur des poissons\./, `on présente sa <b>prise la plus lourde</b>, pesée au ponton : c’est le poids qui compte. Chaque prise plus lourde du jour est annoncée, et le panneau donne la pesée de chacun (voir ${lk('sys:peche', 'la pêche')}).`, /c’est le poids qui compte/);
  // le lac gelé : le trou
  ajoute('li:lac_gele', /sys%3Apeche|p21-glace/, `<p class="note p21-glace">La pêche sous la glace : ${k('E')} sur le trou, une canne sur soi (n’importe laquelle) ; on ferre quand le bouchon plonge (${lk('sys:peche', 'la pêche')}).</p>`);
  // le menu de butin : la phrase de la canne (celle d'avant le QTE)
  remplace('sys:butin', /<th>Canne<\/th><td>[^<]*<\/td>/, `<th>Canne</th><td>Pour pêcher : maintenez le clic pour doser le lancer, ferrez quand le bouchon plonge, puis moulinez sans casser la ligne (${lk('sys:peche', 'la pêche')}).</td>`, /Pour pêcher : maintenez le clic/);
  // le wiki du jeu : ce qu'on apprend d'un poisson
  remplace('sys:decouvertes', '<li><b>Plantes et arbres</b>', `<li><b>Poissons</b> (en le prenant) : <i>où il mord</i>, <i>quand il mord</i>, <i>au bout de la ligne</i> (sa façon de se battre) ; <i>ce qui le fait mordre</i>, quand on l’a pris avec un appât qui l’attire (${lk('sys:peche', 'la pêche')}).</li><li><b>Plantes et arbres</b>`, /<b>Poissons<\/b> \(en le prenant\)/);

  // ================================================================ les options : les onglets, l'interface, l'aide à la pêche
  {
    const p = pages.get('sys:options');
    if (!p || !p.h) log('pas de fiche sys:options');
    else if (!/m21-onglets/.test(p.h)) {
      p.s = 'Image, Son, Commandes, Interface, Jeu ; la taille de l’interface, l’aide à la pêche';
      remplace('sys:options', 'Quatre sections : Image, Son, Commandes, Jeu.', `Cinq onglets : Image, Son, Commandes, Interface, Jeu (${k('Tab')} et ${k('Maj')}+${k('Tab')} au clavier, RB et LB à la manette).`);
      const onglets = `<h3 class="m21-onglets">Les onglets</h3><table class="t">${[
        ['Image', 'la qualité graphique, le plein écran, le champ de vision, la pixelisation, les distances (vue, brouillard, herbe et fleurs), la luminosité, les effets, la palette tramée, l’éclairage par paliers, le grain, les images/s'],
        ['Son', 'le volume, l’ambiance, la musique, le son 3D'],
        ['Commandes', 'la sensibilité de la souris, l’axe vertical, les vibrations de la manette'],
        ['Interface', '<b>la taille de l’interface</b>, <b>réduire les animations</b>, les infobulles des objets, la barre d’outils, les sous-titres, le petit point de visée'],
        ['Jeu', `la langue, le wiki interactif, moins de texte, revoir les cinématiques, les scènes des quêtes, <b>l’${esc(OPTION.charAt(0).toLowerCase() + OPTION.slice(1))}</b>`],
      ].map(([a, b]) => `<tr><th>${a}</th><td>${b}</td></tr>`).join('')}</table>`;
      const nouveau = [
        `<li><b>Interface › Taille de l’interface</b> : <i>Automatique</i> (selon l’écran : un peu plus petite sur un très petit écran, plus grande sur un grand écran — environ 125 % en 1440p, 185 % en 4K), ou 75 %, 85 %, 100 %, 110 %, 125 %, 150 %, 175 %, 200 %, 250 %. Tout ce qui est menu grandit : panneaux, dialogues, sous-titres, ce qu’on ramasse, barre d’outils.</li>`,
        `<li><b>Interface › Réduire les animations</b> : plus de fondus ni de glissements à l’ouverture des menus (cochée d’office si le système le demande).</li>`,
        `<li><b>Interface › Infobulles des objets</b> ; <b>Commandes › Vibrations de la manette</b>.</li>`,
        `<li><b>Jeu › ${esc(OPTION)}</b> : ${esc(AIDES.complete)} (par défaut), ${esc(AIDES.simplifiee)} (des fenêtres larges, sans invites pendant le combat), ${esc(AIDES.auto)} (comme avant : on lance, on ferre quand ça plonge, le poisson vient) — voir ${lk('sys:peche', 'la pêche')}.</li>`,
      ].join('');
      const i = p.h.indexOf('</p>');
      if (i >= 0) p.h = p.h.slice(0, i + 4) + onglets + p.h.slice(i + 4);
      remplace('sys:options', '<h3>Nouveau</h3><ul>', '<h3>Nouveau</h3><ul>' + nouveau);
      remplace('sys:options', '<li>Scènes des quêtes</li></ul>', `<li>Scènes des quêtes</li><li>${esc(OPTION)}</li></ul>`);
      // les menus (M21) : un mot, rattaché ici (avant les liens du bas : « La sacoche et le carnet · … »)
      const menus = `<h3>Les menus</h3>${ul([
        'Tout ce qui s’ouvre pendant la partie — le menu Tab, les boutiques, les coffres, les dialogues, les lettres et les livres, l’alambic, les cartes — est une feuille de papier posée sur la vue, de la même écriture que l’écran titre ; une croix ✕, toujours en haut à droite, referme, et <kbd>Échap</kbd> aussi.',
        `Au clavier seul ou à la manette, on va partout (un anneau ambré montre où l’on est) ; une ligne en bas de chaque menu rappelle les touches. Les raccourcis, les mêmes partout : <a href="#/p/cat%3Acommandes">Commandes et mécaniques</a>.`,
        'Les longues listes se cherchent et se trient (la sacoche, la boutique, le coffre, le wiki, les gros livres) ; au survol, un objet montre sa catégorie, sa description, combien on en a et ce qu’il se revend ; au coffre, « Combien ? » (clic droit, <kbd>Maj</kbd>+<kbd>Entrée</kbd> ou X) prend ou dépose le nombre voulu.',
      ])}`;
      const j = Math.max(p.h.lastIndexOf('\u0002sys:savoir\u0003'), p.h.lastIndexOf('sys%3Asavoir')), l = j >= 0 ? p.h.lastIndexOf('<p>', j) : -1;
      p.h = l >= 0 ? p.h.slice(0, l) + menus + p.h.slice(l) : p.h + menus;
      SP('sys:options', {}, fichiers(/M21-/));
    }
  }
  // la sacoche et le carnet : les raccourcis, les onglets des options, la page Pêche
  {
    const p = pages.get('sys:savoir');
    if (p && p.h && !/p21-carnet/.test(p.h)) {
      remplace('sys:savoir', '· Légendes · Langues', '· Légendes · Pêche · Langues');
      remplace('sys:savoir', 'les légendes entendues et les reliques ;', `les légendes entendues et les reliques ; <span class="p21-carnet">le carnet de pêche (les prises, les records, où et quand : ${lk('sys:peche', 'la pêche')})</span> ;`);
      remplace('sys:savoir', 'les objets (clic : en main ; glisser sur la barre d’outils)', 'les objets (clic : en main ; glisser sur la barre d’outils, ou <kbd>1</kbd>-<kbd>9</kbd> sur l’objet ; on cherche, on trie, on filtre)');
      remplace('sys:savoir', /<li><kbd>Tab<\/kbd> ouvre et referme ;[^]*?<\/li>/, `<li>${k('Tab')} ouvre le menu ; dedans, ${k('Tab')} et ${k('Maj')}+${k('Tab')} passent d’un onglet à l’autre, ${k('Pg↑')} ${k('Pg↓')} (ou ${k('Maj')}+${k('←')} ${k('→')}) d’une page à l’autre, les flèches d’un bouton à l’autre ; ${k('Échap')} referme ; ${k('Ctrl')}+${k('F')} ou ${k('/')} : chercher ; ${k('1')}-${k('9')} sur un objet le rangent dans cette case de la barre d’outils. À la manette : Select (Vue) ouvre et referme le menu ; RB et LB, les onglets ; LT et RT, les pages ; B revient d’un cran.</li>`);
      remplace('sys:savoir', 'rangées en quatre sections : Image, Son, Commandes, Jeu', 'rangées en cinq onglets : Image, Son, Commandes, Interface, Jeu');
    }
  }
  // le garde-sol : une ligne, aux chutes
  {
    const p = pages.get('sys:corps');
    if (!p || !p.h) log('pas de fiche sys:corps');
    else if (!/z21-sol/.test(p.h)) {
      const ligne = '<p class="note z21-sol">Passé sous la carte (un trou dans le sol du jeu, une chute qui ne finit pas), on est remis là où l’on était juste avant, sans dégâts.</p>';
      const a = p.h.indexOf('<h3>Les chutes</h3>');
      let b = a >= 0 ? p.h.indexOf('</table>', a) : -1;
      if (b >= 0) { b += 8; if (p.h.startsWith('<p class="note">', b)) b = p.h.indexOf('</p>', b) + 4; }
      p.h = b >= 0 ? p.h.slice(0, b) + ligne + p.h.slice(b) : p.h + ligne;
      SP('sys:corps', {}, fichiers(/Z21-/));
    }
  }
}

function sections(cats, X) {
  const { pages, link } = X;
  const at = (id) => cats.findIndex((c) => c.id === id);
  // « La pêche » en tête des poissons
  const cp = cats[at('poissons')];
  if (cp && pages.has('sys:peche')) {
    cp.groups = (cp.groups || []).map((g) => Object.assign({}, g, { ids: g.ids.filter((id) => id !== 'sys:peche') })).filter((g) => g.ids.length);
    cp.groups.unshift({ t: 'La pêche', ids: ['sys:peche'] });
    if (!/le lancer/.test(cp.d || '')) cp.d = (cp.d || '').replace(/\.$/, '') + ' ; et la pêche elle-même : le lancer, la touche, le combat, les appâts, les records.';
  }
  const pp = pages.get('cat:poissons');
  if (pp && pp.h && pages.has('sys:peche') && !/p21-peche/.test(pp.h)) {
    const mot = `<p class="note p21-peche">Comment on les prend — le lancer dosé, la touche, le combat, l’épuisette —, ce qui les fait mordre, les records et le carnet : ${link('sys:peche', 'la pêche')}. Chaque fiche dit la façon de se battre du poisson, sa taille et ses appâts.</p>`;
    const i = pp.h.indexOf('</p>');
    pp.h = i >= 0 ? pp.h.slice(0, i + 4) + mot + pp.h.slice(i + 4) : mot + pp.h;
  }
  const nv = cats[at('nouveautes')];
  if (nv && nv.d && !/la pêche/.test(nv.d)) nv.d = nv.d.replace(' : ', ' : la pêche (lancer, ferrer, mouliner), les menus refaits, ');
}

// la page « Commandes et mécaniques » (faite après les sections) : la pêche, et la manette en jeu
function commandes(X) {
  const { pages, link } = X;
  const p = pages.get('cat:commandes');
  if (!p || !p.h || /p21-cmd/.test(p.h)) return;
  const peche = pages.has('sys:peche') ? link('sys:peche', 'la pêche') : 'la pêche';
  // la ligne du menu « Commandes » du jeu date d'avant le QTE
  p.h = p.h.replace(/(<tr><th>Pêche<\/th><td>)[^<]*(<\/td><\/tr>)/, `$1<span class="p21-cmd">maintenir le clic, relâcher : lancer ; au bouchon qui plonge, clic : ferrer ; clic maintenu : mouliner, les flèches (ou ZQSD) pour tirer, lever, baisser la canne ; clic droit : l’appât (${peche})</span>$2`);
  const mot = `<p class="note p21-cmd">Ces raccourcis sont les mêmes dans tous les menus : le menu Tab, les boutiques, les coffres, les dialogues, les lettres et les livres, les cartes, les Options. Au clavier ou à la manette, un anneau ambré entoure ce qui est choisi, et une ligne en bas de chaque menu rappelle les touches — ou les boutons de la manette, dès qu’on s’en sert ; avec la souris, rien ne change. Dans les listes déroulantes et les réglettes des Options, <kbd>←</kbd> <kbd>→</kbd> changent la valeur. En jeu, la manette ouvre les menus (Start : le menu du jeu ; Select : le menu Tab) et sert à pêcher (A ou RT, la croix ou le stick, B, X : ${peche}).</p>`;
  const a = p.h.indexOf('<h3>À la manette (menus)</h3>'), b = a >= 0 ? p.h.indexOf('</table>', a) : -1;
  if (b >= 0) p.h = p.h.slice(0, b + 8) + mot + p.h.slice(b + 8);
  else if (!/p21-cmd/.test(p.h)) p.h += mot;
}

module.exports = { build, sections, commandes, FACON, LEGENDE };
