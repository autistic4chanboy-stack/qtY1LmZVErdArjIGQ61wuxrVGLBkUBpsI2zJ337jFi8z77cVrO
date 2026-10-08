// ============================================================================
//  LES TERRES D'AVANT (agent V1) — les lieux : la Porte de ce côté, les feux de
//  veille, les stèles
//  - La Porte, vue de la Zone : on la repasse quand on veut (E) — de ce côté,
//    ni serrure ni barre.
//  - Les feux de veille : un cercle de pierres noires, une lame plantée dans la
//    cendre. E : l'allumer (la première fois), s'y reposer. Se reposer rend la
//    vie et le souffle, arrête les saignements, fait passer la nuit si c'est la
//    nuit, et enregistre la partie ; c'est là qu'on se réveille si l'on s'effondre.
//    Les créatures de la Zone reviennent quand on se repose (zone.sur('repos')).
//  État : farm.s.zone.feux { id: jour où on l'a allumé }, farm.s.zone.feu (le dernier).
// ============================================================================
const feuxV1 = {
  // le feu d'un objet posé (o.data.id) est-il allumé ?
  allume(o) { const id = o && o.data && o.data.id; return !!(id && zone.S().feux[id]); },
  liste() { const Z = zone.Z; return Z ? Z.props.filter((q) => q.id === 'v1_feu') : []; },
  dernier() { const id = zone.S().feu; return id ? this.liste().find((q) => q.data && q.data.id === id) || null : null; },
  // E sur un feu
  toucher(it) {
    const S = zone.S(), id = it.data.id, q = this.liste().find((p) => p.data && p.data.id === id);
    if (!q) return;
    if (!S.feux[id]) {
      ui.choice('Un feu de veille', 'Un cercle de pierres noires. Une lame rouillée plantée dans la cendre, jusqu’à la garde. La cendre est tiède, à peine.', [
        { label: 'Souffler sur la braise', fn: () => { ui.close(); this.allumer(q); } },
        { label: 'Laisser', fn: () => ui.close() },
      ]);
      return;
    }
    ui.choice('Le feu de veille', 'Le feu tient. Il ne réchauffe pas beaucoup, mais il tient.', [
      { label: 'S’asseoir et se reposer', fn: () => { ui.close(); this.reposer(q); } },
      { label: 'Repartir', fn: () => ui.close() },
    ]);
  },
  allumer(q) {
    const S = zone.S();
    S.feux[q.data.id] = farm.s.day; S.feu = q.data.id;
    zone.setPropData(q, { lit: true });
    zone.Z.collectLights();
    if (typeof sonV1 !== 'undefined') sonV1.feu([q.x, q.y + 0.5, q.z]);
    farm.save();
  },
  async reposer(q) {
    if (game.sleeping || game.dying) return;
    const S = zone.S(), p = game.player;
    S.feu = q.data.id;
    game.sleeping = true;
    await ui.fade(true, '', 1100);
    // la nuit passe si c'est la nuit ; sinon une heure
    const w = farm.w, h = w.time * 24;
    if (h >= 19 || h < 5) { const hn = ((0.27 - w.time + 1) % 1) * 24; game.skipHours(hn); if (w.time > 0.27) { w.time = 0.25; game.dayStart(); } w.time = 0.27; }
    else { game.skipHours(1); w.time += 1 / 24; }
    p.hp = 100; p.stamina = 1;
    if (typeof corps !== 'undefined' && corps.panser) try { corps.panser(); } catch (e) { /* */ }
    zone.annoncer('repos', q);
    farm.save();
    await new Promise((r) => setTimeout(r, 900));
    await ui.fade(false, '', 1200);
    game.sleeping = false;
  },
};

// ---------------------------------------------------------------- la Porte, de ce côté-ci
zone.ouvPorte = 0;
zone.repasser = function () {
  ui.choice('La Grande Porte', V1_TEXTES.seuilRetour, [
    { label: 'Repasser la Porte, vers la vallée', fn: async () => { ui.close(); zone.ouvPorteT = 3; if (typeof sonV1 !== 'undefined') sonV1.vantail([zone.Z.v1.porte.x, zone.Z.v1.porte.y + 4, zone.Z.v1.porte.z]); await new Promise((r) => setTimeout(r, 1000)); await zone.sortir(); } },
    { label: 'Rester', fn: () => ui.close() },
  ]);
};
HOOKS.update.push(Object.assign((dt) => {
  zone.ouvPorteT = Math.max(0, (zone.ouvPorteT || 0) - dt);
  zone.ouvPorte += clamp((zone.ouvPorteT > 0 ? 1.1 : 0.05) - zone.ouvPorte, -dt * 0.35, dt * 0.35);
}, { zoneSeule: true }));

// ---------------------------------------------------------------- génération : les feux de veille (une passe V1, avant les autres)
const V1_FEUX = [
  { id: 'feu_seuil', x: 0.508, z: 0.915 },
  { id: 'feu_bois', x: 0.27, z: 0.745 },
  { id: 'feu_cendres', x: 0.205, z: 0.47 },
  { id: 'feu_ville', x: 0.485, z: 0.585 },
  { id: 'feu_ravines', x: 0.745, z: 0.665 },
  { id: 'feu_degres', x: 0.505, z: 0.40 },
];
zone.passe('V1-feux', (Z, O) => {
  const S = O.S;
  for (const F of V1_FEUX) {
    let x = F.x * S, z = F.z * S;
    // à côté du chemin, pas dessus
    for (let k = 0; k < 40 && (O.surChemin(x, z, 1) || !O.libre(x, z, 2)); k++) { const a = O.rnd() * TAU, d = 6 + k * 1.5; x = F.x * S + Math.cos(a) * d; z = F.z * S + Math.sin(a) * d; }
    const y = O.hauteur(x, z);
    O.aplanir(x, z, 3, y, 3);
    const q = O.prop('v1_feu', x, y, z, O.rnd() * TAU, { id: F.id });
    O.inter('v1_feu', F.id, x, y + 0.8, z, 'Le feu de veille', { id: F.id });
    q.data.lit = !!zone.S().feux[F.id];
  }
});

HOOKS.inter.v1_feu = (it) => feuxV1.toucher(it);
HOOKS.inter.v1_seuil = () => zone.repasser();
HOOKS.interVis.v1_feu = () => zone.dedans;
HOOKS.interVis.v1_seuil = () => zone.dedans;
