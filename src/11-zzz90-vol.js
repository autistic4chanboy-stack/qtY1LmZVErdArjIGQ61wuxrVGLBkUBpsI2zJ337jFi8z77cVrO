// ============================================================================
//  VOL À LA TIRE
//  Accroupi, dans le dos d'un habitant, la touche E propose « Faire les poches ».
//  - la réussite dépend de la position (dans le dos, accroupi), de l'attention
//    de l'habitant (au travail, en train de parler, endormi, la nuit, la foule
//    du marché), de son caractère, de l'ivresse et des récidives ;
//  - le butin dépend de ce qu'il porte : des pièces selon sa richesse, des
//    objets de son métier, des objets personnels, parfois un objet de quête ;
//  - raté : il crie, se retourne, l'amitié chute, le crime est connu de ceux
//    qui l'ont vu (societe.crime, type 'vol'), la mentalité baisse ;
//  - les objets volés se reconnaissent : les revendre à leur propriétaire, ou
//    dans son village, c'est être pris la main dans le sac. Les colporteurs,
//    eux, ne demandent jamais d'où vient ce qu'ils achètent.
//  État : farm.s.vol = { marques: [{ id, de, j, t }], poches: { pnj: jour },
//         victimes: { pnj: jour }, pieces, reussis, rates, plaintes: {} }
//  API : vol.tenter(n), vol.chance(n), vol.marques(id), vol.confisquer(),
//        vol.recel(id) (objets volés d'un type), vol.cible(n)
// ============================================================================
defItem('mouchoir_brode', 'Mouchoir brodé', 'tresor', 10, ['sachet', '#ece4d8'], { desc: 'Du fil blanc sur de la batiste, et deux initiales qui ne sont pas les vôtres.' });
defItem('tabatiere', 'Tabatière d’argent', 'tresor', 40, ['rond', '#a8a8b4'], { desc: 'Le couvercle est gravé d’un cerf. Elle sent encore le tabac de quelqu’un.' });
defItem('couteau_poche', 'Couteau de poche', 'tresor', 25, ['cle', '#9a9aa2'], { desc: 'Un manche de corne, une lame usée à force d’être affûtée. On y tenait.' });
defItem('medaillon_portrait', 'Médaillon à portrait', 'tresor', 80, ['medaillon', '#c8a860'], { desc: 'Sous le verre bombé, un visage minuscule, pâli. Quelqu’un l’embrassait chaque soir.' });

