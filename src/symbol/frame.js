import * as BBox from './bbox'
import geometries from './frame.json'

const frames = Object.entries(geometries).reduce((acc, [key, value]) => {
  const { open, ...instruction } = value
  acc[key] = { ...instruction, bbox: BBox.of(instruction), style: 'frame' }
  return acc
}, {})

// TODO: frame outline incl. style
export const outline = options => {
}

export const shape = (sidc, options) => {
  return ([children, bbox]) => {
    const key = `${sidc.dimension}+${sidc.affiliation}`
    const { bbox: box, ...instruction } = frames[key]
    children.push(instruction)
    return [children, BBox.merge(bbox, box)]
  }
}
