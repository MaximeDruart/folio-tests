import { shaderMaterial } from "@react-three/drei"
import { extend } from "@react-three/fiber"

const ScreenShaderMaterial = shaderMaterial(
  {
    time: 0,
    ratio: 1,
  },
  ` varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,
  `
    varying vec2 vUv;
    uniform float time;
    uniform float ratio;

    float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
    }


    void main() {

      vec2 p = vUv;
      p.y /= ratio;

      vec2 newUv = p;
      newUv *= 10.0;
      vec2 ipos = floor(newUv);  // get the integer coords

      vec3 color = vec3(random( ipos ));

      gl_FragColor = vec4(color,1.0);

      #include <tonemapping_fragment>
      #include <encodings_fragment>
    }`
)

extend({ ScreenShaderMaterial })

export { ScreenShaderMaterial }
