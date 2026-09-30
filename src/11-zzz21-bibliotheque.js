// ============================================================================
//  LA GRANDE BIBLIOTHÈQUE (sur le plateau ; le bibliothécaire : 'libraire')
//  - le comptoir (inter 'biblio') : emprunter un livre ou une carte pour 1, 3 ou
//    7 jours (payé d'avance), rendre ; une lettre de rappel la veille, et une
//    ligne au carnet ; quand le comptoir est désert, la boîte aux retours ;
//  - les rayonnages ('biblio_rayon') : les titres, et quelques pages lues sur place ;
//  - la vitrine ('biblio_vitrine') : objets et documents rares ;
//  - le rayonnage du fond ('biblio_secret') : un passage vers la salle des
//    archives, à trouver (la confiance du bibliothécaire, la pierre gravée de
//    l'entrée, ou l'obstination) ; le registre des archives ('archives_livre') ;
//  - LE RETARD : passé l'heure, le bibliothécaire devient un sorcier (cinématique)
//    et traque le lecteur où qu'il soit, plus souvent la nuit : il apparaît, flotte,
//    le suit, jette des sorts (ténèbres, traits d'ombre, murmures) et tue au
//    contact. La flamme d'une lanterne le tient à distance un moment ; il n'entre
//    pas en terre bénite. Rapporter le livre au comptoir le calme, mais la
//    bibliothèque vous est fermée ensuite ; garder le livre attire une malédiction.
//  État : farm.s.biblio = { prets: [{ id, titre, du, dur, due, paye, rappel }],
//         traque: null | { debut, jour, ids }, banni, passage, fouilles, lecteur,
//         hist: [...], perdu: { j, titre }, fleur }
// ============================================================================
const BIBLIO = {
  mult: { 1: 1, 3: 2, 7: 3.5 },
  max: 3,
  heure: 19,                                    // à rendre avant sept heures du soir, le jour dit
  cartes: ['ancien', 'nord', 'monts', 'est', 'ouest', 'sud', 'centre'],
  saints: [['eglise', 20], ['chapelle', 16], ['abbaye', 34], ['cimetiere', 22], ['calvaire0', 7], ['calvaire1', 7], ['calvaire2', 7], ['calvaire3', 7], ['calvaire4', 7]],
  phrases: ['rhua tin', 'ta ne tin rhu nai', 'ves ta kala', 'tin na-mi , rhua', 'mi rimen na-tinim', 'o ta , ves vesa'],
};
const SORCIER_LOOK = { skin: '#d6cfc6', hair: '#e6e6e6', hairStyle: 'long', beard: 'longue', hat: 'capuche', hatCol: '#0e0c14', top: '#15111d', bottom: '#0f0d15', shoe: '#0a0a0a', dress: true, coat: true, height: 1.2, build: 'mince', held: 'livre' };

