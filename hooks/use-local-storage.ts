"use client"

import { useState, useEffect, useCallback } from "react"

function getPlatform(): "android" | "ios" | "windows" | "mac" | "linux" | "unknown" {
  if (typeof window === "undefined") return "unknown"

  const userAgent = navigator.userAgent.toLowerCase()
  const platform = navigator.platform?.toLowerCase() || ""

  if (/android/i.test(userAgent)) return "android"
  if (/iphone|ipad|ipod/i.test(userAgent)) return "ios"
  if (/win/i.test(platform) || /win/i.test(userAgent)) return "windows"
  if (/mac/i.test(platform)) return "mac"
  if (/linux/i.test(platform)) return "linux"

  return "unknown"
}

function safeGetItem(key: string): string | null {
  try {
    if (typeof window === "undefined") return null
    return localStorage.getItem(key)
  } catch {
    // Handle cases where localStorage is not available (iOS private browsing, etc.)
    return null
  }
}

function safeSetItem(key: string, value: string): boolean {
  try {
    if (typeof window === "undefined") return false
    localStorage.setItem(key, value)
    return true
  } catch {
    // Storage quota exceeded or not available
    return false
  }
}

function safeRemoveItem(key: string): boolean {
  try {
    if (typeof window === "undefined") return false
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isLoaded, setIsLoaded] = useState(false)
  const [platform, setPlatform] = useState<ReturnType<typeof getPlatform>>("unknown")

  // Load initial value from localStorage
  useEffect(() => {
    setPlatform(getPlatform())

    const item = safeGetItem(key)
    if (item) {
      try {
        setStoredValue(JSON.parse(item))
      } catch {
        setStoredValue(initialValue)
      }
    }
    setIsLoaded(true)
  }, [key, initialValue])

  // Update localStorage when value changes
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value
        safeSetItem(key, JSON.stringify(valueToStore))
        return valueToStore
      })
    },
    [key],
  )

  const removeValue = useCallback(() => {
    safeRemoveItem(key)
    setStoredValue(initialValue)
  }, [key, initialValue])

  return { value: storedValue, setValue, removeValue, isLoaded, platform }
}

export { getPlatform }
