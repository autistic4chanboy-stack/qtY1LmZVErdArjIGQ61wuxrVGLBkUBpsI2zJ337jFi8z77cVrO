// ============================================================================
//  LA DISCRÉTION (agent V1) — l'œil, en haut de l'écran
//  Rien quand personne ne s'inquiète. Une paupière mi-close quand quelque chose
//  a entendu ou entrevu ; l'œil ouvert, cerclé de rouge sombre, quand on vous a
//  vu ; il regarde de côté quand on vous cherche. Petit, à demi transparent.
// ============================================================================
const oeilV1 = {
  el: null, k: 0, cible: 0, etat: 'tranquille',
  creer() {
    if (this.el) return this.el;
    const st = document.createElement('style');
    st.textContent = `#v1-oeil{position:fixed;left:50%;top:14px;width:46px;height:24px;margin-left:-23px;pointer-events:none;z-index:40;opacity:0;transition:opacity .35s}
#v1-oeil svg{width:100%;height:100%;display:block}
#v1-oeil.on{opacity:.78}`;
    document.head.appendChild(st);
    const d = document.createElement('div');
    d.id = 'v1-oeil';
    d.innerHTML = `<svg viewBox="-24 -12 48 24"><path id="v1-oeil-blanc" d="M-20 0 Q0 -11 20 0 Q0 11 -20 0Z" fill="#d8d0c0" stroke="#2a221c" stroke-width="1.6"/><circle id="v1-oeil-iris" r="5.2" fill="#3a2a22"/><circle id="v1-oeil-pup" r="2.2" fill="#0a0806"/><path id="v1-oeil-paup" d="" fill="#1c1612"/></svg>`;
    document.body.appendChild(d);
    this.el = d;
    return d;
  },
  // k : 0 (rien) … 1 (intrigué, mi-clos) … 1,5 (cherche) … 2 (alerté, grand ouvert)
  montrer(k, etat) {
    this.cible = k; this.etat = etat;
    if (!this.el && k <= 0) return;
    const el = this.creer();
    this.k += (this.cible - this.k) * 0.18;
    if (Math.abs(this.cible - this.k) < 0.01) this.k = this.cible;
    const on = this.k > 0.04 && game.mode === 'play' && !ui.panel;
    el.classList.toggle('on', on);
    if (!on) return;
    // la paupière : du haut, elle couvre ce qui n'est pas ouvert
    const ouv = clamp(this.k / 2, 0, 1), haut = -11 + (1 - ouv) * 17;
    el.querySelector('#v1-oeil-paup').setAttribute('d', `M-22 -13 L22 -13 L22 0 Q0 ${(haut * 2).toFixed(1)} -22 0Z`);
    const regard = etat === 'cherche' ? Math.sin(game.time * 2.2) * 8 : 0;
    el.querySelector('#v1-oeil-iris').setAttribute('cx', regard.toFixed(1));
    el.querySelector('#v1-oeil-pup').setAttribute('cx', regard.toFixed(1));
    el.querySelector('#v1-oeil-iris').setAttribute('fill', etat === 'alertee' ? '#6a1a12' : '#3a2a22');
    el.querySelector('#v1-oeil-blanc').setAttribute('stroke', etat === 'alertee' ? '#7a1810' : '#2a221c');
  },
};
