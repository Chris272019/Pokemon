"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Link as RouterLink } from "react-router-dom"

const BattleResults = () => {
  const [battles, setBattles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedBattle, setSelectedBattle] = useState(null)

  useEffect(() => {
    fetchBattleResults()
  }, [])

  const fetchBattleResults = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("Fetching battle results...")

      const response = await axios.get("http://localhost:3001/battles")
      console.log("Server response:", response.data)

      if (!response.data) {
        console.log("No data received from server")
        setBattles([])
        return
      }

      // Ensure we have an array of battles
      const battlesArray = Array.isArray(response.data) ? response.data : [response.data]
      console.log("Processed battles:", battlesArray)

      if (battlesArray.length === 0) {
        console.log("No battles found in the database")
      }

      // Sort battles by date (newest first)
      const sortedBattles = battlesArray.sort((a, b) => new Date(b.date) - new Date(a.date))

      setBattles(sortedBattles)
    } catch (error) {
      console.error("Error fetching battle results:", error)
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response:", error.response.data)
        console.error("Error status:", error.response.status)
        setError(`Server error: ${error.response.status} - ${error.response.data}`)
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request)
        setError("Could not connect to the server. Please make sure the server is running.")
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error setting up request:", error.message)
        setError(`Error: ${error.message}`)
      }
      setBattles([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  // Update the getBattleResultClass function to handle draws
  const getBattleResultClass = (result) => {
    switch (result) {
      case "win":
        return "win"
      case "loss":
        return "loss"
      case "draw":
        return "draw"
      default:
        return ""
    }
  }

  if (loading) {
    return (
      <div className="pokedex-container">
        <div className="pokedex-screen">
          <div className="loading">Loading battle results...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="pokedex-container">
      <div className="control-panel">
        <div className="battle-header">
          <h2>Battle History</h2>
          <RouterLink to="/" className="pokedex-button">
            Back to Home
          </RouterLink>
        </div>
      </div>

      <div className="pokedex-screen">
        {loading ? (
          <div className="loading">
            <p>Loading battle history...</p>
          </div>
        ) : error ? (
          <div className="error">
            <p>{error}</p>
          </div>
        ) : battles.length === 0 ? (
          <div className="empty-battles">
            <h3>No Battles Yet</h3>
            <p>Start your Pokémon journey by challenging other trainers!</p>
            <RouterLink to="/battle" className="pokedex-button">
              Start First Battle
            </RouterLink>
          </div>
        ) : (
          <div className="battle-results">
            <div className="battle-list">
              {battles.map((battle) => (
                <div
                  key={battle.id}
                  className={`battle-item ${getBattleResultClass(battle.result)}`}
                  onClick={() => {
                    console.log("Selected battle:", battle)
                    setSelectedBattle(battle)
                  }}
                >
                  <div className="battle-info">
                    <span className="battle-date">{formatDate(battle.date)}</span>
                    <span className="battle-opponent">vs {battle.opponent}</span>
                  </div>
                  <div className="battle-result">{battle.result.toUpperCase()}</div>
                </div>
              ))}
            </div>

            {selectedBattle && (
              <>
                <div className="battle-details-overlay" onClick={() => setSelectedBattle(null)} />
                <div className="battle-details">
                  <h3>BATTLE DETAILS</h3>
                  <div className="detail-section">
                    <h4>Date & Time</h4>
                    <p className="timestamp">{formatDate(selectedBattle.date)}</p>
                  </div>
                  {selectedBattle.yourTeam && selectedBattle.opponentTeam && (
                    <div className="detail-section">
                      <h4>Teams</h4>
                      <div className="teams-container">
                        <div className="team-section">
                          <h5>Your Team</h5>
                          <div className="pokemon-list">
                            {selectedBattle.yourTeam.map((pokemon, index) => (
                              <div key={`your-${index}`} className="pokemon-card">
                                <img
                                  src={pokemon.sprites?.front_default || "/placeholder.svg"}
                                  alt={pokemon.name}
                                />
                                <p>{pokemon.name}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="team-section">
                          <h5>Opponent's Team</h5>
                          <div className="pokemon-list">
                            {selectedBattle.opponentTeam.map((pokemon, index) => (
                              <div key={`opponent-${index}`} className="pokemon-card">
                                <img
                                  src={pokemon.sprites?.front_default || "/placeholder.svg"}
                                  alt={pokemon.name}
                                />
                                <p>{pokemon.name}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <button className="pokedex-button close-button" onClick={() => setSelectedBattle(null)}>
                    Close Details
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default BattleResults
