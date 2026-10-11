// ============================================================================
//  LE GRAND CERCLE (agent C18) — 2. LES JEUX, LA CAISSE, LE BAR, LES SONS
//  On joue avec des jetons achetés à la caisse (farm.pay), qu'on y rechange au
//  même prix (farm.earn) : un jeton vaut une pièce. La maison gagne, un peu :
//  - la ROULETTE (un seul zéro) : plein (35 pour 1), rouge, noir, pair, impair,
//    manque, passe (1 pour 1), douzaines (2 pour 1) — la maison : 2,7 % ;
//  - le VINGT-ET-UN : sabot sans fin, le croupier tire à 16 et sur 17 souple,
//    sa seconde carte après les joueurs (on perd tout sur son vingt-et-un),
//    doubler sur deux cartes, pas de séparation, le vingt-et-un naturel paie
//    six pour cinq — la maison : ≈ 2,6 % contre le meilleur jeu ;
//  - le BACCARA (punto banco, tableau ordinaire) : la cagnotte prend 7,5 % de
//    chaque gain (arrondi en faveur de la maison) ; égalité payée dix pour un —
//    banco ≈ 2,2 %, punto ≈ 4,6 %, égalité ≈ 2,5 % (plus aux petites mises) ;
//  - le PASSE-DIX (trois dés, à la banque) : passe (11 et plus) ou manque (10 et
//    moins) à 1 pour 1, les brelans pour la maison (2,8 %) ; le brelan, 33 pour 1
//    (5,6 %) ; « sur un point », payé par dé qui le montre (7,9 %) ;
//  - le BANDIT MANCHOT (trois rouleaux de dix cases, un jeton de cinq) : il
//    rend 93,9 % de ce qu'on y met.
//  Limites : roulette 5 à 200 par coup, vingt-et-un 10 à 100, baccara 10 à 200,
//  passe-dix 5 à 100 ; la caisse ne vend pas plus de 1 500 jetons par soirée.
//  Les règles (C18_REGLES) sont pures : le domaine d'équilibrage C18 les rejoue.
//  API : c18Jeux (ouvrir(jeu), caisse(), bar(), jetons()), C18_REGLES.
// ============================================================================
const C18_MIN = { roulette: 5, vingt: 10, baccara: 10, des: 5, bandit: 5 };
const C18_MAX = { roulette: 200, vingt: 100, baccara: 200, des: 100 };
const C18_CAGNOTTE = 0.075;
const C18_PLAFOND_NUIT = 1500;   // jetons vendus au plus par soirée
const C18_JETONS = [5, 10, 25, 50, 100];
const C18_ROULEAUX = [
  ['fer', 'carreau', 'pique', 'coeur', 'cloche', 'fer', 'carreau', 'pique', 'coeur', 'etoile'],
  ['fer', 'carreau', 'pique', 'coeur', 'cloche', 'carreau', 'pique', 'coeur', 'fer', 'etoile'],
  ['fer', 'carreau', 'pique', 'coeur', 'cloche', 'pique', 'carreau', 'coeur', 'etoile', 'pique'],
];
const C18_BANDIT_TROIS = { cloche: 40, etoile: 25, fer: 20, coeur: 12, carreau: 11, pique: 7 };

// ============================================================================
//  LES RÈGLES (pures : le hasard est passé en argument)
// ============================================================================
const C18_REGLES = {
  // ------------------------------------------------------------- la roulette : ce que rend une mise (multiple de la mise, mise comprise)
  rouletteTirage(rnd) { return Math.floor(rnd() * 37); },
  rouletteRend(pari, n) {
    if (pari.startsWith('n:')) return +pari.slice(2) === n ? 36 : 0;
    if (n === 0) return 0;
    switch (pari) {
      case 'rouge': return C18_ROUGES.has(n) ? 2 : 0;
      case 'noir': return C18_ROUGES.has(n) ? 0 : 2;
      case 'pair': return n % 2 === 0 ? 2 : 0;
      case 'impair': return n % 2 ? 2 : 0;
      case 'manque': return n <= 18 ? 2 : 0;
      case 'passe': return n >= 19 ? 2 : 0;
      case 'd1': return n <= 12 ? 3 : 0;
      case 'd2': return n >= 13 && n <= 24 ? 3 : 0;
      case 'd3': return n >= 25 ? 3 : 0;
    }
    return 0;
  },
  rouletteParis() { const L = ['rouge', 'noir', 'pair', 'impair', 'manque', 'passe', 'd1', 'd2', 'd3']; for (let n = 0; n <= 36; n++) L.push('n:' + n); return L; },
  // ------------------------------------------------------------- les cartes (sabot sans fin : chaque carte au hasard)
  carte(rnd) { return { r: 1 + Math.floor(rnd() * 13), c: Math.floor(rnd() * 4) }; },
  total21(main) {
    let t = 0, as = 0;
    for (const k of main) { if (k.r === 1) { as++; t += 11; } else t += Math.min(10, k.r); }
    while (t > 21 && as) { t -= 10; as--; }
    return { t, souple: as > 0 };
  },
  naturel21(main) { return main.length === 2 && this.total21(main).t === 21; },
  // le croupier tire jusqu'à dix-sept, et sur dix-sept souple
  doitTirer21(main) { const { t, souple } = this.total21(main); return t < 17 || (t === 17 && souple); },
  // ce que rend la main (mise comprise ; mise : ce qui est engagé, doublé compris)
  rend21(joueur, croupier, mise) {
    const nj = this.naturel21(joueur), nc = this.naturel21(croupier), tj = this.total21(joueur).t, tc = this.total21(croupier).t;
    if (nj) return nc ? mise : mise + Math.floor(mise * 6 / 5);
    if (tj > 21) return 0;
    if (nc) return 0;
    if (tc > 21 || tj > tc) return mise * 2;
    return tj === tc ? mise : 0;
  },
  // ------------------------------------------------------------- le baccara (punto banco)
  vb(k) { return k.r >= 10 ? 0 : k.r; },
  tb(main) { return main.reduce((s, k) => s + this.vb(k), 0) % 10; },
  // le tableau : le punto tire à cinq et moins ; la banque selon la troisième carte du punto
  banqueTire(b, p3) {
    if (p3 === null) return b <= 5;
    if (b <= 2) return true;
    if (b === 3) return p3 !== 8;
    if (b === 4) return p3 >= 2 && p3 <= 7;
    if (b === 5) return p3 >= 4 && p3 <= 7;
    if (b === 6) return p3 === 6 || p3 === 7;
    return false;
  },
  coupBaccara(rnd) {
    const p = [this.carte(rnd), this.carte(rnd)], b = [this.carte(rnd), this.carte(rnd)];
    let tp = this.tb(p), tb = this.tb(b);
    if (tp < 8 && tb < 8) {
      let p3 = null;
      if (tp <= 5) { const k = this.carte(rnd); p.push(k); p3 = this.vb(k); tp = this.tb(p); }
      if (this.banqueTire(tb, p3)) { b.push(this.carte(rnd)); tb = this.tb(b); }
    }
    return { p, b, tp, tb };
  },
  gainCagnotte(g) { return Math.floor(g * (1 - C18_CAGNOTTE)); },
  rendBaccara(cote, mise, tp, tb) {
    if (cote === 'egalite') return tp === tb ? mise + this.gainCagnotte(mise * 10) : 0;
    if (tp === tb) return mise;
    const gagne = cote === 'punto' ? tp > tb : tb > tp;
    return gagne ? mise + this.gainCagnotte(mise) : 0;
  },
  // ------------------------------------------------------------- le passe-dix (trois dés)
  lancer(rnd) { return [1 + Math.floor(rnd() * 6), 1 + Math.floor(rnd() * 6), 1 + Math.floor(rnd() * 6)]; },
  rendDes(pari, mise, d) {
    const s = d[0] + d[1] + d[2], brelan = d[0] === d[1] && d[1] === d[2];
    if (pari === 'passe') return !brelan && s >= 11 ? mise * 2 : 0;
    if (pari === 'manque') return !brelan && s <= 10 ? mise * 2 : 0;
    if (pari === 'brelan') return brelan ? mise * 34 : 0;
    if (pari.startsWith('point:')) { const k = +pari.slice(6), m = d.filter((v) => v === k).length; return m ? mise * (1 + m) : 0; }
    return 0;
  },
  // ------------------------------------------------------------- le bandit manchot (multiple de la mise)
  tirerBandit(rnd) { return C18_ROULEAUX.map((R) => Math.floor(rnd() * R.length)); },
  gainBandit(a, b, c) {
    if (a === b && b === c) return C18_BANDIT_TROIS[a] || 0;
    const fers = [a, b, c].filter((x) => x === 'fer').length;
    if (fers === 2) return 4;
    if (a === b) return 1;
    if (a === 'fer') return 1;
    return 0;
  },
};

