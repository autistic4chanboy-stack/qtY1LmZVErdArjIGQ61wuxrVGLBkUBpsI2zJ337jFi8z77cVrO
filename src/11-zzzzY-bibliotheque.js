// ============================================================================
//  LA BIBLIOTHÈQUE, SECONDE PARTIE (agent Y, quatorzième vague)
//  « Ajoute beaucoup plus de livres à la bibliothèque » — « la Grande Porte est
//  parfois fermée à clé, et la clé est à la bibliothèque ».
//  - LES RAYONS : chaque livre a sa place (05-zzzzzY-0-cle.js). En bas, dans la
//    salle de lecture : contes, chroniques, almanachs, mémoires ; à la galerie
//    (l'étage de B1) : histoire naturelle, traités, réserve, langues, cartes ;
//    sous terre, dans la salle des archives : l'Enfer (on y lit en entier, rien
//    ne sort). On feuillette sur place quelques pages ; pour le reste, le
//    comptoir prête comme avant (11-zzz21-bibliotheque.js), rangé par rayons.
//  - LA CLÉ DE LA GRANDE PORTE (`cle_grande_porte`) dort dans un livre creux de
//    la galerie, « Tables de concordance des anciennes mesures ». On l'obtient :
//      · en la DEMANDANT au bibliothécaire, quand on est un lecteur exact (des
//        livres rendus à l'heure, son amitié, ou la fleur de pierre) et qu'on
//        répond juste à sa question (la réponse est dans les livres) : il la
//        prête trois ou sept jours contre une caution (150 ou 300 pièces), rendue
//        au retour, à l'heure ;
//      · en la PRENANT soi-même dans le livre creux, quand personne ne voit : s'il
//        est là, éveillé, il entend presque tout (« Reposez-la. ») ; la nuit il
//        dort à deux pas (le cambriolage de U : un bruit peut le réveiller) ;
//        absent (ses jours à l'abbaye…), personne n'entend.
//    Prise sans prêt, le registre l'inscrit quand même, d'une encre qui ne sèche
//    pas : trois jours pour la rapporter (au comptoir, dans la boîte aux retours
//    ou dans le livre), un seul si l'on a été pris sur le fait ; ensuite, c'est
//    un livre en retard (le sorcier, 11-zzz21).
//    PERDUE (donnée, laissée, volée, oubliée…), elle REVIENT TOUJOURS dans son
//    livre au bout de deux jours ; un prêt perdu coûte la caution et la confiance
//    du bibliothécaire (il ne la prêtera plus) ; une traque pour elle s'arrête,
//    mais la bibliothèque vous est fermée.
//  État : farm.s.bibliotheque2 = { cle: { ou ('livre'|'dehors'|'perdue'), mode
//         (null|'pret'|'vol'), jour, due, caution, pris, perdueH, avoue,
//         plusPret, aRembourser, n, lettre, rappel }, q: { ok, rate }, fois }
//  API : bibliotheque2 (voir en bas, et $SP/eq/contrat-v14.md).
// ============================================================================
const Y2_CAUTION = { 3: 150, 7: 300 };
const Y2_RETOUR_H = 48;           // la clé perdue revient dans son livre au bout de deux jours
const Y2_TITRE_CLE = 'La clé de la Grande Porte';
const Y2_BRUIT_CLE = 0.35;        // soulever la clé de fer de son livre, la nuit : un bruit de porte (U_BRUITS de U)
// la question du bibliothécaire : la réponse est dans les livres (voir 05-zzzzzY-4-…)
const Y2_QUESTIONS = [
  { q: '« Que dit le gardien, quand il referme la Porte derrière celui qui revient ? »', livre: 'y_porte_chronique',
    rep: ['« Rien n’est entré avec toi. »', '« Que la nuit te garde. »', '« Je t’attendais. »', '« Va, et ne te retourne pas. »'] },
  { q: '« Combien de fois la clé est-elle revenue seule à la bibliothèque, d’après le registre ? »', livre: 'y_journal_bibliothecaire',
    rep: ['« Onze fois : toutes les fois qu’on l’a perdue. »', '« Une seule fois, en 1704. »', '« Jamais : elle ne se perd pas. »', '« Trois fois, puis plus jamais. »'] },
  { q: '« Qu’a-t-on mis, au conte, dans la poche du portier pour qu’il ne dorme jamais ? »', livre: 'y_portier',
    rep: ['« Un caillou de la Porte. »', '« Une clé de trop. »', '« Une chandelle éteinte. »', '« Le nom de sa mère. »'] },
];

