import icn from './parts'
import airAlpha from './icons-air-alpha'
import airNumeric from './icons-air-numeric'
import equipment from './icons-equipment'
import ground from './icons-ground'
import landunit from './icons-landunit'
import landequipment from './icons-landequipment'

const sId = {
  ...airAlpha,
  ...airNumeric,
  ...equipment,
  ...ground,
  ...landunit,
  ...landequipment
}

export const icon = ({ sidc }) => {
  return bbox => {
    const { generic, affiliation } = sidc
    const fn = (acc, key) => acc || sId[key]
    const keys = [generic, `${affiliation}:${generic}`]
    const parts = keys.reduce(fn, null)
    const icon = (parts || []).flatMap(key => icn[key])
    return [icon, bbox]
  }
}
