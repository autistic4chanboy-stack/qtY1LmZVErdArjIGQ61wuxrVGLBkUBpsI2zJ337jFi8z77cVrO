// Le wiki — LA QUINZIÈME VAGUE, suite : les runes (R15), le wiki du jeu et les découvertes (D15), le menu simplifié
// (M15). Les bêtes des Terres d’Avant et le suivi de la partie sont dans tools/wiki-v15.js.
// tools/wiki-build.js appelle :
//  - build(X) après tools/wiki-v15.js : les fiches sys:runes et sys:decouvertes, le menu du jeu dans sys:savoir ;
//    les modules de la vague y sont rattachés (pas de fiche « Autres nouveautés » pour eux) ;
//  - sections(cats, X) : la section « Les runes », la fiche des découvertes près de la sacoche.
// Ce qui se cache (sous « révéler les secrets ») : le sens des runes, les signes et leurs effets, les dalles et leurs
// runes, la place des tablettes. Les outils de mise au point ne paraissent nulle part.
'use strict';

// le sens des domaines et des mesures (R15_RUNES : d, m)
const DOMAINE = { recolte: 'la récolte (la pousse des cultures)', chance: 'la chance (les fouilles, les coffres)', peche: 'la pêche (la touche, les prises)', pas: 'le pas (l’allure)', nuit: 'la nuit (sa clarté ; dans les Terres d’Avant, le bruit des pas)', faim: 'la faim' };
const SORTE = { domaine: 'domaine', signe: 'signe', mesure: 'mesure', cle: 'clé' };
const DALLE = {
  caveau: ['Le caveau du bois', 'un petit caveau de pierre moussue, dans une forêt de la vallée, loin des chemins (250 à 800 m de la ferme)', 'li:r15_caveau'],
  niche: ['La niche des Galeries', 'un cul-de-sac du labyrinthe de la mine (le Dessous), fermé par une dalle', 'li:sout_galeries'],
  tertre: ['Le tertre scellé', 'dans les Terres d’Avant, aux Tertres', 'zone:tertres'],
};

