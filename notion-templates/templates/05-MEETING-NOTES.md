# 📝 Meeting Notes

## Description

Never lose track of what was discussed in a meeting. This template helps you prepare agendas, capture notes, assign action items, and document decisions — all linked to your projects and team.

## Features

- **Meeting Database** — All meetings in one searchable archive
- **Agenda Template** — Pre-meeting preparation with talking points
- **Action Items** — Linked tasks with assignees and due dates
- **Decisions Log** — Track important decisions made in meetings
- **Attendee Tracking** — Who was there and who was absent
- **Follow-up Reminders** — Never forget to send meeting recap

## Setup Instructions

1. Create a new page: "Meeting Notes"
2. Create the **Meetings Database**:
   - Meeting Title (Title)
   - Date (Date)
   - Attendees (Multi-select or Person)
   - Meeting Type (Select: Standup, 1-on-1, Team Sync, Client Call, All-Hands)
   - Project (Relation to Projects database)
   - Agenda (Text — long)
   - Notes (Text — long)
   - Decisions (Text)
   - Follow-up Date (Date)
3. Create **Action Items Database**:
   - Task (Title)
   - Meeting (Relation to Meetings)
   - Assignee (Person)
   - Due Date (Date)
   - Status (Select: Open, In Progress, Done)
4. Create Calendar View by Date

## Customization Tips

- Use **Database Templates** for different meeting types (standup, 1-on-1, retro)
- Add **Recording Link** property for video call recordings
- Create a **Weekly Review** view showing all meetings from the past week
- Link to your **Project Manager** template for cross-referencing

## Example Data

| Meeting | Date | Type | Attendees | Action Items |
|---------|------|------|-----------|-------------|
| Sprint Planning | Mar 10 | Team Sync | Sarah, Mike, Amy | 5 |
| Client Check-in | Mar 8 | Client Call | Sarah, David | 3 |
| 1-on-1 with Mike | Mar 7 | 1-on-1 | Sarah, Mike | 2 |
| Retro: Sprint 2 | Mar 5 | Team Sync | Full Team | 8 |

## Mockup Preview

```
┌─────────────────────────────────────────────────┐
│  📝 Meeting Notes                               │
│─────────────────────────────────────────────────│
│  Sprint Planning — Mar 10, 2026                 │
│  Attendees: Sarah, Mike, Amy, David             │
│                                                   │
│  📋 Agenda                                       │
│  ├─ Sprint 2 Review                             │
│  ├─ Sprint 3 Goals                              │
│  └─ Blocker Discussion                          │
│                                                   │
│  ✅ Action Items                                 │
│  ☐ Update API docs — Mike — Due Mar 12         │
│  ☐ Design review — Amy — Due Mar 11            │
│  ☐ Deploy staging — David — Due Mar 13         │
└─────────────────────────────────────────────────┘
```
