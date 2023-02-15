varying vec2 vUv;
uniform float time;
uniform float ratio;

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

    #define OCTAVES 4
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

// Square marching starts here

bool random_bool(ivec2 p) {
    //return simplex3d(vec3(p,0.))>0.;
    return fbm(vec3(vec2(p) * .05, time * 0.3)) > 0.;
}

int combine(bool b3, bool b2, bool b1, bool b0) {
    return int(b3) * 8 + int(b2) * 4 + int(b1) * 2 + int(b0);
}

const vec2[] axes = vec2[](vec2(1, 0), normalize(vec2(1, 1)), normalize(vec2(-1, 1)), vec2(0, 1), normalize(vec2(1, 1)), normalize(vec2(-1, 1)), vec2(1, 0), normalize(vec2(-1, 1)), normalize(vec2(-1, 1)), vec2(1, 0), normalize(vec2(1, 1)), normalize(vec2(1, 1)), vec2(0, 1), normalize(vec2(-1, 1)), normalize(vec2(1, 1)), vec2(1, 0));

// lines passing through (-4,-2) will be offscreen for all the 4 different slopes we use.
const vec4[] points = vec4[](vec4(-4, -4, -4, -2), vec4(0, -1, -4, -2), vec4(0, -1, -4, -2), vec4(0, 0, -4, -2), vec4(0, 1, -4, -2), vec4(0, 1, 0, -1), vec4(0, 0, -4, -2), vec4(0, 1, -4, -2), vec4(0, 1, -4, -2), vec4(0, 0, -4, -2), vec4(0, 1, 0, -1), vec4(0, 1, -4, -2), vec4(0, 0, -4, -2), vec4(0, -1, -4, -2), vec4(0, -1, -4, -2), vec4(-4, -4, -4, -2));

float line_d(vec2 p, vec2 axis, float width) {
    return abs(dot(p, axis)) - width;
}

vec2 combine_dots(vec2 dot1, vec2 dot2) {
    return dot1.x <= dot2.x ? dot1 : dot2;
}

void main() {
    vec2 uv = vUv;

    uv.x -= .5;
    uv.y -= 1.;
    uv = 2. * uv - 1.;
    uv.x *= ratio;

    uv *= 15.;

    //uv.y /= ratio;

    // uv *= 10.;

    ivec2 bl = ivec2(floor(uv));
    ivec2 br = bl + ivec2(1, 0);
    ivec2 tl = bl + ivec2(0, 1);
    ivec2 tr = bl + ivec2(1, 1);

    bool bbl = random_bool(bl);
    bool bbr = random_bool(br);
    bool btr = random_bool(tr);
    bool btl = random_bool(tl);
    int index = combine(btl, btr, bbr, bbl);
    //int index = combine(random_bool(tl), random_bool(tr), random_bool(br), random_bool(bl));

    vec2 xy = 2. * fract(uv) - 1.;
    vec4 points_on_lines = points[index];
    vec2 axis = axes[index];
    const float line_width = 0.1;
    float d1 = line_d(xy - points_on_lines.xy, axis, line_width);
    float d2 = line_d(xy - points_on_lines.zw, axis, line_width);
    float d = min(d1, d2);
    float mask = smoothstep(0., .01, d);
    vec3 col = vec3(mask);
    //col -= vec3(fract(uv), 0.); // for debugging purposes

    // dots
    const float dot_size = .1;
    float dbl = length(uv - vec2(bl)) - dot_size;
    float dbr = length(uv - vec2(br)) - dot_size;
    float dtl = length(uv - vec2(tl)) - dot_size;
    float dtr = length(uv - vec2(tr)) - dot_size;
    vec2 dot_dist = combine_dots(vec2(dbl, bbl), vec2(dbr, bbr));
    dot_dist = combine_dots(dot_dist, vec2(dtr, btr));
    dot_dist = combine_dots(dot_dist, vec2(dtl, btl));
    //float dot_dist = min(min(min(dbl, dbr), dtl), dtr);
    float dot_mask = smoothstep(0., .01, dot_dist.x);
   // col = mix(col, vec3(dot_dist.y), 1. - dot_mask);
    col = 1. - col; // dark mode

    gl_FragColor = vec4(col, 1.0);
}