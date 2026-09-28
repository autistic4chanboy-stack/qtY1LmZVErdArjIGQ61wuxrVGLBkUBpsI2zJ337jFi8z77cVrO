// ============================================================================
//  PANNEAUX EN PLUS : choix (prières, puits…), onglets Légendes et Grimoire,
//  effets en cours dans la sacoche
// ============================================================================
const FIRST_NAMES = { m: ['Jean', 'Louis', 'Émile', 'Victor', 'Henri', 'Léon', 'Albert', 'Joseph', 'Marcel', 'Paul'], f: ['Jeanne', 'Marie', 'Louise', 'Berthe', 'Madeleine', 'Rose', 'Alice', 'Marthe', 'Suzanne', 'Lucie'] };
function randomFirstName(fem) { const L = FIRST_NAMES[fem ? 'f' : 'm']; return L[(Math.random() * L.length) | 0]; }

Object.assign(ui, {
  // --------------------------------------------------------------- petit panneau à choix
  choice(title, desc, opts) {
    this.choiceOpts = opts;
    this.open('#choice', `<h3>${esc(title)}</h3>${desc ? `<div class="desc">${esc(desc)}</div>` : ''}<div class="opts">${opts.map((o, i) => `<button data-i="${i}"><kbd>${i + 1}</kbd> ${esc(o.label)}</button>`).join('')}</div>`);
    $$('#choice [data-i]').forEach((b) => (b.onclick = () => { const o = this.choiceOpts[+b.dataset.i]; if (o) o.fn(); }));
  },
  choiceKey(k) { const o = this.choiceOpts && this.choiceOpts[k - 1]; if (o) o.fn(); },
  // --------------------------------------------------------------- effets en cours
  buffsLine() {
    const s = farm.s;
    if (!s.buffs) return '';
    const L = Object.keys(s.buffs).filter((k) => s.buffs[k] > s.hours && BUFF_NAMES[k]).map((k) => { const h = s.buffs[k] - s.hours; return BUFF_NAMES[k] + ' (' + (h >= 1 ? Math.round(h) + ' h' : 'bientôt fini') + ')'; });
    if (play.poisonT > 0) L.unshift('Empoisonné');
    return L.length ? `<div class="buffs">Sur vous : ${L.map(esc).join(' · ')}</div>` : '';
  },
  // --------------------------------------------------------------- légendes
  legendsBody() {
    const S = myths.st();
    const heard = MYTH_ORDER.filter((id) => S.heard[id]);
    const held = RELICS.map((r) => `<span class="${farm.count(r) || farm.s.flags.apaisee ? '' : 'no'}" title="${esc(itemName(r))}"><img src="${iconURL(r)}" alt=""></span>`).join('');
    let body = `<h4>Les reliques des Anciens</h4><div class="relics">${held}</div><p class="hint">${farm.s.flags.apaisee ? 'La vallée dort. Vous veillez.' : 'On dit qu’il faut les réunir toutes, et les porter à l’autel du cercle de pierres, à minuit.'}</p>`;
    body += `<h4>Légendes entendues (${heard.length} / ${MYTH_ORDER.length})</h4>`;
    body += heard.map((id) => { const M = myths.M(id), who = S.heard[id].who; return `<div class="myth ${S.found[id] ? 'found' : ''}"><b>${esc(M.titre)}</b>${who && npcs.byId[who] ? ` <span class="hint">— racontée par ${esc(npcs.byId[who].name)}</span>` : ''}<div>${esc(fmtLine(M.resume || '', null))}</div>${M.indice && !S.found[id] ? `<div><i>${esc(fmtLine(M.indice, null))}</i></div>` : ''}<button data-myth="${id}">Relire</button></div>`; }).join('') || '<p class="hint">Aucune encore. Les gens d’ici en connaissent : demandez-leur.</p>';
    setTimeout(() => $$('#satchel [data-myth]').forEach((b) => (b.onclick = () => { const M = myths.M(b.dataset.myth); this.read(M.titre, fmtLine(M.texte, null)); })), 0);
    return body;
  },
  // --------------------------------------------------------------- grimoire (recettes d'alchimie)
  grimoireBody() {
    const s = farm.s, known = Object.keys(POTIONS).filter((id) => alchemy.known(id));
    let body = `<h4>Recettes connues (${known.length} / ${Object.keys(POTIONS).length - 1})</h4>`;
    body += known.map((id) => `<div class="rec"><img class="big" src="${iconURL(id)}" alt=""><div><b>${esc(POTIONS[id].name)}</b><div class="need">${POTIONS[id].need.map((k) => `<span class="${farm.count(k) ? 'y' : 'n'}"><img src="${iconURL(k)}" alt="">${esc(itemName(k))}</span>`).join('')}</div><div class="st">${esc(POTIONS[id].desc)}</div></div></div>`).join('') || '<p class="hint">Aucune recette. L’alambic de la guérisseuse vous attend ; ou bien essayez, avec deux ou trois ingrédients.</p>';
    const pages = s.flags.grimoire && typeof LORE_TEXT !== 'undefined' && LORE_TEXT.abbaye && LORE_TEXT.abbaye.grimoire_pages;
    if (pages) { body += `<h4>Pages du frère Anselme</h4>` + pages.map((p, i) => `<button class="note" data-page="${i}">Page ${i + 1}</button>`).join(''); setTimeout(() => $$('#satchel [data-page]').forEach((b) => (b.onclick = () => this.read('Grimoire — page ' + (+b.dataset.page + 1), fmtLine(pages[+b.dataset.page], null)))), 0); }
    body += '<p class="hint">Un alambic se fabrique à l’établi (cuivre, fioles, pierres), ou s’achète chez la guérisseuse. Les fioles vides : du sable et du charbon, au four.</p>';
    return body;
  },
});
