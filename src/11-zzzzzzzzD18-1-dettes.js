// ============================================================================
//  LES DETTES DE LA FERME (agent D18) — 2. LE JEU
//  État : farm.s.dettes18 = { v, palier (termes acquittés, 0 à 8), du (ce qui
//  reste du terme en cours, pénalités comprises), base, penal, echeance (jour),
//  ouvert, avis { rappel, demeure, semaines }, saisies, scelles, verse, fait
//  (termes dont les travaux sont faits), travaux (termes payés, travaux à faire
//  demain matin), cine (scènes à montrer en revenant à la ferme), places (où
//  chaque élément des travaux a été posé), journal, grace, lettre }.
//  Une ancienne partie commence au terme 0, avec un délai de grâce.
//  On paie : dans la boîte de l'étude (une plaque de cuivre sur la porte de la
//  maison Delorme, en ville ; ailleurs, à la mairie), ou par mandat à la poste.
//  Chaque matin : les travaux payés la veille (et leur scène, quand on revient
//  à la ferme), les avis, la mise en demeure, les pénalités (bornées), les
//  saisies (trois au plus par terme ; elles paient une part du terme, ne
//  prennent jamais un outil ni un objet de quête ; les scellés suspendent les
//  privilèges du domaine jusqu'au paiement). Jamais de fin de partie.
//  API (window.dettes18) : etat(), palier(), rembourser(n), payer(n, via),
//  du(), echeance(), avantage(k), travaux(), jour(), saisir(), TERMES.
// ============================================================================
const dettes18 = {
  TERMES: D18_TERMES,
  N: D18_TERMES.length,
  _ou: null,
  // ------------------------------------------------------------- l'état
  S() {
    const s = farm.s;
    if (!s) return null;
    if (!s.dettes18) this.neuf(s, false);
    const S = s.dettes18;
    S.avis = S.avis || {}; S.travaux = S.travaux || []; S.cine = S.cine || []; S.places = S.places || {}; S.journal = S.journal || [];
    return S;
  },
  neuf(s, grace) {
    const T = D18_TERMES[0];
    s.dettes18 = { v: 1, palier: 0, base: T.montant, du: T.montant, penal: 0, ouvert: s.day, echeance: s.day + (grace ? D18_RETARD.grace : T.delai),
      avis: {}, saisies: 0, scelles: false, verse: 0, fait: 0, travaux: [], cine: [], places: {}, journal: [], grace: !!grace, lettre: false };
    return s.dettes18;
  },
  etat() {
    const S = this.S();
    if (!S) return null;
    const d = farm.s.day;
    return { palier: S.palier, termes: this.N, du: S.palier >= this.N ? 0 : S.du, base: S.base, penal: S.penal, echeance: S.echeance,
      retard: S.palier < this.N && d > S.echeance ? d - S.echeance : 0, scelles: !!S.scelles, fait: S.fait, travaux: S.travaux.slice(),
      saisies: S.saisies, verse: S.verse, quitte: S.palier >= this.N, prochain: S.palier < this.N ? D18_TERMES[S.palier].titre : null };
  },
  palier() { const S = this.S(); return S ? S.palier : 0; },
  du() { const S = this.S(); return S && S.palier < this.N ? S.du : 0; },
  echeance() { const S = this.S(); return S && S.palier < this.N ? S.echeance : null; },
  quitte() { const S = this.S(); return !!S && S.palier >= this.N; },
  // un avantage du domaine (D18_AVANTAGES) : ses travaux faits, et pas sous scellés
  avantage(k) {
    const S = farm.s && farm.s.dettes18, n = D18_AVANTAGES[k];
    if (!S || !n || S.fait < n) return false;
    if (S.scelles && ['lit', 'chambre', 'ecurie', 'reputation'].includes(k)) return false;
    return true;
  },
  jourNom(d) { return typeof cal !== 'undefined' ? `${cal.nom(d)} ${d}` : `jour ${d}`; },
  num(i) { return D18_NUMS[i] || `${i + 1}e`; },
  // où est la boîte de l'étude (le texte des lettres)
  ou() {
    const w = game.world, k = this.boiteCle(w);
    return k === 'vide5' ? 'sur la porte de la maison Delorme, en ville' : k === 'mairie' ? 'à la porte de la mairie' : 'à la poste';
  },
  boiteCle(w) {
    if (!w || !w.bld) return null;
    if (w.bld.vide5 && w.bld.vide5.door >= 0) return 'vide5';
    if (w.bld.mairie && w.bld.mairie.door >= 0) return 'mairie';
    return null;
  },
  noter(quoi, n) { const S = this.S(); S.journal.push({ j: farm.s.day, q: quoi, n }); if (S.journal.length > 40) S.journal.splice(0, S.journal.length - 40); },
  lettre(titre, texte) { farm.mail(D18_SIGNE, titre, texte); },

  // ------------------------------------------------------------- payer
  // n : ce qu'on verse (par défaut : tout le terme) ; via : 'boite', 'poste', 'api'. Renvoie ce qui a été versé.
  payer(n, via) {
    const S = this.S(), s = farm.s;
    if (!S || S.palier >= this.N) return 0;
    let m = Math.floor(n === undefined || n === null ? S.du : +n || 0);
    m = Math.max(0, Math.min(m, S.du, s.money));
    if (m <= 0) return 0;
    if (!farm.pay(m)) return 0;
    S.du -= m; S.verse += m;
    this.noter(via || 'api', m);
    sound.coin && sound.coin();
    if (S.du <= 0) this.acquitter();
    try { window.dispatchEvent(new CustomEvent('prairie:dettes', { detail: this.etat() })); } catch (e) { /* rien */ }
    return m;
  },
  rembourser(n) { return this.payer(n, 'api'); },
  acquitter() {
    const S = this.S(), s = farm.s, i = S.palier, T = D18_TERMES[i];
    const paye = S.base + S.penal, scelles = S.scelles;
    S.palier = i + 1;
    S.travaux.push(S.palier);
    S.scelles = false;
    this.noter('terme', S.palier);
    if (S.palier >= this.N) {
      S.du = 0; S.penal = 0; S.echeance = null;
      this.lettre('Acte de mainlevée', D18_LETTRES.mainlevee({ m: paye }));
      return;
    }
    const N = D18_TERMES[S.palier];
    Object.assign(S, { base: N.montant, du: N.montant, penal: 0, ouvert: s.day, echeance: s.day + N.delai, avis: {}, saisies: 0 });
    const suite = D18_LETTRES.suite({ n: this.num(S.palier), m: N.montant, j: this.jourNom(S.echeance) }) + (scelles ? '\n\nLes scellés sont levés.' : '');
    this.lettre('Quittance — ' + this.num(i) + ' terme', D18_LETTRES.quittance({ m: paye, n: this.num(i), t: T.titre.charAt(0).toLowerCase() + T.titre.slice(1), suite }));
  },

  // ------------------------------------------------------------- chaque matin
  jour() {
    const S = this.S(), s = farm.s, d = s.day, R = D18_RETARD;
    if (!S) return;
    // les travaux payés la veille
    if (S.travaux.length) this.travaux();
    else if (S.fait && game.world) d18Travaux.reprendre(game.world);
    if (S.palier >= this.N) return;
    const T = D18_TERMES[S.palier], v = () => ({ n: this.num(S.palier), m: S.du, j: this.jourNom(S.echeance), ou: this.ou(), t: T.titre.charAt(0).toLowerCase() + T.titre.slice(1) });
    // la première lettre (une partie neuve : le deuxième jour ; une ancienne : tout de suite)
    if (!S.lettre) {
      if (S.palier === 0 && (d >= 2 || S.grace)) { S.lettre = true; this.lettre(S.grace ? 'Une dette retrouvée' : 'L’échéancier', S.grace ? D18_LETTRES.grace(v()) : D18_LETTRES.echeancier(v())); }
      else if (S.palier > 0) S.lettre = true;
    }
    // le rappel, quelques jours avant
    if (!S.avis.rappel && d >= S.echeance - R.rappel && d < S.echeance) { S.avis.rappel = true; this.lettre('Rappel — ' + this.num(S.palier) + ' terme', D18_LETTRES.rappel(v())); }
    if (d < S.echeance) return;
    // l'échéance passée : la mise en demeure
    const plafond = Math.round(S.base * R.plafond);
    if (!S.avis.demeure) {
      S.avis.demeure = true; S.avis.semaines = 0;
      const p = Math.min(Math.round(S.base * R.demeure), plafond - S.penal);
      if (p > 0) { S.penal += p; S.du += p; }
      this.lettre('Mise en demeure', D18_LETTRES.demeure(Object.assign(v(), { p, d: R.saisie })));
    }
    // chaque semaine de plus, la pénalité s'alourdit (jusqu'au plafond)
    const sem = Math.floor((d - S.echeance) / 12);
    while ((S.avis.semaines || 0) < sem) {
      S.avis.semaines = (S.avis.semaines || 0) + 1;
      const p = Math.min(Math.round(S.base * R.semaine), plafond - S.penal);
      if (p <= 0) break;
      S.penal += p; S.du += p;
      this.lettre('Pénalité de retard', D18_LETTRES.penalite(Object.assign(v(), { p })));
    }
    // la saisie
    if (S.saisies < R.saisies && d >= S.echeance + R.saisie + S.saisies * R.reprise) this.saisir();
  },
  // ------------------------------------------------------------- la saisie
  saisir() {
    const S = this.S(), s = farm.s, R = D18_RETARD;
    if (!S || S.palier >= this.N) return null;
    S.saisies++;
    const cap = Math.round(S.base * R.part), pris = {};
    // ce qui se vend : les coffres de la ferme, puis la sacoche ; le plus cher d'abord
    const sources = [];
    for (const k of ['coffre_ferme', 'coffre_d18_a', 'coffre_d18_b']) if (s.chests && s.chests[k]) sources.push(s.chests[k]);
    sources.push(s.inv);
    const prix = (id) => { const it = ITEMS[id]; return it && it.price > 0 && !it.questItem && !it.tool && D18_SAISISSABLE.includes(it.cat) && id !== s.hand ? it.price : 0; };
    const lots = [];
    for (const src of sources) for (const id in src) { const p = prix(id); if (p > 0 && src[id] > 0) lots.push({ src, id, p }); }
    lots.sort((a, b) => b.p - a.p);
    let val = 0;
    for (const L of lots) {
      while (L.src[L.id] > 0 && Math.round((val + L.p) * R.criee) <= cap) {
        L.src[L.id]--; val += L.p; pris[L.id] = (pris[L.id] || 0) + 1;
        if (L.src[L.id] <= 0) delete L.src[L.id];
      }
    }
    const r = Math.min(Math.round(val * R.criee), S.du - 1);
    if (r > 0) { S.du -= r; this.noter('saisie', r); }
    S.scelles = true;
    const noms = Object.keys(pris).map((id) => `${pris[id]} ${(ITEMS[id].name || id).toLowerCase()}`);
    farm.mail(D18_HUISSIER, 'Procès-verbal', noms.length ? D18_LETTRES.saisie({ objets: noms.join(', '), r, n: this.num(S.palier), m: S.du }) : D18_LETTRES.saisieVide({ m: S.du }));
    if (!S.cine.includes('huissiers')) S.cine.push('huissiers');
    return { pris, r };
  },

  // ------------------------------------------------------------- les travaux (le matin qui suit le paiement)
  travaux() {
    const S = this.S(), w = game.world;
    if (!S || !S.travaux.length || !w || !w.farm) return [];
    const L = S.travaux.splice(0).sort((a, b) => a - b), attente = [];
    for (const n of L) {
      if (n <= S.fait) continue;
      attente.push(...d18Travaux.appliquer(w, S.fait + 1, n, true));
      S.fait = n;
      S.cine.push(n);
    }
    if (typeof npcs !== 'undefined' && npcs.updateDoors) try { npcs.updateDoors(w, true); } catch (e) { /* rien */ }
    return attente;
  },

  // ------------------------------------------------------------- les scènes : en revenant à la ferme
  pres(w) {
    const p = game.player, F = w && w.farm && w.farm.f;
    if (!p || !F || p.underground || (typeof strange !== 'undefined' && strange.inEnvers && strange.inEnvers())) return false;
    return Math.hypot(p.pos[0] - F.x, p.pos[2] - F.z) < 55 && Math.abs(p.pos[1] - F.y) < 12;
  },
  peutMontrer() {
    if (game.mode !== 'play' || game.sleeping || game.dying || ui.panel || (typeof cine !== 'undefined' && cine.on)) return false;
    if (typeof h17Cine === 'undefined' || (game.world && game.world.zone)) return false;
    return this.pres(game.world);
  },
  montrer(k, force) {
    const S = this.S(), w = game.world;
    if (!S || !w || !w.farm) return Promise.resolve(false);
    const i = S.cine.indexOf(k);
    if (i >= 0) S.cine.splice(i, 1);
    if (!force && typeof h17Cine === 'undefined') return Promise.resolve(false);
    try { return k === 'huissiers' ? this.sceneHuissiers(w) : this.sceneTravaux(w, +k); } catch (e) { console.error('dettes18 : scène', e); return Promise.resolve(false); }
  },
  lumiere() { const h = typeof npcs !== 'undefined' ? npcs.hour() : 12; return h < 6.5 || h > 19.5 ? { h: 10 } : {}; },
  sceneTravaux(w, n) {
    const F = w.farm.f, B = w.bld.ferme, T = D18_TERMES[n - 1];
    if (!T || !B) return Promise.resolve(false);
    const hy = (x, z, up) => Math.max(w.heightAt(x, z), w.waterLevel) + up;
    const c = [B.x, hy(B.x, B.z, 2.5), B.z], [vx, vz] = d18Travaux.vue(w, n), v = [vx, hy(vx, vz, 1.6), vz];
    const a0 = F.r + Math.PI + 0.5 + n * 0.37;
    return h17Cine.jouer([
      { dur: 6.5, orbite: { c, r: 34, h: 13, a0, a1: a0 + 0.95, look: c }, carte: { haut: D18_TEXTES.ferme, titre: T.titre, bas: T.bas } },
      { dur: 5.5, orbite: { c: v, r: 15, h: 5, a0: a0 + 1.3, a1: a0 + 1.9, look: v } },
      { dur: 1.2, de: { pos: [v[0] + 12, v[1] + 5, v[2] + 12], look: v }, fondu: 'noir' },
    ], Object.assign({ musique: null }, this.lumiere()));
  },
  sceneHuissiers(w) {
    const F = w.farm.f, B = w.bld.ferme;
    if (!B) return Promise.resolve(false);
    const [px, pz] = d18Travaux.monde(F, 0, -14), y = w.heightAt(px, pz), out = B.out;
    const habit = { skin: '#e8cdb6', hair: '#2a2420', hairStyle: 'court', beard: null, hat: 'chapeau', top: '#1c1c22', bottom: '#1a1a1e', dress: false, apron: null, height: 1.0, build: 'mince' };
    const de1 = [out[0] - 0.6, w.heightAt(out[0], out[1]), out[1]], de2 = [out[0] + 0.6, w.heightAt(out[0], out[1]), out[1]];
    const [gx, gz] = d18Travaux.monde(F, 0, -30), a1 = [gx - 0.6, w.heightAt(gx, gz), gz], a2 = [gx + 0.6, w.heightAt(gx, gz), gz];
    const look = [B.x, B.y + 1.5, B.z];
    return h17Cine.jouer([
      { dur: 7, de: { pos: [px - 6, y + 3.2, pz - 4], look }, a: { pos: [px - 3, y + 2.6, pz - 6], look: [gx, y + 1.2, gz] },
        figurants: [{ look: habit, de: de1, a: a1 }, { look: Object.assign({}, habit, { height: 0.96, build: 'fort' }), de: de2, a: a2 }],
        carte: { haut: D18_TEXTES.ferme, titre: D18_TEXTES.huissiers, bas: D18_TEXTES.huissiersBas } },
      { dur: 1.2, de: { pos: [px - 3, y + 2.6, pz - 6], look: [gx, y + 1.2, gz] }, fondu: 'noir' },
    ], this.lumiere());
  },

  // ------------------------------------------------------------- la boîte de l'étude (en ville)
  poserBoite(w) {
    const k = this.boiteCle(w);
    if (!k || (w.inter || []).some((it) => it.kind === 'd18_boite')) return;
    const B = w.bld[k], f = B.f, dr = w.doors[B.door];
    const dx = dr ? (Math.cos(f.r) * (dr.x - f.x) - Math.sin(f.r) * (dr.z - f.z)) : 0;
    const lx = dx - (dr ? dr.w / 2 : 0.65) - 0.42, lz = -B.D / 2 - 0.03; // (à gauche de la porte : l'écriteau « À louer » est à droite)
    const c = Math.cos(f.r), s = Math.sin(f.r), x = f.x + lx * c + lz * s, z = f.z - lx * s + lz * c;
    const q = { id: 'd18_plaque', x, y: f.y + 1.15, z, r: f.r + Math.PI, bld: 'd18', d18: 'boite' };
    w.props.push(q);
    w.inter = w.inter || [];
    w.inter.push({ kind: 'd18_boite', id: 'd18_boite', x, y: f.y + 1.3, z, name: D18_TEXTES.boite, data: {}, d18: 'boite' });
    farm.dirtyProps = true;
  },
  boite() {
    const S = this.S(), s = farm.s;
    if (!S) return;
    if (S.palier >= this.N) { ui.choice(D18_TEXTES.boite, D18_TEXTES.plaque + '\n\n' + D18_TEXTES.rien, [{ label: D18_TEXTES.laisser, fn: () => ui.close() }]); return; }
    const du = S.du, T = D18_TERMES[S.palier], d = s.day;
    const quand = d > S.echeance ? `${D18_TEXTES.retard} : ${d - S.echeance} j.` : `${D18_TEXTES.echeance} : ${this.jourNom(S.echeance)}.`;
    const opts = [];
    const fin = (m) => { ui.close(true); if (!m) { ui.subtitle('', D18_TEXTES.pauvre, 2.5); return; } ui.subtitle('', D18_TEXTES.verse(m, S.palier < this.N && D18_TERMES[S.palier] === T ? S.du : 0), 4); };
    if (s.money >= du) opts.push({ label: D18_TEXTES.payer(du), fn: () => fin(this.payer(du, 'boite')) });
    else if (s.money > 0) opts.push({ label: D18_TEXTES.verser(s.money), fn: () => fin(this.payer(s.money, 'boite')) });
    opts.push({ label: D18_TEXTES.laisser, fn: () => ui.close() });
    ui.choice(D18_TEXTES.boite, `${D18_TEXTES.plaque}\n\n${this.num(S.palier).charAt(0).toUpperCase() + this.num(S.palier).slice(1)} terme : ${du} pièces. ${quand}`, opts);
  },
};
if (typeof window !== 'undefined') window.dettes18 = dettes18;

