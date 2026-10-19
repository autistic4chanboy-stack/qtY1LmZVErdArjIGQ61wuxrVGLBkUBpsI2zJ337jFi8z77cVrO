// ============================================================================
//  LA PÊCHE À QTE (agent P21, vingt et unième vague) — 2. CE QUI SE VOIT
//  - La canne en main (dessinée dans la petite image de l'objet tenu) : elle
//    se lève au lancer, plie sous la tension, tremble quand le poisson secoue ;
//    le moulinet tourne quand on mouline ; la prise est montrée en main, en gros
//    plan (sa forme, ses couleurs, ses taches selon l'espèce).
//  - La ligne, du bout de la canne au bouchon (ou au poisson) : un canevas
//    plein écran (#p21-ligne), dessiné juste après l'image, seulement pendant la
//    pêche ; elle pend quand elle est molle, se tend sous la tension.
//  - Le HUD du QTE (#p21-hud, dans #m21-hud si M21 est là) : la jauge du
//    lancer, le « ! » de la touche, la tension (zones), l'endurance du poisson,
//    la distance, les invites (la touche affichée, l'anneau qui se referme), les
//    messages courts, la carte de la prise (taille, poids, « Record ! »).
//  - Le carnet de pêche (Carnet › Pêche) et l'option Jeu › « Aide à la pêche ».
//  Le style : les variables --m21-* (contrat-v21), avec des valeurs de repli.
// ============================================================================
{
  const st = document.createElement('style');
  st.id = 'p21-css';
  st.textContent = `
#p21-ligne { position: fixed; inset: 0; width: 100%; height: 100%; z-index: 4; pointer-events: none; display: none; }
#p21-hud { position: absolute; inset: 0; pointer-events: none; z-index: 5; font-family: var(--m21-police, Georgia, 'Times New Roman', serif); color: var(--m21-nuit-texte, #efe6cf); }
#p21-hud.p21-seul { position: fixed; zoom: var(--m21-k, 1); }
#p21-hud > div { position: absolute; left: 50%; transform: translateX(-50%); display: none; }
#p21-hud .on { display: block; }
#p21-hud .p21-boite { background: rgba(16,13,9,.62); border: 1px solid rgba(232,192,112,.22); border-radius: var(--m21-rayon, 3px); padding: 7px 12px 8px; box-shadow: 0 6px 18px rgba(0,0,0,.35); }
#p21-hud .p21-lancer { bottom: 21%; width: 260px; text-align: center; }
#p21-hud .p21-lancer .t { font-size: 13px; letter-spacing: .06em; margin-bottom: 5px; color: var(--m21-or, #e8c070); }
#p21-hud .p21-lancer .t i { font-style: normal; color: var(--m21-nuit-texte, #efe6cf); opacity: .8; }
#p21-hud .p21-j { position: relative; height: 10px; background: rgba(220,208,180,.18); border-radius: 2px; overflow: hidden; }
#p21-hud .p21-j > b { position: absolute; left: 0; top: 0; bottom: 0; background: var(--m21-or, #e8c070); }
#p21-hud .p21-lancer .ap { font-size: 12px; margin-top: 5px; opacity: .78; }
#p21-hud .p21-ferrez { top: 41%; text-align: center; }
#p21-hud .p21-ferrez .rond { width: 34px; height: 34px; margin: 0 auto; border-radius: 50%; border: 2px solid var(--m21-or, #e8c070); color: var(--m21-or, #e8c070); font: bold 22px/30px var(--m21-police, Georgia, serif); background: rgba(16,13,9,.45); animation: p21-pouls .32s ease-in-out infinite alternate; }
#p21-hud .p21-ferrez .t { margin-top: 6px; font-size: 15px; color: var(--m21-or, #e8c070); text-shadow: 0 1px 3px #000; }
@keyframes p21-pouls { from { transform: scale(1); } to { transform: scale(1.18); } }
#p21-hud .p21-combat { bottom: 17%; width: 340px; }
#p21-hud .p21-combat .l { display: flex; justify-content: space-between; font-size: 12px; letter-spacing: .05em; margin: 0 1px 3px; opacity: .9; }
#p21-hud .p21-tension { position: relative; height: 14px; border-radius: 2px; overflow: hidden;
  background: linear-gradient(90deg, rgba(150,150,150,.35) 0 22%, rgba(90,140,70,.62) 22% 74%, rgba(200,140,40,.7) 74% 91%, rgba(170,50,35,.85) 91% 100%); }
#p21-hud .p21-tension::after { content: ''; position: absolute; left: 91%; right: 0; top: 0; bottom: 0; background: repeating-linear-gradient(135deg, rgba(0,0,0,.28) 0 3px, transparent 3px 6px); }
#p21-hud .p21-tension > i { position: absolute; top: -2px; bottom: -2px; width: 3px; margin-left: -1px; background: #fff8e8; box-shadow: 0 0 4px #000; }
#p21-hud .p21-tension.rouge { box-shadow: 0 0 0 2px var(--m21-rouge, #9a3a2a); animation: p21-tremble .09s linear infinite alternate; }
@keyframes p21-tremble { from { transform: translateX(-1px); } to { transform: translateX(1px); } }
#p21-hud .p21-endu { display: flex; align-items: center; gap: 6px; margin-top: 7px; }
#p21-hud .p21-endu .p21-j { flex: 1; height: 7px; }
#p21-hud .p21-endu .p21-j > b { background: #8ab4c8; }
#p21-hud .p21-endu span { font-size: 12px; min-width: 36px; text-align: right; }
#p21-hud .p21-endu svg { flex: none; }
#p21-hud .p21-aide { margin-top: 6px; font-size: 12px; text-align: center; opacity: .82; min-height: 15px; }
#p21-hud .p21-aide.alerte { color: #ffb08a; opacity: 1; font-weight: bold; }
#p21-hud .p21-invite { bottom: calc(17% + 104px); text-align: center; }
#p21-hud .p21-invite .k { position: relative; width: 70px; height: 70px; margin: 0 auto; }
#p21-hud .p21-invite svg { position: absolute; inset: 0; }
#p21-hud .p21-invite .c { position: absolute; inset: 11px; border-radius: 9px; background: var(--m21-papier-clair, #f3ecda); color: var(--m21-encre, #33291d); border: 2px solid var(--m21-sepia, #8a5a2a); box-shadow: 0 3px 0 var(--m21-sepia-fonce, #6a4220), 0 6px 14px rgba(0,0,0,.5); font: bold 30px/44px var(--m21-police, Georgia, serif); }
#p21-hud .p21-invite .c.mot { font-size: 14px; line-height: 44px; }
#p21-hud .p21-invite .t { margin-top: 6px; font-size: 16px; color: var(--m21-or, #e8c070); text-shadow: 0 1px 3px #000; }
#p21-hud .p21-invite .s { font-size: 12px; opacity: .78; margin-top: 2px; text-shadow: 0 1px 2px #000; }
#p21-hud .p21-invite.ok .c { background: #cfe6b8; border-color: var(--m21-vert, #3a6a2a); }
#p21-hud .p21-invite.ko .c { background: #e8b8a8; border-color: var(--m21-rouge, #9a3a2a); }
#p21-hud .p21-msg { bottom: 26%; font-size: 15px; text-shadow: 0 1px 3px #000, 0 0 8px rgba(0,0,0,.6); white-space: nowrap; transition: opacity var(--m21-duree, 140ms); }
#p21-hud .p21-msg.rate { color: #ffb08a; }
#p21-hud .p21-msg.appat { color: var(--m21-or, #e8c070); }
#p21-hud .p21-prise { top: 13%; min-width: 230px; text-align: center; padding: 9px 18px 10px; background: var(--m21-papier, #e8dfc8); color: var(--m21-encre, #33291d); border: 1px solid var(--m21-trait, rgba(90,70,40,.28)); border-radius: var(--m21-rayon, 3px); box-shadow: var(--m21-ombre, 0 18px 50px rgba(0,0,0,.65)); }
#p21-hud .p21-prise .n { font-size: 20px; }
#p21-hud .p21-prise .m { font-size: 14px; color: var(--m21-encre-douce, #6a5436); margin-top: 2px; }
#p21-hud .p21-prise .r { display: inline-block; margin-top: 5px; padding: 1px 9px; font-size: 13px; letter-spacing: .08em; color: #fff8e8; background: var(--m21-sepia, #8a5a2a); border-radius: 2px; }
#p21-hud .p21-prise .r.rec { background: var(--m21-rouge, #9a3a2a); }
/* le carnet de pêche */
#satchel .p21-carnet .p21-res { margin: 2px 0 8px; }
#satchel .p21-carnet .p21-eq { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: 13px; color: var(--m21-encre-douce, #6a5436); margin-bottom: 10px; }
#satchel .p21-carnet .p21-eq b { color: var(--m21-encre, #33291d); font-weight: normal; }
#satchel .p21-carnet .p21-l { display: grid; grid-template-columns: 30px minmax(110px, 1.2fr) 44px minmax(110px, 1fr) minmax(130px, 1.4fr) auto; align-items: center; gap: 4px 10px; padding: 4px 6px; border-bottom: 1px solid var(--m21-trait, rgba(90,70,40,.18)); }
#satchel .p21-carnet .p21-l:hover, #satchel .p21-carnet .p21-l:focus-within { background: var(--m21-sepia-voile, rgba(138,90,42,.14)); }
#satchel .p21-carnet .p21-l img { width: 28px; height: 28px; image-rendering: pixelated; }
#satchel .p21-carnet .p21-l .nm { font-size: 15px; }
#satchel .p21-carnet .p21-l .n, #satchel .p21-carnet .p21-l .ou { font-size: 12.5px; color: var(--m21-encre-douce, #6a5436); }
#satchel .p21-carnet .p21-l .rec { font-size: 13.5px; }
#satchel .p21-carnet .p21-l .rec.vide { color: var(--m21-encre-pale, #8a7a5a); }
#satchel .p21-carnet .p21-l button { padding: 2px 9px; font-size: 12.5px; background: rgba(255,255,255,.3); border: 1px solid var(--m21-trait, rgba(90,70,40,.3)); border-radius: var(--m21-rayon, 3px); color: var(--m21-encre, #33291d); cursor: pointer; }
#satchel .p21-carnet .p21-l button:hover { background: var(--m21-papier-clair, #f3ecda); }
@media (max-width: 620px) {
  #satchel .p21-carnet .p21-l { grid-template-columns: 30px 1fr auto; }
  #satchel .p21-carnet .p21-l .ou, #satchel .p21-carnet .p21-l .n { display: none; }
  #p21-hud .p21-combat { width: 290px; }
}`;
  document.head.appendChild(st);
}

