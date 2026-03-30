# 💪 Workout Log

## Description

Track your fitness journey with this detailed workout log. Log exercises, sets, reps, and weights. Monitor progress over time, plan workout splits, and crush your fitness goals.

## Features

- **Exercise Library** — Pre-populated database of common exercises
- **Workout Log** — Daily workout entries with sets/reps/weight
- **Progress Tracking** — See strength gains over time
- **Workout Splits** — PPL, Upper/Lower, Full Body templates
- **Body Measurements** — Track weight, body fat, measurements
- **Personal Records** — Auto-highlighted PRs

## Setup Instructions

1. Create a new page: "Workout Log"
2. Create **Workouts Database**:
   - Date (Title)
   - Workout Type (Select: Push, Pull, Legs, Upper, Lower, Full Body, Cardio)
   - Duration (Number — minutes)
   - Notes (Text)
   - Mood (Select: 💪 Great, 😊 Good, 😐 Okay, 😫 Tired)
3. Create **Exercises Database**:
   - Exercise Name (Title)
   - Muscle Group (Select: Chest, Back, Shoulders, Arms, Legs, Core, Cardio)
   - Workout (Relation to Workouts)
   - Sets (Number)
   - Reps (Text — e.g., "8-10")
   - Weight (Number — lbs/kg)
   - Notes (Text)
4. Create **Body Stats Database**:
   - Date (Date)
   - Weight (Number)
   - Body Fat % (Number)
   - Notes (Text)
5. Create Calendar View for workout schedule

## Customization Tips

- Add **RPE** (Rate of Perceived Exertion) property for intensity tracking
- Create **Workout Templates** for each split day
- Use **Formulas** to calculate total volume (sets × reps × weight)
- Add **Progress Photos** with the Files & Media property

## Example Data

| Date | Type | Duration | Exercises |
|------|------|----------|-----------|
| Mar 10 | Push | 65 min | Bench, OHP, Dips, Tricep |
| Mar 9 | Pull | 55 min | Deadlift, Rows, Curls |
| Mar 8 | Legs | 70 min | Squats, Lunges, Leg Press |
| Mar 7 | Rest | — | Stretching, Walk |

## Mockup Preview

```
┌─────────────────────────────────────────────────┐
│  💪 Workout Log — Push Day                      │
│─────────────────────────────────────────────────│
│  Bench Press                                    │
│  Set 1: 185 lbs × 8  ✅                         │
│  Set 2: 185 lbs × 8  ✅                         │
│  Set 3: 185 lbs × 7  ✅                         │
│  Set 4: 185 lbs × 6  ✅                         │
│                                                   │
│  Overhead Press                                 │
│  Set 1: 115 lbs × 8  ✅                         │
│  Set 2: 115 lbs × 7  ✅                         │
│  Set 3: 115 lbs × 6  ✅                         │
│                                                   │
│  🔥 Total Volume: 12,450 lbs                    │
│  🏆 New PR: Bench 185×8 (prev: 180×8)          │
└─────────────────────────────────────────────────┘
```
