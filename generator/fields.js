#!/usr/bin/env node
require('@babel/register')
const R = require('ramda')
const ms = require('milsymbol')
const { aliases } =  require('../src/aliases')

const replaceKey = (value, from, to) => {
  if (!value[from]) return value
  value[to] = value[from]
  delete value[from]
}

const replaceValue = (value, key, from, to) => {
  if (value[key] === undefined) return value
  if (value[key] !== from) return value
  value[key] = to
}

const sanitize = value => {
  if (Array.isArray(value)) {
    return value.map(sanitize).filter(Boolean)
  }

  value.type = 'text'
  value.fill = 'black'
  replaceKey(value, 'strokewidth', 'stroke-width')
  replaceKey(value, 'textanchor', 'text-anchor')
  replaceKey(value, 'fontfamily', 'font-family')
  replaceKey(value, 'fontweight', 'font-weight')
  replaceKey(value, 'fontsize', 'font-size')
  replaceValue(value, 'stroke', false, 'none')
  return value
}

const rename = R.compose(
  entries => Object.fromEntries(entries),
  R.map(([key, value]) => [aliases[key] || key, sanitize(value)]),
  value => Object.entries(value)
)

const labels = R.compose(
  entries => Object.fromEntries(entries),
  R.map(([key, value]) => [key, rename(value)]),
  R.filter(([_, value]) => !R.isEmpty(value)),
  labels => Object.entries(labels),
  R.reduce((acc, fn) => { fn(acc); return acc }, {}),
)(ms._labelOverrides.letter)


console.log(JSON.stringify(labels))
// console.log(JSON.stringify(Object.keys(labels)))
