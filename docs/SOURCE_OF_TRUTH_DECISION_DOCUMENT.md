# Source-of-Truth Decision Document

Prepared from the current eLekha codebase, current docs, and the latest audit findings supplied for this decision pass. This document is a decision lock, not an implementation plan and not a claim that the app is already clean.

The non-negotiable architecture remains:

`route -> factory -> UI/viewModel -> useCase -> repository -> dataSource -> database/API`

## 1. Executive summary

The app has broad module coverage and real persistence across the major SMB surfaces: Accounts, Contacts, Transactions, Ledger, Billing, Orders, POS, Products, Inventory, Reports, Settings, EMI/Loans, and User Management. The current repo is an Expo Router React Native app using WatermelonDB, not the older README/API description of a React/Node/Mongo/Redis backend.

The strongest recent improvements are real:

- Manual Transactions now route through a shared posting use case.
- Billing payment posts a money transaction and creates a Billing allocation.
- Ledger settlement creates a linked Transaction, validates a settlement money account, creates/reuses Billing documents for due entries, and maintains Billing allocations for settlements.
- POS now attempts to create Billing, Transaction, Ledger due, and Inventory effects around checkout.

The business truth is still fragmented:

- `transactions` is the closest money movement truth, but the canonical posting path is named and wired as `postBusinessTransaction`, sometimes used directly and sometimes reached through `addTransaction`.
- `money_accounts.current_balance` is both directly editable and mutated by posting use cases.
- Ledger has `contactRemoteId`, but party balance and settlement candidate logic still groups by party name/phone.
- Billing has its own document outstanding calculation from Billing allocations, while Ledger also carries AR/AP due and settlement.
- Orders persist lifecycle status and product IDs, but not price snapshots, due records, or durable payment allocations.
- POS checkout has no durable POS sale table and currently performs inventory mutation before the cross-module posting sync is complete.
- Reports and dashboards compute similar metrics in separate places and still group several formulas by display strings.

Final decision: do not document the present fragmentation as the final architecture. The final product truth must be split by ownership:

- Transactions own posted money movement.
- Ledger owns business AR/AP due and settlement truth.
- Contacts own party identity and party history links.
- Money Accounts expose balances derived from opening balance plus posted money movements and audited adjustments.
- Billing owns formal documents and printable snapshots, not receivable/payable truth.
- Orders own order lifecycle and fulfillment state, not money or due truth.
- POS owns fast checkout workflow and must gain a durable sale record.
- Products own catalog defaults; Inventory owns stock movement truth.
- Reports and dashboards read from centralized domain read models, not independent screen formulas.
- Import/export is selected data transfer, not full backup/restore.
- Nepal, India, and Bangladesh support is currently configuration support, not full compliance/business readiness.

## 2. Current architecture/product reality

### Current source anchors

- `package.json` identifies an Expo app using `expo-router`, React Native, WatermelonDB, Expo file/document APIs, and Vitest.
- `shared/database/appDatabase.ts` registers persisted feature tables and schema version 35.
- `.analysis_docs/architecture_rulebook.txt` locks the layer contract and states: Route chooses, Factory wires, UI renders, View model orchestrates, Use case decides, Repository translates, Datasource performs IO, Shared stays generic.
- `.analysis_docs/engineering_guide.txt` and `.analysis_docs/production_build.txt` define the intended Personal/Business split, Ledger as business due system, mode-aware reports, and POS/Billing/Inventory future workflow expectations.
- `README.md`, `API.md`, and `FEATURES.md` are legacy/generic and do not match the current Expo/WatermelonDB app. They must not be used as the final architecture source.

### Current implementation shape

The route/factory/use-case pattern exists across modules. Dashboard routes call feature factories, and factories wire data sources, repositories, use cases, and view models.

The important exception is money posting. `feature/transactions/useCase/postBusinessTransaction.useCase.impl.ts` imports WatermelonDB directly, writes `transactions`, and mutates `money_accounts.current_balance` inside the use case. That was likely done for atomicity, but it skips the repository/dataSource part of the locked stack.

## 3. Source-of-truth decisions

### 3.1 Money posting

