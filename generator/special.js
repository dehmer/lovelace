#!/usr/bin/env node
const special = require('./special.json')

const replaceKey = (value, from, to) => {
  if (!value[from]) return value
  value[to] = value[from]
  delete value[from]
}

const replaceValue = (value, key, from, to) => {
  if (value[key] === undefined) return value
  if (value[key] !== from) return value
  value[key] = to
}

const sanitize = value => {
  if (Array.isArray(value)) {
    return value.map(sanitize).filter(Boolean)
  }

  // replaceKey(value, 'strokewidth', 'stroke-width')
  // replaceKey(value, 'textanchor', 'text-anchor')
  // replaceKey(value, 'fontfamily', 'font-family')
  // replaceKey(value, 'fontweight', 'font-weight')
  // replaceKey(value, 'fontsize', 'font-size')
  // replaceValue(value, 'stroke', false, 'none')
  // replaceValue(value, 'stroke', '#000', 'black')
  // replaceValue(value, 'fill', '#123', 'rgb(17, 34, 51)')

  return value
}

const path = instruction => {
  console.log('path', JSON.stringify(instruction, null, 2))
  return sanitize({ type: 'path', ...instruction })
}

const circle = instruction => {
  return sanitize({ type: 'circle', ...instruction })
}

const text = instruction => {
  return sanitize({
    type: 'text',
    ...instruction,
    x: instruction.x || 100,
    y: instruction.y || 100,
    'text-anchor': instruction.textanchor || 'middle',
    'font-size': instruction.fontsize || 38,
    fill: instruction.fill || 'black',
    stroke: instruction.stroke || 'black',
    'stroke-width': instruction.strokewidth || 1
  })
}

;(() => {
  const icons = Object.entries(special.lettersidc).map(([sidc, parts]) => {
    const instructions = parts.flatMap(part => {
      const { paths = [], circles = [], texts = [] } = special.iconParts[part]
      return [
        ...paths.flat().map(path),
        ...circles.flat().map(circle),
        ...texts.flat(2).map(text)
      ]
    })

    return [sidc, instructions]
  })

  // console.log(JSON.stringify(Object.fromEntries(icons)))
})()
