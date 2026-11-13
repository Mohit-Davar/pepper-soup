# Fixed-Length Loans

## Fixed length feature

Fixed length sets the loan tenure in days. You can enter it at loan product level, where it is inherited by each loan account, or change it when you create an individual loan account. A separate optional field sets the maximum loan length in days at product level.

## Fixed length fields

The fixed length field always uses the same frequency as the repay every field, which inherits its value from the loan's regular frequency.

## Eligibility

You can use fixed length configuration only on zero interest bearing loan accounts and only with the advance payment allocation strategy.

## Creating a fixed length loan

The system validates that a fixed length loan can derive the number of repayments you enter and does not approve the configuration when it cannot.

## Repayment schedule

Every installment honors the repayment frequency, and the fixed length tenure is adjusted to the last installment only. The other installments can vary in length, so the last installment might be much shorter than the rest. When the maximum length field is provided, repayment schedule generation adjusts the last installment to fit the configured maximum length.

## Maximum loan length

The maximum loan length limits how long the initial repayment schedule can run. Activities after maturity can extend beyond this period.

Maximum loan length applies only when the loan term uses the same unit:

- Days apply to loans with terms in days.
- Weeks apply to loans with terms in weeks.
- Months apply to loans with terms in months.

> **Note:** For loans subject to French regulatory requirements, the loan cannot exceed 89 days, and the maximum loan length defines the last installment, which is shorter than the first two installments.

## Reschedule and payment changes

Rescheduling a fixed-length loan can change the repayment date, add a midterm grace period, or adjust the interest rate without changing the length of the last installment. Extending the repayment period can change the fixed length set by the loan configuration. A payment holiday, skipped payment, or reschedule keeps the last installment the same length in days as before and honors the fixed length defined for the loan.

You can extend the schedule by changing the repayment schedule.

- You can extend the schedule by changing the repayment schedule.

## Post maturity and additional installments

Post maturity and additional installments work as designed and are not affected by fixed-length loans.

The following situations are excluded and require no changes:

- N+1 situations.
- Reschedule situations.

## Worked examples

A loan officer creates a zero-interest loan with a principal of 600 and three installments of 200 each. The repayment frequency is every 15 days, and the fixed length is set to 40 days. The figures in this example are illustrative. Without fixed length, the three installments would each cover 15 days. With fixed length at 40 days, the first two installments keep the 15-day frequency and the final installment covers the remaining 10 days. If the fixed length is set to 50 days instead, the first two installments stay at 15 days and the last installment becomes 20 days.

| Installment | Due date | Length (days) | Principal paid | Balance remaining |
| --- | --- | --- | --- | --- |
| 1 | Jan 16 | 15 | 200.00 | 400.00 |
| 2 | Jan 31 | 15 | 200.00 | 200.00 |
| 3 | Feb 10 | 10 | 200.00 | 0.00 |
| Total |  | 40 | 600.00 |  |

A loan officer creates a zero-interest loan with a principal of 1,200 and six installments of 200 each. The repayment frequency is every 1 month. The system works out the shortest fixed length that can hold six installments as (6 minus 1) times 1 month plus 1 month, which equals 6 months. A fixed length of 5 months is therefore rejected. A fixed length of 7 months is accepted: the first five installments run one month apart and the final installment covers the remaining 2 months.

| Installment | Due date | Length (months) | Principal paid | Balance remaining |
| --- | --- | --- | --- | --- |
| 1 | Feb 1 | 1 | 200.00 | 1,000.00 |
| 2 | Mar 1 | 1 | 200.00 | 800.00 |
| 3 | Apr 1 | 1 | 200.00 | 600.00 |
| 4 | May 1 | 1 | 200.00 | 400.00 |
| 5 | Jun 1 | 1 | 200.00 | 200.00 |
| 6 | Aug 1 | 2 | 200.00 | 0.00 |
| Total |  | 7 | 1,200.00 |  |

On the same 600 loan with fixed length of 40 days, the original installments fall on January 16, January 31, and February 10, with lengths of 15, 15, and 10 days. If an officer reschedules the second installment from January 31 to February 5, the third installment moves to February 15. The length of the last installment stays at 10 days, so the fixed length tenure is still honored.

| Installment | Due date | Length (days) | Principal paid | Balance remaining |
| --- | --- | --- | --- | --- |
| 1 | Jan 16 | 15 | 200.00 | 400.00 |
| 2 | Feb 5 | 20 | 200.00 | 200.00 |
| 3 | Feb 15 | 10 | 200.00 | 0.00 |
