#include <fog_pars_fragment>

varying vec2 vUv;
uniform float time;
uniform float ratio;
uniform int status;

vec4 permute(vec4 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
}
vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

// Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

  //  x0 = x0 - 0. + 0.0 * C 
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1. + 3.0 * C.xxx;

// Permutations
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));

// Gradients
// ( N*N points uniformly over a square, mapped onto an octahedron.)
    float n_ = 1.0 / 7.0; // N=7
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,N*N)

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);    // mod(j,N)

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

//Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

// Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

vec3 snoiseVec3(vec3 x) {
    float s = snoise(vec3(x));
    float s1 = snoise(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2));
    float s2 = snoise(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4));
    vec3 c = vec3(s, s1, s2);
    return c;
}

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float circle(in vec2 uv, in float radius) {
    vec2 l = uv - vec2(0.5);
    return 1.0 - smoothstep(radius - (radius * 0.01), radius + (radius * 0.01), dot(l, l) * 4.0);
}

#define OCTAVES 6
float fbm(in vec3 st) {
        // Initial values
    float value = 0.0;
    float amplitude = .5;
    float frequency = 0.;
        //
        // Loop of octaves
    for(int i = 0; i < OCTAVES; i++) {
        value += amplitude * snoise(st);
        st *= 2.;
        amplitude *= .5;
    }
    return value;
}

void main() {

    vec2 p = vUv;
    p.y /= ratio;

    vec2 newUv = p;
    newUv *= 80.0;
    vec2 fpos = fract(newUv);  // get the fractional part
    vec2 ipos = floor(newUv);  // get the integer coords

    float incTime = floor(time * 8.) / 8.;
    incTime = incTime * 2.;

    // FBM DOTS COLOR

    float noise = fbm(vec3(ipos * .05, incTime));
    noise = step(0.1, noise);

    float colorDots = circle(fpos, 0.5);
    colorDots = colorDots * noise;

    // WHITE COLOR

    float incTime2 = floor(time * 16.) / 16.;
    incTime2 = incTime2 * 2.;

    float noiseWhite = 1. - snoise(vec3(ipos, incTime2));
    noiseWhite = step(0.07, noiseWhite);

    float noiseWhite2 = random(vec2(sin(time * 100.) * 0.01));
    noiseWhite2 = step(0.001, noiseWhite2);

    float colorWhite = noiseWhite * noiseWhite2;

    // COLOR BLACK
    float colorBlack = 0.;

    float movingUvX = vUv.x + time * 0.2;

    float noiseB = fbm(vec3(movingUvX, vUv.y * 130., time * .3));
    //noise *= 2.2;

    float stepDelta = (sin(time) + 1. / 2.) * 0.08;
    noiseB = smoothstep(0.5 + stepDelta, 0.52 + stepDelta, noiseB);

    colorBlack = noiseB;

    // MIX

    float color = mix(colorDots, colorWhite, status == 0 ? 1.0 : 0.0);
    color = mix(color, colorBlack, status >= 2 ? 1.0 : 0.0);
    gl_FragColor = vec4(vec3(color), 1.0);

    #include <fog_fragment>
}