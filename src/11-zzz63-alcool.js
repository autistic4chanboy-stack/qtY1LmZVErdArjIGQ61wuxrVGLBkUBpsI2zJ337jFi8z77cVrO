// ============================================================================
//  CORPS ET ESPRIT (4) : SON PROPRE ALCOOL. Le tonneau (déjà là : cidre, vin,
//  bière d'orge et de houblon) fait aussi l'hydromel, la cervoise, les liqueurs
//  et le vin de noix ; l'alambic du bouilleur de cru (objet à poser : la forge
//  en vend, l'aubergiste en donne le plan) distille le cidre, le vin, la bière,
//  les prunes, les poires, les cerises, le raisin et le grain, avec du bois ou
//  du charbon pour la chauffe.
//  Boire (clic, comme manger) : l'ivresse monte doucement — la vue tangue, les pas
//  dérivent, la peur recule, le moral monte un peu puis retombe ; trop, et l'on
//  vomit, on trébuche, on tombe (coma éthylique, parfois mortel). Le lendemain :
//  la gueule de bois. On vend ses bouteilles à l'aubergiste.
//  État : farm.s.alcool = { g (dans le sang), estomac, jourN, jourDay, gueule, … }.
//  API : alcool.boire(unités, src), alcool.niveau(), alcool.gueule(), alcool.soulager().
//  Essais : alcool.fixer(g).
// ============================================================================
const ALCOOL_ELIM = 0.015; // unités éliminées par seconde réelle
const ALCOOL_COMA = 7.2;   // au-delà : on tombe
const ALCOOL_PALIERS = [null,
  ['(Une chaleur agréable vous monte aux joues.)', '(Ça réchauffe. Le monde est un peu plus aimable.)'],
  ['(Le sol a une légère pente, qu’il n’avait pas tout à l’heure.)', '(Vous riez d’une chose qui n’est pas drôle.)'],
  ['(Tout tourne. Vous riez tout seul, puis plus du tout.)', '(Vos jambes ne vont plus tout à fait où vous leur dites.)'],
];

