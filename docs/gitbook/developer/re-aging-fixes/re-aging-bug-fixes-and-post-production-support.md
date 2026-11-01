# Re-aging bug fixes and post production support

This article documents the verified behavior, rules, and typical processing flows for re-aging handling and related post production support in Pepper-Soup. It collates reference calculations, rule interpretations, and edge cases observed in the published reference data. The material focuses on what the system does, how it behaves under defined scenarios, and what results follow from the re-aging operations. It does not expose internal implementation details outside what is evidenced by the reference material.

### Context and scope

Re-aging is a computation that adjusts a loan’s repayment schedule in response to a date shift or a human-initiated correction. The reference data describes several re-aging scenarios, including standard amortization with principal re-allocation, pre- and post-re-aging fees handling, charge-backs, and N+1 installment adjustments. A core set of business rules appears across the materials: the re-age date must not precede the last repayment date; principal can be re-amortized while unpaid interest may be waived in certain cases; N+1 installments may be introduced or adjusted as part of reverse replay; backdated repayments or reversals are permitted and trigger a replay; and re-aging can be reversed as long as it is not the latest transaction on the loan. Charges and fees with due dates after the re-age date are waived, while those with due dates before the re-age date are split among the new installments.

The reference data also documents multiple illustrative schedules and transaction traces that demonstrate how balances, interest, and principal evolve through the re-aging process. These examples are intended to support integration testing and post production verification, not to prescribe a fixed external API surface. The public interfaces, if any, are not specified in the reference; this page concentrates on evidenced behavior, calculations, and outcomes.

### Fundamental calculation context used by re-aging references

The reference calculations operate with a fixed loan-structure assumption used in the examples:

- Interest Rate: 7% per annum
- Days In year: 360
- Days In month: 30
- Principal (initial): 100
- Repayment cadence: monthly (every 1 month)

From these values, the per-period (monthly) interest rate is derived as follows: annual rate 7% divided by 12 gives a monthly rate of 0.07 / 12 = 0.005833333... The reference materials also express a daily rate for some calculations as 0.000194444 (which is 0.07 / 360). The monthly rate is consistent with 30-day period calculations: monthly interest for a 30-day period equals Balance × 0.000194444 × 30 = Balance × 0.005833333, which follows the observed EMI composition in the schedules.

The canonical amortization step used in the examples follows a two-part computation per period:
- Interest I = Balance × (annual rate / 360) × days in period
- Principal P = EMI − I
- New Balance = Balance − P

The first period example below illustrates the basic mechanics with the initial balance of 100 and EMI of 17.01. Interest is 0.58 (rounded to two decimals), principal repaid is 16.43, leaving a new balance of 83.57, and the EMI is fully allocated between principal and interest.

<div class="param-grid"><div class="param-card"><span class="param-label">Principal</span><span class="param-value">100</span></div><div class="param-card"><span class="param-label">EMI</span><span class="param-value">17.01</span></div><div class="param-card"><span class="param-label">Interest rate (monthly)</span><span class="param-value">0.005833333</span></div><div class="param-card"><span class="param-label">Interest I</span><span class="param-value">0.58</span></div><div class="param-card"><span class="param-label">Principal P</span><span class="param-value">16.43</span></div><div class="param-card"><span class="param-label">Balance after payment</span><span class="param-value">83.57</span></div></div>

### Representative calculation reference (S1 – Interest Split)

The reference materials include a schedule labeled S1 for an Interest Split scenario, with the following embedded constants and first-period computation:
- Principal: 100
- EMI: 17.01
- Interest (first period): 0.58
- Principal repaid (first period): 16.43
- Balance after first payment: 83.57

Calculation steps (illustrative, based on the reference data):
1) Compute monthly interest using daily rate 0.000194444 applied over a 30-day month: I = 100 × 0.000194444 × 30 ≈ 0.58.
2) Allocate EMI between interest and principal: P = EMI − I = 17.01 − 0.58 = 16.43.
3) Update balance: New Balance = 100 − 16.43 = 83.57.

These steps follows the values shown in the first row of the S1 schedule: Balance 100, EMI 17.01, Prin 16.43, Int 0.58, Balance after payment 83.57.

Note: Rounding in this data set uses two-decimal precision for monetary amounts, consistent with common HALF_UP-style rounding conventions used in the tables (e.g., 0.5833 rounds to 0.58).

### Re-aging rules and post-production outcomes (-based summaries)

- Re-aging eligibility and date rules
 - The re-age date is allowed on any date within the loan cycle, but it must not be before the last repayment date. This is stated in the high-level AC notes and is consistently echoed by the subsequent re-aging scenarios.
 - Re-aging can be reversed, but only up to the point where the re-age operation is not the latest transaction on the loan. This guard verifies ordering correctness in the loan ledger and avoids retroactive inconsistency in the repayment sequence.

- Principal, interest, and amortization behavior
 - In the “Principal Only will be re-amortized, unpaid Interest will be waived off” variant, the principal portion of the outstanding balance is re-amortized under the new schedule while any previously accrued but unpaid interest is waived as part of the re-aging operation.
 - In N+1 scenarios, the subsequent installment amount will be adjusted as part of the reverse replay, aligning the new schedule with the re-aged timeline.
 - Backdated repayments or reversals are permitted; these actions trigger a replay of the installment sequence, adjusting both principal and interest allocations as required by the new schedule.

- Fees, charges, and waivers
 - Charges and fees with a due date after the re-age date are waived as part of the re-aging process.
 - Charges and fees with a due date before the re-age date are allocated to the new installments, typically split across the re-aged schedule to preserve total amounts due.

