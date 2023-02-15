import { Box, OrbitControls, Plane, MeshReflectorMaterial, useTexture, useFBO } from "@react-three/drei"
import { useFrame, createPortal } from "@react-three/fiber"
import { useState, useRef, useEffect } from "react"
import * as THREE from "three"
import { ScreenShaderMaterial } from "./assets/shaders/ScreenShaderMaterial"
import { GameOfLifeMaterialScreen, GameOfLifeMaterialBuffer } from "./assets/shaders/GameOfLifeMaterial"
import { createDataTexture } from "./assets/utils/createDataTexture"

export function Floor(props) {
  const maps = useTexture({
    map: "/textures/decals_0006_color_1k.jpg",
    displacementMap: "/textures/decals_0006_height_1k.png",
    normalMap: "/textures/decals_0006_normal_direct_1k.png",
    roughnessMap: "/textures/decals_0006_roughness_1k.jpg",
    aoMap: "/textures/decals_0006_ao_1k.jpg",
    alphaMap: "/textures/alpha3.png",
  })

  Object.keys(maps).forEach((key) => {
    maps[key].wrapS = THREE.RepeatWrapping
    maps[key].wrapT = THREE.RepeatWrapping
    maps[key].repeat.set(9, 1).multiplyScalar(0.7)
  })

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position-y={-0.2}>
        <planeGeometry args={[90, 10, 20, 10]} />
        <meshStandardMaterial {...maps} transparent opacity={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position-y={-0.21}>
        <planeGeometry args={[90, 10]} />
        <MeshReflectorMaterial
          blur={[300, 30]}
          resolution={2048}
          mixBlur={1}
          mixStrength={80}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color='#202020'
          metalness={0.8}
        />
      </mesh>
    </>
  )
}

const Screen = (props) => {
  const ref = useRef()
  const bgRef = useRef()
  const matRef = useRef()

  const isFaulty = useRef(Math.random() > 0.7)

  useFrame((state, delta) => {
    matRef.current.time += delta
  })

  useEffect(() => {
    if (!isFaulty.current) return
    ref.current.color = new THREE.Color("black")

    const interval = setInterval(() => {
      ref.current.color = new THREE.Color("white")
      setTimeout(() => {
        ref.current.color = new THREE.Color("black")
      }, 100)
      setTimeout(() => {
        ref.current.color = new THREE.Color("white")
      }, 150)
      setTimeout(() => {
        ref.current.color = new THREE.Color("black")
      }, 250)
    }, rangeRandom(5000, 10000))
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const translation = 0.1 / 2
    if (props.position[0] < 0) {
      bgRef.current.translateOnAxis(new THREE.Vector3(0, bgRef.current.rotation.z, 0), translation)
    } else {
      bgRef.current.translateOnAxis(new THREE.Vector3(0, bgRef.current.rotation.z, 0), -translation)
    }
  }, [])

  const ratio = props.scale[0] / props.scale[2]

  return (
    <>
      <Box {...props} ref={ref}>
        <screenShaderMaterial
          time={Math.random() * 100}
          ratio={ratio}
          ref={matRef}
          key={ScreenShaderMaterial.key}
          toneMapped={true}
        />
      </Box>
      <Box {...props} scale-y={0.125} ref={bgRef}>
        <meshBasicMaterial color='black' />
      </Box>
    </>
  )
}

const ScreenGameOfLife = (props) => {
  const ref = useRef()
  const bgRef = useRef()
  const matRef = useRef()
  const simMatRef = useRef()

  const size = 512

  let renderBufferA = useFBO(size, size, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    stencilBuffer: false,
  })

  let renderBufferB = useFBO(size, size, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    stencilBuffer: false,
  })

  const [bufferScene] = useState(() => new THREE.Scene())
  const [bufferCamera] = useState(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1))

  useFrame((state) => {
    state.gl.setRenderTarget(renderBufferA)
    // state.gl.clear()
    state.gl.render(bufferScene, bufferCamera)

    matRef.current.uTexture = renderBufferA.texture
    state.gl.setRenderTarget(null)

    const temp = renderBufferA
    renderBufferA = renderBufferB
    renderBufferB = temp
    simMatRef.current.uTexture = renderBufferB.texture
  })

  const resolution = new THREE.Vector2(size, size)

  const [initTexture] = useState(createDataTexture(size, size))

  const updateMouseUniform = (e) => {
    matRef.current.uMouse = e.uv
  }

  return (
    <>
      {createPortal(
        <mesh>
          <planeGeometry args={[2, 2]} />
          <gameOfLifeMaterialBuffer
            uTexture={initTexture}
            uResolution={resolution}
            ref={simMatRef}
            key={GameOfLifeMaterialBuffer.key}
            toneMapped={true}
          />
        </mesh>,
        bufferScene
      )}
      <Plane
        args={[2, 2]}
        // {...props}
        ref={ref}
        onPointerMove={updateMouseUniform}
      >
        <gameOfLifeMaterialScreen
          uResolution={resolution}
          ref={matRef}
          uMouse={new THREE.Vector2(0, 0)}
          key={GameOfLifeMaterialScreen.key}
          toneMapped={true}
        />
      </Plane>
    </>
  )
}

const screenMat = new THREE.MeshBasicMaterial({ color: "white" })
// const screenMat = new THREE.MeshStandardMaterial({ emissive: "white" })
const screenGeo = new THREE.BoxGeometry(1, 1, 1)

function rangeRandom(min, max) {
  return Math.random() * (max - min) + min
}

const screenSize = [2.5, 0.01, 1.75]
const screenMargin = 0.2
const randomStr = 0.2
const randomRotStr = Math.PI / 14

const instanceCount = 2

const getScreenPositions = () => {
  const args = []
  for (let i = 0; i < 2; i++) {
    const subArg = []
    let currentZ = 8 / 2
    for (let j = 0; j < instanceCount / 2; j++) {
      const randomWidth = rangeRandom(screenSize[0] - randomStr, screenSize[0] + randomStr)
      const width = j === 0 ? screenSize[0] : randomWidth

      const randomRot = rangeRandom(-randomRotStr, randomRotStr)

      subArg.push({
        position: [i % 2 === 0 ? -1.5 : 1.5, screenSize[2] / 2, currentZ - width / 2],
        rotation: [Math.PI / 2, 0, -Math.PI / 2 + randomRot],
        scale: [width, screenSize[1], screenSize[2]],
      })
      currentZ -= width + screenMargin
    }
    args.push(subArg)
  }
  return args.flat()
}

const Screens = () => {
  const [positions] = useState(getScreenPositions())
  const ref = useRef()

  return (
    <group ref={ref}>
      {positions.map((props, index) => (
        <Screen key={index} {...props} />
      ))}
    </group>
  )
}

const IKEDAScene = () => {
  return (
    <>
      <OrbitControls makeDefault />
      <Screens />
      {/* <spotLight position={[10, 20, 10]} angle={0.12} penumbra={1} intensity={0.2} castShadow shadow-mapSize={1024} /> */}
      <hemisphereLight intensity={0.35} groundColor='black' />
      {/* <ScreenGameOfLife /> */}
      {/* <Floor /> */}
    </>
  )
}
export default IKEDAScene
