// ============================================================================
//  LES VOIX DE CHAQUE MILIEU (3) : la scène (agent S, douzième vague)
//  Chaque milieu a sa voix. Autour de l'écouteur, on pèse les milieux (la
//  grille des biomes, les mares du marais, la rive des lacs, les abords de la
//  ville, les hameaux) ; ces poids glissent lentement (quelques secondes) :
//  d'un milieu à l'autre, les sons se fondent. Pour chaque milieu :
//   - ses nappes (insectes, grenouilles, crapauds, vent dans les arbres, les
//     roseaux, la bruyère, l'air des cimes, le ressac), selon l'heure et le
//     temps qu'il fait ;
//   - ses chanteurs (à l'aube, le jour, le soir, la nuit), à leur place : dans
//     les arbres, dans l'herbe, dans le ciel, dans les roseaux, sur les toits ;
//   - ses bruits rares (la basse-cour, un chien très loin, une charrette sur
//     les pavés, les sonnailles là-haut, un caillou qui dévale, une brindille,
//     un tronc qui grince, les gousses d'ajonc au soleil, un poisson qui saute,
//     l'angélus trois fois par jour) ;
//   - sa pluie (sur les feuilles, sur l'eau, sur les toits et les pavés, sur la
//     bruyère et la pierre, sur la paille et les tuiles, dans l'herbe ; sur le
//     toit au-dessus de soi quand on est à l'abri), et, en forêt, l'égouttement
//     des arbres après l'averse.
//  Tout reste doux et rare. Le brouillard étouffe, la neige fait taire, le
//  gel endort les insectes, la canicule les réveille ; sous terre, dans les
//  autres mondes, les nuits rouges et l'Envers : rien de tout cela.
//  Nappes diffuses : deux lectures décalées d'un même tampon, en stéréo, sans
//  panneau 3D (peu de nœuds, peu de calcul) ; les chants et les bruits rares
//  viennent de leur place (son 3D). Tampons calculés en tâche de fond, le
//  milieu où l'on est d'abord. Tout passe par le réglage « Ambiance ».
//  API (tests, rendus) : ambiance.actif, ambiance.forcer(milieu), ambiance.poids(),
//  ambiance.etat().
// ============================================================================

