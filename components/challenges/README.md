# Challenges & Gamification System 🏆

This document describes the challenges, streaks, badges, and XP system implemented in Tense Playground.

## Overview

The gamification system encourages daily practice through:
- **Daily Challenges** - Reset every midnight
- **Weekly Challenges** - Reset every Monday
- **Badges** - 14 permanent achievements across different categories
- **XP Points** - Cumulative rewards
- **Streak Tracking** - Consecutive days of practice
- **Section Tracking** - Explorer badge for visiting all app sections

## Architecture

### Hooks

#### `useChallenges` ([use-challenges.ts](../../hooks/use-challenges.ts))
Main hook for tracking all challenge progress.

```tsx
const {
  isLoaded,
  totalXP,
  lifetimeStats,
  hoursUntilDailyReset,
  daysUntilWeeklyReset,
  getDailyChallenges,
  getWeeklyChallenges,
  getBadges,
  recordQuizQuestion,
  recordSentenceBuilt,
  recordRainfallScore,
  recordTenseCompleted,
  recordPerfectScore,
  recordLessonComplete,
  recordStreakMaster,
  recordTranslation,
  recordSectionVisit,
  recordEasyLevelComplete,
  recordWeeklyComplete,
} = useChallenges()
```

#### `useStreakContext` ([streak-provider.tsx](../providers/streak-provider.tsx))
Shared context for streak data across the app.

```tsx
const { currentStreak, longestStreak, totalDays, recordActivity } = useStreakContext()
```

### Data Storage

All data is persisted in `localStorage`:

| Key | Description |
|-----|-------------|
| `tense-playground-challenges` | Daily/weekly progress, lifetime stats, badges, XP |
| `tense-playground-streak` | Streak tracking data |

### Data Structure

```typescript
interface ChallengesData {
  dailyChallenges: {
    quizQuestionsCorrect: number    // Count of correct quiz answers today
    sentencesBuilt: number          // Count of sentences built today
    rainfallHighScore: number       // Highest rainfall score today
    lastReset: string               // Date of last reset (YYYY-MM-DD)
  }
  weeklyChallenges: {
    tensesCompleted: string[]       // Array of completed tense names
    perfectScoreAchieved: boolean   // Whether 100% was achieved this week
    weeklyCompleted: boolean        // Whether all weekly challenges completed
    lastReset: string               // Date of week start (YYYY-MM-DD)
  }
  lifetimeStats: {
    totalQuizQuestions: number      // All-time quiz questions answered
    totalSentencesBuilt: number     // All-time sentences built
    totalTranslations: number       // All-time translations done
    highestRainfallScore: number    // All-time highest rainfall score
    sectionsVisited: string[]       // App sections visited for Explorer badge
    easyLevelsCompleted: string[]   // Easy levels completed for Grammar Guru
  }
  badges: Record<string, {
    earned: boolean
    earnedDate?: string             // ISO date string
  }>
  totalXP: number                   // Cumulative XP earned
}
```

## Daily Challenges

| Challenge | Goal | XP Reward |
|-----------|------|-----------|
| Complete 3 Quiz Questions | Answer 3 questions correctly | 50 XP |
| Build 5 Sentences | Build 5 sentences in Sentence Builder | 75 XP |
| Play Word Rainfall | Score at least 100 points | 100 XP |

### Reset Logic
- Resets at midnight (local time)
- Progress is tracked per calendar day
- XP is awarded only once per day per challenge

## Weekly Challenges

| Challenge | Goal | XP Reward |
|-----------|------|-----------|
| 7-Day Streak | Practice for 7 consecutive days | 500 XP |
| Master All Tenses | Complete quiz levels for all 12 tenses | 750 XP |
| Perfect Score | Get 100% accuracy in any game | 300 XP |

### Reset Logic
- Resets every Monday
- Week starts on Monday (ISO week)

## Badges (14 Total)

