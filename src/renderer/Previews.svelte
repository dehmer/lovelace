<script>
  import * as R from 'ramda'
  import { sets, legacy, modern } from './options'

  const options = R.take(1, R.drop(1, sets['set:variations']))
  // const options = sets['set:variations']
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
    flex-direction: row;
  }

  .column {
    display: flex;
    flex-direction: column;
    gap: 32px;
    padding: 60px 100px;
    border: solid 0.5px black;
  }

  img {
    width: 200px;
    height: 200px;
    background-color: azure;
    border: dashed black 0.5px;
  }
</style>
