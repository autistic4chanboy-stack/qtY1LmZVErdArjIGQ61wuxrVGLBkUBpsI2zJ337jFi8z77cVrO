// ============================================================================
//  LE COMPLEXE DE LA FONDATION (agent L) — dans une partie sur cent vingt
//  seulement (tiré de la graine, forçable pour les essais).
//  La Fondation, ce sont des humains VENUS DU FUTUR pour étudier, à leur source,
//  les bizarreries de la vallée (l'Envers, les nuits rouges, les Trois, le
//  Dormeur, le libraire, les géants…). Ils ont creusé sous la lande un poste
//  avancé : sas, couloirs, cellules de confinement, terminaux lumineux,
//  laboratoire, dortoir, archives et la salle de la machine temporelle. On y
//  entre par une dalle, dans une cabane de pierres sèches en ruine. Les dossiers
//  de confinement (façon SCP) se lisent sur place. Quelques chercheurs en tenue
//  de protection vous évitent, ou vous reconduisent en surface.
//  (La Fondation SCP est une création collective sous licence CC BY-SA 3.0 :
//  https://scp-wiki.wikidot.com — les textes ci-dessous sont originaux.)
//  API : fondation (presente, forcer, S, dossiers, ouvrirTerminal…)
//  Sauvegarde : farm.s.fondation
// ============================================================================

Object.assign(LIEU_NAMES, { fondation: 'le poste avancé VAL-7', fondation_entree: 'la cabane de pierres sèches' });
ITEM_CAT_NAMES.futur = 'Objets d’un autre temps';
defItem('lampe_torche', 'Lampe électrique', 'futur', 0, ['fd_lampe', '#d8dce0'], { desc: 'Clic : l’allumer ou l’éteindre. Une lumière blanche, dure, qui ne tremble pas. Pas de flamme, pas d’huile : on ne sait pas ce qui brûle dedans.' });
defItem('badge_fondation', 'Badge d’accès VAL-7', 'quete', 0, ['fd_badge', '#e8e8e0'], { desc: 'Une carte rigide, glacée, avec un portrait qui n’est pas le vôtre et un œil de verre doré. « VAL-7 — NIVEAU 2 ».' });
defItem('amnesique', 'Amnésique de classe A', 'futur', 0, ['fd_seringue', '#9ad8e8'], { desc: 'Clic : l’injecter. On oublie. Quoi, exactement ? C’est la question.' });
defItem('ration_fondation', 'Ration de survie', 'futur', 0, ['fd_ration', '#8a9a6a'], { food: 60, heal: 15, desc: 'Une brique grise dans un papier qui brille. Elle a le goût de rien, et elle nourrit comme trois repas.' });
defItem('trousse_fondation', 'Trousse de soins', 'futur', 0, ['fd_trousse', '#e8e8e8'], { desc: 'Clic : se soigner. Des bandes qui collent toutes seules, une aiguille sans fil, un flacon qui ne pique pas.' });
defItem('compteur_kant', 'Compteur de Kant', 'futur', 0, ['fd_kant', '#d0b040'], { desc: 'Clic : mesurer. L’aiguille indique où la réalité est la plus mince, et le boîtier grésille d’autant plus fort.' });
defItem('combinaison', 'Combinaison de protection', 'futur', 0, ['fd_combi', '#d8b020'], { desc: 'Clic : l’enfiler ou l’ôter. Jaune, épaisse, avec une vitre devant le visage. Dans le complexe, on vous prendra pour l’un des leurs — de loin. Elle amortit les coups.' });
{
  const _ip = iconPaint;
  iconPaint = function (shape, c1, c2) {
    if (typeof shape !== 'string' || !shape.startsWith('fd_')) return _ip(shape, c1, c2);
    const pb = new PixelBuf(16, 16);
    const R = (x0, y0, x1, y1, c, a) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) pb.set(x, y, typeof c === 'string' ? hexToRgb(c) : c, a); };
    const L = (x0, y0, x1, y1, c, w) => drawLine(pb, x0, y0, x1, y1, typeof c === 'string' ? hexToRgb(c) : c, w || 1);
    switch (shape) {
      case 'fd_lampe': R(3, 6, 10, 10, '#3a3e44'); R(10, 5, 13, 11, '#8a9098'); R(13, 5, 14, 11, [230, 245, 255], EMISSIVE_A); R(5, 7, 7, 7, '#c8a030'); break;
      case 'fd_badge': R(3, 3, 12, 13, '#e8e8e0'); R(4, 4, 8, 9, '#8a8e96'); R(5, 5, 7, 7, '#c8b8a0'); L(9, 5, 11, 5, '#3a3e44'); L(9, 7, 11, 7, '#3a3e44'); R(4, 11, 11, 12, '#b02020'); pb.set(10, 10, [240, 200, 60], EMISSIVE_A); break;
      case 'fd_seringue': L(2, 13, 11, 4, '#e0f0f4', 2); L(3, 12, 10, 5, [120, 220, 240]); L(11, 4, 14, 1, '#9aa0a8'); L(1, 14, 3, 12, '#6a6e76', 2); break;
      case 'fd_ration': R(3, 5, 12, 11, '#b8c0c8'); R(4, 6, 11, 10, '#7a8a5a'); L(3, 8, 12, 8, '#d8dce0'); break;
      case 'fd_trousse': R(2, 4, 13, 12, '#e8e8e8'); R(7, 5, 8, 11, '#c02020'); R(4, 7, 11, 8, '#c02020'); L(6, 3, 9, 3, '#8a8a8a'); break;
      case 'fd_kant': R(3, 3, 12, 13, '#3a3530'); R(4, 4, 11, 9, '#e8e0c0'); L(7, 9, 10, 5, '#b02020'); pb.set(5, 11, [255, 80, 60], EMISSIVE_A); pb.set(8, 11, [255, 200, 60], EMISSIVE_A); R(12, 1, 13, 4, '#8a8a8a'); break;
      case 'fd_combi': R(5, 2, 10, 5, '#d8b020'); R(6, 3, 9, 4, [40, 70, 80], EMISSIVE_A); R(4, 6, 11, 11, '#d8b020'); R(2, 6, 3, 11, '#c8a018'); R(12, 6, 13, 11, '#c8a018'); R(4, 12, 6, 15, '#c8a018'); R(9, 12, 11, 15, '#c8a018'); R(7, 7, 8, 9, '#2a2c30'); break;
      default: return _ip(shape, c1, c2);
    }
    edgeDarken(pb, 0.85);
    return pb;
  };
}