// ---------------------------------------------------------------- la canne en main, la prise en main
const p21Main = {
  cache: new Map(), cle: null, tip: [40, 10], actif: false,
  // le bout de la canne, et ce qu'on dessine : une clé par image différente
  dessiner(g, gm) {
    const et = p21.et, canne = p21.canne();
    const on = !!(canne && et && !gm.noHand);
    if (!on) { if (this.actif) { this.actif = false; gm.vmKey = ''; } return; }
    let cle;
    const C = p21.C;
    if (et === 'prise' && p21.prise) cle = 'p:' + p21.prise.id + ':' + (Math.floor(p21.prise.t * 4) & 1) + ':' + Math.round(Math.log2(1 + p21.prise.kg) * 3);
    else {
      const pose = et === 'charge' ? 'c' + Math.round(p21.charge * 5) : et === 'vol' || et === 'sol' ? 'v' + (p21.F && p21.F.p21.volT < 0.14 ? 0 : 1) : 'a';
      const b = Math.round(Math.max(0, Math.min(1.1, p21.bend)) * 7);
      const tourne = C && p21.avant && !C.epuisette ? Math.floor(p21.t * 14) & 3 : 0;
      const sec = (C && C.coup.k === 'secoue') || p21.secousse > 0 ? (Math.floor(p21.t * 24) % 3) - 1 : 0;
      cle = pose + ':' + b + ':' + tourne + ':' + sec + ':' + (canne === 'canne_fer' ? 'f' : canne === 'canne_dame' ? 'd' : 'b');
    }
    if (cle === this.cle && !g.dirty && this.actif) return;
    this.actif = true; this.cle = cle;
    let im = this.cache.get(cle);
    if (!im) {
      const pb = new PixelBuf(VM_W, VM_H);
      let tip = null;
      if (cle[0] === 'p') this.mainPoisson(pb, p21.prise);
      else tip = this.canne(pb, cle);
      edgeDarken(pb, 0.8);
      im = { cv: pb.canvas(), tip };
      if (this.cache.size > 80) this.cache.delete(this.cache.keys().next().value);
      this.cache.set(cle, im);
    }
    if (im.tip) this.tip = im.tip;
    const ctx = g.canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, VM_W, VM_H);
    ctx.drawImage(im.cv, 0, 0);
    g.dirty = true;
  },
  // la canne : levée en arrière (on charge), fouettée en avant (le lancer), pliée (la tension)
  canne(pb, cle) {
    const [pose, b, tourne, sec, sorte] = cle.split(':');
    const sx = +sec;
    const gx = 86 + sx, gy = 88;
    vmArm(pb, gx, gy);
    let a0 = -0.42, bend = +b / 7;
    if (pose[0] === 'c') { a0 = -0.42 + (+pose.slice(1)) / 5 * 0.5; bend = 0; }
    else if (pose === 'v0') { a0 = -0.85; bend = 0.25; }
    const pal = sorte === 'f' ? ramp(['#4a4e54', '#6a7078', '#8e959e', '#b4bac2']) : sorte === 'd' ? ramp(['#7a7a80', '#a8a8b0', '#d4d4dc', '#f2f2f8']) : PAL.wood;
    // le manche (épais), puis le scion qui plie
    const L = 92, n = 16;
    let x = gx - Math.sin(a0) * 10, y = gy + Math.cos(a0) * 10;
    let px = x, py = y;
    for (let i = 0; i <= n; i++) {
      const t = i / n, a = a0 - bend * 1.25 * t * t, ds = L / n;
      if (i > 0) { x += Math.sin(a) * ds; y -= Math.cos(a) * ds; thickLine(pb, px, py, x, y, i < 6 ? 3.5 : i < 11 ? 2.5 : 1.5, pal, 0.7); }
      px = x; py = y;
    }
    // les anneaux du scion
    // le moulinet
    const mx = gx - 7 + Math.sin(a0) * 4, my = gy - 13;
    drawSphere(pb, mx, my, 5, ramp(['#2a2a2e', '#45454c', '#62626a', '#8a8a92']), 3, { sq: 1 });
    const ph = +tourne * Math.PI / 2;
    drawLine(pb, Math.round(mx), Math.round(my), Math.round(mx + Math.cos(ph) * 6), Math.round(my + Math.sin(ph) * 6), [70, 52, 30], 2);
    vmFist(pb, gx, gy - 2);
    return [Math.round(x), Math.round(y)];
  },
  // la prise, tenue en main, de profil (la tête vers le milieu de l'écran)
  mainPoisson(pb, P) {
    const id = P.id, f = (Math.floor(P.t * 4) & 1) ? 1 : -1;
    if (!FISH[id]) { // un coffre, une perle, des herbes : l'icône, en grand
      const sp = ATLAS.sprites['it_' + id];
      vmArm(pb, 88, 92);
      if (sp && sp.canvas) {
        const c = sp.canvas, d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, k = Math.max(1, Math.floor(46 / Math.max(c.width, c.height)));
        const ox = 58 - (c.width * k) / 2, oy = 58 - (c.height * k) / 2;
        for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) { const i = (y * c.width + x) * 4; if (d[i + 3] > 40) for (let a = 0; a < k; a++) for (let bb = 0; bb < k; bb++) pb.set(ox + x * k + a, oy + y * k + bb, [d[i], d[i + 1], d[i + 2]]); }
      }
      vmFist(pb, 88, 86);
      return;
    }
    const st = p21Tirage.espece(id)[0];
    const FORME = { fretin: 0.26, perche: 0.34, carpe: 0.4, truite: 0.28, saumon: 0.27, brochet: 0.2, anguille: 0.09, silure: 0.23, ecrevisse: 0.3, aveugle: 0.28, lune: 0.5, esturgeon: 0.18, reine: 0.42, vieux: 0.22, notaire: 0.21, ancien: 0.33 };
    const L = Math.round(72 + 34 * Math.min(1, Math.log(1 + P.kg) / Math.log(40))), H = Math.max(5, L * (FORME[st] || 0.3) / 2);
    const cx = 54, cy = 50, x0 = cx - L / 2;
    const base = hexToRgb((FISH[id] && FISH[id].col) || '#7a8a80');
    const pal = rampOf(base), ventre = rampOf(base.map((v) => Math.min(255, v * 0.55 + 120)));
    vmArm(pb, Math.min(108, Math.round(x0 + 0.8 * L)), Math.round(cy + 14));
    if (st === 'ecrevisse') { this.ecrevisse(pb, cx, cy, L * 0.8, pal); vmFist(pb, cx + L * 0.36, cy + 6); return; }
    // le profil : haut et bas du corps, de la tête (t = 0) au pédoncule (t = 0.8)
    const pique = st === 'brochet' || st === 'notaire' || st === 'esturgeon' ? 0.55 : 0.3;
    const haut = (t) => (t < 0.3 ? Math.pow(t / 0.3, pique) : 1 - Math.pow((t - 0.3) / 0.5, 1.5) * 0.7) * H;
    const P1 = [], P2 = [];
    for (let i = 0; i <= 20; i++) { const t = i / 20 * 0.8, x = x0 + t * L, wv = Math.sin(t * 6 + f) * (st === 'anguille' ? H * 0.8 : 0) * t; P1.push([x, cy - haut(t) + wv]); P2.unshift([x, cy + haut(t) * (st === 'anguille' ? 1 : 0.85) + wv]); }
    fillPoly(pb, P1.concat(P2), pal, (x, y) => 0.85 - (y - (cy - H)) / (H * 2.4));
    // le ventre, plus clair
    const P3 = [];
    for (let i = 2; i <= 17; i++) { const t = i / 20 * 0.8; P3.push([x0 + t * L, cy + haut(t) * 0.15]); }
    for (let i = 17; i >= 2; i--) { const t = i / 20 * 0.8; P3.push([x0 + t * L, cy + haut(t) * 0.8]); }
    if (st !== 'anguille') fillPoly(pb, P3, ventre, () => 0.75);
    // la queue (fourchue ou ronde), qui bat
    const qx = x0 + 0.8 * L, qh = H * (st === 'anguille' ? 0.6 : 1.05), qb = f * 2;
    if (st === 'anguille') fillPoly(pb, [[qx - 2, cy - qh * 0.5], [x0 + L, cy + qb], [qx - 2, cy + qh * 0.5]], pal, () => 0.55);
    else if (st === 'carpe' || st === 'silure' || st === 'vieux' || st === 'reine' || st === 'aveugle') fillPoly(pb, [[qx, cy - H * 0.25], [x0 + L, cy - qh + qb], [x0 + L - 3, cy + qb], [x0 + L, cy + qh + qb], [qx, cy + H * 0.25]], pal, () => 0.5);
    else fillPoly(pb, [[qx, cy - H * 0.2], [x0 + L + 2, cy - qh + qb], [x0 + L - 6, cy + qb], [x0 + L + 2, cy + qh * 0.9 + qb], [qx, cy + H * 0.2]], pal, () => 0.5);
    // la dorsale
    if (st !== 'anguille') {
      const d0 = st === 'brochet' || st === 'notaire' ? 0.62 : 0.3, d1 = st === 'brochet' || st === 'notaire' ? 0.74 : 0.55;
      fillPoly(pb, [[x0 + d0 * L, cy - haut(d0) + 1], [x0 + (d0 + 0.04) * L, cy - haut(d0) - H * 0.55], [x0 + d1 * L, cy - haut(d1) + 1]], pal, () => 0.4);
      if (st === 'perche') for (let i = 0; i < 5; i++) pb.set(Math.round(x0 + (d0 + 0.02 + i * 0.04) * L), Math.round(cy - haut(d0) - H * 0.4), [40, 30, 20]);
    }
    // les marques
    const R = mulberry32(id.length * 977 + 13);
    if (st === 'perche') for (let i = 0; i < 5; i++) { const x = x0 + (0.25 + i * 0.11) * L; drawLine(pb, Math.round(x), Math.round(cy - haut((x - x0) / L) + 1), Math.round(x - 1), Math.round(cy + H * 0.25), [40, 52, 30], 2); }
    if (st === 'truite' || st === 'saumon') for (let i = 0; i < L / 3; i++) { const t = 0.12 + R() * 0.62, x = x0 + t * L, y = cy - haut(t) * (0.15 + R() * 0.7); pb.set(Math.round(x), Math.round(y), i % 4 === 0 && st === 'truite' ? [190, 40, 30] : [30, 26, 22]); }
    if (st === 'brochet' || st === 'notaire') for (let i = 0; i < L / 2.5; i++) { const t = 0.15 + R() * 0.62, x = x0 + t * L, y = cy - haut(t) * (0.0 + R() * 0.75); pb.set(Math.round(x), Math.round(y), [200, 200, 150]); }
    if (st === 'carpe' || st === 'reine') for (let i = 0; i < L * 1.2; i++) { const t = 0.12 + R() * 0.62, x = x0 + t * L, y = cy - haut(t) * (R() * 1.6 - 0.75); if (((x | 0) + (y | 0)) % 3 === 0) pb.shade(Math.round(x), Math.round(y), 0.78); }
    if (st === 'esturgeon') for (let i = 0; i < 8; i++) { const t = 0.15 + i * 0.08; pb.set(Math.round(x0 + t * L), Math.round(cy - haut(t) - 1), [220, 214, 190]); pb.set(Math.round(x0 + t * L), Math.round(cy - 1), [220, 214, 190]); }
    // l'œil, l'opercule, la nageoire de poitrine
    const ex = Math.round(x0 + L * 0.07), ey = Math.round(cy - H * 0.25);
    pb.set(ex, ey, [16, 14, 12]); pb.set(ex + 1, ey, [16, 14, 12]); pb.set(ex, ey - 1, [230, 210, 120]);
    for (let k = -3; k <= 3; k++) pb.shade(Math.round(x0 + L * 0.15 - Math.abs(k) * 0.3), Math.round(cy + k * H * 0.12), 0.7);
    fillPoly(pb, [[x0 + L * 0.2, cy + H * 0.2], [x0 + L * 0.3, cy + H * 0.65], [x0 + L * 0.26, cy + H * 0.2]], pal, () => 0.45);
    // les barbillons
    if (st === 'silure' || st === 'vieux' || st === 'esturgeon' || id === 'barbeau' || id === 'carpe' || id === 'reine_lac') { drawLine(pb, Math.round(x0 + 1), Math.round(cy + 1), Math.round(x0 - 4), Math.round(cy + H * 0.6), [50, 44, 36]); drawLine(pb, Math.round(x0 + 2), Math.round(cy + 2), Math.round(x0 - 2), Math.round(cy + H * 0.9), [50, 44, 36]); }
    vmFist(pb, Math.round(qx - 3), Math.round(cy + 4));
  },
  ecrevisse(pb, cx, cy, L, pal) {
    for (let i = 0; i < 6; i++) drawSphere(pb, cx + L * 0.12 * i - L * 0.25, cy, 6 - i * 0.5, pal, i + 1, { sq: 0.75 });
    drawSphere(pb, cx - L * 0.45, cy - 5, 6, pal, 9, { sq: 0.7 }); drawSphere(pb, cx - L * 0.45, cy + 6, 5, pal, 8, { sq: 0.7 });
    drawLine(pb, Math.round(cx - L * 0.35), Math.round(cy - 2), Math.round(cx - L * 0.7), Math.round(cy - 12), [90, 40, 30]);
    drawLine(pb, Math.round(cx - L * 0.35), Math.round(cy + 1), Math.round(cx - L * 0.72), Math.round(cy + 8), [90, 40, 30]);
  },
};

