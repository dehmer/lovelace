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
export const labels = (sidc, options, styles) => {
  return ([children, bbox]) => {
    if (!templates[sidc.dimension]) return [children, bbox]
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

    const line = slots => slots.map(key => options[key]).filter(Boolean).join('/')
    const blocks = Object.entries(templates[sidc.dimension]).reduce((acc, [placement, slots]) => {
      const lines = slots.map(line)
      const style = `style:text-amplifiers/${placement}`
      const extent = styles.textExtent(lines, style)
      const box = boxes[placement](extent)
      const x = placement === 'right' ? 0 : extent[0]
      const dy = extent[1] / lines.length
      const text = (line, index) => ({ type: 'text', x, y: index * dy, text: line })
      const children = lines.map(text)
      acc[0].push({ type: 'g', children, transform: `translate(${box[0]},${bbox[1]})`, style })
      return [acc[0], BBox.merge(acc[1], box)]
    }, [[], BBox.NULL])

    children.push(...blocks[0])
    return [children, BBox.merge(bbox, blocks[1])]
  }
}
