// ============================================================================
//  LES GROTTES DE LA CHUTE (agent P18) — 7. LE CARNET ET LA MUSIQUE
//  - Carnet → « Les Grottes de la Chute » : le plan de ce qu'on a vu (les
//    salles où l'on est entré, les galeries qui y mènent, le lac, la rivière),
//    les sorties, et où l'on est quand on y est. Il se dessine au fil des
//    visites, comme on recopierait au propre ce qu'on a griffonné.
//  - La musique : les coins de paradis ont la leur (groupe « paradis »).
// ============================================================================
{
  const st = document.createElement('style');
  st.id = 'p18-carnet-css';
  st.textContent = `#satchel .p18 svg{display:block;width:100%;max-width:440px;margin:6px auto;background:rgba(255,248,230,.35);border:1px solid rgba(90,70,40,.25)}
#satchel .p18 .leg{font-size:12px;color:#6a5638;text-align:center;margin-top:4px}`;
  document.head.appendChild(st);
}

const p18Carnet = {
  rendre() {
    const S = p18Jeu.S(), vus = S.salles || {}, P = P18_GROTTE, w = game.world;
    if (!w || !w.p18) return '';
    if (!Object.keys(vus).length) return `<p class="hint m15-vide">${esc(P18_TEXTES.carnetVide)}</p>`;
    p18Grotte.creuseurs();
    const [x0, z0, x1, z1] = P.boite, W = x1 - x0, H = z1 - z0;
    const X = (x) => (x - x0).toFixed(1), Z = (z) => (z - z0).toFixed(1);
    const parts = [`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Georgia,serif">`];
    const encre = '#5a3e22', pale = '#8a6a44';
    // les galeries : celles dont on a vu un bout (pleines si l'on a vu les deux)
    for (const [k, pts, a, b] of p18Grotte._gal) {
      const va = !!vus[a], vb = !!vus[b];
      if (!va && !vb) continue;
      parts.push(`<polyline points="${pts.map((q) => X(q[0]) + ',' + Z(q[1])).join(' ')}" fill="none" stroke="${encre}" stroke-width="${(pts[1] ? pts[1][3] : 3) * 1.4}" stroke-linecap="round" stroke-linejoin="round" opacity="${va && vb ? 0.75 : 0.35}"${va && vb ? '' : ' stroke-dasharray="6 6"'}/>`);
      void k;
    }
    // la rivière d'en bas
    if (vus.torrent || vus.tonnerre) parts.push(`<polyline points="${P.torrent.map((q) => X(q[0]) + ',' + Z(q[1])).join(' ')}" fill="none" stroke="#3a6a8a" stroke-width="7" stroke-linecap="round" opacity="${vus.torrent ? 0.8 : 0.35}"/>`);
    // les salles vues, le lac
    for (const [k, cx, cz, rx, rz, rot] of P.lacs) if (vus[k]) parts.push(`<ellipse cx="${X(cx)}" cy="${Z(cz)}" rx="${rx}" ry="${rz}" transform="rotate(${(-rot * 180 / Math.PI).toFixed(1)} ${X(cx)} ${Z(cz)})" fill="#6a96b4" fill-opacity="0.55" stroke="${encre}" stroke-width="2"/>`);
    for (const [k, cx, cz, rx, rz, rot] of P.salles) {
      if (!vus[k]) continue;
      parts.push(`<ellipse cx="${X(cx)}" cy="${Z(cz)}" rx="${rx}" ry="${rz}" transform="rotate(${(-rot * 180 / Math.PI).toFixed(1)} ${X(cx)} ${Z(cz)})" fill="#c8b48c" fill-opacity="0.55" stroke="${encre}" stroke-width="2.5"/>`);
    }
    // les noms
    for (const [k, cx, cz] of [...P.salles, ...P.lacs]) if (vus[k]) parts.push(`<text x="${X(cx)}" y="${Z(cz) - 0}" font-size="17" text-anchor="middle" fill="${encre}" stroke="rgba(255,248,230,.8)" stroke-width="4" paint-order="stroke">${esc(P18_SALLES_NOMS[k] || k)}</text>`);
    // les sorties
    const sortie = (x, z, t) => parts.push(`<path d="M ${X(x)} ${+Z(z) + 9} L ${X(x)} ${+Z(z) - 9} M ${+X(x) - 6} ${+Z(z) - 3} L ${X(x)} ${+Z(z) - 9} L ${+X(x) + 6} ${+Z(z) - 3}" stroke="#a8442a" stroke-width="3.5" fill="none"/><text x="${+X(x) + 10}" y="${+Z(z) + 5}" font-size="15" fill="#a8442a">${esc(t)}</text>`);
    if (vus.vestibule) sortie(P.arrivee[0] + 8, P.arrivee[2], 'la chute');
    if (vus.aven) sortie(P.cheminees[0][0] + 6, P.cheminees[0][1], 'l’aven');
    // ici
    const p = game.player;
    if (p && p18Jeu.dansGrotte(p.pos)) parts.push(`<circle cx="${X(p.pos[0])}" cy="${Z(p.pos[2])}" r="7" fill="#a8442a" stroke="#fff8e6" stroke-width="2"/>`);
    // le nord
    parts.push(`<text x="${W - 26}" y="34" font-size="18" fill="${pale}">N</text><path d="M ${W - 20} 40 L ${W - 20} 70" stroke="${pale}" stroke-width="2"/>`);
    parts.push('</svg>');
    const n = Object.keys(vus).length, tot = P.salles.length + P.lacs.length + 1;
    return `<div class="p18">${parts.join('')}<div class="leg">${esc(n + ' / ' + tot + ' — ' + (p && p18Jeu.dansGrotte(p.pos) ? '● ' + P18_TEXTES.carnetIci + ' · ' : '') + '↑ ' + P18_TEXTES.carnetSorties)}</div></div>`;
  },
};
menus.page({ id: 'p18_grottes', onglet: 'carnet', titre: P18_TEXTES.carnet, ordre: 60, visible: () => !!(farm.s && game.world && game.world.p18 && Object.keys(p18Jeu.S().salles || {}).length), rendre: () => p18Carnet.rendre() });

// ---------------------------------------------------------------- la musique : les coins de paradis ont la leur
if (typeof musique !== 'undefined' && typeof musique.zone === 'function') {
  const _mz = musique.zone.bind(musique);
  musique.zone = function () {
    const z = _mz();
    if (!z || z.g === 'dessous' || z.g === 'nuit' || /^monde:/.test(z.cle)) return z;
    const Q = p18Jeu.coinIci;
    if (Q && MUSIQUE.ordre.some((k) => MUSIQUE.morceaux[k].groupe === 'paradis')) return { g: 'paradis', cle: 'paradis' };
    return z;
  };
}
