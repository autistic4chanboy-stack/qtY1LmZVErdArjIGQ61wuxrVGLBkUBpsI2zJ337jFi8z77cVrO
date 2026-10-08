// Équilibrage — la quête du nonos du chien (agent Q, treizième vague)
//  - le nonos est un objet de quête (ne se vend pas) ; chaque sorte de lieu a ses phrases ;
//  - LA FAIM, mesurée avec les vraies fonctions du chien (chien.repas, chien.faim, chien.stade, le seuil de mort de
//    chien.tick) : avant le nonos rendu, puis après — tout doit venir deux fois plus tard (un repas tient deux fois plus
//    longtemps, les stades de faim viennent deux fois moins vite, trois jours sans manger en deviennent six) ;
//  - LES CINQ LIEUX : 300 tirages (300 parties) sur la vallée 1234 avec le vrai tirage (nonosChoisir) : toujours cinq,
//    le premier à 110–380 m de la ferme, chacun à 150–430 m du précédent (marges du tirage comprises : ×1,5 au plus),
//    à 140 m au moins des autres, tous à moins de 1 150 m de la ferme ; l'indice sur la terre ferme, hors de l'eau, sur
//    une pente douce, ni dans un mur ni sous un toit, joignable à pied depuis la ferme (grille de 11-zzzz7-carte.js, au
//    pas de 4 m, pentes de 46° au plus) ; des parties différentes les unes des autres.
'use strict';
const { vallee } = require('./vm.js');
module.exports = {
  titre: 'La quête du nonos du chien (Q)',
  async verifier(J, log) {
    let echecs = 0;
    const ko = (m) => { echecs++; log('ÉCHEC : ' + m); };
    // ---------------------------------------------------------------- l'objet, les textes
    const it = JSON.parse(J.ev('JSON.stringify(ITEMS.nonos || null)'));
    if (!it) ko('pas d’objet « nonos »');
    else { log(`objet « ${it.name} » : catégorie ${it.cat}, prix ${it.price}`); if (it.cat !== 'quete' || it.price) ko('le nonos se vendrait'); }
    const manque = JSON.parse(J.ev('JSON.stringify([...Object.values(NONOS_LM), ...NONOS_LM_PREFIXES.map((p) => p[1])].filter((t) => !NONOS_TYPES[t]))'));
    if (manque.length) ko('lieux sans textes : ' + manque.join(', '));
    const vides = JSON.parse(J.ev('JSON.stringify(Object.entries(NONOS_TYPES).filter(([k, T]) => !T.ph || !T.ph.length || T.ph.some((p) => !p[0] || !p[1]) || !(T.look > 0)).map(([k]) => k))'));
    if (vides.length) ko('sortes de lieux sans phrases : ' + vides.join(', '));
    log(`${JSON.parse(J.ev('JSON.stringify(Object.keys(NONOS_TYPES).length)'))} sortes de lieux décrites ; ${JSON.parse(J.ev('JSON.stringify(NONOS_INDICES.length)'))} indices (le dernier : le terrier)`);

    // ---------------------------------------------------------------- la faim du chien, avant et après
    const F = JSON.parse(J.ev(`(() => {
      const ch0 = esprit.changer; esprit.changer = () => {};
      const mesure = (rendu) => {
        farm.s = farm.blank(1234);
        farm.s.dog = { name: 'Filou', alive: true, love: 0 };
        farm.s.nonos = rendu ? { e: 6, rendu: 3, L: [], tr: [] } : { e: 0, L: [], tr: [] };
        farm.s.hours = 100;
        const C = chien.C(); C.rassasie = 100;
        chien.repas(26, true);                       // un repas de viande, l'estomac vide
        const tient = C.rassasie - 100;
        const quand = {}; let mort = null;
        for (let h = 100; h < 600; h += 0.25) {
          farm.s.hours = h;
          const st = chien.stade();
          for (let k = 1; k <= st; k++) if (quand[k] === undefined) quand[k] = h - 100;
          if (mort === null && chien.faim() >= 72) mort = h - 100;   // le seuil de chien.tick
        }
        // le plafond : on le nourrit deux fois de suite, le ventre plein
        farm.s.hours = 1000; C.rassasie = 1000; chien.repas(26, true); chien.repas(26, true); chien.repas(26, true);
        const plafond = C.rassasie - 1000;
        // trois jours sans manger
        farm.s.hours = 2000; C.rassasie = 2000 - 72; const troisJours = chien.faim();
        return { tient, quand, mort, plafond, troisJours, effet: nonos.effet() };
      };
      const r = { avant: mesure(false), apres: mesure(true) };
      esprit.changer = ch0; farm.s = null;
      return JSON.stringify(r);
    })()`));
    const A0 = F.avant, A1 = F.apres;
    log(`la faim du chien — avant le nonos : un repas de viande tient ${A0.tient} h ; il a faim à ${A0.quand[1]} h, maigrit à ${A0.quand[2]} h, ne se lève plus à ${A0.quand[3]} h, meurt à ${A0.mort} h ; trois repas d'affilée : ${A0.plafond} h ; trois jours sans manger : faim ${A0.troisJours} h`);
    log(`                  — après           : un repas de viande tient ${A1.tient} h ; il a faim à ${A1.quand[1]} h, maigrit à ${A1.quand[2]} h, ne se lève plus à ${A1.quand[3]} h, meurt à ${A1.mort} h ; trois repas d'affilée : ${A1.plafond} h ; trois jours sans manger : faim ${A1.troisJours} h (effet : ${A1.effet})`);
    const deux = (a, b, quoi) => { const k = b / a; log(`  ${quoi} : ×${k.toFixed(2)}`); if (!(Math.abs(k - 2) < 0.03)) ko(`${quoi} : ×${k.toFixed(2)} au lieu de ×2`); };
    if (A0.effet || !A1.effet) ko('l’effet du nonos ne s’allume pas comme il faut');
    deux(A0.tient, A1.tient, 'un repas tient');
    deux(A0.quand[1], A1.quand[1], 'le premier stade de faim vient');
    deux(A0.quand[2], A1.quand[2], 'le deuxième stade');
    deux(A0.quand[3], A1.quand[3], 'le troisième stade');
    deux(A0.mort, A1.mort, 'la mort de faim');
    deux(A0.plafond, A1.plafond, 'le ventre plein (plafond)');
    deux(A1.troisJours, A0.troisJours, 'trois jours sans manger pèsent');
    if (A0.mort - A0.tient !== 72) ko(`avant : ${A0.mort - A0.tient} h sans manger avant la mort (attendu 72)`);
    if (A1.mort - A1.tient !== 144) ko(`après : ${A1.mort - A1.tient} h sans manger avant la mort (attendu 144 : six jours)`);

    // ---------------------------------------------------------------- les cinq lieux
    const w = await vallee(J, 1234);
    J.ctx.__w = w;
    const R = JSON.parse(J.ev(`(() => {
      const w = __w, F = w.lm.ferme, A = carte2Acces(w), WL = w.waterLevel, N = 300;
      const cands = nonosCandidats(w);
      const out = { n: N, rates: 0, ms: 0, d1: [], dn: [], sep: 1e9, loin: 0, ko: [], chaines: new Set(), premiers: new Set(), types: {}, lieux: new Set(), cands: cands.length,
        candsProches: cands.filter((c) => Math.hypot(c.x - F.x, c.z - F.z) < 1150).length };
      const accessible = (x, z) => { const i = Math.round(x / A.st), j = Math.round(z / A.st); for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) { const k = (j + b) * A.n + i + a; if (A.R[k] === 1) return true; } return false; };
      for (let s = 0; s < N; s++) {
        const t0 = Date.now();
        const ch = nonosChoisir(w, mulberry32((s * 2654435761 + 12345) >>> 0), { acces: A });
        out.ms += Date.now() - t0;
        if (!ch) { out.rates++; continue; }
        out.chaines.add(ch.map((c) => c.k).join('>'));
        out.premiers.add(ch[0].k);
        let prev = F;
        ch.forEach((c, i) => {
          out.types[c.t] = (out.types[c.t] || 0) + 1; out.lieux.add(c.k);
          const d = Math.hypot(c.x - prev.x, c.z - prev.z);
          (i ? out.dn : out.d1).push(Math.round(d));
          out.loin = Math.max(out.loin, Math.hypot(c.x - F.x, c.z - F.z));
          for (let j = 0; j < i; j++) out.sep = Math.min(out.sep, Math.hypot(c.x - ch[j].x, c.z - ch[j].z));
          const h = w.heightAt(c.ix, c.iz);
          if (h < WL + 0.35) out.ko.push(c.k + ' : l’indice est dans l’eau');
          if (!accessible(c.ix, c.iz)) out.ko.push(c.k + ' : l’indice n’est pas joignable à pied');
          if (!nonosSol(w, A, c.ix, c.iz, i === 4 ? 1.0 : 0.45, null)) out.ko.push(c.k + ' : l’indice est mal posé');
          if (Math.hypot(c.ix - c.x, c.iz - c.z) > 22) out.ko.push(c.k + ' : l’indice est loin du lieu');
          prev = c;
        });
      }
      const st = (a) => { a.sort((x, y) => x - y); return { min: a[0], med: a[a.length >> 1], max: a[a.length - 1] }; };
      return JSON.stringify(Object.assign(out, { d1: st(out.d1), dn: st(out.dn), chaines: out.chaines.size, premiers: out.premiers.size, lieux: out.lieux.size, ko: [...new Set(out.ko)].slice(0, 12), nko: out.ko.length }));
    })()`));
    log(`vallée 1234 : ${R.cands} lieux possibles (${R.candsProches} à moins de 1 150 m de la ferme) ; ${R.n} tirages en ${R.ms} ms (${(R.ms / R.n).toFixed(1)} ms chacun, grille faite une fois)`);
    log(`  ratés : ${R.rates} ; chaînes différentes : ${R.chaines} / ${R.n} ; premiers lieux différents : ${R.premiers} ; lieux servis : ${R.lieux}`);
    log(`  ferme → premier lieu : ${R.d1.min} / ${R.d1.med} / ${R.d1.max} m (min / médiane / max) ; d'un lieu au suivant : ${R.dn.min} / ${R.dn.med} / ${R.dn.max} m ; écart minimal entre deux lieux : ${Math.round(R.sep)} m ; le plus loin de la ferme : ${Math.round(R.loin)} m`);
    log(`  sortes de lieux tirées : ${Object.entries(R.types).sort((a, b) => b[1] - a[1]).map(([k, n]) => k + ' ' + n).join(', ')}`);
    if (R.rates) ko(`${R.rates} tirages sans chemin de cinq lieux`);
    if (R.nko) { ko(`${R.nko} indices mal placés`); for (const m of R.ko) log('    ' + m); }
    if (R.d1.min < 110 / 1.5 || R.d1.max > 380 * 1.5) ko('premier lieu hors des distances voulues');
    if (R.dn.min < 150 / 1.5 || R.dn.max > 430 * 1.5) ko('lieux successifs hors des distances voulues');
    if (R.sep < 140 / 1.5) ko('deux lieux de la même chaîne trop proches');
    if (R.loin > 1150) ko('un lieu trop loin de la ferme');
    if (R.chaines < R.n * 0.9) ko('les parties se ressemblent trop (chaînes)');
    if (R.premiers < 6) ko('trop peu de premiers lieux différents');
    return { echecs };
  },
};
