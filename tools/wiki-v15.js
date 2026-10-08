// Le wiki — LA QUINZIÈME VAGUE : les bêtes des Terres d’Avant (les quinze de V2, et le Ver de V3) ont chacune leur fiche
// « an:… » dans la liste des bêtes, au même format que les autres (milieux, heures, danger, ce qu’elles laissent) ; un
// peu de rangement (les groupes « Autres ») ; et le wiki qui suit la partie du joueur (le client : tools/wiki-build.js,
// CLIENT, « suivre ma partie » — il lit localStorage['prairie.decouvertes'], écrit par le jeu : voir CHAMPS ci-dessous).
// tools/wiki-build.js appelle :
//  - figures(F) avec les figurines des bêtes (F : G, renderRig, add, safe) : les quinze modèles de V2 et le Ver ;
//  - build(X) après la quatorzième vague : les fiches an:v2_… et an:ver, les liens des objets qu’elles laissent ;
//  - sections(cats, X) après celles de la quatorzième vague : les groupes des bêtes, la section des Terres d’Avant.
// Identifiants (contrat de la vague) : an:<clé de V2_ESPECES> (an:v2_garou…), an:ver.
'use strict';

const GROUPE = 'Derrière la Porte';
const ORDRE_GROUPES = ['À la ferme', 'Des bois et des prés', 'En montagne', 'Au bord de l’eau', 'Les gobelins', GROUPE, 'Des autres mondes', 'Créatures', 'Autres'];

// les champs des fiches (ceux des découvertes du jeu, D15) : le client range sous eux les lignes des fiches
// (« dt » : l’étiquette ; « data-f » posé ici l’emporte)
const CHAMPS = {
  an: ['vue', 'jour', 'nuit', 'milieux', 'danger', 'depouille'],
  it: ['vu', 'sorte', 'prix', 'effet'],
  pl: ['vue', 'milieux', 'recolte'],
  li: ['vu', 'dedans'],
  pnj: ['vu', 'metier', 'demeure'],
  lv: ['lu'],
};

// le jour, la nuit : ce qu’on en voit (d’après les heures de V2_ESPECES et les notes de V2)
const JN = {
  v2_garou: ['Ils dorment en tas, au repaire des Charrettes.', 'Ils chassent, de 19 h à 6 h ; ils voient la nuit comme le jour.'],
  v2_charognard: ['Toujours là, à distance.', 'Toujours là ; ils voient moins bien.'],
  v2_pendu: ['Pendus aux arbres morts, ils se balancent sans vent.', 'Pendus aux arbres morts.'],
  v2_ecoutant: ['On ne le voit pas.', 'De 21 h à 5 h, dans les ruines de la Ville Basse.'],
  v2_gargouille: ['Sur son socle ; elle voit loin.', 'Sur son socle ; elle voit moins bien.'],
  v2_stryge: ['On ne les voit pas.', 'De 20 h à 5 h, au-dessus des falaises ; elles voient la nuit mieux que le jour.'],
  v2_basilic: ['Éveillé, de 6 h à 21 h.', 'Il dort.'],
  v2_tarasque: ['Elle dort ; elle se lève à midi, pour une heure.', 'Elle dort.'],
  v2_chimere: ['Couchée devant sa tanière ; une tête dort, à tour de rôle.', 'Couchée devant sa tanière.'],
  v2_vouivre: ['Elle dort près de la Pierre plate.', 'Elle vole, de 19 h à 4 h ; à l’aube, elle se baigne.'],
  v2_noye: ['On ne les voit pas.', 'Dans l’Étang, de 20 h à 5 h.'],
  v2_korrigan: ['On ne les voit pas.', 'Ils dansent de 22 h à 4 h, jamais le jour des morts.'],
  v2_cerf: ['De 7 h à 18 h, dans le Bois Mort.', 'On ne le voit pas.'],
  v2_chien: ['Au Seuil, près du premier feu.', 'Au Seuil, près du premier feu.'],
  v2_sans_visage: ['Ils paissent sur les paliers.', 'Couchés.'],
};
// ce qu’elles laissent, quand ce n’est pas une table de butin : [objets, secret ?]
const LAISSE = {
  v2_basilic: [['v2_oeil_basilic', 'v2_crete_basilic'], false],
  v2_tarasque: [['v2_ecaille_tarasque', 'v2_ruban_bleu'], false],
  v2_chimere: [['v2_criniere', 'v2_corne_chimere', 'v2_collier_armes'], false],
  v2_vouivre: [['v2_escarboucle', 'v2_ecaille_vouivre'], true],
  v2_noye: [['v2_alliance'], true],
  v2_korrigan: [['v2_sou_korrigan'], true],
  v2_cerf: [['v2_bois_mains'], false],
  v2_chien: [['v2_collier_chien'], true],
};
// qui en parle dans la vallée (V2_RUMEURS) → la bête
const RUMEUR = { chasseur: 'v2_garou', guerisseuse: 'v2_basilic', aubergiste: 'v2_korrigan' };
const DANGER = ['inoffensive', 'se défend', 'dangereuse', 'très dangereuse'];

