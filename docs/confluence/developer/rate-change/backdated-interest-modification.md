<!-- Labels: developer, rate-change -->
# Backdated Interest Modification

This page documents the Backdated Interest Modification feature within Pepper-Soup's loan management capabilities. It describes the verified technical scope, the algorithmic behavior, the persistence and accounting implications, and the operational processes validated by the reference calculations. The feature extends the existing interest rate modification capability to support retroactive (backdated) changes that take effect on a date prior to the current processing date. It impactfully recalculates accrued interest, amortization schedules, and related accounting entries from the effective date onward while preserving the integrity of prior periods.

## Concept and motivation

Backdated interest modification allows lenders and system integrators to apply a revised interest rate to periods that have already accrued, for example when a rate change agreement is executed after multiple payments have occurred. The retroactive adjustment must re-derive the amortization schedule from the stated effective date, reallocate interest and principal portions for affected periods, and verify that the opening balance for the first period after the retroactive window equals the closing balance of the preceding period. The modification is auditable and must preserve data integrity constraints across the loan lifecycle, including consistent run-to-run balances and balanced accounting entries where data is available.

The reference material demonstrates several scenarios where backdated rates (for example 4% and 7% annual) are applied with a defined day-count convention, and where calculations recur for successive periods after the effective date. The reference sheets also show how the system interleaves with regular payments, disbursements, repayments, and various edge cases such as early payments and repayment reversals. The verified behavior is that the retroactive calculation uses the retroactive rate for periods after the effective date and continues using the existing rate (or the adjusted rate if multiple retroactive events intersect) for subsequent periods, always adhering to the stated day-count conventions and rounding rules observed in the reference data.

## Scope of change: components, services, and interfaces touched

The Backdated Interest Modification feature touches multiple verified components of the loan processing pipeline. The changes are described at a high level to reflect verified architectural responsibilities without exposing private source artifacts:

