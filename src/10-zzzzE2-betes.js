// ============================================================================
//  LES BÊTES DE LA LANDE, DES HAUTEURS ET DU LAC (agent E2) : leur conduite.
//  Données : 05-zzzzzE2-betes.js ; modèles : 07-zzzzzzzzzzzzE2-modeles.js ;
//  cris : 09-zzzzE2-cris.js ; où et quand elles paraissent : 11-zzzzE2-betes.js.
//  Chaque bête a sa manière : le lézard au soleil, la perdrix qui part en
//  compagnie, l'œdicnème qui se plaque, le busard qui rase la lande, le sphinx
//  qui vient à la lanterne, le tétras qui parade à l'aube, le tichodrome sur
//  la paroi, le grand-duc qui prévient avant de frapper, les vautours qui
//  descendent sur une bête morte, le gypaète qui laisse tomber ses os, la
//  foulque qui court sur l'eau, le cormoran qui sèche ses ailes, le balbuzard
//  qui pêche, l'oie qui garde la troupe, le rat d'eau qui plonge…
// ============================================================================
// (e2 : la conduite ; les oiseaux d'eau gardent water, pour nager ; oiseau : la dépouille se ramasse d'un coup)
Object.assign(CREATURES, {
  // ---- la lande
  lezard_vert: { walk: 0.5, run: 4.5, range: 6, flee: 4, radius: 0.04, idle: [5, 14], rig: 'e2_lezard', h: 0.05, wild: true, e2: 'lezard_vert' },
  calamite: { walk: 0.32, run: 0.9, range: 6, flee: 2.2, radius: 0.04, idle: [2, 8], rig: 'e2_crapaud', h: 0.06, wild: true, e2: 'calamite' },
  perdrix_rouge: { walk: 0.6, run: 3.2, range: 12, flee: 7, radius: 0.1, idle: [1, 4], rig: 'e2_perdrix', h: 0.28, wild: true, oiseau: true, flush: true, e2: 'perdrix_rouge' },
  pie_grieche: { walk: 0, run: 0, range: 20, flee: 9, radius: 0.05, idle: [2, 6], rig: 'e2_piegrieche', h: 0.16, wild: true, oiseau: true, e2: 'pie_grieche' },
  huppe: { walk: 0.5, run: 2.2, range: 10, flee: 9, radius: 0.07, idle: [1, 4], rig: 'e2_huppe', h: 0.24, wild: true, oiseau: true, e2: 'huppe' },
  oedicneme: { walk: 0.7, run: 3.6, range: 14, flee: 0, radius: 0.1, idle: [3, 9], rig: 'e2_oedicneme', h: 0.42, wild: true, oiseau: true, e2: 'oedicneme' },
  busard_sm: { fly: true, rig: 'e2_busard', flock: 1, radius: 0.3, h: 0.3, e2: 'busard_sm' },
  minotaure: { walk: 0.06, run: 0.15, range: 3, flee: 0, radius: 0.02, idle: [4, 12], rig: 'e2_minotaure', h: 0.025, wild: true, e2: 'minotaure' },
  genette: { walk: 0.8, run: 6, range: 18, flee: 11, radius: 0.1, idle: [2, 6], rig: 'e2_genette', h: 0.3, wild: true, e2: 'genette' },
  sphinx_tete_mort: { fly: true, rig: 'e2_sphinx', flock: 1, radius: 0.06, h: 0.05, e2: 'sphinx_tete_mort' },
  // ---- les hauteurs
  campagnol_neiges: { walk: 0.6, run: 3.5, range: 5, flee: 0, radius: 0.03, idle: [2, 8], rig: 'e2_campagnol_neiges', h: 0.05, wild: true, e2: 'campagnol_neiges' },
  bartavelle: { walk: 0.6, run: 3.4, range: 12, flee: 8, radius: 0.1, idle: [1, 4], rig: 'e2_bartavelle', h: 0.28, wild: true, oiseau: true, flush: true, e2: 'bartavelle' },
  tetras_lyre: { walk: 0.6, run: 3.0, range: 12, flee: 7, radius: 0.15, idle: [2, 6], rig: 'e2_tetras_lyre', h: 0.45, wild: true, oiseau: true, flush: true, e2: 'tetras_lyre' },
  peliade: { walk: 0.3, run: 1.2, range: 5, flee: 0, radius: 0.08, idle: [4, 12], rig: 'e2_peliade', h: 0.08, wild: true, bite: 1.1, e2: 'peliade' },
  salamandre_noire: { walk: 0.12, run: 0.3, range: 4, flee: 0, radius: 0.04, idle: [3, 9], rig: 'e2_salamandre_noire', h: 0.05, wild: true, e2: 'salamandre_noire' },
  apollon: { fly: true, rig: 'e2_apollon', flock: 1, radius: 0.06, h: 0.05, e2: 'apollon' },
  tichodrome: { walk: 0, run: 0, range: 8, flee: 0, radius: 0.04, idle: [2, 6], rig: 'e2_tichodrome', h: 0.12, wild: true, oiseau: true, e2: 'tichodrome' },
  grand_duc: { walk: 0, run: 0, range: 30, flee: 0, radius: 0.2, idle: [4, 10], rig: 'e2_grand_duc', h: 0.72, wild: true, oiseau: true, e2: 'grand_duc' },
  vautour_fauve: { fly: true, rig: 'e2_vautour', flock: 1, radius: 0.5, h: 0.8, e2: 'vautour_fauve' },
  gypaete: { fly: true, rig: 'e2_gypaete', flock: 1, radius: 0.5, h: 0.75, e2: 'gypaete' },
  // ---- le lac
  foulque: { walk: 0.45, run: 1.6, range: 14, flee: 0, radius: 0.12, idle: [2, 7], water: true, rig: 'e2_foulque', h: 0.3, oiseau: true, e2: 'foulque' },
  mouette: { fly: true, rig: 'e2_mouette', flock: 1, radius: 0.25, h: 0.3, e2: 'mouette' },
  guignette: { walk: 0.5, run: 1.8, range: 6, flee: 0, radius: 0.05, idle: [1, 5], rig: 'e2_guignette', h: 0.16, wild: true, oiseau: true, e2: 'guignette' },
  campagnol_amphibie: { walk: 0.45, run: 2.8, range: 6, flee: 0, radius: 0.06, idle: [3, 10], rig: 'e2_campagnol_amphibie', h: 0.1, wild: true, e2: 'campagnol_amphibie' },
  couleuvre_viperine: { walk: 0.3, run: 1.4, range: 6, flee: 0, radius: 0.08, idle: [3, 10], rig: 'e2_viperine', h: 0.08, wild: true, e2: 'couleuvre_viperine' },
  oie_cendree: { walk: 0.6, run: 2.4, range: 10, flee: 0, radius: 0.22, idle: [2, 6], rig: 'e2_oie', h: 0.75, wild: true, oiseau: true, graze: true, e2: 'oie_cendree' },
  harle: { walk: 0.5, run: 1.8, range: 16, flee: 0, radius: 0.14, idle: [2, 7], water: true, rig: 'e2_harle', h: 0.3, oiseau: true, e2: 'harle' },
  cormoran: { walk: 0.5, run: 1.6, range: 18, flee: 0, radius: 0.18, idle: [3, 9], water: true, rig: 'e2_cormoran', h: 0.42, oiseau: true, e2: 'cormoran' },
  balbuzard: { fly: true, rig: 'e2_balbuzard', flock: 1, radius: 0.35, h: 0.4, e2: 'balbuzard' },
  vison: { walk: 0.8, run: 5, range: 10, flee: 0, radius: 0.06, idle: [2, 6], rig: 'e2_vison', h: 0.18, wild: true, e2: 'vison' },
});

