# Sprint Plan: Actionable Execution from PRD

Source: `docs/PRD_LITE_USER_STORIES_AND_FLOW.md`

## Planning Model
- Sprint length: 2 weeks
- Cadence: Plan (Day 1), Mid-sprint review (Day 6/7), Demo + Retro (Day 10)
- Team lanes: Product, Design, Engineering, QA, Release
- Release policy: No feature closes without user-facing acceptance criteria and regression pass

## Sprint 1: Activation and Setup Clarity
Goal: New users should set up and run first transaction fast, without confusion.

### Scope
- Guided onboarding checklist for Business and Personal modes
- Better empty states with direct call-to-action buttons
- Clear copy for setup order: Money Account -> Contacts -> Products -> First Sale
- Action confirmation copy after create/edit/delete for core flows

### User Stories
1. As a first-time business user, I want a setup checklist so I know what to do first.
2. As a first-time personal user, I want clear next steps so I can start tracking in under 5 minutes.
3. As a user, I want clear success messages so I know my action is complete.

### Actionable Tasks
- Product
  - Finalize onboarding task order for each module
  - Define success copy standards (save, update, delete, archive)
- Design
  - Design onboarding checklist card
  - Design reusable empty-state component variants
- Engineering
  - Implement reusable onboarding checklist component
  - Wire checklist state to account context
  - Add reusable toast/snackbar success patterns in core forms
- QA
  - Validate first-run experience for Business and Personal
  - Validate empty states and CTA navigation

### Acceptance Criteria
- New user can complete initial setup and first transaction in <= 10 minutes
- Every critical save/edit/delete action shows clear feedback
- Empty state on key screens shows direct action path

### Dependencies
- Existing navigation and role access flows

## Sprint 2: Trust, Control, and Permission Clarity
Goal: Users understand why actions are blocked and what to do next.

### Scope
- Permission denied messages in simple words across guarded features
- Standardized archive/delete behavior messaging
- Audit-style “what changed” summary on critical updates

### User Stories
1. As a staff user, I want clear permission messages so I know why I cannot edit.
2. As an admin, I want predictable role effects so team operations are safe.
3. As a user, I want to know the impact of edits/deletes immediately.

### Actionable Tasks
- Product
  - Define permission messaging template (view/manage)
  - Define archive vs delete behavior text by module
- Design
  - Permission-block UI state for action buttons/modals
  - Confirmation dialog content system
- Engineering
  - Add reusable permission-denied component and usage hook points
  - Wire standardized copy in Contacts, Money Accounts, Categories, Billing, Orders
  - Add post-action impact message where relevant
- QA
  - Permission matrix tests by role
  - Archive/delete consistency validation

### Acceptance Criteria
- Blocked actions show reason + next step (“ask admin for manage access”)
- Archive/delete semantics are consistent and understandable
- Role changes reflect expected behavior across protected modules

### Dependencies
- User management role templates and permission checks already in place

## Sprint 3: Insight and Decision Support
Goal: Numbers are not only visible; they are understandable.

### Scope
- Plain-language insight cards in dashboard/reports
- Cross-feature impact hints after payment/order actions
- Unified search (Phase 1): contacts/products/orders/bills

### User Stories
1. As an owner, I want quick insight text so I can decide faster.
2. As a finance user, I want linked context between action and impact.
3. As an operator, I want one search to find records quickly.

### Actionable Tasks
- Product
  - Define insight templates (profit down, overdue risk, top category)
  - Define search success metrics (time-to-find)
- Design
  - Insight card pattern for dashboard/reports
  - Unified search result layout and filter chips
- Engineering
  - Add insight generation layer from existing aggregates
  - Wire impact hints to key flows (orders, POS payment, ledger settlement)
  - Implement global search endpoint/view model (Phase 1)
- QA
  - Validate insight text against raw numbers
  - Validate search relevance and deep-link correctness

### Acceptance Criteria
- Dashboard includes plain-language insight blocks
- Key financial actions show impacted modules in feedback text
- Users can find records from multiple modules in one search flow

### Dependencies
- Existing report repositories and dashboard aggregates

## Sprint 4: Retention and Operational Excellence
Goal: Keep users active and reduce missed financial actions.

### Scope
- Smart reminders: due collections and EMI due dates
- Contact activity timeline (orders/payments/ledger)
- In-app mini explainers for Billing vs Ledger vs Transactions

### User Stories
1. As an owner, I want reminders so I do not miss collections or dues.
2. As a support user, I want contact timeline history to resolve disputes fast.
3. As a new user, I want simple explanations of finance modules.

### Actionable Tasks
- Product
  - Reminder rules and priority definitions
  - Timeline event model and display order
- Design
  - Reminder center UI and timeline visual states
  - Mini explainer cards and contextual help
- Engineering
  - Build reminder scheduler hooks and in-app surfacing
  - Build contact timeline aggregation from existing records
  - Add contextual help entry points
- QA
  - Reminder schedule and edge-case validation
  - Timeline correctness for mixed operations

### Acceptance Criteria
- Due reminders are visible before due date windows
- Contact timeline is complete and chronologically reliable
- Users can explain module differences after onboarding/help flow

### Dependencies
- Existing due, ledger, EMI, and transaction sources

## Cross-Sprint Guardrails
- No hardcoded currency symbol in UI/business logic
- No permission bypass on mutating actions
- No duplicate key warnings on list rendering
- Create/edit/delete must show success/error feedback in plain words

## Release Metrics (Business View)
- Activation: % users completing first setup journey
- Time to first transaction
- Weekly active users by module (Business vs Personal)
- Collection efficiency (overdue reduction)
- Report engagement (views per active account)
- Support tickets related to confusion in billing/ledger/permissions

## Definition of Done (Per Story)
1. User story acceptance criteria met
2. Regression scenarios passed
3. Role/permission behavior validated
4. Copy reviewed for simple language
5. No critical analytics/event gaps for shipped flow
