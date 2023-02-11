#!/usr/bin/env node
require('@babel/register')
const R = require('ramda')
const isEqual = require("react-fast-compare")
const { diff } = require('json-diff')
const ms = require('milsymbol/dist/milsymbol.development')

const frameBoxes = {
  'Unknown': { x1: 30.75, y1: 30.75, x2: 169.25, y2: 169.25 },
  'Friend': { x1: 25, y1: 50, x2: 175, y2: 150 },
  'Neutral': { x1: 45, y1: 45, x2: 155, y2: 155 },
  'Hostile': { x1: 28, y1: 28, x2: 172, y2: 172 }
}

const iconFns = ms._iconSIDC.letter

const assign = xs => xs.reduce((a, b) => Object.assign(a, b), {})
const xprod = (...xss) =>
  xss.reduce((acc, xs) => acc.flatMap(a => xs.map(x => [...a, x])), [[]])

// const STANDARD = [{ standard: 'APP6' }, { standard: '2525' }]
// const TYPE = [{ type: 'LEGACY' }, { type: 'MODERN' }]
const STANDARD = [{ standard: '2525' }]
const TYPE = [{ type: 'LEGACY' }]
const AFFILIATON = [{ affiliation: 'Unknown' }, { affiliation: 'Friend' }, { affiliation: 'Neutral' }, { affiliation: 'Hostile' }]

const colors = {
  none: {
    Unknown: 'none',
    Friend: 'none',
    Neutral: 'none',
    Hostile: 'none'
  },
  black: {
    Unknown: 'black',
    Friend: 'black',
    Neutral: 'black',
    Hostile: 'black'
  },
  white: {
    Unknown: 'rgb(239, 239, 239)',
    Friend: 'rgb(239, 239, 239)',
    Neutral: 'rgb(239, 239, 239)',
    Hostile: 'rgb(239, 239, 239)'
  },
  iconColor: {
    Unknown: 'black',
    Friend: 'black',
    Neutral: 'black',
    Hostile: 'black',
  },
  iconFillColor: {
    Unknown: 'rgb(239, 239, 239)',
    Friend: 'rgb(239, 239, 239)',
    Neutral: 'rgb(239, 239, 239)',
    Hostile: 'rgb(239, 239, 239)'
  },
  fillColor: {
    Unknown: 'rgb(255,255,0)'
  }
}

const keys = xprod(STANDARD, TYPE, AFFILIATON).map(assign)
const options = keys.reduce((acc, { standard, type, affiliation }) => {
  acc[`${standard}+${type}+${affiliation}`] = {
    colors,
    STD2525: standard === '2525',
    numberSIDC: type === 'MODERN',
    metadata: {
      frame: true,
      affiliation,
      baseGeometry: {
        bbox: frameBoxes[affiliation]
      }
    }
  }
  return acc
}, {})

const SPACE = 0
const AIR = 1
const GROUND = 2
const SEA = 3
const SUBSURFACE = 4
const TACTICAL_POINT = 5
const SIGINT = 6
const _2525B = 7

const replaceKey = (instruction, from, to) => {
  if (!instruction[from]) return instruction
  instruction[to] = instruction[from]
  delete instruction[from]
}

const replaceValue = (instruction, key, from, to) => {
  if (instruction[key] === undefined) return instruction
  if (instruction[key] !== from) return instruction
  instruction[key] = to
}

const removeValue = (instruction, key, value) => {
  if (!instruction[key]) return instruction
  if (instruction[key] !== value) return instruction
  delete instruction[key]
}

const removeKey = (instruction, key) => {
  delete instruction[key]
}

const sanitize = (instructions) => {
  if (Array.isArray(instructions)) {
    return instructions.map(sanitize)
  }
  else {
    replaceKey(instructions, 'strokewidth', 'stroke-width')
    replaceKey(instructions, 'textanchor', 'text-anchor')
    replaceKey(instructions, 'fontfamily', 'font-family')
    replaceKey(instructions, 'fontweight', 'font-weight')
    replaceKey(instructions, 'fontsize', 'font-size')
    replaceValue(instructions, 'stroke', false, 'none')
    removeValue(instructions, 'font-family', 'Arial')
    removeKey(instructions, 'icon')
    return instructions
  }
}

// const parts = Object.values(options).reduce((acc, options) => {
//   const { metadata, colors, STD2525 } = options
//   const iconParts = []
//   R.range(0, 8).forEach(i => ms._iconParts[i](iconParts, metadata, colors, STD2525))
//   return Object.entries(iconParts).reduce((acc, [key, instructions]) => {
//     const affiliation = metadata.affiliation.toUpperCase()
//     acc[`${key}+${affiliation}`] = sanitize(instructions)
//     return acc
//   }, acc)
// }, {})

// const icons = iconFns.reduce((acc, fn) => {
//   const bbox = {}
//   fn(acc, bbox, parts, true)
//   return acc
// }, {})

// console.log(JSON.stringify(icons, null, 2))


const icons = Object.values(options).reduce((acc, options) => {
  const { metadata, colors, STD2525 } = options
  const affiliation = metadata.affiliation.toUpperCase()
  const iconParts = {}
  R.range(0, 8).forEach(i => ms._iconParts[i](iconParts, metadata, colors, STD2525))
  const sanitized = Object.entries(iconParts).reduce((acc, [key, instructions]) => {
    acc[key] = sanitize(instructions)
    return acc
  }, {})

  const icons = iconFns.reduce((acc, fn) => {
    const bbox = {}
    fn(acc, bbox, sanitized, true)
    return acc
  }, {})

  Object.entries(icons).forEach(([sidc, instructions]) => {
    acc[`${sidc}+${affiliation}`] = instructions
  })

  return acc
}, {})


console.log(JSON.stringify(icons, null, 2))