const bibliotheque2 = {
  chkT: 1, onglet: {}, ailleurs: [], _img: {},
  S() {
    const s = farm.s;
    if (!s) return null;
    const B = s.bibliotheque2 && typeof s.bibliotheque2 === 'object' ? s.bibliotheque2 : (s.bibliotheque2 = {});
    if (!B.cle || typeof B.cle !== 'object') B.cle = { ou: 'livre', mode: null };
    if (!B.q || typeof B.q !== 'object') B.q = {};
    return B;
  },
  C() { return this.S().cle; },
  n() { return biblio.libraire(); },
  vivant() { const n = this.n(); return !!(n && n.st.alive); },
  livres() { return Y2_LIVRES.slice(); },
  rayonDe(id) { const L = LIVRES[id]; return (L && (L.rayon || Y2_ANCIENS[id])) || null; },
  lu(id) { return !!(farm.s && savoir.lu(id)); },
  // les livres de serrurerie (pour la compétence de U) : combien en a-t-on lu jusqu'au bout ?
  serrures() { return Y2_LIVRES.filter((id) => LIVRES[id].serrures); },
  lecturesSerrures() { if (!farm.s) return 0; const F = livres.S().fini; return this.serrures().filter((id) => F[id]).length; },
  // dans la Zone de V1 (« les Terres d'Avant ») : zone.dedans est un booléen ; la vallée reste farm.w
  enZone() { try { if (typeof zone === 'undefined' || !zone) return false; return typeof zone.dedans === 'function' ? !!zone.dedans() : !!zone.dedans; } catch (e) { return false; } },
  vallee() { return farm.w || game.world; },

  // ================================================================== LES RAYONS
  // quelle étagère : 'bas' (la salle de lecture), 'galerie' (B1), ou 'tout' (pas de galerie dans ce monde)
  etagere(it) {
    if (it && it.id === 'b1:biblio:rayon_haut') return 'galerie';
    const w = this.vallee();
    const galerie = w && w.inter && w.inter.some((i) => i.id === 'b1:biblio:rayon_haut');
    return galerie ? 'bas' : 'tout';
  },
  // les livres d'une étagère, par rayon : [[rayon, [ids]]]
  contenu(et) {
    const par = {};
    for (const id in LIVRES) {
      const L = LIVRES[id];
      if (!(L.biblio || L.creux) || L.enfer) continue;
      if (L.biblio && !ITEMS['livre_' + id]) continue;
      const r = this.rayonDe(id);
      if (!r || !Y2_RAYONS[r]) continue;
      if (et !== 'tout' && Y2_RAYONS[r].ou !== et) continue;
      (par[r] || (par[r] = [])).push(id);
    }
    // le livre creux est rangé tout en haut, au bout de son rayon
    for (const r in par) par[r].sort((a, b) => (LIVRES[a].creux ? 1 : 0) - (LIVRES[b].creux ? 1 : 0));
    return Y2_RAYONS_ORDRE.filter((r) => par[r]).map((r) => [r, par[r]]);
  },
  dos(col) { return `<span class="y2-dos" style="background:${esc(col || '#6a2a24')}"></span>`; },
  rayons(it) {
    const pres = biblio.present();
    if (biblio.banni() && pres === 'la') { ui.subtitle('', '(Le bibliothécaire vous fixe. Vous n’osez pas toucher aux livres.)', 3); return true; }
    const et = this.etagere(it), C = this.contenu(et), Bb = biblio.S();
    if (!C.length) return false;
    let r = this.onglet[et];
    if (!C.some(([k]) => k === r)) r = C[0][0];
    this.onglet[et] = r;
    const ids = C.find(([k]) => k === r)[1];
    const tabs = C.map(([k, L]) => `<button data-y2r="${k}" class="${k === r ? 'on' : ''}">${esc(Y2_RAYONS[k].nom)} <small>${L.length}</small></button>`).join('');
    let body = Bb.traque ? `<p class="bb-tete">${esc('(Quelque part, une page tourne toute seule.)')}</p>` : '';
    body += `<div class="y2-tabs">${tabs}</div>`;
    body += ids.map((id) => {
      const L = LIVRES[id], lu = savoir.lu(id);
      return `<div class="bb-row">${this.dos(L.col)}<div class="bb-t"><b>${esc(livres.ville(L.titre))}</b><span>${esc(livres.ville(L.auteur || ''))}${lu ? ' · déjà lu' : ''}</span></div><div class="bb-b"><button data-y2l="${esc(id)}">Feuilleter</button></div></div>`;
    }).join('');
    const titre = et === 'galerie' ? 'Les rayonnages de la galerie' : 'Les rayonnages';
    const pied = et === 'galerie' ? 'Lecture sur place : quelques pages seulement. Le reste se lit en bas, dans la salle de lecture.' : et === 'bas' ? 'Lecture sur place : quelques pages seulement. D’autres rayonnages à la galerie, au-dessus.' : 'Lecture sur place : quelques pages seulement.';
    biblio.panneau(`<div class="tabs"><b>${esc(titre)}</b><button class="x" data-close>✕</button></div><div class="body">${body}</div><div class="foot">${esc(pied)}</div>`);
    this.style();
    $$('#biblio [data-y2r]').forEach((b) => (b.onclick = () => { this.onglet[et] = b.dataset.y2r; sound.page && sound.page(); this.rayons(it); }));
    $$('#biblio [data-y2l]').forEach((b) => (b.onclick = () => livres.ouvrir(b.dataset.y2l, { surPlace: true })));
    return true;
  },
  // la salle des archives : le registre, et l'Enfer
  archives() {
    const ids = Y2_LIVRES.filter((id) => LIVRES[id].enfer);
    ui.choice('La salle des archives', 'Un registre ouvert sur la table. Au fond, derrière la dernière étagère, des livres qu’on a reliés de noir et rangés le dos au mur.', [
      { label: 'Lire le registre ouvert', fn: () => { ui.close(true); livres.ouvrir('registre_archives'); } },
      { label: `Les livres de l’Enfer (${ids.length})`, fn: () => { ui.close(true); this.enfer(); } },
      { label: 'Laisser', fn: () => ui.close() },
    ]);
    return true;
  },
  enfer() {
    const ids = Y2_LIVRES.filter((id) => LIVRES[id].enfer);
    const body = `<p class="bb-tete">${esc('(Des livres qui ne sortent pas d’ici. On les lit sur place, en entier, à la chandelle.)')}</p>` + ids.map((id) => {
      const L = LIVRES[id], lu = savoir.lu(id);
      return `<div class="bb-row">${this.dos(L.col)}<div class="bb-t"><b>${esc(livres.ville(L.titre))}</b><span>${esc(livres.ville(L.auteur || ''))}${lu ? ' · déjà lu' : ''}</span></div><div class="bb-b"><button data-y2e="${esc(id)}">Lire</button></div></div>`;
    }).join('');
    biblio.panneau(`<div class="tabs"><b>L’Enfer</b><button class="x" data-close>✕</button></div><div class="body">${body}</div><div class="foot">${esc('Ces livres ne se prêtent pas.')}</div>`);
    this.style();
    $$('#biblio [data-y2e]').forEach((b) => (b.onclick = () => livres.ouvrir(b.dataset.y2e)));
  },

  // ================================================================== LA CLÉ : où est-elle ?
  // quelque part chez le joueur (sacoche, coffres, maisons louées, charrette, saisie…) ? (sinon null)
  quelquePart() {
    const s = farm.s, id = Y2_CLE, dans = (o) => !!(o && typeof o === 'object' && o[id] > 0);
    if (!s) return null;
    if (farm.count(id)) return 'sacoche';
    for (const k in s.chests || {}) if (dans(s.chests[k])) return 'coffre';
    const L = s.location;
    if (L) { for (const k in L.baux || {}) if (L.baux[k] && dans(L.baux[k].coffre)) return 'coffre'; for (const k in L.saisies || {}) if (L.saisies[k] && dans(L.saisies[k].objets)) return 'saisie'; }
    const M = s.meubles;
    if (M && M.maisons) for (const k in M.maisons) if (M.maisons[k] && dans(M.maisons[k].coffre)) return 'coffre';
    for (const p of s.props || []) if (p && p.data && dans(p.data.items)) return 'coffre';
    for (const k in s.propData || {}) if (s.propData[k] && dans(s.propData[k].items)) return 'coffre';
    const w = this.vallee();
    if (w && w.props) for (let i = farm.genProps || 0; i < w.props.length; i++) { const q = w.props[i]; if (q && q.data && dans(q.data.items)) return 'coffre'; }
    if (s.prison && dans(s.prison.saisie)) return 'saisie';
    for (const f of this.ailleurs) { try { if (f(id)) return 'ailleurs'; } catch (e) { console.error(e); } }
    return null;
  },
  // la clé rentre chez elle : on l'ôte de partout
  purger() {
    const s = farm.s, id = Y2_CLE, ote = (o) => { if (o && typeof o === 'object' && o[id]) delete o[id]; };
    while (farm.count(id) > 0) if (!farm.take(id, farm.count(id))) break;
    for (const k in s.chests || {}) ote(s.chests[k]);
    const L = s.location;
    if (L) { for (const k in L.baux || {}) if (L.baux[k]) ote(L.baux[k].coffre); for (const k in L.saisies || {}) if (L.saisies[k]) ote(L.saisies[k].objets); }
    const M = s.meubles;
    if (M && M.maisons) for (const k in M.maisons) if (M.maisons[k]) ote(M.maisons[k].coffre);
    for (const p of s.props || []) if (p && p.data) ote(p.data.items);
    for (const k in s.propData || {}) if (s.propData[k]) ote(s.propData[k].items);
    const w = this.vallee();
    if (w && w.props) for (const q of w.props) if (q && q.data) ote(q.data.items);
    if (s.prison) ote(s.prison.saisie);
    if (s.ship) ote(s.ship);
  },
  // l'emprunt de la clé au registre de la bibliothèque (11-zzz21 : rappels, retard, sorcier)
  pret() { const B = farm.s && biblio.S(); return B ? B.prets.find((p) => p.id === Y2_CLE) || null : null; },
  etat() { const C = this.C(); return { ou: C.ou, mode: C.mode || null, due: C.due || 0, caution: C.caution || 0, pris: !!C.pris }; },

  // ------------------------------------------------------------------ la clé sort du livre
  // mode : 'pret' (contre caution, o.jours), 'vol' (prise sans prêt ; o.pris : sur le fait), 'libre' (personne pour la réclamer)
  sortir(mode, o) {
    o = o || {};
    const C = this.C(), s = farm.s, Bb = biblio.S();
    farm.give(Y2_CLE, 1);
    const libre = mode === 'libre' || !this.vivant();
    const due = libre ? 0 : mode === 'pret' ? biblio.echeance(o.jours || 3) : biblio.echeance(o.pris ? 1 : 3);
    Object.assign(C, { ou: 'dehors', mode: libre ? null : mode, jour: s.day, due, caution: mode === 'pret' ? o.caution || 0 : 0, pris: !!o.pris, perdueH: 0, avoue: false, lettre: 0, rappel: 0, n: (C.n || 0) + 1 });
    Bb.prets = Bb.prets.filter((p) => p.id !== Y2_CLE);
    // (le registre : un emprunt comme les autres ; nos propres rappels, nos propres alertes)
    if (!libre) Bb.prets.push({ id: Y2_CLE, titre: Y2_TITRE_CLE, du: s.day, dur: o.jours || 0, due, paye: C.caution, rappel: 1, alerte: 1, alerte2: 1, y2: mode });
    const S = this.S(); S.fois = (S.fois || 0) + 1;
    return true;
  },
  // ------------------------------------------------------------------ la clé rentre dans son livre
  rentrer(comment) {
    const C = this.C(), s = farm.s, Bb = biblio.S();
    const P = this.pret();
    if (P) {
      Bb.prets = Bb.prets.filter((p) => p !== P);
      Bb.hist.push({ id: Y2_CLE, du: P.du, rendu: s.day, retard: s.hours > P.due });
      if (Bb.hist.length > 30) Bb.hist.shift();
    }
    Object.assign(C, { ou: 'livre', mode: null, due: 0, caution: 0, pris: false, perdueH: 0, avoue: false, rendue: comment || '', rendueJ: s.day });
  },
  // la traque était-elle pour la clé ? (on l'en retire ; plus rien à rapporter : elle s'arrête, et la bibliothèque est fermée)
  sortirDeTraque() {
    const Bb = biblio.S(), TQ = Bb.traque;
    if (!TQ || !TQ.ids.includes(Y2_CLE)) return false;
    TQ.ids = TQ.ids.filter((id) => id !== Y2_CLE);
    if (!Bb.prets.some((p) => TQ.ids.includes(p.id))) {
      biblio.finTraque();
      Bb.banni = Bb.banni || farm.s.day;
      if (typeof malediction !== 'undefined' && malediction.lever) try { malediction.lever('livre'); } catch (e) { console.error(e); }
    }
    return true;
  },

  // ------------------------------------------------------------------ rendre (au comptoir, dans la boîte, dans le livre)
  // boite : personne pour la prendre (comptoir désert, bibliothécaire endormi, lecteur banni) ; livre : remise dans le livre creux
  rendre(o) {
    o = o || {};
    const C = this.C(), s = farm.s, n = this.n(), P = this.pret();
    if (!farm.take(Y2_CLE, 1)) return false;
    const late = !!(P && s.hours > P.due), mode = C.mode, caution = C.caution || 0, discret = o.boite || o.livre;
    if (mode === 'pret') {
      if (!late) {
        if (discret) C.aRembourser = (C.aRembourser || 0) + caution;
        else { farm.earn(caution); sound.coin && sound.coin(); if (n) npcs.addAmitie(n, 20); const Bb = biblio.S(); Bb.lecteur = (Bb.lecteur || 0) + 1; }
      } else C.plusPret = s.day;
    } else if (mode === 'vol' && !discret && n) npcs.addAmitie(n, -30);
    this.rentrer(o.livre ? 'livre' : o.boite ? 'boite' : 'comptoir');
    sound.page && sound.page();
    // le texte
    let qui = '', txt;
    if (o.livre) txt = '(La clé retrouve sa place dans le papier creusé, exactement, comme une main dans un gant.)';
    else if (discret) txt = '(La clé tombe au fond de la boîte avec un bruit de fer, lourd, qui dure.)';
    else {
      qui = biblio.nom();
      if (mode === 'pret' && !late) txt = `« À l’heure. » Il compte la caution sur le comptoir, ${caution} pièces, et range la clé sans la regarder.`;
      else if (mode === 'pret') txt = '« En retard. La caution reste au registre. » Il ne dit rien d’autre.';
      else if (mode === 'vol') txt = '« Bien. » Il la prend sans un mot de plus. Il ne demande pas d’où elle vient.';
      else txt = '« Merci. » Il la regarde longtemps avant de la ranger.';
    }
    ui.subtitle(qui, txt, 5);
    return true;
  },
  // la caution d'une clé rendue par la boîte ou par le livre : il la remet à la prochaine visite
  rembourser() {
    const C = this.C(), n = this.n();
    if (!(C.aRembourser > 0) || biblio.present() !== 'la' || biblio.banni()) return false;
    const k = C.aRembourser;
    C.aRembourser = 0;
    farm.earn(k); sound.coin && sound.coin();
    if (n) npcs.addAmitie(n, 10);
    ui.subtitle(biblio.nom(), `« Votre caution. » Il pose ${k} pièces sur le comptoir. « La clé est rentrée. Je l’ai trouvée à sa place. »`, 5);
    return true;
  },
  // ------------------------------------------------------------------ prêter (le bibliothécaire, en parlant)
  peutPreter() {
    const C = this.C(), Bb = biblio.S(), n = this.n();
    if (!n || !n.st.alive || biblio.banni() || C.plusPret) return false;
    return ((Bb.lecteur || 0) >= 3 && npcs.level(n) >= 4) || (!!Bb.fleur && (Bb.lecteur || 0) >= 1);
  },
  preter(jours) {
    const s = farm.s, Bb = biblio.S(), C = this.C(), cau = Y2_CAUTION[jours] || 150;
    if (C.ou !== 'livre' || !this.peutPreter()) return 'non';
    if (Bb.prets.length >= BIBLIO.max) return 'max';
    if (!farm.pay(cau)) return 'argent';
    this.sortir('pret', { jours, caution: cau });
    sound.coin && sound.coin();
    return 'ok';
  },
  // ------------------------------------------------------------------ la prendre soi-même, dans le livre creux
  // le bibliothécaire vous voit-il ? (éveillé, à la bibliothèque, au même niveau, et tourné vers vous, ou tout près)
  vu() {
    const n = this.n(), p = game.player;
    if (!n || biblio.present() !== 'la') return false;
    if (Math.abs(p.pos[1] - (n.y ?? p.pos[1])) > 2.2) return false;
    const dx = p.pos[0] - n.x, dz = p.pos[2] - n.z, d = Math.hypot(dx, dz) || 0.01;
    if (d < 3.5) return true;
    if (d > 16) return false;
    if ((dx * Math.sin(n.heading || 0) + dz * Math.cos(n.heading || 0)) / d < -0.1) return false;
    try { return segClear(this.vallee(), n.x, n.z, p.pos[0], p.pos[2]); } catch (e) { return true; }
  },
  empeche() {
    const n = this.n();
    if (n) npcs.addAmitie(n, -5);
    ui.close(true);
    ui.subtitle(biblio.nom(), '« Celui-là ne se feuillette pas. » Il vous le reprend des mains, sans brusquerie, et le remet tout en haut.', 5);
  },
  // le cambriolage de U (crochetage.cambriolage : bruit(force, { x, y, z, quoi }) → le premier réveillé, ou null)
  cambriolageU() { try { const U = typeof crochetage !== 'undefined' && crochetage && crochetage.cambriolage; return U && typeof U.bruit === 'function' ? U : null; } catch (e) { return null; } },
  // un bruit, la nuit, près du dormeur, sans U : le réveille-t-il ? (la règle de 11-zzz97 : un dormeur chez lui, ~12 % × force)
  bruitNuit(force) {
    const n = this.n(), p = game.player;
    if (!n) return false;
    const d = Math.hypot(n.x - p.pos[0], n.z - p.pos[2]);
    const k = (d < 6 ? 1.5 : d < 14 ? 1 : 0.5) * (1 - 0.5 * (p.crouch || 0));
    return Math.random() < 0.12 * force * k;
  },
  prendre() {
    const C = this.C(), n = this.n(), s = farm.s;
    if (C.ou !== 'livre') return false;
    if (this.vu()) { this.empeche(); return false; }
    ui.close(true);
    sound.page && sound.page();
    setTimeout(() => sound.lock && sound.lock(false), 260);
    // personne pour la réclamer
    if (!this.vivant()) { this.sortir('libre'); ui.subtitle('', '(La clé est lourde, et plus froide que le papier autour d’elle.)', 3.5); return true; }
    const pres = biblio.present();
    if (pres === 'la') {
      // éveillé, dans sa bibliothèque : il entend presque tout
      // (déjà entendu aujourd'hui : il écoute, maintenant)
      const pEnt = this.C().soupcon === s.day ? 1 : 0.75 * (1 - 0.45 * (game.player.crouch || 0));
      if (Math.random() < pEnt) { this.entendu(); return true; }
    } else if (pres === 'dort') {
      const U = this.cambriolageU(), p = game.player;
      if (U) {
        // (U mène le réveil : il se lève, cherche d'où venait le bruit ; s'il vous voit, c'est lui qui crie et dénonce)
        let r = null;
        try { r = U.bruit(Y2_BRUIT_CLE, { x: p.pos[0], y: p.pos[1], z: p.pos[2], quoi: 'prendre' }); } catch (e) { console.error(e); }
        this.sortir('vol');
        if (r && r.id === 'libraire') this.C().reveil = farm.s.day;
        ui.subtitle('', '(La clé est lourde, et plus froide que le papier autour d’elle.)', 3.5);
        return true;
      }
      if (this.bruitNuit(0.7)) { this.reveille(); return true; }
    }
    this.sortir('vol');
    ui.subtitle('', '(La clé est lourde, et plus froide que le papier autour d’elle.)', 3.5);
    return true;
  },
  entendu() {
    const n = this.n();
    sound.whisper && sound.whisper(0, 0.4);
    const encore = this.C().soupcon === farm.s.day;
    ui.choice('Une voix, en bas', encore ? '(D’en bas, la même voix, plus lente : « Je vous ai dit de la reposer. »)' : '(Sans élever la voix, d’en bas, quelqu’un dit : « Reposez-la. »)', [
      { label: 'Reposer la clé dans le livre', fn: () => { ui.close(); if (n) npcs.addAmitie(n, -10); this.C().soupcon = farm.s.day; ui.subtitle('', '(En bas, une page tourne.)', 3); } },
      { label: 'La garder', fn: () => { ui.close(); this.garder(); } },
    ]);
  },
  // prise sur le fait (entendue de jour, ou le dormeur réveillé) : un jour pour la rendre, et le vol est connu
  garder(cri) {
    const n = this.n(), p = game.player;
    this.sortir('vol', { pris: true });
    if (n) npcs.addAmitie(n, -80);
    try { if (typeof societe !== 'undefined' && societe.crime) societe.crime({ type: 'vol', victime: 'libraire', detail: Y2_TITRE_CLE, x: p.pos[0], z: p.pos[2], temoins: ['libraire'] }); } catch (e) { console.error(e); }
    if (cri) return;
    setTimeout(() => ui.subtitle('', '(En bas, une chaise recule. Il ne monte pas. Il n’a pas besoin de monter.)', 5), 600);
  },
  reveille() {
    const n = this.n();
    if (n) { npcs.say(n, pick(['Qui est là ?! … La clé ! Au voleur !', 'Hein ?! Qui touche aux livres ?! Au voleur !']), 3.5); n.sleep = false; if (n.state === 'sleep') n.state = 'idle'; }
    sound.scream && sound.scream(0.25);
    this.garder(true);
  },
  // remettre la clé (qu'on a sur soi) dans le livre creux
  remettre() {
    const C = this.C();
    if (C.ou !== 'dehors' || !farm.count(Y2_CLE)) return false;
    ui.close(true);
    return this.rendre({ livre: true });
  },

  // ------------------------------------------------------------------ la clé perdue revient
  revenir() {
    const C = this.C(), s = farm.s, mode = C.mode, n = this.n();
    this.purger();
    const traque = this.sortirDeTraque();
    if (mode === 'pret' && !C.avoue) C.plusPret = C.plusPret || s.day;
    this.rentrer('seule');
    C.revenue = (C.revenue || 0) + 1;
    if (!n || !n.st.alive) return;
    const nom = biblio.nom();
    if (traque) farm.mail('La grande bibliothèque', 'Sans objet', `La clé de la Grande Porte est rentrée cette nuit. Elles rentrent toujours.\n\nLe registre est fermé à votre nom. La bibliothèque aussi.\n\n${nom}, bibliothécaire.`);
    else if (mode === 'pret') farm.mail('La grande bibliothèque', 'La clé', `La clé que je vous avais prêtée est rentrée seule, cette nuit, à sa place. Elles rentrent toujours ; c’est ce qu’on ne dit pas à ceux à qui on les prête, pour qu’ils y fassent attention quand même.\n\nLa caution reste au registre. Je ne vous la prêterai plus.\n\n${nom}, bibliothécaire.`);
    else if (mode === 'vol') farm.mail('?', 'Sans timbre', 'Elle est rentrée.\n\nLe registre a rayé votre nom. Il ne l’a pas effacé.');
  },

  // ------------------------------------------------------------------ chaque seconde ou deux
  verifierCle(playing) {
    const C = this.C(), s = farm.s, Bb = biblio.S(), P = this.pret();
    // l'emprunt a disparu du registre alors que la clé est dehors
    if (C.ou === 'dehors' && C.mode && !P) {
      if (!this.vivant()) { C.mode = null; C.due = 0; }                       // (le bibliothécaire est mort : personne ne la réclamera)
      else if (!this.quelquePart()) this.rentrer('traque');                   // (rendue pendant la traque : 11-zzz21 calmer)
      else Bb.prets.push({ id: Y2_CLE, titre: Y2_TITRE_CLE, du: C.jour || s.day, dur: 0, due: C.due || biblio.echeance(1), paye: C.caution || 0, rappel: 1, alerte: 1, alerte2: 1, y2: C.mode });
    }
    if (C.ou === 'dehors') {
      if (!this.enZone() && !this.quelquePart()) { C.ou = 'perdue'; C.perdueH = s.hours; }
    } else if (C.ou === 'perdue') {
      if (s.hours >= (C.perdueH || 0) + Y2_RETOUR_H) this.revenir();
      else if (!C.avoue && this.quelquePart()) { C.ou = 'dehors'; C.perdueH = 0; }
    } else if (C.ou === 'livre' && farm.count(Y2_CLE) > 0) {
      // (une clé en trop, venue d'ailleurs : elle est au joueur, sans registre)
      Object.assign(C, { ou: 'dehors', mode: null, due: 0 });
    }
    // les alertes de l'échéance (nos mots : ce n'est pas un livre)
    const Q = this.pret();
    if (Q && playing && C.ou !== 'livre') {
      const r = Q.due - s.hours;
      if (!C.alerte && r <= 2 && r > 0) { C.alerte = 1; ui.subtitle('', '(La clé pèse plus lourd, tout à coup. Il faudra la rendre bientôt.)', 4); }
      if (!C.alerte2 && r <= 0.6 && r > 0 && farm.count(Y2_CLE)) { C.alerte2 = 1; ui.subtitle('', '(La clé est froide contre vous, froide comme une pierre au fond d’un puits.)', 4); }
      if (!C.rappel && r <= 24 && r > 0 && this.vivant()) {
        C.rappel = 1;
        const nom = biblio.nom(), quand = biblio.dateTexte(Q.due);
        if (C.mode === 'pret') farm.mail('La grande bibliothèque', 'Rappel : la clé', `Madame, Monsieur,\n\nLa clé que la bibliothèque vous a confiée le jour ${C.jour} est à rapporter au comptoir ${quand}.\n\nVous savez ce qu’elle ouvre. Je sais, moi, ce qu’il en coûte de ne pas la rendre. Je préférerais que vous ne l’appreniez pas.\n\n${nom}, bibliothécaire.`);
        else farm.mail('?', 'Sans timbre', `Demain.\n\nAvant sept heures du soir. Au comptoir, dans la boîte, ou là où vous l’avez prise.`);
      }
    }
  },
  // le matin : la lettre du registre, après une clé prise sans prêt
  // le vol de la clé est-il connu ? (un crime contre le bibliothécaire, depuis le jour où on l'a prise)
  connu() {
    try { const C = this.C(), S = typeof societe !== 'undefined' && societe.S ? societe.S() : null; return !!(S && (S.crimes || []).some((k) => k.victime === 'libraire' && !k.leve && k.day >= (C.jour || 0))); } catch (e) { return false; }
  },
  matin() {
    const C = this.C();
    if (C.ou === 'dehors' && C.mode === 'vol' && !C.pris && this.vivant() && this.connu()) {
      C.pris = true;
      const due = ((C.jour || farm.s.day) + 1 - 1) * 24 + BIBLIO.heure, P = this.pret();
      if (due < C.due) { C.due = Math.max(due, farm.s.hours + 6); if (P) P.due = C.due; }
    }
    if (C.ou === 'dehors' && C.mode === 'vol' && !C.lettre && this.vivant()) {
      C.lettre = 1;
      const quand = biblio.dateTexte(C.due);
      if (C.pris) farm.mail('La grande bibliothèque', 'La clé', `Vous l’avez prise sous mes yeux, ou presque. Je ne vous poursuivrai pas : ce n’est pas moi qu’il faut craindre.\n\nRapportez-la ${quand}.\n\n${biblio.nom()}, bibliothécaire.`);
      else farm.mail('?', 'Sans timbre', `Il manque une chose à la grande bibliothèque.\n\nLe registre a écrit un nom tout seul, cette nuit, de l’encre qui ne sèche pas. C’est le vôtre.\n\nRapportez-la ${quand}. Au comptoir, dans la boîte, ou là où vous l’avez prise. Personne ne vous demandera rien.`);
    }
  },
  update(dt, playing) {
    if (!farm.s || !game.world || game.kind !== 'farm' || this.enZone()) return;
    this.chkT -= dt;
    if (this.chkT > 0) return;
    this.chkT = 2;
    try { this.verifierCle(playing); } catch (e) { console.error(e); }
  },

  // ================================================================== LE LIVRE CREUX
  pageCreux() {
    const C = this.C(), avec = C.ou === 'livre';
    let h = `<div class="y2-creux"><img src="${this.image(avec)}" alt=""></div>`;
    if (avec) h += `<div class="txt">${livres.txt('Passé la vingtième page, les feuillets sont collés ensemble et creusés au canif, proprement, comme on creuse un berceau. Dedans, couchée dans son lit de papier, une clé de fer noir.')}</div><p class="deplier-p"><button class="deplier" data-y2="prendre">Prendre la clé</button></p>`;
    else {
      h += `<div class="txt">${livres.txt('Passé la vingtième page, les feuillets sont collés ensemble et creusés au canif. La cavité est vide ; le papier garde la forme d’une clé, avec un peu de rouille au fond.')}</div>`;
      if (C.ou === 'dehors' && farm.count(Y2_CLE)) h += `<p class="deplier-p"><button class="deplier" data-y2="remettre">Remettre la clé dans le livre</button></p>`;
    }
    return h;
  },
  // la clé dessinée seule, à plat (96 × 34 points), une fois pour toutes : l'anneau ovale ajouré, la bague, la tige,
  // le panneton aux dents fines comme un peigne ; du fer noir, poli aux arêtes, un peu de rouille
  dessinCle() {
    if (this._cle) return this._cle;
    const cv = document.createElement('canvas'); cv.width = 96; cv.height = 34;
    const c = cv.getContext('2d'), P = (x, y, col) => { c.fillStyle = col; c.fillRect(x, y, 1, 1); }, R = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
    const F = '#2b2926', H = '#57534b', E = '#8c867a', O = '#141311', U = '#6e4326';
    // l'anneau : un ovale percé d'un trèfle
    for (let y = 2; y < 32; y++) for (let x = 1; x < 26; x++) {
      const ex = (x - 13) / 12, ey = (y - 17) / 15, d = ex * ex + ey * ey;
      if (d > 1) continue;
      const trou = [[13, 11], [9, 19], [17, 19]].some(([a, b]) => (x - a) * (x - a) + (y - b) * (y - b) < 9) || ((x - 13) * (x - 13) + (y - 17) * (y - 17) < 5);
      if (trou) continue;
      P(x, y, d > 0.8 ? (y < 17 ? E : O) : y < 12 ? H : F);
    }
    // la bague, la tige, le bout
    R(25, 13, 5, 9, F); R(25, 13, 5, 1, E); R(25, 21, 5, 1, O); R(30, 14, 2, 7, H);
    R(32, 15, 52, 5, F); R(32, 15, 52, 1, E); R(32, 16, 52, 1, H); R(32, 19, 52, 1, O);
    R(84, 15, 6, 5, F); R(84, 15, 6, 1, E); R(90, 16, 2, 3, O);
    // le panneton : il pend sous la tige, entaillé de dents fines
    R(70, 20, 18, 12, F); R(70, 20, 1, 12, H); R(70, 31, 18, 1, O); R(87, 20, 1, 12, O);
    for (const x of [73, 76, 79, 82, 85]) c.clearRect(x, 26, 1, 6);
    R(76, 22, 6, 2, O);
    // la rouille, l'usure
    for (const [x, y] of [[40, 18], [41, 18], [58, 19], [64, 17], [72, 29], [83, 23], [6, 20], [20, 9], [27, 19]]) P(x, y, U);
    for (const [x, y] of [[46, 15], [47, 15], [60, 15], [11, 4], [12, 4]]) P(x, y, '#b4ad9e');
    return (this._cle = cv);
  },
  // le dessin du livre ouvert, creusé, avec ou sans la clé (une fois pour toutes)
  image(avec) {
    const k = avec ? 'avec' : 'sans';
    if (this._img[k]) return this._img[k];
    let url = '';
    try {
      const cv = document.createElement('canvas'); cv.width = 120; cv.height = 64;
      const c = cv.getContext('2d'), R = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
      c.imageSmoothingEnabled = false;
      R(0, 0, 120, 64, '#2a2018');
      R(2, 3, 116, 58, '#5a3a24'); R(3, 4, 114, 56, '#6e4a2e');                // la reliure
      R(6, 6, 52, 52, '#e8dcbc'); R(62, 6, 52, 52, '#e4d6b4'); R(58, 6, 4, 52, '#b8a47c');   // les pages, le pli
      for (let y = 9; y < 56; y += 3) { R(9, y, 46, 1, 'rgba(120,100,70,.22)'); R(65, y, 46, 1, 'rgba(120,100,70,.22)'); }
      // la cavité : des tranches de papier, le fond sombre
      R(8, 12, 104, 40, '#a08a62'); R(10, 14, 100, 36, '#8a7450'); R(12, 16, 96, 32, '#5a4a34'); R(13, 17, 94, 30, '#3a2e22');
      for (let x = 9; x < 111; x += 2) R(x, 13, 1, 1, '#c8b48c');
      if (avec) c.drawImage(this.dessinCle(), 13, 15);
      else {
        R(16, 22, 24, 22, '#33281e'); R(40, 30, 50, 6, '#33281e'); R(80, 34, 18, 12, '#33281e');
        for (const [x, y] of [[44, 32], [60, 33], [72, 31], [26, 30], [86, 40]]) R(x, y, 2, 1, '#7a4a2a');
      }
      url = cv.toDataURL();
    } catch (e) { url = ''; }
    return (this._img[k] = url);
  },
  // la clé seule, sur un velours sombre
  imageCle() {
    if (this._img.cle) return this._img.cle;
    let url = '';
    try {
      const cv = document.createElement('canvas'); cv.width = 112; cv.height = 46;
      const c = cv.getContext('2d');
      c.imageSmoothingEnabled = false;
      c.fillStyle = '#2a1c1c'; c.fillRect(0, 0, 112, 46);
      for (let i = 0; i < 260; i++) { const x = (i * 37) % 112, y = (i * 53 + (i >> 3)) % 46; c.fillStyle = i % 3 ? 'rgba(80,40,40,.35)' : 'rgba(10,6,6,.4)'; c.fillRect(x, y, 1, 1); }
      c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(10, 10, 96, 34);   // l'ombre
      c.drawImage(this.dessinCle(), 8, 6);
      url = cv.toDataURL();
    } catch (e) { url = ''; }
    return (this._img.cle = url);
  },
  // la clé en main : la regarder
  regarder() {
    const C = this.C(), P = this.pret();
    let ins = '';
    try { ins = langCanvas('aelin', Y2_CLE_INSCR, { size: 16, bg: '#d8d0b8', ink: '#3a2a1a' }).toDataURL(); } catch (e) { ins = ''; }
    // (la traduction ne remplace que les mots connus ; rien de connu : on ne sait pas lire)
    const tr = typeof langues !== 'undefined' ? langues.traduire('aelin', Y2_CLE_INSCR) : Y2_CLE_INSCR;
    const lu = tr !== Y2_CLE_INSCR.replace(/\s+,/g, ',');
    let etat = '';
    if (P && C.mode === 'pret') etat = `Prêtée par la grande bibliothèque : à rendre au comptoir ${biblio.dateTexte(P.due)}.`;
    else if (P && C.mode === 'vol') etat = `Le registre de la grande bibliothèque l’attend ${biblio.dateTexte(P.due)}.`;
    this.style();
    ui.open('#reader', `<h3>${esc(Y2_TITRE_CLE)}</h3><div class="y2-creux y2-seule"><img src="${this.imageCle()}" alt=""></div><div class="bb-sceau y2-sceau"><img src="${ins}" alt=""><span>${esc(lu ? '« ' + tr + ' »' : '(Sur l’anneau, de haut en bas, des Hautes Lettres. Vous ne savez pas les lire.)')}</span></div><div class="txt">${livres.txt('Du fer noir, poli là où les mains l’ont tenue, plus lourd qu’il ne devrait, et qui ne se réchauffe pas dans la main. Le panneton a des dents fines et serrées comme celles d’un peigne, qu’aucune serrure de la vallée ne connaît.')}</div>${etat ? `<div class="sign">${esc(etat)}</div>` : ''}<button class="close">Refermer</button>`);
    $('#reader .close').onclick = () => ui.close();
    biblio.style();
  },

  // ================================================================== LE BIBLIOTHÉCAIRE, EN PARLANT
  // ce que la Grande Porte fera aujourd'hui (porteV1 de V1 : null | 'vorndi' | 'brume' | 'nuit'), dit de biais
  ceSoir() {
    try {
      if (typeof porteV1 === 'undefined' || !porteV1 || typeof porteV1.fermee !== 'function') return '';
      const d = farm.s.day, f = porteV1.fermee(d, 23);
      if (f === 'vorndi') return ' Aujourd’hui, de toute façon, elle ne s’ouvrira pas.';
      if (f === 'nuit') return ' Cette nuit, ses feux s’éteindront.';
      return '';
    } catch (e) { return ''; }
  },
  question() { const S = this.S(), i = (S.qi ?? (S.qi = (farm.s.seed >>> 0) % Y2_QUESTIONS.length)); return Y2_QUESTIONS[i]; },
  // le texte de « La Grande Porte… » et les choix qui suivent : { text, options }
  porte(t) {
    const C = this.C(), S = this.S(), Bb = biblio.S(), s = farm.s;
    if (C.ou === 'dehors' && C.mode === 'pret') return t.view(`Vous l’avez. Rendez-la ${biblio.dateTexte(C.due)}. Les gens d’ici disent qu’elle ouvre la Porte. Ils se trompent : c’est la Porte qui l’attend.`, t.options());
    if (C.ou === 'dehors' && C.mode === 'vol') return t.view(`Il manque une chose ici depuis le jour ${C.jour}. Le registre sait qui. Je ne le dirai pas plus fort que lui.`, t.options());
    if (C.ou !== 'livre') return t.view('Elle n’est pas là. Elle reviendra. Elles reviennent toujours.', t.options());
    if (C.plusPret) return t.view('Je vous l’ai prêtée une fois. Elle est revenue sans vous. Non.', t.options());
    if (biblio.present() !== 'la') return t.view('Pas ici. Ces choses-là se demandent à la bibliothèque, au comptoir, et à voix basse.', t.options());
    if (!this.peutPreter()) {
      const l = Bb.lecteur || 0;
      return t.view(l === 0 ? 'La Grande Porte ? Une porte. Moi, je garde des livres. Empruntez-en un, et rendez-le à l’heure ; nous verrons après.'
        : l < 3 ? 'On me demande souvent la clé. On croit que je la garde dans un tiroir, comme un sacristain. Rendez encore quelques livres à l’heure, et nous en reparlerons.'
          : 'Vous êtes exact, c’est déjà beaucoup. Mais je ne vous connais pas encore assez. Revenez me voir. Parlez-moi d’autre chose.', t.options());
    }
    if (S.q.ok) return t.view('La clé. Trois jours, ou sept. La caution vous sera rendue au retour, à l’heure. Pas une minute après.' + this.ceSoir(), [
      { label: `Trois jours (caution : ${Y2_CAUTION[3]} pièces)`, act: 'y2:pret3' }, { label: `Sept jours (caution : ${Y2_CAUTION[7]} pièces)`, act: 'y2:pret7' }, { label: 'Pas maintenant', act: 'y2:non' },
    ]);
    if (S.q.rate === s.day) return t.view('Pas aujourd’hui. Lisez. Revenez demain.', t.options());
    const Q = this.question(), ordre = [0, 1, 2, 3].sort((a, b) => ((a * 7 + s.seed) % 5) - ((b * 7 + s.seed) % 5));
    this._q = ordre;
    return t.view(`Vous voulez la clé. Tout le monde, un jour, veut la clé. Je la prête, quelquefois, à ceux qui reviennent. Dites-moi d’abord une chose. ${Q.q}`, ordre.map((i) => ({ label: Q.rep[i], act: 'y2:rep:' + i })).concat([{ label: 'Je ne sais pas', act: 'y2:non' }]));
  },
  choisir(t, act) {
    const S = this.S(), s = farm.s, n = t.n;
    if (act === 'y2:porte') return this.porte(t);
    if (act.startsWith('y2:rep:')) {
      const i = +act.slice(7);
      if (i === 0) { S.q.ok = s.day; npcs.addAmitie(n, 10); return this.porte(t); }
      S.q.rate = s.day;
      return t.view('Non. Lisez, et revenez. Les réponses ne sont pas cachées : elles sont rangées.', t.options());
    }
    if (act === 'y2:pret3' || act === 'y2:pret7') {
      const j = act === 'y2:pret3' ? 3 : 7, r = this.preter(j);
      if (r === 'argent') return t.view(`${Y2_CAUTION[j]} pièces de caution. Je ne fais pas crédit, ni pour les livres ni pour le reste.`, t.options());
      if (r === 'max') return t.view('Vous avez déjà trois emprunts. Rendez d’abord ce que vous avez.', t.options());
      if (r !== 'ok') return t.view('Non.', t.options());
      return t.view(`Il monte à la galerie et redescend avec un gros in-folio poussiéreux, qu’il ouvre au milieu. Les pages sont creusées ; la clé y est couchée comme dans un cercueil. Il vous la tend sans la lâcher tout de suite. « ${livres.cap(biblio.dateTexte(this.C().due))}. Rapportez-la vous-même. »`, t.options());
    }
    if (act === 'y2:non') return t.view(pick(['Bien.', 'Comme vous voudrez.', 'Rien ne presse. Elle non plus.']), t.options());
    if (act === 'y2:rendre') { this.rendre({}); return t.view(pick(['C’est tout ?', 'Bonne journée.', 'Bien.']), t.options()); }
    if (act === 'y2:perdue') {
      const C = this.C(), P = this.pret(), Bb = biblio.S();
      if (P) { Bb.prets = Bb.prets.filter((p) => p !== P); Bb.hist.push({ id: Y2_CLE, du: P.du, rendu: s.day, retard: s.hours > P.due }); }
      Object.assign(C, { ou: 'perdue', perdueH: s.hours, avoue: true, plusPret: s.day, caution: 0 });
      npcs.addAmitie(n, -40);
      return t.view('Je sais. Elle reviendra : elles reviennent toujours. Mais la caution reste au registre, et vous ne la toucherez plus.', t.options());
    }
    return null;
  },

  // ================================================================== LE CARNET
  ligneCarnet(P) {
    const C = this.C();
    if (C.mode === 'pret') return `<div class="q actif"><b>${esc('La clé de la Grande Porte (prêtée)')}</b><div>${esc(`À rendre au comptoir de la grande bibliothèque ${biblio.dateTexte(P.due)} (${biblio.reste(P.due)}). La caution, ${C.caution} pièces, sera rendue si elle revient à l’heure.`)}</div></div>`;
    return `<div class="q actif"><b>${esc('La clé de la Grande Porte')}</b><div>${esc(`Le registre de la grande bibliothèque l’attend ${biblio.dateTexte(P.due)} (${biblio.reste(P.due)}) : au comptoir, dans la boîte, ou dans son livre.`)}</div></div>`;
  },

  style() {
    if (this.styled) return;
    this.styled = true;
    const st = document.createElement('style');
    st.textContent = `#biblio .y2-dos{width:11px;height:34px;flex:none;border-radius:2px 2px 1px 1px;box-shadow:inset -3px 0 0 rgba(0,0,0,.28),inset 0 3px 0 rgba(255,230,170,.18),inset 0 -3px 0 rgba(255,230,170,.18)}
#biblio .y2-tabs{display:flex;flex-wrap:wrap;gap:4px;margin:2px 0 8px}
#biblio .y2-tabs button{padding:4px 9px;background:rgba(255,255,255,.3);border:1px solid rgba(90,70,40,.3);border-radius:3px;font:13px Georgia,serif;color:#4a3a26;cursor:pointer}
#biblio .y2-tabs button.on{background:#8a5a2a;color:#f4ead2;border-color:#8a5a2a}
#biblio .y2-tabs small{opacity:.7}
.y2-creux{text-align:center;margin:2px 0 8px}
.y2-creux img{width:min(100%,240px);image-rendering:pixelated;border-radius:2px;box-shadow:0 2px 8px rgba(0,0,0,.35)}
.y2-creux.y2-seule img{width:min(100%,300px)}
#reader .y2-creux{margin:0 0 6px}
#reader .y2-sceau{margin:2px 0 8px}
#reader .y2-sceau img{height:72px}
#reader .y2-sceau span{max-width:300px}
#livre .deplier-p{margin-top:10px}`;
    document.head.appendChild(st);
  },
};

