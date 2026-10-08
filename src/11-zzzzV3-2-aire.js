// ============================================================================
//  LE VER (agent V3) — l'aire, les perchoirs, la loge du Guet ; ce qu'il garde ;
//  les fins
//  - Passe de génération de la Zone (zone.passe 'V3') : au sommet du Pic, l'aire
//    (un plancher de roche noircie et vitrifiée, un cercle de rochers dressés, le
//    tas — ce qu'il a pris à ceux qui sont venus —, l'anneau scellé et le bout de
//    la chaîne, des os, et le dernier guetteur assis contre le roc, la clé du
//    collier dans la main) ; sur les six perchoirs, de quoi comprendre (une borne
//    aux anneaux, une baliste renversée, des encoches, un heaume fondu, des
//    griffures, des écailles tombées) ; sur la crête du nord, la loge du Guet (la
//    paillasse, le carnet, la cloche qui le fait rentrer).
//  - La cendre et l'herbe brûlée des jours d'avant sont remises (farm.s.v3).
//  - Les fins :
//    · le délivrer : la nuit, pendant qu'il dort, s'approcher sans bruit et ouvrir
//      le collier avec la clé du dernier guetteur. Il se réveille, regarde, et
//      s'en va par-dessus les montagnes. Il ne revient pas. (Au matin suivant,
//      dans la vallée, une écaille sur le seuil.)
//    · le tuer : presque impossible. Sous l'aile gauche, le carreau est resté dans
//      la plaie : c'est là seulement qu'il saigne (V3.pv) ; ailleurs, tout ricoche.
//      Il guérit en deux jours. Mort, son corps reste où il est tombé.
// ============================================================================
Object.assign(LIEU_NAMES, V3_LIEUX);

// ---------------------------------------------------------------- les modèles en plus (le dernier guetteur, la pierre aux encoches, les griffures, la loge)
Object.assign(PROP_MODELS, {
  // le dernier guetteur, assis contre le roc (data.cle : la clé encore dans sa main)
  v3_guetteur(E, o) {
    const os = [0.84, 0.79, 0.68], os2 = [0.7, 0.65, 0.55], tissu = [0.3, 0.27, 0.24];
    E.bx(0, 0, 0.1, 0.5, 0.2, 0.62, tissu, TL.cloth);                       // le bassin, des restes de tissu
    E.box(0, 0.48, -0.08, 0.36, 0.62, 0.22, os2, TL.bone, 0, -0.25);        // la colonne, les côtes
    for (let i = 0; i < 4; i++) E.box(0, 0.32 + i * 0.12, 0.0, 0.42, 0.04, 0.26, os, TL.bone, 0, -0.25);
    E.box(0.05, 0.92, -0.12, 0.24, 0.27, 0.27, os, TL.bone, 0.4, 0.5);      // le crâne, penché sur l'épaule
    E.box(0.05, 0.86, -0.02, 0.1, 0.05, 0.1, [0.1, 0.08, 0.07], 0, 0.4, 0.5);
    for (const s of [1, -1]) {
      E.box(s * 0.13, 0.12, 0.45, 0.09, 0.09, 0.62, os, TL.bone, s * 0.15);  // les jambes, allongées
      E.box(s * 0.15, 0.05, 0.85, 0.1, 0.08, 0.5, os2, TL.bone, s * 0.2, 0.3);
      E.box(s * 0.26, 0.45, 0.05, 0.08, 0.5, 0.08, os, TL.bone, 0, 0.3, s * 0.25); // les bras
    }
    E.box(0.3, 0.2, 0.32, 0.08, 0.08, 0.36, os, TL.bone, 0.6);             // l'avant-bras droit, sur la cuisse
    if (o.data && o.data.cle) { E.box(0.36, 0.25, 0.5, 0.06, 0.06, 0.5, [0.2, 0.18, 0.17], TL.iron, 0.6); E.box(0.48, 0.25, 0.72, 0.16, 0.04, 0.16, [0.2, 0.18, 0.17], TL.iron, 0.6); }
  },
  // une pierre plate, couverte d'encoches
  v3_encoches(E) {
    E.bx(0, -0.1, 0, 2.2, 0.55, 1.5, [0.55, 0.53, 0.5], mt(M_V1_PIERRE), 0.2);
    for (let i = 0; i < 26; i++) E.box(-0.95 + (i % 13) * 0.15, 0.46, -0.35 + Math.floor(i / 13) * 0.45, 0.03, 0.02, 0.3, [0.15, 0.14, 0.13], 0, 0.2);
  },
  // des griffures dans le roc : des entailles sombres, par quatre
  v3_griffes(E) {
    E.bx(0, -0.4, 0, 3.4, 1.6, 2.6, [0.5, 0.48, 0.46], mt(M_ROCK), 0.1);
    for (let i = 0; i < 4; i++) E.box(-0.9 + i * 0.6, 1.21, -0.1 + i * 0.08, 0.14, 0.03, 2.1, [0.1, 0.09, 0.09], 0, 0.15);
  },
});
DYN_PROPS.add('v3_guetteur'); DYN_PROPS.add('v3_collier'); DYN_PROPS.add('v3_ecaille'); DYN_PROPS.add('v3_grabat'); DYN_PROPS.add('v3_tas');
{
  // le collier ouvert n'existe qu'après la délivrance
  const _col = PROP_MODELS.v3_collier;
  PROP_MODELS.v3_collier = function (E, o, T) { if (typeof dragonV3 !== 'undefined' && dragonV3.S().fin === 'delivre') _col(E, o, T); };
  const _g = PROP_MODELS.v3_guetteur;
  PROP_MODELS.v3_guetteur = function (E, o, T) { _g(E, Object.assign({}, o, { data: { cle: !(typeof dragonV3 !== 'undefined' && dragonV3.S().cle) } }), T); };
  const _gr = PROP_MODELS.v3_grabat;
  PROP_MODELS.v3_grabat = function (E, o, T) { _gr(E, Object.assign({}, o, { data: { carnet: !(typeof dragonV3 !== 'undefined' && dragonV3.S().carnet) } }), T); };
  const _ec = PROP_MODELS.v3_ecaille;
  PROP_MODELS.v3_ecaille = function (E, o, T) { if (typeof dragonV3 !== 'undefined' && o.data && dragonV3.S().ecailles[o.data.id]) return; _ec(E, o, T); };
  const _tas = PROP_MODELS.v3_tas;
  PROP_MODELS.v3_tas = function (E, o, T) { _tas(E, Object.assign({}, o, { data: { n: typeof dragonV3 !== 'undefined' ? dragonV3.S().tas : 0 } }), T); };
}

