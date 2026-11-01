# Enhancements to existing cross-cutting capbailities in SOR to support PPWC and EWC products such as charge module, credit balance refund, flat amortization calculation, and chargeback support

The enhancements described here pertain to the upstream SOR (Statement of Resources) cross-cutting capabilities, with a focus on extending support for Working Capital products (PPWC and EWC). The design introduces a dedicated Working Capital product module and aligns cross-cutting workflows—such as amortization, charges, refunds, and chargebacks—with the requirements of non-traditional working capital financing while preserving the integrity of existing term-loan semantics. The goal is to allows accurate income recognition, flexible repayment constructs, and reliable accounting reconciliation in a domain where cash flows and deferred income are governed by an Effective Interest Rate (EIR) view. The following document documents verified scope, architecture, and behavior, and highlights areas where interpretation or future work remains under review.

### Scope and confirmed changes

- A distinct Working Capital Product module introduces dedicated product configuration and life-cycle handling that operates in parallel with existing loan products. This module supports UI and API-based product creation and management, enabling configuration of Working Capital loan behavior without impacting standard loan products.
- A formalized amortization framework supports two primary approaches for Working Capital loans: a Declining Amortization path based on EIR (the preferred and primary approach) and a Flat Amortization path (defined as a low-priority option, with implementation status subject to review). The design prioritizes EIR-based amortization to follows income recognition and regulatory expectations for working capital financing.
- A projected Amortization Schedule is generated automatically for WC loans and remains dynamically responsive to approval, disbursement, and repayments. The schedule is continuously recalculated to reflect actual cash flows, with a distinction between historical (recorded) and future (projected) portions.
- A cross-cutting transaction framework governs monetary and non-monetary WC events, reuses the established term-loan transaction model, and expands coverage to include new WC-specific operations such as Credit Balance Refund (CBR), Discount Fees, and charge-related transactions.
- The accounting layer remains driven by per-transaction journal entries, with GL mappings defined at the loan-product level. For WC, the framework makes explicit allowances for deferred income and its amortization, while preserving the separation between actual cash balances and the accounting impact of amortization-related constructs.
- The design introduces explicit handling for backdated processing, reprocessing of amortization, and replay of subsequent transactions and their accounting entries, verifying data integrity when historical corrections occur.

### Working Capital product module: configuration and lifecycle

The WC product module is implemented as a separate product domain to minimize impact on existing loan products. It exposes both UI and API surfaces for product creation and modification. Core configuration areas include currency, decimal places, and a dedicated Amortization setting (EIR or Flat). A WC-specific setting governs the Day Count (NPV Day count) used to drive amortization and income recognition. The product also defines how payment allocations are performed (fees, penalties, and principal) and supports a defined delinquency bucket classification.

The WC product lifecycle mirrors common loan lifecycle steps but with WC-specific semantics. A WC loan account can be created from a WC product, inheriting currency, settings, and amortization configuration. During the lifecycle, users can disburse, approve, or modify the loan account, with the following WC-specific behaviors:
- Disbursement is a monetary event that activates the loan and updates the amortization schedule. Disbursement-time charges are applied automatically according to configuration.
- The loan can be repaid, partially repaid, prepaid, or have repayments reversed; all such actions trigger amortization recalculation and updating of the projected schedule.
- The system supports a prepayment mechanism that fully settles the loan on a payoff date, with the payoff amount computed by the system and not modifiable by users.
- The WC model includes a charge module, discount fees handling, and chargeback flows (CBR) that interact with the amortization schedule and income recognition.

### Amortization models: EIR-based decline vs. flat approach

- Declining Amortization (EIR-based): This is the primary and preferred approach for Working Capital. Income recognition is tied to the time value of money and is recalculated in response to repayments and changes in the outstanding balance. Amortization amounts vary by period as cash flows occur and as the EIR schedule evolves. The model recalculates both EIR and projected repayments, updating the amortization schedule .
- Flat Amortization (straight-line): This method distributes deferred income evenly across the loan term. It is defined as a low-priority option and may have limited initial support. When used, it yields a fixed amortization amount per period, with minimal recalculation unless tenure changes.