// ---------------------------------------------------------------- qui chante où, et quand
// [sorte, poids] à l'aube (4 h 30 – 8 h 30), le jour, le soir (17 h – 22 h) et la nuit
SoundEngine.CHANTEURS = {
  foret: {
    aube: [['merle', 3], ['s_rougegorge', 3], ['s_grive', 3], ['s_troglodyte', 2], ['pinson', 2], ['s_fauvette', 1.5], ['s_ramier', 1], ['s_veloce', 1]],
    jour: [['s_grive', 2.5], ['s_rougegorge', 2], ['s_troglodyte', 2], ['pinson', 2.5], ['merle', 2], ['mesange', 1.5], ['s_sittelle', 1.2], ['s_fauvette', 2], ['s_ramier', 1.5], ['s_veloce', 1.5], ['tourterelle', 0.4], ['coucou', 0.25], ['s_loriot', 0.3]],
    soir: [['merle', 3], ['s_rougegorge', 3], ['s_grive', 2.5], ['s_troglodyte', 1]],
    nuit: [['s_moyenduc', 2]],
  },
  bouleaux: {
    aube: [['s_rougegorge', 2.5], ['s_fitis', 2.5], ['pinson', 2], ['merle', 2], ['s_veloce', 1.5], ['s_troglodyte', 1]],
    jour: [['s_fitis', 3], ['s_mesbleue', 2], ['s_veloce', 2], ['pinson', 2], ['mesange', 1.5], ['s_bouvreuil', 1.2], ['s_rougegorge', 1.2], ['s_fauvette', 1], ['merle', 1]],
    soir: [['s_rougegorge', 2.5], ['merle', 2], ['s_fitis', 1], ['s_grive', 1]],
    nuit: [['s_engoulevent', 2.5], ['s_moyenduc', 1.5]],
  },
  plaine: {
    aube: [['alouette', 3], ['s_bruant', 2], ['s_caille', 1.5], ['merle', 1], ['s_linotte', 1], ['coucou', 0.3]],
    jour: [['alouette', 3], ['s_bruant', 2.5], ['s_proyer', 1.5], ['s_caille', 1.2], ['s_linotte', 1.5], ['s_hirondelle', 1], ['s_tarier', 0.5], ['tourterelle', 0.8], ['pinson', 0.6], ['merle', 0.6], ['coucou', 0.2]],
    soir: [['merle', 2], ['s_caille', 1.5], ['alouette', 1], ['s_bruant', 1]],
    nuit: [['s_rale', 2.5], ['s_caille', 1.2], ['s_cheveche', 1], ['s_rossignol', 1.2]],
  },
  lande: {
    aube: [['s_lulu', 3], ['s_tarier', 1.5], ['s_linotte', 1.5], ['alouette', 1]],
    jour: [['s_lulu', 2.5], ['s_tarier', 2], ['s_linotte', 2], ['s_bruant', 1.5], ['alouette', 1.5]],
    soir: [['s_lulu', 2.5], ['s_tarier', 1], ['merle', 0.5]],
    nuit: [['s_engoulevent', 3], ['s_lulu', 0.6]],
  },
  hauteurs: {
    aube: [['s_plastron', 2.5], ['s_rougequeue', 2.5], ['s_spioncelle', 1.5]],
    jour: [['s_plastron', 2], ['s_spioncelle', 2], ['s_rougequeue', 1.5], ['s_buse', 0.9], ['s_crecerelle', 0.9], ['alouette', 0.5]],
    soir: [['s_plastron', 2], ['s_rougequeue', 1.5]],
    nuit: [],
  },
  lac: {
    aube: [['s_rossignol', 1.5], ['s_loriot', 2], ['s_turdoide', 1.5], ['s_effarvatte', 1.5], ['merle', 1], ['pinson', 0.8]],
    jour: [['s_loriot', 1.8], ['s_turdoide', 2], ['s_effarvatte', 2], ['s_hirondelle', 1.5], ['s_veloce', 1], ['s_fauvette', 1], ['s_rossignol', 0.6], ['merle', 0.5], ['pinson', 0.5]],
    soir: [['s_rossignol', 2], ['s_turdoide', 1.2], ['merle', 1.5], ['s_loriot', 0.8]],
    nuit: [['s_rossignol', 3]],
  },
  marais: {
    aube: [['s_effarvatte', 2.5], ['s_bruantroseaux', 2], ['s_rossignol', 1.5], ['s_troglodyte', 1.2]],
    jour: [['s_effarvatte', 2.5], ['s_bruantroseaux', 2], ['s_troglodyte', 1.2], ['s_turdoide', 0.8], ['s_rossignol', 0.8], ['merle', 0.3]],
    soir: [['s_rossignol', 2], ['s_effarvatte', 1.5], ['s_bruantroseaux', 0.8]],
    nuit: [['s_rossignol', 2.5]],
  },
  ville: {
    aube: [['s_rougequeue', 3], ['moineau', 2.5], ['merle', 2], ['s_rougegorge', 1.5]],
    jour: [['moineau', 3], ['s_martinet', 2], ['s_serin', 1.5], ['s_rougequeue', 1.8], ['tourterelle', 1.5], ['merle', 1], ['s_rougegorge', 0.8]],
    soir: [['s_martinet', 2.5], ['merle', 2], ['s_rougequeue', 1.5], ['moineau', 1]],
    nuit: [['s_petitduc', 3], ['s_cheveche', 0.5]],
  },
  ferme: {
    aube: [['s_coq', 1.2], ['s_rougequeue', 1.5], ['moineau', 2], ['merle', 2], ['s_hirondelle', 2], ['s_grive', 1]],
    jour: [['s_hirondelle', 2.5], ['moineau', 2.5], ['s_rougequeue', 1.2], ['tourterelle', 1.5], ['s_ramier', 0.8], ['merle', 1], ['s_fauvette', 0.8], ['s_grive', 0.8], ['mesange', 0.8], ['s_bruant', 0.6], ['s_coq', 0.25]],
    soir: [['merle', 2.5], ['s_hirondelle', 1.5], ['s_rougequeue', 1], ['s_grive', 1]],
    nuit: [['s_cheveche', 2.5], ['s_caille', 0.6], ['s_rossignol', 0.6]],
  },
};
// où chante chaque oiseau (par défaut : dans un arbre) : ciel (haut, en vol), loin (un rapace, très haut), sol (dans
// l'herbe), buisson (une haie, un genêt), passe (en vol, au-dessus), roseaux (au bord de l'eau), toit (en ville, à la
// ferme ; ailleurs : sur un rocher), ferme (une ferme voisine)
SoundEngine.PERCHOIR = {
  alouette: 'ciel', s_lulu: 'ciel', s_spioncelle: 'ciel', s_buse: 'loin', s_crecerelle: 'loin',
  s_caille: 'sol', s_rale: 'sol', s_engoulevent: 'sol', s_proyer: 'buisson', s_bruant: 'buisson', s_tarier: 'buisson', s_linotte: 'buisson',
  s_martinet: 'passe', s_hirondelle: 'passe', s_effarvatte: 'roseaux', s_turdoide: 'roseaux', s_bruantroseaux: 'roseaux',
  s_rougequeue: 'toit', s_serin: 'toit', moineau: 'toit', s_plastron: 'buisson', s_coq: 'ferme',
};
// la fréquence d'échantillonnage des tampons graves (moins de mémoire : le navigateur les relit par interpolation
// linéaire, ce qu'ils contiennent reste sous 0,3 × fs) ; les autres : 22 050 Hz
SoundEngine.SR_TAMPON = {
  s_ramier: 11025, s_chien: 11025, s_moyenduc: 11025, s_petitduc: 11025, s_tronc: 11025, s_cloche: 11025, s_charrette: 11025, s_bourdons: 11025,
  s_coq: 16000, s_cheveche: 16000, s_caillou: 16000, s_sonnailles: 16000, s_engoulevent: 16000, s_turdoide: 16000, s_loriot: 16000, s_poisson: 16000,
};
// la pluie de chaque milieu
SoundEngine.PLUIE_MILIEU = { plaine: 's_pl_herbe', ferme: 's_pl_paille', ville: 's_pl_toits', lande: 's_pl_bruyere', hauteurs: 's_pl_bruyere', foret: 's_pl_feuilles', bouleaux: 's_pl_feuilles', marais: 's_pl_eau', lac: 's_pl_eau' };
// les nappes de chaque milieu : niveau (0..1) selon le moment et le temps (Q, voir _sContexte)
SoundEngine.NAPPES_MILIEU = {
  plaine: (Q) => ({ s_criquets: 0.9 * Q.insJour, s_oecanthe: 0.8 * Q.insNuit, s_sauterelle: 0.55 * Q.insSoir }),
  ferme: (Q) => ({ s_criquets: 0.35 * Q.insJour, s_oecanthe: 0.45 * Q.insNuit, s_sauterelle: 0.3 * Q.insSoir, s_accoucheur: 0.7 * Q.batNuit }),
  ville: (Q) => ({ s_accoucheur: 0.55 * Q.batNuit }),
  lande: (Q) => ({ s_bruyere: Q.ventBas, s_criquets: 0.7 * Q.insJour, s_oecanthe: 0.5 * Q.insNuit, s_sauterelle: 0.6 * Q.insSoir }),
  hauteurs: (Q) => ({ s_cimes: Q.ventHaut, s_criquets: 0.25 * Q.insJour }),
  foret: (Q) => ({ s_pins: Q.ventBois, s_feuillus: 0.55 * Q.ventBois }),
  bouleaux: (Q) => ({ s_bouleaux: Q.ventBois, s_feuillus: 0.3 * Q.ventBois, s_oecanthe: 0.2 * Q.insNuit }),
  marais: (Q) => ({ s_roseaux: Q.ventBas, s_grenouilles: Q.grenJour, s_rainettes: Q.grenNuit, s_accoucheur: 0.35 * Q.batNuit }),
  lac: (Q) => ({ s_ressac: Q.ressac, s_rainettes: 0.55 * Q.grenNuit, s_grenouilles: 0.35 * Q.grenJour, s_accoucheur: 0.45 * Q.batNuit, s_roseaux: 0.35 * Q.ventBas }),
};
// les bruits rares de chaque milieu : [nom, poids(Q)] (voir _sBruit)
SoundEngine.BRUITS_MILIEU = {
  plaine: [['bourdon', (Q) => 0.7 * Q.insJour], ['chien', (Q) => 0.2 * Q.sec], ['coq', (Q) => 0.25 * Q.aube]],
  ferme: [['poule', (Q) => 2 * Q.jour * Q.sec], ['oie', (Q) => 0.5 * Q.jour], ['vache', (Q) => 0.6 * Q.jour + 0.15 * Q.nuit], ['coq', (Q) => 1.5 * Q.aube + 0.2 * Q.jour], ['chien', (Q) => 0.35], ['bourdon', (Q) => 0.5 * Q.insJour]],
  ville: [['charrette', (Q) => 0.7 * Q.jour], ['chien', (Q) => 0.5], ['pigeons', (Q) => 0.8 * Q.jour * Q.sec]],
  foret: [['brindille', (Q) => 0.6 + 0.4 * Q.nuit], ['tronc', (Q) => 0.6 * Q.vent]],
  bouleaux: [['brindille', (Q) => 0.5], ['tronc', (Q) => 0.3 * Q.vent]],
  lande: [['gousse', (Q) => 1.4 * Q.insJour * (0.3 + Q.chaud)], ['bourdon', (Q) => 0.8 * Q.insJour], ['sonnailles', (Q) => 0.35 * Q.jour]],
  hauteurs: [['sonnailles', (Q) => 1.2 * Q.jour], ['caillou', (Q) => 0.4]],
  lac: [['poisson', (Q) => 1 + 0.5 * Q.soir], ['canard', (Q) => 0.5 * Q.jour]],
  marais: [['bulles', (Q) => 0.6], ['poisson', (Q) => 0.3]],
};

