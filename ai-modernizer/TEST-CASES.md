# AI Modernization Platform — Functional & Non-Functional Test Cases

## Scope
Platform under test: Agii AI Modernizer / Siebel Migration Demo

Core modules:
- Public modernization landing page
- Legacy code analysis API
- Contact / pilot request flow
- User registration/login/history
- Siebel migration demo
- Executive dashboard
- Legacy Siebel view
- Migration factory cockpit
- Data quality dashboard
- Integration modernization dashboard
- Modern Customer 360 CRM
- AI case queue and workflow actions
- Testing/parity dashboard
- Backend health/ops endpoints

---

# Functional Test Cases

## 1. Platform Availability & Navigation

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| FT-001 | Load main AI Modernizer homepage | Open `/` | Page loads without blank screen/errors | High |
| FT-002 | Load Siebel demo page | Open `/siebel-demo/` | Enterprise Siebel demo loads | High |
| FT-003 | Navigate all Siebel demo tabs | Click Executive, Legacy, Factory, Data, Integrations, Modern, Testing, Backend Proof | Each tab displays correct content | High |
| FT-004 | Responsive mobile navigation | Open on mobile viewport | Tabs remain usable, layout does not break | Medium |
| FT-005 | Browser refresh persistence | Refresh `/siebel-demo/` | Demo reloads from backend data | High |

## 2. Backend Health & API Readiness

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| FT-006 | Health endpoint | GET `/api/health` | Returns status `ok`, database status `ok` | High |
| FT-007 | Readiness endpoint | GET `/api/ready` | Returns ready response | High |
| FT-008 | Ops endpoint | GET `/api/ops` | Returns ops/runtime details | Medium |
| FT-009 | Siebel demo payload | GET `/api/siebel-demo` | Returns accounts, cases, opportunities, migration, integrations, data quality, parity tests, workstreams | High |
| FT-010 | API error handling | Call invalid endpoint | Returns proper 404/error, app does not crash | Medium |

## 3. Legacy Code Analysis

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| FT-011 | Analyze JavaScript code | POST `/api/analyze` with JS code | Returns language, complexity, functions, score, suggestions | High |
| FT-012 | Analyze Python code | POST `/api/analyze` with Python code | Returns Python analysis | Medium |
| FT-013 | Analyze Siebel sample | POST `/api/analyze` with Siebel/eScript sample | Returns Siebel modernization guidance | High |
| FT-014 | Analyze SQL/PLSQL | Submit SQL or PLSQL sample | Returns database modernization suggestions | Medium |
| FT-015 | Missing code validation | POST `/api/analyze` with empty body | Returns validation error | High |
| FT-016 | Oversized code payload | Submit very large payload | Request is rejected or safely handled | High |
| FT-017 | Security issue detection | Submit code with `eval()` or risky pattern | Security issue is reported | Medium |
| FT-018 | Refactoring roadmap output | Submit legacy code | Response includes refactoring steps/test suggestions | High |

## 4. Contact / Lead Capture

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| FT-019 | Submit valid contact request | POST `/api/contact` with name/email/message | Contact saved successfully | High |
| FT-020 | Invalid email validation | Submit malformed email | Returns validation error | High |
| FT-021 | Empty message validation | Submit empty required fields | Returns validation errors | Medium |
| FT-022 | Contact request appears in stats | Submit contact, check stats | Stats count increments | Medium |

## 5. Authentication & User History

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| FT-023 | User registration | POST `/api/register` | User created, token returned | High |
| FT-024 | Duplicate registration | Register same email twice | Duplicate rejected safely | Medium |
| FT-025 | User login | POST `/api/login` valid credentials | Token returned | High |
| FT-026 | Invalid login | Wrong password | 401/validation error | High |
| FT-027 | Authenticated history | GET `/api/history` with token | User analysis history returned | Medium |
| FT-028 | Unauthorized history | GET `/api/history` without token | 401 returned | High |

## 6. Executive Dashboard

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| FT-029 | Executive metrics render | Open Executive tab | Program progress, migration completion, API volume, data pass rate visible | High |
| FT-030 | Architecture renders | View architecture card | Legacy and target architecture lists display | Medium |
| FT-031 | Workstreams render | View workstreams | Progress bars, owners, blockers, milestones shown | High |
| FT-032 | Workstream data source | Compare UI to `/api/siebel-demo` | UI values match API payload | Medium |

## 7. Legacy Siebel View

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| FT-033 | Legacy account grid | Open Legacy tab | Account rows render with legacy IDs/status | High |
| FT-034 | Legacy service request applet | Open Legacy tab | Cases render with SR number, severity, queue | High |
| FT-035 | Legacy pain warning | Open Legacy tab | Pain-point warning is visible | Medium |
| FT-036 | Legacy UI styling | Inspect visual | Looks intentionally old/Siebel-like | Medium |

## 8. Migration Factory

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| FT-037 | Migration phase cards | Open Factory tab | Discovery, Data Migration, API Modernization render | High |
| FT-038 | Migration percentage calculation | Check migrated/source objects | Progress bars calculate correctly | High |
| FT-039 | Defect counts display | Open Factory tab | Defects shown per phase | Medium |
| FT-040 | Workstream status consistency | Compare API and UI | Counts and labels match | Medium |