The WC product design explicitly documents these two approaches, with the EIR-based method taking precedence for reporting accuracy and regulatory alignment, and the flat method available as a configurable alternative if and when supported in the WC implementation path.

### Projected Amortization Schedule: structure and recalculation

The projected amortization schedule is the instrument through which income recognition and deferred balances are tracked across the WC loan lifecycle. Each record in the schedule includes the following fields:
- Amortization Installment Number
- Amortization Installment Date
- Expected Payment Amount
- Discount Factor
- NPV Value
- Balance
- Net Amortization Amount
- Actual Payment Amount
- Actual Amortization Amount
- Income Modification
- Deferred Balance

The schedule is automatically created at loan creation and is recalculated during key events in the life cycle (approval, disbursement, repayments, discounts, and backdated corrections). A critical principle is that the historical portion of the amortization (already recorded) is preserved, while the future portion is recomputed when changes occur. Recalculations propagate to the EIR-based projected payments, the net present value, and the deferred balance, verifying consistency with actual cash flows.

### Transaction model: WC-specific events and flow integration

WC transactions follow the existing term-loan transaction framework, extended to cover WC-specific events. The monetary WC transactions include Disbursement, Repayment, Discount Fees Amortization (a system-generated, non-monetary amortization-tracking construct), Discount Fees, Credit Balance Refund (CBR), Goodwill Credit, Payout Refund, and Charge Adjustments. Non-monetary transactions include charge applications, charge waivers, write-offs/charge-offs, and adjustments/reversals.

Key processing principles include:
- Allocation and priority rules: When a payment occurs, the system allocates the amount across penalties, fees, and principal in a configurable order, consistent with the transaction type and product configuration.
- Amortization linkage: The Discount Fees Amortization transaction is generated in connection with a payment event, linked to the parent payment transaction, and used for tracking purposes without altering the loan balance or causing separate accounting entries.
- Backdated processing: Most WC transactions support backdating, with automatic reprocessing of the amortization schedule, discount amortization, and balances, and replaying subsequent transactions and their accounting consequences.
- Reversals: WC transactions support reversal, creating a linked reversal transaction and fully reversing the financial impact and the associated accounting entries, followed by reprocessing of the affected amortization schedule.

### Credit Balance Refund (CBR): handling overpayments

CBR represents the refund of excess funds when a WC loan is overpaid. The WC model defines a credit balance that may be adjusted against future dues or refunded to the customer via a CBR. CBR transitions observed in the WC design include a status progression such as ACTIVE, OVERPAID, and OPEN/CLOSED states depending on outstanding obligation and refunds. When a repayment creates an overpayment, the system records an overpayment amount; a subsequent CBR transaction reduces the credit balance . If the overpayment is fully refunded and the obligation is settled, the loan can transition to a closed state.

CBR processing includes the following rules:
- Validation: CBR can be performed only if a credit balance exists, and the refund amount must equal the full available credit balance, subject to business-date rules and backdating constraints.
- Accounting: CBR triggers journal entries per the accounting rules documented for WC; backdated refunds trigger reprocessing of balances and accounting entries.
- Backdating: CBR supports backdated processing with standard validation; refunds cannot occur before the smallest repayment transaction date.
- Reversals: CBR reversals are supported under constraints similar to other WC transactions, creating a linked reversal and recalculating balances .

### Discount fees amortization (DFA): system-driven income tracking

Discount Fees Amortization is a system-generated, non-monetary transaction that represents the tracking of deferred income recognized through amortization tied to repayments and income-recognition rules. It creates an amortization record for reporting/audit purposes but does not affect loan balances or accounting entries directly. The Transaction framework automatically generates a DFA in conjunction with payment-related events (e.g., Repayment, Goodwill Credit, Discount Adjustments) and links it to the underlying payment transaction

- Validation: The DFA is system-generated only; it cannot be manually created, modified, or deleted independently.
- Backdating: If a payment occurs with backdated timing, the DFA is recalculated and reprocessed in conjunction with the payment flow.
- Reprocessing: On reprocessing, the DFA is replayed along with payments, schedule recalculation, and subsequent transactions.

