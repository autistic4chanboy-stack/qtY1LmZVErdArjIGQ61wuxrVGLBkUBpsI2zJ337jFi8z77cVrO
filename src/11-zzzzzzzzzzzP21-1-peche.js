// ============================================================================
//  LA PÊCHE À QTE (agent P21, vingt et unième vague) — 1. LE JEU
//  Quatre temps, une canne en main :
//  1. LE LANCER : on maintient le clic, la jauge monte (et redescend : on dose),
//     on relâche ; le bouchon part en l'air et tombe là où l'on vise, à la
//     distance dosée, avec des ronds dans l'eau.
//  2. L'ATTENTE : le bouchon dandine ; de petites touches le font frémir (des
//     leurres) ; la vraie touche s'annonce (il s'enfonce une fois) puis il plonge,
//     avec son bruit et ses ronds.
//  3. FERRER : une fenêtre courte après la plongée. Trop tôt (sur un frémissement,
//     sur l'annonce), le poisson part ; trop tard aussi.
//  4. LE COMBAT : on mouline (clic maintenu) sans casser la ligne ; le poisson
//     tire, file, change de côté, plonge, saute ; à chaque coup, une invite (la
//     touche affichée) ; son endurance fond ; à la fin, l'épuisette pour les gros.
//     Le moteur : p21Moteur (11-zzzzzzzzzzzP21-0-donnees.js).
//  Puis LA PRISE MONTRÉE : en main, en gros plan, avec sa taille et son poids,
//  « Record ! » quand c'est le plus gros. play.catchFish(F) reste la fonction qui
//  choisit et donne la prise (ses emballages marchent) : on l'appelle une fois, au
//  bout du combat, avec les deux tirages faits au ferrage (F.u).
//  Et : les appâts (clic droit), les cannes (la tenue), les coins à poissons
//  (gobages, ronds : ça mord plus vite), le concours du Pêchedi au poids, la
//  pêche sous la glace, les sons (moulinet, ligne qui grince, casse), le poisson
//  qui saute, le carnet (12-zzzzzzzzzzzP21-hud.js).
//  Aide à la pêche (Options › Jeu) : Complète / Simplifiée / Automatique.
//  Clavier (clic, Espace, flèches ou ZQSD), souris (glisser la souris dans le
//  sens de l'invite), manette (A ou RT, la croix ou le stick, B, X).
//  État : farm.s.p21 = { v, appat, esp: { id: { n, kg, cm, j, h, lieu } }, pertes, vu }.
// ============================================================================

const P21_DIRS = { ArrowLeft: 'g', KeyA: 'g', ArrowRight: 'd', KeyD: 'd', ArrowUp: 'h', KeyW: 'h', ArrowDown: 'b', KeyS: 'b' };
const P21_BLOQUE = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyC']);

