// ============================================================================
//  PORTES : un vrai modèle de porte, à la place du panneau uni d'avant.
//  Planches jointives (texture peinte), barres et écharpe en Z, pentures et
//  gonds, clous de fer, anneau ou poignée, entrée de serrure, serrure à bosse
//  côté intérieur, encadrement (montants, linteau, seuil) en bois ou en pierre
//  selon le mur. Variantes selon le bâtiment : ferme et maisons des champs
//  (porte à écharpe), maisons de ville (porte à panneaux peinte), boutiques
//  (partie haute vitrée), auberge (cloutée, heurtoir), mairie, maison du garde
//  (bandes de fer, judas), forge, roulottes, bibliothèque (deux battants),
//  église (deux grands battants, toujours ouverts : décor seulement), poterne.
//  Trois niveaux de détail selon la distance ; le fonctionnement (ouverture,
//  collision, surbrillance) ne change pas. emitDoor(buf, d, fl) est remplacée.
//  API : PORTES.style(d) (variante calculée une fois par porte), PORTES.deco
//  (portes décoratives dessinées en plus : battants de l'église).
// ============================================================================
Object.assign(TL, { porteBois: 240, porteClous: 241, porteFer: 242, portePanneau: 243, porteBasPanneau: 244, porteVitre: 245, portePierre: 246 });

function portesTuiles(cv) {
  // (chaque tuile est peinte à part puis posée : pas de relecture du canevas)
  const ctx = cv.getContext('2d');
  const T = (idx, fn) => {
    const img = ctx.createImageData(16, 16), D = img.data;
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      let c = fn(x, y); if (typeof c === 'number') c = [c, c, c];
      const k = (y * 16 + x) * 4;
      D[k] = clamp(c[0], 0, 255); D[k + 1] = clamp(c[1], 0, 255); D[k + 2] = clamp(c[2], 0, 255); D[k + 3] = 255;
    }
    ctx.putImageData(img, (idx % 16) * 16, Math.floor(idx / 16) * 16);
  };
  const N = (x, y, s) => hash2i(x, y, s);
  // quatre planches verticales : joint sombre, arête claire, fil du bois, un nœud çà et là
  const planches = (x, y) => {
    const b = x & 3, k = x >> 2;
    let v = 212 + (N(k, 0, 950) - 0.5) * 30 + (N(x, y >> 2, 951) - 0.5) * 20;
    if (b === 3) v = 112; else if (b === 0) v += 18;
    if (b === 1 && (y * 7 + k * 5) % 13 === 0) v -= 34;
    if (y === 15) v -= 26;
    return v;
  };
  T(TL.porteBois, planches);
  // planches cloutées : trois rangs de gros clous forgés
  T(TL.porteClous, (x, y) => {
    const b = x & 3;
    if (b === 1 && (y === 2 || y === 8 || y === 13)) return 58;
    if (b === 1 && (y === 1 || y === 7 || y === 12)) return 168;
    return planches(x, y);
  });
  // bande de fer rivetée
  T(TL.porteFer, (x, y) => {
    if (y === 0 || y === 15) return 92;
    for (const c of [2, 7, 12]) {
      const dx = x - c, dy = y - 7.5;
      if (Math.abs(dx) <= 1 && Math.abs(dy) <= 2) return dx < 0 && dy < 0 ? 236 : dx > 0 || dy > 1 ? 84 : 186;
    }
    return 150 + (N(x, y, 952) - 0.5) * 34;
  });
  // porte à panneaux : cadre, rainure sombre, biseau clair en haut à gauche, sombre en bas à droite
  const panneaux = (rects, fond) => (x, y) => {
    for (const [x0, y0, x1, y1] of rects) {
      if (x < x0 || x > x1 || y < y0 || y > y1) continue;
      if (fond && y1 - y0 > 5 && y0 < 6) return fond(x, y);
      if (x === x0 || x === x1 || y === y0 || y === y1) return 98;
      if (x === x0 + 1 || y === y0 + 1) return 248;
      if (x === x1 - 1 || y === y1 - 1) return 150;
      return 222 + (N(x, y, 953) - 0.5) * 10;
    }
    return 208 + (N(x >> 1, y, 954) - 0.5) * 16 - (y === 15 ? 24 : 0);
  };
  T(TL.portePanneau, panneaux([[2, 2, 6, 8], [9, 2, 13, 8], [2, 10, 6, 13], [9, 10, 13, 13]]));
  // boutique : un panneau en bas, le haut sera vitré (fond sombre derrière la vitre)
  T(TL.porteBasPanneau, panneaux([[2, 2, 13, 8], [2, 10, 13, 13]], () => 70));
  // vitre : verre sombre, un reflet en biais
  T(TL.porteVitre, (x, y) => {
    const r = (x + 15 - y) % 13;
    if (r === 3 || r === 4) return [150, 166, 176];
    return [56 + N(x, y, 955) * 14, 70 + N(x, y, 955) * 14, 82 + N(x, y, 955) * 12];
  });
  // pierre de taille : assises de quatre pixels, joints décalés
  T(TL.portePierre, (x, y) => {
    const k = y >> 2;
    if ((y & 3) === 3) return 124;
    if (x === ((k & 1) ? 7 : 15)) return 132;
    return 198 + (N(x >> 1, y, 956 + k) - 0.5) * 36;
  });
}
{
  const _bsa = buildSkinAtlas;
  buildSkinAtlas = function () {
    _bsa();
    try { portesTuiles(SKIN.canvas); } catch (e) { console.warn('portes : tuiles', e); }
  };
}

