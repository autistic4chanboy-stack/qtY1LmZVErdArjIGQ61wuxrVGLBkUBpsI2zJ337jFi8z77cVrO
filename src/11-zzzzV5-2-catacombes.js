// ============================================================================
//  BASSE-FOSSE (agent V5) — la ville en jeu : l'entrée, la nuit d'en bas, les
//  lieux qu'on lit, ce qu'on prend, les murs qui mentent
//  - L'entrée (plusieurs indices) : aux heures des offices, on entend sous les
//    dalles de la Ville Basse des cloches très étouffées, d'autant plus fort
//    qu'on approche de la tonnellerie ; l'enseigne tombée ; la trappe sous les
//    gravats (il faut la dégager : du bruit) ; dans la cave, le foudre, dont la
//    portette n'est ouverte qu'au matin (de 5 h à 7 h 30 : on entend la barre
//    glisser en bas) — jusqu'à ce qu'on ait levé la barre de l'autre côté.
//  - Dessous (la cave, le Septième Degré, la ville) : pas de ciel ; il fait noir
//    hors des feux et des chandelles ; une ambiance à part (gouttes, os, murmures,
//    les cloches des offices).
//  - La loi I : un feu qui n'est pas le leur (la lanterne allumée ailleurs qu'à
//    l'un de leurs feux) se voit et se dénonce ; allumée à leur feu, elle passe.
//  - Les murs qui mentent : un coup (n'importe quel outil, les mains nues) les
//    dissipe ; aucun signe avant, sinon un souffle d'air, de près.
//  État : farm.s.v5 (voir catacombesV5.S()).
//  API : zone.catacombes (contrat, section V5).
// ============================================================================
const V5_OFFICES = [{ h: 6, n: 5, nom: 'prime' }, { h: 12, n: 3, nom: 'sexte' }, { h: 18, n: 7, nom: 'le compte' }, { h: 21, n: 3, nom: 'complies' }];
const catacombesV5 = {
  // ------------------------------------------------------------- l'état sauvegardé
  S() {
    const s = typeof farm !== 'undefined' && farm.s;
    if (!s) return { v: 1, lus: {}, pris: {}, fouilles: {}, murs: {}, morts: {}, vus: {} };
    const S = s.v5 || (s.v5 = { v: 1 });
    for (const k of ['lus', 'pris', 'fouilles', 'murs', 'morts', 'vus', 'parle']) if (!S[k] || typeof S[k] !== 'object') S[k] = {};
    if (S.compte === undefined) S.compte = 0;
    if (S.fin === undefined) S.fin = null;
    return S;
  },
  Z() { return zone.Z && zone.Z.v5 ? zone.Z.v5 : null; },
  heure() { return farm.w ? farm.w.time * 24 : 12; },
  matin() { const h = this.heure(); return h >= 5 && h < 7.5; },

  // ------------------------------------------------------------- où l'on est
  // dans la ville (sous la voûte, entre les murs)
  enVille(p) {
    const v = this.Z();
    if (!v || !p) return false;
    const st = v.site;
    return Math.hypot(p[0] - st.x, p[2] - st.z) < V5_PLAN.MUR + V5_PLAN.EP_MUR && p[1] < v.TOP && p[1] > v.F - 3;
  },
  // dans la galerie du Septième Degré
  auDegre(p) {
    const v = this.Z();
    if (!v || !p) return false;
    const [lx, lz] = v5Local(v.CF, p[0], p[2]), D = v.degre;
    return Math.abs(lx) < D.larg / 2 + 1 && lz > D.zBas - 7 && lz < D.zTop + 0.8 && p[1] < v.cave.sol - 1.5 && p[1] > v.F - 3;
  },
  // dans la cave du tonnelier
  enCave(p) {
    const v = this.Z();
    if (!v || !p) return false;
    const C = v.cave2, [lx, lz] = v5Local(v.CF, p[0], p[2]);
    return Math.abs(lx) < 4.6 && Math.abs(lz - C.zc) < 3.6 && p[1] < v.cave.sol - 2 && p[1] > C.y - 1.5;
  },
  // sous terre, chez V5 (la ville, le Degré, la cave, les caveaux des secrets)
  dedans(p) {
    if (!zone.dedans || !p) return false;
    if (this.enVille(p) || this.auDegre(p) || this.enCave(p)) return true;
    return typeof secretsV5 !== 'undefined' ? secretsV5.dedans(p) : false;
  },

  // ------------------------------------------------------------- dessous, pas de ciel
  ciel(sky) {
    const p = game.player ? game.player.eyePos() : null;
    const k = this.nuitK || 0;
    if (!(k > 0)) return;
    const N = [0, 0, 0], mix = (a, b) => v3.lerp(a, b, k);
    sky.zen = mix(sky.zen, [0.004, 0.004, 0.005]); sky.hor = mix(sky.hor, [0.006, 0.0055, 0.006]); sky.glow = mix(sky.glow, N); sky.haze = mix(sky.haze, [0.006, 0.005, 0.005]);
    sky.amb = mix(sky.amb, [0.05, 0.047, 0.052]); sky.sunCol = mix(sky.sunCol, N); sky.moonCol = mix(sky.moonCol, N);
    if (sky.cloudLit) sky.cloudLit = mix(sky.cloudLit, N);
    if (sky.cloudDark) sky.cloudDark = mix(sky.cloudDark, N);
    sky.stars *= 1 - k; sky.sunVis = (sky.sunVis || 0) * (1 - k); sky.moonVis = (sky.moonVis || 0) * (1 - k);
    sky.shadowK = (sky.shadowK || 0) * (1 - k); sky.nightLit = 1; sky.wet = 0; sky.frost = 0; sky.mist = 0;
    sky.fog = [lerp(sky.fog[0], 4, k), lerp(sky.fog[1], 74, k)];
    void p;
  },

  // ------------------------------------------------------------- chaque image (dans la Zone)
  update(dt, eye) {
    const v = this.Z();
    if (!v || !farm.s) return;
    const S = this.S(), p = game.player;
    // dessous : la nuit, en fondu (un instant, au passage d'une trappe)
    const sous = this.dedans(p.pos) || this.dedans(eye);
    this.sous = sous;
    this.nuitK = clamp((this.nuitK || 0) + (sous ? 1 : -1) * dt * 2.5, 0, 1);
    // la flamme de la lanterne : éteinte, elle redevient étrangère
    if (!game.lantern || !farm.count('lanterne')) S.flamme = false;
    // la première fois dans la ville : son nom
    if (!S.arrivee && this.enVille(p.pos) && Math.hypot(p.pos[0] - v.site.x, p.pos[2] - v.site.z) < V5_PLAN.MUR - 2 && !game.sleeping && !cine.on) {
      S.arrivee = farm.s.day;
      this.arriver();
    }
    if (this.enVille(p.pos)) S.entre = (S.entre || 0) + dt;
    // les offices : à l'heure, la cloche ; en haut, près de la tonnellerie, on l'entend sous les dalles
    const h = this.heure();
    for (const O of V5_OFFICES) {
      const cle = farm.s.day + ':' + O.h;
      if (h >= O.h && h < O.h + 0.25 && this.officeFait !== cle && S.fin !== 'remontee' && S.fin !== 'extinction') {
        this.officeFait = cle;
        this.sonnerOffice(O);
      }
    }
    // l'aube : la barre glisse en bas (si l'on est près de la tonnellerie, ou dans la cave)
    if (!S.barre && h >= 5 && h < 5.3 && this.aubeFaite !== farm.s.day) {
      this.aubeFaite = farm.s.day;
      const T = v.tonnellerie, d = Math.hypot(p.pos[0] - T.x, p.pos[2] - T.z);
      if (d < 40) { sonV5.barre([v.cave2.x, v.cave2.y + 1, v.cave2.z]); if (d < 14 && !this.enCave(p.pos)) ui.subtitle('', V5_TEXTES.barreEntendue, 3.5); }
    }
    // un souffle d'air près des murs qui mentent (de très près, et rarement)
    this.souffleT = (this.souffleT || 0) - dt;
    if (this.souffleT <= 0) {
      this.souffleT = 0.6;
      for (const M of this.murs()) {
        if (M.ouvert || M.b.hidden) continue;
        const d = Math.hypot(M.x - p.pos[0], M.z - p.pos[2]);
        if (d < 3.2 && Math.abs(M.y - p.pos[1]) < 3 && Math.random() < 0.25) puffAt(M.x + (Math.random() - 0.5), M.y + 0.4 + Math.random() * 1.8, M.z + (Math.random() - 0.5), [70, 66, 60], 2, 0.3, false);
      }
    }
    // l'ambiance d'en bas
    if (sous) this.ambiance(dt, p);
  },
  murs() { const v = this.Z(), L = v ? v.murs : []; return typeof secretsV5 !== 'undefined' && secretsV5.murs ? L.concat(secretsV5.murs()) : L; },
  // les cloches d'un office : dans la ville, du clocher ; en haut, étouffées, sous la tonnellerie
  sonnerOffice(O) {
    const v = this.Z(), p = game.player.pos;
    if (!v) return;
    if (this.enVille(p) || this.auDegre(p) || this.enCave(p)) {
      const k = this.enVille(p) ? 0 : 0.6;
      sonV5.office([v.temple.clocher[0], v.F + v.voute.nef - 3, v.temple.clocher[1]], O.n, k);
    } else if (zone.dedans) {
      const T = v.tonnellerie, d = Math.hypot(p[0] - T.x, p[2] - T.z);
      if (d < 150) sonV5.office([T.x, T.y - 6, T.z], O.n, clamp(0.55 + d / 300, 0.55, 0.95));
    }
    if (typeof habitantsV5 !== 'undefined') habitantsV5.office(O);
  },
  ambiance(dt, p) {
    this.ambT = (this.ambT || 3) - dt;
    if (this.ambT > 0) return;
    this.ambT = 2.5 + Math.random() * 6;
    const a = Math.random() * TAU, d = 6 + Math.random() * 30, pos = [p.pos[0] + Math.cos(a) * d, p.pos[1] + 1 + Math.random() * 6, p.pos[2] + Math.sin(a) * d];
    const r = Math.random();
    if (r < 0.55) sonV5.goutte(pos);
    else if (r < 0.8) sonV5.os(pos);
    else if (this.enVille(p.pos) && this.S().fin !== 'extinction') sonV5.murmure(pos);
  },
  // la première arrivée : un plan sur la ville, son nom
  arriver() {
    const v = this.Z(), CF = v.CF, F = v.F;
    const [x0, z0] = v5Monde(CF, 0, V5_PLAN.MUR - 4), [x1, z1] = v5Monde(CF, 0, 40), [x2, z2] = v5Monde(CF, 10, V5_PLAN.MUR - 12);
    if (typeof cine === 'undefined' || !cine.jouer) { ui.subtitle('', V5_TEXTES.arrivee, 4); return; }
    cine.jouer([
      { dur: 5.5, de: { pos: [x0, F + 2.2, z0], look: [x1, F + 3, z1] }, a: { pos: [x2, F + 5.5, z2], look: [x1, F + 1, z1] }, texte: V5_TEXTES.arrivee },
    ], { passer: true }).catch(() => {});
  },

  // ------------------------------------------------------------- aller (fondu) à un point, regarder vers yaw
  async aller(pos, yaw, texte) {
    for (let k = 0; k < 60 && game.sleeping; k++) await new Promise((r) => setTimeout(r, 100));
    if (game.sleeping) return;
    game.sleeping = true;
    try {
      await ui.fade(true, texte || '', 600);
      const p = game.player;
      p.pos = pos.slice(); p.vel = [0, 0, 0];
      if (yaw !== undefined) p.yaw = yaw;
      p.pitch = 0;
      game.renderer.uploadCover(p.pos[0], p.pos[2]);
      await new Promise((r) => setTimeout(r, 250));
      await ui.fade(false, '', 600);
    } finally { game.sleeping = false; }
  },
  // le cap (yaw du joueur) pour regarder dans la direction (dx, dz) du monde
  cap(dx, dz) { return Math.atan2(-dx, -dz); },

  // ------------------------------------------------------------- les interactions
  lire(it) {
    const k = it.data.texte, S = this.S();
    const T = { enseigne: ['enseigneTitre', 'enseigne'], traits: ['traitsTitre', 'traits'], septieme: ['septiemeTitre', 'septieme'], lois: ['loisTitre', 'lois'], chambre_avant: ['chambreAvantTitre', 'chambreAvant'], premiers: ['premiersTitre', 'premiers'], necropole: ['necropoleTitre', 'necropole'] }[k];
    if (typeof secretsV5 !== 'undefined' && !T) return secretsV5.lire(it);
    if (!T) return;
    S.lus[k] = farm.s.day;
    sound.page && sound.page();
    ui.read(V5_TEXTES[T[0]], V5_TEXTES[T[1]]);
  },
  trappe() {
    const v = this.Z(), S = this.S(), T = v.tonnellerie;
    if (!S.trappe) {
      ui.choice('Sous les gravats', V5_TEXTES.trappeGravats, [
        { label: V5_TEXTES.trappeDegager, fn: async () => {
          ui.close();
          sonV5.gravats([T.x, T.y + 0.5, T.z]);
          if (typeof furtif !== 'undefined') furtif.bruit(T.x, T.y, T.z, 16, 'gravats');
          game.sleeping = true;
          await ui.fade(true, '', 700);
          if (typeof game.skipHours === 'function') game.skipHours(0.25);
          S.trappe = farm.s.day;
          if (v.refs.trappe) { v.refs.trappe.data = Object.assign({}, v.refs.trappe.data, { degagee: true }); farm.dirtyProps = true; }
          await new Promise((r) => setTimeout(r, 500));
          await ui.fade(false, '', 700);
          game.sleeping = false;
          ui.subtitle('', V5_TEXTES.trappeDegagee, 3.5);
          farm.save();
        } },
        { label: V5_TEXTES.laisser, fn: () => ui.close() },
      ]);
      return;
    }
    ui.choice('La trappe', V5_TEXTES.trappe, [
      { label: V5_TEXTES.trappeDescendre, fn: () => { ui.close(); this.descendre(); } },
      { label: V5_TEXTES.laisser, fn: () => ui.close() },
    ]);
  },
  async descendre() {
    const v = this.Z(), C = v.cave2;
    if (v.refs.trappe) { v.refs.trappe.data = Object.assign({}, v.refs.trappe.data, { degagee: true, ouverte: true }); farm.dirtyProps = true; }
    sound.door && sound.door(true);
    const [dx, dz] = [C.devant[0] - C.echelle[0], C.devant[1] - C.echelle[1]];
    await this.aller([C.echelle[0], C.y + 0.02, C.echelle[1]], this.cap(dx, dz), V5_TEXTES.descente);
  },
  async remonter() {
    const v = this.Z(), T = v.tonnellerie;
    const y = zone.Z.groundAt(T.sortie[0], T.sortie[1], T.y + 1.5, 1);
    await this.aller([T.sortie[0], y + 0.02, T.sortie[1]], this.cap(T.x - T.sortie[0], T.z - T.sortie[1]) + Math.PI, V5_TEXTES.remontee);
  },
  portette(it) {
    const v = this.Z(), S = this.S(), D = v.degre, C = v.cave2;
    if (it.data.dedans) {
      const opts = [];
      if (!S.barre) opts.push({ label: V5_TEXTES.portetteLever, fn: () => { ui.close(); S.barre = farm.s.day; sonV5.barre([C.x, C.y + 1, C.z]); this.ouvrirFoudre(); ui.subtitle('', V5_TEXTES.portetteLevee, 3); farm.save(); } });
      opts.push({ label: V5_TEXTES.portetteRepasser, fn: async () => { ui.close(); await this.aller([C.devant[0], C.y + 0.02, C.devant[1]], this.cap(C.devant[0] - C.x, C.devant[1] - C.z), V5_TEXTES.passage); } });
      opts.push({ label: V5_TEXTES.laisser, fn: () => ui.close() });
      ui.choice('La portette', V5_TEXTES.portetteDedans, opts);
      return;
    }
    const ouverte = !!S.barre, matin = this.matin();
    if (!ouverte && !matin) {
      if (typeof sonV1 !== 'undefined') sonV1.frappe([C.x, C.y + 1.2, C.z]);
      ui.subtitle('', V5_TEXTES.portetteFermee, 3);
      return;
    }
    if (!ouverte) this.ouvrirFoudre(true);
    ui.choice('Le foudre', ouverte ? V5_TEXTES.portetteOuverte : V5_TEXTES.portetteMatin, [
      { label: V5_TEXTES.portettePasser, fn: async () => {
        ui.close();
        const [hx, hz] = D.haut, [lx, lz] = v5Monde(v.CF, 0, D.paliers[0].z0);
        await this.aller([hx, D.yHaut + 0.02, hz], this.cap(lx - hx, lz - hz), V5_TEXTES.passage);
        S.passe = (S.passe || 0) + 1;
      } },
      { label: V5_TEXTES.laisser, fn: () => ui.close() },
    ]);
  },
  ouvrirFoudre(matinSeul) {
    const v = this.Z();
    if (!v || !v.refs.foudre) return;
    v.refs.foudre.data = Object.assign({}, v.refs.foudre.data, { ouverte: true, matin: !!matinSeul });
    farm.dirtyProps = true;
  },
  prendre(it) {
    const v = this.Z(), S = this.S(), id = it.data.item;
    if (!id || S.pris[id]) return;
    S.pris[id] = farm.s.day;
    farm.give(id, 1);
    play.flyer(id, [it.x, it.y, it.z], 1);
    sound.pop && sound.pop();
    const o = (v ? v.objets : []).concat(typeof secretsV5 !== 'undefined' ? secretsV5.objets() : []).find((q) => q.item === id);
    if (o && o.q) { o.q.data = Object.assign({}, o.q.data, { pris: true }); farm.dirtyProps = true; }
    if (typeof habitantsV5 !== 'undefined') habitantsV5.loi('vol', [it.x, it.y, it.z]);
    if (ITEMS[id] && ITEMS[id].v5lire && !S.lus[id]) setTimeout(() => this.lireObjet(id), 400);
  },
  fouiller(it) {
    const S = this.S(), id = it.id;
    if (S.fouilles[id]) { sound.click && sound.click(); ui.subtitle('', V5_TEXTES.nicheVide, 2.5); return; }
    ui.choice('Une niche', V5_TEXTES.niche, [
      { label: V5_TEXTES.nicheFouiller, fn: () => {
        ui.close();
        S.fouilles[id] = farm.s.day;
        const pos = [it.x, it.y + 0.2, it.z];
        let rien = true;
        for (const [k, n] of rollLoot(it.data.table || 'v5_maison')) {
          rien = false;
          if (k === 'argent') { farm.earn(n); sound.coin && sound.coin(); continue; }
          farm.give(k, n); play.flyer(k, pos, n);
        }
        sonV5.os(pos);
        if (typeof furtif !== 'undefined') furtif.bruit(it.x, it.y, it.z, 4, 'os');
        if (rien) ui.subtitle('', V5_TEXTES.nicheVide, 2.5);
        if (typeof habitantsV5 !== 'undefined') habitantsV5.loi('vol', pos);
      } },
      { label: V5_TEXTES.laisser, fn: () => ui.close() },
    ]);
  },
  feu(it) {
    const v = this.Z(), S = this.S();
    if (it.data.compte) {
      const eteint = S.fin === 'extinction';
      const opts = [];
      if (!eteint && farm.count('v5_cendre_froide') && typeof finsV5 !== 'undefined') opts.push({ label: V5_TEXTES.feuCendre, fn: () => { ui.close(); finsV5.extinction(); } });
      if (!eteint && farm.count('lanterne')) opts.push({ label: V5_TEXTES.feuLanterne, fn: () => { ui.close(); this.flammeCommune(); } });
      opts.push({ label: V5_TEXTES.laisser, fn: () => ui.close() });
      ui.choice('Le feu du compte', eteint ? V5_TEXTES.feuCompteEteint : V5_TEXTES.feuCompte, opts);
      return;
    }
    const eteint = S.fin === 'extinction';
    const opts = [];
    if (!eteint && farm.count('lanterne')) opts.push({ label: V5_TEXTES.feuLanterne, fn: () => { ui.close(); this.flammeCommune(); } });
    opts.push({ label: V5_TEXTES.laisser, fn: () => ui.close() });
    ui.choice('Un feu', eteint ? V5_TEXTES.feuEteint : V5_TEXTES.feu, opts);
    void v;
  },
  flammeCommune() {
    const S = this.S();
    game.lantern = true;
    S.flamme = true;
    sound.click && sound.click();
    ui.subtitle('', V5_TEXTES.feuLanterneFait, 3);
  },
  registre() {
    const S = this.S();
    const n = typeof habitantsV5 !== 'undefined' ? habitantsV5.compte() : 0;
    let t = V5_TEXTES.registre + '\n\n' + V5_TEXTES.registreCompte(n);
    if (S.compte) t += '\n\n' + V5_TEXTES.registreToi(S.compte);
    S.lus.registre = farm.s.day;
    sound.page && sound.page();
    const opts = [{ label: 'Refermer', fn: () => ui.close() }];
    if (typeof finsV5 !== 'undefined' && finsV5.peutPrendrePlume()) opts.unshift({ label: 'Prendre la plume', fn: () => { ui.close(); finsV5.compte(); } });
    ui.choice(V5_TEXTES.registreTitre, t, opts);
  },
  cloche() {
    const v = this.Z(), S = this.S();
    if (S.fin === 'remontee') { ui.choice(V5_TEXTES.clocheTitre, V5_TEXTES.clocheBattant, [{ label: V5_TEXTES.laisser, fn: () => ui.close() }]); return; }
    if (!S.battant) {
      const opts = [];
      if (farm.count('v5_battant')) opts.push({ label: V5_TEXTES.clocheRemettre, fn: () => {
        ui.close();
        farm.take('v5_battant', 1); S.battant = farm.s.day;
        if (v.refs.clocheJour) { v.refs.clocheJour.data = Object.assign({}, v.refs.clocheJour.data, { muette: false }); farm.dirtyProps = true; }
        sound.chain && sound.chain();
        ui.subtitle('', V5_TEXTES.clocheRemis, 3.5);
        if (typeof habitantsV5 !== 'undefined') habitantsV5.loi('bruit', v.temple.cloche);
        farm.save();
      } });
      opts.push({ label: V5_TEXTES.laisser, fn: () => ui.close() });
      ui.choice(V5_TEXTES.clocheTitre, V5_TEXTES.cloche, opts);
      return;
    }
    ui.choice(V5_TEXTES.clocheTitre, V5_TEXTES.clocheBattant, [
      { label: V5_TEXTES.clocheSonner, fn: () => { ui.close(); if (!this.matin()) { ui.subtitle('', V5_TEXTES.clochePasMatin, 3); return; } if (typeof finsV5 !== 'undefined') finsV5.remontee(); } },
      { label: V5_TEXTES.laisser, fn: () => ui.close() },
    ]);
  },
  puits() {
    const S = this.S();
    S.lus.puits = farm.s.day;
    const opts = [{ label: V5_TEXTES.puitsEcouter, fn: () => { ui.close(); setTimeout(() => sonV5.goutte([game.player.pos[0], game.player.pos[1] - 20, game.player.pos[2]]), 2200); ui.subtitle('', V5_TEXTES.puitsEcoute, 4.5); } }];
    if (typeof secretsV5 !== 'undefined' && secretsV5.puitsOptions) for (const o of secretsV5.puitsOptions()) opts.push(o);
    opts.push({ label: V5_TEXTES.laisser, fn: () => ui.close() });
    ui.choice(V5_TEXTES.puitsTitre, V5_TEXTES.puits, opts);
  },
  // un objet qu'on relit (lettres, livres) : en main, un clic
  lireObjet(id) {
    const L = V5_LECTURES[id];
    if (!L) return false;
    this.S().lus[id] = farm.s.day;
    sound.page && sound.page();
    ui.read(L.titre, L.texte);
    return true;
  },

  // ------------------------------------------------------------- les murs qui mentent : un coup les dissipe
  frapperMur(eye, f) {
    if (!zone.dedans) return false;
    const Z = zone.Z;
    let best = null;
    for (const M of this.murs()) {
      if (M.ouvert || M.b.hidden) continue;
      if (Math.hypot(M.x - eye[0], M.z - eye[2]) > 6) continue;
      const h = Z.raycastBlock(M.b, eye, f);
      if (h && h.t <= 2.8 && (!best || h.t < best.t)) best = { t: h.t, M };
    }
    if (!best) return false;
    // rien de plus proche (un autre bloc, le sol) entre l'œil et le mur ?
    const bh = Z.raycastBlocks(eye, f, best.t - 0.05);
    if (bh && !bh.block.hidden && bh.block !== best.M.b) return false;
    this.dissiper(best.M);
    return true;
  },
  dissiper(M) {
    const S = this.S(), Z = zone.Z;
    M.ouvert = true; M.b.hidden = true;
    S.murs[M.id] = farm.s.day;
    Z.blocksDirty = true; Z.grid = null; Z.coverDirty = true;
    sonV5.illusion([M.x, M.y + 1.2, M.z]);
    for (let k = 0; k < 26; k++) particles.spawn(M.x + (Math.random() - 0.5) * 1.6, M.y + Math.random() * 3, M.z + (Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 0.4, 0.2 + Math.random() * 0.4, (Math.random() - 0.5) * 0.4, [0.55, 0.52, 0.48, 0.7], 0.06, 1.2 + Math.random(), -0.1, false);
    ui.subtitle('', V5_TEXTES.murDissipe, 3);
    farm.save();
  },

  // ------------------------------------------------------------- pour les autres (contrat)
  places() { const v = this.Z(), L = v ? v.places.slice() : []; if (typeof secretsV5 !== 'undefined') for (const q of secretsV5.places()) L.push(q); return L; },
  abris() { const v = this.Z(), L = v ? v.abris.map((a) => ({ x: a.x, z: a.z, r: a.r, y0: a.y0, y1: a.y1 })) : []; if (typeof secretsV5 !== 'undefined') for (const q of secretsV5.abris()) L.push(q); return L; },
  aCouvert(p) { return this.dedans(p) || (typeof secretsV5 !== 'undefined' && secretsV5.aCouvert(p)); },
  entree() { const v = this.Z(); return v ? { x: v.tonnellerie.x, z: v.tonnellerie.z, y: v.tonnellerie.y } : null; },
  fin() { return this.S().fin || null; },
  compte() { return typeof habitantsV5 !== 'undefined' ? habitantsV5.compte() : 0; },
  habitants() { return typeof habitantsV5 !== 'undefined' ? habitantsV5.liste() : []; },
  // (essais) se poser quelque part : 'tonnellerie', 'cave', 'degre', 'porte', 'nef', 'temple', 'greffe', 'marche', 'ossuaire'
  allerA(ou) {
    const v = this.Z(), p = game.player;
    if (!v || !zone.dedans) return false;
    let pos, yaw = 0;
    const F = v.F;
    if (ou === 'tonnellerie') { const T = v.tonnellerie; pos = [T.sortie[0], zone.Z.groundAt(T.sortie[0], T.sortie[1], T.y + 1.5, 1) + 0.02, T.sortie[1]]; }
    else if (ou === 'cave') pos = [v.cave2.devant[0], v.cave2.y + 0.02, v.cave2.devant[1]];
    else if (ou === 'degre') pos = [v.degre.haut[0], v.degre.yHaut + 0.02, v.degre.haut[1]];
    else if (ou === 'porte') pos = [v.porte.dedans[0], F + 0.06, v.porte.dedans[1]];
    else if (ou === 'nef') { const [x, z] = v5Monde(v.CF, 0, 50); pos = [x, F + 0.06, z]; }
    else if (ou === 'temple') pos = [v.temple.dedans[0], F + 0.6, v.temple.dedans[1]];
    else if (ou === 'greffe') pos = [v.greffe.centre[0], F + 0.6, v.greffe.centre[1]];
    else if (ou === 'marche') pos = [v.marche.place[0], F + 0.06, v.marche.place[1]];
    else if (ou === 'ossuaire' && v.ossuaire) { const M = v.maisons.find((q) => q.id === v.ossuaire.maison); pos = [M.porte.dedans[0], F + 0.06, M.porte.dedans[1]]; }
    else return false;
    p.pos = pos; p.vel = [0, 0, 0]; p.yaw = yaw;
    game.renderer.uploadCover(pos[0], pos[2]);
    return true;
  },
};
// l'API pour les autres agents (V2, V3, V4…)
zone.catacombes = {
  S: () => catacombesV5.S(),
  get plan() { return catacombesV5.Z(); },
  dedans: (p) => catacombesV5.dedans(p),
  aCouvert: (p) => catacombesV5.aCouvert(p),
  places: () => catacombesV5.places(),
  abris: () => catacombesV5.abris(),
  habitants: () => catacombesV5.habitants(),
  compte: () => catacombesV5.compte(),
  fin: () => catacombesV5.fin(),
  entree: () => catacombesV5.entree(),
  site: () => zone.site('catacombes'),
  aller: (ou) => catacombesV5.allerA(ou),
};

// ---------------------------------------------------------------- branchements
zone.sur('sky', (sky) => catacombesV5.ciel(sky));
// le feu de veille du Septième Degré est sous terre : qui s'y réveille (le feu qui garde, V1) s'y réveille vraiment,
// et non sur la roche au-dessus (V1 cherche le sol depuis le relief)
zone.sur('repos', (q) => {
  if (!q || !q.data || q.data.id !== 'feu_degre') return;
  const v = catacombesV5.Z(), p = game.player;
  if (!v || (Math.hypot(p.pos[0] - q.x, p.pos[2] - q.z) < 6 && Math.abs(p.pos[1] - q.y) < 2.5)) return;
  const D = v.degre;
  p.pos = [D.haut[0], D.yHaut + 0.02, D.haut[1]]; p.vel = [0, 0, 0];
  game.renderer.uploadCover(p.pos[0], p.pos[2]);
});
zone.sur('update', (dt, eye) => { if (farm.s && game.mode !== 'menu') catacombesV5.update(dt, eye); });
HOOKS.inter.v5_lire = (it) => catacombesV5.lire(it);
HOOKS.inter.v5_trappe = () => catacombesV5.trappe();
HOOKS.inter.v5_remonter = () => catacombesV5.remonter();
HOOKS.inter.v5_portette = (it) => catacombesV5.portette(it);
HOOKS.inter.v5_prendre = (it) => catacombesV5.prendre(it);
HOOKS.inter.v5_fouiller = (it) => catacombesV5.fouiller(it);
HOOKS.inter.v5_feu = (it) => catacombesV5.feu(it);
HOOKS.inter.v5_registre = () => catacombesV5.registre();
HOOKS.inter.v5_cloche = () => catacombesV5.cloche();
HOOKS.inter.v5_puits = () => catacombesV5.puits();
for (const k of ['v5_lire', 'v5_trappe', 'v5_remonter', 'v5_portette', 'v5_fouiller', 'v5_feu', 'v5_registre', 'v5_cloche', 'v5_puits']) HOOKS.interVis[k] = () => zone.dedans;
HOOKS.interVis.v5_prendre = (it) => zone.dedans && !catacombesV5.S().pris[it.data.item];
// lire en main (lettres, livres) : un clic
HOOKS.primary.push((eye, basis, held, it, id) => { if (held || !it || !it.v5lire) return false; return catacombesV5.lireObjet(id); });
// les murs qui mentent : un coup (le coup d'outil ou de poing se résout ici, avant le reste)
{
  const _rh = play.resolveHit.bind(play);
  play.resolveHit = function () {
    const h = this.pendingHit;
    if (h && zone.dedans) { try { if (catacombesV5.frapperMur(h.eye, h.f)) { this.pendingHit = null; return; } } catch (e) { console.error(e); } }
    return _rh();
  };
}
// le vent de la Zone se tait sous terre ; l'ambiance d'en bas prend sa place
if (typeof sonV1 !== 'undefined') {
  const _amb = sonV1.ambiance.bind(sonV1);
  sonV1.ambiance = function (dt, E) { if (catacombesV5.sous) return; return _amb(dt, E); };
}
