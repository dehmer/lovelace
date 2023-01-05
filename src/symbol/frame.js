// TODO: frame outline incl. style
import * as BBox from './bbox'

const geometries = {
  'AIR+UNKNOWN': {
    type: 'path',
    d: 'M 65,150 c -55,0 -50,-90 0,-90 0,-50 70,-50 70,0 50,0 55,90 0,90',
    selectors: [/^.[GOPUW][AP]/, /^10.[01](01|02|05|06)/]
  },
  'AIR+FRIEND': {
    type: 'path',
    d: 'M 155,150 C 155,50 115,30 100,30 85,30 45,50 45,150',
    selectors: [/^.[ADFM][AP]/, /^10.[23](01|02|05|06)/]
  },
  'AIR+NEUTRAL': {
    type: 'path',
    d: 'M 45,150 L 45,30,155,30,155,150',
    selectors: [/^.[NL][AP]/, /^10.[4](01|02|05|06)/]
  },
  'AIR+HOSTILE': {
    type: 'path',
    d: 'M 45,150 L45,70 100,20 155,70 155,150',
    selectors: [/^.[HJKS][AP]/, /^10.[56](01|02|05|06)/]
  },
  'UNIT+UNKNOWN': {
    type: 'path',
    d: 'M63,63 C63,20 137,20 137,63 C180,63 180,137 137,137 C137,180 63,180 63,137 C20,137 20,63 63,63 Z',
    // incl. DISMOUNTED (27)
    selectors: [/^.[GOPUW][GFXZ]/, /^10.[01](10|11|12|15|20|27|40|52|60)/]
  },
  'UNIT+FRIEND': {
    type: 'path',
    d: 'M25,50 l150,0 0,100 -150,0 z',
    // excl. EQUIPMENT
    selectors: [/^.[ADFM][ZFX]/, /^.[ADFM]G.[^E]/, /^10.[23](10|11|12|20|40|52|60)/]
  },
  'UNIT+NEUTRAL': {
    type: 'path',
    d: 'M45,45 l110,0 0,110 -110,0 z',
    // incl. DISMOUNTED (27)
    selectors: [/^.[NL][GFXZ]/, /^10.[4](10|11|12|15|20|27|40|52|60)/]
  },
  'UNIT+HOSTILE': {
    type: 'path',
    d: 'M 100,28 L172,100 100,172 28,100 100,28 Z',
    // incl. DISMOUNTED (27)
    selectors: [/^.[HJKS][GFXZ]/, /^10.[56](10|11|12|15|20|27|40|52|60)/]
  },
  'EQUIPMENT+FRIEND': {
    type: 'circle',
    cx: 100,
    cy: 100,
    r: 60,
    selectors: [/^SFG.E/, /^10.[23](15|30)/]
  },
  'SUBSURFACE+UNKNOWN': {
    type: 'path',
    d: 'm 65,50 c -55,0 -50,90 0,90 0,50 70,50 70,0 50,0 55,-90 0,-90',
    selectors: [/^.[GOPUW][U]/, /^10.[01](35|36|45)/]
  },
  'SUBSURFACE+FRIEND': {
    type: 'path',
    d: 'm 45,50 c 0,100 40,120 55,120 15,0 55,-20 55,-120',
    selectors: [/^.[ADFM][U]/, /^10.[23](35|36|45)/]
  },
  'SUBSURFACE+NEUTRAL': {
    type: 'path',
    d: 'M45,50 L45,170 155,170 155,50',
    selectors: [/^.[NL][U]/, /^10.[4](35|36|45)/]
  },
  'SUBSURFACE+HOSTILE': {
    type: 'path',
    d: 'M45,50 L45,130 100,180 155,130 155,50',
    selectors: [/^.[HJKS][U]/, /^10.[46](35|36|45)/]
  },
  'DISMOUNTED+FRIEND': {
    type: 'path',
    d: 'm 100,45 55,25 0,60 -55,25 -55,-25 0,-60 z',
    selectors: [/^10.[23]27/]
  }
}

const selectors = Object.entries(geometries).flatMap(([key, { selectors }]) =>
  selectors.map(selector => [selector, key])
)

const frames = Object.entries(geometries).reduce((acc, [key, value]) => {
  // TODO: add style reference
  const { selectors, ...instruction } = value

  acc[key] = {
    ...instruction,
    bbox: BBox.of(instruction),
    style: 'frame'
  }
  return acc
}, {})

export const outline = options => {
}

export const shape = options => {
  const { sidc } = options
  const index = selectors.findIndex(([selector]) => sidc.match(selector))
  const key = index !== - 1 ? selectors[index][1] : 'UNIT+UNKNOWN'
  return frames[key]
}