// ---------------------------------------------------------------- variantes
const PORTE_COUL = {
  fer: rgbf('#4a4b52'), ferNoir: rgbf('#2e2e33'), laiton: rgbf('#c09a48'), trou: [0.04, 0.035, 0.03], vitre: WHITE,
  bois: rgbf('#8a6a48'), chene: rgbf('#6a4c30'), cadreBois: rgbf('#86684a'), pierre: rgbf('#d4cdbd'), seuil: rgbf('#9a968c'),
};
const PORTE_PEINTURES = ['#3f5a45', '#4a5e72', '#6e2f28', '#5a4632', '#2f4a52', '#6a5a3a', '#4e3a4a'];
const PORTE_STYLE_BLD = {
  ferme: 'ferme', poulailler: 'ferme', auberge: 'auberge', bibliotheque: 'double', mairie: 'mairie', garde: 'garde', forge: 'forge',
  boulangerie: 'boutique', poste: 'boutique', graineterie: 'boutique', vide6: 'boutique', roulotte_a: 'roulotte', roulotte_b: 'roulotte',
};
const PORTE_TEINTE = {
  boulangerie: '#8a3a2a', poste: '#2f4a6a', graineterie: '#4a6a3a', vide6: '#3e2f4a', mairie: '#26364a', auberge: '#5a3e26', garde: '#4e4a42',
  forge: '#3e3228', bibliotheque: '#4a3020', roulotte_a: '#3e6e44', roulotte_b: '#8a3434', ferme: '#8a6a48', poulailler: '#7a6040',
};
const PORTES = {
  cam: [0, 0, 0],
  deco: [],
  _R: new Float32Array(12),
  // variante d'une porte (calculée une fois) : style, couleur, encadrement (pierre ou bois, épaisseur du mur)
  style(d) {
    if (d._st) return d._st;
    const bld = d.bld || '';
    let st = d.poterne ? 'poterne' : d.style || PORTE_STYLE_BLD[bld] || (/^(maison_[a-d]$|maison_rempart|vide)/.test(bld) ? 'ville' : 'rustique');
    const h = hash2i(Math.round(d.x * 4), Math.round(d.z * 4), 41);
    let col = PORTE_TEINTE[bld] || (st === 'ville' ? PORTE_PEINTURES[(h * PORTE_PEINTURES.length) | 0] : st === 'poterne' ? '#3a2c20' : st === 'eglise' ? '#5e4228' : null);
    col = col ? rgbf(col) : PORTE_COUL.bois.map((c) => c * (0.86 + h * 0.22));
    // le mur au-dessus de la porte : sa matière dit si l'encadrement est de pierre ou de bois
    let mur = -1, ep = d.ep || 0.3;
    const w = typeof game !== 'undefined' && game.world;
    if (w && !d.poterne && !d.deco) {
      for (const b of w.blocks) {
        if (Math.abs(b.x - d.x) > 0.06 || Math.abs(b.z - d.z) > 0.06 || Math.abs(b.y - (d.y + d.h + 0.03)) > 0.12) continue;
        mur = b.m; ep = Math.min(b.sx, b.sz); break;
      }
    }
    const pierre = mur === M_STONE || mur === M_STONEWIN || mur === M_BRICK || mur === M_MOSSY;
    d._st = { st, col, pierre, ep, cadre: !d.poterne && !d.deco, double: st === 'double' || st === 'eglise' || d.w > 1.8, hy: Math.min(1.0, d.h * 0.52) };
    return d._st;
  },
};