#### Current reality

- `transactions` has source metadata: `sourceModule`, `sourceRemoteId`, `sourceAction`, `idempotencyKey`, `postingStatus`, and settlement money account fields.
- Manual create/update/delete route through shared posting/deletion semantics, proven by `tests/manualTransactionPosting.useCase.test.ts`.
- Billing payments call `PostBusinessTransactionUseCase` and create Billing allocations.
- Ledger settlements call `PostBusinessTransactionUseCase`, link the resulting transaction to the ledger entry, and roll back the created transaction when downstream effects fail.
- Orders call `AddTransactionUseCase`, which currently routes into the shared posting path.
- EMI personal payments call `PostBusinessTransactionUseCase`; business EMI payments route through Ledger settlement.
- The posting use case directly updates `money_accounts.current_balance`.
- `Transaction` has no `contactRemoteId`.

#### Problem

There is one emerging posting path, but it is not yet a clean canonical service:

- It is named `postBusinessTransaction` even though manual and personal EMI flows use it too.
- Some modules call it directly while others call `addTransaction`.
- The use case bypasses repository/dataSource boundaries.
- Money account balance mutation is embedded inside transaction posting and is also allowed through account editing.
- Posted transactions cannot consistently become part of contact history because contact linkage is missing.

#### Final target decision

All money-moving events must go through one canonical money posting path. The target service/use case should be conceptually `PostMoneyMovementUseCase` or `PostTransactionUseCase`, not business-only. It must support manual, Billing, Ledger, POS, EMI, Orders, transfer, adjustment, refund, and reversal events through one posting contract.

Manual Transactions and business-posted Transactions must share the same use case/service/path. Manual add/update/delete should remain thin wrappers only if the UI needs manual-specific validation or defaults.

Posting ownership belongs in the use-case/application-service layer. That use case may coordinate a posting repository/dataSource capable of a database transaction, but UI, view models, feature screens, and module-specific data sources must not decide balance effects.

Layers that must never update balances directly: routes, UI components, view models, ordinary feature use cases, ordinary repositories, and ordinary data sources. The only persistence code allowed to touch stored balance projections is the data access path owned by the canonical posting/reversal/adjustment service.

#### Modules that must follow it

- Transactions
- Billing
- Ledger
- Orders
- POS
- EMI/Loans
- Money Accounts adjustments/reconciliation
- Future imports that create money effects

#### What should stop happening

- Stop adding module-specific direct writes to `transactions`.
- Stop naming the canonical path as business-only when it handles personal/manual events too.
- Stop mutating `money_accounts.current_balance` outside the canonical posting/reversal/adjustment path.
- Stop allowing a money event to exist without source metadata.
- Stop creating business money events without `contactRemoteId` when the event is tied to a customer, supplier, lender, borrower, order, invoice, POS customer, or EMI counterparty.

### 3.2 Due ledger

#### Current reality

- Ledger entries support due and settlement concepts: Sale, Purchase, Collection, PaymentOut, Refund, Advance, Adjustment.
- Ledger entries contain `contactRemoteId`, `settledAgainstEntryRemoteId`, `linkedDocumentRemoteId`, `linkedTransactionRemoteId`, and settlement account fields.
- Ledger settlement creates a Transaction and Billing allocations.
- Ledger due entries can create Billing documents through `saveLedgerEntryWithSettlement`.
- Billing independently stores documents and allocations, then derives paid/outstanding/status in `billing.repository.impl.ts`.
- Billing document creation can save a pending invoice/receipt without creating a Ledger due entry.
- POS partial checkout creates a Billing document and then attempts to create a Ledger due entry.
- Orders currently record payments/refunds as Transactions but do not create AR/AP due entries.

#### Problem

There are parallel outstanding concepts:

- Ledger party balances and outstanding dues are computed from Ledger entries and settlements.
- Billing outstanding is computed from Billing allocations against Billing documents.
- POS and Billing can produce partially overlapping due/document/payment states.
- Orders can collect money without a formal due model.

This means the app can show different "outstanding" truth depending on whether the screen reads Ledger, Billing, POS receipt state, or Reports.