### Starter Badges
| Badge ID | Name | Description | XP |
|----------|------|-------------|-----|
| `first-steps` | First Steps | Complete your first lesson | 25 XP |
| `quick-learner` | Quick Learner | Complete 10 lessons | 50 XP |

### Streak Badges
| Badge ID | Name | Description | XP |
|----------|------|-------------|-----|
| `dedicated-learner` | Dedicated Learner | Maintain a 7-day streak | 75 XP |
| `streak-master` | Streak Master | Maintain a 30-day streak | 200 XP |

### Activity Badges
| Badge ID | Name | Description | XP |
|----------|------|-------------|-----|
| `builder-pro` | Builder Pro | Build 50 sentences total | 100 XP |
| `rainfall-champion` | Rainfall Champion | Score 500+ in Word Rainfall | 150 XP |
| `translator` | Translator | Translate 20 sentences | 100 XP |
| `century-club` | Century Club | Answer 100 quiz questions | 150 XP |

### Mastery Badges
| Badge ID | Name | Description | XP |
|----------|------|-------------|-----|
| `grammar-guru` | Grammar Guru | Complete all 12 easy levels (70%+) | 200 XP |
| `perfect-score` | Perfect Score | Get 100% in any quiz | (via weekly) |
| `time-traveler` | Time Traveler | Master all 12 tenses | (via weekly) |

### Special Badges
| Badge ID | Name | Description | XP |
|----------|------|-------------|-----|
| `explorer` | Explorer | Visit all 8 app sections | 100 XP |
| `weekly-warrior` | Weekly Warrior | Complete all weekly challenges | 250 XP |
| `xp-hunter` | XP Hunter | Earn 1000 total XP | 100 XP |

### Badge Icons

```typescript
const badgeIcons: Record<string, LucideIcon> = {
  "first-steps": Star,
  "quick-learner": Zap,
  "dedicated-learner": Calendar,
  "streak-master": Flame,
  "builder-pro": Hammer,
  "rainfall-champion": Droplets,
  "translator": Languages,
  "century-club": Medal,
  "grammar-guru": Award,
  "perfect-score": CheckCircle,
  "time-traveler": Clock,
  "explorer": Compass,
  "weekly-warrior": Crown,
  "xp-hunter": Sparkles,
}
```

### Badge Triggers

```typescript
// First Steps - triggered on first correct quiz answer
recordQuizQuestion()

// Quick Learner - triggered after 10 lesson completions
recordLessonComplete(count)

// Dedicated Learner & Streak Master - triggered on streak milestones
recordStreakMaster(streak)  // Checks for both 7 and 30 day streaks

// Builder Pro - triggered after 50 total sentences built
recordSentenceBuilt()  // Tracks lifetime count

// Rainfall Champion - triggered on 500+ score
recordRainfallScore(score)  // Tracks highest lifetime score

// Translator - triggered after 20 translations
recordTranslation()  // Tracks lifetime count

// Century Club - triggered after 100 quiz questions
recordQuizQuestion()  // Tracks lifetime count

// Grammar Guru - triggered when all 12 easy levels completed
recordEasyLevelComplete(tenseName)

// Perfect Score - triggered on 100% accuracy
recordPerfectScore()

// Time Traveler - triggered when all 12 tenses completed
recordTenseCompleted(tenseName)

// Explorer - triggered when all 8 sections visited
recordSectionVisit(sectionName)

// Weekly Warrior - triggered when all weekly challenges complete
recordWeeklyComplete()

// XP Hunter - automatically checked when XP >= 1000
// (checked in recordQuizQuestion, recordSentenceBuilt, recordRainfallScore)
```

## Integration Points

