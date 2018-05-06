sigres = require('sigres')()

distance = (a, b) -> math.sqrt((a.x-b.x)^2 + (a.y - b.y)^2)

signatures = {
  {signature: 1, resolution: 1, position: {x: 125, y: 100}}
  {signature: 5, resolution: 1, position: {x: 150, y: 100}}
  {signature: 10, resolution: 1, position: {x: 200, y: 100}}
  {signature: 15, resolution: 1, position: {x: 250, y: 100}}
  {signature: 25, resolution: 1, position: {x: 350, y: 100}}
  {signature: 35, resolution: 1, position: {x: 450, y: 100}}
  {signature: 45, resolution: 1, position: {x: 550, y: 100}}
  {signature: 55, resolution: 1, position: {x: 650, y: 100}}
  {signature: 5, resolution: 1, position: {x: 150, y: 150}}
  {signature: 5, resolution: 1, position: {x: 250, y: 250}}
  {signature: 10, resolution: 1, position: {x: 300, y: 300}}
  {signature: 10, resolution: 1, position: {x: 350, y: 150}}
  {signature: 15, resolution: 1, position: {x: 450, y: 250}}
  {signature: 5, resolution: 1, position: {x: 200, y: 200}}
  {signature: 25, resolution: 1, position: {x: 400, y: 400}}
  {signature: 50, resolution: 1, position: {x: 500, y: 500}}
}

resolutions = {
  {signature: 10, resolution: 10, position: {x: 100, y: 100}}
  {signature: 10, resolution: 10, position: {x: 150, y: 400}}
  {signature: 10, resolution: 10, position: {x: 550, y: 350}}
}

resolutionStrength = 10

love.draw = () ->
  relativeSignatures = sigres.relative(signatures, resolutions)
  width, height = love.graphics.getDimensions()
  grid = {}

  if #signatures > 0
    for x = 1,width,10 do
      for y = 1,height,10 do
        rel = sigres.relative({{signature: 10, resolution: 1, position: {x: x, y: y}}}, [ {signature: sig.resolution, resolution: sig.signature, position: sig.position} for sig in *signatures])[1].signature
        if rel != nil and rel > 2.5
          love.graphics.setColor(0,rel/50,0,1)
          love.graphics.rectangle('fill', x-5, y-5, 10, 10)
          love.graphics.setColor(0,0,0,1)
          love.graphics.rectangle('line', x-5, y-5, 10, 10)
        grid[#grid + 1] = {0,rel/50,0,1}
  love.graphics.setColor(1,1,1,1)

  gridIndex = 0
  if #resolutions > 0
    for x = 1,width,10 do
      for y = 1,height,10 do
        rel = sigres.relative({{signature: 10, resolution: 1, position: {x: x, y: y}}}, resolutions)[1].signature
        gridIndex += 1
        if rel != nil and rel > 2.5
          colour = grid[gridIndex]
          c = colour
          love.graphics.setColor(rel/50 + c[1],0 + c[2],0 + c[3], 1)
          love.graphics.rectangle('fill', x-5, y-5, 10, 10)
          love.graphics.setColor(0,0,0,1)
          love.graphics.rectangle('line', x-5, y-5, 10, 10)
  love.graphics.setColor(1,1,1,1)

  -- love.graphics.setColor(0.3, 0.3, 1, 1)
  -- for v in *relativeSignatures
  --   if v == nil
  --     continue
  --   mode = 'fill'
  --   if v.signature >= sigres.threshold.classification
  --     love.graphics.setColor(0.3, 0.8, 0.3, 1)
  --     love.graphics.circle(mode, v.position.x, v.position.y, v.signature)
  --   else if v.signature >= sigres.threshold.identification
  --     love.graphics.setColor(0.3, 0.8, 0.8, 1)
  --     love.graphics.circle(mode, v.position.x, v.position.y, v.signature)
  --   else if v.signature >= sigres.threshold.detection
  --     love.graphics.setColor(0.3, 0.3, 0.8, 1)
  --     love.graphics.circle(mode, v.position.x, v.position.y, v.signature)
  love.graphics.setColor(1,1,1,1)
  for v in *relativeSignatures
    if v == nil
      continue
    love.graphics.print({{1,1,1,1}, "vis: #{math.floor(v.signature)}"}, v.position.x + 10, v.position.y - 5)
  love.graphics.setColor(1,1,1,1)

  -- draw resolution range indicators
  -- love.graphics.setColor(1, 0.3, 0.3, 0.3)
  -- for r in *resolutions
  --   if r == nil
  --     continue
  --   love.graphics.circle('line', r.position.x, r.position.y, r.resolution)
  -- love.graphics.setColor(1,1,1,1)
  for r in *resolutions
    if r == nil
      continue
    love.graphics.print({{1, 1, 1, 1}, "res: #{r.resolution}"}, r.position.x, r.position.y)
  love.graphics.setColor(1,1,1,1)

  -- love.graphics.setColor(0.3, 1, 0.3, 0.3)
  -- for s in *signatures
  --   if s == nil
  --     continue
  --   love.graphics.circle('line', s.position.x, s.position.y, s.signature)
  love.graphics.setColor(1,1,1,1)
  for s in *signatures
    if s == nil
      continue
    love.graphics.print({{1,1,1,1}, "sig: #{s.signature}"}, s.position.x + 10, s.position.y + 10)
  love.graphics.setColor(1,1,1,1)

  love.graphics.setColor(1,0.3,0.3,1)
  cursorX, cursorY = love.mouse.getPosition()
  love.graphics.circle('fill', cursorX, cursorY, 10)
  love.graphics.setColor(1,1,1,1)

  leftMouse = love.mouse.isDown(1)
  if leftMouse
    resolutions[#resolutions + 1] = {signature: 10, resolution: resolutionStrength, position: {x: cursorX, y: cursorY}}

  rightMouse = love.mouse.isDown(2)
  if rightMouse
    for i,r in pairs resolutions
      if r == nil
        continue
      if distance({x: cursorX, y: cursorY}, r.position) < 15
        resolutions[i] = nil


  love.graphics.print({{1,1,1,1}, "fps: #{love.timer.getFPS()}"}, 25, 400)
  love.graphics.print({{1,1,1,1}, "resolution strength: #{resolutionStrength}"}, 25, 425)
  love.graphics.print({{1,1,1,1}, "press ',' to increase, '.' to decrease, +'shift' for 5 at once"}, 25, 450)
  love.graphics.print({{1,1,1,1}, "esc to exit"}, 25, 475)
  love.graphics.print({{1,1,1,1}, "left-click to place sensors, right-click to remove"}, 25, 500)
  love.graphics.print({{1,1,1,1}, "backspace to remove all sensors"}, 25, 525)

love.keyreleased = (key) ->
  switch key
    when 'backspace'
      resolutions = {}
    when 'escape'
      love.event.quit()
    when ','
      if love.keyboard.isDown('lshift') or love.keyboard.isDown('rshift')
        resolutionStrength += 5
      else
        resolutionStrength += 1
      if resolutionStrength > 50
        resolutionStrength = 50
    when '.'
      if love.keyboard.isDown('lshift') or love.keyboard.isDown('rshift')
        resolutionStrength -= 5
      else
        resolutionStrength -= 1
      if resolutionStrength < 1
        resolutionStrength = 1

