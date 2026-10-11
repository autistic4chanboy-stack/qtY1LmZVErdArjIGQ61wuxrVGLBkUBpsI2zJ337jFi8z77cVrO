// ============================================================================
//  LES MUSICIENS (A18) : chacun son répertoire, ses séances, son instrument.
//  - Le vieux Tiennot, violoneux de la place (11-zzz99-activites.js) : une
//    séance par matinée, une par soirée ; il accorde parfois son violon (les
//    quintes à vide), joue trois à six airs (jamais deux fois le même de
//    suite), souffle entre deux (quatre à quinze secondes), se repose
//    parfois ; vif le matin et les jours de marché, de foire, de veillée,
//    l'Orédi ; valses, mazurkas et complaintes vers le soir. Il joue que l'on
//    soit là ou non : on arrive au milieu d'un air. Une pièce dans son
//    chapeau : il finit sa partie, puis joue une complainte. L'écouter apaise
//    toujours (quand il joue, à moins de neuf pas).
//  - Les musiciens de passage (11-zzzzF-*.js) : le violoneux de la noce, le
//    fifre et le tambour des saltimbanques (le tambour suit la mesure de
//    l'air), le vielleux de la halte de nuit, le petit Savoyard, le cantique
//    des pèlerins, la litanie de la procession, la berceuse du puits, le
//    requiem de la messe des morts : l'événement garde son déroulement (quand
//    jouer, à quelle distance, ses notes au carnet) ; quand il demande un air,
//    c'est le suivant de sa séance qui vient, sur le nouvel instrument, et il
//    attend la fin de l'air et la pause d'après. L'air s'arrête à la fin de sa
//    partie quand les musiciens s'en vont, en fondu quand l'événement finit.
//  - Le pianiste du Grand Cercle : des valses, des mazurkas, des polkas.
//  - Les petites cloches : la clochette à la ceinture (récits), la sonnette
//    du gain au Cercle.
//  (Les niveaux : ceux d'avant, mesurés hors ligne, pondérés K.)
// ============================================================================
const musiciensA18 = {
  graine() { try { return (game.world && game.world.seed) | 0; } catch (e) { return 0; } },
  jour() { try { return farm.s ? farm.s.day : 0; } catch (e) { return 0; } },
  heure() { try { return npcs.hour(); } catch (e) { return 12; } },
  // jour de fête, de marché, de veillée : on joue plus vif
  fete() { try { const k = cal.jour(farm.s.day).cle; return k === 'marche' || k === 'foire' || k === 'veillee' || k === 'messe'; } catch (e) { return false; } },
  ctx() { return { h: this.heure(), fete: this.fete() }; },

  // ================================================================ le violoneux de la place
  V: null,
  // les niveaux : l'archet (sur la loi de distance de l'ancien violon, 0,85 × (1 − d/34))
  NIV_PLACE: 0.38,
  violoneux(A, dt) { try { this.violoneux0(A, dt); } catch (e) { if (!this.err) { this.err = true; console.error('violoneux', e); } } },
  violoneux0(A, dt) {
    // (le son vient de s'ouvrir : les formes d'onde des instruments, en tâche de fond ; chaque image, on regarde)
    if (sound.ctx && this._ondesCtx !== sound.ctx) { this._ondesCtx = sound.ctx; this.chauffer(); }
    const w = game.world, F = w.act && w.act.violon, p = game.player;
    const d = F ? Math.hypot(p.pos[0] - F.x, p.pos[2] - F.z) : 1e9;
    const present = !!F && A.violonPresent();
    const ok = sound.ok && sound.ctx;
    const audible = present && ok && d < 34 && !p.underground;
    let M = this.V;
    // une séance par matinée, une par soirée
    const cle = this.jour() + (this.heure() < 14 ? 'm' : 's');
    if (!present) { A.musique = null; if (M) this.violoneuxFin(); return; }
    if (!M || M.cle !== cle) {
      if (M) this.violoneuxFin();
      M = this.V = { cle, S: new AIRS18.Session('violoneux', this.graine(), { jour: 'tiennot' + cle }), x: null, t: 0, dur: 0, J: null, g: null, em: null, placeT: 0 };
    }
    // (on l'entend : la musique du jeu se tait, entre deux airs aussi ; 12-zzzzM-musique.js)
    A.musique = audible ? M : null;
    // une pièce dans le chapeau : il finit sa partie, puis une complainte
    if (A.air === 'complainte') {
      A.air = null;
      M.S.demander('complainte');
      if (M.x && M.J) { const q = M.x.type === 'air' ? M.J.finPartie() : sound.ctx.currentTime + 0.3; M.J.arreter(q, 0.5); M.dur = Math.min(M.dur, q - M.J.t0 + 0.5); M.vite = true; }
      else if (M.x) { M.dur = Math.min(M.dur, M.t + 1.5); M.vite = M.x.type === 'air'; }
    }
    // le temps de la séance (il joue que l'on soit là ou non)
    if (M.J) M.t = sound.ctx.currentTime - M.J.t0; else M.t += dt;
    if (!M.x || M.t >= M.dur) {
      if (M.J) { M.J = null; }
      let x = M.S.suivant(this.ctx());
      if (M.vite && (x.type === 'pause' || x.type === 'repos')) { x = { type: 'pause', d: 2 }; M.vite = false; }
      M.x = x; M.t = 0; M.dur = x.type === 'air' || x.type === 'accord' ? x.air.duree * 1.03 + 0.4 : x.d;
    }
    const joue = M.x.type === 'air' || M.x.type === 'accord';
    // l'écouter apaise (quand il joue, tout près)
    if (joue && audible && d < 9) {
      const S = A.S();
      S.ecoute = (S.ecoute || 0) + dt;
      if (S.ecoute >= 20 && !A.fait('ecoute1')) { A.marquer('ecoute1'); A.esprit(1, 'musique', 2); ui.subtitle('', '(La musique vous détend les épaules.)', 3); if (strange.fear) strange.fear = Math.max(0, strange.fear * 0.5); }
      if (S.ecoute >= 60 && !A.fait('ecoute2')) { A.marquer('ecoute2'); A.esprit(1, 'musique', 2); }
    }
    if (!ok) return;
    const now = sound.ctx.currentTime;
    // le son : une source placée sur le violoneux (l'atténuation : la loi de l'ancien violon)
    if (audible && joue && !M.J && M.dur - M.t > 1) {
      if (!M.em) { M.em = sound.tenir([F.x, F.y + 1.45, F.z], sound.B.sfx.inp, { att: 'aucune' }); M.g = sound.ctx.createGain(); M.g.gain.value = 0; M.g.connect(M.em.inp); }
      M.J = sound.jouerAir(M.x.air, { out: M.g, vol: this.NIV_PLACE, depuis: M.t > 0.4 ? M.t : 0 });
      if (M.J) M.dur = M.J.fin - M.J.t0 + 0.3;
    } else if (!audible && M.J) { M.J.arreter(now, 0.8); M.J = null; }
    if (M.g) M.g.gain.setTargetAtTime(audible ? clamp(1 - d / 34, 0, 1) * 0.85 : 0, now, 0.2);
    // (l'air, la réverbération : selon la distance, qui change quand on bouge)
    M.placeT -= dt;
    if (M.em && M.placeT <= 0) { M.placeT = 0.3; try { sound._place(M.em, [F.x, F.y + 1.45, F.z], true); } catch (e) { /* rien */ } }
  },
  violoneuxFin() {
    const M = this.V;
    this.V = null;
    if (!M) return;
    try { if (M.J) M.J.arreter(sound.ctx.currentTime, 0.8); } catch (e) { /* rien */ }
    if (M.g) try { M.g.gain.setTargetAtTime(0, sound.ctx.currentTime, 0.3); } catch (e) { /* rien */ }
    if (M.em) setTimeout(() => { try { sound.lacher(M.em); } catch (e) { /* rien */ } }, 2500);
  },

  // ================================================================ les musiciens de passage (événements)
  // rep : leur répertoire ; K : le volume (× celui que l'événement demandait à l'ancien air) ; pause : celle que
  // l'événement laisse déjà entre deux airs (s) ; voix : [transposition, part du volume, voyelle, retard (s)] ;
  // stop(E) : ils ont fini (on termine la partie en cours)
  EVT: {
    noce: { rep: 'noce', inst: 'violon', K: 5.4, pause: 1.2 },
    saltimbanques: { rep: 'fifre', inst: 'fifre', K: 10.7, pause: 3, tambour: 1.65, stop: (E) => !!E.depart },
    roulottes_nuit: { rep: 'vielleux', inst: 'vielle', K: 4.48, pause: 8 },
    petit_savoyard: { rep: 'savoyard', inst: 'vielle', K: 4.48, pause: 4, chien: false },
    pelerins: { rep: 'pelerins', inst: 'voix', K: 25, pause: 6, voix: [[0, 1, 'a'], [-12, 0.7, 'o']] },
    procession: { rep: 'litanie', inst: 'voix', K: 25, pause: 2.5, voix: [[0, 1, 'o'], [-12, 0.83, 'o'], [-5, 0.52, 'a']], stop: (E) => !!(E.C && E.C.fini) },
    chanson_puits: { rep: 'puits', inst: 'voix', K: 25, pause: 3, voix: [[0, 1, 'ou'], [0, 0.38, 'ou', 0.28]], stop: (E) => !!E.tait },
    messe_morts: { rep: 'requiem', inst: 'voix', K: 25, pause: 2, voix: [[0, 1, 'o'], [-12, 0.86, 'ou'], [-5, 0.5, 'a']], stop: (E) => !!E.tait },
  },
  // les airs que ces événements chantaient déjà (gardés dans leur séance), et les formules de la litanie
  extra(id) {
    const X = [], ad = (cle, notes, bpm, inst, poids) => X.push({ cle, style: 'ancien', inst, poids, air: AIRS18.depuisNotes(notes, bpm, inst, { nom: cle }) });
    if (id === 'chanson_puits' && typeof HF_BERCEUSE !== 'undefined') ad('berceuse_puits', HF_BERCEUSE, 66, 'voix', 2);
    if (id === 'messe_morts' && typeof HF_REQUIEM !== 'undefined') ad('requiem', HF_REQUIEM, 54, 'voix', 2);
    if (id === 'procession') {
      if (typeof HF_LITANIE !== 'undefined') ad('litanie0', HF_LITANIE, 64, 'voix', 1.5);
      // (des formules de litanie : l'invocation sur une teneur, la réponse « ora pro nobis » qui retombe)
      ad('litanie1', [[62, 1], [65, 1], [67, 1], [67, 1], [67, 1], [65, 1], [67, 2], [null, 0.5], [67, 1], [65, 1], [64, 1], [62, 2.5]], 64, 'voix', 1);
      ad('litanie2', [[60, 1], [62, 1], [64, 1], [64, 1], [64, 1], [62, 1], [64, 2], [null, 0.5], [64, 1], [62, 1], [60, 1], [62, 2.5]], 62, 'voix', 1);
      ad('litanie3', [[65, 1], [64, 1], [62, 1], [64, 1], [65, 1], [67, 1], [65, 2], [null, 0.5], [64, 1], [62, 1], [60, 1], [62, 2.5]], 66, 'voix', 1);
      ad('litanie4', [[62, 1], [62, 1], [64, 1], [65, 1.5], [64, 0.5], [62, 2], [null, 0.5], [60, 1], [62, 1], [64, 1.5], [62, 0.5], [62, 2.5]], 60, 'voix', 1);
    }
    return X;
  },
  seance(E, id) {
    if (!E.seanceA18) E.seanceA18 = new AIRS18.Session(this.EVT[id].rep, this.graine(), { jour: id + ':' + this.jour() + ':' + (E.h0 || 0), extra: this.extra(id) });
    return E.seanceA18;
  },
  // l'événement demande un air (dans sa portée « ici ») : on joue le suivant de la séance ; on rend le temps à attendre
  jouerEvt(E, id, o) {
    const D = this.EVT[id];
    if (!D || (D.stop && D.stop(E))) return 0;
    const S = this.seance(E, id), ctx = this.ctx();
    let x = S.suivant(ctx), attente = 0, n = 0;
    while ((x.type === 'pause' || x.type === 'repos') && n++ < 4) { attente += x.type === 'repos' ? 0 : x.d; x = S.suivant(ctx); }
    const vol = (o && o.vol ? o.vol : 0.04) * D.K, bus = o && o.bus;
    const H = E.musA18 || (E.musA18 = []), T = this.tous;
    const jouer = (air, delai) => {
      if (D.voix) { let du = 0; for (const [k, part, voy, ret] of D.voix) { const J = sound.jouerAir(k ? AIRS18.transposer(air, k) : air, { inst: 'voix', vol: vol * part, voyelle: voy, bus, delai: delai + (ret || 0) }); if (J) { H.push(J); T.push(J); du = Math.max(du, J.duree); } } return du; }
      const J = sound.jouerAir(air, { inst: D.inst, vol, bus, delai, tambour: D.tambour ? D.tambour : 0, chien: D.chien });
      if (J) { H.push(J); T.push(J); }
      return J ? J.duree : 0;
    };
    let du = 0;
    if (x.type === 'accord') {
      du = jouer(x.air, attente) + 1.2;
      const y = S.suivant(ctx);
      if (y.type === 'air') du += jouer(y.air, attente + du); else S.remettre(y);
    } else if (x.type === 'air') du = jouer(x.air, attente);
    if (!du) return 0;
    // la pause d'après (tirée maintenant : l'événement attendra)
    const p = S.suivant(ctx);
    let apres = 0;
    if (p.type === 'pause' || p.type === 'repos') apres = p.d; else S.remettre(p);
    while (H.length > 6) H.shift();
    while (T.length > 12) T.shift();
    return attente + du + Math.max(0, apres - D.pause);
  },
  // (tout ce qui joue encore, pour tout faire taire quand on charge une partie)
  tous: [],
  taire() { try { const now = sound.ctx ? sound.ctx.currentTime : 0; for (const J of this.tous) if (J.fin > now) J.arreter(now, 0.8); } catch (e) { /* rien */ } this.tous = []; },
  // les musiciens s'en vont, l'événement finit : l'air s'arrête (à la fin de sa partie, ou en fondu)
  arreterEvt(E, net) {
    const H = E.musA18;
    if (!H || !sound.ctx) return;
    const now = sound.ctx.currentTime;
    for (const J of H) { if (J.fin <= now) continue; if (net) J.arreter(now, 1.5); else J.arreter(Math.min(J.finPartie(now + 0.5), now + 12), 0.8); }
    E.musA18 = [];
  },
  brancherEvt() {
    if (typeof HF === 'undefined') return;
    for (const id in this.EVT) {
      const D = HF[id];
      if (!D || D._a18 || typeof D.maj !== 'function') continue;
      D._a18 = true;
      const maj0 = D.maj, fin0 = D.fin, self = this, Dd = this.EVT[id];
      // pendant la mise à jour de l'événement, sound.hfAir joue la séance (le premier appel ; les autres voix et le
      // tambour d'avant sont dans l'air joué)
      D.maj = function (E, ...a) {
        if (Dd.stop && E.musA18 && E.musA18.length && Dd.stop(E)) self.arreterEvt(E, false);
        const propre = Object.prototype.hasOwnProperty.call(sound, 'hfAir'), h0 = sound.hfAir, t0 = sound.hfTambour, propreT = Object.prototype.hasOwnProperty.call(sound, 'hfTambour');
        let n = 0;
        sound.hfAir = function (notes, o) { if (n++) return 0; try { return self.jouerEvt(E, id, o); } catch (e) { console.error('musiciens', id, e); return 0; } };
        if (Dd.tambour) sound.hfTambour = () => 0;
        try { return maj0.call(this, E, ...a); } finally {
          if (propre) sound.hfAir = h0; else delete sound.hfAir;
          if (Dd.tambour) { if (propreT) sound.hfTambour = t0; else delete sound.hfTambour; }
        }
      };
      D.fin = function (E, raison) { self.arreterEvt(E, true); return fin0 ? fin0.call(this, E, raison) : undefined; };
    }
  },

  // ================================================================ les airs composés d'avance
  // Composer un air prend une à quelques millisecondes : les répertoires du monde se composent en tâche de fond, un air
  // à la fois, quand le navigateur a du temps (au chargement d'une partie) ; un musicien n'a plus qu'à choisir.
  chauffe: [],
  chauffer() {
    const g = this.graine();
    this.chauffe = Object.keys(AIRS18.REPERTOIRES).map((m) => AIRS18.repertoire(g, m));
    if (this._chT) return;
    const ric = typeof requestIdleCallback === 'function' ? (f) => requestIdleCallback(f, { timeout: 3000 }) : (f) => setTimeout(() => f(null), 120);
    const tour = (dl) => {
      this._chT = 0;
      const fin = performance.now() + (dl ? Math.min(8, Math.max(1, dl.timeRemaining() - 2)) : 3);
      let ondes = false;
      try {
        // (les formes d'onde des instruments d'abord, une par tour, puis les airs)
        if (sound.ctx && sound.a18Ondes) ondes = sound.a18Ondes();
        if (!ondes) do { if (!this.chauffe.length) break; if (!AIRS18.prechauffer(this.chauffe[0])) this.chauffe.shift(); } while (performance.now() < fin);
      } catch (e) { this.chauffe = []; ondes = false; }
      if (this.chauffe.length || ondes) this._chT = ric(tour) || 1;
    };
    this._chT = ric(tour) || 1;
  },

  // ================================================================ le pianiste du Grand Cercle
  P: null,
  NIV_PIANO: 0.3,
  // appelé par le Cercle de temps en temps (sound.c18('piano', pos, k)) : il joue l'air suivant s'il ne joue pas déjà
  // et si sa pause est finie
  pianiste(eng, k) {
    const now = eng.ctx.currentTime, cle = this.jour();
    let P = this.P;
    if (!P || P.cle !== cle) P = this.P = { cle, S: new AIRS18.Session('pianiste', this.graine(), { jour: 'pianiste' + cle }), pret: 0 };
    if (now < P.pret) return;
    // (une pause : l'air suivant viendra après elle ; un long repos : il quitte son tabouret un moment)
    let x = P.S.suivant(this.ctx()), delai = 0;
    if (x.type === 'repos') { P.pret = now + x.d; return; }
    if (x.type === 'pause') { delai = Math.min(15, x.d); x = P.S.suivant(this.ctx()); }
    if (x.type !== 'air') { P.S.remettre(x); P.pret = now + 5; return; }
    const J = eng.jouerAir(x.air, { inst: 'piano', vol: this.NIV_PIANO * (k || 1), delai });
    P.pret = J ? J.fin : now + 5;
    if (J) { this.tous.push(J); while (this.tous.length > 12) this.tous.shift(); }
  },
};

