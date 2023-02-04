
let durations = {}
let now

export const reset = () => durations = {}

export const enter = id => {
  now = performance.now()
}

export const exit = id => {
  durations[id] = durations[id] || 0
  durations[id] += performance.now() - now
}

export const log = () => console.log(durations)
