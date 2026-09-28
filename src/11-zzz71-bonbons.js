// ============================================================================
//  PILULES DE JOIE ET PAYS DES BONBONS
//  - les pilules se trouvent un peu partout : fouilles, caisses, coffres, par
//    terre au bord des chemins, et chez le marchand de joie (un homme en
//    redingote verte qui attend certains soirs au bord d'un chemin) ;
//  - on en avale une (clic) : la vallée devient le pays des bonbons (ciel rose,
//    arbres-sucettes, herbe de guimauve, bêtes en sucre, habitants en pain
//    d'épice, un château de dragées et des maisons de pain d'épice qui se
//    dressent autour de soi, des plantes et des bêtes qui n'existent que là) ;
//  - puis vient la retombée : les Ténèbres (11-zzz72), d'autant plus longues et
//    dures qu'on en a abusé ; l'accoutumance oblige à en prendre davantage ; le
//    manque suit.
//  API : pilules.avaler(), pilules.etat(), pilules.donner(n)
//  Sauvegarde : farm.s.pilules ; état du monde : farm.s.mondes.bonbons
// ============================================================================
ITEM_CAT_NAMES.ailleurs = 'Choses d’ailleurs';
defItem('pilule_joie', 'Pilule de joie', 'nourriture', 12, ['md_pilule', '#f06aa8', '#fff4fa'], { food: 1, pilule: true, desc: 'Une petite gélule rose et blanche, dans un papier plié. « Pour la joie », dit le papier. Clic : l’avaler.' });
defItem('barbe_a_papa', 'Barbe à papa', 'ailleurs', 0, ['md_barbe', '#f6a8cc'], { desc: 'Du sucre filé, rose, qui ne colle pas aux doigts. Bizarrement léger.' });
defItem('sucette', 'Sucette', 'ailleurs', 0, ['md_sucette', '#f05890', '#fff6fa'], { desc: 'Une sucette cueillie sur une tige. Elle sent la fraise et le fer.' });
defItem('guimauve', 'Guimauve', 'ailleurs', 0, ['md_guimauve', '#f8b8d0', '#fffafc'], { desc: 'Un champignon de guimauve, tiède et moelleux.' });
defItem('sucre_orge', 'Sucre d’orge', 'ailleurs', 0, ['md_canne', '#e02848'], { desc: 'Un bâton de sucre d’orge qui poussait dans l’herbe.' });
defItem('dragee', 'Dragées', 'ailleurs', 0, ['md_dragee', '#f4a8c8', '#a8e4c8'], { desc: 'Des cailloux de sucre, lisses et froids.' });
defItem('gomme', 'Oursons en gomme', 'ailleurs', 0, ['md_ourson', '#e8243e'], { desc: 'Ce qui reste d’un ourson en gomme. Encore tiède.' });
defItem('couronne_sucre', 'Couronne de sucre', 'ailleurs', 420, ['couronne', '#f6b0d0'], { desc: 'Une couronne de sucre candi, donnée par un roi de pain d’épice. Elle ne fond pas. Elle ne devrait pas exister.' });
defItem('crin_licorne', 'Crin irisé', 'ailleurs', 260, ['md_crin', '#f0a0c0'], { desc: 'Un crin aux sept couleurs, arraché à une bête qui n’existe pas. Il est là, pourtant.' });
// ce que deviennent les bonbons quand la vision s'en va (null : rien ; même id : ça reste)
const BONBONS_RETOUR = { barbe_a_papa: 'fibre', sucette: 'pierre', guimauve: 'champignon', sucre_orge: 'os', dragee: 'pierre', gomme: 'viande', couronne_sucre: 'couronne_sucre', crin_licorne: 'crin_licorne' };
// on en trouve un peu partout
for (const [k, w] of [['campement', 0.7], ['charrette', 0.5], ['hameau', 0.6], ['cave', 0.6], ['crypte', 0.4], ['fouille', 0.35], ['marais', 0.3], ['refuge', 0.35], ['envers', 0.6], ['vivres', 0.25], ['ruines', 0.4]])
  if (LOOT[k]) LOOT[k].items.push(['pilule_joie', 1, 2, w]);

