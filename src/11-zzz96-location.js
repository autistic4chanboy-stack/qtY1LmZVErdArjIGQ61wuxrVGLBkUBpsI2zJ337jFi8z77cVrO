// ============================================================================
//  LOUER UNE MAISON EN VILLE
//  Trois maisons à louer : la maison Vernet (à l'ouest), la maison Delorme (à
//  l'est, contre le rempart) et la maison du Rempart (neuve, au nord-est, bâtie
//  par la génération de 11-zzz95-sommeil.js). Devant chacune, un écriteau « À
//  louer » (E : le prix à la semaine de douze jours, le bail) ; le maire s'en
//  occupe aussi (« Les maisons à louer »).
//  Locataire : la clé (la porte s'ouvre pour vous et se referme à clé derrière
//  vous ; elle reste fermée aux autres), le lit (on y dort comme chez soi), un
//  coffre cerclé de fer, le loyer dû chaque semaine : avis d'échéance, lettre de
//  rappel au troisième jour, expulsion au sixième (les affaires du coffre sont
//  saisies, on les reprend à la mairie contre la dette). Fin du bail quand on
//  veut (« Rendre les clés »).
//  État : farm.s.location = { baux: { clé: { debut, echeance, du, depuis,
//         rappel, coffre } }, saisies: { clé: { objets, dette, jour } }, anciens }
//  API : locations (« location » est pris par le navigateur) — locataire(clé),
//        louer(clé), payer(clé), rendre(clé), expulser(clé), ecriteau(clé), S()
// ============================================================================
// loyers à la semaine de douze jours (équilibrage : 12 à 18 pièces la nuit, un peu moins que la chambre de l'auberge)
const LOC_MAISONS = {
  vide4: { nom: 'la maison Vernet', court: 'maison Vernet', rue: 'du côté ouest, derrière la forge', loyer: 150, cle: 'cle_vernet',
    desc: 'Une pièce, un lit, un coffre cerclé de fer, une cheminée qui tire bien. La veuve Vernet est partie vivre chez sa fille, en bas de la vallée.' },
  vide5: { nom: 'la maison Delorme', court: 'maison Delorme', rue: 'du côté est, contre le rempart', loyer: 170, cle: 'cle_delorme',
    desc: 'Une pièce claire, un lit, un coffre, une cheminée. Les Delorme sont partis un matin, sans laisser d’adresse. Leurs volets, eux, sont restés.' },
  maison_rempart: { nom: 'la maison du Rempart', court: 'maison du Rempart', rue: 'au nord-est, derrière la poste, au pied du rempart', loyer: 210, cle: 'cle_rempart',
    desc: 'Une maison de pierre neuve, contre le rempart. Un lit, un coffre, une cheminée, des rayonnages. Elle avait été bâtie pour un sergent du guet qui n’est jamais venu.' },
};
defItem('cle_vernet', 'Clé de la maison Vernet', 'quete', 0, ['cle', '#9a7a4a'], { desc: 'Une clé de fer, un peu tordue, au bout d’une ficelle. La porte de la maison Vernet, en ville.' });
defItem('cle_delorme', 'Clé de la maison Delorme', 'quete', 0, ['cle', '#8a8a92'], { desc: 'Une clé longue et fine. La porte de la maison Delorme, contre le rempart est.' });
defItem('cle_rempart', 'Clé de la maison du Rempart', 'quete', 0, ['cle', '#6a6a72'], { desc: 'Une clé neuve, qui n’a encore ouvert que deux fois. La maison du Rempart, au nord-est de la ville.' });

