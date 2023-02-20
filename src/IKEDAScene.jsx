import { Box, Grid, Plane, MeshReflectorMaterial, useTexture, useFBO } from "@react-three/drei"
import { Bloom, DepthOfField, EffectComposer, Noise, Pixelation, Vignette } from "@react-three/postprocessing"

import { useFrame, createPortal, useThree } from "@react-three/fiber"
import { useState, useRef, useEffect } from "react"
import * as THREE from "three"
import { ScreenShaderMaterial } from "./assets/shaders/ScreenShaderMaterial"
import { GameOfLifeMaterialScreen, GameOfLifeMaterialBuffer } from "./assets/shaders/GameOfLifeMaterial"
import { createDataTexture } from "./assets/utils/createDataTexture"
import { randInt } from "three/src/math/MathUtils"
import lerp from "@14islands/lerp"
import gsap from "gsap"

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

export function Floor(props) {
  const maps = useTexture({
    map: "/textures/decals_0006_color_1k.jpg",
    displacementMap: "/textures/decals_0006_height_1k.png",
    normalMap: "/textures/decals_0006_normal_direct_1k.png",
    roughnessMap: "/textures/decals_0006_roughness_1k.jpg",
    aoMap: "/textures/decals_0006_ao_1k.jpg",
    alphaMap: "/textures/alpha3.png",
  })

  const meshRef = useRef()

  Object.keys(maps).forEach((key) => {
    maps[key].wrapS = THREE.RepeatWrapping
    maps[key].wrapT = THREE.RepeatWrapping
    maps[key].repeat.set(12, 1).multiplyScalar(0.7)
  })

  useFrame(({ camera }, delta) => {
    if (camera.position.z + 1 < meshRef.current.position.z - 50) {
      meshRef.current.position.z -= 50
    }
  })

  return (
    <>
      {/* <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position-y={-0.2}>
        <planeGeometry args={[120, 10, 20, 10]} />
        <meshStandardMaterial {...maps} transparent opacity={0.2} />
      </mesh> */}
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, Math.PI / 2]} position-y={-0.001}>
        <planeGeometry args={[120, 10]} />
        <MeshReflectorMaterial
          blur={[300, 30]}
          resolution={2048}
          mixBlur={1}
          mixStrength={260}
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

  const [status, setStatus] = useState(randInt(0, 0))

  useFrame(({ camera }, delta) => {
    matRef.current.time += delta

    // if camera's position on z axis - screen's position on z axis is greater than 2 then move the screen forward
    if (camera.position.z + 1 < ref.current.position.z) {
      ref.current.position.z += props.totalLength
      bgRef.current.position.z += props.totalLength
    }
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

  const boxScaleZ = 0.1

  useEffect(() => {
    const translation = boxScaleZ / 2 + 0.001
    bgRef.current.translateZ(-translation)
  }, [])

  const [hovered, setHovered] = useState(false)

  const ratio = props.scale[0] / props.scale[1]

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto"
  }, [hovered])

  return (
    <>
      <Plane
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => setStatus((status) => (status + 1) % 3)}
        {...props}
        ref={ref}
      >
        <screenShaderMaterial
          time={Math.random() * 100}
          ratio={ratio}
          status={status}
          ref={matRef}
          key={ScreenShaderMaterial.key}
          toneMapped={true}
        />
      </Plane>
      <Box {...props} scale-z={boxScaleZ} ref={bgRef}>
        <meshBasicMaterial color='black' />
      </Box>
    </>
  )
}

function rangeRandom(min, max) {
  return Math.random() * (max - min) + min
}

const screenSize = [2.5, 0.01, 1.75]
const screenMargin = 0.1
const randomStr = 0.2
const randomRotStr = Math.PI / 16

const instanceCount = 20

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
        rotation: [0, (Math.PI / 2) * (i % 2 === 0 ? 1 : -1) + randomRot, 0],
        scale: [width, screenSize[2], 1],
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
        <Screen
          totalLength={-positions.reduce((acc, { scale }) => acc + scale[0] / 2, 0) + screenMargin}
          key={index}
          {...props}
        />
      ))}
    </group>
  )
}

const IKEDAScene = () => {
  const { camera } = useThree()

  const isClicking = useRef(false)

  useFrame(({ gl, camera, mouse, events }, delta) => {
    camera.position.z -= delta * 1
    camera.rotation.y = lerp(camera.rotation.y, mouse.x * Math.PI * 0.08, 0.1, delta)

    // const newFov = lerp(camera.fov, isClicking.current ? 60 : 90, 0.1, delta)
    // if (newFov !== camera.fov) {
    //   camera.fov = newFov
    //   camera.updateProjectionMatrix()
    // }
  })

  useEffect(() => {
    // setup event listener for mouse down and up change isCLicking ref
    document.addEventListener("mousedown", () => (isClicking.current = true))
    document.addEventListener("mouseup", () => (isClicking.current = false))

    // cleanup
    return () => {
      document.removeEventListener("mousedown", () => (isClicking.current = true))
      document.removeEventListener("mouseup", () => (isClicking.current = false))
    }
  }, [])

  useEffect(() => {
    gsap.to(camera, {
      fov: 90,
      zoom: 1,
      duration: 2,
      ease: "power4.easeInOut",
      onUpdate: () => {
        camera.updateProjectionMatrix()
      },
    })

    // gsap.to(camera, )
  }, [])

  return (
    <>
      <fog attach='fog' color='#000000' near={1} far={20} />
      {/* <CameraControls ref={cameraRef} makeDefault /> */}
      <Screens />
      {/* <spotLight position={[10, 20, 10]} angle={0.12} penumbra={1} intensity={0.2} castShadow shadow-mapSize={1024} /> */}
      <hemisphereLight intensity={0.35} groundColor='black' />
      {/* <ScreenGameOfLife /> */}
      <Floor />

      <EffectComposer>
        {/* <Pixelation granularity={2} /> */}
        <DepthOfField focusDistance={0} focalLength={0.01} bokehScale={2} height={480} />
        <Bloom mipmapBlur luminanceThreshold={0} luminanceSmoothing={0.9} intensity={0.12} height={300} />
        <Noise opacity={0.08} />
        <Vignette eskil={false} offset={0.1} darkness={0.2} />
      </EffectComposer>
    </>
  )
}
export default IKEDAScene
