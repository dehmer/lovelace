import icn from './parts'
import airAlpha from './icons-air-alpha'
import airNumeric from './icons-air-numeric'
import equipment from './icons-equipment'
import ground from './icons-ground'
import landunit from './icons-landunit'
import landequipment from './icons-landequipment'
import icons from './icons'

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

export default ({ generic, affiliation }) => {
  const key = `${generic}+${affiliation}`
  return box => [box, (icons[key] || []).flat()]
}
