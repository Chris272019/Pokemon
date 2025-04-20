"use client"

import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"

const Home = () => {
  const [teamCount, setTeamCount] = useState(0)
  const [battleCount, setBattleCount] = useState(0)
  const [deckCount, setDeckCount] = useState(0)
  const [userName, setUserName] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [teamRes, battleRes, deckRes] = await Promise.all([
          axios.get("http://localhost:3001/teams"),
          axios.get("http://localhost:3001/battleHistory"),
          axios.get("http://localhost:3001/decks"),
        ])

        setTeamCount(teamRes.data.length)
        setBattleCount(battleRes.data.length)
        setDeckCount(deckRes.data.length)
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }

    fetchStats()
  }, [])

  const handleNameSubmit = async (e) => {
    e.preventDefault()
    if (!userName.trim()) {
      setError("Please enter a name")
      return
    }
    try {
      // Save the user name to localStorage
      localStorage.setItem("pokemonUserName", userName)
      setError("")
      // You can add additional logic here, like updating a user profile
    } catch (error) {
      setError("Error saving name. Please try again.")
    }
  }

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Welcome to PokéApp</h1>
        <p>Your ultimate Pokémon companion for building teams and simulating battles</p>
        
        <form onSubmit={handleNameSubmit} className="name-input-form">
          <div className="input-group">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="name-input"
            />
            <button type="submit" className="submit-name-button">
              Save Name
            </button>
          </div>
          {error && <p className="error-message">{error}</p>}
        </form>

        <div className="hero-buttons">
          <Link to="/pokemon" className="hero-button">
            Browse Pokédex
          </Link>
          <Link to="/battle" className="hero-button">
            Start Battle
          </Link>
        </div>
      </div>

      <div className="stats-section">
        <div className="stat-card">
          <h3>Team</h3>
          <p>{teamCount}/6 Pokémon</p>
          <Link to="/team">View Team</Link>
        </div>
        <div className="stat-card">
          <h3>Battles</h3>
          <p>{battleCount} Completed</p>
          <Link to="/battle-results">View History</Link>
        </div>
        <div className="stat-card">
          <h3>Decks</h3>
          <p>{deckCount} Created</p>
          <Link to="/decks">Manage Decks</Link>
        </div>
      </div>

      <div className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Pokédex</h3>
            <p>Browse and search through all Pokémon with detailed information</p>
          </div>
          <div className="feature-card">
            <h3>Team Building</h3>
            <p>Create your dream team with up to 6 Pokémon</p>
          </div>
          <div className="feature-card">
            <h3>Battle Simulation</h3>
            <p>Simulate battles between Pokémon teams based on their stats</p>
          </div>
          <div className="feature-card">
            <h3>Deck Management</h3>
            <p>Save multiple teams as decks for different strategies</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
