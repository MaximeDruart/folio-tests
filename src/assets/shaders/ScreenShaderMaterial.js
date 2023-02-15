import { shaderMaterial } from "@react-three/drei"
import { extend } from "@react-three/fiber"
import fbmDots from "../glsl/fbmDots.glsl?raw"
import lines from "../glsl/lines.glsl?raw"
import marchingSquares from "../glsl/marchingSquares.glsl?raw"
import shit from "../glsl/shit.glsl?raw"
import glitch2 from "../glsl/glitch2.glsl?raw"

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
  shit
)

extend({ ScreenShaderMaterial })

export { ScreenShaderMaterial }
