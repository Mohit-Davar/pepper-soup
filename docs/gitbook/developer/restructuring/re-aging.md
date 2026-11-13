# Re-aging

## Re-aging overview

Re-aging, also known as Settlement Plan, creates a new set of installments for the same loan account from the principal outstanding pending on the loan account. It assists customers who are in duress around repaying their loans.

Excess payments are handled as follows:

- Any excess payment is allocated to a special installment created as of the re-age start date.
- Excess payment handling applies to both non-interest bearing and interest bearing loan accounts.

## Eligibility and timing

Re-aging applies only to loans using the progressive repayment schedule handling. You can configure re-aging before the maturity date, and you can apply it on any date of the loan life cycle after the first disbursement date. Re-aging can also be applied to a charge-off loan account. For a loan that is overdue and past its maturity date, re-aging can start on any date after the existing maturity date or N+1 date.

Timing rules depend on whether the loan bears interest:

- For interest-bearing progressive loans with default interest handling, the re-aging date must not be before the last repayment date.
- For non-interest bearing loans, the re-aging date can be before the last repayment date.

## Interest handling options

Interest handling options on the Re-age screen decide how overdue interest, fees, penalties and charge-back amounts move to new installments. The options are Default Behavior, Waive Interest, Equal Amortization, Outstanding payable Interest, and Outstanding FULL Interest. Equal Amortization applies to both interest-bearing and non-interest-bearing products with no special treatment.

| Interest handling option | Overdue interest | Overdue fees | Charge-back principal | Charge-back interest | Charge-back fees | Fees/penalties due after re-age |
| --- | --- | --- | --- | --- | --- | --- |
| Default Behavior | Moves to the 1st new re-age installment | Remains as is on the existing installment | Re-aged | Moves to the 1st new re-age installment | Remains as is on the existing installment | Remain as is and are adjusted to the relevant installment |
| Waive Interest | Waived off | Remain as is on existing installments | Re-aged | Waived | Remain as is on the existing installment | Remain as is and are adjusted to the relevant installment |
| Equal Amortization | Equally split among new installments | Equally split among new installments | Split equally among new installments | Split equally among new installments | Remain as is on the existing installment | Equally split among new installments |

## Default behavior interest handling

With Default Behavior interest handling, overdue interest and charge-back interest move to the first new re-age installment, while charge-back principal is re-aged. Overdue fees and charge-back fees stay on the existing installment. Fees and penalties due after the re-age date stay as is and adjust to the relevant installment.

## Waive interest handling

With Waive Interest handling, overdue interest and outstanding payable interest are waived off. Charge-back principal is re-aged, while charge-back interest is waived. Charges, fees and penalties stay as they are on existing installments, and fees or penalties with a due date after re-age stay as they are and move to the relevant installment.

## Schedule and maturity changes

Re-aging changes the repayment schedule and updates the maturity date to match the new schedule.

Installments after re-aging:

- Normal installments after the new maturity date are deleted when re-aging shortens the schedule.
- N+1 installments remain unless they overlap with re-aged installments.

When re-aging occurs before the maturity date:

- The first four installment periods remain as-is.
- The fifth and sixth periods are converted into re-aged installments with the re-age flag applied and due dates recalculated.
- Four more installments are created based on the re-age payment plan.

## Charges and fees

Charges or fees due before the re-age date are split equally among the new installments.

## Payments and outstanding balances

Re-aging applies to the full principal outstanding balance as of the current date only. Down-payment amounts and charge-back amounts are not impacted by re-aging. Partial paid amounts on installments before re-aging remain as is, and only the unpaid amount is re-aged.

The schedule shows unpaid principal as zero for re-aged unpaid installments:

- Regular installments.
- Down-payment installments.

After re-aging:

- Future repayments first collect the old pending interest or fees.

## Reversing and replaying re-aging

You can reverse a re-aging transaction until it is the latest transaction on the loan. Reversing it replays and re-applies the schedule accordingly. Backdated repayments, reversals of backdated repayments, backdated disbursements, backdated charge additions, chargebacks, and undo of old repayments also reverse and replay re-aging according to the new outstanding amount. The N+1 installment amount is adjusted as part of reverse replay.

> **Note:** A reversed re-age transaction is not found during validation for an existing re-age transaction.

## Interest rate and recalculation

The interest rate stays the same during re-aging. For interest bearing loans, interest is recalculated based on the new schedule and loan configuration.

Interest recalculation behavior:

- When interest recalculation is true, the model is updated and used.
- When interest recalculation is false, only repayment installments are used.

## Permissions and preview

A user with Re-age permission can preview a re-age schedule without any additional permission. Users can generate and preview the schedule at both UI and API level by selecting parameters.

## Zero amount re-age

A re-age transaction with amount 0 is not allowed when there are no outstanding balances to be re-aged.

If you trigger a 0 amount re-age in real time, the system raises an HTTP 403 domain rule violation exception explaining that there are no outstanding balances to be re-aged.

