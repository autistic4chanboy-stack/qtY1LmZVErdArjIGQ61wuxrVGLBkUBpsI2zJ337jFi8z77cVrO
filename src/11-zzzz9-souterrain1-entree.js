// ============================================================================
//  LE DESSOUS — l'entrée (agent C3)
//  Au pied de la tour est de la porte sud de Valbrume, dans les douves, sous le
//  pont-levis : une vieille grille, rongée de rouille, fermée par une barre qui
//  se lève de l'autre côté. On n'y entre pas en forçant : il faut frapper trois
//  coups, la nuit, sans lumière — et quelqu'un, en bas, répond. (Des indices :
//  le garde des ponts, une comptine de la petite, les entailles près de la
//  grille ; les vieux récits des douves disent le reste.)
//  Derrière : un conduit, la cave des Murés de 1631 (des malades de la
//  contagion, murés là par les échevins), et un puits aux barreaux qui descend
//  cent vingt mètres, jusqu'au Seuil.
//  État : farm.s.souterrain.f (grille, frappes, descentes…).
// ============================================================================
// (le plan est dessiné pour la vallée de Valbrume : la ville est en 1572, 1600)
const SOUT_ENTREE = {
  grille: [1575.9, 1647.95],          // au pied de la tour est de la porte sud (face aux douves)
  cave: [1575.9, 1640.5, -1.2],       // la cave des Murés, sous la rue
  puits: [1575.4, 1638.2],            // le puits aux barreaux (et sa cheminée, en bas)
  seuil: [1577.2, 1640.4],            // où l'on arrive, en bas
};
SOUT_PLAN.cheminees[0] = [SOUT_ENTREE.puits[0], SOUT_ENTREE.puits[1], 1.6, -50];

// la comptine, le garde : les indices de là-haut
{
  const npc = (id) => NPC_DATA.find((d) => d.id === id);
  const g = npc('garde'), f = npc('fillette');
  if (g && g.lines && g.lines.rumeurs) g.lines.rumeurs.push('Du temps de la contagion, on murait les malades dans les caves de la porte sud. Mon père disait qu’on les entend encore frapper, les nuits où je lève les ponts. Trois coups. Je n’ai jamais répondu. On ne répond pas.');
  if (f && f.lines && f.lines.rumeurs) f.lines.rumeurs.push('Tu connais la comptine ? « Trois coups sous le pont, sans chandelle et sans nom : la grille se lève, et l’on descend au fond. » Maman dit que c’est une bêtise. Mais elle ne la chante jamais, elle.');
}

