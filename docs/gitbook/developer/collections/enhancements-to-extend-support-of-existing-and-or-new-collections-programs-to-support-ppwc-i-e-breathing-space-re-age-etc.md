# Enhancements to extend support of existing and/or new collections programs to support PPWC i.e. Breathing Space, Re-Age, etc

This publication describes the technical scope and verified implementation details for enhancements that extend existing collections programs into PPWC contexts (for example Breathing Space, Re-Age). The focus is on the Working Capital (WC) data model, event surface, and integration contracts that allows PPWC-like programs to be represented, processed, and reported alongside traditional term loans. The changes documented here reflect confirmed mappings, new data contracts, and new event surfaces that are visible to backend Java engineers, system integrators, and Fineract contributors.

## Technical scope and change overview

The PPWC enhancements introduce a richer Working Capital (WC) data model that mirrors the lifecycle and delinquency concepts required by PPWC programs, while preserving compatibility with existing WC and legacy LoanAccountDataV1 surfaces. The primary changes fall into these areas:

- Data model extensions and new data contracts for WC: New and extended DTOs/avro schemas are introduced to represent WC-specific fields such as disbursement details, charges, delinquency state, breach/near-breach, and payment allocation.
- Delinquency and breach surface: Delinquency scheduling, delinquent amount tracking, and breach-related constructs are mapped to WC-specific structures and exposed via WC data contracts.
- Payment allocation and charges: A WC-specific subset of charges and a dedicated payment allocation contract are introduced to support PPWC-style pricing, allocations, and settlement behavior.
- Product and timeline surfaces: A WC product contract and WC-tailored timeline fields are added to model PPWC product configurations and lifecycle metadata.
- Event surface and API fields: A curated set of events and API-field mappings allows PPWC lifecycle events to be published and consumed consistently by downstream services and clients.

The following sections summarize the concrete, verified changes and their downstream effects on processing, schedules, and data consistency.

> Note: All changes follow the consolidated reference mappings and avoid introducing unverified assumptions. Where a field or surface is explicitly excluded in WC or legacy mappings, that exclusion is preserved in WC.

### 1) Data model extensions: which surfaces were extended or added

- Working Capital account data surface
 - The WC Avro schema now maps a superset of fields from LoanAccountDataV1 into WorkingCapitalLoanAccountDataV1, with several fields explicitly included, renamed, or excluded to reflect the WC lifecycle and PPWC semantics.
 - External identifiers: externalId remains present, with ExternalId mapped via ExternalIdMapper. The field externalOwnerId is excluded because investor/loan-sale functionality is not present in WC.
 - Settlement-related fields such as settlementDate and purchasePriceRatio are excluded due to WC not implementing investor/loan-sale functionality.
 - The WC representation reuses loan.v1.LoanStatusEnumDataV1 for status values, and does not carry a sub-status in WC (subStatus is excluded).
 - Timeline behavior: WC reuses loan.v1.LoanApplicationTimelineDataV1, but the actualMaturityDate is not represented as an avsc field (silently unmapped).
 - Summary block: The WC summary collects principal and cost-related figures with WC-specific naming conventions. Some legacy field names are retained for compatibility, while others map to WC counterparts as described in the mapping table below.
 - Product surface: A new top-level product object (WorkingCapitalProductDataV1) is introduced to carry WC product configuration and currency data. The WC product can include fields such as id, name, shortName, description, fundId, fundName, startDate, closeDate, status, externalId, currency, principal, and related principal bounds. Many legacy product fields do not have WC equivalents and are therefore excluded.
 - Delinquency surface: A new delinquent container (WorkingCapitalLoanCollectionDataV1) and nested structures populate delinquent state, including delinquentAmount, delinquentDate, delinquentDays, and related historical payments. A new element-level delinquency schedule is introduced via a new avro schema for delinquencySchedule, which captures per-period delinquent metrics and tags.
 - Delinquency surface (per-period nesting): The old per-loan delinquency breakdown (principal/interest/fee/penalty) is carried in WC as a single delinquent amount per range (delinquent.sync to the element record), while the legacy nested breakdown is not carried for WC collection elements.
 - Payment allocation: A new top-level paymentAllocation surface (WorkingCapitalPaymentAllocationDataV1) is introduced, including a per-transaction ordering model (paymentAllocationOrder) that defines how payments are allocated across charges, principal, and other components.
 - Disbursement details: New WorkingCapitalLoanDisbursementDetailDataV1 surface carries per-disbursement information, including id, expectedDisbursementDate, actualDisbursementDate, principal, and netDisbursalAmount. The legacy int id is preserved for compatibility when mapped via the WC read service.
 - Charges: A new WorkingCapitalLoanChargeDataV1 surface represents a subset of LoanChargeDataV1 fields for WC charges, including id, chargeId, name, dueDate, chargeTimeType, amount, amountPaid, amountWrittenOff, amountOutstanding, currency, loanId, etc. Several optional fields from the legacy charge model are excluded in WC.
 - New PPWC-modelling records: breach and nearBreach are introduced as WC-specific top-level attributes (WorkingCapitalBreachDataV1 and WorkingCapitalNearBreachDataV1) to model PPWC breach programmes.

