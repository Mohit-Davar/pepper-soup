<!-- Labels: user, re-aging -->
# Re-aging for Interest bearing products

Re-aging for Interest bearing products allows controlled adjustments to a loan's amortization when a borrower’s payment timing changes. It allows recalculation of the payment schedule beginning from a chosen re-aging date, reassigning how principal and, depending on policy, interest and related charges are allocated across the remaining installments. The feature benefits operations staff, loan officers, branch managers, and credit agents by providing a formal mechanism to realign repayment terms without altering the loan’s fundamental terms beyond the agreed re-aging event.

Navigation path: Re-amortization and Re-aging > Re-aging > Re-aging for Interest bearing products.

### Key rules and constraints (verified behavior)
- Re-aging is allowed from a date within the loan cycle, but the re-aging date must not be before the last repayment date recorded on the loan. In other words, the re-aging date must be on or after the latest completed repayment date.
- Re-aging can be applied on charge-off loan accounts as well.
- The re-aging process includes options to handle charges and interest in ways that follows business policy: charges due after the re-age date may be waived, while charges due before the re-age date are split across the new installments; unpaid or reversed charges and interest may be replayed in the new schedule when backdated repayments or reversals occur.
- The re-aging operation can be reversed until it becomes the latest transaction on the loan. In that case, the replayed schedule reflects the reversal and any subsequent re-aging events.
- N+1 and related adjustments may occur as part of reverse replay, adjusting the number or amount of installments in the re-aged schedule.
- After re-aging, the system may need to allocate a portion of the original charges/fees to the new installments according to the rule set (fees with due date after re-age are waived; those with due date before re-age are split among new installments).
- Partial payments and charge-backs before or after the re-aging event are modeled as distinct scenarios with their own allocation rules, as described in the reference calculations and schedules.

Note: The above rules reflect the documented reference behavior for Re-aging on Interest bearing products. Workflows and calculations shown below illustrate representative behavior from the reference data.

### Calculation context and baseline inputs
For the illustrative calculations in this page, the reference model uses the following constants:
- Principal (outstanding) to re-amortize: 100
- Interest rate: 7% per year (0.000194444 per day)
- Days in year: 360
- Days in month: 30
- Repayment frequency: monthly
- Re-aging from a given date with a specified number of new installments (N+1 scenarios may adjust the next installment counts)

This context is used to explain how the system recalculates the amortization schedule when a re-aging event occurs. The values above are drawn from the reference calculations and are representative of the base inputs used for re-aging calculations.

### Calculation patterns observed in the reference data
The reference data shows several calculation patterns that the system supports when performing re-aging on an interest-bearing loan. Each pattern corresponds to how interest and other amounts are treated across the new schedule. The following descriptions correspond to the observed patterns, with concrete numbers shown in the worked example that follows.
- Pattern A: Interest Split across new installments. Principal is re-amortized across the new installments, while interest is allocated over the revised schedule according to the applicable rate and day-count conventions.
- Pattern B: Fees and Interest Split before re-aging. Fees and interest are allocated in the re-aging calculation according to their original due dates and the re-age date, before finalizing the new installment schedule.
- Pattern C: Charge-back scenarios. The reference data includes both pre- and post-re-aging charge-backs, with associated effects on principal, interest, and the balance of the re-aged schedule.
- Pattern D: N+1 Scenarios. The re-aged schedule may include an additional installment (N+1) to reflect the new accumulation period after the re-age date.
- Pattern E: Partially paid installments. When an installment is partially paid, the system adjusts the remaining balance and the final installment to reflect the partial payment and verify the remaining principal and interest follows the new amortization path.
- Pattern F: Re-aging with merchant/interest refunds (S1.1). In some cases, refunds or adjustments to merchant/interest components occur as part of the re-aging calculation.
- Pattern G: Post-re-aging charge-backs. If a charge-back occurs after re-aging, the re-aged schedule may reflect new principal or interest allocations to accommodate the reversal.

The exact allocation decisions for a given loan depend on the selected re-aging scenario and the associated policy rules applied during the re-age operation.

> Important: The patterns above reflect the documented reference behavior. They are presented to explain the observed behavior in the reference data and are not generic guidance outside those contexts.

## Worked example: re-aging with principal re-amortization and interest handling (illustrative from reference data)
Context: Re-aging from 4/1/2024, with an outstanding balance of 84.28 as of 3/15/2024, and 6 re-aged installments planned. The reference data presents a concrete sequence of balances and installments in a subsequent re-aged schedule.

- Pre-re-age summary (from the reference sequence):
 - Business date: 3/15/2024
 - Balance for calculation: 84.28
 - Total outstanding balance: 84.28
 - Total principal balance: 83.57
 - Total interest balance: 0.71
 - Re-age from: 4/1/2024
 - Re-age installments: 6

