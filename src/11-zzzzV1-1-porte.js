// ============================================================================
//  LA GRANDE PORTE (agent V1, quatorzième vague)
//  - Génération (passe de la vallée, après U ; tirage propre) : au bout de la
//    route de Clairpré, passé les ruines, dans la paroi des monts de l'est : une
//    façade de vieille pierre de vingt-quatre mètres, deux statues agenouillées,
//    deux braseros, une stèle, des marches ; la route prolongée jusqu'à elle.
//  - La Porte est PARFOIS FERMÉE À CLÉ (porteV1.fermee) : tout le jour des morts
//    (Vorndi), les matins de brume, et certaines nuits (une sur trois environ,
//    tirée de la graine et du jour). Les signes : les braseros sont éteints, la
//    barre est mise (on l'entend retomber au soir). Fermée, il faut la clé de la
//    Grande Porte (`cle_grande_porte`, agent Y, à la bibliothèque) ; le crochetage
//    ne l'ouvre pas. De l'autre côté, la Porte s'ouvre toujours (pas de barre).
//  - On passe : zone.entrer() (11-zzzzV1-2-zone.js).
//  Essais : porteV1.aller() (devant la Porte), porteV1.passer().
// ============================================================================

// ---------------------------------------------------------------- la façade (commune aux deux côtés)
// f : repère (porte sur le côté -z local, la paroi derrière, en +z) ; renvoie les points utiles
function v1BatirPorte(B, f, o) {
  o = o || {};
  const M = M_V1_PIERRE, W = 40, H = 24, D = 7;
  const blk = (lx, ly, lz, sx, sy, sz, m) => B.block(f, lx, ly, lz, sx, sy, sz, m === undefined ? M : m);
  // le corps de la façade, enfoncé dans la paroi (on en voit le devant), percé d'une baie de 8 × 13 m
  const bas = -6; // sous le seuil : la façade descend dans le sol
  blk(-12, bas, D / 2 + 3, 16, H - bas, D + 6); blk(12, bas, D / 2 + 3, 16, H - bas, D + 6);
  blk(0, 13, D / 2 + 3, 8, H - 13, D + 6);
  // le passage derrière la Porte : un tunnel noir qui s'enfonce (on voit l'obscurité par la fente)
  blk(0, bas, D + 9, 9, 13 - bas, 4, M_DARK);
  blk(-4.4, 0, D / 2 + 3, 0.8, 13, D + 6, M_DARK); blk(4.4, 0, D / 2 + 3, 0.8, 13, D + 6, M_DARK);
  // le seuil, les marches (de largeur dégressive)
  blk(0, bas, -1.2, 14, -bas, 2.6);
  for (let k = 1; k <= 5; k++) blk(0, bas, -1.2 - k * 1.1, 14 + k * 2.2, -bas - k * 0.36, 1.1);
  // les pilastres et la corniche
  for (const x of [-15.5, -7.6, 7.6, 15.5]) { blk(x, bas, -0.7, 2.6, H - 1 - bas, 1.6); blk(x, H - 1.6, -0.9, 3.2, 1.2, 2.2); }
  blk(0, H - 0.4, -0.6, W + 2, 1.6, 2.6);
  blk(0, H + 1.2, 1.5, W - 6, 2.2, 3);
  // le linteau de la baie, et la frise des yeux (des creux sombres)
  blk(0, 13, -0.55, 10, 1.6, 1.4);
  for (let k = -6; k <= 6; k++) if (k) blk(k * 2.5, 18.2, -0.12, 0.8, 0.45, 0.3, M_DARK);
  // deux statues agenouillées, la tête basse, les mains ouvertes vers la Porte
  for (const c of [-1, 1]) {
    const x = c * 11.5, z = -4.5;
    blk(x, bas, z, 4, 1.4 - bas, 4);                       // le socle
    blk(x, 1.4, z + 0.4, 3.2, 2.2, 3.4);                    // les genoux
    blk(x, 3.6, z + 0.9, 2.6, 3.6, 2.2);                    // le buste
    blk(x - c * 0.4, 6.8, z + 0.2, 1.5, 1.6, 1.6);          // la tête, penchée
    blk(x - c * 1.9, 4.2, z - 0.3, 0.8, 0.5, 2.6);          // le bras tendu
    blk(x - c * 2.1, 4.0, z - 1.6, 1.1, 0.25, 1.2);         // la main ouverte
    blk(x + c * 1.5, 3.8, z + 0.6, 0.7, 2.6, 0.8);          // l'autre bras, le long du corps
  }
  // les vantaux (objets posés : ils tournent) et la barre
  const vg = B.propRel(f, 'v1_vantail', -4.0, 0, 0.35, 0, { cote: -1, zone: !!o.zone });
  const vd = B.propRel(f, 'v1_vantail', 4.0, 0, 0.35, 0, { cote: 1, zone: !!o.zone });
  if (o.barre) B.propRel(f, 'v1_barre', 0, 0, 0.35, 0, {});
  // les braseros
  const br = [];
  for (const c of [-1, 1]) br.push(B.propRel(f, 'v1_brasier', c * 5.6, 0, -3.6, 0, { feu: o.feux || 'porte' }));
  // le bouchon de la baie : un bloc invisible, tant que la Porte est close (les vantaux eux-mêmes ne bloquent pas)
  const [bx, bz] = B.toWorld(f, 0, 0.35);
  const bouchon = { x: bx, y: f.y, z: bz, sx: 8.2, sy: 13, sz: 0.6, r: f.r, m: 0, sh: 0, hidden: true, v1bouchon: true };
  B.w.blocks.push(bouchon);
  const [ix, iz] = B.toWorld(f, 0, -1.4);
  return { vantaux: [vg, vd], braseros: br, bouchon, inter: [ix, f.y + 1.6, iz] };
}

