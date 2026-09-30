// ============================================================================
//  LES DEUX PEUPLES : LE JEU (agent C1) — les gens, les villages : 11-zzzz7-carte3-peuples.js
//  - leurs journées : des routines à eux (le Vorndi sur le quai, le Veilledi au
//    feu), jamais celles de la ville ; des places précises (quai, bancs, jasse, pré) ;
//  - la société : deux villages de plus ; le bruit y arrive par le passeur, par le col ;
//  - le passeur fait traverser le lac ; on l'appelle du ponton du pêcheur ou du phare ;
//  - leurs parlers : les mots entendus vont au carnet (onglet Langues), où l'on note
//    ce qu'on croit qu'ils veulent dire ; quelques-uns seulement se font expliquer ;
//  - leurs coutumes : les chandelles du Vorndi, la Dame de bois, on ne siffle pas sur
//    l'eau, l'appel du soir, le chant du Veilledi, la sonnaille du cairn, la pierre du
//    plan d'en haut.
//  État : farm.s.carte2.pe (API : carte2.peuples)
// ============================================================================
const C2_PEUPLE_IDS = new Set(C2_HABITANTS.map((d) => d.id));
// qui explique un mot, à partir de quelle amitié, combien au plus (la doyenne et le baïle, jamais)
const C2_EXPLIQUE = { planches_passeur: [3, 2], planches_vanniere: [3, 2], estive_fromagere: [2, 2], estive_patre: [1, 3] };
const C2_EXPLIQUE_LIGNES = {
  planches_passeur: { ok: ['« {forme} » ? {Sens}. On ne le dit qu’ici.', '« {forme} », c’est {sens}. Ne le dites pas trop fort en ville.'], tot: 'Pas encore. Passez l’aigue avec moi quelques fois, on verra.', fini: 'Je vous en ai assez dit. Le reste s’entend, ça ne s’apprend pas.' },
  planches_vanniere: { ok: ['« {forme} »… {Sens}. Ma mère disait ça en tressant.', '{Sens}. « {forme} ». Vous l’avez bien dit, presque.'], tot: 'Plus tard. Quand vous serez un peu d’ici.', fini: 'Je ne vous en dirai pas plus. Il faut garder quelque chose pour soi.' },
  estive_fromagere: { ok: ['Ah, « {forme} » ! {Sens}, voilà. En bas, on se moquerait de vous.', '« {forme} », c’est {sens}. Retenez-le, je ne le redirai pas.'], tot: 'Revenez plus souvent. Je vous dirai, peut-être.', fini: 'Assez de mots. Le baïle n’aime pas qu’on les donne.' },
  estive_patre: { ok: ['« {forme} », c’est {sens} ! Tout le monde sait ça. Enfin, ici.', '{Sens} ! « {forme} ». Grand-père dit qu’il ne faut pas vous les dire. Chut.'], tot: '…', fini: 'Grand-père m’a vu vous parler. Je ne dois plus rien vous dire. Pardon.' },
  planches_doyenne: { non: ['Ça ne se dit pas en français. Écoute encore.', 'Les mots d’ici ne sortent pas d’ici, petit.', 'Tu demandes le nom des choses. Demande-leur à elles.'] },
  estive_baile: { non: ['Ce mot-là est à nous. Garde tes oreilles, laisse-nous la bouche.', 'Écoute les bêtes. Elles le disent mieux que moi.', 'Tu le sauras quand tu n’auras plus besoin de le demander.'] },
};
// les coutumes, les choses à lire
const C2P_TEXTES = {
  pl_ecriteau: ['Un écriteau', 'SAINT-AUBIN', 'Dessous, au couteau, plus petit : « On ne siffle pas. »'],
  es_ecriteau: ['Une planche taillée en flèche', 'ESTIVE', 'Sous la flèche, une marque au couteau : une croix à potence.'],
  dame: ['La Dame', 'Une femme taillée dans un tronc, plantée dans l’eau au bout du quai. Elle tourne le dos au lac et regarde les maisons, les mains ouvertes. Sur le pieu, à hauteur d’eau, des coulures de cire, des centaines, les unes sur les autres.'],
  marques: ['Des marques', 'Une grande pierre couverte de marques. Une croix à potence, repassée de frais. Une fourche. Trois barres. D’autres, que le lichen a mangées. Sous la croix, une rangée de traits, un par été ; le dernier est encore blanc.\n\nPlus bas, taillé petit : HIPPOLYTE. À côté, une sonnaille gravée, la bouche en haut.'],
  cairn: ['Le cairn', 'Un cairn à hauteur d’homme, sur une butte. Au sommet, pendue à un bâton, une sonnaille. Pas de nom. Au pied, des cailloux blancs, un par visite.'],
  porte: ['La pierre', 'Une pierre plate dressée contre la pente, plus haute qu’un homme, plus sombre que la roche autour. On dirait une porte. Il n’y a ni gonds ni serrure. Devant, l’herbe est haute et grasse, et personne ne la fauche.'],
};
const C2P_SIFFLER = { planches_doyenne: 'On ne siffle pas ! Pas ici. Pas au-dessus d’eux.', planches_passeur: 'Arrêtez ça. On ne siffle pas sur l’aigue. Jamais.', planches_vanniere: 'Chut ! Ne sifflez pas… S’il vous plaît.' };
// les rochers aux marques du catalogue : les marques des familles de l'estive, un mot taillé sous chacune
C2_MARQUES.splice(0, C2_MARQUES.length,
  'Une croix à potence, taillée profond. Dessous, cinq traits, puis trois, puis un, et un mot en capitales maladroites : FEA.',
  'Deux traits croisés, comme une fourche. Un rond, des encoches serrées. Plus bas, gratté au clou : NÈU, et une date, 1829.',
  'Trois barres, l’une sur l’autre. Autour, des initiales plus récentes, et un mot qu’on a repassé plusieurs fois : LOP.',
  'Un bâton à deux branches, comme un arbre sans feuilles. Des dizaines d’encoches. Au bout de la dernière rangée : SAU.',
  'Six points en cercle, rien au milieu. Sous le cercle, profond, presque effacé : DRAC.',
  'Un trait droit et deux obliques : une flèche, ou un sapin. À côté : AURA, puis une date ancienne.');
