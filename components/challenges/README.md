# Challenges & Gamification System 🏆

This document describes the challenges, streaks, badges, and XP system implemented in Tense Playground.

## Overview

The gamification system encourages daily practice through:
- **Daily Challenges** - Reset every midnight
- **Weekly Challenges** - Reset every Monday
- **Badges** - Permanent achievements
- **XP Points** - Cumulative rewards
- **Streak Tracking** - Consecutive days of practice

## Architecture

### Hooks

#### `useChallenges` ([use-challenges.ts](../../hooks/use-challenges.ts))
Main hook for tracking all challenge progress.

```tsx
const {
  isLoaded,
  totalXP,
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
| `tense-playground-challenges` | Daily/weekly progress, badges, XP |
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
    lastReset: string               // Date of week start (YYYY-MM-DD)
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

## Badges

| Badge ID | Name | Description | XP |
|----------|------|-------------|-----|
| `first-steps` | First Steps | Complete your first lesson | 25 XP |
| `quick-learner` | Quick Learner | Complete 10 lessons | 50 XP |
| `grammar-guru` | Grammar Guru | Complete all easy levels | - |
| `streak-master` | Streak Master | Maintain a 30-day streak | 200 XP |
| `perfect-score` | Perfect Score | Get 100% in any quiz | (via weekly) |
| `time-traveler` | Time Traveler | Master all 12 tenses | (via weekly) |

### Badge Triggers

```typescript
// First Steps - triggered on first correct quiz answer
recordQuizQuestion()

// Quick Learner - triggered after 10 lesson completions
recordLessonComplete(count)

// Streak Master - triggered when streak reaches 30
recordStreakMaster(streak)

// Perfect Score - triggered on 100% accuracy
recordPerfectScore()

// Time Traveler - triggered when all 12 tenses completed
recordTenseCompleted(tenseName)
```

## Integration Points

### Quiz System
```typescript
// In quiz-system.tsx
const { recordQuizQuestion, recordTenseCompleted, recordPerfectScore } = useChallenges()

// On correct answer
if (isCorrect) {
  recordQuizQuestion()
}

// On level complete
recordTenseCompleted(level.title)

// On 100% score
if (percentage === 100) {
  recordPerfectScore()
}
```

### Sentence Builder
```typescript
// In sentence-builder-game.tsx
const { recordSentenceBuilt, recordPerfectScore } = useChallenges()

// On correct sentence
if (correct) {
  recordSentenceBuilt()
}

// On perfect session
if (allCorrect) {
  recordPerfectScore()
}
```

### Word Rainfall
```typescript
// In rainfall-game.tsx
const { recordRainfallScore, recordPerfectScore } = useChallenges()

// On game end
recordRainfallScore(score)

// On perfect game (no wrong answers)
if (wrongCount === 0) {
  recordPerfectScore()
}
```

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
- Grayed out when not earned
- Shows earned date when unlocked

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
- [ ] Badge rarity tiers
- [ ] XP levels with rewards
- [ ] Push notifications for streak reminders
