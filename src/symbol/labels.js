import * as BBox from './bbox'

const templates = {}

templates['AIR'] = {
  right: [['T'], ['P'], ['V'], ['Z', 'X'], ['G', 'H']]
}

templates['UNIT'] = {
  left: [['W'], ['X', 'Y'], ['V', 'AD', 'AF', 'AI'], ['T'], ['Z']],
  right: [['AC'], ['G'], ['H'], ['M'], ['J', 'K', 'L', 'N', 'P']]
}

templates['EQUIPMENT'] = templates['UNIT']
templates['DISMOUNTED'] = templates['UNIT']

templates['SEA'] = {
  right: [['T'], ['P'], ['V'], ['Z', 'X'], ['G', 'H']]
}

templates['SUBSURFACE'] = {
  right: [['T'], ['V'], ['X'], ['G'], ['H']]
}

// TODO: also depends on label font size
/* eslint-disable import/no-anonymous-default-export */
export default ({ dimension, styles, ...modifiers }) => {
  if (!modifiers) return box => [box, []]
  if (!templates[dimension]) return box => [box, []]

  return box => {
    const gap = 16
    const [width, height] = BBox.extent(box)

    const boxes = {
      left: extent => {
        const right = box[0] - gap
        const left = right - extent[0]
        const top = box[1] + (height - extent[1]) / 2
        const bottom = top + extent[1]
        return [left, top, right, bottom]
      },
      right: extent => {
        const right = box[2] + gap
        const left = right + extent[0]
        const top = box[1] + (height - extent[1]) / 2
        const bottom = top + extent[1]
        return [right, top, left, bottom]
      }
    }

    const makeText = (x, y, text) => ({
      type: 'text', x, y, text,
      'dominant-baseline': 'hanging'
    })

    const makeGroup = (box, children, style) => ({
      type: 'g',
      children,
      transform: `translate(${box[0]},${box[1]})`,
      ...styles[style]
    })

    const line = slots => slots.map(key => modifiers[key]).filter(Boolean).join('/')
    const [bbox, instructions] = Object
      .entries(templates[dimension])
      .reduce((acc, [placement, slots]) => {
        const lines = slots.map(line)
        const style = `style:text-amplifiers/${placement}`
        const extent = styles.textExtent(lines, style)
        const box = boxes[placement](extent)
        const x = placement === 'right' ? 0 : extent[0]
        const dy = extent[1] / lines.length
        const text = (line, index) => makeText(x, index * dy, line)
        const children = lines.map(text)
        acc[1].push(makeGroup(box, children, style))
        return [BBox.merge(acc[0], box), acc[1]]
      }, [BBox.NULL, []])

    return [bbox, instructions]
  }
}

export const aliases = {
  quantity: 'D',
  reinforcedReduced: 'F',
  staffComments: 'G',
  additionalInformation: 'H',
  evaluationRating: 'J',
  combatEffectiveness: 'K',
  signatureEquipment: 'L',
  higherFormation: 'M',
  hostile: 'N',
  iffSif: 'P',
  // direction: 'Q',
  sigint: 'R2',
  uniqueDesignation: 'T',
  type: 'V',
  dtg: 'W',
  altitudeDepth: 'X',
  location: 'Y',
  speed: 'Z',
  // specialHeadquarters: 'AA',
  country: 'AC',
  platformType: 'AD',
  equipmentTeardownTime: 'AE',
  commonIdentifier: 'AF',
  auxiliaryEquipmentIndicator: 'AG',
  // headquartersElement: 'AH',
  installationComposition: 'AI'
}
