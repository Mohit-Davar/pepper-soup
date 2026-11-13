# Backdated Rate Changes

## Backdated interest modification

You can modify a loan's interest rate from any date starting on the first disbursement date. The change takes effect from the applied date itself, including on installments that have already been paid. Backdated interest modification is supported for progressive loans only.

## Schedule recalculation and EMI

The system recalculates the repayment schedule with a new EMI and interest from the interest applied schedule date.

Backdated paid installments and unpaid or partially paid installment EMIs change as follows:

- Paid installments are changed to the new calculated EMI.

## Reverse replay and accrual

Reverse replay recalculates interest on installments already paid using the new interest rate from the date the rate change was applied. The system reverses and replays transactions whenever their allocations change. Accrual adjustments happen during reverse replay as part of the close of business (COB) process, the nightly job that posts interest and fees. When a repayment pays off a penalty five or more days later, the system creates the backdated accrual together with that repayment.

## Charged-off loans

You can backdate interest modification on a loan that is charged off. This applies whether the charge-off configuration is set to regular, accelerate maturity to charge-off date, or zero interest after charge-off.

If a repayment made before charge-off is reversed and replayed because of backdated interest modification:

- The accounting entry of the reversed transaction follows standard accounting rules.
- The accounting entry of the replayed transaction follows standard accounting rules.

## Closed loans

You can change backdated interest on a closed loan. The system replays the loan chronologically and allocates the schedule and transactions accordingly.

## Overpaid and CBR loans

You can apply a backdated interest modification to an overpaid loan once CBR is complete. Any action that triggers recalculation on a CBR loan treats CBR as a credit transaction during reverse replay.

## Asset owner changes

A backdated interest modification can apply to a loan account even after its asset owner changes. If a repayment made before the asset owner change is reversed and replayed because of the modification, the accounting entries for both the reversed transaction and the replayed transaction carry the tag of the current asset owner.

## Progressive loans and zero interest

You can change a progressive loan's interest rate from zero to a positive rate, or from a positive rate to zero. Every progressive loan uses the EmiCalculator and model to calculate its repayment schedule, even when the interest rate is zero.

## Business events

Backdated interest modification fires business events when it changes a loan balance or loan status. A status change can move a loan between ACTIVE, CLOSED and OVERPAID.

The system fires the following business events:

- The loan balance changed business event fires for backdated interest modification.
- The loan status changed business event fires if backdated interest modification changes the loan status.

## Worked examples

A progressive loan is disbursed on 1/1/2024 for a principal of 1,000.00 at an annual interest rate of 12%, repayable in 3 monthly installments on the first day of each month, using 30-day months and a 360-day year. On 1/15/2024 the interest rate is changed to 6% per annum, effective from that date, before any installment has been paid. The figures are illustrative.

| Due date | Opening balance | EMI | Interest | Principal | Closing balance |
| --- | --- | --- | --- | --- | --- |
| 2/1/2024 | 1,000.00 | 336.67 | 5.00 | 331.67 | 668.33 |
| 3/1/2024 | 668.33 | 336.67 | 3.34 | 333.33 | 335.00 |
| 4/1/2024 | 335.00 | 336.68 | 1.68 | 335.00 | 0.00 |
| Totals |  | 1,010.02 | 10.02 | 1,000.00 |  |

The original EMI at 12% would have been 340.02; the new EMI at 6% is 336.67, and the number of installments stays at three.

A progressive loan is disbursed on 1/1/2024 for a principal of 1,000.00 at an annual interest rate of 12%, repayable in 3 monthly installments on the first day of each month, using 30-day months and a 360-day year. Unlike the case where the rate changes before any payment, the first installment is paid on 2/1/2024 at the old rate. On the same day the interest rate is changed to 6% per annum, effective from 2/1/2024, so the paid installment is reverse replayed at the new rate and the remaining schedule is recalculated. The figures are illustrative.

| Due date | Opening balance | EMI | Interest | Principal | Closing balance |
| --- | --- | --- | --- | --- | --- |
| 2/1/2024 | 1,000.00 | 336.67 | 5.00 | 331.67 | 668.33 |
| 3/1/2024 | 668.33 | 336.67 | 3.34 | 333.33 | 335.00 |
| 4/1/2024 | 335.00 | 336.68 | 1.68 | 335.00 | 0.00 |
| Totals |  | 1,010.02 | 10.02 | 1,000.00 |  |

Because the installment count is unchanged, the new EMI applies to all three installments; only the interest and principal split changes.
