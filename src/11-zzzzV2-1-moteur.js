// ============================================================================
//  LES CRÉATURES DES TERRES D'AVANT (agent V2) — le moteur
//  - Les NIDS : posés par la passe de génération (11-zzzzV2-2-repaires.js) ou
//    par V4 et V5 (zone.creatures.poser) ; gardés dans Z.v2.nids.
//  - Les bêtes NAISSENT autour du joueur (≈ 150 m, 230 pour celles qui volent),
//    à leurs heures, jamais sous ses yeux s'il est tout près, et s'EFFACENT au
//    loin (sauf en pleine traque). Seules les bêtes présentes vivent (une
//    vingtaine au plus) ; plus loin que 130 m, elles ne pensent que trois fois
//    par seconde. Rien sur toute la liste des objets à chaque image.
//  - Elles VOIENT et ENTENDENT par furtif (V1) : furtif.guetteur à la naissance,
//    furtif.percevoir à chaque image ; leur conduite (11-zzzzV2-3-especes.js)
//    décide quoi faire de l'état (tranquille, intriguée, alertée, cherche,
//    abandonne). Elles ne quittent pas leur territoire (laisse) et n'approchent
//    pas d'un feu de veille allumé (refuge, 14 m).
//  - Les ARMES les touchent par zone.armes (coups d'outil, flèches, fusil).
//  - Mortes, elles reviennent quand on se repose à un feu (zone.sur('repos')),
//    ou au bout de trois jours ; les uniques, jamais.
//  État : farm.s.v2 { morts: { nid: {n, j} }, uniques: { espece: jour }, vus, notes, caches, vouivre, korrigans, chien,
//    cerf, noyes }.
//  API : zone.creatures (voir $SP/eq/contrat-v14.md, section V2).
// ============================================================================
const V2_R_ACT = 150, V2_R_VOL = 230, V2_R_UNIQUE = 190, V2_REFUGE = 14;
function v2DansHeures(h, H) { if (!H) return true; const [a, b] = H; if (a === 0 && b === 24) return true; return a <= b ? h >= a && h < b : h >= a || h < b; }
function v2Hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

const creaturesV2 = {
  nids: [], vivantes: [], Zcur: null, Zgen: null, scanT: 0, seq: 0, feux: [], feuxT: 0, surMort: [], placesLues: false,
  h: 12, nuit: 0, t: 0,

  // ------------------------------------------------------------- l'état sauvegardé
  S() {
    const s = typeof farm !== 'undefined' && farm.s;
    if (!s) return { morts: {}, uniques: {}, vus: {}, notes: {}, caches: {}, vouivre: {}, korrigans: {}, chien: {}, cerf: {}, noyes: {} };
    const V = s.v2 && typeof s.v2 === 'object' ? s.v2 : (s.v2 = { v: 1 });
    for (const k of ['morts', 'uniques', 'vus', 'notes', 'caches', 'vouivre', 'korrigans', 'chien', 'cerf', 'noyes']) if (!V[k] || typeof V[k] !== 'object') V[k] = {};
    return V;
  },

  // ------------------------------------------------------------- les nids
  listeNids(Z) { if (!Z) return []; if (!Z.v2) Z.v2 = { nids: [] }; if (!Z.v2.nids) Z.v2.nids = []; return Z.v2.nids; },
  poser(esp, x, y, z, o) {
    o = o || {};
    const D = V2_ESPECES[esp];
    const Z = this.Zgen || zone.Z;
    if (!D || !Z || !isFinite(x) || !isFinite(z)) return null;
    const L = this.listeNids(Z);
    const id = o.id || ((o.agent || 'V2') + ':' + esp + ':' + Math.round(x) + ',' + Math.round(z));
    if (L.some((n) => n.id === id)) return id;
    const h = v2Hash(id), nb = o.n || D.nb[0] + (h % (D.nb[1] - D.nb[0] + 1));
    const N = { id, esp, x, y: isFinite(y) ? y : Z.heightAt(x, z), z, n: nb, r: o.r ?? D.errance, cap: o.cap ?? ((h % 628) / 100), perche: !!o.perche, dessous: !!o.dessous,
      heures: o.heures || D.heures, heuresDonnees: !!o.heures, garde: !!o.garde, site: o.site || null, agent: o.agent || 'V2', vie: 0, ents: [], attente: 0 };
    if (o.extra) Object.assign(N, o.extra);
    L.push(N);
    if (Z === zone.Z && Z === this.Zcur) this.nids = L;
    return id;
  },
  retirer(id) {
    const N = this.nids.find((n) => n.id === id);
    if (!N) return false;
    this.effacer(N);
    const L = this.listeNids(this.Zcur);
    const i = L.indexOf(N); if (i >= 0) L.splice(i, 1);
    return true;
  },
  liste(q) {
    let x, z, r;
    if (typeof q === 'string') { const st = zone.site(q); if (!st) return this.nids.filter((n) => n.site === q).map((n) => this.resume(n)); x = st.x; z = st.z; r = st.r + 20; }
    else if (q) { x = q.x; z = q.z; r = q.r || 30; }
    return this.nids.filter((n) => !q || (typeof q === 'string' && n.site === q) || Math.hypot(n.x - x, n.z - z) <= r).map((n) => this.resume(n));
  },
  resume(n) {
    const S = this.S(), m = (S.morts[n.id] && S.morts[n.id].n) || 0, D = V2_ESPECES[n.esp];
    const vivants = D.unique && S.uniques[n.esp] ? 0 : Math.max(0, n.n - m);
    const e = n.ents.find((q) => !q.mort);
    return { id: n.id, espece: n.esp, x: n.x, y: n.y, z: n.z, n: n.n, vivants, etat: e && e.furtif ? e.furtif.etat : null, present: !!n.vie };
  },

  // ------------------------------------------------------------- un monde nouveau (une Zone générée) : on repart
  changerMonde(Z) {
    for (const N of this.nids) this.effacer(N);
    this.vivantes.length = 0;
    this.Zcur = Z; this.nids = this.listeNids(Z); this.placesLues = false;
    for (const N of this.nids) { N.vie = 0; N.ents = []; N.attente = 0; }
  },
  // les places que V4 (le château) et V5 (la ville d'en bas) offrent aux créatures
  lirePlaces() {
    const lots = [];
    try { if (zone.chateau && typeof zone.chateau.places === 'function') lots.push(['V4', 'chateau', zone.chateau.places() || []]); } catch (e) { console.error('V2 places V4', e); }
    try { if (zone.catacombes && typeof zone.catacombes.places === 'function') lots.push(['V5', 'catacombes', zone.catacombes.places() || []]); } catch (e) { console.error('V2 places V5', e); }
    let n = 0;
    for (const [agent, site, L] of lots) for (const P of L) {
      if (!P || !isFinite(P.x) || !isFinite(P.z)) continue;
      const esp = this.espece(P.espece) || this.pour(P.type, P.dessous);
      if (!esp) continue;
      // une ronde (chemin de ronde…) : des points locaux au site, rendus au monde
      let ronde = null;
      if (Array.isArray(P.ronde) && P.ronde.length > 1) { const st = zone.site(P.site || site); if (st) ronde = P.ronde.map(([x, z]) => [st.x + x, st.z + z]); }
      const garde = P.garde !== undefined ? !!P.garde : P.type === 'gardien';
      this.poser(esp, P.x, P.y, P.z, { id: P.id || agent + ':' + Math.round(P.x) + ',' + Math.round(P.z), r: garde ? 0 : Math.min(P.r || 18, 40), dessous: !!P.dessous, perche: !!P.perche, garde,
        site: P.site || site, agent, cap: P.cap, heures: Array.isArray(P.heures) ? P.heures : undefined, n: P.n || (esp === 'v2_sans_visage' ? 3 : 1), extra: ronde ? { ronde } : null });
      n++;
    }
    this.placesPosees = n;
  },
  // un nom d'espèce donné par un autre (« gargouille », « v2_gargouille ») ; null s'il n'existe pas
  espece(nom) { if (!nom) return null; if (V2_ESPECES[nom]) return nom; const k = 'v2_' + String(nom).replace(/^v2_/, ''); return V2_ESPECES[k] ? k : null; },
  // l'espèce conseillée pour une place : dehors, gargouille (gardien), mange-mort (rôdeur), sans-visage (paisible) ;
  // sous terre, l'écoutant (gardien ou rôdeur : il n'a pas besoin d'yeux) ; rien de paisible sous terre
  pour(type, dessous) {
    if (type === 'gardien') return dessous ? 'v2_ecoutant' : 'v2_gargouille';
    if (type === 'rodeur') return dessous ? 'v2_ecoutant' : 'v2_charognard';
    if (type === 'paisible') return dessous ? null : 'v2_sans_visage';
    return null;
  },

  // ------------------------------------------------------------- présence d'un nid (heures, morts, conditions propres)
  present(N, D) {
    const S = this.S();
    if (D.unique && S.uniques[N.esp]) return D.conduite === 'basilic' || D.conduite === 'tarasque' || D.conduite === 'chimere' ? 'mort' : false;
    const m = S.morts[N.id];
    if (m && m.n >= N.n) return false;
    const P = typeof V2_PRESENCE !== 'undefined' && V2_PRESENCE[D.conduite];
    if (P) { const r = P.call(this, N, D); if (r !== undefined) return r; }
    if (N.dessous && !N.heuresDonnees) return true; // (sous terre, il fait toujours nuit)
    if (v2DansHeures(this.h, N.heures)) return true;
    return D.hors !== 'cache';
  },

  // ------------------------------------------------------------- chaque image, dans la Zone
  update(dt, eye, basis, sky, playing) {
    const Z = zone.Z;
    if (!zone.dedans || !Z || !farm.s) return;
    if (Z !== this.Zcur) this.changerMonde(Z);
    if (!this.placesLues) { this.placesLues = true; this.lirePlaces(); }
    const p = game.player;
    this.h = farm.w.time * 24; this.nuit = sky ? sky.night : 0; this.t = game.time; this.basis = basis;
    this.feuxT -= dt;
    if (this.feuxT <= 0) { this.feuxT = 2; this.feux = typeof feuxV1 !== 'undefined' ? feuxV1.liste().filter((q) => feuxV1.allume(q)).map((q) => [q.x, q.z]) : []; }
    this.scanT -= dt;
    if (this.scanT <= 0) { this.scanT = 0.5; try { this.scanner(p, basis); } catch (e) { console.error('V2 scanner', e); } }
    if (!playing) return;
    for (let i = this.vivantes.length - 1; i >= 0; i--) {
      const e = this.vivantes[i];
      if (!e) continue;
      try { this.vivre(e, dt, p); } catch (err) { console.error('V2 ' + e.esp, err); }
    }
    this.repousser(p);
  },
  repousser(p) {
    for (const e of this.vivantes) {
      if (e.cache || e.removed || e.vol || e.pendu || e.D.eau || e.D.rayon < 0.4 || e.dist > 6 || Math.abs(p.pos[1] - e.y) > 1.6) continue;
      const dx = p.pos[0] - e.x, dz = p.pos[2] - e.z, d = Math.hypot(dx, dz), min = e.D.rayon * (e.echelle || 1) + 0.33;
      if (d < min && d > 1e-4) { p.pos[0] = e.x + dx / d * min; p.pos[2] = e.z + dz / d * min; }
    }
  },
  scanner(p, basis) {
    const px = p.pos[0], pz = p.pos[2];
    for (const N of this.nids) {
      const D = V2_ESPECES[N.esp];
      const d = Math.hypot(N.x - px, N.z - pz);
      const R = D.vol ? V2_R_VOL : D.unique ? V2_R_UNIQUE : V2_R_ACT;
      const pr = d < R + 60 ? this.present(N, D) : false;
      if (!N.vie) {
        if (d < R && pr) {
          // jamais sous ses yeux, s'il est tout près (sauf s'il attend là depuis un moment)
          if (d < 85 && N.attente < 6 && this.vuDuJoueur(N.x, N.y + 1, N.z, p, basis)) { N.attente += 0.5; continue; }
          N.attente = 0;
          this.naitre(N, D, pr === 'mort');
        }
      } else if (d > R + 45 || !pr) {
        if (!pr && N.ents.some((e) => !e.mort && e.dist < 70 && this.vuDuJoueur(e.x, e.y + 1, e.z, p, basis))) continue; // (elle s'en ira quand on ne la regardera plus)
        if (N.ents.some((e) => !e.mort && e.mode === 'chasse' && e.dist < 90)) continue;
        this.effacer(N);
      }
    }
    // ce qu'on a vu (le carnet)
    const S = this.S();
    for (const e of this.vivantes) {
      if (e.mort || e.cache || e.dist > 45) continue;
      if (this.vuDuJoueur(e.x, e.y + e.D.haut * 0.6, e.z, p, basis, 0.75)) { e.vuT = (e.vuT || 0) + 0.5; if (e.vuT >= 1) this.noter(e.esp, 0); }
    }
    void S;
  },
  // le joueur voit-il ce point ? (devant lui, assez près, rien entre)
  vuDuJoueur(x, y, z, p, basis, cosMin) {
    const eye = p.eyePos(), dx = x - eye[0], dy = y - eye[1], dz = z - eye[2], d = Math.hypot(dx, dy, dz);
    if (d < 1) return true;
    const f = basis ? basis.f : [-Math.sin(p.yaw), 0, -Math.cos(p.yaw)];
    if ((dx * f[0] + dy * f[1] + dz * f[2]) / d < (cosMin || 0.5)) return false;
    const w = zone.Z, dir = [dx / d, dy / d, dz / d];
    const bh = w.raycastBlocks(eye, dir, d - 0.5);
    if (bh && !bh.block.hidden) return false;
    const th = w.raycastTerrain(eye, dir, d - 0.5);
    return !th;
  },

  // ------------------------------------------------------------- naître, s'effacer
  naitre(N, D, mortes) {
    const S = this.S(), m = (S.morts[N.id] && S.morts[N.id].n) || 0;
    N.vie = 1; N.ents = [];
    if (mortes) {
      const e = this.creer(N, D, 0); e.mort = true; e.mortT = 0; e.mortGarde = true; furtif.oublier(e); N.ents.push(e); this.vivantes.push(e);
      const K = typeof V2_CADAVRE !== 'undefined' && V2_CADAVRE[D.conduite];
      if (K) try { K.call(this, e, N); } catch (err) { console.error(err); }
      return;
    }
    for (let k = m; k < N.n; k++) { const e = this.creer(N, D, k); N.ents.push(e); this.vivantes.push(e); }
    const NA = typeof V2_NAISSANCE !== 'undefined' && V2_NAISSANCE[D.conduite];
    if (NA) try { NA.call(this, N, N.ents); } catch (err) { console.error('V2 naissance', N.esp, err); }
  },
  creer(N, D, k) {
    const Z = zone.Z, a = (k / Math.max(1, N.n)) * TAU + (v2Hash(N.id) % 100) / 30, rr = N.n > 1 ? Math.min(5, 1.5 + N.n * 0.6) : 0;
    let x = N.x + Math.cos(a) * rr, z = N.z + Math.sin(a) * rr;
    if (!N.perche && !D.vol && !D.eau && Z.heightAt(x, z) < Z.waterLevel - 0.3) { x = N.x; z = N.z; }
    const y = N.perche ? N.y : D.eau ? Z.waterLevel - 1.25 : N.dessous ? N.y : Z.groundAt(x, z, Math.max(N.y, Z.heightAt(x, z)) + 0.5, 0.6);
    const e = {
      id: ++this.seq, esp: N.esp, D, nid: N, k, v: (v2Hash(N.id) + k) % 3, x, y, z, hx: N.x, hz: N.z, heading: N.cap + (k ? (Math.random() - 0.5) * 1.2 : 0),
      hp: D.pv, mode: 'repos', move: 0, phase: Math.random() * 6, run: false, t: Math.random() * 10, att: 0, attT: 0, regard: 0, seed: Math.random() * 100,
      dist: 999, hurtT: 0, sonT: 2 + Math.random() * 6, timer: Math.random() * 3,
    };
    e.rig = V2_RIGS[N.esp] ? V2_RIGS[N.esp](e.v) : null;
    furtif.guetteur(e, D.sens);
    return e;
  },
  effacer(N) {
    for (const e of N.ents) { furtif.oublier(e); e.removed = true; const i = this.vivantes.indexOf(e); if (i >= 0) this.vivantes.splice(i, 1); }
    const F = typeof V2_FIN !== 'undefined' && V2_FIN[V2_ESPECES[N.esp].conduite];
    if (F) try { F.call(this, N); } catch (err) { console.error(err); }
    N.ents = []; N.vie = 0;
  },
  toutEffacer() { for (const N of this.nids) this.effacer(N); this.vivantes.length = 0; },

  // ------------------------------------------------------------- vivre (une image)
  vivre(e, dt, p) {
    e.dist = Math.hypot(e.x - p.pos[0], e.z - p.pos[2]);
    e.hurtT = Math.max(0, e.hurtT - dt); e.attT = Math.max(0, e.attT - dt); e.t += dt;
    if (e.mort) {
      e.mortT += dt; e.move = 0;
      if (!e.mortGarde && e.mortT > 120 && e.dist > 40) { const i = this.vivantes.indexOf(e); if (i >= 0) this.vivantes.splice(i, 1); }
      return;
    }
    // au loin : trois fois par seconde
    if (e.dist > 130 && e.mode !== 'chasse') { e.lent = (e.lent || 0) - dt; if (e.lent > 0) return; dt = 0.33 - e.lent; e.lent = 0.33; }
    const C = V2_CONDUITES[e.D.conduite];
    if (C) C.call(this, e, dt, p);
    if (e.D.coup && e.prep !== undefined) this.porterCoup(e, dt, p);
    e.sonT -= dt;
  },

  // ------------------------------------------------------------- percevoir : furtif, plus la laisse et le refuge des feux
  percevoir(e, dt) {
    const F = e.furtif;
    if (!F) return 'tranquille';
    const etat = furtif.percevoir(e, dt);
    // la laisse : au-delà de son territoire, elle renonce
    const dh = Math.hypot(e.x - e.hx, e.z - e.hz);
    if (dh > e.D.laisse && (etat === 'alertee' || etat === 'cherche' || etat === 'intriguee')) { F.soupcon = 0.2; furtif.changer(e, 'abandonne'); this.noterFuite(e); return 'abandonne'; }
    // le refuge : le joueur près d'un feu allumé ; elle s'arrête à la lisière, puis renonce
    if (e.D.feu !== false && (etat === 'alertee' || etat === 'cherche') && this.feuPres(game.player.pos[0], game.player.pos[2], V2_REFUGE + 1)) {
      e.refugeT = (e.refugeT || 0) + dt;
      if (e.refugeT > 1 && e.refugeT - dt <= 1 && e.dist < 40) penser.pas('v2_refuge', 240, V2_TEXTES.feuRefuge, 3);
      if (e.refugeT > 4) { e.refugeT = 0; F.soupcon = 0.1; furtif.changer(e, 'abandonne'); this.noterFuite(e); return 'abandonne'; }
    } else e.refugeT = 0;
    if (etat === 'abandonne' && e.avaitVu) this.noterFuite(e);
    if (etat === 'alertee') e.avaitVu = true;
    return etat;
  },
  noterFuite(e) { if (e.avaitVu) { e.avaitVu = false; this.noter(e.esp, 1); } },
  feuPres(x, z, r) { for (const f of this.feux) if (Math.hypot(f[0] - x, f[1] - z) < r) return f; return null; },
  // régler les sens (endormie, éveillée…) sans perdre l'état
  sens(e, R) { const F = e.furtif; if (!F) return; Object.assign(F, { vue: 32, cone: 120, nuit: 0.45, ouie: 1, hauteur: 1.6, vitesse: 1, oubli: 0.25, memoire: 14, lumiere: 0.6, aveugle: false, sourd: false }, e.D.sens, R || {}); },

  // ------------------------------------------------------------- marcher (le relief, l'eau, les murs, les falaises)
  pas(e, dt, dir, v) {
    const Z = zone.Z, D = e.D;
    if (e.contourneT > 0) { e.contourneT -= dt; dir += e.contourne * 1.3; }
    e.heading = turnToward(e.heading, dir, dt * D.tour);
    const st = v * dt;
    let nx = e.x + Math.sin(e.heading) * st, nz = e.z + Math.cos(e.heading) * st;
    let ok = Z.inside(nx, nz, 12);
    const hT = ok ? Z.heightAt(nx, nz) : 0;
    if (ok && !D.eau && hT < Z.waterLevel - 0.4) ok = false;
    if (ok && D.eau && hT > Z.waterLevel - 0.7) ok = false;
    let ny = e.y;
    if (ok && !D.eau) {
      [nx, nz] = Z.collideCircle(nx, nz, e.y + 0.35, e.y + Math.min(2.2, D.haut), D.rayon, 0.6, D.rayon > 0.3);
      ny = e.nid.dessous ? Z.groundAt(nx, nz, e.y + 0.3, 0.6) : Z.groundAt(nx, nz, e.y + 0.3, 0.6);
      if (!isFinite(ny) || ny < -1e8) ok = false;
      else { const dy = ny - e.y, dd = Math.hypot(nx - e.x, nz - e.z) || st; if (dy > 0.6 + dd * 1.3 || dy < -(1.2 + dd * 2)) ok = false; }
    } else if (ok && D.eau) ny = Z.waterLevel - 1.25;
    if (!ok) { e.bloque = (e.bloque || 0) + dt; if (e.bloque > 0.35) { e.bloque = 0; e.contourne = Math.random() < 0.5 ? -1 : 1; e.contourneT = 1 + Math.random(); } e.move = Math.max(0, e.move - dt * 4); return false; }
    const moved = Math.hypot(nx - e.x, nz - e.z);
    e.coince = moved < st * 0.25 ? (e.coince || 0) + dt : 0;
    if (e.coince > 0.8) { e.coince = 0; e.contourne = Math.random() < 0.5 ? -1 : 1; e.contourneT = 1.2; }
    e.x = nx; e.z = nz; e.y = ny;
    e.move = Math.min(1, e.move + dt * 5);
    e.run = v > D.marche * 1.6;
    e.phase += dt * v * (e.run ? 2.2 : 3.0) / Math.max(0.6, D.haut * 0.6);
    return true;
  },
  // aller vers un point ; renvoie la distance qui reste
  aller(e, dt, tx, tz, v) {
    const d = Math.hypot(tx - e.x, tz - e.z);
    if (d < 0.4) { e.move = Math.max(0, e.move - dt * 4); return d; }
    this.pas(e, dt, Math.atan2(tx - e.x, tz - e.z), v);
    return d;
  },
  arreter(e, dt) { e.move = Math.max(0, e.move - dt * 4); e.run = false; },
  // errer autour de chez soi : un but, une pause
  errer(e, dt, rayon, vitesse) {
    // une ronde donnée (le chemin de ronde du château…) : d'un point à l'autre, aller et retour
    const RD = e.nid.ronde;
    if (RD && RD.length > 1) {
      if (e.rondeI === undefined) { e.rondeI = e.k % RD.length; e.rondeS = 1; }
      if (e.pause) { e.timer -= dt; this.arreter(e, dt); if (e.timer <= 0) e.pause = false; return; }
      const [tx, tz] = RD[e.rondeI];
      if (this.aller(e, dt, tx, tz, vitesse || e.D.marche) < 1.2) {
        if (e.rondeI + e.rondeS < 0 || e.rondeI + e.rondeS >= RD.length) e.rondeS = -e.rondeS;
        e.rondeI += e.rondeS; e.pause = Math.random() < 0.3; e.timer = 2 + Math.random() * 4;
      }
      return;
    }
    const R = rayon === undefined ? e.nid.r : rayon;
    e.timer -= dt;
    if (!e.but || e.timer <= 0) {
      if (e.but && e.pause !== true) { e.pause = true; e.timer = 2 + Math.random() * 6; e.but = null; this.arreter(e, dt); return; }
      e.pause = false;
      const a = Math.random() * TAU, d = Math.sqrt(Math.random()) * Math.max(2, R);
      e.but = [e.hx + Math.cos(a) * d, e.hz + Math.sin(a) * d]; e.timer = 25;
    }
    if (e.pause) { this.arreter(e, dt); return; }
    const reste = this.aller(e, dt, e.but[0], e.but[1], vitesse || e.D.marche);
    if (reste < 1.2) { e.but = null; e.pause = true; e.timer = 2 + Math.random() * 7; }
  },
  // regarder un point (la tête, par rapport au corps)
  regarder(e, x, z, dt, k) {
    const want = angDiff(e.heading, Math.atan2(x - e.x, z - e.z));
    e.regard = lerp(e.regard || 0, clamp(want, -1.4, 1.4), Math.min(1, dt * (k || 3)));
    return want;
  },
  tourner(e, x, z, dt, vit) { e.heading = turnToward(e.heading, Math.atan2(x - e.x, z - e.z), dt * (vit || e.D.tour)); },

  // ------------------------------------------------------------- la traque commune : chasser, chercher, rentrer
  // (pour les bêtes qui marchent ; les conduites l'appellent selon l'état de furtif)
  traque(e, dt, p, etat, o) {
    o = o || {};
    const F = e.furtif;
    if (etat === 'alertee') {
      e.mode = 'chasse';
      let tx = p.pos[0], tz = p.pos[2];
      if (F.vu < 0.05 && F.dernier) { tx = F.dernier.x; tz = F.dernier.z; }
      // le refuge : on reste à la lisière du feu
      const f = e.D.feu !== false && this.feuPres(tx, tz, V2_REFUGE + 1);
      if (f) { const a = Math.atan2(e.x - f[0], e.z - f[1]); tx = f[0] + Math.sin(a) * (V2_REFUGE + 2); tz = f[1] + Math.cos(a) * (V2_REFUGE + 2); }
      // la meute tourne autour avant de mordre
      if (o.cercle && e.dist > 3 && e.dist < 9 && e.attT > 0.3) { const k = (e.k / Math.max(1, e.nid.n)) * TAU + this.t * 0.4; tx = p.pos[0] + Math.sin(k) * 6; tz = p.pos[2] + Math.cos(k) * 6; }
      const pres = e.D.coup && !f && e.dist < e.D.coup.portee * 0.7 && Math.abs(p.pos[1] - e.y) < 2;
      const reste = pres ? (this.arreter(e, dt), e.dist) : this.aller(e, dt, tx, tz, o.vitesse || e.D.course);
      this.regarder(e, p.pos[0], p.pos[2], dt);
      if (!f && e.D.coup && e.dist < e.D.coup.portee + 0.3 && Math.abs(p.pos[1] - e.y) < 2 && e.attT <= 0 && e.prep === undefined && (!o.peutMordre || o.peutMordre(e))) this.lancerCoup(e);
      return reste;
    }
    if (etat === 'cherche') {
      e.mode = 'cherche';
      const L = F.dernier;
      if (!L) { e.mode = 'rentre'; return; }
      if (!e.fouille || e.fouilleDe !== L.t) { e.fouilleDe = L.t; e.fouille = [L.x, L.z]; e.fouilleT = 0; }
      const reste = this.aller(e, dt, e.fouille[0], e.fouille[1], o.vitesseCherche || Math.max(e.D.marche * 1.8, e.D.course * 0.45));
      e.fouilleT += dt;
      if (reste < 1.5 || e.fouilleT > 8) { const a = Math.random() * TAU, d = 3 + Math.random() * 7; e.fouille = [L.x + Math.cos(a) * d, L.z + Math.sin(a) * d]; e.fouilleT = 0; }
      return;
    }
    if (etat === 'intriguee') {
      e.mode = 'guette';
      this.arreter(e, dt);
      if (F.dernier) { this.tourner(e, F.dernier.x, F.dernier.z, dt, e.D.tour * 0.5); this.regarder(e, F.dernier.x, F.dernier.z, dt); }
      return;
    }
    // tranquille ou abandonne : rentrer, puis vivre sa vie
    if (e.mode === 'chasse' || e.mode === 'cherche' || e.mode === 'guette') e.mode = 'rentre';
    if (e.mode === 'rentre') {
      const reste = this.aller(e, dt, e.hx, e.hz, e.D.marche * 1.4);
      if (reste < 2.5) e.mode = 'repos';
      return 'rentre';
    }
    return null;
  },

  // ------------------------------------------------------------- les coups : on prévient (un temps), puis on frappe
  lancerCoup(e) { const C = e.D.coup; e.prep = C.prep || 0.01; e.att = 0.01; this.crier(e, 'attaque', 1, true); },
  porterCoup(e, dt, p) {
    const C = e.D.coup;
    e.prep -= dt;
    e.att = clamp(1 - e.prep / Math.max(0.05, C.prep || 0.05), 0, 1);
    if (e.prep > 0) { this.regarder(e, p.pos[0], p.pos[2], dt, 6); this.tourner(e, p.pos[0], p.pos[2], dt, e.D.tour * 1.5); return; }
    e.prep = undefined; e.attT = C.recup || 2;
    setTimeout(() => { e.att = 0; }, 260);
    const dy = Math.abs(p.pos[1] - e.y);
    if (game.dying || game.sleeping || e.mort || e.dist > C.portee * 1.3 + 0.3 || dy > 2.2) return;
    this.blesserJoueur(e, C.dmg, C);
  },
  blesserJoueur(e, dmg, C) {
    C = C || e.D.coup || {};
    // le chien gris s'interpose parfois
    if (typeof V2_CHIEN_PROTEGE === 'function' && V2_CHIEN_PROTEGE(e, dmg)) return;
    play.hurt(dmg, e, C.cause || 'Tué derrière la Porte');
    if (C.saigne && Math.random() < C.saigne[0] && typeof corps !== 'undefined') corps.saigner(C.saigne[1], C.cause);
    if (C.poison && !BUFF.on('antidote')) play.poisonT = Math.max(play.poisonT || 0, C.poison);
    if (C.serre) this.serreT = Math.max(this.serreT || 0, C.serre);
    const H = typeof V2_COUP !== 'undefined' && V2_COUP[e.D.conduite];
    if (H) try { H.call(this, e, dmg); } catch (err) { console.error(err); }
  },

  // ------------------------------------------------------------- les cris (espacés)
  crier(e, cri, k, force) {
    const n = (V2_CRIS[e.esp] || {})[cri] || cri;
    if (!force && e.criT && this.t - e.criT < 1.2) return;
    e.criT = this.t;
    try { sound.v2Cri(e.esp, n, [e.x, e.y + e.D.haut * 0.75, e.z], k === undefined ? 1 : k); } catch (err) { console.error(err); }
  },

  // ------------------------------------------------------------- les armes du joueur
  raycast(o, d, maxDist) {
    let best = null;
    const dh = Math.hypot(d[0], d[2]) || 1e-6;
    for (const e of this.vivantes) {
      if (e.mort || e.cache || e.removed) continue;
      const sc = e.echelle || 1, r = e.D.rayon * sc * 1.25 + 0.12, h = e.D.haut * sc;
      const cx = e.x - o[0], cz = e.z - o[2];
      const tc = (cx * d[0] + cz * d[2]) / (dh * dh);
      if (tc < 0 || tc > maxDist) continue;
      const px = d[0] * tc - cx, pz = d[2] * tc - cz;
      if (px * px + pz * pz > r * r) continue;
      const y = o[1] + d[1] * tc, y0 = e.y + (e.basY || 0);
      if (y < y0 - 0.25 || y > y0 + h + 0.25) continue;
      if (!best || tc < best.t) best = { t: tc, s: e, p: [o[0] + d[0] * tc, y, o[2] + d[2] * tc] };
    }
    return best;
  },
  frapper(e, dmg, from) {
    if (!e || e.mort) return;
    const D = e.D, hand = farm.s.hand, it = ITEMS[hand], outil = it ? it.tool : 'main';
    const tir = outil === 'arc' || hand === 'fusil' || (it && it.tool === 'fusil');
    let k = 1;
    if (D.pierre) k = outil === 'pioche' ? 3 : tir ? 0.15 : 0.3;
    const M = typeof V2_MULT !== 'undefined' && V2_MULT[D.conduite];
    if (M) k *= M.call(this, e, dmg, outil, tir);
    e.hp -= dmg * k; e.hurtT = 0.3;
    if (D.pierre) { try { sound.v2Cri('pierre', 'coup', [e.x, e.y + 0.8, e.z], 1); } catch (err) { /* */ } }
    else this.crier(e, 'mal', 1, true);
    furtif.bruit(e.x, e.y, e.z, 14, 'coup');
    // un coup se sent : elle sait d'où il vient
    const F = e.furtif, p = game.player;
    if (F && !e.mort) { F.soupcon = 2; F.dernier = { x: p.pos[0], y: p.pos[1], z: p.pos[2], t: game.time, vu: true }; if (F.etat !== 'alertee') furtif.changer(e, 'alertee'); }
    const H = typeof V2_TOUCHE !== 'undefined' && V2_TOUCHE[D.conduite];
    if (H) try { H.call(this, e, dmg * k); } catch (err) { console.error(err); }
    if (e.hp <= 0) this.mourir(e);
  },
  mourir(e, sansButin) {
    if (e.mort) return;
    const S = this.S(), D = e.D, N = e.nid;
    e.mort = true; e.mortT = 0; e.prep = undefined; e.att = 0; e.move = 0; e.vol = false;
    furtif.oublier(e);
    if (D.unique) { S.uniques[e.esp] = farm.s.day; e.mortGarde = true; }
    else { const M = S.morts[N.id] || (S.morts[N.id] = { n: 0, j: 0 }); M.n++; M.j = farm.s.day; }
    this.crier(e, 'meurt', 1, true);
    if (!sansButin && D.butin) for (const [id, n] of rollLoot(D.butin)) { if (id === 'argent') { farm.earn(n); sound.coin && sound.coin(); } else { farm.give(id, n); play.flyer(id, [e.x, e.y + 0.6, e.z], n); } }
    const H = typeof V2_MORT !== 'undefined' && V2_MORT[D.conduite];
    if (H) try { H.call(this, e, sansButin); } catch (err) { console.error(err); }
    this.noter(e.esp, 2);
    for (const fn of this.surMort) try { fn(e, N); } catch (err) { console.error(err); }
    farm.save();
  },

  // ------------------------------------------------------------- le carnet : vu (0), compris (1), fini (2)
  noter(esp, niv) {
    const S = this.S();
    if (!S.vus[esp]) { S.vus[esp] = farm.s.day; if (typeof savoir !== 'undefined' && savoir.voir) try { savoir.voir(esp); } catch (e) { /* */ } }
    const avant = S.notes[esp] === undefined ? -1 : S.notes[esp];
    if (niv > avant) S.notes[esp] = niv;
  },

  // ------------------------------------------------------------- le dessin
  dessiner(buf, sbuf, cam, t) {
    if (!zone.dedans) return;
    const fog = game.sky ? Math.min(170, game.sky.fog[1] + 15) : 160, m2 = fog * fog;
    for (const e of this.vivantes) {
      if (e.cache || e.removed || !e.rig) continue;
      const dx = e.x - cam[0], dz = e.z - cam[2];
      if (dx * dx + dz * dz > m2) continue;
      e.nuit = this.nuit;
      const pose = V2_POSES[e.esp];
      let dy = 0;
      try { dy = pose ? pose(e.rig, e, t) || 0 : 0; } catch (err) { console.error('V2 pose', e.esp, err); }
      const fl = e.hurtT > 0 || e.highlight ? FX_HI : 0;
      e.highlight = false;
      drawRig(buf, e.rig, e.x, e.y + dy + (e.dy || 0), e.z, e.capCorps !== undefined ? e.capCorps : e.heading, e.echelle || 1, fl);
      if (sbuf && !e.vol && !e.pendu && !e.D.eau && !e.nid.perche && dx * dx + dz * dz < 3600) drawShadow(sbuf, e.x, e.y, e.z, Math.max(0.22, e.D.rayon * 1.05) * (e.echelle || 1));
    }
    const X = typeof V2_DESSIN !== 'undefined' ? V2_DESSIN : null;
    if (X) for (const N of this.nids) { if (!N.vie) continue; const f = X[V2_ESPECES[N.esp].conduite]; if (f) try { f.call(this, N, buf, cam, t); } catch (err) { console.error(err); } }
  },
};
// ---------------------------------------------------------------- les noms des cris par espèce (sinon le nom du cri lui-même)
const V2_CRIS = {
  v2_garou: { attaque: 'mord', mal: 'grogne', alerte: 'hurle' },
  v2_charognard: { attaque: 'mord', mal: 'meurt', alerte: 'ricane' },
  v2_pendu: { attaque: 'rale', mal: 'rale', meurt: 'rale' },
  v2_ecoutant: { attaque: 'cri', mal: 'cri', alerte: 'cri' },
  v2_gargouille: { attaque: 'cri', mal: 'brise', meurt: 'brise', alerte: 'cri' },
  v2_stryge: { attaque: 'cri', mal: 'cri', meurt: 'cri', alerte: 'cri' },
  v2_basilic: { attaque: 'siffle', mal: 'siffle', meurt: 'pierre', alerte: 'chant' },
  v2_tarasque: { attaque: 'rugit', mal: 'rugit', alerte: 'rugit' },
  v2_chimere: { attaque: 'rugit', mal: 'rugit', alerte: 'rugit' },
  v2_vouivre: { attaque: 'siffle', mal: 'cri', alerte: 'cri' },
  v2_noye: { attaque: 'bulles', mal: 'bulles', meurt: 'bulles', alerte: 'voix' },
  v2_korrigan: { mal: 'cri', meurt: 'cri', alerte: 'rire' },
  v2_cerf: { mal: 'souffle', meurt: 'souffle', alerte: 'souffle' },
  v2_chien: { attaque: 'aboie', mal: 'gemit', meurt: 'gemit', alerte: 'grogne' },
  v2_sans_visage: { mal: 'bele', meurt: 'bele', alerte: 'bele' },
};
// (les conduites, naissances, présences, morts… sont remplies par 11-zzzzV2-3-especes.js)
const V2_CONDUITES = {};

// ---------------------------------------------------------------- l'API pour les autres (V3, V4, V5)
zone.creatures = {
  especes() { return V2_ORDRE.map((id) => { const D = V2_ESPECES[id]; return { id, nom: D.nom, titre: D.titre, nature: D.nature, unique: !!D.unique, dessous: !!D.dessous, types: D.types.slice() }; }); },
  poser(esp, x, y, z, o) { return creaturesV2.poser(esp, x, y, z, o); },
  retirer(id) { return creaturesV2.retirer(id); },
  liste(q) { return creaturesV2.liste(q); },
  pres(x, z, r) { return creaturesV2.vivantes.filter((e) => !e.mort && !e.cache && !e.removed && Math.hypot(e.x - x, e.z - z) < (r || 30)); },
  pour(type, dessous) { return creaturesV2.pour(type, dessous); },
  surMort: creaturesV2.surMort,
  etat(id) { const n = creaturesV2.nids.find((q) => q.id === id); return n ? creaturesV2.resume(n) : null; },
  tuer(id) { const n = creaturesV2.nids.find((q) => q.id === id); if (!n) return false; for (const e of n.ents) creaturesV2.mourir(e, true); return true; },
};

// ---------------------------------------------------------------- branchements
zone.armes.push({ raycast: (o, d, m) => creaturesV2.raycast(o, d, m), frapper: (s, dmg, from) => creaturesV2.frapper(s, dmg, from) });
zone.sur('update', (dt, eye, basis, sky, playing) => creaturesV2.update(dt, eye, basis, sky, playing));
zone.sur('draw', (buf, sbuf, cam, t) => creaturesV2.dessiner(buf, sbuf, cam, t));
zone.sur('entrer', () => { creaturesV2.toutEffacer(); creaturesV2.Zcur = null; });
zone.sur('sortir', () => { creaturesV2.toutEffacer(); creaturesV2.serreT = 0; });
// se reposer à un feu de veille : les bêtes reviennent (sauf les uniques), et toutes retournent à leur nid
zone.sur('repos', () => { const S = creaturesV2.S(); S.morts = {}; creaturesV2.toutEffacer(); });
zone.sur('charger', () => { creaturesV2.toutEffacer(); creaturesV2.Zcur = null; });
HOOKS.load.push(() => { creaturesV2.vivantes = []; creaturesV2.nids = []; creaturesV2.Zcur = null; creaturesV2.serreT = 0; if (farm.s) creaturesV2.S(); });
// chaque matin : les morts de plus de trois jours reviennent, même sans repos
HOOKS.day.push(() => { if (!farm.s) return; const S = creaturesV2.S(); for (const k in S.morts) if (farm.s.day - (S.morts[k].j || 0) >= 3) delete S.morts[k]; });
// étreinte (pendus, noyés) : on avance mal tant qu'on est tenu
{
  const _u = Player.prototype.update;
  Player.prototype.update = function (dt, w, c) {
    const k = zone.dedans ? creaturesV2.ralenti(dt) : 1;
    if (k >= 1) return _u.call(this, dt, w, c);
    const sp = this.mods.speed;
    this.mods.speed = sp * k;
    try { return _u.call(this, dt, w, c); } finally { this.mods.speed = sp; }
  };
}
creaturesV2.ralenti = function (dt) {
  this.serreT = Math.max(0, (this.serreT || 0) - dt);
  let k = this.serreT > 0 ? 0.45 : 1;
  if (this.pierre > 0) k = Math.min(k, 1 - this.pierre * 0.7);
  if (this.tenu) k = Math.min(k, 0.35);
  return k;
};
// les coups de feu s'entendent de loin (l'arc, non)
if (typeof chasse !== 'undefined' && chasse.sonTir) {
  const _st = chasse.sonTir.bind(chasse);
  chasse.sonTir = function (pos, soi) {
    if (soi && zone.dedans && game.player) { const p = game.player.pos; furtif.bruit(p[0], p[1], p[2], 120, 'coup de feu'); }
    return _st(pos, soi);
  };
}