// ---------------------------------------------------------------- les boissons
{
  const U = { biere: 1, cidre: 1, vin: 1.5 };
  for (const id in U) if (ITEMS[id]) ITEMS[id].alcool = U[id];
  // des bouteilles qu'on distingue (l'icône « bouteille » est celle du lait)
  if (ITEMS.cidre) ITEMS.cidre.ic = ['h_bouteille', '#e0a840', '#e8dcc0'];
  if (ITEMS.vin) ITEMS.vin.ic = ['h_bouteille', '#7a1a34', '#e8dcc0'];
  if (ITEMS.biere) ITEMS.biere.ic = ['h_bouteille', '#c88a30', '#f0e8d0'];
}
defItem('hydromel', 'Hydromel', 'nourriture', 110, ['h_bouteille', '#e8b848', '#f0e0b0'], { food: 6, heal: 5, alcool: 1.5, desc: 'Du miel, de l’eau, et un tonneau oublié à la cave. La boisson des anciens.' });
defItem('cervoise', 'Cervoise', 'nourriture', 55, ['h_bouteille', '#b87a30', '#e8dcc0'], { food: 8, heal: 2, alcool: 1, desc: 'Une bière d’orge sans houblon, trouble et douce, comme on en brassait avant.' });
defItem('eau_de_vie_cidre', 'Eau-de-vie de cidre', 'nourriture', 160, ['h_flasque', '#d8a040'], { food: 1, heal: 2, alcool: 2.5, desc: 'Du cidre passé à l’alambic. Ça réchauffe jusqu’aux orteils.' });
defItem('gnole', 'Gnôle de prune', 'nourriture', 150, ['h_cruche', '#8a7a6a'], { food: 1, heal: 2, alcool: 3, desc: 'Claire comme de l’eau, et ce n’en est pas. La gnôle des bouilleurs de cru.' });
defItem('eau_de_vie_poire', 'Eau-de-vie de poire', 'nourriture', 180, ['h_flasque', '#e4ecd8'], { food: 1, heal: 2, alcool: 2.5, desc: 'Toute la poire, sans la poire.' });
defItem('kirsch', 'Kirsch', 'nourriture', 170, ['h_flasque', '#f0e8f0'], { food: 1, heal: 2, alcool: 2.5, desc: 'L’eau-de-vie des cerises, avec un goût d’amande au fond.' });
defItem('marc', 'Marc de raisin', 'nourriture', 170, ['h_flasque', '#e0c070'], { food: 1, heal: 2, alcool: 2.8, desc: 'On distille ce qui reste du raisin une fois pressé. Rien ne se perd.' });
defItem('fine', 'Fine de vin', 'nourriture', 190, ['h_flasque', '#b8783a'], { food: 1, heal: 2, alcool: 2.5, desc: 'Du vin passé à l’alambic. Les messieurs de la ville en boivent dans de petits verres.' });
defItem('eau_de_vie_grain', 'Eau-de-vie de grain', 'nourriture', 120, ['h_flasque', '#f4f4f0'], { food: 1, heal: 1, alcool: 2.5, desc: 'De l’orge, du seigle ou de la bière, distillés. Ça brûle la gorge, puis le reste.' });
defItem('liqueur_gentiane', 'Liqueur de gentiane', 'nourriture', 160, ['h_bouteille', '#e0c030', '#e8dcc0'], { food: 2, heal: 4, alcool: 2, desc: 'Amère comme la montagne. On dit que ça ouvre l’appétit et ferme les plaies.' });
defItem('liqueur_cassis', 'Liqueur de cassis', 'nourriture', 150, ['h_bouteille', '#4a1030', '#e8dcc0'], { food: 4, heal: 2, alcool: 1.8, desc: 'Noire et sucrée. Les dames du bourg en boivent en cachette.' });
defItem('vin_noix', 'Vin de noix', 'nourriture', 140, ['h_bouteille', '#3a2412', '#e8dcc0'], { food: 3, heal: 3, alcool: 1.5, desc: 'Des noix vertes, macérées dans le vin. Pour l’apéritif du dimanche.' });
defItem('vin_chaud', 'Vin chaud', 'nourriture', 70, ['bol', '#8a2040'], { food: 8, heal: 10, alcool: 1.2, desc: 'Du vin, du miel, et le feu. Rien de tel pour les soirs de neige.' });
RECIPES.push({ out: 'vin_chaud', n: 1, need: { vin: 1, miel: 1 }, st: 'feu' });
// ce que certains alcools font en plus (voir 11-zzz61-nourriture.js)
Object.assign(ALIMENTS_EFFETS, {
  gnole: { c: 'une gnôle frelatée', r: [['vue_trouble', 0.06, 15, 40]] },
  eau_de_vie_grain: { c: 'une eau-de-vie frelatée', r: [['vue_trouble', 0.04, 15, 40]] },
  liqueur_gentiane: { r: [['vigueur', 0.3, 10, 40]] },
  hydromel: { r: [['calme', 0.3, 20, 60]] },
  vin_chaud: { r: [['calme', 0.4, 10, 40], ['soin', 0.3, 10, 30]] },
});
const ALCOOLS = Object.keys(ITEMS).filter((id) => ITEMS[id].alcool);

