import { useEffect } from 'react'
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
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004';

function App() {
  useEffect(() => {
    // Keep-alive function to prevent backend from spinning down
    const keepAlive = async () => {
      try {
        await axios.get(`${API_BASE_URL}/teams`)
      } catch (error) {
        console.log('Keep-alive ping failed:', error.message)
      }
    }

    // Ping every 5 minutes
    const interval = setInterval(keepAlive, 5 * 60 * 1000)
    
    // Initial ping
    keepAlive()

    return () => clearInterval(interval)
  }, [])

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
