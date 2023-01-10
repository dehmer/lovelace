import * as BBox from './bbox'

const templates = {
  UNIT: {
    left: [['W'], ['X', 'Y'], ['V', 'AD', 'AE'], ['T'], ['Z']],
    right: [['F'], ['G'], ['H', 'AF'], ['M'], ['J', 'K', 'L', 'N', 'P']]
  },
  SEA: {
    right: [['T'], ['P'], ['V'], ['Z', 'X'], ['G', 'H']]
  }
}

// TODO: also depends on label font size
export const modifiers = ({ sidc, styles, modifiers }) => {
  if (!modifiers) return box => [[], box]

  return bbox => {
    if (!templates[sidc.dimension]) return [[], bbox]

    const gap = 16
    const [width, height] = BBox.extent(bbox)

    const boxes = {
      left: extent => {
        const right = bbox[0] - gap
        const left = right - extent[0]
        const top = bbox[1] + (height - extent[1]) / 2
        const bottom = top + extent[1]
        return [left, top, right, bottom]
      },
      right: extent => {
        const x1 = bbox[2] + gap
        const x2 = x1 + extent[0]
        const y1 = bbox[1] + (height - extent[1]) / 2
        const y2 = y1 + extent[1]
        return [x1, y1, x2, y2]
      }
    }

    const makeRect = box => ({
      type: 'rect',
      x: box[0],
      y: box[1],
      width: box[2] - box[0],
      height: box[3] - box[1],
      stroke: 'red',
      'stroke-width': 2,
      'stroke-dasharray': [10, 10]
    })

    const makeText = (x, y, text) => ({
      type: 'text', x, y, text,
      'dominant-baseline': 'hanging'
    })

    const makeGroup = (box, children, style) => ({
      type: 'g',
      children,
      transform: `translate(${box[0]},${box[1]})`,
      style
    })

    const line = slots => slots.map(key => modifiers[key]).filter(Boolean).join('/')
    const [instructions, box] = Object.entries(templates[sidc.dimension]).reduce((acc, [placement, slots]) => {
      const lines = slots.map(line)
      const style = `style:text-amplifiers/${placement}`
      const extent = styles.textExtent(lines, style)
      const box = boxes[placement](extent)
      const x = placement === 'right' ? 0 : extent[0]
      const dy = extent[1] / lines.length
      const text = (line, index) => makeText(x, index * dy, line)
      const children = lines.map(text)
      acc[0].push(makeGroup(box, children, style))
      // acc[0].push(makeRect(box))
      return [acc[0], BBox.merge(acc[1], box)]
    }, [[], BBox.NULL])

    const padding = 8
    return [instructions, BBox.merge(bbox, BBox.resize([padding, padding], box))]
  }
}
