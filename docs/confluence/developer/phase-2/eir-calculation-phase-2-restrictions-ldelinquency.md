<!-- Labels: developer, phase-2 -->
# EIR Calculation Phase 2 - Restrictions (lDelinquency)

This page documents the implementation of the EIR-based Working Capital (WC) loan calculation in Pepper-Soup, with a focus on delinquency restrictions and their impact on amortization, scheduling, and accounting. The WC product sits in the Working Capital domain and is implemented as a separate loan module that coexists with existing term loan behavior. The core guarantees reflect the product’s rules as implemented: zero interest, single disbursement, no accrual-type postings, repayment and reversal flexibility, and EIR-driven income recognition through a declining amortization approach. The design emphasizes precise, auditable schedules that respond to actual cash flows, including backdated events, and explicit handling of delinquency, charges, and adjustments.

### Technical scope and module boundaries

- The Working Capital product module governs WC loans and their configuration, including two complementary configuration strategies for amortization and EIR calculation (Revenue-based and Fixed payment/EIR options). The implementation follows the broader loan lifecycle while keeping WC-specific rules isolated within the WC product module. The core amortization engine for is the Declining Amortization (EIR-Based) model, which updates a projected amortization schedule as repayments occur and as the loan balance changes.
- The system maintains a Projected Amortization Schedule for WC loans. Each row represents an amortization period and contains fields that track expected payments, discounting, and the evolving balance. The calculation model is driven by repayments, deferrals, and the EIR framework, and it continuously replays and recalculates future periods when cash flows change.
- Transactions driving the WC lifecycle include a defined set of monetary and non-monetary actions. Monetary transactions affect the loan balance and cash flows, while non-monetary items provide traceability and reporting hooks (for example, discount amortization tracking). All transaction types link to a formal accounting flow via the product’s GL mappings.
- Delinquency management operates on a bucket-based scheme with historical bucket assignment captured over time. Buckets such as D00, D30, D60, D90, D120, D150, and D180 are used to classify delinquency severity and to drive related scheduling and enforcement actions.

### delinquency concepts and design guarantees

- Delinquency buckets and bucket history
 - The system assigns delinquency buckets based on elapsed delinquency days. Bucket history records changes over time, enabling reporting on delinquency progression and its impact on amortization and cash flows.
 - Bucket names evidenced in the data include D00, D30, D60, D90, D120, D150, and D180, reflecting increasing delinquency severity.
- Amortization approach (Declining Amortization / EIR-Based)
 - The primary amortization method for WC is Declining Amortization based on the Effective Interest Rate (EIR) methodology. Amortization amounts vary over time and are recalculated in response to actual repayments and changes in the outstanding balance.
 - Revenue-based configuration (LP) yields stored values per loan account: Period Payment Amount, Total Days, Daily EIR, and Calc. Annual EIR, while a Fix payment amount configuration provides Period Payment Amount, Total Days (calculated), Daily EIR, and Annual EIR (calculated). A Fix EIR configuration provides Period Payment Amount (calculated), Total Days (calculated), Daily EIR (calculated), and Annual EIR (provided).
- Projected Amortization Schedule and calculations
 - The system generates a Projected Amortization Schedule at loan creation and recalculates it on approval and disbursement. It continuously recalculates based on repayments and changes in balances, producing a dynamically updated view of projected income recognition, deferred balances, and related cash flow timings.
 - The projection uses the following core fields per schedule row (as documented in the reference): Amortization Installment Number, Amortization Installment Date, Expected Payment Amount, Discount Factor, NPV Value, Balance, Net Amortization Amount, Actual Payment Amount, Actual Amortization Amount, Income Modification, Deferred Balance.
- Transactions and their impact on the schedule
 - Disbursement and Repayment drive the primary cash flows that feed into the amortization schedule. Discount Fees, Goodwill Credit, and other adjustments interact with the schedule through amortization events and reporting constructs. A dedicated non-monetary Discount Fees Amortization transaction exists to reflect the ongoing recognition of deferred income without affecting cash balances.
 - Discount Fees Amortization is system-generated and non-monetary. It is linked to payment events and does not alter loan balances or GL accounts directly. It serves as an informational/tracking artefact for reconciliation and reporting.
