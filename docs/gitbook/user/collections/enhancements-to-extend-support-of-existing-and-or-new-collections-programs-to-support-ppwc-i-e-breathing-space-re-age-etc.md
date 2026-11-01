# Enhancements to extend support of existing and/or new collections programs to support PPWC i.e. Breathing Space, Re-Age, etc

This enhancement expands the collections capability for PPWC (PayPal Working Capital) to accommodate programs such as Breathing Space and Re-Age. It introduces a WC-focused data model, events, and operational workflows that follows PPWC collection programs while preserving the established delinquency and breach management patterns. The changes affect how accounts are represented, how payments are allocated, and how collection events are produced and consumed by downstream processes. The goal is to give operations staff clear, auditable controls for pausing, resuming, and managing delinquency and breach states under PPWC programs, with consistent financial results and traceable event history.

### Why this matters for day-to-day operations

- PPWC programs require explicit handling of delinquency and breach states at the Working Capital level, with per-period and per-event granularity that differs from term loans. Staff gain the ability to enroll accounts into Breathing Space or Re-Age, pause certain collection activities, and manage related schedule changes without compromising data integrity.
- The new data model and events verify that portfolio-level reporting, payment allocations, and accounting entries reflect the PPWC programs, while preserving the relationships between an account’s principal, charges, and delinquent amounts.
- Delinquency processing behavior changes in this enhancement are precise: changes to the delinquency schedule that affect the amount or days in a delinquency bucket do not themselves trigger events; only changes to the delinquency range or to breach state generate events. This clarifies when operational notifications occur and reduces event noise.

### What changed (high level)

- Data model extensions to support PPWC programs, including dedicated WC data structures and records.
- New and renamed data elements to model PPWC concepts within the existing delinquency and collection framework.
- A new per-transaction payment allocation mechanism tailored for PPWC, enabling accurate application of payments to principal, fees, and other components.
- Expanded event coverage for Working Capital activities, including explicit handling for delinquency range changes, breaches, and related pauses/resumes.
- Updated workflow guidance for operations staff to enroll accounts in Breathing Space or Re-Age and manage their delinquency/breach states.

### Updated data model highlights (key additions and mappings)

- New records and data shapes
 - WorkingCapitalLoanChargeDataV1: a subset of LoanChargeDataV1 fields, exposed within the WC data model as charges associated with Working Capital loans.
 - WorkingCapitalLoanDisbursementDetailDataV1: detailed disbursement information specific to WC loans.
 - WorkingCapitalLoanSummaryDataV1: a WC-specific summary object that aggregates principal, charges, and balances for WC loans.
 - Product data: a WC-configured product data structure (WorkingCapitalProductDataV1) that carries core product attributes and funding context, populated by the serializer; legacy product remains null when not applicable.
 - Delinquent data: WorkingCapitalLoanCollectionDataV1 (delinquent) with fields aligned to WC’s collection semantics, including the delinquentAmount and related timestamps.
 - Delinquency schedule: a WC-specific representation for delinquency timing and amounts, including per-period delinquency buckets and ranges.
 - Breach and near-breach: new WC-specific fields and records to model breach events and their related configurations.
- Field mappings and translations (illustrative, not exhaustive)
 - delinquent.delinquentPrincipal maps to totalDelinquentAmount in WC contexts; delinquent.delinquentAmount maps to the aggregated outstanding from delinquency periods.
 - product.delinquencyBucket carries legacy bucket information; WC carries associated bucket data and lifts it to the top level for convenience.
 - summary.totalPrincipal maps to the disbursed principal with adjustments ; summary.totalRepayment reflects WC-priority repayment accounting, consistent with WC scheduling rules.
 - delinquencyschedule fields (periods, amounts, and tags) are introduced as part of a dedicated avro schema for the WC delinquency schedule.
- Payment allocation
 - A new WorkingCapitalPaymentAllocationDataV1 structure establishes per-transaction allocation rules and an ordered allocation plan (paymentAllocationOrder) to drive how a payment is applied across principal, charges, and other components.
- Timeline and events
 - The WC timeline remains the source of disbursement and maturity information, but with WC-specific field usage and renamings (for example, some legacy REST names are reflected in WC field labels).
 - New events related to Working Capital lifecycle and PPWC programs (e.g., delinquency range changes, breach changes, pause/resume actions) are defined to drive downstream processing and reporting.

> Note: The WC data model uses WC-specific avro records and field names. Where legacy fields exist, mappings preserve intent while adopting WC-standard data structures and nomenclature.

### Updated events and operational semantics (selected items)

- Events for Working Capital activities
 - Account Changed (Working Capital loan details): Created for lifecycle changes such as creation, approval, disbursement, tagging, and breaches related to PPWC.
 - Transaction events: Cover disbursements, payouts, fees, repayments, write-offs, charge-offs, discounts, and related adjustments specific to WC transactions.
 - Journal Entries: Triggered using the same legacy event types as the associated WC activities, verifying accounting traceability.
 - Delinquency and breach events: Delinquency range changes, breach changes, near-breach changes, and related pause/resume/reset/allows/disable actions generate dedicated WC events.