// ce que portent les gens : b = pièces [min, max], m = objets du métier, p = objets personnels, r = rares, q = [quête, objet]
// (une poche réussie : une quarantaine de pièces en moyenne ; raté, l'amende d'un vol en coûte cent cinquante)
const VOL_POCHES = {
  maire: { b: [27, 68], m: ['plume', 'bougie'], p: ['montre', 'tabatiere', 'mouchoir_brode'] },
  boulangere: { b: [6, 21], m: ['pain', 'brioche', 'farine'], p: ['mouchoir_brode', 'medaillon_portrait'] },
  forgeron: { b: [9, 27], m: ['charbon', 'lingot_cuivre'], p: ['couteau_poche', 'tabatiere'] },
  grainetiere: { b: [8, 24], m: ['graines_ble', 'graines_carotte', 'graines_chou', 'graines_fraise'], p: ['mouchoir_brode'] },
  aubergiste: { b: [18, 51], m: ['cidre', 'fromage'], p: ['tabatiere', 'couteau_poche'] },
  cure: { b: [9, 33], m: ['bougie', 'eau_benite', 'chapelet_buis'], p: ['mouchoir_brode'], q: ['aubergiste_3', 'pipe'] },
  postiere: { b: [6, 18], m: ['plume', 'bougie'], p: ['mouchoir_brode', 'couteau_poche'] },
  garde: { b: [5, 15], m: ['pain', 'bougie'], p: ['tabatiere'] },
  eleveuse: { b: [9, 30], m: ['foin', 'oeuf', 'corde'], p: ['couteau_poche'] },
  pecheur: { b: [3, 12], m: ['vers', 'perche', 'gardon'], p: ['couteau_poche', 'tabatiere'] },
  guerisseuse: { b: [2, 9], m: ['herbes', 'rosee', 'reine_pres'], p: ['chapelet_buis'] },
  fillette: { b: [0, 3], m: [], p: ['figurine'] },
  alchimiste: { b: [15, 45], m: ['fiole', 'sel', 'lichen'], p: ['tabatiere', 'mouchoir_brode'] },
  libraire: { b: [9, 30], m: ['bougie', 'plume'], p: ['medaillon_portrait'] },
  colporteur: { b: [23, 68], m: ['corde', 'bougie', 'sel', 'vieille_piece'], p: ['tabatiere'], r: ['bijou'], q: ['libraire_1', 'feuillet_perdu'] },
  colporteuse: { b: [15, 45], m: ['toile', 'bandage', 'sel', 'fiole'], p: ['mouchoir_brode'], r: ['perle'], q: ['cure_2', 'chapelet'] },
  chasseur: { b: [8, 23], m: ['cartouche', 'croc', 'plume_noire'], p: ['couteau_poche'], q: ['guerisseuse_2', 'dent_de_loup'] },
  nain_ancien: { b: [30, 90], m: ['minerai_fer', 'charbon'], p: [], r: ['gemme', 'lingot_or'] },
  nain_forgeronne: { b: [23, 60], m: ['lingot_fer', 'charbon'], p: [], r: ['gemme'] },
};
// le caractère : on se méfie, ou pas
const VOL_TRAITS = { bavarde: 0.08, joviale: 0.06, pressée: 0.05, mélancolique: 0.05, patient: 0.02, joyeuse: 0.04, curieuse: -0.08, méfiant: -0.12, zélé: -0.1, dangereux: -0.12, directe: -0.04, robuste: -0.04, taciturne: -0.03, grave: -0.08, roublard: -0.15, franche: -0.03, peureux: 0.03, loyal: 0 };
const VOL_CRIS = {
  _: ['Au voleur ! AU VOLEUR !', 'Hé ! Vos mains ! Au voleur !', 'Qu’est-ce que vous faites dans ma poche ?! Au voleur !'],
  maire: 'Mes poches ! Vous osez ? Au garde ! AU GARDE !',
  boulangere: 'Doux Jésus ! Votre main dans mon tablier ?! Au voleur !',
  forgeron: 'Enlevez votre main. Tout de suite.',
  grainetiere: 'Petite fouine ! Au voleur ! J’ai des yeux dans le dos, moi, depuis soixante ans !',
  aubergiste: 'Ma recette ! Au voleur ! Je vous ai servi à boire, et voilà comment on me remercie !',
  cure: 'Mon enfant… dans la poche d’un prêtre ? Dieu vous voit. Moi aussi.',
  postiere: 'Ma sacoche ! Au voleur ! Toute la ville va le savoir, je vous le garantis !',
  garde: 'La main dans la poche du garde ? Vous êtes fou, ou vous avez envie de voir le cachot ?',
  eleveuse: 'Hé ! On ne fouille pas une femme de ranch. Pas sans y laisser des dents !',
  pecheur: 'Hé. Il n’y a que du fil et des hameçons, là-dedans. Au voleur !',
  guerisseuse: 'Mes herbes ? Prenez-les. Mais les mains qui volent se dessèchent. C’est connu.',
  fillette: 'Hé ! C’est à moi ! Maman ! MAMAN !',
  alchimiste: 'Vos doigts dans mes fioles ! Vous voulez vous brûler jusqu’à l’os ? Au voleur !',
  libraire: 'On ne vole pas un vieil homme. On emprunte, on rend, et on paie le retard. Au voleur !',
  colporteur: 'Ha ! À un colporteur ? On me l’a faite cent fois, mon ami. Cent fois. Au voleur !',
  colporteuse: 'Ma bourse ! Au voleur ! Sur les routes, on se fait voler par des inconnus, pas par des clients !',
  chasseur: 'Je vous entends respirer depuis tout à l’heure. Retirez votre main, ou je vous la casse.',
  nain_ancien: 'Des doigts de surface dans une bourse des halles. Voleur ! VOLEUR !',
  nain_forgeronne: 'Tu fouilles une forgeronne ? Tu tiens à ta main ? Voleur !',
};
const VOL_TEMOIN = ['Au voleur ! Là, dans le dos de {victime} !', 'Hé ! Je vous ai vu ! Au voleur !', 'Il fait les poches de {victime} ! Au garde !'];
const VOL_PLAINTE = [
  'On m’a fait les poches, hier. Si je tenais le voleur… Enfin. Je ne le tiens pas.',
  'Il me manque des sous. Je ne suis pas folle : il me manque des sous. Quelqu’un a de longs doigts, par ici.',
  'Vous n’auriez pas vu traîner quelqu’un de louche ? On m’a vidé les poches, et je n’ai rien senti. Rien.',
];
const VOL_ARMES_TOOLS = new Set(['fusil', 'arc', 'rapiere']);