{
  const R = Math.random, rf = (a, b) => a + R() * (b - a);
  // une bosse : 0 avant a, monte jusqu'à b, 1 jusqu'à c, redescend jusqu'à d
  const bosse = (x, a, b, c, d) => x <= a || x >= d ? 0 : x < b ? (x - a) / (b - a) : x <= c ? 1 : (d - x) / (d - c);
  const lisse = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  // tirer au sort dans une liste [[clé, poids]…]
  const tirer = (T) => {
    let tot = 0;
    for (const [, p] of T) tot += Math.max(0, p);
    if (!(tot > 0)) return null;
    let r = R() * tot;
    for (const [k, p] of T) { r -= Math.max(0, p); if (r <= 0) return k; }
    return T[T.length - 1][0];
  };
  // tirer un milieu d'après les poids (le milieu dominant un peu favorisé)
  const tirerMilieu = (P) => tirer(Object.keys(P).map((b) => [b, Math.pow(P[b], 1.5)]));

  // les chanteurs d'origine de SoundEngine.OISEAUX (déjà répartis dans CHANTEURS)
  const OISEAUX_ORIGINE = new Set(['merle', 'mesange', 'pinson', 'pic', 'tourterelle', 'coucou', 'alouette', 'moineau']);
  // le tampon de chaque bruit rare (pour le calculer d'avance)
  const BRUIT_TAMPON = { coq: 's_coq', chien: 's_chien', bourdon: 's_bourdons', charrette: 's_charrette', sonnailles: 's_sonnailles', caillou: 's_caillou', brindille: 's_brindille', tronc: 's_tronc', gousse: 's_gousse', poisson: 's_poisson', pigeons: 'tourterelle' };
  const _scene0 = SoundEngine.prototype._scene, _chanteur0 = SoundEngine.prototype._chanteur, _pluie0 = SoundEngine.prototype._pluie;
  const _source0 = SoundEngine.prototype.source, _oiseau0 = SoundEngine.prototype.oiseau, _tb0 = SoundEngine.prototype.tb;
  const _grillons0 = SoundEngine.prototype._grillons, _frog0 = SoundEngine.prototype.frog;
  // une nuit noire (le calendrier : ni lune ni étoiles) : la nature se tait
  const nuitNoire = (eng) => { const Q = eng._sZ && eng._sZ.Q; return !!(Q && Q.noire > 0.3 && Q.nuit > 0.3); };
  // un tampon à sa fréquence d'échantillonnage (SoundEngine.SR_TAMPON : les sons graves se contentent de moins)
  const tbS = (eng, nom, n, iv) => {
    const arr = eng._bufs[nom], neuf = iv === undefined || !arr || !arr[iv];
    const sr = SoundEngine.SR_TAMPON[nom], s0 = SoundEngine.SR_SYNTH;
    if (sr) SoundEngine.SR_SYNTH = sr;
    let b;
    try { b = _tb0.call(eng, nom, n, iv); } finally { SoundEngine.SR_SYNTH = s0; }
    return neuf && nom.startsWith('s_') ? rogner(eng, nom, b) : b;
  };
  // un chant qui finit avant la fin de son tampon : on rogne le silence (moins de mémoire, et la place 3D se libère plus
  // tôt) ; le jeu garde la variante rognée
  const rogner = (eng, nom, b) => {
    const d = b.getChannelData(0), n = d.length;
    let pk = 0;
    for (let i = 0; i < n; i++) { const v = d[i] < 0 ? -d[i] : d[i]; if (v > pk) pk = v; }
    const seuil = pk * 0.0015;
    let fin = n - 1;
    while (fin > 0 && (d[fin] < 0 ? -d[fin] : d[fin]) < seuil) fin--;
    const len = Math.min(n, fin + Math.floor(b.sampleRate * 0.08));
    if (n - len < b.sampleRate * 0.25) return b;
    const c = eng.ctx.createBuffer(1, len, b.sampleRate), e = c.getChannelData(0), fo = Math.min(len >> 2, Math.floor(b.sampleRate * 0.05));
    e.set(d.subarray(0, len));
    for (let k = 0; k < fo; k++) e[len - 1 - k] *= k / fo;
    const arr = eng._bufs[nom];
    if (arr) { const i = arr.indexOf(b); if (i >= 0) arr[i] = c; }
    return c;
  };

  Object.assign(SoundEngine.prototype, {
    // ---------------------------------------------------------------- chaque dixième de seconde (après la scène d'origine)
    _scene(dt, E, S) {
      _scene0.call(this, dt, E, S);
      try { this._sScene(dt, E, S); } catch (e) { if (!this._sErr) { this._sErr = true; console.error('son (milieux)', e); } }
    },
    _sScene(dt, E, S) {
      const G = typeof game !== 'undefined' ? game : null, w = G && G.world, p = G && G.player;
      if (!w || !p || !this.ctx) return;
      const now = this.ctx.currentTime, L = this.L, Bi = this.bio || {};
      const Z = this._sZ || (this._sZ = { P: null, poidsT: 0, napT: 0, nuitT: 6, evT: 10, nchant: null, heure: -1, egout: 0, pluieVue: 0, prog: [], journal: [], coqJour: -1 });
      const ferme = G.kind === 'farm', monde = typeof mondes !== 'undefined' && mondes.cur;
      const under = !!(p.underground || (ferme && Bi.under)), inside = !!E.inside && !under, dehors = !inside && !under;
      const quiet = !(E.day > 0) && !(E.night > 0);
      const actif = typeof ambiance !== 'undefined' && ambiance.actif !== false && ferme && !monde && !quiet && !under && !Bi.envers && !Bi.red;
      // ---- les milieux autour de soi : des poids qui glissent (fondu de quelques secondes)
      Z.poidsT -= dt;
      if (Z.poidsT <= 0) {
        const pas = 0.5 - Z.poidsT;
        Z.poidsT = 0.5;
        const C = this._sCible(w, L.x, L.z);
        const saut = !Z.P || !Z.last || Math.hypot(L.x - Z.last[0], L.z - Z.last[1]) > 120;
        if (saut) Z.P = Object.assign({}, C);
        else { const a = 1 - Math.exp(-pas / 3.5); for (const b of BIOMES) Z.P[b] += ((C[b] || 0) - Z.P[b]) * a; }
        Z.last = [L.x, L.z];
        this._sP = Z.P;
        // ce qu'il faudra bientôt : calculé en tâche de fond, le milieu dominant d'abord
        if (actif) this._sPreparer(Z.P);
      }
      const P = Z.P;
      if (!P) return;
      const Q = this._sContexte(E, Z, dt);
      // ---- les nappes (quatre fois par seconde)
      Z.napT -= dt;
      if (Z.napT <= 0) { Z.napT = 0.25; this._sNappes(actif, P, Q, inside, dehors, now); }
      // ---- la nuit : ses chanteurs, chacun reprenant sa phrase de la même place, puis un long silence ; avant le lever
      //      du soleil, le chœur de l'aube commence dans le noir (le jour d'origine ne chante qu'une fois le soleil levé)
      Z.nuitT -= dt;
      if (Z.nuitT <= 0) {
        const avantJour = Q.h >= 4.3 && Q.h < 6.5 && Q.jour <= 0.25;
        const peut = actif && dehors && (Q.nuit > 0.35 || avantJour) && Q.pluie < 0.35 && Q.neige < 0.3 && Q.orage < 0.3 && Q.noire < 0.3, C = Z.nchant;
        if (peut && C && C.reste > 0) { C.reste--; this.oiseau(C.sorte, C.pos, C.k); Z.nuitT = C.pause * rf(0.85, 1.3); }
        else {
          Z.nchant = null;
          Z.nuitT = (avantJour ? rf(8, 22) : rf(16, 45) / Math.max(0.4, Q.nuit)) * (Q.brouillard > 0.5 ? 1.6 : 1);
          if (peut) {
            if ((this.oiseauxFin || 0) > now + 0.3) Z.nuitT = rf(2, 5);
            else {
              const m = tirerMilieu(P), T = (SoundEngine.CHANTEURS[m] || {})[avantJour ? 'aube' : 'nuit'], sorte = T && T.length ? tirer(T) : null;
              if (sorte) {
                const pos = this._sPerche(sorte, m), Ph = SoundEngine.PHRASES[sorte] || [1, 2, 3];
                this.oiseau(sorte, pos, 1);
                Z.nchant = { sorte, pos, k: 1, reste: Ph[0] + ((R() * (Ph[1] - Ph[0] + 1)) | 0), pause: Ph[2] + (SoundEngine.TAMPONS[sorte] ? SoundEngine.TAMPONS[sorte][0] : 1.5) };
                Z.nuitT = Z.nchant.pause * rf(0.85, 1.3);
                this._sNote(sorte, m);
              }
            }
          }
        }
      }
      // ---- les bruits rares
      Z.evT -= dt;
      if (Z.evT <= 0) {
        Z.evT = rf(18, 50) * (Q.nuit > 0.5 ? 1.4 : 1) * (Q.brouillard > 0.5 ? 1.5 : 1);
        if (actif && dehors && Q.orage < 0.5 && Q.neige < 0.5 && !(Q.noire > 0.3 && Q.nuit > 0.3)) {
          const m = tirerMilieu(P), T = SoundEngine.BRUITS_MILIEU[m];
          if (T) { const nom = tirer(T.map(([k, f]) => [k, f(Q)])); if (nom) { this._sBruit(nom, m, Q); this._sNote(nom, m); } }
        }
      }
      // ---- l'angélus (7 h, midi, 19 h), et le coq à l'aube
      const h = Q.h;
      if (actif && Z.heure >= 0 && h > Z.heure && h - Z.heure < 1) {
        for (const H of [7, 12, 19]) if (Z.heure < H && h >= H) this._sAngelus(inside);
        if (Z.heure < 5.2 && h >= 5.2 && (P.ferme || 0) > 0.12 && dehors) for (let k = 0, n = 2 + ((R() * 3) | 0); k < n; k++) Z.prog.push({ t: now + rf(0, 45) + k * 12, f: () => this._sBruit('coq', 'ferme', Q) });
      }
      Z.heure = h;
      // ---- ce qui a été programmé (rarement plus de trois choses)
      if (Z.prog.length) { const prets = Z.prog.filter((x) => x.t <= now); if (prets.length) { Z.prog = Z.prog.filter((x) => x.t > now); for (const x of prets) if (actif) try { x.f(); } catch (e) { /* rien */ } } }
      this._sNappesTick(now);
    },

    // ---------------------------------------------------------------- les poids des milieux (cible) autour de (x, z)
    _sCible(w, x, z) {
      const C = {};
      for (const b of BIOMES) C[b] = 0;
      const F = typeof ambiance !== 'undefined' && ambiance.force;
      if (F) { let t = 0; for (const b in F) if (C[b] !== undefined) { C[b] = F[b]; t += F[b]; } if (t > 0) { for (const b in C) C[b] /= t; this._sGL = 1; return C; } }
      if (!w.biome) { C.plaine = 1; return C; }
      const BW = w.biomeW, at = (u, v) => BIOMES[w.biome[clamp(Math.floor(v / 8), 0, BW - 1) * BW + clamp(Math.floor(u / 8), 0, BW - 1)]] || 'plaine';
      // la grille : ici (3), à 14 m (8 × 1), à 30 m (8 × 0,5)
      C[at(x, z)] += 3;
      for (let k = 0; k < 8; k++) {
        const a = k * Math.PI / 4;
        C[at(x + Math.cos(a) * 14, z + Math.sin(a) * 14)] += 1;
        C[at(x + Math.cos(a + 0.39) * 30, z + Math.sin(a + 0.39) * 30)] += 0.5;
      }
      // les mares du marais (la grille ne les connaît pas toujours), la rive des lacs et des étangs
      let mar = 0, lac = 0, grand = 0;
      for (const l of w.lakes || []) {
        if (l.kind === 'riviere') continue;
        const d = Math.hypot(l.x - x, l.z - z) - (l.r || 0);
        if (l.kind === 'marais') { if (d < 70) mar = Math.max(mar, clamp(1 - (d - 20) / 50, 0, 1)); }
        else if (d < 60) {
          const k = clamp(1 - (d - 8) / 52, 0, 1);
          lac = Math.max(lac, k * (l.kind === 'lac_noir' ? 0.5 : 1));
          if (!l.kind) grand = Math.max(grand, k); // (un grand lac : le ressac ; ni les étangs, ni le lac Noir, qui ne bouge pas)
        }
      }
      this._sGL = grand;
      const lm = w.lm || {}, LM = lm.marais;
      if (LM) mar = Math.max(mar, clamp(1 - (Math.hypot(LM.x - x, LM.z - z) - (LM.r || 30)) / 40, 0, 1));
      if (mar) C.marais += 14 * mar;
      if (lac) C.lac += 10 * lac;
      // les abords de la ville (ses bruits passent les murs) ; les hameaux (une basse-cour)
      const T = w.townInfo;
      if (T) { const d = Math.max(Math.abs(x - T.x), Math.abs(z - T.z)); if (d > 50 && d < 140) C.ville += 6 * clamp(1 - (d - 56) / 84, 0, 1); }
      for (const k of ['hameau', 'ranch']) { const H = lm[k]; if (!H) continue; const r = H.r || 20, d = Math.hypot(H.x - x, H.z - z); if (d < r + 45) C.ferme += 9 * clamp(1 - (d - r) / 45, 0, 1); }
      let t = 0;
      for (const b in C) t += C[b];
      for (const b in C) C[b] /= t || 1;
      return C;
    },

    // ---------------------------------------------------------------- le moment et le temps qu'il fait
    _sContexte(E, Z, dt) {
      const Q = Z.Q || (Z.Q = {}), M = typeof weather !== 'undefined' ? weather.cur : {}, h = this._heure();
      const jour = clamp(E.day || 0, 0, 1), nuit = clamp(E.night || 0, 0, 1), pluie = clamp(E.rain || 0, 0, 1);
      const neige = typeof vallee !== 'undefined' ? clamp((vallee.snowK || 0) * 1.6, 0, 1) : 0;
      const brouillard = clamp(M.fog || 0, 0, 1), gel = clamp(M.frost || 0, 0, 1), chaud = clamp(M.heat || 0, 0, 1), orage = clamp(M.storm || 0, 0, 1), nuages = clamp(M.cloud || 0, 0, 1);
      const vent = clamp((M.storm || 0) * 0.8 + (M.rain || 0) * 0.22 + nuages * 0.1 - brouillard * 0.15, 0, 1);
      // la neige restée au sol (les jours de grand froid) garde les insectes muets ; les nuits noires, la nature se tait
      const fs = typeof farm !== 'undefined' && farm.s, sol = fs && fs.ev && typeof fs.ev.neigeSol === 'number' ? fs.ev.neigeSol : 0;
      const noire = typeof evenements !== 'undefined' ? clamp(evenements.noirK || 0, 0, 1) : 0;
      const sec = 1 - lisse(0.1, 0.45, pluie), froid = Math.max(gel, neige, 0.8 * sol), raf = clamp(this.sc && this.sc.vg !== undefined ? this.sc.vg : 0.4, 0, 1);
      // (la pluie qui vient de finir : les grenouilles chantent plus, les arbres s'égouttent)
      if (pluie > 0.3) Z.pluieVue = 1; else Z.pluieVue = Math.max(0, Z.pluieVue - dt / 240);
      const hs = h < 12 ? h + 24 : h; // les heures du soir et de la nuit, d'un seul tenant
      Object.assign(Q, {
        h, jour, nuit, pluie, neige, brouillard, gel, chaud, orage, vent, sec, noire,
        aube: bosse(h, 4.5, 5.3, 7.2, 8.5), soir: bosse(h, 17.2, 18.2, 20.3, 21.5),
        insJour: jour * sec * (1 - froid) * (1 - 0.6 * nuages) * (0.75 + 0.5 * chaud) * bosse(h, 8.3, 10.5, 17.5, 19.6),
        insNuit: nuit * sec * (1 - froid) * (1 - orage) * (1 - noire) * bosse(hs, 20, 21.5, 27.5, 29.3),
        insSoir: sec * (1 - froid) * (1 - noire) * bosse(hs, 18.6, 20, 23.5, 25.5),
        grenJour: (0.35 * jour + 0.65 * bosse(h, 16.5, 18.5, 20.5, 21.5)) * (1 - froid) * (1 - lisse(0.6, 0.9, pluie)) * (1 + 0.3 * Z.pluieVue),
        grenNuit: nuit * (1 - froid) * (1 - noire) * (1 - lisse(0.6, 0.9, pluie)) * (1 + 0.3 * Z.pluieVue),
        batNuit: nuit * (1 - froid) * (1 - noire) * (1 - lisse(0.5, 0.85, pluie)),
        // (le vent dans les arbres, les roseaux, la bruyère suit les bouffées du vent : sc.vg, 0..1)
        ventBois: (0.35 + 0.9 * vent) * (1 - 0.5 * neige) * (0.75 + 0.4 * raf), ventBas: (0.3 + 0.8 * vent) * (0.75 + 0.4 * raf), ventHaut: (0.35 + 0.8 * vent) * (0.8 + 0.3 * raf), ressac: (0.45 + 0.8 * vent) * clamp(this._sGL === undefined ? 1 : this._sGL * 1.5, 0, 1),
        egout: Z.pluieVue * (1 - lisse(0.05, 0.3, pluie)),
      });
      return Q;
    },

    // ---------------------------------------------------------------- les nappes
    _sNappes(actif, P, Q, inside, dehors, now) {
      const lev = {};
      const add = (k, v) => { if (v > 0) lev[k] = (lev[k] || 0) + v; };
      if (actif) {
        for (const b of BIOMES) {
          const pb = P[b];
          if (!(pb > 0.01)) continue;
          const f = SoundEngine.NAPPES_MILIEU[b];
          if (f) { const o = f(Q); for (const k in o) add(k, pb * o[k]); }
          // la pluie du milieu
          if (Q.pluie > 0.02) add(SoundEngine.PLUIE_MILIEU[b], pb * Math.pow(Q.pluie, 1.3));
          // les arbres qui s'égouttent après l'averse
          if ((b === 'foret' || b === 'bouleaux') && Q.egout > 0.01) add('s_egouttement', pb * Q.egout);
        }
      }
      // dehors : tel quel (le brouillard étouffe, la neige plus encore) ; dedans : la pluie sur le toit, le reste lointain
      let lp = 20000, kDehors = 1;
      if (Q.brouillard > 0.2) lp = 2600 + 9000 * (1 - Q.brouillard);
      if (Q.neige > 0.2) lp = Math.min(lp, 1800);
      if (inside) { kDehors = 0.22; lp = 750; }
      const pl = actif ? Math.pow(Q.pluie, 1.3) : 0;
      if (inside && pl > 0.01) lev.s_pl_dedans = pl;
      // le lit de pluie d'origine cède la place à la pluie du milieu (le total ne monte pas) ; les gouttes autour aussi
      this._sPluieGen = pl > 0.01 ? 1 - 0.5 * clamp(pl * 3, 0, 1) : 1;
      this._sGouttes = actif ? 0.7 : 1;
      // (le ressac remplace en partie le clapotis de la rive : l'eau ne doit pas monter)
      this._sClapotis = actif && (lev.s_ressac || 0) > 0.05 ? 0.65 : 1;
      for (const k in lev) this._sNappe('n_' + k, k, lev[k] * (k === 's_pl_dedans' ? 1 : kDehors), { lp: k === 's_pl_dedans' ? 20000 : lp });
      // les nappes qui ne sont plus demandées s'éteignent (en fondu)
      if (this._sN) for (const [cle, x] of this._sN) if (!(x.type in lev)) this._sNappe(cle, x.type, 0, {});
    },
    // une nappe diffuse : deux lectures décalées du même tampon (gauche, droite) → filtre → gain → bus d'ambiance
    _sNappe(cle, type, k, o) {
      const M = this._sN || (this._sN = new Map()), now = this.ctx.currentTime;
      let x = M.get(cle);
      if (!x) {
        if (!(k > 0.003)) return null;
        if (!this._bufs['B_' + type]) { this._sDemander('B:' + type); return null; } // pas encore prêt : il se calcule en tâche de fond
        x = this._sNappeNew(type);
        M.set(cle, x);
      }
      x.vu = now; x.niv = k;
      const cible = Math.max(0, k) * (SoundEngine.VOL_BOUCLES[type] || 0.04);
      if (x.cible === undefined || Math.abs(cible - x.cible) > Math.max(0.0002, x.cible * 0.04)) { x.cible = cible; x.g.gain.setTargetAtTime(cible, now, 1.6); }
      const lp = o.lp || 20000;
      if (x.lp !== lp) { x.lp = lp; x.f.frequency.setTargetAtTime(this.nyq(lp), now, 0.6); }
      return x;
    },
    _sNappeNew(type) {
      const c = this.ctx, b = this.boucleTampon(type), now = c.currentTime, D = b.duration;
      const lire = (rate, off) => { const s = c.createBufferSource(); s.buffer = b; s.loop = true; s.playbackRate.value = rate; s.start(now + 0.03, off % D); return s; };
      const o0 = R() * D, a = lire(1, o0), bb = lire(0.985 + R() * 0.01, o0 + D * (0.35 + R() * 0.3));
      const m = c.createChannelMerger(2), f = c.createBiquadFilter(), g = c.createGain();
      f.type = 'lowpass'; f.frequency.value = this.nyq(20000); f.Q.value = 0.5;
      g.gain.value = 0;
      a.connect(m, 0, 0); bb.connect(m, 0, 1); m.connect(f).connect(g).connect(this.B.amb.inp);
      return { type, a, b: bb, m, f, g, vu: now, niv: 0, lp: 20000 };
    },
    _sNappesTick(now) {
      if (!this._sN) return;
      for (const [cle, x] of this._sN) {
        let fin = now - x.vu > 1.6;
        if (!fin) { if (x.niv <= 0.003) { x.zero = x.zero || now; fin = now - x.zero > 6; } else x.zero = 0; }
        if (!fin) continue;
        this._sN.delete(cle);
        x.g.gain.cancelScheduledValues(now); x.g.gain.setTargetAtTime(0, now, 0.5);
        try { x.a.stop(now + 3); x.b.stop(now + 3); } catch (e) { /* déjà */ }
        setTimeout(() => { try { x.g.disconnect(); } catch (e) { /* rien */ } }, 3500);
      }
    },
    // tout couper (changement de partie)
    sNappesStop() { if (!this._sN || !this.ctx) return; for (const x of this._sN.values()) x.vu = -1e9; this._sNappesTick(this.ctx.currentTime); },

    // ---------------------------------------------------------------- les chanteurs du jour (le moteur d'origine les cadence)
    _chanteur(biome, S, k) {
      const P = this._sP;
      if (typeof ambiance === 'undefined' || ambiance.actif === false || !P) return _chanteur0.call(this, biome, S, k);
      const h = this._heure(), moment = h >= 4.5 && h < 8.5 ? 'aube' : h >= 17 && h < 22 ? 'soir' : 'jour';
      const M = typeof weather !== 'undefined' ? weather.cur : {};
      // (le brouillard : un chanteur sur deux se tait ; la canicule, l'après-midi : les oiseaux aussi)
      if ((M.fog > 0.5 && R() < 0.5) || (M.heat > 0.5 && h > 12.5 && h < 16.5 && R() < 0.5)) return null;
      // (sous la neige, les oiseaux se taisent)
      if (this._sZ && this._sZ.Q && this._sZ.Q.neige > 0.3) return null;
      // un silence avant le suivant : le moteur d'origine enchaîne les chanteurs dès que l'un a fini ses reprises ; ici,
      // six fois sur dix (trois à l'aube) on se tait, et le moteur attend son long silence (13 à 33 s) — un ou deux
      // chanteurs par minute, pas un concert
      if (this._sVientDeChanter && R() < (moment === 'aube' ? 0.3 : 0.6)) { this._sVientDeChanter = false; return null; }
      this._sVientDeChanter = true;
      const m = tirerMilieu(P), C = SoundEngine.CHANTEURS[m] || SoundEngine.CHANTEURS.plaine;
      let T = C[moment] && C[moment].length ? C[moment] : C.jour;
      // (les chanteurs qu'un autre module aurait ajoutés à SoundEngine.OISEAUX[milieu] chantent aussi)
      const X = (SoundEngine.OISEAUX[m] || []).filter(([s]) => !OISEAUX_ORIGINE.has(s) && !T.some(([t]) => t === s));
      if (X.length) T = T.concat(X);
      const sorte = tirer(T);
      if (!sorte || !SoundEngine.TAMPONS[sorte]) return _chanteur0.call(this, biome, S, k);
      const pos = this._sPerche(sorte, m);
      this.oiseau(sorte, pos, k);
      this._sNote(sorte, m);
      const Ph = SoundEngine.PHRASES[sorte] || [1, 2, 3];
      return { sorte, pos, k, reste: Ph[0] + ((R() * (Ph[1] - Ph[0] + 1)) | 0), pause: Ph[2] + SoundEngine.TAMPONS[sorte][0] };
    },
    // la place d'un chanteur
    _sPerche(sorte, m) {
      const L = this.L, S = this.sc || {}, A = S.arbres || [];
      let place = SoundEngine.PERCHOIR[sorte] || 'arbre';
      if (place === 'toit' && m !== 'ville' && m !== 'ferme') place = 'buisson';
      const autour = (d0, d1, h0, h1, sol) => {
        const a = R() * TAU, d = rf(d0, d1), x = L.x + Math.cos(a) * d, z = L.z + Math.sin(a) * d;
        let y = L.y + rf(h0, h1);
        if (sol) { try { const w = game.world; y = Math.max(w.heightAt(x, z), w.waterLevel) + rf(h0, h1); } catch (e) { /* rien */ } }
        return [x, y, z];
      };
      switch (place) {
        case 'ciel': return autour(25, 60, 25, 45);
        case 'loin': return autour(60, 140, 40, 80);
        case 'sol': return autour(15, 55, 0.2, 0.5, true);
        case 'buisson': return autour(12, 40, 0.8, 2, true);
        case 'passe': return autour(5, 22, 8, 18);
        case 'toit': return autour(10, 35, 6, 11, true);
        case 'ferme': return autour(50, 130, 2, 4, true);
        case 'roseaux': { const q = this._presDeLEau && this._presDeLEau(); return q ? [q[0], q[1] + 1, q[2]] : autour(15, 40, 0.5, 1.5, true); }
        default: {
          const loin = A.filter((t) => Math.hypot(t[0] - L.x, t[2] - L.z) > 12);
          if (loin.length) return loin[(R() * loin.length) | 0];
          return autour(14, 39, 1, 4, true);
        }
      }
    },
    // un tampon : de préférence une variante déjà calculée (rien à calculer pendant le jeu)
    oiseau(sorte, pos, k, n) {
      if (sorte === 'chouette' && nuitNoire(this)) return; // (la hulotte aussi, les nuits noires)
      n = n || (SoundEngine.VARIANTES && SoundEngine.VARIANTES[sorte]) || undefined;
      this._sChoix = [sorte, this._sVariante(sorte, n || 5)];
      try { return _oiseau0.call(this, sorte, pos, k, n); } finally { this._sChoix = null; }
    },
    tb(nom, n, iv) {
      if (iv === undefined && this._sChoix && this._sChoix[0] === nom && this._sChoix[1] !== undefined) iv = this._sChoix[1];
      return tbS(this, nom, n, iv);
    },
    _sVariante(nom, n) {
      const arr = this._bufs[nom];
      if (!arr) { this._sDemander('T:' + nom); return undefined; }
      const prets = [];
      for (let i = 0; i < n; i++) if (arr[i]) prets.push(i);
      if (prets.length < n) this._sDemander('T:' + nom);
      return prets.length ? prets[(R() * prets.length) | 0] : undefined;
    },
    // un bruit d'ambiance qui vient de pos (comme un chant, sans faire attendre les oiseaux)
    _sJoue(sorte, pos, k, o) {
      if (!this.ok || !SoundEngine.TAMPONS[sorte]) return;
      o = o || {};
      const n = (SoundEngine.VARIANTES && SoundEngine.VARIANTES[sorte]) || 4, iv = this._sVariante(sorte, n);
      const b = this.tb(sorte, n, iv), out = pos ? this.en3d(pos, this.B.amb.inp, { ref: o.ref || 7, roll: o.roll === undefined ? 0.9 : o.roll, dur: b.duration + 0.2 }) : this.amb;
      this.jouer(b, this.at(o.delai || 0.01), (SoundEngine.VOL_OISEAUX[sorte] || 0.05) * (k === undefined ? 1 : k) * (0.85 + R() * 0.3), out, o.rate || (0.95 + R() * 0.1));
    },
    _sLoin(d0, d1, h) {
      const L = this.L, a = R() * TAU, d = rf(d0, d1), x = L.x + Math.cos(a) * d, z = L.z + Math.sin(a) * d;
      let y = L.y + (h || 0);
      try { const w = game.world; y = Math.max(w.heightAt(x, z), w.waterLevel) + (h || 0); } catch (e) { /* rien */ }
      return [x, y, z];
    },
    // ---------------------------------------------------------------- les bruits rares
    _sBruit(nom, m, Q) {
      switch (nom) {
        case 'poule': this.animal('hen', this._sLoin(25, 60, 0.4), rf(0.45, 0.8)); return;
        case 'oie': this.animal('goose', this._sLoin(35, 80, 0.4), 0.5); return;
        case 'vache': this.animal('cow', this._sLoin(60, 140, 1), rf(0.6, 0.9)); return;
        case 'canard': this.animal('duck', this._sLoin(30, 70, 0), 0.45); return;
        case 'coq': this._sJoue('s_coq', this._sLoin(50, 140, 2), 1, { ref: 14 }); return;
        case 'chien': this._sJoue('s_chien', this._sLoin(120, 300, 1), 1, { ref: 30, roll: 1 }); return;
        case 'bourdon': this._sJoue('s_bourdons', this._sLoin(1.5, 3.5, 0.6), 1, { ref: 2 }); return;
        case 'charrette': this._sJoue('s_charrette', this._sLoin(25, 60, 0.5), 1, { ref: 10 }); return;
        case 'sonnailles': this._sJoue('s_sonnailles', this._sLoin(70, 200, 0.5), 1, { ref: 30, roll: 1 }); return;
        case 'caillou': this._sJoue('s_caillou', this._sLoin(60, 160, 8), 1, { ref: 25, roll: 1 }); return;
        case 'brindille': this._sJoue('s_brindille', this._sLoin(10, 28, 0.2), 1, { ref: 6 }); return;
        case 'tronc': this._sJoue('s_tronc', this._sLoin(12, 30, 4), 1, { ref: 8 }); return;
        case 'gousse': this._sJoue('s_gousse', this._sLoin(4, 14, 0.3), 1, { ref: 4 }); return;
        case 'poisson': { const q = this._presDeLEau && this._presDeLEau(); this._sJoue('s_poisson', q ? [q[0] + rf(-12, 12), q[1], q[2] + rf(-12, 12)] : this._sLoin(20, 50, 0), 1, { ref: 8 }); return; }
        case 'bulles': { const q = this._presDeLEau && this._presDeLEau(); if (q) this.ici(q, () => this.bubble(), SoundEngine.LOIN); return; }
        case 'pigeons': this.oiseau('tourterelle', this._sLoin(12, 30, 9), 0.8); return;
      }
    },
    // l'angélus : trois tintements, trois fois, puis la volée ; du clocher (on l'entend jusqu'à un kilomètre, assourdi)
    _sAngelus(inside) {
      const P = this.clocher && this.clocher(), L = this.L;
      if (!P || !this.ok || !SoundEngine.TAMPONS.s_cloche) return;
      const d = Math.hypot(P[0] - L.x, P[2] - L.z);
      if (d > 1100) return;
      const out = this.emit(P, this.B.amb.inp, { att: 'phys', ref: 45, roll: 1, dur: 48 }), t0 = this.at(0.05), v = 0.1 * (inside ? 0.4 : 1);
      const T = [0, 2.6, 5.2, 10.4, 13, 15.6, 20.8, 23.4, 26];
      for (let i = 0; i < 8; i++) T.push(31 + i * 1.9);
      T.forEach((t, i) => { const iv = i >= 9 && i % 2 ? 1 : 0; this.jouer(this.tb('s_cloche', 2, iv), t0 + t, v * (i >= 9 ? 0.8 : 1), out, 1); });
      this._sNote('angelus', 'ville');
    },
    _sNote(quoi, m) {
      const Z = this._sZ;
      if (!Z) return;
      Z.journal.push([+(this.ctx ? this.ctx.currentTime : 0).toFixed(1), quoi, m]);
      if (Z.journal.length > 60) Z.journal.splice(0, Z.journal.length - 60);
    },

    // ---------------------------------------------------------------- tâche de fond : les tampons du milieu où l'on est
    _sPreparer(P) {
      const liste = [], ajoute = (k) => { if (!liste.includes(k)) liste.push(k); };
      const ordre = Object.keys(P).filter((b) => P[b] > 0.02).sort((a, b) => P[b] - P[a]);
      // d'abord les nappes de tous les milieux d'ici (on sent le lieu), puis leurs pluies, puis les chanteurs (ceux du
      // moment d'abord)
      for (const b of ordre) { const f = SoundEngine.NAPPES_MILIEU[b]; if (f) for (const k in f({})) ajoute('B:' + k); }
      for (const b of ordre) ajoute('B:' + SoundEngine.PLUIE_MILIEU[b]);
      const h = this._heure(), maint = h >= 4.3 && h < 8.5 ? 'aube' : h >= 17 && h < 22 ? 'soir' : h >= 22 || h < 4.3 ? 'nuit' : 'jour';
      for (const mo of [maint, 'aube', 'jour', 'soir', 'nuit']) for (const b of ordre) for (const [s] of (SoundEngine.CHANTEURS[b] || {})[mo] || []) if (SoundEngine.TAMPONS[s]) ajoute('T:' + s);
      // les bruits rares des milieux d'ici, l'angélus
      for (const b of ordre) for (const [nom] of SoundEngine.BRUITS_MILIEU[b] || []) { const t = BRUIT_TAMPON[nom]; if (t) ajoute('T:' + t); }
      ajoute('T:s_cloche');
      if (P.foret > 0.02 || P.bouleaux > 0.02) ajoute('B:s_egouttement');
      ajoute('B:s_pl_dedans');
      // (l'ordre est refait à chaque fois : ce qui sert là où l'on est passe devant)
      this._sOrdre = liste.filter((k) => !this._sPret(k));
      if (this._sOrdre.length) this._sLancer();
      // ce qui n'a servi à rien depuis cinq minutes est libéré (on le recalculera si l'on revient) : la mémoire ne garde
      // que les milieux de la promenade en cours
      const now = this.ctx ? this.ctx.currentTime : 0, V = this._sVu || (this._sVu = new Map());
      for (const k of liste) V.set(k, now);
      if (now - (this._sMenageT || 0) > 30) {
        this._sMenageT = now;
        for (const [k, t] of V) {
          if (now - t < 300) continue;
          V.delete(k);
          const nom = k.slice(2);
          if (k[0] === 'B') delete this._bufs['B_' + nom]; else if (nom.startsWith('s_')) delete this._bufs[nom];
        }
      }
    },
    _sPret(k) {
      const nom = k.slice(2);
      if (this._sRate && this._sRate.has(k)) return true; // (un calcul qui a échoué : on n'y revient pas)
      if (k[0] === 'B') return !SoundEngine.BOUCLES[nom] || !!this._bufs['B_' + nom];
      if (!SoundEngine.TAMPONS[nom]) return true;
      const arr = this._bufs[nom], n = (SoundEngine.VARIANTES && SoundEngine.VARIANTES[nom]) || 5;
      if (!arr) return false;
      for (let i = 0; i < n; i++) if (!arr[i]) return false;
      return true;
    },
    _sDemander(k) {
      if (!this.ctx || this._sPret(k)) return;
      (this._sFile || (this._sFile = new Set())).add(k);
      this._sLancer();
    },
    // la prochaine chose à calculer : d'abord ce qui sert ici, puis ce qu'on a demandé en passant
    _sProchain() {
      const O = this._sOrdre;
      while (O && O.length) { if (this._sPret(O[0])) O.shift(); else return O[0]; }
      const F = this._sFile;
      if (F) for (const k of F) { if (this._sPret(k)) F.delete(k); else return k; }
      return null;
    },
    _sLancer() {
      if (this._sIdle || !this.ctx) return;
      this._sIdle = true;
      const ric = typeof requestIdleCallback === 'function' ? (f) => requestIdleCallback(f, { timeout: 1200 }) : (f) => setTimeout(() => f(null), 60);
      const tour = (dl) => {
        let k = null;
        try {
          let n = 0;
          // (une chose au moins à chaque tour ; d'autres tant que le navigateur a du temps devant lui)
          while ((k = this._sProchain()) && (n === 0 || (dl && dl.timeRemaining() > 12))) { this._sFaire(k); n++; if (!dl) break; }
        } catch (e) {
          (this._sRate || (this._sRate = new Set())).add(k);
          if (!this._sErrP) { this._sErrP = true; console.error('son (tampons)', k, e); }
        }
        if (this._sProchain()) ric(tour); else this._sIdle = false;
      };
      ric(tour);
    },
    // calcule une boucle, ou la prochaine variante manquante d'un tampon
    _sFaire(k) {
      const nom = k.slice(2);
      if (k[0] === 'B') { if (SoundEngine.BOUCLES[nom]) this.boucleTampon(nom); return; }
      if (!SoundEngine.TAMPONS[nom]) return;
      const n = (SoundEngine.VARIANTES && SoundEngine.VARIANTES[nom]) || 5, arr = this._bufs[nom] || [];
      for (let i = 0; i < n; i++) if (!arr[i]) { tbS(this, nom, n, i); break; }
    },

    // ---------------------------------------------------------------- la pluie d'origine, les gouttes, le clapotis : réglés d'ici
    _pluie(dt, E, S, under, inside, now) {
      _pluie0.call(this, dt, E, S, under, inside, now);
      const pl = S.pl;
      if (!pl) return;
      if (!pl.sG) { const g = this.ctx.createGain(); g.gain.value = 1; try { pl.g.disconnect(); } catch (e) { /* rien */ } pl.g.connect(g).connect(this.B.amb.inp); pl.sG = g; pl.sK = 1; }
      const k = this._sPluieGen === undefined ? 1 : this._sPluieGen;
      if (Math.abs(pl.sK - k) > 0.02) { pl.sK = k; pl.sG.gain.setTargetAtTime(k, now, 1.2); }
    },
    // les grillons et les grenouilles d'origine se taisent aussi les nuits noires
    _grillons(S, k, p) { return _grillons0.call(this, S, nuitNoire(this) ? 0 : k, p); },
    frog(k) { if (nuitNoire(this)) return; return _frog0.call(this, k); },
    source(cle, type, pos, k, o) {
      if (type === 'gouttes' && this._sGouttes !== undefined) k *= this._sGouttes;
      else if (type === 'clapotis' && this._sClapotis !== undefined) k *= this._sClapotis;
      return _source0.call(this, cle, type, pos, k, o);
    },
  });
}