### Discount fee adjustments: controlled re-balancing of deferred income

Discount Fee Adjustments are supported under strict conditions to verify deferred income remains coherent with the amortization plan. An adjustment must be positive and not exceed the remaining adjustable discount, and must be applied to an Active WC loan with an existing non-reversed Discount Fee transaction. The adjustment creates a linked adjustment transaction and allocates the full adjustment amount to the principal portion (same as the Discount Fee) for accounting and balance-tracking purposes. The system then restates the projected amortization, re-applies recorded repayments, recalculates EIR-based projections, and raises a business event for the adjustment.

Important note: The adjustment workflow covers end-to-end impacts, including updating the loan discount and balances, regenerating the amortization schedule, replaying repayments, and re-applying all historical adjustments to maintain a coherent projection. All subsequent accounting entries are created for the adjustment transaction, and a associated event is generated.

Special scenarios include interactions with prepayments, charge-offs, and write-offs, where any remaining unamortized discount may be recognized immediately or adjusted per configuration.

### Delinquency management and breach scheduling: cross-cutting integration

The WC cross-cutting capabilities include a delinquency management framework and breach scheduling that integrate with the WC amortization and revenue models. Delinquency progression (buckets) and breach status are determined by the WC lifecycle; breach and delinquency changes can drive related events and adjustments to the projected amortization, while not necessarily altering the exact payment amount or period length. The design recognizes that delinquent adjustments affect the range schedule and the associated breach/payments, but do not automatically trigger changes to the scheduled payment amount unless the range is explicitly changed or lifted.

### Exposure to charge module and chargeback support

The enhanced cross-cutting capabilities cover charge handling and chargeback support (including charge adjustments, write-offs, and related journal entries). Charges are always allocated before principal in the event of payments, and charges may be applicable as disbursement charges, ongoing fees, or penalties depending on country-specific regulations and product configuration. Chargebacks and related reversals are captured within the WC transaction flow, with recalculated adjustments to the amortization and balance states.

### Delinquency and breach events: external integrations and event streams

A complete event taxonomy exists to publish and react to key Working Capital lifecycle moments: loan creation/amendment, disbursement, balance changes, charge-offs, overpayments, delinquency range changes, breach status transitions, and related schedule adjustments. These events allows downstream accounting, reporting, and lifecycle automation, while preserving the existing term-loan event structure for consistency.

### API surface and persistence considerations

- Product configuration and life cycle: The WC module exposes API surfaces for creating and updating WC product configurations, including currency, number formats, amortization type, NPV day count, and payment allocation rules. The UI mirrors these capabilities for administrator use.
- Loan account lifecycle: WC loan accounts can be created from WC products and then approved, disbursed, or modified through API calls or UI actions.
- Schedule and accounting: The WC framework maintains a projection schedule and posts journal entries for monetary transactions. Discount-related amortization and adjustments are tracked in the system as non-balance-affecting records used for reporting and compliance.
- Backdating and reprocessing: All backdated WC transactions trigger reprocessing logic to recalculate amortization, update outstanding balances, and replay subsequent entries. This verifies historical corrections are consistently reflected in the projection and accounting state.

### Edge cases and data integrity guarantees

- The projected amortization schedule must maintain integrity across periods: opening balances must follows the previous period’s closing balances, and all allocations and reconciliations must reconcile against the transaction totals and outstanding balances.
- All journal entries, where available, must balance (debits equal credits) according to the applicable GL mappings for WC. When no accounting entries exist for a particular DFA, DFA remains a tracking artifact rather than an accounting impact.
- Rounding and precision: wherever applicable, the system adheres to evidenced rounding conventions (e.g., HALF_UP or HALF_EVEN) for financial calculations; intermediate values are preserved to reflect verified precision of calculations.
- Reprocessing semantics: backdated processing replays all affected transactions and recalculates schedules, verifying consistency with actual cash flows and maintaining audit traceability.

### Example: high-level interaction flow (conceptual)

