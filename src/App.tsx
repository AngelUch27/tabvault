import { HashRouter, Link, NavLink, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { LogoIcon } from './components/Icons'
import Editor from './pages/Editor'
import Library from './pages/Library'
import Player from './pages/Player'

/** Old links used /tab/:id; keep them working. */
function LegacyRedirect() {
  const { id } = useParams()
  return <Navigate to={`/song/${id}`} replace />
}

export default function App() {
  return (
    <HashRouter>
      <header className="header">
        <Link to="/" className="brand">
          <LogoIcon />
          <span>TabVault</span>
        </Link>
        <nav className="nav">
          <NavLink to="/" end>
            Songs
          </NavLink>
          <NavLink to="/new">New</NavLink>
        </nav>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<Library />} />
          <Route path="/new" element={<Editor />} />
          <Route path="/edit/:id" element={<Editor />} />
          <Route path="/song/:id" element={<Player />} />
          <Route path="/tab/:id" element={<LegacyRedirect />} />
          <Route path="*" element={<Library />} />
        </Routes>
      </main>
    </HashRouter>
  )
}