// ---------------------------------------------------------------- les pilules
const pilules = {
  P() {
    const s = farm.s;
    const P = s.pilules || (s.pilules = {});
    if (!P.recent) Object.assign(P, { prises: 0, tol: 0, recent: [], phase: null, dose: 0, attente: null, manque: 0, sol: [], solJour: 0, marchand: null });
    return P;
  },
  etat() { const P = this.P(); return { phase: P.phase, dose: P.dose, tolerance: +P.tol.toFixed(2), prises: P.prises, manque: P.manque > farm.s.hours, finBonbons: P.finBonbons, finTenebres: P.finTenebres, sol: P.sol.length }; },
  donner(n) { farm.give('pilule_joie', n || 1); },
  // prises des dernières 24 heures
  abus() { const h = farm.s.hours; return this.P().recent.filter((t) => h - t < 24).length; },
  // pour le cauchemar : dormir pendant une vision, ou juste après, c'est rêver mal
  risqueCauchemar() { const P = this.P(); if (P.phase) return 25; if (P.manque > farm.s.hours) return 6; return this.abus() ? 3 : 1; },
  avaler() {
    const P = this.P(), s = farm.s, h = s.hours;
    if (mondes.aPart()) { ui.subtitle('', '(Rien ne passe, ici.)', 2.5); return; }
    if (!farm.take('pilule_joie', 1)) return;
    sound.eat && sound.eat(); play.eatT = 0.8; play.cool = 0.9;
    P.prises++;
    P.recent = P.recent.filter((t) => h - t < 72); P.recent.push(h);
    const abus = this.abus();
    P.tol = Math.min(7, P.tol + 0.55 + (abus > 2 ? 0.35 : 0));
    if (P.manque > h) { P.manque = 0; ui.subtitle('', '(Le manque se tait d’un coup. Vos mains cessent de trembler.)', 3.5); }
    if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(3, 'pilule de joie');
    // déjà dedans : ça redouble (ou ça replonge, depuis les Ténèbres)
    if (P.phase === 'bonbons' || P.phase === 'monte') {
      P.dose++; P.finBonbons += 2.2 / (1 + P.tol * 0.25); this.calerTenebres();
      ui.subtitle('', pick(['(Les couleurs redoublent. Vous riez tout seul.)', '(Encore plus de sucre dans l’air. C’est merveilleux. C’est trop.)']), 3.5);
      return;
    }
    if (P.phase === 'tenebres') {
      P.dose++;
      ui.subtitle('', '(La pilule chasse le noir… un peu. Juste un peu.)', 3.5);
      this.commencer(0.5 + 1.5 / (1 + P.tol * 0.4), true);
      return;
    }
    // l'accoutumance : il en faut plus
    const A = P.attente && h - P.attente.t < 0.6 ? P.attente : (P.attente = { n: 0, t: h });
    A.n++;
    const force = A.n / (1 + Math.max(0, P.tol - 1.2) * 0.45);
    if (force < 0.5) {
      ui.subtitle('', pick(['(Rien. Un goût de craie, c’est tout. Il en faudrait une autre.)', '(Rien ne vient. Avant, une suffisait.)', '(Vous attendez. Rien. Votre cœur bat quand même plus vite.)']), 4);
      return;
    }
    P.attente = null;
    P.dose = A.n;
    this.commencer(Math.min(9, (3 + 2.4 * Math.min(force, 2.5)) * (0.75 + Math.random() * 0.4)), false);
  },
  // début de la vision (durée des bonbons en heures)
  commencer(dureeB, direct) {
    const P = this.P(), h = farm.s.hours;
    P.phase = direct ? 'bonbons' : 'monte';
    P.t0 = h; P.finMonte = h + (direct ? 0 : 0.55); P.finBonbons = P.finMonte + dureeB;
    this.calerTenebres();
    if (direct) mondes.entrer('bonbons', { duree: dureeB, pilule: true });
    else ui.subtitle('', pick(['(Un goût sucré vous monte au nez. Les couleurs frémissent.)', '(Quelque chose, au bord des yeux, devient rose.)']), 4);
  },
  // la retombée : d'autant plus longue qu'on en a pris, et qu'on en abuse
  calerTenebres() {
    const P = this.P(), abus = this.abus();
    const d = Math.min(11, 1.6 + 1.1 * P.dose + 1.6 * Math.max(0, abus - 1) + P.tol * 0.45);
    P.dureeTenebres = d; P.finTenebres = P.finBonbons + d;
    P.durete = clamp((P.dose - 1) * 0.25 + Math.max(0, abus - 1) * 0.3 + P.tol * 0.06, 0, 1.5);
  },
  descente() {
    const P = this.P();
    if (P.phase !== 'bonbons') return;
    P.phase = 'tenebres';
    mondes.entrer('tenebres', { duree: P.finTenebres - farm.s.hours, durete: P.durete, pilule: true });
  },
  fin() {
    const P = this.P(), h = farm.s.hours;
    const avait = P.phase;
    P.phase = null; P.dose = 0;
    if (mondes.cur === 'bonbons' || mondes.cur === 'tenebres') mondes.sortir();
    if (avait && P.tol >= 1.8) { P.manque = h + 5 + P.tol * 2.5; P.manqueT = 30; }
  },
  update(dt, playing) {
    const P = this.P(), h = farm.s.hours;
    if (P.phase) {
      if (mondes.aPart()) return; // un rêve ou les Enfers : la vision attend
      if (h >= P.finTenebres) { this.fin(); return; }
      if (P.phase === 'monte') { mondes.voile[0] = 0.45 * clamp((h - P.t0) / Math.max(0.05, P.finMonte - P.t0), 0, 1); if (h >= P.finMonte) { P.phase = 'bonbons'; mondes.entrer('bonbons', { duree: P.finBonbons - h, pilule: true }); } }
      else if (P.phase === 'bonbons' && h >= P.finBonbons) this.descente();
      else if (P.phase === 'bonbons' && mondes.cur !== 'bonbons') mondes.entrer('bonbons', { pilule: true });
      else if (P.phase === 'tenebres' && mondes.cur !== 'tenebres') mondes.entrer('tenebres', { duree: P.finTenebres - h, durete: P.durete, pilule: true });
    }
    // le manque
    if (P.manque > h && playing && !mondes.cur) {
      P.manqueT = (P.manqueT || 30) - dt;
      if (P.manqueT <= 0) {
        P.manqueT = 35 + Math.random() * 60;
        const r = Math.random();
        if (r < 0.4) ui.subtitle('', pick(['(Une pilule. Juste une. Pour que ça s’arrête.)', '(Vous avez froid, puis chaud. Vos mains tremblent.)', '(Tout est gris. Tout était si beau, avant.)', '(Vous fouillez vos poches sans y penser.)']), 4);
        else if (r < 0.7) { strange.glitchT = Math.max(strange.glitchT, 0.35); sound.heartbeat(0.6); }
        else { mondes.flashTenebres = 1.2; MSON.cri(0.25, 0.8, 0.8, Math.random() * 2 - 1); }
        game.shakeT = Math.max(game.shakeT, 0.25);
        if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-1, 'manque');
      }
    }
    this.updateSol(dt);
    this.updateMarchand(dt, playing);
  },
  nouveauJour() {
    const P = this.P();
    P.tol = Math.max(0, P.tol - 0.45);
    // des pilules tombées au bord des chemins (de nouvelles chaque jour ou presque)
    const w = game.world, rnd = mulberry32(farm.s.seed * 13 + farm.s.day * 7919);
    P.sol = P.sol.filter((q) => farm.s.day - q.j < 6);
    const n = rnd() < 0.55 ? 1 + (rnd() < 0.3 ? 1 : 0) : 0;
    const nodes = w.nav.nodes.filter((q) => /chemin|route|hameau|place|pont/.test(q.tag) && !q.iso);
    for (let k = 0; k < n && P.sol.length < 6 && nodes.length; k++) {
      const q = nodes[(rnd() * nodes.length) | 0], a = rnd() * TAU, d = 1.5 + rnd() * 4;
      const x = q.x + Math.cos(a) * d, z = q.z + Math.sin(a) * d;
      if (w.heightAt(x, z) < w.waterLevel + 0.3 || w.covered(x, w.heightAt(x, z) + 0.5, z)) continue;
      P.sol.push({ x: Math.round(x * 10) / 10, z: Math.round(z * 10) / 10, j: farm.s.day, n: rnd() < 0.2 ? 2 : 1, id: farm.s.day * 10 + k });
    }
    // le marchand de joie viendra-t-il ce soir ?
    P.marchand = rnd() < 0.3 * bizarrerie() && farm.s.day >= 2 ? { j: farm.s.day, h: 19 + rnd() * 2.5 } : null;
  },
  // ------------------------------------------------------------- pilules par terre
  updateSol(dt) {
    this.solT = (this.solT || 0) - dt;
    if (this.solT > 0) return;
    this.solT = 1;
    const P = this.P(), p = game.player, w = game.world;
    this.solProches = P.sol.filter((q) => Math.abs(q.x - p.pos[0]) < 60 && Math.abs(q.z - p.pos[2]) < 60);
    for (const q of this.solProches) if (q.y === undefined) q.y = w.heightAt(q.x, q.z);
  },
  dessinerSol(buf) {
    const L = this.solProches;
    if (!L || !L.length) return;
    const tg = game.target;
    PE.buf = buf;
    for (const q of L) {
      PE.frame(q.x, q.y, q.z, q.id * 1.7, 1);
      PE.fl = tg && tg.pilule === q ? FX_HI : 0;
      PE.box(0, 0.03, 0, 0.16, 0.06, 0.12, [0.96, 0.93, 0.86], TL.paper, 0.3);
      PE.box(0.03, 0.08, 0.01, 0.05, 0.03, 0.03, [0.98, 0.5, 0.72], TL.plain);
      PE.box(0.07, 0.08, 0.01, 0.05, 0.03, 0.03, [1, 0.97, 0.98], TL.plain);
      PE.fl = 0;
    }
  },
  ciblesSol(eye, f, cand) {
    for (const q of this.solProches || []) {
      const dx = q.x - eye[0], dy = q.y + 0.05 - eye[1], dz = q.z - eye[2], d = Math.hypot(dx, dy, dz);
      if (d > 2.6 || (dx * f[0] + dy * f[1] + dz * f[2]) / d < 0.8) continue;
      cand({ kind: 'hook', pilule: q, use: () => this.ramasser(q) }, d);
    }
  },
  ramasser(q) {
    const P = this.P(), i = P.sol.indexOf(q);
    if (i < 0) return;
    P.sol.splice(i, 1); this.solProches = (this.solProches || []).filter((x) => x !== q);
    farm.give('pilule_joie', q.n || 1); play.flyer('pilule_joie', [q.x, q.y + 0.3, q.z], q.n || 1); sound.pop();
    if (!P.vuSol) { P.vuSol = 1; ui.subtitle('', '(Un papier plié, dans l’herbe. Dedans, une petite gélule rose. « Pour la joie ».)', 4.5); }
  },
  // ------------------------------------------------------------- le marchand de joie
  updateMarchand(dt, playing) {
    const P = this.P(), h = npcs.hour(), p = game.player, w = game.world;
    const M = this.m;
    const soir = P.marchand && P.marchand.j === farm.s.day && h >= P.marchand.h && h < 23.8;
    if (!M && soir && !mondes.aPart() && !P.marchand.parti) {
      // il attend au bord d'un chemin, pas trop près, pas trop loin
      let best = null;
      for (const q of w.nav.nodes) {
        if (!/chemin|route/.test(q.tag) || q.iso) continue;
        const d = Math.hypot(q.x - p.pos[0], q.z - p.pos[2]);
        if (d < 35 || d > 110) continue;
        if (!best || Math.abs(d - 60) < Math.abs(best.d - 60)) best = { q, d };
      }
      if (best) {
        const x = best.q.x + 1.6, z = best.q.z + 0.8;
        this.m = { x, z, y: w.heightAt(x, z), heading: 0, rig: humanRig({ skin: '#ece2d8', hair: '#2a1a14', hairStyle: 'court', hat: 'chapeau', hatCol: '#1e3a26', top: '#2a5a3a', bottom: '#1e2a22', shoe: '#141414', coat: true, face: TL.face, height: 1.08, build: 'mince', held: 'lanterne' }), t: 0 };
      }
      return;
    }
    if (!M) return;
    M.t += dt;
    const d = Math.hypot(M.x - p.pos[0], M.z - p.pos[2]);
    M.heading = turnToward(M.heading, Math.atan2(p.pos[0] - M.x, p.pos[2] - M.z), dt * 2);
    if (!soir || d > 240 || mondes.aPart()) { this.m = null; if (P.marchand && d < 240) P.marchand.parti = true; return; }
    if (d < 14 && !M.salue) { M.salue = true; ui.subtitle('Le marchand de joie', pick(['Bonsoir, bonsoir. Vous avez la mine de quelqu’un qui a besoin d’un peu de joie.', 'Approchez. Je ne mords pas. Je vends.', 'Il fait sombre, dans votre vallée. J’ai de quoi éclairer.']), 4); }
  },
  dessinerMarchand(buf, sbuf, t) {
    const M = this.m;
    if (!M) return;
    poseHuman(M.rig, { move: 0, t, lookY: 0, talk: this.parleT > 0 });
    const tg = game.target;
    drawRig(buf, M.rig, M.x, M.y, M.z, M.heading, 1.08, tg && tg.marchand ? FX_HI : 0);
    if (sbuf) drawShadow(sbuf, M.x, M.y, M.z, 0.36);
  },
  ciblesMarchand(eye, f, cand) {
    const M = this.m;
    if (!M) return;
    const dx = M.x - eye[0], dy = M.y + 1.4 - eye[1], dz = M.z - eye[2], d = Math.hypot(dx, dy, dz);
    if (d > 3 || (dx * f[0] + dy * f[1] + dz * f[2]) / d < 0.7) return;
    cand({ kind: 'hook', marchand: true, use: () => this.boutique() }, d);
  },
  boutique(msg) {
    const s = farm.s;
    const vendables = ['couronne_sucre', 'crin_licorne', 'coeur_noir', 'oeil_verre', 'dessin_reve', 'plume_ombre'].filter((id) => ITEMS[id] && farm.count(id));
    const opts = [
      { label: 'Une pilule de joie (25 pièces)', fn: () => this.acheter(1, 25) },
      { label: 'Trois pilules (60 pièces)', fn: () => this.acheter(3, 60) },
    ];
    for (const id of vendables) opts.push({ label: `Lui vendre : ${itemName(id)} (${Math.round(ITEMS[id].price * 1.2)} pièces)`, fn: () => { if (!farm.take(id, 1)) return; farm.earn(Math.round(ITEMS[id].price * 1.2)); sound.coin && sound.coin(); this.boutique(pick(['Magnifique. Ça vient de là-bas, et c’est resté. C’est rare.', 'Oh… Celui-là, je le garde pour moi.', 'Vous voyez ? Tout n’est pas perdu, en revenant.'])); } });
    opts.push({ label: 'Qu’est-ce que c’est, au juste ?', fn: () => this.boutique('De la joie. En gélule. Une, et la vallée devient ce qu’elle aurait dû être : sucrée, douce, sans personne qui meurt. Après, bien sûr… il faut redescendre. On redescend toujours plus bas qu’on est monté. Mais ça, c’est après.') });
    opts.push({ label: 'Partir', fn: () => ui.close() });
    this.parleT = 3;
    ui.choice('Le marchand de joie', msg || pick(['Un sourire en redingote verte, une lanterne, un plateau de petits papiers pliés. Il sent la fraise et la cave.', '« Pour la joie », dit-il, en tapotant son plateau. Ses dents sont très blanches.']), opts);
    if (s.pilules && !s.pilules.vuMarchand) s.pilules.vuMarchand = 1;
  },
  acheter(n, prix) {
    if (!farm.pay(prix)) { this.boutique('Pas assez ? Revenez. Je reviens toujours, moi aussi.'); return; }
    farm.give('pilule_joie', n); sound.coin && sound.coin();
    this.boutique(pick(['Une à la fois, surtout. Enfin… comme vous voudrez.', 'Merci bien. N’en parlez pas au curé.', 'Vous verrez : c’est beau, là-bas.']));
  },
};
HOOKS.primary.push((eye, basis, held, it, id) => { if (id !== 'pilule_joie') return false; if (!held) pilules.avaler(); return true; });
HOOKS.secondary.push((eye, basis, it, id) => { if (id !== 'pilule_joie') return false; pilules.avaler(); return true; });
HOOKS.update.push((dt, eye, basis, sky, playing) => { if (farm.s) pilules.update(dt, playing); if (pilules.parleT > 0) pilules.parleT -= dt; });
HOOKS.day.push(() => pilules.nouveauJour());
HOOKS.draw.push((buf, sbuf, cam, t) => { pilules.dessinerSol(buf); pilules.dessinerMarchand(buf, sbuf, t); });
HOOKS.target.push((eye, f, cand) => { pilules.ciblesSol(eye, f, cand); pilules.ciblesMarchand(eye, f, cand); });
HOOKS.lights.push((eye) => { const M = pilules.m; if (!M) return []; return [{ x: M.x + 0.3, y: M.y + 0.9, z: M.z, r: 7, c: [0.7, 1.0, 0.6], d: Math.hypot(M.x - eye[0], M.z - eye[2]) }]; });
HOOKS.load.push((saved) => { pilules.m = null; pilules.solProches = null; const P = pilules.P(); if (!saved) { P.sol = []; } if (!P.sol.length && !saved) pilules.nouveauJour(); });

