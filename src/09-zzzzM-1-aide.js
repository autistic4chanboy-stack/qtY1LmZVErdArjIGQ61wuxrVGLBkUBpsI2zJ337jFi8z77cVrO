// ============================================================================
//  LA MUSIQUE (agent M) — 2. L'AIDE À L'ÉCRITURE
//  Pour écrire vite un accompagnement : une suite d'accords (une mesure par
//  accord, du grave à l'aigu) et un motif qui dit comment les jouer.
//    musMotif('pp f2 a3 c4 e4 | bb1 a3 d4 f4', '0/4 123/2')
//      → 'pp f2/4 a3+c4+e4/2 | bb1/4 a3+d4+f4/2 |'
//  Motif : des indices dans l'accord (0 = la basse ; « 123 » = trois notes
//  ensemble ; au-delà de l'accord, on remonte d'une octave), la durée après
//  « / », les suffixes de la notation (~ ! ? ' _), « & » pour arpéger,
//  « r/8 » pour un silence. Dans une mesure : nuances, « < », « > », « ( »,
//  « ) » passent tels quels ; « @2 » prend le motif n° 2 ; « % » reprend
//  l'accord d'avant ; « - » seul : une mesure de silence (durée : « -/2. »).
// ============================================================================
function musMotif(spec, motifs) {
  const M = Array.isArray(motifs) ? motifs : [motifs];
  const out = [];
  let prec = null;
  for (const bar of String(spec).split('|')) {
    const toks = bar.trim().split(/\s+/).filter(Boolean);
    if (!toks.length) continue;
    let ch = [], mi = 0;
    const avant = [], apres = [];
    for (const t of toks) {
      if (/^@\d+$/.test(t)) mi = +t.slice(1);
      else if (t === '%') ch = prec ? prec.slice() : [];
      else if (/^-(\/.*)?$/.test(t)) ch = null;
      else if (/^(ppp|pp|p|mp|mf|f|ff|<|>|\()$/.test(t)) avant.push(t);
      else if (t === ')') apres.push(t);
      else if (ch) ch.push(t);
    }
    if (ch === null) { const d = (toks.find((t) => /^-\//.test(t)) || '-/2.').slice(2); out.push([...avant, 'r/' + d, ...apres].join(' ')); continue; }
    prec = ch;
    const hz = ch.map(musHauteur);
    const nom = (m) => { const n = ['c', 'c#', 'd', 'eb', 'e', 'f', 'f#', 'g', 'ab', 'a', 'bb', 'b'][((m % 12) + 12) % 12]; return n + (Math.floor(m / 12) - 1); };
    // garder l'orthographe de l'accord quand l'indice y est (bb, pas a#)
    const note = (k) => { const n = ch.length; if (k < n) return ch[k]; return nom(hz[k % n] + 12 * Math.floor(k / n)); };
    const mot = String(M[mi] || M[0]).trim().split(/\s+/).map((t) => {
      if (/^r(\/|$)/.test(t)) return t;
      const m = /^(&?)(\d+)((?:\/\d+\.{0,2}t?)?)([~!?'_]*)$/.exec(t);
      if (!m) return t;
      return m[1] + m[2].split('').map((d) => note(+d)).join('+') + m[3] + m[4];
    });
    out.push([...avant, ...mot, ...apres].join(' '));
  }
  return out.join(' | ') + ' |';
}
// une voix répétée n fois (les barres sont gardées)
function musRep(txt, n) { return Array(n).fill(String(txt).trim()).join(' '); }