const locations = {
  S() {
    const s = farm.s;
    if (!s) return null;
    const L = s.location || (s.location = {});
    L.baux = L.baux || {}; L.saisies = L.saisies || {}; L.anciens = L.anciens || 0;
    return L;
  },
  locataire(k) { const L = farm.s && farm.s.location; return !!(L && L.baux && L.baux[k]); },
  bail(k) { const L = this.S(); return L ? L.baux[k] : null; },
  M(k) { return LOC_MAISONS[k]; },
  existe(k) { const w = typeof game !== 'undefined' && game.world; return !!(LOC_MAISONS[k] && w && w.bld && w.bld[k] && w.locations && w.locations[k]); },
  signataire() { return npcs.alive('maire') ? 'La mairie de ' + farm.names.ville : 'Le greffe de ' + farm.names.ville; },
  jourNom(d) { return typeof cal !== 'undefined' ? `${cal.nom(d)} ${d}` : `jour ${d}`; },
  porte(k) { const w = game.world, B = w.bld[k]; return B && B.door >= 0 ? w.doors[B.door] : null; },

  // ------------------------------------------------------------------ le bail
  louer(k) {
    const M = this.M(k), L = this.S(), s = farm.s;
    if (!M || !this.existe(k)) return 'absente';
    if (L.baux[k]) return 'deja';
    if (!farm.pay(M.loyer)) return 'pauvre';
    L.baux[k] = { debut: s.day, echeance: s.day + 12, du: 0, depuis: 0, rappel: false, coffre: {} };
    if (ITEMS[M.cle]) farm.give(M.cle, 1);
    sound.coin && sound.coin(); setTimeout(() => sound.lock && sound.lock(false), 200);
    farm.mail(this.signataire(), 'Bail — ' + M.court,
      `Entre la commune de ${farm.names.ville}, propriétaire, et ${s.prenom || 'l’occupant de la vieille ferme'}, locataire, il est convenu ce qui suit.\n\n` +
      `${M.nom.charAt(0).toUpperCase() + M.nom.slice(1)}, ${M.rue}, est louée à la semaine de douze jours, pour ${M.loyer} pièces, payables d’avance. La première semaine est réglée ce jour ; la suivante sera due le ${this.jourNom(s.day + 12)}.\n\n` +
      `Le loyer se règle à la mairie, ou sur l’écriteau de la maison. Passé trois jours, une lettre de rappel ; passé six, l’expulsion, et ce qui se trouve dans le coffre sera gardé à la mairie jusqu’à paiement.\n\n` +
      `Le locataire peut rendre les clés quand il le veut. La commune ne rembourse pas la semaine commencée.`);
    farm.dirtyProps = true;
    this.appliquerPortes();
    return 'ok';
  },
  payer(k) {
    const M = this.M(k), B = this.bail(k);
    if (!M || !B) return 'rien';
    const s = farm.s;
    if (B.du > 0) {
      if (!farm.pay(B.du)) return 'pauvre';
      const p = B.du;
      B.du = 0; B.depuis = 0; B.rappel = false;
      sound.coin && sound.coin();
      farm.mail(this.signataire(), 'Quittance — ' + M.court, `Reçu de ${s.prenom || 'l’intéressé'} la somme de ${p} pièces, pour le loyer de ${M.nom}. La prochaine échéance tombe le ${this.jourNom(B.echeance)}.`);
      return 'ok';
    }
    // rien de dû : une semaine d'avance
    if (!farm.pay(M.loyer)) return 'pauvre';
    B.echeance += 12;
    sound.coin && sound.coin();
    farm.mail(this.signataire(), 'Quittance — ' + M.court, `Reçu de ${s.prenom || 'l’intéressé'} la somme de ${M.loyer} pièces, loyer d’avance de ${M.nom}. La prochaine échéance tombe le ${this.jourNom(B.echeance)}.`);
    return 'avance';
  },
  rendre(k) {
    const M = this.M(k), L = this.S(), B = L && L.baux[k];
    if (!M || !B) return 'rien';
    const repris = [];
    for (const id in B.coffre) if (ITEMS[id] && B.coffre[id] > 0) { farm.give(id, B.coffre[id]); repris.push(itemName(id).toLowerCase()); }
    if (B.du > 0) L.saisies[k] = { objets: {}, dette: B.du, jour: farm.s.day };
    delete L.baux[k]; L.anciens++;
    if (farm.count(M.cle)) farm.take(M.cle, farm.count(M.cle));
    farm.mail(this.signataire(), 'Congé — ' + M.court, `La commune prend acte du congé donné par ${farm.s.prenom || 'le locataire'} pour ${M.nom}. Les clés ont été rendues.${B.du > 0 ? `\n\nIl reste dû ${B.du} pièces, à régler à la mairie.` : ''}`);
    farm.dirtyProps = true;
    this.appliquerPortes(true);
    return repris.length ? repris : 'ok';
  },
  expulser(k) {
    const M = this.M(k), L = this.S(), B = L && L.baux[k];
    if (!M || !B) return;
    const objets = Object.assign({}, B.coffre), n = Object.keys(objets).filter((id) => objets[id] > 0).length;
    L.saisies[k] = { objets, dette: B.du, jour: farm.s.day };
    delete L.baux[k]; L.anciens++;
    if (farm.count(M.cle)) farm.take(M.cle, farm.count(M.cle));
    farm.mail(this.signataire(), 'Avis d’expulsion — ' + M.court,
      `Le loyer de ${M.nom} n’a pas été réglé malgré notre rappel. Le bail est rompu ce jour, la serrure a été changée.\n\n` +
      (n ? `Ce que contenait le coffre a été porté à la mairie. Il vous sera rendu contre le paiement de la dette : ${B.du} pièces.` : `Il reste dû ${B.du} pièces, à régler à la mairie.`) + '\n\nLa commune regrette.');
    farm.dirtyProps = true;
    this.appliquerPortes(true);
    // le locataire était dedans : on le met à la porte
    if (game.insideBuilding(k)) setTimeout(() => ui.subtitle('', '(Des pas dehors, une clé qui tourne dans la serrure, une autre. On a changé la serrure pendant que vous étiez là.)', 5), 1500);
  },
  recuperer(k) {
    const L = this.S(), Z = L && L.saisies[k];
    if (!Z) return 'rien';
    if (Z.dette > 0 && !farm.pay(Z.dette)) return 'pauvre';
    if (Z.dette > 0) sound.coin && sound.coin();
    for (const id in Z.objets) if (ITEMS[id] && Z.objets[id] > 0) farm.give(id, Z.objets[id]);
    delete L.saisies[k];
    return 'ok';
  },
  // chaque matin : échéances, rappels, expulsions
  jour() {
    const L = this.S(), s = farm.s;
    if (!L) return;
    for (const k of Object.keys(L.baux)) {
      const B = L.baux[k], M = this.M(k);
      if (!M) { delete L.baux[k]; continue; }
      if (s.day >= B.echeance) {
        B.du += M.loyer; B.echeance += 12;
        if (!B.depuis) B.depuis = s.day;
        farm.mail(this.signataire(), 'Avis d’échéance — ' + M.court, `Le loyer de la semaine qui commence est dû : ${M.loyer} pièces${B.du > M.loyer ? ` (${B.du} en tout, avec l’arriéré)` : ''}, pour ${M.nom}. À régler à la mairie, ou sur l’écriteau de la maison.`);
      }
      if (B.du > 0 && B.depuis) {
        const retard = s.day - B.depuis;
        if (retard >= 6) { this.expulser(k); continue; }
        if (retard >= 3 && !B.rappel) {
          B.rappel = true;
          farm.mail(this.signataire(), 'Rappel — ' + M.court, `Nous n’avons toujours pas reçu le loyer de ${M.nom} : ${B.du} pièces. Sans paiement d’ici trois jours, le bail sera rompu et la serrure changée.\n\nLe maire.`);
        }
      }
    }
  },

  // ------------------------------------------------------------------ les portes : fermées à clé, sauf pour le locataire qui ouvre
  appliquerPortes(ferme) {
    const w = game.world;
    for (const k in LOC_MAISONS) {
      const dr = this.porte(k);
      if (!dr) continue;
      if (dr.crocheteT > game.time) continue;
      if (ferme && dr.open && !game.insideBuilding(k)) { dr.open = 0; }
      dr.locked = !dr.open;
    }
  },

  // ------------------------------------------------------------------ l'écriteau, le coffre
  ecriteau(k) {
    const M = this.M(k), L = this.S(), B = L && L.baux[k];
    if (!M) return;
    const titre = M.nom.charAt(0).toUpperCase() + M.nom.slice(1);
    if (!B) {
      const Z = L && L.saisies[k];
      ui.choice(`À louer — ${titre}`, `${M.desc}\n\n${M.loyer} pièces la semaine (douze jours), payables d’avance. S’adresser à la mairie, ou glisser la somme dans la fente de l’écriteau : la commune passe la relever.`, [
        { label: `Louer pour une semaine (${M.loyer} pièces)`, fn: () => {
          ui.close(true);
          if (Z && Z.dette > 0) { ui.subtitle('', `(Sous l’écriteau, un papier à votre nom : « Dette de ${Z.dette} pièces. Voir le maire. »)`, 4); return; }
          const r = this.louer(k);
          if (r === 'pauvre') ui.subtitle('', `(Vous n’avez pas ${M.loyer} pièces.)`, 2.5);
          else if (r === 'ok') ui.subtitle('', `(Les pièces tombent dans la fente. Derrière l’écriteau, pendue à un clou, une clé. ${titre} est à vous pour douze jours.)`, 5);
        } },
        { label: 'Pas maintenant', fn: () => ui.close() },
      ]);
      return;
    }
    const s = farm.s, du = B.du;
    const opts = [];
    if (du > 0) opts.push({ label: `Payer le loyer dû (${du} pièces)`, fn: () => { ui.close(true); const r = this.payer(k); ui.subtitle('', r === 'pauvre' ? `(Vous n’avez pas ${du} pièces.)` : '(Les pièces tombent dans la fente. Vous voilà quitte.)', 3); } });
    else opts.push({ label: `Payer une semaine d’avance (${M.loyer} pièces)`, fn: () => { ui.close(true); const r = this.payer(k); ui.subtitle('', r === 'pauvre' ? `(Vous n’avez pas ${M.loyer} pièces.)` : `(Douze jours de plus. Prochaine échéance : ${this.jourNom(B.echeance)}.)`, 3.5); } });
    opts.push({ label: 'Rendre les clés (fin du bail)', fn: () => this.confirmerRendre(k) });
    opts.push({ label: 'Refermer', fn: () => ui.close() });
    ui.choice(`${titre} — louée`, `Vous êtes locataire depuis le ${this.jourNom(B.debut)}. ${du > 0 ? `Loyer dû : ${du} pièces${B.rappel ? ' (rappel reçu)' : ''}.` : `Loyer réglé jusqu’au ${this.jourNom(B.echeance)}.`}`, opts);
  },
  confirmerRendre(k) {
    const M = this.M(k), B = this.bail(k);
    if (!B) return;
    const n = Object.keys(B.coffre).filter((id) => B.coffre[id] > 0).length;
    ui.choice('Rendre les clés', `Le bail de ${M.nom} prendra fin aujourd’hui. La semaine commencée n’est pas remboursée.${n ? ' Vous reprendrez ce qu’il y a dans le coffre.' : ''}`, [
      { label: 'Rendre les clés', fn: () => { ui.close(true); const r = this.rendre(k); ui.subtitle('', Array.isArray(r) ? `(Vous reprenez vos affaires : ${r.join(', ')}. La clé retourne à la mairie.)` : '(La clé retourne à la mairie.)', 4); } },
      { label: 'Garder la maison', fn: () => ui.close() },
    ]);
  },
  coffre(q) {
    const k = q.data && q.data.loc, M = this.M(k), B = this.bail(k);
    if (!M) return false;
    if (B) { sound.lootOpen && sound.lootOpen(); ui.openStore('Coffre — ' + M.court, B.coffre, 'chest'); return true; }
    const opts = [{ label: 'Laisser', fn: () => ui.close() }];
    if (typeof crochetage !== 'undefined' && crochetage.tenter) opts.unshift({ label: 'Crocheter le cadenas', fn: async () => {
      ui.close(true);
      const ok = await crochetage.tenter({ difficulte: 2, bruit: 0.5, x: q.x, z: q.z, proprietaire: null, titre: 'Le cadenas du coffre' });
      if (ok) ui.subtitle('', '(Le cadenas cède. Le coffre est vide : on ne laisse rien dans une maison à louer.)', 4);
    } });
    ui.choice('Un coffre cerclé de fer', 'Fermé d’un cadenas neuf. Il appartient à la commune, comme la maison.', opts);
    return true;
  },
};

