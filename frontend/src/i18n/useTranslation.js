import { useApp } from '../contexts/AppContext'
import translations from './translations'

/**
 * Hook that returns a translation function for the current language.
 * Usage: const { t } = useTranslation()
 *        t('nav.home') → 'Home' | 'ہوم' | 'گھر'
 */
export function useTranslation() {
  const { language } = useApp()
  const lang = translations[language] || translations.en

  const t = (key) => lang[key] || translations.en[key] || key

  return { t, language }
}
