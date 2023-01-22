import * as R from 'ramda'
import * as BBox from './bbox'
import { NOOP } from './common'
import FRAME from './frame.json'

const frames = Object.entries(FRAME).reduce((acc, [key, frame]) => {
  const { open, ...graphics } = frame
  acc[key] = acc[key] || {}
  acc[key].open = graphics
  acc[key].closed = { ...graphics, d: graphics.d + ' z' }
  acc[key].bbox = BBox.of(graphics)
  return acc
}, {})

const instruction =
  (type, style, zIndex = 0) =>
    ({ dimension, affiliation, styles }) => {
      // TODO: respect JOKER/FAKER -> FRIEND
      const frame = frames[`${dimension}+${affiliation}`]
      return () => [frame.bbox, { ...frame[type], ...styles[style], zIndex }]
    }

export const outline = R.ifElse(
  ({ frame, outline }) => frame && outline,
  instruction('closed', 'style:outline', -1),
  NOOP
)

export const frame = R.ifElse(
  ({ frame }) => frame,
  instruction('open', 'style:frame/shape', 0),
  NOOP
)

export const overlay = R.ifElse(
  ({ frame, status, pending }) => frame && (status !== 'PRESENT' || pending),
  instruction('open', 'style:frame/overlay', 1),
  NOOP
)
