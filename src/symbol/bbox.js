import * as R from 'ramda'
import pathbbox from 'svg-path-bbox'

export const resize = R.curry(([dx, dy], bbox) => [
  bbox[0] - dx,
  bbox[1] - dy,
  bbox[2] + dx,
  bbox[3] + dy
])

export const extent = bbox => [
  bbox[2] - bbox[0],
  bbox[3] - bbox[1]
]

const bboxfns = {
  path: ({ d }) => pathbbox(d),
  circle: ({ cx, cy, r }) => [cx - r, cy - r, cx + r, cy + r]
}

export const of = instruction => bboxfns[instruction.type](instruction)
