// ============================================================================
//  L'HOMME LONG (agent L) — dans une partie sur cinq cents seulement (tirée de
//  la graine, forçable pour les essais) : un homme très grand, sans visage, en
//  costume sombre, hante les bois. D'abord il regarde, à la lisière, de loin ;
//  puis, quand on a ramassé ses pages griffonnées, il vient la nuit dans les
//  bois, de plus en plus près, sans jamais bouger quand on le regarde.
//  Le regarder brouille la vue (parasites) et fait grésiller l'oreille. S'il
//  vous rattrape, c'est la mort. On ne s'en défait qu'en brûlant les huit pages.
//  API : slender (actif, forcer, apparaitre, repousser, S…)
//  Sauvegarde : farm.s.slender
// ============================================================================

const SLENDER_PAGES = [
  { lignes: ['IL EST DANS LES BOIS', 'GRAND COMME', 'DEUX HOMMES'], dessin: 'bois' },
  { lignes: ['PAS DE VISAGE', 'PAS D’YEUX', 'IL VOIT QUAND MÊME'], dessin: 'tete' },
  { lignes: ['IL NE MARCHE PAS', 'QUAND JE ME RETOURNE', 'IL EST PLUS PRÈS'], dessin: 'pres' },
  { lignes: ['NE LE REGARDE PAS', 'NE LE REGARDE PAS', 'NE LE REGARDE PAS'], dessin: 'rature' },
  { lignes: ['LES BÊTES SE TAISENT', 'LE CHIEN NE VEUT', 'PLUS SORTIR'], dessin: 'chien' },
  { lignes: ['QUAND ON LE REGARDE', 'LES YEUX GRÉSILLENT', 'COMME LA GRAISSE', 'DANS LA POÊLE'], dessin: 'yeux' },
  { lignes: ['IL SUIT IL SUIT', 'IL SUIT IL SUIT', 'IL SUIT IL SUIT', 'IL SUIT'], dessin: 'suit' },
  { lignes: ['LE FEU', 'IL N’AIME PAS LE FEU', 'BRÛLE LES HUIT PAGES', 'TOUTES', '— J. V., charbonnier'], dessin: 'feu' },
];
defItem('page_griffonnee', 'Pages griffonnées', 'quete', 0, ['sl_page', '#e6dfca'], { desc: 'Des pages arrachées à un carnet, couvertes de gribouillis au crayon. Clic : les relire. Près d’un feu, quand on les a toutes : les brûler.' });
{
  const _ip = iconPaint;
  iconPaint = function (shape, c1, c2) {
    if (shape !== 'sl_page') return _ip(shape, c1, c2);
    const pb = new PixelBuf(16, 16);
    for (let y = 2; y <= 14; y++) for (let x = 3; x <= 12; x++) pb.set(x, y, (x + y * 3) % 7 ? [230, 223, 202] : [214, 206, 184]);
    for (const y of [4, 6, 8, 10]) for (let x = 4; x <= 11; x++) if ((x * 5 + y) % 3) pb.set(x, y, [40, 36, 34]);
    for (let y = 9; y <= 13; y++) pb.set(10, y, [30, 28, 26]); pb.set(10, 8, [236, 236, 230]);
    edgeDarken(pb, 0.85);
    return pb;
  };
}

