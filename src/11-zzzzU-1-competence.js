// ============================================================================
//  LA COMPÉTENCE DE CROCHETAGE (agent U, vague 14) — s'accroche à 11-zzz97-crochetage.js sans y toucher
//  - La main s'exerce : chaque goupille calée, chaque serrure ouverte (moins quand c'est la même le même jour), un
//    peu chaque échec ; un cambriolage mené sans réveiller personne ; les papiers des doubles fonds ; les livres que
//    d'autres inscrivent dans crochetage.livres (lus jusqu'au bout) ; le vieux cadenas (en main, clic), chez soi,
//    jusqu'à « une main sûre » seulement. Six paliers (U_PALIERS) : la ligne dorée s'élargit, les goupilles courent
//    moins vite, retombent et cassent moins, les gestes font moins de bruit, les pas aussi.
//  - Des serrures plus dures : la serrure à secret (6 : « une main de serrurier » et des crochets fins, ou « une
//    main de rossignol »), la serrure de coffre (7 : « une main de rossignol » et des crochets fins). Une maison
//    cambriolée se garde : sa porte prend un verrou de plus pour trois jours.
//  - Les crochets fins (colporteur, à qui a la main de serrurier) complètent un jeu ordinaire ; les chaussons de
//    lisière (colporteuse) étouffent les pas ; le vieux cadenas (forgeron, colporteur).
//  État : farm.s.crochetage = { v, pts, annonce, lus: {id: jour}, papiers: {id: 1}, jour, serrures: {clé: 1},
//         df: {meuble: {vu}}, maisons: {bld: {j, vu}}, plaintes: {pnj: {j, k}}, stats… } (le cambriolage y range
//         aussi ses compteurs : nuits, reveils, reconnu, butin).
//  API (sur l'objet crochetage) : niveau(), palier(), gagner(pts, source), U(), livres (registre id → 1..3),
//        nomMain(), tenable(d) ; et le cambriolage (11-zzzzU-2) : crochetage.cambriolage.
// ============================================================================

// ---------------------------------------------------------------- deux serrures de plus (tables de 11-zzz97)
for (const d of [6, 7]) {
  const S = U_SERRURES[d];
  if (CROC_PINS.length >= d) continue;
  CROC_PINS.push(S.pins); CROC_ZONE.push(S.zone); CROC_VIT.push(S.vit); CROC_CASSE.push(S.casse); CROC_SERRURE.push(S.nom);
}

// ---------------------------------------------------------------- les papiers des doubles fonds (fouilles : onglet Lettres)
Object.assign(F2_PAPIERS, {
  u_serrurier_1: { pool: 'u_secret', t: 'Feuillet arraché d’un carnet', x: 'D’une écriture serrée, au crayon gras :\n\n« Ne pas forcer. La goupille qui cède, on la sent dans le poignet avant de l’entendre. Garder la tension, toujours, même quand le crochet glisse : ce qui est monté reste monté.\n\nLes portes neuves sont les plus bavardes. Les vieilles serrures ont tout dit depuis longtemps. »' },
  u_serrurier_2: { pool: 'u_secret', t: 'Lettre à un frère', x: 'Mon frère,\n\nTu demandais comment on entre chez les gens sans les réveiller. On n’entre pas : on attend. Les vieux dorment mal, les ivrognes dorment bien, et personne ne dort à quatre heures du matin, quoi qu’il dise. Le plein de la nuit, c’est entre minuit et trois heures.\n\nNe cours jamais dans une maison. Et ne t’y attarde pas : le sommeil des autres s’use, comme le reste.', s: 'Ton frère, qui ne signe plus' },
  u_serrurier_3: { pool: 'u_secret', t: 'Une liste de maisons', x: 'Une colonne de noms de maisons de la vallée, d’une encre qui a pâli. Certains sont barrés d’un trait net, d’autres d’un trait tremblé.\n\nEn face de l’un d’eux, une croix, et ces mots : « réveillée — ne plus y retourner ».\n\nAu bas de la page, plus récent : « Je ne suis pas le seul à entrer la nuit. Il y a des petites mains, aussi. Elles ne prennent pas ce que je prends. »' },
  u_serrurier_4: { pool: 'u_secret', t: 'Reçu d’un cordonnier', x: 'Fourni à M. R., qui travaille la nuit : deux paires de chaussons de lisière, semelle de feutre doublé, sur mesure.\n\nPayé comptant. Le client a demandé qu’on ne lui fasse pas de reçu. On le fait quand même : c’est la règle de la maison.' },
});
for (const id of ['u_serrurier_1', 'u_serrurier_2', 'u_serrurier_3', 'u_serrurier_4']) { const P = F2_PAPIERS[id]; if (P && P.pool) { const L = F2_POOLS[P.pool] || (F2_POOLS[P.pool] = []); if (!L.includes(id)) L.push(id); } }
// ce qu'ils apprennent à la main (à la première lecture)
const U_PAPIERS_PTS = { u_serrurier_1: 8, u_serrurier_2: 6, u_serrurier_3: 2, u_serrurier_4: 2 };