// ---------------------------------------------------------------- les bêtes du pays des bonbons
Object.assign(BETES_MONDE, {
  ourson: { rig: (v) => MONDES_RIGS.ourson(v), h: 0.5, r: 0.26, hp: 6, vitesse: [0.8, 3.4], fuite: 5, rayon: 10, butin: [['gomme', 2, 4]],
    meurt(e) { MSON.scintille(1); puffAt(e.x, e.y + 0.3, e.z, [240, 90, 140], 10, 1.4, true); } },
  lapin: { rig: (v) => MONDES_RIGS.lapin(v), h: 0.55, r: 0.2, hp: 4, vitesse: [1.1, 6.5], fuite: 7, rayon: 14, butin: [['guimauve', 1, 2]],
    pose(e, r, t, st) { poseQuad(r, st); }, meurt(e) { MSON.scintille(0.8); puffAt(e.x, e.y + 0.2, e.z, [255, 240, 246], 10, 1.2, true); } },
  cerf_sucre: { rig: () => MONDES_RIGS.cerf(), h: 2.0, r: 0.4, hp: 20, vitesse: [1.0, 8.5], fuite: 16, rayon: 24, butin: [['sucre_orge', 2, 3]],
    meurt(e) { MSON.scintille(1); puffAt(e.x, e.y + 1, e.z, [230, 50, 80], 14, 2, true); } },
  licorne: { rig: () => MONDES_RIGS.licorne(), h: 2.3, r: 0.6, hp: 60, vitesse: [1.2, 7.5], fuite: 6, rayon: 18, butin: [['crin_licorne', 1, 1]],
    parler(e) {
      const p = game.player;
      if (e.donne) { ui.subtitle('', '(La licorne vous regarde. Elle n’a plus rien à vous donner.)', 3); return; }
      if (p.crouch < 0.5 && e.state === 'fuite') return;
      e.donne = true; e.state = 'idle'; e.timer = 4;
      farm.give('crin_licorne', 1); play.flyer('crin_licorne', [e.x, e.y + 1.6, e.z], 1); MSON.scintille(1.2);
      ui.subtitle('', '(Elle se laisse toucher. Sa crinière est tiède, et sent le sucre brûlé. Un crin reste entre vos doigts.)', 5);
    },
    meurt(e) { MSON.cri(0.4, 1.4, 1.2); ui.subtitle('', '(La licorne tombe. Il n’y a pas de sang. Il y a du sucre, beaucoup de sucre, et puis quelque chose de plus sombre dessous.)', 5); } },
  roi_sucre: { rig: () => MONDES_RIGS.roi(), h: 2.4, r: 0.45, hp: 999, vitesse: [0, 0], ia: 'immobile', regard: 30, echelle: 1.25, intouchable: true,
    touche(e) { MSON.rire(0.6, 0.7); ui.subtitle('Le roi Sucre', 'Ha ! Tu ne peux rien casser, ici. C’est pour ça qu’on y est si bien.', 3.5); },
    proche(e) { ui.subtitle('Le roi Sucre', pick(['Bienvenue, bienvenue. Ici, rien ne meurt, rien ne pourrit, rien ne fait mal.', 'Encore un visiteur ! Reste. Reste encore un peu.']), 4); },
    parler(e) { MONDES.bonbons.audience(e); } },
});
// le roi Sucre : un bonhomme de pain d'épice couronné
MONDES_RIGS.roi = () => {
  const r = humanRig({ skin: '#b06a30', hair: '#fffaf6', hairStyle: 'court', top: '#f06aa0', bottom: '#fff4f8', shoe: '#5a2e14', coat: true, face: TL.faceMan, beard: 'longue', height: 1.2, build: 'rond' });
  return rigPlus(r, [
    { name: 'couronne', parent: 'head', p: [0, 0.3, 0], s: [0.34, 0.1, 0.34], o: [0, 0.03, 0], col: rgbf('#f8d8e8'), tex: TL.gold },
    { name: 'pointe1', parent: 'head', p: [0, 0.38, 0.14], s: [0.06, 0.1, 0.03], o: [0, 0, 0], col: rgbf('#f05890'), tex: TL.plain },
    { name: 'pointe2', parent: 'head', p: [0.13, 0.38, 0], s: [0.03, 0.1, 0.06], o: [0, 0, 0], col: rgbf('#60c8a0'), tex: TL.plain },
    { name: 'pointe3', parent: 'head', p: [-0.13, 0.38, 0], s: [0.03, 0.1, 0.06], o: [0, 0, 0], col: rgbf('#f8d040'), tex: TL.plain },
    { name: 'sceptre', parent: 'handR', p: [0, -0.04, 0.05], s: [0.04, 0.9, 0.04], o: [0, 0.3, 0], col: rgbf('#fff4f6'), tex: TL.stripes },
  ]);
};

