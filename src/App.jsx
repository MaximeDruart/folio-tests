import { OrbitControls, Stage } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Folder } from "./Folder"
import Projects from "./Projects"
import FBOScene from "./FBOScene"
import IKEDAScene from "./IKEDAScene"
import Fonts from "./Fonts"
import { Route, Switch, useLocation } from "wouter"
import { Suspense } from "react"
import { EffectComposer, DepthOfField, Bloom, Noise, Vignette } from "@react-three/postprocessing"

function App() {
  return (
    <>
      <Canvas camera={{ position: [0, 1, 8], fov: 90 }} style={{ position: "absolute" }} dpr={[1, 2]}>
        {/* <color attach='background' args={["red"]} /> */}
        <EffectComposer>
          <DepthOfField focusDistance={0} focalLength={0.01} bokehScale={2} height={480} />
          <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} intensity={0.12} height={300} />
          <Noise opacity={0.08} />
          <Vignette eskil={false} offset={0.1} darkness={0.2} />
        </EffectComposer>
        <Switch>
          <Route path='/'>
            <Projects />
          </Route>
          <Route path='/fbo'>
            <FBOScene />
          </Route>
          <Route path='/ikeda'>
            <IKEDAScene />
          </Route>
        </Switch>
      </Canvas>
      <Route path='/fonts'>
        <Fonts />
      </Route>
    </>
  )
}

export default App
