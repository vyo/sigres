import * as sigres from './sigres.js'
import { QuickSort as sort } from './quicksort.js'

const canvas = document.getElementById('demo-canvas')
const ctx = canvas.getContext('2d')

const scale = 1
ctx.scale(scale, scale)
const gridSize = 1024

const tree = sigres.Root(gridSize)
const randomInt = (max) => Math.floor(Math.random() * Math.floor(max))
const signatures = []
const resolutions = []

signatures.splice(0, signatures.length)
resolutions.splice(0, resolutions.length)

for (let i = 0; i < 200 / scale; i++) {
  const x = randomInt(gridSize)
  const y = randomInt(gridSize)
  const size = randomInt(32 / scale)

  signatures.push(sigres.Signature(x, y, size))
}
const tempTree = sigres.Root(gridSize)

for (let i = 0; i < 50 / scale; i++) {
  const x = randomInt(gridSize)
  const y = randomInt(gridSize)
  const size = randomInt(192 / scale)

  resolutions.push(sigres.Resolution(x, y, size))
}

// console.log(`signatures: ${signatures.length}`)
// console.log(`resolutions: ${resolutions.length}`)
// console.log(`cells: ${sigres.cells(tree)}`)
// console.log(`elements: ${sigres.elements(tree)}`)

const compute = (change = false) => {
  if (!change) return

  signatures.forEach(it => { it.geohash = sigres.createPrefix(it, tempTree) })
  sort(resolutions).reverse()
  resolutions.forEach(it => sigres.insert(tree, it))
  for (const res of tree) {
    res.activity = []
  }

  const computeSignal = (sig, res) => {
    // (res * sig) / sigres.linearNorm(sig, res)
    const dist = sigres.linearNorm(sig, res)

    // return Math.sqrt((res - dist) ** 2 + (sig - dist) ** 2) / dist
    return ((res + sig) - dist) / (dist * 2)
  }
  for (const sig of signatures) {
    const root = sigres.resolvePrefix(tree, sig.geohash)
    let node = root
    let signal = 0
    // console.log('sig: ', sig)
    while (true) {
      // console.log('node: ', node)
      if (node.sigs.length > 0) {
        const norms = node.sigs
          .map(it => computeSignal(sig, it))
        signal = Math.max(signal, ...norms)
        // console.log(`intermediate signal: ${sig / signal}`)
      }
      if (!node.parent) break
      node = sigres.up(node)
    }
    for (const node of root) {
      if (node.sigs.length > 0) {
        const norms = node.sigs
          .map(it => computeSignal(sig, it))
        signal = Math.max(signal, ...norms)
        // console.log(`intermediate signal: ${sig / signal}`)
      }
    }
    sig.signal = Math.round(100 * signal) / 100
    // note: design choice: include non-zero signal sigs?
    if (sig.signal === 0) root.activity.push(sig.size)
    // sig.signal && console.log(`signal: ${sig.signal}`)
  }

  for (const res of tree) {
    res.passiveResolution = res.sigs.reduce((acc, cur) => acc + cur, 0) / res.size
    res.passiveSignal = res.activity.reduce((acc, cur) => acc + cur, 0) / res.size
    res.activity = res.passiveResolution === 0 ? 0 : res.passiveSignal / res.passiveResolution
    console.log(res.activity)
  }
}

const draw = (change) => {
  if (!change) return

  window.requestAnimationFrame(draw)

  ctx.clearRect(0, 0, gridSize, gridSize)
  // background
  ctx.fillStyle = 'rgb(240, 240, 240)'
  ctx.beginPath()
  ctx.fillRect(0, 0, gridSize, gridSize)

  for (const node of tree) {
    if (node.activity > 0) {
      const val = Math.min(node.activity, 1) * 5
      ctx.fillStyle = `rgba(0, 70, 200, ${val})`
      ctx.beginPath()
      // ctx.strokeRect(node.x, node.y, node.size, node.size)
      ctx.fillRect(node.x, node.y, node.size, node.size)
    }
  }

  for (const node of tree) {
    for (const res of node.sigs) {
      const gradient = ctx.createRadialGradient(res.x, res.y, 0, res.x, res.y, res.size)

      gradient.addColorStop(0, 'rgba(250, 120, 50, 1)')
      gradient.addColorStop(1, 'rgba(250, 120, 50, 0)')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.ellipse(res.x, res.y, res.size, res.size, 0, 2 * Math.PI, 0)
      ctx.fill()

      // ctx.fillStyle = 'rgba(250, 100, 50, 1)'
      // ctx.beginPath()
      // ctx.ellipse(res.x, res.y, res.size, res.size, 0, 2 * Math.PI, 0)
      // ctx.stroke()
    }
  }

  for (const sig of signatures) {
    if (sig.signal >= 1) {
      ctx.fillStyle = `rgba(100, 50, 220, ${sig.signal})`
    } else {
      ctx.fillStyle = `rgba(70, 80, 70, ${sig.signal})`
    }

    if (sig.signal > 0) {
      ctx.beginPath()
      ctx.ellipse(sig.x, sig.y, sig.size, sig.size, 0, 2 * Math.PI, 0)
      ctx.fill()
    } else {
      ctx.beginPath()
      ctx.ellipse(sig.x, sig.y, sig.size, sig.size, 0, 2 * Math.PI, 0)
      ctx.stroke()
    }
  }

  for (const node of tree) {
    ctx.strokeStyle = 'rgb(100, 100, 100)'
    ctx.beginPath()
    // ctx.strokeRect(node.x, node.y, node.size, node.size)
    ctx.strokeRect(node.x, node.y, node.size, node.size)
  }
}

const getCursorPosition = (canvas, event) => {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  console.log({x, y})
  return {x, y}
}

// canvas.addEventListener('mousemove', (e) => getCursorPosition(canvas, e))
let size = randomInt(32 / scale)
canvas.addEventListener('mousedown', (e) => {
  if (e.button === 2) {
    size = randomInt(32 / scale)
    console.log(size)
  } else if (e.button === 1) {
    const pos = getCursorPosition(canvas, e)

    const sig = sigres.Signature(pos.x, pos.y, size)
    sig.geohash = sigres.createPrefix(sig, tempTree)

    signatures.push(sig)
    compute(true)
    draw(true)
  }
})

// setInterval(compute, 100)
compute(true)
draw(true)
