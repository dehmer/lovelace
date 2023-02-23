<script>
  import * as R from 'ramda'
  import { onMount } from 'svelte'
  import pixelmatch from 'pixelmatch'
  import { codes, legacy, modern } from '../../fixtures'

  const ignore = [
    'GFMPOHTL--',
  ]

  const options = codes.map(sidc => ({ sidc }))
  // const options = R.drop(8300, codes.map(sidc => ({ sidc })))
  // const options = R.take(1, codes.map(sidc => ({ sidc })))
  // const options = codes.filter(s => s.match(/^G.O/)).map(sidc => ({ sidc }))
  // const options = codes.filter(sidc => !ignore.includes(sidc)).map(sidc => ({ sidc }))
  // const options = codes.filter(sidc => ignore.includes(sidc)).map(sidc => ({ sidc }))

  let state = { index: -1, worst: 1000, threshold: 200 }
  let imageLegacy
  let imageModern
  let canvas
  let ctx

  onMount(() => {
    console.time('compare')
    canvas = new OffscreenCanvas(0, 0)
    ctx = canvas.getContext('2d', { willReadFrequently: true })
    next()
  })

  const trim = (width, height, data) => {
    let x, y
    const box = { x1: width + 1, y1: height + 1, x2: -1, y2: -1 }
    L1: for (y = 0; y < height; y++) for (x = 0; x < width; x++) if (data[((y * width + x) * 4) + 3]) { box.y1 = y; break L1; }
    L2: for (y = height - 1; y > 0; y--) for (x = 0; x < width; x++) if (data[((y * width + x) * 4) + 3]) { box.y2 = y; break L2; }
    L3: for (x = 0; x < width; x++) for (y = 0; y < height; y++)  if (data[((y * width + x) * 4) + 3]) { box.x1 = x; break L3; }
    L4: for (x = width - 1; x > 0; x--) for (y = 0; y < height; y++)  if (data[((y * width + x) * 4) + 3]) { box.x2 = x; break L4; }
    return box
  }

  const crop = image => {
    const { naturalWidth: width, naturalHeight: height } = image
    canvas.width = width
    canvas.height = height
    ctx.drawImage(image, 0, 0)

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const box = trim(canvas.width, canvas.height, data.data)
    const cut = ctx.getImageData(
      box.x1,
      box.y1,
      box.x2 - box.x1,
      box.y2 - box.y1
    )

    state = { ...state, [image.id]: { width, height, box, cut } }
  }

  const handleLoad = ({ target }) => crop(target)
  const handleError = () => { state = { ...state, difference: -1 }; next() }

  const putImage = (width, height, key) => {
    const { box, cut } = state[key]
    canvas.width = width
    canvas.height = height
    const x = Math.ceil((width - (box.x2 - box.x1)) / 2)
    const y = Math.ceil((height - (box.y2 - box.y1)) / 2)
    ctx.putImageData(cut, x, y)
    return ctx
  }

  const setSource = (image, src) => {
    image.src = src
    if (image.completed) crop(image)
  }

  const next = () => {
    if (state.index === 'EOF') return

    if (state.index < options.length - 1) {
      const index = state.index + 1
      state = { ...state, index, legacy: false, modern: false }
      setSource(imageLegacy, 'data:image/svg+xml;utf8,' + legacy(options[index]).asSVG())
      setSource(imageModern, 'data:image/svg+xml;utf8,' + modern(options[index]).asSVG())
    } else {
      console.timeEnd('compare')
      console.log('suspicions', (state.suspicions || []).sort((a, b) => b[0] - a[0]))
      return { index: 'EOF', difference: '' }
    }
  }


  $: {
    if (state.legacy && state.modern) {
      const { legacy, modern } = state
      const width = Math.max(legacy.width, modern.width)
      const height = Math.max(legacy.height, modern.height)

      const img1 = putImage(width, height, 'legacy').getImageData(0, 0, width, height)
      const img2 = putImage(width, height, 'modern').getImageData(0, 0, width, height)

      const difference = pixelmatch(img1.data, img2.data, null, width, height, { threshold: 0.1 })
      state = { ...state, difference }

      if (difference > state.threshold) {
        const sidc = options[state.index].sidc
        const suspicions = [...state.suspicions || [], [difference, sidc]]
        state = { ...state, suspicions }
      }

      next()
    }
  }
</script>

<main>
  <div class='row'>
    <img
      id='legacy'
      bind:this={imageLegacy}
      on:load={handleLoad}
      on:error={handleError}
      alt=''
    />

    <img
      id='modern'
      bind:this={imageModern}
      on:load={handleLoad}
      on:error={handleError}
      alt=''
    />
  </div>
  <span>{state.index} {state.difference}</span>
</main>

<style>
  .row {
    display: flex
  }

  img {
    width: 100px;
    height: 100px;
  }
</style>