const p21 = {
  F: null,            // la ligne à l'eau (= play.fish) ; ses données à moi : F.p21
  et: null,           // 'charge' | 'vol' | 'attente' | 'touche' | 'combat' | 'prise' | 'sol' | null
  C: null,            // le moteur du combat
  prise: null,        // la prise montrée { id, kg, cm, record, nouvelle, t }
  charge: 0, sens: 1, // la jauge du lancer
  msg: null,          // le message court du HUD { txt, t, k }
  tenu: false, avant: false, dirs: [], pad: null, padAvant: {}, yaw0: 0, pitch0: 0,
  anneaux: [], sauts: [], coins: { cle: '', L: [], t: 0, proches: [] },
  sonT: 0, grinceT: 0, t: 0, bend: 0, secousse: 0, coolT: 0, demande: false,

  // ------------------------------------------------------------- réglages, état
  aide() { const v = typeof settings !== 'undefined' && settings.pecheAide; return v === 'simplifiee' || v === 'auto' ? v : 'complete'; },
  reglerAide(v) {
    if (typeof settings === 'undefined') return;
    settings.pecheAide = v === 'simplifiee' || v === 'auto' ? v : 'complete';
    try { store.set('prairie.settings', settings); } catch (e) { /* rien */ }
  },
  S() {
    const s = typeof farm !== 'undefined' && farm.s;
    if (!s) return { v: 1, appat: null, esp: {}, pertes: {}, vu: {} };
    let P = s.p21;
    if (!P || typeof P !== 'object') P = s.p21 = { v: 1 };
    for (const k of ['esp', 'pertes', 'vu']) if (!P[k] || typeof P[k] !== 'object') P[k] = {};
    if (P.appat !== null && typeof P.appat !== 'string') P.appat = null;
    P.v = 1;
    return P;
  },
  journal() { return this.S().esp; },
  mesure(id, rnd) { return p21Tirage.mesure(id, rnd); },
  actif() { return !!this.et; },
  etat() { return this.et === 'sol' ? 'vol' : this.et; },
  canne() { const id = farm.s && farm.s.hand, it = ITEMS[id]; return id === 'canne' || (it && it.tool === 'canne') ? id : null; },
  meilleureCanne() {
    for (const id of ['canne_dame', 'canne_fer', 'canne']) if (farm.count(id) > 0 && ITEMS[id] && ITEMS[id].tool === 'canne') return id;
    for (const id in farm.s.inv) if (farm.s.inv[id] > 0 && ITEMS[id] && ITEMS[id].tool === 'canne') return id;
    return null;
  },
  dire(txt, k, dur) { this.msg = { txt, t: 0, k: k || '', dur: dur || 1.6 }; },
  // l'appât choisi, s'il en reste
  appat() { const a = this.S().appat; return a && P21_APPATS[a] && farm.count(a) > 0 ? a : null; },
  changerAppat() {
    const S = this.S(), L = [null].concat(P21_APPATS_ORDRE.filter((id) => ITEMS[id] && farm.count(id) > 0));
    const i = L.indexOf(S.appat && farm.count(S.appat) > 0 ? S.appat : null);
    S.appat = L[(i + 1) % L.length];
    sound.click && sound.click();
    this.dire(S.appat ? P21_TEXTES.appat(itemName(S.appat).toLowerCase(), farm.count(S.appat)) : P21_TEXTES.sansAppat, 'appat', 2);
  },
  // ce que voit play.catchFish : l'eau, l'heure, la lune, la pluie, l'appât, la canne de la Dame
  contexte(F) {
    const h = game.world.time * 24;
    return {
      zone: F.zone, nuit: h < 5.5 || h > 20.5, lune: !!(strange.redNight() || (farm.s.day % 7 === 0)),
      pluie: !!(game.sky && game.sky.wet > 0.3), appat: this.appat(), dame: farm.s.hand === 'canne_dame',
    };
  },
  lieu(zone) { return (typeof EAUX !== 'undefined' && EAUX[zone]) || zone || ''; },

  // ------------------------------------------------------------- les entrées (souris, clavier, manette)
  // appelée à chaque image : le bouton « principal » (clic, Espace pendant la pêche, A ou RT) et les directions
  lire(dt) {
    const pad = this.manette();
    const souris = !!(input.locked && (input.buttons & 1));
    const espace = this.et && this.et !== 'charge' && input.keys.has('Space');
    const tenu = souris || espace || !!(pad && (pad.A > 0.5 || pad.RT > 0.4));
    const appui = tenu && !this.avant;
    const lache = !tenu && this.avant;
    this.avant = tenu;
    // les directions : clavier (file d'appuis), croix et stick (fronts), souris (un geste net)
    let dir = this.dirs.shift() || null;
    // (l'épuisette : un appui, d'où qu'il vienne, même en tenant déjà le moulinet)
    let frappe = appui || !!(input.locked && (input.clicked & 1));
    if (pad) {
      const P = this.padAvant;
      if (pad.A > 0.5 && !P.A) frappe = true;
      P.A = pad.A > 0.5;
      for (const [b, d] of [['gauche', 'g'], ['droite', 'd'], ['haut', 'h'], ['bas', 'b']]) { const v = pad[b] > 0.5; if (v && !P[b] && !dir) dir = d; P[b] = v; }
      if (pad.X > 0.5 && !P.X && !this.F && !this.et) this.changerAppat();
      P.X = pad.X > 0.5;
      if (pad.B > 0.5 && !P.B && (this.et === 'attente' || this.et === 'touche')) this.rentrer();
      P.B = pad.B > 0.5;
    }
    if (!dir && this.inviteEnCours()) {
      const p = game.player, dy = p.yaw - this.yaw0, dp = p.pitch - this.pitch0;
      if (Math.abs(dy) > 0.13 && Math.abs(dy) > Math.abs(dp)) dir = dy > 0 ? 'g' : 'd';
      else if (Math.abs(dp) > 0.11) dir = dp > 0 ? 'h' : 'b';
      if (dir) { this.yaw0 = p.yaw; this.pitch0 = p.pitch; }
    }
    if (this.C && this.C.epuisette && frappe) dir = 'e';
    return { tenu, appui, lache, dir };
  },
  inviteEnCours() { return !!(this.C && (this.C.invite || this.C.epuisette)); },
  manette() {
    try {
      if (typeof m21 !== 'undefined' && m21.manette && m21.manette.etat) {
        const E = m21.manette.etat();
        if (!E) return null;
        const B = E.boutons || {}, g = E.gauche || [0, 0];
        return { A: +B.A || 0, B: +B.B || 0, X: +B.X || 0, RT: +B.RT || 0, gauche: Math.max(+B.gauche || 0, -g[0]), droite: Math.max(+B.droite || 0, g[0]), haut: Math.max(+B.haut || 0, -g[1]), bas: Math.max(+B.bas || 0, g[1]) };
      }
      const L = navigator.getGamepads ? navigator.getGamepads() : null;
      const G = L && Array.from(L).find((q) => q && q.connected);
      if (!G) return null;
      const b = (i) => (G.buttons[i] ? G.buttons[i].value || (G.buttons[i].pressed ? 1 : 0) : 0), ax = G.axes || [];
      return { A: b(0), B: b(1), X: b(2), RT: b(7), gauche: Math.max(b(14), -(ax[0] || 0)), droite: Math.max(b(15), ax[0] || 0), haut: Math.max(b(12), -(ax[1] || 0)), bas: Math.max(b(13), ax[1] || 0) };
    } catch (e) { return null; }
  },
  vibrer(ms, fort) { try { if (typeof m21 !== 'undefined' && m21.manette && m21.manette.vibrer && m21.manette.active && m21.manette.active()) m21.manette.vibrer(ms, fort); } catch (e) { /* rien */ } },
  bloque(code) {
    if (!P21_BLOQUE.has(code)) return false;
    if (game.player && game.player.swimming) return false; // (à la nage, on garde ses jambes et ses bras)
    if (this.et === 'combat' || this.et === 'touche') return true;
    return code === 'Space' && (this.et === 'attente' || this.et === 'prise');
  },

  // ------------------------------------------------------------- 1. le lancer
  commencer() {
    if (this.F || this.coolT > 0) return;
    if (this.aide() === 'auto') { this.lancer(null); return; }
    this.et = 'charge'; this.charge = 0; this.sens = 1;
    sound.bowDraw && sound.bowDraw();
    const S = this.S();
    if (!S.vu.aide1) { S.vu.aide1 = farm.s.day; ui.subtitle('', P21_TEXTES.aide1, 5); }
  },
  // k : la jauge (0..1) ; null : la visée seule (aide automatique)
  lancer(k) {
    const p = game.player, eye = p.eyePos(), b = cameraBasis(p.yaw, p.pitch), R = P21_REGL.lancer;
    let dir = b.f;
    const d = k === null ? null : R.min + (R.max - R.min) * k;
    if (d !== null) {
      // le point visé, à la distance dosée, droit devant ; la ligne descend vers le fond, sous ce point
      const fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw);
      const x = eye[0] + fx * d, z = eye[2] + fz * d;
      const y = (typeof souterrain !== 'undefined' && souterrain.avecMonde) ? souterrain.avecMonde(() => game.world.heightAt(x, z)) : game.world.heightAt(x, z);
      const v = [x - eye[0], Math.min(y, eye[1] - 0.5) - eye[1], z - eye[2]], L = Math.hypot(...v) || 1;
      dir = [v[0] / L, v[1] / L, v[2] / L];
    }
    play.fish = null;
    play.fishClick(eye, dir);
    const F = play.fish;
    this.et = null;
    if (!F) return;
    sound.p21Fouet && sound.p21Fouet();
    const dist = Math.hypot(F.x - eye[0], F.z - eye[2]);
    const tip = this.bout(eye, b);
    F.p21 = { vol: P21_REGL.vol[0] + (P21_REGL.vol[1] - P21_REGL.vol[0]) * Math.min(1, dist / 18), volT: 0, de: tip, dist, leurres: [], fr: 0, an: 0, bobT: Math.random() * 9, glace: false };
    this.F = F;
    if (F.state === 'ground') { this.et = 'sol'; F.p21.vol *= 0.8; return; }
    this.et = 'vol';
    this.armer(F, true);
  },
  // le bout de la canne, dans le monde (à peu près : devant, à droite, en haut)
  bout(eye, b) { return [eye[0] + b.f[0] * 0.9 + b.r[0] * 0.38, eye[1] + 0.25, eye[2] + b.f[2] * 0.9 + b.r[2] * 0.38]; },
  // l'attente jusqu'à la vraie touche, et les frémissements d'ici là
  armer(F, premier) {
    const R = P21_REGL, it = ITEMS[farm.s.hand] || {}, fast = it.fast || 1, Q = F.p21;
    Q.coin = premier ? this.dansCoin(F.x, F.z) : Q.coin;
    const base = premier ? (R.attente[0] + Math.random() * R.attente[1]) * fast * (Q.coin ? R.coin : 1) * (this.appat() ? R.appat : 1)
      : R.reprise[0] + Math.random() * (R.reprise[1] - R.reprise[0]);
    F.state = 'wait'; F.t = base; F.bob = 0;
    const n = R.leurres[0] + Math.floor(Math.random() * (R.leurres[1] - R.leurres[0] + 1)) + (Q.coin ? 1 : 0);
    Q.leurres = [];
    for (let i = 0; i < n; i++) { const t = 1.3 + Math.random() * Math.max(0, base - 1.8); if (t < base - 0.2) Q.leurres.push(t); }
    Q.leurres.sort((a, b) => b - a);
    Q.fr = 0; Q.an = 0;
  },
  dansCoin(x, z) { return this.coins.L.some((c) => Math.hypot(c.x - x, c.z - z) < c.r); },
  // on relève la ligne (sans rien)
  rentrer() {
    if (!this.F) return;
    sound.reel && sound.reel(0.6);
    this.fin();
  },
  fin() {
    if (play.fish === this.F) play.fish = null;
    this.F = null; this.C = null; this.et = null; this.coolT = 0.35;
  },

  // ------------------------------------------------------------- 2. l'attente ; 3. le ferrage
  attendre(dt, E) {
    const F = this.F, Q = F.p21, R = P21_REGL;
    // un clic pendant l'attente : sur un frémissement ou l'annonce, c'est trop tôt ; sinon, on relève la ligne
    if (E.appui) {
      if (Q.fr > 0 || Q.an > 0) { this.rate('tot'); return; }
      this.rentrer(); return;
    }
    F.t -= dt;
    Q.fr = Math.max(0, Q.fr - dt); Q.an = Math.max(0, Q.an - dt);
    while (Q.leurres.length && F.t <= Q.leurres[0]) {
      Q.leurres.shift(); Q.fr = 0.55;
      this.anneau(F.x, F.y, F.z, 0.08, 0.5, 0.9);
      sound.ici([F.x, F.y, F.z], () => sound.p21Frisson && sound.p21Frisson());
    }
    if (F.t <= R.annonce && !Q.annonce) { Q.annonce = true; Q.an = R.annonce + 0.1; this.anneau(F.x, F.y, F.z, 0.1, 0.7, 1.1); }
    if (F.t <= 0) {
      Q.annonce = false;
      this.et = 'touche'; F.state = 'bite'; Q.fen = R.fenetre[this.aide()] || R.fenetre.complete; Q.fenT = 0;
      splashAt(F.x, F.y, F.z);
      this.anneau(F.x, F.y, F.z, 0.15, 1.6, 1.4); this.anneau(F.x, F.y, F.z, 0.05, 1.1, 1.6);
      sound.ici([F.x, F.y, F.z], () => { sound.bite && sound.bite(); sound.p21Plonge && sound.p21Plonge(); });
      this.vibrer(120, 0.5);
      this.bend = Math.max(this.bend, 0.45);
    }
  },
  toucher(dt, E) {
    const F = this.F, Q = F.p21;
    if (E.appui) { this.ferrer(); return; }
    Q.fenT += dt;
    if (Q.fenT >= Q.fen) this.rate('tard');
  },
  rate(k) {
    const F = this.F, S = this.S(), aide = this.aide();
    S.pertes[k] = (S.pertes[k] || 0) + 1;
    let txt = P21_TEXTES[k];
    if (k === 'tard' && aide === 'complete' && this.appat() && Math.random() < P21_REGL.tardAppat) { farm.take(this.appat(), 1); txt = P21_TEXTES.tardAppat; }
    this.dire(txt, 'rate');
    sound.p21Rate && sound.p21Rate();
    this.et = 'attente';
    this.armer(F, false);
    if (!S.vu.aide2) { S.vu.aide2 = farm.s.day; ui.subtitle('', P21_TEXTES.aide2, 5); }
  },
  // ferré : on sait ce qu'on va remonter (le poisson échappé revient d'abord) ; le combat commence
  ferrer() {
    const F = this.F, Q = F.p21, S = this.S(), o = this.contexte(F);
    let u0 = Math.random();
    const u1 = Math.random();
    const Rv = S.revenant;
    if (Rv && Rv.zone === F.zone && Rv.j === farm.s.day && u1 >= 0.075) {
      const v = p21Tirage.viser(o, Rv.id);
      if (v !== null) u0 = v;
    }
    if (Rv && (Rv.j !== farm.s.day || u1 >= 0.075)) S.revenant = null;
    const id = p21Tirage.predire(o, u0, u1) || 'gardon';
    const mes = p21Tirage.mesure(id);
    const p = game.player;
    const dx = F.x - p.pos[0], dz = F.z - p.pos[2], D = Q.glace ? 8 + Math.random() * 6 : Math.max(2.5, Math.hypot(dx, dz) - 0.8);
    F.u = [u0, u1];
    Q.id = id; Q.mes = mes; Q.o = o;
    Q.axe = Q.glace ? [0, 0] : [dx / (Math.hypot(dx, dz) || 1), dz / (Math.hypot(dx, dz) || 1)];
    Q.x0 = p.pos[0]; Q.z0 = p.pos[2]; Q.wy = F.y;
    this.C = p21Moteur.creer({ id, kg: mes.kg, s: mes.s, aide: this.aide(), canne: farm.s.hand, D });
    this.et = 'combat'; F.state = 'fight';
    this.yaw0 = p.yaw; this.pitch0 = p.pitch;
    sound.p21Ferre && sound.p21Ferre();
    this.vibrer(160, 0.8);
    this.bend = 0.8;
  },

  // ------------------------------------------------------------- 4. le combat
  combattre(dt, E) {
    const C = this.C, F = this.F, Q = F.p21;
    p21Moteur.pas(C, dt, { mouline: E.tenu && !C.epuisette, dir: E.dir });
    for (const ev of C.evts) this.evenement(ev);
    C.evts.length = 0;
    // le poisson, dans le monde : la bouée suit
    const pos = this.posPoisson();
    F.x = pos[0]; F.z = pos[2];
    // les sons : le cliquet du moulinet, la ligne qui grince
    this.sonT -= dt;
    if (E.tenu && !C.epuisette && this.sonT <= 0) { this.sonT = 0.11; sound.p21Moulinet && sound.p21Moulinet(Math.max(0.25, 1 - C.T * 0.6)); }
    this.grinceT -= dt;
    if (C.T > 0.7 && this.grinceT <= 0) { this.grinceT = C.T >= 1 ? 0.12 : 0.3 - (C.T - 0.7); sound.p21Grince && sound.p21Grince(C.T); if (C.T >= 1) this.vibrer(60, 0.4); }
    this.bend += (Math.min(1.1, C.T) - this.bend) * Math.min(1, dt * 10);
    // l'épuisette : on baisse les yeux vers le poisson, à la surface
    if (C.epuisette && !Q.glace) { const p = game.player, e = p.eyePos(), want = Math.atan2(Q.wy - e[1], Math.max(0.6, Math.hypot(pos[0] - e[0], pos[2] - e[2]))); p.pitch += (Math.max(-1.2, want - 0.15) - p.pitch) * Math.min(1, dt * 3); }
    // les éclaboussures : le poisson se débat en surface quand il est près, ou épuisé
    if (C.coup.k === 'secoue' && Math.random() < dt * 6 && C.prof < 0.9) { this.anneau(pos[0], Q.wy, pos[2], 0.1, 0.8, 0.8); if (Math.random() < 0.4) this.eclabousse(pos[0], Q.wy, pos[2], 6); }
    if (C.fin) this.conclure(C.fin);
  },
  posPoisson() {
    const C = this.C, F = this.F, Q = F.p21;
    if (Q.glace) return [Q.it.x, Q.wy - Math.min(6, C.D * 0.5), Q.it.z];
    const D = C.D, lat = C.side * Math.min(5, D * 0.45), ax = Q.axe;
    let y = Q.wy - C.prof * 0.6;
    if (C.saut > 0) { const k = 1 - C.saut / (C.sautMax || 0.8); y = Q.wy + Math.sin(k * Math.PI) * (0.6 + 0.4 * Math.min(1, C.kg / 4)); }
    return [Q.x0 + ax[0] * D - ax[1] * lat, y, Q.z0 + ax[1] * D + ax[0] * lat];
  },
  evenement(ev) {
    const C = this.C, F = this.F, T = P21_TEXTES;
    if (ev.e === 'coup') { if (T.coups[ev.k] && ev.k !== 'nage') this.dire(T.coups[ev.k], 'coup', 1.4); if (ev.k === 'file') this.vibrer(200, 0.35); }
    else if (ev.e === 'saut') { const p = this.posPoisson(); this.eclabousse(p[0], F.p21.wy, p[2], 18); sound.ici([p[0], F.p21.wy, p[2]], () => sound.splash && sound.splash()); this.sauts.push({ t: 0 }); }
    else if (ev.e === 'replonge') { const p = this.posPoisson(); this.eclabousse(p[0], F.p21.wy, p[2], 22); this.anneau(p[0], F.p21.wy, p[2], 0.2, 1.8, 1.4); sound.ici([p[0], F.p21.wy, p[2]], () => sound.splash && sound.splash()); }
    else if (ev.e === 'invite') { this.yaw0 = game.player.yaw; this.pitch0 = game.player.pitch; sound.p21Invite && sound.p21Invite(); this.vibrer(70, 0.3); }
    else if (ev.e === 'ok') { sound.p21Ok && sound.p21Ok(); }
    else if (ev.e === 'rate') { sound.p21Rate && sound.p21Rate(); this.vibrer(180, 0.7); this.secousse = 0.35; }
    else if (ev.e === 'epuise') { this.dire(T.coups.epuise, 'coup', 1.6); }
    else if (ev.e === 'epuisette' && ev.ok) { const p = this.posPoisson(); this.eclabousse(p[0], F.p21.wy, p[2], 10); }
  },
  // la fin du combat
  conclure(fin) {
    const F = this.F, Q = F.p21, S = this.S();
    if (fin === 'prise') { this.prendre(); return; }
    S.pertes[fin] = (S.pertes[fin] || 0) + 1;
    // le poisson qui s'échappe reviendra mordre (même endroit, même jour)
    if (FISH[Q.id]) S.revenant = { id: Q.id, zone: F.zone, j: farm.s.day };
    const ap = this.appat();
    if ((fin === 'casse' || fin === 'loin') && ap) farm.take(ap, 1);
    if (fin === 'casse' || fin === 'loin') { sound.p21Casse && sound.p21Casse(); this.vibrer(260, 1); }
    else sound.reel && sound.reel(0.4);
    this.dire(fin === 'casse' ? (ap ? P21_TEXTES.casseAppat : P21_TEXTES.casse) : P21_TEXTES[fin] || P21_TEXTES.decroche, 'rate', 2.4);
    if (FISH[Q.id] && FISH[Q.id].w < 0.5 && Math.random() < 0.6) setTimeout(() => ui.subtitle('', P21_TEXTES.revenant, 3), 1800);
    this.fin();
  },
  // sorti de l'eau : play.catchFish choisit et donne (avec nos deux tirages), on regarde ce qui est venu
  prendre() {
    const F = this.F, Q = F.p21, S = this.S(), p = game.player;
    const ap = this.appat(), o = Q.o;
    const donne = [];
    const _give = farm.give;
    farm.give = function (id, n) { donne.push(id); return _give.apply(this, arguments); };
    // l'appât : les poids du tirage, le temps de l'appel (les rares ne bougent pas)
    const W = o && o.appat ? p21Tirage.poidsAppat(p21Tirage.candidats(o.zone, o.nuit, o.lune), o.appat) : null, W0 = {};
    if (W) for (const k in W) { W0[k] = FISH[k].w; FISH[k].w = W[k]; }
    // le concours : c'est le poids qui compte (on pèse nous-mêmes, plus bas)
    const A = typeof activites !== 'undefined' && activites.S ? activites.S() : null;
    const PC = A && A.peche && A.peche.j === farm.s.day && !A.peche.fini ? A.peche : null;
    if (PC) PC.fini = true;
    const vu0 = S.esp[Q.id] ? S.esp[Q.id].n : 0;
    if (Q.glace) { F.x = Q.it.x; F.z = Q.it.z; } else { F.x = p.pos[0] + Q.axe[0]; F.z = p.pos[2] + Q.axe[1]; }
    const vuSav = savoir.vu ? savoir.vu(Q.id) : 0;
    try { play.catchFish(F); } catch (e) { console.error('p21 : prise', e); } finally {
      farm.give = _give;
      for (const k in W0) FISH[k].w = W0[k];
      if (PC) PC.fini = false;
    }
    const id = donne.find((k) => FISH[k]) || donne[0] || null;
    this.F = null; this.C = null; play.fish = null;
    if (!id) { // décroché au dernier moment (une malédiction, une rune…) : il ne reviendra pas
      this.dire(P21_TEXTES.decroche, 'rate', 2.2); S.pertes.decroche = (S.pertes.decroche || 0) + 1; this.fin(); return;
    }
    if (ap) farm.take(ap, 1);
    if (S.revenant && S.revenant.id === id) S.revenant = null;
    const mes = id === Q.id ? Q.mes : p21Tirage.mesure(id);
    let record = false, nouvelle = false;
    if (FISH[id]) {
      const h = game.world.time * 24, E = S.esp[id] || (S.esp[id] = { n: 0, kg: 0, cm: 0 });
      nouvelle = !vu0 && E.n === 0 && !(id === Q.id && vuSav > 0);
      record = E.n > 0 && mes.kg > E.kg;
      E.n++;
      if (mes.kg > E.kg) Object.assign(E, { kg: mes.kg, cm: mes.cm, j: farm.s.day, h: Math.round(h * 10) / 10, lieu: F.zone });
      if (record && typeof menus !== 'undefined' && menus.marque) menus.marque('peche', 1);
      this.decouvrir(id, o);
      // le concours du Pêchedi : au poids
      if (PC && F.zone === 'lac' && npcs.hour() < 16 && mes.kg > (PC.bestKg || 0)) {
        PC.bestKg = mes.kg; PC.best = { id, prix: ITEMS[id].price || 0, kg: mes.kg };
        setTimeout(() => ui.subtitle('', P21_TEXTES.concoursPour(itemName(id).toLowerCase(), P21_TEXTES.kg(mes.kg)), 3), 1800);
      }
    }
    this.prise = { id, kg: mes.kg, cm: mes.cm, record, nouvelle, t: 0, poisson: !!FISH[id] };
    this.msg = null;
    this.et = 'prise';
    if (record) sound.p21Record && sound.p21Record();
    this.vibrer(90, 0.4);
    this.bend = 0;
  },
  // le carnet des découvertes (wiki du jeu) : ce qu'on vient d'apprendre de ce poisson
  decouvrir(id, o) {
    if (typeof decouvertes === 'undefined' || !decouvertes.voir) return;
    try {
      const pg = 'it:' + id;
      decouvertes.voir(pg, 'eaux'); decouvertes.voir(pg, 'heure'); decouvertes.voir(pg, 'combat');
      if (o && o.appat && P21_APPATS[o.appat] && P21_APPATS[o.appat].esp.includes(id)) decouvertes.voir(pg, 'appat');
      decouvertes.voir('sys:peche');
    } catch (e) { /* rien */ }
  },

  // ------------------------------------------------------------- la glace
  glace(it) {
    if (this.F && this.F.p21 && this.F.p21.glace) { this.rentrer(); return; }
    const c = this.meilleureCanne();
    if (!c) { ui.subtitle('', P21_TEXTES.glaceCanne, 2.5); return; }
    if (!this.canne()) play.select(c);
    if (this.F) this.fin();
    const F = { x: it.x, y: it.y - 0.42, z: it.z, zone: 'lac_gele', state: 'wait', t: 1, bob: 0 };
    F.p21 = { vol: 0.5, volT: 0, de: this.bout(game.player.eyePos(), cameraBasis(game.player.yaw, game.player.pitch)), dist: 2, leurres: [], fr: 0, an: 0, bobT: 0, glace: true, it };
    play.fish = F; this.F = F; this.et = 'vol';
    this.armer(F, true);
    sound.splash && sound.splash();
  },

  // ------------------------------------------------------------- chaque image
  maj(dt, eye, basis, sky, playing) {
    if (!farm.s) return;
    this.t += dt;
    this.coolT = Math.max(0, this.coolT - dt);
    this.secousse = Math.max(0, this.secousse - dt);
    if (this.msg) { this.msg.t += dt; if (this.msg.t > this.msg.dur) this.msg = null; }
    this.majAnneaux(dt);
    this.majCoins(dt);
    const canne = this.canne(), libre = playing && !(typeof cine !== 'undefined' && cine.on) && !game.dying && !game.sleeping;
    // une canne en main : la manette est lue à chaque image (M21) ; sinon, comme avant
    if (!!canne !== this.demande) {
      this.demande = !!canne;
      try { if (typeof m21 !== 'undefined' && m21.manette && m21.manette.demander) m21.manette.demander('peche', this.demande); } catch (e) { /* rien */ }
    }
    if (!canne) {
      if (this.et && this.et !== 'prise') { if (this.C && this.F) this.conclure('decroche'); else this.fin(); }
      if (this.et === 'prise') this.et = null;
      this.avant = false; this.dirs.length = 0;
      return;
    }
    // la ligne ôtée par ailleurs (la Zone, un monde à part…) : on oublie
    if (this.F && play.fish !== this.F && this.et !== 'prise') { this.F = null; this.C = null; this.et = null; }
    if (!libre) { this.avant = false; this.dirs.length = 0; return; } // (en pause : rien ne bouge)
    const E = this.lire(dt);
    const p = game.player;
    // trop loin de la ligne : elle se relève
    if (this.F && this.F.p21) {
      const Q = this.F.p21, lim = Q.glace ? 6 : 26, ox = Q.glace ? Q.it.x : this.F.x, oz = Q.glace ? Q.it.z : this.F.z;
      if (Math.hypot(ox - p.pos[0], oz - p.pos[2]) > lim + (this.C ? this.C.D : 0) * 0.2) { if (this.C) this.conclure('decroche'); else this.fin(); return; }
    }
    switch (this.et) {
      case null:
        if (E.appui && !ui.panel && play.cool <= 0) this.commencer();
        break;
      case 'charge': {
        const R = P21_REGL.lancer, aide = this.aide();
        this.charge += dt / R.charge * this.sens;
        if (this.charge >= 1) { this.charge = 1; if (aide === 'complete') this.sens = -1; }
        if (this.charge <= 0.12 && this.sens < 0) { this.charge = 0.12; this.sens = 1; }
        if (!E.tenu) this.lancer(Math.max(0, Math.min(1, this.charge)));
        break;
      }
      case 'vol': case 'sol': {
        const Q = this.F.p21;
        Q.volT += dt;
        if (Q.volT >= Q.vol) {
          if (this.et === 'sol') { puffAt(this.F.x, this.F.y, this.F.z, [110, 95, 70], 6, 1, false); this.dire(P21_TEXTES.sol, 'rate', 1.4); this.fin(); break; }
          this.et = 'attente';
          if (!Q.glace) { splashAt(this.F.x, this.F.y, this.F.z); this.anneau(this.F.x, this.F.y, this.F.z, 0.1, 1.4, 1.5); this.anneau(this.F.x, this.F.y, this.F.z, 0.05, 0.9, 1.8); }
          sound.ici([this.F.x, this.F.y, this.F.z], () => sound.p21Plouf && sound.p21Plouf());
        }
        break;
      }
      case 'attente': this.attendre(dt, E); break;
      case 'touche': this.toucher(dt, E); break;
      case 'combat': this.combattre(dt, E); break;
      case 'prise': {
        const P = this.prise;
        P.t += dt;
        if (P.t >= P21_REGL.prise || (P.t > 0.45 && E.appui)) { this.et = null; this.prise = null; this.coolT = 0.25; }
        break;
      }
    }
    if (this.et !== 'combat') this.bend += ((this.et === 'touche' ? 0.35 : 0) - this.bend) * Math.min(1, dt * 6);
    if (this.F && this.F.p21 && (this.et === 'attente' || this.et === 'touche')) this.F.p21.bobT += dt;
  },
  // la bouée : sa hauteur (dandine, frémit, s'annonce, plonge)
  bouee() {
    const F = this.F, Q = F && F.p21;
    if (!Q) return null;
    if (this.et === 'vol' || this.et === 'sol') {
      const k = Math.min(1, Q.volT / Q.vol), a = Q.de;
      const x = a[0] + (F.x - a[0]) * k, z = a[2] + (F.z - a[2]) * k, y = a[1] + (F.y - a[1]) * k + Math.sin(k * Math.PI) * (1.2 + Q.dist * 0.12);
      return { x, y, z, tilt: 0, sous: 0 };
    }
    const t = Q.bobT;
    let y = F.y + Math.sin(t * 2.1) * 0.012 + Math.sin(t * 3.4 + 1) * 0.006, tilt = Math.sin(t * 1.7) * 0.08, sous = 0;
    if (Q.fr > 0) { const k = Q.fr / 0.55; y -= Math.abs(Math.sin(t * 38)) * 0.03 * k; tilt += Math.sin(t * 31) * 0.3 * k; }
    if (Q.an > 0) { const k = Q.an / (P21_REGL.annonce + 0.1); y -= Math.sin(k * Math.PI) * 0.06; }
    if (this.et === 'touche') { sous = 1; y = F.y - 0.13; }
    if (this.et === 'combat') { sous = 0.6; y = F.y - 0.05 - (this.C ? Math.min(0.2, this.C.prof * 0.1) : 0); tilt = 0.5; }
    return { x: F.x, y, z: F.z, tilt, sous };
  },

  // ------------------------------------------------------------- les ronds et les éclaboussures
  anneau(x, y, z, r0, r1, life) { if (this.anneaux.length < 24) this.anneaux.push({ x, y: y + 0.015, z, r0, r1, t: 0, life }); },
  eclabousse(x, y, z, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU, s = 0.6 + Math.random() * 1.8;
      particles.spawn(x, y + 0.05, z, Math.cos(a) * s, 1.5 + Math.random() * 2.8, Math.sin(a) * s, [0.78, 0.87, 0.95, 0.9], 0.06 + Math.random() * 0.04, 0.5 + Math.random() * 0.4, 11, false);
    }
  },
  majAnneaux(dt) {
    const A = this.anneaux;
    for (let i = A.length - 1; i >= 0; i--) { A[i].t += dt; if (A[i].t >= A[i].life) A.splice(i, 1); }
    for (let i = this.sauts.length - 1; i >= 0; i--) { const s = this.sauts[i]; s.t += dt; if (s.t > (s.dur || 1)) this.sauts.splice(i, 1); }
  },

  // ------------------------------------------------------------- les coins à poissons (gobages, ronds)
  // tirés de la graine et du jour (rien n'est ajouté au monde) : dans chaque eau, un à trois coins, près d'une rive
  calculerCoins() {
    const w = game.world, s = farm.s;
    const cle = (s.seed | 0) + ':' + s.day + ':' + ((w.fishZones || []).length);
    if (this.coins.cle === cle) return;
    this.coins.cle = cle; this.coins.L = [];
    if (!w.fishZones || !w.heightAt) return;
    const vus = [];
    w.fishZones.forEach((Z, zi) => {
      if (!Z || !Number.isFinite(Z.x)) return;
      if (vus.some((v) => Math.hypot(v.x - Z.x, v.z - Z.z) < 40 && v.kind === Z.kind)) return; // (les petites mares du marais : un seul coin)
      vus.push(Z);
      const rnd = mulberry32(((s.seed | 0) ^ 0x5021 ^ (s.day * 977) ^ (zi * 7919)) >>> 0);
      const n = Z.r > 100 ? 3 : Z.r > 50 ? 2 : 1;
      for (let i = 0, essais = 0; i < n && essais < 40; essais++) {
        const a = rnd() * TAU, d = Math.sqrt(rnd()) * Z.r * 0.95, x = Z.x + Math.cos(a) * d, z = Z.z + Math.sin(a) * d;
        if (!(w.heightAt(x, z) < w.waterLevel - 0.8)) continue;
        // une rive à portée de lancer
        let rive = false;
        for (let k = 0; k < 8 && !rive; k++) { const b = k / 8 * TAU; for (const r of [9, 13, 16]) if (w.heightAt(x + Math.cos(b) * r, z + Math.sin(b) * r) > w.waterLevel + 0.1) { rive = true; break; } }
        if (!rive || this.coins.L.some((c) => Math.hypot(c.x - x, c.z - z) < 12)) continue;
        this.coins.L.push({ x, z, y: w.waterLevel, r: 4, kind: Z.kind, t: rnd() * 4 });
        i++;
      }
    });
  },
  majCoins(dt) {
    const w = game.world, p = game.player;
    if (!w || !p) return;
    const C = this.coins;
    C.t -= dt;
    if (C.t <= 0) {
      C.t = 1;
      const ailleurs = (typeof souterrain !== 'undefined' && souterrain.actif) || (typeof zone !== 'undefined' && zone.dedans) || (typeof mondes !== 'undefined' && mondes.aPart && mondes.aPart()) || p.underground;
      if (ailleurs) { C.proches = []; return; }
      try { this.calculerCoins(); } catch (e) { C.L = []; }
      C.proches = C.L.filter((c) => Math.hypot(c.x - p.pos[0], c.z - p.pos[2]) < 70);
    }
    for (const c of C.proches) {
      c.t -= dt;
      if (c.t > 0) continue;
      c.t = 2.5 + Math.random() * 4.5;
      const x = c.x + (Math.random() - 0.5) * 4, z = c.z + (Math.random() - 0.5) * 4;
      this.anneau(x, c.y, z, 0.05, 0.9 + Math.random() * 0.6, 1.6);
      if (Math.random() < 0.18) {
        this.sauts.push({ x, y: c.y, z, t: 0, dur: 0.55, a: Math.random() * TAU, col: [0.55, 0.6, 0.62], L: 0.22 });
        this.eclabousse(x, c.y, z, 5);
        if (Math.hypot(x - p.pos[0], z - p.pos[2]) < 40) sound.ici([x, c.y, z], () => sound.p21Gobage && sound.p21Gobage());
      }
    }
  },

  // ------------------------------------------------------------- le rendu (bouée, ronds, poisson qui saute)
  dessiner(buf, sbuf, cam, t) {
    const B = this.F && (this.et === 'vol' || this.et === 'sol' || this.et === 'attente' || this.et === 'touche' || this.et === 'combat') ? this.bouee() : null;
    if (!B && !this.anneaux.length && !this.sauts.length) return;
    PE.buf = buf;
    if (B) {
      // la bouée : liège rouge et blanc, une antenne noire, une quille (on n'en voit que le haut quand elle plonge)
      PE.frame(B.x, B.y, B.z, B.tilt, 1.9);
      const s = 1 - B.sous * 0.85;
      if (s > 0.2) {
        PE.box(0, 0.0, 0, 0.055, 0.05 * s, 0.055, [0.95, 0.94, 0.9], 0, 0, B.tilt);
        PE.box(0, 0.045 * s, 0, 0.065, 0.04 * s, 0.065, [0.86, 0.16, 0.09], 0, Math.PI / 4, B.tilt);
        PE.box(0, 0.075 * s, 0, 0.04, 0.03 * s, 0.04, [0.8, 0.12, 0.08], 0, 0, B.tilt);
      }
      PE.box(0, 0.09 + 0.05 * s, 0, 0.012, 0.11 * s + 0.02, 0.012, [0.12, 0.1, 0.08], 0, 0, B.tilt);
      // (la nuit, le bout de l'antenne, une plume blanche, se voit encore un peu)
      const nuit = game.sky ? game.sky.night || 0 : 0;
      if (nuit > 0.4) PE.fl = FX_EMIT;
      PE.box(0, 0.15 + 0.1 * s, 0, 0.018, 0.025, 0.018, nuit > 0.4 ? [0.55, 0.5, 0.4] : [1, 0.55, 0.1], 0, 0, B.tilt);
      PE.fl = 0;
    }
    // les ronds
    for (const A of this.anneaux) {
      if (Math.abs(A.x - cam[0]) > 90 || Math.abs(A.z - cam[2]) > 90) continue;
      const k = A.t / A.life, r = A.r0 + (A.r1 - A.r0) * Math.sqrt(k), e = 0.055 * (1 - k) + 0.015, n = r > 0.8 ? 18 : 12;
      const c = 0.5 + 0.28 * (1 - k);
      PE.frame(A.x, A.y, A.z, 0, 1);
      for (let i = 0; i < n; i++) { const a = i / n * TAU; PE.box(Math.cos(a) * r, 0, Math.sin(a) * r, e, 0.012, r * TAU / n * 0.92, [c, c + 0.08, c + 0.12], 0, -a); }
    }
    // le poisson épuisé, le dos hors de l'eau, près du bord
    const C = this.C;
    if (C && this.F && this.F.p21 && !this.F.p21.glace && C.saut <= 0 && (C.epuisette || (C.E <= 0.05 && C.D < 5)) && FISH[C.id]) {
      const p = this.posPoisson(), Q = this.F.p21;
      PE.frame(p[0], Q.wy - 0.06, p[2], Math.atan2(-Q.axe[0], -Q.axe[1]) + Math.sin(t * 3) * 0.15, 1);
      this.poisson3d(Math.min(1.7, 0.25 + (C.kg ** 0.33) * 0.4), this.couleur(C.id), Math.sin(t * 5) * 0.12);
    }
    // le poisson qui saute (au bout de la ligne, ou un gobage)
    for (const S of this.sauts) {
      let x, y, z, a, L, col;
      if (S.x !== undefined) { const k = S.t / S.dur; x = S.x; z = S.z; y = S.y - 0.05 + Math.sin(k * Math.PI) * 0.35; a = S.a; L = S.L; col = S.col; }
      else {
        if (!this.C || !this.F || this.C.saut <= 0) continue; // (le poisson épuisé : plus bas)
        const p = this.posPoisson(), Q = this.F.p21;
        x = p[0]; y = p[1]; z = p[2]; a = Math.atan2(-Q.axe[0], -Q.axe[1]); L = Math.min(1.7, 0.25 + (this.C.kg ** 0.33) * 0.4); // (de profil)
        col = this.couleur(Q.id);
      }
      const k2 = S.dur ? S.t / S.dur : 1 - this.C.saut / (this.C.sautMax || 0.8);
      PE.frame(x, y, z, a, 1);
      this.poisson3d(L, col, (k2 - 0.5) * 1.6);
    }
  },
  couleur(id) { const h = (FISH[id] && FISH[id].col) || '#7a8a80'; try { return rgbf(h); } catch (e) { return [0.5, 0.55, 0.5]; } },
  // un poisson en boîtes (corps, ventre clair, queue, dorsale), long de L m, cambré de « arc »
  poisson3d(L, col, arc) {
    const h = L * 0.24, w = L * 0.14, ventre = [Math.min(1, col[0] * 0.6 + 0.4), Math.min(1, col[1] * 0.6 + 0.4), Math.min(1, col[2] * 0.6 + 0.38)];
    PE.box(0, 0, 0, L * 0.62, h, w, col, 0, 0, arc * 0.6);
    PE.box(0, -h * 0.25, 0, L * 0.5, h * 0.5, w * 0.92, ventre, 0, 0, arc * 0.6);
    PE.box(L * 0.4, Math.sin(arc * 0.6) * L * 0.18, 0, L * 0.2, h * 0.7, w * 0.6, col, 0, 0, arc);
    PE.box(L * 0.55, Math.sin(arc * 0.6) * L * 0.28, 0, L * 0.12, h * 1.2, w * 0.25, col, 0, 0, arc * 1.4);
    PE.box(-L * 0.06, h * 0.55, 0, L * 0.22, h * 0.35, w * 0.2, col, 0, 0, arc * 0.6);
    PE.box(-L * 0.33, 0, 0, L * 0.1, h * 0.75, w * 0.9, col, 0, 0, arc * 0.5);
  },
};