1) Create a Working Capital product with EIR-based decline amortization enabled and a 360-day year count. Configure discount fees and disbursement charges as standard; set payment allocation rules to prioritize charges, then fees, then principal.
2) Create a WC loan account against the WC product. The system copies currency, settings, and amortization configuration to the loan account.
3) Approve and disburse the WC loan. The system generates the initial projected amortization schedule and activates the loan balance accounting as standard for WC.
4) Receive a repayment that includes principal, fees, and penalties according to the configured allocation. Recalculate the amortization and update the schedule, and post the DFA and any discount amortization entries as tracking artifacts.
5) If an overpayment occurs, generate a Credit Balance Refund (CBR) transaction to reduce the credit balance, or apply the credit balance to future payments if applicable. If the customer is refunded, adjust the balances and transition the loan status as defined by the WC rules.
6) If a discount fee adjustment is needed, validate the amount against remaining adjustable discount, create a linked adjustment transaction, restate the amortization projection, replay repayments, and post the required accounting entries.
7) If a backdated payment or refund occurs, reprocess the amortization schedule and related accounting entries for all subsequent transactions to verify continuity with the historical record.

### Mermaid diagram: WC workflow (simplified)

```mermaid
flowchart TD
 A[Working Capital Product created] --> B[Loan Account Created from WC Product]
 B --> C[Disburse WC Loan]
 C --> D[Generate Projected Amortization Schedule]
 D --> E[Receive Repayment]
 E --> F{Backdated or Regular}
 F -->|Regular| G[Update Balance & Amortization]
 F -->|Backdated| H[Recalculate Schedule & Replay Transactions]
 G --> I[Discount Fees Amortization (tracking)]
 I --> J[Possible DFA Adjustments]
 J --> K[Accounting Entries (JE) ]
 H --> K
 E --> L[CBR or Overpayment Handling]
 L --> M[Adjust Credit Balance or Refund]
 M --> N[Status Transitions]
 N --> O[Publish WC Events]
```

### What this means for practitioners

- Backend developers integrating with the WC module should model WC product configuration and loan lifecycle flows using the dedicated WC API surfaces, with explicit handling for EIR-based amortization and (where enabled) flat amortization.
- System integrators should account for backdating behavior and the replay of downstream transactions and accounting entries, as this is central to maintaining a consistent, auditable record of historical events.
- Accountants consuming WC data should expect a projected amortization schedule that reflects ongoing EIR-based recognition and dynamic recalculation in response to repayments and adjustments, along with accompanying DFA records used for reporting and reconciliation.
- For PayPal-like Working Capital usage, the model supports excess repayments, refund flows, and charge-related adjustments in a coherent, auditable flow that ties into GL postings through per-transaction accounting mappings.

### Summary of verified behavior and constraints

- A dedicated Working Capital product module exists to configure and manage WC products independently from standard term loan products.
- WC loans are designed as zero-interest products with no accrual or accrual activity types required for these loan accounts.
- In WC, repayments and reversals are supported, and a single disbursement per loan account is assumed for the baseline WC path.
- The system supports specified due-date charges (e.g., NSF in some regions) and enforces full charge adjustments rather than partial adjustments as a rule, with full and partial charge adjustments possible under WC configurations.
- The Actual Repayment transaction computes and posts the Actual Amortization (Income) on the payment date, alongside the repayment itself.
- The WC framework includes a dedicated DFA mechanism that tracks deferred income without impacting loan balances directly; the DFA is system-generated and linked to payment events.
- CBR handling allows refunds of overpayments, with state transitions guiding the accounting and balance updates.
- The discount fee workflow captures deferred income, amortization, schedule recalculation, and reprocessing of related transactions; adjustments are tightly controlled with validation on amount, balance, and loan status.
- Backdated transactions trigger reprocessing of the amortization schedule and related entries to preserve historical correctness.
- The approach emphasizes EIR-based declining amortization as the primary method for revenue recognition, with a Flat amortization option defined but low-priority and subject to implementation status.

This publication reflects verified product behavior and the confirmed scope of enhancements to cross-cutting SOR capabilities to support PPWC and EWC products, including charge module integration, credit balance refunds, flat amortization considerations, and chargeback support. Where the design indicates future work or reviewer-held items, those items are noted, with the expectation that implementation status will be updated as governance processes finalize their decisions.