SOUT_GEN.push((w, rnd, B) => {
  if (!w.townInfo || Math.hypot(w.townInfo.x - 1572, w.townInfo.z - 1600) > 3) return; // (une autre vallée : pas de passage)
  const WL = w.waterLevel, E = SOUT_ENTREE;
  // ------------------------------------------------ la grille, les entailles
  const [gx, gz] = E.grille;
  B.prop('sout_grille', gx, WL - 0.1, gz, 0, { ouverte: false });
  const gp = w.props.length - 1;
  B.inter('sout_grille', 'sout_grille', gx, WL + 0.55, gz + 0.45, 'La grille', { prop: gp });
  B.prop('sout_entailles', gx + 1.3, WL + 1.25, gz - 0.2, 0);
  // ------------------------------------------------ la cave des Murés (sous la rue, derrière la tour)
  const [cx, cz, cy] = E.cave, F = { x: cx, y: cy, z: cz, r: 0 }, Wd = 7.6, Dp = 6, H = 2.3, t = 0.6;
  const blk = (lx, ly, lz, sx, sy, sz, m) => { B.block(F, lx, ly, lz, sx, sy, sz, m); const b = w.blocks[w.blocks.length - 1]; b.under = true; return b; };
  blk(0, -0.5, 0, Wd + 2 * t, 0.5, Dp + 2 * t, M_STONE);
  blk(0, H, 0, Wd + 2 * t, 0.7, Dp + 2 * t, M_MOSSY).ceil = true;
  blk(-Wd / 2 - t / 2, 0, 0, t, H, Dp + 2 * t, M_MOSSY); blk(Wd / 2 + t / 2, 0, 0, t, H, Dp + 2 * t, M_STONE);
  blk(0, 0, -Dp / 2 - t / 2, Wd + 2 * t, H, t, M_STONE);
  // mur sud, percé du conduit (bas, noir)
  blk(-2.425, 0, Dp / 2 + t / 2, 3.95, H, t, M_MOSSY); blk(2.775, 0, Dp / 2 + t / 2, 3.25, H, t, M_STONE); blk(0.35, 1.15, Dp / 2 + t / 2, 1.6, H - 1.15, t, M_STONE);
  blk(0.35, 0, Dp / 2 + t * 0.8, 1.6, 1.15, 0.2, M_DARK);
  const P = (id, lx, ly, lz, r, data) => B.propRel(F, id, lx, ly, lz, r || 0, data);
  const I = (kind, id, lx, ly, lz, name, data) => B.interRel(F, kind, id, lx, ly, lz, name, data);
  I('sout_conduit', 'sout_conduit', 0.35, 0.6, Dp / 2 - 0.2, 'Le conduit', {});
  // les restes
  P('sout_os', -2.6, 0, 1.4, 0.4); P('sout_os', -3.1, 0, -1.2, 2.1); P('sout_os', 2.4, 0, -2.1, 1.2);
  P('sout_panier', 1.1, 0, 2.2, 0.3);
  P('sout_bougie', -1.8, 0, -2.5); P('sout_bougie', -1.5, 0, -2.6); P('sout_bougie', 3.2, 0, 0.8);
  I('lire', 'sout_traits', -Wd / 2 + 0.2, 1.2, -0.6, 'Des traits, sur le mur', { text: ['Des traits, sur le mur', 'Des traits gravés à la pointe d’un couteau, par paquets de cinq. Il y en a des centaines. Puis ils s’arrêtent.\n\nPlus bas, d’une main qui tremble :\n\n« MDCXXXI. Murés céans par les échevins, pour la contagion. Nous étions onze. On nous passe le pain par la grille. »\n\nEt dessous, d’une autre main, plus ferme, plus tard :\n\n« Le pain ne vient plus. Nous descendons. »', 'gravé dans la pierre'] });
  // le puits aux barreaux
  const [px, pz] = E.puits;
  B.prop('sout_puits', px, cy + 0.02, pz, 0);
  B.inter('sout_puits', 'sout_puits', px, cy + 0.7, pz, 'Le puits', {});
  B.landmark('sout_cave', cx, cz, 5, { under: true, secret: true, y: cy });
  // ------------------------------------------------ en bas : le pied du puits, au Seuil
  const S = souterrain, fy = S.floorAt(px, pz - 1.35);
  B.prop('sout_barreaux', px, fy, pz - 1.45, 0, { h: 9 }, 1, VER_SOUS);
  B.inter('sout_remonter', 'sout_remonter', px, fy + 1.2, pz - 1.1, 'Les barreaux', {});
  const [sx, sz] = E.seuil;
  w.sout = { grille: { x: gx, z: gz, prop: gp }, cave: { x: cx, y: cy, z: cz }, arriveeCave: [cx + 0.35, cy + 0.05, cz + Dp / 2 - 1.1], sortieDouves: [gx, WL - 1.5, gz + 2.2], pied: [sx, S.floorAt(sx, sz) + 0.05, sz], hautPuits: [px + 0.9, cy + 0.05, pz + 0.9] };
});