- Backdated processing and replays
 - The system supports backdated processing for most WC transactions. When a backdated event occurs, the amortization schedule is reprocessed, and related discount fees amortization, outstanding balances, and subsequent transactions are replayed to maintain consistency with the cash-flow history.
- Reversals and adjustments
 - Reversals are supported for WC transactions and create linked reversal transactions that undo the implications of the original event, including balance adjustments and accounting entries. Schedule recalculation and replay of dependent transactions occur as part of the reversal processing.
- Accounting and GL integration
 - All relevant WC transactions trigger journal entries according to the product’s GL mappings. The Discount Fees Amortization transaction, while tracked for reporting, does not generate direct accounting entries. Instead, accounting entries occur during the processing of the parent monetary transactions (for example, repayments, discount fee applications, and goodwill credits).
- Validation guards and constraints
 - Validation guards enforce business rules such as date constraints (transaction date must follows business date rules and not precede the disbursement date, with support for backdating ), non-zero monetary amounts, and the loan’s status allowing the transaction (Active, Charged-Off, Overpaid, etc.). Allocation rules for repayments follow the priority configured on the transaction or loan product level.

### Conceptual workflow and lifecycle

flowchart TD
 A[Loan Product (WC)] --> B[Create Loan Account]
 B --> C[Approve Loan Account]
 C --> D[Disburse Loan Account]
 D --> E[Loan Active / Activation]
 E --> F[Delinquency Evaluation (bucket assignment)]
 F --> G[Repayment / Payment Processing]
 G --> H[Amortization Schedule Update]
 H --> I[Discount Fees Amortization]{{Non-Monetary}}
 F --> J[Charge-Off / Write-Off (if criteria met)]
 J --> K[Recovery / Re-entry to Reporting]
 I --> L[Reporting and GL Balancing]

Note: Buckets (D00, D30, D60, D90, D120, D150, D180) are labels used for delinquency classification and bucket history rather than separate persistent states. Transitions to Charged-Off or Write-Off depend on business rules and manual actions as described in the WC requirement.

### Projected amortization schedule: structure and example

The projected amortization schedule captures the planned income recognition and how it evolves with actual payments. Each row includes: amortization installment number, date, expected payment amount, discount factor, NPV value, remaining balance, net amortization amount, actual payment amount, actual amortization amount, income modification, and deferred balance.

Example excerpt from a range-schedule illustration (illustrative excerpt from the reference):

<div class="param-grid" style="display:block;border:1px solid #ddd;padding:8px;border-radius:6px;margin:12px 0;background:#f9f9f9;max-width:900px;">
 <div class="param-card" style="display:inline-block;margin-right:12px;min-width:240px;">
 <span class="param-label" style="font-weight:600;">Amortization date</span>
 <span class="param-value">1/1/2019</span>
 </div>
 <div class="param-card" style="display:inline-block;margin-right:12px;min-width:180px;">
 <span class="param-label" style="font-weight:600;">Period</span>
 <span class="param-value">0</span>
 </div>
 <div class="param-card" style="display:inline-block;margin-right:12px;min-width:260px;">
 <span class="param-label" style="font-weight:600;">Expected Payment amount</span>
 <span class="param-value">-9000</span>
 </div>
</div>

<div class="calc-box" style="border:1px solid #ddd;border-radius:6px;padding:8px;background:#fff;max-width:900px;">
 <div class="calc-title" style="font-weight:600;margin-bottom:6px;">Calculation</div>
 <div class="calc-step"><strong>Formula:</strong> <code>Declining Amortization with EIR-based schedule (referenced in WC design)</code></div>
 <div class="calc-step"><strong>Substitution:</strong> <code>Disbursement date 1/1/2019; initial balance 9000; no payments yet</code></div>
 <div class="calc-step calc-result"><strong>Result:</strong> <code>Initial amortization schedule row defined; first payment window begins 1/2/2019 with small periodic payment</code></div>
</div>

> Note: The detailed numerical trace, including daily discount factors (daily EIR), NPV values, and balance dynamics, is maintained within the system's WC amortization engine and is surfaced in reports and the projected schedule. The exact formulas and rounding methods are implementation details not reproduced here; the design guarantees rely on the EIR framework and the daily updates described above.

