# Interest rate modification

This page documents the published behavior and design considerations for modifying the interest rate on Progressive loan accounts. The feature is anchored to the Progressive loan domain and interacts with the broader loan servicing framework. It defines how an interest-rate change is applied, which portions of the repayment schedule are affected, and how the remaining EMI is recalculated in light of the new rate. The guidance below reflects the verified requirements and decision notes gathered in the reference material. It does not present private implementation details or internal work items.

### Conceptual scope and module boundaries

- Primary domain: Progressive loans within the loan servicing subsystem. The change operates on active Progressive loan accounts and influences the repayment schedule for future, unpaid installments. The interaction surface is the loan servicing logic that governs repayment schedules and EMI calculations.
- Interfaces: No REST endpoint contracts are described . The documentation focuses on the business rules and scheduling behavior; concrete API contracts are not specified here.
- Execution lifecycle: The feature concerns a post-disbursement modification that takes effect on future periods. It requires recalculation of the EMI for remaining installments and reallocation of future interest accrual under the new rate while preserving past payments and the integrity of already-paid amounts.

### Verified requirements and rules

1) Interest modification can be applied for future dates only (current date + 1 day or later).
- The modification is not retroactive to past dates; it is constrained to dates strictly in the future relative to today.

2) Interest will be effected from the applied date itself.
- From the applied date onward, the interest accrual uses the newly selected rate for the remaining balance and future periods.

3) Installments already paid (EMI and interest) are not affected by the interest change.
- Past payments retain their originally calculated components; the change does not alter amounts that have already been settled.

4) EMI calculation will only consider future non-paid installments for EMI recalculation.
- The recalculated EMI applies to the remaining unpaid installments after the applied date; installments with due dates prior to the applied date do not participate in the EMI recalculation.

5) Interest modifications will affect the EMI; EMI will be reduced or increased based on the selected interest rate.
- The EMI amount for future installments is adjusted to reflect the new rate, changing the cash flows required to amortize the outstanding balance over the remaining term.

6) Interest rate can be modified only on active loan accounts.
- Eligibility is restricted to loan accounts currently in an active servicing state.

### Design decisions and handling of edge cases

- Backdated repayments and reversals: indicates a positive stance toward supporting backdated repayments and reversals when interest modification is in scope. The design accepts backdated actions and recalculations , acknowledging that such operations trigger possible schedule replays of prior installments calculated under the old rate.
- EMI-only adjustment: For now, the policy specifies that the rate change affects EMI; installments themselves are not re-derived on a per-installment basis. This means the scheduled EMI changes, while the underlying balance and interest accrual are recomputed, do not retroactively recalibrate individual past installment lines beyond what is necessary to reflect the new rate for future periods.
- Recalculation strategy: Based on the provided guidance, repayments beyond the applied date are re-evaluated to determine how much of each future period’s EMI should cover principal versus interest under the new rate. The transition uses the new rate from the applied date forward while preserving the previous rate for interest that accrued before the applied date.
- Refund/adjustment semantics: The reference notes that interest refunds are possible in this context. The mechanism is described as applying a transition where the first installments after the rate change may reference the old-rate calculation for portions that were already recognized, and subsequently the new rate governs future accrual. The intent is to align the ongoing schedule with the newer rate while verifying consistency with prior recognized interest.

### Calculation conventions and formulas (-based)

The reference material includes multiple calculation conventions used in the context of EMI and interest accrual for progressive and other loan types. The following formulas are documented in the provided references and are relevant to rate modification for Progressive loans:

- Rate factor (monthly 360-day convention):
 Rate factor = 1 + (rate of interest * (days in month / days in year) * (actual days in period / calculated days in period))
 This rate factor is used to scale the interest component for periods defined by the chosen day-count convention.

- Installment interest (per period):
 Installment Interest = Principal balance * (rate factor - 1)
 This expresses the portion of a period's EMI that is attributed to interest given the period’s rate factor.

- EMI calculation (general notion observed in the reference structures):
 EMI is described as a function of the rate factor(s) and the remaining principal over the remaining periods. The reference patterns show EMI being computed as a function of the rate factor contributions and the remaining principal across the unresolved periods, with the exact mathematical form dependent on the chosen periodization and the rate factors for those periods.

- Default and special period handling:
 - Default period: monthly, yearly, whole period.
 - Unusual period: daily, weekly.
 - The above conventions influence how rate factors and EMI are computed for each schedule segment.

