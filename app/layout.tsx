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

export const metadata: Metadata = {
  title: {
    default: "Tense Playground | Master English Tenses",
    template: "%s | Tense Playground",
  },
  description:
    "Master English tenses through interactive games, quizzes, and exercises. Learn past, present, and future tenses with fun grammar challenges. Free English learning tool for students and learners.",
  keywords: [
    "English grammar",
    "tenses",
    "learn English",
    "grammar games",
    "English tenses",
    "past tense",
    "present tense",
    "future tense",
    "grammar quiz",
    "English learning",
    "ESL",
    "grammar practice",
    "verb tenses",
    "English exercises",
  ],
  authors: [{ name: "Tense Playground" }],
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
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Tense Playground | Master English Tenses",
    description:
      "Master English tenses through interactive games, quizzes, and exercises. Learn grammar the fun way!",
    siteName: "Tense Playground",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tense Playground - Learn English Tenses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tense Playground | Master English Tenses",
    description:
      "Master English tenses through interactive games, quizzes, and exercises. Learn grammar the fun way!",
    images: ["/og-image.png"],
    creator: "@tenseplayground",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
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
              <Analytics />
            </StreakProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
