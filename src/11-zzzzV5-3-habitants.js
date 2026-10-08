// ============================================================================
//  BASSE-FOSSE (agent V5) — les gens d'en bas
//  Vingt-quatre habitants, menés ici (pas par npcs, qui dort dans la Zone) :
//  le Greffier (qui tient le registre ; c'est A., qui a oublié son nom), la
//  Sonneuse, la Marchande, la Veilleuse des feux, l'Ordonnateur de l'ossuaire,
//  quatre gardiens (une pique à croc), des hommes, des femmes, des enfants.
//  - Leurs heures : ils dorment de 21 h à 5 h ; aux offices (6 h, 12 h, et le
//    compte, de 18 h à 19 h) ils vont au temple ; entre, chacun son ouvrage
//    (le marché, l'ossuaire, le seuil de sa maison, la ronde des feux, les rondes
//    des gardiens, la porte). Le Greffier est seul dans le greffe de 14 h à 17 h.
//  - Ce qu'ils voient et entendent : furtif (V1) — ils vivent sans lumière : de
//    près seulement, mais ils entendent bien, et une lanterne se voit de loin.
//  - Un étranger (pas compté) vu : un cri, le tocsin, les gardiens viennent ;
//    les autres rentrent chez eux. Compté : on vous laisse passer, tant qu'on ne
//    vous voit pas enfreindre la loi (un feu qui n'est pas le leur, courir,
//    prendre ce qui est posé, frapper). Le linceul en main : on vous prend pour
//    un mort qu'on porte, on s'écarte.
//  - Les gardiens frappent (une pique à croc) ; on leur échappe en rompant la vue
//    et en se cachant dans le noir ; ils ne passent pas la porte de la ville.
//  - On leur parle (E) : le Greffier, la Marchande (le troc), les enfants, et les
//    autres quand on est compté.
//  État : farm.s.v5 (compte, colere, morts, parle, nom, troc…).
// ============================================================================
const V5_LOOKS = {
  pale: ['#c8c2b4', '#cfc9bc', '#bdb7aa', '#d4cfc3'],
  habits: ['#3a3834', '#34322f', '#423f3a', '#2e2c29', '#4a4640'],
  cheveux: ['#d8d4cc', '#9a968e', '#5a5650', '#2a2622', '#c8c2b6'],
};
const V5_ROLES = [
  { role: 'greffier', nom: 'Le Greffier', look: { old: true, beard: 'longue', hairStyle: 'chauve', coat: true, held: 'livre', build: 'mince', face: 190 + 1, hair: '#e4e0d8', top: '#2a2826', bottom: '#22201e' } },
  { role: 'sonneuse', nom: 'La Sonneuse', look: { old: true, dress: true, hat: 'voile', hatCol: '#2e2c2a', face: 191, top: '#3a3834', bottom: '#33312e' } },
  { role: 'marchande', nom: 'La Marchande', look: { dress: true, hairStyle: 'chignon', apron: '#6a6458', face: 190, build: 'rond', top: '#4a4640', bottom: '#3a3834' } },
  { role: 'veilleuse', nom: 'La Veilleuse', look: { dress: true, hat: 'voile', hatCol: '#d8d4ca', held: 'lanterne', face: 190, build: 'mince', top: '#d8d4ca', bottom: '#a8a49a' } },
  { role: 'ordonnateur', nom: 'L’Ordonnateur', look: { hat: 'capuche', hatCol: '#5a554c', apron: '#8a8478', face: 190, build: 'rond', top: '#4a453e', bottom: '#3a362f' } },
  { role: 'gardien', nom: 'Un gardien', look: { hat: 'capuche', hatCol: '#1e1c1a', coat: true, held: 'hallebarde', face: 190, top: '#24221f', bottom: '#1e1c1a' } },
  { role: 'gardien', nom: 'Un gardien', look: { hat: 'capuche', hatCol: '#1e1c1a', coat: true, held: 'hallebarde', face: 190, beard: 'courte', top: '#24221f', bottom: '#1e1c1a' } },
  { role: 'gardien', nom: 'Un gardien', look: { hat: 'capuche', hatCol: '#1e1c1a', coat: true, held: 'hallebarde', face: 190, build: 'rond', top: '#24221f', bottom: '#1e1c1a' } },
  { role: 'gardien', nom: 'Un gardien', look: { hat: 'capuche', hatCol: '#1e1c1a', coat: true, held: 'hallebarde', face: 190, top: '#24221f', bottom: '#1e1c1a' } },
];
const V5_GENS = 12, V5_ENFANTS = 3;
const habitantsV5 = {
  L: [], cle: null, actif: false, officeCourant: null, alarmeT: -1e9, tocsinT: -1e9,

  S() { return catacombesV5.S(); },
  Z() { return catacombesV5.Z(); },
  liste() { return this.L.filter((e) => !e.parti); },
  // le compte : il ne change pas (les morts restent comptés) ; le joueur compté en est un de plus, et une vieille de moins debout
  compte() { return 412; },
  etranger() { const S = this.S(); return !S.compte || (S.colere && S.colere >= farm.s.day) || false; },
  greffierVivant() { const S = this.S(); return !S.morts.greffier && S.fin !== 'compte'; },

  // ------------------------------------------------------------- les gens : créés une fois par Zone générée
  creer() {
    const v = this.Z();
    if (!v || this.cle === v) return;
    this.cle = v;
    this.L = [];
    const S = this.S(), rnd = mulberry32((zone.Z.seed ^ 0x5B0E0005) >>> 0);
    const pick = (a) => a[Math.floor(rnd() * a.length)];
    const maisons = v.maisons.filter((M) => M.relie && !M.ossuaire);
    // les maisons habitées : les plus proches de la Nef d'abord (la ville s'est resserrée autour du feu)
    const parDist = maisons.slice().sort((a, b) => Math.hypot(a.x - v.site.x, a.z - v.site.z) - Math.hypot(b.x - v.site.x, b.z - v.site.z));
    const prises = new Set();
    const prendre = (filtre) => { const M = parDist.find((m) => !prises.has(m.id) && !m.lettre && (!filtre || filtre(m))); if (M) prises.add(M.id); return M || null; };
    const marche = v.marche, porte = v.porte;
    const proche = (x, z) => (m) => Math.hypot(m.x - x, m.z - z) < 70;
    const gens = [];
    for (const R of V5_ROLES) gens.push(Object.assign({}, R));
    for (let k = 0; k < V5_GENS; k++) {
      const fem = k % 2 === 1, vieux = k % 5 === 4;
      const look = fem ? { dress: true, hat: rnd() < 0.6 ? 'voile' : null, hairStyle: rnd() < 0.5 ? 'long' : 'chignon', hatCol: pick(V5_LOOKS.habits), face: vieux ? 191 : 190 } : { hat: rnd() < 0.5 ? 'capuche' : null, hatCol: pick(V5_LOOKS.habits), hairStyle: rnd() < 0.3 ? 'chauve' : 'court', beard: rnd() < 0.35 ? 'courte' : null, coat: rnd() < 0.4, face: vieux ? 191 : 190 };
      if (vieux) look.old = true;
      gens.push({ role: 'habitant', nom: fem ? (vieux ? 'Une vieille d’en bas' : 'Une femme d’en bas') : (vieux ? 'Un vieux d’en bas' : 'Un homme d’en bas'), look, vieille: fem && vieux });
    }
    for (let k = 0; k < V5_ENFANTS; k++) gens.push({ role: 'enfant', nom: 'Un enfant', look: { height: 0.72, hairStyle: k % 2 ? 'long' : 'court', dress: k % 2 === 1, face: 190 } });
    gens.forEach((G, k) => {
      const look = Object.assign({ skin: pick(V5_LOOKS.pale), hair: pick(V5_LOOKS.cheveux), top: pick(V5_LOOKS.habits), bottom: pick(V5_LOOKS.habits), shoe: '#1a1816' }, G.look);
      let M = null;
      if (G.role === 'marchande') M = prendre(proche(marche.place[0], marche.place[1]));
      else if (G.role === 'gardien') M = prendre(proche(porte.dedans[0], porte.dedans[1])) || prendre();
      else if (G.role !== 'greffier') M = prendre();
      const id = G.role === 'greffier' ? 'greffier' : G.role + '_' + k;
      const e = { id, k, role: G.role, nom: G.nom, look, maison: M, rig: null, x: 0, y: v.F, z: 0, heading: rnd() * TAU, phase: rnd() * 10, t: rnd() * 10,
        hp: G.role === 'gardien' ? 80 : 40, chemin: null, ci: 0, but: null, pose: 'debout', vitesse: 0, regard: 0, parti: false, mort: !!S.morts[id], dort: false,
        vieille: !!G.vieille, decale: rnd() * 0.6, ronde: null, rondeI: 0, attT: 0, criT: 0, fuiteT: 0, idleT: rnd() * 4, coucheEnRue: false };
      e.furtif = null;
      this.L.push(e);
    });
    // les rondes des gardiens : l'anneau de l'enceinte, la Grande-Rue et la Nef, deux boucles dans les quartiers ; la porte
    const N = v.noeuds, gard = this.L.filter((e) => e.role === 'gardien');
    const anneau = N.filter((q) => q.tag === 'enceinte' && q.relie).map((q) => q.i);
    const pas = Math.max(1, Math.floor(anneau.length / 8));
    const rondeAnneau = anneau.filter((_, i) => i % pas === 0);
    const rues = N.filter((q) => q.tag === '' && q.relie);
    const pres = (lx, lz) => rues.slice().sort((a, b) => Math.hypot(a.lx - lx, a.lz - lz) - Math.hypot(b.lx - lx, b.lz - lz))[0];
    const boucle = (pts) => pts.map(([a, b]) => pres(a, b)).filter(Boolean).map((q) => q.i);
    if (gard[0]) gard[0].poste = v.porte.noeud;
    if (gard[1]) gard[1].ronde = rondeAnneau;
    if (gard[2]) gard[2].ronde = boucle([[0, 140], [0, 100], [0, 70], [34, 66], [34, 33], [68, 33], [68, 99], [34, 99]]);
    if (gard[3]) gard[3].ronde = boucle([[0, -66], [-34, -66], [-68, -33], [-68, 33], [-34, 66], [34, -33], [68, -66], [34, -99]]);
    // les fins : partis, ou couchés
    for (const e of this.L) { if (S.fin === 'remontee') e.parti = true; if (S.fin === 'extinction') e.couche = true; }
    if (S.fin === 'compte') { const g = this.L.find((e) => e.role === 'greffier'); if (g) g.mort = true; }
    if (S.vieilleMorte) { const vieille = this.L.find((e) => e.vieille); if (vieille) vieille.mort = true; }
    // les maisons habitées : une chandelle allumée (sauf après les fins qui vident ou éteignent la ville)
    if (S.fin !== 'extinction' && S.fin !== 'remontee') {
      for (const e of this.L) if (e.maison && e.maison.chandelle && !e.mort) e.maison.chandelle.data = Object.assign({}, e.maison.chandelle.data, { lit: true });
      try { zone.Z.collectLights(); } catch (err) { console.error(err); }
      farm.dirtyProps = true;
    }
    this.snapTout();
  },
  rig(e) { return e.rig || (e.rig = humanRig(e.look)); },

  // ------------------------------------------------------------- le graphe : A*, le nœud le plus proche
  noeud(i) { return this.Z().noeuds[i]; },
  proche(x, z, filtre) {
    const N = this.Z().noeuds;
    let best = -1, bd = 1e9;
    for (const q of N) { if (!q.relie || (filtre && !filtre(q))) continue; const d = (q.x - x) * (q.x - x) + (q.z - z) * (q.z - z); if (d < bd) { bd = d; best = q.i; } }
    return best;
  },
  astar(a, b) {
    const N = this.Z().noeuds;
    if (a === b) return [a];
    const g = new Map([[a, 0]]), from = new Map(), ouvert = [[Math.hypot(N[a].x - N[b].x, N[a].z - N[b].z), a]], ferme = new Set();
    let n = 0;
    while (ouvert.length && n++ < 4000) {
      let bi = 0; for (let i = 1; i < ouvert.length; i++) if (ouvert[i][0] < ouvert[bi][0]) bi = i;
      const [, c] = ouvert.splice(bi, 1)[0];
      if (c === b) { const out = [b]; let q = b; while (from.has(q)) { q = from.get(q); out.push(q); } return out.reverse(); }
      if (ferme.has(c)) continue;
      ferme.add(c);
      for (const j of N[c].v) {
        if (ferme.has(j)) continue;
        const d = g.get(c) + Math.hypot(N[c].x - N[j].x, N[c].z - N[j].z);
        if (d < (g.has(j) ? g.get(j) : 1e18)) { g.set(j, d); from.set(j, c); ouvert.push([d + Math.hypot(N[j].x - N[b].x, N[j].z - N[b].z), j]); }
      }
    }
    return null;
  },

  // ------------------------------------------------------------- l'emploi du temps : où doit-on être, et pour quoi faire
  // rend { n: nœud cible, pose, regard (cap à prendre une fois là), spot: [x, y, z] (facultatif, au-delà du nœud) }
  but(e, h) {
    const v = this.Z(), T = v.temple, M = e.maison, S = this.S();
    const office = this.officeCourant && this.officeCourant.fin > this.heureAbs() ? this.officeCourant : null;
    const lit = () => (M ? { n: M.noeuds.dedans, pose: 'couche', spot: [M.lit[0], v.F + 0.56, M.lit[1]], regard: M.f.r } : { n: T.noeuds.greffeLit, pose: 'couche', spot: [v.greffe.lit[0], v.F + 0.54 + 0.56, v.greffe.lit[1]], regard: v.CF.r });
    const seuil = () => (M ? { n: M.noeuds.dehors, pose: 'debout', regard: M.f.r } : { n: T.noeuds.greffe, pose: 'ecrit', regard: v.CF.r - Math.PI / 2 });
    const auTemple = () => { const k = (e.k * 5 + 3) % (T.places.length + 6); if (k < T.places.length) return { n: T.places[k], pose: 'prie', regard: v.CF.r + Math.PI }; return { n: T.noeuds.porte, pose: 'prie', regard: v.CF.r + Math.PI, spot: this.devant(T.noeuds.porte, k) }; };
    const dort = h >= 21 + e.decale || h < 5 - e.decale;
    switch (e.role) {
      case 'greffier':
        if (dort) return lit();
        if (office || (h >= 17.5 && h < 19)) return { n: T.noeuds.registre, pose: 'ecrit', regard: v.CF.r + Math.PI * 0.85 };
        if (h >= 14 && h < 17.5) return { n: T.noeuds.greffe, pose: 'ecrit', regard: v.CF.r + Math.PI * 0.5 };
        return { n: T.noeuds.registre, pose: 'ecrit', regard: v.CF.r + Math.PI * 0.85 };
      case 'gardien':
        if (e.poste !== undefined) { if (h >= 2 && h < 4) return { n: e.poste, pose: 'dort_debout', regard: v.CF.r + Math.PI }; return { n: e.poste, pose: 'garde', regard: v.CF.r + Math.PI }; }
        if (dort && e.k % 2 === 1) return lit();
        if (office && e.k % 2 === 0) return auTemple();
        return { ronde: true };
      case 'veilleuse':
        if (office && office.O.h === 18) return auTemple();
        return { feux: true };
      case 'marchande':
        if (dort) return lit();
        if (office) return auTemple();
        if (h >= 8 && h < 17.5) return { n: v.marche.noeud, pose: 'debout', regard: v.CF.r + Math.PI / 2 };
        return seuil();
      case 'ordonnateur':
        if (dort) return lit();
        if (office) return auTemple();
        if (h >= 7 && h < 17.5 && v.ossuaire) { const O = v.maisons.find((q) => q.id === v.ossuaire.maison); return { n: O.noeuds.dedans, pose: 'travaille', regard: O.f.r + Math.PI }; }
        return seuil();
      case 'enfant':
        if (h >= 20 || h < 6.5) return lit();
        if (office) return auTemple();
        if (h >= 8 && h < 17) return { n: v.puits.noeud, pose: 'debout', spot: this.devant(v.puits.noeud, e.k + 2), regard: e.k };
        return seuil();
      default:
        if (dort) return lit();
        if (office) return auTemple();
        // la journée : au seuil, au marché, à l'ossuaire (porter un mort), au seuil encore
        { const tranche = Math.floor((h + e.decale * 3 + e.k) / 2.5) % 5;
          if (tranche === 1 && h >= 8 && h < 17) return { n: v.marche.noeud, pose: 'debout', spot: this.devant(v.marche.noeud, e.k), regard: v.CF.r - Math.PI / 2 };
          if (tranche === 3 && v.ossuaire) { const O = v.maisons.find((q) => q.id === v.ossuaire.maison); return { n: O.noeuds.dehors, pose: 'prie', regard: O.f.r + Math.PI, spot: this.devant(O.noeuds.dehors, e.k) }; }
          if (tranche === 4 && M) return { n: M.noeuds.dedans, pose: 'travaille', regard: M.f.r + Math.PI };
          return seuil(); }
    }
  },
  heureAbs() { return farm.s ? farm.s.day * 24 + catacombesV5.heure() : 0; },
  // un point devant un nœud (k : rang, pour ne pas s'empiler)
  devant(i, k) { const q = this.noeud(i), a = (k * 2.39996) % TAU, r = 1.1 + (k % 3) * 0.7; return [q.x + Math.cos(a) * r, q.y, q.z + Math.sin(a) * r]; },
  office(O) {
    if (O.h === 21) return; // complies : la cloche seulement
    const dur = O.h === 18 ? 1.0 : O.h === 6 ? 0.5 : 0.35;
    this.officeCourant = { O, debut: this.heureAbs(), fin: this.heureAbs() + dur };
    for (const e of this.L) e.replan = true;
  },

  // ------------------------------------------------------------- placer chacun à sa place de l'heure (à l'arrivée sous terre, au chargement)
  snapTout() {
    const v = this.Z();
    if (!v) return;
    const h = catacombesV5.heure();
    for (const e of this.L) {
      if (e.parti) continue;
      const B = this.butPour(e, h);
      let q = null;
      if (B.n !== undefined) q = this.noeud(B.n);
      else if (B.ronde && e.ronde && e.ronde.length) { e.rondeI = Math.floor(Math.random() * e.ronde.length); q = this.noeud(e.ronde[e.rondeI]); }
      else if (B.feux) { const f = v.feux[Math.floor(Math.random() * v.feux.length)]; q = this.noeud(this.proche(f.x, f.z)); }
      if (!q) q = this.noeud(v.temple.noeuds.porte);
      const sp = B.spot || [q.x, q.y, q.z];
      e.x = sp[0]; e.y = sp[1]; e.z = sp[2];
      e.chemin = null; e.but = B; e.arrive = true; e.pose = B.pose || 'debout';
      if (B.regard !== undefined) e.heading = B.regard;
      if (e.couche || e.mort) { this.placerCouche(e); }
    }
  },
  butPour(e, h) { try { return this.but(e, h) || { n: this.Z().temple.noeuds.porte }; } catch (err) { console.error(err); return { n: this.Z().temple.noeuds.porte }; } },
  // les morts, les couchés (la fin du feu) : dans leur lit, ou là où ils étaient
  placerCouche(e) {
    const v = this.Z(), M = e.maison;
    if (e.role === 'greffier') { e.x = v.greffe.lit[0]; e.z = v.greffe.lit[1]; e.y = v.F + 0.54 + 0.56; e.heading = v.CF.r; }
    else if (M && !e.coucheEnRue) { e.x = M.lit[0]; e.z = M.lit[1]; e.y = v.F + 0.56; e.heading = M.f.r; }
    e.pose = 'couche'; e.chemin = null; e.arrive = true;
  },

  // ------------------------------------------------------------- chaque image (dans la Zone)
  update(dt) {
    const v = this.Z();
    if (!v || !farm.s) return;
    this.creer();
    const p = game.player, actif = catacombesV5.dedans(p.pos) && (catacombesV5.enVille(p.pos) || catacombesV5.auDegre(p.pos));
    if (actif && !this.actif) this.snapTout();
    this.actif = actif;
    if (!actif) { this.fin(); return; }
    const S = this.S(), h = catacombesV5.heure(), etranger = this.etranger();
    { const hA = this.heureAbs(), O = this.officeCourant; if (O && (O.fin <= hA || hA < O.debut - 0.2)) { this.officeCourant = null; for (const e of this.L) e.replan = true; } }
    // les lois, pour qui est compté : courir, un feu étranger (vus de près)
    this.loiT = (this.loiT || 0) - dt;
    if (this.loiT <= 0) {
      this.loiT = 0.5;
      if (!etranger && S.fin !== 'compte') {
        if (p.sprinting && Math.hypot(p.vel[0], p.vel[2]) > 5) this.loi('court', p.pos);
        if (game.lantern && farm.count('lanterne') && !S.flamme) this.loi('feu', p.pos);
      }
    }
    const linceul = farm.s.hand === 'v5_linceul';
    for (const e of this.L) {
      if (e.parti) continue;
      e.t += dt;
      if (e.mort || e.couche) continue;
      const d = Math.hypot(e.x - p.pos[0], e.z - p.pos[2]);
      // la perception (près du joueur seulement)
      if (d < 46 && S.fin !== 'compte') this.percevoir(e, dt, d, etranger, linceul);
      else if (e.mode !== 'chasse' && e.mode !== 'cherche') {
        // loin du joueur : on oublie ce qui inquiétait
        if (e.furtif && e.furtif.etat !== 'tranquille') { e.furtif.etat = 'tranquille'; e.furtif.soupcon = 0; }
        if (e.mode === 'intrigue') { e.mode = null; e.replan = true; }
      }
      this.agir(e, dt, h, d);
    }
    // on ne passe pas à travers eux
    for (const e of this.L) {
      if (e.parti || e.pose === 'couche') continue;
      const dx = p.pos[0] - e.x, dz = p.pos[2] - e.z, dd = Math.hypot(dx, dz);
      if (dd < 0.55 && dd > 1e-4 && Math.abs(p.pos[1] - e.y) < 1.6) { const k = 0.55 / dd; p.pos[0] = e.x + dx * k; p.pos[2] = e.z + dz * k; }
    }
  },
  // en quittant le dessous : ceux qui chassaient retournent à leur poste
  fin() {
    for (const e of this.L) if (e.mode === 'chasse' || e.mode === 'cherche' || e.mode === 'fuit') { e.mode = null; e.replan = true; if (e.furtif) { e.furtif.etat = 'tranquille'; e.furtif.soupcon = 0; } }
  },

  // ------------------------------------------------------------- voir, entendre (furtif)
  reglages(e) {
    if (e.role === 'gardien') return { vue: 14, cone: 140, nuit: 1, ouie: 1.5, hauteur: 1.6, vitesse: 1.15, oubli: 0.2, memoire: 20, lumiere: 1 };
    if (e.role === 'greffier') return { vue: 3.5, cone: 100, nuit: 1, ouie: 0.8, hauteur: 1.5, vitesse: 0.6, oubli: 0.4, memoire: 6, lumiere: 0.4 };
    if (e.role === 'enfant') return { vue: 12, cone: 150, nuit: 1, ouie: 1.4, hauteur: 1.1, vitesse: 1.1, oubli: 0.35, memoire: 8, lumiere: 1 };
    return { vue: 10, cone: 130, nuit: 1, ouie: 1.25, hauteur: 1.55, vitesse: 0.9, oubli: 0.3, memoire: 10, lumiere: 1 };
  },
  percevoir(e, dt, d, etranger, linceul) {
    if (!e.furtif) furtif.guetteur(e, this.reglages(e));
    const F = e.furtif, R = this.reglages(e);
    // les dormeurs : yeux fermés, l'oreille moins fine ; le linceul : on ne vous regarde pas
    F.aveugle = e.pose === 'couche' || e.pose === 'dort_debout';
    F.ouie = R.ouie * (F.aveugle ? 0.45 : 1);
    F.vue = R.vue * (linceul ? 0.35 : 1);
    const avant = F.etat;
    // pour qui est compté (et pas en colère), on ne s'inquiète pas : on regarde seulement
    if (!etranger && e.mode !== 'chasse' && e.mode !== 'cherche') {
      F.etat = 'tranquille'; F.soupcon = 0;
      if (d < 3.5 && furtif.voit(e) > 0.2) e.regardJoueur = 1.5;
      return;
    }
    const etat = furtif.percevoir(e, dt);
    if (etat === avant) return;
    if (etat === 'alertee') {
      // le Greffier ne voit plus guère, et il attend qu'on vienne à lui : il ne crie pas, il appelle (« Approche. »)
      if (e.role === 'greffier') { e.regardJoueur = 3; F.etat = 'intriguee'; F.soupcon = Math.min(F.soupcon, 0.9); return; }
      if (e.role === 'enfant') { e.regardJoueur = 3; if (Math.random() < 0.5) this.dire(e, pick(V5_TEXTES.enfant), 3); return; }
      if (linceul && !game.player.sprinting && !(game.lantern && !this.S().flamme)) { e.regardJoueur = 2; return; }
      this.alarme(e, 'vu');
    } else if (etat === 'intriguee') {
      e.mode = e.mode === 'chasse' ? e.mode : 'intrigue';
      if (e.dort) e.dort = false;
    } else if (etat === 'cherche' && e.role === 'gardien') {
      e.mode = 'cherche'; e.chemin = null;
      if (game.time - e.criT > 8) { e.criT = game.time; this.dire(e, pick(V5_TEXTES.gardien), 2.5); }
    } else if (etat === 'abandonne' || etat === 'tranquille') {
      if (e.mode === 'chasse' || e.mode === 'cherche' || e.mode === 'intrigue') {
        if (e.role === 'gardien' && game.time - e.criT > 6 && e.mode !== 'intrigue') { e.criT = game.time; this.dire(e, pick(V5_TEXTES.gardienPerdu), 2.5); }
        e.mode = null; e.replan = true;
      }
    }
  },
  // la loi : quelqu'un vous a-t-il vu faire ? (type : vol, court, feu, coup, bruit)
  loi(type, pos) {
    if (!this.actif) return false;
    const S = this.S();
    if (S.fin === 'compte' && type !== 'coup') return false;
    let temoin = null, bd = 1e9;
    for (const e of this.L) {
      if (e.parti || e.mort || e.couche || e.role === 'enfant') continue;
      const d = Math.hypot(e.x - pos[0], e.z - pos[2]);
      if (d > 22) continue;
      if (!e.furtif) furtif.guetteur(e, this.reglages(e));
      const vu = type === 'bruit' ? furtif.entend(e) : furtif.voit(e);
      if (vu > 0.12 && d < bd) { bd = d; temoin = e; }
    }
    if (!temoin) return false;
    if (type === 'vol' || type === 'coup') { S.colere = Math.max(S.colere || 0, farm.s.day + (type === 'coup' ? 3 : 1)); }
    this.alarme(temoin, type);
    return true;
  },
  // l'alarme : un cri, le tocsin, les gardiens viennent, les autres rentrent
  alarme(e, raison) {
    const v = this.Z(), p = game.player.pos, S = this.S();
    if (game.time - this.alarmeT < 1.5) return;
    this.alarmeT = game.time;
    S.alarmes = (S.alarmes || 0) + 1;
    const txt = raison === 'vu' ? pick(V5_TEXTES.cris) : V5_TEXTES.crisLoi[raison] || pick(V5_TEXTES.cris);
    this.dire(e, txt, 3);
    sonV5.cri([e.x, e.y + 1.5, e.z], e.role === 'enfant' || /La |Une /.test(e.nom));
    furtif.alerter(p[0], p[2], 40, 1.2, e);
    if (game.time - this.tocsinT > 40) { this.tocsinT = game.time; setTimeout(() => sonV5.tocsin([v.temple.clocher[0], v.F + v.voute.nef - 3, v.temple.clocher[1]], 10), 1500); }
    for (const g of this.L) {
      if (g.parti || g.mort || g.couche) continue;
      const d = Math.hypot(g.x - p[0], g.z - p[2]);
      if (g.role === 'gardien' && d < 140) {
        if (!g.furtif) furtif.guetteur(g, this.reglages(g));
        const F = g.furtif;
        F.soupcon = 2; F.dernier = { x: p[0], y: p[1], z: p[2], t: game.time, vu: true };
        if (F.etat !== 'alertee') furtif.changer(g, d < 30 ? 'alertee' : 'cherche');
        g.mode = d < 30 ? 'chasse' : 'cherche'; g.chemin = null; g.pose = 'debout';
      } else if (g.role !== 'gardien' && g.role !== 'greffier' && d < 30 && g.maison) { g.mode = 'fuit'; g.fuiteT = 75; g.chemin = null; }
    }
  },
  dire(e, txt, dur) { if (Math.hypot(e.x - game.player.pos[0], e.z - game.player.pos[2]) < 30) ui.subtitle(e.nom, txt, dur || 3); },

  // ------------------------------------------------------------- agir : marcher, poursuivre, faire son ouvrage
  agir(e, dt, h, d) {
    const v = this.Z(), p = game.player;
    // les gardiens qui poursuivent
    if (e.role === 'gardien' && (e.mode === 'chasse' || e.mode === 'cherche')) return this.poursuivre(e, dt, d);
    if (e.mode === 'fuit') {
      e.fuiteT -= dt;
      if (e.fuiteT <= 0) { e.mode = null; e.replan = true; }
      else if (!e.chemin || e.butFuite !== true) { e.butFuite = true; this.allerVers(e, { n: e.maison.noeuds.dedans, pose: 'debout', regard: e.maison.f.r }); }
      return this.marcher(e, dt, 1.7);
    }
    if (e.mode === 'intrigue') {
      // il s'arrête et regarde vers ce qu'il a entendu
      const F = e.furtif;
      if (F && F.dernier) e.heading = turnToward(e.heading, Math.atan2(F.dernier.x - e.x, F.dernier.z - e.z), dt * 2.5);
      e.vitesse = 0;
      return;
    }
    // l'emploi du temps
    e.idleT -= dt;
    if (e.replan || e.idleT <= 0 || !e.but) {
      e.idleT = 6 + Math.random() * 6;
      const B = this.butPour(e, h);
      const change = e.replan || !e.but || JSON.stringify([B.n, B.ronde, B.feux, B.pose]) !== JSON.stringify([e.but.n, e.but.ronde, e.but.feux, e.but.pose]);
      e.replan = false;
      if (change) {
        if (B.ronde) { e.but = B; this.rondeSuivante(e); }
        else if (B.feux) { e.but = B; this.feuSuivant(e); }
        else this.allerVers(e, B);
      }
    }
    if (e.chemin) return this.marcher(e, dt, e.role === 'gardien' ? 1.25 : e.look.old ? 0.75 : e.role === 'enfant' ? 0.95 : 1.0);
    // arrivé : la pose ; les rondes repartent ; la veilleuse s'arrête à chaque feu
    e.vitesse = 0;
    if (e.but && e.but.ronde) { e.pause = (e.pause || 0) - dt; if (e.pause <= 0) this.rondeSuivante(e); return; }
    if (e.but && e.but.feux) { e.pose = 'travaille'; e.pause = (e.pause || 0) - dt; if (e.pause <= 0) { e.pose = 'debout'; this.feuSuivant(e); } return; }
    if (e.but && e.but.regard !== undefined && !e.regardJoueur) e.heading = turnToward(e.heading, e.but.regard, dt * 2);
    e.pose = e.but ? e.but.pose || 'debout' : 'debout';
    if (e.pose === 'couche' && e.but && e.but.spot) { e.x = e.but.spot[0]; e.y = e.but.spot[1]; e.z = e.but.spot[2]; e.heading = e.but.regard || 0; }
    // un mot, de temps en temps, quand on passe près (compté)
    if (e.regardJoueur > 0) { e.regardJoueur -= dt; e.heading = turnToward(e.heading, Math.atan2(p.pos[0] - e.x, p.pos[2] - e.z), dt * 3); }
    void v; void d;
  },
  allerVers(e, B) {
    e.but = B; e.arrive = false;
    const a = this.proche(e.x, e.z, (q) => Math.abs(q.y - e.y) < 3);
    if (a < 0 || B.n === undefined) { e.chemin = null; return; }
    const ch = this.astar(a, B.n);
    e.chemin = ch && ch.length ? ch : null; e.ci = 0;
    if (e.chemin && B.spot) e.chemin.push(-1); // le dernier pas : jusqu'au point (lit, place)
    if (e.pose === 'couche') { e.pose = 'debout'; if (e.maison) { e.x = e.maison.porte.dedans[0]; e.z = e.maison.porte.dedans[1]; e.y = this.Z().F; } }
  },
  rondeSuivante(e) {
    if (!e.ronde || !e.ronde.length) { e.but = { n: this.Z().porte.noeud, pose: 'garde' }; return; }
    e.rondeI = (e.rondeI + 1) % e.ronde.length;
    const B = { ronde: true, n: e.ronde[e.rondeI], pose: 'garde' };
    const a = this.proche(e.x, e.z);
    const ch = this.astar(a, B.n);
    e.chemin = ch && ch.length ? ch : null; e.ci = 0; e.pause = 2 + Math.random() * 3;
    e.but = B;
  },
  feuSuivant(e) {
    const v = this.Z();
    e.feuI = ((e.feuI === undefined ? Math.floor(Math.random() * v.feux.length) : e.feuI) + 1) % v.feux.length;
    const f = v.feux[e.feuI], n = this.proche(f.x, f.z);
    const a = this.proche(e.x, e.z);
    const ch = this.astar(a, n);
    e.chemin = ch && ch.length ? ch : null; e.ci = 0; e.pause = 6 + Math.random() * 5;
    e.but = { feux: true, n, regard: Math.atan2(f.x - this.noeud(n).x, f.z - this.noeud(n).z) };
  },
  // suivre le chemin (nœuds) ; -1 : le point final du but (spot)
  marcher(e, dt, vit) {
    const ch = e.chemin;
    if (!ch) { e.vitesse = 0; return; }
    let cible = ch[e.ci];
    let tx, ty, tz;
    if (cible === -1) { const sp = e.but && e.but.spot; if (!sp) { e.chemin = null; return; } [tx, ty, tz] = sp; }
    else { const q = this.noeud(cible); tx = q.x; ty = q.y; tz = q.z; }
    // loin du joueur (au-delà de ce que la nuit d'en bas laisse voir), on presse le pas : la ville tient ses heures
    const loin = Math.hypot(e.x - game.player.pos[0], e.z - game.player.pos[2]) > 48;
    const dx = tx - e.x, dz = tz - e.z, dd = Math.hypot(dx, dz), pas = vit * dt * (loin ? 3 : 1);
    e.pose = 'debout';
    if (dd <= pas + 0.05) {
      e.x = tx; e.z = tz; e.y = ty;
      e.ci++;
      if (e.ci >= ch.length) { e.chemin = null; e.arrive = true; e.vitesse = 0; if (e.but && e.but.regard !== undefined && e.but.pose !== 'couche') e.heading = e.heading; }
      return;
    }
    e.x += dx / dd * pas; e.z += dz / dd * pas;
    if (cible !== -1) { const q0 = e.ci > 0 && ch[e.ci - 1] >= 0 ? this.noeud(ch[e.ci - 1]) : null; if (q0) { const L = Math.hypot(tx - q0.x, tz - q0.z) || 1, t = clamp(1 - dd / L, 0, 1); e.y = lerp(q0.y, ty, t); } }
    e.heading = turnToward(e.heading, Math.atan2(dx, dz), dt * 4);
    e.vitesse = vit; e.phase += pas * 2.6;
    // les pas (on les entend de près)
    e.pasT = (e.pasT || 0) - pas;
    if (e.pasT <= 0) { e.pasT = 1.6; const d = Math.hypot(e.x - game.player.pos[0], e.z - game.player.pos[2]); if (d < 14) sonV5.pas([e.x, e.y + 0.1, e.z], clamp(1.2 - d / 14, 0.2, 1) * (e.role === 'gardien' ? 1.3 : 0.8)); }
  },
  // un gardien qui poursuit : droit sur vous s'il vous voit, sinon au dernier endroit, puis il fouille
  poursuivre(e, dt, d) {
    const p = game.player, F = e.furtif, Z = zone.Z;
    if (!F) { e.mode = null; return; }
    let tx, tz;
    const voit = F.etat === 'alertee' && F.vu > 0.05;
    if (voit || (F.etat === 'alertee' && d < 6)) { tx = p.pos[0]; tz = p.pos[2]; e.mode = 'chasse'; }
    else if (F.dernier) { tx = F.dernier.x; tz = F.dernier.z; }
    else { e.mode = null; e.replan = true; return; }
    // ne pas passer la porte de la ville (on ne remonte pas)
    if (!catacombesV5.enVille([tx, e.y + 1, tz])) { const P0 = this.Z().porte.dedans; tx = P0[0]; tz = P0[1]; }
    const dx = tx - e.x, dz = tz - e.z, dd = Math.hypot(dx, dz);
    e.heading = turnToward(e.heading, Math.atan2(dx, dz), dt * 6);
    if (voit && d < 1.7 && Math.abs(p.pos[1] - e.y) < 1.8) {
      e.vitesse = 0; e.attT -= dt;
      e.pose = 'frappe';
      if (e.attT <= 0) { e.attT = 1.5; play.hurt(14, { x: e.x, z: e.z }, 'Un gardien de Basse-Fosse'); sound.stab && sound.stab(); }
      return;
    }
    e.attT = Math.min(e.attT, 0.5);
    if (dd < 1.2) {
      // au dernier endroit : il regarde autour de lui
      e.vitesse = 0; e.pose = 'garde';
      e.heading += Math.sin(e.t * 1.3) * dt * 1.4;
      return;
    }
    const vit = (voit ? 3.3 : 2.1) * dt;
    let nx = e.x + dx / dd * vit, nz = e.z + dz / dd * vit;
    [nx, nz] = Z.collideCircle(nx, nz, e.y, e.y + 1.7, 0.35, 0.5);
    const moved = Math.hypot(nx - e.x, nz - e.z);
    e.bloqueT = moved < vit * 0.3 ? (e.bloqueT || 0) + dt : 0;
    if (e.bloqueT > 0.8) {
      // bloqué par un mur : par les rues
      e.bloqueT = 0;
      const a = this.proche(e.x, e.z), b = this.proche(tx, tz), ch = a >= 0 && b >= 0 ? this.astar(a, b) : null;
      if (ch && ch.length > 1) { e.chemin = ch; e.ci = 1; e.suitT = 3; }
    }
    if (e.suitT > 0 && e.chemin) { e.suitT -= dt; this.marcher(e, dt, voit ? 3.0 : 2.0); return; }
    e.x = nx; e.z = nz;
    e.y = Z.groundAt(e.x, e.z, e.y + 0.6, 0.6);
    if (!(e.y > -1e8)) e.y = this.Z().F;
    e.vitesse = vit / dt; e.phase += vit * 2.2; e.pose = 'debout';
  },

  // ------------------------------------------------------------- parler (E sur quelqu'un)
  cible(eye, f, cand) {
    if (!this.actif) return;
    for (const e of this.L) {
      if (e.parti) continue;
      const dx = e.x - eye[0], dz = e.z - eye[2], dy = e.y + (e.pose === 'couche' ? 0.5 : 1.3) - eye[1], d = Math.hypot(dx, dy, dz);
      if (d > 2.6) continue;
      if ((dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1) < 0.8) continue;
      cand({ kind: 'hook', use: () => this.parler(e) }, d);
    }
  },
  parler(e) {
    const S = this.S(), etranger = this.etranger();
    if (e.mort || e.couche) { ui.subtitle('', e.role === 'greffier' && S.fin === 'compte' ? '(Il dort enfin. Sa main a lâché la plume.)' : '(Il ne bouge plus. Il est froid, et il a l’air de dormir.)', 3); return; }
    if (e.pose === 'couche') {
      ui.subtitle('', V5_TEXTES.dormeur, 3);
      if (etranger && Math.random() < 0.3) { e.pose = 'debout'; e.mode = null; this.alarme(e, 'vu'); }
      return;
    }
    e.regardJoueur = 4;
    S.parle[e.id] = (S.parle[e.id] || 0) + 1;
    if (e.role === 'greffier') return this.greffier(e);
    if (e.role === 'marchande') return this.marchande(e);
    if (e.role === 'enfant') { this.dire(e, pick(V5_TEXTES.enfant), 3.5); return; }
    if (etranger) {
      if (farm.s.hand === 'v5_linceul') { ui.subtitle('', '(On s’écarte de vous, sans vous regarder.)', 3); return; }
      this.alarme(e, 'vu');
      return;
    }
    const lignes = {
      sonneuse: ['La grande, au fond du temple, on l’a fait taire. Son battant, ils l’ont jeté là-haut, sous un roi.', 'Je sonne pour qu’on se souvienne de l’heure. Là-haut, l’heure continue sans nous.'],
      veilleuse: ['Ma flamme n’est pas à moi. Elle est à tous. Allume la tienne à un de nos feux, et on ne te dira rien.', 'Ils ne s’éteignent pas. On les surveille quand même.'],
      ordonnateur: ['Les Premiers dorment derrière l’ossuaire. Il n’y a pas de porte. Il n’y en a jamais eu.', 'Chacun à sa place dans le mur. Les crânes en haut, les os longs en bas. Comme les vivants.'],
      gardien: ['Marche.', 'Ne cours pas.', 'Tu es compté. Ça ne veut pas dire qu’on ne te regarde pas.'],
    }[e.role] || V5_TEXTES.murmures.concat(V5_TEXTES.murmuresCompte);
    this.dire(e, lignes[(S.parle[e.id] - 1) % lignes.length], 4);
  },
  // le Greffier : le compte, la dent, son nom, la plume
  greffier(e) {
    const S = this.S(), etranger = !S.compte;
    const opts = [];
    let desc;
    if (etranger) {
      desc = 'Un vieil homme écrit dans un livre ouvert, sans encre. Il ne lève pas les yeux. « Approche. Je ne vois plus. Tu n’es pas dans le compte. »';
      opts.push({ label: 'Qu’est-ce que le compte ?', fn: () => ui.choice('Le Greffier', '« Ceux d’en bas, vivants et morts. On les compte chaque soir, à la cloche. Il ne faut pas que le nombre change. »', [{ label: 'Revenir', fn: () => this.greffier(e) }]) });
      opts.push({ label: 'Me faire compter', fn: () => ui.choice('Le Greffier', '« Il faut donner une dent. Tout le monde ici a donné une dent. Les enfants donnent la première qui tombe. »', [
        { label: 'Arracher une dent', fn: () => this.dent(e) },
        { label: 'Pas maintenant', fn: () => ui.close() },
      ]) });
    } else if (!S.nom) {
      desc = 'Le Greffier tourne une page. « Quatre cent douze. Hier aussi. Demain aussi. »';
      if (farm.count('v5_lettre_notaire') || farm.count('v5_lettre_4')) opts.push({ label: 'Lui lire la lettre', fn: () => this.nom(e) });
      opts.push({ label: 'Pourquoi le nombre ne change-t-il pas ?', fn: () => ui.choice('Le Greffier', '« Un de plus en bas, un de moins debout. Les morts restent dans le compte. C’est ainsi qu’on garde la ville. »', [{ label: 'Revenir', fn: () => this.greffier(e) }]) });
    } else {
      desc = '« Je m’appelais Auguste. Je crois. » Il garde la plume levée au-dessus de la page.';
      if (typeof finsV5 !== 'undefined' && finsV5.peutPrendrePlume()) opts.push({ label: 'Prendre la plume', fn: () => { ui.close(); finsV5.compte(); } });
      opts.push({ label: 'Et la cloche, au fond du temple ?', fn: () => ui.choice('Le Greffier', '« La Cloche du Jour. On l’a descendue de l’église, le soir de la cendre, et on lui a ôté son battant pour qu’elle ne nous appelle pas là-haut. Le battant est sous un tertre, avec un roi. Si elle sonne au matin, ils remonteront. Tous. »', [{ label: 'Revenir', fn: () => this.greffier(e) }]) });
      opts.push({ label: 'Et le feu du compte ?', fn: () => ui.choice('Le Greffier', '« Il ne s’éteint pas. Sauf sous ce qui ne brûle pas. Ils ont brûlé quelque chose, là-bas, dans la cendre, avant de descendre. Ce qui reste ne brûle pas. »', [{ label: 'Revenir', fn: () => this.greffier(e) }]) });
    }
    opts.push({ label: V5_TEXTES.partir, fn: () => ui.close() });
    ui.choice('Le Greffier', desc, opts);
  },
  dent(e) {
    const S = this.S();
    ui.close();
    sonV5.dent();
    play.hurt(6, null, 'Une dent arrachée');
    if (typeof corps !== 'undefined' && corps.saigner) try { corps.saigner(0.03, 'Une dent arrachée'); } catch (err) { /* */ }
    S.compte = this.compte();
    S.colere = 0;
    farm.give('v5_jeton', 1);
    setTimeout(() => this.dire(e, '« Te voilà compté. Le quatre cent douzième. »', 4.5), 700);
    // un de plus en bas, un de moins debout : la plus vieille ne se relèvera pas
    const vieille = this.L.find((q) => q.vieille);
    if (vieille) S.vieilleJour = farm.s.day + 1;
    farm.save();
  },
  nom(e) {
    const S = this.S();
    S.nom = farm.s.day;
    ui.choice('Le Greffier', 'Vous lisez. Au nom de Sorbiers, il pose la plume. Il répète le nom, plusieurs fois, à voix basse, comme on goûte une eau qu’on ne connaît pas.\n\n« Auguste. J’avais une lettre comme la tienne. Je suis descendu pour voir. Je suis resté pour compter. »\n\nIl reste longtemps sans rien dire. « Il faut quelqu’un pour compter. Ou bien que la cloche les appelle là-haut. Ou bien que le compte s’arrête. Moi, je ne peux plus choisir. Je ne suis plus d’ici, et je ne suis plus de là-haut. »', [
      { label: 'Revenir', fn: () => this.greffier(e) },
    ]);
    farm.save();
  },
  // la Marchande : ce qui a vu le jour, contre ce qui vient d'en bas
  marchande(e) {
    const S = this.S();
    const valeur = () => { let t = 0; for (const id in V5_TROC_PREND) if (ITEMS[id]) t += farm.count(id) * V5_TROC_PREND[id]; return t; };
    const payer = (prix) => {
      // elle prend d'abord ce qui vaut le moins
      const L = Object.keys(V5_TROC_PREND).filter((id) => ITEMS[id] && farm.count(id) > 0).sort((a, b) => V5_TROC_PREND[a] - V5_TROC_PREND[b]);
      const pris = {}; let reste = prix;
      for (const id of L) { while (reste > 0 && farm.count(id) > 0) { farm.take(id, 1); pris[id] = (pris[id] || 0) + 1; reste -= V5_TROC_PREND[id]; } if (reste <= 0) break; }
      return Object.keys(pris).map((id) => `${pris[id]} × ${itemName(id)}`).join(', ');
    };
    const dires = ['« Il y a des murs qui mentent. Frappe ceux qui sentent le vent. »', '« Le Greffier est seul au greffe l’après-midi. Il ne mord pas. »', '« Le gardien de la porte dort debout, au milieu de la nuit. Deux heures, pas plus. »', '« Les gardiens ne montent jamais le Degré. Jamais. »', '« Là-haut, dans les Cendrières, il y a un tas de cendre froide. Personne n’y touche. »', '« Les rois des tertres ont des portes qui ne sont pas des portes. »'];
    const opts = [];
    const v0 = valeur();
    for (const T of V5_TROC_DONNE) {
      const nom = T.id === 'v5_dire' ? 'Ce qu’elle sait' : itemName(T.id);
      opts.push({ label: `${nom} — ${T.prix} ${T.prix > 1 ? 'choses' : 'chose'} d’en haut`, fn: () => {
        if (valeur() < T.prix) { ui.choice('La Marchande', '« Ça ne suffit pas. Il me faut ce qui a vu le jour : du pain, du sel, des pommes, du vin, du fromage, du miel, une bougie… »', [{ label: 'Revenir', fn: () => this.marchande(e) }]); return; }
        const pris = payer(T.prix);
        if (T.id === 'v5_dire') { S.dits = (S.dits || 0) + 1; ui.choice('La Marchande', `Elle prend : ${pris}.\n\n` + dires[(S.dits - 1) % dires.length], [{ label: 'Revenir', fn: () => this.marchande(e) }]); return; }
        farm.give(T.id, 1); play.flyer(T.id, [e.x, e.y + 1.2, e.z], 1); sound.coin && sound.coin();
        ui.choice('La Marchande', `Elle prend : ${pris}. Elle vous donne : ${itemName(T.id)}.`, [{ label: 'Revenir', fn: () => this.marchande(e) }]);
        S.troc = (S.troc || 0) + 1;
      } });
    }
    opts.push({ label: V5_TEXTES.partir, fn: () => ui.close() });
    ui.choice('La Marchande', `« Je ne compte pas, moi. Je vends. Qu’est-ce que tu as qui a vu le jour ? »\n\n(Ce qu’elle prendrait : ${v0} ${v0 > 1 ? 'choses' : 'chose'}.)`, opts);
  },

  // ------------------------------------------------------------- les armes du joueur (zone.armes)
  raycast(o, d, max) {
    if (!this.actif) return null;
    let best = null;
    for (const e of this.L) {
      if (e.parti || e.mort) continue;
      const h = e.pose === 'couche' ? 0.6 : e.role === 'enfant' ? 1.25 : 1.75;
      const ox = o[0] - e.x, oz = o[2] - e.z, a = d[0] * d[0] + d[2] * d[2], b = 2 * (ox * d[0] + oz * d[2]), c = ox * ox + oz * oz - 0.35 * 0.35, disc = b * b - 4 * a * c;
      if (disc < 0 || a < 1e-9) continue;
      const t = (-b - Math.sqrt(disc)) / (2 * a);
      if (t < 0 || t > max) continue;
      const y = o[1] + d[1] * t;
      if (y < e.y || y > e.y + h) continue;
      if (!best || t < best.t) best = { t, s: e, p: [o[0] + d[0] * t, y, o[2] + d[2] * t] };
    }
    return best;
  },
  frapper(e, dmg) {
    const S = this.S();
    if (e.mort || e.parti) return;
    e.hp -= dmg;
    puffAt(e.x, e.y + 1.2, e.z, [140, 30, 30], 6, 1.5, false);
    sound.hurtHuman && sound.hurtHuman();
    S.colere = Math.max(S.colere || 0, farm.s.day + 3);
    if (e.pose === 'couche') e.pose = 'debout';
    this.alarme(e, 'coup');
    if (e.hp <= 0) {
      e.mort = true; e.pose = 'couche'; e.coucheEnRue = true; e.chemin = null;
      S.morts[e.id] = farm.s.day;
      if (e.furtif) furtif.oublier(e);
      farm.save();
    }
  },

  // ------------------------------------------------------------- le dessin
  draw(buf, sbuf, cam, t) {
    if (!this.actif) return;
    const R = 72;
    for (const e of this.L) {
      if (e.parti) continue;
      if (Math.abs(e.x - cam[0]) > R || Math.abs(e.z - cam[2]) > R) continue;
      const rig = this.rig(e), s = e.look.height || 1;
      if (e.pose === 'couche' || e.mort || e.couche) {
        poseHuman(rig, { move: 0, t: e.t });
        const M = new Float32Array(12);
        // couché sur le dos : la tête vers -cap, les pieds au point (x, z) moins la moitié du corps
        const h = e.heading, L = 0.9 * s;
        m34TR(M, e.x + Math.sin(h) * L, e.y + 0.14, e.z + Math.cos(h) * L, -Math.PI / 2, h, 0);
        if (s !== 1) for (let k = 0; k < 12; k++) if (k % 4 !== 3) M[k] *= s;
        drawRigM(buf, rig, M, 0);
        continue;
      }
      const mv = clamp(e.vitesse / 1.4, 0, 1.4);
      const st = { move: mv, phase: e.phase, run: e.vitesse > 2.5, t: e.t, lookY: 0 };
      if (e.pose === 'prie') st.pray = true;
      if (e.pose === 'travaille' || e.pose === 'ecrit') st.work = true;
      if (e.pose === 'frappe') st.attack = clamp(1 - e.attT / 1.35, 0, 1);
      if (e.pose === 'dort_debout') { st.lookP = 0.45; }
      if (e.pose === 'garde') st.lookY = Math.sin(e.t * 0.6) * 0.6;
      if (e.regardJoueur > 0) { const a = angDiff(e.heading, Math.atan2(game.player.pos[0] - e.x, game.player.pos[2] - e.z)); st.lookY = clamp(a, -1, 1); }
      if (e.mode === 'fuit') st.cower = e.vitesse < 0.1;
      poseHuman(rig, st);
      drawRig(buf, rig, e.x, e.y, e.z, e.heading, s, 0);
      if (sbuf && Math.abs(e.x - cam[0]) < 30 && Math.abs(e.z - cam[2]) < 30) drawShadow(sbuf, e.x, e.y, e.z, 0.32);
    }
  },
  // la lanterne de la Veilleuse
  lumieres(eye) {
    if (!this.actif) return [];
    const L = [];
    for (const e of this.L) {
      if (e.role !== 'veilleuse' || e.parti || e.mort || e.couche) continue;
      const d = Math.hypot(e.x - eye[0], e.y - eye[1], e.z - eye[2]);
      if (d < 60) L.push({ x: e.x + Math.sin(e.heading + 1.2) * 0.3, y: e.y + 0.8, z: e.z + Math.cos(e.heading + 1.2) * 0.3, r: 7, c: [0.95, 0.75, 0.48], d });
    }
    return L;
  },
};
// les gens d'en bas : dans la Zone seulement
zone.sur('update', (dt) => { if (farm.s && game.mode !== 'menu' && !game.dying && !cine.on) habitantsV5.update(game.sleeping ? 0 : dt); });
zone.sur('draw', (buf, sbuf, cam, t) => habitantsV5.draw(buf, sbuf, cam, t));
zone.sur('lights', (eye) => habitantsV5.lumieres(eye));
zone.sur('target', (eye, f, cand) => habitantsV5.cible(eye, f, cand));
zone.sur('entrer', () => { habitantsV5.actif = false; });
zone.sur('repos', () => { /* les gens d'en bas ne reviennent pas : les morts restent morts */ });
zone.armes.push({ raycast: (o, d, max) => habitantsV5.raycast(o, d, max), frapper: (s, dmg) => habitantsV5.frapper(s, dmg) });
// (un jour qui commence : la plus vieille, si l'on a été compté hier, ne s'est pas relevée)
HOOKS.day.push(() => { const S = farm.s && farm.s.v5; if (!S || !S.vieilleJour || S.vieilleJour > farm.s.day) return; S.vieilleMorte = true; const v = habitantsV5.L.find((e) => e.vieille); if (v) v.mort = true; });
