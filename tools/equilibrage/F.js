// Équilibrage — LE HASARD DE LA VALLÉE (agent F, douzième vague) : les événements nouveaux (11-zzzzF-*.js).
//   node tools/equilibrage.js F
// Mesure, sur des centaines de parties simulées (graines 1…N, 288 jours chacune), combien de fois chaque événement
// arrive, selon le joueur :
//  - le TIRAGE DU JOUR (hasardF.planJour, déterministe : la graine et le jour) est rejoué tel quel dans le jeu chargé ;
//  - les tirages AU FIL DU TEMPS (D.tirage === 'heure', hasardHeure : tant de fois par heure de jeu passée au bon
//    endroit) suivent un joueur « typique » : le nombre d'heures qu'il passe, chaque jour, là où l'événement peut
//    arriver (HEURES, plus bas) ; la règle du moteur (jamais plus de deux le même jour) est appliquée.
// Trois joueurs : « nouveau » (rien : ni bêtes ni cultures), « fermier » (des poules, une vache, un mouton, douze
// rangs de cultures, le chien, un bienfait de temps en temps), « sombre » (le fermier, l'esprit très bas : 5).
'use strict';

const SEEDS = +(process.env.F_GRAINES || 120);
const JOURS = 288;
// heures passées chaque jour (en moyenne) là où chaque événement « au fil du temps » peut arriver, joueur typique :
// éveillé la nuit dehors ≈ 1,1 h (voir hasard.js : 1,85 h éveillé entre 22 h et 4 h, dehors 60 %), dont un tiers loin
// des villages ; au bord du lac ou du marais ≈ 0,5 h par jour ; en forêt ≈ 1,5 h par jour ; etc.
// (h : heures du contexte ; w : part des jours où la météo le permet)
const HEURES = {
  rayon_vert: { h: 0.25 * 0.15, w: 0.5 },      // au bord du lac, au moment précis où le soleil touche l'horizon, ciel clair
  saint_elme: { h: 1.2 * 0.6, w: 0.09 },       // dehors pendant un orage, le soir ou la nuit
  loups_choeur: { h: 1.1 * 0.35, w: 0.85 },    // la nuit dehors, loin des maisons, landes, hauteurs, bois
  brame: { h: 0.5, w: 0.85 },                  // en forêt au crépuscule ou la nuit
  etourneaux: { h: 0.15, w: 0.8 },             // au bord du lac ou au marais, entre 17 h et 18 h 40
  chauves_souris: { h: 0.06, w: 0.85 },        // près d'une grotte, entre 18 h et 19 h 30
  renardeaux: { h: 0.4, w: 0.85 },             // dehors à l'aube, dans les bois ou les prés (pas à la ferme)
  chanson_puits: { h: 0.25, w: 1 },            // la nuit, à moins de quarante pas d'un puits
  table_mise: { h: 0.03, w: 1 },               // le soir, aux abords du hameau abandonné
  chien_noir: { h: 0.3, w: 1 },                // la nuit sur les chemins, hors des villages
  dame_blanche: { h: 0.3, w: 1 },              // idem
  chasse_volante: { h: 1.1 * 0.4, w: 0.75 },   // la nuit dehors, en terrain ouvert ou en forêt, ciel dégagé
  meneur_loups: { h: 0.6, w: 1 },              // au crépuscule ou la nuit, landes, hauteurs, bois
  tambour_dessous: { h: 0.35, w: 1 },          // le soir ou la nuit, sur les hauteurs, les landes, près de la mine ou de la ville
  fenetre_allumee: { h: 0.04, w: 1 },          // la nuit, en vue du hameau abandonné
};
const JOUEURS = [['nouveau', 70, false], ['fermier', 70, true], ['sombre', 5, true]];