// ---------------------------------------------------------------- où l'on trouve les objets
// (les colporteurs vendent ce qu'il y a dans leur hotte, HOTTES de 11-zzz52-routines.js : le fonds, au prix de leur étal)
function uVendre(id, item, prix, oui) {
  const d = NPC_DATA.find((x) => x.id === id);
  if (!d || !d.shop || !d.shop.sells) return;
  const i = d.shop.sells.findIndex((e) => e[0] === item), H = typeof HOTTES !== 'undefined' && HOTTES[id];
  if (oui === false) { if (i >= 0) d.shop.sells.splice(i, 1); if (H && H.fonds.includes(item)) H.fonds.splice(H.fonds.indexOf(item), 1); return; }
  if (i < 0) d.shop.sells.push([item, prix]);
  if (H && !H.fonds.includes(item)) H.fonds.push(item);
}
uVendre('forgeron', 'cadenas_exercice', 18);
uVendre('colporteur', 'cadenas_exercice', 16);
uVendre('colporteuse', 'chaussons_lisiere', 48);

// ---------------------------------------------------------------- la compétence, sur l'objet crochetage
Object.assign(crochetage, {
  livres: {},      // registre : id de livre → 1, 2 ou 3 (lu jusqu'au bout, il fait progresser la main une fois)
  uT: 0,
  U() {
    const s = farm.s;
    if (!s) return null;
    const S = s.crochetage || (s.crochetage = {});
    if (!S.v) Object.assign(S, { v: 1, pts: 0, annonce: 0, lus: {}, papiers: {}, jour: 0, serrures: {}, df: {}, maisons: {}, plaintes: {}, nuits: 0, reveils: 0, reconnu: 0, butin: 0, exercices: 0 });
    for (const k of ['lus', 'papiers', 'serrures', 'df', 'maisons', 'plaintes']) if (!S[k] || typeof S[k] !== 'object') S[k] = {};
    if (!(S.pts >= 0)) S.pts = 0;
    return S;
  },
  niveau() { const S = this.U(); return S ? U_MODELE.palier(S.pts) : 0; },
  palier() { return U_PALIERS[this.niveau()]; },
  nomMain() { return this.palier().nom; },
  fins() { return farm.s ? farm.count('crochets_fins') > 0 : false; },
  // peut-on tenter une serrure de difficulté d ? (null, 'main' ou 'fins')
  tenable(d) { return U_MODELE.tenable(d, this.niveau(), this.fins()); },
  gagner(pts, source) {
    const S = this.U();
    if (!S || !(pts > 0)) return 0;
    const avant = U_MODELE.palier(S.pts);
    if (source === 'exercice') {
      const max = U_GAINS.exerciceMax;
      if (S.pts >= max) { if (avant <= U_MODELE.palier(max)) penser.une('u_cadenas_fini', '(Ce vieux cadenas n’a plus rien à vous apprendre. Les vraies serrures, si.)', 4); return 0; }
      pts = Math.min(pts * U_GAINS.exercice, max - S.pts);
    }
    S.pts = Math.round((S.pts + pts) * 100) / 100;
    const apres = U_MODELE.palier(S.pts);
    if (apres > avant && apres > (S.annonce || 0)) {
      S.annonce = apres;
      const t = U_PALIER_PENSEE[apres];
      if (t) setTimeout(() => { if (!game.dying && !(typeof cine !== 'undefined' && cine.on)) ui.subtitle('', t, 4.5); }, 1800);
    }
    return pts;
  },
  // les livres inscrits, lus jusqu'au bout (livres.S().fini) ; ceux de la bibliothèque qui parlent de serrures (agent Y :
  // bibliotheque2.serrures()) comptent deux
  lectures() {
    const S = this.U();
    if (!S || typeof livres === 'undefined' || !livres.S) return;
    let F = null;
    try { F = livres.S().fini || {}; } catch (e) { return; }
    const L = Object.assign({}, this.livres);
    try { if (typeof bibliotheque2 !== 'undefined' && bibliotheque2 && typeof bibliotheque2.serrures === 'function') for (const id of bibliotheque2.serrures() || []) if (!(id in L)) L[id] = 2; } catch (e) { /* rien */ }
    for (const id in L) {
      if (!F[id] || S.lus[id]) continue;
      S.lus[id] = farm.s.day;
      this.gagner(clamp(+L[id] || 1, 1, 3) * 6, 'livre');
    }
  },
  // la même serrure le même jour n'apprend presque plus rien
  cleSerrure(J) { return J.o.cle || `${J.o.titre || ''}:${Math.round(J.x)}:${Math.round(J.z)}`; },
});