- Timelines and lifecycle fields
 - Timeline reuse: WC uses loan.v1.LoanApplicationTimelineDataV1 for timeline, with the caveat that some fields (e.g., actualMaturityDate) may be unmapped if not represented in the WC avsc.
 - Delinquency pause periods: Reuses loan.v1.DelinquencyPausePeriodV1 for WC delinquency pause state tracking.

- Product and configuration data
 - The WorkingCapitalProductDataV1 record models a WC-config product with fields like product.id, product.name, product.shortName, product.description, product.fundId, product.fundName, product.startDate, product.closeDate, product.status, product.externalId, product.currency, product.principal, product.minPrincipal, product.maxPrincipal, product.repaymentEvery, product.repaymentFrequencyType, product.amortizationType, and product.delinquencyBucket.
 - product.delinquencyBucket is a nested structure (delinquencyBucket.id, name, ranges) that mirrors the legacy delinquency bucket data but is carried at both top level and within the bucket for WC, with ranges defined by loan.v1.DelinquencyRangeDataV1.

- Delinquency and delinquency schedule
 - The WC model introduces a dedicated delinquent container and per-period delinquency scheduling. The per-period delinquency bucket includes a flattened mapping where delinquent amounts are captured per range as a single delinquentAmount per range, rather than a breakdown by principal/interest/fee/penalty.
 - A new field delinquent.delinquentPrincipal is mapped from delinquent.totalDelinquentAmount, representing the total delinquent amount across all active delinquency periods.
 - A new avro field delinquent.delinquencySchedule is introduced to map the current delinquency schedule (periods) with per-period amount metrics and associated tags.

- Summary and accounting surfaces
 - The WC summary includes fields such as totalOutstanding, totalRepayment, totalDisbursement (alias for legacy principalDisbursed), totalChargeAmount (alias for legacy charge), and several legacy-adapted totals (e.g., totalMerchantRefund, totalPayoutRefund, totalGoodwillCredit, etc.). Several legacy fields are renamed or omitted to follows WC semantics and reporting requirements.
 - The field summary.totalWrittenOff is carried, while other write-off related fields may be excluded depending on WC model coverage.
 - Some relying fields from LoanAccountDataV1 are kept for compatibility, others are replaced by WC equivalents or omitted where WC semantics do not require them.

### 2) Notable API and surface differences (mapping highlights)

- External identifiers and ownership
 - externalId remains present (mapped via ExternalIdMapper). externalOwnerId is excluded for WC (no investor/loan-sale functionality in WC).

