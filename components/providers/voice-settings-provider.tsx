'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react'
import { useAuth } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'

export interface VoiceSettings {
    voice: string
    speed: number
    pitch: number
}

interface VoiceSettingsContextType {
    voiceSettings: VoiceSettings
    updateVoiceSettings: (settings: Partial<VoiceSettings>) => Promise<void>
    speak: (text: string, voiceId?: string, customSpeed?: number, customPitch?: number) => void
    stop: () => void
    playDemo: (text?: string, voiceId?: string, speed?: number, pitch?: number) => void
    isLoading: boolean
    isSaving: boolean
    isPlaying: boolean
    availableVoices: SpeechSynthesisVoice[]
    findVoice: (voiceName: string) => SpeechSynthesisVoice | undefined
}

const VoiceSettingsContext = createContext<VoiceSettingsContextType | null>(null)

export function useVoiceSettings() {
    const context = useContext(VoiceSettingsContext)
    if (!context) {
        throw new Error('useVoiceSettings must be used within a VoiceSettingsProvider')
    }
    return context
}

// Mobile detection
const isMobile = () => {
    if (typeof window === "undefined") return false
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

// Chunking for long text (Chrome bug limits speech to ~15s)
const chunkText = (text: string, maxLength = 160): string[] => {
    const sentences = text.match(/[^.!?]+[.!?]*|./g) || [text]
    const chunks: string[] = []
    let currentChunk = ''

    sentences.forEach(sentence => {
        if ((currentChunk + sentence).length > maxLength) {
            chunks.push(currentChunk.trim())
            currentChunk = sentence
        } else {
            currentChunk += sentence
        }
    })
    if (currentChunk) chunks.push(currentChunk.trim())
    return chunks
}

export function VoiceSettingsProvider({ children }: { children: ReactNode }) {
    const { userId, isSignedIn, isLoaded } = useAuth()
    const pathname = usePathname()
    const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
        voice: '',
        speed: 1.0,
        pitch: 1.0,
    })
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
    const [isPlaying, setIsPlaying] = useState(false)
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
    const resumeIntervalRef = useRef<NodeJS.Timeout | null>(null)

    // Stop audio on route change
    const stop = useCallback(() => {
        if (resumeIntervalRef.current) {
            clearInterval(resumeIntervalRef.current)
            resumeIntervalRef.current = null
        }
        window.speechSynthesis.cancel()
        setIsPlaying(false)
    }, [])

    useEffect(() => {
        stop()
    }, [pathname, stop])

    // Load available browser voices with retry/fallback
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices()
            if (voices.length > 0) {
                setAvailableVoices(voices)

                // HIGHLIGHT: Normalize voice name on load to fix UI "Reset" bug
                setVoiceSettings(prev => {
                    // 1. If we have a saved voice, try to find its exact match in the new list
                    if (prev.voice) {
                        const exactMatch = voices.find(v => v.name === prev.voice)
                        if (exactMatch) return prev // Exact match exists, all good

                        // 2. Try fuzzy match (e.g. "Google US English" vs "Google US English (en-US)")
                        const fuzzyMatch = voices.find(v => v.name.includes(prev.voice) || prev.voice.includes(v.name))
                        if (fuzzyMatch) {
                            console.log('Normalized voice:', prev.voice, '->', fuzzyMatch.name)
                            return { ...prev, voice: fuzzyMatch.name }
                        }
                    }

                    // 3. Fallback: If no voice set (and no fuzzy match), set sensible default
                    // ONLY if prev.voice is empty. If it's set but not found, we keep it (maybe it'll load later)
                    if (!prev.voice) {
                        const defaultVoice = voices.find(v => v.default) ||
                            voices.find(v => v.lang.startsWith('en')) ||
                            voices[0]
                        return defaultVoice ? { ...prev, voice: defaultVoice.name } : prev
                    }

                    return prev
                })
            }
        }

        loadVoices()

        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices
        }

        const interval = setInterval(() => {
            if (availableVoices.length === 0) loadVoices()
        }, 1000)

        return () => {
            window.speechSynthesis.cancel()
            clearInterval(interval)
            if (resumeIntervalRef.current) clearInterval(resumeIntervalRef.current)
        }
    }, [availableVoices.length])

    // Load user settings from DB
    useEffect(() => {
        if (!isLoaded) return

        // RESET on logout / unauthorized
        if (!isSignedIn || !userId) {
            setVoiceSettings({
                voice: '',
                speed: 1.0,
                pitch: 1.0,
            })
            return
        }


        const loadSettings = async () => {
            setIsLoading(true)
            try {
                const response = await fetch('/api/user/voice-settings?_t=' + Date.now(), { credentials: 'include' })
                if (response.ok) {
                    const data = await response.json()
                    if (data.voiceSettings) {
                        const pref = data.voiceSettings.voicePreference
                        // Ignore the DB default generic string, allow browser to pick best voice if not customized
                        const cleanVoice = (pref && pref !== 'en-US-Standard-A') ? pref : ''

                        console.log('Loaded voice settings:', { pref, cleanVoice })

                        // Only update if we have a realsaved voice, 
                        // otherwise keep what loadVoices() might have already picked
                        if (cleanVoice) {
                            setVoiceSettings({
                                voice: cleanVoice, // Use the specific saved voice
                                speed: data.voiceSettings.voiceSpeed || 1.0,
                                pitch: data.voiceSettings.voicePitch || 1.0,
                            })
                        } else {
                            // Update speed/pitch but keep voice if it was already set by defaults
                            setVoiceSettings(prev => ({
                                ...prev,
                                speed: data.voiceSettings.voiceSpeed || 1.0,
                                pitch: data.voiceSettings.voicePitch || 1.0,
                            }))
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to load voice settings:', error)
            } finally {
                setIsLoading(false)
            }
        }
        loadSettings()
    }, [userId])

    const updateVoiceSettings = async (settings: Partial<VoiceSettings>) => {
        // Enforce: Only signed in users can update
        if (!userId) {
            console.warn('Voice settings blocked for unauthorized user')
            return
        }

        const newSettings = { ...voiceSettings, ...settings }

        setVoiceSettings(newSettings)

        if (userId) {
            setIsSaving(true)
            try {
                const response = await fetch('/api/user/voice-settings', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        voicePreference: newSettings.voice,
                        voiceSpeed: newSettings.speed,
                        voicePitch: newSettings.pitch,
                    }),
                })
                if (!response.ok) throw new Error('Failed to save')
            } catch (error) {
                console.error('Failed to save settings:', error)
            } finally {
                setIsSaving(false)
            }
        }
    }

    const findVoice = useCallback((voiceName: string): SpeechSynthesisVoice | undefined => {
        // 1. Exact match
        const exact = availableVoices.find(v => v.name === voiceName)
        if (exact) return exact

        // 2. Includes match (e.g. "Google US English" vs "Google US English (en-US)")
        const partial = availableVoices.find(v => v.name.includes(voiceName) || voiceName.includes(v.name))
        if (partial) return partial

        // 3. Fallback to same language
        // Note: This logic assumes voiceName might contain lang code or not be useful, so we skip for now unless strict needed.

        return availableVoices[0]
    }, [availableVoices])

    const cleanup = () => {
        if (resumeIntervalRef.current) {
            clearInterval(resumeIntervalRef.current)
            resumeIntervalRef.current = null
        }
        window.speechSynthesis.cancel()
    }

    const speak = useCallback((text: string, voiceId?: string, customSpeed?: number, customPitch?: number) => {
        cleanup()

        if (isMobile() && window.speechSynthesis.paused) {
            window.speechSynthesis.resume()
        }

        const cleanText = text
            .replace(/```[^`]*```/g, '')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/\*\*([^*]+)\*\*/g, '$1')
            .replace(/\*([^*]+)\*/g, '$1')
            .replace(/#{1,6}\s/g, '')
            .replace(/[-*]\s/g, '')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .trim()

        if (!cleanText) return

        const chunks = chunkText(cleanText)
        let chunkIndex = 0

        const speakChunk = () => {
            if (chunkIndex >= chunks.length) {
                setIsPlaying(false)
                return
            }

            const utterance = new SpeechSynthesisUtterance(chunks[chunkIndex])
            const voiceToUse = voiceId || voiceSettings.voice
            const voice = findVoice(voiceToUse)

            if (voice) {
                utterance.voice = voice
                // If fuzzy match found a voice, we should trust it.
            } else {
                // If no voice found by name, ensure we use a default one rather than silence
                const defaultVoice = availableVoices.find(v => v.default) || availableVoices[0]
                if (defaultVoice) utterance.voice = defaultVoice
            }

            utterance.rate = customSpeed ?? voiceSettings.speed
            utterance.pitch = customPitch ?? voiceSettings.pitch

            utterance.onstart = () => {
                setIsPlaying(true)
                if (resumeIntervalRef.current) clearInterval(resumeIntervalRef.current)
                resumeIntervalRef.current = setInterval(() => {
                    if (window.speechSynthesis.paused) window.speechSynthesis.resume()
                }, 1000)
            }

            utterance.onend = () => {
                if (resumeIntervalRef.current) clearInterval(resumeIntervalRef.current)
                chunkIndex++
                speakChunk()
            }

            utterance.onerror = () => {
                if (resumeIntervalRef.current) clearInterval(resumeIntervalRef.current)
                setIsPlaying(false)
            }

            utteranceRef.current = utterance
            window.speechSynthesis.speak(utterance)
        }

        speakChunk()
    }, [voiceSettings, findVoice, availableVoices])

    const playDemo = useCallback((text?: string, voiceId?: string, speed?: number, pitch?: number) => {
        speak(
            text || 'Hello! This is how I sound. I will help you learn English grammar.',
            voiceId,
            speed,
            pitch
        )
    }, [speak])

    const value = {
        voiceSettings,
        updateVoiceSettings,
        speak,
        stop,
        playDemo,
        isLoading,
        isSaving,
        isPlaying,
        availableVoices,
        findVoice
    }

    return (
        <VoiceSettingsContext.Provider value={value}>
            {children}
        </VoiceSettingsContext.Provider>
    )
}