const C2_MARQUES_MOTS = ['fea', 'neu', 'lop', 'sau', 'drac', 'aura'];
C2_SECRETS.marquesVues = (v) => { carte2.peuples.entendre('estive', null, [C2_MARQUES_MOTS[v % C2_MARQUES_MOTS.length]], 'grave'); };
for (const id of ['c2_cierges_eau', 'c2_chaudron']) DYN_PROPS.add(id);

carte2.peuples = {
  re: {}, props: null, t: 0, chantT: 0,
  pe() {
    const S = carte2.S(), P = S.pe || (S.pe = {});
    for (const k of ['mots', 'grave', 'devine', 'sens', 'expl', 'vus']) if (!P[k] || typeof P[k] !== 'object') P[k] = {};
    return P;
  },
  W() { return game.world; },
  P() { const w = this.W(); return (w && w.peuples) || {}; },
  cap(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); },
  heure() { return npcs.hour(); },
  // la nuit en cours (le jour de son soir), 0 le jour
  nuit() { const h = this.heure(), d = farm.s.day; return h >= 18 ? d : h < 6 ? d - 1 : 0; },
  pres(x, z, r) { const p = game.player.pos; return Math.hypot(p[0] - x, p[2] - z) < r; },
  eveille(n) { return !!(n && n.st.alive && !n.vanished && !n.hunting && !n.sleep && n.state !== 'dead' && n.state !== 'gone'); },

  // ------------------------------------------------------------------ les parlers
  contient(text, f) {
    const re = this.re[f] || (this.re[f] = new RegExp('(^|[^\\p{L}])' + f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^\\p{L}])', 'iu'));
    return re.test(text);
  },
  // un texte entendu (ou des mots vus, taillés) : les mots du parler qu'on ne connaissait pas vont au carnet
  entendre(area, text, mots, comment) {
    const L = C2_PARLERS[area];
    if (!L || !farm.s) return 0;
    const P = this.pe(), M = P.mots[area] || (P.mots[area] = {});
    let n = 0;
    const noter = (m) => { if (M[m] || !L.mots[m]) return; M[m] = farm.s.day; n++; if (comment === 'grave') (P.grave[area] || (P.grave[area] = {}))[m] = farm.s.day; };
    if (mots) for (const m of mots) noter(m);
    if (text) for (const m in L.formes) { if (M[m]) continue; if (L.formes[m].some((f) => this.contient(text, f))) noter(m); }
    if (n && !P.premier) {
      P.premier = farm.s.day;
      setTimeout(() => { try { ui.subtitle('', '(Un mot que vous ne connaissez pas. Vous le gardez dans un coin du carnet, à la page des langues.)', 4.5); } catch (e) { /* rien */ } }, 2600);
    }
    return n;
  },
  // le mot qu'on voudrait se faire expliquer : le plus récent qu'on n'a pas compris
  motADemander(n) {
    const area = n.d.area, L = C2_PARLERS[area];
    if (!L) return null;
    const P = this.pe(), M = P.mots[area] || {}, S = P.sens[area] || {};
    const c = Object.keys(M).filter((m) => L.mots[m] && !S[m]).sort((a, b) => M[b] - M[a] || a.localeCompare(b));
    return c[0] || null;
  },
  expliquer(tk, n) {
    const P = this.pe(), area = n.d.area, L = C2_PARLERS[area], m = this.motADemander(n);
    const V = (t) => tk.view(t, tk.options());
    if (!m) return V('…');
    const X = C2_EXPLIQUE_LIGNES[n.id] || {}, cfg = C2_EXPLIQUE[n.id];
    if (!cfg) return V(pick(X.non || ['…']));
    const [niv, max] = cfg, S = P.sens[area] || (P.sens[area] = {});
    if ((P.expl[n.id] || 0) >= max || Object.keys(S).length >= (L.max || 4)) return V(X.fini || '…');
    if (npcs.level(n) < niv) return V(X.tot || '…');
    S[m] = n.id;
    P.expl[n.id] = (P.expl[n.id] || 0) + 1;
    npcs.addAmitie(n, 5);
    const sens = L.mots[m], forme = L.formes[m][0];
    return V(pick(X.ok).replace(/\{forme\}/g, forme).replace(/\{Sens\}/g, this.cap(sens)).replace(/\{sens\}/g, sens));
  },
  // l'onglet Langues : les parlers, à la suite des langues perdues
  ongletHTML() {
    if (!farm.s) return '';
    const P = this.pe();
    let h = '';
    for (const area of ['planches', 'estive']) {
      const L = C2_PARLERS[area], M = P.mots[area] || {}, ids = Object.keys(M).filter((m) => L.mots[m]).sort((a, b) => M[a] - M[b] || a.localeCompare(b));
      if (!ids.length) continue;
      h += `<h4>${esc(this.cap(L.nom))} <span class="lg-n">— ${esc(L.peuple)} · ${esc(ids.length > 1 ? `${ids.length} mots` : 'un mot')}</span></h4><div class="lg-mots c2-mots">`;
      for (const m of ids) {
        const f = L.formes[m][0], qui = (P.sens[area] || {})[m], vu = (P.grave[area] || {})[m];
        h += `<span class="lg-mot"><span><i>${esc(f)}</i>${vu ? ' <span class="c2-g" title="vu taillé dans la pierre">✎</span>' : ''} — `
          + (qui ? `${esc(L.mots[m])} <span class="c2-qui">(${esc(npcs.nameOf(qui))})</span>` : `<input type="text" class="c2-dev" data-c2="${area}:${m}" maxlength="40" placeholder="…" value="${esc((P.devine[area] || {})[m] || '')}">`) + '</span></span>';
      }
      h += '</div>';
    }
    if (!h) return '';
    return '<h4>Les parlers</h4><p class="hint">Des mots entendus chez ceux des Planches et chez ceux de l’estive. Personne ne vous les traduit. Notez ce que vous croyez qu’ils veulent dire.</p>' + h;
  },
  lierOnglet() {
    const P = this.pe();
    $$('#satchel .c2-dev').forEach((el) => {
      const garder = () => { const [a, m] = String(el.dataset.c2 || '').split(':'); if (!a || !m) return; (P.devine[a] || (P.devine[a] = {}))[m] = String(el.value || '').slice(0, 40); };
      el.onchange = garder; el.onblur = garder;
    });
  },
  style() {
    if (this.styled || typeof document === 'undefined') return;
    this.styled = true;
    const st = document.createElement('style');
    st.textContent = '#satchel .c2-dev{font:italic 13px Georgia,serif;width:9.5em;background:rgba(255,255,255,.35);border:0;border-bottom:1px dotted #8a7a5a;color:#3a2a18;padding:0 2px}#satchel .c2-qui{font-size:11.5px;color:#8a7a5a;font-style:italic}#satchel .c2-g{color:#8a7a5a;font-size:11px}';
    document.head.appendChild(st);
  },

  // ------------------------------------------------------------------ le passeur
  passeur() { return npcs.byId && npcs.byId.planches_passeur; },
  dispo() {
    const n = this.passeur(), h = this.heure();
    if (!n || !n.st.alive || n.vanished || n.hunting || n.state === 'dead' || n.state === 'gone') return 'absent';
    if (h < 6.5 || h >= 19.5 || n.sleep) return 'nuit';
    if (typeof weather !== 'undefined' && weather.cur && weather.cur.storm > 0.3) return 'orage';
    return 'ok';
  },
  prix() {
    const s = farm.s, n = this.passeur(), Q = s.quests && s.quests.planches_passeur_1;
    return (Q && Q.st === 'fait') || (n && npcs.level(n) >= 5) ? 0 : 3;
  },
  rives() { const P = this.P(); return (P.planches && P.planches.rives) || {}; },
  traverser(vers, texte) {
    const w = this.W(), to = this.rives()[vers];
    if (!to || game.sleeping) return false;
    const p = this.prix();
    if (p && !farm.pay(p)) { ui.subtitle('', '(Vous n’avez pas de quoi payer le passage.)', 3); return false; }
    if (p) sound.coin && sound.coin();
    const pe = this.pe();
    pe.passages = (pe.passages || 0) + 1;
    const n = this.passeur();
    if (n) npcs.addAmitie(n, 8);
    w.time += 0.35 / 24; game.lastT = w.time; game.skipHours(0.35);
    game.teleport([to[0], to[1], to[2]], texte || 'La nau glisse sur l’aigue. Le passeur rame sans un mot, et contourne un endroit où l’eau est plus noire.');
    setTimeout(() => sound.splash && sound.splash(), 700);
    return true;
  },
  a_appel(it, d) {
    const n = this.passeur(), ou = d.ou, dispo = this.dispo();
    if (dispo !== 'ok') { setTimeout(() => ui.subtitle('', dispo === 'orage' ? '(Sur le lac, les vagues. Personne ne viendra par ce temps.)' : '(Personne ne répond. Sur l’eau, rien ne bouge.)', 3.5), 900); return; }
    const p = this.prix();
    ui.choice('Le passeur', `Au loin, du côté des Planches, une barque se détache et vient vers vous.${p ? ' Trois pièces le passage.' : ''}`, [
      { label: p ? 'Traverser (3 pièces)' : 'Traverser', fn: () => this.traverser('planches', `${n ? n.name : 'Le passeur'} vous fait monter sans rien dire. Vous traversez le lac, par le bord, jusqu’aux Planches.`) },
      { label: 'Lui faire signe que non', fn: () => ui.subtitle('', '(La barque s’arrête au milieu de l’eau, un long moment. Puis elle repart.)', 3.5) },
    ]);
    if (ou) this.pe().vus['appel_' + ou] = farm.s.day;
  },

  // ------------------------------------------------------------------ les dialogues
  options(n) {
    const O = [];
    if (!n || !n.st.alive || !n.st.met) return O;
    const P = this.pe();
    if (this.motADemander(n)) O.push({ label: `Que veut dire « ${C2_PARLERS[n.d.area].formes[this.motADemander(n)][0]} » ?`, act: 'c2p:mot' });
    if (n.id === 'planches_passeur' && this.P().planches && this.pres(this.P().planches.x, this.P().planches.z, 90)) O.push({ label: this.prix() ? 'Me faire passer (3 pièces)' : 'Me faire passer', act: 'c2p:passer' });
    if (n.id === 'estive_baile' && P.chant && !P.chantDit) O.push({ label: 'J’ai entendu chanter, sous la pierre du plan d’en haut.', act: 'c2p:chant' });
    return O;
  },
  choisir(tk, n, act) {
    const V = (t) => tk.view(t, tk.options());
    if (act === 'c2p:mot') return this.expliquer(tk, n);
    if (act === 'c2p:passer') {
      const d = this.dispo();
      if (d === 'nuit') return V(n.d.lines.nuit || '…');
      if (d === 'orage') return V(pick(n.d.lines.greet.orage));
      const R = this.rives(), O = [];
      if (R.ponton) O.push({ label: 'Au ponton du pêcheur', act: 'c2p:vers:ponton' });
      if (R.phare) O.push({ label: 'Au pied du phare', act: 'c2p:vers:phare' });
      O.push({ label: 'Finalement, non', act: 'chat' });
      return tk.view(this.prix() ? 'Trois pièces. Pour où ?' : pick(['Pour vous, c’est rien. Pour où ?', 'Montez. Où ça ?']), O);
    }
    if (act.startsWith('c2p:vers:')) {
      const vers = act.slice(9), qui = n.name;
      setTimeout(() => this.traverser(vers, vers === 'phare'
        ? `${qui} rame vers l’ouest, le long de la rive. Il ne regarde pas le milieu du lac. Au pied du phare, il vous laisse descendre et repart aussitôt.`
        : `${qui} rame vers l’est, par le bord. Une fois, il lève les rames et attend, sans rien dire, puis reprend. Au ponton, il vous laisse descendre.`), 60);
      return null;
    }
    if (act === 'c2p:chant') {
      const P = this.pe();
      P.chantDit = farm.s.day;
      npcs.addAmitie(n, 40);
      return V('… Tu l’as entendu. Moi, je n’y monte plus depuis trente ans. S’il chante encore, c’est qu’il compte encore ses bêtes. Laisse-le compter. Et n’en parle pas à la petite.');
    }
    return V('…');
  },

  // ------------------------------------------------------------------ les choses qu'on touche
  agir(it) {
    const d = it.data || {}, fn = this['a_' + d.a];
    if (fn) { try { fn.call(this, it, d); } catch (e) { console.error('carte2 peuples', e); } }
  },
  visible(it) {
    const d = it.data || {};
    if (d.a === 'appel') { const n = this.passeur(); return !!(n && n.st.met && n.st.alive); }
    return true;
  },
  a_lire(it, d) { const T = C2P_TEXTES[d.t]; if (T) ui.read(T[0], T[1], T[2] || ''); },
  a_dame() {
    const P = this.pe(), nuit = this.nuit(), T = C2P_TEXTES.dame;
    if (!nuit || !farm.count('cierge_flottant')) { ui.read(T[0], T[1]); return; }
    if (P.cierge === nuit) { ui.subtitle('', '(Votre chandelle est déjà sur l’eau. Elle s’éloigne.)', 3); return; }
    ui.choice(T[0], T[1], [
      { label: 'Poser une chandelle sur l’eau', fn: () => {
        if (!farm.take('cierge_flottant', 1)) return;
        P.cierge = nuit; P.cierges = (P.cierges || 0) + 1;
        sound.candle && sound.candle();
        if (typeof BUFF !== 'undefined' && BUFF.add) BUFF.add('lac', 24);
        this.maj(true);
        setTimeout(() => ui.subtitle('', '(La chandelle s’en va sur l’eau noire, droit vers le milieu du lac. Contre le vent.)', 4.5), 400);
      } },
      { label: 'Laisser', fn: () => {} },
    ]);
  },
  a_marques() { const T = C2P_TEXTES.marques; ui.read(T[0], T[1]); this.pe().vus.hippolyte = farm.s.day; },
  a_cairn(it) {
    const T = C2P_TEXTES.cairn;
    ui.choice(T[0], T[1], [
      { label: 'Faire sonner la sonnaille', fn: () => this.sonner(it) },
      { label: 'Poser un caillou blanc', fn: () => { this.pe().cailloux = (this.pe().cailloux || 0) + 1; ui.subtitle('', '(Vous posez un caillou au pied du cairn, avec les autres.)', 3); } },
      { label: 'Laisser', fn: () => {} },
    ]);
  },
  sonner(it) {
    this.sonSonnaille(1);
    const b = npcs.byId && npcs.byId.estive_baile;
    if (this.eveille(b) && Math.hypot(b.x - it.x, b.z - it.z) < 70) {
      npcs.addAmitie(b, -40); b.st.anger = Math.max(b.st.anger || 0, 1);
      setTimeout(() => npcs.say(b, 'On ne touche pas à celle-là.', 3.5), 700);
      return;
    }
    if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-0.5, 'sonnaille', 1);
    setTimeout(() => ui.subtitle('', '(Le son ne va nulle part. Il reste là, autour du cairn, longtemps après.)', 4), 900);
  },
  a_porte() {
    const P = this.pe(), h = this.heure(), J = cal.jour(farm.s.day).cle, Jv = cal.jour(farm.s.day - 1).cle;
    const chant = (J === 'veillee' && h >= 22) || (Jv === 'veillee' && h < 1.5);
    if (!chant) { const T = C2P_TEXTES.porte; ui.read(T[0], T[1]); return; }
    this.sonChant(0.35, true);
    this.entendre('estive', null, ['fea'], 'chant');
    const premier = !P.chant;
    P.chant = farm.s.day;
    if (premier && typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-1.5, 'chant sous la pierre', 3);
    ui.subtitle('', premier ? '(Derrière la pierre, quelqu’un chante. Une voix d’homme, jeune, qui monte, s’arrête, reprend. Vous ne comprenez pas les mots. Si : un seul, qui revient. « Fea ».)' : '(Derrière la pierre, la même voix. Elle compte, on dirait.)', 7);
  },

  // ------------------------------------------------------------------ les sons
  sonAppel(k) {
    if (!sound.ok || !sound.voice) return;
    const t = sound.at(), out = sound.lp ? sound.lp(1800, sound.amb) : sound.amb, v = 0.03 * clamp(k, 0.15, 1);
    sound.voice(t, 'triangle', 520, 700, 0.7, v, out, { vib: 5, vibDepth: 9 });
    sound.voice(t + 0.75, 'triangle', 700, 470, 1.4, v, out, { vib: 5, vibDepth: 12 });
    const p = sound.pan ? sound.pan(-0.6, sound.amb) : out;
    sound.voice(t + 3.4, 'triangle', 480, 640, 0.6, v * 0.35, p, { vib: 5, vibDepth: 9 });
    sound.voice(t + 4.05, 'triangle', 640, 440, 1.3, v * 0.3, p, { vib: 5, vibDepth: 12 });
  },
  sonChant(k, sourd) {
    if (!sound.ok || !sound.voice) return;
    const t = sound.at(), out = sound.lp ? sound.lp(sourd ? 600 : 1500, sound.amb) : sound.amb, v = 0.018 * clamp(k, 0.1, 1);
    const air = [[294, 1.1], [330, 0.6], [349, 0.9], [330, 0.7], [294, 1.4], [262, 0.9], [294, 1.6]];
    let d = 0;
    for (const [f, l] of air) {
      sound.voice(t + d, 'triangle', f, f * 0.995, l, v, out, { vib: 4.5, vibDepth: 6 });
      if (!sourd) { sound.voice(t + d, 'triangle', f * 0.75, f * 0.745, l, v * 0.7, out, { vib: 4, vibDepth: 5 }); sound.voice(t + d, 'sine', 147, 147, l, v * 0.8, out); }
      d += l;
    }
  },
  sonSonnaille(k) {
    if (!sound.ok || !sound.tone) return;
    const t = sound.at(), out = sound.lp ? sound.lp(3000, sound.amb) : sound.amb, v = 0.05 * clamp(k, 0.1, 1);
    for (const [f, a, dd] of [[610, 1, 0.9], [915, 0.5, 0.6], [1370, 0.3, 0.35]]) sound.tone(t, 'square', f, f * 0.99, dd, v * a * 0.4, out, 0.003);
  },

  // ------------------------------------------------------------------ à l'heure : les feux, les chandelles, le chaudron ; les coutumes
  indexer() {
    const w = this.W(), P = this.P();
    this.props = { cierges: null, joueur: null, feuPl: null, feuEs: null, chaudron: null };
    if (!w || !P.planches && !P.estive) return;
    for (const q of w.props) {
      if (q.id === 'c2_cierges_eau') { if (q.data && q.data.joueur) this.props.joueur = q; else this.props.cierges = q; }
      else if (q.id === 'feu_camp' && q.data && q.data.c2 === 'planches') this.props.feuPl = q;
      else if (q.id === 'feu_camp' && q.data && q.data.c2 === 'estive') this.props.feuEs = q;
      else if (q.id === 'c2_chaudron') this.props.chaudron = q;
    }
  },
  maj(force) {
    const w = this.W(), P = this.P(), s = farm.s;
    if (!w || !s || !this.props) return;
    const h = this.heure(), J = cal.jour(s.day).cle, Jv = cal.jour(s.day - 1).cle, pe = this.pe(), pluie = typeof weather !== 'undefined' && weather.cur && weather.cur.rain > 0.5;
    let lum = false;
    const allumer = (q, on) => { if (!q) return; const d = q.data || {}; if (!!d.lit !== on || d.lit === undefined) { q.data = Object.assign({}, d, { lit: on }); lum = true; } };
    allumer(this.props.cierges, (J === 'morts' && h >= 20) || (Jv === 'morts' && h < 5));
    allumer(this.props.joueur, !!pe.cierge && pe.cierge === this.nuit());
    allumer(this.props.feuPl, !pluie && ((h >= 18.5 && h < 21.5) || (J === 'morts' && h >= 18 && h < 23)));
    allumer(this.props.feuEs, !pluie && ((h >= 19.2 && h < 21.8) || (J === 'veillee' && h >= 19 && h < 23.8)));
    allumer(this.props.chaudron, h >= 5.4 && h < 11.5);
    if (lum || force) { w.collectLights(); farm.dirtyProps = true; }
  },
  coutumes(dt) {
    const s = farm.s, P = this.P(), pe = this.pe(), h = this.heure(), J = cal.jour(s.day).cle, Jv = cal.jour(s.day - 1).cle;
    const p = game.player.pos;
    // les Planches, la nuit du Vorndi : les chandelles sur l'eau
    const pl = P.planches;
    if (pl && ((J === 'morts' && h >= 20) || (Jv === 'morts' && h < 1)) && Math.hypot(p[0] - pl.XJ, p[2] - (pl.ZS - 6)) < 45 && !pe.vus.vorndi) {
      pe.vus.vorndi = s.day;
      ui.subtitle('', '(Sur le quai, ils posent de petites chandelles sur l’eau, une à une. Personne ne parle. Personne ne vous regarde.)', 6);
    }
    const es = P.estive;
    if (!es) return;
    const dEs = Math.hypot(p[0] - es.x, p[2] - es.z);
    // l'appel du soir, d'un versant à l'autre
    if (h >= 19.25 && h < 19.7 && pe.appel !== s.day && dEs < 280 && this.eveille(npcs.byId && npcs.byId.estive_patre)) {
      pe.appel = s.day;
      this.sonAppel(1 - dEs / 320);
      if (!pe.vus.appel) { pe.vus.appel = s.day; setTimeout(() => ui.subtitle('', '(Là-haut, quelqu’un appelle, longtemps, sur deux notes. Bien après, de l’autre versant, une voix répond.)', 5.5), 1200); }
    }
    // le Veilledi : le grand feu, et l'on chante
    const chante = (J === 'veillee' && h >= 20.4 && h < 23.5) && es.feu && Math.hypot(p[0] - es.feu[0], p[2] - es.feu[1]) < 24;
    if (chante && ['estive_baile', 'estive_fromagere', 'estive_patre'].some((id) => this.eveille(npcs.byId && npcs.byId[id]))) {
      this.chantT -= dt;
      if (this.chantT <= 0) { this.chantT = 13; this.sonChant(1, false); }
      if (pe.veillee !== s.day) {
        pe.veillee = s.day;
        this.entendre('estive', null, ['neu', 'aura', 'fea'], 'chant');
        if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(1.5, 'veillée à l’estive', 3);
        if (!pe.vus.chant) { pe.vus.chant = s.day; ui.subtitle('', '(Autour du feu, ils chantent, à trois voix, dans leur parler. Vous ne comprenez rien. Vous restez.)', 6); }
      }
    }
    // la sonnaille du cairn, certaines nuits, toute seule
    if (es.cairn && h >= 1.5 && h < 4 && pe.cairnNuit !== this.nuit() && Math.hypot(p[0] - es.cairn[0], p[2] - es.cairn[1]) < 45 && Math.random() < hasardHeure(0.9, dt)) {
      pe.cairnNuit = this.nuit();
      this.sonSonnaille(0.6);
      if (!pe.vus.cairn) { pe.vus.cairn = s.day; ui.subtitle('', '(La sonnaille du cairn tinte. Une fois. Il n’y a pas de vent.)', 4); }
    }
  },
  // on ne siffle pas sur l'eau
  siffle() {
    const P = this.P(), pl = P.planches, s = farm.s, pe = this.pe();
    if (!pl || !this.pres(pl.x, pl.z, 70)) return;
    const p = game.player.pos;
    for (const id of ['planches_passeur', 'planches_doyenne', 'planches_vanniere']) {
      const n = npcs.byId && npcs.byId[id];
      if (!this.eveille(n) || Math.hypot(n.x - p[0], n.z - p[2]) > 30) continue;
      if ((pe.siffle || {})[id] !== s.day) { (pe.siffle || (pe.siffle = {}))[id] = s.day; npcs.addAmitie(n, -15); }
      setTimeout(() => npcs.say(n, C2P_SIFFLER[id], 3.5), 500);
      return;
    }
    if (this.nuit() && pe.echo !== this.nuit()) {
      pe.echo = this.nuit();
      setTimeout(() => { sound.whistle && sound.whistle(); ui.subtitle('', '(Sur l’eau, très loin, quelqu’un siffle en retour. Les mêmes notes.)', 4.5); }, 2600);
    }
  },
  charger() {
    const w = this.W();
    if (!w || !w.peuples) return;
    this.pe(); this.indexer(); this.maj(true);
    c2DesIles(w);
    c2Routine.cache = null;
    if (this.branche) return;
    this.branche = true;
    // (game n'existe qu'une fois tout chargé) : on ne siffle pas sur l'eau
    if (typeof game !== 'undefined' && game.whistle) {
      const _wh = game.whistle.bind(game);
      game.whistle = function () { const r = _wh(); try { carte2.peuples.siffle(); } catch (e) { console.error(e); } return r; };
    }
  },
};

