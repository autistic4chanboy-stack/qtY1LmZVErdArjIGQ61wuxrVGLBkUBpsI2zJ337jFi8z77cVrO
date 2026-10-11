// Équilibrage — l'histoire, la quête principale et ses scènes (agent H17, dix-septième vague)
//  - LES DONNÉES : huit chapitres, chacun son titre, son résumé, ses étapes (une phrase chacune, une épreuve dans
//    histoire.TESTS), sa scène ; les jours d'ouverture ne reculent pas ; chaque scène a son constructeur, son titre au
//    carnet des souvenirs, ses paroles ; les musiques et les fins renvoient à des clés qui existent ; aucune passe de
//    génération (les sauvegardes ne bougent pas) ;
//  - PAS D'IMPASSE : ce que demande chaque étape existe dans le jeu (les notes, le temple et ses trois pierres, au moins
//    trois inscriptions et un bibliothécaire qui enseigne, les quatre tablettes, la Grande Porte, les feux de veille, le
//    carnet du Guet, la clé du dernier guetteur, le collier) ; les lieux nommés par les étapes et les scènes sont dans
//    les deux vallées (graines 1234 et 77), et chaque scène de la vallée s'y construit (des plans aux positions finies) ;
//  - LA PARTIE JOUÉE (les vraies fonctions, dans la machine virtuelle) : de la partie neuve à chaque fin, chaque
//    chapitre s'ouvre à son jour et s'achève par ses étapes, une ancienne partie reprend au bon chapitre ;
//  - LES RÉCOMPENSES : l'histoire ne donne ni argent ni objet (bornées à zéro : ce sont les quêtes et les lieux qui
//    paient) ; la fin ne change rien d'autre que farm.s.histoire.
'use strict';
const fs = require('fs');
const path = require('path');
const { vallee } = require('./vm.js');
module.exports = {
  titre: 'L’histoire : la quête principale et ses cinématiques (H17)',
  async verifier(J, log) {
    let echecs = 0;
    const ko = (m) => { echecs++; log('ÉCHEC : ' + m); };
    // ---------------------------------------------------------------- pas de génération
    const dir = path.join(__dirname, '..', '..', 'src');
    const src = fs.readdirSync(dir).filter((f) => /H17/.test(f));
    const gen = src.filter((f) => /generateValley|B\.prop\(|B\.inter\(|zone\.passe\(/.test(fs.readFileSync(path.join(dir, f), 'utf8')));
    log(`fichiers H17 : ${src.join(', ')} ; génération : ${gen.length ? gen.join(', ') : 'aucune'}`);
    if (gen.length) ko('une passe de génération dans les fichiers H17');

    // ---------------------------------------------------------------- les données
    const D = JSON.parse(J.ev(`(() => {
      const e = [], vide = (s) => typeof s !== 'string' || !s.trim();
      let des = 0; const ids = new Set(), etapes = new Set();
      for (const C of H17_CHAPITRES) {
        if (vide(C.id) || ids.has(C.id)) e.push('chapitre sans id ou en double : ' + C.id);
        ids.add(C.id);
        if (vide(C.num) || vide(C.titre) || vide(C.resume)) e.push(C.id + ' : num, titre, résumé');
        if (!(C.des >= des)) e.push(C.id + ' : le jour d’ouverture recule (' + C.des + ')');
        des = C.des;
        if (!C.cine || !H17_SCENES[C.cine] || !H17_CINES[C.cine]) e.push(C.id + ' : scène ' + C.cine + ' inconnue');
        if (!Array.isArray(C.etapes) || !C.etapes.length) e.push(C.id + ' : pas d’étapes');
        for (const E of C.etapes || []) {
          if (vide(E.id) || vide(E.texte)) e.push(C.id + ' : étape sans texte');
          if (etapes.has(E.id)) e.push(C.id + ' : étape en double ' + E.id);
          etapes.add(E.id);
          if (typeof histoire.TESTS[E.id] !== 'function') e.push(C.id + '.' + E.id + ' : pas d’épreuve');
        }
      }
      for (const k of H17_ORDRE_CINES) {
        if (typeof H17_SCENES[k] !== 'function') e.push('scène ' + k + ' : pas de constructeur');
        const Ci = H17_CINES[k];
        if (!Ci || vide(Ci.titre)) e.push('scène ' + k + ' : pas de titre');
        for (const P of (Ci && Ci.paroles) || []) if (!Array.isArray(P) || vide(P[1])) e.push('scène ' + k + ' : parole vide');
        if (H17_MUSIQUES[k] && !MUSIQUE.morceaux[H17_MUSIQUES[k]]) e.push('scène ' + k + ' : musique inconnue ' + H17_MUSIQUES[k]);
      }
      for (const k in H17_SCENES) if (!H17_ORDRE_CINES.includes(k)) e.push('scène ' + k + ' hors du carnet');
      for (const f in H17_FINS) { const F = H17_FINS[f]; if (!H17_SCENES[F.cine] || vide(F.titre) || vide(F.resume) || !['delivre', 'tue'].includes(F.v3)) e.push('fin ' + f); }
      if (Object.keys(H17_FINS).length < 2) e.push('moins de deux fins');
      for (const k in H17_V5) if (vide(H17_V5[k])) e.push('V5 ' + k);
      for (const k in H17_TEXTES) if (vide(H17_TEXTES[k])) e.push('texte ' + k);
      if (!H17_GENERIQUE.some(([k, t]) => k === 'titre' && t === H17_TITRE_JEU)) e.push('le générique ne porte pas le titre du jeu');
      return JSON.stringify({ e, n: H17_CHAPITRES.length, etapes: etapes.size, cines: H17_ORDRE_CINES.length, titres: H17_CHAPITRES.map((C) => C.num + '. ' + C.titre + ' (jour ' + C.des + ')') });
    })()`));
    for (const t of D.titres) log('  ' + t);
    log(`${D.n} chapitres, ${D.etapes} étapes, ${D.cines} cinématiques`);
    for (const m of D.e) ko(m);
    if (D.n < 6 || D.n > 8) ko(`${D.n} chapitres (6 à 8 attendus)`);

    // ---------------------------------------------------------------- pas d'impasse : ce que demandent les étapes existe
    const I = JSON.parse(J.ev(`JSON.stringify({
      notes: ['Lettre à celui qui viendra', 'Une tombe sans date', 'Dernière page d’Anselme'].map((t) => [t, h17.noteId(t)]),
      inter: ['inscription', 'temple_entree', 'pierre_trois', 'r15_tablette', 'v1_porte', 'v1_feu', 'v3_carnet', 'v3_reste'].map((k) => [k, typeof HOOKS.inter[k] === 'function']).concat([['le collier (dragonV3.toucherCollier, delivrer)', typeof dragonV3.toucherCollier === 'function' && typeof dragonV3.delivrer === 'function']]),
      libraire: NPC_DATA.some((d) => d.id === 'libraire'),
      mots: Object.keys(LANGUES.aelin.lex).length + Object.keys(LANGUES.gorrain.lex).length,
      tablettes: R15_REGL.tablettes,
      cle: !!ITEMS.v3_cle_collier && !!ITEMS.cle_grande_porte,
      aire: !!V1_SITES.dragon_aire,
    })`));
    for (const [t, id] of I.notes) if (!id) ko(`la note « ${t} » n’existe pas`);
    for (const [k, ok] of I.inter) if (!ok) ko(`pas d’interaction « ${k} »`);
    if (!I.libraire) ko('pas de bibliothécaire pour enseigner les mots');
    if (I.mots < 6) ko(`${I.mots} mots dans les langues perdues`);
    if (!I.cle) ko('la clé du collier ou de la Grande Porte manque');
    if (!I.aire) ko('pas d’aire du Ver dans la Zone');
    log(`les sources : notes ${I.notes.map((n) => n[1]).join(', ')} ; ${I.mots} mots ; ${I.tablettes} tablettes ; interactions ${I.inter.filter((x) => x[1]).length}/${I.inter.length}`);

    // ---------------------------------------------------------------- les lieux et les scènes, dans deux vallées
    for (const graine of [1234, 77]) {
      const w = await vallee(J, graine);
      J.ctx.__w = w;
      const L = JSON.parse(J.ev(`(() => {
        const w = __w, w0 = game.world, p0 = game.player, s0 = farm.s;
        game.world = w; farm.w = w;
        farm.s = farm.blank(${graine}); farm.s.notes = {};
        const F = w.farm.f;
        game.player = { pos: [F.x, w.heightAt(F.x, F.z), F.z], yaw: 0.4, pitch: 0, hp: 100, food: 80, vel: [0, 0, 0], eyePos() { return [this.pos[0], this.pos[1] + 1.6, this.pos[2]]; } };
        const out = { e: [], lieux: [], scenes: [] };
        const lieux = new Set(['ferme', 'cimetiere', 'vieux_puits', 'cascade', 'temple', 'bibliotheque', 'grande_porte', 'foret']);
        for (const C of H17_CHAPITRES) for (const E of C.etapes) if (E.lieu) lieux.add(E.lieu);
        for (const k of lieux) { if (!w.lm[k]) out.e.push('lieu ' + k + ' absent'); else out.lieux.push(k); }
        if (!['dolmen', 'menhirs', 'cercle'].some((k) => w.lm[k])) out.e.push('ni dolmen, ni menhirs, ni cercle');
        for (const t of ['Lettre à celui qui viendra', 'Une tombe sans date', 'Dernière page d’Anselme']) if (!h17.note(t)) out.e.push('note « ' + t + ' » pas posée');
        if (!w.temple) out.e.push('pas de temple');
        if (!w.inter.some((i) => i.kind === 'temple_entree')) out.e.push('pas d’entrée du temple');
        if (w.inter.filter((i) => i.kind === 'pierre_trois').length < 3) out.e.push('moins de trois pierres au temple');
        const ins = new Set(w.inter.filter((i) => i.kind === 'inscription' && i.data && i.data.ins).map((i) => i.data.ins));
        if (ins.size < 3) out.e.push(ins.size + ' inscriptions seulement');
        const tab = (w.r15 && w.r15.tablettes) || [];
        if (tab.length < R15_REGL.tablettes) out.e.push(tab.length + ' tablettes posées');
        if (!w.v1porte) out.e.push('pas de Grande Porte');
        if (!w.bld.bibliotheque) out.e.push('pas de bibliothèque');
        out.ins = ins.size; out.tab = tab.length;
        // les scènes de la vallée (et celles d'ailleurs, ici dans la vallée : leur plan de secours)
        const fini = (v) => Array.isArray(v) && v.length === 3 && v.every(Number.isFinite);
        for (const k of H17_ORDRE_CINES) {
          let sc = null;
          const t0 = Date.now();
          try { sc = H17_SCENES[k](k === 'fin_cendre' ? 'cendre' : 'aube'); } catch (e) { out.e.push('scène ' + k + ' : ' + (e && e.message)); continue; }
          if (!sc || !Array.isArray(sc.plans) || !sc.plans.length) { out.e.push('scène ' + k + ' : rien à montrer'); continue; }
          let dur = 0, mauvais = 0, texte = 0;
          for (const P of sc.plans) {
            dur += P.dur || 0;
            if (P.texte) texte++;
            const cams = [];
            if (P.de) cams.push(P.de.pos, P.de.look); if (P.a) cams.push(P.a.pos, P.a.look);
            if (P.chemin) for (const c of P.chemin) cams.push(c.pos, c.look);
            if (P.orbite) cams.push(P.orbite.c);
            for (const F2 of P.figurants || []) cams.push(F2.de);
            for (const c of cams) if (c && !fini(c)) mauvais++;
          }
          if (mauvais) out.e.push('scène ' + k + ' : ' + mauvais + ' positions non finies');
          if (dur > 40) out.e.push('scène ' + k + ' : ' + dur.toFixed(0) + ' s (trop longue)');
          out.scenes.push(k + ' ' + sc.plans.length + ' plans ' + dur.toFixed(0) + ' s (' + (Date.now() - t0) + ' ms)');
        }
        game.world = w0; game.player = p0; farm.s = s0;
        return JSON.stringify(out);
      })()`));
      log(`vallée ${graine} : ${L.lieux.length} lieux, ${L.ins} inscriptions, ${L.tab} tablettes ; scènes : ${L.scenes.join(' ; ')}`);
      for (const m of L.e) ko(`vallée ${graine} : ${m}`);
    }

    // ---------------------------------------------------------------- la partie jouée, jusqu'à chaque fin ; les récompenses
    const R = JSON.parse(J.ev(`(() => {
      const s0 = farm.s, out = { e: [], fins: {}, pas: [] };
      const su0 = ui.subtitle; ui.subtitle = () => {};
      for (const fin of ['delivre', 'tue']) {
        farm.s = farm.blank(1234); farm.s.notes = {}; farm.s.day = 1;
        const m0 = farm.s.money, inv0 = JSON.stringify(farm.s.inv);
        const H = histoire.S(), ch = () => (histoire.chapitre() ? histoire.chapitre().id : 'fin');
        const cran = (nom, fn, jour) => { fn(); if (jour) farm.s.day = jour; histoire.tick(); histoire.tick(); out.pas.push(nom + '→' + ch()); };
        histoire.tick();
        if (ch() !== 'c1' || !histoire.ouvert('c1')) out.e.push('partie neuve : pas au chapitre I');
        const lire = (t) => { farm.s.notes[h17.noteId(t)] = 1; };
        cran('lettre', () => lire('Lettre à celui qui viendra'));
        if (ch() !== 'c1') out.e.push('c1 achevé sans la nuit');
        cran('nuit', () => {}, 2);
        cran('tombe+page', () => { lire('Une tombe sans date'); lire('Dernière page d’Anselme'); });
        if (ch() !== 'c3' || histoire.ouvert('c3')) out.e.push('c3 ouvert avant son jour');
        cran('jour 4, temple', () => { temple.S().vu = 4; temple.S().ouvert = 1; }, 4);
        cran('pierres+mots', () => { farm.s.livres = farm.s.livres || {}; farm.s.livres.ins = { a: { j: 1 }, b: { j: 1 }, c: { j: 1 } }; savoir.apprendreMots('aelin', Object.keys(LANGUES.aelin.lex).slice(0, 3)); savoir.apprendreMots('gorrain', Object.keys(LANGUES.gorrain.lex).slice(0, 3)); }, 6);
        cran('tablettes', () => { for (let i = 0; i < R15_REGL.tablettes; i++) runes.S().t[i] = ['x']; runes.S().n = 1; }, 8);
        cran('la Porte', () => { savoir.connaitreLieu('grande_porte'); zone.S().entrees = 1; }, 10);
        cran('feu+carnet', () => { zone.S().feux.essai = 10; dragonV3.S().carnet = 10; });
        if (ch() !== 'c8') out.e.push('pas au chapitre VIII (' + ch() + ')');
        cran('clé', () => { dragonV3.S().cle = 10; });
        cran('fin ' + fin, () => { dragonV3.S().fin = fin; });
        const f = fin === 'delivre' ? 'aube' : 'cendre';
        if (H.fin !== f) out.e.push('fin ' + fin + ' : ' + H.fin);
        if (H.file.join(',') !== ['finale', H17_FINS[f].cine, 'generique'].join(',')) out.e.push('fin ' + fin + ' : scènes ' + H.file.join(','));
        if (Object.keys(H.fini).length !== 8) out.e.push('fin ' + fin + ' : ' + Object.keys(H.fini).length + ' chapitres achevés');
        out.fins[fin] = { argent: farm.s.money - m0, objets: JSON.stringify(farm.s.inv) !== inv0 };
      }
      // une ancienne partie (sans farm.s.histoire) : elle reprend au bon chapitre, sans rejouer le passé
      farm.s = farm.blank(1234); farm.s.notes = {}; farm.s.day = 9;
      for (const t of ['Lettre à celui qui viendra', 'Une tombe sans date', 'Dernière page d’Anselme']) farm.s.notes[h17.noteId(t)] = 1;
      temple.S().ouvert = 1; temple.S().vu = 2;
      delete farm.s.histoire;
      for (const fn of HOOKS.load) { try { fn(JSON.parse(JSON.stringify(farm.s))); } catch (e) { /* d'autres modules veulent le monde */ } }
      const H = histoire.S();
      out.ancienne = (histoire.chapitre() ? histoire.chapitre().id : 'fin') + ' / à voir ' + H.aVoir + ' / ' + histoire.souvenirs().join(',');
      if (!histoire.chapitre() || histoire.chapitre().id !== 'c4' || H.aVoir !== 'c4') out.e.push('ancienne partie : ' + out.ancienne);
      // une ancienne partie où le Ver est déjà délivré : finie, rien à rejouer
      farm.s = farm.blank(1234); farm.s.notes = {}; farm.s.day = 30; dragonV3.S().fin = 'delivre';
      delete farm.s.histoire;
      for (const fn of HOOKS.load) { try { fn(JSON.parse(JSON.stringify(farm.s))); } catch (e) { /* idem */ } }
      if (histoire.S().fin !== 'aube' || histoire.S().file.length) out.e.push('ancienne partie finie : ' + histoire.S().fin + ' ' + histoire.S().file);
      ui.subtitle = su0; farm.s = s0;
      return JSON.stringify(out);
    })()`));
    log('partie jouée : ' + R.pas.join(' ; '));
    log('ancienne partie : ' + R.ancienne);
    for (const m of R.e) ko(m);
    for (const f in R.fins) {
      const F = R.fins[f];
      log(`fin « ${f} » : ${F.argent} pièces, objets ${F.objets ? 'changés' : 'inchangés'}`);
      if (F.argent !== 0 || F.objets) ko(`la fin « ${f} » donne quelque chose (l’histoire ne paie pas)`);
    }
    return { echecs };
  },
};
