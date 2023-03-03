import * as R from 'ramda'
import ms from 'milsymbol'
import * as Symbol from '@syncpoint/signs/src'
import * as SIDC from './format'
import { aliases } from './aliases'
import sidc2525c from './sidc-2525c.json'
import sidcControl from './sidc-control.json'
import sidcSpecial from './sidc-special.json'
import sidcSKKM from './sidc-skkm.json'

const assign = xs => xs.reduce((a, b) => Object.assign(a, b), {})
const xprod = (...xss) =>
  xss.reduce((acc, xs) => acc.flatMap(a => xs.map(x => [...a, x])), [[]])

const sidc = sidc => ({ sidc })
const format = xs => {
  const { sidc, ...options } = assign(xs)
  return { sidc: SIDC.format(options, sidc) }
}

const CONTEXT = [{}, { exercise: true }, { simulation: true }]
const ECHELON = [
  'TEAM', 'SQUAD', 'SECTION', 'PLATOON', 'COMPANY',
  'BATTALION', 'REGIMENT', 'BRIGADE', 'DIVISION',
  'CORPS', 'ARMY', 'ARMY_GROUP', 'REGION', 'COMMAND'
].map(echelon => ({ echelon }))

const IDENTITY_BASE = [
  { identity: 'UNKNOWN' },
  { identity: 'FRIEND' },
  { identity: 'NEUTRAL' },
  { identity: 'HOSTILE' }
]

const IDENTITY_EXTENTED = [
  { identity: 'PENDING' },
  { identity: 'ASSUMED_FRIEND' },
  { identity: 'SUSPECT' },
  { identity: 'JOKER' },
  { identity: 'FAKER' }
]

const IDENTITY = [...IDENTITY_BASE, ...IDENTITY_EXTENTED]

const MOBILITY = [
  'WHEELED_LIMITED', 'WHEELED', 'TRACKED', 'HALF_TRACK',
  'TOWED', 'RAIL', 'PACK_ANIMALS', 'OVER_SNOW', 'SLED',
  'BARGE', 'AMPHIBIOUS', 'TOWED_ARRAY_SHORT', 'TOWED_ARRAY_LONG'
].map(mobility => ({ mobility }))

const HEADQUARTERS = [{ headquarters: false }, { headquarters: true }]
const MODIFIERS = xprod(
  [{ headquarters: false }, { headquarters: true }],
  [{ taskForce: false }, { taskForce: true }],
  [{ feint: false }, { feint: true }]
).map(assign)

const STATUS_BASE = [
  { status: 'PLANNED'},
  { status: 'PRESENT'},
]

const STATUS_EXTENDED = [
  { status: 'FULLY_CAPABLE'},
  { status: 'DAMAGED'},
  { status: 'DESTROYED'},
  { status: 'FULL_TO_CAPACITY'}
]

const STATUS = [...STATUS_BASE, ...STATUS_EXTENDED]

const DIMENSION = [
  'S-A-------*****',  // AIR
  'S-P-------*****',  // SPACE
  'S-G-U-----*****',  // UNIT (LAND)
  'S-G-E-----*****',  // EQUIPMENT (LAND)

  // not compatible with modifiers
  // 'S-G-------H****',  // INSTALLATION

  'S-S-------*****',  // SEA SURFACE
  'I-U-------*****',  // SEA SUBSURFACE
  'O-V-------*****',  // ACTIVITY/EVENT
].map(sidc => ({ sidc }))


const ENGAGEMENT = [
  { modifiers: { AO: 'A:BBB-CC', AT: 'TARGET' } },
  { modifiers: { AO: 'A:BBB-CC', AT: 'NON-TARGET' } },
  { modifiers: { AO: 'A:BBB-CC', AT: 'EXPIRED' } }
]

const DIRECTION = R.range(0, 24).map(i => ({ modifiers: { Q: 15 * i } }))

export const modern = options => Symbol.of(options)

export const legacy = options => {
  const fn = (acc, [key, value]) => { acc[key] = value; return acc }
  const { sidc: code, ...rest } = options
  const [sidc, standard] = code.split('+')
  const modifiers = {}
  if (options?.modifiers?.AO) modifiers.engagementBar = options.modifiers.AO
  if (options?.modifiers?.AT) modifiers.engagementType = options.modifiers.AT
  if (options?.modifiers?.Q) modifiers.direction = options.modifiers.Q

  return new ms.Symbol(sidc, {
    standard,
    ...modifiers,
    ...rest
  })
}

const preset = (sidc, options = {}) => ({
  sidc: SIDC.format(options, sidc), ...options
})

export const sets = {
  'set:dimension/present': xprod(DIMENSION, IDENTITY_BASE, [{ status: 'PRESENT' }]).map(format),
  'set:icons/2525c': xprod(sidc2525c.map(sidc), IDENTITY_BASE).map(format),
  'set:icons/mono':
    xprod(
      xprod(sidc2525c.map(sidc), IDENTITY_BASE).map(format),
      [{ monoColor: 'green' }]
    ).map(assign),

  'set:echelon': xprod(DIMENSION, IDENTITY_BASE, ECHELON, [{ status: 'PRESENT' }]).map(format),
  'set:modifiers': xprod(DIMENSION, IDENTITY, MODIFIERS, [{ status: 'PRESENT' }]).map(format),
  'set:mobility': xprod(DIMENSION, IDENTITY, MOBILITY, [{ status: 'PRESENT' }]).map(format),
  'set:engagement':
    xprod(
      xprod(DIMENSION, IDENTITY, [{ status: 'PRESENT' }]).map(format),
      ENGAGEMENT
    ).map(assign),
  'set:direction':
    xprod(
      xprod(DIMENSION, IDENTITY_BASE, HEADQUARTERS, [{ status: 'PRESENT' }]).map(format),
      DIRECTION
    ).map(assign),
  'set:control': xprod(sidcControl.map(sidc), IDENTITY, [{ status: 'PRESENT' }]).map(format),
  'set:special': xprod(sidcSpecial.map(sidc), [{ identity: 'FRIEND' }], [{ status: 'PRESENT' }]).map(format),
  'set:variations': [
    preset('SHGPUCFRSS*****', { echelon: 'BRIGADE', modifiers: { Q: 45 } }),
    preset('SFAPMFB---*****', { modifiers: { Q: 315 } }),
    preset('SFGPEWHL--*****', { mobility: 'TRACKED' }),
    preset('SFGPUCII--*****', { headquarters: true, taskForce: true, dummy: true }),
    preset('SNGPIRNB--H****'),
    preset('SFGXUCVFU-*****', { modifiers: { AO: 'A:B-CCC', AT: 'EXPIRED' } }),
    preset('SFGAUCVFU-*****'),
    preset('SFGPUCIZ--*****', { infoFields: true, modifiers: { T: '1', M: '2', W: 'O/O' } })
  ]
}