// ---------------------------------------------------------------- le concours du Pêchedi : au poids
const p21Concours = {
  // les habitants : la plus lourde de leurs prises du jour (mêmes poissons du lac, de jour, que les vôtres)
  NOMS: [['pecheur', 6], ['maire', 2], ['aubergiste', 3], ['fillette', 1], ['colporteur', 2]],
  pesee() {
    const s = farm.s, rnd = mulberry32(((s.seed | 0) * 17 + s.day * 71 + 2) >>> 0);
    const o = { zone: 'lac', nuit: false, lune: false, pluie: false, appat: null, dame: false };
    return this.NOMS.map(([id, n]) => {
      let best = 0, bid = null;
      for (let i = 0; i < n; i++) { const k = p21Tirage.predire(o, rnd(), 0.5); if (!k) continue; const m = p21Tirage.mesure(k, rnd); if (m.kg > best) { best = m.kg; bid = k; } }
      return [id, best, bid];
    }).filter(([id]) => (npcs.alive ? npcs.alive(id) : true));
  },
  // le panneau du ponton (remplace activites.peche : le classement se fait au poids)
  peche() {
    const s = farm.s, A = activites.S(), h = activites.h(), P = A.peche && A.peche.j === s.day ? A.peche : null, pe = npcs.byId.pecheur, T = P21_TEXTES;
    if (!cal.is('peche')) { ui.read('Le concours de pêche', T.concoursRegle, 'Le ponton'); return; }
    if (!P || P.fini || h < 16) {
      if (P && !P.fini && h < 16) {
        const b = P.bestKg ? P.best : null;
        ui.subtitle('', b ? T.concoursAttente(itemName(b.id).toLowerCase(), T.kg(P.bestKg)) : T.concoursRien, 3.5);
        return;
      }
      return this._peche();
    }
    if (h >= 20) return this._peche();
    P.fini = true;
    const L = this.pesee().map((q) => [q[0], q[1], q[2]]);
    const moi = P.bestKg || 0;
    L.push(['vous', moi, P.best ? P.best.id : null]); L.sort((a, b) => b[1] - a[1]);
    const rang = L.findIndex((q) => q[0] === 'vous') + 1;
    let prix = '';
    if (moi && rang === 1) { farm.earn(50); farm.give('coffre_peche', 1); prix = 'Premier prix : cinquante pièces et un coffre de pêcheur.'; if (pe && pe.st.alive) { npcs.addAmitie(pe, 30); ui.subtitle(pe.st.met ? pe.name : 'Le pêcheur', ACT_PECHE.gagne, 4.5); } sound.applaudir && sound.applaudir(); activites.esprit(1.5, 'le concours', 1.5); }
    else if (moi && rang === 2) { farm.earn(25); prix = 'Deuxième prix : vingt-cinq pièces.'; }
    else if (moi && rang === 3) { farm.give('vers', 12); prix = 'Troisième prix : douze vers de terre, frétillants.'; }
    else if (pe && pe.st.alive) ui.subtitle(pe.st.met ? pe.name : 'Le pêcheur', ACT_PECHE.perd, 4);
    const nom = (id) => (id === 'vous' ? 'vous' : npcs.nameOf(id));
    const ligne = L.map((q, i) => `${i + 1}. ${nom(q[0])}${q[1] ? ' (' + (q[2] && ITEMS[q[2]] ? itemName(q[2]).toLowerCase() + ', ' : '') + T.kg(q[1]) + ')' : ''}`).join(' ; ');
    ui.read('Le concours de pêche', T.concoursBilan(P.best ? `${itemName(P.best.id).toLowerCase()}, ${T.kg(moi)}` : '', ligne) + (prix ? '\n\n' + prix : ''), 'Le jury du ponton');
  },
};

