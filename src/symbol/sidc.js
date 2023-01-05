import * as R from 'ramda'

export const kind = code => code.length === 20 ? 'NUMERIC' : 'ALPHA'
const overlay = (x, offset) => xs => xs.substring(0, offset[0]) + x + xs.substring(offset[1])

export const format = R.curry((options, code) => {
  const overlays = OVERLAY[kind(code)].map(R.applyTo(options)).filter(Boolean)
  return overlays.length ? R.compose(...overlays)(code) : code
})

export const split = code => ({
  kind: kind(code),
  ...SPLIT[kind(code)](code)
})

const ALPHA_OVERLAY = [
  options => options.identity && overlay(
    ALPHA_IDENTITY
      [options.identity]
      [options.exercise ? 1 : 0],
    [1, 2]
  ),
  options => options.status && overlay(ALPHA_STATUS[options.status], [3, 4]),
  options => options.mobility && overlay(ALPHA_MOBILITY[options.mobility], [10, 12]),
  options => options.echelon && overlay(ALPHA_ECHELON[options.echelon], [11, 12]),
  options => {
    const indicator =
      (options.headquarters ? 0x01 : 0) |
      (options.taskForce ? 0x02 : 0) |
      (options.feint ? 0x04 : 0) |
      (options.dummy ? 0x04 : 0)
    return indicator && overlay(ALPHA_INDICATOR[indicator], [10, 11])
  }
]

const alphaSplit = code => ({
  scheme: code.charAt(0),
  identity: code.charAt(1),
  dimension: code.charAt(2),
  status: code.charAt(3),
  function: code.substring(4, 10),
  modifiers: code.substring(10, 12)
})

const ALPHA_IDENTITY = {
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

const ALPHA_STATUS = {
  ANTICIPATED: 'A',
  PLANNED: 'A',
  PRESENT: 'P',
  FULLY_CAPABLE: 'C',
  DAMAGED: 'D',
  DESTROYED: 'X',
  FULL_TO_CAPACITY: 'F'
}

const ALPHA_MOBILITY = {
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

const ALPHA_ECHELON = {
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
const ALPHA_INDICATOR = {
  1: 'A',
  3: 'B',
  5: 'C',
  7: 'D',
  2: 'E',
  4: 'F',
  6: 'G'
}

const numericSplit = code => ({
})

const NUMERIC_OVERLAY = [
  // mutually exclusive: reality, exercise and simulation
  options => options.reality && overlay('0', [2, 3]),
  options => options.exercise && overlay('1', [2, 3]),
  options => options.simulation && overlay('2', [2, 3]),
  options => options.identity && overlay(NUMERIC_IDENTITY[options.identity], [3, 4]),
  options => options.status && overlay(NUMERIC_STATUS[options.status], [6, 7]),
  // mutually exclusive: mobility and echelon
  options => options.mobility && overlay(NUMERIC_MOBILITY[options.mobility], [8, 10]),
  options => options.echelon && overlay(NUMERIC_ECHELON[options.echelon], [8, 10]),
  options => {
    const indicator =
      (options.headquarters ? 0x01 : 0) |
      (options.taskForce ? 0x02 : 0) |
      (options.feint ? 0x04 : 0) |
      (options.dummy ? 0x04 : 0)
    return indicator && overlay(NUMERIC_INDICATOR[indicator], [7, 8])
  }
]

const NUMERIC_IDENTITY = {
  PENDING: '0',
  UNKNOWN: '1',
  ASSUMED_FRIEND: '2',
  FRIEND: '3',
  NEUTRAL: '4',
  SUSPECT: '5', JOKER: '5',
  HOSTILE: '6', FAKER: '6'
}

const NUMERIC_STATUS = {
  PRESENT: '0',
  ANTICIPATED: '1', PLANNED: '1',
  FULLY_CAPABLE: '2',
  DAMAGED: '3',
  DESTROYED: '4',
  FULL_TO_CAPACITY: '5'
}

const NUMERIC_ECHELON = {
  TEAM: '11', CREW: '11',
  SQUAD: '12',
  SECTION: '13',
  PLATOON: '14', DETACHMENT: '14',
  COMPANY: '15', BATTERY: '15', TROOP: '15',
  BATTALION: '16', SQUADRON: '16',
  REGIMENT: '17', GROUP: '17',
  BRIGADE: '18',
  DIVISION: '21',
  CORPS: '22', MEF: '22',
  ARMY: '23',
  ARMY_GROUP: '24', FRONT: '24',
  REGION: '25', THEATER: '25',
  COMMAND: '26'
}

const NUMERIC_MOBILITY = {
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
const NUMERIC_INDICATOR = {
  4: '1',
  1: '2',
  5: '3',
  2: '4',
  6: '5',
  3: '6',
  7: '7'
}

const OVERLAY = {
  ALPHA: ALPHA_OVERLAY,
  NUMERIC: NUMERIC_OVERLAY
}

const SPLIT = {
  ALPHA: alphaSplit,
  NUMERIC: numericSplit
}
