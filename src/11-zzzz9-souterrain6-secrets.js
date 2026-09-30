// ============================================================================
//  LE DESSOUS — ce qui se cache (agent C3)
//  - la Chambre des Gouttes (derrière la chatière) : ceux d'en bas y couchent
//    leurs morts sous la goutte, et la pierre les prend, du plus ancien, qui
//    n'est plus qu'une forme, au dernier, qui porte des bottes. Une perle prise
//    dans leurs vasques, et le hameau vous tourne le dos, jusqu'à ce qu'on la
//    rende (E sur la vasque vide, une perle en poche) ;
//  - le Hoûm, aux Gouffres et à la Salle des Échos : une grande bête pâle,
//    aveugle, qui chasse au bruit (courir, sauter, tirer, casser la roche).
//    Accroupi, sans bouger, on la laisse passer. Elle ne revient pas si on la
//    tue ;
//  - la Ville engloutie : les ruines des Aëlim (murs, colonnes, trois pierres
//    gravées en Hautes Lettres), et leur tombeau, fermé d'une dalle où l'on a
//    taillé un œil : la lumière d'une flamme, portée par une lentille de
//    cristal, l'ouvre. Dedans : un coffre, une tablette.
//  - la lentille de cristal, sur soi, porte plus loin la flamme de la lanterne.
//  État : farm.s.souterrain.x.
// ============================================================================

// ---------------------------------------------------------------- les objets
defItem('dent_houm', 'Dent du Hoûm', 'tresor', 60, ['croc', '#e8e4dc'], { desc: 'Une dent longue comme le doigt, pâle, presque transparente. Au-dessus de la bouche d’où elle vient, il n’y avait pas d’yeux.' });
defItem('miroir_aelim', 'Miroir des Aëlim', 'tresor', 180, ['medaillon', '#d8dce4'], { desc: 'Un disque d’argent poli, grand comme la main, gravé au dos de trois signes : un soleil, trois traits, un rond noir. Il est froid, et il le reste.' });
defItem('tablette_aelim', 'Tablette gravée', 'quete', 0, ['tablette', '#9a9486'], { desc: 'Une tablette de pierre fine couverte de Hautes Lettres, trouvée dans le tombeau de la Ville engloutie. Clic : la lire.' });
Object.assign(ESSENCES, { dent_houm: { mort: 2, ombre: 2, air: 1 } });
// les pierres gravées des Aëlim, sous la terre (les mots sont ceux du lexique)
for (const I of [
  ['a_noth', 'aelin', 'halim na-aelim neth mora , ser fala', 'Les maisons des Aëlim, sous la montagne ; l’eau est tombée.', null],
  ['a_ul', 'aelin', 'ul , vesh sae neth sera', 'Silence : Vesh dort sous le lac.', null],
  ['a_oeil', 'aelin', 'dal na-aelim , mir ael , tora', 'La porte des Aëlim. À l’œil, la lumière : elle s’ouvre.', null],
  ['a_tablette', 'aelin', 'aelim fala , hemim ulen , ael rim neth thal', 'Les Aëlim sont tombés, les hommes se sont tus ; la lumière est gardée sous la pierre.', null],
]) if (!INSCR_BY_ID[I[0]]) { INSCRIPTIONS.push(I); INSCR_BY_ID[I[0]] = { id: I[0], lang: I[1], texte: I[2], sens: I[3], lieu: I[4] }; }

