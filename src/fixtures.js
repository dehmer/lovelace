import ms from 'milsymbol'
import SIDC from './symbol/sidc'
import { Symbol } from './symbol'
import { aliases } from './symbol/aliases'
import * as Numeric from './symbol/modern'
import sidc2525c from './sidc-2525c.json'
import sidcControl from './sidc-control.json'

const engagement = false

const common = {
  frame: true,
  outline: true,
  outlineColor: 'rgb(200, 200, 200)',
  outlineWidth: 0, /* default 0 */
  strokeWidth: 4, /* default 4 */
  strokeColor: 'black',
  fill: true,
  infoFields: true
}

export const modern = options => {
  const fn = (acc, [key, value]) => { acc[value] = value; return acc }
  const initial = engagement ? { AO: 'A:BBB-CC', AT: 'TARGET' } : {}
  const modifiers = Object.entries(aliases).reduce(fn, initial)

  return Symbol.of({
    ...common,
    ...options,
    ...modifiers
  })
}

export const legacy = options => {
  const initial = engagement ? { engagementBar: 'A:BBB-CC', engagementType: 'TARGET' } : {}
  const fn = (acc, [key, value]) => { acc[key] = value; return acc }
  const modifiers = Object.entries(aliases).reduce(fn, initial)
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
const ECHELON = Object.keys(Numeric.ECHELON).map(echelon => ({ echelon }))

const IDENTITY = [
  // { identity: 'PENDING' },
  // { identity: 'UNKNOWN' },
  { identity: 'FRIEND' },
  // { identity: 'NEUTRAL' },
  // { identity: 'HOSTILE' },
  // { identity: 'ASSUMED_FRIEND' },
  // { identity: 'SUSPECT' },
  // { identity: 'JOKER' },
  // { identity: 'FAKER' }
]

const MOBILITY = Object.keys(Numeric.MOBILITY).map(mobility => ({ mobility }))
const HEADQUARTERS = [{ headquarters: true }]
const MODIFIERS = xprod(
  [{ headquarters: false }, { headquarters: true }],
  [{ taskForce: false }, { taskForce: true }],
  [{ feint: false }, { feint: true }]
).map(assign)


// const dimensions = [
//   APP6-D
//   '10000100000000000000+APP6', // AIR
//   '10000500000000000000+2525', // SPACE
//   '10001000000000000000', // UNIT (LAND)
//   '10001500000000000000', // EQUIPMENT (LAND)
//   '10032000000000000000', // INSTALLATION
//   '10003000000000000000', // SEA SURFACE
//   '10003500000000000000', // SEA SUBSURFACE
//   '10004000000000000000', // ACTIVITY
//   '10002700001100000000', // DISMOUNTED (LAND)

//   2525-C
//   'SUAP------*****+APP6',      // AIR
//   'SUPP------*****+2525',      // SPACE
//   'SUGP------*****',      // UNIT (LAND)
//   'SUGPE-----*****',      // EQUIPMENT (LAND)
//   'SUGP------H****',      // INSTALLATION
//   'SUSP------*****',      // SEA SURFACE
//   'IUUP------*****',      // SEA SUBSURFACE
//   'OUVP------*****',      // ACTIVITY/EVENT
// ]

export const codes = [
  // ...xprod(['SFGPUCIZ-------'], ECHELON).map(([code, options]) => SIDC.format(options, code)),
  // ...xprod(sidc2525c, IDENTITY).map(([code, options]) => SIDC.format(options, code)),
  // ...xprod(dimensions, xprod(IDENTITY, CONTEXT).map(assign)).map(([code, options]) => SIDC.format(options, code)),
  // ...xprod(xprod(CONTEXT, IDENTITY).map(assign), dimensions).map(([options, code]) => SIDC.format(options, code)),
  // ...xprod(['S-GPEWMS--*****'], xprod(MOBILITY, IDENTITY).map(assign)).map(([code, options]) => SIDC.format(options, code)),
  // ...xprod(['SFGPUCIZ--*****'], MODIFIERS).map(([code, options]) => SIDC.format(options, code)),
  // ...xprod(dimensions, xprod(IDENTITY, HEADQUARTERS).map(assign)).map(([code, options]) => SIDC.format(options, code)),
  ...xprod(sidcControl, xprod(IDENTITY, [{ status: 'PRESENT' }]).map(assign)).map(([code, options]) => SIDC.format(options, code))
]
