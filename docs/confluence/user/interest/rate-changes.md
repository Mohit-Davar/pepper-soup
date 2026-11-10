# Rate Changes

## Interest Rate Changes

### Eligibility and timing

You can change the interest rate on an active loan account at any point during the loan life cycle. The new rate takes effect on a future date you choose, starting from the business date plus one day.

The following rules apply to interest rate changes:

- You can select any future date as the starting date of the new interest rate.
- You can change the rate from day 1, day 15, or even the very last day of the loan.
- You cannot apply more than one interest rate change for the same start date.
- Progressive loans are supported only for interest rate change on active loan accounts.

### Scope of rate changes

An interest rate change applies from the date you apply it. Installments before that date keep the old interest rate, while installments from that date use the new rate. Paid installments and their interest amounts stay unchanged.

### Recalculation behavior

When you change an interest rate, the system recalculates the EMI from the reschedule date using the new rate. Only future, unpaid installments are included; any period already fully paid is excluded from changes and recalculation.

The recalculation follows these rules:

- The repayment schedule is recalculated with the new interest rate based on the recalculation strategy and configuration.
- The EMI is reduced or increased based on the selected interest rate.
- The actual period and all future periods are recalculated except when they were already fully paid.
- The calculated EMI and the last installment EMI difference are kept minimal.

### Progressive loans

For a Progressive loan, you can change the interest rate from a particular date, even when the date belongs to an installment that was already fully paid. If the first installment period falls between 1 January and 1 February and was fully paid, you may still change the rate on any date between 1 January and 1 February, including 11 January or later.

The following rules apply to the new interest rate:

- There is no restriction on the provided interest rate value.
- The new interest value inherits the interest frequency from the loan product.

### Repayment and reversal handling

You can view the interest rates for a loan account through the list of interest rate periods or changes on the loan tab. Repayments and reversals dated before an interest rate change remain possible after the modification takes effect. Installments already paid, including their EMI and interest amounts, do not change when the interest rate changes. Interest refunds calculate the first installments using the old interest rate and the next installment using the new interest rate.

The following limits apply to interest rate changes:

- Only one operation is supported at a time; a due date change counts as another reschedule operation.
- Created new interest rates cannot be modified.
- An interest rate change affects only the EMI; installments remain the same.
- When a loan is overdue by 1 installment, the EMI value is 17.01.
- When a loan is overdue by 2 installments, the EMI value is 17.01.

### Worked examples

A loan officer changes the interest rate on an active loan after the first installment has been paid. The figures are illustrative: principal 1,000, annual interest 12%, three monthly installments, 30-day months. The first installment is paid under the old rate. On the first day of the second month, the rate is changed to 6% annual for the remaining balance. The paid installment keeps its original EMI and interest; only the two unpaid installments are recalculated at the new rate. For progressive loans, the result is the same even if the change date falls inside an already paid installment period: the paid installment stays unchanged and only future installments move to the new rate. This shows that earlier paid installments keep the old rate and EMI, while future installments are recalculated at the new rate.

| Installment | Balance start | Rate | Interest | Principal | EMI | Balance end |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1,000.00 | 12% | 10.00 | 330.03 | 340.03 | 669.97 |
| 2 | 669.97 | 6% | 3.35 | 334.15 | 337.50 | 335.82 |
| 3 | 335.82 | 6% | 1.68 | 335.82 | 337.50 | 0.00 |
| Total |  |  | 15.03 | 1,000.00 | 1,015.03 | 0.00 |

A loan officer records an early payment and then changes the interest rate on the same active loan. The figures are illustrative: principal 1,000, annual interest 12%, three monthly installments, 30-day months. The customer pays the first installment early on day 15 of the first month at the old rate. On day 20 of the first month, the rate is changed to 6% annual. The early payment keeps the old interest and EMI; the two remaining unpaid installments are recalculated at the new rate. This shows that amounts already paid, including early payments, are not changed by a later rate modification.

