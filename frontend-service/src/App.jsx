import './App.css'
import { Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Artifacts from './pages/Artifacts.jsx'
import AISearch from './pages/AISearch.jsx'
import Dashboard from './pages/Dashboard.jsx'
import History from './pages/History.jsx'
import ChatBot from './pages/ChatBot.jsx'
import { Content, Header, HeaderName, HeaderNavigation, HeaderMenuItem, Theme } from '@carbon/react'

export default function App() {
  return (
    <Theme theme="white">
      <Header aria-label="IBM Artifact Management Platform" style={{ position: 'sticky', top: 0, zIndex: 9999 }}>
        <HeaderName prefix="IBM">Artifact Management Platform</HeaderName>
        <HeaderNavigation aria-label="App Navigation">
          <HeaderMenuItem as={NavLink} to="/" end>Home</HeaderMenuItem>
          <HeaderMenuItem as={NavLink} to="/artifacts">Artifacts</HeaderMenuItem>
          <HeaderMenuItem as={NavLink} to="/ai">AI Search</HeaderMenuItem>
          <HeaderMenuItem as={NavLink} to="/chat">Chat</HeaderMenuItem>
          <HeaderMenuItem as={NavLink} to="/dashboard">Dashboard</HeaderMenuItem>
        </HeaderNavigation>
      </Header>
      <Content style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/artifacts" element={<Artifacts />} />
          <Route path="/artifacts/:id/history" element={<History />} />
          <Route path="/ai" element={<AISearch />} />
          <Route path="/chat" element={<ChatBot />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Content>
    </Theme>
  )
}
