// Équilibrage — les dettes de la ferme et ses travaux (agent D18, dix-huitième vague)
//  - LES DONNÉES : huit termes, de plus en plus lourds, chacun ses travaux (au moins un élément du plan), son
//    avantage, des lettres et des textes non vides ; le retard est borné (pénalité ≤ 25 % du terme, trois saisies au
//    plus, chacune ≤ 20 % du terme) ; aucune passe de génération (les sauvegardes ne bougent pas) ;
//  - LES MONTANTS contre le revenu (les échelles de commerce.js : ≈ 375 pièces par jour au début, 1 500 au milieu,
//    4 000 plus tard ; ferme.js et commandes.js en donnent les rendements) : chaque terme vaut une à quatre journées
//    de revenu du moment où il s'ouvre, et au plus un tiers de ce qu'on gagne pendant son délai ; un joueur qui met de
//    côté un cinquième de son revenu ne paie jamais en retard ; à un quart, il a fini en moins de 130 jours ;
//  - PAS D'IMPASSE (les vraies fonctions, dans la machine virtuelle) : une partie qui ne paie jamais (200 jours) —
//    les pénalités et les saisies restent dans leurs bornes, la dette ne tombe jamais à zéro toute seule, rien ne
//    finit la partie ; payer ensuite lève les scellés et ouvre le terme suivant ; un versement partiel compte ; une
//    ancienne partie a son délai de grâce ;
//  - LES TRAVAUX, posés terme après terme dans les vallées 1234 et 77 (et une vallée de deuxième génération) : tout
//    trouve sa place, à moins de 40 m du centre de la ferme, sans recouper un bloc, un objet, un arbre ni le champ ;
//    l'empreinte de la vallée ne change pas, ni aucun bloc hors des murs de la maison.
'use strict';
const fs = require('fs');
const path = require('path');
const { empreinte } = require('./vm.js');

// le revenu d'une journée de jeu, au jour d (commerce.js : couts() et CIBLES)
const REVENU = (d) => (d <= 12 ? 375 : d <= 36 ? 375 + (1500 - 375) * (d - 12) / 24 : d <= 96 ? 1500 + (4000 - 1500) * (d - 36) / 60 : 4000);

