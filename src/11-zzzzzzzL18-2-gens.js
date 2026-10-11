// ============================================================================
//  LE GRAND HÔTEL DES CIMES (agent L18) — 2. L'ÉTAT, LES GENS DE L'HÔTEL
//  - hotel18 : l'état sauvegardé (farm.s.hotel18), le plan (w.l18), l'heure ;
//  - les gens (le personnel, les clients des histoires, les clients de passage) :
//    menés ici, pas par npcs. Chacun a ses heures (L18_GENS.horaire) ; il marche
//    d'une place à l'autre par les nœuds de w.l18.nav (les escaliers, les couloirs,
//    les portes qu'il ouvre en passant). Loin de l'hôtel, rien ne bouge : au retour,
//    chacun est à sa place. Les histoires et le service les déplacent (surcharges).
//  - on leur parle (E, de près) ; on se lie (farm.s.hotel18.amis : 0 à 100).
//  État : farm.s.hotel18 = { v, embauche, rep, service, demandes, commissions, stats, amis, arcs, cines, vus, clients, flags }
// ============================================================================
const hotel18 = {
  // ------------------------------------------------------------- l'état
  S() {
    const s = typeof farm !== 'undefined' && farm.s;
    if (!s) return this._vide || (this._vide = this.normaliser({}));
    if (!s.hotel18 || typeof s.hotel18 !== 'object') s.hotel18 = {};
    return this.normaliser(s.hotel18);
  },
  normaliser(S) {
    if (!S.v) S.v = 1;
    if (S.embauche === undefined) S.embauche = null;
    if (typeof S.rep !== 'number' || !isFinite(S.rep)) S.rep = 0;
    S.rep = clamp(S.rep, 0, 100);
    if (S.service === undefined) S.service = null;
    for (const k of ['demandes', 'commissions']) if (!Array.isArray(S[k])) S[k] = [];
    for (const k of ['amis', 'arcs', 'cines', 'vus', 'flags', 'parle']) if (!S[k] || typeof S[k] !== 'object' || Array.isArray(S[k])) S[k] = {};
    if (!S.stats || typeof S.stats !== 'object') S.stats = {};
    for (const k of ['services', 'faites', 'ratees', 'pourboires', 'gages', 'secrets']) if (typeof S.stats[k] !== 'number') S.stats[k] = 0;
    if (!S.clients || typeof S.clients !== 'object') S.clients = { jour: 0, L: [] };
    if (!Array.isArray(S.clients.L)) S.clients.L = [];
    return S;
  },
  V() { const w = typeof farm !== 'undefined' && farm.w; return (w && w.l18) || null; },
  monde() { return typeof farm !== 'undefined' ? farm.w : null; },
  dansLaVallee() { return !(typeof zone !== 'undefined' && zone.dedans) && !!this.V(); },
  heure() { const w = this.monde(); return w ? (w.time * 24) % 24 : 12; },
  // une heure dans une fenêtre [h0, h1] (qui peut passer minuit)
  dans(h, F) { if (!F) return true; const [a, b] = F; return a <= b ? h >= a && h < b : h >= a || h < b; },
  embauche() { return this.S().embauche !== null; },
  rang() { const r = this.S().rep; let R = L18_RANGS[0]; for (const q of L18_RANGS) if (r >= q.rep) R = q; return R; },
  ami(id) { return this.S().amis[id] || 0; },
  lier(id, n) { const S = this.S(); S.amis[id] = clamp((S.amis[id] || 0) + n, 0, 100); },
  // le joueur est-il à l'hôtel (sur le terre-plein, ou dedans) ? loin : d (m)
  distance() { const V = this.V(), p = game.player; if (!V || !p) return 1e9; return Math.hypot(p.pos[0] - V.x, p.pos[2] - V.z); },
  local(x, z) { const V = this.V(), c = Math.cos(V.r), s = Math.sin(V.r), dx = x - V.x, dz = z - V.z; return [dx * c - dz * s, dx * s + dz * c]; },
  monde3(lx, ly, lz) { const V = this.V(), c = Math.cos(V.r), s = Math.sin(V.r); return [V.x + lx * c + lz * s, V.y + ly, V.z - lx * s + lz * c]; },
  // la pièce où est le joueur (une clé de w.l18.pieces), ou null
  pieceDu(x, y, z) {
    const V = this.V();
    if (!V) return null;
    const [lx, lz] = this.local(x, z);
    for (const k in V.pieces) { const P = V.pieces[k]; if (lx >= P.lx0 && lx <= P.lx1 && lz >= P.lz0 && lz <= P.lz1 && Math.abs(y - (V.y + P.y)) < 2.5) return k; }
    return null;
  },
  dedans() { const p = game.player; if (!p || !this.V()) return false; const [lx, lz] = this.local(p.pos[0], p.pos[2]); return lx > -51 && lx < 52 && lz > -11.5 && lz < 11.5 && p.pos[1] > this.V().y - 1; },
  // un mot à l'écran (les sous-titres du jeu)
  dire(qui, txt, dur) { try { ui.subtitle(qui || '', txt, dur || Math.min(9, 2.5 + String(txt).length / 22)); } catch (e) { /* */ } },
  voir(id, k) { try { if (typeof decouvertes !== 'undefined' && decouvertes.voir) decouvertes.voir(id, k); } catch (e) { /* */ } },
};

