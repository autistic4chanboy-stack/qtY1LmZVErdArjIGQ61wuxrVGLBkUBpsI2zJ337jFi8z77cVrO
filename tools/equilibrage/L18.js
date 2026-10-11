// Équilibrage — le GRAND HÔTEL DES CIMES (agent L18, dix-huitième vague)
//  - LES DONNÉES : quatre histoires de cinq à huit étapes (textes, lieux qui existent), les gens (allures, horaires
//    dont chaque place existe), les clients de passage (goûts → de vrais lieux), les demandes (objets de la vallée
//    qui existent), les scènes (constructeur, titre, musique qui existe), les objets ;
//  - LA PLACE (graines 1234 et 77) : l'hôtel est posé (w.l18), loin des grands lieux (estive, col, refuge, Grande
//    Porte, camp des géants, lac gelé, château…), rien d'avant sur le terre-plein ni sur la voie du funiculaire, les
//    caves loin de tout bâtiment (la carte des abris : un plafond par case), aucun objet ajouté à w.objects, les
//    empreintes d'origine inchangées ; on entre à chaque étage (comme le domaine « batiments ») ; dedans, c'est
//    « à l'abri » à chaque étage ; les nœuds de marche des gens sont reliés, chaque place des horaires est atteinte ;
//  - PAS D'IMPASSE : chaque lieu nommé par une étape existe (la stèle de la Grande Porte, la spirale du glacier…),
//    chaque étape qui demande de parler à quelqu'un à une heure le trouve debout ou assis, quelque part, à cette heure ;
//    chaque scène se construit (positions finies, moins de 45 s) ;
//  - L'ARGENT : un service (gages + pourboires, simulé avec les vraies fonctions, cent services) reste du même ordre
//    qu'une journée de travail honnête (Début : 300 à 450 pièces) : en moyenne 120 à 450, jamais plus de 700 ;
//    les histoires paient au plus 250 pièces et 160 d'objets chacune ;
//  - LA SAUVEGARDE : une partie sans hôtel (ancienne) se normalise ; un état abîmé aussi.
'use strict';
const { vallee, empreinte, EMPREINTE_1234 } = require('./vm.js');

