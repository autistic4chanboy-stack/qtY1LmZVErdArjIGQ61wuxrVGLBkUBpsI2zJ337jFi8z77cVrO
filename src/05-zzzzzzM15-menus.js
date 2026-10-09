// ============================================================================
//  LE MENU EN JEU (agent M15) : le registre des pages du menu Tab.
//  Quatre onglets (Sacoche, Atelier, Carnet, Wiki) ; dans chacun, des pages.
//  Une page = une valeur de ui.satTab : les emballages de ui.renderSatchel qui
//  testent « this.satTab === 'carnet' » continuent de marcher tels quels.
//  Ce fichier ne touche pas au DOM : on peut appeler menus.page(...) de partout,
//  dès le chargement. La mise en page : 12-zzzzzzM15-menus.js.
// ============================================================================
const menus = {
  ONGLETS: [['sac', 'Sacoche'], ['atelier', 'Atelier'], ['carnet', 'Carnet'], ['wiki', 'Wiki']],
  pages: {},
  marques: {},
  // une page : { id, onglet, titre, ordre, visible?, rendre?, apres? } (rendre absent : le corps d'origine)
  page(P) {
    if (!P || !P.id) return;
    const v = this.pages[P.id] || {};
    this.pages[P.id] = Object.assign(v, P);
    if (!this.pages[P.id].onglet) this.pages[P.id].onglet = 'sac';
    if (this.pages[P.id].ordre === undefined) this.pages[P.id].ordre = 50;
  },
  vis(p) { try { return !p.visible || !!p.visible(); } catch (e) { return false; } },
  // les pages visibles d'un onglet, dans l'ordre
  liste(o) { return Object.values(this.pages).filter((p) => p.onglet === o && this.vis(p)).sort((a, b) => a.ordre - b.ordre); },
  ongletDe(id) { const p = this.pages[id]; return p ? p.onglet : 'sac'; },
  marque(id, n) { if (n) this.marques[id] = n; else delete this.marques[id]; },
  // ce qui suit est complété par 12-zzzzzzM15-menus.js
  ouvrir(id) { if (typeof ui !== 'undefined') ui.openSatchel(id); },
  rafraichir() { if (typeof ui !== 'undefined' && ui.panel === '#satchel') ui.renderSatchel(); },
};
// les pages d'origine (leur corps vient de ui.renderSatchel et de ses emballages)
menus.page({ id: 'sac', onglet: 'sac', titre: 'Objets', ordre: 10 });
menus.page({ id: 'lettres', onglet: 'sac', titre: 'Lettres', ordre: 20 });
menus.page({ id: 'tresors', onglet: 'sac', titre: 'Trésors', ordre: 30, visible: () => typeof legendaires !== 'undefined' && farm.s && legendaires.list().length > 0 });
menus.page({ id: 'fab', onglet: 'atelier', titre: 'Établi', ordre: 10 });
menus.page({ id: 'grimoire', onglet: 'atelier', titre: 'Grimoire', ordre: 20 });
menus.page({ id: 'carnet', onglet: 'carnet', titre: 'Quêtes', ordre: 10 });
menus.page({ id: 'legendes', onglet: 'carnet', titre: 'Légendes', ordre: 20 });
menus.page({ id: 'langues', onglet: 'carnet', titre: 'Langues', ordre: 30 });
