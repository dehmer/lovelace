import * as BBox from './bbox'
import charwidth from './charwidth.json'

const defaulCharWidth = charwidth['W']
const textWidth = s => [...s].reduce((acc, c) => acc + charwidth[c] || defaulCharWidth, 0)

const colors = {
  'FRAME-FILL+DARK': {
    CIVILIAN: "rgb(80,0,80)",
    FRIEND: "rgb(0,107,140)",
    HOSTILE: "rgb(200,0,0)",
    NEUTRAL: "rgb(0,160,0)",
    UNKNOWN: "rgb(225,220,0)"
  }
}

export const Style = function (sidc, options) {
  this.sidc = sidc
  this.options = options

  const offWhite = 'rgb(239,239,239)'

  this.default = {
    'stroke-width': options.strokeWidth,
    stroke: options.strokeColor,
    fill: 'none',
    'font-family': 'Arial',
  }

  this['style:text-amplifiers/left'] = {
    'font-family': 'Arial',
    'font-size': 36,
    'text-anchor': 'end',
    'stroke-width': 0,
    fill: 'black'
  }

  this['style:text-amplifiers/right'] = {
    'font-family': 'Arial',
    'font-size': 36,
    'text-anchor': 'start',
    'stroke-width': 0,
    fill: 'black'
  }

  this['style:text-amplifiers/bottom'] = {}

  this['style:frame/outline'] = {
    'stroke': options.outlineColor,
    'stroke-width': options.strokeWidth + options.outlineWidth * 2,
    fill: 'none',
    'stroke-linejoin': 'round'
   }

  this['style:frame/shape'] = {
    'stroke-width': options.strokeWidth,
    fill: this.frameFill(options)
   }

   this['style:frame/overlay'] = {
    'stroke': offWhite,
    'stroke-width': options.strokeWidth,
    // pending state has precedence over planned status:
    'stroke-dasharray': sidc.pending ? '4,4' : sidc.status === 'PLANNED' ? '8,12' : 'none'
   }

   this['style:echelon'] = {
    'stroke': options.strokeColor,
    'stroke-width': options.strokeWidth,
    'fill': options.strokeColor
   }

   this['style:echelon/outline'] = {
    'stroke': options.outlineColor,
    'stroke-width': options.strokeWidth + options.outlineWidth * 2,
    'fill': options.outlineColor,
    'stroke-linejoin': 'round',
    'stroke-linecap': 'round'
   }

}

Style.of = (sidc, options) => new Style(sidc, options)

Style.prototype.frameFill = function () {
  const colorMode = (this.options.colorMode || 'light').toLowerCase()
  const colorIndex = MODE[colorMode] || 0
  const key = (this.sidc.civilian && this.sidc.affiliation !== 'HOSTILE')
    ? 'CIVILIAN'
    : this.sidc.affiliation

  return FRAME_FILL[key][colorIndex]
}

/**
 * @deprecated
 */
Style.prototype.bbox = function ([children, bbox]) {
  const styledBox = BBox.resize([
    this.default['stroke-width'] + (this.default['outline-width'] || 0),
    this.default['stroke-width'] + (this.default['outline-width'] || 0),
  ], bbox)

  return [children, styledBox]
}

Style.prototype.padding = function (styleId) {
  if (!this[styleId]) return [0, 0]
  const width = this[styleId]['stroke-width'] || 0
  return [width / 2, width / 2]
}

Style.prototype.textExtent = function (lines, styleId) {
  const style = this[styleId]
  const fontSize = style['font-size'] || 40
  const factor = fontSize / 30
  const widths = lines.map(line => textWidth(line) * factor)
  return [Math.max(...widths), lines.length * fontSize]
}

const MODE = { dark: 0, medium: 1, light: 2 }

const FRAME_FILL = {
  CIVILIAN: ['rgb(80,0,80)', 'rgb(128,0,128)', 'rgb(255,161,255)'],
  UNKNOWN: ['rgb(225,220,0)', 'rgb(255,255,0)', 'rgb(255,255,128)'],
  FRIEND: ['rgb(0,107,140)', 'rgb(0,168,220)', 'rgb(128,224,255)'],
  NEUTRAL: ['rgb(0,160,0)', 'rgb(0,226,110)', 'rgb(170,255,170)'],
  HOSTILE: ['rgb(200,0,0)', 'rgb(255,48,49)', 'rgb(255,128,128)']
}
