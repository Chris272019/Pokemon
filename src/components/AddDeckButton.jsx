"use client"

import { useState } from "react"
import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004';

const AddDeckButton = ({ onDeckAdded }) => {
  const [showModal, setShowModal] = useState(false)
  const [deckName, setDeckName] = useState("")
  const [deckElement, setDeckElement] = useState("")
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!deckName.trim()) {
      setError("Please enter a deck name")
      return
    }

    if (!deckElement) {
      setError("Please select an element")
      return
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/decks`, {
        name: deckName,
        element: deckElement,
        pokemon: [],
        createdAt: new Date().toISOString(),
      })

      setShowModal(false)
      setDeckName("")
      setDeckElement("")
      setError(null)

      if (onDeckAdded) {
        onDeckAdded(response.data)
      }
    } catch (error) {
      console.error("Error creating deck:", error)
      setError("Failed to create deck. Please try again.")
    }
  }

  return (
    <>
      <button className="add-deck-button" onClick={() => setShowModal(true)}>
        + New Deck
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create New Deck</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="deckName">Deck Name:</label>
                <input
                  type="text"
                  id="deckName"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  placeholder="Enter deck name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="deckElement">Element:</label>
                <select id="deckElement" value={deckElement} onChange={(e) => setDeckElement(e.target.value)}>
                  <option value="">Select an element</option>
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
              </div>

              <div className="modal-buttons">
                <button type="submit" className="submit-button">
                  Create Deck
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowModal(false)
                    setDeckName("")
                    setDeckElement("")
                    setError(null)
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default AddDeckButton
