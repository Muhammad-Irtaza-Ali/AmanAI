import { motion } from 'framer-motion'
import { FiVolume2 } from 'react-icons/fi'
import { SeverityBadge } from '../common/Card'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import { useTranslation } from '../../i18n/useTranslation'

/**
 * Single chat message bubble.
 */
export default function ChatBubble({ message, language = 'en' }) {
  const { speak, isSpeaking, isSupported } = useSpeechSynthesis()
  const { t } = useTranslation()
  const isUser = message.role === 'user'
  const isRtl = language === 'ur' || language === 'sd'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div className={`max-w-[80%] md:max-w-[65%] ${isUser ? '' : ''}`}>
        {/* Message bubble */}
        <div className={`${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'} ${isRtl ? 'text-right' : ''}`}>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>

          {/* Classification badge (for AI messages) */}
          {message.classification && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                {message.classification.category}
              </span>
              <SeverityBadge severity={message.classification.severity} />
            </div>
          )}
        </div>

        {/* First Aid guidance (for AI messages) */}
        {message.firstAid && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 p-4 rounded-xl bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800"
          >
            <h4 className="text-sm font-semibold text-accent-700 dark:text-accent-400 mb-2">
              {t('chat.immediate_actions')}
            </h4>
            <ul className="space-y-1">
              {message.firstAid.immediate_actions.map((action, i) => (
                <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex gap-2">
                  <span className="text-accent-500 font-bold">{i + 1}.</span> {action}
                </li>
              ))}
            </ul>

            {message.firstAid.do_not.length > 0 && (
              <>
                <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mt-3 mb-1">
                  {t('chat.do_not')}
                </h4>
                <ul className="space-y-1">
                  {message.firstAid.do_not.map((item, i) => (
                    <li key={i} className="text-xs text-red-600 dark:text-red-400">
                      ✕ {item}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">
              {message.firstAid.seek_medical_help}
            </p>
          </motion.div>
        )}

        {/* TTS button for AI messages */}
        {!isUser && isSupported && (
          <button
            onClick={() => speak(message.content, language)}
            disabled={isSpeaking}
            className="mt-1 p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            title={t('chat.read_aloud')}
          >
            <FiVolume2 className="w-4 h-4" />
          </button>
        )}

        <p className={`text-[10px] text-gray-400 mt-1 ${isUser ? 'text-right' : ''}`}>
          {message.timestamp}
        </p>
      </div>
    </motion.div>
  )
}
