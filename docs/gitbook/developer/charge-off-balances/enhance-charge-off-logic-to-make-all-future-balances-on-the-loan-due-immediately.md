# Charge-Off: Immediate Due of Future Balances

This page documents the technical scope, behavior, and accounting implications of the enhancement that makes all future balances on a loan due immediately on charge-off. The design intent is that once a loan is charged off, the full balance of the loan—including future principal and any accrued interest up to the charge-off date—becomes collectible, and ongoing accrual ceases after that date. The material below summarizes the verified processing rules, the involved accounting, and the protections and edge cases observed in the reference calculations the enhancement is based on.

### Conceptual overview and rationale

Charge-off is an event that marks a loan as non-recoverable from a contractual servicing perspective. The enhancement verifies that the loan’s remaining economic exposure is consolidated into a single, due amount at the moment of charge-off, rather than leaving future payments to occur under the original amortization schedule. This aligns the accounting and the operational state with the business objective of making the full loan balance due at charge-off and prevents further accrual after that point.

To express this clearly: on the charge-off date, the system marks future obligations on the loan as due immediately, stops future accrual of interest, and records the charge-off impact in the accounting layer. If, subsequently, repayments or reversals occur, the system must handle them in a way that preserves data integrity and reconciles schedules, balances, and GL entries.

### Scope of the change (components and behavioral impact)

The reference materials describe modifications and behavioral changes across several layers of the loan processing pipeline. The core changes targeted by this enhancement are:

- Loan accrual engine: stop accrual of interest from the day after the charge-off date; interest accrued up to the charge-off date is recognized as the charge-off interest portion.
- Repayment scheduling and balance recalculation: recalculate the remaining balance to reflect the immediate due of all future balances, and adjust the loan schedule so that future installments are treated as due upfront.
- Transaction lifecycle and reverse-replay handling: support backdated repayments and reversals by retracing the full sequence of transactions surrounding the charge-off, including the charge-off event itself.
- General Ledger (GL) accounting mapping: verify journal entries reflect charge-off components (principal, interest, fees, penalties) and balance against the standard accounts, with balancing debits and credits according to the verified mapping.
- Validation, state guards, and edge-case handling: enforce that a charge-off date cannot be in the future and that the charge-off date is permissible only if it is the latest transaction on the loan account, among other guards documented in the reference scenarios.

What follows captures the verified behavioral patterns and the downstream implications for calculations, schedules, and accounting.

### Core processing rules and outcomes

- Immediate due of future balances
 - On the charge-off date, all remaining contractual balances beyond that date become due. The loan’s exposure is settled as if the remaining installments were due immediately, subject to the system’s standard allocation and settlement rules.
 - The calculation of the charge-off amount includes the outstanding balance as of the charge-off date plus any interest that was accrued up to and including that date (the charge-off interest portion).

- Interest accrual and day-count conventions
 - Interest is accrued up to the charge-off date using the loan’s standard day-count convention as captured in the reference scenarios. In the commonly demonstrated scenarios, the examples use a 360-day year with 30-day months to derive daily interest factors.
 - The rule explicitly states: Interest will be calculated until the charge-off date as the charge-off interest portion. Interest accrual stops from the day after the charge-off date. This verifies that no interest accrues on or after the charge-off date when the balance beyond that date is treated as due immediately.

- N+1 installments and future balances
 - The design path demonstrates that N+1 installments will not have any impact from charge-off activity. In practice, this means that the charge-off logic does not re-enter or reprice installment terms beyond the immediate effect on balances due at the charge-off moment.

- Reversals and backdating
 - Backdated repayments and reversals trigger a reverse-replay of all transactions and the charge-off transaction itself. The system must re-harvest the relevant timeline to restore consistency between balances, accruals, and settlements.
 - Reversal paths may include reversing the charge-off and re-applying a charge-off or a different settlement depending on the sequence of events and the timing of the reversal.

- Charge-off on a date and eligibility
 - The charge-off date can be any date that is valid under the policy, provided it is the latest transaction on the loan account. Charge-off cannot be performed on a future date.
 - The charge-off workflow supports scenarios where charge-off is performed on the due date or after an installment date, with various patterns for accrual and repayments reflected in the reference material.

- Accounting alignment and journal entries
 - The reference materials provide a detailed GL-entry mapping for charge-off scenarios, distinguishing the principal portion, interest portion, fees, and penalties. These allocations feed into the associated GL accounts to reflect the loss, the accrued interest recognized up to charge-off, and the associated receivables and income components.

### Calculation framework and example patterns (high-level)

The reference materials present multiple calculation references and scenario sheets that illustrate the interaction of charge-off timing with accrual, repayments, and reversals. While the exact numerical sequences vary by loan product and schedule, the verified principles are:

- The charge-off amount aggregates the remaining principal and accrued interest up to the charge-off date. Any subsequent payments are allocated according to the modified, immediate-due balance rather than the original amortization plan.
- After charge-off, no new interest accrues on the portion of the balance treated as due immediately, and the system reassigns future cash flows to settlement of that immediate balance and any related charge-off accounting entries.
- Reversals and backdated payments retrace the historical sequence of events, with the system reapplying interest accrual and principal allocations as standard to restore consistency.