- Re-aged calculation (illustrative sequence after re-aging):
 - 4/1/2024: Balance 70.35; EMI 14.05; Principal 13.93; Interest 0.12
 - 5/1/2024: Balance 56.42; EMI 14.05; Principal 13.93; Interest 0.12
 - 6/1/2024: Balance 42.49; EMI 14.05; Principal 13.93; Interest 0.12
 - 7/1/2024: Balance 28.56; EMI 14.05; Principal 13.93; Interest 0.12
 - 8/1/2024: Balance 14.63; EMI 14.05; Principal 13.93; Interest 0.12
 - 9/1/2024: Balance 0.71; EMI 14.03; Principal 13.92; Interest 0.11
 - Totals for the re-aged sequence show principal across the installments totaling 83.57 and interest totaling 0.71 in the pre-adjustment context; the re-aging path demonstrates how the outstanding balance declines across the new installments.

Table: Balance progression after re-aging (illustrative values from the reference sequence)
<div class="param-grid"><div class="param-card"><span class="param-label">Re-age from</span><span class="param-value">4/1/2024</span></div><div class="param-card"><span class="param-label">Installments</span><span class="param-value">6</span></div><div class="param-card"><span class="param-label">Starting balance (pre-re-age)</span><span class="param-value">84.28</span></div></div>

| Date | Balance | EMI | Principal | Interest |
| --- | ---:| ---:| ---:| ---:|
| 4/1/2024 | 70.35 | 14.05 | 13.93 | 0.12 |
| 5/1/2024 | 56.42 | 14.05 | 13.93 | 0.12 |
| 6/1/2024 | 42.49 | 14.05 | 13.93 | 0.12 |
| 7/1/2024 | 28.56 | 14.05 | 13.93 | 0.12 |
| 8/1/2024 | 14.63 | 14.05 | 13.93 | 0.12 |
| 9/1/2024 | 0.71 | 14.03 | 13.92 | 0.11 |

Notes:
- The re-aged schedule reduces the current balance across six installments, aligning with the re-age date and the new amortization path. The exact installment amounts, balances, and interest portions are derived from the reference calculations and depend on the chosen re-aging scenario and the policy rules applied during the replay.
- In this example, the final balance reaches zero on the last re-aged installment, demonstrating complete principal repayment through the re-aged path. The system would record the associated transactions and any minor rounding effects per the 360-day year and 30-day month conventions.

## How re-aging affects payments, allocations, and accounting
- Payment allocations after re-aging must reconcile with the transaction amount. The re-aged installments are allocated to principal and interest per the selected pattern, and any charges/fees are treated according to the policy: charges due after the re-age date may be waived, while those due before are split across the new installments.
- A backdated repayment or reversal is allowed; re-aging itself will be reversed and replayed if the underlying repayment history changes. Re-aging can be reversed until it is the latest transaction on the loan.
- If there are charge-backs after re-aging, they are incorporated into the re-aged schedule in a way that maintains the integrity of the payment path and the overall balance progression.

### Validation and integrity checks
- Each period’s opening balance must equal the previous period’s closing balance (balance continuity).
- Payment allocations must reconcile with the transaction amount and reflect the actual EMI/Installment schedule.
- Remaining cash, outstanding principal, and interest balances must reconcile against the expected totals after re-aging.
- If journal entries exist, they must balance (debits equal credits) when accounting entries are available for the re-aging event.
- Rounding must follow the evidenced conventions (e.g., HALF_UP or HALF_EVEN) as specified by the reference conventions used in the re-aging calculations.

### Operational guidance: steps to perform re-aging in the system (typical flow)
1) Open the loan record for the account that requires re-aging.
2) Navigate to the Re-amortization and Re-aging module, then select Re-aging for Interest bearing products.
3) Enter the re-aging date in the Re-aging date field. The system validates that the date is not before the last repayment date recorded on the loan.
4) Choose the re-aging pattern that matches the desired handling of principal, interest, and charges for the new schedule (patterns include, but are not limited to, principal re-amortization with interest allocation across new installments, and pre-re-aging fee/interest split scenarios).
5) Specify the number of new installments (N) or N+1 scenario as required by policy and the loan's current state. If applicable, indicate the N+1 adjustment and any reverse replay behavior.
6) Confirm or apply the re-aging operation. The system replays the schedule, creating a new amortization path that begins on the re-aging date and continues for the specified installments.
7) Review the final re-aged schedule, including the new opening balance, installment amounts, and the allocation of principal and interest. If the loan has any post-re-age charges or backdated payments, verify their treatment per policy (waived charges vs. split charges across new installments).
8) If needed, the re-aging event can be reversed, in which case the system replays transactions to restore the original or pre-re-aging state up to the most recent transaction.

### Glossary (brief)
- Re-aging: A controlled adjustment that redefines the amortization path of a loan from a chosen date, re-allocating principal and, , interest and charges into a new sequence of installments.
- Reverse replay: The process of reversing the re-aging adjustments and replaying the original or updated repayment history to a consistent state.
- Charge-back: A reversal or refund of a previously charged interest or principal component that may occur in relation to a re-aging event.
- N+1: An extended amortization path that includes an additional installment beyond the standard count, used in some re-aging scenarios.

### Final notes
The Re-aging for Interest bearing products feature consolidates several observed calculation patterns and decision points from the reference data. Its purpose is to provide a controlled, auditable mechanism to adjust repayment schedules in response to borrower needs or policy changes while preserving financial integrity and clear customer-facing outcomes. A re-age event must always be anchored by validated rules (such as the prohibition on re-aging before the last repayment) and should be reviewed for consistency with pre- and post-re-age balances, interest accrual, and fee treatments.