// ---------------------------------------------------------------- le petit jeu, réglé par la main
{
  // tenter : les serrures 6 et 7 (les tables de 11-zzz97 s'arrêtent à 5 : on passe 5 et l'on garde la vraie)
  const _tenter = crochetage.tenter.bind(crochetage);
  crochetage.tenter = function (o) {
    o = o || {};
    if (this.jeu || !farm.s) return Promise.resolve(false);
    const d = Math.round(o.difficulte || 2);
    if (d >= 6) {
      const dd = Math.min(7, d), why = this.tenable(dd);
      if (why) {
        sound.crocRate && sound.crocRate();
        ui.subtitle('', why === 'fins' ? '(Vos crochets n’entrent même pas dans cette serrure-là. Il faudrait de l’acier bien plus fin.)' : '(Vous sentez les goupilles, trop fines, trop serrées. Vos doigts n’en sont pas encore là.)', 4);
        return Promise.resolve(false);
      }
      o = Object.assign({}, o, { uD: dd, difficulte: 5 });
    }
    return _tenter(o);
  };
  // ouvrir : la ligne, la vitesse des goupilles ; les serrures 6 et 7
  const _ouvrir = crochetage.ouvrir.bind(crochetage);
  crochetage.ouvrir = function (o, d, res) {
    _ouvrir(o, d, res);
    const J = this.jeu;
    if (!J) return;
    try {
      const L = this.niveau(), P = U_PALIERS[L], fins = this.fins(), k = 1 - (J.tremble || 0);
      J.y = o.y ?? game.player.pos[1];
      if (o.uD && U_SERRURES[o.uD]) {
        const S = U_SERRURES[o.uD];
        J.d = o.uD; J.pins = [];
        for (let i = 0; i < S.pins; i++) J.pins.push({ v: S.vit * (0.75 + Math.random() * 0.5), ph: Math.random(), ok: false, pos: 0.5 });
        J.zone = S.zone * k;
      }
      J.zone *= P.zone * (fins ? U_FINS.zone : 1);
      for (const pin of J.pins) pin.v *= P.vit;
      J.u = { L, fins, casse: P.casse * (fins ? U_FINS.casse : 1), retombe: P.retombe, bruit: P.bruit * (fins ? U_FINS.bruit : 1) };
      this.dessiner();
    } catch (e) { console.error('U : ouvrir', e); }
  };
  // le panneau : une ligne de plus, la main
  const _pan = crochetage.panneau.bind(crochetage);
  crochetage.panneau = function (titre) {
    _pan(titre);
    try {
      const l = $('#crochetage .croc-l');
      if (l && !$('#crochetage .croc-u')) { const d = document.createElement('div'); d.className = 'croc-u'; l.after(d); }
      if (!$('#u-croc-css')) { const st = document.createElement('style'); st.id = 'u-croc-css'; st.textContent = '#crochetage .croc-u{font-size:13px;font-style:italic;color:#7a6a52;text-align:right;margin:-4px 4px 4px}'; document.head.appendChild(st); }
      this.dessiner();
    } catch (e) { console.error('U : panneau', e); }
  };
  const _des = crochetage.dessiner.bind(crochetage);
  crochetage.dessiner = function () {
    _des();
    const u = typeof document !== 'undefined' && $('#crochetage .croc-u');
    if (u && this.jeu) { const t = `Vos doigts : ${this.nomMain()}${this.jeu.u && this.jeu.u.fins ? ', et des crochets fins' : ''}`; if (u.textContent !== t) u.textContent = t; }
  };
  // caler : comme avant (11-zzz97), la main en plus (retombe, casse) et ce qu'on apprend
  crochetage.caler = function () {
    const J = this.jeu;
    if (!J || J.fini) return;
    const P = J.pins[J.i], U = J.u || { casse: 1, retombe: 1 };
    if (Math.abs(P.pos - 0.5) < J.zone) {
      P.ok = true; P.pos = 0.5; J.i++; sound.crocCale && sound.crocCale();
      this.gagner(U_GAINS.goupille * J.d, J.o.exercice ? 'exercice' : 'goupille');
      this.bruit(U_BRUITS.goupille);
      if (J.fini) return;
      if (J.i >= J.pins.length) this.finir(true, 'La serrure cède.');
      return;
    }
    // raté : bruit, goupille d'avant qui retombe, crochet qui casse
    sound.crocRate && sound.crocRate();
    J.msg = pick(['Le crochet ripe.', 'Trop tôt.', 'Trop tard.', 'Ça accroche, puis plus rien.']); J.msgT = 1.4;
    this.S().rates++;
    this.bruit(U_BRUITS.rate);
    if (J.fini) return;
    if (J.d >= 3 && J.i > 0 && Math.random() < (U_RETOMBE[J.d - 1] || 0.8) * U.retombe) { J.i--; J.pins[J.i].ok = false; J.msg = 'Une goupille retombe.'; }
    if (Math.random() < (CROC_CASSE[J.d - 1] || 0.3) * U.casse) {
      const S = this.S();
      sound.crocCasse && sound.crocCasse();
      this.bruit(U_BRUITS.casse);
      S.casses = (S.casses || 0) + 1; J.msg = 'Le crochet casse net.';
      if (S.casses >= 4) { S.casses = 0; farm.take('crochets', 1); if (!farm.count('crochets')) { this.finir(false, 'Votre dernier crochet vient de casser.'); return; } J.msg = 'Le dernier crochet du jeu casse : vous en ouvrez un autre.'; }
    }
  };
  // un bruit : qui l'entend ? Les dormeurs : le modèle du cambriolage (11-zzzzU-2) ; les autres, comme avant
  crochetage.bruit = function (b) {
    const J = this.jeu;
    if (!J || J.fini) return;
    b *= (J.o.bruit ?? 1) * ((J.u && J.u.bruit) || 1);
    J.bruit += b;
    const C = this.cambriolage;
    if (C && C.bruit) {
      let n = null;
      try { n = C.bruit(b, J.x, J.y ?? game.player.pos[1], J.z, 'serrure'); } catch (e) { console.error('U : bruit', e); }
      if (n) {
        this.S().pris++;
        const chez = n.id === J.o.proprietaire || (n.inside && n.inside === (J.o.bld || n.d.home) && Math.hypot(n.x - J.x, n.z - J.z) < 14);
        this.finir(false, chez ? 'Une lumière s’allume derrière la porte.' : 'Plus loin, quelqu’un s’est réveillé.');
        return;
      }
    }
    if (b < 0.3 || J.o.exercice || uDansZone()) return; // (dans la Zone, les habitants de la vallée n'entendent rien)
    for (const m of npcs.list) {
      if (!m.st.alive || m.vanished || m.hunting || m.state === 'gone') continue;
      if (m.state === 'sleep' || m.sleep) continue; // (le modèle ci-dessus)
      const dd = Math.hypot(m.x - J.x, m.z - J.z);
      if (dd > 14) continue;
      const chezLui = m.id === J.o.proprietaire || dd < 5;
      const pch = m.inside ? (chezLui ? 0.35 : 0.06) * b : dd < 9 ? 0.5 * b : 0.15 * b;
      if (Math.random() < pch) { this.pris(m, false); return; }
    }
  };
  // la fin : ce qu'on apprend ; le pêne qui recule fait un petit bruit
  const _finir = crochetage.finir.bind(crochetage);
  crochetage.finir = function (ok, msg) {
    const J = this.jeu;
    if (!J || J.fini) return _finir(ok, msg);
    _finir(ok, msg);
    try {
      const S = this.U();
      if (ok) {
        const C = this.cambriolage;
        if (C && C.bruit) C.bruit(U_BRUITS.ouvre * ((J.u && J.u.bruit) || 1) * (J.o.bruit ?? 1), J.x, J.y ?? game.player.pos[1], J.z, 'serrure');
        if (S.jour !== farm.s.day) { S.jour = farm.s.day; S.serrures = {}; }
        const cle = this.cleSerrure(J), deja = !!S.serrures[cle];
        S.serrures[cle] = 1;
        if (J.o.exercice) S.exercices = (S.exercices || 0) + 1;
        this.gagner(U_GAINS.ouverte * J.d * (deja ? U_GAINS.memeSerrure : 1), J.o.exercice ? 'exercice' : 'serrure');
      } else this.gagner(U_GAINS.echec, J.o.exercice ? 'exercice' : 'echec');
    } catch (e) { console.error('U : finir', e); }
  };
  // une maison cambriolée se garde : un verrou de plus pendant trois jours
  const _diff = crochetage.difficulte.bind(crochetage);
  crochetage.difficulte = function (dr) {
    const d = _diff(dr), S = farm.s && this.U(), M = S && dr && dr.bld && S.maisons[dr.bld];
    return M && farm.s.day - M.j <= 3 ? Math.min(5, d + 1) : d;
  };
  // la porte crochetée : on s'en souvient (effraction plutôt qu'intrusion, si l'on est vu dedans)
  const _porte = crochetage.porte.bind(crochetage);
  crochetage.porte = async function (dr) {
    const ok = await _porte(dr);
    if (ok && dr && dr.bld && this.cambriolage && this.cambriolage.forcee) this.cambriolage.forcee(dr.bld);
    return ok;
  };
}

