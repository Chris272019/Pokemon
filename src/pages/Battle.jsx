"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Link as RouterLink, useNavigate } from "react-router-dom"

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://pokemon-backend-h8df.onrender.com';

const Battle = () => {
  const [yourTeam, setYourTeam] = useState([])
  const [opponentTeam, setOpponentTeam] = useState([])
  const [selectedDeck, setSelectedDeck] = useState(null)
  const [decks, setDecks] = useState([])
  const [battleLog, setBattleLog] = useState([])
  const [isBattling, setIsBattling] = useState(false)
  const [currentTurn, setCurrentTurn] = useState("player")
  const [winner, setWinner] = useState(null)
  const [winningTeam, setWinningTeam] = useState(null)
  const [selectedPokemon, setSelectedPokemon] = useState(null)
  const [selectedOpponent, setSelectedOpponent] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    fetchDecks()
  }, [])

  const fetchDecks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/decks`)
      console.log("Fetched decks:", response.data) // Debug log
      setDecks(response.data)
    } catch (error) {
      console.error("Error fetching decks:", error)
    }
  }

  const selectDeck = async (deck) => {
    try {
      console.log("Selected deck:", deck)
      setSelectedDeck(deck)
      let team = []
      // If the deck already has pokemon data, use it directly
      if (deck.pokemon) {
        team = deck.pokemon
      } else {
        // Otherwise fetch the pokemon data
        const response = await axios.get(`${API_BASE_URL}/api/decks/${deck.id}`)
        team = response.data.pokemon || []
      }

      // Fetch complete data for each Pokémon
      const completeTeam = await Promise.all(
        team.map(async (pokemon) => {
          try {
            const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`)
            return {
              id: response.data.id,
              name: response.data.name,
              sprites: {
                front_default: response.data.sprites.front_default,
              },
              stats: response.data.stats.map((stat) => ({
                stat: { name: stat.stat.name },
                base_stat: stat.base_stat,
              })),
            }
          } catch (error) {
            console.error(`Error fetching data for Pokémon ${pokemon.id}:`, error)
            return pokemon // Return original data if fetch fails
          }
        })
      )

      setYourTeam(completeTeam)
    } catch (error) {
      console.error("Error selecting deck:", error)
    }
  }

  const generateOpponentTeam = async () => {
    try {
      const opponentTeam = []
      const teamSize = 6 // Number of Pokémon in the team

      // Generate 6 random Pokémon IDs (from 1 to 151 for Gen 1)
      const pokemonIds = Array.from({ length: teamSize }, () =>
        Math.floor(Math.random() * 151) + 1
      )

      // Fetch each Pokémon's complete data
      const opponentPromises = pokemonIds.map(id => 
        axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`)
      )

      const responses = await Promise.all(opponentPromises)
      const formattedTeam = responses.map(response => ({
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

      setOpponentTeam(formattedTeam)
      console.log("Generated opponent team:", formattedTeam)
      return formattedTeam
    } catch (error) {
      console.error("Error generating opponent team:", error)
      // Fallback to a default team if the API call fails
      const defaultTeam = [{
        id: 1,
        name: "bulbasaur",
        sprites: {
          front_default:
            "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
        },
        stats: [
          { stat: { name: "hp" }, base_stat: 45 },
          { stat: { name: "attack" }, base_stat: 49 },
          { stat: { name: "defense" }, base_stat: 49 },
          { stat: { name: "special-attack" }, base_stat: 65 },
          { stat: { name: "special-defense" }, base_stat: 65 },
          { stat: { name: "speed" }, base_stat: 45 },
        ],
      }]
      setOpponentTeam(defaultTeam)
      return defaultTeam
    }
  }

  const startBattle = async () => {
    if (!selectedDeck) {
      alert("Please select a deck first!")
      return
    }

    try {
      // Generate a new random opponent team before starting the battle
      const newOpponentTeam = await generateOpponentTeam()
      
      // Make sure we have both teams before navigating
      if (!yourTeam.length || !newOpponentTeam.length) {
        throw new Error("Teams not properly loaded")
      }

      // Navigate to PokemonBattle page with team data in state
      navigate("/pokemon-battle", { 
        state: { 
          yourTeam: yourTeam,
          opponentTeam: newOpponentTeam,
          selectedDeck: selectedDeck
        } 
      })
    } catch (error) {
      console.error("Error starting battle:", error)
      alert("Failed to generate opponent team. Please try again.")
    }
  }

  return (
    <div className="battle-container">
      <div className="battle-header">
        <h2>Pokémon Battle</h2>
        <RouterLink to="/" className="back-button">
          Back to Home
        </RouterLink>
      </div>

      {!isBattling ? (
        <div className="deck-selection">
          <h3>Select Your Deck</h3>
          <div className="deck-grid">
            {decks.map((deck) => (
              <div
                key={deck.id}
                className={`deck-card ${selectedDeck?.id === deck.id ? "selected" : ""}`}
                onClick={() => selectDeck(deck)}
              >
                <h4>{deck.name}</h4>
                <div className="deck-pokemon">
                  {deck.pokemon &&
                    deck.pokemon.map((p) => (
                      <img
                        key={p.id}
                        src={
                          p.sprites?.front_default ||
                          "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png" ||
                          "/placeholder.svg"
                        }
                        alt={p.name}
                        className="pokemon-preview"
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
          {selectedDeck && (
            <button className="start-battle-button" onClick={startBattle}>
              Start Battle
            </button>
          )}
        </div>
      ) : (
        // ... battle UI unchanged ...
        <div>Battle UI here</div>
      )}
    </div>
  )
}

export default Battle
