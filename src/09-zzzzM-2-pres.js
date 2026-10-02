// ============================================================================
//  LA MUSIQUE (agent M) — LES PRÉS ET LA FERME (groupe « pres »)
//  Compositions originales (agent M), sauf mention.
// ============================================================================

// « Le pré du matin » — fa majeur, à trois temps, lent et clair. Une gymnopédie de plein air : la basse et
// l'accord, et au-dessus une ligne qui s'étire ; un passage en ré mineur, puis le retour, plus bas, qui s'éteint.
MUSIQUE.ajouter({
  id: 'pres_matin', titre: 'Le pré du matin', groupe: 'pres', tempo: 66, mesure: '3/4', salle: 'salle', reverb: 0.3,
  voix: {
    m: {
      inst: 'piano', role: 'chant',
      notes: 'r/2. | r/2. |' +
        ' p ( r/4 e5/4 f5/4 | a5/2. | a5/4 g5/4 f5/4 | e5/2. ) | ( d5/4 e5/4 f5/4 | g5/2 f5/4 | e5/2. | c5/2. ) |' +
        ' ( r/4 e5/4 f5/4 | a5/2. | c6/4 bb5/4 a5/4 | g5/2 f5/4 ) | ( d5/4 f5/4 a5/4 | g5/2 e5/4 | f5/2.~ | f5/2. ) |' +
        ' mp ( r/4 f5/4 g5/4 | < a5/2 g5/4 | f5/2 e5/4 | > d5/2. ) | ( r/4 f5/4 g5/4 | < bb5/2 a5/4 | g5/4 f5/4 e5/4 | > e5/2. ) |' +
        ' p ( r/4 e5/4 f5/4 | a5/2. | a5/4 g5/4 f5/4 | e5/2. ) | ( d5/4 f5/4 a5/4 | g5/2 e5/4 | f5/2.~ | f5/2. ) |' +
        ' pp ( r/4 d5/4 f5/4 | e5/2. | d5/2 c5/4 | c5/2.~ | c5/2. ) |',
    },
    g: {
      inst: 'piano', role: 'accomp',
      notes: musMotif(
        'pp f2 a3 c4 e4 | bb1 a3 d4 f4 |' +
        ' p f2 a3 c4 e4 | bb1 a3 d4 f4 | f2 a3 c4 e4 | d2 a3 c4 f4 | bb1 a3 d4 f4 | g2 bb3 d4 f4 | a2 g3 c4 e4 | c2 bb3 c4 f4 |' +
        ' f2 a3 c4 e4 | bb1 a3 d4 f4 | f2 a3 c4 e4 | g2 bb3 d4 f4 | bb1 a3 d4 f4 | c2 bb3 c4 e4 | f2 a3 c4 e4 | f2 bb3 d4 f4 |' +
        ' mp d2 a3 d4 f4 | c2 a3 d4 f4 | bb1 a3 d4 f4 | a1 g3 d4 e4 | d2 a3 d4 f4 | g2 bb3 d4 f4 | e2 g3 bb3 c4 | a1 g3 c#4 e4 |' +
        ' p f2 a3 c4 e4 | bb1 a3 d4 f4 | f2 a3 c4 e4 | d2 a3 c4 f4 | bb1 a3 d4 f4 | c2 bb3 c4 e4 | f2 a3 c4 e4 | f2 a3 c4 e4 |' +
        ' pp bb1 a3 d4 f4 | f2 a3 c4 e4 | f2 bb3 d4 g4 | f2 a3 c4 e4 | f2 a3 c4 f4', '0/4 123/2'),
    },
  },
});