// une partie chargée : les nappes s'éteignent, les poids repartent de là où l'on est
if (typeof HOOKS !== 'undefined' && HOOKS.load) HOOKS.load.push(() => { try { sound.sNappesStop(); sound._sZ = null; sound._sP = null; } catch (e) { /* rien */ } });

// ---------------------------------------------------------------- l'API (tests, rendus)
const ambiance = {
  actif: true,
  force: null,
  // forcer les milieux (tests, rendus) : ambiance.forcer('foret'), ambiance.forcer({ foret: 0.5, plaine: 0.5 }), ambiance.forcer(null)
  forcer(m) { this.force = m ? (typeof m === 'string' ? { [m]: 1 } : m) : null; try { if (sound._sZ) { sound._sZ.poidsT = 0; sound._sZ.P = null; } } catch (e) { /* rien */ } },
  poids() { const P = sound._sP || {}, o = {}; for (const b in P) if (P[b] > 0.005) o[b] = +P[b].toFixed(3); return o; },
  etat(eng) {
    const s = eng || sound, N = [];
    if (s._sN) for (const [k, x] of s._sN) N.push([k.slice(2), +(x.cible || 0).toFixed(4)]);
    return { poids: ambiance.poids(), nappes: N, journal: s._sZ ? s._sZ.journal.slice(-20) : [], file: (s._sFile ? s._sFile.size : 0) + (s._sOrdre ? s._sOrdre.length : 0) };
  },
};
