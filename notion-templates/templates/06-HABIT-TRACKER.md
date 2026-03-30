# ✅ Habit Tracker

## Description

Build better habits with visual streak tracking and daily logging. This template helps you establish routines, track consistency, and celebrate milestones with streak counters and progress charts.

## Features

- **Daily Habit Log** — Check off habits each day
- **Streak Counter** — Track consecutive days for each habit
- **Weekly View** — See your week at a glance
- **Monthly Review** — End-of-month habit performance summary
- **Habit Categories** — Health, Productivity, Learning, Mindfulness
- **Goal Setting** — Set targets (e.g., "Meditate 5x per week")

## Setup Instructions

1. Create a new page: "Habit Tracker"
2. Create **Habits Database**:
   - Habit Name (Title)
   - Category (Select: Health, Productivity, Learning, Mindfulness)
   - Frequency (Select: Daily, Weekdays, 3x/week, Weekly)
   - Current Streak (Number)
   - Best Streak (Number)
   - Start Date (Date)
   - Active (Checkbox)
3. Create **Daily Log Database**:
   - Date (Title)
   - Habit (Relation to Habits)
   - Completed (Checkbox)
   - Notes (Text)
4. Create a Calendar View showing daily completions
5. Create a Board View grouped by Category

## Customization Tips

- Add **Emoji Icons** to each habit for visual appeal
- Use **Formulas** to calculate completion percentage
- Create a **Morning Routine** and **Evening Routine** template page
- Add **Rewards** property for milestone celebrations

## Example Data

| Habit | Category | Frequency | Streak | Best |
|-------|----------|-----------|--------|------|
| 🧘 Meditate | Mindfulness | Daily | 12 days | 21 days |
| 📖 Read 30 min | Learning | Daily | 8 days | 15 days |
| 💪 Exercise | Health | 3x/week | 3 weeks | 6 weeks |
| 📝 Journal | Mindfulness | Daily | 5 days | 30 days |

## Mockup Preview

```
┌─────────────────────────────────────────────────┐
│  ✅ Habit Tracker — March 2026                  │
│─────────────────────────────────────────────────│
│          Mon  Tue  Wed  Thu  Fri  Sat  Sun      │
│  🧘       ✅   ✅   ✅   ✅   ✅   ✅   ⬜     │
│  📖       ✅   ✅   ⬜   ✅   ✅   ⬜   ⬜     │
│  💪       ✅   ⬜   ✅   ⬜   ✅   ⬜   ⬜     │
│  📝       ✅   ✅   ✅   ⬜   ✅   ✅   ✅     │
│                                                   │
│  🔥 Current Streaks                              │
│  🧘 12 days │ 📖 8 days │ 💪 3 weeks │ 📝 5 days│
└─────────────────────────────────────────────────┘
```
