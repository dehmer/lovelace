import * as R from 'ramda'
import { overlay } from './common'

const SIDC = function (code) {
  this.code = code
  const parts = {
    scheme: code[0],
    identity: code[1],
    dimension: code[2],
    status: code[3],
    function: code.substring(4, 10),
    modifier11: code[11],
    modifiers: code.substring(10, 12)
  }

  this.generic = code[0] + '-' + code[2] + '-' + (code.substring(4, 10) || '------')
  this.affiliation = AFFILIATION[parts.identity]
  this.joker = parts.identity === 'J'
  this.faker = parts.identity === 'K'
  this.dimension = DIMENSION.find(([regex]) => code.match(regex))[1]
  this.civilian = CIVILIAN.some(regex => code.match(regex))
  this.echelon = this.dimension === 'UNIT' && (() => {
    const lookup = ([_, code]) => code === parts.modifier11
    const echelon = Object.entries(ECHELON).find(lookup)
    return echelon ? echelon[0] : false
  })()
}

SIDC.format = function (options, code) {
  const overlays = OVERLAYS.map(R.applyTo(options)).filter(Boolean)
  return overlays.length ? R.compose(...overlays)(code) : code
}

export default SIDC

const IDENTITY = {
  PENDING: ['P', 'G'],
  UNKNOWN: ['U', 'W'],
  ASSUMED_FRIEND: ['A', 'M'],
  FRIEND: ['F', 'D'],
  NEUTRAL: ['N', 'L'],

  // Joker. A friendly track acting as a suspect for exercise purposes.
  SUSPECT: ['S', 'J'],
  JOKER: ['J'],

  // Faker. A friendly track acting as a hostile for exercise purposes.
  HOSTILE: ['H', 'K'],
  FAKER: ['K']
}

const AFFILIATION = {
  H: 'HOSTILE', J: 'HOSTILE', K: 'HOSTILE', S: 'HOSTILE',
  A: 'FRIEND', F: 'FRIEND', D: 'FRIEND', M: 'FRIEND',
  L: 'NEUTRAL', N: 'NEUTRAL',
  G: 'UNKNOWN', P: 'UNKNOWN', U: 'UNKNOWN', W: 'UNKNOWN'
}

const DIMENSION = [
  [/^..[AP]/, 'AIR'],
  [/^SFG.E/, 'EQUIPMENT'],
  [/^.FS/, 'EQUIPMENT'],
  [/^I.G/, 'EQUIPMENT'], // SIGINT
  [/^E.O.(AB|AE|AF|BB|CB|CC|DB|D.B|E.)/, 'EQUIPMENT'], // EMS EQUIPMENT
  [/^..[EFGOSXZ]/, 'UNIT'], // incl. SOF, EMS
  [/^..U/, 'SUBSURFACE' ]
]

const CIVILIAN = [/^..A.C/, /^..G.EVC/, /^..S.X/]

const STATUS = {
  ANTICIPATED: 'A',
  PLANNED: 'A',
  PRESENT: 'P',
  FULLY_CAPABLE: 'C',
  DAMAGED: 'D',
  DESTROYED: 'X',
  FULL_TO_CAPACITY: 'F'
}

const MOBILITY = {
  WHEELED_LIMITED: 'MO',
  WHEELED: 'MP',
  TRACKED: 'MQ',
  HALF_TRACK: 'MR',
  TOWED: 'MS',
  RAIL: 'MT',
  PACK_ANIMALS: 'MW',
  OVER_SNOW: 'MU',
  SLED: 'MV',
  BARGE: 'MX',
  AMPHIBIOUS: 'MY',
  TOWED_ARRAY_SHORT: 'NS',
  TOWED_ARRAY_LONG: 'NL'
}

const ECHELON = {
  TEAM: 'A', CREW: 'A',
  SQUAD: 'B',
  SECTION: 'C',
  PLATOON: 'D', DETACHMENT: 'D',
  COMPANY: 'E', BATTERY: 'E', TROOP: 'E',
  BATTALION: 'F',
  SQUADRON: 'F',
  REGIMENT: 'G', GROUP: 'G',
  BRIGADE: 'H',
  DIVISION: 'I',
  CORPS: 'J', MEF: 'J',
  ARMY: 'K',
  ARMY_GROUP: 'L', FRONT: 'L',
  REGION: 'M', THEATER: 'M',
  COMMAND: 'N'
}

// HQ, TF, F/D
const INDICATOR = {
  1: 'A',
  3: 'B',
  5: 'C',
  7: 'D',
  2: 'E',
  4: 'F',
  6: 'G'
}

const OVERLAYS = [
  options => options.identity && overlay(
    IDENTITY
      [options.identity]
      [options.exercise ? 1 : 0],
    [1, 2]
  ),
  options => options.status && overlay(STATUS[options.status], [3, 4]),
  options => options.mobility && overlay(MOBILITY[options.mobility], [10, 12]),
  options => options.echelon && overlay(ECHELON[options.echelon], [11, 12]),
  options => {
    const indicator =
      (options.headquarters ? 0x01 : 0) |
      (options.taskForce ? 0x02 : 0) |
      (options.feint ? 0x04 : 0) |
      (options.dummy ? 0x04 : 0)
    return indicator && overlay(INDICATOR[indicator], [10, 11])
  }
]
