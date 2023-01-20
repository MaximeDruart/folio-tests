import * as THREE from "three"

export function createDataTexture(width, height) {
  // create a buffer with color data

  var size = width * height
  var data = new Uint8Array(4 * size)

  for (var i = 0; i < size; i++) {
    var stride = i * 4

    if (Math.random() < 0.5) {
      data[stride] = 255
      data[stride + 1] = 255
      data[stride + 2] = 255
      data[stride + 3] = 255
    } else {
      data[stride] = 0
      data[stride + 1] = 0
      data[stride + 2] = 0
      data[stride + 3] = 255
    }
  }

  // used the buffer to create a DataTexture

  console.log(data)
  var texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat)

  // just a weird thing that Three.js wants you to do after you set the data for the texture
  texture.needsUpdate = true

  return texture
}