### Delinquency: buckets, progression, and reporting

Delinquency management uses bucket classifications to describe the severity of overdue payments and to govern related processing rules. Buckets observed in the reference include D00 (initial delinquency), D30, D60, D90, D120, D150, and D180, with a bucket history kept for auditing. The Delinquency Example shows a progression from D00 to later buckets and notes periodic payments and delinquency amounts in each period.

- Delinquency evaluation occurs on business dates, with the system recording the current bucket and the delinquency amount for the period. The example demonstrates sequences where payments are made within a delinquency window, bucket history is updated, and the balance evolution is tracked alongside the delinquency status.
- The handling rules for delinquency influence future amortization projections and may affect the timing of certain adjustments or actions (for example, charge-off eligibility or remediation steps defined in the product rules).

### Validation guards and error conditions

- Date and amount validations protect the integrity of transactions.
 - Transaction date must follows business date rules and cannot precede the loan’s disbursement date; backdating is allowed according to defined rules for supported transactions.
 - Amounts must be greater than zero for monetary transactions.
- Loan status guards restrict when a transaction can be applied. Transactions are permitted for loan states such as Active and certain post-Active states, with special handling for Charged-Off and Write-Off scenarios as described in the WC requirements.
- Repayment allocations follow a priority that is configurable at either the transaction level or the loan product level. This verifies transparency in how repayments reduce principal, fees, and penalties, and how deferred income is recognized.

### Backdating and reprocessing behavior

- Backdated transactions are supported for most WC transaction types. When a backdated action is executed, the system reprocesses the loan balances, amortization schedule, and related discount amortization, and replays subsequent transactions to maintain consistency with the updated history.

### Reversals and adjustments

- Reversals follow the standard pattern: a linked reversal transaction is created, and the system replays affected schedule updates and accounting entries as needed. Adjustments continue to respect the allocation priorities and maintain consistency with the amortization logic.
- Discount adjustments and charge adjustments () are described in the related sections of the WC model. They trigger re-computation of the amortization and related balances, and they generate business events for downstream reporting.

### Payouts, refunds, and other WC-specific flows

- The WC model includes specialized transaction types such as Payout Refund (for fraud-recovery scenarios) and Credit Balance Refund (CBR) for overpayments. These transactions interact with the repayment flow, the amortization schedule, and the overall balance evolution, and they may move the loan into an Overpaid state with subsequent closure once overpayments are settled.
- Other WC transactions (Charge Transactions and Charge Adjustments) follow the same overall processing semantics as term loans, but with WC-specific allocation and reporting rules.

## Core references to concepts implemented in 

- Amortization and calculation strategies
 - Declining Amortization (EIR-based) is the primary approach for WC , with support for Revenue-based LP configuration as a source of computed values and a separate Fix payment/EIR configuration path.
 - The projected amortization schedule is generated at loan creation and recalculated on approval/disbursement and during ongoing repayments, verifying the schedule reflects current cash flows and the remaining tenor.
- Transactions and accounting touchpoints
 - The system defines a full set of transaction types (Disbursement, Repayment, Discount Fees, Discount Fees Amortization, Prepayment, Charge Adjustment, Credit Balance Refund, Goodwill Credit, Payout Refund, Recovery Payment, and others). Each type has explicit processing rules, validation guards, and accounting implications.
 - Discount Fees Amortization is a non-monetary, system-driven artifact used to reflect the ongoing recognition of deferred income without impacting loan balances or GL balances directly.
- Delinquency alignment
 - Delinquency buckets and bucket-history recording allows reporting and enforcement that follows the WC product’s delinquency management rules. Range schedules and bucket transitions are tied to the period-specific expected amounts and actual payments.

### Summary

EIR Calculation – Restrictions (lDelinquency) codifies the WC loan behavior under delinquency pressures, anchored by a reliable EIR-based amortization model and a disciplined delinquency bucket framework. The design verifies accurate income recognition and dynamic schedule recalculation in response to actual cash flows, backdated events, and adjustments, while maintaining strict validations, ledger integrity, and auditability across all WC transactions.