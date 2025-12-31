"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AudioButton } from "@/components/common/audio-button"
import { cn } from "@/lib/utils"
import { useChallenges } from "@/hooks/use-challenges"
import { ArrowRight, Languages, BookOpen, Sparkles, Copy, Check, Loader2, AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Organized by regions for better navigation
const languages = [
  // English
  { code: "en", label: "English", native: "English", category: "English" },
  
  // Indian Languages (Major)
  { code: "hi", label: "Hindi", native: "हिंदी", category: "Indian Languages" },
  { code: "hi-latn", label: "Hinglish", native: "Hinglish", category: "Indian Languages" },
  { code: "bn", label: "Bengali", native: "বাংলা", category: "Indian Languages" },
  { code: "te", label: "Telugu", native: "తెలుగు", category: "Indian Languages" },
  { code: "ta", label: "Tamil", native: "தமிழ்", category: "Indian Languages" },
  { code: "mr", label: "Marathi", native: "मराठी", category: "Indian Languages" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી", category: "Indian Languages" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ", category: "Indian Languages" },
  { code: "ml", label: "Malayalam", native: "മലയാളം", category: "Indian Languages" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ", category: "Indian Languages" },
  { code: "or", label: "Odia", native: "ଓଡ଼ିଆ", category: "Indian Languages" },
  { code: "ur", label: "Urdu", native: "اردو", category: "Indian Languages" },
  { code: "as", label: "Assamese", native: "অসমীয়া", category: "Indian Languages" },
  
  // Other Popular Languages
  { code: "es", label: "Spanish", native: "Español", category: "Popular Languages" },
  { code: "fr", label: "French", native: "Français", category: "Popular Languages" },
  { code: "de", label: "German", native: "Deutsch", category: "Popular Languages" },
  { code: "zh", label: "Chinese", native: "中文", category: "Popular Languages" },
  { code: "ja", label: "Japanese", native: "日本語", category: "Popular Languages" },
  { code: "ko", label: "Korean", native: "한국어", category: "Popular Languages" },
  { code: "ar", label: "Arabic", native: "العربية", category: "Popular Languages" },
  { code: "pt", label: "Portuguese", native: "Português", category: "Popular Languages" },
  { code: "ru", label: "Russian", native: "Русский", category: "Popular Languages" },
]

// Sample translations database for quick examples
const sampleTranslations: Record<string, { english: string; tense: string; formula: string; breakdown: string[] }> = {
  "मैं खाना खाता हूँ।": {
    english: "I eat food.",
    tense: "Simple Present",
    formula: "Subject + V1 + Object",
    breakdown: ["मैं (I) = Subject", "खाता हूँ (eat) = Verb (V1)", "खाना (food) = Object"],
  },
  "main khana khata hoon.": {
    english: "I eat food.",
    tense: "Simple Present",
    formula: "Subject + V1 + Object",
    breakdown: ["main (I) = Subject", "khata hoon (eat) = Verb (V1)", "khana (food) = Object"],
  },
  "वह स्कूल जाती है।": {
    english: "She goes to school.",
    tense: "Simple Present",
    formula: "Subject + V1(es) + Object",
    breakdown: ["वह (She) = Subject", "जाती है (goes) = Verb with 'es'", "स्कूल (school) = Object"],
  },
  "woh school jaati hai.": {
    english: "She goes to school.",
    tense: "Simple Present",
    formula: "Subject + V1(es) + Object",
    breakdown: ["woh (She) = Subject", "jaati hai (goes) = Verb with 'es'", "school (school) = Object"],
  },
  "मैंने खाना खाया।": {
    english: "I ate food.",
    tense: "Simple Past",
    formula: "Subject + V2 + Object",
    breakdown: ["मैंने (I) = Subject", "खाया (ate) = Verb (V2)", "खाना (food) = Object"],
  },
  "maine khana khaya.": {
    english: "I ate food.",
    tense: "Simple Past",
    formula: "Subject + V2 + Object",
    breakdown: ["maine (I) = Subject", "khaya (ate) = Verb (V2)", "khana (food) = Object"],
  },
}

export function TranslationTool() {
  const [targetLang, setTargetLang] = useState("en")
  const [inputText, setInputText] = useState("")
  const [translation, setTranslation] = useState<{
    originalText: string
    translatedText: string
    sourceLanguage: string
    targetLanguage: string
    tenseUsed: string | null
    formula: string | null
    grammarNotes: string[]
  } | null>(null)
  const [copied, setCopied] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { recordTranslation, recordSectionVisit } = useChallenges()

  // Track section visit for Explorer badge
  useEffect(() => {
    recordSectionVisit("translate")
  }, [recordSectionVisit])

  const handleTranslate = async () => {
    setIsTranslating(true)
    setError(null)

    try {
      const response = await fetch("/api/ai/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText.trim(),
          sourceLanguage: "auto", // Auto-detect source language
          targetLanguage: targetLang,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Translation failed")
      }

      setTranslation(data)
      recordTranslation()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during translation")
      console.error("Translation error:", err)
    } finally {
      setIsTranslating(false)
    }
  }

  const copyToClipboard = () => {
    if (translation) {
      navigator.clipboard.writeText(translation.translatedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getTenseColor = (tense: string | null) => {
    if (!tense) return "muted"
    const tenseLower = tense.toLowerCase()
    if (tenseLower.includes("past")) return "past"
    if (tenseLower.includes("future")) return "future"
    return "present"
  }

  const tenseColor = translation ? getTenseColor(translation.tenseUsed) : "muted"

  return (
    <div className="space-y-4">

      {/* Input section */}
      <Card className="border-2 gap-1 py-2">
        <CardHeader className="px-4 py-2 sm:px-6 sm:py-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Languages className="h-4 w-4 sm:h-5 sm:w-5" />
            Translate Your Sentence
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Type in any language - Hindi, English, Spanish, or any other language you know!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2.5 sm:space-y-3 px-4 pb-4 pt-2 sm:px-6 sm:pb-6 sm:pt-3">
          <div className="space-y-1.5 sm:space-y-2">
            <label className="pb-2 block text-xs sm:text-sm font-medium">Your Text (Any Language)</label>
            <Textarea
              placeholder="Type or paste your sentence in any language... मैं खाना खाता हूँ | I eat food | Je mange..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-24 sm:min-h-32 text-base sm:text-lg resize-none p-2 sm:p-3 placeholder:text-xs sm:placeholder:text-sm"
            />
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              💡 Our AI will automatically detect your language - just start typing!
            </p>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium">Translate To</label>
            <Select value={targetLang} onValueChange={setTargetLang}>
              <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-75">
                {/* Group by category */}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">English</div>
                {languages
                  .filter((lang) => lang.category === "English")
                  .map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.native}
                    </SelectItem>
                  ))}
                
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1 pt-2">
                  Indian Languages
                </div>
                {languages
                  .filter((lang) => lang.category === "Indian Languages")
                  .map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.label} - {lang.native}
                    </SelectItem>
                  ))}
                
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1 pt-2">
                  Other Languages
                </div>
                {languages
                  .filter((lang) => lang.category === "Popular Languages")
                  .map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.label} - {lang.native}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <p className="text-xs sm:text-sm text-muted-foreground w-full mb-0.5 sm:mb-1">Quick examples (click to try):</p>
            {Object.keys(sampleTranslations)
              .slice(0, 3)
              .map((text) => (
                <Button
                  key={text}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInputText(text)
                    setTargetLang("en")
                  }}
                  className="text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3"
                >
                  {text.length > 25 ? text.slice(0, 25) + "..." : text}
                </Button>
              ))}
          </div>

          <Button
            onClick={handleTranslate}
            className="w-full gap-1.5 sm:gap-2 text-sm sm:text-base"
            disabled={!inputText.trim() || isTranslating}
            size="default"
          >
            {isTranslating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Translate & Analyze
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Result section */}
      {translation && (
        <div className="space-y-2.5 sm:space-y-3">
          {/* Original Text */}
          <Card className="border-2 border-muted gap-1 py-2">
            <CardHeader className="px-3 py-2 sm:px-6 sm:py-2.5">
              <CardTitle className="text-sm sm:text-base flex items-center gap-1.5 sm:gap-2">
                <Languages className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Original Text
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-1 sm:px-6 sm:pb-4 sm:pt-2">
              <div className="p-2.5 sm:p-3 rounded-lg bg-muted/50">
                <p className="text-base sm:text-lg font-medium">{translation.originalText}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Detected Language: <Badge variant="outline" className="ml-1">{translation.sourceLanguage}</Badge>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Translation Result */}
          <Card className={cn("border-2 gap-1 py-2", translation.tenseUsed && `border-${tenseColor}/30`)}>
            <CardHeader className="px-3 py-2 sm:px-6 sm:py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-lg">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                  Translation
                </CardTitle>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <AudioButton text={translation.translatedText} />
                  <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" onClick={copyToClipboard} title="Copy translation">
                    {copied ? <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-present" /> : <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-3 pb-3 pt-1 sm:px-6 sm:pb-5 sm:pt-2">
              {/* English translation */}
              <div className={cn("p-3 sm:p-4 rounded-xl", translation.tenseUsed ? `bg-${tenseColor}-light` : "bg-muted/50")}>
                <p className="text-lg sm:text-2xl font-medium text-center">{translation.translatedText}</p>
                <p className="text-xs sm:text-sm text-muted-foreground text-center mt-1 sm:mt-1.5">
                  Language: {languages.find((l) => l.code === targetLang)?.label || translation.targetLanguage}
                </p>
              </div>

              {/* Tense Information */}
              {translation.tenseUsed && (
                <Card className={cn("border-2 gap-1 py-2 gap-1", `border-${tenseColor}/50`)}>
                  <CardHeader className="px-3 py-2 sm:px-6 sm:py-2.5">
                    <CardTitle className="text-sm sm:text-base flex items-center gap-1.5 sm:gap-2">
                      <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Grammar Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-2.5 px-3 pb-3 pt-1 sm:px-6 sm:pb-4 sm:pt-2">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="text-xs sm:text-sm font-medium">Tense Detected:</span>
                      <Badge
                        className={cn(
                          "text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1",
                          tenseColor === "past" && "bg-past text-primary-foreground",
                          tenseColor === "present" && "bg-present text-primary-foreground",
                          tenseColor === "future" && "bg-future text-primary-foreground",
                        )}
                      >
                        {translation.tenseUsed}
                      </Badge>
                    </div>

                    {/* Formula */}
                    {translation.formula && (
                      <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200 dark:border-indigo-800">
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                            <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] sm:text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-0.5 sm:mb-1">FORMULA</p>
                          <code className="text-xs sm:text-sm font-mono font-semibold text-indigo-900 dark:text-indigo-100">
                            {translation.formula}
                          </code>
                        </div>
                      </div>
                    )}

                    <div className={cn("p-2.5 sm:p-3 rounded-lg", `bg-${tenseColor}/10`)}>
                      <p className="text-xs sm:text-sm">
                        <span className="font-medium">What this means:</span> This sentence uses the{" "}
                        <span className={cn("font-semibold", `text-${tenseColor}`)}>
                          {translation.tenseUsed}
                        </span>{" "}
                        tense
                        {tenseColor === "past" && " to describe actions that happened in the past."}
                        {tenseColor === "present" && " to describe current actions or general truths."}
                        {tenseColor === "future" && " to describe actions that will happen later."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Grammar Notes */}
              {translation.grammarNotes && translation.grammarNotes.length > 0 && (
                <Card className="bg-linear-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2 gap-1 py-2">
                  <CardHeader className="px-3 py-2 sm:px-6 sm:py-2.5">
                    <CardTitle className="text-sm sm:text-base flex items-center gap-1.5 sm:gap-2">
                      <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
                      Learning Notes
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Understanding the grammar and structure</CardDescription>
                  </CardHeader>
                  <CardContent className="px-3 pb-3 pt-1 sm:px-6 sm:pb-4 sm:pt-2">
                    <div className="space-y-1.5 sm:space-y-2">
                      {translation.grammarNotes.map((note, i) => (
                        <div key={i} className="flex gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-white/60 dark:bg-black/20">
                          <div className={cn("w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-[10px] sm:text-xs", `bg-${tenseColor}`)}>
                            {i + 1}
                          </div>
                          <p className="text-xs sm:text-sm leading-relaxed">{note}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Pro Tip */}
              <Alert className="bg-linear-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800 p-2.5 sm:p-3">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" />
                <AlertDescription className="text-xs sm:text-sm">
                  <span className="font-semibold">Pro tip:</span> Try translating the same sentence using different
                  tenses to see how the meaning and structure change. This will help you understand grammar patterns
                  better!
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
