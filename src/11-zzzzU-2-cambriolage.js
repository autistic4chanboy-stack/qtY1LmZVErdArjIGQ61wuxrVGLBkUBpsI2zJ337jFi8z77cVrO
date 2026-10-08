// ============================================================================
//  LE CAMBRIOLAGE DE NUIT (agent U, vague 14)
//  - La nuit, les gens dorment dans leur lit (11-npc.js : l'état 'sleep', au point « bed » de leur maison). On
//    crochète leur porte (11-zzz97), on entre, on fouille (11-zzz98), on fait les poches du dormeur (11-zzz90).
//  - Chaque bruit a une PETITE chance de réveiller les dormeurs qui l'entendent (U_MODELE, 05-zzzzzU) : une goupille
//    ratée, la porte, les pas (accroupi presque rien, en marchant un peu, en courant beaucoup), une latte qui
//    grince, le meuble qu'on fouille, l'objet qu'on fait tomber (la maladresse). Plus on traîne, plus leur sommeil
//    s'use ; le petit matin et l'heure du coucher sont légers ; une lanterne allumée sur un visage endormi
//    l'agite. Souvent, avant de se réveiller, il remue : le souffle change, il se retourne, il marmonne.
//  - Réveillé, il se lève (une chandelle), écoute, va voir d'où venait le bruit. S'il vous voit : il crie ; il vous
//    reconnaît peut-être (la lanterne, la distance) — alors c'est une effraction (ou une intrusion, si la porte
//    était ouverte), un vol si l'on a pris quelque chose chez lui cette nuit (societe.crime : primes, affiches,
//    gardes, cachot) ; sinon une ombre : le cri fait venir le garde de nuit, qui vous prend sur le fait s'il vous
//    trouve près de la maison. Les costauds vous tombent dessus ; les autres fuient en criant. S'il ne trouve
//    personne, il se recouche, et dort mal le reste de la nuit.
//  - Une maison cambriolée (vu ou pas) se garde trois jours : on dort plus léger, un verrou de plus à la porte.
//    Le lendemain, on se plaint (sans savoir de qui) ; parfois de bruits seulement.
//  - Les doubles fonds : certains meubles habités cachent un tiroir à secret ; une « main sûre » le sent en
//    fouillant ; on l'ouvre au crochet (serrure de maître, ou à secret pour un secrétaire). Le butin, les papiers.
//  Points d'accroche (rien de 11-npc.js ni de 05-npc-data.js n'est modifié) : crochetage.bruit (11-zzzzU-1),
//    fouilles.temoins / fouiller / resoudre / etiquette, HOOKS.inter.f2, game.useDoor, npcs.update (comme les
//    gardes : on mène nous-mêmes les réveillés), npcs.schedulePlace (le réveillé reste debout), npcs.snap,
//    talk.open (les plaintes), vol.echec / vol.reussite, HOOKS.lights (la chandelle), HOOKS.update.
//    Si l'agent Z expose trajets.dort(n) / trajets.reveiller(n, o), ils sont préférés (voir le contrat).
//  API : crochetage.cambriolage (bruit(force, x, y, z, nature), dormeurs(), reveiller(n, src), ici, forcee(bld),
//        maisonGardee(bld), stats()).
// ============================================================================

// un habitant dort-il dans son lit ? (Z, s'il l'expose ; sinon l'état de 11-npc.js : couché, « sleep » — celui dont la
// routine dit qu'il dort mais qui marche encore vers son lit est éveillé)
function uDort(n) {
  if (!n || !n.st || !n.st.alive || n.vanished || n.state === 'gone' || n.state === 'dead') return false;
  try { if (typeof trajets !== 'undefined' && trajets && typeof trajets.dort === 'function') return !!trajets.dort(n); } catch (e) { /* l'état ci-dessous */ }
  return n.state === 'sleep';
}
// une ligne s'accorde au genre de qui parle ([féminin, masculin])
const uGenre = (t, n) => (Array.isArray(t) ? t[n && n.d && n.d.gender === 'f' ? 0 : 1] : t);
const uEstGarde = (n) => typeof gardes !== 'undefined' && gardes && gardes.est ? gardes.est(n) : !!(n && n.d && n.d.id === 'garde');

