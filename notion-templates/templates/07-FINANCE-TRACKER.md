# 💰 Finance Tracker

## Description

Take control of your money with this comprehensive finance tracker. Monitor income, track expenses, set budgets, and watch your investments grow — all in one Notion workspace.

## Features

- **Income Tracker** — Salary, freelance, side income, passive income
- **Expense Tracker** — Categorized spending with receipt uploads
- **Budget Manager** — Monthly budgets by category with progress bars
- **Investment Portfolio** — Track stocks, crypto, retirement accounts
- **Net Worth Dashboard** — Assets minus liabilities, updated monthly
- **Financial Goals** — Emergency fund, vacation, house down payment

## Setup Instructions

1. Create a new page: "Finance Tracker"
2. Create **Transactions Database**:
   - Description (Title)
   - Amount (Number — Currency)
   - Type (Select: Income, Expense)
   - Category (Select: Housing, Food, Transport, Entertainment, Utilities, Salary, Freelance)
   - Date (Date)
   - Payment Method (Select: Credit Card, Debit, Cash, Bank Transfer)
   - Recurring (Checkbox)
   - Receipt (Files & Media)
3. Create **Budgets Database**:
   - Category (Title)
   - Monthly Budget (Number)
   - Spent (Rollup from Transactions)
   - Remaining (Formula)
4. Create **Investments Database**:
   - Asset (Title)
   - Type (Select: Stock, Crypto, Retirement, Real Estate)
   - Value (Number)
   - Purchase Price (Number)
   - Gain/Loss (Formula)
5. Create Table View sorted by Date (newest first)

## Customization Tips

- Add **Tags** for tax-deductible expenses
- Use **Formulas** for automatic budget calculations
- Create **Monthly Summary** pages with rollups
- Set up **Savings Rate** calculation: (Income - Expenses) / Income

## Example Data

| Transaction | Amount | Type | Category | Date |
|-------------|--------|------|----------|------|
| Monthly Salary | $5,000 | Income | Salary | Mar 1 |
| Grocery Shopping | $180 | Expense | Food | Mar 3 |
| Netflix | $15.99 | Expense | Entertainment | Mar 1 |
| Freelance Project | $2,500 | Income | Freelance | Mar 5 |

## Mockup Preview

```
┌─────────────────────────────────────────────────┐
│  💰 Finance Dashboard — March 2026              │
│─────────────────────────────────────────────────│
│  Income: $7,500    Expenses: $3,200    Save: 57%│
│                                                   │
│  📊 Budget Progress                              │
│  Housing    ████████░░░░░░  $1,200 / $1,500     │
│  Food       ██████░░░░░░░░  $450 / $600         │
│  Transport  ████░░░░░░░░░░  $180 / $400         │
│  Fun        ████████████░░  $280 / $300 ⚠️      │
│                                                   │
│  💼 Net Worth: $42,500 (↑ 3.2% this month)      │
└─────────────────────────────────────────────────┘
```