// ---------------------------------------------------------------- dans le jeu (machine virtuelle)
function installerDansLeJeu() {
  globalThis.__F = {
    // une partie neuve, sans monde ; le fermier a des bêtes, des cultures, un chien
    neuf(seed, esprit, fermier) {
      farm.s = farm.blank(seed);
      farm.s.esprit = esprit; farm.s.hours = 6.5; farm.s.sommeil = { debout: 6.5, nuits: 0, veilleMax: 0 };
      evenements._plans.clear();
      const av = strange.applyVersion; strange.applyVersion = () => {};
      try { strange.init(farm.s); } finally { strange.applyVersion = av; }
      if (fermier) {
        for (const k of ['hen', 'hen', 'hen', 'hen', 'cow', 'sheep']) farm.s.animals.push(farm.newAnimal(k));
        for (let i = 0; i < 12; i++) farm.s.crops[i + ',0'] = { c: 'ble', g: 1 };
      }
      farm.s.evF = null;
      return hasardF.S();
    },
    // rejoue le tirage du jour et les tirages au fil du temps, jour après jour ; renvoie les comptes
    jouer(seeds, esprit, fermier, D, H) {
      const R = { jours: 0, n: {}, deux: 0, trois: 0, total: 0, parJour: [], avant: {}, ecartMin: {}, heure: 0 };
      for (let seed = 1; seed <= seeds; seed++) {
        const S = this.neuf(seed, esprit, fermier), rnd = mulberry32(seed * 7331 + 17), dernier = {}, longs = {};
        for (let d = 1; d <= D; d++) {
          farm.s.day = d; R.jours++;
          // un bienfait de temps en temps (un enfant ramené, des draps…) : le fermier rend service une fois par semaine
          if (fermier && rnd() < 1 / 7) S.bienfaits.push({ d, qui: 'enfant' });
          for (const id in longs) if (d >= longs[id]) { delete S.long[id]; delete longs[id]; }
          const P = hasardF.planJour(d);
          let n = 0;
          const compte = (id) => {
            n++; R.total++; R.n[id] = (R.n[id] || 0) + 1;
            if (dernier[id] !== undefined) R.ecartMin[id] = Math.min(R.ecartMin[id] ?? 1e9, d - dernier[id]);
            dernier[id] = d; S.derniers[id] = d; S.n[id] = (S.n[id] || 0) + 1;
            if (d < (HF[id].premier ?? HF_FREQ.premier)) R.avant[id] = (R.avant[id] || 0) + 1;
            if (id === 'cigognes') { S.long[id] = {}; longs[id] = d + 6; }
            if (id === 'comete') { S.long[id] = {}; longs[id] = d + 7; }
            if (id === 'panier_porte') S.bienfaits.pop();
          };
          for (const e of P.liste) compte(e.id);
          // au fil du temps (quota : deux par jour)
          for (const id of HF_IDS) {
            const Dd = HF[id];
            if (Dd.tirage !== 'heure' || n >= HF_FREQ.maxJour) continue;
            if (d < (Dd.premier ?? HF_FREQ.premier)) continue;
            if (dernier[id] !== undefined && d - dernier[id] < (Dd.ecart ?? HF_FREQ.ecart)) continue;
            if (Dd.fois && (S.n[id] || 0) >= Dd.fois) continue;
            const C = H[id] || { h: 0, w: 0 };
            if (rnd() > C.w) continue;
            const biz = Dd.etrange ? (typeof bizarrerie === 'function' ? bizarrerie() : 1) : 1;
            if (rnd() < 1 - Math.exp(-Dd.parHeure * biz * C.h)) { compte(id); R.heure++; }
          }
          R.parJour.push(n);
          if (n === 2) R.deux++;
          if (n > 2) R.trois++;
        }
      }
      R.parJour = null;
      return JSON.stringify(R);
    },
  };
}

// ---------------------------------------------------------------- outils d'affichage
const f1 = (x) => (Number.isFinite(x) ? x.toFixed(1) : '—');
const f2 = (x) => (Number.isFinite(x) ? x.toFixed(2) : '—');
const unSur = (n, jours) => (n ? '1/' + Math.round(jours / n) : 'jamais');
function tableau(log, titres, lignes) {
  const L = [titres, ...lignes].map((r) => r.map(String));
  const w = titres.map((_, i) => Math.max(...L.map((r) => (r[i] || '').length)));
  for (const r of L) log('  ' + r.map((c, i) => (i ? c.padStart(w[i]) : c.padEnd(w[i]))).join('   '));
}

