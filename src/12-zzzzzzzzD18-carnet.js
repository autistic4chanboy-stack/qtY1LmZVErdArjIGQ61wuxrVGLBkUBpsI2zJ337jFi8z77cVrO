// ============================================================================
//  LES DETTES DE LA FERME (agent D18) — 4. LE CARNET
//  Menu (Tab) → Carnet → « La ferme » : le terme en cours (ce qui est dû, pour
//  quand, les pénalités, les scellés), les huit termes (faits, en cours, à
//  venir), la silhouette de la ferme telle qu'elle est et, en pointillé, ce
//  que paiera le terme suivant ; les travaux faits et ce qu'ils apportent.
// ============================================================================
{
  const st = document.createElement('style');
  st.id = 'd18-css';
  st.textContent = `#satchel .d18 h4{margin:14px 0 6px}
#satchel .d18 h4:first-child{margin-top:4px}
#satchel .d18 .d18-l{display:flex;justify-content:space-between;gap:10px;padding:2px 2px;color:#4a3a26}
#satchel .d18 .d18-l b{font-weight:normal;color:#6a5436}
#satchel .d18 .d18-l.rouge span{color:#8a2a1a}
#satchel .d18 .d18-pts{display:flex;gap:6px;margin:8px 0 4px}
#satchel .d18 .d18-pts i{flex:1;height:7px;border-radius:4px;border:1px solid rgba(122,74,26,.5);background:rgba(255,255,255,.25)}
#satchel .d18 .d18-pts i.f{background:#8a5a2a;border-color:#8a5a2a}
#satchel .d18 .d18-pts i.c{background:repeating-linear-gradient(90deg,#c8a070 0 4px,transparent 4px 7px)}
#satchel .d18 svg{display:block;width:100%;height:auto;margin:8px 0 2px;background:rgba(255,250,235,.35);border:1px solid rgba(90,70,40,.18);border-radius:3px}
#satchel .d18 svg .n{fill:none;stroke:#8a5a2a;stroke-width:1.3;stroke-dasharray:3 2.5}
#satchel .d18 .d18-fait{margin:3px 0 3px 4px;color:#4a3a26}
#satchel .d18 .d18-fait::before{content:'✓ ';color:#8a5a2a}
#satchel .d18 .d18-fait small{display:block;margin-left:14px;color:#7a6a50}`;
  document.head.appendChild(st);
}

// ---------------------------------------------------------------- la silhouette de la ferme (une élévation, de face)
// chaque terme ajoute ses formes ; n : les termes faits ; le terme n+1 en pointillé
function d18Formes(n) {
  const F = [], toit = n >= 1 ? '#4c5462' : '#b89a5a', mur = n >= 3 ? '#a8a49a' : '#a0805e';
  const add = (k, t, a) => F.push(Object.assign({ k, t }, a));
  // la maison (au terme 8, un étage)
  const haut = n >= 8 ? 44 : 70;
  add(0, 'rect', { x: 132, y: haut, w: 56, h: 100 - haut, f: mur });
  add(0, 'poly', { p: `126,${haut} 160,${haut - 24} 194,${haut}`, f: toit });
  add(0, 'rect', { x: 172, y: haut - 20, w: 7, h: 14, f: '#8a4a3a' });
  add(0, 'rect', { x: 155, y: 82, w: 10, h: 18, f: '#5a3a24' });
  // 1 : le toit d'ardoise (en pointillé : le toit), un banc, des pots
  add(1, 'poly', { p: `126,${haut} 160,${haut - 24} 194,${haut}`, f: '#4c5462' });
  add(1, 'rect', { x: 136, y: 94, w: 14, h: 4, f: '#7a5a3a' });
  // 2 : réverbères, pompe
  for (const x of [112, 208]) { add(2, 'rect', { x, y: 74, w: 2, h: 26, f: '#3a3a40' }); add(2, 'circle', { cx: x + 1, cy: 73, r: 3, f: '#e8c070' }); }
  add(2, 'rect', { x: 244, y: 90, w: 10, h: 10, f: '#8a8a88' });
  // 3 : murs de pierre, vitres, perron
  add(3, 'rect', { x: 132, y: 70, w: 56, h: 30, f: '#a8a49a' });
  for (const x of [138, 174]) add(3, 'rect', { x, y: 78, w: 8, h: 8, f: '#bcd4e0' });
  add(3, 'rect', { x: 150, y: 77, w: 20, h: 3, f: '#4c5462' });
  // 4 : le verger, les ruches
  for (const [x, r] of [[266, 9], [284, 8], [302, 9]]) { add(4, 'rect', { x: x - 1.5, y: 86, w: 3, h: 14, f: '#6a4a2a' }); add(4, 'circle', { cx: x, cy: 82, r, f: '#5f8a4a' }); }
  // 5 : l'aile est
  add(5, 'rect', { x: 188, y: 78, w: 34, h: 22, f: '#a8a49a' });
  add(5, 'poly', { p: '186,78 205,64 224,78', f: '#4c5462' });
  // 6 : la serre
  add(6, 'rect', { x: 8, y: 82, w: 42, h: 18, f: '#cfe3e6' });
  add(6, 'poly', { p: '6,82 29,70 52,82', f: '#b8d4da' });
  // 7 : l'écurie, la fontaine
  add(7, 'rect', { x: 56, y: 82, w: 34, h: 18, f: '#9a7a54' });
  add(7, 'poly', { p: '53,82 73,74 93,82', f: '#4c5462' });
  add(7, 'rect', { x: 228, y: 92, w: 14, h: 8, f: '#9a9890' });
  add(7, 'rect', { x: 234, y: 84, w: 2, h: 8, f: '#9a9890' });
  // 8 : l'étage, l'aile ouest, les murets
  add(8, 'rect', { x: 132, y: 44, w: 56, h: 26, f: '#a8a49a' });
  add(8, 'rect', { x: 96, y: 78, w: 36, h: 22, f: '#a8a49a' });
  add(8, 'poly', { p: '94,78 114,64 134,78', f: '#4c5462' });
  add(8, 'rect', { x: 0, y: 97, w: 150, h: 3, f: '#8a8a7a' });
  add(8, 'rect', { x: 170, y: 97, w: 150, h: 3, f: '#8a8a7a' });
  return F;
}
function d18Silhouette(n) {
  const one = (s, cls) => {
    const st = cls ? ` class="${cls}"` : ` fill="${s.f}"`;
    if (s.t === 'rect') return `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}"${st}/>`;
    if (s.t === 'circle') return `<circle cx="${s.cx}" cy="${s.cy}" r="${s.r}"${st}/>`;
    return `<polygon points="${s.p}"${st}/>`;
  };
  const F = d18Formes(n), avant = F.filter((s) => s.k <= n), apres = n < D18_TERMES.length ? d18Formes(n + 1).filter((s) => s.k === n + 1) : [];
  return `<svg viewBox="0 0 320 104" role="img" aria-label="${esc(D18_TEXTES.ferme)}"><rect x="0" y="100" width="320" height="4" fill="#7a8a5a"/>${avant.map((s) => one(s)).join('')}${apres.map((s) => one(s, 'n')).join('')}</svg>`;
}

