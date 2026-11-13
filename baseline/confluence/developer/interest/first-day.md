# First-Day Interest

## First-Day Interest overview

First-day interest decides whether interest accrues on the disbursement date (Day 0). When **Interest recognition on disbursement date** is off, interest is not calculated or accrued for Day 0. When it is on, interest is calculated and accrued for Day 0 at end of day. Both strategies calculate exactly the same total amount of interest.

Current Fineract behaviour:

- Interest accrues from the first day of the repayment till the last repayment date.

## When interestChargedFromDisbursementDate is FALSE or unset

With the flag FALSE or unset, interest accrues on the outstanding loan balance as the day started, so intra-day actions such as repayments do not change the daily interest amount. Payable interest is one day ahead of the daily periodic accrual calculation.

Interest timing rules:

- Interest obligation starts on Day 1, the day after disbursement.
- If the customer fully repays on Day 0, no interest is payable.
- Interest accrual recognition happens at end of day as part of the close of business (COB) workflow, or when the loan is fully paid.

Repayment period boundaries:

- The repayment period from date is exclusive for most actions and is Day 0 from the interest point of view.
- The due date is inclusive for most actions and is the last day of the period from the interest point of view.
- The repayment period due date and the following repayment period from date are the same, with no date gaps.
- On the due date, actions belong to the period that the due date falls on.

## When interestChargedFromDisbursementDate is TRUE

With the flag TRUE, interest accrues on the outstanding loan balance at the end of each day, and payable interest stays in sync with the daily periodic accrual calculation. The disbursement date is Day 0, and interest is calculated on that day. The obligation to pay interest starts on the day after disbursement. Any intra-day action, such as a repayment, affects the daily interest calculated. The loan repayment period's 0th day is not excluded from interest.

The repayment period boundaries work as follows:

- The disbursement date is Day 0 from the interest point of view and Day 1 of the repayment period.
- The repayment period from date is exclusive for most actions except Day 0; from the interest point of view it is Day 0 and inclusive.
- The due date is inclusive for most actions but from the interest point of view does not belong to the actual period and is exclusive.
- The repayment period due date and the following repayment period from date are the same, with no date gaps.
- On the due date, actions belong to the period the due date is on, except interest.
- The first day of interest is the from date and the last day of interest is the day before the due date.

## Interest charged from date settings

The loan product flag interestChargedFromDisbursementDate decides whether interest starts on the disbursement date or the day after it. The flag works together with the setting interest-charged-from-date-same-as-disbursal-date.

| interestChargedFromDisbursementDate | interest-charged-from-date-same-as-disbursal-date | Interest charged from date |
| --- | --- | --- |
| FALSE or NULL | FALSE | Disbursement date + 1 day |
| TRUE | FALSE | Disbursement date |
| FALSE or NULL | TRUE | Disbursement date |
| TRUE | TRUE | Disbursement date |

## Progressive loan accrual processing

For progressive loans, each day at end of day the system compares the calculated interest accrual amount with the total interest already accrued. If the calculated amount is higher, it creates an Accrual transaction for the difference. If the amounts are equal, it creates nothing. If the calculated amount is lower, it creates an Accrual Adjustment transaction for the difference.

The system allocates accrued amounts as follows:

- For an Accrual transaction, the system allocates as much as possible, up to the charged interest amount, on each repayment installment from oldest to newest.
- For an Accrual Adjustment transaction, the system lifts the accrued amount from installments from newest to oldest.

Accrual transactions are not tied to repayment periods based on transaction dates, and relationships between accrual transactions and repayment schedule installments may be removed.

The total of Accrual transaction balances and Accrual Adjustment amounts together cannot exceed the charged interest on the repayment schedule.

Daily interest for the current date being closed and total interest till date are calculated using an up to date ProgressiveLoanInterestScheduleModel and ProgressiveEmiCalculator as part of the Add Periodic Accrual Transactions business step.

## Interest period boundaries

With the flag FALSE or unset, Day 0 is excluded: interest is charged from Day 1 through the maturity date, becomes payable on Day X and accrues at end of Day X. With the flag TRUE, Day 0 is included: interest is charged from Day 0 through the day before the maturity date, accrues at end of Day X and becomes payable at the start of Day X+1. Both calculate exactly the same total interest.

## Interest recognition on disbursement date

