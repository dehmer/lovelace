/* eslint-disable jsx-a11y/alt-text */
import * as R from 'ramda'
import ms from 'milsymbol'
import { Symbol } from './symbol'
import SIDC from './symbol/sidc'
import './App.css'

const legacy = false
const symbol = legacy
  ? options => new ms.Symbol(options.sidc, options)
  : options => Symbol.of(options)

const identities = [
  'UNKNOWN',
  'FRIEND',
  'NEUTRAL',
  'HOSTILE'
]

const codes = [
  '10000100000000000000', // AIR, SPACE
  '10001000000000000000', // UNIT (LAND), INSTALLATION (LAND), ACTIVITY/EVENT
  '10001000001211020000',
  // '10001000001613000000',
  // '10001500000000000000', // EQUIPMENT (LAND), SEA SURFACE, UNKNOWN
  '10001500001110000000',
  '10001500001113000000',
  '10003500000000000000', // SEA SUBSURFACE
  '10002700001100000000', // DISMOUNTED (LAND)
  '10000100001200000000'  // CIVILIAN
]

// const codes = [
//   'SUAP------*****', // AIR/SPACE
//   'SUGP------*****', // UNIT (LAND), INSTALLATION (LAND), ACTIVITY/EVENT
//   'SFGPUCIZ--*****',
//   // 'SFGPUSM---*****',
//   'SFGPEWM---*****',
//   'SFGPEWMS--*****',
//   'SUGPE-----*****', // EQUIPMENT (LAND), SEA SURFACE, UNKNOWN
//   'IUUP------*****', // SEA SUBSURFACE
//   'SFAPC-----*****', // CIVILIAN
// ]

const formats = identities
  .map(identity => SIDC.format({ identity }))

console.time('symbols')
const symbols = R
  .xprod(formats, codes)
  .map(([format, code]) => format(code))
  .map(code => symbol({ sidc: code }))
  .map(symbol => ({ ...symbol.getSize(), src: 'data:image/svg+xml;utf8,' + symbol.asSVG() }))
console.timeEnd('symbols')

const SymbolArray = () => symbols.map(({ height, src }, index) =>
  <img width='120' height={height} key={index} src={src} className="symbol"/>
)

function App() {
  return (
    <div className="App">
      <SymbolArray/>
    </div>
  )
}

export default App;
