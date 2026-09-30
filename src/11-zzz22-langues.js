// ============================================================================
//  LES LANGUES PERDUES (aëlin, gorrain) : lire les pierres gravées.
//  - une stèle (inter 'inscription', data.ins) montre l'écriture, et dessous la
//    traduction mot à mot des mots connus (les autres restent illisibles) ; le
//    sens entier quand tous les mots sont connus, ou quand quelqu'un l'a traduit ;
//  - on apprend des mots, peu à la fois et dans un ordre mêlé propre à chaque
//    partie (jamais « les plus utiles d'abord ») : dans les lexiques (livres),
//    auprès du bibliothécaire (deux mots par jour contre de l'argent, ou un seul
//    mot d'une pierre relevée), de l'ancien des nains (le gorrain, par amitié) ;
//    personne ne traduit une pierre entière : on la déchiffre par recoupement,
//    en comparant dans le carnet les pierres, leurs traits et les mots connus ;
//  - seule déduction faite par le jeu, sans rien dire : le dernier mot inconnu
//    d'une pierre dont on connaît déjà le sens (traductions des anciennes parties) ;
//  - des stèles sont posées pour les inscriptions qui n'en avaient pas encore ;
//  - API : langues.traduire(lang, texte), langues.lireInscription(id),
//    langues.enseigner(lang, n, source), langues.motConnu(lang, mot),
//    langues.ordre(lang, source) (ordre mêlé du lexique, propre à la partie).
//  État : farm.s.livres.ins = { id: { j: jour, ou: lieu, trad: 'libraire'|… (anciennes parties), dit: 1 } },
//         farm.s.livres.lecons = { j: jour, n: mots appris du nain ce jour },
//         farm.s.livres.libraire = { j: jour de la dernière leçon du bibliothécaire }
// ============================================================================
// l'ancien des nains ne traduit pas les cupules : il en dit un peu, de travers
const CUPULES_ANCIEN = {
  g_table: 'Celle-là parle de manger. Pas de toi.',
  g_cercle: 'Les Gorr regardaient en haut plus souvent qu’en bas. Celle-là aussi.',
  g_menhirs: 'Elle compte. Pas loin. Et elle regarde ses pieds.',
  g_trom: 'On ne lit pas celle-là à voix haute. Elle parle à quelqu’un qui ne répond plus.',
  g_mor: 'Elle demande quelque chose à quelqu’un de grand. Poliment, pour une fois.',
  g_dwerr: 'Elle parle de nous. Petitement.',
  g_ulv: 'Un conseil de berger. Les Gorr avaient peur de la même chose que toi, la nuit.',
  g_rag: 'Elle dit où va l’eau. Moi, je ne le dis pas.',
};
const langues = {
  glyphes: {},
  // --------------------------------------------------------------- les mots
  nom(lang) { return lang === 'aelin' ? 'l’aëlin' : 'le gorrain'; },
  de(lang) { return lang === 'aelin' ? 'd’aëlin' : 'de gorrain'; },
  // mot du lexique correspondant (« na-durn » : de Durn → durn)
  base(lang, mot) {
    const lex = LANGUES[lang] && LANGUES[lang].lex;
    if (!lex || !mot) return null;
    const m = String(mot).toLowerCase().replace(/[.;:!?«»"“”]/g, '');
    if (lex[m]) return m;
    if (lang === 'aelin' && m.startsWith('na-') && lex[m.slice(3)]) return m.slice(3);
    return null;
  },
  motConnu(lang, mot) { const b = this.base(lang, mot); return !!b && !!farm.s && savoir.motConnu(lang, b); },
  // sens d'un mot (court : sans la parenthèse)
  sens(lang, mot, court) {
    const b = this.base(lang, mot);
    if (!b) return '';
    let t = LANGUES[lang].lex[b];
    if (court) t = t.replace(/\s*\(.*\)\s*$/, '');
    if (lang === 'aelin' && String(mot).toLowerCase().startsWith('na-')) t = (/^[aeiouéèêâîôûœh]/i.test(t) ? 'd’' : 'de ') + t;
    return t;
  },
  // apprendre des mots (livres, habitants) : renvoie le nombre de mots nouveaux (la seule déduction est muette)
  apprendre(lang, liste, source) {
    const n = savoir.apprendreMots(lang, liste.map((m) => this.base(lang, m) || m));
    if (n) setTimeout(() => this.deduire(), 50);
    return n;
  },
  // l'ordre mêlé du lexique : propre à la partie (sa graine) et à la source (un livre, un maître…), ni alphabétique,
  // ni « les mots des pierres d'abord » ; stable d'un chargement à l'autre
  ordre(lang, source) {
    const lex = LANGUES[lang] && LANGUES[lang].lex;
    if (!lex) return [];
    const k = lang + '|' + (source || '') + '|' + ((farm.s && farm.s.seed) | 0);
    const C = this._ordres || (this._ordres = {});
    if (C[k]) return C[k];
    const rnd = mulberry32(hashString(k) ^ 0x2f6b1d);
    return (C[k] = Object.keys(lex).map((m) => [m, rnd()]).sort((a, b) => a[1] - b[1]).map((a) => a[0]));
  },
  // une liste de mots rangée dans l'ordre mêlé de la partie
  meler(lang, liste, source) { const O = this.ordre(lang, source), r = (m) => { const i = O.indexOf(m); return i < 0 ? 1e9 : i; }; return liste.slice().sort((a, b) => r(a) - r(b)); },
  // mots inconnus, dans l'ordre mêlé de la source
  inconnus(lang, source) { return this.ordre(lang, source).filter((b) => !savoir.motConnu(lang, b)); },
  // enseigner n mots (habitants, potions, autres modules) : renvoie la liste des mots appris
  enseigner(lang, n, source) {
    if (!LANGUES[lang] || !farm.s) return [];
    const L = this.inconnus(lang, source || 'enseigne').slice(0, Math.max(0, n | 0));
    if (L.length) this.apprendre(lang, L, source || 'enseigne');
    return L;
  },
  // traduction d'un texte : les mots connus sont traduits, les autres restent tels quels
  traduire(lang, texte) {
    if (!LANGUES[lang]) return String(texte || '');
    const out = [];
    for (const tok of String(texte || '').split(/\s+/)) {
      if (!tok) continue;
      if (tok === ',') { out.push(','); continue; }
      const m = tok.match(/^([«"“]*)(.*?)([.,;:!?»"”]*)$/);
      const [, pre, mot, post] = m || ['', '', tok, ''];
      out.push(pre + (mot && this.motConnu(lang, mot) ? this.sens(lang, mot, true) : mot) + post);
    }
    return out.join(' ').replace(/\s+,/g, ',');
  },

  // --------------------------------------------------------------- les inscriptions
  S() { return livres.S().ins; },
  vue(id) { return !!this.S()[id]; },
  lieuJoueur() {
    const w = game.world, p = game.player, under = !!p.underground || p.pos[1] < w.heightAt(p.pos[0], p.pos[2]) - 3;
    let best = null, bd = 1e9;
    for (const pass of [true, false]) {
      for (const k in w.lm) {
        const L = w.lm[k];
        if (pass && !!L.under !== under) continue;
        const d = Math.hypot(L.x - p.pos[0], L.z - p.pos[2]);
        if (d < bd && d < (L.r || 10) * 2 + 40) { bd = d; best = L.name || LIEU_NAMES[k]; }
      }
      if (best) break;
    }
    return best || '';
  },
  voir(id) {
    const V = this.S();
    if (V[id] || !INSCR_BY_ID[id]) return false;
    V[id] = { j: farm.s.day, ou: this.lieuJoueur() };
    return true;
  },
  mots(id) { const I = INSCR_BY_ID[id]; return I ? [...new Set(langWords(I.texte).map((m) => this.base(I.lang, m)).filter(Boolean))] : []; },
  tousConnus(id) { const I = INSCR_BY_ID[id]; return !!I && this.mots(id).every((b) => savoir.motConnu(I.lang, b)); },
  sensConnu(id) { const v = this.S()[id]; return this.tousConnus(id) || !!(v && v.trad); },
  // quelqu'un traduit l'inscription (on connaît son sens, pas encore chacun de ses mots). Plus aucun habitant ne le
  // fait (on ne traduit pas une pierre entière à la place du joueur) ; gardé pour les anciennes parties et l'API.
  traduireInscription(id, par) {
    const V = this.S();
    if (!INSCR_BY_ID[id]) return false;
    if (!V[id]) V[id] = { j: farm.s.day, ou: '' };
    if (V[id].trad) return false;
    V[id].trad = par || 'quelqu’un';
    setTimeout(() => this.deduire(), 50);
    return true;
  },
  // la seule déduction faite à la place du joueur, sans rien dire : le dernier mot inconnu d'une pierre dont le sens
  // est déjà connu (traduite dans une ancienne partie). Le reste, le joueur le compare lui-même dans son carnet.
  deduire() {
    const appris = [];
    for (let tour = 0; tour < 6; tour++) {
      const V = this.S(), seul = [];
      for (const id in V) {
        const I = INSCR_BY_ID[id];
        if (!I || !V[id].trad) continue;
        const inc = this.mots(id).filter((b) => !savoir.motConnu(I.lang, b));
        if (inc.length === 1) seul.push([I.lang, inc[0]]);
      }
      if (!seul.length) break;
      for (const [lang, b] of seul) if (savoir.apprendreMots(lang, [b])) appris.push([lang, b]);
    }
    if (appris.length && ui.panel === '#reader' && this.ouvert && $('#reader .ins-gloss')) this.lireInscription(this.ouvert, this.ouvertCarnet);
    return appris;
  },
  // ce qu'on lit d'une pierre : les mots connus, des points pour les autres
  glose(id) {
    const I = INSCR_BY_ID[id];
    if (!I) return '';
    return I.texte.split(/\s+/).filter(Boolean).map((t) => (t === ',' ? ',' : this.motConnu(I.lang, t) ? this.sens(I.lang, t, true) : '…')).join(' ').replace(/\s+,/g, ',');
  },
  // dessin d'un mot, mis en cache (style : 'page' (livres), 'pierre' (stèles), 'carnet')
  glypheURL(lang, mot, style) {
    const k = lang + '|' + mot + '|' + (style || '');
    if (this.glyphes[k]) return this.glyphes[k];
    const col = { page: ['#efe6cf', '#4a3a28'], pierre: ['#b4ae9e', '#2e2a24'], carnet: ['#e8dfc8', '#4a3a28'] }[style] || ['#cfc6b0', '#3a3024'];
    let url = '';
    try { url = langCanvas(lang, mot, { size: lang === 'aelin' ? 12 : 16, bg: col[0], ink: col[1] }).toDataURL(); } catch (e) { url = ''; }
    return (this.glyphes[k] = url);
  },
  // le panneau d'une inscription
  lireInscription(id, deCarnet) {
    const I = INSCR_BY_ID[id];
    if (!I || !farm.s) return false;
    this.style();
    const neuf = !deCarnet && this.voir(id);
    const lg = LANGUES[I.lang], V = this.S()[id] || {};
    let img = '';
    try { img = langCanvas(I.lang, I.texte, { size: I.lang === 'aelin' ? 24 : 26, bg: '#b4ae9e', ink: '#2e2a24' }).toDataURL(); } catch (e) { img = ''; }
    const toks = I.texte.split(/\s+/).filter(Boolean);
    const gloss = toks.map((t) => {
      if (t === ',') return '<span class="sep">·</span>';
      const ok = this.motConnu(I.lang, t);
      return `<span class="w ${ok ? 'ok' : 'inc'}"><img src="${this.glypheURL(I.lang, t, 'carnet')}" alt=""><span>${ok ? esc(this.sens(I.lang, t, true)) : '· · ·'}</span></span>`;
    }).join('');
    const tous = this.tousConnus(id), connus = this.mots(id).filter((b) => savoir.motConnu(I.lang, b)).length, total = this.mots(id).length;
    let sens;
    if (tous) sens = `<div class="ins-sens">« ${esc(I.sens)} »</div>`;
    else if (V.trad) sens = `<div class="ins-sens">« ${esc(I.sens)} »</div><div class="ins-note">${esc(connus > 1 ? `D’après ${V.trad}. Vous ne lisez vous-même que ${connus} mots sur ${total}.` : connus ? `D’après ${V.trad}. Vous ne lisez vous-même qu’un mot sur ${total}.` : `D’après ${V.trad}. Vous ne lisez vous-même aucun de ses mots.`)}</div>`;
    else if (connus) sens = `<div class="ins-note">${esc(connus > 1 ? `Vous reconnaissez ${connus} mots sur ${total}.` : `Vous reconnaissez un mot sur ${total}.`)}</div>`;
    else sens = `<div class="ins-note">${esc(I.lang === 'aelin' ? 'Vous n’en comprenez pas un trait.' : 'Vous n’y comprenez rien.')}</div>`;
    const titre = I.lang === 'aelin' ? 'Une inscription en Hautes Lettres' : 'Des cupules gravées dans la pierre';
    const sous = deCarnet ? (V.ou ? `Recopiée dans votre carnet, ${V.ou}.` : 'Recopiée dans votre carnet.') : (lg ? `Écrit en ${lg.ecriture.replace(/^les /, '')}.` : '');
    ui.open('#reader', `<h3>${esc(titre)}</h3><div class="ins-ecrit"><img src="${img}" alt=""></div><div class="ins-gloss">${gloss}</div>${sens}<div class="sign">${esc(sous)}</div><button class="close">Refermer</button>`);
    $('#reader .close').onclick = () => { this.ouvert = null; ui.close(); };
    this.ouvert = id; this.ouvertCarnet = !!deCarnet;
    if (neuf) setTimeout(() => this.deduire(), 400);
    return true;
  },

  // --------------------------------------------------------------- la sacoche : onglet « Langues »
  ongletHTML() {
    let h = '';
    for (const lang of ['aelin', 'gorrain']) {
      const lg = LANGUES[lang], tot = Object.keys(lg.lex).length, M = savoir.motsConnus(lang).filter((b) => lg.lex[b]);
      h += `<h4>${esc(this.cap(lg.nom))} <span class="lg-n">— ${esc(M.length > 1 ? `${M.length} mots sur ${tot}` : M.length ? `un mot sur ${tot}` : `aucun mot sur ${tot}`)} · ${esc(lg.ecriture)}</span></h4>`;
      if (!M.length) { h += `<p class="hint">${esc('Vous n’en savez pas un mot.')}</p>`; continue; }
      // la grammaire, seulement si on a lu la préface d'un lexique de cette langue
      const G = livres.S().grammaire || {};
      h += (G[lang] ? `<p class="hint">${esc(lg.desc)}</p>` : '') + '<div class="lg-mots">' + M.slice().sort((a, b) => a.localeCompare(b)).map((b) => `<span class="lg-mot"><img src="${this.glypheURL(lang, b, 'carnet')}" alt=""><span><i>${esc(b)}</i> — ${esc(lg.lex[b])}</span></span>`).join('') + '</div>';
    }
    const V = this.S(), ids = Object.keys(V).filter((id) => INSCR_BY_ID[id]).sort((a, b) => V[a].j - V[b].j);
    h += `<h4>Inscriptions relevées <span class="lg-n">— ${ids.length}</span></h4>`;
    h += ids.map((id) => {
      const I = INSCR_BY_ID[id], ok = this.sensConnu(id), g = this.glose(id);
      return `<button class="note" data-ins="${esc(id)}">${esc(I.lang === 'aelin' ? 'Hautes Lettres' : 'Cupules')}${V[id].ou ? ' — ' + esc(V[id].ou) : ''} <span>— ${ok ? esc(`« ${I.sens} »`) : /[^…\s,]/.test(g) ? esc(`« ${g} »`) : esc(`illisible, relevée le jour ${V[id].j}`)}</span></button>`;
    }).join('') || '<p class="hint">Aucune. Les pierres gravées se lisent avec E.</p>';
    return h;
  },
  lierOnglet() { $$('#satchel [data-ins]').forEach((b) => (b.onclick = () => this.lireInscription(b.dataset.ins, true))); },
  cap(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); },
  style() {
    if (this.styled) return;
    this.styled = true;
    const st = document.createElement('style');
    st.textContent = `#reader .ins-ecrit{text-align:center;background:#b4ae9e;padding:10px;border-radius:3px;box-shadow:inset 0 0 18px rgba(0,0,0,.35);max-height:36vh;overflow:auto}
#reader .ins-ecrit img{max-width:100%;image-rendering:auto}
#reader .ins-gloss{display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin:12px 0 8px}
#reader .ins-gloss .w{display:flex;flex-direction:column;align-items:center;gap:2px;min-width:48px;padding:4px 5px;border:1px solid rgba(90,70,40,.22);border-radius:3px;background:rgba(255,255,255,.28)}
#reader .ins-gloss .w img{height:30px}
#reader .ins-gloss .w span{font-size:12.5px;font-style:italic;color:#3a2a18;text-align:center;max-width:110px}
#reader .ins-gloss .w.inc span{color:#9a8a6a;letter-spacing:.1em}
#reader .ins-gloss .sep{align-self:center;color:#8a7a5a;font-size:18px}
#reader .ins-sens{text-align:center;font-size:17px;font-style:italic;color:#2d2216;margin:6px 0 2px}
#reader .ins-note{text-align:center;font-size:13.5px;font-style:italic;color:#6a5436}
#satchel .lg-n{text-transform:none;letter-spacing:0;font-style:italic;font-size:12px;color:#8a7a5a}
#satchel .lg-mots{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:4px 10px;margin:4px 0 8px}
#satchel .lg-mot{display:flex;align-items:center;gap:7px;font-size:13.5px}
#satchel .lg-mot img{height:28px;flex:none}`;
    document.head.appendChild(st);
  },

  // --------------------------------------------------------------- stèles pour les inscriptions sans pierre (génération, après tout le reste)
  poserSteles(w, seed) {
    if (!w.lm || !w.inter) return 0;
    const rnd = mulberry32((seed | 0) * 131 + 2207);
    const B = new Builder(w, rnd, new Uint8Array(1));
    const posees = new Set(w.inter.filter((i) => i.kind === 'inscription' && i.data).map((i) => i.data.ins));
    // où poser celles qui n'ont pas de lieu : [lieu-dit, distance min, max]
    const LIEU = {
      a_livres: ['bibliotheque', 3, 7], a_tres: ['col', 5, 18], a_kel: ['lac_gele', 0, 0], g_table: ['dolmen', 4, 9], g_cercle: ['cercle', 1.5, 5],
      g_menhirs: ['menhirs', 3, 12], a_mora: ['refuge', 6, 16], a_nuit: ['hameau_abandonne', 6, 20], a_sang: ['ruines', 4, 14],
      g_trom: ['tour', 10, 26], g_ulv: ['charbonniere', 6, 16],
    };
    let n = 0;
    for (const I of INSCRIPTIONS) {
      const id = I[0];
      if (posees.has(id)) continue;
      const spec = LIEU[id] || [I[4], 4, 14];
      let L = spec[0] && w.lm[spec[0]];
      if (!L && id === 'a_mora') L = w.lm.col || w.lm.glacier;
      if (!L || L.under) continue;
      let r0 = spec[1], r1 = spec[2];
      if (id === 'a_kel') { r0 = (L.r || 60) * 0.85; r1 = (L.r || 60) * 1.35 + 10; } // sur la rive du lac gelé
      const tries = id === 'g_cercle' ? [[r0, r1], [(L.r || 13) + 3, (L.r || 13) + 8]] : [[r0, r1], [r1, r1 * 1.8 + 6]];
      let ok = false;
      for (const [a0, a1] of tries) {
        for (let k = 0; k < 90 && !ok; k++) {
          const a = rnd() * TAU, d = a0 + rnd() * (a1 - a0), x = L.x + Math.cos(a) * d, z = L.z + Math.sin(a) * d;
          if (!w.inside(x, z, 16)) continue;
          const h = w.heightAt(x, z);
          if (h < w.waterLevel + 0.6 || w.normalAt(x, z)[1] < 0.88) continue;
          if (w.matAt(x, z) === M_ICE) continue;
          if (!pointFree(w, x, z, 1.3)) continue;
          if (w.props.some((q) => Math.abs(q.x - x) < 2.2 && Math.abs(q.z - z) < 2.2)) continue;
          const r = Math.atan2(L.x - x, L.z - z) + (id === 'a_livres' ? Math.PI : 0);
          B.prop('stele', x, h - 0.08, z, r, { ins: id });
          B.inter('inscription', 'ins_' + id, x + Math.sin(r) * 0.55, h + 1.1, z + Math.cos(r) * 0.55, I[1] === 'aelin' ? 'Lire l’inscription' : 'Lire les cupules', { ins: id });
          ok = true; n++;
        }
        if (ok) break;
      }
    }
    if (n) w.grid = null; // les nouvelles pierres entrent dans la grille des collisions
    return n;
  },

  // --------------------------------------------------------------- leçons : le bibliothécaire, l'ancien des nains
  // Peu de mots à la fois, une leçon par jour, jamais une pierre entière : la langue se déchiffre lentement.
  options(n) {
    const O = [];
    if (!n || !n.st.alive) return O;
    const vuesSans = (lang) => Object.keys(this.S()).filter((id) => INSCR_BY_ID[id] && INSCR_BY_ID[id].lang === lang && !this.sensConnu(id));
    if (n.id === 'libraire' && !(typeof biblio !== 'undefined' && biblio.banni())) {
      if (this.inconnus('aelin', 'libraire').length) O.push({ label: 'Apprenez-moi quelques mots d’aëlin (30 pièces)', act: 'lg:mots' });
      if (vuesSans('aelin').length) O.push({ label: 'Pourriez-vous m’aider à lire une inscription ?', act: 'lg:trad' });
    }
    if (n.id === 'nain_ancien') {
      if (this.inconnus('gorrain', 'nain').length && npcs.level(n) >= 1) O.push({ label: 'Apprenez-moi la langue des pierres', act: 'lg:gorrain' });
      if (vuesSans('gorrain').length && npcs.level(n) >= 3) O.push({ label: 'Que disent les cupules que j’ai vues ?', act: 'lg:cupules' });
    }
    return O;
  },
  lecon(lang, mots) { return mots.map((b) => `« ${b} » : ${LANGUES[lang].lex[b]}.`).join(' '); },
  // le bibliothécaire : une leçon par jour (deux mots, ou un mot d'une pierre)
  leconDuJour() { const LS = livres.S(), B = LS.libraire || (LS.libraire = { j: 0 }); return B.j === farm.s.day; },
  choisir(tk, n, act) {
    const s = farm.s;
    const V = (t) => tk.view(t, tk.options());
    if ((act === 'lg:mots' || act === 'lg:trad' || act.startsWith('lg:t:')) && this.leconDuJour()) return V('Une leçon par jour. La mémoire ne se remplit pas comme une bourse. Revenez demain.');
    if (act === 'lg:mots') {
      if (!farm.pay(30)) return V('Trente pièces. Le savoir se paie ; l’ignorance aussi, mais plus tard.');
      sound.coin && sound.coin();
      const L = this.enseigner('aelin', 2, 'libraire');
      if (L.length) livres.S().libraire.j = s.day;
      npcs.addAmitie(n, 6);
      return V(L.length ? `Écoutez bien, je ne répète pas. ${this.lecon('aelin', L)} Le reste, les pierres vous le diront, si vous savez les comparer.` : 'Vous en savez déjà autant que moi. C’est inquiétant.');
    }
    if (act === 'lg:trad') {
      const ids = Object.keys(this.S()).filter((id) => INSCR_BY_ID[id] && INSCR_BY_ID[id].lang === 'aelin' && !this.sensConnu(id));
      if (!ids.length) return V('Je n’ai rien à vous apprendre sur vos pierres.');
      return tk.view('Je ne lis pas à votre place. Récitez-moi les traits d’une pierre : je vous en donnerai un mot, un seul. Vingt pièces.', ids.slice(0, 7).map((id) => { const v = this.S()[id]; return { label: `La pierre relevée le jour ${v.j}${v.ou ? ' (' + v.ou + ')' : ''}`, act: 'lg:t:' + id }; }).concat([{ label: 'Aucune, merci', act: 'chat' }]));
    }
    if (act.startsWith('lg:t:')) {
      const id = act.slice(5), I = INSCR_BY_ID[id];
      if (!I) return V('…');
      // un mot inconnu de la pierre, pris dans l'ordre mêlé du bibliothécaire (pas forcément le plus parlant)
      const mot = this.meler(I.lang, this.mots(id).filter((b) => !savoir.motConnu(I.lang, b)), 'libraire:pierre')[0];
      if (!mot) return V('Vous la lisez déjà mieux que moi.');
      if (!farm.pay(20)) return V('Vingt pièces. Les pierres ne parlent pas gratuitement, et moi non plus.');
      sound.coin && sound.coin();
      this.apprendre(I.lang, [mot], 'libraire');
      livres.S().libraire.j = s.day;
      npcs.addAmitie(n, 5);
      return V(`Hm. Ce signe-là, « ${mot} », veut dire ${LANGUES[I.lang].lex[mot]}. Le reste, cherchez-le. Je n’enseigne pas à lire à votre place.`);
    }
    if (act === 'lg:gorrain') {
      const LS = livres.S(), L0 = LS.lecons || (LS.lecons = { j: 0, n: 0 });
      if (L0.j !== s.day) { L0.j = s.day; L0.n = 0; }
      const quota = 1 + Math.floor(npcs.level(n) / 6);
      if (L0.n >= quota) return V('Assez pour aujourd’hui. Une pierre à la fois, grand. Les géants mettent cent ans à dire une phrase.');
      const L = this.enseigner('gorrain', 1, 'nain');
      L0.n += L.length;
      return V(L.length ? `La langue des pierres. ${this.lecon('gorrain', L)} Répète. … Mal. Mais tu répètes.` : 'Tu sais tout ce que je sais des pierres.');
    }
    if (act === 'lg:cupules') {
      // pas de traduction : quelques mots de travers sur une pierre qu'on a relevée, une fois par pierre
      const V0 = this.S(), ids = Object.keys(V0).filter((k) => INSCR_BY_ID[k] && INSCR_BY_ID[k].lang === 'gorrain' && !this.sensConnu(k));
      const id = ids.find((k) => !V0[k].dit && CUPULES_ANCIEN[k]);
      if (!id) return V(ids.length ? 'Je t’ai dit ce que j’en savais. Lis-les toi-même. Les pierres ne mentent pas ; moi, parfois.' : 'Tu as tout lu.');
      V0[id].dit = 1;
      return V(`Celle que tu as relevée le jour ${V0[id].j} ? ${CUPULES_ANCIEN[id]} Les Gorr gravaient peu. Ce qu’ils gravaient comptait.`);
    }
    return V('…');
  },
};

// ---------------------------------------------------------------- lire une pierre (touche E)
HOOKS.inter.inscription = (it) => { const id = it.data && it.data.ins; if (id) langues.lireInscription(id); };

// ---------------------------------------------------------------- les leçons dans les dialogues
{
  const _options = talk.options.bind(talk);
  talk.options = function () {
    const opts = _options();
    try {
      const n = this.n;
      if (n && farm.s && !npcs.murdererKnown()) {
        const extra = langues.options(n);
        if (extra.length) { const i = opts.findIndex((o) => o.act === 'bye'); opts.splice(i >= 0 ? i : opts.length, 0, ...extra); }
      }
    } catch (e) { console.error(e); }
    return opts;
  };
  const _choose = talk.choose.bind(talk);
  talk.choose = function (act) {
    if (typeof act === 'string' && act.startsWith('lg:') && this.n) return langues.choisir(this, this.n, act);
    return _choose(act);
  };
}

// ---------------------------------------------------------------- génération : les stèles manquantes (après tout le reste de la vallée)
{
  const _gv = generateValley;
  generateValley = async function (seed, progress, gen) {
    const w = await _gv(seed, progress, gen);
    if (w && w.designed) { try { langues.poserSteles(w, w.seed || seed); } catch (e) { console.error(e); } }
    return w;
  };
}
