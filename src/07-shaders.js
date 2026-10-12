// ============================================================================
//  SHADERS GLSL (WebGL2)
//  Le rendu se règle par QUALITE (0 à 3), glissé après « #version » (voir Renderer.variante et l'option « Effets
//  visuels ») ; chaque morceau ci-dessous garde, sous QUALITE 0, le dessin d'avant tel quel (rien n'y coûte plus) :
//   0 (Basse)       : le rendu d'avant ;
//   1 (Moyenne)     : ciel de Rayleigh et de Mie (halo, crépuscule, ombre de la Terre, voie lactée), brume des
//                     vallées et perspective aérienne tirée vers le soleil, lumière du ciel et du sol, ombres des
//                     nuages, liseré à contre-jour, feuilles traversées par le soleil, vent en rafales, eau (Fresnel,
//                     reflets du ciel, éclats du soleil, rides, écume, ronds de pluie), sol mouillé, neige qui
//                     scintille ; paliers de lumière adoucis ; image en HDR puis exposition, courbe filmique douce,
//                     étalonnage (passe « resolve »), agrandissement net et lisse, tramage fin ;
//   2 (Haute)       : en plus : halo des lumières (bloom), rayons du soleil, anticrénelage, flou de profondeur des
//                     cinématiques, flaques, nuages reflétés dans l'eau ;
//   3 (Très haute)  : les mêmes, avec plus de prises.
// ============================================================================

