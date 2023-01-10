import * as Frame from './frame'
import { Style } from './style'
import * as BBox from './bbox'
import { icon } from './icons'
import * as Echelon from './echelon'
import * as Mobility from './mobility'
import * as Labels from './modifiers'
import SIDC from './sidc'
import { overlay, compose } from './layout'

export const Symbol = function (options) {
  const sidc = SIDC.of(options.sidc)

  // Normalize options:
  const effectiveOptions = {}
  effectiveOptions.frame = options.frame === true || false
  effectiveOptions.strokeWidth = options.strokeWidth || 4
  effectiveOptions.strokeColor = options.strokeColor || 'black'
  effectiveOptions.outlineWidth = options.outlineWidth || 0
  effectiveOptions.outlineColor = options.outlineColor || false
  effectiveOptions.outline = (options.outline === false || effectiveOptions.outlineWidth === 0 || !effectiveOptions.outlineColor)
    ? false
    : true

  const styles = Style.of(sidc, effectiveOptions)
  const context = {
    ...options,
    ...effectiveOptions,
    styles,
    sidc
  }

  const fns = [
    Frame.outline(context),
    Frame.shape(context),
    Frame.overlay(context),
    icon(context),
    overlay(
      Echelon.outline(context),
      Echelon.echelon(context),
      Labels.modifiers(context),
      Mobility.mobility(context),
    )
  ]

  const [children, bbox] = compose(fns)
  const [width, height] = BBox.extent(bbox)
  this.width = width
  this.height = height
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

  this.svg = xml(document)
}

Symbol.of = (options) => new Symbol(options)

Symbol.prototype.getSize = function () {
  return {
    width: this.width,
    height: this.height
  }
}

Symbol.prototype.asSVG = function () {
  return this.svg
}
