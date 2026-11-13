# Schedule Recalculation for Overdue Loans

## Schedule recalculation for overdue loans

For loan accounts with Interest Recalculation enabled, the system recalculates and regenerates the repayment schedule when an installment is not paid on its installment date. Interest is recalculated for all installments based on the number of overdue days, so repayment amounts stay correct for late repayments.

## Interest recalculation strategies

The system supports two interest recalculation strategies for overdue installments: daily and same as repayment period.

The following strategies are not covered:

- Weekly
- Monthly
- Mixed
- Last installment overdues (overdue loan)

## Overdue interest handling

When interest recalculation is enabled, an overdue installment on an interest-bearing progressive loan carries additional interest on its overdue principal. The repayment schedule shows this interest, and payoff calculations include it. A non-interest-bearing loan has no interest to recalculate.

## Repayment timing and new installments

The system does not create a new installment during the close of business (COB) job process, and it does not add, calculate or collect interest after the maturity date. A new installment is created only when a repayment happens. If a repayment arrives after maturity, the system creates a new installment as of the repayment date and calculates interest for the extra days from the last maturity date on the current reducing principal balance. A repayment made after maturity collects only the interest shown in the repayment schedule for the installment it fulfills.

## Repayment schedule updates

The repayment schedule updates correctly after close of business (COB), the nightly job that posts interest and fees, for mixed repayment strategies. This applies when one installment is overdue, when two or more installments are overdue in a row, when repayment is late on the next installment due date, when repayment is late on a day between the start and due dates, when partial late repayments on the same day fully repay the overdue installment, and when partial late repayments occur on different business days during the same installment period.

Repayment timing rules for the interval ]03/01, 04/01]:

- Partial or full repayments can happen anytime during this interval.
- A full repayment in the second period should not affect the repayment schedule.

## Configuration and COB job setup

You can configure the loan close of business (COB) job to recalculate interest for overdue loans. The job runs at the start of the business day using the actual business date, after all end of business day steps finish. The recalculate interest step must be set as the last step in the COB job.

## Worked examples

A customer takes a 1,000 loan with 12% annual interest, three monthly installments and 30-day months. The figures are illustrative. The first installment is paid on time. The second installment falls due at the end of the second month but is not paid. Ten days later the customer pays the full installment. Interest recalculation is enabled and the product uses the same-as-repayment-period strategy, so the system regenerates the schedule from the overdue installment onward and shows the additional interest on the repayment schedule. The recalculated schedule shows the extra interest for the ten overdue days and the revised closing balance that carries into the final installment. If the product is configured with the daily strategy instead, the interest figure for the overdue period changes because it is based on the actual number of overdue days rather than the full repayment period.

| Period | Opening balance | Interest | Principal | Installment | Closing balance | Overdue days |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1,000.00 | 10.00 | 330.02 | 340.02 | 669.98 | 0 |
| 2 | 669.98 | 7.83 | 332.19 | 340.02 | 337.79 | 10 |
| 3 | 337.79 | 3.38 | 337.79 | 341.17 | 0.00 | 0 |
| Total |  | 21.21 | 1,000.00 | 1,021.21 |  |  |

The same loan is now used to show a partial late repayment. The second installment of 340.02 is due at the end of the second month and remains unpaid. The customer pays 100.00 five days after the due date and the remaining 240.02 ten days after the due date. Interest recalculation is enabled, so the system splits the overdue period at each payment, charges interest on the reducing balance for the days each amount stays outstanding, and shows a new closing balance for the final installment. The table shows that partial payments on different days reduce the balance step by step and that interest is charged only for the days each portion remains overdue.

| Period | Payment date | Amount paid | Interest | Principal | Closing balance |
| --- | --- | --- | --- | --- | --- |
| 1 | Month 1 | 340.02 | 10.00 | 330.02 | 669.98 |
| 2 | Day 5 | 100.00 | 1.12 | 98.88 | 571.10 |
| 2 | Day 10 | 240.02 | 0.95 | 239.07 | 332.03 |
| 3 | Month 3 | 335.35 | 3.32 | 332.03 | 0.00 |
| Total |  | 1,015.39 | 15.39 | 1,000.00 |  |

See also: [Interest Timing: Early and Late Repayment Interest](../interest/timing.md#early-and-late-repayment-interest), [Backdated Loans](../loan-origination/backdated-loans.md), [Loan Payoff](../repayments/payoff.md), [Rate Changes: Overview](../interest/rate-changes.md#overview).
