import { Canvas } from "@react-three/fiber"

import { Route, Switch } from "wouter"
import FBOScene from "./FBOScene"
import Fonts from "./Fonts"
import IKEDAScene from "./IKEDAScene"
import Projects from "./Projects"

function App() {
  return (
    <>
      <Canvas
        // camera={{ position: [0, 0.4, 4], fov: 120, zoom: 0.5, far: 50 }}
        camera={{ position: [0, 0.4, 4], fov: 90, far: 50 }}
        style={{ position: "absolute" }}
        dpr={[1, 2]}
      >
        <color attach='background' args={["red"]} />

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