// ---------------------------------------------------------------- les gens
const hotelGens = {
  L: [], par: {}, cle: null, adj: null, actifT: 0, actif: false, porteT: {}, snapH: null,
  // les surcharges : fn(id, h) → { place, pose, cap? } ou null (le service, les histoires)
  surcharges: [],
  // ------------------------------------------------------------- créer les gens pour ce monde
  creer() {
    const V = hotel18.V();
    if (!V || this.cle === V) return;
    this.cle = V; this.L = []; this.par = {}; this.adj = null;
    for (const id of L18_ORDRE_GENS) this.ajouter(id, L18_GENS[id]);
    this.clientsDuJour(true);
  },
  ajouter(id, def) {
    const g = { id, def, rig: null, x: 0, y: 0, z: 0, cap: 0, chemin: [], k: 0, cible: null, pose: 'debout', vis: false, n: -1, parle: 0, t: Math.random() * 10 };
    this.L.push(g); this.par[id] = g;
    return g;
  },
  // les clients de passage du jour : de quatre à six, tirés selon la réputation ; chacun une chambre (fermée), une table
  clientsDuJour(force) {
    const S = hotel18.S(), V = hotel18.V(), s = farm.s;
    if (!V || !s) return;
    if (force || S.clients.jour !== s.day) {
      if (S.clients.jour !== s.day) {
        const rnd = mulberry32(((s.seed | 0) * 131 + s.day * 7919 + 0x1A18) >>> 0);
        const dispo = L18_CLIENTS.filter((c) => c.niv <= S.rep);
        const n = Math.min(dispo.length, 4 + Math.floor(rnd() * 3));
        const L = [];
        const tas = dispo.slice();
        for (let i = 0; i < n && tas.length; i++) {
          // les meilleurs clients d'abord (ceux qu'on vient de mériter ont plus de chances)
          tas.sort((a, b) => b.niv - a.niv + (rnd() - 0.5) * 40);
          L.push(tas.shift().id);
        }
        const fermees = Object.values(V.chambres).filter((c) => c.num && !c.ouverte && c.e <= 2).map((c) => c.num);
        S.clients = { jour: s.day, L: L.map((id, i) => ({ id, ch: fermees[Math.floor(rnd() * fermees.length)], t: i })) };
      }
      // retirer les anciens, ajouter ceux du jour
      this.L = this.L.filter((g) => !g.client);
      for (const k in this.par) if (this.par[k].client) delete this.par[k];
      for (const c of S.clients.L) {
        const C = L18_CLIENTS.find((q) => q.id === c.id);
        if (!C) continue;
        const look = Object.assign({ skin: '#e2c0a2', shoe: '#1a1a1a' }, C.look);
        const t = c.t % 3, j = c.t % 3;
        const def = {
          nom: C.nom, court: C.nom, role: C.qui, look, client: true,
          horaire: [[0, 'n:p_' + c.ch, 'chambre'], [8, 'resto_' + t + j, 'assis'], [9.5, c.t % 2 ? 'terrasse_t' + (c.t + 1) : 'salon_canape' + (c.t % 3 === 2 ? '2' : ''), c.t % 2 ? 'assis' : 'assis'],
            [12.5, 'resto_' + t + ((j + 1) % 3), 'assis'], [14, 'n:p_' + c.ch, 'chambre'], [16, 'terrasse_t' + (c.t + 2), 'assis'], [19.5, 'resto_' + ((t + 1) % 3) + j, 'assis'],
            [21, c.t % 2 ? 'salon_bar' : 'salon_lecture', 'debout'], [22.5, 'n:p_' + c.ch, 'chambre']],
        };
        const g = this.ajouter(c.id, def);
        g.client = C; g.ch = c.ch;
      }
      this.snapH = null;
    }
  },
  // ------------------------------------------------------------- les places
  place(cle) {
    const V = hotel18.V();
    if (!V || !cle) return null;
    if (cle.startsWith('n:')) { const i = V.nav.id[cle.slice(2)]; if (i === undefined) return null; const p = V.nav.n[i].p; return { p, cap: null, n: i }; }
    const P = V.places[cle];
    return P ? { p: P.p, cap: P.cap, n: P.n } : null;
  },
  // ce que fait g à l'heure h (la surcharge d'abord)
  cible(g, h) {
    for (const fn of this.surcharges) { try { const r = fn(g.id, h, g); if (r) return r; } catch (e) { console.error('L18 surcharge', e); } }
    const H = g.def.horaire || [[0, null, 'absent']];
    let c = H[H.length - 1];
    for (const e of H) if (h >= e[0]) c = e;
    return { place: c[1], pose: c[2] };
  },
  // ------------------------------------------------------------- les chemins
  graphe() {
    if (this.adj) return this.adj;
    const V = hotel18.V(), N = V.nav, A = N.n.map(() => []);
    for (const [a, b, porte] of N.e) {
      const pa = N.n[a].p, pb = N.n[b].p, d = Math.hypot(pa[0] - pb[0], pa[1] - pb[1], pa[2] - pb[2]);
      A[a].push([b, d, porte]); A[b].push([a, d, porte]);
    }
    return (this.adj = A);
  },
  // le nœud le plus proche d'un point (au même niveau)
  proche(p) {
    const N = hotel18.V().nav.n;
    let best = -1, bd = 1e9;
    for (let i = 0; i < N.length; i++) { const q = N[i].p; if (Math.abs(q[1] - p[1]) > 1.4) continue; const d = Math.hypot(q[0] - p[0], q[2] - p[2]); if (d < bd) { bd = d; best = i; } }
    return best;
  },
  chemin(de, a) {
    const A = this.graphe(), n = A.length;
    if (de < 0 || a < 0) return null;
    const dist = new Float64Array(n).fill(1e9), prev = new Int32Array(n).fill(-1), porte = new Array(n).fill(null), fait = new Uint8Array(n);
    dist[de] = 0;
    for (let it = 0; it < n; it++) {
      let u = -1, du = 1e9;
      for (let i = 0; i < n; i++) if (!fait[i] && dist[i] < du) { du = dist[i]; u = i; }
      if (u < 0 || u === a) break;
      fait[u] = 1;
      for (const [v, d, pt] of A[u]) if (du + d < dist[v]) { dist[v] = du + d; prev[v] = u; porte[v] = pt; }
    }
    if (dist[a] >= 1e9) return null;
    const L = [];
    for (let v = a; v >= 0; v = prev[v]) { L.unshift({ n: v, porte: porte[v] }); if (v === de) break; }
    return L;
  },
  // ------------------------------------------------------------- chaque image
  update(dt) {
    const V = hotel18.V();
    if (!V || !farm.s || !hotel18.dansLaVallee()) { this.actif = false; return; }
    this.creer();
    if (farm.s.day !== hotel18.S().clients.jour) this.clientsDuJour();
    const d = hotel18.distance();
    const actif = d < 320;
    const h = hotel18.heure();
    // de retour près de l'hôtel, ou après un long sommeil : chacun à sa place, d'un coup
    const ecart = this.snapH === null ? 0 : ((h - this.snapH) % 24 + 24) % 24;
    const saut = this.snapH === null || !this.actif || (ecart > 0.8 && ecart < 23.2);
    this.actif = actif;
    if (!actif) return;
    this.snapH = h;
    for (const g of this.L) {
      g.t += dt;
      const c = this.cible(g, h);
      const cle = (c.place || '') + '|' + (c.pose || '');
      if (cle !== g.cle || saut) {
        g.cle = cle;
        const P = this.place(c.place);
        g.pose = c.pose || 'debout';
        if (!P || g.pose === 'absent') { g.vis = false; g.chemin = []; g.cible = null; continue; }
        g.cible = P; g.capC = c.cap !== undefined ? c.cap : P.cap;
        if (saut || !g.vis) { this.poser(g, P); continue; }
        // le chemin, de nœud en nœud, puis le dernier pas jusqu'à la place
        const de = g.n >= 0 ? g.n : this.proche([g.x, g.y, g.z]);
        const L = this.chemin(de, P.n >= 0 ? P.n : this.proche(P.p));
        if (!L) { this.poser(g, P); continue; }
        const N = V.nav.n;
        g.chemin = L.map((q) => ({ p: N[q.n].p, porte: q.porte, n: q.n }));
        g.chemin.push({ p: P.p, porte: null, n: P.n });
        g.k = 0; g.marche = true;
      }
      if (g.marche) this.marcher(g, dt);
      else if (g.vis && g.pose === 'danse' && g.cible) {
        // la valse : un petit cercle autour de sa place, en tournant
        g.da = (g.da || hashString(g.id) % 7) + dt * 1.15;
        const P = g.cible.p;
        g.x = P[0] + Math.cos(g.da) * 0.9; g.z = P[2] + Math.sin(g.da) * 0.9; g.y = P[1];
        g.cap = Math.atan2(-Math.sin(g.da), Math.cos(g.da));
      } else if (g.vis && g.capC !== null && g.capC !== undefined) {
        // tourné vers sa place ; vers vous si vous êtes tout près
        const p = game.player, dx = p.pos[0] - g.x, dz = p.pos[2] - g.z, dd = Math.hypot(dx, dz);
        let cible = g.capC;
        if (dd < 3.2 && Math.abs(p.pos[1] - g.y) < 2 && g.pose !== 'dort' && g.pose !== 'assis') cible = Math.atan2(dx, dz);
        g.cap += ((cible - g.cap + Math.PI * 3) % TAU - Math.PI) * Math.min(1, dt * 3);
      }
    }
    this.fermerPortes(dt);
  },
  poser(g, P) {
    g.x = P.p[0]; g.y = P.p[1]; g.z = P.p[2]; g.n = P.n; g.chemin = []; g.marche = false;
    g.cap = P.cap !== null && P.cap !== undefined ? P.cap : g.cap;
    g.vis = !['dort', 'chambre', 'absent'].includes(g.pose);
  },
  marcher(g, dt) {
    const v = (g.def.client ? 1.25 : 1.45) * (g.id === 'firmin' ? 1.35 : 1) * (g.id === 'wolanski' ? 0.55 : 1) * (g.id === 'gaspard' ? 0.8 : 1);
    let reste = v * dt;
    g.vis = true;
    while (reste > 0 && g.k < g.chemin.length) {
      const W = g.chemin[g.k], dx = W.p[0] - g.x, dy = W.p[1] - g.y, dz = W.p[2] - g.z, d = Math.hypot(dx, dz);
      // la porte du tronçon : ouverte en approchant
      if (W.porte && d < 2.2) this.ouvrir(W.porte);
      if (d <= reste) { g.x = W.p[0]; g.y = W.p[1]; g.z = W.p[2]; reste -= d; if (W.n !== undefined && W.n >= 0) g.n = W.n; g.k++; continue; }
      const k = reste / d;
      g.x += dx * k; g.z += dz * k; g.y += dy * k;
      g.cap = Math.atan2(dx, dz);
      reste = 0;
    }
    if (g.k >= g.chemin.length) {
      g.marche = false; g.chemin = [];
      if (g.cible) { g.n = g.cible.n; if (g.capC !== null && g.capC !== undefined) g.cap = g.capC; }
      if (['dort', 'chambre', 'absent'].includes(g.pose)) g.vis = false;
    }
  },
  ouvrir(id) {
    const V = hotel18.V(), w = hotel18.monde(), i = V && V.portes[id], dr = i !== undefined && w && w.doors[i];
    if (!dr) return;
    if (dr.locked && !(id === 'aile' || id === 'aile1' || id === 'treize')) return;
    if (!dr.open) { dr.open = 1; this.porteT[id] = 4; if (hotel18.distance() < 60) try { sound.door && sound.door(true); } catch (e) { /* */ } }
    else if (this.porteT[id] !== undefined) this.porteT[id] = 4;
  },
  fermerPortes(dt) {
    const V = hotel18.V(), w = hotel18.monde();
    for (const id in this.porteT) {
      this.porteT[id] -= dt;
      if (this.porteT[id] > 0) continue;
      const dr = w.doors[V.portes[id]];
      delete this.porteT[id];
      if (!dr) continue;
      const p = game.player;
      if (Math.hypot(p.pos[0] - dr.x, p.pos[2] - dr.z) < 1.6) continue;
      if (this.L.some((g) => g.vis && Math.hypot(g.x - dr.x, g.z - dr.z) < 1.3)) { this.porteT[id] = 1; continue; }
      dr.open = 0;
    }
  },
  // ------------------------------------------------------------- dessin
  dessiner(buf, sbuf, cam, t) {
    if (!this.actif) return;
    for (const g of this.L) {
      if (!g.vis) continue;
      if (Math.abs(g.x - cam[0]) > 140 || Math.abs(g.z - cam[2]) > 140) continue;
      const r = g.rig || (g.rig = humanRig(g.def.look || {}));
      const bouge = !!g.marche || g.pose === 'danse';
      const p = game.player, parle = g.parle > 0;
      const dx = p.pos[0] - g.x, dz = p.pos[2] - g.z;
      const lookY = !bouge && Math.hypot(dx, dz) < 4 ? clamp(((Math.atan2(dx, dz) - g.cap + Math.PI * 3) % TAU) - Math.PI, -1, 1) : 0;
      poseHuman(r, { move: bouge ? 1 : 0, phase: bouge ? g.t * 6.4 : 0, t: g.t + t, lookY, sit: g.pose === 'assis', work: g.pose === 'travail', talk: parle, nod: parle && g.id === 'gaspard' });
      const s = (g.def.look && g.def.look.height) || 1;
      drawRig(buf, r, g.x, g.y, g.z, g.cap, s, g.hi ? FX_HI : 0);
      if (sbuf) drawShadow(sbuf, g.x, g.y, g.z, 0.3);
      g.hi = false;
    }
  },
  // E sur quelqu'un (de près, et qu'on regarde)
  cibler(eye, f, cand) {
    if (!this.actif) return;
    for (const g of this.L) {
      if (!g.vis) continue;
      const dx = g.x - eye[0], dy = g.y + 1.2 - eye[1], dz = g.z - eye[2], d = Math.hypot(dx, dy, dz);
      if (d > 2.8) continue;
      if ((dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1) < 0.72) continue;
      cand({ kind: 'hook', l18: g.id, use: () => { try { hotelParler.ouvrir(g.id); } catch (e) { console.error('L18 parler', e); } } }, d);
    }
  },
  // pour les scènes : où est quelqu'un (ou sa place)
  ou(id) { const g = this.par[id]; return g ? [g.x, g.y, g.z] : null; },
};

// ---------------------------------------------------------------- branchements
HOOKS.update.push((dt) => { try { hotelGens.update(dt); } catch (e) { if (!hotelGens._err) { hotelGens._err = true; console.error('L18 gens', e); } } });
HOOKS.draw.push((buf, sbuf, cam, t) => { if (hotelGens.actif) try { hotelGens.dessiner(buf, sbuf, cam, t); } catch (e) { if (!hotelGens._errD) { hotelGens._errD = true; console.error('L18 dessin', e); } } });
HOOKS.target.push((eye, f, cand) => hotelGens.cibler(eye, f, cand));
// la cible visée s'éclaire (comme les habitants)
HOOKS.update.push(() => { const t = typeof game !== 'undefined' && game.target; if (t && t.kind === 'hook' && t.l18 && hotelGens.par[t.l18]) hotelGens.par[t.l18].hi = true; });
HOOKS.load.push(() => { hotelGens.cle = null; hotelGens.L = []; hotelGens.par = {}; hotelGens.actif = false; hotelGens.porteT = {}; hotelGens.snapH = null; });
