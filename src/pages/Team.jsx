"use client"

import { useState, useEffect } from "react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004';

const Team = () => {
  const navigate = useNavigate()
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPokemon, setSelectedPokemon] = useState(null)
  const [emptyDecks, setEmptyDecks] = useState([])
  const [showDeckModal, setShowDeckModal] = useState(false)
  const [newDeckName, setNewDeckName] = useState("")
  const [newDeckElement, setNewDeckElement] = useState("")
  const [showRemoveAllModal, setShowRemoveAllModal] = useState(false)

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available"
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Date not available"
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  useEffect(() => {
    fetchTeam()
    fetchEmptyDecks()
  }, [])

  const fetchTeam = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${API_BASE_URL}/api/teams`)
      setTeam(response.data)
    } catch (error) {
      console.error("Error removing Pokémon:", error)
      setError(error.response?.data?.message || error.message || "Failed to remove Pokémon. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchEmptyDecks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/decks`)
      const empty = response.data.filter((deck) => deck.pokemon.length === 0)
      setEmptyDecks(empty)
    } catch (error) {
      console.error("Error fetching empty decks:", error)
    }
  }

  const removeFromTeam = async (pokemonId) => {
    try {
      const confirmed = window.confirm("Are you sure you want to remove this Pokémon from your team?")
      if (!confirmed) {
        return
      }
      setError(null)
      const pokemonToRemove = team.find((p) => p.id === pokemonId)
      if (!pokemonToRemove) {
        return
      }
      await confirmRemove(pokemonToRemove.id)
    } catch (error) {
      console.error("Error removing Pokémon:", error)
      setError(error.response?.data?.message || error.message || "Failed to remove Pokémon. Please try again.")
    }
  }

  const confirmRemove = async (id) => {
    try {
      setError(null)
      await axios.delete(`${API_BASE_URL}/api/teams/${id}`)
      await fetchTeam()
    } catch (error) {
      console.error("Error removing Pokémon:", error)
      setError(error.response?.data?.message || error.message || "Failed to remove Pokémon. Please try again.")
    }
  }

  const storeTeamInDeck = async (deckId) => {
    try {
      const deckResponse = await axios.get(`${API_BASE_URL}/api/decks/${deckId}`)
      const deck = deckResponse.data

      if (deck.pokemon.length > 0) {
        setError("This deck already contains Pokémon. Please select an empty deck.")
        return
      }

      await axios.patch(`${API_BASE_URL}/api/decks/${deckId}`, {
        pokemon: team.map((p) => ({
          id: p.id,
          name: p.name,
          sprites: p.sprites,
          types: p.types,
        })),
      })

      for (const pokemon of team) {
        await axios.delete(`${API_BASE_URL}/api/teams/${pokemon.id}`)
      }

      setTeam([])
      setEmptyDecks(prev => prev.filter(d => d.id !== deckId))

      const successMessage = document.createElement("div")
      successMessage.className = "success-message"
      successMessage.textContent = `Team stored in ${deck.name}!`
      document.body.appendChild(successMessage)

      setTimeout(() => {
        successMessage.remove()
        navigate("/decks")
      }, 2000)
    } catch (error) {
      console.error("Error storing team in deck:", error)
      setError("Failed to store team in deck. Please try again.")
    }
  }

  const showPokemonDetails = (pokemon) => {
    setSelectedPokemon(pokemon)
  }

  const getStatColor = (statValue) => {
    if (statValue >= 100) return "#4CAF50"
    if (statValue >= 75) return "#8BC34A"
    if (statValue >= 50) return "#FFC107"
    if (statValue >= 25) return "#FF9800"
    return "#F44336"
  }

  const formatStatName = (statName) => {
    return statName
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const createNewDeck = async () => {
    try {
      if (!newDeckName.trim()) {
        setError("Please enter a deck name")
        return
      }
      if (!newDeckElement.trim()) {
        setError("Please select a deck element")
        return
      }

      const response = await axios.post(`${API_BASE_URL}/api/decks`, {
        name: newDeckName,
        element: newDeckElement,
        pokemon: [],
      })

      await storeTeamInDeck(response.data.id)
      setShowDeckModal(false)
      setNewDeckName("")
      setNewDeckElement("")
    } catch (error) {
      console.error("Error creating new deck:", error)
      setError("Failed to create new deck. Please try again.")
    }
  }

  const removeAllPokemon = async () => {
    try {
      setError(null)
      for (const pokemon of team) {
        await axios.delete(`${API_BASE_URL}/api/teams/${pokemon.id}`)
      }
      await fetchTeam()
      setShowRemoveAllModal(false)
    } catch (error) {
      console.error("Error removing all Pokémon:", error)
      setError("Failed to remove all Pokémon. Please try again.")
      setShowRemoveAllModal(false)
    }
  }

  const handleResetAllData = async () => {
    try {
      // First, get all the data
      const [teams, battles, decks] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/teams`),
        axios.get(`${API_BASE_URL}/api/battles`),
        axios.get(`${API_BASE_URL}/api/decks`)
      ]);

      // Delete in sequence to avoid potential foreign key conflicts
      // First delete battles as they might reference teams or decks
      if (battles.data.length > 0) {
        await Promise.all(
          battles.data.map(battle => 
            axios.delete(`${API_BASE_URL}/api/battles/${battle.id}`)
            .catch(err => console.error(`Failed to delete battle ${battle.id}:`, err))
          )
        );
      }

      // Then delete teams
      if (teams.data.length > 0) {
        await Promise.all(
          teams.data.map(team => 
            axios.delete(`${API_BASE_URL}/api/teams/${team.id}`)
            .catch(err => console.error(`Failed to delete team ${team.id}:`, err))
          )
        );
      }

      // Finally delete decks
      if (decks.data.length > 0) {
        await Promise.all(
          decks.data.map(deck => 
            axios.delete(`${API_BASE_URL}/api/decks/${deck.id}`)
            .catch(err => console.error(`Failed to delete deck ${deck.id}:`, err))
          )
        );
      }
    } catch (error) {
      console.error("Error resetting all data:", error)
      setError("Failed to reset all data. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="pokedex-container">
        <div className="pokedex-screen">
          <div className="loading">Loading your team...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="pokedex-container">
      <div className="control-panel">
        <div className="led-light"></div>
        <div className="team-header">
          <h2>My Team</h2>
          <div className="team-actions">
            <span className="team-count">({team.length}/6)</span>
            {team.length > 0 && (
              <button
                className="pokedex-button remove-all-button"
                onClick={() => setShowRemoveAllModal(true)}
              >
                Remove All
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="pokedex-screen">
        {team.length === 0 ? (
          <div className="empty-team">
            <h3>Your team is empty!</h3>
            <p>Add some Pokémon to get started.</p>
            <RouterLink to="/pokemon" className="pokedex-button">
              Find Pokémon
            </RouterLink>
          </div>
        ) : (
          <>
          {error && (
            <div className="error-message" style={{ color: "red", marginBottom: "1rem" }}>
              {error}
            </div>
          )}
            <div className="team-grid">
              {team.map((pokemon) => (
                <div
                  key={pokemon.id}
                  className={`pokemon-card ${selectedPokemon?.id === pokemon.id ? "selected" : ""}`}
                  onClick={() => showPokemonDetails(pokemon)}
                >
                  <img
                    src={pokemon.sprites.front_default || "/placeholder.svg"}
                    alt={pokemon.name}
                    className="pokemon-image"
                  />
                  <div className="pokemon-name">{pokemon.name}</div>
                  <div className="pokemon-types">
                    {pokemon.types.map((type) => (
                      <span
                        key={type.type.name}
                        className="pokemon-type"
                        style={{
                          backgroundColor: getTypeColor(type.type.name),
                        }}
                      >
                        {type.type.name}
                      </span>
                    ))}
                  </div>
                  <div className="pokemon-added-date">Added: {formatDate(pokemon.createdAt)}</div>
                  <button
                    className="pokedex-button remove-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFromTeam(pokemon.id)
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {team.length === 6 && (
              <div className="team-full-section">
                <h3>Your team is full!</h3>
                {emptyDecks.length > 0 ? (
                  <div className="store-team-section">
                    <p>Store your team in an empty deck:</p>
                    <div className="deck-options">
                      {emptyDecks.map((deck) => (
                        <button key={deck.id} className="store-deck-button" onClick={() => storeTeamInDeck(deck.id)}>
                          Store in {deck.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="create-deck-suggestion">
                    <p>Create a new deck to store your team:</p>
                    <button className="create-deck-button" onClick={() => setShowDeckModal(true)}>
                      Create New Deck
                    </button>
                  </div>
                )}
              </div>
            )}

            {showDeckModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h3>Create New Deck</h3>
                  <input
                    type="text"
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                    placeholder="Enter deck name"
                    className="deck-name-input"
                  />
                  <select
                    value={newDeckElement}
                    onChange={(e) => setNewDeckElement(e.target.value)}
                    className="deck-element-select"
                  >
                    <option value="">Select deck element</option>
                    <option value="normal">Normal</option>
                    <option value="fire">Fire</option>
                    <option value="water">Water</option>
                    <option value="electric">Electric</option>
                    <option value="grass">Grass</option>
                    <option value="ice">Ice</option>
                    <option value="fighting">Fighting</option>
                    <option value="poison">Poison</option>
                    <option value="ground">Ground</option>
                    <option value="flying">Flying</option>
                    <option value="psychic">Psychic</option>
                    <option value="bug">Bug</option>
                    <option value="rock">Rock</option>
                    <option value="ghost">Ghost</option>
                    <option value="dragon">Dragon</option>
                    <option value="dark">Dark</option>
                    <option value="steel">Steel</option>
                    <option value="fairy">Fairy</option>
                  </select>
                  <div className="modal-buttons">
                    <button className="pokedex-button" onClick={createNewDeck}>
                      Create Deck
                    </button>
                    <button
                      className="pokedex-button cancel-button"
                      onClick={() => {
                        setShowDeckModal(false)
                        setNewDeckName("")
                        setNewDeckElement("")
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showRemoveAllModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h3>Remove All Pokémon</h3>
                  <p>Are you sure you want to remove all Pokémon from your team?</p>
                  <div className="pokemon-preview">
                    <p>This will remove {team.length} Pokémon from your team.</p>
                  </div>
                  <div className="modal-buttons">
                    <button className="pokedex-button confirm-button" onClick={removeAllPokemon}>
                      Yes, Remove All
                    </button>
                    <button className="pokedex-button cancel-button" onClick={() => setShowRemoveAllModal(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {selectedPokemon && (
          <div className="pokemon-details-modal">
            <div className="pokemon-details-content">
              <div className="pokemon-details-header">
                <img
                  src={selectedPokemon.sprites.front_default || "/placeholder.svg"}
                  alt={selectedPokemon.name}
                  className="pokemon-details-image"
                />
                <h2 className="pokemon-details-name">
                  {selectedPokemon.name.charAt(0).toUpperCase() + selectedPokemon.name.slice(1)}
                </h2>
                <div className="pokemon-types">
                  {selectedPokemon.types.map((type) => (
                    <span
                      key={type.type.name}
                      className="pokemon-type"
                      style={{
                        backgroundColor: getTypeColor(type.type.name),
                      }}
                    >
                      {type.type.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pokemon-stats-section">
                <h3>Base Stats</h3>
                <div className="stats-container">
                  {selectedPokemon.stats.map((stat) => (
                    <div key={stat.stat.name} className="stat-item">
                      <div className="stat-name">{formatStatName(stat.stat.name)}</div>
                      <div className="stat-bar-container">
                        <div
                          className="stat-bar"
                          style={{
                            width: `${(stat.base_stat / 255) * 100}%`,
                            backgroundColor: getStatColor(stat.base_stat),
                          }}
                        ></div>
                      </div>
                      <div className="stat-value">{stat.base_stat}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pokemon-abilities-section">
                <h3>Abilities</h3>
                <div className="abilities-container">
                  {selectedPokemon.abilities.map((ability) => (
                    <div key={ability.ability.name} className="ability-item">
                      {ability.ability.name
                        .split("-")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ")}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pokemon-moves-section">
                <h3>Moves</h3>
                <div className="moves-container">
                  {selectedPokemon.moves.slice(0, 10).map((move) => (
                    <div key={move.move.name} className="move-item">
                      {move.move.name
                        .split("-")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ")}
                    </div>
                  ))}
                </div>
              </div>

              <button className="close-details-button" onClick={() => setSelectedPokemon(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const getTypeColor = (type) => {
  const colors = {
    normal: "#A8A878",
    fire: "#F08030",
    water: "#6890F0",
    electric: "#F8D030",
    grass: "#78C850",
    ice: "#98D8D8",
    fighting: "#C03028",
    poison: "#A040A0",
    ground: "#E0C068",
    flying: "#A890F0",
    psychic: "#F85888",
    bug: "#A8B820",
    rock: "#B8A038",
    ghost: "#705898",
    dragon: "#7038F8",
    dark: "#705848",
    steel: "#B8B8D0",
    fairy: "#EE99AC",
  }
  return colors[type] || "#888888"
}

export default Team
