// ============================================================================
//  DEUX LANGUES PERDUES
//  - l'AËLIN : la langue des Aëlim, qui bâtirent le temple sous la montagne et
//    priaient les Trois (Aëla, Durn, Vesh). Langue fluide, verbe à la fin,
//    pluriel en -im, génitif en na- (« na-aël » : de la lumière). Écriture : les
//    Hautes Lettres, des traits anguleux gravés de haut en bas.
//  - le GORRAIN : la langue des Gorr, qui dressèrent les pierres de la vallée
//    (menhirs, dolmen, cercle). Les géants en sont les derniers à le parler.
//    Langue rude, mots courts, redoublés pour le pluriel (« gor-gor » : des
//    pierres), l'adjectif avant le nom. Écriture : des cupules et des anneaux
//    creusés dans la pierre.
//  On apprend les mots dans les lexiques de la grande bibliothèque, auprès des
//  nains (qui ont gardé l'aëlin) et des géants (le gorrain), avec l'eau de
//  mémoire, ou en recopiant les inscriptions où un mot est déjà connu.
// ============================================================================
const LANGUES = {
  aelin: {
    nom: 'l’aëlin', ecriture: 'les Hautes Lettres', peuple: 'les Aëlim',
    desc: 'La langue des Aëlim, qui vivaient dans la vallée avant tout le monde. Elle coule comme de l’eau : le verbe vient toujours à la fin, le pluriel se dit en -im, et « na- » devant un mot veut dire « de ». On l’écrit en Hautes Lettres, de haut en bas, avec des traits anguleux.',
    lex: {
      ael: 'lumière', aela: 'Aëla (l’Aube)', aelim: 'les Aëlim (le peuple de la lumière)', durn: 'Durn (le Dormeur)', vesh: 'Vesh (la Nuit noire)',
      thal: 'pierre', thalen: 'temple', mora: 'montagne', noth: 'dessous', ser: 'eau', sera: 'lac', vir: 'feu', vira: 'soleil', lun: 'lune', estel: 'étoile',
      hem: 'homme', hemim: 'les hommes', ila: 'femme', ior: 'enfant', dal: 'porte', dalen: 'seuil', rath: 'chemin', kel: 'clé', mir: 'œil', mirim: 'les yeux',
      oth: 'mort', othen: 'tombeau', ven: 'vie', ves: 'nuit', vesa: 'noire', ul: 'silence', ulen: 'se taire', sae: 'dormir', saeth: 'le sommeil',
      rim: 'garder', rimen: 'gardien', tor: 'ouvrir', tora: 'ouvre', kor: 'fermer', ith: 'trois', ithim: 'les Trois', an: 'un', dua: 'deux', tres: 'treize',
      fal: 'tomber', fala: 'est tombé', eld: 'ancien', eldim: 'les anciens', nai: 'ne… pas', ma: 'et', o: 'ô', ne: 'celui qui', ta: 'toi', mi: 'moi', ve: 'nous',
      lir: 'chanter', lira: 'chant', hal: 'maison', halim: 'les maisons', gar: 'nain', garim: 'les nains', orm: 'géant', ormim: 'les géants',
      sil: 'argent', aur: 'or', drae: 'sang', vael: 'vent', neth: 'sous', teh: 'ici', eth: 'là-bas', vor: 'avant', vora: 'autrefois', luin: 'bleu',
      rhu: 'rendre', rhua: 'rends', tin: 'livre', tinim: 'les livres', sel: 'secret', selim: 'les secrets', kal: 'appeler', kala: 'appelle', mael: 'main',
    },
  },
  gorrain: {
    nom: 'le gorrain', ecriture: 'les cupules', peuple: 'les Gorr',
    desc: 'La langue des Gorr, qui dressèrent les pierres de la vallée. Les géants la parlent encore, lentement. Les mots sont courts ; on les redouble pour le pluriel (« gor-gor », des pierres), et l’adjectif vient avant le nom. On l’écrit avec des cupules et des anneaux creusés dans la pierre.',
    lex: {
      gor: 'pierre', 'gor-gor': 'les pierres', gorr: 'les Gorr (le peuple des pierres)', dun: 'haut', dunn: 'grand', mek: 'petit', bruk: 'table', tuk: 'debout',
      ulm: 'géant', 'ulm-ulm': 'les géants', hak: 'homme', 'hak-hak': 'les hommes', tro: 'mort', trom: 'tombe', vok: 'feu', vogga: 'soleil', olm: 'lune',
      rag: 'eau', ragga: 'rivière', mor: 'montagne', bul: 'sous', kran: 'os', drum: 'cœur', ek: 'un', dek: 'deux', trek: 'trois', 'trek-trek': 'beaucoup',
      zog: 'aller', zogga: 'va', hum: 'dormir', humma: 'dors', gar: 'garder', garru: 'gardien', bol: 'ventre', kuv: 'cercle', rum: 'rond', dor: 'porte',
      lok: 'voir', lokka: 'regarde', nuk: 'non', ya: 'oui', ho: 'ô', ta: 'toi', ma: 'moi', 'ma-ma': 'nous', grum: 'tonnerre', skaa: 'ciel', bak: 'dos', ruk: 'marcher',
      hal: 'mourir', hol: 'nuit', dwerr: 'nain', 'dwerr-dwerr': 'les nains', aal: 'lumière', ulv: 'loup', brek: 'casser', tunn: 'lourd', snow: 'neige', fell: 'peau',
    },
  },
};
// Les inscriptions : [id, langue, texte, sens, lieu (landmark) ou null]
const INSCRIPTIONS = [
  ['a_seuil', 'aelin', 'o ta ne dalen tora , rhua ael na-durn', 'Ô toi qui ouvres le seuil, rends la lumière de Durn.', 'temple'],
  ['a_porte', 'aelin', 'dal nai tor , ma ithim kala', 'La porte ne s’ouvre pas. Appelle les Trois.', 'temple'],
  ['a_trois', 'aelin', 'aela ven , durn saeth , vesh oth', 'Aëla, la vie. Durn, le sommeil. Vesh, la mort.', 'temple'],
  ['a_mora', 'aelin', 'thalen neth mora , durn sae', 'Le temple est sous la montagne. Durn dort.', null],
  ['a_nuit', 'aelin', 'ves vesa fala , ma hemim ulen', 'La nuit noire est tombée, et les hommes se sont tus.', null],
  ['a_nains', 'aelin', 'garim rimen na-thalen , vor ma teh', 'Les nains, gardiens du temple, avant et ici.', 'nains'],
  ['a_livres', 'aelin', 'tinim na-aelim neth thal , selim rim', 'Les livres des Aëlim sous la pierre gardent les secrets.', 'bibliotheque'],
  ['a_tres', 'aelin', 'tres hemim mora fala , an nai', 'Treize hommes sont tombés de la montagne ; pas un seul.', 'col'],
  ['a_lune', 'aelin', 'lun ma vira ma estel , ithim mirim', 'La lune, le soleil et l’étoile : les yeux des Trois.', null],
  ['a_kel', 'aelin', 'kel neth sera luin , ne sera sae', 'La clé est sous le lac bleu, là où dort le lac.', 'lac_gele'],
  ['a_sang', 'aelin', 'drae nai rhu , ve ulen', 'Nous ne rendrons pas le sang. Nous nous taisons.', null],
  ['a_chant', 'aelin', 'lira na-aela , ael vor ves', 'Le chant d’Aëla : la lumière avant la nuit.', 'temple'],
  ['g_table', 'gorrain', 'dunn bruk ulm-ulm , hak nuk', 'Grande table des géants. Pas pour les hommes.', 'dolmen'],
  ['g_cercle', 'gorrain', 'gor-gor kuv , olm lokka , hol zogga', 'Les pierres en cercle : regarde la lune, va dans la nuit.', 'cercle'],
  ['g_menhirs', 'gorrain', 'tuk gor dek , drum bul', 'Deux pierres debout ; le cœur est dessous.', 'menhirs'],
  ['g_trom', 'gorrain', 'trom gorr , ho ta hum', 'Tombe des Gorr. Ô toi, dors.', null],
  ['g_mor', 'gorrain', 'mor dunn , ulm humma , grum nuk', 'Haute montagne. Géant, dors. Pas de tonnerre.', 'geants'],
  ['g_dwerr', 'gorrain', 'dwerr-dwerr bul mor , aal mek', 'Les nains sous la montagne ; petite lumière.', 'nains'],
  ['g_ulv', 'gorrain', 'ulv trek-trek hol , vok gar', 'Beaucoup de loups la nuit : garde le feu.', null],
  ['g_rag', 'gorrain', 'ragga zog , mor bul , dor', 'La rivière va sous la montagne : une porte.', 'temple'],
];
const INSCR_BY_ID = {};
for (const I of INSCRIPTIONS) INSCR_BY_ID[I[0]] = { id: I[0], lang: I[1], texte: I[2], sens: I[3], lieu: I[4] };
// mots d'une inscription (sans ponctuation)
const langWords = (texte) => texte.split(/\s+/).filter((w) => w && w !== ',');

