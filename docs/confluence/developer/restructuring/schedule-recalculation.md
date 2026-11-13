# Schedule Recalculation for Overdue Loans

## Purpose and benefits

When interest recalculation is enabled for an overdue loan, the system recalculates interest for all installments based on the number of overdue days and regenerates the repayment schedule so repayment amounts stay correct and valid for business days. For interest-bearing progressive loans, the schedule holds and shows additional interest on overdue principal, and payoff calculations continue to work.

## Eligibility and configuration

Schedule recalculation applies to interest-bearing loans with interest recalculation enabled and a daily interest calculation type. It recalculates the interest and principal portions of installments according to the configured strategy.

## Timing and execution

Interest recalculation runs at start of business day using the actual business date, after all end of business day business steps complete.

## Supported strategies

The system supports two strategies for recalculating overdue installments: daily and same as repayment period. Weekly, monthly and mixed strategies are not covered, and last installment overdues are not covered.

## Schedule behavior

The COB job does not create new installments or calculate new interest after the maturity date. A new installment is created only when a repayment happens. If a repayment arrives after maturity, the system creates an installment as of the repayment date and calculates interest for the extra days from the last maturity date on the current reducing principal balance. A repayment after maturity collects only the interest in the repayment schedule for the installment it fulfills.

## Rate factor formulas

The rate factor depends on the repayment frequency. Monthly: `1 + (rate of interest * (repaid every * days in month / days in year) * actual days in period / calculated days in period)`. Weekly: `1 + (rate of interest * (7 * repaid every / days in year) * actual days in period / calculated days in period)`. Daily: `1 + (rate of interest * (repaid every / days in year) * actual days in period / calculated days in period)`. Single-period: `1 + (rate of interest * days in period / days in year)`.

## Repayment scenarios

When a repayment is late, the system recalculates the loan repayment schedule. The recalculation runs during close of business (COB), the nightly job that posts interest and fees, and applies to one overdue installment, two or more consecutive overdue installments, a late repayment on the next installment due date, a late repayment on a day between the start and due dates, a partial late repayment on the same day where partial repayments fully repay the overdue installment, and partial late repayments on different business days during the same installment period. Partial or full repayments can happen anytime for the ]03/01, 04/01] interval.

| Scenario | Principal due | Interest due | Period outstanding |
| --- | --- | --- | --- |
| Projected interest moved to the next period | 16.75 | 0.26 (already recognised interest only) | 1 cent of principal |

## Worked examples

A customer borrows 1,000.00 at an annual interest rate of 12%, repayable in five equal monthly instalments. Months are 30 days long. The figures in this example are illustrative. This is the baseline schedule before any overdue occurs.

| Period | From | To | Days | Opening balance | Interest | Principal | EMI | Closing balance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 Jan | 1 Feb | 30 | 1,000.00 | 10.00 | 196.04 | 206.04 | 803.96 |
| 2 | 1 Feb | 1 Mar | 30 | 803.96 | 8.04 | 198.00 | 206.04 | 605.96 |
| 3 | 1 Mar | 1 Apr | 30 | 605.96 | 6.06 | 199.98 | 206.04 | 405.98 |
| 4 | 1 Apr | 1 May | 30 | 405.98 | 4.06 | 201.98 | 206.04 | 204.00 |
| 5 | 1 May | 1 Jun | 30 | 204.00 | 2.04 | 204.00 | 206.04 | 0.00 |
| Totals |  |  |  |  | 30.20 | 1,000.00 | 1,030.20 |  |

Instalment 2, due on 1 March, is not paid. Interest recalculation is enabled and the system uses the daily strategy. The overdue principal of 198.00 remains on the schedule and additional interest is charged for each overdue day. A repayment on 11 March clears the overdue amount. With the same-as-repayment-period strategy instead, the overdue principal attracts interest for the whole period at once rather than day by day. The overdue principal is held until repayment, and the extra 0.66 is the daily overdue interest on that principal.

| Period | From | To | Days | Opening balance | Overdue principal | Interest | Overdue interest | Principal paid | Closing balance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 Jan | 1 Feb | 30 | 1,000.00 | 0.00 | 10.00 | 0.00 | 196.04 | 803.96 |
| 2 | 1 Mar | 11 Mar | 10 | 803.96 | 198.00 | 2.68 | 0.66 | 0.00 | 803.96 |
| 2 | 11 Mar | 1 Apr | 20 | 803.96 | 0.00 | 4.04 | 0.00 | 198.00 | 605.96 |
| 3 | 1 Apr | 1 May | 30 | 605.96 | 0.00 | 6.06 | 0.00 | 199.98 | 405.98 |
| 4 | 1 May | 1 Jun | 30 | 405.98 | 0.00 | 4.06 | 0.00 | 201.98 | 204.00 |
| 5 | 1 Jun | 1 Jul | 30 | 204.00 | 0.00 | 2.04 | 0.00 | 204.00 | 0.00 |
| Totals |  |  |  |  |  | 28.88 | 0.66 | 1,000.00 |  |

After four instalments the outstanding balance is 204.00. Instalment 5 matures on 1 July but is not paid. A repayment arrives on 15 July, fifteen days after maturity. The system creates a new instalment as of the repayment date and charges interest for the extra days on the outstanding principal. A repayment after maturity creates a new instalment dated at repayment, and interest is charged for the extra days on the outstanding principal.

| Period | From | To | Days | Opening balance | Interest | Principal | Total due | Closing balance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 5 | 1 Jun | 1 Jul | 30 | 204.00 | 2.04 | 0.00 | 2.04 | 204.00 |
| 5 (late) | 1 Jul | 15 Jul | 15 | 204.00 | 1.02 | 204.00 | 205.02 | 0.00 |

See also: [Backdated Loans](confluence-link:Backdated%20Loans), [Early and Late Repayment Interest](confluence-link:Early%20and%20Late%20Repayment%20Interest), [Loan Payoff](confluence-link:Loan%20Payoff).