// ---------------------------------------------------------------- les sons
Object.assign(SoundEngine.prototype, {
  p21Fouet() { if (!this.ok) return; const t = this.at(); this.noiseHit(t, 0.2, 'bandpass', 2600, 1.2, 0.03, null, 700, 0.02); this.noiseHit(t + 0.02, 0.35, 'bandpass', 900, 0.8, 0.012, null, 400, 0.05); },
  p21Plouf() { if (!this.ok) return; this.jouer(this.tb('goutte'), this.at(), 0.035, this.sfx, 0.55 + Math.random() * 0.1); this.noiseHit(this.at(), 0.18, 'lowpass', 900, 0.7, 0.014); },
  p21Frisson() { if (!this.ok) return; const t = this.at(); this.jouer(this.tb('goutte'), t, 0.012, this.sfx, 1.3 + Math.random() * 0.3); },
  p21Plonge() { if (!this.ok) return; const t = this.at(); this.tone(t, 'sine', 150, 70, 0.16, 0.045, null, 0.004); this.jouer(this.tb('goutte'), t + 0.03, 0.04, this.sfx, 0.42); },
  p21Ferre() { if (!this.ok) return; const t = this.at(); this.noiseHit(t, 0.12, 'bandpass', 1600, 1.5, 0.035, null, 3400, 0.004); this.tone(t, 'triangle', 190, 95, 0.1, 0.03, null, 0.003); },
  p21Moulinet(k = 1) { if (!this.ok) return; const t = this.at(); for (let i = 0; i < 3; i++) this.tone(t + i * 0.034, 'triangle', 2300 - i * 60, 2100, 0.009, 0.011 * k, null, 0.001); },
  p21Grince(T) {
    if (!this.ok) return;
    const t = this.at(), k = Math.min(1, Math.max(0, (T - 0.7) / 0.4));
    this.voice(t, 'sawtooth', 260 + k * 520, 230 + k * 470, 0.14 + k * 0.08, 0.005 + 0.011 * k, this.sfx, { bp: 1700 + k * 900, q: 5, vib: 40, vibDepth: 18, lp: 3600 });
  },
  p21Casse() { if (!this.ok) return; const t = this.at(); this.noiseHit(t, 0.05, 'highpass', 3800, 0.7, 0.07); this.tone(t, 'sine', 980, 120, 0.3, 0.035, null, 0.002); this.tone(t, 'triangle', 1500, 300, 0.12, 0.012, null, 0.001); },
  p21Invite() { if (!this.ok) return; this.tone(this.at(), 'sine', 880, 860, 0.05, 0.028, this.ui, 0.003); },
  p21Ok() { if (!this.ok) return; const t = this.at(); this.tone(t, 'triangle', 660, 880, 0.09, 0.028, this.ui, 0.003); },
  p21Rate() { if (!this.ok) return; this.tone(this.at(), 'sine', 220, 130, 0.14, 0.04, this.ui, 0.004); },
  p21Record() { if (!this.ok) return; const t = this.at() + 0.25; this.tone(t, 'triangle', 660, 660, 0.18, 0.03, this.ui, 0.004); this.tone(t + 0.16, 'triangle', 990, 990, 0.3, 0.03, this.ui, 0.004); },
  p21Gobage() { if (!this.ok) return; this.jouer(this.tb('goutte'), this.at(), 0.016, this.sfx, 0.8 + Math.random() * 0.4); },
});

