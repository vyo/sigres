
distance = (a, b) -> math.sqrt((a.x-b.x)^2 + (a.y - b.y)^2)
linear = (x) -> 20 / x
falloff = linear

relativeSignature = (sig, res) ->
  {signature: (sig.signature + res.resolution) * falloff(distance(sig.position, res.position)), position: sig.position}

SigRes = () ->
  self = {}

  -- complexity is O(#sig * #res)
  self.threshold =
    detection: 1
    identification: 5
    classification: 10
  self.relative = (sig, res) ->
    vis = {}
    for i,s in pairs(sig)
      for r in *res
        rel = relativeSignature(s, r)
        if vis[i] == nil or rel.signature > vis[i].signature
          vis[i] = rel

    return vis

  return self

return SigRes
