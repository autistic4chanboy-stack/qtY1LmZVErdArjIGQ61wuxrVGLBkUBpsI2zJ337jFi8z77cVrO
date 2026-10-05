// Équilibrage — les BÊTES DES PRÉS, DE LA FERME ET DE LA VILLE (agent E1 : 05-zzzzzE1-betes.js, 11-zzzzE1-betes.js…) :
//   node tools/equilibrage.js E1
// 1. trente espèces, chacune : sa conduite, son modèle (qui se construit), sa notice et sa ligne au livre des bêtes, ce
//    qu'elle laisse à la chasse, son nom pour la chasse, sa place au peuplement (heures, durée) ;
// 2. leur rareté : combien de temps on attend, en moyenne, avant de voir chaque espèce là où elle vit (le peuplement
//    vise, pour chacune, une part du temps selon sa rareté) ;
// 3. les dangereuses restent rares et lisibles : ce que coûtent les frelons, le surmulot acculé, le putois ;
// 4. les objets nouveaux : un nom, une description, un prix modeste ; leurs essences ; les escargots à l'ail ne font pas
//    de miracle (la recette ne vaut guère plus que ce qu'on y met) ;
// 5. les cris : chaque tampon se calcule, sans écrêter, court ; leur niveau (crête × volume) reste doux ;
// 6. les lieux, sur la vallée de la graine 1234 : la ferme (nid de frelons, toiles, âtre, perchoirs, murs), la ville
//    (clocher, nids d'hirondelles, corbeautière, réverbères, douves, lavoir) ; et le monde ne change pas (aucun objet ajouté).
'use strict';
const { vallee } = require('./vm.js');

const f1 = (x) => (Math.round(x * 10) / 10).toLocaleString('fr-FR');