// ---------------------------------------------------------------- les branchements
// le clic gauche, une canne en main : c'est la pêche qui le lit (à chaque image, maintenu ou non)
{
  const prim = (eye, basis, held, it, id) => (id === 'canne' || (it && it.tool === 'canne'));
  prim.zone = true;
  HOOKS.primary.push(prim);
  // le clic droit : relever la ligne, ou changer d'appât
  const sec = (eye, basis, it, id) => {
    if (!(id === 'canne' || (it && it.tool === 'canne'))) return false;
    if (p21.et === 'attente' || p21.et === 'touche' || p21.et === 'vol') { p21.rentrer(); return true; }
    if (p21.et === 'combat') return true;
    p21.changerAppat();
    return true;
  };
  sec.zone = true;
  HOOKS.secondary.push(sec);
  // chaque image
  const maj = (dt, eye, basis, sky, playing) => { try { p21.maj(dt, eye, basis, sky, playing); } catch (e) { console.error('p21', e); p21.fin(); } };
  maj.zone = true;
  HOOKS.update.push(maj);
  const dessin = (buf, sbuf, cam, t) => p21.dessiner(buf, sbuf, cam, t);
  dessin.zone = true;
  HOOKS.draw.push(dessin);
  // la ligne à l'eau : c'est nous qui la faisons vivre (la pêche d'avant, sans nous, reste telle quelle)
  const _uf = play.updateFish.bind(play);
  play.updateFish = function (dt) { if (this.fish && this.fish.p21) return; return _uf(dt); };
  // la bouée d'avant ne se dessine plus quand c'est la nôtre
  const _bd = play.buildDynamic.bind(play);
  play.buildDynamic = function (cam, sky, t) {
    const F = this.fish;
    if (!F || !F.p21) return _bd(cam, sky, t);
    const st = F.state;
    F.state = 'ground';
    try { return _bd(cam, sky, t); } finally { F.state = st; }
  };
  // pendant le combat, on ne marche pas (les flèches et ZQSD tirent la canne) ; Espace ferre au lieu de sauter
  const _down = input.down.bind(input);
  input.down = function (code) { if (p21.et && p21.bloque(code)) return false; return _down(code); };
  // les directions : chaque appui compte, même bref
  window.addEventListener('keydown', (e) => {
    if (e.repeat || !p21.C) return;
    const d = P21_DIRS[e.code];
    if (d && !p21.C.epuisette) p21.dirs.push(d);
    else if (e.code === 'Space' && p21.C.epuisette) p21.dirs.push('e');
  });
  // la glace : le trou du lac gelé (n'importe quelle canne, en main ou dans la sacoche)
  HOOKS.inter.peche_glace = (it) => p21.glace(it);
}
// le concours du Pêchedi se juge au poids
HOOKS.load.push(() => {
  if (typeof activites !== 'undefined' && activites.peche && !p21Concours._peche) {
    p21Concours._peche = activites.peche.bind(activites);
    activites.peche = function () { return p21Concours.peche(); };
  }
  if (typeof vallee !== 'undefined') vallee.fish = null;
  p21.F = null; p21.C = null; p21.et = null; p21.prise = null; p21.anneaux.length = 0; p21.sauts.length = 0; p21.coins.cle = '';
});