// ---------------------------------------------------------------- les modèles (boîtes)
const PCF = { beton: rgbf('#8a8c8e'), metal: rgbf('#6e747c'), clair: rgbf('#c8ccd0'), sombre: rgbf('#2a2c30'), jaune: rgbf('#d8b020'), noir: [0.05, 0.05, 0.06] };
Object.assign(PROP_MODELS, {
  fond_neon(E) { E.bx(0, 0.05, 0, 1.5, 0.05, 0.26, PCF.metal, TL.metal); E.fl = FX_EMIT; E.bx(0, 0, 0, 1.4, 0.05, 0.16, [1.3, 1.34, 1.4], TL.plain); E.fl = 0; },
  fond_terminal(E, o, t) {
    E.bx(0, 0, 0, 1.2, 0.74, 0.62, PCF.clair, TL.metal); E.bx(0, 0.74, 0, 1.26, 0.04, 0.68, PCF.sombre, TL.metal);
    E.bx(0, 0.78, -0.14, 0.64, 0.46, 0.26, PCF.sombre, TL.metal); E.bx(0, 0.78, -0.25, 0.3, 0.3, 0.12, PCF.sombre, TL.metal);
    E.fl = FX_EMIT; E.box(0, 1.01, -0.005, 0.54, 0.36, 0.012, [0.28, 1.0, 0.55], TL.paper); E.fl = 0;
    E.bx(0, 0.78, 0.14, 0.52, 0.025, 0.16, PCF.noir, 0); E.bx(0.38, 0.78, 0.14, 0.08, 0.02, 0.12, PCF.noir, 0);
  },
  fond_bureau(E) {
    E.bx(0, 0, 0, 3.2, 0.9, 0.7, PCF.clair, TL.metal); E.bx(-1.9, 0, -0.9, 0.7, 0.9, 2.4, PCF.clair, TL.metal); E.bx(1.9, 0, -0.9, 0.7, 0.9, 2.4, PCF.clair, TL.metal);
    E.bx(0, 0.9, 0, 3.3, 0.05, 0.78, PCF.sombre, TL.metal);
    for (const x of [-0.8, 0.8]) { E.bx(x, 0.95, -0.1, 0.56, 0.4, 0.2, PCF.sombre, TL.metal); E.fl = FX_EMIT; E.box(x, 1.15, 0.005, 0.48, 0.32, 0.012, [0.3, 0.75, 1.1], TL.paper); E.fl = 0; }
  },
  fond_logo(E) {
    E.bx(0, 0, 0, 1.9, 1.9, 0.06, PCF.sombre, TL.metal);
    const c = [0.95, 0.95, 0.93];
    for (let k = 0; k < 20; k++) { const a = k / 20 * TAU; E.box(Math.cos(a) * 0.62, 0.95 + Math.sin(a) * 0.62, 0.05, 0.2, 0.08, 0.02, c, TL.plain, 0, 0, a + Math.PI / 2); }
    for (let k = 0; k < 20; k++) { const a = k / 20 * TAU; E.box(Math.cos(a) * 0.22, 0.95 + Math.sin(a) * 0.22, 0.05, 0.07, 0.05, 0.02, c, TL.plain, 0, 0, a + Math.PI / 2); }
    for (let k = 0; k < 3; k++) { const a = Math.PI / 2 + k * TAU / 3; E.box(Math.cos(a) * 0.52, 0.95 + Math.sin(a) * 0.52, 0.05, 0.08, 0.34, 0.02, c, TL.plain, 0, 0, a + Math.PI / 2); E.box(Math.cos(a) * 0.36, 0.95 + Math.sin(a) * 0.36, 0.05, 0.2, 0.08, 0.02, c, TL.plain, 0, 0, a); }
  },
  fond_casier(E) { E.bx(0, 0, 0, 0.9, 1.95, 0.55, PCF.metal, TL.metal); E.bx(-0.225, 0.05, 0.28, 0.42, 1.85, 0.01, rgbf('#5a6068'), TL.metal); E.bx(0.225, 0.05, 0.28, 0.42, 1.85, 0.01, rgbf('#5a6068'), TL.metal); for (const x of [-0.05, 0.05]) E.bx(x, 1.0, 0.29, 0.02, 0.2, 0.02, PCF.clair, TL.metal); for (let k = 0; k < 4; k++) { E.bx(-0.225, 1.6 + k * 0.05, 0.29, 0.3, 0.015, 0.01, PCF.noir, 0); E.bx(0.225, 1.6 + k * 0.05, 0.29, 0.3, 0.015, 0.01, PCF.noir, 0); } },
  fond_paillasse(E) {
    E.bx(0, 0, 0, 2.2, 0.88, 0.8, PCF.clair, TL.metal); E.bx(0, 0.88, 0, 2.26, 0.05, 0.86, PCF.noir, TL.metal);
    E.fl = FX_EMIT;
    const cols = [[0.3, 1.0, 0.6], [1.0, 0.3, 0.3], [0.5, 0.6, 1.2], [1.1, 0.9, 0.3], [0.8, 0.4, 1.1]];
    for (let k = 0; k < 5; k++) E.bx(-0.8 + k * 0.32, 0.93, -0.1 + (k % 2) * 0.2, 0.08, 0.16 + (k % 3) * 0.05, 0.08, cols[k], TL.glass);
    E.fl = 0;
    E.bx(0.7, 0.93, -0.15, 0.3, 0.42, 0.25, PCF.sombre, TL.metal); E.bx(0.7, 1.2, 0.02, 0.06, 0.2, 0.06, PCF.clair, TL.metal);
  },
  fond_cuve(E, o, t) {
    E.bx(0, 0, 0, 1.2, 0.3, 1.2, PCF.metal, TL.metal); E.bx(0, 2.1, 0, 1.2, 0.2, 1.2, PCF.metal, TL.metal);
    for (const [x, z] of [[-0.56, -0.56], [0.56, -0.56], [-0.56, 0.56], [0.56, 0.56]]) E.bx(x, 0.3, z, 0.08, 1.8, 0.08, PCF.metal, TL.metal);
    E.fl = FX_EMIT; E.bx(0, 0.3, 0, 1.0, 1.6, 1.0, [0.55, 0.06, 0.08], TL.glass); E.fl = 0;
    const r = o.data && o.data.main;
    if (r) { E.box(0.05, 1.1, 0, 0.12, 0.34, 0.06, [0.95, 0.95, 0.92], TL.skin, 0.4, 0, 0.3); for (let k = 0; k < 4; k++) E.box(-0.05 + k * 0.04, 1.35, 0, 0.02, 0.2, 0.02, [0.95, 0.95, 0.92], TL.skin, 0.4, 0, 0.3); }
  },
  fond_anneau(E, o, t) {
    const T = t ? t.t : 0, act = fondation.machineT > 0 ? 1 : 0, sp = act ? 3.5 : 0.25;
    E.bx(0, 0, 0, 2.4, 0.5, 1.6, PCF.metal, TL.metal); E.bx(0, 0, 0, 7.6, 0.25, 2.2, PCF.sombre, TL.metal);
    for (const s of [-1, 1]) E.bx(s * 3.35, 0, 0, 0.7, 3.4, 1.0, PCF.metal, TL.metal);
    const R = 3.1, cy = 3.6;
    for (let k = 0; k < 28; k++) { const a = k / 28 * TAU; E.box(Math.cos(a) * R, cy + Math.sin(a) * R, 0, 0.75, 0.42, 0.9, k % 7 === 0 ? PCF.jaune : PCF.clair, TL.metal, 0, 0, a + Math.PI / 2); }
    E.fl = FX_EMIT;
    for (let k = 0; k < 14; k++) { const a = k / 14 * TAU + T * sp; E.box(Math.cos(a) * (R - 0.45), cy + Math.sin(a) * (R - 0.45), 0, 0.16, 0.16, 0.95, [0.4, 0.8, 1.3], TL.plain, 0, 0, a); }
    const k = 0.6 + Math.sin(T * (act ? 14 : 2)) * 0.2 + act * 0.8;
    E.box(0, cy, 0, 0.5 + act * 0.8, 0.5 + act * 0.8, 0.5 + act * 0.8, [0.5 * k, 0.9 * k, 1.4 * k], TL.plain, T * 0.7, T * 0.5, 0);
    E.fl = 0;
  },
  fond_console(E, o, t) {
    const T = t ? t.t : 0;
    E.box(0, 0.5, 0, 2.6, 1.0, 0.9, PCF.clair, TL.metal, 0, 0.2, 0); E.bx(0, 1.02, -0.3, 2.6, 0.7, 0.2, PCF.sombre, TL.metal);
    E.fl = FX_EMIT;
    for (const x of [-0.85, 0, 0.85]) E.box(x, 1.36, -0.19, 0.7, 0.44, 0.012, x ? [0.3, 0.8, 1.2] : [1.1, 0.8, 0.3], TL.paper);
    for (let k = 0; k < 10; k++) E.box(-1.1 + k * 0.24, 1.02, 0.22, 0.06, 0.03, 0.06, (Math.floor(T * 3 + k * 1.7) % 3) ? [0.2, 0.9, 0.3] : [1.2, 0.2, 0.15], 0, 0, 0.2, 0);
    E.fl = 0;
  },
  fond_socle(E) { E.bx(0, 0, 0, 0.5, 1.05, 0.5, PCF.sombre, TL.metal); E.bx(0, 1.05, 0, 0.6, 0.06, 0.6, PCF.clair, TL.metal); },
  fond_armoire(E, o, t) {
    const T = t ? t.t : 0;
    E.bx(0, 0, 0, 1.0, 2.1, 0.6, PCF.sombre, TL.metal); E.bx(0, 0.05, 0.3, 0.9, 2.0, 0.01, rgbf('#3a3e44'), TL.metal);
    E.fl = FX_EMIT;
    for (let k = 0; k < 8; k++) E.bx(-0.3 + (k % 4) * 0.2, 1.5 + ((k / 4) | 0) * 0.15, 0.31, 0.05, 0.05, 0.01, (Math.floor(T * 2 + k * 2.3) % 4) ? [0.2, 1.0, 0.3] : [1.2, 0.5, 0.1], 0);
    E.fl = 0;
  },
  fond_lit(E) {
    for (const [x, z] of [[-0.9, -0.42], [0.9, -0.42], [-0.9, 0.42], [0.9, 0.42]]) E.bx(x, 0, z, 0.06, 1.8, 0.06, PCF.metal, TL.metal);
    for (const y of [0.35, 1.35]) { E.bx(0, y, 0, 1.9, 0.08, 0.9, PCF.metal, TL.metal); E.bx(0, y + 0.08, 0, 1.8, 0.14, 0.82, rgbf('#6a7488'), TL.blanket); E.bx(-0.72, y + 0.22, 0, 0.3, 0.08, 0.6, [0.9, 0.9, 0.9], TL.pillow); }
  },
  fond_porte(E) {
    E.bx(0, 0, 0, 1.64, 2.7, 0.3, PCF.metal, TL.metal);
    E.bx(0, 0.02, 0.16, 1.4, 2.5, 0.02, rgbf('#5a6068'), TL.metal);
    E.bx(0, 1.6, 0.175, 0.36, 0.26, 0.02, [0.06, 0.1, 0.12], TL.glass);
    for (let k = 0; k < 6; k++) E.box(-0.62 + k * 0.25, 0.12, 0.172, 0.12, 0.12, 0.012, k % 2 ? PCF.jaune : PCF.noir, 0, 0, 0, 0.78);
    E.bx(0.55, 1.1, 0.18, 0.08, 0.25, 0.04, PCF.clair, TL.metal);
  },
  fond_porte_ouverte(E) {
    E.bx(-0.95, 0, 0, 0.26, 2.7, 0.3, PCF.metal, TL.metal); E.bx(0.95, 0, 0, 0.26, 2.7, 0.3, PCF.metal, TL.metal);
    E.bx(-1.55, 0, -0.12, 1.4, 2.5, 0.08, rgbf('#5a6068'), TL.metal);
  },
  fond_plaque(E, o) {
    E.bx(0, 0, 0, 0.5, 0.36, 0.03, PCF.jaune, TL.plain); E.bx(0, 0.04, 0.016, 0.44, 0.28, 0.005, PCF.noir, 0);
    E.fl = FX_EMIT; for (let k = 0; k < 3; k++) E.bx(-0.08 + (k === 0 ? 0 : 0.02), 0.22 - k * 0.07, 0.02, k === 0 ? 0.3 : 0.34, 0.03, 0.004, [1.0, 0.85, 0.3], 0); E.fl = 0;
  },
  fond_vitrine(E, o, t) {
    E.bx(0, 0, 0, 0.9, 0.95, 0.9, PCF.sombre, TL.metal);
    E.fl = FX_EMIT;
    for (const [x, z] of [[-0.42, -0.42], [0.42, -0.42], [-0.42, 0.42], [0.42, 0.42]]) E.bx(x, 0.95, z, 0.04, 0.9, 0.04, [0.5, 0.8, 1.1], 0);
    E.bx(0, 1.85, 0, 0.9, 0.04, 0.9, [0.5, 0.8, 1.1], 0);
    E.fl = 0;
  },
  fond_classeur(E) { E.bx(0, 0, 0, 0.8, 1.4, 0.7, PCF.metal, TL.metal); for (let k = 0; k < 4; k++) { E.bx(0, 0.1 + k * 0.33, 0.351, 0.7, 0.28, 0.01, rgbf('#5a6068'), TL.metal); E.bx(0, 0.28 + k * 0.33, 0.36, 0.2, 0.03, 0.02, PCF.clair, TL.metal); } },
  fond_fragment(E) { E.bx(0, 0, 0, 1.0, 0.8, 1.0, PCF.sombre, TL.metal); E.box(0, 1.25, 0, 0.9, 0.9, 0.8, rgbf('#6a6660'), TL.stone, 0.4, 0.2, 0.3); E.box(0.2, 1.6, 0.1, 0.4, 0.4, 0.4, rgbf('#7a766e'), TL.stone, 1.1, 0.3, 0.1); },
  fond_sismo(E, o, t) {
    const T = t ? t.t : 0;
    E.bx(0, 0, 0, 0.8, 0.8, 0.5, PCF.clair, TL.metal); E.bx(0, 0.8, 0, 0.7, 0.05, 0.4, [0.92, 0.9, 0.84], TL.paper);
    E.box(0.05 + Math.sin(T * 9) * 0.04, 0.9, 0, 0.01, 0.12, 0.01, PCF.noir, 0);
  },
  fond_lutrin(E) { E.bx(0, 0, 0, 0.12, 1.05, 0.12, PCF.metal, TL.metal); E.box(0, 1.12, 0, 0.5, 0.04, 0.4, PCF.sombre, TL.metal, 0, -0.4); E.box(0, 1.18, 0.02, 0.44, 0.08, 0.32, rgbf('#5a2a24'), TL.leather, 0, -0.4); for (let k = 0; k < 6; k++) E.bx(0.2, 1.1 - k * 0.12, 0.1, 0.03, 0.08, 0.03, PCF.clair, TL.iron); },
  fond_puits(E) { for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; E.bx(Math.cos(a) * 0.8, 0, Math.sin(a) * 0.8, 0.55, 0.7, 0.35, PCF.beton, TL.stone, -a); } E.bx(0, 0.4, 0, 1.3, 0.05, 1.3, [0.02, 0.02, 0.03], 0); },
  fond_banc(E) { E.bx(0, 0.42, 0, 1.6, 0.06, 0.45, PCF.clair, TL.metal); for (const x of [-0.7, 0.7]) E.bx(x, 0, 0, 0.06, 0.42, 0.4, PCF.metal, TL.metal); },
  fond_douche(E) { E.bx(0, 0, 0, 0.2, 0.1, 0.2, PCF.metal, TL.metal); E.bx(0, -0.08, 0, 0.12, 0.08, 0.12, PCF.clair, TL.metal); },
  fond_tuyaux(E) { for (let k = 0; k < 3; k++) E.bx(0, k * 0.16, 0, 0.1, 0.1, 6, k === 1 ? PCF.jaune : PCF.metal, TL.metal); },
  fond_dalle(E, o) {
    const ouverte = o.data && o.data.ouverte;
    E.bx(0, -0.02, 0, 1.3, 0.16, 1.0, rgbf('#7a766e'), TL.stone);
    E.bx(0, 0.14, 0, 1.3, 0.005, 0.02, [0.12, 0.12, 0.12], 0);
    E.fl = FX_EMIT; E.bx(0.52, 0.141, 0.36, 0.08, 0.004, 0.08, [0.2, 0.9, 0.5], 0); E.fl = 0;
    if (ouverte) E.bx(0, 0.15, 0, 0.9, 0.02, 0.7, PCF.metal, TL.metal);
  },
});
DYN_PROPS.add('fond_anneau'); DYN_PROPS.add('fond_console'); DYN_PROPS.add('fond_armoire'); DYN_PROPS.add('fond_sismo');
Object.assign(PROP_COLL, {
  fond_terminal: [0.6, 0.32, 1.25], fond_bureau: [2.2, 1.6, 1.0], fond_casier: [0.45, 0.28, 1.95], fond_paillasse: [1.1, 0.42, 1.0], fond_cuve: [0.62, 0.62, 2.3],
  fond_anneau: [3.8, 1.1, 6.8], fond_console: [1.3, 0.5, 1.3], fond_socle: [0.3, 0.3, 1.1], fond_armoire: [0.5, 0.3, 2.1], fond_lit: [1.0, 0.48, 1.8],
  fond_porte: [0.82, 0.16, 2.7], fond_vitrine: [0.46, 0.46, 1.9], fond_classeur: [0.4, 0.36, 1.4], fond_fragment: [0.52, 0.52, 1.9], fond_sismo: [0.4, 0.26, 0.9],
  fond_lutrin: [0.26, 0.22, 1.2], fond_puits: [1.05, 1.05, 0.7], fond_banc: [0.8, 0.24, 0.5],
});
Object.assign(PROP_LIGHTS, {
  fond_neon: { c: [0.8, 0.88, 0.98], r: 11, y: -0.35 },
  fond_terminal: { c: [0.25, 0.8, 0.45], r: 3.2, y: 1.05 },
  fond_anneau: { c: [0.4, 0.75, 1.2], r: 16, y: 3.6 },
  fond_cuve: { c: [0.9, 0.15, 0.15], r: 4.5, y: 1.1 },
  fond_dalle: { c: [0.2, 0.8, 0.45], r: 2.4, y: 0.25, night: true },
  fond_vitrine: { c: [0.45, 0.7, 1.1], r: 3.5, y: 1.3 },
});

