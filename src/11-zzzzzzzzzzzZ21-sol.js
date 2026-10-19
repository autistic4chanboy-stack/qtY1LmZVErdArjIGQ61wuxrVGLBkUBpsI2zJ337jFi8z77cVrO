// ============================================================================
//  LE GARDE-SOL : passé sous la carte, on est remis là où l'on était avant
//  « si on passe en dessous de la map remettre à l'endroit avant non glitch »
//  - on retient, au fil du jeu, les dernières places sûres (les pieds posés, ou à
//    la nage) : une toutes les 0,4 s, les douze dernières ;
//  - passé sous la carte : en chute sous la surface du sol, sans rien dessous
//    qui porte (on tomberait sans fin), depuis plus de 0,8 s ; plus bas que mille
//    mètres ; ou une position qui n'est plus un nombre — on est remis à la dernière place sûre
//    d'au moins une seconde avant la chute (celle d'où l'on a glissé est souvent
//    la place même du défaut), sans dégâts de chute ;
//  - un saut de plus de trente mètres d'une image à l'autre (un voyage, un réveil,
//    une porte vers un autre monde) ou un autre monde : on oublie les places
//    d'avant, elles ne valent plus ;
//  - rien pendant une scène, en vol, endormi, en mourant, dans un menu.
//  API : garde_sol.remettre() (remettre maintenant), garde_sol.places (les places).
// ============================================================================

const GARDE_SOL = { pas: 0.4, garde: 12, chute: 0.8, avant: 1, saut: 30, fond: -1000 };

const garde_sol = {
  places: [],          // { pos, yaw, t } (t : l'horloge du garde-sol, en secondes de jeu)
  t: 0, pasT: 0, chuteT: 0, chuteDebut: 0, der: null, sig: null, remis: 0,

  // le monde où l'on est (un autre monde : les places d'avant ne valent plus)
  signature() {
    let m = '';
    try { if (typeof mondes !== 'undefined' && mondes.actuel) m = String(mondes.actuel() || ''); } catch (e) { /* rien */ }
    const z = typeof zone !== 'undefined' && zone.dedans ? 'z' : '';
    return m + '|' + z;
  },
  oublier() { this.places.length = 0; this.chuteT = 0; },
  tenu() {
    const p = game.player;
    return game.mode !== 'play' || !game.started || game.dying || game.sleeping || !p || p.fly
      || (typeof cine !== 'undefined' && cine.on) || (typeof h17Cine !== 'undefined' && h17Cine.on)
      || (typeof camLibre !== 'undefined' && camLibre.on) || (typeof corps !== 'undefined' && corps.hisse);
  },

  update(dt) {
    const p = game.player, w = game.world;
    if (!p || !w) return;
    this.t += dt;
    const pos = p.pos;
    // une position qui n'est plus un nombre : on remet tout de suite
    if (!(Number.isFinite(pos[0]) && Number.isFinite(pos[1]) && Number.isFinite(pos[2]))) { this.remettre(); return; }
    const sig = this.signature();
    if (sig !== this.sig) { this.sig = sig; this.oublier(); }
    // un saut d'une image à l'autre : un voyage, pas une chute
    if (this.der && Math.hypot(pos[0] - this.der[0], pos[1] - this.der[1], pos[2] - this.der[2]) > GARDE_SOL.saut) this.oublier();
    this.der = this.der || [0, 0, 0];
    this.der[0] = pos[0]; this.der[1] = pos[1]; this.der[2] = pos[2];
    if (this.tenu()) { this.chuteT = 0; return; }

    // les places sûres
    if (p.onGround || p.swimming) {
      this.chuteT = 0;
      if ((this.pasT -= dt) <= 0) {
        this.pasT = GARDE_SOL.pas;
        this.places.push({ pos: pos.slice(), yaw: p.yaw, t: this.t });
        if (this.places.length > GARDE_SOL.garde) this.places.shift();
      }
      return;
    }
    // en l'air : sous la carte ? (au Dessous, le monde d'en bas : souterrain.avecMonde)
    if (pos[1] < GARDE_SOL.fond) { this.remettre(); return; }
    const avec = (fn) => (typeof souterrain !== 'undefined' && souterrain.avecMonde ? souterrain.avecMonde(fn) : fn());
    const sous = avec(() => pos[1] < game.world.heightAt(pos[0], pos[2]) - 2);
    if (!sous || p.vel[1] >= 0) { this.chuteT = 0; return; }
    if (this.chuteT === 0) this.chuteDebut = this.t;
    this.chuteT += dt;
    if (this.chuteT < GARDE_SOL.chute) return;
    // (rien dessous qui porte : sinon, c'est une vraie chute qui finira sur ce sol)
    let porte = -1e9;
    try { porte = avec(() => game.world.groundAt(pos[0], pos[2], pos[1], 0)); } catch (e) { /* rien */ }
    if (porte > -1e8) return;
    this.remettre();
  },

  // remettre à la dernière place sûre d'au moins une seconde avant la chute (sinon la plus ancienne), sans dégâts
  remettre() {
    const p = game.player, w = game.world;
    if (!p || !w) return false;
    const limite = (this.chuteT > 0 ? this.chuteDebut : this.t) - GARDE_SOL.avant;
    let P = null;
    for (let i = this.places.length - 1; i >= 0; i--) if (this.places[i].t <= limite) { P = this.places[i]; break; }
    if (!P) P = this.places[0] || null;
    // (remis deux fois de suite à la même place en peu de temps : la place même est en cause, on prend la plus ancienne)
    if (P && this.remis > 1 && this.places[0]) P = this.places[0];
    let dest;
    if (P) dest = P.pos.slice();
    else {
      // aucune place : sur le sol de la vallée, là où l'on est (ou au point de départ)
      const x = Number.isFinite(p.pos[0]) ? p.pos[0] : w.spawn.x, z = Number.isFinite(p.pos[2]) ? p.pos[2] : w.spawn.z;
      dest = [x, Math.max(w.heightAt(x, z), w.waterLevel ?? -1e9) + 0.5, z];
    }
    p.pos = dest; p.vel = [0, 0, 0]; p.onGround = false; p.fallSpeed = 0;
    if (P && Number.isFinite(P.yaw)) p.yaw = P.yaw;
    this.der = dest.slice();
    this.chuteT = 0;
    this.remis++;
    setTimeout(() => { this.remis = Math.max(0, this.remis - 1); }, 10000);
    try { if (typeof sound !== 'undefined' && sound.land) sound.land(0.3); } catch (e) { /* rien */ }
    return true;
  },
};

// après le pas du joueur (HOOKS.update suit play.update), dans la vallée comme dans la Zone
{
  const f = (dt) => garde_sol.update(dt);
  f.zone = true;
  HOOKS.update.push(f);
}
