import * as BBox from './bbox'
import { compose } from './layout'
import geometries from './frame.json'

const shapes = Object.entries(geometries).reduce((acc, [key, value]) => {
  const { open, ...instruction } = value
  acc[key] = {
    ...instruction,
    bbox: BBox.of(instruction),
    style: 'style:frame/shape'
  }

  return acc
}, {})

const overlays = Object.entries(geometries).reduce((acc, [key, value]) => {
  const { open, ...instruction } = value
  acc[key] = {
    ...instruction,
    bbox: BBox.of(instruction),
    style: 'style:frame/overlay'
  }

  return acc
}, {})

// Frames with closed paths.
const outlines = Object.entries(geometries).reduce((acc, [key, value]) => {
  const { open, ...rest } = value
  const instruction = open ? { type: 'path', d: rest.d + ' Z' } : rest

  acc[key] = {
    ...instruction,
    bbox: BBox.of(instruction),
    style: 'style:frame/outline'
  }

  return acc
}, {})

export const outline = ({ sidc, frame, outline, styles }) => {
  if (!frame || !outline) return bbox => [[], bbox]

  return bbox => {
    const key = `${sidc.dimension}+${sidc.affiliation}`
    const { bbox: box, ...instruction } = outlines[key]
    const padding = styles.padding(instruction.style)
    const pbox = BBox.resize(padding, box)
    return [[instruction], BBox.merge(bbox, pbox)]
  }
}

export const shape = ({ sidc, styles }) => {
  // TODO: no frame
  return bbox => {
    const key = `${sidc.dimension}+${sidc.affiliation}`
    const { bbox: box, ...instruction } = shapes[key]
    const padding = styles.padding(instruction.style)
    const pbox = BBox.resize(padding, box)
    return [[instruction], BBox.merge(bbox, pbox)]
  }
}

export const overlay = ({ sidc, frame, styles }) => {
  if (!frame) return bbox => [[], bbox]
  if (sidc.status === 'PRESENT' && !sidc.pending) return bbox => [[], bbox]

  return bbox => {
    const key = `${sidc.dimension}+${sidc.affiliation}`
    const { bbox: box, ...instruction } = overlays[key]
    const padding = styles.padding(instruction.style)
    const pbox = BBox.resize(padding, box)
    return [[instruction], BBox.merge(bbox, pbox)]
  }
}
