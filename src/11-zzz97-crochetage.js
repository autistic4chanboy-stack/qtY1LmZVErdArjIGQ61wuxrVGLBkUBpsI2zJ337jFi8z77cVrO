// ============================================================================
//  CROCHETER — et la POTERNE
//  - Un jeu de crochets (objet : le colporteur, le forgeron ; fabricable à
//    l'établi, recette à découvrir). E sur une porte fermée à clé : « Frapper »
//    ou « Crocheter ». Petit jeu d'adresse : les goupilles montent et descendent,
//    on cale chacune quand elle affleure la ligne (Espace, E ou clic) ; plus la
//    serrure est bonne, plus il y en a et plus elles vont vite. Un raté fait du
//    bruit, peut faire retomber la goupille d'avant, peut casser un crochet
//    (quatre par jeu). Le bruit peut réveiller l'habitant ; un passant peut
//    vous voir. Réussi : la porte s'ouvre. Vu ou pris : crime « effraction »
//    (societe.crime), mentalité en baisse. Fatigué ou ivre, les mains tremblent.
//  - La poterne, dans le rempart est : elle s'ouvre de l'intérieur seulement
//    (on sort de la ville même ponts levés), se referme derrière soi ; dehors,
//    ni serrure ni poignée : on ne l'ouvre pas, on ne la crochète pas. On
//    descend dans les douves, on remonte par les échelles.
//  - De l'intérieur d'une maison, une porte fermée à clé s'ouvre (le verrou).
//  État : farm.s.crochet = { casses, reussis, rates, pris }.
//  API : crochetage.tenter({ difficulte (1..5), bruit (×), x, z, proprietaire
//        (id d'habitant ou null), titre?, crime? }) → Promise<boolean> ;
//        crochetage.porte(dr), crochetage.jeu (partie en cours), poterne.
// ============================================================================
defItem('crochets', 'Jeu de crochets', 'outil', 60, ['cle', '#b0b4bc'], { desc: 'Des tiges d’acier recourbées et une clé de tension, roulées dans un cuir. E sur une porte fermée à clé : « Crocheter ». Quatre crochets par jeu ; ils cassent.' });
RECIPES.push({ out: 'crochets', n: 1, need: { lingot_fer: 1, cuir: 1 }, st: 'etabli' });
{
  const D = (id) => NPC_DATA.find((d) => d.id === id);
  const c = D('colporteur'), f = D('forgeron');
  if (c && c.shop) c.shop.sells.push(['crochets', 55]);
  if (f && f.shop) f.shop.sells.push(['crochets', 75]);
}
if (typeof CRIME_DEF !== 'undefined') {
  // (l'effraction pèse un vol ; entrer chez quelqu'un sans rien forcer, une petite amende)
  if (!CRIME_DEF.effraction) CRIME_DEF.effraction = { prime: 150, grav: 2, oubli: 6, violent: false };
  if (!CRIME_DEF.intrusion) CRIME_DEF.intrusion = { prime: 60, grav: 1, oubli: 3, violent: false };
  if (typeof PRISON_PEINE !== 'undefined') { PRISON_PEINE.effraction = PRISON_PEINE.effraction || 1; PRISON_PEINE.intrusion = PRISON_PEINE.intrusion || 1; }
  const _lib = societe.libelle.bind(societe);
  societe.libelle = function (C) {
    if (C && (C.type === 'effraction' || C.type === 'intrusion')) {
      const nm = C.victime ? this.nomComplet(C.victime) : null;
      return C.type === 'effraction' ? (nm ? `une effraction chez ${nm}` : 'une effraction') : (nm ? `une intrusion chez ${nm}` : 'une intrusion');
    }
    return _lib(C);
  };
}
Object.assign(SoundEngine.prototype, {
  crocCale() { if (!this.ok) return; const t = this.at(); this.tone(t, 'square', 2300, 1700, 0.018, 0.025); this.noiseHit(t + 0.01, 0.02, 'bandpass', 3800, 3, 0.03); },
  crocRate() { if (!this.ok) return; const t = this.at(); for (let i = 0; i < 4; i++) this.noiseHit(t + i * 0.05, 0.06, 'bandpass', 2600 - i * 200, 4, 0.05); this.tone(t, 'square', 700, 520, 0.05, 0.02); },
  crocCasse() { if (!this.ok) return; const t = this.at(); this.tone(t, 'square', 3100, 900, 0.03, 0.06); this.noiseHit(t, 0.05, 'highpass', 3000, 1, 0.08); this.tone(t + 0.12, 'triangle', 1900, 1900, 0.08, 0.02); },
});
const CROC_PINS = [2, 3, 4, 5, 6], CROC_ZONE = [0.17, 0.14, 0.115, 0.095, 0.08], CROC_VIT = [0.55, 0.7, 0.85, 1.0, 1.2], CROC_CASSE = [0.06, 0.1, 0.14, 0.2, 0.26];
const CROC_SERRURE = ['une serrure de rien du tout', 'une serrure simple', 'une bonne serrure', 'une serrure solide, bien huilée', 'une serrure de maître'];

