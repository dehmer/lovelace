import * as Frame from './frame'
import { Style } from './style'
import * as BBox from './bbox'
import { icon } from './icons'
import * as Echelon from './echelon'
import * as Mobility from './mobility'
import * as Labels from './amplifiers-text'
import SIDC from './sidc'

export const Symbol = function (options) {
  this.options = options
}

Symbol.of = (options) => new Symbol(options)

Symbol.prototype.getSize = function () {
  return {
    width: 100,
    height: 100
  }
}

Symbol.prototype.asSVG = function () {
  const { sidc: code, ...rest } = this.options
  const sidc = SIDC.of(code)
  const styles = Style.of(sidc, rest)

  const fns = [
    Frame.shape(sidc, rest),
    icon(sidc),
    Labels.labels(sidc, rest, styles),
    Echelon.echelon(sidc),
    Mobility.mobility(sidc),
    styles.bbox.bind(styles),
  ]

  const [children, bbox] = fns.reduce((acc, fn) => fn(acc), [[], BBox.NULL])
  const [width, height] = BBox.extent(bbox)
  const viewBox = [bbox[0], bbox[1], width, height]

  const document = {
    type: 'svg',
    xmlns: 'http://www.w3.org/2000/svg',
    version: '1.2',
    baseProfile: 'tiny',
    width,
    height,
    viewBox,
    children,
    style: 'default'
  }

  const xml = document => {
    const { type, children, style, ...properties } = document
    const props = { ...properties, ...(styles[style] || {}) }

    const propertyList = Object.entries(props).map(([key, value]) => {
      if (key === 'text') return ''
      const type = typeof value
      if (type === 'string') return `${key}="${value}"`
      else if (type === 'number') return `${key}="${value}"`
      else if (Array.isArray(value)) return `${key}="${value.join(' ')}"`
      else return ''
    }).join(' ')

    const childList = type !== 'text'
      ? (children || []).map(child => xml(child)).join('')
      : properties.text

    return `<${type} ${propertyList}>${childList}</${type}>`
  }

  return xml(document)
}
