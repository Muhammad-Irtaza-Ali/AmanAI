import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * Hook for browser Text-to-Speech (SpeechSynthesis API).
 * Returns { speak, stop, isSpeaking, isSupported }
 */
export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const utteranceRef = useRef(null)

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setIsSupported(true)
    }
  }, [])

  const speak = useCallback((text, lang = 'en') => {
    if (!('speechSynthesis' in window)) return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    const langMap = { en: 'en-US', ur: 'ur-PK', sd: 'sd-PK' }
    utterance.lang = langMap[lang] || lang
    utterance.rate = 0.9
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [])

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [])

  return { speak, stop, isSpeaking, isSupported }
}