// ---------------------------------------------------------------- outils communs
const E2_BUISSONS_HAUTS = new Set(['bush', 'genet', 'eglantier', 'ronce', 'berry', 'sureau', 'genevrier', 'd1_genevrier']);
const E2_BUISSONS = new Set([...E2_BUISSONS_HAUTS, 'heather']);
const E2_ARBRES = new Set(['oak', 'pine', 'birch', 'apple', 'deadtree', 'hetre', 'chataignier', 'noyer', 'erable', 'tilleul', 'aulne', 'saule', 'peuplier', 'sapin', 'meleze']);
const E2_REFUGES = new Set(['oak', 'pine', 'birch', 'deadtree', 'rock', 'stones', 'genet', 'bush', 'sapin', 'meleze']);
const E2_PIERRES = new Set(['rock', 'stones', 'deadtree']);
const E2C = {
  pluie: { t: -1e9 },               // le dernier moment de pluie (game.time), tenu par 11-zzzzE2-betes.js
  os: [], osSol: [],                // les os du gypaète : qui tombent ; tombés (on les ramasse)
  heure() { try { return npcs.hour(); } catch (e) { return 12; } },
  heureJeu() { return (typeof JOUR_SECONDES !== 'undefined' ? JOUR_SECONDES : 1200) / 24; },
  pluieRecente() { return typeof game !== 'undefined' && game.time - this.pluie.t < 3 * this.heureJeu(); },
  // un cri, de la bête (portée en m ; alarme : n'attend pas son tour)
  cri(e, sorte, c, portee, alarme) {
    if (!sound.e2Cri || e.hidden || (c && c.silent)) return false;
    const d = e.dist !== undefined ? e.dist : Math.hypot(e.x - c.px, e.z - c.pz);
    if (d > portee) return false;
    // un autre oiseau chante : on réessaiera dans quelques secondes (sans attendre tout un tour)
    if (!alarme && typeof E2_CRI_OISEAU !== 'undefined' && E2_CRI_OISEAU[sorte] !== undefined && sound.ctx && (sound.oiseauxFin || 0) > sound.ctx.currentTime + 0.3) {
      if (!e.e2redit) e.e2redit = { sorte, portee, t: 2 + Math.random() * 4, n: 0 };
      return false;
    }
    return sound.e2Cri(sorte, 1 - d / portee, e, alarme);
  },
  // le cri remis à plus tard (voir cri) : on le redit, trois fois au plus
  redire(e, dt, c) {
    const R = e.e2redit;
    R.t -= dt;
    if (R.t > 0) return;
    e.e2redit = null;
    if (!E2C.cri(e, R.sorte, c, R.portee) && e.e2redit) { e.e2redit.n = R.n + 1; if (e.e2redit.n > 3) e.e2redit = null; }
  },
  haut(w, x, z) { return w.heightAt(x, z) - w.waterLevel; },
  // le joueur regarde-t-il de ce côté ?
  vu(e) { try { const p = game.player, f = cameraBasis(p.yaw, 0).f, dx = e.x - p.pos[0], dz = e.z - p.pos[2], d = Math.hypot(dx, dz) || 1; return (dx * f[0] + dz * f[2]) / d > 0.45; } catch (err) { return false; } },
  eau(w, x, z) { return w.heightAt(x, z) < w.waterLevel - 0.35; },
  berge(w, x, z) { const h = w.heightAt(x, z) - w.waterLevel; return h > 0.04 && h < 0.9; },
  pente(w, x, z) { const n = w.normalAt(x, z); return 1 - n[1]; },
  // un point au hasard autour de (x, z), entre r0 et r1, qui convient
  chercher(w, x, z, r0, r1, ok, n) {
    const R = Math.random;
    for (let k = 0; k < (n || 12); k++) { const a = R() * TAU, d = r0 + R() * (r1 - r0), tx = x + Math.sin(a) * d, tz = z + Math.cos(a) * d; if (w.inside(tx, tz, 8) && ok(tx, tz)) return [tx, tz]; }
    return null;
  },
  // l'objet du décor le plus proche, d'une sorte (sauf « sauf »)
  // (la grille de tous les objets : la bruyère et les genêts n'ont pas de collision, la grille de w.query les ignore)
  objet(w, x, z, R, ids, sauf) {
    const G = w.objectsGrid(), C = G.C, n = G.gw - 1;
    const gx0 = clamp(Math.floor((x - R) / C), 0, n), gx1 = clamp(Math.floor((x + R) / C), 0, n), gz0 = clamp(Math.floor((z - R) / C), 0, n), gz1 = clamp(Math.floor((z + R) / C), 0, n);
    let best = null, bd = 1e9;
    for (let gz = gz0; gz <= gz1; gz++) for (let gx = gx0; gx <= gx1; gx++) {
      const cell = G.cells[gz * G.gw + gx];
      if (!cell) continue;
      for (const i of cell) {
        const o = w.objects[i];
        if (!o || o.gone || !w.live(o)) continue;
        const T = OBJ_TYPES[o.t];
        if (!T || !ids.has(T.id)) continue;
        if (sauf && Math.hypot(o.x - sauf.x, o.z - sauf.z) < 3) continue;
        const d = Math.hypot(o.x - x, o.z - z);
        if (d < bd && d <= R) { bd = d; best = o; }
      }
    }
    return best;
  },
  // la pente : vers le haut (gradient), vers le bas (le plus bas de huit directions)
  montee(w, x, z) { const e = 0.6, gx = w.heightAt(x + e, z) - w.heightAt(x - e, z), gz = w.heightAt(x, z + e) - w.heightAt(x, z - e), n = Math.hypot(gx, gz); return n > 1e-4 ? [gx / n, gz / n] : null; },
  versLeBas(w, x, z, cap) { let best = cap, bh = 1e9; for (let k = 0; k < 8; k++) { const a = k / 8 * TAU, h = w.heightAt(x + Math.sin(a) * 15, z + Math.cos(a) * 15); if (h < bh && h > w.waterLevel + 0.3) { bh = h; best = a; } } return best + (Math.random() - 0.5) * 0.4; },
  // avance vers un point ; renvoie la distance qui reste
  vers(e, tx, tz, v, dt, tourne) {
    const dx = tx - e.x, dz = tz - e.z, d = Math.hypot(dx, dz);
    if (d < 1e-3) return 0;
    const s = Math.min(d, v * dt);
    e.x += dx / d * s; e.z += dz / d * s;
    const want = Math.atan2(dx, dz);
    e.heading = tourne ? turnToward(e.heading, want, dt * tourne) : want;
    return d - s;
  },
  // nager (les oiseaux d'eau) : flâner sur l'eau autour de chez soi
  nager(e, dt, w, vit) {
    e.timer -= dt;
    if (e.state !== 'walk') { if (e.timer <= 0) entities.pickTarget(e, w); e.move = lerp(e.move, 0, Math.min(1, dt * 4)); return; }
    const dx = (e.tx ?? e.x) - e.x, dz = (e.tz ?? e.z) - e.z, d = Math.hypot(dx, dz);
    if (d < 0.6 || e.timer <= 0) { e.state = 'idle'; e.timer = lerp(e.cfg.idle[0], e.cfg.idle[1], Math.random()); return; }
    e.heading = turnToward(e.heading, Math.atan2(dx, dz), dt * 2);
    entities.stepMove(e, dt, w, vit || e.cfg.walk);
    e.move = 1; e.phase += dt * 3;
  },
  // un vol court : on s'éloigne de (fx, fz) — ou on va à o.cible —, on monte à o.haut, à o.v m/s ; o.eau : on se pose sur l'eau
  envol(e, w, fx, fz, o) {
    o = o || {};
    const T = o.cible ? Math.max(1.2, Math.hypot(o.cible[0] - e.x, o.cible[1] - e.z) / (o.v || 7)) : (o.duree || 4);
    e.vol = { t: T, T, haut: o.haut || 2.5, v: o.v || 7, cible: o.cible || null, eau: !!o.eau, prolonge: 0 };
    e.heading = o.cible ? Math.atan2(o.cible[0] - e.x, o.cible[1] - e.z) : Math.atan2(e.x - fx, e.z - fz) + (Math.random() - 0.5) * 0.7;
    e.fly = 1; e.state = 'idle'; e.move = 0; e.hidden = false;
  },
  voler(e, dt, w) {
    const V = e.vol;
    V.t -= dt;
    if (V.cible) { E2C.vers(e, V.cible[0], V.cible[1], V.v, dt, 6); }
    else { e.x += Math.sin(e.heading) * V.v * dt; e.z += Math.cos(e.heading) * V.v * dt; if (!w.inside(e.x, e.z, 12)) e.heading += Math.PI; }
    const u = clamp(1 - V.t / V.T, 0, 1), sol = Math.max(w.heightAt(e.x, e.z), w.waterLevel);
    e.y = sol + V.haut * Math.sin(u * Math.PI) + (V.eau ? 0.05 : 0.02);
    e.fly = 1; e.phase += dt * 6;
    if (V.t > 0) return true;
    // se poser là où il faut (l'eau pour les uns, la terre pour les autres) ; sinon, encore un peu
    const h = w.heightAt(e.x, e.z), ok = V.eau ? h < w.waterLevel - 0.35 : h > w.waterLevel + 0.05;
    if (!ok && V.prolonge < 6) { V.prolonge++; V.t = 0.8; V.T += 0.8; V.cible = null; return true; }
    // (toujours pas : on rentre chez soi)
    if (!ok && V.prolonge < 7) { V.prolonge++; V.cible = [e.hx, e.hz]; V.t = V.T = Math.max(1, Math.hypot(e.hx - e.x, e.hz - e.z) / V.v); return true; }
    e.vol = null; e.fly = 0; e.state = 'idle'; e.timer = 1.5;
    e.y = V.eau ? w.waterLevel - e.h * 0.25 : w.groundAt(e.x, e.z, h + 0.6, 0.6);
    return false;
  },
  // une bête morte dans les parages (pour les vautours)
  charogne(x, z, R) {
    let best = null, bd = R;
    for (const q of entities.list) {
      if (!q.corpse || q.removed || q.hidden || !q.cfg || q.cfg.fly) continue;
      const d = Math.hypot(q.x - x, q.z - z);
      if (d < bd) { bd = d; best = q; }
    }
    return best;
  },
  // l'heure est passée, ou le temps a tourné : la bête s'en va (le module la retire hors de vue)
  partirVol(e, dt) {
    if (!e.e2part) return false;
    if (e.hidden) return true;
    e.fly = 1; e.peck = false;
    e.y += dt * 4; e.x += Math.sin(e.heading) * dt * 9; e.z += Math.cos(e.heading) * dt * 9;
    // hors de vue (ou loin, ou au bout d'un moment) : elle n'est plus là (le module la retire)
    e.e2partT = (e.e2partT || 0) + dt;
    if ((e.e2partT > 6 && (e.dist > 50 || !E2C.vu(e))) || e.e2partT > 25) e.hidden = true;
    return true;
  },
  partirSol(e, dt, w, c) {
    if (!e.e2part) return false;
    if (e.hidden) return true;
    e.e2partT = (e.e2partT || 0) + dt;
    if ((e.e2partT > 5 && (e.dist > 45 || !E2C.vu(e))) || e.e2partT > 40) { e.hidden = true; return true; }
    if (e.state !== 'flee') entities.startFlee(e, c.px, c.pz);
    return false;
  },
  // des éclaboussures
  gerbe(w, x, z, n, k) {
    if (typeof particles === 'undefined') return;
    const y = w.waterLevel + 0.02;
    for (let i = 0; i < n; i++) particles.spawn(x + (Math.random() - 0.5) * 0.3, y, z + (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 1.6 * k, (1 + Math.random() * 1.6) * k, (Math.random() - 0.5) * 1.6 * k, [0.82, 0.88, 0.92, 0.85], 0.05, 0.7, 7, false);
  },
  poussiere(w, x, z, n, col) {
    if (typeof particles === 'undefined') return;
    const y = w.heightAt(x, z) + 0.03;
    for (let i = 0; i < n; i++) particles.spawn(x, y, z, (Math.random() - 0.5) * 0.7, 0.4 + Math.random() * 0.5, (Math.random() - 0.5) * 0.7, col || [0.62, 0.52, 0.36, 1], 0.035, 0.6, 6, false);
  },
  // l'envol de toute la compagnie (perdrix, tétras) : celle qui part entraîne les autres
  compagnie(e) {
    const G = e.groupe;
    if (!G || e.flyT > 0) return false;
    const L = G.find((q) => q !== e && !q.dead && q.flyT > 1.2);
    if (!L) return false;
    e.flyT = 2.4 + Math.random() * 1.2; e.flyH0 = 0.2;
    e.heading = L.heading + (Math.random() - 0.5) * 0.7;
    return true;
  },
};

// ---------------------------------------------------------------- les bêtes qui marchent, nagent ou se perchent
// fn(e, dt, w, c) -> true : la bête est conduite ici (rien d'autre) ; false : la conduite commune suit (errer, fuir, s'envoler…)
const E2_COMPORTE = {
  // ---- la lande
  // au soleil seulement ; dérangé, il file dans la bruyère et s'y cache
  lezard_vert(e, dt, w, c) {
    const soleil = c.night < 0.35 && c.rain < 0.1 && !(weather.cur.fog > 0.5);
    if (!soleil) { e.hidden = true; return true; }
    if (e.cache > 0) { e.cache -= dt; e.hidden = true; if (e.cache <= 0) { e.hidden = false; e.state = 'idle'; e.timer = 4; } return true; }
    if (e.state === 'flee' && !e.fuite) { e.fuite = true; E2C.cri(e, 'froissement', c, 12); }
    if (e.fuite && e.state !== 'flee') { e.fuite = false; e.cache = 8 + Math.random() * 12; e.hidden = true; return true; }
    return false;
  },
  // la nuit ; il court plus qu'il ne saute ; il chante, surtout après la pluie
  calamite(e, dt, w, c) {
    e.chantT = (e.chantT ?? 4 + Math.random() * 25) - dt;
    if (e.chantT <= 0) { e.chantT = (E2C.pluieRecente() ? 16 : 35) + Math.random() * 40; if (c.night > 0.5 && e.dist > 3) E2C.cri(e, 'calamite', c, 150); }
    return false;
  },
  // en compagnie ; au crépuscule et au petit jour, le mâle chante
  perdrix_rouge(e, dt, w, c) { return E2_COMPORTE._perdrix(e, dt, w, c, 'perdrix', false); },
  bartavelle(e, dt, w, c) { return E2_COMPORTE._perdrix(e, dt, w, c, 'bartavelle', true); },
  _perdrix(e, dt, w, c, cri, montagne) {
    E2C.compagnie(e);
    if (e.flyT > 0) {
      if (!e.envole) { e.envole = true; if (montagne) e.heading = E2C.versLeBas(w, e.x, e.z, e.heading); if (e.groupe && e.groupe[0] === e) E2C.cri(e, cri, c, 90, true); }
      return false;
    }
    e.envole = false;
    if (e.groupe && e.groupe[0] === e) {
      e.chantT = (e.chantT ?? 10 + Math.random() * 40) - dt;
      if (e.chantT <= 0) { e.chantT = 45 + Math.random() * 70; const h = E2C.heure(); if ((h > 5 && h < 9) || (h > 17 && h < 20.5)) E2C.cri(e, cri, c, 140); }
    }
    // la bartavelle remonte la pente en courant, tant qu'on n'est pas trop près
    if (montagne && e.state !== 'flee' && e.dist < e.cfg.flee * 2.3 && e.dist > e.cfg.flee && !e.monte) {
      const g = E2C.montee(w, e.x, e.z);
      if (g) { e.tx = e.x + g[0] * 7; e.tz = e.z + g[1] * 7; e.state = 'walk'; e.timer = 4; e.runTo = true; e.monte = 4; }
    }
    if (e.monte > 0) e.monte -= dt;
    return false;
  },
  // perchée au sommet d'un buisson ; elle descend prendre un insecte, et remonte ; dérangée, elle change de buisson
  pie_grieche(e, dt, w, c) {
    e.hidden = false;
    if (!e.perch || e.bouge) {
      const cx = e.bouge ? e.x : e.hx, cz = e.bouge ? e.z : e.hz;
      const o = E2C.objet(w, cx, cz, 28, E2_BUISSONS_HAUTS, e.perch) || E2C.objet(w, cx, cz, 28, E2_BUISSONS, e.perch);
      const P = o ? { x: o.x, z: o.z, y: w.objectY(o) + clamp((o.h || 1) * 0.92, 0.45, 1.8) } : { x: e.hx + (Math.random() - 0.5) * 6, z: e.hz + (Math.random() - 0.5) * 6, y: 0 };
      if (!o) P.y = w.heightAt(P.x, P.z) + 0.3;
      if (!e.perch) { e.x = P.x; e.z = P.z; e.y = P.y; e.lardoir = o ? { x: o.x, z: o.z, y: P.y - 0.18, s: e.seed } : null; }
      e.perch = P; e.vole = !!e.bouge; e.bouge = false; e.ph = 'perche';
    }
    const P = e.perch;
    if (e.vole) {
      e.fly = 1; e.phase += dt * 7;
      const r = E2C.vers(e, P.x, P.z, 7, dt);
      e.y = lerp(e.y, P.y + Math.min(1.2, r * 0.15), Math.min(1, dt * 3));
      if (r < 0.2) { e.vole = false; e.y = P.y; e.fly = 0; }
      return true;
    }
    if (e.dist < e.cfg.flee * (c.crouch ? 0.5 : 1) * (c.sprint ? 1.4 : 1)) { e.bouge = true; e.ph = 'perche'; sound.flutter && sound.flutter(0.4, 0); E2C.cri(e, 'piegrieche', c, 50, true); return true; }
    // la chasse : une descente brève jusqu'au sol, et retour
    if (e.ph === 'pique') {
      e.fly = 1; e.phase += dt * 8;
      const r = E2C.vers(e, e.proie[0], e.proie[1], 4, dt), sol = w.heightAt(e.x, e.z);
      e.y = lerp(e.y, sol + 0.05, Math.min(1, dt * 4));
      if (r < 0.1) { e.ph = 'sol'; e.solT = 0.8; e.fly = 0; e.y = sol; }
      return true;
    }
    if (e.ph === 'sol') { e.peck = true; e.solT -= dt; if (e.solT <= 0) { e.ph = 'retour'; e.peck = false; } return true; }
    if (e.ph === 'retour') {
      e.fly = 1; e.phase += dt * 8;
      const r = E2C.vers(e, P.x, P.z, 4, dt);
      e.y = lerp(e.y, P.y, Math.min(1, dt * 4));
      if (r < 0.1) { e.ph = 'perche'; e.y = P.y; e.fly = 0; }
      return true;
    }
    e.fly = 0; e.move = 0; e.peck = false;
    e.x = P.x; e.z = P.z; e.y = P.y;
    e.heading += Math.sin(c.t * 0.7 + e.seed) * dt * 0.8;
    e.chasseT = (e.chasseT ?? 6 + Math.random() * 10) - dt;
    if (e.chasseT <= 0) {
      e.chasseT = 8 + Math.random() * 16;
      const Q = E2C.chercher(w, P.x, P.z, 1.5, 5, (x, z) => E2C.haut(w, x, z) > 0.2, 6);
      if (Q && e.dist > 6) { e.proie = Q; e.ph = 'pique'; }
    }
    e.criT = (e.criT ?? 20 + Math.random() * 40) - dt;
    if (e.criT <= 0) { e.criT = 40 + Math.random() * 60; E2C.cri(e, 'piegrieche', c, 60); }
    return true;
  },
  // elle fouille le sol ; elle ouvre sa huppe et se fige quand on la regarde de trop près ; elle chante bas
  huppe(e, dt, w, c) {
    const fuir = e.dist < e.cfg.flee * (c.crouch ? 0.5 : 1) * (c.sprint ? 1.4 : 1);
    e.alerte = !(e.flyT > 0) && e.dist < 20;
    e.chantT = (e.chantT ?? 6 + Math.random() * 25) - dt;
    if (e.chantT <= 0) { e.chantT = 30 + Math.random() * 60; if (!e.alerte) E2C.cri(e, 'huppe', c, 140); }
    if (e.flyT > 0 || fuir) { e.peck = false; return false; }
    if (e.alerte) { e.move = 0; e.state = 'idle'; e.timer = 2; e.peck = false; e.heading = turnToward(e.heading, Math.atan2(c.px - e.x, c.pz - e.z), dt * 2); return true; }
    e.peck = e.state === 'idle' && Math.sin(c.t * 1.3 + e.seed) > 0.1;
    return false;
  },
  // le jour, il se plaque au sol ; de trop près, il court ; tout près, il vole ; il crie au crépuscule
  oedicneme(e, dt, w, c) {
    const h = E2C.heure(), soir = h >= 18.5 || h < 6.5;
    e.chantT = (e.chantT ?? 4 + Math.random() * 20) - dt;
    if (e.chantT <= 0) { e.chantT = 22 + Math.random() * 45; if (soir && !e.plaque && !e.vol) E2C.cri(e, 'oedicneme', c, 220); }
    if (e.vol) { E2C.voler(e, dt, w); return true; }
    const proche = e.dist < (c.crouch ? 2.2 : 3.4);
    if (proche) {
      if (e.plaque) { e.plaque = false; }
      E2C.envol(e, w, c.px, c.pz, { duree: 4.5, haut: 2.5, v: 8 }); E2C.cri(e, 'oedicneme', c, 80, true);
      return true;
    }
    if (e.state === 'flee') { if (e.plaque) { e.plaque = false; e.y = entities.groundY(w, e, e.x, e.z); } return false; }
    if (e.dist < 9 * (c.crouch ? 0.6 : 1) * (c.sprint ? 1.4 : 1)) {
      if (e.plaque) { e.plaque = false; e.y = entities.groundY(w, e, e.x, e.z); }
      entities.startFlee(e, c.px, c.pz); e.timer = 3.5 + Math.random() * 2;
      return false;
    }
    if (e.dist < 34 && !soir) {
      if (!e.plaque) { e.plaque = true; e.y = entities.groundY(w, e, e.x, e.z) - 0.12; }
      e.move = 0; e.state = 'idle'; e.timer = 2;
      return true;
    }
    if (e.plaque) { e.plaque = false; e.y = entities.groundY(w, e, e.x, e.z); }
    return false;
  },
  // la nuit ; il marche sans se presser, et rentre parfois dans son puits
  minotaure(e, dt, w, c) {
    if (e.creuse > 0) { e.creuse -= dt; e.hidden = true; if (e.creuse <= 0) { e.hidden = false; E2C.poussiere(w, e.x, e.z, 4, [0.78, 0.7, 0.52, 1]); } return true; }
    if (Math.random() < dt * 0.01 && e.dist > 2) { e.creuse = 20 + Math.random() * 30; E2C.poussiere(w, e.x, e.z, 6, [0.78, 0.7, 0.52, 1]); E2C.cri(e, 'terre', c, 8); e.hidden = true; return true; }
    return false;
  },
  // la nuit ; dérangée, elle file vers un arbre ou un rocher, et disparaît
  genette(e, dt, w, c) {
    if (e.cache > 0) { e.cache -= dt; e.hidden = true; if (e.cache <= 0) { e.hidden = false; e.state = 'idle'; e.timer = 2; } return true; }
    if (e.refuge) {
      const r = E2C.vers(e, e.refuge[0], e.refuge[1], e.cfg.run, dt, 8);
      e.y = entities.groundY(w, e, e.x, e.z); e.move = 1; e.run = true; e.phase += dt * 16;
      if (r < 0.5) { e.refuge = null; e.cache = 15 + Math.random() * 20; e.hidden = true; }
      return true;
    }
    if (e.dist < e.cfg.flee * (c.crouch ? 0.5 : 1) * (c.sprint ? 1.4 : 1)) {
      const o = E2C.objet(w, e.x, e.z, 18, E2_REFUGES);
      if (o && Math.hypot(o.x - c.px, o.z - c.pz) > 3) { e.refuge = [o.x, o.z]; if (e.dist < 6) E2C.cri(e, 'genette', c, 20, true); return true; }
    }
    return false;
  },
  // ---- les hauteurs
  // dans les éboulis ; il rentre dans une fente au moindre bruit
  campagnol_neiges(e, dt, w, c) {
    if (e.cache > 0) { e.cache -= dt; e.hidden = true; if (e.cache <= 0) { e.hidden = false; e.state = 'idle'; e.timer = 3; } return true; }
    if (e.dist < 6 * (c.crouch ? 0.5 : 1) * (c.sprint ? 1.6 : 1)) { e.cache = 10 + Math.random() * 18; E2C.cri(e, 'squeak', c, 15, true); e.hidden = true; return true; }
    e.assis = e.state === 'idle' && Math.sin(c.t * 0.45 + e.seed) > 0.4;
    return false;
  },
  // à l'aube, les coqs paradent sur leur place ; le reste du jour, ils picorent ; ils partent dans un fracas d'ailes
  tetras_lyre(e, dt, w, c) {
    E2C.compagnie(e);
    const fuir = e.dist < e.cfg.flee * (c.crouch ? 0.5 : 1) * (c.sprint ? 1.4 : 1);
    if (e.flyT > 0 || fuir) { if (!e.envole) { e.envole = true; e.parade = false; E2C.cri(e, 'ailes', c, 50, true); } return false; }
    e.envole = false;
    const h = E2C.heure(), aube = h >= 4.5 && h < 8.5;
    if (aube && e.dist > 20) {
      e.parade = true; e.move = 0; e.state = 'idle'; e.timer = 2; e.peck = false;
      e.paradeT = (e.paradeT ?? Math.random() * 5) - dt;
      if (e.paradeT <= 0) { e.paradeT = 5 + Math.random() * 9; E2C.cri(e, Math.random() < 0.7 ? 'tetras' : 'tetras_ch', c, 260); }
      if (Math.random() < dt * 0.25) e.heading += (Math.random() - 0.5) * 2.4;
      return true;
    }
    e.parade = false;
    e.peck = e.state === 'idle' && Math.sin(c.t * 0.9 + e.seed) > 0.3;
    return false;
  },
  // la péliade : au soleil du matin, sur les pierres ; elle siffle avant de mordre (la morsure : beasts.snake)
  peliade(e, dt, w, c) {
    if (c.rain > 0.3 || c.night > 0.55) { e.hidden = true; return true; }
    e.hidden = false;
    return false; // (le sifflement et la morsure : beasts.snake, 10-zzcreatures-more.js)
  },
  // la salamandre noire : après la pluie, lente ; rien de plus
  salamandre_noire(e, dt, w, c) { e.move = Math.min(e.move, 0.6); return false; },
  // sur la paroi : il grimpe à petits bonds, en ouvrant ses ailes rouges ; dérangé, il part en voletant
  tichodrome(e, dt, w, c) {
    e.hidden = false;
    if (e.vol) { if (!E2C.voler(e, dt, w)) { e.hx = e.x; e.hz = e.z; } return true; }
    if (e.dist < 10 * (c.crouch ? 0.6 : 1) * (c.sprint ? 1.3 : 1)) {
      const P = E2C.chercher(w, e.x, e.z, 12, 26, (x, z) => E2C.pente(w, x, z) > 0.3 && Math.hypot(x - c.px, z - c.pz) > 14, 16);
      E2C.envol(e, w, c.px, c.pz, P ? { cible: P, haut: 2.5, v: 6 } : { duree: 3, haut: 2.5, v: 6 });
      E2C.cri(e, 'tichodrome', c, 70, true);
      return true;
    }
    e.move = 0; e.state = 'idle'; e.timer = 2;
    e.bondT = (e.bondT ?? 1) - dt;
    if (e.bondT <= 0) {
      e.bondT = 0.6 + Math.random() * 1.6;
      const g = E2C.montee(w, e.x, e.z);
      if (Math.hypot(e.x - e.hx, e.z - e.hz) > 10 || !g) { e.x = e.hx + (Math.random() - 0.5) * 2; e.z = e.hz + (Math.random() - 0.5) * 2; }
      else { e.x += g[0] * 0.22 + (Math.random() - 0.5) * 0.1; e.z += g[1] * 0.22 + (Math.random() - 0.5) * 0.1; e.heading = Math.atan2(g[0], g[1]); }
      e.ailesT = 0.45;
    }
    e.ailesT = Math.max(0, (e.ailesT || 0) - dt);
    const g = E2C.montee(w, e.x, e.z) || [0, 1];
    e.y = w.heightAt(e.x - g[0] * 0.08, e.z - g[1] * 0.08) + 0.03;
    e.paroi = true;
    e.criT = (e.criT ?? 10 + Math.random() * 30) - dt;
    if (e.criT <= 0) { e.criT = 30 + Math.random() * 50; E2C.cri(e, 'tichodrome', c, 80); }
    return true;
  },
  // le grand-duc : sur son rocher ; il chante la nuit ; de jour, il part ; la nuit, il prévient (bec), puis il frappe
  grand_duc(e, dt, w, c) {
    e.hidden = false;
    if (e.vol) { if (!E2C.voler(e, dt, w)) { e.hx = e.x; e.hz = e.z; e.y = w.heightAt(e.x, e.z); } return true; }
    if (e.attaque) {
      const A = e.attaque, p = game.player;
      A.t -= dt; e.fly = 1; e.phase += dt * 6;
      const ey = p.pos[1] + 1.5, r = E2C.vers(e, c.px, c.pz, 9, dt);
      e.y = lerp(e.y, ey, Math.min(1, dt * 5));
      if (!A.fait && (r < 0.7 || A.t <= 0)) {
        A.fait = true;
        if (c.alive && Math.hypot(e.x - c.px, e.z - c.pz) < 1.6) {
          c.hurt(6, e, 'Lacéré par un grand-duc');
          if (typeof corps !== 'undefined' && corps.saigner) corps.saigner(0.04, 'Les serres d’un grand-duc');
          sound.flutter && sound.flutter(1, 0);
        }
        e.attaque = null; e.repos = 90; e.menace = 0;
        const P = E2C.chercher(w, e.x, e.z, 40, 80, (x, z) => E2C.pente(w, x, z) > 0.25 && E2C.haut(w, x, z) > 2, 16);
        E2C.envol(e, w, c.px, c.pz, P ? { cible: P, haut: 6, v: 7 } : { duree: 6, haut: 6, v: 7 });
      }
      return true;
    }
    e.move = 0; e.state = 'idle'; e.timer = 2;
    e.y = w.heightAt(e.x, e.z);
    e.repos = Math.max(0, (e.repos || 0) - dt);
    const h = E2C.heure(), nuit = h >= 19.5 || h < 5.5;
    e.lookY = clamp(angDiff(e.heading, Math.atan2(c.px - e.x, c.pz - e.z)), -1.6, 1.6) * (e.dist < 40 ? 1 : 0);
    e.chantT = (e.chantT ?? 8 + Math.random() * 30) - dt;
    if (e.chantT <= 0) { e.chantT = 35 + Math.random() * 60; if (nuit && e.dist > 9) E2C.cri(e, 'duc', c, 420); }
    // de jour ou au crépuscule : dérangé, il part sans rien dire
    if (!nuit && e.dist < 15 * (c.crouch ? 0.6 : 1)) {
      const P = E2C.chercher(w, e.x, e.z, 40, 80, (x, z) => E2C.pente(w, x, z) > 0.25 && E2C.haut(w, x, z) > 2, 16);
      sound.flutter && sound.flutter(0.7, 0);
      E2C.envol(e, w, c.px, c.pz, P ? { cible: P, haut: 5, v: 7 } : { duree: 6, haut: 5, v: 7 });
      return true;
    }
    // la nuit, près de son rocher : il fait face, ouvre ses ailes, fait claquer son bec ; qui reste, il le frappe
    if (nuit && c.alive && !c.inside && !c.riding && !(e.repos > 0)) {
      if (e.dist < 9) {
        if (!e.menace) { e.menace = 2.8; E2C.cri(e, 'bec', c, 30, true); }
        else e.menace = Math.max(0.001, e.menace - dt);
        e.heading = turnToward(e.heading, Math.atan2(c.px - e.x, c.pz - e.z), dt * 3);
        if ((e.menace <= 0.001 && e.dist < 3.5) || e.dist < 1.7) e.attaque = { t: 1.2, fait: false };
      } else if (e.dist > 14) e.menace = 0;
    } else if (e.dist > 14) e.menace = 0;
    return true;
  },
  // ---- le lac
  // sur l'eau, en petite troupe ; elle plonge un instant ; dérangée, elle court sur l'eau
  foulque(e, dt, w, c) {
    e.hidden = false;
    if (e.plonge > 0) { e.plonge -= dt; e.hidden = true; if (e.plonge <= 0) { e.hidden = false; E2C.gerbe(w, e.x, e.z, 3, 0.4); } return true; }
    if (e.course > 0) {
      e.course -= dt; e.fly = 1; e.phase += dt * 12;
      entities.stepMove(e, dt, w, 4);
      e.gerbeT = (e.gerbeT || 0) - dt;
      if (e.gerbeT <= 0) { e.gerbeT = 0.09; E2C.gerbe(w, e.x - Math.sin(e.heading) * 0.2, e.z - Math.cos(e.heading) * 0.2, 2, 0.6); }
      if (e.course <= 0) { e.fly = 0; e.state = 'idle'; e.timer = 2; e.repos = 6; }
      return true;
    }
    e.fly = 0;
    e.repos = Math.max(0, (e.repos || 0) - dt);
    if (e.dist < 11 * (c.crouch ? 0.6 : 1) && !(e.repos > 0)) {
      e.course = 2.2 + Math.random() * 1.6; e.heading = Math.atan2(e.x - c.px, e.z - c.pz) + (Math.random() - 0.5) * 0.6;
      E2C.cri(e, 'eau_course', c, 60, true);
      return true;
    }
    e.chantT = (e.chantT ?? 4 + Math.random() * 20) - dt;
    if (e.chantT <= 0) { e.chantT = 12 + Math.random() * 30; E2C.cri(e, 'foulque', c, 110); }
    if (Math.random() < dt * 0.015) { e.plonge = 2 + Math.random() * 2.5; E2C.gerbe(w, e.x, e.z, 2, 0.4); e.hidden = true; return true; }
    E2C.nager(e, dt, w);
    return true;
  },
  // au bord de l'eau, la queue qui hoche ; dérangé, il part au ras de l'eau en criant, et se repose plus loin
  guignette(e, dt, w, c) {
    e.hidden = false;
    if (e.vol) { E2C.voler(e, dt, w); return true; }
    if (e.dist < 9 * (c.crouch ? 0.6 : 1) * (c.sprint ? 1.3 : 1)) {
      const P = E2C.chercher(w, e.x, e.z, 16, 38, (x, z) => E2C.berge(w, x, z) && Math.hypot(x - c.px, z - c.pz) > 14, 18);
      E2C.envol(e, w, c.px, c.pz, P ? { cible: P, haut: 0.6, v: 6 } : { duree: 3, haut: 0.8, v: 6 });
      E2C.cri(e, 'guignette', c, 90, true);
      return true;
    }
    e.hoche = true;
    e.criT = (e.criT ?? 10 + Math.random() * 30) - dt;
    if (e.criT <= 0) { e.criT = 40 + Math.random() * 60; E2C.cri(e, 'guignette', c, 80); }
    return false;
  },
  // le rat d'eau : il mange assis ; au moindre bruit, un « plouf », et un sillage
  campagnol_amphibie(e, dt, w, c) {
    if (e.cache > 0) {
      e.cache -= dt; e.hidden = true;
      if (e.cache <= 0) {
        e.hidden = false;
        const P = E2C.chercher(w, e.hx, e.hz, 0, 8, (x, z) => E2C.berge(w, x, z), 12);
        if (P) { e.x = P[0]; e.z = P[1]; e.y = entities.groundY(w, e, e.x, e.z); }
        e.state = 'idle'; e.timer = 3;
      }
      return true;
    }
    if (e.dist < 7 * (c.crouch ? 0.5 : 1) * (c.sprint ? 1.5 : 1)) {
      e.cache = 12 + Math.random() * 20; E2C.cri(e, 'plouf', c, 22, true);
      const P = E2C.chercher(w, e.x, e.z, 0.5, 4, (x, z) => E2C.eau(w, x, z), 8);
      if (P) E2C.gerbe(w, P[0], P[1], 4, 0.5);
      e.hidden = true;
      return true;
    }
    e.assis = e.state === 'idle';
    return false;
  },
  // la vipérine : menacée, elle se dresse, siffle, fait mine de mordre ; puis elle file à l'eau
  couleuvre_viperine(e, dt, w, c) {
    if (e.cache > 0) {
      e.cache -= dt; e.hidden = true;
      if (e.cache <= 0) { e.hidden = false; const P = E2C.chercher(w, e.hx, e.hz, 0, 6, (x, z) => E2C.berge(w, x, z), 10); if (P) { e.x = P[0]; e.z = P[1]; e.y = entities.groundY(w, e, e.x, e.z); } }
      return true;
    }
    if (e.dist < 3.2 && c.alive) {
      if (!e.menaceT) { e.menaceT = 2.5 + Math.random(); E2C.cri(e, 'siffle', c, 15, true); }
      e.raise = true; e.move = 0; e.state = 'idle'; e.timer = 2;
      e.heading = turnToward(e.heading, Math.atan2(c.px - e.x, c.pz - e.z), dt * 4);
      e.menaceT = Math.max(0.001, e.menaceT - dt);
      // « elle ne mord pas, ou si peu »
      if (e.dist < 0.9 && !c.crouch && !e.pince && game.player.hp > 8 && Math.random() < dt * 0.6) { e.pince = true; c.hurt(1, e, 'Mordu par une couleuvre'); }
      if (e.menaceT <= 0.001) {
        e.menaceT = 0; e.raise = false; e.cache = 10 + Math.random() * 12; e.hidden = true;
        const P = E2C.chercher(w, e.x, e.z, 0.5, 4, (x, z) => E2C.eau(w, x, z), 8);
        if (P) { E2C.gerbe(w, P[0], P[1], 3, 0.4); E2C.cri(e, 'plouf', c, 15, true); }
      }
      return true;
    }
    e.raise = false; e.menaceT = 0;
    return false;
  },
  // l'oie cendrée : la troupe paît sur la berge ; la sentinelle crie ; on gagne l'eau ; de trop près, tout s'envole
  oie_cendree(e, dt, w, c) {
    e.hidden = false;
    const G = e.groupe || [e], S = G[0], WL = w.waterLevel;
    const alerte = c.crouch ? 20 : 36, envol = c.crouch ? 10 : 17;
    // l'envol de la troupe
    if (e.vol2) {
      const V = e.vol2;
      V.t += dt; e.fly = 1; e.peck = false; e.grazeT = 0;
      const k = G.indexOf(e), cote = k % 2 ? 1 : -1, rang = Math.ceil(k / 2);
      V.a += dt * V.s;
      const cx = V.cx + Math.sin(V.a) * V.R, cz = V.cz + Math.cos(V.a) * V.R;
      const tx = cx - Math.sin(V.a + V.s * 1.57) * rang * 2.2 + Math.cos(V.a) * cote * rang * 2.2, tz = cz - Math.cos(V.a + V.s * 1.57) * rang * 2.2 - Math.sin(V.a) * cote * rang * 2.2;
      if (V.pose) {
        const r = E2C.vers(e, V.pose[0] + cote * rang * 1.6, V.pose[1] + rang * 1.4, 9, dt, 3);
        e.y = lerp(e.y, WL + 0.1 + Math.min(14, r * 0.25), Math.min(1, dt * 1.5));
        if (r < 0.6) { e.vol2 = null; e.fly = 0; e.nage = true; e.y = WL - e.h * 0.25; e.nageT = 60 + Math.random() * 60; }
        return true;
      }
      E2C.vers(e, tx, tz, 11, dt, 2.5);
      e.y = lerp(e.y, Math.max(w.heightAt(e.x, e.z), WL) + V.H + rang * 0.6, Math.min(1, dt * 0.9));
      if (V.t > V.T && S === e) {
        const P = E2C.chercher(w, V.cx, V.cz, 20, V.R + 30, (x, z) => E2C.eau(w, x, z) && w.heightAt(x + 4, z) < WL - 0.35 && Math.hypot(x - c.px, z - c.pz) > 60, 24);
        if (P) for (const q of G) if (q.vol2) q.vol2.pose = P;
        else V.T += 10;
      }
      if (V.t > V.T + 30 && !V.pose) { const P = [V.cx, V.cz]; for (const q of G) if (q.vol2) q.vol2.pose = P; }
      return true;
    }
    if (e.dist < envol && !G.some((q) => q.vol2)) {
      // toute la troupe part (en criant)
      const cx = e.hx, cz = e.hz, R = 70 + Math.random() * 40, s = (Math.random() < 0.5 ? 1 : -1) * 0.09, T = 25 + Math.random() * 20;
      for (const q of G) if (!q.dead && !q.hidden) { q.vol2 = { t: 0, T, a: Math.atan2(q.x - cx, q.z - cz), s, R, cx, cz, H: 12 + Math.random() * 4, pose: null }; q.nage = false; q.versEau = null; }
      E2C.cri(S, 'oie', c, 200, true); E2C.cri(e, 'ailes', c, 60, true);
      return true;
    }
    // sur l'eau
    if (e.nage) {
      e.fly = 0; e.grazeT = 0; e.peck = false;
      e.y = WL - e.h * 0.25;
      e.nageT = (e.nageT || 60) - dt;
      if (!e.cibleN || Math.random() < dt * 0.05) e.cibleN = E2C.chercher(w, e.x, e.z, 2, 10, (x, z) => E2C.eau(w, x, z), 8);
      if (e.cibleN) { const r = E2C.vers(e, e.cibleN[0], e.cibleN[1], 0.4, dt, 1.5); e.move = r > 0.3 ? 1 : 0; e.phase += dt * 2; if (r < 0.3) e.cibleN = null; }
      // revenir paître, si l'homme est loin depuis longtemps
      if (e.nageT <= 0 && S === e && e.dist > 70) {
        const P = E2C.chercher(w, e.hx, e.hz, 0, 25, (x, z) => E2C.berge(w, x, z), 20);
        if (P) for (const q of G) { q.nage = false; q.versTerre = [P[0] + (Math.random() - 0.5) * 6, P[1] + (Math.random() - 0.5) * 6]; }
        else e.nageT = 30;
      }
      return true;
    }
    if (e.versTerre) {
      const r = E2C.vers(e, e.versTerre[0], e.versTerre[1], 0.6, dt, 2);
      const h = w.heightAt(e.x, e.z);
      e.y = h < WL - 0.1 ? WL - e.h * 0.25 : w.groundAt(e.x, e.z, h + 0.6, 0.6);
      e.move = 1; e.phase += dt * 3;
      if (r < 0.4) { e.versTerre = null; e.state = 'idle'; e.timer = 2; }
      return true;
    }
    // l'alarme : la sentinelle crie ; tout le monde gagne l'eau
    if (e.versEau) {
      const r = E2C.vers(e, e.versEau[0], e.versEau[1], 1.6, dt, 3);
      const h = w.heightAt(e.x, e.z);
      e.y = h < WL - 0.1 ? WL - e.h * 0.25 : w.groundAt(e.x, e.z, h + 0.6, 0.6);
      e.move = 1; e.run = true; e.phase += dt * 6; e.grazeT = 0;
      if (r < 0.3 || h < WL - 0.35) { e.versEau = null; e.nage = true; e.nageT = 40 + Math.random() * 40; }
      return true;
    }
    S.alerteT = Math.max(0, (S.alerteT || 0) - dt / G.length);
    if (e.dist < alerte && !(S.alerteT > 0) && !G.some((q) => q.versEau || q.nage)) {
      S.alerteT = 20;
      E2C.cri(S, 'oie', c, 160, true);
      for (const q of G) {
        if (q.dead) continue;
        const P = E2C.chercher(w, q.x, q.z, 3, 22, (x, z) => E2C.eau(w, x, z) && Math.hypot(x - c.px, z - c.pz) > Math.hypot(q.x - c.px, q.z - c.pz), 16);
        if (P) q.versEau = P;
      }
      return true;
    }
    // paître (la sentinelle garde le cou levé)
    e.fly = 0;
    e.peck = e !== S && e.state === 'idle' && Math.sin(c.t * 0.8 + e.seed) > -0.2;
    e.criT = (e.criT ?? 20 + Math.random() * 40) - dt;
    if (e.criT <= 0 && e === S) { e.criT = 40 + Math.random() * 70; E2C.cri(e, 'oie', c, 140); }
    return false;
  },
  // le harle : il plonge longtemps et ressort loin ; de trop près, il part au ras de l'eau
  harle(e, dt, w, c) {
    e.hidden = false;
    if (e.vol) { E2C.voler(e, dt, w); return true; }
    if (e.plonge > 0) {
      e.plonge -= dt; e.hidden = true;
      if (e.plonge <= 0) {
        e.hidden = false;
        const P = E2C.chercher(w, e.x, e.z, 8, 25, (x, z) => E2C.eau(w, x, z) && Math.hypot(x - c.px, z - c.pz) > 12, 12);
        if (P) { e.x = P[0]; e.z = P[1]; }
        e.y = w.waterLevel - e.h * 0.25;
        E2C.gerbe(w, e.x, e.z, 2, 0.4);
      }
      return true;
    }
    if (e.dist < 15 * (c.crouch ? 0.6 : 1) * (c.sprint ? 1.3 : 1)) {
      const P = E2C.chercher(w, e.x, e.z, 50, 100, (x, z) => E2C.eau(w, x, z) && Math.hypot(x - c.px, z - c.pz) > 40, 16);
      E2C.envol(e, w, c.px, c.pz, P ? { cible: P, haut: 2.2, v: 12, eau: true } : { duree: 5, haut: 2.5, v: 12, eau: true });
      E2C.cri(e, 'harle', c, 60, true); E2C.gerbe(w, e.x, e.z, 5, 0.6);
      return true;
    }
    if (Math.random() < dt * 0.03) { e.plonge = 8 + Math.random() * 8; E2C.gerbe(w, e.x, e.z, 2, 0.4); e.hidden = true; return true; }
    e.criT = (e.criT ?? 30 + Math.random() * 60) - dt;
    if (e.criT <= 0) { e.criT = 60 + Math.random() * 90; E2C.cri(e, 'harle', c, 60); }
    E2C.nager(e, dt, w);
    return true;
  },
  // le cormoran : il nage enfoncé, plonge longtemps ; il va sécher ses ailes sur une pierre de la rive, en croix
  cormoran(e, dt, w, c) {
    e.hidden = false;
    if (e.vol) {
      if (!E2C.voler(e, dt, w)) {
        if (e.versPerche) { e.versPerche = false; e.perche = true; e.secheT = 40 + Math.random() * 50; e.y = w.heightAt(e.x, e.z); e.heading = Math.random() * TAU; }
      }
      if (e.versPerche && e.vol) e.vol.eau = false;
      return true;
    }
    if (e.perche) {
      e.seche = true; e.move = 0; e.fly = 0; e.state = 'idle'; e.timer = 2;
      e.y = Math.max(w.heightAt(e.x, e.z), w.waterLevel);
      e.secheT -= dt;
      e.criT = (e.criT ?? 10 + Math.random() * 20) - dt;
      if (e.criT <= 0) { e.criT = 30 + Math.random() * 40; E2C.cri(e, 'cormoran', c, 50); }
      if (e.dist < 14 * (c.crouch ? 0.6 : 1) || e.secheT <= 0) {
        e.perche = false; e.seche = false;
        const P = E2C.chercher(w, e.x, e.z, 20, 70, (x, z) => E2C.eau(w, x, z) && w.heightAt(x + 3, z) < w.waterLevel - 0.35 && Math.hypot(x - c.px, z - c.pz) > 25, 18);
        if (e.dist < 14) E2C.cri(e, 'ailes', c, 60, true);
        E2C.envol(e, w, c.px, c.pz, P ? { cible: P, haut: 3, v: 10, eau: true } : { duree: 5, haut: 3, v: 10, eau: true });
      }
      return true;
    }
    e.seche = false;
    if (e.plonge > 0) {
      e.plonge -= dt; e.hidden = true;
      if (e.plonge <= 0) { e.hidden = false; const P = E2C.chercher(w, e.x, e.z, 5, 18, (x, z) => E2C.eau(w, x, z), 12); if (P) { e.x = P[0]; e.z = P[1]; } e.y = w.waterLevel - e.h * 0.25; E2C.gerbe(w, e.x, e.z, 2, 0.4); }
      return true;
    }
    if (e.dist < 12 * (c.crouch ? 0.6 : 1)) { e.plonge = 10 + Math.random() * 10; E2C.gerbe(w, e.x, e.z, 3, 0.5); e.hidden = true; return true; }
    if (Math.random() < dt * 0.02) { e.plonge = 10 + Math.random() * 12; E2C.gerbe(w, e.x, e.z, 2, 0.4); e.hidden = true; return true; }
    e.percheT = (e.percheT ?? 30 + Math.random() * 60) - dt;
    if (e.percheT <= 0) {
      e.percheT = 70 + Math.random() * 90;
      const o = E2C.objet(w, e.hx, e.hz, 55, E2_PIERRES);
      let P = o && E2C.haut(w, o.x, o.z) > 0.05 && E2C.haut(w, o.x, o.z) < 3 ? [o.x, o.z] : null;
      if (!P) P = E2C.chercher(w, e.hx, e.hz, 4, 40, (x, z) => E2C.berge(w, x, z) && E2C.pente(w, x, z) < 0.4, 20);
      if (P && Math.hypot(P[0] - c.px, P[1] - c.pz) > 25) { e.versPerche = true; E2C.envol(e, w, c.px, c.pz, { cible: P, haut: 3, v: 9 }); return true; }
    }
    E2C.nager(e, dt, w);
    return true;
  },
  // le vison : il court le long de la berge ; de trop près, il plonge et reparaît bien plus loin
  vison(e, dt, w, c) {
    if (e.cache > 0) {
      e.cache -= dt; e.hidden = true;
      if (e.cache <= 0) {
        e.hidden = false;
        const P = E2C.chercher(w, e.hx, e.hz, 8, 30, (x, z) => E2C.berge(w, x, z) && Math.hypot(x - c.px, z - c.pz) > 15, 16);
        if (P) { e.x = P[0]; e.z = P[1]; e.y = entities.groundY(w, e, e.x, e.z); }
        e.state = 'idle'; e.timer = 2;
      }
      return true;
    }
    if (e.dist < 10 * (c.crouch ? 0.6 : 1) * (c.sprint ? 1.4 : 1)) {
      e.cache = 20 + Math.random() * 20; e.hidden = true; E2C.cri(e, 'plouf', c, 25, true);
      const P = E2C.chercher(w, e.x, e.z, 0.5, 5, (x, z) => E2C.eau(w, x, z), 8);
      if (P) E2C.gerbe(w, P[0], P[1], 4, 0.5);
      return true;
    }
    return false;
  },
};

// ---------------------------------------------------------------- les bêtes qui volent (conduite entière)
const E2_VOL = {
  // le busard : au ras de la lande, en larges balancements ; il se laisse tomber sur une proie, et repart
  busard_sm(e, dt, w, c) {
    if (E2C.partirVol(e, dt)) return;
    e.hidden = false;
    const sol = Math.max(w.heightAt(e.x, e.z), w.waterLevel);
    if (e.pique) {
      const P = e.pique;
      P.t += dt;
      if (P.t < 1.6) { e.fly = 1; E2C.vers(e, P.x, P.z, 4, dt, 3); e.y = lerp(e.y, w.heightAt(P.x, P.z) + 0.1, Math.min(1, dt * 2.5)); }
      else if (P.t < 4.8) { e.fly = 0; e.y = w.heightAt(e.x, e.z); }
      else { e.fly = 1; e.x += Math.sin(e.heading) * dt * 4; e.z += Math.cos(e.heading) * dt * 4; e.y += dt * 2.5; if (e.y > sol + 3.5) e.pique = null; }
      return;
    }
    e.fly = 1;
    e.cibleT = (e.cibleT || 0) - dt;
    if (!e.cible || e.cibleT <= 0 || Math.hypot(e.cible[0] - e.x, e.cible[1] - e.z) < 6) {
      const loin = e.dist < 28;
      e.cible = E2C.chercher(w, e.hx, e.hz, 15, 70, (x, z) => !loin || Math.hypot(x - c.px, z - c.pz) > 35, 10) || [e.hx, e.hz];
      e.cibleT = 8 + Math.random() * 7;
    }
    e.heading = turnToward(e.heading, Math.atan2(e.cible[0] - e.x, e.cible[1] - e.z), dt * 0.9);
    const v = 6.5;
    e.x += Math.sin(e.heading) * v * dt; e.z += Math.cos(e.heading) * v * dt;
    e.y = Math.max(sol + 1.5, lerp(e.y, sol + 4 + Math.sin(c.t * 0.35 + e.seed) * 1.6, Math.min(1, dt * 0.8)));
    e.piqueT = (e.piqueT ?? 20 + Math.random() * 30) - dt;
    if (e.piqueT <= 0 && e.dist > 25) { e.piqueT = 30 + Math.random() * 40; e.pique = { t: 0, x: e.x + Math.sin(e.heading) * 6, z: e.z + Math.cos(e.heading) * 6 }; }
    if (e.dist < 30) { e.criT = (e.criT ?? 0) - dt; if (e.criT <= 0) { e.criT = 50 + Math.random() * 40; E2C.cri(e, 'busard', c, 80, true); } }
  },
  // le sphinx : un vol rapide et heurté, la nuit, au ras de la bruyère ; la lanterne l'attire ; il crie de près
  sphinx_tete_mort(e, dt, w, c) {
    if (E2C.partirVol(e, dt)) return;
    e.hidden = false; e.fly = 1;
    const sol = w.heightAt(e.x, e.z), p = game.player;
    const lanterne = c.lantern && c.night > 0.4 && e.dist < 45 && !c.inside;
    let tx, ty, tz, v;
    if (lanterne) {
      const ey = p.eyePos ? p.eyePos() : [c.px, sol + 1.6, c.pz];
      e.ang = (e.ang || Math.random() * TAU) + dt * (2.2 + Math.sin(c.t * 0.7 + e.seed) * 0.8);
      const r = 0.8 + Math.sin(c.t * 1.9 + e.seed) * 0.35;
      tx = ey[0] + Math.sin(e.ang) * r; tz = ey[2] + Math.cos(e.ang) * r; ty = ey[1] - 0.25 + Math.sin(c.t * 3.3 + e.seed) * 0.3; v = 4.5;
    } else {
      e.cibleT = (e.cibleT || 0) - dt;
      if (!e.cible || e.cibleT <= 0) { e.cible = [e.hx + (Math.random() - 0.5) * 12, 0.5 + Math.random() * 2.2, e.hz + (Math.random() - 0.5) * 12]; e.cibleT = 0.35 + Math.random() * 0.6; }
      tx = e.cible[0]; tz = e.cible[2]; ty = w.heightAt(tx, tz) + e.cible[1]; v = 4;
    }
    const dx = tx - e.x, dy = ty - e.y, dz = tz - e.z, d = Math.hypot(dx, dy, dz) || 1, s = Math.min(d, v * dt);
    e.x += dx / d * s + (Math.random() - 0.5) * dt * 1.5; e.z += dz / d * s + (Math.random() - 0.5) * dt * 1.5; e.y = Math.max(sol + 0.2, e.y + dy / d * s);
    e.heading = turnToward(e.heading, Math.atan2(dx, dz), dt * 10);
    e.cT = Math.max(0, (e.cT || 0) - dt);
    if (e.dist < 1.8 && e.cT <= 0) { e.cT = 4 + Math.random() * 5; E2C.cri(e, 'sphinx', c, 12, true); }
  },
  // l'apollon : il plane au-dessus des éboulis fleuris, se pose ; il fuit qui approche vite, et s'en va s'il a trop peur
  apollon(e, dt, w, c) {
    if (E2C.partirVol(e, dt)) return;
    e.hidden = false;
    const sol = w.heightAt(e.x, e.z);
    if (c.rain > 0.15 || c.night > 0.45) e.e2part = true;
    const alerte = c.crouch ? 1.6 : c.sprint ? 6 : 3.2;
    if (e.dist < alerte && !(e.fuite > 0)) {
      e.fuite = 3; e.peur = (e.peur || 0) + 1; e.pose = 0;
      const a = Math.atan2(e.x - c.px, e.z - c.pz) + (Math.random() - 0.5) * 1.2, d = 6 + Math.random() * 6;
      e.hx = e.x + Math.sin(a) * d; e.hz = e.z + Math.cos(a) * d; e.cible = null;
      if (e.peur > 5) { e.e2part = true; e.heading = a; return; }
    }
    e.fuite = Math.max(0, (e.fuite || 0) - dt);
    if (e.pose > 0) { e.pose -= dt; e.fly = 0; e.y = sol + 0.22; return; }
    e.fly = 1;
    e.cibleT = (e.cibleT || 0) - dt;
    if (!e.cible || e.cibleT <= 0) {
      const r = e.fuite > 0 ? 3 : 2.2;
      e.cible = [e.hx + (Math.random() - 0.5) * r * 2, sol + (e.fuite > 0 ? 1.5 + Math.random() * 1.5 : 0.4 + Math.random() * 1.3), e.hz + (Math.random() - 0.5) * r * 2];
      e.cibleT = 0.9 + Math.random() * 1.4;
      if (!(e.fuite > 0) && Math.random() < 0.14) e.pose = 3 + Math.random() * 5;
      if (!(e.fuite > 0)) { e.hx += (Math.random() - 0.5) * 2; e.hz += (Math.random() - 0.5) * 2; }
    }
    const [tx, ty, tz] = e.cible, dx = tx - e.x, dy = ty - e.y, dz = tz - e.z, d = Math.hypot(dx, dy, dz) || 1;
    const v = (e.fuite > 0 ? 3 : 1.0) * dt;
    e.x += dx / d * Math.min(v, d); e.z += dz / d * Math.min(v, d);
    e.y = Math.max(sol + 0.2, e.y + dy / d * Math.min(v, d) + Math.sin(c.t * 4 + e.seed) * dt * 0.25);
    e.heading = turnToward(e.heading, Math.atan2(dx, dz), dt * 5);
  },
  // les vautours : ils tournent très haut, par bande ; une bête morte dans les parages, et ils descendent
  vautour_fauve(e, dt, w, c) {
    if (E2C.partirVol(e, dt)) return;
    e.hidden = false;
    const G = e.groupe || [e], L = G.find((q) => !q.dead && !q.removed) || e;
    if (L === e) { e.cureeT = (e.cureeT || 0) - dt; if (e.cureeT <= 0) { e.cureeT = 5; e.curee = E2C.charogne(e.hx, e.hz, 420); } }
    const cur = L.curee && !L.curee.removed && L.curee.corpse ? L.curee : null;
    const k = G.indexOf(e);
    if (cur) {
      const dh = Math.hypot(c.px - cur.x, c.pz - cur.z), solC = w.heightAt(cur.x, cur.z);
      if (e.sol) {
        if (dh < 18 * (c.crouch ? 0.6 : 1)) { e.sol = false; e.decolle = 6; E2C.cri(e, 'ailes', c, 80, true); }
        else {
          e.fly = 0; e.y = w.heightAt(e.x, e.z); e.peck = Math.sin(c.t * 1.6 + e.seed) > -0.2;
          e.heading = turnToward(e.heading, Math.atan2(cur.x - e.x, cur.z - e.z), dt * 2);
          e.grT = (e.grT ?? 5 + Math.random() * 10) - dt;
          if (e.grT <= 0) { e.grT = 8 + Math.random() * 14; E2C.cri(e, 'vautour', c, 60); }
          return;
        }
      }
      e.fly = 1; e.peck = false;
      e.decolle = Math.max(0, (e.decolle || 0) - dt);
      e.flyA = (e.flyA ?? k * 1.3) + dt * 0.22;
      const descend = dh > 40 && !(e.decolle > 0);
      const R = descend ? Math.max(3, 30 - (e.desc || 0) * 1.2) : 35, H = descend ? Math.max(0, 40 - (e.desc || 0) * 2.5) : 45;
      if (descend) e.desc = (e.desc || 0) + dt; else e.desc = Math.max(0, (e.desc || 0) - dt * 2);
      const tx = cur.x + Math.cos(e.flyA) * (R + k * 1.5), tz = cur.z + Math.sin(e.flyA) * (R + k * 1.5);
      E2C.vers(e, tx, tz, 9, dt, 2);
      e.y = lerp(e.y, solC + H + 0.2, Math.min(1, dt * 0.7));
      if (descend && e.y < solC + 1.2 && Math.hypot(e.x - cur.x, e.z - cur.z) < 6) {
        e.sol = true; e.fly = 0;
        const a = k * 1.9 + e.seed;
        e.x = cur.x + Math.cos(a) * (1.6 + k * 0.4); e.z = cur.z + Math.sin(a) * (1.6 + k * 0.4); e.y = w.heightAt(e.x, e.z);
      }
      return;
    }
    e.sol = false; e.peck = false; e.fly = 1; e.desc = 0;
    if (e.flyR === undefined) { e.flyR = 55 + Math.random() * 35; e.flyH = 55 + Math.random() * 35; e.flyS = (Math.random() < 0.5 ? 1 : -1) * (0.05 + Math.random() * 0.03); e.flyA = Math.random() * TAU; }
    e.flyA += e.flyS * dt;
    const cx = e.hx + Math.sin(c.t * 0.02 + e.seed) * 30, cz = e.hz + Math.cos(c.t * 0.017 + e.seed) * 30;
    const nx = cx + Math.cos(e.flyA) * e.flyR, nz = cz + Math.sin(e.flyA) * e.flyR;
    e.heading = Math.atan2(nx - e.x, nz - e.z);
    e.x = lerp(e.x, nx, Math.min(1, dt * 0.8)); e.z = lerp(e.z, nz, Math.min(1, dt * 0.8));
    const base = w.heightAt(e.hx, e.hz);
    e.y = Math.max(w.heightAt(e.x, e.z) + 8, lerp(e.y, Math.max(base, w.heightAt(e.x, e.z) + 25) + e.flyH + Math.sin(c.t * 0.1 + e.seed) * 4, Math.min(1, dt * 0.4)));
  },
  // le gypaète : il longe les falaises ; il monte avec un os et le laisse tomber sur les rochers, puis descend le manger
  gypaete(e, dt, w, c) {
    if (E2C.partirVol(e, dt)) return;
    e.hidden = false;
    // l'ossuaire : une dalle de pierre presque plate au pied de sa falaise (toujours la même : tirée de son territoire)
    if (!e.ossuaire) {
      const T = e.terr;
      if (T && T.ossuaire) e.ossuaire = T.ossuaire;
      else {
        let h = 0x9E3779B9;
        const cle = (T && T.cle) || 'gypaete';
        for (let i = 0; i < cle.length; i++) h = Math.imul(h ^ cle.charCodeAt(i), 0x01000193);
        const rnd = mulberry32(h >>> 0);
        let P = null;
        for (let k = 0; k < 40 && !P; k++) { const a = rnd() * TAU, d = 8 + rnd() * 45, x = e.hx + Math.sin(a) * d, z = e.hz + Math.cos(a) * d; if (w.inside(x, z, 10) && E2C.pente(w, x, z) < 0.22 && E2C.haut(w, x, z) > 2) P = [x, z]; }
        e.ossuaire = P || [e.hx, e.hz];
        if (T) T.ossuaire = e.ossuaire;
      }
    }
    const O = e.ossuaire, solO = w.heightAt(O[0], O[1]);
    if (e.ph === 'monte') {
      e.fly = 1;
      E2C.vers(e, O[0] + Math.cos(c.t * 0.3) * 4, O[1] + Math.sin(c.t * 0.3) * 4, 8, dt, 1.5);
      e.y = lerp(e.y, solO + 38, Math.min(1, dt * 0.5));
      if (Math.hypot(e.x - O[0], e.z - O[1]) < 8 && e.y > solO + 30) {
        e.ph = 'attend'; e.attT = 3;
        E2C.os.push({ x: e.x, y: e.y - 0.4, z: e.z, vy: 0, vx: Math.sin(e.heading) * 2, vz: Math.cos(e.heading) * 2, rot: 0, gyp: e });
      }
      return;
    }
    if (e.ph === 'attend') { e.fly = 1; e.flyA = (e.flyA || 0) + dt * 0.3; E2C.vers(e, O[0] + Math.cos(e.flyA) * 10, O[1] + Math.sin(e.flyA) * 10, 7, dt, 1.5); e.attT -= dt; if (e.attT <= 0) e.ph = 'descend'; return; }
    if (e.ph === 'descend') {
      e.fly = 1;
      const r = E2C.vers(e, O[0] + 1.5, O[1] + 1.5, 7, dt, 2);
      e.y = Math.max(w.heightAt(e.x, e.z) + 0.4, lerp(e.y, solO + Math.min(20, r * 0.6), Math.min(1, dt * 0.9)));
      if (r < 0.8 && e.y < solO + 1.5) { e.ph = 'mange'; e.mangeT = 18 + Math.random() * 20; e.fly = 0; e.y = w.heightAt(e.x, e.z); }
      if (e.dist < 30) e.ph = null;
      return;
    }
    if (e.ph === 'mange') {
      e.fly = 0; e.y = w.heightAt(e.x, e.z); e.peck = Math.sin(c.t * 1.2 + e.seed) > 0.2;
      e.mangeT -= dt;
      if (e.mangeT <= 0 || e.dist < 35 * (c.crouch ? 0.6 : 1)) { e.ph = null; e.peck = false; E2C.cri(e, 'ailes', c, 80, true); }
      return;
    }
    e.ph = null; e.fly = 1; e.peck = false;
    if (e.flyR === undefined) { e.flyR = 60 + Math.random() * 40; e.flyH = 30 + Math.random() * 25; e.flyS = (Math.random() < 0.5 ? 1 : -1) * 0.07; e.flyA = Math.random() * TAU; }
    e.flyA += e.flyS * dt;
    const nx = e.hx + Math.cos(e.flyA) * e.flyR, nz = e.hz + Math.sin(e.flyA) * e.flyR;
    e.heading = Math.atan2(nx - e.x, nz - e.z);
    e.x = lerp(e.x, nx, Math.min(1, dt * 0.8)); e.z = lerp(e.z, nz, Math.min(1, dt * 0.8));
    e.y = Math.max(w.heightAt(e.x, e.z) + 6, lerp(e.y, w.heightAt(e.x, e.z) + e.flyH + Math.sin(c.t * 0.13 + e.seed) * 5, Math.min(1, dt * 0.5)));
    e.osT = (e.osT ?? 25 + Math.random() * 40) - dt;
    if (e.osT <= 0) { e.osT = 120 + Math.random() * 150; if (e.dist < 220 && e.dist > 35 && E2C.osSol.length < 3) e.ph = 'monte'; }
    e.criT = (e.criT ?? 60 + Math.random() * 120) - dt;
    if (e.criT <= 0) { e.criT = 120 + Math.random() * 180; E2C.cri(e, 'gypaete', c, 160); }
  },
  // les mouettes : elles tournent au-dessus du lac en riant, se posent sur l'eau un moment, et repartent
  mouette(e, dt, w, c) {
    if (E2C.partirVol(e, dt)) return;
    e.hidden = false;
    const WL = w.waterLevel, G = e.groupe || [e];
    if (e.flyR === undefined) { e.flyR = 14 + Math.random() * 22; e.flyH = 5 + Math.random() * 8; e.flyS = (Math.random() < 0.5 ? 1 : -1) * (0.22 + Math.random() * 0.15); e.flyA = Math.random() * TAU; }
    if (e.flotte > 0) {
      e.flotte -= dt; e.fly = 0; e.y = WL - 0.04;
      e.x += Math.sin(c.t * 0.07 + e.seed) * dt * 0.15; e.z += Math.cos(c.t * 0.05 + e.seed) * dt * 0.15;
      if (e.dist < 12 || !E2C.eau(w, e.x, e.z)) { e.flotte = 0; E2C.cri(e, 'mouette', c, 80, true); }
      return;
    }
    e.fly = 1;
    if (e.pose) {
      const r = E2C.vers(e, e.pose[0], e.pose[1], 6, dt, 3);
      e.y = lerp(e.y, WL + Math.min(8, r * 0.4), Math.min(1, dt * 1.2));
      if (r < 0.4) { e.pose = null; e.flotte = 20 + Math.random() * 45; e.y = WL - 0.04; }
      return;
    }
    e.flyA += e.flyS * dt;
    const cx = e.hx + Math.sin(c.t * 0.04 + e.seed) * 20, cz = e.hz + Math.cos(c.t * 0.03 + e.seed) * 20;
    const nx = cx + Math.cos(e.flyA) * e.flyR, nz = cz + Math.sin(e.flyA) * e.flyR;
    e.heading = Math.atan2(nx - e.x, nz - e.z);
    e.x = lerp(e.x, nx, Math.min(1, dt * 1.5)); e.z = lerp(e.z, nz, Math.min(1, dt * 1.5));
    const plonge = Math.max(0, Math.sin(c.t * 0.21 + e.seed * 3)) ** 8;
    e.y = lerp(e.y, Math.max(w.heightAt(e.x, e.z), WL) + e.flyH * (1 - plonge * 0.9) + Math.sin(c.t * 0.6 + e.seed) * 1.2, Math.min(1, dt * 1.5));
    if (Math.random() < dt * 0.012 && e.dist > 20) { const P = E2C.chercher(w, e.x, e.z, 2, 15, (x, z) => E2C.eau(w, x, z) && Math.hypot(x - c.px, z - c.pz) > 20, 10); if (P) e.pose = P; }
    if (G[0] === e) { e.criT = (e.criT ?? 4 + Math.random() * 12) - dt; if (e.criT <= 0) { e.criT = 9 + Math.random() * 22; E2C.cri(e, 'mouette', c, 140); } }
  },
  // le balbuzard : il tourne au-dessus du lac, fait le « Saint-Esprit », plonge les serres en avant, et emporte son poisson
  balbuzard(e, dt, w, c) {
    if (E2C.partirVol(e, dt)) return;
    e.hidden = false;
    const WL = w.waterLevel;
    if (e.flyR === undefined) { e.flyR = 35 + Math.random() * 20; e.flyH = 22 + Math.random() * 10; e.flyS = (Math.random() < 0.5 ? 1 : -1) * 0.1; e.flyA = Math.random() * TAU; }
    e.surplace = false;
    switch (e.ph || 'tour') {
      case 'surplace': {
        e.fly = 1; e.surplace = true; e.phT -= dt;
        if (e.phT <= 0) { if (E2C.eau(w, e.x, e.z)) { e.ph = 'pique'; } else e.ph = 'tour'; }
        return;
      }
      case 'pique': {
        e.fly = 1; e.y -= dt * 15; e.x += Math.sin(e.heading) * dt * 3; e.z += Math.cos(e.heading) * dt * 3;
        if (e.y <= WL + 0.1) {
          e.y = WL - 0.05; e.ph = 'eau'; e.phT = 1.3;
          E2C.gerbe(w, e.x, e.z, 14, 1.4); E2C.cri(e, 'plongeon', c, 160, true);
        }
        return;
      }
      case 'eau': {
        e.fly = 0; e.phT -= dt;
        if (e.phT <= 0) {
          e.poisson = Math.random() < 0.7;
          const o = e.poisson ? E2C.objet(w, e.x, e.z, 110, E2_ARBRES) : null;
          e.perche = o ? { x: o.x, z: o.z, y: w.objectY(o) + (o.h || 8) * 0.82 } : null;
          e.ph = e.perche ? 'emporte' : 'tour';
          E2C.gerbe(w, e.x, e.z, 6, 0.8); E2C.cri(e, 'ailes', c, 80, true);
        }
        return;
      }
      case 'emporte': {
        e.fly = 1;
        const P = e.perche, r = E2C.vers(e, P.x, P.z, 9, dt, 3);
        e.y = lerp(e.y, P.y + Math.min(10, r * 0.15), Math.min(1, dt * 1.2));
        if (r < 0.4) { e.ph = 'mange'; e.phT = 25 + Math.random() * 30; e.y = P.y; }
        return;
      }
      case 'mange': {
        e.fly = 0; e.y = e.perche.y; e.peck = Math.sin(c.t * 2 + e.seed) > 0.3;
        e.phT -= dt;
        if (e.phT <= 0 || e.dist < 22 * (c.crouch ? 0.6 : 1)) { e.ph = 'tour'; e.poisson = false; e.peck = false; if (e.dist < 22) E2C.cri(e, 'balbuzard', c, 100, true); }
        return;
      }
    }
    e.ph = 'tour'; e.fly = 1; e.peck = false; e.poisson = false;
    e.flyA += e.flyS * dt;
    const nx = e.hx + Math.cos(e.flyA) * e.flyR, nz = e.hz + Math.sin(e.flyA) * e.flyR;
    e.heading = Math.atan2(nx - e.x, nz - e.z);
    e.x = lerp(e.x, nx, Math.min(1, dt * 0.9)); e.z = lerp(e.z, nz, Math.min(1, dt * 0.9));
    e.y = Math.max(Math.max(w.heightAt(e.x, e.z), WL) + 3, lerp(e.y, Math.max(w.heightAt(e.x, e.z), WL) + e.flyH, Math.min(1, dt * 0.6)));
    e.chasseT = (e.chasseT ?? 20 + Math.random() * 30) - dt;
    if (e.chasseT <= 0) { e.chasseT = 35 + Math.random() * 50; if (E2C.eau(w, e.x, e.z)) { e.ph = 'surplace'; e.phT = 3 + Math.random() * 2.5; } }
    e.criT = (e.criT ?? 15 + Math.random() * 30) - dt;
    if (e.criT <= 0) { e.criT = 40 + Math.random() * 60; E2C.cri(e, 'balbuzard', c, 160); }
  },
};

// ---------------------------------------------------------------- branchements : conduite
{
  const _uw = entities.updateWalker.bind(entities);
  entities.updateWalker = function (e, dt, w, c) {
    const k = e.cfg.e2, f = k && !e.owner && !e.piege ? E2_COMPORTE[k] : null;
    if (f) {
      try {
        if (e.e2redit) E2C.redire(e, dt, c);
        if (e.e2part && E2C.partirSol(e, dt, w, c)) return;
        if (f.call(E2_COMPORTE, e, dt, w, c)) return;
      } catch (err) { console.error(err); }
    }
    _uw(e, dt, w, c);
  };
  const _ub = entities.updateBird.bind(entities);
  entities.updateBird = function (e, dt, w, c) {
    const k = e.cfg.e2, f = k ? E2_VOL[k] : null;
    if (f) { try { if (e.e2redit) E2C.redire(e, dt, c); f(e, dt, w, c); } catch (err) { console.error(err); } return; }
    _ub(e, dt, w, c);
  };
}

// ---------------------------------------------------------------- les poses (après la pose commune)
// rig.e2e : la bête (posé à la naissance, 11-zzzzE2-betes.js)
function e2Pose(rig, st) {
  const e = rig.e2e;
  if (!e) return;
  const vol = st.fly > 0, t = st.t || 0;
  // les ailes repliées au sol, ouvertes en vol (rapaces, oiseaux d'eau) ; ouvertes aussi pour sécher (cormoran)
  if (rig.e2Replie) {
    if (!rig.e2iA) {
      rig.e2iA = []; rig.e2iR = [];
      rig.parts.forEach((q, i) => { let p = q, ok = false; while (p) { if (p.name === 'wingL' || p.name === 'wingR') { ok = true; break; } p = p.pi >= 0 ? rig.parts[p.pi] : null; } if (ok) rig.e2iA.push(i); if (/^replie/.test(q.name)) rig.e2iR.push(i); });
    }
    const ouvert = vol || e.seche || e.ailesT > 0;
    for (const i of rig.e2iA) rig.parts[i].hide = !ouvert;
    for (const i of rig.e2iR) {
      rig.parts[i].hide = ouvert;
      // (les enfants d'une aile repliée la suivent)
      const n = rig.parts[i].name;
      for (const q of rig.parts) if (q.parent === n) q.hide = ouvert;
    }
  }
  // le vol des grands oiseaux : battements lents, vol plané ; le busard porte ses ailes en V
  if (vol && rig.e2lent) {
    const L = rig.e2lent, ph = t * L[0] + (st.seed || 0);
    const plane = clamp((Math.sin(ph * 0.13) - 0.1) * 3, 0, 1);
    let a = Math.sin(ph) * L[1] * (1 - plane);
    let v = 0;
    if (e.kind === 'busard_sm') v = 0.38;
    else if (e.kind === 'vautour_fauve' || e.kind === 'gypaete') { v = 0.06; a *= 0.6; }
    else if (e.kind === 'mouette' || e.kind === 'balbuzard') v = 0.1;
    if (e.surplace) a = Math.sin(t * 13 + (st.seed || 0)) * 0.75;
    rig.set('wingL', 0, 0, a - v); rig.set('wingR', 0, 0, -a + v);
  }
  switch (e.kind) {
    case 'cormoran': if (e.seche) { rig.set('wingL', 0, -0.25, 0.3); rig.set('wingR', 0, 0.25, -0.3); rig.set('body', -0.55, 0, 0); } else rig.set('body', 0, 0, 0); break;
    case 'oedicneme': if (e.plaque) { rig.set('neck', 1.25, 0, 0); rig.set('head', -0.4, 0, 0); } else rig.set('head', 0, 0, 0); break;
    case 'huppe': rig.set('huppe', e.alerte || vol ? 0.35 : -1.25, 0, 0); break;
    case 'tetras_lyre':
      if (e.parade) {
        const g = 0.5 + Math.sin(t * 2.2 + (st.seed || 0)) * 0.08;
        rig.set('tail', 1.25, 0, 0); rig.set('wingL', 0, 0, 0.35); rig.set('wingR', 0, 0, -0.35); rig.set('neck', g, 0, 0);
      } else rig.set('tail', 0, 0, 0);
      break;
    case 'tichodrome': {
      if (e.paroi && !vol) {
        rig.set('body', -1.25, 0, 0);
        const o = e.ailesT > 0 ? Math.abs(Math.sin(t * 18)) * 1.1 : 0;
        rig.set('wingL', 0, 0, -o); rig.set('wingR', 0, 0, o);
      } else rig.set('body', 0, 0, 0);
      break;
    }
    case 'grand_duc': if (e.menace > 0 && !vol) { rig.set('wingL', 0, 0, 1.0); rig.set('wingR', 0, 0, -1.0); rig.set('neck', 0.35, rig.parts[rig.idx.neck] ? rig.parts[rig.idx.neck].r[1] : 0, 0); } break;
    case 'guignette': if (!vol) rig.set('body', Math.sin(t * 9 + (st.seed || 0)) * 0.22, 0, 0); else rig.set('body', 0, 0, 0); break;
    case 'campagnol_neiges': case 'campagnol_amphibie': rig.set('body', e.assis ? -0.55 : 0, 0, 0); break;
    case 'balbuzard': { const p = rig.part('poisson'); if (p) p.hide = !e.poisson; break; }
    case 'sphinx_tete_mort': if (!vol) { rig.set('wingL', 0, -1.15, 0.12); rig.set('wingR', 0, 1.15, -0.12); rig.set('basL', 0, -1.3, 0.05); rig.set('basR', 0, 1.3, -0.05); } else { const a = rig.parts[rig.idx.wingL].r[2]; rig.set('basL', 0, 0, a * 0.85); rig.set('basR', 0, 0, -a * 0.85); } break;
    case 'apollon': if (vol) { const a = Math.sin(t * 7 + (st.seed || 0)) * 0.55 * (Math.sin(t * 0.9 + (st.seed || 0)) > 0.3 ? 0.25 : 1); rig.set('wingL', 0, 0, a); rig.set('wingR', 0, 0, -a); } break;
    case 'oie_cendree': if (e.groupe && e.groupe[0] === e && !vol && !e.nage) rig.set('neck', -0.25, 0, 0); break;
  }
}
{
  const _pb = poseBird, _pq = poseQuad, _ps = poseSnake;
  poseBird = function (rig, st) { _pb(rig, st); if (rig.e2e) e2Pose(rig, st); };
  poseQuad = function (rig, st) { _pq(rig, st); if (rig.e2e) e2Pose(rig, st); };
  poseSnake = function (rig, st) { _ps(rig, st); if (rig.e2e) e2Pose(rig, st); };
}

// ---------------------------------------------------------------- au dessin : leur ombre, à leur taille (pas sur l'eau ni en l'air)
{
  const MIENNES = [];
  for (const B of E2_BETES) {
    const C = CREATURES[B.id];
    if (!C || C.fly) continue;
    C.e2Ombre = C.water ? 0 : C.radius <= 0.12 ? C.radius * 1.3 : Math.max(0.18, C.radius * 1.1);
    MIENNES.push(C);
  }
  const _draw = entities.draw.bind(entities);
  entities.draw = function (buf, sbuf, cam, maxD, t, flags) {
    for (const C of MIENNES) C.fly = true; // (au dessin, « fly » ne sert qu'à taire l'ombre commune)
    try { _draw(buf, sbuf, cam, maxD, t, flags); } finally { for (const C of MIENNES) delete C.fly; }
    const w = game.world;
    if (!sbuf || !w) return;
    const m2 = maxD * maxD;
    for (const e of this.list) {
      const r = e.cfg && e.cfg.e2Ombre;
      if (!r || e.hidden || e.far || e.dead || e.corpse || e.removed || !e.rig || e.fly > 0) continue;
      const dx = e.x - cam[0], dz = e.z - cam[2];
      if (dx * dx + dz * dz < m2 && e.y < w.heightAt(e.x, e.z) + 0.3) drawShadow(sbuf, e.x, e.y, e.z, r * (e.scale || 1));
    }
  };
}