// ---------------------------------------------------------------- les rayons au comptoir (étiquette, ordre)
{
  const _cat = biblio.catalogue.bind(biblio);
  biblio.catalogue = function () {
    const out = _cat();
    for (const e of out) {
      const r = e.livre ? bibliotheque2.rayonDe(e.livre) : 'cartes';
      if (r && Y2_RAYONS[r]) { e.rayon = r; e.genre = Y2_RAYONS[r].nom; }
    }
    const rang = (e) => { const i = Y2_RAYONS_ORDRE.indexOf(e.rayon); return i < 0 ? 99 : i; };
    return out.map((e, i) => [e, i]).sort((a, b) => rang(a[0]) - rang(b[0]) || a[1] - b[1]).map((a) => a[0]);
  };
  // le comptoir : d'abord la caution d'une clé rendue en silence
  const _comptoir = biblio.comptoir.bind(biblio);
  biblio.comptoir = function (onglet) {
    try { if (farm.s) bibliotheque2.rembourser(); } catch (e) { console.error(e); }
    return _comptoir(onglet);
  };
  // rendre la clé au comptoir (ou dans la boîte) : nos règles, nos mots
  const _rendre = biblio.rendre.bind(biblio);
  biblio.rendre = function (i, boite) {
    const P = this.S().prets[i];
    if (!P || P.id !== Y2_CLE) return _rendre(i, boite);
    if (!farm.count(Y2_CLE)) return false;
    bibliotheque2.rendre({ boite });
    return false; // (le comptoir n'ajoute pas son propre mot)
  };
  // la traque calmée : si la clé en était, elle est rentrée
  const _calmer = biblio.calmer.bind(biblio);
  biblio.calmer = function () {
    const TQ = this.S().traque, cle = !!(TQ && TQ.ids.includes(Y2_CLE) && farm.count(Y2_CLE));
    const r = _calmer();
    if (cle && !farm.count(Y2_CLE)) bibliotheque2.rentrer('traque');
    return r;
  };
  // le carnet : la clé a sa propre ligne
  const _lc = biblio.lignesCarnet.bind(biblio);
  biblio.lignesCarnet = function () {
    const B = this.S(), i = B.prets.findIndex((p) => p.id === Y2_CLE);
    if (i < 0 || (B.traque && B.traque.ids.includes(Y2_CLE))) return _lc();
    const P = B.prets[i];
    B.prets.splice(i, 1);
    let out;
    try { out = _lc(); } finally { B.prets.splice(i, 0, P); }
    out.push(bibliotheque2.ligneCarnet(P));
    return out;
  };
}

