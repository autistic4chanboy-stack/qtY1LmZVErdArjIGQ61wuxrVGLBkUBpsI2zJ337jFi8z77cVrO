// ============================================================================
//  VILLES ET VILLAGES QUI VIVENT : la ville se garnit (enseignes, bacs à fleurs,
//  panneau d'affichage, terrasse de l'auberge, second marché, monument aux morts,
//  drapeau, boîte aux lettres, forge et boulangerie équipées, bancs, barres
//  d'attache et abreuvoirs, arrière-cours avec linge, potagers, bois et poules,
//  pigeons et chats) ; le hameau aussi (potagers, four à pain, ruches, linge,
//  charrette, cage à poules), le hameau abandonné (une balançoire qui bouge
//  seule), la cabane du pêcheur (filets, séchoir, nasses), la mine (rails,
//  wagonnets, treuil).
//  Passe ajoutée en dernier, avec son propre tirage : les anciennes sauvegardes
//  restent valables (les objets générés avant gardent leurs numéros).
// ============================================================================
const TOWN_PROP_R = {
  panneau_affichage: 1.0, parasol: 0.3, table: 0.9, tas_bois: 0.8, caisses: 0.8, sacs: 0.7, charrette: 1.3, poteau_attache: 1.2, monument: 1.3,
  mat_drapeau: 0.4, four_pain: 1.3, balancoire: 1.2, filet: 1.4, sechoir: 1.2, nasse: 0.3, wagonnet: 0.8, rails: 0.8, treuil: 0.8, meule_aiguiser: 0.5,
  boite_poste: 0.3, cage_poules: 0.8, potager: 1.5, corde_linge: 1.9, etal_complet: 1.7, banc: 0.9, tonneau: 0.35, abreuvoir: 0.8, ruche: 0.35,
  pot_fleurs: 0.25, epouvantail: 0.3, jardiniere: 0.6, panneau: 0.3,
};
const SHOP_SIGNS = { boulangerie: 'pain', forge: 'fer', graineterie: 'graine', poste: 'lettre', auberge: 'chope', mairie: 'mairie', garde: 'garde' };
const VEG_SETS = [['chou', 'poireau', 'laitue', 'carotte', 'oignon', 'haricot'], ['tomate', 'courgette', 'fraise', 'betterave', 'ail', 'petit_pois'], ['patate', 'blette', 'navet', 'persil', 'epinard', 'celeri'], ['rhubarbe', 'framboise', 'groseille', 'basilic', 'thym', 'courge'], ['tulipe', 'dahlia', 'souci', 'pavot', 'rose', 'lavande']];

