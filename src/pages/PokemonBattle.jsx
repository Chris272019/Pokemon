"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { useLocation } from "react-router-dom"

const PokemonBattle = () => {
  const [yourTeam, setYourTeam] = useState([])
  const [opponentTeam, setOpponentTeam] = useState([])
  const [selectedPokemon, setSelectedPokemon] = useState(null)
  const [selectedOpponent, setSelectedOpponent] = useState(null)
  const [battleLog, setBattleLog] = useState([])
  const [winner, setWinner] = useState(null)
  const [winningTeam, setWinningTeam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [playerWins, setPlayerWins] = useState(0)
  const [opponentWins, setOpponentWins] = useState(0)
  const [round, setRound] = useState(1)
  const [firstRoundWinner, setFirstRoundWinner] = useState(null)
  const [selectedDeck, setSelectedDeck] = useState(null)
  const [defeatedPokemon, setDefeatedPokemon] = useState({ player: [], opponent: [] })


  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (location.state) {
      const { yourTeam: passedTeam, opponentTeam: passedOpponentTeam, selectedDeck: passedDeck } = location.state
      if (passedTeam && passedOpponentTeam) {
        console.log("Received teams:", { passedTeam, passedOpponentTeam })
        setYourTeam(passedTeam)
        setOpponentTeam(passedOpponentTeam)
        setSelectedDeck(passedDeck)
        setLoading(false)
      } else {
        generateTeams()
      }
    } else {
      generateTeams()
    }
  }, [location.state])

  const generateTeams = async () => {
    try {
      setLoading(true)
      // Generate random Pokémon IDs (1-151 for Gen 1)
      const yourTeamIds = Array.from({ length: 6 }, () => Math.floor(Math.random() * 151) + 1)
      const opponentTeamIds = Array.from({ length: 6 }, () => Math.floor(Math.random() * 151) + 1)

      // Fetch your team
      const yourTeamPromises = yourTeamIds.map((id) => axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`))
      const yourTeamResponses = await Promise.all(yourTeamPromises)
      const yourTeamData = yourTeamResponses.map((response) => ({
        id: response.data.id,
        name: response.data.name,
        sprites: {
          front_default: response.data.sprites.front_default,
        },
        stats: response.data.stats.map((stat) => ({
          stat: { name: stat.stat.name },
          base_stat: stat.base_stat,
        })),
      }))

      // Fetch opponent team
      const opponentTeamPromises = opponentTeamIds.map((id) => axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`))
      const opponentTeamResponses = await Promise.all(opponentTeamPromises)
      const opponentTeamData = opponentTeamResponses.map((response) => ({
        id: response.data.id,
        name: response.data.name,
        sprites: {
          front_default: response.data.sprites.front_default,
        },
        stats: response.data.stats.map((stat) => ({
          stat: { name: stat.stat.name },
          base_stat: stat.base_stat,
        })),
      }))

      setYourTeam(yourTeamData)
      setOpponentTeam(opponentTeamData)
      setLoading(false)
    } catch (error) {
      console.error("Error generating teams:", error)
      setLoading(false)
    }
  }

  const selectPokemon = (pokemon) => {
    setSelectedPokemon(pokemon)
  }

  const selectOpponent = (pokemon) => {
    setSelectedOpponent(pokemon)
  }

  const showWinner = () => {
    try {
      if (!selectedPokemon || !selectedOpponent) {
        alert("Please select Pokémon from both teams to battle")
        return
      }

      console.log("Selected Pokémon:", selectedPokemon)
      console.log("Selected Opponent:", selectedOpponent)

      if (!selectedPokemon.stats || !Array.isArray(selectedPokemon.stats)) {
        console.error("Player Pokémon stats missing or invalid:", selectedPokemon)
        alert("Error: Your Pokémon's stats are missing. Please try selecting a different Pokémon.")
        return
      }

      if (!selectedOpponent.stats || !Array.isArray(selectedOpponent.stats)) {
        console.error("Opponent Pokémon stats missing or invalid:", selectedOpponent)
        alert("Error: Opponent's Pokémon stats are missing. Please try selecting a different Pokémon.")
        return
      }

      // Get all core stats to compare
      const statNames = ["hp", "attack", "defense", "special-attack", "special-defense", "speed"]
      const statDisplayNames = ["HP", "Attack", "Defense", "Special Attack", "Special Defense", "Speed"]

      // Compare stats and count wins for this round
      let playerRoundWins = 0
      let opponentRoundWins = 0
      const statComparison = []

      statNames.forEach((statName, index) => {
        const displayName = statDisplayNames[index]

        // Find the stat in the stats array
        const playerStatObj = selectedPokemon.stats.find(s => s.stat.name === statName)
        const opponentStatObj = selectedOpponent.stats.find(s => s.stat.name === statName)

        // Get the base_stat value, default to 0 if not found
        const playerStat = playerStatObj ? playerStatObj.base_stat : 0
        const opponentStat = opponentStatObj ? opponentStatObj.base_stat : 0

        let winner = "draw"
        if (playerStat > opponentStat) {
          playerRoundWins++
          winner = "player"
        } else if (opponentStat > playerStat) {
          opponentRoundWins++
          winner = "opponent"
        }

        statComparison.push({
          stat: displayName,
          player: playerStat,
          opponent: opponentStat,
          winner: winner,
        })
      })

      // Determine round winner
      let roundWinner = "draw"
      if (playerRoundWins >= 3) {
        roundWinner = "player"
        setPlayerWins(prev => prev + 1)
        // Add defeated opponent Pokémon
        setDefeatedPokemon(prev => ({
          ...prev,
          opponent: [...prev.opponent, selectedOpponent.id]
        }))
      } else if (opponentRoundWins >= 3) {
        roundWinner = "opponent"
        setOpponentWins(prev => prev + 1)
        // Add defeated player Pokémon
        setDefeatedPokemon(prev => ({
          ...prev,
          player: [...prev.player, selectedPokemon.id]
        }))
      }

      // Store first round winner
      if (round === 1) {
        setFirstRoundWinner(roundWinner)
      }

      // Update battle log with round results
      const newLog = [...battleLog]
      newLog.push(`=== Round ${round}: ${selectedPokemon.name} vs ${selectedOpponent.name} ===`)
      newLog.push("=== Stat Comparison ===")
      statComparison.forEach((comparison) => {
        newLog.push(
          `${comparison.stat}: ${selectedPokemon.name} (${comparison.player}) vs ${selectedOpponent.name} (${comparison.opponent})`
        )
        newLog.push(
          `Winner: ${comparison.winner === "draw" ? "Draw" : comparison.winner === "player" ? selectedPokemon.name : selectedOpponent.name}`
        )
      })
      newLog.push(`Round Winner: ${roundWinner === "draw" ? "Draw" : roundWinner === "player" ? selectedPokemon.name : selectedOpponent.name}`)
      
      // Get current scores for the log
      const currentPlayerWins = roundWinner === "player" ? playerWins + 1 : playerWins
      const currentOpponentWins = roundWinner === "opponent" ? opponentWins + 1 : opponentWins
      newLog.push(`Score: Player ${currentPlayerWins} - Opponent ${currentOpponentWins}`)

      setBattleLog(newLog)

      // Check if any player has won 3 rounds
      const updatedPlayerWins = roundWinner === "player" ? playerWins + 1 : playerWins
      const updatedOpponentWins = roundWinner === "opponent" ? opponentWins + 1 : opponentWins

      if (updatedPlayerWins >= 3 || updatedOpponentWins >= 3) {
        // Battle over
        const finalWinner = updatedPlayerWins >= 3 ? "player" : "opponent"
        setWinner(finalWinner)
        setWinningTeam(finalWinner)
        saveBattleResult(finalWinner, newLog)
      } else {
        // Prepare for next round
        setRound(round + 1)
        setSelectedPokemon(null)
        setSelectedOpponent(null)
      }
    } catch (error) {
      console.error("Battle error:", error)
      alert(`Error starting battle: ${error.message}`)
    }
  }

  const saveBattleResult = async (finalWinner, battleLog) => {
    try {
      const battleData = {
        id: Date.now(),
        date: new Date().toISOString(),
        opponent: "Random Trainer",
        result: finalWinner === "player" ? "win" : "loss",
        yourTeam: yourTeam,
        opponentTeam: opponentTeam,
        battleLog: battleLog,
        totalWins: {
          player: playerWins,
          opponent: opponentWins,
        },
      }

      await axios.post("http://localhost:3001/battles", battleData)
      console.log("Battle result saved successfully")
    } catch (error) {
      console.error("Error saving battle result:", error)
    }
  }

  if (loading) {
    return (
      <div className="battle-container">
        <div className="loading">Loading Pokémon teams...</div>
      </div>
    )
  }

  return (
    <div className="battle-container">
      <div className="battle-header">
        <h2>Pokémon Battle</h2>
        <RouterLink to="/" className="back-button">
          Back to Home
        </RouterLink>
      </div>

      <div className="battle-field">
        <div className="battle-teams">
          <div className={`team-section your-team ${winningTeam === "player" ? "winner" : ""}`}>
            <h3>Your Team</h3>
            <div className="team-pokemon">
              {yourTeam.map((pokemon) => (
                <div
                  key={pokemon.id}
                  className={`pokemon-battle-card ${selectedPokemon?.id === pokemon.id ? "selected" : ""} ${winningTeam === "player" ? "winner" : ""} ${defeatedPokemon.player.includes(pokemon.id) ? "defeated" : ""}`}
                  onClick={() => !defeatedPokemon.player.includes(pokemon.id) && selectPokemon(pokemon)}
                >
                  <div className="pokemon-name">{pokemon.name}</div>
                  <img src={pokemon.sprites.front_default || "/placeholder.svg"} alt={pokemon.name} />
                  <div className="pokemon-stats">
                    <div className="stat-bar">
                      <div className="stat-fill" style={{ width: "100%" }}></div>
                    </div>
                  </div>
                  {defeatedPokemon.player.includes(pokemon.id) && <div className="defeated-overlay">X</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="battle-log-container">
  <h3>Battle Log</h3>
  <div className="battle-log">
    {battleLog.map((log, index) => (
      <div 
        key={index} 
        className={`log-entry 
          ${log.toLowerCase().includes('winner') ? 'log-winner' : ''}
          ${log.toLowerCase().includes('hp') ? 'log-hp' : ''}
          ${log.toLowerCase().includes('attack') ? 'log-attack' : ''}
          ${log.toLowerCase().includes('defense') ? 'log-defense' : ''}
          ${log.toLowerCase().includes('special attack') ? 'log-special-attack' : ''}
          ${log.toLowerCase().includes('special defense') ? 'log-special-defense' : ''}
          ${log.toLowerCase().includes('speed') ? 'log-speed' : ''}
        `}
      >
        {log}
      </div>
    ))}
  </div>
</div>


          

          <div className={`team-section opponent-team ${winningTeam === "opponent" ? "winner" : ""}`}>
            <h3>Opponent's Team</h3>
            <div className="team-pokemon">
              {opponentTeam.map((pokemon) => (
                <div
                  key={pokemon.id}
                  className={`pokemon-battle-card ${selectedOpponent?.id === pokemon.id ? "selected" : ""} ${winningTeam === "opponent" ? "winner" : ""} ${defeatedPokemon.opponent.includes(pokemon.id) ? "defeated" : ""}`}
                  onClick={() => !defeatedPokemon.opponent.includes(pokemon.id) && selectOpponent(pokemon)}
                >
                  <div className="pokemon-name">{pokemon.name}</div>
                  <img src={pokemon.sprites.front_default || "/placeholder.svg"} alt={pokemon.name} />
                  <div className="pokemon-stats">
                    <div className="stat-bar">
                      <div className="stat-fill" style={{ width: "100%" }}></div>
                    </div>
                  </div>
                  {defeatedPokemon.opponent.includes(pokemon.id) && <div className="defeated-overlay">X</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {!winner && (
          <div className="battle-controls">
            <div className="selection-status">
              {!selectedPokemon && <p>Select Your Pokémon</p>}
              {!selectedOpponent && <p>Select Opponent's Pokémon</p>}
            </div>
            <button
              className="show-winner-button"
              onClick={showWinner}
              disabled={!selectedPokemon || !selectedOpponent}
            >
              Start Round {round}
            </button>
          </div>
        )}

        {winner && (
          <div className="battle-result">
            <h2>{winner === "player" ? "You Won the Battle!" : "You Lost the Battle!"}</h2>
            {firstRoundWinner && (
              <div className="first-round-score">
                <h3>Round 1 Winner: {firstRoundWinner === "player" ? "You" : "Opponent"}</h3>
                <p>Score: {firstRoundWinner === "player" ? "1-0" : "0-1"}</p>
              </div>
            )}
            <div className="battle-stats">
              {battleLog.map((log, index) => (
                <div key={index} className="stat-entry">
                  {log}
                </div>
              ))}
            </div>
            <button className="new-battle-button" onClick={() => navigate("/battle")}>
              Start New Battle
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PokemonBattle
