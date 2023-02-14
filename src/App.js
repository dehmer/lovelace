/* eslint-disable jsx-a11y/alt-text */
import { codes, modern, legacy } from './fixtures'
import './App.css'

const Symbols = () => codes.map((sidc, index) => {
  const pair = [legacy({ sidc }), modern({ sidc })]
  return (
    <div className='pair' key={index} >
      <img width={120} src={'data:image/svg+xml;utf8,' + pair[0].asSVG()} className="symbol"/>
      <img width={120} src={'data:image/svg+xml;utf8,' + pair[1].asSVG()} className="symbol"/>
    </div>
  )
})

function App() {
  return (
    <div className="app">
      <Symbols/>
    </div>
  )
}

export default App
