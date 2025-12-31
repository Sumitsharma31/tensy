export type SpeakOptions = {
  rate?: number
  pitch?: number
  lang?: string
  volume?: number
  preferredLangs?: string[]
  allowQueue?: boolean
  onStart?: () => void
  onEnd?: () => void
  onError?: () => void
  muted?: boolean
}

export const isSpeechSupported = () => typeof window !== "undefined" && "speechSynthesis" in window

// Detect mobile/iOS for special handling
const isMobile = () => {
  if (typeof window === "undefined") return false
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

const isIOS = () => {
  if (typeof window === "undefined") return false
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

let voicesReadyPromise: Promise<SpeechSynthesisVoice[]> | null = null
let voicesLoaded = false
let speechUnlocked = false

export const preloadVoices = () => {
  if (!isSpeechSupported()) return Promise.resolve<SpeechSynthesisVoice[]>([])
  if (voicesReadyPromise) return voicesReadyPromise

  voicesReadyPromise = new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices()
    if (existing.length) {
      voicesLoaded = true
      resolve(existing)
      return
    }

    const handle = () => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length) {
        voicesLoaded = true
        resolve(voices)
        window.speechSynthesis.removeEventListener("voiceschanged", handle)
      }
    }

    window.speechSynthesis.addEventListener("voiceschanged", handle)
    // Trigger voice loading
    window.speechSynthesis.getVoices()
    
    // Fallback timeout for mobile browsers that may not fire voiceschanged
    setTimeout(() => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length) {
        voicesLoaded = true
        resolve(voices)
        window.speechSynthesis.removeEventListener("voiceschanged", handle)
      } else {
        // Resolve with empty array if no voices after timeout
        resolve([])
      }
    }, 1000)
  })

  return voicesReadyPromise
}

// Unlock speech synthesis on mobile (must be called from user interaction)
export const unlockSpeech = () => {
  if (!isSpeechSupported() || speechUnlocked) return
  
  // Create and immediately cancel a silent utterance to "unlock" speech on mobile
  const utterance = new SpeechSynthesisUtterance("")
  utterance.volume = 0
  window.speechSynthesis.speak(utterance)
  window.speechSynthesis.cancel()
  speechUnlocked = true
  
  // Also preload voices
  preloadVoices()
}

// Preload voices immediately when module loads
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  preloadVoices()
}

export const cancelSpeech = () => {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel()
    pendingCount = 0
  }
}

let cachedVoice: SpeechSynthesisVoice | null = null
let pendingCount = 0
let lastSpeakTime = 0
const MIN_SPEAK_INTERVAL = 150 // Minimum time between speech calls

const pickVoice = (preferredLangs: string[] = ["en-IN", "en-GB", "en-US"]) => {
  if (!isSpeechSupported()) return null

  const voices = window.speechSynthesis.getVoices()
  if (!voices.length && cachedVoice) return cachedVoice
  if (!voices.length) return null

  const lowerPrefs = preferredLangs.map((lang) => lang.toLowerCase())

  const byPreference = lowerPrefs
    .map((pref) => voices.find((v) => v.lang?.toLowerCase().startsWith(pref)))
    .find(Boolean)

  cachedVoice = byPreference ?? voices.find((v) => v.default) ?? voices[0] ?? null
  return cachedVoice
}

export const speakText = (text: string, options?: SpeakOptions) => {
  if (!isSpeechSupported() || options?.muted) return

  const now = Date.now()
  
  // Throttle: if called too quickly, skip
  if (options?.allowQueue && (now - lastSpeakTime) < MIN_SPEAK_INTERVAL) {
    return
  }
  
  lastSpeakTime = now

  // iOS/Mobile workaround: Cancel any existing speech first
  // This helps prevent the "stuck" state on mobile browsers
  if (isMobile()) {
    window.speechSynthesis.cancel()
    pendingCount = 0
  }

  const utterance = new SpeechSynthesisUtterance(text)
  
  // Set rate - mobile sometimes needs slightly different values
  utterance.rate = options?.rate ?? (isMobile() ? 0.9 : 1)
  if (options?.pitch) utterance.pitch = options.pitch
  if (options?.volume !== undefined) utterance.volume = options.volume

  const voice = pickVoice(options?.preferredLangs)
  if (voice) {
    utterance.voice = voice
    utterance.lang = voice.lang
  } else if (options?.lang) {
    utterance.lang = options.lang
  }

  // Track queue to prevent overload
  utterance.onstart = () => {
    pendingCount++
    if (options?.onStart) options.onStart()
  }
  
  utterance.onend = () => {
    pendingCount = Math.max(0, pendingCount - 1)
    if (options?.onEnd) options.onEnd()
  }
  
  utterance.onerror = (event) => {
    pendingCount = Math.max(0, pendingCount - 1)
    // On mobile, some "errors" are actually just cancellations - don't treat as errors
    if (event.error !== 'interrupted' && event.error !== 'canceled') {
      if (options?.onError) options.onError()
    } else {
      // Still call onEnd for interrupted/canceled
      if (options?.onEnd) options.onEnd()
    }
  }

  // Always resume if paused (common browser bug, especially on iOS)
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume()
  }

  // Limit queue size to prevent overwhelming the engine
  if (options?.allowQueue && pendingCount > 2) {
    return utterance
  }

  // For mobile: use direct speak without timeout for better user interaction handling
  if (isMobile()) {
    // Ensure we're not paused
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
    }
    window.speechSynthesis.speak(utterance)
    
    // iOS Safari workaround: sometimes speech gets stuck, add a safety timeout
    if (isIOS()) {
      setTimeout(() => {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume()
        }
      }, 100)
    }
    
    return utterance
  }

  // Only cancel if explicitly not allowing queue (desktop behavior)
  if (!options?.allowQueue && window.speechSynthesis.speaking) {
    cancelSpeech()
    pendingCount = 0
    // Brief delay for clean transition
    setTimeout(() => {
      if (window.speechSynthesis.paused) window.speechSynthesis.resume()
      window.speechSynthesis.speak(utterance)
    }, 80)
    return utterance
  }

  window.speechSynthesis.speak(utterance)

  return utterance
}
