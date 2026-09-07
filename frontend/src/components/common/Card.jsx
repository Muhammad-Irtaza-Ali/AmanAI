import { motion } from 'framer-motion'

/**
 * Reusable glassmorphism card with hover animation.
 */
export default function Card({ children, className = '', hover = true, onClick }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={`glass-card p-6 ${hover ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  )
}

/**
 * Stat card for dashboard metrics.
 */
export function StatCard({ icon: Icon, title, value, subtitle, color = 'primary' }) {
  const colorMap = {
    primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
    secondary: 'bg-secondary-100 text-secondary-600 dark:bg-secondary-900/30 dark:text-secondary-400',
    accent: 'bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400',
    warning: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  }

  return (
    <Card>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </Card>
  )
}

/**
 * Severity badge component.
 */
export function SeverityBadge({ severity }) {
  const cls = {
    Critical: 'severity-critical',
    High: 'severity-high',
    Medium: 'severity-medium',
    Low: 'severity-low',
  }[severity] || 'severity-medium'

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {severity}
    </span>
  )
}

/**
 * Loading spinner.
 */
export function Spinner({ size = 'md' }) {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className="flex justify-center items-center p-4">
      <div className={`${sizeMap[size]} border-4 border-gray-200 dark:border-gray-700 border-t-primary-600 rounded-full animate-spin`} />
    </div>
  )
}