function glyphe(segs, px = 26) {
  if (!Array.isArray(segs) || !segs.length) return '';
  const d = segs.map(([a, b, c, e]) => `M${a} ${b}L${c} ${e}`).join('');
  return `<svg class="r15g" viewBox="-0.15 -0.15 1.3 1.3" width="${px}" height="${px}" aria-hidden="true" style="vertical-align:middle"><path d="${d}" fill="none" stroke="currentColor" stroke-width="0.1" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function build(X) {
  const { DB, T, P, SP, SEC, esc, lk, IL, pages, MF, used, ITEMS } = X;
  const log = (m) => (DB.log || (DB.log = [])).push('wiki-v15b.js : ' + m);
  const files = (re) => Object.keys(MF || {}).filter((f) => re.test(f));
  const h3 = (t) => `<h3>${esc(t)}</h3>`;
  const ul = (a) => `<ul>${a.map((x) => `<li>${x}</li>`).join('')}</ul>`;
  const pc = (x) => `${Math.round(x * 100)} %`;
  // les tables de la vague : leur fiche est ici (rien en bas des fiches, rien dans « Autres tables »)
  for (const [n, t] of Object.entries(DB.tables || {})) if (/(R15|D15|M15)-/.test(t.file || '')) used.add(n);

  // ================================================================ les runes
  {
    const RU = T('R15_RUNES', null), ORD = T('R15_ORDRE', null) || (RU ? Object.keys(RU) : []);
    const RG = T('R15_REGL', {}), PO = T('R15_PORTES', {}), DES = T('R15_DESSOUS', ['gyve', 'dar', 'lone']);
    const nom = (k) => (RU && RU[k] ? RU[k].nom : k);
    const filH = RG.filH || 12, darJ = RG.darJ || 7, nuit = RG.nuit || [20, 6];
    let h = `<p class="lead">Quelque part, des tablettes de pierre grise portent des signes gravés. Il en faut quatre : alors la pierre s’éveille, et l’on assemble trois runes. Ce qui en sort ne se dit pas : une lueur, un son de pierre — ou un coup mat, et rien.</p>`;
    h += h3('Les tablettes') + ul([
      'Quatre, d’un demi-mètre, penchées au pied de quelque chose, à l’écart des chemins. On ne tombe pas dessus par hasard ; la nuit, leurs signes luisent à peine.',
      '<kbd>E</kbd> sur « Une pierre gravée » : on la prend. Chacune porte trois runes.',
      'Leur place change d’une partie à l’autre.',
    ]);
    h += h3('L’assemblage') + ul([
      'Dans le menu (<kbd>Tab</kbd>), onglet <b>Atelier</b>, page <b>Runes</b> : les tablettes trouvées, les runes connues, un cercle à trois places, « Assembler ».',
      'Tant qu’il manque une tablette, le cercle reste gris : rien ne prend.',
      'Les quatre réunies, trois runes posées dans le cercle : selon l’assemblage, quelque chose change, pour un temps ou pour plusieurs jours.',
      'Un assemblage par jour. Les effets en cours se lisent à leurs signes, en lueur, sous le cercle ; ils pâlissent vers la fin.',
      `Ce qu’on a compris de chaque signe se note dans le ${lk('sys:decouvertes', 'wiki du jeu')}.`,
    ]);
    h += h3('Les dalles scellées') + ul([
      '« Une dalle gravée » : trois signes, dont un à moitié effacé. Elle ne s’ouvre pas autrement qu’avec ses runes : devant elle, <kbd>E</kbd>, puis l’assemblage.',
      'Le bon assemblage, et la dalle s’enfonce dans le sol. Derrière, quelque chose attend (une fois).',
      'Il y en a trois : une dans la vallée, une sous terre, une derrière la Grande Porte.',
    ]);
    // ---- les secrets
    let s = '';
    if (RU) {
      s += h3('Les douze runes') + `<table class="t"><tr><th></th><th>Rune</th><th>Sorte</th><th>Sens</th></tr>${ORD.filter((k) => RU[k]).map((k) => {
        const r = RU[k];
        const sens = r.sorte === 'domaine' ? DOMAINE[r.d] || r.d : r.sorte === 'signe' ? (r.s > 0 ? 'en faveur' : r.s < 0 ? 'en défaveur : le malheur' : `selon l’heure : en faveur la nuit (${nuit[0]} h - ${nuit[1]} h), en défaveur le jour`) : r.sorte === 'mesure' ? (r.m === 'fil' ? `une demi-journée (${filH} h)` : `${darJ} jours`) : 'ouvre les dalles scellées';
        return `<tr><td>${glyphe(r.segs)}</td><td><b>${esc(r.nom)}</b></td><td>${esc(SORTE[r.sorte] || r.sorte)}</td><td>${esc(sens)}</td></tr>`;
      }).join('')}</table>`;
      s += `<p>Un effet = un <b>domaine</b> + un <b>signe</b> + une <b>mesure</b>, dans n’importe quel ordre : 36 assemblages. Un seul par jour ; un seul effet de ${darJ} jours à la fois (le nouveau remplace l’ancien) ; un effet sur un domaine remplace le précédent sur ce même domaine. Tout autre assemblage : un coup mat, rien. Le jeu ne dit jamais si c’était un bon ou un mauvais assemblage : même lueur, même son.</p>`;
      const R = (k, i, d) => (Array.isArray(RG[k]) ? RG[k][i] : d);
      s += h3('Ce que font les signes') + `<table class="t"><tr><th>Domaine</th><th>${esc(nom('aure'))} (en faveur)</th><th>${esc(nom('morne'))} (en défaveur)</th></tr>` + [
        [nom('orne'), `les cultures poussent ${pc(R('recolte', 0, 1.3) - 1)} plus vite`, `${pc(1 - R('recolte', 1, 0.75))} moins vite`],
        [nom('sel'), `une fouille sur deux tirée deux fois`, `une fouille sur deux est maigre`],
        [nom('ure'), `la touche vient vite (attente −${pc(R('peche', 0, 0.6))})`, `la touche vient ${pc(R('peche', 1, 0.35))} plus lentement, une prise sur trois se décroche`],
        [nom('rade'), `l’allure ×${String(R('pas', 0, 1.12)).replace('.', ',')}`, `l’allure ×${String(R('pas', 1, 0.9)).replace('.', ',')}`],
        [nom('ysse'), 'la nuit un peu plus claire ; dans les Terres d’Avant, des pas moins bruyants (×0,8)', 'la nuit plus noire, la brume plus proche ; dans les Terres d’Avant, des pas qui s’entendent plus (×1,25)'],
        [nom('hale'), `la faim ${pc(R('faim', 0, 0.3))} plus lente`, `la faim ${pc(R('faim', 1, 0.35))} plus rapide`],
      ].map(([a, b, c]) => `<tr><th>${esc(a)}</th><td>${esc(b)}</td><td>${esc(c)}</td></tr>`).join('') + '</table>';
      s += `<p>${esc(nom('lone'))} : comme ${esc(nom('aure'))} la nuit, comme ${esc(nom('morne'))} le jour (l’effet change avec l’heure). Le jeu n’apprend jamais le sens d’un signe : seuls les domaines et les mesures s’apprennent, en vivant leur effet.</p>`;
      s += h3('Les trois dalles') + `<table class="t"><tr><th>Dalle</th><th>Où</th><th>Ses runes</th></tr>${Object.entries(PO).map(([id, p]) => {
        const D = DALLE[id] || [id, '', ''];
        const ou = esc(D[1]) + (D[2] && pages.has(D[2]) ? ` — ${lk(D[2])}` : '');
        return `<tr><th>${esc(D[0])}</th><td>${ou}</td><td>${(p.runes || []).map((k) => `${glyphe(RU[k] && RU[k].segs, 20)} ${esc(nom(k))}${k === p.efface ? ' <small>(effacée)</small>' : ''}`).join(' + ')}</td></tr>`;
      }).join('')}</table>`;
      s += `<p>La rune effacée se reconnaît à la moitié de ses traits. Derrière chaque dalle, un coffre (une fois) : pièces anciennes, reliques, gemmes, perles, lingots, minerai d’or, fossiles, argent.</p>`;
      s += h3('Où sont les tablettes') + ul([
        'Trois sont tirées à chaque partie (de sa graine), au pied d’un arbre, d’un rocher ou d’une souche, au sec, hors des chemins, des champs et des murs : une autour de la ferme (35 à 180 m), une aux abords de Valbrume, hors les murs (90 à 260 m de la place), une autour de Clairpré (40 à 200 m).',
        `La quatrième est au fond du cul-de-sac le plus éloigné de l’échelle, dans le labyrinthe des Galeries (le Dessous) ; elle éclaire un peu le couloir. Elle porte toujours ${DES.map((k) => esc(nom(k))).join(', ')} ; les neuf autres runes se partagent les trois tablettes de la vallée.`,
      ]);
    }
    if (s) h += SEC(s, 'Le sens des runes, ce que font les signes, les dalles et leurs runes, la place des tablettes : masqué (secrets).');
    h += `<p>${lk('sys:decouvertes', 'Les découvertes et le wiki du jeu')} · ${lk('sys:savoir', 'La sacoche et le carnet')}</p>`;
    SP('sys:runes', { t: 'Les runes', s: 'Quatre tablettes, trois runes à assembler, des dalles scellées', c: ['runes'], i: 'ᚱ', h }, files(/R15-/));
    // le caveau (fiche secrète d’un lieu) : un lien
    const cv = pages.get('li:r15_caveau');
    if (cv && !/sys%3Arunes|sys:runes/.test(cv.h || '')) cv.h = (cv.h || '') + `<p>${lk('sys:runes', 'Les runes')}</p>`;
  }

  // ================================================================ les découvertes, le wiki du jeu
  {
    let h = `<p class="lead">Le wiki du jeu se remplit en jouant : chaque chose rencontrée ouvre sa page, et une page ne montre que ce que le personnage a constaté. Le reste : « ??? ».</p>`;
    h += h3('Le wiki du personnage') + ul([
      'Dans le menu (<kbd>Tab</kbd>), l’onglet <b>Wiki</b> : ce qu’on a découvert, rangé par familles (Bêtes, Plantes, Arbres, Objets, Livres, Lieux, Habitants, Le reste), avec, pour chacune, le compte « découvertes / en tout » ; une recherche ; à droite (en dessous sur un téléphone), la fiche.',
      'À chaque page nouvelle, une petite plume passe un instant dans le coin de l’écran. Elle ne dit pas laquelle.',
    ]);
    h += h3('Ce qui ouvre une page') + `<table class="t"><tr><th>Famille</th><th>La page s’ouvre quand…</th></tr>${[
      ['Bêtes', 'on la voit de près (16 m, 26 pour les grandes ; 24 à 40 pour celles des Terres d’Avant), devant soi ; le Ver : dès qu’il vous a vu'],
      ['Objets', 'on l’a en main ou dans la sacoche ; ou vu chez un marchand'],
      ['Plantes, arbres', 'on la regarde de près (7 m), on la cueille, on l’abat'],
      ['Lieux', 'on y passe (un lieu-dit : dans son rayon ; un bâtiment : à 12 m) ; dans les Terres d’Avant, chaque région'],
      ['Habitants', 'on le croise à moins de 9 m'],
      ['Livres', 'on l’ouvre'],
    ].map(([a, b]) => `<tr><th>${esc(a)}</th><td>${esc(b)}</td></tr>`).join('')}</table>`;
    h += h3('Ce qui s’apprend, case par case') + ul([
      '<b>Bêtes</b> : <i>quand on la voit</i> (la voir à son heure : le jour, la nuit, ou à toute heure) ; <i>où elle vit</i> (la revoir ailleurs, à une centaine de mètres au moins) ; <i>danger</i> (elle vous a blessé ; ou, si elle n’est pas dangereuse, elle a fui devant vous) ; <i>ce qu’elle laisse</i> (l’abattre, ou la dépecer). La notice se lit quand toutes les cases sont sues.',
      '<b>Objets</b> : <i>sorte</i> (l’avoir) ; <i>prix</i> (le voir chez un marchand) ; <i>quand on le mange</i> (le manger) ; <i>auteur</i> (un livre lu). La description se lit dès qu’on l’a.',
      '<b>Plantes et arbres</b> : <i>où elle pousse</i> (en voir une ailleurs) ; <i>comment on la prend</i> et <i>ce qu’on en tire</i> (la cueillir, l’abattre). La notice à la fin.',
      '<b>Lieux</b> : <i>qui y vit</i>, <i>qui y travaille</i> (y croiser l’habitant, chez lui ou à son ouvrage).',
      '<b>Habitants</b> : <i>métier</i> (lui parler) ; <i>où il vit</i> (le voir chez lui) ; <i>son caractère</i> (lui parler trois jours différents).',
    ]);
    h += h3('Interactif ou exact') + ul([
      '<b>Wiki interactif</b> (Options, section Jeu ; coché d’origine) : chaque case apprise propose <b>trois réponses</b> ; une seule est juste, les deux autres sont prises aux autres fiches (les milieux d’autres bêtes, l’effet d’autres plats…). Les trois restent les mêmes d’une fois à l’autre, et la juste n’est pas toujours à la même place. On clique (ou <kbd>Tab</kbd> puis <kbd>Entrée</kbd>, ou <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> sur un choix).',
      'Juste : la case passe au <b>vert</b>. Fausse : la réponse se barre en <b>rouge</b>, et l’on attend quelques secondes avant de rechoisir parmi les deux autres.',
      'Les parties d’avant (où l’on écrivait ses réponses) : les cases déjà vertes le restent ; les autres reviennent aux trois choix.',
      'Une case jamais constatée reste « ??? » : rien à choisir.',
      '<b>Exact</b> (la case décochée) : les cases apprises montrent directement la bonne information — toujours au fur et à mesure des découvertes.',
      'Sur chaque page, des <b>notes libres</b> (jamais validées).',
    ]);
    h += h3('Ce wiki-ci suit votre partie') + ul([
      'Le jeu garde une copie de ses découvertes dans le navigateur. Ouvert depuis le même endroit que le jeu (même site, même navigateur), ce wiki le voit : à l’ouverture, « Suivre ma partie » ou « Tout voir » (le choix est retenu ; le bouton « Ma partie », en haut, pour changer).',
      'En suivant : seules les fiches découvertes s’ouvrent (les autres : « ??? ») ; dans chaque fiche, seulement ce que vous savez ; vos réponses justes du wiki interactif, en vert, et vos notes ; la recherche et les liens se limitent à ce que vous connaissez.',
      'Les secrets restent sous « révéler les secrets », même en suivant la partie.',
    ]);
    h += `<p>${lk('sys:savoir', 'La sacoche et le carnet')} · ${lk('sys:runes', 'Les runes')}</p>`;
    SP('sys:decouvertes', { t: 'Les découvertes et le wiki du jeu', s: 'Ce qu’on a rencontré, ce qu’on en sait ; interactif ou exact', c: ['corps'], i: '✎', h }, files(/D15-/));
  }

  // ================================================================ le menu du jeu (la sacoche, le carnet, les lettres)
  {
    const p = pages.get('sys:savoir');
    let h = h3('Le menu (Tab)') + `<p>Quatre onglets ; sous l’onglet, de petits boutons pour ses pages. Rien n’a disparu des anciens onglets : tout s’y retrouve.</p><table class="t"><tr><th>Onglet</th><th>Pages</th><th>Ce qu’on y trouve</th></tr>${[
      ['Sacoche', 'Objets · Lettres · Trésors', 'les objets (clic : en main ; glisser sur la barre d’outils), la bourse, les effets en cours ; les lettres qu’on a sur soi et les papiers trouvés ; les merveilles (la page n’apparaît qu’après la première)'],
      ['Atelier', 'Établi · Grimoire · Runes', 'l’établi d’assemblage et les recettes connues ; les recettes d’alchimie et les pages du frère Anselme ; les runes (la page n’apparaît qu’avec la première tablette)'],
      ['Carnet', 'Quêtes · Légendes · Langues', 'quêtes, gens rencontrés, notes, journal ; les légendes entendues et les reliques ; les mots de l’aëlin et du gorrain, les inscriptions'],
      ['Wiki', '—', 'ce qu’on a découvert, et ce qu’on en sait'],
    ].map(([a, b, c]) => `<tr><th>${esc(a)}</th><td>${esc(b)}</td><td>${esc(c)}</td></tr>`).join('')}</table>`;
    h += ul([
      '<kbd>Tab</kbd> ouvre et referme ; <kbd>←</kbd> <kbd>→</kbd> passent d’un onglet à l’autre, <kbd>Maj</kbd>+<kbd>←</kbd> <kbd>→</kbd> d’une page à l’autre ; <kbd>Échap</kbd> referme ; <kbd>1</kbd>-<kbd>9</kbd> posent toujours un objet survolé sur la barre d’outils.',
      'Le bouton ⚙ ouvre les Options (le jeu se met en pause), rangées en quatre sections : Image, Son, Commandes, Jeu.',
      'Le menu se souvient de la dernière page vue dans chaque onglet ; lire une lettre, une note ou une page depuis le menu y ramène en la refermant.',
      'Sur un petit écran, la barre tient sur une ligne et les pages défilent de côté.',
    ]);
    h += h3('Les lettres') + ul([
      'Le courrier arrive dans la boîte aux lettres de la ferme (son drapeau rouge se lève). <kbd>E</kbd> sur la boîte : la liste ; chaque lettre se lit sur place ; « Prendre » la met sur soi, « Laisser » l’y repose, « Tout prendre ». Au clavier : <kbd>1</kbd>-<kbd>9</kbd> lisent la lettre n°, <kbd>E</kbd> referme.',
      'Dans la sacoche (page Lettres) : seulement les lettres qu’on a sur soi, et les papiers trouvés en fouillant.',
      'Une partie d’avant retrouve tout son courrier dans la boîte. La lettre de Marie Lemarié garde ses trois choix, où qu’on la lise.',
    ]);
    h += `<p>${lk('sys:decouvertes', 'Le wiki du jeu')} · ${lk('sys:runes', 'Les runes')}</p>`;
    if (p) { const m = /^<p class="lead">[\s\S]*?<\/p>/.exec(p.h || ''); p.h = m ? m[0] + h + p.h.slice(m[0].length) : h + (p.h || ''); SP('sys:savoir', {}, files(/M15-/)); }
    else SP('sys:savoir', { t: 'La sacoche et le carnet', s: 'Ce que le personnage sait', c: ['corps'], i: '🎒', h }, files(/M15-/));
  }
}

function sections(cats, X) {
  const { pages } = X;
  const at = (id) => cats.findIndex((c) => c.id === id);
  // la section des runes, après les Terres d’Avant (ou le Dessous)
  if (pages.has('sys:runes') && at('runes') < 0) {
    const ids = ['sys:runes', 'li:r15_caveau'].filter((i) => pages.has(i));
    const i = ['terres', 'dessous'].map(at).find((x) => x >= 0);
    cats.splice(i >= 0 ? i + 1 : cats.length, 0, { id: 'runes', t: 'Les runes', d: 'Quatre tablettes de pierre, trois runes à assembler, des dalles scellées.', nouveau: true, groups: [{ t: 'Les runes', ids }] });
  }
  // les découvertes : juste après la sacoche et le carnet
  const c = cats[at('corps')];
  if (c && c.groups) for (const g of c.groups) {
    const a = g.ids.indexOf('sys:decouvertes'), b = g.ids.indexOf('sys:savoir');
    if (a >= 0 && b >= 0) { g.ids.splice(a, 1); g.ids.splice(g.ids.indexOf('sys:savoir') + 1, 0, 'sys:decouvertes'); }
  }
  const nv = cats[at('nouveautes')];
  if (nv && nv.d && !/les runes/.test(nv.d)) nv.d = nv.d.replace(' : ', ' : les runes, le wiki du jeu et le menu simplifié, ');
}

module.exports = { build, sections };