module.exports = {
  titre: 'Le Grand Hôtel des Cimes : la place, le métier de concierge, les histoires (L18)',
  async verifier(J, log) {
    let echecs = 0;
    const ko = (m) => { echecs++; log('ÉCHEC : ' + m); };
    // ---------------------------------------------------------------- les données
    const D = JSON.parse(J.ev(`(() => {
      const e = [], vide = (s) => typeof s !== 'string' || !s.trim();
      const arcs = [];
      for (const id of L18_ORDRE_ARCS) {
        const A = L18_ARCS[id];
        if (!A) { e.push('histoire ' + id + ' absente'); continue; }
        if (vide(A.titre) || vide(A.resume) || !L18_GENS[A.qui]) e.push(id + ' : titre, résumé, qui');
        if (!(A.etapes.length >= 5 && A.etapes.length <= 8)) e.push(id + ' : ' + A.etapes.length + ' étapes (5 à 8)');
        const ids = new Set();
        for (const E of A.etapes) { if (vide(E.id) || vide(E.texte) || ids.has(E.id)) e.push(id + ' : étape ' + E.id); ids.add(E.id); if (E.quand && !(E.quand.length === 2 && E.quand.every(Number.isFinite))) e.push(id + '.' + E.id + ' : heure'); }
        arcs.push(id + ' (' + A.etapes.length + ')');
      }
      for (const id of L18_ORDRE_GENS) {
        const G = L18_GENS[id];
        if (!G || vide(G.nom) || vide(G.role) || vide(G.bio) || !G.look || !Array.isArray(G.horaire) || !G.horaire.length) e.push('gens ' + id);
        if (!L18_PAROLES[id]) e.push('paroles ' + id);
      }
      for (const C of L18_CLIENTS) { if (!L18_GOUTS[C.gout] || vide(C.nom) || vide(C.mot)) e.push('client ' + C.id); }
      for (const k of L18_VALLEE) if (!ITEMS[k] || !(ITEMS[k].price > 0)) e.push('vallée : objet ' + k);
      for (const k in L18_DEMANDES) { const Dm = L18_DEMANDES[k]; if (!Dm.textes.length || !Dm.ok.length) e.push('demande ' + k); }
      for (const k of L18_ORDRE_CINES) { if (typeof L18_SCENES[k] !== 'function' || !L18_CINES[k] || vide(L18_CINES[k].titre)) e.push('scène ' + k); const m = L18_MUSIQUES[k]; if (m && !MUSIQUE.morceaux[m]) e.push('scène ' + k + ' : musique ' + m); }
      for (const k in L18_SCENES) if (!L18_ORDRE_CINES.includes(k)) e.push('scène ' + k + ' hors du carnet');
      for (const id of ['l18_clefs', 'l18_cle_aile', 'l18_valise', 'l18_pli', 'l18_bouteille', 'l18_draps', 'l18_epicerie', 'l18_objet_perdu', 'l18_lettre_comtesse', 'l18_croquis', 'l18_montre', 'l18_derniere_lettre', 'l18_boite', 'l18_recommandation', 'l18_carnet', 'l18_partition', 'l18_cheval', 'l18_registre54', 'boussole', 'tarte_baies']) if (!ITEMS[id]) e.push('objet ' + id);
      for (const id of ['l18_valse', 'l18_symphonie']) { const C = MUSIQUE.compiler(id, 1); if (!C || C.erreurs.length) e.push('musique ' + id + ' : ' + (C ? C.erreurs.slice(0, 3).join(' ; ') : 'absente')); }
      if (MATERIALS.length > 64) e.push(MATERIALS.length + ' matières (64 au plus)');
      return JSON.stringify({ e, arcs, gens: L18_ORDRE_GENS.length, clients: L18_CLIENTS.length, cines: L18_ORDRE_CINES.length, mat: MATERIALS.length });
    })()`));
    log(`histoires : ${D.arcs.join(', ')} ; ${D.gens} gens, ${D.clients} clients de passage, ${D.cines} scènes ; ${D.mat} matières`);
    for (const m of D.e) ko(m);

    // ---------------------------------------------------------------- la place, dans deux vallées
    let wRef = null;
    for (const graine of [1234, 77]) {
      const t0 = Date.now();
      const w = await vallee(J, graine);
      J.ctx.__w = w;
      const L = JSON.parse(J.ev(`(() => {
        const w = __w, V = w.l18, e = [], info = {};
        if (!V) return JSON.stringify({ e: ['pas d’hôtel'], info });
        info.Y = V.y; info.ms = V.ms; info.ajoute = V.ajoute; info.partis = V.partis;
        // loin des grands lieux
        const LOIN = { estive: 250, col: 250, refuge: 250, grande_porte: 250, geants: 250, lac_gele: 250, chateau: 400, abbaye: 400, bibliotheque: 400, combe: 250, mine: 250, cascade: 250, tour: 250, dolmen: 250, menhirs: 250 };
        const d = (L) => Math.hypot(L.x - V.x, L.z - V.z);
        info.loin = {};
        for (const k in LOIN) { const L = w.lm[k]; if (!L) continue; info.loin[k] = Math.round(d(L)); if (d(L) < LOIN[k]) e.push(k + ' à ' + Math.round(d(L)) + ' m'); }
        // rien d'avant sur le terre-plein (lieux, objets posés, interactions, blocs), ni sur la voie
        const c = Math.cos(V.r), s = Math.sin(V.r), loc = (x, z) => { const dx = x - V.x, dz = z - V.z; return [dx * c - dz * s, dx * s + dz * c]; };
        const dedans = (x, z, m) => { const [lx, lz] = loc(x, z); return lx > -58 - m && lx < 52 + m && lz > -42 - m && lz < 24 + m; };
        const av = V.avant;
        for (const k in w.lm) { const L = w.lm[k]; if (k.startsWith('l18_') || L.under) continue; if (dedans(L.x, L.z, (L.r || 5))) e.push('lieu ' + k + ' sur le terre-plein'); }
        w.props.slice(0, av.p).forEach((q) => { if (dedans(q.x, q.z, 2)) e.push('objet posé ' + q.id + ' sur le terre-plein'); });
        w.inter.slice(0, av.i).forEach((it) => { if (dedans(it.x, it.z, 2)) e.push('interaction ' + it.kind + ' sur le terre-plein'); });
        w.blocks.slice(0, av.b).forEach((b) => { if (!b.under && dedans(b.x, b.z, 2)) e.push('bloc sur le terre-plein'); });
        const F = V.funi;
        for (const k in w.lm) { const L = w.lm[k]; if (k.startsWith('l18_') || L.under) continue; if (segDist(L.x, L.z, F.A[0], F.A[2], F.B[0], F.B[2]) < (L.r || 5) + 6) e.push('lieu ' + k + ' sur la voie du funiculaire'); }
        info.funi = { L: Math.round(F.L), pente: +F.pente.toFixed(3) };
        // les caves : loin de tout bâtiment d'avant (la carte des abris n'a qu'un plafond par case)
        const C = V.caves;
        w.blocks.slice(0, av.b).forEach((b) => { if (!b.under && Math.hypot(b.x - C.x, b.z - C.z) < 30) e.push('un bloc d’avant au-dessus des caves'); });
        // rien dans w.objects
        if (w.objects.length !== av.o) e.push('des objets ajoutés à w.objects');
        // dedans, à chaque étage, à l'abri ; dehors, sur la terrasse, pas
        const abri = (lx, ly, lz) => { const x = V.x + lx * c + lz * s, z = V.z - lx * s + lz * c; w.computeCover(x, z); return w.covered(x, V.y + ly + 1.6, z); };
        const pts = [['hall', 0, 0.15, -4], ['salle à manger', -18, 0.15, -3], ['salle de bal', -40, 0.15, 0], ['couloir du 1er', -20, 4, 0], ['couloir du 2e', 20, 8, 0], ['combles', 10, 12, 0], ['chambre 108', 0.5, 4, -5], ['l’aile', 36, 0.15, 0], ['la treize', 39, 4, 4]];
        for (const [n, lx, ly, lz] of pts) if (!abri(lx, ly, lz)) e.push(n + ' : pas à l’abri');
        if (abri(0, 0, -33)) e.push('la terrasse est « à l’abri »');
        // les nœuds de marche : reliés ; chaque place des horaires atteinte depuis le hall
        const N = V.nav, adj = N.n.map(() => []);
        for (const [a, b] of N.e) { adj[a].push(b); adj[b].push(a); }
        const vu = new Set([N.id.hall]), pile = [N.id.hall];
        while (pile.length) { const i = pile.pop(); for (const j of adj[i]) if (!vu.has(j)) { vu.add(j); pile.push(j); } }
        const places = new Set();
        for (const id of L18_ORDRE_GENS) for (const [h, pl] of L18_GENS[id].horaire) if (pl) places.add(pl);
        for (const k of ['loge_client', 'loge_client2', 'loge_client3', 'longue_vue', 'treize', 'piano']) places.add(k);
        for (let t = 0; t < 8; t++) places.add('bal_danse' + t);
        for (const pl of places) {
          const n = pl.startsWith('n:') ? N.id[pl.slice(2)] : V.places[pl] ? V.places[pl].n : undefined;
          if (n === undefined || n < 0) { e.push('place ' + pl + ' : inconnue'); continue; }
          if (!vu.has(n) && !['treize'].includes(pl) && !N.n[n].id.startsWith('treize') && !N.n[n].id.startsWith('aile')) e.push('place ' + pl + ' : pas reliée au hall (' + N.n[n].id + ')');
        }
        info.nav = N.n.length + ' nœuds, ' + vu.size + ' reliés au hall';
        // les lieux des histoires
        const sp = (typeof VALLEY_DESIGN !== 'undefined' ? VALLEY_DESIGN.sigils : []).find((q) => q[2] === 'spirale' && q[4] === 'neige');
        if (!sp) e.push('pas de spirale sur le glacier');
        if (!w.v1porte || !w.v1porte.stele) e.push('pas de stèle à la Grande Porte');
        for (const id of L18_ORDRE_ARCS) for (const E of L18_ARCS[id].etapes) if (E.lieu && !w.lm[E.lieu]) e.push(id + '.' + E.id + ' : lieu ' + E.lieu + ' absent');
        for (const g in L18_GOUTS) { const ok = L18_GOUTS[g].bons.filter((k) => w.lm[k]); if (ok.length < 2) e.push('goût ' + g + ' : ' + ok.length + ' lieu(x)'); }
        // les chambres : des portes, des interactions
        const ch = Object.values(V.chambres);
        info.chambres = ch.length + ' chambres (' + ch.filter((q) => q.ouverte).length + ' où l’on entre) ; ' + Object.keys(V.portes).length + ' portes';
        if (ch.some((q) => q.num === 113 || q.num === 213)) e.push('une chambre 13 dans le corps principal');
        return JSON.stringify({ e, info });
      })()`));
      log(`vallée ${graine} (${((Date.now() - t0) / 1000).toFixed(0)} s) : ${JSON.stringify(L.info)}`);
      for (const m of L.e) ko(`vallée ${graine} : ${m}`);
      if (graine === 1234) {
        const emp = empreinte(w, [98896, 1308, 516]);
        if (emp !== EMPREINTE_1234) ko('empreinte 1234 changée : ' + emp);
        wRef = w;
        // on entre à chaque étage (le domaine « batiments »), là où il y a l'hôtel
        const { examiner } = require('./batiments.js');
        const toits = examiner(J, w).filter((T) => Math.hypot(T.R.x - w.l18.x, T.R.z - w.l18.z) < 120 || T.R.l18);
        const mal = [];
        for (const T of toits) T.niveaux.forEach((n, i) => { if (n.etat === 'clos' || (n.etat === 'plein' && !T.plat)) mal.push(`${T.nom} niveau ${i} : ${n.etat}`); });
        log(`bâtiments de l’hôtel : ${toits.length} toits, ${toits.reduce((a, T) => a + T.niveaux.length, 0)} niveaux — ${toits.map((T) => T.niveaux.map((n) => n.etat).join('/')).join(' ; ')}`);
        for (const m of mal) ko('on n’entre pas : ' + m);
        // les scènes : chacune se construit dans cette vallée
        J.ctx.__w = w;
        const Sc = JSON.parse(J.ev(`(() => {
          const w = __w, w0 = game.world, p0 = game.player, s0 = farm.s, fw = farm.w;
          game.world = w; farm.w = w; farm.s = farm.blank(1234);
          game.player = { pos: [w.l18.x, w.l18.y, w.l18.z - 20], yaw: 0, pitch: 0, hp: 100, food: 80, vel: [0, 0, 0], eyePos() { return [this.pos[0], this.pos[1] + 1.6, this.pos[2]]; } };
          const out = { e: [], s: [] };
          const fini = (v) => Array.isArray(v) && v.length === 3 && v.every(Number.isFinite);
          for (const k of L18_ORDRE_CINES) {
            let sc = null;
            try { sc = L18_SCENES[k](hotelScenes.optsRejeu(k)); } catch (e) { out.e.push('scène ' + k + ' : ' + e.message); continue; }
            let dur = 0, mauvais = 0;
            for (const P of sc.plans) { dur += P.dur || 0; const c = []; if (P.de) c.push(P.de.pos, P.de.look); if (P.a) c.push(P.a.pos, P.a.look); for (const q of P.chemin || []) c.push(q.pos, q.look); if (P.orbite) c.push(P.orbite.c); for (const f of P.figurants || []) c.push(f.de, f.a || f.de); for (const v of c) if (v && !fini(v)) mauvais++; }
            if (mauvais) out.e.push('scène ' + k + ' : ' + mauvais + ' positions non finies');
            if (dur > 45) out.e.push('scène ' + k + ' : ' + dur.toFixed(0) + ' s');
            out.s.push(k + ' ' + dur.toFixed(0) + ' s');
          }
          // les deux variantes des fins
          for (const [k, o] of [['comtesse_fin', { fin: 'part' }], ['concert', { jouer: false }], ['treize_fin', { fin: 'veille' }], ['funiculaire', { sens: 'descendre' }], ['voiture', { sens: 'descendre' }]]) { try { L18_SCENES[k](o); } catch (e) { out.e.push('scène ' + k + ' (variante) : ' + e.message); } }
          game.world = w0; game.player = p0; farm.s = s0; farm.w = fw;
          return JSON.stringify(out);
        })()`));
        log('scènes : ' + Sc.s.join(', '));
        for (const m of Sc.e) ko(m);
      }
    }

    // ---------------------------------------------------------------- pas d'impasse : les gens qu'il faut, quand il faut
    {
      const R = JSON.parse(J.ev(`(() => {
        const e = [];
        const visible = (id, h) => { const H = L18_GENS[id].horaire; let c = H[H.length - 1]; for (const q of H) if (h >= q[0]) c = q; return !['dort', 'absent', 'chambre'].includes(c[2]); };
        const dans = (id, F) => { for (let h = 0; h < 24; h += 0.25) if (hotel18.dans(h, F) && visible(id, h)) return true; return false; };
        if (!dans('comtesse', [16.5, 21.5])) e.push('Lucien.montre : la comtesse n’est jamais là le soir');
        if (!dans('comtesse', [6, 11])) e.push('Lucien.adieu : la comtesse n’est jamais là le matin');
        if (!dans('firmin', [6, 10])) e.push('Firmin.fin : Firmin n’est jamais là le matin');
        for (const id of ['directeur', 'chef', 'gaspard', 'odile', 'wolanski', 'cocher']) if (!dans(id, [0, 24])) e.push(id + ' n’est jamais visible');
        // chaque étape est faite par quelque chose (une fonction du jeu)
        const fait = { lucien: ['lieu', 'lieu', 'lieu', 'lieu', 'lucienMontre', 'lieu', 'lucienAdieu'], firmin: ['odileBoite', 'firminExamen', 'directeurLettre', 'tic', 'options', 'firminFin'], symphonie: ['ecouter', 'ecouter', 'ecouter', 'ecouter', 'symphonieCarnet', 'symphoniePreparer', 'concert'], treize: ['sonner', 'registre', 'chefConfession', 'treizePorte', 'lieu', 'treizeRendre', 'treizeFin'] };
        for (const id in fait) { if (fait[id].length !== L18_ARCS[id].etapes.length) e.push(id + ' : étapes sans fonction'); for (const f of fait[id]) if (f !== 'registre' && typeof hotelHistoires[f] !== 'function') e.push(id + ' : ' + f + ' absente'); }
        if (typeof HOOKS.inter.l18_registre !== 'function') e.push('registre : interaction absente');
        // un état abîmé, une partie sans hôtel
        const s0 = farm.s;
        farm.s = farm.blank(77); delete farm.s.hotel18;
        const S1 = hotel18.S();
        if (S1.embauche !== null || S1.rep !== 0 || !Array.isArray(S1.commissions)) e.push('partie neuve : état');
        farm.s.hotel18 = { rep: 'x', arcs: 3, demandes: null, stats: 7 };
        const S2 = hotel18.S();
        if (S2.rep !== 0 || typeof S2.arcs !== 'object' || !Array.isArray(S2.demandes) || typeof S2.stats.faites !== 'number') e.push('état abîmé : mal normalisé');
        farm.s = s0;
        return JSON.stringify({ e });
      })()`));
      for (const m of R.e) ko(m);
      log(`pas d’impasse : ${R.e.length ? R.e.length + ' problème(s)' : 'chaque étape a de quoi se faire, chacun est là quand il faut'}`);
    }

    // ---------------------------------------------------------------- l'argent : cent services, avec les vraies fonctions
    if (wRef) {
      J.ctx.__w = wRef;
      const E = JSON.parse(J.ev(`(() => {
        const w = __w, w0 = game.world, s0 = farm.s, fw = farm.w, p0 = game.player;
        const _sub = ui.subtitle; ui.subtitle = () => {};
        game.world = w; farm.w = w; farm.s = farm.blank(1234); farm.s.money = 0;
        game.player = { pos: [w.l18.x, w.l18.y, w.l18.z], yaw: 0, pitch: 0, hp: 100, food: 80, vel: [0, 0, 0], eyePos() { return [this.pos[0], this.pos[1] + 1.6, this.pos[2]]; } };
        const S = hotel18.S(); S.embauche = 1;
        hotelGens.cle = null; hotelGens.creer();
        const out = { par: [], rang: [] };
        for (let jour = 1; jour <= 100; jour++) {
          farm.s.day = jour; farm.s.hours = (jour - 1) * 24 + 9;
          hotelGens.clientsDuJour(true);
          const m0 = farm.s.money;
          hotelService.prendre();
          // le joueur fait 85 % des demandes (les autres ratent) ; il ne rate jamais un conseil, un secret
          let n = 0;
          while (S.service && !S.service.fini && n < 60) {
            n++;
            farm.s.hours += 0.25;
            // (comme hotelService.tic : un client à l'heure dite, six au plus par service)
            if (farm.s.hours >= S.service.fin) { hotelService.finir(false); break; }
            if (farm.s.hours < S.service.prochaine || S.service.n >= L18_REGL.demande.max) continue;
            const r = mulberry32((jour * 977 + S.service.n * 31) >>> 0)();
            S.service.prochaine = farm.s.hours + L18_REGL.demande.ecart[0] + r * (L18_REGL.demande.ecart[1] - L18_REGL.demande.ecart[0]);
            const d = hotelService.tirer();
            if (d) {
              if (d.type === 'secret') { const tip = Math.round((d.pourboire || 20) * 1.6); farm.earn(tip); hotelService.reputation(L18_REGL.repSecret * (S.rep >= 55 ? 0.5 : 1)); continue; }
              const c = Object.assign({}, d, { etat: 'accepte' });
              if (c.type === 'vallee') farm.give(c.objet, 1);
              if (c.type === 'reserve') farm.give(c.quoi === 'vin' ? 'l18_bouteille' : c.quoi === 'linge' ? 'l18_draps' : 'l18_epicerie', 1);
              if (c.type === 'perdu') { farm.give('l18_objet_perdu', 1); c.trouve = true; }
              S.commissions.push(c);
              if (Math.random() < 0.85) hotelService.reussir(c); else hotelService.rater(c);
              // (l'objet de la vallée, on l'a payé ou trouvé : son prix est retiré du gain)
              if (c.type === 'vallee') farm.s.money -= ITEMS[c.objet].price;
            }
          }
          if (S.service && !S.service.fini) hotelService.finir(false);
          out.par.push(farm.s.money - m0);
          out.rang.push(hotel18.rang().id);
          S.commissions = []; S.demandes = [];
        }
        ui.subtitle = _sub;
        game.world = w0; farm.s = s0; farm.w = fw; game.player = p0;
        return JSON.stringify(out);
      })()`));
      const moy = (a) => a.reduce((x, y) => x + y, 0) / a.length;
      const debut = E.par.slice(0, 10), fin = E.par.slice(-20);
      log(`un service : les dix premiers ${Math.round(moy(debut))} pièces en moyenne (${Math.min(...debut)} à ${Math.max(...debut)}), les vingt derniers ${Math.round(moy(fin))} (au plus ${Math.max(...E.par)}) ; rang au jour 10 : ${E.rang[9]}, au jour 30 : ${E.rang[29]}, au jour 100 : ${E.rang[99]}`);
      if (moy(debut) < 120 || moy(debut) > 450) ko(`un service du début : ${Math.round(moy(debut))} pièces (120 à 450 attendues)`);
      if (moy(fin) < 150 || moy(fin) > 520) ko(`un service, plus tard : ${Math.round(moy(fin))} pièces (150 à 520 attendues)`);
      if (Math.max(...E.par) > 700) ko(`un service à ${Math.max(...E.par)} pièces (700 au plus)`);
      if (E.rang[9] === 'clefs') ko('les clefs d’or en dix jours : trop vite');
      if (E.rang[99] !== 'clefs') ko('les clefs d’or jamais atteintes en cent services');
      if (E.rang[99] === 'stagiaire') ko('toujours stagiaire après cent services : trop lent');
    }
    // ---------------------------------------------------------------- les histoires : ce qu'elles paient (lu dans le code des fins)
    {
      const src = J.ev(`[hotelHistoires.lucienAdieu, hotelHistoires.firminFin, hotelHistoires.concert, hotelHistoires.treizeFin].map((f) => f.toString()).join('\\n')`);
      const pay = [...src.matchAll(/payer\((\d+), \{([^}]*)\}\)/g)].map((m) => ({ n: +m[1], o: m[2] }));
      const R = JSON.parse(J.avec(pay, `JSON.stringify(__v.map((q) => { let val = 0; for (const m of q.o.matchAll(/([a-z_0-9]+): (\\d+)/g)) val += ((ITEMS[m[1]] || {}).price || 0) * +m[2]; return { n: q.n, val }; }))`));
      log('les fins des histoires paient : ' + R.map((q) => q.n + ' pièces + ' + q.val + ' d’objets').join(' ; '));
      for (const q of R) if (q.n > 250 || q.val > 160) ko(`une fin d’histoire paie ${q.n} pièces et ${q.val} d’objets (250 et 160 au plus)`);
      if (R.length < 6) ko('les récompenses des fins introuvables (' + R.length + ')');
    }
    return { echecs };
  },
};
