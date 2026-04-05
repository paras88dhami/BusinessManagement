# QA Test Execution Sheet (Ready-to-Run)

Source scenarios: `docs/QA_TEST_SCENARIOS_BY_FEATURE.md`

## Execution Metadata
- Release Version:
- Build Number:
- Environment: Dev / QA / UAT / Production Candidate
- Test Window (Start Date - End Date):
- QA Lead:
- Product Sign-off Owner:

## Status Legend
- `Not Run`
- `Pass`
- `Fail`
- `Blocked`
- `Deferred`

## Defect Severity Legend
- `S1` Critical (release blocker)
- `S2` Major
- `S3` Minor
- `S4` Cosmetic

## Execution Table (Master)
| Test ID | Priority | Module | Scenario Title | Preconditions | Steps (Summary) | Expected Result | Actual Result | Status | Defect ID | Severity | Owner | Build | Executed On | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| QA-001 | P0 | Auth | Valid login and account select | Valid user + account | Login and select account | Lands in correct account context |  | Not Run |  |  |  |  |  |  |
| QA-002 | P0 | Auth | Invalid login | None | Enter wrong credentials | Clear error, no session |  | Not Run |  |  |  |  |  |  |
| QA-003 | P1 | Auth | Account switch updates context | Multi-account user | Switch account | Data updates to selected account |  | Not Run |  |  |  |  |  |  |
| QA-010 | P0 | Dashboard (Business) | Totals reflect transactions | Income + expense exists | Open business dashboard | Summary matches source records |  | Not Run |  |  |  |  |  |  |
| QA-011 | P1 | Dashboard (Business) | Quick action routing | Quick actions visible | Tap each quick action | Opens correct screen |  | Not Run |  |  |  |  |  |  |
| QA-020 | P0 | Dashboard (Personal) | Monthly totals correctness | Personal transactions exist | Open personal dashboard | Income/expense/net correct |  | Not Run |  |  |  |  |  |  |
| QA-030 | P0 | Orders | Create order with contact/items | Contact + product exists | Create order | Order saved with correct amount |  | Not Run |  |  |  |  |  |  |
| QA-031 | P0 | Orders | Record payment on order | Unpaid order exists | Record payment | Paid/due updated correctly |  | Not Run |  |  |  |  |  |  |
| QA-032 | P0 | Orders | Return/refund order | Completed order exists | Mark returned and refund | Status + financial effects updated |  | Not Run |  |  |  |  |  |  |
| QA-040 | P0 | POS | Checkout creates sale record | Product in stock | Cart + checkout | Sale created and visible downstream |  | Not Run |  |  |  |  |  |  |
| QA-041 | P0 | POS | Partial payment due flow | Cart ready | Pay partial + complete | Due tracked correctly |  | Not Run |  |  |  |  |  |  |
| QA-050 | P0 | Products | Product appears in POS/Orders | None | Create product and open pickers | Product selectable in both |  | Not Run |  |  |  |  |  |  |
| QA-070 | P0 | Inventory | Stock affects availability | Product exists | Adjust stock, open POS | Availability updates correctly |  | Not Run |  |  |  |  |  |  |
| QA-080 | P0 | Contacts | Contact available across flows | None | Create contact, open linked modules | Contact selectable everywhere needed |  | Not Run |  |  |  |  |  |  |
| QA-090 | P0 | Money Accounts | Account usable in payment flow | None | Create account and use in payment | Account appears and balance context updates |  | Not Run |  |  |  |  |  |  |
| QA-100 | P0 | Ledger | Create and settle due entry | Contact exists | Create due then settle | Outstanding updates correctly |  | Not Run |  |  |  |  |  |  |
| QA-110 | P0 | Billing | Create billing document | Contact + money account exists | Create document | Saved and visible in billing list |  | Not Run |  |  |  |  |  |  |
| QA-111 | P0 | Billing | Document number uniqueness | Existing same number record | Try duplicate save | Duplicate blocked with clear message |  | Not Run |  |  |  |  |  |  |
| QA-120 | P0 | Reports | Report totals match sources | Data exists in modules | Open report for period | Aggregates match source records |  | Not Run |  |  |  |  |  |  |
| QA-140 | P0 | Personal Transactions | Add income and expense | Personal mode active | Add 1 income + 1 expense | Dashboard totals update correctly |  | Not Run |  |  |  |  |  |  |
| QA-160 | P0 | User Management | Role view/manage restriction | Restricted user exists | Attempt mutating action | Blocked with clear permission message |  | Not Run |  |  |  |  |  |  |
| QA-161 | P0 | User Management | Grant manage and retry | Same user from QA-160 | Admin grants manage, retry action | Action succeeds |  | Not Run |  |  |  |  |  |  |
| QA-200 | P0 | E2E | Full business flow | Fresh test data | Contact -> Product -> Stock -> POS partial pay | Transaction + due + dashboards consistent |  | Not Run |  |  |  |  |  |  |
| QA-201 | P0 | E2E | Order payment ripple | Existing order | Record payment | Order/ledger/dashboard consistency maintained |  | Not Run |  |  |  |  |  |  |
| QA-202 | P0 | E2E | Billing to report ripple | Billing-enabled setup | Create bill, open reports | Report values include billing effect |  | Not Run |  |  |  |  |  |  |
| QA-203 | P1 | E2E | Permission safety regression | View-only role | Attempt CRUD in guarded modules | Blocked, no accidental write |  | Not Run |  |  |  |  |  |  |
| QA-204 | P1 | E2E | Currency consistency | Account currency set | Traverse finance screens | Currency display consistent |  | Not Run |  |  |  |  |  |  |

## Daily QA Summary Template
- Date:
- Build:
- Total Executed:
- Passed:
- Failed:
- Blocked:
- New Defects Logged:
- Critical Defects Open (S1):
- Go/No-go recommendation:

## Final Sign-off
- QA Lead Sign-off: Pass / Fail
- Product Sign-off: Pass / Fail
- Engineering Sign-off: Pass / Fail
- Release Decision: Go / Hold
- Remarks:
