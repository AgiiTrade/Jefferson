# 👥 CRM Template

## Description

A comprehensive Client Relationship Management system built in Notion. Track your entire sales pipeline from lead to close, manage client relationships, log interactions, and never miss a follow-up again.

## Features

- **Client Database** — Store all client information in one place
- **Deal Pipeline** — Visual kanban board from Discovery → Proposal → Negotiation → Won/Lost
- **Follow-up Reminders** — Automated date-based reminders for next contact
- **Interaction Log** — Track every call, email, and meeting
- **Revenue Dashboard** — See your total pipeline value at a glance
- **Client Tags** — Categorize by industry, size, or source

## Setup Instructions

1. Open Notion and create a new page called "CRM Dashboard"
2. Click the **⋯** menu → **Import** → Select the template file
3. Create these database properties:
   - **Client Name** (Title)
   - **Company** (Text)
   - **Email** (Email)
   - **Phone** (Phone)
   - **Deal Value** (Number — Currency)
   - **Status** (Select: Discovery, Proposal, Negotiation, Won, Lost)
   - **Source** (Select: Referral, Website, LinkedIn, Cold Outreach)
   - **Next Follow-up** (Date)
   - **Notes** (Text)
4. Create a **Board View** grouped by Status
5. Create a **Table View** sorted by Next Follow-up
6. Add a **Calendar View** for follow-up dates

## Customization Tips

- Add an **Industry** property to segment clients
- Create a **Linked Database** on your dashboard for quick access
- Use **Formulas** to calculate days since last contact
- Set up **Notifications** for overdue follow-ups

## Example Data

| Client | Company | Deal Value | Status | Next Follow-up |
|--------|---------|-----------|--------|----------------|
| Sarah Johnson | Acme Corp | $12,500 | Won | Mar 15 |
| Mike Chen | TechStart | $8,200 | Negotiation | Mar 10 |
| Amy Williams | Global Solutions | $25,000 | Discovery | Mar 8 |
| David Lee | Bright Ideas | $5,500 | Proposal | Mar 12 |

## Mockup Preview

```
┌─────────────────────────────────────────────────┐
│  👥 CRM Dashboard                               │
│─────────────────────────────────────────────────│
│  📊 Pipeline Value: $51,200                     │
│                                                  │
│  Discovery    Proposal    Negotiation    Won     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐│
│  │ Global  │ │ Bright  │ │TechStart│ │ Acme   ││
│  │$25,000  │ │ $5,500  │ │ $8,200  │ │$12,500 ││
│  └─────────┘ └─────────┘ └─────────┘ └────────┘│
└─────────────────────────────────────────────────┘
```
