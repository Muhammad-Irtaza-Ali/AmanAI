import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Chat ─────────────────────────────────────────────────────────────────────
export const sendChat = async (message, sessionId, language = 'auto') => {
  const { data } = await api.post('/chat', { message, session_id: sessionId, language })
  return data
}

// ─── Classification ───────────────────────────────────────────────────────────
export const classifyEmergency = async (text, language = 'auto') => {
  const { data } = await api.post('/classify', { text, language })
  return data
}

// ─── First Aid ────────────────────────────────────────────────────────────────
export const getFirstAid = async (category, description = '', language = 'en') => {
  const { data } = await api.post('/first-aid', { category, description, language })
  return data
}

// ─── Weather ──────────────────────────────────────────────────────────────────
export const getWeather = async (city = 'Karachi', lat = null, lon = null) => {
  const params = { city }
  if (lat != null && lon != null) {
    params.lat = lat
    params.lon = lon
  }
  const { data } = await api.get('/weather', { params })
  return data
}

// ─── Air Quality ──────────────────────────────────────────────────────────────
export const getAirQuality = async (lat, lon, city = '') => {
  const { data } = await api.get('/air-quality', { params: { lat, lon, city } })
  return data
}

// ─── Hospitals ────────────────────────────────────────────────────────────────
export const getHospitals = async (lat = null, lon = null, city = 'Karachi', radius = 5000) => {
  const params = { radius, limit: 10 }
  if (lat != null && lon != null) {
    params.lat = lat
    params.lon = lon
  } else if (city) {
    params.city = city.trim() || 'Karachi'
  }
  const { data } = await api.get('/hospitals', { params })
  return data
}

// ─── Incidents ────────────────────────────────────────────────────────────────
export const createIncident = async (incident) => {
  const { data } = await api.post('/incident', incident)
  return data
}

export const getIncident = async (id) => {
  const { data } = await api.get(`/incident/${id}`)
  return data
}

export const getReports = async (skip = 0, limit = 50) => {
  const { data } = await api.get('/reports', { params: { skip, limit } })
  return data
}

// ─── Health ───────────────────────────────────────────────────────────────────
export const healthCheck = async () => {
  const { data } = await axios.get(`${BASE_URL.replace('/api', '')}/health`)
  return data
}

export default api
