// ============================================================================
//  LES DÉCOUVERTES (agent D15, quinzième vague) — ce que le personnage a vu
//  - Chaque chose rencontrée ouvre sa page (identifiants du wiki : an:, it:, pl:,
//    li:, pnj:, lv:, sys:…) ; chaque information d'une page (un « champ ») ne
//    s'apprend que lorsqu'on l'a vraiment constatée : une bête vue la nuit (ses
//    heures), revue ailleurs (ses milieux), qui vous a blessé ou qui a fui (son
//    danger), abattue (ce qu'elle laisse) ; un objet tenu (sa sorte), vu chez un
//    marchand (son prix), mangé (son effet) ; une plante regardée de près, cueillie ;
//    un habitant à qui l'on a parlé (son métier), vu chez lui (sa demeure)…
//  - Les relevés : une minuterie espacée (0,6 s) sur les bêtes proches, les
//    habitants, ce qu'on regarde, les lieux ; des emballages légers (farm.give,
//    ui.shopPrice, play.eat, play.collect, play.harvest, ui.openTalk, livres.ouvrir,
//    play.hurt, la mort des bêtes). Rien sur w.objects à chaque image.
//  - Mode « interactif » : pour chaque champ appris, trois réponses au choix (une
//    juste, deux leurres tirés des autres fiches, fixes pour une partie) ; la
//    juste → vert ; une fausse se barre en rouge, et l'on attend un instant avant
//    de rechoisir. Mode « exact » : la bonne information s'affiche.
//  État : farm.s.decouvertes ; miroir localStorage 'prairie.decouvertes' (lu par
//  Prairie-Wiki.html). API : decouvertes (contrat : $SP/eq/contrat-v15.md, D15).
// ============================================================================
const D15_CLE = 'prairie.decouvertes', D15_MODE = 'prairie.wiki15';
const D15_ATTENTE = 6000; // ms d'attente après une mauvaise réponse
const D15_DANGER = ['inoffensive', 'se défend', 'dangereuse', 'très dangereuse'];
const D15_OUTILS = { main: 'à la main', hache: 'à la hache', pioche: 'à la pioche', faux: 'à la faux', pelle: 'à la pelle', houe: 'à la houe', cisailles: 'aux cisailles' };
// mots acceptés pour chaque milieu (le joueur écrit avec ses mots)
const D15_MILIEUX = {
  pres: ['pre', 'prairie', 'champ', 'pature', 'herbe'], foret: ['foret', 'bois', 'sous-bois'], bouleaux: ['bouleau', 'bois'], marais: ['marais', 'marecage', 'tourbiere'],
  lande: ['lande', 'bruyere', 'friche'], berges: ['berge', 'lac', 'etang', 'rive', 'bord de l\'eau', 'eau'], riviere: ['riviere', 'ruisseau', 'cours d\'eau', 'eau'],
  alpage: ['alpage', 'estive', 'montagne', 'pelouse'], neiges: ['neige', 'glacier', 'sommet', 'montagne'], sapiniere: ['sapin', 'montagne', 'resineux'],
  combe: ['combe', 'vallon', 'ravin'], rochers: ['rocher', 'roche', 'eboulis', 'montagne', 'falaise'], ville: ['ville', 'village', 'bourg', 'rue'],
  ferme: ['ferme', 'basse-cour', 'etable', 'grange'], souterrain: ['sous terre', 'souterrain', 'mine', 'grotte', 'caverne'],
};