// ---------------------------------------------------------------- l'écriteau, le coffre, le maire
HOOKS.inter.louer = (it) => locations.ecriteau(it.data && it.data.maison);
HOOKS.propPre.coffre_loc = (q) => locations.coffre(q);
PROP_USE_MORE.coffre_loc = 1;
{
  const _opts = talk.options.bind(talk);
  talk.options = function () {
    const opts = _opts();
    try {
      const n = this.n;
      if (n && n.d.id === 'maire' && farm.s && Object.keys(LOC_MAISONS).some((k) => locations.existe(k))) {
        const i = opts.findIndex((o) => o.act === 'bye');
        opts.splice(i >= 0 ? i : opts.length, 0, { label: 'Les maisons à louer', act: 'loc:liste' });
      }
    } catch (e) { console.error(e); }
    return opts;
  };
  const _choose = talk.choose.bind(talk);
  talk.choose = function (act) {
    if (typeof act !== 'string' || !act.startsWith('loc:') || !this.n) return _choose(act);
    const [, cmd, k] = act.split(':'), M = LOC_MAISONS[k], L = locations.S();
    const retour = () => this.view(locations.texteMaire(), locations.optionsMaire());
    if (cmd === 'liste') return retour();
    if (cmd === 'louer') {
      const Z = L.saisies[k];
      if (Z && Z.dette > 0) return this.view(`Vous nous devez encore ${Z.dette} pièces pour ${M.nom}. Réglez d’abord, on verra ensuite.`, locations.optionsMaire());
      const r = locations.louer(k);
      if (r === 'pauvre') return this.view(`${M.loyer} pièces la semaine, d’avance. C’est la règle, et ce n’est pas moi qui l’ai faite. Enfin, si.`, locations.optionsMaire());
      if (r !== 'ok') return retour();
      return this.view(`Voici la clé de ${M.nom}. Le bail vous arrivera par la poste, en bonne et due forme. Ne perdez pas la clé : la serrure coûte plus cher que la maison.`, locations.optionsMaire());
    }
    if (cmd === 'payer') {
      const r = locations.payer(k);
      if (r === 'pauvre') return this.view('Il vous manque de quoi. Revenez quand votre bourse aura repris des couleurs.', locations.optionsMaire());
      return this.view(r === 'avance' ? 'Une semaine d’avance ? Si tout le monde faisait comme vous, j’aurais le temps de lire le journal.' : 'Voilà qui est réglé. La quittance suivra.', locations.optionsMaire());
    }
    if (cmd === 'rendre') {
      const r = locations.rendre(k);
      return this.view(`C’est noté. ${M.nom.charAt(0).toUpperCase() + M.nom.slice(1)} redevient libre.${Array.isArray(r) ? ' Vos affaires du coffre vous ont été rendues.' : ''}`, locations.optionsMaire());
    }
    if (cmd === 'saisie') {
      const Z = L.saisies[k], r = locations.recuperer(k);
      if (r === 'pauvre') return this.view(`La dette est de ${Z.dette} pièces. Pas une de moins.`, locations.optionsMaire());
      return this.view('Voilà vos affaires. Tout y est, je les ai comptées moi-même. Deux fois.', locations.optionsMaire());
    }
    return retour();
  };
}
Object.assign(locations, {
  texteMaire() {
    const L = this.S(), lignes = [];
    for (const k in LOC_MAISONS) {
      if (!this.existe(k)) continue;
      const M = LOC_MAISONS[k], B = L.baux[k], Z = L.saisies[k];
      if (B) lignes.push(`${M.nom.charAt(0).toUpperCase() + M.nom.slice(1)} : à vous${B.du > 0 ? `, ${B.du} pièces dues` : `, réglée jusqu’au ${this.jourNom(B.echeance)}`}.`);
      else lignes.push(`${M.nom.charAt(0).toUpperCase() + M.nom.slice(1)}, ${M.rue} : libre, ${M.loyer} pièces la semaine.${Z ? ` (Vos affaires y sont gardées : ${Z.dette} pièces de dette.)` : ''}`);
    }
    return 'La commune a trois maisons à louer, à la semaine de douze jours, payée d’avance. ' + lignes.join(' ');
  },
  optionsMaire() {
    const L = this.S(), o = [];
    for (const k in LOC_MAISONS) {
      if (!this.existe(k)) continue;
      const M = LOC_MAISONS[k], B = L.baux[k], Z = L.saisies[k];
      if (!B) o.push({ label: `Louer ${M.nom} (${M.loyer} pièces)`, act: 'loc:louer:' + k });
      else {
        o.push({ label: B.du > 0 ? `Payer le loyer de ${M.nom} (${B.du} pièces)` : `Payer une semaine d’avance pour ${M.nom} (${M.loyer} pièces)`, act: 'loc:payer:' + k });
        o.push({ label: `Rendre les clés de ${M.nom}`, act: 'loc:rendre:' + k });
      }
      if (Z) o.push({ label: `Reprendre mes affaires de ${M.nom} (${Z.dette} pièces)`, act: 'loc:saisie:' + k });
    }
    o.push({ label: 'Parlons d’autre chose', act: 'chat' });
    return o;
  },
});