// ================================================================ les figurines
function figures(F) {
  const { G, renderRig, add, safe } = F;
  const ordre = safe('V2_ORDRE', () => G.get('V2_ORDRE'), null) || [];
  if (G.has && G.has('V2_RIGS')) for (const k of ordre) {
    const cv = safe('bête ' + k, () => renderRig(`(() => { const r = V2_RIGS[${JSON.stringify(k)}](0); try { V2_POSES[${JSON.stringify(k)}](r, { move: 0, phase: 0, nuit: 1, regard: 0 }, 0); } catch (e) {} return r; })()`, 128), null);
    if (cv) add('an:' + k, cv);
  }
  if (G.has && G.has('v3Rig') && G.has('v3Emettre')) {
    const cv = safe('le Ver', () => G.run(`(() => { const R = v3Rig(); try { v3Poser(R, { mode: 'pose', t: 0, appui: 1 }); } catch (e) {} const D = { rig: R, x: 0, y: 0, z: 0, yaw: 0, pitch: 0, roll: 0, s: 1, dist: 0 }; const boxes = ICON3D.capture((cap) => { try { v3Emettre(cap, D, 0); } catch (e) { const M = new Float32Array(12); m34Root(M, 0, 0, 0, 0, 1); R.emit(cap, M, 0); } }); return boxes.length ? ICON3D.render(boxes, 160) : null; })()`), null);
    if (cv) add('an:ver', cv);
  }
}