// le texte du joueur : minuscules, sans accents ni ponctuation
function d15Norme(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’`]/g, '\'').replace(/[^a-z0-9' -]+/g, ' ').replace(/\s+/g, ' ').trim(); }
// les mots qui portent le sens d'un nom (« Peau de garou » → peau, garou)
function d15Mots(nom) { return d15Norme(nom).split(/[ '-]+/).filter((m) => m.length >= 4 && !['avec', 'dans', 'pour', 'sous', 'leur', 'une', 'des'].includes(m)); }
// le joueur cite-t-il au moins une de ces choses (noms) ?
function d15Cite(g, noms) { const G = ' ' + d15Norme(g) + ' '; return noms.some((n) => { const M = d15Mots(n); return M.length ? M.some((m) => G.includes(m.slice(0, Math.max(4, m.length - 1)))) : G.includes(' ' + d15Norme(n) + ' '); }); }
function d15Un(g, mots) { const G = ' ' + d15Norme(g) + ' '; return mots.some((m) => G.includes(m)); }

const decouvertes = {
  accueilli: false, ecoute: [], declares: {}, ajouts: [], relT: 0, miroirT: null, cat: null, catT: 0,

  // ------------------------------------------------------------- l'état
  S() {
    const s = typeof farm !== 'undefined' && farm.s;
    if (!s) return { v: 1, partie: '', mode: 'interactif', tout: false, pages: {}, notes: {}, valides: {}, cpt: {} };
    let D = s.decouvertes;
    if (!D || typeof D !== 'object') D = s.decouvertes = { v: 1, qcm: 1 };
    for (const k of ['pages', 'notes', 'valides', 'cpt', 'faux']) if (!D[k] || typeof D[k] !== 'object') D[k] = {};
    if (!D.qcm) this.migrer(D);
    if (D.mode !== 'interactif' && D.mode !== 'exact') D.mode = store.get(D15_MODE, 'interactif') === 'exact' ? 'exact' : 'interactif';
    if (typeof D.tout !== 'boolean') D.tout = false;
    D.v = 1; D.partie = String(s.seed) + '-' + (s.run || 1);
    return D;
  },
  mode() { return this.S().mode; },
  reglerMode(m) { const D = this.S(); D.mode = m === 'exact' ? 'exact' : 'interactif'; store.set(D15_MODE, D.mode); this.change(); },
  connu(id) { const D = this.S(); return !!(D.tout || D.pages[id]); },
  sait(id, k) { const D = this.S(); if (D.tout) return true; const P = D.pages[id]; return !!(P && P.champs && P.champs[k]); },
  page(id) { return this.S().pages[id] || null; },

  // ------------------------------------------------------------- découvrir
  voir(id, k) {
    if (!id || typeof farm === 'undefined' || !farm.s) return false;
    const D = this.S();
    let P = D.pages[id], neuf = false, page = false;
    if (!P) { P = D.pages[id] = { j: farm.s.day || 1, champs: {} }; neuf = page = true; }
    if (!P.champs) P.champs = {};
    if (k && !P.champs[k]) { P.champs[k] = 1; neuf = true; }
    if (neuf) { if (this._fc) this._fc.delete(id); this.change(); for (const fn of this.ecoute) try { fn(id, k, page); } catch (e) { console.error(e); } }
    return neuf;
  },
  // un compteur discret (revoir une bête ailleurs, parler plusieurs jours…)
  compter(id, cle) { const C = this.S().cpt, q = id + '|' + cle; C[q] = (C[q] || 0) + 1; return C[q]; },
  note(id, k, texte) {
    const D = this.S(), t = String(texte || '').slice(0, 240);
    if (!D.notes[id]) D.notes[id] = {};
    if (t) D.notes[id][k] = t; else delete D.notes[id][k];
    if (D.valides[id]) delete D.valides[id][k];
    this.change();
  },
  // (ancienne API) valider un texte : il doit être l'une des trois réponses proposées
  valider(id, k, texte) {
    const n = d15Norme(texte), o = this.options(id, k).find((t) => d15Norme(t) === n);
    return o === undefined ? null : this.choisir(id, k, o);
  },
  // les parties d'avant (réponses écrites) : les justes restent validées, le reste s'efface
  migrer(D) {
    for (const id in D.notes) {
      const N = D.notes[id], V = D.valides[id] || {};
      for (const k in N) if (k !== '_' && V[k] !== true) delete N[k];
    }
    for (const id in D.valides) { const V = D.valides[id]; for (const k in V) if (V[k] !== true) delete V[k]; }
    D.qcm = 1;
  },

  // ------------------------------------------------------------- les trois réponses au choix
  // un tirage fixe pour une page et un champ (les leurres ne bougent pas d'une ouverture à l'autre)
  hasard(graine) { let h = 2166136261; for (const ch of String(graine)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return () => { h = (h + 0x6D2B79F5) | 0; let t = Math.imul(h ^ (h >>> 15), 1 | h); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; },
  // les valeurs que prend ce champ (k, ou '*' : tous) sur les fiches du préfixe (pre, ou '*' : toutes), triées
  reserve(pre, k) {
    if (!this._res || this._resOf !== this.catalogue()) { this._res = new Map(); this._resOf = this.catalogue(); }
    const q = pre + '|' + k;
    let R = this._res.get(q);
    if (!R) {
      const S = new Set();
      for (const id of this._resOf) {
        if (pre !== '*' && !id.startsWith(pre + ':')) continue;
        for (const C of this.ficheCache(id).champs) if ((k === '*' || C.k === k) && C.val) S.add(String(C.val));
      }
      R = [...S].sort();
      this._res.set(q, R);
    }
    return R;
  },
  // quelques leurres de secours, du même domaine
  leurresFixes(k) {
    if (k === 'heures') return ['le jour', 'la nuit', 'à toute heure'];
    if (k === 'danger') return D15_DANGER.slice();
    if (k === 'outil') return Object.values(D15_OUTILS);
    if (k === 'effet') return ['nourrit', 'soigne', 'empoisonne', 'redonne des forces'];
    if (k === 'milieux') return typeof HABITATS !== 'undefined' ? Object.values(HABITATS) : [];
    if (k === 'sorte') return typeof ITEM_CAT_NAMES !== 'undefined' ? Object.values(ITEM_CAT_NAMES) : [];
    return [];
  },
  // [trois textes] : la bonne réponse et deux leurres (C.choix d'abord, s'il y en a), la bonne à une place tirée au sort
  options(id, k) {
    const C = this.ficheCache(id).champs.find((c) => c.k === k);
    if (!C || !C.val) return [];
    const O = this._opt || (this._opt = new Map()), q = id + '|' + k + '|' + C.val;
    if (O.has(q)) return O.get(q);
    const r = this.hasard(q), juste = String(C.val), nj = d15Norme(juste);
    const parts = (t) => String(t).split(/[,;]/).map(d15Norme).filter(Boolean), PJ = new Set(parts(juste));
    const melange = (L) => { const A = L.slice(); for (let i = A.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [A[i], A[j]] = [A[j], A[i]]; } return A; };
    const pris = [], deja = new Set([nj]);
    // exigence 2 : aucun morceau en commun avec la bonne réponse (« la forêt » n'est pas un leurre de « les prés, la forêt ») ;
    // 1 : ni une partie, ni un surplus de la bonne réponse ; 0 : seulement différente
    const prendre = (L, ex) => {
      for (const t of melange(L)) {
        if (pris.length >= 2) return;
        const n = d15Norme(t); if (!n || deja.has(n)) continue;
        const P = parts(t), com = P.filter((x) => PJ.has(x)).length;
        if (ex === 2 && com) continue;
        if (ex === 1 && (com === P.length || com === PJ.size)) continue;
        pris.push(String(t)); deja.add(n);
      }
    };
    let leurres = [];
    if (k === 'prix') {
      const p = +(juste.match(/\d+/) || [0])[0], N = new Set();
      for (const m of [0.4, 0.5, 0.6, 1.6, 2, 2.5, 3, 4, 5]) { const n = Math.max(1, Math.round(p * m)); if (Math.abs(n - p) >= Math.max(1, p * 0.3)) N.add(n); }
      leurres = [...N].map((n) => `${n} pièce${n > 1 ? 's' : ''}`);
    }
    const pre = id.slice(0, id.indexOf(':'));
    // les autres champs de la même fiche : ceux de la même famille d'abord (tablette1, tablette2…)
    const fam = (x) => (/\d$/.test(x) ? x.replace(/\d+$/, '') : ''), voisins = (meme) => this.ficheCache(id).champs.filter((c) => c.k !== k && (fam(c.k) === fam(k)) === meme).map((c) => c.val);
    const sources = [() => C.choix || [], () => leurres, () => this.reserve(pre, k), () => this.reserve('*', k), () => this.leurresFixes(k), () => voisins(true), () => voisins(false), () => this.reserve(pre, '*')];
    for (const ex of [2, 1, 0]) for (const L of sources) if (pris.length < 2) prendre(L() || [], ex);
    const R = pris.slice(0, 2);
    R.splice(Math.floor(r() * (R.length + 1)), 0, juste);
    O.set(q, R);
    return R;
  },
  // le joueur choisit : juste → vert ; faux → barré, et une petite attente
  choisir(id, k, texte) {
    const D = this.S(), C = this.ficheCache(id).champs.find((c) => c.k === k);
    if (!C || !C.val || !this.sait(id, k) || this.attend(id, k) || (D.valides[id] || {})[k] === true) return null;
    if (this.barres(id, k).some((t) => d15Norme(t) === d15Norme(texte))) return null;
    const ok = d15Norme(texte) === d15Norme(C.val);
    if (!D.valides[id]) D.valides[id] = {};
    D.valides[id][k] = ok;
    if (ok) {
      (D.notes[id] || (D.notes[id] = {}))[k] = String(C.val);
      if (D.faux[id]) { delete D.faux[id][k]; if (!Object.keys(D.faux[id]).length) delete D.faux[id]; }
    } else {
      const F = D.faux[id] || (D.faux[id] = {}), L = F[k] || (F[k] = []);
      if (!L.includes(String(texte))) L.push(String(texte));
      (this.attente || (this.attente = {}))[id + '|' + k] = performance.now() + D15_ATTENTE;
    }
    this.change();
    return ok;
  },
  attend(id, k) { const t = this.attente && this.attente[id + '|' + k]; return t && t > performance.now() ? t - performance.now() : 0; },
  barres(id, k) { const F = this.S().faux[id]; return (F && F[k]) || []; },
  toutDebloquer(on) { const D = this.S(); D.tout = on !== false; this.change(); },
  change() { clearTimeout(this.miroirT); this.miroirT = setTimeout(() => this.miroir(), 1200); if (this.surChange) try { this.surChange(); } catch (e) { console.error(e); } },
  miroir() {
    const D = this.S();
    // le wiki du site (W15) range ses lignes sous ses propres champs (vue/vu/lu, jour/nuit, dedans) : on les ajoute
    const pages = {}, notes = {}, valides = {}, alias = (id) => { const pre = id.slice(0, id.indexOf(':')); return pre === 'an' || pre === 'pl' ? 'vue' : pre === 'it' || pre === 'li' || pre === 'pnj' ? 'vu' : pre === 'lv' ? 'lu' : null; };
    const jn = (id) => { const H = this.ficheCache(id).champs.find((c) => c.k === 'heures'); return !H ? [] : H.val === 'la nuit' ? ['nuit'] : H.val === 'le jour' ? ['jour'] : ['jour', 'nuit']; };
    for (const id in D.pages) {
      const P = D.pages[id], ch = Object.assign({}, P.champs || {}), a = alias(id);
      if (a) ch[a] = 1;
      if (ch.heures && id.startsWith('an:')) for (const k of jn(id)) ch[k] = 1;
      if ((ch.habitants || ch.travail) && id.startsWith('li:')) ch.dedans = 1;
      pages[id] = { j: P.j, champs: ch };
    }
    for (const [src, dst] of [[D.notes, notes], [D.valides, valides]]) for (const id in src) {
      const o = dst[id] = Object.assign({}, src[id]);
      if (o.heures !== undefined && id.startsWith('an:')) for (const k of jn(id)) o[k] = o.heures;
    }
    store.set(D15_CLE, { v: 1, partie: D.partie, mode: D.mode, tout: D.tout, pages, notes, valides });
  },
  // apprendre un champ que la fiche connaît (sinon : la page seulement)
  apprendre(id, k) { if (this.ficheCache(id).champs.some((c) => c.k === k)) return this.voir(id, k); return this.voir(id); },
  // une autre équipe déclare une page à elle (sys:…, it:…) avec ses champs
  declarer(id, def) { this.declares[id] = def; this.cat = null; },
  ajouterChamps(cle, fn) { this.ajouts.push({ cle, fn }); },

  // ------------------------------------------------------------- les fiches, tirées des tables du jeu
  monde() { return (typeof zone !== 'undefined' && zone.dedans && zone.vallee) || (typeof farm !== 'undefined' && farm.w) || game.world; },
  ot(id) { if (!this._ot) { this._ot = {}; for (const t of OBJ_TYPES) this._ot[t.id] = t; } return this._ot[id]; },
  espece(k) { return ESPECES_ANIMAUX.find((e) => e[0] === k) || null; },
  milieuxPlante(id) {
    const e = ESPECES_PLANTES.find((x) => x[0] === id) || (typeof ESPECES_ARBRES !== 'undefined' && ESPECES_ARBRES.find((x) => x[0] === id));
    return e ? e[1] : null;
  },
  nomBete(k) {
    if (k === 'ver') return 'Le Ver';
    if (typeof V2_ESPECES !== 'undefined' && V2_ESPECES[k]) return d15Cap(V2_ESPECES[k].titre || V2_ESPECES[k].nom);
    const e = this.espece(k); if (e) return e[1];
    const t = OBJ_TYPES.find((o) => o.animal === k); if (t) return t.name;
    for (const i in ITEMS) if (ITEMS[i].animal === k) return ITEMS[i].name;
    return k === 'bete' ? 'La Bête' : d15Cap(k.replace(/_/g, ' '));
  },
  nomLieu(k) {
    const w = this.monde(), L = (w && w.lm && w.lm[k]) || (w && w.bld && w.bld[k]);
    const n = (typeof LIEU_NAMES !== 'undefined' && LIEU_NAMES[k]) || (L && L.name) || k;
    return d15Cap(/^vide\d*$/.test(n) ? 'Maison vide' : n);
  },
  nomPnj(id) { const n = typeof npcs !== 'undefined' && npcs.byId[id], d = NPC_DATA.find((q) => q.id === id); if (n && n.name) return `${n.name}${d && d.surname ? ' ' + d.surname : ''}`; return d ? `${(d.names || [])[0] || ''} ${d.surname || ''}`.trim() : id; },
  livre(b) { if (typeof LIVRES !== 'undefined' && LIVRES[b]) return LIVRES[b]; try { return typeof livres !== 'undefined' && livres.def ? livres.def(b) : null; } catch (e) { return null; } },
  idLivre(b) { return ITEMS['livre_' + b] ? 'it:livre_' + b : 'lv:' + b; },

  // { titre, sous, icone (url ou signe), lead, groupe, champs: [{ k, nom, val, test }] }
  fiche(id) {
    const i = id.indexOf(':'), pre = id.slice(0, i), k = id.slice(i + 1);
    let F = null;
    try {
      if (this.declares[id]) { const d = this.declares[id]; F = { titre: d.titre || id, sous: d.sous || '', icone: d.icone || '✧', lead: d.lead || '', groupe: d.groupe || 'autres', champs: (d.champs || []).slice() }; }
      else if (pre === 'an') F = this.ficheBete(k);
      else if (pre === 'it') F = this.ficheObjet(k);
      else if (pre === 'pl') F = this.fichePlante(k);
      else if (pre === 'li') F = this.ficheLieu(k);
      else if (pre === 'pnj') F = this.fichePnj(k);
      else if (pre === 'lv') F = this.ficheLivre(k);
      else if (pre === 'zone' && typeof V1_REGIONS !== 'undefined' && V1_REGIONS[k]) F = { titre: d15Cap(V1_REGIONS[k].nom), sous: 'Terres d’Avant', icone: '⛰', lead: '', groupe: 'lieux', champs: [] };
    } catch (e) { console.error('decouvertes', id, e); }
    if (!F) F = { titre: d15Cap(k.replace(/[_-]/g, ' ')), sous: '', icone: '✧', lead: '', groupe: 'autres', champs: [] };
    for (const A of this.ajouts) if (A.cle === id || A.cle === pre || A.cle === pre + ':') try { F.champs.push(...(A.fn(id) || [])); } catch (e) { /* */ }
    return F;
  },
  ficheBete(k) {
    const V2 = typeof V2_ESPECES !== 'undefined' && V2_ESPECES[k], c = CREATURES[k] || {}, e = this.espece(k), ch = [];
    const it = Object.keys(ITEMS).find((i) => ITEMS[i].animal === k);
    const F = { titre: this.nomBete(k), sous: V2 ? 'Terres d’Avant' : k === 'ver' ? 'Terres d’Avant' : c.boss ? 'Créature' : 'Bête', icone: it ? iconURL(it) : '🐾', groupe: 'betes', champs: ch };
    // les heures
    let nuit = !!(c.night || c.nuit || c.nightFly), tout = false;
    if (V2 && V2.heures) { const [a, b] = V2.heures; tout = a === 0 && b === 24; nuit = !tout && a > b; }
    if (k === 'ver') { nuit = false; }
    const vh = tout ? 'à toute heure' : nuit ? 'la nuit' : 'le jour';
    ch.push({ k: 'heures', nom: 'Quand on la voit', val: vh, test: (g) => tout ? d15Un(g, ['tout', 'toujours', 'jour et nuit', 'nuit et jour', 'n\'importe']) : nuit ? d15Un(g, ['nuit', 'nocturne', 'soir', 'crepuscule']) && !d15Un(g, [' le jour ', 'diurne']) : d15Un(g, ['jour', 'diurne', 'matin', 'journee']) && !d15Un(g, ['nocturne']) });
    // les milieux
    if (e && e[2] && e[2].length) {
      const H = e[2];
      ch.push({ k: 'milieux', nom: 'Où elle vit', val: H.map((h) => HABITATS[h] || h).join(', '), test: (g) => H.some((h) => d15Un(g, D15_MILIEUX[h] || [d15Norme(h)])) });
    } else if (V2 || k === 'ver') {
      ch.push({ k: 'milieux', nom: 'Où elle vit', val: 'derrière la Grande Porte', test: (g) => d15Un(g, ['porte', 'terres', 'avant', 'zone', 'derriere']) });
    }
    // le danger
    const dg = V2 ? (V2.nature === 'hostile' ? 2 : 0) : k === 'ver' ? 3 : e ? e[4] : c.boss ? 3 : c.dmg ? 2 : 0;
    const NON = ['inoffensi', 'farouche', 'fuit', 'craintif', 'peureu', 'sans danger', 'pas dangereu', 'paisible', 'docile', 'calme'], OUI = ['dangereu', 'attaque', 'mord', 'agressi', 'feroce', 'hostile', 'tue', 'mortel', 'charge', 'blesse'];
    ch.push({ k: 'danger', nom: 'Danger', val: V2 && V2.nature === 'aide' ? 'elle aide, à sa façon' : D15_DANGER[dg] || 'dangereuse', test: (g) => dg >= 2 ? d15Un(g, OUI) && !d15Un(g, ['pas dangereu', 'inoffensi']) : dg === 1 ? d15Un(g, ['defend', 'charge', 'mord', 'coince', 'peu dangereu', 'inoffensi']) : d15Un(g, NON) || (V2 && V2.nature === 'aide' && d15Un(g, ['aide', 'amical', 'guide'])) });
    // ce qu'elle laisse
    let drop = [];
    if (V2 && V2.butin && typeof LOOT !== 'undefined' && LOOT[V2.butin]) drop = LOOT[V2.butin].items.map((q) => q[0]).filter((q) => ITEMS[q]);
    else if (PREY[k] && PREY[k].drop) drop = PREY[k].drop.map((q) => q[0]).filter((q) => ITEMS[q]);
    if (drop.length) { const N = drop.map(itemName); ch.push({ k: 'depouille', nom: 'Ce qu’elle laisse', val: N.join(', '), test: (g) => d15Cite(g, N) }); }
    if (typeof NOTICE_ANIMAUX !== 'undefined' && NOTICE_ANIMAUX[k]) F.lead = NOTICE_ANIMAUX[k];
    else if (typeof V2_CARNET !== 'undefined' && V2_CARNET[k]) F.lead = [].concat(V2_CARNET[k]).join(' ');
    F.leadFin = true; // la notice se lit quand on sait tout
    return F;
  },
  ficheObjet(id) {
    const it = ITEMS[id];
    if (!it) return null;
    const ch = [], CN = typeof ITEM_CAT_NAMES !== 'undefined' ? ITEM_CAT_NAMES : {};
    const F = { titre: it.name || id, sous: CN[it.cat] || '', icone: iconURL(id), lead: it.desc || '', groupe: it.book ? 'livres' : 'objets', champs: ch };
    const cn = CN[it.cat] || it.cat || '';
    if (cn) ch.push({ k: 'sorte', nom: 'Sorte', val: cn, test: (g) => d15Cite(g, [cn]) || d15Norme(g) === d15Norme(cn) });
    if (it.price > 0) ch.push({ k: 'prix', nom: 'Prix', val: `${it.price} pièce${it.price > 1 ? 's' : ''}`, test: (g) => { const m = d15Norme(g).match(/\d+/); if (!m) return false; const n = +m[0]; return Math.abs(n - it.price) <= Math.max(2, it.price * 0.25); } });
    const A = [], T = [];
    if (it.food > 0) { A.push('nourrit'); T.push(['nourri', 'faim', 'rassasi', 'cale', 'mange']); }
    if (it.heal > 0) { A.push('soigne'); T.push(['soign', 'guer', 'vie', 'sante', 'blessure']); }
    if (it.heal < 0 || it.poison) { A.push('empoisonne'); T.push(['poison', 'empoison', 'toxique', 'malade', 'mortel']); }
    if (it.stamina) { A.push('redonne des forces'); T.push(['force', 'endurance', 'souffle', 'energie', 'fatigue']); }
    if (it.raw) { A.push('cru, il peut rendre malade'); T.push(['malade', 'cru', 'nausee']); }
    if (A.length) ch.push({ k: 'effet', nom: 'Quand on le mange', val: A.join(', '), test: (g) => T.some((L) => d15Un(g, L)) });
    if (it.book) { const b = this.livre(it.book); if (b && b.auteur) ch.push(this.champAuteur(b)); F.groupe = 'livres'; }
    return F;
  },
  champAuteur(b) { return { k: 'auteur', nom: 'Auteur', val: b.auteur, test: (g) => d15Cite(g, [b.auteur]) }; },
  ficheLivre(b) {
    const L = this.livre(b);
    if (!L) return null;
    const ch = [];
    if (L.auteur) ch.push(this.champAuteur(L));
    return { titre: L.titre || b, sous: 'Livre', icone: '📖', lead: L.desc || '', groupe: 'livres', champs: ch };
  },
  fichePlante(id) {
    const t = this.ot(id);
    if (!t) return null;
    const ch = [], H = this.milieuxPlante(id), R = HARVEST[id];
    const arbre = t.cat === 'Arbres' || (typeof ESPECES_ARBRES !== 'undefined' && ESPECES_ARBRES.some((x) => x[0] === id));
    const drop = R && R.drop ? R.drop.map((q) => q[0]).filter((q) => ITEMS[q]) : [];
    const F = { titre: t.name || id, sous: arbre ? 'Arbre' : t.cat === 'Champignons' ? 'Champignon' : 'Plante', icone: drop[0] ? iconURL(drop[0]) : arbre ? '🌳' : '✿', groupe: arbre ? 'arbres' : 'plantes', champs: ch };
    if (H && H.length) ch.push({ k: 'milieux', nom: 'Où elle pousse', val: H.map((h) => HABITATS[h] || h).join(', '), test: (g) => H.some((h) => d15Un(g, D15_MILIEUX[h] || [d15Norme(h)])) });
    if (R && R.tool) { const o = D15_OUTILS[R.tool] || R.tool; ch.push({ k: 'outil', nom: 'Comment on la prend', val: o, test: (g) => R.tool === 'main' ? d15Un(g, ['main', 'cueill', 'ramass', 'arrach']) : d15Un(g, [R.tool]) }); }
    if (drop.length) { const N = drop.map(itemName); ch.push({ k: 'recolte', nom: 'Ce qu’on en tire', val: N.join(', '), test: (g) => d15Cite(g, N) }); }
    const NP = (typeof NOTICE_PLANTES !== 'undefined' && NOTICE_PLANTES[id]) || (typeof NOTICE_ARBRES !== 'undefined' && NOTICE_ARBRES[id]);
    if (NP) { F.lead = NP; F.leadFin = true; }
    return F;
  },
  ficheLieu(k) {
    const w = this.monde(), ch = [];
    const L = w && w.lm && w.lm[k], B = w && w.bld && w.bld[k];
    if (!L && !B) return null;
    const vit = NPC_DATA.filter((d) => d.home === k).map((d) => d.id), tra = NPC_DATA.filter((d) => d.work === k && d.home !== k).map((d) => d.id);
    if (vit.length) { const N = vit.map((q) => this.nomPnj(q)); ch.push({ k: 'habitants', nom: 'Qui y vit', val: N.join(', '), test: (g) => d15Cite(g, N.concat(vit.map((q) => (NPC_DATA.find((d) => d.id === q) || {}).role || ''))) }); }
    if (tra.length) { const N = tra.map((q) => this.nomPnj(q)); ch.push({ k: 'travail', nom: 'Qui y travaille', val: N.join(', '), test: (g) => d15Cite(g, N.concat(tra.map((q) => (NPC_DATA.find((d) => d.id === q) || {}).role || ''))) }); }
    const sous = L ? (L.under ? 'Sous la terre' : L.fish ? 'Eaux' : (L.r || 0) >= 100 ? 'Contrée' : 'Lieu-dit') : 'Bâtiment';
    return { titre: this.nomLieu(k), sous, icone: L ? (L.under ? '⛏' : L.fish ? '≈' : '⌖') : '⌂', lead: '', groupe: 'lieux', champs: ch };
  },
  fichePnj(id) {
    const d = NPC_DATA.find((q) => q.id === id);
    if (!d) return null;
    const ch = [];
    if (d.role) ch.push({ k: 'metier', nom: 'Métier', val: d.role, test: (g) => d15Cite(g, [d.role]) });
    if (d.home) { const n = this.nomLieu(d.home); ch.push({ k: 'demeure', nom: 'Où il vit', val: n, test: (g) => d15Cite(g, [n]) || d15Un(g, [d15Norme(d.home)]) }); }
    if (d.traits && d.traits.length) ch.push({ k: 'caractere', nom: 'Son caractère', val: d.traits.join(', '), test: (g) => d15Cite(g, d.traits) });
    return { titre: this.nomPnj(id), sous: d.role || '', icone: '☺', lead: '', groupe: 'habitants', champs: ch };
  },

  // ------------------------------------------------------------- le catalogue (pour les comptes et « tout débloquer »)
  catalogue() {
    if (this.cat && performance.now() - this.catT < 20000) return this.cat;
    const L = [], w = this.monde(), vu = new Set(), add = (id) => { if (!vu.has(id)) { vu.add(id); L.push(id); } };
    for (const k of Object.keys(CREATURES)) add('an:' + k);
    if (typeof V2_ORDRE !== 'undefined') for (const k of V2_ORDRE) add('an:' + k);
    if (typeof dragonV3 !== 'undefined') add('an:ver');
    for (const id of Object.keys(ITEMS)) add('it:' + id);
    const fl = [...ESPECES_PLANTES.map((e) => e[0]), ...(typeof ESPECES_ARBRES !== 'undefined' ? ESPECES_ARBRES.map((e) => e[0]) : []), ...OBJ_TYPES.filter((t) => /^(Arbres|Fleurs|Champignons|Végétation)$/.test(t.cat || '') && !t.animal).map((t) => t.id)];
    for (const id of fl) if (this.ot(id)) add('pl:' + id);
    if (w) { for (const k of Object.keys(w.lm || {})) add('li:' + k); for (const k of Object.keys(w.bld || {})) add('li:' + k); }
    if (typeof V1_REGIONS !== 'undefined') for (const k of Object.keys(V1_REGIONS)) add('zone:' + k);
    for (const d of NPC_DATA) add('pnj:' + d.id);
    if (typeof LIVRES !== 'undefined') for (const b of Object.keys(LIVRES)) if (!ITEMS['livre_' + b]) add('lv:' + b);
    for (const id of Object.keys(this.declares)) add(id);
    this.cat = L; this.catT = performance.now();
    return L;
  },

  // ------------------------------------------------------------- les relevés (toutes les 0,6 s)
  releve(dt, eye, basis, sky) {
    this.relT -= dt;
    if (this.relT > 0 || !farm.s || !game.player) return;
    this.relT = 0.6;
    const p = game.player, f = basis ? basis.f : [0, 0, -1], nuit = sky ? sky.night > 0.5 : false;
    const vue = (x, y, z, R, cos) => { const dx = x - eye[0], dz = z - eye[2], d = Math.hypot(dx, dz); if (d > R) return false; if (d < 2.5) return true; return (dx * f[0] + dz * f[2]) / d > cos; };
    // les bêtes de la vallée
    if (!(typeof zone !== 'undefined' && zone.dedans)) {
      for (const e of entities.list) {
        if (e.hidden || e.far || e.removed) continue;
        const R = (e.cfg && (e.cfg.boss || (e.h || 1) > 1.2)) ? 26 : 16;
        if (!vue(e.x, e.y, e.z, R, 0.55)) continue;
        this.bete(e.kind, nuit, e);
      }
      // les habitants
      if (typeof npcs !== 'undefined') for (const n of npcs.list) {
        if (!n.st || !n.st.alive || n.hidden) continue;
        if (!vue(n.x, n.y || 0, n.z, 9, 0.5)) continue;
        this.voir('pnj:' + n.id);
        const d = NPC_DATA.find((q) => q.id === n.id), w = this.monde(), B = d && d.home && w.bld && w.bld[d.home];
        if (B && Math.hypot(n.x - B.x, n.z - B.z) < 14 && Math.hypot(p.pos[0] - B.x, p.pos[2] - B.z) < 18) { this.apprendre('pnj:' + n.id, 'demeure'); this.apprendre('li:' + d.home, 'habitants'); }
        if (d && d.work && w.bld && w.bld[d.work] && d.work !== d.home) { const W = w.bld[d.work]; if (Math.hypot(n.x - W.x, n.z - W.z) < 14 && Math.hypot(p.pos[0] - W.x, p.pos[2] - W.z) < 18) this.apprendre('li:' + d.work, 'travail'); }
      }
      // les lieux (un sur deux relevés suffit)
      this.lieuxT = (this.lieuxT || 0) + 1;
      if (this.lieuxT % 2 === 0) {
        const w = this.monde(), x = p.pos[0], z = p.pos[2];
        if (w && w.lm) for (const k in w.lm) { const L = w.lm[k]; if (L && Math.hypot(L.x - x, L.z - z) < Math.max(10, Math.min(L.r || 10, 120))) this.voir('li:' + k); }
        if (w && w.bld) for (const k in w.bld) { const B = w.bld[k]; if (B && Math.hypot(B.x - x, B.z - z) < 12) this.voir('li:' + k); }
      }
    } else {
      // dans la Zone : les régions, et les bêtes de V2
      try { const r = zone.region(p.pos[0], p.pos[2]); if (r) this.voir('zone:' + r); } catch (e) { /* */ }
    }
    if (typeof creaturesV2 !== 'undefined' && creaturesV2.vivantes) for (const e of creaturesV2.vivantes) {
      if (e.mort || e.cache || e.removed) continue;
      if (!vue(e.x, e.y, e.z, e.D && e.D.vol ? 40 : 24, 0.55)) continue;
      this.bete(e.esp, nuit, e);
    }
    if (typeof dragonV3 !== 'undefined' && farm.s.v3) { const S = farm.s.v3; if (S.vu > 0) this.voir('an:ver'); if (S.attaques > 0) this.apprendre('an:ver', 'danger'); }
    // ce qu'on regarde de près (une plante, un arbre)
    try {
      const w = game.world, oh = w && w.raycastObjects ? w.raycastObjects(eye, f, 7, true) : null;
      if (oh && oh.obj) { const t = OBJ_TYPES[oh.obj.t]; if (t && !t.animal && this.ot(t.id) && this.catalogueA('pl:' + t.id)) this.plante(t.id, oh.obj); }
    } catch (e) { /* */ }
  },
  catalogueA(id) { if (!this._catSet || this._catSetOf !== this.cat) { this.catalogue(); this._catSet = new Set(this.cat); this._catSetOf = this.cat; } return this._catSet.has(id); },
  bete(kind, nuit, e) {
    const id = 'an:' + kind;
    this.voir(id);
    const F = this.ficheCache(id);
    const H = F.champs.find((c) => c.k === 'heures');
    if (H && (H.val === 'à toute heure' || (H.val === 'la nuit') === nuit)) this.apprendre(id, 'heures');
    // revue ailleurs : ses milieux
    if (!this.sait(id, 'milieux') && e) {
      const D = this.S(), q = D.cpt[id + '|o'];
      const ici = Math.round(e.x / 120) + ',' + Math.round(e.z / 120);
      if (q && q !== ici) this.apprendre(id, 'milieux'); else D.cpt[id + '|o'] = ici;
    }
    // elle a fui devant vous : elle n'est pas bien dangereuse
    if (e && (e.state === 'flee' || e.scaredT > 0 || e.fuit)) { const F2 = F.champs.find((c) => c.k === 'danger'); if (F2 && /inoffensive|se défend/.test(F2.val)) this.apprendre(id, 'danger'); }
  },
  plante(id, o) {
    const pid = 'pl:' + id;
    this.voir(pid);
    if (!this.sait(pid, 'milieux') && o) {
      const D = this.S(), q = D.cpt[pid + '|o'], ici = Math.round(o.x / 150) + ',' + Math.round(o.z / 150);
      if (q && q !== ici) this.apprendre(pid, 'milieux'); else D.cpt[pid + '|o'] = ici;
    }
  },
  ficheCache(id) { const C = this._fc || (this._fc = new Map()); let F = C.get(id); if (!F) { F = this.fiche(id); C.set(id, F); } return F; },
  tuee(kind) { const id = 'an:' + kind; this.voir(id); if (this.ficheCache(id).champs.some((c) => c.k === 'depouille')) this.apprendre(id, 'depouille'); },

  // ------------------------------------------------------------- une partie d'avant nous rejoint
  rattraper() {
    const s = farm.s, D = this.S();
    if (D.rattrape) return;
    D.rattrape = 1;
    const j = s.day || 1, mk = (id, ks) => { const P = D.pages[id] || (D.pages[id] = { j, champs: {} }); for (const k of ks || []) P.champs[k] = 1; };
    for (const id of Object.keys(s.inv || {})) if (ITEMS[id]) mk('it:' + id, ['sorte']);
    for (const id of Object.keys(s.npcs || {})) if (s.npcs[id] && s.npcs[id].met) mk('pnj:' + id, ['metier']);
    const T = s.chasse && s.chasse.tableau; if (T) for (const k of Object.keys(T)) mk('an:' + k);
    if (s.v2 && s.v2.vus) for (const k of Object.keys(s.v2.vus)) mk('an:' + k);
    if (s.v3 && s.v3.vu > 0) mk('an:ver');
    if (s.animals) for (const a of s.animals) if (a && a.kind) mk('an:' + a.kind);
    const w = this.monde();
    if (w && w.farm && w.bld && w.bld.ferme) mk('li:ferme');
    this.change();
  },
};
function d15Cap(t) { t = String(t || ''); return t.charAt(0).toUpperCase() + t.slice(1); }

// ---------------------------------------------------------------- les emballages
HOOKS.load.push(() => {
  try { decouvertes.cat = null; decouvertes._fc = null; decouvertes._opt = null; decouvertes._res = null; decouvertes.attente = {}; decouvertes.S(); decouvertes.rattraper(); decouvertes.miroir(); } catch (e) { console.error('decouvertes', e); }
  if (decouvertes.branche) return;
  decouvertes.branche = true;
  const D = decouvertes, garde = (fn) => { try { fn(); } catch (e) { console.error('decouvertes', e); } };
  // tenir un objet
  const _give = farm.give.bind(farm);
  farm.give = function (id, n = 1) { const r = _give(id, n); if (n > 0 && ITEMS[id]) garde(() => { D.apprendre('it:' + id, 'sorte'); if (ITEMS[id].book) D.voir('it:' + id); }); return r; };
  // un prix lu chez un marchand
  if (typeof ui.shopPrice === 'function') { const _sp = ui.shopPrice.bind(ui); ui.shopPrice = function (n, id, base, buying) { const r = _sp(n, id, base, buying); garde(() => { if (ITEMS[id]) D.apprendre('it:' + id, 'prix'); }); return r; }; }
  // manger
  const _eat = play.eat.bind(play);
  play.eat = function (id) { const avant = farm.count(id); const r = _eat(id); garde(() => { if (farm.count(id) < avant && D.ficheCache('it:' + id).champs.some((c) => c.k === 'effet')) D.apprendre('it:' + id, 'effet'); }); return r; };
  // cueillir, couper
  const plante = (o, fini) => garde(() => { const t = o && OBJ_TYPES[o.t]; if (!t || !D.catalogueA('pl:' + t.id)) return; D.plante(t.id, o); D.apprendre('pl:' + t.id, 'outil'); if (fini) D.apprendre('pl:' + t.id, 'recolte'); });
  const _col = play.collect.bind(play);
  play.collect = function (o, idx, H, p) { const r = _col(o, idx, H, p); plante(o, true); return r; };
  const _har = play.harvest.bind(play);
  play.harvest = function (o, idx, H, dmg, p) { const r = _har(o, idx, H, dmg, p); plante(o, !!o.gone || !!(farm.s.removed && farm.s.removed[idx])); return r; };
  // parler
  const _ot = ui.openTalk.bind(ui);
  ui.openTalk = function (n) { const r = _ot(n); garde(() => { const id = 'pnj:' + n.id; D.apprendre(id, 'metier'); if (D.compter(id, 'j' + farm.s.day) === 1 && D.compter(id, 'jours') >= 3) D.apprendre(id, 'caractere'); }); return r; };
  // lire
  if (typeof livres !== 'undefined' && livres.ouvrir) { const _lo = livres.ouvrir.bind(livres); livres.ouvrir = function (id, o) { const r = _lo(id, o); garde(() => { if (r !== false) { const pid = D.idLivre(id); D.voir(pid); if (D.ficheCache(pid).champs.some((c) => c.k === 'auteur')) D.apprendre(pid, 'auteur'); } }); return r; }; }
  // être blessé par une bête
  const _hurt = play.hurt.bind(play);
  play.hurt = function (dmg, src, cause) { garde(() => { const k = src && (src.esp || src.kind); if (k && (CREATURES[k] || (typeof V2_ESPECES !== 'undefined' && V2_ESPECES[k]))) D.apprendre('an:' + k, 'danger'); }); return _hurt(dmg, src, cause); };
  // abattre une bête
  const _hc = play.hurtCreature.bind(play);
  play.hurtCreature = function (e, dmg, eye) { const r = _hc(e, dmg, eye); garde(() => { if (e && e.dead) D.tuee(e.kind); }); return r; };
  if (typeof chasse !== 'undefined' && chasse.abattre) { const _ab = chasse.abattre.bind(chasse); chasse.abattre = function (e, par) { const r = _ab(e, par); garde(() => { if (e && (!par || par === 'joueur')) D.voir('an:' + e.kind); }); return r; }; }
  if (typeof chasse !== 'undefined' && chasse.depecer) { const _dp = chasse.depecer.bind(chasse); chasse.depecer = function (e) { const r = _dp(e); garde(() => { if (e && e.kind) D.tuee(e.kind); }); return r; }; }
  if (typeof creaturesV2 !== 'undefined' && creaturesV2.mourir) { const _m = creaturesV2.mourir.bind(creaturesV2); creaturesV2.mourir = function (e, sans, par) { const r = _m(e, sans, par); garde(() => { if (e && e.esp && !par) D.tuee(e.esp); }); return r; }; }
  // les relevés (marqués pour tourner aussi dans la Zone)
  const rel = (dt, eye, basis, sky) => { if (game.kind === 'farm' && farm.s) garde(() => D.releve(dt, eye, basis, sky)); };
  rel.zone = true;
  HOOKS.update.push(rel);
});
