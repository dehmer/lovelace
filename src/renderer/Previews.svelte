<script>
  import * as R from 'ramda'
  import { sets, legacy, modern } from './options'

  const options = sets['set:variations']
  const sources = options
    .map(modern)
    .map(symbol => symbol.asSVG())
    .map(svg => 'data:image/svg+xml;utf8,' + svg)
</script>

<main>
  <div class='column'>
    {#each sources as src}
      <img src={src} alt=''/>
    {/each}
  </div>
</main>

<style>
  main {
    padding-top: 200px;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
  }

  img {
    width: 200px;
    height: 200px;
    margin: 32px;
  }
</style>
