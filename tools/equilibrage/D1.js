// Équilibrage — les CINQUANTE PLANTES de l'agent D1 (05-zzzzzD1-plantes.js, 11-zzzzD1-plantes.js) :
//   node tools/equilibrage.js D1
// 1. dix plantes par milieu (les prés, la ferme, la ville, la lande, les hauteurs), chacune son type du décor, son
//    objet (le même identifiant), son nom, sa notice d'herbier, ses milieux, sa rareté, son prix (celui de sa rareté),
//    ses essences, son effet (cru ou cuit), au moins un acheteur ; les vénéneuses ont une cause de mort ;
// 2. celles qu'il faut faire nommer : leur allure, et ce qu'en dit l'alchimiste ; la liqueur de vérâtre porte le nom
//    de la liqueur de gentiane tant qu'on ne l'a pas fait nommer, et l'aubergiste ne l'achète pas ;
// 3. ce qu'on en fait (recettes, alambic, tonneau) ne crée pas d'argent de rien ;
// 4. le peuplement (graine 1234) : chaque plante pousse, en nombre selon sa rareté, surtout dans son milieu ; rien
//    dans l'eau, rien devant une interaction ou une porte, rien sur le champ de la ferme ; les objets d'avant ne
//    bougent pas (empreintes) ; une plante cueillie rapporte au plus 30 pièces.
'use strict';
const { vallee, empreinte, EMPREINTE_1234 } = require('./vm.js');