// petites fonctions de pose (repère du battant : u depuis la charnière, y vers le haut, z < 0 dehors)
let _pS = 1;
const _pB = (u, y, z, su, sy, sz, col, code, rz) => PE.box(u * _pS, y, z, su, sy, sz, col, code, 0, 0, (rz || 0) * _pS);
// anneau (quatre barreaux en losange) suspendu à une platine
// (zf : la face du battant ; dir : -1 côté rue, +1 côté intérieur)
function porteAnneau(u, y, zf, r, col, dir = -1) {
  const k = r / 2, s = r * 1.42, q = Math.PI / 4, z = zf + dir * 0.02;
  _pB(u, y + r + 0.02, zf + dir * 0.006, 0.06, 0.06, 0.012, col, TL.iron);
  _pB(u + k, y + k, z, s, 0.014, 0.014, col, TL.iron, -q); _pB(u - k, y + k, z, s, 0.014, 0.014, col, TL.iron, q);
  _pB(u + k, y - k, z, s, 0.014, 0.014, col, TL.iron, q); _pB(u - k, y - k, z, s, 0.014, 0.014, col, TL.iron, -q);
}
// entrée de serrure (platine + trou)
function porteEntree(u, y, z, col) {
  _pB(u, y, z, 0.045, 0.085, 0.01, col, TL.iron);
  _pB(u, y - 0.008, z - 0.006, 0.013, 0.03, 0.01, PORTE_COUL.trou, TL.plain);
}
// poignée ronde sur rosace
function portePoignee(u, y, z, sens, col) {
  _pB(u, y, z, 0.06, 0.06, 0.01, col, TL.iron);
  _pB(u, y, z + sens * 0.03, 0.045, 0.045, 0.05, col, TL.iron);
}
// charnières (fiches) sur le chant, visibles des deux côtés
function porteFiches(h, t, n) {
  const ys = n === 2 ? [0.25, h - 0.3] : [0.22, h * 0.5, h - 0.28];
  for (const y of ys) _pB(-0.004, y, 0, 0.03, 0.11, t + 0.016, PORTE_COUL.fer, TL.iron);
}

