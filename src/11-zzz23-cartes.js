// ============================================================================
//  LES CARTES : toujours approximatives, jamais la vallée entière.
//  Une carte est dessinée à la main, à la demande : le relief et les eaux sont
//  relevés grossièrement puis DÉFORMÉS (bruit, décalage, légère rotation), les
//  forêts hachurées, et seuls les lieux que le personnage connaît (savoir.lieuConnu)
//  y figurent, à des places approximatives, par des symboles. Jamais de « vous
//  êtes ici », jamais d'emplacement exact.
//  - cartes de régions (objets use:'region', CARTES_REGIONS) : clic, ou depuis la sacoche ;
//  - panneaux-cartes des villes : les environs seulement, incomplets ;
//  - cartes au trésor : un croquis vague, et quelques mots au dos ;
//  - la carte ancienne (atlas de la bibliothèque) : les noms d'autrefois.
//  API : cartes.ouvrir(région), cartes.dessiner(canvas, opts), cartes.croquis(x, z, r, titre).
//  État : farm.s.cartes = { vues: { région: jour } }
// ============================================================================
const CARTES_SYM = {
  ferme: 'maison', hameau: 'hameau', hameau_abandonne: 'ruines', ranch: 'maison', ponton: 'pont', cabane_pecheur: 'maison', phare: 'phare', hutte_ermite: 'maison',
  moulin: 'moulin', mine: 'mine', cercle: 'cercle', chapelle: 'eglise', vieux_puits: 'puits', tour: 'tour', ruines: 'ruines', chene: 'arbre', cimetiere: 'croix',
  pont_riviere: 'pont', pont_riviere1: 'pont', bouche_galerie: 'grotte', faille: 'grotte', pierre_offrandes: 'pierres', pierre_dame: 'pierres', source: 'source',
  cercle_fees: 'cercle', dolmen: 'dolmen', menhirs: 'pierres', abbaye: 'eglise', chateau: 'chateau', charbonniere: 'tente', bergerie: 'maison', lavoir: 'source',
  clocher_noye: 'eglise', ilot: 'point', tombe_lise: 'croix', grotte_cristaux: 'grotte', antre: 'grotte', grotte_contrebandiers: 'grotte', grotte_peinte: 'grotte',
  refuge: 'maison', col: 'col', bibliotheque: 'grand', sources: 'hameau', relais_chasse: 'maison', roulottes: 'tente', cascade: 'source', fente_nains: 'grotte',
};
const CARTES_ZONES = new Set(['lac', 'lac_gele', 'lac_noir', 'marais', 'foret', 'monts', 'glacier', 'combe', 'riviere']);
const CARTES_VILLE = new Set(['place', 'marche', 'puits_ville', 'eglise', 'pont_nord', 'pont_sud', 'mairie', 'auberge', 'boulangerie', 'poste', 'forge', 'graineterie', 'garde', 'echoppe', 'vide6']);
const CARTES_CONIF = new Set(['pine', 'sapin', 'sapin_neige', 'meleze']);