- Rate modification capability: The modification surface now supports a backdated effective date for interest-rate changes. The behavior is to apply the revised rate retroactively from the specified date and trigger a recalculation of interest accrual for affected periods.
- Schedule recalculation engine: The amortization/schedule generator is extended to recalculate periods starting from the retroactive effective date. It recomputes interest and principal allocations for each affected period, revalidates opening and closing balances, and verifies that intermediate balances remain consistent with the updated calculation path.
- Accounting and ledger impact: The retroactive change drives recalculation of interest accrual and may require adjustments to journal entries to reflect retroactive interest and any reallocation of past payments in the ledger. When actual journal entries are available, they must balance and reconcile with the recalculated schedule.
- Persistence and auditing: The system stores revision metadata for retroactive changes (effectiveFrom, newRate, modificationDate) and maintains an audit trail that allows reconstruction of the original vs. modified schedule and balances.
- Validation and guards: The feature introduces validations around dates (for example, effectiveFrom must be compatible with business date constraints) and guards against inconsistent state transitions (opening balance must equal the previous period's closing balance).
- API surface (surface-level description): The modification operation accepts inputs for the loan, the new interest rate, the retroactive effective date, and the business date used for processing. It triggers schedule recomputation and returns the updated schedule and balances alongside any applicable accounting implications. The exact REST payloads and field names are not published here; the surface-level parameter concepts follows the verified behavior described above.

## Data model and persistence considerations

The retroactive modification relies on the same core loan data structures used in standard rate changes, augmented with the notion of an effective-from date and a revision history for the amortization schedule. Specifically:

- Effective-from date: Marks the retroactive start of the new rate application. Calculations are performed for periods on or after this date.
- Revision/audit metadata: Each retroactive change records the modification timestamp, the old and new rate, and the effective-from date to support traceability and audits.
- Schedule snapshots: Updated schedules are persisted to reflect the retroactive recalculation. Each period's opening balance, EMI, principal component, interest component, and closing balance are updated to reflect the retroactive calculation, while verifying the invariant that a period's opening balance equals the previous period's closing balance remains intact.
- Accounting entries: Where available, retroactive charges and adjustments are captured as journal entries that balance debits and credits. The exact accounting codes and ledger accounts are governed by the existing accounting model; retroactive entries are produced only when the retroactive calculation is performed and when the associated journal entries are available.

## Calculations and day-count conventions (verified approach)

The reference data consistently uses a 360-day year and a 30-day month for the backdated scenarios. The annual rate is converted to a monthly rate by dividing the annual rate by 12, yielding a monthly rate that drives the rate factor per period. The rate factor for a given period is 1 plus the monthly rate. For example:

- 7% annual rate results in a monthly rate of 0.07 / 12 = 0.005833333, and a monthly rate factor of 1.005833333.
- 4% annual rate results in a monthly rate of 0.04 / 12 = 0.003333333, and a monthly rate factor of 1.003333333.

The standard amortization step for a period, given a fixed EMI, is computed as follows (rounded to two decimals as shown in the references):
- Interest for the period = opening balance × monthly rate (rounded to 2 decimals).
- Principal repaid in the period = EMI − interest (rounded to 2 decimals).
- Closing balance for the period = opening balance − principal repaid (rounded to 2 decimals).

In the backdated scenario, the retroactive rate applies from the effective-from date onward. All periods from the retroactive date up to the current processing window are recalculated using the retroactive rate for that sub-range, and subsequent periods continue with the rate path defined by the retroactive event(s). Rounding follows two-decimal precision (typical for currency), consistent with the reference calculations.

Example: retroactive recalculation after a backdated rate change from 2/2/2024, with an initial balance of 83.57 after the first payment on 2/1/2024 and EMI of 17.01.
- Base (2/1/2024) using 7% annual: interest ≈ 0.58, principal ≈ 16.43, new balance ≈ 83.57.
- Effective from 2/2/2024, rate becomes 4% annual for subsequent periods. For the period ending 3/1/2024, using 4% monthly rate 0.003333333: interest ≈ 0.28, principal ≈ 16.73, new balance ≈ 66.84.
- For the period ending 4/1/2024, interest ≈ 0.22, principal ≈ 16.79, new balance ≈ 50.05.

The calculations above illustrate the retroactive impact on the schedule and demonstrate the core mechanics: retroactive rate application, recalculation of each period, and rounding to two decimals for the financial figures.

<div class="param-grid">
 <div class="param-card">
 <span class="param-label">Opening balance (retroactive window start)</span>
 <span class="param-value">83.57</span>
 </div>
 <div class="param-card">
 <span class="param-label">Retroactive rate (annual)</span>
 <span class="param-value">4%</span>
 </div>
 <div class="param-card">
 <span class="param-label"> EMI (unchanged during retroactive window)</span>
 <span class="param-value">17.01</span>
 </div>
 <div class="param-card">
 <span class="param-label">Period: 2/2/2024 → 3/1/2024</span>
 <span class="param-value">Interest ≈ 0.28; Principal ≈ 16.73; Balance ≈ 66.84</span>
 </div>
</div>

### Calculation reference: illustrative steps (two-period example)
- Baseline step (pre-retroactive): opening balance = 100.00, EMI = 17.01, rate = 7% annual, monthly rate = 0.005833333, period length = 1 month.
 - 2/1/2024: Interest = 100.00 × 0.005833333 ≈ 0.58; Principal = 17.01 − 0.58 ≈ 16.43; Closing balance = 100.00 − 16.43 ≈ 83.57.
- Retroactive step: effective-from date = 2/2/2024; rate changes to 4% annual for subsequent periods.
 - 3/1/2024: Balance at start = 83.57; Interest = 83.57 × 0.003333333 ≈ 0.28; Principal = 17.01 − 0.28 ≈ 16.73; Balance = 83.57 − 16.73 ≈ 66.84.
 - 4/1/2024: Balance at start = 66.84; Interest = 66.84 × 0.003333333 ≈ 0.22; Principal = 17.01 − 0.22 ≈ 16.79; Balance = 66.84 − 16.79 ≈ 50.05.

Notes:
- Rounding is to two decimals (HALF_UP), consistent with the currency presentation in the reference material.
- The exact intermediate values may vary slightly depending on the precise interpretation of the retroactive window boundaries and the precise handling of date boundaries in the production implementation. The example above demonstrates the core mechanics validated by the reference data.

## Algorithms, workflows, and state transitions (high-level)

The following sequence captures the verified processing flow when a backdated interest modification is executed:

1. Initiation and validation
- User or system triggers a backdated interest modification on a specific loan.
- The system validates that the retroactive effective date is compatible with the loan's payment history and business date constraints.
- If the retroactive window overlaps with past payments, the retroactive application is prepared to recompute the affected periods.

2. Retroactive calculation
- The system computes the retroactive period(s) using the retroactive rate for periods on or after the effective-from date.
- For each period in the retroactive window, the calculation uses the period's opening balance, the EMI, and the monthly rate associated to the retroactive rate, with rounding to two decimals.
- The recalculation yields updated principal and interest components and a revised closing balance for each period within the retroactive window.

3. Schedule rebuild and reconciliation
- After completing the retroactive calculation, the system rebuilds the amortization schedule from the retroactive date forward, so that the opening balance of the first post-retroactive period equals the retroactively determined closing balance of the preceding period.
- The updated schedule must preserve the invariant: a period’s opening balance equals the previous period’s closing balance (integrity requirement).

4. Payments and adjustments
- If retroactive calculations intersect with actual payments already recorded in the ledger, the system reallocates those payments to follows the new schedule while maintaining overall cash flow consistency.
- Any necessary adjustments are prepared to reflect revised interest accrual and principal allocations.

5. Accounting impact (when journal entries are available)
- The retroactive recalculation can generate retroactive interest accrual entries and adjustments to interest receivable and loan portfolio accounts.
- Debits and credits must balance in the accounting entries, and the entries should be traceable to the associated retroactive period(s).

6. Persistence and auditing
- The revised schedule, revised balances, and retroactive modification metadata are persisted for auditability.
- The audit trail preserves the original state, the modification event, and the updated state to support reconciliation and reporting.

7. Validation and end-state checks
- The system verifies that the final state after retroactive modification maintains the integrity constraints (opening balances, balance reconciliation, and GL consistency ).
- Any inconsistencies trigger a failure state with a clear validation message to the operator or integrator.

## API surface and contracts (high level, no payload formats)

The backdated interest modification feature exposes a processing surface within the loan management domain. At a high level, the inputs are described conceptually as:
- Loan identifier (loanId) to identify the loan undergoing modification.
- New interest rate (newInterestRate) to be applied retroactively.
- Retroactive effective date (effectiveFromDate) that marks the start of retroactive application.
- Processing date anchor (businessDate) that defines the current processing horizon.

Behavioral differences from the prior, non-backdated flow include:
- The system recalculates the amortization schedule starting from effectiveFromDate rather than solely anchoring to the current date.
- The retroactive window may interact with past payments and yields revised principal and interest components for affected periods.
- The resulting schedule and any related accounting implications are surfaced to the caller as updated state; existing open items are reconciled against the revised state.

Note: Exact REST endpoints, JSON payloads, or parameter names are not published in this document. The described concepts follows the verified behavior and data flows demonstrated by the reference calculations and schedules.

## Example scenario derived from reference calculations (verification-oriented)

The reference materials show a base case with an initial balance of 100 and an EMI of 17.01 under a 7% annual rate, with a backdated rate modification to 4% effective from 2/2/2024. The example illustrates the core mechanics of retroactive application:

- Pre-modification (before 2/2/2024):
 - 2/1/2024: Balance = 83.57; Interest = 0.58; Principal = 16.43; EMI = 17.01.
- Retroactive application from 2/2/2024 onward with 4% annual rate:
 - 3/1/2024: Balance ≈ 66.84; Interest ≈ 0.28; Principal ≈ 16.73; EMI = 17.01.
 - 4/1/2024: Balance ≈ 50.05; Interest ≈ 0.22; Principal ≈ 16.79; EMI = 17.01.

These values demonstrate the retroactive impact: a lower retroactive rate reduces interest accrual in the affected periods, shifting more of each EMI toward principal, and updating subsequent balances . The results are rounded to two decimals, consistent with currency presentation in the reference data.

## Testing and verification coverage (as evidenced by reference sheets)

The reference data contains multiple scenario sheets that exercise backdated modifications across different contexts:

- S1, S2, S3, S4, S5, S6, S7: Each sheet models a variant of backdated rate changes, repayment timing, early/late payments, and end-of-term considerations. The scenarios explore:
 - Backdated rate change with a single retroactive event at different dates.
 - Backdated application during ongoing repayments, including interruptions and reversals.
 - The interaction of backdated rate changes with early repayments and with end-of-term adjustments.
 - The accounting implications of retroactive changes (where illustrated in the reference tables).

- The calculations consistently apply a 360-day year and a 30-day month, using a monthly rate derived from the annual rate as described above, and rounding to two decimals.

The tested patterns validate that retroactive rate changes produce a coherent recalculation of the amortization schedule, preserve balance consistency across periods, and surface updated figures for the updated loan state.

## Diagrams

flowchart TD
 A[Initiate backdated rate modification] --> B[Validate dates and constraints]
 B --> C{Retroactive window exists?}
 C -- Yes --> D[Recalculate retroactive periods using retroactive rate]
 C -- No --> E[Apply standard rate modification]
 D --> F[Rebuild amortization schedule from effectiveFromDate]
 F --> G[Reconcile payments, if any within retroactive window]
 G --> H[Generate/update accounting entries]
 H --> I[Persist revised schedule and audit trail]
 I --> J[Final state validation: opening balances consistent, GL balanced]

Note: The diagram illustrates the verified processing flow for backdated modifications and does not depict internal system paths beyond the verified components and state transitions.

## Architecture and implementation guidance (summary)

- verify that retroactive calculations are triggered only when a retroactive effective date is provided and the processing context permits retroactive operation.
- Implement a retroactive schedule recalculation path that starts at the retroactive effective date and iterates forward through subsequent periods, applying the applicable rate for each period.
- Enforce integrity constraints: the opening balance of any period must equal the previous period's closing balance; the revised balances and payments must reconcile with the cash flow of the loan.
- Provide auditable revision trails that capture the old and new rate, the effective-from date, and the resulting changes to the amortization schedule.
- Align accounting behavior with the retroactive schedule: generate retroactive accruals and adjustments consistent with the loan's GL model when journal entries are available, verifying debit and credit balances reconcile.
- Document and test edge cases, including retroactive changes that intersect with past repayments, early payoffs, and charge-offs .

## Summary of verified behavior

- The system supports retroactive (backdated) interest rate modifications by applying the new rate from the specified effective-from date and recalculating the amortization schedule from that point forward.
- The retroactive recalculation uses the same day-count conventions as the base model (360-day year, 30-day month) and rounds monetary values to two decimals.
- Opening balances and closing balances across periods remain reconciled after retroactive recalculation, preserving the invariant that a period's opening balance equals the previous period's closing balance.
- The retroactive process can affect only the periods within the retroactive window; prior periods are preserved unless the retroactive window overlaps with them and the schedule re-generation requires adjustments.
- The feature is accompanied by auditability and, where enabled, associated accounting entries that balance and reflect retroactive accruals.

If you are extending or integrating this functionality, align your implementation with the behavioral contract described above, replicate the verified schedule-building logic for retroactive windows, and validate your integration against the reference scenarios (S1–S7) to verify consistency with the published calculations and their rounding behavior.