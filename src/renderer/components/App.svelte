<script>
  import * as R from 'ramda'
  import { onMount } from 'svelte'
  import pixelmatch from 'pixelmatch'
  import { codes, legacy, modern } from '../../fixtures'

  const ignore = [
    'GFMPOHTL--',
  ]

  // const options = codes.map(sidc => ({ sidc }))
  const options = R.take(100, codes.map(sidc => ({ sidc })))
  // const options = codes.filter(s => s.match(/^G.O/)).map(sidc => ({ sidc }))
  // const options = codes.filter(sidc => !ignore.includes(sidc)).map(sidc => ({ sidc }))
  // const options = codes.filter(sidc => ignore.includes(sidc)).map(sidc => ({ sidc }))

  let state = { index: -1, worst: 1000, threshold: 0 }
  let imageLegacy
  let imageModern
  let canvasLegacy
  let canvasModern

  onMount(() => {
    console.time('compare')
    next()
  })

  const trim = (width, height, data) => {
    let x, y
    const xs = data.data
    const box = { x1: width + 1, y1: height + 1, x2: -1, y2: -1 }
    L1: for (y = 0; y < height; y++) for (x = 0; x < width; x++) if (xs[((y * width + x) * 4) + 3]) { box.y1 = y; break L1; }
    L2: for (y = height - 1; y > 0; y--) for (x = 0; x < width; x++) if (xs[((y * width + x) * 4) + 3]) { box.y2 = y; break L2; }
    L3: for (x = 0; x < width; x++) for (y = 0; y < height; y++)  if (xs[((y * width + x) * 4) + 3]) { box.x1 = x; break L3; }
    L4: for (x = width - 1; x > 0; x--) for (y = 0; y < height; y++)  if (xs[((y * width + x) * 4) + 3]) { box.x2 = x; break L4; }
    return box
  }


  const crop = (canvas, image) => {
    const { naturalWidth: width, naturalHeight: height } = image
    canvas.width = width
    canvas.height = height
    const ctx = context(canvas)
    ctx.drawImage(image, 0, 0)

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const box = trim(canvas.width, canvas.height, data)
    const cut = ctx.getImageData(
      box.x1,
      box.y1,
      box.x2 - box.x1,
      box.y2 - box.y1
    )

    canvas.width = box.x2 - box.x1
    canvas.height = box.y2 - box.y1
    ctx.putImageData(cut, 0, 0)
    state = { ...state, [image.id]: { width, height, box, cut } }
  }

  const next = () => {
    if (state.index === 'EOF') return

    if (state.index < options.length - 1) {
      const index = state.index + 1
      state = { ...state, index, legacy: false, modern: false }
      setSource(imageLegacy, canvasLegacy, 'data:image/svg+xml;utf8,' + legacy(options[index]).asSVG())
      setSource(imageModern, canvasModern, 'data:image/svg+xml;utf8,' + modern(options[index]).asSVG())
    } else {
      console.timeEnd('compare')
      console.log('suspicions', (state.suspicions || []).sort((a, b) => b[0] - a[0]))
      return { index: 'EOF', difference: '' }
    }
  }

  const handleLoad = canvas => ({ target }) => {
    crop(canvas, target)
  }

  const handleError = () => {
    state = { ...state, difference: -1 }
    next()
  }

  const context = canvas => canvas.getContext('2d', { willReadFrequently: true })

  const putImage = (canvas, width, height, box, cut) => {
    canvas.width = width
    canvas.height = height
    const x = Math.ceil((width - (box.x2 - box.x1)) / 2)
    const y = Math.ceil((height - (box.y2 - box.y1)) / 2)
    context(canvas).putImageData(cut, x, y)
  }

  const setSource = (image, canvas, src) => {
    image.src = src
    if (image.completed) crop(canvas)(image)
  }


  $: {
    if (state.legacy && state.modern) {
      const { legacy, modern } = state
      const width = Math.max(legacy.width, modern.width)
      const height = Math.max(legacy.height, modern.height)
      putImage(canvasLegacy, width, height, legacy.box, legacy.cut)
      putImage(canvasModern, width, height, modern.box, modern.cut)

      const img1 = context(canvasLegacy).getImageData(0, 0, width, height)
      const img2 = context(canvasModern).getImageData(0, 0, width, height)
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
      on:load={handleLoad(canvasLegacy)}
      on:error={handleError}
      alt=''
    />

    <img
      id='modern'
      bind:this={imageModern}
      on:load={handleLoad(canvasModern)}
      on:error={handleError}
      alt=''
    />
  </div>

  <div class='row'>
    <canvas bind:this={canvasLegacy} hidden/>
    <canvas bind:this={canvasModern} hidden/>
  </div>
  <span>{state.index} {state.difference}</span>
</main>

<style>
  .row {
    display: flex
  }

  img {
    width: 200px;
    height: 200px;
  }

  canvas {
    width: 200px;
    height: 200px;
  }
</style>
