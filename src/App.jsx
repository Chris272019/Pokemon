import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import PokemonList from "./pages/PokemonList"
import PokemonDetail from "./pages/PokemonDetail"
import Team from "./pages/Team"
import Battle from "./pages/Battle"
import PokemonBattle from "./pages/PokemonBattle"
import BattleResults from "./pages/BattleResults"
import Decks from "./pages/Decks"
import Navbar from "./components/Navbar"
import "./App.css"

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pokemon" element={<PokemonList />} />
            <Route path="/pokemon/:id" element={<PokemonDetail />} />
            <Route path="/team" element={<Team />} />
            <Route path="/battle" element={<Battle />} />
            <Route path="/pokemon-battle" element={<PokemonBattle />} />
            <Route path="/battle-results" element={<BattleResults />} />
            <Route path="/decks" element={<Decks />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