// ---------------------------------------------------------------- les branchements
// (le violoneux de la place : activites.jouerMusique appelle musiciensA18.violoneux)
// les musiciens de passage
musiciensA18.brancherEvt();
// le pianiste du Cercle (s'il est là ; sinon, la nuit, le piano qu'on entend Cercle fermé joue sa phrase d'avant)
if (SoundEngine.prototype.c18_piano) {
  const piano0 = SoundEngine.prototype.c18_piano;
  SoundEngine.prototype.c18_piano = function (k) {
    if (typeof c18 !== 'undefined' && c18.present && c18.present('pianiste')) return musiciensA18.pianiste(this, k);
    return piano0.call(this, k);
  };
}
// la sonnette du gain, au Cercle : une sonnette d'acier (un timbre de comptoir), frappée n fois
if (SoundEngine.prototype.c18_sonnette) {
  SoundEngine.prototype.c18_sonnette = function (n) {
    const t = this.at(0.01), o = this.ui || this.sfx;
    for (let i = 0; i < Math.min(8, n); i++) this._petiteCloche(t + i * 0.16 + Math.random() * 0.015, 2093 * (i % 2 ? 1.004 : 1), [[1, 1, 0.6], [2.71, 0.32, 0.3], [5.03, 0.12, 0.15]], 0.03, o, 3.1);
  };
}
// les récits des proches : la clochette (à la ceinture de quelqu'un) n'est pas la cloche de l'église
if (typeof K18_SONS !== 'undefined') K18_SONS.clochette = () => sound.clochette && sound.clochette(0.8);
// une partie chargée : le violoneux recommence sa séance
if (typeof HOOKS !== 'undefined' && HOOKS.load) HOOKS.load.push(() => { musiciensA18.violoneuxFin(); musiciensA18.taire(); musiciensA18.P = null; try { if (farm.s && game.world) musiciensA18.chauffer(); } catch (e) { /* rien */ } });
