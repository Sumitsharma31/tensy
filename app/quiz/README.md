# Grammar Quiz System

A level-based quiz system for practicing English grammar tenses with MCQ questions.

## 📁 File Structure

```
app/quiz/
├── page.tsx          # Quiz page component
├── loading.tsx       # Loading state
└── README.md         # This file

components/quiz/
└── quiz-system.tsx   # Main quiz logic

data/sentence/
├── easy.json         # Easy level questions
├── medium.json       # Medium level questions
└── hard.json         # Hard level questions
```

## 🎮 How It Works

### Level Generation

Levels are **automatically generated** from JSON data:

```
Total Sentences ÷ 5 = Number of Levels
```

| Data File | Sentences | Levels |
|-----------|-----------|--------|
| easy.json | 151 | 31 levels |
| medium.json | ? | ? levels |
| hard.json | ? | ? levels |

### Adding More Levels

Simply add more sentences to the JSON files. Each **5 sentences = 1 new level**.

## 📊 JSON Data Format

Each sentence in the JSON should have this structure:

```json
{
  "sentences": [
    {
      "tense": {
        "name": "Simple Present"
      },
      "translations": {
        "en": "She plays tennis every day."
      },
      "quiz": {
        "type": "mcq",
        "question": "She ___ tennis every day.",
        "options": ["play", "plays", "playing", "played"],
        "answerIndex": 1,
        "explanation": "Use 'plays' for third person singular in simple present."
      }
    }
  ]
}
```

### Quiz Fields

| Field | Description |
|-------|-------------|
| `type` | Question type: `"mcq"` or `"correction"` |
| `question` | The question with blank (___) |
| `options` | Array of 4 answer choices |
| `answerIndex` | Index of correct answer (0-3) |
| `explanation` | Shown after answering |

## 🔀 Option Shuffling

Options are **shuffled randomly** each time using the Fisher-Yates algorithm:

1. Original: `["play", "plays", "playing", "played"]` (correct: index 1)
2. Shuffled: `["played", "plays", "play", "playing"]` (correct: new index)

The system tracks the new correct index after shuffling.

## 🎯 Scoring System

| Score | Result | Stars |
|-------|--------|-------|
| 90%+ | ⭐ Excellent (Green) | 3 stars |
| 60-89% | ✅ Passed (Orange) | 2 stars |
| < 60% | ❌ Failed (Red) | 1 star |

### Level Colors

- 🟢 **Green** - Score ≥ 90%
- 🟠 **Orange** - Score 60-89%
- 🔴 **Red** - Score < 60%

## 🔓 Level Unlocking

- Level 1 is always unlocked
- Complete previous level to unlock next
- Can replay any completed level

## 💾 Progress Storage

Progress is saved in `localStorage`:

```javascript
Key: "tense-playground-quiz-levels"

Value: {
  "easy": { 1: 80, 2: 100, 3: 60 },
  "medium": { 1: 90 },
  "hard": {}
}
```

Format: `{ difficulty: { levelNumber: scorePercentage } }`

## 📱 Views

### 1. Levels View
- Header stats (progress, correct/wrong %)
- Difficulty tabs (Easy/Medium/Hard)
- Level grid (clickable buttons)
- Practice Insights (needs practice / mastered)

### 2. Quiz View
- Progress bar with question dots
- Question card with MCQ options
- Explanation after answering
- Next/Complete button

### 3. Result View
- Score display (correct/wrong/total)
- Stars rating
- Wrong answers review
- Retry/Next Level buttons

## 🛠️ Key Functions

| Function | Purpose |
|----------|---------|
| `shuffleArray()` | Fisher-Yates shuffle for options |
| `transformSentenceData()` | Converts JSON to Level[] format |
| `generateLevels()` | Maps difficulty to JSON file |
| `getLevelScore()` | Returns stored score for a level |
| `getLevelColor()` | Returns color class based on score |
| `isLevelUnlocked()` | Checks if level is accessible |

## 🎨 Difficulty Colors

| Difficulty | Color | CSS Class |
|------------|-------|-----------|
| Easy | Green | `bg-present` |
| Medium | Blue | `bg-future` |
| Hard | Red | `bg-past` |

## ✨ Features

- ✅ Dynamic level generation from JSON
- ✅ Shuffled MCQ options
- ✅ Progress persistence (localStorage)
- ✅ Wrong answer review
- ✅ Performance-based colors
- ✅ Mobile responsive design
- ✅ Practice insights (weak areas)
- ✅ Level unlocking system

## 🚀 To Add More Questions

1. Open `data/sentence/easy.json` (or medium/hard)
2. Add new sentence objects to the `sentences` array
3. Follow the JSON format above
4. Save the file
5. New levels appear automatically!

**Formula:** Every 5 new sentences = 1 new level
