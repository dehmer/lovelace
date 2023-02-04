/* eslint-disable jsx-a11y/alt-text */
import ms from 'milsymbol'
import { Symbol } from './symbol'
import SIDC from './symbol/sidc'
import * as Numeric from './symbol/numeric'
import { aliases } from './symbol/labels'
import './App.css'
import * as Times from './symbol/times'

const legacy = false
const standard = 'app6:d'

const symbol = legacy
  ? options => new ms.Symbol(options.sidc, options)
  : options => Symbol.of(options)

const assign = xs => xs.reduce((a, b) => Object.assign(a, b), {})
const xprod = (...xss) =>
  xss.reduce((acc, xs) => acc.flatMap(a => xs.map(x => [...a, x])), [[]])

const CONTEXT = [{}, { exercise: true }, { simulation: true }]
const ECHELON = Object.keys(Numeric.ECHELON).map(echelon => ({ echelon }))
const IDENTITY = Object.keys(Numeric.IDENTITY).map(identity => ({ identity }))
const MOBILITY = Object.keys(Numeric.MOBILITY).map(mobility => ({ mobility }))
const HEADQUARTERS = [{ headquarters: true }]
const MODIFIERS = xprod(
  [{ headquarters: false }, { headquarters: true }],
  [{ taskForce: false }, { taskForce: true }],
  [{ feint: false }, { feint: true }]
).map(assign)

const STANDARD_IDENTITY = {
  'app6:d': [
    { identity: 'PENDING' },
    { identity: 'UNKNOWN' },
    { identity: 'FRIEND' },
    { identity: 'NEUTRAL' },
    { identity: 'HOSTILE' },
    { identity: 'ASSUMED_FRIEND' },
    { identity: 'SUSPECT' },
    // { exercise: true, identity: 'PENDING' },
    // { exercise: true, identity: 'UNKNOWN' },
    // { exercise: true, identity: 'FRIEND' },
    // { exercise: true, identity: 'NEUTRAL' },
    // { exercise: true, identity: 'ASSUMED_FRIEND' },
    // { exercise: true, identity: 'SUSPECT' }, // JOKER
    // { exercise: true, identity: 'HOSTILE' }, // FAKER
  ]
}


const modifiers = legacy
  ? Object.entries(aliases).reduce((acc, [key, value]) => { acc[key] = value; return acc }, {})
  : Object.entries(aliases).reduce((acc, [key, value]) => { acc[value] = value; return acc }, {})

if (legacy) {
  modifiers.engagementBar = 'A:BBB-CC'
  modifiers.engagementType = 'TARGET'
}
else {
  modifiers['AO'] = 'A:BBB-CC'
  modifiers['AT'] = 'TARGET'
}

const assorted = [
  '10000100000000000000', // AIR, SPACE
  '10000100001100000000', // AIR, SPACE
  '10001000000000000000', // UNIT (LAND), INSTALLATION (LAND), ACTIVITY/EVENT
  '10001000171211020000', // MECHANIZED INFANTRY (WITH ECHELON)
  '10001010001211020000', // MECHANIZED INFANTRY (PLANNED)
  '10001000001613000000',
  '10001500000000000000', // EQUIPMENT (LAND), SEA SURFACE, UNKNOWN
  '10001500001110000000',
  '10001500341113000000', // WITH MOBILITY
  '10003500000000000000', // SEA SUBSURFACE
  '10002700001100000000', // DISMOUNTED (LAND)
  '10000100001200000000', // CIVILIAN
  '10032000000000000000', // INSTALLATION
  'SUAP------*****',      // AIR/SPACE
  'S-APM-----*****',      // AIR/SPACE
  'S-GP------*****',      // UNIT (LAND), INSTALLATION (LAND), ACTIVITY/EVENT
  'SFGPUCIZ--*****',
  'SFGPUSM---*****',
  'S-FPA------D***',
  'S-GPEWMS--*****',
  'S-GPE-----*****',      // EQUIPMENT (LAND), SEA SURFACE, UNKNOWN
  'I-UP------*****',      // SEA SUBSURFACE
  'S-APC-----*****',      // CIVILIAN
  'SFGP------H****',      // INSTALLATION
]

// const dimensions = [
//   '10000100000000000000', // AIR, SPACE
//   // '10001000000000000000', // UNIT (LAND), INSTALLATION (LAND), ACTIVITY/EVENT
//   // '10001500000000000000', // EQUIPMENT (LAND), SEA SURFACE, UNKNOWN
//   // '10003500000000000000', // SEA SUBSURFACE
//   // '10002700001100000000', // DISMOUNTED (LAND)
//   // '10000100001200000000', // CIVILIAN
//   'SUAP------*****',      // AIR
//   'SUPP------*****',      // SPACE
//   'OUVP------*****',      // ACTIVITY/EVENT
// ]


const dimensions = {
  'app6:d': [
    '10000100000000000000', // AIR
    '10000500000000000000', // SPACE
    '10001000000000000000', // UNIT (LAND)
    '10001500000000000000', // EQUIPMENT (LAND)
    '10032000000000000000', // INSTALLATION
    '10003000000000000000', // SEA SURFACE
    '10003500000000000000', // SEA SUBSURFACE
    '10004000000000000000', // ACTIVITY
    '10002700001100000000', // DISMOUNTED (LAND)
  ]
}

const installation = [
  '10032000000000000000',
  'SFGP------H****'
]

const codes = [
  // ...xprod(['SFGPUCIZ-------'], ECHELON).map(([code, options]) => SIDC.format(options, code)),
  // ...xprod(dimensions, xprod(IDENTITY, CONTEXT).map(assign)).map(([code, options]) => SIDC.format(options, code)),
  ...xprod(xprod(CONTEXT, STANDARD_IDENTITY[standard]).map(assign), dimensions[standard]).map(([options, code]) => SIDC.format(options, code)),
  // ...xprod(installation, IDENTITY).map(([code, options]) => SIDC.format(options, code)),
  // ...xprod(['S-GPEWMS--*****'], xprod(MOBILITY, IDENTITY).map(assign)).map(([code, options]) => SIDC.format(options, code)),
  // ...xprod(['SFGPUCIZ--*****'], MODIFIERS).map(([code, options]) => SIDC.format(options, code)),
  // // ...assorted.map(code => SIDC.format({ identity: 'FRIEND' }, code)),
  // ...xprod(dimensions, xprod(IDENTITY, HEADQUARTERS).map(assign)).map(([code, options]) => SIDC.format(options, code)),
]

Times.reset()
console.time('symbols')
const symbols = codes.map(sidc => symbol({
  sidc,
  frame: true,
  outline: true,
  outlineColor: 'rgb(200, 200, 200)',
  outlineWidth: 2, /* default 0 */
  strokeWidth: 4, /* default 4 */
  strokeColor: 'black',
  // info: true,
  // ...modifiers,
  fill: true,
  // standard: 'APP6',
})).map(symbol => ({ ...symbol.getSize(), src: 'data:image/svg+xml;utf8,' + symbol.asSVG() }))
console.timeEnd('symbols')
Times.log()




// console.log(symbols)

const SymbolArray = () => symbols.map(({ width, height, src }, index) =>
  <img width={120} key={index} src={src} className="symbol"/>
)

function App() {
  return (
    <div className="App">
      <SymbolArray/>
    </div>
  )
}

export default App
