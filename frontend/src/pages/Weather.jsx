import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FiCloud, FiDroplet, FiWind, FiThermometer, FiAlertTriangle, FiSearch, FiMapPin
} from 'react-icons/fi'
import { getWeather } from '../services/api'
import { useApp } from '../contexts/AppContext'
import { useTranslation } from '../i18n/useTranslation'
import { Spinner } from '../components/common/Card'

export default function Weather() {
  const { t } = useTranslation()
  const { userLocation, setUserLocation } = useApp()
  const [weather, setWeather] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [city, setCity] = useState('')
  const [searchCity, setSearchCity] = useState('')
  const [useGeo, setUseGeo] = useState(true)

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true)
      setError('')
      try {
        if (useGeo && userLocation) {
          const data = await getWeather(searchCity || 'Karachi', userLocation.lat, userLocation.lon)
          setWeather(data)
        } else {
          const data = await getWeather(searchCity || 'Karachi')
          setWeather(data)
        }
      } catch (err) {
        console.error('Weather fetch error:', err)
        setWeather(null)
        setError(err?.response?.data?.detail || err?.message || t('weather.error'))
      } finally {
        setLoading(false)
      }
    }
    fetchWeather()
  }, [searchCity, userLocation, useGeo])

  const handleSearch = (e) => {
    e.preventDefault()
    setUseGeo(false)
    setSearchCity(city)
  }

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude })
          setUseGeo(true)
        },
        () => {},
        { timeout: 10000 }
      )
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
      >
        {t('weather.title')}
      </motion.h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        {t('weather.subtitle')}
      </p>

      {/* Search + Location bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8 max-w-xl">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={t('weather.placeholder')}
            className="input-field flex-1"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="btn-secondary flex items-center gap-2"
          >
            <FiSearch className="w-4 h-4" />
            {t('weather.search')}
          </motion.button>
        </form>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleUseLocation}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all text-sm ${
            useGeo && userLocation
              ? 'bg-primary-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <FiMapPin className="w-4 h-4" />
          {t('weather.use_location')}
        </motion.button>
      </div>

      {/* Location status */}
      {useGeo && !userLocation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-4 mb-6 border-l-4 border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/20"
        >
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            {t('weather.location_needed')}
          </p>
        </motion.div>
      )}

      {loading ? (
        <Spinner size="lg" />
      ) : error ? (
        <div className="glass-card p-6 border-l-4 border-l-red-500 bg-red-50/60 dark:bg-red-900/20">
          <p className="font-semibold text-red-700 dark:text-red-300 mb-1">
            {t('weather.error')}
          </p>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : weather ? (
        <div className="space-y-6">
          {/* Main weather card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{weather.city}</h2>
                <p className="text-gray-500 dark:text-gray-400">{weather.condition}</p>
                {useGeo && userLocation && (
                  <p className="text-xs text-primary-600 dark:text-primary-400 mt-1 flex items-center gap-1">
                    <FiMapPin className="w-3 h-3" /> {t('weather.using_location')}
                  </p>
                )}
              </div>
              {weather.icon && (
                <img
                  src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                  alt={weather.condition}
                  className="w-20 h-20"
                />
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                <FiThermometer className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {weather.temperature}°C
                </p>
                <p className="text-xs text-gray-500">{t('weather.temperature')}</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-cyan-50 dark:bg-cyan-900/20">
                <FiDroplet className="w-6 h-6 text-cyan-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {weather.humidity}%
                </p>
                <p className="text-xs text-gray-500">{t('weather.humidity')}</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
                <FiWind className="w-6 h-6 text-green-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {weather.wind_speed}
                </p>
                <p className="text-xs text-gray-500">{t('weather.wind')}</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                <FiCloud className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                  {weather.condition}
                </p>
                <p className="text-xs text-gray-500">{t('weather.condition')}</p>
              </div>
            </div>
          </motion.div>

          {/* Alerts */}
          {weather.alerts?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6 border-l-4 border-l-primary-600"
            >
              <div className="flex items-center gap-2 mb-4">
                <FiAlertTriangle className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('weather.active_alerts')}
                </h3>
              </div>
              <ul className="space-y-3">
                {weather.alerts.map((alert, i) => (
                  <li
                    key={i}
                    className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-sm text-red-800 dark:text-red-300 font-medium"
                  >
                    {alert}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {(!weather.alerts || weather.alerts.length === 0) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-6 text-center"
            >
              <p className="text-accent-500 font-medium">{t('weather.no_alerts')}</p>
              <p className="text-sm text-gray-500 mt-1">{t('weather.no_alerts_sub')}</p>
            </motion.div>
          )}
        </div>
      ) : (
        <p className="text-gray-500">{t('weather.error')}</p>
      )}
    </div>
  )
}