### Quiz System
```typescript
// In quiz-system.tsx
const { recordQuizQuestion, recordTenseCompleted, recordPerfectScore, recordSectionVisit, recordEasyLevelComplete } = useChallenges()

// Track section visit
useEffect(() => {
  recordSectionVisit("quiz")
}, [recordSectionVisit])

// On correct answer
if (isCorrect) {
  recordQuizQuestion()  // Also tracks lifetime count for Century Club
}

// On level complete
recordTenseCompleted(level.title)

// On easy level complete with 70%+
if (difficulty === "easy" && percentage >= 70) {
  recordEasyLevelComplete(level.title)
}

// On 100% score
if (percentage === 100) {
  recordPerfectScore()
}
```

### Sentence Builder
```typescript
// In sentence-builder-game.tsx
const { recordSentenceBuilt, recordPerfectScore, recordSectionVisit } = useChallenges()

// Track section visit
useEffect(() => {
  recordSectionVisit("builder")
}, [recordSectionVisit])

// On correct sentence
if (correct) {
  recordSentenceBuilt()  // Also tracks lifetime count for Builder Pro
}

// On perfect session
if (allCorrect) {
  recordPerfectScore()
}
```

### Word Rainfall
```typescript
// In rainfall-game.tsx
const { recordRainfallScore, recordPerfectScore, recordSectionVisit } = useChallenges()

// Track section visit
useEffect(() => {
  recordSectionVisit("rainfall")
}, [recordSectionVisit])

// On game end
recordRainfallScore(score)  // Also tracks highest score for Rainfall Champion

// On perfect game (no wrong answers)
if (wrongCount === 0) {
  recordPerfectScore()
}
```

### Translation Tool
```typescript
// In translation-tool.tsx
const { recordTranslation, recordSectionVisit } = useChallenges()

// Track section visit
useEffect(() => {
  recordSectionVisit("translate")
}, [recordSectionVisit])

// On successful translation
recordTranslation()  // Tracks count for Translator badge
```

### Other Sections
All sections track visits for the Explorer badge:
- `quiz` - Quiz System
- `builder` - Sentence Builder
- `rainfall` - Word Rainfall Game
- `translate` - Translation Tool
- `tips` - Tips & Tricks
- `search` - Search Content
- `playground` - Tense Playground
- `challenges` - Challenges Page

### Header Streak Display
```typescript
// In header.tsx
const { currentStreak } = useStreakContext()

// Displays current streak with flame icon
<Flame className={cn("h-4 w-4", currentStreak > 0 && "text-orange-500")} />
<span>{currentStreak}</span>
```

## Component Structure

```
components/challenges/
├── challenges-content.tsx    # Main challenges page content
└── README.md                 # This file

components/providers/
└── streak-provider.tsx       # Streak context provider

hooks/
└── use-challenges.ts         # Challenges tracking hook
```

## UI Components

### Streak Card
- Large streak counter with flame icon
- Longest streak display
- Total days practiced
- Total XP earned
- "Practice Today" button

### Daily Challenges Cards
- Progress bar for each challenge
- XP reward badge
- "Go" button linking to relevant activity
- Checkmark when completed
- Countdown to reset

### Weekly Challenges Cards
- Progress tracking (e.g., 5/7 days)
- Larger XP rewards
- Countdown to weekly reset

### Badges Grid
- 2x3 grid on mobile, 3 columns on desktop
- 14 badges organized by category
- Grayed out when not earned
- Shows earned date when unlocked
- Unique icons for each badge type

## Styling

Uses theme colors:
- `future` - Streaks and weekly challenges (blue/purple)
- `present` - Daily challenges (green)
- `past` - Badges (orange/amber)

## Future Enhancements

Potential additions:
- [ ] Leaderboards
- [ ] Social sharing of achievements
- [ ] Custom challenge creation
- [ ] Seasonal/special event challenges
- [ ] Badge rarity tiers (Common, Rare, Epic, Legendary)
- [ ] XP levels with rewards
- [ ] Push notifications for streak reminders
- [ ] Monthly challenges
- [ ] Achievement notifications/toasts
