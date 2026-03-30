# 🎓 Learning Hub

## Description

A centralized learning management system for all your courses, tutorials, books, and educational resources. Track progress, take notes, and build a personal knowledge base that grows with you.

## Features

- **Course Tracker** — Online courses with module-by-module progress
- **Resource Library** — Articles, videos, podcasts saved and categorized
- **Learning Notes** — Structured notes linked to courses/resources
- **Skill Map** — Visual overview of skills being developed
- **Learning Goals** — What you want to learn and by when
- **Spaced Repetition** — Review schedule for key concepts

## Setup Instructions

1. Create a new page: "Learning Hub"
2. Create **Courses Database**:
   - Course Name (Title)
   - Platform (Select: Udemy, Coursera, YouTube, LinkedIn Learning, Book, Other)
   - Topic (Multi-select: Programming, Design, Business, Marketing, Data, Leadership)
   - Status (Select: Not Started, In Progress, Completed, Paused)
   - Progress (Number — percentage)
   - Start Date (Date)
   - Target Completion (Date)
   - Rating (Select: ⭐⭐⭐⭐⭐ to ⭐)
   - Key Takeaways (Text — long)
   - Certificate (Files & Media)
3. Create **Lessons/Modules Database**:
   - Lesson Title (Title)
   - Course (Relation to Courses)
   - Completed (Checkbox)
   - Notes (Text — long)
   - Duration (Number — minutes)
4. Create **Resources Database**:
   - Title (Title)
   - URL (URL)
   - Type (Select: Article, Video, Podcast, Tutorial, Documentation)
   - Topic (Multi-select)
   - Read/Watched (Checkbox)
   - Key Insights (Text)
   - Saved Date (Date)
5. Create Board View grouped by Status

## Customization Tips

- Add **Daily Learning** time-block (e.g., 30 min/day goal)
- Create **Spaced Repetition** database for key concepts to review
- Use **Formulas** to calculate total learning hours
- Link notes back to **Journal** entries for reflection

## Example Data

| Course | Platform | Topic | Progress | Status |
|--------|----------|-------|----------|--------|
| Python Bootcamp | Udemy | Programming | 65% | In Progress |
| Product Management | Coursera | Business | 100% | Completed |
| Data Analytics | YouTube | Data | 30% | In Progress |
| Leadership 101 | LinkedIn | Leadership | 0% | Not Started |

## Mockup Preview

```
┌─────────────────────────────────────────────────┐
│  🎓 Learning Hub                                │
│─────────────────────────────────────────────────│
│  Currently Learning                             │
│  ┌─────────────────────────────────────────────┐│
│  │ Python Bootcamp — Udemy                     ││
│  │ Module 12/18  ████████████████░░░░░░ 65%   ││
│  │ ⏱️ 24 hrs completed                         ││
│  └─────────────────────────────────────────────┘│
│                                                   │
│  📊 Learning Stats                               │
│  Courses Active: 3  │  Completed: 7             │
│  Hours This Month: 18  │  Streak: 15 days       │
│                                                   │
│  📚 Resource Queue (unread)                      │
│  • "Advanced React Patterns" — Article           │
│  • "Data Viz Best Practices" — Video             │
│  • "The Lean Startup" — Book                    │
└─────────────────────────────────────────────────┘
```
