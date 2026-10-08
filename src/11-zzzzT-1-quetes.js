// ============================================================================
//  LES QUÊTES PRINCIPALES À LIEUX PRÉCIS (agent T, treizième vague) : le jeu.
//  - Cinq quêtes (textes : 05-zzzzzT-quetes.js), chacune PROPOSÉE au joueur :
//    par un habitant (l'aubergiste, le docteur des Sources : une réplique de
//    plus), une lettre (Marie Lemarié, dans la boîte aux lettres), un avis (le
//    panneau de la place de Valbrume), un objet trouvé (une crécelle, devant le
//    relais de chasse). On accepte, on remet à plus tard (elle reste au carnet,
//    on y revient), ou l'on refuse pour de bon ; une quête commencée
//    s'abandonne et se reprend ; plusieurs courent ensemble ; rien n'oblige.
//  - Chaque étape : un lieu précis, le même dans toutes les parties (bâtiments
//    w.bld, lieux-dits w.lm, l'étage d'une maison) ; une courte scène le montre
//    (11-zzzzT-2-scenes.js), tantôt dehors, tantôt dedans ; sur place, quelque
//    chose à trouver (E) : un objet posé là (dessiné à la volée, HOOKS.draw), une
//    chose de la maison (les souliers de la sept, le casier de la poste, un
//    tableau sous un drap…), le registre du phare, la lanterne, le lit de la sept.
//  - La dernière étape : un choix, deux fins, chacune sa récompense (argent,
//    objet rare, recette, petit avantage durable, morceau de vérité).
//  - L'habitant qui proposait la quête meurt : elle est perdue, comme ses quêtes
//    à lui. Rien n'est généré : l'empreinte des sauvegardes ne bouge pas.
//  État : farm.s.quetes = { v, Q: { t1…t5: { st, e, jp, j0, vu[], tr[], fin, jf } },
//         av: { avantages durables }, courrier: [lettres à venir], mail: { t2: jour } }
//  st : '' (pas encore), 'propose', 'actif', 'fini', 'jamais', 'abandon', 'perdue'.
//  API : quetes (liste, etat, etape, lieu, proposer, accepter, plusTard, jamais,
//        abandonner, reprendre, revoir).
// ============================================================================
const QT_HEURES = { nuit: (h) => h >= 21 || h < 5, aube: (h) => h >= 3 && h < 6.5 };
const QT_REACH = 2.5;

// ---------------------------------------------------------------- géométrie
function qtW(f, lx, lz) { const c = Math.cos(f.r), s = Math.sin(f.r); return [f.x + lx * c + lz * s, f.z - lx * s + lz * c]; }
function qtL(f, x, z) { const c = Math.cos(f.r), s = Math.sin(f.r), dx = x - f.x, dz = z - f.z; return [dx * c - dz * s, dx * s + dz * c]; }
// la vallée (pas un autre monde, pas le Dessous)
function qtMonde() { const w = game.world; return w && w.bld && w.lm && w.bld.auberge && w.bld.eglise ? w : null; }
// les blocs d'un endroit (une fois), et un rayon contre eux seuls (raycastBlocks parcourt toute la vallée)
function qtBlocs(w, x, z, r) {
  const L = [];
  w.query(x, z, r, null, (b) => { if (!b.hidden && !(b.ver && !(b.ver & w.curVer))) L.push(b); });
  return L;
}
function qtRayon(w, L, o, d, max) {
  let best = null;
  for (const b of L) { const h = w.raycastBlock(b, o, d); if (h && h.t >= 0 && h.t <= max && (!best || h.t < best.t)) best = h; }
  return best;
}
// un point pris dans un bloc (marge m)
function qtDansBloc(L, P, m) {
  for (const b of L) {
    const [lx, lz] = World.blockLocal(b, P[0], P[2]);
    const hx = b.sx / 2, hz = b.sz / 2;
    if (Math.abs(lx) > hx + m || Math.abs(lz) > hz + m) continue;
    const top = b.y + World.blockTop(b, clamp(lx, -hx, hx), clamp(lz, -hz, hz));
    if (P[1] > b.y - m && P[1] < top + m) return true;
  }
  return false;
}
// sous un toit (un bloc au-dessus, à moins de 14 m)
function qtSousToit(w, L, P) { return !!qtRayon(w, L, P, [0, 1, 0], 14); }
// un buisson, une touffe haute, un arbre à moins de R mètres (les fleurs ne comptent pas)
function qtBuisson(w, x, z, R) {
  const G = w.objectsGrid(), C = G.C, m = R + 3;
  const gx0 = clamp(Math.floor((x - m) / C), 0, G.gw - 1), gx1 = clamp(Math.floor((x + m) / C), 0, G.gw - 1);
  const gz0 = clamp(Math.floor((z - m) / C), 0, G.gw - 1), gz1 = clamp(Math.floor((z + m) / C), 0, G.gw - 1);
  for (let gz = gz0; gz <= gz1; gz++) for (let gx = gx0; gx <= gx1; gx++) {
    const c = G.cells[gz * G.gw + gx];
    if (c) for (const i of c) {
      const o = w.objects[i], T = o && OBJ_TYPES[o.t];
      if (!T || T.animal || !w.live(o) || o.h < 0.9 || T.cat === 'Fleurs' || T.cat === 'Champignons') continue;
      if (Math.hypot(o.x - x, o.z - z) < R + (objRadius(T, o) || o.h * 0.35)) return true;
    }
  }
  return false;
}
// un sol libre dehors, où poser une chose de rayon rad (o.eau : le bord de l'eau ; o.props : objets posés à éviter)
function qtSol(w, x, z, rad, o) {
  o = o || {};
  if (!w.inside(x, z, 12)) return false;
  const h = w.heightAt(x, z), WL = w.waterLevel;
  if (h < WL + (o.eau ? 0.05 : 0.3)) return false;
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (Math.abs(w.heightAt(x + dx * 1.1, z + dz * 1.1) - h) > (o.pente || 0.75)) return false;
  const L = qtBlocs(w, x, z, rad + 3);
  for (const b of L) {
    const [lx, lz] = World.blockLocal(b, x, z);
    if (Math.abs(lx) > b.sx / 2 + rad || Math.abs(lz) > b.sz / 2 + rad) continue;
    if (b.y + b.sy > h + 0.15 && b.y < h + 14) return false;
  }
  const [cx, cz] = w.collideCircle(x, z, h, h + 1.7, rad + 0.35, 0.3);
  if (Math.hypot(cx - x, cz - z) > 0.05) return false;
  if (o.props) for (const q of o.props) if (Math.hypot(q.x - x, q.z - z) < rad + (o.ecart || 0.9)) return false;
  if (!o.buissons && qtBuisson(w, x, z, rad + 0.3)) return false;
  return true;
}
// les objets posés d'un bâtiment (dans son emprise), filtrés : test(q, lx, lz, hauteur au-dessus du sol du bâtiment)
function qtPropsDans(w, key, test) {
  const B = w.bld[key];
  if (!B || !B.f) return [];
  const out = [];
  for (const q of w.props) {
    if (!q || !w.live(q) || !isFinite(q.x)) continue;
    const [lx, lz] = qtL(B.f, q.x, q.z);
    if (Math.abs(lx) <= B.W / 2 + 0.2 && Math.abs(lz) <= B.D / 2 + 0.2 && test(q, lx, lz, q.y - B.f.y)) out.push(q);
  }
  return out;
}
const qtInter = (w, id) => (w.inter || []).find((i) => i.id === id) || null;
const qtProps = (w, x, z, r, test) => w.props.filter((q) => q && w.live(q) && Math.abs(q.x - x) < r && Math.abs(q.z - z) < r && (!test || test(q)));
// le premier point libre, dans l'ordre (déterministe) des candidats
function qtPremier(w, cands, rad, o) { for (const c of cands) if (qtSol(w, c[0], c[1], rad, o)) return c; return null; }
// candidats sur des anneaux autour de (x, z) : de r0 à r1, en commençant par l'angle a0
function qtAnneaux(x, z, r0, r1, a0, n) {
  const out = [];
  for (let r = r0; r <= r1 + 1e-6; r += 0.75) for (let k = 0; k < (n || 16); k++) {
    const a = a0 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * TAU / (n || 16);
    out.push([x + Math.sin(a) * r, z + Math.cos(a) * r, a]);
  }
  return out;
}