// ============================================================================
//  LES SONS (moteur du jeu : tone, noiseHit, voice)
// ============================================================================
Object.assign(SoundEngine.prototype, {
  c18(nom, pos, k) {
    if (!this.ok || !this.ctx) return;
    const f = this['c18_' + nom];
    if (!f) return;
    try { if (pos && this.ici) this.ici(pos, () => f.call(this, k || 1)); else f.call(this, k || 1); } catch (e) { console.error('C18 son', nom, e); }
  },
  // des jetons qu'on pose ou qu'on ramasse
  c18_jetons(k) {
    const t = this.at(0.005), o = this.ui || this.sfx, n = 2 + Math.floor(Math.random() * 3 + k);
    for (let i = 0; i < n; i++) { const d = i * 0.045 + Math.random() * 0.02; this.noiseHit(t + d, 0.035, 'bandpass', 3800 + Math.random() * 900, 4, 0.05, o); this.tone(t + d, 'sine', 2600 + Math.random() * 500, 2500, 0.05, 0.012, o, 0.001); }
  },
  // la bille qui court sur la piste (dur secondes), puis tombe et sautille dans les cases
  c18_bille(k) {
    const t = this.at(0.01), o = this.ui || this.sfx, dur = 3.6 * k;
    this.noiseHit(t, dur, 'bandpass', 2200, 2.5, 0.035, o, 900, 0.3);
    let d = 0, pas = 0.07;
    while (d < dur) { this.noiseHit(t + d, 0.012, 'highpass', 3500, 0.8, 0.012, o); d += pas; pas *= 1.035; }
    for (let i = 0; i < 4; i++) { const tt = t + dur + i * (0.13 - i * 0.02); this.tone(tt, 'triangle', 1900 - i * 120, 1500, 0.04, 0.045 / (i + 1), o, 0.001); this.noiseHit(tt, 0.02, 'bandpass', 4200, 3, 0.04 / (i + 1), o); }
  },
  // une carte qui glisse du sabot
  c18_carte() { const t = this.at(0.005), o = this.ui || this.sfx; this.noiseHit(t, 0.09, 'highpass', 2800, 0.7, 0.05, o, 5200); this.noiseHit(t + 0.08, 0.02, 'bandpass', 1500, 2, 0.03, o); },
  // les dés : le cornet qu'on secoue, puis les trois dés qui roulent sur le tapis
  c18_des() {
    const t = this.at(0.01), o = this.ui || this.sfx;
    for (let i = 0; i < 7; i++) this.noiseHit(t + i * 0.06 + Math.random() * 0.02, 0.03, 'bandpass', 1800 + Math.random() * 800, 3, 0.05, o);
    for (let i = 0; i < 9; i++) { const d = 0.55 + i * 0.07 * (1 + i * 0.15); this.noiseHit(t + d, 0.02, 'bandpass', 1200 + Math.random() * 600, 2.5, 0.06 / (1 + i * 0.3), o); }
  },
  // le bandit : le bras, le cliquet, les rouleaux qui s'arrêtent un à un
  c18_bandit() {
    const t = this.at(0.01), o = this.ui || this.sfx;
    for (let i = 0; i < 6; i++) this.noiseHit(t + i * 0.035, 0.02, 'bandpass', 2400, 4, 0.05, o);
    this.noiseHit(t + 0.25, 1.4, 'bandpass', 700, 1.5, 0.03, o, 500, 0.1);
    for (let r = 0; r < 3; r++) { const tt = t + 0.8 + r * 0.38; this.tone(tt, 'square', 180, 90, 0.08, 0.05, o, 0.001); this.noiseHit(tt, 0.06, 'lowpass', 900, 1, 0.08, o); }
  },
  // la sonnette du gain (n coups)
  c18_sonnette(n) {
    const t = this.at(0.01), o = this.ui || this.sfx;
    for (let i = 0; i < Math.min(8, n); i++) { this.tone(t + i * 0.16, 'sine', 2093, 2090, 0.5, 0.035, o, 0.001); this.tone(t + i * 0.16, 'sine', 3135, 3130, 0.3, 0.012, o, 0.001); }
  },
  // un verre qu'on pose, qu'on trinque
  c18_verre() { const t = this.at(0.005), o = this.ui || this.sfx; this.tone(t, 'sine', 3520, 3500, 0.5, 0.025, o, 0.001); this.tone(t, 'sine', 5274, 5250, 0.3, 0.01, o, 0.001); },
  // la rumeur de la salle : des voix basses, un rire, un jeton (placé : sound.c18('rumeur', pos))
  c18_rumeur(k) {
    const t = this.at(0.01), o = this.sfx;
    for (let i = 0; i < 3; i++) { const d = i * 0.4 + Math.random() * 0.3, f = 160 + Math.random() * 120; this.voice(t + d, 'sawtooth', f, f * (0.85 + Math.random() * 0.3), 0.5 + Math.random() * 0.5, 0.008 * k, o, { bp: 500 + Math.random() * 400, q: 1.5, lp: 1800 }); }
    if (Math.random() < 0.4) this.noiseHit(t + Math.random(), 0.03, 'bandpass', 3900, 4, 0.02 * k, o);
  },
  // le piano : une phrase de valse lente (notes : demi-tons au-dessus du la 220)
  c18_piano(k) {
    const t = this.at(0.05), o = this.sfx;
    const PH = [[[12, 16, 19], [7], [7]], [[10, 14, 17], [5], [5]], [[8, 12, 15], [3], [3]], [[7, 11, 14], [2], [-1]]];
    const L = PH.length, bpm = 0.42;
    for (let m = 0; m < L; m++) for (let b = 0; b < 3; b++) for (const n of PH[m][b]) {
      const f = 220 * Math.pow(2, (n + (b ? 12 : 0) - 12) / 12), tt = t + (m * 3 + b) * bpm;
      this.tone(tt, 'triangle', f, f, b ? 0.5 : 1.1, (b ? 0.012 : 0.018) * k, o, 0.003);
      this.tone(tt, 'sine', f * 2, f * 2, 0.35, 0.004 * k, o, 0.002);
    }
  },
});

// ============================================================================
//  LES TABLES (le panneau du jeu : un dessin, des boutons)
// ============================================================================
const C18_RANGS = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'V', 'D', 'R'];
const C18_COULEURS = ['♠', '♥', '♦', '♣'];
const C18_SYMBOLES = { fer: 'fer à cheval', carreau: 'carreau', pique: 'pique', coeur: 'cœur', cloche: 'cloche', etoile: 'étoile' };
const C18_NOMS_JEUX = { roulette: 'La roulette', vingt: 'Le vingt-et-un', baccara: 'Le baccara', des: 'Le passe-dix', bandit: 'Le bandit manchot' };

