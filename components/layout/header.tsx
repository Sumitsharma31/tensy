"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeSwitch } from "@/components/common/theme-switch"
import { LanguageToggle } from "@/components/common/language-toggle"
import { AuthButtons } from "@/components/auth/AuthButtons"
import { useStreakContext } from "@/components/providers/streak-provider"
import { cn } from "@/lib/utils"
import { BookOpen, Gamepad2, Trophy, Lightbulb, Languages, Menu, X, Flame } from "lucide-react"
import { useState } from "react"

const navItems = [
  { href: "/playground", label: "Playground", icon: BookOpen },
  { href: "/builder", label: "Sentence Builder", icon: Gamepad2 },
  { href: "/game/rainfall", label: "Word Game", icon: Gamepad2 },
  { href: "/quiz", label: "Quiz", icon: Trophy },
  { href: "/tips", label: "Tips", icon: Lightbulb },
  { href: "/translate", label: "Translate", icon: Languages },
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { currentStreak } = useStreakContext()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-past via-present to-future">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg hidden sm:inline-block">Tense Playground</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  size="sm"
                  className={cn("gap-2", pathname === item.href && "bg-primary/10 text-primary")}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/challenges" className="hidden sm:flex">
              <Button variant="ghost" size="sm" className={cn("gap-2", currentStreak > 0 ? "text-future" : "text-muted-foreground")}>
                <Flame className={cn("h-4 w-4", currentStreak > 0 && "text-orange-500")} />
                <span className="font-semibold">{currentStreak}</span>
              </Button>
            </Link>
            <LanguageToggle />
            <ThemeSwitch />
            <AuthButtons />

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={pathname === item.href ? "secondary" : "ghost"}
                    className={cn("w-full justify-start gap-2", pathname === item.href && "bg-primary/10 text-primary")}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
              <Link href="/challenges" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2 text-future">
                  <Flame className="h-4 w-4" />
                  Challenges & Streaks
                </Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
