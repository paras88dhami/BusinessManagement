# eLekha PRD-Lite: User Stories, Feature Flow, and User-Value Gaps

## 1) Purpose
This document explains the app in simple business words:
- What each feature does for the user.
- What happens when users create/read/update/delete (CRUD) data.
- Which other features are affected.
- User-perspective gaps and what to improve.

Scope: Current mobile app with Business and Personal modules.

## 2) Product Modules and Core Data

### Business module
Used for daily operations: sales, orders, stock, money due, billing, team access, reports.

### Personal module
Used for personal money tracking: income/expense, budgets, EMI/loans, notes, calculators.

### Core data that connects most features
- Transactions: Main financial record used by dashboard and reports.
- Contacts: Customer/supplier identity used by orders, billing, ledger.
- Money Accounts: Cash/bank/wallet accounts used as payment source/destination.
- Categories: Grouping layer used for filtering and understanding data.
- Permissions: Controls who can only view and who can manage (create/edit/delete).

## 3) Feature-by-Feature User Stories and Behavior

### 3.1 Login and Account Selection
User story: As a user, I want to sign in and enter the correct business/personal account quickly.

How it works:
1. User logs in.
2. User selects active account/profile.
3. App loads data based on selected account.

CRUD impact:
- Create: Session created at login.
- Read: User/account/profile loaded.
- Update: Switching account changes all visible data context.
- Delete: Logout clears active session access.

Connected features:
- All screens depend on active account context.

### 3.2 Business Dashboard
User story: As a business owner, I want one screen for today’s financial health and quick actions.

How it works:
1. App aggregates today’s in/out, due, and summary cards.
2. Shows quick actions to jump to daily operations.
3. Shows trend graph and recent transactions.

CRUD impact:
- Mostly read-only; values change when source modules change.

Connected features:
- Transactions, Orders, POS, Ledger, Reports.

### 3.3 Personal Dashboard
User story: As an individual user, I want to see income vs expense and recent activity.

How it works:
1. Loads monthly and today income/expense/net summaries.
2. Shows personal trend graph.
3. Shows recent transactions and shortcuts.

CRUD impact:
- Mostly read-only; refreshes from personal transaction and budget changes.

Connected features:
- Personal Transactions, Personal Budget, EMI/Loans.

### 3.4 Orders
User story: As a seller or buyer, I want to create and track customer/supplier orders end-to-end.

How it works:
1. User creates order with contact and items.
2. User updates status (pending/confirmed/completed/cancelled/returned).
3. User records payment, due, and refunds.

CRUD impact:
- Create: New order impacts sales/purchase counters and can create payment effects.
- Read: Order list/detail/history shown.
- Update: Status/payment changes due and summaries.
- Delete: Remove/cancel/return adjusts downstream totals.

Connected features:
- Contacts, Products, Inventory, Transactions, Ledger, Dashboard, Reports.

### 3.5 POS
User story: As a counter operator, I want fast checkout and accurate balance handling.

How it works:
1. Add products to cart.
2. Select payment mode and receive amount.
3. Complete checkout; due can be carried into ledger.

CRUD impact:
- Create: Sale transaction is created; due may create receivable ledger.
- Read: Cart and product availability read in real time.
- Update: Cart quantity/payment edits change total.
- Delete: Remove cart item before checkout.

Connected features:
- Products, Inventory, Transactions, Ledger, Dashboard, Reports.

### 3.6 Products
User story: As a manager, I want a clean product catalog for selling and stock control.

How it works:
1. Create product with rate, unit, and type.
2. Edit product details when business changes.
3. Use product in orders and POS.

CRUD impact:
- Create: Product becomes selectable in POS/orders.
- Read: Product list and details consumed by other modules.
- Update: Future transactions use new details.
- Delete: Removed products no longer available for new sales/orders.

Connected features:
- POS, Orders, Inventory, Reports.

### 3.7 Categories
User story: As a user, I want categories so data is easy to understand and filter.

How it works:
1. Create category for expense/income/product/business use.
2. Filter and segment data using categories.
3. Maintain category list over time.

CRUD impact:
- Create: New grouping option appears in supported forms.
- Read: Drives filter chips and report grouping.
- Update: Renaming updates user understanding everywhere.
- Delete: Removed categories affect future tagging choices.

Connected features:
- Products, Transactions, Budget, Reports.

### 3.8 Inventory
User story: As an operations user, I want stock visibility and control to avoid stock-out.

How it works:
1. Track stock by product.
2. Adjust stock in/out.
3. Show stock status for operational decisions.

CRUD impact:
- Create: New stock movement changes availability.
- Read: Current stock visible in operational screens.
- Update: Corrections revise available quantity.
- Delete: Wrong movement removal restores correct value.