const cartes = {
  S() { const s = farm.s; const C = s.cartes || (s.cartes = {}); if (!C.vues || typeof C.vues !== 'object') C.vues = {}; return C; },
  // densité des arbres (relevée une fois par vallée)
  arbres(w) {
    if (w._cartesArbres) return w._cartesArbres;
    const G = 24, n = Math.ceil(w.size / G), A = new Uint16Array(n * n), C = new Uint16Array(n * n);
    for (const o of w.objects) {
      const t = OBJ_TYPES[o.t];
      if (!t || t.cat !== 'Arbres') continue;
      const i = clamp((o.x / G) | 0, 0, n - 1), j = clamp((o.z / G) | 0, 0, n - 1);
      A[j * n + i]++; if (CARTES_CONIF.has(t.id)) C[j * n + i]++;
    }
    return (w._cartesArbres = { G, n, A, C });
  },
  nomLieu(k, L, old) {
    if (old) { const O = { lac: 'Saint-Aubin-des-Eaux', hameau_abandonne: 'Le hameau du Puits', ferme: 'Ferme Varenne' }; if (O[k]) return O[k]; }
    let n = k === 'hameau' ? (farm.names && farm.names.hameau) || 'le hameau' : LIEU_NAMES[k] || L.name || k;
    n = String(n).replace(/^(le |la |les )/, '').replace(/^l’|^l'/, '');
    return n.charAt(0).toUpperCase() + n.slice(1);
  },
  villeConnue() { for (const k of CARTES_VILLE) if (savoir.lieuConnu(k)) return true; return false; },

  // ------------------------------------------------------------ le dessin
  // o : { cx, cz, r, seed, titre, sous, A (déformation), rot, blancs, old, lieux: 'connus'|'aucun', croix: {x, z}, croquis, geants }
  dessiner(cv, o) {
    const w = game.world, S = cv.width, ctx = cv.getContext('2d'), WL = w.waterLevel;
    const rnd = mulberry32((o.seed | 0) + 17);
    const pad = 24, M = S - pad * 2;
    // la déformation (toujours la même pour une même carte)
    const th = (rnd() - 0.5) * (o.rot ?? 0.14), ct = Math.cos(th), st = Math.sin(th);
    const offX = (rnd() - 0.5) * o.r * 0.09, offZ = (rnd() - 0.5) * o.r * 0.09;
    const A = o.A ?? 0.06, ph = []; for (let k = 0; k < 6; k++) ph.push(rnd() * TAU);
    const fr = [1.2 + rnd() * 1.1, 1.0 + rnd() * 1.1, 2.1 + rnd() * 1.6, 1.9 + rnd() * 1.6];
    const D = (u, v) => [A * (Math.sin(u * fr[0] + ph[0]) * Math.cos(v * fr[1] + ph[1]) + 0.45 * Math.sin((u + v) * fr[2] + ph[2])), A * (Math.cos(u * fr[1] + ph[3]) * Math.sin(v * fr[0] + ph[4]) + 0.45 * Math.cos((u - v) * fr[3] + ph[5]))];
    const toW = (u, v) => { const [du, dv] = D(u, v); return [o.cx + offX + (u * ct - v * st + du) * o.r, o.cz + offZ + (u * st + v * ct + dv) * o.r]; };
    const toM = (x, z) => {
      const qx = (x - o.cx - offX) / o.r, qz = (z - o.cz - offZ) / o.r;
      let u = qx * ct + qz * st, v = -qx * st + qz * ct;
      for (let k = 0; k < 5; k++) { const [du, dv] = D(u, v), a = qx - du, b = qz - dv; u = a * ct + b * st; v = -a * st + b * ct; }
      return [u, v];
    };
    const cX = (u) => pad + (u + 1) / 2 * M;
    // ---- le papier
    ctx.save();
    ctx.fillStyle = o.old ? '#dcc9a0' : '#e6d8b2'; ctx.fillRect(0, 0, S, S);
    for (let k = 0; k < 900; k++) { ctx.fillStyle = `rgba(${90 + rnd() * 60},${60 + rnd() * 40},${30 + rnd() * 20},${0.03 + rnd() * 0.05})`; const r = 0.6 + rnd() * 2.2; ctx.fillRect(rnd() * S, rnd() * S, r, r); }
    for (let k = 0; k < 5; k++) { const x = rnd() * S, y = rnd() * S, r = 20 + rnd() * 70, g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(150,110,60,.10)'); g.addColorStop(1, 'rgba(150,110,60,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
    ctx.strokeStyle = 'rgba(120,90,50,.18)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(S / 2 + (rnd() - 0.5) * 6, 0); ctx.lineTo(S / 2 + (rnd() - 0.5) * 6, S); ctx.moveTo(0, S / 2 + (rnd() - 0.5) * 6); ctx.lineTo(S, S / 2 + (rnd() - 0.5) * 6); ctx.stroke();
    // ---- le relevé (grille grossière, en coordonnées de carte)
    const G = o.croquis ? 56 : 96, N1 = G + 1, H = new Float32Array(N1 * N1), MT = new Uint8Array(N1 * N1);
    for (let j = 0; j <= G; j++) for (let i = 0; i <= G; i++) {
      const [x, z] = toW(i / G * 2 - 1, j / G * 2 - 1), k = j * N1 + i;
      if (!w.inside(x, z, 4)) { H[k] = NaN; continue; }
      H[k] = w.heightAt(x, z); MT[k] = w.matAt(x, z);
    }
    const L = document.createElement('canvas'); L.width = S; L.height = S;
    const lx = L.getContext('2d');
    const P = (gi, gj) => [pad + gi / G * M, pad + gj / G * M];
    // eaux et neiges : taches douces
    const mk = (fn, col) => {
      const c = document.createElement('canvas'); c.width = N1; c.height = N1;
      const cx = c.getContext('2d'), im = cx.createImageData(N1, N1);
      for (let k = 0; k < N1 * N1; k++) if (!isNaN(H[k]) && fn(k)) { im.data[k * 4] = col[0]; im.data[k * 4 + 1] = col[1]; im.data[k * 4 + 2] = col[2]; im.data[k * 4 + 3] = col[3]; }
      cx.putImageData(im, 0, 0);
      lx.imageSmoothingEnabled = true; lx.drawImage(c, 0, 0, N1, N1, pad - M / G / 2, pad - M / G / 2, M + M / G, M + M / G);
    };
    const eau = (k) => H[k] < WL;
    mk((k) => (MT[k] === M_SNOW || MT[k] === M_ICE || H[k] > WL + 125) && !eau(k), [250, 250, 246, 150]);
    mk(eau, [118, 148, 158, 140]);
    // lignes de niveau (un trait d'encre sur la rive, des traits pâles pour le relief)
    const SEG = { 1: [[3, 2]], 2: [[2, 1]], 3: [[3, 1]], 4: [[0, 1]], 5: [[3, 0], [2, 1]], 6: [[0, 2]], 7: [[3, 0]], 8: [[3, 0]], 9: [[0, 2]], 10: [[3, 2], [0, 1]], 11: [[0, 1]], 12: [[3, 1]], 13: [[2, 1]], 14: [[3, 2]] };
    const iso = (lev) => {
      lx.beginPath();
      for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
        const a = H[j * N1 + i], b = H[j * N1 + i + 1], c = H[(j + 1) * N1 + i + 1], d = H[(j + 1) * N1 + i];
        if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d)) continue;
        const id = (a > lev ? 8 : 0) | (b > lev ? 4 : 0) | (c > lev ? 2 : 0) | (d > lev ? 1 : 0);
        const sg = SEG[id];
        if (!sg) continue;
        const t = (p, q) => (lev - p) / (q - p || 1e-6);
        const e = [[i + t(a, b), j], [i + 1, j + t(b, c)], [i + t(d, c), j + 1], [i, j + t(a, d)]];
        for (const [p0, p1] of sg) { const A0 = P(e[p0][0], e[p0][1]), A1 = P(e[p1][0], e[p1][1]); lx.moveTo(A0[0], A0[1]); lx.lineTo(A1[0], A1[1]); }
      }
      lx.stroke();
    };
    lx.lineCap = 'round';
    if (!o.croquis) {
      let hmax = WL; for (let k = 0; k < H.length; k++) if (H[k] > hmax) hmax = H[k];
      const pas = o.r > 600 ? 20 : o.r > 300 ? 12 : 6;
      for (let lev = WL + pas, n = 1; lev < hmax; lev += pas, n++) { lx.strokeStyle = n % 5 ? 'rgba(120,88,52,.22)' : 'rgba(110,78,44,.4)'; lx.lineWidth = n % 5 ? 0.7 : 1.1; iso(lev); }
    }
    lx.strokeStyle = 'rgba(48,62,72,.85)'; lx.lineWidth = 1.4; iso(WL);
    // hachures des eaux
    const echant = (px, py) => { const gi = Math.round((px - pad) / M * G), gj = Math.round((py - pad) / M * G); if (gi < 0 || gj < 0 || gi > G || gj > G) return NaN; return H[gj * N1 + gi]; };
    lx.strokeStyle = 'rgba(60,82,98,.34)'; lx.lineWidth = 0.9; lx.beginPath();
    for (let y = pad + 4; y < S - pad; y += 7) for (let x = pad + (y % 14 ? 0 : 6); x < S - pad; x += 16) { const h = echant(x, y), h2 = echant(x + 10, y); if (h < WL - 0.6 && h2 < WL - 0.6) { lx.moveTo(x, y); lx.quadraticCurveTo(x + 5, y - 1.8, x + 10, y); } }
    lx.stroke();
    // montagnes et collines
    const pic = (x, y, s, neige) => {
      lx.fillStyle = neige ? 'rgba(252,252,248,.95)' : 'rgba(226,212,178,.9)';
      lx.beginPath(); lx.moveTo(x - s, y); lx.lineTo(x - s * 0.1, y - s * 1.3); lx.lineTo(x + s, y); lx.closePath(); lx.fill();
      lx.strokeStyle = 'rgba(70,52,34,.85)'; lx.lineWidth = 1.1; lx.beginPath(); lx.moveTo(x - s, y); lx.lineTo(x - s * 0.1, y - s * 1.3); lx.lineTo(x + s, y); lx.stroke();
      lx.strokeStyle = 'rgba(70,52,34,.45)'; lx.lineWidth = 0.7; lx.beginPath();
      for (let k = 1; k < 4; k++) { const f = k / 4; lx.moveTo(x - s * 0.1 + (s * 1.1) * f * 0.5, y - s * 1.3 * (1 - f * 0.5)); lx.lineTo(x - s * 0.1 + s * 0.2 + (s * 1.1) * f * 0.5, y); }
      lx.stroke();
    };
    // (des pics épars, plus grands et plus serrés là où c'est plus haut ; des bosses sur les collines)
    const pasP = o.croquis ? 34 : 30, pics = [];
    for (let y = pad + 12; y < S - pad; y += pasP * 0.8) for (let x = pad + 10 + ((y / pasP | 0) % 2) * pasP / 2; x < S - pad; x += pasP) {
      const jx = x + (rnd() - 0.5) * pasP * 0.6, jy = y + (rnd() - 0.5) * pasP * 0.5, h = echant(jx, jy);
      if (!(h > WL + 30)) continue;
      if (h > WL + 52) { if (rnd() < (h > WL + 90 ? 0.8 : 0.5)) pics.push([jx, jy, clamp((h - WL - 30) / 7, 6, 16) * (S / 560), h > WL + 105]); }
      else if (rnd() < 0.3) { lx.strokeStyle = 'rgba(90,66,40,.5)'; lx.lineWidth = 0.9; lx.beginPath(); lx.arc(jx, jy + 3, 5, Math.PI * 1.15, Math.PI * 1.85); lx.stroke(); }
    }
    pics.sort((a, b) => a[1] - b[1]);
    for (const [x, y, s, n] of pics) pic(x, y, s, n);
    // forêts
    const AR = this.arbres(w), pasA = o.croquis ? 13 : 11;
    for (let y = pad + 6; y < S - pad; y += pasA) for (let x = pad + 6; x < S - pad; x += pasA) {
      const jx = x + (rnd() - 0.5) * pasA * 0.8, jy = y + (rnd() - 0.5) * pasA * 0.8;
      const [wx, wz] = toW((jx - pad) / M * 2 - 1, (jy - pad) / M * 2 - 1);
      if (!w.inside(wx, wz, 4)) continue;
      const i = clamp((wx / AR.G) | 0, 0, AR.n - 1), j = clamp((wz / AR.G) | 0, 0, AR.n - 1), dens = AR.A[j * AR.n + i];
      if (dens < 3 + rnd() * 7) continue;
      const conif = AR.C[j * AR.n + i] > dens * 0.5, s = 3.2 + rnd() * 1.4;
      // les bois : des hachures, et çà et là un arbre dessiné
      if (rnd() < 0.62) {
        lx.strokeStyle = 'rgba(58,80,48,.55)'; lx.lineWidth = 0.8; lx.beginPath();
        for (let q = -1; q <= 1; q++) { lx.moveTo(jx - 3.5 + q * 3.2, jy + 3.5); lx.lineTo(jx + 1.5 + q * 3.2, jy - 3.5); }
        lx.stroke();
        continue;
      }
      lx.strokeStyle = 'rgba(52,72,44,.8)'; lx.lineWidth = 0.9; lx.fillStyle = 'rgba(96,120,74,.3)';
      lx.beginPath();
      if (conif) { lx.moveTo(jx, jy - s * 1.6); lx.lineTo(jx + s * 0.8, jy + s * 0.4); lx.lineTo(jx - s * 0.8, jy + s * 0.4); lx.closePath(); }
      else lx.arc(jx, jy - s * 0.5, s * 0.85, 0, TAU);
      lx.fill(); lx.stroke();
      lx.beginPath(); lx.moveTo(jx, jy + (conif ? s * 0.4 : s * 0.3)); lx.lineTo(jx, jy + s * 0.9); lx.stroke();
    }
    // chemins (pointillés)
    if (!o.croquis && w.nav) {
      const NV = w.nav;
      lx.strokeStyle = 'rgba(112,72,40,.7)'; lx.lineWidth = 1.2; lx.setLineDash([2.5, 3]); lx.beginPath();
      for (const [a, b] of NV.edges) {
        const Na = NV.nodes[a], Nb = NV.nodes[b];
        if (!Na || !Nb || Na.iso || Nb.iso) continue;
        const tg = Na.tag + ' ' + Nb.tag;
        if (!/chemin|route|pont|hameau|ranch|cimetiere|ponton/.test(tg) || /rue|place|:in|:mid/.test(tg)) continue;
        if (Math.hypot(Na.x - Nb.x, Na.z - Nb.z) > 60) continue;
        const [u0, v0] = toM(Na.x, Na.z), [u1, v1] = toM(Nb.x, Nb.z);
        if (Math.max(Math.abs(u0), Math.abs(v0), Math.abs(u1), Math.abs(v1)) > 1) continue;
        lx.moveTo(cX(u0), cX(v0)); lx.lineTo(cX(u1), cX(v1));
      }
      lx.stroke(); lx.setLineDash([]);
    }
    // les blancs : ce que le cartographe n'a pas vu
    const nb = Math.round((o.blancs || 0) * 6);
    lx.globalCompositeOperation = 'destination-out';
    for (let k = 0; k < nb; k++) {
      const x = pad + rnd() * M, y = pad + rnd() * M, r = M * (0.1 + rnd() * 0.14);
      const g = lx.createRadialGradient(x, y, r * 0.35, x, y, r); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      lx.fillStyle = g; lx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    // bords : la carte s'efface vers ses marges
    const g0 = lx.createRadialGradient(S / 2, S / 2, M * 0.42, S / 2, S / 2, M * 0.74); g0.addColorStop(0, 'rgba(0,0,0,0)'); g0.addColorStop(1, 'rgba(0,0,0,1)');
    lx.fillStyle = g0; lx.fillRect(0, 0, S, S);
    lx.globalCompositeOperation = 'source-over';
    if (o.old) ctx.filter = 'sepia(0.55) contrast(0.92)';
    ctx.drawImage(L, 0, 0);
    ctx.filter = 'none';
    // ---- les lieux (connus seulement), à peu près à leur place
    const ink = o.old ? '#5a3a20' : '#3a2a1a';
    const used = [];
    const poser = (texte, x, y, font, dys) => {
      ctx.font = font;
      const tw = ctx.measureText(texte).width + 6, thh = parseInt(font.match(/(\d+)px/)[1], 10) + 3;
      for (const dy of dys) {
        const r = [x - tw / 2, y + dy - thh + 3, tw, thh];
        if (r[0] < pad || r[0] + r[2] > S - pad || r[1] < pad + 30 || r[1] + r[3] > S - pad) continue;
        if (used.some((q) => r[0] < q[0] + q[2] && r[0] + r[2] > q[0] && r[1] < q[1] + q[3] && r[1] + r[3] > q[1])) continue;
        used.push(r);
        ctx.fillStyle = 'rgba(236,224,196,.7)'; ctx.fillText(texte, x + 1, y + dy + 1);
        ctx.fillStyle = ink; ctx.fillText(texte, x, y + dy);
        return true;
      }
      return false;
    };
    ctx.textAlign = 'center';
    const lieux = [];
    const vague = (k, x, z) => { const h = hashString(k + ':' + (o.seed | 0)) >>> 0, a = (h % 628) / 100, d = Math.max(8, o.r * 0.045) * (0.4 + ((h >>> 10) % 100) / 160); return [x + Math.cos(a) * d, z + Math.sin(a) * d]; };
    if (o.lieux !== 'aucun') {
      const lm = w.lm;
      if (w.townInfo && (o.old || this.villeConnue())) lieux.push({ k: 'ville', nom: (farm.names && farm.names.ville) || 'La ville', sym: 'ville', x: w.townInfo.x, z: w.townInfo.z, big: 2 });
      if (o.old && lm.chateau) lieux.push({ k: 'valmont', nom: '✝ Valmont', sym: 'hameau', x: lm.chateau.x, z: lm.chateau.z + 30, big: 0 });
      for (const k in lm) {
        const Ld = lm[k];
        if (Ld.under || Ld.secret || CARTES_VILLE.has(k) || /^roulotte_|^campement|^galeries/.test(k)) continue;
        if (!savoir.lieuConnu(k) && !(o.old && ['lac', 'hameau_abandonne', 'chateau', 'cercle', 'dolmen', 'menhirs', 'abbaye'].includes(k))) continue;
        const zone = CARTES_ZONES.has(k) && !(o.old && k === 'lac');
        lieux.push({ k, nom: this.nomLieu(k, Ld, o.old), sym: zone ? null : (o.old && k === 'lac' ? 'hameau' : CARTES_SYM[k] || (/^calvaire/.test(k) ? 'croix' : 'point')), x: Ld.x, z: Ld.z, big: zone ? 1 : 0 });
      }
      if (o.old && lm.cascade) lieux.push({ k: 'thalen', nom: 'Thalen', sym: 'aelin', x: lm.cascade.x, z: lm.cascade.z, big: 0 });
    }
    // symboles d'abord, puis les noms (les grands d'abord)
    const pts = [];
    for (const q of lieux) {
      const [vx, vz] = q.k === 'ville' ? [q.x, q.z] : vague(q.k, q.x, q.z);
      const [u, v] = toM(vx, vz);
      if (Math.abs(u) > 0.93 || Math.abs(v) > 0.93) continue;
      pts.push(Object.assign({ px: cX(u), py: cX(v) }, q));
    }
    for (const q of pts) if (q.sym) this.symbole(ctx, q.sym, q.px, q.py, ink, o);
    pts.sort((a, b) => b.big - a.big);
    for (const q of pts) {
      if (q.big === 1) { ctx.save(); ctx.translate(q.px, q.py); ctx.rotate(((hashString(q.k) >>> 0) % 40 - 20) / 200); ctx.font = 'italic 15px Georgia, serif'; ctx.fillStyle = /lac|marais|riviere/.test(q.k) ? 'rgba(40,58,72,.85)' : 'rgba(78,58,36,.85)'; const t = T(q.nom).split('').join(String.fromCharCode(8202)); ctx.fillText(t, 0, 0); ctx.restore(); used.push([q.px - 60, q.py - 14, 120, 18]); continue; }
      poser(T(q.nom), q.px, q.py, q.big === 2 ? 'bold 14px Georgia, serif' : 'italic 12px Georgia, serif', [-9, 17, -21, 29]);
    }
    // ---- la croix (carte au trésor), approximative elle aussi
    if (o.croix) {
      const h = hashString('croix' + (o.seed | 0)) >>> 0, a = (h % 628) / 100, d = 3 + (h >>> 8) % 5;
      const [u, v] = toM(o.croix.x + Math.cos(a) * d, o.croix.z + Math.sin(a) * d), x = cX(u), y = cX(v);
      // un chemin de pointillés depuis le bord
      ctx.strokeStyle = 'rgba(120,40,24,.7)'; ctx.lineWidth = 1.4; ctx.setLineDash([3, 4]); ctx.beginPath();
      const ex = pad + 20 + rnd() * (M - 40), ey = S - pad - 10;
      ctx.moveTo(ex, ey); ctx.bezierCurveTo(ex + (rnd() - 0.5) * 160, ey - 120, x + (rnd() - 0.5) * 160, y + 90, x, y + 8); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = '#a0201a'; ctx.lineWidth = 3.2; ctx.beginPath(); ctx.moveTo(x - 9, y - 9); ctx.lineTo(x + 9, y + 9); ctx.moveTo(x + 9, y - 9); ctx.lineTo(x - 9, y + 9); ctx.stroke();
    }
    // ---- des géants dans les marges
    if (o.geants) { ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeStyle = ink; ctx.lineWidth = 1.2; const gx = S - pad - 30, gy = S - pad - 90; ctx.beginPath(); ctx.arc(gx, gy - 38, 6, 0, TAU); ctx.moveTo(gx, gy - 32); ctx.lineTo(gx, gy); ctx.moveTo(gx, gy); ctx.lineTo(gx - 8, gy + 26); ctx.moveTo(gx, gy); ctx.lineTo(gx + 8, gy + 26); ctx.moveTo(gx - 14, gy - 22); ctx.lineTo(gx, gy - 26); ctx.lineTo(gx + 14, gy - 18); ctx.stroke(); ctx.restore(); }
    // ---- rose des vents (le nord de la carte, qui n'est pas tout à fait en haut)
    {
      const [u0, v0] = toM(o.cx, o.cz), [u1, v1] = toM(o.cx, o.cz - o.r * 0.3), an = Math.atan2(u1 - u0, -(v1 - v0));
      const rx = S - pad - 34, ry = S - pad - 40;
      ctx.save(); ctx.translate(rx, ry); ctx.rotate(an);
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(5, 0); ctx.lineTo(0, 20); ctx.lineTo(-5, 0); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(5, 0); ctx.lineTo(-5, 0); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(14, 0); ctx.stroke();
      ctx.font = 'bold 12px Georgia, serif'; ctx.textAlign = 'center'; ctx.fillText(T('N'), 0, -24);
      ctx.restore();
    }
    // ---- cartouche du titre
    if (o.titre) {
      ctx.font = 'italic 17px Georgia, serif';
      const t = T(o.titre), tw = Math.min(M - 40, ctx.measureText(t).width + 40), x0 = S / 2 - tw / 2, y0 = pad + 4;
      ctx.fillStyle = 'rgba(236,224,196,.92)'; ctx.fillRect(x0, y0, tw, o.sous ? 40 : 26);
      ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.strokeRect(x0 + 0.5, y0 + 0.5, tw - 1, (o.sous ? 40 : 26) - 1); ctx.strokeRect(x0 + 3.5, y0 + 3.5, tw - 7, (o.sous ? 40 : 26) - 7);
      ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.fillText(t, S / 2, y0 + 19);
      if (o.sous) { ctx.font = 'italic 11px Georgia, serif'; ctx.fillText(T(o.sous), S / 2, y0 + 33); }
    }
    // ---- cadre
    ctx.strokeStyle = o.old ? '#6a4a28' : '#5a4028'; ctx.lineWidth = 2.5; ctx.strokeRect(pad - 6, pad - 6, M + 12, M + 12);
    ctx.lineWidth = 0.8; ctx.strokeRect(pad - 10, pad - 10, M + 20, M + 20);
    ctx.restore();
    return pts.length;
  },
  symbole(ctx, sym, x, y, ink, o) {
    ctx.save();
    ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.2; ctx.lineJoin = 'round';
    const maison = (x, y, s) => { ctx.fillStyle = 'rgba(236,224,196,.9)'; ctx.fillRect(x - s, y - s, s * 2, s * 1.6); ctx.strokeRect(x - s, y - s, s * 2, s * 1.6); ctx.beginPath(); ctx.moveTo(x - s - 1, y - s); ctx.lineTo(x, y - s * 2); ctx.lineTo(x + s + 1, y - s); ctx.closePath(); ctx.fillStyle = ink; ctx.fill(); };
    switch (sym) {
      case 'maison': maison(x, y, 3.5); break;
      case 'hameau': maison(x - 5, y + 1, 3); maison(x + 4, y + 2, 3); maison(x, y - 4, 3); break;
      case 'grand': ctx.fillStyle = 'rgba(236,224,196,.9)'; ctx.fillRect(x - 7, y - 5, 14, 9); ctx.strokeRect(x - 7, y - 5, 14, 9); ctx.beginPath(); for (let k = -5; k <= 5; k += 2.5) { ctx.moveTo(x + k, y - 4); ctx.lineTo(x + k, y + 3); } ctx.moveTo(x - 8, y - 5); ctx.lineTo(x, y - 10); ctx.lineTo(x + 8, y - 5); ctx.stroke(); break;
      case 'ville': {
        ctx.fillStyle = 'rgba(236,224,196,.9)'; ctx.fillRect(x - 11, y - 11, 22, 22); ctx.lineWidth = 1.8; ctx.strokeRect(x - 11, y - 11, 22, 22);
        for (const [a, b] of [[-11, -11], [11, -11], [-11, 11], [11, 11]]) { ctx.fillStyle = ink; ctx.fillRect(x + a - 2.5, y + b - 2.5, 5, 5); }
        ctx.lineWidth = 1; maison(x - 4, y + 3, 2.5); maison(x + 4, y + 4, 2.5); ctx.beginPath(); ctx.moveTo(x + 3, y - 3); ctx.lineTo(x + 3, y - 9); ctx.moveTo(x + 0.5, y - 7); ctx.lineTo(x + 5.5, y - 7); ctx.stroke();
        break;
      }
      case 'eglise': maison(x, y, 3.5); ctx.beginPath(); ctx.moveTo(x, y - 7); ctx.lineTo(x, y - 13); ctx.moveTo(x - 2.5, y - 10.5); ctx.lineTo(x + 2.5, y - 10.5); ctx.stroke(); break;
      case 'croix': ctx.beginPath(); ctx.moveTo(x, y + 4); ctx.lineTo(x, y - 7); ctx.moveTo(x - 3.5, y - 3.5); ctx.lineTo(x + 3.5, y - 3.5); ctx.stroke(); break;
      case 'tour': ctx.fillStyle = 'rgba(236,224,196,.9)'; ctx.fillRect(x - 3, y - 9, 6, 12); ctx.strokeRect(x - 3, y - 9, 6, 12); ctx.beginPath(); ctx.moveTo(x - 3, y - 9); ctx.lineTo(x - 3, y - 11); ctx.moveTo(x, y - 9); ctx.lineTo(x, y - 11); ctx.moveTo(x + 3, y - 9); ctx.lineTo(x + 3, y - 11); ctx.stroke(); break;
      case 'phare': ctx.beginPath(); ctx.moveTo(x - 3, y + 3); ctx.lineTo(x - 1.5, y - 9); ctx.lineTo(x + 1.5, y - 9); ctx.lineTo(x + 3, y + 3); ctx.closePath(); ctx.stroke(); ctx.beginPath(); for (const a of [-0.5, 0, 0.5]) { ctx.moveTo(x + Math.sin(a) * 4, y - 10 - Math.cos(a) * 1); ctx.lineTo(x + Math.sin(a) * 9, y - 10 - Math.cos(a) * 5); } ctx.stroke(); break;
      case 'chateau': for (const dx of [-6, 6]) { ctx.fillStyle = 'rgba(236,224,196,.9)'; ctx.fillRect(x + dx - 2.5, y - 9, 5, 12); ctx.strokeRect(x + dx - 2.5, y - 9, 5, 12); } ctx.strokeRect(x - 3.5, y - 5, 7, 8); ctx.beginPath(); ctx.moveTo(x - 1, y - 9); ctx.lineTo(x - 1, y - 14); ctx.lineTo(x + 3, y - 12.5); ctx.lineTo(x - 1, y - 11); ctx.stroke(); break;
      case 'moulin': ctx.beginPath(); ctx.arc(x, y, 3, 0, TAU); ctx.stroke(); ctx.beginPath(); for (const a of [0.4, 0.4 + Math.PI / 2]) { ctx.moveTo(x + Math.cos(a) * 8, y + Math.sin(a) * 8); ctx.lineTo(x - Math.cos(a) * 8, y - Math.sin(a) * 8); } ctx.stroke(); break;
      case 'mine': ctx.beginPath(); ctx.moveTo(x - 6, y + 5); ctx.lineTo(x + 5, y - 6); ctx.moveTo(x + 6, y + 5); ctx.lineTo(x - 5, y - 6); ctx.moveTo(x + 2, y - 7); ctx.lineTo(x + 7, y - 4); ctx.moveTo(x - 2, y - 7); ctx.lineTo(x - 7, y - 4); ctx.stroke(); break;
      case 'grotte': ctx.beginPath(); ctx.arc(x, y + 3, 6, Math.PI, 0); ctx.closePath(); ctx.fill(); break;
      case 'ruines': ctx.beginPath(); ctx.moveTo(x - 7, y + 3); ctx.lineTo(x - 7, y - 4); ctx.lineTo(x - 4, y - 2); ctx.moveTo(x - 1, y + 3); ctx.lineTo(x - 1, y - 7); ctx.lineTo(x + 2, y - 5); ctx.moveTo(x + 5, y + 3); ctx.lineTo(x + 5, y - 3); ctx.moveTo(x - 9, y + 3); ctx.lineTo(x + 8, y + 3); ctx.stroke(); break;
      case 'arbre': ctx.fillStyle = 'rgba(96,120,74,.45)'; ctx.beginPath(); ctx.arc(x, y - 6, 7, 0, TAU); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y + 1); ctx.lineTo(x, y + 5); ctx.stroke(); break;
      case 'pierres': for (const dx of [-5, 0, 5]) { ctx.fillRect(x + dx - 1.2, y - 6 + Math.abs(dx) * 0.3, 2.4, 8 - Math.abs(dx) * 0.3); } break;
      case 'dolmen': ctx.fillRect(x - 5, y - 2, 2.4, 6); ctx.fillRect(x + 3, y - 2, 2.4, 6); ctx.fillRect(x - 7, y - 5, 14, 3); break;
      case 'cercle': for (let k = 0; k < 9; k++) { const a = k / 9 * TAU; ctx.fillRect(x + Math.cos(a) * 7 - 1, y + Math.sin(a) * 5 - 2, 2, 3); } break;
      case 'source': ctx.beginPath(); ctx.arc(x, y, 3.5, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - 6, y + 6); ctx.quadraticCurveTo(x - 3, y + 4, x, y + 6); ctx.quadraticCurveTo(x + 3, y + 8, x + 6, y + 6); ctx.stroke(); break;
      case 'puits': ctx.beginPath(); ctx.arc(x, y, 3, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - 5, y - 6); ctx.lineTo(x + 5, y - 6); ctx.moveTo(x - 4, y - 6); ctx.lineTo(x - 4, y); ctx.moveTo(x + 4, y - 6); ctx.lineTo(x + 4, y); ctx.stroke(); break;
      case 'pont': ctx.beginPath(); ctx.arc(x, y + 5, 7, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y + 8, 7, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); break;
      case 'tente': ctx.beginPath(); ctx.moveTo(x - 6, y + 4); ctx.lineTo(x, y - 6); ctx.lineTo(x + 6, y + 4); ctx.closePath(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x, y + 4); ctx.stroke(); break;
      case 'col': ctx.beginPath(); ctx.moveTo(x - 8, y - 5); ctx.quadraticCurveTo(x - 2, y, x - 8, y + 5); ctx.moveTo(x + 8, y - 5); ctx.quadraticCurveTo(x + 2, y, x + 8, y + 5); ctx.stroke(); break;
      case 'aelin': { let img = null; try { img = langCanvas('aelin', 'thalen', { size: 10, bg: '#dcc9a0', ink }); } catch (e) { img = null; } if (img) ctx.drawImage(img, x - img.width / 2, y - img.height / 2); break; }
      default: ctx.beginPath(); ctx.arc(x, y, 2.2, 0, TAU); ctx.fill();
    }
    ctx.restore();
  },
  // ------------------------------------------------------------ montrer une carte
  montrer(titre, o, pied) {
    ui.open('#mapview', `<div class="tabs"><b>${esc(titre)}</b><button class="x" data-close>✕</button></div><div class="body map"><canvas width="560" height="560"></canvas></div>${pied ? `<div class="foot">${esc(pied)}</div>` : ''}`);
    $('#mapview [data-close]').onclick = () => ui.close();
    let n = 0;
    try { n = this.dessiner($('#mapview canvas'), o); } catch (e) { console.error(e); }
    sound.page && sound.page();
    return n;
  },
  titreRegion(k) { const C = CARTES_REGIONS[k]; return C ? C.titre.replace(/Valbrume/g, (farm.names && farm.names.ville) || 'Valbrume') : ''; },
  ouvrir(k, opts) {
    const C = CARTES_REGIONS[k];
    if (!C || !game.world) return false;
    const seed = hashString('carte_' + k) + ((farm.s && farm.s.seed) | 0) * 7;
    const style = { centre: { A: 0.05, blancs: 0.12 }, ouest: { A: 0.09, blancs: 0.15 }, nord: { A: 0.07, blancs: 0.2 }, est: { A: 0.1, blancs: 0.15, rot: 0.22 }, sud: { A: 0.07, blancs: 0.45 }, monts: { A: 0.07, blancs: 0.2, geants: true }, ancien: { A: 0.09, blancs: 0.25, old: true, rot: 0.2 } }[k] || { A: 0.07, blancs: 0.2 };
    const o = Object.assign({ cx: C.x, cz: C.z, r: C.r, seed, titre: this.titreRegion(k), lieux: 'connus' }, style);
    const titre = this.titreRegion(k);
    const n = this.montrer(titre, o, '');
    const conn = n > 1 ? `Vous y reconnaissez ${n} endroits où vous êtes allé.` : n ? 'Vous y reconnaissez un endroit où vous êtes allé.' : 'Vous n’y reconnaissez encore aucun endroit : il faudra aller voir.';
    const pied = k === 'ancien' ? 'Les noms d’autrefois. Rien n’est plus tout à fait à sa place.' : C.desc + ' ' + conn;
    const f = $('#mapview .foot');
    if (f) f.textContent = pied; else $('#mapview').insertAdjacentHTML('beforeend', `<div class="foot">${esc(pied)}</div>`);
    if (farm.s) this.S().vues[k] = farm.s.day;
    return true;
  },
  // panneau-carte d'une ville : les environs, les lieux connus
  panneau(it) {
    const d = it.data || {};
    const foot = (typeof LORE_TEXT !== 'undefined' && LORE_TEXT.panneaux && LORE_TEXT.panneaux[d.key]) || (d.old ? 'Certains noms ne disent plus rien à personne.' : `Carte des environs, dressée par la mairie de ${farm.names.ville}.`);
    const o = { cx: d.x ?? it.x, cz: d.z ?? it.z, r: 240, A: 0.035, rot: 0.08, blancs: 0.1, seed: hashString('panneau_' + (d.key || it.id)), titre: d.old ? 'Une vieille carte délavée' : 'Les environs', old: !!d.old, lieux: 'connus' };
    this.montrer(d.old ? 'Une vieille carte délavée' : 'Carte des environs', o, fmtLine(foot, null) + ' Seuls les endroits où vous êtes allé vous y parlent.');
    farm.s.flags['vu_carte_' + d.key] = 1;
  },
  // une carte au trésor : un croquis vague autour de la croix, et quelques mots au dos
  tresor() {
    const s = farm.s, m = (s.maps || []).find((q) => !q.found) || dig.newMap();
    if (!m) { ui.subtitle('', '(La carte est illisible.)', 2); return; }
    const w = game.world, h = hashString(m.id + ':' + s.seed) >>> 0;
    const cx = m.x + ((h % 61) - 30), cz = m.z + (((h >>> 8) % 61) - 30);
    const o = { cx, cz, r: 110, A: 0.1, rot: 0.5, seed: h, croquis: true, lieux: 'aucun', old: true, croix: { x: m.x, z: m.z } };
    // le lieu-dit le plus proche : la seule indication écrite
    let best = null, bd = 1e9;
    for (const k in w.lm) { const L = w.lm[k]; if (L.under || L.secret || CARTES_ZONES.has(k) || CARTES_VILLE.has(k) || /^roulotte_|^campement/.test(k)) continue; const d = Math.hypot(L.x - m.x, L.z - m.z); if (d < bd) { bd = d; best = [k, L]; } }
    let dos = '« Creuse trois fois, là où ça sonne creux. »';
    if (best && bd < 900) {
      const [k, L] = best, a = Math.atan2(m.x - L.x, m.z - L.z), pas = Math.max(50, Math.round(bd * 1.4 / 50) * 50);
      dos += ` Et, d’une autre main : « Vers ${w.cardinal(a)}, depuis ${LIEU_NAMES[k] || L.name}, à ${pas} pas, à peu près. »`;
    }
    this.montrer('Une carte au trésor', o, `Un croquis à l’encre, sans un nom. Au dos : ${dos}`);
  },
  // un croquis quelconque (pour d'autres modules)
  croquis(x, z, r, titre) { return this.montrer(titre || 'Un croquis', { cx: x, cz: z, r: r || 150, A: 0.08, seed: hashString(titre || 'croquis') + (x | 0), croquis: true, lieux: 'connus', titre }, ''); },
};