#### Final target decision

Ledger is the canonical AR/AP due ledger for business receivables and payables.

Billing outstanding may remain as a document projection, but it must not be an independent business-debt truth. It should be derived from the Ledger due/settlement model and its linked Billing allocations.

Full and partial settlement must work conceptually as:

1. A due event creates or updates a Ledger due entry.
2. Optional formal document creation links a Billing document to that Ledger due entry.
3. A payment/collection creates a settlement Ledger entry.
4. The settlement Ledger entry posts a money Transaction through the canonical posting path.
5. The settlement links to one due entry or allocates across due entries.
6. Billing allocations mirror which documents were settled, but Ledger remains the business AR/AP truth.

#### Module owner

Ledger owns due truth.

#### How other modules interact with it

- Billing creates formal documents and must feed due creation/update into Ledger when a document creates receivable/payable exposure.
- POS creates a sale/receipt and must feed unpaid/partial balances into Ledger.
- Orders create due only when an order reaches a business state that creates receivable/payable exposure, not merely when it is a draft.
- EMI business collections/payments may route through Ledger settlement when they are business AR/AP events.
- Reports read AR/AP from Ledger read models, not Billing-only status.

### 3.3 Contact linkage

#### Current reality

- Contacts is a persisted module with scoped contacts, contact types, tax ID, opening balance, and archive behavior.
- Billing documents have `contactRemoteId`.
- Ledger entries have `contactRemoteId`.
- Billing view model can auto-create a business contact by customer/supplier name, then link the Billing document to that contact.
- `getOrCreateContact` currently matches existing contacts by contact type and normalized name only.
- Ledger party balances and settlement candidates still group by party name/phone, not `contactRemoteId`.
- Transactions have no `contactRemoteId`.
- Orders use `customerRemoteId`.
- Contact UI shows contact list and opening balance summary, not a real linked history hub.

#### Problem

Contacts are becoming a party master but are not yet the party history source:

- Renames and duplicate names can split or merge history incorrectly.
- Business transactions cannot consistently appear in contact history.
- Ledger grouping by names prevents stable party identity.
- Free-text Billing names can create contacts, but linkage is still partial.

#### Final target decision

Contacts is the canonical business party master.

Business events that belong to a party must carry both:

- A stable link field: `contactRemoteId`
- Human-readable snapshots: name/phone/tax/address labels as needed for historical documents

Free-text names are allowed only for:

- Drafts before the user selects or creates a contact
- Walk-in/anonymous POS sales
- Imports before resolution
- One-off notes that do not create money, due, order, invoice, or inventory responsibility

Stable contact IDs are required for:

- Business Ledger due entries and settlements
- Billing invoices/receipts tied to a party
- Orders with a customer
- Business Transactions linked to customer/supplier/borrower/lender events
- Business EMI plans with a counterparty
- POS sales that are not walk-in

#### Required link fields

- `ledger_entries.contact_remote_id`
- `billing_documents.contact_remote_id`
- `transactions.contact_remote_id` must be added for party-linked money events.
- `orders.customer_remote_id` should remain but be treated as a contact link.
- POS sale/receipt must carry `contactRemoteId` when not walk-in.
- EMI plans should carry a counterparty contact link, not only `counterpartyName` and `counterpartyPhone`.

#### Required UI/business behavior

Contact detail must become a history hub containing:

- Ledger due entries and settlement history
- Billing documents and payment allocation history
- Money transactions linked to the contact
- Orders linked to the contact
- POS sales linked to the contact
- EMI/loan plans linked to the contact
- Opening balance and audited opening-balance corrections
- Notes, reminders, and attachments where present

Contact rename must update current display labels while preserving historical document snapshots.

### 3.4 Money account balance policy

#### Current reality

- Money Accounts store `currentBalance`.
- The Money Account editor exposes a direct Balance field.
- `saveMoneyAccount` accepts and validates `currentBalance`.
- `postBusinessTransaction` updates `money_accounts.current_balance` when a Transaction is posted, updated, or voided.
- `deleteBusinessTransaction` reverses the balance effect and voids the transaction.
- There is no separate opening balance, reconciliation, adjustment, or balance audit table.

