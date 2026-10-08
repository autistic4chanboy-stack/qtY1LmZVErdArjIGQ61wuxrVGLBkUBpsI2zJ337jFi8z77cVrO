// ============================================================================
//  LE CHÂTEAU DES HAUTS — HAUTGUET (agent V4) — le jeu
//  - Les portes du château (Z.doors, d.v4) : fermées à clé (la clé ouvre pour de bon),
//    barrées d'un côté (on ôte la barre de ce côté-là seulement : un raccourci), ou
//    simples. Elles s'animent ici (dans la Zone, les habitants de la vallée, qui les
//    faisaient tourner, dorment).
//  - Les raccourcis à sens unique : le treuil du pont-levis (dans le châtelet), la roue
//    de la herse (à l'étage de la porte de la haute cour), la poterne de la dépense et
//    la poterne de l'est (barrées de l'intérieur), la grille du charnier (verrous
//    par-dessous), l'escalier des cachots (le trousseau, des deux côtés).
//  - Les recoins : murs creux (E : on frappe ; avec une pioche ou un marteau, ils
//    cèdent), fouilles (une fois ; le menu de butin), objets à prendre, trappes, puits,
//    boyaux, conduits.
//  - Les habitants : Thibaud, le vieil homme du treuil (vivant, à sa façon) ; la Dame,
//    derrière la porte de sa tour (la nuit seulement) ; les morts, là où ils sont.
//  - Le feu du Guet (le fanal du donjon) : trois mesures d'huile, et il brûle. Le pont baissé,
//    le feu rallumé, la porte de la Dame ouverte : le château se tait.
//  État : farm.s.v4 (chateauV4.S()).
// ============================================================================
const V4_RAYON = 230; // (m) au-delà, on n'est plus au château
// la salle → le lieu (pour le nom du lieu : la mort, les pensées)
const V4_SALLE_LIEU = {
  cour: 'v4_cour', galerie: 'v4_cour', basse_cour: 'v4_basse_cour', ecuries: 'v4_basse_cour', caserne: 'v4_basse_cour', forge: 'v4_basse_cour',
  grand_salle: 'v4_grand_salle', tribune: 'v4_grand_salle', cuisines: 'v4_cuisines', grenier: 'v4_cuisines', logis: 'v4_logis', logis_haut: 'v4_logis',
  chapelle: 'v4_chapelle', clocher: 'v4_chapelle', sacristie: 'v4_chapelle', crypte: 'v4_crypte', ossuaire: 'v4_crypte',
  donjon1: 'v4_donjon', donjon2: 'v4_donjon', donjon3: 'v4_donjon', terrasse: 'v4_donjon', tresor: 'v4_donjon', fosse_donjon: 'v4_fosse',
  tour_dame: 'v4_tour_dame', geolier: 'v4_cachots', cachots_couloir: 'v4_cachots', question: 'v4_cachots', cache_fuyard: 'v4_cachots',
  souterrain: 'v4_souterrain', charnier: 'v4_charnier', cave: 'v4_cave', cache_cave: 'v4_cave', puits: 'v4_cour',
  passage: 'v4_chatelet', treuil: 'v4_chatelet', loge: 'v4_chatelet', corps_garde: 'v4_chatelet', fosse: 'v4_chateau',
};
DYN_PROPS.add('v4_herse'); DYN_PROPS.add('v4_treuil'); DYN_PROPS.add('v4_cloche'); DYN_PROPS.add('v4_guet_feu'); DYN_PROPS.add('v4_lustre');