const cambriolage = {
  t: 0, ici: null, dormeurs: [], suivis: new Set(), retours: new Map(), forcees: {}, flagrant: null, maisons: {}, df: new Map(),
  pas: { acc: 0, x: 0, z: 0, air: false, vy: 0 }, coeurT: 0, fouilleVue: null, journal: [],

  S() { return crochetage.U(); },
  stats() { const S = this.S(); return S ? { pts: S.pts, niveau: crochetage.niveau(), nuits: S.nuits, reveils: S.reveils, reconnu: S.reconnu, butin: S.butin } : null; },
  // ------------------------------------------------------------------ les maisons habitées
  indexer() {
    this.maisons = {};
    const w = game.world;
    if (!w || !w.bld) return;
    for (const n of npcs.list) { const k = n.d.home; if (!k || !w.bld[k] || !w.bld[k].f) continue; (this.maisons[k] || (this.maisons[k] = [])).push(n); }
  },
  // le bâtiment habité où se tient le joueur (rez-de-chaussée ou étage)
  ou() {
    const p = game.player, w = game.world;
    for (const k in this.maisons) {
      const B = w.bld[k], R = Math.max(B.W || 0, B.D || 0) * 0.75 + 1;
      if (Math.abs(B.f.x - p.pos[0]) > R || Math.abs(B.f.z - p.pos[2]) > R) continue;
      if (game.insideBuilding(k)) return k;
    }
    return null;
  },
  // un point est-il dans tel bâtiment (au sol, à quelques mètres de haut) ?
  dans(k, x, z) {
    const B = game.world.bld[k];
    if (!B || !B.f) return false;
    const [lx, lz] = World.blockLocal({ x: B.f.x, z: B.f.z, r: B.f.r }, x, z);
    return Math.abs(lx) < B.W / 2 && Math.abs(lz) < B.D / 2;
  },
  forcee(k) { this.forcees[k] = game.time; },
  // la maison est à qui ? (le premier adulte vivant ; c'est chez lui qu'on est entré, même si c'est la petite qui crie)
  proprio(k) { const L = (this.maisons[k] || []).filter((n) => n.st.alive && !n.vanished); return L.find((n) => (n.d.age || 30) >= 16) || L[0] || null; },
  maisonGardee(k) { const S = this.S(), M = S && S.maisons[k]; return !!(M && farm.s.day - M.j <= 3); },
  // ------------------------------------------------------------------ l'état d'un dormeur (pour la partie en cours seulement)
  etat(n) { return n.uS || (n.uS = { agit: 0, remueT: 0, souffleT: 1 + Math.random() * 3, ronfle: U_MODELE.sens(n.d) < 0.95 || (n.d.gender !== 'f' && (n.d.age || 30) >= 40 && Math.random() < 0.6), nuit: 0, sx: 1e9, sz: 1e9, sol: 0 }); },
  // le plancher sous le dormeur (il est couché sur son lit, un peu plus haut)
  sol(n) {
    const u = this.etat(n);
    if (Math.abs(u.sx - n.x) + Math.abs(u.sz - n.z) > 0.3) { u.sx = n.x; u.sz = n.z; u.sol = game.world.groundAt(n.x, n.z, n.y + 0.1, 0.4); }
    return u.sol;
  },
  sens(n) { let k = U_MODELE.sens(n.d); if (n.st.malade) k *= 1.3; return k; },
  heure(n, h) {
    const S = n.d.schedule;
    if (!S || !S.length || uEstGarde(n)) return 1;
    return U_MODELE.heure(h, S[S.length - 1][0] + 0.6, S[0][0]);
  },
  traine(n) { const I = this.ici; return I && (n.d.home === I.k || n.inside === I.k) ? U_MODELE.traine(game.time - I.t0) : 1; },
  garde(n) { const u = this.etat(n); return this.maisonGardee(n.d.home) || u.nuit === farm.s.day; },

  // ------------------------------------------------------------------ un bruit : qui l'entend ? (renvoie le premier réveillé, ou null)
  // nature : 'serrure', 'porte', 'pas', 'grince', 'saut', 'fouille', 'chute', 'prendre', 'poche', 'autre'
  bruit(force, x, y, z, nature) {
    if (!(force > 0) || !farm.s || !game.world || game.sleeping) return null;
    const h = npcs.hour(), kJ = this.ici ? this.ici.k : this.ou();
    let premier = null;
    for (const n of npcs.list) {
      if (Math.abs(n.x - x) > 16 || Math.abs(n.z - z) > 16 || !uDort(n) || n.uEveil) continue;
      const sol = this.sol(n), d = Math.hypot(n.x - x, n.z - z, (sol - y) * 0.5);
      if (d > 16) continue;
      const maison = n.inside || n.d.home, mur = maison ? kJ !== maison : false, etage = Math.abs(sol - y) > 1.6;
      const f = U_MODELE.force(force, d, mur, etage);
      if (f < 0.003) continue;
      const u = this.etat(n);
      const c = U_MODELE.chances({ f, sens: this.sens(n), heure: this.heure(n, h), traine: this.traine(n), agit: u.agit, remue: u.remueT > game.time, garde: this.garde(n) });
      u.agit = Math.min(1, u.agit + f * U_REVEIL.agit);
      const r = Math.random();
      if (this.journal.length < 400) this.journal.push({ n: n.id, nature, f: Math.round(f * 1000) / 1000, p: Math.round(c.reveil * 10000) / 10000, r: r < c.reveil ? 'reveil' : r < c.remue ? 'remue' : '' });
      if (r < c.reveil) { this.reveiller(n, { x, y, z, nature }); if (!premier) premier = n; continue; }
      if (r < c.remue) this.remuer(n);
    }
    if (this.ici && premier) this.ici.reveil = true;
    // (dans la Zone et ailleurs, les guetteurs de l'agent V1 entendent aussi, s'ils existent)
    try { if (typeof furtif !== 'undefined' && furtif && typeof furtif.bruit === 'function') furtif.bruit(x, z, force, nature); } catch (e) { /* rien */ }
    return premier;
  },
  dormeursAutour(x, z, R) { return npcs.list.filter((n) => Math.abs(n.x - x) < R && Math.abs(n.z - z) < R && uDort(n) && !n.uEveil && Math.hypot(n.x - x, n.z - z) < R); },

  // ------------------------------------------------------------------ il remue (sans se réveiller)
  remuer(n) {
    const u = this.etat(n);
    if (u.remueT > game.time) return;
    u.remueT = game.time + 4 + Math.random() * 3;
    sound.uDraps && sound.uDraps(n, 1);
    n.heading += (Math.random() < 0.5 ? -1 : 1) * (0.15 + Math.random() * 0.2);
    const p = game.player;
    if (Math.hypot(n.x - p.pos[0], n.z - p.pos[2]) < 9 && Math.random() < 0.55) {
      setTimeout(() => {
        if (!uDort(n) || game.dying) return;
        sound.uMurmure && sound.uMurmure(n, n.voice || 1);
        ui.subtitle(n.st.met ? n.name : '???', pick(U_MURMURES), 2.2);
      }, 500 + Math.random() * 700);
    }
  },

  // ------------------------------------------------------------------ il se réveille
  reveiller(n, src) {
    if (!n || n.uEveil || !n.st.alive) return;
    const S = this.S(), w = game.world, u = this.etat(n), B = w.bld[n.d.home];
    S.reveils = (S.reveils || 0) + 1;
    u.nuit = farm.s.day; u.agit = 1;
    // Z peut le lever à sa façon ; on le mène ensuite nous-mêmes le temps de l'affaire
    try { if (typeof trajets !== 'undefined' && trajets && typeof trajets.reveiller === 'function') trajets.reveiller(n, { duree: 120, par: 'U', x: src.x, z: src.z }); } catch (e) { console.error('U : trajets.reveiller', e); }
    n.sleep = false; n.state = 'idle'; n.move = 0; n.path = []; n.pi = 0; n.run = false;
    this.debout(n, B);
    n.heading = Math.atan2(src.x - n.x, src.z - n.z);
    if (!this.ici && !S.plaintes[n.id]) S.plaintes[n.id] = { j: farm.s.day, k: 'bruit' };
    n.uEveilT = game.time + 120;
    n.uEveil = { phase: 'reveil', t: game.time, x: src.x, z: src.z, k: n.inside || n.d.home, cherche: 10 + Math.random() * 10, regT: 0, dit: false, fini: false };
    n.goal = { node: B ? B.nMid : -1, x: n.x, z: n.z, pose: null, bld: n.inside || null };
    this.suivis.add(n);
    sound.uDraps && sound.uDraps(n, 1.3);
    // un garde : debout tout de suite (11-zzzzC1 : il reste éveillé le temps de l'affaire)
    if (uEstGarde(n)) n.reveilT = game.time + 120;
  },

  // debout, à côté de son lit (du côté de la pièce), sur le plancher
  debout(n, B) {
    const w = game.world, y0 = this.sol(n);
    let lit = null, bd = 1.6;
    for (const L of (typeof sommeil !== 'undefined' && sommeil.lits) || []) { const q = L.q, d = Math.hypot(q.x - n.x, q.z - n.z); if (d < bd && Math.abs(q.y - y0) < 1.2) { bd = d; lit = q; } }
    const cx = B && B.f ? B.f.x : n.x, cz = B && B.f ? B.f.z : n.z, cand = [];
    if (lit) {
      const T = (typeof LIT_TAILLE !== 'undefined' && LIT_TAILLE[lit.id]) || [0.53, 1.03], c = Math.cos(lit.r || 0), s = Math.sin(lit.r || 0), e = T[0] + 0.42;
      for (const k of [1, -1]) cand.push([lit.x + k * e * c, lit.z - k * e * s]);
      cand.sort((a, b) => Math.hypot(a[0] - cx, a[1] - cz) - Math.hypot(b[0] - cx, b[1] - cz));
    }
    { const dx = cx - n.x, dz = cz - n.z, L = Math.hypot(dx, dz) || 1; for (const k of [1.2, 0.8]) cand.push([n.x + dx / L * Math.min(k, L * 0.7), n.z + dz / L * Math.min(k, L * 0.7)]); }
    for (const [x, z] of cand) {
      if (B && B.f && !this.dans(n.d.home, x, z)) continue;
      const g = w.groundAt(x, z, y0 + 0.3, 0.5);
      if (Math.abs(g - y0) > 0.35 || !pointFree(w, x, z, 0.25)) continue;
      n.x = x; n.z = z; n.y = g;
      if (B && B.f) n.inside = n.d.home;
      return true;
    }
    n.y = y0;
    return false;
  },
  // ------------------------------------------------------------------ voit-il le joueur ? (dans le noir, on voit mal et de près)
  vue(w, ax, az, bx, bz) {
    if (Math.hypot(bx - ax, bz - az) > 1.2 && !segClear(w, ax, az, bx, bz)) return false;
    // une porte fermée cache aussi
    for (const dr of w.doors) {
      if (dr.a > 0.4 || Math.min(ax, bx) - 2 > dr.x || Math.max(ax, bx) + 2 < dr.x || Math.min(az, bz) - 2 > dr.z || Math.max(az, bz) + 2 < dr.z) continue;
      const box = w.doorBox ? w.doorBox(dr) : null;
      if (!box) continue;
      const L = Math.hypot(bx - ax, bz - az), m = Math.max(2, Math.ceil(L / 0.25));
      for (let i = 1; i < m; i++) {
        const t = i / m, [lx, lz] = World.blockLocal(box, lerp(ax, bx, t), lerp(az, bz, t));
        if (Math.abs(lx) < box.sx / 2 + 0.05 && Math.abs(lz) < box.sz / 2 + 0.05) return false;
      }
    }
    return true;
  },
  voit(n) {
    const p = game.player, w = game.world;
    if (game.dying || game.sleeping || (typeof cine !== 'undefined' && cine.on)) return false;
    const dx = p.pos[0] - n.x, dz = p.pos[2] - n.z, d = Math.hypot(dx, dz);
    if (Math.abs(p.pos[1] - n.y) > 1.8) return false;
    const lant = !!(game.lantern && farm.count('lanterne')), accroupi = p.crouch > 0.5;
    const portee = lant ? 13 : accroupi ? 4 : 6.5;
    if (d > portee) return false;
    const face = (dx * Math.sin(n.heading) + dz * Math.cos(n.heading)) / (d || 1);
    if (d > 1.5 && face < (lant ? 0.05 : 0.4)) return false;
    if (!this.vue(w, n.x, n.z, p.pos[0], p.pos[2])) return false;
    return Math.random() < (lant ? 0.9 : d < 2.5 ? 0.7 : accroupi ? 0.25 : 0.4);
  },

  // ------------------------------------------------------------------ on les mène (comme les gardes : 11-zzzzC1)
  mener(n, tx, tz, dt, w, v) {
    const dd = Math.hypot(tx - n.x, tz - n.z);
    if (dd < 0.35) { n.move = lerp(n.move, 0, Math.min(1, dt * 6)); n.state = 'idle'; return true; }
    n.heading = turnToward(n.heading, Math.atan2(tx - n.x, tz - n.z), dt * 5);
    let nx = n.x + Math.sin(n.heading) * v * dt, nz = n.z + Math.cos(n.heading) * v * dt;
    [nx, nz] = w.collideCircle(nx, nz, n.y, n.y + 1.7, 0.28, 0.5, true);
    n.x = nx; n.z = nz; n.y = w.groundAt(nx, nz, n.y + 0.6, 0.6);
    n.state = 'walk'; n.move = lerp(n.move, 1, Math.min(1, dt * 6)); n.run = v > 2.6; n.phase += dt * v * 2.4;
    return false;
  },
  // le point où il va voir : là d'où venait le bruit, sans sortir de sa maison
  dansMaison(n, x, z) {
    const B = game.world.bld[n.uEveil.k];
    if (!B || !B.f) return [x, z];
    const [lx, lz] = World.blockLocal({ x: B.f.x, z: B.f.z, r: B.f.r }, x, z);
    const cx = clamp(lx, -B.W / 2 + 0.7, B.W / 2 - 0.7), cz = clamp(lz, -B.D / 2 + 0.7, B.D / 2 - 0.7);
    const c = Math.cos(B.f.r), s = Math.sin(B.f.r);
    return [B.f.x + cx * c + cz * s, B.f.z - cx * s + cz * c];
  },
  piloter(n, dt, w) {
    const E = n.uEveil, p = game.player, now = game.time;
    if (!E || !n.st.alive || n.vanished) { this.lacher(n); return; }
    n.dist = Math.hypot(n.x - p.pos[0], n.z - p.pos[2]);
    n.bubbleT = Math.max(0, (n.bubbleT || 0) - dt); n.hurtT = Math.max(0, (n.hurtT || 0) - dt);
    // le regard, quatre fois par seconde
    E.regT -= dt;
    if (E.phase !== 'face' && E.regT <= 0) { E.regT = 0.25; if (this.voit(n)) { this.vu(n); return; } }
    if (E.phase === 'reveil') {
      n.move = lerp(n.move, 0, Math.min(1, dt * 6)); n.state = 'idle';
      n.heading = turnToward(n.heading, Math.atan2(E.x - n.x, E.z - n.z), dt * 2);
      if (!E.dit && now - E.t > 0.7) { E.dit = true; npcs.say(n, pick(U_REVEIL_DOUTE), 2.6); }
      if (now - E.t > 1.8) { E.phase = 'cherche'; E.t1 = now; [E.cx, E.cz] = this.dansMaison(n, E.x, E.z); }
      return;
    }
    if (E.phase === 'cherche') {
      const la = this.mener(n, E.cx, E.cz, dt, w, 1.05);
      if (la) n.heading += dt * 0.9 * Math.sin(now * 0.8 + n.id.length); // il regarde autour de lui
      if (now - E.t1 > E.cherche) { E.phase = 'retour'; npcs.say(n, uGenre(pick(U_RECOUCHE), n), 2.6); this.lacher(n, 0); }
      return;
    }
    if (E.phase === 'face') {
      // il se jette sur vous (une fois), puis il vous laisse fuir en criant
      const d = n.dist;
      if (now - E.t2 > 9 || d > 16) { this.lacher(n, 90); return; }
      if (d > 1.3) { this.mener(n, p.pos[0], p.pos[2], dt, w, 3.2); return; }
      n.move = 0; n.state = 'idle'; n.heading = Math.atan2(p.pos[0] - n.x, p.pos[2] - n.z);
      if (!E.frappe) {
        E.frappe = true;
        n.attackAnim = 0.5;
        const a = Math.atan2(p.pos[0] - n.x, p.pos[2] - n.z);
        p.vel[0] += Math.sin(a) * 6; p.vel[2] += Math.cos(a) * 6;
        play.hurt(8, n, 'Rossé par ' + n.name);
        game.shakeT = Math.max(game.shakeT || 0, 0.3);
        sound.stab && sound.stab();
        E.t2 = now - 6; // (encore trois secondes, puis il crie depuis sa porte)
      }
      return;
    }
    this.lacher(n);
  },
  // on cesse de le mener : il reste debout (sec) ou se recouche (0)
  lacher(n, sec) {
    this.suivis.delete(n);
    if (n.uEveil) n.uEveil = null;
    n.uEveilT = sec ? game.time + sec : 0;
    n.goal = null; n.path = []; n.pi = 0; n.run = false; n.attackAnim = 0;
    if (!n.inside && this.dans(n.d.home, n.x, n.z)) n.inside = n.d.home;
    this.retours.set(n, game.time + (sec || 0));
  },
  // il retourne se coucher : les derniers pas jusqu'au lit (le lit, avec sa tête et son pied, gêne l'arrivée par le côté ;
  // Z refait les trajets : trajets.coucher(n) s'il l'expose)
  recoucher() {
    const now = game.time;
    for (const [n, t0] of this.retours) {
      if (!n.st.alive || n.vanished || n.uEveil || uDort(n)) { this.retours.delete(n); continue; }
      if (now < t0 + 3) continue;
      const G = n.goal;
      if (!G || G.pose !== 'lie') { if (now > t0 + 240) this.retours.delete(n); continue; }
      const d = Math.hypot(G.x - n.x, G.z - n.z);
      if (d > 1.8 && now < t0 + 50) continue;
      try { if (typeof trajets !== 'undefined' && trajets && typeof trajets.coucher === 'function') { trajets.coucher(n); this.retours.delete(n); continue; } } catch (e) { /* le geste ci-dessous */ }
      n.x = G.x; n.z = G.z; if (G.y !== undefined && G.y !== null) n.y = G.y; if (G.r !== undefined && G.r !== null) n.heading = G.r;
      n.state = 'sleep'; n.inside = G.bld || n.inside; n.path = []; n.pi = 0; n.move = 0; n.run = false;
      sound.uDraps && sound.uDraps(n, 0.8);
      this.retours.delete(n);
    }
  },

  // ------------------------------------------------------------------ il vous a vu
  vu(n) {
    const E = n.uEveil, p = game.player, S = this.S(), now = game.time;
    if (!E) return;
    E.phase = 'vu';
    if (this.ici) this.ici.vu = true;
    this.interrompre();
    const d = Math.hypot(n.x - p.pos[0], n.z - p.pos[2]), lant = !!(game.lantern && farm.count('lanterne'));
    let reco = lant ? 0.92 : d < 1.5 ? 0.75 : d < 3 ? 0.5 : d < 6 ? 0.22 : 0.1;
    if (p.crouch > 0.5 && !lant) reco *= 0.8;
    const reconnu = Math.random() < reco, brave = U_BRAVES.has(n.id) || uEstGarde(n);
    n.heading = Math.atan2(p.pos[0] - n.x, p.pos[2] - n.z);
    // le cri
    let cri;
    if (brave && U_CRI_BRAVE[n.id]) cri = U_CRI_BRAVE[n.id];
    else if (reconnu) cri = n.st.met ? fmtLine(pick(U_CRI_RECONNU), n) : 'Je ne sais pas qui vous êtes, mais je vous ai vu ! Je vous ai vu ! Au voleur !';
    else cri = pick(U_CRI_INCONNU);
    if (n.id === 'fillette') cri = reconnu ? 'C’est toi ! Je t’ai vu ! MAMAN ! MAMAN !' : 'MAMAN ! Il y a quelqu’un ! MAMAN !';
    npcs.say(n, cri, 3.8);
    if (!brave) setTimeout(() => sound.scream && sound.ici && sound.ici(n, () => sound.scream(n.voice || 1), { att: 'phys', ref: 6 }), 350);
    // les crimes (11-zzz50) : connus de lui s'il vous a reconnu
    const k = E.k, I = this.ici && this.ici.k === k ? this.ici : null;
    const type = this.forcees[k] && now - this.forcees[k] < 900 ? 'effraction' : 'intrusion';
    const vole = !!(I && I.pris > 0), chez = (this.proprio(k) || n).id;
    if (reconnu) {
      S.reconnu = (S.reconnu || 0) + 1;
      try {
        if (typeof societe !== 'undefined' && societe.crime && CRIME_DEF[type]) societe.crime({ type, victime: chez, x: n.x, z: n.z, temoins: [n] });
        if (vole && typeof societe !== 'undefined' && societe.crime) societe.crime({ type: 'vol', victime: chez, x: n.x, z: n.z, temoins: [n] });
      } catch (e) { console.error('U : crime', e); }
      npcs.addAmitie(n, vole ? -180 : -120); n.st.anger = Math.max(n.st.anger || 0, 4); npcs.remember(n, 'cambriolage');
      if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-2, 'cambriolage', 5);
    } else {
      // une ombre : on ne sait pas qui ; le garde de nuit vient, et prend sur le fait qui traîne près de la maison
      this.flagrant = { k, victime: chez, temoin: n.id, type, vol: vole, t: now + 90 };
      if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-1, 'cambriolage', 5);
    }
    S.maisons[k] = { j: farm.s.day, vu: true };
    // le cri fait venir les gardes (11-zzzzC1 : ils accourent au cri)
    try {
      if (typeof gardes !== 'undefined' && gardes && gardes.cri) gardes.cri(n.x, n.z, n);
      if (typeof societe !== 'undefined' && societe.alerterGarde) societe.alerterGarde(n.x, n.z, 1);
    } catch (e) { console.error('U : gardes', e); }
    // les autres dormeurs de la maison se réveillent au cri
    for (const m of this.maisons[k] || []) if (m !== n && uDort(m) && Math.hypot(m.x - n.x, m.z - n.z) < 14) this.reveiller(m, { x: n.x, y: n.y, z: n.z, nature: 'cri' });
    // et lui : un garde vous poursuit (s'il vous a reconnu, le crime est su : 11-zzzzC1 mène la suite) ; un costaud
    // se jette sur vous ; les autres fuient en criant
    if (uEstGarde(n)) { this.lacher(n, 120); if (reconnu) { n.poursuite = now + 18; n.vuT = now; n.fleeT = 0; } }
    else if (brave) { E.phase = 'face'; E.t2 = now; }
    else { this.lacher(n, 100); n.fleeT = 5 + Math.random() * 2; n.run = true; }
  },
  // pris sur le fait, près de la maison, par un garde (ou par celui qu'on a réveillé, revenu voir)
  flagrantDelit() {
    const F = this.flagrant;
    if (!F) return;
    const now = game.time;
    if (now > F.t) { this.flagrant = null; return; }
    const p = game.player, w = game.world, B = w.bld[F.k];
    if (!B || !B.f || Math.hypot(p.pos[0] - B.f.x, p.pos[2] - B.f.z) > 35) return;
    const L = (typeof gardes !== 'undefined' && gardes && gardes.L ? gardes.L.slice() : [npcs.byId.garde]).filter(Boolean);
    const gens = [npcs.byId[F.temoin], npcs.byId[F.victime]].filter(Boolean);
    for (const v of gens) if (!L.includes(v)) L.push(v);
    for (const g of L) {
      if (!g.st.alive || g.vanished || uDort(g) || g.talking) continue;
      const v = gens.includes(g) ? g : null;
      const d = Math.hypot(g.x - p.pos[0], g.z - p.pos[2]);
      if (d > (v ? 8 : 16) || Math.abs(g.y - p.pos[1]) > 2.2) continue;
      if (d > 2.5 && !this.vue(w, g.x, g.z, p.pos[0], p.pos[2])) continue;
      this.flagrant = null;
      try {
        if (typeof societe !== 'undefined' && societe.crime) {
          if (CRIME_DEF[F.type]) societe.crime({ type: F.type, victime: F.victime, x: p.pos[0], z: p.pos[2], temoins: [g] });
          if (F.vol) societe.crime({ type: 'vol', victime: F.victime, x: p.pos[0], z: p.pos[2], temoins: [g] });
        }
      } catch (e) { console.error('U : flagrant', e); }
      const S = this.S(); S.reconnu = (S.reconnu || 0) + 1;
      if (uEstGarde(g)) { g.poursuite = now + 18; g.vuT = now; g.fleeT = 0; npcs.say(g, g === v ? 'Vous ! Chez moi ! Halte !' : 'Halte ! Vous, là, près de la maison ! Halte !', 3); }
      else npcs.say(g, 'C’est vous ! C’était vous ! Au voleur ! AU GARDE !', 3.5);
      if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-1.5, 'cambriolage', 5);
      return;
    }
  },

  // ------------------------------------------------------------------ le joueur entre, sort
  entree(k) {
    const dorment = (this.maisons[k] || []).some((n) => uDort(n));
    this.ici = { k, t0: game.time, pris: 0, vu: false, reveil: false, nuit: dorment };
  },
  sortie(I) {
    const S = this.S();
    if (!S || !I) return;
    const habitants = (this.maisons[I.k] || []).filter((n) => n.st.alive && !n.vanished);
    if (I.nuit && I.pris > 0 && !I.vu) {
      // un cambriolage mené sans être vu
      S.nuits = (S.nuits || 0) + 1; S.butin = (S.butin || 0) + Math.round(I.pris);
      crochetage.gagner(U_GAINS.nuit, 'nuit');
      S.maisons[I.k] = { j: farm.s.day, vu: false };
      for (const n of habitants) S.plaintes[n.id] = { j: farm.s.day, k: 'nuit' };
    } else if (I.nuit && I.reveil && !I.vu) {
      S.maisons[I.k] = S.maisons[I.k] || { j: farm.s.day, vu: false };
      for (const n of habitants) if (!S.plaintes[n.id]) S.plaintes[n.id] = { j: farm.s.day, k: 'bruit' };
    }
  },

  // ------------------------------------------------------------------ chaque image
  update(dt, playing) {
    if (!farm.s || !game.world || game.kind !== 'farm') return;
    const p = game.player, w = game.world;
    // les pas (seulement près des dormeurs)
    if (playing && this.dormeurs.length && !p.riding && !p.swimming) this.pasDuJoueur(p, dt);
    else { this.pas.x = p.pos[0]; this.pas.z = p.pos[2]; this.pas.acc = 0; }
    // la fouille en cours : le bruit du meuble, la maladresse
    this.fouilleEnCours();
    this.t -= dt;
    if (this.t > 0) return;
    this.t = 0.25;
    // où est-on ?
    const k = playing ? this.ou() : (this.ici ? this.ici.k : null);
    if (k !== (this.ici ? this.ici.k : null)) { if (this.ici) this.sortie(this.ici); this.ici = null; if (k) this.entree(k); }
    if (this.ici && !this.ici.nuit && (this.maisons[this.ici.k] || []).some((n) => uDort(n))) this.ici.nuit = true;
    // les dormeurs autour
    this.dormeurs = this.dormeursAutour(p.pos[0], p.pos[2], 16);
    const now = game.time, lant = !!(game.lantern && farm.count('lanterne')), h = npcs.hour();
    let coeur = 0;
    for (const n of this.dormeurs) {
      const u = this.etat(n), d = Math.hypot(n.x - p.pos[0], n.z - p.pos[2]);
      u.agit = Math.max(0, u.agit - U_REVEIL.calme * 0.25);
      // on s'attarde chez lui : le sommeil s'use, même sans bruit
      if (playing && this.ici && this.ici.k === (n.inside || n.d.home)) {
        const ps = U_MODELE.presence(now - this.ici.t0, this.sens(n), this.heure(n, h)) * (this.garde(n) ? U_REVEIL.garde : 1);
        if (ps > 0 && Math.random() < ps * 0.25) { this.reveiller(n, { x: p.pos[0], y: p.pos[1], z: p.pos[2], nature: 'presence' }); this.ici.reveil = true; continue; }
      }
      // la lanterne sur un visage endormi
      if (lant && d < 3.5 && Math.abs(p.pos[1] - n.y) < 2 && this.vue(w, n.x, n.z, p.pos[0], p.pos[2])) {
        u.agit = Math.min(1, u.agit + U_BRUITS.lanterne * 0.25);
        if (u.remueT > now && Math.random() < 0.25) { this.reveiller(n, { x: p.pos[0], y: p.pos[1], z: p.pos[2], nature: 'lumiere' }); if (this.ici) this.ici.reveil = true; continue; }
      }
      // son souffle, tout bas (dans la même maison, ou tout près)
      u.souffleT -= 0.25;
      if (u.souffleT <= 0 && d < 9 && (d < 4.5 || (this.ici && this.ici.k === (n.inside || n.d.home)))) {
        const trouble = u.agit > 0.35 || u.remueT > now;
        u.souffleT = (trouble ? 2.4 : 3.4) + Math.random() * 1.2;
        if (u.remueT <= now) sound.uSouffle && sound.uSouffle(n, clamp(1.25 - d / 9, 0.3, 1.1), u.ronfle && !trouble, trouble);
      }
      if (d < 5 && (u.agit > 0.45 || u.remueT > now)) coeur = Math.max(coeur, u.agit);
    }
    // le cœur qui bat, quand un dormeur s'agite tout près
    this.coeurT -= 0.25;
    if (coeur > 0 && this.coeurT <= 0) { this.coeurT = 1.15 - coeur * 0.35; sound.heartbeat && sound.heartbeat(0.16 + coeur * 0.12); }
    this.flagrantDelit();
    if (this.retours.size) this.recoucher();
  },
  pasDuJoueur(p, dt) {
    const P = this.pas, w = game.world;
    const moved = Math.hypot(p.pos[0] - P.x, p.pos[2] - P.z);
    P.x = p.pos[0]; P.z = p.pos[2];
    // retomber d'un saut
    if (!p.onGround) { P.air = true; P.vy = Math.min(P.vy, p.vel[1]); }
    else if (P.air) { P.air = false; if (P.vy < -4) this.bruit(U_BRUITS.saut * clamp(-P.vy / 8, 0.5, 1.6), p.pos[0], p.pos[1], p.pos[2], 'saut'); P.vy = 0; }
    if (!p.onGround || moved > 2) return;
    P.acc += moved;
    const mode = p.sprinting ? 'court' : p.crouch > 0.5 ? 'accroupi' : 'marche', pasL = mode === 'court' ? 1.3 : mode === 'accroupi' ? 0.7 : 0.95;
    if (P.acc < pasL) return;
    P.acc = 0;
    const L = crochetage.niveau(), ch = farm.count('chaussons_lisiere') > 0;
    this.bruit(U_MODELE.pas(mode, L, ch), p.pos[0], p.pos[1], p.pos[2], 'pas');
    // une latte qui grince (dans une maison)
    if (this.ici && Math.random() < U_MODELE.grince(mode, L, ch)) {
      sound.uGrince && sound.uGrince([p.pos[0], p.pos[1] + 0.1, p.pos[2]], mode === 'accroupi' ? 0.7 : 1);
      this.bruit(U_BRUITS.grince, p.pos[0], p.pos[1], p.pos[2], 'grince');
    }
    void w; void dt;
  },
  // la fouille (11-zzz98) : le bruit du meuble au début, la maladresse au milieu
  fouilleEnCours() {
    if (typeof fouilles === 'undefined') return;
    const E = fouilles.enCours;
    if (!E) { this.fouilleVue = null; return; }
    if (this.fouilleVue !== E) {
      this.fouilleVue = E;
      const T = fouilles.type(E.it), P = crochetage.palier(), p = game.player;
      const f = (U_BRUITS.fouille[T.son] ?? 0.2) * P.bruit * (p.crouch > 0.5 ? 0.85 : 1);
      E.uChute = this.dormeurs.length > 0 && Math.random() < P.maladresse * this.maladresse() ? E.d * (0.25 + Math.random() * 0.5) : -1;
      this.bruit(f, E.it.x, E.it.y, E.it.z, 'fouille');
      return;
    }
    if (E.uChute >= 0 && E.d - E.t >= E.uChute) {
      E.uChute = -1;
      const sorte = pick(['metal', 'metal', 'bois', 'verre']);
      sound.uChute && sound.uChute([E.it.x, E.it.y + 0.2, E.it.z], 1, sorte);
      this.bruit(U_BRUITS.chute * (sorte === 'bois' ? 0.7 : 1), E.it.x, E.it.y, E.it.z, 'chute');
      penser.une('u_chute', sorte === 'verre' ? '(Un flacon. Il s’est brisé sur le plancher.)' : sorte === 'bois' ? '(Une boîte vous a échappé des mains.)' : '(Un bougeoir. Il roule, roule, et n’en finit pas de rouler.)', 3.5);
    }
  },
  // la fatigue, l'alcool : des mains moins sûres
  maladresse() {
    let k = 1;
    try { if (typeof sommeil !== 'undefined') k *= 1 + sommeil.k(); } catch (e) { /* rien */ }
    try { if (typeof alcool !== 'undefined' && alcool.S() && alcool.S().g > 1) k *= 1.6; } catch (e) { /* rien */ }
    return k;
  },
  // la porte (game.useDoor) : l'ouvrir, la refermer
  bruitPorte(dr, ouverte) {
    const P = crochetage.palier(), p = game.player;
    const f = (ouverte ? U_BRUITS.porte : U_BRUITS.claque) * (0.6 + 0.4 * P.bruit) * (p.crouch > 0.5 ? 0.8 : 1);
    this.bruit(f, dr.x, dr.y ?? p.pos[1], dr.z, 'porte');
  },

  // ------------------------------------------------------------------ les doubles fonds
  dfIndexer() {
    this.df.clear();
    if (typeof fouilles === 'undefined' || !fouilles.par) return;
    for (const it of [...fouilles.par.values()]) {
      const d = it.data || {}, D = U_DOUBLES_FONDS[d.t];
      if (it.kind !== 'f2' || !D || !d.own || d.cache || d.uDf || d.lieu === 'abandon' || d.lieu === 'rebut' || d.lieu === 'public') continue;
      if ((hashString(it.id + ':double-fond') % 1000) / 1000 >= U_DF_PART) continue;
      const df = { kind: 'f2', id: it.id + ':df', x: it.x, y: it.y, z: it.z, name: 'Ouvrir le double fond',
        data: Object.assign({}, d, { table: D.table, lock: D.lock, cle: null, pool: 'u_secret', p: 0.45, refill: U_DF_REFILL, uDf: it.id }) };
      this.df.set(it.id, df);
      fouilles.par.set(df.id, df); // (connu des fouilles et du butin : ce qu'on y laisse y reste, il se remplit)
    }
  },
  // ce qu'on prend (le menu du butin, 11-zzzz1) dans la maison où l'on est entré : compté, et un petit bruit
  prisButin(S, e, n) {
    const I = this.ici, it = S && S.o && S.o.it;
    if (!I || !it || !e || e.pap) return;
    const d = it.data || {};
    if (!(d.bld === I.k || (d.own && NPC_BY_ID[d.own] && NPC_BY_ID[d.own].home === I.k))) return;
    I.pris += e.k === 'argent' ? n : ((ITEMS[e.k] && ITEMS[e.k].price) || 1) * n;
    this.bruit(U_BRUITS.prendre * crochetage.palier().bruit * (e.k === 'argent' ? 1.5 : 1), it.x, it.y, it.z, 'prendre');
  },
  // vu : ce qu'on faisait s'interrompt (le menu du butin, la fouille, le petit jeu)
  interrompre() {
    try {
      if (crochetage.jeu && !crochetage.jeu.fini) crochetage.finir(false, 'On vous a vu.');
      if (typeof fouilles !== 'undefined') fouilles.enCours = null;
      if (typeof butin !== 'undefined' && butin.sess) ui.close();
    } catch (e) { console.error('U : interrompre', e); }
  },
  dfConnu(it) { const S = this.S(); return !!(S && it && S.df[it.id] && this.df.has(it.id)); },
};
crochetage.cambriolage = cambriolage;

