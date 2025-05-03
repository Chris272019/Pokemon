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
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [teamRes, battleRes, deckRes] = await Promise.all([
          axios.get("http://localhost:3001/teams"),
          axios.get("http://localhost:3001/battles"),
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
      localStorage.setItem("pokemonUserName", userName)
      setError("")
    } catch (error) {
      setError("Error saving name. Please try again.")
    }
  }

  const handleResetAllData = async () => {
    try {
      // First, get all the data
      const [teams, battles, decks] = await Promise.all([
        axios.get("http://localhost:3001/teams"),
        axios.get("http://localhost:3001/battles"),
        axios.get("http://localhost:3001/decks")
      ]);

      // Delete in sequence to avoid potential foreign key conflicts
      // First delete battles as they might reference teams or decks
      if (battles.data.length > 0) {
        await Promise.all(
          battles.data.map(battle => 
            axios.delete(`http://localhost:3001/battles/${battle.id}`)
            .catch(err => console.error(`Failed to delete battle ${battle.id}:`, err))
          )
        );
      }

      // Then delete teams
      if (teams.data.length > 0) {
        await Promise.all(
          teams.data.map(team => 
            axios.delete(`http://localhost:3001/teams/${team.id}`)
            .catch(err => console.error(`Failed to delete team ${team.id}:`, err))
          )
        );
      }

      // Finally delete decks
      if (decks.data.length > 0) {
        await Promise.all(
          decks.data.map(deck => 
            axios.delete(`http://localhost:3001/decks/${deck.id}`)
            .catch(err => console.error(`Failed to delete deck ${deck.id}:`, err))
          )
        );
      }

      // Clear local storage
      localStorage.clear();

      // Reset stats
      setTeamCount(0);
      setBattleCount(0);
      setDeckCount(0);
      setShowResetConfirm(false);

      // Show success message
      alert("All data has been reset successfully!");

      // Refresh the page to ensure clean state
      window.location.reload();
    } catch (error) {
      console.error("Error during reset:", error);
      let errorMessage = "Error resetting data. ";
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage += `Server error: ${error.response.status} - ${error.response.data}`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage += "No response from server. Please check your connection.";
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage += error.message;
      }
      
      alert(errorMessage);
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
          <button 
            className="hero-button reset-button"
            onClick={() => setShowResetConfirm(true)}
          >
            Reset All Data
          </button>
        </div>
      </div>

      {showResetConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Reset All Data</h3>
            <p>Are you sure you want to delete all your data? This will remove:</p>
            <ul>
              <li>Your Team ({teamCount} Pokémon)</li>
              <li>Battle History ({battleCount} Battles)</li>
              <li>Decks ({deckCount} Decks)</li>
            </ul>
            <p>This action cannot be undone!</p>
            <div className="modal-buttons">
              <button 
                className="confirm-button"
                onClick={handleResetAllData}
              >
                Yes, Reset Everything
              </button>
              <button 
                className="cancel-button"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