Object.assign(chateauV4, {
  anim: { pont: null, herse: 0, treuil: 0, cloche: 0, clocheT: 0 },
  // ------------------------------------------------------------- l'état vu des modèles
  pris(id) { return !!this.S().pris['o:' + id]; },
  fait(id) { return !!this.S().pris['f:' + id]; },
  murTombe(id) { return !!this.S().murs[id]; },
  herseK() { return this.anim.herse; },
  treuilK() { return this.anim.treuil; },
  levierOn(o) { return !!this.S().leviers.herse; },
  trappeOuverte(o) { return !!(o && o.data && this.S().trappes[o.data.id]); },
  grilleOuverte(o) { return !!(o && o.data && o.data.id && this.S().grilles[o.data.id]); },
  clocheA(t) { const T = this.anim.clocheT; return T > 0 ? Math.sin(T * 3.2) * 0.35 * Math.min(1, T / 4) : 0; },
  echelleCouchee() { return false; },
  coffreOuvert(o) { return !!(o && o.data && o.data.f && this.fait(o.data.f)); },
  pontBaisse() { return !!this.S().leviers.pont; },
  // le joueur est-il au château (dans la Zone, près du site) ?
  ici(pos) {
    const V = this.Z;
    if (!V || !zone.dedans || zone.Z !== game.world) return false;
    const p = pos || game.player.pos;
    return Math.hypot(p[0] - V.cx, p[2] - V.cz) < V4_RAYON;
  },
  // la salle où l'on est (ou null)
  salle(pos) {
    const V = this.Z;
    if (!V) return null;
    const p = pos || game.player.pos;
    let best = null;
    for (const s of V.salles) {
      if (p[0] < s.x0 || p[0] > s.x1 || p[2] < s.z0 || p[2] > s.z1 || p[1] < s.y0 - 0.6 || p[1] > s.y1 + 0.5) continue;
      if (!best || (s.x1 - s.x0) * (s.z1 - s.z0) < (best.x1 - best.x0) * (best.z1 - best.z0)) best = s;
    }
    return best;
  },

  // ------------------------------------------------------------- l'état appliqué au monde (à la génération, à l'entrée, au chargement)
  appliquer(gen) {
    const V = this.Z, S = this.S();
    if (!V) return;
    // le pont-levis
    const br = V.ponts.pont;
    if (br) { const a = S.leviers.pont ? 0 : Math.PI / 2 * 0.98; if (gen || this.anim.pont === null) { br.a = a; this.anim.pont = a; } br.moving = true; }
    // la herse : son bloc de collision levé au-dessus des têtes
    const H = V.herses.herse;
    if (H && H.blk) { H.blk.y = H.y + (S.leviers.herse ? 4.7 : 0); if (gen) this.anim.herse = S.leviers.herse ? 1 : 0; }
    // la trappe de l'oubliette, les grilles, les murs creux
    for (const id in V.trappes) { const T = V.trappes[id]; T.blk.y = S.trappes[id] ? -1000 : T.y; }
    for (const id in V.grilles) { const G = V.grilles[id]; if (G.y0 === undefined) G.y0 = G.blk.y; G.blk.y = S.grilles[id] ? -1000 : G.y0; }
    let murs = false;
    for (const id in V.murs) if (S.murs[id]) for (const b of V.murs[id].blocs) { if (b && !b.hidden) { b.y = -1000; b.hidden = true; murs = true; } }
    // les portes : déverrouillées pour de bon une fois ouvertes (clé ou barre)
    for (const id in V.portes) {
      const d = V.portes[id];
      if (S.portes[id] === 'ouverte') { d.locked = false; if (gen) { d.open = 1; d.a = 1.5; } }
    }
    // le Guet
    const world = V.monde;
    if (world && V.guet) for (const q of world.props) if ((q.id === 'v4_guet' || q.id === 'v4_guet_feu') && Math.abs(q.x - V.guet.x) < 0.5 && Math.abs(q.z - V.guet.z) < 0.5) q.id = S.guet ? 'v4_guet_feu' : 'v4_guet';
    if (murs && world) { world.blocksDirty = true; world.coverDirty = true; world.shadeDirty = true; }
    if (world && !gen) { world.blocksDirty = true; farm.dirtyProps = true; try { world.collectLights(); } catch (e) { /* */ } }
  },

  // ------------------------------------------------------------- aller quelque part (escaliers à vis, échelles, conduits…)
  async aller(to, texte, yaw) {
    if (!to || game.sleeping || game.dying) return;
    game.sleeping = true;
    try {
      await ui.fade(true, texte || '', 600);
      const p = game.player;
      p.pos = [to[0], to[1] + 0.05, to[2]]; p.vel = [0, 0, 0];
      if (yaw !== undefined && yaw !== null) p.yaw = yaw;
      game.renderer.uploadCover(p.pos[0], p.pos[2]);
      if (typeof furtif !== 'undefined') furtif.J = null;
      await ui.fade(false, '', 500);
    } finally { game.sleeping = false; }
  },
  dire(t, d) { ui.subtitle('', t, d || 3.2); },
  pos(it) { return [it.x, it.y, it.z]; },

  // ------------------------------------------------------------- les portes du château
  porte(dr) {
    const S = this.S(), v = dr.v4 || {}, p = game.player;
    const cote = (p.pos[0] - dr.x) * Math.sin(dr.r) + (p.pos[2] - dr.z) * Math.cos(dr.r); // > 0 : du côté +z (dedans)
    if (dr.locked) {
      // une barre (de ce côté-là seulement), puis peut-être une serrure (la clé, des deux côtés)
      const etat = S.portes[v.id], barreLa = v.barre && etat !== 'barre' && etat !== 'ouverte';
      if (barreLa) {
        const deCeCote = v.barre === 'dedans' ? cote > 0 : cote < 0;
        if (deCeCote) {
          ui.choice(V4_TEXTES.barreTitre, V4_TEXTES.barreDedans + (v.cle ? ' Sous la barre, une serrure.' : ''), [
            { label: V4_TEXTES.barreLever, fn: () => {
              ui.close();
              if (v.cle && !farm.count(v.cle)) { S.portes[v.id] = 'barre'; sound.lock && sound.lock(false); this.dire('(La barre est ôtée. La serrure tient encore.)', 3); if (typeof furtif !== 'undefined') furtif.bruit(dr.x, dr.y, dr.z, 9, 'porte'); return; }
              this.deverrouiller(dr, 'barre');
            } },
            { label: 'Laisser', fn: () => ui.close() },
          ]);
          return;
        }
        if (v.cle && farm.count(v.cle)) { sound.lock && sound.lock(false); this.dire('(La clé tourne. La porte ne bouge pas : elle est barrée de l’autre côté.)', 3.5); return; }
        sound.knock && sound.knock(1); this.dire(V4_TEXTES.barreDehors); return;
      }
      if (v.cle) {
        if (farm.count(v.cle)) { this.deverrouiller(dr, 'cle'); return; }
        // la sacristie se crochète (la compétence de U, si elle est là) ; les autres serrures, non
        if (v.id === 'sacristie' && typeof crochetage !== 'undefined' && crochetage.tenter && farm.count('crochets')) {
          ui.choice('La porte de la sacristie', 'Fermée à clé. Une serrure d’église, ancienne, mais bonne.', [
            { label: 'Crocheter la serrure', fn: () => { ui.close(true); this.crocheter(dr); } },
            { label: 'Laisser', fn: () => ui.close() },
          ]);
          return;
        }
        sound.lock && sound.lock(true); this.dire(V4_TEXTES.ferme, 2.4);
        if (v.id === 'tour_dame') setTimeout(() => this.dameBouge(), 900);
        return;
      }
    }
    dr.open = dr.open ? 0 : 1;
    sound.door && sound.door(!!dr.open);
    if (typeof furtif !== 'undefined') furtif.bruit(dr.x, dr.y, dr.z, 9, 'porte');
  },
  deverrouiller(dr, comment) {
    const S = this.S(), v = dr.v4 || {};
    if (v.id) S.portes[v.id] = 'ouverte';
    dr.locked = false; dr.open = 1;
    if (comment === 'barre') { sound.lock && sound.lock(false); setTimeout(() => sound.door && sound.door(true), 380); }
    else { sound.lock && sound.lock(false); setTimeout(() => sound.door && sound.door(true), 300); if (comment === 'cle') this.dire(V4_TEXTES.cleTourne, 2.2); }
    if (typeof furtif !== 'undefined') furtif.bruit(dr.x, dr.y, dr.z, 12, 'porte');
    if (v.id === 'tour_dame') { S.dame.fin = true; this.verifierFin(); }
    farm.save && farm.save();
  },
  async crocheter(dr) {
    if (typeof furtif !== 'undefined') furtif.bruit(dr.x, dr.y, dr.z, 8, 'serrure');
    let ok = false;
    try { ok = await crochetage.tenter({ difficulte: 4, bruit: 1.2, x: dr.x, z: dr.z, proprietaire: null, titre: 'La porte de la sacristie', crime: null, v4: true }); } catch (e) { console.error(e); }
    if (ok) this.deverrouiller(dr, 'crochet');
  },
  dameBouge() { if (this.S().dame.fin) return; if (this.nuit()) this.dire('(Là-haut, quelque chose se lève et vient jusqu’à la porte. Puis plus rien.)', 3.5); },
  nuit() { const h = (farm.w ? farm.w.time : 0.5) * 24; return h >= 21 || h < 5; },

  // ------------------------------------------------------------- les interactions
  lire(it) {
    const d = it.data || {}, S = this.S();
    if (!d.t) { this.dire(d.texte || '', 3.5); return; }
    const L = V4_LIRE[d.t];
    if (!L) return;
    S.lus[d.t] = (S.lus[d.t] || 0) + 1;
    ui.read(L[0], L[1], L[2]);
    sound.page && sound.page();
  },
  prendre(it) {
    const d = it.data || {}, S = this.S();
    if (S.pris['o:' + d.id]) return;
    S.pris['o:' + d.id] = farm.s.day || 1;
    farm.give(d.item, 1); play.flyer(d.item, [it.x, it.y, it.z], 1);
    sound.pop && sound.pop();
    farm.dirtyProps = true;
    if (d.item === 'v4_cle_tour') setTimeout(() => this.dire('(Les doigts du mort ne serraient plus rien depuis longtemps.)', 3.2), 600);
    if (d.item === 'v4_cle_donjon') setTimeout(() => this.dire('(Elle est froide comme la pierre où il l’a gardée.)', 3), 600);
    if (d.texte) setTimeout(() => this.dire(d.texte, 3.2), 600);
  },
  fouiller(it) {
    const d = it.data || {}, S = this.S(), cle = 'v4:' + d.id;
    const premier = !S.pris['f:' + d.id];
    const objets = () => d.fixe ? d.fixe.map((e) => e.slice()) : (d.table ? rollLoot(d.table) : []);
    if (premier) { S.pris['f:' + d.id] = farm.s.day || 1; farm.dirtyProps = true; }
    sound.lootOpen && sound.lootOpen();
    if (typeof furtif !== 'undefined') furtif.bruit(it.x, it.y, it.z, 5, 'fouille');
    if (typeof butin !== 'undefined' && butin.ouvrir) {
      // (le menu de butin garde ce qu'on laisse, par la clé ; la première fois, on tire le contenu)
      const B = butin.S && butin.S();
      if (!premier && (!B || !B.c || !B.c[cle])) { this.dire(V4_TEXTES.coffreVide, 2.2); return; }
      if (butin.ouvrir({ titre: d.titre || it.name || 'Fouiller', objets: premier ? objets : [], cle, x: it.x, y: it.y, z: it.z, temoins: false })) return;
      return;
    }
    if (!premier) { this.dire(V4_TEXTES.coffreVide, 2.2); return; }
    const pos = [it.x, it.y + 0.2, it.z];
    for (const [k, n] of objets()) { if (k === 'argent') { farm.earn(n); sound.coin && sound.coin(); continue; } farm.give(k, n); play.flyer(k, pos, n); }
  },
  levier(it) {
    const d = it.data || {}, S = this.S();
    if (d.id === 'pont') {
      if (S.leviers.pont) { this.dire('(' + V4_TEXTES.treuilFait + ')', 2.6); return; }
      const T = S.thibaud, la = T.etat === 'treuil';
      ui.choice(V4_TEXTES.treuilTitre, V4_TEXTES.treuilDesc + (la ? '\n\nLe vieil homme ne dit rien. Il vous regarde faire.' : ''), [
        { label: V4_TEXTES.treuilBaisser, fn: () => { ui.close(); this.baisserPont(); } },
        { label: 'Laisser', fn: () => ui.close() },
      ]);
      return;
    }
    if (d.id === 'herse') {
      if (S.leviers.herse) { this.dire('(' + V4_TEXTES.herseFait + ')', 2.6); return; }
      ui.choice(V4_TEXTES.herseTitre, V4_TEXTES.herseDesc, [
        { label: V4_TEXTES.herseLever, fn: () => { ui.close(); this.leverHerse(); } },
        { label: 'Laisser', fn: () => ui.close() },
      ]);
    }
  },
  baisserPont() {
    const S = this.S(), V = this.Z, br = V && V.ponts.pont;
    if (!br || S.leviers.pont) return;
    S.leviers.pont = farm.s.day || 1;
    this.anim.treuilT = 6;
    sound.v4Chaines && sound.v4Chaines([br.x, br.y + 6, br.z], 5.5);
    if (typeof furtif !== 'undefined') { furtif.bruit(br.x, br.y, br.z, 70, 'pont'); furtif.alerter(br.x, br.z, 60, 0.6); }
    const T = S.thibaud;
    if (T.etat === 'treuil') { T.etat = 'baisse'; T.jour = farm.s.day; setTimeout(() => ui.subtitle('Thibaud', V4_THIBAUD.baisse, 7), 2500); }
    setTimeout(() => { if (this.ici()) this.dire('(' + V4_TEXTES.treuilFait + ')', 3); }, 6200);
    this.verifierFin();
    farm.save && farm.save();
  },
  leverHerse() {
    const S = this.S(), V = this.Z, H = V && V.herses.herse;
    if (!H || S.leviers.herse) return;
    S.leviers.herse = farm.s.day || 1;
    this.anim.herseT = 4;
    sound.v4Herse && sound.v4Herse([H.blk.x, H.y + 3, H.blk.z]);
    if (typeof furtif !== 'undefined') furtif.bruit(H.blk.x, H.y, H.blk.z, 30, 'herse');
    farm.save && farm.save();
  },
  escalier(it) {
    const d = it.data || {}, S = this.S(), cle = d.cle, id = 'esc:' + d.id;
    if (cle && S.portes[id] !== 'ouverte') {
      if (!farm.count(cle)) { sound.lock && sound.lock(true); this.dire('(Une grille de fer, fermée à clé. Derrière, des marches qui descendent dans le noir.)', 3.5); return; }
      S.portes[id] = 'ouverte'; sound.lock && sound.lock(false); this.dire(V4_TEXTES.cleTourne, 2);
      if (this.Z) for (const q of zone.Z.props) if (q.id === 'porte_grille' && q.data && q.data.open === false) { q.data.open = true; farm.dirtyProps = true; }
      setTimeout(() => this.aller(d.to, d.texte || '', d.yaw), 700);
      return;
    }
    if (d.desc) {
      ui.choice(it.name || '', d.desc, [
        { label: it.name || (d.sens === 'monter' ? V4_TEXTES.monter : V4_TEXTES.descendre), fn: () => { ui.close(); this.aller(d.to, d.texte || '', d.yaw); } },
        { label: 'Laisser', fn: () => ui.close() },
      ]);
      return;
    }
    this.aller(d.to, d.texte || '', d.yaw);
  },
  passage(it) {
    const d = it.data || {};
    if (d.desc) {
      ui.choice(it.name || '', d.desc, [
        { label: it.name || 'Passer', fn: () => { ui.close(); this.aller(d.to, d.texte || '', d.yaw); } },
        { label: 'Laisser', fn: () => ui.close() },
      ]);
      return;
    }
    this.aller(d.to, d.texte || '', d.yaw);
  },
  mur(it) {
    const d = it.data || {}, S = this.S(), V = this.Z, M = V && V.murs[d.id];
    if (!M || S.murs[d.id]) return;
    const pos = [it.x, it.y, it.z];
    sound.v4Creux && sound.v4Creux(pos);
    if (typeof furtif !== 'undefined') furtif.bruit(it.x, it.y, it.z, 10, 'mur');
    const outil = farm.bestTool('pioche') || farm.bestTool('marteau');
    S.frappes = S.frappes || {};
    S.frappes[d.id] = (S.frappes[d.id] || 0) + 1;
    if (!outil || S.frappes[d.id] < 2) { this.dire(outil ? V4_TEXTES.murCreux : V4_TEXTES.murCreux + ' ' + V4_TEXTES.murOutil, 3); return; }
    S.murs[d.id] = farm.s.day || 1;
    for (const b of M.blocs) if (b) { puffAt(b.x, b.y + b.sy / 2, b.z, [140, 132, 120], 14, 2.2, false); }
    this.appliquer(false);
    sound.v4Pierre && sound.v4Pierre(pos);
    if (typeof furtif !== 'undefined') furtif.bruit(it.x, it.y, it.z, 22, 'mur');
    game.shakeT = Math.max(game.shakeT || 0, 0.25);
    this.dire(V4_TEXTES.murTombe, 3.2);
    farm.save && farm.save();
  },
  trappe(it) {
    const d = it.data || {}, S = this.S();
    if (!S.trappes[d.id]) {
      ui.choice(V4_TEXTES.trappeTitre, V4_TEXTES.trappeDesc, [
        { label: V4_TEXTES.trappeOuvrir, fn: () => { ui.close(); S.trappes[d.id] = farm.s.day || 1; this.appliquer(false); sound.door && sound.door(true); if (typeof furtif !== 'undefined') furtif.bruit(it.x, it.y, it.z, 10, 'trappe'); setTimeout(() => this.trappe(it), 500); } },
        { label: 'Laisser', fn: () => ui.close() },
      ]);
      return;
    }
    ui.choice(V4_TEXTES.trappeTitre, V4_TEXTES.trappeOuverte, [
      { label: V4_TEXTES.trappeDescendre, fn: async () => { ui.close(); await this.aller(d.to, V4_TEXTES.fosse, Math.PI); if (game.player) game.player.hp = Math.max(1, game.player.hp - 6); } },
      { label: 'Laisser', fn: () => ui.close() },
    ]);
  },
  grille(it) {
    const d = it.data || {}, S = this.S();
    if (d.id === 'charnier') {
      if (d.dessous) {
        if (!S.grilles.charnier) {
          ui.choice(V4_TEXTES.grilleTitre, V4_TEXTES.grilleDedans, [
            { label: V4_TEXTES.grilleOuvrir, fn: () => { ui.close(); S.grilles.charnier = farm.s.day || 1; sound.v4Grille && sound.v4Grille([it.x, it.y, it.z]); farm.dirtyProps = true; farm.save && farm.save(); setTimeout(() => this.aller(d.to, 'Vous sortez dans le charnier.', d.yaw), 1600); } },
            { label: 'Laisser', fn: () => ui.close() },
          ]);
          return;
        }
        this.aller(d.to, 'Vous montez dans le charnier.', d.yaw); return;
      }
      if (!S.grilles.charnier) { this.dire(V4_TEXTES.grilleDehors, 3); return; }
      this.aller(d.to, 'Vous descendez sous le charnier.', d.yaw); return;
    }
    // une grille de cellule (le trousseau)
    if (S.grilles[d.id]) return;
    if (d.cle && !farm.count(d.cle)) { sound.lock && sound.lock(true); this.dire(V4_TEXTES.ferme, 2.2); return; }
    S.grilles[d.id] = farm.s.day || 1; this.appliquer(false);
    sound.lock && sound.lock(false); sound.v4Grille && sound.v4Grille([it.x, it.y, it.z]);
    if (typeof furtif !== 'undefined') furtif.bruit(it.x, it.y, it.z, 12, 'grille');
  },
  cloche(it) {
    const V = this.Z, now = game.time;
    if (now - (this.clocheDer || -99) < 20) return;
    ui.choice(V4_TEXTES.cloche, V4_TEXTES.clocheDesc, [
      { label: V4_TEXTES.clocheTirer, fn: () => { ui.close(); this.sonner(); } },
      { label: 'Laisser', fn: () => ui.close() },
    ]);
  },
  sonner() {
    const V = this.Z, C = V && V.cloche;
    if (!C) return;
    this.clocheDer = game.time; this.anim.clocheT = 9;
    sound.v4Cloche && sound.v4Cloche([C.x, C.y, C.z], 1);
    setTimeout(() => sound.v4Cloche && sound.v4Cloche([C.x, C.y, C.z], 0.7), 2600);
    if (typeof furtif !== 'undefined') { furtif.bruit(C.x, C.y, C.z, 160, 'cloche'); furtif.alerter(C.x, C.z, 160, 1.1); }
    const S = this.S(); S.cloche = (S.cloche || 0) + 1;
  },
  guet(it) {
    const S = this.S();
    if (S.guet) { this.dire('(' + V4_TEXTES.guetBrule + ')', 3); return; }
    const assez = farm.count('huile') >= 3;
    ui.choice(V4_TEXTES.guetTitre, V4_TEXTES.guetDesc + (assez ? '' : '\n\n' + V4_TEXTES.guetHuile), assez ? [
      { label: V4_TEXTES.guetAllumer, fn: () => { ui.close(); this.allumerGuet(); } },
      { label: 'Laisser', fn: () => ui.close() },
    ] : [{ label: 'Laisser', fn: () => ui.close() }]);
  },
  allumerGuet() {
    const S = this.S(), V = this.Z;
    if (S.guet || farm.count('huile') < 3) return;
    farm.take('huile', 3);
    S.guet = true; S.guetJour = farm.s.day || 1;
    this.appliquer(false);
    sound.v4Guet && sound.v4Guet([V.guet.x, V.guet.y + 2, V.guet.z]);
    this.dire('(' + V4_TEXTES.guetAllume + ')', 4.5);
    if (typeof furtif !== 'undefined') furtif.bruit(V.guet.x, V.guet.y, V.guet.z, 40, 'guet');
    for (const fn of this.surGuet) try { fn(true); } catch (e) { console.error(e); }
    try { if (zone.dragon && typeof zone.dragon.guet === 'function') zone.dragon.guet(true, { x: V.guet.x, y: V.guet.y, z: V.guet.z }); } catch (e) { console.error(e); }
    this.verifierFin();
    farm.save && farm.save();
  },
  surGuet: [],

  // ------------------------------------------------------------- les voix : Thibaud, la Dame
  thibaudEtat() {
    const T = this.S().thibaud;
    if (T.etat === 'baisse' && farm.s && farm.s.day > (T.jour || 0)) T.etat = 'bout';
    return T.etat;
  },
  parler(it) {
    const d = it.data || {};
    if (d.qui === 'thibaud') return this.parlerThibaud();
    if (d.qui === 'dame') return this.parlerDame();
    if (d.qui === 'thibaud_bout') { ui.read('Au bout du pont', V4_THIBAUD.bout); return; }
  },
  parlerThibaud(sujet) {
    const S = this.S(), T = S.thibaud, etat = this.thibaudEtat();
    if (etat === 'bout' || etat === 'parti') { this.dire('(' + V4_THIBAUD.apres + ')', 3.5); return; }
    let txt;
    if (sujet) txt = V4_THIBAUD[sujet];
    else if (etat === 'baisse') txt = 'Le vieil homme regarde par la meurtrière, vers les Degrés. Il ne se retourne pas.';
    else if (!T.n) txt = V4_THIBAUD.premier;
    else txt = V4_THIBAUD.revoir[T.n % V4_THIBAUD.revoir.length];
    if (!sujet) T.n++;
    if (etat === 'baisse') { ui.choice(V4_THIBAUD.titre, txt, [{ label: 'Le laisser', fn: () => ui.close() }]); return; }
    const opts = [];
    const vu = (k) => S.parle['t_' + k];
    const q = (k, lab) => opts.push({ label: lab, fn: () => { S.parle['t_' + k] = 1; this.parlerThibaud(k); } });
    q('qui', vu('qui') ? '« Thibaud… »' : '« Qui êtes-vous ? »');
    q('quoi', '« Que s’est-il passé ? »');
    if (vu('quoi')) q('treuil', '« Le treuil ? »');
    if (vu('quoi')) q('dame', '« La dame ? »');
    if (vu('treuil') || vu('dame')) q('guet', '« Le feu du Guet ? »');
    opts.push({ label: 'Le laisser', fn: () => ui.close() });
    ui.choice(V4_THIBAUD.titre, txt, opts);
  },
  parlerDame() {
    const S = this.S(), D = S.dame;
    if (D.fin) { this.dire('(' + V4_DAME.silence + ')', 3); return; }
    sound.knock && sound.knock(2);
    if (!this.nuit()) { setTimeout(() => this.dire('(' + V4_DAME.muette + ')', 4), 900); return; }
    let txt;
    if (!D.n) txt = V4_DAME.premier;
    else if (farm.count('v4_cle_tour')) txt = V4_DAME.aCle;
    else if (S.guet && !D.guet) { txt = V4_DAME.guet; D.guet = 1; }
    else if (S.leviers.pont && !D.pont) { txt = V4_DAME.pontBaisse; D.pont = 1; }
    else { const L = S.leviers.pont ? [V4_DAME.pontBaisse, V4_DAME.cle, V4_DAME.aude] : [V4_DAME.pontLeve, V4_DAME.cle, V4_DAME.aude]; txt = L[(D.n - 1) % L.length]; }
    D.n++;
    setTimeout(() => ui.choice(V4_DAME.titre, txt, [
      { label: 'Frapper encore', fn: () => { ui.close(); setTimeout(() => this.parlerDame(), 400); } },
      { label: 'Partir', fn: () => ui.close() },
    ]), 1100);
  },
  // le pont baissé, le Guet rallumé, la porte de la Dame ouverte : le château se tait
  verifierFin() {
    const S = this.S();
    if (S.fin || !S.leviers.pont || !S.guet || !S.dame.fin) return;
    S.fin = farm.s.day || 1;
    setTimeout(() => this.dire('(' + V4_TEXTES.fini + ')', 6), 3000);
  },

  // ------------------------------------------------------------- chaque image, au château
  update(dt) {
    const V = this.Z, S = this.S();
    if (!V || zone.Z !== game.world) return;
    const p = game.player.pos, d = Math.hypot(p[0] - V.cx, p[2] - V.cz);
    // le pont-levis : notre angle (le jeu les lève la nuit : pas celui-ci)
    const br = V.ponts.pont;
    if (br) {
      const tgt = S.leviers.pont ? 0 : Math.PI / 2 * 0.98;
      if (this.anim.pont === null) this.anim.pont = tgt;
      this.anim.pont += clamp(tgt - this.anim.pont, -dt * 0.3, dt * 0.3);
      br.a = this.anim.pont; br.moving = true;
    }
    this.anim.treuilT = Math.max(0, (this.anim.treuilT || 0) - dt);
    if (this.anim.treuilT > 0) this.anim.treuil += dt * 0.3;
    // la herse
    const ht = S.leviers.herse ? 1 : 0;
    this.anim.herse += clamp(ht - this.anim.herse, -dt * 0.28, dt * 0.28);
    const H = V.herses.herse;
    if (H && H.blk) H.blk.y = H.y + (this.anim.herse > 0.5 ? 4.7 : 0);
    this.anim.clocheT = Math.max(0, (this.anim.clocheT || 0) - dt);
    if (d > V4_RAYON + 60) return;
    // les portes du château s'animent (les habitants de la vallée, qui le faisaient, dorment)
    for (const dr of game.world.doors) if (dr.v4) { const tgt = dr.open ? 1.5 : 0; if (dr.a !== tgt) dr.a += clamp(tgt - dr.a, -dt * 3, dt * 3); }
    // la première fois qu'on voit le château, de loin
    if (!S.vus.arrivee && d < 215 && d > 125) { S.vus.arrivee = 1; this.dire(V4_TEXTES.arrivee, 3.5); }
    // des pas, au loin, dans les salles vides (rarement, la nuit, quand on est dedans)
    this.pasT = (this.pasT || 20) - dt;
    if (this.pasT <= 0) {
      this.pasT = 40 + Math.random() * 70;
      const s = this.salle();
      if (s && s.couvert && this.nuit() && Math.random() < 0.6) { const a = Math.random() * TAU; sound.v4Pas && sound.v4Pas([p[0] + Math.cos(a) * 14, p[1] + 2, p[2] + Math.sin(a) * 14]); }
    }
    // le crochetage (de U) est suspendu dans la Zone : on fait tourner la partie commencée ici
    if (typeof crochetage !== 'undefined' && crochetage.jeu && crochetage.jeu.o && crochetage.jeu.o.v4 && crochetage._v4t !== game.time) { try { crochetage.update(dt); } catch (e) { console.error(e); } }
  },
  // Thibaud, au treuil (vivant) ; au bout du pont, le lendemain (mort)
  rigs: {},
  dessiner(buf, sbuf, cam, t) {
    const V = this.Z;
    if (!V || !V.thibaud || zone.Z !== game.world) return;
    const etat = this.thibaudEtat();
    if (etat === 'treuil' || etat === 'baisse') {
      const T = V.thibaud;
      if (Math.abs(T.x - cam[0]) > 60 || Math.abs(T.z - cam[2]) > 60) return;
      const r = this.rigs.thibaud || (this.rigs.thibaud = humanRig({ skin: '#c8b49c', hair: '#c8c4bc', top: '#4a4238', bottom: '#3a342c', shoe: '#2a2018', beard: 'longue', old: true, build: 'mince', hat: 'capuche', hatCol: '#3e3226' }));
      poseHuman(r, { sit: true, lean: 0.32, lookP: etat === 'baisse' ? 0.05 : 0.35 + Math.sin(t * 0.4) * 0.04, lookY: etat === 'baisse' ? 0.5 : 0, t, tilt: 0.06 });
      r.set('armL', -0.75, 0, 0.2); r.set('armR', -0.85, 0, -0.2);
      drawRig(buf, r, T.x, T.y + 0.04 + Math.sin(t * 1.3) * 0.004, T.z, T.r, 1);
      drawShadow(sbuf, T.x, T.y, T.z, 0.45);
      return;
    }
    if (etat === 'bout' && V.thibaudBout && typeof depouilles !== 'undefined' && depouilles.squelette) {
      const T = V.thibaudBout;
      if (Math.abs(T.x - cam[0]) > 60 || Math.abs(T.z - cam[2]) > 60) return;
      let r = this.rigs.bout;
      if (!r) { try { r = this.rigs.bout = depouilles.squelette({ skin: '#cfc6b0', hair: '#c8c4bc', top: '#4a4238', bottom: '#3a342c', shoe: '#2a2018', beard: 'longue' }); poseHuman(r, { sit: true, lean: 0.45, lookP: 0.25 }); } catch (e) { r = this.rigs.bout = null; } }
      if (r) drawRig(buf, r, T.x, T.y - 0.38, T.z, T.r, 1);
    }
  },
  // sous terre, au château : il fait noir (ni ciel ni lune)
  ciel(sky) {
    if (!this.ici()) return;
    const p = game.player;
    if (!p.underground) return;
    const N = [0, 0, 0];
    sky.amb = [0.03, 0.03, 0.035]; sky.sunCol = N; sky.moonCol = N; sky.glow = N; sky.stars = 0; sky.sunVis = 0; sky.moonVis = 0;
    sky.zen = [0.004, 0.004, 0.005]; sky.hor = [0.005, 0.005, 0.006]; sky.haze = [0.005, 0.005, 0.006]; sky.cloudLit = N; sky.cloudDark = N; sky.cloudCover = 0;
    sky.shadowK = 0; sky.nightLit = 1; sky.wet = 0; sky.fog = [4, 70];
  },
});