- Status and timeline
 - status uses loan.v1.LoanStatusEnumDataV1 in WC, consistent with the legacy pattern for status representations.
 - timeline reuses loan.v1.LoanApplicationTimelineDataV1. The avro surface exposes timeline.submittedOnDate, timeline.submittedByUsername, timeline.submittedByFirstname, timeline.submittedByLastname, timeline.rejectedOnDate, timeline.rejectedByUsername, timeline.rejectedByFirstname, timeline.rejectedByLastname, timeline.withdrawnOnDate, timeline.withdrawnByUsername, timeline.withdrawnByFirstname, timeline.withdrawnByLastname, timeline.approvedOnDate, timeline.approvedByUsername, timeline.approvedByFirstname, timeline.approvedByLastname, timeline.expectedDisbursementDate, timeline.actualDisbursementDate, timeline.disbursedByUsername, timeline.disbursedByFirstname, timeline.disbursedByLastname, timeline.closedOnDate, timeline.closedByUsername, timeline.closedByFirstname, timeline.closedByLastname, timeline.expectedMaturityDate, and timeline.writeOffOnDate, writeOffByUsername, writeOffByFirstname, writeOffByLastname if those fields are present in the source surface. Note that actualMaturityDate may be unmapped in WC avsc if not represented there.

- Principal, disbursement, and payments
 - summary.principalDisbursed is a legacy-tinged name carried into WC with the REST field named totalDisbursement (legacy name adopted; WC REST API field is named "totalDisbursement"). The WC surface also maps summary.principal to principal values , and uses summary.totalPrincipal for the overall principal balance in the WC surface.
 - The WC model introduces disbursementDetails with a 1:1 mapping to top-level netDisbursalAmount, verifying consistent net amount propagation across all disbursement details.
 - Repayment-related fields and per-period calculations follows WC’s amortization-based model rather than legacy fixed-EMI semantics. In WC, per-period payments come from the amortization model (periodPaymentAmount) rather than a user-set fixed EMI amount (fixedEmiAmount is excluded).
 - A new paymentAllocation surface (WorkingCapitalPaymentAllocationDataV1) organizes how a payment is allocated across principal, charges, and other components according to a defined ordering (paymentAllocationOrder).

- Charges and breach constructs
 - A WC-specific charges surface (WorkingCapitalLoanChargeDataV1) is introduced as a subset of LoanChargeDataV1 fields, plus per-charge metadata such as chargeTimeType, dueDate, amount, amountPaid, amountOutstanding, currency, and related loanId. Some fields from the legacy model are excluded in WC.
 - Breach and nearBreach become first-class WC fields (WorkingCapitalBreachDataV1 and WorkingCapitalNearBreachDataV1) to support PPWC breach-like programs.
 - The new delinquencyGraceDays field replaces the legacy graceOnArrearsAgeing in the WC REST surface (the WC REST API field is named delinquencyGraceDays).

- Delinquency and breach progression rules
 - DelinquencyRange changes trigger explicit events (see Events below). Delinquent amount and delinquent days are derived from the active delinquency schedule, with a specific convention: delinquent.delinquentAmount is the total delinquent amount, and delinquent.delinquentDays represents the number of days since the oldest active delinquency tag.
 - Delinquency schedule changes (period-level delinquencies) are tracked by the new delinquent.delinquencySchedule data, rather than by per-period breakdowns in the legacy structure.

- Product data and configuration
 - The WC product surface provides a WC-config record (product: WorkingCapitalLoanProductDataV1) that includes fields like product.fundId, product.fundName, product.currency, product.principal, product.minPrincipal, product.maxPrincipal, product.repaymentEvery, product.repaymentFrequencyType (StringEnumOptionDataV1 in WC), product.amortizationType (StringEnumOptionDataV1 in WC), and other fields relevant to PPWC product configuration.
 - Some fields present in legacy term-loan products do not have WC equivalents and are omitted in WC mappings.

- Daily rates and rounding
 - WC-specific pricing fields include dailyEir and calculatedAnnualEir, which are rescaled to 8 decimals using HALF_UP rounding.
 - The rescaling rules (HALF_UP) are applied to verify numeric stability and consistent reporting across WC calculations.

### 3) Events: Working Capital event surface for PPWC programs

A dedicated event surface captures lifecycle and transactional changes relevant to PPWC programs. The events cover loan lifecycle changes, transactional activities, charge operations, journal entries, and PPWC-specific delinquency and breach transitions. Representative events include:

- Account Changed Event (Working Capital loan details): covers loan creation, approval, cancellation, disbursal, tag changes (e.g., PayPal), repayment percentage reductions, full repayment, monetary and non-monetary activities, and delinquency/breach period end state updates.
- Transaction Event: covers loan disbursal, payout refunds, fee additions or waivers, repayment additions or reversals, goodwill adjustments, charge-offs, discounts, balance writes, debt sales, and account closures.
- Charge: captures the addition of a charge (WorkingCapitalLoanAddChargeBusinessEvent).
- Journal Entries: Triggered in response to legacy events and PPWC activities; WC uses the same legacy event surface for journal entries.
- Credit Balance Refund: Phases publish until the loan balance becomes positive or zero, aligning with PPWC scenarios.
- Delinquency & Breach: A reliable set of events tracks: past due transitions, delinquency state changes, breach/near-breach state transitions, pausing and resuming delinquency, rescheduling, resetting, undoing resets, enabling/disabling, and breach-specific scheduling changes.

The event surface is designed to reflect WC lifecycle changes while preserving compatibility with existing event consumers and downstream integrations.

### 4) API surface and integration notes

- Field naming and mapping notes
 - External identifiers map via ExternalIdMapper; externalOwnerId is excluded for WC.
 - graceOnArrearsAgeing (legacy) is replaced by delinquencyGraceDays in WC REST API field naming.
 - summary.principalDisbursed is represented in WC under summary.totalDisbursement in REST, while the legacy field name may still be present in the avro mapping. The WC REST API field is named totalDisbursement.
 - repaymentFrequencyType now uses StringEnumOptionDataV1 in WC (legacy used EnumOptionDataV1).
 - timeline.actualDisbursementDate, timeline.expectedDisbursementDate, and related timeline fields are carried in WC where supported; some fields may be silently unmapped if not represented in the WC avsc.

- New WC surfaces and compatibility
 - WorkingCapitalLoanChargeDataV1: new, subset of LoanChargeDataV1 fields, representing charges in WC.
 - WorkingCapitalLoanDisbursementDetailDataV1: per-disbursement detail data, with id, expectedDisbursementDate, actualDisbursementDate, principal, and netDisbursalAmount. The legacy int id is preserved in mapping to WC read service.
 - WorkingCapitalLoanProductDataV1: WC product data, including currency and principal configuration, separate from legacy LoanProductDataV1.
 - WorkingCapitalLoanCollectionDataV1 (delinquent): WC-specific delinquency collection data container, including delinquentAmount, delinquentDate, delinquentDays, lastPaymentDate, lastRepaymentDate, and related fields.
 - WorkingCapitalPaymentAllocationDataV1: new payment allocation structure, enabling a defined allocation order (paymentAllocationOrder) per transaction.
 - WorkingCapitalBreachDataV1 and WorkingCapitalNearBreachDataV1: WC-specific breach constructs to support PPWC breach programs.

- Lifecycle and scheduling behavior
 - The WC model uses amortization-based period payments (periodPaymentAmount) rather than a user-set fixed EMI amount (fixedEmiAmount is excluded).
 - Delinquency range changes trigger specific events (e.g., WorkingCapitalLoanDelinquencyRangeChangeBusinessEvent); other delinquency or breach state changes trigger their associated events.

### 5) Impact on data integrity and calculations

- The integrity rules applicable to all periods remain intact: opening balances must equal the previous period’s closing balance, and payment allocations must reconcile with the transaction amount. In WC, per-period balances and delinquencies are calculated to reflect the WC amortization model, not a legacy fixed schedule.
- Currency and rounding rules follow the same precision constraints as the rest of the WC surface. Where 8-decimal precision is used (dailyEir and calculatedAnnualEir), HALF_UP rounding is applied during rescaling.
- The delinquent and delinquencySchedule structures are designed to be consistent with the WC read service, verifying a single source of truth for per-period delinquency metrics and the per-range delinquent amounts.
- The new product, charges, and disbursement surfaces map into the WC accounting and reporting flows without introducing inconsistent cross-surface references. When a field is explicitly marked as excluded, it is not populated in WC surfaces.

### 6) Migration and integration considerations

