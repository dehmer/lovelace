import * as Frame from './frame'
import { Style } from './style'
import * as BBox from './bbox'
import { icon } from './icons'
import SIDC from './sidc'

export const Symbol = function (options) {
  this.options = options
}

Symbol.of = (options) => new Symbol(options)

Symbol.prototype.getSize = function () {
  return {
    width: 77.25,
    height: 77.25
  }
}

Symbol.prototype.asSVG = function () {
  const { sidc: code, ...rest } = this.options
  const sidc = SIDC.of(code)
  const { bbox: frameBBox, ...frameShape } = Frame.shape(sidc)
  const styles = Style.of(sidc, rest)

  const styledBBox = BBox.resize([
    styles.default['stroke-width'] + (styles.default['outline-width'] || 0),
    styles.default['stroke-width'] + (styles.default['outline-width'] || 0),
  ], frameBBox)

  const [width, height] = BBox.extent(styledBBox)
  const viewBox = [
    styledBBox[0],
    styledBBox[1],
    ...BBox.extent(styledBBox)
  ]

  const document = {
    type: 'svg',
    xmlns: 'http://www.w3.org/2000/svg',
    version: '1.2',
    baseProfile: 'tiny',
    width,
    height,
    viewBox,
    fill: 'none',
    children: [frameShape, ...icon(sidc)],
    style: 'default'
  }

  const xml = document => {
    const { type, children, style, ...properties } = document
    const props = { ...properties, ...(styles[style] || {}) }
    const propertyList = Object.entries(props).map(([key, value]) => {
      const type = typeof value
      if (type === 'string') return `${key}="${value}"`
      else if (type === 'number') return `${key}="${value}"`
      else if (Array.isArray(value)) return `${key}="${value.join(' ')}"`
      else return ''
    }).join(' ')


    const childList = (children || []).map(child => xml(child)).join('')
    return `<${type} ${propertyList}>${childList}</${type}>`
  }

  const svg = xml(document)
  return svg
}
