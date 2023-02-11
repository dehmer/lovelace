require('@babel/register')
const fs = require('fs')
const { convert } = require('convert-svg-to-png')
const compare = require('png-visual-compare').default
const R = require('ramda')
const ms = require('milsymbol')
const legacySIDC = require('../src/sidc-legacy.json')
const SIDC = require('../src/symbol/sidc').default
const { Symbol } = require('../src/symbol')
const { aliases } =  require('../src/symbol/fields')

const xprod = (...xss) =>
  xss.reduce((acc, xs) => acc.flatMap(a => xs.map(x => [...a, x])), [[]])

const IDENTITY = [
  { identity: 'UNKNOWN' },
  { identity: 'FRIEND' },
  { identity: 'NEUTRAL' },
  { identity: 'HOSTILE' }
]

const engagement = false

const common = {
  frame: true,
  outline: true,
  outlineColor: 'rgb(200, 200, 200)',
  outlineWidth: 0, /* default 0 */
  strokeWidth: 4, /* default 4 */
  strokeColor: 'black',
  fill: true,
  infoFields: false
}

const createModern = options => {
  const fn = (acc, [key, value]) => { acc[value] = value; return acc }
  const initial = engagement ? { AO: 'A:BBB-CC', AT: 'TARGET' } : {}
  const modifiers = Object.entries(aliases).reduce(fn, initial)

  return Symbol.of({
    ...common,
    ...options,
    ...modifiers
  })
}

const createLegacy = options => {
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
  
const codes = xprod(
  R.take(100, R.drop(0, legacySIDC)), 
  IDENTITY
)
  .map(([code, options]) => SIDC.format(options, code))
  
;(async () => {
  try {
    codes.reduce(async (acc, code) => {
      await acc
      const legacy = await convert(createLegacy({ sidc: code }).asSVG())
      const modern = await convert(createModern({ sidc: code }).asSVG())    
      const result = await compare(legacy, modern)
      if (result > 2000) console.log('FAILED', code, result)
      else console.log('PASSED', code, result)
      return acc
    }, {})
  } catch (err) {
    console.error(err)
  }
})()