// ---------------------------------------------------------------- l'alambic du bouilleur de cru
PLACEABLES.alambic_cru = { name: 'Alambic de bouilleur de cru', price: 380, machine: true };
defItem('alambic_cru', 'Alambic de bouilleur de cru', 'objet', 380, ['objet', 'alambic_cru'], { place: 'alambic_cru', desc: 'Une cuve de cuivre sur un foyer, un col de cygne, un serpentin dans un tonneau d’eau. E dessus avec ce qu’il faut distiller en main, et du bois (ou du charbon) dans la sacoche.' });
RECIPES.push({ out: 'alambic_cru', n: 1, need: { lingot_cuivre: 4, lingot_fer: 1, pierre: 8 }, st: 'etabli' });
LOCKED_RECIPES.add('alambic_cru');
PROP_USE_MORE.alambic_cru = 'm';
PROP_COLL.alambic_cru = [0.9, 0.6, 1.5];
{
  const DIST = [['cidre', 2, 'eau_de_vie_cidre', 5], ['prune', 6, 'gnole', 6], ['poire', 6, 'eau_de_vie_poire', 6], ['cerise', 6, 'kirsch', 6], ['raisin', 6, 'marc', 6],
    ['vin', 2, 'fine', 5], ['biere', 2, 'eau_de_vie_grain', 5], ['cervoise', 2, 'eau_de_vie_grain', 5], ['orge', 5, 'eau_de_vie_grain', 8], ['seigle', 5, 'eau_de_vie_grain', 8]];
  MACHINES.alambic_cru = [];
  for (const fuel of [{ bois: 2 }, { charbon: 1 }]) for (const [src, n, out, h] of DIST) if (ITEMS[src] && ITEMS[out]) MACHINES.alambic_cru.push({ in: Object.assign({ [src]: n }, fuel), out: [out, 1], h });
  MACHINE_HINT.alambic_cru = 'L’alambic attend de quoi distiller (cidre, vin, bière, prunes, poires, cerises, raisin, orge ou seigle), et du bois ou du charbon pour la chauffe.';
  // le tonneau : hydromel, cervoise, liqueurs, vin de noix
  for (const r of [
    { in: { miel: 2 }, out: ['hydromel', 1], h: 10 },
    { in: { orge: 3 }, out: ['cervoise', 1], h: 6 },
    { in: { gentiane: 2, eau_de_vie_grain: 1, miel: 1 }, out: ['liqueur_gentiane', 2], h: 12 },
    { in: { gentiane: 2, gnole: 1, miel: 1 }, out: ['liqueur_gentiane', 2], h: 12 },
    { in: { cassis: 4, eau_de_vie_grain: 1, miel: 1 }, out: ['liqueur_cassis', 2], h: 12 },
    { in: { cassis: 4, gnole: 1, miel: 1 }, out: ['liqueur_cassis', 2], h: 12 },
    { in: { noix: 6, vin: 1 }, out: ['vin_noix', 1], h: 12 },
  ]) if (Object.keys(r.in).every((k) => ITEMS[k]) && ITEMS[r.out[0]]) MACHINES.tonneau.push(r);
  MACHINE_HINT.tonneau = 'Le tonneau attend des fruits (pommes, poires, raisin, baies…), de l’orge et du houblon pour la bière, du miel pour l’hydromel — ou des plantes, du miel et de l’eau-de-vie pour une liqueur.';
}
// les boutiques : la forge vend l'alambic ; l'aubergiste achète les bouteilles
{
  const S = (id) => NPC_DATA.find((d) => d.id === id);
  const F = S('forgeron');
  if (F && F.shop) F.shop.sells.push(['alambic_cru', 380]);
  const A = S('aubergiste');
  if (A && A.shop) for (const id of ALCOOLS) if (!A.shop.buys.includes(id) && id !== 'vin_chaud') A.shop.buys.push(id);
}
Object.assign(PROP_MODELS, {
  alambic_cru(E, o) {
    const cu = rgbf('#c8743a'), cu2 = rgbf('#a85a2a'), brique = rgbf('#9a5038');
    const chauffe = !!(o.data && o.data.m);
    // foyer de briques et sa gueule
    E.bx(0, 0, 0, 1.1, 0.62, 1.1, brique, TL.brick);
    E.fl = chauffe ? FX_EMIT : 0;
    E.bx(0, 0.08, 0.551, 0.42, 0.3, 0.02, chauffe ? [1.5, 0.62, 0.22] : [0.07, 0.06, 0.05], chauffe ? TL.ember : 0);
    E.fl = 0;
    // la cuve, le chapiteau, le col de cygne
    E.bx(0, 0.62, 0, 0.92, 0.5, 0.92, cu, TL.metal);
    E.bx(0, 0.62, 0, 0.98, 0.08, 0.98, cu2, TL.metal);
    E.bx(0, 1.12, 0, 0.62, 0.26, 0.62, cu, TL.metal);
    E.bx(0, 1.38, 0, 0.32, 0.22, 0.32, cu, TL.metal);
    E.box(0.5, 1.5, 0, 0.9, 0.08, 0.08, cu2, TL.metal, 0, 0, -0.42);
    // le serpentin dans son tonneau d'eau, et le robinet
    E.bx(1.05, 0, 0, 0.62, 0.95, 0.62, WHITE, TL.barrel);
    E.bx(1.05, 0.94, 0, 0.56, 0.02, 0.56, rgbf('#4a6a7a'), TL.plain);
    E.bx(1.05, 0.2, 0.33, 0.06, 0.06, 0.14, cu2, TL.metal);
    // le seau qui recueille
    E.bx(1.05, 0, 0.55, 0.26, 0.2, 0.26, WHITE, TL.wood);
  },
});

