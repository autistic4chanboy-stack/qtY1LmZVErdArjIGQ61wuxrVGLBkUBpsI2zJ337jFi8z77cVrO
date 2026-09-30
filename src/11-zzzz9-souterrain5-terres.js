// ============================================================================
//  LE DESSOUS — ceux d'en bas (agent C3)
//  Au Hameau d'En-Bas vivent dix pâles, dans des cabanes de pierre sèche en
//  forme de ruche, à la lueur des pierres luisantes : les enfants des onze
//  qu'on mura en 1631 dans la cave de la porte sud. Ils n'ont pas de noms,
//  des nombres. Ils ont gardé un peu de la langue d'en haut, usée jusqu'à
//  l'os : le parler d'en bas. On l'entend, on le note ; on ne le traduit pas.
//  - la flamme leur brûle les yeux (ils crient, se cachent) ; la pierre
//    luisante, non. Courir, tirer : ils se sauvent ;
//  - on n'entre pas chez eux : on frappe trois coups à la pierre d'appel,
//    sans flamme, et, quand le guetteur demande, on ne dit pas son nom ;
//  - ensuite : ils parlent (« Écouter », « Dire un mot… » : chacun réagit aux
//    mots qu'on a entendus), troquent contre du pain ou du sel (jamais contre
//    des sous), gardent une peau pliée où sont écrits les onze, et une cabane
//    vide, celle du onzième ; le guetteur ramène au pied du puits ;
//  - le pain posé sur la pierre au pain se rompt en onze ;
//  - le jeune va et vient, une pierre verte à la main, entre le hameau et la
//    Chambre des Gouttes, par la longue galerie ;
//  - le carnet (onglet Langues) garde chaque mot entendu et les circonstances,
//    sans traduction ; les dalles d'encoches se lisent : on y reconnaît les
//    mots qu'on a déjà entendus.
//  État : farm.s.souterrain.t (admis, refus, mots, noms, dons, liste, pest,
//  aiguille, mort, profane…). API : soutTerres, soutParler.
// ============================================================================

// ---------------------------------------------------------------- les objets
defItem('baton_encoches', 'Bâton à encoches', 'quete', 0, ['racine_long', '#8a7458'], { desc: 'Un bâton de racine poli par les mains, couvert d’encoches et de nœuds. Clic : le lire du bout des doigts, sous la terre.' });
defItem('aiguille_lui', 'Aiguille dans une coquille', 'quete', 0, ['boussole', '#c8c0b0'], { desc: 'Une aiguille de fer frottée à la pierre noire, posée sur un fil d’eau dans une coquille. Clic : la regarder. Elle ne montre pas le nord.' });
defItem('carnet_onz', 'Carnet gonflé d’eau', 'quete', 0, ['livre', '#5a4a3a'], { desc: 'Un carnet de géomètre, relié de toile cirée, gonflé d’humidité. Clic : le lire.' });

// ---------------------------------------------------------------- le parler d'en bas : mots, circonstances (jamais de sens)
const SOUT_LEX = ['lum', 'tsi', 'zyeu', 'lui', 'bô', 'nenn', 'ouï', 'ki', 'nom', 'san', 'd’sû', 'd’sou', 'va', 'vyin', 'pan', 'sèl', 'sou', 'manj', 'frè',
  'mo', 'dôr', 'gout', 'hoûm', 'mûr', 'grî', 'koû', 'pèst', 'tojor', 'un', 'deû', 'trè', 'katr', 'sin', 'si', 'sè', 'ui', 'neu', 'di', 'onz'];
// les nombres : le mot → celui qui le porte
const SOUT_NUM = { un: 'un', 'deû': 'deu', 'trè': 'tre', katr: 'katr', sin: 'sin', si: 'si', 'sè': 'se', ui: 'ui', neu: 'neu', di: 'di', onz: 'onz' };
const SOUT_CTX = {
  feu: 'crié, les mains sur les yeux, quand votre flamme brûlait',
  feu_vieux: 'dit par le vieux, qui détournait la tête de votre flamme',
  lui: 'murmuré devant la pierre verte que vous teniez',
  garde: 'demandé par celui qui gardait l’entrée, ses doigts sur votre visage',
  refus: 'craché par le guetteur, avant qu’il vous tourne le dos',
  admis: 'dit par le guetteur, quand vous vous êtes tu',
  admis_frere: 'répété par le guetteur, après vous',
  onz_toi: 'dit en vous regardant, ou la main sur votre épaule',
  vyin: 'dit en vous faisant signe d’approcher',
  pan_main: 'dit la main ouverte, les yeux sur votre sac',
  pan_don: 'murmuré, le pain serré contre la poitrine',
  sou: 'dit en repoussant votre pièce du bout des doigts',
  sel: 'dit avec un sourire, un grain de sel sur la langue',
  soi: 'dit en se touchant la poitrine',
  autre: 'dit en montrant quelqu’un d’autre, plus loin',
  ancien: 'répété par le vieux, qui comptait sur ses doigts',
  liste: 'dit par le vieux, la peau pliée sur les genoux',
  pest: 'demandé par le vieux, sans vous regarder',
  pest_ouï: 'dit par le vieux, qui hochait la tête',
  pest_nenn: 'dit par le vieux, qui vous mettait quelque chose dans la main',
  mo: 'dit par le vieux, qui montrait le fond de la longue galerie',
  dsu: 'dit par le vieux, qui montrait la voûte',
  mur: 'dit par le vieux, la main à plat sur les encoches',
  gri: 'dit par le vieux, en frappant trois fois la pierre',
  houm: 'chuchoté, un doigt sur la bouche',
  enfant_houm: 'crié par l’enfant, qui s’est caché aussitôt',
  enfant_lum: 'demandé par l’enfant, qui touchait votre lanterne éteinte',
  enfant_lui: 'dit par l’enfant, qui vous tendait quelque chose de vert',
  gout: 'dit par le pêcheur, les mains dans l’eau tiède',
  manj: 'dit en vous tendant quelque chose à manger',
  dor: 'chanté tout bas, comme une berceuse',
  mere: 'soufflé par une femme, près d’un enfant endormi',
  va: 'dit sans s’arrêter, un panier sur le dos',
  entre: 'entendu entre eux, de loin, dans le noir',
  guide: 'dit par le guetteur, qui vous prenait la main',
  tabou: 'sifflé, avec un geste de recul',
  nenn: 'dit en secouant la tête',
  tsi: 'soufflé, tout près, un doigt sur vos lèvres',
  jeune: 'dit par le jeune, qui s’était arrêté dans la galerie',
  profane: 'dit par l’enfant, qui vous reniflait les mains',
  echo: 'répété, la tête penchée',
};
// les dalles d'encoches du hameau : [clé, texte]
const SOUT_ENCOCHES = [
  ['e_onz', 'onz mûr , pan nenn , d’sou'],
  ['e_lum', 'lum mo , lui bô'],
  ['e_mo', 'mo dôr gout'],
  ['e_houm', 'hoûm ouï , tsi'],
  ['e_dsu', 'd’sû pèst , d’sû mo'],
  ['e_tojor', 'tojor onz'],
];
const SOUT_ENC_BY = {};
for (const [k, t] of SOUT_ENCOCHES) SOUT_ENC_BY[k] = t;