// ---------------------------------------------------------------- le livre creux : ses pages, sa lecture
{
  const _pages = livres.pages.bind(livres);
  livres.pages = function (id) {
    const P = _pages(id);
    if (id === Y2_CREUX && P.length > 1 && farm.s) {
      const last = P[P.length - 1];
      last.titre = '';
      last.html = bibliotheque2.pageCreux();
    }
    return P;
  };
  const _ouvrir = livres.ouvrir.bind(livres);
  livres.ouvrir = function (id, opts) {
    if (id === Y2_CREUX && farm.s && bibliotheque2.C().ou === 'livre' && bibliotheque2.vu()) { bibliotheque2.empeche(); return false; }
    const r = _ouvrir(id, opts);
    if (r && id === Y2_CREUX && this.cur) { this.cur.limite = undefined; this.rendre(); }
    return r;
  };
  const _rendre = livres.rendre.bind(livres);
  livres.rendre = function () {
    _rendre();
    if (!this.cur || this.cur.id !== Y2_CREUX) return;
    $$('#livre [data-y2]').forEach((b) => (b.onclick = () => {
      if (b.dataset.y2 === 'prendre') bibliotheque2.prendre();
      else if (b.dataset.y2 === 'remettre') bibliotheque2.remettre();
    }));
    bibliotheque2.style();
  };
}

