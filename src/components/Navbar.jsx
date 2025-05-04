import { Link } from "react-router-dom"
import { useState } from "react"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">PokéApp</Link>
      </div>

      <button className="hamburger" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>

      <ul className={`navbar-links ${isOpen ? "active" : ""}`}>
        <li><Link to="/pokemon">Pokédex</Link></li>
        <li><Link to="/team">My Team</Link></li>
        <li><Link to="/battle">Battle</Link></li>
        <li><Link to="/battle-results">Battle History</Link></li>
        <li><Link to="/decks">Decks</Link></li>
      </ul>
    </nav>
  )
}

export default Navbar
