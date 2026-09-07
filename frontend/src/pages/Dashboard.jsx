import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FiFileText, FiThermometer, FiMapPin, FiActivity,
  FiWind, FiDroplet, FiEye, FiAlertTriangle
} from 'react-icons/fi'
import { getReports, getWeather, getAirQuality, getHospitals } from '../services/api'
import { StatCard, Spinner } from '../components/common/Card'
import { useApp } from '../contexts/AppContext'
import { useTranslation } from '../i18n/useTranslation'

export default function Dashboard() {
  const { userLocation } = useApp()
  const { t } = useTranslation()
  const fallbackCity = 'Karachi'
  const [stats, setStats] = useState(null)
  const [weather, setWeather] = useState(null)
  const [airQuality, setAirQuality] = useState(null)
  const [hospitals, setHospitals] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setErrors({})
        const lat = userLocation?.lat
        const lon = userLocation?.lon
        const hasLocation = lat != null && lon != null
        const [statsData, weatherData, aqData, hospitalData] = await Promise.allSettled([
          getReports(),
          hasLocation ? getWeather(fallbackCity, lat, lon) : getWeather(fallbackCity),
          hasLocation ? getAirQuality(lat, lon) : getAirQuality(24.8607, 67.0011),
          getHospitals(hasLocation ? lat : null, hasLocation ? lon : null, fallbackCity),
        ])

        if (statsData.status === 'fulfilled') setStats({ total_incidents: statsData.value.incidents?.length || 0 })
        if (weatherData.status === 'fulfilled') setWeather(weatherData.value)
        if (weatherData.status === 'rejected') {
          setWeather(null)
          setErrors((prev) => ({
            ...prev,
            weather: weatherData.reason?.response?.data?.detail || weatherData.reason?.message || 'Weather data unavailable',
          }))
        }
        if (aqData.status === 'fulfilled') setAirQuality(aqData.value)
        if (aqData.status === 'rejected') {
          setAirQuality(null)
          setErrors((prev) => ({
            ...prev,
            airQuality: aqData.reason?.response?.data?.detail || aqData.reason?.message || 'Air quality data unavailable',
          }))
        }
        if (hospitalData.status === 'fulfilled') setHospitals(hospitalData.value)
        if (hospitalData.status === 'rejected') {
          setHospitals([])
          setErrors((prev) => ({
            ...prev,
            hospitals: hospitalData.reason?.response?.data?.detail || hospitalData.reason?.message || 'Hospital data unavailable',
          }))
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [userLocation])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  const aqiCategory = getAqiCategory(airQuality?.aqi)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-bold text-gray-900 dark:text-white mb-8"
      >
        {t('dashboard.title')}
      </motion.h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={FiFileText}
          title={t('dashboard.total_reports')}
          value={stats?.total_incidents ?? 0}
          subtitle={t('dashboard.total_reports_sub')}
          color="primary"
        />
        <StatCard
          icon={FiThermometer}
          title={t('dashboard.temperature')}
          value={weather ? `${weather.temperature}°C` : '—'}
          subtitle={weather?.condition || ''}
          color="secondary"
        />
        <StatCard
          icon={FiActivity}
          title={t('dashboard.air_quality')}
          value={airQuality?.aqi ?? '—'}
          subtitle={aqiCategory}
          color="accent"
        />
        <StatCard
          icon={FiMapPin}
          title={t('dashboard.hospitals')}
          value={hospitals.length}
          subtitle={t('dashboard.hospitals_sub')}
          color="warning"
        />
      </div>

      {(errors.weather || errors.airQuality || errors.hospitals) && (
        <div className="space-y-3 mb-6">
          {errors.weather && (
            <div className="glass-card p-4 border-l-4 border-l-red-500 bg-red-50/60 dark:bg-red-900/20">
              <p className="font-semibold text-red-700 dark:text-red-300">Weather unavailable</p>
              <p className="text-sm text-red-600 dark:text-red-400">{errors.weather}</p>
            </div>
          )}
          {errors.airQuality && (
            <div className="glass-card p-4 border-l-4 border-l-red-500 bg-red-50/60 dark:bg-red-900/20">
              <p className="font-semibold text-red-700 dark:text-red-300">Air quality unavailable</p>
              <p className="text-sm text-red-600 dark:text-red-400">{errors.airQuality}</p>
            </div>
          )}
          {errors.hospitals && (
            <div className="glass-card p-4 border-l-4 border-l-red-500 bg-red-50/60 dark:bg-red-900/20">
              <p className="font-semibold text-red-700 dark:text-red-300">Hospitals unavailable</p>
              <p className="text-sm text-red-600 dark:text-red-400">{errors.hospitals}</p>
            </div>
          )}
        </div>
      )}

      {/* Weather Details */}
      {weather && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <FiThermometer className="w-5 h-5 text-secondary-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {weather.city} — {t('dashboard.weather_alerts')}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <WeatherMetric icon={FiThermometer} label={t('weather.temperature')} value={`${weather.temperature}°C`} />
            <WeatherMetric icon={FiDroplet} label={t('weather.humidity')} value={`${weather.humidity}%`} />
            <WeatherMetric icon={FiWind} label={t('weather.wind')} value={`${weather.wind_speed} m/s`} />
            <WeatherMetric icon={FiEye} label={t('weather.condition')} value={weather.condition} />
          </div>
          {weather.alerts?.length > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-2">
                <FiAlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                  {t('weather.active_alerts')}
                </span>
              </div>
              {weather.alerts.map((alert, i) => (
                <p key={i} className="text-sm text-red-600 dark:text-red-300">{alert}</p>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Air Quality */}
      {airQuality && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <FiActivity className="w-5 h-5 text-accent-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('dashboard.aq_details')}
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold ${getAqiColor(airQuality.aqi)}`}>
              {airQuality.aqi}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{aqiCategory}</p>
              {airQuality.health_recommendation && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <span className="font-medium">{t('dashboard.health_rec')}</span>{' '}
                  {airQuality.health_recommendation}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Nearby Hospitals */}
      {hospitals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <FiMapPin className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('dashboard.nearest')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hospitals.slice(0, 4).map((h, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white">{h.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {h.address || t('dashboard.no_address')}
                </p>
                {h.distance_km && (
                  <span className="inline-block mt-2 text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 px-2 py-0.5 rounded-full">
                    {h.distance_km} km
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

function WeatherMetric({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
      <Icon className="w-5 h-5 text-gray-400" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  )
}

function getAqiCategory(aqi) {
  if (aqi == null) return ''
  if (aqi <= 50) return 'Good'
  if (aqi <= 100) return 'Moderate'
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups'
  if (aqi <= 200) return 'Unhealthy'
  if (aqi <= 300) return 'Very Unhealthy'
  return 'Hazardous'
}

function getAqiColor(aqi) {
  if (aqi == null) return 'bg-gray-100 text-gray-600'
  if (aqi <= 50) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  if (aqi <= 100) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
  if (aqi <= 150) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
  if (aqi <= 200) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
}