// ---------------------------------------------------------------- les habitants qu'on mène, et ceux qui restent debout
{
  const _upd = npcs.update.bind(npcs);
  npcs.update = function (dt, w, c) {
    const U = [];
    for (const n of cambriolage.suivis) if (n.uEveil && !n.hunting && n.st.alive) { n.hunting = true; U.push(n); }
    try { _upd(dt, w, c); } finally { for (const n of U) n.hunting = false; }
    for (const n of U) { try { cambriolage.piloter(n, dt, w); } catch (e) { console.error('U : piloter', e); cambriolage.lacher(n, 30); } }
  };
  const _sp = npcs.schedulePlace.bind(npcs);
  npcs.schedulePlace = function (n, h) {
    const r = _sp(n, h);
    if (r && r.sleep && n && (n.uEveilT || 0) > game.time) return { place: r.place || 'home', sleep: false };
    return r;
  };
  // (tout le monde à sa place : chargement, réveil du joueur, nuit rouge) : on ne mène plus personne
  const _snap = npcs.snap.bind(npcs);
  npcs.snap = function (w, first) {
    for (const n of cambriolage.suivis) { n.uEveil = null; n.uEveilT = 0; }
    cambriolage.suivis.clear(); cambriolage.retours.clear();
    for (const n of npcs.list) if (n.uEveilT) n.uEveilT = 0;
    return _snap(w, first);
  };
}
// la chandelle du réveillé
HOOKS.lights.push((eye) => {
  const L = [];
  for (const n of cambriolage.suivis) {
    if (!n.uEveil) continue;
    const d = Math.hypot(n.x - eye[0], n.z - eye[2]);
    if (d > 40) continue;
    const fl = 1 + Math.sin(game.time * 9 + n.id.length) * 0.06;
    L.push({ x: n.x + Math.sin(n.heading + 0.6) * 0.35, y: n.y + 1.25, z: n.z + Math.cos(n.heading + 0.6) * 0.35, r: 6.5, c: [1.0 * fl, 0.72 * fl, 0.4 * fl], d });
  }
  return L;
});

