import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiHome, FiMessageCircle, FiActivity, FiMapPin,
  FiSun, FiFileText, FiMoon, FiSun as FiSunIcon, FiGlobe,
  FiChevronDown
} from 'react-icons/fi'
import { HiShieldCheck } from 'react-icons/hi'
import { useApp } from '../../contexts/AppContext'
import { useTranslation } from '../../i18n/useTranslation'

const NAV_KEYS = [
  { path: '/', key: 'nav.home', icon: FiHome },
  { path: '/chat', key: 'nav.chat', icon: FiMessageCircle },
  { path: '/dashboard', key: 'nav.dashboard', icon: FiActivity },
  { path: '/hospitals', key: 'nav.hospitals', icon: FiMapPin },
  { path: '/weather', key: 'nav.weather', icon: FiSun },
  { path: '/reports', key: 'nav.reports', icon: FiFileText },
]

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ur', label: 'اردو', flag: '🇵🇰' },
  { code: 'sd', label: 'سنڌي', flag: '🟢' },
]

export default function Navbar() {
  const { darkMode, toggleDarkMode, language, setLanguage } = useApp()
  const { t } = useTranslation()
  const location = useLocation()
  const [langOpen, setLangOpen] = useState(false)

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0]

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/10 dark:border-gray-700/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div whileHover={{ rotate: 10 }} className="relative">
              <HiShieldCheck className="w-8 h-8 text-primary-600" />
            </motion.div>
            <span className="text-xl font-black font-brand bg-gradient-to-r from-primary-600 via-purple-600 to-secondary-600 bg-clip-text text-transparent tracking-tight">
              Nigehban AI
            </span>
          </Link>

          {/* Navigation Links — hidden on mobile */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_KEYS.map(({ path, key, icon: Icon }) => {
              const active = location.pathname === path
              return (
                <Link key={path} to={path}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t(key)}
                  </motion.div>
                </Link>
              )
            })}
          </div>

          {/* Right side: Language switcher + Dark mode toggle */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                <FiGlobe className="w-4 h-4" />
                <span className="hidden sm:inline">{currentLang.flag} {currentLang.label}</span>
                <span className="sm:hidden">{currentLang.flag}</span>
                <FiChevronDown className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-44 rounded-xl shadow-lg glass border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                  >
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code)
                          setLangOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          language === lang.code
                            ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 font-semibold'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span>{lang.label}</span>
                        {language === lang.code && (
                          <span className="ml-auto text-primary-600 text-xs">✓</span>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dark mode toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? <FiSunIcon className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile nav — bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/10 dark:border-gray-700/30 z-50">
        <div className="flex justify-around py-2">
          {NAV_KEYS.map(({ path, key, icon: Icon }) => {
            const active = location.pathname === path
            return (
              <Link key={path} to={path} className="flex flex-col items-center gap-0.5">
                <Icon className={`w-5 h-5 ${active ? 'text-primary-600' : 'text-gray-500 dark:text-gray-400'}`} />
                <span className={`text-[10px] ${active ? 'text-primary-600 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                  {t(key)}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