// ---------------------------------------------------------------- les anciennes cartes deviennent approximatives
signs.board = (it) => cartes.panneau(it);
signs.valleyMap = () => cartes.ouvrir('centre');
signs.treasureMap = () => cartes.tresor();
// clic : déplier une carte de région
HOOKS.primary.push((eye, basis, held, it, id) => {
  if (!it || it.use !== 'region') return false;
  if (!held) { cartes.ouvrir(it.region || 'centre'); play.cool = 0.5; }
  return true;
});
// la terre sonne creux près d'une croix (sans dire où exactement)
{
  const _at = dig.at.bind(dig);
  dig.at = function (eye, f, held) {
    const r = _at(eye, f, held);
    try {
      const s = farm.s, c = play.cellAt(eye, f);
      if (c && (s.maps || []).some((m) => !m.found && Math.hypot(m.x - c.x, m.z - c.z) > 2.6 && Math.hypot(m.x - c.x, m.z - c.z) < 11) && !((cartes.creuxT || 0) > game.time)) {
        cartes.creuxT = game.time + 15;
        ui.subtitle('', '(La terre sonne un peu creux par ici. Pas tout à fait là.)', 3);
      }
    } catch (e) { console.error(e); }
    return r;
  };
}
// les cartes se vendent aussi à la poste
{
  const d = NPC_DATA.find((q) => q.id === 'postiere');
  if (d) {
    d.shop = d.shop || { name: 'La poste', sells: [], buys: [] };
    for (const [id, p] of [['carte_centre', 60], ['carte_sud', 80]]) if (ITEMS[id] && !d.shop.sells.some(([k]) => k === id)) d.shop.sells.push([id, p]);
  }
}
// le nom de la ville sur la carte du pays
HOOKS.load.push(() => { if (ITEMS.carte_centre && farm.names && farm.names.ville) ITEMS.carte_centre.name = cartes.titreRegion('centre'); });