// ---------------------------------------------------------------- le HUD et la ligne
const p21Hud = {
  el: null, cv: null, ctx: null, vis: false, prev: {}, gun: null, couches: null,
  creer() {
    if (this.el) return;
    const host = document.getElementById('m21-hud');
    const el = document.createElement('div');
    el.id = 'p21-hud';
    if (!host) el.classList.add('p21-seul');
    el.innerHTML = `<div class="p21-lancer p21-boite"><div class="t"></div><div class="p21-j"><b></b></div><div class="ap"></div></div>
<div class="p21-ferrez"><div class="rond">!</div><div class="t"></div></div>
<div class="p21-combat p21-boite"><div class="l"><span></span><span class="d"></span></div><div class="p21-tension"><i></i></div>
<div class="p21-endu"><svg width="22" height="12" viewBox="0 0 22 12"><path d="M1 6 Q7 0 14 4 L21 1 L19 6 L21 11 L14 8 Q7 12 1 6Z" fill="#8ab4c8"/><circle cx="5" cy="5" r="1" fill="#1a1612"/></svg><div class="p21-j"><b></b></div><span></span></div><div class="p21-aide"></div></div>
<div class="p21-invite"><div class="k"><svg viewBox="0 0 70 70"><circle cx="35" cy="35" r="32" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="4"/><circle class="anneau" cx="35" cy="35" r="32" fill="none" stroke="#e8c070" stroke-width="4" stroke-linecap="round" transform="rotate(-90 35 35)" stroke-dasharray="201" stroke-dashoffset="0"/></svg><div class="c"></div></div><div class="t"></div><div class="s"></div></div>
<div class="p21-msg"></div>
<div class="p21-prise"><div class="n"></div><div class="m"></div><div class="r"></div></div>`;
    (host || document.body).appendChild(el);
    this.el = el;
    const q = (s) => el.querySelector(s);
    this.e = {
      lancer: q('.p21-lancer'), lancerT: q('.p21-lancer .t'), lancerB: q('.p21-lancer .p21-j b'), lancerAp: q('.p21-lancer .ap'),
      ferrez: q('.p21-ferrez'), ferrezT: q('.p21-ferrez .t'),
      combat: q('.p21-combat'), combatL: q('.p21-combat .l span'), combatD: q('.p21-combat .l .d'), tension: q('.p21-tension'), aiguille: q('.p21-tension i'),
      endu: q('.p21-endu .p21-j b'), enduT: q('.p21-endu span'), aide: q('.p21-aide'),
      invite: q('.p21-invite'), inviteC: q('.p21-invite .c'), inviteT: q('.p21-invite .t'), inviteS: q('.p21-invite .s'), anneau: q('.p21-invite .anneau'),
      msg: q('.p21-msg'), prise: q('.p21-prise'), priseN: q('.p21-prise .n'), priseM: q('.p21-prise .m'), priseR: q('.p21-prise .r'),
    };
    const cv = document.createElement('canvas');
    cv.id = 'p21-ligne';
    const gl = document.getElementById('gl');
    if (gl && gl.parentNode) gl.parentNode.insertBefore(cv, gl.nextSibling); else document.body.appendChild(cv);
    this.cv = cv; this.ctx = cv.getContext('2d');
    // les touches du clavier telles qu'elles sont écrites dessus (AZERTY : Q pour KeyA…)
    this.lettres = { KeyA: 'A', KeyD: 'D', KeyW: 'W', KeyS: 'S' };
    try { if (navigator.keyboard && navigator.keyboard.getLayoutMap) navigator.keyboard.getLayoutMap().then((m) => { for (const k of Object.keys(this.lettres)) { const v = m.get(k); if (v) this.lettres[k] = v.toUpperCase(); } }).catch(() => {}); } catch (e) { /* rien */ }
  },
  // un élément visible ou non (sans toucher au DOM si rien ne change)
  voir(k, on) { if (this.prev[k] !== on) { this.prev[k] = on; this.e[k].classList.toggle('on', on); } },
  texte(k, t) { if (this.prev['t' + k] !== t) { this.prev['t' + k] = t; this.e[k].textContent = t; } },
  html(k, h) { if (this.prev['h' + k] !== h) { this.prev['h' + k] = h; this.e[k].innerHTML = h; } },
  manette() { try { return typeof m21 !== 'undefined' && m21.manette && m21.manette.active && m21.manette.active(); } catch (e) { return false; } },
  // la touche à montrer : celle de la manette si c'est elle qu'on tient, sinon celle du clavier ou de la souris
  touche(bouton, clavier) {
    if (!this.manette()) return clavier;
    try { if (m21.manette.glyphe) { const g = m21.manette.glyphe(bouton); if (g) return String(g); } } catch (e) { /* rien */ }
    return bouton;
  },
  maj(dt) {
    const et = p21.et;
    if (!et && !p21.msg && !this.priseT) { if (this.el && this.prev.tout) { this.prev.tout = false; for (const k of ['lancer', 'ferrez', 'combat', 'invite', 'msg', 'prise']) this.voir(k, false); } return; }
    this.creer();
    this.prev.tout = true;
    const T = P21_TEXTES, aide = p21.aide();
    // le lancer
    this.voir('lancer', et === 'charge');
    if (et === 'charge') {
      const R = P21_REGL.lancer, m = Math.round(R.min + (R.max - R.min) * p21.charge);
      this.html('lancerT', `${esc(T.lancer)} <i>— ${esc(T.dist(m))}</i>`);
      this.e.lancerB.style.width = Math.round(p21.charge * 100) + '%';
      const ap = p21.appat();
      this.texte('lancerAp', ap ? T.appat(itemName(ap).toLowerCase(), farm.count(ap)) : T.sansAppat);
    }
    // la touche
    const touche = et === 'touche';
    this.voir('ferrez', touche);
    if (touche) this.texte('ferrezT', aide === 'complete' ? '' : `${T.ferrez} (${this.touche('A', 'clic')})`);
    // le combat
    const C = p21.C, combat = et === 'combat' && C;
    this.voir('combat', !!combat);
    this.voir('invite', !!(combat && (C.invite || C.epuisette)) || (this.flash > 0 && !!combat));
    if (combat) {
      const Mc = p21.msg && p21.msg.k === 'coup' ? p21.msg : null;
      this.texte('combatL', Mc ? Mc.txt : T.tension);
      if (this.prev.mc !== !!Mc) { this.prev.mc = !!Mc; this.e.combatL.style.color = Mc ? 'var(--m21-or, #e8c070)' : ''; }
      this.texte('combatD', T.dist(Math.max(0, Math.round(C.D))));
      this.e.aiguille.style.left = Math.round(Math.min(1.04, C.T) * 100) + '%';
      const rouge = C.T >= 0.95;
      if (this.prev.rouge !== rouge) { this.prev.rouge = rouge; this.e.tension.classList.toggle('rouge', rouge); }
      this.e.endu.style.width = Math.round(C.E * 100) + '%';
      const a = C.epuisette ? '' : C.T > 0.9 ? T.lacher : C.mouT > 1.2 ? T.mouliner + ' !' : `${T.mouliner} : ${this.touche('RT', 'clic maintenu')}`;
      this.texte('aide', a);
      const al = C.T > 0.9 || C.mouT > 1.2;
      if (this.prev.al !== al) { this.prev.al = al; this.e.aide.classList.toggle('alerte', al); }
      // l'invite
      const I = C.invite || (C.epuisette ? { dir: 'e', t: C.epuisette.t, dur: C.epuisette.dur } : null);
      if (I) {
        this.dernier = I;
        const fl = { g: '←', d: '→', h: '↑', b: '↓' };
        let c, s;
        if (I.dir === 'e') { c = this.touche('A', 'Espace'); s = this.manette() ? '' : 'Espace ou clic'; }
        else if (this.manette()) { c = fl[I.dir]; s = 'la croix ou le stick'; }
        else { c = fl[I.dir]; const L = this.lettres, k = { g: L.KeyA, d: L.KeyD, h: L.KeyW, b: L.KeyS }[I.dir]; s = `${fl[I.dir]}, ${k} ou la souris`; }
        this.texte('inviteC', c);
        const mot = c.length > 2;
        if (this.prev.mot !== mot) { this.prev.mot = mot; this.e.inviteC.classList.toggle('mot', mot); }
        this.texte('inviteT', T.invites[I.dir] || '');
        this.texte('inviteS', s);
        this.e.anneau.setAttribute('stroke-dashoffset', String(Math.round(201 * Math.min(1, I.t / I.dur))));
        this.etatInvite('');
      }
    }
    // le résultat d'une invite : l'invite reste un instant, verte ou rouge
    this.flash = Math.max(0, (this.flash || 0) - dt);
    if (p21.evtInv) { this.flash = 0.35; this.etatInvite(p21.evtInv); p21.evtInv = null; }
    // le message
    const M = p21.msg && !(combat && p21.msg.k === 'coup') ? p21.msg : null;
    this.voir('msg', !!M);
    if (M) { this.texte('msg', M.txt); if (this.prev.mk !== M.k) { this.e.msg.classList.remove('rate', 'appat'); if (M.k === 'rate' || M.k === 'appat') this.e.msg.classList.add(M.k); this.prev.mk = M.k; } this.e.msg.style.opacity = String(Math.min(1, (M.dur - M.t) * 3)); }
    // la prise
    if (et === 'prise' && p21.prise && this.prev.pr !== p21.prise) {
      const P = p21.prise; this.prev.pr = P; this.priseT = 2.6;
      this.texte('priseN', itemName(P.id));
      this.texte('priseM', P.poisson ? T.taille(P.cm, T.kg(P.kg)) : '');
      this.texte('priseR', P.record ? T.record : P.nouvelle ? T.nouvelle : '');
      this.e.priseR.style.display = P.record || P.nouvelle ? '' : 'none';
      this.e.priseR.classList.toggle('rec', !!P.record);
    }
    if (this.priseT > 0) { this.priseT -= dt; this.voir('prise', this.priseT > 0); this.e.prise.style.opacity = String(Math.min(1, this.priseT * 2.5)); }
  },
  etatInvite(k) { if (this.prev.ik !== k) { this.prev.ik = k; this.e.invite.classList.toggle('ok', k === 'ok'); this.e.invite.classList.toggle('ko', k === 'ko'); } },

  // ------------------------------------------------------------- la ligne (juste après l'image)
  ligne(cam) {
    const F = p21.F, et = p21.et;
    const on = !!(cam && F && p21Main.actif && (et === 'vol' || et === 'sol' || et === 'attente' || et === 'touche' || et === 'combat'));
    if (!on) { if (this.vis) { this.vis = false; this.cv.style.display = 'none'; this.ctx.clearRect(0, 0, this.cv.width, this.cv.height); } return; }
    this.creer();
    const W = window.innerWidth, H = window.innerHeight, cv = this.cv;
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    if (!this.vis) { this.vis = true; cv.style.display = 'block'; }
    const ctx = this.ctx;
    ctx.clearRect(0, 0, W, H);
    const R = game.renderer, b = R && R.lastBasis, tn = R && R.lastTan;
    if (!b || !tn) return;
    // le bout de la canne : là où la petite image le place (13-main.js viewModel, 08-renderer.js dessinMain)
    const g = this.gun || { ox: 0, oy: 0, scale: 1 };
    const unit = Math.min(H, W * 0.75), hPx = unit * 0.54 * (g.scale || 1), wPx = hPx * VM_W / VM_H;
    const cx = W * 0.5 + unit * 0.17 + (g.ox || 0) * unit, by = -unit * 0.03 + (g.oy || 0) * unit;
    const top = H - (by + hPx), tip = p21Main.tip;
    const x0 = cx - wPx / 2 + tip[0] / VM_W * wPx, y0 = top + tip[1] / VM_H * hPx;
    // le bouchon (ou le poisson), projeté
    const B = p21.bouee();
    if (!B) return;
    const P = et === 'combat' ? [B.x, B.y + 0.02, B.z] : [B.x, B.y + 0.12, B.z];
    const d = [P[0] - cam.pos[0], P[1] - cam.pos[1], P[2] - cam.pos[2]];
    const z = d[0] * b.f[0] + d[1] * b.f[1] + d[2] * b.f[2];
    if (z < 0.1) return;
    const nx = (d[0] * b.r[0] + d[1] * b.r[1] + d[2] * b.r[2]) / z / tn[0], ny = (d[0] * b.u[0] + d[1] * b.u[1] + d[2] * b.u[2]) / z / tn[1];
    const x1 = (nx * 0.5 + 0.5) * W, y1 = (0.5 - ny * 0.5) * H;
    // molle, elle pend ; tendue, elle file droit
    const tens = et === 'combat' && p21.C ? Math.min(1, p21.C.T * 1.15) : et === 'vol' ? 0.6 : et === 'touche' ? 0.5 : 0.15;
    const len = Math.hypot(x1 - x0, y1 - y0), sag = (1 - tens) * Math.min(160, len * 0.28) + 6;
    const mx = (x0 + x1) / 2, my = Math.max(y0, y1) + sag * 0.6 + (y1 - y0) * 0.1;
    const nuit = game.sky ? game.sky.night || 0 : 0, al = 0.75 - nuit * 0.4;
    ctx.lineWidth = Math.max(1, Math.round(H / 700));
    ctx.strokeStyle = et === 'combat' && p21.C && p21.C.T >= 0.95 ? `rgba(255,170,150,${al + 0.15})` : `rgba(232,232,222,${al})`;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(mx, my, x1, y1); ctx.stroke();
  },
};