const slender = {
  e: null, statik: 0, snd: null, prise: null, envT: 0, spawnT: 0, bois: 0, lisiere: null, horsBoisT: 0, cv: null, ctxN: null,
  S() {
    const s = farm.s;
    const S = s.slender || (s.slender = { on: false, pages: {}, fin: false, vus: 0, traques: 0, derniere: -99, repit: -99 });
    S.pages = S.pages || {};
    return S;
  },
  // une partie sur cinq cents, décidée par la graine
  tirage(seed) { return mulberry32(((seed | 0) ^ 0x51e4d) >>> 0)() < 1 / 500; },
  force() { try { return localStorage.getItem('prairie.force.slender') === '1'; } catch (e) { return false; } },
  forcer(on) {
    try { if (on) localStorage.setItem('prairie.force.slender', '1'); else localStorage.removeItem('prairie.force.slender'); } catch (e) { /* stockage indisponible */ }
    if (on && farm.s) { this.S().on = true; this.placerPages(); }
  },
  actif() { if (!farm.s || !farm.s.slender) return false; const S = farm.s.slender; return !!S.on && !S.fin; },
  nbPages() { return Object.keys(this.S().pages).length; },
  attention() { const S = this.S(); return clamp(0.12 + this.nbPages() * 0.1 + (S.traques || 0) * 0.05, 0, 1); },

  // ------------------------------------------------------------ les pages, clouées aux troncs des bois
  placerPages() {
    const w = game.world, s = farm.s;
    this.pagesPos = [];
    for (let i = w.inter.length - 1; i >= 0; i--) if (w.inter[i].kind === 'slender_page') w.inter.splice(i, 1);
    if (!this.S().on) return;
    const rnd = mulberry32(((s.seed | 0) * 7 + 5003) >>> 0), N = w.objects.length, pts = [];
    const loinDe = (x, z) => { for (const k in w.bld) { const B = w.bld[k]; if (Math.hypot(B.x - x, B.z - z) < 70) return false; } for (const k in w.lm) { const L = w.lm[k]; if (!L.under && Math.hypot(L.x - x, L.z - z) < Math.min(60, (L.r || 20) + 25)) return false; } return true; };
    for (let t = 0; t < 9000 && pts.length < 8; t++) {
      const o = w.objects[(rnd() * N) | 0], T = o && OBJ_TYPES[o.t];
      if (!T || T.cat !== 'Arbres' || !w.live(o) || T.id === 'giantoak') continue;
      if (!w.inside(o.x, o.z, 60) || w.heightAt(o.x, o.z) < w.waterLevel + 1) continue;
      const m = milieuAt(w, o.x, o.z);
      if (m !== 'foret' && m !== 'bouleaux' && m !== 'sapiniere') continue;
      if (pts.some((q) => Math.hypot(q.x - o.x, q.z - o.z) < 160) || !loinDe(o.x, o.z)) continue;
      let n = 0; w.query(o.x, o.z, 12, (q) => { if (OBJ_TYPES[q.t].cat === 'Arbres' && w.live(q)) n++; });
      if (n < 6) continue;
      const a = rnd() * TAU, x = o.x + Math.sin(a) * 0.24, z = o.z + Math.cos(a) * 0.24, y = w.heightAt(o.x, o.z) + 1.35;
      pts.push({ i: pts.length, x, y, z, a });
    }
    this.pagesPos = pts;
    for (const P of pts) w.inter.push({ kind: 'slender_page', id: 'slender_page' + P.i, x: P.x, y: P.y, z: P.z, name: 'Une page clouée au tronc', data: { i: P.i } });
  },
  lirePage(i) {
    const P = SLENDER_PAGES[i];
    const cv = this.pageCanvas(i);
    ui.open('#reader', `<h3>Une page griffonnée</h3><img class="sl-page" src="${cv.toDataURL()}" alt=""><div class="txt"><i>${P.lignes.map(esc).join(' — ')}</i></div><button class="close">Refermer</button>`);
    const b = $('#reader .close'); if (b) b.onclick = () => ui.close();
  },
  album() {
    const S = this.S(), ids = Object.keys(S.pages).map(Number).sort((a, b) => a - b);
    if (!ids.length) return;
    const imgs = ids.map((i) => `<img class="sl-page petit" src="${this.pageCanvas(i).toDataURL()}" alt="">`).join('');
    ui.open('#reader', `<h3>Pages griffonnées (${ids.length} sur 8)</h3><div class="sl-album">${imgs}</div><div class="txt"><i>${ids.map((i) => SLENDER_PAGES[i].lignes.map(esc).join(' ')).join(' · ')}</i></div><button class="close">Refermer</button>`);
    const b = $('#reader .close'); if (b) b.onclick = () => ui.close();
  },
  // le dessin d'une page (canevas) : papier jauni, crayon, lettres de travers
  pageCanvas(i) {
    this.cache = this.cache || {};
    if (this.cache[i]) return this.cache[i];
    const W = 300, H = 400, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const g = cv.getContext('2d'), rnd = mulberry32(9100 + i * 77), P = SLENDER_PAGES[i];
    const j = (k) => (rnd() - 0.5) * (k || 3);
    g.fillStyle = '#e6dfca'; g.fillRect(0, 0, W, H);
    for (let k = 0; k < 300; k++) { g.fillStyle = `rgba(110,90,60,${(rnd() * 0.07).toFixed(3)})`; g.fillRect(rnd() * W, rnd() * H, 2 + rnd() * 9, 2 + rnd() * 9); }
    g.fillStyle = 'rgba(120,96,60,0.18)'; g.beginPath(); g.arc(W * (0.2 + rnd() * 0.6), H * (0.2 + rnd() * 0.6), 30 + rnd() * 40, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(80,70,50,0.25)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, H * 0.52); g.lineTo(W, H * 0.48); g.stroke();
    // bord déchiré (haut)
    g.fillStyle = '#1a1612'; for (let x = 0; x < W; x += 6) g.fillRect(x, 0, 6, 2 + rnd() * 6);
    const trait = (pts, wd, a) => { g.strokeStyle = `rgba(28,26,24,${a || 0.85})`; g.lineWidth = wd || 2; g.lineJoin = 'round'; g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x + j(), y + j()) : g.moveTo(x + j(), y + j()))); g.stroke(); };
    const arbres = (n, y0, y1) => { for (let k = 0; k < n; k++) { const x = 20 + rnd() * (W - 40); trait([[x, y1], [x + j(8), y0]], 2 + rnd() * 3, 0.7); for (let b = 0; b < 3; b++) { const yb = y0 + rnd() * (y1 - y0) * 0.5; trait([[x, yb], [x + (rnd() - 0.5) * 50, yb - 20 - rnd() * 20]], 1, 0.6); } } };
    const silhouette = (x, y, h) => {
      trait([[x - 5, y], [x - 4, y - h * 0.45]], 3); trait([[x + 5, y], [x + 4, y - h * 0.45]], 3);
      g.fillStyle = 'rgba(24,22,20,0.9)'; g.fillRect(x - 9 + j(1), y - h * 0.8, 18, h * 0.36);
      trait([[x - 9, y - h * 0.78], [x - 16, y - h * 0.3]], 2); trait([[x + 9, y - h * 0.78], [x + 16, y - h * 0.3]], 2);
      g.fillStyle = '#f2eee2'; g.strokeStyle = 'rgba(28,26,24,0.9)'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y - h * 0.9, 8, 11, 0, 0, TAU); g.fill(); g.stroke();
    };
    const d = P.dessin;
    if (d === 'bois') { arbres(9, 150, 330); silhouette(W * 0.62, 330, 190); }
    else if (d === 'tete') { g.fillStyle = '#f2eee2'; g.strokeStyle = 'rgba(28,26,24,0.9)'; g.lineWidth = 3; g.beginPath(); g.ellipse(W / 2, 250, 70, 95, 0, 0, TAU); g.fill(); g.stroke(); trait([[W / 2 - 40, 350], [W / 2 - 60, 395]], 3); trait([[W / 2 + 40, 350], [W / 2 + 60, 395]], 3); }
    else if (d === 'pres') { arbres(5, 170, 340); for (let k = 0; k < 3; k++) silhouette(60 + k * 90, 340 - k * 4, 60 + k * 70); }
    else if (d === 'rature') { for (let k = 0; k < 40; k++) trait([[rnd() * W, 140 + rnd() * 250], [rnd() * W, 140 + rnd() * 250]], 1 + rnd() * 2, 0.5); silhouette(W / 2, 360, 170); }
    else if (d === 'chien') { arbres(6, 160, 330); trait([[70, 330], [70, 312], [110, 310], [112, 330]], 2); trait([[110, 310], [122, 300], [126, 308]], 2); silhouette(W * 0.78, 330, 180); }
    else if (d === 'yeux') { for (const x of [W * 0.32, W * 0.68]) { g.strokeStyle = 'rgba(28,26,24,0.9)'; g.lineWidth = 3; g.beginPath(); g.ellipse(x, 260, 42, 26, 0, 0, TAU); g.stroke(); for (let k = 0; k < 30; k++) trait([[x + (rnd() - 0.5) * 70, 260 + (rnd() - 0.5) * 40], [x + (rnd() - 0.5) * 70, 260 + (rnd() - 0.5) * 40]], 1, 0.7); } }
    else if (d === 'suit') { for (let k = 0; k < 6; k++) silhouette(30 + k * 48, 360 - k * 26, 40 + k * 22); }
    else if (d === 'feu') { for (let k = 0; k < 14; k++) { const x = W / 2 + (rnd() - 0.5) * 80; trait([[x, 360], [x + j(20), 290 - rnd() * 40]], 2, 0.8); } trait([[W / 2 - 70, 365], [W / 2 + 70, 365]], 4); }
    // le texte, en capitales de travers
    const ecrire = (txt, y, size) => {
      g.font = `bold ${size}px Georgia, 'Times New Roman', serif`;
      const t = T(txt), wd = g.measureText(t).width;
      let x = Math.max(12, (W - wd) / 2 + j(10));
      for (const ch of t) { g.save(); g.translate(x, y + j(5)); g.rotate((rnd() - 0.5) * 0.2); g.fillStyle = 'rgba(22,20,18,0.92)'; g.fillText(ch, 0, 0); g.restore(); x += g.measureText(ch).width * (0.96 + rnd() * 0.12); }
    };
    P.lignes.forEach((l, k) => ecrire(l, 44 + k * 32, l.startsWith('—') ? 16 : 22));
    this.cache[i] = cv;
    return cv;
  },
  prendrePage(it) {
    const S = this.S(), i = it.data.i, s = farm.s;
    if (S.pages[i] !== undefined) return;
    S.pages[i] = s.day;
    farm.give('page_griffonnee', 1);
    sound.page && sound.page();
    this.statik = Math.max(this.statik, 0.55); strange.glitchT = Math.max(strange.glitchT || 0, 0.5);
    if (this.snd) this.bruit(0.8);
    const n = this.nbPages();
    setTimeout(() => this.lirePage(i), 350);
    if (n === 1) setTimeout(() => ui.subtitle('', '(Derrière vous, les bois ont retenu leur souffle.)', 4), 2500);
    else if (n === 8) setTimeout(() => ui.subtitle('', '(Huit pages. Il le sait.)', 5), 2500);
  },

  // ------------------------------------------------------------ apparitions
  // compte des arbres autour d'un point
  arbres(x, z, r) { const w = game.world; let n = 0; w.query(x, z, r, (o) => { if (OBJ_TYPES[o.t].cat === 'Arbres' && w.live(o)) n++; }); return n; },
  sol(x, z) { const w = game.world; return w.inside(x, z, 20) && w.heightAt(x, z) > w.waterLevel + 0.3; },
  apparaitre(mode, force) {
    const p = game.player, w = game.world, S = this.S(), att = this.attention();
    const yaw = p.yaw;
    let best = null;
    if (mode === 'guet') { // à la lisière, devant soi mais pas au centre, de loin
      const d0 = lerp(100, 48, clamp((S.vus || 0) / 6, 0, 1));
      for (let k = 0; k < 24; k++) {
        const a = yaw + Math.PI + (Math.random() - 0.5) * 1.6, d = d0 * (0.8 + Math.random() * 0.4), x = p.pos[0] + Math.sin(a) * d, z = p.pos[2] + Math.cos(a) * d;
        if (!this.sol(x, z)) continue;
        const n = this.arbres(x, z, 7);
        if (n < 2) continue;
        const sc = n + Math.random() * 2;
        if (!best || sc > best.sc) best = { x, z, sc };
      }
    } else { // la traque : derrière, ou sur le côté, là où l'on ne regarde pas
      const d0 = lerp(60, 34, att);
      for (let k = 0; k < 18; k++) {
        const a = yaw + (Math.random() - 0.5) * 2.4, d = d0 * (0.85 + Math.random() * 0.3), x = p.pos[0] + Math.sin(a) * d, z = p.pos[2] + Math.cos(a) * d;
        if (!this.sol(x, z)) continue;
        const sc = this.arbres(x, z, 5) + Math.random();
        if (!best || sc > best.sc) best = { x, z, sc };
      }
    }
    if (!best && !force) return false;
    if (!best) { const a = yaw, d = 40; best = { x: p.pos[0] + Math.sin(a) * d, z: p.pos[2] + Math.cos(a) * d }; }
    this.e = { mode, x: best.x, z: best.z, y: w.heightAt(best.x, best.z), t: 0, vuT: 0, nonVuT: 0, suivant: lerp(8, 3.5, att) * (0.8 + Math.random() * 0.4), fixeT: 0, penche: (Math.random() - 0.5) * 0.3, pas: 0 };
    if (mode === 'guet') S.vus = (S.vus || 0) + 1;
    else { S.traques = (S.traques || 0) + 1; S.derniere = farm.s.hours; if (sound.ok) sound.amb.gain.setTargetAtTime(0.03, sound.ctx.currentTime, 1.5); }
    return true;
  },
  disparaitre(silence) {
    this.e = null;
    if (sound.ok && !silence) sound.setAmbient(sound.ambVolume);
  },
  // le cor, la clochette : il recule, pour cette nuit
  repousser(src) {
    if (!farm.s || !this.S().on) return;
    const S = this.S();
    S.repit = farm.s.hours + 12;
    if (this.e) { this.disparaitre(); this.statik = Math.max(this.statik, 0.35); }
  },
  // regarde-t-on vers lui ?
  vu(e, eye, f) {
    const dx = e.x - eye[0], dy = e.y + 2.3 - eye[1], dz = e.z - eye[2], d = Math.hypot(dx, dy, dz) || 1;
    const sky = game.sky;
    if (sky && d > sky.fog[1] + 10) return false;
    const fov = settings.fov * DEG * (game.fovK || 1);
    if ((dx * f[0] + dy * f[1] + dz * f[2]) / d < Math.cos(Math.min(1.25, fov * 0.52))) return false;
    return !game.world.raycastBlocks(eye, [dx / d, dy / d, dz / d], d - 0.5);
  },
  // se replacer plus près, là où l'on ne regarde pas
  avancer(frontal) {
    const e = this.e, p = game.player, w = game.world, att = this.attention();
    const d = Math.hypot(e.x - p.pos[0], e.z - p.pos[2]);
    const feu = game.nearFire(p.pos) ? 18 : 0;
    let nd = Math.max(frontal ? 1.6 : 2.0, d * lerp(0.74, 0.58, att), feu);
    if (legLumiere && legLumiere.aube && legendaires.porte('lanterne_aube')) nd = Math.max(nd, d * 0.85, 12);
    let best = null;
    for (let k = 0; k < 14; k++) {
      const a = frontal ? p.yaw + Math.PI + (Math.random() - 0.5) * 0.2 : p.yaw + (Math.random() - 0.5) * 2.6, x = p.pos[0] + Math.sin(a) * nd, z = p.pos[2] + Math.cos(a) * nd;
      if (!this.sol(x, z)) continue;
      const sc = this.arbres(x, z, 4) + Math.random();
      if (!best || sc > best.sc) best = { x, z, sc };
    }
    if (!best) return;
    e.x = best.x; e.z = best.z; e.y = w.heightAt(best.x, best.z);
    e.suivant = lerp(8, 3.5, att) * (0.75 + Math.random() * 0.5) * (legLumiere && legLumiere.aube ? 1.8 : 1);
    e.pas++;
    if (sound.ok && Math.random() < 0.6) sound.heartbeat && sound.heartbeat(clamp(1 - nd / 40, 0.2, 1));
  },

  // ------------------------------------------------------------ chaque image
  update(dt, eye, basis, sky, playing) {
    const s = farm.s;
    if (!s) return;
    if (this.prise) { this.majPrise(dt); this.majEffets(dt); return; }
    const on = this.actif();
    if (!on) { if (this.e) this.disparaitre(); this.statik = Math.max(0, this.statik - dt * 0.8); this.majEffets(dt); return; }
    const S = this.S(), p = game.player, w = game.world, h = npcs.hour();
    if (!playing || game.sleeping || (typeof cine !== 'undefined' && cine.on)) { this.statik = Math.max(0, this.statik - dt * 0.5); this.majEffets(dt); return; }
    // l'environnement (toutes les secondes) : dans les bois ? au bord des bois ?
    this.envT -= dt;
    if (this.envT <= 0) {
      this.envT = 1;
      this.bois = p.underground ? 0 : this.arbres(p.pos[0], p.pos[2], 22);
      this.dehors = !p.underground && !w.covered(eye[0], eye[1], eye[2]) && !strange.inEnvers();
    }
    const nuit = sky.night, brume = weather.cur.fog || 0, dansBois = this.bois >= 12;
    // naissance d'une apparition (un tirage toutes les cinq secondes, à la mesure des heures de jeu écoulées : la traque
    // vient 0,06 à 0,21 fois par heure de jeu passée la nuit dans les bois, le guet 0,02 à 0,07 fois par heure ailleurs)
    this.spawnT -= dt;
    if (!this.e && this.spawnT <= 0) {
      this.spawnT = 5;
      const repit = s.hours < (S.repit || -99);
      const att = this.attention(), B = bizarrerie();
      if (!repit && this.dehors && s.day >= 2) {
        const pages = this.nbPages();
        if (dansBois && pages > 0 && nuit > 0.45 && s.hours - (S.derniere || -99) > 10 && Math.random() < hasardHeure((0.06 + att * 0.15) * B, 5)) this.apparaitre('traque');
        else if (!dansBois && (nuit > 0.25 || brume > 0.5 || (pages >= 4 && sky.day > 0.5 && Math.random() < 0.3)) && Math.random() < hasardHeure((0.02 + att * 0.05) * B, 5)) this.apparaitre('guet');
      }
    }
    const e = this.e;
    if (e) {
      e.t += dt;
      const d = Math.hypot(e.x - p.pos[0], e.z - p.pos[2]);
      const vu = this.vu(e, eye, basis.f);
      if (vu) { e.vuT += dt; e.fixeT += dt; e.nonVuT = 0; } else { e.nonVuT += dt; e.fixeT = Math.max(0, e.fixeT - dt * 2); }
      const cible = vu ? clamp(1.3 - d / 42, 0.18, 1) : d < 10 ? 0.12 : 0;
      this.statik += (cible - this.statik) * Math.min(1, dt * (cible > this.statik ? 3 : 1.2));
      game.dogAlarm && game.dogAlarm(e);
      if (e.mode === 'guet') {
        // il regarde ; on le voit un instant, puis il n'est plus là
        if (e.vuT > 4.5) { this.statik = 0.9; this.disparaitre(true); }
        else if ((e.vuT > 2.2 + Math.random() * 1.5 && !vu) || e.t > 30 || d < 22) this.disparaitre(true);
      } else {
        // la traque : il ne bouge jamais quand on le regarde
        if (!vu) { e.suivant -= dt; if (e.suivant <= 0) this.avancer(false); }
        else if (e.fixeT > lerp(4, 2, this.attention()) && d < 26) { e.fixeT = 0; this.avancer(true); this.statik = 1; strange.glitchT = Math.max(strange.glitchT || 0, 0.9); }
        const d2 = Math.hypot(e.x - p.pos[0], e.z - p.pos[2]);
        if (d2 < 2.3) { this.attraper(); return; }
        // on lui échappe : sortir des bois, s'abriter, l'aube, un grand feu
        this.horsBoisT = dansBois ? 0 : this.horsBoisT + dt;
        if (this.horsBoisT > 20 || !this.dehors || nuit < 0.2 || e.t > 240) { this.disparaitre(); this.horsBoisT = 0; }
      }
    } else this.statik = Math.max(0, this.statik - dt * 0.9);
    this.majEffets(dt);
  },
  // ------------------------------------------------------------ il vous rattrape
  attraper() {
    const p = game.player, e = this.e;
    if (!e || this.prise) return;
    const f = cameraBasis(p.yaw, 0).f;
    // il est là, tout contre vous
    e.x = p.pos[0] + f[0] * 1.3; e.z = p.pos[2] + f[2] * 1.3; e.y = game.world.heightAt(e.x, e.z);
    this.prise = { t: 0, yaw0: p.yaw, pitch0: p.pitch, pos: p.pos.slice() };
    this.statik = 1;
    if (sound.ok) { const t = sound.at(); sound.noiseHit(t, 1.6, 'bandpass', 1800, 0.5, 0.5); sound.voice(t, 'sawtooth', 70, 40, 1.8, 0.08, sound.lp(400)); }
  },
  majPrise(dt) {
    const P = this.prise, p = game.player, e = this.e;
    P.t += dt;
    p.vel = [0, 0, 0]; p.pos = P.pos.slice();
    this.statik = 1;
    strange.glitchT = Math.max(strange.glitchT || 0, 0.95);
    if (P.t > 1.7 && !P.fini) { P.fini = true; this.prise = null; this.e = null; game.die('Emporté par l’Homme long, à l’orée du bois'); }
  },
  camera(dt, pos, yaw, pitch) {
    const P = this.prise, e = this.e;
    if (!P || !e) return null;
    const dx = e.x - pos[0], dz = e.z - pos[2], dy = e.y + 2.75 - pos[1];
    const ty = Math.atan2(-dx, -dz), tp = Math.atan2(dy, Math.hypot(dx, dz)), k = Math.min(1, P.t / 0.35);
    let dyaw = ty - P.yaw0; while (dyaw > Math.PI) dyaw -= TAU; while (dyaw < -Math.PI) dyaw += TAU;
    return { pos, yaw: P.yaw0 + dyaw * k, pitch: lerp(P.pitch0, tp, k) };
  },
  // ------------------------------------------------------------ parasites (image) et grésillement (son)
  majEffets(dt) {
    const k = clamp(this.statik, 0, 1);
    if (k > 0.02) strange.glitchT = Math.max(strange.glitchT || 0, k * 0.55);
    // le canevas de neige
    if (!this.cv) {
      const c = document.createElement('canvas'); c.id = 'slender-neige'; c.width = 160; c.height = 100;
      c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:5;opacity:0;image-rendering:pixelated;mix-blend-mode:normal';
      document.body.appendChild(c);
      this.cv = c; this.ctxN = c.getContext('2d'); this.img = this.ctxN.createImageData(160, 100);
    }
    const op = k < 0.02 ? 0 : Math.min(0.92, k * 0.8 + (Math.random() - 0.5) * 0.08 * k), ops = op.toFixed(2);
    if (ops !== this.lastOp) { this.cv.style.opacity = ops; this.lastOp = ops; }
    if (op > 0) {
      const D = this.img.data, band = (performance.now() / 12) % 140 - 20;
      for (let y = 0; y < 100; y++) {
        const b = Math.abs(y - band) < 6 ? 60 : 0, row = Math.random() < 0.04 ? 80 : 0;
        for (let x = 0; x < 160; x++) { const v = Math.min(255, ((Math.random() * 200) | 0) + b + row), o = (y * 160 + x) * 4; D[o] = v; D[o + 1] = v; D[o + 2] = v; D[o + 3] = 255; }
      }
      this.ctxN.putImageData(this.img, 0, 0);
    }
    this.bruit(k);
  },
  bruit(k) {
    if (!sound.ok) return;
    if (!this.snd) {
      if (k < 0.02 || !sound.noise) return;
      const c = sound.ctx, src = c.createBufferSource(); src.buffer = sound.noise; src.loop = true;
      const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2600; bp.Q.value = 0.5;
      const g = c.createGain(); g.gain.value = 0;
      src.connect(bp).connect(g).connect(sound.sfx); src.start();
      this.snd = { src, bp, g };
    }
    const c = sound.ctx, v = k < 0.02 ? 0 : k * 0.18 * (0.5 + Math.random());
    this.snd.g.gain.setTargetAtTime(v, c.currentTime, 0.015);
    this.snd.bp.frequency.setTargetAtTime(1800 + Math.random() * 2400, c.currentTime, 0.02);
  },
  // ------------------------------------------------------------ le feu : brûler les huit pages
  async bruler() {
    const S = this.S(), p = game.player;
    if (this.nbPages() < 8 || farm.count('page_griffonnee') < 8) { ui.subtitle('', '(Il en manque. « Brûle les huit pages. Toutes. »)', 3.5); return; }
    farm.take('page_griffonnee', farm.count('page_griffonnee'));
    S.fin = true; S.brule = farm.s.day;
    if (this.e) this.disparaitre(true);
    const eye = p.eyePos(), f = cameraBasis(p.yaw, 0).f;
    for (let k = 0; k < 40; k++) particles.spawn(eye[0] + f[0] * 1.2, eye[1] - 0.6, eye[2] + f[2] * 1.2, (Math.random() - 0.5) * 0.8, 1 + Math.random() * 2, (Math.random() - 0.5) * 0.8, [1, 0.55, 0.2, 1], 0.06, 1.2 + Math.random(), -0.3, true);
    sound.candle && sound.candle();
    const x = p.pos[0] + f[0] * 24, z = p.pos[2] + f[2] * 24;
    this.adieu = { x, z, y: game.world.heightAt(x, z), t: 0 };
    this.statik = 0.6;
    await new Promise((r) => setTimeout(r, 4200));
    this.adieu = null; this.statik = 0;
    ui.subtitle('', '(Quand vous relevez les yeux, il est là, à l’orée de la lumière. Puis il n’y a plus que les arbres.)', 5);
  },
};
// les pages : on les ramasse, on les relit, on les brûle
HOOKS.interVis.slender_page = (it) => slender.actif() && slender.S().pages[it.data.i] === undefined;
HOOKS.inter.slender_page = (it) => slender.prendrePage(it);
HOOKS.primary.push((eye, basis, held, it, id) => {
  if (held || id !== 'page_griffonnee') return false;
  if (game.nearFire(game.player.pos) && slender.S().on && !slender.S().fin && farm.count('page_griffonnee') >= 8) { slender.bruler(); play.cool = 1; return true; }
  if (game.nearFire(game.player.pos) && slender.S().on && !slender.S().fin) { ui.subtitle('', '(Il en manque. « Brûle les huit pages. Toutes. »)', 3.5); play.cool = 0.6; return true; }
  slender.album(); play.cool = 0.5;
  return true;
});
HOOKS.update.push((dt, eye, basis, sky, playing) => slender.update(dt, eye, basis, sky, playing));
HOOKS.camera.push((dt, pos, yaw, pitch) => slender.camera(dt, pos, yaw, pitch));
HOOKS.fx.push((fx, tint, sky) => { const k = slender.statik; if (k > 0.02) fx[0] = Math.max(fx[0], k * 0.55); });
HOOKS.load.push((saved) => {
  slender.e = null; slender.prise = null; slender.statik = 0; slender.adieu = null; slender.spawnT = 8; slender.envT = 0;
  if (sound.ok) sound.setAmbient(sound.ambVolume);
  if (!farm.s) return;
  const S = slender.S();
  if (!S.on && (slender.force() || slender.tirage(farm.s.seed))) S.on = true;
  slender.placerPages();
});
// l'homme long : très grand, sans visage, costume sombre, chemise blanche, cravate noire
function slenderModele(E, penche, nuit) {
  const suit = [0.07, 0.07, 0.08], shirt = [0.86, 0.86, 0.84], skin = [0.94, 0.94, 0.92], noir = [0.02, 0.02, 0.025];
  for (const s of [-1, 1]) { E.bx(s * 0.1, 0, 0.04, 0.13, 0.08, 0.3, noir, TL.leather); E.bx(s * 0.1, 0.07, 0, 0.13, 1.5, 0.15, suit, TL.coat); }
  E.bx(0, 1.55, 0, 0.44, 0.34, 0.23, suit, TL.coat);
  E.bx(0, 1.86, 0, 0.47, 0.52, 0.25, suit, TL.coat);
  E.bx(0, 1.98, 0.126, 0.13, 0.4, 0.01, shirt, TL.cloth);
  E.bx(0, 1.84, 0.133, 0.045, 0.5, 0.01, noir, 0);
  E.bx(0, 2.34, 0, 0.56, 0.08, 0.27, suit, TL.coat);
  for (const s of [-1, 1]) {
    E.box(s * 0.32, 1.64, 0, 0.1, 1.46, 0.12, suit, TL.coat, 0, 0, s * 0.035);
    E.box(s * 0.345, 0.86, 0.01, 0.075, 0.22, 0.055, skin, TL.skin, 0, 0, s * 0.035);
    for (const k of [-1, 0, 1]) E.box(s * 0.35 + k * 0.022, 0.68, 0.012, 0.016, 0.2, 0.02, skin, TL.skin);
  }
  E.bx(0, 2.4, 0, 0.1, 0.18, 0.1, skin, TL.skin);
  if (nuit > 0.3) { E.fl = FX_EMIT; E.box(0, 2.76, 0, 0.27, 0.37, 0.27, v3.scale([0.42, 0.42, 0.41], clamp(nuit, 0.3, 1)), TL.plain, 0, 0, penche); E.fl = 0; }
  else E.box(0, 2.76, 0, 0.27, 0.37, 0.27, skin, TL.plain, 0, 0, penche);
}
HOOKS.draw.push((buf, sbuf, cam, t) => {
  const e = slender.e || slender.adieu, p = game.player;
  // les pages, sur les troncs
  if (slender.actif() && slender.pagesPos) {
    const S = slender.S();
    for (const P of slender.pagesPos) {
      if (S.pages[P.i] !== undefined || Math.abs(P.x - cam[0]) > 60 || Math.abs(P.z - cam[2]) > 60) continue;
      PE.buf = buf; PE.fl = 0; PE.frame(P.x, P.y, P.z, P.a, 1);
      PE.box(0, 0, 0, 0.22, 0.3, 0.012, [0.9, 0.87, 0.78], TL.paper);
      PE.box(0, 0.13, 0.008, 0.03, 0.03, 0.01, [0.15, 0.15, 0.16], TL.iron);
    }
  }
  if (!e) return;
  PE.buf = buf; PE.fl = 0;
  PE.frame(e.x, e.y, e.z, Math.atan2(p.pos[0] - e.x, p.pos[2] - e.z), 1);
  slenderModele(PE, (slender.e && slender.e.penche) || 0.12, game.sky ? game.sky.night : 0);
});
