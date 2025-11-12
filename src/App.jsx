import GameBoard from './components/GameBoard'
import { indiaDeck } from './data/indiaDeck'
import './App.css'

function App() {
  return (
    <div className="app">
      <GameBoard deck={indiaDeck} />
    </div>
  )
}

export default App
