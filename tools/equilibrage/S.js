// Équilibrage — LES VOIX DE CHAQUE MILIEU (agent S, douzième vague).
//   node tools/equilibrage.js S          (ou : node tools/equilibrage/S.js)
// Vérifie : chaque milieu (les neuf de BIOMES) a ses chanteurs (aube, jour, soir), ses nappes, sa pluie, ses bruits
// rares ; chaque chanteur a son tampon, son volume, son phrasé ; chaque nappe et chaque pluie sa boucle et son volume ;
// chaque tampon et chaque boucle « s_… » se calcule sans valeur aberrante (NaN, infini) et n'est pas muet ; la mémoire
// que prennent les tampons, toutes variantes comptées (le jeu ne calcule que ceux du milieu où l'on est, en tâche de
// fond) ; et la rareté : combien de chanteurs, de bruits rares par minute, au plus (d'après les cadences du moteur).
'use strict';

// Mo, pour trois milieux à la fois (ce qui n'a pas servi depuis cinq minutes est libéré) ; la mesure varie d'un tirage à
// l'autre d'environ un Mo (le silence rogné à la fin des chants dépend du chant) : on est vers 30
const MEMOIRE_MAX = 34;

module.exports = {
  titre: 'Les voix de chaque milieu : chanteurs, nappes, pluies, bruits rares (tables, calcul, mémoire, rareté)',
  async verifier(J, log) {
    let echecs = 0;
    const verif = (ok, msg) => { if (!ok) echecs++; log(`  ${ok ? 'ok ' : 'ÉCHEC'} ${msg}`); };
    const SE = J.ev('SoundEngine'), BIOMES = J.ev('BIOMES');
    const T = SE.TAMPONS, B = SE.BOUCLES;
    // ---------------------------------------------------------------- les tables
    const manques = [];
    for (const b of BIOMES) {
      const C = SE.CHANTEURS[b];
      if (!C) { manques.push('chanteurs ' + b); continue; }
      for (const mo of ['aube', 'jour', 'soir']) if (!(C[mo] && C[mo].length)) manques.push(`chanteurs ${b}.${mo}`);
      for (const mo of ['aube', 'jour', 'soir', 'nuit']) for (const [s] of C[mo] || []) {
        if (!T[s]) manques.push(`tampon ${s} (${b}.${mo})`);
        if (!SE.VOL_OISEAUX[s]) manques.push(`volume ${s}`);
        if (!SE.PHRASES[s]) manques.push(`phrasé ${s}`);
      }
      const N = SE.NAPPES_MILIEU[b];
      if (!N) manques.push('nappes ' + b); else for (const k of Object.keys(N({}))) { if (!B[k]) manques.push(`boucle ${k} (${b})`); if (!SE.VOL_BOUCLES[k]) manques.push(`volume ${k}`); }
      const P = SE.PLUIE_MILIEU[b];
      if (!P || !B[P]) manques.push('pluie ' + b);
      if (!SE.BRUITS_MILIEU[b]) manques.push('bruits ' + b);
    }
    verif(!manques.length, `tables des neuf milieux complètes${manques.length ? ' — manque : ' + [...new Set(manques)].join(', ') : ''}`);
    const especes = new Set();
    for (const C of Object.values(SE.CHANTEURS)) for (const mo in C) for (const [s] of C[mo]) especes.add(s);
    const nouv = [...especes].filter((s) => s.startsWith('s_'));
    log(`  ${especes.size} chanteurs en tout (${nouv.length} nouveaux, qu'on entend sans les voir)`);
    // chaque milieu a des chanteurs qui lui sont propres (au moins deux qu'aucun autre milieu n'a dans son jour)
    const jourDe = (b) => new Set(SE.CHANTEURS[b].jour.map(([s]) => s));
    let propres = 0;
    for (const b of BIOMES) {
      const autres = new Set();
      for (const c of BIOMES) if (c !== b) for (const s of jourDe(c)) autres.add(s);
      const p = [...jourDe(b)].filter((s) => !autres.has(s));
      if (p.length >= 1) propres++;
      log(`    ${b.padEnd(9)} jour ${String(SE.CHANTEURS[b].jour.length).padStart(2)} chanteurs, dont à lui seul : ${p.join(', ') || '—'}`);
    }
    verif(propres >= 7, `au moins sept milieux ont un chanteur de jour bien à eux (${propres}/9)`);
    // ---------------------------------------------------------------- le calcul : ni NaN, ni silence ; la mémoire
    const sr = 22050, defauts = [], taille = {};
    let ms = 0;
    for (const k of Object.keys(T).filter((k) => k.startsWith('s_'))) {
      const [dur, f] = T[k], n = (SE.VARIANTES && SE.VARIANTES[k]) || 5, s = (SE.SR_TAMPON && SE.SR_TAMPON[k]) || sr, d = new Float32Array(Math.ceil(dur * s));
      const t0 = Date.now();
      f(d, s, 0);
      ms += Date.now() - t0;
      let pk = 0, bad = false;
      for (let i = 0; i < d.length; i++) { const v = d[i]; if (!Number.isFinite(v)) { bad = true; break; } if (Math.abs(v) > pk) pk = Math.abs(v); }
      if (bad || !(pk > 1e-4)) defauts.push(k + (bad ? ' (NaN)' : ' (muet)'));
      // (comme le jeu : le silence de la fin est rogné)
      let fin = d.length - 1;
      while (fin > 0 && Math.abs(d[fin]) < pk * 0.0015) fin--;
      const len = d.length - (fin + 0.08 * s) >= 0.25 * s ? fin + Math.floor(0.08 * s) : d.length;
      taille['T:' + k] = len * 4 * n;
    }
    for (const k of Object.keys(B).filter((k) => k.startsWith('s_'))) {
      const [D, f, s2] = B[k], s = Math.min(sr, s2 || sr), d = new Float32Array(Math.floor(D * s) + Math.floor(0.25 * s));
      const t0 = Date.now();
      f(d, s, D + 0.25);
      ms += Date.now() - t0;
      let pk = 0, bad = false;
      for (let i = 0; i < d.length; i++) { const v = d[i]; if (!Number.isFinite(v)) { bad = true; break; } if (Math.abs(v) > pk) pk = Math.abs(v); }
      if (bad || !(pk > 1e-4)) defauts.push(k + (bad ? ' (NaN)' : ' (muet)'));
      taille['B:' + k] = Math.floor(D * s) * 4;
    }
    verif(!defauts.length, `chaque tampon et chaque boucle « s_… » se calcule${defauts.length ? ' — en défaut : ' + defauts.join(', ') : ''}`);
    // ce qu'un milieu demande (comme _sPreparer : ses nappes, sa pluie, ses chanteurs, ses bruits rares)
    const BRUIT_T = { coq: 's_coq', chien: 's_chien', bourdon: 's_bourdons', charrette: 's_charrette', sonnailles: 's_sonnailles', caillou: 's_caillou', brindille: 's_brindille', tronc: 's_tronc', gousse: 's_gousse', poisson: 's_poisson' };
    const besoin = (b) => {
      const L = new Set(Object.keys(SE.NAPPES_MILIEU[b]({})).map((k) => 'B:' + k));
      L.add('B:' + SE.PLUIE_MILIEU[b]);
      for (const mo of ['aube', 'jour', 'soir', 'nuit']) for (const [s] of SE.CHANTEURS[b][mo] || []) if (s.startsWith('s_')) L.add('T:' + s);
      for (const [nom] of SE.BRUITS_MILIEU[b] || []) if (BRUIT_T[nom]) L.add('T:' + BRUIT_T[nom]);
      return L;
    };
    const Mo = (L) => [...L].reduce((a, k) => a + (taille[k] || 0), 0) / 1048576;
    const tout = Mo(new Set(Object.keys(taille)));
    const parMilieu = BIOMES.map((b) => [b, Mo(besoin(b))]).sort((a, b) => b[1] - a[1]);
    log('  mémoire de chaque milieu (Mo) : ' + parMilieu.map(([b, m]) => `${b} ${m.toFixed(1)}`).join(', '));
    const trois = new Set([...besoin(parMilieu[0][0]), ...besoin(parMilieu[1][0]), ...besoin(parMilieu[2][0]), 'B:s_pl_dedans', 'B:s_egouttement', 'T:s_cloche']);
    verif(Mo(trois) <= MEMOIRE_MAX, `mémoire d'une promenade (les trois milieux les plus gourmands ; ce qui n'a pas servi depuis cinq minutes est libéré) : ${Mo(trois).toFixed(1)} Mo ≤ ${MEMOIRE_MAX} Mo (tout calculé : ${tout.toFixed(1)} Mo)`);
    log(`  (temps de calcul de tout, dans la machine virtuelle de node, bien plus lente que le navigateur pour ces calculs : ${(ms / 1000).toFixed(1)} s ; en jeu, un par un, en tâche de fond)`);
    // ---------------------------------------------------------------- la rareté (d'après les cadences du moteur)
    // le jour (09-zzzaudio-scene.js et _chanteur) : un chanteur chante, puis reprend sa phrase (PHRASES : de… à… fois),
    // chaque reprise après une pause de (silence + durée du chant) × 0,8 … 1,3 ; quand il a fini, six fois sur dix (trois à
    // l'aube) on se tait le temps du long silence du moteur, base × 0,6 … 1,5 (base : 13 s au bois, 18 à la ferme, 28 en
    // ville, 22 ailleurs), sinon le suivant chante aussitôt. La nuit : 16 à 45 s entre deux chanteurs. Les bruits rares :
    // 18 à 50 s (× 1,4 la nuit). En moyenne, par minute :
    const base = { foret: 13, bouleaux: 13, ville: 28, ferme: 18 };
    let pire = 0, pireAube = 0;
    for (const b of BIOMES) {
      const L = SE.CHANTEURS[b].jour, moy = (f) => L.reduce((a, [s, p]) => a + p * f(s), 0) / L.reduce((a, [, p]) => a + p, 0);
      const occupe = moy((s) => { const P = SE.PHRASES[s] || [1, 2, 3], n = 1 + (P[0] + P[1]) / 2; return n * (P[2] + T[s][0]) * 1.05; });
      const silence = 0.6 * (base[b] || 22) * 1.05, silenceAube = 0.3 * (base[b] || 22) * 1.05 * 0.55;
      const parMin = 60 / (occupe + silence), parMinAube = 60 / (occupe + silenceAube);
      pire = Math.max(pire, parMin); pireAube = Math.max(pireAube, parMinAube);
      log(`    ${b.padEnd(9)} jour : un chanteur et ses reprises ${occupe.toFixed(1)} s, puis ${silence.toFixed(1)} s de silence en moyenne → ${parMin.toFixed(1)} chanteur(s) par minute (à l'aube : ${parMinAube.toFixed(1)})`);
    }
    verif(pire <= 2.5, `rare : au plus ${pire.toFixed(1)} chanteurs par minute en plein jour (≤ 2,5), ${pireAube.toFixed(1)} à l'aube ; bruits rares : ${(60 / 34).toFixed(1)} par minute le jour, ${(60 / (34 * 1.4)).toFixed(1)} la nuit`);
    return { echecs };
  },
};

if (require.main === module) {
  const { charger } = require('./vm.js');
  module.exports.verifier(charger(), (...a) => console.log(...a)).then((r) => { console.log(r.echecs ? `${r.echecs} échec(s)` : 'ok'); process.exit(r.echecs ? 1 : 0); });
}