// ---------------------------------------------------------------- la plaque de l'étude (cuivre terni, une fente)
Object.assign(PROP_MODELS, {
  d18_plaque(E) {
    E.bx(0, 0, 0, 0.34, 0.24, 0.02, rgbf('#9a7a3a'), TL.gold);
    E.bx(0, 0.05, 0.012, 0.22, 0.025, 0.008, [0.05, 0.04, 0.03], TL.plain);
    E.bx(0, 0.15, 0.012, 0.26, 0.02, 0.006, rgbf('#5a4420'), TL.plain);
    E.bx(0, 0.185, 0.012, 0.18, 0.016, 0.006, rgbf('#5a4420'), TL.plain);
  },
});
PROP_COLL.d18_plaque = null;
HOOKS.inter.d18_boite = () => dettes18.boite();

// ---------------------------------------------------------------- la poste : un mandat pour l'étude
{
  const _opts = talk.options.bind(talk);
  talk.options = function () {
    const opts = _opts();
    try {
      const n = this.n;
      if (n && n.d.id === 'postiere' && farm.s && farm.s.dettes18) {
        const i = opts.findIndex((o) => o.act === 'bye');
        opts.splice(i >= 0 ? i : opts.length, 0, { label: D18_TEXTES.mandatOpt, act: 'd18:mandat' });
      }
    } catch (e) { console.error(e); }
    return opts;
  };
  const _choose = talk.choose.bind(talk);
  talk.choose = function (act) {
    if (typeof act !== 'string' || !act.startsWith('d18:') || !this.n) return _choose(act);
    const S = dettes18.S(), s = farm.s, f = D18_RETARD.mandat, [, cmd] = act.split(':');
    const autre = { label: 'Parlons d’autre chose', act: 'chat' };
    if (!S || S.palier >= dettes18.N) return this.view(D18_TEXTES.mandatRien, [autre]);
    if (cmd === 'mandat') {
      const o = [];
      if (s.money >= S.du + f) o.push({ label: D18_TEXTES.mandatTout(S.du), act: 'd18:tout' });
      else if (s.money > f) o.push({ label: D18_TEXTES.mandatPart(s.money - f), act: 'd18:part' });
      o.push(autre);
      return this.view(D18_TEXTES.mandatTexte(S.du, f), o);
    }
    if (cmd === 'tout' || cmd === 'part') {
      const m = cmd === 'tout' ? S.du : s.money - f;
      if (m <= 0 || s.money < m + f) return this.view(D18_TEXTES.mandatPauvre, [autre]);
      farm.pay(f);
      dettes18.payer(m, 'poste');
      return this.view(D18_TEXTES.mandatFait, [autre]);
    }
    return _choose('chat');
  };
}