// ---------------------------------------------------------------- les icônes : bouteilles de couleur, flasques, cruche de grès
{
  const _ip = iconPaint;
  iconPaint = function (shape, c1, c2) {
    if (shape !== 'h_bouteille' && shape !== 'h_flasque' && shape !== 'h_cruche') return _ip(shape, c1, c2);
    const pb = new PixelBuf(16, 16), P = rampOf(c1 || '#aaaaaa'), Q = hexToRgb(c2 || '#e8dcc0');
    const R = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) pb.set(x, y, typeof c === 'function' ? c(x, y) : c); };
    const verre = (x, y, x0, w) => rampPick(P, 0.95 - (x - x0) / w * 0.7, x, y);
    if (shape === 'h_bouteille') {
      R(5, 6, 10, 15, (x, y) => verre(x, y, 5, 6));
      R(7, 2, 8, 5, (x, y) => verre(x, y, 7, 2));
      R(7, 1, 8, 1, [120, 84, 50]);
      R(5, 9, 10, 12, Q); R(6, 10, 9, 10, C(Q, 0.7));
      pb.set(6, 7, [255, 255, 255]); pb.set(6, 13, C(P[3], 1.1).map((v) => Math.min(255, v)));
    } else if (shape === 'h_flasque') {
      drawSphere(pb, 8, 10.5, 4.8, ramp(['#8aa0a8', '#c8dce4', '#f0fafc']), 3, {});
      drawSphere(pb, 8, 11, 3.8, P, 5, {});
      R(7, 2, 8, 5, [196, 214, 220]); R(7, 1, 8, 1, [120, 84, 50]);
      pb.set(6, 8, [255, 255, 255]);
    } else {
      drawSphere(pb, 8, 10, 5.4, ramp(['#6a5e52', '#8e8274', '#b8ac9c']), 7, { sq: 0.95 });
      R(6, 3, 9, 5, [150, 140, 126]); R(6, 2, 9, 2, [110, 80, 50]);
      drawLine(pb, 12, 6, 14, 9, [120, 110, 98], 1); drawLine(pb, 14, 9, 12, 12, [120, 110, 98], 1);
      R(5, 9, 10, 10, [70, 60, 52]);
    }
    return pb;
  };
}

