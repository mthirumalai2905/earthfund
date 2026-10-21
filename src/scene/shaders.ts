// Ashima Arts / Ian McEwan 3D simplex noise (MIT).
const simplex = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

const tonemap = /* glsl */ `
vec3 aces(vec3 x){
  const float a=2.51,b=0.03,c=2.43,d=0.59,e=0.14;
  return clamp((x*(a*x+b))/(x*(c*x+d)+e),0.0,1.0);
}
vec3 toDisplay(vec3 c){ return pow(aces(c), vec3(1.0/2.2)); }
`;

/** Thin-film interference palette: amber, magenta, violet, electric blue. */
const iridescence = /* glsl */ `
vec3 irid(float t){
  float x = fract(t) * 4.0;
  vec3 amber = vec3(1.0, 0.58, 0.22);
  vec3 magenta = vec3(0.95, 0.28, 0.62);
  vec3 violet = vec3(0.52, 0.38, 1.0);
  vec3 blue = vec3(0.28, 0.7, 1.0);
  vec3 c = mix(amber, magenta, smoothstep(0.0, 1.0, x));
  c = mix(c, violet, smoothstep(1.0, 2.0, x));
  c = mix(c, blue, smoothstep(2.0, 3.0, x));
  return mix(c, amber, smoothstep(3.0, 4.0, x));
}
`;

/** Fake studio environment: a soft key light, a strip light and a faint floor gradient. */
const studio = /* glsl */ `
vec3 studioEnv(vec3 r, vec3 L){
  // Key softbox around the sun direction, soft and large with a hot core.
  float d = max(dot(r, L), 0.0);
  float key = pow(d, 30.0)*6.0 + pow(d, 6.0)*0.9 + pow(d, 2.0)*0.12;
  // Long strip light crossing the key: the signature chrome reflection line.
  vec3 axis = normalize(cross(L, vec3(0.0, 1.0, 0.35)));
  float strip = smoothstep(0.07, 0.0, abs(dot(r, axis))) * smoothstep(-0.4, 0.4, dot(r, L)) * 1.1;
  // Back rim light opposite the key, slightly above.
  vec3 K = normalize(vec3(-L.x, 0.45, -L.z));
  float dk = max(dot(r, K), 0.0);
  float rim = pow(dk, 14.0) * 1.6 + pow(dk, 3.0) * 0.1;
  // Overhead panel and faint floor bounce so the dark side still reads as metal.
  float top = pow(max(r.y, 0.0), 5.0) * 0.35;
  float floor = pow(max(-r.y, 0.0), 3.0) * 0.06;
  float fill = 0.018;
  return vec3(key + strip + rim + top + floor + fill) * vec3(0.98, 0.99, 1.02);
}
`;

export const fullscreenVertex = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