// ---------------------------------------------------------------- l'écriture (dessin d'un mot, lettre à lettre)
const LANG_GLYPHS = {};
function langGlyph(lang, ch) {
  const key = lang + ch;
  if (LANG_GLYPHS[key]) return LANG_GLYPHS[key];
  const rnd = mulberry32(hashString(key) + 7);
  const strokes = [];
  if (lang === 'aelin') { // traits sur une grille 3 × 4
    const n = 2 + ((rnd() * 3) | 0);
    for (let k = 0; k < n; k++) { const a = [(rnd() * 3) | 0, (rnd() * 4) | 0], b = [(rnd() * 3) | 0, (rnd() * 4) | 0]; if (a[0] === b[0] && a[1] === b[1]) b[1] = (b[1] + 2) % 4; strokes.push([a, b]); }
    strokes.push([[1, 0], [1, 3]]); // la hampe
  } else { // cupules et anneaux
    const n = 1 + ((rnd() * 3) | 0);
    for (let k = 0; k < n; k++) strokes.push({ x: rnd(), y: rnd(), r: 0.12 + rnd() * 0.2, ring: rnd() < 0.5 });
    if (rnd() < 0.5) strokes.push({ line: [rnd(), rnd(), rnd(), rnd()] });
  }
  return (LANG_GLYPHS[key] = strokes);
}
// Dessine un texte dans l'écriture de la langue : renvoie un canevas
function langCanvas(lang, texte, opts = {}) {
  const words = langWords(texte), letters = words.map((w) => w.replace(/-/g, '').split(''));
  const G = opts.size || 18, gap = G * 0.5;
  const cols = lang === 'aelin' ? words.length : 1;
  const cv = document.createElement('canvas');
  if (lang === 'aelin') { // colonnes de haut en bas
    const maxL = Math.max(1, ...letters.map((l) => l.length));
    cv.width = Math.max(40, cols * (G + gap) + gap); cv.height = maxL * G * 1.2 + gap * 2;
  } else { // lignes de cupules
    cv.width = Math.min(520, Math.max(60, texte.length * G * 0.6)); cv.height = Math.ceil(letters.flat().length * G * 0.62 / cv.width + 1) * G * 1.3 + gap * 2;
  }
  const ctx = cv.getContext('2d');
  ctx.fillStyle = opts.bg || '#cfc6b0'; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.strokeStyle = opts.ink || '#3a3024'; ctx.fillStyle = opts.ink || '#3a3024'; ctx.lineWidth = Math.max(1.5, G / 9); ctx.lineCap = 'round';
  if (lang === 'aelin') {
    letters.forEach((L, wi) => {
      const x0 = cv.width - gap - (wi + 1) * (G + gap) + gap; // de droite à gauche
      L.forEach((ch, li) => {
        const y0 = gap + li * G * 1.2;
        for (const [a, b] of langGlyph(lang, ch)) { ctx.beginPath(); ctx.moveTo(x0 + a[0] / 2 * G * 0.8, y0 + a[1] / 3 * G); ctx.lineTo(x0 + b[0] / 2 * G * 0.8, y0 + b[1] / 3 * G); ctx.stroke(); }
      });
    });
  } else {
    let x = gap, y = gap;
    for (const L of letters) {
      for (const ch of L) {
        const s = G * 0.6;
        for (const g of langGlyph(lang, ch)) {
          if (g.line) { ctx.beginPath(); ctx.moveTo(x + g.line[0] * s, y + g.line[1] * s); ctx.lineTo(x + g.line[2] * s, y + g.line[3] * s); ctx.stroke(); continue; }
          ctx.beginPath(); ctx.arc(x + g.x * s, y + g.y * s, g.r * s + 1, 0, TAU);
          if (g.ring) ctx.stroke(); else ctx.fill();
        }
        x += s;
        if (x > cv.width - gap - s) { x = gap; y += G * 1.3; }
      }
      x += s * 0.6;
    }
  }
  return cv;
}
