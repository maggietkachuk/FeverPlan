# FeverPlan TODO

## Phase 1: Schema, Design System, Backend
- [x] Design system: dark theme CSS variables, typography, color palette in index.css
- [x] Database schema: subscriptions, child_profiles, medication_logs, temperature_logs, fluid_logs, output_logs, symptom_logs, reminders
- [x] Run migration and apply SQL
- [x] Backend routers: subscriptions, childProfiles, medicationLogs, temperatureLogs, fluidLogs, outputLogs, symptomLogs, reminders
- [x] Stripe integration setup and products.ts with plan definitions

## Phase 2: Landing Page, Auth, Payments
- [x] Global layout with top nav and footer
- [x] Landing page: hero, features, pricing, FAQ, disclaimer footer
- [x] Auth: login/signup via Manus OAuth, protected routes (AppLayout blocks unauthenticated users)
- [x] Pricing page with Stripe checkout for 3-day, 7-day, 3-month, annual passes
- [x] Stripe webhook handler at /api/stripe/webhook with raw body parsing and signature verification
- [x] Subscription access control: useSubscription hook + SubscriptionGate component

## Phase 3: Dashboard and Trackers
- [x] Child profile setup and management (create, edit, select, multiple children)
- [x] Dashboard: child name, latest temp, last med, today summary, quick actions
- [x] Medication log screen: log Tylenol/Advil, time, amount, note
- [x] Medication timeline: chronological list with timestamps
- [x] Temperature log: log readings with timestamp, unit, method, note
- [x] Fluids tracker: log fluid type, amount, time (gated behind SubscriptionGate)
- [x] Output tracker: log output type (wet diaper, urination, vomiting, diarrhea), time, note (gated)
- [x] Symptom tracker: log symptoms with timestamp and free-text notes (gated)

## Phase 4: Education, Reminders, Account
- [x] Fever Basics education page (CONTENT object at top of file — editable without code changes)
- [x] Red Flags / Seek Care page (safe clinical language, CONTENT object editable)
- [x] FAQ page (CONTENT object editable)
- [x] In-app reminders after medication log (tracking-only framing: "You logged Tylenol at X — tap to log the next dose when ready.")
- [x] Account and Billing page: subscription status, plan label, expiry date, purchase history
- [x] Safety disclaimers throughout all tracker screens
- [x] NotFound page dark theme fix
- [x] useSubscription hook and SubscriptionGate component for frontend gating

## Phase 5: Tests and Delivery
- [x] Vitest tests for core procedures (16 tests, 2 files, all passing)
- [x] TypeScript check: 0 errors
- [x] Stripe webhook endpoint verified (returns "Missing signature" without sig, correct behavior)
- [x] Checkpoint and deliver
