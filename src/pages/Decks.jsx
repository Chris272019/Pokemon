"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import AddDeckButton from "../components/AddDeckButton"

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://pokemon-backend-h8df.onrender.com';

const Decks = () => {
  const [decks, setDecks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDeck, setSelectedDeck] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deckToDelete, setDeckToDelete] = useState(null)

  useEffect(() => {
    fetchDecks()
  }, [])

  const fetchDecks = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${API_BASE_URL}/api/decks`)
      setDecks(response.data)
    } catch (error) {
      setError("Failed to fetch decks. Please try again later.")
      console.error("Error fetching decks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeckAdded = (newDeck) => {
    setDecks([...decks, newDeck])
  }

  const deleteDeck = async (deckId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/decks/${deckId}`)
      setDecks(decks.filter((deck) => deck.id !== deckId))
      setShowDeleteModal(false)
      setDeckToDelete(null)
    } catch (error) {
      console.error("Error deleting deck:", error)
      setError("Failed to delete deck. Please try again.")
    }
  }

  const confirmDeleteDeck = (deck) => {
    setDeckToDelete(deck)
    setShowDeleteModal(true)
  }

  const loadDeckToTeam = async (deck) => {
    try {
      // Check if team is empty
      const teamResponse = await axios.get(`${API_BASE_URL}/api/teams`)
      if (teamResponse.data.length > 0) {
        if (!window.confirm("Loading this deck will replace your current team. Continue?")) {
          return
        }

        // Clear current team
        for (const pokemon of teamResponse.data) {
          await axios.delete(`${API_BASE_URL}/api/teams/${pokemon.id}`)
        }
      }

      // Add deck Pokémon to team
      for (const pokemon of deck.pokemon) {
        await axios.post(`${API_BASE_URL}/api/teams`, {
          ...pokemon,
          teamId: Date.now() + Math.random(), // Ensure unique ID
        })
      }

      // Show success message
      const successMessage = document.createElement("div")
      successMessage.className = "success-message"
      successMessage.textContent = `Deck "${deck.name}" loaded to team!`
      document.body.appendChild(successMessage)

      setTimeout(() => {
        successMessage.remove()
        window.location.href = "/team"
      }, 1500)
    } catch (error) {
      console.error("Error loading deck to team:", error)
      setError("Failed to load deck to team. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="decks-container">
        <div className="loading">Loading decks...</div>
      </div>
    )
  }

  return (
    <div className="decks-container">
      <div className="decks-header">
        <h2>My Decks</h2>
        <AddDeckButton onDeckAdded={handleDeckAdded} />
      </div>

      {error && <div className="error-message">{error}</div>}

      {decks.length === 0 ? (
        <div className="empty-decks">
          <h3>You don't have any decks yet!</h3>
          <p>Create a deck to store different Pokémon teams.</p>
        </div>
      ) : (
        <div className="decks-grid">
          {decks.map((deck) => (
            <div
              key={deck.id}
              className={`deck-card ${selectedDeck?.id === deck.id ? "selected" : ""}`}
              onClick={() => setSelectedDeck(deck)}
            >
              <div className="deck-header">
                <h3 className="deck-name">{deck.name}</h3>
                <span className="deck-element" style={{ backgroundColor: getTypeColor(deck.element) }}>
                  {deck.element}
                </span>
              </div>

              <div className="deck-pokemon-preview">
                {deck.pokemon && deck.pokemon.length > 0 ? (
                  deck.pokemon.map((pokemon) => (
                    <img
                      key={pokemon.id}
                      src={pokemon.sprites.front_default || "/placeholder.svg"}
                      alt={pokemon.name}
                      className="pokemon-preview"
                    />
                  ))
                ) : (
                  <div className="empty-deck-message">Empty Deck</div>
                )}
              </div>

              <div className="deck-actions">
                <button
                  className="deck-action-button load-button"
                  onClick={(e) => {
                    e.stopPropagation()
                    loadDeckToTeam(deck)
                  }}
                  disabled={!deck.pokemon || deck.pokemon.length === 0}
                >
                  Load to Team
                </button>
                <button
                  className="deck-action-button delete-button"
                  onClick={(e) => {
                    e.stopPropagation()
                    confirmDeleteDeck(deck)
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Deck</h3>
            <p>Are you sure you want to delete the deck "{deckToDelete.name}"?</p>
            {deckToDelete.pokemon && deckToDelete.pokemon.length > 0 && (
              <p className="warning">This deck contains {deckToDelete.pokemon.length} Pokémon that will be lost!</p>
            )}
            <div className="modal-buttons">
              <button className="confirm-button" onClick={() => deleteDeck(deckToDelete.id)}>
                Yes, Delete
              </button>
              <button
                className="cancel-button"
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeckToDelete(null)
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedDeck && (
        <div className="deck-details-modal">
          <div className="deck-details-content">
            <div className="deck-details-header">
              <h2>{selectedDeck.name}</h2>
              <span className="deck-element" style={{ backgroundColor: getTypeColor(selectedDeck.element) }}>
                {selectedDeck.element}
              </span>
            </div>

            <div className="deck-pokemon-list">
              <h3>Pokémon in this Deck</h3>
              {selectedDeck.pokemon && selectedDeck.pokemon.length > 0 ? (
                <div className="pokemon-grid">
                  {selectedDeck.pokemon.map((pokemon) => (
                    <div key={pokemon.id} className="pokemon-card">
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
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-deck-message">This deck is empty</div>
              )}
            </div>

            <div className="deck-details-actions">
              <button
                className="deck-action-button load-button"
                onClick={() => loadDeckToTeam(selectedDeck)}
                disabled={!selectedDeck.pokemon || selectedDeck.pokemon.length === 0}
              >
                Load to Team
              </button>
              <button className="deck-action-button close-button" onClick={() => setSelectedDeck(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
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

export default Decks