const c18Jeux = {
  E: null, jeton: 10, anim: null,
  S() { return c18.S(); },
  jetons() { const S = this.S(); return S ? S.jetons : 0; },
  // ------------------------------------------------------------- le panneau
  style() {
    if (this.styled || typeof document === 'undefined') return;
    this.styled = true;
    const st = document.createElement('style');
    st.textContent = `#choice.c18w{width:min(700px,calc(100vw - 24px));max-height:calc(100vh - 16px);overflow-y:auto;margin-bottom:8px}
#choice .c18 canvas{display:block;width:100%;max-width:640px;margin:4px auto 6px;border-radius:6px;background:#1e5232;box-shadow:inset 0 0 18px rgba(0,0,0,.45)}
#choice .c18 .c18l{font:14px Georgia,serif;color:#5a4a36;margin:2px 0 6px;text-align:center;min-height:19px;font-style:italic}
#choice .c18 .c18e{display:flex;justify-content:space-between;font:13px Georgia,serif;color:#6a5638;margin:0 4px 6px}
#choice .c18 .c18b{display:flex;flex-wrap:wrap;gap:4px;justify-content:center;margin:4px 0}
#choice .c18 .c18b button{background:rgba(138,90,42,.1);border:1px solid rgba(90,70,40,.3);border-radius:3px;padding:4px 9px;font:14px Georgia,serif;color:#3a2c1a;cursor:pointer}
#choice .c18 .c18b button:hover{background:rgba(138,90,42,.25)}
#choice .c18 .c18b button.on{background:#7a5a2a;color:#f4ead2}
#choice .c18 .c18b button:disabled{opacity:.4;cursor:default}
#choice .c18 .c18g{display:grid;grid-template-columns:repeat(13,1fr);gap:2px;margin:4px auto;max-width:640px}
#choice .c18 .c18g button{padding:5px 0;font:12px Georgia,serif;border:1px solid rgba(0,0,0,.35);border-radius:2px;color:#f4ead2;cursor:pointer;position:relative}
#choice .c18 .c18g button.r{background:#a8241e}#choice .c18 .c18g button.n{background:#1c1a1a}#choice .c18 .c18g button.z{background:#1f6a3a;grid-row:span 3}
#choice .c18 .c18g button.s{background:#2c6e3e;grid-column:span 2}#choice .c18 .c18g button.d{background:#235834;grid-column:span 4}
#choice .c18 .c18g button i{position:absolute;right:1px;top:-6px;font:bold 10px Georgia,serif;font-style:normal;background:#e8c060;color:#2a1a0a;border-radius:7px;padding:0 3px}
#choice .c18 .c18g button.gagne{outline:2px solid #f0d060}`;
    document.head.appendChild(st);
    // un autre panneau qui s'ouvre reprend sa largeur
    const _o = ui.open.bind(ui);
    ui.open = function (id, html) { const el = typeof document !== 'undefined' && document.querySelector('#choice'); if (el) el.classList.remove('c18w'); return _o(id, html); };
  },
  panneau(titre, corps) {
    this.style();
    ui.open('#choice', `<div class="c18"><h3>${esc(titre)}</h3>${corps}</div>`);
    const el = $('#choice'); if (el) el.classList.add('c18w');
    ui.choiceOpts = [];
  },
  ligne(t) { const el = $('#choice .c18l'); if (el) el.textContent = t || ''; },
  etat(extra) { const el = $('#choice .c18e'); if (el) el.innerHTML = `<span>Jetons : <b>${this.jetons()}</b></span><span>${extra || ''}</span>`; },
  ouvert() { return ui.panel === '#choice' && !!$('#choice .c18'); },
  cv() { const c = $('#choice .c18 canvas'); return c ? c.getContext('2d') : null; },
  // une mise retirée des jetons ; un gain rendu
  prendre(n) { const S = this.S(); if (!S || S.jetons < n) return false; S.jetons -= n; c18.compter(-n); return true; },
  rendre(n) { const S = this.S(); if (!S || !(n > 0)) return; S.jetons += n; c18.compter(n); },
  // ------------------------------------------------------------- ouvrir une table
  ouvrir(jeu, it) {
    if (!c18.ouvertHeures()) { ui.subtitle('', '(Les housses sont sur les tables. Le Cercle n’ouvre qu’à six heures du soir.)', 3); return; }
    if (jeu !== 'bandit' && !c18.croupierLa(jeu)) { ui.subtitle('', '(Personne à la table.)', 2.5); return; }
    if (this.jetons() < C18_MIN[jeu]) { c18.dire(jeu === 'bandit' ? null : c18.croupierDe(jeu), 'Des jetons, d’abord. La caisse est à l’entrée.', 3); return; }
    if (typeof alcool !== 'undefined' && alcool.niveau && alcool.niveau() >= 4.5) { c18.dire(c18.croupierDe(jeu) || 'directrice', 'Vous ne tenez plus debout. Revenez demain, la table vous attendra.', 3.5); return; }
    c18.decouvrir('sys:c18_' + jeu);
    if (jeu === 'roulette') return this.roulette();
    if (jeu === 'vingt') return this.vingt();
    if (jeu === 'baccara') return this.baccara();
    if (jeu === 'des') return this.des();
    if (jeu === 'bandit') return this.bandit(it && it.data ? it.data.n : 0);
  },
  // le choix d'un jeton (les mises se font par jetons de cette valeur)
  choixJetons(min) {
    return `<div class="c18b c18j">${C18_JETONS.filter((v) => v >= min).map((v) => `<button data-j="${v}" class="${v === this.jeton ? 'on' : ''}">${v}</button>`).join('')}</div>`;
  },
  brancherJetons(min) {
    if (this.jeton < min) this.jeton = min;
    $$('#choice .c18j [data-j]').forEach((b) => { b.classList.toggle('on', +b.dataset.j === this.jeton); b.onclick = () => { this.jeton = +b.dataset.j; $$('#choice .c18j [data-j]').forEach((q) => q.classList.toggle('on', q === b)); sound.c18 && sound.c18('jetons', null, 0); }; });
  },
  boucle(fn) {
    // une petite boucle d'animation (s'arrête quand le panneau se ferme)
    if (this.anim) clearInterval(this.anim);
    const t0 = performance.now();
    this.anim = setInterval(() => { if (!this.ouvert()) { clearInterval(this.anim); this.anim = null; fn(-1); return; } if (fn((performance.now() - t0) / 1000) === false) { clearInterval(this.anim); this.anim = null; } }, 33);
  },
  carteDessin(g, x, y, k, dos) {
    g.fillStyle = dos ? '#7a1a20' : '#f4eedc'; g.strokeStyle = '#2a1a10'; g.lineWidth = 1;
    g.beginPath(); if (g.roundRect) g.roundRect(x, y, 44, 62, 4); else g.rect(x, y, 44, 62); g.fill(); g.stroke();
    if (dos) { g.strokeStyle = '#c8a050'; g.strokeRect(x + 5, y + 5, 34, 52); return; }
    g.fillStyle = k.c === 1 || k.c === 2 ? '#a8241e' : '#1c1a1a';
    g.font = 'bold 15px Georgia'; g.textAlign = 'left'; g.fillText(C18_RANGS[k.r], x + 4, y + 16);
    g.font = '22px Georgia'; g.textAlign = 'center'; g.fillText(C18_COULEURS[k.c], x + 22, y + 44);
  },

  // ================================================================ LA ROULETTE
  roulette() {
    const E = this.E = { jeu: 'roulette', paris: {}, tourne: false, res: null, ang: 0, bille: 0 };
    const btn = (k, cls, txt, extra) => `<button data-p="${k}" class="${cls}" ${extra || ''}>${txt}</button>`;
    let grille = btn('n:0', 'z', '0');
    for (let r = 0; r < 3; r++) for (let c = 0; c < 12; c++) { const n = c * 3 + 3 - r; grille += btn('n:' + n, C18_ROUGES.has(n) ? 'r' : 'n', n); }
    grille += '<span></span>' + ['d1', 'd2', 'd3'].map((d, i) => btn(d, 'd', ['1re douzaine', '2e douzaine', '3e douzaine'][i])).join('');
    grille += '<span></span>' + [['manque', 'Manque'], ['pair', 'Pair'], ['rouge', 'Rouge'], ['noir', 'Noir'], ['impair', 'Impair'], ['passe', 'Passe']].map(([k, t]) => btn(k, 's', t)).join('');
    this.panneau('La roulette', `<canvas width="640" height="170"></canvas><div class="c18l"></div><div class="c18e"></div>${this.choixJetons(5)}<div class="c18g">${grille}</div>
<div class="c18b"><button data-a="lancer">Lancer la bille</button><button data-a="effacer">Retirer les mises</button><button data-a="partir">Quitter la table</button></div>`);
    this.brancherJetons(5);
    $$('#choice .c18g [data-p]').forEach((b) => (b.onclick = () => this.miser(b.dataset.p)));
    $('#choice [data-a="lancer"]').onclick = () => this.lancerBille();
    $('#choice [data-a="effacer"]').onclick = () => { if (E.tourne) return; for (const k in E.paris) this.rendre(E.paris[k]); E.paris = {}; this.majParis(); sound.c18 && sound.c18('jetons', null, 1); };
    $('#choice [data-a="partir"]').onclick = () => { if (E.tourne) return; for (const k in E.paris) this.rendre(E.paris[k]); E.paris = {}; ui.close(); };
    this.ligne(c18.replique('odile', 'faites'));
    this.majParis(); this.dessinRoue();
    this.roueAuRepos();
  },
  // la roue tourne doucement entre deux coups ; le panneau fermé, les mises posées sont rendues
  roueAuRepos() {
    const E = this.E;
    this.boucle((t) => { if (t < 0) { if (!E.tourne) { for (const k in E.paris) this.rendre(E.paris[k]); E.paris = {}; } return; } if (!E.tourne) { E.ang += 0.004; this.dessinRoue(); } });
  },
  misesTotal() { const E = this.E; let s = 0; for (const k in E.paris) s += E.paris[k]; return s; },
  miser(k) {
    const E = this.E;
    if (!E || E.tourne) return;
    if (E.res !== null) { E.res = null; $$('#choice .c18g button').forEach((b) => b.classList.remove('gagne')); }
    const v = this.jeton;
    if (this.misesTotal() + v > C18_MAX.roulette) { this.ligne('La table ne prend pas plus de ' + C18_MAX.roulette + ' par coup.'); return; }
    if (!this.prendre(v)) { this.ligne('Vous n’avez plus assez de jetons.'); return; }
    E.paris[k] = (E.paris[k] || 0) + v;
    sound.c18 && sound.c18('jetons', null, 0);
    this.majParis();
  },
  majParis() {
    const E = this.E;
    $$('#choice .c18g [data-p]').forEach((b) => { const m = E.paris[b.dataset.p], i = b.querySelector('i'); if (m) { if (i) i.textContent = m; else b.insertAdjacentHTML('beforeend', `<i>${m}</i>`); } else if (i) i.remove(); });
    this.etat('Sur la table : ' + this.misesTotal());
  },
  dessinRoue() {
    const g = this.cv(), E = this.E;
    if (!g || !E) return;
    g.clearRect(0, 0, 640, 170);
    const cx = 320, cy = 85, R = 80;
    g.fillStyle = '#4a2416'; g.beginPath(); g.arc(cx, cy, R + 6, 0, TAU); g.fill();
    for (let i = 0; i < 37; i++) {
      const n = C18_CYLINDRE[i], a0 = E.ang + (i / 37) * TAU - Math.PI / 2, a1 = a0 + TAU / 37;
      g.fillStyle = n === 0 ? '#1f6a3a' : C18_ROUGES.has(n) ? '#a8241e' : '#1c1a1a';
      g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, a0, a1); g.closePath(); g.fill();
      g.save(); g.translate(cx + Math.cos(a0 + TAU / 74) * (R - 11), cy + Math.sin(a0 + TAU / 74) * (R - 11)); g.rotate(a0 + TAU / 74 + Math.PI / 2);
      g.fillStyle = '#f4ead2'; g.font = '9px Georgia'; g.textAlign = 'center'; g.fillText(String(n), 0, 3); g.restore();
    }
    g.fillStyle = '#6a3a1e'; g.beginPath(); g.arc(cx, cy, R * 0.62, 0, TAU); g.fill();
    g.strokeStyle = '#c8a040'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx - 20, cy); g.lineTo(cx + 20, cy); g.moveTo(cx, cy - 20); g.lineTo(cx, cy + 20); g.stroke();
    // la bille
    const rb = E.tourne ? lerp(R + 2, R - 22, clamp((E.t - 2.6) / 1.0, 0, 1)) : R - 22, ab = E.bille - Math.PI / 2;
    if (E.tourne || E.res !== null) { g.fillStyle = '#f4f0e4'; g.beginPath(); g.arc(cx + Math.cos(ab) * rb, cy + Math.sin(ab) * rb, 5, 0, TAU); g.fill(); }
    if (E.res !== null && !E.tourne) {
      g.fillStyle = E.res === 0 ? '#1f6a3a' : C18_ROUGES.has(E.res) ? '#a8241e' : '#1c1a1a';
      g.beginPath(); g.arc(560, 85, 34, 0, TAU); g.fill(); g.strokeStyle = '#e8c060'; g.lineWidth = 2; g.stroke();
      g.fillStyle = '#f4ead2'; g.font = 'bold 30px Georgia'; g.textAlign = 'center'; g.fillText(String(E.res), 560, 96);
    }
  },
  lancerBille() {
    const E = this.E;
    if (!E || E.tourne) return;
    if (!this.misesTotal()) { this.ligne('Posez vos jetons d’abord, en cliquant sur le tapis.'); return; }
    E.tourne = true; E.t = 0; E.res = C18_REGLES.rouletteTirage(Math.random);
    $$('#choice .c18g button').forEach((b) => b.classList.remove('gagne'));
    const idx = C18_CYLINDRE.indexOf(E.res), a0 = E.ang, b0 = Math.random() * TAU;
    // la roue tourne d'un côté, la bille de l'autre ; elle finit dans sa case
    const tours = 2.5, aFin = a0 + tours * TAU * 0.55, bFin = aFin + ((idx + 0.5) / 37) * TAU - tours * TAU * 2;
    const devine = c18.odileDevine();
    this.ligne(c18.replique('odile', 'riennevaplus'));
    sound.c18 && sound.c18('bille', null, 1);
    const P = c18.posJeu('roulette');
    this.boucle((t) => {
      if (t < 0) { this.finRoulette(true); return; }
      E.t = t;
      const k = clamp(t / 3.9, 0, 1), e = 1 - Math.pow(1 - k, 3);
      E.ang = lerp(a0, aFin, e); E.bille = lerp(b0, bFin, e);
      C18_ROUE.a = -E.ang; C18_ROUE.b = -E.bille; C18_ROUE.rb = lerp(0.4, 0.3, clamp((t - 2.6) / 1, 0, 1));
      if (devine && t > 1.4 && !E.dit) { E.dit = true; this.ligne('« ' + c18NombreEnLettres(E.res) + '. »'); c18.voix('odile', P); }
      this.dessinRoue();
      if (t >= 4.1) { this.finRoulette(false); return false; }
    });
  },
  finRoulette(ferme) {
    const E = this.E;
    if (!E || !E.tourne) return;
    E.tourne = false;
    let rendu = 0, mise = 0;
    for (const k in E.paris) { mise += E.paris[k]; rendu += E.paris[k] * C18_REGLES.rouletteRend(k, E.res); }
    E.paris = {};
    this.rendre(rendu);
    c18.coup('roulette', mise, rendu, E.res);
    if (ferme) return;
    const col = E.res === 0 ? 'zéro' : (C18_ROUGES.has(E.res) ? 'rouge' : 'noir') + ', ' + (E.res % 2 ? 'impair' : 'pair') + ', ' + (E.res <= 18 ? 'manque' : 'passe');
    $$('#choice .c18g [data-p]').forEach((b) => { if (C18_REGLES.rouletteRend(b.dataset.p, E.res)) b.classList.add('gagne'); });
    this.ligne(`« ${E.res === 0 ? 'Zéro' : c18NombreEnLettres(E.res) + ', ' + col} » — ${rendu ? (rendu > mise ? `vous gagnez ${rendu - mise}.` : rendu === mise ? 'vous rentrez dans vos frais.' : `on vous rend ${rendu}.`) : 'la maison ramasse.'}`);
    if (rendu > mise) sound.c18 && sound.c18('jetons', null, 2);
    this.majParis(); this.dessinRoue();
    this.roueAuRepos();
  },

  // ================================================================ LE VINGT-ET-UN
  vingt() {
    const E = this.E = { jeu: 'vingt', mise: 0, j: [], c: [], fini: true };
    this.panneau('Le vingt-et-un', `<canvas width="640" height="190"></canvas><div class="c18l"></div><div class="c18e"></div>${this.choixJetons(10)}
<div class="c18b"><button data-a="donner">Miser et donner</button><button data-a="tirer">Tirer</button><button data-a="rester">Rester</button><button data-a="doubler">Doubler</button><button data-a="partir">Quitter la table</button></div>`);
    this.brancherJetons(10);
    $('#choice [data-a="donner"]').onclick = () => this.donner21();
    $('#choice [data-a="tirer"]').onclick = () => this.tirer21();
    $('#choice [data-a="rester"]').onclick = () => this.rester21();
    $('#choice [data-a="doubler"]').onclick = () => this.doubler21();
    $('#choice [data-a="partir"]').onclick = () => { if (!E.fini) return; ui.close(); };
    this.ligne(c18.replique('valentin', 'accueil'));
    this.etat('De 10 à 100. Le naturel paie six pour cinq.'); this.boutons21(); this.dessin21();
    this.boucle((t) => { if (t < 0 && !E.fini) { this.abandon21(); } });
  },
  boutons21() {
    const E = this.E, on = (a, v) => { const b = $(`#choice [data-a="${a}"]`); if (b) b.disabled = !v; };
    on('donner', E.fini); on('tirer', !E.fini); on('rester', !E.fini); on('doubler', !E.fini && E.j.length === 2 && this.jetons() >= E.mise && !E.double); on('partir', E.fini);
  },
  dessin21(cache) {
    const g = this.cv(), E = this.E;
    if (!g) return;
    g.clearRect(0, 0, 640, 190);
    g.fillStyle = 'rgba(244,234,210,.85)'; g.font = '13px Georgia'; g.textAlign = 'left';
    g.fillText('Le croupier', 20, 22); g.fillText('Vous', 20, 118);
    E.c.forEach((k, i) => this.carteDessin(g, 120 + i * 50, 8, k, cache && i === 1));
    E.j.forEach((k, i) => this.carteDessin(g, 120 + i * 50, 104, k, false));
    if (E.j.length) { g.fillStyle = '#f4ead2'; g.fillText(String(C18_REGLES.total21(E.j).t), 20, 138); }
    if (E.c.length && !cache) { g.fillStyle = '#f4ead2'; g.fillText(String(C18_REGLES.total21(E.c).t), 20, 42); }
    if (E.mise) { g.fillStyle = '#e8c060'; g.font = '14px Georgia'; g.textAlign = 'right'; g.fillText('Mise : ' + E.mise, 620, 118); }
  },
  donner21() {
    const E = this.E;
    if (!E.fini) return;
    if (!this.prendre(this.jeton)) { this.ligne('Vous n’avez plus assez de jetons.'); return; }
    Object.assign(E, { mise: this.jeton, j: [C18_REGLES.carte(Math.random), C18_REGLES.carte(Math.random)], c: [C18_REGLES.carte(Math.random)], fini: false, double: false });
    sound.c18 && sound.c18('carte'); setTimeout(() => sound.c18 && sound.c18('carte'), 140);
    this.ligne(''); this.dessin21(); this.boutons21(); this.etat('Mise : ' + E.mise);
    if (C18_REGLES.naturel21(E.j)) setTimeout(() => this.rester21(), 500);
  },
  tirer21() {
    const E = this.E;
    if (E.fini) return;
    E.j.push(C18_REGLES.carte(Math.random)); sound.c18 && sound.c18('carte');
    this.dessin21(); this.boutons21();
    if (C18_REGLES.total21(E.j).t >= 21) setTimeout(() => this.rester21(), 350);
  },
  doubler21() {
    const E = this.E;
    if (E.fini || E.j.length !== 2 || E.double) return;
    if (!this.prendre(E.mise)) return;
    E.mise *= 2; E.double = true;
    E.j.push(C18_REGLES.carte(Math.random)); sound.c18 && sound.c18('carte');
    this.dessin21(); this.boutons21();
    setTimeout(() => this.rester21(), 400);
  },
  rester21() {
    const E = this.E;
    if (E.fini || E.joue) return;
    E.joue = true; this.boutons21();
    const tj = C18_REGLES.total21(E.j).t, nj = C18_REGLES.naturel21(E.j);
    const etape = () => {
      if (!this.ouvert()) { this.abandon21(); return; }
      // la seconde carte du croupier (toujours), puis il tire si le joueur n'a pas sauté
      const tirer = E.c.length < 2 || (tj <= 21 && !nj && C18_REGLES.doitTirer21(E.c));
      if (!tirer) { this.fin21(); return; }
      E.c.push(C18_REGLES.carte(Math.random)); sound.c18 && sound.c18('carte');
      this.dessin21();
      setTimeout(etape, 520);
    };
    setTimeout(etape, 380);
  },
  fin21() {
    const E = this.E;
    if (E.fini) return;
    E.fini = true; E.joue = false;
    const rendu = C18_REGLES.rend21(E.j, E.c, E.mise);
    this.rendre(rendu);
    c18.coup('vingt', E.mise, rendu);
    const tj = C18_REGLES.total21(E.j).t, tc = C18_REGLES.total21(E.c).t;
    let t;
    if (C18_REGLES.naturel21(E.j) && rendu > E.mise) t = 'Vingt-et-un d’entrée ! La maison paie six pour cinq : ' + (rendu - E.mise) + '.';
    else if (tj > 21) t = 'Vous sautez. ' + c18.replique('valentin', 'perdu');
    else if (C18_REGLES.naturel21(E.c)) t = 'Vingt-et-un pour la banque. ' + c18.replique('valentin', 'perdu');
    else if (rendu > E.mise) t = (tc > 21 ? 'Le croupier saute. ' : '') + 'Gagné : ' + (rendu - E.mise) + '.';
    else if (rendu === E.mise) t = 'Égalité : on vous rend votre mise.';
    else t = 'La banque a ' + tc + '. ' + c18.replique('valentin', 'perdu');
    this.ligne(t);
    if (rendu > E.mise) sound.c18 && sound.c18('jetons', null, 2);
    if (this.ouvert()) { this.dessin21(); this.boutons21(); this.etat('De 10 à 100. Le naturel paie six pour cinq.'); }
  },
  // (le panneau fermé en pleine main : la main se joue comme si l'on restait)
  abandon21() {
    const E = this.E;
    if (!E || E.fini) return;
    while (E.c.length < 2 || (C18_REGLES.total21(E.j).t <= 21 && !C18_REGLES.naturel21(E.j) && C18_REGLES.doitTirer21(E.c))) E.c.push(C18_REGLES.carte(Math.random));
    this.fin21();
  },

  // ================================================================ LE BACCARA
  baccara() {
    const E = this.E = { jeu: 'baccara', paris: {}, coup: null, montre: 0, fini: true };
    this.panneau('Le baccara', `<canvas width="640" height="190"></canvas><div class="c18l"></div><div class="c18e"></div>${this.choixJetons(10)}
<div class="c18b"><button data-p="punto">Sur le punto</button><button data-p="banco">Sur la banque</button><button data-p="egalite">Sur l’égalité (10 pour 1)</button></div>
<div class="c18b"><button data-a="donner">Donner les cartes</button><button data-a="effacer">Retirer les mises</button><button data-a="partir">Quitter la table</button></div>`);
    this.brancherJetons(10);
    $$('#choice [data-p]').forEach((b) => (b.onclick = () => this.miserB(b.dataset.p)));
    $('#choice [data-a="donner"]').onclick = () => this.donnerB();
    $('#choice [data-a="effacer"]').onclick = () => { if (!E.fini) return; for (const k in E.paris) this.rendre(E.paris[k]); E.paris = {}; this.majB(); };
    $('#choice [data-a="partir"]').onclick = () => { if (!E.fini) return; for (const k in E.paris) this.rendre(E.paris[k]); E.paris = {}; ui.close(); };
    this.ligne(c18.replique('desire', 'accueil'));
    this.majB(); this.dessinB();
    this.boucle((t) => { if (t < 0) { if (E.fini) { for (const k in E.paris) this.rendre(E.paris[k]); E.paris = {}; } else this.finB(); } });
  },
  miserB(k) {
    const E = this.E;
    if (!E.fini) return;
    let s = 0; for (const q in E.paris) s += E.paris[q];
    if (s + this.jeton > C18_MAX.baccara) { this.ligne('Pas plus de ' + C18_MAX.baccara + ' par coup.'); return; }
    if (!this.prendre(this.jeton)) { this.ligne('Vous n’avez plus assez de jetons.'); return; }
    E.paris[k] = (E.paris[k] || 0) + this.jeton;
    sound.c18 && sound.c18('jetons', null, 0);
    this.majB();
  },
  majB() {
    const E = this.E, N = { punto: 'Punto', banco: 'Banque', egalite: 'Égalité' };
    this.etat(Object.keys(E.paris).map((k) => N[k] + ' : ' + E.paris[k]).join(' · ') || 'La cagnotte prend 7,5 % de chaque gain.');
  },
  dessinB() {
    const g = this.cv(), E = this.E;
    if (!g) return;
    g.clearRect(0, 0, 640, 190);
    g.fillStyle = 'rgba(244,234,210,.85)'; g.font = '14px Georgia'; g.textAlign = 'center';
    g.fillText('PUNTO', 170, 22); g.fillText('BANQUE', 470, 22);
    const C = E.coup;
    if (!C) return;
    const n = E.montre;
    const ordre = [['p', 0], ['b', 0], ['p', 1], ['b', 1]];
    if (C.p[2]) ordre.push(['p', 2]);
    if (C.b[2]) ordre.push(['b', 2]);
    ordre.slice(0, n).forEach(([q, i]) => { const x = (q === 'p' ? 170 : 470) - 75 + i * 52; this.carteDessin(g, x, 40 + (i === 2 ? 12 : 0), C[q][i], false); });
    if (n >= ordre.length) { g.fillStyle = '#f4ead2'; g.font = 'bold 22px Georgia'; g.fillText(String(C.tp), 170, 135 + 30); g.fillText(String(C.tb), 470, 135 + 30); }
  },
  donnerB() {
    const E = this.E;
    if (!E.fini) return;
    if (!Object.keys(E.paris).length) { this.ligne('Misez d’abord : le punto, la banque ou l’égalité.'); return; }
    E.fini = false; E.coup = C18_REGLES.coupBaccara(Math.random); E.montre = 0;
    const total = 4 + (E.coup.p[2] ? 1 : 0) + (E.coup.b[2] ? 1 : 0);
    const etape = () => {
      if (!this.ouvert()) { this.finB(); return; }
      E.montre++; sound.c18 && sound.c18('carte'); this.dessinB();
      if (E.montre < total) setTimeout(etape, 420); else setTimeout(() => this.finB(), 300);
    };
    this.ligne(c18.replique('desire', 'donne'));
    setTimeout(etape, 200);
  },
  finB() {
    const E = this.E;
    if (E.fini || !E.coup) return;
    E.fini = true;
    const C = E.coup;
    let rendu = 0, mise = 0;
    for (const k in E.paris) { mise += E.paris[k]; rendu += C18_REGLES.rendBaccara(k, E.paris[k], C.tp, C.tb); }
    E.paris = {};
    this.rendre(rendu);
    c18.coup('baccara', mise, rendu);
    if (!this.ouvert()) return;
    E.montre = 9; this.dessinB();
    const qui = C.tp === C.tb ? 'Égalité, ' + C.tp + ' partout.' : (C.tp > C.tb ? 'Le punto gagne, ' : 'La banque gagne, ') + Math.max(C.tp, C.tb) + ' contre ' + Math.min(C.tp, C.tb) + '.';
    this.ligne(qui + ' ' + (rendu > mise ? 'Pour vous : ' + (rendu - mise) + ', cagnotte déduite.' : rendu === mise ? 'Vous retrouvez votre mise.' : rendu ? 'On vous rend ' + rendu + '.' : c18.replique('desire', 'perdu')));
    if (rendu > mise) sound.c18 && sound.c18('jetons', null, 2);
    this.majB();
  },

  // ================================================================ LE PASSE-DIX
  des() {
    const E = this.E = { jeu: 'des', paris: {}, d: null, roule: false, point: 6 };
    this.panneau('Le passe-dix', `<canvas width="640" height="170"></canvas><div class="c18l"></div><div class="c18e"></div>${this.choixJetons(5)}
<div class="c18b"><button data-p="manque">Manque (3 à 10)</button><button data-p="passe">Passe (11 à 18)</button><button data-p="brelan">Un brelan (33 pour 1)</button></div>
<div class="c18b">${[1, 2, 3, 4, 5, 6].map((k) => `<button data-p="point:${k}">Sur le ${k}</button>`).join('')}</div>
<div class="c18b"><button data-a="lancer">Lancer les dés</button><button data-a="effacer">Retirer les mises</button><button data-a="partir">Quitter la table</button></div>`);
    this.brancherJetons(5);
    $$('#choice [data-p]').forEach((b) => (b.onclick = () => this.miserD(b.dataset.p)));
    $('#choice [data-a="lancer"]').onclick = () => this.lancerD();
    $('#choice [data-a="effacer"]').onclick = () => { if (E.roule) return; for (const k in E.paris) this.rendre(E.paris[k]); E.paris = {}; this.majD(); };
    $('#choice [data-a="partir"]').onclick = () => { if (E.roule) return; for (const k in E.paris) this.rendre(E.paris[k]); E.paris = {}; ui.close(); };
    this.ligne(c18.replique('rigobert', 'accueil'));
    this.majD(); this.dessinD([3, 4, 1], 0);
    this.boucle((t) => { if (t < 0) { if (E.roule) this.finD(); else { for (const k in E.paris) this.rendre(E.paris[k]); E.paris = {}; } } });
  },
  miserD(k) {
    const E = this.E;
    if (E.roule) return;
    let s = 0; for (const q in E.paris) s += E.paris[q];
    if (s + this.jeton > C18_MAX.des) { this.ligne('Pas plus de ' + C18_MAX.des + ' par coup.'); return; }
    if (!this.prendre(this.jeton)) { this.ligne('Vous n’avez plus assez de jetons.'); return; }
    E.paris[k] = (E.paris[k] || 0) + this.jeton;
    sound.c18 && sound.c18('jetons', null, 0);
    this.majD();
  },
  majD() {
    const E = this.E, N = (k) => (k.startsWith('point:') ? 'sur le ' + k.slice(6) : { passe: 'passe', manque: 'manque', brelan: 'brelan' }[k]);
    this.etat(Object.keys(E.paris).map((k) => N(k) + ' : ' + E.paris[k]).join(' · ') || 'Les brelans sont pour la banque.');
  },
  dessinD(d, rot) {
    const g = this.cv();
    if (!g) return;
    g.clearRect(0, 0, 640, 170);
    const pts = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
    d.forEach((v, i) => {
      const x = 220 + i * 100, y = 85;
      g.save(); g.translate(x, y); g.rotate((rot || 0) * (i + 1) * 0.7);
      g.fillStyle = '#f2ecdc'; g.strokeStyle = '#3a2a1a'; g.lineWidth = 2;
      g.beginPath(); if (g.roundRect) g.roundRect(-30, -30, 60, 60, 8); else g.rect(-30, -30, 60, 60); g.fill(); g.stroke();
      g.fillStyle = v === 1 ? '#a8241e' : '#1c1a1a';
      for (const [a, b] of pts[v]) { g.beginPath(); g.arc(a * 15, b * 15, 6, 0, TAU); g.fill(); }
      g.restore();
    });
  },
  lancerD() {
    const E = this.E;
    if (E.roule) return;
    if (!Object.keys(E.paris).length) { this.ligne('Misez d’abord.'); return; }
    E.roule = true; E.d = C18_REGLES.lancer(Math.random);
    sound.c18 && sound.c18('des');
    this.ligne(c18.replique('rigobert', 'lance'));
    this.boucle((t) => {
      if (t < 0) { this.finD(); return; }
      if (t < 1.2) { this.dessinD([1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)], (1.2 - t) * 3); return; }
      this.dessinD(E.d, 0); this.finD(); return false;
    });
  },
  finD() {
    const E = this.E;
    if (!E.roule) return;
    E.roule = false;
    let rendu = 0, mise = 0;
    for (const k in E.paris) { mise += E.paris[k]; rendu += C18_REGLES.rendDes(k, E.paris[k], E.d); }
    E.paris = {};
    this.rendre(rendu);
    c18.coup('des', mise, rendu);
    if (!this.ouvert()) return;
    const s = E.d[0] + E.d[1] + E.d[2], br = E.d[0] === E.d[1] && E.d[1] === E.d[2];
    this.ligne(`${E.d.join(', ')} : ${br ? 'brelan de ' + E.d[0] + ' !' : s + (s >= 11 ? ', passe.' : ', manque.')} ${rendu > mise ? 'Gagné : ' + (rendu - mise) + '.' : rendu === mise ? 'Vous rentrez dans vos frais.' : rendu ? 'On vous rend ' + rendu + '.' : c18.replique('rigobert', 'perdu')}`);
    if (rendu > mise) sound.c18 && sound.c18('jetons', null, 2);
    this.majD();
  },

  // ================================================================ LE BANDIT MANCHOT
  bandit(n) {
    const E = this.E = { jeu: 'bandit', n: n || 0, r: [0, 1, 2], tourne: false, gainT: 0 };
    this.panneau('Le bandit manchot', `<canvas width="640" height="170"></canvas><div class="c18l"></div><div class="c18e"></div>
<div class="c18b"><button data-a="tirer">Glisser un jeton de 5 et tirer le bras</button><button data-a="partir">Laisser la machine</button></div>`);
    $('#choice [data-a="tirer"]').onclick = () => this.tirerBandit();
    $('#choice [data-a="partir"]').onclick = () => { if (!E.tourne) ui.close(); };
    this.ligne(c18.pelagieLa() && n === 0 ? '« Prenez donc l’autre, celle-ci me connaît. »' : 'Trois cloches : quarante jetons. Trois étoiles : vingt-cinq. Trois fers : vingt.');
    this.etat('Un fer au premier rouleau rend la mise.'); this.dessinBandit(E.r.map((i) => i), 0);
    this.boucle((t) => { if (t < 0 && E.tourne) this.finBandit(); });
  },
  dessinBandit(pos, flou) {
    const g = this.cv();
    if (!g) return;
    g.clearRect(0, 0, 640, 170);
    g.fillStyle = '#2e2c2c'; g.fillRect(150, 10, 340, 150);
    g.strokeStyle = '#c8a040'; g.lineWidth = 3; g.strokeRect(150, 10, 340, 150);
    for (let r = 0; r < 3; r++) {
      const x = 175 + r * 105;
      g.fillStyle = '#f2ecdc'; g.fillRect(x, 25, 90, 120);
      const p = pos[r], L = C18_ROULEAUX[r].length;
      for (let k = -1; k <= 1; k++) {
        const i = ((Math.floor(p) + k) % L + L) % L, off = (p % 1) * 40, y = 85 + k * 40 - off;
        if (y < 30 || y > 140) continue;
        this.symbole(g, C18_ROULEAUX[r][i], x + 45, y, k === 0 && !flou ? 1 : 0.45);
      }
      g.strokeStyle = 'rgba(168,36,30,.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, 85); g.lineTo(x + 90, 85); g.stroke();
    }
  },
  symbole(g, s, x, y, a) {
    g.globalAlpha = a; g.textAlign = 'center';
    if (s === 'fer') { g.strokeStyle = '#5a5650'; g.lineWidth = 6; g.beginPath(); g.arc(x, y - 2, 13, Math.PI * 0.15, Math.PI * 0.85, true); g.stroke(); }
    else if (s === 'cloche') { g.fillStyle = '#c8a040'; g.beginPath(); g.moveTo(x - 15, y + 12); g.quadraticCurveTo(x - 12, y - 16, x, y - 16); g.quadraticCurveTo(x + 12, y - 16, x + 15, y + 12); g.fill(); g.beginPath(); g.arc(x, y + 14, 4, 0, TAU); g.fill(); }
    else if (s === 'etoile') { g.fillStyle = '#d8a020'; g.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 7 : 16, a2 = i * Math.PI / 5 - Math.PI / 2; g.lineTo(x + Math.cos(a2) * r, y + Math.sin(a2) * r); } g.fill(); }
    else { g.fillStyle = s === 'coeur' || s === 'carreau' ? '#a8241e' : '#1c1a1a'; g.font = '34px Georgia'; g.fillText({ coeur: '♥', carreau: '♦', pique: '♠' }[s], x, y + 12); }
    g.globalAlpha = 1;
  },
  tirerBandit() {
    const E = this.E;
    if (E.tourne) return;
    if (!this.prendre(C18_MIN.bandit)) { this.ligne('Plus un jeton de cinq. La caisse est à l’entrée.'); return; }
    E.tourne = true; E.fin = C18_REGLES.tirerBandit(Math.random);
    const S = c18.S(), q = game.world.props[(game.world.c18 || {}).bandits ? game.world.c18.bandits[E.n] : -1];
    if (q) { q.data = Object.assign({}, q.data, { lev: 0.9 }); farm.dirtyProps = true; setTimeout(() => { q.data = Object.assign({}, q.data, { lev: 0 }); farm.dirtyProps = true; }, 600); }
    void S;
    sound.c18 && sound.c18('bandit');
    const p0 = E.r.slice(), dur = [0.9, 1.28, 1.66];
    const cible = E.fin.map((f, r) => p0[r] + 20 + ((f - p0[r] % 10) + 10) % 10 + r * 10);
    this.ligne('');
    this.boucle((t) => {
      if (t < 0) { this.finBandit(); return; }
      const pos = cible.map((c, r) => { const k = clamp(t / dur[r], 0, 1), e = 1 - Math.pow(1 - k, 2.4); return lerp(p0[r], c, e); });
      this.dessinBandit(pos, t < dur[2]);
      if (t >= dur[2] + 0.15) { E.r = E.fin.slice(); this.dessinBandit(E.r, false); this.finBandit(); return false; }
    });
  },
  finBandit() {
    const E = this.E;
    if (!E.tourne) return;
    E.tourne = false; E.r = E.fin.slice();
    const sy = E.r.map((i, r) => C18_ROULEAUX[r][i]), m = C18_REGLES.gainBandit(sy[0], sy[1], sy[2]), rendu = m * C18_MIN.bandit;
    this.rendre(rendu);
    c18.coup('bandit', C18_MIN.bandit, rendu);
    if (!this.ouvert()) return;
    if (m >= 7) { sound.c18 && sound.c18('sonnette', null, Math.min(8, Math.round(m / 5))); sound.c18 && sound.c18('jetons', null, 3); }
    else if (m) sound.c18 && sound.c18('jetons', null, 1);
    this.ligne(m ? (m === 1 ? 'La machine vous rend votre jeton.' : `${sy[0] === sy[1] && sy[1] === sy[2] ? 'Trois ' + C18_SYMBOLES[sy[0]] + (sy[0] === 'fer' ? 's à cheval' : 's') + ' ! ' : ''}La machine crache ${rendu} jetons.`) : pick(['Rien.', 'Rien. La machine a un petit bruit content.', 'Rien. Le ressort se détend avec un soupir.']));
    this.etat('Un fer au premier rouleau rend la mise.');
  },

  // ================================================================ LA CAISSE
  caisse() {
    if (!c18.ouvertHeures() || !c18.present('caissiere')) { ui.subtitle('', '(Le guichet est fermé par un rideau de serge verte.)', 3); return; }
    const S = this.S(), s = farm.s;
    const nuit = c18.nuitCle(), achete = S.achats && S.achats.k === nuit ? S.achats.n : 0;
    const opts = [];
    for (const n of [50, 100, 250, 500]) if (s.money >= n && achete + n <= C18_PLAFOND_NUIT) opts.push({ label: `Acheter ${n} jetons (${n} pièces)`, fn: () => this.acheterJetons(n) });
    if (S.jetons > 0) opts.push({ label: `Changer vos ${S.jetons} jetons contre des pièces`, fn: () => this.changer() });
    if (c18.suiteLouable()) opts.push({ label: `Louer la suite Impériale pour la nuit (${C18_SUITE.nuit} pièces)`, fn: () => c18.louerSuite('caissiere') });
    opts.push({ label: 'Rien, merci', fn: () => ui.close() });
    let desc = c18.replique('caissiere', 'accueil') + `\n\nVous avez ${s.money} pièces et ${S.jetons} jetons. Un jeton vaut une pièce.`;
    if (achete + 50 > C18_PLAFOND_NUIT) desc += '\n\n« La maison ne vend plus de jetons ce soir à monsieur. Ni à personne qui lui ressemble. »'.replace('monsieur', s.fem ? 'madame' : 'monsieur');
    ui.choice('La caisse', desc, opts);
    c18.decouvrir('pnj:c18_caissiere', 'metier');
  },
  acheterJetons(n) {
    const S = this.S(), nuit = c18.nuitCle();
    if (!S.achats || S.achats.k !== nuit) S.achats = { k: nuit, n: 0 };
    if (S.achats.n + n > C18_PLAFOND_NUIT) { this.caisse(); return; }
    if (!farm.pay(n)) { this.caisse(); return; }
    S.achats.n += n; S.jetons += n; S.achetes = (S.achetes || 0) + n;
    sound.c18 && sound.c18('jetons', null, 2);
    this.caisse();
  },
  changer() {
    const S = this.S(), n = S.jetons;
    if (!(n > 0)) return;
    S.jetons = 0; S.changes = (S.changes || 0) + n;
    farm.earn(n);
    sound.coin && sound.coin(); sound.c18 && sound.c18('jetons', null, 1);
    ui.close();
    c18.dire('caissiere', n >= 500 ? 'Voilà qui fait une belle liasse. Comptez-la dehors, pas ici.' : 'Voilà. Le compte est bon, il l’est toujours.', 3);
  },

  // ================================================================ LE BAR
  bar() {
    if (!c18.ouvertHeures() || !c18.present('theodule')) { ui.subtitle('', '(Les verres sont retournés sur le marbre.)', 2.5); return; }
    const s = farm.s, S = this.S();
    const offert = S && S.nuit && S.nuit.k === c18.nuitCle() && (S.nuit.mise || 0) >= 400 && !S.nuit.offert;
    const opts = C18_BOISSONS.map((b) => ({ label: offert && b.u ? `${b.nom} (offert par la maison)` : `${b.nom} (${b.prix} pièce${b.prix > 1 ? 's' : ''})`, fn: () => this.boire(b, offert && b.u) })).filter((o, i) => offert || s.money >= C18_BOISSONS[i].prix);
    opts.push({ label: 'Rien', fn: () => ui.close() });
    ui.choice('Le bar', c18.replique('theodule', offert ? 'offert' : 'accueil'), opts);
  },
  boire(b, offert) {
    const S = this.S();
    if (!offert && !farm.pay(b.prix)) { ui.close(); return; }
    if (offert && S && S.nuit) S.nuit.offert = 1;
    ui.close();
    sound.c18 && sound.c18('verre');
    if (b.u && typeof alcool !== 'undefined') alcool.boire(b.u, 'casino');
    else if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(0.3, 'cafe', 1);
    if (b.effet) b.effet();
    ui.subtitle('', b.dit, 3.5);
  },
};
const C18_BOISSONS = [
  { nom: 'Une coupe de champagne', prix: 12, u: 1.2, dit: '(Les bulles montent droit, comme si on les tirait d’en haut.)' },
  { nom: 'Un verre de fine', prix: 8, u: 2, dit: '(Ça brûle doucement, du palais jusqu’au ventre.)' },
  { nom: 'Une absinthe', prix: 10, u: 2.5, dit: '(Le barman fait couler l’eau goutte à goutte sur le sucre. Le vert se trouble. Quelque chose vous regarde depuis le fond du verre, puis plus rien.)',
    effet: () => { if (typeof strange !== 'undefined' && npcs.hour() < 5 && Math.random() < 0.35) setTimeout(() => ui.subtitle('', '(Au bout du bar, un homme en gris lève son verre vers vous. Quand vous le regardez, le tabouret est vide.)', 4.5), 4000); } },
  { nom: 'Un café noir', prix: 2, u: 0, dit: '(Un café serré, amer, brûlant. Vous voilà réveillé jusqu’à demain.)' },
];
// les nombres de la roulette, en toutes lettres (ce que dit la croupière)
function c18NombreEnLettres(n) {
  const U = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const D = { 2: 'vingt', 3: 'trente' };
  let t;
  if (n < 20) t = U[n];
  else { const d = Math.floor(n / 10), u = n % 10; t = D[d] + (u === 0 ? '' : u === 1 ? ' et un' : '-' + U[u]); }
  return t.charAt(0).toUpperCase() + t.slice(1);
}
