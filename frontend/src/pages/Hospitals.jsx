import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiMapPin, FiPhone, FiExternalLink, FiSearch } from 'react-icons/fi'
import { getHospitals } from '../services/api'
import { useApp } from '../contexts/AppContext'
import { useTranslation } from '../i18n/useTranslation'
import { Spinner } from '../components/common/Card'

export default function Hospitals() {
  const { userLocation } = useApp()
  const { t } = useTranslation()
  const [hospitals, setHospitals] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [city, setCity] = useState('')
  const [searchCity, setSearchCity] = useState('')

  useEffect(() => {
    const fetchHospitals = async () => {
      setLoading(true)
      setError('')
      try {
        const lat = userLocation?.lat
        const lon = userLocation?.lon
        const trimmedCity = searchCity.trim()
        const useCitySearch = trimmedCity.length > 0
        const hasLocation = lat != null && lon != null
        const results = await getHospitals(
          useCitySearch ? null : (hasLocation ? lat : null),
          useCitySearch ? null : (hasLocation ? lon : null),
          useCitySearch ? trimmedCity : 'Karachi'
        )
        setHospitals(results)
      } catch (err) {
        console.error('Hospital fetch error:', err)
        setHospitals([])
        setError(err?.response?.data?.detail || err?.message || t('hospitals.not_found'))
      } finally {
        setLoading(false)
      }
    }
    fetchHospitals()
  }, [userLocation, searchCity])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchCity(city)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
      >
        {t('hospitals.title')}
      </motion.h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        {t('hospitals.subtitle')}
      </p>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-md">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder={t('hospitals.placeholder')}
          className="input-field flex-1"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="btn-secondary flex items-center gap-2"
        >
          <FiSearch className="w-4 h-4" />
          {t('hospitals.search')}
        </motion.button>
      </form>

      {(searchCity.trim() || userLocation) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-4 mb-6"
        >
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {searchCity.trim() ? (
              <>
                Showing hospitals for <span className="font-semibold">{searchCity.trim()}</span>.
              </>
            ) : (
              <>Showing hospitals near your current location.</>
            )}
          </p>
        </motion.div>
      )}

      {/* Location notice */}
      {!userLocation && !searchCity.trim() && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-4 mb-6 border-l-4 border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/20"
        >
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            {t('hospitals.no_location')} &quot;Karachi&quot;.
            {t('hospitals.allow_location')}
          </p>
        </motion.div>
      )}

      {/* Hospital list */}
      {loading ? (
        <Spinner size="lg" />
      ) : error ? (
        <div className="glass-card p-6 border-l-4 border-l-red-500 bg-red-50/60 dark:bg-red-900/20">
          <p className="font-semibold text-red-700 dark:text-red-300 mb-1">
            {t('hospitals.not_found')}
          </p>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : hospitals.length === 0 ? (
        <div className="text-center py-12">
          <FiMapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{t('hospitals.not_found')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hospitals.map((hospital, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card p-5 card-hover"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                    {hospital.name}
                  </h3>
                  {hospital.address && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-start gap-1">
                      <FiMapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      {hospital.address}
                    </p>
                  )}
                  {hospital.phone && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                      <FiPhone className="w-3.5 h-3.5" />
                      {hospital.phone}
                    </p>
                  )}
                </div>
                {hospital.distance_km != null && (
                  <span className="text-sm font-mono bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400 px-3 py-1 rounded-lg font-semibold">
                    {hospital.distance_km} km
                  </span>
                )}
              </div>

              {/* Open in Google Maps */}
              <a
                href={hospital.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-secondary-600 hover:text-secondary-700 transition-colors"
              >
                <FiExternalLink className="w-4 h-4" />
                {t('hospitals.open_maps')}
              </a>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