// ---------------------------------------------------------------- accroches : rayonnages, archives, la clé en main
{
  const _pr = HOOKS.interPre.biblio_rayon;
  HOOKS.interPre.biblio_rayon = (it) => (_pr && _pr(it)) || (farm.s ? bibliotheque2.rayons(it) : false);
  const _pa = HOOKS.interPre.archives_livre;
  HOOKS.interPre.archives_livre = (it) => (_pa && _pa(it)) || (farm.s && Y2_LIVRES.some((id) => LIVRES[id].enfer) ? bibliotheque2.archives() : false);
}
HOOKS.primary.push((eye, basis, held, it, id) => {
  if (id !== Y2_CLE) return false;
  if (!held) { bibliotheque2.regarder(); play.cool = 0.4; }
  return true;
});
HOOKS.update.push((dt, eye, basis, sky, playing) => bibliotheque2.update(dt, playing));
HOOKS.day.push(() => { try { if (farm.s) bibliotheque2.matin(); } catch (e) { console.error(e); } });

// ---------------------------------------------------------------- le bibliothécaire : la Porte, la clé
{
  const _options = talk.options.bind(talk);
  talk.options = function () {
    let opts = _options();
    try {
      const n = this.n, s = farm.s;
      if (!s || !n) return opts;
      const main = s.hand === Y2_CLE;
      if (n.id !== 'libraire') { if (main) opts = opts.filter((o) => o.act !== 'gift'); return opts; }
      if (npcs.murdererKnown()) return opts;
      const C = bibliotheque2.C(), extra = [];
      if (main) opts = opts.filter((o) => o.act !== 'gift');
      if (farm.count(Y2_CLE) && C.ou === 'dehors' && C.mode) extra.push({ label: 'Rendre la clé de la Grande Porte', act: 'y2:rendre' });
      if (!biblio.banni()) {
        if (C.mode === 'pret' && C.ou === 'dehors' && !farm.count(Y2_CLE)) extra.push({ label: 'J’ai perdu la clé…', act: 'y2:perdue' });
        extra.push({ label: 'La Grande Porte…', act: 'y2:porte' });
      }
      const i = opts.findIndex((o) => o.act === 'bye');
      opts.splice(i >= 0 ? i : opts.length, 0, ...extra);
    } catch (e) { console.error(e); }
    return opts;
  };
  const _choose = talk.choose.bind(talk);
  talk.choose = function (act) {
    if (typeof act === 'string' && act.startsWith('y2:') && this.n && farm.s) {
      try { const v = bibliotheque2.choisir(this, act); if (v) return v; } catch (e) { console.error(e); }
    }
    return _choose(act);
  };
}
// le retour des Terres d'Avant (zone de V1, lien gardé) : le gardien dit la formule, avant toute autre parole
HOOKS.load.push(() => {
  if (bibliotheque2._zoneLie || typeof zone === 'undefined' || !zone || typeof zone.sur !== 'function') return;
  bibliotheque2._zoneLie = true;
  try { zone.sur('sortir', () => { try { if (farm.s) bibliotheque2.S().retour = farm.s.day; } catch (e) { console.error(e); } }); } catch (e) { console.error(e); }
});
{
  const _open = talk.open.bind(talk);
  talk.open = function (n) {
    const v = _open(n);
    try {
      if (v && n && n.id === 'libraire' && farm.s && !biblio.banni() && !npcs.murdererKnown()) {
        const S = bibliotheque2.S();
        if (S.retour && farm.s.day - S.retour <= 2) { S.retour = 0; v.text = '« Rien n’est entré avec toi. » Il vous regarde longtemps, de face, puis de côté, comme on compte. Puis, plus bas : « Bien. »'; }
      }
    } catch (e) { console.error(e); }
    return v;
  };
}
// ce que le bibliothécaire dit en passant (des mots de plus ; l'ordre des autres ne change pas)
{
  const d = NPC_DATA.find((q) => q.id === 'libraire');
  if (d && d.lines) {
    if (Array.isArray(d.lines.rumeurs)) d.lines.rumeurs.push('Les gens croient qu’on garde les clés dans des tiroirs. Les clés qui comptent, on les range là où personne ne cherche : au milieu de ce que personne ne lit.');
    if (Array.isArray(d.lines.etrange)) d.lines.etrange.push('Cette nuit, un livre de la galerie est tombé tout seul. Les Tables de concordance. Personne ne les lit, et elles tombent quand même.');
  }
}