| Event | Balance start | Rate | Interest | Principal | Payment | Balance end |
| --- | --- | --- | --- | --- | --- | --- |
| Early payment, day 15 | 1,000.00 | 12% | 10.00 | 330.03 | 340.03 | 669.97 |
| Installment 2 | 669.97 | 6% | 3.35 | 334.15 | 337.50 | 335.82 |
| Installment 3 | 335.82 | 6% | 1.68 | 335.82 | 337.50 | 0.00 |
| Total |  |  | 15.03 | 1,000.00 | 1,015.03 | 0.00 |

A product administrator changes the interest rate on the final day of an active loan. The figures are illustrative: principal 1,000, annual interest 12%, three monthly installments, 30-day months. The first two installments remain under the old rate. On the last day of the third month, before the final installment is paid, the rate is changed to 6% annual. Because the final installment is still unpaid, it is recalculated at the new rate; earlier installments are untouched. This shows that a rate change can take effect on the very last day and applies only to the installment that remains unpaid.

| Installment | Balance start | Rate | Interest | Principal | EMI | Balance end |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1,000.00 | 12% | 10.00 | 330.03 | 340.03 | 669.97 |
| 2 | 669.97 | 12% | 6.70 | 333.33 | 340.03 | 336.64 |
| 3 | 336.64 | 6% | 1.68 | 336.64 | 338.32 | 0.00 |
| Total |  |  | 18.38 | 1,000.00 | 1,018.38 | 0.00 |

