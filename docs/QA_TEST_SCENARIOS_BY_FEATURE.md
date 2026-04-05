# QA Test Scenarios by Feature (User-Focused)

Source baseline: `docs/PRD_LITE_USER_STORIES_AND_FLOW.md`

## Test Strategy
- Focus: User outcomes, not code internals
- Coverage: CRUD behavior, cross-feature effects, role-based access, and data consistency
- Priority model:
  - P0: Must pass for release
  - P1: Should pass for release
  - P2: Nice to have for release

## A) Authentication and Session

### QA-001 (P0): Valid login and account select
- Precondition: Valid user exists with at least one account
- Steps: Login -> Select account
- Expected: User lands in correct module home and sees account-specific data

### QA-002 (P0): Invalid login
- Precondition: None
- Steps: Enter wrong email/password
- Expected: Clear error message, no partial session created

### QA-003 (P1): Account switch updates context
- Precondition: User has access to multiple accounts
- Steps: Switch from account A to account B
- Expected: Data (dashboard, contacts, transactions) updates to account B context

## B) Dashboard (Business)

### QA-010 (P0): Dashboard totals reflect recent transactions
- Precondition: At least one income and one expense transaction exist
- Steps: Open business dashboard
- Expected: Summary cards and today values match source transactions

### QA-011 (P1): Quick actions route to correct pages
- Precondition: Dashboard quick actions visible
- Steps: Tap each quick action
- Expected: User opens correct destination feature screen

### QA-012 (P1): Today transactions list shows newest first
- Precondition: Multiple transactions today
- Steps: Open dashboard and inspect list order
- Expected: Latest transaction appears at top and count matches expectation

## C) Dashboard (Personal)

### QA-020 (P0): Monthly income/expense/net correctness
- Precondition: Personal transactions exist in current month
- Steps: Open personal dashboard
- Expected: Monthly values match transaction data

### QA-021 (P1): Personal graph updates after new transaction
- Precondition: Personal dashboard open
- Steps: Add new expense transaction -> return to dashboard
- Expected: Graph and summary update correctly

## D) Orders

### QA-030 (P0): Create order with contact and items
- Precondition: At least one contact and product exist
- Steps: Create order with quantity and price
- Expected: Order appears in list with correct amount and status

### QA-031 (P0): Record payment on order
- Precondition: Existing unpaid/partially paid order
- Steps: Record payment
- Expected: Paid and due values update in order details and connected summaries

### QA-032 (P0): Return/refund order
- Precondition: Completed order exists
- Steps: Mark returned and process refund
- Expected: Order status updates and financial effects reflect in connected totals

### QA-033 (P1): Update order status lifecycle
- Precondition: Existing pending order
- Steps: Move through expected statuses
- Expected: Status transitions are valid and visible in list/details

### QA-034 (P1): Delete or cancel order behavior
- Precondition: Existing order
- Steps: Cancel/delete as allowed
- Expected: Order removed/marked correctly and downstream totals adjusted

## E) POS

### QA-040 (P0): Checkout creates sale record
- Precondition: Product with stock exists
- Steps: Add product to cart and checkout
- Expected: Sale is saved and appears in recent business activity

### QA-041 (P0): Partial payment creates due flow
- Precondition: POS cart ready
- Steps: Pay less than total and finish checkout
- Expected: Remaining due is tracked and visible in due-related views

### QA-042 (P1): Cart edit updates total
- Precondition: Cart has items
- Steps: Change quantity/remove item
- Expected: Total recalculates immediately and correctly

### QA-043 (P1): Checkout blocks invalid payment
- Precondition: POS cart ready
- Steps: Enter invalid payment value
- Expected: User sees clear validation message and no bad transaction is created

## F) Products

### QA-050 (P0): Create product appears in POS and Orders
- Precondition: None
- Steps: Create product -> open POS and Orders product picker
- Expected: New product is selectable in both flows

### QA-051 (P1): Edit product updates future operations
- Precondition: Existing product
- Steps: Change price/name
- Expected: Updated values appear in new POS/order entries

### QA-052 (P1): Delete/deactivate product
- Precondition: Existing product
- Steps: Delete/deactivate product
- Expected: Product is not selectable for new operations

## G) Categories

### QA-060 (P1): Create category appears in related forms
- Precondition: None
- Steps: Create category and open supported forms
- Expected: Category is available for selection/filtering

### QA-061 (P1): Edit category label
- Precondition: Existing category
- Steps: Rename category
- Expected: Updated name appears everywhere category is shown

### QA-062 (P1): Delete category handling
- Precondition: Existing category in use
- Steps: Delete category
- Expected: Clear behavior for existing records and future selection

## H) Inventory

### QA-070 (P0): Stock change affects product availability
- Precondition: Product exists
- Steps: Adjust stock then open POS
- Expected: Available quantity/status reflects latest stock

### QA-071 (P1): Inventory correction
- Precondition: Incorrect stock movement exists
- Steps: Correct inventory entry
- Expected: New stock level becomes accurate across screens

## I) Contacts

### QA-080 (P0): Create contact available in Orders/Billing/Ledger
- Precondition: None
- Steps: Create contact and open linked features
- Expected: Contact appears in selectors and lists

### QA-081 (P1): Edit contact details
- Precondition: Existing contact
- Steps: Update phone/name/type
- Expected: New details shown in all linked contexts

### QA-082 (P1): Archive/delete contact
- Precondition: Existing contact with or without history
- Steps: Archive/delete contact
- Expected: Contact is handled per policy, with clear user-facing state