// ---------------------------------------------------------------- les branchements qui demandent la partie (une fois)
HOOKS.load.push(() => {
  cambriolage.ici = null; cambriolage.suivis.clear(); cambriolage.retours.clear(); cambriolage.forcees = {}; cambriolage.flagrant = null; cambriolage.dormeurs = [];
  cambriolage.fouilleVue = null; cambriolage.journal = []; cambriolage.t = 0;
  if (!farm.s || !game.world) return;
  crochetage.U();
  cambriolage.indexer();
  try { cambriolage.dfIndexer(); } catch (e) { console.error('U : doubles fonds', e); }
  if (game._u2) return;
  game._u2 = true;
  // ---- la porte : l'ouvrir, la refermer, près des dormeurs
  const _ud = game.useDoor.bind(game);
  game.useDoor = function (dr) {
    const avant = dr ? dr.open : 0;
    const r = _ud(dr);
    try { if (dr && !dr.poterne && !!dr.open !== !!avant && farm.s) cambriolage.bruitPorte(dr, !!dr.open); } catch (e) { console.error('U : porte', e); }
    return r;
  };
  if (typeof fouilles !== 'undefined') {
    // ---- les dormeurs ne sont plus des témoins tirés au sort : c'est le bruit qui les réveille (ci-dessus)
    const _tem = fouilles.temoins.bind(fouilles);
    fouilles.temoins = function (it, own) {
      const caches = [];
      for (const m of npcs.list) if (!m.vanished && uDort(m)) { m.vanished = true; caches.push(m); }
      try { return _tem(it, own); } finally { for (const m of caches) m.vanished = false; }
    };
    // ---- ce qu'on prend dans la maison où l'on est entré ; le double fond qu'on sent
    const _res = fouilles.resoudre.bind(fouilles);
    fouilles.resoudre = function (it) {
      const r = _res(it);
      try {
        const I = cambriolage.ici, d = it.data || {};
        if (r && I && (d.bld === I.k || (d.own && NPC_BY_ID[d.own] && NPC_BY_ID[d.own].home === I.k))) {
          let v = r.pieces || 0;
          for (const [k, q] of r.got || []) v += (ITEMS[k] && ITEMS[k].price || 0) * q;
          I.pris += v;
          if (v > 0) cambriolage.bruit(U_BRUITS.prendre * crochetage.palier().bruit, it.x, it.y, it.z, 'prendre');
        }
        // le double fond : une main sûre sent le bois qui sonne creux
        const S = crochetage.U();
        if (r && !r.pris && cambriolage.df.has(it.id) && !S.df[it.id] && crochetage.niveau() >= U_DF_PALIER && !d.uDf) {
          const L = crochetage.niveau();
          if (Math.random() < 0.35 + 0.15 * (L - U_DF_PALIER)) {
            S.df[it.id] = { vu: farm.s.day };
            setTimeout(() => { if (!game.dying && !ui.panel) ui.subtitle('', pick(['(Sous le dernier tiroir, le bois sonne creux.)', '(Le fond est moins profond que le meuble. Un double fond.)', '(Une fente, sous la moulure. Et une toute petite serrure.)']), 4); }, 1600);
          }
        }
      } catch (e) { console.error('U : resoudre', e); }
      return r;
    };
    // ---- l'étiquette : « — un double fond »
    const _et = fouilles.etiquette.bind(fouilles);
    fouilles.etiquette = function (it) {
      const t = _et(it);
      try { if (t && it && it.kind === 'f2' && cambriolage.dfConnu(it)) return t + (fouilles.vide(cambriolage.df.get(it.id)) ? '' : ' <b>— un double fond</b>'); } catch (e) { /* rien */ }
      return t;
    };
    // ---- E sur un meuble dont on connaît le double fond : choisir
    const _f2 = HOOKS.inter.f2;
    HOOKS.inter.f2 = (it) => {
      if (!cambriolage.dfConnu(it) || fouilles.enCours) return _f2 ? _f2(it) : fouilles.fouiller(it);
      const df = cambriolage.df.get(it.id), vide = fouilles.vide(df);
      ui.choice(String(it.name || 'Le meuble').replace(/^(Fouiller|Ouvrir) (le |la |les |l’)?/, (m0, v, a) => (a || '')).replace(/^./, (c) => c.toUpperCase()), vide ? 'Le double fond est vide. On y remettra quelque chose, un jour.' : 'Il y a ce qu’on voit, et ce qu’on cache dessous.', [
        { label: it.name || 'Fouiller', fn: () => { ui.close(true); if (_f2) _f2(it); else fouilles.fouiller(it); } },
        { label: vide ? 'Le double fond (vide)' : 'Ouvrir le double fond', fn: () => { ui.close(true); fouilles.fouiller(df); } },
        { label: 'Laisser', fn: () => ui.close() },
      ]);
    };
  }
  // ---- le menu du butin (11-zzzz1) : ce qu'on prend, un à un
  if (typeof butin !== 'undefined' && butin.retirer) {
    const _ret = butin.retirer.bind(butin);
    butin.retirer = function (S, e, n) {
      const r = _ret(S, e, n);
      try { cambriolage.prisButin(S, e, n); } catch (err) { console.error('U : butin', err); }
      return r;
    };
  }
  // ---- faire les poches d'un dormeur : ce qu'on prend compte ; raté, il reste debout, la maison se garde
  if (typeof vol !== 'undefined') {
    const _re = vol.reussite.bind(vol);
    vol.reussite = function (n) {
      const m0 = farm.s.money, I = cambriolage.ici, dort = uDort(n);
      const r = _re(n);
      try { if (I && dort && (n.d.home === I.k)) { I.pris += Math.max(0, farm.s.money - m0) + 10; cambriolage.bruit(U_BRUITS.poche, n.x, n.y, n.z, 'poche'); } } catch (e) { console.error(e); }
      return r;
    };
    const _ec = vol.echec.bind(vol);
    vol.echec = function (n) {
      const dort = uDort(n);
      const r = _ec(n);
      try {
        if (dort && n.st.alive) {
          n.uEveilT = game.time + 90; cambriolage.etat(n).nuit = farm.s.day; cambriolage.retours.set(n, game.time + 90);
          const S = crochetage.U(); S.maisons[n.d.home] = { j: farm.s.day, vu: true };
          if (cambriolage.ici) { cambriolage.ici.vu = true; cambriolage.ici.reveil = true; }
        }
      } catch (e) { console.error(e); }
      return r;
    };
  }
  // ---- le lendemain : on se plaint d'une nuit où quelqu'un est entré (ou de bruits)
  const _open = talk.open.bind(talk);
  talk.open = function (n) {
    const v = _open(n);
    try {
      const S = crochetage.U(), P = S && S.plaintes[n.id];
      if (P && v && v.text && farm.s.day > P.j) {
        delete S.plaintes[n.id];
        const sait = typeof societe !== 'undefined' && societe.crimesSus && societe.crimesSus(n).length > 0;
        if (farm.s.day - P.j <= 3 && n.st.alive && !sait && !npcs.murdererKnown() && !(n.st.anger > 0)) {
          v.text = fmtLine(uGenre(pick(P.k === 'nuit' ? U_PLAINTE_NUIT : U_PLAINTE_BRUIT), n), n);
          n.speakT = Math.min(6, 1 + v.text.length * 0.04);
          if (typeof fouilles !== 'undefined' && fouilles.S) { const F = fouilles.S(); if (F && F.plaintes) delete F.plaintes[n.id]; }
        }
      }
    } catch (e) { console.error('U : plainte', e); }
    return v;
  };
});
HOOKS.update.push((dt, eye, basis, sky, playing) => { try { cambriolage.update(dt, playing); } catch (e) { console.error('U : cambriolage', e); } });
HOOKS.day.push(() => {
  const S = farm.s && crochetage.U();
  if (!S) return;
  for (const k in S.maisons) if (farm.s.day - S.maisons[k].j > 4) delete S.maisons[k];
  for (const id in S.plaintes) if (farm.s.day - S.plaintes[id].j > 4) delete S.plaintes[id];
});
HOOKS.death.push(() => { for (const n of cambriolage.suivis) cambriolage.lacher(n, 30); cambriolage.flagrant = null; return false; });
