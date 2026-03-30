# 🧾 Invoice Tracker

## Description

Keep your invoicing organized and never miss a payment. Track all invoices, payment statuses, client details, and revenue in one clean Notion workspace.

## Features

- **Invoice Database** — All invoices in one searchable table
- **Payment Tracking** — Sent, Viewed, Paid, Overdue, Cancelled
- **Client Management** — Linked client profiles with billing history
- **Revenue Dashboard** — Monthly/quarterly revenue summaries
- **Overdue Alerts** — Visual flags for overdue invoices
- **Recurring Invoices** — Template entries for repeat billing

## Setup Instructions

1. Create a new page: "Invoice Tracker"
2. Create the **Invoices Database**:
   - Invoice # (Title)
   - Client (Text or Relation)
   - Amount (Number — Currency)
   - Status (Select: Draft, Sent, Viewed, Paid, Overdue, Cancelled)
   - Issue Date (Date)
   - Due Date (Date)
   - Paid Date (Date)
   - Description (Text)
   - Notes (Text)
3. Create a Table View sorted by Due Date
4. Create a Board View grouped by Status
5. Create a Calendar View for due dates

## Customization Tips

- Add a **Tax Rate** formula property for automatic calculations
- Use **Rollup** to show total invoiced per client
- Create filtered views for **Overdue Only** and **This Month**
- Add **Payment Method** property (Bank Transfer, PayPal, Stripe)

## Example Data

| Invoice # | Client | Amount | Status | Due Date |
|-----------|--------|--------|--------|----------|
| INV-001 | Acme Corp | $5,000 | Paid | Feb 15 |
| INV-002 | TechStart | $3,200 | Sent | Mar 1 |
| INV-003 | Global Solutions | $8,500 | Overdue | Feb 20 |
| INV-004 | Bright Ideas | $2,100 | Draft | Mar 15 |

## Mockup Preview

```
┌─────────────────────────────────────────────────┐
│  🧾 Invoice Tracker                             │
│─────────────────────────────────────────────────│
│  Total Invoiced: $18,800    Outstanding: $11,700│
│                                                   │
│  ✅ Paid       📤 Sent       ⚠️ Overdue          │
│  ┌──────────┐ ┌───────────┐ ┌──────────────────┐│
│  │INV-001   │ │INV-002    │ │INV-003           ││
│  │$5,000    │ │$3,200     │ │$8,500 ⚠️ 7 days  ││
│  │Acme Corp │ │TechStart  │ │Global Solutions  ││
│  └──────────┘ └───────────┘ └──────────────────┘│
└─────────────────────────────────────────────────┘
```