const GLSL_HEAD = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
precision highp sampler2DArray;
#ifndef QUALITE
#define QUALITE 0
#endif
`;

// Bruit (une seule fois par programme, même si plusieurs morceaux le demandent)
const GLSL_NOISE = `
#ifndef G_BRUIT
#define G_BRUIT
float hash21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i), b = hash21(i + vec2(1.0, 0.0)), c = hash21(i + vec2(0.0, 1.0)), d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
#endif
`;

// Ombres des nuages (une petite carte autour de la caméra, refaite une image sur quatre) et rafales de vent
const GLSL_CLOUD = `
#ifndef G_NUAGES
#define G_NUAGES
uniform sampler2D uNuages;
uniform vec4 uNuagesO;   // xy : coin de la carte (m), z : 1 / sa taille, w : force de l'ombre (0 : aucune)
uniform vec2 uWindD;     // direction du vent (unitaire)
float cloudShade(vec2 p) {
#if QUALITE >= 1
  if (uNuagesO.w <= 0.0) return 1.0;
  return mix(1.0, texture(uNuages, (p - uNuagesO.xy) * uNuagesO.z).r, uNuagesO.w);
#else
  return 1.0;
#endif
}
// les rafales : des bandes de vent qui descendent la vallée (0 : accalmie, 1 : rafale) ; k : force du vent
float windGust(vec2 p, float t, float k) {
  vec2 q = vec2(dot(p, uWindD), dot(p, vec2(-uWindD.y, uWindD.x)));
  return clamp(0.5 + 0.5 * sin(q.x * 0.045 - t * (0.9 + 0.35 * k)) * (0.65 + 0.35 * sin(q.y * 0.031 + t * 0.23)), 0.0, 1.0);
}
#endif
`;

// Relief : lecture de la carte des hauteurs (+ montagnes hors du monde)
const GLSL_TERRAIN = `
uniform sampler2D uHeight;
uniform sampler2D uMat;
uniform int uN;
uniform float uCell;
` + GLSL_NOISE + `
float vertH(ivec2 v) {
  ivec2 c = clamp(v, ivec2(0), ivec2(uN));
  float h = texelFetch(uHeight, c, 0).r;
  ivec2 o = abs(v - c);
  float d = float(max(o.x, o.y));
  if (d > 0.0) {
    vec2 fv = vec2(v);
    float n = vnoise(fv * 0.07) * 0.55 + vnoise(fv * 0.19) * 0.3 + vnoise(fv * 0.45) * 0.15;
    h += d * uCell * (0.22 + n * 0.55) + d * d * 0.004 * uCell;
  }
  return h;
}
float terrainH(vec2 p) {
  vec2 g = p / uCell;
  vec2 fl = floor(g);
  ivec2 i = ivec2(fl);
  vec2 f = g - fl;
  float ha = vertH(i), hb = vertH(i + ivec2(1, 0)), hc = vertH(i + ivec2(0, 1)), hd = vertH(i + ivec2(1, 1));
  if (f.x + f.y <= 1.0) return ha + (hb - ha) * f.x + (hc - ha) * f.y;
  return hd + (hc - hd) * (1.0 - f.x) + (hb - hd) * (1.0 - f.y);
}
// la même, avec la pente du triangle (sa normale) : sans lecture de plus
float terrainHN(vec2 p, out vec3 n) {
  vec2 g = p / uCell;
  vec2 fl = floor(g);
  ivec2 i = ivec2(fl);
  vec2 f = g - fl;
  float ha = vertH(i), hb = vertH(i + ivec2(1, 0)), hc = vertH(i + ivec2(0, 1)), hd = vertH(i + ivec2(1, 1));
  if (f.x + f.y <= 1.0) { n = normalize(vec3(ha - hb, uCell, ha - hc)); return ha + (hb - ha) * f.x + (hc - ha) * f.y; }
  n = normalize(vec3(hc - hd, uCell, hb - hd));
  return hd + (hc - hd) * (1.0 - f.x) + (hb - hd) * (1.0 - f.y);
}
int matAtV(ivec2 v) {
  v = clamp(v, ivec2(0), ivec2(uN));
  return int(texelFetch(uMat, v, 0).r * 255.0 + 0.5);
}
`;

// Abris (toits, voûtes) : 1 si le point est sous un plafond
const GLSL_COVER = `
uniform sampler2D uCover;
uniform int uCoverW;
uniform vec2 uCoverO;
float coveredAt(vec3 p) {
  ivec2 c = ivec2(floor(p.xz - uCoverO));
  if (c.x < 0 || c.y < 0 || c.x >= uCoverW || c.y >= uCoverW) return 0.0;
  return p.y < texelFetch(uCover, c, 0).r - 0.05 ? 1.0 : 0.0;
}
`;

// Éclairage, brouillard, ciel (partagé)
const GLSL_LIGHT = `
uniform vec3 uCamPos;
uniform vec3 uCamFwd;
uniform vec3 uSunDir;
uniform vec3 uSunCol;
uniform vec3 uMoonDir;
uniform vec3 uMoonCol;
uniform vec3 uAmbient;
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uGlow;
uniform vec3 uHaze;
uniform vec2 uFog;
uniform vec4 uLights[12];
uniform vec3 uLightCols[12];
uniform int uNumLights;
uniform float uFlash;
uniform float uBands;
uniform float uTime;
uniform float uShadowK;
uniform float uWet;
uniform float uFrost;
uniform vec3 uAmbSky;     // lumière du ciel (hémisphère du haut)
uniform vec3 uAmbGround;  // lumière renvoyée par le sol (hémisphère du bas)
uniform vec4 uMist;       // x : fond de la brume (m), y : densité, z : 1 / épaisseur, w : perspective aérienne (1/m)
uniform vec4 uSunGlowC;   // rgb : le soleil dans la brume (diffusion vers l'avant), a : force
uniform float uSpec;      // reflets du sol mouillé (0 : non)
` + GLSL_NOISE + GLSL_CLOUD + `
#if QUALITE >= 1
// soleil bas : l'horizon chauffe de son côté et refroidit à l'opposé (aube, crépuscule)
float lowSun() { return smoothstep(0.42, 0.02, uSunDir.y) * smoothstep(-0.32, -0.05, uSunDir.y); }
#endif
vec3 skyGradient(vec3 d) {
  float h = d.y;
#if QUALITE >= 1
  float hc = clamp(h, 0.0, 1.0);
  float az = dot(normalize(d.xz + 1e-5), normalize(uSunDir.xz + 1e-5));
  vec3 hor = uHorizon * mix(vec3(1.0), mix(vec3(0.8, 0.77, 1.0), vec3(1.1, 1.0, 0.88), az * 0.5 + 0.5), lowSun());
  // Rayleigh : l'horizon clair et laiteux, le zénith profond ; la teinte descend en exponentielle
  vec3 col = mix(hor, uZenith, 1.0 - exp(-hc * 3.4));
  col += hor * 0.08 * exp(-hc * 22.0);
  if (h < 0.0) col = mix(hor, hor * 0.6, clamp(-h * 5.0, 0.0, 1.0));
  // l'ombre de la Terre et la ceinture de Vénus, à l'opposé du soleil qui se couche (ou se lève)
  float tw = smoothstep(0.1, -0.02, uSunDir.y) * smoothstep(-0.3, -0.06, uSunDir.y) * max(-az, 0.0);
  col = mix(col, col * vec3(0.74, 0.76, 0.93), tw * (1.0 - smoothstep(0.0, 0.06, hc)) * 0.8);
  col += uGlow * vec3(0.9, 0.55, 0.75) * tw * smoothstep(0.03, 0.08, hc) * (1.0 - smoothstep(0.1, 0.24, hc)) * 0.35;
  // Mie : le halo autour du soleil, large et doux, plus serré près du disque
  float s = max(dot(d, uSunDir), 0.0);
  col += uGlow * (pow(s, 6.0) * 0.42 + pow(s, 48.0) * 0.5 + pow(s, 420.0) * 1.1) * (1.0 - hc * 0.65);
  return col;
#else
  vec3 col = mix(uHorizon, uZenith, pow(clamp(h, 0.0, 1.0), 0.5));
  if (h < 0.0) col = mix(uHorizon, uHorizon * 0.6, clamp(-h * 5.0, 0.0, 1.0));
  float s = max(dot(d, uSunDir), 0.0);
  col += uGlow * (pow(s, 5.0) * 0.55 + pow(s, 40.0) * 0.5) * (1.0 - clamp(h, 0.0, 1.0) * 0.7);
  return col;
#endif
}
// Brume atmosphérique : couleur vers laquelle tout s'estompe (identique aux montagnes du ciel)
vec3 hazeColor(vec3 d) {
  vec2 a = normalize(d.xz + 1e-5), b = normalize(uSunDir.xz + 1e-5);
  float s = max(dot(a, b), 0.0);
#if QUALITE >= 1
  vec3 hz = uHaze * mix(vec3(1.0), mix(vec3(0.82, 0.8, 1.0), vec3(1.08, 1.0, 0.9), dot(a, b) * 0.5 + 0.5), lowSun());
  // la diffusion vers l'avant : la brume s'allume du côté du soleil
  float sd = max(dot(d, uSunDir), 0.0);
  hz += uSunGlowC.rgb * (pow(sd, 5.0) * 0.6 + pow(sd, 24.0) * 0.4) * uSunGlowC.a;
  return hz + uGlow * pow(s, 6.0) * 0.3 * (1.0 - clamp(uSunDir.y * 2.5, 0.0, 1.0));
#else
  return uHaze + uGlow * pow(s, 6.0) * 0.3 * (1.0 - clamp(uSunDir.y * 2.5, 0.0, 1.0));
#endif
}
vec3 applyFog(vec3 col, vec3 p) {
  vec3 v = p - uCamPos;
  float d = length(v);
  float f = smoothstep(uFog.x, uFog.y, d);
#if QUALITE >= 1
  // perspective aérienne : un voile léger dès les premières dizaines de mètres
  f = max(f, (1.0 - exp(-d * uMist.w)) * 0.3);
  // la brume des vallées (le matin, les jours de brouillard) : dense au ras du fond, plus mince en montant
  if (uMist.y > 0.0) {
    float k = uMist.z, h0 = uCamPos.y - uMist.x, h1 = p.y - uMist.x;
    float e0 = exp(-k * max(h0, 0.0)), e1 = exp(-k * max(h1, 0.0)), dh = h1 - h0;
    float I = abs(dh) > 0.05 && abs(e0 - e1) > 1e-4 ? (e0 - e1) / (k * dh) : 0.5 * (e0 + e1);
    f = 1.0 - (1.0 - f) * exp(-uMist.y * d * I);
  }
  // (les paliers du brouillard, adoucis : pas d'arête entre deux marches)
  if (uBands > 0.0) { float x = f * 24.0, fl = floor(x); f = (fl + smoothstep(0.25, 0.75, x - fl)) / 24.0; }
#else
  f = floor(f * 24.0 + 0.5) / 24.0;
#endif
  return mix(col, hazeColor(v / max(d, 0.001)), f);
}
vec3 dynLights(vec3 p, vec3 n, float useN) {
  vec3 acc = vec3(0.0);
  for (int i = 0; i < 12; i++) {
    if (i >= uNumLights) break;
    vec3 lv = uLights[i].xyz - p;
    float d = length(lv);
    float a = clamp(1.0 - d / uLights[i].w, 0.0, 1.0);
    a *= a;
    float nd = mix(1.0, max(dot(n, lv / max(d, 0.001)), 0.0) * 0.75 + 0.25, useN);
    acc += uLightCols[i] * a * nd;
  }
  if (uFlash > 0.0) {
    vec3 tv = p - uCamPos;
    float d = length(tv);
    vec3 td = tv / max(d, 0.001);
    float c = dot(td, uCamFwd);
    float spot = smoothstep(0.84, 0.93, c) * 0.8 + smoothstep(0.95, 0.99, c) * 0.4;
    float a = clamp(1.0 - d / 34.0, 0.0, 1.0);
    float nd = mix(1.0, max(dot(n, -td), 0.0) * 0.8 + 0.2, useN);
    acc += vec3(1.0, 0.94, 0.8) * spot * a * a * nd * uFlash * 1.9;
  }
  return acc;
}
const float BAY[16] = float[16](0.0, 8.0, 2.0, 10.0, 12.0, 4.0, 14.0, 6.0, 3.0, 11.0, 1.0, 9.0, 15.0, 7.0, 13.0, 5.0);
float bayer4(vec2 fc) { ivec2 p = ivec2(fc) & 3; return (BAY[p.y * 4 + p.x] + 0.5) / 16.0; }
vec3 bandLight(vec3 l) {
  if (uBands <= 0.0) return l;
  float m = max(max(l.r, l.g), max(l.b, 1e-4));
#if QUALITE >= 1
  // (des paliers adoucis : la lumière garde ses marches, sans arête dure entre elles)
  float x = m * uBands, fl = floor(x);
  float q = max(fl + smoothstep(0.3, 0.7, x - fl), 1.0) / uBands;
#else
  float q = max(floor(m * uBands + 0.5), 1.0) / uBands;
#endif
  return l * (q / m);
}
#if QUALITE >= 1
// la lumière du ciel en haut, celle renvoyée par le sol en bas
vec3 hemiAmb(vec3 n) { return mix(uAmbGround, uAmbSky, clamp(n.y * 0.5 + 0.5, 0.0, 1.0)); }
// le soleil « enveloppé » : la frontière de l'ombre propre est plus douce
float wrapNL(vec3 n, vec3 l) { return clamp((dot(n, l) + 0.16) / 1.16, 0.0, 1.0); }
// le liseré : les bords des volumes s'allument à contre-jour
vec3 rimLight(vec3 n, vec3 vd) {
  float r = 1.0 - clamp(dot(n, -vd), 0.0, 1.0);
  r = r * r * r;
  return (uSunCol * smoothstep(-0.2, 0.9, dot(vd, uSunDir)) * 0.5 + uAmbSky * 0.2) * r;
}
// les sources très claires (lampes, braises, vitres la nuit) débordent un peu : le halo des lumières les prend
vec3 emitK(vec3 c) { return c * (1.0 + 1.6 * smoothstep(0.55, 0.95, max(max(c.r, c.g), c.b))); }
#endif
`;

// Les nuages du ciel (couverture et lumière), pour le ciel et pour l'eau qui les reflète
const GLSL_SKYCLOUDS = `
uniform vec3 uCloudLit;
uniform vec3 uCloudDark;
uniform float uCloudCover;
uniform float uCloudT;
uniform vec3 uSunDisk;
uniform float uSunVis;
vec3 cloudLayer(vec3 d, vec3 col) {
  vec2 cp = d.xz / (d.y + 0.1) * 1.6 + vec2(uCloudT * 0.008, uCloudT * 0.003);
  cp = floor(cp * 48.0) / 48.0;
  float c = vnoise(cp * 1.2) * 0.55 + vnoise(cp * 2.7 + 3.0) * 0.3 + vnoise(cp * 6.3 + 9.0) * 0.15;
  float cov = smoothstep(0.53 - uCloudCover * 0.38, 0.68 - uCloudCover * 0.3, c) * smoothstep(0.0, 0.18 - uCloudCover * 0.12, d.y);
  float lit = clamp((c - 0.53) * 3.0 + dot(normalize(vec3(uSunDir.x, 0.0, uSunDir.z) + 0.001), normalize(vec3(d.x, 0.0, d.z))) * 0.25, 0.0, 1.0);
#if QUALITE >= 1
  // (des paliers adoucis : les nuages gardent leurs marches, sans arêtes dures)
  float x = cov * 5.0, y = lit * 4.0;
  cov = (floor(x) + smoothstep(0.3, 0.7, fract(x))) / 5.0;
  vec3 cc = mix(uCloudDark, uCloudLit, (floor(y) + smoothstep(0.3, 0.7, fract(y))) / 4.0);
  // le soleil traverse les bords des nuages qui l'approchent (liseré d'argent) et les éclaire par-derrière
  float s = max(dot(d, uSunDir), 0.0), edge = cov * (1.0 - cov) * 4.0;
  cc += uSunDisk * uSunVis * (pow(s, 10.0) * (0.22 + edge * 0.8) + pow(s, 48.0) * edge * 1.3);
#else
  cov = floor(cov * 4.0 + 0.5) / 4.0;
  vec3 cc = mix(uCloudDark, uCloudLit, floor(lit * 3.0 + 0.5) / 3.0);
#endif
  return mix(col, cc, cov * 0.92);
}
`;

const SH = {};

// ---------------------------------------------------------------- terrain
SH.terrainVS = GLSL_HEAD + GLSL_TERRAIN + `
layout(location = 0) in vec2 aGrid;
layout(location = 1) in vec2 aChunk;
uniform mat4 uViewProj;
out vec3 vPos;
out vec3 vNormal;
void main() {
  ivec2 v = ivec2(aChunk + aGrid);
  float h = vertH(v);
  float hl = vertH(v - ivec2(1, 0)), hr = vertH(v + ivec2(1, 0)), hd = vertH(v - ivec2(0, 1)), hu = vertH(v + ivec2(0, 1));
  vNormal = normalize(vec3(hl - hr, 2.0 * uCell, hd - hu));
  vPos = vec3(float(v.x) * uCell, h, float(v.y) * uCell);
  gl_Position = uViewProj * vec4(vPos, 1.0);
}`;

SH.terrainFS = GLSL_HEAD + GLSL_TERRAIN + GLSL_COVER + GLSL_LIGHT + `
uniform sampler2DArray uTex;
uniform sampler2D uShade;
uniform vec4 uBrush;
uniform vec3 uBrushCol;
uniform vec2 uShadowOff;
uniform float uWater;
in vec3 vPos;
in vec3 vNormal;
out vec4 outCol;
float shadeAt(vec2 p) {
  vec2 uv = (p / uCell + 0.5) / float(uN + 1);
  return texture(uShade, uv).r;
}
void main() {
  vec2 wp = vPos.xz;
  vec3 n = normalize(vNormal);
  float S = float(uN) * uCell;
  int m;
  if (wp.x < 0.0 || wp.y < 0.0 || wp.x > S || wp.y > S) {
    float r = n.y + (hash21(floor(wp * 8.0)) - 0.5) * 0.08;
    m = r < 0.78 ? 6 : (r < 0.86 ? 3 : 0);
  } else {
    vec2 tq = floor(wp * 8.0);
    vec2 jit = (vec2(vnoise(wp * 0.45), vnoise(wp * 0.45 + 31.7)) - 0.5) * 1.1 + (vec2(hash21(tq), hash21(tq + 7.3)) - 0.5) * 0.35;
    m = matAtV(ivec2(floor(wp / uCell + jit + 0.5)));
  }
  // falaises : la roche apparaît sur les pentes très raides
  float dth = bayer4(gl_FragCoord.xy) * 0.12;
  if (m <= 3 && n.y < 0.5 + dth) m = 6;
  // projection selon l'axe dominant (évite l'étirement sur les pentes) ; la roche des pentes raides est en strates
  vec2 uv = wp;
  if (n.y < 0.62 + dth) { uv = abs(n.x) > abs(n.z) ? vec2(vPos.z, -vPos.y) : vec2(vPos.x, -vPos.y); if (m == 6) m = ${M_CLIFF}; }
  vec3 alb = texture(uTex, vec3(uv / 4.0, float(m))).rgb;
  alb *= mix(0.84, 1.1, vnoise(wp * 0.035)) * mix(0.94, 1.05, vnoise(wp * 0.23 + 5.0));
  float cov = coveredAt(vPos + n * 0.15);
  alb *= 1.0 - uWet * 0.22 * (1.0 - cov);
  if (uFrost > 0.0) alb = mix(alb, vec3(0.82, 0.86, 0.9), uFrost * 0.6 * smoothstep(0.55, 0.9, n.y) * (1.0 - cov) * (0.7 + 0.3 * vnoise(wp * 2.0)));
  float sh0 = shadeAt(wp);
#if QUALITE >= 1
  // les ombres portées : trois prises le long de la lumière, mêlées (bords plus doux, ombres longues au soleil bas)
  float s1 = shadeAt(wp + uShadowOff * 0.3), s2 = shadeAt(wp + uShadowOff * 0.6), s3 = shadeAt(wp + uShadowOff * 0.9);
  float shd = max(sh0 * 0.8, max(max(s1, s2), s3) * 0.45 + (s1 + s2 + s3) * 0.1833);
  float occl = (1.0 - shd * uShadowK) * (1.0 - cov);
  float cs = cloudShade(wp);
  vec3 L = hemiAmb(n) * (1.0 - sh0 * 0.45) * (1.0 - 0.62 * cov)
         + (uSunCol * cs * wrapNL(n, uSunDir) + uMoonCol * max(dot(n, uMoonDir), 0.0)) * occl
         + dynLights(vPos, n, 1.0);
  vec3 col = alb * bandLight(L);
  vec3 vd = normalize(vPos - uCamPos);
  // le sol mouillé : il renvoie le ciel et le soleil (et, en Haute, des flaques dans les creux plats)
  if (uWet > 0.02 && uSpec > 0.0 && cov < 0.5) {
    float wk = uWet * smoothstep(0.6, 0.95, n.y) * (m <= 3 ? 0.16 : 0.45); // (l'herbe mouillée brille peu, la terre et la pierre davantage)
#if QUALITE >= 2
    float pud = smoothstep(0.6, 0.68, vnoise(wp * 0.45 + 3.7)) * smoothstep(0.95, 0.99, n.y) * ((m == 4 || m == 7) ? 1.0 : 0.0) * smoothstep(0.2, 0.7, uWet);
    col *= 1.0 - pud * 0.45;
    wk = max(wk, pud * 1.6);
#endif
    vec3 rd = reflect(vd, n);
    float fr = 0.04 + 0.96 * pow(1.0 - max(dot(-vd, n), 0.0), 5.0);
    col += (skyGradient(vec3(rd.x, abs(rd.y), rd.z)) * fr + uSunCol * cs * pow(max(dot(rd, uSunDir), 0.0), 90.0) * 3.0 * occl) * wk * uSpec;
  }
  // la neige et le givre scintillent au soleil (des éclats qui changent avec le regard)
  if ((m == ${M_SNOW} || m == ${M_ICE} || uFrost > 0.3) && cov < 0.5) {
    vec2 sc = floor(wp * 14.0);
    float g = hash21(sc + floor(vd.xz * 36.0) * 7.31);
    float glit = step(0.986, g) * smoothstep(0.3, 0.8, n.y) * (m == ${M_SNOW} || m == ${M_ICE} ? 1.0 : uFrost * 0.6) * (1.0 - smoothstep(22.0, 55.0, length(vPos - uCamPos)));
    col += (uSunCol * cs * occl * 2.6 + uMoonCol * 3.0) * glit;
  }
#else
  float shd = max(sh0 * 0.8, max(shadeAt(wp + uShadowOff * 0.45), shadeAt(wp + uShadowOff * 0.9)));
  float occl = (1.0 - shd * uShadowK) * (1.0 - cov);
  vec3 L = uAmbient * (0.65 + 0.35 * n.y) * (1.0 - sh0 * 0.45) * (1.0 - 0.62 * cov)
         + (uSunCol * max(dot(n, uSunDir), 0.0) + uMoonCol * max(dot(n, uMoonDir), 0.0)) * occl
         + dynLights(vPos, n, 1.0);
  vec3 col = alb * bandLight(L);
#endif
  if (vPos.y < uWater) col *= mix(vec3(1.0), vec3(0.5, 0.72, 0.78), clamp((uWater - vPos.y) * 0.8, 0.0, 1.0));
  col = applyFog(col, vPos);
  if (uBrush.w > 0.0) {
    float d = length(wp - uBrush.xy);
    float w = max(0.12, uBrush.z * 0.035);
    if (abs(d - uBrush.z) < w) col = mix(col, uBrushCol, 0.9);
    else if (d < uBrush.z) col = mix(col, uBrushCol, 0.1);
    if (d < max(0.15, uBrush.z * 0.03)) col = uBrushCol;
  }
  outCol = vec4(col, 1.0);
}`;

// ---------------------------------------------------------------- ciel
SH.fullVS = GLSL_HEAD + `
out vec2 vNdc;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)) * 2.0 - 1.0;
  vNdc = p;
  gl_Position = vec4(p, 0.9999, 1.0);
}`;

SH.skyFS = GLSL_HEAD + GLSL_TERRAIN + GLSL_LIGHT + GLSL_SKYCLOUDS + `
uniform vec3 uCamR;
uniform vec3 uCamU;
uniform vec2 uTan;
uniform float uStars;
uniform float uPixAng;
uniform mat3 uStarRot;
uniform float uMoonVis;
uniform vec3 uMoonTint;
uniform float uMoon2;
in vec2 vNdc;
out vec4 outCol;
float ridge(float az, float sc, float seed) {
  vec2 q = vec2(cos(az), sin(az)) * sc + seed;
  return vnoise(q) * 0.6 + vnoise(q * 2.3) * 0.28 + vnoise(q * 5.3) * 0.12;
}
void main() {
  vec3 d = normalize(uCamFwd + uCamR * vNdc.x * uTan.x + uCamU * vNdc.y * uTan.y);
  vec3 col = skyGradient(d);
  // étoiles
  if (uStars > 0.01 && d.y > -0.02) {
    vec3 sd = uStarRot * d;
    float el = asin(clamp(sd.y, -1.0, 1.0));
    float az = atan(sd.z, sd.x);
    float cs = 0.011;
    vec2 g = vec2(az * cos(el), el) / cs;
    vec2 gi = floor(g), gf = fract(g);
    float h = hash21(gi + 13.1);
    if (h > 0.962) {
      vec2 sp = vec2(hash21(gi + 1.7), hash21(gi + 4.2)) * 0.8 + 0.1;
      float dist = length(gf - sp) * cs;
      float br = (h - 0.962) / 0.038;
      float tw = 0.6 + 0.4 * sin(uTime * (1.5 + h * 6.0) + h * 91.0);
      vec3 sc = mix(vec3(0.75, 0.82, 1.0), vec3(1.0, 0.92, 0.78), hash21(gi + 9.9));
      if (dist < uPixAng * 0.7) col += sc * uStars * tw * (0.3 + br * 0.9) * smoothstep(-0.02, 0.12, d.y);
    }
#if QUALITE >= 1
    // la voie lactée : une bande de poussière d'étoiles, plus dense au cœur, fendue d'une traînée sombre
    float bx = sd.x * 3.0 + sd.y * 0.5;
    float band = exp(-bx * bx * 2.0);
    float mw = band * (0.5 + 0.5 * vnoise(g * 0.05)) * (0.55 + 0.45 * vnoise(g * 0.14 + 9.0));
    float lane = 1.0 - 0.55 * exp(-pow(bx * 5.0 + (vnoise(g * 0.025 + 3.0) - 0.5) * 2.5, 2.0));
    col += vec3(0.085, 0.09, 0.13) * mw * lane * uStars * smoothstep(0.0, 0.3, d.y);
    // et la poussière : de petites étoiles pâles, plus nombreuses dans la bande
    float h2 = hash21(gi * 1.37 + 71.0);
    if (h2 > 0.93 - band * 0.05 && length(gf - 0.5) * cs < uPixAng * 0.55) col += vec3(0.5, 0.55, 0.7) * uStars * (h2 - 0.88) * 2.2 * (0.7 + 0.3 * sin(uTime * 3.1 + h2 * 50.0)) * smoothstep(0.02, 0.2, d.y);
#else
    // voie lactée discrète
    float band = exp(-pow(sd.x * 3.0 + sd.y * 0.5, 2.0) * 2.0);
    col += vec3(0.07, 0.08, 0.12) * band * vnoise(g * 0.08) * uStars * smoothstep(0.0, 0.3, d.y);
#endif
  }
  // lune
  float md = dot(d, uMoonDir);
  float moonR = 0.03;
  if (md > cos(moonR * 4.0)) col += vec3(0.25, 0.3, 0.4) * pow(smoothstep(cos(moonR * 4.0), 1.0, md), 3.0) * uMoonVis * 0.5;
  if (md > cos(moonR)) {
    vec3 mr = normalize(cross(uMoonDir, vec3(0.0, 1.0, 0.0)));
    vec3 mu = cross(mr, uMoonDir);
    vec2 q = vec2(dot(d, mr), dot(d, mu)) / moonR;
    q = floor(q * 6.0) / 6.0;
    float cr = vnoise(q * 2.5 + 4.0) * 0.6 + vnoise(q * 6.0 + 1.0) * 0.4;
    vec3 mc = mix(vec3(0.66, 0.69, 0.74), vec3(0.97, 0.96, 0.9), smoothstep(0.38, 0.62, cr)) * uMoonTint;
#if QUALITE >= 1
    mc *= 1.35; // (un peu plus claire que le blanc : le halo la prend)
#endif
    col = mix(col, mc, uMoonVis);
  }
  if (uMoon2 > 0.0) {
    vec3 m2 = normalize(uMoonDir + vec3(0.32, 0.06, -0.21));
    float md2 = dot(d, m2);
    if (md2 > cos(0.022)) col = mix(col, vec3(0.9, 0.88, 0.8) * uMoonTint, uMoon2 * uMoonVis);
  }
  // soleil
  float sdt = dot(d, uSunDir);
  float sunR = 0.045;
#if QUALITE >= 1
  // la couronne, douce, puis le disque (plus sombre au bord) bien plus clair que le blanc
  col += uSunDisk * uSunVis * pow(smoothstep(cos(sunR * 3.2), cos(sunR), sdt), 2.0) * 0.35;
  if (sdt > cos(sunR)) { float r = clamp((1.0 - sdt) / (1.0 - cos(sunR)), 0.0, 1.0); col = mix(col, uSunDisk * (3.2 - 1.2 * r * r), uSunVis); }
#else
  if (sdt > cos(sunR)) col = mix(col, uSunDisk, uSunVis);
  else if (sdt > cos(sunR * 2.2)) col += uSunDisk * 0.35 * uSunVis * floor(smoothstep(cos(sunR * 2.2), cos(sunR), sdt) * 3.0) / 3.0;
#endif
  // nuages pixelisés
  if (d.y > 0.0) col = cloudLayer(d, col);
  // montagnes lointaines (façon ciel de Doom)
  float az = atan(d.z, d.x);
  float m1 = 0.03 + ridge(az, 2.6, 3.0) * 0.08;
  float m2 = 0.01 + ridge(az, 4.2, 11.0) * 0.05;
  vec3 hz = hazeColor(d);
  if (d.y < m1) col = mix(hz, skyGradient(d), 0.45);
  if (d.y < m2) col = hz;
  outCol = vec4(col, 1.0);
}`;

// ---------------------------------------------------------------- sprites (objets)
SH.spriteVS = GLSL_HEAD + GLSL_TERRAIN + GLSL_COVER + GLSL_CLOUD + `
layout(location = 0) in vec2 aCorner;
layout(location = 1) in vec3 iPos;
layout(location = 2) in vec2 iSize;
layout(location = 3) in vec4 iUV;
layout(location = 4) in vec4 iMisc;
uniform mat4 uViewProj;
uniform vec3 uCamRight;
uniform float uTimeV;
uniform float uNightLit;
uniform float uPowerV;
uniform float uWindV;
uniform sampler2D uShade;
out vec2 vUV;
out vec3 vPos;
out float vShade;
out float vY;
out float vCov;
out float vBurn;
out float vT;
#if QUALITE >= 1
out vec3 vTintS;
out float vVeg;
out float vCloud;
#endif
void main() {
  float sw = iMisc.x * aCorner.y * aCorner.y * uWindV;
  vec3 p = iPos + uCamRight * (aCorner.x * iSize.x) + vec3(0.0, aCorner.y * iSize.y, 0.0);
  float ph = uTimeV * 1.4 + iPos.x * 0.21 + iPos.z * 0.17;
#if QUALITE >= 1
  // le vent : il couche les plantes dans sa direction, plus fort dans les rafales, et elles frémissent
  float gu = windGust(iPos.xz, uTimeV, uWindV);
  vec2 bend = uWindD * (0.3 + 0.7 * gu) * 0.85 + vec2(sin(ph) + sin(ph * 2.3) * 0.3, cos(ph * 0.8) * 0.5) * (0.4 + 0.45 * gu);
  p.xz += bend * sw;
  float hv = hash21(iPos.xz * 0.37 + 1.3), hv2 = hash21(iPos.xz * 0.71 + 8.1);
  vVeg = iMisc.x > 0.0 ? 1.0 : 0.0;
  vTintS = mix(vec3(1.0), vec3(1.0 + (hv - 0.5) * 0.16, 1.0 + (hv2 - 0.5) * 0.1, 1.0 - (hv - 0.5) * 0.14), vVeg);
  vCloud = cloudShade(iPos.xz);
#else
  p.x += (sin(ph) + sin(ph * 2.3) * 0.3) * sw;
  p.z += cos(ph * 0.8) * sw * 0.5;
#endif
  int flags = int(iMisc.z + 0.5);
  vBurn = (flags & 8) != 0 ? 1.0 : 0.0;
  vT = uTimeV;
  if (vBurn > 0.5) sw *= 3.0;
  float frame = 0.0;
  if ((flags & 1) != 0) frame = uNightLit;
  if ((flags & 2) != 0) frame = mod(floor(uTimeV * 9.0 + iPos.x * 3.1), iMisc.y);
  if ((flags & 4) != 0) frame = uPowerV;
  float u = aCorner.x + 0.5;
  if (iMisc.w > 0.5) u = 1.0 - u;
  float fw = iUV.z - iUV.x;
  vUV = vec2(iUV.x + fw * (frame + u), mix(iUV.w, iUV.y, aCorner.y));
  vPos = p;
  vY = aCorner.y;
  vShade = texture(uShade, (iPos.xz / uCell + 0.5) / float(uN + 1)).r;
  vCov = coveredAt(iPos + vec3(0.0, 0.3, 0.0));
  gl_Position = uViewProj * vec4(p, 1.0);
}`;

SH.spriteFS = GLSL_HEAD + GLSL_LIGHT + `
uniform sampler2D uAtlas;
in vec2 vUV;
in vec3 vPos;
in float vShade;
in float vY;
in float vCov;
in float vBurn;
in float vT;
#if QUALITE >= 1
in vec3 vTintS;
in float vVeg;
in float vCloud;
#endif
out vec4 outCol;
void main() {
  vec4 t = texture(uAtlas, vUV);
  if (t.a < 0.5) discard;
  if (smoothstep(0.6, 2.4, length(vPos - uCamPos)) < bayer4(gl_FragCoord.xy)) discard;
  vec3 col = t.rgb;
  if (t.a > 0.9) {
    float ao = mix(0.7, 1.0, clamp(vY * 3.0, 0.0, 1.0));
#if QUALITE >= 1
    // le pied reçoit la lumière du sol, la cime celle du ciel ; face au soleil la plante est éclairée, à contre-jour
    // elle s'assombrit, mais ses feuilles laissent passer le soleil
    vec3 vd = normalize(vPos - uCamPos);
    float vs = dot(vd, uSunDir), front = 1.0 - 0.36 * smoothstep(0.0, 1.0, vs) * vVeg;
    vec3 amb = mix(uAmbGround, uAmbSky, clamp(0.3 + vY * 0.7, 0.0, 1.0));
    float sunOcc = (1.0 - vShade * 0.35 * uShadowK) * (1.0 - vCov) * vCloud;
    vec3 L = amb * (1.0 - vShade * 0.3) * ao * (1.0 - 0.62 * vCov) + (uSunCol * 0.78 * front * vCloud + uMoonCol * 0.7) * (1.0 - vShade * 0.35 * uShadowK) * (1.0 - vCov) + dynLights(vPos, vec3(0.0), 0.0);
    L += uSunCol * pow(max(vs, 0.0), 3.0) * 0.8 * vVeg * sunOcc * smoothstep(0.1, 0.5, vY);
    col *= bandLight(L) * vTintS;
#else
    vec3 L = uAmbient * (1.0 - vShade * 0.3) * ao * (1.0 - 0.62 * vCov) + (uSunCol * 0.78 + uMoonCol * 0.7) * (1.0 - vShade * 0.35 * uShadowK) * (1.0 - vCov) + dynLights(vPos, vec3(0.0), 0.0);
    col *= bandLight(L);
#endif
    col = applyFog(col, vPos);
  } else {
#if QUALITE >= 1
    col = mix(emitK(col) * 1.15, applyFog(col, vPos), 0.35);
#else
    col = mix(col * 1.15, applyFog(col, vPos), 0.35);
#endif
  }
  // en feu : le feuillage rougeoie et vacille (braises en bas, flammes en haut)
  if (vBurn > 0.5) {
    float fl = 0.55 + 0.45 * sin(vT * 9.0 + vPos.y * 2.3 + vPos.x * 1.3) * sin(vT * 5.7 + vPos.z * 2.9 - vPos.y);
    vec3 ember = mix(vec3(0.75, 0.16, 0.03), vec3(1.5, 0.85, 0.25), clamp(vY * 0.8 + fl * 0.45, 0.0, 1.0));
    col = mix(col * 0.3, ember, clamp(0.45 + 0.4 * fl, 0.0, 1.0));
  }
  outCol = vec4(col, 1.0);
}`;

// ---------------------------------------------------------------- champ d'herbe (GPU, suit la caméra)
SH.grassVS = GLSL_HEAD + GLSL_TERRAIN + GLSL_COVER + GLSL_CLOUD + `
layout(location = 0) in vec2 aCorner;
uniform mat4 uViewProj;
uniform vec3 uCamPosV;
uniform vec3 uCamRight;
uniform int uGridN;
uniform float uSpacing;
uniform float uRadius;
uniform float uWaterV;
uniform float uTimeV;
uniform float uWindV;
uniform vec4 uGUV[12];
uniform vec2 uGSize[12];
uniform sampler2D uShade;
out vec2 vUV;
out vec3 vPos;
out float vShade;
out float vY;
out float vTint;
out float vCov;
#if QUALITE >= 1
uniform vec3 uSunDir;
out vec3 vTintG;
out float vCloud;
out float vSunN;
#endif
void main() {
  int G = uGridN;
  vec2 base = vec2(float(gl_InstanceID % G), float(gl_InstanceID / G));
  vec2 camCell = floor(uCamPosV.xz / uSpacing);
  vec2 cellc = base + float(G) * floor((camCell - base) / float(G) + 0.5);
  float h1 = hash21(cellc * 0.731 + 11.0), h2 = hash21(cellc * 1.37 + 3.0), h3 = hash21(cellc + 71.3), h4 = hash21(cellc * 0.53 + 29.1);
  vec2 wp = (cellc + vec2(h1, h2)) * uSpacing;
  float dist = length(wp - uCamPosV.xz);
  float S = float(uN) * uCell;
  bool ok = wp.x > 0.5 && wp.y > 0.5 && wp.x < S - 0.5 && wp.y < S - 0.5 && dist < uRadius;
  int m = matAtV(ivec2(floor(wp / uCell + 0.5)));
  float dens = 0.0, flowerP = 0.0;
  bool dry = false;
  if (m == 0) { dens = 0.8; flowerP = 0.04; }
  else if (m == 1) { dens = 0.95; flowerP = 0.015; }
  else if (m == 2) { dens = 0.9; flowerP = 0.42; }
  else if (m == 3) { dens = 0.75; flowerP = 0.01; dry = true; }
  else if (m == 4 || m == 7) { dens = 0.03; }
  // (pas de touffe ici : trop loin, ou un sol sans herbe ; on s'arrête avant de lire le relief et les abris)
  if (!ok || h3 > dens) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
#if QUALITE >= 1
  // (la pente du pré : l'herbe d'un versant tourné vers le soleil s'allume, l'autre reste dans l'ombre du relief)
  vec3 tn;
  float h = terrainHN(wp, tn);
  vSunN = clamp((dot(tn, uSunDir) + 0.1) / 1.1, 0.0, 1.0);
#else
  float h = terrainH(wp);
#endif
  if (h < uWaterV + 0.05 || h3 > dens || coveredAt(vec3(wp.x, h + 0.3, wp.y)) > 0.5) ok = false;
  int v;
  if (h4 < flowerP) v = 6 + int(fract(h4 * 97.13 + h1) * 6.0);
  else if (dry) v = 4 + int(fract(h1 * 7.3) * 2.0);
  else { float r = fract(h1 * 13.7 + h2 * 3.1); v = r < 0.34 ? 0 : (r < 0.68 ? 1 : (r < 0.9 ? 2 : 3)); }
  float fade = 1.0 - smoothstep(uRadius * 0.55, uRadius, dist);
  vec2 size = uGSize[v] * (0.72 + h2 * 0.45) * fade;
  if (!ok) size = vec2(0.0);
  vec3 p = vec3(wp.x, h - 0.05, wp.y) + uCamRight * (aCorner.x * size.x) + vec3(0.0, aCorner.y * size.y, 0.0);
  float sw = aCorner.y * aCorner.y * 0.14 * size.y * uWindV;
  float ph = uTimeV * (1.8 + uWindV * 0.6) + wp.x * 0.35 + wp.y * 0.27;
  vCov = coveredAt(vec3(wp.x, h + 0.2, wp.y));
#if QUALITE >= 1
  // le vent couche l'herbe dans sa direction ; les rafales passent en vagues sur le pré
  float gu = windGust(wp, uTimeV, uWindV);
  p.xz += (uWindD * (0.2 + 0.9 * gu) + vec2(sin(ph), cos(ph * 0.7) * 0.6) * (0.45 + 0.35 * gu)) * sw;
  vTintG = vec3(1.0 + (h4 - 0.5) * 0.1, 1.0 + (h3 - 0.5) * 0.06, 1.0 - (h4 - 0.5) * 0.12);
  vCloud = cloudShade(wp);
#else
  p.x += sin(ph) * sw;
  p.z += cos(ph * 0.7) * sw * 0.6;
#endif
  vec4 uv = uGUV[v];
  float u = aCorner.x + 0.5;
  if (h1 > 0.5) u = 1.0 - u;
  vUV = vec2(mix(uv.x, uv.z, u), mix(uv.w, uv.y, aCorner.y));
  vPos = p;
  vY = aCorner.y;
  vTint = 0.84 + fract(h3 * 17.31) * 0.3;
  vShade = texture(uShade, (wp / uCell + 0.5) / float(uN + 1)).r;
  gl_Position = uViewProj * vec4(p, 1.0);
}`;

SH.grassFS = GLSL_HEAD + GLSL_LIGHT + `
uniform sampler2D uAtlas;
in vec2 vUV;
in vec3 vPos;
in float vShade;
in float vY;
in float vTint;
in float vCov;
#if QUALITE >= 1
in vec3 vTintG;
in float vCloud;
in float vSunN;
#endif
out vec4 outCol;
void main() {
  vec4 t = texture(uAtlas, vUV);
  if (t.a < 0.5) discard;
  float ao = mix(0.62, 1.0, clamp(vY * 1.6, 0.0, 1.0));
#if QUALITE >= 1
  // les brins : la lumière du sol en bas, du ciel en haut ; le soleil selon le versant ; à contre-jour, il passe au travers
  vec3 amb = mix(uAmbGround, uAmbSky, clamp(0.25 + vY * 0.75, 0.0, 1.0));
  float sunOcc = (1.0 - vShade * 0.7 * uShadowK) * (1.0 - vCov) * vCloud;
  vec3 L = amb * (1.0 - vShade * 0.45) * ao * (1.0 - 0.62 * vCov) + (uSunCol * 0.86 * (0.4 + 0.6 * vSunN) * vCloud + uMoonCol * 0.7) * (1.0 - vShade * 0.7 * uShadowK) * ao * (1.0 - vCov) + dynLights(vPos, vec3(0.0), 0.0);
  float vs = max(dot(normalize(vPos - uCamPos), uSunDir), 0.0);
  L += uSunCol * vs * vs * vs * 0.85 * vY * sunOcc;
  vec3 col = t.rgb * vTint * vTintG;
#else
  vec3 L = uAmbient * (1.0 - vShade * 0.45) * ao * (1.0 - 0.62 * vCov) + (uSunCol * 0.8 + uMoonCol * 0.7) * (1.0 - vShade * 0.7 * uShadowK) * ao * (1.0 - vCov) + dynLights(vPos, vec3(0.0), 0.0);
  vec3 col = t.rgb * vTint;
#endif
  if (uFrost > 0.0) col = mix(col, vec3(0.8, 0.85, 0.9), uFrost * 0.55 * clamp(vY * 1.5, 0.0, 1.0) * (1.0 - vCov));
  col *= bandLight(L);
  outCol = vec4(applyFog(col, vPos), 1.0);
}`;

// ---------------------------------------------------------------- eau
SH.waterVS = GLSL_HEAD + `
uniform mat4 uViewProj;
uniform float uWaterV;
uniform vec4 uRect;
out vec3 vPos;
void main() {
  vec2 c[6] = vec2[6](vec2(0.0, 0.0), vec2(0.0, 1.0), vec2(1.0, 0.0), vec2(1.0, 0.0), vec2(0.0, 1.0), vec2(1.0, 1.0));
  vec2 t = c[gl_VertexID];
  vPos = vec3(mix(uRect.x, uRect.z, t.x), uWaterV, mix(uRect.y, uRect.w, t.y));
  gl_Position = uViewProj * vec4(vPos, 1.0);
}`;

// (les nappes des cascades, 11-zzzzzzzP18-4-rendu.js, en sont tirées par remplacement : les lignes « uniform float
// uWater; », « if (depth < 0.0) discard; » et « outCol = vec4(applyFog(col, p), alpha); », avec col et light, restent)
SH.waterFS = GLSL_HEAD + GLSL_TERRAIN + GLSL_LIGHT + GLSL_SKYCLOUDS + `
uniform float uWater;
uniform float uWindV;
in vec3 vPos;
out vec4 outCol;
#if QUALITE >= 1
// une vague : sa pente (dérivée de sin) le long de sa direction
vec2 wv(vec2 p, vec2 d, float k, float sp, float t) { return d * (cos(dot(p, d) * k - t * sp) * k); }
// un rond de pluie par case : il s'élargit et s'efface ; renvoie la pente
vec2 rond(vec2 p, float t, float sz, float sd) {
  vec2 c = floor(p / sz), f = p / sz - c;
  float h = hash21(c + sd);
  vec2 dv = f - (vec2(hash21(c + sd + 3.1), hash21(c + sd + 7.7)) * 0.5 + 0.25);
  float r = length(dv), ti = fract(t * (0.7 + h * 0.6) + h);
  float x = r - ti * 0.45;
  return dv / max(r, 1e-3) * cos(x * 42.0) * exp(-x * x * 900.0) * (1.0 - ti) * 1.6;
}
#endif
void main() {
  vec3 p = vPos;
  float th = terrainH(p.xz);
  float depth = uWater - th;
  if (depth < 0.0) discard;
  float t = uTime;
#if QUALITE >= 1
  vec2 q = floor(p.xz * 8.0) / 8.0;
  // la houle : trois trains de vagues qui suivent le vent, et des rides fines ; plus creusée par grand vent, plus
  // calme au bord
  vec2 wd = uWindD, wd2 = vec2(wd.x * 0.8 - wd.y * 0.6, wd.x * 0.6 + wd.y * 0.8), wd3 = vec2(wd.x * 0.8 + wd.y * 0.6, -wd.x * 0.6 + wd.y * 0.8);
  vec2 gr = (wv(q, wd, 1.7, 1.4, t) * 0.018 + wv(q, wd2, 2.9, 2.1, t) * 0.012 + wv(q, wd3, 4.3, 2.7, t) * 0.007) * (0.6 + 0.25 * uWindV);
  gr += (vec2(vnoise(q * 3.1 + t * 0.6), vnoise(q * 3.1 - t * 0.5 + 17.0)) - 0.5) * 0.05;
  gr *= clamp(depth * 2.0, 0.35, 1.0);
  // les ronds de pluie
  if (uWet > 0.05) gr += (rond(p.xz, t, 0.9, 0.0) + rond(p.xz + 0.37, t * 1.13, 0.7, 5.0)) * 0.06 * uWet;
  vec3 n = normalize(vec3(-gr.x, 1.0, -gr.y));
  vec3 v = normalize(p - uCamPos);
  vec3 r = reflect(v, n);
  r.y = abs(r.y);
  vec3 refl = skyGradient(r);
#if QUALITE >= 2
  refl = cloudLayer(r, refl);
#endif
  float cosv = max(dot(-v, n), 0.0);
  float fres = 0.04 + 0.96 * pow(1.0 - cosv, 5.0);
  fres = mix(fres, 1.0, 0.12) * 0.92;
  float cs = cloudShade(p.xz);
  vec3 light = uAmbient + uSunCol * cs * max(uSunDir.y, 0.0) + uMoonCol * 0.8 + dynLights(p, vec3(0.0, 1.0, 0.0), 1.0);
  // l'eau elle-même : claire et verte sur le gravier, sombre et bleue au fond (absorption)
  float ab = 1.0 - exp(-depth * 0.9);
  vec3 deep = mix(vec3(0.17, 0.36, 0.31), vec3(0.025, 0.09, 0.15), ab) * light;
  vec3 col = mix(deep, refl, fres);
  // les éclats du soleil et de la lune : un reflet net, et des paillettes qui scintillent autour
  float sl = max(dot(r, uSunDir), 0.0), ml = max(dot(r, uMoonDir), 0.0);
  float spark = step(0.6, hash21(floor(p.xz * 9.0) + floor(t * 5.0)) * (0.6 + 0.6 * sl));
  col += uSunCol * cs * (pow(sl, 600.0) * 7.0 + pow(sl, 60.0) * spark * 2.2);
  col += uMoonCol * (pow(ml, 400.0) * 9.0 + pow(ml, 60.0) * spark * 5.0);
  // l'écume au bord : des franges qui vont et viennent
  float fz = 1.0 - smoothstep(0.0, 0.22, depth);
  float fn = vnoise(p.xz * 2.6 + vec2(t * 0.25, -t * 0.2));
  float foam = smoothstep(0.5, 0.66, fz * 0.9 + fn * 0.35 + 0.12 * sin(t * 1.4 + depth * 30.0 + fn * 4.0) - 0.28);
  col = mix(col, vec3(0.86, 0.91, 0.92) * light, foam * 0.66);
  float alpha = mix(0.5, 0.94, 1.0 - exp(-depth * 1.3));
  alpha = clamp(max(alpha, fres * 0.95) + foam * 0.3, 0.0, 0.97);
#else
  vec2 q = floor(p.xz * 6.0) / 6.0;
  float w1 = sin(q.x * 1.9 + t * 1.2) * cos(q.y * 1.6 - t * 0.9);
  float w2 = sin((q.x + q.y) * 2.7 - t * 1.7);
  vec3 n = normalize(vec3(w1 * 0.07, 1.0, w2 * 0.07));
  vec3 v = normalize(p - uCamPos);
  vec3 r = reflect(v, n);
  r.y = abs(r.y);
  vec3 refl = skyGradient(r);
  float fres = 0.2 + 0.8 * pow(1.0 - abs(v.y), 4.0);
  vec3 light = uAmbient + uSunCol * max(uSunDir.y, 0.0) + uMoonCol * 0.8 + dynLights(p, vec3(0.0, 1.0, 0.0), 1.0);
  vec3 deep = mix(vec3(0.16, 0.34, 0.3), vec3(0.03, 0.1, 0.16), clamp(depth * 0.5, 0.0, 1.0)) * light;
  vec3 col = mix(deep, refl, fres * 0.8);
  float spark = step(0.55, w1 * 0.5 + 0.5 + (hash21(q + floor(t * 4.0)) - 0.5) * 0.5);
  col += uSunCol * pow(max(dot(r, uSunDir), 0.0), 120.0) * spark * 1.6;
  col += uMoonCol * pow(max(dot(r, uMoonDir), 0.0), 150.0) * spark * 4.0;
  float foam = step(depth, 0.16 + 0.07 * sin(t * 1.5 + q.x * 2.0 + q.y));
  col = mix(col, vec3(0.85, 0.9, 0.9) * light, foam * 0.55);
  float alpha = clamp(0.62 + depth * 0.15, 0.62, 0.9);
#endif
  outCol = vec4(applyFog(col, p), alpha);
}`;

// ---------------------------------------------------------------- blocs
SH.blockVS = GLSL_HEAD + GLSL_NOISE + GLSL_CLOUD + `
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNrm;
layout(location = 2) in vec3 iPos;
layout(location = 3) in vec3 iSize;
layout(location = 4) in vec2 iRM;
uniform mat4 uViewProj;
uniform vec2 uMatInfo[64];
out vec3 vPos;
out vec3 vNrm;
out vec2 vUV;
flat out int vMat;
#if QUALITE >= 1
out float vCloud;
#endif
void main() {
  vec3 lp = aPos * iSize;
  float c = cos(iRM.x), s = sin(iRM.x);
  vec3 wp = vec3(lp.x * c + lp.z * s, lp.y, -lp.x * s + lp.z * c) + iPos;
  vec3 nn = normalize(aNrm / iSize);
  vNrm = vec3(nn.x * c + nn.z * s, nn.y, -nn.x * s + nn.z * c);
  int m = int(iRM.y + 0.5);
  vec2 info = uMatInfo[m];
  vec3 A = abs(nn);
  vec2 uv;
  if (info.y > 0.5) {
    vec3 q = aPos + vec3(0.5, 0.0, 0.5);
    if (A.y > 0.7) uv = q.xz; else if (A.x > A.z) uv = vec2(q.z * sign(nn.x), 1.0 - q.y); else uv = vec2(-q.x * sign(nn.z), 1.0 - q.y);
  } else {
    if (A.y > 0.7) uv = lp.xz; else if (A.x > A.z) uv = vec2(lp.z * sign(nn.x), -lp.y); else uv = vec2(-lp.x * sign(nn.z), -lp.y);
    uv /= info.x;
  }
  vUV = uv;
  vMat = m;
  vPos = wp;
#if QUALITE >= 1
  vCloud = cloudShade(wp.xz);
#endif
  gl_Position = uViewProj * vec4(wp, 1.0);
}`;

SH.blockFS = GLSL_HEAD + GLSL_COVER + GLSL_LIGHT + `
uniform sampler2DArray uTex;
uniform vec4 uGhost;
in vec3 vPos;
in vec3 vNrm;
in vec2 vUV;
flat in int vMat;
#if QUALITE >= 1
in float vCloud;
#endif
out vec4 outCol;
void main() {
  vec3 n = normalize(vNrm);
  vec3 alb = texture(uTex, vec3(vUV, float(vMat))).rgb;
  float cov = coveredAt(vPos + n * 0.08);
  alb *= 1.0 - uWet * 0.18 * (1.0 - cov) * max(n.y, 0.3);
  if (uFrost > 0.0) alb = mix(alb, vec3(0.85, 0.88, 0.92), uFrost * 0.5 * smoothstep(0.6, 0.95, n.y) * (1.0 - cov));
  float faceK = 1.0 - abs(n.x) * 0.12;
#if QUALITE >= 1
  vec3 L = hemiAmb(n) * (0.92 + 0.08 * max(n.y, 0.0)) * faceK * (1.0 - 0.62 * cov)
         + (uSunCol * vCloud * wrapNL(n, uSunDir) + uMoonCol * max(dot(n, uMoonDir), 0.0)) * (1.0 - cov) + dynLights(vPos, n, 1.0);
  vec3 col = alb * bandLight(L);
  // pierres et toits mouillés : un reflet du soleil
  if (uWet > 0.02 && uSpec > 0.0 && cov < 0.5) {
    vec3 vd = normalize(vPos - uCamPos), rd = reflect(vd, n);
    col += uSunCol * vCloud * pow(max(dot(rd, uSunDir), 0.0), 60.0) * 1.6 * uWet * uSpec * max(n.y, 0.25);
  }
  col = applyFog(col, vPos);
#else
  vec3 L = uAmbient * (0.7 + 0.3 * max(n.y, 0.0)) * faceK * (1.0 - 0.62 * cov)
         + (uSunCol * max(dot(n, uSunDir), 0.0) + uMoonCol * max(dot(n, uMoonDir), 0.0)) * (1.0 - cov) + dynLights(vPos, n, 1.0);
  vec3 col = applyFog(alb * bandLight(L), vPos);
#endif
  if (uGhost.a > 0.0) { outCol = vec4(mix(col, uGhost.rgb, 0.5), uGhost.a); return; }
  outCol = vec4(col, 1.0);
}`;

// ---------------------------------------------------------------- modèles 3D (boîtes instanciées)
// (07-zzzzz-personnages.js y glisse ses boîtes effilées par remplacement : « void main() {\n  vec4 p = vec4(aPos, 1.0); »
// et « vec3 ln = aNrm / s2; » restent tels quels)
SH.modelVS = GLSL_HEAD + GLSL_NOISE + GLSL_CLOUD + `
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNrm;
layout(location = 2) in vec2 aUV;
layout(location = 3) in vec4 iM0;
layout(location = 4) in vec4 iM1;
layout(location = 5) in vec4 iM2;
layout(location = 6) in vec4 iCol;
uniform mat4 uViewProj;
uniform vec2 uMatInfo[64];
uniform sampler2D uShade;
uniform int uN;
uniform float uCell;
out vec3 vPos;
out vec3 vNrm;
out vec2 vUV;
out vec3 vCol;
out float vShade;
flat out ivec4 vTex;
#if QUALITE >= 1
out float vCloud;
#endif
void main() {
  vec4 p = vec4(aPos, 1.0);
  vec3 wp = vec3(dot(iM0, p), dot(iM1, p), dot(iM2, p));
  vec3 c0 = vec3(iM0.x, iM1.x, iM2.x), c1 = vec3(iM0.y, iM1.y, iM2.y), c2 = vec3(iM0.z, iM1.z, iM2.z);
  vec3 s2 = max(vec3(dot(c0, c0), dot(c1, c1), dot(c2, c2)), vec3(1e-10));
  vec3 ln = aNrm / s2;
  vNrm = normalize(c0 * ln.x + c1 * ln.y + c2 * ln.z);
  int code = int(round(iCol.w));
  vTex = ivec4(-1, -1, 0, 0);
  if (code < 0) {
    int c = -code - 1;
    int m = c & 127;
    vTex.y = m; vTex.z = c >> 7;
    vec3 sc = sqrt(s2);
    vec2 dims = abs(aNrm.x) > 0.5 ? sc.zy : (abs(aNrm.z) > 0.5 ? sc.xy : sc.xz);
    vUV = aUV * dims / uMatInfo[m].x;
  } else {
    int fr = (code >> 8) & 255; // face avant non précisée (0) : même tuile que les côtés
    vTex.x = (aNrm.z > 0.5 && fr != 0) ? fr : (code & 255);
    vTex.z = code >> 16;
    vUV = aUV;
  }
  vCol = iCol.rgb;
  vPos = wp;
  vShade = texture(uShade, (vec2(iM0.w, iM2.w) / uCell + 0.5) / float(uN + 1)).r;
#if QUALITE >= 1
  vCloud = cloudShade(vec2(iM0.w, iM2.w));
#endif
  gl_Position = uViewProj * vec4(wp, 1.0);
}`;

SH.modelFS = GLSL_HEAD + GLSL_COVER + GLSL_LIGHT + `
uniform sampler2DArray uTex;
uniform sampler2D uSkin;
uniform float uShadowPass;
uniform float uShadowA;
in vec3 vPos;
in vec3 vNrm;
in vec2 vUV;
in vec3 vCol;
in float vShade;
flat in ivec4 vTex;
#if QUALITE >= 1
in float vCloud;
#endif
out vec4 outCol;
void main() {
  if (uShadowPass > 0.5) {
    vec2 q = vUV - 0.5;
    if (dot(q, q) > 0.25) discard;
    outCol = vec4(0.0, 0.0, 0.0, uShadowA);
    return;
  }
  vec3 alb;
  if (vTex.y >= 0) alb = texture(uTex, vec3(vUV, float(vTex.y))).rgb;
  else {
    int t = vTex.x;
    ivec2 tp = ivec2((t & 15) * 16 + int(clamp(vUV.x, 0.0, 0.999) * 16.0), (t >> 4) * 16 + int(clamp(1.0 - vUV.y, 0.0, 0.999) * 16.0));
    alb = texelFetch(uSkin, tp, 0).rgb;
  }
  alb *= vCol;
#if QUALITE >= 1
  if ((vTex.z & 1) != 0) { outCol = vec4(applyFog(emitK(alb), vPos), 1.0); return; }
#else
  if ((vTex.z & 1) != 0) { outCol = vec4(applyFog(alb, vPos), 1.0); return; }
#endif
  vec3 n = normalize(vNrm);
  float cov = coveredAt(vPos + n * 0.08);
  float faceK = 1.0 - abs(n.x) * 0.1;
  alb *= 1.0 - uWet * 0.15 * (1.0 - cov) * max(n.y, 0.3);
#if QUALITE >= 1
  // (les dessous restent un peu éclairés : des boîtes trop sombres en bas se liraient mal)
  vec3 vd = normalize(vPos - uCamPos);
  vec3 L = mix(hemiAmb(n), uAmbient * 0.86, 0.3) * faceK * (1.0 - vShade * 0.3) * (1.0 - 0.62 * cov)
         + (uSunCol * vCloud * wrapNL(n, uSunDir) + uMoonCol * max(dot(n, uMoonDir), 0.0)) * (1.0 - vShade * 0.5 * uShadowK) * (1.0 - cov)
         + dynLights(vPos, n, 1.0)
         + rimLight(n, vd) * vCloud * (1.0 - cov) * (1.0 - vShade * 0.5);
  vec3 col = alb * bandLight(L);
  if (uWet > 0.02 && uSpec > 0.0 && cov < 0.5) col += uSunCol * vCloud * pow(max(dot(reflect(vd, n), uSunDir), 0.0), 50.0) * 0.9 * uWet * uSpec;
#else
  vec3 L = uAmbient * (0.72 + 0.28 * max(n.y, 0.0)) * faceK * (1.0 - vShade * 0.3) * (1.0 - 0.62 * cov)
         + (uSunCol * max(dot(n, uSunDir), 0.0) + uMoonCol * max(dot(n, uMoonDir), 0.0)) * (1.0 - vShade * 0.5 * uShadowK) * (1.0 - cov)
         + dynLights(vPos, n, 1.0);
  vec3 col = alb * bandLight(L);
#endif
  if ((vTex.z & 2) != 0) col += vec3(0.11, 0.1, 0.07) * (0.55 + 0.45 * sin(uTime * 5.0));
  outCol = vec4(applyFog(col, vPos), 1.0);
}`;

// ---------------------------------------------------------------- pluie (traits autour de la caméra)
// (les gouttes prennent la lumière : lanternes, éclair, soleil à contre-jour)
SH.rainVS = GLSL_HEAD + GLSL_TERRAIN + GLSL_COVER + `
#if QUALITE >= 1
` + GLSL_LIGHT + `
out vec3 vLit;
#endif
uniform mat4 uViewProj;
uniform vec3 uCamPosV;
uniform float uTimeV;
uniform vec2 uRainWind;
out float vA;
void main() {
  int d = gl_VertexID / 2;
  float fd = float(d);
  vec3 h = vec3(hash21(vec2(fd, 1.3)), hash21(vec2(fd * 1.7, 5.1)), hash21(vec2(fd * 0.37, 9.7)));
  float R = 20.0, H = 16.0, speed = 13.0 + h.z * 5.0;
  vec2 rel = mod(h.xy * 2.0 * R - uCamPosV.xz + R, 2.0 * R) - R;
  float yy = mod(h.z * H * 7.0 - uTimeV * speed, H);
  vec3 p = vec3(uCamPosV.x + rel.x, uCamPosV.y - 5.0 + yy, uCamPosV.z + rel.y);
  if (gl_VertexID - d * 2 == 1) p += normalize(vec3(uRainWind.x, -speed, uRainWind.y)) * (0.5 + h.x * 0.4);
  bool hidden = p.y < terrainH(p.xz) || coveredAt(p) > 0.5;
  vA = hidden ? 0.0 : 0.5;
#if QUALITE >= 1
  vec3 vd = normalize(p - uCamPosV);
  vLit = dynLights(p, vec3(0.0), 0.0) * 0.9 + uSunCol * pow(max(dot(vd, uSunDir), 0.0), 6.0) * 0.7;
#endif
  gl_Position = hidden ? vec4(2.0, 2.0, 2.0, 1.0) : uViewProj * vec4(p, 1.0);
}`;
SH.rainFS = GLSL_HEAD + `
uniform vec3 uRainCol;
in float vA;
#if QUALITE >= 1
in vec3 vLit;
#endif
out vec4 outCol;
void main() {
#if QUALITE >= 1
  float l = max(max(vLit.r, vLit.g), vLit.b);
  outCol = vec4(uRainCol + vLit, vA * (1.0 + min(l, 1.0)));
#else
  outCol = vec4(uRainCol, vA);
#endif
}`;
// neige : des flocons (points) qui tombent lentement en tournoyant, poussés par le vent
SH.snowVS = GLSL_HEAD + GLSL_TERRAIN + GLSL_COVER + `
#if QUALITE >= 1
` + GLSL_LIGHT + `
out vec3 vLit;
#endif
uniform mat4 uViewProj;
uniform vec3 uCamPosV;
uniform float uTimeV;
uniform vec2 uRainWind;
uniform float uPxScale;
out float vA;
void main() {
  float fd = float(gl_VertexID);
  vec3 h = vec3(hash21(vec2(fd, 2.3)), hash21(vec2(fd * 1.3, 6.1)), hash21(vec2(fd * 0.71, 3.7)));
  float R = 18.0, H = 14.0, speed = 1.0 + h.z * 0.9;
  vec2 drift = uRainWind * 0.35 * uTimeV + vec2(sin(uTimeV * (0.6 + h.x) + fd), cos(uTimeV * (0.5 + h.y) + fd * 1.7)) * 0.7;
  vec2 rel = mod(h.xy * 2.0 * R + drift - uCamPosV.xz + R, 2.0 * R) - R;
  float yy = mod(h.z * H * 7.0 - uTimeV * speed, H);
  vec3 p = vec3(uCamPosV.x + rel.x, uCamPosV.y - 4.0 + yy, uCamPosV.z + rel.y);
  bool hidden = p.y < terrainH(p.xz) || coveredAt(p) > 0.5;
  vec4 cp = uViewProj * vec4(p, 1.0);
  vA = hidden ? 0.0 : 0.9;
#if QUALITE >= 1
  // près d'une lanterne, les flocons s'allument ; certains accrochent le soleil en tournoyant
  vLit = dynLights(p, vec3(0.0), 0.0) * 0.8 + uSunCol * step(0.82, fract(h.x * 31.7 + uTimeV * (0.6 + h.y))) * 0.6;
#endif
  gl_Position = hidden ? vec4(2.0, 2.0, 2.0, 1.0) : cp;
  gl_PointSize = clamp(0.055 * uPxScale / max(cp.w, 0.1), 1.0, 4.0);
}`;
SH.snowFS = GLSL_HEAD + `
uniform vec3 uSnowCol;
in float vA;
#if QUALITE >= 1
in vec3 vLit;
#endif
out vec4 outCol;
void main() {
#if QUALITE >= 1
  outCol = vec4(uSnowCol + vLit, vA);
#else
  outCol = vec4(uSnowCol, vA);
#endif
}`;

// ---------------------------------------------------------------- particules (CPU)
SH.partVS = GLSL_HEAD + `
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec4 aCol;
layout(location = 2) in float aSize;
uniform mat4 uViewProj;
uniform float uPxScale;
out vec4 vCol;
void main() {
  vec4 cp = uViewProj * vec4(aPos, 1.0);
  gl_Position = cp;
  gl_PointSize = clamp(aSize * uPxScale / max(cp.w, 0.1), 1.0, 32.0);
  vCol = aCol;
}`;
SH.partFS = GLSL_HEAD + `
in vec4 vCol;
out vec4 outCol;
void main() { outCol = vCol; }`;

// ---------------------------------------------------------------- lucioles / papillons (GPU)
SH.fliesVS = GLSL_HEAD + GLSL_TERRAIN + `
uniform mat4 uViewProj;
uniform vec3 uCamPosV;
uniform float uTimeV;
uniform float uMode;
uniform float uAmount;
uniform float uWaterV;
uniform float uPxScale;
uniform vec3 uAmbientV;
out vec4 vCol;
void main() {
  float fi = float(gl_VertexID);
  vec3 h = vec3(hash21(vec2(fi, 0.37)), hash21(vec2(fi * 1.618, 7.7)), hash21(vec2(fi * 0.71, 3.3)));
  float R = uMode > 0.5 ? 30.0 : 38.0;
  vec2 base = h.xy * R * 2.0;
  vec2 rel = mod(base - uCamPosV.xz + R, 2.0 * R) - R;
  vec2 wp = uCamPosV.xz + rel;
  float t = uTimeV * (0.25 + h.z * 0.35) + h.x * 50.0;
  wp += vec2(sin(t * 1.3), cos(t * 1.1)) * 1.6;
  float gy = terrainH(wp);
  int m = matAtV(ivec2(floor(wp / uCell + 0.5)));
  float ok = (m <= 3 && gy > uWaterV) ? 1.0 : 0.0;
  if (uMode > 0.5 && m != 2 && h.z > 0.35) ok = 0.0;
  float fade = 1.0 - smoothstep(R * 0.6, R, length(rel));
  float y;
  if (uMode < 0.5) {
    y = gy + 0.5 + h.z * 2.2 + sin(t * 2.1) * 0.35;
    float blink = pow(max(sin(uTimeV * (0.8 + h.y * 1.7) + h.x * 30.0), 0.0), 3.0);
#if QUALITE >= 1
    vCol = vec4(vec3(0.72, 1.0, 0.32) * (0.25 + blink * 2.2) * fade * ok * uAmount, 1.0);
#else
    vCol = vec4(vec3(0.72, 1.0, 0.32) * (0.25 + blink * 1.4) * fade * ok * uAmount, 1.0);
#endif
  } else {
    y = gy + 0.35 + h.z * 1.1 + abs(sin(t * 5.0)) * 0.35;
    vec3 c = h.y < 0.3 ? vec3(1.0, 0.95, 0.9) : (h.y < 0.6 ? vec3(1.0, 0.85, 0.2) : (h.y < 0.8 ? vec3(0.95, 0.5, 0.15) : vec3(0.5, 0.65, 1.0)));
    vCol = vec4(c * min(uAmbientV * 1.6 + 0.2, vec3(1.2)), 1.0);
    ok *= step(0.5, fade);
  }
  vec4 cp = uViewProj * vec4(wp.x, y, wp.y, 1.0);
  gl_Position = (ok * fade * uAmount > 0.02) ? cp : vec4(2.0, 2.0, 2.0, 1.0);
  float flap = uMode > 0.5 ? (0.6 + 0.4 * abs(sin(uTimeV * 18.0 + h.x * 20.0))) : 1.0;
  gl_PointSize = clamp((uMode > 0.5 ? 0.14 : 0.09) * uPxScale / max(cp.w, 0.1) * flap, 1.0, 5.0);
}`;
SH.fliesFS = SH.partFS;

// ---------------------------------------------------------------- arme (quad écran)
SH.gunVS = GLSL_HEAD + `
uniform vec4 uRect;
uniform vec4 uUV;
out vec2 vUV;
void main() {
  vec2 c = vec2(float(gl_VertexID & 1), float((gl_VertexID >> 1) & 1));
  vUV = vec2(mix(uUV.x, uUV.z, c.x), mix(uUV.w, uUV.y, c.y));
  gl_Position = vec4(mix(uRect.xy, uRect.zw, c), 0.0, 1.0);
}`;
SH.gunFS = GLSL_HEAD + `
uniform sampler2D uAtlas;
uniform sampler2D uVM;
uniform float uUseVM;
uniform vec3 uLight;
uniform vec3 uTintG;
uniform float uBandsG;
in vec2 vUV;
out vec4 outCol;
void main() {
  vec4 t = uUseVM > 0.5 ? texture(uVM, vUV) : texture(uAtlas, vUV);
  if (t.a < 0.5) discard;
  vec3 l = uLight;
  if (uBandsG > 0.0) { float m = max(max(l.r, l.g), max(l.b, 1e-4)); l *= (max(floor(m * uBandsG + 0.5), 1.0) / uBandsG) / m; }
  vec3 c = t.rgb * l;
  if (t.a > 0.66 && t.a < 0.74) c = t.rgb * uTintG * (0.55 + 0.6 * max(max(l.r, l.g), l.b));
#if QUALITE >= 1
  else if (t.a > 0.75 && t.a < 0.9) c = t.rgb * (1.1 + 0.9 * smoothstep(0.55, 0.95, max(max(t.r, t.g), t.b)));
#else
  else if (t.a > 0.75 && t.a < 0.9) c = t.rgb * 1.1;
#endif
  outCol = vec4(c, 1.0);
}`;

// ---------------------------------------------------------------- post-traitement (agrandissement pixelisé)
SH.postVS = GLSL_HEAD + `
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)) * 2.0 - 1.0;
  gl_Position = vec4(p, 0.0, 1.0);
}`;
SH.postFS = GLSL_HEAD + `
uniform sampler2D uScene;
uniform vec2 uRes;
uniform float uScale;
uniform float uLevels;
uniform float uUnder;
uniform float uTimeP;
uniform float uGamma;
uniform vec4 uTint;
uniform vec4 uGlitch;   // x: déchirures, y: décalage RVB, z: blocs de bruit, w: inversion
uniform float uSeed;
uniform vec4 uFx;       // x: épuisement, y: nuit rouge, z: nausée, w: l'Envers
uniform vec4 uFx2;      // autres mondes : x: bonbons, y: ténèbres, z: cauchemar, w: enfers
uniform float uGrain;   // grain de pellicule (option)
out vec4 outCol;
const float B[16] = float[16](0.0, 8.0, 2.0, 10.0, 12.0, 4.0, 14.0, 6.0, 3.0, 11.0, 1.0, 9.0, 15.0, 7.0, 13.0, 5.0);
float h11(float n) { return fract(sin(n * 12.9898 + uSeed * 78.233) * 43758.5453); }
vec3 fetchC(vec2 px) { return texelFetch(uScene, ivec2(clamp(px, vec2(0.0), uRes - 1.0)), 0).rgb; }
vec3 rgb2hsv(vec3 c) { vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0); vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g)); vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r)); float d = q.x - min(q.w, q.y); return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + 1e-10)), d / (q.x + 1e-10), q.x); }
vec3 hsv2rgb(vec3 c) { vec3 p = abs(fract(c.xxx + vec3(1.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0); return c.z * mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), c.y); }
void main() {
  vec2 px = floor(gl_FragCoord.xy / uScale);
#if QUALITE >= 1
  vec2 px0 = px;
#endif
  if (uUnder > 0.5) px.x += floor(sin(px.y * 0.18 + uTimeP * 3.0) * 1.5);
  if (uFx.z > 0.0) px += floor(vec2(sin(px.y * 0.07 + uTimeP * 2.1), cos(px.x * 0.05 + uTimeP * 1.7)) * 3.0 * uFx.z);
  if (uFx2.x > 0.0) px += floor(vec2(sin(px.y * 0.045 + uTimeP * 1.2), cos(px.x * 0.035 + uTimeP * 0.9)) * 2.2 * uFx2.x);
  if (uFx2.z > 0.0) px.x += floor(sin(px.y * 0.11 + uTimeP * 2.7) * 1.4 * uFx2.z);
  if (uFx2.w > 0.0 && px.y < uRes.y * 0.45) px.x += floor(sin(px.y * 0.35 + uTimeP * 7.0) * 1.2 * uFx2.w);
  if (uGlitch.x > 0.0) { // lignes arrachées
    float band = floor(px.y / (3.0 + floor(h11(7.0) * 8.0)));
    float r = h11(band);
    if (r < uGlitch.x * 0.6) px.x += floor((h11(band + 3.1) - 0.5) * 60.0 * uGlitch.x);
  }
  px = clamp(px, vec2(0.0), uRes - 1.0);
#if QUALITE >= 1
  // l'agrandissement « net et lisse » (Moyenne et plus) : chaque gros pixel reste net, son bord se fond sur un pixel
  // d'écran environ (au lieu d'une marche dure) ; les déformations décalent la lecture d'autant
  vec2 fp = gl_FragCoord.xy / uScale + (px - px0);
  float sc = max(uScale / 1.2, 1.0), rr = 0.5 - 0.5 / sc;
  vec2 fr = fract(fp) - 0.5;
  vec3 c = texture(uScene, (floor(fp) + (fr - clamp(fr, -rr, rr)) * sc + 0.5) / uRes).rgb;
#else
  vec3 c = fetchC(px);
#endif
  if (uGlitch.y > 0.0) { float o = floor(uGlitch.y * 4.0 + 1.0); c.r = fetchC(px + vec2(o, 0.0)).r; c.b = fetchC(px - vec2(o, 0.0)).b; }
  if (uGlitch.z > 0.0) {
    vec2 blk = floor(px / vec2(12.0, 6.0));
    float r = fract(sin(dot(blk, vec2(12.9898, 78.233)) + uSeed * 91.7) * 43758.5453);
    if (r < uGlitch.z * 0.25) c = r < uGlitch.z * 0.08 ? vec3(1.0, 0.0, 0.86) * step(0.5, fract((px.x + px.y) / 8.0)) : fetchC(px + vec2(floor((r - 0.1) * 90.0), 0.0)).gbr;
  }
  if (uUnder > 0.5) c = mix(c, vec3(0.04, 0.22, 0.28), 0.5) * vec3(0.75, 0.95, 1.0);
  if (uFx.y > 0.0) c = mix(c, c * vec3(1.3, 0.55, 0.5), uFx.y * 0.7);
  if (uFx.w > 0.0) { float l = dot(c, vec3(0.35, 0.5, 0.15)); c = mix(c, vec3(l * 1.55, l * 0.32, l * 0.3), uFx.w * 0.85); }
  if (uFx2.x > 0.0) { // pays des bonbons : les verts virent au rose, les bleus au lilas, tout devient sucré
    vec3 h = rgb2hsv(c);
    float g = smoothstep(0.1, 0.18, h.x) * (1.0 - smoothstep(0.5, 0.56, h.x));
    h.x = mix(h.x, 0.9 + (h.x - 0.1) * 0.22, g);
    float bl = smoothstep(0.54, 0.6, h.x) * (1.0 - smoothstep(0.7, 0.76, h.x));
    h.x = fract(h.x + bl * 0.12);
    h.y = clamp(h.y * 1.45 + 0.1, 0.0, 0.78);
    h.z = clamp(mix(h.z * 1.12 + 0.05, h.z * 1.45 + 0.16, g), 0.0, 1.0);
    vec3 cc = mix(hsv2rgb(h), vec3(1.0, 0.92, 0.97), 0.1 + g * 0.08);
    cc += step(0.9975, h11(floor(px.x * 0.5) * 17.0 + floor(px.y * 0.5) * 131.0)) * vec3(0.6, 0.55, 0.6);
    c = mix(c, cc, uFx2.x);
  }
  if (uFx2.y > 0.0) { // ténèbres : tout est mort, rouge et noir, le grain de la peur
    float l = dot(c, vec3(0.3, 0.55, 0.15));
    vec3 d = vec3(l * 1.3 + l * l * 0.6, l * 0.16, l * 0.12);
    d = d * d * 1.6 + (h11(px.x * 1.7 + px.y * 3.1 + floor(uTimeP * 24.0) * 11.0) - 0.5) * 0.05;
    c = mix(c, d * (0.86 + 0.14 * sin(uTimeP * 1.3)), uFx2.y * 0.94);
  }
  if (uFx2.z > 0.0) { // cauchemar : pellicule sale, couleurs d'hospice, couleurs qui se décollent
    float o = 1.0 + floor(uFx2.z * 2.0);
    vec3 ca = vec3(fetchC(px + vec2(o, 0.0)).r, c.g, fetchC(px - vec2(o, 0.0)).b);
    float l = dot(ca, vec3(0.3, 0.55, 0.15));
    vec3 d = vec3(l * 0.92, l * 1.02, l * 0.86) + (h11(px.x * 2.3 + px.y * 1.1 + floor(uTimeP * 18.0) * 5.0) - 0.5) * 0.08;
    c = mix(c, d * (0.94 + 0.06 * sin(px.y * 1.7 + uTimeP * 40.0)), uFx2.z * 0.9);
  }
  if (uFx2.w > 0.0) { float l = dot(c, vec3(0.3, 0.55, 0.15)); c = mix(c, vec3(l * 1.5 + 0.015, l * 0.62, l * 0.28), uFx2.w * 0.75); } // enfers : la fournaise
  c = mix(c, 1.0 - c, uGlitch.w);
  c = pow(max(c, 0.0), vec3(uGamma));
  vec2 q = px / uRes - 0.5;
  c *= 1.0 - dot(q, q) * (0.4 + uFx.x * 2.6 + uFx2.y * 2.4 + uFx2.z * 2.8 + uFx2.w * 1.2);
  c = mix(c, uTint.rgb, uTint.a);
  // le grain de pellicule : fin (à la taille de l'écran), plus marqué dans les tons moyens, qui bouge à chaque image
  if (uGrain > 0.0) { float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + uSeed * 3.7) * 43758.5453) - 0.5; float l = dot(c, vec3(0.3, 0.55, 0.15)); c += g * uGrain * (0.35 + 0.65 * 4.0 * l * (1.0 - l)); }
  if (uLevels > 0.0) {
#if QUALITE >= 1
    // (Moyenne et plus : des marches plus fines, et un tramage à la taille de l'écran, sans motif, au lieu des gros
    // carrés ordonnés)
    float th = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
    float lv = uLevels * 1.5;
    c = floor(c * lv + th) / lv;
#else
    int bx = int(px.x) & 3, by = int(px.y) & 3;
    float th = (B[by * 4 + bx] + 0.5) / 16.0;
    c = floor(c * uLevels + th) / uLevels;
#endif
  }
  outCol = vec4(c, 1.0);
}`;

// ---------------------------------------------------------------- l'image en HDR, rendue à l'écran (Moyenne et plus)
// exposition (l'œil s'habitue au noir des maisons et des grottes), courbe filmique (les très clairs s'arrondissent au
// lieu de brûler), étalonnage (heure, temps, lieu) ; en Haute : anticrénelage, halo, rayons, flou des cinématiques
SH.resolveFS = GLSL_HEAD + `
uniform sampler2D uScene;
uniform sampler2D uDepth;
uniform sampler2D uBloom;
uniform sampler2D uRays;
uniform vec2 uRes;
uniform float uExpo;
uniform vec4 uGradeA;   // rgb : teinte des ombres, a : saturation
uniform vec4 uGradeB;   // rgb : teinte des lumières, a : contraste
uniform vec4 uGradeC;   // x : relèvement des noirs
uniform vec4 uPostK;    // x : halo, y : rayons, z : flou de profondeur (0 : non), w : anticrénelage (0 / 1)
uniform vec3 uRaysCol;
uniform vec2 uNearFar;
uniform vec4 uGlare;     // (Moyenne) xy : le soleil à l'écran, z : force, w : rapport largeur / hauteur
uniform vec3 uGlareCol;
out vec4 outCol;
vec3 filmic(vec3 c) {
  // linéaire jusqu'au genou (le jeu garde ses couleurs), puis une épaule longue et douce qui tend vers le blanc ; les
  // très clairs pâlissent un peu, comme sur la pellicule
  float m = max(max(c.r, c.g), c.b);
  const float k = 0.72, W = 1.12;
  if (m <= k) return c;
  float mm = min(k + (W - k) * (1.0 - exp(-(m - k) / (W - k))), 1.0);
  vec3 r = c * (mm / m);
  return mix(r, vec3(mm), clamp((m - 1.0) * 0.25, 0.0, 0.55));
}
vec3 grade(vec3 c) {
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  // (la saturation gagne surtout les couleurs ternes : les verts déjà vifs ne virent pas au fluo)
  float sat = uGradeA.a > 1.0 ? mix(uGradeA.a, 1.0, clamp((max(max(c.r, c.g), c.b) - min(min(c.r, c.g), c.b)) * 1.6, 0.0, 1.0)) : uGradeA.a;
  c = max(mix(vec3(l), c, sat), 0.0);
  c = max((c - 0.42) * uGradeB.a + 0.42, 0.0);
  float t = smoothstep(0.04, 0.85, l);
  c *= mix(uGradeA.rgb, uGradeB.rgb, t);
  // les noirs les plus profonds, à peine relevés (les tons moyens ne bougent pas)
  vec3 b = 1.0 - clamp(c, 0.0, 1.0);
  b *= b;
  return c + uGradeC.x * b * b;
}
#if QUALITE >= 2
float lumaC(vec3 c) { float l = dot(c, vec3(0.299, 0.587, 0.114)); return l / (1.0 + l); }
// anticrénelage (FXAA 3.11 « console », sur l'image HDR à luminance comprimée) : les arêtes franches seulement (le
// grain des textures reste net)
vec3 fxaa(vec2 uv, vec2 px, vec3 cM) {
  vec3 cNW = texture(uScene, uv + vec2(-0.5, -0.5) * px).rgb, cNE = texture(uScene, uv + vec2(0.5, -0.5) * px).rgb;
  vec3 cSW = texture(uScene, uv + vec2(-0.5, 0.5) * px).rgb, cSE = texture(uScene, uv + vec2(0.5, 0.5) * px).rgb;
  float lM = lumaC(cM), lNW = lumaC(cNW), lNE = lumaC(cNE), lSW = lumaC(cSW), lSE = lumaC(cSE);
  float lMin = min(lM, min(min(lNW, lNE), min(lSW, lSE))), lMax = max(lM, max(max(lNW, lNE), max(lSW, lSE)));
  if (lMax - lMin < max(0.06, lMax * 0.16)) return cM;
  vec2 dir = vec2(-((lNW + lNE) - (lSW + lSE)), (lNW + lSW) - (lNE + lSE));
  float red = max((lNW + lNE + lSW + lSE) * 0.03125, 1.0 / 128.0);
  dir = clamp(dir / (min(abs(dir.x), abs(dir.y)) + red), -6.0, 6.0) * px;
  vec3 a = 0.5 * (texture(uScene, uv + dir * (1.0 / 3.0 - 0.5)).rgb + texture(uScene, uv + dir * (2.0 / 3.0 - 0.5)).rgb);
  vec3 b = a * 0.5 + 0.25 * (texture(uScene, uv - dir * 0.5).rgb + texture(uScene, uv + dir * 0.5).rgb);
  float lB = lumaC(b);
  return (lB < lMin || lB > lMax) ? a : b;
}
float linZ(float z) { float n = uNearFar.x, f = uNearFar.y; return 2.0 * n * f / (f + n - (z * 2.0 - 1.0) * (f - n)); }
const vec2 DISQUE[12] = vec2[12](vec2(-0.326, -0.406), vec2(-0.840, -0.074), vec2(-0.696, 0.457), vec2(-0.203, 0.621), vec2(0.962, -0.195), vec2(0.473, -0.480),
  vec2(0.519, 0.767), vec2(0.185, -0.893), vec2(0.507, 0.064), vec2(0.896, 0.412), vec2(-0.322, -0.933), vec2(-0.792, -0.598));
