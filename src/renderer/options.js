import * as R from 'ramda'
import ms from 'milsymbol'
import { Symbol } from '@syncpoint/signs/src'
import * as SIDC from './format'
import * as Modifiers from './aliases'
import sidcSpecial from './sidc-special.json'
import sidcSKKM from './sidc-skkm.json'
import mapping from './mapping.json'
import { ms2525b, ms2525c, ms2525d } from 'mil-std-2525'
import { app6b } from 'stanag-app6'


const mainIcons = R.curry((filter, arg) => arg.mainIcon
  ? filter.length 
    ? filter.includes(arg.name) ? arg.mainIcon : [] 
    : arg.mainIcon
  : Object.values(arg).reduce((acc, value) => typeof value === 'object'
    ? acc.concat(mainIcons(filter, value))
    : acc
  , [])
)

const points = icon => icon.geometry
  ? icon.geometry === 'POINT'
  : icon.geometry !== ''

const available = icon => icon.remarks !== 'N/A'
const makeSIDC = ({ codingscheme, battledimension, functionid }) =>
  `${codingscheme}*${battledimension}*${functionid}*****`

const fn = collect => R.compose(
    R.map(makeSIDC), 
    R.filter(points), 
    R.filter(available),
    collect
)

const sidcSTD2525c = fn(mainIcons([]))(ms2525c).map(s => s + '+2525')
const sidcAPP6B = fn(mainIcons([]))(app6b).map(s => s + '+APP6')
const sidcControl = fn(mainIcons(['TACTICAL GRAPHICS']))(ms2525c)

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
  { status: 'PRESENT' },
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

export const modern = options => {
  const { sidc, ...rest } = options
  return new Symbol(sidc, rest)
}

export const legacy = options => {
  const { sidc: code, ...rest } = options
  const [sidc, standard] = code.split('+')
  const reducer = (acc, [key, value]) => {
    acc[Modifiers.reverse[key]] = value
    return acc
  }

  const modifiers = Object.entries(options.modifiers || {}).reduce(reducer, {})
  const infoFields = !R.isEmpty(modifiers)

  return new ms.Symbol(sidc, {
    standard,
    infoFields,
    ...modifiers,
    ...rest
  })
}

const preset = (sidc, options = {}) => ({
  sidc: SIDC.format(options, sidc), ...options
})

export const sets = {
  'set:dimension/present': xprod(DIMENSION, IDENTITY_BASE, [{ status: 'PRESENT' }]).map(format),

  'set:icons/2525c': 
    xprod(
      sidcSTD2525c.map(sidc), 
      IDENTITY_BASE, 
      [{ status: 'PRESENT' }]
    ).map(format),

  'set:icons/app6b': 
    xprod(
      sidcAPP6B.map(sidc), 
      IDENTITY_BASE, 
      [{ status: 'PRESENT' }]
    ).map(format),

  'set:icons/skkm': 
    xprod(
      sidcSKKM.map(sidc), 
      IDENTITY_BASE, 
      [{ status: 'PRESENT' }]
    ).map(format),

  'set:icons/monochrome':
    xprod(
      xprod(
        sidcSTD2525c.map(sidc), 
        IDENTITY_BASE,
        [{ status: 'PRESENT' }]
      ).map(format),
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
    preset('SFGPUCIZ--*****', { 
      infoFields: true, 
      uniqueDesignation: '1', 
      higherFormation: '2', 
      dtg: 'O/O' 
    }),
    preset('SFUPND----*****'),
    preset('SFSPNH----*****'),
    preset('SFSPXM----*****'),
    preset('SFSPXMC---*****'),
    preset('SFPPT-----*****'),
    preset('SHAPWMS---*****'),
    preset('SFGPUCFSO-*****'),
    preset('SHUPWMGD--*****'),
    preset('SFUPWMG---*****'),
    preset('SNUPWMGX--*****'),
    preset('SFUPWMGE--*****'),
    preset('SFUPWMGC--*****'),
    preset('SHUPV-----*****'),
    preset('SHUPX-----*****'),
  ]
}

export const upgrade = Object.entries(mapping).map(([k, v]) => [
  { sidc: SIDC.format({ identity: 'FRIEND', status: 'PRESENT', installation: v.substring(4, 6) === '20' }, k) },
  { sidc: SIDC.format({ identity: 'FRIEND', status: 'PRESENT', reality: true }, v) }
])
