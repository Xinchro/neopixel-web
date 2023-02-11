const neopixels = document.querySelector('#neopixels')
const numberOfPixels = 98
const pixels = Array(numberOfPixels).fill([255,255,255])
const pixelWidth = 10
const pixelHeight = pixelWidth
const canvasWidth = 540
const canvasHeight = 304
let brightness = 0.5
let effectLoop

const ctx = neopixels.getContext("2d")
ctx.canvas.width = canvasWidth
ctx.canvas.height = canvasHeight

function hslToRgb(hue, sat, light){
    let r, g, b

    if(sat == 0){
        r = g = b = light
    }else{
        let hue2rgb = function hue2rgb(light3, light2, hue2){
            if(hue2 < 0) hue2 += 1
            if(hue2 > 1) hue2 -= 1
            if(hue2 < 1/6) return light3 + (light2 - light3) * 6 * hue2
            if(hue2 < 1/2) return light2
            if(hue2 < 2/3) return light3 + (light2 - light3) * (2/3 - hue2) * 6
            return light3
        }

        let light2 = light < 0.5 ? light * (1 + sat) : light + sat - light * sat
        let light3 = 2 * light - light2
        r = hue2rgb(light3, light2, hue + 1/3)
        g = hue2rgb(light3, light2, hue)
        b = hue2rgb(light3, light2, hue - 1/3)
    }

    r = Math.round(r * 255)
    g = Math.round(g * 255)
    b = Math.round(b * 255)

    return [r, b, g]
}

function rainbow(wait) {
  let tempPixels = []
  let increment = 100/98/100 // hue range / pixel amount / 100(to get it in 0-1)
  let angle = 0
  effectLoop = setInterval(() => {
    for(let pixel=0;pixel<numberOfPixels; pixel++) {
      angle = angle > 1 ? angle = 0 : angle += increment
      tempPixels[pixel] = hslToRgb(angle, 1, brightness)
    }

    setPixels(tempPixels)
  }, wait)
}
// rainbow(1, 0.5)

async function race(wait) {
  let tempPixels = []
  for (let i = 0; i < numberOfPixels; i++) {
    tempPixels[i] = [255, 0, 0]
    setPixels(tempPixels)
    await sleep(wait)
    tempPixels[i] = [0, 0, 0]
    setPixels(tempPixels)
  }
}
// race(1)

async function sleep(time) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res()
    }, time)
  })
}

function debug(stuff) {
  document.querySelector('#debug').innerText = JSON.stringify(stuff)
}

function stop() {
  clearInterval(effectLoop)
}

/* rendering */
function setPixel(index, value) {
  pixels[index] = value
  render()
}

function setPixels(inPixels) {
  inPixels.forEach((pixel, i) => {
    setPixel(i, pixel)
  })
}

function render() {
  debug(pixels)
  pixels.forEach((pixel, i) => {
    ctx.fillStyle = `rgb(${pixel[0]},${pixel[2]},${pixel[1]})`
    if(pixelWidth*i + pixelWidth < canvasWidth) {
      ctx.fillRect(pixelWidth*i, 0, pixelHeight, pixelWidth)
    } else {
      ctx.fillRect(pixelWidth*i - canvasWidth, 20, pixelHeight, pixelWidth)
    }
  })
}
render()