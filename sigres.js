// #!/usr/bin/env node
'use strict'
// import { QuickSort as sort } from './quicksort.js'

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

export const Resolution = (x, y, size) => {
  return {x, y, size, valueOf: () => size}
}
export const Signature = (x, y, size) => {
  return {x, y, size, valueOf: () => size}
}

export const Root = (size = 16) => {
  const root = Tree(0, 0, size)
  root.split()

  return root
}

export const Tree = (x, y, size, parent) => {
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

export const linearNorm = (a, b = {x: 0, y: 0}, x = 2) => {
  const norm = Math.pow((a.x - b.x) ** x + (a.y - b.y) ** x, 1 / x)
  // console.log('norm: ', a, b, norm)
  // console.log(`norm: ${norm}`)
  return norm
}
export const unitRadius = (a, x = 2) => {
  // console.log(`radius: ${a}`)
  return a
}

export const covers = (a, b) => {
  const margin = unitRadius(a.size) - unitRadius(b.size) - linearNorm(a, b)
  // console.log(`inner margin: ${margin}`)
  return margin >= 0
}

export const constrains = (quad, node) => {
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

export const findQuad = (quad, node) => {
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

export const insert = (node, sig) => {
  if (!node.sigs.some((it) => { return covers(it, sig) })) {
    if (!constrains(node, sig) || node.size < 2) {
      // console.log(`INSERTING: signature ${JSON.stringify(sig)} fully constrained by previous split`)
      node.parent ? node.parent.sigs.push(sig) : node.sigs.push(sig)
    } else {
      if (node.quads.length === 0) node.split()
      insert(node.quads[findQuad(node, sig)], sig)
    }
  } else {
    // console.log(`SKIPPING: signature ${JSON.stringify(sig)} fully covered`)
  }
  return node
}

// fails softly, i.e. returns the longest valid and matching prefix/deepest subtree node
export const down = (index, quad) => index && index.quads[quad] ? index.quads[quad] : index
// fails softly, i.e. returns the index root itself when called on the index root
export const up = (index) => index && index.parent ? index.parent : index
export const createPrefix = (sig, node = Root(256), prefix = []) => {
  if (!node.quads.some(() => true) && node.size > 1) {
    node.split()
  }
  // console.log(node.quads)
  if (node.quads.some((it) => { return constrains(it, sig) })) {
    const quad = findQuad(node, sig)
    prefix.push(quad)
    // console.log(`PREFIX: appending ${quad}`)
    return createPrefix(sig, node.quads[quad], prefix)
  } else {
    return prefix.join('')
  }
}
export const resolvePrefix = (index, prefix) => [...prefix].reduce((node, value) => down(node, value), index)

export const dimension = tree => [...tree].reduce((acc, cur) => acc + cur.quads.length, 0)

export const capacity = tree => [...tree].reduce((acc, cur) => acc + cur.sigs.length, 0)
