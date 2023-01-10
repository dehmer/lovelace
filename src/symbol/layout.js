import * as R from 'ramda'
import * as BBox from './bbox'

export const overlay = (...parts) => bbox => {
  const overlays = parts.map(part => part(bbox))
  const box = overlays.map(R.prop(1)).reduce(BBox.merge, bbox)
  const instructions = overlays.map(R.prop(0)).flat()
  return [instructions, box]
}

export const compose = fns => {
  return fns.reduce(([acc, bbox], fn) => {
    const [instruction = [], box] = fn(bbox)
    return [acc.concat(instruction), BBox.merge(bbox, box)]
  }, [[], BBox.NULL])
}