const d18Carnet = {
  rendre() {
    const S = dettes18.S();
    if (!S) return '';
    const s = farm.s, d = s.day, N = dettes18.N, T = D18_TEXTES, L = ['<div class="d18">'];
    const ligne = (a, b, rouge) => `<div class="d18-l${rouge ? ' rouge' : ''}"><b>${esc(a)}</b><span>${esc(b)}</span></div>`;
    L.push(`<h4>${esc(T.ferme)}</h4>`);
    L.push('<div class="d18-pts">' + D18_TERMES.map((_, i) => `<i class="${i < S.palier ? 'f' : i === S.palier ? 'c' : ''}"></i>`).join('') + '</div>');
    if (S.palier >= N) L.push(`<p class="hint">${esc(T.quitte)}</p>`);
    else {
      const num = dettes18.num(S.palier);
      L.push(ligne(T.terme, `${num.charAt(0).toUpperCase() + num.slice(1)} (${S.palier + 1}/${N})`));
      L.push(ligne(T.du, `${S.du} pièces${S.penal ? ` (dont ${S.penal} de pénalités)` : ''}`, S.penal > 0));
      const r = d - S.echeance;
      L.push(r > 0 ? ligne(T.retard, `${r} jour${r > 1 ? 's' : ''}`, true) : ligne(T.echeance, `${dettes18.jourNom(S.echeance)}${S.echeance - d > 0 ? ` (dans ${S.echeance - d} jour${S.echeance - d > 1 ? 's' : ''})` : ''}`));
      if (S.scelles) L.push(ligne(T.scelles, '', true));
      const P = D18_TERMES[S.palier];
      L.push(`<p class="hint">${esc(T.prochain)} : ${esc(P.titre.toLowerCase())}. ${esc(P.bas)}</p>`);
    }
    L.push(d18Silhouette(S.fait));
    if (S.travaux.length) L.push(`<p class="hint">${esc(T.ouvriers)}</p>`);
    if (S.palier < N) L.push(`<p class="hint">${esc(T.ou(dettes18.ou().replace(/^(sur la porte de |à la porte de |à )/, '')))}</p>`);
    if (S.fait) {
      L.push(`<h4>${esc(T.fait)}</h4>`);
      for (let i = 0; i < S.fait; i++) L.push(`<div class="d18-fait">${esc(D18_TERMES[i].titre)}<small>${esc(D18_TERMES[i].avantage)}</small></div>`);
    }
    L.push('</div>');
    return L.join('');
  },
};
menus.page({ id: 'dettes18', onglet: 'carnet', titre: D18_TEXTES.page, ordre: 15, visible: () => !!(farm.s && farm.s.dettes18), rendre: () => d18Carnet.rendre() });
