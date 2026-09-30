// ============================================================================
//  LE GEL, LÀ-HAUT
//  Au-dessus de la limite des neiges, la nuit ou dans la tourmente, sans feu ni
//  toit, on ne perd plus sa vie par à-coups : on gèle, petit à petit. Le givre
//  gagne l'écran depuis les bords, la vue pâlit et bleuit ; un quart d'heure
//  (quinze minutes réelles) de grand froid, et le givre a tout pris : on meurt.
//  Au chaud (un feu, un toit, la potion de chaleur), le givre recule vite ;
//  redescendu, ou au jour revenu, il fond lentement.
//  État : farm.s.gel = { k: 0 … 1 } (gardé avec la partie : on ne se réchauffe
//  pas en rechargeant). API : gel (k(), geler(dt), degeler(dt, chaud)).
// ============================================================================
const GEL_DUREE = 900;      // secondes réelles de grand froid, du premier givre à la fin
const GEL_FONTE_CHAUD = 60; // au feu, sous un toit : une minute pour tout faire fondre
const GEL_FONTE_DOUX = 240; // hors du grand froid : quatre minutes

const gel = {
  el: null, vu: -1,
  S() { const s = farm.s; if (!s.gel || typeof s.gel !== 'object' || !isFinite(s.gel.k)) s.gel = { k: 0 }; return s.gel; },
  k() { return farm.s ? this.S().k : 0; },
  geler(dt) {
    if (!farm.s || game.dying || farm.s.over || game.sleeping || (typeof cine !== 'undefined' && cine.on)) return;
    const G = this.S(), avant = G.k;
    G.k = Math.min(1, G.k + dt / GEL_DUREE);
    if (avant < 0.02 && G.k >= 0.02 && G.dit !== farm.s.day) { G.dit = farm.s.day; ui.subtitle('', '(Le froid vous mord les doigts.)', 3.5); }
    if (avant < 0.6 && G.k >= 0.6) ui.subtitle('', '(Vous ne sentez plus vos doigts.)', 3.5);
    if (G.k >= 1) this.mourir();
  },
  degeler(dt, chaud) {
    if (!farm.s) return;
    const G = this.S();
    if (G.k > 0) G.k = Math.max(0, G.k - dt / (chaud ? GEL_FONTE_CHAUD : GEL_FONTE_DOUX));
  },
  mourir() {
    const G = this.S(), p = game.player, pn = typeof strange !== 'undefined' && strange.placeName ? strange.placeName(p.pos) : '';
    game.die('Mort de froid' + (pn ? ' — ' + pn : ' en montagne'));
    // (une mort empêchée — un objet, une grâce — laisse un peu de répit)
    if (!game.dying && !farm.s.over) G.k = Math.min(G.k, 0.85);
  },
  // ---------------------------------------------------------------- le givre à l'écran
  dessiner(cv) {
    const W = cv.width, H = cv.height, g = cv.getContext('2d'), R = mulberry32(7331), m = Math.min(W, H);
    g.clearRect(0, 0, W, H);
    // un voile blanc, laiteux, qui s'épaissit vers les bords
    const v = g.createRadialGradient(W / 2, H / 2, m * 0.25, W / 2, H / 2, Math.hypot(W, H) * 0.55);
    v.addColorStop(0, 'rgba(228,238,248,0)'); v.addColorStop(0.55, 'rgba(228,238,248,0.18)'); v.addColorStop(1, 'rgba(240,246,252,0.62)');
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    // des fougères de glace : une tige presque droite, des barbes serrées à soixante degrés, de plus en plus courtes
    const fougere = (x, y, a, L, prof) => {
      const pas = 3 + R() * 2, n = Math.max(2, (L / pas) | 0);
      let px = x, py = y;
      g.beginPath(); g.moveTo(px, py);
      const barbes = [];
      for (let i = 0; i < n; i++) {
        a += (R() - 0.5) * 0.1;
        px += Math.cos(a) * pas; py += Math.sin(a) * pas;
        g.lineTo(px, py);
        const reste = 1 - i / n;
        if (prof < 2 && i > 1 && R() < 0.8) barbes.push([px, py, a + (i % 2 ? 1 : -1) * (1 + (R() - 0.5) * 0.2), L * 0.32 * reste * (0.6 + R() * 0.5)]);
      }
      g.stroke();
      for (const [bx, by, ba, bl] of barbes) if (bl > 2.5) fougere(bx, by, ba, bl, prof + 1);
    };
    const passe = (lueur) => {
      const Rs = mulberry32(911);
      g.lineCap = 'round';
      for (let i = 0; i < 230; i++) {
        const cote = (Rs() * 4) | 0, u = Rs();
        const [x, y, a] = cote === 0 ? [u * W, 0, Math.PI / 2] : cote === 1 ? [u * W, H, -Math.PI / 2] : cote === 2 ? [0, u * H, 0] : [W, u * H, Math.PI];
        const L = m * (0.04 + Math.pow(Rs(), 1.8) * 0.26);
        g.lineWidth = lueur ? 3.2 : 0.6 + Rs() * 0.7;
        g.strokeStyle = lueur ? 'rgba(235,244,255,0.07)' : `rgba(246,250,255,${0.3 + Rs() * 0.35})`;
        fougere(x, y, a + (Rs() - 0.5) * 1.3, L, 0);
      }
    };
    passe(true); passe(false);
    // des étoiles de givre semées, plus serrées vers les bords
    for (let i = 0; i < 700; i++) {
      const x = R() * W, y = R() * H, d = Math.min(x, y, W - x, H - y) / m;
      if (R() < d * 2.4) continue;
      const r = 1 + R() * 2.2, al = 0.25 + R() * 0.4;
      g.strokeStyle = `rgba(248,252,255,${al})`; g.lineWidth = 0.6;
      g.beginPath();
      for (let k = 0; k < 3; k++) { const b = k * Math.PI / 3 + R() * 0.2; g.moveTo(x - Math.cos(b) * r, y - Math.sin(b) * r); g.lineTo(x + Math.cos(b) * r, y + Math.sin(b) * r); }
      g.stroke();
    }
  },
  dom() {
    if (typeof document === 'undefined' || !document.body) return;
    const k = game.mode === 'play' && farm.s && !farm.s.over ? this.k() : 0;
    if (!this.el) {
      if (k <= 0.005) return;
      const cv = document.createElement('canvas');
      cv.id = 'gel-givre';
      cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:2;display:none';
      document.body.appendChild(cv);
      this.el = cv;
    }
    const cv = this.el, W = Math.min(1280, window.innerWidth || 800), H = Math.round(W * (window.innerHeight || 600) / (window.innerWidth || 800));
    if (k <= 0.005) { if (this.vu !== 0) { this.vu = 0; cv.style.display = 'none'; } return; }
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; try { this.dessiner(cv); } catch (e) { console.error('gel', e); } }
    const q = Math.round(k * 400) / 400;
    if (q === this.vu) return;
    this.vu = q;
    cv.style.display = 'block';
    // le givre avance des bords vers le centre ; à la fin, il couvre tout
    // (lent d'abord, puis la vue se ferme vite à la fin)
    const r = Math.max(0, 100 - 102 * Math.pow(q, 1.35));
    const masque = `radial-gradient(ellipse 72% 72% at 50% 50%, transparent ${r.toFixed(1)}%, #000 ${(r + 22).toFixed(1)}%)`;
    cv.style.webkitMaskImage = masque; cv.style.maskImage = masque;
    cv.style.opacity = Math.min(1, q * 4).toFixed(3);
  },
};

HOOKS.update.push(() => gel.dom());
// la vue pâlit et bleuit ; tout au bout, elle se ferme
HOOKS.fx.push((fx, tint) => {
  const k = gel.k();
  if (k <= 0.02) return;
  const a = 0.32 * Math.pow(k, 1.6);
  if (a > tint[3]) { tint[0] = 0.78; tint[1] = 0.87; tint[2] = 1; tint[3] = a; }
  if (k > 0.8) fx[0] = Math.max(fx[0], (k - 0.8) * 2.5);
});