See also: [Backdated Loans: Backdated Loans](confluence-link:Backdated%20Loans#backdated-loans), [Interest Calculation: EMI Calculation](confluence-link:Interest%20Calculation#emi-calculation).

## Backdated Rate Changes

### Eligible loans and scope

Backdated rate changes apply to progressive loans only, including changing the interest rate from zero or to zero.

### Backdated interest modification basics

You can modify an interest rate from any date starting on the first disbursement date, and the change takes effect from the date you apply it.

### Schedule and EMI recalculation

When a backdated rate change is applied, the system recalculates the repayment schedule from the date the interest rate changed. The number of installments stays the same, while the EMI and interest amounts are updated. The recalculation uses the new EMI and interest from the interest applied schedule date.

### Installment handling

A backdated rate change can apply to installments that have already been paid, as well as to unpaid or partially paid installments. The system recalculates the EMI for those installments according to the new calculated EMI, while respecting the installment multiple used during EMI amount calculation.

### Transaction reversal and replay

The system reverses and replays transactions when allocations change, applying the new interest rate from the applied date to installments already paid. Accrual adjustments occur during reverse replay as part of the COB process.

### Charged-off loans

You can apply a backdated interest modification to a loan that has been charged off. The behaviour remains the same whether the charge-off configuration is set to regular or to zero interest after charge-off.

When a repayment made before charge-off is reversed and replayed because of the backdated interest modification, the accounting entries follow standard accounting rules rather than charge-off accounting rules.

- When a repayment made before charge-off is reversed and replayed because of the backdated interest modification, the accounting entries follow standard accounting rules rather than charge-off accounting rules.

### Closed and overpaid loans

You can apply a backdated interest modification to a closed loan or an overpaid loan where the credit balance recovery (CBR) is complete. The system performs a chronological reverse-replay and allocates the schedule and transactions accordingly.

The following rules apply to closed and overpaid loans:

- Any action that triggers recalculation on a CBR loan treats CBR as a credit transaction during reverse-replay.
- The same logic applies when backdated interest modification is allowed on CBR loan accounts.
- If a repayment made before an asset owner change is reversed and replayed due to backdated interest modification, both the reversed transaction and the replayed transaction carry the tag of the current asset owner.
- Backdated interest modification is allowed on loan accounts where the asset owner has changed.

### Zero interest rate changes

You can change a loan interest rate from zero to a non-zero rate, or from a non-zero rate to zero. The system recalculates the repayment schedule using the EMI calculator and model, and the change may move the loan between ACTIVE, CLOSED and OVERPAID status.

> **Note:** Documentation must refer to any configuration that affects backdated interest modification.

### Worked examples

A loan officer backdates an interest-rate change on an active progressive loan. The figures are illustrative. The loan disburses 1,000 at 12 percent per year and repays in three monthly installments over 30-day months. The first installment of 340.03 is paid on 2/1 at the old rate, leaving a balance of 669.97. On 2/15 the officer changes the rate to 8 percent per year, effective from 2/1. Because the change is backdated, the paid installment is reversed and replayed at the new rate, and the remaining installments are recalculated. The number of installments stays at three, and only the EMI and interest amounts change. The same calculation applies when the loan is charged off, whether charge-off accounting is regular or zero-interest-after-charge-off; accounting entries follow standard rules rather than charge-off rules.

| Date | Installment | Rate | EMI | Interest | Principal | Balance |
| --- | --- | --- | --- | --- | --- | --- |
| 2/1/24 | 1 | 8% | 337.79 | 6.67 | 331.12 | 668.88 |
| 3/1/24 | 2 | 8% | 337.79 | 4.46 | 333.33 | 335.55 |
| 4/1/24 | 3 | 8% | 337.79 | 2.24 | 335.55 | 0.00 |
| Total |  |  | 1013.37 | 13.37 | 1000.00 |  |

A borrower makes an early repayment on a progressive loan, and the officer backdates an interest-rate change. The figures are illustrative. The loan disburses 1,000 at 12 percent per year over three monthly installments of 30-day months. On 1/15, before the first installment is due, the borrower pays 340.03 toward principal, reducing the balance to 659.97. On 1/20 the officer changes the rate to 8 percent per year, effective from 1/20. The system recalculates the remaining two installments at the new rate while keeping the installment count at three. When the iterate flag is on, the system applies a small rounding adjustment; when it is off, the schedule is used as calculated.

| Date | Event | Rate | EMI | Interest | Principal | Balance |
| --- | --- | --- | --- | --- | --- | --- |
| 1/15/24 | Early payment | 12% | 340.03 | 0.00 | 340.03 | 659.97 |
| 2/1/24 | Installment 2 | 8% | 333.29 | 4.40 | 328.89 | 331.08 |
| 3/1/24 | Installment 3 | 8% | 333.29 | 2.21 | 331.08 | 0.00 |
| Total |  |  | 1006.61 | 6.61 | 1000.00 |  |

An officer changes the interest rate on a closed progressive loan. The figures are illustrative. The loan disbursed 1,000 at 12 percent per year and was repaid in three monthly installments over 30-day months, after which the loan closed. On 4/15 the officer changes the rate to 8 percent per year, effective from 2/1. The system performs a chronological reverse replay: it reverses the paid installments in order and replays them at the new rate. The number of installments stays at three and the final balance remains zero; only the interest and principal portions are restated. On closed or overpaid loans, any overpaid amount is treated as a credit during reverse replay.

| Date | Installment | Rate | EMI | Interest | Principal | Balance |
| --- | --- | --- | --- | --- | --- | --- |
| 2/1/24 | 1 | 12% | 340.03 | 10.00 | 330.03 | 669.97 |
| 3/1/24 | 2 | 12% | 340.03 | 6.70 | 333.33 | 336.64 |
| 4/1/24 | 3 | 12% | 340.01 | 3.37 | 336.64 | 0.00 |
| 2/1/24 | 1 | 8% | 337.79 | 6.67 | 331.12 | 668.88 |
| 3/1/24 | 2 | 8% | 337.79 | 4.46 | 333.33 | 335.55 |
| 4/1/24 | 3 | 8% | 337.79 | 2.24 | 335.55 | 0.00 |