- Special notes about event triggering
 - Delinquent amount and delinquent days amount changes do not trigger events by themselves. Event generation focuses on changes to the delinquency range and on breach/near-breach state transitions.
 - Breach schedule changes produce breach-related events and may drive associated adjustments in delinquency state.

### Updated operational workflows (how interactions change)

1) Identify PPWC-eligible accounts for Breathing Space or Re-Age programs. Staff assess eligibility and prepare to enroll the account into the chosen PPWC program.
2) Enroll the account into Breathing Space or Re-Age. The system records program enrollment by updating delinquency and breach state data, including any active delinquency pause periods.
3) Manage delinquency and breach state changes. If the account experiences a breach or enters a new breach range, the system generates the standard breach-related events and updates the delinquency schedule .
4) Apply payment allocations per transaction. Each payment is allocated according to the new paymentAllocation structure and order, with allocations reflected in the WC summary and disbursement data .
5) Review and reconcile results. Staff verify that opening balances, running totals, and allocations reconcile with the transaction amount and the WC schedule, including any pauses or reductions in collection actions under the PPWC program.
6) Monitor downstream effects. Generated events feed downstream systems and reporting, so that PPWC programs are auditable and traceable through the loan lifecycle.

### Migration considerations for operations staff

- Data migration and read-path exposure
 - Existing loans move to the WC data model on read paths, with the WC read service populating new WC-specific fields . The new avro records are used by WC endpoints for those loans.
 - Some legacy fields are preserved for compatibility and are renamed or repurposed to reflect WC semantics (for example, certain interest-related fields are excluded in WC because PPWC uses discount-fee pricing in a way that does not reflect term-loan interest).
- Timeline and maturity handling
 - The WC timeline reuses the loan application timeline semantics, but the actual maturity-related fields may map differently in WC context. The avro field for actualMaturityDate may be unmapped in some WC representations where the WC model uses its own maturity logic.
- Delinquency and breach handling
 - Delinquency pause periods are represented as a list with active, start, and end dates. Pause/resume lifecycle is captured by dedicated events and associated data updates, so operators can pause collections without losing historical delinquency context.
- Compatibility of reporting and accounting
 - Journal entries are produced using the same legacy event semantics for WC activities, preserving accounting traceability while adopting WC-specific data shapes for reporting and analytics.

### Practical considerations for staff training and operations

- Staff training should emphasize the new PPWC program concepts: Breathing Space and Re-Age, how to enroll accounts, how delinquency pause periods affect collection actions, and how breach states drive workflow changes.
- Review and reconcile processes now include WC-specific structures for charges, disbursements, and summaries, verifying the total outstanding and principal disbursed reflect the WC model consistently.
- Pay attention to the new payment allocation semantics. Per-transaction allocations now rely on a defined order of components, which affects how receipts and reversals appear in the WC summary and reports.

### Diagram: Working Capital PPWC lifecycle (high level)

flowchart TD
 A[PPWC account identified for program] --> B{Choose PPWC program}
 B --> C[Breathing Space enrollment]
 B --> D[Re-Age enrollment]
 C --> E[Apply delinquency pause and breach configuration]
 D --> E
 E --> F[Update delinquency range and breach state]
 F --> G[Process payment allocations per transaction]
 G --> H[Generate WC events and update summaries]
 H --> I[Operational review and reporting]

Note: This diagram illustrates the high-level lifecycle for PPWC programs within the Working Capital collections framework. The exact steps and event names map to WC-specific data structures and events described in this page.

### Glossary of terms (selected)

- Breathing Space: PPWC program to pause certain collection actions for a defined period while maintaining account integrity.
- Re-Age: PPWC program variant that adjusts aging and delinquency evaluation under the WC model.
- Delinquency range: A categorized state within the WC delinquency model that depends on the age and amount of the oldest unmet payment period.
- Delinquency pause periods: Time windows during which collection actions under the WC program may be paused, with active status tracked per account.
- Working Capital (WC) data model: A set of WC-specific data records (including WorkingCapitalLoanAccountDataV1, WorkingCapitalLoanChargeDataV1, WorkingCapitalLoanDisbursementDetailDataV1, WorkingCapitalLoanSummaryDataV1, etc.) designed to support PPWC programs.
- Payment allocation: The per-transaction mapping of incoming payments to principal, charges, and other components according to an explicit order.

### Quick reference: verified behaviors and constraints
- The WC data model introduces new records for charges, disbursements, and summaries, plus a WC product data record, to support PPWC program data.
- Delinquent amount and delinquent days amount changes do not trigger events by themselves; only changes to the delinquency range or to breach-related state transitions generate events.
- Breach schedule changes generate breach-related events; near-breach changes also produce associated events.
- Journal entries for WC activities reuse the same legacy event triggers for consistency with existing accounting processes.
- The new paymentAllocation structure governs how per-transaction payments are allocated within the WC data model, including the order of allocation.
- Delinquency pause periods are represented with active, start, and end fields, enabling controlled pausing of certain collection actions under PPWC.

This publication captures the implemented behavior and operational guidance for enhancements to extend support of PPWC programs (Breathing Space, Re-Age, etc.). It focuses on verified data structures, event semantics, and workflow implications that operations staff will encounter when working with PPWC-enabled collections.