// ---------------------------------------------------------------- la génération (après tout le reste, dans ces parties seulement)
const FOND_CX = 176, FOND_CZ = 1540;
function addFondation(w, seed) {
  const rnd = mulberry32(((seed | 0) * 977 + 131) >>> 0), WL = w.waterLevel, H = (x, z) => w.heightAt(x, z);
  const B = new Builder(w, rnd, new Uint8Array(w.W * w.W));
  // ------------------------------------------------ la cabane de pierres sèches (l'entrée)
  const fm = w.farm && w.farm.f ? w.farm.f : { x: w.size / 2, z: w.size / 2 };
  let site = null;
  const libre = (x, z) => {
    for (const k in w.bld) { const b = w.bld[k]; if (Math.hypot(b.x - x, b.z - z) < 110) return false; }
    for (const k in w.lm) { const L = w.lm[k]; if (!L.under && Math.hypot(L.x - x, L.z - z) < Math.max(90, (L.r || 20) + 40)) return false; }
    for (const P of w.noBuild || []) if (Math.hypot(P.x - x, P.z - z) < P.r + 30) return false;
    for (let a = 0; a < 8; a++) { const m = w.matAt(x + Math.cos(a) * 14, z + Math.sin(a) * 14); if (m === M_DIRT || m === M_COBBLE) return false; }
    return true;
  };
  for (let k = 0; k < 600 && !site; k++) {
    const a = rnd() * TAU, d = 380 + rnd() * 650, x = fm.x + Math.cos(a) * d, z = fm.z + Math.sin(a) * d;
    if (!w.inside(x, z, 90) || H(x, z) < WL + 4 || w.normalAt(x, z)[1] < 0.9) continue;
    const m = milieuAt(w, x, z);
    if (!['lande', 'pres', 'alpage', 'rochers', 'combe'].includes(m)) continue;
    if (!libre(x, z)) continue;
    site = { x, z };
  }
  if (!site) site = { x: fm.x + 420, z: fm.z - 380 };
  const hy = H(site.x, site.z), hf = { x: site.x, y: hy, z: site.z, r: rnd() * TAU };
  B.flatten(hf.x, hf.z, 5, hy, 4);
  for (let i = 0; i < w.objects.length; i++) { const o = w.objects[i]; if (!o.gone && Math.abs(o.x - hf.x) < 6 && Math.abs(o.z - hf.z) < 6) { o.gone = true; o.cleared = true; } }
  B.block(hf, 0, -0.3, -1.9, 4.4, 1.9, 0.62, M_STONE); B.block(hf, -1.9, -0.3, 0, 0.62, 1.55, 3.2, M_STONE); B.block(hf, 1.9, -0.3, 0, 0.62, 1.95, 3.2, M_STONE);
  B.block(hf, -1.35, -0.3, 1.9, 1.7, 1.75, 0.62, M_STONE); B.block(hf, 1.55, -0.3, 1.9, 1.3, 1.25, 0.62, M_STONE);
  B.block(hf, 0.6, 1.6, -1.9, 1.6, 0.35, 0.62, M_MOSSY);
  B.propRel(hf, 'fond_dalle', 0.2, 0.02, -0.4, 0);
  B.interRel(hf, 'fond_trappe', 'fond_trappe', 0.2, 0.55, -0.4, 'Examiner la dalle', { prop: w.props.length - 1 });
  const [ox, oz] = B.toWorld(hf, 0, 3.4);
  const sortie = [ox, H(ox, oz) + 0.1, oz];
  // des traces de semelles étranges, un papier imprimé
  for (let k = 0; k < 4; k++) { const [x, z] = B.toWorld(hf, 0.3 + (k % 2) * 0.4, 3 + k * 0.8); B.prop('traces', x, H(x, z) + 0.01, z, hf.r); }
  const pa = rnd() * TAU, px = hf.x + Math.cos(pa) * 9, pz = hf.z + Math.sin(pa) * 9;
  B.prop('lettre', px, H(px, pz) + 0.02, pz, rnd() * TAU);
  B.inter('lire', 'fondation_papier', px, H(px, pz) + 0.3, pz, 'Ramasser le papier', { text: ['Un papier dans l’herbe', 'Un papier très blanc, très lisse, imprimé en lettres parfaites, plus fines qu’aucune presse d’ici ne sait en faire. La pluie ne l’a pas abîmé.\n\n« … RAPPEL À TOUT LE PERSONNEL : aucun matériel ne doit rester en surface. La dalle doit être refermée après chaque passage. Toute personne de l’époque aperçue à moins de cent mètres de l’accès doit être signalée… »\n\nLe reste est déchiré.', 'Au dos, un cercle, et trois flèches qui pointent vers le centre.'] });
  B.landmark('fondation_entree', hf.x, hf.z, 8, { secret: true });
  w.noBuild = w.noBuild || []; w.noBuild.push({ x: hf.x, z: hf.z, r: 14, why: 'la cabane de pierres sèches' });
  // ------------------------------------------------ le complexe, sous la lande de l'ouest
  const CX = FOND_CX, CZ = FOND_CZ;
  let mn = 1e9;
  for (let dz = -36; dz <= 38; dz += 5) for (let dx = -34; dx <= 54; dx += 5) mn = Math.min(mn, H(CX + dx, CZ + dz));
  const F = { x: CX, y: mn - 26, z: CZ, r: 0 }, Y = F.y;
  const n0 = w.blocks.length;
  // une salle : murs (portes : [[décalage, largeur]] par côté), sol, plafond ; « ouvert » : côtés sans mur
  const salle = (lx, lz, W, D, Hh, mur, sol, portes, ouvert) => {
    portes = portes || {}; ouvert = ouvert || {};
    B.block(F, lx, ouvert.n || ouvert.s || ouvert.e || ouvert.w ? -0.61 : -0.6, lz, W + 1, 0.6, D + 1, sol);
    B.block(F, lx, Hh, lz, W + 1, 0.8, D + 1, mur); w.blocks[w.blocks.length - 1].ceil = true;
    const mur1 = (cx, cz, len, alongX, gaps) => {
      const G = (gaps || []).slice().sort((a, b) => a[0] - b[0]);
      let s = -len / 2;
      const seg = (a, b) => { if (b - a < 0.05) return; const c = (a + b) / 2; B.block(F, cx + (alongX ? c : 0), 0, cz + (alongX ? 0 : c), alongX ? b - a : 0.8, Hh, alongX ? 0.8 : b - a, mur); };
      for (const [o, gw] of G) { seg(s, o - gw / 2); if (Hh > 2.72) B.block(F, cx + (alongX ? o : 0), 2.7, cz + (alongX ? 0 : o), alongX ? gw : 0.8, Hh - 2.7, alongX ? 0.8 : gw, mur); s = o + gw / 2; }
      seg(s, len / 2);
    };
    if (!ouvert.n) mur1(lx, lz - D / 2 - 0.4, W + 1.6, true, portes.n);
    if (!ouvert.s) mur1(lx, lz + D / 2 + 0.4, W + 1.6, true, portes.s);
    if (!ouvert.w) mur1(lx - W / 2 - 0.4, lz, D, false, portes.w);
    if (!ouvert.e) mur1(lx + W / 2 + 0.4, lz, D, false, portes.e);
  };
  const MC = M_CONCRETE;
  salle(0, 30, 8, 6, 3.4, MC, M_CONCRETE, { n: [[0, 2.4]] });                                        // le sas d'entrée
  salle(0, 22, 3.2, 9.2, 3.2, MC, M_CONCRETE, {}, { n: true, s: true });                            // couloir sud
  salle(0, 10.5, 14, 13, 3.8, MC, M_TILE, { s: [[0, 3.2]], n: [[0, 3.2]], w: [[0, 2.6]], e: [[0, 3.2]] }); // le hall de sécurité
  salle(0, -1.5, 3.2, 10.2, 3.2, MC, M_CONCRETE, {}, { n: true, s: true });                         // couloir nord
  salle(0, -18, 22, 22, 8, MC, M_METAL, { s: [[0, 3.2]] });                                         // la salle de la machine
  salle(-10.5, 10.5, 6.2, 2.6, 3.2, MC, M_CONCRETE, {}, { e: true, w: true });                      // couloir ouest
  salle(-21, 10.5, 14, 11, 3.6, MC, M_TILE, { e: [[0, 2.6]], n: [[0, 2.4]] });                      // le laboratoire
  salle(-21, 3.25, 2.4, 2.7, 3.0, MC, M_CONCRETE, {}, { n: true, s: true });                        // passage
  salle(-21, -2.5, 12, 8, 3.2, MC, M_CONCRETE, { s: [[0, 2.4]] });                                  // le dortoir
  const cellX = [11.5, 17.5, 23.5, 29.5];
  salle(22, 10.5, 29.2, 4, 3.4, MC, M_CONCRETE, { n: cellX.map((x) => [x - 22, 1.6]), s: cellX.map((x) => [x - 22, 1.6]) }, { e: true, w: true }); // couloir des cellules
  for (const x of cellX) { salle(x, 5.05, 4.6, 5.3, 3.2, MC, M_CONCRETE, {}, { s: true }); salle(x, 15.95, 4.6, 5.3, 3.2, MC, M_CONCRETE, {}, { n: true }); }
  salle(43, 10.5, 12, 12, 3.6, MC, M_TILE, { w: [[0, 3.2]] });                                      // les archives
  // la plateforme de la machine, les bandes de danger
  B.block(F, 0, 0, -20, 10, 0.25, 8, M_METAL);
  for (const [x, z, sx, sz] of [[0, -15.6, 10.4, 0.4], [0, -24.4, 10.4, 0.4], [-5.2, -20, 0.4, 8.4], [5.2, -20, 0.4, 8.4], [0, 27.4, 2.8, 0.4], [0, 16.2, 3.0, 0.3], [0, -6.2, 3.0, 0.3], [8.2, 10.5, 0.3, 3.0], [36.2, 10.5, 0.3, 3.0]]) B.block(F, x, 0, z, sx, 0.02, sz, M_HAZARD);
  for (let k = n0; k < w.blocks.length; k++) w.blocks[k].under = true;
  // ------------------------------------------------ l'aménagement
  const P = (id, lx, ly, lz, r, data) => B.propRel(F, id, lx, ly, lz, r || 0, data);
  const I = (kind, id, lx, ly, lz, name, data) => B.interRel(F, kind, id, lx, ly, lz, name, data);
  const neon = (lx, lz, Hh, r) => P('fond_neon', lx, Hh - 0.12, lz, r || 0);
  // le sas
  P('echelle', 0, 0, 32.65, Math.PI, { h: 3.4 }); I('ladder', 'fondation_sortie', 0, 1, 32.2, 'Remonter à la surface', { to: sortie });
  P('fond_plaque', -3.93, 1.5, 29.5, Math.PI / 2); I('fond_note', 'fondation_panneau', -3.4, 1.55, 29.5, 'Lire la plaque', { n: 'sas' });
  for (const [x, z] of [[-3, 28], [3, 28], [-3, 32], [3, 32]]) P('fond_douche', x, 3.3, z);
  neon(0, 30, 3.4); P('fond_tuyaux', 3.8, 2.6, 30, 0);
  neon(0, 19.5, 3.2); neon(0, 24.5, 3.2); P('fond_tuyaux', -1.45, 2.55, 22, 0);
  // le hall
  P('fond_bureau', 0, 0, 9.2, Math.PI); I('fond_terminal', 'fondation_term_accueil', 0, 1.25, 10.3, 'Consulter le terminal', { term: 'accueil' });
  P('fond_logo', -4.5, 0.9, 4.05, 0); P('fond_banc', -5, 0, 15.9, Math.PI); P('fond_banc', 5, 0, 15.9, Math.PI);
  P('fond_classeur', 6.4, 0, 5.2, -Math.PI / 2);
  for (const [x, z] of [[-3.5, 7], [3.5, 7], [-3.5, 14], [3.5, 14]]) neon(x, z, 3.8);
  // le couloir nord et la salle de la machine
  neon(0, -4, 3.2); neon(0, 1.5, 3.2); P('fond_tuyaux', 1.45, 2.55, -1.9, 0);
  P('fond_anneau', 0, 0.25, -20, 0);
  P('fond_console', 0, 0, -11.2, 0); I('fond_machine', 'fondation_machine', 0, 1.3, -10.6, 'La console de la machine', {});
  P('fond_socle', 3.2, 0, -11.6, 0); I('fond_chrono', 'fondation_chrono', 3.2, 1.25, -11.4, 'Une montre, posée sur un socle', {});
  for (const [x, z, r] of [[-10.5, -12, Math.PI / 2], [-10.5, -24, Math.PI / 2], [10.5, -12, -Math.PI / 2], [10.5, -24, -Math.PI / 2], [-4, -28.6, 0], [4, -28.6, 0]]) P('fond_armoire', x, 0, z, r);
  for (const [x, z] of [[-6, -10], [6, -10], [-6, -18], [6, -18], [-6, -26], [6, -26]]) neon(x, z, 8);
  for (let k = 0; k < 4; k++) B.block(F, -0.6 + k * 0.4, 0.26, -14, 0.14, 0.06, 5, M_DARK);
  // le couloir ouest, le laboratoire
  neon(-10.5, 10.5, 3.2, Math.PI / 2);
  P('fond_paillasse', -25, 0, 6.1, 0); P('fond_paillasse', -18.5, 0, 6.1, 0); P('fond_paillasse', -21, 0, 15.0, Math.PI);
  P('fond_cuve', -26.6, 0, 12.6, 0, { main: false }); P('fond_cuve', -26.6, 0, 9.4, 0, { main: true });
  P('fond_terminal', -15, 0, 14.5, -Math.PI / 2); I('fond_terminal', 'fondation_term_labo', -15.8, 1.25, 14.5, 'Consulter le terminal', { term: 'labo' });
  P('fond_casier', -15.4, 0, 7, -Math.PI / 2); I('fond_casier', 'fondation_casier_labo', -16.1, 1.2, 7, 'Ouvrir le casier', { c: 'labo' });
  for (const [x, z] of [[-24.5, 10.5], [-17.5, 10.5], [-21, 7]]) neon(x, z, 3.6);
  // le dortoir
  for (const x of [-25, -21, -17]) P('fond_lit', x, 0, -5.9, 0);
  P('fond_casier', -26.4, 0, -1.5, Math.PI / 2); P('fond_casier', -26.4, 0, -0.5, Math.PI / 2); I('fond_casier', 'fondation_casier_dortoir', -25.6, 1.2, -1, 'Ouvrir le casier', { c: 'dortoir' });
  P('table', -16.8, 0, -1.2, 0); P('chaise', -16.8, 0, -0.4, 0); I('fond_note', 'fondation_journal', -16.8, 0.95, -1.2, 'Un carnet ouvert', { n: 'journal' });
  neon(-23, -2.5, 3.2); neon(-18, -2.5, 3.2);
  // le couloir des cellules, les cellules
  for (let k = 0; k < 5; k++) neon(10 + k * 6, 10.5, 3.4);
  const CELL = [
    { f: 'VAL-001', x: 11.5, n: true, ouverte: false }, { f: 'VAL-007', x: 17.5, n: true, ouverte: false }, { f: 'VAL-003', x: 23.5, n: true, ouverte: true }, { f: 'VAL-005', x: 29.5, n: true, ouverte: true },
    { f: 'VAL-011', x: 11.5, n: false, ouverte: true }, { f: 'VAL-008', x: 17.5, n: false, ouverte: false }, { f: 'VAL-013', x: 23.5, n: false, ouverte: true }, { f: 'VAL-012', x: 29.5, n: false, ouverte: false },
  ];
  CELL.forEach((C, i) => {
    const zw = C.n ? 8.1 : 12.9, zc = C.n ? 5.05 : 15.95, face = C.n ? 0 : Math.PI;
    P(C.ouverte ? 'fond_porte_ouverte' : 'fond_porte', C.x, 0, zw, face);
    P('fond_plaque', C.x + 1.45, 1.55, C.n ? 8.52 : 12.48, C.n ? 0 : Math.PI);
    I('fond_dossier', 'fondation_dossier_' + i, C.x + 1.45, 1.55, C.n ? 9.0 : 12.0, 'Lire la plaque : SCP-' + C.f, { f: C.f });
    if (C.ouverte) neon(C.x, zc, 3.2);
    if (C.f === 'VAL-001') P('fond_puits', C.x, 0, zc);
    if (C.f === 'VAL-003') { P('fond_fragment', C.x, 0, zc - 0.5); P('fond_sismo', C.x + 1.5, 0, zc + 1.2, Math.PI); }
    if (C.f === 'VAL-005') { P('fond_lutrin', C.x, 0, zc - 0.6, 0); P('etagere', C.x - 1.8, 0, zc, Math.PI / 2, { kind: 'livres' }); }
    if (C.f === 'VAL-011') { P('fond_vitrine', C.x, 0, zc + 0.3); I('fond_vitrine', 'fondation_vitrine', C.x, 1.3, zc - 0.4, 'Regarder dans la vitrine', {}); }
    if (C.f === 'VAL-013') { P('lit', C.x - 1.4, 0, zc + 1.4, 0, { col: '#6a6a70' }); P('table', C.x + 1.2, 0, zc + 1.2, 0); P('chaise', C.x + 1.2, 0, zc + 0.4, Math.PI); I('fond_note', 'fondation_cellule7', C.x + 1.2, 0.95, zc + 1.2, 'Un billet sur la table', { n: 'cellule7' }); }
  });
  // les archives
  for (const z of [7, 10.5, 14]) { P('fond_terminal', 48.4, 0, z, -Math.PI / 2); I('fond_terminal', 'fondation_term_arch' + z, 47.6, 1.25, z, 'Consulter le terminal', { term: 'archives' }); }
  for (const x of [39, 40, 41, 42]) P('fond_classeur', x, 0, 4.9, 0);
  P('table', 41.5, 0, 13.5, 0); P('chaise', 41.5, 0, 14.3, Math.PI); I('fond_note', 'fondation_directeur', 41.5, 0.95, 13.5, 'Une note, sur le bureau', { n: 'directeur' });
  P('table', 39, 0, 7.5, 0); I('fond_kant', 'fondation_kant', 39, 1.0, 7.5, 'Un boîtier à aiguille, sur la table', {});
  for (const [x, z] of [[40, 8], [46, 8], [43, 14]]) neon(x, z, 3.6);
  B.landmark('fondation', CX + 10, CZ + 3, 45, { under: true, secret: true });
  w.fondation = { x: CX, y: Y, z: CZ, sortie, arrivee: [CX, Y + 0.05, CZ + 30.5], trappe: [hf.x, hy, hf.z], hut: hf };
}
{
  const _gv = generateValley;
  generateValley = async function (seed, progress, gen) {
    const w = await _gv(seed, progress, gen);
    if (w.designed && fondation.decider(seed)) { try { if (progress) progress('Sous la lande…'); addFondation(w, w.seed || seed); } catch (e) { console.error('fondation', e); } }
    return w;
  };
}