LIEU_NAMES.sout_cave = 'la cave des Murés';
// ---------------------------------------------------------------- quelques sons d'en bas
const soutSon = {
  clang(k = 1) { if (!sound.ok) return; const t = sound.at(); sound.noiseHit(t, 0.12, 'bandpass', 1500, 4, 0.16 * k); sound.tone(t, 'square', 640, 600, 0.3, 0.03 * k); sound.tone(t, 'sine', 1280, 1250, 0.4, 0.02 * k); },
};
// ---------------------------------------------------------------- l'état, les gestes
const soutEntree = {
  F() { return souterrain.S().f; },
  grilleOuverte() { return !!this.F().grille; },
  prop() { const w = game.world; return w && w.sout && w.props[w.sout.grille.prop]; },
  // la barre levée : la grille reste ouverte
  ouvrir() {
    const F = this.F();
    F.grille = farm.s.day;
    const q = this.prop(); if (q) farm.setPropData(q, { ouverte: true });
  },
  // de la lumière sur soi ? (la lanterne, la lampe…)
  lumiere() {
    if (game.lantern && (farm.count('lanterne') || farm.count('lanterne_aube'))) return true;
    for (const fn of this.lumieres) try { if (fn()) return true; } catch (e) { /* rien */ }
    return false;
  },
  lumieres: [],
  frapper(it) {
    const F = this.F(), p = game.player, now = game.time;
    if (!F.vueGrille) { F.vueGrille = 1; soutSon.clang(0.5); ui.subtitle('', '(Une grille, rongée de rouille, scellée dans la tour. Derrière, le noir, et un souffle froid qui sent la cave.)', 4.5); return; }
    soutSon.clang(1);
    this.coups = (this.coups || []).filter((t) => now - t < 5);
    this.coups.push(now);
    if (this.coups.length < 3 || this.attente) return;
    this.coups = [];
    const h = npcs.hour(), nuit = h >= 21 || h < 5;
    if (!nuit) return;
    this.attente = true;
    const lum = this.lumiere();
    setTimeout(() => {
      this.attente = false;
      if (game.dying || !farm.s) return;
      const d = Math.hypot(p.pos[0] - it.x, p.pos[2] - it.z);
      if (d > 6) return;
      if (lum || this.lumiere()) { if (MSON.ok) MSON.metal(0.25, 0.6, 0); return; } // quelqu'un, peut-être ; puis plus rien
      sound.knock && sound.knock(3);
      ui.subtitle('', '(Trois coups répondent. De l’autre côté.)', 3.5);
      setTimeout(() => { if (MSON.ok) MSON.metal(0.8, 1.6, 0); sound.lock && sound.lock(false); this.ouvrir(); F.ouvertPar = 'eux'; }, 3200);
    }, 2600);
  },
  // se glisser dans le conduit (la grille ouverte)
  async entrer() {
    const w = game.world, p = game.player;
    if (!w.sout || game.sleeping) return;
    if (p.riding) game.dismount();
    const F = this.F();
    game.sleeping = true;
    await ui.fade(true, F.conduit ? '' : 'Vous vous glissez dans le conduit, à plat ventre, dans l’eau froide.', F.conduit ? 450 : 900);
    if (!F.conduit) await new Promise((r) => setTimeout(r, 1800));
    F.conduit = (F.conduit || 0) + 1;
    p.pos = w.sout.arriveeCave.slice(); p.vel = [0, 0, 0]; p.yaw = 0; p.pitch = 0;
    game.renderer.uploadCover(p.pos[0], p.pos[2]);
    await ui.fade(false, '', 600);
    game.sleeping = false;
  },
  async sortir() {
    const w = game.world, p = game.player;
    if (!w.sout || game.sleeping) return;
    game.sleeping = true;
    await ui.fade(true, '', 450);
    p.pos = w.sout.sortieDouves.slice(); p.vel = [0, 0, 0]; p.yaw = Math.PI; p.pitch = 0;
    game.renderer.uploadCover(p.pos[0], p.pos[2]);
    await ui.fade(false, '', 600);
    game.sleeping = false;
  },
  // le puits : cent vingt mètres de barreaux
  async descendre() {
    const w = game.world, p = game.player;
    if (!w.sout || game.sleeping) return;
    const F = this.F();
    game.sleeping = true;
    await ui.fade(true, F.descente ? '' : 'Des barreaux de fer, scellés dans la paroi. Vous descendez. Ils sont froids, puis humides, puis vous cessez de les compter.', F.descente ? 700 : 1100);
    souterrain.construire();
    await new Promise((r) => setTimeout(r, F.descente ? 700 : 2600));
    F.descente = (F.descente || 0) + 1;
    p.pos = w.sout.pied.slice(); p.vel = [0, 0, 0]; p.yaw = Math.PI * 0.75; p.pitch = -0.05;
    souterrain.basculer(true);
    await ui.fade(false, '', 900);
    game.sleeping = false;
    if (F.descente === 1) setTimeout(() => { if (souterrain.actif && !soutEntree.lumiere()) ui.subtitle('', '(Le noir. Un noir qu’on ne connaît pas, là-haut, même les nuits sans lune.)', 4); }, 1500);
  },
  async monter() {
    const w = game.world, p = game.player;
    if (!w.sout || game.sleeping) return;
    if (corps.jambeCassee() && Math.random() < 0.5) { ui.subtitle('', '(Avec cette jambe, vous ne tenez pas aux barreaux.)', 2.5); return; }
    game.sleeping = true;
    await ui.fade(true, '', 800);
    await new Promise((r) => setTimeout(r, 900));
    p.pos = w.sout.hautPuits.slice(); p.vel = [0, 0, 0]; p.pitch = 0;
    p.stamina = Math.max(0, p.stamina - 0.5);
    souterrain.basculer(false);
    game.renderer.uploadCover(p.pos[0], p.pos[2]);
    await ui.fade(false, '', 700);
    game.sleeping = false;
  },
};
HOOKS.inter.sout_grille = (it) => {
  if (soutEntree.grilleOuverte()) return soutEntree.entrer();
  return soutEntree.frapper(it);
};
HOOKS.inter.sout_conduit = () => soutEntree.sortir();
HOOKS.inter.sout_puits = () => soutEntree.descendre();
HOOKS.inter.sout_remonter = () => soutEntree.monter();
HOOKS.load.push(() => {
  const q = soutEntree.prop();
  if (q) q.data = Object.assign({}, q.data || {}, { ouverte: soutEntree.grilleOuverte() });
  soutEntree.coups = []; soutEntree.attente = false;
});
// dessous, la lanterne éclaire aussi un peu la voûte (la lueur renvoyée par la pierre)
HOOKS.lights.push((eye) => {
  if (!souterrain.actif || !game.lantern || !(farm.count('lanterne') || farm.count('lanterne_aube'))) return [];
  return [{ x: eye[0], y: eye[1] + 0.6, z: eye[2], r: 26, c: [0.15, 0.115, 0.075], d: 0.01 }];
});
