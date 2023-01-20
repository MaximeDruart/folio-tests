import * as THREE from "three"
import { useMemo, useState, useRef, useEffect } from "react"
import { createPortal, useFrame } from "@react-three/fiber"
import { useFBO, OrbitControls, Billboard, Plane, Dodecahedron, useGLTF } from "@react-three/drei"
import "./assets/shaders/simulationMaterial"
import "./assets/shaders/basicRenderMaterial"
import { useControls } from "leva"

export function Particles({ size = 512, ...props }) {
  const simRef = useRef()
  const renderRef = useRef()
  // Set up FBO
  const [scene] = useState(() => new THREE.Scene())
  const [camera] = useState(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1))
  const [positions, setPositions] = useState(
    () => new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0])
  )
  const [uvs, setUvs] = useState(() => new Float32Array([0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0]))
  const target = useFBO(size, size, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
  })
  // Normalize points
  const particles = useMemo(() => {
    const length = size * size
    const particles = new Float32Array(length * 3)
    for (let i = 0; i < length; i++) {
      let i3 = i * 3
      particles[i3 + 0] = (i % size) / size
      particles[i3 + 1] = i / size / size
    }
    return particles
  }, [size])

  // Update FBO and pointcloud every frame
  useFrame((state) => {
    state.gl.setRenderTarget(target)
    state.gl.clear()
    state.gl.render(scene, camera)
    state.gl.setRenderTarget(null)
    renderRef.current.uniforms.positions.value = target.texture
    renderRef.current.uniforms.uTime.value = state.clock.elapsedTime
    simRef.current.uniforms.uTime.value = state.clock.elapsedTime
  })

  const { nodes } = useGLTF("/horse.glb")

  useEffect(() => {
    // nodes.horse_statue_01.geometry.scale(10, 10, 10)
    // const facePos = nodes.horse_statue_01.geometry.attributes.position.array
    // const faceNumber = facePos.length / 3
    // const size = Math.floor(Math.sqrt(faceNumber))
    // const rgbaArray = new Float32Array(size * size * 4)
    // for (let i = 0; i < size * size; i++) {
    //   let i3 = i * 3
    //   let i4 = i * 4
    //   rgbaArray[i4 + 0] = facePos[i3 + 0]
    //   rgbaArray[i4 + 1] = facePos[i3 + 1]
    //   rgbaArray[i4 + 2] = facePos[i3 + 2]
    //   rgbaArray[i4 + 3] = 1
    // }
    // const positions = new THREE.DataTexture(rgbaArray, size, size, THREE.RGBAFormat, THREE.FloatType)
    // positions.needsUpdate = true
    // simRef.current.uniforms.positions.value = positions
  }, [nodes])

  return (
    <>
      {/* Simulation goes into a FBO/Off-buffer */}
      {createPortal(
        <mesh>
          <simulationMaterial ref={simRef} />
          <bufferGeometry>
            <bufferAttribute attach='attributes-position' count={positions.length / 3} array={positions} itemSize={3} />
            <bufferAttribute attach='attributes-uv' count={uvs.length / 2} array={uvs} itemSize={2} />
          </bufferGeometry>
        </mesh>,
        scene
      )}
      {/* <group dispose={null}>
        <mesh geometry={nodes.horse_statue_01.geometry}>
          <meshNormalMaterial />
        </mesh>
      </group> */}
      {/* <Billboard>
        <Plane>
          <simulationMaterial />
        </Plane>
      </Billboard> */}
      {/* The result of which is forwarded into a pointcloud via data-texture */}
      <points {...props}>
        <basicRenderMaterial ref={renderRef} />
        <bufferGeometry>
          <bufferAttribute attach='attributes-position' count={particles.length / 3} array={particles} itemSize={3} />
        </bufferGeometry>
      </points>
    </>
  )
}

const LevaWrappedScene = () => {
  const props = useControls({
    focus: { value: 5.1, min: 3, max: 7, step: 0.01 },
    speed: { value: 100, min: 0.1, max: 100, step: 0.1 },
    aperture: { value: 1.8, min: 1, max: 5.6, step: 0.1 },
    fov: { value: 50, min: 0, max: 200 },
    curl: { value: 0.25, min: 0.01, max: 0.5, step: 0.01 },
  })
  return (
    <>
      <OrbitControls makeDefault zoomSpeed={2} />
      {/* <Dodecahedron /> */}
      <Particles {...props} />
    </>
  )
}

export default LevaWrappedScene
