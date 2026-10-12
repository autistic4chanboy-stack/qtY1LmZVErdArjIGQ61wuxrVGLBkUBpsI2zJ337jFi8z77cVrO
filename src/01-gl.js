// ============================================================================
//  AIDE WEBGL2
// ============================================================================

let gl = null;

function glInit(canvas) {
  gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: true, preserveDrawingBuffer: false, powerPreference: 'high-performance' });
  if (!gl) return false;
  return true;
}

// Définitions glissées dans chaque programme juste après « #version » (la qualité du rendu : « #define QUALITE 2 »).
// Le rendu compile les siens avec les définitions de chaque qualité (defs) ; les autres programmes (les nappes des
// cascades…) prennent celles de la qualité en cours.
let GL_DEFINES = '';
function glDefs(src, defs) {
  const d = defs === undefined ? GL_DEFINES : defs;
  if (!d || !src.startsWith('#version')) return src;
  const i = src.indexOf('\n') + 1;
  return src.slice(0, i) + d + src.slice(i);
}
function glCompile(type, src, name, defs) {
  const sh = gl.createShader(type);
  src = glDefs(src, defs);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    const lines = src.split('\n').map((l, i) => (i + 1) + ': ' + l).join('\n');
    console.error('Erreur shader [' + name + ']\n' + log + '\n' + lines);
    throw new Error('Shader ' + name + ' : ' + log);
  }
  return sh;
}

// Un programme en deux temps : glProgramLancer envoie tout à la carte sans rien attendre (elle compile pendant ce
// temps, plusieurs à la fois avec KHR_parallel_shader_compile) ; glProgramFinir attend le résultat et lit les
// uniformes. glProgramPret dit, sans attendre, si c'est fini (toujours oui sans l'extension : finir attendra).
let GL_PARALLELE;
function glParallele() { if (GL_PARALLELE === undefined) GL_PARALLELE = gl.getExtension('KHR_parallel_shader_compile') || null; return GL_PARALLELE; }
function glProgramLancer(vs, fs, name, defs) {
  const p = gl.createProgram(), v = gl.createShader(gl.VERTEX_SHADER), f = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(v, glDefs(vs, defs)); gl.compileShader(v);
  gl.shaderSource(f, glDefs(fs, defs)); gl.compileShader(f);
  gl.attachShader(p, v); gl.attachShader(p, f);
  gl.linkProgram(p);
  return { p, v, f, name, vs, fs, defs };
}
function glProgramPret(L) { const e = glParallele(); return !e || !!gl.getProgramParameter(L.p, e.COMPLETION_STATUS_KHR); }
function glProgramFinir(L) {
  const p = L.p;
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    let log = '';
    for (const [s, src, n] of [[L.v, L.vs, '.vs'], [L.f, L.fs, '.fs']]) {
      if (gl.getShaderParameter(s, gl.COMPILE_STATUS)) continue;
      const lines = glDefs(src, L.defs).split('\n').map((l, i) => (i + 1) + ': ' + l).join('\n');
      console.error('Erreur shader [' + L.name + n + ']\n' + gl.getShaderInfoLog(s) + '\n' + lines);
      log += L.name + n + ' : ' + gl.getShaderInfoLog(s) + ' ';
    }
    if (!log) log = gl.getProgramInfoLog(p);
    gl.deleteProgram(p); gl.deleteShader(L.v); gl.deleteShader(L.f);
    throw new Error('Programme ' + L.name + ' : ' + log);
  }
  // (les shaders ne servent plus : le programme lié garde son code, ils partiront avec lui)
  gl.deleteShader(L.v); gl.deleteShader(L.f);
  const u = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) {
    const info = gl.getActiveUniform(p, i);
    const nm = info.name.replace(/\[0\]$/, '');
    u[nm] = gl.getUniformLocation(p, info.name);
  }
  return { p, u, name: L.name };
}
function glProgram(vs, fs, name, defs) { return glProgramFinir(glProgramLancer(vs, fs, name, defs)); }

function glBuffer(target, data, usage) {
  const b = gl.createBuffer();
  gl.bindBuffer(target, b);
  gl.bufferData(target, data, usage || gl.STATIC_DRAW);
  return b;
}

