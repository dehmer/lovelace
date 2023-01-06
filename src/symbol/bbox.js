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

const bboxfns = {
  path: ({ d }) => pathbbox(d),
  circle: ({ cx, cy, r }) => [cx - r, cy - r, cx + r, cy + r]
}

export const of = instruction => Array.isArray(instruction)
  ? instruction.map(of).reduce(merge)
  : bboxfns[instruction.type](instruction)