// ---------------------------------------------------------------- les lieux de chaque étape (calculés une fois par vallée)
// Chaque fonction rend { p: [x, y, z] (ce qu'on vise de E), dessin, rot, prop (un objet posé à faire luire), inter (une
// interaction du jeu qui fait l'affaire), lieu: { dedans, bld, sol, c (ce que montre le plan large), hc (sa hauteur) } }
const QT_LIEUX = {
  // ------------------------------------------------------------ 1. la chambre sept
  't1:0'(w) {
    const q = qtPropsDans(w, 'auberge', (q, lx, lz, h) => q.id === 'b1_souliers' && h > 2.5)[0];
    const it = qtInter(w, 'b1:auberge:sept');
    if (!q && !it) return null;
    const p = q ? [q.x, q.y + 0.12, q.z] : [it.x, it.y - 0.4, it.z];
    const lit = it ? [it.x, it.y - 0.5, it.z] : p;
    return { p, prop: q || null, r: 2.2, lieu: { dedans: true, bld: 'auberge', sol: q ? q.y : it.y - 0.75, c: [(p[0] + lit[0]) / 2, (q ? q.y : p[1]) + 0.5, (p[2] + lit[2]) / 2] } };
  },
  't1:1'(w) {
    const L = w.lm.pont_riviere;
    if (!L) return null;
    const pont = qtProps(w, L.x, L.z, 25, (q) => q.id === 'pont_bois').sort((a, b) => Math.hypot(a.x - L.x, a.z - L.z) - Math.hypot(b.x - L.x, b.z - L.z))[0];
    const T = w.townInfo || w.lm.place || { x: 1572, z: 1600 };
    let E = [L.x, L.z], ax = [0, 1];
    if (pont) {
      const len = (pont.data && pont.data.L) || 20;
      ax = [Math.sin(pont.r || 0), Math.cos(pont.r || 0)];
      const e1 = [pont.x + ax[0] * len / 2, pont.z + ax[1] * len / 2], e2 = [pont.x - ax[0] * len / 2, pont.z - ax[1] * len / 2];
      E = Math.hypot(e1[0] - T.x, e1[1] - T.z) < Math.hypot(e2[0] - T.x, e2[1] - T.z) ? e1 : e2;
    }
    // la berge, au pied du pont, côté ville : à côté du tablier, au ras de l'eau
    const WL = w.waterLevel, props = qtProps(w, E[0], E[1], 14);
    let best = null;
    for (const [x, z] of qtAnneaux(E[0], E[1], 2.5, 9, 0, 24)) {
      const h = w.heightAt(x, z);
      if (h < WL + 0.08 || h > WL + 1.1) continue;
      const along = (x - E[0]) * ax[0] + (z - E[1]) * ax[1], perp = Math.abs((x - E[0]) * ax[1] - (z - E[1]) * ax[0]);
      if (perp < 2.6) continue;                                               // pas sous le tablier
      if (!qtSol(w, x, z, 0.5, { eau: true, props, pente: 0.9 })) continue;
      let eau = false;
      for (let k = 0; k < 8 && !eau; k++) { const a = k / 8 * TAU; if (w.heightAt(x + Math.sin(a) * 3, z + Math.cos(a) * 3) < WL - 0.05) eau = true; }
      if (!eau) continue;
      const sc = -Math.abs(h - (WL + 0.35)) * 2 - Math.abs(Math.hypot(x - E[0], z - E[1]) - 4.5) * 0.3 - Math.abs(along) * 0.05;
      if (!best || sc > best.sc) best = { x, z, h, sc };
    }
    if (!best) return null;
    // les pas montent de l'eau vers la route : la pente, vers le haut
    let a = 0, bh = -1e9;
    for (let k = 0; k < 16; k++) { const t = k / 16 * TAU, hh = w.heightAt(best.x + Math.sin(t) * 1.5, best.z + Math.cos(t) * 1.5); if (hh > bh) { bh = hh; a = t; } }
    return { p: [best.x, best.h + 0.05, best.z], dessin: 'pas', rot: a, r: 2.6, lieu: { dedans: false, c: [pont ? pont.x : L.x, (pont ? pont.y : L.y) + 1.2, pont ? pont.z : L.z], hc: 1.2 } };
  },
  't1:2'(w) {
    const q = qtPropsDans(w, 'poste', (q, lx, lz, h) => q.id === 'casier_tri' && h > 2.5)[0];
    if (!q) return null;
    const lx = 0.24, ly = 1.47, lz = 0.16, c = Math.cos(q.r || 0), s = Math.sin(q.r || 0);
    const p = [q.x + lx * c + lz * s, q.y + ly, q.z - lx * s + lz * c];
    return { p, prop: q, dessin: 'enveloppe', r: 2.4, lieu: { dedans: true, bld: 'poste', sol: q.y, c: [q.x + s * 0.2, q.y + 1.2, q.z + c * 0.2] } };
  },
  't1:3'(w) {
    const C = w.lm.cimetiere;
    if (!C) return null;
    const murs = qtProps(w, C.x, C.z, 20, (q) => q.id === 'cloture_pierre');
    const autres = qtProps(w, C.x, C.z, 20, (q) => q.id !== 'cloture_pierre');
    const evite = autres.concat((w.inter || []).filter((i) => Math.abs(i.x - C.x) < 20 && Math.abs(i.z - C.z) < 20 && (i.kind === 'dig' || i.kind === 'note')));
    let best = null;
    for (const m of murs) {
      const dx = C.x - m.x, dz = C.z - m.z, d = Math.hypot(dx, dz) || 1;
      const x = m.x + dx / d * 1.0, z = m.z + dz / d * 1.0;
      if (!qtSol(w, x, z, 0.35, { props: evite, ecart: 1.2, buissons: true })) continue;
      let pres = 1e9;
      for (const q of evite) pres = Math.min(pres, Math.hypot(q.x - x, q.z - z));
      const sc = Math.min(pres, 4) * 2 - Math.abs(d - 10) * 0.2 + (m.x * 0.0007 + m.z * 0.0003) % 0.01;
      if (!best || sc > best.sc) best = { x, z, sc, a: Math.atan2(dx, dz) };
    }
    if (!best) return null;
    const h = w.heightAt(best.x, best.z);
    return { p: [best.x, h + 0.35, best.z], dessin: 'croix', rot: best.a, r: 2.4, lieu: { dedans: false, c: [C.x, (C.y || h) + 1.0, C.z], hc: 1.0 } };
  },
  't1:4'(w) {
    const it = qtInter(w, 'b1:auberge:sept');
    if (!it) return null;
    const S0 = QT_LIEUX['t1:0'](w);
    return { p: [it.x, it.y, it.z], inter: it.id, r: 2.6, lieu: { dedans: true, bld: 'auberge', sol: S0 ? S0.lieu.sol : it.y - 0.75, c: [it.x, it.y - 0.3, it.z] } };
  },
  // ------------------------------------------------------------ 2. le feu du lac
  't2:0'(w) {
    const P = (w.b2 && w.b2.phare) || w.lm.phare;
    if (!P) return null;
    const WL = w.waterLevel, props = qtProps(w, P.x, P.z, 30);
    let best = null;
    for (const [x, z] of qtAnneaux(P.x, P.z, 7, 22, 0, 32)) {
      const h = w.heightAt(x, z);
      if (h < WL + 0.12 || h > WL + 1.2) continue;
      if (!qtSol(w, x, z, 1.4, { eau: true, props, pente: 0.9 })) continue;
      let eau = null;
      for (let k = 0; k < 12 && !eau; k++) { const a = k / 12 * TAU; if (w.heightAt(x + Math.sin(a) * 4, z + Math.cos(a) * 4) < WL - 0.05) eau = a; }
      if (eau === null) continue;
      const sc = -Math.abs(Math.hypot(x - P.x, z - P.z) - 11) * 0.4 - Math.abs(h - (WL + 0.45));
      if (!best || sc > best.sc) best = { x, z, h, sc, eau };
    }
    if (!best) return null;
    return { p: [best.x, best.h + 0.4, best.z], dessin: 'barque', rot: best.eau + Math.PI / 2, r: 2.9, cos: 0.6, lieu: { dedans: false, c: [P.x, (P.y || best.h) + 14, P.z], hc: 14, loin: true } };
  },
  't2:1'(w) {
    const it = qtInter(w, 'b2:phare:registre'), P = w.b2 && w.b2.phare;
    if (!it || !P) return null;
    return { p: [it.x, it.y, it.z], inter: it.id, r: 2.4, lieu: { dedans: true, phare: 3, sol: P.S[3], c: [it.x, it.y - 0.2, it.z] } };
  },
  't2:2'(w) {
    const Q = w.lm.planches_quai, D = w.lm.planches_dame, Pl = w.lm.planches;
    if (!Q) return null;
    // le bout du quai : on part de la rive et l'on suit le quai vers la Dame tant que les planches portent
    const A = Pl ? [Pl.x, Pl.z] : [Q.x, Q.z + 12], B = D ? [D.x, D.z] : [Q.x, Q.z - 12];
    const dx = B[0] - A[0], dz = B[1] - A[1], L = Math.hypot(dx, dz) || 1, ux = dx / L, uz = dz / L, WL = w.waterLevel;
    let bout = null;
    for (let t = 0; t <= L; t += 0.25) {
      const x = A[0] + ux * t, z = A[1] + uz * t, g = w.groundAt(x, z, WL + 4, 5);
      if (g > WL + 0.15) bout = { x, z, y: g, t };
      else if (bout && t > bout.t + 1.2) break;
    }
    if (!bout) return null;
    const x = bout.x - ux * 0.7, z = bout.z - uz * 0.7, y = w.groundAt(x, z, WL + 4, 5);
    return { p: [x, y + 0.25, z], dessin: 'bottes', rot: Math.atan2(ux, uz), r: 2.4, lieu: { dedans: false, c: [x, y + 0.4, z], hc: 0.4, quai: [ux, uz] } };
  },
  't2:3'(w) {
    const it = qtInter(w, 'b2:phare:lanterne'), P = w.b2 && w.b2.phare;
    if (!it || !P) return null;
    return { p: [it.x, it.y, it.z], inter: it.id, r: 2.4, lieu: { dedans: true, phare: 5, sol: P.S[5], c: [it.x, it.y - 0.6, it.z] } };
  },
  // ------------------------------------------------------------ 3. les toiles d'Ardoin
  't3:0'(w) {
    const q = qtPropsDans(w, 'mairie', (q, lx, lz, h) => q.id === 'b1_toile' && q.data && q.data.f === 'tableau' && h > 2.5)[0];
    if (!q) return null;
    return { p: [q.x, q.y + 0.7, q.z], prop: q, r: 2.4, lieu: { dedans: true, bld: 'mairie', sol: q.y, c: [q.x, q.y + 0.7, q.z] } };
  },
  't3:1'(w) {
    const Lv = w.lavoir, F = Lv && Lv.f;
    const c = F ? [F.x, F.z] : w.lm.lavoir ? [w.lm.lavoir.x, w.lm.lavoir.z] : null;
    if (!c) return null;
    const props = qtProps(w, c[0], c[1], 16), y0 = F ? F.y : w.heightAt(c[0], c[1]);
    const L = qtBlocs(w, c[0], c[1], 14);
    for (const [x, z] of qtAnneaux(c[0], c[1], 6, 10, F ? F.r + Math.PI : 0, 20)) {
      if (!qtSol(w, x, z, 0.5, { props, ecart: 1.2 })) continue;
      const h = w.heightAt(x, z), o = [x, h + 1.5, z], v = [c[0] - x, y0 + 1.2 - o[1], c[1] - z], d = Math.hypot(...v);
      if (qtRayon(w, L, o, v.map((k) => k / d), d - 2.5)) continue;           // il voyait le lavoir
      return { p: [x, h + 0.05, z], dessin: 'chevalet', rot: Math.atan2(c[0] - x, c[1] - z), r: 2.4, cos: 0.6, lieu: { dedans: false, c: [c[0], y0 + 1.4, c[1]], hc: 1.4 } };
    }
    return null;
  },
  't3:2'(w) {
    const q = qtPropsDans(w, 'bibliotheque', (q, lx, lz, h) => q.id === 'b1_toile' && q.data && q.data.f === 'tableau' && h > 4.5)[0];
    if (!q) return null;
    return { p: [q.x, q.y + 0.7, q.z], prop: q, r: 2.4, lieu: { dedans: true, bld: 'bibliotheque', sol: q.y, c: [q.x, q.y + 0.7, q.z] } };
  },
  't3:3'(w) {
    const A = w.abbey;
    if (!A || !A.f) return null;
    const f = A.f, sec = qtInter(w, 'abbaye_pierre'), props = qtProps(w, A.x, A.z, 16);
    // au pied du mur gauche, sous une fenêtre béante, loin du mur de l'autel
    for (const [lx, lz] of [[-3.3, 2.0], [-3.3, -2.0], [-3.3, 6.0], [-3.3, -6.0], [-2.6, 2.0], [-2.6, -2.0], [3.3, -6.0], [3.3, -2.0]]) {
      const [x, z] = qtW(f, lx, lz);
      if (sec && Math.hypot(sec.x - x, sec.z - z) < 4) continue;
      if (!qtSolDedans(w, x, A.y, z, 0.45, props)) continue;
      const [mx, mz] = qtW(f, lx < 0 ? -4.4 : 4.4, lz);
      return { p: [x, A.y + 0.2, z], dessin: 'pierre', rot: f.r + (lx < 0 ? Math.PI / 2 : -Math.PI / 2), r: 2.4, lieu: { dedans: false, c: [A.x, A.y + 3.2, A.z], hc: 3.2, mur: [mx, mz] } };
    }
    return null;
  },
  't3:4'(w) {
    const B = w.bld.eglise;
    if (!B || !B.f) return null;
    const f = B.f, y = f.y + 0.15, props = qtPropsDans(w, 'eglise', () => true);
    // contre le mur, entre la porte et le premier banc (les murs ont 0,5 m : la face intérieure est à 4,5 m de l'axe)
    for (const [lx, lz] of [[-4.12, -6.6], [-4.12, -5.6], [4.12, -5.6], [-4.12, -7.4], [4.12, -6.6]]) {
      const [x, z] = qtW(f, lx, lz);
      if (!qtSolDedans(w, x, y, z, 0.25, props)) continue;
      const [cx, cz] = qtW(f, 0, -1.5);
      return { p: [x, y + 0.45, z], dessin: 'toile_dos', rot: f.r + (lx < 0 ? Math.PI / 2 : -Math.PI / 2), r: 2.4, lieu: { dedans: true, bld: 'eglise', sol: y, c: [(x + cx) / 2, y + 1.0, (z + cz) / 2] } };
    }
    return null;
  },
  // ------------------------------------------------------------ 4. la crécelle
  'propose:t4'(w) {
    const B = w.bld.relais_chasse;
    if (!B || !B.f) return null;
    const props = qtProps(w, B.x, B.z, 16), o = B.out || qtW(B.f, 0, -B.D / 2 - 1);
    for (const [lx, lz] of [[2.3, -B.D / 2 - 1.6], [-2.3, -B.D / 2 - 1.6], [2.9, -B.D / 2 - 2.6], [-2.9, -B.D / 2 - 2.6], [3.6, -B.D / 2 - 1.2]]) {
      const [x, z] = qtW(B.f, lx, lz);
      if (!qtSol(w, x, z, 0.4, { props, ecart: 0.9 })) continue;
      const h = w.heightAt(x, z);
      return { p: [x, h + 0.48, z], dessin: 'souche', rot: Math.atan2(o[0] - x, o[1] - z), r: 2.4 };
    }
    return null;
  },
  't4:0'(w) {
    const q = qtPropsDans(w, 'relais_chasse', (q) => q.id === 'table')[0];
    if (!q) return null;
    return { p: [q.x, q.y + 0.8, q.z], dessin: 'registre', rot: q.r || 0, r: 2.4, lieu: { dedans: true, bld: 'relais_chasse', sol: q.y, c: [q.x, q.y + 0.8, q.z] } };
  },
  't4:1'(w) {
    const C = w.lm.cascade;
    if (!C) return null;
    const props = qtProps(w, C.x, C.z, 20), sec = qtInter(w, 'temple_entree');
    let best = null;
    for (const [x, z] of qtAnneaux(C.x, C.z, 5, 14, 0, 24)) {
      if (sec && Math.hypot(sec.x - x, sec.z - z) < 4.5) continue;
      if (!qtSol(w, x, z, 0.5, { props, eau: true, pente: 0.6 })) continue;
      const h = w.heightAt(x, z);
      const sc = -h * 0.6 - Math.abs(Math.hypot(x - C.x, z - C.z) - 8) * 0.3;  // le bas : le bassin
      if (!best || sc > best.sc) best = { x, z, h, sc };
    }
    if (!best) return null;
    const haut = C.y || best.h;   // (on regarde la chute à mi-hauteur, entre le haut et le bassin)
    return { p: [best.x, best.h + 0.1, best.z], dessin: 'pierre_traits', rot: Math.atan2(C.x - best.x, C.z - best.z), r: 2.4, lieu: { dedans: false, c: [C.x, (haut + best.h) / 2 + 1, C.z], hc: Math.max(2.5, (haut - best.h) / 2) } };
  },
  't4:2'(w) {
    const q = qtPropsDans(w, 'hutte_ermite', (q) => q.id === 'etagere')[0];
    if (!q) return null;
    const c = Math.cos(q.r || 0), s = Math.sin(q.r || 0), lx = 0.45, ly = 1.3, lz = 0.32;
    return { p: [q.x + lx * c + lz * s, q.y + ly, q.z - lx * s + lz * c], prop: q, dessin: 'bocal', r: 2.4, lieu: { dedans: true, bld: 'hutte_ermite', sol: q.y, c: [q.x + s * 0.3, q.y + 1.1, q.z + c * 0.3] } };
  },
  't4:3'(w) {
    const C = w.lm.chapelle;
    if (!C) return null;
    const tombes = qtProps(w, C.x, C.z, 22, (q) => q.id === 'tombe');
    const autres = qtProps(w, C.x, C.z, 22).concat((w.inter || []).filter((i) => Math.abs(i.x - C.x) < 22 && Math.abs(i.z - C.z) < 22 && i.kind !== 'pray'));
    const autel = qtProps(w, C.x, C.z, 10, (q) => q.id === 'autel')[0];
    const a0 = autel ? Math.atan2(autel.x - C.x, autel.z - C.z) : 0;
    let best = null;
    for (const [x, z, a] of qtAnneaux(C.x, C.z, 8, 14, a0, 24)) {
      if (!qtSol(w, x, z, 0.6, { props: autres, ecart: 1.0 })) continue;
      let pt = 1e9;
      for (const t of tombes) pt = Math.min(pt, Math.hypot(t.x - x, t.z - z));
      if (pt > 6) continue;                                                   // parmi les tombes
      const sc = -Math.abs(angDiff(a, a0)) * 1.5 - Math.abs(pt - 2.2) * 0.5;
      if (!best || sc > best.sc) best = { x, z, sc };
    }
    if (!best) return null;
    const h = w.heightAt(best.x, best.z);
    return { p: [best.x, h + 0.25, best.z], dessin: 'tertre', rot: Math.atan2(C.x - best.x, C.z - best.z), r: 2.5, cos: 0.6, lieu: { dedans: false, c: [C.x, (C.y || h) + 2.5, C.z], hc: 2.5 } };
  },
  // ------------------------------------------------------------ 5. la source froide
  't5:0'(w) {
    const B = w.bld.source_b, q = qtPropsDans(w, 'source_b', (q) => q.id === 'lit')[0];
    if (!B || !q) return null;
    // au pied du lit, côté pièce
    const [bx, bz] = qtL(B.f, q.x, q.z), [x, z] = qtW(B.f, bx + (bx < 0 ? 1.05 : -1.05), bz - 0.55);
    const y = q.y;
    return { p: [x, y + 0.3, z], dessin: 'caisse', rot: B.f.r, r: 2.3, lieu: { dedans: true, bld: 'source_b', sol: y, c: [x, y + 0.4, z] } };
  },
  't5:1'(w) {
    const C = w.lm.chene;
    if (!C) return null;
    // le tronc : le plus grand arbre au pied duquel on rêve
    let tr = null;
    const G = w.objectsGrid(), K = G.C;
    for (let gz = Math.floor((C.z - 14) / K); gz <= Math.floor((C.z + 14) / K); gz++) for (let gx = Math.floor((C.x - 14) / K); gx <= Math.floor((C.x + 14) / K); gx++) {
      const c = gx >= 0 && gz >= 0 && gx < G.gw && gz < G.gw ? G.cells[gz * G.gw + gx] : null;
      if (c) for (const i of c) { const o = w.objects[i], T = o && OBJ_TYPES[o.t]; if (T && !T.animal && w.live(o) && T.cat === 'Arbres' && (!tr || o.h > tr.h)) tr = o; }
    }
    const pri = qtInter(w, 'pri_chene');
    const x0 = tr ? tr.x : C.x, z0 = tr ? tr.z : C.z, rad = tr ? (objRadius(OBJ_TYPES[tr.t], tr) || 1.2) : 1.2;
    const vers = pri ? Math.atan2(pri.x - x0, pri.z - z0) + 0.9 : 0;
    const x = x0 + Math.sin(vers) * (rad + 0.05), z = z0 + Math.cos(vers) * (rad + 0.05), h = w.heightAt(x, z);
    return { p: [x, h + 1.45, z], dessin: 'gobelet', rot: vers, r: 2.6, cos: 0.6, lieu: { dedans: false, c: [x0, h + 4, z0], hc: 4 } };
  },
  't5:2'(w) {
    const q = qtPropsDans(w, 'maison_hameau_b', (q) => q.id === 'table')[0];
    if (!q) return null;
    const c = Math.cos(q.r || 0), s = Math.sin(q.r || 0), lx = 0.3, lz = 0.44;
    return { p: [q.x + lx * c + lz * s, q.y + 0.66, q.z - lx * s + lz * c], dessin: 'papier', rot: q.r || 0, prop: q, r: 2.4, lieu: { dedans: true, bld: 'maison_hameau_b', sol: q.y, c: [q.x, q.y + 0.7, q.z] } };
  },
  't5:3'(w) {
    const C = w.lm.source;
    if (!C) return null;
    const pri = qtInter(w, 'pri_source'), rub = qtProps(w, C.x, C.z, 6, (q) => q.id === 'rubans')[0];
    const ref = rub ? [rub.x, rub.z] : [C.x + 1, C.z];
    const a = Math.atan2(C.x - ref[0], C.z - ref[1]);
    const x = C.x + Math.sin(a) * 0.9, z = C.z + Math.cos(a) * 0.9, h = w.heightAt(x, z);
    return { p: [x, h + 0.15, z], dessin: 'reflet', rot: a, r: 2.4, cos: 0.6, lieu: { dedans: false, c: [C.x, h + 1.2, C.z], hc: 1.2, pri: pri ? [pri.x, pri.z] : null } };
  },
};
// un sol libre dans une ruine ou une maison (blocs au-dessus permis : un toit), ni dans un mur ni dans un meuble
function qtSolDedans(w, x, y, z, rad, props) {
  const L = qtBlocs(w, x, z, rad + 3);
  for (const b of L) {
    const [lx, lz] = World.blockLocal(b, x, z);
    if (Math.abs(lx) > b.sx / 2 + rad || Math.abs(lz) > b.sz / 2 + rad) continue;
    if (b.y + b.sy > y + 0.25 && b.y < y + 1.9) return false;                // un mur, une poutre tombée, un banc
  }
  if (props) for (const q of props) if (Math.abs(q.y - y) < 2 && Math.hypot(q.x - x, q.z - z) < rad + 0.55) return false;
  return true;
}

