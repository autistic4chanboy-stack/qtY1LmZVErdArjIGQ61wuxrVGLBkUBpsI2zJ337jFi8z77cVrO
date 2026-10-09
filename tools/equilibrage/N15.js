// Moins de texte (agent N15, quinzième vague)
//   node tools/equilibrage.js N15
// - Le tri des lignes : les paroles et le nécessaire (danger, faim, argent, condition, heure, direction, savoir, état)
//   restent ; les pensées qui redisent ce qui se voit sont « descriptives ».
// - La règle : une ligne descriptive ne se montre qu'une fois par partie ; une ligne nécessaire revient, mais pas deux
//   fois en quelques secondes ; une parole passe toujours ; l'option décochée laisse tout passer.
// - Les lignes d'état (humeur, faim, maux, ivresse, fatigue) : lues dans les tables du jeu, toujours montrées.
'use strict';

const ATTENDU = [
  // [nom, ligne, sorte]
  ['Rosalie', 'Je t’ai dit cent fois de ne pas te pencher sur les puits.', 'dialogue'],
  ['', '« Tsi ! Lum ! »', 'dialogue'],
  ['', '(Vous laissez tomber.)', 'descriptif'],
  ['', '(La clé tourne.)', 'descriptif'],
  ['', '(Une cachette…)', 'descriptif'],
  ['', '(Un trou, trop petit pour un homme. Il en monte une odeur de suif et de cave.)', 'descriptif'],
  ['', '(Quelque chose rit, tout bas, et s’éloigne.)', 'descriptif'],
  ['', '(Il faut une bûche pour allumer le feu.)', 'necessaire'],
  ['', '(Pas sous l’orage.)', 'necessaire'],
  ['', '(L’arrosoir est vide.)', 'necessaire'],
  ['', '(Le sang coule.)', 'necessaire'],
  ['', '(Des mâchoires de fer sur votre jambe. E pour les écarter.)', 'necessaire'],
  ['', '(Ça mord ! Vite !)', 'necessaire'],
  ['', '(Il est 8 h 05.)', 'necessaire'],
  ['', '(Vous n’avez pas 40 pièces.)', 'necessaire'],
  ['', '(Nouvelle recette : Pain.)', 'necessaire'],
  ['', '(On vous répond sur votre gauche, pas loin.)', 'necessaire'],
  ['', '(Un arbre ou une pierre gêne.)', 'necessaire'],
  ['', '(Marchedi. Grand marché à Valbrume.)', 'necessaire'],
  ['', '(Votre ventre gargouille.)', 'necessaire'],
  ['', '(La fatigue vient. Une bonne fatigue, pour l’instant.)', 'necessaire'],
  ['', '(Vous trouvez : une bougie, deux pièces.)', 'redondant'],
];

module.exports = {
  titre: 'Moins de texte (N15) : le tri des pensées, une fois pour ce qui se voit',
  async verifier(J, log) {
    let echecs = 0;
    const ko = (m) => { echecs++; log('  ÉCHEC : ' + m); };
    await new Promise((r) => setTimeout(r, 30));   // les portes se posent après le chargement
    log('# 1. Le tri');
    for (const [n, t, a] of ATTENDU) {
      const c = J.avec({ n, t }, 'texte.classe(__v.n, __v.t, 3)');
      if (c !== a) ko(`« ${t} » rangée ${c}, attendu ${a}`);
    }
    log(`${ATTENDU.length} lignes témoins`);
    log('\n# 2. La règle');
    J.ev('farm.s = { day: 3 }; settings.moinsTexte = true; texte._vu = {}; texte._feedT = -1e9;');
    const montre = (n, t) => J.avec({ n, t }, 'texte.montrer(__v.n, __v.t, 3)');
    const d1 = montre('', '(La clé tourne.)');
    J.ev('texte._vu = {}');
    const d2 = montre('', '(La clé tourne.)');
    if (!d1 || d2) ko(`descriptive : ${d1}, puis ${d2} (attendu : montrée, puis tue)`);
    if (J.ev('farm.s.texteN15["(La clé tourne.)"]') !== 3) ko('la mémoire (farm.s.texteN15) ne retient pas le jour');
    const n1 = montre('', '(L’arrosoir est vide.)'), n2 = montre('', '(L’arrosoir est vide.)');
    J.ev('texte._vu = {}');
    const n3 = montre('', '(L’arrosoir est vide.)');
    if (!n1 || n2 || !n3) ko(`nécessaire : ${n1}, ${n2}, ${n3} (attendu : montrée, tue tout de suite après, montrée plus tard)`);
    const p = [1, 2, 3].map(() => montre('Rosalie', 'Bonjour.'));
    if (!p.every(Boolean)) ko('une parole a été tue');
    J.ev('texte._feedT = performance.now() / 1000');
    if (montre('', '(Vous trouvez : une bougie.)')) ko('la liste de ce qu’on ramasse s’affiche alors que la colonne des trouvailles vient de le montrer');
    J.ev('texte._feedT = -1e9');
    if (!montre('', '(Vous trouvez : une bougie.)')) ko('la liste de ce qu’on ramasse est tue sans la colonne des trouvailles');
    J.ev('settings.moinsTexte = false; texte._vu = {}');
    if (!montre('', '(La clé tourne.)')) ko('option décochée : une ligne descriptive est tue');
    J.ev('settings.moinsTexte = true; farm.s = null');
    log('règle vérifiée (descriptive une fois, nécessaire espacée, paroles toujours, trouvailles sans doublon, option)');
    log('\n# 3. Les lignes d’état');
    const etats = J.ev('texte.etats().size');
    if (etats < 40) ko(`les lignes d'état (humeur, faim, maux) ne sont pas trouvées (${etats})`);
    log(`${etats} lignes d’état (humeur, faim, maux, ivresse, fatigue) toujours montrées`);
    return { echecs };
  },
};
