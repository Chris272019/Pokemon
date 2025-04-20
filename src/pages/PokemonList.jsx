"use client"

import { useState, useEffect } from "react"
import { Link as RouterLink } from "react-router-dom"
import axios from "axios"

const PokemonList = () => {
  const [pokemon, setPokemon] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [error, setError] = useState(null)

  const fetchPokemon = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=20&offset=${(page - 1) * 20}`)
      const results = response.data.results

      // Fetch additional details for each Pokemon
      const detailedPokemon = await Promise.all(
        results.map(async (p) => {
          const details = await axios.get(p.url)
          return {
            id: details.data.id,
            name: p.name,
            image: details.data.sprites.front_default,
            types: details.data.types.map((t) => t.type.name),
          }
        }),
      )

      setPokemon(detailedPokemon)
      setTotalPages(Math.ceil(response.data.count / 20))
    } catch (error) {
      setError("Failed to fetch Pokémon. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPokemon()
  }, [page])

  const filteredPokemon = pokemon.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="pokedex-container">
      <div className="control-panel">
        <div className="led-light"></div>
        <input
          type="text"
          className="search-bar"
          placeholder="Search Pokémon..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="pokedex-screen">
        {loading ? (
          <div className="loading">Loading Pokédex data...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            <div className="pokemon-grid">
              {filteredPokemon.map((p) => (
                <RouterLink to={`/pokemon/${p.name}`} key={p.id} className="pokemon-card">
                  <img src={p.image || "/placeholder.svg"} alt={p.name} className="pokemon-image" />
                  <div className="pokemon-name">{p.name}</div>
                  <div className="pokemon-types">
                    {p.types.map((type) => (
                      <span
                        key={type}
                        className="pokemon-type"
                        style={{
                          backgroundColor: getTypeColor(type),
                        }}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </RouterLink>
              ))}
            </div>

            <div className="nav-buttons">
              <button
                className="pokedex-button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ◀
              </button>
              <span className="page-indicator">Page {page}</span>
              <button
                className="pokedex-button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                ▶
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Helper function to get color based on Pokemon type
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

export default PokemonList