// ---------------------------------------------------------------- les quêtes
const quetes = {
  cache: null,           // { w, k: { 't1:0': lieu | null, … } } : les lieux de cette vallée
  aJouer: null,          // une scène à montrer dans un instant : { id, i, t }
  tickT: 0, crecelleT: 40, zoom: null,
  S() {
    const s = farm.s;
    if (!s) return null;
    let S = s.quetes;
    if (!S || typeof S !== 'object') S = s.quetes = { v: 1 };
    if (!S.Q || typeof S.Q !== 'object') S.Q = {};
    if (!S.av || typeof S.av !== 'object') S.av = {};
    if (!Array.isArray(S.courrier)) S.courrier = [];
    if (!S.mail || typeof S.mail !== 'object') S.mail = {};
    for (const id of QT_ORDRE) {
      let q = S.Q[id];
      if (!q || typeof q !== 'object') q = S.Q[id] = { st: '' };
      if (typeof q.st !== 'string') q.st = '';
      if (!Array.isArray(q.vu)) q.vu = [];
      if (!Array.isArray(q.tr)) q.tr = [];
      q.e = clamp(q.e | 0, 0, QT_QUETES[id].etapes.length - 1);
    }
    return S;
  },
  q(id) { const S = this.S(); return S && S.Q[id] ? S.Q[id] : null; },
  D(id) { return QT_QUETES[id] || null; },
  // ---------------------------------------------------------------- API
  liste() { return QT_ORDRE.map((id) => this.etat(id)).filter(Boolean); },
  etat(id) {
    const q = this.q(id), D = this.D(id);
    return q && D ? { id, titre: D.titre, st: q.st, etape: q.st === 'actif' ? q.e + 1 : 0, n: D.etapes.length, fin: q.fin || null, lieu: q.st === 'actif' ? D.etapes[q.e].nom : null } : null;
  },
  etape(id) { const q = this.q(id); return q && q.st === 'actif' ? q.e + 1 : 0; },
  // le lieu de l'étape i (1 à n) : { nom, x, z, dedans }
  lieu(id, i) {
    const D = this.D(id), E = D && D.etapes[(i | 0) - 1], L = E ? this.spec(id + ':' + ((i | 0) - 1)) : null;
    return E ? { nom: E.nom, dedans: !!E.dedans, x: L ? L.p[0] : null, z: L ? L.p[2] : null } : null;
  },
  // ---------------------------------------------------------------- les lieux de cette vallée
  spec(k) {
    const w = qtMonde();
    if (!w) return null;
    if (!this.cache || this.cache.w !== w) this.cache = { w, k: {} };
    const C = this.cache.k;
    if (!(k in C)) {
      let v = null;
      try { v = QT_LIEUX[k] ? QT_LIEUX[k](w) : null; } catch (e) { console.error('quetes : lieu ' + k, e); v = null; }
      C[k] = v;
    }
    return C[k];
  },
  // ---------------------------------------------------------------- proposer, accepter, refuser
  // la quête peut-elle être proposée maintenant ? (pas encore proposée, le bon jour, son habitant vivant)
  proposable(id) {
    const q = this.q(id), D = this.D(id), s = farm.s;
    if (!q || !D || q.st !== '' || !s || s.day < (D.des || 1)) return false;
    if (D.pnj && !npcs.alive(D.pnj)) return false;
    return true;
  },
  proposer(id) { const q = this.q(id); if (q && q.st === '') { q.st = 'propose'; q.jp = farm.s.day; } return q && q.st === 'propose'; },
  accepter(id) {
    const q = this.q(id), D = this.D(id);
    if (!q || !D || (q.st !== '' && q.st !== 'propose')) return false;
    if (D.pnj && !npcs.alive(D.pnj)) return false;
    q.st = 'actif'; q.e = 0; q.j0 = farm.s.day; if (!q.jp) q.jp = farm.s.day;
    if (id === 't4' && !farm.count('t_crecelle')) farm.give('t_crecelle', 1);
    sound.quest && sound.quest(false);
    this.montrer(id, 0, 1.2);
    return true;
  },
  plusTard(id) { const q = this.q(id); if (q && (q.st === '' || q.st === 'propose')) { q.st = 'propose'; if (!q.jp) q.jp = farm.s.day; } },
  jamais(id) { const q = this.q(id); if (q && (q.st === '' || q.st === 'propose')) { q.st = 'jamais'; q.jf = farm.s.day; } },
  abandonner(id) { const q = this.q(id); if (q && q.st === 'actif') { q.st = 'abandon'; q.ja = farm.s.day; if (this.aJouer && this.aJouer.id === id) this.aJouer = null; return true; } return false; },
  reprendre(id) {
    const q = this.q(id), D = this.D(id);
    if (!q || q.st !== 'abandon' || (D.pnj && !npcs.alive(D.pnj))) return false;
    q.st = 'actif';
    this.montrer(id, q.e, 0.6);
    return true;
  },
  // revoir la scène d'une étape déjà montrée (i : 1 à n)
  revoir(id, i) {
    const q = this.q(id), D = this.D(id);
    if (!q || !D || cine.on || !qtMonde()) return false;
    const k = (i | 0) - 1, max = q.st === 'fini' ? D.etapes.length - 1 : q.e;
    if (k < 0 || k > max || (q.st !== 'actif' && q.st !== 'fini' && q.st !== 'abandon')) return false;
    if (!this.spec(id + ':' + k)) return false;
    qtScenes.etape(id, k, false);
    return true;
  },
  // une scène à montrer quand on aura les mains libres
  montrer(id, i, t) { this.aJouer = { id, i, t: t || 1 }; },
  peutMontrer() {
    if (cine.on || ui.panel || game.sleeping || game.dying || game.mode !== 'play' || !qtMonde()) return false;
    const p = game.player;
    if (p.underground || (typeof strange !== 'undefined' && strange.inEnvers && strange.inEnvers())) return false;
    if (typeof mondes !== 'undefined' && mondes.actuel && mondes.actuel()) return false;
    const f = typeof document !== 'undefined' && document.getElementById('fade');
    return !(f && f.classList.contains('open'));
  },

  // ---------------------------------------------------------------- les étapes
  heureOk(E) { if (!E || !E.quand) return true; const h = npcs.hour(); return QT_HEURES[E.quand] ? QT_HEURES[E.quand](h) : true; },
  // on a trouvé ce qu'il y avait à trouver à l'étape en cours
  trouver(id) {
    const q = this.q(id), D = this.D(id);
    if (!q || !D || q.st !== 'actif' || cine.on) return false;
    const i = q.e, E = D.etapes[i];
    if (!this.heureOk(E)) { this.pasMaintenant(id, E); return false; }
    if (i >= D.etapes.length - 1) { this.finale(id); return true; }
    q.tr[i] = farm.s.day;
    this.recompenseEtape(id, i);
    const T = E.trouve, apres = () => { q.e = i + 1; this.montrer(id, i + 1, T && typeof T === 'object' ? 0.4 : 2.6); };
    if (T && typeof T === 'object') {
      sound.page && sound.page();
      ui.read(T.titre, T.registre ? D.registre : T.texte, T.signe || '');
      apres();
    } else {
      if (T) ui.subtitle('', T, 6);
      sound.quest && sound.quest(false);
      apres();
    }
    if (E.dit && D.etapes[i] && id === 't4') { const n = npcs.byId.guerisseuse; if (n && n.st.alive && Math.hypot(n.x - game.player.pos[0], n.z - game.player.pos[2]) < 8) setTimeout(() => { try { npcs.say(n, E.dit, 4); } catch (e) { /* rien */ } }, 2200); }
    return true;
  },
  pasMaintenant(id, E) {
    if (id === 't5') { ui.subtitle('', QT_QUETES.t5.fin.tiede, 4); return; }
    ui.subtitle('', E.quand === 'nuit' ? '(Pas à cette heure-ci. La nuit.)' : '(Pas à cette heure-ci.)', 3);
  },
  // ce qu'on garde d'une étape (un objet trouvé là)
  recompenseEtape(id, i) {
    const S0 = this.spec(id + ':' + i), at = S0 ? [S0.p[0], S0.p[1] + 0.2, S0.p[2]] : null;
    const donne = (it) => { farm.give(it, 1); if (at && typeof play !== 'undefined' && play.flyer) try { play.flyer(it, at, 1); } catch (e) { console.error(e); } };
    if (id === 't1' && i === 1 && !farm.count('t_plaque_roulier')) donne('t_plaque_roulier');
    if (id === 't1' && i === 2 && !farm.count('t_lettre_leonie')) donne('t_lettre_leonie');
    if (id === 't5' && i === 0 && !farm.count('t_registre_menard')) donne('t_registre_menard');
  },
  // ---------------------------------------------------------------- la fin
  finale(id) {
    const q = this.q(id), D = this.D(id), F = D.fin;
    if (!q || q.st !== 'actif') return;
    const choix = F.choix.filter((c) => !c.pnj || npcs.alive(c.pnj));
    const ouvrir = () => ui.choice(F.titre, F.desc, choix.map((c) => ({ label: c.label, fn: () => { ui.close(); this.finir(id, c.k); } })).concat([{ label: 'Plus tard', fn: () => ui.close() }]));
    if (F.lecture) { sound.page && sound.page(); ui.read(F.lecture.titre, F.lecture.texte, ''); const b = document.querySelector('#reader .close'); if (b) b.onclick = () => { ui.close(); setTimeout(ouvrir, 80); }; return; }
    ouvrir();
  },
  finir(id, k) {
    const q = this.q(id), D = this.D(id), s = farm.s;
    if (!q || q.st !== 'actif') return;
    const C = D.fin.choix.find((c) => c.k === k);
    if (!C) return;
    q.st = 'fini'; q.fin = k; q.jf = s.day; q.tr[D.etapes.length - 1] = s.day;
    sound.quest && sound.quest(true);
    try { this.recompense(id, k); } catch (e) { console.error(e); }
    if (C.lettre) S_qtCourrier(this.S(), { j: s.day + (id === 't3' ? 2 : 1), de: C.lettre.de, titre: C.lettre.titre, texte: C.lettre.texte, q: id, k });
    // un dernier plan du lieu, la fin choisie ; puis ce qui suit (sans scène : les deux en sous-titres)
    const suite = () => { if (C.apres && !game.dying) ui.subtitle('', C.apres, 8); };
    let pr = null;
    try { pr = qtScenes.epilogue(id, k); } catch (e) { console.error(e); pr = null; }
    if (pr) pr.then(() => setTimeout(suite, 400));
    else { ui.subtitle('', C.texte, 7); setTimeout(suite, 7300); }
  },
  // les récompenses (l'argent, les objets, les recettes, les avantages : à la mesure de chaque histoire)
  recompense(id, k) {
    const S = this.S(), av = S.av;
    const esp = (d, r) => { try { esprit.changer(d, r, Math.abs(d) + 1); } catch (e) { /* rien */ } };
    const paie = (n) => { if (n > 0) { farm.earn(n); sound.coin && sound.coin(); } };
    const ami = (pnj, k2) => { const n = npcs.byId[pnj]; if (n && n.st.alive) npcs.addAmitie(n, k2); };
    if (id === 't1') {
      ami('aubergiste', 60);
      if (k === 'a') { paie(180); av.auberge = farm.s.day; farm.take('t_lettre_leonie', 1); farm.take('t_plaque_roulier', 1); esp(2, 'la chambre sept'); }
      else { paie(120); esp(1, 'la chambre sept'); }
    } else if (id === 't2') {
      if (k === 'a') { av.pharEteint = farm.s.day; esp(2, 'le feu du lac'); }
      else { av.pharAllume = farm.s.day; esp(1, 'le feu du lac'); }
    } else if (id === 't3') {
      if (k === 'b') { if (npcs.alive('cure')) { paie(60); ami('cure', 40); } esp(1, 'les toiles'); }
      else esp(-1, 'les toiles');
    } else if (id === 't4') {
      farm.take('t_crecelle', 1);
      if (k === 'a') {
        paie(150); ami('chasseur', 90);
        const connue = savoir.recetteConnue('appeau') || !RECIPES.some((r) => r.out === 'appeau');
        if (!connue) { savoir.apprendreRecette('appeau', 'quete'); setTimeout(() => ui.subtitle('', `(Nouvelle recette : ${itemName('appeau')}.)`, 3.5), 15000); }
        else if (ITEMS.appeau) farm.give('appeau', 1);
        esp(2, 'la crécelle');
      } else { av.crecelle = farm.s.day; if (ITEMS.appeau) S_qtCourrier(S, { j: farm.s.day + 1, objet: 'appeau', q: id, k }); esp(2, 'la crécelle'); }
    } else if (id === 't5') {
      if (ITEMS.montre) farm.give('montre', 1);
      if (k === 'a') { paie(100); ami('naturiste_b', 80); av.sourceAube = farm.s.day; farm.take('t_registre_menard', 1); esp(1, 'la source froide'); }
      else {
        const p = game.player;
        p.hp = 100; try { corps.panser(); corps.soignerJambe(true); } catch (e) { /* rien */ }
        av.oubli = farm.s.day; esp(-1, 'la source froide');
      }
    }
    farm.s.rep && (farm.s.rep.hero = (farm.s.rep.hero || 0) + 1);
  },

  // ---------------------------------------------------------------- les propositions qui viennent seules (la lettre)
  tick() {
    const S = this.S(), s = farm.s;
    if (!S || !s) return;
    // la lettre de Marie Lemarié, une fois (même dans une partie déjà avancée)
    const q2 = S.Q.t2;
    if (q2.st === '' && !S.mail.t2 && s.day >= QT_QUETES.t2.des && qtMonde()) {
      const P = QT_QUETES.t2.propose;
      farm.mail(P.de, P.titreLettre, P.texte, { tq: 't2' });
      S.mail.t2 = s.day; this.proposer('t2');
    }
    // le courrier qui suit une fin (les réponses, ce qu'on vous envoie)
    for (const c of S.courrier) {
      if (c.fait || s.day < c.j) continue;
      c.fait = s.day;
      if (c.texte) farm.mail(c.de, c.titre, c.texte, { tq: c.q, tqFin: c.k });
      try { this.envoi(c); } catch (e) { console.error(e); }
    }
    // l'habitant qui proposait est mort : la quête est perdue
    for (const id of QT_ORDRE) {
      const q = S.Q[id], D = QT_QUETES[id];
      if (D.pnj && (q.st === 'propose' || q.st === 'actif' || q.st === 'abandon') && !npcs.alive(D.pnj)) { q.st = 'perdue'; q.jf = s.day; if (this.aJouer && this.aJouer.id === id) this.aJouer = null; }
    }
  },
  // ce qui arrive avec une lettre
  envoi(c) {
    if (c.q === 't2' && c.k === 'a') { if (!farm.count('t_longue_vue')) farm.give('t_longue_vue', 1); }
    else if (c.q === 't2' && c.k === 'b') farm.earn(160);
    else if (c.q === 't3' && c.k === 'a') farm.earn(200);
    else if (c.q === 't4' && c.objet && ITEMS[c.objet]) { farm.give(c.objet, 1); if (qtMonde()) ui.subtitle('', '(Sur la souche devant le relais, ce matin, il y avait un appeau taillé dans un os. Il est à vous.)', 5); }
  },
  update(dt) {
    if (!farm.s || game.mode !== 'play' || game.dying || game.kind !== 'farm') return;
    const A = this.aJouer;
    if (A) {
      A.t -= dt;
      if (A.t <= 0 && this.peutMontrer()) {
        this.aJouer = null;
        const q = this.q(A.id);
        if (q && q.st === 'actif' && q.e === A.i) { q.vu[A.i] = farm.s.day; qtScenes.etape(A.id, A.i, true); }
      }
    }
    this.zoomMaj(dt);
    this.tickT -= dt;
    if (this.tickT > 0) return;
    this.tickT = 1;
    this.tick();
    this.crecelleSon(1);
  },
  // le soir, du côté du relais, une crécelle qu'on fait tourner dans le bois (tant que Bastien n'a pas la sienne)
  crecelleSon(dt) {
    const S = this.S(), q = S && S.Q.t4, w = qtMonde();
    if (!q || !w || S.av.crecelle || q.st === 'jamais' || (q.st === 'fini' && q.fin === 'b') || farm.s.day < 2) return;
    const h = npcs.hour();
    if (h < 18.5 || h > 21.5) return;
    this.crecelleT -= dt;
    if (this.crecelleT > 0) return;
    this.crecelleT = 70 + Math.random() * 110;
    const B = w.bld.relais_chasse, p = game.player;
    if (!B || p.underground) return;
    const d = Math.hypot(B.x - p.pos[0], B.z - p.pos[2]);
    if (d > 140 || d < 12) return;
    const a = Math.random() * TAU, src = [B.x + Math.sin(a) * 40, p.pos[1] + 1, B.z + Math.cos(a) * 40];
    if (sound.ici && sound.tCrecelle) sound.ici(src, () => sound.tCrecelle(0.7), { att: 'phys', ref: 14 });
  },

  // ---------------------------------------------------------------- ce qu'on voit, ce qu'on vise
  // les endroits « vivants » maintenant : [{ cle, id, i, L, propose }]
  actifs() {
    const S = this.S(), out = [];
    if (!S) return out;
    for (const id of QT_ORDRE) {
      const q = S.Q[id];
      if (q.st === 'actif') { const L = this.spec(id + ':' + q.e); if (L) out.push({ cle: id + ':' + q.e, id, i: q.e, L }); }
    }
    // la crécelle, devant le relais, tant qu'on ne l'a ni prise ni laissée pour de bon
    const q4 = S.Q.t4;
    if ((q4.st === '' || q4.st === 'propose') && farm.s.day >= QT_QUETES.t4.des) { const L = this.spec('propose:t4'); if (L) out.push({ cle: 'propose:t4', id: 't4', i: -1, L, propose: true }); }
    // le tertre de Bastien, une fois la quête finie : il reste là (et sa crécelle, si on l'y a plantée)
    if (q4.st === 'fini') { const L = this.spec('t4:3'); if (L) out.push({ cle: 't4:3', id: 't4', i: 3, L, reste: true }); }
    return out;
  },
  target(eye, f, cand) {
    if (!farm.s || cine.on || !qtMonde()) return;
    if (typeof strange !== 'undefined' && strange.inEnvers && strange.inEnvers()) return;
    for (const A of this.actifs()) {
      const L = A.L;
      if (A.reste || L.inter) continue;                     // (le lit de la sept, le registre, la lanterne : leurs propres interactions)
      const dx = L.p[0] - eye[0], dy = L.p[1] - eye[1], dz = L.p[2] - eye[2], d = Math.hypot(dx, dy, dz);
      if (d > (L.r || QT_REACH)) continue;
      const cos = (dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1);
      if (cos < (L.cos || 0.72)) continue;
      // (bien visé, il passe devant les meubles et les interactions d'à côté ; de biais, non)
      cand({ kind: 'hook', tq: A.cle, prop: L.prop || null, use: () => (A.propose ? this.trouverCrecelle() : this.trouver(A.id)) }, Math.max(0.01, cos > 0.92 ? d * 0.45 : d - 0.3));
    }
    // l'avantage de la source froide : à l'aube, les pieds dans l'eau
    const S = this.S();
    if (S && S.av.sourceAube && QT_HEURES.aube(npcs.hour())) {
      const L = this.spec('t5:3');
      if (L) {
        const dx = L.p[0] - eye[0], dy = L.p[1] - eye[1], dz = L.p[2] - eye[2], d = Math.hypot(dx, dy, dz);
        if (d < 2.6 && (dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1) > 0.6) cand({ kind: 'hook', tq: 'source', use: () => this.sourceAube() }, Math.max(0.01, d - 0.3));
      }
    }
  },
  // la crécelle trouvée devant le relais : on la regarde, et l'on choisit
  trouverCrecelle() {
    const P = QT_QUETES.t4.propose;
    this.proposer('t4');
    qtProposition('t4', P.titre, P.texte, '');
  },
  // à l'aube, les pieds dans l'eau de la source : une plaie se ferme (une fois par jour)
  sourceAube() {
    const S = this.S(), s = farm.s, p = game.player;
    if (S.av.sourceJ === s.day) { ui.subtitle('', '(L’eau est froide. Elle ne fera rien de plus aujourd’hui.)', 3); return; }
    S.av.sourceJ = s.day;
    p.hp = Math.min(100, p.hp + 35);
    let t = '(L’eau est si froide qu’on ne sent plus ses pieds. Quand vous ressortez, quelque chose s’est refermé.)';
    try { if (corps.panser()) t = '(L’eau est si froide qu’on ne sent plus ses pieds. La plaie a cessé de saigner.)'; if (corps.jambeCassee()) corps.soignerJambe(false); } catch (e) { /* rien */ }
    sound.splash && sound.splash(0.3);
    ui.subtitle('', t, 5);
  },
  // l'indice luit à peine quand on le regarde de près
  lueur(L, cle, t) {
    const tg = game.target;
    if (tg && tg.tq === cle) return FX_HI;
    const e = game.player.eyePos(), dx = L.p[0] - e[0], dz = L.p[2] - e[2], d = Math.hypot(dx, dz);
    if (d > 4.5 || d < 0.4) return 0;
    const fw = cinAvant();
    if ((dx * fw[0] + dz * fw[2]) / d < 0.8) return 0;
    return (t % 1.9) < 0.14 ? FX_HI : 0;
  },
  draw(buf, sbuf, cam, t) {
    const w = qtMonde();
    if (!farm.s || !w || (typeof strange !== 'undefined' && strange.inEnvers && strange.inEnvers())) return;
    PE.buf = buf; PE.fl = 0;
    for (const A of this.actifs()) {
      const L = A.L;
      if (!L.dessin || Math.hypot(L.p[0] - cam[0], L.p[2] - cam[2]) > 70) continue;
      PE.fl = A.reste || cine.on ? 0 : this.lueur(L, A.cle, t);
      try { qtDessiner(w, L, A); } catch (e) { console.error(e); this.cache.k[A.cle] = null; }
      PE.fl = 0;
    }
  },
  // un objet posé déjà là (les souliers, le casier, le drap) : il luit quand on le vise
  hiProp() { const t = game.target; if (t && t.kind === 'hook' && t.tq && t.prop) game.hiProp = t.prop; },

  // ---------------------------------------------------------------- la longue-vue d'Aristide (en main, clic droit)
  zoomBasculer() {
    const p = game.player;
    if (this.zoom) { this.zoomFin(); return; }
    this.zoom = { k: 1, pos: [p.pos[0], p.pos[2]], t: 0 };
    sound.equip && sound.equip();
  },
  zoomFin() { if (!this.zoom) return; this.zoom = null; game.fovK = 1; },
  zoomMaj(dt) {
    const Z = this.zoom, p = game.player;
    if (!Z) return;
    if (farm.s.hand !== 't_longue_vue' || Math.hypot(p.pos[0] - Z.pos[0], p.pos[2] - Z.pos[1]) > 0.35 || game.sleeping || ui.panel || cine.on || Z.t > 40) { this.zoomFin(); return; }
    Z.t += dt;
    Z.k = lerp(Z.k, 0.24, Math.min(1, dt * 6));
    game.fovK = Z.k;
  },

  // ---------------------------------------------------------------- les papiers qu'on relit en main
  relire(id) {
    if (id === 't_lettre_leonie') { const T = QT_QUETES.t1.etapes[2].trouve; ui.read(T.titre, T.texte, T.signe); return true; }
    if (id === 't_registre_menard') { ui.read('Le registre du docteur Ménard', QT_QUETES.t5.registre, 'Les dernières pages sont blanches.'); return true; }
    return false;
  },
  // ---------------------------------------------------------------- essais
  etatComplet() { const S = this.S(); return S ? JSON.parse(JSON.stringify(S)) : null; },
};
function S_qtCourrier(S, c) { if (S && Array.isArray(S.courrier)) S.courrier.push(c); }

// ---------------------------------------------------------------- une proposition (lettre, avis, objet) : le texte, et trois boutons
function qtProposition(id, titre, texte, signe) {
  const D = QT_QUETES[id], P = D.propose, q = quetes.q(id);
  ui.read(titre, texte, signe || '');
  if (!q || (q.st !== '' && q.st !== 'propose')) return;
  qtBoutons(id, P);
}
// trois boutons sous un texte déjà ouvert (#reader)
function qtBoutons(id, P) {
  const el = document.querySelector('#reader');
  if (!el || el.querySelector('.t-choix')) return;
  qtStyle();
  const d = document.createElement('div');
  d.className = 't-choix';
  d.innerHTML = `<button data-tq="oui">${esc(P.oui)}</button><button data-tq="tard">${esc(P.plusTard)}</button><button data-tq="non">${esc(P.non)}</button>`;
  const fermer = el.querySelector('.close');
  if (fermer) el.insertBefore(d, fermer); else el.appendChild(d);
  d.querySelector('[data-tq="oui"]').onclick = () => { ui.close(); quetes.accepter(id); };
  d.querySelector('[data-tq="tard"]').onclick = () => { quetes.plusTard(id); ui.close(); ui.subtitle('', '(Vous gardez cela pour plus tard. C’est noté au carnet.)', 3); };
  d.querySelector('[data-tq="non"]').onclick = () => { quetes.jamais(id); ui.close(); };
}
function qtStyle() {
  if (typeof document === 'undefined' || document.getElementById('t-quetes-css')) return;
  const st = document.createElement('style');
  st.id = 't-quetes-css';
  st.textContent = `#reader .t-choix{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0 6px}
#reader .t-choix button{flex:1 1 auto;padding:5px 10px;background:rgba(122,74,26,.14);border:1px solid rgba(122,74,26,.45);border-radius:3px;color:#4a2e14;font:inherit;font-size:14px;cursor:pointer}
#reader .t-choix button:hover{background:rgba(255,240,200,.8)}`;
  document.head.appendChild(st);
}

