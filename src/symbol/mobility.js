import * as BBox from'./bbox'
import data from './mobility.json'

// Optional vertical offset for NEUTRAL affiliation.
const offsets = { TOWED: 8, OVER_SNOW: 13 }

const lookup = Object.entries(data).reduce((acc, [key, instructions]) => {
  acc[key] = {
    type: 'g',
    children: instructions,
    bbox: BBox.of(instructions),
    offset: offsets[key] || 0
  }
  return acc
}, {})

export const mobility = ({ sidc }) => {
  if (!sidc.mobility) return bbox => [[], bbox]

  return bbox => {
    const { bbox: box, offset, ...rest } = lookup[sidc.mobility]
    const dy = sidc.affiliation === 'NEUTRAL' ? bbox[3] + offset : bbox[3]
    const instruction = { ...rest, transform: `translate(0, ${dy})` }
    return [[instruction], BBox.merge(bbox, BBox.translate([0, dy], box))]
  }
}
