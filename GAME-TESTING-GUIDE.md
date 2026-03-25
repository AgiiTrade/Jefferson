# 🎮 Game Testing Guide — Vocab Master Pro & QuestMind
## Use this tomorrow (March 26) to test both games

---

## 📋 VOCAB MASTER PRO TESTING CHECKLIST

### Basic Functionality
- [ ] App loads without errors
- [ ] All 2,540 words load correctly
- [ ] 5 difficulty levels accessible
- [ ] Score counter works
- [ ] Progress saves between sessions
- [ ] Sound effects play (if any)

### Gameplay
- [ ] Questions display correctly
- [ ] No duplicate words in single session
- [ ] Timer works (if applicable)
- [ ] Skip button functions
- [ ] Hint system works
- [ ] Level progression works
- [ ] End-of-game summary shows

### Edge Cases
- [ ] Play through ALL 2,540 words (no crashes)
- [ ] Switch difficulty mid-game
- [ ] Close and reopen (progress preserved?)
- [ ] Play with no internet connection
- [ ] Play on slow connection
- [ ] Rapid clicking/tapping

### Ads
- [ ] Banner ad displays
- [ ] Interstitial ad shows at correct times
- [ ] Ads don't block gameplay
- [ ] Ad dismissal works
- [ ] No ad crashes

### UI/UX
- [ ] All buttons clickable
- [ ] Text readable on small screens
- [ ] Colors contrast properly
- [ ] Animations smooth
- [ ] No visual glitches

---

## 📋 QUESTMIND TESTING CHECKLIST

### Basic Functionality
- [ ] App loads without errors
- [ ] All 3,103 questions load correctly
- [ ] 4 categories accessible (Math, Science, English, History)
- [ ] Grades 1-8 selection works
- [ ] Score counter works
- [ ] Progress saves

### Gameplay
- [ ] Questions display correctly
- [ ] No duplicate questions in single session
- [ ] Answer feedback shows (correct/wrong)
- [ ] Score tracking accurate
- [ ] Category switching works
- [ ] Grade level affects questions

### Edge Cases
- [ ] Play through ALL 3,103 questions (no crashes)
- [ ] Switch grade mid-game
- [ ] Switch category mid-game
- [ ] Close and reopen (progress preserved?)
- [ ] Offline mode works
- [ ] Rapid answer selection

### Ads
- [ ] Banner ad displays
- [ ] Interstitial ad shows correctly
- [ ] Ads don't block questions
- [ ] No ad crashes

### UI/UX
- [ ] All buttons clickable
- [ ] Question text clear
- [ ] Answer buttons responsive
- [ ] Timer visible (if applicable)
- [ ] No visual glitches

---

## 🐛 BUG TRACKING TEMPLATE

For each bug found, use this format:

```
### BUG #[number]
**Game:** Vocab Master Pro / QuestMind
**Severity:** Critical / High / Medium / Low
**Description:** [What happened]
**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]
**Expected:** [What should happen]
**Actual:** [What actually happened]
**Screenshot:** [If applicable]
```

---

## 🔧 QUICK FIX CHECKLIST

Common issues and quick fixes:

| Issue | Quick Fix |
|-------|-----------|
| Words repeat | Check question pool logic |
| Score doesn't save | Check localStorage |
| Ads not showing | Check ad unit IDs |
| App crashes | Check console for errors |
| Slow loading | Check question file size |
| Buttons unresponsive | Check event listeners |

---

## 📊 TESTING SCORECARD

Track your testing progress:

| Category | Vocab Master | QuestMind |
|----------|-------------|-----------|
| Basic Load | /10 | /10 |
| Gameplay | /10 | /10 |
| Edge Cases | /10 | /10 |
| Ads | /10 | /10 |
| UI/UX | /10 | /10 |
| **TOTAL** | **/50** | **/50** |

**Passing score: 40/50 per game**

---

## 🎯 TOMORROW'S PLAN

1. **Morning:** Test Vocab Master Pro (1-2 hours)
2. **Afternoon:** Test QuestMind (1-2 hours)
3. **Evening:** Log bugs, prioritize fixes

**Message me when you start testing — I'll help fix any bugs you find!**

---

*Created: March 25, 2026*
