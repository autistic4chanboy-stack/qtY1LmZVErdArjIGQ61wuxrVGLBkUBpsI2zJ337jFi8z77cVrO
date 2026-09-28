// ============================================================================
//  AIDE WEBGL2
// ============================================================================

let gl = null;

function glInit(canvas) {
  gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: true, preserveDrawingBuffer: false, powerPreference: 'high-performance' });
  if (!gl) return false;
  return true;
}

function glCompile(type, src, name) {
  const sh = gl.createShader(type);
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

function glProgram(vs, fs, name) {
  const p = gl.createProgram();
  gl.attachShader(p, glCompile(gl.VERTEX_SHADER, vs, name + '.vs'));
  gl.attachShader(p, glCompile(gl.FRAGMENT_SHADER, fs, name + '.fs'));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error('Programme ' + name + ' : ' + gl.getProgramInfoLog(p));
  }
  const u = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) {
    const info = gl.getActiveUniform(p, i);
    const nm = info.name.replace(/\[0\]$/, '');
    u[nm] = gl.getUniformLocation(p, info.name);
  }
  return { p, u, name };
}

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
  gl.deleteRenderbuffer(t.depth);
}