- Data consumers and clients that previously consumed LoanAccountDataV1 must accommodate WC’s WorkingCapitalLoanAccountDataV1, including new nested structures (delinquent, delinquencySchedule, charges, disbursementDetails, paymentAllocation, and product).
- Clients relying on legacy field names should follows the WC-named equivalents (for example, totalDisbursement instead of principalDisbursed in the WC surface; delinquencyGraceDays instead of graceOnArrearsAgeing).
- REST surface compatibility: Where WC exposes fields that differ from legacy terms, clients should prefer the WC REST API field names and the associated avro mappings as the source of truth for PPWC workflows.
- If an integration relies on the old per-loan breakdown of delinquency (principal/interest/fee/penalty), it must adapt to the WC delinquency model that carries a per-range delinquent amount, and to the delinquencySchedule data .

### 7) Diagram: PPWC lifecycle and event flow (simplified)

flowchart TD
 A[WC Loan Lifecycle] --> B{Event Triggers}
 B --> C[WorkingCapitalLoanCreatedBusinessEvent]
 B --> D[WorkingCapitalLoanApprovedBusinessEvent]
 B --> E[WorkingCapitalLoanDisbursalBusinessEvent]
 B --> F[WorkingCapitalLoanBalanceChangedBusinessEvent]
 B --> G[WorkingCapitalLoanRepaymentTransactionBusinessEvent]
 B --> H[WorkingCapitalLoanDiscountFeeTransactionBusinessEvent]
 B --> I[WorkingCapitalLoanChargeOffBusinessEvent]
 B --> J[WorkingCapitalLoanDelinquencyRangeChangeBusinessEvent]
 B --> K[WorkingCapitalLoanBreachChangeBusinessEvent]
 style A fill:#f0f4f8,stroke:#333,rounded corners
 style C,D,E,F,G,H,I,J,K stroke:#2c3e50, fill:#eaf2f8

### 8) 小-Notes and terminology crosswalk

- PPWC: PPWC programs refer to PayPal Working Capital programs extended to include Breathing Space, Re-Age and similar PPWC constructs.
- WC: Working Capital, the data model and service surface used to model PPWC programs within this enhancement.
- Delinquent vs delinquencySchedule: Delinquent is a container of current delinquency metrics; delinquencySchedule is a per-period view of delinquency that can be used to drive actions or reporting.
- breach vs near-breach: Breach represents a defined state in PPWC programs; near-breach indicates an approaching breach threshold.
- dailyEir and calculatedAnnualEir: WC-pricing concepts specific to discount-fee pricing in WC; these numbers are rescaled to 8 decimals using HALF_UP.

## Summary of verified changes (reference-based)

- Introduced WorkingCapitalLoanAccountDataV1 fields aligned with WC needs, including new nested structures for delinquency, charges, disbursements, and product data.
- Added WorkingCapitalLoanChargeDataV1, WorkingCapitalLoanDisbursementDetailDataV1, and WorkingCapitalPaymentAllocationDataV1 to capture WC-specific charges, per-disbursement details, and payment allocations.
- Added WorkingCapitalLoanCollectionDataV1 (delinquent) and expanded delinquency-related fields, including delinquentPrincipal, delinquencySchedule, and per-range delinquency metrics.
- Introduced WorkingCapitalBreachDataV1 and WorkingCapitalNearBreachDataV1 to model PPWC breach-related states.
- Introduced WorkingCapitalLoanProductDataV1 (WC product data) and integrated product fields with WC lifecycle.
- Implemented a dedicated set of events for WC PPWC lifecycles (loan creation, approvals, disbursal, balance changes, repayments, discounts, charge-offs, delinquencies, breaches, etc.) to reflect PPWC program activities.
- Clarified field naming and compatibility rules to support PPWC while preserving compatibility with existing WC and legacy Term Loan surfaces (e.g., totalDisbursement vs principalDisbursed; delinquencyGraceDays vs graceOnArrearsAgeing; repaymentFrequencyType type differences).

This document presents the verified product behavior for the PPWC enhancements and describes the component responsibilities, data contracts, and event semantics necessary for integration and extension work. It remains the authoritative reference for developers implementing PPWC support within the Pepper-Soup project and its WC-related modules.