// ---------------------------------------------------------------- génération : les dormeurs, les ruines, le tombeau
SOUT_GEN.push((w, rnd, B) => {
  const S = souterrain;
  S.creuseurs();
  const X = w.soutSecrets = { dormeurs: [] };
  const salle = (k) => SOUT_PLAN.salles.find((q) => q[0] === k);
  // ------------------------------------------------ la Chambre des Gouttes
  const D = salle('dormeurs');
  if (D) {
    const [, cx, cz, rx, rz, rot] = D, co = Math.cos(rot), si = Math.sin(rot);
    const pris = [];
    let n = 0;
    for (let k = 0; k < 400 && n < 15; k++) {
      const a = rnd() * TAU, r = 0.55 + rnd() * 0.3, lx = Math.cos(a) * r * rx, lz = Math.sin(a) * r * rz;
      const x = cx + lx * co + lz * si, z = cz - lx * si + lz * co, f = S.floorAt(x, z);
      if (!S.ouvert(x, z, 1.6) || pris.some(([px, pz]) => Math.hypot(px - x, pz - z) < 2.2)) continue;
      let ok = true;
      for (const d of [-1, 1]) { const f2 = S.floorAt(x + Math.sin(a) * d, z + Math.cos(a) * d); if (Math.abs(f2 - f) > 0.35) ok = false; }
      if (!ok) continue;
      // la tête vers la paroi, les pieds vers le milieu
      const h = Math.atan2(x - cx, z - cz);
      const c = n === 0 ? 0 : n === 14 ? 1 : clamp(n / 13 + (rnd() - 0.5) * 0.15, 0.05, 0.98);
      const data = { c: +c.toFixed(2) };
      if (n === 0) data.b = 1;
      if (n === 5) data.p = 1;
      B.prop('sout_dormeur', x, f, z, h, data, undefined, VER_SOUS);
      X.dormeurs.push([x, f, z]);
      if (n === 0 || n === 5 || n === 14) B.inter('sout_dormeur', 'sout_dormeur_' + n, x, f + 0.45, z, 'Un dormeur', { n });
      pris.push([x, z]); n++;
    }
  }
  // ------------------------------------------------ la Ville engloutie : murs rompus, colonnes, pierres gravées, le tombeau
  const R = salle('ruines');
  if (!R) return;
  const [, rx0, rz0, rrx, rrz, rrot] = R, co = Math.cos(rrot), si = Math.sin(rrot);
  const dans = (u, v) => { const lx = Math.cos(u) * v * rrx, lz = Math.sin(u) * v * rrz; return [rx0 + lx * co + lz * si, rz0 - lx * si + lz * co]; };
  const occ = [];
  const libre = (x, z, r) => !occ.some(([a, b, rr]) => Math.hypot(a - x, b - z) < r + rr);
  const bas = (x, z, r) => { let m = 1e9, M = -1e9; for (let a = 0; a < 8; a++) for (const d of [0, r * 0.5, r]) { const f = S.floorAt(x + Math.cos(a / 8 * TAU) * d, z + Math.sin(a / 8 * TAU) * d); m = Math.min(m, f); M = Math.max(M, f); } return [m, M]; };
  const bloc = (F, lx, ly, lz, sx, sy, sz, m) => { B.block(F, lx, ly, lz, sx, sy, sz, m || M_STONE); const b = w.blocks[w.blocks.length - 1]; b.under = true; b.ver = VER_SOUS; return b; };
  // le tombeau : un endroit assez plat, loin des bords
  let T = null;
  for (let k = 0; k < 300 && !T; k++) {
    const [x, z] = dans(rnd() * TAU, Math.sqrt(rnd()) * 0.6);
    if (!S.ouvert(x, z, 8)) continue;
    const [m, M] = bas(x, z, 5.5);
    if (M - m > 1.6 || m < SOUT_WL + 1) continue;
    let ok = true;
    for (let a = 0; a < 12 && ok; a++) { const xx = x + Math.cos(a / 12 * TAU) * 8, zz = z + Math.sin(a / 12 * TAU) * 8; if (!S.ouvert(xx, zz, 3)) ok = false; }
    if (ok) T = [x, z, m, M];
  }
  if (T) {
    const [x, z, m, M] = T, r = Math.atan2(rx0 - x, rz0 - z) + (rnd() - 0.5) * 0.6; // la porte vers le milieu de la salle
    const F = { x, y: m - 0.6, z, r }, H = M - m + 0.6 + 3.3, sol = M - m + 0.6 + 0.06, Wd = 6.4, Dp = 5.2, t = 0.7;
    bloc(F, 0, 0, 0, Wd, sol, Dp); // le dallage intérieur (et le socle)
    bloc(F, 0, 0, -Dp / 2 + t / 2, Wd, H, t); // le fond
    bloc(F, -Wd / 2 + t / 2, 0, 0, t, H, Dp - 2 * t); bloc(F, Wd / 2 - t / 2, 0, 0, t, H, Dp - 2 * t); // les côtés
    const pw = 1.5, sw = (Wd - pw) / 2;
    bloc(F, -(pw / 2 + sw / 2), 0, Dp / 2 - t / 2, sw, H, t); bloc(F, pw / 2 + sw / 2, 0, Dp / 2 - t / 2, sw, H, t); // la façade
    bloc(F, 0, sol + 2.35, Dp / 2 - t / 2, pw, H - sol - 2.35, t); // au-dessus de la porte
    bloc(F, 0, H, 0, Wd + 0.6, 0.45, Dp + 0.6); bloc(F, 0, H + 0.45, 0, Wd - 0.6, 0.3, Dp - 0.6); // le toit, en deux dalles
    for (const s of [-1, 1]) B.propRel({ x, y: m + sol - 0.6, z, r }, 'sout_colonne', s * 2.2, 0, Dp / 2 + 0.9, 0, { n: 3, cap: 1 }, undefined, VER_SOUS);
    bloc(F, 0, sol + 2.7, Dp / 2 + 0.9, 5.4, 0.4, 1.0); // le linteau sur les colonnes
    const y0 = m - 0.6 + sol;
    B.propRel({ x, y: y0, z, r }, 'sout_porte_aelim', 0, 0, Dp / 2 - t / 2, 0, { ouverte: false }, undefined, VER_SOUS);
    X.porte = w.props.length - 1;
    const [ix, iz] = B.toWorld({ x, z, r }, 0, Dp / 2 + 0.2);
    B.inter('sout_porte_aelim', 'sout_porte_aelim', ix, y0 + 1.6, iz, 'La dalle', {});
    const [gx, gz] = B.toWorld({ x, z, r }, 1.6, Dp / 2 + 0.05);
    B.inter('inscription', 'ins_a_oeil', gx, y0 + 1.5, gz, 'Lire l’inscription', { ins: 'a_oeil' });
    // dedans : le coffre, la tablette, celui qui dort là
    B.propRel({ x, y: y0, z, r }, 'sout_coffre_aelim', 0, 0, -1.2, 0, { ouvert: false }, undefined, VER_SOUS);
    X.coffre = w.props.length - 1;
    const [cx2, cz2] = B.toWorld({ x, z, r }, 0, -1.2);
    B.inter('sout_coffre_aelim', 'sout_coffre_aelim', cx2, y0 + 0.8, cz2, 'Le coffre', {});
    B.propRel({ x, y: y0, z, r }, 'sout_os', -1.9, 0, 0.2, 1.4, undefined, undefined, VER_SOUS);
    const [tx2, tz2] = B.toWorld({ x, z, r }, 2.0, -0.4);
    B.propRel({ x, y: y0, z, r }, 'sout_tablette', 2.0, 0, -0.4, 0.3, {}, undefined, VER_SOUS);
    X.tabletteProp = w.props.length - 1;
    B.inter('sout_tablette', 'sout_tablette', tx2, y0 + 0.4, tz2, 'Une tablette', {});
    X.tombeau = { x, z, y: y0, r, porte: [ix, iz], tablette: [tx2, y0, tz2] };
    occ.push([x, z, 7]);
    B.landmark('sout_tombeau', x, z, 6, { under: true, secret: true, y: y0, souterrain: true });
  }
  // les pierres gravées
  let ins = 0;
  for (let k = 0; k < 300 && ins < 2; k++) {
    const [x, z] = dans(rnd() * TAU, 0.2 + rnd() * 0.6), [m, M] = bas(x, z, 1.2);
    if (!S.ouvert(x, z, 3) || M - m > 0.7 || m < SOUT_WL + 0.8 || !libre(x, z, 6)) continue;
    const id = ins === 0 ? 'a_noth' : 'a_ul', r = rnd() * TAU;
    B.prop('stele', x, m - 0.1, z, r, { ins: id }, undefined, VER_SOUS);
    B.inter('inscription', 'ins_' + id, x + Math.sin(r) * 0.55, m + 1.1, z + Math.cos(r) * 0.55, 'Lire l’inscription', { ins: id });
    occ.push([x, z, 2]); ins++;
  }
  // colonnes (debout, tombées) et murs rompus
  let nc = 0, nm = 0;
  for (let k = 0; k < 600 && (nc < 14 || nm < 10); k++) {
    const [x, z] = dans(rnd() * TAU, Math.sqrt(rnd()) * 0.85);
    if (!S.ouvert(x, z, 4) || !libre(x, z, 2.5)) continue;
    const [m, M] = bas(x, z, 1.6);
    if (M - m > 1.4 || m < SOUT_WL + 0.4) continue;
    if (nc < 14 && (rnd() < 0.55 || nm >= 10)) {
      const f = rnd() < 0.4;
      B.prop('sout_colonne', x, f ? M - 0.1 : m - 0.15, z, rnd() * TAU, f ? { n: 2 + ((rnd() * 3) | 0), f: 1 } : { n: 1 + ((rnd() * 4) | 0), cap: rnd() < 0.3 ? 1 : 0 }, undefined, VER_SOUS);
      occ.push([x, z, 1.5]); nc++;
    } else if (nm < 10) {
      const r = rnd() * TAU, L = 3 + rnd() * 4, F = { x, y: m - 0.8, z, r };
      const [m2, M2] = bas(x, z, L / 2 + 0.5);
      if (M2 - m2 > 2) continue;
      F.y = m2 - 0.8;
      const nb = 2 + ((rnd() * 3) | 0);
      for (let i = 0; i < nb; i++) { const w0 = L / nb, h = (M2 - m2) + 0.8 + 0.6 + rnd() * 2.2; bloc(F, -L / 2 + w0 * (i + 0.5), 0, 0, w0 + 0.02, h, 0.8, rnd() < 0.3 ? M_MOSSY : M_STONE); }
      occ.push([x, z, L / 2 + 0.8]); nm++;
    }
  }
  X.ruines = { colonnes: nc, murs: nm, steles: ins };
});
LIEU_NAMES.sout_tombeau = 'le tombeau des Aëlim';