// ---------------------------------------------------------------- modèles des plantes et décors (boîtes)
const BB = {
  rose: [1, 0.62, 0.8], blanc: [1, 0.98, 0.99], menthe: [0.62, 0.92, 0.78], citron: [1, 0.92, 0.45], lilas: [0.8, 0.68, 1], choco: [0.36, 0.2, 0.12], rouge: [0.92, 0.18, 0.28], orange: [1, 0.62, 0.3],
  barbe(E, c) { E.bx(0, 0, 0, 0.05, 0.9, 0.05, BB.blanc, TL.plain); const col = c.v % 2 ? [0.72, 0.84, 1] : BB.rose; for (const [x, y, z, s] of [[0, 1.0, 0, 0.5], [0.18, 0.9, 0.1, 0.34], [-0.16, 0.95, -0.08, 0.36], [0.05, 1.22, -0.05, 0.3]]) E.box(x, y, z, s, s * 0.9, s, col, TL.wool, c.v); },
  sucette(E, c) { const col = [BB.rose, BB.menthe, BB.citron, BB.lilas, BB.orange][c.v % 5]; E.bx(0, 0, 0, 0.04, 0.6, 0.04, BB.blanc, TL.plain); E.box(0, 0.75, 0, 0.34, 0.34, 0.06, col, TL.stripes, c.r2 || 0, 0, Math.PI / 4); E.box(0, 0.75, 0, 0.22, 0.22, 0.07, BB.blanc, TL.plain, c.r2 || 0, 0, Math.PI / 4); },
  champi(E, c) { E.bx(0, 0, 0, 0.12, 0.28, 0.12, BB.blanc, TL.plain); E.bx(0, 0.26, 0, 0.36, 0.14, 0.36, BB.rose, TL.spots); E.bx(0, 0.38, 0, 0.22, 0.06, 0.22, BB.rose, TL.plain); },
  canne(E, c) { E.bx(0, 0, 0, 0.09, 0.95, 0.09, [1, 1, 1], TL.stripes); E.box(0.1, 1.0, 0, 0.26, 0.09, 0.09, [1, 1, 1], TL.stripes); E.box(0.22, 0.92, 0, 0.09, 0.2, 0.09, [1, 1, 1], TL.stripes); },
  dragees(E, c) { const C = [BB.rose, BB.menthe, BB.citron, BB.lilas, BB.blanc]; for (let k = 0; k < 5; k++) E.bx(Math.cos(k * 2.4) * 0.22, 0, Math.sin(k * 2.4) * 0.22, 0.16, 0.1, 0.12, C[(k + c.v) % 5], TL.plain, k); },
  pave(E, c) { const C = [BB.rose, BB.menthe, BB.citron, BB.lilas, BB.blanc]; E.bx(0, -0.06, 0, 0.9, 0.12, 0.6, C[c.v % 5], TL.plain); },
  gomme(E, c) { const C = [[0.95, 0.2, 0.3], [0.2, 0.8, 0.4], [1, 0.8, 0.2], [0.6, 0.3, 0.9]]; E.bx(0, 0, 0, 0.5, 0.42, 0.5, C[c.v % 4], TL.plain); E.bx(0, 0.42, 0, 0.3, 0.12, 0.3, C[c.v % 4], TL.plain); },
  fontaine(E, c, t) {
    E.bx(0, 0, 0, 3.2, 0.5, 3.2, [1, 1, 1], mt(M_DRAGEE)); E.bx(0, 0.5, 0, 0.5, 1.6, 0.5, [1, 1, 1], mt(M_SUCRE_RAYE)); E.bx(0, 2.1, 0, 1.2, 0.2, 1.2, [1, 1, 1], mt(M_DRAGEE));
    E.fl = FX_EMIT; E.bx(0, 0.42, 0, 2.8, 0.1, 2.8, [1.0, 0.55 + Math.sin(t * 2) * 0.05, 0.8], TL.plain);
    for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + t, y = 2.3 + ((t * 1.5 + k * 0.4) % 1) * 0.6; E.box(Math.cos(a) * 0.5, y, Math.sin(a) * 0.5, 0.08, 0.08, 0.08, [1, 0.8, 0.95], TL.plain); }
    E.fl = 0;
  },
  trone(E) {
    E.bx(0, 0, 0, 1.6, 0.5, 1.2, [1, 1, 1], mt(M_DRAGEE)); E.bx(0, 0.5, 0.45, 1.6, 2.2, 0.3, BB.rose, TL.plain); E.bx(0, 2.7, 0.45, 1.1, 0.5, 0.3, BB.citron, TL.gold);
    for (const s of [-1, 1]) { E.bx(s * 0.72, 0.5, 0, 0.18, 0.5, 1.0, BB.blanc, TL.stripes); E.bx(s * 0.72, 1.0, -0.42, 0.26, 0.26, 0.26, BB.menthe, TL.plain); }
  },
  bonbonTable(E) { E.bx(0, 0.72, 0, 1.3, 0.08, 0.8, BB.choco, TL.plain); for (const [x, z] of [[-0.55, -0.32], [0.55, -0.32], [-0.55, 0.32], [0.55, 0.32]]) E.bx(x, 0, z, 0.08, 0.72, 0.08, BB.blanc, TL.stripes); },
  fenetre(E, c) { E.fl = FX_EMIT; E.bx(0, 0, 0, 0.9, 0.9, 0.05, c.v % 2 ? [1.1, 0.8, 0.4] : [1.0, 0.6, 0.8], TL.glass); E.fl = 0; E.bx(0, -0.08, 0, 1.05, 0.1, 0.12, BB.blanc, TL.plain); E.bx(0, 0.9, 0, 1.05, 0.1, 0.12, BB.blanc, TL.plain); },
  rangGommes(E, c) { const C = [[0.95, 0.2, 0.3], [0.2, 0.8, 0.4], [1, 0.8, 0.2], [0.6, 0.3, 0.9], [1, 0.5, 0.2]]; const n = c.n || 6; for (let k = 0; k < n; k++) E.bx((k - (n - 1) / 2) * (c.pas || 0.9), 0, 0, 0.32, 0.26, 0.32, C[k % 5], TL.plain); },
  poteau(E) { E.bx(0, 0, 0, 0.14, 1.3, 0.14, [1, 1, 1], TL.stripes); E.box(0.12, 1.35, 0, 0.3, 0.12, 0.12, [1, 1, 1], TL.stripes); E.bx(0.24, 1.05, 0, 0.12, 0.3, 0.12, [1, 1, 1], TL.stripes); },
  herse(E) { for (let k = -2; k <= 2; k++) E.bx(k * 0.8, 0, 0, 0.14, 1.1, 0.14, BB.choco, TL.plain); E.bx(0, 1.0, 0, 3.8, 0.14, 0.14, BB.choco, TL.plain); },
  cheminee(E) { E.bx(0, 0, 0, 0.6, 1.2, 0.6, [1, 1, 1], mt(M_CHOCOLAT)); E.bx(0, 1.2, 0, 0.72, 0.14, 0.72, BB.blanc, TL.plain); },
};

