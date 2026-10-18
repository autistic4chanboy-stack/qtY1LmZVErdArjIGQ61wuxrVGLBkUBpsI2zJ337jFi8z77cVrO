// ============================================================================
//  LES SCÈNES DES QUÊTES (agent Q20D, lot 4) — 4c. LA CITÉ ET LES TERRES D'AVANT
//  - la pierre ronde : le seul voyage (le papier d'Anselme, dans la vallée ;
//    l'arrivée au Seuil de la cité ; le retour, ou la veilleuse qui vous rend à
//    la vallée) ;
//  - le Cœur de la cité (monde 'vaisseau') : il dort ; rallumé ; éteint, par vous
//    ou par la veilleuse ;
//  - les Terres d'Avant (monde 'zone') : sous chaque tertre un roi (la pierre
//    dressée, la chambre sous le tertre, les trois rois) ; le tertre scellé (les
//    runes).
// ============================================================================

// ---------------------------------------------------------------- LA PIERRE RONDE : le papier ; le Seuil ; le retour (ou la dernière lumière)
const Q20D_ANSELME = 'Anselme Varenne';
function q20dPierre(c) {
  const P = c.w.vg;
  if (!P) return null;
  const pap = Q20D.inter(c, 'vg_papier_anselme');
  const C = [P.x, P.y, P.z], devant = c.pt(P.ix + Math.sin(P.r) * 2.2, P.iz + Math.cos(P.r) * 2.2);
  return { P, C, devant, pap: pap ? c.pt(pap[0], pap[2]) : null, haut: c.haut(C, 1.85), lum: [c.lueur(C, 9, [0.32, 0.6, 1.15], 1.85), c.lueur(C, 4, [0.45, 0.75, 1.2], 1.2)] };
}
function q20dVG() { try { return typeof VG !== 'undefined' && farm.s ? VG.S() : null; } catch (e) { return null; } }
q20.scenes('q20d_vg_seuil', {
  souv: 'q20d:pierre', titre: 'Le seuil de l’étoile',
  monde: { demande: 'vallee', tournant: 'vaisseau', fin: 'vallee' },
  delais: { demande: 1.2, tournant: 2.5, fin: 7 },
  etat() {
    const V = q20dVG();
    if (!V) return q20dE('Le seuil de l’étoile', null, false, false);
    return q20dE('Le seuil de l’étoile', V.lus.anselme || V.etat ? V : null, !!V.lus.anselme || V.etat === 1, V.etat >= 2, V.etat >= 2 ? (V.mort ? 1 : 0) : null, V.etat >= 1);
  },
  tournantSi() { const V = q20dVG(); return !!(V && V.etat === 1 && V.nommee); },
  demande(c) {
    const Pi = q20dPierre(c);
    if (!Pi) return null;
    const a = Pi.P.r + 0.7, JP = Pi.pap ? Q20H.libre(c, c.devant(Pi.pap, c.cap(Pi.C, Pi.pap), 0.8), 0, 1.2, 0.4) : Pi.devant;
    const J = c.joueur(JP, { face: Pi.pap || Pi.C, geste: 'baisse' });
    const le = c.chose(Q20D_DESSINS.lettre, c.haut(c.devant(J.P, J.cap, 0.32, 0.04, true), 1.05), { s: 1.4, r: J.cap });
    return [
      c.plan({ dur: 6.8, cam: Q20D.cam(c, () => c.camLieu(Pi.C, { d: 10, haut: 2.2, dy: 1.6, a, recul: 0.1, stop: 1.2 }), () => c.camLieu(Pi.C, { d: 13, haut: 2.8, dy: 1.6, a: a + 1.2, stop: 1.2 })), acteurs: [], lum: Pi.lum, son: 'clochette', dit: c.parole('J’ai trouvé la pierre ronde. Elle chante quand il n’y a pas de lune.', Q20D_ANSELME), court: true }),
      c.plan({ dur: 6.2, cam: Q20D.cam(c, () => c.camActeur(J, { cote: 1.2, d: 2.2, buste: true, avec: le.P, k: 0.25 }), () => c.camActeur(J, { cote: -1.2, d: 2.4, buste: true })), acteurs: [J, le], lum: Pi.lum, son: 'page', dit: c.parole('On n’y va qu’une fois : ça se sent.', Q20D_ANSELME) }),
    ];
  },
  tournant(c) {
    if (typeof vgCite === 'undefined') return null;
    const f = vgCite.f(), anneau = vgCite.pos(0, 1.6, -15.6), dep = vgCite.pos(0, 0, -9.5);
    const J = c.joueur([dep[0], c.solSous(dep[0], dep[2], f.y + 0.3), dep[2]], { face: vgCite.pos(0, 0, 10), geste: 'leve' });
    const lum = [c.lueur(anneau, 8, [0.35, 0.6, 1.1], 0), c.lueur(vgCite.pos(-6, 0, -12), 5, [0.3, 0.5, 0.95], 1.4)];
    const cou = vgCite.pos(0, 1.6, 5), nef = vgCite.pos(0, 6, 60);
    return [
      c.plan({ dur: 6.6, cam: Q20D.cam(c, () => c.camActeur(J, { cote: 0.25, d: 4.2, haut: 1.7, avec: anneau, k: 0.3, recul: 0.06 }), () => c.camActeur(J, { cote: -0.35, d: 3.6, haut: 1.7, avec: anneau, k: 0.3 }), () => c.camChose(anneau, { d: 6, haut: 1.8, a: 0, dy: 0 })), acteurs: [J], lum, son: 'clochette' }),
      c.plan({ dur: 6, cam: Q20D.cam(c, () => c.camRegard(cou, nef, { haut: 1.6, recul: 0.12 }), () => c.camLieu(nef, { d: 30, haut: 3, dy: 0, a: Math.PI, stop: 4 })), acteurs: [Object.assign({}, J, { vu: false })], lum: [c.lueur(cou, 6, [0.25, 0.4, 0.8], 1)] }),
    ];
  },
  fins: {
    // revenu par le seuil : la pierre éteinte, fendue
    0(c) {
      const Pi = q20dPierre(c);
      if (!Pi) return null;
      const J = c.joueur(Pi.devant, { face: Pi.C, geste: 'baisse' });
      const T = c.w.townInfo || c.w.lm.place || null, loin = T ? c.pt(T.x, T.z) : c.devant(Pi.C, Pi.P.r, 300);
      return [
        c.plan({ dur: 6.8, cam: Q20D.cam(c, () => c.camActeur(J, { cote: 2.2, d: 3.0, avec: Pi.haut, k: 0.3 }), () => c.camActeur(J, { cote: -2.2, d: 3.2, avec: Pi.haut, k: 0.3 })), acteurs: [J], son: 'grondement', dit: c.parole('J’ai laissé la place à un autre.', Q20D_ANSELME), court: true }),
        c.plan({ dur: 6, cam: Q20D.cam(c, () => c.camRegard(c.devant(Pi.devant, Pi.P.r, 1.5), c.haut(loin, 30), { haut: 1.6, recul: 0.04 }), () => c.camLieu(Pi.C, { d: 30, haut: 6, dy: 1 })), acteurs: [Object.assign({}, J, { vu: false })] }),
      ];
    },
    // mort là-haut : la veilleuse a dépensé la dernière lumière du seuil
    1(c) {
      const Pi = q20dPierre(c);
      if (!Pi) return null;
      const JP = c.devant(Pi.C, Pi.P.r, 1.0), J = c.joueur(JP, { cap: Pi.P.r, geste: ['assis', 'baisse'] });
      return [
        c.plan({ dur: 6.8, cam: Q20D.cam(c, () => c.camActeur(J, { cote: 0.6, d: 2.4, haut: 1.2 }), () => c.camActeur(J, { cote: -0.7, d: 2.6, haut: 1.2 })), acteurs: [J], son: 'murmure', dit: c.parole('Au revoir. Dites-leur, en bas… Non. Ne leur dites rien.', 'La veilleuse', 1.3), court: true }),
        c.plan({ dur: 6, cam: Q20D.cam(c, () => c.camLieu(Pi.C, { d: 8, haut: 2.2, dy: 1.4, a: Pi.P.r + 0.5, recul: 0.08, stop: 1 }), () => c.camLieu(Pi.C, { d: 10, haut: 2.6, dy: 1.4, a: Pi.P.r - 0.6, stop: 1 }), () => c.camLieu(Pi.C, { d: 14, haut: 4, dy: 1.4, stop: 1 })), acteurs: [Object.assign({}, J, { vu: false })], dit: c.parole('(La pierre est froide.)', '') }),
      ];
    },
  },
});
q20d.guetter('q20d_vg_seuil', () => { const V = q20dVG(); if (!V || !farm.s.vaisseau) return null; if (V.etat >= 2) return 'fin'; if (V.etat === 1) return null; return V.lus.anselme ? 'demande' : null; });

