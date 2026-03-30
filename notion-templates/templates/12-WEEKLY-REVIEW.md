# 🔄 Weekly Review

## Description

A structured weekly review system to reflect on the past week, celebrate wins, identify improvements, and plan the week ahead. Based on David Allen's GTD methodology and adapted for modern workflows.

## Features

- **Weekly Reflection** — What went well, what didn't, lessons learned
- **Wins & Celebrations** — Acknowledge achievements (big and small)
- **Priority Setting** — Top 3 priorities for next week
- **Energy & Mood Tracking** — How you felt throughout the week
- **Gratitude Log** — Things you're grateful for
- **Review Archive** — Searchable history of all weekly reviews

## Setup Instructions

1. Create a new page: "Weekly Review"
2. Create **Reviews Database**:
   - Week (Title — e.g., "Week 11 — Mar 9-15")
   - Date (Date)
   - Wins (Text — long)
   - Challenges (Text — long)
   - Lessons Learned (Text — long)
   - Gratitude (Text — long)
   - Energy Level (Select: 🔋🔋🔋🔋🔋 High, 🔋🔋🔋 Medium, 🔋 Low)
   - Mood (Select: 😊 Great, 🙂 Good, 😐 Okay, 😕 Tough)
   - Top Priorities Next Week (Text — long)
   - Goals Progress (Text)
   - Habits Check-in (Text)
3. Create **Next Week Tasks Database**:
   - Task (Title)
   - Review (Relation to Reviews)
   - Priority (Select: Must Do, Should Do, Nice to Have)
   - Category (Select: Work, Personal, Health, Learning)
   - Completed (Checkbox)
4. Create Table View sorted by Date (newest first)

## Customization Tips

- Schedule reviews for **Sunday evening** or **Monday morning**
- Add **Time Blocking** section for next week's schedule
- Link to your **Goal Setting** template for OKR progress updates
- Create a **Monthly Review** that aggregates 4 weekly reviews

## Example Data

| Week | Wins | Challenges | Energy | Mood |
|------|------|-----------|--------|------|
| Week 10 | Closed 2 deals, published blog | Missed gym 2x | 🔋🔋🔋 | 🙂 Good |
| Week 9 | Team shipped feature, family time | Deadline pressure | 🔋🔋🔋🔋 | 😊 Great |
| Week 8 | Hit revenue target, 7-day streak | Client conflict | 🔋🔋🔋 | 😐 Okay |

## Mockup Preview

```
┌─────────────────────────────────────────────────┐
│  🔄 Weekly Review — Week 11 (Mar 9-15)          │
│─────────────────────────────────────────────────│
│  🏆 Wins This Week                              │
│  • Closed Acme Corp deal ($12,500)              │
│  • Published "10 Tips" blog post                │
│  • 12-day meditation streak                     │
│                                                   │
│  🤔 Challenges                                   │
│  • Missed gym twice — schedule conflict          │
│  • API integration delayed                      │
│                                                   │
│  🎯 Top 3 Priorities Next Week                  │
│  1. Finalize TechStart proposal                 │
│  2. Complete API integration                    │
│  3. Prep for quarterly review                   │
│                                                   │
│  ⚡ Energy: 🔋🔋🔋🔋  Mood: 😊                 │
└─────────────────────────────────────────────────┘
```