#### Problem

The balance can be changed through at least two competing paths:

- Direct account edit
- Posted/voided money Transactions

This makes the account balance neither fully derived nor clearly reconciled. It is hard to know whether a balance is a calculated value, an editable field, or a cached projection.

#### Final target decision

Money account balance is not directly editable after account creation.

The app should treat balance as:

- Derived from opening balance plus posted money movements, reversals, transfers, and audited adjustments; or
- A cached projection maintained only by the canonical posting/reversal/adjustment service.

Opening balance is a distinct opening event, not a free edit to `currentBalance`. It can be captured when a money account is created and should be represented as an opening-balance posting or balance seed with audit metadata.

Corrections must use explicit adjustment/reconciliation actions with reason, actor, timestamp, and source metadata.

#### Allowed balance mutation paths

- Create money account with opening balance
- Canonical money posting
- Canonical posting update/reversal/void
- Transfer between money accounts
- Audited adjustment/reconciliation use case
- Restore/import only when running a validated full restore flow, not selected data import

#### Audit/reconciliation expectations

The balance screen should represent a cash/bank/wallet register:

- Opening balance
- Posted in/out entries
- Voids/reversals
- Adjustments/reconciliations
- Current derived/cached balance
- Sync/reconciliation status

It should not be a generic edit form where current balance can be overwritten silently.

### 3.5 Module lifecycle ownership

#### Current reality

- Billing stores formal Billing documents and allocations and can post payment Transactions.
- Ledger stores business due/settlement entries and can create linked Billing documents and Transactions.
- Transactions stores money movements and source metadata.
- Orders stores order status and order lines, plus use cases for payment/refund posting.
- POS holds cart/slots in datasource memory, mutates product stock and inventory movements, then a higher use case attempts Billing/Transaction/Ledger sync.

#### Problem

The modules overlap in user-facing language and business truth:

- Billing and Ledger both expose outstanding amounts.
- Orders and POS both imply sales but have different persistence depth.
- POS can create Billing, Ledger, Transaction, and Inventory effects without a durable POS sale truth.
- Reports mix Billing totals, Ledger collections, and Transactions in ways that can double count.

#### Final target decision per module

| Module | Final job |
| --- | --- |
| Billing | Formal document truth: invoice, receipt, credit note, print/export snapshot, numbering, line snapshots, tax snapshot. |
| Ledger | Due truth: business receivable/payable entries, settlements, party balances, statements, reminders. |
| Transactions | Money movement truth: posted cash/bank/wallet/card/wallet movements, source links, idempotency, posting status. |
| Orders | Order lifecycle truth: customer order, status, fulfillment, ordered line snapshots, customer linkage. |
| POS | Fast checkout truth: durable sale/receipt workflow for walk-in or quick customer sales. |
| Products | Catalog truth: item/service defaults, current sale/cost defaults, tax/category defaults. |
| Inventory | Stock movement truth: stock in/out/return/damage/correction, current stock projection. |
| Contacts | Party identity and history hub. |

#### Event flow between modules

- Billing document issued with pending amount -> Ledger due entry -> optional document link.
- Billing payment -> Ledger settlement -> Transaction -> Billing allocation projection.
- Ledger due entered directly -> optional Billing document snapshot.
- Order confirmed/invoiced -> Billing document and/or Ledger due as appropriate.
- Order payment/refund -> Transaction and settlement linkage, not only a standalone Transaction.
- POS paid sale -> durable POS sale -> Billing receipt -> Transaction -> Billing allocation -> Inventory sale-out movement.
- POS unpaid/partial sale -> durable POS sale -> Billing receipt/invoice -> Ledger due for unpaid amount -> Transaction only for paid amount -> Inventory sale-out movement.

#### What should no longer overlap

- Billing must not own customer balance truth.
- Orders must not own payment truth.
- POS must not own product or stock truth.
- Reports must not define formulas independently of domain read models.
- Transactions must not be used as a substitute for AR/AP due records.

### 3.6 Inventory and product truth

#### Current reality

