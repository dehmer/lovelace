import * as BBox from './bbox'
import data from './echelon.json'

const groups = Object.entries(data).reduce((acc, [key, instructions]) => {
  acc[key] = [instructions, BBox.of(instructions)]
  return acc
}, {})

const group = (sidc, styles, style) => bbox => {
  const [children, box] = groups[sidc.echelon]
  const transform = `translate(0, ${bbox[1]})`
  const child = {  type: 'g', children, style, transform }
  const padding = styles.padding(child.style)
  const paddedBox = BBox.resize(padding, box)
  const translatedBox = BBox.translate([0, bbox[1]], paddedBox)
  return [[child], BBox.merge(bbox, translatedBox)]
}

export const outline = ({ sidc, echelon, outline, styles }) =>
  echelon && outline
    ? group(sidc, styles, 'style:echelon/outline')
    : bbox => [[], bbox]

export const echelon = ({ sidc, styles }) =>
  sidc.echelon
    ? group(sidc, styles, 'style:echelon')
    : bbox => [[], bbox]
