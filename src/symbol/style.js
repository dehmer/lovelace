import * as BBox from './bbox'

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
  this.default = {
    'stroke-width': 4,
    stroke: 'black',
    fill: 'none',
    'font-family': 'Arial',
    'font-weight': 'bold'
  }
  this.frame = { fill: this.frameFill(options) }
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

Style.prototype.bbox = function ([children, bbox]) {
  const styledBox = BBox.resize([
    this.default['stroke-width'] + (this.default['outline-width'] || 0),
    this.default['stroke-width'] + (this.default['outline-width'] || 0),
  ], bbox)

  return [children, styledBox]
}

const MODE = { dark: 0, medium: 1, light: 2 }

const FRAME_FILL = {
  CIVILIAN: ['rgb(80,0,80)', 'rgb(128,0,128)', 'rgb(255,161,255)'],
  UNKNOWN: ['rgb(225,220,0)', 'rgb(255,255,0)', 'rgb(255,255,128)'],
  FRIEND: ['rgb(0,107,140)', 'rgb(0,168,220)', 'rgb(128,224,255)'],
  NEUTRAL: ['rgb(0,160,0)', 'rgb(0,226,110)', 'rgb(170,255,170)'],
  HOSTILE: ['rgb(200,0,0)', 'rgb(255,48,49)', 'rgb(255,128,128)']
}