// ================================================================ les fiches
function build(X) {
  const { DB, T, P, SEC, esc, lk, IL, FILL, npcLink, pages, nfmt, planBtn, ITEMS, FIG } = X;
  const log = (m) => (DB.log || (DB.log = [])).push('wiki-v15.js : ' + m);
  let W14 = {};
  try { W14 = require('./wiki-v14.js'); } catch (e) { log(e.message); }
  const BETES = W14.BETES || { especes: [], ordre: [], secret: [] }, VER = W14.VER || {};
  const ESP = T('V2_ESPECES', null), CARNET = T('V2_CARNET', {}), LOOT = T('LOOT', {}), RUM = T('V2_RUMEURS', {});
  const ORD = T('V2_ORDRE', null) || (ESP ? Object.keys(ESP) : []);
  const V = (DB.world && DB.world.v14) || {};
  const plan = (t) => (V.zone && V.zone.img && planBtn ? planBtn('terres', '', t) : '');
  const md = (t) => String(t ?? '').split(/(\[\[[^\]]+\]\])/).map((s, i) => {
    if (i % 2) { const [id, tx] = s.slice(2, -2).split('|'); return lk(id, tx ?? id); }
    return esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  }).join('');
  const row = (f, k, v) => (v ? `<dt data-f="${f}">${esc(k)}</dt><dd data-f="${f}">${v}</dd>` : '');
  const cap = (s) => String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1);
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const items = (ids) => ids.filter((i) => ITEMS[i]).map((i) => IL(i)).join(', ');
  const laissePar = {};   // objet → bêtes (pour les fiches des objets)
  const fig = (id) => (FIG && FIG[id] ? FIG[id].full : null);

  if (ESP) for (const k of ORD) {
    const e = ESP[k]; if (!e) continue;
    const i = (BETES.ordre || []).indexOf(k), R = i >= 0 ? BETES.especes[i] : null;
    const titre = e.unique || k === 'v2_ecoutant' ? e.titre : cap(e.nom);
    const danger = !e.coup ? 0 : e.nature !== 'hostile' ? 1 : (e.coup.dmg >= 20 || e.unique) ? 3 : 2;
    const sous = (e.nature === 'hostile' ? 'Bête dangereuse' : e.nature === 'aide' ? 'Bête' : 'Bête paisible') + ' des Terres d’Avant' + (e.unique ? ', unique' : '');
    const fg = fig('an:' + k);
    const p = P('an:' + k, { t: titre, s: sous, c: ['betes', 'terres'], i: fg ? 'fg:' + fg.join(',') : '☠', x: 0, fig: fg, g: GROUPE });
    // la ligne de la notice : ce qu’on en écrit d’abord (le carnet du personnage)
    const C = CARNET[k] || [];
    let h = C[0] ? `<p class="lead">${esc(C[0])}</p>` : '';
    const moeurs = [e.nature === 'hostile' ? 'hostile' : e.nature === 'aide' ? 'n’attaque pas' : 'paisible', e.unique ? 'unique' : '', e.vol ? 'vole' : '', e.sens && e.sens.aveugle ? 'aveugle' : '', e.sens && e.sens.sourd ? 'sourde' : '', e.pierre ? 'de pierre' : '', e.eau ? 'vit dans l’eau' : '', e.conduite === 'meute' ? 'chasse en meute' : '', e.conduite === 'troupeau' ? 'vit en troupeau' : ''].filter(Boolean);
    h += '<dl class="kv">';
    h += row('milieux', 'Où', R ? md(R[1]) : '');
    h += row('milieux', 'Combien', e.unique ? 'une seule' : e.nb ? (e.nb[0] === e.nb[1] ? `par ${e.nb[0]}` : `par ${e.nb[0]} à ${e.nb[1]}`) : '');
    h += row('jour', 'Le jour', esc((JN[k] || [])[0] || ''));
    h += row('nuit', 'La nuit', esc((JN[k] || [])[1] || ''));
    h += row('vue', 'Mœurs', esc(moeurs.join(', ')));
    h += row('vue', 'Ce qu’elle voit, ce qu’elle entend', R ? md(R[3]) : '');
    h += row('danger', 'Danger', esc(DANGER[danger]));
    h += row('danger', 'Ce qu’elle fait', R ? md(R[4]) : '');
    if (e.coup && e.coup.dmg) h += row('danger', 'Blessures', `jusqu’à ${e.coup.dmg} points par coup${e.coup.poison ? ', du venin' : ''}${e.coup.saigne ? ', des plaies qui saignent' : ''}`);
    if (e.course) h += row('danger', 'Course', `${nfmt(e.course)} m/s${e.marche ? ` (au pas ${nfmt(e.marche)} m/s)` : ''}`);
    h += row('danger', 'Vigueur', e.pv ? `${e.pv} points de vie` : '');
    // ce qu’elle laisse
    let laisse = '';
    const L = e.butin && LOOT[e.butin];
    if (L && L.items) {
      laisse = L.items.map(([id, a, b]) => { if (id === 'argent') return `des pièces <small>${a}–${b}</small>`; (laissePar[id] || (laissePar[id] = [])).push([k, false]); return IL(id) + ` <small>${a === b ? a : a + '–' + b}</small>`; }).join(', ');
    } else if (LAISSE[k]) {
      const [ids, sec] = LAISSE[k];
      for (const id of ids) (laissePar[id] || (laissePar[id] = [])).push([k, sec]);
      laisse = sec ? SEC(items(ids), false) + '<span class="sec-note">(secret)</span>' : items(ids);
    }
    h += row('depouille', 'Ce qu’elle laisse', laisse || (e.nature === 'hostile' ? '' : 'rien'));
    h += '</dl>';
    // le reste de la fiche : ce qu’on finit par comprendre, ce qu’on en dit, ce qui se cache
    if (C.length > 1) h += `<h3>Ce qu’on finit par en comprendre</h3><ul class="qs">${C.slice(1).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
    const ru = Object.keys(RUM).filter((g) => RUMEUR[g] === k && pages.has('pnj:' + g));
    if (ru.length) h += `<h3>Ce qu’on en dit dans la vallée</h3><ul class="qs">${ru.map((g) => [].concat(RUM[g]).map((t) => `<li>${FILL(t, g)} <small>— ${npcLink(g)}</small></li>`).join('')).join('')}</ul>`;
    const noms = [e.nom, e.nomPl, e.titre.replace(/^(le|la|les|l’) /i, '')].map(norm).filter(Boolean);
    const sec = (BETES.secret || []).filter((s) => { const m = /^\*\*([^*]+)\*\*/.exec(s); return m && noms.some((n) => norm(m[1]).includes(n)); });
    if (sec.length) h += SEC(`<h3>Ce qui se cache</h3><ul>${sec.map((s) => `<li>${md(s)}</li>`).join('')}</ul>`, 'Comment la passer, ce qui la tue, ce qu’elle garde : masqué (secrets).');
    h += `<p>${lk('sys:betes-zone', 'Les bêtes des Terres d’Avant')} · ${lk('sys:discretion', 'La discrétion')} ${plan('Le plan des Terres d’Avant')}</p>`;
    p.h = h;
  }

  // ---- le Ver
  const V3 = T('V3', null);
  if (V3) {
    const H = V3.heures || {}, hh = (x) => { const m = Math.round((x % 1) * 60); return `${Math.floor(x)} h${m ? ' ' + String(m).padStart(2, '0') : ''}`; };
    const fg = fig('an:ver');
    const p = P('an:ver', { t: 'Le Ver', s: 'Le dragon des Terres d’Avant', c: ['betes', 'terres'], i: fg ? 'fg:' + fg.join(',') : '🐉', x: 0, fig: fg, g: GROUPE });
    let h = `<p class="lead">${md(VER.lead || 'Un dragon noir, très vieux, qui veille sur les Terres d’Avant.')}</p><dl class="kv">`;
    h += row('milieux', 'Où', md('Le ciel des Terres d’Avant ; son aire, au sommet du Pic. Il ne passe jamais la Porte.'));
    h += row('jour', 'Le jour', esc(H.envol ? `Il fait ses rondes, de ${hh(H.envol)} à ${hh(H.retour)}, et se pose sur ses perchoirs ; il va souvent voir là où vous êtes.` : 'Il fait ses rondes.'));
    h += row('nuit', 'La nuit', esc(H.coucher ? `Il dort dans son aire, de ${hh(H.coucher)} à ${hh(H.reveil)}, la tête tournée vers la Porte.` : 'Il dort dans son aire.'));
    h += row('vue', 'Allure', 'une wyverne noire : deux pattes, deux grandes ailes, une cinquantaine de mètres d’envergure ; un collier de fer au cou, les yeux comme des braises');
    h += row('vue', 'Ce qu’il voit', `ce qui bouge à découvert, de haut : jusqu’à ${V3.vueJour || 190} m le jour, ${V3.vueNuit || 70} m la nuit, ${V3.vueLanterne || 250} m si l’on porte une lanterne ; jamais sous un toit ni sous terre`);
    h += row('danger', 'Danger', esc(DANGER[3]));
    h += row('danger', 'Son feu', `un jet de ${V3.feuPortee || 40} m, ${V3.feuDegats || 48} points par seconde au cœur ; ${V3.passesMax || 3} passes au plus ; il brûle l’herbe des Terres d’Avant`);
    h += row('danger', 'Vigueur', SEC(`${nfmt(V3.pv || 1500)} points, et seulement sous l’aile gauche ; il guérit en ${V3.guerison || 2} jours`, false) + '<span class="sec-note">(secret)</span>');
    const its = ['v3_ecaille', 'v3_dent', 'v3_coeur'].filter((i) => ITEMS[i]);
    for (const id of its) (laissePar[id] || (laissePar[id] = [])).push(['ver', id !== 'v3_ecaille']);
    h += row('depouille', 'Ce qu’il laisse', (ITEMS.v3_ecaille ? IL('v3_ecaille') + ' <small>(tombées sur ses perchoirs)</small>' : '') + SEC(items(['v3_dent', 'v3_coeur']), false));
    h += '</dl>';
    if (VER.entendre) h += `<h3>On l’entend, on le voit</h3><p>${md(VER.entendre)}</p>`;
    if (VER.echapper) h += `<h3>Lui échapper</h3><p>${md(VER.echapper)}</p>`;
    h += `<p>${lk('sys:ver', 'Le Ver : ses rondes, son feu, son aire')} · ${lk('sys:discretion', 'La discrétion')} ${plan('Le plan des Terres d’Avant')}</p>`;
    p.h = h;
  }

  // ---- les objets qu’elles laissent : d’où ils viennent
  for (const [id, L] of Object.entries(laissePar)) {
    const p = pages.get('it:' + id); if (!p) continue;
    const pub = [...new Set(L.filter(([, s]) => !s).map(([k]) => k))], sec = [...new Set(L.filter(([, s]) => s).map(([k]) => k))].filter((k) => !pub.includes(k));
    const one = (k) => lk(k === 'ver' ? 'an:ver' : 'an:' + k);
    let h = '';
    if (pub.length) h += `<p>Sur : ${pub.map(one).join(', ')}</p>`;
    if (sec.length) h += SEC(`<p>Sur : ${sec.map(one).join(', ')}</p>`, false);
    p.h = (p.h || '') + h;
  }

  // ---- un peu de rangement : les bêtes sans groupe, les répliques des habitants
  const G = { farmduck: 'À la ferme', farmrabbit: 'À la ferme', gobelin: 'Les gobelins', gob_aieule: 'Les gobelins', bete: 'Créatures' };
  for (const [k, g] of Object.entries(G)) { const p = pages.get('an:' + k); if (p && (!p.g || p.g === 'Autres')) p.g = g; }
  const rep = pages.get('txt:repliques'); if (rep && !rep.g) rep.g = 'Ce qu’ils disent';
}

// ================================================================ les sections
function sections(cats, X) {
  const { pages } = X;
  const at = (id) => cats.findIndex((c) => c.id === id);
  const ids = ['an:ver', ...(require('./wiki-v14.js').BETES || { ordre: [] }).ordre.map((k) => 'an:' + k)].filter((id) => pages.has(id));
  // les bêtes : les groupes dans un ordre qui se lit (la ferme, les bois, la montagne, l’eau, puis l’étrange)
  const b = cats[at('betes')];
  if (b && b.groups) {
    const rang = (t) => { const i = ORDRE_GROUPES.indexOf(t); return i < 0 ? ORDRE_GROUPES.length - 2 : i; };
    b.groups.sort((x, y) => rang(x.t) - rang(y.t));
    const g = b.groups.find((q) => q.t === GROUPE);
    if (g) g.ids = ids.filter((id) => g.ids.includes(id));
    if (b.d && !/Terres d’Avant/.test(b.d)) b.d = b.d.replace(/\.$/, '') + ' ; et celles de derrière la Porte, dans les Terres d’Avant.';
  }
  // les Terres d’Avant : les fiches des bêtes sous « Les bêtes », celle du Ver sous « Le Ver »
  const t = cats[at('terres')];
  if (t && t.groups) {
    const gb = t.groups.find((q) => q.t === 'Les bêtes'), gv = t.groups.find((q) => q.t === 'Le Ver');
    if (gb) gb.ids = [...gb.ids.filter((i) => !i.startsWith('an:')), ...ids.filter((i) => i !== 'an:ver')];
    if (gv && pages.has('an:ver') && !gv.ids.includes('an:ver')) gv.ids.splice(1, 0, 'an:ver');
  }
  const h = cats[at('habitants')];
  if (h && h.groups) { const i = h.groups.findIndex((q) => q.t === 'Ce qu’ils disent'); if (i >= 0) h.groups.push(h.groups.splice(i, 1)[0]); }
}

module.exports = { figures, build, sections, CHAMPS, GROUPE };
