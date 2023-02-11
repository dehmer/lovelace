import { text } from './text'
const icn = {}

icn['AR.I.MILITARY'] = text('MIL')
icn['AR.I.CIVILIAN'] = { ...text('CIV'), style: 'style:icon/civilian-fill'}
// icn['AR.I.CIVILIAN'].fill = 'white' // style:icon/legacy-fill
// icn['AR.I.CIVILIAN'].stroke = 'black'
// icn['AR.I.CIVILIAN']['stroke-width'] = 3

console.log(icn['AR.I.CIVILIAN'])

export default icn
