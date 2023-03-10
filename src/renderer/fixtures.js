import * as R from 'ramda'
import ms from 'milsymbol'
import * as Symbol from '@syncpoint/signs/src'
import { format } from './format'
import sidc2525c from './sidc-2525c.json'
import sidcControl from './sidc-control.json'
import sidcSpecial from './sidc-special.json'
import sidcSKKM from './sidc-skkm.json'
import { aliases } from './aliases'

const engagement = false

const common = {
  frame: true,
  outline: true,
  // outlineColor: 'rgb(200, 200, 200)',
  outlineColor: 'red',
  outlineWidth: 0, /* default 0 */
  strokeWidth: 4, /* default 4 */
  strokeColor: 'black',
  fill: true,
  infoFields: true
}

const direction = 220

export const modern = options => {
  const fn = (acc, [key, value]) => { acc[value] = value; return acc }
  const initial = engagement ? { AO: 'A:BBB-CC', AT: 'TARGET' } : {}
  // const modifiers = Object.entries(aliases).reduce(fn, initial)
  const modifiers = {}

  return Symbol.of({
    ...common,
    ...options,
    strokeWidth: 4,
    modifiers
  })
}

export const legacy = options => {
  const initial = engagement ? { engagementBar: 'A:BBB-CC', engagementType: 'TARGET' } : {}
  const fn = (acc, [key, value]) => { acc[key] = value; return acc }
  // const modifiers = Object.entries(aliases).reduce(fn, initial)
  const modifiers = {}
  modifiers.direction = direction
  const { sidc: code, ...rest } = options
  const [sidc, standard] = code.split('+')
  return new ms.Symbol(sidc, {
    ...common,
    ...rest,
    ...modifiers,
    standard
  })
}

const assign = xs => xs.reduce((a, b) => Object.assign(a, b), {})
const xprod = (...xss) =>
  xss.reduce((acc, xs) => acc.flatMap(a => xs.map(x => [...a, x])), [[]])

const CONTEXT = [{}, { exercise: true }, { simulation: true }]
const ECHELON = [
  'TEAM', 'SQUAD', 'SECTION', 'PLATOON', 'COMPANY',
  'BATTALION', 'REGIMENT', 'BRIGADE', 'DIVISION',
  'CORPS', 'ARMY', 'ARMY_GROUP', 'REGION', 'COMMAND'
].map(echelon => ({ echelon }))

const IDENTITY = [
  { identity: 'UNKNOWN' },
  { identity: 'FRIEND' },
  { identity: 'NEUTRAL' },
  { identity: 'HOSTILE' },
  // { identity: 'PENDING' },
  // { identity: 'ASSUMED_FRIEND' },
  // { identity: 'SUSPECT' },
  // { identity: 'JOKER' },
  // { identity: 'FAKER' }
]

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

const STATUS = [
  'PLANNED',
  'PRESENT',
  'FULLY_CAPABLE',
  'DAMAGED',
  'DESTROYED',
  'FULL_TO_CAPACITY'
].map(status => ({ status }))

const dimensions = [
  // APP6-D
  // '10000100000000000000+APP6', // AIR
  // '10000500000000000000+2525', // SPACE
  // '10001000000000000000', // UNIT (LAND)
  // '10001500000000000000', // EQUIPMENT (LAND)
  // '10032000000000000000', // INSTALLATION
  // '10003000000000000000', // SEA SURFACE
  // '10003500000000000000', // SEA SUBSURFACE
  // '10004000000000000000', // ACTIVITY
  // '10002700001100000000', // DISMOUNTED (LAND)

  // 2525-C
  'SUAP------*****+APP6', // AIR
  'SUPP------*****+2525', // SPACE
  'SUGP------*****',      // UNIT (LAND)
  'SUGPE-----*****',      // EQUIPMENT (LAND)
  'SUGP------H****',      // INSTALLATION
  'SUSP------*****',      // SEA SURFACE
  'IUUP------*****',      // SEA SUBSURFACE
  'OUVP------*****',      // ACTIVITY/EVENT
]


export const codes = [
  // ...xprod(['SFGPUCIZ-------'], ECHELON).map(([code, options]) => format(options, code)),
  // ...xprod(sidc2525c, IDENTITY).map(([code, options]) => format(options, code)),
  ...xprod(dimensions, xprod(IDENTITY, HEADQUARTERS, STATUS).map(assign)).map(([code, options]) => format(options, code)),
  // ...xprod(dimensions, xprod(IDENTITY, CONTEXT).map(assign)).map(([code, options]) => format(options, code)),
  // ...xprod(dimensions, xprod(IDENTITY, STATUS).map(assign)).map(([code, options]) => format(options, code)),
  // ...xprod(xprod(CONTEXT, IDENTITY).map(assign), dimensions).map(([options, code]) => format(options, code)),
  // ...xprod(['S-GPEWMS--*****'], xprod(MOBILITY, IDENTITY).map(assign)).map(([code, options]) => format(options, code)),
  // ...xprod(['SFGPUCIZ--*****'], MODIFIERS).map(([code, options]) => format(options, code)),
  // ...xprod(dimensions, xprod(IDENTITY, HEADQUARTERS).map(assign)).map(([code, options]) => format(options, code)),
  // ...xprod(sidcControl, xprod(IDENTITY, [{ status: 'PRESENT' }]).map(assign)).map(([code, options]) => format(options, code)),
  // ...xprod(sidcSKKM, xprod(IDENTITY, [{ status: 'PRESENT' }]).map(assign)).map(([code, options]) => format(options, code)),
  // ...xprod(sidcSpecial, xprod(IDENTITY, [{ status: 'PRESENT' }]).map(assign)).map(([code, options]) => format(options, code)),
]
