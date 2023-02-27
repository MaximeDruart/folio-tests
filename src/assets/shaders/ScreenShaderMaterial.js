import { shaderMaterial } from "@react-three/drei"
import { extend } from "@react-three/fiber"
import { UniformsLib, Vector2 } from "three"

import frag from "../glsl/screenShader.glsl?raw"
import td from "../glsl/27_02.glsl?raw"

const uniforms = {}
Object.entries(UniformsLib.fog).forEach(([key, { value }]) => {
  uniforms[key] = value
})

const ScreenShaderMaterial = shaderMaterial(
  {
    time: 0,
    ratio: 1,
    fog: true,
    mouse: new Vector2(-10, -10),
    status: 0,
    ...uniforms,
  },
  ` 

  #include <fog_pars_vertex>
  varying vec2 vUv;
    void main() {
      #include <begin_vertex>
      #include <project_vertex>

      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

      #include <fog_vertex>
    }

    `,
  frag
)

extend({
  ScreenShaderMaterial,
})

export { ScreenShaderMaterial }