// ---------------------------------------------------------------- les branchements
{
  // le HUD suit chaque image (rien quand on ne pêche pas)
  const maj = (dt) => { try { p21Hud.maj(dt); } catch (e) { console.error('p21 hud', e); } };
  maj.zone = true;
  HOOKS.update.push(maj);
  // l'invite réussie ou ratée : la pêche le dit au HUD
  const _ev = p21.evenement.bind(p21);
  p21.evenement = function (ev) { if (ev.e === 'ok') this.evtInv = 'ok'; else if (ev.e === 'rate') this.evtInv = 'ko'; return _ev(ev); };
}
HOOKS.load.push(() => {
  if (typeof game === 'undefined' || game._p21) return;
  game._p21 = true;
  // la canne en main : dessinée par nous pendant la pêche
  const _vm = game.viewModel.bind(game);
  game.viewModel = function (p, dt) {
    const g = _vm(p, dt);
    try { if (g) { p21Hud.gun = g; p21Main.dessiner(g, this); } } catch (e) { console.error('p21 main', e); }
    return g;
  };
  // la ligne, juste après l'image
  const R = game.renderer;
  if (R && R.render && !R._p21) {
    R._p21 = true;
    const _r = R.render.bind(R);
    R.render = function (Fr) { const r = _r(Fr); try { p21Hud.ligne(Fr && Fr.cam); } catch (e) { /* rien */ } return r; };
  }
});

