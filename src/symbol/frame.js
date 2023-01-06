// TODO: frame outline incl. style
import * as BBox from './bbox'
import geometries from './geometries.json'

const frames = Object.entries(geometries).reduce((acc, [key, value]) => {
  const { open, ...instruction } = value

  acc[key] = {
    ...instruction,
    bbox: BBox.of(instruction),
    style: 'frame'
  }

  return acc
}, {})

export const outline = options => {
}

export const shape = sidc => frames[`${sidc.dimension}+${sidc.affiliation}`]