### QA-083 (P1): Contact summary cards
- Precondition: Receivable/payable data exists
- Steps: Open contacts screen
- Expected: Summary values align with underlying records

## J) Money Accounts

### QA-090 (P0): Create money account and use in payment flow
- Precondition: None
- Steps: Create account -> use it in transaction/payment
- Expected: Account appears in selectors and balance context updates

### QA-091 (P1): Edit money account
- Precondition: Existing account
- Steps: Change account metadata
- Expected: Updated account appears consistently

### QA-092 (P1): Delete/deactivate money account
- Precondition: Existing account
- Steps: Delete/deactivate account
- Expected: Account is removed from new payment selections per policy

## K) Ledger

### QA-100 (P0): Create receivable/payable entry
- Precondition: Contact exists
- Steps: Create ledger entry
- Expected: Due amount appears correctly in ledger and connected summaries

### QA-101 (P0): Settle due partially and fully
- Precondition: Ledger entry exists
- Steps: Apply partial settlement then full settlement
- Expected: Outstanding amount updates correctly

### QA-102 (P1): Party-wise statement accuracy
- Precondition: Multiple entries for same contact
- Steps: Open party statement
- Expected: Totals and line history are correct

## L) Billing

### QA-110 (P0): Create billing document
- Precondition: Contact and money account exist
- Steps: Create bill/invoice
- Expected: Document saved and visible in billing list

### QA-111 (P0): Document number uniqueness behavior
- Precondition: Existing billing document with a number
- Steps: Try saving another doc with same number in conflicting scope
- Expected: User gets clear duplicate prevention message

### QA-112 (P1): Edit billing document
- Precondition: Existing document
- Steps: Update bill details and save
- Expected: Changes persist and overviews refresh correctly

### QA-113 (P1): Delete billing document
- Precondition: Existing document
- Steps: Delete document
- Expected: Removed from list and totals update accordingly

## M) Reports

### QA-120 (P0): Report totals match source modules
- Precondition: Data exists in transactions/billing/ledger
- Steps: Open report for period
- Expected: Aggregates match source records

### QA-121 (P1): Filters and date range
- Precondition: Multi-period data exists
- Steps: Change date ranges and filters
- Expected: Report updates correctly with no stale values

### QA-122 (P1): Currency display consistency in reports
- Precondition: Account has configured currency
- Steps: Open all report cards/tables/charts
- Expected: Currency symbol/code matches account setting everywhere

## N) EMI and Loans

### QA-130 (P1): Create EMI/loan entry
- Precondition: None
- Steps: Add EMI/loan plan
- Expected: Plan appears with due schedule

### QA-131 (P1): Record installment payment
- Precondition: EMI entry exists
- Steps: Mark installment as paid
- Expected: Remaining due and paid status update correctly

## O) Personal Transactions and Budget

### QA-140 (P0): Add personal income and expense
- Precondition: Personal mode enabled
- Steps: Add one income and one expense
- Expected: Personal dashboard totals update correctly

### QA-141 (P1): Edit/delete personal transaction
- Precondition: Existing personal transaction
- Steps: Edit amount then delete entry
- Expected: Totals and trend graph update correctly each time

### QA-142 (P1): Create and update budget
- Precondition: Categories available
- Steps: Create budget -> change limit
- Expected: Remaining/overspend recalculated correctly

## P) Notes and Tax Calculator

### QA-150 (P2): Notes CRUD behavior
- Precondition: None
- Steps: Create, edit, delete note
- Expected: Note state is preserved and updates correctly

### QA-151 (P2): Tax calculator preset and manual input
- Precondition: Tax presets available
- Steps: Use preset and custom amount
- Expected: Tax breakdown and totals are correct and readable

## Q) User Management and Permissions

### QA-160 (P0): Role-based view/manage restrictions
- Precondition: At least two roles configured
- Steps: Login as restricted user and try mutating actions
- Expected: View-only users cannot create/edit/delete and see clear message

### QA-161 (P0): Grant manage permission and retry
- Precondition: Same user as QA-160
- Steps: Admin grants manage access -> user retries action
- Expected: Mutating action succeeds

### QA-162 (P1): Create/update/delete team member
- Precondition: Admin user
- Steps: Add member -> update role -> remove member
- Expected: Access changes reflect immediately and correctly

## R) Cross-Feature End-to-End Regressions

### QA-200 (P0): Full business flow
- Steps: Create contact -> create product -> add stock -> POS sale with partial payment
- Expected: Transaction created, due tracked, dashboard/reports reflect change

### QA-201 (P0): Order payment ripple
- Steps: Create order -> record payment
- Expected: Order, transaction, due-related views, and dashboard stay consistent

### QA-202 (P0): Billing to reporting ripple
- Steps: Create billing document -> open reports
- Expected: Billing totals and report cards align

### QA-203 (P1): Permission safety regression
- Steps: Login as view-only role and test mutating actions in billing/contacts/money accounts/categories
- Expected: Actions blocked with clear message and no accidental writes

### QA-204 (P1): Currency consistency regression
- Steps: Change account currency context and traverse all finance screens
- Expected: All amount fields show correct configured currency format

## Exit Criteria for Release
1. All P0 scenarios pass.
2. No unresolved blocker in cross-feature regressions QA-200 to QA-204.
3. Permission and currency consistency checks pass.
4. Product sign-off on user messaging clarity.
