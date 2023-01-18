import { OrbitControls } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Vector3 } from "three"
import { Folder } from "./Folder"
import { projectsByYear } from "./assets/projectData"

const folderWidth = 2
const folderHeight = 2
const rowOffset = 0.2
const colOffset = 0.2

const folderData = []

Object.entries(projectsByYear).forEach(([year, projects], i) => {
  projects
    .sort((a, b) => a.date - b.date)
    .forEach((project, j) => {
      const x = i * (folderWidth + rowOffset)
      const y = 0
      const z = -j * (folderHeight + colOffset)
      folderData.push({
        position: new Vector3(x, y, z),
        data: project,
      })
    })
})

function Projects() {
  return (
    <group>
      {folderData.map((folder, i) => (
        <Folder key={i} position={folder.position} project={folder.data} />
      ))}
      {/* <Folder /> */}
      <OrbitControls makeDefault dampingFactor={0.3} />
    </group>
  )
}

export default Projects