## 9. Data Quality & Reconciliation

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| FT-041 | Data quality dashboard renders | Open Data tab | Metrics and rules table visible | High |
| FT-042 | Data rules display | Check rules table | Domain, rule, total, failed, severity, remediation visible | High |
| FT-043 | Critical severity styling | Check critical rule | Critical badge highlighted | Medium |
| FT-044 | Pass rate calculation | Compare total/failed records | Pass rate is correct/rounded | Medium |
| FT-045 | Large number formatting | Check record counts | Counts are comma-formatted/readable | Low |

## 10. Integration Modernization

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| FT-046 | Integration dashboard renders | Open Integrations tab | Interface cards visible | High |
| FT-047 | Legacy-to-modern mapping | Inspect each card | Legacy protocol and target API shown | High |
| FT-048 | Risk badges | Check high/medium/low risks | Risk badges styled correctly | Medium |
| FT-049 | Volume calculation | Check daily volume total | Total matches API data | Medium |
| FT-050 | Status display | Check migrated/validated/designed statuses | Status shown clearly | Medium |

## 11. Modern Customer 360 CRM

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| FT-051 | Customer 360 cards render | Open Modern CRM tab | Account cards with revenue, health, owner visible | High |
| FT-052 | Health score bar | Check account health visual | Bar width matches score | Medium |
| FT-053 | AI case queue renders | Open Modern CRM tab | Cases show severity, SLA, stage, AI summary | High |
| FT-054 | Opportunity pipeline renders | Check opportunity section | Deals, amount, stage, close date, next action visible | High |
| FT-055 | Create service case | Fill form, click Create + AI triage | New case appears in queue | High |
| FT-056 | Created case persists | Create case, refresh page | Case remains visible | High |
| FT-057 | Advance case workflow | Click Advance workflow | Case stage updates | High |
| FT-058 | Workflow update persists | Advance case, refresh | Updated stage remains | High |
| FT-059 | Invalid case form | Submit empty title | Browser/API blocks submission | Medium |
| FT-060 | Critical case visual | Create Critical case | Case shows critical styling/SLA | Medium |

## 12. Testing/Parity Dashboard

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| FT-061 | Parity dashboard renders | Open Testing tab | Parity metrics and test table visible | High |
| FT-062 | Parity rows display | Inspect rows | Suite, test, legacy result, modern result, status, coverage, evidence shown | High |
| FT-063 | Coverage metric calculation | Compare test coverage values | Average coverage metric correct | Medium |
| FT-064 | Improved flow status | Inspect Integration parity row | Improved status displays correctly | Medium |

## 13. Backend Proof Tab

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| FT-065 | Health JSON display | Open Backend Proof tab | Health JSON visible | Medium |
| FT-066 | Payload JSON display | Open Backend Proof tab | Siebel payload JSON visible | Medium |
| FT-067 | Backend failure behavior | Stop backend, reload page | Error message shown, no broken blank screen | High |

## 14. Database Persistence

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| FT-068 | Seed data exists | Start backend fresh | Demo seed data present | High |
| FT-069 | Duplicate seed prevention | Restart backend repeatedly | Duplicate accounts/integrations/rules are not created | High |
| FT-070 | Case insert persistence | Create case | Row stored in SQLite | High |
| FT-071 | Case update persistence | Advance case | SQLite row updated | High |
| FT-072 | Database WAL operation | Run under PM2 | SQLite remains healthy | Medium |

## 15. Public Demo Link / Cloudflare Tunnel

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| FT-073 | Public URL loads | Open Cloudflare demo URL | Page loads externally | High |
| FT-074 | Public API health | GET public `/api/health` | Returns ok | High |
| FT-075 | Public case creation | Create case through public URL | Case saves | High |
| FT-076 | Tunnel interruption | Stop tunnel | User sees unavailable/error; local app remains intact | Medium |

---

# Non-Functional Test Cases

## 1. Performance

| ID | Test Case | Test Method | Expected Result | Priority |
|---|---|---|---|---|
| NFT-001 | Homepage load time | Measure page load | Loads under 3 seconds locally, under 5 seconds public tunnel | High |
| NFT-002 | Siebel demo load time | Measure `/siebel-demo/` | Loads under 3 seconds locally | High |
| NFT-003 | API health response time | Measure `/api/health` | Under 500 ms locally | High |
| NFT-004 | Siebel payload response time | Measure `/api/siebel-demo` | Under 1 second locally | High |
| NFT-005 | Case creation response time | POST new case | Under 1 second locally | Medium |
| NFT-006 | Large analysis payload performance | Submit large code sample | Completes or rejects within configured limits | Medium |
| NFT-007 | Concurrent reads | 20 parallel GET `/api/siebel-demo` | No crashes/errors | Medium |
| NFT-008 | Concurrent case creation | 10 parallel POST cases | All valid requests save or fail gracefully | Medium |

## 2. Security