Connected features:
- Products, POS, Orders, Dashboard, Reports.

### 3.9 Contacts
User story: As a business user, I want customer/supplier records and balance view.

How it works:
1. Create contact with type and details.
2. Link contact in orders, billing, and ledger.
3. Track receivable/payable summary per contact.

CRUD impact:
- Create: Contact becomes available across transaction workflows.
- Read: Contact and party balance views loaded.
- Update: New details reflect in all linked screens.
- Delete/Archive: Contact hidden from active selection; history still matters for past records.

Connected features:
- Orders, Billing, Ledger, Dashboard, Reports.

### 3.10 Money Accounts
User story: As a finance user, I want separate balances for cash, bank, and wallet.

How it works:
1. Create payment account with opening balance.
2. Use selected account during payment transactions.
3. Monitor account-wise balances.

CRUD impact:
- Create: Account available for payment routing.
- Read: Account balance and list used in forms and summaries.
- Update: Name/status/balance presentation updated.
- Delete: Deactivated/removed account cannot be used for new records.

Connected features:
- Transactions, Billing, Dashboard, Reports, Contacts summaries.

### 3.11 Ledger
User story: As a business owner, I want to know who should pay me and whom I should pay.

How it works:
1. Add receivable/payable ledger entries.
2. Update entries when settled partially or fully.
3. View party-wise statement.

CRUD impact:
- Create: Due amount appears in finance summaries.
- Read: Ledger statements and totals available.
- Update: Settlement changes outstanding amount.
- Delete: Wrong due entry removed from totals.

Connected features:
- Contacts, Orders/POS due flow, Dashboard, Reports.

### 3.12 Billing
User story: As a billing user, I want invoice/bill records with traceable numbers.

How it works:
1. Create bill/invoice with document number.
2. Save line items, totals, and optional image/photo.
3. Manage bill list and history.

CRUD impact:
- Create: New billing entry updates billing overview.
- Read: Search and view bill details/history.
- Update: Correction updates reporting and document state.
- Delete: Wrong document removed from active view.

Connected features:
- Money Accounts, Contacts, Dashboard, Reports.

### 3.13 Reports
User story: As an owner/accountant, I want period-wise insights for decision-making.

How it works:
1. Select date range/report type.
2. App aggregates data from source modules.
3. Show charts/tables and downloadable snapshots (if enabled).

CRUD impact:
- Reports are mostly read-only and depend on source module CRUD.

Connected features:
- Transactions, Billing, Ledger, Inventory, Products, EMI/Loans, Dashboard.

### 3.14 EMI and Loans
User story: As a user, I want to track installments and avoid missing due dates.

How it works:
1. Add loan/EMI schedule.
2. Mark installment payments.
3. See due and paid overview.

CRUD impact:
- Create: New liability added.
- Read: Schedule and summary displayed.
- Update: Payment status and balance updated.
- Delete: Wrong loan entry removed.

Connected features:
- Transactions, Dashboard, Reports.

### 3.15 Personal Transactions
User story: As a user, I want to log daily income and expenses quickly.

How it works:
1. Add income/expense with amount, date, category.
2. Filter and inspect transaction history.
3. Edit or remove incorrect entries.

CRUD impact:
- Create: Updates personal totals immediately.
- Read: Powers lists and summary cards.
- Update: Recalculates totals and trends.
- Delete: Removes amount from all dependent summaries.

Connected features:
- Personal Dashboard, Personal Budget, Reports (if included in selected report types).

### 3.16 Personal Budget
User story: As a user, I want monthly spending limits and overspend warnings.

How it works:
1. Set budget amount by category/period.
2. Compare actual spend vs target.
3. See remaining or overshoot state.

CRUD impact:
- Create: New budget baseline defined.
- Read: Budget status loaded in dashboard/budget screen.
- Update: New limit changes remaining calculations.
- Delete: Budget guard removed for that segment.

Connected features:
- Personal Transactions, Personal Dashboard.

### 3.17 Notes
User story: As a user, I want to keep quick notes linked to my account context.

How it works:
1. Add/edit text note.
2. Keep reminders and references in one place.
3. Load note state whenever needed.

CRUD impact:
- Create/Read/Update/Delete at note level.

Connected features:
- Primarily standalone utility, supports operational memory.

### 3.18 Tax Calculator
User story: As a user, I want quick tax and total calculations without manual mistakes.

How it works:
1. Enter amount and select preset/rate.
2. App computes tax split and total.
3. Use result in billing/finance decisions.

CRUD impact:
- Mostly input/update/read in a calculator flow; optional preset persistence.

Connected features:
- Billing and financial workflows (decision support).