// ---------------------------------------------------------------- leurs journées
function c2Routine(n) {
  const d = n.d, day = farm.s.day, key = d.id + ':' + day;
  const C = c2Routine.cache || (c2Routine.cache = new Map());
  if (C.has(key)) return C.get(key);
  let S = (d.schedule || [[6, 'home']]).map((e) => e.slice());
  const placeA = (h) => { let c = S[S.length - 1][1]; if (h < S[0][0]) return 'home'; for (const [hr, pl] of S) if (h >= hr) c = pl; return c; };
  const put = (h0, h1, pl) => { const apres = placeA(h1); S = S.filter(([hr]) => hr < h0 || hr >= h1); S.push([h0, pl]); if (h1 < 24) S.push([h1, apres]); S.sort((a, b) => a[0] - b[0]); };
  const J = cal.jour(day).cle;
  if (d.area === 'planches' && J === 'morts') put(19.6, 22.4, 'c2:dame');
  if (d.area === 'estive' && J === 'veillee') put(19.5, 23.4, 'c2:feu');
  C.set(key, S);
  if (C.size > 80) C.clear();
  return S;
}
{
  const _rdj = routineDuJour;
  routineDuJour = function (n) { return n && n.d && C2_PEUPLE_IDS.has(n.d.id) && farm.s ? c2Routine(n) : _rdj(n); };
}
// les places : le quai, la Dame, la grève, la jasse, le feu, le pré
function c2Dest(n, k) {
  const w = game.world, P = w.peuples || {}, N = w.nav.nodes, h = npcs.hour();
  const noeud = (tag) => { for (let i = 0; i < N.length; i++) if (N[i].tag === tag && !N[i].iso) return i; return -1; };
  const rang = Math.max(0, C2_HABITANTS.findIndex((d) => d.id === n.d.id) % 3);
  const libre = (x0, z0, r) => { for (let t = 0; t < 12; t++) { const a = Math.random() * TAU, rr = r * Math.sqrt(Math.random()), x = x0 + Math.cos(a) * rr, z = z0 + Math.sin(a) * rr; if (pointFree(w, x, z, 0.45)) return [x, z]; } return [x0, z0]; };
  const pl = P.planches, es = P.estive;
  if (k === 'quai' && pl) return { node: noeud('planches:quai'), x: pl.XJ + 0.45, z: pl.ZQ + 8 + rang * 2.4, y: pl.deck, r: -Math.PI / 2, pose: 'work' };
  if (k === 'dame' && pl) return { node: noeud('planches:quai'), x: pl.XJ + (rang - 1) * 0.6, z: pl.ZQ + 1.4 + rang * 0.9, y: pl.deck, r: Math.PI, pose: null };
  if (k === 'greve' && pl) {
    if (h >= 18 && pl.bancs[rang]) { const [x, z, r] = pl.bancs[rang]; return { node: noeud('village:planches'), x, z, r, pose: 'sit', seat: true }; }
    const [x0, z0, x1, z1] = pl.greveBox, [x, z] = libre((x0 + x1) / 2 + (rang - 1) * 12, (z0 + z1) / 2, 7);
    return { node: noeud('village:planches'), x, z, pose: n.d.id === 'planches_vanniere' ? 'work' : null };
  }
  if (k === 'jasse' && es) { const J = es.jasse, [x, z] = libre(J.x + (rang - 1) * 2.5, J.z - J.hz - 1.6, 1.2); return { node: noeud('estive:jasse'), x, z, r: 0, pose: 'work' }; }
  if (k === 'feu' && es) { const b = es.bancs[rang] || es.bancs[0]; return { node: noeud('village:estive'), x: b[0], z: b[1], r: b[2], pose: 'sit', seat: true }; }
  if (k === 'pre' && es) { const [x, z] = libre(es.pre[0], es.pre[1], 6); return { node: noeud('estive:pre'), x, z, pose: null }; }
  return null;
}
{
  const _dest = npcs.dest.bind(npcs);
  npcs.dest = function (n, pl, sleep) {
    if (typeof pl === 'string' && pl.startsWith('c2:')) {
      try { const D = c2Dest(n, pl.slice(3)); if (D && D.node >= 0) return D; } catch (e) { console.error('carte2 peuples', e); }
      pl = 'home';
    }
    return _dest(n, pl, sleep);
  };
}
// ils ne descendent pas à la messe de la ville (la Dame aux Planches ; à l'estive, on prie en patois, sur place)
if (typeof massGoer === 'function') {
  const _mg = massGoer;
  massGoer = function (n) { return n && C2_PEUPLE_IDS.has(n.id) ? false : _mg(n); };
}
// sans leurs maisons (une vallée d'avant la vallée dessinée), ils ne sont pas là
{
  const _init = npcs.init.bind(npcs);
  npcs.init = function (w, s) {
    const sans = C2_HABITANTS.filter((d) => !(w && w.bld && w.bld[d.home]));
    if (!sans.length) return _init(w, s);
    const retires = [];
    for (const d of sans) { const i = NPC_DATA.indexOf(d); if (i >= 0) retires.push([i, NPC_DATA.splice(i, 1)[0]]); }
    try { return _init(w, s); } finally { for (const [i, d] of retires.reverse()) NPC_DATA.splice(i, 0, d); }
  };
}
// l'objet à retrouver pour le baïle : une sonnaille, dans l'herbe de la crête
{
  const _sf = quests.spawnFind.bind(quests);
  quests.spawnFind = function (q, Q) {
    _sf(q, Q);
    if (q && q.objet === 'sonnaille_noire') { const p = game.world.props.find((x) => x.questFind === q.id); if (p) { p.id = 'c2_sonnailles'; p.data = { v: 3 }; farm.dirtyProps = true; } }
  };
}

