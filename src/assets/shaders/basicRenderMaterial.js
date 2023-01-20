import * as THREE from "three"
import { extend } from "@react-three/fiber"

class BasicRenderMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader: `
        uniform sampler2D positions;
        uniform float uTime;
        void main() { 
          vec3 pos = texture2D(positions, position.xy).xyz;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          gl_PointSize = 1.0;
        }
      `,
      fragmentShader: `
        void main() {
          gl_FragColor = vec4(vec3(1.0), 0.25);
        }
      `,
      uniforms: {
        positions: { value: null },
        uTime: { value: 0 },
      },
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
    })
  }
}

extend({ BasicRenderMaterial })