function addTownLife(w, B, seed, ctx) {
  const rnd = mulberry32(seed * 131 + 17), lm = w.lm, WL = w.waterLevel;
  w.grid = null; // grille à jour : colliders de tous les objets posés jusqu'ici
  const placed = [];
  // chemins : on se tient à l'écart des nœuds (davantage devant les portes, les ponts, les places) ;
  // les liaisons coupées par ce qu'on pose sont retirées à la fin (le maillage des rues est dense)
  const key = (n) => /:(out|in|mid|porte|pont|route)$|^(place|hameau|ranch|ponton)$/.test(n.tag);
  const nodes = w.nav.nodes;
  const nearNode = (x, z, r) => nodes.some((n) => { const R = r + (key(n) ? 1.6 : 0); return Math.abs(n.x - x) < R && Math.abs(n.z - z) < R && Math.hypot(n.x - x, n.z - z) < R; });
  const nearDoor = (x, z, r) => w.doors.some((d) => Math.hypot(d.x - x, d.z - z) < r);
  const nearInter = (x, z, r) => (w.inter || []).some((it) => Math.hypot(it.x - x, it.z - z) < r);
  const clash = (x, z, r) => placed.some(([px, pz, pr]) => Math.hypot(px - x, pz - z) < pr + r);
  const ok = (id, x, z, pathR) => {
    const r = TOWN_PROP_R[id] || 0.8;
    return w.inside(x, z, 10) && w.heightAt(x, z) > WL + 0.3 && !clash(x, z, r) && !nearDoor(x, z, r + 1.3) && !nearInter(x, z, r + 0.6)
      && (pathR === 0 || !nearNode(x, z, r + Math.min(1.1, (pathR ?? 1.5) * 0.7))) && pointFree(w, x, z, r * 0.8);
  };
  const put = (id, x, z, r, data, y) => { const p = B.prop(id, x, y ?? w.heightAt(x, z), z, r, data || null); placed.push([x, z, TOWN_PROP_R[id] || 0.8, !!PROP_COLL[id]]); return p; };
  // essaie chaque emplacement proposé, puis un peu autour (1,2 m, 2,4 m)
  const JIT = [[0, 0]];
  for (const r of [1.2, 2.4]) for (let k = 0; k < 8; k++) JIT.push([Math.cos(k * 0.785) * r, Math.sin(k * 0.785) * r]);
  const tryPut = (id, cands, data, pathR) => {
    for (const [dx, dz] of JIT) for (const c of cands) if (ok(id, c[0] + dx, c[1] + dz, pathR)) return put(id, c[0] + dx, c[1] + dz, c[2] || 0, data);
    return null;
  };
  const face = (x, z, tx, tz) => Math.atan2(-(tx - x), -(tz - z)); // l'avant (-z local) regarde (tx, tz)
  const pickN = (arr, n) => { const a = arr.slice(), out = []; while (a.length && out.length < n) out.push(a.splice((rnd() * a.length) | 0, 1)[0]); return out; };
  const inter = (kind, id, x, y, z, name, data) => B.inter(kind, id, x, y, z, name, data);
  const flowers = ['#e03040', '#f0d020', '#f080a8', '#9a70d0', '#f4f0ec', '#e86020'];
  w.town2 = {};

  // ================================================================ la ville
  const T = ctx.town;
  if (T && w.bld.mairie) {
    const y0 = w.heightAt(T.x, T.z), L = (lx, lz) => [T.x + lx, T.z + lz];
    const LF = (lx, lz, tx, tz) => [T.x + lx, T.z + lz, face(T.x + lx, T.z + lz, T.x + tx, T.z + tz)];
    // enseignes des boutiques (on peut les lire)
    for (const key in SHOP_SIGNS) {
      const b = w.bld[key];
      if (!b) continue;
      const [x, z] = B.toWorld(b.f, 1.5, -b.D / 2);
      B.prop('enseigne', x, b.f.y, z, b.f.r, { k: SHOP_SIGNS[key] });
      const [ix, iz] = B.toWorld(b.f, 1.5, -b.D / 2 - 0.75);
      inter('lire', 'ens_' + key, ix, b.f.y + 2.0, iz, 'Lire l’enseigne', { sign: key });
    }
    // bacs à fleurs sous les fenêtres
    for (const key in w.bld) {
      const b = w.bld[key];
      if (!b.f || key === 'eglise' || Math.max(Math.abs(b.x - T.x), Math.abs(b.z - T.z)) > 44 || rnd() < 0.2) continue;
      for (const s of [-1, 1]) {
        const lx = s * (b.W / 2 - 1.5);
        if (Math.abs(lx) < 1.4 || (s > 0 && SHOP_SIGNS[key] && Math.abs(lx - 1.5) < 0.9)) continue;
        const [x, z] = B.toWorld(b.f, lx, -b.D / 2 - 0.12);
        B.prop('bac_fleurs', x, b.f.y + 1.0, z, b.f.r, { c: flowers[(rnd() * flowers.length) | 0] });
        if (b.H > 3.2 && rnd() < 0.7) B.prop('bac_fleurs', x, b.f.y + 3.85, z, b.f.r, { c: flowers[(rnd() * flowers.length) | 0] });
      }
    }
    // panneau d'affichage de la place
    const pa = tryPut('panneau_affichage', [LF(-11.6, 4.5, 0, 4.5), LF(11.6, 1.2, 0, 1.2), LF(-11.6, -1.5, 0, -1.5), LF(4.8, 11.8, 4.8, 0), LF(-4.8, 11.8, -4.8, 0), LF(4.8, -11.8, 4.8, 0)], null, 1.1);
    if (pa) { const [ix, iz] = B.toWorld(pa, 0, -0.8); inter('affiche', 'affiche_ville', ix, y0 + 1.5, iz, 'Lire les affiches'); w.town2.board = [pa.x, pa.z]; }
    // terrasse de l'auberge : tables, chaises, parasols
    const au = w.bld.auberge;
    if (au) {
      for (const lx of [-4.1, 4.1]) {
        const tb = tryPut('table', [[...B.toWorld(au.f, lx, -au.D / 2 - 2.6), au.f.r]], null, 1.0);
        if (!tb) continue;
        for (const s of [-1, 1]) { const [cx, cz] = B.toWorld(tb, s * 1.0, 0); B.prop('chaise', cx, w.heightAt(cx, cz), cz, face(cx, cz, tb.x, tb.z)); }
        B.prop('parasol', tb.x, w.heightAt(tb.x, tb.z), tb.z, 0, { c: lx < 0 ? '#b83a30' : '#3a6a8a' });
      }
      tryPut('tonneau', [B.toWorld(au.f, au.W / 2 - 0.6, -au.D / 2 - 0.7)], null, 0.9);
      tryPut('tonneau', [B.toWorld(au.f, au.W / 2 - 1.4, -au.D / 2 - 0.6)], null, 0.9);
    }
    // un second marché, au sud de la place
    const kinds = pickN(['legumes', 'fromages', 'fleurs', 'poteries', 'tissus', 'pains', 'fruits'], 4), awn = ['#b83a30', '#3a6a8a', '#c8a040', '#5a8a4a'];
    [[7.6, 27], [-7.6, 27.5], [7.6, 33.5], [-7.6, 34]].forEach(([lx, lz], i) => { tryPut('etal_complet', [LF(lx, lz, 0, lz)], { k: kinds[i], c: awn[i] }, 1.4); });
    // monument aux morts
    const mo = tryPut('monument', [LF(-11.8, -13.8, -11.8, -20), LF(11.8, -13.8, 11.8, -20), LF(-11.5, 13.6, -11.5, 17), LF(11.5, 13.6, 11.5, 17), LF(-7, -14.5, 0, -14.5)], null, 1.3);
    if (mo) { const [ix, iz] = B.toWorld(mo, 0, -1.2); inter('lire', 'monument', ix, y0 + 1.4, iz, 'Lire les noms', { monument: true }); }
    // drapeau de la mairie, boîte aux lettres de la poste
    const ma = w.bld.mairie;
    tryPut('mat_drapeau', [[...B.toWorld(ma.f, ma.W / 2 - 0.8, -ma.D / 2 - 1.2), 0], [...B.toWorld(ma.f, -ma.W / 2 + 0.8, -ma.D / 2 - 1.2), 0]], null, 0.8);
    const po = w.bld.poste;
    if (po) tryPut('boite_poste', [[...B.toWorld(po.f, -2.4, -po.D / 2 - 0.8), po.f.r], [...B.toWorld(po.f, 2.6, -po.D / 2 - 0.8), po.f.r]], null, 0.8);
    // la forge : meule, tonneau d'eau, fers au mur, bois
    const fo = w.bld.forge;
    if (fo) {
      tryPut('meule_aiguiser', [[...B.toWorld(fo.f, 3.1, -fo.D / 2 - 1.3), fo.f.r]], null, 0.9);
      tryPut('tonneau', [[...B.toWorld(fo.f, -2.6, -fo.D / 2 - 0.8), 0]], null, 0.8);
      const [rx, rz] = B.toWorld(fo.f, -3.2, -fo.D / 2);
      B.prop('fers_rack', rx, fo.f.y, rz, fo.f.r);
      tryPut('tas_bois', [[...B.toWorld(fo.f, fo.W / 2 + 1.2, 0), fo.f.r + Math.PI / 2], [...B.toWorld(fo.f, -fo.W / 2 - 1.2, 0), fo.f.r + Math.PI / 2]], null, 0.9);
    }
    // la boulangerie : fagots et sacs de farine
    const bo = w.bld.boulangerie;
    if (bo) {
      tryPut('tas_bois', [[...B.toWorld(bo.f, -bo.W / 2 - 1.2, 1), bo.f.r + Math.PI / 2], [...B.toWorld(bo.f, bo.W / 2 + 1.2, 1), bo.f.r + Math.PI / 2]], null, 0.9);
      tryPut('sacs', [[...B.toWorld(bo.f, -2.8, -bo.D / 2 - 0.8), bo.f.r]], null, 0.9);
    }
    // la graineterie : sacs, caisses de légumes, fleurs, et l'ardoise des arrivages du jour
    const gr = w.bld.graineterie;
    if (gr) {
      tryPut('sacs', [[...B.toWorld(gr.f, -2.7, -gr.D / 2 - 0.9), gr.f.r]], null, 0.9);
      tryPut('caisses', [[...B.toWorld(gr.f, 2.9, -gr.D / 2 - 1.0), gr.f.r]], { k: 'legumes' }, 0.9);
      const pn = tryPut('panneau', [[...B.toWorld(gr.f, -1.4, -gr.D / 2 - 2.4), gr.f.r + Math.PI], [...B.toWorld(gr.f, 1.6, -gr.D / 2 - 2.6), gr.f.r + Math.PI]], null, 0.7);
      if (pn) inter('arrivages', 'arrivages', pn.x, y0 + 1.3, pn.z, 'Lire l’ardoise');
      for (const s of [-1, 1]) { const [x, z] = B.toWorld(gr.f, s * 1.1, -gr.D / 2 - 0.45); if (ok('pot_fleurs', x, z, 0)) put('pot_fleurs', x, z, 0); }
    }
    // bancs le long des rues
    let nb = 0;
    for (const zc of [-20, -3, 17]) for (const xc of [-10.5, -6.2, 6.2, 10.5]) for (const s of [-1, 1]) {
      if (nb >= 7 || rnd() < 0.45) continue;
      const lz = zc + s * 3.7;
      if (tryPut('banc', [LF(xc, lz, xc, zc)], null, 1.0)) nb++;
    }
    // près des portes : barre d'attache et abreuvoir pour les chevaux ; charrettes, caisses, tonneaux
    for (const [gx, gz] of [[6.8, -40.5], [-6.8, -40.5], [6.8, 40.5], [-6.8, 40.5]]) {
      const pt = tryPut('poteau_attache', [LF(gx, gz, 0, gz)], null, 1.2);
      if (!pt) continue;
      const [ax, az] = B.toWorld(pt, 0, 1.3);
      if (ok('abreuvoir', ax, az, 0.8)) { put('abreuvoir', ax, az, pt.r); inter('abreuvoir', 'abreuvoir' + placed.length, ax, w.heightAt(ax, az) + 0.6, az, 'Faire boire le cheval'); }
    }
    for (const [lx, lz, k] of [[-8.8, 38.5, 'foin'], [26, -23.5, 'caisses'], [-26, 22, 'tonneaux'], [8.6, -30, 'foin']]) tryPut('charrette', [LF(lx, lz, lx + 1, lz)], { k }, 1.3);
    for (const [lx, lz] of [[-12.6, 26], [12.6, 25], [-25, -22.5], [25, 23.5], [-12.8, -30]]) tryPut(rnd() < 0.5 ? 'caisses' : 'tonneau', [LF(lx, lz, 0, lz)], { k: pickN(['legumes', 'fruits', 'fromages'], 1)[0] }, 1.0);
    // arrière-cours des maisons (entre la maison et le rempart) : linge, potager, bois, poules
    let hens = 0;
    for (const key in w.bld) {
      const b = w.bld[key];
      if (!/^(maison_[a-d]|vide\d)$/.test(key)) continue;
      const back = b.D / 2;
      const [cx, cz] = B.toWorld(b.f, 0, back + 2.6);
      if (ok('corde_linge', cx, cz, 0)) put('corde_linge', cx, cz, b.f.r);
      const [gx, gz] = B.toWorld(b.f, rnd() < 0.5 ? -2.2 : 2.2, back + 5.2);
      if (ok('potager', gx, gz, 0)) put('potager', gx, gz, b.f.r, { c: VEG_SETS[(rnd() * VEG_SETS.length) | 0], k: 0.65 + rnd() * 0.35 });
      const [wx, wz] = B.toWorld(b.f, rnd() < 0.5 ? -2.8 : 2.8, back + 0.8);
      if (ok('tas_bois', wx, wz, 0)) put('tas_bois', wx, wz, b.f.r);
      if (hens < 2 && rnd() < 0.5) {
        const [hx, hz] = B.toWorld(b.f, 0, back + 4.6);
        if (ok('cage_poules', hx + 0.001, hz, 0)) { put('cage_poules', hx, hz, b.f.r); for (let k = 0; k < 3; k++) B.obj('hen', hx + (rnd() - 0.5) * 4, hz + (rnd() - 0.5) * 3); hens++; }
      }
    }
    // pigeons sur la place et devant l'église, chats
    if (OBJ_INDEX.pigeons !== undefined) for (const [lx, lz] of [[5.8, -2.5], [-2.5, 12.5], [-14, -30], [3, -26]]) B.obj('pigeons', ...L(lx, lz));
    for (const [lx, lz] of [[-9, 9.5], [14, 24], [-27, -26]]) B.obj('cat', ...L(lx, lz));
  }

  // ================================================================ le hameau
  const Hm = ctx.hamlet, rb = w.bld.ranch;
  if (Hm && rb) {
    const f = { x: Hm.x, z: Hm.z, y: w.heightAt(Hm.x, Hm.z), r: rb.f.r };
    const R = (lx, lz, rr) => { const [x, z] = B.toWorld(f, lx, lz); return [x, z, f.r + (rr || 0)]; };
    const sets = pickN(VEG_SETS.slice(0, 4), 3);
    const pg = tryPut('potager', [R(-15, -13), R(-12, -14.5), R(-17, -15)], { c: sets[0], k: 0.9 }, 0.8);
    tryPut('potager', [R(15, -13), R(12, -14.5), R(17, -15)], { c: sets[1], k: 0.8 }, 0.8);
    tryPut('potager', [R(-9, -17.5), R(9, -17.5), R(0, -19)], { c: sets[2], k: 0.7 }, 0.8);
    if (pg) { const [ex, ez] = B.toWorld(pg, 1.6, 0); B.prop('epouvantail', ex, w.heightAt(ex, ez), ez, rnd() * TAU, { v: 1 }); }
    tryPut('four_pain', [R(8, -8.5, Math.PI), R(-7, -9, Math.PI), R(9, 6, 0)], null, 1.2);
    tryPut('corde_linge', [R(-15, -9), R(15, -9), R(-10, 8, Math.PI / 2)], null, 0.8);
    for (let k = 0; k < 3; k++) tryPut('ruche', [R(22 + k * 1.3, -7), R(-22 - k * 1.3, -7), R(23, -2 + k * 1.3)], null, 0.8);
    tryPut('charrette', [R(11, 9, 0.6), R(-6, 10, -0.4), R(24, 9, 0.2)], { k: 'foin' }, 1.2);
    tryPut('cage_poules', [R(6, 9.5), R(-6.5, 8.5), R(7, -4)], null, 1.0);
    tryPut('tas_bois', [R(-8.5, 5.5), R(9.5, -3), R(-21, -2, Math.PI / 2)], null, 1.0);
    tryPut('banc', [R(-4.5, -7.5, Math.PI), R(4.5, -7.5, Math.PI), R(-5, 4.5)], null, 1.0);
    tryPut('meule', [R(28, 14), R(-28, 12), R(27, 22)], null, 1.2);
    const sg = tryPut('panneau', [R(2.8, 7.6, Math.PI), R(-2.8, 7.6, Math.PI), R(4.5, 6.5, Math.PI)], null, 0.6);
    if (sg) inter('lire', 'panneau_ranch', sg.x, w.heightAt(sg.x, sg.z) + 1.3, sg.z, 'Lire le panneau', { ranch: true });
    for (let k = 0; k < 3; k++) { const [x, z] = R(-4 + rnd() * 8, 2 + rnd() * 5); B.obj('hen', x, z); }
    { const [x, z] = R(-3, -3); B.obj('cat', x, z); }
  }

  // ================================================================ le hameau abandonné
  const G = lm.hameau_abandonne;
  if (G) {
    const ring = (r0, n, off) => Array.from({ length: n }, (_, k) => { const a = off + k / n * TAU; return [G.x + Math.cos(a) * r0, G.z + Math.sin(a) * r0, a]; });
    const sw = tryPut('balancoire', ring(8, 8, 0.4), { hante: true }, 0);
    if (sw) w.town2.swing = [sw.x, sw.z];
    tryPut('potager', ring(10, 8, 1.1), { c: ['mort'], k: 0.5 }, 0);
    tryPut('corde_linge', ring(7.5, 8, 2.3), null, 0);
    tryPut('tas_bois', ring(11, 8, 0.2), null, 0);
    tryPut('charrette', ring(12, 8, 1.7), { k: 'caisses' }, 0);
  }

  // ================================================================ la cabane du pêcheur
  const fb = w.bld.cabane_pecheur;
  if (fb) {
    const f = fb.f, R = (lx, lz, rr) => [...B.toWorld(f, lx, lz), f.r + (rr || 0)];
    tryPut('filet', [R(-4.6, -0.5), R(-4.6, 1.5), R(4.8, 2.2)], null, 0.5);
    tryPut('sechoir', [R(4.6, 2.2), R(4.8, 0.2), R(-4.8, 2.5)], null, 0.5);
    for (let k = 0; k < 3; k++) tryPut('nasse', [R(-2.6 + k * 0.75, -3.6), R(-3.5, -2.6 + k * 0.75), R(3.5, -2.6 + k * 0.75)], null, 0.3);
    tryPut('caisses', [R(3.2, -3.4), R(3.6, -2.2)], { k: 'poissons' }, 0.6);
    tryPut('tonneau', [R(-3.4, -3.2), R(-3.8, -1.8)], null, 0.5);
  }

  // ================================================================ la mine
  const ms = ctx.mineSite;
  if (ms && lm.mine) {
    const f = { x: ms.x, z: ms.z, y: ms.y, r: ms.dir }, R = (lx, lz, rr) => [...B.toWorld(f, lx, lz), f.r + (rr || 0)];
    for (const lz of [1.5, -1.5, -4.5]) { const [x, z, r] = R(0, lz); B.prop('rails', x, w.heightAt(x, z), z, r); }
    const [wx, wz, wr] = R(0, -4.3);
    B.prop('wagonnet', wx, w.heightAt(wx, wz) + 0.07, wz, wr, { ore: '#c8743a' }); placed.push([wx, wz, 0.9]);
    tryPut('treuil', [R(-4.6, -6.5), R(4.6, -6.5), R(-5, -9)], null, 0.5);
    tryPut('tas_bois', [R(4.8, -7.5, Math.PI / 2), R(-4.8, -10, Math.PI / 2), R(5, -11)], null, 0.5);
    tryPut('caisses', [R(-4.2, -3.5), R(4.2, -3.5), R(-4.8, -12)], { k: 'minerai' }, 0.5);
    tryPut('charrette', [R(6.5, -13, 0.4), R(-6.5, -13, -0.4)], { k: 'caisses' }, 0.8);
  }
  relinkNav(w, placed.filter((q) => q[3]));
}
// Après la pose : les liaisons de navigation que ces objets coupent sont retirées (le maillage des rues est dense)
function relinkNav(w, solid) {
  if (!solid.length) return;
  w.grid = null;
  const N = w.nav, nodes = N.nodes;
  const segNear = (A, C, q) => { const dx = C.x - A.x, dz = C.z - A.z, L2 = dx * dx + dz * dz || 1, t = clamp(((q[0] - A.x) * dx + (q[1] - A.z) * dz) / L2, 0, 1); return Math.hypot(q[0] - (A.x + dx * t), q[1] - (A.z + dz * t)) < q[2] + 1.2; };
  N.edges = N.edges.filter(([a, b, flag]) => {
    const A = nodes[a], C = nodes[b];
    if (flag || !solid.some((q) => segNear(A, C, q))) return true;
    return segClear(w, A.x, A.z, C.x, C.z);
  });
  N.adj = nodes.map(() => []);
  for (const [a, b, flag] of N.edges) { const d = Math.hypot(nodes[a].x - nodes[b].x, nodes[a].z - nodes[b].z); N.adj[a].push({ to: b, d, flag }); N.adj[b].push({ to: a, d, flag }); }
  const start = nodes.findIndex((n) => n.tag === 'place');
  if (start >= 0) {
    const seen = new Set([start]), q = [start];
    while (q.length) { const c = q.shift(); for (const e of N.adj[c]) if (!seen.has(e.to)) { seen.add(e.to); q.push(e.to); } }
    nodes.forEach((n, i) => { n.iso = !seen.has(i); });
  }
}