// ---------------------------------------------------------------- le carnet de pêche (Carnet › Pêche)
const p21Carnet = {
  heure(h) { const T = P21_TEXTES.heures; return h === undefined ? '' : T[Math.min(T.length - 1, Math.floor(((h + 1) % 24) / 4))]; },
  rendre() {
    if (typeof menus !== 'undefined' && menus.marque) menus.marque('peche', 0);
    const S = p21.S(), T = P21_TEXTES, E = S.esp, tous = Object.keys(FISH).filter((k) => ITEMS[k]);
    const pris = tous.filter((k) => E[k] && E[k].n > 0);
    const vus = tous.filter((k) => !(E[k] && E[k].n > 0) && savoir.vu(k) > 0);
    const n = (farm.s.stats && farm.s.stats.fish) || pris.reduce((a, k) => a + E[k].n, 0);
    const ap = p21.appat(), canne = p21.meilleureCanne(), P = S.pertes || {};
    let h = `<div class="p21-carnet"><h4>${esc(T.carnetTitre)}</h4>`;
    h += `<p class="p21-res">${esc(T.carnetPrises(n, pris.length + vus.length, tous.length))} ${esc(T.carnetPertes(P.casse || 0, P.decroche || 0))}</p>`;
    h += `<div class="p21-eq"><span>${esc(T.carnetAppat)} : <b>${esc(ap ? itemName(ap) + ' (' + farm.count(ap) + ')' : T.sansAppat)}</b></span>`
      + `<span>${esc(T.carnetCanne)} : <b>${esc(canne ? itemName(canne) : '—')}</b></span>`
      + `<span>${esc(T.carnetAide)} : <b>${esc(T.aides[p21.aide()])}</b></span></div>`;
    const A = typeof activites !== 'undefined' && activites.S ? activites.S() : null, PC = A && A.peche && A.peche.j === farm.s.day ? A.peche : null;
    if (PC && PC.bestKg) h += `<p class="hint">${esc(T.carnetConcours(T.kg(PC.bestKg)))}</p>`;
    if (!pris.length && !vus.length) return h + `<p class="hint m15-vide">${esc(T.carnetVide)}</p></div>`;
    const ligne = (k, rec) => {
      const e = E[k] || {}, nom = itemName(k);
      const r = rec ? `<span class="rec">${esc(T.taille(e.cm, T.kg(e.kg)))}</span>` : `<span class="rec vide">—</span>`;
      const ou = rec ? `<span class="ou">${esc(p21.lieu(e.lieu))}${e.j ? ', ' + esc(T.carnetQuand(e.j, this.heure(e.h))) : ''}</span>` : '<span class="ou"></span>';
      return `<div class="p21-l" data-it="${esc(k)}" data-nom="${esc(nom)}" data-kg="${rec ? e.kg : 0}" data-n="${e.n || 0}"><img src="${iconURL(k)}" alt=""><span class="nm">${esc(nom)}</span><span class="n">${rec ? esc(T.carnetN(e.n)) : ''}</span>${r}${ou}<button data-p21-wiki="${esc(k)}">${esc(T.carnetWiki)}</button></div>`;
    };
    pris.sort((a, b) => E[b].kg - E[a].kg);
    h += `<h4>${esc(T.carnetEspeces)}</h4><div class="p21-liste">${pris.map((k) => ligne(k, true)).join('')}</div>`;
    if (vus.length) h += `<h4>${esc(T.carnetVues)}</h4><div class="p21-liste">${vus.map((k) => ligne(k, false)).join('')}</div>`;
    const reste = tous.length - pris.length - vus.length;
    if (reste > 0) h += `<p class="hint">${esc(T.carnetJamais(reste))}</p>`;
    return h + '</div>';
  },
  brancher(body) {
    body.querySelectorAll('[data-p21-wiki]').forEach((b) => {
      b.onclick = () => { const id = b.getAttribute('data-p21-wiki'); sound.page && sound.page(); if (typeof decouvertes !== 'undefined' && decouvertes.ouvrir) decouvertes.ouvrir('it:' + id); };
    });
  },
};
menus.page({
  id: 'peche', onglet: 'carnet', titre: P21_TEXTES.page, ordre: 25, icone: '🎣', visible: () => !!farm.s,
  rendre: () => p21Carnet.rendre(), apres: (body) => p21Carnet.brancher(body),
  outils: {
    cle: 'peche', items: '.p21-l', texte: (el) => el.getAttribute('data-nom') || '',
    tris: [{ id: 'poids', nom: 'Poids', cle: (el) => +el.getAttribute('data-kg') || 0, desc: true }, { id: 'nom', nom: 'Nom', cle: (el) => el.getAttribute('data-nom') || '' }, { id: 'n', nom: 'Prises', cle: (el) => +el.getAttribute('data-n') || 0, desc: true }],
  },
});

