import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiMessageCircle, FiActivity, FiMapPin, FiFileText,
  FiShield, FiPhone, FiGlobe, FiAlertTriangle
} from 'react-icons/fi'
import { useTranslation } from '../i18n/useTranslation'

const FEATURES = [
  {
    icon: FiMessageCircle,
    titleKey: 'home.feature.chat.title',
    descKey: 'home.feature.chat.desc',
    color: 'primary',
    link: '/chat',
  },
  {
    icon: FiActivity,
    titleKey: 'home.feature.dashboard.title',
    descKey: 'home.feature.dashboard.desc',
    color: 'secondary',
    link: '/dashboard',
  },
  {
    icon: FiMapPin,
    titleKey: 'home.feature.hospitals.title',
    descKey: 'home.feature.hospitals.desc',
    color: 'accent',
    link: '/hospitals',
  },
  {
    icon: FiFileText,
    titleKey: 'home.feature.reports.title',
    descKey: 'home.feature.reports.desc',
    color: 'warning',
    link: '/reports',
  },
]

const EMERGENCY_NUMBERS = [
  { key: 'home.helpline.rescue', number: '1122', icon: FiAlertTriangle, color: 'red' },
  { key: 'home.helpline.police', number: '15', icon: FiShield, color: 'blue' },
  { key: 'home.helpline.fire', number: '16', icon: FiAlertTriangle, color: 'orange' },
  { key: 'home.helpline.ambulance', number: '1122', icon: FiPhone, color: 'green' },
]

const colorMap = {
  primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
  secondary: 'bg-secondary-100 text-secondary-600 dark:bg-secondary-900/30 dark:text-secondary-400',
  accent: 'bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400',
  warning: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
}

export default function Home() {
  const { t } = useTranslation()

  return (
    <div className="pb-24 md:pb-0">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute top-20 -left-32 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-32 w-96 h-96 bg-secondary-400/20 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6"
            >
              <FiShield className="w-4 h-4" />
              {t('home.badge')}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl md:text-7xl font-extrabold mb-6 font-brand"
            >
              <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-accent-500 bg-clip-text text-transparent">
                Nigehban AI
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto"
            >
              {t('home.subtitle')}
            </motion.p>

            {/* Language chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center gap-3 mb-10 flex-wrap"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-sm font-medium">
                <FiGlobe className="w-3.5 h-3.5" /> {t('home.lang.en')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-sm font-medium">
                <FiGlobe className="w-3.5 h-3.5" /> {t('home.lang.ur')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 text-sm font-medium">
                <FiGlobe className="w-3.5 h-3.5" /> {t('home.lang.sd')}
              </span>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/chat">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(37, 99, 235, 0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-8 py-4 bg-primary-600 text-white rounded-2xl font-semibold text-lg shadow-lg shadow-primary-600/25 hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FiMessageCircle className="w-5 h-5" />
                  {t('home.btn.chat')}
                </motion.button>
              </Link>
              <Link to="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl font-semibold text-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FiActivity className="w-5 h-5" />
                  {t('home.btn.dashboard')}
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('home.features')}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <Link key={feature.link} to={feature.link}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  className="glass-card p-6 h-full cursor-pointer group"
                >
                  <div className={`w-14 h-14 rounded-2xl ${colorMap[feature.color]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {t(feature.descKey)}
                  </p>
                </motion.div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Emergency Numbers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="glass-card p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <FiAlertTriangle className="w-6 h-6 text-red-500" />
            {t('home.helpline.title')}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {EMERGENCY_NUMBERS.map((item, idx) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-4 rounded-2xl bg-${item.color}-50 dark:bg-${item.color}-900/20 text-center`}
                >
                  <Icon className={`w-8 h-8 mx-auto mb-2 text-${item.color}-500`} />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.number}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t(item.key)}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </section>
    </div>
  )
}