module.exports = {
  titre: 'Le hasard de la vallée (agent F) : les événements nouveaux — fréquences, quota du jour, traces',
  async verifier(J, log) {
    let echecs = 0;
    const verif = (ok, texte) => { if (!ok) echecs++; log(`  ${ok ? 'ok   ' : 'ÉCHEC'} ${texte}`); };
    J.ev(`(${installerDansLeJeu.toString()})()`);
    // ------------------------------------------------------------ 1. l'inventaire
    const INV = JSON.parse(J.ev(`JSON.stringify(HF_IDS.map((id) => { const D = HF[id], T = hfT(id); return { id, cat: D.cat, tirage: D.tirage, etrange: !!D.etrange, lancer: typeof D.lancer === 'function', journal: !!T.journal, apres: (T.apres || []).length, pendant: (T.pendant || []).length, fois: D.fois || 0, ecart: D.ecart ?? HF_FREQ.ecart, premier: D.premier ?? HF_FREQ.premier, parHeure: D.parHeure || 0 }; }))`));
    const cats = {};
    for (const e of INV) cats[e.cat] = (cats[e.cat] || 0) + 1;
    log(`1. ${INV.length} événements : ` + Object.entries(cats).map(([k, n]) => `${J.avec({ k }, 'HF_CATS[__v.k]')} ${n}`).join(', ') + ` ; ${INV.filter((e) => e.tirage === 'jour').length} tirés au jour, ${INV.filter((e) => e.tirage === 'heure').length} au fil du temps, ${INV.filter((e) => e.etrange).length} étranges (× bizarrerie)`);
    verif(INV.length >= 55, `au moins cinquante-cinq événements nouveaux (${INV.length})`);
    verif(Object.keys(cats).length === 6 && Object.values(cats).every((n) => n >= 8), 'les six familles (ciel, bêtes, villages, ferme, routes, étrange), huit au moins chacune');
    verif(INV.every((e) => e.lancer && e.journal && e.apres > 0), 'chacun a son déroulement, une ligne au carnet et ce qu’en disent les habitants');
    verif(INV.filter((e) => e.tirage === 'heure').every((e) => e.parHeure > 0 && e.parHeure <= 1.5), 'les tirages au fil du temps sont des fois par heure de jeu (hasardHeure), jamais par image');
    verif(INV.every((e) => e.ecart >= 4), 'jamais deux fois le même en moins de quatre jours');
    {
      // le déclenchement pour les essais : chacun répond à hasardF.declencher et à evenements.declencher
      const ok = J.ev(`typeof hasardF.declencher === 'function' && typeof evenements.declencher === 'function' && HF_IDS.every((id) => HF[id] && HF[id].id === id)`);
      verif(ok, 'chacun se déclenche à la demande : hasardF.declencher(id), evenements.declencher(id)');
    }

    // ------------------------------------------------------------ 2. les fréquences, joueur par joueur
    const RES = {};
    for (const [nom, esprit, fermier] of JOUEURS) RES[nom] = JSON.parse(J.avec({ S: SEEDS, e: esprit, f: fermier, D: JOURS, H: HEURES }, '__F.jouer(__v.S, __v.e, __v.f, __v.D, __v.H)'));
    log(`\n2. Combien de fois (${SEEDS} parties de ${JOURS} jours par joueur ; « 1/N » : une fois tous les N jours de jeu en moyenne)`);
    const col = JOUEURS.map(([n]) => n);
    tableau(log, ['événement', 'famille', 'tirage', ...col], INV.map((e) => [e.id, e.cat, e.tirage, ...col.map((n) => unSur(RES[n].n[e.id], RES[n].jours))]));
    tableau(log, ['', ...col], [
      ['tous confondus, par jour', ...col.map((n) => f2(RES[n].total / RES[n].jours))],
      ['  dont au fil du temps', ...col.map((n) => f2(RES[n].heure / RES[n].jours))],
      ['jours à deux événements', ...col.map((n) => f1(RES[n].deux / RES[n].jours * 100) + ' %')],
      ['jours à trois ou plus', ...col.map((n) => String(RES[n].trois))],
    ]);
    const F = RES.fermier, N = RES.nouveau, So = RES.sombre;
    verif(col.every((n) => RES[n].total / RES[n].jours >= 0.5 && RES[n].total / RES[n].jours <= 1.6), `pas plus d’un ou deux par jour en moyenne, tous confondus (${col.map((n) => n + ' ' + f2(RES[n].total / RES[n].jours)).join(', ')} ; cible 0,5 à 1,6)`);
    verif(col.every((n) => RES[n].trois === 0), 'jamais plus de deux le même jour');
    const jamais = INV.filter((e) => !col.some((n) => RES[n].n[e.id]));
    verif(!jamais.length, `chacun arrive dans au moins une partie (${jamais.length ? 'jamais : ' + jamais.map((e) => e.id).join(', ') : 'tous'})`);
    const tropSouvent = INV.filter((e) => col.some((n) => RES[n].n[e.id] && RES[n].jours / RES[n].n[e.id] < (e.id === 'panier_porte' ? 6 : 12)));
    verif(!tropSouvent.length, `aucun n’est fréquent : au plus une fois tous les douze jours en moyenne (six pour le panier des bienfaits) ${tropSouvent.length ? '— trop souvent : ' + tropSouvent.map((e) => e.id).join(', ') : ''}`);
    const avant = col.flatMap((n) => Object.keys(RES[n].avant));
    verif(!avant.length, `rien avant son jour (« premier ») : ${avant.length ? avant.join(', ') : 'respecté'}`);
    const ecarts = INV.filter((e) => col.some((n) => (RES[n].ecartMin[e.id] ?? 1e9) < e.ecart));
    verif(!ecarts.length, `l’écart entre deux fois le même est respecté ${ecarts.length ? '— non : ' + ecarts.map((e) => e.id).join(', ') : ''}`);
    const ferme = INV.filter((e) => e.cat === 'ferme').map((e) => e.id);
    verif(ferme.every((id) => !N.n[id] || ['comice', 'rats_grange', 'vagabond_grange', 'panier_porte'].includes(id)), 'la ferme sans bêtes ni cultures n’a ni renard, ni sangliers, ni couvée, ni mise bas');
    const etr = INV.filter((e) => e.etrange).map((e) => e.id), sE = (R) => etr.reduce((a, id) => a + (R.n[id] || 0), 0);
    verif(sE(So) > sE(F), `l’étrange vient plus souvent quand l’esprit s’assombrit (${unSur(sE(F), F.jours)} → ${unSur(sE(So), So.jours)} jours)`);
    return { echecs };
  },
};