// ---------------------------------------------------------------- l'option (Jeu › « Aide à la pêche »)
{
  const _init = ui.init.bind(ui);
  ui.init = function () {
    const r = _init();
    try {
      if (!$('#o-pecheaide')) {
        const T = P21_TEXTES, l = document.createElement('label');
        l.className = 'row';
        l.title = `${T.aides.complete} : ${T.aideDesc.complete}\n${T.aides.simplifiee} : ${T.aideDesc.simplifiee}\n${T.aides.auto} : ${T.aideDesc.auto}`;
        l.innerHTML = `${esc(T.option)} <select id="o-pecheaide"><option value="complete">${esc(T.aides.complete)}</option><option value="simplifiee">${esc(T.aides.simplifiee)}</option><option value="auto">${esc(T.aides.auto)}</option></select>`;
        if (typeof m21 !== 'undefined' && m21.option) m21.option('Jeu', l);
        else { const cols = $('#dlg-options .cols'); if (cols) cols.appendChild(l); }
        const s = $('#o-pecheaide');
        if (s) {
          s.value = p21.aide();
          s.onchange = () => { p21.reglerAide(s.value); sound.click && sound.click(); };
          const dlg = $('#dlg-options');
          if (dlg && typeof MutationObserver === 'function') new MutationObserver(() => { const e = $('#o-pecheaide'); if (e && e.value !== p21.aide()) e.value = p21.aide(); }).observe(dlg, { attributes: true, attributeFilter: ['class', 'open', 'style'] });
        }
      }
    } catch (e) { console.error('p21 : options', e); }
    return r;
  };
}
