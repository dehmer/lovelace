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

const modifierAliases = {
  quantity: 'D',
  reinforcedReduced: 'F',
  staffComments: 'G',
  additionalInformation: 'H',
  evaluationRating: 'J',
  combatEffectiveness: 'K',
  signatureEquipment: 'L',
  higherFormation: 'M',
  hostile: 'N',
  iffSif: 'P',
  // direction: 'Q',
  sigint: 'R2',
  uniqueDesignation: 'T',
  type: 'V',
  dtg: 'W',
  altitudeDepth: 'X',
  location: 'Y',
  speed: 'Z',
  // specialHeadquarters: 'AA',
  country: 'AC',
  platformType: 'AD',
  equipmentTeardownTime: 'AE',
  commonIdentifier: 'AF',
  auxiliaryEquipmentIndicator: 'AG',
  // headquartersElement: 'AH',
  installationComposition: 'AI'
}


const codes = [
  // '10000100000000000000', // AIR, SPACE
  // '10000100001100000000', // AIR, SPACE
  // '10001000000000000000', // UNIT (LAND), INSTALLATION (LAND), ACTIVITY/EVENT
  // '10001000141211020000', // MECHANIZED INFANTRY (WITH ECHELON)
  '10001000001211020000', // MECHANIZED INFANTRY
  // '10001000001613000000',
  // '10001500000000000000', // EQUIPMENT (LAND), SEA SURFACE, UNKNOWN
  // '10001500001110000000',
  // '10001500341113000000',
  // '10003500000000000000', // SEA SUBSURFACE
  // '10002700001100000000', // DISMOUNTED (LAND)
  // '10000100001200000000'  // CIVILIAN
]

// const codes = [
//   'SUAP------*****', // AIR/SPACE
//   // 'S-APM-----*****', // AIR/SPACE
//   // 'S-GP------*****', // UNIT (LAND), INSTALLATION (LAND), ACTIVITY/EVENT
//   // 'S-GPUCIZ---E---',
//   // 'SFGPUSM---*****',
//   // 'S-FPA------D***',
//   // 'S-GPEWMS--MR***',
//   // 'S-GPE-----*****', // EQUIPMENT (LAND), SEA SURFACE, UNKNOWN
//   // 'I-UP------*****', // SEA SUBSURFACE
//   // 'S-APC-----*****', // CIVILIAN
// ]

const formats = identities
  .map(identity => SIDC.format({ identity }))

// const textAmplifiers = {}
const textAmplifiers = legacy
  ? Object.entries(modifierAliases).reduce((acc, [key, value]) => { acc[key] = value; return acc })
  : Object.entries(modifierAliases).reduce((acc, [key, value]) => { acc[value] = value; return acc })

console.time('symbols')
const symbols = R
  .xprod(formats, codes)
  .map(([format, code]) => format(code))
  .map(code => symbol({ sidc: code, frame: true, ...textAmplifiers }))
  .map(symbol => ({ ...symbol.getSize(), src: 'data:image/svg+xml;utf8,' + symbol.asSVG() }))
console.timeEnd('symbols')

// console.log(symbols)

const SymbolArray = () => symbols.map(({ height, src }, index) =>
  <img width='220' key={index} src={src} className="symbol"/>
)

function App() {
  return (
    <div className="App">
      <SymbolArray/>
    </div>
  )
}

export default App;
