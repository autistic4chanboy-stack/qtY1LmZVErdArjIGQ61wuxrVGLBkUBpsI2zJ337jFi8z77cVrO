// ============================================================================
//  AVENTURE : état, missions, messages, interactions, jours, sauvegarde
// ============================================================================

const LORE = [
  'MANUEL DE LA STATION PRAIRIE-7\n\n• Terminal (salle de contrôle) : missions, messages, boutique.\n• Générateur (aile est) : alimentez-le en bûches. Sans courant, la station est plongée dans le noir.\n• Laboratoire de chimie (aile ouest) : mélangez deux réactifs pour obtenir une fiole. Buvez-la (clic droit) ou lancez-la (clic gauche).\n• Relais : six antennes dans la vallée. Réparez-les quand elles tombent en panne.\n• Quartiers (aile est) : dormez après 19 h.\n\nIl n’y a pas de carte de la vallée. Repérez-vous au soleil, à la boussole et à la balise rouge du mât : c’est le seul repère visible de loin.',
  'Liste de courses de Mme Aubert : farine, sel, allumettes, bougies. Beaucoup de bougies.',
  'Ils sont tous partis vers la mine. Moi, je reste. Je fermerai les volets.',
  'Journal de bord : les instruments se sont affolés au-dessus de la vallée. La boussole tournait sur elle-même. Nous tentons un atterrissage…',
  'Le soir, quelque chose tape aux fenêtres. Trois coups. Toujours trois.',
  'Carnet de chasse : les cerfs ne passent plus près du vieux chêne. Les lapins non plus. Même les corbeaux l’évitent. J’ai trouvé des traces de pas… trop longues pour un homme.',
  'Si tu lis ceci : garde la lumière allumée. Il déteste la lumière.',
  '',
  'Ici reposent ceux qui sont sortis après la tombée de la nuit.',
  'PROTOCOLE 7 — En cas d’anomalie persistante, rester dans le laboratoire éclairé. Ne pas répondre aux voix qui imitent la Direction.',
  '',
  'Campement nord : on a entendu des pas autour de la tente toute la nuit. Au matin, aucune trace.',
  'Les fioles bleues ramènent à la maison. Le Dr Morel en gardait toujours une sur lui. (Cristal + Minerai)',
  'Le monolithe chante quand personne ne l’écoute. Les relais ne tombent pas en panne : quelqu’un les débranche.',
  'Gravé dans l’écorce : « Il est plus vieux que l’arbre. »',
];

const EMAILS = [
  { day: 1, from: 'Direction — Consortium Prairie', subject: 'Bienvenue à la Station Prairie-7', body: 'Bienvenue, chercheur.\n\nVous êtes désormais seul responsable de la Station Prairie-7. Aucun autre membre du personnel n’est affecté à ce site.\n\nVos tâches : maintenir le générateur et les six relais de la vallée, collecter des échantillons, synthétiser des composés au laboratoire. Chaque mission accomplie est créditée sur votre compte.\n\nConsultez le manuel posé dans le hall.' },
  { day: 1, from: 'Système', subject: 'Protocole de maintenance', body: 'Rappel automatique : le générateur consomme environ une bûche toutes les deux heures. Hache et pioche sont fournies. Paquetage de départ disponible dans la réserve (aile est).' },
  { day: 2, from: 'Archives — Dr É. Morel', subject: 'Journal, entrée 41', body: 'Troisième relais en panne cette semaine. Aucune trace d’usure. Les câbles sont… arrachés.\n\nJ’entends des pas autour de la station la nuit. Probablement un cerf.' },
  { day: 3, from: 'Direction — Consortium Prairie', subject: 'Distorsions relevées', body: 'Nos capteurs relèvent des distorsions croissantes autour de la station. Il peut s’agir d’interférences. Évitez de vous éloigner la nuit.' },
  { day: 3, from: '???', subject: 'Re: Re: Re: tu es là ?', body: 'tu es là ?\ntu es là ?\ntu es l█ ?' },
  { day: 4, from: 'Surveillance automatique', subject: 'Caméra 3 — mouvement détecté (02:13)', body: 'Silhouette détectée près du Relais Austral. Taille estimée : 2,7 m. Classification : INCONNUE.\n\nCe n’est pas un animal.' },
  { day: 5, from: 'Direction — Consortium Prairie', subject: 'Protocole nocturne', body: 'À compter d’aujourd’hui : restez à l’intérieur de la station la nuit. Gardez le générateur alimenté. La lumière semble le tenir à distance.\n\nNous ne pouvons pas vous évacuer pour le moment.' },
  { day: 6, from: 'Archives — Dr É. Morel', subject: 'Journal, entrée 58 (dernière)', body: 'Il ne supporte pas la lumière vive. La lampe le fait reculer, une fusée éclairante le fait fuir. Un coup de feu le trouble un moment.\n\nIl ne s’approche pas quand on le regarde. Ne le quittez pas des yeux.\n\nJe vais réparer le relais du marais. Je reviens avant la nuit.' },
  { day: 7, from: 'Dir█ction', subject: 'rentre', body: 'rentre à la maison\nrentre à la maison\nrentre à la maison' },
  { day: 9, from: '█████', subject: '█████', body: 'IL T█ VOIT' },
  { day: 12, from: 'Direction — Consortium Prairie', subject: 'Aucune réponse', body: 'Station Prairie-7, répondez. Station Prairie-7, répondez. Nous n’avons plus de contact depuis le jour 9.' },
];