// ---------------------------------------------------------------- la passe de génération (la Zone)
zone.passe('V3', (Z, O) => {
  const B = O.B, rnd = O.rnd, S = typeof farm !== 'undefined' && farm.s ? dragonV3.S() : null;
  const sol = (x, z) => Z.heightAt(x, z);
  const V = Z.v3 = { perchoirs: {} };
  // ------------------------------------------------ l'aire, au sommet du Pic
  const A = O.site('dragon_aire'), porte = Z.v1 ? Z.v1.porte : { x: Z.size / 2, z: Z.size * 0.95 };
  const rP = Math.atan2(porte.x - A.x, porte.z - A.z);
  const f = { x: A.x, y: A.y, z: A.z, r: rP };                 // repère : +z local vers la Porte
  // le plancher : de la pierre noire, vitrifiée par le feu, et de la cendre autour
  B.paintDisk(A.x, A.z, 37, M_V1_CENDRE, 6);
  B.paintDisk(A.x, A.z, 25, M_OBSIDIENNE, 7);
  // la couche (où il dort) : un peu en arrière du centre ; il y dort la tête tournée vers la Porte
  const [cx, cz] = B.toWorld(f, 0, -5);
  V.couche = { x: cx, z: cz, y: sol(cx, cz), yaw: rP };
  // le corps endormi (le cou couché sur le côté, la queue enroulée du même côté) : son repère, pour placer ce qui l'entoure
  const aT = dragonV3.angleTeteDort(), yawCorps = rP - aT, fc = { x: cx, y: sol(cx, cz), z: cz, r: yawCorps };
  const DL = dragonV3.dortLocal(), tete = B.toWorld(fc, DL.tete[0], DL.tete[2]), cou = B.toWorld(fc, DL.collier[0], DL.collier[2]);
  // la chaîne du Guet (calculée d'abord : rien ne doit gêner son arrivée) : le sentier s'arrête au pied de la roche de l'aire
  let CH = null;
  {
    const ch = V1_CHEMINS.find((c) => c.sentier), S1 = Z.size;
    let bas = null;
    if (ch) {
      const pts = ch.pts.map(([u, v]) => [u * S1, v * S1]);
      // en remontant le sentier depuis son bout : le dernier point au pied de la roche (assez bas, hors de l'aire)
      for (let s = pts.length - 1; s > 0 && !bas; s--) {
        const [x1, z1] = pts[s], [x0, z0] = pts[s - 1], L = Math.hypot(x1 - x0, z1 - z0);
        for (let t = 0; t <= L; t += 1) {
          const x = x1 + (x0 - x1) * t / L, z = z1 + (z0 - z1) * t / L;
          if (Math.hypot(x - A.x, z - A.z) > A.r + 8 && sol(x, z) < A.y - 20) { bas = [x, z]; break; }
        }
      }
    }
    if (bas) {
      const dx = bas[0] - A.x, dz = bas[1] - A.z, L = Math.hypot(dx, dz) || 1;
      const hx = A.x + dx / L * (A.r - 3), hz = A.z + dz / L * (A.r - 3);
      CH = { bas, dx: dx / L, dz: dz / L, hx, hz };
    }
  }
  // un cercle de rochers dressés, ouvert vers le sentier et la Porte (au sud-est) et un peu au nord
  for (let k = 0; k < 22; k++) {
    const a = k / 22 * TAU + (rnd() - 0.5) * 0.15, dA = Math.abs(angDiff(a, 0));
    if (dA < 0.55 || Math.abs(angDiff(a, Math.PI)) < 0.18) continue;          // les deux brèches (repère local : 0 = vers la Porte)
    const rr = 34 + rnd() * 7, lx = Math.sin(a) * rr, lz = Math.cos(a) * rr, [x, z] = B.toWorld(f, lx, lz);
    if (CH && Math.hypot(x - CH.hx, z - CH.hz) < 10) continue;               // (le haut de la chaîne)
    const w = 2.6 + rnd() * 3.4, h = 3.5 + rnd() * 6, d = 2.4 + rnd() * 2.6;
    O.bloc(x, sol(x, z) - 1.5, z, w, h + 1.5, d, M_ROCK, f.r + a + (rnd() - 0.5) * 0.6, 0);
    if (rnd() < 0.45) O.bloc(x + (rnd() - 0.5) * 3, sol(x, z) - 0.6, z + (rnd() - 0.5) * 3, 1.4 + rnd() * 1.6, 1.2 + rnd() * 1.6, 1.4 + rnd() * 1.4, M_ROCK, rnd() * TAU, 0);
  }
  // le tas : de l'autre côté du corps lové, un peu en arrière (ce qu'il a pris à ceux qui sont venus)
  {
    const [x, z] = B.toWorld(fc, -14, -5);
    O.prop('v3_tas', x, sol(x, z), z, rnd() * TAU, {});
    O.inter('v3_tas', 'v3_tas', x, sol(x, z) + 1.4, z, V3_TEXTES.tasTitre, {});
    V.tas = { x, z };
  }
  // l'anneau scellé, la chaîne rompue : devant lui, du même côté que le tas
  {
    const [x, z] = B.toWorld(fc, -10, 13);
    O.prop('v3_anneau', x, sol(x, z), z, f.r + 0.4, {});
    O.inter('v3_lire', 'v3_anneau', x, sol(x, z) + 1.8, z, 'Lire ce qui est gravé', { texte: 'anneau' });
    V.anneau = { x, z };
  }
  // le dernier guetteur : contre un rocher, tout près de la tête du Ver endormi
  {
    const dx = tete[0] - cx, dz = tete[1] - cz, L = Math.hypot(dx, dz) || 1;
    const x = tete[0] + dx / L * 5, z = tete[1] + dz / L * 5, r = Math.atan2(-dx, -dz);
    O.bloc(x + dx / L * 1.6, sol(x, z) - 1, z + dz / L * 1.6, 3.2, 3.4, 2.2, M_ROCK, r, 0);
    O.prop('v3_guetteur', x, sol(x, z) + 0.02, z, r, {});
    O.inter('v3_reste', 'v3_reste', x, sol(x, z) + 0.8, z, V3_TEXTES.resteTitre, {});
    V.reste = { x, z };
  }
  // le collier (ouvert, après) : là où pend son cou quand il dort
  O.prop('v3_collier', cou[0], sol(cou[0], cou[1]), cou[1], rnd() * TAU, {});
  V.tete = { x: tete[0], z: tete[1] };
  // des os : ceux qui sont venus, leurs bêtes ; une très grande cage de côtes (de quoi ?)
  for (let k = 0; k < 16; k++) {
    const a = rnd() * TAU, rr = 18 + rnd() * 14, [x, z] = B.toWorld(f, Math.sin(a) * rr, Math.cos(a) * rr);
    if (Math.hypot(x - V.tas.x, z - V.tas.z) < 6 || Math.hypot(x - V.anneau.x, z - V.anneau.z) < 4 || Math.hypot(x - V.reste.x, z - V.reste.z) < 3 || (CH && Math.hypot(x - CH.hx, z - CH.hz) < 5)) continue;
    const r = rnd();
    if (r < 0.55) O.prop('v3_os', x, sol(x, z), z, rnd() * TAU, { g: 0.8 + rnd() * 0.6 });
    else if (r < 0.8) O.prop('v3_heaume', x, sol(x, z), z, rnd() * TAU, {});
    else O.prop('v3_cotes', x, sol(x, z), z, rnd() * TAU, { g: 0.9 + rnd() * 0.3 });
  }
  { const [x, z] = B.toWorld(f, -22, 6); O.prop('v3_cotes', x, sol(x, z) - 0.6, z, f.r + 1.2, { g: 3.2 }); }
  O.lieu('v3_aire', A.x, A.z, 40, V3_LIEUX.v3_aire);
  // la chaîne du Guet : elle pend du bord (un peu en dehors) jusqu'à deux mètres au-dessus du sentier
  if (CH) {
    const { bas, dx, dz, hx, hz } = CH, hy = sol(hx, hz), by = sol(bas[0], bas[1]);
    const ex = A.x + dx * (A.r + 3), ez = A.z + dz * (A.r + 3);
    O.prop('v3_chaine', ex, hy + 0.6, ez, 0, { dx: bas[0] - ex, dy: by + 2.2 - (hy + 0.6), dz: bas[1] - ez });
    O.inter('v3_chaine', 'v3_chaine_bas', bas[0], by + 1.2, bas[1], V3_TEXTES.chaineTitre, { to: [hx, hy, hz], sens: 'monter' });
    O.inter('v3_chaine', 'v3_chaine_haut', hx, hy + 1.0, hz, V3_TEXTES.chaineTitre, { to: [bas[0] - dx * 0.5, by, bas[1] - dz * 0.5], sens: 'descendre' });
    V.chaine = { bas: { x: bas[0], y: by, z: bas[1] }, haut: { x: hx, y: hy, z: hz } };
  }
  // ------------------------------------------------ les perchoirs
  const S0 = Z.size;
  for (const st of O.sites('V3')) {
    if (st.id === 'dragon_aire') continue;
    const yaw = Math.atan2(S0 / 2 - st.x, S0 * 0.55 - st.z), fp = { x: st.x, y: st.y, z: st.z, r: yaw };
    V.perchoirs[st.id] = { x: st.x, z: st.z, yaw };
    B.paintDisk(st.x, st.z, st.r - 2, M_V1_CENDRE, 5);
    const pose = (id, lx, lz, rr, data, s) => { const [x, z] = B.toWorld(fp, lx, lz); return O.prop(id, x, sol(x, z), z, yaw + (rr || 0), data, s); };
    const lire = (texte, lx, lz, h, nom) => { const [x, z] = B.toWorld(fp, lx, lz); O.inter('v3_lire', 'v3_' + texte, x, sol(x, z) + (h || 1.2), z, nom || 'Regarder', { texte }); };
    const ecaille = (lx, lz) => { const [x, z] = B.toWorld(fp, lx, lz); O.prop('v3_ecaille', x, sol(x, z), z, rnd() * TAU, { id: st.id }); O.inter('v3_ecaille', 'v3_ecaille_' + st.id, x, sol(x, z) + 0.4, z, V3_TEXTES.ecaille, { id: st.id }); };
    for (let k = 0; k < 4; k++) pose('v3_os', (rnd() < 0.5 ? -1 : 1) * (6 + rnd() * 4), (rnd() - 0.5) * 12, rnd() * TAU, { g: 0.7 + rnd() * 0.5 });
    switch (st.id) {
      case 'dragon_perchoir_1': pose('v3_borne', -8, 2, 0.3, {}); lire('borne', -8, 2, 1.6, 'Lire la borne'); break;
      case 'dragon_perchoir_2': pose('v3_griffes', 8, -3, 0.4, {}); lire('griffes', 8, -3, 1.4); ecaille(-7, 4); break;
      case 'dragon_perchoir_3': pose('v3_heaume', -7, -2, 0, {}); lire('heaume', -7, -2, 0.5); ecaille(6, 5); break;
      case 'dragon_perchoir_4': pose('v3_baliste', 8, 1, 0.6, {}); pose('v3_lance', 5, 6, 2.0, {}); lire('baliste', 8, 1, 1.3, 'Regarder l’arbalète'); break;
      case 'dragon_perchoir_5': pose('v3_encoches', -7, -4, 0.2, {}); lire('compte', -7, -4, 0.8, 'Regarder les encoches'); ecaille(7, 2); break;
      case 'dragon_perchoir_6': {
        // la loge du Guet : une cabane de pierre sans toit (des planches effondrées), la paillasse et le carnet ; la cloche dehors
        const lf = { x: 0, y: 0, z: 0, r: yaw };
        [lf.x, lf.z] = B.toWorld(fp, -9.5, -3); lf.y = sol(lf.x, lf.z);
        const W = 5.2, Dp = 4.4, H = 2.5, ep = 0.5, M = M_V1_PIERRE;
        const mur = (lx, lz, sx, sz, h) => { const [x, z] = B.toWorld(lf, lx, lz); O.bloc(x, sol(x, z) - 0.8, z, sx, h + 0.8, sz, M, lf.r, 0); };
        mur(0, -Dp / 2, W, ep, H); mur(-W / 2, 0, ep, Dp, H); mur(W / 2, 0, ep, Dp, H * 0.7);
        mur(-W / 2 + 0.9, Dp / 2, 1.8, ep, H); mur(W / 2 - 0.9, Dp / 2, 1.8, ep, H * 0.5);   // la porte au milieu (1,6 m de large)
        { const [x, z] = B.toWorld(lf, 0.6, -0.3); O.bloc(x, sol(x, z) + 0.15, z, 3.8, 0.12, 0.5, M_PLANKS, lf.r + 0.5, 0); }
        { const [x, z] = B.toWorld(lf, -0.9, -0.9); O.prop('v3_grabat', x, sol(x, z) + 0.02, z, lf.r + Math.PI / 2, {}); O.inter('v3_carnet', 'v3_carnet', x, sol(x, z) + 0.6, z, V3_TEXTES.carnetTitre, {}); }
        { const [x, z] = B.toWorld(fp, 8, -2); O.prop('v3_cloche', x, sol(x, z), z, yaw, {}); O.inter('v3_cloche', 'v3_cloche', x, sol(x, z) + 1.4, z, V3_TEXTES.clocheTitre, {}); V.cloche = { x, z }; }
        O.lieu('v3_loge', lf.x, lf.z, 18, V3_LIEUX.v3_loge);
        V.loge = { x: lf.x, z: lf.z };
        break;
      }
    }
  }
  // ------------------------------------------------ la cendre et l'herbe brûlée des jours d'avant (elles repoussent)
  if (S) {
    const jour = farm.s.day;
    for (const k in S.brule) {
      const e = S.brule[k], o = Z.objects[+k];
      if (!e || jour - e[0] > V3.repousse) { delete S.brule[k]; continue; }
      if (!o || Math.round(o.x) !== e[1] || Math.round(o.z) !== e[2]) { delete S.brule[k]; continue; }
      o.gone = true;
      B.paintDisk(o.x, o.z, 1.2, M_V1_CENDRE, 1.2);
    }
    S.traces = S.traces.filter((t) => jour - t[4] <= V3.repousse);
    for (const t of S.traces) B.paintLine(t[0], t[1], t[2], t[3], 2.4, M_V1_CENDRE);
  }
});

