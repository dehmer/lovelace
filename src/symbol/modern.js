import * as R from 'ramda'
import { overlay } from './common'

const SIDC = function (code) {
  this.code = code
  const parts = {
    context: code[2],
    affiliation: code[3],
    symbolSet: code.substring(4, 6),
    status: code[6],
    indicator: code[7],
    amplifier: code.substring(8, 10),
    entity: code.substring(10, 12),
    type: code.substring(12, 14),
    subtype: code.substring(14, 16),
    function: code.substring(10, 16),
    modifier1: code.substring(16, 18),
    modifier2: code.substring(18, 20)
  }

  this.type = 'modern'
  this.generic = parts.symbolSet + ':' + parts.function
  this.context = CONTEXT[parts.context]
  this.affiliation =
    AFFILIATION[parts.context + parts.affiliation] ||
    AFFILIATION[parts.affiliation]

  // FIXME: wrong shape for joker
  this.joker = this.context === 'EXERCISE' && parts.affiliation === '5' // SUSPECT
  this.faker = this.context === 'EXERCISE' && parts.affiliation === '6' // HOSTILE
  this.status = Object.entries(STATUS).find(([_, code]) => code === parts.status)[0]
  this.dimension = DIMENSION.find(([regex]) => code.match(regex))[1]
  this.civilian = CIVILIAN.some(regex => code.match(regex))
  // TODO: PENDING - ETC/POSCON tracks, fused tracks
  this.pending = !this.joker && PENDING.includes(parts.affiliation)
  this.installation = this.dimension === 'UNIT' && parts.symbolSet === '20'
  this.taskForce = TASK_FORCE.includes(parts.indicator)
  this.headquarters = HEADQUARTERS.includes(parts.indicator)
  this.feintDummy = FEINT_DUMMY.includes(parts.indicator)

  this.mobility = (() => {
    const lookup = ([_, code]) => code === parts.amplifier
    const mobility = Object.entries(MOBILITY).find(lookup)
    return mobility ? mobility[0] : false
  })()

  this.echelon = !this.mobility && (() => {
    const lookup = ([_, code]) => code === parts.amplifier
    const echelon = Object.entries(ECHELON).find(lookup)
    return echelon ? echelon[0] : false
  })()
}

SIDC.format = function (options, code) {
  const overlays = OVERLAYS.map(R.applyTo(options)).filter(Boolean)
  return overlays.length ? R.compose(...overlays)(code) : code
}

export default SIDC

const CONTEXT = ['REALITY', 'EXERCISE', 'SIMULATION']

export const IDENTITY = {
  PENDING: '0',
  UNKNOWN: '1',
  ASSUMED_FRIEND: '2',
  FRIEND: '3',
  NEUTRAL: '4',
  SUSPECT: '5', JOKER: '5',
  HOSTILE: '6', FAKER: '6'
}

const PENDING = ['0', '2', '5']

const AFFILIATION = {
  '15': 'FRIEND',
  '16': 'FRIEND',
  '0': 'UNKNOWN', '1': 'UNKNOWN',
  '2': 'FRIEND', '3': 'FRIEND',
  '4': 'NEUTRAL',
  '5': 'HOSTILE', '6': 'HOSTILE'
}

const DIMENSION = [
  [/^...[23]27/, 'DISMOUNTED'], // FRIEND only
  [/^...[23](15|30)/, 'EQUIPMENT'], // FRIEND only
  [/^....(05|06|50)/, 'SPACE'],
  [/^....(01|02|51)/, 'AIR'],
  [/^....(35|36|39|45)/, 'SUBSURFACE'],
  [/^....40/, 'ACTIVITY'],
  [/^....(10|11|12|15|20|27|30|52|60)/, 'UNIT'], // incl. DISMOUNTED
]

const CIVILIAN = [
  /^....01....12/,
  /^....05....12/,
  /^....11/,
  /^....12....12/,
  /^....15....16/,
  /^....30....14/
]


const STATUS = {
  PRESENT: '0',
  PLANNED: '1', ANTICIPATED: '1',
  FULLY_CAPABLE: '2',
  DAMAGED: '3',
  DESTROYED: '4',
  FULL_TO_CAPACITY: '5'
}

export const ECHELON = {
  TEAM: '11', // CREW: '11',
  SQUAD: '12',
  SECTION: '13',
  PLATOON: '14', // DETACHMENT: '14',
  COMPANY: '15', // BATTERY: '15', TROOP: '15',
  BATTALION: '16', // SQUADRON: '16',
  REGIMENT: '17', // GROUP: '17',
  BRIGADE: '18',
  DIVISION: '21',
  CORPS: '22', // MEF: '22',
  ARMY: '23',
  ARMY_GROUP: '24', // FRONT: '24',
  REGION: '25', // THEATER: '25',
  COMMAND: '26'
}

export const MOBILITY = {
  WHEELED_LIMITED: '31',
  WHEELED: '32',
  TRACKED: '33',
  HALF_TRACK: '34',
  TOWED: '35',
  RAIL: '36',
  PACK_ANIMALS: '37',
  OVER_SNOW: '41',
  SLED: '42',
  BARGE: '51',
  AMPHIBIOUS: '52',
  TOWED_ARRAY_SHORT: '61',
  TOWED_ARRAY_LONG: '62'
}

// HQ, TF, F/D
const INDICATOR = {
  4: '1',
  1: '2',
  5: '3',
  2: '4',
  6: '5',
  3: '6',
  7: '7'
}

const FEINT_DUMMY = ['1', '3', '5', '7']
const HEADQUARTERS = ['2', '3', '6', '7']
const TASK_FORCE = ['4', '5', '6', '7']

const OVERLAYS = [
  // mutually exclusive: reality, exercise and simulation
  options => options.reality && overlay('0', [2, 3]),
  options => options.exercise && overlay('1', [2, 3]),
  options => options.simulation && overlay('2', [2, 3]),
  options => options.identity && overlay(IDENTITY[options.identity], [3, 4]),
  options => options.status && overlay(STATUS[options.status], [6, 7]),
  // mutually exclusive: mobility and echelon
  options => options.mobility && overlay(MOBILITY[options.mobility], [8, 10]),
  options => options.echelon && overlay(ECHELON[options.echelon], [8, 10]),
  options => {
    const indicator =
      (options.headquarters ? 0x01 : 0) |
      (options.taskForce ? 0x02 : 0) |
      (options.feint ? 0x04 : 0) |
      (options.dummy ? 0x04 : 0)
    return indicator && overlay(INDICATOR[indicator], [7, 8])
  }
]