// ============================================================================
//  BOIRE
// ============================================================================
const alcool = {
  niv: 0, comaEnCours: false, remarques: {}, hoqT: 12, trebT: 8, vomT: 30,
  S() {
    const s = farm.s;
    if (!s) return null;
    const A = s.alcool || (s.alcool = { g: 0, estomac: 0, jourN: 0, jourDay: 0, gueule: 0, gueuleK: 0, pic: 0, total: 0, comas: 0 });
    if (!(A.g >= 0)) A.g = 0;
    if (!(A.estomac >= 0)) A.estomac = 0;
    return A;
  },
  niveau() { const A = this.S(); return A ? A.g + A.estomac * 0.5 : 0; },
  gueule() { const A = this.S(); return !!(A && A.gueule > farm.s.hours); },
  // on a bu u unités (une chope : 1, un verre de vin : 1,5, une goutte de gnôle : 3)
  boire(u, src) {
    const s = farm.s, A = this.S();
    if (!A || !(u > 0)) return;
    A.estomac += u; A.total += u;
    if (A.jourDay !== s.day) { A.jourDay = s.day; A.jourN = 0; }
    A.jourN += u;
    esprit.changer(0.5, 'boire', 1); // (un verre remonte un peu le moral : moins qu'un bon repas, voir survie.js)
    if (this.gueule()) { A.gueule = Math.max(s.hours, A.gueule - 2); effets.dire('(Le mal de tête recule un peu. Le remède du cheval.)'); }
    sound.gorgee && sound.gorgee(u);
  },
  soulager() { const A = this.S(); if (A && this.gueule()) { A.gueule = Math.max(farm.s.hours, A.gueule - 3); effets.dire('(Ça va un peu mieux. La tête cogne moins fort.)'); } },
  fixer(g) { const A = this.S(); if (A) { A.g = Math.max(0, +g || 0); A.estomac = 0; } return A && A.g; },

  update(dt) {
    const A = this.S();
    if (!A || game.mode !== 'play' || game.dying || game.sleeping) return;
    const s = farm.s, p = game.player, t = game.time;
    // l'alcool passe dans le sang, puis s'en va
    if (A.estomac > 0) { const a = Math.min(A.estomac, dt * (0.05 + A.estomac * 0.012)); A.estomac -= a; A.g += a; }
    if (A.g > 0) A.g = Math.max(0, A.g - dt * ALCOOL_ELIM);
    A.pic = Math.max(A.pic || 0, A.g);
    const g = A.g, niv = g >= 4.5 ? 3 : g >= 2.5 ? 2 : g >= 1 ? 1 : 0;
    if (niv > this.niv && ALCOOL_PALIERS[niv]) effets.dire(pick(ALCOOL_PALIERS[niv]));
    if (niv === 0 && this.niv > 0 && A.pic >= 2.5) {
      effets.dire(A.pic >= 5 ? '(L’ivresse retombe d’un coup. Il ne reste qu’une grande fatigue, et de la honte.)' : '(L’ivresse retombe. Un peu de tristesse, sans raison.)');
      esprit.changer(A.pic >= 5 ? -3 : -1.5, 'le vin triste', 5);
      A.pic = 0;
    }
    this.niv = niv;
    // la gueule de bois
    if (this.gueule()) {
      const k = A.gueuleK || 0.5;
      p.mods.speed *= 1 - 0.12 * k;
      if (p.stamina > 0.75) p.stamina = 0.75;
      if (!A.gueuleDit) { A.gueuleDit = true; effets.dire(k > 0.7 ? '(Une gueule de bois carabinée. La tête dans un étau, la bouche comme du vieux cuir.)' : '(Mal au crâne. Vous avez trop bu, hier.)', 4.5); }
      if (A.gueule - s.hours > (A.gueuleDur || 4) - 1) play.nausea = Math.max(play.nausea || 0, 0.6 * k);
    }
    if (!niv || cine.on) return;
    // le courage : la peur recule
    strange.fear = (strange.fear || 0) * (1 - clamp(g / 6, 0, 0.75));
    const moving = Math.hypot(p.vel[0], p.vel[2]) > 0.4;
    // les pas qui dérivent
    if (niv >= 2 && !p.riding && p.onGround && !p.swimming) {
      const D = (niv >= 3 ? 1.3 : 0.55) * (moving ? 1 : 0.3);
      const v = D * Math.sin(t * 0.55 + Math.sin(t * 1.7) * 1.3), add = v * Math.min(1, dt * 15);
      p.vel[0] += Math.cos(p.yaw) * add; p.vel[2] += -Math.sin(p.yaw) * add;
    }
    if (niv >= 3) p.mods.speed *= 0.85;
    // hoquets
    if (niv >= 2) { this.hoqT -= dt; if (this.hoqT <= 0) { this.hoqT = 12 + Math.random() * 26; sound.hoquet && sound.hoquet(); } }
    // on trébuche, on vomit
    if (niv >= 3) {
      this.trebT -= dt;
      if (this.trebT <= 0) {
        this.trebT = 7 + Math.random() * 9;
        if (moving && !p.riding) {
          const side = Math.random() < 0.5 ? -1 : 1;
          p.vel[0] += Math.cos(p.yaw) * 2.6 * side; p.vel[2] += -Math.sin(p.yaw) * 2.6 * side;
          game.shakeT = Math.max(game.shakeT || 0, 0.35);
          sound.step && sound.step('hard', 1.4);
          if (Math.random() < 0.3) effets.dire('(Vous manquez de tomber.)', 2.5);
        }
      }
      this.vomT -= dt;
      if (this.vomT <= 0) { this.vomT = 25 + Math.random() * 25; if (Math.random() < 0.25 + (g - 4.5) * 0.1) vomir(1); }
    }
    if (g >= ALCOOL_COMA) this.coma();
  },
  // la vue tangue
  camera(dt, pos, yaw, pitch) {
    const A = this.S();
    if (!A || (typeof cine !== 'undefined' && cine.on)) return null;
    const g = A.g;
    if (g < 1) return null;
    const t = game.time, k = Math.min(0.05, (g - 0.6) * 0.008);
    return { pos, yaw: yaw + (Math.sin(t * 0.8) + Math.sin(t * 2.1) * 0.3) * k, pitch: pitch + Math.sin(t * 1.15 + 1) * k * 0.6 };
  },
  fx(fx) {
    const A = this.S();
    if (!A) return;
    if (A.g >= 1) { fx[2] = Math.max(fx[2], Math.min(0.45, (A.g - 1) * 0.08)); fx[0] = Math.max(fx[0], Math.min(0.35, (A.g - 2) * 0.06)); }
    if (this.gueule()) fx[0] = Math.max(fx[0], (0.12 + 0.15 * Math.abs(Math.sin(game.time * 1.3))) * (A.gueuleK || 0.5));
  },
  // ivre mort : on tombe, on se réveille des heures plus tard… ou jamais
  async coma() {
    if (this.comaEnCours || game.sleeping || game.dying) return;
    this.comaEnCours = true;
    const A = this.S(), g = A.g, w = game.world, p = game.player;
    game.sleeping = true;
    ui.close(true);
    await ui.fade(true, 'Le sol monte à votre rencontre. Plus rien.', 1400);
    await new Promise((r) => setTimeout(r, 2000));
    const dehors = !w.covered(...p.eyePos()), h0 = npcs.hour(), nuit = h0 >= 21 || h0 < 5;
    if (g >= 10.5 && Math.random() < 0.45) { game.sleeping = false; this.comaEnCours = false; game.die('Mort d’avoir trop bu'); return; }
    if (dehors && nuit && strange.killerActive() && Math.random() < 0.4) { game.sleeping = false; this.comaEnCours = false; game.die('Ivre mort dehors, une nuit où l’on ne dort pas dehors'); return; }
    const h = clamp(3 + (g - ALCOOL_COMA) * 1.5, 3, 9), t0 = w.time, t1 = t0 + h / 24;
    game.skipHours(h);
    w.time = t1 >= 1 ? t1 - 1 : t1;
    if ((t0 < 0.25 && t1 >= 0.25) || t1 >= 1.25) { const keep = w.time; w.time = 0.25; game.dayStart(); w.time = keep; }
    game.lastT = w.time;
    npcs.snap(w);
    p.hp = Math.max(5, p.hp - (12 + (g - ALCOOL_COMA) * 6)); p.food = Math.max(0, p.food - 15); p.vel = [0, 0, 0];
    A.g = 1.5; A.estomac = 0; A.pic = 0; A.comas = (A.comas || 0) + 1;
    this.niv = 1;
    let vole = 0;
    if (dehors && Math.random() < 0.35) { vole = Math.floor(farm.s.money * 0.15); farm.s.money -= vole; }
    esprit.changer(-3, 'ivre mort');
    farm.save();
    await ui.fade(false, '', 1400);
    game.sleeping = false; this.comaEnCours = false;
    ui.subtitle('', dehors ? '(Vous vous réveillez dans l’herbe mouillée, la bouche pâteuse. Vous ne savez plus comment vous êtes arrivé là.)' + (vole ? ' (Votre bourse est plus légère.)' : '') : '(Vous vous réveillez par terre, la joue collée au plancher. Quelle heure est-il ?)', 5);
  },
  // le temps sauté (sommeil) : l'alcool s'en va
  sauter(sec) { const A = this.S(); if (!A) return; A.g = Math.max(0, A.g + A.estomac - sec * ALCOOL_ELIM); A.estomac = 0; if (!A.g) { A.pic = 0; this.niv = 0; } },
};