const vol = {
  t: 0, attente: null, hintEl: null,
  S() {
    const s = farm.s;
    if (!s) return null;
    const S = s.vol || (s.vol = {});
    if (!S.marques) Object.assign(S, { marques: [], poches: {}, victimes: {}, pieces: 0, reussis: 0, rates: 0, plaintes: {} });
    if (!S.plaintes) S.plaintes = {};
    return S;
  },
  nu(n) { return !!(n.d.look && n.d.look.nude); },
  // un habitant qu'on peut détrousser (le reste des conditions : la cible de E)
  cible(n) {
    if (!n || !n.st || !n.st.alive || n.vanished || n.hunting || n.talking || n.state === 'gone' || n.state === 'dead') return false;
    if ((n.fleeT || 0) > 0 || (n.poursuite || 0) > game.time || n.sommeT) return false;
    const S = this.S();
    return !(S && S.poches[n.id] === farm.s.day);
  },
  // « pile dans le dos » : 1 ; de côté : 0 ; en face : -1
  dos(n, px, pz) {
    const dx = px - n.x, dz = pz - n.z, d = Math.hypot(dx, dz) || 1;
    return -(dx * Math.sin(n.heading) + dz * Math.cos(n.heading)) / d;
  },
  foule(n) { let k = 0; for (const m of npcs.list) if (m !== n && m.st.alive && !m.vanished && m.state !== 'gone' && Math.hypot(m.x - n.x, m.z - n.z) < 7) k++; return k; },
  chance(n) {
    const p = game.player, h = npcs.hour(), s = farm.s, S = this.S();
    let k = 0.28;
    if (n.state === 'sleep') k += 0.36;
    else k += clamp(this.dos(n, p.pos[0], p.pos[2]), 0, 1) * 0.22;
    if (p.crouch > 0.5) k += 0.06;
    const pose = n.goal && n.state === 'idle' ? n.goal.pose : null;
    if (pose === 'work' || pose === 'fish') k += 0.14; // occupé à son ouvrage
    if ((n.chatT || 0) > 0 || (n.bubbleT || 0) > 0) k += 0.12; // en train de parler
    if (n.state === 'walk') k -= 0.06;
    if (h >= 21 || h < 5.5) k += 0.1; // la nuit
    if (game.lantern) k -= 0.08;
    k += Math.min(0.18, this.foule(n) * 0.06); // la foule du marché
    for (const t of n.d.traits || []) k += VOL_TRAITS[t] || 0;
    if ((n.d.age || 30) >= 65) k += 0.06;
    if (npcs.level(n) >= 6) k += 0.04; // on ne se méfie pas d'un ami
    if (n.d.id === 'garde') k -= 0.2;
    if (n.d.area === 'nains') k -= 0.08;
    const last = S.victimes[n.id];
    if (last && s.day - last < 4) k -= 0.12;
    try { if (typeof alcool !== 'undefined' && alcool.niveau && alcool.niveau() >= 2) k -= 0.12; } catch (e) { /* rien */ }
    return clamp(k, 0.03, 0.9);
  },

  // ------------------------------------------------------------------ la tentative
  tenter(n) {
    if (!farm.s || this.attente || game.sleeping || game.dying) return;
    if (this.nu(n)) { ui.subtitle('', '(Pas la moindre poche. Évidemment.)', 3); return; }
    const k = this.chance(n);
    sound.scratch && sound.scratch();
    this.attente = { n, k, t: 0.45 };
  },
  resoudre() {
    const A = this.attente, n = A.n, p = game.player;
    this.attente = null;
    if (!n.st.alive || Math.hypot(n.x - p.pos[0], n.z - p.pos[2]) > 2.3) { ui.subtitle('', '(Il s’éloigne. Votre main se referme sur le vide.)', 3); return; }
    if (Math.random() < A.k) this.reussite(n); else this.echec(n);
  },
  reussite(n) {
    const s = farm.s, S = this.S(), p = game.player, P = VOL_POCHES[n.d.id] || { b: [2, 10], m: [], p: [] };
    const pos = [p.pos[0], p.pos[1] + 1.1, p.pos[2]];
    const bits = [];
    // des pièces, selon la richesse (les jours de marché, la recette est dans la poche)
    let pieces = 0;
    if (Math.random() < 0.85) {
      pieces = Math.round(P.b[0] + Math.random() * (P.b[1] - P.b[0]));
      if (typeof cal !== 'undefined' && cal.is('marche') && n.d.shop) pieces = Math.round(pieces * 1.5);
      if (pieces > 0) { s.money += pieces; S.pieces += pieces; bits.push(pieces > 1 ? `${pieces} pièces` : 'une pièce'); sound.coin && sound.coin(); }
    }
    // un objet : de quête, du métier, personnel, rare
    let id = null, t = 'm';
    const Q = P.q && s.quests[P.q[0]];
    if (Q && Q.st === 'actif' && !Q.found && ITEMS[P.q[1]] && !farm.count(P.q[1]) && Math.random() < 0.5) { id = P.q[1]; t = 'q'; }
    else {
      const r = Math.random(), have = (L) => (L || []).filter((k) => ITEMS[k]);
      const R = have(P.r), M = have(P.m), Pp = have(P.p);
      if (R.length && r < 0.06) { id = pick(R); t = 'p'; }
      else if (M.length && r < 0.6) { id = pick(M); t = 'm'; }
      else if (Pp.length && r < 0.9) { id = pick(Pp); t = 'p'; }
    }
    if (id) {
      farm.give(id, 1); play.flyer && play.flyer(id, pos, 1);
      S.marques.push({ id, de: n.id, j: s.day, t });
      bits.push(itemName(id).toLowerCase());
      if (t === 'q') this.objetDeQuete(P.q[0], id);
    }
    S.poches[n.id] = s.day; S.victimes[n.id] = s.day; S.reussis++;
    S.plaintes[n.id] = s.day;
    if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-0.8, 'vol à la tire', 2.4);
    ui.subtitle('', bits.length ? `(Vos doigts ressortent de la poche : ${bits.join(', ')}.)` : '(Rien. Des miettes, un bout de ficelle. Des poches vides.)', 3.5);
    // quelqu'un a-t-il vu ?
    this.temoins(n);
  },
  // l'objet d'une quête en cours : on le tient, on ne le cherchera plus au sol
  objetDeQuete(qid, id) {
    const s = farm.s, w = game.world, Q = s.quests[qid];
    if (Q) Q.found = true;
    const i = (w.inter || []).findIndex((it) => it.id === 'quete_' + qid);
    if (i >= 0) w.inter.splice(i, 1);
    const pi = w.props.findIndex((q) => q.questFind === qid);
    if (pi >= 0) { w.props.splice(pi, 1); farm.dirtyProps = true; }
    const g = quests.giver(qid), gn = g && npcs.byId[g];
    setTimeout(() => ui.subtitle('', gn ? `(${itemName(id)}… C’est ce que cherche ${gn.name}.)` : `(${itemName(id)}… Voilà qui n’était pas à lui.)`, 4), 3600);
  },
  // les autres : ceux qui regardent de ce côté, pas trop loin
  temoins(n) {
    const p = game.player, h = npcs.hour(), w = game.world;
    for (const m of npcs.list) {
      if (m === n || !m.st.alive || m.vanished || m.hunting || m.sleep || m.state === 'sleep' || m.state === 'gone' || m.talking) continue;
      const dx = p.pos[0] - m.x, dz = p.pos[2] - m.z, d = Math.hypot(dx, dz);
      if (d > 12 || (d > 5 && !segClear(w, m.x, m.z, p.pos[0], p.pos[2]))) continue;
      const face = (dx * Math.sin(m.heading) + dz * Math.cos(m.heading)) / (d || 1);
      if (face < 0.35) continue;
      if (Math.random() > (h >= 21 || h < 5.5 ? 0.3 : 0.55)) continue;
      npcs.say(m, fmtLine(pick(VOL_TEMOIN), m, { victime: n.name }), 3);
      m.heading = Math.atan2(dx, dz);
      this.pris(n, [m, n]);
      return true;
    }
    return false;
  },
  echec(n) {
    const S = this.S(), p = game.player;
    S.rates++; S.victimes[n.id] = farm.s.day;
    n.heading = Math.atan2(p.pos[0] - n.x, p.pos[2] - n.z);
    const cri = VOL_CRIS[n.d.id] || pick(VOL_CRIS._);
    npcs.say(n, cri, 3.5);
    n.chatT = 0;
    if (n.state === 'sleep') { n.state = 'idle'; n.sleep = false; n.goal = null; }
    // les costauds repoussent, les autres reculent
    if (['forgeron', 'chasseur', 'eleveuse', 'nain_forgeronne'].includes(n.d.id)) {
      const a = Math.atan2(p.pos[0] - n.x, p.pos[2] - n.z);
      p.vel[0] += Math.sin(a) * 5; p.vel[2] += Math.cos(a) * 5;
      play.hurt(6, n, 'Repoussé par ' + n.name);
      game.shakeT = Math.max(game.shakeT || 0, 0.25);
    } else if (n.d.id !== 'garde') { n.fleeT = 2.5; }
    this.pris(n, null); // le cri : tous ceux qui sont autour l'entendent (la société compte les témoins)
  },
  // pris sur le fait : l'amitié chute, le crime est su, le garde accourt
  pris(n, tem) {
    npcs.addAmitie(n, -150);
    n.st.anger = Math.max(n.st.anger || 0, 4);
    npcs.remember(n, 'vol');
    let C = null;
    if (typeof societe !== 'undefined' && societe.crime) C = societe.crime(tem ? { type: 'vol', victime: n.id, x: n.x, z: n.z, temoins: tem } : { type: 'vol', victime: n.id, x: n.x, z: n.z });
    const g = npcs.byId.garde, vus = tem || (C ? C.temoins.map((id) => npcs.byId[id]) : [n]);
    if (g && g.st.alive && !g.sleep && (vus.includes(g) || Math.hypot(g.x - n.x, g.z - n.z) < 40)) { g.poursuite = game.time + 18; g.vuT = game.time; g.fleeT = 0; }
  },

  // ------------------------------------------------------------------ les objets volés
  // (on ne garde pas plus de marques qu'on n'a d'objets : ce qui a été mangé, donné, perdu ne compte plus)
  ranger() {
    const S = this.S();
    if (!S) return;
    const vus = {};
    for (let i = S.marques.length - 1; i >= 0; i--) {
      const m = S.marques[i];
      vus[m.id] = (vus[m.id] || 0) + 1;
      if (vus[m.id] > farm.count(m.id)) S.marques.splice(i, 1);
    }
  },
  marques(id) { const S = this.S(); if (!S) return []; this.ranger(); return S.marques.filter((m) => m.id === id); },
  recel(id) { return this.marques(id).length; },
  oter(m) { const S = this.S(), i = S.marques.indexOf(m); if (i >= 0) S.marques.splice(i, 1); },
  // un marchand reconnaît-il l'objet ? (le volé lui-même, ou un voisin pour les objets personnels)
  reconnait(n, id) {
    const M = this.marques(id);
    if (!M.length || !n || n.d.nomade) return null;
    const vd = (i) => (typeof societe !== 'undefined' ? societe.villageDe(i) : null);
    for (const m of M) if (m.de === n.id && (m.t === 'p' || Math.random() < 0.6)) return m;
    for (const m of M) if (m.t === 'p' && m.de !== n.id && vd(m.de) && vd(m.de) === vd(n.id) && Math.random() < 0.6) return m;
    return null;
  },
  mainDansLeSac(n, m) {
    const v = npcs.byId[m.de], nom = itemName(m.id).toLowerCase();
    farm.take(m.id, 1); this.oter(m);
    ui.close(true);
    const t = v === n ? `Mais… c’est à moi, ça ! ${itemName(m.id)} ! Vous me l’avez volé !` : `Ce ${nom}, je le connais : c’est celui de ${v ? v.name : 'quelqu’un d’ici'}. D’où vous le tenez ?`;
    npcs.say(n, t, 4);
    npcs.addAmitie(n, -120);
    n.st.anger = Math.max(n.st.anger || 0, 3);
    if (typeof societe !== 'undefined' && societe.crime) societe.crime({ type: 'vol', victime: m.de, x: n.x, z: n.z, temoins: [n], preuve: societe.villageDe(n.id) || true });
    if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-1, 'pris la main dans le sac', 2);
    setTimeout(() => ui.subtitle('', '(On vous a pris la main dans le sac.)', 3), 3800);
  },
  // au cachot : les objets volés sont rendus à leurs propriétaires
  confisquer() {
    const S = this.S(), out = [];
    if (!S) return out;
    this.ranger();
    for (const m of S.marques.slice()) { if (farm.take(m.id, 1)) out.push(itemName(m.id).toLowerCase()); }
    S.marques = [];
    return out;
  },
  arme(id) { const it = ITEMS[id]; return !!it && (VOL_ARMES_TOOLS.has(it.tool) || ['fleche', 'fleche_fer', 'cartouche', 'piege_loup'].includes(id)); },

  // ------------------------------------------------------------------ chaque image
  update(dt, playing) {
    if (this.attente) { this.attente.t -= dt; if (this.attente.t <= 0) this.resoudre(); }
    // la cible visée s'éclaire ; l'indice discret sous le réticule
    const t = game.target, on = !!(playing && t && t.kind === 'hook' && (t.vol || t.geolier));
    if (on && t.vol) t.vol.hi = true;
    const el = this.hint();
    if (el) {
      const txt = !on ? '' : t.geolier ? 'E — Prendre le trousseau, à travers les barreaux' : t.vol.st.met ? `E — Faire les poches de ${t.vol.name}` : 'E — Faire les poches';
      if (el.textContent !== txt) el.textContent = txt;
      el.classList.toggle('on', on);
    }
    this.t -= dt;
    if (this.t <= 0) { this.t = 5; this.ranger(); }
  },
  hint() {
    if (this.hintEl && this.hintEl.isConnected) return this.hintEl;
    if (typeof document === 'undefined' || !document.body || !document.createElement) return null;
    const st = document.createElement('style');
    st.textContent = '#k-poche{position:fixed;left:50%;top:calc(50% + 26px);transform:translateX(-50%);color:#e8e0cc;font:13px Georgia,serif;text-shadow:0 1px 2px #000;opacity:0;transition:opacity .25s;pointer-events:none;z-index:6;white-space:nowrap}#k-poche.on{opacity:.82}.k-vole{color:#b04a3a;font-style:italic;margin-left:4px}';
    document.head.appendChild(st);
    const d = document.createElement('div'); d.id = 'k-poche';
    document.body.appendChild(d);
    this.hintEl = d;
    return d;
  },
};