// ---------------------------------------------------------------- la société : deux villages de plus
if (typeof SOC_VILLAGES !== 'undefined' && typeof societe !== 'undefined') {
  for (const v of ['planches', 'estive']) if (!SOC_VILLAGES.includes(v)) SOC_VILLAGES.push(v);
  const _vd = societe.villageDe.bind(societe), _ce = societe.centre.bind(societe), _nom = societe.nom.bind(societe), _nomA = societe.nomA.bind(societe);
  societe.villageDe = function (id) { const d = NPC_BY_ID[id]; if (d && (d.area === 'planches' || d.area === 'estive')) return d.area; return _vd(id); };
  societe.centre = function (v) {
    if (v === 'planches' || v === 'estive') { const L = game.world && game.world.lm[v]; return L ? { x: L.x, z: L.z, r: 50 } : null; }
    return _ce(v);
  };
  societe.nom = function (v) { return v === 'planches' ? 'les Planches' : v === 'estive' ? 'l’estive du Plan' : _nom(v); };
  societe.nomA = function (v) { return v === 'planches' ? 'aux Planches' : v === 'estive' ? 'à l’estive' : _nomA(v); };
  // le bruit court : le passeur le porte à la ville (et le rapporte), le col le monte à l'estive, lentement
  HOOKS.day.push(() => {
    try {
      if (!farm.s || !game.world || !game.world.peuples) return;
      const d = farm.s.day, vivant = (id) => npcs.alive(id) && !npcs.byId[id].st.malade;
      for (const C of societe.actifs()) {
        const lien = (a, b, k) => { if (societe.connuDepuis(C, a, k)) societe.apprendre(C, b, d); if (societe.connuDepuis(C, b, k)) societe.apprendre(C, a, d); };
        if (vivant('planches_passeur')) lien('planches', 'valbrume', 1);
        if (vivant('estive_baile') || vivant('estive_patre')) lien('estive', 'valbrume', 3);
        if (vivant('estive_fromagere') && cal.is('lessive', d - 1)) lien('estive', 'planches', 0);
      }
    } catch (e) { console.error('carte2 société', e); }
  });
}

