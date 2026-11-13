# Interest Rate Changes

## Interest rate change overview

You can change the interest rate of an active loan account during the loan life cycle. Progressive loans are supported. The change applies to future dates only, starting the day after the current date.

## Eligibility and timing

You can choose any future date from day 1 through the last day of the loan period.

For Progressive loans, the usual restriction on changing the interest rate for an installment that was already fully paid does not apply when interest recalculation is used.

- If the first installment period runs from 1 January to 1 February and was fully paid, you can still change the rate on any date between 1 January and 1 February, including 11 January or later.

> **Note:** Only one reschedule operation can run at a time. A due date change counts as another reschedule operation.

## How to change the interest rate

You change the interest rate for the rest of the loan lifecycle through reschedule functionality. The rate change recalculates from the rescheduleFromDate. Use the API endpoint /rescheduleloans?command=reschedule for interest rate modification. Reschedule request fields include rescheduleFromDate, rescheduleReasonId, submittedOnDate, newInterestRate, dateFormat, locale, and loanId.

## Schedule and EMI recalculation

An interest rate change recalculates the EMI for future unpaid installments only. Installments already paid keep the old interest rate and are excluded from recalculation. Installments from the changed date onward use the new interest rate. The number of installments stays the same; only the EMI changes.

Based on the recalculation strategy and configuration, the system recalculates the future repayment schedule with the new interest rate and instantly recalculates outstanding balances. A user can select an installment and set the interest rate to change from that installment right away.

When an interest rate change happens in the middle of a period, the system calculates the proper interest amount as it does for a disbursement, then changes the EMI based on the difference between the last installment and the calculated EMI.

## Interest rate periods and history

Interest rate periods record each change to a loan's payment rate. You can set an effective date for a rate change, and the date cannot be later than the loan's current expected maturity date. Multiple rate changes are allowed, including more than one rate on the same day so a mistaken entry can be undone easily. Once created, a new interest rate cannot be modified. Each rate change inherits its interest frequency from the loan product, and the system saves the history of the effective interest rate and other calculated values for every percentage payment rate change.

Payments, including backdated payments, use the rate in effect for their date based on interest rate segments. The system keeps the current reversed logic for previous entries only when they fall on the same date.

Use this field to view interest rate periods and changes.

| Field | Purpose |
| --- | --- |
| LoanAccountData.interestRatesPeriods | View interest rate periods and changes |

## Repayments and reversals after modification

You can make backdated repayments or reversals after an interest rate modification. These actions trigger reverse replays of previous installments that calculated interest under the previous interest rate.

## Events and API response fields

When the interest rate changes, the loan details response and business events include fields that show the EMI and loan term variations. The new business event for "Change interest rate from an installment" contains the loan account details.

The following fields appear in the loan details response:

- emiAmountVariations shows the EMI changes.
- loanTermVariations contains all loan term variations with no filtering by type.

The following field appears in the Loan Account Data V1 business event:

- loanTermVariations is returned as part of the event.

## Day-count and rate value rules

The system places no restriction on the interest rate value you provide.

Day-count settings used for interest calculation:

| Setting | Value |
| --- | --- |
| Days in year | 360 |
| Days in month | 30 |

## Interest refund and accrual

When you change an interest rate, the system calculates the first installments on the old interest rate and the next installment on the new interest rate. The change takes effect from the applied date and does not affect interest or accrual for earlier dates.

You cannot apply more than one interest rate change with the same start date.

- You cannot apply more than one interest rate change with the same start date.

## Worked examples

Situation: an active progressive loan of 1,000.00 is disbursed at a 12% annual interest rate and repaid in 3 monthly installments using 30-day months and a 360-day year. The first installment is paid in full at the old rate. On the next business date plus one day, the interest rate is changed to 6% for the remaining installments. The figures are illustrative. The installment that was already paid keeps the 12% rate; only the unpaid installments are recalculated at 6%, and the number of installments stays the same.

| Installment | Opening balance | Rate % | Interest | EMI | Principal paid | Closing balance |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1000.00 | 12 | 10.00 | 340.02 | 330.02 | 669.98 |
| 2 | 669.98 | 6 | 3.35 | 337.50 | 334.15 | 335.83 |
| 3 | 335.83 | 6 | 1.68 | 337.51 | 335.83 | 0.00 |
| Total |  |  | 15.03 | 1015.03 | 1000.00 |  |

Situation: an active loan of 1,000.00 at 12% annual interest is repaid monthly over 30-day months and a 360-day year. The interest rate is changed on day 15 of the first period, a future date relative to the business date, from 12% to 6%. Interest for days 1 to 15 is calculated at 12% and interest for days 16 to 30 at 6%, as when a disbursement occurs mid-period. The EMI is then recalculated from the change date for the remaining installments, and the installment count stays the same. If the first installment had already been fully paid before the change, it would keep the old rate entirely and be excluded from the recalculation.

| Installment | Opening balance | Rate % | Interest | EMI | Principal paid | Closing balance |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1000.00 | 12/6 | 7.50 | 340.02 | 332.52 | 667.48 |
| 2 | 667.48 | 6 | 3.34 | 336.24 | 332.90 | 334.58 |
| 3 | 334.58 | 6 | 1.67 | 336.25 | 334.58 | 0.00 |
| Total |  |  | 12.51 | 1012.51 | 1000.00 |  |

See also: [Backdated Loans](confluence-link:Backdated%20Loans), [Schedule Recalculation for Overdue Loans](confluence-link:Schedule%20Recalculation%20for%20Overdue%20Loans), [Early and Late Repayment Interest](confluence-link:Early%20and%20Late%20Repayment%20Interest).
