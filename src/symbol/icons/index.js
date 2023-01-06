import icn from './parts'
import equipment from './icons-equipment'
import ground from './icons-ground'
import landunit from './icons-landunit'
import landequipment from './icons-landequipment'

const sId = {
  ...equipment,
  ...ground,
  ...landunit,
  ...landequipment
}

export const icon = sidc => {
  const { generic, affiliation } = sidc
  const fn = (acc, key) => acc || sId[key]
  const parts = [generic, `${affiliation}:${generic}`].reduce(fn, null)
  const icon = (parts || []).flatMap(key => icn[key])
  return icon
}