These patterns are demonstrated across several calculation references, including scenarios involving charge-off on the due date, charge-off after an installment date, backdated repayments, and reversal paths. The charts consistently reflect that the charge-off action focuses on recognizing a finite, immediately due exposure and terminating further accrual beyond that point.

### GL accounting implications (summary)

The reference materials include a concrete mapping for charge-off accounting entries. In the event of a charge-off, the system records allocations across principal, interest, fees, and penalties, with associated debits and credits to:

- Principal portion: Credit Loss / Bad Debt (fraud or non-fraud variants indicated in examples), Loans Receivable, and Loan Portfolio accounts , reflecting the written-off principal exposure.
- Interest portion: Interest income charged off and any related interest receivable adjustments.
- Fees and penalties: Fee Receivable and charge-off fee income adjustments, along with related receivable treatments for penalties .
- The charge-off scenario may be labeled with reason codes such as FRAUD in the accounting examples, which affects the exact GL account usage in the documented patterns.

The accounting entries must balance, with debits equal to credits when data for both sides are present, and the design emphasizes the integrity requirements that drive reconciliations and post-transaction balance consistency.

### Edge cases and validity constraints

- Charge-off cannot be scheduled for a future date; it must reflect the current or past transaction context that renders the loan exposure non-recoverable as of the charge-off moment.
- The charge-off date must correspond to the latest transaction on the loan account to be valid under the policy.
- Backdating and reversal scenarios can trigger a full backward replay of transactions, including previously recognized charge-off entries, so the system must preserve a complete, auditable trail for such events.
- The change is described in terms of processing behavior and accounting implications; public API surfaces are not described in the reference material, and no API surface changes are documented here.

### Lifecycle: a compact flow (Mermaid diagram)

```mermaid
flowchart TD
 A[Loan Active / Amortizing] --> B{Charge-off requested}
 B --> C[Validate charge-off date (not in future, latest transaction)]
 C --> D[Compute accrued interest up to charge-off date]
 D --> E[Mark future balances as due immediately]
 E --> F[Cease interest accrual from day after charge-off]
 F --> G[Record charge-off accounting entries (principal, interest, fees, penalties)]
 G --> H[Update loan schedule to reflect immediate due balances]
 H --> I[Payments post-charge-off are allocated to settled exposure]
 I --> J{Backdated payment or reversal occurs?}
 J -->|Yes| K[Reverse-replay of affected transactions including charge-off]
 K --> L[Restore consistent balances and schedules]
 J -->|No| L
```

### Practical integration notes (high-level guidance)

- verify the accrual engine can stop at the charge-off moment and avoid retroactive accrual beyond that date for the affected loan. The system should preserve the charge-off date’s salience as the moment the exposure becomes immediately due.
- Align the repayment allocations to the new, immediately-due balance, so that any payments are posted against the outstanding exposure rather than continuing under the original amortization path.
- When a reversal or backdated payment occurs, re-run the transaction timeline to produce a consistent, auditable sequence that includes reversal of the charge-off if applicable and reapplication of the updated balance state.
- Validate GL postings for principal, interest, fees, and penalties separately, so that debits and credits balance in all cases where data is available, and that the entries reflect the correct loss, income, and receivable components.
- Maintain defensible data integrity checks for edge cases (e.g., so that the charge-off cannot occur while future transactions would violate policy, and verifying a clean rollback path if a reversal occurs).

- The enhancement treats the charge-off event as the moment when all future loan balances become due, and it stops accrual from the day after the charge-off date. This is the core behavioral change described in the reference material.
- The system documents multiple scenarios for charge-off timing relative to payment events (on due date, after an installment date, backdated payments, and reversals) and specifies that backdated repayments can trigger a reverse-replay of the charge-off sequence.
- The GL accounting mapping provided in the reference materials articulates how principal, interest, fees, and penalties map to credit and debit accounts during charge-off events, and it notes that some configurations may use different accounting lines (for example, variants labeled FRAUD).
- The integrity requirements emphasize that journal entries must balance when data is present, and that running intermediate calculations, running balances, and rounding must adhere to evidenced conventions (e.g., HALF_UP or HALF_EVEN ).

### Terminology quick reference

- Charge-off: An event marking a loan as non-recoverable from servicing perspective, triggering immediate due of remaining exposure and cessation of accrual beyond the charge-off date.
- Accrual: The process of recognizing interest over time according to the loan’s day-count convention.
- Day-count convention: The method used to compute interest for a period, with the reference material illustrating 360-day year and 30-day months in several scenarios (and 365-day-based test data in alternative sheets).
- Reversal / reverse-replay: The process of undoing or replaying a sequence of transactions around a charge-off to restore a consistent historical state when repayments or reversals occur.

This page captures the verified behavioral expectations, the calculation framework, and the accounting implications for Charge-Off: Immediate Due of Future Balances as implemented in the reference material. It focuses on the mechanism, schedules, and ledger treatment, and it describes the verified pathways through which the system enforces the immediate-due rule, stops accrual after charge-off, and reconciles subsequent events with the loan’s updated state.