### 3.19 User Management and Roles
User story: As an admin, I want staff control so only right users can change data.

How it works:
1. Create team member.
2. Assign role/permissions.
3. Restrict view/manage actions per feature.

CRUD impact:
- Create: New member/role access starts.
- Read: Member and role list.
- Update: Permission changes apply to live app behavior.
- Delete: Member/role access removed.

Connected features:
- All protected modules (orders, billing, contacts, money accounts, etc.).

### 3.20 Profile and Business Details
User story: As an owner, I want my profile and business identity to stay accurate.

How it works:
1. Edit personal profile and business details.
2. Save account identity information.
3. Use details in relevant headers/doc contexts.

CRUD impact:
- Create/Read/Update mainly; delete as account policy allows.

Connected features:
- Account context, branding, document trust.

## 4) Connection Map: What Triggers What

### Financial source of truth
- Most totals come from transactions.
- If transactions are wrong, dashboard and reports will also be wrong.

### Operational sales chain
- Products + Inventory -> POS/Orders -> Transactions/Ledger -> Dashboard/Reports.

### Party and due chain
- Contacts -> Orders/Billing/Ledger -> Receivable/Payable views -> Dashboard/Reports.

### Money movement chain
- Money Accounts decide where money is tracked (cash/bank/wallet).
- Account-wise reporting depends on correct money account mapping.

### Permission chain
- Admin changes role permissions.
- Staff can or cannot perform create/edit/delete by module.

## 5) User-Perspective Gaps (Non-Technical)

1. First-time user journey is not explicit.
- Many users do not know what to set up first (products, contacts, money account, then sales).

2. Some concepts can feel overlapping.
- Users may confuse billing vs ledger vs transactions without simple labels/examples.

3. Action feedback is not always clear enough.
- Users need plain outcomes: "Saved and reflected in dashboard".

4. Delete/Archive behavior can be unclear.
- Users need clear wording on what remains in history and what disappears from active lists.

5. Permission-denied experience can feel abrupt.
- Better message needed: who can unlock and why action is blocked.

6. Cross-feature effect is not visible enough.
- User edits one place but does not immediately understand which other screens changed.

7. Personal and business mode education can improve.
- Users should know when to use each mode and what data belongs where.

8. Reports need plain-language interpretation.
- Users want "what this means" and "what to do next", not only numbers/charts.

## 6) Improvements Recommended for User Value

### Priority 1 (Immediate)
1. Add guided onboarding checklist by mode.
- Example: "Add Money Account -> Add Contacts -> Add Products -> Start POS/Orders".
- User impact: Faster activation and fewer setup mistakes.

2. Add stronger success/error messages with impact hints.
- Example: "Order saved. Today sales and reports are updated.".
- User impact: Higher confidence and fewer support queries.

3. Standardize currency and amount language on all screens.
- User impact: Less confusion, especially multi-country users.

4. Add clearer permission denial copy.
- Example: "You have view access only. Ask admin for manage permission.".
- User impact: Less frustration, faster issue resolution.

### Priority 2 (Short-term)
1. Add per-feature empty state guidance with one-tap CTA.
- Example: in Contacts: "No contacts yet. Add your first customer.".

2. Show cross-feature impact summary after critical actions.
- Example: after payment: "Ledger reduced, dashboard refreshed.".

3. Add contact timeline (orders, payments, due changes).
- User impact: Better trust and support during disputes.

4. Add report insights in plain words.
- Example: "Profit down 12% vs last week; top drop from Category X.".

### Priority 3 (Mid-term)
1. Unified global search across contacts, products, orders, bills.
2. Smart reminders for due collections and EMI due dates.
3. In-app "how it works" mini guides for billing/ledger/transactions.

## 7) Business Module Service Model (Simple)
How we serve business users end-to-end:
1. Setup layer: Contacts, Products, Money Accounts.
2. Transaction layer: POS/Orders/Billing/Ledger.
3. Control layer: Inventory and User Management permissions.
4. Insight layer: Dashboard and Reports for daily decisions.

Expected business outcome:
- Faster billing/sales operation.
- Better cash and due control.
- Better stock visibility.
- Safer team operations through role permissions.
- Better daily decision-making with clear numbers.

## 8) Acceptance Checklist (User View)

1. New user can finish first setup in less than 10 minutes.
2. Every critical create/edit/delete action gives clear feedback.
3. User can understand difference between billing, ledger, and transactions.
4. Dashboard totals match source transactions.
5. Reports are understandable without accounting background.
6. Permission restriction messages are clear and actionable.
7. Personal mode and business mode have clear boundaries in UI copy.

---
Document owner: Product + Engineering
Last updated: 2026-04-05