// un battant : sens -1 (charnière à gauche, s'ouvre en tournant vers +z) ou +1 (charnière à droite)
function porteBattant(d, S, sens, lw, fl, lod) {
  const R = PORTES._R, h = d.h, t = 0.07, zE = -t / 2, zI = t / 2, F = PORTE_COUL;
  m34TR(PE._L, sens < 0 ? -d.w / 2 : d.w / 2, 0, 0, 0, sens < 0 ? -d.a : d.a, 0);
  m34Mul(_mT2, R, PE._L);
  PE.M.set(_mT2);
  PE.fl = fl;
  _pS = -sens; // u (depuis la charnière) vers le milieu de la baie
  const st = S.st, col = S.col, U = lw / 2, hy = S.hy;
  const dark = [col[0] * 0.72, col[1] * 0.72, col[2] * 0.72];
  const tuile = st === 'ville' || st === 'mairie' || st === 'double' ? TL.portePanneau : st === 'boutique' ? TL.porteBasPanneau : st === 'auberge' || st === 'poterne' || st === 'eglise' ? TL.porteClous : TL.porteBois;
  // le vantail
  _pB(U, h / 2, 0, lw - 0.012, h - 0.012, t, col, tuile);
  if (lod === 0) { PE.fl = 0; return; }
  const loin = lod === 1;
  const uP = lw - (lw < 1 ? 0.12 : 0.16); // côté de la serrure
  const principal = sens < 0; // la serrure est sur le battant de gauche (ou le seul)
  switch (st) {
    case 'ferme': case 'rustique': case 'forge': case 'roulotte': {
      const yb = 0.2, yt = h - 0.34;
      if (st !== 'roulotte') {
        // barres et écharpe en Z, côté rue
        _pB(U, yb + 0.065, zE - 0.016, lw - 0.1, 0.13, 0.032, dark, TL.porteBois);
        _pB(U, yt + 0.065, zE - 0.016, lw - 0.1, 0.13, 0.032, dark, TL.porteBois);
        const x0 = 0.14, y0 = yb + 0.13, x1 = lw - 0.14, y1 = yt, L = Math.hypot(x1 - x0, y1 - y0);
        _pB((x0 + x1) / 2, (y0 + y1) / 2, zE - 0.016, L + 0.04, 0.12, 0.03, dark, TL.porteBois, Math.atan2(y1 - y0, x1 - x0));
      } else {
        // roulotte : petite fenêtre en haut
        _pB(U, h - 0.42, 0, 0.3, 0.32, t + 0.008, F.vitre, TL.porteVitre);
        _pB(U, h - 0.42, 0, 0.022, 0.32, t + 0.014, dark, TL.plain); _pB(U, h - 0.42, 0, 0.3, 0.022, t + 0.014, dark, TL.plain);
      }
      if (loin) break;
      if (st !== 'roulotte') for (const y of [yb + 0.065, yt + 0.065]) {
        // pentures sur les barres, gonds sur le chant
        _pB(0.31 * lw - 0.02, y, zE - 0.038, 0.62 * lw, 0.05, 0.012, F.ferNoir, TL.porteFer);
        _pB(0.62 * lw, y, zE - 0.038, 0.065, 0.065, 0.012, F.ferNoir, TL.iron, Math.PI / 4);
        _pB(-0.03, y, zE - 0.02, 0.05, 0.075, 0.05, F.ferNoir, TL.iron);
      } else porteFiches(h, t, 2);
      if (st === 'forge') _pB(U, h * 0.5, zE - 0.012, lw - 0.06, 0.07, 0.012, F.ferNoir, TL.porteFer);
      if (st === 'roulotte') portePoignee(uP, hy, zE, -1, F.laiton);
      else porteAnneau(uP, hy - 0.05, zE, 0.05, F.ferNoir);
      porteEntree(uP, hy - 0.2, zE - 0.006, F.ferNoir);
      // dedans : serrure à bosse, loquet
      _pB(uP + 0.02, hy - 0.15, zI + 0.025, 0.2, 0.15, 0.05, F.ferNoir, TL.iron);
      _pB(uP - 0.06, hy + 0.04, zI + 0.012, 0.24, 0.026, 0.024, F.ferNoir, TL.iron);
      break;
    }
    case 'ville': case 'mairie': case 'double': {
      const met = st === 'ville' ? F.fer : F.laiton;
      portePoignee(uP + 0.06, hy, zE - 0.004, -1, met);
      if (loin) break;
      porteFiches(h, t, 3);
      portePoignee(uP + 0.06, hy, zI + 0.004, 1, met);
      if (principal) { porteEntree(uP + 0.06, hy - 0.13, zE - 0.006, met); _pB(uP + 0.04, hy - 0.1, zI + 0.02, 0.16, 0.13, 0.04, F.ferNoir, TL.iron); }
      if (st === 'ville') { _pB(U, h * 0.405, zE - 0.004, 0.24, 0.05, 0.01, met, TL.iron); _pB(U, h * 0.405, zE - 0.008, 0.19, 0.016, 0.01, F.trou, TL.plain); } // fente aux lettres
      if (st === 'mairie' && principal) porteAnneau(U, h * 0.66, zE, 0.065, F.laiton);
      _pB(uP + 0.02, hy + 0.5, zI + 0.012, 0.15, 0.03, 0.022, F.fer, TL.iron); // verrou
      break;
    }
    case 'boutique': {
      // partie haute vitrée, croisillons
      const g0 = h * 0.445, g1 = h * 0.872, gw = lw - 0.24;
      _pB(U, (g0 + g1) / 2, 0, gw, g1 - g0, t + 0.006, F.vitre, TL.porteVitre);
      _pB(U, (g0 + g1) / 2, 0, 0.026, g1 - g0, t + 0.016, col, TL.plain);
      _pB(U, (g0 + g1) / 2, 0, gw, 0.026, t + 0.016, col, TL.plain);
      portePoignee(uP + 0.06, hy, zE - 0.004, -1, F.laiton);
      if (loin) break;
      porteFiches(h, t, 3);
      portePoignee(uP + 0.06, hy, zI + 0.004, 1, F.laiton);
      porteEntree(uP + 0.06, hy - 0.13, zE - 0.006, F.laiton);
      _pB(U, 0.09, zE - 0.004, lw - 0.14, 0.15, 0.008, F.laiton, TL.iron); // plaque de propreté
      _pB(uP + 0.04, hy - 0.1, zI + 0.02, 0.16, 0.13, 0.04, F.ferNoir, TL.iron);
      break;
    }
    case 'auberge': case 'garde': case 'poterne': case 'eglise': {
      // bandes de fer rivetées (l'église : longues pentures)
      const ys = st === 'eglise' ? [0.35, h * 0.5, h - 0.45] : st === 'poterne' ? [0.26, h * 0.5, h - 0.3] : st === 'garde' ? [0.24, h * 0.52, h - 0.3] : [0.3, h - 0.36];
      for (const y of ys) {
        if (st === 'eglise') { _pB(0.36 * lw, y, zE - 0.008, 0.72 * lw, 0.07, 0.014, F.ferNoir, TL.porteFer); if (!loin) _pB(0.72 * lw, y, zE - 0.008, 0.09, 0.09, 0.014, F.ferNoir, TL.iron, Math.PI / 4); }
        else _pB(U, y, zE - 0.008, lw - 0.04, st === 'poterne' ? 0.085 : 0.065, 0.014, F.ferNoir, TL.porteFer);
      }
      if (st === 'poterne') {
        // dehors : ni poignée ni serrure. Dedans : un gros verrou et un anneau pour tirer
        if (loin) break;
        _pB(uP - 0.04, 1.0, zI + 0.02, 0.36, 0.045, 0.03, F.ferNoir, TL.iron);
        _pB(uP - 0.18, 1.0, zI + 0.03, 0.05, 0.08, 0.05, F.ferNoir, TL.iron); _pB(uP + 0.08, 1.0, zI + 0.03, 0.05, 0.08, 0.05, F.ferNoir, TL.iron);
        porteAnneau(uP - 0.04, 0.82, zI, 0.05, F.ferNoir, 1);
        _pB(-0.03, 0.3, zI + 0.02, 0.05, 0.08, 0.05, F.ferNoir, TL.iron); _pB(-0.03, h - 0.3, zI + 0.02, 0.05, 0.08, 0.05, F.ferNoir, TL.iron);
        break;
      }
      if (st === 'garde' && !loin) {
        // judas grillagé
        _pB(U, h * 0.74, zE - 0.004, 0.16, 0.12, 0.01, PORTE_COUL.trou, TL.plain);
        _pB(U - 0.04, h * 0.74, zE - 0.012, 0.014, 0.12, 0.014, F.ferNoir, TL.iron); _pB(U + 0.04, h * 0.74, zE - 0.012, 0.014, 0.12, 0.014, F.ferNoir, TL.iron);
      }
      if (st === 'auberge' && !loin) porteAnneau(U, h * 0.66, zE, 0.075, F.ferNoir); // heurtoir
      if (principal) porteAnneau(uP, hy - 0.05, zE, 0.05, F.ferNoir);
      if (loin) break;
      if (principal) { porteEntree(uP, hy - 0.2, zE - 0.006, F.ferNoir); _pB(uP + 0.02, hy - 0.15, zI + 0.025, 0.2, 0.15, 0.05, F.ferNoir, TL.iron); }
      for (const y of ys) _pB(-0.03, y, zE - 0.02, 0.05, 0.075, 0.05, F.ferNoir, TL.iron);
      break;
    }
  }
  PE.fl = 0;
}