const soutParler = {
  S() { return soutTerres.S(); },
  norm(m) { return String(m || '').toLowerCase().replace(/'/g, '’').replace(/^[«"“(]+|[»"”).,;:!?…]+$/g, ''); },
  mots(texte) { return String(texte || '').split(/[\s,;:!?.…«»—()"]+/).map((m) => this.norm(m)).filter((m) => SOUT_LEX.includes(m)); },
  // un mot entendu : on garde le nombre de fois, et les circonstances (trois au plus)
  entendre(texte, ctx) {
    if (!farm.s) return 0;
    const M = this.S().mots;
    let neufs = 0;
    for (const m of this.mots(texte)) {
      const e = M[m] || (M[m] = { n: 0, c: [], j: farm.s.day, o: Object.keys(M).length });
      if (!e.n) neufs++;
      e.n++;
      if (ctx && !e.c.includes(ctx) && e.c.length < 3) e.c.push(ctx);
    }
    return neufs;
  },
  connu(m) { const e = this.S().mots[this.norm(m)]; return !!(e && e.n); },
  entendus() { const M = this.S().mots; return Object.keys(M).filter((m) => M[m].n).sort((a, b) => M[a].o - M[b].o); },

  // ---------------------------------------------------------------- l'écriture : des encoches (lettre → un paquet de traits, parfois barré)
  canvas(texte, o = {}) {
    const G = o.size || 22, toks = String(texte).split(/\s+/).filter(Boolean);
    const lw = (w) => { let n = 0; for (const ch of w.replace(/’/g, '')) n += (1 + (ch.charCodeAt(0) % 4)) * G * 0.2 + G * 0.3; return n; };
    const W = Math.min(560, Math.max(80, toks.reduce((a, t) => a + (t === ',' ? G * 0.6 : lw(t) + G * 0.7), G)));
    let lines = 1, x = G * 0.5;
    for (const t of toks) { const L = t === ',' ? G * 0.6 : lw(t) + G * 0.7; if (x + L > W - G * 0.3) { lines++; x = G * 0.5; } x += L; }
    const cv = document.createElement('canvas'); cv.width = W; cv.height = lines * G * 1.7 + G * 0.6;
    const c = cv.getContext('2d');
    c.fillStyle = o.bg || '#c9c2b2'; c.fillRect(0, 0, cv.width, cv.height);
    c.strokeStyle = o.ink || '#2e2a24'; c.fillStyle = o.ink || '#2e2a24'; c.lineWidth = Math.max(1.5, G / 10); c.lineCap = 'round';
    x = G * 0.5; let y = G * 0.4;
    for (const t of toks) {
      const L = t === ',' ? G * 0.6 : lw(t) + G * 0.7;
      if (x + L > W - G * 0.3) { x = G * 0.5; y += G * 1.7; }
      if (t === ',') { c.beginPath(); c.arc(x + G * 0.2, y + G * 0.6, G * 0.07 + 1, 0, TAU); c.fill(); x += L; continue; }
      for (const ch of t.replace(/’/g, '')) {
        const k = ch.charCodeAt(0), n = 1 + (k % 4), x0 = x;
        for (let i = 0; i < n; i++) { c.beginPath(); c.moveTo(x + i * G * 0.2, y + ((k >> 3) % 2) * G * 0.12); c.lineTo(x + i * G * 0.2, y + G * 1.1); c.stroke(); }
        if (k % 3 === 0) { c.beginPath(); c.moveTo(x0 - G * 0.08, y + G * 0.75); c.lineTo(x0 + (n - 1) * G * 0.2 + G * 0.08, y + G * 0.35); c.stroke(); }
        x += n * G * 0.2 + G * 0.3;
      }
      x += G * 0.7;
    }
    return cv;
  },
  // lire une dalle : l'écriture, et dessous ce qu'on reconnaît (le mot tel qu'on l'a entendu ; pas son sens)
  lire(id, deCarnet) {
    const t = SOUT_ENC_BY[id];
    if (!t || !farm.s) return;
    const V = this.S().ins;
    if (!V[id]) V[id] = farm.s.day;
    if (typeof langues !== 'undefined' && langues.style) langues.style();
    let img = '';
    try { img = this.canvas(t, { size: 26 }).toDataURL(); } catch (e) { img = ''; }
    const toks = t.split(/\s+/).filter(Boolean);
    const gloss = toks.map((w) => {
      if (w === ',') return '<span class="sep">·</span>';
      let g = '';
      try { g = this.canvas(w, { size: 12, bg: '#e8dfc8', ink: '#4a3a28' }).toDataURL(); } catch (e) { g = ''; }
      const ok = this.connu(w);
      return `<span class="w ${ok ? 'ok' : 'inc'}"><img src="${g}" alt=""><span>${ok ? '« ' + esc(w) + ' »' : '· · ·'}</span></span>`;
    }).join('');
    const mots = toks.filter((w) => w !== ','), n = mots.filter((w) => this.connu(w)).length;
    const note = !n ? 'Des encoches, par paquets, certaines barrées. Vous n’y reconnaissez rien.'
      : n === mots.length ? 'Vous reconnaissez chaque paquet d’encoches : ce sont des mots que vous avez entendus. Vous ne savez pas pour autant ce qu’ils disent ensemble.'
        : `Vous reconnaissez ${n > 1 ? n + ' mots' : 'un mot'} que vous avez entendu${n > 1 ? 's' : ''}. Le reste vous échappe.`;
    ui.open('#reader', `<h3>Une dalle d’encoches</h3><div class="ins-ecrit"><img src="${img}" alt=""></div><div class="ins-gloss">${gloss}</div><div class="ins-note">${esc(note)}</div><div class="sign">${esc(deCarnet ? 'Relevée dans votre carnet, au Hameau d’En-Bas.' : 'Taillée dans la calcite, au couteau de pierre.')}</div><button class="close">Refermer</button>`);
    $('#reader .close').onclick = () => ui.close();
  },
  // ---------------------------------------------------------------- l'onglet « Langues » de la sacoche
  ongletHTML() {
    const M = this.S().mots, L = this.entendus(), V = this.S().ins, ids = Object.keys(V).filter((k) => SOUT_ENC_BY[k]);
    if (!L.length && !ids.length) return '';
    let h = `<h4>Le parler d’en bas <span class="lg-n">— ${esc(L.length > 1 ? L.length + ' mots entendus' : L.length ? 'un mot entendu' : 'aucun mot entendu')} · des encoches</span></h4>`;
    h += '<p class="hint">Ce que disent les pâles d’en bas, noté comme vous l’avez entendu, avec ce qui se passait à ce moment-là. Personne ne vous en a donné la clé.</p><div class="lg-mots">';
    h += L.map((m) => `<span class="lg-mot"><span><i>${esc(m)}</i> — ${esc(M[m].c.map((k) => SOUT_CTX[k] || k).join(' ; ') || 'entendu')}${M[m].n > 2 ? ` <span class="lg-n">(${M[m].n} fois)</span>` : ''}</span></span>`).join('');
    h += '</div>';
    if (ids.length) {
      h += `<h4>Dalles d’encoches relevées <span class="lg-n">— ${ids.length}</span></h4>`;
      h += ids.sort((a, b) => V[a] - V[b]).map((k) => { const mots = SOUT_ENC_BY[k].split(/\s+/).filter((w) => w !== ','), n = mots.filter((w) => this.connu(w)).length; return `<button class="note" data-sout-ins="${esc(k)}">Encoches — le Hameau d’En-Bas <span>— ${esc(n ? `${n} mot${n > 1 ? 's' : ''} reconnu${n > 1 ? 's' : ''} sur ${mots.length}` : 'illisible')}</span></button>`; }).join('');
    }
    return h;
  },
  lierOnglet() { $$('#satchel [data-sout-ins]').forEach((b) => (b.onclick = () => this.lire(b.dataset.soutIns, true))); },
};
if (typeof langues !== 'undefined') {
  const _oh = langues.ongletHTML.bind(langues), _lo = langues.lierOnglet.bind(langues);
  langues.ongletHTML = function () { let h = _oh(); try { if (farm.s) h += soutParler.ongletHTML(); } catch (e) { console.error(e); } return h; };
  langues.lierOnglet = function () { _lo(); try { soutParler.lierOnglet(); } catch (e) { console.error(e); } };
}

// ---------------------------------------------------------------- les gens : nombre, allure, place
const SOUT_GENS = [
  { k: 'un', nom: 'Un', dit: 'le vieux', lieu: 'encoches', poste: 'assis', voix: 0.7, look: { skin: '#dcd5cb', hair: '#ecebe6', hairStyle: 'chauve', beard: 'longue', top: '#55514a', bottom: '#47443e', shoe: '#cfc7bc', height: 0.92, build: 'mince', old: true } },
  { k: 'deu', nom: 'Deû', dit: 'la vieille', lieu: 'planches', poste: 'travail', voix: 1.15, look: { skin: '#e0d9d0', hair: '#e8e6e2', hairStyle: 'chignon', dress: true, top: '#5a564e', bottom: '#4e4a44', shoe: '#d2cabe', height: 0.9, build: 'mince', old: true, fem: true } },
  { k: 'tre', nom: 'Trè', dit: 'une femme', lieu: 'pain', poste: 'debout', voix: 1.2, look: { skin: '#e6e0d8', hair: '#d8d2c4', hairStyle: 'long', top: '#625d54', bottom: '#4c4842', shoe: '#d6cfc4', height: 0.95, build: 'mince', fem: true, bandeau: true } },
  { k: 'katr', nom: 'Katr', dit: 'le pêcheur', lieu: 'rive', poste: 'peche', voix: 0.85, look: { skin: '#e2dcd2', hair: '#cfc9bb', hairStyle: 'court', beard: 'courte', top: '#4e4a44', bottom: '#43403a', shoe: '#d0c8bc', height: 0.97, build: 'normal' } },
  { k: 'sin', nom: 'Sin', dit: 'une femme', lieu: 'hutte', poste: 'assis', voix: 1.25, look: { skin: '#e8e2da', hair: '#e0dacb', hairStyle: 'queue', top: '#58544c', bottom: '#4c4842', shoe: '#d8d0c6', height: 0.94, build: 'mince', fem: true, hood: true, hatCol: '#4e4a44' } },
  { k: 'si', nom: 'Si', dit: 'le porteur', lieu: 'tour', poste: 'porte', voix: 0.9, look: { skin: '#e2dcd4', hair: '#d4cec2', hairStyle: 'court', top: '#534e47', bottom: '#47433d', shoe: '#cfc8bc', height: 0.98, build: 'normal', bandeau: true } },
  { k: 'se', nom: 'Sè', dit: 'le guetteur', lieu: 'appel', poste: 'guet', voix: 0.8, look: { skin: '#dcd6ce', hair: '#c8c2b6', hairStyle: 'chauve', top: '#4a4640', bottom: '#403c37', shoe: '#ccc4b8', height: 1.0, build: 'mince', bandeau: true } },
  { k: 'ui', nom: 'Ui', dit: 'la fileuse', lieu: 'hutte', poste: 'travail', voix: 1.1, look: { skin: '#e4ded6', hair: '#dcd6c8', hairStyle: 'long', dress: true, top: '#5e594f', bottom: '#524d46', shoe: '#d4ccc0', height: 0.93, build: 'normal', fem: true } },
  { k: 'neu', nom: 'Neu', dit: 'l’enfant', lieu: 'place', poste: 'jeu', voix: 1.6, enfant: true, look: { skin: '#eae5de', hair: '#f0eee8', hairStyle: 'court', top: '#625d54', bottom: '#534e47', shoe: '#dcd6cc', height: 0.66, build: 'mince' } },
  { k: 'di', nom: 'Di', dit: 'le jeune', lieu: 'route', poste: 'rode', voix: 1.0, look: { skin: '#e6e0d8', hair: '#dedad0', hairStyle: 'court', top: '#58544c', bottom: '#4a4640', shoe: '#d4ccc0', height: 0.96, build: 'mince', hood: true, hatCol: '#48443e' } },
];
const SOUT_GENS_BY = {};
for (const g of SOUT_GENS) SOUT_GENS_BY[g.k] = g;
// ce que chacun dit quand on l'écoute : [phrase, circonstance, condition ?]
const SOUT_DIRE = {
  un: [['Onz. D’sou, tojor onz.', 'ancien'], ['Un, deû, trè, katr, sin, si, sè, ui, neu, di… onz.', 'ancien'], ['Mûr. Tojor mûr.', 'mur'], ['Tsi.', 'tsi']],
  deu: [['Dôr, dôr… dôr, gout…', 'dor'], ['Manj ?', 'manj'], ['Bô, Onz.', 'onz_toi']],
  tre: [['Pan ?', 'pan_main'], ['Sèl ?', 'pan_main'], ['Onz. Pan ?', 'pan_main']],
  katr: [['Gout bô.', 'gout'], ['Gout… tsi.', 'gout'], ['Manj.', 'manj']],
  sin: [['Tsi. Neu dôr.', 'mere'], ['Neu ! Vyin.', 'mere'], ['Onz.', 'onz_toi']],
  si: [['Va.', 'va'], ['Va, va.', 'va'], ['Bô.', 'va']],
  se: [['Hoûm. Tsi.', 'houm'], ['Ki ?', 'garde'], ['Onz. Bô.', 'onz_toi']],
  ui: [['…', 'echo'], ['Frè.', 'onz_toi'], ['Lui bô.', 'lui']],
  neu: [['Lum ?', 'enfant_lum'], ['Onz ! Onz !', 'onz_toi'], ['Vyin !', 'vyin']],
  di: [['Mo dôr.', 'jeune'], ['Va. D’sou.', 'jeune'], ['Onz.', 'onz_toi']],
};
// ce qu'ils se disent entre eux (entendu de loin, dans le noir) : [qui, phrase, qui répond, réponse]
const SOUT_ENTRE = [
  ['sin', 'Neu ! Vyin.', 'neu', 'Nenn !'],
  ['tre', 'Pan ?', 'si', 'Nenn. Pan nenn.'],
  ['katr', 'Hoûm ouï ?', 'se', 'Nenn. Tsi.'],
  ['si', 'Frè, va.', 'katr', 'Ouï.'],
  ['deu', 'Onz ?', 'un', 'Nenn. Mo. Dôr.'],
  ['tre', 'Sèl ?', 'ui', 'Nenn. Sèl nenn.'],
  ['neu', 'Lum d’sû ?', 'sin', 'Tsi !'],
  ['se', 'Ki ?', 'si', 'Frè.'],
  ['un', 'Tojor onz.', 'deu', 'Tojor.'],
];

// ---------------------------------------------------------------- le hameau (génération : cabanes de pierre sèche en ruche, lampes, planches, claies)
SOUT_GEN.push((w, rnd, B) => {
  const S = souterrain;
  S.creuseurs();
  const hall = SOUT_PLAN.salles.find((q) => q[0] === 'hameau');
  if (!hall) return;
  const [, hx, hz] = hall;
  const autour = w.props.filter((q) => q.ver === VER_SOUS && Math.abs(q.x - hx) < 110 && Math.abs(q.z - hz) < 100);
  const V = { huttes: [], lampes: [], planches: [], claies: [], props: [] };
  const occ = []; // [x, z, r]
  const libre = (x, z, r) => { for (const q of autour) if (Math.hypot(q.x - x, q.z - z) < r + 0.8) return false; for (const [a, b, rr] of occ) if (Math.hypot(a - x, b - z) < r + rr) return false; return true; };
  // un sol plat et libre de rayon r autour de (x, z) ? (écart de hauteur ≤ tol)
  const plat = (x, z, r, tol) => {
    const f0 = S.floorAt(x, z);
    if (f0 > SOUT_ROCK - 1 || f0 < SOUT_WL + 0.35 || S.vaultAt(x, z) - f0 < 5) return null;
    for (let a = 0; a < 10; a++) for (const d of [r * 0.5, r]) {
      const b = a / 10 * TAU, xx = x + Math.cos(b) * d, zz = z + Math.sin(b) * d, f = S.floorAt(xx, zz);
      if (Math.abs(f - f0) > tol || f < SOUT_WL + 0.3 || S.vaultAt(xx, zz) - f < 4.5) return null;
    }
    return libre(x, z, r) ? f0 : null;
  };
  const chercher = (x, z, r, tol, max) => { for (let k = 0; k < (max || 90); k++) { const a = k * 2.39996, d = Math.sqrt(k) * 1.3, xx = x + Math.cos(a) * d, zz = z + Math.sin(a) * d, f = plat(xx, zz, r, tol); if (f !== null) return [xx, zz, f]; } return null; };
  const blocs0 = w.blocks.length;
  const bloc = (F, lx, ly, lz, sx, sy, sz, m) => { B.block(F, lx, ly, lz, sx, sy, sz, m || M_COBBLE); const b = w.blocks[w.blocks.length - 1]; b.under = true; b.ver = VER_SOUS; return b; };
  // une cabane en ruche : des anneaux de pierres qui se resserrent, une porte basse tournée vers (tx, tz)
  const borie = (x, z, L0, niv, tx, tz) => {
    const r = Math.atan2(tx - x, tz - z);
    let fmin = 1e9;
    for (let a = 0; a < 8; a++) for (const d of [0, L0 * 0.35, L0 * 0.55]) fmin = Math.min(fmin, S.floorAt(x + Math.cos(a / 8 * TAU) * d, z + Math.sin(a / 8 * TAU) * d));
    const F = { x, y: fmin - 0.4, z, r }, t = 0.6, h = 0.6, porte = 1.05;
    for (let k = 0; k < niv; k++) {
      const L = L0 - k * 0.5, y = k * h;
      if (L - 2 * t < 1.0) { bloc(F, 0, y, 0, L, h, L); continue; }
      bloc(F, 0, y, -(L / 2 - t / 2), L, h, t);
      if (k < 4) { const sw = (L - porte) / 2; bloc(F, -(porte / 2 + sw / 2), y, L / 2 - t / 2, sw, h, t); bloc(F, porte / 2 + sw / 2, y, L / 2 - t / 2, sw, h, t); }
      else bloc(F, 0, y, L / 2 - t / 2, L, h, t);
      bloc(F, -(L / 2 - t / 2), y, 0, t, h, L - 2 * t); bloc(F, L / 2 - t / 2, y, 0, t, h, L - 2 * t);
    }
    const [px, pz] = B.toWorld(F, 0, L0 / 2 + 1.3), [ix, iz] = B.toWorld(F, 0, -0.3);
    occ.push([x, z, L0 / 2 + 0.6]);
    return { x, z, r, y: S.floorAt(x, z), L: L0, F, porte: [px, pz], dedans: [ix, iz] };
  };
  // ------------------------------------------------ la place et la pierre au pain
  const c = chercher(hx - 8, hz + 4, 2.4, 0.5) || [hx, hz, S.floorAt(hx, hz)];
  V.c = [c[0], c[2], c[1]];
  occ.push([c[0], c[1], 2.2]);
  // ------------------------------------------------ l'entrée (la longue galerie arrive par l'ouest) : la pierre d'appel, les trois entailles
  const lg = SOUT_PLAN.galeries.find((g) => g[0] === 'longue'), fin = lg[1][lg[1].length - 1], avant = lg[1][lg[1].length - 2];
  const ex = fin[0] + (fin[0] - avant[0]) / Math.hypot(fin[0] - avant[0], fin[1] - avant[1]) * 9, ez = fin[1] + (fin[1] - avant[1]) / Math.hypot(fin[0] - avant[0], fin[1] - avant[1]) * 9;
  const ap = chercher(ex, ez, 1.2, 0.8) || [ex, ez, S.floorAt(ex, ez)];
  const rApp = Math.atan2(fin[0] - ap[0], fin[1] - ap[1]); // la face aux creux, tournée vers qui arrive
  B.prop('sout_appel', ap[0], ap[2], ap[1], rApp, undefined, undefined, VER_SOUS);
  B.inter('sout_appel', 'sout_appel', ap[0] + Math.sin(rApp) * 0.5, ap[2] + 0.75, ap[1] + Math.cos(rApp) * 0.5, 'La pierre', {});
  B.prop('sout_entailles', ap[0] + Math.sin(rApp) * 0.49 + Math.cos(rApp) * 0.3, ap[2] + 0.9, ap[1] + Math.cos(rApp) * 0.49 - Math.sin(rApp) * 0.3, rApp, undefined, undefined, VER_SOUS);
  occ.push([ap[0], ap[1], 1.4]);
  V.appel = [ap[0], ap[2], ap[1], rApp];
  const gd = [ap[0] + Math.sin(rApp + 1.9) * 2.2, ap[1] + Math.cos(rApp + 1.9) * 2.2];
  V.garde = gd; V.entree = [fin[0], fin[1]];
  // ------------------------------------------------ les cabanes (huit, dont celle du onzième) et la maison des encoches
  const ang0 = Math.atan2(ap[0] - c[0], ap[1] - c[1]);
  const ench = chercher(c[0] + Math.sin(ang0 + 1.9) * 21, c[1] + Math.cos(ang0 + 1.9) * 21, 4.4, 0.9, 140);
  if (ench) { V.encoches = borie(ench[0], ench[1], 6.8, 10, c[0], c[1]); }
  for (let i = 0; i < 8; i++) {
    const a = ang0 + 0.55 + i * (TAU - 1.1) / 8 + (rnd() - 0.5) * 0.2, d = 15 + rnd() * 6;
    const p = chercher(c[0] + Math.sin(a) * d, c[1] + Math.cos(a) * d, 3.1, 0.8, 120);
    if (p) V.huttes.push(borie(p[0], p[1], 4.6, 7, c[0], c[1]));
  }
  // dans chaque cabane : une couche, une jarre, une petite lampe ; un rideau de feutre à la porte (sauf chez le onzième)
  V.huttes.forEach((H, i) => {
    const P = (id, lx, lz, rr, data) => B.propRel({ x: H.x, y: H.y, z: H.z, r: H.r }, id, lx, 0, lz, rr || 0, data, undefined, VER_SOUS);
    P('sout_couche', -0.7, -0.4, 0.1);
    if (i !== 7) {
      P('sout_jarre', 1.0, -1.0); P('sout_lampe', 1.05, 0.7, 0, { h: 0.8 }); B.propRel({ x: H.x, y: H.y, z: H.z, r: H.r }, 'sout_rideau', 0, 0, H.L / 2 - 0.25, 0, undefined, undefined, VER_SOUS);
      // une pierre plate devant la porte, pour s'asseoir
      const [sx, sz] = B.toWorld(H.F, 0, H.L / 2 + 1.0);
      B.prop('sout_siege', sx, S.floorAt(sx, sz), sz, H.r, undefined, undefined, VER_SOUS);
    }
  });
  // la cabane du onzième (la dernière) : vide ; un carnet, une lanterne morte
  const onz = V.huttes[7];
  if (onz) {
    const [cx, cz] = B.toWorld({ x: onz.x, z: onz.z, r: onz.r }, -0.7, -0.4);
    B.inter('sout_carnet', 'sout_carnet', cx, onz.y + 0.35, cz, 'Un carnet', {});
    V.carnet = [cx, onz.y, cz];
  }
  // la maison des encoches : les dalles, et le mur des jours
  if (V.encoches) {
    const H = V.encoches, F = { x: H.x, y: H.y, z: H.z, r: H.r };
    const pl = [[-2.0, -1.6, 0.5], [0, -2.1, 0], [2.0, -1.6, -0.5], [-2.35, 0.3, 1.57], [2.35, 0.3, -1.57], [-2.2, 1.6, 1.57]];
    SOUT_ENCOCHES.forEach(([k], i) => {
      const [lx, lz, rr] = pl[i];
      B.propRel(F, 'sout_encoches', lx, 0, lz, rr, { ins: SOUT_ENC_BY[k] }, undefined, VER_SOUS);
      const [ix, iz] = B.toWorld(F, lx + Math.sin(rr) * 0.3, lz + Math.cos(rr) * 0.3);
      B.inter('sout_enc', 'sout_enc_' + k, ix, H.y + 1.1, iz, 'Des encoches', { ins: k });
    });
    B.propRel(F, 'sout_lampe', -1.5, 0, 1.4, 0, { h: 1.4 }, undefined, VER_SOUS);
    B.propRel(F, 'sout_couche', 1.3, 0, 1.2, 0.3, undefined, undefined, VER_SOUS);
    B.propRel(F, 'sout_siege', 0, 0, -0.42, 0, undefined, undefined, VER_SOUS); // le siège du vieux, face à la porte
    const [jx, jz] = B.toWorld(F, 1.1, -2.2);
    B.inter('lire', 'sout_jours', jx, H.y + 1.3, jz, 'Le mur', { text: ['Le mur', 'Des encoches, par paquets de cinq, sur toute la paroi, du sol jusqu’où porte le bras : des milliers. Les plus hautes sont prises dans la calcite, comme sous du verre. Les plus basses sont fraîches ; la poussière de pierre y tient encore.', 'gravé dans la pierre'] });
  }
  // ------------------------------------------------ la pierre au pain
  B.prop('sout_pierre_pain', c[0], c[2], c[1], ang0, { pain: 0 }, undefined, VER_SOUS);
  V.pain = w.props.length - 1;
  B.inter('sout_pain', 'sout_pain', c[0], c[2] + 0.85, c[1], 'La pierre au pain', {});
  // ------------------------------------------------ les planches à champignons, les claies, le filet (vers l'eau), les lampes
  for (let i = 0; i < 3; i++) {
    const a = ang0 + (i - 1) * 0.42, p = chercher(c[0] + Math.sin(a) * 10, c[1] + Math.cos(a) * 10, 2.2, 0.6, 60);
    if (p) { B.prop('sout_planche', p[0], p[2], p[1], a + Math.PI / 2, undefined, undefined, VER_SOUS); occ.push([p[0], p[1], 2.2]); V.planches.push([p[0], p[1]]); }
  }
  // la rive la plus proche de la place (l'eau tiède)
  let rive = null;
  for (let d = 8; d < 70 && !rive; d += 2) for (let a = 0; a < 24; a++) { const b = a / 24 * TAU, x = c[0] + Math.cos(b) * d, z = c[1] + Math.sin(b) * d; if (S.floorAt(x, z) < SOUT_WL - 0.4 && S.ouvert(x, z, 3)) { rive = [x, z]; break; } }
  if (rive) {
    // on recule vers la place jusqu'au sec
    let [x, z] = rive; const dx = c[0] - x, dz = c[1] - z, L = Math.hypot(dx, dz);
    for (let s = 0; s < L && S.floorAt(x, z) < SOUT_WL + 0.25; s += 0.5) { x += dx / L * 0.5; z += dz / L * 0.5; }
    V.rive = [x, z, Math.atan2(-dx, -dz)];
    for (const [off, id] of [[3.5, 'sout_claie'], [-3.5, 'sout_claie'], [0, 'sout_filet']]) {
      const px = x + Math.cos(Math.atan2(-dx, -dz)) * off - dx / L * (id === 'sout_filet' ? -1.2 : 2.5), pz = z - Math.sin(Math.atan2(-dx, -dz)) * off - dz / L * (id === 'sout_filet' ? -1.2 : 2.5);
      B.prop(id, px, S.floorAt(px, pz), pz, Math.atan2(-dx, -dz) + Math.PI / 2, undefined, undefined, VER_SOUS);
      if (id === 'sout_claie') V.claies.push([px, pz]);
    }
  }
  const lampe = (x, z, h) => { const p = chercher(x, z, 0.8, 0.8, 30); if (!p) return; B.prop('sout_lampe', p[0], p[2], p[1], rnd() * TAU, { h: h || 1.15 }, undefined, VER_SOUS); occ.push([p[0], p[1], 0.8]); V.lampes.push([p[0], p[1]]); };
  for (let k = 0; k < 4; k++) { const a = ang0 + 0.8 + k * TAU / 4; lampe(c[0] + Math.sin(a) * 4.5, c[1] + Math.cos(a) * 4.5, 1.3); }
  for (const H of V.huttes) lampe(lerp(H.porte[0], c[0], 0.35), lerp(H.porte[1], c[1], 0.35));
  // le chemin de l'entrée : deux lampes seulement (la pierre d'appel reste dans le noir)
  lampe(lerp(ap[0], c[0], 0.45), lerp(ap[1], c[1], 0.45)); lampe(lerp(ap[0], c[0], 0.75), lerp(ap[1], c[1], 0.75));
  // ------------------------------------------------ les repères de la longue galerie : des tas de pierres entaillés, tous les cent cinquante mètres
  const pts = lg[1];
  let acc = 0, n = 0;
  for (let i = pts.length - 1; i > 0; i--) {
    const A = pts[i], Bq = pts[i - 1], L = Math.hypot(Bq[0] - A[0], Bq[1] - A[1]);
    for (let s = 0; s < L; s += 5) {
      acc += 5;
      if (acc < 150) continue;
      acc = 0;
      const t = s / L, x0 = lerp(A[0], Bq[0], t), z0 = lerp(A[1], Bq[1], t), nx = -(Bq[1] - A[1]) / L, nz = (Bq[0] - A[0]) / L;
      for (const side of [1, -1]) {
        const x = x0 + nx * side * (A[3] * 0.62), z = z0 + nz * side * (A[3] * 0.62);
        if (!S.ouvert(x, z, 1.5) || Math.abs(S.floorAt(x, z) - S.floorAt(x0, z0)) > 1.2) continue;
        B.prop('sout_cairn', x, S.floorAt(x, z), z, Math.atan2(A[0] - Bq[0], A[1] - Bq[1]), { n: 3 }, undefined, VER_SOUS);
        n++; break;
      }
    }
  }
  V.cairns = n;
  // (les blocs d'en bas ne comptent pas dans l'ombre de là-haut)
  let bx0 = 1e9, bz0 = 1e9, bx1 = -1e9, bz1 = -1e9;
  for (let k = blocs0; k < w.blocks.length; k++) { const b = w.blocks[k]; bx0 = Math.min(bx0, b.x - 6); bz0 = Math.min(bz0, b.z - 6); bx1 = Math.max(bx1, b.x + 6); bz1 = Math.max(bz1, b.z + 6); }
  if (bx1 > bx0) V.boite = [bx0, bz0, bx1, bz1];
  B.landmark('sout_hameau_c', c[0], c[1], 30, { under: true, secret: true, y: c[2], souterrain: true });
  w.soutVillage = V;
});
LIEU_NAMES.sout_hameau_c = 'le Hameau d’En-Bas';

// ---------------------------------------------------------------- les pâles : vie, peur, paroles
const soutTerres = {
  list: [], cris: 0, entreT: 20, sonT: 0,
  S() {
    const S = souterrain.S();
    const T = S.t || (S.t = {});
    for (const [k, v] of [['mots', {}], ['noms', {}], ['ins', {}], ['mort', {}], ['dit', {}]]) if (!T[k] || typeof T[k] !== 'object') T[k] = v;
    return T;
  },
  V() { return game.world && game.world.soutVillage; },
  admis() { return !!this.S().admis && !this.deuil(); },
  deuil() { return Object.keys(this.S().mort).length > 0; },
  // une flamme sur soi (la lanterne à huile, celle de l'aube) : la pierre luisante ne compte pas
  feu() { return !!(game.lantern && (farm.count('lanterne') || farm.count('lanterne_aube'))); },
  nom(e) { return this.S().noms[e.k] ? e.g.nom : e.g.dit.charAt(0).toUpperCase() + e.g.dit.slice(1); },
  // quelqu'un parle : sous-titre, murmure, et les mots entrent dans le carnet
  dire(e, texte, ctx, dur) {
    const p = game.player;
    ui.subtitle(e ? this.nom(e) : '', '« ' + texte + ' »', dur || Math.min(6, 2 + texte.length * 0.05));
    if (sound.mumble && e) sound.mumble(e.g.voix * 1.1, texte.length * 0.7, e.x - p.pos[0], 0.55);
    if (e) e.parleT = 1.2 + texte.length * 0.04;
    return soutParler.entendre(texte, ctx);
  },

  // ---------------------------------------------------------------- naissance (chaque descente), places
  construire() {
    const V = this.V();
    this.list = [];
    if (!V || !V.huttes || !V.huttes.length) return;
    const T = this.S();
    // les cabanes : chacun la plus proche de sa place (la dernière, celle du onzième, reste vide) ; l'enfant dort chez sa mère
    const libres = V.huttes.slice(0, Math.max(1, V.huttes.length - 1)), prises = {};
    const prendre = (x, z) => { let b = null, bd = 1e9; for (const H of libres) { const d = Math.hypot(H.x - x, H.z - z) + (Object.values(prises).includes(H) ? 1e4 : 0); if (d < bd) { bd = d; b = H; } } return b; };
    for (const g of SOUT_GENS) {
      if (g.k === 'un' || g.k === 'neu' || g.lieu === 'hutte') continue;
      const P = this.place({ g, hutte: null });
      prises[g.k] = prendre(P[0], P[1]);
    }
    for (const g of SOUT_GENS) if (g.lieu === 'hutte') prises[g.k] = prendre(V.c[0], V.c[2]);
    prises.un = V.encoches || libres[0]; prises.neu = prises.sin || libres[0];
    for (const g of SOUT_GENS) {
      if (T.mort[g.k]) continue;
      const hutte = prises[g.k] || libres[0];
      let rig = humanRig(g.look);
      if (g.look.bandeau) rig = rigPlus(rig, [{ name: 'bandeau', parent: 'head', p: [0, 0.15, 0.004], s: [0.3, 0.052, 0.3], col: rgbf('#3a3630'), tex: TL.cloth }]);
      const e = { terre: true, k: g.k, g, rig, hutte, x: 0, y: 0, z: 0, heading: 0, etat: 'poste', t: Math.random() * 10, timer: 2 + Math.random() * 20, phase: 0, move: 0, hp: 20, parleT: 0 };
      const P = this.poste(e);
      e.x = P[0] + (Math.random() - 0.5); e.z = P[1] + (Math.random() - 0.5); e.y = souterrain.floorAt(e.x, e.z);
      if (g.k === 'di') this.placerJeune(e, true);
      this.list.push(e);
    }
  },
  // la place de chacun (x, z, cap vers lequel il se tourne, pose) ; gardée tant qu'on ne l'oublie pas (e._poste = null)
  poste(e) { return e._poste || (e._poste = this.place(e)); },
  place(e) {
    const V = this.V(), H = e.hutte, g = e.g;
    const d = (a, b) => [a[0], a[1]];
    switch (g.lieu) {
      case 'encoches': return H ? [...d(H.dedans), H.r, 'sit'] : [V.c[0], V.c[2], 0, 'sit'];
      case 'planches': { const p = V.planches[0] || [V.c[0], V.c[2]]; return [p[0] + 1.2, p[1] + 1.2, Math.atan2(p[0] - p[0] - 1.2, p[1] - p[1] - 1.2), 'work']; }
      case 'pain': { const a = V.appel[3] + 3.4; return [V.c[0] + Math.sin(a) * 2.1, V.c[2] + Math.cos(a) * 2.1, a + Math.PI, 'stand']; }
      case 'rive': return V.rive ? [V.rive[0], V.rive[1], V.rive[2], 'fish'] : [V.c[0] + 6, V.c[2], 0, 'stand'];
      case 'appel': return [V.garde[0], V.garde[1], Math.atan2(V.entree[0] - V.garde[0], V.entree[1] - V.garde[1]), 'stand'];
      case 'place': return [V.c[0] + 3, V.c[2] + 2, Math.random() * TAU, 'play'];
      case 'tour': { const L = [...V.planches, ...V.claies, [V.c[0], V.c[2]]]; const p = L[(Math.random() * L.length) | 0] || [V.c[0], V.c[2]]; return [p[0] + 1.5, p[1] - 1.5, Math.random() * TAU, 'carry']; }
      case 'route': return [V.entree[0], V.entree[1], 0, 'stand'];
      default: return H ? [H.porte[0] + Math.sin(H.r) * -0.2, H.porte[1] + Math.cos(H.r) * -0.2, H.r, g.poste === 'travail' ? 'worksit' : 'sit'] : [V.c[0], V.c[2], 0, 'stand'];
    }
  },

  // ---------------------------------------------------------------- le jeune : la longue galerie, jusqu'à ceux qui dorment
  route() {
    if (this._route) return this._route;
    const lg = SOUT_PLAN.galeries.find((g) => g[0] === 'longue'), ch = SOUT_PLAN.galeries.find((g) => g[0] === 'chatiere'), dm = SOUT_PLAN.salles.find((q) => q[0] === 'dormeurs');
    const pts = [];
    const V = this.V();
    if (V) pts.push([V.c[0], V.c[2]]);
    for (let i = lg[1].length - 1; i >= 0; i--) { const q = lg[1][i]; pts.push([q[0], q[1]]); if (Math.abs(q[1] - 1760) < 3) break; }
    for (const q of ch[1]) pts.push([q[0], q[1]]);
    if (dm) pts.push([dm[1] - 8, dm[2] + 2]);
    const L = [0];
    for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return (this._route = { pts, L, tot: L[L.length - 1] });
  },
  surRoute(s) {
    const R = this.route();
    s = clamp(s, 0, R.tot);
    let i = 1; while (i < R.L.length - 1 && R.L[i] < s) i++;
    const t = (s - R.L[i - 1]) / Math.max(0.01, R.L[i] - R.L[i - 1]), A = R.pts[i - 1], B = R.pts[i];
    return [lerp(A[0], B[0], t), lerp(A[1], B[1], t), Math.atan2(B[0] - A[0], B[1] - A[1])];
  },
  // (d'après l'heure : aller au hameau → les dormeurs, rester, revenir, rester ; une demi-heure réelle)
  sJeune() {
    const R = this.route(), v = 1.35, aller = R.tot / v, P = aller * 2 + 420, t = ((farm.s.hours || 0) * 50) % P;
    if (t < 240) return [0, 0];
    if (t < 240 + aller) return [(t - 240) * v, 1];
    if (t < 420 + aller) return [R.tot, 0];
    return [R.tot - (t - 420 - aller) * v, -1];
  },
  placerJeune(e, force) {
    const [s, dir] = this.sJeune();
    if (!force && Math.abs(s - (e.s || 0)) < 30) return;
    e.s = s; e.dir = dir;
    const [x, z, h] = this.surRoute(s);
    e.x = x; e.z = z; e.y = souterrain.floorAt(x, z); e.heading = dir < 0 ? h + Math.PI : h;
  },

  // ---------------------------------------------------------------- chaque image
  update(dt, playing) {
    if (!souterrain.actif) { if (this.list.length) this.list = []; this.pret = false; return; }
    const V = this.V();
    if (!V) return;
    if (!this.pret) { this.pret = true; this.construire(); }
    if (!playing) return;
    const p = game.player, T = this.S(), feu = this.feu();
    const dv = Math.hypot(p.pos[0] - V.c[0], p.pos[2] - V.c[2]);
    // le bruit : courir, tirer (voir souterrain.bruits)
    const br = souterrain.bruitRecent ? souterrain.bruitRecent(3) : 0;
    if (br >= 2.5 && dv < 45) this.colere = Math.max(this.colere || 0, 40);
    this.colere = Math.max(0, (this.colere || 0) - dt);
    this.cris = Math.max(0, this.cris - dt);
    for (const e of this.list) {
      e.t += dt; e.parleT = Math.max(0, e.parleT - dt); e.hurtT = Math.max(0, (e.hurtT || 0) - dt);
      if (e.mort) { e.mortT = (e.mortT || 0) + dt; continue; }
      e.dist = Math.hypot(e.x - p.pos[0], e.z - p.pos[2]);
      if (e.k === 'di') { this.jeune(e, dt, p, feu); continue; }
      if (dv > 170) continue;
      this.vivre(e, dt, p, feu);
    }
    if (dv < 60) this.entreEux(dt, p, feu);
  },
  // aller vers (x, z) ; renvoie vrai quand on y est
  marcher(e, dt, x, z, v) {
    const dx = x - e.x, dz = z - e.z, d = Math.hypot(dx, dz);
    if (d < 0.25) { e.move = Math.max(0, e.move - dt * 4); return true; }
    e.heading = turnToward(e.heading, Math.atan2(dx, dz), dt * 6);
    const st = Math.min(d, v * dt), nx = e.x + Math.sin(e.heading) * st, nz = e.z + Math.cos(e.heading) * st;
    const f = souterrain.floorAt(nx, nz);
    if (Math.abs(f - e.y) > 1.2 && d > 1) { e.heading += 0.8; return false; }
    e.x = nx; e.z = nz; e.y = f; e.move = Math.min(1, v / 1.4); e.phase += dt * v * 2.3;
    return false;
  },
  // un chemin : par la porte de la cabane si l'on est dedans, puis tout droit (le hameau est ouvert)
  aller(e, but, v) {
    const H = e.hutte, V = this.V();
    const dedans = (h) => h && Math.hypot(e.x - h.x, e.z - h.z) < h.L / 2 - 0.2;
    const hs = [...V.huttes, V.encoches].filter(Boolean);
    const ici = hs.find(dedans), la = hs.find((h) => Math.hypot(but[0] - h.x, but[1] - h.z) < h.L / 2 - 0.2);
    e.chemin = [];
    if (ici && ici !== la) e.chemin.push([ici.porte[0], ici.porte[1]]);
    if (la && la !== ici) e.chemin.push([la.porte[0], la.porte[1]]);
    e.chemin.push([but[0], but[1]]);
    e.v = v || 1.1;
    void H;
  },
  suivre(e, dt) {
    if (!e.chemin || !e.chemin.length) return true;
    const [x, z] = e.chemin[0];
    if (this.marcher(e, dt, x, z, e.v || 1.1)) e.chemin.shift();
    return !e.chemin.length;
  },
  vivre(e, dt, p, feu) {
    const T = this.S(), g = e.g, V = this.V();
    const pres = feu && e.dist < 26, colere = this.colere > 0 && e.dist < 60;
    // ---- la flamme, le bruit, un mort : on se cache
    if ((pres || colere || this.deuil() || (e.hurtT > 0)) && e.etat !== 'cache' && e.etat !== 'fuite') {
      if (pres && this.cris <= 0 && e.dist < 22) { this.cris = 7; this.dire(e, pick(['Tsi ! Lum ! Lum !', 'Zyeu ! Lum !', 'Lum ! Tsi !']), 'feu', 2.5); if (sound.whisper) sound.whisper(clamp((e.x - p.pos[0]) / 10, -1, 1), 1); }
      e.etat = 'fuite'; this.aller(e, e.hutte ? e.hutte.dedans : [V.c[0], V.c[2]], 2.6);
    }
    if (e.etat === 'fuite') { if (this.suivre(e, dt)) { e.etat = 'cache'; e.calme = 0; } e.pose = 'run'; return; }
    if (e.etat === 'cache') {
      e.pose = 'cower'; e.move = 0;
      if (e.hutte) e.heading = turnToward(e.heading, e.hutte.r + Math.PI, dt * 3);
      if (!(feu && e.dist < 34) && this.colere <= 0 && !this.deuil()) { e.calme += dt; if (e.calme > 4 + (e.k.length % 3) * 1.5) { e.etat = 'retour'; const P = this.poste(e); this.aller(e, P, 1.0); } }
      return;
    }
    // ---- le rituel : le guetteur vient à qui a frappé
    if (e.etat === 'rituel') { e.pose = 'stand'; if (this.suivre(e, dt)) { e.heading = turnToward(e.heading, Math.atan2(p.pos[0] - e.x, p.pos[2] - e.z), dt * 5); if (!e.arrive) { e.arrive = true; this.rituelArrive(e); } } return; }
    if (e.etat === 'viens') { e.pose = 'stand'; if (this.suivre(e, dt)) { e.heading = turnToward(e.heading, Math.atan2(p.pos[0] - e.x, p.pos[2] - e.z), dt * 4); e.timer -= dt; if (e.timer <= 0) { e.etat = 'retour'; this.aller(e, this.poste(e), 1.0); } } return; }
    if (e.etat === 'pain') { e.pose = 'stand'; if (this.suivre(e, dt)) { e.heading = turnToward(e.heading, Math.atan2(V.c[0] - e.x, V.c[2] - e.z), dt * 4); e.pose = 'pray'; } return; }
    // ---- aller à sa place (ou ailleurs, un moment), y faire ce qu'on y fait
    if (e.etat === 'retour' || e.etat === 'va') {
      e.pose = e.g.poste === 'porte' ? 'carry' : 'walk';
      if (this.suivre(e, dt)) { const P = e.etat === 'va' && e.cible ? e.cible : this.poste(e); e.ailleurs = e.etat === 'va'; e.etat = 'poste'; e.timer = 20 + Math.random() * 45; e.cap = P[2]; e.pose = P[3]; }
      return;
    }
    const P = this.poste(e);
    if (e.cap === undefined) { e.cap = P[2]; e.pose = P[3]; }
    e.timer -= dt; e.move = Math.max(0, e.move - dt * 3);
    const regarde = (!this.admis() && e.dist < 9) || (this.admis() && e.dist < 4.5);
    if (regarde) {
      e.heading = turnToward(e.heading, Math.atan2(p.pos[0] - e.x, p.pos[2] - e.z), dt * 3);
      if (!this.admis() && e.dist < 2.6 && e.k !== 'se') { const a = Math.atan2(e.x - p.pos[0], e.z - p.pos[2]); this.marcher(e, dt, e.x + Math.sin(a) * 2, e.z + Math.cos(a) * 2, 1.2); e.heading = turnToward(e.heading, a + Math.PI, dt * 8); e.move = 0.6; }
      if (this.admis() && e.dist < 3.2 && !e.salue && !ui.panel) { e.salue = true; this.dire(e, pick(['Onz.', 'Bô, Onz.', 'Onz. Vyin.']), 'onz_toi', 2.5); }
    } else e.heading = turnToward(e.heading, e.cap, dt * 2);
    if (e.dist > 12) e.salue = false;
    // l'enfant suit (une fois qu'on est des leurs)
    if (e.g.enfant && this.admis() && e.dist < 14 && e.dist > 3.2 && !ui.panel) { e.pose = 'walk'; this.marcher(e, dt, p.pos[0], p.pos[2], 1.3); e.ailleurs = true; return; }
    if (e.timer > 0 || regarde) return;
    e.timer = 25 + Math.random() * 50;
    if (e.ailleurs) { e.ailleurs = false; this.aller(e, P, 1.0); e.etat = 'retour'; return; }
    // un tour : la place, les planches, les claies ; le porteur et l'enfant changent de place
    if (e.g.lieu === 'tour' || e.g.enfant) { e._poste = null; this.aller(e, this.poste(e), e.g.enfant ? 1.5 : 1.0); e.etat = 'retour'; return; }
    if (e.k !== 'se' && e.k !== 'un' && Math.random() < 0.45) {
      const L = [[V.c[0] + (Math.random() - 0.5) * 6, V.c[2] + (Math.random() - 0.5) * 6], ...V.planches, ...V.claies], q = L[(Math.random() * L.length) | 0];
      e.cible = [q[0] + 1, q[1] + 1, Math.random() * TAU, 'stand']; this.aller(e, e.cible, 1.0); e.etat = 'va';
    }
  },
  // le jeune va et vient ; il s'arrête devant qui vient sans flamme ; il se sauve devant le feu
  jeune(e, dt, p, feu) {
    if (e.etat === 'fuite') {
      e.pose = 'run';
      const R = this.route(), a = this.surRoute(e.s);
      e.s = clamp(e.s + e.fdir * 3 * dt, 0, R.tot);
      const b = this.surRoute(e.s);
      e.x = b[0]; e.z = b[1]; e.y = souterrain.floorAt(b[0], b[1]); e.heading = e.fdir > 0 ? b[2] : b[2] + Math.PI; e.move = 1; e.phase += dt * 7;
      void a;
      if (e.dist > 55 || e.s <= 0 || e.s >= R.tot) { e.etat = 'loin'; e.timer = 20; }
      return;
    }
    if (e.dist > 70) { this.placerJeune(e); e.etat = 'route'; e.move = 0; return; }
    if (feu && e.dist < 30) {
      if (this.cris <= 0) { this.cris = 6; this.dire(e, 'Lum ! Tsi !', 'feu', 2.2); }
      const ds = this.surRoute(Math.min(this.route().tot, (e.s || 0) + 5)), dPlus = Math.hypot(ds[0] - p.pos[0], ds[1] - p.pos[2]);
      e.fdir = dPlus > e.dist ? 1 : -1; e.etat = 'fuite'; return;
    }
    if (e.etat === 'loin') { e.timer -= dt; e.move = 0; e.pose = 'stand'; if (e.timer <= 0) e.etat = 'route'; return; }
    if (e.dist < 7) {
      e.move = Math.max(0, e.move - dt * 4); e.pose = 'stand';
      e.heading = turnToward(e.heading, Math.atan2(p.pos[0] - e.x, p.pos[2] - e.z), dt * 3);
      if (!e.vuT) { e.vuT = 1; this.dire(e, this.admis() ? 'Onz.' : '…', this.admis() ? 'onz_toi' : 'jeune', 2); }
      return;
    }
    if (e.dist > 14) e.vuT = 0;
    // suivre la route (à sa vitesse, sans se téléporter tant qu'on le voit)
    const [s, dir] = this.sJeune();
    const R = this.route();
    e.pose = 'walk';
    if (Math.abs(s - (e.s || 0)) > 1) { const st = Math.sign(s - e.s) * Math.min(Math.abs(s - e.s), 1.35 * dt); e.s = clamp(e.s + st, 0, R.tot); const b = this.surRoute(e.s); e.x = b[0]; e.z = b[1]; e.y = souterrain.floorAt(b[0], b[1]); e.heading = turnToward(e.heading, st > 0 ? b[2] : b[2] + Math.PI, dt * 5); e.move = 1; e.phase += dt * 3.2; }
    else { e.move = Math.max(0, e.move - dt * 3); e.pose = dir === 0 && e.s > R.tot - 1 ? 'pray' : 'stand'; }
  },
  // entre eux : de temps en temps, deux phrases, entendues de loin si l'on se tait
  entreEux(dt, p, feu) {
    this.entreT -= dt;
    if (this.entreT > 0 || feu || ui.panel || this.colere > 0) return;
    this.entreT = 22 + Math.random() * 30;
    const libres = this.list.filter((e) => !e.mort && e.etat !== 'cache' && e.etat !== 'fuite' && e.dist < 20 && e.k !== 'di');
    const L = SOUT_ENTRE.filter(([a, , b]) => libres.some((e) => e.k === a) && libres.some((e) => e.k === b));
    if (!L.length) return;
    const [a, t1, b, t2] = pick(L), A = libres.find((e) => e.k === a), Bq = libres.find((e) => e.k === b);
    this.dire(A, t1, 'entre', 3);
    A.heading = Math.atan2(Bq.x - A.x, Bq.z - A.z);
    setTimeout(() => { if (souterrain.actif && !Bq.mort) { this.dire(Bq, t2, 'entre', 3); Bq.heading = Math.atan2(A.x - Bq.x, A.z - Bq.z); } }, 1800);
    if (t1.startsWith('Neu') || t2.startsWith('Neu')) { const n = this.list.find((e) => e.k === 'neu'); if (n) this.S().noms.neu = 1; }
  },

  // ---------------------------------------------------------------- la pierre d'appel : trois coups, sans flamme ; et ne pas dire son nom
  appeler(it) {
    const T = this.S(), now = game.time;
    sound.knock && sound.knock(1);
    if (!T.appelVu) { T.appelVu = 1; }
    this.coups = (this.coups || []).filter((t) => now - t < 6);
    this.coups.push(now);
    if (this.coups.length < 3 || this.attente) return;
    this.coups = [];
    this.attente = true;
    setTimeout(() => { this.attente = false; this.reponse(); }, 2600);
    void it;
  },
  reponse() {
    const T = this.S(), p = game.player, se = this.list.find((e) => e.k === 'se' && !e.mort);
    if (!souterrain.actif) return;
    if (this.deuil()) { ui.subtitle('', '(Rien. Plus personne ne vient.)', 3); return; }
    if (this.feu()) { if (se) this.dire(se, 'Tsi ! Lum !', 'feu', 2.5); else ui.subtitle('', '« Tsi ! Lum ! »', 2.5); return; }
    if (!se) return;
    if (T.refus === farm.s.day && !this.admis()) { return; }
    if ((se.etat === 'cache' || se.etat === 'fuite') && this.colere > 0) return;
    se.etat = 'rituel'; se.arrive = false;
    const a = Math.atan2(se.x - p.pos[0], se.z - p.pos[2]);
    this.aller(se, [p.pos[0] + Math.sin(a) * 1.1, p.pos[2] + Math.cos(a) * 1.1], 1.5);
  },
  rituelArrive(se) {
    const T = this.S();
    if (this.admis()) { this.dire(se, 'Onz.', 'onz_toi', 2); se.etat = 'retour'; this.aller(se, this.poste(se), 1.0); return; }
    if (!T.touche) { T.touche = 1; ui.subtitle('', '(Des doigts froids vous effleurent le visage, les paupières, la bouche.)', 4); }
    setTimeout(() => {
      if (!souterrain.actif || se.mort) return;
      this.dire(se, 'Ki ? … Nom ?', 'garde', 3.5);
      const opts = [
        { label: 'Dire votre nom', fn: () => { ui.close(); this.refuser(se); } },
        { label: 'Ne rien dire', fn: () => { ui.close(); setTimeout(() => this.accepter(se, 'silence'), 2400); } },
      ];
      if (soutParler.connu('frè')) opts.push({ label: 'Dire « frè »', fn: () => { ui.close(); this.accepter(se, 'frè'); } });
      if (soutParler.connu('onz')) opts.push({ label: 'Dire « onz »', fn: () => { ui.close(); this.accepter(se, 'onz'); } });
      ui.choice('Dans le noir', '« Ki ? … Nom ? »', opts);
    }, T.touche === 1 ? 2600 : 600);
    T.touche = 2;
  },
  refuser(se) {
    const T = this.S(), nom = (farm.s.prenom || '').trim() || '…';
    ui.subtitle('Vous', '« ' + nom + '. »', 2.5);
    setTimeout(() => { this.dire(se, 'Nom… d’sû. Va.', 'refus', 3); T.refus = farm.s.day; se.etat = 'retour'; this.aller(se, this.poste(se), 1.2); }, 1600);
  },
  accepter(se, comment) {
    const T = this.S();
    if (comment === 'frè') this.dire(se, 'Frè ? … Frè.', 'admis_frere', 3);
    else if (comment === 'onz') this.dire(se, 'Onz ? … Onz.', 'onz_toi', 3);
    else this.dire(se, '… Bô. San nom. Bô.', 'admis', 3.5);
    T.admis = farm.s.day;
    se.etat = 'retour'; this.aller(se, this.poste(se), 1.0);
    // ils sortent des cabanes, viennent voir ; le vieux vous touche l'épaule
    const V = this.V(), p = game.player;
    for (const e of this.list) {
      if (e.mort || e.k === 'se' || e.k === 'di') continue;
      const a = Math.random() * TAU, r = 2 + Math.random() * 2.5;
      e.etat = 'viens'; e.timer = 12 + Math.random() * 6; this.aller(e, [p.pos[0] + Math.sin(a) * r, p.pos[2] + Math.cos(a) * r], 1.0);
    }
    const un = this.list.find((e) => e.k === 'un' && !e.mort);
    if (un) setTimeout(() => { if (souterrain.actif) { this.dire(un, 'Onz.', 'onz_toi', 3); } }, 7000);
    void V;
  },

  // ---------------------------------------------------------------- parler (E sur l'un d'eux)
  cibles(eye, f, cand) {
    if (!souterrain.actif) return;
    for (const e of this.list) {
      if (e.mort) continue;
      const h = 1.55 * e.g.look.height, dx = e.x - eye[0], dy = e.y + h * 0.8 - eye[1], dz = e.z - eye[2], d = Math.hypot(dx, dy, dz);
      if (d > 2.8) continue;
      const cos = (dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1);
      if (cos < 0.8) continue;
      cand({ kind: 'hook', terre: e, use: () => this.parler(e) }, d * (1.5 - cos * 0.5));
    }
  },
  parler(e) {
    const T = this.S();
    if (this.feu()) { if (this.cris <= 0) { this.cris = 4; this.dire(e, 'Tsi ! Lum !', 'feu', 2.2); } e.etat = 'fuite'; this.aller(e, e.hutte ? e.hutte.dedans : [e.x + 5, e.z], 2.6); return; }
    if (e.etat === 'cache' || e.etat === 'fuite' || this.deuil()) { this.dire(e, 'Tsi !', 'tsi', 1.6); return; }
    if (T.profane && T.profane > 0) { this.dire(e, e.g.enfant ? 'Gout… d’dôr !' : 'Nenn. Gout d’dôr. Nenn.', e.g.enfant ? 'profane' : 'nenn', 3); e.heading += Math.PI; return; }
    if (!this.admis()) {
      if (e.k === 'se' || e.k === 'di') { this.dire(e, 'Ki ?', 'garde', 2); return; }
      this.dire(e, 'Nenn.', 'nenn', 1.8); return;
    }
    e.heading = Math.atan2(game.player.pos[0] - e.x, game.player.pos[2] - e.z);
    this.panneau(e, null);
  },
  // le panneau : ce qu'il dit, et ce qu'on peut faire
  panneau(e, phrase) {
    const T = this.S();
    if (!phrase) { const L = SOUT_DIRE[e.k] || [['…', 'echo']]; phrase = pick(L); }
    const [texte, ctx] = phrase;
    soutParler.entendre(texte, ctx);
    if (sound.mumble) sound.mumble(e.g.voix * 1.1, texte.length * 0.7, 0, 0.5);
    e.parleT = 1.5;
    const opts = [{ label: 'Écouter', fn: () => this.panneau(e, null) }];
    if (soutParler.entendus().length) opts.push({ label: 'Dire un mot…', fn: () => this.mots(e) });
    if (e.k === 'tre') opts.push({ label: 'Montrer ce que vous avez', fn: () => this.troc(e) });
    if (farm.count('pain') && e.k !== 'tre') opts.push({ label: 'Donner un pain', fn: () => this.donPain(e) });
    opts.push({ label: 'S’éloigner', fn: () => ui.close() });
    ui.choice(this.nom(e), '« ' + texte + ' »', opts);
    void T;
  },
  mots(e) {
    const L = soutParler.entendus().slice(0, 16);
    ui.choice(this.nom(e), 'Quel mot ?', L.map((m) => ({ label: '« ' + m + ' »', fn: () => this.reagir(e, m) })).concat([{ label: 'Aucun', fn: () => this.panneau(e, ['…', 'echo']) }]));
  },
  // chacun réagit aux mots qu'on lui dit
  reagir(e, m) {
    const T = this.S(), k = e.k, p = game.player;
    const R = (t, c) => this.panneau(e, [t, c]);
    const num = SOUT_NUM[m];
    if (num === k) { T.noms[k] = 1; return R(e.g.nom + '.', 'soi'); }
    if (num === 'onz') {
      if (k === 'un' && (T.dons || 0) > 0) return this.liste(e);
      return R('Onz.', 'onz_toi');
    }
    if (num) {
      const autre = this.list.find((q) => q.k === num && !q.mort);
      if (!autre) return R('… ' + SOUT_GENS_BY[num].nom + '. Mo.', 'mo');
      T.noms[num] = 1; e.heading = Math.atan2(autre.x - e.x, autre.z - e.z);
      if (autre.dist < 30) autre.heading = Math.atan2(e.x - autre.x, e.z - autre.z);
      return R(autre.g.nom + '.', 'autre');
    }
    switch (m) {
      case 'nom': return R('Tsi !', 'tabou');
      case 'lum': return k === 'un' ? R('Lum… mo.', 'feu_vieux') : R('Tsi. Lum nenn.', 'nenn');
      case 'zyeu': return R('Zyeu… lum nenn.', 'nenn');
      case 'lui':
        if (e.g.enfant && !T.cadeauEnfant) { T.cadeauEnfant = 1; farm.give('mousse_luisante', 1); play.flyer && play.flyer('mousse_luisante', [e.x, e.y + 0.8, e.z], 1); return R('Lui ! Lui !', 'enfant_lui'); }
        return R('Lui bô.', 'lui');
      case 'pan': return k === 'tre' ? this.troc(e) : R('Pan ?', 'pan_main');
      case 'sèl': return R(farm.count('sel') ? 'Sèl ?' : 'Sèl… nenn.', 'pan_main');
      case 'sou': return R('Sou ? Nenn.', 'sou');
      case 'hoûm':
        if (e.g.enfant) { this.dire(e, 'Hoûm !', 'enfant_houm', 2); ui.close(); e.etat = 'fuite'; this.aller(e, e.hutte ? e.hutte.dedans : [e.x + 4, e.z], 2.6); return; }
        return R('Hoûm ouï. Tsi, tsi.', 'houm');
      case 'mo': return k === 'un' ? R('Mo… dôr. Gout.', 'mo') : k === 'di' ? R('Mo dôr.', 'jeune') : R('…', 'echo');
      case 'dôr': return k === 'deu' ? R('Dôr, dôr… dôr, gout…', 'dor') : R('Dôr.', 'echo');
      case 'd’sû':
        if (k === 'un') return R('D’sû… mo.', 'dsu');
        if (k === 'se') return this.guide(e);
        return R('Tsi.', 'tsi');
      case 'd’sou': return R('D’sou. Bô.', 'echo');
      case 'pèst': return k === 'un' ? this.pest(e) : R('Tsi !', 'tabou');
      case 'mûr': return k === 'un' ? R('Mûr. Onz mûr.', 'mur') : R('Mûr… onz.', 'echo');
      case 'grî': return k === 'un' ? R('Grî… trè koû.', 'gri') : k === 'se' ? R('Grî. Koû, koû, koû.', 'gri') : R('…', 'echo');
      case 'koû': return R('Trè koû.', 'gri');
      case 'frè': return R('Frè.', 'onz_toi');
      case 'gout': return k === 'katr' ? this.pecheur(e) : R('Gout bô.', 'gout');
      case 'manj': return (k === 'katr' || k === 'deu') ? this.pecheur(e) : R('Manj ? … Pan.', 'pan_main');
      case 'vyin': return R('Vyin.', 'vyin');
      case 'va': return R('Va ?', 'echo');
      case 'ki': return R('Onz.', 'onz_toi');
      case 'tsi': return R('Tsi.', 'tsi');
      case 'ouï': case 'nenn': case 'bô': case 'san': case 'tojor': return R(m.charAt(0).toUpperCase() + m.slice(1) + ' ?', 'echo');
      default: return R('…', 'echo');
    }
    void p;
  },
  // le pêcheur, la vieille : de quoi manger, une fois par jour
  pecheur(e) {
    const T = this.S();
    if (T.manj === farm.s.day) return this.panneau(e, ['Nenn. Manj nenn.', 'nenn']);
    T.manj = farm.s.day;
    const id = e.k === 'katr' ? 'algue_blanche' : 'pied_pierre';
    farm.give(id, 2); play.flyer && play.flyer(id, [e.x, e.y + 0.8, e.z], 2);
    return this.panneau(e, ['Manj.', 'manj']);
  },
  // le vieux : la peau pliée, où sont écrits les onze
  liste(e) {
    const T = this.S();
    soutParler.entendre('Onz. Mûr. Pan nenn. D’sou.', 'liste');
    ui.close();
    this.dire(e, 'Onz. Mûr. Pan nenn. D’sou.', 'liste', 4);
    setTimeout(() => {
      T.liste = (T.liste || 0) + 1;
      ui.read('Une peau pliée', 'Une peau de chèvre grattée, pliée dans un linge qui tombe en poussière. Dessus, à l’encre brune, d’une écriture de clerc :\n\nJehan Mauduit, tisserand.\nPerrine, sa femme.\nGuillemette, leur fille.\nDenis Crochard, tonnelier.\nMichel Vaudrey, dit le Sourd.\nCatherine Lebrun, veuve.\nPierre Gaudin, clerc, qui écrit ceci.\nMarguerite Gaudin, sa sœur.\nJacquette, servante chez Lebrun.\nÉtienne Roux, compagnon.\nNicolas, onze ans, sans autre nom.\n\nSous chaque nom, des encoches, par cinq, serrées, qui débordent dans les marges et continuent au dos. Sous le dernier, elles s’arrêtent.', 'Le vieux la replie sans un mot. Puis il vous regarde.');
    }, 2200);
  },
  // le vieux : « pèst… d'sû ? »
  pest(e) {
    const T = this.S();
    soutParler.entendre('Pèst… d’sû ?', 'pest');
    const opts = [];
    if (soutParler.connu('ouï')) opts.push({ label: 'Dire « ouï »', fn: () => this.panneau(e, ['… Ouï. D’sû mo. Tojor.', 'pest_ouï']) });
    if (soutParler.connu('nenn')) opts.push({ label: 'Dire « nenn »', fn: () => {
      if (T.pest) return this.panneau(e, ['Nenn…', 'pest_nenn']);
      ui.close();
      this.dire(e, 'Nenn ?', 'pest', 2);
      setTimeout(() => {
        if (!souterrain.actif) return;
        T.pest = farm.s.day;
        this.dire(e, 'Pèst nenn… D’sû. Va.', 'pest_nenn', 4);
        farm.give('baton_encoches', 1); play.flyer && play.flyer('baton_encoches', [e.x, e.y + 0.8, e.z], 1);
        ui.subtitle('', '(Il vous met dans la main un bâton poli, couvert d’encoches.)', 4);
      }, 4200);
    } });
    opts.push({ label: 'Ne rien dire', fn: () => this.panneau(e, ['…', 'echo']) });
    ui.choice(this.nom(e), '« Pèst… d’sû ? »', opts);
  },
  // le guetteur : il ramène au pied du puits
  guide(e) {
    ui.choice(this.nom(e), '« D’sû ? … Vyin. »', [
      { label: 'Le suivre', fn: async () => {
        ui.close();
        soutParler.entendre('D’sû ? Vyin.', 'guide');
        const w = game.world, P = w.sout && w.sout.pied;
        if (!P) return;
        await ui.fade(true, 'Il vous prend la main. Vous marchez longtemps dans le noir ; il ne se trompe jamais.', 900);
        await new Promise((r) => setTimeout(r, 2200));
        const p = game.player; p.pos = P.slice(); p.vel = [0, 0, 0];
        await ui.fade(false, '', 900);
      } },
      { label: 'Rester', fn: () => this.panneau(e, ['Bô.', 'echo']) },
    ]);
    soutParler.entendre('D’sû ? Vyin.', 'guide');
  },
  // donner un pain (à n'importe lequel) : ils le serrent contre eux
  donPain(e) {
    if (!farm.take('pain', 1)) return;
    const T = this.S();
    T.donnes = (T.donnes || 0) + 1;
    this.panneau(e, ['Pan… bô, bô.', 'pan_don']);
  },
  // la femme au pain : le troc (du pain, du sel ; pas de sous)
  troc(e) {
    const T = this.S(), n = farm.count('pain');
    const O = [];
    const t = (label, need, give, fn) => O.push({ label, fn: () => {
      for (const id in need) if (farm.count(id) < need[id]) return this.panneau(e, ['Nenn.', 'nenn']);
      for (const id in need) farm.take(id, need[id]);
      for (const id in give) { farm.give(id, give[id]); play.flyer && play.flyer(id, [e.x, e.y + 0.9, e.z], give[id]); }
      if (fn) fn();
      sound.pop && sound.pop();
      this.panneau(e, need.pain ? ['Pan… bô.', 'pan_don'] : need.sel ? ['Sèl !', 'sel'] : ['Bô.', 'echo']);
    } });
    t('Deux pains contre une pierre qui luit', { pain: 2 }, { luisante: 1 });
    t('Un pain contre des pieds-de-pierre grillés', { pain: 1 }, { pied_pierre_grille: 1 });
    t('Quatre pains contre une perle', { pain: 4 }, { perle_caverne: 1 });
    if (farm.count('sel')) t('Du sel contre des pieds-de-pierre', { sel: 1 }, { pied_pierre: 2 });
    if (!T.aiguille) t('Trois pains et une pierre noire contre l’aiguille dans la coquille', { pain: 3, magnetite: 1 }, { aiguille_lui: 1 }, () => { T.aiguille = farm.s.day; });
    if (farm.s.money > 0) O.push({ label: 'Montrer des pièces', fn: () => this.panneau(e, ['Sou ? Nenn.', 'sou']) });
    O.push({ label: 'Rien', fn: () => this.panneau(e, ['Pan ?', 'pan_main']) });
    ui.choice(this.nom(e), n ? '« Pan ? » Elle ouvre la main.' : '« Pan ? » Elle ouvre la main, regarde la vôtre, la referme.', O);
    soutParler.entendre('Pan ?', 'pan_main');
  },

  // ---------------------------------------------------------------- la pierre au pain : le pain rompu en onze
  pierrePain() {
    const T = this.S(), V = this.V(), w = game.world;
    if (!this.admis()) { ui.subtitle('', '(Une table de pierre. Onze creux usés sur le bord.)', 3); return; }
    if (this.feu()) { ui.subtitle('', '« Tsi ! Lum ! »', 2.2); soutParler.entendre('Tsi ! Lum !', 'feu'); return; }
    if (!farm.count('pain')) { ui.subtitle('', '(Onze creux, usés, sur le bord de la pierre.)', 2.5); return; }
    if (this.rompre) return;
    farm.take('pain', 1);
    const q = w.props[V.pain];
    if (q) farm.setPropData(q, { pain: 1 });
    this.rompre = true;
    for (const e of this.list) { if (e.mort || e.k === 'di') continue; const a = Math.random() * TAU; e.etat = 'pain'; this.aller(e, [V.c[0] + Math.sin(a) * 2.2, V.c[2] + Math.cos(a) * 2.2], 1.1); }
    setTimeout(() => {
      this.rompre = false;
      if (q) farm.setPropData(q, { pain: 0 });
      if (!souterrain.actif) return;
      T.dons = (T.dons || 0) + 1;
      const un = this.list.find((e) => e.k === 'un' && !e.mort);
      if (un) this.dire(un, 'Pan. Onz.', 'pan_don', 3);
      ui.subtitle('', '(Ils le rompent en onze. Une part reste sur la pierre, devant vous.)', 4.5);
      for (const e of this.list) if (e.etat === 'pain') { e.etat = 'retour'; this.aller(e, this.poste(e), 1.0); }
    }, 9000);
  },

  // ---------------------------------------------------------------- les coups (armes) : ils fuient ; un mort, et le hameau se tait pour toujours
  raycast(o, d, maxDist) {
    let best = null;
    const dh = Math.hypot(d[0], d[2]) || 1e-6;
    for (const e of this.list) {
      if (e.mort) continue;
      const cx = e.x - o[0], cz = e.z - o[2], tc = (cx * d[0] + cz * d[2]) / (dh * dh);
      if (tc < 0 || tc > maxDist) continue;
      const px = d[0] * tc - cx, pz = d[2] * tc - cz;
      if (px * px + pz * pz > 0.3 * 0.3) continue;
      const y = o[1] + d[1] * tc, h = 1.75 * e.g.look.height;
      if (y < e.y || y > e.y + h) continue;
      if (!best || tc < best.t) best = { t: tc, s: e, p: [o[0] + d[0] * tc, y, o[2] + d[2] * tc] };
    }
    return best;
  },
  frapper(e, dmg) {
    if (e.mort) return;
    e.hp -= dmg; e.hurtT = 3;
    this.colere = 120;
    sound.hurtHuman && sound.hurtHuman(e.g.voix);
    if (e.hp > 0) { this.dire(e, 'Tsi !!', 'tabou', 2); return; }
    e.mort = true; e.mortT = 0;
    const T = this.S();
    T.mort[e.k] = farm.s.day;
    if (typeof bloodAt === 'function') try { bloodAt(e.x, e.y + 0.5, e.z); } catch (err) { /* rien */ }
  },

  // ---------------------------------------------------------------- dessin
  dessiner(buf, sbuf, cam, t) {
    if (!souterrain.actif) return;
    for (const e of this.list) {
      const dx = e.x - cam[0], dz = e.z - cam[2];
      if (dx * dx + dz * dz > 70 * 70) continue;
      const po = e.pose || 'stand', r = e.rig, st = { move: e.move, phase: e.phase, t: t + e.t, run: po === 'run' };
      if (po === 'sit' || po === 'worksit') st.sit = true;
      if (po === 'work' || po === 'worksit') st.work = true;
      if (po === 'fish') st.fish = true;
      if (po === 'carry') st.carry = true;
      if (po === 'cower') st.cower = true;
      if (po === 'pray') st.pray = true;
      if (e.parleT > 0) st.talk = true;
      if (po === 'stand' && e.dist < 6) { const a = angDiff(e.heading, Math.atan2(game.player.pos[0] - e.x, game.player.pos[2] - e.z)); st.lookY = clamp(a, -1.1, 1.1); st.lookP = -0.1; }
      if (e.k === 'un' && po === 'sit') st.nod = true;
      poseHuman(r, st);
      const fl = (e.hurtT > 2.7 || (game.target && game.target.terre === e)) ? FX_HI : 0;
      if (e.mort) { // (étendu ; au bout d'un moment, on ne le voit plus : ils l'ont emporté)
        if (e.mortT < 40) { const M = e._M || (e._M = [new Float32Array(12), new Float32Array(12), new Float32Array(12)]); m34Root(M[0], e.x, e.y + 0.14, e.z, e.heading, e.g.look.height || 1); m34TR(M[1], 0, 0, 0, -Math.PI / 2, 0, 0); m34Mul(M[2], M[0], M[1]); drawRigM(buf, r, M[2], fl); }
        continue;
      }
      drawRig(buf, r, e.x, e.y, e.z, e.heading, e.g.look.height || 1, fl);
      if (sbuf) drawShadow(sbuf, e.x, e.y, e.z, 0.32 * (e.g.look.height || 1));
    }
  },
  // la pierre verte du jeune
  lumieres(eye) {
    const L = [];
    if (!souterrain.actif) return L;
    const j = this.list.find((e) => e.k === 'di' && !e.mort);
    if (j && Math.hypot(j.x - eye[0], j.z - eye[2]) < 70) {
      const a = j.heading + 0.5;
      L.push({ x: j.x + Math.sin(a) * 0.35, y: j.y + 1.0, z: j.z + Math.cos(a) * 0.35, r: 7, c: [0.12, 0.5, 0.36], d: 0.02 });
    }
    return L;
  },
};
HOOKS.update.push((dt, eye, basis, sky, playing) => { if (farm.s) soutTerres.update(dt, playing); });
HOOKS.draw.push((buf, sbuf, cam, t) => soutTerres.dessiner(buf, sbuf, cam, t));
HOOKS.target.push((eye, f, cand) => soutTerres.cibles(eye, f, cand));
HOOKS.lights.push((eye) => soutTerres.lumieres(eye));
HOOKS.load.push(() => { soutTerres.list = []; soutTerres.pret = false; soutTerres.colere = 0; soutTerres.rompre = false; soutTerres.attente = false; if (farm.s) soutTerres.S(); });
HOOKS.inter.sout_appel = (it) => soutTerres.appeler(it);
HOOKS.inter.sout_pain = () => soutTerres.pierrePain();
HOOKS.inter.sout_enc = (it) => soutParler.lire(it.data.ins);
HOOKS.inter.sout_carnet = () => soutCarnet.prendre();
{
  const _ray = strange.raycast.bind(strange), _hit = strange.hit.bind(strange);
  strange.raycast = function (o, d, maxDist) {
    const a = _ray(o, d, maxDist);
    if (!souterrain.actif || !soutTerres.list.length) return a;
    const b = soutTerres.raycast(o, d, a ? a.t : maxDist);
    return b && (!a || b.t < a.t) ? b : a;
  };
  strange.hit = function (e, dmg, from) { if (e && e.terre) return soutTerres.frapper(e, dmg); return _hit(e, dmg, from); };
}
// quand on dit « nenn », « ouï » (etc.) il faut les avoir entendus : les mots de réponse viennent d'eux

// ---------------------------------------------------------------- le carnet du onzième (dans la cabane vide)
const soutCarnet = {
  PAGES: [
    '3 avril 1872. Descendu par le vieux puits, sous l’éboulement de la mine, contre l’avis de tous. Des galeries plus anciennes que la mine elle-même, taillées sans fer, dirait-on. Je laisse une flèche au charbon à chaque carrefour, la pointe vers le retour.',
    '5 avril. Une lumière verte, loin devant, qui s’est éteinte quand j’ai levé ma lampe. Puis des pas, pieds nus, qui s’éloignaient.',
    '9 avril. Ils ont peur de la flamme. J’ai frappé à une pierre, comme j’avais vu faire. On m’a demandé quelque chose, deux fois. Je n’ai pas compris ; je me suis tu. On m’a pris la main.',
    'Mai ? Je ne sais plus les jours. Ils ne disent pas les noms. Le vieux compte sur ses doigts jusqu’à onze, et il s’arrête sur moi.',
    'Ma lampe est vide. Ils n’aiment pas que j’en parle. On m’a donné une pierre qui luit, quand on l’a portée au jour. Il n’y a pas de jour.',
    'Je note ce qui revient. Lum. Tsi. Pan. Je ne suis sûr de rien. Pan revient chaque fois qu’on me regarde les mains.',
    'Il y a quelque chose à l’est, dans les salles où l’écho répète. Ils se taisent quand on va par là. Hoûm. Il ne faut pas courir.',
    'La mère du petit m’a coupé les cheveux. Le vieux m’a touché l’épaule. Onz. J’ai répondu.',
    'd’sû bô ? onz dôr',
  ],
  prendre() {
    const S = souterrain.S();
    if (S.carnet) { ui.subtitle('', '(La couche est vide. Elle a gardé une forme.)', 3); return; }
    S.carnet = farm.s.day;
    farm.give('carnet_onz', 1);
    play.flyer && play.flyer('carnet_onz', game.player.eyePos(), 1);
    ui.subtitle('', '(Sous la couche, un carnet enveloppé de toile cirée.)', 3.5);
  },
  lire() {
    ui.read('Un carnet de géomètre', this.PAGES.join('\n\n'), 'Les dernières pages sont presque vides. L’écriture y est de plus en plus grande.');
    soutParler.entendre('Lum. Tsi. Pan. Hoûm. Onz.', 'carnet');
  },
};
SOUT_CTX.carnet = 'lu dans le carnet trouvé dans la cabane vide';
HOOKS.primary.push((eye, basis, held, it, id) => {
  if (held) return false;
  if (id === 'carnet_onz') { soutCarnet.lire(); play.cool = 0.4; return true; }
  if (id === 'aiguille_lui') { soutTerres.aiguille(); play.cool = 0.6; return true; }
  if (id === 'baton_encoches') { soutTerres.baton(); play.cool = 0.6; return true; }
  return false;
});

// ---------------------------------------------------------------- l'aiguille (elle montre le hameau), le bâton (il dit le chemin d'en haut)
Object.assign(soutTerres, {
  // où est (x, z) par rapport au regard : en mots
  direction(x, z) {
    const p = game.player, a = angDiff(p.yaw + Math.PI, Math.atan2(x - p.pos[0], z - p.pos[2])), d = Math.hypot(x - p.pos[0], z - p.pos[2]);
    const A = Math.abs(a), cote = a > 0 ? 'à gauche' : 'à droite';
    const dir = A < 0.3 ? 'droit devant vous' : A < 0.9 ? 'un peu ' + cote : A < 2.2 ? cote : A < 2.8 ? 'derrière vous, ' + cote : 'derrière vous';
    const loin = d < 40 ? 'tout près' : d < 160 ? 'pas loin' : d < 500 ? 'loin' : 'très loin';
    return [dir, loin];
  },
  aiguille() {
    const V = this.V();
    if (!souterrain.actif || !V) { ui.subtitle('', '(L’aiguille tourne, lentement, sans jamais s’arrêter.)', 3); return; }
    const [dir, loin] = this.direction(V.c[0], V.c[2]);
    ui.subtitle('', `(L’aiguille frissonne, puis se fixe : ${dir}.)`, 3.5);
    void loin;
  },
  // les sorties connues : le pied du puits, et celles que d'autres modules ajoutent (souterrain.sorties)
  baton() {
    const w = game.world;
    if (!souterrain.actif || !w.sout) { ui.subtitle('', '(Des encoches, des nœuds. Ici, ils ne disent rien.)', 3); return; }
    const L = [w.sout.pied].concat((souterrain.sorties || []).map((s) => s.bas)).filter(Boolean);
    const p = game.player;
    let best = null, bd = 1e9;
    for (const q of L) { const d = Math.hypot(q[0] - p.pos[0], q[2] - p.pos[2]); if (d < bd) { bd = d; best = q; } }
    if (!best) return;
    const [dir, loin] = this.direction(best[0], best[2]);
    ui.subtitle('', `(Sous les doigts, les encoches disent : ${dir}, ${loin}.)`, 3.5);
  },
});

// ---------------------------------------------------------------- les bruits d'en bas (courir, tirer, casser) : pour ceux qui écoutent
Object.assign(souterrain, {
  bruits: [],
  bruit(x, z, k) { if (!this.actif) return; this.bruits.push([game.time, x, z, k]); if (this.bruits.length > 40) this.bruits.shift(); },
  // le plus fort bruit de ces dernières secondes
  bruitRecent(sec) { let m = 0; for (const [t, , , k] of this.bruits) if (game.time - t < sec && k > m) m = k; return m; },
});
{
  const envelopper = (nom, k) => { const f = sound[nom]; if (typeof f !== 'function') return; sound[nom] = function (...a) { try { const p = game.player; if (p && souterrain.actif) souterrain.bruit(p.pos[0], p.pos[2], k); } catch (e) { /* rien */ } return f.apply(this, a); }; };
  envelopper('shot', 3);
  envelopper('land', 0.8);
}
HOOKS.update.push((dt) => {
  if (!souterrain.actif) return;
  const p = game.player;
  souterrain.bruitT = (souterrain.bruitT || 0) - dt;
  if (souterrain.bruitT > 0) return;
  souterrain.bruitT = 0.5;
  const v = Math.hypot(p.vel[0], p.vel[2]);
  if (p.sprinting && v > 3) souterrain.bruit(p.pos[0], p.pos[2], 1.2);
  else if (v > 1.5 && !(p.crouch > 0.5)) souterrain.bruit(p.pos[0], p.pos[2], 0.35);
});
// ---------------------------------------------------------------- dans les grandes salles, le noir porte plus loin (le brouillard recule) ; au hameau, il verdit
Object.assign(souterrain, {
  // la salle (ou le lac) du plan où l'on se trouve vraiment (dans l'ellipse), sinon null
  salleIci(x, z) {
    for (const L of [SOUT_PLAN.salles, SOUT_PLAN.lacs]) for (const [key, cx, cz, rx, rz, rot] of L) {
      const co = Math.cos(rot || 0), si = Math.sin(rot || 0), dx = x - cx, dz = z - cz, lx = dx * co - dz * si, lz = dx * si + dz * co;
      if ((lx / rx) * (lx / rx) + (lz / rz) * (lz / rz) < 1.1) return key;
    }
    return null;
  },
});
{
  const GRANDES = ['nef', 'hameau', 'lac', 'lac_tiede', 'ruines', 'gouffres', 'echos', 'orgues'];
  const _cf = souterrain.cielFx;
  souterrain.cielFx = function (sky) {
    if (_cf) _cf.call(this, sky);
    const p = game.player;
    if (!p) return;
    this._salleT = (this._salleT || 0) - 1;
    if (this._salleT <= 0) { this._salleT = 20; this._salle = this.salleIci(p.pos[0], p.pos[2]); }
    const k = this._salle, big = GRANDES.includes(k) ? 1 : 0, vert = k === 'hameau' ? 1 : 0;
    this._fogK = lerp(this._fogK || 0, big, 0.02); this._vertK = lerp(this._vertK || 0, vert, 0.02);
    sky.fog = [5 + 5 * this._fogK, 78 + 52 * this._fogK];
    sky.amb = [sky.amb[0] - 0.004 * this._vertK, sky.amb[1] + 0.008 * this._vertK, sky.amb[2] + 0.001 * this._vertK];
  };
}
// (l'ombre de là-haut ne doit pas garder la trace des cabanes d'en bas)
souterrain.aBascule.push(() => {
  const w = game.world, V = w && w.soutVillage;
  if (!V || !V.boite) return;
  if (w.shadeDirty && !w.shadeRegion) return;
  const R = w.shadeRegion;
  w.shadeRegion = R ? [Math.min(R[0], V.boite[0]), Math.min(R[1], V.boite[1]), Math.max(R[2], V.boite[2]), Math.max(R[3], V.boite[3])] : V.boite.slice();
  w.shadeDirty = true;
});