| ID | Test Case | Test Method | Expected Result | Priority |
|---|---|---|---|---|
| NFT-009 | CORS validation | Call from unauthorized origin in production config | Blocked if origins restricted | High |
| NFT-010 | Helmet security headers | Inspect response headers | Security headers present | Medium |
| NFT-011 | SQL injection attempt | Submit `' OR 1=1 --` in form/API | Treated as text, DB safe | High |
| NFT-012 | XSS attempt in case title | Submit `<script>alert(1)</script>` | Script does not execute | High |
| NFT-013 | JWT secret enforcement | Start production with default JWT secret | App refuses unsafe config | High |
| NFT-014 | Unauthorized history access | GET history without token | 401 | High |
| NFT-015 | Password hashing | Inspect user table after registration | Password is hashed, not plaintext | High |
| NFT-016 | Rate limiting analyze endpoint | Send many analyze requests | Rate limit triggers | Medium |
| NFT-017 | Rate limiting auth/contact | Send repeated auth/contact requests | Rate limit triggers | Medium |
| NFT-018 | Sensitive data exposure | Inspect API responses | No secrets/JWT secret exposed | High |

## 3. Reliability & Availability

| ID | Test Case | Test Method | Expected Result | Priority |
|---|---|---|---|---|
| NFT-019 | PM2 restart | Restart app via PM2 | App returns online | High |
| NFT-020 | Backend crash recovery | Kill process under PM2 | PM2 restarts app | High |
| NFT-021 | Database unavailable simulation | Rename DB path or permission issue | Health shows degraded, app handles gracefully | High |
| NFT-022 | Graceful shutdown | Stop app | No corrupted DB, process exits cleanly | Medium |
| NFT-023 | Repeated restart | Restart 5 times | No duplicate seed data or startup failure | Medium |
| NFT-024 | Cloudflare tunnel dependency | Kill cloudflared | Public URL unavailable, local backend remains running | Medium |

## 4. Usability & Accessibility

| ID | Test Case | Test Method | Expected Result | Priority |
|---|---|---|---|---|
| NFT-025 | Demo readability | Review on laptop projector resolution | Text/cards readable | High |
| NFT-026 | Mobile layout | Test 390px width | No horizontal layout break except tab scroll | Medium |
| NFT-027 | Keyboard navigation | Tab through controls | Main buttons/forms reachable | Medium |
| NFT-028 | Color contrast | Inspect key text/buttons | Sufficient contrast | Medium |
| NFT-029 | Error clarity | Simulate backend down | User sees clear error | High |
| NFT-030 | Client demo flow | Follow demo script end-to-end | Story is understandable in 15 minutes | High |

## 5. Compatibility

| ID | Test Case | Test Method | Expected Result | Priority |
|---|---|---|---|---|
| NFT-031 | Chrome desktop | Open full demo | Works | High |
| NFT-032 | Safari desktop/mobile | Open full demo | Works | High |
| NFT-033 | Edge desktop | Open full demo | Works | Medium |
| NFT-034 | iPhone/Android browser | Open public link | Works with responsive layout | Medium |
| NFT-035 | Node version compatibility | Run on supported Node version | App starts/tests pass | Medium |

## 6. Maintainability

| ID | Test Case | Test Method | Expected Result | Priority |
|---|---|---|---|---|
| NFT-036 | Code syntax check | Run `node --check server.js` | No syntax errors | High |
| NFT-037 | Automated test suite | Run `npm test` | All tests pass | High |
| NFT-038 | Docs availability | Check README and DEMO-SCRIPT | Clear run/demo instructions exist | High |
| NFT-039 | API endpoint documentation | Review README | Core endpoints listed | Medium |
| NFT-040 | Git commit hygiene | Check git log/status | Demo changes committed locally | Medium |

## 7. Data Integrity

| ID | Test Case | Test Method | Expected Result | Priority |
|---|---|---|---|---|
| NFT-041 | Migration metric integrity | Compare API totals to UI | Values match | High |
| NFT-042 | Data quality calculation | Verify pass rate formula | Correct rounded value | Medium |
| NFT-043 | Integration volume total | Sum interface volumes | UI metric matches API | Medium |
| NFT-044 | Parity average coverage | Average parity rows | UI metric matches | Medium |
| NFT-045 | Case lifecycle integrity | Create/update case | No lost/duplicated case | High |

---

# Recommended Test Execution Order

## Smoke Test — before client demo
1. FT-002 Load Siebel demo page
2. FT-006 Health endpoint
3. FT-009 Siebel demo payload
4. FT-029 Executive metrics render
5. FT-046 Integration dashboard renders
6. FT-051 Customer 360 renders
7. FT-055 Create service case
8. FT-057 Advance case workflow
9. FT-061 Testing/parity dashboard renders
10. FT-073 Public URL loads

## Regression Test — after changes
- Run all High priority functional tests
- Run NFT-001 to NFT-024
- Run `node --check server.js`
- Run `npm test`

## Demo Acceptance Criteria
- Public demo URL loads
- Backend health is OK
- All 8 tabs work
- Data comes from `/api/siebel-demo`
- Create case works
- Advance workflow works
- Tests pass
- Demo script is available