// ---------------------------------------------------------------- les objets dessinés (repère de PE déjà posé)
function qtDessiner(w, L, A) {
  const p = L.p, r = L.rot || 0, sol = (x, z, y) => w.groundAt(x, z, y + 0.6, 0.9);
  const brun = rgbf('#5a4430'), gris = rgbf('#8a8a84'), noir = [0.05, 0.04, 0.035];
  switch (L.dessin) {
    case 'pas': { // des pas d'homme, ferrés, qui sortent de l'eau ; et la plaque, à moitié dans la vase
      const c = Math.cos(r), s = Math.sin(r), boue = rgbf('#4e4a40'), trace = rgbf('#2a2620');
      for (let k = 0; k < 7; k++) {
        const lz = -1.6 + k * 0.62, lx = (k % 2 ? 0.13 : -0.13);
        const x = p[0] + lx * c + lz * s, z = p[2] - lx * s + lz * c;
        PE.frame(x, sol(x, z, p[1]), z, r + (k % 2 ? 0.08 : -0.08), 1);
        PE.box(0, 0.006, 0, 0.16, 0.012, 0.3, boue, TL.soilWet);
        PE.box(0, 0.013, 0.05, 0.11, 0.006, 0.12, trace, TL.plain);
        PE.box(0, 0.013, -0.09, 0.09, 0.006, 0.08, trace, TL.plain);
        for (let d = 0; d < 3; d++) PE.box((d - 1) * 0.035, 0.016, 0.115, 0.018, 0.006, 0.018, gris, TL.metal);
      }
      if (!farm.count('t_plaque_roulier') && !(quetes.q('t1').tr[1])) {
        PE.frame(p[0] + s * 0.5, sol(p[0] + s * 0.5, p[2] + c * 0.5, p[1]) + 0.02, p[2] + c * 0.5, r + 0.7, 1);
        PE.box(0, 0.01, 0, 0.22, 0.012, 0.09, rgbf('#a8aab0'), TL.metal, 0, 0.25);
      }
      break;
    }
    case 'enveloppe': // une enveloppe qui dépasse d'une case du casier
      PE.frame(p[0], p[1], p[2], (A.L.prop && A.L.prop.r) || 0, 1);
      PE.box(0, 0, 0.02, 0.15, 0.1, 0.012, rgbf('#e6dcc4'), TL.paper, 0.06, 0, 0.12);
      PE.box(0.01, -0.01, 0.03, 0.025, 0.025, 0.006, rgbf('#8a1a14'), TL.plain);
      break;
    case 'croix': { // une petite croix de bois contre le mur, sans tombe ; un bol retourné à ses pieds
      const y = sol(p[0], p[2], p[1]);
      PE.frame(p[0], y, p[2], r, 1);
      PE.box(0, 0.36, 0, 0.05, 0.72, 0.05, rgbf('#6a5a44'), TL.darkwood, 0, 0, 0.05);
      PE.box(0, 0.5, 0, 0.36, 0.05, 0.05, rgbf('#6a5a44'), TL.darkwood, 0, 0, 0.05);
      PE.box(0.08, 0.04, 0.22, 0.13, 0.07, 0.13, rgbf('#c8bca4'), TL.plain);
      PE.box(0.08, 0.075, 0.22, 0.06, 0.012, 0.06, rgbf('#b0a48c'), TL.plain);
      break;
    }
    case 'barque': { // une barque retournée sur la grève, le nom presque effacé
      const y = sol(p[0], p[2], p[1]);
      PE.frame(p[0], y, p[2], r, 1);
      PE.box(0, 0.2, 0, 1.0, 0.4, 3.0, rgbf('#5a4a3a'), TL.darkwood);
      PE.box(0, 0.44, 0, 0.6, 0.1, 2.8, rgbf('#4a3e30'), TL.darkwood);
      PE.box(0, 0.25, 1.52, 0.6, 0.3, 0.08, rgbf('#5a4a3a'), TL.darkwood);
      PE.box(0.51, 0.24, 0.4, 0.01, 0.1, 0.6, rgbf('#c8c0b0'), TL.plain);
      PE.box(-0.3, 0.05, -1.4, 0.05, 0.05, 0.6, rgbf('#6a3a24'), TL.metal);
      PE.box(0.7, 0.04, 0.3, 0.08, 0.06, 2.4, rgbf('#7a6a52'), TL.wood, 0.05);
      break;
    }
    case 'bottes': { // une paire de bottes au bout du quai, la pointe vers le lac
      const y = w.groundAt(p[0], p[2], p[1] + 0.3, 0.6);
      PE.frame(p[0], y, p[2], r, 1);
      for (const sx of [-0.11, 0.11]) {
        PE.box(sx, 0.2, -0.03, 0.1, 0.4, 0.12, rgbf('#2a2420'), TL.leather);
        PE.box(sx, 0.04, 0.06, 0.1, 0.08, 0.24, rgbf('#2a2420'), TL.leather);
        PE.box(sx, 0.39, -0.03, 0.12, 0.03, 0.14, rgbf('#3a3028'), TL.leather);
      }
      PE.box(0, 0.006, 0.02, 0.5, 0.008, 0.45, rgbf('#1e2428'), TL.plain);
      break;
    }
    case 'chevalet': { // trois trous en triangle, un tube écrasé
      const c = Math.cos(r), s = Math.sin(r);
      for (const [lx, lz] of [[-0.35, -0.25], [0.35, -0.25], [0, 0.35]]) {
        const x = p[0] + lx * c + lz * s, z = p[2] - lx * s + lz * c;
        PE.frame(x, sol(x, z, p[1]), z, r, 1);
        PE.box(0, 0.006, 0, 0.07, 0.012, 0.07, noir, TL.plain);
        PE.box(0, 0.012, 0, 0.11, 0.008, 0.11, brun, TL.soil);
      }
      PE.frame(p[0] + s * 0.15, sol(p[0], p[2], p[1]) + 0.01, p[2] + c * 0.15, r + 0.5, 1);
      PE.box(0, 0.012, 0, 0.1, 0.018, 0.035, rgbf('#d8dce0'), TL.metal, 0, 0, 0.1);
      PE.box(0.065, 0.012, 0, 0.03, 0.016, 0.02, rgbf('#f2f2ee'), TL.plain);
      break;
    }
    case 'pierre': { // une pierre déplacée au pied du mur, un coin de carnet dessous
      PE.frame(p[0], p[1] - 0.2, p[2], r, 1);
      PE.box(0, 0.12, 0, 0.5, 0.24, 0.36, rgbf('#7a7a6c'), TL.stone, 0.3, 0, 0.18);
      PE.box(0.3, 0.02, 0.12, 0.2, 0.03, 0.26, rgbf('#5a4a36'), TL.leather, -0.4);
      PE.box(0.3, 0.038, 0.12, 0.18, 0.006, 0.24, rgbf('#d8cfb8'), TL.paper, -0.4);
      PE.box(-0.1, 0.004, -0.32, 0.5, 0.008, 0.32, rgbf('#3e3a30'), TL.soil);
      break;
    }
    case 'toile_dos': { // une toile retournée contre le mur : le châssis, la toile grise
      PE.frame(p[0], p[1] - 0.45, p[2], r, 1);
      PE.box(0, 0.45, -0.04, 0.95, 0.75, 0.02, rgbf('#a89e8a'), TL.cloth, 0, 0.12);
      for (const sx of [-0.45, 0.45]) PE.box(sx, 0.45, 0.0, 0.05, 0.78, 0.04, rgbf('#7a6044'), TL.wood, 0, 0.12);
      for (const sy of [0.1, 0.8]) PE.box(0, sy, 0.02 - (sy - 0.45) * 0.12, 0.95, 0.05, 0.04, rgbf('#7a6044'), TL.wood, 0, 0.12);
      PE.box(0, 0.45, 0.01, 0.04, 0.72, 0.03, rgbf('#7a6044'), TL.wood, 0, 0.12);
      break;
    }
    case 'souche': { // une souche devant le relais ; la crécelle posée dessus
      const y = sol(p[0], p[2], p[1]);
      PE.frame(p[0], y, p[2], r, 1);
      PE.box(0, 0.2, 0, 0.42, 0.4, 0.42, rgbf('#6a5440'), TL.bark);
      PE.box(0, 0.4, 0, 0.36, 0.02, 0.36, rgbf('#b49a74'), TL.wood);
      PE.box(0.02, 0.45, 0.02, 0.05, 0.06, 0.22, rgbf('#7a7266'), TL.wood, 0.4);
      PE.box(-0.04, 0.47, -0.08, 0.13, 0.11, 0.05, rgbf('#8a8274'), TL.wood, 0.4);
      PE.box(-0.04, 0.47, -0.08, 0.1, 0.1, 0.07, rgbf('#6a6256'), TL.wood, 0.4 + Math.PI / 4);
      break;
    }
    case 'registre': // un registre ouvert sur la table
      PE.frame(p[0], p[1] - 0.03, p[2], r + 0.3, 1);
      PE.box(0, 0.01, 0, 0.46, 0.02, 0.32, rgbf('#4a3a2a'), TL.leather);
      PE.box(-0.11, 0.026, 0, 0.21, 0.012, 0.29, rgbf('#e0d6be'), TL.paper, 0, 0, 0.04);
      PE.box(0.11, 0.026, 0, 0.21, 0.012, 0.29, rgbf('#e0d6be'), TL.paper, 0, 0, -0.04);
      break;
    case 'pierre_traits': { // une pierre plate au bord du bassin, neuf traits, le dernier barré
      const y = sol(p[0], p[2], p[1]);
      PE.frame(p[0], y, p[2], r, 1);
      PE.box(0, 0.06, 0, 0.8, 0.12, 0.5, rgbf('#8a8a80'), TL.stone);
      for (let k = 0; k < 9; k++) PE.box(-0.28 + k * 0.07, 0.122, 0, 0.012, 0.004, 0.22, noir, TL.plain);
      PE.box(0.28, 0.124, 0, 0.012, 0.004, 0.3, noir, TL.plain, 0.9);
      break;
    }
    case 'bocal': // un petit bocal, tout au fond de l'étagère, fermé à la cire
      PE.frame(p[0], p[1] - 0.05, p[2], (A.L.prop && A.L.prop.r) || 0, 1);
      PE.box(0, 0.06, 0, 0.09, 0.12, 0.09, rgbf('#a8b8a8'), TL.glass);
      PE.box(0, 0.125, 0, 0.1, 0.02, 0.1, rgbf('#8a1a14'), TL.plain);
      PE.box(0, 0.02, 0, 0.04, 0.02, 0.04, noir, TL.plain);
      break;
    case 'tertre': { // un tertre bas, un bâton de noisetier planté ; la crécelle à côté, si on l'y a laissée
      const y = sol(p[0], p[2], p[1]);
      PE.frame(p[0], y, p[2], r, 1);
      PE.box(0, 0.06, 0, 0.7, 0.14, 1.3, rgbf('#6a5438'), TL.soil);
      PE.box(0, 0.14, 0, 0.5, 0.08, 1.0, rgbf('#5e4a32'), TL.soil);
      PE.box(0, 0.55, -0.6, 0.035, 1.0, 0.035, rgbf('#8a7a5e'), TL.wood, 0, 0.05);
      const q4 = quetes.q('t4');
      if (q4 && q4.st === 'fini' && q4.fin === 'b') { PE.box(0.18, 0.3, -0.52, 0.04, 0.5, 0.04, rgbf('#7a7266'), TL.wood, 0, -0.1); PE.box(0.18, 0.58, -0.52, 0.13, 0.11, 0.05, rgbf('#8a8274'), TL.wood, 0.3); }
      break;
    }
    case 'caisse': // une caisse de bois clouée, sous le pied du lit
      PE.frame(p[0], p[1] - 0.3, p[2], r, 1);
      PE.box(0, 0.16, 0, 0.62, 0.32, 0.4, rgbf('#8a6a44'), TL.wood);
      PE.box(0, 0.325, 0, 0.64, 0.02, 0.42, rgbf('#6a5034'), TL.darkwood);
      for (const sx of [-0.25, 0.25]) PE.box(sx, 0.335, 0, 0.02, 0.006, 0.02, gris, TL.metal);
      break;
    case 'gobelet': { // un clou dans l'écorce, un gobelet d'étain pendu au clou
      PE.frame(p[0], p[1], p[2], r, 1);
      PE.box(0, 0.06, 0.02, 0.012, 0.012, 0.09, rgbf('#4a4a4e'), TL.iron);
      PE.box(0, -0.02, 0.07, 0.085, 0.11, 0.085, rgbf('#a0a4a8'), TL.metal);
      PE.box(0, 0.03, 0.035, 0.012, 0.05, 0.02, rgbf('#a0a4a8'), TL.metal);
      break;
    }
    case 'papier': // un papier plié qui dépasse du tiroir de la table
      PE.frame(p[0], p[1], p[2], r, 1);
      PE.box(0, 0, 0.03, 0.14, 0.012, 0.1, rgbf('#e4dac4'), TL.paper, 0.2);
      break;
    case 'reflet': { // au fond de l'eau, entre deux pierres, quelque chose qui brille (la montre de Ménard)
      const q5 = quetes.q('t5');
      if (q5 && q5.st === 'fini') break;
      const y = sol(p[0], p[2], p[1]);
      PE.frame(p[0], y, p[2], r, 1);
      PE.box(-0.12, 0.05, 0, 0.18, 0.1, 0.14, rgbf('#6a6a62'), TL.stone, 0.3);
      PE.box(0.12, 0.05, 0.02, 0.16, 0.1, 0.12, rgbf('#6a6a62'), TL.stone, -0.4);
      PE.box(0, 0.03, 0, 0.07, 0.015, 0.07, rgbf('#d8c070'), TL.gold);
      break;
    }
  }
}