module.exports = {
  titre: 'E1 : les bêtes des prés, de la ferme et de la ville (espèces, rareté, dangers, objets, cris, lieux)',
  async verifier(J, log) {
    let echecs = 0;
    const verif = (ok, texte) => { if (!ok) echecs++; log(`  ${ok ? 'ok   ' : 'ÉCHEC'} ${texte}`); };

    log('\n1. Les espèces');
    const E = JSON.parse(J.ev(`JSON.stringify((() => {
      const R = { n: E1_ESPECES.length, manques: [], biomes: {} };
      for (const [k, nom, hab, rar, dg] of E1_ESPECES) {
        const m = [], C = CREATURES[k];
        if (!C || !C.e1) m.push('réglages');
        if (!E1_CONDUITES[k]) m.push('conduite');
        try { const r = ANIMAL_RIGS[C.rig](0); if (!r || !r.parts.length || !r.e1P) m.push('modèle'); } catch (e) { m.push('modèle (' + e.message + ')'); }
        if (!NOTICE_ANIMAUX[k] || NOTICE_ANIMAUX[k].length < 120) m.push('notice');
        if (!ESPECES_ANIMAUX.some((x) => x[0] === k)) m.push('livre');
        if (!PREY[k]) m.push('chasse');
        if (!CHASSE_NOMS[k]) m.push('nom de chasse');
        const P = E1_PEUPLE[k];
        if (!P || !P.h || !P.vie || typeof P.nait !== 'function' || typeof P.ou !== 'function') m.push('peuplement');
        if (!(rar >= 0 && rar <= 4) || !(dg >= 0 && dg <= 3)) m.push('rareté/danger');
        for (const d of PREY[k] ? PREY[k].drop : []) if (!ITEMS[d[0]]) m.push('objet ' + d[0]);
        if (m.length) R.manques.push(k + ' : ' + m.join(', '));
        (R.biomes[hab[0]] = R.biomes[hab[0]] || []).push(k);
      }
      return R;
    })())`));
    log(`  ${E.n} espèces : prés ${E.biomes.pres.length}, ferme ${E.biomes.ferme.length}, ville ${E.biomes.ville.length}`);
    verif(E.n === 30 && E.biomes.pres.length === 10 && E.biomes.ferme.length === 10 && E.biomes.ville.length === 10 && !E.manques.length,
      'trente espèces (dix par milieu), chacune sa conduite, son modèle, sa notice, sa ligne au livre, sa chasse, son peuplement' + (E.manques.length ? ' — manque : ' + E.manques.join(' ; ') : ''));

    log('\n2. La rareté (attente moyenne, quand tout convient : bon milieu, bonne heure, bon temps)');
    const A = JSON.parse(J.ev(`JSON.stringify(E1_ESPECES.map(([k, nom, hab, rar]) => {
      const P = E1_PEUPLE[k], f0 = P.part ?? E1_PART[rar], vie = (P.vie[0] + P.vie[1]) / 2;
      const r = f0 >= 0.99 ? null : f0 / (vie * (1 - f0));
      return { k, nom, rar, part: f0, attente: r ? 1 / r / 60 : 0, vie: vie / 60 };
    }))`));
    const RAR = ['commune', 'peu commune', 'rare', 'très rare', 'introuvable'];
    for (const a of A) log(`  ${a.nom.padEnd(26)} ${RAR[a.rar].padEnd(12)} là ${Math.round(a.part * 100)} % du temps ; ${a.attente ? 'on l’attend ' + f1(a.attente) + ' min' : 'toujours là (son lieu)'} ; reste ${f1(a.vie)} min`);
    const mal = A.filter((a) => a.attente && ((a.rar === 0 && a.attente > 4) || (a.rar >= 2 && a.attente < 12)));
    verif(!mal.length, 'les communes se voient vite (moins de 4 min d’attente), les rares se méritent (plus de 12 min)' + (mal.length ? ' — ' + mal.map((a) => a.k).join(', ') : ''));

    log('\n3. Les dangers');
    const D = JSON.parse(J.ev('JSON.stringify({ D: E1_DANGER, hp: 100, danger: E1_ESPECES.filter((x) => x[4] > 0).map((x) => x[0]) })'));
    const fr = D.D.frelon, maxF = fr.piqures * fr.degats[1], maxR = D.D.surmulot.degats[1];
    log(`  qui peut faire mal : ${D.danger.join(', ')}`);
    log(`  frelons : on les avertit (une sentinelle tourne autour de la tête à 5 m), la colère vient à ${fr.approche} m après ${fr.patience} s, ou à ${fr.tout_pres} m ; ${fr.piqures} piqûres au plus (${fr.degats.join(' à ')}), soit ${maxF} au pire`);
    log(`  surmulot : une morsure (${D.D.surmulot.degats.join(' à ')}), seulement acculé plus de ${D.D.surmulot.coince} s ; putois : une nausée de ${D.D.putois.nausee} s`);
    verif(maxF <= 30 && maxR <= 6 && fr.patience >= 3 && D.danger.length <= 3, `les dangers restent modestes et lisibles (au pire ${maxF} PV sur 100 près d’un nid ; ${maxR} pour un rat)`);

    log('\n4. Les objets');
    const O = JSON.parse(J.ev(`JSON.stringify((() => {
      const ids = ['plume_faucon', 'plume_rapace', 'hanneton', 'sauterelle', 'machaon', 'grand_paon', 'escargot', 'escargots_cuits', 'musc_putois', 'toile_epeire', 'nid_frelon', 'peau_putois', 'peau_fouine', 'peau_belette'];
      const R = { ids, mal: [], sansEss: [], recette: null, vend: [] };
      for (const id of ids) { const it = ITEMS[id]; if (!it || !it.name || !it.desc || !(it.price >= 1 && it.price <= 30)) R.mal.push(id); if (it && it.alch && !ESSENCES[id]) R.sansEss.push(id); }
      const rc = RECIPES.find((r) => r.out === 'escargots_cuits');
      if (rc) { let v = 0; for (const k in rc.need) v += (ITEMS[k] ? ITEMS[k].price : 0) * rc.need[k]; R.recette = { entree: v, sortie: ITEMS.escargots_cuits.price * rc.n }; }
      for (const d of NPC_DATA) if (d.shop) for (const [k] of d.shop.sells || []) if (ids.includes(k)) R.vend.push(d.id + ':' + k);
      return R;
    })())`));
    verif(!O.mal.length && !O.sansEss.length, `${O.ids.length} objets nouveaux, chacun son nom, sa description, un prix de 1 à 30 ; les ingrédients ont leurs essences` + (O.mal.length ? ' — mal faits : ' + O.mal.join(', ') : '') + (O.sansEss.length ? ' — sans essences : ' + O.sansEss.join(', ') : ''));
    verif(O.recette && O.recette.sortie <= O.recette.entree * 1.3, `les escargots à l’ail : ${O.recette && O.recette.entree} pièces d’ingrédients, ${O.recette && O.recette.sortie} le plat`);
    verif(!O.vend.length, 'personne ne vend ces objets (on les prend aux bêtes)' + (O.vend.length ? ' — ' + O.vend.join(', ') : ''));

    log('\n5. Les cris');
    const S = JSON.parse(J.ev(`JSON.stringify(Object.keys(SoundEngine.TAMPONS).filter((k) => k.startsWith('e1_')).map((k) => {
      const T = SoundEngine.TAMPONS[k], sr = 22050, d = new Float32Array(Math.ceil(sr * T[0]));
      T[1](d, sr, 0);
      let pk = 0, e2 = 0, nan = false, last = 0;
      for (let i = 0; i < d.length; i++) { const v = d[i]; if (!isFinite(v)) nan = true; const a = Math.abs(v); if (a > pk) pk = a; e2 += v * v; if (a > 1e-4) last = i; }
      const rms = Math.sqrt(e2 / d.length) / (pk || 1);
      return { k, dur: T[0], pk, rms, nan, fin: last / sr, vol: E1_VOL[k] || 0 };
    }))`));
    for (const x of S) log(`  ${x.k.padEnd(18)} ${f1(x.dur)} s  volume ${x.vol}  efficace/crête ${f1(x.rms * 100)} %`);
    const malS = S.filter((x) => x.nan || !(x.pk > 0) || x.dur > 2.5 || x.vol > 0.07 || x.vol <= 0);
    verif(S.length >= 25 && !malS.length, `${S.length} cris : se calculent (sans valeur folle), courts (≤ 2,5 s), doux (volume ≤ 0,07, normalisés à la lecture)` + (malS.length ? ' — ' + malS.map((x) => x.k).join(', ') : ''));

    log('\n6. Les lieux (vallée de la graine 1234)');
    const w = await vallee(J, 1234);
    const n0 = [w.objects.length, w.props.length, w.inter.length];
    J.ctx.__w = w;
    const Lr = JSON.parse(J.ev(`JSON.stringify((() => {
      const L = e1.lieux(__w), F = L.ferme, V = L.ville;
      return { ferme: F && { nid: !!F.nid, toiles: F.toiles.length, foyer: !!F.foyer, perchoirs: F.perchoirs.length, murs: F.murs.length, maison: !!F.maison },
        ville: V && { clocher: !!V.clocher, nids: V.nids.length, corbeautiere: V.corbeautiere ? V.corbeautiere.nids.length : 0, reverberes: V.reverberes.length, douves: V.douves.length, lavoir: !!V.lavoir, toits: V.toits.length, arbres: V.arbres.length } };
    })())`));
    const n1 = [w.objects.length, w.props.length, w.inter.length];
    log('  ferme : ' + JSON.stringify(Lr.ferme));
    log('  ville : ' + JSON.stringify(Lr.ville));
    const F = Lr.ferme || {}, V = Lr.ville || {};
    verif(F.nid && F.toiles >= 2 && F.foyer && F.perchoirs >= 3 && F.murs >= 6 && F.maison, 'la ferme : le nid de frelons, des toiles, l’âtre, des perchoirs, des murs');
    verif(V.clocher && V.nids >= 4 && V.corbeautiere >= 4 && V.reverberes >= 4 && (V.douves >= 3 || V.lavoir) && V.toits >= 4 && V.arbres >= 2, 'la ville : le clocher, les nids d’hirondelles, la corbeautière, les réverbères, les douves ou le lavoir, les toits, des arbres');
    verif(n0.join() === n1.join(), `le monde ne change pas : ${n1.join(' / ')} objets, objets posés, interactions (aucune passe de génération)`);
    delete J.ctx.__w;
    return { echecs };
  },
};
