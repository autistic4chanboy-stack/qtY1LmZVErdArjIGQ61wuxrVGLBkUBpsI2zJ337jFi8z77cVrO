// ============================================================================
//  PANNEAUX : poteaux indicateurs (directions, distances) et panneaux-cartes ;
//  la carte de la vallée (dépliée à la demande : jamais à l'écran en permanence)
//  et les cartes au trésor
// ============================================================================
const signs = {
  base: null,
  // --------------------------------------------------------------- poteau indicateur
  read(it) {
    const p = game.player, dests = it.data.dests || [];
    const rel = (a) => {
      const d = angDiff(p.yaw + Math.PI, a); // 0 = devant soi
      const i = Math.round(((d / TAU) * 8 + 8)) % 8;
      return ['↑', '↖', '←', '↙', '↓', '↘', '→', '↗'][i];
    };
    const lines = dests.map(([name, dist, a]) => `${rel(a)}  ${fmtLine(name, null)} — ${dist < 100 ? 'à deux pas' : dist >= 1000 ? (dist / 1000).toFixed(1).replace('.', ',') + ' km' : dist + ' m'} (vers ${game.world.cardinal(a)})`);
    ui.read('Poteau indicateur', lines.join('\n') || 'Les flèches sont effacées.', 'Les planches ont été repeintes, un jour. Pas récemment.');
    sound.page && sound.page();
  },
  // --------------------------------------------------------------- carte de base (une fois par vallée)
  build() {
    const w = game.world, N = w.N, S = 512, cv = document.createElement('canvas');
    cv.width = S; cv.height = S;
    const ctx = cv.getContext('2d'), img = ctx.createImageData(S, S), D = img.data;
    const WL = w.waterLevel, step = N / S;
    // densité des arbres
    const tree = new Uint16Array(S * S);
    for (const o of w.objects) { const t = OBJ_TYPES[o.t]; if (!t || t.cat !== 'Arbres' || o.cleared) continue; const i = clamp(Math.floor(o.x / w.size * S), 0, S - 1), j = clamp(Math.floor(o.z / w.size * S), 0, S - 1); tree[j * S + i]++; }
    const hAt = (i, j) => w.heights[clamp(Math.round(j * step), 0, N) * w.W + clamp(Math.round(i * step), 0, N)];
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
      const h = hAt(i, j), k = (j * S + i) * 4;
      const m = w.mats[clamp(Math.round(j * step), 0, N) * w.W + clamp(Math.round(i * step), 0, N)];
      let c;
      if (h < WL) { const d = clamp((WL - h) / 6, 0, 1); c = [lerp(150, 92, d), lerp(170, 120, d), lerp(170, 150, d)]; }
      else {
        c = m === M_SNOW ? [236, 238, 240] : m === M_ICE ? [196, 218, 230] : m === M_SAND ? [214, 196, 150] : m === M_ROCK ? [150, 144, 132] : m === M_DIRT ? [176, 138, 96] : m === M_COBBLE ? [150, 132, 110] : m === M_DRY ? [188, 184, 128] : m === M_FLOWERS ? [170, 188, 120] : m === M_LUSH ? [140, 170, 106] : [158, 180, 116];
        // relief (ombrage de colline)
        const sh = clamp(0.92 + (hAt(i - 1, j - 1) - hAt(i + 1, j + 1)) * 0.06, 0.6, 1.25);
        c = c.map((v) => v * sh);
        const tr = tree[j * S + i] + (tree[j * S + i + 1] || 0);
        if (tr) c = v3.lerp(c, [86, 120, 72], Math.min(0.65, tr * 0.22));
        if (h > WL + 30 && m !== M_SNOW && m !== M_ICE) c = v3.lerp(c, [196, 188, 172], clamp((h - WL - 30) / 30, 0, 0.5));
      }
      // papier : grain, taches
      const g = hash2i(i, j, 5) * 14 - 7, sep = 0.72;
      const l = c[0] * 0.3 + c[1] * 0.55 + c[2] * 0.15;
      D[k] = clamp(lerp(c[0], l * 1.12 + 18, 1 - sep) + g, 0, 255);
      D[k + 1] = clamp(lerp(c[1], l * 1.0 + 8, 1 - sep) + g, 0, 255);
      D[k + 2] = clamp(lerp(c[2], l * 0.78, 1 - sep) + g, 0, 255);
      D[k + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    // bâtiments, remparts
    const P = (x, z) => [x / w.size * S, z / w.size * S];
    // chemins (graphe des habitants)
    const NV = w.nav;
    ctx.strokeStyle = 'rgba(120,80,44,.75)'; ctx.lineWidth = 1.3; ctx.setLineDash([3, 2]);
    ctx.beginPath();
    for (const [a, b2] of NV.edges) {
      const A = NV.nodes[a], Bn = NV.nodes[b2];
      if (!A || !Bn || A.iso || Bn.iso || !/chemin|route|ponton|hameau|ranch|cimetiere|pont/.test(A.tag + Bn.tag) || /rue|place/.test(A.tag + Bn.tag)) continue;
      if (Math.hypot(A.x - Bn.x, A.z - Bn.z) > 45) continue;
      const [x0, y0] = P(A.x, A.z), [x1, y1] = P(Bn.x, Bn.z); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
    }
    ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(70,48,30,.85)';
    for (const k in w.bld) { const b = w.bld[k], [x, y] = P(b.x, b.z); ctx.fillRect(x - 1.5, y - 1.5, 3, 3); }
    if (w.townInfo) { const [x, y] = P(w.townInfo.x, w.townInfo.z), r = 48 / w.size * S; ctx.strokeStyle = 'rgba(70,48,30,.9)'; ctx.lineWidth = 1.5; ctx.strokeRect(x - r, y - r, r * 2, r * 2); }
    this.base = cv; this.baseWorld = w;
    return cv;
  },
  // lieux affichés sur la carte (les secrets n'y figurent pas)
  labels(old) {
    const w = game.world, lm = w.lm, out = [];
    const show = ['ferme', 'hameau', 'lac', 'moulin', 'mine', 'cercle', 'chapelle', 'hameau_abandonne', 'tour', 'marais', 'ruines', 'chene', 'phare', 'cimetiere', 'hutte_ermite', 'abbaye', 'chateau', 'lavoir', 'dolmen', 'menhirs', 'bergerie', 'charbonniere', 'refuge', 'lac_gele', 'glacier', 'monts', 'combe', 'col', 'lac_noir', 'clairiere', 'source', 'bouche_galerie'];
    if (w.townInfo) out.push([fmtLine('{ville}', null), w.townInfo.x, w.townInfo.z, 1]);
    for (const k of show) {
      const L = lm[k];
      if (!L || L.secret) continue;
      let n = k === 'hameau' ? fmtLine('{hameau}', null) : (LIEU_NAMES[k] || k).replace(/^(le |la |les |l’)/, (m) => m.trim() === 'l’' ? '' : '');
      n = n.charAt(0).toUpperCase() + n.slice(1);
      if (old && k === 'lac') n = 'Saint-Aubin-des-Eaux';
      if (old && k === 'hameau_abandonne') n = 'Le hameau du Puits';
      if (old && k === 'ferme') n = 'Ferme Varenne';
      out.push([n, L.x, L.z, 0]);
    }
    if (old && lm.chateau) out.push(['✝ Valmont', lm.chateau.x, lm.chateau.z + 30, 0]);
    return out;
  },
  draw(cv, opts) {
    const w = game.world, S = 512, ctx = cv.getContext('2d');
    if (!this.base || this.baseWorld !== w) this.build();
    const crop = opts.crop; // { x, z, r } : zoom (carte au trésor)
    ctx.save();
    ctx.fillStyle = '#e2d4ac'; ctx.fillRect(0, 0, cv.width, cv.height);
    const W = cv.width, Hh = cv.height, pad = 18;
    let sx = 0, sy = 0, sw = S, sh = S;
    if (crop) { const k = S / w.size; sw = sh = crop.r * 2 * k; sx = crop.x * k - sw / 2; sy = crop.z * k - sh / 2; }
    ctx.imageSmoothingEnabled = !!crop;
    if (opts.old) ctx.filter = 'sepia(0.8) contrast(0.9) brightness(0.95)';
    ctx.drawImage(this.base, sx, sy, sw, sh, pad, pad, W - pad * 2, Hh - pad * 2);
    ctx.filter = 'none';
    const toC = (x, z) => [pad + ((x / w.size * S) - sx) / sw * (W - pad * 2), pad + ((z / w.size * S) - sy) / sh * (Hh - pad * 2)];
    // noms (sans se chevaucher : on décale, ou l'on renonce)
    ctx.textAlign = 'center';
    const used = [];
    const lab = this.labels(opts.old).sort((a, b) => b[3] - a[3]);
    for (const [n, x, z, big] of lab) {
      const [px, py] = toC(x, z);
      if (px < pad || py < pad || px > W - pad || py > Hh - pad) continue;
      ctx.font = (big ? 'bold 15px' : 'italic 12px') + ' Georgia, serif';
      const tw = ctx.measureText(n).width + 6, th = big ? 17 : 14;
      let placed = null;
      for (const dy of [-6, 14, -20, 28]) {
        const r = [px - tw / 2, py + dy - th + 3, tw, th];
        if (!used.some((u) => r[0] < u[0] + u[2] && r[0] + r[2] > u[0] && r[1] < u[1] + u[3] && r[1] + r[3] > u[1])) { placed = dy; used.push(r); break; }
      }
      ctx.fillStyle = opts.old ? '#5a3a20' : '#3a2a1a'; ctx.fillRect(px - 1, py - 1, 2, 2);
      if (placed === null) continue;
      ctx.fillStyle = 'rgba(236,224,196,.75)'; ctx.fillText(n, px + 1, py + placed + 1);
      ctx.fillStyle = opts.old ? '#5a3a20' : '#3a2a1a'; ctx.fillText(n, px, py + placed);
    }
    // croix au trésor
    if (opts.x !== undefined && opts.cross) {
      const [px, py] = toC(opts.x, opts.z);
      ctx.strokeStyle = '#a0201a'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(px - 8, py - 8); ctx.lineTo(px + 8, py + 8); ctx.moveTo(px + 8, py - 8); ctx.lineTo(px - 8, py + 8); ctx.stroke();
    }
    // vous êtes ici
    if (opts.here) {
      const [px, py] = toC(opts.here[0], opts.here[1]);
      ctx.fillStyle = '#b0201a'; ctx.beginPath(); ctx.arc(px, py, 5, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#2a1a10'; ctx.lineWidth = 1.5; ctx.stroke();
      if (opts.yaw !== undefined) { const a = opts.yaw + Math.PI; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.sin(a) * 14, py + Math.cos(a) * 14); ctx.strokeStyle = '#b0201a'; ctx.lineWidth = 2.5; ctx.stroke(); }
      ctx.font = 'italic 13px Georgia, serif'; ctx.fillStyle = '#6a1a10'; ctx.fillText(opts.hereLabel || 'Vous êtes ici', px, py + 18);
    }
    // rose des vents
    const rx = W - 44, ry = Hh - 48;
    ctx.strokeStyle = '#4a3420'; ctx.fillStyle = '#4a3420'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(rx, ry - 20); ctx.lineTo(rx + 5, ry); ctx.lineTo(rx, ry + 20); ctx.lineTo(rx - 5, ry); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(rx, ry - 20); ctx.lineTo(rx + 5, ry); ctx.lineTo(rx - 5, ry); ctx.closePath(); ctx.fill();
    ctx.font = 'bold 12px Georgia, serif'; ctx.fillText('N', rx, ry - 24);
    // cadre
    ctx.strokeStyle = '#5a4028'; ctx.lineWidth = 3; ctx.strokeRect(pad - 4, pad - 4, W - pad * 2 + 8, Hh - pad * 2 + 8);
    ctx.lineWidth = 1; ctx.strokeRect(pad - 8, pad - 8, W - pad * 2 + 16, Hh - pad * 2 + 16);
    ctx.restore();
  },
  show(title, opts, foot) {
    ui.open('#mapview', `<div class="tabs"><b>${esc(title)}</b><button class="x" data-close>✕</button></div><div class="body map"><canvas width="560" height="560"></canvas></div>${foot ? `<div class="foot">${esc(foot)}</div>` : ''}`);
    $('#mapview [data-close]').onclick = () => ui.close();
    this.draw($('#mapview canvas'), opts);
  },
  // panneau-carte : « vous êtes ici »
  board(it) {
    const d = it.data, p = game.player;
    const title = d.old ? 'Une vieille carte délavée' : 'Carte de la vallée';
    const foot = (typeof LORE_TEXT !== 'undefined' && LORE_TEXT.panneaux && LORE_TEXT.panneaux[d.key]) || (d.old ? 'Certains noms ne disent plus rien à personne.' : 'Carte dressée par la mairie de ' + farm.names.ville + '.');
    this.show(title, { here: [d.x, d.z], old: d.old }, fmtLine(foot, null));
    farm.s.flags['vu_carte_' + d.key] = 1;
  },
  valleyMap() {
    const p = game.player, under = p.underground;
    this.show('Carte de la vallée', { here: under ? null : [p.pos[0], p.pos[2]], yaw: p.yaw, hereLabel: 'Vous' }, under ? 'Sous terre, la carte ne vous dit plus où vous êtes.' : '');
  },
  treasureMap() {
    const s = farm.s, m = (s.maps || []).find((q) => !q.found) || dig.newMap();
    if (!m) { ui.subtitle('', '(La carte est illisible.)', 2); return; }
    this.show('Une carte au trésor', { crop: { x: m.x + ((m.x * 7) % 60) - 30, z: m.z + ((m.z * 3) % 60) - 30, r: 230 }, x: m.x, z: m.z, cross: true, old: true }, 'Une croix à l’encre rouge. Au dos : « Creuse trois fois, là où ça sonne creux. »');
  },
};
HOOKS.inter.sign = (it) => signs.read(it);
HOOKS.inter.mapboard = (it) => signs.board(it);
HOOKS.inter.borne = (it) => {
  const d = it.data, txt = (typeof LORE_TEXT !== 'undefined' && LORE_TEXT.bornes && LORE_TEXT.bornes[d.i]) || 'VALMONT · 1791';
  ui.read('Une borne gravée', txt + '\n\n(Sur le dessus, une flèche gravée pointe vers ' + game.world.cardinal(d.dir) + '.)');
  farm.s.flags['borne' + d.i] = 1;
};