// ---------------------------------------------------------------- le vieux cadenas : en main, clic
HOOKS.primary.push((eye, basis, held, it, id) => {
  if (id !== 'cadenas_exercice' || !farm.s) return false;
  if (held || crochetage.jeu) return true;
  if (!farm.count('crochets')) { ui.subtitle('', '(Sans crochets, ce cadenas n’est qu’un morceau de fer.)', 3); return true; }
  const p = game.player, L = crochetage.niveau();
  crochetage.tenter({ difficulte: L >= 1 ? 3 : 2, bruit: 0.3, x: p.pos[0], y: p.pos[1], z: p.pos[2], proprietaire: null, crime: null, exercice: true, titre: 'Le vieux cadenas', cle: 'cadenas' })
    .then((ok) => { if (ok) penser.une('u_cadenas', '(Le cadenas s’ouvre. Vous le refermez, pour recommencer.)', 3); });
  return true;
});

// ---------------------------------------------------------------- le petit jeu tourne aussi dans la Zone (agent V1 : un crochet
// HOOKS.update marqué .zone n'y est pas suspendu ; les serrures du château, des caveaux…)
for (const f of HOOKS.update) if (typeof f === 'function' && /crochetage\.update\(dt\)/.test(String(f))) f.zone = true;
// ---------------------------------------------------------------- au chargement : les papiers, les poches des dormeurs, les crochets fins
HOOKS.load.push(() => {
  if (!farm.s) return;
  crochetage.U();
  crochetage.uT = 0;
  // les crochets fins : le colporteur les sort de sous son comptoir pour qui a la main de serrurier
  try { uVendre('colporteur', 'crochets_fins', 240, crochetage.niveau() >= 3); } catch (e) { console.error('U : crochets fins', e); }
  if (game._u1) return;
  game._u1 = true;
  // le carnet (sacoche) : une ligne vague sur la main, sous celles du corps et de l'esprit (12-zzzH-carnet.js)
  const _rs = ui.renderSatchel.bind(ui);
  ui.renderSatchel = function () {
    _rs();
    try {
      if (this.satTab !== 'carnet' || !farm.s) return;
      const t = U_PALIER_CARNET[crochetage.niveau()];
      const body = document.querySelector('#satchel .body');
      if (!t || !body || body.querySelector('.u-main')) return;
      const box = body.querySelector('.h-carnet');
      if (box) box.insertAdjacentHTML('beforeend', `<p class="u-main">${esc(t)}</p>`);
      else body.insertAdjacentHTML('afterbegin', `<div class="h-carnet"><p class="u-main">${esc(t)}</p></div>`);
    } catch (e) { console.error('U : carnet', e); }
  };
  // les papiers des doubles fonds : ce qu'ils apprennent, à la première lecture
  if (typeof fouilles !== 'undefined' && fouilles.lirePapier) {
    const _lp = fouilles.lirePapier.bind(fouilles);
    fouilles.lirePapier = function (id) {
      const r = _lp(id);
      try { const S = crochetage.U(); if (S && U_PAPIERS_PTS[id] && !S.papiers[id]) { S.papiers[id] = 1; crochetage.gagner(U_PAPIERS_PTS[id], 'papier'); } } catch (e) { console.error(e); }
      return r;
    };
  }
  // faire les poches d'un dormeur : des doigts plus légers
  if (typeof vol !== 'undefined' && vol.chance) {
    const _vc = vol.chance.bind(vol);
    vol.chance = function (n) {
      const k = _vc(n);
      return n && (n.state === 'sleep' || n.sleep) && farm.s ? clamp(k + crochetage.palier().poche, 0.03, 0.92) : k;
    };
  }
});
// les livres lus (toutes les trois secondes) ; les crochets fins apparaissent chez le colporteur au bon palier
HOOKS.update.push((dt) => {
  if (!farm.s) return;
  crochetage.uT -= dt;
  if (crochetage.uT > 0) return;
  crochetage.uT = 3;
  crochetage.lectures();
  if (crochetage.niveau() >= 3) uVendre('colporteur', 'crochets_fins', 240);
});
