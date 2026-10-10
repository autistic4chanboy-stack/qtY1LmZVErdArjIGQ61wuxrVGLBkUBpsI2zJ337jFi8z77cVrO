// ============================================================================
//  HABITANTS : routines, déplacements (graphe de chemins, portes), mémoire,
//  réputation sans jauge, dialogues, quêtes, commerces, tournées de livraison
//  (vague 14, agent Z : les trajets sont refaits — le graphe des routes pour aller loin, la carte des pas
//   de 11-zzzzZ-1-grille.js pour chaque tronçon, le suivi et l'API « trajets » de 11-zzzzZ-2-trajets.js)
// ============================================================================

const NPC_BY_ID = {};
for (const d of NPC_DATA) NPC_BY_ID[d.id] = d;
const SHOP_DOORS = new Set(['boulangerie', 'forge', 'graineterie', 'auberge', 'poste', 'mairie']);
const NPC_HELD = { forgeron: 'marteau', garde: 'hallebarde', pecheur: 'canne', guerisseuse: 'panier', cure: 'livre', eleveuse: 'baton', grainetiere: 'panier' };
const pick = (a) => a[(Math.random() * a.length) | 0];

const npcs = {
  list: [], byId: {}, sayQueue: [],

  init(w, s) {
    this.list = []; this.byId = {};
    const rnd = mulberry32(s.seed * 5 + 3);
    for (const d of NPC_DATA) {
      if (!s.npcs[d.id]) s.npcs[d.id] = { name: d.names[(rnd() * d.names.length) | 0], amitie: 0, met: false, talkDay: 0, giftDay: 0, mem: [], anger: 0, alive: true };
      const st = s.npcs[d.id];
      const look = Object.assign({}, d.look, { held: NPC_HELD[d.id] || null, old: d.age >= 60 });
      const n = {
        id: d.id, d, st, name: st.name, rig: humanRig(look), look,
        x: 0, y: 0, z: 0, heading: 0, move: 0, phase: 0, run: false, path: [], pi: 0, goal: null, state: 'idle', hp: 100,
        bubbleT: 0, greetT: 20 + Math.random() * 40, lookY: 0, lookP: 0, talking: false, hurtT: 0, fleeT: 0, place: null, stuck: 0,
        voice: d.id === 'fillette' ? 1.7 : d.gender === 'f' ? 1.25 : d.age > 55 ? 0.8 : 0.95,
      };
      this.list.push(n); this.byId[d.id] = n;
      if (!st.alive) { n.state = 'gone'; continue; }
    }
    this.snap(w, true);
  },
  alive(id) { const n = this.byId[id]; return !!(n && n.st.alive); },
  nameOf(id) { const n = this.byId[id]; return n ? n.name : id; },
  hour() { return game.world.time * 24; },

  // ------------------------------------------------------------- routine
  schedulePlace(n, h) {
    const S = n.d.schedule;
    let cur = S[S.length - 1][1];
    if (h < S[0][0]) return { place: 'home', sleep: true };
    for (const [hr, pl] of S) if (h >= hr) cur = pl;
    const last = S[S.length - 1][0];
    return { place: cur, sleep: cur === 'home' && (h >= last + 0.6 || h < S[0][0]) };
  },
  nodeTag(tag) { const N = game.world.nav; for (let i = 0; i < N.nodes.length; i++) if (N.nodes[i].tag === tag) return i; return -1; },
  // (les nœuds sont rangés par cases de 32 m : on ne parcourt plus tout le graphe à chaque question)
  nearestNode(x, z, maxD = 1e9, filter) {
    const N = game.world.nav;
    let best = -1, bd = maxD;
    if (maxD <= 200) {
      trajets.monde(trajets.vallee());
      trajets.noeudsPres(x, z, maxD, (i, q) => { if (q.iso || (filter && !filter(q, i))) return; const d = Math.hypot(q.x - x, q.z - z); if (d < bd) { bd = d; best = i; } });
      return best;
    }
    for (let i = 0; i < N.nodes.length; i++) {
      const q = N.nodes[i];
      if (q.iso || (filter && !filter(q, i))) continue;
      const d = Math.hypot(q.x - x, q.z - z);
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  },
  // Nœud le plus proche joignable en ligne droite
  nearestReach(x, z, filter) {
    const w = game.world, N = w.nav, cand = [];
    trajets.monde(trajets.vallee());
    trajets.noeudsPres(x, z, 70, (i, q) => { if (q.iso || (filter && !filter(q, i))) return; const d = Math.hypot(q.x - x, q.z - z); if (d < 70) cand.push([d, i]); });
    cand.sort((a, b) => a[0] - b[0]);
    for (let k = 0; k < Math.min(8, cand.length); k++) { const q = N.nodes[cand[k][1]]; if (cand[k][0] < 1 || segClear(w, x, z, q.x, q.z)) return cand[k][1]; }
    return cand.length ? cand[0][1] : this.nearestNode(x, z, 1e9, filter);
  },
  // Destination d'un lieu de la routine : nœud + point précis + posture
  dest(n, pl, sleep) {
    const w = game.world, d = n.d, bld = w.bld, lm = w.lm, rnd = Math.random;
    const inB = (B, spotName, pose) => {
      const sp = (spotName && B.spots[spotName]) || null;
      const mid = w.nav.nodes[B.nMid];
      return { node: B.nMid, x: sp ? sp.x : mid.x + (rnd() - 0.5), z: sp ? sp.z : mid.z + (rnd() - 0.5), r: sp ? sp.r : null, pose, bld: B.key, y: sp && sp.y };
    };
    const at = (x, z, spread, pose, nodeFilter) => {
      let tx = x, tz = z;
      for (let k = 0; k < 10; k++) {
        const a = rnd() * TAU, r = rnd() * (spread || 0) * (k < 6 ? 1 : 1.6);
        tx = x + Math.cos(a) * r; tz = z + Math.sin(a) * r;
        if (pointFree(w, tx, tz, 0.45)) break;
      }
      return { node: this.nearestReach(tx, tz, nodeFilter || ((q) => !/:(in|mid)$/.test(q.tag))), x: tx, z: tz, pose };
    };
    const home = bld[d.home], work = bld[d.work] || home;
    if (pl === 'home') {
      if (sleep) { const B = home; const bedName = d.id === 'fillette' && B.spots.bed2 ? 'bed2' : 'bed'; return inB(B, bedName, 'lie'); }
      return inB(home, home.spots.sit ? 'sit' : null, home.spots.sit ? 'sit' : null);
    }
    if (pl === 'work') return inB(work, work.spots.work ? 'work' : null, d.id === 'forgeron' ? 'work' : null);
    if (pl === 'auberge' && bld.auberge) return inB(bld.auberge, 'sit', 'sit');
    if (pl === 'eglise' && bld.eglise) { const e = inB(bld.eglise, null, null); return e; }
    if (pl === 'place') { const i = this.nodeTag('place'), q = w.nav.nodes[i]; return at(q.x, q.z, 5); }
    if (pl === 'marche' && lm.marche) return at(lm.marche.x - 2, lm.marche.z - 2, 2.5);
    if (pl === 'puits_ville' && lm.puits_ville) return at(lm.puits_ville.x + 1.8, lm.puits_ville.z + 1.2, 0.8);
    if (pl === 'cimetiere') { const i = this.nodeTag('cimetiere'); const q = w.nav.nodes[i >= 0 ? i : 0]; return at(q.x, q.z + 6, 4); }
    if (pl === 'pont_nord' || pl === 'pont_sud') { const i = this.nodeTag(pl + ':porte'); const q = w.nav.nodes[i]; return { node: i, x: q.x + 2, z: q.z, pose: null }; }
    if ((pl === 'ponton' || pl === 'lac') && lm.ponton) {
      const i = this.nodeTag('ponton'), q = w.nav.nodes[i];
      if (pl === 'ponton') return { node: i, x: lm.ponton.x, z: lm.ponton.z, pose: 'fish', y: w.waterLevel + 0.45 };
      return at(q.x, q.z, 6, 'fish');
    }
    if (pl === 'foret' && lm.hutte_ermite) return at(lm.hutte_ermite.x + 8, lm.hutte_ermite.z + 6, 10);
    if (pl === 'hameau') { const i = this.nodeTag('hameau'); const q = w.nav.nodes[i]; return at(q.x, q.z, 5); }
    if (pl === 'ranch' || pl === 'champ') {
      if (d.id === 'eleveuse' && w.ranch) return at(w.ranch.pen.x, w.ranch.pen.z - 9, 3);
      return at(home.out[0], home.out[1], 8);
    }
    return inB(home, null, null);
  },

  // A* sur le graphe (tas binaire) ; les ponts levés, les portes verrouillées (d'autrui) et les arêtes que la carte
  // des pas a trouvées impossibles coupent le chemin
  _A: null,
  findPath(n, a, b) {
    const w = game.world, N = w.nav, nodes = N.nodes, nn = nodes.length;
    if (a < 0 || b < 0) return null;
    if (a === b) return [a];
    let A = this._A;
    if (!A || A.cap < nn) A = this._A = { cap: nn + 64, g: new Float64Array(nn + 64), par: new Int32Array(nn + 64), st: new Uint32Array(nn + 64), fer: new Uint32Array(nn + 64), tas: new Int32Array((nn + 64) * 8), cle: new Float64Array((nn + 64) * 8), gen: 0 };
    const gen = ++A.gen, B = nodes[b];
    const H = (i) => Math.hypot(nodes[i].x - B.x, nodes[i].z - B.z);
    let nt = 0;
    const push = (i, key) => { if (nt >= A.tas.length) return; let p = nt++; while (p > 0) { const q = (p - 1) >> 1; if (A.cle[q] <= key) break; A.tas[p] = A.tas[q]; A.cle[p] = A.cle[q]; p = q; } A.tas[p] = i; A.cle[p] = key; };
    const pop = () => { const top = A.tas[0]; nt--; if (nt > 0) { const i = A.tas[nt], key = A.cle[nt]; let p = 0; for (;;) { let q = 2 * p + 1; if (q >= nt) break; if (q + 1 < nt && A.cle[q + 1] < A.cle[q]) q++; if (A.cle[q] >= key) break; A.tas[p] = A.tas[q]; A.cle[p] = A.cle[q]; p = q; } A.tas[p] = i; A.cle[p] = key; } return top; };
    A.st[a] = gen; A.g[a] = 0; A.par[a] = -1;
    push(a, H(a));
    const cond = typeof trajets !== 'undefined' && trajets.condamnees.size ? trajets : null;
    while (nt > 0) {
      const cur = pop();
      if (A.fer[cur] === gen) continue;
      A.fer[cur] = gen;
      if (cur === b) { const path = []; for (let c = cur; c >= 0; c = A.par[c]) path.push(c); return path.reverse(); }
      const gc = A.g[cur];
      for (const e of N.adj[cur]) {
        if (A.fer[e.to] === gen) continue;
        if (!this.edgeOk(n, e)) continue;
        if (cond && cond.condamnee(cur, e.to)) continue;
        const ng = gc + e.d;
        if (A.st[e.to] === gen && A.g[e.to] <= ng) continue;
        A.st[e.to] = gen; A.g[e.to] = ng; A.par[e.to] = cur;
        push(e.to, ng + H(e.to));
      }
    }
    return null;
  },
  edgeOk(n, e) {
    const w = game.world, fl = e.flag;
    if (!fl) return true;
    if (fl.startsWith('bridge:')) { const b = w.bridges[+fl.slice(7)]; return !b || b.a < 0.3; }
    // (une porte fermée à clé : ses gens l'ouvrent ; on sort toujours d'une maison où l'on se trouve)
    if (fl.startsWith('door:')) { const dr = w.doors[+fl.slice(5)]; return !dr || !dr.locked || (n && (dr.bld === n.d.home || dr.bld === n.d.work || n.inside === dr.bld)); }
    return true;
  },

  // Place tout le monde là où sa routine l'attend (chargement, réveil) — couché dans SON lit la nuit
  snap(w, first) {
    const h = this.hour();
    if (typeof trajets !== 'undefined') trajets.monde(w);
    for (const n of this.list) {
      if (!n.st.alive || n.vanished || n.hunting) continue;
      // (un ordre en cours — trajets.allerA, reveiller — est interrompu : sa fin est appelée, fin(n, false))
      if (n.zOrdre && typeof trajets !== 'undefined') trajets.liberer(n);
      const sp = this.schedulePlace(n, h);
      const D = typeof trajets !== 'undefined' ? trajets.but(n, this.dest(n, sp.place, sp.sleep), true) : this.dest(n, sp.place, sp.sleep);
      n.place = sp.place; n.sleep = sp.sleep; n.goal = D; n.path = []; n.pi = 0;
      n.x = D.x; n.z = D.z; n.heading = D.r ?? Math.random() * TAU;
      n.y = D.y !== undefined && D.y !== null ? D.y : w.groundAt(D.x, D.z, w.heightAt(D.x, D.z) + 1.2, 0.8);
      n.state = sp.sleep ? 'sleep' : 'idle'; n.inside = D.bld || null;
      n.zt = { G: D, fini: true, pts: [], k: 0, ni: 0 }; n.zInst = null; n.zOrdre = null; n.zEtat = n.state; n.move = 0;
    }
    this.updateDoors(w, true);
  },

  // Portes : boutiques ouvertes le jour ; tout est fermé à clé la nuit (sauf nuits rouges)
  updateDoors(w, instant) {
    const h = this.hour(), red = strange.redNight();
    for (let i = 0; i < w.doors.length; i++) {
      const dr = w.doors[i];
      if (!dr.bld || dr.bld === 'ferme' || dr.bld === 'poulailler') continue;
      const owners = this.list.filter((n) => n.d.home === dr.bld);
      const ownerHome = owners.some((n) => n.st.alive && (n.sleep || n.state === 'sleep') && !n.hunting);
      if (red) { dr.locked = false; if (dr.open === 0 && Math.random() < 0.02) dr.open = 1; continue; }
      if (dr.forced) continue;
      const night = h >= 20.5 || h < 6;
      if (SHOP_DOORS.has(dr.bld) && !night && h >= 7.5 && h < 19 && this.shopOwnerAlive(dr.bld)) { dr.locked = false; if (!dr.playerClosed) dr.open = 1; }
      else if (night) {
        if (dr.open && !this.someoneInDoor(dr)) dr.open = 0;
        const hunter = owners.some((n) => n.hunting);
        dr.locked = !hunter && (ownerHome || owners.length === 0 || owners.every((n) => !n.st.alive)) && !dr.open;
      } else if (dr.locked && h >= 6) { dr.locked = false; }
      if (instant) dr.a = dr.open ? 1.5 : 0;
    }
  },
  shopOwnerAlive(bld) { return this.list.some((n) => n.d.work === bld && n.st.alive); },
  someoneInDoor(dr) {
    const p = game.player;
    if (Math.hypot(p.pos[0] - dr.x, p.pos[2] - dr.z) < 1.2) return true;
    return this.list.some((n) => n.st.alive && !n.vanished && Math.hypot(n.x - dr.x, n.z - dr.z) < (n.state === 'walk' ? 1.6 : 1.0));
  },

  // ------------------------------------------------------------- mise à jour
  update(dt, w, c) {
    const h = this.hour();
    trajets.image();
    this.doorT = (this.doorT || 0) - dt;
    if (this.doorT <= 0) { this.doorT = 1; this.updateDoors(w, false); }
    for (const dr of w.doors) { const tgt = dr.open ? 1.5 : 0; dr.a += clamp(tgt - dr.a, -dt * 3, dt * 3); }
    for (const n of this.list) {
      if (n.state === 'gone' || n.vanished || n.hunting) continue;
      n.hurtT = Math.max(0, n.hurtT - dt);
      n.bubbleT = Math.max(0, n.bubbleT - dt);
      const dx = n.x - c.px, dz = n.z - c.pz;
      n.dist = Math.hypot(dx, dz);
      if (!n.st.alive) { n.move = 0; continue; }
      if (n.talking) { n.move = 0; n.heading = turnToward(n.heading, Math.atan2(c.px - n.x, c.pz - n.z), dt * 4); n.lookY = 0; continue; }
      // réaction à un meurtrier connu ou au joueur qui frappe
      if (n.fleeT > 0) { n.fleeT -= dt; this.flee(n, dt, w, c); continue; }
      if (this.hostile(n) && n.dist < 22 && c.visible(n)) {
        if (n.d.id === 'garde' && !n.sleep) { if (this.guardAttack(n, dt, w, c)) continue; }
        else if (!n.sleep && n.dist < 12) { n.fleeT = 6; this.say(n, pick(['Au secours ! C’est l’assassin !', 'N’approchez pas !', 'À l’aide !']), 2.5); continue; }
      }
      // réveillé par un bruit, un voleur, une fouille (un autre module l'a levé) : il reste debout un moment
      if (n.zEtat === 'sleep' && n.state !== 'sleep' && !n.sleep && !n.zOrdre && !n.talking && n.fleeT <= 0) {
        const sp0 = this.schedulePlace(n, h);
        if (sp0.sleep) trajets.reveiller(n, { duree: 20 + Math.random() * 25, raison: 'reveil' });
      }
      // un ordre (trajets.allerA, reveiller…) mène ; sinon la routine
      if (!trajets.mener(n)) {
        const sp = this.schedulePlace(n, h);
        if (sp.place !== n.place || sp.sleep !== n.sleep || !n.goal) {
          n.place = sp.place; n.sleep = sp.sleep;
          n.goal = trajets.but(n, this.dest(n, sp.place, sp.sleep));
          // loin des yeux du joueur (départ et arrivée) : on y est déjà
          const pd = Math.hypot(n.x - c.px, n.z - c.pz), gd = Math.hypot(n.goal.x - c.px, n.goal.z - c.pz);
          if (pd > ZT_SAUT && gd > ZT_SAUT) {
            const D = n.goal;
            n.x = D.x; n.z = D.z; n.heading = D.r ?? n.heading;
            n.y = D.y !== undefined && D.y !== null ? D.y : w.groundAt(D.x, D.z, w.heightAt(D.x, D.z) + 1.2, 0.8);
            n.state = n.sleep ? 'sleep' : 'idle'; n.inside = D.bld || null; n.path = []; n.move = 0;
            n.zt = { G: D, fini: true, pts: [], k: 0, ni: 0 }; n.zInst = null; n.zEtat = n.state;
            continue;
          }
          trajets.partir(n, n.goal);
        }
      }
      if (n.state === 'walk') this.walk(n, dt, w, c);
      else if (n.state === 'sleep') { n.move = 0; }
      else { n.move = lerp(n.move, 0, Math.min(1, dt * 6)); this.idleLook(n, dt, c); }
      n.zEtat = n.state;
      // salutations spontanées
      n.greetT -= dt;
      if (n.greetT <= 0 && n.dist < 6 && n.state !== 'sleep' && c.visible(n) && !n.talking) {
        n.greetT = 70 + Math.random() * 90;
        if (n.st.met && Math.random() < 0.55) this.say(n, this.shortGreet(n), 3);
      }
    }
  },
  inNode(n, i) { const q = game.world.nav.nodes[i]; return n.inside && q.tag.startsWith(n.inside + ':'); },
  idleLook(n, dt, c) {
    const want = n.dist < 7 ? angDiff(n.heading, Math.atan2(c.px - n.x, c.pz - n.z)) : 0;
    n.lookY = lerp(n.lookY, Math.abs(want) < 1.7 ? clamp(want, -1.1, 1.1) : 0, Math.min(1, dt * 3));
    if (n.goal && n.goal.r !== null && n.goal.r !== undefined && n.dist > 3) n.heading = turnToward(n.heading, n.goal.r, dt * 2);
  },
  // la marche (le suivi d'un trajet) et la fuite : 11-zzzzZ-2-trajets.js
  walk(n, dt, w, c) { return trajets.marcher(n, dt, w, c); },
  flee(n, dt, w, c) { return trajets.fuir(n, dt, w, c); },
  guardAttack(n, dt, w, c) {
    n.atkT = Math.max(0, (n.atkT || 0) - dt);
    if (n.dist > 1.8) {
      n.heading = turnToward(n.heading, Math.atan2(c.px - n.x, c.pz - n.z), dt * 6);
      let nx = n.x + Math.sin(n.heading) * 4.5 * dt, nz = n.z + Math.cos(n.heading) * 4.5 * dt;
      [nx, nz] = w.collideCircle(nx, nz, n.y, n.y + 1.7, 0.28, 0.5, true);
      n.x = nx; n.z = nz; n.y = w.groundAt(nx, nz, n.y + 0.6, 0.6);
      n.move = 1; n.run = true; n.phase += dt * 9;
      if (Math.random() < dt * 0.3) this.say(n, pick(['Halte ! Au nom de la loi !', 'Rendez-vous, assassin !', 'Vous ne quitterez pas la vallée !']), 2.5);
      return true;
    }
    n.move = 0;
    if (n.atkT <= 0) { n.atkT = 1.6; n.attackAnim = 0.5; play.hurt(34, n, 'Abattu par ' + n.name + ', le garde'); }
    return true;
  },

  // ------------------------------------------------------------- réputation et mémoire
  murdererKnown() { return farm.s.rep.crimes.some((k) => k.known); },
  hostile(n) { return n.st.alive && this.murdererKnown() && !n.talking; },
  level(n) { return Math.floor((n.st.amitie || 0) / 100); },
  addAmitie(n, k) { n.st.amitie = clamp((n.st.amitie || 0) + k, -300, 1000); },
  remember(n, t, data) { n.st.mem.push(Object.assign({ t, day: farm.s.day }, data || {})); if (n.st.mem.length > 30) n.st.mem.shift(); },
  witnesses(x, z, except) {
    const w = game.world, out = [];
    for (const m of this.list) {
      if (!m.st.alive || m === except || m.sleep || m.vanished || m.hunting) continue;
      const d = Math.hypot(m.x - x, m.z - z);
      if (d > 28) continue;
      if (segClear(w, m.x, m.z, x, z) || d < 6) out.push(m);
    }
    return out;
  },
  hurt(n, dmg, by) {
    if (!n.st.alive || n.state === 'gone') return;
    n.hp -= dmg; n.hurtT = 0.35;
    sound.hurtHuman && sound.hurtHuman(n.voice);
    if (by === 'joueur') {
      const wit = this.witnesses(n.x, n.z, n);
      n.st.anger = Math.max(n.st.anger || 0, 5);
      this.addAmitie(n, -120);
      this.remember(n, 'coup');
      for (const m of wit) { this.remember(m, 'vu_coup', { victim: n.id }); this.addAmitie(m, -40); }
      if (n.hp > 0) {
        this.say(n, pick(['Aïe ! Mais vous êtes fou ?!', 'Arrêtez ! Au secours !', 'Qu’est-ce qui vous prend ?!']), 2.5);
        n.fleeT = 8; n.talking = false;
        const g = this.byId.garde;
        if (g && g.st.alive && g !== n && wit.includes(g)) g.fleeT = 0;
      } else this.kill(n, 'joueur', wit);
    } else if (n.hp <= 0) this.kill(n, by, []);
  },
  kill(n, by, wit) {
    n.st.alive = false; n.hp = 0; n.state = 'dead'; n.move = 0; n.talking = false;
    n.st.dead = { day: farm.s.day, by, x: Math.round(n.x), z: Math.round(n.z) };
    sound.scream && sound.scream(n.voice);
    if (by === 'joueur') {
      farm.s.rep.crimes.push({ victim: n.id, day: farm.s.day, known: wit.length > 0, killer: strange.isKiller(n.id) });
      if (strange.isKiller(n.id)) strange.killerDead(n, true);
      for (const m of wit) this.remember(m, 'meurtre', { victim: n.id });
    }
    farm.s.dead.push({ id: n.id, name: n.name, day: farm.s.day, by });
  },
  // Le lendemain, les corps sont trouvés puis enterrés
  morning(w) {
    for (const n of this.list) {
      if (n.st.alive || n.state === 'gone') continue;
      n.state = 'gone';
      const cr = farm.s.rep.crimes.find((k) => k.victim === n.id);
      if (cr && !cr.known && cr.day === farm.s.day - 1) cr.found = true;
      strange.bury(n);
    }
    for (const n of this.list) if (n.st.anger > 0) n.st.anger--;
  },

  // ------------------------------------------------------------- paroles (sous-titres)
  say(n, text, dur) {
    n.bubble = fmtLine(text, n); n.bubbleT = dur || Math.min(7, 1.6 + text.length * 0.045);
    ui.subtitle(n.st.met ? n.name : '???', n.bubble, n.bubbleT);
    sound.voice && sound.mumble(n.voice, n.bubble.length, (n.x - game.player.pos[0]));
  },
  shortGreet(n) {
    const G = n.d.lines.greet, h = this.hour();
    if (this.murdererKnown()) return pick(G.peur);
    if (n.st.anger > 0) return pick(G.froid);
    const key = game.sky.wet > 0.5 ? (weather.cur.storm > 0.5 ? 'orage' : 'pluie') : h < 11 ? 'matin' : h < 18 ? 'jour' : 'soir';
    return pick(G[key] || G.jour);
  },
  // On frappe à une porte fermée à clé
  knock(dr) {
    const owners = this.list.filter((n) => n.d.home === dr.bld && n.st.alive && !n.vanished);
    sound.knock && sound.knock();
    setTimeout(() => {
      const n = owners.find((m) => !m.hunting);
      if (strange.redNight() || (!n && owners.length)) { if (Math.random() < 0.5) ui.subtitle('…', pick(NPC_GENERIC.toquer), 3); return; }
      if (!n) return;
      if (this.murdererKnown()) { ui.subtitle(n.st.met ? n.name : '???', 'Allez-vous-en ! J’ai une arme !', 3); return; }
      this.remember(n, 'nuit');
      ui.subtitle(n.st.met ? n.name : '???', fmtLine(Math.random() < 0.7 ? n.d.lines.nuit : pick(NPC_GENERIC.toquer), n), 4.5);
      sound.mumble && sound.mumble(n.voice, 30, 0, 0.5);
    }, 1400);
  },

  // ------------------------------------------------------------- rendu, visée
  draw(buf, sbuf, cam, t, maxD) {
    const max2 = maxD * maxD;
    for (const n of this.list) {
      if (n.state === 'gone' || n.vanished || n.hunting) continue;
      const dx = n.x - cam[0], dz = n.z - cam[2];
      if (dx * dx + dz * dz > max2) continue;
      const lie = n.state === 'sleep' || n.state === 'dead';
      if (this.preDraw) this.preDraw(n, t);
      const r = n.rig;
      const workNow = n.goal && n.goal.pose === 'work' && n.state === 'idle';
      const sitNow = n.goal && n.goal.pose === 'sit' && n.state === 'idle' && !n.talking;
      poseHuman(r, { move: n.move, phase: n.phase, run: n.run, t, lookY: n.talking ? 0 : n.lookY, lookP: n.lookP || 0, talk: (n.talking && n.speakT > 0) || n.chatT > 0, work: workNow, fish: n.goal && n.goal.pose === 'fish' && n.state === 'idle', sit: sitNow, attack: n.attackAnim > 0 ? n.attackAnim : 0, wave: n.waveT > 0, nod: n.nodT > 0, cross: n.gesture === 'bras', pray: n.gesture === 'priere' });
      if (n.attackAnim > 0) n.attackAnim = Math.max(0, n.attackAnim - 0.016);
      // objet tenu : visible selon l'activité
      const it = r.part('it0');
      if (it) { const show = n.d.id === 'garde' || n.d.id === 'cure' || (n.d.id === 'forgeron' && workNow) || (n.d.id === 'pecheur' && n.goal && n.goal.pose === 'fish') || (n.d.id === 'guerisseuse' && n.place === 'foret') || (n.d.id === 'grainetiere' && n.place === 'marche') || (n.d.id === 'eleveuse' && n.place !== 'home'); it.hide = !show; const it1 = r.part('it1'); if (it1) it1.hide = !show; }
      const fl = (n.hurtT > 0 || n.hi ? FX_HI : 0);
      const s = n.look.height || 1;
      if (lie) {
        m34Root(_root, n.x, n.y + (n.state === 'dead' ? 0.15 : 0.2), n.z, n.heading, s);
        m34TR(_mT, 0, 0, -0.9, Math.PI / 2, 0, 0);
        const M = new Float32Array(12); m34Mul(M, _root, _mT);
        drawRigM(buf, r, M, fl);
      } else { drawRig(buf, r, n.x, n.y, n.z, n.heading, s, fl); if (sbuf) drawShadow(sbuf, n.x, n.y, n.z, 0.34 * s); }
    }
  },
  raycast(o, d, maxDist) {
    let best = null;
    const dh = Math.hypot(d[0], d[2]) || 1e-6;
    for (const n of this.list) {
      if (n.state === 'gone' || n.vanished || n.hunting || n.state === 'dead') continue;
      const cx = n.x - o[0], cz = n.z - o[2];
      const tc = (cx * d[0] + cz * d[2]) / (dh * dh);
      if (tc < 0 || tc > maxDist) continue;
      const px = d[0] * tc - cx, pz = d[2] * tc - cz;
      if (px * px + pz * pz > 0.34 * 0.34) continue;
      const y = o[1] + d[1] * tc, top = n.y + 1.85 * (n.look.height || 1);
      if (y < n.y - 0.1 || y > top + 0.1) continue;
      if (!best || tc < best.t) best = { t: tc, n, p: [o[0] + d[0] * tc, y, o[2] + d[2] * tc] };
    }
    return best;
  },
  saveState(s) { for (const n of this.list) s.npcs[n.id] = n.st; },
  // Nuits rouges : tout le monde disparaît (et revient au matin sans souvenir)
  vanishAll(v) { for (const n of this.list) { if (!n.st.alive) continue; n.vanished = v; } if (!v) this.snap(game.world); },
};

// ---------------------------------------------------------------- mise en forme des répliques
// « au {lieu:cimetiere} » → « au cimetière », « du {lieu:ruines} » → « des ruines », « à {lieu:chapelle} » → « à la chapelle »
function lieuApres(prep, nom) {
  const m = /^(?:(les|le|la)\s+|(l['’]))/i.exec(nom);
  if (!m) return prep + ' ' + nom;
  const mot = m[1] || m[2], art = mot.toLowerCase(), reste = nom.slice(m[0].length);
  const versA = prep === 'au' || prep === 'aux' || prep === 'à', apo = !m[1];
  if (art === 'le') return (versA ? 'au ' : 'du ') + reste;
  if (art === 'les') return (versA ? 'aux ' : 'des ') + reste;
  return (versA ? 'à ' : 'de ') + (apo ? mot : mot + ' ') + reste;
}
function fmtLine(t, n, extra) {
  if (!t) return '';
  const prenom = farm.s.prenom || (farm.s.fem ? 'Jeanne' : 'Jean');
  const intime = n && n.st && npcs.level(n) >= 3 && farm.s.prenom;
  return String(t)
    .replace(/\{nom\}/g, n ? n.name : '')
    .replace(/\{prenom\}/g, prenom)
    .replace(/\{objet\}/g, (extra && extra.objet) || 'ce cadeau')
    .replace(/\{fermier\}/g, intime ? prenom : farm.s.fem ? 'la nouvelle fermière' : 'le nouveau fermier')
    .replace(/\{ville\}/g, farm.names.ville).replace(/\{hameau\}/g, farm.names.hameau)
    .replace(/\{npc:(\w+)\}/g, (_, id) => npcs.nameOf(id))
    .replace(/(^|[\s(«“’'])(au|aux|du|des|à|de) \{lieu:(\w+)\}/g, (_, av, prep, k) => av + lieuApres(prep, LIEU_NAMES[k] || k))
    .replace(/\{lieu:(\w+)\}/g, (_, k) => LIEU_NAMES[k] || k)
    .replace(/\{victime\}/g, (extra && extra.victime) || (farm.s.dead.length ? farm.s.dead[farm.s.dead.length - 1].name : 'quelqu’un'))
    .replace(/\{jour\}/g, String(farm.s.day));
}

// ============================================================================
//  DIALOGUES : choix des répliques et déroulement des quêtes
// ============================================================================
const talk = {
  n: null, rumorI: 0,

  open(n) {
    this.n = n;
    n.talking = true; n.speakT = 2;
    const st = n.st, L = n.d.lines, s = farm.s;
    let text;
    if (npcs.murdererKnown()) {
      text = Math.random() < 0.5 ? L.meurtre : pick(L.greet.peur);
      return this.view(text, n.d.id === 'garde' ? [] : [{ label: 'Partir', act: 'bye' }], true);
    }
    if (!st.met) { st.met = true; text = L.intro; npcs.addAmitie(n, 15); }
    else if (st.anger > 0) text = pick(L.greet.froid);
    else if (strange.wasRedNight() && st.redSeen !== s.day) { st.redSeen = s.day; text = L.nuitrouge; }
    else if (s.dead.length && s.dead[s.dead.length - 1].day >= s.day - 2 && st.deuil !== s.dead[s.dead.length - 1].id && s.dead[s.dead.length - 1].id !== n.id) {
      const v = s.dead[s.dead.length - 1]; st.deuil = v.id; text = fmtLine(L.disparu, n, { victime: v.name });
    }
    else if (npcs.level(n) >= 6 && Math.random() < 0.5) text = pick(L.greet.ami);
    else text = npcs.shortGreet(n);
    if (st.talkDay !== s.day) { st.talkDay = s.day; npcs.addAmitie(n, 12); }
    return this.view(text, this.options());
  },
  view(text, options, raw) {
    const n = this.n;
    const t = raw ? fmtLine(text, n) : fmtLine(text, n);
    n.speakT = Math.min(6, 1 + t.length * 0.04);
    sound.mumble && sound.mumble(n.voice, t.length, 0);
    return { name: n.st.met ? n.name + ' ' + n.d.surname : '???', role: n.st.met ? n.d.role : '', text: t, options };
  },
  options() {
    const n = this.n, s = farm.s, opts = [];
    opts.push({ label: 'Discuter', act: 'chat' });
    opts.push({ label: 'Parlez-moi de vous', act: 'about' });
    // quêtes
    for (const q of n.d.quests) {
      const Q = s.quests[q.id];
      if (Q && Q.st === 'actif') opts.push({ label: '« ' + q.title + ' »', act: 'q:' + q.id, quest: true });
    }
    // livraisons / messages pour cet habitant
    for (const d of NPC_DATA) for (const q of d.quests) {
      const Q = s.quests[q.id];
      if (!Q || Q.st !== 'actif' || Q.step) continue;
      if (q.type === 'livrer' && q.a === n.id && farm.count(q.objet)) opts.push({ label: 'Remettre : ' + (ITEMS[q.objet] ? ITEMS[q.objet].name : q.objet), act: 'give:' + q.id, quest: true });
      if (q.type === 'parler' && q.a === n.id) opts.push({ label: 'Un message de ' + npcs.nameOf(d.id), act: 'msg:' + q.id, quest: true });
    }
    if (s.deliveries && s.deliveries.day === s.day) for (const p of s.deliveries.list) if (!p.done && p.to === n.id && farm.count('colis')) opts.push({ label: 'Un colis pour vous', act: 'colis', quest: true });
    const next = this.nextQuest();
    if (next && !n.d.quests.some((q) => s.quests[q.id] && s.quests[q.id].st === 'actif')) opts.push({ label: 'Avez-vous besoin d’aide ?', act: 'offer' });
    const hid = s.hand;
    if (hid !== 'main' && ITEMS[hid] && !ITEMS[hid].tool && ITEMS[hid].cat !== 'animal' && farm.count(hid)) opts.push({ label: 'Offrir : ' + ITEMS[hid].name, act: 'gift' });
    if (n.d.shop) opts.push({ label: 'Commercer', act: 'shop' });
    if (n.d.id === 'aubergiste') opts.push({ label: 'Louer une chambre (20 pièces)', act: 'rent' });
    if (n.d.id === 'postiere') opts.push({ label: 'Avez-vous des colis à livrer ?', act: 'job' });
    if ((n.d.id === 'garde' || (n.d.id === 'maire' && !npcs.alive('garde'))) && strange.killerActive()) opts.push({ label: 'Je sais qui est l’assassin…', act: 'accuse' });
    opts.push({ label: 'Au revoir', act: 'bye' });
    return opts;
  },
  nextQuest() {
    const n = this.n, s = farm.s, lvl = npcs.level(n);
    for (const q of n.d.quests) {
      const Q = s.quests[q.id];
      if (Q && Q.st === 'fait') continue;
      if (Q && Q.st === 'actif') return null;
      if ((q.minAmitie || 0) > lvl) return null;
      if (Q && Q.st === 'refus' && Q.day === s.day) return null;
      return q;
    }
    return null;
  },
  choose(act) {
    const n = this.n, s = farm.s, L = n.d.lines;
    if (act === 'bye') { this.close(); return null; }
    if (act === 'chat') return this.view(this.chatLine(), this.options());
    if (act === 'about') {
      const k = Math.min(L.about.length - 1, Math.floor(npcs.level(n) / 2));
      n.st.aboutK = Math.max(n.st.aboutK || 0, k);
      const i = n.st.aboutI = ((n.st.aboutI || 0) + 1) % (k + 1);
      return this.view(L.about[k === 0 ? 0 : (i === 0 ? k : i)], this.options());
    }
    if (act === 'offer') {
      const q = this.nextQuest();
      if (!q) return this.view(pick(L.adieu), this.options());
      this.pendingOffer = q;
      return this.view(q.texte.offre, [{ label: 'D’accord, je m’en charge', act: 'accept' }, { label: 'Pas maintenant', act: 'decline' }]);
    }
    if (act === 'accept') { const q = this.pendingOffer; this.pendingOffer = null; if (!q) return this.view('…', this.options()); quests.accept(q, n); return this.view(q.texte.accepte, this.options()); }
    if (act === 'decline') { const q = this.pendingOffer; this.pendingOffer = null; if (q) s.quests[q.id] = { st: 'refus', day: s.day }; return this.view(pick(L.adieu), this.options()); }
    if (act.startsWith('q:')) {
      const q = n.d.quests.find((x) => x.id === act.slice(2));
      if (quests.canComplete(q)) { quests.complete(q, n); return this.view(q.texte.fin, this.options()); }
      return this.view(q.texte.attente, this.options());
    }
    if (act.startsWith('give:') || act.startsWith('msg:')) {
      const qid = act.slice(act.indexOf(':') + 1), q = quests.byId(qid);
      if (q.type === 'livrer') farm.take(q.objet, 1);
      s.quests[qid].step = 1;
      npcs.addAmitie(n, 20);
      return this.view(q.texte.recu, this.options());
    }
    if (act === 'colis') {
      const p = s.deliveries.list.find((x) => !x.done && x.to === n.id);
      if (p) {
        p.done = true; farm.take('colis', 1);
        const h = npcs.hour(), pay = p.pay + (h < 12 ? 15 : 0);
        farm.earn(pay); sound.coin && sound.coin(); npcs.addAmitie(n, 15);
        return this.view(pick(['Ah, enfin ! Merci bien.', 'Pour moi ? Merci, vous êtes bien aimable.', 'Il était temps ! Merci.', 'Oh, je l’attendais. Merci.']), this.options());
      }
      return this.view('…', this.options());
    }
    if (act === 'gift') return this.gift();
    if (act === 'shop') { ui.openShop(n); return 'keep'; }
    if (act === 'rent') {
      if (npcs.hour() < 18 && npcs.hour() > 5) return this.view('Les chambres, c’est pour le soir, voyons. Revenez après six heures.', this.options());
      if (!farm.pay(20)) return this.view('Vingt pièces la nuit, c’est le prix. Et je ne fais pas crédit.', this.options());
      s.flags.rented = s.day; sound.coin && sound.coin();
      return this.view('Le lit du fond est à vous. Les draps sont propres, je le jure sur la tête de ma mère.', this.options());
    }
    if (act === 'job') return this.view(deliveries.offer(n), this.options());
    if (act === 'accuse') {
      const alive = npcs.list.filter((m) => m.st.alive && m.st.met && m !== n);
      return this.view('Qui accusez-vous ? Réfléchissez bien : on ne revient pas sur de telles paroles.', alive.slice(0, 9).map((m) => ({ label: m.name + ' (' + m.d.role.toLowerCase() + ')', act: 'acc:' + m.id })).concat([{ label: 'Personne, oubliez ça', act: 'chat' }]));
    }
    if (act.startsWith('acc:')) return this.view(strange.accuse(act.slice(4), n), this.options());
    return this.view('…', this.options());
  },
  chatLine() {
    const n = this.n, L = n.d.lines, s = farm.s, tension = strange.tension();
    const r = Math.random();
    if (strange.isKiller(n.id) && strange.killerPhase() >= 1 && r < 0.2) return pick(L.tueur);
    if (tension > 0.25 && r < 0.2 + tension * 0.2) return Math.random() < 0.6 ? pick(L.etrange) : pick(NPC_GENERIC.etrange);
    if (r < 0.62) { this.rumorI++; const R = L.rumeurs; return R[(this.rumorI + n.id.length) % R.length]; }
    if (r < 0.8 && n.d.id !== 'fillette') {
      const f = weather.tomorrow();
      const M = NPC_GENERIC.meteo[f] || NPC_GENERIC.meteo.soleil;
      return pick(M) + (f === 'gel' ? ' On annonce du gel pour demain matin.' : f === 'orage' ? ' Et demain, ça va tonner.' : '');
    }
    if (r < 0.9 && n.d.id !== 'fillette') return pick(NPC_GENERIC.vallee);
    return n.d.id === 'fillette' ? pick(L.rumeurs) : pick(NPC_GENERIC.rumeurs);
  },
  gift() {
    const n = this.n, s = farm.s, id = s.hand, L = n.d.lines;
    if (n.st.giftDay === s.day) return this.view(pick(['Vous m’avez déjà fait un cadeau aujourd’hui ! Gardez-le.', 'Encore ? Non, non, c’est trop.']), this.options());
    if (!farm.take(id, 1)) return this.view('…', this.options());
    n.st.giftDay = s.day;
    let k = 'neutre', pts = 25;
    if ((n.d.loves || []).includes(id)) { k = 'adore'; pts = 90; }
    else if ((n.d.likes || []).includes(id)) { k = 'aime'; pts = 50; }
    else if ((n.d.dislikes || []).includes(id)) { k = 'deteste'; pts = -40; }
    npcs.addAmitie(n, pts);
    npcs.remember(n, 'cadeau', { item: id, k });
    return this.view(L.cadeau[k], this.options());
  },
  close(keep) { if (this.n) { this.n.talking = false; } if (!keep) this.n = null; },
};

// ============================================================================
//  QUÊTES
// ============================================================================
const quests = {
  byId(id) { for (const d of NPC_DATA) for (const q of d.quests) if (q.id === id) return q; return null; },
  giver(id) { for (const d of NPC_DATA) for (const q of d.quests) if (q.id === id) return d.id; return null; },
  accept(q, n) {
    const s = farm.s, Q = s.quests[q.id] = { st: 'actif', day: s.day, step: 0 };
    if (q.type === 'livrer' && q.objet) farm.give(q.objet, 1);
    if (q.type === 'trouver') {
      const w = game.world, L = w.lm[q.lieu] || w.lm.ferme;
      for (let k = 0; k < 60; k++) {
        const a = Math.random() * TAU, d = L.r * (0.3 + Math.random() * 0.6), x = L.x + Math.cos(a) * d, z = L.z + Math.sin(a) * d;
        if (w.heightAt(x, z) < w.waterLevel + 0.3) continue;
        Q.pos = [Math.round(x * 10) / 10, Math.round(z * 10) / 10];
        break;
      }
      if (!Q.pos) Q.pos = [L.x + 2, L.z + 2];
      this.spawnFind(q, Q);
    }
    sound.quest && sound.quest();
  },
  // Objet à trouver : posé au sol, ramassable
  spawnFind(q, Q) {
    const w = game.world, [x, z] = Q.pos, y = w.groundAt(x, z, w.heightAt(x, z) + 2, 2.5);
    const it = (w.inter || []).find((i) => i.id === 'quete_' + q.id);
    if (it) return;
    w.inter.push({ kind: 'pickup', id: 'quete_' + q.id, x, y: y + 0.25, z, name: 'Ramasser', data: { item: q.objet, quest: q.id } });
    const p = { id: q.objet === 'poupee_chiffon' ? 'poupee' : 'livre', x, y, z, r: Math.random() * TAU, questFind: q.id };
    if (['alliance', 'bague_sceau', 'clochette', 'fer_a_cheval', 'pipe', 'chapelet', 'dent_de_loup', 'boussole', 'cle_rouillee'].includes(q.objet)) p.id = 'figurine';
    w.props.push(p); farm.dirtyProps = true;
  },
  restore(w) {
    const s = farm.s;
    for (const id in s.quests) {
      const Q = s.quests[id];
      if (Q.st !== 'actif') continue;
      const q = this.byId(id);
      if (q && q.type === 'trouver' && !Q.found && Q.pos) this.spawnFind(q, Q);
    }
  },
  canComplete(q) {
    const s = farm.s, Q = s.quests[q.id];
    if (!Q || Q.st !== 'actif') return false;
    if (q.type === 'apporter') return farm.has(q.need);
    if (q.type === 'livrer' || q.type === 'parler' || q.type === 'enquete') return Q.step >= 1;
    if (q.type === 'trouver') return farm.count(q.objet) > 0;
    return false;
  },
  complete(q, n) {
    const s = farm.s, Q = s.quests[q.id];
    if (q.type === 'apporter') for (const k in q.need) farm.take(k, q.need[k]);
    if (q.type === 'trouver') farm.take(q.objet, 1);
    Q.st = 'fait'; Q.done = s.day;
    const R = q.reward || {};
    if (R.argent) { farm.earn(R.argent); sound.coin && sound.coin(); }
    if (R.amitie) npcs.addAmitie(n, R.amitie * 60);
    if (R.objets) for (const k in R.objets) if (ITEMS[k]) farm.give(k, R.objets[k]);
    if (R.recette) { if (!s.known[R.recette] && LOCKED_RECIPES.has(R.recette)) s.known[R.recette] = 1; else if (R.recette && ITEMS[R.recette]) farm.give(R.recette, 1); }
    npcs.remember(n, 'aide', { q: q.id });
    // les amis de l'habitant l'apprennent
    for (const other in (n.d.liens || {})) { const m = npcs.byId[other]; if (m) npcs.addAmitie(m, 15); }
    s.rep.hero++;
    sound.quest && sound.quest(true);
  },
  // Enquêtes : se rendre au lieu, au bon moment
  update(dt) {
    const s = farm.s, p = game.player, h = npcs.hour(), w = game.world;
    this.t = (this.t || 0) - dt;
    if (this.t > 0) return;
    this.t = 1;
    for (const id in s.quests) {
      const Q = s.quests[id];
      if (Q.st !== 'actif' || Q.step) continue;
      const q = this.byId(id);
      if (!q || q.type !== 'enquete') continue;
      const L = w.lm[q.lieu];
      if (!L) continue;
      const okT = q.moment === 'nuit' ? (h >= 21.5 || h < 4) : (h >= 4.5 && h < 7.5);
      if (!okT) { Q.stay = 0; continue; }
      if (Math.hypot(p.pos[0] - L.x, p.pos[2] - L.z) < Math.max(12, L.r)) {
        Q.stay = (Q.stay || 0) + 1;
        if (Q.stay >= 6) { Q.step = 1; strange.stage(q.lieu, q.moment); }
      } else Q.stay = 0;
    }
  },
};

// ============================================================================
//  TOURNÉES DE LIVRAISON (la poste)
// ============================================================================
const deliveries = {
  offer(n) {
    const s = farm.s;
    if (s.deliveries && s.deliveries.day === s.day) {
      const left = s.deliveries.list.filter((p) => !p.done);
      if (!left.length) return 'Tout est livré pour aujourd’hui. Beau travail ! Revenez demain matin.';
      return 'Il vous reste ' + left.length + ' colis à porter : ' + left.map((p) => npcs.nameOf(p.to) + ' (' + (LIEU_NAMES[NPC_BY_ID[p.to].home] || '') + ')').join(', ') + '. Avant six heures du soir, sinon ça ne compte pas.';
    }
    const h = npcs.hour();
    if (h > 14) return 'Les tournées partent le matin. Revenez demain de bonne heure.';
    const cand = npcs.list.filter((m) => m.st.alive && m.d.id !== 'postiere' && m.d.id !== 'fillette');
    const k = 1 + Math.floor(Math.random() * 3), list = [];
    for (let i = 0; i < k && cand.length; i++) {
      const m = cand.splice((Math.random() * cand.length) | 0, 1)[0];
      const far = ['ranch', 'cabane_pecheur', 'hutte_ermite'].includes(m.d.home);
      list.push({ to: m.id, pay: far ? 55 : 25, done: false });
    }
    s.deliveries = { day: s.day, list };
    farm.give('colis', list.length);
    return 'Du travail ? Tenez : ' + list.map((p) => npcs.nameOf(p.to)).join(', ') + '. Un colis chacun, remis en main propre avant six heures. On paie à la livraison.';
  },
  update() {
    const s = farm.s;
    if (!s.deliveries || s.deliveries.day !== s.day) return;
    if (npcs.hour() >= 18 && !s.deliveries.late) {
      s.deliveries.late = true;
      const left = s.deliveries.list.filter((p) => !p.done).length;
      if (left) { farm.take('colis', Math.min(left, farm.count('colis'))); const p = npcs.byId.postiere; if (p) npcs.addAmitie(p, -20 * left); }
    }
  },
};
