"use client"

import { useState, useEffect, useCallback } from "react"
import { getPlatform } from "./use-local-storage"

const SETTINGS_KEY = "tense-playground-settings"

interface UserSettings {
  language: string
  soundEnabled: boolean
  hapticEnabled: boolean
  autoPlayAudio: boolean
  fontSize: "small" | "medium" | "large"
  platform: string
}

const defaultSettings: UserSettings = {
  language: "en",
  soundEnabled: true,
  hapticEnabled: true,
  autoPlayAudio: false,
  fontSize: "medium",
  platform: "unknown",
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const platform = getPlatform()

    try {
      const saved = localStorage.getItem(SETTINGS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setSettings({ ...parsed, platform })
      } else {
        // Platform-specific defaults
        const platformDefaults: Partial<UserSettings> = {
          platform,
          // iOS and Android have haptic feedback
          hapticEnabled: platform === "ios" || platform === "android",
          // Larger font for mobile by default
          fontSize: platform === "ios" || platform === "android" ? "large" : "medium",
        }
        setSettings({ ...defaultSettings, ...platformDefaults })
      }
    } catch {
      setSettings({ ...defaultSettings, platform })
    }
    setIsLoaded(true)
  }, [])

  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...updates }
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
      } catch {}
      return updated
    })
  }, [])

  const resetSettings = useCallback(() => {
    const platform = getPlatform()
    const resetValue = { ...defaultSettings, platform }
    setSettings(resetValue)
    try {
      localStorage.removeItem(SETTINGS_KEY)
    } catch {}
  }, [])

  return {
    settings,
    isLoaded,
    updateSettings,
    resetSettings,
  }
}