- Products store `stockQuantity`, `salePrice`, `costPrice`, `categoryName`, `taxRateLabel`, and `kind`.
- Product editor allows direct Stock Quantity editing for item products.
- Inventory movement save updates product `stockQuantity` and writes an inventory movement.
- Inventory snapshot reads stock from Product, not by deriving from all movements.
- POS checkout mutates product stock and writes sale-out inventory movements.
- Orders store only `productRemoteId` and quantity in order lines, with no price/name/tax snapshots.
- Billing lines store item name, quantity, unit rate, and line total, but no product link.
- POS cart lines keep in-memory product name/category/price/tax snapshots.
- Categories exist as records, but products and transactions still store category names/labels.

#### Problem

Stock, price, and category truth are split:

- Stock can be directly edited on Product or changed through movements.
- Historical Orders do not preserve price/tax/name snapshots.
- Billing line items are document snapshots but cannot consistently link back to product IDs.
- Reports sometimes group by product/category names instead of IDs.

#### Final target decision

Product stock should be movement-owned. The product row may keep a current stock cache, but only inventory/checkout/return/adjustment movement use cases may update it.

Direct product stock editing must stop. Stock correction must create an Inventory Adjustment movement.

#### Stock truth

Inventory movements are the stock history source. A stock read model may expose current stock, valuation, and low-stock status.

Allowed stock movements include:

- Opening stock
- Stock in
- Sale out
- Return in/out
- Damage/expired/lost
- Count correction
- Future transfer

#### Pricing truth

Product price is only the current catalog default.

Price snapshots must be taken when a business event is created:

- Order line: product ID, product name snapshot, unit label snapshot, quantity, unit price, tax rate, discount if any
- Billing line: product/service ID when selected, name snapshot, unit price, tax rate, quantity, line total
- POS sale line: product ID, name/category/unit/price/tax snapshot
- Inventory movement: unit cost/rate snapshot where relevant

Editing a Product must not rewrite historical prices.

#### Category truth

Categories should be linked by `categoryRemoteId` for reporting and filtering. Name labels can be retained as snapshots for display and imports. Reports must not treat mutable names as stable IDs.

### 3.7 Reporting and dashboard truth

#### Current reality

- Reports has a centralized datasource/repository/use-case stack and loads Transactions, Billing documents, Ledger entries, EMI plans, Inventory movements, Products, and Money Accounts.
- Business dashboard separately loads Transactions and Ledger and computes its own summary cards and trends.
- Reports business income combines Billing document totals and Ledger collections.
- Party balances in Reports group by `partyName`.
- Account statement groups by `accountDisplayNameSnapshot`.
- Stock report groups/falls back using product names and product `stockQuantity`.
- Category summary groups by transaction `categoryLabel`.

#### Problem

The app has multiple reporting truths:

- Dashboard formulas are separate from Reports formulas.
- Business income can double count issued Billing documents and collected Ledger settlements.
- Party/account/product/category groupings use display strings instead of stable IDs.
- Billing outstanding, Ledger balances, and Transactions can disagree.

#### Final target decision

Dashboard and Reports must read from centralized domain read models/use cases.

Required reporting sources:

- Cash/bank/wallet movement: Transactions posted through canonical money posting
- AR/AP and party balances: Ledger read model
- Formal document counts, issued sales documents, tax/document views: Billing read model linked to Ledger
- Order conversion and fulfillment: Orders read model
- POS sales: durable POS sale read model
- Stock and valuation: Inventory movement/current stock read model
- Contact history: Contact-linked event read model
- EMI exposure: EMI plan/installment/payment link read model

#### Required ID-based formulas

The following must use linked IDs instead of strings:

- Party/customer/supplier grouping -> `contactRemoteId`
- Account grouping -> money account or scope account IDs
- Product grouping -> `productRemoteId`
- Category grouping -> `categoryRemoteId`
- Source documents -> linked document/order/POS sale IDs

#### What is safe and unsafe today

Safer today:

- Module-local lists that read their own table, such as Transactions list, Billing document list, Ledger entry list, Contact list, Product list.
- Billing document paid/outstanding within the limited Billing allocation model, as a document projection only.
- Ledger screen balances as a current Ledger-only operational view, with the caveat that grouping still uses party name/phone.

Unsafe as final business truth today:

- Overall business income/profit dashboards.
- Reports that combine Billing and Ledger collections.
- Party balance reports grouped by party name.
- Account statement grouped by account display snapshot.
- Stock report truth where product stock is directly editable and movement history is not canonical.
- Contact history, because Transactions and several modules do not consistently link to Contacts.

#### What aggregation logic must move

Dashboard formulas and report formulas should move into shared report/read-model use cases so the Business Home, Reports screen, exports, and widgets use the same definitions.

### 3.8 POS and Orders reliability

#### Current reality

- POS cart/slots are in memory inside the POS datasource.
- There is no persisted POS sale table in the database schema.
- POS complete payment mutates product stock and creates inventory movements.
- `completePosCheckout` then saves a Billing document, posts a Transaction for paid amount, saves Billing allocations, and creates a Ledger due entry for unpaid amount.
- If Billing/Transaction/Ledger sync fails after POS payment, the result can return `posting_sync_failed` while inventory mutations have already been committed.
- POS route currently passes `activeSettlementAccountRemoteId={activeAccountRemoteId}`, which is a business account ID, not a concrete money account ID.
- Orders persist order lifecycle and product IDs/quantities, but not price snapshots, due records, payment allocation records, or inventory reservations.

#### Problem

POS and Orders can create irreversible business effects without a durable, atomic source record:

- POS receipt is returned from memory but not persisted as a sale aggregate.
- Inventory can be changed even when Billing/Transaction/Ledger sync is incomplete.
- POS settlement account wiring is wrong at the route level.
- Orders have lifecycle state but weak financial/inventory lifecycle integration.

#### Final target decision

A durable POS sale entity is needed.

A POS sale must persist:

- Sale ID and receipt number
- Business account ID
- Owner/user/staff actor
- Contact ID or walk-in flag
- Settlement money account ID for paid amounts
- Line snapshots with product IDs, names, quantity, unit price, tax, discount/surcharge allocation
- Totals snapshot
- Paid amount, due amount, payment method/tender details
- Linked Billing document ID
- Linked Transaction IDs
- Linked Ledger due entry ID when unpaid/partial
- Linked Inventory movement IDs
- Posting status and sync/audit state

#### Required event sequence

Paid POS sale:

1. Validate active business and active settlement money account.
2. Persist durable POS sale and line snapshots.
3. Persist Billing receipt/document snapshot.
4. Post money Transaction for paid amount.
5. Save Billing allocation.
6. Persist Inventory sale-out movements and update stock projection.
7. Mark sale posted.

Unpaid POS sale:

1. Validate active business.
2. Persist durable POS sale and line snapshots.
3. Persist Billing document/receipt snapshot.
4. Create Ledger due for unpaid amount.
5. Persist Inventory sale-out movements and update stock projection.
6. Mark sale posted with due state.

Partial POS sale:

1. Do the paid sale path for the paid amount.
2. Do the unpaid sale path for the remaining amount.
3. Link both effects to one durable POS sale.

Orders:

- Draft order does not create money, due, or stock movement.
- Confirmed/accepted order captures product and price snapshots.
- Fulfillment creates inventory movement or reservation according to the selected policy.
- Invoice creation creates Billing document and Ledger due when unpaid.
- Payment creates Ledger settlement and Transaction.
- Refund/return creates reversal/refund Transaction, Inventory return movement, and order status transition.

#### Reliability guarantees needed

- Checkout must be atomic at the domain level: either all financial/stock/document links are created, or the sale is left in a recoverable pending-posting state with retry and no silent corruption.
- Settlement account must be a real active Money Account, not the business account ID.
- Every side effect must be idempotent and source-linked to the durable sale/order event.

### 3.9 Import/export and backup truth

#### Current reality

