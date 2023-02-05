import * as R from 'ramda'
import Legacy from './legacy'
import Modern from './modern'

const SIDC = {}

SIDC.of = code =>
  code.length === 20
    ? new Modern(code)
    : new Legacy(code)

SIDC.format = R.curry((options, code) =>
  code.length === 20
    ? Modern.format(options, code)
    : Legacy.format(options, code)
)

export default SIDC