// ---------------------------------------------------------------- le wiki du jeu : ce qu'on apprend d'un poisson en le prenant
if (typeof decouvertes !== 'undefined' && decouvertes.ajouterChamps) {
  decouvertes.ajouterChamps('it', (id) => {
    const k = id.slice(3), q = FISH[k];
    if (!q) return [];
    const T = P21_TEXTES, out = [], eaux = q.where.map((z) => p21.lieu(z));
    const motsEau = { lac: ['lac'], etang: ['etang'], marais: ['marais'], riviere: ['riviere', 'ruisseau'], lac_noir: ['noir'], lac_gele: ['gele', 'glace'], douves: ['douve'], bains: ['source', 'bain'], souterrain: ['souterrain', 'dessous', 'grotte'], temple: ['temple'], mine: ['mine', 'puits'], envers: ['envers'] };
    out.push({ k: 'eaux', nom: T.champEaux, val: eaux.join(', '), test: (g) => q.where.some((z) => d15Un(g, motsEau[z] || [d15Norme(z)])) });
    const hv = (T.heureVal[q.time] || T.heureVal.tout) + (q.moon ? T.lune : '');
    out.push({ k: 'heure', nom: T.champHeure, val: hv, test: (g) => (q.time === 'nuit' ? d15Un(g, ['nuit', 'soir', 'nocturne']) : q.time === 'jour' ? d15Un(g, ['jour', 'matin', 'diurne']) && !d15Un(g, ['nuit']) : d15Un(g, ['tout', 'toujours', 'jour et nuit', 'n\'importe'])) });
    const ap = P21_APPATS_ORDRE.filter((a) => P21_APPATS[a].esp.includes(k) && ITEMS[a]);
    if (ap.length) { const N = ap.map((a) => itemName(a)); out.push({ k: 'appat', nom: T.champAppat, val: N.join(', '), test: (g) => d15Cite(g, N) }); }
    const st = p21Tirage.espece(k)[0];
    if (T.combats[st]) out.push({ k: 'combat', nom: T.champCombat, val: T.combats[st], test: (g) => d15Un(g, ['saut', 'tortill', 'file', 'plonge', 'secou', 'recul', 'lourd', 'fond', 'violent', 'tourne', 'remonte', 'debat', 'glisse', 'suite']) && d15Cite(g, [T.combats[st]]) });
    return out;
  });
  decouvertes.declarer('sys:peche', {
    titre: 'La pêche', sous: 'Savoir-faire', icone: '🎣', groupe: 'autres',
    lead: 'On dose le lancer, on attend que le bouchon plonge — pas qu’il frémisse —, on ferre, puis on mouline sans casser la ligne, en tirant à l’opposé quand le poisson part de côté, en levant la canne quand il plonge, en la baissant quand il saute. Les gros se prennent à l’épuisette. Les appâts attirent certaines espèces ; là où l’eau se ride de ronds, ça mord plus vite.',
    champs: [],
  });
}
