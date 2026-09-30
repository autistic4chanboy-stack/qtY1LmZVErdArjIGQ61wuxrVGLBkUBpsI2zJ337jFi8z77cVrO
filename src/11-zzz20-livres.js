// ============================================================================
//  LES LIVRES : on les lit (clic, le livre en main, ou depuis la sacoche) dans
//  un lecteur en forme de livre ouvert (page de titre, pages, flèches ← → pour
//  tourner, Échap pour refermer).
//  - bestiaire, herbier et livre des poissons sont composés à la lecture, d'après
//    les notices (avec la marque « vue » ou « pris » de ce qu'on a rencontré) ;
//  - les manuels enseignent leurs recettes, les lexiques leurs mots ;
//  - certains livres de la grande bibliothèque livrent un secret :
//    livres.secret(clé) → jour où on l'a appris (0 sinon).
//  État : farm.s.livres = { secrets: {clé: jour}, marque: {id: double page},
//         fini: {id: jour}, ins: {…} (inscriptions, voir 11-zzz22-langues.js) }
// ============================================================================
const livres = {
  cur: null,
  // livres qui ne sont pas des objets (registre des archives, documents de la vitrine…) : id -> { titre, auteur, col, pages() }
  speciaux: {},
  S() {
    const s = farm.s;
    const L = s.livres || (s.livres = {});
    for (const k of ['secrets', 'marque', 'fini', 'ins', 'grammaire']) if (!L[k] || typeof L[k] !== 'object') L[k] = {};
    return L;
  },
  secret(k) { return (farm.s && this.S().secrets[k]) || 0; },
  apprendreSecret(k) {
    if (!k || !farm.s) return false;
    const S = this.S();
    if (S.secrets[k]) return false;
    S.secrets[k] = farm.s.day;
    return true;
  },
  def(id) { return LIVRES[id] || this.speciaux[id] || null; },
  ville(t) { return String(t || '').replace(/Valbrume/g, (farm.names && farm.names.ville) || 'Valbrume'); },

  // ------------------------------------------------------------ les pages
  pages(id) {
    const L = this.def(id);
    if (!L) return [];
    let P;
    if (L.gen === 'bestiaire') P = this.pagesBestiaire();
    else if (L.gen === 'herbier') P = this.pagesHerbier();
    else if (L.gen === 'poissons') P = this.pagesPoissons();
    else if (L.langue) P = this.pagesLexique(L);
    else if (typeof L.pages === 'function') P = L.pages();
    else P = (L.pages || []).map((p) => ({ titre: this.ville(p.titre), texte: this.ville(p.texte) }));
    if (L.recettes) P = P.concat(this.pagesRecettes(L));
    if (!P.length) P.push({ texte: L.desc || '' });
    // ce que livre la dernière page : le secret, la carte
    const last = P[P.length - 1];
    if (L.secret) last.learn = Object.assign({}, last.learn, { secret: L.secret });
    if (L.carte) last.html = (last.html || `<div class="txt">${this.txt(last.texte)}</div>`) + `<p class="deplier-p"><button class="deplier" data-carte="${esc(L.carte)}">Déplier les feuillets</button></p>`;
    // page de titre
    P.unshift({ couv: true, html: `<div class="tp"><div class="orn">❦</div><h2>${esc(this.ville(L.titre))}</h2><div class="aut">${esc(this.ville(L.auteur || ''))}</div><div class="orn">❧</div>${L.desc ? `<p class="desc">${esc(this.ville(L.desc))}</p>` : ''}</div>` });
    return P;
  },
  txt(t) { return esc(t || '').replace(/\n/g, '<br>'); },
  cap(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); },
  liste(a) { if (a.length <= 1) return a[0] || ''; const debut = a.slice(0, -1).join(', '), fin = a[a.length - 1]; return `${debut} et ${fin}`; },
  // découpe des fiches en pages (un budget de caractères par page)
  paginer(groupes, budget) {
    const P = [];
    for (const g of groupes) {
      let cur = null, n = 0;
      for (const e of g.fiches) {
        if (!cur || n + e.len > budget) { cur = { titre: cur ? `${g.titre} (suite)` : g.titre, html: '' }; P.push(cur); n = 60; }
        cur.html += e.html; n += e.len;
      }
    }
    return P;
  },
  fiche(nom, marque, vu, corps, meta, img) {
    const html = `<div class="fiche">${img ? `<img src="${img}" alt="">` : ''}<b>${esc(nom)}</b><span class="${vu ? 'vu' : 'pasvu'}">${esc(marque)}</span><div>${corps}</div>${meta ? `<div class="meta">${esc(meta)}</div>` : ''}</div>`;
    return { html, len: nom.length + corps.length * 0.92 + (meta ? meta.length : 0) + 40 };
  },
  habitats(hab) { return this.liste((hab || []).map((h) => (typeof HABITATS !== 'undefined' && HABITATS[h]) || h)); },
  rarete(r) { const t = (typeof RARETE !== 'undefined' && RARETE[r]) || 'inconnue'; return `Rareté : ${t}.`; },
  milieux(hab) { return hab && hab.length ? `Milieux : ${this.habitats(hab)}. ` : ''; },
  pagesBestiaire() {
    const DANGER = ['', ' Peut se défendre.', ' Dangereux.', ' Très dangereux.'];
    const esp = {};
    for (const e of (typeof ESPECES_ANIMAUX !== 'undefined' ? ESPECES_ANIMAUX : [])) esp[e[0]] = e;
    const groupes = {}, ordre = Object.keys(typeof HABITATS !== 'undefined' ? HABITATS : {});
    for (const kind of Object.keys(NOTICE_ANIMAUX)) {
      const E = esp[kind], hab = E ? E[2] : [], g = hab[0] || 'autres';
      const nom = E ? E[1] : (CREATURES[kind] && CREATURES[kind].name) || kind;
      const vu = savoir.vu(kind) > 0;
      const meta = this.milieux(hab) + (E ? this.rarete(E[3]) : '') + (E ? DANGER[E[4] || 0] : '');
      (groupes[g] || (groupes[g] = [])).push(this.fiche(nom, vu ? '✓ déjà vue' : 'jamais vue', vu, esc(NOTICE_ANIMAUX[kind]), meta));
    }
    const G = ordre.concat(['autres']).filter((k) => groupes[k]).map((k) => ({ titre: this.cap(k === 'autres' ? 'Ailleurs' : HABITATS[k]), fiches: groupes[k] }));
    const vus = Object.keys(NOTICE_ANIMAUX).filter((k) => savoir.vu(k) > 0).length;
    const tot = Object.keys(NOTICE_ANIMAUX).length;
    return [{ titre: 'Au lecteur', texte: `Les bêtes sont rangées d’après le lieu où on les rencontre le plus souvent. Beaucoup vivent aussi ailleurs : la notice le dit.\n\nUne coche marque celles que vous avez vues de vos yeux. Vous en avez vu ${vus} sur ${tot}.` }].concat(this.paginer(G, 820));
  },
  pagesHerbier() {
    const esp = {};
    for (const e of (typeof ESPECES_PLANTES !== 'undefined' ? ESPECES_PLANTES : [])) esp[e[0]] = e;
    const arb = {};
    for (const e of (typeof ESPECES_ARBRES !== 'undefined' ? ESPECES_ARBRES : [])) arb[e[0]] = e;
    const poison = new Set();
    for (const p of (typeof PLANTES2 !== 'undefined' ? PLANTES2 : [])) if (p[7] && p[7].poison) poison.add(p[0]);
    const nomObj = (id) => (OBJ_INDEX[id] !== undefined ? OBJ_TYPES[OBJ_INDEX[id]].name : id);
    const groupes = {}, ordre = Object.keys(typeof HABITATS !== 'undefined' ? HABITATS : {});
    for (const id of Object.keys(NOTICE_PLANTES)) {
      const E = esp[id], hab = E ? E[1] : [], g = hab[0] || 'autres';
      const H = HARVEST[id], drop = H && H.drop && H.drop[0] && H.drop[0][0];
      const look = drop && typeof PLANT_LOOK !== 'undefined' && PLANT_LOOK[drop];
      const vu = savoir.vu(id) > 0;
      let corps = esc(NOTICE_PLANTES[id]);
      if (look) corps = `<i>${esc(`Aspect : ${look[1]}`)}</i> ` + corps;
      const meta = this.milieux(hab) + (E ? this.rarete(E[2]) : '') + (poison.has(id) || (drop && ITEMS[drop] && ITEMS[drop].poison) ? ' Toxique.' : '');
      const img = drop && ITEMS[drop] ? iconURL(drop) : '';
      (groupes[g] || (groupes[g] = [])).push(this.fiche(nomObj(id), vu ? '✓ déjà vue' : 'jamais vue', vu, corps, meta, img));
    }
    const G = ordre.concat(['autres']).filter((k) => groupes[k]).map((k) => ({ titre: this.cap(k === 'autres' ? 'Ailleurs' : HABITATS[k]), fiches: groupes[k] }));
    const arbres = Object.keys(NOTICE_ARBRES).map((id) => {
      const E = arb[id], vu = savoir.vu(id) > 0;
      const meta = E ? this.milieux(E[1]) + this.rarete(E[2]) : '';
      return this.fiche(nomObj(id), vu ? '✓ déjà vu' : 'jamais vu', vu, esc(NOTICE_ARBRES[id]), meta);
    });
    G.push({ titre: 'Les arbres', fiches: arbres });
    return [{ titre: 'Au lecteur', texte: 'Les noms donnés ici sont les vrais. Mais une plante cueillie ne dit pas son nom : on ne voit d’elle que son allure, et bien des poisons ressemblent à des salades. Pour être sûr de ce que vous avez dans votre sac, montrez-le à l’alchimiste de la ville.\n\nL’aspect de chaque plante est décrit en italique, pour vous aider à la reconnaître. Une coche marque celles que vous avez vues.' }].concat(this.paginer(G, 760));
  },
  pagesPoissons() {
    const eaux = typeof EAUX !== 'undefined' ? EAUX : {};
    const ordre = Object.keys(eaux), groupes = {};
    const HEURE = { jour: 'Mord le jour.', nuit: 'Mord la nuit.', tout: 'Mord à toute heure.' };
    for (const id of Object.keys(NOTICE_POISSONS)) {
      const F = FISH[id];
      if (!F) continue;
      const where = F.where || [], g = where[0] || 'autres';
      const pris = savoir.vu(id) > 0;
      const r = typeof fishRarete === 'function' ? fishRarete(id) : 1;
      const lesEaux = this.liste(where.map((k) => eaux[k] || k));
      let meta = `Eaux : ${lesEaux}. ` + (HEURE[F.time] || '') + ' ' + this.rarete(r);
      if (F.rain) meta += ' Mord mieux sous la pluie.';
      if (F.moon) meta += ' Seulement les nuits de lune.';
      (groupes[g] || (groupes[g] = [])).push(this.fiche(F.name, pris ? '✓ déjà pris' : 'jamais pris', pris, esc(NOTICE_POISSONS[id]), meta, ITEMS[id] ? iconURL(id) : ''));
    }
    const G = ordre.concat(['autres']).filter((k) => groupes[k]).map((k) => ({ titre: this.cap(k === 'autres' ? 'Ailleurs' : eaux[k]), fiches: groupes[k] }));
    const pris = Object.keys(NOTICE_POISSONS).filter((k) => savoir.vu(k) > 0).length;
    const tot = Object.keys(NOTICE_POISSONS).length;
    return [{ titre: 'Au pêcheur', texte: `Chaque eau a ses poissons : on ne prend pas une truite dans la vase, ni une tanche dans le torrent. Les poissons sont rangés d’après l’eau où on les trouve d’abord ; la notice dit où d’autre.\n\nVous en avez pris ${pris} sortes sur ${tot}.` }].concat(this.paginer(G, 800));
  },
  pagesRecettes(L) {
    const P = [];
    const list = (L.recettes || []).filter((o) => RECIPES.some((r) => r.out === o));
    for (let i = 0; i < list.length; i += 4) {
      const outs = list.slice(i, i + 4);
      const html = outs.map((o) => {
        const r = RECIPES.find((q) => q.out === o);
        const need = Object.keys(r.need).map((k) => r.need[k] + ' ' + (ITEM_GROUPS[k] ? GROUP_NAMES[k] || k : itemName(k).toLowerCase())).join(', ');
        return `<div class="fiche"><img src="${iconURL(o)}" alt=""><b>${esc(itemName(o))}${r.n > 1 ? ' ×' + r.n : ''}</b><div>${esc(need)}.</div>${r.st ? `<div class="meta">${esc(`Il faut ${STATION_NAMES[r.st]}.`)}</div>` : ''}</div>`;
      }).join('');
      P.push({ titre: i === 0 ? 'Les ouvrages' : 'Les ouvrages (suite)', html, learn: { recettes: outs } });
    }
    return P;
  },
  // les mots d'un lexique : une tranche (L.depuis, L.mots) de l'ordre mêlé des livres, propre à la partie (aucun
  // lexique ne donne toute la langue, ni d'abord les mots des pierres), rangée par ordre alphabétique
  motsLexique(L) {
    const lex = (LANGUES[L.langue] && LANGUES[L.langue].lex) || {};
    const O = typeof langues !== 'undefined' ? langues.ordre(L.langue, 'livres') : Object.keys(lex), d = L.depuis || 0;
    return O.slice(d, d + (L.mots || 999)).sort((a, b) => a.localeCompare(b));
  },
  pagesLexique(L) {
    const lg = LANGUES[L.langue];
    if (!lg) return [];
    const P = [{ titre: 'Préface', texte: `${lg.desc}\n\nOn l’écrit en ${lg.ecriture}. Ceux qui la parlaient : ${lg.peuple}.`, learn: { grammaire: L.langue } }];
    const mots = this.motsLexique(L);
    for (let i = 0; i < mots.length; i += 7) {
      const part = mots.slice(i, i + 7);
      const html = part.map((m) => `<div class="mot"><img src="${typeof langues !== 'undefined' ? langues.glypheURL(L.langue, m, 'page') : ''}" alt=""><span><i>${esc(m)}</i> — ${esc(lg.lex[m])}</span></div>`).join('');
      P.push({ titre: 'Vocabulaire', html, learn: { mots: [L.langue, part] } });
    }
    return P;
  },

  // ------------------------------------------------------------ le lecteur
  // opts : { surPlace: true } (rayonnages : quelques pages seulement)
  ouvrir(id, opts) {
    opts = opts || {};
    const L = this.def(id);
    if (!L || !farm.s) return false;
    this.style();
    if (!$('#livre')) { const el = document.createElement('div'); el.id = 'livre'; el.className = 'pp-panel'; $('#paper').appendChild(el); }
    const pages = this.pages(id);
    const S = this.S();
    let limite;
    if (opts.surPlace) {
      const n = pages.length - 1, special = L.secret || L.recettes || L.carte;
      limite = L.langue ? 2 : L.carte ? 0 : Math.max(1, Math.min(2, special ? n - 1 : n));
      if (limite >= n && !special) limite = undefined;
      if (L.carte) opts.msgLimite = opts.msgLimite || '(Trop fragiles pour être dépliés ici. Il faut les emprunter.)';
    } else savoir.lire(id);
    const spreads = Math.ceil(pages.length / 2);
    const spread = opts.surPlace ? 0 : clamp(S.marque[id] || 0, 0, spreads - 1);
    this.cur = { id, L, pages, spread, limite, opts, msgs: [] };
    ui.open('#livre', '');
    this.rendre();
    return true;
  },
  tourner(d) {
    const C = this.cur;
    if (!C || ui.panel !== '#livre') return;
    const n = Math.ceil(C.pages.length / 2);
    const k = clamp(C.spread + d, 0, n - 1);
    if (k === C.spread) return;
    C.spread = k;
    if (!C.opts.surPlace) this.S().marque[C.id] = k;
    sound.page && sound.page();
    this.rendre();
  },
  rendre() {
    const C = this.cur, el = $('#livre');
    if (!C || !el) return;
    const P = C.pages, i0 = C.spread * 2, n = Math.ceil(P.length / 2);
    const locked = (i) => C.limite !== undefined && i > C.limite;
    const page = (i, side) => {
      const pg = P[i];
      if (!pg) return `<div class="pg ${side} vide"></div>`;
      let inner;
      if (locked(i)) inner = `<div class="scelle">${esc(C.opts.msgLimite || '(Pour lire la suite, il faut emprunter ce livre.)')}</div>`;
      else inner = (pg.titre ? `<h4>${esc(pg.titre)}</h4>` : '') + (pg.html || `<div class="txt">${this.txt(pg.texte)}</div>`);
      return `<div class="pg ${side}${pg.couv ? ' couv' : ''}">${inner}${i > 0 ? `<div class="num">${i}</div>` : ''}</div>`;
    };
    const col = C.L.col || '#6a2a24';
    el.style.setProperty('--cuir', col);
    el.innerHTML = `<div class="spread">${page(i0, 'l')}${page(i0 + 1, 'r')}</div>
      <div class="nav"><button data-nav="-1" ${C.spread > 0 ? '' : 'disabled'}>‹ Page précédente</button><span class="where">${C.spread + 1} / ${n}${C.opts.surPlace ? ' · lecture sur place' : ''}</span><button data-nav="1" ${C.spread < n - 1 ? '' : 'disabled'}>Page suivante ›</button><button class="ferme" data-close>Refermer</button></div>
      <div class="appris"></div>`;
    $$('#livre [data-nav]').forEach((b) => (b.onclick = () => this.tourner(+b.dataset.nav)));
    $('#livre [data-close]').onclick = () => ui.close();
    $$('#livre [data-carte]').forEach((b) => (b.onclick = () => { if (typeof cartes !== 'undefined') cartes.ouvrir(b.dataset.carte); }));
    // ce que l'on apprend en lisant ces deux pages
    const msgs = [];
    for (const i of [i0, i0 + 1]) if (P[i] && !locked(i)) this.apprendre(P[i], msgs);
    if (i0 + 1 >= P.length - 1 && !locked(P.length - 1)) {
      const S = this.S();
      if (!S.fini[C.id]) S.fini[C.id] = farm.s.day;
      if (C.opts.surPlace) savoir.lire(C.id);
    }
    if (msgs.length) {
      C.msgs = msgs;
      const ap = $('#livre .appris');
      if (ap) { ap.textContent = msgs.join(' '); ap.classList.add('on'); }
      sound.quest && sound.quest(false);
    }
  },
  apprendre(pg, msgs) {
    const A = pg.learn;
    if (!A) return;
    if (A.recettes) {
      const neuves = [];
      for (const o of A.recettes) {
        const ok = savoir.apprendreRecette(o, 'livre');
        if (LOCKED_RECIPES.has(o) && !farm.s.known[o]) { farm.s.known[o] = 1; if (!ok && !neuves.includes(o)) neuves.push(o); }
        if (ok) neuves.push(o);
      }
      if (neuves.length) { const liste = neuves.map((o) => itemName(o)).join(', '); msgs.push(`(Vous savez désormais fabriquer : ${liste}.)`); }
    }
    if (A.mots) {
      const [lang, liste] = A.mots;
      const n = typeof langues !== 'undefined' ? langues.apprendre(lang, liste, 'livre') : savoir.apprendreMots(lang, liste);
      if (n) msgs.push(lang === 'aelin' ? (n > 1 ? `(Vous retenez ${n} mots d’aëlin.)` : '(Vous retenez un mot d’aëlin.)') : (n > 1 ? `(Vous retenez ${n} mots de gorrain.)` : '(Vous retenez un mot de gorrain.)'));
    }
    if (A.secret && this.apprendreSecret(A.secret)) msgs.push('(Ce que vous venez de lire, vous ne l’oublierez pas.)');
    if (A.grammaire && farm.s) { const G = this.S().grammaire; if (!G[A.grammaire]) G[A.grammaire] = farm.s.day; }
  },
  style() {
    if (this.styled) return;
    this.styled = true;
    const st = document.createElement('style');
    st.textContent = `#livre{--cuir:#6a2a24;width:min(960px,calc(100vw - 24px));margin-bottom:4vh;padding:14px 16px 10px;background:linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.28)),var(--cuir);border-radius:7px;box-shadow:0 18px 50px rgba(0,0,0,.7),inset 0 0 0 2px rgba(0,0,0,.25),inset 0 0 22px rgba(0,0,0,.45)}
#livre::before{display:none}
#livre .spread{display:flex;height:min(560px,68vh);background:#efe6cf;border-radius:3px;box-shadow:0 2px 6px rgba(0,0,0,.4)}
#livre .pg{position:relative;flex:1;min-width:0;padding:24px 30px 30px;overflow-y:auto;scrollbar-width:thin;font:15px/1.55 Georgia,'Times New Roman',serif;color:#33291d;background:repeating-linear-gradient(0deg,rgba(120,90,40,.035) 0 2px,transparent 2px 5px)}
#livre .pg.l{box-shadow:inset -22px 0 26px -20px rgba(70,45,20,.45);border-right:1px solid rgba(90,70,40,.25)}
#livre .pg.r{box-shadow:inset 22px 0 26px -20px rgba(70,45,20,.45)}
#livre .pg h4{margin:0 0 10px;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#7a5e3a;font-weight:normal;text-align:center}
#livre .pg .num{position:absolute;bottom:8px;font-size:12px;color:#8a7a5a}
#livre .pg.l .num{left:30px}#livre .pg.r .num{right:30px}
#livre .tp{text-align:center;padding-top:12%}
#livre .tp h2{font-weight:normal;font-size:26px;line-height:1.25;margin:14px 10px 8px;color:#3a2814}
#livre .tp .aut{font-style:italic;color:#6a5436}
#livre .tp .orn{font-size:26px;color:#8a6a44;margin:10px 0}
#livre .tp .desc{font-size:14px;color:#5a4a36;font-style:italic;margin:18px 12px 0;line-height:1.5}
#livre .fiche{margin:0 0 11px;padding-bottom:9px;border-bottom:1px dashed rgba(90,70,40,.22);font-size:14px;line-height:1.45;overflow:hidden}
#livre .fiche img{float:left;width:30px;height:30px;image-rendering:pixelated;margin:1px 8px 2px 0}
#livre .fiche b{font-size:15px;color:#2d2216}
#livre .fiche .vu,#livre .fiche .pasvu{float:right;font-size:11.5px;font-style:italic;margin-left:6px}
#livre .fiche .vu{color:#3a6a2a}#livre .fiche .pasvu{color:#9a8a6a}
#livre .fiche .meta{font-size:12.5px;font-style:italic;color:#6a5436;margin-top:2px}
#livre .mot{display:flex;align-items:center;gap:10px;margin:0 0 7px;font-size:14.5px}
#livre .mot img{height:38px;min-width:24px;image-rendering:auto;flex:none}
#livre .scelle{margin-top:30%;text-align:center;font-style:italic;color:#8a6a4a;padding:0 12px}
#livre .nav{display:flex;align-items:center;gap:10px;padding:9px 2px 2px;color:#eadfc4;font:14px Georgia,serif}
#livre .nav .where{flex:1;text-align:center;opacity:.8;font-style:italic}
#livre .nav button{background:rgba(0,0,0,.18);border:1px solid rgba(240,225,190,.35);color:#f2e8cf;padding:5px 14px;font:14px Georgia,serif;border-radius:3px;cursor:pointer}
#livre .nav button:disabled{opacity:.35;cursor:default}
#livre .nav .ferme{margin-left:6px}
#livre .appris{min-height:0;color:#f4e6b0;font:italic 14px Georgia,serif;text-align:center;padding:0 4px}
#livre .appris.on{padding:4px}
#livre .deplier-p{text-align:center;margin-top:18px}
#livre .deplier{background:#8a5a2a;color:#f4ead2;border:none;border-radius:3px;padding:7px 16px;font:15px Georgia,serif;cursor:pointer}
@media (max-width:700px){#livre .spread{flex-direction:column;height:72vh;overflow-y:auto}#livre .pg{overflow:visible}}`;
    document.head.appendChild(st);
  },
};