// ---------------------------------------------------------------- touche E : accroupi, dans le dos d'un habitant
HOOKS.target.push((eye, f, cand) => {
  if (!farm.s || (typeof cine !== 'undefined' && cine.on) || vol.attente) return;
  const p = game.player;
  if (!(p.crouch > 0.5) || p.riding || p.swimming) return;
  const fh = Math.hypot(f[0], f[2]) || 1;
  let best = null, bd = 1.75;
  for (const n of npcs.list) {
    if (!vol.cible(n)) continue;
    const dx = n.x - p.pos[0], dz = n.z - p.pos[2], d = Math.hypot(dx, dz);
    if (d > bd || d < 0.2 || Math.abs(n.y - p.pos[1]) > 1.3) continue;
    if ((dx * f[0] + dz * f[2]) / (d * fh) < 0.55) continue; // on le regarde
    if (n.state !== 'sleep' && vol.dos(n, p.pos[0], p.pos[2]) < 0.25) continue; // dans son dos
    best = n; bd = d;
  }
  if (best) { const n = best; cand({ kind: 'hook', vol: n, use: () => vol.tenter(n) }, 0.02); }
});
HOOKS.update.push((dt, eye, basis, sky, playing) => { if (farm.s) vol.update(dt, playing); });

// ---------------------------------------------------------------- chargement : boutiques (recel) et cadeaux (on reconnaît son bien)
HOOKS.load.push(() => {
  vol.S(); vol.attente = null;
  // les colporteurs rachètent les petites choses sans poser de questions ; à la ville, le maire (qui collectionne)
  // et l'aubergiste (qui prête sur gages) les rachètent aussi… mais on y connaît le bien des voisins
  for (const id of ['colporteur', 'colporteuse', 'maire', 'aubergiste']) {
    const d = NPC_BY_ID[id];
    if (d && d.shop && d.shop.buys) for (const k of ['mouchoir_brode', 'tabatiere', 'couteau_poche', 'medaillon_portrait', 'montre', 'bijou']) if (!d.shop.buys.includes(k)) d.shop.buys.push(k);
  }
  if (vol.hooked) return;
  vol.hooked = true;
  const _rs = ui.renderShop.bind(ui);
  ui.renderShop = function () {
    _rs();
    const n = this.shopN;
    if (!n || !farm.s) return;
    const el = $('#shop');
    if (!el) return;
    for (const b of el.querySelectorAll('[data-sell]')) {
      const id = b.dataset.sell;
      if (!vol.recel(id)) continue;
      const sp = b.querySelector('span');
      if (sp && !sp.querySelector('.k-vole')) { const i = document.createElement('i'); i.className = 'k-vole'; i.textContent = n.d.nomade ? '(volé — on ne demande rien)' : '(volé)'; sp.appendChild(i); }
      const f0 = b.onclick;
      b.onclick = (e) => {
        const m = vol.reconnait(n, id);
        if (m) { vol.mainDansLeSac(n, m); return; }
        const M = vol.marques(id), c0 = farm.count(id);
        if (f0) f0(e);
        // ce qui a été vendu sans histoire ne se reconnaîtra plus (le recel est fait)
        if (M.length && farm.count(id) < c0) vol.oter(M[0]);
        vol.ranger();
      };
    }
    const all = el.querySelector('[data-sellall]');
    if (all) {
      const f0 = all.onclick;
      all.onclick = (e) => {
        for (const b of el.querySelectorAll('[data-sell]')) { const id = b.dataset.sell; const m = vol.recel(id) ? vol.reconnait(n, id) : null; if (m) { vol.mainDansLeSac(n, m); return; } }
        if (f0) f0(e);
        vol.ranger();
      };
    }
  };
  // offrir à quelqu'un ce qu'on lui a volé…
  const _gift = talk.gift.bind(talk);
  talk.gift = function () {
    const n = this.n, id = farm.s && farm.s.hand;
    if (n && id) {
      const m = vol.marques(id).find((k) => k.de === n.id);
      if (m && (m.t === 'p' || m.t === 'q' || Math.random() < 0.5)) {
        farm.take(id, 1); vol.oter(m);
        npcs.addAmitie(n, -100); n.st.anger = Math.max(n.st.anger || 0, 3);
        if (typeof societe !== 'undefined' && societe.crime) societe.crime({ type: 'vol', victime: n.id, x: n.x, z: n.z, temoins: [n] });
        return this.view(`${itemName(id)}… C’est à moi. C’est à MOI. Vous me faites les poches, et vous venez me l’offrir ? Sortez.`, [{ label: 'Partir', act: 'bye' }]);
      }
    }
    return _gift();
  };
  // le lendemain, la victime s'aperçoit qu'on l'a volée
  const _open = talk.open.bind(talk);
  talk.open = function (n) {
    const v = _open(n);
    try {
      const S = vol.S(), d = S && S.plaintes[n.id];
      if (v && v.text && d !== undefined && farm.s.day - d >= 1 && farm.s.day - d <= 3 && n.st.met && !(n.st.anger > 0)) {
        delete S.plaintes[n.id];
        if (Math.random() < 0.6) { v.text = fmtLine(pick(VOL_PLAINTE), n); n.speakT = Math.min(6, 1 + v.text.length * 0.04); }
      }
    } catch (e) { console.error(e); }
    return v;
  };
});
