import type React from "react"
import type { Metadata, Viewport } from "next"
import Script from "next/script"
import { Poppins, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { LanguageProvider } from "@/components/providers/language-provider"
import { StreakProvider } from "@/components/providers/streak-provider"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { TenseyChat } from "@/components/chat/tensey-chat"
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
    "Tense Playground is a free interactive English grammar learning platform. Master all 12 English tenses through games, quizzes, and exercises. Perfect for ESL learners, students, and anyone wanting to improve their English grammar skills.",
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
    "Tense Playground, English tenses, grammar games, learn English tenses, ESL grammar, verb tenses practice",
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
    "Tense Playground - The best free online tool to learn and practice English tenses through interactive games and quizzes.",
}

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Tense Playground",
  alternateName: "TensePlayground",
  url: "https://tense-playground.vercel.app",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://tense-playground.vercel.app/search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
}

export const metadata: Metadata = {
  title: {
    default: "Tense Playground – Learn & Practice English Tenses | Free Grammar Games & Quizzes",
    template: "%s | Tense Playground",
  },
  description:
    "Tense Playground is a free interactive platform to master all 12 English tenses. Learn past, present, and future tenses through fun grammar games, quizzes, and exercises. Perfect for ESL learners and students.",
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
    title: "Tense Playground – Learn & Practice English Tenses Free",
    description:
      "Tense Playground is the best free tool to master English tenses. Play grammar games, take quizzes, and practice all 12 tenses interactively!",
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
    title: "Tense Playground – Learn English Tenses Free",
    description:
      "Master all 12 English tenses through interactive games and quizzes. Free grammar learning platform!",
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
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <StreakProvider>
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <TenseyChat />
              <Analytics />
            </StreakProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