// ---------------------------------------------------------------- branchements
HOOKS.day.push(() => { if (farm.s) locations.jour(); });
HOOKS.load.push(() => {
  locations.S();
  if (!game.world.locations) return;
  locations.appliquerPortes(true);
  if (game._m96) return;
  game._m96 = true;
  // la clé du locataire : la porte s'ouvre, et se referme à clé derrière lui
  const _ud = game.useDoor.bind(game);
  game.useDoor = function (dr) {
    const k = dr && dr.bld;
    if (k && LOC_MAISONS[k] && locations.locataire(k)) {
      if (dr.locked || !dr.open) { dr.locked = false; dr.open = 1; dr.playerClosed = false; sound.lock && sound.lock(false); sound.door(true); return; }
      dr.open = 0; dr.playerClosed = true; sound.door(false);
      if (!game.insideBuilding(k)) { dr.locked = true; setTimeout(() => sound.lock && sound.lock(true), 250); }
      return;
    }
    return _ud(dr);
  };
  // les maisons à louer restent fermées à clé (pas seulement la nuit)
  const _doors = npcs.updateDoors.bind(npcs);
  npcs.updateDoors = function (w, instant) {
    _doors(w, instant);
    if (!farm.s || strange.redNight()) return;
    for (const k in LOC_MAISONS) {
      const dr = locations.porte(k);
      if (!dr || dr.crocheteT > game.time) continue;
      if (!locations.locataire(k) && dr.open && !this.someoneInDoor(dr) && !game.insideBuilding(k)) dr.open = 0;
      dr.locked = !dr.open;
      if (instant) dr.a = dr.open ? 1.5 : 0;
    }
  };
});