const crochetage = {
  jeu: null,
  S() { const s = farm.s; if (!s) return null; return s.crochet || (s.crochet = { casses: 0, reussis: 0, rates: 0, pris: 0 }); },
  // crochets qui restent dans le jeu entamé (et jeux entiers en réserve)
  restants() { const S = this.S(); return farm.count('crochets') ? 4 - (S.casses || 0) + (farm.count('crochets') - 1) * 4 : 0; },

  // ------------------------------------------------------------------ l'API
  tenter(o) {
    o = o || {};
    if (this.jeu || !farm.s) return Promise.resolve(false);
    if (!farm.count('crochets')) { ui.subtitle('', '(Il vous faudrait un jeu de crochets. Le colporteur en a, dit-on. Le forgeron aussi, sous le comptoir.)', 4); return Promise.resolve(false); }
    const d = clamp(Math.round(o.difficulte || 2), 1, 5);
    return new Promise((res) => this.ouvrir(o, d, res));
  },
  ouvrir(o, d, res) {
    const p = game.player, x = o.x ?? p.pos[0], z = o.z ?? p.pos[2];
    // les mains tremblent : fatigue, alcool
    let k = 1;
    if (typeof sommeil !== 'undefined') k *= 1 - 0.35 * sommeil.k();
    try { if (typeof alcool !== 'undefined' && alcool.S() && alcool.S().g > 1) k *= 0.8; } catch (e) { /* rien */ }
    const pins = [];
    for (let i = 0; i < CROC_PINS[d - 1]; i++) pins.push({ v: CROC_VIT[d - 1] * (0.75 + Math.random() * 0.5), ph: Math.random(), ok: false, pos: 0.5 });
    this.jeu = { o, d, x, z, res, pins, i: 0, t: 0, bruit: 0, zone: CROC_ZONE[d - 1] * k, tremble: 1 - k, fini: false, finT: 0, issue: false, veilleT: 0, msg: '', msgT: 0,
      temoins: npcs.witnesses(x, z).filter((m) => m.id !== o.proprietaire || !m.sleep).map((m) => m.id) };
    this.panneau(o.titre || 'Crocheter la serrure');
  },
  panneau(titre) {
    if (!$('#crochetage')) {
      const d = document.createElement('div'); d.id = 'crochetage'; d.className = 'pp-panel'; $('#paper').appendChild(d);
      const st = document.createElement('style'); st.id = 'crochetage-css';
      st.textContent = '#crochetage{width:min(560px,calc(100vw - 24px))}#crochetage canvas{display:block;width:480px;max-width:100%;height:auto;aspect-ratio:16/9;image-rendering:pixelated;margin:8px auto 6px;cursor:pointer;border-radius:3px;box-shadow:inset 0 0 0 1px rgba(60,40,20,.4)}#crochetage .croc-l{display:flex;justify-content:space-between;font-size:14px;color:#5a4a36;margin:0 4px 6px}#crochetage .opts{display:flex;gap:10px;justify-content:center;margin-top:6px}#crochetage .opts button{background:rgba(255,255,255,.35);border:1px solid rgba(90,70,40,.35);border-radius:4px;padding:5px 14px;font-size:15px;color:#3d2e1c}#crochetage .croc-m{text-align:center;min-height:20px;font-style:italic;color:#6a3a22}';
      document.head.appendChild(st);
    }
    ui.open('#crochetage', `<div class="tabs"><b>${esc(titre)}</b><button class="x" data-close>✕</button></div>
      <div class="body"><canvas width="160" height="90"></canvas>
      <div class="croc-l"><span class="croc-e"></span><span class="croc-c"></span></div>
      <div class="croc-m"></div>
      <div class="hint">Calez chaque goupille quand elle affleure la ligne dorée : Espace, E ou clic. Un raté fait du bruit.</div>
      <div class="opts"><button data-croc="caler">Caler la goupille</button><button data-croc="stop">Renoncer</button></div></div>`);
    $('#crochetage [data-close]').onclick = () => ui.close();
    $('#crochetage [data-croc="caler"]').onclick = () => this.caler();
    $('#crochetage [data-croc="stop"]').onclick = () => ui.close();
    $('#crochetage canvas').onclick = () => this.caler();
    this.dessiner();
  },
  // position de la goupille en cours (0..1, dent de scie adoucie), et la zone
  posPin(P, t) { const u = (P.v * t + P.ph) % 1, tri = u < 0.5 ? u * 2 : 2 - u * 2; return tri; },
  dansZone() { const J = this.jeu; if (!J || J.fini) return false; const P = J.pins[J.i]; return Math.abs(P.pos - 0.5) < J.zone; },
  caler() {
    const J = this.jeu;
    if (!J || J.fini) return;
    const P = J.pins[J.i];
    if (Math.abs(P.pos - 0.5) < J.zone) {
      P.ok = true; P.pos = 0.5; J.i++; sound.crocCale && sound.crocCale();
      this.bruit(0.15);
      if (J.i >= J.pins.length) this.finir(true, 'La serrure cède.');
      return;
    }
    // raté : bruit, goupille d'avant qui retombe, crochet qui casse
    sound.crocRate && sound.crocRate();
    J.msg = pick(['Le crochet ripe.', 'Trop tôt.', 'Trop tard.', 'Ça accroche, puis plus rien.']); J.msgT = 1.4;
    this.S().rates++;
    this.bruit(1);
    if (J.d >= 3 && J.i > 0 && Math.random() < [0, 0, 0.5, 0.65, 0.8][J.d - 1]) { J.i--; J.pins[J.i].ok = false; J.msg = 'Une goupille retombe.'; }
    if (Math.random() < CROC_CASSE[J.d - 1]) {
      const S = this.S();
      sound.crocCasse && sound.crocCasse();
      this.bruit(0.8);
      S.casses = (S.casses || 0) + 1; J.msg = 'Le crochet casse net.';
      if (S.casses >= 4) { S.casses = 0; farm.take('crochets', 1); if (!farm.count('crochets')) { this.finir(false, 'Votre dernier crochet vient de casser.'); return; } J.msg = 'Le dernier crochet du jeu casse : vous en ouvrez un autre.'; }
    }
  },
  // un bruit : qui l'entend ?
  bruit(b) {
    const J = this.jeu;
    if (!J || J.fini) return;
    b *= J.o.bruit ?? 1;
    J.bruit += b;
    if (b < 0.3) return;
    for (const m of npcs.list) {
      if (!m.st.alive || m.vanished || m.hunting || m.state === 'gone') continue;
      const dd = Math.hypot(m.x - J.x, m.z - J.z);
      if (dd > 14) continue;
      const dort = m.state === 'sleep' || m.sleep, chezLui = m.id === J.o.proprietaire || dd < 5;
      const pch = dort ? (chezLui ? 0.11 : 0.04) * b : m.inside ? (chezLui ? 0.35 : 0.06) * b : dd < 9 ? 0.5 * b : 0.15 * b;
      if (Math.random() < pch) { this.pris(m, dort); return; }
    }
  },
  pris(m, dormait) {
    const J = this.jeu;
    if (!J || J.fini) return;
    npcs.say(m, dormait ? pick(['Hein ?! … Qui est là ?! Au voleur !', 'Qu’est-ce que… Qui touche à ma porte ?! Au voleur !']) : pick(['Hé ! Vous, là ! Qu’est-ce que vous fabriquez à cette porte ?', 'Au voleur ! Il force la porte !', 'Je vous vois ! Lâchez cette serrure !']), 3.5);
    if (!dormait) m.fleeT = Math.max(m.fleeT || 0, 3);
    this.S().pris++;
    const crime = J.o.crime === undefined ? 'effraction' : J.o.crime;
    try { if (crime && typeof societe !== 'undefined' && societe.crime && CRIME_DEF[crime]) societe.crime({ type: crime, victime: J.o.proprietaire || null, x: J.x, z: J.z, temoins: [m.id] }); } catch (e) { console.error(e); }
    if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-3, 'effraction', 6);
    npcs.remember(m, 'effraction');
    this.finir(false, dormait ? 'Une lumière s’allume derrière la porte.' : 'On vous a vu.');
  },
  finir(ok, msg) {
    const J = this.jeu;
    if (!J || J.fini) return;
    J.fini = true; J.issue = ok; J.msg = msg || ''; J.msgT = 3; J.finT = ok ? 0.7 : 1.1;
    if (ok) {
      this.S().reussis++;
      sound.lock && sound.lock(false);
      if (J.o.proprietaire && typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-1, 'effraction', 3);
    }
  },
  update(dt) {
    const J = this.jeu;
    if (!J) return;
    // panneau fermé (Échap, croix, autre panneau) : on renonce
    if (ui.panel !== '#crochetage') { if (!J.fini) { J.fini = true; J.issue = false; } this.clore(); return; }
    J.t += dt;
    if (J.msgT > 0) J.msgT -= dt;
    if (J.fini) { J.finT -= dt; this.dessiner(); if (J.finT <= 0) { ui.close(); this.clore(); } return; }
    const P = J.pins[J.i];
    P.pos = this.posPin(P, J.t) + (J.tremble > 0 ? Math.sin(J.t * 23) * 0.03 * J.tremble : 0);
    // un passant voit la scène (moins dans la nuit)
    J.veilleT -= dt;
    if (J.veilleT <= 0) {
      J.veilleT = 0.5;
      const h = npcs.hour(), nuit = h >= 21 || h < 5.5;
      for (const id of J.temoins) {
        const m = npcs.byId[id];
        if (!m || !m.st.alive || m.sleep || m.state === 'sleep') continue;
        const dd = Math.hypot(m.x - J.x, m.z - J.z);
        if (dd > 28 || !(dd < 6 || segClear(game.world, m.x, m.z, J.x, J.z))) continue;
        // (celui qui regarde ailleurs voit moins : de face, de côté, de dos)
        const face = ((J.x - m.x) * Math.sin(m.heading || 0) + (J.z - m.z) * Math.cos(m.heading || 0)) / (dd || 1);
        const k = face > 0.3 ? 1 : face > -0.2 ? 0.5 : 0.2;
        if (Math.random() < (nuit ? 0.03 : 0.12) * (dd < 10 ? 2 : 1) * k) { this.pris(m, false); break; }
      }
    }
    this.dessiner();
  },
  clore() {
    const J = this.jeu;
    this.jeu = null;
    if (J && J.res) J.res(!!J.issue);
  },
  // ------------------------------------------------------------------ le dessin (160 × 90, grossi)
  dessiner() {
    const J = this.jeu, cv = $('#crochetage canvas');
    if (!J || !cv) return;
    const c = cv.getContext('2d'), n = J.pins.length, x0 = 34, x1 = 150, sp = (x1 - x0) / n, yL = 46;
    c.fillStyle = '#17120d'; c.fillRect(0, 0, 160, 90);
    // le barillet, la ligne de rupture
    c.fillStyle = '#6e5424'; c.fillRect(24, 40, 132, 36);
    c.fillStyle = '#8a6a30'; c.fillRect(24, 40, 132, 2);
    c.fillStyle = '#3a2a12'; c.fillRect(24, 60, 132, 7);
    c.fillStyle = '#4a3a2a'; c.fillRect(24, 12, 132, 28);
    const zone = this.dansZone();
    c.fillStyle = zone ? '#b8e07a' : '#d8b24a'; c.fillRect(24, yL, 132, 1);
    // les goupilles : ressort, goupille menante (acier), goupille de clé (laiton)
    for (let i = 0; i < n; i++) {
      const P = J.pins[i], cx = Math.round(x0 + sp * (i + 0.5)) - 3, cur = i === J.i && !J.fini;
      const pos = P.ok ? 0.5 : i === J.i ? P.pos : 0.08;
      const top = Math.round(yL + 1 + (0.5 - pos) * 30); // haut de la goupille de clé (le joint affleure la ligne à 0,5)
      c.fillStyle = '#2a2016'; c.fillRect(cx - 1, 12, 8, 55);
      c.fillStyle = '#8a8a90'; for (let y = 13; y < top - 13; y += 2) c.fillRect(cx + ((y >> 1) & 1 ? 1 : 3), y, 3, 1);
      c.fillStyle = P.ok ? '#d0d4dc' : '#a4a8b0'; c.fillRect(cx, top - 12, 6, 11);
      c.fillStyle = P.ok ? '#f0c860' : cur ? '#d8a848' : '#b08838'; c.fillRect(cx, top, 6, 14); c.fillRect(cx + 1, top + 14, 4, 2);
      if (cur) { c.fillStyle = zone ? '#b8e07a' : '#f4e2a0'; c.fillRect(cx - 2, top - 1, 1, 16); c.fillRect(cx + 7, top - 1, 1, 16); }
    }
    // le crochet, sous la goupille en cours ; la clé de tension
    if (!J.fini || J.issue) {
      const i = Math.min(J.i, n - 1), cx = Math.round(x0 + sp * (i + 0.5));
      c.fillStyle = '#c8ccd4'; c.fillRect(4, 70, cx - 4, 2); c.fillRect(cx - 1, 66, 2, 5);
    }
    c.fillStyle = '#9a9ea8'; c.fillRect(6, 74, 18, 3); c.fillRect(6, 62, 3, 13);
    // le bruit
    c.fillStyle = '#3a2a1a'; c.fillRect(4, 4, 40, 4);
    c.fillStyle = J.bruit > 3 ? '#d05030' : '#c89a40'; c.fillRect(4, 4, Math.min(40, J.bruit * 8), 4);
    const e = $('#crochetage .croc-e'), k = $('#crochetage .croc-c'), m = $('#crochetage .croc-m');
    if (e) e.textContent = `${CROC_SERRURE[J.d - 1].charAt(0).toUpperCase() + CROC_SERRURE[J.d - 1].slice(1)} — goupille ${Math.min(J.i + 1, n)} sur ${n}`;
    if (k) k.textContent = `Crochets : ${this.restants()}`;
    if (m) m.textContent = J.msgT > 0 ? J.msg : '';
  },

  // ------------------------------------------------------------------ les portes
  difficulte(dr) {
    const k = dr.bld || '';
    if (k === 'garde' || k === 'mairie' || k === 'bibliotheque') return 4;
    if (SHOP_DOORS.has(k) || k === 'vide6') return 3;
    if (/^(roulotte|cabane|hutte|source|refuge|relais|ranch|maison_hameau)/.test(k) || k === 'poulailler') return 1;
    return 2;
  },
  habitant(dr) {
    const k = dr.bld;
    if (!k) return null;
    return npcs.list.find((n) => n.d.home === k && n.st.alive && !n.vanished) || npcs.list.find((n) => n.d.work === k && n.st.alive && !n.vanished) || null;
  },
  nomPorte(dr) {
    const k = dr.bld, w = game.world;
    if (typeof LOC_MAISONS !== 'undefined' && LOC_MAISONS[k]) return 'La porte de ' + LOC_MAISONS[k].nom + ', à louer';
    const n = this.habitant(dr);
    if (n && n.st.met) return `La porte de chez ${n.name}`;
    const B = w.bld && w.bld[k];
    if (!(B && B.name && B.name !== k)) return 'Une porte';
    // (de + le = du, de + les = des : « la porte du ranch », pas « de le ranch »)
    return /^le /i.test(B.name) ? 'La porte du ' + B.name.slice(3) : /^les /i.test(B.name) ? 'La porte des ' + B.name.slice(4) : 'La porte de ' + B.name;
  },
  menuPorte(dr, frapper) {
    const d = this.difficulte(dr), a = farm.count('crochets');
    ui.choice(this.nomPorte(dr), `Fermée à clé. Par le trou de la serrure, on devine ${CROC_SERRURE[d - 1]}.`, [
      { label: 'Frapper', fn: () => { ui.close(true); this.frapper(dr, frapper); } },
      { label: a ? 'Crocheter la serrure' : 'Crocheter (il faudrait un jeu de crochets)', fn: () => { ui.close(true); this.porte(dr); } },
      { label: 'Laisser', fn: () => ui.close() },
    ]);
  },
  frapper(dr, frapper) {
    const k = dr.bld;
    const vide = k && !npcs.list.some((n) => n.d.home === k && n.st.alive && !n.vanished) && !dr.scelle;
    frapper(dr);
    if (vide && !strange.redNight()) setTimeout(() => ui.subtitle('', typeof LOC_MAISONS !== 'undefined' && LOC_MAISONS[k] ? '(Personne. Derrière la porte, une maison vide qui attend un locataire.)' : '(Personne ne répond.)', 3), 1600);
  },
  async porte(dr) {
    const n = this.habitant(dr);
    const ok = await this.tenter({ difficulte: this.difficulte(dr), bruit: 1, x: dr.x, z: dr.z, proprietaire: n ? n.id : null, titre: this.nomPorte(dr) });
    if (!ok) return false;
    dr.locked = false; dr.open = 1; dr.playerClosed = false; dr.crocheteT = game.time + 25;
    setTimeout(() => sound.door && sound.door(true), 150);
    ui.subtitle('', '(Un déclic, puis un autre. La porte s’entrouvre sans un bruit.)', 3.5);
    return true;
  },
};