// ---------------------------------------------------------------- génération (la vallée)
function v1PorteGenerer(w, seed) {
  if (!w || !w.designed || !w.lm || w.v1porte) return;
  const rnd = mulberry32(((seed | 0) ^ 0x6A7E0D00) >>> 0);
  const B = new Builder(w, rnd, new Uint8Array(1));
  // l'emplacement : au pied de la paroi de l'est, au bout de la route qui passe par les ruines (vallée dessinée)
  const ruines = w.lm.ruines || { x: 2304, z: 2086 };
  const cible = { x: 2800, z: 2086 };
  const ok = (x, z, r) => {
    for (const k in w.lm) { const L = w.lm[k]; if (!L.under && Math.hypot(L.x - x, L.z - z) < (L.r || 20) + r) return false; }
    for (const q of w.props) if (Math.abs(q.x - x) < r && Math.abs(q.z - z) < r) return false;
    for (const it of w.inter) if (Math.abs(it.x - x) < r && Math.abs(it.z - z) < r) return false;
    for (const P of w.noBuild || []) if (Math.hypot(P.x - x, P.z - z) < P.r + r) return false;
    return true;
  };
  let best = null;
  for (let k = 0; k < 900; k++) {
    const a = rnd() * TAU, d = Math.sqrt(rnd()) * 140, x = cible.x + Math.cos(a) * d, z = cible.z + Math.sin(a) * d;
    const y = w.heightAt(x, z);
    if (y < w.waterLevel + 2) continue;
    // la paroi : la direction où le terrain monte le plus vite
    let up = null;
    for (let s = 0; s < 24; s++) { const an = s / 24 * TAU, h = w.heightAt(x + Math.sin(an) * 30, z + Math.cos(an) * 30) - y; if (!up || h > up.h) up = { an, h }; }
    if (up.h < 14) continue;
    // devant : à peu près plat sur trente mètres, et qui regarde vers l'ouest (vers les ruines)
    const fx = -Math.sin(up.an), fz = -Math.cos(up.an);
    const vers = Math.atan2(ruines.x - x, ruines.z - z), ecart = Math.abs(((up.an + Math.PI - vers) % TAU + TAU + Math.PI) % TAU - Math.PI);
    if (ecart > 1.0) continue;
    let plat = 0;
    for (const r of [8, 16, 24, 32]) for (const l of [-10, 0, 10]) plat = Math.max(plat, Math.abs(w.heightAt(x + fx * r - fz * l, z + fz * r + fx * l) - y));
    if (plat > 5) continue;
    if (!ok(x, z, 45)) continue;
    const score = plat + ecart * 3 + d * 0.01 - Math.min(up.h, 30) * 0.15 + rnd() * 0.5;
    if (!best || score < best.score) best = { x, z, y, an: up.an, score, plat, h30: up.h };
  }
  if (!best) return;
  const f = { x: best.x, y: best.y + 0.1, z: best.z, r: best.an };
  const P = v1BatirPorte(B, f, { barre: true, feux: 'porte' });
  B.inter('v1_porte', 'v1_porte', P.inter[0], P.inter[1], P.inter[2], 'La Grande Porte', {});
  // la stèle, à gauche des marches
  const [sx, sz] = B.toWorld(f, -9, -12), sy = w.heightAt(sx, sz);
  B.prop('v1_stele', sx, sy, sz, f.r);
  B.inter('v1_stele', 'v1_stele_vallee', sx, sy + 1.4, sz, 'Lire la stèle', {});
  // la route : des ruines jusqu'aux marches (la terre battue, les arbres qui y étaient s'écartent)
  const [ex, ez] = B.toWorld(f, 0, -14);
  const pts = [[ruines.x + 26, ruines.z], [lerp(ruines.x, ex, 0.35), lerp(ruines.z, ez, 0.35) + 10], [lerp(ruines.x, ex, 0.7), lerp(ruines.z, ez, 0.7) - 6], [ex, ez]];
  for (let i = 1; i < pts.length; i++) B.paintLine(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], 1.6, M_DIRT);
  const route = (x, z) => { for (let i = 1; i < pts.length; i++) { const [x0, z0] = pts[i - 1], [x1, z1] = pts[i], dx = x1 - x0, dz = z1 - z0, t = clamp(((x - x0) * dx + (z - z0) * dz) / (dx * dx + dz * dz || 1), 0, 1); if (Math.hypot(x - x0 - dx * t, z - z0 - dz * t) < 3.2) return true; } return false; };
  // (ce qui pousse sur la route ou devant la façade s'écarte ; leur rang dans w.objects ne change pas)
  for (const ob of w.objects) {
    if (ob.gone || Math.abs(ob.x - f.x) > 520 || Math.abs(ob.z - f.z) > 120) continue;
    const T = OBJ_TYPES[ob.t];
    if (T.animal) continue;
    const [lx, lz] = B.toLocal(f, ob.x, ob.z);
    if ((Math.abs(lx) < 24 && lz > -22 && lz < 14) || route(ob.x, ob.z)) ob.gone = true;
  }
  // les pavés du parvis
  B.paintRect(f, 0, -11, 9, 7, M_COBBLE);
  B.landmark('grande_porte', f.x + Math.sin(f.r) * -12, f.z + Math.cos(f.r) * -12, 40, {});
  (w.noBuild || (w.noBuild = [])).push({ x: f.x, z: f.z, r: 42, why: 'la Grande Porte' });
  const [ox, oz] = B.toWorld(f, 0, -11);
  w.v1porte = { x: f.x, y: f.y, z: f.z, r: f.r, vantaux: P.vantaux, bouchon: P.bouchon, braseros: P.braseros, stele: [sx, sy, sz],
    sortie: { x: ox, y: w.heightAt(ox, oz) + 0.05, z: oz, yaw: f.r + Math.PI }, plat: +best.plat.toFixed(2), paroi: +best.h30.toFixed(1), route: pts };
  w.grid = null;
}
{
  const _gv = generateValley;
  generateValley = async function (seed, progress, gen) {
    const w = await _gv(seed, progress, gen);
    if (w && w.designed) { try { v1PorteGenerer(w, w.seed !== undefined ? w.seed : seed); } catch (e) { console.error('V1 : la Grande Porte', e); } }
    return w;
  };
}

