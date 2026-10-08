// ============================================================================
//  BASSE-FOSSE (agent V5) — les trois fins (une seule, pour toujours)
//  - La plume (« compte ») : compté, ayant rendu son nom au Greffier, on prend
//    la plume au registre. Le Greffier se couche et ne se relève pas ; on tient
//    le compte : les gens d'en bas ne vous dénoncent plus.
//  - La Cloche du Jour (« remontee ») : le battant remis, on la sonne au matin ;
//    ils remontent tous par le Septième Degré et la tonnellerie, les morts portés
//    d'abord ; la ville reste vide, ses feux allumés.
//  - Le feu du compte (« extinction ») : la cendre froide des Cendrières jetée
//    sur le feu du compte ; les feux s'éteignent rue après rue ; les gens d'en bas
//    se couchent là où ils sont, auprès de leurs morts.
//  Chacune a sa scène (cine.jouer), puis un épilogue. farm.s.v5.fin la retient.
//  Les autres agents la lisent : zone.catacombes.fin().
// ============================================================================
const finsV5 = {
  peutPrendrePlume() {
    const S = catacombesV5.S();
    return !S.fin && !!S.compte && !!S.nom && habitantsV5.greffierVivant();
  },
  // une scène : des plans, puis l'épilogue ; le joueur ne bouge pas pendant ce temps
  async scene(plans, titre, epilogue) {
    try { if (typeof cine !== 'undefined' && cine.jouer) await cine.jouer(plans, { passer: true }); }
    catch (e) { console.error(e); }
    catacombesV5.cielForce = null;
    sound.page && sound.page();
    ui.read(titre, epilogue);
  },
  // ------------------------------------------------------------- la plume
  async compte() {
    const S = catacombesV5.S(), v = catacombesV5.Z();
    if (!this.peutPrendrePlume() || !v) return;
    S.fin = 'compte'; S.finJour = farm.s.day;
    farm.give('v5_plume', 1);
    const T = v.temple, F = v.F, g = habitantsV5.L.find((e) => e.role === 'greffier');
    const [rx, rz] = T.registre, fl = T.fl;
    const [ax, az] = v5Monde(T.f, -1.5, 3.5), [bx, bz] = v5Monde(T.f, 1.0, 1.0);
    const [lx, lz] = v.greffe.lit;
    farm.save();
    await this.scene([
      { dur: 5, de: { pos: [ax, F + fl + 2.2, az], look: [rx, F + fl + 1.2, rz] }, a: { pos: [bx, F + fl + 1.8, bz], look: [rx, F + fl + 1.0, rz] }, texte: '« Il faut quelqu’un pour compter. »', qui: 'Le Greffier',
        debut: () => { if (g) { g.x = rx; g.z = rz; g.y = F + fl; g.pose = 'ecrit'; } } },
      { dur: 5, de: { pos: [lx + 2.5, F + fl + 2.0, lz + 2.5], look: [lx, F + fl + 0.6, lz] }, a: { pos: [lx + 1.6, F + fl + 1.6, lz + 1.4], look: [lx, F + fl + 0.5, lz] }, texte: 'Il se couche, les mains sur la poitrine, et il ferme les yeux.',
        debut: () => { if (g) { g.mort = true; habitantsV5.placerCouche(g); } } },
      { dur: 3, fondu: 'noir', texte: 'Quatre cent douze.' },
    ], V5_TEXTES.finCompteTitre, V5_TEXTES.epilogueCompte);
  },
  // ------------------------------------------------------------- la Cloche du Jour
  async remontee() {
    const S = catacombesV5.S(), v = catacombesV5.Z();
    if (S.fin || !S.battant || !v) return;
    S.fin = 'remontee'; S.finJour = farm.s.day;
    const F = v.F, T = v.temple, [cx, cz] = T.cloche;
    const [g0x, g0z] = v5Monde(v.CF, 0, V5_PLAN.MUR - 18), [g1x, g1z] = v5Monde(v.CF, 0, V5_PLAN.MUR - 2);
    const Tn = v.tonnellerie, [s0x, s0z] = v5Monde(Tn.f, 0, 14), [s1x, s1z] = v5Monde(Tn.f, -1.2, 0.6);
    // la procession : les vivants sur la Grande-Rue, vers la porte ; puis, en haut, sur le seuil de la tonnellerie
    const vivants = habitantsV5.L.filter((e) => !e.mort && !e.parti);
    const placer = (z0, pas) => vivants.forEach((e, k) => { const [x, z] = v5Monde(v.CF, (k % 2 ? 1 : -1) * 0.9, z0 - k * pas); e.x = x; e.z = z; e.y = F; e.heading = v.aG; e.pose = 'debout'; e.chemin = null; e.mode = 'procession'; });
    farm.save();
    await this.scene([
      { dur: 5, de: { pos: [cx + 3, F + 2.4, cz + 3], look: [cx, F + 1.2, cz] }, a: { pos: [cx + 4.5, F + 3.2, cz + 4.5], look: [cx, F + 1.6, cz] }, texte: '',
        debut: () => { sonV5.grandeCloche([cx, F + 1.5, cz]); setTimeout(() => sonV5.grandeCloche([cx, F + 1.5, cz]), 3200); } },
      { dur: 7, de: { pos: [g1x, F + 2.0, g1z], look: [g0x, F + 1.4, g0z] }, a: { pos: [g1x, F + 2.6, g1z], look: [g0x, F + 1.0, g0z] }, texte: 'Les morts d’abord.',
        debut: () => placer(V5_PLAN.MUR - 20, 2.2),
        chaque: (t, dt) => { for (const e of vivants) { e.x += Math.sin(v.aG) * 0.9 * dt; e.z += Math.cos(v.aG) * 0.9 * dt; e.vitesse = 0.9; e.phase += 0.9 * dt * 2.6; e.t += dt; } } },
      { dur: 7, de: { pos: [s0x, Tn.y + 2.4, s0z], look: [s1x, Tn.y + 1.2, s1z] }, a: { pos: [s0x, Tn.y + 3.0, s0z], look: [s1x, Tn.y + 1.6, s1z] }, texte: '',
        debut: () => { catacombesV5.cielForce = 'jour'; vivants.forEach((e, k) => { const [x, z] = v5Monde(Tn.f, -1.2 + (k % 3 - 1) * 0.8, 0.6 - Math.floor(k / 3) * 1.0); e.x = x; e.z = z; e.y = Tn.y; e.heading = Tn.f.r; e.vitesse = 0; e.pose = 'debout'; e.mains = true; }); },
        chaque: (t, dt) => { for (const e of vivants) { e.x += Math.sin(Tn.f.r) * 0.5 * dt; e.z += Math.cos(Tn.f.r) * 0.5 * dt; e.vitesse = 0.5; e.phase += dt * 1.3; e.t += dt; } } },
      { dur: 3, fondu: 'noir', texte: '' },
    ], V5_TEXTES.finRemonteeTitre, V5_TEXTES.epilogueRemontee);
    for (const e of habitantsV5.L) { e.parti = true; e.mode = null; }
    catacombesV5.cielForce = null;
  },
  // ------------------------------------------------------------- le feu du compte
  async extinction() {
    const S = catacombesV5.S(), v = catacombesV5.Z();
    if (S.fin || !v || !farm.count('v5_cendre_froide')) return;
    farm.take('v5_cendre_froide', 1);
    S.fin = 'extinction'; S.finJour = farm.s.day;
    const F = v.F, T = v.temple, [fx, fz] = T.feu, fl = T.fl;
    const [ax, az] = v5Monde(T.f, 2.8, 2.6), [hx, hz] = v5Monde(v.CF, 18, 70), [nx, nz] = v5Monde(v.CF, 0, 20);
    const eteindre = (q) => { if (!q) return; q.data = Object.assign({}, q.data, { lit: false }); farm.dirtyProps = true; };
    const feux = v.feux.slice().sort((a, b) => Math.hypot(a.x - fx, a.z - fz) - Math.hypot(b.x - fx, b.z - fz));
    let k = 0, tt = 0;
    farm.save();
    await this.scene([
      { dur: 5, de: { pos: [ax, F + fl + 1.9, az], look: [fx, F + fl + 1.0, fz] }, a: { pos: [ax, F + fl + 1.6, az], look: [fx, F + fl + 0.8, fz] }, texte: '',
        debut: () => { for (let i = 0; i < 40; i++) particles.spawn(fx + (Math.random() - 0.5) * 2, F + fl + 1.4 + Math.random(), fz + (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 0.8, -0.5 - Math.random(), (Math.random() - 0.5) * 0.8, [0.55, 0.53, 0.5, 0.9], 0.08, 2.5, 0.6, false); setTimeout(() => { eteindre(v.refs.feuCompte); zone.Z.collectLights(); sound.splash && sound.splash(); }, 1600); } },
      { dur: 9, de: { pos: [hx, F + 9, hz], look: [nx, F + 1, nz] }, a: { pos: [hx - 6, F + 11, hz - 6], look: [nx, F, nz] }, texte: '',
        chaque: (t, dt) => { tt += dt; while (k < feux.length && tt > 0.6 + k * 0.55) { eteindre(feux[k]); k++; zone.Z.collectLights(); } } },
      { dur: 3, fondu: 'noir', texte: '' },
    ], V5_TEXTES.finExtinctionTitre, V5_TEXTES.epilogueExtinction);
    for (const q of v.feux) eteindre(q);
    for (const q of v.chandelles) eteindre(q);
    zone.Z.collectLights();
    for (const e of habitantsV5.L) { if (e.parti) continue; e.couche = true; e.coucheEnRue = true; e.pose = 'couche'; e.chemin = null; e.mode = null; e.y = e.y || F; }
  },
};
// le ciel, pendant une scène qui remonte au jour
{
  const _ciel = catacombesV5.ciel.bind(catacombesV5);
  catacombesV5.ciel = function (sky) { if (this.cielForce === 'jour') return; return _ciel(sky); };
}
// les fins se voient au chargement : les feux éteints, les chandelles mortes
zone.passe('V5-fins', (Z) => {
  const S = typeof farm !== 'undefined' && farm.s ? farm.s.v5 || {} : {};
  if (!Z.v5 || S.fin !== 'extinction') return;
  for (const q of Z.v5.chandelles) q.data = Object.assign({}, q.data, { lit: false });
});
