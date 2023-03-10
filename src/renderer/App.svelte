<script>
  import * as R from 'ramda'
  import { onMount } from 'svelte'
  import ProgressBar from 'svelte-progress-bar'
  import pixelmatch from 'pixelmatch'
  import hash from 'object-hash'
  import { codes } from './fixtures'
  import { sets, legacy, modern } from './options'


  const options = sets['set:icons/2525c']
  // const options = sets['set:dimension/present']
  // const options = sets['set:modifiers']
  // const options = sets['set:mobility']
  // const options = sets['set:echelon']
  // const options = sets['set:engagement']
  // const options = sets['set:direction']


  let state = { index: -1, threshold: 100 }
  let progress
  let review = []
  let imageLegacy
  let imageModern
  let canvas
  let ctx
  let interval
  let iterations = 0
  let ops = 0

  onMount(() => {
    console.time('compare')
    canvas = new OffscreenCanvas(0, 0)
    ctx = canvas.getContext('2d', { willReadFrequently: true })
    interval = setInterval(() => {
      ops = iterations
      iterations = 0
    }, 1000)
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
      progress.setWidthRatio(index / options.length)
      iterations += 1

      state = {
        ...state,
        index,
        legacy: false,
        modern: false,
        legacySource: 'data:image/svg+xml;utf8,' + legacy(options[index]).asSVG(),
        modernSource: 'data:image/svg+xml;utf8,' + modern(options[index]).asSVG()
      }
      setSource(imageLegacy, state.legacySource)
      setSource(imageModern, state.modernSource)
    } else {
      console.timeEnd('compare')
      console.log('suspicions', (state.suspicions || []).sort((a, b) => b[0] - a[0]))
      clearInterval(interval)
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
        review = [...review, {
          difference,
          legacySource: state.legacySource,
          modernSource: state.modernSource,
          ...options[state.index],
          hash: hash(options[state.index])
        }]
      }

      next()
    }
  }
</script>

<main>
  <ProgressBar bind:this={progress} color='red'/>
  <div class='main'>
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

    <div class='status'>
      <span>symbols/s: {ops}</span>
      <span>progress: {state.index + 1} / {options.length}</span>
    </div>
  </div>
  <div class='review'>
    {#each review as entry}
      <div class='card'>
        <div class='card-content'>
          <img class='image--small' src={entry.legacySource} alt=''/>
          <img class='image--small' src={entry.modernSource} alt=''/>
        </div>
        <div class='summary'>{entry.difference}</div>
        <div class='summary'>{entry.sidc}</div>
      </div>
    {/each}
  </div>
</main>

<style>
  .main {
    padding: 32px;
    display: flex;
    justify-content: center;
    gap: 16px;
  }

  .status {
    display: flex;
    flex-direction: column;
    justify-content: end;
  }

  .review {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  img {
    width: 120px;
    height: 120px;
    padding: 4px;
  }

  .card {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .card-content {
    display: flex;
    flex-direction: row;
  }

  .summary {
    display: flex;
    justify-content: center;
    border: solid black 0.5px;
    font-size: 90%;
  }

  .image--small {
    width: 60px;
    height: 60px;
    background-color: azure;
    border: dashed black 0.5px;
  }
</style>
