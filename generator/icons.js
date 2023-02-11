#!/usr/bin/env node
require('@babel/register')
const R = require('ramda')
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

/*
matrix    (sx 0 0 sy tx ty) 
identity  ( 1 0 0 1  0  0 )
translate ( 1 0 0 1  tx ty)
scale     (sx 0 0 sy 0  0 )
*/ 

const translate = (v, tx, ty) => [v[0], v[1], v[2], v[3], v[4] + tx, v[5] + ty]
const scale = (v, f) => [v[0] * f, v[1], v[2], v[3] * f, v[4], v[5]]
const flat = xs => Array.isArray(xs) ? xs.flat() : xs

const transform = (instructions, v) => {
  const draw = instructions.draw
    ? Array.isArray(instructions.draw) && instructions.draw.length === 1
      ? instructions.draw[0]
      : undefined // should not happen
    : undefined

  switch (instructions.type) {
    case 'translate': return transform(draw, translate(v, instructions.x, instructions.y))
    case 'scale': return transform(draw, scale(v, instructions.factor))
    default: return {
      type: 'g',
      transform: `matrix(${v.join(' ')})`,
      children: flat(instructions) 
    }
  }
}

const sanitize = (instructions) => {
  if (Array.isArray(instructions)) {
    return instructions.map(sanitize)
  }
  else {
    if (instructions.type === 'translate') {
      return transform(instructions, [1, 0, 0, 1, 0, 0])
    }

    replaceKey(instructions, 'strokewidth', 'stroke-width')
    replaceKey(instructions, 'textanchor', 'text-anchor')
    replaceKey(instructions, 'fontfamily', 'font-family')
    replaceKey(instructions, 'fontweight', 'font-weight')
    replaceKey(instructions, 'fontsize', 'font-size')
    replaceValue(instructions, 'stroke', false, 'none')
    replaceValue(instructions, 'fill', false, 'none')
    removeValue(instructions, 'font-family', 'Arial')
    removeKey(instructions, 'icon')
    return instructions
  }
}

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
    // console.log('sidc', sidc)
    acc[`${sidc}+${affiliation}`] = flat(sanitize(instructions))
    // if (sidc === 'S-G-EWMAT-') console.log(acc[`${sidc}+${affiliation}`])
  })

  return acc
}, {})


console.log(JSON.stringify(icons, null, 2))
