// ============================================================================
//  FABRICATION PAR ASSEMBLAGE
//  - Pas de liste toute faite : on pose de un à cinq objets de la sacoche sur
//    l'établi d'assemblage, avec leurs quantités, et l'on assemble. Si cela
//    correspond à une recette (RECIPES : mêmes objets, quantités suffisantes ;
//    les groupes ITEM_GROUPS comptent) et que le poste voulu est à portée, on
//    fabrique, et la recette est connue pour la suite. Sinon, un indice sobre.
//  - Le personnage connaît les recettes de base (CRAFT_BASE) ; les autres se
//    trouvent en assemblant, dans les livres (savoir.apprendreRecette), auprès
//    des habitants de métier, ou en récompense d'une quête.
//  - farm.knows suit savoir.recetteConnue ; une partie commencée avant garde
//    tout ce qu'elle savait faire.
//  Sauvegarde : farm.s.fab
// ============================================================================
const fabrication = {
  slots: [null, null, null, null, null], msg: null, offre: null,

  S() {
    const s = farm.s;
    const F = s.fab || (s.fab = { v: 1 });
    if (!F.lecons) F.lecons = {};
    return F;
  },

  // ================================================================ l'établi d'assemblage
  nettoyer() {
    this.slots = this.slots.map((sl) => { if (!sl) return null; const c = farm.count(sl.id); return c > 0 ? { id: sl.id, n: Math.max(1, Math.min(sl.n, c)) } : null; });
  },
  placees() { return this.slots.filter(Boolean).map((sl) => ({ id: sl.id, n: sl.n })); },
  ajouter(id, k) {
    if (!ITEMS[id]) return;
    const c = farm.count(id), sl = this.slots.find((x) => x && x.id === id);
    if (sl) { sl.n = Math.min(c, sl.n + k); return; }
    const i = this.slots.indexOf(null);
    if (i < 0) { this.msg = { t: 'L’établi est plein : cinq objets au plus.', k: 'no' }; return; }
    this.slots[i] = { id, n: Math.max(1, Math.min(c, k)) };
    this.msg = null;
  },
  // une recette et ce qu'on a posé : 'exact' (et ce qu'on consommera), 'court' (pas assez), 'partiel' (il manque un objet), ou null
  essayer(r, placed) {
    const keys = Object.keys(r.need), par = {};
    for (const p of placed) {
      const k = keys.includes(p.id) ? p.id : keys.find((q) => ITEM_GROUPS[q] && ITEM_GROUPS[q].includes(p.id));
      if (!k) return null; // un objet qui n'a rien à faire là
      (par[k] = par[k] || []).push(p);
    }
    if (keys.some((k) => !par[k])) return { etat: 'partiel' };
    const need = {};
    let court = false;
    for (const k of keys) {
      let reste = r.need[k];
      if (par[k].reduce((a, p) => a + p.n, 0) < reste) { court = true; continue; }
      for (const p of par[k]) { const t = Math.min(p.n, reste); if (t > 0) need[p.id] = (need[p.id] || 0) + t; reste -= t; }
    }
    return court ? { etat: 'court' } : { etat: 'exact', need };
  },
  // ce que donne l'assemblage posé : { r, need } à fabriquer, ou { indice }
  chercher(placed) {
    let best = null, court = false, partiel = false;
    for (const r of RECIPES) {
      if (!ITEMS[r.out]) continue;
      const m = this.essayer(r, placed);
      if (!m) continue;
      if (m.etat === 'court') { court = true; continue; }
      if (m.etat === 'partiel') { partiel = true; continue; }
      const poids = Object.values(r.need).reduce((a, b) => a + b, 0), poste = !r.st || game.nearStation(r.st);
      const note = poids * 4 + (poste ? 2 : 0) + (savoir.recetteConnue(r.out) ? 1 : 0);
      if (!best || note > best.note) best = { r, need: m.need, poste, note };
    }
    if (best && best.poste) return best;
    if (best) return { indice: `Il faudrait ${STATION_NAMES[best.r.st]}.`, poste: best.r.st };
    return { indice: court ? 'C’est l’idée, mais il en faudrait davantage.' : partiel ? 'Il manque quelque chose.' : 'Rien ne sort de cet assemblage.' };
  },
  assembler() {
    this.nettoyer();
    const placed = this.placees();
    if (!placed.length) return;
    const F = this.S(), R = this.chercher(placed);
    F.essais = (F.essais || 0) + 1;
    if (!R.r) { this.msg = { t: R.indice, k: R.poste ? 'hint' : 'no' }; sound.click && sound.click(); return; }
    const r = R.r, avant = farm.count(r.out);
    game.craft({ out: r.out, n: r.n, need: R.need, st: r.st });
    if (farm.count(r.out) <= avant) { this.msg = { t: 'Quelque chose manque, au dernier moment.', k: 'no' }; return; }
    const neuf = savoir.apprendreRecette(r.out, 'essai');
    const nom = itemName(r.out) + (r.n > 1 ? ' ×' + r.n : '');
    if (neuf) {
      F.trouvees = (F.trouvees || 0) + 1;
      this.msg = { t: `Nouvelle recette : ${itemName(r.out)}. Vous fabriquez : ${nom}.`, k: 'new' };
      ui.subtitle('', `(Nouvelle recette : ${itemName(r.out)}.)`, 3.5);
      sound.quest && sound.quest();
    } else this.msg = { t: `Vous fabriquez : ${nom}.`, k: 'ok' };
    this.nettoyer();
  },
  recettesConnues() {
    const vus = new Set(), out = [];
    for (const r of RECIPES) {
      if (!ITEMS[r.out] || !savoir.recetteConnue(r.out)) continue;
      const k = r.out + '|' + JSON.stringify(r.need) + '|' + r.st;
      if (vus.has(k)) continue;
      vus.add(k); out.push(r);
    }
    return out;
  },
  source(out) {
    if (CRAFT_BASE.has(out)) return '';
    const R = savoir.S().recettes[out];
    if (!R || R === 'ancien') return '';
    if (R === 'essai') return 'trouvée en assemblant';
    if (R === 'quete') return 'reçue en remerciement';
    if (String(R).startsWith('habitant:')) return 'apprise de ' + npcs.nameOf(String(R).slice(9));
    if (String(R).startsWith('livre')) return 'lue dans un livre';
    return '';
  },
  besoinTexte(r) {
    const parts = Object.keys(r.need).map((k) => `${r.need[k]} × ${ITEM_GROUPS[k] ? (GROUP_NAMES[k] || k) : itemName(k).toLowerCase()}`);
    return r.st ? `(Vous notez : ${parts.join(', ')} ; il faut ${STATION_NAMES[r.st]}.)` : `(Vous notez : ${parts.join(', ')}.)`;
  },

  // ---------------------------------------------------------------- l'onglet « Fabrication » de la sacoche
  rendre(body) {
    this.css();
    const s = farm.s, near = { etabli: game.nearStation('etabli'), four: game.nearStation('four'), feu: game.nearStation('feu') };
    this.nettoyer();
    const pose = {};
    for (const sl of this.slots) if (sl) pose[sl.id] = sl.n;
    const any = this.slots.some(Boolean);
    const slots = this.slots.map((sl, i) => sl
      ? `<div class="fab-slot" title="${esc(itemName(sl.id))}"><img src="${iconURL(sl.id)}" alt=""><span>${esc(itemName(sl.id))}</span><div class="q"><button data-fm="${i}" title="Un de moins (Maj : l’enlever)">−</button><b>${sl.n}</b><button data-fp="${i}" title="Un de plus (Maj : cinq)">+</button></div></div>`
      : '<div class="fab-slot vide"><span>—</span></div>').join('');
    const postes = [['etabli', 'établi'], ['four', 'four'], ['feu', 'feu']].map(([k, nm]) => `<span class="${near[k] ? 'y' : 'n'}">${esc(nm)}</span>`).join(' · ');
    const grp = {};
    for (const id in s.inv) { const it = ITEMS[id]; if (!it || !(s.inv[id] > 0) || it.cat === 'animal') continue; (grp[it.cat] = grp[it.cat] || []).push(id); }
    let inv = '';
    for (const cat of Object.keys(ITEM_CAT_NAMES)) if (grp[cat]) inv += grp[cat].map((id) => `<button class="it ${pose[id] ? 'on' : ''}" data-fi="${id}" title="${esc(itemName(id) + (ITEMS[id].desc ? ' — ' + ITEMS[id].desc : ''))}"><img src="${iconURL(id)}" alt=""><span>${esc(itemName(id))}</span><i>${s.inv[id] - (pose[id] || 0)}</i></button>`).join('');
    const connues = this.recettesConnues();
    const liste = connues.map((r) => {
      const ok = farm.has(r.need) && (!r.st || near[r.st]);
      const need = Object.keys(r.need).map((k) => `<span class="${farm.count(k) >= r.need[k] ? 'y' : 'n'}">${ITEM_GROUPS[k] ? '' : `<img src="${iconURL(k)}" alt="">`}${r.need[k]} ${esc(ITEM_GROUPS[k] ? GROUP_NAMES[k] || k : itemName(k))}</span>`).join('');
      const src = this.source(r.out);
      return `<div class="rec ${ok ? 'ok' : ''}"><img class="big" src="${iconURL(r.out)}" alt=""><div><b>${esc(itemName(r.out))}${r.n > 1 ? ' ×' + r.n : ''}</b>${src ? ` <span class="fab-src">— ${esc(src)}</span>` : ''}<div class="need">${need}</div>${r.st ? `<div class="st ${near[r.st] ? 'y' : 'n'}">Il faut ${STATION_NAMES[r.st]}${near[r.st] ? ' (à portée)' : ''}</div>` : ''}</div><button data-fcraft="${RECIPES.indexOf(r)}" ${ok ? '' : 'disabled'}>Fabriquer</button></div>`;
    }).join('');
    const nbCon = new Set(connues.map((r) => r.out)).size, nbTot = new Set(RECIPES.filter((r) => ITEMS[r.out]).map((r) => r.out)).size;
    body.innerHTML = `<div class="fab-top">
        <div class="fab-bench"><h4>L’établi d’assemblage</h4>
          <div class="fab-slots">${slots}</div>
          <div class="fab-act"><button class="close" data-fgo ${any ? '' : 'disabled'}>Assembler</button><button class="fab-clear" data-fclr ${any ? '' : 'disabled'}>Vider</button></div>
          <div class="fab-st">À portée : ${postes}</div>
          ${this.msg ? `<p class="fab-msg ${this.msg.k}">${esc(this.msg.t)}</p>` : '<p class="fab-msg">Posez de un à cinq objets, en quantités, puis assemblez. Ce qui marche se retient.</p>'}
        </div>
        <div><h4>Dans la sacoche <span>— clic : un de plus · Maj : cinq · Ctrl : tout</span></h4><div class="grid fab-inv">${inv || '<p class="hint">La sacoche est vide.</p>'}</div></div>
      </div>
      <h4>Ce que vous savez faire (${nbCon} / ${nbTot})</h4>${liste || '<p class="hint">Rien encore.</p>'}
      <p class="hint">Les autres recettes se trouvent en assemblant, dans les livres, auprès des gens de métier. Certains objets demandent un établi, un four ou un feu à portée.</p>`;
    const maj = () => this.maj();
    $$('#satchel [data-fi]').forEach((b) => (b.onclick = (e) => { this.ajouter(b.dataset.fi, e.ctrlKey || e.metaKey ? 9999 : e.shiftKey ? 5 : 1); sound.tick && sound.tick(); maj(); }));
    $$('#satchel [data-fm]').forEach((b) => (b.onclick = (e) => { const i = +b.dataset.fm, sl = this.slots[i]; if (!sl) return; sl.n -= e.shiftKey ? sl.n : 1; if (sl.n <= 0) this.slots[i] = null; sound.tick && sound.tick(); maj(); }));
    $$('#satchel [data-fp]').forEach((b) => (b.onclick = (e) => { const sl = this.slots[+b.dataset.fp]; if (!sl) return; sl.n = Math.min(farm.count(sl.id), sl.n + (e.shiftKey ? 5 : 1)); sound.tick && sound.tick(); maj(); }));
    const go = $('#satchel [data-fgo]'); if (go) go.onclick = () => { this.assembler(); maj(); };
    const clr = $('#satchel [data-fclr]'); if (clr) clr.onclick = () => { this.slots = [null, null, null, null, null]; this.msg = null; maj(); };
    $$('#satchel [data-fcraft]').forEach((b) => (b.onclick = () => {
      const r = RECIPES[+b.dataset.fcraft], avant = farm.count(r.out);
      game.craft(r);
      if (farm.count(r.out) > avant) this.msg = { t: `Vous fabriquez : ${itemName(r.out)}${r.n > 1 ? ' ×' + r.n : ''}.`, k: 'ok' };
      maj();
    }));
  },
  // redessine la sacoche sans perdre la position dans la liste
  maj() {
    const b = $('#satchel .body'), y = b ? b.scrollTop : 0;
    ui.renderSatchel();
    const b2 = $('#satchel .body');
    if (b2) b2.scrollTop = y;
  },
  css() {
    if ($('#fabrication-css')) return;
    const st = document.createElement('style');
    st.id = 'fabrication-css';
    st.textContent = `#satchel .fab-top { display: grid; grid-template-columns: minmax(240px, 1fr) 1.35fr; gap: 16px; }
#satchel h4 span { text-transform: none; letter-spacing: 0; font-style: italic; font-size: 12px; color: #8a7a5a; }
#satchel .fab-slots { display: flex; flex-direction: column; gap: 4px; }
#satchel .fab-slot { display: flex; align-items: center; gap: 6px; padding: 3px 6px; min-height: 38px; background: rgba(255,255,255,.4); border: 1px solid rgba(90,70,40,.3); border-radius: 4px; font-size: 13px; }
#satchel .fab-slot.vide { border-style: dashed; background: rgba(255,255,255,.15); justify-content: center; color: #a89878; }
#satchel .fab-slot img { width: 28px; height: 28px; image-rendering: pixelated; }
#satchel .fab-slot span { flex: 1; line-height: 1.15; }
#satchel .fab-slot .q { display: flex; align-items: center; gap: 3px; }
#satchel .fab-slot .q button { width: 22px; height: 22px; padding: 0; background: #8a5a2a; color: #f4ead2; border: none; border-radius: 3px; font-size: 15px; line-height: 1; }
#satchel .fab-slot .q b { min-width: 24px; text-align: center; font-weight: normal; }
#satchel .fab-act { display: flex; gap: 8px; margin: 8px 0 4px; }
#satchel .fab-act .close { padding: 6px 16px; background: #8a5a2a; color: #f4ead2; border: none; border-radius: 3px; font-size: 15px; }
#satchel .fab-act .fab-clear { padding: 6px 12px; background: none; border: 1px solid rgba(90,70,40,.4); border-radius: 3px; color: #5a4a36; font-size: 14px; }
#satchel .fab-act button:disabled { opacity: .45; }
#satchel .fab-st { font-size: 12px; font-style: italic; color: #7a6a52; }
#satchel .fab-msg { font-size: 14px; font-style: italic; color: #5a4a36; margin: 8px 0 2px; padding: 5px 8px; border-left: 3px solid rgba(90,70,40,.35); }
#satchel .fab-msg.new { background: rgba(255,230,170,.65); border-color: #8a5a2a; color: #3d2e1c; font-style: normal; }
#satchel .fab-msg.ok { border-color: #3a6a2a; color: #3a5a2a; }
#satchel .fab-msg.hint { border-color: #9a7a3a; }
#satchel .fab-inv { max-height: 300px; overflow-y: auto; scrollbar-width: thin; }
#satchel .fab-src { font-size: 12px; color: #8a7a5a; font-style: italic; font-weight: normal; }
@media (max-width: 620px) { #satchel .fab-top { grid-template-columns: 1fr; } }`;
    document.head.appendChild(st);
  },

  // ================================================================ apprendre des habitants
  // [recette, amitié minimale (npcs.level), prix] — un ami (niveau 6) ne paie plus
  LECONS: {
    forgeron: [['hache_cuivre', 0, 20], ['pioche_cuivre', 0, 20], ['seau', 1, 15], ['cisailles', 1, 25], ['faux', 2, 30], ['hache_fer', 2, 40], ['pioche_fer', 2, 40], ['pelle', 2, 30],
      ['arrosoir_cuivre', 2, 30], ['plan_atelier', 2, 60], ['houe_fer', 3, 40], ['fourche', 3, 30], ['lanterne', 3, 40], ['lingot_or', 3, 40], ['plan_puits', 3, 60], ['lingot_acier', 4, 60],
      ['canne_fer', 4, 40], ['arrosoir_fer', 4, 50], ['boussole', 5, 60], ['hache_acier', 6, 0], ['pioche_acier', 6, 0], ['montre', 7, 0]],
    grainetiere: [['epouvantail', 0, 10], ['engrais', 0, 10], ['pot_fleurs', 1, 10], ['mangeoire', 1, 15], ['nichoir', 1, 15], ['parterre', 2, 20], ['jardiniere', 2, 20], ['haie', 2, 15],
      ['composteur', 3, 30], ['engrais_riche', 3, 30], ['portillon', 3, 25], ['semoir', 4, 60], ['ruche', 4, 60], ['epouvantail_fer', 4, 40], ['arroseur', 5, 80], ['arche_fleurie', 5, 60],
      ['pergola', 6, 0], ['arroseur_fer', 7, 0]],
    eleveuse: [['mangeoire', 0, 10], ['abreuvoir', 1, 15], ['clapier', 1, 20], ['friandise', 1, 10], ['niche', 2, 20], ['meule', 2, 20], ['selle', 3, 60], ['harnais', 3, 60],
      ['baratte', 4, 60], ['plan_poulailler', 4, 80], ['plan_grange', 6, 0]],
    aubergiste: [['soupe', 0, 5], ['salade', 0, 5], ['omelette', 0, 5], ['ragout', 1, 15], ['fromage', 1, 15], ['soupe_oignon', 1, 10], ['brochette', 1, 10], ['banc', 1, 15], ['chaise', 1, 10],
      ['table', 2, 20], ['porridge', 2, 10], ['confiture', 2, 15], ['popcorn', 2, 5], ['ratatouille', 3, 25], ['gratin', 3, 25], ['tonneau', 4, 40], ['presse', 5, 60], ['fumoir', 5, 60]],
    boulangere: [['four', 0, 20], ['pain_mais', 1, 10], ['tarte', 1, 15], ['galette', 1, 10], ['crepes', 2, 10], ['tarte_citrouille', 2, 15], ['gateau', 3, 30], ['tarte_rhubarbe', 3, 30],
      ['moulin_a_bras', 4, 50]],
    guerisseuse: [['tisane', 0, 5], ['attelle', 0, 10], ['poudre_os', 1, 10], ['talisman_paille', 2, 15], ['chapelet_buis', 2, 10], ['alambic', 5, 100]],
    alchimiste: [['fiole', 0, 15], ['poudre_os', 0, 10], ['alambic', 3, 80], ['table_alchimie', 5, 150], ['lentille', 6, 0]],
    chasseur: [['piege', 0, 10], ['fleche', 0, 10], ['arc', 1, 30], ['appeau', 1, 20], ['echelle_bois', 1, 15], ['bottes', 2, 30], ['tente', 2, 30], ['fleche_fer', 3, 40], ['piege_loup', 3, 60],
      ['arc_long', 4, 80], ['cartouche', 5, 80], ['lunette', 7, 0], ['fusil', 8, 0]],
    colporteur: [['poteau_indicateur', 0, 10], ['roue', 1, 30], ['coffre', 1, 30], ['caisse_expedition', 1, 25], ['lanterne_suspendue', 2, 30], ['brouette', 2, 40], ['harnais', 3, 60],
      ['charrette', 4, 120], ['boussole', 5, 80], ['horloge', 7, 0]],
    colporteuse: [['toile', 0, 15], ['tapis', 1, 20], ['attelle', 1, 15], ['bouquet', 2, 10], ['salade_fruits', 2, 10], ['selle', 4, 60]],
    pecheur: [['soupe_poisson', 0, 10], ['piege', 1, 10], ['canne_fer', 3, 40], ['fumoir', 4, 60], ['mare', 5, 60]],
    nain_forgeronne: [['lingot_acier', 0, 40], ['lanterne', 1, 30], ['lentille', 2, 80], ['canon_fusil', 4, 120], ['lunette', 5, 120], ['pioche_acier', 5, 100], ['hache_acier', 5, 100], ['fusil', 7, 0], ['montre', 7, 0]],
    nain_ancien: [['pierre_gravee', 3, 0]],
    naturiste_b: [['attelle', 0, 0], ['infusion', 0, 0]],
    cure: [['croix_bois', 0, 5], ['chapelet_buis', 1, 5], ['autel_maison', 3, 30], ['statue_saint', 5, 60]],
  },
  optionsDialogue(n) {
    if (!n || !n.st.alive || !this.LECONS[n.id]) return [];
    return [{ label: 'Vous pourriez m’apprendre à fabriquer quelque chose ?', act: 'fab:lecon' }];
  },
  choisir(n, act) {
    const L = this.LIGNES[n.id] || this.LIGNES.defaut, s = farm.s, F = this.S();
    if (act === 'fab:non') { this.offre = null; return talk.view(pick(n.d.lines.adieu), talk.options()); }
    if (n.st.anger > 0 || npcs.murdererKnown()) return talk.view(pick(n.d.lines.greet.froid), talk.options());
    if (act === 'fab:payer') {
      const o = this.offre;
      this.offre = null;
      if (!o || o.n !== n.id) return talk.view('…', talk.options());
      if (!farm.pay(o.prix)) return talk.view(pick(L.sansArgent), talk.options());
      sound.coin && sound.coin();
      return this.enseigner(n, o.out);
    }
    const lvl = npcs.level(n);
    const reste = (this.LECONS[n.id] || []).filter(([out]) => ITEMS[out] && RECIPES.some((r) => r.out === out) && !savoir.recetteConnue(out));
    if (!reste.length) return talk.view(pick(L.fini), talk.options());
    const dispo = reste.filter(([, min]) => min <= lvl);
    if (!dispo.length) return talk.view(pick(L.pasEncore), talk.options());
    if (F.lecons[n.id] === s.day) return talk.view(pick(L.demain), talk.options());
    const [out, , base] = dispo[0];
    const prix = lvl >= 6 ? 0 : base;
    if (!prix) return this.enseigner(n, out);
    this.offre = { n: n.id, out, prix };
    return talk.view(pick(L.prix)(itemName(out), prix), [{ label: `Payer ${prix} pièces`, act: 'fab:payer' }, { label: 'Une autre fois', act: 'fab:non' }]);
  },
  enseigner(n, out) {
    const F = this.S(), L = this.LIGNES[n.id] || this.LIGNES.defaut;
    savoir.apprendreRecette(out, 'habitant:' + n.id);
    F.lecons[n.id] = farm.s.day;
    npcs.addAmitie(n, 12);
    sound.page && sound.page();
    ui.subtitle('', `(Nouvelle recette : ${itemName(out)}.)`, 3.5);
    const r = RECIPES.find((x) => x.out === out);
    return talk.view(pick(L.enseigne)(itemName(out)) + (r ? ' ' + this.besoinTexte(r) : ''), talk.options());
  },
  // ce que disent les gens de métier, chacun à sa façon
  LIGNES: {
    forgeron: {
      enseigne: [(r) => `Regardez. Une fois. « ${r} ». Le fer se travaille chaud, le bois se choisit sec. Voilà.`, (r) => `Hm. « ${r} ». Mon père me l’a montré sans un mot. Moi, je vous en dis trois : chauffez, frappez, trempez.`, (r) => `« ${r} ». Ne me faites pas répéter.`],
      prix: [(r, p) => `« ${r} », je peux vous le montrer. ${p} pièces. Le savoir, ça use l’enclume.`],
      pasEncore: ['Mon métier, je ne le donne pas au premier venu. Revenez quand on se connaîtra.', 'Non. Pas encore.'],
      fini: ['Je vous ai montré ce que je sais montrer. Le reste, c’est la main. Forgez.'],
      demain: ['Une chose par jour. Le fer aussi, ça se repose.'],
      sansArgent: ['Pas d’argent, pas de leçon. Je ne fais pas crédit. Même à vous.'],
    },
    grainetiere: {
      enseigne: [(r) => `Tenez, notez : « ${r} ». Anselme savait le faire les yeux fermés. Vous, gardez-les ouverts.`, (r) => `« ${r} ». C’est simple, et c’est pour ça que personne ne le fait bien. Faites-le bien.`],
      prix: [(r, p) => `« ${r} » ? Ça vous coûtera ${p} pièces. Les conseils gratuits, c’est le curé qui les donne.`],
      pasEncore: ['On verra ça quand vous aurez fait pousser autre chose que des mauvaises herbes.'],
      fini: ['Je n’ai plus rien à vous apprendre. Enfin, si : la patience. Mais ça ne s’apprend pas.'],
      demain: ['Une leçon par jour. La terre non plus ne fait pas tout d’un coup.'],
      sansArgent: ['Revenez avec la monnaie. Je ne fais plus crédit : j’ai fait crédit à Anselme.'],
    },
    eleveuse: {
      enseigne: [(r) => `Bon, écoutez bien : « ${r} ». Les bêtes, ça se soigne avec les mains, pas avec des livres.`, (r) => `« ${r} ». Solide, bien fait, et les bêtes vous diront merci. À leur façon.`],
      prix: [(r, p) => `« ${r} », je vous montre. ${p} pièces, et je vous offre le café.`],
      pasEncore: ['Je ne vous connais pas encore assez. Achetez-moi une poule, on en reparlera.'],
      fini: ['Je vous ai tout appris. Maintenant, ce sont vos bêtes qui vous apprendront.'],
      demain: ['Une chose à la fois. Revenez demain, j’ai des vaches à traire.'],
      sansArgent: ['Pas d’argent ? Pas de leçon. Les poules ne pondent pas à crédit.'],
    },
    aubergiste: {
      enseigne: [(r) => `Ah ! Un élève ! « ${r} » : le secret, c’est le beurre. Et le temps. Et encore du beurre.`, (r) => `« ${r} ». La recette de ma mère, qui la tenait de la sienne, qui l’avait volée à un curé.`],
      prix: [(r, p) => `« ${r} » ? Pour vous… ${p} pièces. C’est un secret de famille, ça se paie !`],
      pasEncore: ['Mes secrets, c’est pour les habitués. Revenez boire un coup, on verra.'],
      fini: ['Vous savez tout ce que je sais. Enfin, presque : il faut bien que je garde un secret.'],
      demain: ['Doucement ! Une recette par jour, sinon on les mélange. Et on se brûle.'],
      sansArgent: ['Pas un sou ? Même moi, je ne fais pas crédit sur les secrets de famille.'],
    },
    boulangere: {
      enseigne: [(r) => `Oh, avec plaisir ! « ${r} » : de bonnes mains, un four bien chaud, et surtout, ne pas ouvrir la porte toutes les deux minutes !`, (r) => `« ${r} ». Ma grand-mère me l’a appris, je vous l’apprends, vous l’apprendrez à quelqu’un. C’est comme ça que le pain voyage.`],
      prix: [(r, p) => `« ${r} » ? Ça, c’est ma fierté. ${p} pièces, et je vous donne un croûton en plus.`],
      pasEncore: ['Revenez me voir plus souvent, et je vous dirai mes petits secrets. Pas tous !'],
      fini: ['Je vous ai tout dit ! Maintenant, il faut pétrir. Beaucoup.'],
      demain: ['Une recette par jour ! La pâte a besoin de reposer. Vous aussi.'],
      sansArgent: ['Pas assez de sous ? Ce n’est rien, revenez plus tard.'],
    },
    guerisseuse: {
      enseigne: [(r) => `Écoute, et retiens : « ${r} ». Les mains savent avant la tête. Laisse-les faire.`, (r) => `« ${r} ». Ma mère me l’a appris un soir de pleine lune. Ce n’est pas la lune qui compte. C’est le soir.`],
      prix: [(r, p) => `« ${r} » ? Ça demande une offrande. ${p} pièces, pour les herbes que je n’irai pas cueillir.`],
      pasEncore: ['Pas encore. Les plantes te connaissent à peine. Moi aussi.'],
      fini: ['Je t’ai donné ce que j’avais. Le reste est dans la forêt. Va.'],
      demain: ['Assez pour aujourd’hui. Ce qu’on apprend trop vite s’en va de même.'],
      sansArgent: ['L’offrande d’abord. Reviens quand ta bourse sera moins légère.'],
    },
    alchimiste: {
      enseigne: [(r) => `Oh, oui ! « ${r} ». Notez. Non, notez vraiment. Voilà. Le principe est simple, c’est le reste qui est compliqué.`, (r) => `« ${r} ». J’ai mis trois ans à trouver. Je vous le donne en trois minutes. La science est injuste.`],
      prix: [(r, p) => `« ${r} » ? ${p} pièces. Mes créanciers vous remercient.`],
      pasEncore: ['Plus tard. Quand vous saurez ce qu’est une fiole. Et à quoi elle sert. Et pourquoi elle se casse.'],
      fini: ['Je n’ai plus rien à vous apprendre. C’est terrifiant. Allez, apprenez-moi quelque chose, vous.'],
      demain: ['Une leçon par jour. Au-delà, ça déborde. J’en sais quelque chose.'],
      sansArgent: ['Pas les moyens ? Moi non plus, jamais. Revenez quand vous les aurez.'],
    },
    chasseur: {
      enseigne: [(r) => `« ${r} ». Regardez mes mains, pas ma figure. … Voilà. Ne le montrez à personne.`, (r) => `« ${r} ». Mon père. Puis moi. Maintenant vous. Ne ratez pas.`],
      prix: [(r, p) => `« ${r} », ça se paie. ${p} pièces.`],
      pasEncore: ['Je n’apprends rien aux gens qui font du bruit en marchant.'],
      fini: ['Vous savez tout ce que je montre. Le reste, c’est la forêt qui l’apprend. Si elle vous en laisse le temps.'],
      demain: ['Demain. À l’aube. Pas avant.'],
      sansArgent: ['Pas d’argent. Pas de leçon.'],
    },
    colporteur: {
      enseigne: [(r) => `Ah ! Un secret de route : « ${r} ». Mon père le tenait de son père, qui le tenait d’un charron de passage, qui le tenait d’on ne sait qui !`, (r) => `« ${r} ». Et je vous le dis comme à un ami, c’est-à-dire presque gratuitement.`],
      prix: [(r, p) => `« ${r} » ? ${p} pièces, et c’est un prix d’ami. Enfin, de connaissance.`],
      pasEncore: ['Les secrets du métier, c’est pour les clients fidèles. Achetez-moi un livre, on en reparle !'],
      fini: ['Je vous ai tout dit ! C’est vous qui devriez vendre, maintenant.'],
      demain: ['Un secret par jour, sinon je n’aurai plus rien à vendre la semaine prochaine !'],
      sansArgent: ['Sans argent ? Ah non, ça, même moi, je ne peux pas.'],
    },
    colporteuse: {
      enseigne: [(r) => `« ${r} ». Appris sur les routes, de l’autre côté des Monts. Ça sert partout.`, (r) => `Regardez, c’est tout simple : « ${r} ». Ne serrez pas trop, ne tirez pas trop, et ça tiendra.`],
      prix: [(r, p) => `« ${r} » ? ${p} pièces. Je suis marchande, pas institutrice.`],
      pasEncore: ['On se connaît à peine. Revenez m’acheter de la toile, on verra.'],
      fini: ['Je n’ai plus rien à vous apprendre. Faites la route : elle vous apprendra le reste.'],
      demain: ['Assez pour aujourd’hui. Demain, je serai ailleurs. Enfin, peut-être.'],
      sansArgent: ['Sans monnaie, pas de leçon. Je vous l’ai dit : je suis têtue.'],
    },
    pecheur: {
      enseigne: [(r) => `« ${r} ». Doucement. Tout se fait doucement, au bord de l’eau.`, (r) => `« ${r} ». Mon père me l’a appris, sur la barque. Le lac écoutait. Il écoute toujours.`],
      prix: [(r, p) => `« ${r} »… ${p} pièces. Le lac ne donne rien pour rien. Moi non plus.`],
      pasEncore: ['Venez pêcher avec moi, d’abord. Un jour ou deux. On verra si le lac vous aime.'],
      fini: ['Je vous ai tout montré. Le reste, c’est le lac. Il vous apprendra, ou il vous prendra.'],
      demain: ['Demain. Le poisson ne mord pas deux fois au même hameçon.'],
      sansArgent: ['Pas d’argent ? Revenez. Le lac attendra. Il attend toujours.'],
    },
    nain_forgeronne: {
      enseigne: [(r) => `« ${r} ». Regarde, grand. Une fois. Les nains ne répètent pas.`, (r) => `« ${r} ». Avec tes grandes mains, ce sera moins bien. Mais ce sera.`],
      prix: [(r, p) => `« ${r} » ? ${p} pièces. Ou du pain. Non : des pièces.`],
      pasEncore: ['Tu n’es pas encore digne de la forge d’en bas. Apporte du pain. Beaucoup.'],
      fini: ['Tu sais ce qu’un grand peut savoir. Le reste demande cent ans et une barbe.'],
      demain: ['Assez. La forge dort. Reviens demain.'],
      sansArgent: ['Pas de pièces, pas de secret. Va.'],
    },
    nain_ancien: {
      enseigne: [(r) => `« ${r} ». Nous gravons ainsi depuis avant tes ancêtres. Grave juste, grand.`],
      prix: [(r, p) => `« ${r} » : le savoir des anciens a un prix. ${p} pièces.`],
      pasEncore: ['Tu ne comprendrais pas encore. Reviens avec du pain, et des mots.'],
      fini: ['Je t’ai appris ce qu’un grand peut porter.'],
      demain: ['Un savoir par jour. La pierre aussi prend son temps.'],
      sansArgent: ['Pas de pièces. Alors pas de savoir.'],
    },
    naturiste_b: {
      enseigne: [(r) => `Mais bien sûr ! « ${r} ». La médecine devrait être à tout le monde. Comme l’eau chaude.`, (r) => `« ${r} ». Serrer sans étrangler, soutenir sans écraser. C’est toute la médecine. Et tout le reste aussi.`],
      prix: [(r, p) => `« ${r} » ? ${p} pièces, pour la pharmacie.`],
      pasEncore: ['Plus tard, mon ami. D’abord, un bain.'],
      fini: ['Je vous ai appris tout ce qu’on peut faire avec deux mains et un peu de linge. Le reste, c’est l’eau.'],
      demain: ['Une leçon par jour ! Le corps apprend lentement. L’esprit, plus lentement encore.'],
      sansArgent: ['Ce n’est rien. Revenez.'],
    },
    cure: {
      enseigne: [(r) => `« ${r} ». Faites-le avec les mains, et un peu avec le cœur. Le bon Dieu regarde les deux.`, (r) => `« ${r} ». On le fait ici depuis des siècles. Contre quoi, je préfère ne pas le dire.`],
      prix: [(r, p) => `« ${r} » ? Une obole de ${p} pièces, pour les pauvres de la paroisse.`],
      pasEncore: ['Venez d’abord à la messe, mon enfant. Le reste viendra.'],
      fini: ['Je vous ai appris ce que l’Église permet. Pour le reste… ne le demandez à personne.'],
      demain: ['Assez pour aujourd’hui. Priez un peu, maintenant.'],
      sansArgent: ['L’obole d’abord, mon enfant. Même le bon Dieu a ses pauvres.'],
    },
    defaut: {
      enseigne: [(r) => `« ${r} ». Regardez bien. Voilà.`],
      prix: [(r, p) => `« ${r} » ? ${p} pièces.`],
      pasEncore: ['Pas encore.'], fini: ['Je vous ai appris tout ce que je sais.'], demain: ['Demain.'], sansArgent: ['Pas d’argent, pas de leçon.'],
    },
  },
};

