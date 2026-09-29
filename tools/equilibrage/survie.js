// Équilibrage — SURVIE : le corps et l'esprit du personnage face au monde.
//   node tools/equilibrage.js survie
// Le VRAI code du jeu tourne ici, dans la machine virtuelle (tools/equilibrage/vm.js), sur un joueur factice posé
// dans un monde plat et vide : la faim et la vie (play.updateBody, play.nuit), les chutes (Player.update + corps),
// les loups (entities.wolfAI), l'ours et le sanglier en furie (chasse.charger), la vipère, les poisons des aliments
// (effets), l'alcool, la noyade, le froid, et la mentalité (esprit, sommeil) sur des journées types.
// Le hasard est tiré d'un générateur à graine fixe : les mesures sont reproductibles.
// Chaque tableau est suivi de ses vérifications (« ✗ » : échec). Les cibles et leurs raisons sont écrites à côté.
'use strict';

// ------------------------------------------------------------------ outils
function graine(seed) { // mulberry32
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const f1 = (v) => (Math.round(v * 10) / 10).toFixed(1);
const f0 = (v) => String(Math.round(v));
const pc = (v) => Math.round(v * 100) + ' %';
function tableau(log, titres, lignes) {
  const L = [titres, ...lignes].map((r) => r.map((c) => String(c)));
  const w = titres.map((_, i) => Math.max(...L.map((r) => (r[i] || '').length)));
  for (const r of L) log('  ' + r.map((c, i) => (i ? c.padStart(w[i]) : c.padEnd(w[i]))).join('  '));
}

// ------------------------------------------------------------------ la partie « vivante », sans navigateur
// Un joueur, un monde plat (sol à 0, pas d'eau sauf demande), une partie neuve (farm.blank) ; l'interface, les sons,
// les particules et les minuteries sont neutralisés. Renvoie G : les objets du jeu, et quelques commandes.
function vivant(J) {
  J.ev(`globalThis.__G = { play, corps, chasse, entities, esprit, effets, alcool, sommeil, farm, game, faim, chien, ui, sound, particles, strange,
    Player, CHASSE_DANGER, CHASSE_CALME, CREATURES, ITEMS, EFFETS, ALIMENTS_EFFETS, JOUR_SECONDES, computeSky, beasts, vallee,
    ALCOOL_ELIM, ALCOOL_COMA, pilules: typeof pilules !== 'undefined' ? pilules : null, evNeige: typeof evNeige !== 'undefined' ? evNeige : null,
    evenements: typeof evenements !== 'undefined' ? evenements : null, weather, BUFF, npcs, mondes: typeof mondes !== 'undefined' ? mondes : null }`);
  const G = J.ctx.__G;
  G.__J = J;
  const noop = () => {};
  // l'interface et les sons : rien
  for (const k of ['subtitle', 'close', 'open', 'read', 'choice', 'showTitle', 'fadeMsg', 'renderSatchel']) G.ui[k] = noop;
  G.ui.fade = () => Promise.resolve();
  const proto = Object.getPrototypeOf(G.sound);
  for (const k of Object.getOwnPropertyNames(proto)) if (k !== 'constructor' && typeof G.sound[k] === 'function') G.sound[k] = noop;
  G.particles.spawn = function () { if (this.list.length > 64) this.list.length = 0; this.list.push({ col: [0, 0, 0, 0] }); }; // (certains modules retouchent la dernière)
  G.game.shakeT = 0;
  G.game.kind = 'farm';
  G.game.mode = 'play';
  G.game.time = 0;
  G.game.fastTime = false; G.game.timeScale = 1;
  // le monde plat
  const w = {
    dayLength: G.JOUR_SECONDES, waterLevel: -1e9, time: 0.4, size: 3000, designed: false,
    heightAt: () => 0, groundAt: () => 0, covered: () => false, inside: () => true, collideCircle: (x, z) => [x, z], normalAt: () => [0, 1, 0],
    matAt: () => 0, query() {}, lights: [], props: [], objects: [], inter: [], bld: {}, doors: [], pools: [], nav: { nodes: [] },
    raycastBlocks: () => null, raycastTerrain: () => null, live: () => true,
  };
  G.game.world = w;
  G.game.die = (cause) => { G.mort = cause || 'mort'; G.game.player.hp = Math.min(G.game.player.hp, 0); };
  G.game.dying = false; G.game.sleeping = false;
  G.game.lantern = false;
  G.game.nearFire = () => false;
  G.game.insideBuilding = () => false;
  G.game.biomeAt = () => 'plaine';
  G.strange.fear = 0;
  G.strange.inEnvers = () => false; G.strange.redNight = () => false; G.strange.placeName = () => null; G.strange.killerActive = () => false;
  // une partie neuve
  G.nouvelle = () => {
    G.farm.s = G.farm.blank(1234);
    G.farm.s.hours = 30; G.farm.s.day = 2;
    const p = G.game.player = new G.Player();
    p.pos = [1500, 0, 1500]; p.vel = [0, 0, 0]; p.onGround = true; p.hp = 100; p.food = 80; p.stamina = 1;
    G.mort = null; G.game.dying = false; G.game.sleeping = false; G.game.lantern = false;
    G.play.nausea = 0; G.play.poisonT = 0; G.play.hurtFlash = 0;
    w.waterLevel = -1e9; w.time = 0.4;
    G.corps.hisse = null;
    return p;
  };
  G.nouvelle();
  // les emballages posés au chargement d'une partie dont on a besoin : manger (effets des aliments, alcool)
  J.ev(`for (const f of HOOKS.load) if (/effets\\.branche/.test(String(f))) f(false);`);
  return G;
}
// le hasard du jeu, à graine fixe (Math est partagé avec node : on le rend toujours)
function avecGraine(seed, fn) {
  const r0 = Math.random;
  Math.random = graine(seed);
  try { return fn(); } finally { Math.random = r0; }
}

// ================================================================== 1. LA FAIM ET LA VIE
function mesurerFaim(G, log, echec) {
  const p0 = G.nouvelle(), H = G.JOUR_SECONDES / 24; // secondes réelles par heure de jeu
  const dt = 0.05;
  // (a) la faim perdue en une heure de jeu, en marchant et en courant (play.updateBody)
  const parHeure = (course) => { const p = G.nouvelle(); p.food = 100; p.sprinting = course; for (let t = 0; t < H; t += dt) G.play.updateBody(dt); return 100 - p.food; };
  const hMarche = parHeure(false), hCourse = parHeure(true);
  // une journée type : levé à 6 h, couché à 22 h (16 h debout, un cinquième du temps à courir), une nuit de 8 h
  const debout = 16, nuitH = 8, fracCourse = 0.2;
  const jourFaim = debout * (hMarche * (1 - fracCourse) + hCourse * fracCourse);
  const pN = G.nouvelle(); pN.hp = 50; pN.food = 90; const n0 = { hp: pN.hp, food: pN.food };
  G.play.nuit(nuitH);
  const nuitFaim = n0.food - pN.food, nuitSoin = pN.hp - n0.hp;
  const total = jourFaim + nuitFaim;
  log(`\n1. LA FAIM ET LA VIE (une heure de jeu = ${f1(H)} s réelles ; une journée = ${G.JOUR_SECONDES / 60} min)`);
  log(`  faim par heure de jeu : ${f1(hMarche)} en marchant, ${f1(hCourse)} en courant ; une nuit de ${nuitH} h : faim −${f1(nuitFaim)}, vie +${f1(nuitSoin)}`);
  log(`  une journée type (debout 6 h → 22 h, 20 % du temps à courir, puis la nuit) : ${f1(jourFaim)} + ${f1(nuitFaim)} = ${f1(total)} de faim`);
  const REPAS = ['pain', 'omelette', 'soupe', 'viande_grillee', 'poisson_grille', 'ragout', 'carotte', 'pomme', 'baies', 'gardon', 'viande'];
  tableau(log, ['aliment', 'faim +', 'vie +', 'par jour'], REPAS.map((id) => { const it = G.ITEMS[id]; return [id + (it.raw ? ' (cru)' : ''), it.food, it.heal, f1(total / it.food)]; }));
  // cible : trois vrais repas par jour (pain, omelette, soupe : 20 à 30 chacun) ; un plat copieux (ragoût) en vaut deux
  const nPain = total / G.ITEMS.pain.food, nSoupe = total / G.ITEMS.soupe.food;
  if (!(nPain >= 2.5 && nPain <= 4.2)) echec(`il faut ${f1(nPain)} pains par jour (cible : 3 à 4, trois repas)`);
  if (!(nSoupe >= 1.8 && nSoupe <= 3.2)) echec(`il faut ${f1(nSoupe)} soupes par jour (cible : 2 à 3)`);
  if (!(nuitFaim > 0 && nuitFaim < jourFaim)) echec(`la nuit coûte ${f1(nuitFaim)} de faim (elle doit en coûter, et moins qu'une journée debout)`);

  // (b) le ventre vide : de rassasié (100) à vide, puis de vide à la mort (100 PV)
  const hVide = 100 / (hMarche * (1 - fracCourse) + hCourse * fracCourse);
  const p = G.nouvelle(); p.food = 0; p.hp = 100; let t = 0;
  while (!G.mort && t < 20 * H * 24) { G.play.updateBody(dt); t += dt; }
  const hMort = t / H;
  const hCreux = 30 / (hMarche * (1 - fracCourse) + hCourse * fracCourse); // premières plaintes du ventre (faim < 30)
  log(`  sans rien manger (debout) : rassasié → ventre vide en ${f1(hVide)} h de jeu ; ventre vide → mort (100 PV) en ${f1(hMort)} h (${f1(t / 60)} min réelles)`);
  log(`  des premiers gargouillis (faim < 30) à la mort : ${f1(hCreux + hMort)} h de jeu (${f1((hCreux + hMort) * H / 60)} min réelles)`);
  // cible : mourir de faim n'est ni instantané ni sans conséquence : une demi-journée à une journée le ventre vide
  if (!(hMort >= 8 && hMort <= 24)) echec(`ventre vide → mort en ${f1(hMort)} h de jeu (cible : 8 à 24 h)`);
  if (!(hVide + hMort >= 24 && hVide + hMort <= 72)) echec(`sans manger, mort en ${f1(hVide + hMort)} h debout (cible : un à trois jours)`);
  // (c) dormir le ventre vide ne sauve pas : trois « nuits » de 12 h de suite, sans manger, en partant de 100 PV
  const pS = G.nouvelle(); pS.food = 0; pS.hp = 100;
  const hp = [pS.hp];
  for (let k = 0; k < 3; k++) { G.play.nuit(12); hp.push(pS.hp); }
  log(`  dormir sans manger (nuits de 12 h, en partant de 100 PV) : ${hp.map(f0).join(' → ')} PV`);
  if (!(hp[1] < hp[0] - 20 && hp.every((v, i) => !i || v <= hp[i - 1]))) echec('dormir le ventre vide soigne encore, ou ne coûte rien (on survivrait sans manger en dormant)');
  if (!(pS.hp > 0)) echec('on meurt de faim pendant son sommeil (on se réveille, affaibli : la mort vient debout)');
  // dormir en saignant : une égratignure se referme, une vraie plaie empêche la nuit de soigner
  const pE = G.nouvelle(); pE.food = 90; pE.hp = 50; G.corps.saigner(0.1); G.play.nuit(nuitH);
  const egr = { hp: pE.hp, saigne: G.corps.saignement() };
  const pP = G.nouvelle(); pP.food = 90; pP.hp = 50; G.corps.saigner(0.4); G.play.nuit(nuitH);
  const plaie = { hp: pP.hp, saigne: G.corps.saignement() };
  log(`  dormir en saignant (50 PV) : une égratignure (0,1 PV/s) → ${f0(egr.hp)} PV, ${egr.saigne ? 'saigne encore' : 'refermée'} ; une vraie plaie (0,4 PV/s) → ${f0(plaie.hp)} PV, ${plaie.saigne ? 'saigne toujours (un bandage !)' : 'refermée'}`);
  if (egr.saigne > 0 || egr.hp <= 50) echec('une égratignure ne se referme pas pendant la nuit');
  if (plaie.hp > 50 || !(plaie.saigne > 0)) echec('une vraie plaie guérit en dormant, sans bandage');

  // (d) la vie qui remonte : par heure de jeu debout (bien nourri), et d'une mauvaise blessure (30 PV) à 100
  const pR = G.nouvelle(); pR.food = 90; pR.hp = 50; for (let t2 = 0; t2 < H; t2 += dt) G.play.updateBody(dt);
  const regenH = pR.hp - 50;
  const pB = G.nouvelle(); pB.food = 90; pB.hp = 30; G.play.nuit(nuitH); const apresNuit = pB.hp;
  const hFinir = (100 - apresNuit) / regenH;
  log(`  vie qui remonte, bien nourri : +${f1(regenH)} PV par heure de jeu debout (+${f0(regenH * 16)} pour une journée debout), +${f1(nuitSoin / nuitH)} par heure de sommeil`);
  log(`  d'une mauvaise blessure (30 PV) à 100 : une nuit (→ ${f0(apresNuit)}) puis ${f1(hFinir)} h debout`);
  // cible : une nuit et une demi-journée pour se remettre d'un grand coup ; dormir soigne plus vite que veiller
  if (!(regenH > 0 && regenH < nuitSoin / nuitH)) echec('dormir doit soigner plus vite que rester debout');
  if (!(hFinir >= 4 && hFinir <= 24)) echec(`après une nuit, encore ${f1(hFinir)} h pour guérir (cible : 4 à 24 h)`);
  void p0;
  return { hMarche, hCourse, total, hMort, regenH };
}

// ================================================================== 2. LES CHUTES
// Une chute de h mètres : le joueur lâché sans vitesse au-dessus du sol plat, le vrai Player.update (gravité, puis
// l'atterrissage de 11-zzz00-socle.js : corps.chute) ; n essais par hauteur pour la jambe et le saignement
function mesurerChutes(G, log, echec) {
  const ctl = { fwd: 0, right: 0, up: false, down: false, sprint: false };
  const chute = (h) => {
    const p = G.nouvelle();
    p.pos = [1500, h, 1500]; p.vel = [0, 0, 0]; p.onGround = false;
    let v = 0;
    for (let k = 0; k < 600 && !p.onGround; k++) { v = -p.vel[1]; p.update(1 / 60, G.game.world, ctl); }
    return { v, dmg: 100 - Math.max(0, p.hp), jambe: G.corps.jambeCassee(), saigne: G.corps.saignement() > 0, mort: !!G.mort || p.hp <= 0 };
  };
  const H = [1.5, 2.5, 3, 4, 5, 6, 8, 10, 12, 15], N = 300, rows = [], R = {};
  for (const h of H) {
    let dmg = 0, jambe = 0, saigne = 0, mort = 0, v = 0;
    for (let i = 0; i < N; i++) { const c = chute(h); dmg += c.dmg; jambe += c.jambe; saigne += c.saigne; mort += c.mort; v = c.v; }
    R[h] = { v, dmg: dmg / N, jambe: jambe / N, saigne: saigne / N, mort: mort / N };
    rows.push([h + ' m', f1(v) + ' m/s', f0(dmg / N), pc(jambe / N), pc(saigne / N), pc(mort / N)]);
  }
  log('\n2. LES CHUTES (vrai Player.update, puis corps.chute ; 300 essais par hauteur, 100 PV au départ)');
  tableau(log, ['hauteur', 'vitesse', 'PV perdus', 'jambe cassée', 'saigne', 'mort'], rows);
  const S = G.corps.C ? null : null; void S;
  log(`  jambe cassée : ${48} h de jeu à boiter (vitesse × 0,4) ; avec une attelle, 12 h (× 0,55) ; les sources chaudes la remettent trois fois plus vite`);
  // cibles : sauter d'un mur (2,5 m) ne fait rien ; la jambe peut casser dès 4-5 m ; on survit à 6 m ; 12 m tuent
  if (R[2.5].dmg > 0.5) echec(`un saut de 2,5 m coûte ${f1(R[2.5].dmg)} PV (cible : rien)`);
  if (!(R[5].jambe > 0.05 && R[4].jambe < R[6].jambe)) echec('la jambe doit pouvoir casser dès 5 m, et de plus en plus haut');
  if (R[6].mort > 0) echec('une chute de 6 m ne tue pas quelqu’un en pleine santé');
  if (R[12].mort < 0.95) echec(`une chute de 12 m tue ${pc(R[12].mort)} du temps (cible : toujours)`);
  return R;
}

// ================================================================== 3. LES BÊTES
// Un monde plat, la nuit ; le joueur (100 PV) reste où il est, debout, ou accroupi et immobile (« faire le mort »).
function bete(G, kind, x, z, cfg) {
  const e = G.entities.make(G.game.world, kind, x, z, null, {});
  if (cfg) e.cfg = cfg;
  e.y = 0; e.heading = Math.atan2(1500 - x, 1500 - z);
  return e;
}
function ctxBetes(G, o) {
  const p = G.game.player;
  return Object.assign({ night: 1, rain: 0, storm: 0, frozen: false, t: 0, right: [1, 0, 0], crouch: false, sprint: false, alive: true, inside: false, riding: false,
    lantern: false, fire: false, nearFarm: false, silent: false, px: p.pos[0], pz: p.pos[2], hurt: (d, src, cause) => G.play.hurt(d, src, cause) }, o || {});
}
// fait vivre des bêtes jusqu'à la mort du joueur ou tmax secondes ; renvoie les coups, le premier, la mort
function vivreBetes(G, liste, o, tmax) {
  const p = G.game.player, dt = 0.05, R = { coups: [], mort: null, t: 0 };
  let hp0 = p.hp;
  const hurt0 = G.play.hurt;
  G.play.hurt = function (d, src, cause) { R.coups.push({ t: R.t, d }); return hurt0.call(this, d, src, cause); };
  try {
    for (; R.t < tmax && !G.mort; R.t += dt) {
      const c = ctxBetes(G, Object.assign({ t: R.t }, o));
      for (const e of liste) {
        if (e.dead) continue;
        e.dist = Math.hypot(e.x - c.px, e.z - c.pz);
        G.entities.updateWalker(e, dt, G.game.world, c);
      }
      G.corps.update(dt);
      p.pos = [1500, 0, 1500]; p.vel = [0, 0, 0]; // il ne bouge pas (le recul des coups est annulé)
      if (o && o.crouch) p.crouch = 1;
      G.game.time += dt;
      hp0 = p.hp;
    }
  } finally { G.play.hurt = hurt0; }
  R.mort = G.mort ? R.t : null; R.hp = Math.max(0, hp0);
  return R;
}
function mesurerBetes(G, log, echec) {
  log('\n3. LES BÊTES (vraies IA : entities.wolfAI, chasse.danger / chasse.charger, beasts.snake ; la nuit, sur le plat)');
  const R = {};
  // --- les loups : une meute de trois, repérée à 40 m ; debout sans lumière, puis avec la lanterne allumée
  const meute = (o, n) => {
    const P = G.nouvelle(); void P;
    const L = [];
    for (let k = 0; k < (n || 3); k++) { const a = k * 2.1; L.push(bete(G, 'wolf', 1500 + Math.cos(a) * 40, 1500 + Math.sin(a) * 40)); }
    for (const e of L) e.pack = L;
    return vivreBetes(G, L, o, 120);
  };
  const essais = (fn, n) => { const out = []; for (let i = 0; i < n; i++) out.push(fn()); return out; };
  const moy = (a) => a.reduce((s, v) => s + v, 0) / Math.max(1, a.length);
  const W = essais(() => meute({}), 40), W1 = essais(() => meute({}, 1), 40), WL = essais(() => meute({ lantern: true }), 20);
  const premier = moy(W.map((r) => (r.coups[0] ? r.coups[0].t : 120))), morts = W.filter((r) => r.mort !== null);
  const duree = moy(morts.map((r) => r.mort - r.coups[0].t));
  const dur1 = moy(W1.filter((r) => r.mort !== null).map((r) => r.mort - r.coups[0].t));
  const dureeMin = Math.min(...morts.map((r) => r.mort - r.coups[0].t));
  // la pire rafale : les PV perdus en 5 s, au pire moment, sur tous les essais
  const rafale = Math.max(...W.map((r) => Math.max(0, ...r.coups.map((c0) => r.coups.filter((c) => c.t >= c0.t && c.t - c0.t < 5).reduce((s, c) => s + c.d, 0)))));
  R.loups = { premier, duree, dureeMin, rafale, dur1, morts: morts.length / W.length, coup: moy(W.map((r) => moy(r.coups.map((c) => c.d)))), lanterne: moy(WL.map((r) => r.coups.length)) };
  // --- l'ours et le sanglier en furie (on s'est trop approché) : ce qu'une charge coûte, en pleine santé
  const furie = (kind, o) => {
    G.nouvelle();
    const e = bete(G, kind, 1512, 1500, G.CHASSE_CALME[kind]);
    e.hp = e.hp0 = (kind === 'bear' ? 260 : 60);
    G.chasse.furie(e, 'joueur');
    const r = vivreBetes(G, [e], o, 40);
    return { r, coups: r.coups.length, pv: 100 - r.hp, mort: r.mort !== null, t1: r.coups[0] ? r.coups[0].t : null };
  };
  for (const [kind, nom] of [['bear', 'ours'], ['boar', 'sanglier']]) {
    const A = essais(() => furie(kind, {}), 400), D = essais(() => furie(kind, { crouch: true }), 400);
    R[nom] = { pv: moy(A.map((a) => a.pv)), mort: A.filter((a) => a.mort).length / A.length, coups: moy(A.map((a) => a.coups)), t1: moy(A.filter((a) => a.t1 !== null).map((a) => a.t1)),
      pvMort: moy(D.map((a) => a.pv)), mortMort: D.filter((a) => a.mort).length / D.length, max1: Math.max(...A.map((a) => (a.r.coups[0] ? a.r.coups[0].d : 0))) };
  }
  // --- la vipère : on passe tout près, debout
  G.nouvelle();
  const v = bete(G, 'snake', 1500.8, 1500);
  const rv = vivreBetes(G, [v], {}, 60);
  R.vipere = { pv: 100 - rv.hp, morsures: rv.coups.length };
  const T = G.CHASSE_DANGER;
  tableau(log, ['menace', 'avant le 1er coup', 'coup', 'PV perdus', 'mort (100 PV)', 'remarque'], [
    ['3 loups, sans lumière', f1(R.loups.premier) + ' s', f0(R.loups.coup), '—', pc(R.loups.morts), `mort ${f1(R.loups.duree)} s après la 1re morsure (au plus vite ${f1(R.loups.dureeMin)} s ; pire rafale : ${f0(R.loups.rafale)} PV en 5 s ; un seul loup : ${f1(R.loups.dur1)} s)`],
    ['3 loups, lanterne allumée', '—', '—', '—', '—', `${f1(R.loups.lanterne)} morsure(s) : ils n’approchent pas`],
    ['ours en furie', f1(R.ours.t1) + ' s', `${T.bear.degats[0]}–${T.bear.degats[1]}`, f0(R.ours.pv), pc(R.ours.mort), `${f1(R.ours.coups)} coups ; faire le mort : ${f0(R.ours.pvMort)} PV, ${pc(R.ours.mortMort)}`],
    ['sanglier en furie', f1(R.sanglier.t1) + ' s', `${T.boar.degats[0]}–${T.boar.degats[1]}`, f0(R.sanglier.pv), pc(R.sanglier.mort), `${f1(R.sanglier.coups)} coups ; faire le mort : ${f0(R.sanglier.pvMort)} PV`],
    ['vipère (debout, tout près)', '—', '7 + venin', f0(R.vipere.pv), '0 %', `${R.vipere.morsures} morsure(s) en une minute`],
  ]);
  log(`  menace avant la furie : l’ours grogne dès ${T.bear.alerte} m, charge ${pc(T.bear.pProche)} du temps après ${T.bear.patience} s à moins de ${T.bear.proche} m (${pc(T.bear.pSurprise)} si l’on arrive en courant à ${T.bear.surprise} m, ${pc(T.bear.pPetits)} près de ses petits) ; sinon il fuit`);
  log(`  le sanglier : ${T.boar.alerte} m, ${pc(T.boar.pProche)} après ${T.boar.patience} s à ${T.boar.proche} m ; les loups : la nuit seulement, tournent à 7 m avant d’attaquer ; le feu et la lanterne les tiennent à distance`);
  // cibles : une rencontre laisse le temps de réagir (quelques secondes avant le premier coup ; plus de 10 s pour
  // mourir d'une meute sans lumière) ; aucun premier coup ne tue en pleine santé ; la lanterne éloigne les loups ;
  // une furie d'ours tue parfois (un tiers au plus), un sanglier presque jamais ; faire le mort aide
  if (R.loups.premier < 3) echec(`les loups mordent ${f1(R.loups.premier)} s après vous avoir repéré (cible : 3 s au moins)`);
  if (R.loups.dureeMin < 10) echec(`une meute tue en ${f1(R.loups.dureeMin)} s après la première morsure, au pire (cible : 10 s au moins, le temps d’allumer la lanterne ou de fuir à l’abri)`);
  if (R.loups.rafale > 50) echec(`une meute peut prendre ${f0(R.loups.rafale)} PV en 5 s (cible : 50 au plus, pas de curée d’un coup)`);
  if (R.loups.lanterne > 0.5) echec('la lanterne allumée n’éloigne plus les loups');
  if (R.ours.max1 >= 100 || R.sanglier.max1 >= 100) echec('un premier coup tue quelqu’un en pleine santé');
  if (!(R.ours.mort > 0.05 && R.ours.mort <= 0.35)) echec(`une furie d’ours tue ${pc(R.ours.mort)} du temps en pleine santé (cible : 5 à 35 %)`);
  if (R.sanglier.mort > 0.05) echec(`une charge de sanglier tue ${pc(R.sanglier.mort)} du temps en pleine santé (cible : presque jamais)`);
  if (!(R.ours.pvMort < R.ours.pv)) echec('faire le mort devant l’ours n’aide pas');
  if (R.vipere.pv >= 50) echec(`une vipère coûte ${f0(R.vipere.pv)} PV (cible : une mauvaise morsure, pas la mort)`);
  return R;
}

// ================================================================== 4. LE FROID, L'EAU, LA GRÊLE, LE CHASSEUR
function mesurerMilieux(G, log, echec) {
  const H = G.JOUR_SECONDES / 24, dt = 0.05, w = G.game.world;
  const basis = { f: [0, 0, -1], r: [1, 0, 0], u: [0, 1, 0] };
  const nuit = G.computeSky(0.9, 300, {});
  // la noyade : sous l'eau, sans remonter (play.updateBody)
  let p = G.nouvelle(); w.waterLevel = 5; p.food = 90; let t = 0;
  while (!G.mort && t < 300) { G.play.updateBody(dt); t += dt; }
  const noyade = t; w.waterLevel = -1e9;
  // le froid de la montagne, la nuit, sans feu ni toit (vallee.update)
  p = G.nouvelle(); p.pos = [1500, 30, 1500]; p.food = 90;
  Object.assign(w, { designed: true, snowLine: 20, baseWater: 0 });
  G.vallee.coldAcc = 0; G.vallee.coldMsg = 0;
  t = 0; while (!G.mort && t < 1200) { G.vallee.update(dt, p.eyePos(), basis, nuit); t += dt; }
  const montagne = t; w.designed = false;
  // un jour de grand froid (neige dans toute la vallée), la nuit, dehors, sans feu (evNeige.update)
  const E = G.evenements;
  let neige = null;
  if (E && G.evNeige) {
    const r0 = E.retenir, r1 = E.reagir; E.retenir = () => {}; E.reagir = () => {};
    E.force.neige = true; w.time = 0.9;
    p = G.nouvelle(); p.food = 90; w.time = 0.9; G.evNeige.coldAcc = 0;
    t = 0; while (!G.mort && t < 1200) { G.evNeige.update(dt, p.eyePos(), basis, nuit); t += dt; }
    neige = t; delete E.force.neige; E.retenir = r0; E.reagir = r1; w.time = 0.4;
  }
  // la grêle : toute l'averse dehors, sans s'abriter (EV_FX.grele, sa durée en heures de jeu)
  const GR = J_EV(G, 'EV_FX.grele'), dureeGrele = J_EV(G, 'PRODIGES.grele.duree');
  let grele = null;
  if (GR && dureeGrele) {
    p = G.nouvelle(); const Eg = { k: 0.5, tapT: 0, hurtT: 0 };
    const pj = G.farm.s; void pj;
    for (t = 0; t < dureeGrele * H && !G.mort; t += dt) GR.update(Eg, dt, p.eyePos());
    grele = 100 - p.hp;
  }
  log('\n4. LE FROID, L’EAU, LA GRÊLE (vrai code : updateBody, vallee.update, evNeige.update, EV_FX.grele ; 100 PV au départ)');
  const hj = (s) => `${f0(s)} s (${f1(s / H)} h de jeu)`;
  tableau(log, ['menace', 'jusqu’à la mort', 'remarque'], [
    ['noyade (sous l’eau)', hj(noyade), 'le souffle tient 25 s, puis la vie part vite'],
    ['froid : montagne, la nuit', hj(montagne), 'sans feu ni toit ; la faim y vient deux fois plus vite'],
    ['froid : jour de neige, la nuit', neige ? hj(neige) : '—', 'dehors, sans feu, sans manteau de fourrure'],
    ['grêle (toute l’averse dehors)', grele !== null ? `${f0(grele)} PV perdus` : '—', `l’averse dure ${dureeGrele} h de jeu`],
  ]);
  // cibles : l'eau tue vite (quelques dizaines de secondes) ; le froid tue petit à petit : quelques heures de jeu
  // pour trouver un feu, un toit ou redescendre ; la grêle blesse sans tuer
  if (!(noyade >= 20 && noyade <= 60)) echec(`noyade en ${f0(noyade)} s (cible : 20 à 60 s)`);
  if (!(montagne / H >= 3 && montagne / H <= 8)) echec(`le froid de la montagne tue en ${f1(montagne / H)} h de jeu (cible : 3 à 8 h, le temps de trouver un feu ou un toit)`);
  if (neige !== null && !(neige / H >= 3 && neige / H <= 8)) echec(`le froid d’un jour de neige tue en ${f1(neige / H)} h de jeu (cible : 3 à 8 h)`);
  if (grele !== null && !(grele > 5 && grele <= 35)) echec(`une averse de grêle coûte ${f0(grele)} PV (cible : 5 à 35, elle blesse sans tuer)`);

  // --- le chasseur du Chassedi : tapi dans les fougères, à portée, sans rouge ni lanterne ni signe
  const C = G.chasse, n = { x: 1550, y: 0, z: 1500, name: 'Chasseur', d: { id: 'chasseur', surname: 'X' }, st: { alive: true }, viseT: 0, heading: 0 };
  const sauve = { chasseurs: C.chasseurs, signale: C.signale, fougeres: C.dansLesFougeres, vue: C.ligneDeVue, debut: C.debutAccident, finVise: C.finVise, sonTir: C.sonTir, heure: G.npcs.hour, rem: G.npcs.remember };
  let accidents = 0;
  C.chasseurs = () => [n]; C.signale = () => false; C.dansLesFougeres = () => true; C.ligneDeVue = () => true; C.debutAccident = () => { accidents++; };
  C.finVise = () => {}; C.sonTir = () => {}; G.npcs.hour = () => 10; G.npcs.remember = () => {};
  let heuresTapi = 0;
  try {
    p = G.nouvelle(); p.crouch = 1;
    const N = 400; // 400 heures de jeu tapi (en tranches d'une heure)
    for (let k = 0; k < N; k++) { C.accT = 0; for (let s = 0; s < H; s += 0.25) C.verifAccident(0.25); heuresTapi++; }
    var parHeure = accidents / heuresTapi;
    // le coup de feu : mortel d'un coup, ou une balle (saignement, parfois la jambe)
    let morts = 0, pv = 0, jambe = 0, tirs = 0;
    for (let k = 0; k < 400; k++) { const q = G.nouvelle(); q.hp = 100; C.tirAccident(n); n.accourt = null; tirs++; if (G.mort) morts++; else { pv += 100 - q.hp; jambe += G.corps.jambeCassee() ? 1 : 0; } }
    var letal = morts / tirs, pvBalle = pv / Math.max(1, tirs - morts), pJambe = jambe / Math.max(1, tirs - morts);
  } finally {
    C.chasseurs = sauve.chasseurs; C.signale = sauve.signale; C.dansLesFougeres = sauve.fougeres; C.ligneDeVue = sauve.vue; C.debutAccident = sauve.debut;
    C.finVise = sauve.finVise; C.sonTir = sauve.sonTir; G.npcs.hour = sauve.heure; G.npcs.remember = sauve.rem;
  }
  log(`  le chasseur (Chassedi, battue, tapi dans les fougères à portée, sans brassard rouge ni lanterne) : ${pc(parHeure)} de risque par heure de jeu ;`);
  log(`    le coup part après 1,2 s de visée (se lever, bouger, siffler l’arrête) : mortel ${pc(letal)} du temps en pleine santé, sinon ${f0(pvBalle)} PV, un saignement, la jambe ${pc(pJambe)}`);
  // cible : rare mais possible (le chasseur vous prend pour du gibier) ; une matinée entière tapi : quelques pour cent
  if (!(parHeure > 0.005 && parHeure < 0.06)) echec(`accident de chasse : ${pc(parHeure)} par heure tapi (cible : 0,5 à 6 %)`);
  if (!(letal > 0.1 && letal < 0.5)) echec(`la balle tue ${pc(letal)} du temps (cible : parfois, pas toujours)`);
}
function J_EV(G, expr) { try { return G.__J.ev(expr); } catch (e) { return null; } }

// ================================================================== 5. CE QU'ON MANGE : poisons, nausées, délais (effets)
// Chaque aliment est mangé 300 fois par un joueur en pleine santé, qui ne fait rien ensuite (pas d'antidote) :
// le vrai play.eat (et ses emballages), puis effets.update pendant 10 minutes réelles.
function mesurerAliments(G, log, echec) {
  const dt = 0.1, R = {};
  const IDS = ['aconit', 'belladone_baies', 'colchique', 'digitale', 'muguet', 'amanite', 'mandragore', 'champignon', 'viande', 'gardon', 'anguille', 'morille', 'baies_sureau', 'haricot', 'pain', 'herbes'];
  for (const id of IDS) {
    if (!G.ITEMS[id]) continue;
    let mort = 0, pv = 0, delai = 0, nd = 0, pvMax = 0;
    for (let k = 0; k < 300; k++) {
      const p = G.nouvelle(); p.food = 90; p.hp = 100;
      G.farm.give(id, 1);
      G.play.eat(id);
      const S = G.effets.S();
      const d0 = S.file.length ? Math.min(...S.file.map((e) => e.at - S.t)) : (S.actifs.length ? 0 : null);
      if (d0 !== null) { delai += d0; nd++; }
      for (let t = 0; t < 600 && !G.mort; t += dt) { G.effets.update(dt, p.eyePos(), { f: [0, 0, -1], r: [1, 0, 0] }); G.play.updateBody(dt); }
      if (G.mort) mort++;
      const perte = 100 - Math.max(0, p.hp);
      pv += perte; pvMax = Math.max(pvMax, perte);
    }
    R[id] = { mort: mort / 300, pv: pv / 300, delai: nd ? delai / nd : null, raw: !!G.ITEMS[id].raw };
  }
  log('\n5. CE QU’ON MANGE (vrai play.eat puis effets.update pendant 10 min réelles ; 300 essais, 100 PV, sans antidote)');
  tableau(log, ['aliment', 'mort', 'PV perdus (moy.)', '1er effet après'], Object.keys(R).map((id) => [id + (R[id].raw ? ' (cru)' : ''), pc(R[id].mort), f0(R[id].pv), R[id].delai !== null ? f0(R[id].delai) + ' s' : '—']));
  // cibles : ce qu'on mange tous les jours ne tue jamais (poisson cru, viande crue, champignons, pain) ; les grands
  // poisons (aconit, belladone, colchique) tuent souvent ; aucun poison n'agit à l'instant (on a le temps de
  // chercher un antidote : dix secondes au moins en moyenne)
  for (const id of ['champignon', 'viande', 'gardon', 'pain', 'baies_sureau', 'haricot', 'morille', 'herbes']) if (R[id] && R[id].mort > 0) echec(`${id} tue (${pc(R[id].mort)})`);
  if (R.anguille && R.anguille.mort > 0.05) echec(`une anguille crue tue ${pc(R.anguille.mort)} du temps (un poisson de pêche : malade, rarement mort)`);
  for (const id of ['aconit', 'belladone_baies', 'colchique']) if (R[id] && !(R[id].mort >= 0.3)) echec(`${id} ne tue que ${pc(R[id].mort)} du temps (un grand poison doit tuer souvent)`);
  for (const id of ['aconit', 'belladone_baies', 'colchique', 'digitale', 'muguet', 'amanite']) if (R[id] && R[id].delai !== null && R[id].delai < 10) echec(`${id} agit en ${f0(R[id].delai)} s (cible : 10 s au moins)`);
  return R;
}

// ================================================================== 6. L'ALCOOL
function mesurerAlcool(G, log, echec) {
  const A = G.alcool, H = G.JOUR_SECONDES / 24, dt = 0.25;
  const coma0 = A.coma;
  const boire = (liste) => {
    G.nouvelle(); G.farm.s.alcool = null; A.S(); A.niv = 0;
    let pic = 0, coma = false, t = 0, sobre = null;
    A.coma = function () { coma = true; };
    try {
      for (const id of liste) { G.farm.give(id, 1); G.game.player.food = 50; G.play.eat(id); }
      for (; t < 20 * H; t += dt) { A.update(dt); const g = A.S().g; pic = Math.max(pic, g); if (pic >= 1 && g < 1 && sobre === null) sobre = t; if (coma) break; }
    } finally { A.coma = coma0; }
    return { pic, coma, sobre: sobre === null ? null : sobre / H };
  };
  const CAS = [['une chope de cidre', ['cidre']], ['deux verres de vin', ['vin', 'vin']], ['trois chopes de bière', ['biere', 'biere', 'biere']], ['deux gnôles', ['gnole', 'gnole']],
    ['trois gnôles, d’un coup', ['gnole', 'gnole', 'gnole']], ['quatre gnôles, d’un coup', ['gnole', 'gnole', 'gnole', 'gnole']]];
  const R = {};
  for (const [nom, l] of CAS) R[nom] = boire(l);
  log(`\n6. L’ALCOOL (vrai play.eat puis alcool.update ; élimination ${G.ALCOOL_ELIM} unité par seconde réelle = ${f1(G.ALCOOL_ELIM * H)} par heure de jeu ; coma à ${G.ALCOOL_COMA})`);
  tableau(log, ['on boit', 'pic dans le sang', 'ivre (≥ 1) pendant', 'coma'], CAS.map(([nom]) => [nom, f1(R[nom].pic), R[nom].sobre !== null ? f1(R[nom].sobre) + ' h' : (R[nom].pic < 1 ? '—' : '…'), R[nom].coma ? 'oui' : 'non']));
  log('  (coma : on tombe 3 à 9 h, −12 PV et plus ; au-delà de 10,5 dans le sang, 45 % d’en mourir)');
  // cibles : boire un verre ou deux ne fait pas tomber ; trois gnôles d'un coup, si ; l'ivresse d'un verre passe en une heure ou deux
  if (R['deux verres de vin'].coma || R['trois chopes de bière'].coma || R['deux gnôles'].coma) echec('deux ou trois verres font tomber dans le coma');
  if (!R['quatre gnôles, d’un coup'].coma) echec('quatre gnôles d’un coup ne font pas tomber (l’abus doit coûter)');
  const s1 = R['deux verres de vin'].sobre;
  if (s1 !== null && !(s1 >= 0.5 && s1 <= 5)) echec(`deux verres de vin : ivre ${f1(s1)} h (cible : 0,5 à 5 h de jeu)`);
}

// ================================================================== 7. LA MENTALITÉ (cachée) : des journées types
// Le vrai esprit.update (soleil, nuit dehors, peur…) et sommeil.update (fatigue) tournent heure après heure ;
// les gestes de la journée (repas, chien, bêtes tuées, vols, quêtes, réveil) passent par les vraies fonctions
// quand elles existent sans le monde (effets.manger, chien.repas/caresser, espritBete, esprit.reveil), sinon par
// esprit.changer avec les valeurs du jeu. Chaque scénario : 5 journées de suite, depuis 80 (ou 30 pour remonter).
function mesurerMentalite(G, log, echec) {
  const w = G.game.world, E = G.esprit, SO = G.sommeil, dtR = 0.5, H = G.JOUR_SECONDES / 24;
  const basis = { f: [0, 0, -1], r: [1, 0, 0], u: [0, 1, 0] };
  const beteTuee = (kind) => G.__J.avec({ kind }, 'espritBete({ kind: __v.kind, cfg: CREATURES[__v.kind] || {}, h: (CREATURES[__v.kind] || {}).h || 1 })');
  E.silhouette = () => false;
  const vrai = (p, h) => p.some(([a, b]) => h >= a && h < b);
  // une journée : de 6 h à 6 h le lendemain ; J = { dehors, lanterne, coucher, lieu, repas: [[h, id]], chien, betes: [[h, kind]], carcasses, gestes: [[h, delta, raison, plafond]] }
  function journee(J) {
    const s = G.farm.s, p = G.game.player;
    const faits = new Set();
    let dort = false;
    for (let h = 6; h < 30; h += dtR / H) {
      const hh = h % 24;
      w.time = hh / 24;
      if (!dort) {
        s.hours += dtR / H;
        const dehors = vrai(J.dehors || [], h);
        w.covered = () => !dehors;
        const sky = G.computeSky(w.time, 300, {});
        G.game.lantern = !!(J.lanterne && sky.night > 0.5 && dehors);
        G.vallee.rainK = J.pluie ? 0.6 : 0;
        p.food = 60;
        E.update(dtR, p.eyePos(), basis, sky, true);
        SO.update(dtR, p.eyePos(), basis, sky, true);
        for (const [hr, id] of J.repas || []) if (h >= hr && !faits.has('r' + hr)) { faits.add('r' + hr); G.effets.manger(id); }
        if (J.chien && h >= 7.5 && !faits.has('chien')) { faits.add('chien'); G.chien.repas(26, true); G.chien.caresser(null); }
        for (const [hr, kind] of J.betes || []) if (h >= hr && !faits.has('b' + hr)) { faits.add('b' + hr); beteTuee(kind); }
        for (let k = 0; k < (J.carcasses || 0); k++) if (h >= 14 + k && !faits.has('c' + k)) { faits.add('c' + k); E.changer(-1.5, 'carcasse', 6); }
        for (const [hr, d, raison, cap] of J.gestes || []) if (h >= hr && !faits.has('g' + hr + raison)) { faits.add('g' + hr + raison); E.changer(d, raison, cap); }
        if (J.coucher && h >= J.coucher) {
          // la nuit : le temps saute jusqu'à 6 h ; au réveil, la mentalité juge la nuit, la fatigue retombe
          const v0 = E.niveau();
          const hn = 30 - h; s.hours += hn; dort = true;
          s.day++; E.lastH = null; SO.lastH = null;
          E.reveil(J.lieu || 'ferme', v0, 60, s.hours - hn);
          SO.reveille();
        }
      }
    }
    if (!dort) { s.day++; }
    return E.niveau();
  }
  const ORDINAIRE = { dehors: [[6.5, 12], [13, 18.5], [19, 20.5]], lanterne: true, coucher: 22, lieu: 'ferme', repas: [[7, 'soupe'], [12.5, 'ragout'], [19.5, 'soupe']], chien: true };
  const SC = {
    'ordinaire (soleil, trois repas, le chien, lanterne le soir, couché à 22 h)': { j: ORDINAIRE },
    'jour de pluie, sans le chien, du pain': { j: Object.assign({}, ORDINAIRE, { pluie: true, chien: false, repas: [[7, 'pain'], [12.5, 'pain'], [19.5, 'pain']] }) },
    'chasse : quatre bêtes tuées, trois carcasses': { j: Object.assign({}, ORDINAIRE, { betes: [[9, 'deer'], [11, 'roe'], [15, 'rabbit'], [16, 'boar']], carcasses: 3 }) },
    'dehors la nuit sans lumière, jusqu’à minuit': { j: Object.assign({}, ORDINAIRE, { dehors: [[6.5, 12], [13, 24]], lanterne: false, coucher: 24 }) },
    'nuits blanches (jamais couché)': { j: Object.assign({}, ORDINAIRE, { dehors: [[6.5, 12], [13, 18]], coucher: null }) },
    'mal agir : vols, effraction, bêtes, nuit dehors': { j: Object.assign({}, ORDINAIRE, { dehors: [[6.5, 12], [13, 23]], lanterne: false, coucher: 23, betes: [[10, 'deer'], [15, 'fox']],
      gestes: [[9, -0.8, 'vol à la tire', 2.4], [9.5, -0.8, 'vol à la tire', 2.4], [16, -2.5, 'crime : vol'], [21, -3, 'effraction', 6]] }) },
    'remonter : depuis 30, journées ordinaires et une quête': { j: Object.assign({}, ORDINAIRE, { gestes: [[15, 4, 'quête', 10]] }), depart: 30 },
  };
  log('\n7. LA MENTALITÉ, cachée, de 0 à 100 (vrai esprit.update + sommeil.update ; plafonds du jour : −' + G.__J.ev('ESPRIT_BAISSE_JOUR') + ' / +' + G.__J.ev('ESPRIT_HAUSSE_JOUR') + ')');
  log('  repères : l’étrange se montre plus souvent sous 70 (bizarrerie), murmures sous 40, silhouettes sous 30');
  const R = {};
  const lignes = [];
  for (const nom in SC) {
    const { j, depart } = SC[nom];
    G.nouvelle(); G.farm.s.esprit = depart || 80; E.cumulJour = -1; E.lastH = null; E.journal.length = 0; SO.lastH = null; SO.lastSt = null;
    G.farm.s.sommeil = null; SO.S(); SO.reveille(); SO.stadePrev = 0;
    const niv = [G.farm.s.esprit];
    for (let d = 0; d < 5; d++) niv.push(journee(j));
    R[nom] = niv;
    lignes.push([nom, ...niv.map(f0)]);
  }
  tableau(log, ['scénario (5 journées)', 'départ', 'j1', 'j2', 'j3', 'j4', 'j5'], lignes);
  const k = Object.keys(SC), ord = R[k[0]], pluie = R[k[1]], chasse = R[k[2]], nuit = R[k[3]], blanche = R[k[4]], mal = R[k[5]], rem = R[k[6]];
  const jusqua = (niv, seuil) => { const i = niv.findIndex((v) => v <= seuil); return i < 0 ? '> 5' : String(i); };
  log(`  mal agir : 40 atteint au jour ${jusqua(mal, 40)} ; nuits blanches : 40 au jour ${jusqua(blanche, 40)} ; remonter de 30 à 60 : jour ${(() => { const i = rem.findIndex((v) => v >= 60); return i < 0 ? '> 5' : i; })()}`);
  // cibles : une partie normale reste stable (ou monte) ; les mauvais jours la font glisser en JOURS, pas en minutes ;
  // elle remonte petit à petit (pas en une journée)
  if (ord.some((v, i) => i && v < ord[i - 1] - 1)) echec('une journée ordinaire fait baisser la mentalité');
  if (pluie[5] < pluie[0] - 5) echec('une suite de jours de pluie, sans le chien, fait trop baisser la mentalité (cible : stable, à peu près)');
  if (!(chasse[1] >= chasse[0] - 8)) echec('une journée de chasse fait chuter la mentalité (cible : elle baisse un peu, au plus)');
  if (!(nuit[5] < ord[5])) echec('marcher la nuit sans lumière ne pèse pas sur la mentalité');
  // (la fatigue ne mord qu'après vingt heures debout : la première nuit blanche se paie le lendemain)
  if (!(blanche.slice(2).every((v, i) => v < blanche[i + 1] - 5) && blanche[5] < mal[5])) echec('sans sommeil, la mentalité doit baisser chaque jour, plus vite qu’en agissant mal');
  if (!(blanche[2] >= blanche[1] - 20)) echec('une seule nuit blanche fait trop chuter la mentalité');
  if (blanche.findIndex((v) => v <= 40) >= 0 && blanche.findIndex((v) => v <= 40) < 3) echec('sans dormir, la mentalité tombe à 40 en moins de trois jours');
  if (!(mal[1] < mal[0] && mal[5] < mal[0] - 15)) echec('mal agir chaque jour ne fait pas assez baisser la mentalité');
  if (mal.findIndex((v) => v <= 40) >= 0 && mal.findIndex((v) => v <= 40) < 2) echec('mal agir fait tomber la mentalité à 40 en moins de deux jours (cible : en jours, petit à petit)');
  if (!(rem[1] < 50 && rem[5] >= 60)) echec(`remonter de 30 : ${rem.map(f0).join(' → ')} (cible : petit à petit, 60 en quelques jours, pas en un)`);
  return R;
}

// ================================================================== le module
module.exports = {
  titre: 'Survie : faim, vie, chutes, bêtes, froid, poisons, alcool, mentalité',
  async verifier(J, log) {
    let echecs = 0;
    const echec = (m) => { echecs++; log('  ✗ ' + m); };
    const G = vivant(J);
    avecGraine(1, () => mesurerFaim(G, log, echec));
    avecGraine(2, () => mesurerChutes(G, log, echec));
    avecGraine(3, () => mesurerBetes(G, log, echec));
    avecGraine(4, () => mesurerMilieux(G, log, echec));
    avecGraine(5, () => mesurerAliments(G, log, echec));
    avecGraine(6, () => mesurerAlcool(G, log, echec));
    avecGraine(7, () => mesurerMentalite(G, log, echec));
    return { echecs };
  },
};
