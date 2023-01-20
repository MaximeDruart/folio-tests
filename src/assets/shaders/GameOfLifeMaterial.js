import { shaderMaterial } from "@react-three/drei"
import { extend } from "@react-three/fiber"
import * as THREE from "three"

const GameOfLifeMaterialScreen = shaderMaterial(
  {
    uTexture: { value: null },
    uResolution: {
      value: null,
    },
    uMouse: { value: new THREE.Vector2(0, 0) },
  },
  ` varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,
  `
      precision mediump float;
      //Our input texture
      uniform sampler2D uTexture; 
      uniform vec2 uMouse; 
      uniform vec2 uResolution;
      varying vec2 vUv;

      void main() {
          //special method to sample from texture
          vec4 initTexture = texture2D(uTexture, vUv);

          vec3 color = initTexture.rgb;

          // gl_FragColor = vec4(color, 1.0);



          vec2 dist = uMouse/uResolution - vUv.xy;
          dist.x *= uResolution.x/uResolution.y;

          float mouse_pct = length(dist);

          mouse_pct = step(1., mouse_pct);
          vec3 m_color = vec3(mouse_pct);
          gl_FragColor = vec4(m_color, 1.0);



          // vec3 color2 = vec3(1.0, 0.0, 1.0);
          // gl_FragColor = vec4(color2, 1.0);
      }
    `
)
const GameOfLifeMaterialBuffer = shaderMaterial(
  {
    uTexture: { value: null },
    uResolution: {
      value: null,
    },
  },
  ` varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,
  `
  
  precision mediump float;
  //Our input texture
  uniform sampler2D uTexture; 
  uniform vec2 uResolution;
  
  varying vec2 vUv;
  
  float GetNeighbours(vec2 p) {
    float count = 0.0;

    for(float y = -1.0; y <= 1.0; y++) {
        for(float x = -1.0; x <= 1.0; x++) {

            if(x == 0.0 && y == 0.0)
                continue;

            // Scale the offset down
            vec2 offset = vec2(x, y) / uResolution.xy;	
            // Apply offset and sample texture	 
            vec4 lookup = texture2D(uTexture, p + offset); 
             // Accumulate the result
            count += lookup.r > 0.5 ? 1.0 : 0.0;
        }
    }

    return count;
}
  
  

void main() {
    /*
		Using a temporary variable for the output value for clarity.
		it is just passed to fragColor at the end of the function.
	*/
    vec3 color = vec3(0.0);
  
  /*
		Time to count the population of the neighborhood!
		We count all the live cells in a 3 wide, 3 tall area
		centered on this cell.
		 _ _ _
		|_|_|_|     [-1, -1], [0, -1], [1, -1],
		|_|_|_|  =  [-1,  0], [0,  0], [1,  0],
		|_|_|_|     [-1,  1], [0,  1], [1,  1],

		Since each cell only should hold a value of either 0 (dead) or 1 (alive),
		the count yields an integer value, but since the
		texture sampling returns a float, we will use that instead.
	*/ 
  float neighbors = 0.0;
  
  
        neighbors += GetNeighbours(vUv);

        bool alive = texture2D(uTexture, vUv).x > 0.5;

        if(alive && (neighbors == 2.0 || neighbors == 3.0)) { //cell is alive
            

      		//Any live cell with two or three live       neighbours lives on to the next generation.
            color = vec3(1.0, 0.0, 0.0);

        //cell is dead
        } else if(!alive && (neighbors == 3.0)) { 
        //Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
            color = vec3(1.0, 0.0, 0.0);

        }

    gl_FragColor = vec4(color, 1.0);
      }
  `
)

extend({ GameOfLifeMaterialScreen, GameOfLifeMaterialBuffer })

export { GameOfLifeMaterialScreen, GameOfLifeMaterialBuffer }