// ---------------------------------------------------------------- LE CŒUR DE LA CITÉ : il dort ; rallumé ; éteint (par vous, ou par la veilleuse)
const Q20D_VEILLEUSE = () => (typeof Q20B !== 'undefined' ? Q20B.nom('veilleuse') : 'La veilleuse');
function q20dCoeur(c) {
  if (typeof vgCite === 'undefined') return null;
  const C = vgCite.pos(0, -16, 42), pu = vgCite.pos(0, -16, 35.6);
  return { C, pu, haut: c.haut(C, 3.2), braise: c.lueur(C, 7, [0.55, 0.12, 0.06], 1.5), blanc: [c.lueur(C, 30, [0.6, 0.85, 1.3], 7), c.lueur(C, 10, [0.75, 0.9, 1.2], 2.5)], nef: vgCite.pos(0, 1.6, 64), ciel: vgCite.pos(0, 30, 96) };
}
// (le Cœur allumé une première fois, puis éteint : par vous, ou par elle — gardé dès qu'on le sait)
function q20dCoeurEtat() {
  const V = q20dVG();
  if (!V) return null;
  const N = q20d.S().coeur || {}, on = !!(N.on || V.dits.coeur_on), off = N.off || (on && !V.m.coeur ? (V.dits.coeur_off ? 'joueur' : 'veilleuse') : null);
  return { V, N, on, off };
}
q20.scenes('q20d_vg_coeur', {
  qui: 'veilleuse', titre: 'Le Cœur',
  monde: 'vaisseau',
  delais: { demande: 6, tournant: 6, fin: 6 },
  etat() {
    const E = q20dCoeurEtat();
    if (!E) return q20dE('Le Cœur', null, false, false);
    return q20dE('Le Cœur', E.V.dits.machinerie || E.on ? E.V : null, !!(E.V.dits.machinerie || E.on), !!E.off, E.off ? (E.off === 'veilleuse' ? 1 : 0) : null, E.on);
  },
  tournantSi() { const E = q20dCoeurEtat(); return !!(E && E.on); },
  demande(c) {
    const K = q20dCoeur(c);
    if (!K) return null;
    const nom = Q20D_VEILLEUSE();
    return [
      c.plan({ dur: 6.8, cam: Q20D.cam(c, () => c.camLieu(K.haut, { d: 12, haut: 1.8, dy: 0, a: Math.PI + 0.35, recul: 0.06, stop: 2.5 }), () => c.camLieu(K.haut, { d: 9, haut: 1.6, dy: 0, a: Math.PI - 0.6, stop: 2.5 })), acteurs: [], lum: [K.braise], son: 'grondement', dit: c.parole('Il dort depuis que Thalvor est descendu.', nom, 1.3), court: true }),
      c.plan({ dur: 6, cam: Q20D.cam(c, () => c.camChose(c.haut(K.pu, 1.0), { d: 1.7, haut: 1.4, a: Math.PI + 0.5, dy: 0, recul: 0.1 }), () => c.camChose(c.haut(K.pu, 1.0), { d: 2.1, haut: 1.5, a: Math.PI - 0.5, dy: 0 })), acteurs: [], lum: [K.braise, c.lueur(K.pu, 3, [0.3, 0.45, 0.9], 1.2)], dit: c.parole('Si vous le rallumez, je compterai.', nom, 1.3) }),
    ];
  },
  tournant(c) {
    const K = q20dCoeur(c);
    if (!K) return null;
    const J = c.joueur(Q20B.libre(c, Q20B.devant(c, K.pu, Math.PI, 0.9, 0), 0, 1, 0.35), { face: K.haut, geste: 'leve' });
    return [
      c.plan({ dur: 6.6, cam: Q20D.cam(c, () => c.camActeur(J, { cote: 2.5, d: 3.2, avec: c.haut(K.C, 1.8), k: 0.25, recul: 0 }), () => c.camActeur(J, { cote: -2.5, d: 3.2, avec: c.haut(K.C, 1.8), k: 0.25, recul: 0 })), acteurs: [J], lum: K.blanc, son: 'grondement' }),
      c.plan({ dur: 6.2, cam: Q20D.cam(c, () => c.camRegard(K.nef, K.ciel, { haut: 1.4, recul: 0.05 }), () => c.camLieu(K.nef, { d: 20, haut: 4, dy: 2, stop: 3 })), acteurs: [Object.assign({}, J, { vu: false })], lum: [c.lueur(K.nef, 16, [0.7, 0.8, 1.0], 4)], dit: c.parole('Les fenêtres s’allument, là-bas, dans les tours. Elles aussi avaient oublié.', Q20D_VEILLEUSE(), 1.3) }),
    ];
  },
  fins: {
    // vous l'avez éteint
    0(c) {
      const K = q20dCoeur(c);
      if (!K) return null;
      const J = c.joueur(Q20B.libre(c, Q20B.devant(c, K.pu, Math.PI, 0.9, 0), 0, 1, 0.35), { face: K.pu, geste: 'baisse' });
      return [
        c.plan({ dur: 6.6, cam: Q20D.cam(c, () => c.camActeur(J, { cote: 2.2, d: 3.0, avec: c.haut(K.C, 1.6), k: 0.15, recul: 0 }), () => c.camActeur(J, { cote: -2.2, d: 3.0, avec: c.haut(K.C, 1.6), k: 0.15, recul: 0 })), acteurs: [J], lum: [K.braise, c.lueur(K.pu, 3, [0.3, 0.45, 0.9], 1.2)], dit: c.parole('Merci. Elle n’a pas eu le temps de regarder.', Q20D_VEILLEUSE(), 1.3), court: true }),
        c.plan({ dur: 6, cam: Q20D.cam(c, () => c.camLieu(K.haut, { d: 14, haut: 2.4, dy: 0, a: Math.PI + 0.9, recul: 0.06, stop: 2.5 }), () => c.camLieu(K.haut, { d: 10, haut: 2, dy: 0, stop: 2.5 })), acteurs: [Object.assign({}, J, { vu: false })], lum: [K.braise], son: 'murmure' }),
      ];
    },
    // elle l'a éteint elle-même
    1(c) {
      const K = q20dCoeur(c);
      if (!K) return null;
      return [
        c.plan({ dur: 6.6, cam: Q20D.cam(c, () => c.camLieu(K.haut, { d: 11, haut: 1.8, dy: 0, a: Math.PI - 0.4, recul: 0.08, stop: 2.5 }), () => c.camLieu(K.haut, { d: 8, haut: 1.6, dy: 0, stop: 2.5 })), acteurs: [], lum: [K.braise], son: 'grondement', dit: c.parole('Il brûlait trop fort. On l’aurait vu de trop loin.', Q20D_VEILLEUSE(), 1.3), court: true }),
        c.plan({ dur: 6, cam: Q20D.cam(c, () => c.camRegard(K.nef, K.ciel, { haut: 1.4, recul: 0.04 }), () => c.camLieu(K.nef, { d: 20, haut: 4, dy: 2, stop: 3 })), acteurs: [], lum: [c.lueur(K.nef, 8, [0.2, 0.32, 0.65], 2)] }),
      ];
    },
  },
});
q20d.guetter('q20d_vg_coeur', () => {
  const E = q20dCoeurEtat();
  if (!E || !farm.s.vaisseau) return null;
  // (on garde ce qu'on a vu : allumé, puis éteint — par qui —, une fois)
  if (E.on && !E.N.on) q20d.note('coeur').on = farm.s.day;
  if (E.off && !(q20d.S().coeur || {}).off) q20d.note('coeur').off = E.off;
  if (E.off) return 'fin';
  return E.on ? null : E.V.dits.machinerie ? 'demande' : null;
});

