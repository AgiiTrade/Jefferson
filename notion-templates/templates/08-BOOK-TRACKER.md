# 📚 Book Tracker

## Description

Organize your reading life with this beautiful book tracker. Manage your reading list, take notes, write reviews, track your reading goals, and build a personal library.

## Features

- **Reading List** — Want to Read, Reading, Finished, DNF (Did Not Finish)
- **Book Database** — Title, author, genre, pages, rating, cover
- **Reading Notes** — Key takeaways and highlights per book
- **Reviews** — Write and store your book reviews
- **Reading Goals** — Annual book/page targets with progress
- **Library View** — Visual gallery of book covers

## Setup Instructions

1. Create a new page: "Book Tracker"
2. Create **Books Database**:
   - Title (Title)
   - Author (Text)
   - Genre (Multi-select: Fiction, Non-Fiction, Business, Self-Help, Sci-Fi, Biography)
   - Pages (Number)
   - Rating (Select: ⭐⭐⭐⭐⭐, ⭐⭐⭐⭐, ⭐⭐⭐, ⭐⭐, ⭐)
   - Status (Select: Want to Read, Reading, Finished, DNF)
   - Start Date (Date)
   - Finish Date (Date)
   - Cover (Files & Media)
   - Review (Text — long)
   - Key Takeaways (Text — long)
   - Favorite Quotes (Text — long)
3. Create Gallery View for visual library
4. Create Table View sorted by Rating
5. Create Board View grouped by Status

## Customization Tips

- Add **Page Progress** number property for reading progress bar
- Use **Formulas** to calculate reading speed (pages/day)
- Create **Monthly Reading** views for each month
- Add **Borrowed/Lent** property to track book loans

## Example Data

| Title | Author | Pages | Rating | Status |
|-------|--------|-------|--------|--------|
| Atomic Habits | James Clear | 320 | ⭐⭐⭐⭐⭐ | Finished |
| Project Hail Mary | Andy Weir | 496 | ⭐⭐⭐⭐⭐ | Finished |
| Deep Work | Cal Newport | 304 | ⭐⭐⭐⭐ | Reading |
| The Psychology of Money | Morgan Housel | 256 | ⭐⭐⭐⭐⭐ | Want to Read |

## Mockup Preview

```
┌─────────────────────────────────────────────────┐
│  📚 Book Tracker — 2026 Reading Goal: 24 books │
│─────────────────────────────────────────────────│
│  Progress: 8/24 ████████░░░░░░░░░░░░░░ 33%     │
│                                                   │
│  📖 Currently Reading                            │
│  ┌─────────────────────────────────────────────┐│
│  │ Deep Work — Cal Newport                     ││
│  │ Page 142/304  ████████████░░░░░░░░░ 47%     ││
│  └─────────────────────────────────────────────┘│
│                                                   │
│  ⭐ Recent Reads                                 │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│  │Atomic  │ │Project │ │Thinking│ │1984    │   │
│  │Habits  │ │Hail    │ │Fast &  │ │        │   │
│  │⭐⭐⭐⭐⭐│ │Mary    │ │Slow    │ │⭐⭐⭐⭐  │   │
│  │        │ │⭐⭐⭐⭐⭐│ │⭐⭐⭐⭐  │ │        │   │
│  └────────┘ └────────┘ └────────┘ └────────┘   │
└─────────────────────────────────────────────────┘
```