// ---------------------------------------------------------------- points d'accroche
HOOKS.update.push((dt) => { if (farm.s && !game.dying) alcool.update(dt); });
HOOKS.camera.push((dt, pos, yaw, pitch) => (farm.s ? alcool.camera(dt, pos, yaw, pitch) : null));
HOOKS.fx.push((fx) => { if (farm.s) alcool.fx(fx); });
// la gueule de bois : si l'on a bu hier (3 unités ou plus), ou si l'on s'est couché ivre
HOOKS.day.push(() => {
  const s = farm.s, A = alcool.S();
  if (!A) return;
  const u = (A.jourDay === s.day - 1 || A.jourDay === s.day ? A.jourN : 0) + (A.g || 0) * 0.5;
  if (u >= 3) {
    const dur = clamp(1.5 + u * 0.9, 2, 12);
    A.gueule = s.hours + dur; A.gueuleDur = dur; A.gueuleK = clamp(u / 7, 0.3, 1); A.gueuleDit = false;
    esprit.changer(-1.5, 'gueule de bois');
  }
  if (A.jourDay !== s.day) A.jourN = 0;
});
HOOKS.load.push((saved) => {
  const s = farm.s;
  if (!saved || !s.alcool) s.alcool = null;
  alcool.S(); alcool.niv = 0; alcool.comaEnCours = false; alcool.remarques = {};
  if (alcool.branche) return;
  alcool.branche = true;
  // le temps sauté : l'alcool s'élimine
  const _skip = game.skipHours.bind(game);
  game.skipHours = function (h) { const r = _skip(h); try { if (h > 0) alcool.sauter(h * JOUR_SECONDES / 24); } catch (e) { console.error(e); } return r; };
  // l'aubergiste : la gnôle, les recettes, un verre au comptoir
  const _options = talk.options.bind(talk);
  talk.options = function () {
    const n = this.n, opts = _options();
    if (n && n.d.id === 'aubergiste' && n.st.alive && !npcs.murdererKnown()) {
      const i = Math.max(0, opts.findIndex((o) => o.act === 'bye'));
      const extra = [{ label: alcool.S().appris ? 'Parlez-moi encore de la gnôle' : 'Vous savez faire de la gnôle ?', act: 'h_gnole' }, { label: 'Un verre de cidre, patron ! (4 pièces)', act: 'h_verre' }];
      opts.splice(i, 0, ...extra);
    }
    return opts;
  };
  const _choose = talk.choose.bind(talk);
  talk.choose = function (act) {
    const n = this.n, s = farm.s, A = alcool.S();
    if (act === 'h_gnole' && n) {
      const deja = A.appris;
      A.appris = true;
      for (const r of ['tonneau', 'alambic_cru']) { s.known[r] = 1; if (typeof savoir !== 'undefined') savoir.apprendreRecette(r, 'aubergiste'); }
      npcs.addAmitie(n, deja ? 2 : 10);
      return this.view(deja ? 'Le secret, c’est la patience. Et de jeter la première goutte qui coule : la tête, qu’on l’appelle. Elle rend aveugle. Le reste, ça réchauffe les honnêtes gens.'
        : 'Si je sais ? Mon grand-père était bouilleur de cru, avec le privilège et tout ! Le cidre, ça se fait tout seul dans un tonneau : des pommes, de la patience. La bière, il faut de l’orge et du houblon ; sans houblon, c’est de la cervoise, comme au temps des moines. L’hydromel, du miel, et oublier le tonneau à la cave. Pour la gnôle, il vous faut un alambic : des prunes, des poires, du cidre ou du vin dans la cuve, et du bois dessous. Tenez, je vous dessine l’engin, et le tonneau avec. Et si vous en faites de la bonne, je vous l’achète. De la mauvaise aussi, remarquez : passé le troisième verre, mes clients ne font plus la différence.', this.options());
    }
    if (act === 'h_verre' && n) {
      if (alcool.niveau() >= 4) return this.view('Ah non, l’ami. Vous avez votre compte pour ce soir. Rentrez, et prenez le chemin le plus droit.', this.options());
      if (!farm.pay(4)) return this.view('Quatre pièces, le verre. Et je ne fais pas crédit, même aux têtes sympathiques.', this.options());
      sound.coin && sound.coin();
      alcool.boire(1, 'cidre');
      game.player.food = Math.min(100, game.player.food + 4);
      npcs.addAmitie(n, 3);
      return this.view(pick(['À la vôtre ! Et à la ferme !', 'Tchin ! Il est de cette année, il pique encore un peu.', 'Buvez, buvez : c’est le cidre qui fait les bons voisins.']), this.options());
    }
    return _choose(act);
  };
  // les habitants sentent l'alcool
  const _open = talk.open.bind(talk);
  talk.open = function (n) {
    const v = _open(n);
    try {
      const g = alcool.S().g, s = farm.s;
      if (v && v.text && g >= 3 && n && n.st.alive && !npcs.murdererKnown() && alcool.remarques[n.id] !== s.day) {
        alcool.remarques[n.id] = s.day;
        if (n.d.id === 'aubergiste') v.text = 'Ho ho ! On a fait honneur à la bouteille, à ce que je vois ! ' + v.text;
        else { npcs.addAmitie(n, -4); v.text = pick(['(Il fronce le nez.) Vous sentez la gnôle à trois pas. ', '(Un regard sur vos yeux rouges.) Vous avez bu. ', '(On recule d’un pas.) Hum. Bonne journée, hein. ']) + v.text; }
      }
    } catch (e) { console.error(e); }
    return v;
  };
});

// ---------------------------------------------------------------- les bruits de la boisson
Object.assign(SoundEngine.prototype, {
  gorgee(u = 1) {
    if (!this.ok) return;
    const t = this.at(), n = u >= 2.5 ? 1 : 3;
    for (let i = 0; i < n; i++) { this.tone(t + i * 0.32, 'sine', 320, 180, 0.12, 0.05); this.noiseHit(t + i * 0.32 + 0.05, 0.1, 'lowpass', 700, 0.8, 0.05); }
    if (u >= 2.5) this.voice(t + 0.5, 'sawtooth', 240, 150, 0.35, 0.025, this.sfx, { bp: 700, q: 1.2 }); // « ha ! »
  },
  hoquet() { if (!this.ok) return; const t = this.at(); this.voice(t, 'square', 420, 250, 0.09, 0.03, this.sfx, { bp: 900, q: 1.5 }); this.noiseHit(t, 0.05, 'bandpass', 1300, 1.2, 0.03); },
});