// ---------------------------------------------------------------- les paroles entendues, les leçons (rares)
{
  const _view = talk.view.bind(talk);
  talk.view = function (text, options, raw) {
    const r = _view(text, options, raw);
    try { if (this.n && C2_PEUPLE_IDS.has(this.n.id) && r && r.text) carte2.peuples.entendre(this.n.d.area, r.text); } catch (e) { console.error(e); }
    return r;
  };
  const _say = npcs.say.bind(npcs);
  npcs.say = function (n, text, dur) {
    _say(n, text, dur);
    try { if (n && C2_PEUPLE_IDS.has(n.id) && n.bubble) carte2.peuples.entendre(n.d.area, n.bubble); } catch (e) { console.error(e); }
  };
  const _opts = talk.options.bind(talk);
  talk.options = function () {
    const opts = _opts();
    try {
      const n = this.n;
      if (n && farm.s && C2_PEUPLE_IDS.has(n.id) && !npcs.murdererKnown()) {
        const extra = carte2.peuples.options(n);
        if (extra.length) { const i = opts.findIndex((o) => o.act === 'bye'); opts.splice(i >= 0 ? i : opts.length, 0, ...extra); }
      }
    } catch (e) { console.error(e); }
    return opts;
  };
  const _choose = talk.choose.bind(talk);
  talk.choose = function (act) {
    if (typeof act === 'string' && act.startsWith('c2p:') && this.n) { try { return carte2.peuples.choisir(this, this.n, act); } catch (e) { console.error(e); return this.view('…', this.options()); } }
    return _choose(act);
  };
  const _og = langues.ongletHTML.bind(langues);
  langues.ongletHTML = function () { let h = _og(); try { carte2.peuples.style(); h += carte2.peuples.ongletHTML(); } catch (e) { console.error(e); } return h; };
  const _lo = langues.lierOnglet.bind(langues);
  langues.lierOnglet = function () { _lo(); try { carte2.peuples.lierOnglet(); } catch (e) { console.error(e); } };
}

HOOKS.inter.c2p = (it) => carte2.peuples.agir(it);
HOOKS.interVis.c2p = (it) => carte2.peuples.visible(it);
HOOKS.load.push(() => { try { carte2.peuples.charger(); } catch (e) { console.error('carte2 peuples', e); } });
HOOKS.day.push(() => { c2Routine.cache = null; });
{
  let t = 0;
  HOOKS.update.push((dt, eye, basis, sky, playing) => {
    if (!farm.s || !game.world || !game.world.peuples || !carte2.peuples.props) return;
    t -= dt;
    if (t > 0) return;
    const pas = 1 - t;
    t = 1;
    try { carte2.peuples.maj(); if (playing !== false) carte2.peuples.coutumes(pas); } catch (e) { console.error('carte2 peuples', e); }
  });
}
