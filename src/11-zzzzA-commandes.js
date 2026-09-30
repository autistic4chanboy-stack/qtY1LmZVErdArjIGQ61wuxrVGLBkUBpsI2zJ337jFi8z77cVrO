// ============================================================================
//  LE CARNET DE COMMANDES ET LE VOITURIER (agent C4)
//  - Dans le coffre de la ferme, un CARNET DE COMMANDES (des bons à souches, à
//    l'en-tête du roulage Bardin). On y commande ce que vendent les habitants
//    déjà rencontrés : leur étal du jour (graines du jour, hotte des
//    colporteurs, reprises d'un commerce, garde-meuble de la commune), au prix
//    de leur boutique (ui.shopPrice : amitié et garde-fou compris), plus un port
//    modeste (trois pièces par étal, trois de plus par kilomètre jusqu'au point
//    de livraison, huit pour un colporteur, deux par meuble). On paie d'avance ;
//    une commande se raye tant que l'aube n'est pas passée (remboursée).
//  - Le lendemain matin (entre six heures et demie et huit heures), le
//    VOITURIER dépose un COLIS au POINT DE LIVRAISON : devant la ferme au
//    départ, et le carnet le change (devant la ferme, devant une maison louée ou
//    achetée en ville, ou « ici » : dehors, là où l'on se tient, carnet en main).
//    Qui est dans les parages le voit venir par la route, sa charrette, son
//    cheval, descendre, poser le colis, faire demi-tour ; sinon le colis est là.
//  - Le colis s'ouvre (E) dans le menu de butin ; ce qu'on y laisse y reste
//    (même après avoir rechargé la partie) ; vide, il n'y est plus.
//  - Un habitant mort (ou qui ne vous vend plus rien) n'a plus d'étal au carnet ;
//    mort entre la commande et la livraison : le prix de l'article revient dans
//    le colis, en pièces. Rarement, un colis se perd en route (une lettre, la
//    marchandise remboursée, pas le port) ; laissé seul, il arrive qu'on l'ouvre.
//  Rien n'est généré dans la vallée (les colis et le voiturier sont dessinés à
//  part) : l'empreinte des objets d'avant ne bouge pas.
//  État : farm.s.commandes = { v, pose, pt: { k: 'ferme' | 'maison' | 'ici', b, x, z, nom },
//         cmds: [{ id, j, h, due, st, L: [[pnj, étal, objet, n, prix]…], port, total, fin }],
//         colis: [{ id, x, y, z, r, j, de, C: { src, j, o }, ouvert, vu, gros }], n }
//  API : commandes (S(), ouvrir(depuis), etals(), articles(E), prixUnite(n, id, base), port(E, lieu),
//        lieu(pt), points(), choisirPoint(pt), commander(), rayer(id), expedier(dus), poser(lieu, o, vu),
//        ouvrirColis(k), tour) ; COMMANDES_EXCLUS : habitants qui ne prennent pas de commandes.
// ============================================================================

// ---------------------------------------------------------------- réglages
const CMD = {
  port: { base: 3, km: 3, nomade: 8, meuble: 2, max: 16 },
  heure: [6.4, 8.0],            // passage du voiturier (heure du jour)
  perdu: 0.02,                  // un colis sur cinquante se perd en route
  vole: 0.035, voleFerme: 0.012, // laissé seul, on l'ouvre (moins souvent à la ferme, où le chien garde)
  vitesse: 3.4, pas: 1.45,      // charrette, homme à pied (m/s)
  vu: 170, loin: 290,           // on voit passer le voiturier ; au-delà, il s'en va sans qu'on le voie
  marche: 60,                   // l'homme porte le colis à pied depuis la route, au plus
  max: 99,                      // par article et par commande
  attache: 2.85,                // du milieu de la charrette au cheval
};
// (les nains ne commercent pas avec la surface par écrit ; un autre module peut en ajouter)
const COMMANDES_EXCLUS = new Set(['nain_forgeronne', 'nain_ancien']);
const CMD_VIVANT = new Set(['chiot']);
const CMD_LOOK = { skin: '#d2a882', hair: '#4a3a2c', hairStyle: 'court', beard: 'moustache', hat: 'chapeau', hatCol: '#2e2822', top: '#3e5a86', bottom: '#3a3228', shoe: '#1e1812', build: 'normal', height: 1 };
const CMD_DIT = {
  pose: ['Pour vous. C’est réglé d’avance.', 'Votre colis. Tout y est, je crois.', 'Posé là. Bonne journée.', 'Voilà. La tournée m’attend.'],
  pluie: ['Il a pris un peu d’eau. Le dedans est sec.', 'Voilà. Je ne m’attarde pas, avec ce temps.'],
  parler: ['Je ne fais que porter. Les commandes, c’est au carnet.', 'La tournée n’attend pas.', 'Le matin, toujours le matin. Le soir, je ne roule pas.', 'Écrivez aujourd’hui, je passe demain.', 'Hue.'],
  // (certains matins)
  rouge: ['Le cheval n’a pas voulu passer le calvaire avant l’aube. Il sait des choses, cette bête.'],
  tueur: ['Fermez bien, ce soir. On dit des choses, sur la route.'],
};
// ce qu'on trouve parfois dans un colis qu'on a ouvert en route
const CMD_LAISSE = ['meche_cheveux', 'bille', 'tesson', 'os', 'plume'];

defItem('carnet_commandes', 'Carnet de commandes', 'quete', 0, ['livre', '#4a5a3a'], { unique: true,
  desc: 'Des bons à souches, à l’en-tête du roulage Bardin. On y écrit ce qu’on veut des étals de la vallée ; le voiturier l’apporte le lendemain matin. Prenez-le en main et cliquez pour l’ouvrir.' });

