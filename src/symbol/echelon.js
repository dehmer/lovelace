import * as BBox from './bbox'
import data from './echelon.json'

const lookup = Object.entries(data).reduce((acc, [key, instructions]) => {
  acc[key] = { type: 'g', children: instructions, bbox: BBox.of(instructions) }
  return acc
}, {})

export const echelon = sidc => {
  return ([children, bbox]) => {
    if (!sidc.echelon) return [children, bbox]
    const { bbox: box, ...rest } = lookup[sidc.echelon]
    children.push({ ...rest, transform: `translate(0, ${bbox[1]})` })
    return [children, BBox.merge(bbox, BBox.translate([0, bbox[1]], box))]
  }
}
