import icn from './parts'
import airAlpha from './icons-air-alpha'
import airNumeric from './icons-air-numeric'
import equipment from './icons-equipment'
import ground from './icons-ground'
import landunit from './icons-landunit'
import landequipment from './icons-landequipment'
import icons from './icons'
import * as BBox from '../bbox'

const boxes = Object.entries(icons).reduce((acc, [key, icon]) => {
  acc[key] = icon.length ? BBox.of(icon) : [100, 100, 100, 100]
  return acc
}, {})

const sId = {
  ...airAlpha,
  ...airNumeric,
  ...equipment,
  ...ground,
  ...landunit,
  ...landequipment
}

/* eslint-disable import/no-anonymous-default-export */
// export default ({ generic, affiliation }) => {
//   return bbox => {
//     const fn = (acc, key) => acc || sId[key]
//     const keys = [generic, `${affiliation}:${generic}`]
//     const parts = keys.reduce(fn, null)
//     const icon = (parts || []).flatMap(key => icn[key])
//     return [bbox, icon]
//   }
// }


const icon = (key, styles) => {

  const resolve = instruction => {
    const { stroke, fill, ...rest } = instruction
    return {
      stroke: styles[stroke] || stroke,
      fill: styles[fill] || fill,
      ...rest
    }
  }
  
  return (icons[key] || []).map(instruction => {
    // TODO: descent children
    const { children, ...rest } = instruction
    return children 
      ? { children: children.map(resolve), ...rest }
      : { ...resolve(rest) }
  })
}

export default ({ generic, affiliation, styles }) => {
  const key = `${generic}+${affiliation}`
  return box => {
    return [boxes[key] || box, icon(key, styles)]
  }
}
