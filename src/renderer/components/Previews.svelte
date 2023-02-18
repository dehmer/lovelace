<script>
  import * as R from 'ramda'
  import { codes, legacy, modern } from '../../fixtures'

  const options = codes
    .map(sidc => ({ sidc }))
    .map(options => 'data:image/svg+xml;utf8,' + modern(options).asSVG())
</script>

<main>
  {#each options as src}
    <img src={src} alt=''/>
  {/each}
</main>

<style>
  img {
    width: 100px;
    height: 100px;
  }
</style>
