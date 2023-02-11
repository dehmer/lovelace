export const text = text => {
  const x = 100
  const [y, size] = text.length === 1
    ? [115, 45]
    : text.length === 3
      ? [110, 35]
      : [110, 32]

  return {
    type: 'text',
    x,
    y,
    text,
    stroke: 'none',
    fill: 'black',
    'text-anchor': 'middle',
    'font-size': size,
    'font-weight': "bold"
  }
}
