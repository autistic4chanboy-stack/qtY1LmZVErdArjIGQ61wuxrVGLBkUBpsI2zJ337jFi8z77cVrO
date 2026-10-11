// ============================================================================
//  LE GRAND HÔTEL DES CIMES (agent L18) — 3. LE SERVICE À LA LOGE
//  - On se fait engager par M. Brissac (le directeur) : la mansarde du dernier
//    étage, les clefs croisées de Gaspard, le titre de concierge stagiaire.
//  - Un service par jour, pris à la loge entre 7 h et 19 h ; il dure cinq heures.
//    Les clients viennent à la loge, l'un après l'autre (à peu près toutes les
//    trois quarts d'heure) : on accepte (la demande devient une commission), ou
//    on s'excuse. Dix sortes de demandes : monter des bagages, porter un pli,
//    chercher à la cave, une commission dans la vallée (jusqu'au lendemain soir),
//    faire atteler, retrouver un objet perdu, apaiser une querelle, garder un
//    secret, arranger un dîner, donner un conseil (de vrais lieux de la vallée).
//  - La paie : les gages du rang à la fin du service (la moitié si l'on part
//    avant l'heure), un pourboire par demande bien faite, plus fort avec la
//    réputation ; une demande oubliée coûte de la réputation. La réputation fait
//    monter en grade et venir de meilleurs clients, et ouvre les histoires.
//  - Les choses de l'hôtel : la loge, les portes des chambres, la cave, le lit de
//    la mansarde, les échelles de l'aile, le piano, le tableau des sonnettes, la
//    porte de l'aile Nord (fermée à clé).
// ============================================================================
const hotelService = {
  // ------------------------------------------------------------- la loge
  loge() {
    const S = hotel18.S(), h = hotel18.heure();
    if (!S.embauche) {
      ui.choice('La loge du concierge', 'Le comptoir d’acajou, le casier aux clés, le registre ouvert. Personne derrière : Gaspard fait l’intérim, quand il ne dort pas. « Le directeur cherche quelqu’un, vous savez. Son bureau est au fond du hall, à droite. »', [{ label: 'S’en aller', fn: () => ui.close() }]);
      return;
    }
    const opts = [];
    const sv = S.service;
    const ici = S.demandes.filter((d) => d.etat === 'attend');
    for (const d of ici) opts.push({ label: 'Écouter ' + this.nomClient(d.client), fn: () => this.ecouter(d) });
    // remettre ce qu'on rapporte (cave, vallée, objet perdu)
    for (const c of S.commissions.filter((q) => q.etat === 'accepte' && this.remettable(q))) opts.push({ label: 'Remettre ' + this.objetDe(c) + ' pour ' + this.nomClient(c.client), fn: () => { ui.close(); this.reussir(c, true); } });
    if (sv && sv.jour === farm.s.day && !sv.fini) {
      opts.push({ label: 'Rendre son service', fn: () => { ui.close(); this.finir(true); } });
    } else if (!sv || sv.jour !== farm.s.day) {
      if (h >= L18_REGL.service.debut && h < L18_REGL.service.fin) opts.push({ label: 'Prendre son service (cinq heures)', fn: () => { ui.close(); this.prendre(); } });
    }
    opts.push({ label: 'S’en aller', fn: () => ui.close() });
    const R = hotel18.rang(), comm = S.commissions.filter((q) => q.etat === 'accepte').length;
    let desc;
    if (sv && sv.jour === farm.s.day && !sv.fini) desc = `En service jusqu’à ${this.hFmt(sv.finH)}. ${ici.length ? 'Quelqu’un attend devant la loge.' : 'Personne pour l’instant ; le registre, le casier, les sonnettes.'}${comm ? ` ${comm} commission${comm > 1 ? 's' : ''} en cours.` : ''}`;
    else if (sv && sv.jour === farm.s.day) desc = `Votre service est fini pour aujourd’hui. Gaspard reprendra la loge à la nuit.${comm ? ` Il vous reste ${comm} commission${comm > 1 ? 's' : ''}.` : ''}`;
    else if (h < L18_REGL.service.debut || h >= L18_REGL.service.fin) desc = 'La loge de nuit est à Gaspard. Le service de jour se prend entre sept heures et sept heures du soir.';
    else desc = `Vous êtes ${R.nom}. Les clés pendent au casier ; les clients attendent qu’on soit là.`;
    ui.choice('La loge du concierge', desc, opts);
  },
  hFmt(H) { const h = ((H % 24) + 24) % 24; return `${Math.floor(h)} h${h % 1 > 0.01 ? ' ' + String(Math.round((h % 1) * 60)).padStart(2, '0') : ''}`; },
  nomClient(id) { const g = hotelGens.par[id]; if (g) return g.def.nom; const C = L18_CLIENTS.find((c) => c.id === id); return C ? C.nom : (L18_GENS[id] && L18_GENS[id].nom) || 'un client'; },
  // ------------------------------------------------------------- prendre, finir son service
  prendre() {
    const S = hotel18.S(), s = farm.s, h = hotel18.heure();
    hotelGens.clientsDuJour();
    S.service = { jour: s.day, debut: s.hours, finH: Math.min(23.5, h + L18_REGL.service.duree), fin: s.hours + L18_REGL.service.duree, prochaine: s.hours + L18_REGL.demande.premier, n: 0, gains: 0, faites: 0, fini: false };
    S.stats.services++;
    hotel18.dire('Gaspard', pick(['La loge est à vous. Je vais dormir, ou faire semblant.', 'Bon service. Souriez : c’est gratuit et ça rapporte.', 'Les clés, le registre, les sonnettes. Et les clients : ce sont eux qui sonnent.']), 4);
  },
  finir(tot) {
    const S = hotel18.S(), sv = S.service;
    if (!sv || sv.fini) return;
    sv.fini = true;
    const R = hotel18.rang(), entier = !tot || farm.s.hours >= sv.fin - 0.05;
    const gage = Math.round(R.gage * (entier ? 1 : L18_REGL.demiGage));
    farm.earn(gage); S.stats.gages += gage; sv.gains += gage;
    // ceux qui attendaient s'en vont
    for (const d of S.demandes) if (d.etat === 'attend') d.etat = 'parti';
    S.demandes = S.demandes.filter((d) => d.etat === 'attend');
    try { sound.coin && sound.coin(); } catch (e) { /* */ }
    hotel18.dire('M. Brissac', entier ? `Votre service est terminé. ${gage} pièces de gages ; ${sv.gains - gage} de pourboires. ${sv.faites ? 'Les clients sont contents.' : 'Demain, tâchez d’en satisfaire un ou deux.'}` : `Vous partez avant l’heure ? La moitié des gages, alors : ${gage} pièces.`, 6);
    hotelHistoires.signal('service', { faites: sv.faites });
  },
  // ------------------------------------------------------------- les demandes : tirage
  tirer() {
    const S = hotel18.S(), s = farm.s, V = hotel18.V(), sv = S.service;
    const rnd = mulberry32(((s.seed | 0) * 7 + s.day * 104729 + sv.n * 7919 + 0x5E5) >>> 0);
    const pr = (a) => a[Math.floor(rnd() * a.length)];
    const clients = S.clients.L.map((c) => c.id).filter((id) => hotelGens.par[id]);
    if (!clients.length) return null;
    const client = pr(clients), C = L18_CLIENTS.find((c) => c.id === client), cl = S.clients.L.find((c) => c.id === client);
    const types = ['bagages', 'bagages', 'lettre', 'reserve', 'vallee', 'voiture', 'perdu', 'conseil', 'conseil', 'diner'];
    if (S.rep >= 15) types.push('dispute', 'secret');
    if (S.rep >= 40) types.push('vallee', 'diner', 'dispute');
    let type = pr(types);
    // pas deux fois la même sorte de suite
    if (sv.dernier === type) type = pr(types);
    sv.dernier = type;
    const D = L18_DEMANDES[type], fermees = Object.values(V.chambres).filter((c) => c.num && c.e <= 2), ch = (cl && cl.ch) || pr(fermees).num;
    const d = { id: 'd' + s.day + '_' + sv.n, type, client, ch, arrivee: s.hours, expire: s.hours + L18_REGL.demande.attente, etat: 'attend', niv: C ? C.niv : 0 };
    let t = pr(D.textes);
    if (type === 'vallee') { d.objet = pr(L18_VALLEE.filter((k) => ITEMS[k])); t = t.replace('{objet}', this.article(d.objet)); }
    if (type === 'reserve') { d.quoi = t.includes('bouteille') ? 'vin' : t.includes('draps') ? 'linge' : 'epicerie'; }
    if (type === 'perdu') { const P = pr(L18_PERDUS), O = pr(L18_OU); d.objetNom = P[0]; d.ou = O[0]; d.ouNom = O[1]; t = t.replace('{objet}', P[0]).replace('{lieu}', O[1]).replace('Mon une ', 'Ma ').replace('Mon un ', 'Mon '); }
    if (type === 'dispute') { const Q = pr(L18_QUERELLES), O = pr([['salon_lecture', 'au salon'], ['resto_11', 'à la salle à manger'], ['terrasse_d', 'sur la terrasse']]); d.querelle = L18_QUERELLES.indexOf(Q); d.ou = O[0]; t = t.replace('{lieu}', O[1]); }
    if (type === 'diner') { d.diner = Math.floor(rnd() * L18_DINERS.length); t = t.replace('{gout}', L18_DINERS[d.diner].gout); }
    if (type === 'secret') { d.secret = Math.floor(rnd() * L18_SECRETS.length); d.quand = s.hours + 0.6 + rnd() * 1.6; }
    if (type === 'conseil') {
      const G = L18_GOUTS[(C && C.gout) || 'eau'] || L18_GOUTS.eau, w = hotel18.monde();
      const bons = G.bons.filter((k) => w.lm[k]);
      const autres = Object.keys(L18_GOUTS).filter((k) => k !== ((C && C.gout) || 'eau')).flatMap((k) => L18_GOUTS[k].bons).filter((k) => w.lm[k] && !G.bons.includes(k));
      d.bon = pr(bons);
      const faux = [];
      for (let k = 0; k < 40 && faux.length < 2 && autres.length; k++) { const q = pr(autres); if (!faux.includes(q)) faux.push(q); }
      d.choix = [d.bon, ...faux];
      for (let i = d.choix.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [d.choix[i], d.choix[j]] = [d.choix[j], d.choix[i]]; }
      t = t.replace('{dit}', G.dit);
    }
    d.texte = t.replace('{ch}', ch);
    d.pourboire = Math.round((L18_REGL.pourboire[0] + rnd() * (L18_REGL.pourboire[1] - L18_REGL.pourboire[0])) * (1 + d.niv / 120));
    sv.n++;
    return d;
  },
  article(id) { const n = itemName(id); const l = n.toLowerCase(); return /^[aeéèêiîoôuh]/i.test(n) ? 'de l’' + l : (/s$/.test(n) ? 'des ' : 'du ') + l; },
  objetDe(c) {
    if (c.type === 'vallee') return itemName(c.objet).toLowerCase();
    if (c.type === 'reserve') return c.quoi === 'vin' ? 'la bouteille' : c.quoi === 'linge' ? 'les draps' : 'le pot';
    if (c.type === 'perdu') return c.objetNom;
    return 'ce qu’on vous a demandé';
  },
  // ------------------------------------------------------------- écouter un client à la loge
  ecouter(d) {
    const S = hotel18.S(), nom = this.nomClient(d.client), C = L18_CLIENTS.find((c) => c.id === d.client);
    if (d.type === 'conseil') {
      const w = hotel18.monde();
      ui.choice(nom, `« ${d.texte} »`, [
        ...d.choix.map((k) => ({ label: 'Conseiller ' + (LIEU_NAMES[k] || (w.lm[k] && w.lm[k].name) || k), fn: () => { ui.close(); d.etat = 'fait'; this.nettoyer(); const ok = k === d.bon || (L18_GOUTS[(C && C.gout) || 'eau'] || L18_GOUTS.eau).bons.includes(k); if (ok) this.reussir(Object.assign({}, d, { etat: 'accepte' })); else this.rater(d, '« Vous croyez ? Bon… J’irai voir. » (Il n’a pas l’air convaincu.)'); } })),
        { label: 'Avouer qu’on ne sait pas', fn: () => { ui.close(); d.etat = 'decline'; this.nettoyer(); hotel18.dire(nom, 'Un concierge qui ne sait pas… C’est au moins honnête.', 3.5); } },
      ]);
      return;
    }
    if (d.type === 'secret') {
      ui.choice(nom, `« ${d.texte} »`, [
        { label: '« Vous étiez dans votre chambre, monsieur. Je m’en souviens très bien. »', fn: () => { ui.close(); d.etat = 'accepte'; S.commissions.push(Object.assign({}, d, { etat: 'accepte' })); this.nettoyer(); hotel18.dire(nom, 'Je savais que je pouvais compter sur vous.', 3); } },
        { label: '« Je ne mens pas pour les clients. »', fn: () => { ui.close(); d.etat = 'decline'; this.nettoyer(); hotel18.dire(nom, 'Hm. Les principes. Comme c’est provincial.', 3); } },
      ]);
      return;
    }
    const D = L18_DEMANDES[d.type];
    ui.choice(nom + (C ? ' — ' + C.qui : ''), `« ${d.texte} »`, [
      { label: 'Accepter', fn: () => { ui.close(); this.accepter(d); } },
      { label: '« Je suis désolé : ce n’est pas possible aujourd’hui. »', fn: () => { ui.close(); d.etat = 'decline'; this.nettoyer(); hotel18.dire(nom, pick(['Tant pis.', 'Dommage. On m’avait dit grand bien de cette loge.', 'Ce n’est rien.']), 3); } },
    ]);
    void D;
  },
  accepter(d) {
    const S = hotel18.S(), sv = S.service;
    d.etat = 'accepte';
    const c = Object.assign({}, d, { etat: 'accepte', accepte: farm.s.hours });
    // l'échéance : la fin du service (et une heure), ou le lendemain soir pour la vallée
    c.echeance = d.type === 'vallee' ? farm.s.hours + L18_REGL.vallee : (sv ? sv.fin + 1 : farm.s.hours + 4);
    if (d.type === 'bagages') farm.give('l18_valise', 1);
    if (d.type === 'lettre') farm.give('l18_pli', 1);
    S.commissions.push(c);
    this.nettoyer();
    const nom = this.nomClient(d.client);
    const dit = {
      bagages: `(Vous prenez la valise. Chambre ${d.ch}.)`, lettre: `(Vous glissez le pli dans votre poche. Chambre ${d.ch}.)`, reserve: '(La cave : l’escalier est au fond de la cuisine.)',
      vallee: `(${itemName(d.objet)} : d’ici demain soir. À remettre à la loge.)`, voiture: '(La remise est au nord de la cour : Baptiste et sa voiture.)', perdu: `(${d.objetNom}, ${d.ouNom}.)`,
      dispute: '(On vous attend là-bas.)', diner: '(Le chef, en cuisine.)',
    }[d.type];
    if (dit) hotel18.dire('', dit, 4);
    void nom;
  },
  nettoyer() { const S = hotel18.S(); S.demandes = S.demandes.filter((q) => q.etat === 'attend'); },
  // ------------------------------------------------------------- réussir, rater
  reussir(c, aLaLoge) {
    const S = hotel18.S(), sv = S.service;
    if (c.type === 'vallee' && !farm.take(c.objet, 1)) return;
    if (c.type === 'reserve' && !farm.take(c.quoi === 'vin' ? 'l18_bouteille' : c.quoi === 'linge' ? 'l18_draps' : 'l18_epicerie', 1)) return;
    if (c.type === 'perdu' && !farm.take('l18_objet_perdu', 1)) return;
    const k = S.commissions.indexOf(c);
    if (k >= 0) S.commissions.splice(k, 1);
    let tip = c.pourboire || 12;
    if (c.type === 'vallee' && ITEMS[c.objet]) tip += Math.round((ITEMS[c.objet].price || 5) * 1.5);
    tip = Math.round(tip * (1 + S.rep / 200));
    farm.earn(tip);
    S.stats.pourboires += tip; S.stats.faites++;
    if (sv && sv.jour === farm.s.day) { sv.gains += tip; sv.faites++; }
    const gain = L18_REGL.repBien[0] + Math.floor(Math.random() * (L18_REGL.repBien[1] - L18_REGL.repBien[0] + 1));
    this.reputation(gain);
    const D = L18_DEMANDES[c.type], nom = this.nomClient(c.client);
    try { sound.coin && sound.coin(); } catch (e) { /* */ }
    hotel18.dire(nom, `${pick(D.ok)} (${tip} pièces de pourboire.)`, 4.5);
    hotelGens.par[c.client] && (hotelGens.par[c.client].parle = 2);
    void aLaLoge;
  },
  rater(c, txt) {
    const S = hotel18.S();
    const k = S.commissions.indexOf(c);
    if (k >= 0) S.commissions.splice(k, 1);
    S.stats.ratees++;
    this.reputation(-L18_REGL.repMal);
    if (txt) hotel18.dire(this.nomClient(c.client), txt, 4);
  },
  reputation(n) {
    const S = hotel18.S(), avant = hotel18.rang();
    S.rep = clamp(S.rep + n, 0, 100);
    const apres = hotel18.rang();
    if (apres.id !== avant.id && n > 0) {
      setTimeout(() => hotel18.dire('Gaspard', `${apres.nom.charAt(0).toUpperCase() + apres.nom.slice(1)}. Le directeur l’a dit à table, devant tout le monde. Il n’a jamais su complimenter autrement.`, 6), 2500);
      if (apres.id === 'clefs' && !farm.count('l18_clefs')) farm.give('l18_clefs', 1);
      hotelHistoires.signal('rang', { rang: apres.id });
    }
  },
  remettable(c) {
    if (c.type === 'vallee') return farm.count(c.objet) > 0;
    if (c.type === 'reserve') return farm.count(c.quoi === 'vin' ? 'l18_bouteille' : c.quoi === 'linge' ? 'l18_draps' : 'l18_epicerie') > 0;
    if (c.type === 'perdu') return farm.count('l18_objet_perdu') > 0 && c.trouve;
    return false;
  },
  // ------------------------------------------------------------- chaque seconde
  tic() {
    const S = hotel18.S(), s = farm.s, sv = S.service;
    if (!S.embauche) return;
    // le service : les clients viennent ; il finit à l'heure
    if (sv && sv.jour === s.day && !sv.fini) {
      if (s.hours >= sv.fin) this.finir(false);
      else if (s.hours >= sv.prochaine && S.demandes.filter((d) => d.etat === 'attend').length < 2 && sv.n < L18_REGL.demande.max) {
        const d = this.tirer();
        const r = mulberry32((s.day * 977 + sv.n * 31) >>> 0)();
        sv.prochaine = s.hours + L18_REGL.demande.ecart[0] + r * (L18_REGL.demande.ecart[1] - L18_REGL.demande.ecart[0]);
        if (d) { S.demandes.push(d); if (hotel18.dedans()) { try { sound.bell ? sound.bell() : sound.tick(); } catch (e) { /* */ } } }
      }
      // un service quitté : loin de l'hôtel trop longtemps (plus de 900 m pendant une heure de jeu)
      if (hotel18.distance() > 900) { sv.loin = (sv.loin || 0) + 1; if (sv.loin > 50) { this.finir(true); hotel18.dire('', '(Vous avez quitté votre service.)', 3); } } else sv.loin = 0;
    }
    // ceux qui attendent trop longtemps s'en vont
    for (const d of S.demandes) if (d.etat === 'attend' && s.hours > d.expire) { d.etat = 'parti'; this.reputation(-1); }
    this.nettoyer();
    // les commissions échues
    for (const c of S.commissions.slice()) {
      if (c.type === 'secret') { if (s.hours >= c.quand && !c.demande && hotel18.dedans()) { c.demande = true; this.questionSecret(c); } continue; }
      if (c.echeance && s.hours > c.echeance) this.rater(c, c.type === 'vallee' ? 'Tant pis pour ma commission. Je suis reparti sans.' : 'J’ai attendu, vous savez.');
    }
  },
  // ------------------------------------------------------------- le secret : quelqu'un vient vous demander
  questionSecret(c) {
    if (ui.panel || (typeof cine !== 'undefined' && cine.on)) { c.demande = false; return; }
    const S = hotel18.S(), Q = L18_SECRETS[c.secret || 0], nom = this.nomClient(c.client);
    ui.choice(Q.qui.charAt(0).toUpperCase() + Q.qui.slice(1), `« ${Q.dit.replace('{ch}', c.ch)} »`, [
      { label: '« Dans sa chambre, toute la soirée. »', fn: () => { ui.close(); const k = S.commissions.indexOf(c); if (k >= 0) S.commissions.splice(k, 1); S.stats.secrets++; this.reputation(L18_REGL.repSecret); const tip = Math.round((c.pourboire || 20) * 1.6); farm.earn(tip); S.stats.pourboires += tip; hotel18.dire(nom, `(Le lendemain, une enveloppe au casier : ${tip} pièces, et pas un mot.)`, 5); } },
      { label: `« Non. » (${Q.paie} pièces)`, fn: () => { ui.close(); const k = S.commissions.indexOf(c); if (k >= 0) S.commissions.splice(k, 1); farm.earn(Q.paie); this.reputation(-L18_REGL.repSecret); hotel18.dire(Q.qui, 'Merci. Vous avez bien fait. (Il n’en pense rien.)', 4); } },
    ]);
  },
  // ------------------------------------------------------------- les portes des chambres (livrer, frapper)
  chambre(it) {
    const S = hotel18.S(), num = it.data.num;
    const pour = S.commissions.filter((c) => c.etat === 'accepte' && c.ch === num && (c.type === 'bagages' || c.type === 'lettre'));
    if (pour.length) {
      const opts = pour.map((c) => ({ label: c.type === 'bagages' ? 'Déposer la valise' : 'Glisser le pli sous la porte', fn: () => { ui.close(); if (!farm.take(c.type === 'bagages' ? 'l18_valise' : 'l18_pli', 1)) { hotel18.dire('', '(Vous ne l’avez plus.)', 2.5); return; } this.reussir(c); } }));
      opts.push({ label: 'S’en aller', fn: () => ui.close() });
      ui.choice('Chambre ' + num, 'Vous frappez. « Entrez… Ah, c’est vous. Posez ça là. »', opts);
      return;
    }
    if (hotelHistoires.porteChambre && hotelHistoires.porteChambre(num)) return;
    hotel18.dire('', pick(L18_TEXTES.occupee), 2.5);
  },
  // ------------------------------------------------------------- la cave : ce qu'on vient y chercher
  reserve(it) {
    const S = hotel18.S(), q = it.data.quoi;
    if (q === 'chaudiere') { hotel18.dire('', '(La chaudière ronfle. Quelqu’un a écrit à la craie sur la porte du foyer : « 1882. Ne jamais la laisser s’éteindre en hiver. Ni le reste de l’année. »)', 5); return; }
    const veut = S.commissions.filter((c) => c.etat === 'accepte' && c.type === 'reserve' && c.quoi === q);
    const id = q === 'vin' ? 'l18_bouteille' : q === 'linge' ? 'l18_draps' : 'l18_epicerie';
    if (veut.length > farm.count(id)) { farm.give(id, 1); try { sound.pop && sound.pop(); } catch (e) { /* */ } hotel18.dire('', `(${itemName(id)} : à remettre à la loge.)`, 3); return; }
    hotel18.dire('', { vin: '(Des bouteilles par centaines, couchées dans le sable. Des millésimes que personne ne boira. Le sommelier compte chaque bouteille.)', linge: '(Des draps, des nappes, des serviettes brodées d’un C et d’un sapin. Ça sent le savon de Marseille.)', epicerie: '(Des pots de confiture, du miel de sapin, des sacs de farine et de sucre, des jambons au plafond.)' }[q] || '', 4);
  },
  // ------------------------------------------------------------- l'objet perdu : il est là où le client l'a laissé
  perdus() { const S = hotel18.S(); return S.commissions.filter((c) => c.etat === 'accepte' && c.type === 'perdu' && !c.trouve); },
  cibler(eye, f, cand) {
    if (!hotelGens.actif) return;
    for (const c of this.perdus()) {
      const P = hotelGens.place(c.ou);
      if (!P) continue;
      const x = P.p[0] + 0.5, y = P.p[1] + 0.1, z = P.p[2] + 0.4;
      const dx = x - eye[0], dy = y - eye[1], dz = z - eye[2], d = Math.hypot(dx, dy, dz);
      if (d > 2.6 || (dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1) < 0.7) continue;
      cand({ kind: 'hook', use: () => { c.trouve = true; farm.give('l18_objet_perdu', 1); try { sound.pop && sound.pop(); } catch (e) { /* */ } hotel18.dire('', `(${c.objetNom.charAt(0).toUpperCase() + c.objetNom.slice(1)}, glissé sous un coussin. À rapporter à la loge.)`, 4); } }, d);
    }
    // les querelles : on va voir
    const S = hotel18.S();
    for (const c of S.commissions.filter((q) => q.etat === 'accepte' && q.type === 'dispute')) {
      const P = hotelGens.place(c.ou);
      if (!P) continue;
      const dx = P.p[0] - eye[0], dy = P.p[1] + 1.2 - eye[1], dz = P.p[2] - eye[2], d = Math.hypot(dx, dy, dz);
      if (d > 3.4) continue;
      cand({ kind: 'hook', use: () => this.querelle(c) }, d + 0.3);
    }
  },
  dessiner(buf) {
    // l'objet perdu : un petit éclat doré, posé
    for (const c of this.perdus()) {
      const P = hotelGens.place(c.ou);
      if (!P) continue;
      PE.buf = buf; PE.fl = FX_EMIT; PE.frame(P.p[0] + 0.5, P.p[1] + 0.02, P.p[2] + 0.4, game.time, 1);
      PE.bx(0, 0, 0, 0.12, 0.04, 0.08, L18C.or, TL.gold); PE.fl = 0;
    }
    // la querelle : deux silhouettes qui se font face
    const S = hotel18.S();
    for (const c of S.commissions.filter((q) => q.etat === 'accepte' && q.type === 'dispute')) {
      const P = hotelGens.place(c.ou);
      if (!P) continue;
      const r1 = this._r1 || (this._r1 = humanRig({ hair: '#3a2a1a', beard: 'moustache', top: '#2a2a3a', bottom: '#1a1a22', coat: true }));
      const r2 = this._r2 || (this._r2 = humanRig({ hair: '#8a8a8a', top: '#5a3a2a', bottom: '#3a2a20', build: 'rond' }));
      const t = game.time;
      poseHuman(r1, { t, talk: true, wave: Math.sin(t * 2) > 0.6 }); poseHuman(r2, { t: t + 1, talk: true, cross: true });
      drawRig(buf, r1, P.p[0] + 0.7, P.p[1], P.p[2], -Math.PI / 2, 1, 0);
      drawRig(buf, r2, P.p[0] - 0.7, P.p[1], P.p[2], Math.PI / 2, 1, 0);
    }
  },
  querelle(c) {
    const Q = L18_QUERELLES[c.querelle || 0];
    const opts = Q.rep.map((r, i) => ({ r, i }));
    // l'ordre des réponses, fixe pour cette demande
    const rnd = mulberry32(hashString(c.id) >>> 0);
    for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
    ui.choice('Une querelle, à propos de ' + Q.de, Q.a, opts.map((o) => ({ label: o.r, fn: () => { ui.close(); if (o.i === 0) this.reussir(c); else this.rater(c, o.i === 2 ? '« On n’a jamais vu ça ! Je m’en plaindrai à la direction ! »' : '« Voilà qui ne règle rien. »'); } })));
  },
  // ------------------------------------------------------------- le chef, le cocher (les commissions qu'on leur porte)
  options(id) {
    const S = hotel18.S(), opts = [];
    for (const c of S.commissions.filter((q) => q.etat === 'accepte')) {
      if (id === 'chef' && c.type === 'diner') opts.push({ label: 'Un dîner pour ' + this.nomClient(c.client), fn: () => this.diner(c) });
      if (id === 'cocher' && c.type === 'voiture') opts.push({ label: 'Faire atteler pour ' + this.nomClient(c.client), fn: () => { ui.close(); hotel18.dire('Baptiste', 'Pour deux heures. Les chevaux seront prêts à une heure et demie : ils aiment attendre.', 4); this.reussir(c); } });
      if (c.client === id && this.remettable(c)) opts.push({ label: 'Rendre ' + this.objetDe(c), fn: () => { ui.close(); this.reussir(c); } });
    }
    return opts;
  },
  diner(c) {
    const D = L18_DINERS[c.diner || 0], L = [{ t: D.bon, ok: true }, ...D.autres.map((t) => ({ t, ok: false }))];
    const rnd = mulberry32(hashString(c.id + 'd') >>> 0);
    for (let i = L.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [L[i], L[j]] = [L[j], L[i]]; }
    ui.choice('Le chef Mercadier', `« Un dîner. Pour qui, et qu’est-ce qu’elle aime ? » (« ${D.gout} »)`, L.map((m) => ({ label: m.t, fn: () => { ui.close(); if (m.ok) { hotel18.dire('Le chef Mercadier', 'Ça, c’est un menu. Laissez-moi faire.', 3); this.reussir(c); } else this.rater(c, 'Le dîner était parfait, paraît-il. Mais ce n’était pas le bon.'); } })));
  },
  // ------------------------------------------------------------- la porte de l'aile Nord, et les autres portes fermées
  porte(dr) {
    const id = dr.l18;
    if (!dr.locked) return false;
    if (id === 'aile') {
      if (farm.count('l18_cle_aile')) { dr.locked = false; dr.open = 1; try { sound.lock && sound.lock(false); sound.door(true); } catch (e) { /* */ } hotelHistoires.signal('aile', {}); return true; }
      hotel18.dire('', L18_TEXTES.aileFermee, 4); return true;
    }
    if (id === 'aile1' || id === 'aile2') { hotel18.dire('', L18_TEXTES.aileCondamnee, 4); return true; }
    if (id === 'treize') { if (hotelHistoires.porteTreize && hotelHistoires.porteTreize(dr)) return true; hotel18.dire('', L18_TEXTES.treizeFermee, 3.5); return true; }
    return false;
  },
  // ------------------------------------------------------------- les petites choses de l'hôtel
  lit() {
    const S = hotel18.S();
    if (!S.embauche) { hotel18.dire('', '(Ce lit n’est pas le vôtre. Pas encore.)', 3); return; }
    game.trySleep('auberge');
  },
  escalier(it) { if (it.data && it.data.to) game.teleport(it.data.to, it.id === 'l18_cave_haut' ? 'Vous descendez l’escalier de la cave. Vingt marches, quarante, cent : on a creusé loin, sous la montagne.' : 'Vous remontez aux cuisines.'); },
  echelle(it) { if (it.data && it.data.to) game.teleport(it.data.to, 'Vous grimpez à l’échelle…'); },
  piano() {
    const g = hotelGens.par.wolanski;
    if (g && g.vis && g.cible === hotelGens.place('piano') && g.pose === 'assis') { hotel18.dire('M. Wolański', 'Pas maintenant. Pas pendant que je cherche.', 3); return; }
    hotel18.dire('', pick(['(Vous frappez un accord. Le piano est accordé un demi-ton trop haut : « pour l’altitude », dit Gaspard.)', '(Do, mi, sol. Au salon, quelqu’un lève les yeux de son journal.)', '(Une gamme. La note la plus grave ne sonne pas : un feutre manque.)']), 4);
    try { sound.note ? sound.note(0.5) : sound.tick(); } catch (e) { /* */ }
  },
  sonnettes() {
    const S = hotel18.S();
    if (hotelHistoires.sonnettes && hotelHistoires.sonnettes()) return;
    ui.read('Le tableau des sonnettes', 'Treize timbres de cuivre sur une planche vernie, reliés par des fils aux chambres des étages. Sous chaque timbre, une étiquette émaillée : 101, 102… Sous le treizième, l’étiquette est noire.\n\n' + (S.flags.treizeSonne ? 'Vous l’avez entendu sonner, la nuit.' : 'Gaspard dit qu’il est là « pour la symétrie ».'));
  },
  coffre() { if (hotelHistoires.coffre && hotelHistoires.coffre()) return; hotel18.dire('', '(Le coffre-fort de M. Brissac. Fermé. Vous n’êtes pas assez fou pour essayer.)', 3); },
  poteau(it) { ui.read('Un poteau indicateur', it.data.ou === 'bas' ? L18_TEXTES.poteauBas : it.data.ou === 'arret' ? L18_TEXTES.poteauArret : L18_TEXTES.poteauChateau); },
};

