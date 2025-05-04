"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004';

const PokemonDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pokemon, setPokemon] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`)
        setPokemon(response.data)
      } catch (error) {
        setError("Failed to fetch Pokémon details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchPokemon()
  }, [id])

  const addToTeam = async () => {
    try {
      // Check if team exists
      const response = await axios.get(`${API_BASE_URL}/api/teams`)
      const currentTeam = response.data || []

      // Check if team is full
      if (currentTeam.length >= 6) {
        setError("Your team already has 6 Pokémon!")
        return
      }

      // Check if Pokémon is already in team
      if (currentTeam.some((p) => p.id === pokemon.id)) {
        setError("This Pokémon is already in your team!")
        return
      }

      // Add Pokémon to team with all necessary data
      const teamResponse = await axios.post(`${API_BASE_URL}/api/teams`, {
        id: pokemon.id,
        name: pokemon.name,
        sprites: pokemon.sprites,
        types: pokemon.types,
        stats: pokemon.stats,
        abilities: pokemon.abilities,
        moves: pokemon.moves,
        createdAt: new Date().toISOString()
      })

      if (!teamResponse.data) {
        throw new Error('No response data from server')
      }

      // Show success message
      const successMessage = document.createElement("div")
      successMessage.className = "success-message"
      successMessage.textContent = `${pokemon.name} added to your team!`
      document.body.appendChild(successMessage)
      setTimeout(() => {
        successMessage.remove()
        navigate("/team")
      }, 2000)

      // Clear any previous errors
      setError(null)
    } catch (error) {
      console.error("Error adding to team:", error)
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(`Server error: ${error.response.data?.error || error.response.statusText}`)
      } else if (error.request) {
        // The request was made but no response was received
        setError("No response from server. Please check your internet connection.")
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Error: ${error.message}`)
      }
    }
  }

  if (loading) {
    return (
      <div className="pokedex-container">
        <div className="pokedex-screen">
          <div className="loading">Loading Pokédex data...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pokedex-container">
        <div className="pokedex-screen">
          <div className="error">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="pokedex-container">
      <div className="control-panel">
        <div className="led-light"></div>
        <button className="pokedex-button" onClick={() => navigate(-1)}>
          ◀ Back
        </button>
      </div>

      <div className="pokedex-screen">
        <div className="pokemon-detail">
          <div className="pokemon-header">
            <img
              src={pokemon.sprites.front_default || "/placeholder.svg"}
              alt={pokemon.name}
              className="pokemon-image large"
            />
            <h1 className="pokemon-name">{pokemon.name}</h1>
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

          <div className="pokemon-info">
            <div className="info-section">
              <h2>Abilities</h2>
              <div className="abilities-list">
                {pokemon.abilities.map((ability) => (
                  <span key={ability.ability.name} className="ability-badge">
                    {ability.ability.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="info-section">
              <h2>Stats</h2>
              <div className="stats-grid">
                {pokemon.stats.map((stat) => (
                  <div key={stat.stat.name} className="stat-item">
                    <div className="stat-label">{formatStatName(stat.stat.name)}</div>
                    <div className="stat-bar">
                      <div
                        className="stat-fill"
                        style={{
                          width: `${(stat.base_stat / 255) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="stat-value">{stat.base_stat}</div>
                  </div>
                ))}
              </div>
            </div>

            <button className="pokedex-button add-team-button" onClick={addToTeam}>
              Add to Team
            </button>
          </div>
        </div>
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

const formatStatName = (statName) => {
  return statName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export default PokemonDetail
