import * as BBox from './bbox'
import MOBILITY from './mobility.json'

const groups = Object.entries(MOBILITY).reduce((acc, [key, children]) => {
  // Optional vertical offset for NEUTRAL affiliation.
  const offsets = { TOWED: 8, OVER_SNOW: 13 }
  acc[key] = {
    type: 'g',
    children,
    bbox: BBox.of(children),
    offset: offsets[key] || 0
  }
  return acc
}, {})

export const mobility = ({ mobility, affiliation, outline, styles }) => {
  if (!mobility) return bbox => [bbox, []]

  return box => {
    const { bbox, offset, ...group } = groups[mobility]
    const dy = affiliation === 'NEUTRAL' ? box[3] + offset : box[3]
    const instructions = [{ ...group, transform: `translate(0, ${dy})` }]
    if (outline) instructions.push({ ...group, transform: `translate(0, ${dy})`, ...styles['style:outline'], zIndex: -1 })
    return [BBox.translate([0, dy], bbox), instructions]
  }
}