// encadrement fixe (dans le repère de la porte : baie centrée en x = 0, mur d'épaisseur ep centré en z = 0)
function porteCadre(d, S, lod) {
  const ow = d.w + 0.06, oh = d.h + 0.03, ep = S.ep, F = PORTE_COUL;
  const pierre = S.pierre, cw = pierre ? 0.2 : 0.12, cd = pierre ? 0.06 : 0.04, lh = pierre ? 0.24 : 0.15;
  const col = pierre ? F.pierre : F.cadreBois, tile = pierre ? TL.portePierre : TL.darkwood;
  const ze = -ep / 2 - cd / 2;
  PE.bx(-(ow / 2 + cw / 2), -0.02, ze, cw, oh + 0.02, cd, col, tile);
  PE.bx(ow / 2 + cw / 2, -0.02, ze, cw, oh + 0.02, cd, col, tile);
  PE.bx(0, oh, ze, ow + 2 * cw + 0.04, lh, cd + 0.01, col, tile);
  if (pierre) PE.bx(0, oh - 0.02, ze - 0.012, 0.17, lh + 0.06, cd + 0.02, col, tile);
  PE.bx(0, -0.09, -0.08, ow + 0.16, 0.1, ep + 0.26, F.seuil, TL.stone);
  if (lod < 2 || pierre) return;
  const zi = ep / 2 + cd / 2;
  PE.bx(-(ow / 2 + cw / 2) - 0.012, -0.02, zi, cw, oh + 0.02, cd, col, tile);
  PE.bx(ow / 2 + cw / 2 + 0.012, -0.02, zi, cw, oh + 0.02, cd, col, tile);
  PE.bx(0, oh, zi, ow + 2 * cw + 0.06, lh, cd, col, tile);
}

