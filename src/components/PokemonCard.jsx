"use client"

import { useState } from "react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"

const PokemonCard = ({ pokemon }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const addToTeam = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      setIsLoading(true)
      setError(null)

      // Check if team is full
      const teamResponse = await axios.get("http://localhost:3001/teams")
      if (teamResponse.data.length >= 6) {
        // Check for empty decks
        const decksResponse = await axios.get("http://localhost:3001/decks")
        const emptyDecks = decksResponse.data.filter((deck) => deck.pokemon.length === 0)

        if (emptyDecks.length === 0) {
          // No empty decks available, suggest creating a new one
          if (window.confirm("Your team is full and there are no empty decks. Would you like to create a new deck?")) {
            navigate("/decks")
          }
          return
        }

        setError("Your team is full! Remove a Pokémon or store your team in a deck.")
        return
      }

      // Check if Pokémon is already in team
      const isInTeam = teamResponse.data.some((p) => p.id === pokemon.id)
      if (isInTeam) {
        setError("This Pokémon is already in your team!")
        return
      }

      // Add to team
      await axios.post("http://localhost:3001/teams", {
        id: pokemon.id,
        name: pokemon.name,
        sprites: pokemon.sprites,
        types: pokemon.types,
      })

      // Show success message
      const successMessage = document.createElement("div")
      successMessage.className = "success-message"
      successMessage.textContent = `${pokemon.name} added to team!`
      document.body.appendChild(successMessage)

      setTimeout(() => {
        successMessage.remove()
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error("Error adding to team:", error)
      setError("Failed to add Pokémon to team. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="pokemon-card">
      <Link to={`/pokemon/${pokemon.id}`} className="pokemon-link">
        <div className="pokemon-card-image">
          <img src={pokemon.sprites.front_default || "/placeholder.svg"} alt={pokemon.name} />
        </div>
        <div className="pokemon-card-name">{pokemon.name}</div>
        <div className="pokemon-card-id">#{pokemon.id}</div>
        <div className="pokemon-card-types">
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
      </Link>
      <button className="add-to-team-button" onClick={addToTeam} disabled={isLoading}>
        {isLoading ? "Adding..." : "Add to Team"}
      </button>
      {error && <div className="error-message">{error}</div>}
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

export default PokemonCard
