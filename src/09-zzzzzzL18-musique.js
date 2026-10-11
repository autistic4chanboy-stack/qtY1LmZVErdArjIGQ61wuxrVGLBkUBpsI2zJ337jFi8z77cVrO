// ============================================================================
//  LE GRAND HÔTEL DES CIMES (agent L18) — deux airs de l'hôtel (notation : 09-zzzzM-0-moteur.js)
//  - « La valse des Cimes » : ré majeur, à trois temps, la valse de l'orchestre du
//    Veilledi (et de l'arrivée) ; deux fois l'air, un peu plus doux la seconde.
//  - « La Vallée » : la symphonie de Casimir Wolański, réduite pour piano : l'eau (un
//    la grave qui ne s'arrête pas), les cloches (des accords comme des volées), le
//    vent (trois notes de berger, montantes), le silence (quatre notes, une phrase
//    qui ne finit pas).
//  Groupe « hotel » : on les entend dans l'hôtel (12-zzzzzzzL18-carnet.js), et dans
//  ses scènes ; jamais ailleurs.
// ============================================================================
{
  // les accords de la valse, mesure par mesure (introduction, A, B, A, B, coda)
  const D = ['a3+d4+f#4', 'd2'], A7 = ['a3+c#4+g4', 'a1'], A = ['a3+c#4+e4', 'a1'], G = ['b3+d4+g4', 'g1'];
  const tA = [D, A7, D, D, A, A7, D, D], tB = [G, D, D, A, G, A7, D, D];
  const H = [D, D, ...tA, ...tB, ...tA, ...tB, D, D];
  const airA = ['( f#5/2 a5/4', 'g5/4 f#5/4 e5/4', 'd5/2.', 'a4/2 d5/4', 'e5/2 f#5/4', 'g5/4 e5/4 c#5/4', 'd5/2.~', 'd5/2 r/4 )'];
  const airB = ['( b5/2 a5/4', 'g5/4 f#5/4 e5/4', 'f#5/2 d5/4', 'a4/2.', '< g5/2 f#5/4', '> e5/4 d5/4 c#5/4', 'd5/2.~', 'd5/2. )'];
  const chant = ['r/2.', 'r/2.', 'mp ' + airA[0], ...airA.slice(1), ...airB, 'p ' + airA[0], ...airA.slice(1), ...airB, 'pp d5/2.~', 'd5/2.'];
  MUSIQUE.ajouter({
    id: 'l18_valse', titre: 'La valse des Cimes', groupe: 'hotel', tempo: 152, mesure: '3/4', salle: 'salle', reverb: 0.3, gain: 1.15, respire: 8,
    voix: {
      chant: { inst: 'piano', role: 'chant', notes: chant.join(' | ') + ' |' },
      accords: { inst: 'piano', role: 'accomp', dyn: 0.7, notes: 'pp ' + H.map((h) => `r/4 ${h[0]}/4 ${h[0]}/4`).join(' | ') + ' |' },
      basse: { inst: 'piano', role: 'basse', notes: 'p ' + H.map((h) => `${h[1]}/4 r/2`).join(' | ') + ' |' },
    },
  });
}
{
  const arp = (a, b, c, d) => `${a}/8 ${b}/8 ${c}/8 ${d}/8 ${c}/8 ${b}/8 ${a}/8 ${b}/8`;
  MUSIQUE.ajouter({
    id: 'l18_symphonie', titre: 'La Vallée', auteur: 'Casimir Wolański', groupe: 'hotel', tempo: 54, mesure: '4/4', salle: 'salle', reverb: 0.38, gain: 1.2, respire: 4, finRit: 2,
    voix: {
      chant: { inst: 'piano', role: 'chant', notes: 'pp r/1 | r/1 | r/1 | r/1 | r/1 | r/1 | r/1 | r/1 | p ( d5/4 e5/4 f5/2 | d5/4 e5/4 g5/2 | d5/4 e5/4 f5/4 a5/4 | a5/1 ) | pp ( a4/2 c5/4 d5/4 | e5/2. r/4 | a4/2 c5/4 d5/4 | e5/1 ) |' },
      accords: { inst: 'piano', role: 'accomp', dyn: 0.75, notes: `pp ${arp('e4', 'a4', 'c5', 'e5')} | ${arp('e4', 'a4', 'c5', 'e5')} | ${arp('f4', 'a4', 'c5', 'f5')} | ${arp('e4', 'g4', 'c5', 'e5')} | p d4+f4+a4/2 d4+f4+a4/2 | c4+e4+g4/2 c4+e4+g4/2 | bb3+d4+f4/1 | a3+c#4+e4/1 | pp r/2 d4+f4/2 | r/2 c4+e4/2 | r/2 bb3+d4/2 | a3+c#4/1 | r/1 | r/1 | r/1 | r/1 |` },
      basse: { inst: 'piano', role: 'basse', notes: 'pp a1/1 | a1/1 | a1/1 | a1/1 | d2/1 | c2/1 | bb1/1 | a1/1 | d2/1 | c2/1 | bb1/1 | a1/1 | a1/1 | r/1 | a1/1 | a1/1 |' },
    },
  });
}
// dans l'hôtel, on entend aussi quelques pièces du répertoire (le piano du salon)
for (const id of ['pd_gymnopedie1', 'pd_chopin7', 'village_dimanche']) { const d = MUSIQUE.morceaux[id]; if (d) d.aussi = (d.aussi || []).concat(['hotel']); }
