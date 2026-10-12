// ============================================================================
//  LES CASCADES, LES GROTTES ET LES COINS DE PARADIS (agent P18) — 0. LA PASSE
//  Le branchement sur generateValley, seul dans ce fichier pour sa place dans
//  l'assemblage : après toutes les passes d'avant (jusqu'aux runes, R15), avant
//  les bâtisses de la même vague (le Grand Hôtel des Cimes, le Grand Cercle).
//  La nature d'abord, les murs ensuite : l'hôtel et le Cercle regardent ce qui
//  est déjà posé avant de bâtir, les chutes ne le pourraient pas après eux.
//  (Le travail lui-même : p18Gen.passe, dans 11-zzzzzzzP18-1-gen.js.)
// ============================================================================
{
  const _gv = generateValley;
  generateValley = async function (seed, progress, gen) {
    const w = await _gv(seed, progress, gen);
    if (w && w.designed) {
      try { if (progress) progress('Les cascades…'); p18Gen.passe(w); } catch (e) { console.error('P18', e); }
    }
    return w;
  };
}