// ---------------------------------------------------------------- les règles de la Porte
const porteV1 = {
  ouv: 0, ouvT: 0, passeT: 0, barreT: 0,
  P() { const w = farm.w; return w && w.v1porte; },
  S() { return zone.S(); },
  // fermée ? (et pourquoi) — jour, heure (par défaut : maintenant)
  fermee(day, h) {
    const s = farm.s;
    if (!s) return null;
    day = day === undefined ? s.day : day; h = h === undefined ? (farm.w ? farm.w.time * 24 : 12) : h;
    // la nuit d'avant six heures appartient au jour d'avant
    const jourDeNuit = h < 6 ? day - 1 : day;
    if (cal.is('morts', day) && h >= 6) return 'vorndi';
    if (cal.is('morts', jourDeNuit) && h < 6) return 'vorndi';
    const P = weather.dayPlan(s.seed, day);
    if (P.plan.some((q) => q[1] === 'fog') && h >= 5 && h < 11) return 'brume';
    if (h >= 22 || h < 5) { const r = mulberry32(((s.seed | 0) * 31 + jourDeNuit * 977 + 0x5EED) >>> 0)(); if (r < 0.34) return 'nuit'; }
    return null;
  },
  // la clé de la Grande Porte (définie par l'agent Y) : on ne fait que regarder si on l'a
  aLaCle() { return typeof ITEMS !== 'undefined' && ITEMS.cle_grande_porte && farm.count('cle_grande_porte') > 0; },
  // ouverte pour cette fois (la clé a tourné) : jusqu'à ce qu'on soit passé, ou au plus une heure
  ouvertePourNous() { const S = this.S(); return S.ouverteJusque && farm.s.hours < S.ouverteJusque; },
  ouverte() { return !this.fermee() || this.ouvertePourNous(); },
  barreMise() { return !!this.fermee() && !this.ouvertePourNous(); },
  feux() { return !this.fermee(); },
  // angle des vantaux (0 fermé) : entrouverts quand la Porte est ouverte, grands ouverts quand on passe
  angle(o) { return o && o.data && o.data.zone ? zone.ouvPorte || 0 : this.ouv; },
  update(dt) {
    const P = this.P();
    if (!P || zone.dedans) return;
    const p = game.player, d = Math.hypot(p.pos[0] - P.x, p.pos[2] - P.z);
    const cible = this.passeT > 0 ? 1.15 : this.ouverte() ? 0.07 : 0;
    this.passeT = Math.max(0, this.passeT - dt);
    this.ouv += clamp(cible - this.ouv, -dt * 0.35, dt * 0.35);
    // la barre retombe : on l'entend (de loin) quand la Porte se ferme
    const f = !!this.barreMise();
    if (this.etaitFermee !== undefined && f !== this.etaitFermee && d < 700 && typeof sonV1 !== 'undefined') sonV1.barre([P.x, P.y + 3, P.z], f, d);
    this.etaitFermee = f;
  },
  // E sur la Porte
  toucher() {
    const P = this.P();
    if (!P) return;
    const why = this.fermee();
    if (why && !this.ouvertePourNous()) {
      const txt = why === 'vorndi' ? V1_TEXTES.porteFermeeVorndi : why === 'brume' ? V1_TEXTES.porteFermeeBrume : why === 'nuit' ? V1_TEXTES.porteFermeeNuit : V1_TEXTES.porteFermee;
      const opts = [];
      if (this.aLaCle()) opts.push({ label: 'Ouvrir avec la clé de la Grande Porte', fn: () => { ui.close(); this.ouvrirAvecLaCle(); } });
      opts.push({ label: 'S’en aller', fn: () => ui.close() });
      if (typeof sonV1 !== 'undefined') sonV1.frappe([P.x, P.y + 2, P.z]);
      ui.choice('La Grande Porte', txt, opts);
      return;
    }
    ui.choice('La Grande Porte', V1_TEXTES.porteOuverte, [
      { label: 'Pousser le vantail et passer', fn: () => { ui.close(); this.passer(); } },
      { label: 'Reculer', fn: () => ui.close() },
    ]);
  },
  ouvrirAvecLaCle() {
    const S = this.S(), P = this.P();
    S.ouverteJusque = farm.s.hours + 1;
    S.cleUtilisee = (S.cleUtilisee || 0) + 1;
    ui.subtitle('', '(' + V1_TEXTES.porteCle + ')', 4);
    if (typeof sonV1 !== 'undefined') sonV1.cle([P.x, P.y + 2, P.z]);
  },
  async passer() {
    if (zone.dedans || zone.enCours) return;
    const P = this.P();
    if (game.player.riding) { ui.subtitle('', V1_TEXTES.chevalRefuse, 3); return; }
    this.passeT = 3;
    if (typeof sonV1 !== 'undefined') sonV1.vantail([P.x, P.y + 4, P.z]);
    await new Promise((r) => setTimeout(r, 1200));
    const S = this.S();
    S.ouverteJusque = 0;
    await zone.entrer();
  },
  // essais : devant la Porte, côté vallée
  aller() {
    const P = this.P();
    if (!P || zone.dedans) return false;
    const p = game.player;
    p.pos = [P.sortie.x, farm.w.groundAt(P.sortie.x, P.sortie.z, P.sortie.y + 1, 0.8) + 0.02, P.sortie.z]; p.yaw = P.r + Math.PI; p.pitch = 0.15; p.vel = [0, 0, 0];
    game.renderer.uploadCover(p.pos[0], p.pos[2]);
    return true;
  },
  // lumières des braseros (la nuit surtout : la Porte se voit de loin)
  lumieres(eye) {
    const P = this.P();
    if (!P || zone.dedans || !this.feux()) return [];
    const d = Math.hypot(P.x - eye[0], P.z - eye[2]);
    if (d > 400) return [];
    const L = [];
    for (const q of P.braseros) {
      const fl = 1 + Math.sin(game.time * 11 + q.x) * 0.08 + Math.sin(game.time * 23 + q.z) * 0.05;
      L.push({ x: q.x, y: q.y + 3.1, z: q.z, r: 16, c: [1.15 * fl, 0.62 * fl, 0.26 * fl], d: Math.hypot(q.x - eye[0], q.z - eye[2]) });
    }
    return L;
  },
};
// (la baie reste bouchée par un bloc invisible : on passe la Porte avec E, en poussant le vantail)
HOOKS.inter.v1_porte = () => porteV1.toucher();
HOOKS.inter.v1_stele = () => { sound.page && sound.page(); ui.read(V1_TEXTES.steleTitre, V1_TEXTES.stele); };
HOOKS.update.push((dt) => { if (farm.s && game.kind === 'farm' && !zone.dedans) porteV1.update(dt); });
HOOKS.lights.push((eye) => (farm.s && game.kind === 'farm' ? porteV1.lumieres(eye) : []));

// ---------------------------------------------------------------- ce qu'on en dit (de loin)
{
  for (const id in V1_RUMEURS) {
    const d = NPC_DATA.find((x) => x.id === id);
    if (d && d.lines && Array.isArray(d.lines.rumeurs)) for (const t of V1_RUMEURS[id]) d.lines.rumeurs.push(t);
  }
  if (typeof NPC_GENERIC !== 'undefined' && Array.isArray(NPC_GENERIC.rumeurs)) NPC_GENERIC.rumeurs.push('Vous êtes allé voir la Grande Porte, au bout de la route des ruines ? Moi, jamais. Mon père y est allé.', 'Il paraît que derrière la Porte, il fait toujours gris. Même l’été.');
}
