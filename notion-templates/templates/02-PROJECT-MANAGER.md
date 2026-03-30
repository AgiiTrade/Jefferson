# 📊 Project Manager

## Description

A full-featured project management system with sprint planning, task tracking, timeline views, and team collaboration. Perfect for teams of any size or solo operators managing multiple projects.

## Features

- **Project Dashboard** — Overview of all active projects
- **Task Board** — Kanban view: Backlog → To Do → In Progress → Review → Done
- **Sprint Planning** — 2-week sprint cycles with velocity tracking
- **Timeline View** — Gantt-style visualization of project schedules
- **Team Assignment** — Assign tasks with workload visibility
- **Priority Levels** — Urgent, High, Medium, Low with color coding

## Setup Instructions

1. Create a new page: "Project Manager"
2. Import the template or build manually:
3. Create **Projects Database**:
   - Project Name (Title)
   - Status (Select: Planning, Active, On Hold, Complete)
   - Start Date / End Date (Date)
   - Team Lead (Person)
   - Budget (Number)
4. Create **Tasks Database**:
   - Task Name (Title)
   - Project (Relation to Projects)
   - Assignee (Person)
   - Priority (Select: Urgent, High, Medium, Low)
   - Status (Select: Backlog, To Do, In Progress, Review, Done)
   - Sprint (Select: Sprint 1, Sprint 2, etc.)
   - Due Date (Date)
   - Story Points (Number)
5. Create Board View grouped by Status
6. Create Timeline View for project schedules

## Customization Tips

- Add **Tags** for task categories (Bug, Feature, Improvement)
- Use **Rollup** to calculate total story points per sprint
- Create a **Dashboard** with linked databases filtered by assignee
- Set up **Sprint Velocity** formula: completed points / sprint

## Example Data

| Task | Project | Assignee | Priority | Status | Points |
|------|---------|----------|----------|--------|--------|
| Design homepage | Website Redesign | Sarah | High | In Progress | 5 |
| API integration | Mobile App | Mike | Urgent | To Do | 8 |
| Write documentation | Website Redesign | Amy | Medium | Backlog | 3 |
| User testing | Mobile App | David | High | Review | 5 |

## Mockup Preview

```
┌─────────────────────────────────────────────────┐
│  📊 Project Manager                             │
│─────────────────────────────────────────────────│
│  Backlog   To Do    In Progress   Review   Done │
│  ┌──────┐ ┌──────┐ ┌──────────┐ ┌──────┐ ┌────┐│
│  │ Docs │ │ API  │ │Homepage  │ │Test  │ │Logo││
│  │ 3pts │ │ 8pts │ │ 5pts     │ │ 5pts │ │2pts││
│  └──────┘ └──────┘ └──────────┘ └──────┘ └────┘│
│                                                   │
│  Sprint 3: 15/23 points (65%) ████████░░░░░░    │
└─────────────────────────────────────────────────┘
```
