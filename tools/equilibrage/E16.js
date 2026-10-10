// Équilibrage des clins d'œil (agent E16, seizième vague)
//   node tools/equilibrage.js E16
// - Les récompenses restent petites : les objets cachés valent peu, les soins et la faim apaisée sont bornés, une fois
//   par jour ; les pièces (anneaux, pelle) restent des miettes ; tout ce qu'on ne trouve qu'une fois vaut moins
//   d'une journée de travail du début.
// - Tout est atteignable : les choses posées le sont (graines 1234 et 4242), au sec, hors des murs ; les cases des
//   Galeries sont ouvertes ; les deux tuyaux sont loin l'un de l'autre ; chaque rencontre a des heures possibles, des
//   lieux qui existent dans la vallée, une chance ni nulle ni trop forte.
// - Rien du monde ne bouge (la pose est faite au chargement, et ne touche ni aux objets ni aux objets posés).
// - Secret : les objets « e16 » sont hors des découvertes ; le wiki (tools/wiki-build.js) les écarte ; le README et
//   les sources du wiki n'en disent rien.
'use strict';
const fs = require('fs');
const path = require('path');
const { vallee, empreinte, EMPREINTE_1234, charger } = require('./vm.js');

const JOURNEE_DEBUT = 375; // pièces (domaine commerce)
const LIEUX = ['tuyau0', 'tuyau1', 'epee', 'feu', 'craie0', 'craie1', 'craie2', 'gateau', 'cube', 'cerises', 'levier', 'machine', 'bouteille', 'fraise', 'crane', 'etoile', 'guimauve', 'livre'];
const SOUS = new Set(['gateau', 'cube', 'cerises']);