// ---------------------------------------------------------------- les gestes : les dormeurs, la perle rendue, la dalle, le coffre, la tablette
const soutSecrets = {
  X() { const S = souterrain.S(); return S.x || (S.x = {}); },
  dormeur(it) {
    const n = it.data && it.data.n;
    const T = { 0: '(Il porte des bottes. Personne, ici, ne porte de bottes.)', 5: '(Un petit. La goutte lui tombe sur le front, toujours au même endroit.)', 14: '(Ce n’est plus qu’une forme sous la pierre, lisse comme une dragée. Une main, peut-être.)' }[n];
    if (T) ui.subtitle('', T, 4.5);
    sound.drip && sound.drip();
  },
  // la perle prise chez les dormeurs : le hameau le sait
  estProfane(q) { return q && q.id === 'sout_vasque' && souterrain.salleIci(q.x, q.z) === 'dormeurs'; },
  // la rendre : E sur la vasque vide, une perle en poche
  cibles(eye, f, cand) {
    if (!souterrain.actif || !farm.count('perle_caverne')) return;
    const w = game.world;
    for (const i of w.soutCueillettes || []) {
      const q = w.props[i];
      if (!q || !q.data || !q.data.pris || !this.estProfane(q)) continue;
      const dx = q.x - eye[0], dy = q.y + 0.2 - eye[1], dz = q.z - eye[2], d = Math.hypot(dx, dy, dz);
      if (d > 2.6) continue;
      if ((dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1) < 0.72) continue;
      cand({ kind: 'hook', sout: q, use: () => this.rendre(q) }, d);
    }
  },
  rendre(q) {
    if (!farm.take('perle_caverne', 1)) return;
    const C = soutCueille.C();
    delete C[q.data.k];
    q.data.pris = false; q.data.lit = undefined;
    farm.dirtyProps = true; game.world.objectsDirty = true;
    sound.drip && sound.drip();
    const T = soutTerres.S();
    if (T.profane) { T.profane = 0; T.rendue = farm.s.day; }
  },
  // la dalle à l'œil : une flamme, portée par une lentille, dans l'œil
  porte() {
    const w = game.world, X = this.X(), q = w.props[w.soutSecrets.porte];
    if (!q) return;
    if (X.porte) { ui.subtitle('', '(La dalle est descendue dans le sol. Il reste une rainure, où l’on pourrait glisser la main.)', 3.5); return; }
    const feu = game.lantern && (farm.count('lanterne') || farm.count('lanterne_aube'));
    if (!feu) { ui.subtitle('', X.vuePorte ? '(La pierre est froide. L’œil taillé au milieu est creux, profond.)' : '(Une dalle, taillée d’un œil. Sous vos doigts, l’œil est creux, et profond.)', 4); X.vuePorte = 1; return; }
    if (!farm.count('lentille_cristal')) { ui.subtitle('', '(La flamme éclaire la dalle. La lumière s’étale, et l’œil reste noir.)', 3.5); return; }
    this.ouvrirPorte(true);
  },
  ouvrirPorte(anim) {
    const w = game.world, X = this.X(), q = w.props[w.soutSecrets.porte];
    if (!q) return;
    if (anim) {
      X.porte = farm.s.day;
      ui.subtitle('', '(Le cristal ramasse la flamme en un point. Le point entre dans l’œil.)', 4);
      if (sound.ok) { const t = sound.at(); sound.tone(t, 'sine', 330, 330, 2.2, 0.05); sound.tone(t + 0.4, 'sine', 495, 495, 2.0, 0.035); sound.noiseHit(t + 1.6, 2.4, 'lowpass', 260, 0.6, 0.16, null, 90); }
      setTimeout(() => { farm.setPropData(q, { ouverte: true }); removePropCollider(w, q); w.grid = null; }, 1800);
    } else { q.data = Object.assign({}, q.data, { ouverte: true }); removePropCollider(w, q); w.grid = null; }
  },
  coffre() {
    const w = game.world, X = this.X(), q = w.props[w.soutSecrets.coffre];
    if (!q) return;
    if (X.coffre) { ui.subtitle('', '(Vide. Le fond est poli, comme par des mains.)', 3); return; }
    X.coffre = farm.s.day;
    farm.setPropData(q, { ouvert: true });
    for (const [id, n] of [['miroir_aelim', 1], ['lingot_argent', 2]]) { farm.give(id, n); play.flyer && play.flyer(id, [q.x, q.y + 0.8, q.z], n); }
    sound.dig && sound.dig(0.5);
  },
  tablette() {
    const X = this.X(), w = game.world, q = w.soutSecrets && w.props[w.soutSecrets.tabletteProp];
    if (X.tablette) { ui.subtitle('', '(Il n’y a plus rien, qu’une trace plus claire dans la poussière.)', 3); return; }
    X.tablette = farm.s.day; farm.give('tablette_aelim', 1); play.flyer && play.flyer('tablette_aelim', game.player.eyePos(), 1);
    if (q) farm.setPropData(q, { pris: true });
    langues.lireInscription('a_tablette');
  },
  // les gouttes, dans la chambre des dormeurs
  sons(dt) {
    if (!souterrain.actif) return;
    this.gT = (this.gT || 0) - dt;
    if (this.gT > 0) return;
    this.gT = 0.5 + Math.random() * 1.6;
    const p = game.player, k = souterrain._salle, S = souterrain;
    if (k === 'dormeurs' || k === 'orgues') sound.drip && sound.drip();
    else if (Math.random() < 0.18) sound.drip && sound.drip(); // ailleurs, une goutte de temps en temps
    // l'eau d'en bas, tout près : un clapotis
    if (sound.ok && Math.random() < 0.5) {
      for (let a = 0; a < 6; a++) {
        const b = a / 6 * TAU + Math.random(), x = p.pos[0] + Math.cos(b) * 9, z = p.pos[2] + Math.sin(b) * 9;
        if (S.floorAt(x, z) < SOUT_WL - 0.4 && S.ouvert(x, z, 1)) { const t = sound.at(), pan = sound.pan(clamp(angDiff(p.yaw + Math.PI, b) / -1.6, -1, 1), sound.amb); sound.noiseHit(t, 0.7, 'lowpass', 420, 0.6, 0.025, pan, 260); break; }
      }
    }
  },
};
HOOKS.inter.sout_dormeur = (it) => soutSecrets.dormeur(it);
HOOKS.inter.sout_porte_aelim = () => soutSecrets.porte();
HOOKS.inter.sout_coffre_aelim = () => soutSecrets.coffre();
HOOKS.inter.sout_tablette = () => soutSecrets.tablette();
HOOKS.target.push((eye, f, cand) => soutSecrets.cibles(eye, f, cand));
HOOKS.update.push((dt) => { if (farm.s) soutSecrets.sons(dt); });
HOOKS.primary.push((eye, basis, held, it, id) => { if (held || id !== 'tablette_aelim') return false; langues.lireInscription('a_tablette'); play.cool = 0.4; return true; });
HOOKS.load.push(() => {
  const w = game.world;
  if (!farm.s || !w || !w.soutSecrets) return;
  const X = soutSecrets.X(), Q = (i) => w.props[i];
  if (X.porte && Q(w.soutSecrets.porte)) soutSecrets.ouvrirPorte(false);
  if (X.coffre && Q(w.soutSecrets.coffre)) Q(w.soutSecrets.coffre).data = Object.assign({}, Q(w.soutSecrets.coffre).data, { ouvert: true });
  if (X.tablette && Q(w.soutSecrets.tabletteProp)) Q(w.soutSecrets.tabletteProp).data = { pris: true };
});
// la perle prise chez les dormeurs
{
  const _pr = soutCueille.prendre.bind(soutCueille);
  soutCueille.prendre = function (q) {
    const avant = q && q.data && q.data.pris;
    const r = _pr(q);
    if (q && !avant && q.data.pris && soutSecrets.estProfane(q)) { const T = soutTerres.S(); T.profane = farm.s.day; }
    return r;
  };
}

