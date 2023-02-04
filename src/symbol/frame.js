import * as R from 'ramda'
import * as BBox from './bbox'
import { NOOP } from './common'
import FRAME from './frame.json'

FRAME['SPACE+UNKNOWN'] = FRAME['AIR+UNKNOWN']
FRAME['SPACE+FRIEND'] = FRAME['AIR+FRIEND']
FRAME['SPACE+NEUTRAL'] = FRAME['AIR+NEUTRAL']
FRAME['SPACE+HOSTILE'] = FRAME['AIR+HOSTILE']
FRAME['ACTIVITY+UNKNOWN'] = FRAME['UNIT+UNKNOWN']
FRAME['ACTIVITY+FRIEND'] = FRAME['UNIT+FRIEND']
FRAME['ACTIVITY+NEUTRAL'] = FRAME['UNIT+NEUTRAL']
FRAME['ACTIVITY+HOSTILE'] = FRAME['UNIT+HOSTILE']

const decorations = {
  'SPACE+UNKNOWN': {
    type: 'path',
    d: 'M 100 22.5 C 85 22.5 70 31.669211 66 50 L 134 50 C 130 31.669204 115 22.5 100 22.5 z'
  },
  'SPACE+FRIEND': {
    type: 'path',
    d: 'M 100,30 C 90,30 80,35 68.65625,50 l 62.6875,0 C 120,35 110,30 100,30'
  },
  'SPACE+NEUTRAL': {
    type: 'path',
    d: 'M45,50 l0,-20 110,0 0,20 z'
  },
  'SPACE+HOSTILE': {
    type: 'path',
    d: 'M67,50 L100,20 133,50 z'
  },
  'ACTIVITY+UNKNOWN': {
    type: 'path',
    d: 'M 107.96875 31.46875 L 92.03125 31.71875 L 92.03125 46.4375 L 107.71875 46.4375 L 107.96875 31.46875 z M 47.03125 92.5 L 31.09375 92.75 L 31.09375 107.5 L 46.78125 107.5 L 47.03125 92.5 z M 168.4375 92.5 L 152.5 92.75 L 152.5 107.5 L 168.1875 107.5 L 168.4375 92.5 z M 107.96875 153.5625 L 92.03125 153.8125 L 92.03125 168.53125 L 107.71875 168.53125 L 107.96875 153.5625 z'
  },
  'ACTIVITY+FRIEND': {
    type: 'path',
    d: 'm 160,135 0,15 15,0 0,-15 z m -135,0 15,0 0,15 -15,0 z m 135,-85 0,15 15,0 0,-15 z m -135,0 15,0 0,15 -15,0 z'
  },
  'ACTIVITY+NEUTRAL': {
    type: 'path',
    d: 'm 140,140 15,0 0,15 -15,0 z m -80,0 0,15 -15,0 0,-15 z m 80,-80 0,-15 15,0 0,15 z m -80,0 -15,0 0,-15 15,0 z'
  },
  'ACTIVITY+HOSTILE': {
    type: 'path',
    d: 'M 100 28 L 89.40625 38.59375 L 100 49.21875 L 110.59375 38.59375 L 100 28 z M 38.6875 89.3125 L 28.0625 99.9375 L 38.6875 110.53125 L 49.28125 99.9375 L 38.6875 89.3125 z M 161.40625 89.40625 L 150.78125 100 L 161.40625 110.59375 L 172 100 L 161.40625 89.40625 z M 99.9375 150.71875 L 89.3125 161.3125 L 99.9375 171.9375 L 110.53125 161.3125 L 99.9375 150.71875'
  }
}

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
      const key = `${dimension}+${affiliation}`
      const frame = frames[key]
      const instructions = [{ ...frame[type], ...styles[style], zIndex }]
      const decoration = decorations[key]
      if (decoration) instructions.push({ ...decoration, ...styles['style:frame/decoration'], zIndex})
      return () => [frame.bbox, instructions]
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