// ---------------------------------------------------------------- les interactions (E)
const v3Lire = (texte) => {
  const S = dragonV3.S();
  S.lus[texte] = farm.s.day;
  ui.read(V3_TEXTES[texte + 'Titre'] || '', V3_TEXTES[texte]);
};
HOOKS.inter.v3_lire = (it) => {
  const t = it.data.texte;
  if (t === 'anneau') { ui.choice(V3_TEXTES.anneauTitre, V3_TEXTES.anneauVoir, [{ label: 'Lire', fn: () => { ui.close(); v3Lire('anneau'); } }, { label: 'Laisser', fn: () => ui.close() }]); return; }
  v3Lire(t);
};
// le tas : on fouille (cela fait du bruit ; s'il dort tout près, il peut ouvrir un œil)
HOOKS.inter.v3_tas = (it) => {
  const S = dragonV3.S();
  if (S.tas >= 6) { ui.choice(V3_TEXTES.tasTitre, V3_TEXTES.tasVide, [{ label: 'Laisser', fn: () => ui.close() }]); return; }
  ui.choice(V3_TEXTES.tasTitre, V3_TEXTES.tas, [
    { label: V3_TEXTES.tasFouiller, fn: () => { ui.close(); dragonV3.fouiller(it); } },
    { label: 'Laisser', fn: () => ui.close() },
  ]);
};
HOOKS.inter.v3_reste = (it) => {
  const S = dragonV3.S();
  if (S.cle) { ui.choice(V3_TEXTES.resteTitre, V3_TEXTES.resteSans, [{ label: 'Laisser', fn: () => ui.close() }]); return; }
  ui.choice(V3_TEXTES.resteTitre, V3_TEXTES.reste, [
    { label: V3_TEXTES.resteCle, fn: () => { ui.close(); dragonV3.prendreCle(it); } },
    { label: 'Laisser', fn: () => ui.close() },
  ]);
};
HOOKS.inter.v3_ecaille = (it) => {
  const S = dragonV3.S(), id = it.data.id;
  if (S.ecailles[id]) return;
  S.ecailles[id] = farm.s.day;
  farm.give('v3_ecaille', 1);
  play.flyer('v3_ecaille', [it.x, it.y, it.z], 1);
  farm.dirtyProps = true;
  sound.pop && sound.pop();
};
HOOKS.interVis.v3_ecaille = (it) => zone.dedans && !dragonV3.S().ecailles[it.data.id];
HOOKS.inter.v3_carnet = () => {
  const S = dragonV3.S();
  dragonV3.lireCarnet();
  if (!S.carnet) { S.carnet = farm.s.day; farm.give('v3_carnet', 1); farm.dirtyProps = true; }
};
HOOKS.interVis.v3_carnet = () => zone.dedans && !dragonV3.S().carnet;
HOOKS.inter.v3_cloche = (it) => {
  ui.choice(V3_TEXTES.clocheTitre, V3_TEXTES.cloche, [
    { label: V3_TEXTES.clocheSonner, fn: () => { ui.close(); dragonV3.sonner(it); } },
    { label: 'Laisser', fn: () => ui.close() },
  ]);
};
// la chaîne du Guet : on monte (ou l'on descend) ; le fer tinte (s'il dort là-haut, il peut l'entendre)
HOOKS.inter.v3_chaine = (it) => {
  const monter = it.data.sens === 'monter';
  ui.choice(V3_TEXTES.chaineTitre, monter ? V3_TEXTES.chaine : V3_TEXTES.chaineHaut, [
    { label: monter ? V3_TEXTES.chaineMonter : V3_TEXTES.chaineDescendre, fn: () => { ui.close(); dragonV3.grimper(it); } },
    { label: 'Laisser', fn: () => ui.close() },
  ]);
};
for (const k of ['v3_lire', 'v3_tas', 'v3_reste', 'v3_cloche', 'v3_chaine']) HOOKS.interVis[k] = () => zone.dedans;
// le carnet, en main (clic) : on le relit
HOOKS.primary.push((eye, basis, held, it, id) => { if (id !== 'v3_carnet' || held) return false; dragonV3.lireCarnet(); return true; });