- Settings export supports selected modules in CSV/JSON.
- Export/import modules currently include Transactions, Products, Contacts, Orders, Budgets, Ledger, EMI/Loans, and Accounts.
- Current export does not include every persisted table. It omits important business truth such as Billing documents/allocations/photos, Inventory movements as a dedicated module, Categories, Business Profiles, app settings, user management, auth/session records, and bug/rating/support records.
- Import runs one selected module at a time and uses `INSERT OR REPLACE` through unsafe SQL statements after lightweight normalization.
- Export modal copy says "Export all your business data", which is not accurate for current scope.

#### Problem

The current feature is selected data transfer, not full backup/restore. Calling it a full backup would create false user expectations and could cause data loss during restore.

#### Final target decision

Current import/export must be documented and worded as selected data transfer only.

It should not be called full backup, full restore, disaster recovery, or complete account migration.

#### Scope of import/export

Current truthful scope:

- User-selected module export/import in CSV or JSON
- Useful for moving or inspecting selected operational records
- Not guaranteed to preserve all relationships, attachments, settings, permissions, documents, and derived links

Real backup/restore, if supported later, must include:

- Schema version and migration metadata
- Every scoped business/personal table
- Billing documents, allocations, line items, and photos
- Inventory movements and stock projections
- Categories and ID relationships
- Contacts and all linked history
- Money accounts, postings, reconciliations
- Business profiles and settings
- User management roles/permissions
- Attachments/media
- Restore validation, conflict handling, checksums, and encryption

#### Wording/product expectation

Replace "Export all your business data" with language like:

"Export selected data groups as CSV or JSON. This is not a full backup."

### 3.10 Country/business-scope truth

#### Current reality

- Regional finance config supports Nepal, India, and Bangladesh country profiles.
- Each profile defines locale, currency code/prefix, tax label, default tax rate, and tax rate options.
- Account selection stores country, currency, default tax rate, and tax mode.
- Billing and Products use regional tax rate options and labels.
- Business type options cover many SMB categories.
- Existing analysis docs say Nepal-first, India-ready, and global expansion-ready, but current implementation is configuration-level.

#### Problem

Country config is not the same as country-ready compliance:

- Nepal PAN/VAT invoice identity, e-billing readiness, and local reporting are not implemented as enforceable business rules.
- India GSTIN, CGST/SGST/IGST routing, place-of-supply, GST invoice formats, and statutory reports are not implemented.
- Bangladesh VAT support is limited to profile config.
- Tax logic is a configurable calculator/display layer, not legal compliance.

#### Final target decision

The honest product claim today is:

"Basic regional finance configuration for Nepal, India, and Bangladesh: locale, currency, tax labels, default tax rates, and selectable tax rates."

Do not claim:

- Nepal VAT/PAN compliance readiness
- India GST compliance readiness
- Bangladesh VAT compliance readiness
- Legal tax filing support
- Full country-ready invoicing

#### What can be claimed now

- Nepal, India, Bangladesh country profiles exist.
- Currency and basic tax labels/rates are configurable.
- Business accounts can store country/currency/tax defaults.
- Business type selection supports broad SMB categories.

#### Future roadmap only

- Nepal-specific VAT/PAN invoice rules and e-billing/export readiness
- India GST invoice routing and statutory report logic
- Bangladesh VAT document/report rules
- Country-specific invoice numbering, address, tax ID validation, and audit exports

## 4. What these decisions mean for the app

The app should be documented as a broad but still-converging SMB operating system. It is not yet a clean accounting ledger, not yet a full POS backend, and not yet country-compliance software.

The target app truth becomes:

- Business due truth starts in Ledger.
- Business payment truth starts in Transactions through one posting path.
- Formal document truth starts in Billing.
- Party identity starts in Contacts.
- Catalog defaults start in Products.
- Stock history starts in Inventory movements.
- Fast sale workflow starts in POS, but POS must persist a durable sale.
- Order lifecycle starts in Orders.
- Dashboard/report truth starts in centralized read models.

Any future master doc must explicitly state whether it is describing current implementation, target decision, or post-refactor behavior.

## 5. What refactors must follow from these decisions

1. Canonical money posting and balance policy.
   - Move from business-only naming to one money posting service/use case.
   - Restore repository/dataSource boundaries while preserving atomic DB writes.
   - Add `contactRemoteId` to transaction posting payloads.
   - Remove direct post-creation balance editing and introduce opening balance plus audited adjustment/reconciliation flows.

