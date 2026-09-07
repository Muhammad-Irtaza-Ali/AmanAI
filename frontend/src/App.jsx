import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './contexts/AppContext'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import Chat from './pages/Chat'
import Dashboard from './pages/Dashboard'
import Hospitals from './pages/Hospitals'
import Weather from './pages/Weather'
import Reports from './pages/Reports'

export default function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-surface dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/hospitals" element={<Hospitals />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  )
}