// le flou des cinématiques : net là où regarde la caméra (le centre), flou devant et derrière
vec3 dof(vec2 uv, vec2 px, vec3 c) {
  float fz = (linZ(texture(uDepth, vec2(0.5)).r) * 2.0 + linZ(texture(uDepth, vec2(0.46, 0.5)).r) + linZ(texture(uDepth, vec2(0.54, 0.5)).r)
    + linZ(texture(uDepth, vec2(0.5, 0.45)).r) + linZ(texture(uDepth, vec2(0.5, 0.55)).r)) / 6.0;
  float z = linZ(texture(uDepth, uv).r);
  float k = uPostK.z;
  float coc = clamp(abs(1.0 - fz / max(z, 0.05)) * 1.25, 0.0, 1.0);
  if (coc < 0.04) return c;
  vec3 acc = c; float ws = 1.0;
  for (int i = 0; i < 12; i++) {
    vec2 tu = uv + DISQUE[i] * coc * k * px;
    float tz = linZ(texture(uDepth, tu).r);
    float tc = clamp(abs(1.0 - fz / max(tz, 0.05)) * 1.25, 0.0, 1.0);
    float w = tz < z ? tc : 1.0;
    acc += texture(uScene, tu).rgb * w; ws += w;
  }
  return acc / ws;
}
#endif
void main() {
  vec2 px = 1.0 / uRes;
  vec2 uv = gl_FragCoord.xy * px;
  vec3 c = texelFetch(uScene, ivec2(gl_FragCoord.xy), 0).rgb;
#if QUALITE >= 2
  // (pas sur le ciel : les étoiles et le disque du soleil restent nets)
  if (uPostK.w > 0.5 && texelFetch(uDepth, ivec2(gl_FragCoord.xy), 0).r < 0.99999) c = fxaa(uv, px, c);
  if (uPostK.z > 0.0) c = dof(uv, px, c);
  c += texture(uBloom, uv).rgb * uPostK.x;
  c += texture(uRays, uv).r * uRaysCol * uPostK.y;
#endif
#if QUALITE == 1
  // l'éblouissement du soleil (sans halo des lumières) : une lueur large autour de lui, éteinte s'il est caché
  if (uGlare.z > 0.0) {
    float vis = 0.0;
    for (int i = 0; i < 5; i++) {
      vec2 o = i == 0 ? vec2(0.0) : vec2(i == 1 ? 0.012 : (i == 2 ? -0.012 : 0.0), i == 3 ? 0.02 : (i == 4 ? -0.02 : 0.0));
      vis += texture(uDepth, uGlare.xy + o).r > 0.99999 ? 0.2 : 0.0;
    }
    float d = length((uv - uGlare.xy) * vec2(uGlare.w, 1.0));
    c += uGlareCol * (exp(-d * 9.0) * 0.55 + exp(-d * 2.6) * 0.22) * vis * uGlare.z;
  }
#endif
  c = grade(filmic(max(c, 0.0) * uExpo));
  outCol = vec4(c, 1.0);
}`;

// ---------------------------------------------------------------- le halo des lumières (bloom, Haute et plus)
// descente : seuil doux au premier pas (pondéré pour éviter les points qui clignotent), puis moyennes ;
// remontée : filtre en tente, ajouté au niveau du dessus
SH.bloomDownFS = GLSL_HEAD + `
uniform sampler2D uSrc;
uniform vec2 uTexel;
uniform vec2 uDstRes;
uniform vec3 uSeuil;    // x : seuil, y : genou, z : 1 au premier pas
out vec4 outCol;
vec3 seuil(vec3 c) {
  float br = max(max(c.r, c.g), c.b);
  float rq = clamp(br - uSeuil.x + uSeuil.y, 0.0, 2.0 * uSeuil.y);
  rq = rq * rq / (4.0 * uSeuil.y + 1e-4);
  return c * max(rq, br - uSeuil.x) / max(br, 1e-4);
}
void main() {
  vec2 uv = gl_FragCoord.xy / uDstRes, o = uTexel;
  vec3 a = texture(uSrc, uv + vec2(-o.x, -o.y)).rgb, b = texture(uSrc, uv + vec2(o.x, -o.y)).rgb;
  vec3 c = texture(uSrc, uv + vec2(-o.x, o.y)).rgb, d = texture(uSrc, uv + vec2(o.x, o.y)).rgb;
  if (uSeuil.z > 0.5) {
    a = seuil(a); b = seuil(b); c = seuil(c); d = seuil(d);
    float wa = 1.0 / (1.0 + max(max(a.r, a.g), a.b)), wb = 1.0 / (1.0 + max(max(b.r, b.g), b.b));
    float wc = 1.0 / (1.0 + max(max(c.r, c.g), c.b)), wd = 1.0 / (1.0 + max(max(d.r, d.g), d.b));
    outCol = vec4((a * wa + b * wb + c * wc + d * wd) / (wa + wb + wc + wd), 1.0);
  } else outCol = vec4((a + b + c + d) * 0.25, 1.0);
}`;
SH.bloomUpFS = GLSL_HEAD + `
uniform sampler2D uSrc;
uniform vec2 uTexel;
uniform vec2 uDstRes;
uniform float uK;
out vec4 outCol;
void main() {
  vec2 uv = gl_FragCoord.xy / uDstRes, o = uTexel;
  vec3 s = texture(uSrc, uv).rgb * 4.0;
  s += (texture(uSrc, uv + vec2(o.x, 0.0)).rgb + texture(uSrc, uv - vec2(o.x, 0.0)).rgb + texture(uSrc, uv + vec2(0.0, o.y)).rgb + texture(uSrc, uv - vec2(0.0, o.y)).rgb) * 2.0;
  s += texture(uSrc, uv + o).rgb + texture(uSrc, uv - o).rgb + texture(uSrc, uv + vec2(o.x, -o.y)).rgb + texture(uSrc, uv + vec2(-o.x, o.y)).rgb;
  outCol = vec4(s * (uK / 16.0), 1.0);
}`;
// les rayons du soleil (Haute et plus) : du soleil vers chaque point, la part de ciel qu'on traverse (les troncs, les
// feuillages et les toits font des ombres dans la lumière)
SH.raysFS = GLSL_HEAD + `
uniform sampler2D uDepth;
uniform vec2 uDstRes;
uniform vec3 uSunUV;    // xy : le soleil à l'écran (0..1, peut sortir), z : rapport largeur / hauteur
out vec4 outCol;
void main() {
  vec2 uv = gl_FragCoord.xy / uDstRes;
  vec2 dv = uSunUV.xy - uv;
#if QUALITE >= 3
  const int N = 40;
#else
  const int N = 24;
#endif
  vec2 st = dv / float(N);
  vec2 p = uv + st * fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  float acc = 0.0, w = 1.0, ws = 0.0;
  for (int i = 0; i < N; i++) {
    float sky = texture(uDepth, p).r > 0.99999 ? 1.0 : 0.0;
    acc += sky * w; ws += w;
    w *= 0.96;
    p += st;
  }
  float d = length(dv * vec2(uSunUV.z, 1.0));
  float r = acc / ws * exp(-d * 2.4);
  outCol = vec4(r, r, r, 1.0);
}`;
// la carte des ombres de nuages (Moyenne et plus) : 1 au soleil, moins sous un nuage
SH.nuagesFS = GLSL_HEAD + GLSL_NOISE + `
uniform vec2 uDstRes;
uniform vec4 uNuagesP;   // xy : coin du monde (m), z : taille (m), w : seuil (selon la couverture)
uniform vec2 uDerive;    // dérive des nuages avec le vent
out vec4 outCol;
void main() {
  vec2 wp = uNuagesP.xy + gl_FragCoord.xy / uDstRes * uNuagesP.z;
  vec2 q = wp * 0.0068 + uDerive;
  float c = vnoise(q) * 0.6 + vnoise(q * 2.3 + 5.1) * 0.28 + vnoise(q * 5.9 + 1.7) * 0.12;
  float s = 1.0 - smoothstep(uNuagesP.w, uNuagesP.w + 0.14, c);
  outCol = vec4(s, s, s, 1.0);
}`;
