import * as R from 'ramda'
import Alpha from './alpha'
import Numeric from './numeric'

const SIDC = {}

SIDC.of = code =>
  code.length === 20
    ? new Numeric(code)
    : new Alpha(code)

SIDC.format = R.curry((options, code) =>
  code.length === 20
    ? Numeric.format(options, code)
    : Alpha.format(options, code)
)

export default SIDC