module.exports = {
  titre: 'Les dettes de la ferme : termes, retard, travaux (D18)',
  REVENU,
  async verifier(J, log) {
    let echecs = 0;
    const ko = (m) => { echecs++; log('ÉCHEC : ' + m); };
    // ---------------------------------------------------------------- pas de génération
    const dir = path.join(__dirname, '..', '..', 'src');
    const src = fs.readdirSync(dir).filter((f) => /D18/.test(f));
    const gen = src.filter((f) => /generateValley|zone\.passe\(/.test(fs.readFileSync(path.join(dir, f), 'utf8')));
    log(`fichiers D18 : ${src.join(', ')} ; génération : ${gen.length ? gen.join(', ') : 'aucune'}`);
    if (gen.length) ko('une passe de génération dans les fichiers D18');

    // ---------------------------------------------------------------- les données
    const D = JSON.parse(J.ev(`JSON.stringify((() => {
      const e = [], vide = (s) => typeof s !== 'string' || !s.trim();
      let m = 0;
      D18_TERMES.forEach((T, i) => {
        if (!(T.montant > m)) e.push('terme ' + (i + 1) + ' : le montant ne monte pas');
        m = T.montant;
        if (!(T.delai >= 10 && T.delai <= 36)) e.push('terme ' + (i + 1) + ' : délai ' + T.delai);
        if (vide(T.titre) || vide(T.bas) || vide(T.avantage)) e.push('terme ' + (i + 1) + ' : textes');
        if (!D18_PLAN.some((E) => E.n === i + 1)) e.push('terme ' + (i + 1) + ' : aucun travail');
      });
      for (const E of D18_PLAN) {
        if (!(E.n >= 1 && E.n <= D18_TERMES.length)) e.push(E.id + ' : terme ' + E.n);
        if (E.type === 'bat' && typeof D18_BATIR[E.b] !== 'function') e.push(E.id + ' : construction ' + E.b);
        if ((E.type === 'prop' || E.type === 'dedans' || E.type === 'pave') && !PROP_MODELS[E.p]) e.push(E.id + ' : pas de modèle ' + E.p);
      }
      if (new Set(D18_PLAN.map((E) => E.id)).size !== D18_PLAN.length) e.push('deux éléments du plan ont le même id');
      for (const k in D18_AVANTAGES) if (!(D18_AVANTAGES[k] >= 1 && D18_AVANTAGES[k] <= D18_TERMES.length)) e.push('avantage ' + k);
      for (const k in D18_TEXTES) { const v = D18_TEXTES[k]; if (typeof v === 'string' ? vide(v) : typeof v !== 'function') e.push('texte ' + k); }
      const v = { n: 'premier', m: 1, j: 'Primedi 3', t: 'le toit', p: 1, d: 6, r: 1, objets: 'du blé', suite: '.', ou: 'ici' };
      for (const k in D18_LETTRES) if (vide(D18_LETTRES[k](v))) e.push('lettre ' + k);
      return { e, T: D18_TERMES.map((T) => [T.montant, T.delai, T.titre]), R: D18_RETARD, plan: D18_PLAN.length };
    })())`));
    for (const m of D.e) ko(m);
    const R = D.R;
    log(`${D.T.length} termes, ${D.plan} éléments de travaux ; retard : demeure ${R.demeure * 100} %, +${R.semaine * 100} % la semaine, plafond ${R.plafond * 100} %, saisie à J+${R.saisie} puis tous les ${R.reprise} jours (${R.saisies} au plus, ${R.part * 100} % du terme, criée à ${R.criee * 100} %)`);
    if (D.T.length < 7 || D.T.length > 10) ko(`${D.T.length} termes (7 à 10 attendus)`);
    if (R.plafond > 0.3 || R.part > 0.25 || R.saisies > 3) ko('le retard coûte trop (plafond, part saisie, nombre de saisies)');

    // ---------------------------------------------------------------- les montants contre le revenu
    {
      log('\nterme  montant  délai  ouvert  échéance  revenu/j  journées  part du délai');
      let jour = 1, tot = 0;
      D.T.forEach(([m, delai, titre], i) => {
        const ech = jour + delai, rj = REVENU(jour);
        let gagne = 0; for (let d = jour; d < ech; d++) gagne += REVENU(d);
        const j = m / rj, part = m / gagne;
        tot += m;
        log(`${String(i + 1).padStart(5)}  ${String(m).padStart(7)}  ${String(delai).padStart(5)}  ${String(jour).padStart(6)}  ${String(ech).padStart(8)}  ${String(Math.round(rj)).padStart(8)}  ${j.toFixed(2).padStart(8)}  ${(part * 100).toFixed(0).padStart(5)} %   ${titre}`);
        if (j < 1 || j > 4) ko(`terme ${i + 1} : ${j.toFixed(2)} journées de revenu (1 à 4 attendues)`);
        if (part > 1 / 3) ko(`terme ${i + 1} : ${(part * 100).toFixed(0)} % du revenu de son délai (un tiers au plus)`);
        jour = ech;
      });
      log(`en tout ${tot} pièces ; payé à chaque échéance, la ferme est quitte au jour ${jour}`);
      // un joueur qui met de côté une part de son revenu, et paie dès qu'il peut
      const epargne = (k) => {
        let d = 1, argent = 0, ouvert = 1, retards = 0, i = 0;
        for (; d <= 400 && i < D.T.length; d++) {
          argent += k * REVENU(d);
          if (d > ouvert + D.T[i][1]) retards++;
          while (i < D.T.length && argent >= D.T[i][0]) { argent -= D.T[i][0]; i++; ouvert = d; }
        }
        return { fin: i >= D.T.length ? d - 1 : null, retards };
      };
      for (const k of [0.1, 0.2, 0.25, 0.33]) { const r = epargne(k); log(`  épargne ${Math.round(k * 100)} % du revenu : quitte au jour ${r.fin ?? '—'}, ${r.retards} jour(s) de retard`); }
      if (epargne(0.2).retards) ko('à un cinquième du revenu mis de côté, on paie en retard');
      const r25 = epargne(0.25).fin;
      if (!r25 || r25 > 130) ko(`à un quart du revenu, la ferme n'est quitte qu'au jour ${r25}`);
    }

    // ---------------------------------------------------------------- pas d'impasse : la vraie machine
    const P = JSON.parse(J.ev(`JSON.stringify((() => {
      const s0 = farm.s, w0 = game.world, out = { e: [], log: [] };
      try {
        game.world = null;
        // une partie qui ne paie jamais
        farm.s = farm.blank(1234); farm.s.money = 0;
        farm.s.chests = { coffre_ferme: { ble: 40, bois: 60, pierre: 30, oeuf: 10 } };
        Object.assign(farm.s.inv, { pomme: 20, minerai_fer: 8 });
        const S = dettes18.neuf(farm.s, false);
        let maxPen = 0, minDu = 1e9, lettres = 0;
        for (let d = 2; d <= 200; d++) {
          farm.s.day = d; dettes18.jour();
          maxPen = Math.max(maxPen, S.penal / S.base); minDu = Math.min(minDu, S.du);
          if (farm.s.over) out.e.push('la partie finit au jour ' + d);
        }
        lettres = farm.s.mail.filter((m) => m.from === D18_SIGNE || m.from === D18_HUISSIER).length;
        out.log.push('sans payer, 200 jours : palier ' + S.palier + ', dû ' + S.du + ' (base ' + S.base + ', pénalités ' + S.penal + ', ' + Math.round(maxPen * 100) + ' %), saisies ' + S.saisies + ', scellés ' + S.scelles + ', ' + lettres + ' lettres ; outils ' + ['houe', 'arrosoir', 'hache_pierre', 'pioche_pierre'].filter((k) => farm.s.inv[k]).length + '/4');
        if (S.palier !== 0) out.e.push('la dette avance sans paiement');
        if (maxPen > D18_RETARD.plafond + 1e-9) out.e.push('pénalités au-delà du plafond : ' + maxPen);
        if (S.saisies > D18_RETARD.saisies) out.e.push('trop de saisies : ' + S.saisies);
        if (minDu <= 0) out.e.push('la dette tombe à zéro sans paiement');
        if (!S.scelles) out.e.push('pas de scellés après une saisie');
        if (['houe', 'arrosoir', 'hache_pierre', 'pioche_pierre'].some((k) => !farm.s.inv[k])) out.e.push('la saisie a pris un outil');
        if (lettres > 12) out.e.push('trop de lettres : ' + lettres);
        // payer : les scellés tombent, le terme suivant s'ouvre
        farm.s.money = S.du + 50;
        const du = S.du, p = dettes18.rembourser();
        if (p !== du || S.palier !== 1 || S.scelles || S.du !== D18_TERMES[1].montant || S.travaux.join() !== '1') out.e.push('le paiement après saisie ne libère pas : ' + JSON.stringify({ p, du, palier: S.palier, scelles: S.scelles }));
        if (S.echeance !== 200 + D18_TERMES[1].delai) out.e.push('échéance du terme 2 : ' + S.echeance);
        // un versement partiel
        farm.s.money = 300;
        const v = dettes18.payer(300, 'boite');
        if (v !== 300 || S.du !== D18_TERMES[1].montant - 300 || S.palier !== 1) out.e.push('le versement partiel ne compte pas');
        // tout payer d'un coup, terme après terme
        farm.s.money = 1e6;
        for (let i = 0; i < 20 && S.palier < D18_TERMES.length; i++) dettes18.rembourser();
        if (S.palier !== D18_TERMES.length || dettes18.du() !== 0 || !dettes18.quitte()) out.e.push('on ne finit pas de payer');
        if (dettes18.rembourser(100) !== 0) out.e.push('on paie encore une ferme quitte');
        if (!farm.s.mail.some((m) => m.title === 'Acte de mainlevée')) out.e.push('pas d’acte de mainlevée');
        // la première lettre d'une partie neuve : le deuxième jour
        farm.s = farm.blank(77);
        const S2 = dettes18.neuf(farm.s, false);
        dettes18.jour();
        const l1 = farm.s.mail.length;
        farm.s.day = 2; dettes18.jour();
        if (l1 !== 0 || !farm.s.mail.some((m) => m.title === 'L’échéancier')) out.e.push('la lettre de l’échéancier');
        if (S2.echeance !== 1 + D18_TERMES[0].delai) out.e.push('échéance du premier terme : ' + S2.echeance);
        // une ancienne partie (sans farm.s.dettes18) : le délai de grâce, la lettre tout de suite
        farm.s = farm.blank(77); farm.s.day = 40;
        delete farm.s.dettes18;
        for (const fn of HOOKS.load) { if (String(fn).includes('dettes18.neuf')) { try { fn(JSON.parse(JSON.stringify(farm.s))); } catch (e) { out.log.push('chargement : ' + e.message); } } }
        const S3 = farm.s.dettes18;
        if (!S3 || S3.palier !== 0 || S3.echeance !== 40 + D18_RETARD.grace || !farm.s.mail.some((m) => m.title === 'Une dette retrouvée')) out.e.push('ancienne partie : ' + JSON.stringify(S3 && { palier: S3.palier, echeance: S3.echeance }));
        out.log.push('ancienne partie au jour 40 : premier terme dû le jour ' + (S3 && S3.echeance));
        // les avantages et les scellés
        S3.fait = 8; S3.scelles = true;
        if (dettes18.avantage('reputation') || !dettes18.avantage('arroseurs')) out.e.push('les scellés ne suspendent pas les bons avantages');
      } catch (e) { out.e.push('EXC ' + (e.stack || e.message)); }
      farm.s = s0; game.world = w0;
      return out;
    })())`));
    for (const l of P.log) log(l);
    for (const m of P.e) ko(m);

    // ---------------------------------------------------------------- les travaux, dans de vraies vallées
    for (const [graine, gen] of process.env.EQ_RAPIDE ? [[77, 2]] : [[1234, 3], [77, 3], [77, 2]]) {
      const t0 = Date.now();
      const w = await J.ev(`generateValley(${graine}, () => {}, ${gen})`);
      J.ctx.__w = w;
      const avant = empreinte(w), n0 = [w.objects.length, w.props.length, (w.inter || []).length];
      const r = JSON.parse(J.ev(`JSON.stringify((() => {
        const w = __w, s0 = farm.s, w0 = game.world, fw = farm.w, gp = farm.genProps, out = { e: [], t: [] };
        const nb = w.blocks.length, ref = w.blocks.map((b) => [b.m, b.x, b.y, b.z, b.sx, b.sy, b.sz, b.r].join());
        try {
          farm.s = farm.blank(${graine}); farm.s.gen = ${gen}; farm.w = w; farm.genProps = w.props.length; game.world = w;
          const S = dettes18.neuf(farm.s, false), F = w.farm.f;
          const maison = new Set(d18Travaux.blocsMaison(w));
          for (let n = 1; n <= D18_TERMES.length; n++) {
            S.travaux = [n];
            const att = dettes18.travaux();
            out.t.push(n + ':' + (att.length ? 'attente ' + att.join('+') : 'ok'));
            if (att.length) out.e.push('terme ' + n + ' : en attente ' + att.join(', '));
          }
          // ce qui a été ajouté : à moins de 40 m, sans recouper ce qui était là
          const neufsB = w.blocks.slice(nb).filter((b) => b.d18 && !b.hidden), neufsP = w.props.filter((q) => q.d18);
          const loin = neufsB.concat(neufsP).filter((o) => Math.hypot(o.x - F.x, o.z - F.z) > D18_RAYON + 3);
          if (loin.length) out.e.push(loin.length + ' ajouts à plus de 40 m de la ferme');
          const boite = (b) => ({ x: b.x, z: b.z, hx: Math.max(0, b.sx / 2 - 0.04), hz: Math.max(0, b.sz / 2 - 0.04), r: b.r || 0 });
          const anciens = w.blocks.slice(0, nb).filter((b) => !b.under && !maison.has(b) && Math.hypot(b.x - F.x, b.z - F.z) < 70 && !(b.ver && !(b.ver & (w.curVer || VER_ALL))));
          const solides = w.blocks.slice(nb).filter((b) => b.d18 && b.d18 !== 'etage');
          let recoupe = 0;
          for (const b of solides) for (const a of anciens) {
            if (a.hidden && !w.props.some((q) => q.blk === a && !q.gone)) continue;
            if (b.y > a.y + a.sy || a.y > b.y + b.sy) continue;
            if (d18Recoupe(boite(a), boite(b))) { if (recoupe++ < 5) out.e.push('recoupe : ' + b.d18 + ' / bloc ' + a.m + ' à ' + a.x.toFixed(1) + ',' + a.z.toFixed(1)); }
          }
          // les éléments entre eux (deux éléments différents)
          for (let i = 0; i < solides.length; i++) for (let j = i + 1; j < solides.length; j++) {
            const a = solides[i], b = solides[j];
            if (a.d18 === b.d18 || (a.y > b.y + b.sy) || (b.y > a.y + a.sy)) continue;
            if (['allee', 'cour'].includes(a.d18) || ['allee', 'cour'].includes(b.d18)) continue;
            if (d18Recoupe(boite(a), boite(b))) { if (recoupe++ < 8) out.e.push('recoupe : ' + a.d18 + ' / ' + b.d18); }
          }
          // arbres et rochers
          for (const o of w.objects) { const T = OBJ_TYPES[o.t]; if (!o || o.gone || !T || T.animal || !(objRadius(T, o) > 0) || Math.hypot(o.x - F.x, o.z - F.z) > 50) continue; for (const b of solides) if (d18Dist(boite(b), o.x, o.z) < objRadius(T, o) - 0.05) { if (recoupe++ < 10) out.e.push('recoupe un arbre : ' + b.d18); } }
          // le champ
          const fd = w.farm.field;
          if (fd) for (const b of solides) if (!/^arr/.test(b.d18) && d18Recoupe(boite(b), { x: (fd.x0 + fd.x1 + 1) / 2, z: (fd.z0 + fd.z1 + 1) / 2, hx: (fd.x1 - fd.x0 + 1) / 2, hz: (fd.z1 - fd.z0 + 1) / 2, r: 0 })) out.e.push('dans le champ : ' + b.d18);
          // hors des murs de la maison, aucun bloc d'avant n'a changé
          let changes = 0;
          for (let i = 0; i < nb; i++) { const b = w.blocks[i]; if (maison.has(b)) continue; if ([b.m, b.x, b.y, b.z, b.sx, b.sy, b.sz, b.r].join() !== ref[i]) changes++; }
          if (changes) out.e.push(changes + ' blocs changés hors de la maison');
          out.n = { blocs: neufsB.length, props: neufsP.length, arbres: Object.values(farm.s.crops).filter((c) => c.tree).length, maison: maison.size, courrier: farm.s.mail.length };
          out.places = S.places;
        } catch (e) { out.e.push('EXC ' + (e.stack || e.message)); }
        farm.s = s0; game.world = w0; farm.w = fw; farm.genProps = gp;
        return out;
      })())`));
      const apres = empreinte(w, n0);
      log(`\nvallée ${graine} (génération ${gen}, ${((Date.now() - t0) / 1000).toFixed(0)} s) : ${r.t.join(' ')} ; ${JSON.stringify(r.n)}`);
      log('  places : ' + JSON.stringify(r.places));
      if (apres !== avant) ko(`vallée ${graine} : l'empreinte change (${avant} → ${apres})`);
      for (const m of r.e) ko(`vallée ${graine} : ${m}`);
    }
    return { echecs };
  },
};