Notes on precision and reconciliation:
- The integrity requirements emphasize that each period’s opening balance must equal the previous period’s closing balance, and that payment allocations must reconcile with the transaction amount. The design advocates maintaining reconciled running balances and consistent allocation of EMI and interest across the updated schedule.
- When an EMI is recalculated, the new schedule must reconcile with the outstanding balance and the applied rate, so that the sum of future principal and interest follows the updated EMI and that total cash flows remain consistent with the loan’s term.

### Behavioral flow and lifecycle (high-level)

- Input validation: The system receives an interest-rate modification instruction with an applied date. It validates that the loan is active and that the applied date is in the future (today + 1 day or later).
- Schedule identification: Identify future, unpaid installments that will be affected by the rate change.
- Calculation and reallocation: Compute the new EMI based on the outstanding balance and the new rate for the remaining periods. For the period starting at the applied date, accrue interest using the new rate; portions of interest that were recognized before the applied date use the old rate . Re-allocation rules determine how the EMI components (principal and interest) are distributed across future installments.
- Schedule update: Persist the updated repayment schedule for the future installments. verify that the updated schedule preserves the correct balance progression and that per-period fields (opening balance, EMI, principal, interest) reflect the new calculations.
- Post-change state: The loan remains active if the modification leaves a remaining balance; the EMI for future installments will reflect the new rate. Past installments retain their original treatment. If the loan is paid off, the final period resolves according to the recalculated schedule.

### Data model impact and persistence considerations

- Per-period schedule entries (for Progressive loans) represent the ongoing repayment plan with fields such as Balance, EMI, Principal, and Interest. The rate-change operation updates only future, unpaid portions of this schedule, leaving past entries intact.
- Opening and closing balances across periods must remain consistent as the schedule is updated. The per-period transitions should maintain balance continuity: opening balance of a period equals the previous period’s closing balance.
- Any adjustments to EMI and the distribution of interest versus principal must preserve total paid amounts across remaining periods in a way that reconciles with the updated balance and the new rate.

### Diagram: high-level process flow

````mermaid
flowchart TD
 A[Start: Interest rate modification request] --> B{Loan is active?}
 B -- No --> C[Reject: only active loans allowed]
 B -- Yes --> D{Applied date >= today + 1 day?}
 D -- No --> E[Reject: applied date must be in the future]
 D -- Yes --> F[Identify future unpaid installments]
 F --> G[Compute new EMI for remaining periods using new rate]
 G --> H[Compute old-rate interest for days before applied date, if any]
 H --> I[Allocate interest/principal per period: old-rate portion and new-rate portion]
 I --> J[Update repayment schedule for future installments]
 J --> K[Persist updated balances and EMI values]
 K --> L[Post-change equilibria: past installments unchanged; future EMI reflects new rate]
 L --> M[End]
````

### Examples and references (no new figures)

The reference documentation includes multiple worked-like schedules and transition examples that illustrate the interplay between old-rate calculations and new-rate calculations around the applied date. These examples demonstrate scenarios where future installments have portions of interest calculated under the old rate before the applied date and the remainder under the new rate after the applied date. They also reflect how EMI and principal allocations adjust in response to early repayments or partial repayments near the applied date. The operational takeaway is that the system must be capable of segmenting periods around the applied date and applying the associated rate to each segment while preserving continuity of the repayment schedule.

### API contracts, events, and accounting (current )

- REST endpoints: None are described for this feature.
- Domain events: The reference does not specify emitted events for rate modification; no event payload schemas are documented here.
- Accounting and GL impact: The reference does not provide detailed accounting entries for the rate-change flow. The documented expectations emphasize the integrity of the repayment schedule and the alignment of EMI with the updated rate for future installments.

### Backward compatibility and test considerations

- The feature is designed to leave already-paid EMI and interest untouched, verifying backward compatibility with historical payments.
- The modification should not be applied to past periods; the reactivity applies to future installments only.
- Tests should verify that: (a) applied date in the future yields updated EMI for future installments, (b) past installments are preserved, (c) the opening balance of each period remains equal to the previous period’s closing balance, and (d) allocations of principal and interest reconcile with the total EMI across the updated schedule.

### Summary

Interest rate modification for Progressive loans represents a controlled mechanism to rebase the cost of borrowing on future periods while preserving the validity of historical payments. It enforces future-date applicability, preserves paid amounts, recalculates EMI for the remaining term, and reallocates interest accrual from the applied date forward under the new rate. The design accommodates backdated repayments and reversals as part of the broader capability to replay or adjust schedules in response to rate changes, with EMI changes serving as the primary lever for aligning cash flows with the new rate.