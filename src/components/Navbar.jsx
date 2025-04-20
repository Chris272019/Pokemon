import { Link } from "react-router-dom"

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">PokéApp</Link>
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/pokemon">Pokédex</Link>
        </li>
        <li>
          <Link to="/team">My Team</Link>
        </li>
        <li>
          <Link to="/battle">Battle</Link>
        </li>
        <li>
          <Link to="/battle-results">Battle History</Link>
        </li>
        <li>
          <Link to="/decks">Decks</Link>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