Interest recognition on disbursement date decides whether Fineract recognises interest on Day 0 (disbursement date) end of day or Day 1 (disbursement date plus one) end of day. It applies only to loans using the progressive loan schedule type.

The behaviour depends on the interestRecognitionOnDisbursementDate setting:

- When TRUE, Fineract recognises interest on Day 0 end of day, interest charging starts from Day 0 end of day, and interest is calculated based on current date plus one.
- When not provided or FALSE, Fineract recognises interest on Day 1 end of day, interest charging starts from Day 1 end of day, and interest is calculated based on current date.

The partial period rate factor logic changes as follows:

- When interestRecognitionFromDisbursementDate is true, the partial period rate factor logic includes the from date and excludes the due date.
- When interestRecognitionFromDisbursementDate is not true, no amendments are made to the partial period rate factor logic.

You can set or change the field as follows:

- The field is stored on loan product level and can be overridden when the loan is created.
- You can update the field if the loan was created but not yet approved or disbursed.

## Interest calculation parameters

Interest calculation uses a rate of 7%, a 360-day year and a 30-day month. The number of days in month and year follows the configuration for interest calculation from Day 0 (disbursement date).

With `interestChargedFromDisbursementDate` FALSE or unset, interest recognition starts as follows:

- If interestChargedFromDate is provided during loan creation, interest starts from that date.
- Otherwise, interest starts according to the interest-charged-from-date-same-as-disbursal-date global configuration parameter.
- Otherwise, interest starts one day after the disbursement date.

## Running accruals and service implementation

LoanAccrualsProcessingServiceImpl calculates accruals, and AddPeriodicAccrualEntriesBusinessStep applies periodic accrual entries.

To run accruals:

- Move the current date to the due date of each period.
- Run close of business (COB) for each day.
- Use inline COB catch-up when convenient.

## Worked examples

A loan is disbursed on 1 January with a principal of 3,600.00, an annual interest rate of 12%, a 360-day year, and 30-day months. No repayments are made. The daily interest on the full balance is 1.20. The figures in this example are illustrative.

| Day | Date | FALSE: interest for day | FALSE: accrued at EoD | FALSE: payable at start | TRUE: interest for day | TRUE: accrued at EoD | TRUE: payable at start |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Day 0 | 1 Jan | 0.00 | 0.00 | 0.00 | 1.20 | 1.20 | 0.00 |
| Day 1 | 2 Jan | 1.20 | 1.20 | 1.20 | 1.20 | 2.40 | 1.20 |
| Day 2 | 3 Jan | 1.20 | 2.40 | 2.40 | 1.20 | 3.60 | 2.40 |

With interestChargedFromDisbursementDate set to TRUE, Day 0 earns interest and accrued and payable interest stay in sync; with FALSE or unset, Day 0 earns nothing and payable interest leads accrued interest by one day.

A progressive loan is disbursed on 1 January with a principal of 360.00, an annual interest rate of 12%, a 360-day year, and 30-day months, so daily interest is 0.12. The repayment schedule charges Installment 1 (due 1 February) interest of 3.60 and Installment 2 (due 1 March) interest of 2.40, for a total charged interest of 6.00. The figures are illustrative.

| Date | Day | Balance at end of day | Daily interest | Cumulative interest calculated | Total interest already accrued | Difference | Transaction | Amount | Allocated to | Accrued on Installment 1 | Accrued on Installment 2 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2 Jan | 1 | 360.00 | 0.12 | 0.12 | 0.00 | +0.12 | Accrual | 0.12 | Installment 1 | 0.12 | 0.00 |
| 3 Jan | 2 | 360.00 | 0.12 | 0.24 | 0.12 | +0.12 | Accrual | 0.12 | Installment 1 | 0.24 | 0.00 |
| 4 Jan | 3 | 360.00 | 0.12 | 0.36 | 0.24 | +0.12 | Accrual | 0.12 | Installment 1 | 0.36 | 0.00 |
| Total |  |  | 0.36 |  |  | +0.36 |  | 0.36 |  | 0.36 | 0.00 |

Each day at end of day the system posts an Accrual transaction for the positive difference and allocates it to the oldest installment first; if the calculated amount ever falls below the accrued amount, an Accrual Adjustment lifts interest from the newest installment first, and combined accrual balances and adjustments never exceed charged interest on the schedule.