// ---------------------------------------------------------------- ce qu'on fait là-haut
Object.assign(dragonV3, {
  async grimper(it) {
    const p = game.player, to = it.data.to, monter = it.data.sens === 'monter';
    if (game.sleeping || !to) return;
    game.sleeping = true;
    if (typeof sonV3 !== 'undefined') sonV3.chaine([it.x, it.y + 2, it.z], 0);
    await ui.fade(true, monter ? V3_TEXTES.monte : V3_TEXTES.descend, 1400);
    await new Promise((r) => setTimeout(r, monter ? 1600 : 900));
    p.pos = [to[0], zone.Z.groundAt(to[0], to[2], to[1] + 1, 0.8) + 0.05, to[2]]; p.vel = [0, 0, 0];
    game.renderer.uploadCover(p.pos[0], p.pos[2]);
    // en haut, le dernier maillon tinte contre la roche
    if (monter) { furtif.bruit(to[0], to[1], to[2], 7, 'chaine'); this.remuer(to[0], to[2], 0.15); if (typeof sonV3 !== 'undefined') sonV3.chaine(to, 0); }
    await ui.fade(false, '', 900);
    game.sleeping = false;
  },
  lireCarnet() {
    this.S().lus.carnet = farm.s.day;
    ui.read('Le carnet du Guet', V3_TEXTES.carnet.join('\n\n') + '\n\n' + V3_TEXTES.carnetSigne);
  },
  // un bruit près de lui pendant qu'il dort : il peut ouvrir un œil (le soupçon monte un peu)
  remuer(x, z, force) {
    const D = this.D;
    if (!D || D.mode !== 'dort' || !D.furtif) return;
    const d = Math.hypot(D.x - x, D.z - z);
    if (d > 45) return;
    D.furtif.soupcon = Math.min(2, D.furtif.soupcon + force * (1 - d / 45));
    D.furtif.dernier = { x, y: zone.Z.heightAt(x, z), z, t: game.time, vu: false };
  },
  fouiller(it) {
    const S = this.S();
    S.tas++;
    for (const [k, n] of rollLoot('v3_tas')) { if (k === 'argent') { farm.earn(n); sound.coin && sound.coin(); } else { farm.give(k, n); play.flyer(k, [it.x, it.y, it.z], n); } }
    furtif.bruit(it.x, it.y, it.z, 11, 'fer');
    this.remuer(it.x, it.z, 0.3);
    if (typeof sonV3 !== 'undefined') sonV3.ferraille([it.x, it.y, it.z]);
    farm.dirtyProps = true;
  },
  prendreCle(it) {
    const S = this.S();
    S.cle = farm.s.day;
    farm.give('v3_cle_collier', 1);
    play.flyer('v3_cle_collier', [it.x, it.y, it.z], 1);
    furtif.bruit(it.x, it.y, it.z, 4, 'cle');
    this.remuer(it.x, it.z, Math.random() < 0.3 ? 0.42 : 0.12);
    if (typeof sonV3 !== 'undefined') sonV3.os([it.x, it.y, it.z]);
    farm.dirtyProps = true;
  },
  // la cloche du Guet : il rentre (le jour) ; la nuit, rien ne répond
  sonner(it) {
    const S = this.S(), D = this.D, h = this.heure(), H = V3.heures;
    this.clocheT = game.time;
    if (typeof sonV3 !== 'undefined') sonV3.cloche([it.x, it.y + 2, it.z]);
    furtif.bruit(it.x, it.y, it.z, 70, 'cloche');
    S.cloches = (S.cloches || 0) + 1;
    if (h >= H.coucher || h < H.reveil || !D || S.fin) { setTimeout(() => ui.subtitle('', V3_TEXTES.clocheNuit, 4), 2500); return; }
    S.rappel = farm.s.hours + 2.2;
    if (this.enAttaque() || D.furtif.etat === 'alertee') return;
    if (D.mode === 'vol') { D.phase = 'retour'; D.cible = this.lieux().aire; }
    else if (D.mode === 'pose' && !(D.ou && D.ou.aire)) { D.timer = 0; this.envol('retour'); D.cible = this.lieux().aire; }
  },

  // ------------------------------------------------------------- le collier (la délivrance)
  collierPos() { const R = this.rig; return R && this.D && this.D.matOk ? v3Pt(R.part('collier').W, 0, -1.2, 0) : null; },
  toucherCollier() {
    const S = this.S(), D = this.D;
    if (!D || D.mode !== 'dort') return;
    if (!farm.count('v3_cle_collier')) { ui.choice(V3_TEXTES.collierTitre, V3_TEXTES.collier + '\n\n' + V3_TEXTES.collierSans, [{ label: 'Reculer', fn: () => ui.close() }]); return; }
    ui.choice(V3_TEXTES.collierTitre, V3_TEXTES.collier, [
      { label: V3_TEXTES.collierOuvrir, fn: () => { ui.close(); this.delivrer(); } },
      { label: 'Reculer', fn: () => ui.close() },
    ]);
  },
  async delivrer() {
    const S = this.S(), D = this.D, p = game.player;
    if (!D || S.fin) return;
    S.fin = 'delivre'; S.finJour = farm.s.day;
    farm.take('v3_cle_collier', 1);
    furtif.oublier(D);
    const col = this.collierPos() || [D.x, D.y + 3, D.z];
    if (typeof sonV3 !== 'undefined') sonV3.collier(col);
    const e = p.eyePos(), tete = this.oeil();
    D.phase = 'parti0'; D.reveilT = 0;
    farm.dirtyProps = true;
    const vue = (pos, look) => cine.vue(pos, look);
    const aire = this.lieux().aire;
    await cine.jouer([
      // le collier tombe ; l'œil s'ouvre
      { dur: 3.2, de: vue(e, col), a: vue([e[0], e[1] - 0.2, e[2]], tete), chaque: (t) => { D.reveilT = t; } },
      // il se lève, il regarde
      { dur: 3.4, de: vue([e[0], e[1] + 0.3, e[2]], tete), a: vue([e[0], e[1] + 0.6, e[2]], [tete[0], tete[1] + 6, tete[2]]),
        debut: () => { this.poser(aire, 'parti1'); D.regardY = 0; D.regardP = 0.2; if (typeof sonV3 !== 'undefined') sonV3.respire(this.bouche(), 5, false); } },
      // il s'en va
      { dur: 5.5, de: vue([e[0], e[1] + 1, e[2]], [D.x, D.y + 10, D.z]), a: vue([e[0], e[1] + 1, e[2]], [D.x, D.y + 60, D.z - 40]),
        debut: () => { this.envol('parti'); D.phase = 'parti'; D.v = 8; D.vy = 9; } },
      { dur: 3.0, fondu: 'noir' },
    ], { passer: false });
    setTimeout(() => ui.subtitle('', V3_TEXTES.delivre, 4.5), 600);
    // il est parti : plus rien dans le ciel
    this.D = null;
    farm.save();
  },
  // le départ (après la délivrance) : il monte, vers le nord, par-dessus les montagnes
  majDepart(dt) {
    const D = this.D;
    D.yaw += angDiff(D.yaw, Math.PI) * Math.min(1, dt * 0.5);
    D.v = Math.min(36, D.v + dt * 6); D.vy = 14;
    D.x += Math.sin(D.yaw) * D.v * dt; D.z += Math.cos(D.yaw) * D.v * dt; D.y += D.vy * dt;
    D.battement += TAU * 0.7 * dt; D.ampl = 1; D.plane = 0;
  },

  // ------------------------------------------------------------- les coups (presque toujours en vain)
  frappe(s, dmg, from) {
    const S = this.S(), D = this.D;
    if (!D || S.fin) return;
    const F = D.furtif, p = game.player;
    // touché : il sait d'où ça vient
    if (F) { F.soupcon = 2; F.dernier = { x: p.pos[0], y: p.pos[1], z: p.pos[2], t: game.time, vu: true }; }
    const pt = s && s.part === 'plaie' ? this.plaiePos() : this.oeil();
    if (!s || s.part !== 'plaie') {
      if (typeof sonV3 !== 'undefined') sonV3.ricochet(pt);
      if (!S.ricochet) { S.ricochet = 1; setTimeout(() => ui.subtitle('', V3_TEXTES.ricochet, 3), 400); }
      for (let k = 0; k < 6; k++) particles.spawn(pt[0], pt[1], pt[2], (Math.random() - 0.5) * 6, Math.random() * 4, (Math.random() - 0.5) * 6, [1, 0.85, 0.5, 1], 0.05, 0.3, 9, true);
    } else {
      S.pv = Math.max(0, S.pv - dmg); S.blesse = farm.s.hours;
      for (let k = 0; k < 14; k++) particles.spawn(pt[0], pt[1], pt[2], (Math.random() - 0.5) * 3, Math.random() * 2, (Math.random() - 0.5) * 3, [0.45, 0.06, 0.04, 1], 0.12, 1.2, 9, false);
      if (typeof sonV3 !== 'undefined') sonV3.blesse([D.x, D.y, D.z], D.dist);
      if (S.pv <= 0) { this.mourir(); return; }
    }
    // réveillé, furieux
    if (D.mode === 'dort') { D.phase = 'reveil'; D.timer = 1.2; }
    else if (!this.enAttaque()) { if (D.mode === 'pose') this.attaquePosee(); else this.planAttaque(); }
  },
  plaiePos() { const R = this.rig; return R && this.D && this.D.matOk ? v3Pt(R.part('plaie').W, 0, 0, 0) : [this.D.x, this.D.y, this.D.z]; },
  // guérir avec le temps (deux jours)
  guerir() {
    const S = this.S();
    if (S.pv >= V3.pv || !S.blesse) return;
    const h = farm.s.hours - S.blesse;
    S.pv = Math.min(V3.pv, S.pv + h / (V3.guerison * 24) * V3.pv);
    S.blesse = farm.s.hours;
  },
  mourir() {
    const S = this.S(), D = this.D;
    if (S.fin) return;
    this.fermerFeu();
    furtif.oublier(D);
    if (typeof sonV3 !== 'undefined') sonV3.meurt([D.x, D.y, D.z], D.dist);
    D.mode = 'vol'; D.phase = 'chute'; D.chute = { vy: Math.min(D.vy, 0), t: 0 };
    S.fin = 'tue'; S.finJour = farm.s.day;
  },
  // la chute (en vol) ou l'effondrement (au sol), puis le corps
  majCorps(dt) {
    const D = this.D;
    if (D.phase === 'mort') return;
  },
});
// la chute (gérée avant le reste de update)
{
  const _up = dragonV3.update.bind(dragonV3);
  dragonV3.update = function (dt) {
    const D = this.D;
    if (D && D.phase === 'chute' && zone.dedans) { this.majChute(dt); return; }
    return _up(dt);
  };
  dragonV3.majChute = function (dt) {
    const D = this.D, Z = zone.Z, C = D.chute;
    C.t += dt;
    const g = Math.max(Z.heightAt(D.x, D.z), Z.waterLevel);
    if (D.y - V3_HAUT.mort <= g + 0.2 || C.t > 25) {
      D.y = g + V3_HAUT.mort; D.mode = 'mort'; D.phase = 'mort'; D.pitch = 0; D.roll = 0;
      this.S().mort = { x: Math.round(D.x * 10) / 10, y: Math.round(D.y * 10) / 10, z: Math.round(D.z * 10) / 10, yaw: Math.round(D.yaw * 100) / 100 };
      if (typeof sonV3 !== 'undefined') sonV3.atterrit([D.x, g, D.z], D.dist, 2);
      this.secousse(D.dist, 200, 1);
      puffAt(D.x, g + 0.5, D.z, [110, 100, 90], 60, 16, false);
      setTimeout(() => ui.subtitle('', V3_TEXTES.tue, 5), 3500);
      farm.save();
      return;
    }
    C.vy -= 9.8 * dt;
    D.v = Math.max(0, D.v - dt * 4);
    D.x += Math.sin(D.yaw) * D.v * dt; D.z += Math.cos(D.yaw) * D.v * dt; D.y += Math.max(C.vy, -40) * dt;
    D.roll = lerp(D.roll, 1.1, dt * 0.6); D.pitch = lerp(D.pitch, -0.5, dt * 0.5);
    D.plane = 1; D.ampl = 0;
    D.dist = Math.hypot(D.x - game.player.pos[0], D.y - game.player.pos[1], D.z - game.player.pos[2]);
  };
}

