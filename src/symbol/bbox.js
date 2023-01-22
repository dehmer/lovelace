import * as R from 'ramda'
import pathbbox from 'svg-path-bbox'

export const resize = R.curry(([dx, dy], bbox) => [
  bbox[0] - dx,
  bbox[1] - dy,
  bbox[2] + dx,
  bbox[3] + dy
])

export const translate = R.curry(([dx, dy], bbox) => [
  bbox[0] + dx,
  bbox[1] + dy,
  bbox[2] + dx,
  bbox[3] + dy
])

export const extent = bbox => [
  bbox[2] - bbox[0],
  bbox[3] - bbox[1]
]

export const merge = (a, b) => [
  Math.min(a[0], b[0]),
  Math.min(a[1], b[1]),
  Math.max(a[2], b[2]),
  Math.max(a[3], b[3])
]

export const NULL = [
  Number.POSITIVE_INFINITY,
  Number.POSITIVE_INFINITY,
  Number.NEGATIVE_INFINITY,
  Number.NEGATIVE_INFINITY
]

export const xywh = bbox => ({
  x: bbox[0],
  y: bbox[1],
  width: bbox[2] - bbox[0],
  height: bbox[3] - bbox[1]
})

// const path = ({ d, 'stroke-width': w = 0 }) => resize([w / 2, w / 2], pathbbox(d))
// const circle = ({ cx, cy, r, 'stroke-width': w = 0 }) => resize([w / 2, w / 2], [cx - r, cy - r, cx + r, cy + r])
// const group = ({ children, 'stroke-width': w = 0 }) => resize([w / 2, w / 2], children.map(of).reduce(merge))

const path = ({ d }) => pathbbox(d)
const circle = ({ cx, cy, r }) => [cx - r, cy - r, cx + r, cy + r]
const group = ({ children }) => children.map(of).reduce(merge)

export const of = R.cond([
  [R.is(Array), xs => xs.map(of).reduce(merge)],
  [R.propEq('type', 'path'), path],
  [R.propEq('type', 'circle'), circle],
  [R.propEq('type', 'g'), group]
])
