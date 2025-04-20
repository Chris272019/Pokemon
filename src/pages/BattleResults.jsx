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
        return "battle-win"
      case "loss":
        return "battle-loss"
      case "draw":
        return "battle-draw"
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
        <div className="led-light"></div>
        <div className="battle-header">
          <h2>Battle Results</h2>
          <RouterLink to="/" className="pokedex-button">
            Back to Home
          </RouterLink>
        </div>
      </div>

      <div className="pokedex-screen">
        {loading ? (
          <div className="loading">Loading battle results...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : battles.length === 0 ? (
          <div className="empty-battles">
            <h3>No battle results yet!</h3>
            <p>Start battling to see your results here.</p>
            <RouterLink to="/battle" className="pokedex-button">
              Start Battle
            </RouterLink>
          </div>
        ) : (
          <div className="battle-results">
            <div className="battle-list">
              {battles.map((battle) => (
                <div
                  key={battle.id}
                  className={`battle-item ${getBattleResultClass(battle.result)}`}
                  onClick={() => setSelectedBattle(battle)}
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
              <div className="battle-details">
                <h3>Battle Details</h3>
                <div className="detail-section">
                  <h4>Date</h4>
                  <p>{formatDate(selectedBattle.date)}</p>
                </div>
                <div className="detail-section">
                  <h4>Opponent</h4>
                  <p>{selectedBattle.opponent}</p>
                </div>
                <div className="detail-section">
                  <h4>Result</h4>
                  <p className={getBattleResultClass(selectedBattle.result)}>{selectedBattle.result.toUpperCase()}</p>
                </div>
                <div className="detail-section">
                  <h4>Pokémon</h4>
                  <div className="battle-pokemon">
                    <div className="pokemon-card">
                      <img
                        src={selectedBattle.yourTeam[0].sprites.front_default || "/placeholder.svg"}
                        alt={selectedBattle.yourTeam[0].name}
                      />
                      <p>{selectedBattle.yourTeam[0].name}</p>
                    </div>
                    <div className="vs">VS</div>
                    <div className="pokemon-card">
                      <img
                        src={selectedBattle.opponentTeam[0].sprites.front_default || "/placeholder.svg"}
                        alt={selectedBattle.opponentTeam[0].name}
                      />
                      <p>{selectedBattle.opponentTeam[0].name}</p>
                    </div>
                  </div>
                </div>
                <div className="detail-section">
                  <h4>Stat Comparison</h4>
                  {selectedBattle.statComparison.map((comparison, index) => (
                    <div key={index} className="stat-comparison">
                      <p>{comparison.stat}:</p>
                      <p>
                        {selectedBattle.yourTeam[0].name} ({comparison.player}) vs {selectedBattle.opponentTeam[0].name}{" "}
                        ({comparison.opponent})
                      </p>
                      <p>
                        Winner:{" "}
                        {comparison.winner === "draw"
                          ? "Draw"
                          : comparison.winner === "player"
                            ? selectedBattle.yourTeam[0].name
                            : selectedBattle.opponentTeam[0].name}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="detail-section">
                  <h4>Total Wins</h4>
                  <p>Your Pokémon: {selectedBattle.totalWins.player}</p>
                  <p>Opponent: {selectedBattle.totalWins.opponent}</p>
                </div>
                <button className="pokedex-button" onClick={() => setSelectedBattle(null)}>
                  Close Details
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default BattleResults
