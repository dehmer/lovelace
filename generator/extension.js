#!/usr/bin/env node
const ms = require('milsymbol')
const symbols = require('./extension.json')

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

  replaceKey(value, 'strokewidth', 'stroke-width')
  replaceKey(value, 'textanchor', 'text-anchor')
  replaceKey(value, 'fontfamily', 'font-family')
  replaceKey(value, 'fontweight', 'font-weight')
  replaceKey(value, 'fontsize', 'font-size')
  replaceValue(value, 'stroke', false, 'none')
  replaceValue(value, 'stroke', '#000', 'black')
  replaceValue(value, 'fill', '#123', 'rgb(17, 34, 51)')

  return value
}

const path = instruction => {
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
  const icons = Object.entries(symbols.lettersidc).map(([sidc, parts]) => {
    const instructions = parts.flatMap(part => {
      const { paths = [], circles = [], texts = [] } = symbols.iconParts[part]
      return [
        ...paths.flat().map(path),
        ...circles.flat().map(circle),
        ...texts.flat(2).map(text)
      ]
    })

    return [sidc, instructions]
  })

  console.log(JSON.stringify(Object.fromEntries(icons)))

  // ms.addIconParts((iconParts, metadata, colors, std2525, monoColor, alternateMedal) => {
  //   parts.forEach(part => {
  //     iconParts[part] = addIconParts(symbols.iconParts[part], '#333')
  //   })
  // })
  // ms.addSIDCicons((sidc, bbox, iconParts, std2525) => {
  //   const sidcs = Object.keys(symbols.lettersidc)
  //   sidcs.forEach(sidcKey => {
  //     const parts = []
  //     symbols.lettersidc[sidcKey].forEach(partKey => {
  //       parts.push(iconParts[partKey])
  //     })
  //     bbox[sidcKey] = { x1: 0, x2: 200, y1: 0, y2: 200 }
  //     sidc[sidcKey] = parts
  //   })
  // }, 'letter')
})()

const addIconParts = (parent, iconFillColor) => {
  const parts = [
    ...generatePath(parent, iconFillColor),
    ...generateCircles(parent, iconFillColor),
    ...generateTexts(parent, iconFillColor)
  ]
  return parts
}

const generatePath = (parent, iconFillColor) => {
  const parts = []
  if (parent.paths) {
    parent.paths.forEach(path => {
      try {
        const content = {
          type: 'path',
          d: path.d, // SVG path data
          fill: path.fill || false, // Fill color  or set to false if none
          fillopacity: path.fillopacity || 1.0, // Fill opacity {Optional}
          stroke: path.stroke || iconFillColor, // Stroke color  or set to false if none
          strokedasharray: path.strokedasharray, // {Optional}
          strokewidth: path.strokewidth || 3 // Width of the stroke {Optional}
        }
        if (content.fill) {
          content.fill = replaceColor(content.fill, iconFillColor)
        }
        parts.push(content)
      } catch (error) {
        console.error('error with transforming a path' + error)
      }
    })
  }
  return parts
}

const generateCircles = (parent, iconFillColor) => {
  const parts = []
  if (parent.circles) {
    parent.circles.forEach(circle => {
      try {
        const content = {
          type: 'circle',
          cx: circle.cx, // Center x
          cy: circle.cy, // Center y
          r: circle.r, // Radius
          fill: circle.fill || false, // Fill color or set to false if none
          fillopacity: circle.fillopacity || 1.0, // Fill opacity {Optional}
          stroke: circle.stroke || iconFillColor, // Stroke color  or set to false if none
          strokedasharray: circle.strokedasharray, // {Optional}
          strokewidth: circle.strokewidth || 3 // Width of the stroke {Optional}
        }
        if (content.fill) {
          content.fill = replaceColor(content.fill, iconFillColor)
        }
        parts.push(content)
      } catch (error) {
        console.error('error with transforming a circle' + error)
      }
    })
  }
  return parts
}

const generateTexts = (parent, iconFillColor) => {
  const parts = []
  if (parent.texts) {
    parent.texts.forEach(text => {
      try {
        const content = {
          type: 'text',
          text: text.text,
          x: text.x || 100, // x position
          y: text.y || 100, // y position
          textanchor: text.textanchor || 'middle', // anchor
          fontsize: text.fontsize || 38,
          fontfamily: text.fontfamily || 'Arial',
          fontweight: text.fontweight,
          fill: text.fill || 'none', // Fill color or set to false if none
          fillopacity: text.fillopacity, // Fill opacity {Optional}
          stroke: text.stroke || '#000', // Stroke color  or set to false if none
          strokedasharray: text.strokedasharray, // {Optional}
          strokewidth: text.strokewidth // Width of the stroke {Optional}
        }
        if (content.stroke) {
          content.stroke = replaceColor(content.stroke, iconFillColor)
        }
        parts.push(content)

      } catch (error) {
        console.error('error with transforming a text' + error)
      }
    })
  }
  return parts
}

const replaceColor = (colorString, hostilityColor) => {
  const black = '#000000'
  const shortBlack = '#000'
  if (colorString !== black && colorString !== shortBlack) {
    return hostilityColor
  }
  return colorString
}
