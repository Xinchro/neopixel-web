const neopixels = document.querySelector('#neopixels')
const debugEl = document.querySelector('#debug')
let effectLoop

// editable stuff
const numberOfPixels = 98
const pixels = Array(numberOfPixels).fill([255,255,255])
const pixelWidth = 20
const pixelHeight = pixelWidth
const canvasWidth = 540 // change css, too
const canvasHeight = 304 // change css, too
let brightness = 0.5

const ctx = neopixels.getContext("2d")
ctx.canvas.width = canvasWidth
ctx.canvas.height = canvasHeight

// pilphered from https://stackoverflow.com/a/9493060 and modified
function hslToRbg(hue, sat, light){
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


// linear rainbow effect
function rainbow(wait) {
  let tempPixels = []
  // i don't know why it's like this
  // it needs to be reduced in digit length for some reason
  // 100/98/100 => 0.010204081632653062...
  let increment = Number(parseFloat(100/98/100).toFixed(10)) // hue range / pixel amount / 100(to get it in 0-1)
  let angle = 0
  if(effectLoop) stop()
  effectLoop = setInterval(() => {
    for(let pixel=0; pixel<numberOfPixels; pixel++) {
      angle = angle+increment > 1 ? 0 : angle + increment
      tempPixels[pixel] = hslToRbg(angle, 1, brightness)
    }

    setPixels(tempPixels)
  }, wait)
}
// rainbow(10)

// solid cycling effect
function cycle(wait) {
  let tempPixels = []
  let angle = 0
  let increment = 0.01

  if(effectLoop) stop()
  effectLoop = setInterval(() => {
    angle = angle+increment > 1 ? angle = 0 : angle + increment

    for (let pixel=0; pixel<numberOfPixels; pixel++) {
      tempPixels[pixel] = hslToRbg(angle, 1, brightness)
    }

    setPixels(tempPixels)
  }, wait)
}
// cycle(50)

// travelling red pixel, supports bouncing back and forth
function race(wait, bounce) {
  let tempPixels = []
  let index = 0
  let reverse = false

  if(effectLoop) stop()
  effectLoop = setInterval(() => {
    // always set everything to black first
    tempPixels = Array(numberOfPixels).fill([0, 0, 0])
    // set our single travelling pixel
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
// race(50, false)
// race(50, true)

// randomly flickers a given color, with a low chance
function solidFlicker(wait, color=[125,125,125]) {
  let tempPixels = Array(numberOfPixels).fill(color)

  if(effectLoop) stop()
  effectLoop = setInterval(() => {
    const flickerChance = Math.floor(Math.random() * (100 - 0) + 0)
    for(let i = 0; i < numberOfPixels; i++) {
      if(flickerChance > 90) {
        tempPixels[i] = [0,0,0]
      } else {
        tempPixels[i] = color
      }
    }
    setPixels(tempPixels)
  }, wait)
}
// solidFlicker(200, [255,100,0])

// randomly flicker to a different color, with a low chance
function rgbFlicker(wait, color=[125,125,125]) {
  let tempPixels = Array(numberOfPixels).fill(color)

  if(effectLoop) stop()
  effectLoop = setInterval(() => {
    const flickerChance = Math.floor(Math.random() * (100 - 0) + 0)
    for(let i = 0; i < numberOfPixels; i++) {
      if(flickerChance > 90) {
        tempPixels[i] = [0,0,0]
        color = randomColor()
      } else {
        tempPixels[i] = color
      }
    }
    setPixels(tempPixels)
  }, wait)
}
// rgbFlicker(100)

// returns a random color in [r,b,g] format
function randomColor() {
  return hslToRbg(Math.random(), 1, 0.5)
}

// flickers an orange-y color to represent a fire
async function fire(wait) {
  let tempPixels = Array(numberOfPixels).fill([0,0,0])
  let baseFlameColor = [ 230, 60, 180 ] // rbg

  if(effectLoop) stop()
  effectLoop = setInterval(() => {
    for(let i = 0; i < numberOfPixels; i++) {
      tempPixels[i] = baseFlameColor.map((col) => {
        // the amount to deviate from the values in the original color
        const flickerAmount = Math.floor(Math.random() * (10 - -10) + -10)
        
        return col - flickerAmount > 0 ? col - flickerAmount : 0
      })
    }

  setPixels(tempPixels)
  }, wait)
}
// fire(200)

// breathes either a single color, or a rotating list
function breathe(wait, colors=[0, 0.33, 0.66], sat=1 ,light=0.5) {
  let tempPixels = Array(numberOfPixels).fill([0,0,0])
  let breatheIn = true
  let increment = 0.01
  let brightness = 0
  colorIndex = 0

  if(effectLoop) stop()
  effectLoop = setInterval(() => {
    angle = colors[colorIndex]
    
    // calculates the correct brightness for all pixels before sending it to the pixels
    if(breatheIn) {
      if(brightness+increment < light) {
        brightness += increment
      } else {
        brightness = light
        breatheIn = false
      }
    } else {
      if(brightness-increment > 0) {
        brightness -= increment
      } else {
        brightness = 0
        breatheIn = true
        // next color
        colorIndex = colorIndex+1 < colors.length ? colorIndex+1 : 0
      }
    }

    for(let i = 0; i < numberOfPixels; i++) {
      tempPixels[i] = hslToRbg(angle, sat, brightness)
    }

    setPixels(tempPixels)
  }, wait)
}
// breathe(100, [0.8, 0.1])

// turns all the pixels onto the same color
function on(bright=brightness, r=255, g=255, b=255) {
  return setPixels(Array(numberOfPixels).fill([
    r*(bright),
    b*(bright),
    g*(bright)
  ]))
}
// on(1, 255, 0, 0)

// turns off all the pixels / sets them all to black
function off() {
  return on(0)
}

// updates the debug div
function debug(stuff) {
  debugEl.innerHTML = JSON.stringify(stuff)
}

// stops the effectLoop interval
function stop() {
  clearInterval(effectLoop)
}

/* rendering */
// sets a given pixel to a given color
function setPixel(index, value) {
  pixels[index] = value
  return render()
}

// sets all the pixels to a new array of colors
function setPixels(inPixels) {
  return inPixels.map((pixel, i) => {
    return setPixel(i, pixel)
  })
}

// renders the pixel array to the canvas
function render() {
  debug(pixels)
  const padding = [1, 1]
  const truePixelWidth = pixelWidth+padding[0]
  const fit = Math.floor(canvasWidth/truePixelWidth)

  pixels.forEach((pixel, i) => {
    const vertPos = Math.floor(i/fit)
    
    // set the pixel to its respctive color
    ctx.fillStyle = `rgb(${pixel[0]},${pixel[2]},${pixel[1]})`

    // fills a row of pixels, with any given padding
    // also calculates any shifting that occures from changing rows (y-axis)
    let xPos = truePixelWidth*i - canvasWidth*vertPos + ((canvasWidth-(truePixelWidth*fit))*vertPos)
    // calculates the correct row
    let yPos = vertPos*(pixelHeight+padding[1])
    ctx.fillRect(xPos, yPos, pixelHeight, pixelWidth)
  })
  return pixels
}

// initial render
render()