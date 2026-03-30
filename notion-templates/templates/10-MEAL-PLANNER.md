# 🍽️ Meal Planner

## Description

Plan your meals for the week, generate grocery lists automatically, store your favorite recipes, and track nutrition. Say goodbye to "what's for dinner?" forever.

## Features

- **Weekly Meal Plan** — Breakfast, lunch, dinner, and snacks for each day
- **Recipe Database** — Store recipes with ingredients and instructions
- **Auto Grocery List** — Generated from your weekly meal plan
- **Nutrition Tracking** — Calories, macros per meal
- **Meal Prep Planner** — Batch cooking schedules
- **Dietary Filters** — Vegetarian, Vegan, Gluten-Free, Keto, etc.

## Setup Instructions

1. Create a new page: "Meal Planner"
2. Create **Recipes Database**:
   - Recipe Name (Title)
   - Cuisine (Select: Italian, Mexican, Asian, American, Mediterranean, Indian)
   - Meal Type (Multi-select: Breakfast, Lunch, Dinner, Snack)
   - Prep Time (Number — minutes)
   - Cook Time (Number — minutes)
   - Servings (Number)
   - Calories (Number)
   - Ingredients (Text — long)
   - Instructions (Text — long)
   - Dietary Tags (Multi-select: Vegetarian, Vegan, Gluten-Free, Keto, Dairy-Free)
   - Rating (Select: ⭐⭐⭐⭐⭐ to ⭐)
   - Image (Files & Media)
3. Create **Meal Plan Database**:
   - Day (Title or Date)
   - Meal (Select: Breakfast, Lunch, Dinner, Snack)
   - Recipe (Relation to Recipes)
   - Week (Select: Week 1, Week 2, etc.)
4. Create **Grocery List Database**:
   - Item (Title)
   - Category (Select: Produce, Dairy, Meat, Pantry, Frozen)
   - Quantity (Text)
   - Purchased (Checkbox)

## Customization Tips

- Add **Cost** property to recipes for budget tracking
- Create **2-Week Rotation** templates for meal prep
- Use **Board View** grouped by Meal Type
- Add **Leftovers** tracking to reduce food waste

## Example Data

| Recipe | Cuisine | Meal Type | Prep Time | Rating |
|--------|---------|-----------|-----------|--------|
| Overnight Oats | American | Breakfast | 10 min | ⭐⭐⭐⭐⭐ |
| Chicken Stir Fry | Asian | Dinner | 25 min | ⭐⭐⭐⭐ |
| Greek Salad | Mediterranean | Lunch | 15 min | ⭐⭐⭐⭐⭐ |
| Energy Bites | American | Snack | 15 min | ⭐⭐⭐⭐ |

## Mockup Preview

```
┌─────────────────────────────────────────────────┐
│  🍽️ Meal Planner — Week of Mar 10              │
│─────────────────────────────────────────────────│
│  Monday                                         │
│  🌅 Overnight Oats                              │
│  🌞 Greek Salad + Grilled Chicken              │
│  🌙 Chicken Stir Fry with Rice                 │
│                                                   │
│  Tuesday                                        │
│  🌅 Smoothie Bowl                               │
│  🌞 Turkey Wrap                                 │
│  🌙 Pasta Primavera                             │
│                                                   │
│  🛒 Grocery List (8 items)                      │
│  ☐ Chicken breast (2 lbs)                      │
│  ☐ Greek yogurt (32 oz)                        │
│  ☐ Mixed greens (1 bag)                        │
│  ☐ Bell peppers (3)                            │
└─────────────────────────────────────────────────┘
```