// ---------------------------------------------------------------- les dossiers
const FOND_TXT = {
  sas: ['FONDATION — POSTE AVANCÉ VAL-7', 'SAS DE DÉCONTAMINATION\n\nAttendre la fin du cycle avant de franchir la porte intérieure.\nTout matériel remonté en surface doit être déclaré.\nAucun contact avec la population de l’époque.\n\nSÉCURISER. CONTENIR. PROTÉGER.', 'Plaque de métal, lettres en relief'],
  directeur: ['Note de service n° 1', 'À tout le personnel du poste avancé VAL-7, et surtout à ceux de la dernière rotation.\n\nNous ne sommes pas ici chez nous. Nous ne sommes même pas ici à notre époque. Dans notre temps, la vallée n’existe plus : il reste un lac froid, trois sommets, et un nombre d’anomalies actives qui ne cesse pas d’augmenter. Toutes, sans exception, ont leur origine ici, entre la vieille ferme et la montagne, au cours des années que vous allez vivre.\n\nLa Division chronologique a obtenu l’autorisation d’établir ce poste pour observer ces anomalies à leur source. Observer. Pas corriger.\n\nTrois règles, sans exception :\n1. Aucune interaction avec la population de cette époque.\n2. Aucune modification de la chronologie : pas un outil, pas une pile, pas un mot laissé en surface.\n3. Toute personne de l’époque découverte dans le site est reconduite en surface, poliment. Au troisième incident, amnésiques de classe A.\n\nEt si vous croisez l’occupant de la vieille ferme : ne lui parlez pas. Relisez plutôt le dossier VAL-013.', 'Le directeur de site, [NOM SUPPRIMÉ]'],
  journal: ['Carnet d’I. Kovač', 'Jour 212 de rotation. Il pleut, là-haut. Je le sais parce que les sismographes tremblent un peu, comme si la montagne frissonnait. Je n’ai pas vu la pluie depuis quatre mois.\n\nJour 219. Le fermier est passé tout près de la dalle, aujourd’hui. Il s’est arrêté. Il a regardé longtemps, puis il est reparti. Menet dit qu’il ne peut pas savoir. Menet dit beaucoup de choses.\n\nJour 230. J’ai rêvé que j’étais une habitante. J’avais une vache, un jardin, des voisins qui mouraient de vieillesse. Dans notre temps, il n’y a plus de vaches.\n\nJour 241. Oyelaran a demandé au libraire s’il avait des livres sur le futur. Le libraire a répondu : « Pas encore. » Nous avons ri, après. Pas tout de suite.', 'Une écriture penchée, au crayon'],
  cellule7: ['Un billet', 'Cellule 7 — réservée (directive VAL-Ω).\n\nQuand il viendra, il aura froid. Prévoir une couverture. Ne pas lui dire depuis quand la cellule est prête.', 'Tapé à la machine, sans signature'],
};
const FOND_DOSSIERS = [
  { id: 'VAL-001', titre: 'L’Envers', classe: 'Keter', s: [
    ['Procédures de confinement spéciales', 'SCP-VAL-001 ne peut pas être confiné à cette époque. Le puits qui y donne accès (lieu-dit « le vieux puits », hameau abandonné) est placé sous observation passive. Aucun membre du personnel ne descend dans le puits. En cas de nuit rouge (voir VAL-002), le personnel en surface regagne le site avant 19 h 30.'],
    ['Description', 'SCP-VAL-001 désigne un espace secondaire superposé à la vallée, accessible par le vieux puits lors des nuits rouges. Sa géographie reproduit celle de la vallée, inversée dans ses couleurs et dans une partie de ses lois : l’eau y est respirable, les reflets n’y reflètent rien, et les horloges y reculent. Les objets qui en reviennent restent froids pendant des jours.'],
    ['Addendum VAL-001-3', 'Le « Registre des versions » vu dans l’Envers (cf. VAL-013) porte les noms de ██ fermiers. Le nombre augmente d’une unité à chaque consultation.'],
  ] },
  { id: 'VAL-002', titre: 'Les Nuits rouges', classe: 'Euclide', s: [
    ['Procédures de confinement spéciales', 'Les nuits rouges sont prévisibles à 71 % la veille (silence des chiens au crépuscule, fumée des chandelles). Le personnel ne sort pas. Les capteurs de surface sont coupés : ils enregistrent des silhouettes qui n’apparaissent sur aucun autre instrument.'],
    ['Description', 'Le ciel prend une teinte rouge sombre entre le coucher et le lever du soleil. Pendant SCP-VAL-002, les habitants disparaissent de leurs maisons, et des entités pâles (voir VAL-007) occupent la vallée. Les habitants réapparaissent au matin, sans souvenir.'],
    ['Note', 'La fréquence des nuits rouges augmente avec le temps écoulé depuis l’arrivée du fermier (VAL-013). Corrélation, pas causalité. Pour l’instant.'],
  ] },
  { id: 'VAL-003', titre: 'Le Dormeur', classe: 'Thaumiel', s: [
    ['Procédures de confinement spéciales', 'Aucune intervention. Les sismographes du site enregistrent en continu l’activité sous les Monts. Toute hausse de plus de 40 % déclenche l’alerte « Réveil » et l’évacuation temporelle immédiate du site.'],
    ['Description', 'Entité de très grande taille, d’apparence minérale, en dormance sous la montagne, dans une structure bâtie par une civilisation antérieure (les « Aëlim »). Les nains l’appellent Durn. Son sommeil stabilise l’ensemble des anomalies de la vallée : sa chaleur alimente les sources, ses rêves provoquent les tremblements. Classé Thaumiel : tant qu’il dort, il contient le reste.'],
    ['Addendum', 'Une pierre de faible taille, en contact avec le flanc de l’entité, partage ses propriétés de stabilisation (voir VAL-011). Ne pas déplacer. [Note manuscrite : trop tard ?]'],
  ] },
  { id: 'VAL-004', titre: 'Les Trois', classe: 'Keter', s: [
    ['Description', 'Trois entités non corporelles vénérées par les Aëlim : SCP-VAL-004-1 « Aëla » (l’Aube), SCP-VAL-004-2 « Durn » (voir VAL-003), SCP-VAL-004-3 « Vesh » (la Nuit noire). Manifestations rares et localisées : lumière dorée sans source à l’aube (004-1) ; nuits d’obscurité totale, accompagnées de murmures (004-3).'],
    ['Procédures de confinement spéciales', 'Ne jamais répondre à une voix entendue pendant une nuit noire. Le personnel qui entend son propre nom se signale immédiatement.'],
    ['Journal d’incident 004-3-2', 'L’agent ██████ a répondu. Il est sorti du site à 3 h 12 et n’a pas été retrouvé. Son badge, lui, est revenu. Il était tiède.'],
  ] },
  { id: 'VAL-005', titre: 'Le Libraire', classe: 'Euclide', s: [
    ['Description', 'Individu de sexe masculin, gérant de la grande bibliothèque du plateau. Âge apparent : soixante ans. Présent sur les registres depuis 1612. Il prête livres et cartes contre paiement, pour un délai fixé. Tout dépassement provoque sa transformation en entité hostile de grande puissance, qui traque l’emprunteur jusqu’à [DONNÉES SUPPRIMÉES].'],
    ['Procédures de confinement spéciales', 'Aucun membre du personnel n’emprunte de livre. Les ouvrages se consultent sur place, ou pas du tout.'],
    ['Note', 'Le libraire a salué l’agent Oyelaran par son prénom. Personne ne le lui avait dit.'],
  ] },
  { id: 'VAL-006', titre: 'Les Géants', classe: 'Sûr', s: [
    ['Description', 'Humanoïdes de neuf à douze mètres, descendants probables du peuple qui dressa les pierres de la vallée (les « Gorr »). Ils parlent une langue ancienne (le gorrain) et ne prêtent aucune attention aux êtres de petite taille. Aucun comportement hostile relevé.'],
    ['Procédures de confinement spéciales', 'Distance minimale : cinquante mètres. Ne jamais se tenir sur leur chemin : ils ne vous voient pas, ils ne vous éviteront pas.'],
    ['Addendum', 'Un fer de hache de grande taille a été repéré sous la couche de l’un d’eux. Récupération non autorisée.'],
  ] },
  { id: 'VAL-007', titre: 'Les Pâles et le Veilleur', classe: 'Keter', s: [
    ['Description', 'Entités humanoïdes blanches, sans traits, qui apparaissent pendant les nuits rouges et dans l’Envers. Elles ne se déplacent que lorsque personne ne les regarde. Contact physique : [DONNÉES SUPPRIMÉES]. SCP-VAL-007-B, « le Veilleur », est une entité noire de grande taille qui se tient à deux cents mètres de tout observateur.'],
    ['Procédures de confinement spéciales', 'Garder toujours une entité dans son champ de vision. Travailler par deux, dos à dos. Les cellules du site ne sont pas conçues pour SCP-VAL-007 : la cellule 2 a été vidée après l’incident 007-4.'],
  ] },
  { id: 'VAL-008', titre: 'Le Tueur au masque de toile', classe: 'Euclide', s: [
    ['Description', 'Individu humain, habitant de la vallée, dont l’identité change d’une version de la chronologie à l’autre. Il agit la nuit, masqué de toile, armé d’un couperet. L’anomalie ne tient pas à l’homme : elle tient à ce que la vallée en produit un, et un seul, dans chaque version.'],
    ['Procédures de confinement spéciales', 'Aucune intervention. Le personnel ne quitte plus le site après la découverte de la première victime.'],
    ['Note', 'Le masque conservé en cellule 6 provient de la version n° ███. Il est propre. Il ne l’était pas quand nous l’avons trouvé.'],
  ] },
  { id: 'VAL-009', titre: 'La Dame du Lac', classe: 'Sûr', s: [
    ['Description', 'Entité féminine liée au grand lac, identifiée à une jeune femme noyée au XVIIe siècle. Elle rend une « larme » (goutte d’eau qui ne s’évapore jamais) à qui lui porte des fleurs la nuit. Elle conserve ce que le lac a englouti, dont un village entier (Saint-Aubin-des-Eaux).'],
    ['Procédures de confinement spéciales', 'Le personnel ne pêche pas dans le grand lac. Tout objet remonté du lac est rendu à l’eau, sauf autorisation.'],
  ] },
  { id: 'VAL-010', titre: 'Le Cerf Blanc', classe: 'Sûr', s: [
    ['Description', 'Cervidé blanc et translucide, observé à l’aube à la lisière des bois de bouleaux. Il guide certaines personnes jusqu’à une clairière. Ne se montre pas à qui a tué un cervidé récemment.'],
    ['Procédures de confinement spéciales', 'Ne jamais le poursuivre. Ne jamais tirer. L’agent qui a tiré (incident 010-1) a erré trois jours dans un bois de quatre cents mètres de côté.'],
  ] },
  { id: 'VAL-011', titre: 'Objets de la vallée', classe: 'Euclide', dyn: 'objets' },
  { id: 'VAL-012', titre: 'L’homme long', classe: 'Keter', dyn: 'homme_long' },
  { id: 'VAL-013', titre: 'Le Fermier', classe: 'Euclide (révision en cours : Keter)', dyn: 'fermier' },
];
const FOND_JOURNAUX = {
  labo: { titre: 'Journal d’expérience VAL-E', s: [
    ['Expérience E-1', 'Objet : fiole d’eau puisée dans l’Envers. Protocole : exposition à la lumière du jour. Résultat : l’eau reste à 4 °C pendant onze jours, puis gèle à 20 °C. Aucune explication.'],
    ['Expérience E-4', 'Objet : larme de la Dame (VAL-009-1). Protocole : évaporation sous vide. Résultat : aucune perte de masse après 72 heures. La goutte a changé de place dans la cuve quand personne ne regardait.'],
    ['Expérience E-7', 'Objet : main de SCP-VAL-007, prélevée au matin d’une nuit rouge (cuve 2). Protocole : spectrométrie. Résultat : [DONNÉES SUPPRIMÉES]. Le spectromètre a été mis au rebut. La main a bougé deux doigts le 14.'],
    ['Expérience E-9', 'Objet : page griffonnée (VAL-012). Protocole : aucun. L’objet n’a pas été récupéré. Nous avons décidé de ne pas le récupérer.'],
    ['Expérience E-12', 'Sujet : agent volontaire. Protocole : consommation d’un pain de la boulangerie de la ville. Résultat : aucun effet anormal. Le pain était très bon. (Note du directeur : cessez de mettre des expériences de ce genre dans le journal.)'],
  ] },
  machine: { titre: 'Machine de transfert chronologique MTC-3 « Clio »', s: [
    ['État', 'EN VEILLE — prochaine fenêtre : [calcul en cours]. Tout saut hors fenêtre exige une accréditation de niveau 4. Saut d’observation court : niveau 2.'],
    ['Journal des sauts', 'Saut n° 1181 — départ : Site-19, 2███ — arrivée : VAL-7, 18██ — écart : +0,002 s — personnel : 3 — RAS.\nSaut n° 1182 — départ : VAL-7 — arrivée : Site-19 — échantillons : 14 — RAS.\nSaut n° 1183 — départ : Site-19 — arrivée : VAL-7 — écart : +11 jours — personnel : 2 — ÉCART ANORMAL. Enquête ouverte.\nSaut n° 1184 — [SAUT NON PROGRAMMÉ] — départ : VAL-7 — arrivée : inconnue — personnel : 0 — charge : un objet non identifié, trois mètres, humanoïde. Enquête close sur ordre du directeur.\nSaut n° 1185 — départ : Site-19 — arrivée : VAL-7 — écart : +0,001 s — personnel : 3 — RAS.'],
  ] },
};
// un dossier : son texte (certains se calculent : ce que la Fondation sait de VOTRE partie)
function fondDossier(D) {
  if (!D.dyn) return D.s;
  const s = farm.s;
  if (D.dyn === 'objets') {
    const lignes = [];
    const cont = fondation.pieceContenue();
    LEG_ORDRE.filter((id) => id !== 'chronographe' || fondation.presente()).forEach((id, k) => {
      const L = LEGENDAIRES[id];
      let st;
      if (legendaires.a(id)) st = 'Détenu par SCP-VAL-013 (le fermier). Récupération différée.';
      else if (id === cont) st = 'Récupéré. Confiné en cellule 5 (vitrine, verrou de niveau 2).';
      else if (id === 'chronographe') st = 'Matériel de la Fondation (MTC-3). Ne doit pas quitter le site.';
      else st = 'Non localisé. ' + L.indice;
      lignes.push(`SCP-VAL-011-${k + 1} « ${L.nom} » (${L.rang === 'mythique' ? 'mythique' : 'légendaire'}) — ${st}`);
    });
    return [['Description', 'Inventaire des objets anormaux de la vallée, que la population appelle des « merveilles ». Chacun est unique dans une version donnée de la chronologie.'], ['Inventaire', lignes.join('\n')], ['Procédures de confinement spéciales', 'Les objets récupérés sont conservés en cellule 5. Les autres ne doivent pas être recherchés activement : leur déplacement modifie la chronologie.']];
  }
  if (D.dyn === 'homme_long') {
    const on = typeof slender !== 'undefined' && slender.actif && farm.s.slender && farm.s.slender.on;
    return [
      ['Description', 'Entité humanoïde d’environ trois mètres, sans visage, vêtue d’un costume sombre. Observée dans 0,2 % des versions de la chronologie seulement. Elle hante les bois, se tient à la lisière, et se rapproche quand on ne la regarde pas. Son observation directe brouille tous les instruments — et, chez l’homme, la vue et l’ouïe.'],
      ['Statut dans la présente version', on ? (farm.s.slender.fin ? 'OBSERVÉE, puis plus rien depuis le jour ' + (farm.s.slender.brule || '?') + '. Des cendres ont été relevées près de la ferme. Dossier maintenu ouvert.' : 'OBSERVÉE. Des pages griffonnées ont été signalées dans les bois. NE LES RAMASSEZ PAS. Si c’est déjà fait : restez près du feu.') : 'NON OBSERVÉE. Cellule 8 vide. Qu’elle le reste.'],
      ['Procédures de confinement spéciales', 'Ne pas le regarder plus de quelques secondes. Ne jamais courir. Le feu semble le tenir à distance.'],
    ];
  }
  if (D.dyn === 'fermier') {
    const H = farm.history().slice(-8);
    const prev = H.length ? H.map((h) => `Version n° ${h.run} — ${h.day} jour${h.day > 1 ? 's' : ''} — ${String(h.cause || '').toLowerCase()}`).join('\n') : 'Aucune version antérieure enregistrée dans ce registre. Les autres registres disent le contraire.';
    return [
      ['Description', 'SCP-VAL-013 désigne l’occupant de la vieille ferme, arrivé dans la vallée à la suite d’une lettre de notaire. La même lettre a été reçue par toutes les personnes qui se sont succédé à la ferme. SCP-VAL-013 est à la fois le sujet et le point de convergence des anomalies : elles s’intensifient autour de lui.'],
      ['Version en cours', s.fem ? `Version n° ${s.run || 1} — ${s.prenom || '(nom illisible)'}, arrivée depuis ${s.day} jour${s.day > 1 ? 's' : ''}.` : `Version n° ${s.run || 1} — ${s.prenom || '(nom illisible)'}, arrivé depuis ${s.day} jour${s.day > 1 ? 's' : ''}.`],
      ['Versions précédentes', prev],
      ['Procédures de confinement spéciales', 'Aucune interaction. Si SCP-VAL-013 pénètre dans le site : le reconduire en surface, poliment. Ne pas lui montrer ce dossier.'],
      ['Addendum', 'La cellule 7 a été préparée pour SCP-VAL-013, conformément à la directive VAL-Ω. Elle ne sera utilisée qu’en cas de [DONNÉES SUPPRIMÉES].\n\nNote manuscrite, en bas de page : « Il lit par-dessus notre épaule. Il lit ceci. Bonjour. »'],
    ];
  }
  return [];
}

