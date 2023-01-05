import * as R from 'ramda'

const colors = {
  'FRAME-FILL+DARK': {
    Civilian: "rgb(80,0,80)",
    Friend: "rgb(0,107,140)",
    Hostile: "rgb(200,0,0)",
    Neutral: "rgb(0,160,0)",
    Unknown: "rgb(225,220,0)"
  }
}

const frameFill = (() => {

  const indices = {
    dark: 0,
    medium: 1,
    light: 2
  }

  const colors = [
    [ // CIVILIAN (non-hostile)
      [
        /^.[^HJKS]A.C/,
        /^..G.EVC/,
        /^..S.X/,
        /^10.[^56]01.{4}12/,
        /^10.[^56]05.{4}12/,
        /^10.[^56]11/,
        /^10.[^56]12.{4}12/,
        /^10.[^56]15.{4}16/,
        /^10.[^56]30.{4}14/
      ],
      ['rgb(80,0,80)', 'rgb(128,0,128)', 'rgb(255,161,255)']
    ],
    [ // UNKNOWN
      [/^.[GOPUW]/, /^10.[01]/],
      ['rgb(225,220,0)', 'rgb(255,255,0)', 'rgb(255,255,128)']
    ],
    [ // FRIEND
      [/^.[ADFM]/, /^10.[23]/],
      ['rgb(0,107,140)', 'rgb(0,168,220)', 'rgb(128,224,255)']
    ],
    [ // NEUTRAL
      [/^.[NL]/, /^10.[4]/],
      ['rgb(0,160,0)', 'rgb(0,226,110)', 'rgb(170,255,170)']
    ],
    [ // HOSTILE
      [/^.[HJKS]/, /^10.[56]/],
      ['rgb(200,0,0)', 'rgb(255,48,49)', 'rgb(255,128,128)']
    ],
    [ // FALLBACK
      [/.*/],
      ['darkgrey', 'grey', 'lightgrey']
    ]
  ]

  return options => {
    const { sidc } = options
    const colorMode = (options.colorMode || 'light').toLowerCase()
    const colorIndex = indices[colorMode] || 0
    const color = colors.find(([selectors]) => selectors.some(selector => sidc.match(selector)))
    return color[1][colorIndex]
  }

})()

export const Style = function (options) {
  this.options = options
  this.default = { 'stroke-width': 4, stroke: 'black' }
  this.frame = { fill: frameFill(options) }
}

Style.of = options => new Style(options)