// ---------------------------------------------------------------- remplace le panneau d'origine
emitDoor = function (buf, d, fl) {
  const S = PORTES.style(d), R = PORTES._R;
  const dx = d.x - PORTES.cam[0], dz = d.z - PORTES.cam[2], d2 = dx * dx + dz * dz;
  const lod = d2 < 24 * 24 ? 2 : d2 < 62 * 62 ? 1 : 0;
  PE.buf = buf;
  m34Root(R, d.x, d.y, d.z, d.r, 1);
  PE.fl = 0;
  if (S.cadre && lod > 0) { PE.M.set(R); porteCadre(d, S, lod); }
  if (S.double) { porteBattant(d, S, -1, d.w / 2, fl || 0, lod); porteBattant(d, S, 1, d.w / 2, fl || 0, lod); }
  else porteBattant(d, S, -1, d.w, fl || 0, lod);
  PE.fl = 0; _pS = 1;
};

// la caméra (pour le niveau de détail) et les portes décoratives
HOOKS.draw.push((buf, sbuf, cam) => {
  PORTES.cam[0] = cam[0]; PORTES.cam[1] = cam[1]; PORTES.cam[2] = cam[2];
  for (const d of PORTES.deco) if (Math.abs(d.x - cam[0]) < 110 && Math.abs(d.z - cam[2]) < 110) emitDoor(buf, d, 0);
});
// les deux grands battants de l'église, ouverts contre les murs du clocher (décor : ni collision, ni touche E)
HOOKS.load.push(() => {
  PORTES.deco = [];
  const w = game.world, B = w && w.bld && w.bld.eglise;
  if (!B || !B.f) return;
  const f = B.f, c = Math.cos(f.r), s = Math.sin(f.r), lz = -13.64;
  PORTES.deco.push({ x: f.x + lz * s, y: f.y + 0.02, z: f.z + lz * c, r: f.r, w: 1.94, h: 3.14, a: 1.42, open: 1, style: 'eglise', deco: true });
});