// ============================================================================
//  L'ÉTAT, LES CHERCHEURS, LES INTERACTIONS
// ============================================================================
const FOND_CHERCHEURS = [
  { nom: 'Dr Menet', titre: 'Chercheur en combinaison', col: '#d8b020', pts: [[0, 12.2, 9], [3.5, 10.5], [9, 10.5], [20, 10.5], [36, 10.5], [44.5, 12.2, 12], [36, 10.5], [23.5, 10.4, 6], [9, 10.5], [3.5, 10.5]] },
  { nom: 'Dr Kovač', titre: 'Chercheuse en combinaison', col: '#dcdcd6', f: true, pts: [[-21, 13.2, 10], [-21, 7.5], [-21, 3.2], [-21, 0], [-18, -3.4, 8], [-21, 0], [-21, 3.2], [-21, 7.5], [-16, 10.5], [-10, 10.5], [-4, 10.5, 3], [-10, 10.5], [-16, 10.5]] },
  { nom: 'Oyelaran', titre: 'Technicien en combinaison', col: '#d87818', pts: [[0, -10.2, 12], [-6.5, -13.5], [-7.5, -22], [0, -27.5, 5], [7.5, -22], [6.5, -13.5], [0, -10.2, 4], [0, -4], [0, 2.5, 2], [0, -4]] },
];
const fondation = {
  cherch: [], machineT: 0, escorte: false, torcheOn: false, surface: null,
  S() {
    const s = farm.s;
    const S = s.fondation || (s.fondation = { on: false, escortes: 0, scelle: 0, evacue: false, pris: {}, machine: -99, combi: false });
    S.pris = S.pris || {};
    return S;
  },
  tirage(seed) { return mulberry32(((seed | 0) ^ 0x5cf0) >>> 0)() < 1 / 120; },
  force() { try { return localStorage.getItem('prairie.force.fondation') === '1'; } catch (e) { return false; } },
  // (le complexe existe-t-il dans cette partie ? — décidé à la génération, gardé dans la sauvegarde)
  decider(seed) { return this.force() || (typeof farm !== 'undefined' && farm.s && farm.s.seed === seed && farm.s.fondation && farm.s.fondation.on) || this.tirage(seed); },
  forcer(on) { try { if (on) localStorage.setItem('prairie.force.fondation', '1'); else localStorage.removeItem('prairie.force.fondation'); } catch (e) { /* stockage indisponible */ } },
  presente() { return !!(game && game.world && game.world.fondation); },
  W() { return game.world.fondation; },
  loc(lx, lz) { const F = this.W(); return [F.x + lx, F.z + lz]; },
  dedans() { if (!this.presente()) return false; const F = this.W(), p = game.player; return p.underground && Math.abs(p.pos[0] - F.x - 10) < 44 && Math.abs(p.pos[2] - F.z - 2) < 36; },
  combi() { return !!(farm.s && farm.s.fondation && farm.s.fondation.combi && farm.count('combinaison')); },
  torche() { return this.torcheOn && farm.count('lampe_torche') > 0; },
  // l'objet de la vallée confiné en cellule 5 : le premier que le fermier n'a pas encore
  pieceContenue() {
    const S = this.S();
    if (S.pris.vitrine) return null;
    const rnd = mulberry32(((farm.s.seed | 0) * 31 + 77) >>> 0), L = ['cor_mesnie', 'clochette_aubin', 'livre_sans_fin', 'arc_cerf', 'pierre_durn', 'canne_dame', 'lanterne_aube'];
    for (let i = L.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; [L[i], L[j]] = [L[j], L[i]]; }
    return L.find((id) => !legendaires.a(id)) || null;
  },
  // ---------------------------------------------------------- les chercheurs
  initChercheurs() {
    this.cherch = [];
    if (!this.presente() || this.S().evacue) return;
    const F = this.W();
    FOND_CHERCHEURS.forEach((C, i) => {
      const p0 = C.pts[0];
      this.cherch.push({ C, i, k: 0, x: F.x + p0[0], z: F.z + p0[1], y: F.y, heading: 0, etat: 'travail', t: 2 + i * 3, phase: 0, move: 0, rig: rigChercheur(C.col), alerte: 0, dit: 0 });
    });
  },
  voitJoueur(r) {
    const p = game.player, eye = p.eyePos(), d = Math.hypot(p.pos[0] - r.x, p.pos[2] - r.z);
    if (d > 16) return false;
    if (this.combi()) return d < 1.7 || (p.sprinting && d < 6);
    if (d < 3.2) return true;
    const fx = Math.sin(r.heading), fz = Math.cos(r.heading), dot = ((p.pos[0] - r.x) * fx + (p.pos[2] - r.z) * fz) / (d || 1);
    if (dot < 0.25) return false;
    const o = [r.x, r.y + 1.6, r.z], dx = eye[0] - o[0], dy = eye[1] - o[1], dz = eye[2] - o[2], L = Math.hypot(dx, dy, dz) || 1;
    return !game.world.raycastBlocks(o, [dx / L, dy / L, dz / L], L - 0.4);
  },
  temoin() { return this.cherch.find((r) => r.etat !== 'parti' && this.voitJoueur(r)) || null; },
  updateChercheurs(dt) {
    if (!this.cherch.length) return;
    const F = this.W(), p = game.player, dedans = this.dedans();
    for (const r of this.cherch) {
      if (r.etat === 'parti') continue;
      r.t -= dt;
      r.alerte = Math.max(0, r.alerte - dt);
      const d = Math.hypot(p.pos[0] - r.x, p.pos[2] - r.z);
      if (dedans && !this.escorte && this.voitJoueur(r)) {
        if (r.alerte <= 0 && r.etat !== 'evite') {
          r.etat = 'regarde'; r.t = 1.6; r.alerte = 25;
          const lignes = this.combi() ? ['Kovač ? C’est toi ?… Non. Qui êtes-vous ?', 'Votre badge. Montrez-moi votre badge.'] : ['Ne bougez plus. Vous n’avez rien vu, d’accord ?', 'Qui… Comment êtes-vous entré ?', 'Ne touchez à rien. S’il vous plaît.', 'Protocole Clio. Restez où vous êtes.'];
          ui.subtitle(r.C.titre, pick(lignes), 3.2);
          sound.mumble && sound.mumble(r.C.f ? 1.25 : 0.9, 20, 0);
        }
        if (d < 3.4 || (this.combi() && d < 1.7)) { this.reconduire(r, 'proche'); return; }
      }
      if (r.etat === 'regarde') {
        r.heading = turnToward(r.heading, Math.atan2(p.pos[0] - r.x, p.pos[2] - r.z), dt * 4); r.move = lerp(r.move, 0, Math.min(1, dt * 6));
        if (r.t <= 0) { r.etat = 'evite'; r.k = this.pointLoin(r); }
        continue;
      }
      if (r.etat === 'travail') { r.move = lerp(r.move, 0, Math.min(1, dt * 6)); if (r.t <= 0) { r.etat = 'marche'; r.k = (r.k + 1) % r.C.pts.length; } continue; }
      // marcher (ou s'éloigner) vers le point suivant
      const q = r.C.pts[r.k], tx = F.x + q[0], tz = F.z + q[1], dd = Math.hypot(tx - r.x, tz - r.z);
      const sp = r.etat === 'evite' ? 2.3 : 1.1;
      if (dd < 0.25) {
        if (r.etat === 'evite') { if (d > 12 || !dedans) { r.etat = q[2] ? 'travail' : 'marche'; r.t = q[2] || 0; } else r.k = this.pointLoin(r); }
        else if (q[2]) { r.etat = 'travail'; r.t = q[2] * (0.8 + Math.random() * 0.5); }
        else r.k = (r.k + 1) % r.C.pts.length;
        continue;
      }
      r.heading = turnToward(r.heading, Math.atan2(tx - r.x, tz - r.z), dt * 5);
      const st = Math.min(dd, sp * dt);
      r.x += (tx - r.x) / dd * st; r.z += (tz - r.z) / dd * st;
      r.move = lerp(r.move, 1, Math.min(1, dt * 6)); r.phase += dt * sp * 2.6;
    }
  },
  // le point de sa ronde le plus loin du joueur (parmi les voisins : on ne traverse pas les murs)
  pointLoin(r) {
    const F = this.W(), p = game.player, n = r.C.pts.length;
    const a = (r.k + 1) % n, b = (r.k - 1 + n) % n;
    const da = Math.hypot(F.x + r.C.pts[a][0] - p.pos[0], F.z + r.C.pts[a][1] - p.pos[2]), db = Math.hypot(F.x + r.C.pts[b][0] - p.pos[0], F.z + r.C.pts[b][1] - p.pos[2]);
    return da >= db ? a : b;
  },
  // on vous raccompagne en surface
  async reconduire(r, pourquoi) {
    if (this.escorte || game.dying) return;
    this.escorte = true;
    const S = this.S(), s = farm.s, p = game.player, F = this.W();
    const L = pourquoi === 'vol' ? 'Posez ça. Tout de suite. Ça ne vous appartient pas — ça n’appartient à personne, ici.' : pick(['Venez avec moi. On va vous raccompagner. Tout va bien.', 'Vous ne devriez pas être ici. Personne ne devrait. Suivez-moi.', 'Donnez-moi votre bras. Voilà. Doucement.']);
    if (r) { r.etat = 'regarde'; r.t = 99; ui.subtitle(r.C.titre, L, 3.5); sound.mumble && sound.mumble(r.C.f ? 1.25 : 0.9, 26, 0); }
    await new Promise((res) => setTimeout(res, 1800));
    if (game.dying) { this.escorte = false; return; }
    game.sleeping = true;
    ui.close(true);
    await ui.fade(true, 'Une main gantée se referme sur votre bras. On vous fait remonter une échelle, longtemps, sans un mot.', 900);
    await new Promise((res) => setTimeout(res, 2200));
    S.escortes = (S.escortes || 0) + 1;
    let msg = '';
    if (S.escortes >= 3) {
      S.escortes = 0; S.scelle = s.day + 2;
      const K = savoir.S().lieux; delete K.fondation; delete K.fondation_entree;
      if (typeof slender !== 'undefined' && slender.S && s.slender) s.slender.repit = s.hours + 6;
      $('#fade-text').textContent = 'Une piqûre au bras. Le goût du métal. Vous vous réveillez dans l’herbe, près d’une cabane en ruine, sans savoir très bien ce que vous faisiez là.';
      await new Promise((res) => setTimeout(res, 3200));
    }
    p.pos = F.sortie.slice(); p.vel = [0, 0, 0];
    game.renderer.uploadCover(p.pos[0], p.pos[2]);
    for (const q of this.cherch) if (q.etat !== 'parti') { q.etat = 'travail'; q.t = 3; q.alerte = 0; }
    await ui.fade(false, '', 900);
    game.sleeping = false;
    this.escorte = false;
    if (msg) ui.subtitle('', msg, 4);
  },
  parler(r) {
    if (this.escorte) return;
    ui.subtitle(r.C.titre, pick(['Je ne peux pas vous parler. Vraiment pas. Mais vous avez l’air… vous avez l’air comme dans les dossiers.', 'Il ne faut pas. Il ne faut surtout pas. Venez.', 'Vous êtes… Non. Ne dites pas votre nom. Venez.']), 4);
    setTimeout(() => this.reconduire(r, 'parle'), 1500);
  },
  // ---------------------------------------------------------- le terminal
  ouvrirTerminal(term, seul) {
    const D = FOND_DOSSIERS, J = FOND_JOURNAUX;
    let liste = [];
    if (seul) liste = D.filter((d) => d.id === seul);
    else if (term === 'labo') liste = [{ id: 'E', titre: J.labo.titre, journal: 'labo' }].concat(D.filter((d) => ['VAL-001', 'VAL-007', 'VAL-009'].includes(d.id)));
    else if (term === 'machine') liste = [{ id: 'MTC-3', titre: J.machine.titre, journal: 'machine' }];
    else if (term === 'accueil') liste = D.filter((d) => ['VAL-002', 'VAL-003', 'VAL-004', 'VAL-006', 'VAL-010'].includes(d.id));
    else liste = D.slice();
    this.term = { term, liste, sel: 0 };
    this.majTerminal();
  },
  majTerminal() {
    const T = this.term;
    if (!T) return;
    if (!$('#fondterm')) { const d = document.createElement('div'); d.id = 'fondterm'; d.className = 'pp-panel'; $('#paper').appendChild(d); }
    const cur = T.liste[T.sel];
    let doc = '';
    if (cur) {
      if (cur.journal) { const J = FOND_JOURNAUX[cur.journal]; doc = `<h5>${esc(J.titre)}</h5>` + J.s.map(([h, t]) => `<h6>${esc(h)}</h6><p>${esc(t).replace(/\n/g, '<br>')}</p>`).join(''); }
      else doc = `<h5>Objet n° : SCP-${esc(cur.id)}</h5><p class="ft-cl">« ${esc(cur.titre)} » — Classe : <b>${esc(cur.classe)}</b></p>` + fondDossier(cur).map(([h, t]) => `<h6>${esc(h)}</h6><p>${esc(t).replace(/\n/g, '<br>')}</p>`).join('');
    }
    const n = { accueil: '01', labo: '04', archives: '07', machine: 'MTC', dossier: 'PL' }[T.term] || '00';
    const html = `<div class="ft-head"><span>FONDATION · POSTE AVANCÉ CHRONOLOGIQUE VAL-7 · TERMINAL ${n}</span><button class="x" data-ftx>✕</button></div>
      <div class="ft-body">${T.liste.length > 1 ? `<div class="ft-liste">${T.liste.map((d, i) => `<button data-ft="${i}" class="${i === T.sel ? 'on' : ''}">${esc(d.journal ? d.id : 'SCP-' + d.id)}<small>${esc(d.titre)}</small></button>`).join('')}</div>` : ''}<div class="ft-doc">${doc}<span class="ft-cur">_</span></div></div>
      <div class="ft-foot">SÉCURISER. CONTENIR. PROTÉGER. — accès de niveau 2 — ne pas laisser ce terminal allumé sans surveillance</div>`;
    ui.open('#fondterm', html);
    $$('#fondterm [data-ft]').forEach((b) => (b.onclick = () => { T.sel = +b.dataset.ft; this.majTerminal(); sound.tick && sound.tick(); }));
    const x = $('#fondterm [data-ftx]'); if (x) x.onclick = () => ui.close();
    if (sound.ok) sound.tone(sound.at(), 'square', 1800, 1800, 0.03, 0.015);
  },
  // ---------------------------------------------------------- la machine
  async machine() {
    const S = this.S(), s = farm.s;
    if (S.evacue) { ui.read('Console MTC-3', 'ÉVACUATION TEMPORELLE EFFECTUÉE.\n\nTout le personnel a quitté cette époque. La machine ne répond plus qu’en clignotant : une lumière verte, une rouge, une verte.', ''); return; }
    const opts = [{ label: 'Lire le journal de la machine', fn: () => { ui.close(true); this.ouvrirTerminal('machine'); } }];
    if (farm.count('badge_fondation')) opts.push({ label: s.day - (S.machine || -99) < 7 ? 'Saut d’observation (en recharge)' : 'Passer le badge : saut d’observation', fn: () => { ui.close(true); this.saut(); } });
    else opts.push({ label: 'Toucher l’écran', fn: () => { ui.close(); if (sound.ok) sound.tone(sound.at(), 'square', 300, 300, 0.25, 0.04); ui.subtitle('', '(« ACCÈS REFUSÉ — BADGE REQUIS ». L’écran rougit un instant.)', 3); } });
    opts.push({ label: 'Partir', fn: () => ui.close() });
    ui.choice('La console de la machine', 'Trois écrans, des voyants qui clignotent, un anneau immense qui ronronne derrière la vitre. Des lettres vertes défilent : « MTC-3 CLIO — EN VEILLE ».', opts);
  },
  async saut() {
    const S = this.S(), s = farm.s, p = game.player, F = this.W();
    if (s.day - (S.machine || -99) < 7) { ui.subtitle('', '(« RECHARGE EN COURS ». L’anneau tourne à peine.)', 3); return; }
    S.machine = s.day;
    const c = [F.x, F.y + 3.85, F.z - 20], eye = p.eyePos();
    this.machineT = 12;
    if (sound.ok) { const t = sound.at(); sound.voice(t, 'sawtooth', 50, 400, 6, 0.05, sound.lp(1200)); sound.voice(t + 3, 'sine', 200, 1600, 3, 0.04, sound.sfx); }
    await cine.jouer([
      { dur: 3.2, de: { pos: eye, look: c }, a: { pos: [F.x + 3, F.y + 2.4, F.z - 12], look: c }, texte: 'L’anneau se met à tourner. Le sol vibre, puis l’air lui-même.', secousse: 0.03 },
      { dur: 3.6, orbite: { c, r: 7, h: 0.2, a0: 0.2, a1: 1.3 }, texte: 'Au centre, la lumière devient blanche, puis plus que blanche.', secousse: 0.06 },
      { dur: 4.5, de: { pos: [F.x, F.y + 2, F.z - 13], look: c }, fondu: 'noir', texte: 'Pendant quatre secondes, vous êtes debout au même endroit, cent cinquante ans plus tard.' },
      { dur: 5.5, de: { pos: [F.x, F.y + 2, F.z - 13], look: c }, fondu: 'noir', texte: 'Il n’y a plus de ferme. Le lac a monté jusqu’aux premières maisons de la ville, qui n’ont plus de toits. Il neige, en plein été.' },
      { dur: 4.5, de: { pos: [F.x, F.y + 2, F.z - 13], look: c }, fondu: 'noir', texte: 'Au loin, sur la crête, quelque chose de très grand est assis, et regarde la vallée. Il vous a vu.' },
    ], { passer: false });
    this.machineT = 0;
    strange.glitchT = Math.max(strange.glitchT || 0, 1.2);
    ui.subtitle('', '(Vous êtes à genoux devant la console. Vos mains tremblent. Des pas pressés arrivent de tous les côtés.)', 4.5);
    const r = this.cherch.find((q) => q.etat !== 'parti');
    if (r) setTimeout(() => this.reconduire(r, 'machine'), 2500);
  },
  // ---------------------------------------------------------- chaque image
  update(dt, eye, basis, sky, playing) {
    if (!this.presente() || !farm.s) return;
    this.machineT = Math.max(0, this.machineT - dt);
    if (!playing) return;
    const S = this.S(), p = game.player, F = this.W();
    if (this.dedans()) {
      if (!S.visite) S.visite = farm.s.day;
      this.updateChercheurs(dt);
      // le sas : un cycle de décontamination en passant
      const inSas = Math.abs(p.pos[0] - F.x) < 4 && p.pos[2] - F.z > 27 && p.pos[2] - F.z < 33;
      if (inSas && !this.sasOn && (this.sasT || 0) <= 0) { this.sasOn = true; this.sasT = 40; if (sound.ok) sound.noiseHit(sound.at(), 2.6, 'highpass', 2500, 0.5, 0.05); ui.subtitle('', '(Un sifflement : une brume froide tombe du plafond, puis s’arrête d’un coup.)', 3); for (let k = 0; k < 40; k++) particles.spawn(F.x + (Math.random() - 0.5) * 7, F.y + 3.2, F.z + 28 + Math.random() * 4, (Math.random() - 0.5) * 0.4, -1.5 - Math.random(), (Math.random() - 0.5) * 0.4, [0.85, 0.92, 1, 0.6], 0.12, 1.6, 0.5, false); }
      if (!inSas) this.sasOn = false;
      this.sasT = (this.sasT || 0) - dt;
      // un ronronnement de machine
      this.humT = (this.humT || 0) - dt;
      if (this.humT <= 0 && sound.ok) { this.humT = 5.5; sound.tone(sound.at(), 'sine', 55, 55, 6, 0.018, null, 1.5); }
    }
    // la nuit, près de la cabane : parfois, une silhouette jaune qui descend (0,1 fois par heure de jeu × bizarrerie)
    this.surfT = (this.surfT || 0) - dt;
    if (this.surfT <= 0) {
      this.surfT = 3;
      const T = F.trappe, d = Math.hypot(p.pos[0] - T[0], p.pos[2] - T[2]);
      if (!this.surface && !S.evacue && sky.night > 0.5 && d > 35 && d < 170 && !p.underground && Math.random() < hasardHeure(0.1 * bizarrerie(), 3)) {
        const a = Math.atan2(p.pos[0] - T[0], p.pos[2] - T[2]) + (Math.random() - 0.5) * 2.4, x = T[0] + Math.sin(a) * 26, z = T[2] + Math.cos(a) * 26;
        this.surface = { x, z, y: game.world.heightAt(x, z), heading: 0, phase: 0, t: 0, rig: rigChercheur(pick(FOND_CHERCHEURS).col) };
      }
    }
    const Sf = this.surface;
    if (Sf) {
      const T = F.trappe, dd = Math.hypot(T[0] - Sf.x, T[2] - Sf.z);
      Sf.t += dt; Sf.heading = Math.atan2(T[0] - Sf.x, T[2] - Sf.z);
      if (dd > 0.6) { Sf.x += (T[0] - Sf.x) / dd * dt * 1.5; Sf.z += (T[2] - Sf.z) / dd * dt * 1.5; Sf.y = game.world.heightAt(Sf.x, Sf.z); Sf.phase += dt * 4; }
      if (dd <= 0.6 || Sf.t > 40) this.surface = null;
    }
  },
};
// ------------------------------------------------ le modèle des chercheurs : combinaison, capuche, visière, bouteille
function rigChercheur(col) {
  const { P, add } = rigParts();
  const suit = rgbf(col), dark = rgbf('#2a2c30'), tank = rgbf('#9098a0');
  add('hips', null, [0, 0.9, 0], null);
  add('legL', 'hips', [-0.11, 0, 0], [0.18, 0.88, 0.2], [0, -0.44, 0], suit, TL.cloth);
  add('legR', 'hips', [0.11, 0, 0], [0.18, 0.88, 0.2], [0, -0.44, 0], suit, TL.cloth);
  add('bootL', 'legL', [0, -0.86, 0.03], [0.19, 0.1, 0.28], [0, 0, 0], dark, TL.leather);
  add('bootR', 'legR', [0, -0.86, 0.03], [0.19, 0.1, 0.28], [0, 0, 0], dark, TL.leather);
  add('torso', 'hips', [0, 0, 0], [0.5, 0.66, 0.3], [0, 0.33, 0], suit, TL.cloth);
  add('tank', 'torso', [0, 0.36, -0.21], [0.26, 0.44, 0.14], [0, 0, 0], tank, TL.metal);
  add('head', 'torso', [0, 0.66, 0], [0.36, 0.38, 0.36], [0, 0.18, 0], suit, TL.cloth);
  add('visor', 'head', [0, 0.2, 0.17], [0.27, 0.17, 0.04], [0, 0, 0], [0.05, 0.12, 0.14], 0, { fl: FX_EMIT });
  add('armL', 'torso', [-0.31, 0.6, 0], [0.14, 0.62, 0.16], [0, -0.29, 0], suit, TL.cloth);
  add('armR', 'torso', [0.31, 0.6, 0], [0.14, 0.62, 0.16], [0, -0.29, 0], suit, TL.cloth);
  add('gloveL', 'armL', [0, -0.62, 0], [0.13, 0.13, 0.13], [0, -0.02, 0], dark, TL.leather);
  add('gloveR', 'armR', [0, -0.62, 0], [0.13, 0.13, 0.13], [0, -0.02, 0], dark, TL.leather);
  add('tablet', 'gloveL', [0.02, -0.04, 0.1], [0.03, 0.18, 0.24], [0, 0, 0], [0.25, 0.9, 0.55], 0, { fl: FX_EMIT });
  const r = new Rig(P); r.kind = 'fondation';
  return r;
}
function poseChercheur(r, move, phase, t, travail) {
  const a = Math.sin(phase) * 0.55 * move;
  r.set('legL', a, 0, 0); r.set('legR', -a, 0, 0);
  r.set('armL', -0.75 - a * 0.1, 0, 0.1); r.set('armR', travail ? -0.9 + Math.sin(t * 9) * 0.15 : a * 0.7, 0, -0.06);
  r.set('head', travail ? 0.25 : 0, 0, 0);
  r.part('hips').p[1] = 0.9 + Math.abs(Math.cos(phase)) * 0.03 * move;
}
HOOKS.update.push((dt, eye, basis, sky, playing) => fondation.update(dt, eye, basis, sky, playing));
HOOKS.draw.push((buf, sbuf, cam, t) => {
  if (!fondation.presente()) return;
  const F = fondation.W();
  if (Math.abs(cam[0] - F.x - 10) < 70 && Math.abs(cam[2] - F.z) < 60 && cam[1] < F.y + 12) {
    for (const r of fondation.cherch) {
      if (r.etat === 'parti') continue;
      poseChercheur(r.rig, r.move, r.phase, t, r.etat === 'travail');
      drawRig(buf, r.rig, r.x, r.y, r.z, r.heading, 1, 0);
      if (sbuf) drawShadow(sbuf, r.x, r.y, r.z, 0.34);
    }
    // ce qui attend : le chronographe sur son socle, la merveille dans la vitrine, le compteur de Kant
    const S = fondation.S();
    PE.buf = buf; PE.fl = 0;
    if (!S.pris.chrono && !legendaires.a('chronographe')) { const [x, z] = fondation.loc(3.2, -11.6); PE.frame(x, F.y + 1.12, z, t * 0.3, 1); PE.box(0, 0.03, 0, 0.16, 0.04, 0.16, [0.6, 0.62, 0.66], TL.metal); PE.fl = FX_EMIT; PE.box(0, 0.056, 0, 0.12, 0.01, 0.12, [0.25, 0.1, 0.45], 0); PE.fl = 0; }
    const cont = fondation.pieceContenue();
    if (cont) { const [x, z] = fondation.loc(11.5, 16.25); PE.frame(x, F.y + 1.05, z, t * 0.4, 1); legModele(PE, cont, t); }
    if (!S.pris.kant) { const [x, z] = fondation.loc(39, 7.5); PE.frame(x, F.y + 0.79, z, 0.4, 1); PE.bx(0, 0, 0, 0.2, 0.12, 0.26, [0.25, 0.22, 0.2], TL.leather); PE.bx(0, 0.12, 0.02, 0.15, 0.01, 0.15, [0.9, 0.86, 0.72], TL.paper); }
  }
  const Sf = fondation.surface;
  if (Sf) { poseChercheur(Sf.rig, 1, Sf.phase, t, false); drawRig(buf, Sf.rig, Sf.x, Sf.y, Sf.z, Sf.heading, 1, 0); }
});
HOOKS.lights.push((eye) => {
  const L = [];
  if (!farm.s) return L;
  if (fondation.torche()) {
    const p = game.player, b = cameraBasis(p.yaw, p.pitch);
    L.push({ x: eye[0] + b.f[0] * 3.5, y: eye[1] + b.f[1] * 3.5, z: eye[2] + b.f[2] * 3.5, r: 17, c: [1.15, 1.2, 1.3], d: 0 });
  }
  const Sf = fondation.surface;
  if (Sf) L.push({ x: Sf.x, y: Sf.y + 1.2, z: Sf.z, r: 5, c: [0.3, 0.9, 0.55], d: Math.hypot(Sf.x - eye[0], Sf.z - eye[2]) });
  if (fondation.presente() && fondation.machineT > 0) { const F = fondation.W(); L.push({ x: F.x, y: F.y + 3.6, z: F.z - 20, r: 30, c: [1.4, 1.6, 2.0], d: Math.hypot(F.x - eye[0], F.z - 20 - eye[2]) }); }
  return L;
});
// E : parler à un chercheur
HOOKS.target.push((eye, f, cand) => {
  if (!fondation.cherch.length || !fondation.dedans()) return;
  for (const r of fondation.cherch) {
    if (r.etat === 'parti') continue;
    const dx = r.x - eye[0], dz = r.z - eye[2], d = Math.hypot(dx, dz);
    if (d > 2.8 || (dx * f[0] + dz * f[2]) / (d || 1) < 0.7) continue;
    cand({ kind: 'hook', use: () => fondation.parler(r) }, d);
  }
});
// les frapper : ils disparaissent (un saut d'évacuation), et toute la Fondation avec eux
{
  const _ray = strange.raycast.bind(strange);
  strange.raycast = function (o, d, maxDist) {
    let best = _ray(o, d, maxDist);
    if (!fondation.cherch.length) return best;
    const dh = Math.hypot(d[0], d[2]) || 1e-6;
    for (const r of fondation.cherch) {
      if (r.etat === 'parti') continue;
      const cx = r.x - o[0], cz = r.z - o[2], tc = (cx * d[0] + cz * d[2]) / (dh * dh);
      if (tc < 0 || tc > maxDist) continue;
      const px = d[0] * tc - cx, pz = d[2] * tc - cz;
      if (px * px + pz * pz > 0.16) continue;
      const y = o[1] + d[1] * tc;
      if (y < r.y - 0.1 || y > r.y + 2) continue;
      if (!best || tc < best.t) best = { t: tc, s: { fondation: r }, p: [o[0] + d[0] * tc, y, o[2] + d[2] * tc] };
    }
    return best;
  };
  const _hit = strange.hit.bind(strange);
  strange.hit = function (e, dmg, from) {
    if (!e || !e.fondation) return _hit(e, dmg, from);
    fondation.evacuer(e.fondation);
  };
}
fondation.evacuer = function (r) {
  const S = this.S();
  if (S.evacue) return;
  S.evacue = true;
  strange.glitchT = Math.max(strange.glitchT || 0, 1.5); game.shakeT = 0.6;
  if (sound.ok) { const t = sound.at(); sound.voice(t, 'sawtooth', 900, 60, 1.4, 0.06, sound.lp(3000)); sound.noiseHit(t, 1.2, 'bandpass', 2000, 0.5, 0.2); }
  for (const q of this.cherch) { q.etat = 'parti'; for (let k = 0; k < 20; k++) particles.spawn(q.x, q.y + Math.random() * 1.9, q.z, (Math.random() - 0.5) * 2, Math.random() * 2, (Math.random() - 0.5) * 2, [0.8, 0.95, 1, 1], 0.06, 0.8, 0, true); }
  ui.subtitle('', '(Un éclair blanc, sans bruit. Il n’y a plus personne. Au loin, l’anneau hurle, puis se tait. Ils sont partis — tous, et vers quand ?)', 6);
};

