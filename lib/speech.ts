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

let voicesReadyPromise: Promise<SpeechSynthesisVoice[]> | null = null
let voicesLoaded = false

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
  })

  return voicesReadyPromise
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

  const utterance = new SpeechSynthesisUtterance(text)
  if (options?.rate) utterance.rate = options.rate
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
  
  utterance.onerror = () => {
    pendingCount = Math.max(0, pendingCount - 1)
    if (options?.onError) options.onError()
  }

  // Always resume if paused (common browser bug)
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume()
  }

  // Limit queue size to prevent overwhelming the engine
  if (options?.allowQueue && pendingCount > 2) {
    return utterance
  }

  // Only cancel if explicitly not allowing queue
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