// ============================================================================
//  LA POTERNE
// ============================================================================
const poterne = {
  D() { const w = game.world, P = w && w.poterne; return P ? w.doors[P.door] : null; },
  // > 0 : côté ville ; < 0 : côté douves
  cote(dr) { const p = game.player, c = Math.cos(dr.r), s = Math.sin(dr.r), dx = p.pos[0] - dr.x, dz = p.pos[2] - dr.z; return dx * s + dz * c; },
  utiliser(dr) {
    if (this.cote(dr) < 0) {
      sound.knock && sound.knock(1);
      ui.subtitle('', '(Une porte basse, bardée de fer. De ce côté, ni poignée ni serrure : elle ne s’ouvre que de l’intérieur.)', 4.5);
      return;
    }
    if (dr.open) { dr.open = 0; dr.locked = true; sound.door(false); setTimeout(() => sound.lock && sound.lock(true), 220); return; }
    dr.locked = false; dr.open = 1; sound.lock && sound.lock(false); setTimeout(() => sound.door(true), 150);
    const h = npcs.hour();
    ui.subtitle('', h >= 21 || h < 6 ? '(Vous tirez le gros verrou. La poterne s’ouvre sur la nuit, et sur l’odeur de l’eau des douves.)' : '(Vous tirez le gros verrou. La poterne s’ouvre sur les douves.)', 4);
    if (!farm.s.flags.poterneVue) { farm.s.flags.poterneVue = 1; setTimeout(() => ui.subtitle('', '(Elle se refermera derrière vous. De l’autre côté, il faudra descendre dans l’eau, et remonter par une échelle.)', 5), 4500); }
  },
  // elle se referme derrière soi (et si l'on s'en va sans passer)
  update() {
    const dr = this.D();
    if (!dr || !dr.open) return;
    const p = game.player, lz = this.cote(dr), d = Math.hypot(p.pos[0] - dr.x, p.pos[2] - dr.z);
    if (lz < -1.5 || d > 5) {
      dr.open = 0; dr.locked = true;
      if (lz < 0 && d < 12) {
        setTimeout(() => { sound.door(false); setTimeout(() => sound.lock && sound.lock(true), 350); }, 300);
        ui.subtitle('', '(Derrière vous, la poterne se referme d’elle-même. Un pêne claque, de l’autre côté.)', 4);
      }
    }
  },
};