- Transaction traces and ledger implications (-driven patterns)
 - The reference data presents per-period balances, EMIs, principal and interest components, and balance evolution across several re-aging scenarios, including S1 (Interest Split), S2 (Fees and Interest Split before re-aging), S3 (charge-back before), S4 (N+1 scenario), S5 (partially paid installment), and S6 (charge-back after re-aging).
 - Transaction rows frequently include Types such as repayment, chargeback, Snooze fees, and adjustments related to re-aging, illustrating how the system records and reconciles each step of the re-aging process.

### Key re-aging scenarios (high-level descriptions)

- S1 – Interest Split: Demonstrates standard amortization with explicit breakdown of EMI into principal and interest, followed by a balance progression over the first repayment period.
- S2 – Fees and Interest Split before re-aging: Shows how fees and interest split operate when a re-age is filed before a period boundary, illustrating alignment of the amortization with the adjusted starting state.
- S3 – Charge-back before: Explores a charge-back flow preceding re-aging, including adjustments to principal and interest components and the impact on the subsequent schedule.
- S4 – N+1 Scenario: Describes a scenario where an extra (N+1) installment is considered as part of reverse replay, affecting the re-aged amortization and resulting balances.
- S5 – Partially Paid Installment: Demonstrates behavior when an installment is only partially paid, including the implications for subsequent re-aging and the remaining balance.
- S6 – Chargeback after re-aging: Captures a flow where a charge-back occurs after re-aging has been applied, and how the system re-apportions the balance, principal, interest, and any fees.

> Note: The reference material includes additional variations (S1.1, S2.1, S3, S4, S5.1, S6, etc.) that cover merchant refunds, fees, and adjustments during re-aging. These variations illustrate on-the-fly recalculations and partial-pay scenarios used for testing and validation. The core behaviors above reflect the verified patterns these materials describe.

### Diagram: re-aging lifecycle (verified states and transitions)

flowchart TD
 A[Start: loan eligible for re-aging] --> B{Is re-age date before last repayment?}
 B -- Yes --> C[Reject re-aging; report validation error]
 B -- No --> D[Compute new amortization schedule]
 D --> E{Is there a reverse replay needed?}
 E -- Yes --> F[Incorporate N+1 installments / adjust schedule]
 E -- No --> G[Apply re-aged schedule to loan ledger]
 F --> G
 G --> H{Are there charges/fees due after re-age?}
 H -- Yes --> I[Waive post-re-age charges; reallocate any pre-re-age fees across new installments]
 H -- No --> J[Keep existing fee allocations; adjust only where required]
 I --> K[Emit re-age transaction events; update audit trail]
 J --> K
 K --> L{Is there a requirement to reverse the re-aging?}
 L -- Yes --> M[Reverse re-aging; replay original installments from the reversal point]
 L -- No --> N[End]
 M --> N

This diagram captures the verified decision points and flow of a re-aging operation and its possible reversal path, as reflected by the reference materials. It shows how the system progresses from eligibility checks through schedule recalculation, ledger updates, and potential reversal.

### APIs, contracts, and interfaces

The reference data does not provide a defined public API contract or service interface for re-aging. Therefore, this document does not enumerate specific method signatures or REST contracts. The material focuses on the behavioral outcomes, the calculations involved, and the ledger effects observed under the documented scenarios.

### Persistence, ledger effects, and accounting considerations

Across the reference scenarios, re-aging operations adjust the loan ledger by updating the balance, principal, and interest components according to the recalculated amortization schedule. The following principles are evidenced by the data:
- Balance integrity is preserved as the sum of outstanding principal and accrued interest follows the recalculated figures after each period.
- Each period’s opening balance equals the previous period’s closing balance, reflecting consistent period-to-period accounting continuity.
- Payment allocations reconcile with the transaction amounts, with principal and interest components summing to the EMI, given rounding to two decimals as shown in the references.
- When re-aging introduces N+1 installments or adjusts installments, the accounting entries reflect the new distribution of principal and interest across the re-aged periods.

The reference materials also illustrate a number of transaction traces (repayment, chargeback, and other adjustments) that demonstrate how the system records the re-aging process and its side effects on the ledger and balance ledger reconciliation.

### Post-production support guidance and testing considerations

- Validate re-aging eligibility against the last repayment date when crafting a fix or deploying a hotpatch.
- verify that re-aging can be reversed only when it is not the latest transaction on the loan, preserving transaction sequence integrity.
- Verify that post-re-age waivers for charges/fees and the reallocation of pre-re-age charges to new installments behave as specified in the AC rules and demonstrated by the reference scenarios.
- Include end-to-end tests that cover S1 through S6 variants, including edge cases like partially paid installments and backdated repayments, to confirm that balance, principal, and interest track correctly through the re-aged timeline.

### Quick reference: first-period calculation example (S1)

- Initial balance: 100
- EMI: 17.01
- Daily rate: 0.000194444 (annual rate 7%, 360-day year)
- Monthly rate (30 days): 0.005833333
- Period interest: I = 100 × 0.005833333 = 0.58 (rounded to two decimals)
- Principal paid: P = EMI − I = 17.01 − 0.58 = 16.43
- Balance after payment: 100 − 16.43 = 83.57

These values are representative of the S1 calculation row shown in the reference data and illustrate the mechanics used by the re-aging calculation engine.

### Summary of what this page provides

- Verified operational rules for re-aging and post-production support, including date rules, reversal semantics, and fee handling.
- Concrete, -based calculation reference and a representative first-period example to ground understanding of the amortization changes caused by re-aging.
- A visual lifecycle diagram illustrating the core processing steps and decision points in a re-aging operation.
- Guidance for validating and testing re-aging scenarios in a production-like context, with attention to ledger integrity, period-to-period balance continuity, and transaction reconciliation.

If you require deeper mappings to internal component names or APIs, this document can be extended in future updates to reflect approved public interfaces, once those contracts are evidenced in the reference material.