const SHOP = [
  { id: 'munitions', name: 'Munitions ×12', cost: 10, give: ['munitions', 12] },
  { id: 'eau', name: 'Eau distillée ×5', cost: 4, give: ['eau', 5] },
  { id: 'cristal', name: 'Cristaux ×2', cost: 12, give: ['cristal', 2] },
  { id: 'residu', name: 'Résidu anomal ×1', cost: 30, give: ['residu', 1] },
  { id: 'retour', name: 'Fiole de Retour', cost: 20, potion: 'retour' },
  { id: 'soin', name: 'Élixir de soin', cost: 15, potion: 'soin' },
  { id: 'fusee', name: 'Fusée éclairante', cost: 25, potion: 'fusee' },
  { id: 'repulsif', name: 'Répulsif', cost: 30, potion: 'repulsif' },
  { id: 'lampe', name: 'Lampe renforcée (portée ×2)', cost: 45, upgrade: 'lampe' },
  { id: 'bottes', name: 'Bottes de marche (+15 % vitesse)', cost: 60, upgrade: 'bottes' },
];

const DIRS = ['nord', 'nord-est', 'est', 'sud-est', 'sud', 'sud-ouest', 'ouest', 'nord-ouest'];

const adv = {
  on: false, s: null, genCount: 0, pickups: [], hold: null, waterT: 0, hurtT: 0, lastTime: 0, saveT: 0, tipT: 0,

  blank(seed) {
    return {
      seed, gen: ADV_GEN, day: 1, time: 0.33, hp: 100, credits: 10,
      inv: { munitions: 24, eau: 4 }, potions: { retour: 1 }, mag: 12, tool: 'revolver', potionSel: 'retour',
      missions: [], mseq: 0, relays: {}, fuel: 70, recipes: { retour: 1 }, emails: [], opened: {}, stockDay: 0,
      samples: {}, deltas: {}, added: [], craters: [], ore: {}, killed: {}, visited: {}, upgrades: {}, player: null, deaths: 0,
    };
  },

  // ------------------------------------------------------------ démarrage / sauvegarde
  async start(saved, seed) {
    const s = saved || this.blank(seed ?? ((Math.random() * 1e6) | 0));
    const w = await generateAdventure(s.seed, (m) => ui.setLoading(m));
    this.s = s;
    this.genCount = w.objects.length;
    this.applyDeltas(w);
    this.on = true;
    game.setWorld(w, true);
    w.time = s.time;
    this.lastTime = s.time;
    if (s.player) { game.player.pos = s.player.pos.slice(0, 3); game.player.yaw = s.player.yaw; game.player.pitch = s.player.pitch || 0; }
    game.weapon.ammo = s.mag;
    if (!saved) { this.deliverEmails(); this.genMissions(true); this.save(); }
  },
  save() {
    if (!this.on || !this.s) return;
    const p = game.player;
    this.s.time = game.world.time;
    this.s.mag = game.weapon.ammo;
    this.s.player = { pos: p.pos.map((v) => Math.round(v * 100) / 100), yaw: p.yaw, pitch: p.pitch };
    if (!store.setRaw('prairie.adv', JSON.stringify(this.s)) && !this.warned) { this.warned = true; ui.toast('Sauvegarde impossible dans ce navigateur', 'err'); }
  },
  applyDeltas(w) {
    const s = this.s;
    for (const [i, v] of Object.entries(s.deltas)) {
      const o = w.objects[+i];
      if (!o) continue;
      if (v === 'gone') o.gone = true;
      else { o.t = OBJ_INDEX[v]; o.v = 0; if (v === 'stump') o.h = 0.9; }
    }
    for (const a of s.added) w.objects.push({ t: OBJ_INDEX[a[0]], x: a[1], z: a[2], h: a[3], f: 0, v: 0 });
    for (const c of s.craters) this.crater(w, c[0], c[1], c[2], c[3]);
    for (const [bi, n] of Object.entries(s.ore)) if (n >= 4 && w.blocks[+bi]) w.blocks[+bi].m = M_ROCK;
    for (const [i, day] of Object.entries(s.killed)) {
      if (s.day - day < 2) { const o = w.objects[+i]; if (o) o.gone = true; } else delete s.killed[i];
    }
  },
  crater(w, x, z, r, d) {
    const c = w.cell;
    const i0 = Math.max(0, Math.floor((x - r) / c)), i1 = Math.min(w.N, Math.ceil((x + r) / c));
    const j0 = Math.max(0, Math.floor((z - r) / c)), j1 = Math.min(w.N, Math.ceil((z + r) / c));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const t = Math.hypot(i * c - x, j * c - z) / r;
      if (t < 1) { w.heights[j * w.W + i] -= d * (1 - t * t) ** 2; if (t < 0.7) w.mats[j * w.W + i] = M_DIRT; }
    }
    w.markHeights(i0, j0, i1, j1); w.markMats(i0, j0, i1, j1);
  },

  // ------------------------------------------------------------ inventaire
  count(it) { return this.s.inv[it] | 0; },
  give(it, n, quiet) {
    if (n <= 0) return;
    this.s.inv[it] = (this.s.inv[it] | 0) + n;
    if (!quiet) ui.toast('+' + n + ' ' + ITEMS[it].name);
  },
  take(it, n) { if (this.count(it) < n) return false; this.s.inv[it] -= n; return true; },
  givePotion(p, n = 1, quiet) {
    this.s.potions[p] = (this.s.potions[p] | 0) + n;
    if (!this.s.potionSel || !this.s.potions[this.s.potionSel]) this.s.potionSel = p;
    if (!quiet) ui.toast('+ Fiole : ' + POTIONS[p].name);
  },
  takePotion(p) {
    if (!(this.s.potions[p] > 0)) return false;
    if (--this.s.potions[p] <= 0) { delete this.s.potions[p]; if (this.s.potionSel === p) this.s.potionSel = Object.keys(this.s.potions)[0] || null; }
    return true;
  },
  dropLoot(list, x, y, z) {
    for (const [it, a, b] of list) {
      const n = a + Math.floor(Math.random() * (b - a + 1));
      for (let k = 0; k < n; k++) this.pickups.push({ it, x: x + (Math.random() - 0.5) * 1.2, y: y + 0.6 + Math.random() * 0.5, z: z + (Math.random() - 0.5) * 1.2, vy: 2 + Math.random() * 2, t: Math.random() * 6, age: 0 });
    }
  },

  // ------------------------------------------------------------ repères
  dirName(dx, dz) { return DIRS[(Math.round(Math.atan2(dx, -dz) / TAU * 8) % 8 + 8) % 8]; },
  whereFromLab(x, z) {
    const L = game.world.adv.lab, dx = x - L.x, dz = z - L.z;
    return `à environ ${Math.max(50, Math.round(Math.hypot(dx, dz) / 50) * 50)} m au ${this.dirName(dx, dz)} du laboratoire`;
  },

  // ------------------------------------------------------------ missions
  genMissions(first) {
    const s = this.s;
    const active = s.missions.filter((m) => !m.done && m.type !== 'repair').length;
    for (let k = active; k < 3; k++) {
      const m = this.makeMission(first ? ['fuel', 'brew', 'explore'][k] : null);
      if (m) s.missions.push(m);
    }
  },
  makeMission(type) {
    const s = this.s, w = game.world, R = Math.random;
    type = type || ['deliver', 'deliver', 'brew', 'fuel', 'explore', 'sample'][(R() * 6) | 0];
    const id = 'm' + (++s.mseq), day = s.day;
    if (type === 'fuel') return { id, day, type, title: 'Carburant', desc: 'Ajoutez 5 bûches dans le générateur (aile est de la station).', n: 5, prog: 0, reward: 15 };
    if (type === 'deliver') {
      const it = ['bois', 'pierre', 'minerai', 'viande', 'cuir', 'fleur', 'champignon', 'cristal'][(R() * 8) | 0];
      const n = { bois: 8, pierre: 6, minerai: 4, viande: 3, cuir: 2, fleur: 6, champignon: 4, cristal: 2 }[it];
      return { id, day, type, title: 'Échantillons', desc: `Rapportez ${n} × ${ITEMS[it].name.toLowerCase()} au terminal.`, item: it, n, reward: 8 + n * 3 };
    }
    if (type === 'brew') {
      const opts = ['soin', 'lumiere', 'vitesse', 'vision', 'bond', 'croissance', 'voile', 'feu', 'givre'];
      const p = opts[(R() * opts.length) | 0];
      return { id, day, type, title: 'Synthèse', desc: `Synthétisez une fiole de ${POTIONS[p].name} et livrez-la au terminal.` + (s.recipes[p] ? '' : ' Recette inconnue : expérimentez les mélanges.'), potion: p, reward: 25 };
    }
    if (type === 'explore') {
      const cand = w.pois.filter((p) => !s.visited[p.name] && p.kind !== 'lab' && p.kind !== 'relay');
      if (!cand.length) return this.makeMission('deliver');
      const p = cand[(R() * cand.length) | 0];
      return { id, day, type, title: 'Reconnaissance', desc: `Nos relevés signalent une structure ${this.whereFromLab(p.x, p.z)}. Allez voir sur place.`, poi: p.name, reward: 20 };
    }
    if (type === 'sample') {
      const m = w.adv.monoliths[(R() * w.adv.monoliths.length) | 0];
      if (!m) return this.makeMission('deliver');
      return { id, day, type, title: 'Prélèvement', desc: `Une source anomale émet ${this.whereFromLab(m.x, m.z)}. Rapportez 1 résidu anomal.`, item: 'residu', n: 1, reward: 35 };
    }
    return null;
  },
  complete(m) {
    if (m.done) return;
    m.done = true; m.day = this.s.day;
    this.s.credits += m.reward;
    ui.toast('✔ Mission accomplie : ' + m.title + ' (+' + m.reward + ' crédits)');
    sound.pop();
  },
  deliver(m) { // depuis le terminal
    if (m.type === 'brew') { if (!this.takePotion(m.potion)) return ui.toast('Il vous faut une fiole de ' + POTIONS[m.potion].name, 'err'); }
    else if (!this.take(m.item, m.n)) return ui.toast('Il vous manque ' + (m.n - this.count(m.item)) + ' × ' + ITEMS[m.item].name.toLowerCase(), 'err');
    this.complete(m);
  },

  deliverEmails() {
    for (const e of EMAILS) if (e.day <= this.s.day && !this.s.emails.includes(e.subject)) {
      this.s.emails.push(e.subject);
      this.unread = true;
    }
  },

  // ------------------------------------------------------------ nouveau jour
  newDay() {
    const s = this.s, w = game.world;
    s.day++;
    const working = w.adv.relays.filter((r) => !s.relays[r.id]);
    const nBreak = s.day <= 2 ? 1 : 1 + (Math.random() < 0.5 ? 1 : 0);
    for (let k = 0; k < nBreak && working.length; k++) {
      const r = working.splice((Math.random() * working.length) | 0, 1)[0];
      s.relays[r.id] = 1;
      s.missions.push({ id: 'm' + (++s.mseq), day: s.day, type: 'repair', relay: r.id, title: 'Maintenance', desc: `Le ${r.name} est hors ligne, ${this.whereFromLab(r.x, r.z)}. Réparez son boîtier.`, reward: 25 });
    }
    s.missions = s.missions.filter((m) => !m.done || m.day >= s.day - 1);
    this.genMissions();
    this.deliverEmails();
    w.objects.forEach((o, i) => { if (o.greenhouse && o.gone) { o.gone = false; delete s.deltas[i]; } });
    for (const [i, day] of Object.entries(s.killed)) if (s.day - day >= 2) { const o = w.objects[+i]; if (o) o.gone = false; delete s.killed[i]; }
    w.objectsDirty = true; w.shadeDirty = true; w.grid = null;
    ui.showTitle('JOUR ' + s.day, this.unread ? '✉ NOUVEAUX MESSAGES AU TERMINAL' : '');
    this.save();
  },
  sleep() {
    const t = game.world.time;
    if (t < 0.79 && t > 0.23) return ui.toast('Vous n’avez pas sommeil. (Dormez après 19 h.)');
    ui.fade(() => {
      this.newDay();
      game.world.time = 0.29; this.lastTime = 0.29;
      this.s.hp = 100;
      this.save();
    }, 'Vous dormez…');
  },
  knockout() {
    this.s.deaths++;
    ui.fade(() => {
      for (const it of Object.keys(this.s.inv)) if (it !== 'munitions') this.s.inv[it] = Math.floor(this.s.inv[it] / 2);
      const w = game.world;
      this.newDay();
      w.time = 0.29; this.lastTime = 0.29;
      const b = w.adv.lab.bed;
      game.player.pos = [b[0], w.groundAt(b[0], b[1], w.adv.lab.frame.y + 1, 0.6), b[1]];
      game.player.vel = [0, 0, 0];
      this.s.hp = 60;
      this.save();
    }, 'Vous vous réveillez au laboratoire… Vous avez perdu la moitié de vos ressources.');
  },
  hurt(n) {
    if (!this.on || this.s.hp <= 0) return;
    this.s.hp = Math.max(0, this.s.hp - n);
    this.hurtT = 0.6;
    if (this.s.hp <= 0) this.knockout();
  },
  heal(n) { this.s.hp = Math.min(100, this.s.hp + n); },

  // ------------------------------------------------------------ interactions (touche E)
  interact(it) {
    const s = this.s;
    switch (it.kind) {
      case 'terminal':
        if (!this.power) return ui.toast('Pas de courant : alimentez le générateur.', 'err');
        return ui.openTerminal();
      case 'mixer': return ui.openMixer();
      case 'water':
        if (this.waterT > 0) return ui.toast('Le distillateur se remplit…');
        this.waterT = 20; return this.give('eau', 3);
      case 'bed': return this.sleep();
      case 'generator': {
        const need = Math.ceil((100 - s.fuel) / 10), n = Math.min(need, this.count('bois'));
        if (need <= 0) return ui.toast('Le réservoir est plein (' + Math.round(s.fuel) + ' %).');
        if (!n) return ui.toast('Il faut des bûches pour alimenter le générateur. Réservoir : ' + Math.round(s.fuel) + ' %', 'err');
        this.take('bois', n); s.fuel = Math.min(100, s.fuel + n * 10);
        ui.toast(n + ' bûche(s) ajoutée(s). Réservoir : ' + Math.round(s.fuel) + ' %');
        for (const m of s.missions) if (m.type === 'fuel' && !m.done) { m.prog += n; if (m.prog >= m.n) this.complete(m); }
        sound.land(0.5);
        return;
      }
      case 'supply':
        if (s.opened.supply) return ui.toast('La réserve est vide.');
        s.opened.supply = 1;
        this.give('munitions', 12, true); this.give('eau', 4, true); this.give('fleur', 2, true); this.give('champignon', 2, true); this.givePotion('soin', 1, true);
        return ui.toast('Paquetage : munitions, eau distillée, fleurs, champignons, élixir de soin.');
      case 'stock': {
        if (s.stockDay === s.day) return ui.toast('Vous avez déjà inventorié la réserve aujourd’hui.');
        s.stockDay = s.day;
        const pool = ['fleur', 'champignon', 'cristal', 'minerai', 'eau'];
        for (let k = 0; k < 2; k++) this.give(pool[(Math.random() * pool.length) | 0], 2);
        return;
      }
      case 'crate': {
        if (s.opened[it.id]) return ui.toast('Cette caisse est vide.');
        s.opened[it.id] = 1;
        const loot = [['munitions', 6], ['eau', 3], ['fleur', 2], ['champignon', 2], ['cristal', 1], ['minerai', 2], ['viande', 1], ['residu', 1]];
        const n = 2 + ((Math.random() * 2) | 0);
        for (let k = 0; k < n; k++) { const [i, q] = loot[(Math.random() * loot.length) | 0]; this.give(i, q); }
        if (Math.random() < 0.4) this.givePotion(['soin', 'vitesse', 'lumiere', 'retour', 'fusee', 'vision'][(Math.random() * 6) | 0]);
        if (Math.random() < 0.5) { const c = 5 + ((Math.random() * 11) | 0); s.credits += c; ui.toast('+' + c + ' crédits'); }
        sound.pop();
        return;
      }
      case 'note': return ui.showNote(LORE[it.data.text] || '…');
      case 'sample': {
        const key = it.id;
        if (s.samples[key] === s.day) return ui.toast('Le monolithe est silencieux. Revenez demain.');
        s.samples[key] = s.day;
        this.give('residu', 1);
        glitch.burst(1.2);
        return;
      }
      case 'relay':
        if (!s.relays[it.id]) return ui.toast('Ce relais fonctionne normalement.');
        this.hold = { it, t: 0, need: 3, label: 'Réparation du relais…' };
        return;
    }
  },
  finishHold() {
    const it = this.hold.it;
    this.hold = null;
    if (it.kind === 'relay') {
      this.s.relays[it.id] = 0;
      ui.toast('Relais réparé.');
      sound.pop();
      for (const m of this.s.missions) if (m.type === 'repair' && m.relay === it.id && !m.done) this.complete(m);
    }
  },

  // ------------------------------------------------------------ mise à jour
  update(dt, keysE) {
    const s = this.s, w = game.world, p = game.player;
    // bascule du jour à 6 h
    if (this.lastTime < 0.25 && w.time >= 0.25) this.newDay();
    this.lastTime = w.time;
    s.fuel = Math.max(0, s.fuel - dt * 100 / (2 * w.dayLength));
    this.power = s.fuel > 0 ? 1 : 0;
    this.waterT = Math.max(0, this.waterT - dt);
    this.hurtT = Math.max(0, this.hurtT - dt);
    // maintien de la touche E (réparations)
    if (this.hold) {
      const it = this.hold.it;
      if (!keysE || Math.hypot(it.x - p.pos[0], it.z - p.pos[2]) > 3.2) { this.hold = null; ui.toast('Réparation interrompue'); }
      else if ((this.hold.t += dt) >= this.hold.need) this.finishHold();
    }
    // lieux découverts -> missions de reconnaissance
    this.visitT = (this.visitT || 0) - dt;
    if (this.visitT <= 0) {
      this.visitT = 0.5;
      for (const poi of w.pois) if (!s.visited[poi.name] && Math.hypot(poi.x - p.pos[0], poi.z - p.pos[2]) < poi.r) {
        s.visited[poi.name] = s.day;
        for (const m of s.missions) if (m.type === 'explore' && m.poi === poi.name && !m.done) this.complete(m);
      }
    }
    // objets à ramasser
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const k = this.pickups[i];
      k.age += dt; k.t += dt;
      const g = w.groundAt(k.x, k.z, k.y + 0.5, 0.6);
      k.vy -= 14 * dt; k.y += k.vy * dt;
      if (k.y < g + 0.05) { k.y = g + 0.05; k.vy = 0; }
      if (k.age > 0.4 && Math.hypot(k.x - p.pos[0], k.z - p.pos[2]) < 1.4 && Math.abs(k.y - p.pos[1]) < 2.2) {
        this.give(k.it, 1, true);
        this.pickToast(k.it);
        this.pickups.splice(i, 1);
      } else if (k.age > 600) this.pickups.splice(i, 1);
    }
    this.saveT += dt;
    if (this.saveT > 60) { this.saveT = 0; this.save(); }
  },
  pickToast(it) { // regroupe les ramassages rapprochés
    const now = performance.now();
    if (this.lastPick && this.lastPick.it === it && now - this.lastPick.t < 900) { this.lastPick.n++; } else this.lastPick = { it, n: 1 };
    this.lastPick.t = now;
    ui.toast('+' + this.lastPick.n + ' ' + ITEMS[it].name);
    sound.click();
  },
  appendPickups(D, k) {
    for (const p of this.pickups) {
      if (k >= 2047) break;
      const s = ATLAS.sprites[ITEMS[p.it].icon], o = k * 13, bob = Math.sin(p.t * 3) * 0.06 + 0.08;
      D[o] = p.x; D[o + 1] = p.y + bob; D[o + 2] = p.z; D[o + 3] = 0.42; D[o + 4] = 0.42;
      D[o + 5] = s.u0; D[o + 6] = s.v0; D[o + 7] = s.u1; D[o + 8] = s.v1;
      D[o + 9] = 0; D[o + 10] = 1; D[o + 11] = 0; D[o + 12] = 0;
      k++;
    }
    return k;
  },
};