// ---------------------------------------------------------------- les interactions
HOOKS.inter.fond_trappe = (it) => {
  const S = fondation.S(), s = farm.s, F = fondation.W();
  if (!F) return;
  if (S.scelle && s.day < S.scelle) { ui.subtitle('', '(La dalle ne bouge plus. Quelqu’un l’a scellée, par-dessous.)', 3.5); return; }
  const q = it.data && it.data.prop !== undefined ? game.world.props[it.data.prop] : null;
  if (!S.dalle) { S.dalle = s.day; if (q) farm.setPropData(q, { ouverte: true }); sound.rumble && sound.rumble(); ui.read('Sous la dalle', 'La dalle est plus légère qu’elle n’en a l’air : elle pivote sur une charnière cachée. Dessous, une trappe d’acier lisse, sans une trace de rouille, avec un petit carré de verre qui s’allume en vert quand vous approchez la main.\n\nQuelqu’un, sous la lande, entretient cette porte.', '(Appuyez encore pour descendre.)'); return; }
  if (sound.ok) { const t = sound.at(); sound.tone(t, 'sine', 880, 880, 0.08, 0.03); sound.tone(t + 0.1, 'sine', 1320, 1320, 0.1, 0.03); }
  game.teleport(F.arrivee, 'La trappe s’ouvre sans bruit. Une échelle de métal descend, très loin, dans une lumière blanche.');
};
HOOKS.inter.fond_terminal = (it) => fondation.ouvrirTerminal(it.data.term);
HOOKS.inter.fond_dossier = (it) => fondation.ouvrirTerminal('dossier', it.data.f);
HOOKS.inter.fond_note = (it) => { const T = FOND_TXT[it.data.n]; if (T) { ui.read(T[0], T[1], T[2] || ''); sound.page && sound.page(); } };
HOOKS.inter.fond_machine = () => fondation.machine();
const FOND_CASIERS = { labo: [['trousse_fondation', 2], ['ration_fondation', 3], ['amnesique', 1]], dortoir: [['badge_fondation', 1], ['combinaison', 1], ['lampe_torche', 1], ['ration_fondation', 1]] };
HOOKS.interVis.fond_casier = (it) => !fondation.S().pris['casier_' + it.data.c];
HOOKS.inter.fond_casier = (it) => {
  const S = fondation.S(), k = 'casier_' + it.data.c;
  if (S.pris[k]) return;
  const r = fondation.temoin();
  if (r) { fondation.reconduire(r, 'vol'); return; }
  S.pris[k] = farm.s.day;
  for (const [id, n] of FOND_CASIERS[it.data.c] || []) { farm.give(id, n); play.flyer(id, [it.x, it.y, it.z], n); }
  sound.lootOpen && sound.lootOpen();
};
HOOKS.interVis.fond_kant = () => !fondation.S().pris.kant;
HOOKS.inter.fond_kant = (it) => {
  const S = fondation.S();
  const r = fondation.temoin();
  if (r) { fondation.reconduire(r, 'vol'); return; }
  S.pris.kant = farm.s.day; farm.give('compteur_kant', 1); play.flyer('compteur_kant', [it.x, it.y, it.z], 1); sound.pop && sound.pop();
};
HOOKS.interVis.fond_chrono = () => !fondation.S().pris.chrono && !legendaires.a('chronographe');
HOOKS.inter.fond_chrono = (it) => {
  const S = fondation.S();
  const r = fondation.temoin();
  if (r) { fondation.reconduire(r, 'vol'); return; }
  S.pris.chrono = farm.s.day;
  legendaires.obtenir('chronographe', 'fondation', [it.x, it.y, it.z]);
};
HOOKS.interVis.fond_vitrine = () => true;
HOOKS.inter.fond_vitrine = (it) => {
  const S = fondation.S(), id = fondation.pieceContenue();
  if (!id) { ui.subtitle('', '(La vitrine est vide. Une étiquette : « Transféré ».)', 3); return; }
  if (!farm.count('badge_fondation')) { ui.subtitle('', `(Derrière la vitre : ${LEGENDAIRES[id].nom}. Le verrou attend un badge.)`, 3.5); return; }
  const r = fondation.temoin();
  if (r) { fondation.reconduire(r, 'vol'); return; }
  S.pris.vitrine = id;
  if (sound.ok) sound.tone(sound.at(), 'sine', 1200, 1200, 0.1, 0.03);
  legendaires.obtenir(id, 'fondation', [it.x, it.y, it.z]);
  if (fondation.cherch.some((q) => q.etat !== 'parti')) setTimeout(() => { if (!fondation.dedans()) return; if (sound.ok) for (let k = 0; k < 6; k++) sound.tone(sound.at(k * 0.5), 'square', 700, 500, 0.3, 0.03); ui.subtitle('', '(Une sirène, quelque part. « Brèche de confinement, cellule 5. »)', 4); }, 3000);
};
// ---------------------------------------------------------------- les objets du futur
HOOKS.primary.push((eye, basis, held, it, id) => {
  if (held) return false;
  const s = farm.s, p = game.player, S = fondation.S();
  switch (id) {
    case 'lampe_torche': fondation.torcheOn = !fondation.torcheOn; sound.click(); play.cool = 0.3; return true;
    case 'combinaison':
      S.combi = !S.combi; sound.equip && sound.equip(); play.cool = 0.6;
      ui.subtitle('', S.combi ? '(Vous enfilez la combinaison jaune. Tout sent le caoutchouc, et votre souffle résonne dans la capuche.)' : '(Vous ôtez la combinaison. L’air frais sur le visage.)', 3.5);
      return true;
    case 'trousse_fondation':
      if (!farm.take('trousse_fondation', 1)) return true;
      p.hp = Math.min(100, p.hp + 60); corps.panser(); if (corps.jambeCassee()) { corps.C().attelle = 1; corps.soignerJambe(false); }
      play.poisonT = 0; sound.equip && sound.equip(); play.cool = 1;
      ui.subtitle('', '(Des bandes qui collent toutes seules, une piqûre qui ne fait pas mal. Vous vous sentez… réparé.)', 3.5);
      return true;
    case 'amnesique':
      if (!farm.take('amnesique', 1)) return true;
      { const K = savoir.S().lieux; delete K.fondation; delete K.fondation_entree; }
      strange.fear = 0; strange.glitchT = Math.max(strange.glitchT || 0, 0.6);
      if (s.slender) { s.slender.repit = s.hours + 24; s.slender.traques = Math.max(0, (s.slender.traques || 0) - 1); }
      play.cool = 1;
      ui.subtitle('', '(Une piqûre froide. Pendant un moment, vous ne savez plus du tout où vous êtes, ni pourquoi vous teniez cette seringue.)', 4.5);
      return true;
    case 'compteur_kant': fondation.mesurer(); play.cool = 1.2; return true;
  }
  return false;
});
fondation.mesurer = function () {
  const w = game.world, p = game.player, s = farm.s;
  const pts = [];
  for (const sp of legendaires.spots) if (legSpotVisible(sp) || (!sp.quand && !legendaires.a(sp.item))) pts.push([sp.x, sp.z, 1.0]);
  for (const e of strange.ents || []) pts.push([e.x, e.z, 0.8]);
  if (typeof slender !== 'undefined' && slender.e) pts.push([slender.e.x, slender.e.z, 1.5]);
  if (typeof slender !== 'undefined' && slender.actif() && slender.pagesPos) for (const P of slender.pagesPos) if (slender.S().pages[P.i] === undefined) pts.push([P.x, P.z, 0.9]);
  for (const k in w.lm) { const L = w.lm[k]; if (L.secret && !savoir.lieuConnu(k)) pts.push([L.x, L.z, 0.7]); }
  let best = null, bs = 0;
  for (const [x, z, k] of pts) { const d = Math.hypot(x - p.pos[0], z - p.pos[2]); const sc = k / (1 + d / 60); if (sc > bs && d > 2) { bs = sc; best = { x, z, d }; } }
  if (!best) { ui.subtitle('', '(L’aiguille reste à zéro. La réalité est épaisse, ici.)', 3); return; }
  const ang = Math.atan2(best.x - p.pos[0], best.z - p.pos[2]), rel = angDiff(p.yaw + Math.PI, ang);
  const side = Math.abs(rel) < 0.5 ? 'droit devant' : Math.abs(rel) > 2.6 ? 'derrière vous' : rel > 0 ? 'sur votre gauche' : 'sur votre droite';
  const force = best.d < 30 ? 'L’aiguille bute dans le rouge' : best.d < 150 ? 'L’aiguille grimpe franchement' : 'L’aiguille frémit à peine';
  if (sound.ok) for (let k = 0; k < Math.max(2, Math.round(8 - best.d / 40)); k++) sound.tone(sound.at(k * 0.12), 'square', 1400, 1400, 0.03, 0.02);
  ui.subtitle('', `(${force} : la réalité est plus mince ${side}.)`, 4);
};
{
  const _hurt = play.hurt.bind(play);
  play.hurt = function (dmg, src, cause) { if (fondation.combi()) dmg *= 0.7; return _hurt(dmg, src, cause); };
}
HOOKS.load.push(() => {
  fondation.cherch = []; fondation.escorte = false; fondation.surface = null; fondation.machineT = 0; fondation.torcheOn = false; fondation.term = null;
  if (!farm.s) return;
  if (fondation.presente()) { fondation.S().on = true; fondation.initChercheurs(); }
});