// ---------------------------------------------------------------- E : le collier (il dort), son corps (mort)
zone.sur('target', (eye, f, cand) => {
  const D = dragonV3.D;
  if (!D || !D.matOk) return;
  if (D.mode === 'dort' && D.furtif && D.furtif.etat !== 'alertee') {
    const c = dragonV3.collierPos();
    if (!c) return;
    const dx = c[0] - eye[0], dy = c[1] - eye[1], dz = c[2] - eye[2], d = Math.hypot(dx, dy, dz);
    if (d < 3.8 && (dx * f[0] + dy * f[1] + dz * f[2]) / d > 0.6) cand({ kind: 'hook', use: () => dragonV3.toucherCollier(), f2lab: V3_TEXTES.collierTitre }, d * 0.9);
  } else if (D.mode === 'mort') {
    for (const nm of ['tete', 'poitrine', 'ventre']) {
      const c = v3Pt(dragonV3.rig.part(nm).W, 0, 0, 1.5), dx = c[0] - eye[0], dy = c[1] - eye[1], dz = c[2] - eye[2], d = Math.hypot(dx, dy, dz);
      if (d < 5 && (dx * f[0] + dy * f[1] + dz * f[2]) / d > 0.5) { cand({ kind: 'hook', use: () => dragonV3.corps(nm), f2lab: V3_TEXTES.corpsTitre }, d * 0.9); break; }
    }
  }
});
Object.assign(dragonV3, {
  corps(part) {
    const S = this.S(), C = S.corps;
    const opts = [];
    if (!C.coeur && part !== 'tete') opts.push({ label: V3_TEXTES.corpsCoeur, fn: () => { ui.close(); C.coeur = 1; farm.give('v3_coeur', 1); play.flyer('v3_coeur', this.oeil(), 1); } });
    if ((C.ecailles || 0) < 4) opts.push({ label: V3_TEXTES.corpsEcaille, fn: () => { ui.close(); C.ecailles = (C.ecailles || 0) + 1; farm.give('v3_ecaille', 1); play.flyer('v3_ecaille', this.oeil(), 1); } });
    if (part === 'tete' && (C.dents || 0) < 3) opts.push({ label: V3_TEXTES.corpsDent, fn: () => { ui.close(); C.dents = (C.dents || 0) + 1; farm.give('v3_dent', 1); play.flyer('v3_dent', this.oeil(), 1); } });
    opts.push({ label: 'Laisser', fn: () => ui.close() });
    ui.choice(V3_TEXTES.corpsTitre, opts.length > 1 ? V3_TEXTES.corps : V3_TEXTES.corps + '\n\n' + V3_TEXTES.corpsRien, opts);
  },
});
// guérir à l'entrée (et après un repos)
zone.sur('entrer', () => dragonV3.guerir());