- If a 0 amount re-age situation occurs during reverse-replay situations, the system reverts the re-age transaction.

## Transaction details

The re-age transaction template returns the current business date, the number of future installments due after that date, the number of past installments due on or before that date, the next current installment due date, and the calculated start date, which is the current date plus one unit of the original frequency type.

The re-age transaction amount is calculated as follows:

- The sum of total principal outstanding and total payable interest.

## Delinquency

Re-aging triggers delinquency calculation on the loan account. Re-aging uses a frequency, a re-age start date, and a number of installments.

## Work configuration rules

Work configuration re-aging changes due dates and frequencies. It supports restart-period re-aging, hardship term-outs, and term or progressive re-age and re-amortization.

## Worked examples

Situation: a non-interest-bearing progressive loan is re-aged into a new set of installments. Setup (illustrative figures): principal 1,000.00, annual interest rate 0%, 30-day months, monthly installments. The loan is disbursed on 10/1/24 with five monthly installments of 200.00 principal each. One installment of 200.00 is paid on 11/1/24, leaving an outstanding principal of 800.00. On 1/1/25 the loan is re-aged into four new installments. Because the loan is non-interest bearing, the outstanding principal is split equally among the new installments and no interest is added. The example shows that re-aging replaces the remaining schedule with equal principal installments drawn from the outstanding balance.

| Date | Principal due | Interest due | Total due | Principal paid | Balance after |
| --- | --- | --- | --- | --- | --- |
| 10/1/24 | — | — | — | — | 1,000.00 |
| 11/1/24 | 200.00 | 0.00 | 200.00 | 200.00 | 800.00 |
| 1/1/25 | 200.00 | 0.00 | 200.00 | 200.00 | 600.00 |
| 2/1/25 | 200.00 | 0.00 | 200.00 | 200.00 | 400.00 |
| 3/1/25 | 200.00 | 0.00 | 200.00 | 200.00 | 200.00 |
| 4/1/25 | 200.00 | 0.00 | 200.00 | 200.00 | 0.00 |
| Totals | 1,000.00 | 0.00 | 1,000.00 | 1,000.00 | — |

Situation: an interest-bearing progressive loan with default interest handling is re-aged. Setup (illustrative figures): principal 1,000.00, annual interest rate 12% (1% per 30-day month), 30-day months, monthly installments. After one installment of 210.00 (principal 200.00, interest 10.00) is paid on 11/1/24, the outstanding principal is 800.00 and 8.00 of interest has fallen overdue. On 1/1/25 the loan is re-aged into four new installments. Under default behavior, the overdue interest moves to the first new installment, the outstanding principal is split equally across the new installments, and no new interest is added after re-age. If interest handling is set to waive instead, the 8.00 overdue interest is waived and the re-aged total is 800.00 rather than 808.00. The example shows that overdue interest is collected with the first re-aged installment while the remaining principal is spread evenly over the new term.

| Date | Principal due | Interest due | Total due | Balance after |
| --- | --- | --- | --- | --- |
| 10/1/24 | — | — | — | 1,000.00 |
| 11/1/24 | 200.00 | 10.00 | 210.00 | 800.00 |
| 1/1/25 | 200.00 | 8.00 | 208.00 | 600.00 |
| 2/1/25 | 200.00 | 0.00 | 200.00 | 400.00 |
| 3/1/25 | 200.00 | 0.00 | 200.00 | 200.00 |
| 4/1/25 | 200.00 | 0.00 | 200.00 | 0.00 |
| Totals | 1,000.00 | 18.00 | 1,018.00 | — |

Situation: an interest-bearing progressive loan uses Equal Amortization of Outstanding amount interest handling when re-aged. Setup (illustrative figures): principal 1,000.00, annual interest rate 12%, 30-day months, monthly installments. After one installment of 210.00 (principal 200.00, interest 10.00) is paid on 11/1/24, the outstanding principal is 800.00, outstanding interest is 40.00, and outstanding fees are 20.00. On 1/1/25 the loan is re-aged into four new installments. Under Equal Amortization, the outstanding principal, interest, and fees are each split equally across the four installments, and no new interest is calculated after re-age. The example shows that outstanding interest and fees are divided equally across every new installment.

| Date | Principal due | Interest due | Fees due | Total due | Balance after |
| --- | --- | --- | --- | --- | --- |
| 10/1/24 | — | — | — | — | 1,000.00 |
| 11/1/24 | 200.00 | 10.00 | 0.00 | 210.00 | 800.00 |
| 1/1/25 | 200.00 | 10.00 | 5.00 | 215.00 | 600.00 |
| 2/1/25 | 200.00 | 10.00 | 5.00 | 215.00 | 400.00 |
| 3/1/25 | 200.00 | 10.00 | 5.00 | 215.00 | 200.00 |
| 4/1/25 | 200.00 | 10.00 | 5.00 | 215.00 | 0.00 |
| Totals | 1,000.00 | 50.00 | 20.00 | 1,070.00 | — |