module.exports = {
  titre: 'Les clins d’œil (E16) : petites récompenses, tout atteignable, rien d’affiché',
  async verifier(J, log) {
    const E = [];
    const ko = (m) => { E.push(m); log('  ÉCHEC : ' + m); };

    // ---------------------------------------------------------------- 1. les récompenses
    log('# 1. Les récompenses');
    const R = JSON.parse(J.ev('JSON.stringify(e16Regl)'));
    const it = JSON.parse(J.ev("JSON.stringify(Object.values(ITEMS).filter((i) => i.e16).map((i) => ({ id: i.id, price: i.price, heal: i.heal || 0, food: i.food || 0 })))"));
    log(`objets cachés : ${it.map((i) => `${i.id} (${i.price} p.${i.heal ? ', soin ' + i.heal : ''})`).join(', ')}`);
    if (it.length < 3) ko('les objets cachés manquent');
    for (const i of it) { if (i.price > 20) ko(`${i.id} vaut ${i.price} pièces (> 20)`); if (i.heal > 30) ko(`${i.id} soigne de ${i.heal} (> 30)`); }
    const prix = (id) => J.avec({ id }, 'ITEMS[__v.id] ? ITEMS[__v.id].price : 0');
    const graine = Math.max(...['graines_navet', 'graines_panais', 'graines_radis', 'graines_carotte'].map(prix));
    const once = it.reduce((a, i) => a + i.price, 0) + R.cerises * prix('cerise') + R.fraises * prix('fraise_bois') + R.graines * graine + 2 * prix('bougie');
    const anneaux = R.anneaux * R.anneauSous, pelle = R.pelle * (R.pelleSous[0] + R.pelleSous[1]) / 2;
    log(`une fois pour toutes : ${once} pièces ; un hérisson : ${anneaux} pièces ; la pelle : ${pelle.toFixed(3)} pièce par trou en moyenne ; repos au feu ${R.feuSoin} PV, étoile ${R.etoileSoin} PV, guimauve ${R.guimauve} de faim (chacun une fois par jour)`);
    if (once > JOURNEE_DEBUT) ko(`ce qu’on trouve une fois vaut ${once} pièces (> une journée, ${JOURNEE_DEBUT})`);
    if (anneaux > 10) ko(`un hérisson sème ${anneaux} pièces (> 10)`);
    if (R.pelle > 1 / 80 || R.pelleSous[1] > 10) ko('la pelle fait trop sonner les pièces');
    if (pelle > 0.1) ko(`la pelle rapporte ${pelle.toFixed(2)} pièce par trou en moyenne`);
    if (R.feuSoin > 40) ko(`le feu soigne de ${R.feuSoin} (> 40, moins qu’une potion de soin)`);
    if (R.etoileSoin > 20) ko(`l’étoile soigne de ${R.etoileSoin}`);
    if (R.guimauve > 10) ko(`la guimauve apaise ${R.guimauve} de faim`);
    if (R.parler > 0.1 || R.garde > 0.1) ko('les habitants parlent trop souvent de leurs clins d’œil');

    // ---------------------------------------------------------------- 2. les rencontres
    log('\n# 2. Les rencontres');
    const S = JSON.parse(J.ev('JSON.stringify(Object.fromEntries(Object.entries(e16.sortes).map(([k, D]) => [k, { p: D.p, attente: D.attente, cond: String(D.cond) }])))'));
    const noms = Object.keys(S);
    log(`${noms.length} sortes : ${noms.map((k) => `${k} (${(S[k].p * 100).toFixed(1)} %, ${S[k].attente} j)`).join(', ')}`);
    if (noms.length < 15) ko(`seulement ${noms.length} rencontres`);
    for (const k of noms) {
      if (!(S[k].p > 0) || S[k].p > 0.5) ko(`${k} : chance ${S[k].p}`);
      if (!(S[k].attente >= 1)) ko(`${k} : revient le jour même`);
    }

    // ---------------------------------------------------------------- 3. la vallée 1234 : rien ne bouge, tout est posé, les rencontres ont leur lieu
    log('\n# 3. La vallée (graine 1234)');
    const t0 = Date.now();
    const w = await vallee(J, 1234);
    log(`(vallée 1234 générée en ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    J.ctx.__w = w;
    const avant = { o: w.objects.length, p: w.props.length, i: w.inter.length, b: w.blocks.length };
    const L = J.ev('e16Lieux.placer(__w, 1234)');
    const emp = empreinte(w, [98896, 1308, 516]);
    if (emp !== EMPREINTE_1234) ko('empreinte 1234 changée');
    if (w.objects.length !== avant.o || w.props.length !== avant.p || w.inter.length !== avant.i || w.blocks.length !== avant.b) ko('la pose touche aux listes du monde');
    log(`empreinte : ${emp === EMPREINTE_1234 ? 'inchangée' : emp} ; listes du monde : ${w.objects.length === avant.o && w.props.length === avant.p && w.inter.length === avant.i ? 'intactes' : 'CHANGÉES'}`);
    this.lieux(J, w, L, ko, log);
    // les lieux des rencontres
    for (const k of ['hameau_abandonne', 'cimetiere', 'chapelle', 'auberge', 'ferme', 'estive', 'ruines', 'tour', 'g1_corps_garde', 'pont_riviere']) if (!w.lm[k]) ko(`la vallée n’a pas de « ${k} » (une rencontre ne viendrait pas)`);
    if (!w.maze || !w.maze.open) ko('pas de labyrinthe des Galeries');
    // les conditions : un contexte possible pour chacune (heure, lieu, milieu)
    const essais = {
      sonic: { h: 12, mi: 'pres' }, luigi: { h: 23, lm: 'hameau_abandonne' }, boo: { h: 23, lm: 'cimetiere' }, pacman: { lab: true }, creeper: { h: 23, lm: 'ferme', mi: 'pres' },
      mouton: { h: 12, mi: 'pres' }, fee: { h: 23, mi: 'foret' }, chocobo: { h: 12, lm: 'estive', mi: 'alpage' }, rayman: { h: 12, mi: 'foret' }, esprits: { h: 19, lm: 'ferme' },
      gman: { h: 6, lm: 'pont_riviere' }, sorcier: { h: 22, lm: 'auberge' }, soleil: { h: 12, lm: 'ruines' }, ombre: { h: 5, mi: 'foret' }, voyageur: { h: 12, mi: 'alpage' },
      masque: { lab: true }, tonneau: { pente: true }, caisse: { h: 23, lm: 'g1_corps_garde' },
    };
    J.ev('farm.w = __w');
    for (const k of noms) {
      const T = essais[k];
      if (!T) { ko(`${k} : pas d’essai de ses conditions`); continue; }
      const P = T.lm ? w.lm[T.lm] : { x: w.lm.ferme.x, z: w.lm.ferme.z };
      const C = { w, p: { riding: null, pos: [P.x, 0, P.z] }, x: P.x + 3, z: P.z + 3, y: 0, h: T.h || 12, f: [0, 0, 1], sous: !!T.lab, dansLab: !!T.lab, nuit: (T.h || 12) >= 21 || (T.h || 12) < 4.5, jourPlein: (T.h || 12) >= 8 && (T.h || 12) < 18.5, mi: T.mi || 'pres', wet: 0, fog: 0, alt: T.mi === 'alpage' ? 50 : 5 };
      if (T.pente) {
        // un coin de pente douce (comme sous le moulin, la mine) : on le cherche
        let ok = false;
        for (let i = 0; i < 4000 && !ok; i++) { const x = 300 + Math.random() * (w.size - 600), z = 300 + Math.random() * (w.size - 600), n = w.normalAt(x, z); if (n[1] < 0.95 && n[1] > 0.7 && w.heightAt(x, z) > w.waterLevel + 1) { C.x = x; C.z = z; ok = true; } }
        if (!ok) { ko('tonneau : aucune pente douce'); continue; }
      }
      J.ctx.__C = C;
      const r = J.avec({ k }, 'e16.cond(__v.k, __C)');
      log(`${k} : ${r ? 'possible' : 'IMPOSSIBLE'} (${T.lm ? T.lm + ', ' : ''}${T.lab ? 'Galeries, ' : ''}${T.h !== undefined ? T.h + ' h' : ''}${T.mi ? ', ' + T.mi : ''})`);
      if (!r) ko(`${k} : ses conditions ne sont jamais réunies`);
    }

    // ---------------------------------------------------------------- 4. une autre graine
    log('\n# 4. Une autre graine (4242)');
    {
      const J2 = charger();
      const w2 = await vallee(J2, 4242);
      J2.ctx.__w = w2;
      const L2 = J2.ev('e16Lieux.placer(__w, 4242)');
      this.lieux(J2, w2, L2, ko, log);
    }

    // ---------------------------------------------------------------- 5. le secret
    log('\n# 5. Le secret');
    const ROOT = path.join(__dirname, '..', '..');
    const wb = fs.readFileSync(path.join(ROOT, 'tools', 'wiki-build.js'), 'utf8');
    if (!/admin\|camera\|E16/.test(wb)) ko('tools/wiki-build.js ne met pas les modules E16 de côté');
    if (!/\.e16\b/.test(wb) || !/e16_/.test(wb)) ko('tools/wiki-build.js n’écarte pas les objets et les interactions e16');
    const txt = [fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8'), ...fs.readdirSync(path.join(ROOT, 'tools')).filter((f) => /^wiki-v/.test(f)).map((f) => fs.readFileSync(path.join(ROOT, 'tools', f), 'utf8'))].join('\n');
    const mots = it.map((i) => J.avec({ id: i.id }, 'ITEMS[__v.id].name')).concat(['Mamma mia', 'gâteau est un mensonge', 'flèche dans le genou', 'Louez le soleil']);
    const fuites = mots.filter((m) => txt.includes(m));
    log(`README et sources du wiki : ${fuites.length ? 'parlent de ' + fuites.join(', ') : 'n’en disent rien'}`);
    if (fuites.length) ko('le README ou le wiki parlent des clins d’œil');
    const cat = J.ev("(() => { const s0 = farm.s; farm.s = { day: 1, decouvertes: {} }; try { return decouvertes.catalogue().filter((id) => /^it:e16_/.test(id)).length; } catch (e) { return 'erreur : ' + e.message; } finally { farm.s = s0; } })()");
    log(`objets e16 dans le catalogue des découvertes : ${cat}`);
    if (cat !== 0) ko('des objets e16 sont au catalogue des découvertes (' + cat + ')');
    return { echecs: E.length };
  },

  lieux(J, w, L, ko, log) {
    const WL = w.waterLevel, M = w.maze;
    const manque = LIEUX.filter((k) => !L[k]);
    log(`choses posées : ${Object.keys(L).length} / ${LIEUX.length}${manque.length ? ' (manque : ' + manque.join(', ') + ')' : ''}`);
    if (manque.length) ko('choses non posées : ' + manque.join(', '));
    for (const k of Object.keys(L)) {
      const P = L[k];
      if (SOUS.has(k)) {
        const i = Math.floor((P.x - M.x0) / M.R), j = Math.floor((P.z - M.z0) / M.R);
        if (M.open[j * M.G + i] !== 1) ko(`${k} : case fermée des Galeries`);
        continue;
      }
      const h = w.heightAt(P.x, P.z);
      if (h < WL + 0.05) ko(`${k} : dans l’eau (${(h - WL).toFixed(2)} m)`);
      if (!w.inside(P.x, P.z, 20)) ko(`${k} : hors de la vallée`);
      J.ctx.__P = P;
      if (!J.ev('pointFree(__w, __P.x, __P.z, 0.3)')) ko(`${k} : dans un mur`);
    }
    if (L.tuyau0 && L.tuyau1) { const d = Math.hypot(L.tuyau0.x - L.tuyau1.x, L.tuyau0.z - L.tuyau1.z); log(`les deux tuyaux : ${Math.round(d)} m l’un de l’autre`); if (d < 100) ko('les deux tuyaux sont trop près'); }
    if (L.fraise) log(`la fraise : ${(L.fraise.y - WL).toFixed(0)} m au-dessus de l’eau`);
  },
};