// ---------------------------------------------------------------- lire : clic, le livre en main
HOOKS.primary.push((eye, basis, held, it, id) => {
  if (!it || !it.book) return false;
  if (!held) { livres.ouvrir(it.book); play.cool = 0.4; }
  return true;
});
// ← → : tourner les pages
window.addEventListener('keydown', (e) => {
  if (typeof ui === 'undefined' || ui.panel !== '#livre') return;
  if (e.code === 'ArrowLeft') { livres.tourner(-1); e.preventDefault(); }
  else if (e.code === 'ArrowRight') { livres.tourner(1); e.preventDefault(); }
});
// chaque livre dit qu'il se lit
for (const id in LIVRES) {
  const it = ITEMS['livre_' + id];
  if (it && it.desc !== undefined && !/^Clic/.test(it.desc)) it.desc = 'Clic : le lire. ' + it.desc;
}

// ---------------------------------------------------------------- les marchands vendent les livres
{
  const vend = (npc, list) => {
    const d = NPC_DATA.find((q) => q.id === npc);
    if (!d || !d.shop) return;
    d.shop.sells = d.shop.sells || [];
    for (const [id, p] of list) if (ITEMS[id] && !d.shop.sells.some(([k]) => k === id)) d.shop.sells.push([id, p]);
  };
  const L = (id) => ['livre_' + id, LIVRES[id].prix];
  // « chez le marchand » : la graineterie de la ville tient aussi les livres des espèces et des sciences
  vend('grainetiere', LIVRES_MARCHANDS.map(L));
  vend('pecheur', [L('poissons')]);
  vend('guerisseuse', [L('herbier')]);
  vend('boulangere', [L('manuel_cuisine')]);
  vend('forgeron', [L('manuel_forgeron')]);
  vend('colporteur', [L('manuel_jardin')]);
  vend('colporteuse', [L('bestiaire'), L('herbier')]);
}
