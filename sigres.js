// #!/usr/bin/env node
'use strict'
import { QuickSort as sort } from './quicksort.js'

/*
 * when inserting a new node:
 *  - check if partially uncovered (not fully covered by any other co-node?) (not an element vector subset)
 *  - check if partially unconstrained (not fully contained within any sub-quadrants?) (not a container vector subset)
 *  => if relevant and eligible insert ~~and prune~~ (pruning would only save space, not time)
 *  => if only relevant recurse into applicable quadrant
 *  => if neither do nothing
 *
 *  premature optimisation strategy:
 *  keep all nodes in a priority queue ordered by size descending
 */

const alpha = 0
const beta = 1
const gamma = 2
const delta = 3

const Resolution = (x, y, size) => {
  return {x, y, size, valueOf: () => size}
}
const Signature = (x, y, size) => {
  return {x, y, size, valueOf: () => size}
}

const Root = (size = 16) => {
  const root = Tree(0, 0, size)
  root.split()

  return root
}
const Tree = (x, y, size, parent) => {
  const sigs = []
  const quads = []
  const split = () => {
    quads[alpha] = Tree(x + size / 2, y + size / 2, size / 2, it)
    quads[beta] = Tree(x + size / 2, y, size / 2, it)
    quads[gamma] = Tree(x, y, size / 2, it)
    quads[delta] = Tree(x, y + size / 2, size / 2, it)
    it.split = null
    return it
  }
  const it = {x, y, size, sigs, quads, split, parent}
  it[Symbol.iterator] = function * () {
    yield it // root
    for (const subtree of quads) {
      // iterate over each subtree and yield its results
      yield * subtree
    }
  }

  return it
}

const linearNorm = (a, b = {x: 0, y: 0}, x = 2) => {
  const norm = Math.pow((a.x - b.x) ** x + (a.y - b.y) ** x, 1 / x)
  // console.log(`norm: ${norm}`)
  return norm
}
const unitRadius = (a, x = 2) => {
  // console.log(`radius: ${a}`)
  return a
}

const covers = (a, b) => {
  const margin = unitRadius(a.size) - unitRadius(b.size) - linearNorm(a, b)
  // console.log(`inner margin: ${margin}`)
  return margin >= 0
}

const constrains = (quad, node) => {
  const contained = {
    top: quad.y + quad.size - node.y - node.size >= 0,
    bottom: quad.y - node.y + node.size <= 0,
    left: quad.x - node.x + node.size <= 0,
    right: quad.x + quad.size - node.x - node.size >= 0
  }

  // console.log('constraints:')
  // console.log(contained)
  return contained.top && contained.bottom && contained.left && contained.right
}

const findQuad = (quad, node) => {
  let index = null
  if (quad.x + quad.size / 2 <= node.x) {
    if (quad.y + quad.size / 2 <= node.y) {
      index = alpha
    } else {
      index = beta
    }
  } else if (quad.y + quad.size / 2 <= node.y) {
    index = delta
  } else {
    index = gamma
  }
  // console.log(`index: ${index}`)
  return index
}

console.log(linearNorm({x: 0, y: 0}, {x: 1, y: 1}))
console.log(covers({x: 0, y: 0, size: 9}, {x: 0, y: 7, size: 2}))
console.log(constrains({x: 0, y: 0, height: 20, width: 20}, {x: 5, y: 4, size: 5}))

const index = Root(16)
const sig = Resolution(1, 1, 2)
const sig2 = Resolution(1, 1, 1)
const sig3 = Resolution(2, 2, 2)
console.log(index)
console.log(sig)
console.log(index.sigs.some((it) => { return covers(it, sig) }))
console.log(index.quads.some((it) => { return constrains(it, sig) }))

const insert = (node, sig) => {
  if (!node.sigs.some((it) => { return covers(it, sig) })) {
    if (!node.quads.some((it) => { return constrains(it, sig) })) {
      console.log(`INSERTING: signature ${JSON.stringify(sig)} fully constrained by previous split`)
      node.sigs.push(sig)
    } else {
      if (!index.quads.some(() => true)) {
        node.split()
      }
      insert(node.quads[findQuad(node, sig)], sig)
    }
  } else {
    console.log(`SKIPPING: signature ${JSON.stringify(sig)} fully covered`)
  }
  return node
}

const sigs = []
sigs.push(sig)
sigs.push(sig2)
sigs.push(sig3)

sort(sigs).reverse()
console.log(sigs)

sigs.forEach(it => insert(index, it))
console.log('final index:')
console.log(index)

// fails softly, i.e. returns the longest valid and matching prefix/deepest subtree node
const down = (index, quad) => index && index.quads[quad] ? index.quads[quad] : index
// fails softly, i.e. returns the index root itself when called on the index root
const up = (index) => index && index.parent ? index.parent : index
const createPrefix = (sig, node = Root(256), prefix = []) => {
  if (!node.quads.some(() => true)) {
    node.split()
  }
  // console.log(node.quads)
  if (node.quads.some((it) => { return constrains(it, sig) })) {
    const quad = findQuad(node, sig)
    prefix.push(quad)
    // console.log(`PREFIX: appending ${quad}`)
    return createPrefix(sig, node.quads[quad], prefix)
  } else {
    return String(prefix)
  }
}
const resolvePrefix = (index, prefix) => [...prefix].reduce((node, value) => down(node, value), index)

console.log('node parents:')
console.log(index.parent)
console.log(down(index, 0))
console.log(down(down(index, 0), 0))
console.log(up(down(index, 0)))
console.log('prefix test:')
const prefix = createPrefix(sig2)
console.log(prefix)
console.log(resolvePrefix(Root(), prefix))

console.log(createPrefix(Resolution(255, 255, 1)))
console.log(createPrefix(Resolution(255, 1, 1)))
console.log(createPrefix(Resolution(1, 1, 1)))
console.log(createPrefix(Resolution(1, 255, 1)))
// const signal = (signature, resolutionIndex) => {}
const root = Root()
root.quads[0].split()
root.quads[0].quads[0].split()
console.log('expecting 13 nodes:')
console.log([...root])