const commandes = {
  panier: new Map(), sel: null, onglet: 'etals', depuis: 'main', encart: false, styled: false, branche: false,
  tour: null, verifT: 0, eFerme: false,

  S() {
    const s = farm.s;
    if (!s) return null;
    const C = s.commandes || (s.commandes = { v: 1, pose: false, pt: { k: 'ferme' }, cmds: [], colis: [], n: 0 });
    if (!C.pt || !C.pt.k) C.pt = { k: 'ferme' };
    if (!Array.isArray(C.cmds)) C.cmds = [];
    if (!Array.isArray(C.colis)) C.colis = [];
    C.n = C.n || 0;
    return C;
  },
  jour(d) { return typeof cal !== 'undefined' ? `${cal.nom(d)} ${d}` : `jour ${d}`; },

  // ================================================================== les étals
  // un habitant qui ne vous vend plus rien (même règle que la boutique)
  refus(n) {
    if (!n || !n.st || !n.st.alive) return 'mort';
    const soc = typeof societe !== 'undefined' ? societe : null, c0 = soc ? soc.ctx : null, cs = soc ? soc.ctxShop : false;
    let crime = false;
    try { if (soc) { soc.ctx = n; soc.ctxShop = true; } crime = !!npcs.murdererKnown(); } catch (e) { crime = false; } finally { if (soc) { soc.ctx = c0; soc.ctxShop = cs; } }
    if (crime) return 'crime';
    if (n.st.anger > 0) return 'fache';
    return null;
  },
  // sous la terre (un peuple d'en bas) : le voiturier n'y descend pas
  sousTerre(d) {
    try { const w = game.world, B = w.bld[d.home]; return !!(B && (B.under || B.y < w.heightAt(B.x, B.z) - 3)); } catch (e) { return false; }
  },
  etals() {
    const out = [];
    if (typeof npcs === 'undefined' || !npcs.list) return out;
    for (const n of npcs.list) {
      const d = n.d;
      if (!d || !d.shop || !n.st || !n.st.met) continue;
      if (COMMANDES_EXCLUS.has(d.id) || d.area === 'nains' || d.pasDeCarnet || d.shop.carnet === false || this.sousTerre(d)) continue;
      const refus = this.refus(n);
      out.push({ cle: d.id, n, S: d.shop, nom: d.shop.name || n.name, refus });
      if (d.id === 'maire' && typeof MEUBLES_GARDE !== 'undefined') out.push({ cle: 'maire:garde', n, S: MEUBLES_GARDE, nom: MEUBLES_GARDE.name, refus, garde: true });
    }
    return out;
  },
  etal(cle) { return this.etals().find((E) => E.cle === cle) || null; },
  // ce que l'étal vend aujourd'hui (comme la boutique : graines du jour, hotte, reprises), sans les bêtes
  articles(E) {
    const n = E.n, S = E.S;
    let sells = (S.sells || []).slice();
    if (!E.garde) {
      try { if (typeof HOTTES !== 'undefined' && HOTTES[n.d.id] && typeof routines !== 'undefined' && routines.hotte && farm.s) sells = routines.hotte(n, sells); } catch (e) { /* la hotte d'origine */ }
      try {
        if (typeof societe !== 'undefined' && societe.reprises) {
          const plus = societe.reprises(n).filter((id) => !sells.some(([k]) => k === id)).map((id) => [id, Math.round(societe.prixBase(id) * 1.2)]);
          sells = sells.concat(plus);
        }
      } catch (e) { /* pas de reprise */ }
    }
    const out = [], vus = new Set();
    for (const [id, base] of sells) {
      const it = ITEMS[id];
      if (!it || !(base > 0) || vus.has(id) || it.animal || it.cat === 'animal' || CMD_VIVANT.has(id)) continue;
      vus.add(id);
      out.push({ id, base, prix: this.prixUnite(n, id, base), meuble: !!(E.garde || (typeof MEUBLES !== 'undefined' && MEUBLES[id] && it.place)) });
    }
    return out;
  },
  // le prix de la boutique, exactement (remise d'amitié, garde-fou contre l'achat-revente)
  prixUnite(n, id, base) { return ui.shopPrice(n, id, base, true); },
  // le port d'un étal jusqu'au point de livraison
  port(E, L) {
    const P = CMD.port;
    if (E.n.d.nomade) return P.nomade;
    let km = 1;
    try {
      const w = game.world, d = E.n.d, B = (E.garde && w.bld.mairie) || w.bld[d.work] || w.bld[d.home];
      L = L || this.lieu();
      if (B && L) km = Math.hypot(B.x - L.x, B.z - L.z) / 1000;
    } catch (e) { km = 1; }
    return clamp(P.base + Math.ceil(km * P.km), P.base, P.max);
  },

  // ================================================================== le point de livraison
  maisonAMoi(k) {
    try { return !!((typeof locations !== 'undefined' && locations.locataire(k)) || (typeof meubles !== 'undefined' && meubles.proprio && meubles.proprio(k))); } catch (e) { return false; }
  },
  // devant la porte d'une maison, un pas de côté pour ne pas la barrer
  devant(B) {
    const w = game.world, out = B.out || [B.x, B.z];
    let dx = out[0] - B.x, dz = out[1] - B.z;
    const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L;
    const sx = dz, sz = -dx;
    for (const k of [-1.6, 1.6, -2.4, 2.4]) {
      const x = out[0] + sx * k + dx * 0.5, z = out[1] + sz * k + dz * 0.5;
      if (pointFree(w, x, z, 0.35) && !this.encombre(x, z, 0.75)) return { x, z };
    }
    return { x: out[0] + dx * 1.4, z: out[1] + dz * 1.4 };
  },
  // un objet posé tout près (boîte aux lettres, tonneau, banc…)
  encombre(x, z, r) {
    const w = game.world;
    for (const q of w.props) {
      if (!q || q.gone || Math.abs(q.x - x) > r || Math.abs(q.z - z) > r) continue;
      if (typeof MEU_PLATS !== 'undefined' && MEU_PLATS.has(q.id)) continue;
      if (Math.hypot(q.x - x, q.z - z) < r) return true;
    }
    return false;
  },
  // où livrer, en coordonnées ; une maison rendue (ou revendue) : la ferme
  lieu(pt) {
    const w = game.world, C = this.S();
    pt = pt || (C && C.pt) || { k: 'ferme' };
    if (pt.k === 'maison' && pt.b && w.bld[pt.b] && this.maisonAMoi(pt.b)) {
      const P = this.devant(w.bld[pt.b]);
      return { k: 'maison', b: pt.b, x: P.x, z: P.z, nom: this.nomMaison(pt.b) };
    }
    if (pt.k === 'ici' && isFinite(pt.x) && isFinite(pt.z)) return { k: 'ici', x: pt.x, z: pt.z, nom: this.nomIci(pt.x, pt.z) };
    const P = this.devant(w.bld.ferme);
    return { k: 'ferme', x: P.x, z: P.z, nom: 'devant la ferme' };
  },
  nomMaison(b) { const M = typeof LOC_MAISONS !== 'undefined' && LOC_MAISONS[b]; return M ? `devant ${M.nom}` : 'devant la maison'; },
  // « de » et l'article d'un lieu-dit (« le vieux moulin » : du vieux moulin)
  de(nom) {
    const s = String(nom || '');
    if (/^le /i.test(s)) return 'du ' + s.slice(3);
    if (/^les /i.test(s)) return 'des ' + s.slice(4);
    if (/^la /i.test(s)) return 'de la ' + s.slice(3);
    if (/^l[’']/i.test(s)) return 'de l’' + s.slice(2);
    if (/^une? /i.test(s)) return 'd’' + s;
    return 'de ' + s;
  },
  // un endroit noté : près d'un lieu qu'on connaît, sinon à tant de mètres de lui (ou de la ferme), vers où
  // (en anglais, la phrase se compose d'un bloc : « près du vieux moulin » ne se traduit pas morceau à morceau)
  nomIci(x, z) {
    const w = game.world, card = (a) => (w.cardinal ? w.cardinal(a) : 'le large');
    if (typeof i18n !== 'undefined' && i18n.lang === 'en') return this.nomIciEn(x, z, card);
    const B = this.lieuProche(x, z);
    if (B && B.d < 90) return `près ${this.de(B.L.name)}`;
    if (B) return `à ${Math.max(100, Math.round(B.d / 50) * 50)} mètres ${this.de(B.L.name)}, vers ${card(Math.atan2(x - B.L.x, z - B.L.z))}`;
    const F = w.bld.ferme, d = Math.max(100, Math.round(Math.hypot(x - F.x, z - F.z) / 50) * 50);
    return `à ${d} mètres de la ferme, vers ${card(Math.atan2(x - F.x, z - F.z))}`;
  },
  // le lieu connu le plus proche (à moins de 700 m) : { L, d } ou null
  lieuProche(x, z) {
    const w = game.world;
    let best = null, bd = 700;
    for (const k in w.lm) {
      const L = w.lm[k];
      if (!L || !L.name || L.under || L.secret) continue;
      if (typeof savoir !== 'undefined' && savoir.lieuConnu && !savoir.lieuConnu(k)) continue;
      const d = Math.hypot(L.x - x, L.z - z);
      if (d < bd) { bd = d; best = L; }
    }
    return best ? { L: best, d: bd } : null;
  },
  nomIciEn(x, z, card) {
    const w = game.world, nom = (s) => T(s).replace(/^(The|An?) /, (m) => m.toLowerCase()), dir = (a) => T(card(a)).replace(/^the /i, '');
    const B = this.lieuProche(x, z);
    if (B && B.d < 90) return `near ${nom(B.L.name)}`;
    if (B) return `${Math.max(100, Math.round(B.d / 50) * 50)} metres ${dir(Math.atan2(x - B.L.x, z - B.L.z))} of ${nom(B.L.name)}`;
    const F = w.bld.ferme;
    return `${Math.max(100, Math.round(Math.hypot(x - F.x, z - F.z) / 50) * 50)} metres ${dir(Math.atan2(x - F.x, z - F.z))} of the farm`;
  },
  // « ici » : dehors, dans la vallée, à portée d'un chemin
  ici() {
    const p = game.player, w = game.world;
    if (this.depuis !== 'main') return { ok: false, pourquoi: 'carnet en main, là où vous voulez qu’il vienne' };
    if (typeof mondes !== 'undefined' && mondes.actuel && mondes.actuel()) return { ok: false, pourquoi: 'pas d’ici' };
    const x = p.pos[0], z = p.pos[2], eye = p.eyePos ? p.eyePos() : [x, p.pos[1] + 1.6, z];
    if (p.underground || p.swimming || p.wading || w.heightAt(x, z) < w.waterLevel + 0.3) return { ok: false, pourquoi: 'la charrette n’y viendrait pas' };
    if (w.covered(eye[0], eye[1], eye[2])) return { ok: false, pourquoi: 'dehors seulement' };
    if (!w.inside(x, z, 30)) return { ok: false, pourquoi: 'trop loin de tout' };
    if (npcs.nearestNode(x, z, CMD.marche, (q) => !/:(in|mid)$/.test(q.tag || '')) < 0) return { ok: false, pourquoi: 'trop loin des chemins' };
    return { ok: true, x: Math.round(x * 10) / 10, z: Math.round(z * 10) / 10, nom: this.nomIci(x, z) };
  },
  points() {
    const C = this.S(), out = [{ pt: { k: 'ferme' }, nom: 'Devant la ferme', on: C.pt.k === 'ferme' }];
    const w = game.world;
    if (typeof LOC_MAISONS !== 'undefined') for (const b in LOC_MAISONS) if (w.bld[b] && this.maisonAMoi(b)) out.push({ pt: { k: 'maison', b }, nom: `Devant ${LOC_MAISONS[b].nom}`, on: C.pt.k === 'maison' && C.pt.b === b });
    if (C.pt.k === 'maison' && !out.some((o) => o.on)) out[0].on = true; // (la maison n'est plus à vous)
    if (C.pt.k === 'ici') out.push({ pt: C.pt, nom: `À l’endroit noté, ${this.nomIci(C.pt.x, C.pt.z)}`, on: true });
    const I = this.ici();
    out.push(I.ok ? { pt: { k: 'ici', x: I.x, z: I.z, nom: I.nom }, nom: `Ici, ${I.nom}`, ici: true } : { nom: 'Ici', non: I.pourquoi, ici: true });
    return out;
  },
  choisirPoint(pt) {
    const C = this.S();
    if (!pt || !pt.k) return;
    C.pt = pt.k === 'ici' ? { k: 'ici', x: pt.x, z: pt.z, nom: pt.nom } : pt.k === 'maison' ? { k: 'maison', b: pt.b } : { k: 'ferme' };
  },

  // ================================================================== le bon de commande
  cleP(E, id) { return E.cle + '|' + id; },
  // ce qui est déjà en route (un objet unique ne se commande qu'une fois)
  enCommande(id) { const C = this.S(); return C.cmds.some((c) => (c.st === 'attente' || c.st === 'route') && c.L.some((l) => l[2] === id)) || C.colis.some((k) => k.C && k.C.o.some((e) => e[0] === id && e[1] > 0)); },
  maxArticle(id) {
    const it = ITEMS[id];
    if (!it) return 0;
    if (it.unique) return farm.count(id) || this.enCommande(id) ? 0 : 1;
    return CMD.max;
  },
  // les lignes du bon, relues contre les étals du moment (un étal fermé entre-temps sort du bon)
  lignes() {
    const E = new Map(), out = [];
    for (const e of this.etals()) if (!e.refus) E.set(e.cle, e);
    const arts = new Map();
    for (const [k, n] of this.panier) {
      if (!(n > 0)) { this.panier.delete(k); continue; }
      const i = k.indexOf('|'), cle = k.slice(0, i), id = k.slice(i + 1), e = E.get(cle);
      if (!e) { this.panier.delete(k); continue; }
      if (!arts.has(cle)) arts.set(cle, this.articles(e));
      const a = arts.get(cle).find((x) => x.id === id);
      if (!a) { this.panier.delete(k); continue; }
      const m = Math.min(n, this.maxArticle(id));
      if (m <= 0) { this.panier.delete(k); continue; }
      out.push({ E: e, a, n: m });
    }
    return out;
  },
  compte(L, lieu) {
    lieu = lieu || this.lieu();
    let marchandise = 0, port = 0, n = 0;
    const parEtal = new Map();
    for (const l of L) {
      marchandise += l.a.prix * l.n; n += l.n;
      if (!parEtal.has(l.E.cle)) parEtal.set(l.E.cle, { E: l.E, meubles: 0 });
      if (l.a.meuble) parEtal.get(l.E.cle).meubles += l.n;
    }
    for (const { E, meubles } of parEtal.values()) port += this.port(E, lieu) + meubles * CMD.port.meuble;
    return { marchandise, port, total: marchandise + port, n, etals: parEtal.size };
  },
  commander() {
    const C = this.S(), s = farm.s, L = this.lignes();
    if (!L.length) return 'vide';
    const K = this.compte(L);
    if (s.money < K.total || !farm.pay(K.total)) return 'pauvre';
    const id = 'c' + (++C.n);
    C.cmds.push({ id, j: s.day, h: Math.round(npcs.hour() * 100) / 100, due: s.day + 1, st: 'attente', L: L.map((l) => [l.E.n.d.id, l.E.garde ? 'garde' : 'etal', l.a.id, l.n, l.a.prix]), port: K.port, total: K.total });
    this.panier.clear();
    sound.coin && sound.coin();
    sound.page && setTimeout(() => sound.page(), 160);
    return 'ok';
  },
  // rayer une commande : tant que l'aube n'est pas passée, on est remboursé de tout
  rayer(id) {
    const C = this.S(), c = C.cmds.find((x) => x.id === id);
    if (!c || c.st !== 'attente' || farm.s.day >= c.due) return false;
    c.st = 'raye'; c.fin = farm.s.day;
    farm.earn(c.total);
    sound.coin && sound.coin();
    return true;
  },
  resume(L) {
    const m = new Map();
    for (const [k, n] of L) m.set(k, (m.get(k) || 0) + n);
    const bits = [];
    let pieces = 0;
    for (const [k, n] of m) { if (k === 'argent') { pieces += n; continue; } if (ITEMS[k]) bits.push(n > 1 ? `${itemName(k).toLowerCase()} (${n})` : itemName(k).toLowerCase()); }
    if (pieces) bits.push(pieces > 1 ? `${pieces} pièces` : 'une pièce');
    return bits.join(', ');
  },

  // ================================================================== la tournée
  heureTournee(day) { const r = mulberry32(((farm.s.seed | 0) ^ 0x5eed7) + day * 7919)(); return CMD.heure[0] + r * (CMD.heure[1] - CMD.heure[0]); },
  // heures écoulées depuis l'aube (six heures), dans la journée de jeu
  depuisAube() { return (npcs.hour() - 6 + 24) % 24; },
  dues() {
    const C = this.S(), s = farm.s, h = this.depuisAube();
    return C.cmds.filter((c) => c.st === 'attente' && (s.day > c.due || (s.day === c.due && h >= this.heureTournee(c.due) - 6)));
  },
  verifier() {
    if (this.tour) return;
    const D = this.dues();
    if (D.length) this.expedier(D);
  },
  // le voiturier part : ce qu'il y a dans le colis (un habitant mort entre-temps : son prix, en pièces)
  contenu(D) {
    const o = [], de = [];
    let valeur = 0;
    for (const c of D) for (const [q, et, id, n, p] of c.L) {
      valeur += n * p;
      const m = npcs.byId[q], it = ITEMS[id];
      const mort = !m || !m.st || !m.st.alive || this.refus(m) === 'crime';
      if (mort || !it || (it.unique && farm.count(id))) { o.push(['argent', n * p]); continue; }
      o.push([id, n]);
      const nom = et === 'garde' && typeof MEUBLES_GARDE !== 'undefined' ? MEUBLES_GARDE.name : (m.d.shop && m.d.shop.name) || m.name;
      if (!de.includes(nom)) de.push(nom);
    }
    return { o, de, valeur };
  },
  expedier(D) {
    const C = this.S(), s = farm.s, { o, de, valeur } = this.contenu(D);
    // perdu en route : une lettre, la marchandise remboursée (pas le port)
    if (Math.random() < CMD.perdu) {
      for (const c of D) { c.st = 'perdu'; c.fin = s.day; }
      const j = this.jour(D[0].j), somme = valeur;
      farm.earn(somme);
      const lettres = [
        `Votre colis du ${j} n’est pas arrivé jusqu’à vous. Nous l’avons cherché sur la route, sans le retrouver.\n\nLa marchandise vous est remboursée : ${somme} pièces, jointes à ce pli. Le port reste acquis.`,
        `La charrette est rentrée ce matin sans votre colis du ${j}. Le cheval s’est arrêté au calvaire et n’a plus voulu avancer ; quand on a pu repartir, le colis n’était plus sur le plateau.\n\nNous vous remboursons la marchandise, ${somme} pièces, ci-jointes. Le port reste acquis.`,
      ];
      farm.mail('Roulage Bardin', 'Un colis égaré', pick(lettres));
      return;
    }
    const L = this.lieu();
    for (const c of D) c.st = 'route';
    if (!this.demarrer(D, o, de, L)) this.arrivee(D, o, de, L, false);
  },
  // le colis est là (vu : on a vu le voiturier le poser ; spot : l'endroit exact, choisi d'avance)
  arrivee(D, o, de, L, vu, spot) {
    const s = farm.s;
    for (const c of D) { c.st = 'livre'; c.fin = s.day; }
    if (o.length) this.poser(L, o, de, vu, spot);
  },
  // un endroit libre près du point (les colis d'avant sont peut-être encore là)
  place(L) {
    const C = this.S(), w = game.world;
    for (let k = 0; k < 30; k++) {
      const a = k * 2.39996, r = k === 0 ? 0 : 0.5 + 0.3 * Math.sqrt(k);
      const x = L.x + Math.cos(a) * r, z = L.z + Math.sin(a) * r;
      if (C.colis.some((q) => Math.hypot(q.x - x, q.z - z) < 0.85)) continue;
      if (k > 0 && (!pointFree(w, x, z, 0.3) || this.encombre(x, z, 0.6))) continue;
      return [x, z];
    }
    return [L.x, L.z];
  },
  poser(L, o, de, vu, spot) {
    const C = this.S(), s = farm.s, w = game.world;
    const [x, z] = spot || this.place(L);
    const y = w.groundAt(x, z, w.heightAt(x, z) + 0.6, 0.6);
    const lots = butin.nettoyer(o);
    const unites = lots.reduce((a, [k, n]) => a + (k === 'argent' ? 0 : n), 0);
    const gros = unites >= 12 || lots.some(([k]) => ITEMS[k] && ITEMS[k].place && typeof MEUBLES !== 'undefined' && MEUBLES[k]);
    const k = { id: 'k' + (++C.n), x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100, z: Math.round(z * 100) / 100, r: Math.round(Math.random() * 628) / 100, j: s.day, de: de || [], C: { src: 'ext', j: s.day, o: lots }, ouvert: 0, vu: 0, gros: gros ? 1 : 0 };
    C.colis.push(k);
    // laissé seul, loin des yeux : il arrive qu'on l'ouvre
    if (!vu) {
      const chien = L.k === 'ferme' && s.dog && s.dog.alive;
      if (Math.random() < (chien ? CMD.voleFerme : CMD.vole)) this.voler(k);
    }
    return k;
  },
  voler(k) {
    const o = k.C.o, total = o.reduce((a, e) => a + e[1], 0);
    if (!o.length) return;
    const e = o[(Math.random() * o.length) | 0];
    let m = Math.max(1, Math.ceil(e[1] * (0.3 + Math.random() * 0.5)));
    if (total > 1) m = Math.min(m, total - 1);
    e[1] -= m;
    if (e[1] <= 0) o.splice(o.indexOf(e), 1);
    const laisse = CMD_LAISSE.filter((id) => ITEMS[id]);
    if (laisse.length && (!o.length || Math.random() < 0.35)) o.push([pick(laisse), 1]);
    k.ouvert = 1;
  },
  enlever(k) { const C = this.S(), i = C.colis.indexOf(k); if (i >= 0) C.colis.splice(i, 1); },
  ouvrirColis(k) {
    const C = this.S();
    if (!C.colis.includes(k)) return;
    if (!butin.pret()) { butin.donner(k.C.o.splice(0)); this.enlever(k); return; }
    sound.lootOpen && sound.lootOpen();
    k.vu = 1;
    const chez = k.ouvert ? 'La ficelle a été coupée.' : (k.de || []).slice(0, 3).join(' · ');
    butin.ouvrir({ titre: 'Le colis', chez, contenu: k.C, cle: 'cmd:' + k.id, x: k.x, y: k.y, z: k.z, onFerme: () => { if (!butin.plein(k.C)) this.enlever(k); } });
  },
  // le matin : le carnet est-il encore quelque part ? (sinon, un neuf dans le coffre de la ferme)
  carnetQuelquePart() {
    const s = farm.s, id = 'carnet_commandes', dans = (o) => !!(o && typeof o === 'object' && o[id] > 0);
    if (farm.count(id)) return true;
    for (const k in s.chests || {}) if (dans(s.chests[k])) return true;
    const L = s.location;
    if (L) { for (const k in L.baux || {}) if (dans(L.baux[k].coffre)) return true; for (const k in L.saisies || {}) if (dans(L.saisies[k].objets)) return true; }
    const M = s.meubles;
    if (M && M.maisons) for (const k in M.maisons) if (dans(M.maisons[k].coffre)) return true;
    for (const p of s.props || []) if (p && p.data && dans(p.data.items)) return true;
    if (s.prison && dans(s.prison.saisie)) return true;
    return false;
  },
  remettreCarnet() {
    const s = farm.s;
    if (this.carnetQuelquePart()) return;
    const ch = s.chests.coffre_ferme || (s.chests.coffre_ferme = {});
    ch.carnet_commandes = 1;
  },
  menage() {
    const C = this.S(), s = farm.s;
    C.cmds = C.cmds.filter((c) => c.st === 'attente' || c.st === 'route' || s.day - (c.fin || c.j) <= 6);
  },

  // ================================================================== le voiturier sur la route
  // le chemin de la charrette : par les routes, depuis cent cinquante à deux cents mètres, jusqu'au nœud le plus
  // proche du point (l'homme fait le reste à pied)
  route(L) {
    const w = game.world, N = w.nav, p = game.player;
    if (!N || !N.nodes || !N.nodes.length) return null;
    const dehors = (q) => !q.iso && !/:(in|mid)$/.test(q.tag || '');
    const n0 = npcs.nearestReach(L.x, L.z, dehors);
    if (n0 < 0) return null;
    const q0 = N.nodes[n0];
    if (Math.hypot(q0.x - L.x, q0.z - L.z) > CMD.marche) return null;
    // Dijkstra depuis le point : routes plus douces, pas de portes, pas de pont levé (cout : pour choisir ; long : la
    // longueur vraie du chemin)
    const dist = new Map([[n0, 0]]), long = new Map([[n0, 0]]), prev = new Map(), done = new Set(), open = [n0];
    let it = 0;
    while (open.length && it++ < 3000) {
      let bi = 0;
      for (let k = 1; k < open.length; k++) if (dist.get(open[k]) < dist.get(open[bi])) bi = k;
      const cur = open.splice(bi, 1)[0];
      if (done.has(cur)) continue;
      done.add(cur);
      const dc = dist.get(cur);
      if (long.get(cur) > 240) continue;
      for (const e of N.adj[cur] || []) {
        const fl = e.flag || '';
        if (fl.startsWith('door:')) continue;
        if (fl.startsWith('bridge:')) { const b = w.bridges[+fl.slice(7)]; if (b && b.a >= 0.3) continue; }
        const q = N.nodes[e.to];
        if (!q || !dehors(q) || done.has(e.to)) continue;
        const nd = dc + e.d * (fl === 'road' ? 0.6 : /^sentier/.test(q.tag || '') ? 1.3 : 1);
        if (nd < (dist.get(e.to) ?? 1e18)) { dist.set(e.to, nd); long.set(e.to, long.get(cur) + e.d); prev.set(e.to, cur); open.push(e.to); }
      }
    }
    // le départ : assez loin, du côté de la ville (d'où viennent les marchandises), pas sous le nez du joueur
    const T = w.townInfo || { x: L.x, z: L.z };
    let best = -1, bs = 1e18, loin = -1, ld = -1;
    for (const [i, d0] of dist) {
      const d = long.get(i), q = N.nodes[i], dp = Math.hypot(q.x - p.pos[0], q.z - p.pos[2]);
      if (d > ld && d <= 240 && dp > 60) { ld = d; loin = i; }
      if (d < 100 || d > 170 || dp < 80) continue;
      const sc = Math.hypot(q.x - T.x, q.z - T.z) - d * 0.3;
      if (sc < bs) { bs = sc; best = i; }
    }
    if (best < 0) best = loin;
    if (best < 0 || best === n0) return null;
    const pts = [];
    for (let i = best; i !== undefined; i = prev.get(i)) { pts.push([N.nodes[i].x, N.nodes[i].z]); if (i === n0) break; }
    // on s'arrête avant le point : le cheval à cinq mètres au moins, la charrette derrière
    const cum = [0];
    for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
    let fin = cum[cum.length - 1];
    const R = { pts, cum };
    for (let g = 0; g < 80 && fin > 12; g++) { const P = this.surChemin(R, fin); if (Math.hypot(P[0] - L.x, P[1] - L.z) >= 5) break; fin -= 0.5; }
    if (fin < 12) return null;
    R.fin = fin;
    return R;
  },
  // le point du chemin à l'abscisse s (avant le départ : dans le prolongement du premier tronçon)
  surChemin(R, s) {
    const P = R.pts, c = R.cum;
    if (P.length < 2) return P[0].slice();
    if (s <= 0) { const dx = P[1][0] - P[0][0], dz = P[1][1] - P[0][1], L = Math.hypot(dx, dz) || 1; return [P[0][0] + dx / L * s, P[0][1] + dz / L * s]; }
    let k = 1;
    while (k < P.length - 1 && c[k] < s) k++;
    const L = c[k] - c[k - 1] || 1, t = clamp((s - c[k - 1]) / L, 0, 1.5);
    return [lerp(P[k - 1][0], P[k][0], t), lerp(P[k - 1][1], P[k][1], t)];
  },
  demarrer(D, o, de, L) {
    const p = game.player, w = game.world;
    if (game.sleeping || game.dying || (typeof cine !== 'undefined' && cine.on) || p.underground) return false;
    if (typeof mondes !== 'undefined' && mondes.actuel && mondes.actuel()) return false;
    if (Math.hypot(p.pos[0] - L.x, p.pos[2] - L.z) > CMD.vu) return false;
    const R = this.route(L);
    if (!R) return false;
    // (T.s : l'abscisse du cheval sur le chemin ; la charrette suit à CMD.attache derrière)
    const T = {
      D, o, de, L, R, spot: this.place(L), etat: 'approche', s: CMD.attache, t: 0, v: 0, phase: 0, roue: 0, sonT: 0, dit: false,
      rig: humanRig(CMD_LOOK), cheval: ANIMAL_RIGS.horse(0),
      car: { x: 0, y: 0, z: 0, r: 0, tilt: [0, 0], roue: 0, data: { hitched: 1, k: 'caisses' } },
      h: { x: 0, y: 0, z: 0, r: 0 }, m: { x: 0, y: 0, z: 0, r: 0, assis: true, porte: true, mv: 0, ph: 0 },
    };
    this.tour = T;
    this.placerAttelage(T, T.R, T.s);
    return true;
  },
  // le cheval à l'abscisse sh, la charrette derrière lui sur le même chemin
  placerAttelage(T, R, sh) {
    const w = game.world, H = this.surChemin(R, sh), Cc = this.surChemin(R, sh - CMD.attache);
    const a = this.surChemin(R, sh - 0.8), b = this.surChemin(R, sh + 0.8);
    const hh = Math.atan2(b[0] - a[0], b[1] - a[1]), rc = Math.atan2(H[0] - Cc[0], H[1] - Cc[1]);
    const yh = w.groundAt(H[0], H[1], w.heightAt(H[0], H[1]) + 0.8, 0.8), yc = w.groundAt(Cc[0], Cc[1], w.heightAt(Cc[0], Cc[1]) + 0.8, 0.8);
    const c = T.car, h = T.h;
    const av = (Cc[0] - c.x) * Math.sin(rc) + (Cc[1] - c.z) * Math.cos(rc);
    if (c.x || c.z) c.roue = ((c.roue || 0) + av / 0.5) % TAU;
    c.x = Cc[0]; c.z = Cc[1]; c.y = yc; c.r = rc;
    const rx = Math.cos(rc), rz = -Math.sin(rc);
    const yR = w.groundAt(Cc[0] + rx * 0.86, Cc[1] + rz * 0.86, yc + 0.8, 0.8), yL = w.groundAt(Cc[0] - rx * 0.86, Cc[1] - rz * 0.86, yc + 0.8, 0.8);
    c.tilt = [-clamp(Math.atan2(yh - yc, CMD.attache), -0.5, 0.5), clamp(Math.atan2(yR - yL, 1.72), -0.4, 0.4)];
    h.x = H[0]; h.z = H[1]; h.y = yh; h.r = hh;
  },
  // la place du cocher (repère de la charrette) et le pied de la charrette, côté droit
  siege(T) {
    const c = T.car, s = Math.sin(c.r), k = Math.cos(c.r);
    return { x: c.x + k * 0.3 + s * 0.9, z: c.z - s * 0.3 + k * 0.9 };
  },
  pied(T) {
    const c = T.car, s = Math.sin(c.r), k = Math.cos(c.r);
    return { x: c.x + k * 1.25 + s * 0.6, z: c.z - s * 1.25 + k * 0.6 };
  },
  // le voiturier : approche, descend, porte le colis, remonte, fait demi-tour, repart
  animer(dt) {
    const T = this.tour, w = game.world, p = game.player;
    if (!T) return;
    const dp = Math.hypot(T.car.x - p.pos[0], T.car.z - p.pos[2]);
    // on ne le voit plus (trop loin, endormi, ailleurs) : il a fini sa tournée
    if (game.sleeping || game.dying || (typeof cine !== 'undefined' && cine.on) || (typeof mondes !== 'undefined' && mondes.actuel && mondes.actuel()) || dp > CMD.loin) { this.finir(); return; }
    T.t += dt;
    const m = T.m;
    const bouge = (v) => { T.phase += dt * v * 2.6; };
    const sabots = (v) => {
      T.sonT -= dt * Math.max(0.3, v);
      if (T.sonT <= 0) {
        T.sonT = 1.05;
        const d = Math.hypot(T.h.x - p.pos[0], T.h.z - p.pos[2]);
        if (d < 40 && sound.ok) { sound.hoof && sound.hoof(w.matAt && w.matAt(T.h.x, T.h.z) >= 8 ? 'hard' : 'soft', v); if (Math.random() < 0.25 && sound.noiseHit && sound.ctx) sound.noiseHit(sound.ctx.currentTime + 0.01, 0.08, 'lowpass', 500, 0.8, 0.04 * (1 - d / 40), null); }
      }
    };
    if (T.etat === 'approche') {
      const reste = T.R.fin - T.s;
      T.v = Math.min(CMD.vitesse, 0.5 + reste * 0.35, T.v + dt * 1.2);
      T.s = Math.min(T.R.fin, T.s + T.v * dt);
      this.placerAttelage(T, T.R, T.s);
      bouge(T.v); sabots(T.v);
      if (!T.hennit && Math.hypot(T.h.x - p.pos[0], T.h.z - p.pos[2]) < 45) {
        T.hennit = true;
        if (Math.random() < 0.6) sound.animal && sound.animal('horse', 0, 0.8);
        if (T.L.k === 'ferme' && farm.s.dog && farm.s.dog.alive && sound.bark) { sound.bark(0.8, 0); setTimeout(() => sound.bark && sound.bark(0.7, 0), 380); }
      }
      if (T.s >= T.R.fin - 0.01) { T.etat = 'descend'; T.t = 0; T.v = 0; }
    } else if (T.etat === 'descend' || T.etat === 'monte') {
      const k = clamp(T.t / 0.7, 0, 1), S = this.siege(T), P = this.pied(T), a = T.etat === 'descend' ? k : 1 - k;
      m.assis = a < 0.5;
      m.x = lerp(S.x, P.x, a); m.z = lerp(S.z, P.z, a); m.r = T.car.r + (a > 0.5 ? Math.PI / 2 : 0);
      m.y = lerp(T.car.y + 0.64, w.groundAt(P.x, P.z, T.car.y + 0.8, 0.8), a);
      if (k >= 1) {
        if (T.etat === 'descend') { T.etat = 'va'; m.assis = false; }
        else { T.etat = 'demi'; T.r0 = T.car.r; m.assis = true; }
        T.t = 0;
      }
    } else if (T.etat === 'va' || T.etat === 'revient') {
      const cible = T.etat === 'va' ? { x: T.spot[0], z: T.spot[1] } : this.pied(T);
      const dx = cible.x - m.x, dz = cible.z - m.z, d = Math.hypot(dx, dz);
      // (il s'arrête devant l'endroit, le colis à ses pieds)
      if (d < (T.etat === 'va' ? 0.55 : 0.35)) { T.t = 0; if (T.etat === 'va') { T.etat = 'pose'; m.r = Math.atan2(dx, dz); } else { T.etat = 'monte'; } m.mv = 0; }
      else {
        const st = Math.min(d, CMD.pas * dt);
        m.x += dx / d * st; m.z += dz / d * st;
        m.r = Math.atan2(dx, dz); m.mv = 1; m.ph += dt * 6.2;
        m.y = w.groundAt(m.x, m.z, m.y + 0.6, 0.6);
      }
    } else if (T.etat === 'pose') {
      m.mv = 0;
      if (m.porte && T.t > 0.55) {
        m.porte = false;
        this.arrivee(T.D, T.o, T.de, T.L, true, T.spot);
        sound.place && sound.place();
        if (!T.dit && Math.hypot(m.x - p.pos[0], m.z - p.pos[2]) < 10 && Math.random() < 0.75) { T.dit = true; this.dire(this.replique()); }
      }
      if (T.t > 1.1) { T.etat = 'revient'; T.t = 0; }
    } else if (T.etat === 'demi') {
      // demi-tour sur place, le cheval tourne autour de la charrette
      const k = clamp(T.t / 4, 0, 1), e = k * k * (3 - 2 * k), c = T.car;
      c.r = T.r0 + Math.PI * e;
      c.tilt = [0, 0];
      T.h.r = c.r + Math.PI / 2 * Math.sin(Math.PI * k) * 0.8;
      T.h.x = c.x + Math.sin(c.r) * CMD.attache; T.h.z = c.z + Math.cos(c.r) * CMD.attache;
      T.h.y = w.groundAt(T.h.x, T.h.z, w.heightAt(T.h.x, T.h.z) + 0.8, 0.8);
      const S = this.siege(T); m.x = S.x; m.z = S.z; m.y = c.y + 0.64; m.r = c.r;
      bouge(1.1); sabots(0.8);
      if (k >= 1) {
        // le chemin du retour : depuis la charrette, en sens inverse
        const R = T.R, sc = R.fin - CMD.attache, pts = [[c.x, c.z]];
        for (let i = R.pts.length - 1; i >= 0; i--) if (R.cum[i] < sc - 0.5) pts.push(R.pts[i]);
        if (pts.length < 2) { this.finir(); return; }
        const cum = [0];
        for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
        T.R2 = { pts, cum, fin: cum[cum.length - 1] };
        T.s = CMD.attache; T.v = 0.5; T.etat = 'repart'; T.t = 0;
      }
    } else if (T.etat === 'repart') {
      T.v = Math.min(CMD.vitesse * 1.1, T.v + dt * 0.8);
      T.s += T.v * dt;
      this.placerAttelage(T, T.R2, T.s);
      const S = this.siege(T); m.x = S.x; m.z = S.z; m.y = T.car.y + 0.64; m.r = T.car.r;
      bouge(T.v); sabots(T.v);
      if (T.s >= T.R2.fin) { this.finir(); return; }
    }
    if (m.assis && T.etat !== 'descend' && T.etat !== 'monte') { const S = this.siege(T); m.x = S.x; m.z = S.z; m.y = T.car.y + 0.64; m.r = T.car.r; }
  },
  // la tournée s'achève d'un coup (on ne regarde plus) : le colis est posé s'il ne l'était pas
  finir() {
    const T = this.tour;
    this.tour = null;
    if (T && T.m.porte) { T.m.porte = false; this.arrivee(T.D, T.o, T.de, T.L, false, T.spot); }
  },
  dire(t) { ui.subtitle('Le voiturier', t, 3.2); },
  // ce qu'il dit en posant le colis (le temps qu'il fait ; certains matins, autre chose)
  replique() {
    try {
      if (typeof strange !== 'undefined') {
        if (strange.wasRedNight && strange.wasRedNight() && Math.random() < 0.6) return pick(CMD_DIT.rouge);
        if (strange.killerActive && strange.killerActive() && Math.random() < 0.5) return pick(CMD_DIT.tueur);
      }
    } catch (e) { /* le temps qu'il fait */ }
    return weather.cur && weather.cur.rain > 0.35 ? pick(CMD_DIT.pluie) : pick(CMD_DIT.pose);
  },
  parler() {
    const T = this.tour;
    if (!T) return;
    this.dire(pick(CMD_DIT.parler));
  },

  // ================================================================== le rendu
  dessiner(buf, sbuf, cam, t) {
    if (!farm.s || !farm.s.commandes) return;
    const C = farm.s.commandes;
    const hi = typeof game !== 'undefined' && game.target && game.target.cmdColis;
    for (const k of C.colis) {
      const dx = k.x - cam[0], dz = k.z - cam[2];
      if (dx * dx + dz * dz > 110 * 110) continue;
      PE.buf = buf; PE.fl = hi === k ? FX_HI : 0;
      PE.frame(k.x, k.y, k.z, k.r || 0, 1);
      this.modeleColis(k.gros, k.ouvert);
      PE.fl = 0;
      if (sbuf) drawShadow(sbuf, k.x, k.y, k.z, k.gros ? 0.5 : 0.36);
    }
    const T = this.tour;
    if (!T) return;
    const c = T.car, h = T.h, m = T.m;
    // la charrette (le modèle de l'attelage), chargée de caisses, et le coffre du cocher
    PE.buf = buf; PE.fl = 0;
    PE.frame(c.x, c.y, c.z, c.r, 1);
    c.roue = c.roue || 0;
    PROP_MODELS.charrette(PE, c);
    PE.bx(0, 0.87, 0.95, 1.1, 0.28, 0.36, WHITE, TL.darkwood);
    const M = PE.M.slice ? new Float32Array(PE.M) : PE.M;
    // le cheval, son collier, les traits
    poseQuad(T.cheval, { move: T.etat === 'approche' || T.etat === 'repart' ? clamp(T.v / 2, 0.3, 1) : T.etat === 'demi' ? 0.7 : 0, phase: T.phase, t, graze: T.etat === 'pose' || T.etat === 'va' || T.etat === 'revient' ? 0.3 : 0 });
    drawRig(buf, T.cheval, h.x, h.y, h.z, h.r, 1, 0);
    if (sbuf) { drawShadow(sbuf, h.x, h.y, h.z, 0.6); drawShadow(sbuf, c.x, c.y, c.z, 0.95); }
    PE.frame(h.x, h.y, h.z, h.r, 1);
    const cuir = rgbf('#4a3020'), corde = rgbf('#8a6a44');
    PE.box(0, 1.5, 0.7, 0.62, 0.52, 0.16, cuir, TL.leather, 0, -0.45);
    PE.box(0, 1.2, 0.15, 0.66, 0.1, 0.12, cuir, TL.leather);
    const W = (A, lx, ly, lz) => [A[0] * lx + A[1] * ly + A[2] * lz + A[3], A[4] * lx + A[5] * ly + A[6] * lz + A[7], A[8] * lx + A[9] * ly + A[10] * lz + A[11]];
    const Hm = this._H || (this._H = new Float32Array(12));
    m34Root(Hm, h.x, h.y, h.z, h.r, 1);
    for (const sg of [-1, 1]) this.ligne(W(M, sg * 0.5, 0.74, 3.3), W(Hm, sg * 0.32, 1.42, 0.62), 0.035, corde);
    // l'homme : assis sur le coffre, ou à pied (le colis dans les bras)
    const rig = T.rig;
    if (m.assis) {
      poseHuman(rig, { sit: true, t, lookY: 0 });
      const Lm = this._L || (this._L = new Float32Array(12)), Om = this._O || (this._O = new Float32Array(12));
      m34TR(Lm, 0.3, 0.6, 0.95, 0, 0, 0);
      m34Mul(Om, M, Lm);
      drawRigM(buf, rig, Om, 0);
    } else {
      poseHuman(rig, { move: m.mv, phase: m.ph, t, reach: m.porte ? 0.01 : 0, lean: T.etat === 'pose' ? 0.5 : 0 });
      drawRig(buf, rig, m.x, m.y, m.z, m.r, 1, 0);
      if (sbuf) drawShadow(sbuf, m.x, m.y, m.z, 0.33);
      if (m.porte) { PE.frame(m.x, m.y, m.z, m.r, 1); PE.box(0, T.etat === 'pose' ? 0.72 : 1.18, 0.5, 0.52, 0.34, 0.4, rgbf('#b08a58'), TL.plain); }
    }
  },
  ligne(a, b, ep, col) {
    const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dx, dy, dz);
    if (L < 0.01) return;
    PE.frame((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, Math.atan2(dx, dz), 1);
    PE.box(0, 0, 0, ep, ep, L, col, TL.rope, 0, -Math.atan2(dy, Math.hypot(dx, dz)));
  },
  // le colis : papier kraft et ficelle (une caisse, s'il est gros) ; ouvert, la ficelle pend et le papier bâille
  modeleColis(gros, ouvert) {
    const papier = rgbf('#a88050'), ficelle = rgbf('#ece2c8'), eti = rgbf('#efe6d0');
    if (gros) {
      PE.bx(0, 0, 0, 0.86, 0.56, 0.62, WHITE, mt(M_CRATE));
      PE.bx(0, 0.56, 0, 0.9, 0.04, 0.66, WHITE, TL.wood);
      PE.bx(0.2, 0.3, 0.313, 0.24, 0.14, 0.01, eti, TL.paper);
      if (ouvert) PE.box(0.05, 0.64, -0.2, 0.88, 0.04, 0.3, WHITE, TL.wood, 0.3, 0.5);
      return;
    }
    const X = 0.66, Y = 0.4, Z = 0.48;
    if (ouvert) {
      PE.bx(0, 0, 0, X, Y - 0.04, Z, papier, TL.plain);
      PE.box(-X / 4 - 0.02, Y, 0, X / 2, 0.02, Z + 0.02, papier, TL.plain, 0, 0, 0.9);
      PE.box(X / 4 + 0.02, Y, 0, X / 2, 0.02, Z + 0.02, papier, TL.plain, 0, 0, -0.9);
      PE.bx(X / 2 + 0.16, 0, 0.14, 0.34, 0.014, 0.035, ficelle, TL.plain, 0.6);
      PE.bx(-X / 2 - 0.1, 0, -0.2, 0.22, 0.014, 0.035, ficelle, TL.plain, -0.4);
      return;
    }
    PE.bx(0, 0, 0, X, Y, Z, papier, TL.plain);
    PE.bx(0, -0.01, 0, X + 0.024, Y + 0.022, 0.04, ficelle, TL.plain);
    PE.bx(0, -0.01, 0, 0.04, Y + 0.022, Z + 0.024, ficelle, TL.plain);
    PE.bx(0, Y, 0, 0.09, 0.035, 0.09, ficelle, TL.plain);
    PE.bx(0.17, Y + 0.004, 0.12, 0.18, 0.008, 0.12, eti, TL.paper);
  },

  // ================================================================== le carnet (panneau)
  ouvrir(depuis) {
    if (!farm.s || typeof game === 'undefined' || !game.world || typeof document === 'undefined' || !$('#paper')) return false;
    if (game.dying || game.sleeping || (typeof cine !== 'undefined' && cine.on)) return false;
    this.depuis = depuis || 'main';
    this.encart = false;
    this.style();
    if (!$('#commandes')) { const d = document.createElement('div'); d.id = 'commandes'; d.className = 'pp-panel'; $('#paper').appendChild(d); }
    const E = this.etals().filter((e) => !e.refus);
    if (!this.sel || !E.some((e) => e.cle === this.sel)) this.sel = E.length ? E[0].cle : null;
    ui.open('#commandes', '<div class="tabs"></div><div class="cm-tete"></div><div class="body cm-body"></div><div class="foot cm-pied"></div>');
    this.rendre();
    return true;
  },
  rendre() {
    const el = $('#commandes');
    if (!el || ui.panel !== '#commandes') return;
    const C = this.S(), enCours = C.cmds.filter((c) => c.st === 'attente' || c.st === 'route').length + C.colis.length;
    const tabs = el.querySelector('.tabs');
    tabs.innerHTML = `<b>Carnet de commandes</b><button data-cm-tab="etals" class="${this.onglet === 'etals' ? 'on' : ''}">Commander</button><button data-cm-tab="suivi" class="${this.onglet === 'suivi' ? 'on' : ''}">En cours${enCours ? ` (${enCours})` : ''}</button><button class="x" data-cm-fermer title="Refermer">✕</button>`;
    tabs.querySelectorAll('[data-cm-tab]').forEach((b) => (b.onclick = () => { this.onglet = b.dataset.cmTab; this.encart = false; sound.page && sound.page(); this.rendre(); }));
    tabs.querySelector('[data-cm-fermer]').onclick = () => ui.close();
    el.querySelector('.cm-tete').textContent = 'Roulage Bardin — commissions et messageries. Livré le lendemain matin, à l’endroit convenu. Payable d’avance.';
    const body = el.querySelector('.cm-body'), pied = el.querySelector('.cm-pied');
    const top = body.querySelector('.cm-arts') ? body.querySelector('.cm-arts').scrollTop : 0, topE = body.querySelector('.cm-etals') ? body.querySelector('.cm-etals').scrollTop : 0;
    if (this.onglet === 'suivi') { body.classList.add('cm-un'); body.innerHTML = this.htmlSuivi(); pied.innerHTML = this.htmlPied(true); }
    else { body.classList.remove('cm-un'); body.innerHTML = this.htmlEtals(); pied.innerHTML = this.htmlPied(false); }
    const a = body.querySelector('.cm-arts'), e = body.querySelector('.cm-etals');
    if (a) a.scrollTop = top;
    if (e) e.scrollTop = topE;
    this.brancher();
  },
  htmlEtals() {
    const L = this.etals(), E = L.find((x) => x.cle === this.sel && !x.refus) || null;
    const nb = (cle) => { let k = 0; for (const [key, n] of this.panier) if (key.startsWith(cle + '|')) k += n; return k; };
    const liste = L.map((x) => {
      const sous = x.n.d.role ? `${x.n.name}, ${x.n.d.role.toLowerCase()}` : x.n.name;
      if (x.refus) return `<div class="cm-etal non${x.refus === 'mort' ? ' mort' : ''}"><b>${esc(x.nom)}</b><small>${esc(x.refus === 'mort' ? `${sous} — †` : `${sous} — ne prend pas vos commandes`)}</small></div>`;
      const k = nb(x.cle);
      return `<button class="cm-etal${E === x ? ' on' : ''}" data-cm-etal="${esc(x.cle)}"><b>${esc(x.nom)}</b><small>${esc(sous)}</small>${k ? `<i>${k}</i>` : ''}</button>`;
    }).join('');
    let droite;
    if (!L.length) droite = '<p class="cm-vide">Aucun étal pour l’instant : il faut d’abord avoir fait connaissance des marchands.</p>';
    else if (!E) droite = '<p class="cm-vide">Choisissez un étal.</p>';
    else {
      const arts = this.articles(E);
      droite = `<h4>${esc(E.nom)}</h4>` + (arts.map((a) => {
        const q = this.panier.get(this.cleP(E, a.id)) || 0, max = this.maxArticle(a.id);
        return `<div class="cm-art${q ? ' pris' : ''}" title="${esc(typeof butin !== 'undefined' ? butin.description(a.id) : '')}"><img src="${iconURL(a.id)}" alt=""><span class="cm-nom">${esc(itemName(a.id))}${max === 0 ? ' <small>(déjà à vous)</small>' : ''}</span><span class="cm-prix">${a.prix}</span><button class="cm-pm" data-cm-moins="${esc(a.id)}" ${q ? '' : 'disabled'} title="Un de moins">−</button><b class="cm-q">${q || ''}</b><button class="cm-pm" data-cm-plus="${esc(a.id)}" ${q < max ? '' : 'disabled'} title="Un de plus">+</button></div>`;
      }).join('') || '<p class="cm-vide">Rien à commander aujourd’hui.</p>');
    }
    return `<div class="cm-etals">${liste || ''}</div><div class="cm-arts">${droite}</div>`;
  },
  htmlPied(suivi) {
    const C = this.S(), s = farm.s, L = this.lignes(), Lx = this.lieu(), K = this.compte(L, Lx);
    const point = `<span class="cm-livrer">Livraison : <button class="cm-point" data-cm-point>${esc(Lx.nom)} ▾</button></span>`;
    if (suivi) return `<div class="cm-l">${point}<span class="cm-bourse">Bourse : ${s.money} pièces</span></div>`;
    const bon = L.length
      ? `Bon : ${K.n > 1 ? `${K.n} articles` : 'un article'}, ${K.etals > 1 ? `${K.etals} étals` : 'un étal'} — marchandise ${K.marchandise}, port ${K.port} — <b>total ${K.total} pièces</b>`
      : 'Le bon est vide. Choisissez un étal, puis ce que vous voulez recevoir.';
    const manque = L.length && s.money < K.total ? `<span class="cm-manque">Il vous manque ${K.total - s.money} pièces.</span>` : '';
    return `<div class="cm-l cm-bon">${bon}</div>
      <div class="cm-l">${point}<span class="cm-bourse">Bourse : ${s.money} pièces</span>${manque}
      <span class="cm-actions"><button class="cm-b sec" data-cm-effacer ${L.length ? '' : 'disabled'}>Effacer</button><button class="cm-b" data-cm-envoyer ${L.length && s.money >= K.total ? '' : 'disabled'}>Envoyer la commande</button></span></div>
      ${this.encart ? this.htmlEncart() : ''}`;
  },
  htmlSuivi() {
    const C = this.S(), s = farm.s, out = [];
    const cours = C.cmds.filter((c) => c.st === 'attente' || c.st === 'route');
    for (const c of cours) {
      const quand = c.st === 'route' ? 'En route.' : c.due <= s.day ? 'Ce matin.' : c.due === s.day + 1 ? 'Demain matin.' : `Le ${this.jour(c.due)}, au matin.`;
      const peut = c.st === 'attente' && s.day < c.due;
      out.push(`<div class="cm-suivi"><b>Commande du ${esc(this.jour(c.j))}</b> <span>— ${esc(this.resume(c.L.map((l) => [l[2], l[3]])))}</span><div>${esc(quand)} ${c.total} pièces, port compris.${peut ? ` <button class="cm-b sec cm-petit" data-cm-rayer="${esc(c.id)}">Rayer</button>` : ''}</div></div>`);
    }
    for (const k of C.colis) {
      const reste = this.resume(k.C.o.filter((e) => e[1] > 0));
      out.push(`<div class="cm-suivi colis"><b>Un colis attend</b> <span>— ${esc(this.ouEst(k))}, depuis le ${esc(this.jour(k.j))}</span><div>${esc(reste || 'Plus grand-chose dedans.')}</div></div>`);
    }
    const passe = C.cmds.filter((c) => c.st === 'livre' || c.st === 'perdu' || c.st === 'raye').slice(-6).reverse();
    if (passe.length) out.push('<h4>Ces derniers jours</h4>' + passe.map((c) => `<div class="cm-suivi fait"><b>Commande du ${esc(this.jour(c.j))}</b> <span>— ${esc(c.st === 'livre' ? `livrée le ${this.jour(c.fin || c.due)}` : c.st === 'perdu' ? 'égarée en route' : 'rayée')}</span></div>`).join(''));
    return out.join('') || '<p class="cm-vide">Rien en cours.</p>';
  },
  // où est un colis, en mots
  ouEst(k) {
    const w = game.world, F = this.devant(w.bld.ferme);
    if (Math.hypot(k.x - F.x, k.z - F.z) < 6) return 'devant la ferme';
    if (typeof LOC_MAISONS !== 'undefined') for (const b in LOC_MAISONS) if (w.bld[b]) { const P = this.devant(w.bld[b]); if (Math.hypot(k.x - P.x, k.z - P.z) < 6) return this.nomMaison(b); }
    return this.nomIci(k.x, k.z);
  },
  htmlEncart() {
    const P = this.points();
    this._points = P;
    return `<div class="cm-encart"><b>Où le voiturier doit-il déposer les colis ?</b>${P.map((o, i) => o.non ? `<button class="cm-opt" disabled>${esc(o.nom)} <small>(${esc(o.non)})</small></button>` : `<button class="cm-opt${o.on ? ' on' : ''}" data-cm-opt="${i}">${esc(o.nom)}</button>`).join('')}<button class="cm-b sec" data-cm-encart-x>Fermer</button></div>`;
  },
  brancher() {
    const el = $('#commandes');
    if (!el) return;
    el.querySelectorAll('[data-cm-etal]').forEach((b) => (b.onclick = () => { this.sel = b.dataset.cmEtal; sound.click && sound.click(); this.rendre(); }));
    const E = this.etal(this.sel);
    const k = (e) => (e && e.ctrlKey ? 20 : e && e.shiftKey ? 5 : 1);
    el.querySelectorAll('[data-cm-plus]').forEach((b) => (b.onclick = (e) => { if (!E) return; const id = b.dataset.cmPlus, key = this.cleP(E, id), q = this.panier.get(key) || 0; this.panier.set(key, Math.min(this.maxArticle(id), q + k(e))); sound.click && sound.click(); this.rendre(); }));
    el.querySelectorAll('[data-cm-moins]').forEach((b) => (b.onclick = (e) => { if (!E) return; const key = this.cleP(E, b.dataset.cmMoins), q = (this.panier.get(key) || 0) - k(e); if (q > 0) this.panier.set(key, q); else this.panier.delete(key); sound.click && sound.click(); this.rendre(); }));
    const env = el.querySelector('[data-cm-envoyer]');
    if (env) env.onclick = () => {
      const r = this.commander();
      if (r === 'ok') { this.onglet = 'suivi'; this.rendre(); }
      else if (r === 'pauvre') { sound.click && sound.click(); this.rendre(); }
    };
    const ef = el.querySelector('[data-cm-effacer]');
    if (ef) ef.onclick = () => { this.panier.clear(); sound.page && sound.page(); this.rendre(); };
    el.querySelectorAll('[data-cm-rayer]').forEach((b) => (b.onclick = () => { if (this.rayer(b.dataset.cmRayer)) this.rendre(); }));
    const pt = el.querySelector('[data-cm-point]');
    if (pt) pt.onclick = () => { this.encart = !this.encart; sound.page && sound.page(); this.rendre(); };
    el.querySelectorAll('[data-cm-opt]').forEach((b) => (b.onclick = () => { const o = this._points && this._points[+b.dataset.cmOpt]; if (o && o.pt) this.choisirPoint(o.pt); this.encart = false; sound.click && sound.click(); this.rendre(); }));
    const ex = el.querySelector('[data-cm-encart-x]');
    if (ex) ex.onclick = () => { this.encart = false; this.rendre(); };
  },
  clavier(e) {
    const a = document.activeElement;
    if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA')) return;
    if (e.code === 'Escape' && this.encart) { e.preventDefault(); e.stopImmediatePropagation(); this.encart = false; this.rendre(); return; }
    if (e.code === 'KeyE' && !e.repeat) { e.preventDefault(); this.eFerme = true; ui.close(); }
  },
  style() {
    if (this.styled || typeof document === 'undefined' || !document.head) return;
    this.styled = true;
    const st = document.createElement('style');
    st.id = 'commandes-css';
    st.textContent = `
#commandes { width: min(880px, calc(100vw - 24px)); }
#commandes .cm-tete { padding: 6px 18px 0; font-size: 12px; font-style: italic; color: #7a6a52; letter-spacing: .02em; }
#commandes .cm-body { flex: 1 1 auto; min-height: min(250px, 30vh); display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.35fr); gap: 16px; padding: 10px 16px 8px; }
#commandes .cm-body.cm-un { display: block; max-height: min(460px, 56vh); }
#commandes .cm-etals, #commandes .cm-arts { max-height: min(420px, 50vh); overflow-y: auto; scrollbar-width: thin; }
#commandes .cm-etals { display: flex; flex-direction: column; gap: 4px; padding-right: 2px; }
#commandes .cm-etal { position: relative; display: block; width: 100%; text-align: left; padding: 6px 30px 6px 9px; background: rgba(255,255,255,.3); border: 1px solid rgba(90,70,40,.22); border-radius: 4px; color: #33291d; font: inherit; cursor: pointer; }
#commandes .cm-etal b { display: block; font-weight: normal; font-size: 15px; line-height: 1.2; }
#commandes .cm-etal small { color: #7a6a52; font-style: italic; font-size: 12px; }
#commandes .cm-etal:hover:not(.non) { background: rgba(255,240,200,.75); }
#commandes .cm-etal.on { border-color: #8a5a2a; background: rgba(255,228,165,.7); box-shadow: inset 3px 0 0 #8a5a2a; }
#commandes .cm-etal i { position: absolute; right: 8px; top: 9px; font-style: normal; font-size: 12px; background: #8a5a2a; color: #f4ead2; border-radius: 8px; padding: 0 6px; }
#commandes .cm-etal.non { opacity: .55; cursor: default; }
#commandes .cm-etal.mort b { text-decoration: line-through; }
#commandes .cm-arts h4 { margin-top: 2px; }
#commandes .cm-art { display: flex; align-items: center; gap: 7px; padding: 3px 4px; border-bottom: 1px dotted rgba(90,70,40,.25); }
#commandes .cm-art.pris { background: rgba(255,228,165,.35); }
#commandes .cm-art img { width: 28px; height: 28px; image-rendering: pixelated; flex: none; }
#commandes .cm-nom { flex: 1; font-size: 14px; line-height: 1.2; }
#commandes .cm-nom small { color: #7a6a52; font-style: italic; }
#commandes .cm-prix { color: #7a4a1a; min-width: 40px; text-align: right; font-size: 14px; }
#commandes .cm-q { min-width: 22px; text-align: center; font-weight: normal; font-size: 15px; }
#commandes .cm-pm { width: 24px; height: 24px; padding: 0; border: 1px solid rgba(90,70,40,.4); background: rgba(255,255,255,.45); border-radius: 3px; color: #3d2e1c; cursor: pointer; font: 15px Georgia, serif; line-height: 1; }
#commandes .cm-pm:disabled { opacity: .3; cursor: default; }
#commandes .cm-vide { font-style: italic; color: #7a6a52; margin: 10px 2px; }
#commandes .cm-pied { position: relative; right: auto; bottom: auto; display: flex; flex-direction: column; gap: 6px; }
#commandes .cm-l { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
#commandes .cm-bon { color: #4a3a22; }
#commandes .cm-bon b { font-weight: normal; color: #7a4a1a; }
#commandes .cm-bourse { color: #6a5436; }
#commandes .cm-manque { color: #9a3a2a; font-style: italic; }
#commandes .cm-actions { margin-left: auto; display: flex; gap: 8px; }
#commandes .cm-point { padding: 2px 8px; background: rgba(255,255,255,.45); border: 1px solid rgba(90,70,40,.4); border-radius: 3px; color: #3d2e1c; font: 14px Georgia, serif; cursor: pointer; }
#commandes .cm-b { padding: 5px 13px; background: #8a5a2a; color: #f4ead2; border: 1px solid #7a4a1a; border-radius: 3px; font: 14px Georgia, 'Times New Roman', serif; cursor: pointer; }
#commandes .cm-b.sec { background: rgba(255,255,255,.4); color: #3d2e1c; border-color: rgba(90,70,40,.4); }
#commandes .cm-b:disabled { opacity: .45; cursor: default; }
#commandes .cm-b.cm-petit { padding: 1px 9px; font-size: 12px; margin-left: 6px; }
#commandes .cm-suivi { padding: 6px 0; border-bottom: 1px dashed rgba(90,70,40,.22); font-size: 14px; }
#commandes .cm-suivi span { color: #7a6a52; font-style: italic; }
#commandes .cm-suivi div { color: #5a4a36; font-size: 13px; margin-top: 2px; }
#commandes .cm-suivi.fait { opacity: .6; }
#commandes .cm-encart { position: absolute; left: 14px; bottom: calc(100% + 6px); width: min(420px, calc(100% - 28px)); z-index: 4; display: flex; flex-direction: column; gap: 5px; background: #efe6cf; border: 1px solid rgba(90,70,40,.45); border-radius: 4px; box-shadow: 0 12px 34px rgba(0,0,0,.45), inset 0 0 34px rgba(120,90,40,.18); padding: 12px 14px; }
#commandes .cm-encart > b { font-weight: normal; font-size: 15px; color: #3d2e1c; margin-bottom: 3px; }
#commandes .cm-opt { text-align: left; padding: 6px 9px; background: rgba(255,255,255,.35); border: 1px solid rgba(90,70,40,.25); border-radius: 3px; color: #33291d; font: 14px Georgia, serif; cursor: pointer; }
#commandes .cm-opt.on { border-color: #8a5a2a; background: rgba(255,228,165,.7); box-shadow: inset 3px 0 0 #8a5a2a; }
#commandes .cm-opt small { color: #7a6a52; font-style: italic; }
#commandes .cm-opt:disabled { opacity: .55; cursor: default; }
#commandes .cm-encart .cm-b { align-self: flex-end; margin-top: 3px; }
#store .cm-du-coffre { margin-bottom: 8px; }
@media (max-width: 620px), (max-height: 420px) {
  #commandes .cm-body { grid-template-columns: 1fr; gap: 8px; min-height: 0; overflow-y: auto; }
  #commandes .cm-etals, #commandes .cm-arts { max-height: none; overflow: visible; }
  #commandes .cm-tete { display: none; }
  #commandes .cm-actions { margin-left: 0; }
}
`;
    document.head.appendChild(st);
  },

  // ================================================================== chaque image, chaque matin
  update(dt) {
    if (this.tour) { try { this.animer(dt); } catch (e) { console.error('voiturier', e); this.finir(); } }
    this.verifT -= dt;
    if (this.verifT > 0) return;
    this.verifT = 1;
    try { this.verifier(); } catch (e) { console.error('commandes', e); }
  },
  matin() {
    if (!farm.s) return;
    try { this.remettreCarnet(); this.menage(); } catch (e) { console.error('commandes', e); }
  },
};

// ---------------------------------------------------------------- branchements
// le carnet en main : un clic l'ouvre
HOOKS.primary.push((eye, basis, held, it, id) => {
  if (id !== 'carnet_commandes') return false;
  if (!held) { commandes.ouvrir('main'); play.cool = 0.4; }
  return true;
});
// E : ouvrir un colis ; parler au voiturier
HOOKS.target.push((eye, f, cand) => {
  if (!farm.s || !farm.s.commandes) return;
  for (const k of farm.s.commandes.colis) {
    const dx = k.x - eye[0], dy = k.y + 0.25 - eye[1], dz = k.z - eye[2], d = Math.hypot(dx, dy, dz);
    if (d > 2.7) continue;
    const cos = (dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1);
    if (cos < 0.72) continue;
    cand({ kind: 'hook', f2lab: 'Ouvrir le colis', cmdColis: k, use: () => commandes.ouvrirColis(k) }, d * (1.6 - cos * 0.6));
  }
  const T = commandes.tour;
  if (T) {
    const m = T.m, dx = m.x - eye[0], dy = m.y + 1.3 - eye[1], dz = m.z - eye[2], d = Math.hypot(dx, dy, dz);
    if (d < 2.9) {
      const cos = (dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1);
      if (cos > 0.8) cand({ kind: 'hook', f2lab: 'Parler au voiturier', use: () => commandes.parler() }, d * (1.6 - cos * 0.6) + 0.1);
    }
  }
});
HOOKS.update.push((dt) => { if (farm.s && typeof game !== 'undefined' && game.world) commandes.update(dt); });
HOOKS.draw.push((buf, sbuf, cam, t) => { try { commandes.dessiner(buf, sbuf, cam, t); } catch (e) { console.error('commandes', e); commandes.finir(); } });
HOOKS.day.push(() => commandes.matin());
HOOKS.death.push(() => { try { commandes.finir(); } catch (e) { commandes.tour = null; } commandes.encart = false; return false; });
HOOKS.load.push(() => {
  commandes.tour = null; commandes.panier.clear(); commandes.encart = false; commandes.onglet = 'etals'; commandes.eFerme = false; commandes.verifT = 1.5;
  if (!farm.s || !game.world) return;
  const C = commandes.S();
  // le carnet, une fois, dans le coffre de la ferme (parties neuves et anciennes)
  if (!C.pose) { C.pose = true; commandes.remettreCarnet(); }
  // (le voiturier était en route à l'enregistrement : il repassera)
  for (const c of C.cmds) if (c.st === 'route') c.st = 'attente';
  if (commandes.branche) return;
  commandes.branche = true;
  // dans un coffre où l'on a rangé le carnet : de quoi l'ouvrir sans le prendre
  const _rs = ui.renderStore.bind(ui);
  ui.renderStore = function () {
    const r = _rs();
    try {
      const S = this.store;
      if (S && S.mode === 'chest' && S.store && S.store.carnet_commandes > 0) {
        const col = $('#store .body > div');
        const h = col && col.querySelector('h4');
        if (h && !col.querySelector('.cm-du-coffre')) {
          const b = document.createElement('button');
          b.className = 'row cm-du-coffre';
          b.innerHTML = `<img src="${iconURL('carnet_commandes')}" alt=""><span>${esc(itemName('carnet_commandes'))}</span><i>Ouvrir</i>`;
          b.onclick = () => commandes.ouvrir('coffre');
          h.insertAdjacentElement('afterend', b);
        }
      }
    } catch (e) { console.error('commandes', e); }
    return r;
  };
  // un panneau refermé : l'encart du point de livraison aussi
  const _close = ui.close.bind(ui);
  ui.close = function (silent) { const was = this.panel, r = _close(silent); if (was === '#commandes') commandes.encart = false; return r; };
});
// le clavier : E referme le carnet (et ne rouvre rien en se relevant) ; Échap ferme d'abord l'encart
window.addEventListener('keydown', (e) => {
  try { if (typeof ui !== 'undefined' && ui.panel === '#commandes') commandes.clavier(e); } catch (err) { console.error('commandes', err); }
}, true);
window.addEventListener('keyup', (e) => {
  if (e.code === 'KeyE' && commandes.eFerme) { commandes.eFerme = false; if (typeof game !== 'undefined') game.holdDone = true; }
}, true);
