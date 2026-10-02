// ============================================================================
//  LANGUE : le jeu en français (d'origine) ou en anglais. Réglage settings.lang
//  ('fr' par défaut, enregistré avec les options), choisi dans Options ou dans
//  le menu (bouton « English » / « Français ») ; bascule à chaud.
//  - T(texte) (fonction du socle, remplacée ici) : correspondance exacte (espaces
//    normalisés), gabarits ({0}…, {fermier}, {npc:x}… : ce qui occupe leur place
//    est traduit à son tour), puis découpes (lignes, « — », « · », parenthèses,
//    ponctuation et nombres autour, casse), sinon le texte d'origine.
//    Données : I18N_EN (14-i18n-en.js, généré par tools/i18n-build.js).
//  - Le document est traduit par un MutationObserver (nœuds texte, title,
//    placeholder, texte CSS « content ») avec un cache ; le français d'origine de
//    chaque nœud est gardé pour revenir en arrière sans recharger. Rien par image.
//  - Retouches ciblées : paroles qui s'écrivent (ui.renderTalk), lectures (ui.read),
//    sous-titres, fmtLine (jetons {fermier}, {objet}, {lieu:x}…), cinématiques,
//    titres de lieux, toasts, confirm(), texte dessiné sur canevas, titre de page.
//  API : i18n.lang, i18n.set('en' | 'fr'), i18n.t(s) (= T), i18n.onChange (fonctions
//  appelées après une bascule, ex. redessiner un canevas), i18n.debug + i18n.misses
//  (textes affichés restés sans traduction), i18n.stats().
//  Un élément marqué translate="no" (et son contenu) n'est jamais traduit.
// ============================================================================
const i18n = (() => {
  const LETTER = /[A-Za-zÀ-ÖØ-öø-ÿŒœ]/;
  const TOKEN = /\{(\d{1,2}|[a-z]+(?::[A-Za-z0-9_]+)?)\}/g;
  const nrm = (s) => s.replace(/[ \t\u00a0\u202f\u2009]+/g, ' ').replace(/ *\n */g, '\n').trim();
  const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const upFirst = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
  const loFirst = (s) => (s ? s[0].toLowerCase() + s.slice(1) : s);
  // ce que peut valoir un jeton dans un texte déjà mis en forme (fmtLine) : resserre les gabarits
  const W = "[A-ZÀ-ÝŒ][A-Za-zÀ-ÖØ-öø-ÿŒœ'’.-]*";
  const PROPER = `${W}(?: (?:de |du |des |d’|d'|le |la )?${W}){0,3}`;
  const TOK_RE = {
    jour: '\\d+', prenom: W, nom: PROPER, ville: PROPER, hameau: PROPER, npc: PROPER,
    fermier: `(?:le nouveau fermier|la nouvelle fermière|${W})`, victime: `(?:quelqu’un|${PROPER})`,
  };
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'NOSCRIPT', 'CODE', 'PRE']);
  const TITLE = document.title;

  let map = null, pats = null, tokEn = null;
  const lower = new Map(); // texte court en minuscules -> traduction (casse changée par le jeu)
  const cache = new Map(), inner = new Map();
  const TXT = new WeakMap(), ATTR = new WeakMap();

  // ------------------------------------------------------------------ données
  function compile(fr, en) {
    const names = [], lits = [];
    let src = '^', last = 0, m;
    // un gabarit d'une seule ligne ne déborde pas sur la ligne suivante
    const multi = fr.indexOf('\n') >= 0, any = multi ? '[\\s\\S]*?' : '[^\\n]*?';
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(fr))) {
      const lit = fr.slice(last, m.index);
      lits.push(lit);
      const k = m[1].split(':')[0];
      src += reEsc(lit) + '(' + (Object.prototype.hasOwnProperty.call(TOK_RE, k) ? TOK_RE[k] : any) + ')';
      names.push(m[1]);
      last = m.index + m[0].length;
    }
    if (!names.length) return null;
    const tail = fr.slice(last);
    lits.push(tail);
    src += reEsc(tail) + '$';
    const lit = lits.join('');
    if (!/[A-Za-zÀ-ÿ]{2,}/.test(lit)) return null;
    let re;
    try { re = new RegExp(src); } catch (e) { return null; }
    return { re, names, head: lits[0], tail, mids: lits.slice(1, -1).filter((x) => x.length > 2), litLen: lit.length, en, multi };
  }
  const tokSig = (s) => (s.match(TOKEN) || []).sort().join(' ');
  function data() {
    if (map) return;
    map = new Map(); pats = []; tokEn = new Set();
    const D = typeof I18N_EN !== 'undefined' ? I18N_EN : { exact: [], patterns: [] };
    const addExact = (fr, en) => {
      map.set(fr, en);
      if (fr.indexOf('{') >= 0 && tokSig(fr)) { const P = compile(fr, en); if (P) pats.push(P); tokEn.add(en); }
    };
    for (const [fr, en] of D.exact) addExact(fr, en);
    for (const [fr, en] of D.patterns) { const P = compile(fr, en); if (P) pats.push(P); }
    // chaque ligne d'un texte à plusieurs lignes (même découpe des deux côtés) : pour les textes montrés par morceaux
    for (const [fr, en] of D.exact.concat(D.patterns)) {
      if (fr.indexOf('\n') < 0) continue;
      const a = fr.split('\n'), b = en.split('\n');
      if (a.length !== b.length) continue;
      for (let i = 0; i < a.length; i++) {
        const x = a[i].trim(), y = b[i].trim();
        if (x.length < 2 || !LETTER.test(x) || x === y || map.has(x) || tokSig(x) !== tokSig(y)) continue;
        if (/\{\d{1,2}\}/.test(x)) { const P = compile(x, y); if (P) pats.push(P); } else addExact(x, y);
      }
    }
    pats.sort((p, q) => q.litLen - p.litLen); // les plus précis d'abord
    // (une entrée qui reste la même dans les deux langues, « NEWY », n'impose pas sa casse : « Newy » reste « Newy »)
    for (const [fr, en] of map) if (fr.length <= 80 && fr.indexOf('{') < 0 && fr !== en) { const k = fr.toLowerCase(); if (!lower.has(k)) lower.set(k, en); }
  }

  // ------------------------------------------------------------------ recherche
  function sentenceStart(str, off) { return off === 0 || /(?:[.!?…]\s+|\n\s*|[“"«—]\s*)$/.test(str.slice(Math.max(0, off - 4), off)); }
  function fill(P, caps) {
    return P.en.replace(TOKEN, (m, name, off, str) => {
      const i = P.names.indexOf(name);
      if (i < 0) return m;
      let v = caps[i];
      if (!/^\d/.test(name) && v && /^[a-zà-ÿ]/.test(v) && sentenceStart(str, off)) v = upFirst(v);
      return v;
    });
  }
  // garde les espaces de bord de s autour de t
  const keepWs = (s, t) => s.slice(0, s.length - s.trimStart().length) + t + s.slice(s.trimEnd().length);
  // Chaque recherche rend { t: traduction, part: vrai si un morceau est resté en français } ou null.
  function sub(c, d) {
    if (!c || !LETTER.test(c)) return { t: c, part: false };
    const x = lk(c.trim(), d + 1);
    return x ? { t: keepWs(c, x.t), part: x.part } : { t: c, part: false }; // (un nom propre reste tel quel)
  }
  function matchPats(n, d) {
    const nl = n.indexOf('\n') >= 0;
    for (const P of pats) {
      if (n.length < P.litLen || (nl && !P.multi)) continue;
      if (P.head && !n.startsWith(P.head)) continue;
      if (P.tail && !n.endsWith(P.tail)) continue;
      let ok = true;
      for (const x of P.mids) if (n.indexOf(x) < 0) { ok = false; break; }
      if (!ok) continue;
      const m = P.re.exec(n);
      if (!m) continue;
      const caps = [];
      let part = false;
      for (let i = 0; i < P.names.length; i++) { const x = sub(m[i + 1], d); caps.push(x.t); part = part || x.part; }
      return { t: fill(P, caps), part };
    }
    return null;
  }
  const fixLead = (s) => s.replace(/«\s*/g, '“');
  const fixTrail = (s) => s.replace(/\s*»/g, '”').replace(/\s+([:;!?])/g, '$1');
  const SEG = /( — | – | · | \| | (?=\())/;
  // texte normalisé -> { t, part } ou null (cache des recherches composées)
  function lk(n, d) {
    const r0 = map.get(n);
    if (r0 !== undefined) return { t: r0, part: false };
    if (d > 6 || n.length < 2) return null;
    let r = inner.get(n);
    if (r !== undefined) return r || null;
    r = find(n, d);
    inner.set(n, r || false);
    return r;
  }
  function find(n, d) {
    const r = matchPats(n, d);
    if (r) return r;
    // plusieurs lignes : ligne à ligne
    if (n.indexOf('\n') >= 0) {
      const L = n.split('\n');
      let ch = false, part = false;
      for (let i = 0; i < L.length; i++) {
        if (!LETTER.test(L[i])) continue;
        const x = lk(L[i], d + 1);
        if (x) { L[i] = x.t; ch = true; part = part || x.part; } else part = true;
      }
      return ch ? { t: L.join('\n'), part } : null;
    }
    let best = null; // une traduction partielle ne sert qu'en dernier recours
    // énumération « A, B, C » : chaque élément doit se traduire
    if (n.indexOf(', ') > 0) {
      const P = n.split(', '), out = [];
      let part = false;
      for (const p of P) { const x = LETTER.test(p) ? lk(p, d + 1) : { t: p, part: false }; if (!x) break; out.push(x.t); part = part || x.part; }
      if (out.length === P.length) { if (!part) return { t: out.join(', '), part: false }; best = best || { t: out.join(', '), part: true }; }
    }
    // morceaux : « A — B », « A · B », « A (B) » ; les plus longues suites de morceaux connues d'abord
    if (SEG.test(n)) {
      const P = n.split(SEG); // morceaux aux indices pairs, séparateurs aux indices impairs
      const last = P.length - 1;
      let out = '', ch = false, part = false;
      for (let i = 0; i <= last; i += 2) {
        let got = null;
        for (let j = last; j >= i && got == null; j -= 2) {
          if (i === 0 && j === last) continue; // le texte entier : déjà cherché
          const cand = P.slice(i, j + 1).join(''), c = cand.trim();
          if (!c || !LETTER.test(c)) continue;
          const x = lk(c, d + 1);
          if (x) { got = keepWs(cand, x.t); part = part || x.part; i = j; }
        }
        if (got != null) ch = true; else if (LETTER.test(P[i])) part = true;
        out += got != null ? got : P[i];
        if (i + 1 <= last) out += P[i + 1];
      }
      if (ch && !part) return { t: out, part: false };
      if (ch) best = { t: out, part: true };
    }
    // ponctuation, nombres, guillemets autour : « 2 Bois », « Pain ×3 », « « Le puits » », « 3 fleurs (au choix) »
    const m = /^([^A-Za-zÀ-ÖØ-öø-ÿŒœ]*)([\s\S]*?)([^A-Za-zÀ-ÖØ-öø-ÿŒœ]*)$/.exec(n);
    if (m && (m[1] || m[3])) {
      const C = [[m[1], m[2], m[3]]];
      if (m[1] && m[3]) C.push([m[1], n.slice(m[1].length), ''], ['', n.slice(0, n.length - m[3].length), m[3]]);
      for (const [a, mid, b] of C) {
        if (mid.length < 2) continue;
        const x = lk(mid, d + 1);
        if (!x) continue;
        const t = fixLead(a) + x.t + fixTrail(b);
        if (!x.part) return { t, part: false };
        best = best || { t, part: true };
      }
    }
    // casse : « pain » (mis en minuscules) -> « Pain »
    const c = n[0], U = c.toUpperCase(), Lo = c.toLowerCase();
    if (c !== U) { const t = map.get(U + n.slice(1)); if (t !== undefined) return { t: loFirst(t), part: false }; }
    else if (c !== Lo) { const t = map.get(Lo + n.slice(1)); if (t !== undefined) return { t: upFirst(t), part: false }; }
    // textes courts dont la casse a changé : « baigneuse des sources », « LE LAC »
    if (n.length <= 80) {
      const lo = n.toLowerCase(), t = lower.get(lo);
      if (t !== undefined) return { t: n === lo ? t.toLowerCase() : n === n.toUpperCase() ? t.toUpperCase() : t, part: false };
      // nom de lieu privé de son article (« Vieille ferme » <- « la vieille ferme ») : l'anglais perd « the »
      if (c !== Lo && n.indexOf(' ') > 0 || /^[A-ZÀ-Ý][a-zà-ÿ]/.test(n)) {
        for (const art of ['la ', 'le ', 'les ', 'l’', "l'"]) {
          const t2 = map.get(art + loFirst(n));
          if (t2 !== undefined) return { t: upFirst(t2.replace(/^the /i, '')), part: false };
        }
      }
    }
    return best;
  }
  // traduction d'une chaîne quelconque (espaces de bord gardés), avec cache
  function tr(s) {
    let r = cache.get(s);
    if (r !== undefined) return r;
    r = s;
    if (s.length > 1 && LETTER.test(s)) {
      data();
      const n = nrm(s);
      const x = n ? lk(n, 0) : null;
      if (x && x.t !== n) r = keepWs(s, x.t);
    }
    if (cache.size > 20000 || inner.size > 50000) { cache.clear(); inner.clear(); }
    cache.set(s, r);
    return r;
  }

  // ------------------------------------------------------------------ le document
  const I = { lang: 'fr', onChange: [], debug: false, misses: new Map(), prof: { ms: 0, calls: 0 } };
  const noTr = (el) => el && el.closest && el.closest('[translate="no"],[contenteditable="true"]');
  function miss(v, el) {
    if (!I.debug) return;
    const k = nrm(v);
    const e = I.misses.get(k);
    if (e) e.n++; else I.misses.set(k, { n: 1, where: el ? (el.id ? '#' + el.id : el.nodeName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : '')) : '' });
  }
  function doText(node) {
    const v = node.data;
    if (!v || v.length < 2) return;
    const rec = TXT.get(node);
    if (rec && rec.en === v) return;
    const p = node.parentNode;
    if (!p || p.nodeType !== 1 || SKIP_TAGS.has(p.nodeName) || p.getAttribute('translate') === 'no') return;
    const en = tr(v);
    if (en === v) { if (I.debug && LETTER.test(v)) miss(v, p); return; }
    if (noTr(p)) return;
    TXT.set(node, { fr: v, en });
    node.data = en;
  }
  function doAttr(el, a) {
    const v = el.getAttribute(a);
    if (!v || v.length < 2) return;
    let rec = ATTR.get(el);
    if (rec && rec[a] && rec[a].en === v) return;
    const en = tr(v);
    if (en === v || noTr(el)) return;
    if (!rec) ATTR.set(el, (rec = {}));
    rec[a] = { fr: v, en };
    el.setAttribute(a, en);
  }
  const FILTER = { acceptNode: (n) => (n.nodeType === 1 && SKIP_TAGS.has(n.nodeName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) };
  function visit(root) {
    if (!root) return;
    if (root.nodeType === 3) return doText(root);
    if (root.nodeType !== 1 || SKIP_TAGS.has(root.nodeName)) return;
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, FILTER);
    for (let n = root; n; n = tw.nextNode()) {
      if (n.nodeType === 3) doText(n);
      else { if (n.hasAttribute('title')) doAttr(n, 'title'); if (n.hasAttribute('placeholder')) doAttr(n, 'placeholder'); }
    }
  }
  function restore(root) {
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    for (let n = root; n; n = tw.nextNode()) {
      if (n.nodeType === 3) { const r = TXT.get(n); if (r) { if (n.data === r.en) n.data = r.fr; TXT.delete(n); } }
      else { const r = ATTR.get(n); if (r) { for (const a in r) if (n.getAttribute(a) === r[a].en) n.setAttribute(a, r[a].fr); ATTR.delete(n); } }
    }
  }
  // texte produit par le CSS (content: '…') : règles d'appoint sous html[lang="en"]
  let cssT = 0;
  function cssScan() {
    let st = document.getElementById('i18n-css');
    const rules = [];
    const scan = (list) => {
      for (const r of list) {
        if (r.cssRules && !r.selectorText) { scan(r.cssRules); continue; }
        if (!r.style || !r.selectorText) continue;
        const c = r.style.getPropertyValue('content');
        const m = /^(["'])([\s\S]*)\1$/.exec((c || '').trim());
        if (!m || !LETTER.test(m[2])) continue;
        const en = tr(m[2]);
        if (en === m[2]) continue;
        rules.push(r.selectorText.split(',').map((x) => 'html[lang="en"] ' + x.trim()).join(', ') + ' { content: ' + JSON.stringify(en) + '; }');
      }
    };
    for (const sh of document.styleSheets) {
      if (st && sh.ownerNode === st) continue;
      let list;
      try { list = sh.cssRules; } catch (e) { continue; }
      if (list) scan(list);
    }
    const css = rules.join('\n');
    if (!st) { if (!css) return; st = document.createElement('style'); st.id = 'i18n-css'; document.head.appendChild(st); }
    if (st.textContent !== css) st.textContent = css;
  }
  const cssSoon = () => { clearTimeout(cssT); cssT = setTimeout(() => { if (I.lang === 'en') cssScan(); }, 50); };

  const obs = new MutationObserver((recs) => {
    if (I.lang !== 'en') return;
    const t0 = performance.now();
    try { observe(recs); } finally { I.prof.ms += performance.now() - t0; I.prof.calls++; }
  });
  function observe(recs) {
    let css = false;
    for (const r of recs) {
      if (r.type === 'characterData') doText(r.target);
      else if (r.type === 'childList') { for (const nd of r.addedNodes) { if (nd.nodeName === 'STYLE' || nd.nodeName === 'LINK') { if (nd.id !== 'i18n-css') css = true; } else visit(nd); } }
      else if (r.type === 'attributes') doAttr(r.target, r.attributeName);
    }
    if (css) cssSoon();
  }
  const OBS = { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['title', 'placeholder'] };

  function apply() {
    const en = I.lang === 'en';
    document.documentElement.lang = I.lang;
    if (en) {
      data();
      visit(document.body);
      cssScan();
      document.title = tr(TITLE);
      obs.observe(document.documentElement, OBS);
    } else {
      obs.disconnect();
      restore(document.body);
      document.title = TITLE;
    }
  }

  Object.assign(I, {
    t: (s) => T(s),
    has: (s) => { data(); return map.has(nrm(String(s))); },
    stats: () => { data(); return { exact: map.size, patterns: pats.length, cache: cache.size }; },
    isEnglishTemplate: (s) => { data(); return tokEn.has(nrm(String(s))); },
    set(l) {
      l = l === 'en' ? 'en' : 'fr';
      settings.lang = l;
      store.set('prairie.settings', settings);
      if (l !== this.lang) {
        this.lang = l;
        apply();
        this.refresh();
        for (const f of this.onChange) try { f(l); } catch (e) { console.error(e); }
      } else this.syncUI();
    },
    // après une bascule : on redessine ce qui est affiché
    refresh() {
      this.syncUI();
      try {
        if (typeof game !== 'undefined' && game.world && game.mode === 'menu' && $('#menu').classList.contains('open')) ui.showMenu(true);
        if (typeof bar !== 'undefined') bar.lastSig = '';
        if (ui.panel === '#satchel') ui.renderSatchel();
        else if (ui.panel === '#shop' && ui.shopN) ui.renderShop();
        else if (ui.panel === '#store' && ui.store) ui.renderStore();
      } catch (e) { console.error(e); }
    },
    syncUI() {
      const s = $('#o-lang');
      if (s) s.value = this.lang;
      const b = $('#m-lang');
      if (b) b.textContent = this.lang === 'en' ? 'Français' : 'English';
    },
    apply,
  });
  I.lang = settings.lang === 'en' ? 'en' : 'fr';
  I._tr = tr;
  return I;
})();

// ---------------------------------------------------------------- T : la fonction du socle (11-zzz00-socle.js), remplacée
T = function (s) {
  if (i18n.lang !== 'en' || typeof s !== 'string' || s.length < 2) return s;
  return i18n._tr(s);
};

// ---------------------------------------------------------------- retouches ciblées
{
  // répliques mises en forme : on traduit le gabarit (avec ses jetons) avant d'y mettre les noms
  const _fmtLine = fmtLine;
  const DEF = /(^|[.!?…]\s+|\n\s*|[«“]\s*)?(la nouvelle fermière|le nouveau fermier|ce cadeau|quelqu’un)/g;
  fmtLine = function (t, n, extra) {
    if (i18n.lang !== 'en' || !t) return _fmtLine(t, n, extra);
    const src = String(t);
    let s = T(src);
    const done = s !== src || i18n.isEnglishTemplate(src);
    if (done) s = s.replace(/\{lieu:(\w+)\}/g, (_, k) => T((typeof LIEU_NAMES !== 'undefined' && LIEU_NAMES[k]) || k));
    const x = extra && typeof extra.objet === 'string' ? Object.assign({}, extra, { objet: T(extra.objet) }) : extra;
    let r = _fmtLine(s, n, x);
    // valeurs par défaut des jetons, écrites en français dans fmtLine
    if (done) r = r.replace(DEF, (m, pre, w) => { let e = T(w); if (pre !== undefined) e = e[0].toUpperCase() + e.slice(1); return (pre || '') + e; });
    return r;
  };

  // Ce qu'une retouche a déjà traduit est marqué translate="no" : l'observateur n'y repasse pas
  // (sinon un mot anglais qui est aussi un mot français serait traduit deux fois : « Chat » -> « Cat »).
  const mark = (el) => { if (el && el.setAttribute) el.setAttribute('translate', 'no'); };
  const en = () => i18n.lang === 'en';
  // paroles qui s'écrivent lettre à lettre : traduites avant l'animation (le reste du panneau : l'observateur)
  const _renderTalk = ui.renderTalk;
  ui.renderTalk = function (v) {
    if (!en() || !v || typeof v !== 'object') return _renderTalk.call(this, v);
    const r = _renderTalk.call(this, Object.assign({}, v, { text: T(v.text) }));
    mark($('#talk .said'));
    return r;
  };
  // lectures (notes, lettres, inscriptions) : le texte, coupé en lignes (<br>) à l'affichage, est traduit d'un bloc
  // (certaines notes arrivent avec leurs jetons bruts, « {hameau} » : on les met en forme, dans les deux langues)
  const TOKS = /\{(?:fermier|prenom|ville|hameau|jour|victime|npc:\w+|lieu:\w+)\}/;
  const _read = ui.read;
  ui.read = function (title, text, sign) {
    if (typeof text === 'string' && TOKS.test(text)) text = fmtLine(text, null);
    if (!en()) return _read.call(this, title, text, sign);
    const r = _read.call(this, T(title), T(text), sign ? T(sign) : sign);
    for (const e of $$('#reader > h3, #reader > .txt, #reader > .sign')) mark(e);
    return r;
  };
  const _subtitle = ui.subtitle;
  ui.subtitle = function (name, text, dur) {
    if (!en()) return _subtitle.call(this, name, text, dur);
    const r = _subtitle.call(this, T(name), T(text), dur);
    mark($('#subs') && $('#subs').lastElementChild);
    return r;
  };
  const _showTitle = ui.showTitle;
  ui.showTitle = function (t1, t2) {
    if (!en()) return _showTitle.call(this, t1, t2);
    mark($('#hud-title'));
    return _showTitle.call(this, T(t1), T(t2));
  };
  // les toasts se comparent au texte déjà affiché : même langue des deux côtés
  const _toast = ui.toast;
  ui.toast = function (msg, kind) {
    if (!en()) return _toast.call(this, msg, kind);
    const r = _toast.call(this, T(msg), kind);
    mark($('#toasts') && $('#toasts').lastElementChild);
    return r;
  };
  if (typeof cine !== 'undefined' && cine.texte) {
    const _texte = cine.texte;
    cine.texte = function (t, qui) {
      if (!en()) return _texte.call(this, t, qui);
      const r = _texte.call(this, T(t), T(qui));
      mark($('#cine-txt'));
      return r;
    };
  }
  // boîtes du navigateur
  for (const k of ['confirm', 'alert', 'prompt']) {
    const f = window[k];
    if (typeof f === 'function') window[k] = function (m, ...a) { return f.call(window, i18n.lang === 'en' ? T(m) : m, ...a); };
  }
  // texte dessiné sur un canevas (cartes, panneaux…) : T appliqué au dessin (sans effet en français)
  if (typeof CanvasRenderingContext2D !== 'undefined') {
    const P = CanvasRenderingContext2D.prototype;
    for (const k of ['fillText', 'strokeText', 'measureText']) {
      const f = P[k];
      P[k] = function (t, ...a) { return f.call(this, i18n.lang === 'en' && typeof t === 'string' ? T(t) : t, ...a); };
    }
  }
}

// ---------------------------------------------------------------- le choix de la langue : Options et menu
{
  const cols = $('#dlg-options .cols');
  if (cols && !$('#o-lang')) {
    const l = document.createElement('label');
    l.setAttribute('translate', 'no');
    l.innerHTML = 'Langue · Language <select id="o-lang"><option value="fr">Français</option><option value="en">English</option></select>';
    cols.insertBefore(l, cols.firstChild);
    $('#o-lang').onchange = (e) => { i18n.set(e.target.value); sound.click && sound.click(); };
  }
  const help = $('#m-help');
  if (help && !$('#m-lang')) {
    const b = document.createElement('button');
    b.id = 'm-lang';
    b.setAttribute('translate', 'no');
    b.title = 'Langue · Language';
    help.after(b);
    b.onclick = () => { i18n.set(i18n.lang === 'en' ? 'fr' : 'en'); sound.click && sound.click(); };
  }
  i18n.syncUI();
  if (i18n.lang === 'en') i18n.apply();
}