// ---------------------------------------------------------------- le Hoûm : il chasse au bruit
const soutHoum = {
  e: null, pts: null,
  rig() {
    const r = quadRig({ col: rgbf('#a6a29a'), body: [0.62, 0.5, 1.9], bodyY: 1.35, bodyTex: TL.skin, leg: [0.12, 1.32], legTex: TL.skin, legIn: 0.12,
      neck: [0, 0.12], neckS: [0.2, 0.2, 0.95], neckO: [0, 0.02, 0.45], headP: [0, 0, 0.9], head: [0.34, 0.24, 0.78], headCol: rgbf('#b0aaa0'), face: TL.blankF, headTex: TL.skin,
      ears: [0.52, 0.34, 0.04], earCol: rgbf('#b89a92'), tail: [0.05, 1.3, 0.05] });
    return rigPlus(r, [
      { name: 'gueule', parent: 'head', p: [0, -0.07, 0.78], s: [0.3, 0.07, 0.05], col: [0.14, 0.05, 0.05], tex: TL.plain },
      { name: 'machoire', parent: 'head', p: [0, -0.13, 0.4], s: [0.28, 0.06, 0.72], col: rgbf('#9a948a'), tex: TL.skin },
      { name: 'dos', parent: 'body', p: [0, 0.27, -0.1], s: [0.26, 0.14, 1.3], col: rgbf('#8e8a82'), tex: TL.skin },
      { name: 'cote1', parent: 'body', p: [0, 0, 0.3], s: [0.66, 0.46, 0.08], col: rgbf('#96928a'), tex: TL.skin },
      { name: 'cote2', parent: 'body', p: [0, 0, 0.05], s: [0.66, 0.46, 0.08], col: rgbf('#96928a'), tex: TL.skin },
      { name: 'cote3', parent: 'body', p: [0, 0, -0.2], s: [0.66, 0.46, 0.08], col: rgbf('#96928a'), tex: TL.skin },
    ]);
  },
  // le territoire : les Gouffres, la Salle des Échos, la galerie entre les deux
  points() {
    if (this.pts) return this.pts;
    const S = souterrain, P = [], rnd = mulberry32(0x50b7a0a0);
    for (const k of ['gouffres', 'echos']) {
      const Q = SOUT_PLAN.salles.find((q) => q[0] === k);
      if (!Q) continue;
      const [, cx, cz, rx, rz, rot] = Q, co = Math.cos(rot), si = Math.sin(rot);
      for (let i = 0; i < 160 && P.length < (k === 'gouffres' ? 16 : 26); i++) {
        const a = rnd() * TAU, r = Math.sqrt(rnd()) * 0.85, lx = Math.cos(a) * r * rx, lz = Math.sin(a) * r * rz, x = cx + lx * co + lz * si, z = cz - lx * si + lz * co;
        if (S.ouvert(x, z, 3.2) && S.floorAt(x, z) > -86 && this.sur(x, z)) P.push([x, z]);
      }
    }
    const g = SOUT_PLAN.galeries.find((q) => q[0] === 'vers_echos');
    if (g) for (const q of g[1]) if (S.ouvert(q[0], q[1], 3)) P.push([q[0], q[1]]);
    return (this.pts = P);
  },
  // un sol sûr (pas au bord d'un gouffre)
  sur(x, z) { const S = souterrain, f = S.floorAt(x, z); for (let a = 0; a < 6; a++) { const b = a / 6 * TAU; if (S.floorAt(x + Math.cos(b) * 2.5, z + Math.sin(b) * 2.5) < f - 3) return false; } return true; },
  territoire(x, z) {
    const g = SOUT_PLAN.salles.find((q) => q[0] === 'gouffres'), e = SOUT_PLAN.salles.find((q) => q[0] === 'echos');
    return (g && Math.hypot(x - g[1], z - g[2]) < 85) || (e && Math.hypot(x - e[1], z - e[2]) < 55) || (x > 2280 && x < 2370 && z > 1690 && z < 1760);
  },
  naitre() {
    const P = this.points();
    if (!P.length) return;
    const X = soutSecrets.X();
    if (X.houmMort) return;
    const e = P[P.length > 20 ? 20 : 0];
    this.e = { houm: true, sout: true, x: e[0], z: e[1], y: souterrain.floorAt(e[0], e[1]), heading: 0, etat: 'rode', t: 0, timer: 2, move: 0, phase: 0, hp: 140, but: null, rig: this.rig(), respT: 3, lastB: souterrain.bruitN };
  },
  update(dt, playing) {
    if (!souterrain.actif || !farm.s) { this.e = null; return; }
    const p = game.player;
    const pres = this.territoire(p.pos[0], p.pos[2]);
    if (!this.e) { if (pres) this.naitre(); return; }
    const e = this.e;
    if (e.mort) { e.mortT += dt; return; }
    if (!playing) return;
    e.t += dt; e.hurtT = Math.max(0, (e.hurtT || 0) - dt);
    const S = souterrain, dx = p.pos[0] - e.x, dz = p.pos[2] - e.z, d = Math.hypot(dx, dz), dy = Math.abs(p.pos[1] - e.y);
    e.dist = d;
    if (d > 150 && !pres) { this.e = null; return; }
    // entendre : les bruits récents (courir, sauter, tirer, casser)
    for (const [, x, z, k, n] of S.bruits) {
      if (n <= e.lastB) continue;
      const dd = Math.hypot(x - e.x, z - e.z);
      if (dd < k * 24 && this.territoire(x, z) && e.etat !== 'repu') { e.but = [x, z]; e.etat = k >= 1 ? 'chasse' : e.etat === 'chasse' ? 'chasse' : 'ecoute'; e.timer = k >= 1 ? 8 : 4; if (e.etat === 'chasse' && game.time - (e.criT || -99) > 6) { e.criT = game.time; this.son('grogne', e); } }
    }
    e.lastB = S.bruitN;
    // tout près : il sent qui bouge
    const coi = p.crouch > 0.5 && Math.hypot(p.vel[0], p.vel[2]) < 0.4, bouge = !coi && Math.hypot(p.vel[0], p.vel[2]) > 0.7;
    if (d < 1.9 && dy < 2.5 && e.etat !== 'repu' && (bouge || (e.etat === 'chasse' && !coi) || d < 0.75)) { this.mordre(e, p); return; }
    // le souffle, les pas
    e.respT -= dt;
    if (e.respT <= 0) { e.respT = e.etat === 'chasse' ? 1.6 : 3 + Math.random() * 3; if (d < 70) this.son('souffle', e); }
    // un pas vers (x, z) ; s'il bute (paroi, bord d'un gouffre, hors de son domaine), il essaie de biais
    // (qui se tient accroupi sans bouger, il le contourne en reniflant)
    const libre = (h, L) => { const nx = e.x + Math.sin(h) * L, nz = e.z + Math.cos(h) * L, f = S.floorAt(nx, nz); if (coi && Math.hypot(nx - p.pos[0], nz - p.pos[2]) < 1.5) return false; return S.ouvert(nx, nz, 2.2) && Math.abs(f - e.y) < L * 0.9 + 0.3 && this.sur(nx, nz) && this.territoire(nx, nz); };
    const aller = (x, z, v) => {
      const a = Math.atan2(x - e.x, z - e.z);
      let h = null;
      for (const o of [0, 0.45, -0.45, 0.9, -0.9, 1.4, -1.4, 2.0, -2.0]) if (libre(a + o * (e.cote || 1), 1.6)) { h = a + o * (e.cote || 1); break; }
      if (h === null) { e.cote = -(e.cote || 1); e.move = 0; return false; }
      e.heading = turnToward(e.heading, h, dt * 6);
      const nx = e.x + Math.sin(e.heading) * v * dt, nz = e.z + Math.cos(e.heading) * v * dt, f = S.floorAt(nx, nz);
      if (!S.ouvert(nx, nz, 2.2) || Math.abs(f - e.y) > 1.1) { e.move = 0; return false; }
      e.x = nx; e.z = nz; e.y = f; e.move = Math.min(1, v / 3); e.phase += dt * v * 1.6;
      e.pasT = (e.pasT || 0) - dt * v;
      if (e.pasT <= 0) { e.pasT = 1.4; if (d < 40) this.son('pas', e); }
      return Math.hypot(x - e.x, z - e.z) < 1.2;
    };
    e.timer -= dt;
    switch (e.etat) {
      case 'chasse': if (!e.but || aller(e.but[0], e.but[1], 5.2) || e.timer <= 0) { e.etat = 'fouille'; e.timer = 7; } break;
      case 'ecoute': e.move = 0; if (e.but) e.heading = turnToward(e.heading, Math.atan2(e.but[0] - e.x, e.but[1] - e.z), dt * 2); if (e.timer <= 0) { e.etat = 'fouille'; e.timer = 5; } break;
      case 'fouille': if (e.but) aller(e.but[0] + Math.sin(e.t) * 2, e.but[1] + Math.cos(e.t * 0.8) * 2, 1.2); if (Math.random() < dt * 0.6) this.son('renifle', e); if (e.timer <= 0) { e.etat = 'rode'; e.but = null; } break;
      case 'repu': { const P = this.points(), q = P[P.length - 1] || [e.x, e.z]; if (aller(q[0], q[1], 2.5) || e.timer <= 0) { e.etat = 'rode'; e.but = null; } break; }
      default: {
        if (!e.but || e.timer <= 0) { const P = this.points(); e.but = P[(Math.random() * P.length) | 0]; e.timer = 25; }
        if (e.but && aller(e.but[0], e.but[1], 1.3)) { e.but = null; e.timer = 2 + Math.random() * 4; }
      }
    }
  },
  mordre(e, p) {
    if (e.atkT && game.time - e.atkT < 2.5) return;
    e.atkT = game.time;
    this.son('cri', e);
    play.hurt(28, e, 'Pris par le Hoûm, dans le noir');
    const a = Math.atan2(p.pos[0] - e.x, p.pos[2] - e.z);
    p.vel[0] += Math.sin(a) * 7; p.vel[2] += Math.cos(a) * 7; p.vel[1] = Math.max(p.vel[1], 4);
    if (!soutSecrets.X().houmVu) { soutSecrets.X().houmVu = farm.s.day; setTimeout(() => ui.subtitle('', '(Pas d’yeux. Une bouche, et deux grandes oreilles de peau qui tremblaient.)', 4.5), 900); }
    e.etat = 'repu'; e.timer = 40;
  },
  son(k, e) {
    if (!sound.ok) return;
    const p = game.player, d = Math.hypot(e.x - p.pos[0], e.z - p.pos[2]), vol = clamp(1 - d / 60, 0.05, 1), t = sound.at();
    const pan = sound.pan(clamp(angDiff(p.yaw + Math.PI, Math.atan2(e.x - p.pos[0], e.z - p.pos[2])) / -1.6, -1, 1), sound.amb);
    if (k === 'souffle') { sound.tone(t, 'sine', 70, 52, 1.2, 0.16 * vol, pan, 0.25); sound.noiseHit(t, 1.1, 'lowpass', 240, 0.7, 0.05 * vol, pan); }
    else if (k === 'pas') { sound.tone(t, 'sine', 80, 45, 0.16, 0.12 * vol, pan); }
    else if (k === 'renifle') { for (let i = 0; i < 3; i++) sound.noiseHit(t + i * 0.12, 0.08, 'highpass', 2200, 1, 0.05 * vol, pan); }
    else if (k === 'grogne') { sound.voice(t, 'sawtooth', 90, 60, 0.9, 0.05 * vol, pan, { lp: 500, vib: 9, vibDepth: 8 }); }
    else if (k === 'cri') { sound.voice(t, 'sawtooth', 420, 140, 0.8, 0.12, sound.sfx || pan, { lp: 1800, vib: 13, vibDepth: 40 }); sound.noiseHit(t, 0.5, 'bandpass', 900, 1, 0.12); }
  },
  dessiner(buf, sbuf, cam, t) {
    const e = this.e;
    if (!e || !souterrain.actif) return;
    const r = e.rig;
    poseQuad(r, { move: e.move, phase: e.phase, run: e.etat === 'chasse', t, lookP: e.etat === 'ecoute' ? 0.62 : e.etat === 'chasse' ? 0.85 : 1.05 + Math.sin(t * 1.3) * 0.1 });
    const oe = e.etat === 'ecoute' ? 1.35 : 0.95 + Math.sin(t * 4) * 0.08;
    r.set('earL', 0, 0.2, -oe); r.set('earR', 0, -0.2, oe);
    const fl = e.hurtT > 0 || (game.target && game.target.houm === e) ? FX_HI : 0;
    if (e.mort) { const M = e._M || (e._M = [new Float32Array(12), new Float32Array(12), new Float32Array(12)]); m34Root(M[0], e.x, e.y + 0.3, e.z, e.heading, 1); m34TR(M[1], 0, 0, 0, 0, 0, Math.PI / 2); m34Mul(M[2], M[0], M[1]); drawRigM(buf, r, M[2], fl); return; }
    drawRig(buf, r, e.x, e.y, e.z, e.heading, 1.2, fl);
    if (sbuf) drawShadow(sbuf, e.x, e.y, e.z, 1.1);
  },
  raycast(o, d, maxDist) {
    const e = this.e;
    if (!e || e.mort) return null;
    const dh = Math.hypot(d[0], d[2]) || 1e-6, cx = e.x - o[0], cz = e.z - o[2], tc = (cx * d[0] + cz * d[2]) / (dh * dh);
    if (tc < 0 || tc > maxDist) return null;
    const px = d[0] * tc - cx, pz = d[2] * tc - cz;
    if (px * px + pz * pz > 0.95 * 0.95) return null;
    const y = o[1] + d[1] * tc;
    if (y < e.y || y > e.y + 2.6) return null;
    return { t: tc, s: e, p: [o[0] + d[0] * tc, y, o[2] + d[2] * tc] };
  },
  frapper(e, dmg) {
    if (e.mort) return;
    e.hp -= dmg; e.hurtT = 0.4;
    const p = game.player;
    e.but = [p.pos[0], p.pos[2]]; e.etat = 'chasse'; e.timer = 10;
    this.son('grogne', e);
    if (e.hp > 0) return;
    e.mort = true; e.mortT = 0;
    this.son('cri', e);
    soutSecrets.X().houmMort = farm.s.day;
    farm.give('dent_houm', 1); play.flyer && play.flyer('dent_houm', [e.x, e.y + 1, e.z], 1);
  },
};
HOOKS.update.push((dt, eye, basis, sky, playing) => soutHoum.update(dt, playing));
HOOKS.draw.push((buf, sbuf, cam, t) => soutHoum.dessiner(buf, sbuf, cam, t));
HOOKS.load.push(() => { soutHoum.e = null; });
{
  const _ray = strange.raycast.bind(strange), _hit = strange.hit.bind(strange);
  strange.raycast = function (o, d, maxDist) {
    const a = _ray(o, d, maxDist);
    if (!souterrain.actif || !soutHoum.e) return a;
    const b = soutHoum.raycast(o, d, a ? a.t : maxDist);
    return b && (!a || b.t < a.t) ? b : a;
  };
  strange.hit = function (e, dmg, from) { if (e && e.houm) return soutHoum.frapper(e, dmg); return _hit(e, dmg, from); };
}
// casser la roche fait du bruit
{
  const _c = soutCueille.casser.bind(soutCueille);
  soutCueille.casser = function (q) { const p = game.player; if (p) souterrain.bruit(p.pos[0], p.pos[2], 1.3); return _c(q); };
}
