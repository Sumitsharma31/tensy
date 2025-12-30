"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AudioButton } from "@/components/common/audio-button"
import { cn } from "@/lib/utils"
import { useChallenges } from "@/hooks/use-challenges"
import { ArrowRight, Languages, BookOpen, Sparkles, Copy, Check } from "lucide-react"

const languages = [
  { code: "hi", label: "Hindi", native: "हिंदी" },
  { code: "hi-latn", label: "Hinglish", native: "Hinglish" },
  { code: "bn", label: "Bangla", native: "বাংলা" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
]

// Sample translations database
const translations: Record<string, { english: string; tense: string; formula: string; breakdown: string[] }> = {
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
  "वह पढ़ रही थी।": {
    english: "She was reading.",
    tense: "Past Continuous",
    formula: "Subject + was/were + V1+ing",
    breakdown: ["वह (She) = Subject", "थी (was) = Helping verb", "पढ़ रही (reading) = Main verb + ing"],
  },
  "main kal jaunga.": {
    english: "I will go tomorrow.",
    tense: "Simple Future",
    formula: "Subject + will + V1",
    breakdown: ["main (I) = Subject", "jaunga (will go) = will + V1", "kal (tomorrow) = Time"],
  },
  "मैं कल जाऊँगा।": {
    english: "I will go tomorrow.",
    tense: "Simple Future",
    formula: "Subject + will + V1",
    breakdown: ["मैं (I) = Subject", "जाऊँगा (will go) = will + V1", "कल (tomorrow) = Time"],
  },
}

export function TranslationTool() {
  const [sourceLang, setSourceLang] = useState("hi")
  const [inputText, setInputText] = useState("")
  const [translation, setTranslation] = useState<{
    english: string
    tense: string
    formula: string
    breakdown: string[]
  } | null>(null)
  const [copied, setCopied] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)

  const { recordTranslation, recordSectionVisit } = useChallenges()

  // Track section visit for Explorer badge
  useEffect(() => {
    recordSectionVisit("translate")
  }, [recordSectionVisit])

  const handleTranslate = () => {
    setIsTranslating(true)

    // Simulate translation delay
    setTimeout(() => {
      const trimmedInput = inputText.trim()

      // Check if we have a direct translation
      if (translations[trimmedInput]) {
        setTranslation(translations[trimmedInput])
      } else {
        // Provide a simulated response for demo
        setTranslation({
          english: "I am learning English grammar.",
          tense: "Present Continuous",
          formula: "Subject + am/is/are + V1+ing + Object",
          breakdown: [
            "Subject = I",
            "Helping verb = am",
            "Main verb = learning (learn + ing)",
            "Object = English grammar",
          ],
        })
      }
      
      // Record translation for Translator badge
      recordTranslation()
      
      setIsTranslating(false)
    }, 500)
  }

  const copyToClipboard = () => {
    if (translation) {
      navigator.clipboard.writeText(translation.english)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const tenseColor = translation?.tense.toLowerCase().includes("past")
    ? "past"
    : translation?.tense.toLowerCase().includes("future")
      ? "future"
      : "present"

  return (
    <div className="space-y-6">
      {/* Input section */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Source Language
            </CardTitle>
            <Select value={sourceLang} onValueChange={setSourceLang}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.label} ({lang.native})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Type or paste your sentence here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-32 text-lg"
          />
          <div className="flex flex-wrap gap-2">
            <p className="text-sm text-muted-foreground w-full mb-2">Try these examples:</p>
            {Object.keys(translations)
              .slice(0, 4)
              .map((text) => (
                <Button
                  key={text}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputText(text)}
                  className="text-xs bg-transparent"
                >
                  {text.slice(0, 20)}...
                </Button>
              ))}
          </div>
          <Button onClick={handleTranslate} className="w-full gap-2" disabled={!inputText.trim() || isTranslating}>
            <ArrowRight className="h-4 w-4" />
            {isTranslating ? "Translating..." : "Translate to English"}
          </Button>
        </CardContent>
      </Card>

      {/* Result section */}
      {translation && (
        <Card className={cn("border-2", `border-${tenseColor}/30`)}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Translation
              </CardTitle>
              <div className="flex items-center gap-2">
                <AudioButton text={translation.english} />
                <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                  {copied ? <Check className="h-4 w-4 text-present" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* English translation */}
            <div className={cn("p-6 rounded-xl text-center", `bg-${tenseColor}-light`)}>
              <p className="text-2xl font-medium">{translation.english}</p>
            </div>

            {/* Tense detection */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Detected Tense:</span>
                <Badge
                  className={cn(
                    tenseColor === "past" && "bg-past text-primary-foreground",
                    tenseColor === "present" && "bg-present text-primary-foreground",
                    tenseColor === "future" && "bg-future text-primary-foreground",
                  )}
                >
                  {translation.tense}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Formula:</span>
                <Badge variant="outline" className="font-mono">
                  {translation.formula}
                </Badge>
              </div>
            </div>

            {/* Grammar breakdown */}
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Grammar Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {translation.breakdown.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className={cn("w-2 h-2 rounded-full", `bg-${tenseColor}`)} />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
