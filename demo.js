'use strict'
const canvas = document.getElementById('demo-canvas')
const ctx = canvas.getContext('2d')

ctx.fillStyle = '#76796f'
ctx.fillRect(0, 0, 400, 400)

ctx.beginPath()
ctx.fillStyle = '#5168'
ctx.ellipse(40, 40, 20, 20, 0, 2 * Math.PI, 0)
ctx.fill()
ctx.fillStyle = '#516f'
ctx.ellipse(40, 40, 20, 20, 0, 2 * Math.PI, 0)
ctx.stroke()