// ---------------------------------------------------------------- branchements
HOOKS.inter.v4_lire = (it) => chateauV4.lire(it);
HOOKS.inter.v4_prendre = (it) => chateauV4.prendre(it);
HOOKS.inter.v4_fouille = (it) => chateauV4.fouiller(it);
HOOKS.inter.v4_levier = (it) => chateauV4.levier(it);
HOOKS.inter.v4_escalier = (it) => chateauV4.escalier(it);
HOOKS.inter.v4_passage = (it) => chateauV4.passage(it);
HOOKS.inter.v4_mur = (it) => chateauV4.mur(it);
HOOKS.inter.v4_trappe = (it) => chateauV4.trappe(it);
HOOKS.inter.v4_grille = (it) => chateauV4.grille(it);
HOOKS.inter.v4_cloche = (it) => chateauV4.cloche(it);
HOOKS.inter.v4_guet = (it) => chateauV4.guet(it);
HOOKS.inter.v4_parler = (it) => chateauV4.parler(it);
{
  const dans = () => zone.dedans;
  for (const k of ['v4_lire', 'v4_levier', 'v4_escalier', 'v4_passage', 'v4_trappe', 'v4_cloche', 'v4_guet']) HOOKS.interVis[k] = dans;
  HOOKS.interVis.v4_prendre = (it) => dans() && !chateauV4.pris(it.data.id);
  HOOKS.interVis.v4_fouille = (it) => dans();
  HOOKS.interVis.v4_mur = (it) => dans() && !chateauV4.S().murs[it.data.id];
  HOOKS.interVis.v4_grille = (it) => dans() && (it.data.id === 'charnier' || !chateauV4.S().grilles[it.data.id]);
  HOOKS.interVis.v4_parler = (it) => {
    if (!dans()) return false;
    const e = chateauV4.thibaudEtat();
    if (it.data.qui === 'thibaud') return e === 'treuil' || e === 'baisse';
    if (it.data.qui === 'thibaud_bout') return e === 'bout';
    return true;
  };
}
zone.sur('update', (dt) => chateauV4.update(dt));
zone.sur('draw', (buf, sbuf, cam, t) => chateauV4.dessiner(buf, sbuf, cam, t));
zone.sur('sky', (sky) => chateauV4.ciel(sky));
zone.sur('entrer', () => { try { chateauV4.appliquer(false); } catch (e) { console.error(e); } });
// lire le registre, la lettre de la Dame (l'objet en main, clic)
HOOKS.primary.push((eye, basis, held, it, id) => {
  if (held) return false;
  if (id === 'v4_registre') { ui.read('Registre de la porte de Hautguet', V4_REGISTRE, 'Gaucher, portier'); sound.page && sound.page(); play.cool = 0.6; return true; }
  if (id === 'v4_lettre_dame') { ui.read('À qui ouvrira', V4_LETTRE_DAME, 'Ysolde'); sound.page && sound.page(); play.cool = 0.6; return true; }
  return false;
});
// la discrétion : sous terre, au château, sans lanterne ni feu, il fait noir
if (typeof furtif !== 'undefined') furtif.lumieresEnPlus.push((J) => (game.player && game.player.underground && chateauV4.ici() ? -0.85 : 0));
// les portes du château, la mort (le nom du lieu) : au premier chargement
HOOKS.load.push(() => {
  chateauV4.S();
  chateauV4.anim.pont = null; chateauV4.rigs = {};
  if (game._v4) return;
  game._v4 = true;
  const _ud = game.useDoor.bind(game);
  game.useDoor = function (dr) { if (dr && dr.v4 && zone.dedans) return chateauV4.porte(dr); return _ud(dr); };
  if (typeof crochetage !== 'undefined' && crochetage.update) { const _cu = crochetage.update.bind(crochetage); crochetage.update = function (dt) { this._v4t = game.time; return _cu(dt); }; }
  const _zl = zone.lieu.bind(zone);
  zone.lieu = function (p) {
    if (zone.dedans && chateauV4.Z && p && chateauV4.ici(p)) { const s = chateauV4.salle(p); return V4_LIEUX[(s && V4_SALLE_LIEU[s.id]) || 'v4_chateau']; }
    return _zl(p);
  };
});