// ============================================================================ LES TERRES D'AVANT (monde 'zone')
function q20dZS() { try { return typeof zone !== 'undefined' && farm.s ? zone.S() : null; } catch (e) { return null; } }
// ---------------------------------------------------------------- SOUS CHAQUE TERTRE, UN ROI : la pierre dressée ; la chambre ; les trois rois
const Q20D_TERTRES = 'Une pierre dressée, aux Tertres';
function q20dTertres(c) {
  const Z = c.w, ins = Q20D.inter(c, 'inscr_tertres'), L = Z.lm && Z.lm.zone_tertres;
  const ch = [0, 1, 2].map((k) => ({ k, roi: Q20D.inter(c, 'tertre_' + k + '_roi'), sortie: Q20D.inter(c, 'tertre_' + k + '_sortie'), dalle: Q20D.inter(c, 'tertre_' + k) })).filter((x) => x.roi && x.sortie);
  if (!ins && !ch.length) return null;
  const C = L ? c.pt(L.x, L.z) : (ins ? c.pt(ins[0], ins[2]) : c.pt(ch[0].dalle[0], ch[0].dalle[2]));
  const gros = (Z.v1 && Z.v1.tertres ? Z.v1.tertres.slice().sort((a, b) => b.R0 - a.R0).slice(0, 3) : []).map((T) => c.pt(T.x, T.z));
  const st = ins && (Z.props || []).find((q) => q.id === 'v1_stele' && Math.hypot(q.x - ins[0], q.z - ins[2]) < 0.8);
  return { ins: ins ? c.pt(ins[0], ins[2]) : null, face: st ? (st.r || 0) + Math.PI : null, ch, C, gros };
}
// la pierre dressée, de face (sa face gravée), à d mètres
function q20dCamStele(c, T, d) {
  const a = T.face ?? c.cap(T.ins, T.C), P = c.haut(T.ins, 1.3);
  return Q20D.cam(c, () => c.camChose(P, { d, haut: 1.5, a: a + 0.25, dy: 0, recul: 0.06 }), () => c.camChose(P, { d, haut: 1.5, a: a - 0.3, dy: 0 }), () => c.camChose(P, { d: d * 1.3, haut: 1.7, a: a + 0.6, dy: 0 }));
}
q20.scenes('q20d_z_tertres', {
  souv: 'q20d:zone', titre: 'Sous chaque tertre, un roi',
  monde: 'zone',
  delais: { demande: 1.2, tournant: 1.5, fin: 2.5 },
  etat() {
    const S = q20dZS();
    if (!S) return q20dE('Sous chaque tertre, un roi', null, false, false);
    const ouv = [0, 1, 2].some((k) => S.ouverts['tertre_' + k]), rois = [0, 1, 2].filter((k) => S.pris['tertre_' + k + '_roi']).length;
    return q20dE('Sous chaque tertre, un roi', S.lus.inscr_tertres || ouv ? S : null, !!(S.lus.inscr_tertres || ouv), rois >= 3, null, ouv);
  },
  tournantSi() { const S = q20dZS(); return !!(S && [0, 1, 2].some((k) => S.ouverts['tertre_' + k])); },
  demande(c) {
    const T = q20dTertres(c);
    if (!T || !T.ins) return null;
    const vers = T.gros[0] || T.C;
    return [
      c.plan({ dur: 6.6, cam: q20dCamStele(c, T, 2.8), acteurs: [], lum: [c.lueur(c.devant(T.ins, T.face ?? 0, 1.2), 6, [0.62, 0.64, 0.74], 1.4)], son: 'corbeau', dit: c.parole('SOUS CHAQUE TERTRE, UN ROI.', Q20D_TERTRES), court: true }),
      c.plan({ dur: 6.4, cam: Q20D.cam(c, () => c.camLieu(vers, { d: c.nuit() ? 20 : 32, haut: c.nuit() ? 5 : 7, dy: 2, a: c.cap(vers, T.ins) + 0.3, recul: 0.05, stop: 6 }), () => c.camLieu(vers, { d: 26, haut: 9, dy: 2, stop: 6 })), acteurs: [], lum: T.gros.map((P) => c.lueur(P, 30, [0.42, 0.46, 0.6], 8)).concat([c.lueur(vers, 14, [0.5, 0.54, 0.68], 3)]) }),
    ];
  },
  tournant(c) {
    const T = q20dTertres(c);
    if (!T || !T.ch.length) return null;
    const S = q20dZS(), k0 = (q20d.S().tertre1 || {}).k, Ch = T.ch.find((x) => x.k === k0) || T.ch.find((x) => S && S.ouverts['tertre_' + x.k]) || T.ch[0];
    return Q20D.sous(c, () => {
      const so = c.ptSous(Ch.sortie[0], Ch.sortie[2], Ch.sortie[1] - 1.0), roi = [Ch.roi[0], so[1], Ch.roi[2]], lit = [Ch.roi[0], so[1] + 0.95, Ch.roi[2]];
      const J = c.joueur(Q20B.libre(c, c.vers(so, roi, 0.45), 0, 0.8, 0.3), { face: roi, geste: 'baisse', lanterne: true });
      const lum = [Q20D.flamme(c, J.P, 5, 1.3)];
      return [
        c.plan({ dur: 6.6, cam: Q20D.cam(c, () => c.camActeur(J, { cote: 1.5, d: 2.0, avec: c.haut(roi, 0.9), k: 0.35 }), () => c.camActeur(J, { cote: -1.5, d: 2.0, avec: c.haut(roi, 0.9), k: 0.35 })), acteurs: [J], lum, son: 'murmure' }),
        c.plan({ dur: 6, cam: Q20D.cam(c, () => c.camChose(lit, { d: 1.5, haut: 1.75, a: c.cap(roi, so) + 0.6, dy: 0 }), () => c.camChose(lit, { d: 1.8, haut: 1.8, a: c.cap(roi, so) - 0.6, dy: 0 })), acteurs: [Object.assign({}, J, { vu: false })], lum, dit: c.parole('(Sur un lit de pierre, des os, et ce qu’on avait enterré avec lui.)', '') }),
      ];
    });
  },
  fin(c) {
    const T = q20dTertres(c);
    if (!T) return null;
    const vers = T.ins || T.C;
    return [
      c.plan({ dur: 6.8, cam: Q20D.cam(c, () => c.camLieu(T.gros[0] || T.C, { d: c.nuit() ? 20 : 34, haut: c.nuit() ? 5 : 9, dy: 2, a: c.cap(T.gros[0] || T.C, vers) - 0.4, recul: 0.05, stop: 6 }), () => c.camLieu(T.gros[0] || T.C, { d: 26, haut: 9, dy: 2, stop: 6 })), acteurs: [], lum: T.gros.map((P) => c.lueur(P, 30, [0.42, 0.46, 0.6], 8)).concat([c.lueur(T.gros[0] || T.C, 14, [0.5, 0.54, 0.68], 3)]), son: 'corbeau', dit: c.parole('SOUS CHAQUE ROI, UN AUTRE TERTRE.', Q20D_TERTRES), court: true }),
      T.ins && c.plan({ dur: 6, cam: q20dCamStele(c, T, 3.6), acteurs: [], lum: [c.lueur(c.devant(T.ins, T.face ?? 0, 1.2), 6, [0.62, 0.64, 0.74], 1.4)], dit: c.parole('(Et sous celui-là ?)', '') }),
    ];
  },
});
q20d.guetter('q20d_z_tertres', () => {
  const S = q20dZS();
  if (!S || !farm.s.zone) return null;
  const N = q20d.S();
  if (!N.tertre1) for (const k of [0, 1, 2]) if (S.ouverts['tertre_' + k]) { q20d.note('tertre1', { k }); break; }
  if ([0, 1, 2].every((k) => S.pris['tertre_' + k + '_roi'])) return 'fin';
  if (N.tertre1) return null;
  return S.lus.inscr_tertres ? 'demande' : null;
});

