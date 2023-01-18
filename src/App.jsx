import { OrbitControls, Stage } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Folder } from "./Folder"
import Projects from "./Projects"
import FBOScene from "./FBOScene"
import { Route, Switch, useLocation } from "wouter"
import { Suspense } from "react"
import { EffectComposer, DepthOfField, Bloom, Noise, Vignette } from "@react-three/postprocessing"

function App() {
  return (
    <Canvas dpr={[1, 2]}>
      {/* <EffectComposer>
        <DepthOfField focusDistance={0} focalLength={0.05} bokehScale={2} height={480} />
        <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} intensity={0.4} height={300} /> 
        <Noise opacity={0.02} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer> */}
      <Switch>
        <Route path='/'>
          <Projects />
        </Route>
        <Route path='/fbo'>
          <FBOScene />
        </Route>
      </Switch>
    </Canvas>
  )
}

export default App
