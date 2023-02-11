const neopixels = document.querySelector('#neopixels')
const debugEl = document.querySelector('#debug')
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
  if(effectLoop) stop()
  effectLoop = setInterval(() => {
    for(let pixel=0;pixel<numberOfPixels; pixel++) {
      angle = angle > 1 ? angle = 0 : angle += increment
      tempPixels[pixel] = hslToRgb(angle, 1, brightness)
    }

    setPixels(tempPixels)
  }, wait)
}
// rainbow(1)

function cycle(wait) {
  let tempPixels = []
  let angle = 0

  if(effectLoop) stop()
  effectLoop = setInterval(() => {
    angle = angle > 1 ? angle = 0 : angle += 0.01

    for (let pixel=0; pixel<numberOfPixels; pixel++) {
      tempPixels[pixel] = hslToRgb(angle, 1, brightness)
    }

    setPixels(tempPixels)
  }, wait)
}
// cycle(500)

function race(wait, bounce) {
  let tempPixels = []
  let index = 0
  let reverse = false

  if(effectLoop) stop()
  effectLoop = setInterval(() => {
    tempPixels = Array(98).fill([0, 150, 0])
    tempPixels[index] = [255, 0, 0]
    
    if(reverse && bounce) {
      if(index-1 > 0) {
        index = index-1
      } else {
        reverse = false
      }
    } else {
      if(index+1 < numberOfPixels) {
        index = index+1
      } else {
        if(!bounce) index = 0
        reverse = true
      }
    }

    setPixels(tempPixels)
  }, wait)
}
// race(10, false)
// race(50, true)

async function fire(wait) {
  let tempPixels = Array(numberOfPixels).fill([0,0,0])
  let baseFlameColor = [ 230, 60, 180 ] // rbg

  if(effectLoop) stop()
  effectLoop = setInterval(() => {
    for(let i = 0; i < numberOfPixels; i++) {
      tempPixels[i] = baseFlameColor.map((col) => {
        const flickerAmount = Math.floor(Math.random() * (20 - -20) + -20)
        return col - flickerAmount > 0 ? col - flickerAmount : 0
      })
    }

  setPixels(tempPixels)
  }, wait)
}
// fire(200)

function on(bright = brightness) {
  return setPixels(Array(numberOfPixels).fill([
    255*(bright),
    255*(bright),
    255*(bright)
  ]))
}

function off() {
  return on(0)
}

function debug(stuff) {
  debugEl.innerHTML = JSON.stringify(stuff)
}

function stop() {
  clearInterval(effectLoop)
}

/* rendering */
function setPixel(index, value) {
  pixels[index] = value
  return render()
}

function setPixels(inPixels) {
  return inPixels.map((pixel, i) => {
    return setPixel(i, pixel)
  })
}

function render() {
  debug(pixels)
  const padding = [1, 1]
  const truePixelWidth = pixelWidth+padding[0]
  const fit = Math.floor(canvasWidth/truePixelWidth)
  pixels.forEach((pixel, i) => {
    const vertPos = Math.floor(i/fit)

    ctx.fillStyle = `rgb(${pixel[0]},${pixel[2]},${pixel[1]})`
    let xPos = truePixelWidth*i - canvasWidth*vertPos + ((canvasWidth-(truePixelWidth*fit))*vertPos)
    let yPos = vertPos*(pixelHeight+padding[1])
    ctx.fillRect(xPos, yPos, pixelHeight, pixelWidth)
  })
  return pixels
}
render()