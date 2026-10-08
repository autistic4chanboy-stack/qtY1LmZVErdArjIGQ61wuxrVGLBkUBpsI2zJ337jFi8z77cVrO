// Équilibrage — la bibliothèque, seconde partie (agent Y, quatorzième vague)
//  - LES LIVRES NOUVEAUX : au moins quarante, chacun un vrai texte (titre, auteur, présentation, trois pages au moins,
//    des pages pleines), rangés sur un rayon qui existe ; des objets « livre_<id> » à emprunter (prix 0, jamais vendus),
//    sauf l'Enfer (lu sur place, dans la salle des archives) et le livre creux ; au comptoir, rangés par rayons, au prix
//    des autres livres de la bibliothèque ; sur les étagères (en bas, à la galerie), chacun à une seule place ;
//  - LA TYPOGRAPHIE : apostrophes et guillemets français, pas d'espace double, pas de page vide ;
//  - LA CLÉ : objet de quête, prix 0, que personne n'achète ni ne vend ; la question du bibliothécaire a sa réponse
//    écrite dans le livre qu'elle désigne ; un prêt rendu à l'heure ne coûte rien (la caution revient), un prêt en retard
//    coûte la caution, une clé perdue revient dans son livre au bout de deux jours ; une clé prise sans prêt est inscrite
//    au registre (trois jours ; un seul si l'on a été pris) — mesuré avec les vraies fonctions (bibliotheque2.*).
'use strict';
module.exports = {
  titre: 'La bibliothèque : les livres nouveaux et la clé de la Grande Porte (Y)',
  async verifier(J, log) {
    let echecs = 0;
    const ko = (m) => { echecs++; log('ÉCHEC : ' + m); };
    const G = (code) => JSON.parse(J.ev(code));
    // ---------------------------------------------------------------- les livres
    const L = G(`JSON.stringify(Y2_LIVRES.map((id) => { const L = LIVRES[id], it = ITEMS['livre_' + id]; return { id, titre: L.titre, auteur: L.auteur, col: L.col, desc: L.desc, rayon: L.rayon, enfer: !!L.enfer, creux: !!L.creux, serrures: !!L.serrures, biblio: !!L.biblio, pages: (L.pages || []).map((p) => ({ t: p.titre, x: p.texte })), item: it ? { price: it.price, cat: it.cat, book: it.book, biblio: !!it.biblio } : null }; }))`);
    const R = G('JSON.stringify(Y2_RAYONS)');
    const vrais = L.filter((b) => !b.creux);
    log(`${L.length} livres nouveaux (${vrais.length} à lire, et le livre creux) ; ${L.reduce((a, b) => a + b.pages.length, 0)} pages, ${L.reduce((a, b) => a + b.pages.reduce((c, p) => c + (p.x || '').length, 0), 0)} signes`);
    const par = {};
    for (const b of L) par[b.rayon] = (par[b.rayon] || 0) + 1;
    log('  par rayon : ' + Object.entries(par).map(([r, n]) => `${R[r] ? R[r].nom : r} ${n}`).join(', '));
    if (vrais.length < 40) ko(`seulement ${vrais.length} livres à lire (40 au moins)`);
    const ids = new Set();
    let court = null, long = 0, moy = 0;
    for (const b of L) {
      if (ids.has(b.id)) ko('id en double : ' + b.id); ids.add(b.id);
      if (!/^y_[a-z0-9_]+$/.test(b.id)) ko('id mal formé : ' + b.id);
      if (!b.titre || !b.auteur || !b.desc) ko(`${b.id} : titre, auteur ou présentation manquant`);
      if (!/^#[0-9a-f]{6}$/i.test(b.col || '')) ko(`${b.id} : couleur de reliure invalide`);
      if (!R[b.rayon]) ko(`${b.id} : rayon inconnu (${b.rayon})`);
      if (b.enfer !== (b.rayon === 'enfer')) ko(`${b.id} : l’Enfer et son rayon ne s’accordent pas`);
      if (b.pages.length < 3) ko(`${b.id} : ${b.pages.length} pages (trois au moins)`);
      const pleines = b.creux ? b.pages.slice(0, -1) : b.pages;
      const n = pleines.reduce((a, p) => a + (p.x || '').length, 0);
      moy += n;
      if (!court || n < court[1]) court = [b.id, n];
      long = Math.max(long, n);
      if (n < (b.creux ? 500 : 1000)) ko(`${b.id} : ${n} signes seulement`);
      for (const p of pleines) {
        if (!p.t) ko(`${b.id} : une page sans titre`);
        if ((p.x || '').length < 150) ko(`${b.id} : page « ${p.t} » trop courte (${(p.x || '').length} signes)`);
      }
      // la typographie : apostrophes et guillemets français, pas d'espace double, des guillemets appariés
      for (const s of [b.titre, b.auteur, b.desc].concat(b.pages.map((p) => p.t), b.pages.map((p) => p.x))) {
        if (!s) continue;
        if (/'/.test(s)) ko(`${b.id} : apostrophe droite dans « ${s.slice(0, 50)} »`);
        if (/"/.test(s)) ko(`${b.id} : guillemet droit dans « ${s.slice(0, 50)} »`);
        if (/ {2}/.test(s)) ko(`${b.id} : espace double dans « ${s.slice(0, 50)} »`);
        if (/\b(TODO|XXX)\b/.test(s)) ko(`${b.id} : un texte provisoire`);
        if ((s.match(/«/g) || []).length !== (s.match(/»/g) || []).length) ko(`${b.id} : guillemets « » non appariés dans « ${s.slice(0, 60)} »`);
      }
      // l'objet
      if (b.enfer || b.creux) { if (b.item) ko(`${b.id} : l’Enfer et le livre creux ne sont pas des objets`); if (b.biblio) ko(`${b.id} : ne doit pas être au comptoir`); }
      else if (!b.item) ko(`${b.id} : pas d’objet livre_${b.id}`);
      else if (b.item.price !== 0 || b.item.cat !== 'livre' || b.item.book !== b.id || !b.item.biblio || !b.biblio) ko(`${b.id} : objet mal défini (${JSON.stringify(b.item)})`);
    }
    log(`  le plus court : ${court[0]} (${court[1]} signes) ; le plus long : ${long} signes ; moyenne ${Math.round(moy / L.length)} signes`);
    const creux = L.filter((b) => b.creux);
    if (creux.length !== 1 || creux[0].id !== G('JSON.stringify(Y2_CREUX)')) ko('il faut un seul livre creux, Y2_CREUX');
    const serr = G('JSON.stringify(bibliotheque2.serrures())');
    log(`  livres de serrurerie (compétence de U) : ${serr.join(', ')}`);
    if (serr.length < 2) ko('trop peu de livres de serrurerie');
    // ---------------------------------------------------------------- personne ne les vend ni ne les achète
    const commerce = G(`JSON.stringify((() => { const out = []; for (const d of NPC_DATA) { const S = d.shop; if (!S) continue; for (const [id] of S.sells || []) if (/^livre_y_/.test(id) || id === Y2_CLE) out.push(d.id + ' vend ' + id); for (const id of S.buys || []) if (/^livre_y_/.test(id) || id === Y2_CLE) out.push(d.id + ' achète ' + id); } return out; })())`);
    if (commerce.length) ko('commerce : ' + commerce.join(', '));
    // ---------------------------------------------------------------- le comptoir, les étagères
    const cat = G(`JSON.stringify(biblio.catalogue().map((e) => ({ item: e.item, livre: e.livre || null, genre: e.genre, rayon: e.rayon || null, prix: [1, 3, 7].map((j) => biblio.prix(e, j)) })))`);
    const nomsR = new Set(Object.values(R).map((r) => r.nom));
    const autres = cat.filter((e) => !nomsR.has(e.genre));
    if (autres.length) ko('au comptoir, des livres hors des rayons : ' + autres.map((e) => e.item + ' (' + e.genre + ')').join(', '));
    const auComptoir = new Set(cat.map((e) => e.livre).filter(Boolean));
    for (const b of L) {
      if (!(b.enfer || b.creux) && !auComptoir.has(b.id)) ko(`${b.id} n’est pas au comptoir`);
      if ((b.enfer || b.creux) && auComptoir.has(b.id)) ko(`${b.id} ne devrait pas être prêté`);
    }
    const ordre = G('JSON.stringify(Y2_RAYONS_ORDRE)');
    for (let i = 1; i < cat.length; i++) if (ordre.indexOf(cat[i].rayon) < ordre.indexOf(cat[i - 1].rayon)) { ko('le comptoir n’est pas rangé par rayons'); break; }
    const prixY = cat.filter((e) => e.livre && /^y_/.test(e.livre)).map((e) => e.prix);
    const prixA = cat.filter((e) => e.livre && !/^y_/.test(e.livre) && !G(`JSON.stringify(!!(LIVRES[${JSON.stringify(e.livre)}].langue || LIVRES[${JSON.stringify(e.livre)}].secret || LIVRES[${JSON.stringify(e.livre)}].carte))`)).map((e) => e.prix);
    log(`  au comptoir : ${cat.length} titres ; prix d’un livre nouveau (1 / 3 / 7 jours) : ${prixY[0].join(' / ')} pièces (les livres d’avant : ${prixA[0].join(' / ')})`);
    if (prixY.some((p) => p.join() !== prixA[0].join())) ko('les livres nouveaux ne coûtent pas comme ceux d’avant');
    const et = G(`JSON.stringify({ bas: bibliotheque2.contenu('bas'), galerie: bibliotheque2.contenu('galerie'), tout: bibliotheque2.contenu('tout') })`);
    const place = {};
    for (const k of ['bas', 'galerie']) for (const [r, li] of et[k]) for (const id of li) { if (place[id]) ko(`${id} sur deux étagères`); place[id] = k + ':' + r; }
    for (const b of L) if (!b.enfer && !place[b.id]) ko(`${b.id} n’est sur aucune étagère`);
    if (place[G('JSON.stringify(Y2_CREUX)')] !== 'galerie:traites') ko('le livre creux n’est pas à la galerie, parmi les traités');
    log(`  étagères : en bas ${et.bas.map(([r, l]) => R[r].nom + ' ' + l.length).join(', ')} ; à la galerie ${et.galerie.map(([r, l]) => R[r].nom + ' ' + l.length).join(', ')} ; l’Enfer ${L.filter((b) => b.enfer).length}`);
    // ---------------------------------------------------------------- la clé
    const cle = G('JSON.stringify(ITEMS[Y2_CLE] || null)');
    if (!cle) ko('pas d’objet cle_grande_porte');
    else { log(`la clé : « ${cle.name} », ${cle.cat}, prix ${cle.price}`); if (cle.cat !== 'quete' || cle.price !== 0 || !cle.unique) ko('la clé doit être un objet de quête unique, sans prix'); }
    const Q = G('JSON.stringify(Y2_QUESTIONS)');
    for (const q of Q) {
      const b = L.find((x) => x.id === q.livre);
      if (!b) { ko('question sans livre : ' + q.livre); continue; }
      if (b.enfer) ko(`la réponse à « ${q.q} » est dans l’Enfer`);
      const texte = b.pages.map((p) => p.x).join(' ');
      const rep = q.rep[0].replace(/[«»]/g, '').trim().replace(/\.$/, '');
      const cles = rep.split(/[:,]/).map((s) => s.trim()).filter((s) => s.length > 6);
      if (!cles.every((c) => texte.toLowerCase().includes(c.toLowerCase()))) ko(`la réponse « ${rep} » n’est pas écrite dans ${q.livre}`);
      if (new Set(q.rep).size !== q.rep.length) ko('réponses en double : ' + q.q);
    }
    log(`  ${Q.length} questions du bibliothécaire, chacune avec sa réponse dans un livre du comptoir`);
    // les prêts, les vols, les pertes : les vraies fonctions, un faux bibliothécaire
    const S = G(`JSON.stringify((() => {
      const sub0 = ui.subtitle, mail0 = farm.mail, ami0 = npcs.addAmitie, by0 = npcs.byId, lev0 = npcs.level;
      const lettres = [];
      ui.subtitle = () => {}; npcs.addAmitie = () => {}; npcs.level = () => 6;
      farm.mail = (de, t) => lettres.push(t);
      npcs.byId = { libraire: { id: 'libraire', name: 'Anatole', d: { surname: 'Morand' }, st: { alive: true }, x: 0, z: 0, y: 0 } };
      const r = {};
      try {
        farm.s = farm.blank(1234);
        const H = (h) => { farm.s.hours = h; farm.s.day = Math.floor((h - 6) / 24) + 1; };
        H(100);
        const B2 = bibliotheque2, Bb = biblio.S();
        Bb.lecteur = 3;
        const m0 = farm.s.money;
        r.peut = B2.peutPreter();
        r.pret = B2.preter(3); r.due3 = B2.C().due - farm.s.hours; r.paye = m0 - farm.s.money; r.registre = Bb.prets.some((p) => p.id === Y2_CLE);
        H(farm.s.hours + 10); B2.rendre({}); r.retour = farm.s.money - m0; r.apres = B2.C().ou;
        B2.preter(7); r.due7 = B2.C().due - farm.s.hours; H(B2.C().due + 1); B2.rendre({}); r.retard = farm.s.money - m0; r.plusPret = !!B2.C().plusPret;
        B2.C().plusPret = 0; farm.s.money = m0;
        B2.preter(3); farm.take(Y2_CLE, 1); B2.verifierCle(false); r.perdue = B2.C().ou; const h0 = farm.s.hours;
        H(h0 + 47); B2.verifierCle(false); r.a47 = B2.C().ou;
        H(h0 + 48.5); B2.verifierCle(false); r.a48 = B2.C().ou; r.perte = farm.s.money - m0; r.plusPret2 = !!B2.C().plusPret; r.registre2 = Bb.prets.some((p) => p.id === Y2_CLE);
        B2.sortir('vol'); r.vol = B2.C().due - farm.s.hours; B2.rendre({ boite: true }); r.volRendu = B2.C().ou;
        B2.sortir('vol', { pris: true }); r.pris = B2.C().due - farm.s.hours; B2.rendre({ livre: true });
        r.lettres = lettres;
      } finally { ui.subtitle = sub0; farm.mail = mail0; npcs.addAmitie = ami0; npcs.byId = by0; npcs.level = lev0; farm.s = null; }
      return r;
    })())`);
    log(`  prêt : ${S.pret}, caution ${S.paye} pièces, ${S.due3.toFixed(1)} h (trois jours) ou ${S.due7.toFixed(1)} h (sept) jusqu’à l’échéance (sept heures du soir) ; rendue à l’heure : bilan ${S.retour} pièce(s) ; en retard : bilan ${S.retard} pièces, plus de prêt : ${S.plusPret}`);
    log(`  perdue : « ${S.perdue} », encore perdue à 47 h, rentrée à 48 h (« ${S.a48} ») ; bilan ${S.perte} pièces ; plus de prêt : ${S.plusPret2} ; lettres : ${S.lettres.join(' / ')}`);
    log(`  prise sans prêt : ${S.vol.toFixed(1)} h pour la rapporter ; prise sur le fait : ${S.pris.toFixed(1)} h`);
    if (!S.peut || S.pret !== 'ok' || !S.registre) ko('le prêt ne se fait pas');
    if (S.paye !== 150) ko('caution de trois jours : ' + S.paye);
    if (S.retour !== 0 || S.apres !== 'livre') ko('un prêt rendu à l’heure doit tout rendre');
    if (S.retard !== -300 || !S.plusPret) ko('un prêt de sept jours rendu en retard doit coûter la caution (300) et la confiance');
    if (S.perdue !== 'perdue' || S.a47 !== 'perdue' || S.a48 !== 'livre' || S.perte !== -150 || !S.plusPret2 || S.registre2) ko('la clé perdue ne revient pas comme il faut');
    // (les échéances tombent à sept heures du soir : « trois jours » font de 2 j 13 h à 3 j 13 h selon l'heure de l'emprunt)
    if (!(S.due3 > 60 && S.due3 <= 85) || !(S.due7 > 156 && S.due7 <= 181)) ko('échéances des prêts');
    if (!(S.vol > 60 && S.vol <= 85) || !(S.pris > 12 && S.pris <= 37) || S.volRendu !== 'livre') ko('la clé prise sans prêt');
    return { echecs };
  },
};