// ---------------------------------------------------------------- points d'accroche
// les réponses des habitants qui proposent (l'aubergiste, le docteur des Sources)
{
  const _opt = talk.options.bind(talk);
  talk.options = function () {
    const opts = _opt();
    try {
      const n = this.n;
      if (n && farm.s && qtMonde()) for (const id of QT_ORDRE) {
        const D = QT_QUETES[id];
        if (D.qui !== 'pnj' || D.pnj !== n.d.id) continue;
        const q = quetes.q(id);
        if (!q || !(quetes.proposable(id) || q.st === 'propose') || n.st.anger > 0) continue;
        const i = opts.findIndex((o) => o.act === 'bye');
        opts.splice(i >= 0 ? i : opts.length, 0, { label: q.st === 'propose' ? D.propose.rappel : D.propose.label, act: 'tq:' + id, quest: true });
      }
    } catch (e) { console.error(e); }
    return opts;
  };
  const _ch = talk.choose.bind(talk);
  talk.choose = function (act) {
    if (typeof act !== 'string' || !act.startsWith('tq:')) return _ch(act);
    const [, id, r] = act.split(':'), D = QT_QUETES[id], P = D && D.propose;
    if (!P) return this.view('…', this.options());
    if (!r) {
      quetes.proposer(id);
      return this.view(P.texte, [{ label: P.oui, act: 'tq:' + id + ':oui', quest: true }, { label: P.plusTard, act: 'tq:' + id + ':tard' }, { label: P.non, act: 'tq:' + id + ':non' }]);
    }
    if (r === 'oui') { quetes.accepter(id); return this.view(P.repOui, this.options()); }
    if (r === 'tard') { quetes.plusTard(id); return this.view(P.repPlusTard, this.options()); }
    quetes.jamais(id);
    return this.view(P.repNon, this.options());
  };
}
// le panneau de la place : l'avis de la mairie (les toiles d'Ardoin), sous les autres
if (HOOKS.inter.affiche) {
  const _aff = HOOKS.inter.affiche;
  HOOKS.inter.affiche = (it) => {
    _aff(it);
    try {
      const q = quetes.q('t3'), P = QT_QUETES.t3.propose, el = document.querySelector('#reader .txt');
      if (!el || !q || !(quetes.proposable('t3') || q.st === 'propose')) return;
      quetes.proposer('t3');
      el.insertAdjacentHTML('beforeend', '<br><br>' + esc(P.texte));
      qtBoutons('t3', P);
    } catch (e) { console.error(e); }
  };
}
// la chambre sept : la nuit, à la dernière étape, le lit ; après, il est froid
if (HOOKS.inter.b1_sept) {
  const _sept = HOOKS.inter.b1_sept;
  HOOKS.inter.b1_sept = (it) => {
    try {
      const q = quetes.q('t1');
      if (q && q.st === 'actif' && q.e === QT_QUETES.t1.etapes.length - 1) { if (quetes.heureOk(QT_QUETES.t1.etapes[q.e])) { quetes.trouver('t1'); return; } _sept(it); ui.subtitle('', '(Pas à cette heure-ci. La nuit.)', 3); return; }
      if (q && q.st === 'fini' && q.fin === 'a') { ui.subtitle('', '(Le lit est fait au carré. Les draps sont froids.)', 4); return; }
    } catch (e) { console.error(e); }
    return _sept(it);
  };
}
// le phare : le registre (étape 2), la lanterne (la fin) ; le feu éteint, la mèche est froide
if (HOOKS.inter.b2) {
  const _b2 = HOOKS.inter.b2;
  HOOKS.inter.b2 = (it) => {
    try {
      const q = quetes.q('t2'), a = it && it.data && it.data.a;
      if (q && q.st === 'actif' && a === 'registre' && q.e === 1) {
        const r = _b2(it);
        const el = document.querySelector('#reader .txt');
        if (el) el.insertAdjacentHTML('beforeend', esc(QT_QUETES.t2.etapes[1].feuillet).replace(/\n/g, '<br>'));
        q.tr[1] = farm.s.day; q.e = 2; quetes.montrer('t2', 2, 0.4);
        return r;
      }
      if (q && q.st === 'actif' && a === 'lanterne' && q.e === 3) { if (quetes.heureOk(QT_QUETES.t2.etapes[3])) { quetes.trouver('t2'); return; } }
      if (q && q.st === 'fini' && q.fin === 'a' && a === 'lanterne') { ui.subtitle('', '(La mèche est froide. Personne ne l’a rallumée.)', 4); return; }
      if (q && q.st === 'fini' && q.fin === 'b' && a === 'registre') {
        const r = _b2(it);
        const el = document.querySelector('#reader .txt');
        if (el) el.insertAdjacentHTML('beforeend', '<br><br>' + esc('Sous la dernière ligne du gardien, de votre main : « Allumé. »'));
        return r;
      }
    } catch (e) { console.error(e); }
    return _b2(it);
  };
}
// la sept est à vous, pour rien : les lits loués de l'auberge
HOOKS.interPre.rentbed = ((prev) => (it) => {
  try { const S = quetes.S(); if (S && S.av.auberge && farm.s.flags) farm.s.flags.rented = farm.s.day; } catch (e) { /* rien */ }
  return prev ? prev(it) : false;
})(HOOKS.interPre.rentbed);
// en main : relire les papiers ; la longue-vue
HOOKS.primary.push((eye, basis, held, it, id) => {
  if (!farm.s || held) return false;
  if (id === 't_lettre_leonie' || id === 't_registre_menard') return quetes.relire(id);
  if (id === 't_longue_vue') { quetes.zoomBasculer(); return true; }
  return false;
});
HOOKS.secondary.push((eye, basis, it, hand) => {
  if (!farm.s || hand !== 't_longue_vue') return false;
  quetes.zoomBasculer();
  return true;
});
HOOKS.update.push((dt) => { if (farm.s && game.world) { try { quetes.update(dt); quetes.hiProp(); } catch (e) { console.error(e); } } });
HOOKS.draw.push((buf, sbuf, cam, t) => { if (farm.s && game.world) quetes.draw(buf, sbuf, cam, t); });
HOOKS.target.push((eye, f, cand) => { if (farm.s && game.world) quetes.target(eye, f, cand); });
HOOKS.load.push(() => { quetes.cache = null; quetes.aJouer = null; quetes.zoom = null; quetes.tickT = 2; if (farm.s) quetes.S(); });

// ---------------------------------------------------------------- une crécelle de bois qu'on fait tourner, au loin
Object.assign(SoundEngine.prototype, {
  tCrecelle(k = 1) {
    if (!this.ok) return;
    const t = this.at(), R = Math.random, n = 9 + ((R() * 6) | 0);
    for (let i = 0; i < n; i++) {
      const tt = t + i * (0.052 + R() * 0.01) + (i > n * 0.6 ? (i - n * 0.6) * 0.012 : 0);
      this.noiseHit(tt, 0.024, 'bandpass', 1500 + R() * 500, 3.5, 0.05 * k * (1 - i / (n * 1.6)), null, 900, 0.002);
      this.noiseHit(tt + 0.004, 0.03, 'bandpass', 420 + R() * 80, 4, 0.025 * k, null, 300, 0.003);
    }
  },
});