export const surfaceVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vTangentW;
varying vec3 vPosW;
varying vec3 vPosO;
void main(){
  vUv = uv;
  vPosO = position;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vPosW = w.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vec3 t = vec3(position.z, 0.0, -position.x);
  vTangentW = normalize(mat3(modelMatrix) * (length(t) > 1e-4 ? t : vec3(1.0, 0.0, 0.0)));
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

/**
 * Chrome Earth from real planetary data.
 * uAlbedo: NASA Blue Marble topography and bathymetry (used as luminance only).
 * uData: r = elevation, g = land roughness (land mask), b = cloud cover.
 */
export const earthFragment = /* glsl */ `
precision highp float;
uniform sampler2D uAlbedo;
uniform sampler2D uData;
uniform vec3 uSunDir;
uniform float uExposure;
uniform vec2 uTexel;
uniform float uRelief;
uniform float uCloudShift;
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vTangentW;
varying vec3 vPosW;
varying vec3 vPosO;
${tonemap}
${iridescence}
${studio}
float luma(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
void main(){
  vec4 d = texture2D(uData, vUv);
  float lum = luma(texture2D(uAlbedo, vUv).rgb);
  float land = smoothstep(0.26, 0.46, d.g);
  float ice = smoothstep(0.5, 0.78, lum);

  // Two-scale relief: broad ranges from a wide tap, fine ridges and coast detail from a tight one.
  vec2 o = uTexel * 1.25;
  vec2 ow = uTexel * 5.0;
  float hx = texture2D(uData, vUv + vec2(o.x, 0.0)).r - texture2D(uData, vUv - vec2(o.x, 0.0)).r;
  float hy = texture2D(uData, vUv + vec2(0.0, o.y)).r - texture2D(uData, vUv - vec2(0.0, o.y)).r;
  float wx = texture2D(uData, vUv + vec2(ow.x, 0.0)).r - texture2D(uData, vUv - vec2(ow.x, 0.0)).r;
  float wy = texture2D(uData, vUv + vec2(0.0, ow.y)).r - texture2D(uData, vUv - vec2(0.0, ow.y)).r;
  float bx = luma(texture2D(uAlbedo, vUv + vec2(o.x, 0.0)).rgb) - luma(texture2D(uAlbedo, vUv - vec2(o.x, 0.0)).rgb);
  float by = luma(texture2D(uAlbedo, vUv + vec2(0.0, o.y)).rgb) - luma(texture2D(uAlbedo, vUv - vec2(0.0, o.y)).rgb);
  vec2 grad = (vec2(hx, hy) * 1.2 + vec2(wx, wy) * 0.35) * land + vec2(bx, by) * mix(0.3, 0.14, land);
  // Coastlines stand up as a bevelled edge, like engraved chrome.
  float coast = land * (1.0 - land) * 4.0;
  grad += vec2(dFdx(land), dFdy(land)) * coast * 0.6;

  vec3 Ng = normalize(vNormalW);
  vec3 T = normalize(vTangentW - Ng * dot(vTangentW, Ng));
  vec3 B = cross(Ng, T);
  vec3 N = normalize(Ng - (T * grad.x + B * grad.y) * uRelief);

  vec3 L = normalize(uSunDir);
  vec3 V = normalize(cameraPosition - vPosW);
  vec3 R = reflect(-V, N);
  vec3 H = normalize(L + V);
  float ndvG = max(dot(Ng, V), 0.0);
  float ndlG = dot(Ng, L);
  float lit = smoothstep(-0.12, 0.22, ndlG);
  float diff = max(dot(N, L), 0.0) * smoothstep(-0.08, 0.12, ndlG);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 5.0);

  vec2 sunT = vec2(dot(L, T), dot(L, B)) * 0.0025;
  float shadow = 1.0 - smoothstep(0.2, 0.9, texture2D(uData, vUv - vec2(uCloudShift, 0.0) + sunT).b) * 0.5;

  vec3 env = studioEnv(R, L);
  // Rough land blurs the reflection: sample the environment around a normal pulled toward the sphere.
  vec3 envSoft = studioEnv(normalize(mix(R, reflect(-V, Ng), 0.5)), L);
  float dayFill = 0.35 + 0.65 * lit;

  // Land: satin silver whose tone follows the real surface (bright deserts, darker forests).
  float tone = mix(0.5, 1.12, pow(clamp((lum - 0.04) * 2.2, 0.0, 1.0), 0.75));
  vec3 silver = mix(vec3(0.64, 0.66, 0.7) * tone, vec3(0.95, 0.96, 0.98), ice);
  float spec = pow(max(dot(N, H), 0.0), 42.0);
  float spec2 = pow(max(dot(N, H), 0.0), 8.0) * 0.18;
  vec3 metal = silver * (diff * 1.05 + spec2) * shadow
    + silver * spec * 0.9 * shadow
    + envSoft * silver * 0.85 * dayFill
    + silver * 0.015;

  // Oceans: polished mercury that mirrors the studio, shelves read through bathymetry.
  float shelf = smoothstep(0.07, 0.24, lum);
  float glint = pow(max(dot(R, L), 0.0), 520.0) * 10.0;
  vec3 ocean = env * (0.65 + 0.6 * fres) * dayFill * shadow
    + vec3(0.04, 0.042, 0.048) * diff * (0.5 + shelf * 2.4)
    + vec3(glint) * lit * shadow;
  ocean = mix(ocean, silver * diff * shadow + envSoft * 0.25 * dayFill, ice * 0.85);

  vec3 col = mix(ocean, metal, land);

  // Terminator: a warm-silver band where the key light grazes the surface.
  float graze = smoothstep(-0.1, 0.05, ndlG) * (1.0 - smoothstep(0.05, 0.35, ndlG));
  col += vec3(0.9, 0.82, 0.72) * graze * 0.08 * (0.4 + 0.6 * land);

  float limb = pow(1.0 - ndvG, 2.4);
  col = mix(col, vec3(0.74, 0.77, 0.84) * (0.3 + diff), limb * 0.45 * lit);
  float film = pow(1.0 - ndvG, 3.6);
  col += irid(ndvG * 1.3 + lum * 0.6) * film * (0.1 + 0.9 * lit) * 0.7;

  gl_FragColor = vec4(toDisplay(col * uExposure * 1.25), 1.0);
}
`;

export const cloudFragment = /* glsl */ `
precision highp float;
uniform sampler2D uData;
uniform vec3 uSunDir;
uniform float uExposure;
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vTangentW;
varying vec3 vPosW;
varying vec3 vPosO;
${tonemap}
${iridescence}
void main(){
  vec3 N = normalize(vNormalW);
  vec3 T = normalize(vTangentW - N * dot(vTangentW, N));
  vec3 B = cross(N, T);
  vec3 L = normalize(uSunDir);
  vec3 V = normalize(cameraPosition - vPosW);
  vec2 sunT = vec2(dot(L, T), dot(L, B)) * 0.003;
  float c = smoothstep(0.16, 0.88, texture2D(uData, vUv).b);
  float toward = smoothstep(0.16, 0.88, texture2D(uData, vUv + sunT).b);
  float self = 1.0 - max(toward - c, 0.0) * 0.8 + max(c - toward, 0.0) * 0.5;
  float ndl = dot(N, L);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  vec3 H = normalize(L + V);
  float sheen = pow(max(dot(N, H), 0.0), 20.0) * 0.6;
  vec3 col = vec3(0.9, 0.92, 0.95) * (max(ndl, 0.0) * 1.35 * self + sheen + 0.01);
  col += irid(c * 1.2 + fres) * fres * 0.28 * smoothstep(-0.2, 0.3, ndl);
  float a = c * c * (smoothstep(-0.25, 0.12, ndl) * 0.55 + 0.03);
  gl_FragColor = vec4(toDisplay(col * uExposure), a * clamp(uExposure, 0.0, 1.0));
}
`;

export const atmosphereVertex = /* glsl */ `
varying vec3 vNormalW;
varying vec3 vPosW;
void main(){
  vec4 w = modelMatrix * vec4(position, 1.0);
  vPosW = w.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

export const atmosphereFragment = /* glsl */ `
precision highp float;
uniform vec3 uSunDir;
uniform float uExposure;
varying vec3 vNormalW;
varying vec3 vPosW;
${iridescence}
void main(){
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vPosW);
  float f = max(dot(-N, V), 0.0);
  float glow = pow(f, 3.2) * 1.2 + pow(f, 12.0) * 2.2;
  float sun = smoothstep(-0.5, 0.6, dot(N, normalize(uSunDir)));
  vec3 nv = normalize((viewMatrix * vec4(N, 0.0)).xyz);
  float around = atan(nv.y, nv.x) / 6.28318;
  vec3 col = mix(vec3(0.78, 0.8, 0.86), irid(around * 1.5 + f * 0.9), 0.5);
  gl_FragColor = vec4(col * glow * (0.1 + sun * 1.1) * uExposure, 1.0);
}
`;

export const starsVertex = /* glsl */ `
attribute float aSize;
attribute float aPhase;
attribute vec3 aColor;
uniform float uTime;
uniform float uPixelRatio;
uniform float uOpacity;
varying vec3 vColor;
varying float vAlpha;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float tw = 0.75 + 0.25 * sin(uTime * (0.6 + aPhase) + aPhase * 40.0);
  gl_PointSize = aSize * uPixelRatio * tw;
  vColor = aColor;
  vAlpha = uOpacity * tw;
  gl_Position = projectionMatrix * mv;
}
`;

export const starsFragment = /* glsl */ `
precision highp float;
varying vec3 vColor;
varying float vAlpha;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float a = smoothstep(0.5, 0.0, d);
  a = a * a;
  gl_FragColor = vec4(vColor * a * vAlpha, 1.0);
}
`;

/** Full-screen volumetric-looking cloud layers the camera flies through on entry. */
export const fogFragment = /* glsl */ `
precision highp float;
uniform vec2 uRes;
uniform float uOpacity;
uniform float uTravel;
uniform float uTime;
${simplex}
${iridescence}
float fbm3(vec3 p){
  float a=0.5, s=0.0;
  for(int i=0;i<FOG_OCTAVES;i++){ s+=a*snoise(p); p=p*2.07+vec3(5.1,1.3,7.7); a*=0.5; }
  return s;
}
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*uRes) / uRes.y;
  float acc = 0.0;
  float lit = 0.0;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float z = fract(uTravel + fi * 0.25);
    float scale = mix(3.2, 0.35, z);
    float fade = smoothstep(0.0, 0.35, z) * (1.0 - smoothstep(0.72, 1.0, z));
    vec2 p = uv * scale + vec2(fi * 7.31, fi * 3.17);
    float n = fbm3(vec3(p, uTime * 0.02 + fi * 1.7)) * 0.5 + 0.5;
    float d = smoothstep(0.42, 0.82, n) * fade;
    acc += d;
    lit += d * (fbm3(vec3(p * 1.3 + 2.0, fi)) * 0.5 + 0.5);
  }
  float solid = smoothstep(0.55, 1.0, uOpacity);
  float cover = clamp(acc * 0.85 + solid, 0.0, 1.0);
  float l = clamp(lit * 0.9 + solid * 0.55, 0.0, 1.0);
  vec3 shade = vec3(0.09, 0.095, 0.11);
  vec3 bright = vec3(0.8, 0.82, 0.86);
  vec3 col = mix(shade, bright, l);
  float edge = clamp(acc, 0.0, 1.0) * (1.0 - clamp(acc, 0.0, 1.0)) * 4.0;
  col += irid(l * 1.4 + uv.x * 0.35 + uTravel * 0.3) * edge * 0.22 * (1.0 - solid);
  gl_FragColor = vec4(col, cover * uOpacity);
}
`;
