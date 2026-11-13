# Fixed-Length Loans

## Fixed length feature overview

Fixed length sets the loan tenure for a loan product and carries it to each loan account created from that product. You can change the fixed length value when you create a loan account. Fixed length frequency defines how often the fixed length applies. Both fields appear under the term section of the loan product configuration.

## Eligibility and product requirements

You can use fixed-length loans only on zero-interest loan accounts, and only with the advance payment allocation strategy.

## Configuration fields and inheritance

The fixed length frequency always matches the frequency set on the loan product or the loan account. The repay every frequency appears next to the fixed length field in the UI because the frequency field is not introduced and inherits from the loan regular frequency.

Configuration field

| Field | Description | Required |
| --- | --- | --- |
| Maximum loan length | Maximum length of the loan in days | Optional |

## Schedule generation and installment behavior

Repayment schedule generation honors the repayment frequency and the fixed loan length. All installments keep the fixed length, and tenure is adjusted to the last installment only.

When the maximum length field is provided:

- Repayment schedule generation adjusts the last installment to fit the configured maximum length.
- The rest of the installments can vary in length, so the last installment might be much shorter than the rest.

## Validation rules

The system validates that a fixed-length loan configuration can derive the number of repayments entered. If it cannot, the system does not approve the configuration.

The lowest fixed term length is calculated as:

- (number of repayments - 1 * repay every) + 1

## Maximum loan length

The maximum loan length limits how long the initial repayment schedule can run. Activities after maturity that extend beyond this period are permitted.

| Unit | Applies to loans with terms in |
| --- | --- |
| Days | Days |
| Weeks | Weeks |
| Months | Months |

> **Note:** For loans subject to French regulatory requirements, the loan cannot exceed 89 days, and the maximum loan length defines the shorter final installment.

## Reschedule and post-maturity behavior

Rescheduling can change the repayment date, add a midterm grace period, or adjust the interest rate for the remainder of the loan without changing the duration of the last installment adjusted under the fixed-length configuration. Extending the repayment period can change the fixed length as defined by the loan configuration. A payment holiday, skipped payment, or reschedule keeps the length in days of the last installment the same as before and honors the fixed length defined. Extending the schedule by changing the repayment schedule is allowed.

After maturity, N+1 is allowed and is not affected by this feature.

## Worked examples

A zero-interest loan product that uses the advance payment allocation strategy is created with a principal of 900.00, three installments, a repayment frequency of every 15 days, and a fixed length of 40 days. The figures are illustrative. The fixed length is the maximum loan length; the first two installments follow the 15-day frequency, and the last installment is shortened so the schedule fits within 40 days. If the fixed length is 50 days instead, the last installment becomes 20 days.

| Installment | Due date | Interval (days) | Principal due | Balance after |
| --- | --- | --- | --- | --- |
| 1 | Jan 16 | 15 | 300.00 | 600.00 |
| 2 | Jan 31 | 15 | 300.00 | 300.00 |
| 3 | Feb 10 | 10 | 300.00 | 0.00 |
| Total |  | 40 | 900.00 |  |

The system validates the fixed length before approving the loan. The lowest fixed term length is (number of repayments - 1) × repay every + 1. With six monthly repayments and repay every one month, the minimum fixed length is six months. A configured fixed length of five months cannot derive six repayments, so the system rejects the configuration. The same rule accepts a fixed length of 31 days for three repayments every 15 days.

| Scenario | Repayments | Repay every | Minimum fixed length | Configured fixed length | Outcome |
| --- | --- | --- | --- | --- | --- |
| Three repayments every 15 days | 3 | 15 days | 31 days | 31 days | Approved |
| Six repayments every 1 month | 6 | 1 month | 6 months | 5 months | Rejected |

Rescheduling a middle installment changes its due date but does not change the length of the last installment. Using the loan from the first example, the second installment is moved from January 31 to February 5. The third installment then falls on February 15, so the final interval remains 10 days and the fixed length is still honored for the last installment.

| Installment | Due date | Interval (days) | Principal due | Balance after |
| --- | --- | --- | --- | --- |
| 1 | Jan 16 | 15 | 300.00 | 600.00 |
| 2 | Feb 5 | 20 | 300.00 | 300.00 |
| 3 | Feb 15 | 10 | 300.00 | 0.00 |
| Total |  | 45 | 900.00 |  |
