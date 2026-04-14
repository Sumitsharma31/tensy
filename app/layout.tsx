import type React from "react"
import type { Metadata, Viewport } from "next"
import Script from "next/script"
import { Poppins, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from "@/components/providers/theme-provider"
import { LanguageProvider } from "@/components/providers/language-provider"
import { StreakProvider } from "@/components/providers/streak-provider"
import { VoiceSettingsProvider } from "@/components/providers/voice-settings-provider"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { TenseyChat } from "@/components/chat/tensey-chat"
import { LoginPromptModal } from "@/components/auth/login-prompt-modal"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

// JSON-LD Structured Data for better SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Tense Playground",
  alternateName: ["TensePlayground", "Tense-Playground"],
  description:
    "Tense Playground is a free AI-powered English grammar learning platform. Master all 12 English tenses through interactive games, quizzes, AI-assisted learning, and exercises. Perfect for ESL learners, students, and anyone wanting to improve their English grammar skills.",
  url: "https://tense-playground.vercel.app",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Person",
    name: "Dharmendra Kumar",
  },
  publisher: {
    "@type": "Organization",
    name: "Tense Playground",
    url: "https://tense-playground.vercel.app",
  },
  keywords:
    "Tense Playground, English tenses, grammar games, learn English tenses, ESL grammar, verb tenses practice, AI grammar learning, AI English tutor",
  inLanguage: "en",
  isAccessibleForFree: true,
  educationalLevel: "Beginner to Advanced",
  learningResourceType: ["Interactive Game", "Quiz", "Exercise"],
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Tense Playground",
  url: "https://tense-playground.vercel.app",
  logo: "https://tense-playground.vercel.app/og-image.png",
  sameAs: [],
  description:
    "Tense Playground - The best free AI-powered online tool to learn and practice English tenses through interactive games, quizzes, and AI assistance.",
}

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Tense Playground",
  alternateName: "TensePlayground",
  url: "https://tense-playground.vercel.app",
}

// Site Navigation for Google Sitelinks
const siteNavigationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: [
    {
      "@type": "SiteNavigationElement",
      position: 1,
      name: "Learn Tenses",
      description: "Explore all 12 English tenses with AI assistance, visual timelines, and formulas",
      url: "https://tense-playground.vercel.app/playground",
    },
    {
      "@type": "SiteNavigationElement",
      position: 2,
      name: "Grammar Quiz",
      description: "Test your English grammar with 150+ quiz levels and instant feedback",
      url: "https://tense-playground.vercel.app/quiz",
    },
    {
      "@type": "SiteNavigationElement",
      position: 3,
      name: "Sentence Builder Game",
      description: "Drag and drop words to build correct English sentences",
      url: "https://tense-playground.vercel.app/builder",
    },
    {
      "@type": "SiteNavigationElement",
      position: 4,
      name: "Word Rainfall Game",
      description: "Catch falling words in the right order to form sentences",
      url: "https://tense-playground.vercel.app/game/rainfall",
    },
    {
      "@type": "SiteNavigationElement",
      position: 5,
      name: "AI Translate",
      description: "AI-powered translation with tense detection and grammar breakdown",
      url: "https://tense-playground.vercel.app/translate",
    },
    {
      "@type": "SiteNavigationElement",
      position: 6,
      name: "Daily Challenges",
      description: "Complete daily grammar challenges to earn XP and maintain streaks",
      url: "https://tense-playground.vercel.app/challenges",
    },
    {
      "@type": "SiteNavigationElement",
      position: 7,
      name: "Tips & Tricks",
      description: "Memorable grammar rules and quick tips to master English tenses",
      url: "https://tense-playground.vercel.app/tips",
    },
  ],
}

export const metadata: Metadata = {
  title: {
    default: "Tense Playground – AI-Powered English Tenses Learning | Free Grammar Games & Quizzes",
    template: "%s | Tense Playground",
  },
  description:
    "Tense Playground is a free AI-powered platform to master all 12 English tenses. Learn past, present, and future tenses through fun grammar games, quizzes, AI chat assistance, and interactive exercises. Perfect for ESL learners and students.",
  keywords: [
    "Tense Playground",
    "tense playground",
    "TensePlayground",
    "English grammar",
    "English tenses",
    "learn English tenses",
    "grammar games",
    "tense games",
    "past tense",
    "present tense",
    "future tense",
    "perfect tense",
    "continuous tense",
    "grammar quiz",
    "English learning",
    "ESL grammar",
    "grammar practice",
    "verb tenses",
    "English exercises",
    "free English learning",
    "online grammar games",
    "interactive English learning",
    "tense practice online",
    "learn grammar online free",
    "AI grammar learning",
    "AI English tutor",
    "AI-powered grammar",
    "grammar AI assistant",
  ],
  authors: [{ name: "Dharmendra Kumar" }],
  creator: "Tense Playground",
  publisher: "Tense Playground",
  generator: "Next.js",
  applicationName: "Tense Playground",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://tense-playground.vercel.app"),
  alternates: {
    canonical: "https://tense-playground.vercel.app",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tense-playground.vercel.app",
    title: "Tense Playground – AI-Powered English Tenses Learning Free",
    description:
      "Tense Playground is the best free AI-powered tool to master English tenses. Play grammar games, chat with AI tutor, take quizzes, and practice all 12 tenses interactively!",
    siteName: "Tense Playground",
    images: [
      {
        url: "https://tense-playground.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tense Playground - Free English Tenses Learning Platform",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tense Playground – AI-Powered English Tenses Learning",
    description:
      "Master all 12 English tenses through interactive games, AI chat assistance, and quizzes. Free AI-powered grammar learning platform!",
    images: ["https://tense-playground.vercel.app/og-image.png"],
    creator: "@tenseplayground",
    site: "@tenseplayground",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      {
        url: "/icon-light-32x32.png",
        sizes: "32x32",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        sizes: "32x32",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
  category: "education",
  verification: {
    google: "6s1zvqQYarzATN68TYLQqk3G5xtx7d1tt7gGzm4aWzE",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Tense Playground",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#1e1b4b" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* JSON-LD Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteNavigationJsonLd) }}
        />

        {/* Additional SEO Meta Tags */}
        <meta name="subject" content="English Grammar Learning - Tense Playground" />
        <meta name="language" content="en" />
        <meta name="rating" content="General" />
        <meta name="distribution" content="Global" />
        <meta name="revisit-after" content="7 days" />
        <meta name="copyright" content="Tense Playground" />

        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-DHFVGETWWL"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-DHFVGETWWL');
          `}
        </Script>
      </head>
      <body className={`${poppins.className} ${geistMono.variable} font-sans antialiased`}>
        <ClerkProvider
          appearance={{
            baseTheme: undefined,
            variables: {
              colorPrimary: '#6366f1',
              colorBackground: '#ffffff',
              colorInputBackground: '#ffffff',
              colorInputText: '#1e293b',
            },
          }}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <LanguageProvider>
              <StreakProvider>
                <VoiceSettingsProvider>
                  <div className="min-h-screen flex flex-col">
                    <Header />
                    <main className="flex-1">{children}</main>
                    <Footer />
                  </div>
                  <TenseyChat />
                  <LoginPromptModal />
                  <Analytics />
                </VoiceSettingsProvider>
              </StreakProvider>
            </LanguageProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
