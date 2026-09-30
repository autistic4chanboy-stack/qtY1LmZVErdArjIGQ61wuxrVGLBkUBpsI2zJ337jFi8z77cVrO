// ============================================================================
//  LA LANTERNE ET SON HUILE
//  - Une lanterne pleine brûle DIX MINUTES réelles au plus (la moitié d'une
//    nuit), puis s'éteint. Dans la dernière minute, la flamme baisse et crachote.
//  - On la RECHARGE : une fiole d'huile à lampe (la forge, le colporteur ;
//    l'huile de tournesol fait aussi l'affaire) la remplit ; une bougie posée
//    dedans la fait tenir cinq minutes. Clic droit, la lanterne en main ; ou
//    d'elle-même quand on la rallume vide et qu'on a de quoi.
//  - La lanterne légendaire de l'aube n'a pas besoin d'huile.
//  État : farm.s.lanterne = { huile: secondes de flamme qui restent (≤ 600) }.
//  API : lanterne (MAX, S(), reste(), pleine(), recharger(auto), cotes()).
// ============================================================================

const LANTERNE_MAX = 600; // dix minutes réelles : la moitié d'une nuit
// ce qui la recharge, et pour combien de secondes de flamme
const LANTERNE_COMBUSTIBLES = [['huile_lampe', LANTERNE_MAX], ['huile', LANTERNE_MAX], ['bougie', LANTERNE_MAX / 2]];

defItem('huile_lampe', 'Huile à lampe', 'materiau', 2, ['bouteille', '#e8d890'], { desc: 'Une fiole d’huile de colza, bouchée à la cire : de quoi remplir la lanterne. Dix minutes de flamme.' });
ITEMS.lanterne.desc = 'Clic : l’allumer ou l’éteindre. Pleine, elle brûle dix minutes ; clic droit pour la recharger (huile à lampe, huile de tournesol, ou une bougie).';
{
  const vend = (id, lignes) => { const d = NPC_DATA.concat(typeof NPC_NEW !== 'undefined' ? NPC_NEW : []).find((q) => q.id === id); if (d && d.shop && d.shop.sells) for (const l of lignes) if (!d.shop.sells.some(([k]) => k === l[0])) d.shop.sells.push(l); };
  vend('forgeron', [['huile_lampe', 6]]);
  vend('colporteur', [['huile_lampe', 5]]);
  vend('colporteuse', [['huile_lampe', 5]]);
}

const lanterne = {
  MAX: LANTERNE_MAX,
  S() { const s = farm.s; if (!s.lanterne || typeof s.lanterne.huile !== 'number') s.lanterne = { huile: LANTERNE_MAX }; return s.lanterne; },
  reste() { return this.S().huile; },
  pleine() { return this.S().huile >= LANTERNE_MAX - 1; },
  // (la lanterne ordinaire est allumée : la légendaire de l'aube, elle, brûle sans huile)
  allumee() { return !!(game.lantern && farm.count('lanterne')); },
  // recharger avec ce qu'on a (le meilleur d'abord) ; auto : en la rallumant, sans bruit de trop
  recharger(auto) {
    const S = this.S();
    if (S.huile >= LANTERNE_MAX - 1) { if (!auto) ui.subtitle('', '(La lanterne est pleine.)', 2); return false; }
    for (const [id, sec] of LANTERNE_COMBUSTIBLES) {
      // (une bougie ne vaut la peine que si la lanterne est presque vide)
      if (id === 'bougie' && S.huile > LANTERNE_MAX - sec) continue;
      if (!farm.count(id) || !farm.take(id, 1)) continue;
      S.huile = Math.min(LANTERNE_MAX, S.huile + sec);
      sound.pop && sound.pop();
      ui.subtitle('', id === 'bougie' ? '(Vous glissez une bougie dans la lanterne. Cinq minutes de lumière.)' : '(Vous remplissez la lanterne d’huile. Dix minutes de flamme.)', 3);
      this.bas = false;
      return true;
    }
    if (!auto) ui.subtitle('', '(Plus d’huile, ni de bougie. La forge et le colporteur vendent de l’huile à lampe.)', 3.5);
    return false;
  },
  // la flamme brûle : le temps réel qui passe, en jeu (pas en pause ni dans le sommeil)
  update(dt) {
    if (!farm.s || game.kind !== 'farm') return;
    const S = this.S();
    if (this.eteinte > 0) { this.eteinte -= dt; if (this.eteinte <= 0 && this.relancer) { game.lantern = true; this.relancer = false; } return; }
    if (!this.allumee() || game.sleeping || game.dying || game.mode !== 'play') return;
    S.huile = Math.max(0, S.huile - dt);
    if (S.huile <= 0) {
      game.lantern = false;
      sound.click && sound.click();
      ui.subtitle('', '(La lanterne s’éteint. Plus une goutte d’huile.)', 3.5);
      return;
    }
    if (S.huile < 60 && !this.bas) { this.bas = true; ui.subtitle('', '(La flamme baisse. Il reste peu d’huile.)', 3); }
    // la dernière minute : la flamme crachote, s'éteint un instant et reprend
    if (S.huile < 60 && Math.random() < dt * (S.huile < 20 ? 1.6 : 0.5)) { game.lantern = false; this.eteinte = 0.06 + Math.random() * 0.12; this.relancer = true; }
  },
};

HOOKS.load.push(() => {
  lanterne.S(); lanterne.bas = lanterne.S().huile < 60; lanterne.eteinte = 0; lanterne.relancer = false;
  if (game.__lanterneHuile) return;
  game.__lanterneHuile = true;
  // rallumer une lanterne vide : on la recharge si l'on a de quoi, sinon elle reste éteinte
  const _tog = game.toggleLantern.bind(game);
  game.toggleLantern = function () {
    if (!this.lantern && farm.count('lanterne') && lanterne.reste() <= 0 && !lanterne.recharger(true)) {
      sound.click(); ui.subtitle('', '(La lanterne est vide. Il faudrait de l’huile à lampe, ou une bougie.)', 3); return;
    }
    lanterne.relancer = false; lanterne.eteinte = 0;
    const r = _tog();
    if (this.lantern && lanterne.reste() < 60) ui.subtitle('', '(La mèche prend. Il reste peu d’huile.)', 2.5);
    return r;
  };
});
HOOKS.update.push((dt) => lanterne.update(dt));
// clic droit, la lanterne en main : la recharger
HOOKS.secondary.push((eye, basis, it, id) => { if (id !== 'lanterne') return false; lanterne.recharger(false); return true; });