// ---------------------------------------------------------------- le monde
MONDES.bonbons = {
  nom: 'bonbons', titre: 'le pays des bonbons', aPart: false, herbe: 'bonbons',
  intensite() { const P = pilules.P(); return P.phase === 'monte' ? 0.35 : 1; },
  // la végétation devient sucre (null : disparaît ; indéfini : inchangée)
  sprite(t) {
    const id = t.id;
    if (id === 'oak' || id === 'giantoak') return ['bb_sucette0', 'bb_canne0'];
    if (id === 'apple') return ['bb_sucette1'];
    if (id === 'birch') return ['bb_barbe0', 'bb_barbe1'];
    if (id === 'pine' || /sapin|epicea|pin_|meleze|fir/.test(id)) return ['bb_meringue0'];
    if (id === 'bush' || id === 'berry') return ['bb_gommes0'];
    if (id === 'tallgrass' || id === 'reeds' || id === 'fern' || id === 'heather') return ['bb_guimauves0'];
    if (id === 'mushroom' || /cepe|girolle|amanite|morille|trompette|champ/.test(id)) return ['bb_champi0'];
    if (id === 'rock') return ['bb_truffe0'];
    if (id === 'stones') return ['bb_dragees0'];
    if (id === 'stump') return ['bb_buche0'];
    if (t.cat === 'Arbres') return ['bb_sucette2', 'bb_barbe0'];
    if (t.cat === 'Fleurs' || (!t.col && !t.colK && t.h && t.h[1] < 1.3 && !t.light && t.cat !== 'Objets' && t.cat !== 'Village' && t.cat !== 'Mine')) return ['bb_fleurs0'];
    return undefined;
  },
  ciel(sky, k) {
    const d = sky.day, n = sky.night;
    mondes.melerCiel(sky, {
      zen: v3.lerp([0.18, 0.07, 0.28], [0.6, 0.44, 0.86], d), hor: v3.lerp([0.42, 0.16, 0.44], [1.0, 0.74, 0.82], d),
      amb: v3.lerp([0.3, 0.2, 0.38], [0.66, 0.56, 0.66], d), glow: [1, 0.55, 0.78], haze: v3.lerp([0.3, 0.14, 0.36], [0.98, 0.8, 0.9], d),
      cloudLit: v3.lerp([0.5, 0.36, 0.6], [1, 0.9, 0.96], d), cloudDark: v3.lerp([0.3, 0.18, 0.4], [0.86, 0.68, 0.86], d),
      sunCol: v3.scale([1.05, 0.9, 0.98], Math.max(0, sky.sunCol[1]) > 0 ? d * 0.95 : 0), moonCol: v3.scale([0.36, 0.24, 0.42], n), sunDisk: [1.6, 1.3, 1.45], moonTint: [1.3, 0.8, 1.2],
    }, k);
  },
  // les bêtes de la vallée, vues en sucre
  peindreBete(e, q) {
    const K = { sheep: [1, 0.72, 0.88], cow: [1, 0.66, 0.76], pig: [1, 0.74, 0.82], horse: [0.9, 0.6, 0.3], hen: [1, 0.95, 0.5], rabbit: [1, 0.96, 0.98], deer: [0.6, 0.92, 0.78], fox: [1, 0.62, 0.3], wolf: [0.52, 0.56, 1], dog: [0.35, 0.18, 0.12], cat: [0.8, 0.66, 1], boar: [0.5, 0.28, 0.16], duck: [1, 0.92, 0.4], crow: [0.3, 0.14, 0.2], bird: [0.5, 0.9, 1], bear: [0.95, 0.2, 0.3] };
    const base = K[e.kind] || [[1, 0.7, 0.85], [0.65, 0.92, 0.8], [1, 0.9, 0.5], [0.8, 0.7, 1]][(e.kind.length + (e.v || 0)) % 4];
    if (/leg|hoof|beak|horn|udder|snout/.test(q.name)) return v3.lerp(base, [1, 1, 1], 0.55);
    if (q.name === 'head' || /ear|tail|mane/.test(q.name)) return v3.lerp(base, [1, 1, 1], 0.25);
    return base;
  },
  // les habitants, en bonshommes de pain d'épice glacés
  peindreHabitant(n, q) {
    if (/^(head|neck|handL|handR|nose)$/.test(q.name)) return [0.7, 0.42, 0.2];
    if (/hair|beard|bun|tail|curls|fringe/.test(q.name)) return [1, 0.98, 0.96];
    if (/shoe/.test(q.name)) return [0.35, 0.18, 0.1];
    const C = [[1, 0.55, 0.78], [0.55, 0.9, 0.72], [1, 0.88, 0.4], [0.72, 0.6, 1], [1, 0.62, 0.36], [0.5, 0.8, 1]];
    const h = hashString(n.id || 'x');
    return C[(h + (/leg|skirt|coat/.test(q.name) ? 3 : 0)) % C.length];
  },
  entrer(opts) {
    const S = mondes.S(), p = game.player, w = game.world;
    const B = S.bonbons && opts.restaurer ? S.bonbons : (S.bonbons = { graine: (Math.random() * 1e9) | 0, x: p.pos[0], z: p.pos[2], yaw: p.yaw, fin: opts.pilule ? 0 : farm.s.hours + (opts.duree || 4) });
    const rnd = mulberry32(B.graine);
    // le château se dresse devant, les maisons de pain d'épice un peu de côté
    if (!B.sites) {
      const fwd = Math.atan2(-Math.sin(p.yaw), -Math.cos(p.yaw));
      const ch = mondes.site(B.x, B.z, 55, 120, 17, rnd, fwd), ma = mondes.site(B.x, B.z, 24, 58, 11, rnd, fwd + (rnd() < 0.5 ? 1.4 : -1.4));
      B.sites = { chateau: ch ? { x: ch.x, z: ch.z, y: ch.y } : null, maisons: ma && (!ch || Math.hypot(ma.x - ch.x, ma.z - ch.z) > 34) ? { x: ma.x, z: ma.z, y: ma.y } : null };
    }
    if (B.sites.chateau) this.chateau(B.sites.chateau, B.x, B.z, rnd);
    if (B.sites.maisons) this.maisons(B.sites.maisons, B.x, B.z, rnd);
    // plantes de sucre, sentier de dragées, bêtes
    this.semer(B, rnd);
    mondes.finConstruction([B.x - 150, B.z - 150, B.x + 150, B.z + 150]);
    if (!opts.restaurer) {
      MSON.scintille(1.5); strange.glitchT = Math.max(strange.glitchT, 0.25);
      ui.subtitle('', pick(['(Tout devient doux. Le ciel est rose. Les arbres… les arbres sont des sucettes.)', '(Le monde fond comme un sucre dans du lait chaud. C’est beau. C’est si beau.)']), 5);
      if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(4, 'pays des bonbons');
    }
  },
  // ------------------------------------------------------------- le château de dragées
  chateau(s, px, pz, rnd) {
    const f = { x: s.x, y: s.y, z: s.z, r: Math.atan2(-(px - s.x), -(pz - s.z)) }; // la porte regarde le personnage
    mondes.cacherObjets(f, 17, 17);
    const [mn, mx] = mondes.relief(f, 13, 13), H = 7 + (mx - mn), E = 1.2, L = 24, Y0 = -1.5;
    // murailles, porte au sud (côté du personnage)
    mondes.mur(f, 0, -L / 2, L, true, H, E, M_DRAGEE, 4.2, 4.8 + (mx - mn) * 0.5, null, Y0);
    mondes.mur(f, 0, L / 2, L, true, H, E, M_DRAGEE, 0, 0, null, Y0);
    mondes.mur(f, -L / 2, 0, L - E, false, H, E, M_DRAGEE, 0, 0, null, Y0);
    mondes.mur(f, L / 2, 0, L - E, false, H, E, M_DRAGEE, 0, 0, null, Y0);
    for (let k = -L / 2 + 1.2; k <= L / 2 - 1.2; k += 2.2) for (const [x, z] of [[k, -L / 2], [k, L / 2], [-L / 2, k], [L / 2, k]]) if (Math.abs(x) > 3 || z > 0) mondes.bloc(f, x, H, z, 0.9, 0.8, 0.9, M_SUCRE_RAYE);
    // tours d'angle en sucre d'orge, toits en pointe de chocolat
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      mondes.bloc(f, x * L / 2, Y0, z * L / 2, 4.6, H + 5 - Y0, 4.6, M_SUCRE_RAYE);
      mondes.bloc(f, x * L / 2, H + 5, z * L / 2, 5.6, 5.5, 5.6, M_CHOCOLAT, 0, 3);
      const [tx0, tz0] = mondes.toWorld(f, x * L / 2, z * L / 2);
      mondes.chose({ x: tx0, z: tz0, y: s.y + H + 10.4, modele: (E2) => { E2.fl = FX_EMIT; E2.bx(0, 0, 0, 0.5, 0.5, 0.5, [1.2, 0.9, 0.3], TL.plain, 0.785); E2.fl = 0; } });
    }
    // porte : une herse de chocolat relevée, des poteaux en sucre d'orge
    { const [x, z] = mondes.toWorld(f, 0, -L / 2 - 0.1); mondes.chose({ x, z, y: s.y + 4.7 + (mx - mn) * 0.5, r: f.r, modele: BB.herse }); }
    for (const sx of [-2.8, 2.8]) { const [x, z] = mondes.toWorld(f, sx, -L / 2 - 1.4); mondes.chose({ x, z, r: f.r, modele: BB.poteau }); }
    // le donjon, au fond, et la salle du trône (sur un socle de chocolat, avec des marches)
    const D0 = { x: mondes.toWorld(f, 0, 5)[0], y: s.y, z: mondes.toWorld(f, 0, 5)[1], r: f.r };
    const [dn, dx0] = mondes.relief(D0, 5.4, 4.6), D = Object.assign({}, D0, { y: dx0 + 0.3 });
    mondes.bloc(D, 0, dn - D.y - 0.6, 0, 10.8, D.y - dn + 0.6, 9.2, M_CHOCOLAT);
    mondes.mur(D, 0, -4.2, 10.8, true, 8, 0.8, M_PAIN_EPICE, 2.4, 3.2);
    mondes.mur(D, 0, 4.2, 10.8, true, 8, 0.8, M_PAIN_EPICE);
    mondes.mur(D, -5, 0, 7.6, false, 8, 0.8, M_PAIN_EPICE);
    mondes.mur(D, 5, 0, 7.6, false, 8, 0.8, M_PAIN_EPICE);
    mondes.bloc(D, 0, 8, 0, 11.4, 3.2, 9.8, M_DRAGEE, 0, 1);
    { const [ex, ez] = mondes.toWorld(D, 0, -4.6); mondes.marches(D, 0, -4.6, 2.4, D.y - game.world.heightAt(ex, ez), -1); }
    for (const [x, z] of [[-3.8, -2.8], [3.8, -2.8], [-3.8, 2.8], [3.8, 2.8]]) { const [cx, cz] = mondes.toWorld(D, x, z); mondes.chose({ x: cx, z: cz, y: D.y, modele: BB.gomme, v: (x > 0 ? 1 : 0) + (z > 0 ? 2 : 0), lumiere: { c: [1, 0.7, 0.9], r: 7, y: 1 } }); }
    { const [x, z] = mondes.toWorld(D, 0, 2.7); mondes.chose({ x, z, y: D.y, r: f.r, modele: BB.trone }); }
    { const [x, z] = mondes.toWorld(D, 0, 1.2); mondes.bete('roi_sucre', x, z, { heading: f.r + Math.PI, y: D.y, yRef: D.y }); }
    for (let k = 0; k < 4; k++) { const [x, z] = mondes.toWorld(D, -3 + k * 2, -2.4); mondes.chose({ x, z, y: D.y, item: 'dragee', n: 2, v: k, cle: 'b_dr' + k, modele: BB.dragees, rayon: 0.4, h: 0.2 }); }
    // la cour : fontaine de limonade rose, gommes, sucettes et dragées
    { const [x, z] = mondes.toWorld(f, 0, -4.5); mondes.chose({ x, z, modele: BB.fontaine, lumiere: { c: [1, 0.5, 0.8], r: 9, y: 1.2 } }); }
    for (let k = 0; k < 10; k++) { const [x, z] = mondes.toWorld(f, (rnd() - 0.5) * 18, -10 + rnd() * 5); const su = rnd() < 0.5; mondes.chose({ x, z, item: su ? 'sucette' : 'dragee', v: k, cle: 'b_co' + k, modele: su ? BB.sucette : BB.dragees, rayon: 0.4, h: 0.6 }); }
    for (let k = 0; k < 7; k++) { const [x, z] = mondes.toWorld(f, -L / 2 + 2.5 + k * 3.2, L / 2 - 1.7); mondes.chose({ x, z, modele: BB.gomme, v: k }); }
  },
  audience(e) {
    const B = mondes.S().bonbons || {};
    const opts = [];
    if (!B.couronne) opts.push({ label: 'Vous inclinez la tête', fn: () => { B.couronne = 1; farm.give('couronne_sucre', 1); play.flyer('couronne_sucre', [e.x, e.y + 2.4, e.z], 1); MSON.scintille(1.5); ui.choice('Le roi Sucre', 'Prends. Prends-la. Une couronne de sucre qui ne fondra jamais. Tu me la rendras… quand tu reviendras. Tout le monde revient.', [{ label: 'Merci, Majesté', fn: () => ui.close() }]); } });
    opts.push({ label: 'Qui êtes-vous ?', fn: () => ui.choice('Le roi Sucre', 'Je suis ce que tu voulais voir. Un roi gentil, dans un pays où les arbres donnent des sucettes et où personne n’a jamais faim. Tu m’as fait avec une pilule. Je te remercie.', [{ label: 'Partir', fn: () => ui.close() }]) });
    opts.push({ label: 'Est-ce que ça va durer ?', fn: () => { MSON.rire(0.5, 0.8); ui.choice('Le roi Sucre', 'Oh, non. Rien ne dure. Après le sucre vient le reste : le noir, les cages, les choses qui rampent. Mais ne pensons pas à ça. Pas encore. Mange une sucette.', [{ label: 'Partir', fn: () => ui.close() }]); } });
    opts.push({ label: 'Partir', fn: () => ui.close() });
    ui.choice('Le roi Sucre', 'Un bonhomme de pain d’épice haut comme deux hommes, couronné de sucre candi. Ses yeux de réglisse ne clignent pas. « Sois le bienvenu dans mon royaume. »', opts);
  },
  // ------------------------------------------------------------- les maisons de pain d'épice
  maisons(s, px, pz, rnd) {
    const f0 = { x: s.x, y: s.y, z: s.z, r: Math.atan2(-(px - s.x), -(pz - s.z)) };
    mondes.cacherObjets(f0, 14, 14);
    const places = [[-6.5, 2, 0.35], [6.5, 2, -0.35], [0, 7.5, 0]];
    places.forEach(([lx, lz, rr], i) => {
      const [x, z] = mondes.toWorld(f0, lx, lz), W = 5.2, Dd = 4.6, H = 2.8;
      const g = { x, y: 0, z, r: f0.r + rr }, [hn, hx] = mondes.relief(g, W / 2 + 0.5, Dd / 2 + 0.5), f = Object.assign(g, { y: hx + 0.15 });
      mondes.bloc(f, 0, hn - f.y - 0.5, 0, W + 0.5, f.y - hn + 0.5, Dd + 0.5, M_CHOCOLAT); // socle
      mondes.mur(f, 0, -Dd / 2, W, true, H, 0.3, M_PAIN_EPICE, 1.3, 2.3);
      mondes.mur(f, 0, Dd / 2, W, true, H, 0.3, M_PAIN_EPICE);
      mondes.mur(f, -W / 2, 0, Dd - 0.3, false, H, 0.3, M_PAIN_EPICE);
      mondes.mur(f, W / 2, 0, Dd - 0.3, false, H, 0.3, M_PAIN_EPICE);
      mondes.bloc(f, 0, H, 0, W + 0.9, 2.2, Dd + 0.9, M_DRAGEE, 0, 1);
      { const [ex, ez] = mondes.toWorld(f, 0, -Dd / 2 - 0.4); mondes.marches(f, 0, -Dd / 2 - 0.25, 1.6, f.y - game.world.heightAt(ex, ez), -1); }
      const at = (lx2, lz2) => mondes.toWorld(f, lx2, lz2);
      { const [cx, cz] = at(-1.6, Dd / 2 - 0.4); mondes.chose({ x: cx, z: cz, y: f.y + H + 0.9, modele: BB.cheminee }); }
      { const [cx, cz] = at(0, 0); mondes.chose({ x: cx, z: cz, y: f.y + H + 2.2, r: f.r, modele: BB.rangGommes, n: 7, pas: 0.8 }); }
      for (const sx of [-1.5, 1.5]) { const [cx, cz] = at(sx, -Dd / 2 - 0.2); mondes.chose({ x: cx, z: cz, y: f.y + 1.0, r: f.r, v: i + (sx > 0 ? 1 : 0), modele: BB.fenetre }); }
      for (const sx of [-1.1, 1.1]) { const [cx, cz] = at(sx, -Dd / 2 - 0.9); mondes.chose({ x: cx, z: cz, r: f.r, modele: BB.poteau }); }
      { const [cx, cz] = at(0.8, 0.8); mondes.chose({ x: cx, z: cz, y: f.y, r: f.r, modele: BB.bonbonTable, lumiere: { c: [1, 0.8, 0.6], r: 5, y: 1.4, vacille: true } }); }
      for (let k = 0; k < 3; k++) { const [cx, cz] = at(0.35 + k * 0.45, 0.8); mondes.chose({ x: cx, z: cz, y: f.y + 0.8, item: k === 1 ? 'dragee' : 'sucette', v: k + i, r2: k, cle: 'b_ma' + i + k, modele: k === 1 ? BB.dragees : BB.sucette, s: 0.45, rayon: 0.3, h: 0.3 }); }
    });
  },
  // ------------------------------------------------------------- plantes de sucre, sentier, bêtes
  semer(B, rnd) {
    const w = game.world, cx = B.x, cz = B.z;
    const TYPES = [['barbe_a_papa', BB.barbe, 1.3], ['sucette', BB.sucette, 0.9], ['guimauve', BB.champi, 0.4], ['sucre_orge', BB.canne, 1.1], ['dragee', BB.dragees, 0.2]];
    for (let k = 0; k < 44; k++) {
      const a = rnd() * TAU, d = 6 + Math.sqrt(rnd()) * 70, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
      const T = TYPES[(rnd() * TYPES.length) | 0];
      if (!w.inside(x, z, 6) || w.heightAt(x, z) < w.waterLevel + 0.2 || w.covered(x, w.heightAt(x, z) + 0.5, z)) continue;
      mondes.chose({ x, z, item: T[0], v: k, r: rnd() * TAU, cle: 'b_pl' + k, modele: T[1], rayon: 0.5, h: T[2] });
    }
    // le sentier de dragées vers le château
    const C = B.sites && B.sites.chateau;
    if (C) {
      const L = Math.hypot(C.x - cx, C.z - cz), n = Math.floor(L / 2.2);
      for (let k = 2; k < n - 7; k++) {
        const t = k / n, x = lerp(cx, C.x, t) + Math.sin(k * 0.7) * 1.2, z = lerp(cz, C.z, t) + Math.cos(k * 0.5) * 1.2;
        if (w.heightAt(x, z) < w.waterLevel + 0.1) continue;
        mondes.chose({ x, z, y: w.heightAt(x, z) + 0.02, r: Math.atan2(C.x - cx, C.z - cz), v: k, modele: BB.pave, loin: 90 });
      }
    }
    // bêtes en sucre
    const place = (r0, r1) => { for (let t = 0; t < 12; t++) { const a = rnd() * TAU, d = r0 + rnd() * (r1 - r0), x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d; if (w.inside(x, z, 8) && w.heightAt(x, z) > w.waterLevel + 0.3) return [x, z]; } return null; };
    for (let k = 0; k < 6; k++) { const q = place(10, 50); if (q) mondes.bete('ourson', q[0], q[1], { v: k }); }
    for (let k = 0; k < 5; k++) { const q = place(8, 45); if (q) mondes.bete('lapin', q[0], q[1], { v: k }); }
    for (let k = 0; k < 2; k++) { const q = place(30, 70); if (q) mondes.bete('cerf_sucre', q[0], q[1]); }
    if (rnd() < 0.45 || B.licorne) { B.licorne = 1; const q = place(35, 60); if (q) mondes.bete('licorne', q[0], q[1]); }
  },
  update(dt, playing) {
    const B = mondes.S().bonbons;
    if (B && B.fin && !pilules.P().phase && farm.s.hours >= B.fin) { mondes.sortir(); return; }
    // musique de boîte à musique, éclats de sucre
    MSON.melodie(dt, 'bonbons');
    this.scT = (this.scT || 3) - dt;
    if (this.scT <= 0) { this.scT = 2 + Math.random() * 5; MSON.scintille(0.5); }
    // particules de sucre qui flottent
    if (playing && Math.random() < dt * 6) { const p = game.player, a = Math.random() * TAU, d = 3 + Math.random() * 14; particles.spawn(p.pos[0] + Math.cos(a) * d, p.pos[1] + 1 + Math.random() * 4, p.pos[2] + Math.sin(a) * d, (Math.random() - 0.5) * 0.3, 0.15, (Math.random() - 0.5) * 0.3, [[1, 0.7, 0.9, 1], [0.7, 1, 0.9, 1], [1, 1, 0.7, 1], [0.8, 0.8, 1, 1]][(Math.random() * 4) | 0], 0.04, 4, -0.03, true); }
  },
  // en quittant le sucre, ce qu'on a ramassé devient ce que c'était vraiment
  sortir(opts) {
    MSON.stopTout();
    const chg = [];
    for (const id in BONBONS_RETOUR) {
      const n = farm.count(id), to = BONBONS_RETOUR[id];
      if (!n || to === id) continue;
      farm.take(id, n);
      if (to && ITEMS[to]) { farm.give(to, n); chg.push([id, to, n]); }
    }
    if (chg.length) {
      const L = { gomme: '(Dans votre sac, les oursons en gomme sont devenus de la viande crue, encore tiède.)', sucre_orge: '(Les sucres d’orge… ce sont des os. Des petits os, bien propres.)', sucette: '(Les sucettes ne sont que des cailloux.)', guimauve: '(Les guimauves sont des champignons, qui sentent la cave.)', barbe_a_papa: '(La barbe à papa n’est plus qu’une touffe de fibres sèches.)', dragee: '(Les dragées sont des cailloux.)' };
      const t = chg.map(([id]) => L[id]).filter(Boolean);
      if (t.length) setTimeout(() => ui.subtitle('', t[0], 5), 2500);
    }
  },
};