// ---------------------------------------------------------------- branchements
HOOKS.inter.l18_loge = () => hotelService.loge();
HOOKS.inter.l18_chambre = (it) => hotelService.chambre(it);
HOOKS.inter.l18_reserve = (it) => hotelService.reserve(it);
HOOKS.inter.l18_lit = () => hotelService.lit();
HOOKS.inter.l18_escalier = (it) => hotelService.escalier(it);
HOOKS.inter.l18_echelle = (it) => hotelService.echelle(it);
HOOKS.inter.l18_piano = () => hotelService.piano();
HOOKS.inter.l18_sonnettes = () => hotelService.sonnettes();
HOOKS.inter.l18_coffre = () => hotelService.coffre();
HOOKS.inter.l18_poteau = (it) => hotelService.poteau(it);
// les portes des chambres : on ne propose l'interaction que pour une porte close (ou une chambre où l'on a à faire)
HOOKS.interVis.l18_chambre = (it) => { const V = hotel18.V(), ch = V && V.chambres[it.data.num]; if (!ch || !ch.ouverte) return true; const S = hotel18.S(); return S.commissions.some((c) => c.ch === it.data.num && (c.type === 'bagages' || c.type === 'lettre')); };
HOOKS.target.push((eye, f, cand) => { try { hotelService.cibler(eye, f, cand); } catch (e) { /* */ } });
HOOKS.draw.push((buf) => { if (hotelGens.actif) try { hotelService.dessiner(buf); } catch (e) { /* */ } });
{
  let t = 0;
  HOOKS.update.push((dt) => { t -= dt; if (t > 0 || !farm.s || !hotel18.V()) return; t = 1; try { hotelService.tic(); } catch (e) { if (!hotelService._err) { hotelService._err = true; console.error('L18 service', e); } } });
}
// les clients qui attendent à la loge, et ceux qu'une commission retient : leurs places
hotelGens.surcharges.push((id, h) => {
  const S = hotel18.S();
  // Gaspard laisse la loge à qui est de service
  if (id === 'gaspard' && S.service && S.service.jour === farm.s.day && !S.service.fini && h >= 6.5 && h < 13) return { place: 'ch_m4', pose: 'dort' };
  const d = S.demandes.find((q) => q.etat === 'attend' && q.client === id);
  if (d) { const i = S.demandes.filter((q) => q.etat === 'attend').indexOf(d); return { place: ['loge_client', 'loge_client2', 'loge_client3'][i % 3], pose: 'debout' }; }
  return null;
});
// les portes de l'hôtel fermées à clé : la nôtre d'abord
HOOKS.load.push(() => {
  if (game._l18porte) return;
  game._l18porte = true;
  const _ud = game.useDoor.bind(game);
  game.useDoor = function (dr) { if (dr && dr.l18) { try { if (hotelService.porte(dr)) return; } catch (e) { console.error(e); } } return _ud(dr); };
});
// au chargement : les verrous de l'aile (la porte du rez-de-chaussée reste ouverte une fois la clé tournée)
HOOKS.load.push(() => {
  const V = hotel18.V(), w = hotel18.monde();
  if (!V || !w) return;
  const S = hotel18.S();
  const dr = w.doors[V.portes.aile];
  if (dr) dr.locked = !S.flags.aileOuverte;
  const t = w.doors[V.portes.treize];
  if (t) t.locked = !S.flags.treizeOuverte;
});