2. Ledger as canonical AR/AP due ledger.
   - Ensure Billing, POS, and Orders feed Ledger due entries for unpaid/partial business exposure.
   - Treat Billing outstanding as a document projection, not a second AR/AP truth.

3. Contact linkage across money, due, document, order, POS, and EMI events.
   - Add contact link fields where missing.
   - Change Ledger party aggregation from name/phone to contact ID when available.
   - Build Contact detail as a linked history hub.

4. POS settlement-account fix and durable POS sale persistence.
   - Fix the route-level settlement account bug.
   - Add durable sale persistence.
   - Make checkout side effects atomic or recoverable with idempotent retry.

5. Order line snapshots and lifecycle links.
   - Add price/tax/product snapshots to order lines.
   - Link order payment/due/inventory/billing effects instead of using standalone money posts.

6. Inventory movement truth.
   - Stop direct Product stock edits.
   - Keep current stock only as a maintained projection.

7. Reporting/dashboard read models.
   - Move formulas into domain read models.
   - Replace string grouping with ID grouping.
   - Remove double-counting between Billing issuance and Ledger collection.

8. Import/export and country wording.
   - Correct selected data transfer wording immediately.
   - Build full backup/restore only as a separate future feature.
   - Keep Nepal/India/Bangladesh claims to configuration support until country-specific rules exist.

## 6. What should not be done anymore

- Do not document Billing outstanding and Ledger outstanding as equal final truths.
- Do not let feature-specific screens write money account balances.
- Do not add new payment flows that bypass canonical money posting.
- Do not group party reports by mutable party names when contact IDs exist or should exist.
- Do not add direct stock edits to Product workflows.
- Do not build more dashboard formulas inside UI/view-model files.
- Do not claim full backup/restore for selected CSV/JSON import/export.
- Do not claim country compliance from country profile config.
- Do not use root README/API architecture claims as current app truth.
- Do not treat POS receipt output as durable sale truth until a persisted POS sale entity exists.

## 7. What can be documented now vs later

### Can be documented now

- The non-negotiable layered architecture.
- Current persisted module coverage.
- The Personal/Business split as a product direction.
- Ledger as final AR/AP due owner.
- Transactions as final money movement owner.
- Billing as formal document owner.
- Contacts as final party master.
- Products/Inventory split between catalog defaults and stock movements.
- Current limitations and unsafe report/dashboard areas.
- Current import/export as selected data transfer.
- Nepal/India/Bangladesh as basic regional configuration support.

### Should wait until after refactors

- Exact final Transaction schema including contact links and adjustment records.
- Exact final Ledger/Billing allocation schema after due-truth consolidation.
- Exact POS sale schema and atomic checkout contract.
- Exact order fulfillment/payment/inventory lifecycle schema.
- Exact report formulas for profit, receivables, payables, sales, stock valuation, and cash flow.
- Full backup/restore UX and restore guarantees.
- Country-specific compliance claims and legal/tax reporting workflows.

## 8. Final recommended next implementation order

1. Canonical money posting and balance policy.
   - This removes the biggest source of cash/bank/wallet inconsistency.

2. Ledger as canonical AR/AP due ledger.
   - Make Billing, POS, and Orders feed due truth instead of creating parallel outstanding states.

3. Contact linkage across money, due, document, order, POS, and EMI events.
   - This turns Contacts into the history hub instead of a standalone address book.

4. POS settlement-account fix and durable POS sale persistence.
   - Fix the route-level settlement account bug before deepening checkout.

5. Order line snapshots and order-to-billing/ledger/inventory lifecycle.
   - Orders should become lifecycle truth without owning money truth.

6. Inventory movement truth and Product stock edit removal.
   - Current stock should become a projection, not a free product field.

7. Reporting/dashboard read models.
   - Build reports only after source-of-truth ownership is corrected.

8. Import/export wording and future backup design.
   - Correct user expectations immediately; build backup later as its own feature.

9. Country/business-scope wording.
   - Keep current claims honest while country-specific compliance work remains future scope.