const biblio = {
  E: null, bolts: [], noirT: 0, cineE: null, chkT: 0, voixT: 0, _rig: null,
  S() {
    const s = farm.s;
    const B = s.biblio || (s.biblio = {});
    if (!Array.isArray(B.prets)) B.prets = [];
    if (!Array.isArray(B.hist)) B.hist = [];
    return B;
  },
  banni() { return !!(farm.s && this.S().banni); },
  libraire() { return npcs.byId ? npcs.byId.libraire : null; },
  nom() { const n = this.libraire(); return n ? n.name + ' ' + n.d.surname : 'Le bibliothécaire'; },
  bat() { const w = game.world; return w && w.bld && w.bld.bibliotheque; },
  dedans(pos, marge) { const b = this.bat(); if (!b) return false; const c = Math.cos(b.f.r), s = Math.sin(b.f.r), dx = pos[0] - b.f.x, dz = pos[2] - b.f.z; return Math.abs(dx * c - dz * s) < b.W / 2 + (marge || 0) && Math.abs(dx * s + dz * c) < b.D / 2 + (marge || 0); },
  // le bibliothécaire est-il là (dans la bibliothèque) ? 'la' | 'dort' | null
  present() {
    const n = this.libraire(), b = this.bat();
    if (!n || !b || !n.st.alive || n.hunting || n.vanished) return null;
    if (!this.dedans([n.x, 0, n.z], 1.5)) return null;
    return n.state === 'sleep' || n.sleep ? 'dort' : 'la';
  },
  // ------------------------------------------------------------ le catalogue et les prêts
  catalogue() {
    const out = [];
    for (const id in LIVRES) {
      const L = LIVRES[id];
      if (!L.biblio || !ITEMS['livre_' + id]) continue;
      out.push({ item: 'livre_' + id, livre: id, titre: L.titre, auteur: L.auteur || '', genre: L.langue ? 'Langues d’avant' : L.carte ? 'Cartes' : L.secret ? 'Réserve' : 'Rayonnages', base: L.langue ? (L.grand || (L.mots || 0) >= 999 ? 60 : 25) : L.secret || L.carte ? 20 : 12 });
    }
    for (const k of BIBLIO.cartes) {
      const C = CARTES_REGIONS[k];
      if (!C || !ITEMS['carte_' + k]) continue;
      // (une carte qu'on achète aussi chez les marchands : l'emprunter sept jours coûte moins de la moitié de son prix)
      out.push({ item: 'carte_' + k, carte: k, titre: C.titre, auteur: '', genre: 'Cartes', base: k === 'ancien' ? 30 : Math.max(8, Math.round((ITEMS['carte_' + k].price || C.prix) * 0.12)) });
    }
    return out;
  },
  prix(e, j) { return Math.max(5, Math.round(e.base * BIBLIO.mult[j] / 5) * 5); },
  echeance(j) { return (farm.s.day + j - 1) * 24 + BIBLIO.heure; },
  jourDe(h) { return Math.floor((h - 6) / 24) + 1; },
  dateTexte(h) { const d = this.jourDe(h), H = Math.round(h - (d - 1) * 24) % 24; return `le ${cal.nom(d)} (jour ${d}), avant ${H} heures`; },
  reste(h) {
    const r = h - farm.s.hours;
    if (r <= 0) return 'en retard';
    if (r < 2) return 'moins de deux heures';
    if (r < 48) { const n = Math.floor(r); return `encore ${n} heures`; }
    return `encore ${Math.floor(r / 24)} jours`;
  },
  duree(j) { return j > 1 ? `${j} jours` : 'un jour'; },
  emprunter(e, j) {
    const s = farm.s, B = this.S();
    if (this.banni()) return 'banni';
    if (B.prets.length >= BIBLIO.max) return 'max';
    if (B.prets.some((p) => p.id === e.item)) return 'deja';
    const pr = this.prix(e, j);
    if (!farm.pay(pr)) return 'argent';
    farm.give(e.item, 1);
    B.prets.push({ id: e.item, titre: e.titre, du: s.day, dur: j, due: this.echeance(j), paye: pr });
    sound.coin && sound.coin();
    return 'ok';
  },
  rendre(i, boite) {
    const s = farm.s, B = this.S(), P = B.prets[i];
    if (!P || !farm.take(P.id, 1)) return false;
    B.prets.splice(i, 1);
    const retard = s.hours > P.due;
    B.hist.push({ id: P.id, du: P.du, rendu: s.day, retard });
    if (B.hist.length > 30) B.hist.shift();
    if (!retard) { B.lecteur = (B.lecteur || 0) + 1; const n = this.libraire(); if (n && !boite) npcs.addAmitie(n, 25); }
    sound.page && sound.page();
    return true;
  },
  enRetard() { const s = farm.s; return this.S().prets.filter((p) => s.hours > p.due); },
  // ------------------------------------------------------------ panneau (comptoir, rayonnages)
  panneau(html) {
    this.style();
    if (!$('#biblio')) { const el = document.createElement('div'); el.id = 'biblio'; el.className = 'pp-panel'; $('#paper').appendChild(el); }
    if (ui.panel === '#biblio') $('#biblio').innerHTML = html; else ui.open('#biblio', html);
    const x = $('#biblio [data-close]');
    if (x) x.onclick = () => ui.close();
  },
  comptoir(onglet) {
    const s = farm.s, B = this.S(), n = this.libraire();
    if (B.traque) return this.comptoirTraque();
    if (n && !n.st.alive) { ui.read('Le comptoir', 'Le registre est ouvert à une page que personne ne tournera plus. La plume a séché dans l’encrier.\n\nLes livres attendent, en rang, dans la poussière qui commence.'); return; }
    const pres = this.present();
    const tab = this.banni() || pres !== 'la' ? 'rendre' : onglet || this.tab || 'emprunter';
    this.tab = tab;
    let tete;
    if (this.banni()) tete = pres === 'la' ? `« Vous n’êtes plus lecteur ici. » (Une boîte pour les retours, sur le comptoir.)` : '(Le comptoir est désert. Une boîte : « Retours ».)';
    else if (pres === 'la') tete = pick(['« Les emprunts se paient d’avance, et se rendent le jour dit, avant sept heures du soir. Le jour dit. »', '« Un livre prêté est une promesse. Choisissez bien. »', '« Parlez bas. Les livres écoutent. »']);
    else if (pres === 'dort') tete = '(Le bibliothécaire dort. Une boîte, sur le comptoir : « Retours ».)';
    else tete = '(Le comptoir est désert. Une boîte : « Retours ». Pour emprunter, il faut attendre le bibliothécaire.)';
    let body = `<p class="bb-tete">${esc(tete)}</p>`;
    if (tab === 'emprunter') {
      const groupes = {};
      for (const e of this.catalogue()) (groupes[e.genre] || (groupes[e.genre] = [])).push(e);
      this.cat = this.catalogue();
      for (const g of Object.keys(groupes)) {
        body += `<h4>${esc(g)}</h4>`;
        body += groupes[g].map((e) => {
          const i = this.cat.findIndex((q) => q.item === e.item), pris = B.prets.some((p) => p.id === e.item);
          const btn = [1, 3, 7].map((j) => { const pr = this.prix(e, j); return `<button data-e="${i}" data-j="${j}" ${!pris && B.prets.length < BIBLIO.max && s.money >= pr ? '' : 'disabled'}>${esc(this.duree(j))} · ${pr}</button>`; }).join('');
          return `<div class="bb-row"><img src="${iconURL(e.item)}" alt=""><div class="bb-t"><b>${esc(e.titre)}</b>${e.auteur ? `<span>${esc(e.auteur)}</span>` : ''}${pris ? '<span class="bb-pris">(chez vous)</span>' : ''}</div><div class="bb-b">${btn}</div></div>`;
        }).join('');
      }
    } else {
      body += `<h4>Vos emprunts</h4>` + (B.prets.map((P, i) => {
        const a = farm.count(P.id) > 0, late = s.hours > P.due;
        return `<div class="bb-row"><img src="${iconURL(P.id)}" alt=""><div class="bb-t"><b>${esc(P.titre)}</b><span class="${late ? 'bb-retard' : ''}">${esc(`Emprunté le jour ${P.du}, à rendre ${this.dateTexte(P.due)} : ${this.reste(P.due)}.`)}</span></div><div class="bb-b"><button data-r="${i}" ${a ? '' : 'disabled'}>${a ? (pres === 'la' && !this.banni() ? 'Rendre' : 'Glisser dans la boîte') : 'Pas sur vous'}</button></div></div>`;
      }).join('') || '<p class="hint">Aucun emprunt en cours.</p>');
      const H = B.hist.slice(-5).reverse();
      if (H.length) body += `<h4>Derniers retours</h4>` + H.map((h) => `<div class="bb-h">${esc(itemName(h.id))} — ${esc(h.retard ? `emprunté le jour ${h.du}, rendu le jour ${h.rendu}, en retard` : `emprunté le jour ${h.du}, rendu le jour ${h.rendu}`)}</div>`).join('');
    }
    const tabs = this.banni() || pres !== 'la' ? '' : `<button data-tab="emprunter" class="${tab === 'emprunter' ? 'on' : ''}">Emprunter</button><button data-tab="rendre" class="${tab === 'rendre' ? 'on' : ''}">Rendre (${B.prets.length})</button>`;
    this.panneau(`<div class="tabs"><b>La grande bibliothèque</b>${tabs}<button class="x" data-close>✕</button></div><div class="body">${body}</div><div class="foot">Bourse : <b>${s.money}</b> pièces · emprunts en cours : ${B.prets.length} / ${BIBLIO.max} · à rendre au comptoir, le jour dit, avant ${BIBLIO.heure} heures</div>`);
    $$('#biblio [data-tab]').forEach((b) => (b.onclick = () => { sound.page && sound.page(); this.comptoir(b.dataset.tab); }));
    $$('#biblio [data-e]').forEach((b) => (b.onclick = () => {
      const e = this.cat[+b.dataset.e], j = +b.dataset.j, r = this.emprunter(e, j);
      if (r === 'ok') ui.subtitle(this.nom(), `« ${e.titre} », pour ${this.duree(j)}. À rendre ${this.dateTexte(this.S().prets[this.S().prets.length - 1].due)}. Ne l’oubliez pas.`, 5);
      this.comptoir('emprunter');
    }));
    $$('#biblio [data-r]').forEach((b) => (b.onclick = () => {
      const P = this.S().prets[+b.dataset.r], late = P && s.hours > P.due, boite = pres !== 'la' || this.banni();
      if (this.rendre(+b.dataset.r, boite)) ui.subtitle(boite ? '' : this.nom(), boite ? '(Le livre tombe au fond de la boîte avec un bruit mat.)' : late ? '« En retard. » Il ne dit rien d’autre.' : pick(['« À l’heure. Merci. »', '« Rendu. Parfait. J’aime les gens exacts. »', '« Merci. Le registre est content. Moi aussi. »']), 3.5);
      this.comptoir('rendre');
    }));
  },
  // pendant la traque : le comptoir est vide, le registre ouvert à votre nom
  comptoirTraque() {
    const B = this.S(), TQ = B.traque;
    const dus = B.prets.filter((p) => TQ.ids.includes(p.id));
    const manque = dus.filter((p) => !farm.count(p.id));
    const titres = dus.map((p) => '« ' + p.titre + ' »').join(', ');
    if (!dus.length) { this.finTraque(); return; }
    const manquent = manque.map((p) => '« ' + p.titre + ' »').join(', ');
    ui.choice('Le comptoir désert', `(Personne. Le registre est ouvert à votre nom : ${titres}.)`,
      manque.length
        ? [{ label: `Il vous manque ${manquent}. Partir le chercher.`, fn: () => ui.close() }]
        : [{ label: `Poser ${titres} sur le comptoir`, fn: () => { ui.close(true); this.calmer(); } }, { label: 'Partir', fn: () => ui.close() }]);
  },
  rayons() {
    const pres = this.present();
    if (this.banni() && pres === 'la') { ui.subtitle('', '(Le bibliothécaire vous fixe. Vous n’osez pas toucher aux livres.)', 3); return; }
    const B = this.S();
    const L = this.catalogue().filter((e) => e.livre);
    const groupes = {};
    for (const e of L) (groupes[e.genre] || (groupes[e.genre] = [])).push(e);
    let body = B.traque ? `<p class="bb-tete">${esc('(Quelque part, une page tourne toute seule.)')}</p>` : '';
    for (const g of Object.keys(groupes)) body += `<h4>${esc(g)}</h4>` + groupes[g].map((e) => `<div class="bb-row"><img src="${iconURL(e.item)}" alt=""><div class="bb-t"><b>${esc(e.titre)}</b><span>${esc(e.auteur)}</span></div><div class="bb-b"><button data-lire="${esc(e.livre)}">Feuilleter</button></div></div>`).join('');
    this.panneau(`<div class="tabs"><b>Les rayonnages</b><button class="x" data-close>✕</button></div><div class="body">${body}</div><div class="foot">Lecture sur place : quelques pages seulement.</div>`);
    $$('#biblio [data-lire]').forEach((b) => (b.onclick = () => livres.ouvrir(b.dataset.lire, { surPlace: true })));
  },
  vitrine() {
    const B = this.S(), pres = this.present();
    let sceau = '';
    try { sceau = langCanvas('aelin', 'ael vor ves', { size: 16, bg: '#d8d0b8', ink: '#4a3a28' }).toDataURL(); } catch (e) { sceau = ''; }
    const tr = typeof langues !== 'undefined' ? langues.traduire('aelin', 'ael vor ves') : 'ael vor ves';
    const lu = tr !== 'ael vor ves';
    const opts = [];
    if (farm.count('fleur_temple') && pres === 'la' && !B.fleur && !this.banni()) opts.push('<button class="deplier" data-fleur>Montrer votre fleur de pierre au bibliothécaire</button>');
    opts.push('<button class="deplier" data-perdus>Lire le registre des lecteurs perdus</button>');
    ui.open('#reader', `<h3>La vitrine</h3><div class="txt">Sous le verre, sur un coussin de velours râpé, une fleur de pierre, grise comme du granit. Une étiquette à l’encre pâle : « Trouvée sous la montagne. Ne pas toucher. »<br><br>À côté, un sceau d’argent terni, gravé de Hautes Lettres :</div><div class="bb-sceau"><img src="${sceau}" alt=""><span>${esc(lu ? '« ' + tr + ' »' : '(Vous ne savez pas lire ces traits.)')}</span></div><div class="txt">Un feuillet de vélin, où les montagnes sont des dents et les forêts de petits arbres, porte au dos un seul mot : « avant ».<br><br>Et, ouvert à la dernière page, un registre relié de noir : « Lecteurs perdus ».</div><div class="bb-opts">${opts.join('')}</div><button class="close">Refermer</button>`);
    $('#reader .close').onclick = () => ui.close();
    const pf = $('#reader [data-perdus]'); if (pf) pf.onclick = () => livres.ouvrir('lecteurs_perdus');
    const fl = $('#reader [data-fleur]');
    if (fl) fl.onclick = () => {
      B.fleur = farm.s.day;
      const n = this.libraire(); if (n) npcs.addAmitie(n, 120);
      B.passage = B.passage || farm.s.day;
      livres.apprendreSecret('fleur');
      ui.read(this.nom(), '« Une autre. Vous en avez trouvé une autre. »\n\n(Il la tourne longtemps entre ses doigts, sans la sentir.)\n\n« Elle vient du temple, sous la montagne. Il n’en pousse nulle part ailleurs. Si vous l’avez cueillie vous-même, vous êtes allé plus loin que moi. Plus loin que tous ceux d’avant moi.\n\nAlors écoutez. Au fond, le dernier rayonnage : tirez le registre noir. Ce qu’il y a derrière, je ne l’ai montré à personne depuis cinquante ans. Ne le faites pas regretter. »', 'Il vous rend la fleur.');
    };
  },
  // ------------------------------------------------------------ le passage des archives
  passageConnu() {
    const B = this.S();
    return !!(B.passage || livres.secret('registre') || (typeof langues !== 'undefined' && langues.vue('a_livres') && langues.sensConnu('a_livres')));
  },
  confiance() { const n = this.libraire(); return !!n && n.st.alive && (this.S().lecteur || 0) >= 2 && npcs.level(n) >= 3; },
  // le bibliothécaire vous voit-il ? (éveillé, à la bibliothèque, et tourné vers vous, ou tout près)
  surveille() {
    const n = this.libraire(), p = game.player;
    if (this.present() !== 'la') return false;
    const dx = p.pos[0] - n.x, dz = p.pos[2] - n.z, d = Math.hypot(dx, dz) || 0.01;
    if (d < 3.5) return true;
    return d < 16 && (dx * Math.sin(n.heading) + dz * Math.cos(n.heading)) / d > -0.1;
  },
  secret(it) {
    const B = this.S(), s = farm.s, w = game.world, pres = this.present();
    if (!w.archives) return;
    if (!this.passageConnu()) {
      if (B.fouilleJ !== s.day) { B.fouilleJ = s.day; B.fouilles = (B.fouilles || 0) + 1; }
      if (B.fouilles >= 3) {
        B.passage = s.day;
        sound.chain && sound.chain();
        ui.subtitle('', '(À force de revenir, vous remarquez l’usure du parquet, en arc de cercle, devant ce rayonnage.)', 5);
        return;
      }
      ui.subtitle('', pick(['(Un registre noir sonne creux.)', '(Un courant d’air froid passe entre les livres.)', '(La poussière est plus épaisse ici. Sauf sur un registre noir.)']), 3.5);
      return;
    }
    if (this.surveille() && (this.banni() || (!this.confiance() && !B.fleur))) { ui.subtitle(this.nom(), pick(['Ce rayonnage-là n’est pas pour les lecteurs.', 'Les registres du fond ne se consultent pas. Merci.']), 3); return; }
    if (!B.passage) B.passage = s.day;
    sound.door && sound.door(true);
    game.teleport(w.archives.to, 'Vous tirez le registre noir. Le rayonnage pivote sur un escalier de pierre qui descend, longtemps, dans le froid.');
  },
  // ------------------------------------------------------------ le retard : rappels, sorcier, traque
  verifier(playing) {
    const s = farm.s, B = this.S();
    if (!B.prets.length && !B.traque) return;
    const n = this.libraire();
    if (!n || !n.st.alive) {
      if (B.prets.length) { B.prets = []; if (playing) ui.subtitle('', '(Le bibliothécaire est mort. Personne ne réclamera plus vos livres.)', 4); }
      if (B.traque) this.finTraque();
      return;
    }
    for (const P of B.prets) {
      const r = P.due - s.hours;
      if (!P.rappel && r <= 24 && r > 0) {
        P.rappel = 1;
        farm.mail('La grande bibliothèque', `Rappel : « ${P.titre} »`, `Madame, Monsieur,\n\nLe registre de la grande bibliothèque porte à votre nom l’emprunt de « ${P.titre} », le jour ${P.du}. L’ouvrage est à rendre au comptoir ${this.dateTexte(P.due)}.\n\nNous comptons sur votre exactitude. Nous y comptons beaucoup.\n\n${this.nom()}, bibliothécaire.`);
      }
      if (playing && !P.alerte && r <= 2 && r > 0) { P.alerte = 1; ui.subtitle('', '(Le livre de la bibliothèque. L’heure approche.)', 3.5); }
      if (playing && !P.alerte2 && r <= 0.6 && r > 0 && farm.count(P.id)) { P.alerte2 = 1; sound.page && sound.page(); ui.subtitle('', '(Dans votre sacoche, des pages tournent toutes seules.)', 4); }
    }
    if (!B.traque && this.enRetard().length && playing && !cine.on && !game.sleeping && !game.dying && !strange.inEnvers() && !corps.hisse) this.transformer();
  },
  cadre() {
    const b = this.bat();
    if (!b) return null;
    const f = b.f, c = Math.cos(f.r), sn = Math.sin(f.r);
    const L = (lx, ly, lz) => [f.x + lx * c + lz * sn, f.y + ly, f.z - lx * sn + lz * c];
    const sp = b.spots.work || { x: L(0, 0, -2.6)[0], y: f.y + 0.15, z: L(0, 0, -2.6)[2], r: f.r + Math.PI };
    return { f, L, sp, tete: [sp.x, sp.y + 1.8, sp.z] };
  },
  tenir(n, sp) { n.x = sp.x; n.z = sp.z; n.y = sp.y; n.heading = sp.r; n.state = 'idle'; n.move = 0; n.talking = false; n.goal = null; n.path = []; n.inside = 'bibliotheque'; n.lookY = 0; },
  phrase(txt) { const tr = typeof langues !== 'undefined' ? langues.traduire('aelin', txt) : txt; return tr !== txt ? tr : ''; },
  transformer() {
    const B = this.S(), s = farm.s, n = this.libraire(), K = this.cadre();
    if (!n || !K) return;
    B.traque = { debut: s.hours, jour: s.day, ids: this.enRetard().map((p) => p.id) };
    this.E = null; this.bolts = []; this.noirT = 0;
    const { L, sp, tete } = K, nom = this.nom(), p = game.player, pe = p.eyePos();
    const tr = this.phrase('rhua tin');
    cine.jouer([
      { dur: 3.6, de: { pos: L(0, 2.3, -6.6), look: tete }, a: { pos: L(0, 2.0, -5.6), look: tete }, texte: 'À la grande bibliothèque, le registre est ouvert à votre nom.', debut: () => { n.hunting = false; this.tenir(n, sp); sound.page && sound.page(); }, chaque: () => this.tenir(n, sp) },
      { dur: 3.2, de: { pos: L(1.4, 1.8, -4.8), look: tete }, a: { pos: L(1.0, 1.8, -4.4), look: tete }, texte: '« Jour dit. Heure dite. »', qui: nom, debut: () => { sound.bell && sound.bell(0.5); }, chaque: () => this.tenir(n, sp) },
      { dur: 4.2, orbite: { c: [sp.x, sp.y + 1.6, sp.z], r: 3.3, h: 0.25, a0: K.f.r + Math.PI - 0.7, a1: K.f.r + Math.PI + 0.35 }, secousse: 0.025, texte: 'Les chandelles s’éteignent une à une. Quelque chose se déplie sous la redingote noire.',
        debut: () => { n.hunting = true; this.cineE = { x: sp.x, y: sp.y, z: sp.z, heading: sp.r, rise: 0 }; sound.glitchSnd && sound.glitchSnd(0.8); sound.rumble && sound.rumble(); this.noirCine = 1; },
        chaque: (t) => { if (this.cineE) this.cineE.rise = Math.min(0.9, t * 0.28); } },
      { dur: 3.4, de: { pos: L(0, 0.7, -5.4), look: [sp.x, sp.y + 2.7, sp.z] }, texte: '« Rhua tin. »' + (tr ? ' (' + tr + '.)' : ''), qui: '???', debut: () => { sound.whisper && sound.whisper(0, 1.5); if (this.cineE) this.cineE.rise = 0.9; } },
      { dur: 3.2, fondu: 'noir', de: { pos: pe, yaw: p.yaw, pitch: p.pitch }, texte: '(On vous cherche.)', fin: () => { this.cineE = null; this.noirCine = 0; } },
    ], { apres: () => { this.cineE = null; this.noirCine = 0; n.hunting = true; this.debutTraque(); } });
  },
  debutTraque() {
    const B = this.S();
    if (!B.traque) return;
    this.E = { st: 'absent', next: 14 + Math.random() * 8, x: 0, y: 0, z: 0, heading: 0, t: 0, cast: 0, castCd: 3, blinkCd: 8, seance: 0, bordT: 0 };
    if (!B.traque.maudit) {
      B.traque.maudit = 1;
      if (typeof malediction !== 'undefined' && malediction.frapper) try { malediction.frapper('livre', 'Un livre de la grande bibliothèque, gardé au-delà du jour dit'); } catch (e) { console.error(e); }
    }
    ui.subtitle('', '(Il faut rapporter ce livre. Vite.)', 4);
  },
  finTraque() {
    const B = this.S(), n = this.libraire();
    B.traque = null; this.E = null; this.bolts = []; this.noirT = 0; this.cineE = null;
    if (n) { n.hunting = false; n.goal = null; }
  },
  calmer() {
    const B = this.S(), s = farm.s, TQ = B.traque, n = this.libraire(), K = this.cadre();
    if (!TQ || !K) return;
    const dus = B.prets.filter((p) => TQ.ids.includes(p.id));
    for (const P of dus) { farm.take(P.id, 1); B.hist.push({ id: P.id, du: P.du, rendu: s.day, retard: true }); }
    B.prets = B.prets.filter((p) => !TQ.ids.includes(p.id));
    B.perdu = { j: s.day, titre: dus.map((p) => p.titre).join(', ') };
    this.E = null; this.bolts = []; this.noirT = 0;
    const { L, sp, tete } = K, nom = this.nom(), p = game.player, pe = p.eyePos();
    const fini = () => { this.cineE = null; B.traque = null; B.banni = B.banni || s.day; if (n) { n.hunting = false; this.tenir(n, sp); n.goal = null; } if (typeof malediction !== 'undefined' && malediction.lever) try { malediction.lever('livre'); } catch (e) { console.error(e); } };
    cine.jouer([
      { dur: 3.2, de: { pos: [pe[0] - Math.sin(p.yaw) * -1.8, pe[1] + 0.5, pe[2] - Math.cos(p.yaw) * -1.8], look: tete }, joueur: true, debut: () => { sound.page && sound.page(); sound.silence && sound.silence(5); } },
      { dur: 3.4, de: { pos: L(0.6, 1.9, -5.4), look: [sp.x, sp.y + 2.4, sp.z] }, texte: '« Rendu. »', qui: '???', debut: () => { if (n) n.hunting = true; this.cineE = { x: sp.x, y: sp.y, z: sp.z, heading: sp.r, rise: 0.9 }; sound.glitchSnd && sound.glitchSnd(0.6); } },
      { dur: 3.8, de: { pos: L(0.9, 1.8, -5.0), look: tete }, a: { pos: L(0.6, 1.8, -4.6), look: tete }, texte: '« Le livre est rendu. Vous, vous ne l’êtes pas. »', qui: nom,
        chaque: (t) => { if (this.cineE) { this.cineE.rise = Math.max(0, 0.9 - t * 0.6); if (t > 1.6) { this.cineE = null; if (n) { n.hunting = false; this.tenir(n, sp); } } } else if (n) this.tenir(n, sp); } },
      { dur: 3.6, de: { pos: L(0.3, 1.75, -4.4), look: tete }, texte: '« Ne revenez jamais. La bibliothèque vous est fermée. »', qui: nom, chaque: () => { if (n) this.tenir(n, sp); }, fin: fini },
    ], { passer: false, apres: () => fini() });
  },
  // ------------------------------------------------------------ le sorcier
  rig() {
    if (this._rig) return this._rig;
    const base = humanRig(SORCIER_LOOK), H = 0.27, hy = H * 0.52;
    const oeil = (s) => ({ name: 'oeil' + s, parent: 'head', p: [s * 0.058, hy + 0.025, H / 2 + 0.012], s: [0.055, 0.024, 0.02], col: [1.7, 0.85, 0.3], tex: TL.glass, fl: FX_EMIT });
    this._rig = rigPlus(base, [oeil(-1), oeil(1)]);
    this._rig.look = SORCIER_LOOK;
    return this._rig;
  },
  saint(pos) {
    const lm = game.world.lm;
    for (const [k, r] of BIBLIO.saints) { const L = lm[k]; if (L && Math.hypot(pos[0] - L.x, pos[2] - L.z) < r) return { x: L.x, z: L.z, r }; }
    return null;
  },
  sol(x, z) {
    const w = game.world, p = game.player;
    if (p.underground || p.pos[1] < w.heightAt(p.pos[0], p.pos[2]) - 2.5) return p.pos[1];
    return Math.max(w.heightAt(x, z), w.waterLevel);
  },
  bouffee(x, y, z) {
    for (let i = 0; i < 18; i++) particles.spawn(x + (Math.random() - 0.5) * 0.8, y + Math.random() * 2, z + (Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 1.5, Math.random() * 1.2, (Math.random() - 0.5) * 1.5, [0.08, 0.06, 0.1, 1], 0.09 + Math.random() * 0.08, 0.9 + Math.random() * 0.8, -0.3, false);
    for (let i = 0; i < 6; i++) particles.spawn(x + (Math.random() - 0.5), y + 0.5 + Math.random() * 1.5, z + (Math.random() - 0.5), (Math.random() - 0.5) * 2, Math.random() * 2, (Math.random() - 0.5) * 2, [0.92, 0.88, 0.76, 1], 0.06, 1.4, 1.5, false);
  },
  apparaitre(nuit) {
    const E = this.E, p = game.player, w = game.world;
    const under = p.underground || p.pos[1] < w.heightAt(p.pos[0], p.pos[2]) - 2.5;
    for (let k = 0; k < 24; k++) {
      const a = p.yaw + (Math.random() - 0.5) * 2.6, r = under ? 8 + Math.random() * 5 : 20 + Math.random() * 10;
      const x = p.pos[0] + Math.sin(a) * r, z = p.pos[2] + Math.cos(a) * r;
      if (!w.inside(x, z, 8) || this.saint([x, 0, z])) continue;
      E.x = x; E.z = z; E.y = this.sol(x, z) + 0.45;
      E.st = 'chasse'; E.seance = nuit ? 45 + Math.random() * 15 : 30 + Math.random() * 12; E.castCd = 3 + Math.random() * 2; E.blinkCd = 7; E.bordT = 0; E.vient = 0.8; E.lumDit = false;
      this.bouffee(x, E.y, z);
      sound.glitchSnd && sound.glitchSnd(0.6); sound.page && sound.page();
      const pan = clamp((x - p.pos[0]) * Math.cos(p.yaw) - (z - p.pos[2]) * Math.sin(p.yaw), -1, 1);
      sound.whisper && sound.whisper(pan, 1.2);
      ui.subtitle('', pick(['(Une odeur de vieux papier.)', '(Des pages qui tournent, derrière vous.)']), 3);
      return true;
    }
    E.next = 3;
    return false;
  },
  disparaitre(nuit, texte) {
    const E = this.E;
    this.bouffee(E.x, E.y, E.z);
    E.st = 'absent'; E.next = nuit ? 30 + Math.random() * 25 : 60 + Math.random() * 50;
    sound.page && sound.page();
    if (texte) ui.subtitle('', texte, 4);
  },
  traquer(dt, sky, playing) {
    if (cine.on) return; // (les cinématiques montrent elles-mêmes le bibliothécaire, ou le sorcier)
    const p = game.player, w = game.world, n = this.libraire();
    if (n) n.hunting = true;
    if (!this.E) this.E = { st: 'absent', next: 25, x: 0, y: 0, z: 0, heading: 0, t: 0, cast: 0, castCd: 3, blinkCd: 8, seance: 0, bordT: 0 };
    const E = this.E;
    if (!playing || cine.on || game.sleeping || game.dying || strange.inEnvers() || game.mode !== 'play') return;
    const nuit = !!sky && sky.night > 0.5;
    E.t += dt;
    if (E.st === 'absent') { E.next -= dt; if (E.next <= 0) { if (this.saint(p.pos)) E.next = 4; else this.apparaitre(nuit); } return; }
    E.vient = Math.max(0, (E.vient || 0) - dt);
    const dx = p.pos[0] - E.x, dz = p.pos[2] - E.z, d = Math.hypot(dx, dz) || 0.01;
    E.heading = turnToward(E.heading, Math.atan2(dx, dz), dt * 5);
    const lum = !!(game.lantern && farm.count('lanterne'));
    const minD = lum ? 6 : 0;
    let sp = (nuit ? 4.9 : 3.5) * (E.cast > 0 ? 0.35 : 1);
    // se déplacer (il flotte, il traverse tout) ; il n'entre pas en terre bénite
    if (d > minD + 0.15) {
      const st = Math.min(sp * dt, d - minD);
      const nx = E.x + dx / d * st, nz = E.z + dz / d * st;
      if (this.saint([nx, 0, nz])) {
        E.bordT += dt;
        if (E.bordT > 6) { this.disparaitre(nuit); return; }
      } else { E.x = nx; E.z = nz; }
    } else if (lum && d < minD - 0.3) { E.x -= dx / d * dt * 1.5; E.z -= dz / d * dt * 1.5; }
    const yT = this.sol(E.x, E.z) + 0.45 + Math.sin(E.t * 1.7) * 0.12;
    E.y += (yT - E.y) * Math.min(1, dt * 3);
    // il saute d'un point à l'autre quand on le distance
    E.blinkCd -= dt;
    if (d > 22 && E.blinkCd <= 0) {
      for (let k = 0; k < 10; k++) {
        const a = p.yaw + Math.PI + (Math.random() - 0.5) * 2.0, r = 11 + Math.random() * 4;
        const x = p.pos[0] + Math.sin(a) * r, z = p.pos[2] + Math.cos(a) * r;
        if (!w.inside(x, z, 6) || this.saint([x, 0, z])) continue;
        this.bouffee(E.x, E.y, E.z);
        E.x = x; E.z = z; E.y = this.sol(x, z) + 0.45; E.vient = 0.5;
        this.bouffee(x, E.y, z);
        sound.glitchSnd && sound.glitchSnd(0.5);
        break;
      }
      E.blinkCd = nuit ? 6 + Math.random() * 3 : 9 + Math.random() * 4;
    }
    // la peur
    strange.fear = Math.max(strange.fear || 0, clamp(1 - d / 34, 0.25, 0.95));
    this.voixT -= dt;
    if (this.voixT <= 0) { this.voixT = 2.5 + Math.random() * 2.5; const pan = clamp(-dx / d * Math.cos(p.yaw) + dz / d * Math.sin(p.yaw), -1, 1); sound.whisper && sound.whisper(pan, clamp(1.4 - d / 30, 0.2, 1.4)); }
    // les sorts
    if (E.cast > 0) {
      E.cast -= dt;
      if (E.cast <= 0) this.lancer(E.sort, nuit);
    } else {
      E.castCd -= dt;
      if (E.castCd <= 0 && d < 30 && d > 2.5) {
        const r = Math.random();
        E.sort = r < 0.45 ? 'trait' : r < 0.72 && this.noirT <= 0 ? 'tenebres' : 'murmures';
        E.cast = 0.9;
        E.castCd = ((nuit ? 4 : 5.5) + Math.random() * 3) * (lum ? 0.75 : 1);
        sound.whisper && sound.whisper(0, 1);
      }
    }
    // la séance se termine ; en terre bénite, il se lasse plus vite
    E.seance -= dt * (this.saint(p.pos) ? 3 : 1);
    if (E.seance <= 0) { this.disparaitre(nuit); return; }
    // le contact : la mort
    if (d < 1.15 && Math.abs(p.pos[1] - (E.y - 0.45)) < 2.6 && !lum) {
      sound.scream && sound.scream(0.6); game.shakeT = 1;
      play.hurt(999, { x: E.x, z: E.z }, 'Emporté par le bibliothécaire de la grande bibliothèque, pour un livre rendu trop tard');
      if (!game.dying) this.disparaitre(nuit);
    }
  },
  lancer(sort, nuit) {
    const E = this.E, p = game.player;
    if (!E || E.st !== 'chasse') return;
    if (sort === 'trait') {
      const hx = E.x + Math.sin(E.heading) * 0.5, hz = E.z + Math.cos(E.heading) * 0.5, hy = E.y + 1.35;
      const tx = p.pos[0] - hx, ty = p.pos[1] + 1.1 - hy, tz = p.pos[2] - hz, L = Math.hypot(tx, ty, tz) || 1, v = nuit ? 11 : 9.5;
      this.bolts.push({ x: hx, y: hy, z: hz, vx: tx / L * v, vy: ty / L * v, vz: tz / L * v, v, t: 0 });
      sound.glitchSnd && sound.glitchSnd(0.4);
    } else if (sort === 'tenebres') {
      this.noirT = 7;
      if (game.lantern && Math.random() < 0.5) { game.lantern = false; sound.click && sound.click(); }
      sound.silence && sound.silence(6);
    } else {
      const ph = pick(BIBLIO.phrases), tr = typeof langues !== 'undefined' ? langues.traduire('aelin', ph) : ph;
      for (let i = 0; i < 3; i++) setTimeout(() => sound.whisper && sound.whisper((Math.random() - 0.5) * 2, 1.5), i * 380);
      ui.subtitle('???', '« ' + tr + ' »', 3.5);
      strange.fear = Math.max(strange.fear || 0, 0.9);
      game.shakeT = Math.max(game.shakeT || 0, 0.25);
    }
  },
  majTraits(dt, playing) {
    if (!this.bolts.length) return;
    if (!playing || cine.on) return;
    const p = game.player, w = game.world;
    for (let i = this.bolts.length - 1; i >= 0; i--) {
      const b = this.bolts[i];
      b.t += dt;
      const tx = p.pos[0] - b.x, ty = p.pos[1] + 1.1 - b.y, tz = p.pos[2] - b.z, d = Math.hypot(tx, ty, tz) || 1;
      const k = Math.min(1, dt * 1.4);
      b.vx += (tx / d * b.v - b.vx) * k; b.vy += (ty / d * b.v - b.vy) * k; b.vz += (tz / d * b.v - b.vz) * k;
      const vl = Math.hypot(b.vx, b.vy, b.vz) || 1;
      b.vx *= b.v / vl; b.vy *= b.v / vl; b.vz *= b.v / vl;
      b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
      if (Math.random() < 0.7) particles.spawn(b.x, b.y, b.z, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, [0.5, 0.25, 0.8, 1], 0.06, 0.5, 0, true);
      if (d < 0.8) {
        this.bolts.splice(i, 1);
        game.shakeT = 0.4;
        play.hurt(18, { x: b.x - b.vx, z: b.z - b.vz }, 'Frappé par un sort, dans l’ombre du bibliothécaire');
        continue;
      }
      const g = p.underground ? -1e9 : w.heightAt(b.x, b.z);
      if (b.t > 5 || b.y < g) { puffAt(b.x, b.y, b.z, [60, 30, 90], 8, 1.2, false); this.bolts.splice(i, 1); }
    }
  },
  update(dt, eye, basis, sky, playing) {
    if (!farm.s || !game.world || game.kind !== 'farm') return;
    this.chkT -= dt;
    if (this.chkT <= 0) { this.chkT = 1; try { this.verifier(playing); } catch (e) { console.error(e); } }
    const B = this.S();
    if (B.traque) this.traquer(dt, sky, playing);
    else if (this.E) this.E = null;
    this.majTraits(dt, playing);
    if (this.noirT > 0 && playing) this.noirT = Math.max(0, this.noirT - dt);
  },
  // ------------------------------------------------------------ le carnet
  lignesCarnet() {
    const B = this.S(), s = farm.s, out = [];
    if (B.traque) { const t = B.prets.filter((p) => B.traque.ids.includes(p.id)).map((p) => '« ' + p.titre + ' »').join(', '); out.push(`<div class="q actif"><b>Le bibliothécaire vous cherche</b><div>${esc(`Rapporter ${t} au comptoir de la grande bibliothèque. La lumière d’une lanterne le tient à distance ; il n’entre pas en terre bénite.`)}</div></div>`); }
    for (const P of B.prets) if (!(B.traque && B.traque.ids.includes(P.id))) out.push(`<div class="q actif"><b>${esc(`Emprunt : « ${P.titre} »`)}</b><div>${esc(`À rendre à la grande bibliothèque ${this.dateTexte(P.due)} (${this.reste(P.due)}).`)}</div></div>`);
    return out;
  },
  style() {
    if (this.styled) return;
    this.styled = true;
    const st = document.createElement('style');
    st.textContent = `#biblio{height:min(640px,calc(100vh - 10vh))}
#biblio .body{flex:1}
#biblio .bb-tete{font-style:italic;color:#5a4a36;font-size:14.5px;margin:4px 0 6px}
#biblio .bb-row{display:flex;align-items:center;gap:9px;padding:6px 8px;margin-bottom:4px;background:rgba(255,255,255,.3);border:1px solid rgba(90,70,40,.22);border-radius:4px}
#biblio .bb-row img{width:32px;height:32px;image-rendering:pixelated;flex:none}
#biblio .bb-t{flex:1;display:flex;flex-direction:column;font-size:14px;min-width:0}
#biblio .bb-t span{font-size:12.5px;font-style:italic;color:#6a5436}
#biblio .bb-t .bb-retard{color:#9a2a1a;font-weight:bold}
#biblio .bb-t .bb-pris{color:#3a6a2a}
#biblio .bb-b{display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end}
#biblio .bb-b button{padding:4px 9px;background:#8a5a2a;color:#f4ead2;border:none;border-radius:3px;font-size:13px;cursor:pointer}
#biblio .bb-b button:disabled{background:#a89878;cursor:default}
#biblio .bb-h{font-size:13px;color:#5a4a36;padding:2px 0}
#reader .bb-sceau{display:flex;align-items:center;gap:12px;justify-content:center;margin:8px 0}
#reader .bb-sceau img{height:90px;border-radius:50%;box-shadow:0 0 0 3px #9a9aa0,0 2px 6px rgba(0,0,0,.4)}
#reader .bb-sceau span{font-style:italic;color:#4a3a28}
#reader .bb-opts{display:flex;flex-direction:column;gap:6px;align-items:center;margin-top:12px}
#reader .deplier{background:#8a5a2a;color:#f4ead2;border:none;border-radius:3px;padding:6px 14px;font:14px Georgia,serif;cursor:pointer}`;
    document.head.appendChild(st);
  },
};

// ---------------------------------------------------------------- les livres qui ne sont pas des objets
livres.speciaux.lecteurs_perdus = {
  titre: 'Lecteurs perdus', auteur: 'registre de la grande bibliothèque', col: '#141418',
  pages() {
    const rnd = mulberry32(((farm.s && farm.s.seed) || 1) * 53 + 11);
    const P = ['Jean', 'Pierre', 'Marie', 'Anne', 'Étienne', 'Madeleine', 'Joseph', 'Catherine', 'Louis', 'Jeanne', 'Claude', 'Françoise'];
    const N = ['Morel', 'Guérin', 'Bastien', 'Roux', 'Mauduit', 'Perrin', 'Garnier', 'Lefèvre', 'Vasseur', 'Chabert'];
    const TITRES = ['Des langues d’avant', 'Chroniques de la vallée', 'Atlas ancien', 'Traité des malédictions', 'Les Trois', 'Contes de la veillée', 'Du temple sous la montagne'];
    const lignes = [];
    let an = 1702;
    for (let k = 0; k < 11; k++) {
      an += 6 + Math.floor(rnd() * 16);
      const nom = P[(rnd() * P.length) | 0] + ' ' + N[(rnd() * N.length) | 0];
      lignes.push(`${an} — ${nom}. « ${TITRES[(rnd() * TITRES.length) | 0]} ». ${rnd() < 0.3 ? 'Rendu tard. Épargné.' : 'Non rendu.'}`);
    }
    const B = farm.s ? biblio.S() : {}, prenom = (farm.s && farm.s.prenom) || (farm.s && farm.s.fem ? 'Jeanne' : 'Jean');
    const fin = [];
    fin.push('Et un lecteur qui ne rendait jamais ses livres. On ne l’a pas inscrit. On n’en a pas eu besoin.');
    if (B.perdu) fin.push(`Jour ${B.perdu.j} — ${prenom}, de la vieille ferme. « ${B.perdu.titre} ». Rendu tard. Épargné.`);
    else if (B.traque) fin.push(`Jour ${B.traque.jour} — ${prenom}, de la vieille ferme. L’encre est fraîche. Il n’y a rien d’écrit après.`);
    return [
      { titre: 'Au dos de la couverture', texte: 'On n’efface pas un lecteur. On le range.\n\nCeux qui sont inscrits ici n’ont pas rendu ce qu’on leur avait prêté, au jour dit. Leur ligne est tracée d’une autre encre, plus noire, et qui ne sèche jamais tout à fait.' },
      { titre: 'Registre', texte: lignes.slice(0, 6).join('\n') },
      { titre: 'Registre', texte: lignes.slice(6).concat(fin).join('\n') },
    ];
  },
};
livres.speciaux.registre_archives = {
  titre: 'Registre des archives', auteur: 'tenu par les bibliothécaires successifs', col: '#2a2420', secret: 'registre',
  pages() {
    return [
      { titre: 'Registre des prêts, 1702–1790', texte: '1703 — Frère Évrard, de Montrevel. « Des langues d’avant ». Rendu.\n1711 — Le curé de la ville. « Traité des malédictions ». Rendu, avec des pages cornées.\n1742 — Un marchand de passage. « Atlas ancien ». Non rendu.\n1742 — (même main, plus tard) Rendu. Par nous. Le marchand n’avait plus besoin de cartes.\n1771 — J. Morel. « Vocabulaire des géants ». Rendu, et des feuillets en plus, recopiés d’une pierre du plateau.' },
      { titre: 'Ce que gardent les archives', texte: 'Pour ceux d’en bas : la falaise fendue, au bord de la Combe. Ils n’ouvrent qu’à leur propre façon de frapper. Leur apporter du pain.\n\nPour le temple : derrière l’eau qui tombe, là où la rivière sort de la montagne. Les trois pierres de la porte ne s’éveillent pas dans n’importe quel ordre ; qui se trompe, la voûte le lui rappelle.\n\nPour les géants : ne pas les regarder dans les yeux. Ils n’aiment pas qu’on les dérange pour rien, et pour eux, presque tout est rien.' },
      { titre: 'Une note, d’une main plus récente', texte: 'Je garde. Avant moi, un autre gardait ; avant lui, un autre. Les Aëlim avaient un mot pour cela : « rimen na-tinim », le gardien des livres. Ils disaient aussi que les livres des Aëlim, sous la pierre, gardent les secrets, et que le gardien garde les livres.\n\nUn livre qui ne revient pas est une porte laissée ouverte. Il faut aller la refermer, où qu’elle soit, et quoi qu’il en coûte à celui qui la tient.' },
    ];
  },
};

// ---------------------------------------------------------------- accroches : lieux de la bibliothèque
HOOKS.inter.biblio = () => biblio.comptoir();
HOOKS.inter.biblio_rayon = () => biblio.rayons();
HOOKS.inter.biblio_vitrine = () => biblio.vitrine();
HOOKS.inter.biblio_secret = (it) => biblio.secret(it);
HOOKS.inter.archives_livre = () => livres.ouvrir('registre_archives');
HOOKS.update.push((dt, eye, basis, sky, playing) => biblio.update(dt, eye, basis, sky, playing));
// la bibliothèque ouvre ses portes le jour, tant que son bibliothécaire est en vie
SHOP_DOORS.add('bibliotheque');

// ---------------------------------------------------------------- le sorcier : dessin, lumière, ténèbres
HOOKS.draw.push((buf, sbuf, cam, t) => {
  const B = farm.s ? biblio.S() : null;
  const C = biblio.cineE;
  const E = B && B.traque && biblio.E && biblio.E.st === 'chasse' ? biblio.E : null;
  if (C && cine.on) {
    const r = biblio.rig();
    poseHuman(r, { move: 0, t, lookY: 0, reach: C.rise > 0.6 ? 0.6 : 0, pale: true });
    drawRig(buf, r, C.x, C.y + C.rise + Math.sin(t * 1.7) * 0.05 * C.rise, C.z, C.heading, 1, 0);
    if (sbuf) drawShadow(sbuf, C.x, C.y, C.z, 0.36);
  }
  if (E && !(E.vient > 0 && ((t * 24) | 0) % 2)) {
    const r = biblio.rig();
    poseHuman(r, { move: 0.3, phase: t * 2.2, t, lookY: 0, reach: E.cast > 0 ? 1 : 0, pale: !(E.cast > 0), lean: 0.18 });
    drawRig(buf, r, E.x, E.y, E.z, E.heading, 1, 0);
    if (sbuf) drawShadow(sbuf, E.x, biblio.sol(E.x, E.z), E.z, 0.4);
  }
  if (biblio.bolts.length) {
    PE.buf = buf; PE.fl = FX_EMIT;
    for (const b of biblio.bolts) { PE.frame(b.x, b.y, b.z, t * 3, 1); PE.box(0, 0, 0, 0.26, 0.26, 0.26, [0.55, 0.3, 0.95], TL.glass, t * 5, t * 4); PE.box(0, 0, 0, 0.16, 0.16, 0.16, [1.2, 1.0, 1.4], TL.glass, -t * 6, 0.4); }
    PE.fl = 0;
  }
});
HOOKS.lights.push((eye) => {
  const L = [], B = farm.s && biblio.S();
  const E = B && B.traque && biblio.E && biblio.E.st === 'chasse' ? biblio.E : biblio.cineE && cine.on ? Object.assign({}, biblio.cineE, { y: biblio.cineE.y + biblio.cineE.rise }) : null;
  if (E) L.push({ x: E.x, y: E.y + 2.0, z: E.z, r: 4.5, c: [0.45, 0.24, 0.62], d: Math.hypot(E.x - eye[0], E.y - eye[1], E.z - eye[2]) });
  for (const b of biblio.bolts) L.push({ x: b.x, y: b.y, z: b.z, r: 5, c: [0.7, 0.35, 1.0], d: Math.hypot(b.x - eye[0], b.y - eye[1], b.z - eye[2]) });
  return L;
});
HOOKS.sky.push((sky) => {
  const k = Math.max(biblio.noirT > 0 ? Math.min(1, biblio.noirT / 1.2, (7 - biblio.noirT) / 0.8) : 0, biblio.noirCine && cine.on ? 0.6 : 0);
  if (!(k > 0)) return;
  sky.amb = v3.scale(sky.amb, 1 - 0.88 * k);
  sky.sunCol = v3.scale(sky.sunCol, 1 - 0.9 * k);
  sky.moonCol = v3.scale(sky.moonCol, 1 - 0.9 * k);
  sky.fog = [sky.fog[0] * (1 - 0.9 * k), lerp(sky.fog[1], 14, k)];
});
HOOKS.fx.push((fx) => {
  if (biblio.noirT > 0) fx[0] = Math.max(fx[0], 0.55 * Math.min(1, biblio.noirT / 1.2));
});

// ---------------------------------------------------------------- dialogues : le bibliothécaire
{
  const _open = talk.open.bind(talk);
  talk.open = function (n) {
    const v = _open(n);
    try { if (v && n && n.id === 'libraire' && biblio.banni() && !npcs.murdererKnown()) { v.text = pick(['« Nous sommes fermés. Pour vous, nous le serons toujours. »', '« Vous n’êtes plus lecteur ici. »', '« Je n’ai rien à vous prêter. Plus jamais. »']); } } catch (e) { console.error(e); }
    return v;
  };
  const _options = talk.options.bind(talk);
  talk.options = function () {
    let opts = _options();
    try {
      const n = this.n;
      if (n && n.id === 'libraire' && farm.s && !npcs.murdererKnown()) {
        if (biblio.banni()) opts = opts.filter((o) => !['shop', 'offer'].includes(o.act) && !String(o.act).startsWith('lg:'));
        else {
          const extra = biblio.present() === 'la' ? [{ label: 'Emprunter ou rendre un livre', act: 'bb:comptoir' }] : [];
          if (biblio.confiance() && !biblio.S().passage) extra.push({ label: 'Gardez-vous d’autres livres, ailleurs ?', act: 'bb:confiance' });
          const i = opts.findIndex((o) => o.act === 'bye');
          opts.splice(i >= 0 ? i : opts.length, 0, ...extra);
        }
      }
    } catch (e) { console.error(e); }
    return opts;
  };
  const _choose = talk.choose.bind(talk);
  talk.choose = function (act) {
    if (act === 'bb:comptoir') { biblio.comptoir(); return 'keep'; }
    if (act === 'bb:confiance') {
      biblio.S().passage = farm.s.day;
      npcs.addAmitie(this.n, 10);
      return this.view('Vous rendez à l’heure. Toujours. C’est plus rare que vous ne croyez. Alors… Au fond, le dernier rayonnage : tirez le registre noir. Les archives sont en dessous. Ne dérangez rien, et remontez avant la nuit.', this.options());
    }
    return _choose(act);
  };
}

// ---------------------------------------------------------------- chargement, mort, sommeil
HOOKS.load.push((saved) => {
  biblio.E = null; biblio.bolts = []; biblio.noirT = 0; biblio.cineE = null; biblio.noirCine = 0; biblio.chkT = 2;
  if (!farm.s) return;
  const B = biblio.S(), n = biblio.libraire();
  if (B.traque && n && n.st.alive) { n.hunting = true; biblio.E = { st: 'absent', next: 25 + Math.random() * 10, x: 0, y: 0, z: 0, heading: 0, t: 0, cast: 0, castCd: 3, blinkCd: 8, seance: 0, bordT: 0 }; }
  if (!game._biblioSom) {
    game._biblioSom = true;
    const _ts = game.trySleep.bind(game);
    game.trySleep = function (where) {
      if (farm.s && biblio.S().traque) { ui.subtitle('', '(Impossible de dormir. Quelqu’un tourne des pages, tout près.)', 3.5); sound.page && sound.page(); return; }
      return _ts(where);
    };
  }
});
HOOKS.death.push(() => { biblio.bolts = []; biblio.noirT = 0; return false; });
