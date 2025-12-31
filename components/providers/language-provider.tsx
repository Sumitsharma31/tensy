"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import languagesData from "@/data/languages.json"

const LANGUAGE_STORAGE_KEY = "tense-playground-language"

export type Language = (typeof languagesData.languages)[number]
export type LanguageCode = Language["code"]

interface LanguageContextValue {
  language: LanguageCode
  setLanguage: (code: LanguageCode) => void
  languages: Language[]
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

const supportedLanguages: Language[] = languagesData.languages

const isSupported = (code: string): code is LanguageCode => supportedLanguages.some((lang) => lang.code === code)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("hi")

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
      if (stored && isSupported(stored)) {
        setLanguageState(stored)
      }
    } catch {
      // localStorage might be unavailable (e.g., SSR or privacy mode)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    } catch {
      // Ignore write failures
    }
  }, [language])

  const setLanguage = useCallback((code: LanguageCode) => {
    if (!isSupported(code)) return
    setLanguageState(code)
  }, [])

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      languages: supportedLanguages,
    }),
    [language, setLanguage],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