// ---------------------------------------------------------------- ce qu'on en dit dans la vallée
{
  const tous = () => NPC_DATA.concat(typeof C2_HABITANTS !== 'undefined' ? C2_HABITANTS.filter((d) => !NPC_DATA.includes(d)) : []);
  for (const id in V3_RUMEURS) {
    const d = tous().find((x) => x.id === id);
    if (d && d.lines && Array.isArray(d.lines.rumeurs)) for (const l of V3_RUMEURS[id]) if (!d.lines.rumeurs.includes(l)) d.lines.rumeurs.push(l);
  }
  if (typeof NPC_GENERIC !== 'undefined' && Array.isArray(NPC_GENERIC.rumeurs)) for (const l of V3_RUMEURS_TOUS) NPC_GENERIC.rumeurs.push(l);
}
// après la délivrance : un matin, dans la vallée, une écaille sur le seuil
HOOKS.day.push(() => {
  if (typeof zone !== 'undefined' && zone.dedans) return;
  const S = farm.s && farm.s.v3;
  if (!S || S.fin !== 'delivre' || S.cadeau || farm.s.day <= (S.finJour || 0)) return;
  S.cadeau = farm.s.day;
  farm.give('v3_ecaille', 1);
  setTimeout(() => ui.subtitle('', '(' + V3_TEXTES.cadeau + ')', 6), 3000);
});
