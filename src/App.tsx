import { HashRouter, Link, NavLink, Route, Routes } from 'react-router-dom'
import Editor from './pages/Editor'
import Library from './pages/Library'
import Player from './pages/Player'

export default function App() {
  return (
    <HashRouter>
      <header className="header">
        <Link to="/" className="brand">
          <svg viewBox="0 0 64 64" width="28" height="28" aria-hidden="true">
            <rect width="64" height="64" rx="14" fill="#1b1d23" />
            <g stroke="#f5b942" strokeWidth="3" strokeLinecap="round">
              <line x1="12" y1="20" x2="52" y2="20" />
              <line x1="12" y1="32" x2="52" y2="32" />
              <line x1="12" y1="44" x2="52" y2="44" />
            </g>
            <circle cx="24" cy="20" r="5" fill="#f5b942" />
            <circle cx="40" cy="32" r="5" fill="#f5b942" />
            <circle cx="30" cy="44" r="5" fill="#f5b942" />
          </svg>
          <span>TabVault</span>
        </Link>
        <nav className="nav">
          <NavLink to="/" end>
            Biblioteca
          </NavLink>
          <NavLink to="/new">Nueva</NavLink>
        </nav>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<Library />} />
          <Route path="/new" element={<Editor />} />
          <Route path="/edit/:id" element={<Editor />} />
          <Route path="/tab/:id" element={<Player />} />
          <Route path="*" element={<Library />} />
        </Routes>
      </main>
    </HashRouter>
  )
}
