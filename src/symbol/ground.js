const icn = {}
icn['UNKNOWN:GR.IC.FF.INFANTRY'] = { type: 'path', d: 'M50,65 L150,135 M50,135 L150,65' }
icn['FRIEND:GR.IC.FF.INFANTRY'] =  { type: 'path', d: 'M25,50 L175,150 M25,150 L175,50' }
icn['NEUTRAL:GR.IC.FF.INFANTRY'] = { type: 'path', d: 'M45,45 L155,155 M45,155 L155,45' }
icn['HOSTILE:GR.IC.FF.INFANTRY'] = { type: 'path', d: 'M60,70 L140,130 M60,130 L140,70' }
icn['GR.IC.ARMOUR'] = { type: 'path', d: 'M125,80 C150,80 150,120 125,120 L75,120 C50,120 50,80 75,80 Z', fill: false }
icn['UNKNOWN:GR.IC.FF.MEDICAL'] = { type: 'path', d: 'M100,30.75 L100,169.25 M30.75,100 L169.25,100' }
icn['FRIEND:GR.IC.FF.MEDICAL'] = { type: 'path', d: 'M100,50 L100,150 M25,100 L175,100' }
icn['NEUTRAL:GR.IC.FF.MEDICAL'] = { type: 'path', d: 'M100,45 L100,155 M45,100 L155,100' }
icn['HOSTILE:GR.IC.FF.MEDICAL'] = { type: 'path', d: 'M100,28 L100,172 28,100 L172,100' }

const sId = {}
sId['UNKNOWN:S-G-UCIZ--'] = ['UNKNOWN:GR.IC.FF.INFANTRY', 'GR.IC.ARMOUR']
sId['FRIEND:S-G-UCIZ--'] = ['FRIEND:GR.IC.FF.INFANTRY', 'GR.IC.ARMOUR']
sId['NEUTRAL:S-G-UCIZ--'] = ['NEUTRAL:GR.IC.FF.INFANTRY', 'GR.IC.ARMOUR']
sId['HOSTILE:S-G-UCIZ--'] = ['HOSTILE:GR.IC.FF.INFANTRY', 'GR.IC.ARMOUR']
sId['UNKNOWN:S-G-USM---'] = ['UNKNOWN:GR.IC.FF.MEDICAL']
sId['FRIEND:S-G-USM---'] = ['FRIEND:GR.IC.FF.MEDICAL']
sId['NEUTRAL:S-G-USM---'] = ['NEUTRAL:GR.IC.FF.MEDICAL']
sId['HOSTILE:S-G-USM---'] = ['HOSTILE:GR.IC.FF.MEDICAL']

export const icon = sidc => {
  const { generic, affiliation } = sidc
  const fn = (acc, key) => acc || sId[key]
  const parts = [generic, `${affiliation}:${generic}`].reduce(fn, null)
  const icon = (parts || []).map(key => icn[key])
  return icon
}
