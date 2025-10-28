import './App.css'
import { Routes, Route, Link, NavLink } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Artifacts from './pages/Artifacts.jsx'
import AISearch from './pages/AISearch.jsx'

export default function App() {
  return (
    <div>
      <header style={{ padding: '12px 16px', borderBottom: '1px solid #eee' }}>
        <nav style={{ display: 'flex', gap: 16 }}>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/artifacts">Artifacts</NavLink>
          <NavLink to="/ai">AI Search</NavLink>
        </nav>
      </header>
      <main style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/artifacts" element={<Artifacts />} />
          <Route path="/ai" element={<AISearch />} />
        </Routes>
      </main>
    </div>
  )
}