// ---------------------------------------------------------------- ce qu'on sait faire : farm.knows suit le savoir du personnage
farm.knows = function (out) { return savoir.recetteConnue(out) || !!(this.s && this.s.known && this.s.known[out]); };

// ---------------------------------------------------------------- dialogue : « Vous pourriez m'apprendre… ? »
{
  const _options = talk.options.bind(talk);
  talk.options = function () {
    const opts = _options(), extra = fabrication.optionsDialogue(this.n);
    if (extra.length) { const i = opts.findIndex((o) => o.act === 'bye'); opts.splice(i >= 0 ? i : opts.length, 0, ...extra); }
    return opts;
  };
  const _choose = talk.choose.bind(talk);
  talk.choose = function (act) {
    if (typeof act === 'string' && act.startsWith('fab:') && this.n) return fabrication.choisir(this.n, act);
    return _choose(act);
  };
}

// ---------------------------------------------------------------- quêtes : une recette en récompense s'apprend (ou, déjà sue, l'objet est donné)
{
  const _complete = quests.complete.bind(quests);
  quests.complete = function (q, n) {
    const R = q && q.reward;
    if (!R || !R.recette) return _complete(q, n);
    const out = R.recette, connue = savoir.recetteConnue(out) || !RECIPES.some((r) => r.out === out);
    const res = _complete(Object.assign({}, q, { reward: Object.assign({}, R, { recette: undefined }) }), n);
    if (!connue) { savoir.apprendreRecette(out, 'quete'); ui.subtitle('', `(Nouvelle recette : ${itemName(out)}.)`, 3.5); }
    else if (ITEMS[out]) farm.give(out, 1);
    return res;
  };
}

// ---------------------------------------------------------------- au chargement : ce que savait faire une partie commencée avant
HOOKS.load.push((saved) => {
  const s = farm.s, neuf = !s.fab, F = fabrication.S(), R = savoir.S().recettes;
  if (neuf && (saved || s.day > 1)) {
    // l'ancienne règle : tout, sauf les plans verrouillés qu'on n'avait pas obtenus
    for (const r of RECIPES) if (!CRAFT_BASE.has(r.out) && !R[r.out] && (!LOCKED_RECIPES.has(r.out) || (s.known && s.known[r.out]))) R[r.out] = 'ancien';
    F.migre = s.day;
  }
  for (const k in s.known || {}) if (s.known[k] && !CRAFT_BASE.has(k) && !R[k]) R[k] = 'ancien';
  fabrication.slots = [null, null, null, null, null]; fabrication.msg = null; fabrication.offre = null;
});