// ---------------------------------------------------------------- LE TERTRE SCELLÉ (une dalle gravée, les runes)
q20.scenes('q20d_r15_tertre', {
  souv: 'q20d:zone', titre: 'Le tertre scellé',
  monde: 'zone',
  delais: { demande: 1.2, tournant: 3, fin: 1.5 },
  etat() { const R = q20dR15(), N = q20d.S().tertre; return q20dE('Le tertre scellé', N || (R && R.p.tertre) ? (R || {}) : null, !!N || !!(R && R.p.tertre), !!(R && R.c.tertre), null, !!(R && R.p.tertre)); },
  tournantSi() { const R = q20dR15(); return !!(R && R.p.tertre); },
  demande(c) {
    const K = q20dDalle(c, 'tertre');
    if (!K) return null;
    return [
      c.plan({ dur: 6.6, cam: Q20D.cam(c, () => c.camLieu(K.P, { d: 12, haut: 2.4, dy: 1.2, a: K.face + 0.5, recul: 0.08, stop: 1.5 }), () => c.camLieu(K.P, { d: 15, haut: 3, dy: 1.2, a: K.face - 0.6, stop: 1.5 })), acteurs: [], son: 'corbeau', dit: c.parole('(Un tertre à l’écart des autres, fermé d’une dalle. On ne l’a pas pillé.)', ''), court: true }),
      K.dv && c.plan({ dur: 6, cam: Q20D.cam(c, () => c.camChose(K.T, { d: 1.8, haut: 1.4, a: K.face + 0.3, dy: 0, recul: 0.1 }), () => c.camChose(K.T, { d: 2.2, haut: 1.5, a: K.face - 0.3, dy: 0 })), acteurs: [], dit: c.parole('(Trois signes ; l’un s’efface.)', '') }),
    ];
  },
  tournant(c) {
    const K = q20dDalle(c, 'tertre');
    if (!K) return null;
    const pous = Q20H.emet(c.haut(K.P, 0.2), { n: 6, col: [0.62, 0.58, 0.52, 0.6], taille: 0.07, vie: 2.2, v: 0.5, vy: 0.2, r: 1.2 });
    const J = K.dv && c.joueur(Q20H.libre(c, c.devant(K.dv, K.face, 0.6), 0, 1.2, 0.4), { face: K.T, geste: 'baisse' });
    return [
      c.plan({ dur: 6.4, cam: Q20D.cam(c, () => (J ? c.camActeur(J, { cote: 2.5, d: 3.2, avec: K.T, k: 0.55 }) : null), () => c.camLieu(K.P, { d: 9, haut: 2, dy: 1, a: K.face })), acteurs: [J], chaque: pous, son: 'grondement' }),
      c.plan({ dur: 5.8, cam: Q20D.cam(c, () => c.camLieu(K.P, { d: 10, haut: 2.2, dy: 1.0, a: K.face - 0.7, stop: 1.5 }), () => c.camLieu(K.P, { d: 13, haut: 3, dy: 1, stop: 1.5 })), acteurs: [J && Object.assign({}, J, { vu: false })] }),
    ];
  },
  fin(c) {
    const K = q20dDalle(c, 'tertre');
    if (!K) return null;
    const Ko = K.coffre || K.P;
    const J = c.joueur(Q20H.libre(c, c.devant(Ko, K.face + Math.PI / 2, 0.8), 0, 0.6, 0.3), { face: Ko, geste: 'penche' });
    const pi = c.chose(Q20_DESSINS.piece || Q20D_DESSINS.point, c.haut(Ko, 0.62), { s: 1.6, r: K.face, lueur: true });
    return [
      c.plan({ dur: 6.6, cam: Q20D.cam(c, () => c.camChose(c.haut(Ko, 0.5), { d: 2.4, haut: 1.5, a: K.face - 0.15, dy: 0 }), () => c.camActeur(J, { cote: 1.6, d: 2.2, buste: true }), () => c.camLieu(K.P, { d: 8, haut: 2 })), acteurs: [J, pi], lum: [c.lueur(Ko, 3, [1.0, 0.8, 0.5], 0.6)], son: 'piece', dit: c.parole('(Personne n’avait touché à ceci depuis qu’on l’avait scellé.)', ''), court: true }),
      c.plan({ dur: 5.8, cam: Q20D.cam(c, () => c.camLieu(K.P, { d: 22, haut: 4, dy: 1.2, a: K.face + 2.2, recul: 0.05, stop: 1.5 }), () => c.camLieu(K.P, { d: 28, haut: 6, dy: 1.2, stop: 1.5 })), acteurs: [Object.assign({}, J, { vu: false })], son: 'corbeau' }),
    ];
  },
});
q20d.guetter('q20d_r15_tertre', () => { const R = q20dR15(); if (!R) return null; if (R.c.tertre) return 'fin'; if (R.p.tertre) return null; return q20d.S().tertre ? 'demande' : null; });