// Attribut : loc, taille, type, stride, offset, diviseur
function glAttrib(loc, size, stride, offset, divisor, isInt) {
  gl.enableVertexAttribArray(loc);
  if (isInt) gl.vertexAttribIPointer(loc, size, gl.INT, stride, offset);
  else gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, offset);
  if (divisor) gl.vertexAttribDivisor(loc, divisor);
}

function glTexFromCanvas(canvas, opts = {}) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  const mip = !!opts.mip;
  if (mip) gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.NEAREST_MIPMAP_LINEAR : (opts.linear ? gl.LINEAR : gl.NEAREST));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, opts.linear ? gl.LINEAR : gl.NEAREST);
  const wrap = opts.repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
  return t;
}

// Tableau de textures (toutes de même taille)
function glTexArray(canvases, size) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D_ARRAY, t);
  gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, gl.RGBA8, size, size, canvases.length, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  canvases.forEach((c, i) => {
    gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, i, size, size, 1, gl.RGBA, gl.UNSIGNED_BYTE, c);
  });
  gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.REPEAT);
  return t;
}

// Texture de données (R32F ou R8), filtrage au choix
function glDataTex(w, h, fmt, data, linear) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  if (fmt === 'R32F') gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, w, h, 0, gl.RED, gl.FLOAT, data);
  else gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, w, h, 0, gl.RED, gl.UNSIGNED_BYTE, data);
  const f = linear ? gl.LINEAR : gl.NEAREST;
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, f);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}

// Met à jour une zone rectangulaire (x0..x1, y0..y1 inclus) d'une texture de données
function glDataTexRegion(tex, fullW, fmt, data, x0, y0, x1, y1) {
  const w = x1 - x0 + 1, h = y1 - y0 + 1;
  if (w <= 0 || h <= 0) return;
  const Arr = fmt === 'R32F' ? Float32Array : Uint8Array;
  const sub = new Arr(w * h);
  for (let y = 0; y < h; y++) {
    const row = (y0 + y) * fullW + x0;
    sub.set(data.subarray(row, row + w), y * w);
  }
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  if (fmt === 'R32F') gl.texSubImage2D(gl.TEXTURE_2D, 0, x0, y0, w, h, gl.RED, gl.FLOAT, sub);
  else gl.texSubImage2D(gl.TEXTURE_2D, 0, x0, y0, w, h, gl.RED, gl.UNSIGNED_BYTE, sub);
}

// Tampon de rendu basse résolution (couleur + profondeur)
function glTarget(w, h) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const depth = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, depth);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, w, h);
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depth);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return { fb, tex, depth, w, h };
}
function glDeleteTarget(t) {
  if (!t) return;
  gl.deleteFramebuffer(t.fb);
  gl.deleteTexture(t.tex);
  if (t.depth) gl.deleteRenderbuffer(t.depth);
  if (t.depthTex) gl.deleteTexture(t.depthTex);
}
// Tampon de rendu au choix : couleur 'RGBA8' | 'RGBA16F' | 'R11F_G11F_B10F' (lissée ou non), profondeur : 'tex' (une texture
// qu'on peut relire : flou de profondeur, rayons), 'rb' (un tampon) ou rien. ok : faux si la carte refuse ce mélange.
// (crée ses textures sur l'unité active : l'appelant en choisit une libre)
function glTargetEx(w, h, o) {
  o = o || {};
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  if (o.fmt === 'RGBA16F') gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
  else if (o.fmt === 'R11F_G11F_B10F') gl.texImage2D(gl.TEXTURE_2D, 0, gl.R11F_G11F_B10F, w, h, 0, gl.RGB, gl.HALF_FLOAT, null);
  else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  const f = o.linear ? gl.LINEAR : gl.NEAREST;
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, f);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  let depth = null, depthTex = null;
  if (o.depth === 'tex') {
    depthTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, depthTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, w, h, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  } else if (o.depth === 'rb') {
    depth = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depth);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, w, h);
  }
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  if (depthTex) gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTex, 0);
  else if (depth) gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depth);
  const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return { fb, tex, depth, depthTex, w, h, ok, fmt: o.fmt || 'RGBA8' };
}
