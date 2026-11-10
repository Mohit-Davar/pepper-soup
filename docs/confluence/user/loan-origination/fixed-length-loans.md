# Fixed-Length Loans

## Fixed-Length Loans

Fixed-length loans let you set a fixed tenure for a loan account. The feature applies only to zero-interest bearing loan accounts that use the advance payment allocation strategy. Fixed length and fixed length frequency appear under the term section of the loan product configuration, and values stored at the product level are inherited by the loan account. You can also change the fixed length value at the loan account creation level.

The following rules govern fixed-length loans:

- Fixed length frequency always matches the frequency set at the product level or the loan account level.
- Frequency stays the same for loan term, repay every, and fixed length.
- All installments honor the repayment frequency, and fixed length tenure days adjust to the last installment only.
- Already paid installments remain intact when you extend the repayment schedule.
- Unpaid installments before the reschedule from installment date remain intact.
- Extending the repayment period can change the fixed length as configured for the loan.
- Changing the repayment date, introducing a midterm grace period, or adjusting the interest rate for the remainder of the loan does not affect the duration of the last installment adjusted due to fixed length configuration.
- Payment holiday, skip payment, or reschedule keeps the length in days of the last installment the same as before and honors the fixed length defined.
- Post maturity scenarios, N+1, chargeback, and CBR functionalities work as designed and are not affected by fixed length configuration.
- Extending the schedule by changing the repayment schedule is fine.

Validation and configuration behaviour:

- The system does not approve a fixed length configuration when it cannot derive the number of repayments entered.
- Fixed length is a user-entered field at both loan product and loan account level.
- The repay every frequency field value appears next to the fixed length field in the UI because the frequency field is not introduced and inherits from the loan regular frequency.

A loan officer creates a zero-interest fixed-length loan with a principal of 900.00, three repayments every 15 days, and a fixed length of 40 days. The figures are illustrative. The normal term would be 45 days, so the system keeps the first two installments at 15 days each and shortens only the last installment to 10 days so the schedule ends on day 40. If the fixed length were 50 days instead, the last installment would run 20 days rather than 10.

| Event | Day | Days | Principal paid | Balance |
| --- | --- | --- | --- | --- |
| Disbursement | 0 | — | 900.00 | 900.00 |
| Installment 1 | 15 | 15 | 300.00 | 600.00 |
| Installment 2 | 30 | 15 | 300.00 | 300.00 |
| Installment 3 | 40 | 10 | 300.00 | 0.00 |
| Total | — | 40 | 900.00 | — |

A product administrator enters a fixed length of five months for a zero-interest loan that requires six monthly repayments with one month between repayments. The system does not approve the setup because the fixed length cannot derive six repayments: five monthly intervals already require six months, leaving no days for the final installment. This shows the validation that blocks a fixed length too short to produce the requested number of repayments.

| Setting | Value |
| --- | --- |
| Number of repayments | 6 |
| Repay every | 1 month |
| Minimum fixed length | 6 months |
| Entered fixed length | 5 months |
| System decision | Not approved |

A loan officer reschedules a zero-interest loan with three repayments every 15 days and a fixed length of 40 days. The second installment is moved from day 30 to day 35, and the third installment moves to day 45. The system keeps the last installment at 10 days, so the fixed-length adjustment on the final installment is unchanged even though the middle gap widens. A normal reschedule shifts dates but leaves the last installment’s day count untouched; only an extend-term reschedule may alter the fixed length itself.

| Event | Day | Days | Principal paid | Balance |
| --- | --- | --- | --- | --- |
| Disbursement | 0 | — | 900.00 | 900.00 |
| Installment 1 | 15 | 15 | 300.00 | 600.00 |
| Installment 2 (rescheduled) | 35 | 20 | 300.00 | 300.00 |
| Installment 3 | 45 | 10 | 300.00 | 0.00 |
| Total | — | 45 | 900.00 | — |
