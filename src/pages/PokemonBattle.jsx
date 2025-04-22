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
  const [currentHP, setCurrentHP] = useState({ player: 0, opponent: 0 })

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

  // Calculate damage based on Attack vs HP
  const calculateDamage = (attacker, defender) => {
    const attack = attacker.stats.find(stat => stat.stat.name === "attack").base_stat
    const defense = defender.stats.find(stat => stat.stat.name === "defense").base_stat
    
    // Basic damage formula: (Attack * 2 / Defense) * Random factor (0.85 to 1.15)
    const randomFactor = 0.85 + Math.random() * 0.3
    const damage = Math.floor((attack * 2 / defense) * randomFactor)
    
    // Ensure minimum damage of 1
    return Math.max(1, damage)
  }

  // Determine who goes first based on Speed
  const determineFirstAttacker = (pokemon1, pokemon2) => {
    const speed1 = pokemon1.stats.find(stat => stat.stat.name === "speed").base_stat
    const speed2 = pokemon2.stats.find(stat => stat.stat.name === "speed").base_stat
    
    // If speeds are equal, randomly choose who goes first
    if (speed1 === speed2) {
      return Math.random() < 0.5 ? "player" : "opponent"
    }
    
    return speed1 > speed2 ? "player" : "opponent"
  }

  // AI opponent behavior
  const aiSelectPokemon = () => {
    // Filter out defeated Pokemon
    const availablePokemon = opponentTeam.filter(p => !defeatedPokemon.opponent.includes(p.id))
    if (availablePokemon.length === 0) return null

    // Simple strategy: Choose Pokemon with highest Attack stat
    return availablePokemon.reduce((best, current) => {
      const currentAttack = current.stats.find(stat => stat.stat.name === "attack").base_stat
      const bestAttack = best.stats.find(stat => stat.stat.name === "attack").base_stat
      return currentAttack > bestAttack ? current : best
    }, availablePokemon[0])
  }

  const showWinner = () => {
    try {
      if (!selectedPokemon || !selectedOpponent) {
        alert("Please select Pokémon from both teams to battle")
        return
      }

      // Initialize HP for both Pokemon
      const playerHP = selectedPokemon.stats.find(stat => stat.stat.name === "hp").base_stat
      const opponentHP = selectedOpponent.stats.find(stat => stat.stat.name === "hp").base_stat
      setCurrentHP({ player: playerHP, opponent: opponentHP })

      // Determine who attacks first
      const firstAttacker = determineFirstAttacker(selectedPokemon, selectedOpponent)
      const newLog = []
      newLog.push(`=== Round ${round}: ${selectedPokemon.name} vs ${selectedOpponent.name} ===`)
      newLog.push(`${firstAttacker === "player" ? selectedPokemon.name : selectedOpponent.name} moves first due to higher Speed!`)

      let currentPlayerHP = playerHP
      let currentOpponentHP = opponentHP
      let roundWinner = null

      // Battle loop
      while (currentPlayerHP > 0 && currentOpponentHP > 0) {
        if (firstAttacker === "player") {
          // Player attacks first
          const damage = calculateDamage(selectedPokemon, selectedOpponent)
          currentOpponentHP -= damage
          newLog.push(`${selectedPokemon.name} deals ${damage} damage to ${selectedOpponent.name}! (HP: ${Math.max(0, currentOpponentHP)})`)

          if (currentOpponentHP <= 0) {
            roundWinner = "player"
            break
          }

          // Opponent attacks
          const oppDamage = calculateDamage(selectedOpponent, selectedPokemon)
          currentPlayerHP -= oppDamage
          newLog.push(`${selectedOpponent.name} deals ${oppDamage} damage to ${selectedPokemon.name}! (HP: ${Math.max(0, currentPlayerHP)})`)

          if (currentPlayerHP <= 0) {
            roundWinner = "opponent"
            break
          }
        } else {
          // Opponent attacks first
          const oppDamage = calculateDamage(selectedOpponent, selectedPokemon)
          currentPlayerHP -= oppDamage
          newLog.push(`${selectedOpponent.name} deals ${oppDamage} damage to ${selectedPokemon.name}! (HP: ${Math.max(0, currentPlayerHP)})`)

          if (currentPlayerHP <= 0) {
            roundWinner = "opponent"
            break
          }

          // Player attacks
          const damage = calculateDamage(selectedPokemon, selectedOpponent)
          currentOpponentHP -= damage
          newLog.push(`${selectedPokemon.name} deals ${damage} damage to ${selectedOpponent.name}! (HP: ${Math.max(0, currentOpponentHP)})`)

          if (currentOpponentHP <= 0) {
            roundWinner = "player"
            break
          }
        }
      }

      // Update battle log with round results
      newLog.push(`Round Winner: ${roundWinner === "player" ? selectedPokemon.name : selectedOpponent.name}`)
      
      if (roundWinner === "player") {
        setPlayerWins(prev => prev + 1)
        setDefeatedPokemon(prev => ({
          ...prev,
          opponent: [...prev.opponent, selectedOpponent.id]
        }))
      } else {
        setOpponentWins(prev => prev + 1)
        setDefeatedPokemon(prev => ({
          ...prev,
          player: [...prev.player, selectedPokemon.id]
        }))
      }

      // Store first round winner
      if (round === 1) {
        setFirstRoundWinner(roundWinner)
      }

      // Get current scores for the log
      const currentPlayerWins = roundWinner === "player" ? playerWins + 1 : playerWins
      const currentOpponentWins = roundWinner === "opponent" ? opponentWins + 1 : opponentWins
      newLog.push(`Score: Player ${currentPlayerWins} - Opponent ${currentOpponentWins}`)

      setBattleLog(prev => [...prev, ...newLog])

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
        // AI selects next Pokemon
        const nextOpponent = aiSelectPokemon()
        setSelectedOpponent(nextOpponent)
      }
    } catch (error) {
      console.error("Battle error:", error)
      alert(`Error during battle: ${error.message}`)
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
        <div className="battle-layout">
          <div className="team-container your-team-container">
            <h3>YOUR TEAM</h3>
            <div className={`team-section your-team ${winningTeam === "player" ? "winner" : ""}`}>
              <div className="team-pokemon">
                {yourTeam.map((pokemon) => (
                  <div
                    key={pokemon.id}
                    className={`pokemon-battle-card ${selectedPokemon?.id === pokemon.id ? "selected" : ""} ${winningTeam === "player" ? "winner" : ""} ${defeatedPokemon.player.includes(pokemon.id) ? "defeated" : ""}`}
                    onClick={() => !defeatedPokemon.player.includes(pokemon.id) && selectPokemon(pokemon)}
                  >
                    <div className="pokemon-name">{pokemon.name}</div>
                    <img src={pokemon.sprites.front_default || "/placeholder.svg"} alt={pokemon.name} />
                    {defeatedPokemon.player.includes(pokemon.id) && <div className="defeated-overlay">X</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="battle-info-container">
            <div className="battle-log-container">
              <h3>BATTLE LOG</h3>
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
                <button className="new-battle-button" onClick={() => navigate("/battle")}>
                  Start New Battle
                </button>
              </div>
            )}
          </div>

          <div className="team-container opponent-team-container">
            <h3>OPPONENT'S TEAM</h3>
            <div className={`team-section opponent-team ${winningTeam === "opponent" ? "winner" : ""}`}>
              <div className="team-pokemon">
                {opponentTeam.map((pokemon) => (
                  <div
                    key={pokemon.id}
                    className={`pokemon-battle-card ${selectedOpponent?.id === pokemon.id ? "selected" : ""} ${winningTeam === "opponent" ? "winner" : ""} ${defeatedPokemon.opponent.includes(pokemon.id) ? "defeated" : ""}`}
                    onClick={() => !defeatedPokemon.opponent.includes(pokemon.id) && selectOpponent(pokemon)}
                  >
                    <div className="pokemon-name">{pokemon.name}</div>
                    <img src={pokemon.sprites.front_default || "/placeholder.svg"} alt={pokemon.name} />
                    {defeatedPokemon.opponent.includes(pokemon.id) && <div className="defeated-overlay">X</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PokemonBattle
