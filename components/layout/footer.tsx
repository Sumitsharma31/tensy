import Link from "next/link"
import { BookOpen, Github, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-past via-present to-future">
                <BookOpen className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold">Tense Playground</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Master English tenses through interactive games and exercises.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Learn</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/playground" className="hover:text-primary transition-colors">
                  Tense Playground
                </Link>
              </li>
              <li>
                <Link href="/tips" className="hover:text-primary transition-colors">
                  Tips & Tricks
                </Link>
              </li>
              <li>
                <Link href="/translate" className="hover:text-primary transition-colors">
                  Translation Tool
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Practice</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/builder" className="hover:text-primary transition-colors">
                  Sentence Builder
                </Link>
              </li>
              <li>
                <Link href="/game/rainfall" className="hover:text-primary transition-colors">
                  Word Rainfall
                </Link>
              </li>
              <li>
                <Link href="/quiz" className="hover:text-primary transition-colors">
                  Quizzes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Progress</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/challenges" className="hover:text-primary transition-colors">
                  Daily Challenges
                </Link>
              </li>
              <li>
                <Link href="/challenges" className="hover:text-primary transition-colors">
                  Streaks
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Tense Playground. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <p className="flex items-center gap-1">
              Made with <Heart className="h-4 w-4 text-destructive fill-destructive" aria-hidden="true" /> for learners
            </p>
            <Link 
              href="https://github.com/dharam-gfx" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
              title="Developed by dharam-gfx"
              aria-label="GitHub profile of dharam-gfx"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
