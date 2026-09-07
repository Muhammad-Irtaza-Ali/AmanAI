import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('aman-dark') === 'true' ||
        (!localStorage.getItem('aman-dark') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    return false
  })

  const [language, setLanguage] = useState(() => localStorage.getItem('aman-lang') || 'en')
  const [sessionId] = useState(() => {
    let id = localStorage.getItem('aman-session')
    if (!id) {
      id = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`
      localStorage.setItem('aman-session', id)
    }
    return id
  })

  const [userLocation, setUserLocation] = useState(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('aman-dark', String(darkMode))
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem('aman-lang', language)
    document.documentElement.lang = language
    document.documentElement.dir = (language === 'ur' || language === 'sd') ? 'rtl' : 'ltr'
  }, [language])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          })
        },
        () => setUserLocation(null),
        { timeout: 10000 }
      )
    }
  }, [])

  const toggleDarkMode = () => setDarkMode((prev) => !prev)

  return (
    <AppContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        language,
        setLanguage,
        sessionId,
        userLocation,
        setUserLocation,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
