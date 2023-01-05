import * as R from 'ramda'

const icn = {}
icn['GR.IC.FF.INFANTRY+UNKNOWN'] = { type: 'path', d: 'M50,65 L150,135 M50,135 L150,65' }
icn['GR.IC.FF.INFANTRY+FRIEND'] =  { type: 'path', d: 'M25,50 L175,150 M25,150 L175,50' }
icn['GR.IC.FF.INFANTRY+NEUTRAL'] = { type: 'path', d: 'M45,45 L155,155 M45,155 L155,45' }
icn['GR.IC.FF.INFANTRY+HOSTILE'] = { type: 'path', d: 'M60,70 L140,130 M60,130 L140,70' }
icn['GR.IC.ARMOUR'] = { type: 'path', d: 'M125,80 C150,80 150,120 125,120 L75,120 C50,120 50,80 75,80 Z', fill: false }
icn['GR.IC.FF.MEDICAL+UNKNOWN'] = { type: 'path', d: 'M100,30.75 L100,169.25 M30.75,100 L169.25,100' }
icn['GR.IC.FF.MEDICAL+FRIEND'] = { type: 'path', d: 'M100,50 L100,150 M25,100 L175,100' }
icn['GR.IC.FF.MEDICAL+NEUTRAL'] = { type: 'path', d: 'M100,45 L100,155 M45,100 L155,100' }
icn['GR.IC.FF.MEDICAL+HOSTILE'] = { type: 'path', d: 'M100,28 L100,172 28,100 L172,100' }

const sId = {}
sId['S-G-UCIZ--+UNKNOWN'] = [icn['GR.IC.FF.INFANTRY+UNKNOWN'], icn['GR.IC.ARMOUR']]
sId['S-G-UCIZ--+FRIEND'] = [icn['GR.IC.FF.INFANTRY+FRIEND'], icn['GR.IC.ARMOUR']]
sId['S-G-UCIZ--+NEUTRAL'] = [icn['GR.IC.FF.INFANTRY+NEUTRAL'], icn['GR.IC.ARMOUR']]
sId['S-G-UCIZ--+HOSTILE'] = [icn['GR.IC.FF.INFANTRY+HOSTILE'], icn['GR.IC.ARMOUR']]
sId['S-G-USM---+UNKNOWN'] = [icn['GR.IC.FF.MEDICAL+UNKNOWN']];
sId['S-G-USM---+FRIEND'] = [icn['GR.IC.FF.MEDICAL+FRIEND']];
sId['S-G-USM---+NEUTRAL'] = [icn['GR.IC.FF.MEDICAL+NEUTRAL']];
sId['S-G-USM---+HOSTILE'] = [icn['GR.IC.FF.MEDICAL+HOSTILE']];

export const icon = options => {
  const genericSIDC =
    options.sidc[0] +
    '-' +
    options.sidc[2] +
    '-' +
    (options.sidc.substring(4, 10) || '------')

  const includes = xs => x => xs.includes(x)
  const affiliation = R.cond([
    [includes('HSJK'), R.always('HOSTILE')],
    [includes('FADM'), R.always('FRIEND')],
    [includes('NL'), R.always('NEUTRAL')],
    [includes('PUGWO'), R.always('UNKNOWN')],
  ])(options.sidc[1])

  const icon = [genericSIDC, `${genericSIDC}+${affiliation}`].reduce((acc, key) => {
    return acc || sId[key]
  }, null)

  return icon || []
}
