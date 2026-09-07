import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiSend, FiMic, FiMicOff } from 'react-icons/fi'
import ChatBubble from './ChatBubble'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { useApp } from '../../contexts/AppContext'
import { useTranslation } from '../../i18n/useTranslation'
import { sendChat } from '../../services/api'
import { Spinner } from '../common/Card'

export default function ChatWindow() {
  const { sessionId, language } = useApp()
  const { t } = useTranslation()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: t('chat.greeting'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const { transcript, isListening, startListening, stopListening, isSupported: sttSupported } = useSpeechRecognition()

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Update greeting when language changes
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === 'assistant') {
        return [{ ...prev[0], content: t('chat.greeting') }]
      }
      return prev
    })
  }, [language, t])

  // Sync transcript to input
  useEffect(() => {
    if (transcript) setInput(transcript)
  }, [transcript])

  const handleSend = async () => {
    const text = input.trim()
    if (!text) return

    const userMsg = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const res = await sendChat(text, sessionId, language)
      const aiMsg = {
        role: 'assistant',
        content: res.reply,
        classification: res.classification,
        firstAid: res.first_aid,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: t('chat.error'),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-140px)] md:max-h-[calc(100vh-100px)]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {messages.map((msg, i) => (
          <ChatBubble key={i} message={msg} language={language} />
        ))}

        {isLoading && (
          <div className="flex justify-start mb-3">
            <div className="chat-bubble-ai flex items-center gap-2">
              <Spinner size="sm" />
              <span className="text-sm text-gray-500">{t('chat.analyzing')}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex items-end gap-3">
          {/* Voice input */}
          {sttSupported && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={isListening ? stopListening : startListening}
              className={`p-3 rounded-xl transition-colors shrink-0 ${
                isListening
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              title={isListening ? t('chat.voice_stop') : t('chat.voice_start')}
            >
              {isListening ? <FiMicOff className="w-5 h-5" /> : <FiMic className="w-5 h-5" />}
            </motion.button>
          )}

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? t('chat.listening') : t('chat.placeholder')}
              rows={1}
              className="w-full resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder-gray-400 dark:text-white"
            />
          </div>

          {/* Send button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-3 rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <FiSend className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3 max-w-2xl mx-auto">
          {t('chat.disclaimer')}
        </p>
      </div>
    </div>
  )
}