module.exports = {
  titre: 'Plantes D1 : cinquante espèces des prés, de la ferme, de la ville, de la lande et des hauteurs',
  async verifier(J, log) {
    let echecs = 0;
    const verif = (ok, texte) => { if (!ok) echecs++; log(`  ${ok ? 'ok   ' : 'ÉCHEC'} ${texte}`); };

    log('\n1. Les espèces');
    const A = JSON.parse(J.ev(`(() => {
      const R = { parBio: {}, mal: [], sansAcheteur: [], sansCause: [], prix: [], rares: {} };
      const acheteurs = {};
      for (const d of NPC_DATA) if (d.shop) for (const x of d.shop.buys || []) { const k = Array.isArray(x) ? x[0] : x; (acheteurs[k] || (acheteurs[k] = [])).push(d.id); }
      const esp = {}; for (const e of ESPECES_PLANTES) esp[e[0]] = e;
      for (const P of D1_PLANTES) {
        R.parBio[P.bio] = (R.parBio[P.bio] || 0) + 1;
        if (P.r >= 2) R.rares[P.bio] = (R.rares[P.bio] || 0) + 1;
        const t = OBJ_TYPES[OBJ_INDEX[P.o]], I = ITEMS[P.o], H = HARVEST[P.o], E = ALIMENTS_EFFETS[P.o];
        const m = [];
        if (!t || t.hidden || !(t.spr && t.spr.length)) m.push('type');
        if (!I || !I.name || !I.desc || I.cat !== 'cueillette') m.push('objet');
        if (!H || !H.drop || H.drop[0][0] !== P.o) m.push('cueillette');
        if (!NOTICE_PLANTES[P.o] || !esp[P.o] || !esp[P.o][1].length) m.push('herbier');
        if (!ESSENCES[P.o] || !I || !I.alch) m.push('essences');
        if (!E || !E.r || !E.r.length) m.push('effet');
        if (I && I.price !== (P.prix || D1_PRIX[P.r])) m.push('prix ' + I.price);
        if (m.length) R.mal.push(P.o + ' (' + m.join(', ') + ')');
        if (!acheteurs[P.o]) R.sansAcheteur.push(P.o);
        if (E && E.r.some((x) => x[0] === 'poison' || x[0] === 'paralysie') && !E.c) R.sansCause.push(P.o);
        R.prix.push(I ? I.price * (P.n[0] + P.n[1]) / 2 : 0);
      }
      R.n = D1_PLANTES.length; R.ids = new Set(D1_IDS).size;
      R.valMax = Math.max(...R.prix);
      return JSON.stringify(R);
    })()`));
    verif(A.n === 50 && A.ids === 50 && ['plaine', 'ferme', 'ville', 'lande', 'hauteurs'].every((b) => A.parBio[b] === 10), `50 espèces, dix par milieu : ${JSON.stringify(A.parBio)}`);
    verif(!A.mal.length, 'chacune son type, son objet, sa cueillette, sa notice, ses milieux, ses essences, son effet, son prix' + (A.mal.length ? ' — à reprendre : ' + A.mal.join(' ; ') : ''));
    verif(['plaine', 'ferme', 'ville', 'lande', 'hauteurs'].every((b) => A.rares[b] >= 2), `au moins deux rares (ou plus rares) par milieu : ${JSON.stringify(A.rares)}`);
    verif(!A.sansAcheteur.length, 'chacune a au moins un acheteur' + (A.sansAcheteur.length ? ' — sans : ' + A.sansAcheteur.join(', ') : ''));
    verif(!A.sansCause.length, 'les vénéneuses disent ce qui a tué' + (A.sansCause.length ? ' — sans cause : ' + A.sansCause.join(', ') : ''));
    verif(A.valMax <= 30, `une cueillette rapporte au plus ${A.valMax} pièces (≤ 30)`);

    log('\n2. Les noms : l’alchimiste');
    const B = JSON.parse(J.ev(`(() => {
      const R = { allures: 0, sansRem: [], sansVrai: [] };
      for (const id of D1_IDS.concat(['liqueur_veratre'])) {
        if (!PLANT_LOOK[id]) continue;
        R.allures++;
        if (!alchimie.VRAI[id]) R.sansVrai.push(id);
        if (!alchimie.REM[id]) R.sansRem.push(id);
      }
      R.liqueur = ITEMS.liqueur_veratre.name === ITEMS.liqueur_gentiane.name && JSON.stringify(ITEMS.liqueur_veratre.ic) === JSON.stringify(ITEMS.liqueur_gentiane.ic);
      const aub = NPC_DATA.find((d) => d.id === 'aubergiste'), alc = NPC_DATA.find((d) => d.id === 'alchimiste');
      R.aubergiste = (aub.shop.buys || []).includes('liqueur_veratre');
      R.alchimiste = (alc.shop.buys || []).includes('liqueur_veratre');
      R.veratre = ITEMS.veratre.name; R.gentiane = ITEMS.gentiane_jaune.name;
      return JSON.stringify(R);
    })()`));
    verif(B.allures >= 35 && !B.sansVrai.length && !B.sansRem.length, `${B.allures} choses à faire nommer ; l’alchimiste a un mot pour chacune` + (B.sansRem.length ? ' — sans mot : ' + B.sansRem.join(', ') : '') + (B.sansVrai.length ? ' — sans vrai nom : ' + B.sansVrai.join(', ') : ''));
    verif(B.liqueur && !B.aubergiste && B.alchimiste, 'la liqueur de vérâtre ressemble en tout à celle de gentiane ; l’aubergiste ne l’achète pas, l’alchimiste si');
    log(`  (inconnues, elles s’appellent : « ${B.veratre} » et « ${B.gentiane} »)`);

    log('\n3. Ce qu’on en fait');
    const C = JSON.parse(J.ev(`(() => {
      const v = (id) => (ITEMS[id] ? ITEMS[id].price : 0);
      const L = [];
      for (const r of RECIPES) if (['cafe_chicoree', 'sirop_capillaire'].includes(r.out)) { let c = 0; for (const k in r.need) c += r.need[k] * v(k); L.push([r.out, v(r.out) * r.n, c]); }
      for (const m of ['alambic_cru', 'tonneau']) for (const r of MACHINES[m] || []) if (Object.keys(r.in).some((k) => D1_IDS.includes(k))) { let c = 0; for (const k in r.in) c += r.in[k] * v(k); L.push([m + ':' + r.out[0], v(r.out[0]) * r.out[1], c]); }
      return JSON.stringify(L);
    })()`));
    const trop = C.filter(([, o, c]) => o > Math.max(c * 1.6, c + 12));
    log('  ' + C.map(([k, o, c]) => `${k} ${o} (${c})`).join(' · '));
    verif(C.length >= 8 && !trop.length, `${C.length} recettes ; aucune ne rapporte beaucoup plus que ce qu’elle coûte` + (trop.length ? ' — trop : ' + trop.map((x) => x[0]).join(', ') : ''));

    log('\n4. Le peuplement (graine 1234)');
    const w = await vallee(J, 1234);
    verif(empreinte(w, [98896, 1308, 516]) === EMPREINTE_1234, `les objets d’avant la grande mise à jour ne bougent pas (${empreinte(w, [98896, 1308, 516])})`);
    verif(empreinte(w, [103331, 3384, 931]) === '103331/3384/931/48142f0b97c7', 'ni ceux de la huitième vague');
    J.ctx.__w = w;
    const D = JSON.parse(J.ev(`(() => {
      const w = __w, R = { n: 0, par: {}, chezSoi: {}, eau: 0, devant: 0, champ: 0, manque: [], peu: [], trop: [] };
      const biomeOf = (x, z) => BIOMES[w.biome[Math.min(w.biomeW - 1, Math.max(0, Math.floor(z / 8))) * w.biomeW + Math.min(w.biomeW - 1, Math.max(0, Math.floor(x / 8)))]];
      const ids = new Set(D1_IDS), bio = {};
      for (const P of D1_PLANTES) bio[P.o] = P.bio;
      const fermes = [];
      for (const k of ['ferme', 'ranch', 'maison_hameau_a', 'maison_hameau_b', 'g1_cabane_hameau', 'es_baile', 'es_fromagerie', 'es_patre']) { const b = w.bld[k]; if (b) fermes.push([b.x, b.z]); }
      for (const k of ['moulin', 'bergerie', 'hameau_abandonne', 'ruines', 'chapelle', 'estive_jasse', 'refuge', 'hameau', 'cimetiere']) { const L = w.lm[k]; if (L) fermes.push([L.x, L.z]); }
      const pts = []; for (const it of w.inter) pts.push([it.x, it.z]); for (const d of w.doors || []) if (d && d.x !== undefined) pts.push([d.x, d.z]);
      const fd = w.farm && w.farm.field;
      for (let i = 103331; i < w.objects.length; i++) {
        const o = w.objects[i], T = OBJ_TYPES[o.t];
        if (!ids.has(T.id)) continue;
        R.n++; R.par[T.id] = (R.par[T.id] || 0) + 1;
        const b = biomeOf(o.x, o.z), pres = fermes.some(([x, z]) => Math.hypot(x - o.x, z - o.z) < 70);
        if (b === bio[T.id] || ((bio[T.id] === 'ferme' || bio[T.id] === 'ville') && pres)) R.chezSoi[T.id] = (R.chezSoi[T.id] || 0) + 1;
        if (w.heightAt(o.x, o.z) < w.waterLevel) R.eau++;
        if (pts.some(([x, z]) => Math.abs(x - o.x) < 1.2 && Math.abs(z - o.z) < 1.2)) R.devant++;
        if (fd && o.x > fd.x0 && o.x < fd.x1 && o.z > fd.z0 && o.z < fd.z1) R.champ++;
      }
      const MIN = [8, 4, 2, 1, 1], MAX = [200, 90, 40, 14, 4];
      for (const P of D1_PLANTES) {
        const k = R.par[P.o] || 0;
        if (!k) R.manque.push(P.o); else if (k < MIN[P.r]) R.peu.push(P.o + ' ' + k); else if (k > MAX[P.r]) R.trop.push(P.o + ' ' + k);
      }
      R.mal = D1_PLANTES.filter((P) => (R.par[P.o] || 0) && (R.chezSoi[P.o] || 0) < 0.6 * R.par[P.o]).map((P) => P.o + ' ' + (R.chezSoi[P.o] || 0) + '/' + R.par[P.o]);
      R.parRar = [0, 1, 2, 3, 4].map((r) => D1_PLANTES.filter((P) => P.r === r).map((P) => R.par[P.o] || 0));
      return JSON.stringify(R);
    })()`));
    const moy = (L) => (L.length ? Math.round(L.reduce((a, b) => a + b, 0) / L.length * 10) / 10 : 0);
    log(`  ${D.n} pieds ; par plante, selon la rareté : commune ${moy(D.parRar[0])}, peu commune ${moy(D.parRar[1])}, rare ${moy(D.parRar[2])}, très rare ${moy(D.parRar[3])}, introuvable ${moy(D.parRar[4])}`);
    verif(D.n >= 600 && D.n <= 2000, `${D.n} pieds en tout (600 à 2 000 : quelques milliers au plus avec ceux de l’agent D2)`);
    verif(!D.manque.length && !D.peu.length && !D.trop.length, 'chaque plante pousse, en nombre selon sa rareté' + (D.manque.length ? ' — absentes : ' + D.manque.join(', ') : '') + (D.peu.length ? ' — trop peu : ' + D.peu.join(', ') : '') + (D.trop.length ? ' — trop : ' + D.trop.join(', ') : ''));
    verif(!D.mal.length, 'chacune surtout dans son milieu (au moins 60 % ; les plantes des fermes et des villes : près des fermes, des hameaux et des chalets)' + (D.mal.length ? ' — ailleurs : ' + D.mal.join(', ') : ''));
    verif(!D.eau && !D.devant && !D.champ, `rien dans l’eau (${D.eau}), devant une interaction ou une porte (${D.devant}), sur le champ de la ferme (${D.champ})`);
    return { echecs };
  },
};