// ---------------------------------------------------------------- branchements
HOOKS.update.push((dt) => { if (!farm.s || game.kind !== 'farm') return; crochetage.update(dt); poterne.update(); });
HOOKS.death.push(() => { if (crochetage.jeu) { crochetage.jeu.fini = true; crochetage.jeu.issue = false; crochetage.clore(); } return false; });
window.addEventListener('keydown', (e) => {
  if (!crochetage.jeu || ui.panel !== '#crochetage' || e.repeat) return;
  if (e.code === 'Space' || e.code === 'KeyE' || e.code === 'Enter') { e.preventDefault(); crochetage.caler(); }
}, true);
HOOKS.load.push(() => {
  crochetage.jeu = null;
  crochetage.S();
  const P = poterne.D();
  if (P) { P.open = 0; P.a = 0; P.locked = true; }
  if (game._m97) return;
  game._m97 = true;
  // E sur une porte : la poterne ; de l'intérieur, le verrou ; fermée à clé : frapper ou crocheter
  const _ud = game.useDoor.bind(game);
  game.useDoor = function (dr) {
    if (!dr) return;
    if (dr.poterne) return poterne.utiliser(dr);
    if (dr.locked) {
      const k = dr.bld;
      const aMoi = k === 'ferme' || k === 'poulailler' || (typeof locations !== 'undefined' && locations.locataire(k));
      const cle = typeof legendaires !== 'undefined' && legendaires.porte && legendaires.porte('cle_aelim');
      if (!aMoi && !cle) {
        if (k && game.insideBuilding(k)) {
          dr.locked = false; dr.open = 1; dr.crocheteT = game.time + 8;
          sound.lock && sound.lock(false); sound.door(true);
          ui.subtitle('', '(Vous tirez le verrou de l’intérieur.)', 2.5);
          return;
        }
        return crochetage.menuPorte(dr, _ud);
      }
    }
    return _ud(dr);
  };
  // une porte crochetée reste ouverte le temps d'entrer ; la poterne n'obéit qu'à elle-même
  const _doors = npcs.updateDoors.bind(npcs);
  npcs.updateDoors = function (w, instant) {
    const garde = [];
    for (const dr of w.doors) if (dr.crocheteT > game.time) garde.push([dr, dr.open]);
    _doors(w, instant);
    for (const [dr, o] of garde) { dr.locked = false; if (o) dr.open = 1; }
  };
});