// ---------------------------------------------------------------- les livres de serrurerie, pour la compétence de U
function y2Serrures() {
  try {
    if (typeof crochetage === 'undefined' || !crochetage || !crochetage.livres || typeof crochetage.livres !== 'object') return;
    const poids = { y_serrurerie: 3, y_monte_en_l_air: 2, y_portes_seuils: 1 };
    for (const id of bibliotheque2.serrures()) if (!crochetage.livres[id]) crochetage.livres[id] = poids[id] || 1;
  } catch (e) { console.error(e); }
}
y2Serrures();
HOOKS.load.push(() => y2Serrures());

// ---------------------------------------------------------------- chargement : remettre l'état d'aplomb
HOOKS.load.push(() => {
  bibliotheque2.chkT = 1; bibliotheque2._q = null;
  if (!farm.s) return;
  try {
    const C = bibliotheque2.C(), Bb = biblio.S();
    if (C.ou === 'livre' && farm.count(Y2_CLE) > 0) Object.assign(C, { ou: 'dehors', mode: null, due: 0 });
    if (C.ou === 'dehors' && C.mode && !Bb.prets.some((p) => p.id === Y2_CLE) && bibliotheque2.vivant() && bibliotheque2.quelquePart())
      Bb.prets.push({ id: Y2_CLE, titre: Y2_TITRE_CLE, du: C.jour || farm.s.day, dur: 0, due: C.due || biblio.echeance(1), paye: C.caution || 0, rappel: 1, alerte: 1, alerte2: 1, y2: C.mode });
  } catch (e) { console.error(e); }
});