// ---------------------------------------------------------------- les avantages du domaine
HOOKS.load.push((saved) => {
  const s = farm.s;
  if (!s) return;
  // une partie neuve : le premier terme ; une ancienne : un délai de grâce, et la lettre tout de suite
  if (!s.dettes18) { dettes18.neuf(s, !!saved && s.day > 1); if (s.dettes18.grace) dettes18.jour(); }
  dettes18.S();
  try { dettes18.poserBoite(game.world); } catch (e) { console.error('dettes18 : boîte', e); }
  if (game._d18) return;
  game._d18 = true;
  // la nuit à la ferme : le toit sec, puis la chambre, soignent davantage
  const _sleep = game.sleep.bind(game);
  game.sleep = async function (where) { dettes18._ou = where; try { return await _sleep(where); } finally { dettes18._ou = null; } };
  const _nuit = play.nuit.bind(play);
  play.nuit = function (h) {
    const r = _nuit(h);
    try {
      const p = game.player;
      if (dettes18._ou === 'ferme' && p && p.food > 0) {
        const b = (dettes18.avantage('lit') ? D18_BONUS.lit : 0) + (dettes18.avantage('chambre') ? D18_BONUS.chambre : 0);
        if (b) p.hp = Math.min(100, p.hp + b);
      }
    } catch (e) { console.error(e); }
    return r;
  };
  // la réputation du domaine : la coopérative paie un peu mieux
  const _newDay = farm.newDay.bind(farm);
  farm.newDay = function (wx) {
    let v = 0;
    try { if (dettes18.avantage('reputation')) for (const id in this.s.ship) v += ((ITEMS[id] && ITEMS[id].price) || 0) * this.s.ship[id]; } catch (e) { v = 0; }
    const r = _newDay(wx);
    if (v > 0) this.earn(Math.round(v * D18_BONUS.reputation));
    return r;
  };
});
HOOKS.day.push(() => {
  if (!farm.s) return;
  try { dettes18.jour(); } catch (e) { console.error('dettes18', e); }
  // l'écurie : les bêtes se plaisent
  if (dettes18.avantage('ecurie')) for (const a of farm.s.animals || []) if (!a.dead) a.mood = clamp((a.mood || 0.5) + D18_BONUS.ecurie, 0, 1);
});
// les scènes en attente : quand on revient à la ferme
{
  let t = 0;
  HOOKS.update.push((dt) => {
    t += dt;
    if (t < 0.7) return;
    t = 0;
    const S = farm.s && farm.s.dettes18;
    if (!S || !S.cine || !S.cine.length || !dettes18.peutMontrer()) return;
    // une scène de saisie ne passe qu'après les travaux du même matin ; les plus vieilles d'abord
    dettes18.montrer(S.cine[0]);
  });
}
